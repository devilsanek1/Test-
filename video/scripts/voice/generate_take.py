#!/usr/bin/env python3
"""Generate a clean voice-over take with the owner's ElevenLabs voice, line by line, and verify every line.

Why: one-shot generations of the whole script repeated, looped and derailed (v3 takes, v2 take 1). Here each paste-file
line is generated on its own, with the neighbouring lines as context. Each line is transcribed (Parakeet) and compared
with the script, and regenerated with a new seed until it matches. The lines are then stitched with natural gaps into
one take, with word timings and a report.

Needs: the environment secret ELEVENLABS_API_KEY (never printed or written to disk), the voice id (docs/voice/VOICE.md or
--voice), and the Parakeet model dir (see scripts/voice/transcribe.py).

  python3 scripts/voice/generate_take.py PASTE.md OUT_DIR --voice VOICE_ID [--model MODEL_ID] [--tries 4]
  python3 scripts/voice/generate_take.py PASTE.md OUT_DIR --dry-run         # parse only, no API calls
  python3 scripts/voice/generate_take.py --list-models | --list-voices      # what this key can use

Settings (model, stability, speed, tags on/off, gaps) come from docs/voice/PROPOSAL.md; every flag has a default.
OUT_DIR gets line_NN_tryK.wav, take.wav (48 kHz mono), take_words.json and report.json.
"""
import argparse
import difflib
import json
import os
import re
import subprocess
import sys
import tempfile

import numpy as np
import requests
import soundfile as sf

API = 'https://api.elevenlabs.io/v1'
HERE = os.path.dirname(os.path.abspath(__file__))
TAG = re.compile(r'\[([^\]]*)\]')
DEFAULT_MODEL_DIR = '/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/models/sherpa-onnx-nemo-parakeet-tdt-0.6b-v2-int8'


def key():
    k = os.environ.get('ELEVENLABS_API_KEY')
    if not k:
        sys.exit('ELEVENLABS_API_KEY is not set: the owner adds it as an environment secret, then a new session sees it.')
    return k


def get(path):
    r = requests.get(f'{API}{path}', headers={'xi-api-key': key()}, timeout=60)
    r.raise_for_status()
    return r.json()


def parse(path):
    """Paste file -> units [{tag, text}]: a tag line applies to the spoken line(s) after it."""
    units, tag = [], ''
    for raw in open(path, encoding='utf-8').read().splitlines():
        line = raw.strip()
        if not line:
            continue
        tags = TAG.findall(line)
        speech = TAG.sub(' ', line).strip()
        if tags:
            tag = tags[0].strip()
        if speech:
            units.append({'tag': tag, 'text': re.sub(r'\s+', ' ', speech)})
    return units


def words(s, expected=None):
    """Normalised words (textnorm.py): numbers the recogniser writes in digits ("70 000", "40") are spelled out the
    way the script says them, chosen against `expected` (before 2026-10-29 "70 000" became "70 000" here and every
    take with a number failed)."""
    sys.path.insert(0, HERE)
    from textnorm import tokens
    return tokens(s, expected)


def same(heard, expected):
    """Exact match of the spoken words, ignoring spacing artifacts of the recogniser (e.g. "can'tveto")."""
    squash = lambda ws: re.sub(r'(.)\1+', r'\1', ''.join(ws))  # sounds merged at a word boundary ("Google staff" ~ "Google's staff")
    return squash(heard) == squash(expected)


_FMT = {'fmt': 'pcm_48000'}   # the website's own WAV rate (v4, 2026-10-29: the owner's website take was 48 kHz)


