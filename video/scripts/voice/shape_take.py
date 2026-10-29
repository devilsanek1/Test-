#!/usr/bin/env python3
"""Shape a voice take's cadence after generation: pause lengths, beats before chosen lines, tempo per sentence, polish.

Why (owner, v4 G2, 2026-10-29: "play with the cadence and emotions to get to the best possible outcome capturing people
attention"; "are you able to do some post processing on the voice to play with cadence and controls?"): Eleven v4 takes
no speed or style setting, and its reads ran ~150 words a minute with long breaths, where the owner's El Niño reference
(`docs/voice/refs/2026-10-29_el_nino/`) runs ~214 with 0.2-0.3 s pauses. A producer's edit fixes that without a new
generation: the words, the voice and the emotion stay as generated; only the time between and inside the sentences
changes.

How:
1. Pauses come from the audio itself (frame energy below the take's own floor for >= --min-pause s), so they are exact.
2. Each pause is placed in the script: Whisper's word times (word_timestamps) are aligned to the paste's words
   (textnorm.py), so a pause is a paragraph turn, a sentence end, a comma or a breath inside a phrase.
3. The take is rebuilt: each speech run is kept exactly as generated; each pause becomes its target length from its
   own audio (shortened: its head, with the word's release, and its tail, crossfaded; lengthened: silence in its
   middle), by kind: --gap-paragraph, --gap-sentence, --gap-comma (only ever shortened), a breath capped at
   --gap-breath; --beat "WORDS=SECONDS" sets the pause before the sentence that starts with WORDS.
4. Tempo (default 1.0: none): --tempo, --tempo-at "WORDS=FACTOR", by the Rubber Band library (ffmpeg's rubberband
   filter). It time-stretches the VOICE: on v4 a 1.10 stretch sounded "extremely robotic like there is some weird
   background" (owner, 2026-10-29). Pace comes from the generation and the pauses; stretch only on purpose, and listen.
5. --normalize: one static gain to --lufs (sample peak <= -1 dBFS); the voice is untouched. (--polish, a gentle
   compressor and ffmpeg's dynamic loudness, made v4's take sound "more like in some chamber" to the owner next to
   the same voice straight from ElevenLabs "as if someone speaking in the microphone": don't use it on the voice.)
6. --lead silence before the first word (0.12 s: the playbook's "voice from the first frames"), --tail room tone after.

    python3 scripts/voice/shape_take.py TAKE.wav PASTE.md OUT.wav [--tempo 1.06] [--gap-sentence 0.26]
        [--beat "But Helsinki=0.45"] [--tempo-at "So your chatbot=0.97"] [--polish] [--report OUT.json]

Then check the shaped take word for word: python3 scripts/voice/check_take.py OUT.wav PASTE.md "$PARAKEET_DIR".
Needs: numpy, soundfile, faster-whisper (Whisper small.en in $WHISPER_DIR), ffmpeg with the rubberband filter.
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
import soundfile as sf

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from textnorm import tokens  # noqa: E402

TAG = re.compile(r'\[[^\]]*\]')


def script_marks(paste):
    """The paste's words, each with what follows it: 'para' (paragraph turn), 'sent' (. ? !), 'comma' or ''."""
    raw = open(paste, encoding='utf-8').read()
    paras = [TAG.sub(' ', p).strip() for p in re.split(r'\n\s*\n', raw) if TAG.sub(' ', p).strip()]
    words, marks, starts = [], [], []          # starts: (index of a sentence's first word, its first words)
    for pi, para in enumerate(paras):
        sents = re.split(r'(?<=[.?!])\s+', para)
        for si, sent in enumerate(sents):
            raw_words = sent.split()
            first = len(words)
            for wi, w in enumerate(raw_words):
                toks = tokens(w)
                for ti, t in enumerate(toks):
                    words.append(t)
                    last_tok = ti == len(toks) - 1
                    if not last_tok:
                        marks.append('')
                    elif wi == len(raw_words) - 1:
                        marks.append('para' if si == len(sents) - 1 else 'sent')
                    elif w.endswith(','):
                        marks.append('comma')
                    else:
                        marks.append('')
            starts.append((first, ' '.join(tokens(sent))))
    return words, marks, starts


def whisper_words(y, sr, model_dir):
    from faster_whisper import WhisperModel
    import soxr
    y16 = soxr.resample(y, sr, 16000) if sr != 16000 else y
    m = WhisperModel('small.en', device='cpu', compute_type='int8', download_root=model_dir)
    segs, _ = m.transcribe(y16.astype(np.float32), beam_size=5, word_timestamps=True, vad_filter=False)
    return [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]


