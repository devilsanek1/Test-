"""G1 radio cut builder: docs/v3/script/radio_input.json -> public/v3/radio_h<N>.wav + .json (one per hook variant).

Each script line is voiced separately with the stand-in TTS (Kokoro, local), trimmed, and joined with the line's pause;
word times are spread over each line by character count (good enough for a radio cut; G2 uses real word timings).
Usage: python3 scripts/v3/build_radio.py [--tts-dir DIR]   (DIR holds kokoro.onnx + voices.bin)
"""
import argparse
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = Path(__file__).resolve().parents[2]
INP = ROOT / 'docs/v3/script/radio_input.json'
OUT = ROOT / 'public/v3'
SR = 24000


def trim(y, thr=0.01):
    on = np.where(np.abs(y) > thr)[0]
    return y[max(0, on[0] - 240):on[-1] + 480] if len(on) else y


def caption_words(text):
    out = []
    for w in text.split():
        w = re.sub(r'^[\"“(]+|[\"”),.;:—–-]+$', '', w)
        if w:
            out.append(w)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--tts-dir', required=True)
    ap.add_argument('--input', default=str(INP))
    ap.add_argument('--prefix', default='radio_h', help="output name prefix: radio_h (G1) or core_ (G0.5 cards)")
    a = ap.parse_args()
    k = Kokoro(str(Path(a.tts_dir) / 'kokoro.onnx'), str(Path(a.tts_dir) / 'voices.bin'))
    spec = json.loads(Path(a.input).read_text())
    OUT.mkdir(parents=True, exist_ok=True)
    cache = {}

    def voice(line):
        key = line.get('tts', line['vo'])
        if key not in cache:
            y, sr = k.create(key, voice=spec['voice'], speed=spec.get('speed', 1.0), lang='en-us')
            assert sr == SR
            cache[key] = trim(y)
        return cache[key]

    for n, hook in enumerate(spec['hooks'], 1):
        lines = [{'vo': hook['vo'], 'tts': hook.get('tts', hook['vo']), 'image': hook['image'], 'pause': hook.get('pause', 0.25)}] + spec.get('body', [])
        t = spec.get('lead', 0.08)
        audio = [np.zeros(int(t * SR))]
        words, segs = [], []
        for i, ln in enumerate(lines):
            y = voice(ln)
            d = len(y) / SR
            ws = caption_words(ln['vo'])
            weights = np.array([len(w) + 1.5 for w in ws], float)
            edges = t + d * np.concatenate([[0], np.cumsum(weights)]) / weights.sum()
            words += [{'w': w, 's': round(edges[j], 3), 'e': round(edges[j + 1], 3), 'line': i} for j, w in enumerate(ws)]
            segs.append({'s': round(t, 3), 'e': round(t + d, 3), 'image': ln['image']})
            pause = ln.get('pause', 0.18)
            audio += [y, np.zeros(int(pause * SR))]
            t += d + pause
        tail = spec.get('tail', 0.6)
        audio.append(np.zeros(int(tail * SR)))
        y = np.concatenate(audio)
        y = y / (np.abs(y).max() + 1e-9) * 0.89
        sf.write(OUT / f'{a.prefix}{n}.wav', y, SR)
        data = {
            'label': hook.get('label', f"v3 G1 radio cut · H{n} · stand-in voice"),
            'audio': f'v3/{a.prefix}{n}.wav',
            'durationSec': round(len(y) / SR, 3),
            'frame0': hook['frame0'],
            'frame0Until': round(len(y) / SR, 3) if hook.get('frame0Hold') else segs[0]['e'] + 0.2,
            'words': words,
            'lines': segs,
            'sfx': spec.get('sfx', []),
        }
        (OUT / f'{a.prefix}{n}.json').write_text(json.dumps(data, indent=1))
        print(f'{a.prefix}{n}: {data["durationSec"]:.1f} s, {len(words)} words')


if __name__ == '__main__':
    main()