def tts(text, voice, model, prev_text, next_text, seed, a, prev_ids=None):
    """One request -> (audio float32, sr, request_id). v4 takes stability + similarity only (no style/speed);
    request stitching via previous_request_ids (accepted units, <= 3) + next_text; WAV (pcm_48000, the website's rate; Pro plan) first,
    MP3 if the plan refuses it; context fields dropped if a model rejects them."""
    vs = {'stability': a.stability, 'similarity_boost': a.similarity}
    if not model.startswith('eleven_v4'):
        vs.update({'style': a.style, 'use_speaker_boost': True, 'speed': a.speed})
    body = {'text': text, 'model_id': model, 'seed': seed, 'voice_settings': vs}
    if a.context:
        if prev_ids:
            body['previous_request_ids'] = prev_ids[-3:]
        elif prev_text:
            body['previous_text'] = prev_text
        if next_text:
            body['next_text'] = next_text
    for attempt in range(4):
        url = f'{API}/text-to-speech/{voice}?output_format={_FMT["fmt"]}'
        r = requests.post(url, headers={'xi-api-key': key(), 'Content-Type': 'application/json'}, json=body, timeout=180)
        if r.status_code >= 400 and _FMT['fmt'].startswith('pcm') and ('format' in r.text.lower() or r.status_code == 403):
            _FMT['fmt'] = 'mp3_44100_128'
            continue
        if r.status_code == 400 and any(k in body for k in ('previous_request_ids', 'previous_text', 'next_text')):
            for k in ('previous_request_ids', 'previous_text', 'next_text'):
                body.pop(k, None)
            continue
        if r.status_code >= 400:
            raise RuntimeError(f'ElevenLabs {r.status_code}: {r.text[:300]}')
        rid = r.headers.get('request-id') or r.headers.get('x-request-id')
        if _FMT['fmt'].startswith('pcm'):
            y = np.frombuffer(r.content, dtype=np.int16).astype(np.float32) / 32768.0
            return y, int(_FMT['fmt'].split('_')[1]), rid
        pcm = subprocess.run(['ffmpeg', '-v', 'error', '-i', 'pipe:0', '-ac', '1', '-ar', '48000', '-f', 'f32le', 'pipe:1'],
                             input=r.content, check=True, capture_output=True).stdout
        return np.frombuffer(pcm, dtype=np.float32).copy(), 48000, rid
    raise RuntimeError('ElevenLabs request failed')


def transcribe(y, sr, model_dir):
    with tempfile.TemporaryDirectory() as d:
        wav, out = f'{d}/a.wav', f'{d}/a.json'
        sf.write(wav, y, sr)
        subprocess.run([sys.executable, f'{HERE}/transcribe.py', wav, model_dir, out], check=True, capture_output=True)
        return json.load(open(out))


_WHISPER = {}


def second_opinion(y, sr, root):
    """Whisper small.en on the same audio (no prompt, so no bias towards the script), or None if unavailable."""
    try:
        from faster_whisper import WhisperModel
    except ImportError:
        return None
    if 'm' not in _WHISPER:
        _WHISPER['m'] = WhisperModel('small.en', device='cpu', compute_type='int8', download_root=root)
    if sr != 16000:
        n = int(round(len(y) * 16000 / sr))
        y = np.interp(np.linspace(0, len(y) - 1, n), np.arange(len(y)), y).astype(np.float32)
    segs, _ = _WHISPER['m'].transcribe(y, beam_size=5)
    return ' '.join(x.text for x in segs)


def trim(y, sr, thr_db=-45, pad=0.04):
    """Cut leading/trailing silence, keep `pad` seconds."""
    if not len(y):
        return y
    win = int(0.01 * sr)
    frames = len(y) // win
    e = np.array([np.sqrt(np.mean(y[i * win:(i + 1) * win] ** 2) + 1e-12) for i in range(frames)])
    on = np.where(20 * np.log10(e) > thr_db)[0]
    if not len(on):
        return y[:0]
    a, b = max(0, on[0] * win - int(pad * sr)), min(len(y), (on[-1] + 1) * win + int(pad * sr))
    return y[a:b]