def pauses_of(y, sr, min_pause, hop=0.01):
    """[(start, end)] of the stretches quieter than the take's speech floor, from frame energy."""
    n = int(hop * sr)
    frames = len(y) // n
    rms = np.sqrt(np.mean(y[:frames * n].reshape(frames, n) ** 2, axis=1) + 1e-12)
    db = 20 * np.log10(rms)
    speech = db[db > np.percentile(db, 30)]
    floor = max(np.percentile(db, 5) + 8, np.percentile(speech, 50) - 30)   # quiet = 30 dB under the speech median
    quiet = db < floor
    out, i = [], 0
    while i < frames:
        if quiet[i]:
            j = i
            while j < frames and quiet[j]:
                j += 1
            if (j - i) * hop >= min_pause:
                out.append((i * hop, j * hop))
            i = j
        else:
            i += 1
    # a breath or a click between two pauses (short, and well under the speech level) joins them: it goes with the pause
    med = np.median(speech)
    merged = []
    for ps, pe in out:
        if merged:
            a0, a1 = int(merged[-1][1] / hop), int(ps / hop)
            blip = db[a0:a1]
            if (ps - merged[-1][1]) < 0.16 and (len(blip) == 0 or blip.max() < med - 6):
                merged[-1] = (merged[-1][0], pe)
                continue
        merged.append((ps, pe))
    return merged, floor


def rubberband(y, sr, tempo):
    if abs(tempo - 1.0) < 1e-3 or len(y) < sr * 0.5:
        return y
    with tempfile.TemporaryDirectory() as d:
        a, b = os.path.join(d, 'a.wav'), os.path.join(d, 'b.wav')
        sf.write(a, y, sr, subtype='FLOAT')
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', a, '-af',
                        f'rubberband=tempo={tempo:.4f}:pitch=1:transients=smooth:formant=preserved:pitchq=quality',
                        '-c:a', 'pcm_f32le', b], check=True)
        z, _ = sf.read(b, dtype='float32')
    return z


def fade(x, sr, ms=10):
    k = min(len(x) // 2, int(sr * ms / 1000))
    if k:
        x = x.copy()
        x[:k] *= np.linspace(0, 1, k)
        x[-k:] *= np.linspace(1, 0, k)
    return x


def room_tone(y, sr, pauses, seconds):
    """A stretch of the take's own quiet (its longest pause, looped), or digital silence."""
    if not pauses or seconds <= 0:
        return np.zeros(int(seconds * sr), dtype=np.float32)
    a, b = max(pauses, key=lambda p: p[1] - p[0])
    tone = y[int((a + 0.02) * sr):int((b - 0.02) * sr)]
    if len(tone) < sr * 0.03:
        return np.zeros(int(seconds * sr), dtype=np.float32)
    reps = int(np.ceil(seconds * sr / len(tone)))
    return np.tile(tone, reps)[:int(seconds * sr)].astype(np.float32)


def parse_pairs(items, kind):
    out = []
    for it in items or []:
        k, v = it.rsplit('=', 1)
        out.append((' '.join(tokens(k)), float(v)))
    return out


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('take'); p.add_argument('paste'); p.add_argument('out')
    p.add_argument('--gap-paragraph', type=float, default=0.32)
    p.add_argument('--gap-sentence', type=float, default=0.26)
    p.add_argument('--gap-comma', type=float, default=0.14)
    p.add_argument('--gap-breath', type=float, default=0.10, help='cap for a pause inside a phrase')
    p.add_argument('--min-pause', type=float, default=0.06)
    p.add_argument('--beat', action='append', help='"FIRST WORDS=SECONDS": the pause before the sentence starting so')
    p.add_argument('--tempo', type=float, default=1.0)
    p.add_argument('--tempo-at', action='append', help='"FIRST WORDS=FACTOR": tempo of the sentence starting so')
    p.add_argument('--lead', type=float, default=0.12)
    p.add_argument('--tail', type=float, default=0.5)
    p.add_argument('--polish', action='store_true', help='compressor + dynamic loudness: the owner heard it as "some chamber" (v4); prefer --normalize')
    p.add_argument('--normalize', action='store_true', help='one static gain to --lufs (true peak <= -1 dBFS): the voice itself untouched')
    p.add_argument('--lufs', type=float, default=-16.0)
    p.add_argument('--whisper-dir', default=os.environ.get('WHISPER_DIR', '/tmp/whisper'))
    p.add_argument('--report')
    a = p.parse_args()

    y, sr = sf.read(a.take, dtype='float32')
    if y.ndim > 1:
        y = y.mean(axis=1)
    swords, smarks, sstarts = script_marks(a.paste)
    beats, tempos = parse_pairs(a.beat, 'beat'), parse_pairs(a.tempo_at, 'tempo')

    # 1-2. pauses, and where each falls in the script
    pauses, floor = pauses_of(y, sr, a.min_pause)
    hw = whisper_words(y, sr, a.whisper_dir)
    htoks, htime = [], []
    for s, e, w in hw:
        for t in tokens(w, swords):
            htoks.append(t)
            htime.append((s, e))
    sm = difflib.SequenceMatcher(a=swords, b=htoks, autojunk=False)
    s2h = {}
    for op, a0, a1, b0, b1 in sm.get_opcodes():
        if op == 'equal':
            for k in range(a1 - a0):
                s2h[a0 + k] = b0 + k
        elif op == 'replace' and ''.join(swords[a0:a1]) == ''.join(htoks[b0:b1]):
            # the same letters split differently ("non stop" / "nonstop"): first word to the first, last to the last
            for k in range(a0, a1):
                s2h[k] = b0 if k < a1 - 1 else b1 - 1
    # each script word's end time (Whisper), to find the script word a pause follows
    send = {i: htime[j][1] for i, j in s2h.items()}
    sbeg = {i: htime[j][0] for i, j in s2h.items()}
    first_of = {i: txt for i, txt in sstarts}

    def kind_of(ps, pe):
        """('para'|'sent'|'comma'|'breath'|'lead'|'tail', index of the next script word or None)."""
        if ps <= 0.001:
            return 'lead', 0
        if pe >= len(y) / sr - 0.001:
            return 'tail', None
        near_end = [(abs(t - ps), i) for i, t in send.items() if abs(t - ps) < 0.35]
        near_beg = [(abs(t - pe), i) for i, t in sbeg.items() if abs(t - pe) < 0.35]
        if not near_end or not near_beg:
            return 'breath', None
        i, nxt = min(near_end)[1], min(near_beg)[1]
        if nxt != i + 1:                     # Whisper's times disagree with the pause: trust the earlier word's mark
            nxt = i + 1 if i + 1 < len(swords) else None
        return (smarks[i] or 'breath'), nxt

    # 3-4. rebuild sentence by sentence
    target = {'para': a.gap_paragraph, 'sent': a.gap_sentence, 'comma': a.gap_comma}
    plan, cuts = [], []
    for ps, pe in pauses:
        kind, nxt = kind_of(ps, pe)
        if kind in ('lead', 'tail'):
            cuts.append((ps, pe, kind, None, nxt))
            continue
        was = pe - ps
        if kind == 'comma':
            want = min(was, a.gap_comma)
        elif kind in ('sent', 'para'):
            want = target[kind]
        else:
            want = min(was, a.gap_breath)
        if nxt in first_of:
            for words_, sec in beats:
                if first_of[nxt].startswith(words_):
                    want = sec
        cuts.append((ps, pe, kind, want, nxt))
    tone = lambda sec: room_tone(y, sr, pauses, sec)

    def pause_fill(ps, pe, want):
        """The pause made `want` long from its own audio: shortened by keeping its head (the word's release) and tail
        (the next word's lead-in) with a short crossfade, lengthened by silence in its middle. Never a looped tone."""
        seg = y[int(ps * sr):int(pe * sr)]
        n = int(want * sr)
        if n <= 0:
            return np.zeros(0, dtype=np.float32)
        if n <= len(seg):
            h = n // 2
            head, tail = seg[:h].copy(), seg[len(seg) - (n - h):].copy()
            k = min(int(0.005 * sr), len(head), len(tail))
            if k:
                head[-k:] *= np.linspace(1, 0, k)
                tail[:k] *= np.linspace(0, 1, k)
            return np.concatenate([head, tail]).astype(np.float32)
        h = len(seg) // 2
        head, tail = seg[:h].copy(), seg[h:].copy()
        k = min(int(0.005 * sr), len(head), len(tail))
        if k:
            head[-k:] *= np.linspace(1, 0, k)
            tail[:k] *= np.linspace(0, 1, k)
        return np.concatenate([head, np.zeros(n - len(seg), dtype=np.float32), tail]).astype(np.float32)

    # 3. rebuild: every speech run exactly as generated, every pause set to its length from its own audio
    pieces, bounds = [], []            # bounds: (time in the edited take, tempo of the sentence that follows)
    t_new, pos = 0.0, 0.0
    tempo_now = a.tempo
    for words_, f in tempos:                 # the first sentence's own tempo
        if sstarts and sstarts[0][1].startswith(words_):
            tempo_now = f
    first_tempo = tempo_now
    for ps, pe, kind, want, nxt in cuts + [(len(y) / sr, len(y) / sr, 'end', None, None)]:
        if kind == 'lead':
            pos = pe
            continue
        speech = y[int(pos * sr):int(ps * sr)]
        if len(speech):
            pieces.append(speech); t_new += len(speech) / sr
        if kind in ('tail', 'end'):
            break
        nxt_tempo = tempo_now
        if kind in ('sent', 'para') and nxt in first_of:
            nxt_tempo = a.tempo
            for words_, f in tempos:
                if first_of[nxt].startswith(words_):
                    nxt_tempo = f
        fill = pause_fill(ps, pe, want * tempo_now)
        if nxt_tempo != tempo_now:
            h = len(fill) // 2
            pieces.append(fill[:h]); t_new += h / sr
            bounds.append((t_new, nxt_tempo))
            pieces.append(fill[h:]); t_new += (len(fill) - h) / sr
        else:
            pieces.append(fill); t_new += len(fill) / sr
        plan.append({'at': round(ps, 2), 'was': round(pe - ps, 2), 'now': round(want, 2), 'kind': kind,
                     'next': first_of.get(nxt, '')[:40] if nxt is not None else ''})
        tempo_now = nxt_tempo
        pos = pe
    edited = np.concatenate(pieces).astype(np.float32)
    # 4. tempo (default 1.0 = none). A tempo other than 1 time-stretches the VOICE with Rubber Band: on v4's take a
    # 1.10 stretch sounded "extremely robotic like there is some weird background", all but the unstretched last line
    # (owner, 2026-10-29). Get pace from the generation and the pauses; stretch only on purpose, and listen.
    segs, last_t, cur = [], 0.0, first_tempo
    for bt, nt in bounds:
        segs.append((last_t, bt, cur)); last_t, cur = bt, nt
    segs.append((last_t, len(edited) / sr, cur))
    body = np.concatenate([rubberband(edited[int(s0 * sr):int(s1 * sr)], sr, tp) for s0, s1, tp in segs if s1 > s0])
    tail_audio = pause_fill(cuts[-1][0], cuts[-1][1], a.tail) if cuts and cuts[-1][2] == 'tail' else np.zeros(int(a.tail * sr), dtype=np.float32)
    z = np.concatenate([np.zeros(int(a.lead * sr), dtype=np.float32), body, tail_audio]).astype(np.float32)

    # 5. polish
    if a.polish:
        with tempfile.TemporaryDirectory() as d:
            i_, o_ = os.path.join(d, 'i.wav'), os.path.join(d, 'o.wav')
            sf.write(i_, z, sr, subtype='FLOAT')
            chain = ('highpass=f=70,acompressor=threshold=-18dB:ratio=1.8:attack=12:release=150:makeup=1,'
                     f'loudnorm=I={a.lufs}:TP=-1.5:LRA=11')
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', i_, '-af', chain, '-ar', str(sr), '-c:a', 'pcm_f32le', o_], check=True)
            z, _ = sf.read(o_, dtype='float32')
    if a.normalize and not a.polish:
        # one gain for the whole take, measured by ffmpeg's EBU R128 meter: no compressor, no dynamic loudness, so the
        # voice sounds exactly as generated (the owner heard the compressed version "like in some chamber", v4 G2)
        with tempfile.TemporaryDirectory() as d:
            i_ = os.path.join(d, 'i.wav')
            sf.write(i_, z, sr, subtype='FLOAT')
            r = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', i_, '-af', 'ebur128=peak=true', '-f', 'null', '-'],
                               capture_output=True, text=True)
            m = re.findall(r'I:\s+(-?[\d.]+) LUFS', r.stderr)
            if m:
                gain_db = a.lufs - float(m[-1])
                peak_now = float(np.max(np.abs(z))) or 1e-9
                gain_db = min(gain_db, 20 * np.log10(10 ** (-1.0 / 20) / peak_now))    # sample peak <= -1 dBFS
                z = (z * 10 ** (gain_db / 20)).astype(np.float32)
    peak = float(np.max(np.abs(z))) if len(z) else 0
    if peak > 0.98:
        z = z * (0.98 / peak)
    sf.write(a.out, z, sr, subtype='PCM_24')

    before, after = len(y) / sr, len(z) / sr
    words_n = len(swords)
    span = (max(send.values()) - min(sbeg.values())) if send else before
    print(f'{a.take} -> {a.out}: {before:.2f} s -> {after:.2f} s; {len(plan)} pauses set '
          f'({sum(1 for x in plan if x["kind"] in ("sent", "para"))} sentence turns); tempo {a.tempo}'
          f'{"; polished to " + str(a.lufs) + " LUFS" if a.polish else ("; one gain to " + str(a.lufs) + " LUFS" if a.normalize else "")}; about {60 * words_n / max(0.1, after - a.lead - a.tail):.0f} words a minute')
    if a.report:
        json.dump({'take': a.take, 'out': a.out, 'before_s': round(before, 2), 'after_s': round(after, 2),
                   'settings': {k: v for k, v in vars(a).items() if k not in ('take', 'paste', 'out', 'report')},
                   'pauses': plan, 'floor_db': round(float(floor), 1)}, open(a.report, 'w'), indent=1)


if __name__ == '__main__':
    main()