def fade(y, sr, ms=8):
    n = min(len(y) // 2, int(ms / 1000 * sr))
    if n:
        y = y.copy()
        y[:n] *= np.linspace(0, 1, n)
        y[-n:] *= np.linspace(1, 0, n)
    return y


def main():
    p = argparse.ArgumentParser()
    p.add_argument('paste', nargs='?')
    p.add_argument('out', nargs='?')
    p.add_argument('--voice', default=os.environ.get('ELEVENLABS_VOICE_ID'))
    p.add_argument('--model', default=os.environ.get('ELEVENLABS_MODEL', 'eleven_v4'))
    p.add_argument('--tries', type=int, default=4)
    p.add_argument('--stability', type=float, default=0.5)
    p.add_argument('--similarity', type=float, default=0.75)
    p.add_argument('--style', type=float, default=0.0)
    p.add_argument('--speed', type=float, default=1.0)
    p.add_argument('--no-tags', action='store_true', help='send the spoken text only, without the bracket cue')
    p.add_argument('--no-context', dest='context', action='store_false', help="don't send previous_text / next_text")
    p.add_argument('--gap', type=float, default=0.32, help='pause after a line that ends a sentence (s)')
    p.add_argument('--gap-comma', type=float, default=0.18, help='pause after a line that ends mid-sentence (s)')
    p.add_argument('--lead', type=float, default=0.12, help='silence before the first word (s)')
    p.add_argument('--model-dir', default=os.environ.get('PARAKEET_DIR', DEFAULT_MODEL_DIR))
    p.add_argument('--whisper-dir', default=os.environ.get('WHISPER_DIR', os.path.join(os.path.dirname(DEFAULT_MODEL_DIR), 'fw')))
    p.add_argument('--mode', choices=['auto', 'whole', 'units'], default='auto', help='auto: the whole script first (up to --whole-tries), then per paragraph')
    p.add_argument('--whole-tries', type=int, default=3)
    p.add_argument('--dry-run', action='store_true')
    p.add_argument('--list-models', action='store_true')
    p.add_argument('--list-voices', action='store_true')
    a = p.parse_args()

    if a.list_models:
        for m in get('/models'):
            print(m.get('model_id'), '|', m.get('name'), '| tts' if m.get('can_do_text_to_speech') else '')
        return
    if a.list_voices:
        for v in get('/voices').get('voices', []):
            print(v.get('voice_id'), '|', v.get('name'), '|', v.get('category'))
        return
    if not (a.paste and a.out):
        p.error('PASTE and OUT_DIR are required')
    units = parse(a.paste)
    if a.dry_run:
        for i, u in enumerate(units, 1):
            print(f'{i:2d} [{u["tag"]}] {u["text"]}')
        print(f'{len(units)} lines, {sum(len(words(u["text"])) for u in units)} words')
        return
    if not a.voice:
        sys.exit('No voice id: pass --voice or set ELEVENLABS_VOICE_ID (see docs/voice/VOICE.md).')
    sys.path.insert(0, HERE)
    from check_paste import lint
    errs, _, st = lint(a.paste)
    if errs:
        sys.exit('The paste fails check_paste.py; fix it first:\n' + '\n'.join(errs))
    os.makedirs(a.out, exist_ok=True)
    script_words = [w for u in units for w in words(u['text'])]

    # 1. the whole script in one generation (keeps v4's whole-scene arc); first clean take wins
    if a.mode in ('auto', 'whole'):
        for k in range(a.whole_tries):
            y, sr, _ = tts(st['raw'], a.voice, a.model, '', '', 500 + k, a)
            y = trim(y, sr)
            dur = len(y) / sr
            sf.write(f'{a.out}/whole_try{k + 1}.wav', y, sr)
            heard = words(transcribe(y, sr, a.model_dir).get('text', ''), script_words)
            ok = same(heard, script_words) and dur <= 1.3 * len(script_words) / 2.8
            print(f'whole try {k + 1}: {"OK " if ok else "BAD"} {dur:.2f}s, {len(heard)} words (script {len(script_words)})')
            if ok:
                take = np.concatenate([np.zeros(int(a.lead * sr), dtype=np.float32), fade(y, sr), np.zeros(int(0.3 * sr), dtype=np.float32)])
                sf.write(f'{a.out}/take.wav', take, sr, subtype='PCM_16')
                subprocess.run([sys.executable, f'{HERE}/transcribe.py', f'{a.out}/take.wav', a.model_dir, f'{a.out}/take_words.json'], check=True, capture_output=True)
                json.dump({'model': a.model, 'voice': a.voice, 'mode': 'whole', 'try': k + 1, 'duration': round(len(take) / sr, 2), 'all_clean': True},
                          open(f'{a.out}/report.json', 'w'), indent=1)
                print(f'\ntake: {a.out}/take.wav, {len(take) / sr:.2f} s; ALL CLEAN (whole script, try {k + 1}). Check it with check_take.py too.')
                return
        if a.mode == 'whole':
            sys.exit('No clean whole-script take; run with --mode units.')

    # 2. per paragraph, chained with request stitching, each checked and regenerated until it matches
    report, parts, accepted_ids = [], [], []
    for i, u in enumerate(units):
        expected = words(u['text'])
        prev_text = ' '.join(x['text'] for x in units[max(0, i - 2):i])
        next_text = units[i + 1]['text'] if i + 1 < len(units) else ''
        send = u['text'] if (a.no_tags or not u['tag']) else f'[{u["tag"]}] {u["text"]}'
        best = None
        for k in range(a.tries):
            y, sr, rid = tts(send, a.voice, a.model, prev_text, next_text, 1000 + 97 * i + k, a, accepted_ids)
            y = trim(y, sr)
            sf.write(f'{a.out}/line_{i + 1:02d}_try{k + 1}.wav', y, sr)
            heard = words(transcribe(y, sr, a.model_dir).get('text', ''), expected)
            ratio = difflib.SequenceMatcher(None, heard, expected).ratio()
            dur = len(y) / sr
            wps = len(expected) / dur if dur else 0
            judge = 'parakeet'
            if not same(heard, expected):  # a recogniser slip on a short clip ("BBC" -> "BDC") must not fail a good line
                alt = second_opinion(y, sr, a.whisper_dir)
                if alt is not None and same(words(alt, expected), expected):
                    heard, ratio, judge = words(alt, expected), 1.0, 'whisper'
            ok = same(heard, expected) and 1.5 <= wps <= 4.2
            cand = {'line': i + 1, 'try': k + 1, 'judge': judge, 'match': same(heard, expected), 'ratio': round(ratio, 3),
                    'dur': round(dur, 2), 'wps': round(wps, 2), 'heard': ' '.join(heard), 'y': y, 'sr': sr, 'rid': rid,
                    'listen': judge == 'whisper'}
            print(f'line {i + 1:2d} try {k + 1}: {"OK " if ok else "BAD"} ratio {ratio:.3f} {dur:.2f}s {wps:.1f} w/s  "{" ".join(heard)[:70]}"')
            if best is None or (ok, ratio) > (best['ok'], best['ratio']):
                best = dict(cand, ok=ok)
            if ok:
                break
        parts.append(best)
        if best.get('rid'):
            accepted_ids.append(best['rid'])
        report.append({k2: v for k2, v in best.items() if k2 not in ('y', 'sr')})

    sr_out = 48000
    out = [np.zeros(int(a.lead * sr_out), dtype=np.float32)]
    for i, b in enumerate(parts):
        y = b['y']
        if b['sr'] != sr_out:
            n = int(round(len(y) * sr_out / b['sr']))
            y = np.interp(np.linspace(0, len(y) - 1, n), np.arange(len(y)), y).astype(np.float32)
        out.append(fade(y, sr_out))
        if i + 1 < len(parts):
            ends = units[i]['text'].rstrip()[-1:] in '.?!…'
            out.append(np.zeros(int((a.gap if ends else a.gap_comma) * sr_out), dtype=np.float32))
    out.append(np.zeros(int(0.3 * sr_out), dtype=np.float32))
    take = np.concatenate(out)
    sf.write(f'{a.out}/take.wav', take, sr_out, subtype='PCM_16')
    subprocess.run([sys.executable, f'{HERE}/transcribe.py', f'{a.out}/take.wav', a.model_dir, f'{a.out}/take_words.json'], check=True, capture_output=True)
    bad = [r['line'] for r in report if not r['ok']]
    listen = [r['line'] for r in report if r.get('listen')]
    json.dump({'model': a.model, 'voice': a.voice, 'settings': {k: getattr(a, k) for k in ('stability', 'similarity', 'style', 'speed', 'context', 'no_tags', 'gap', 'gap_comma')},
               'lines': report, 'duration': round(len(take) / sr_out, 2), 'all_clean': not bad}, open(f'{a.out}/report.json', 'w'), indent=1)
    print(f'\ntake: {a.out}/take.wav, {len(take) / sr_out:.2f} s; ' + ('ALL LINES CLEAN' if not bad else f'lines still not matching: {bad} (listen, or raise --tries)')
          + (f'; passed only on Whisper, listen once: {listen}' if listen else ''))


if __name__ == '__main__':
    main()
