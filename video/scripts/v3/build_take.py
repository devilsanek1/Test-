"""G2 radio cut on the owner's ElevenLabs take: assets/v3/<take>_h<N>.wav + its Parakeet word timings
(<take>_h<N>_words.json, from scripts/voice/transcribe.py) -> public/v3/take_h<N>.wav + .json for
RadioCut (compositions TakeH1..3). Caption words are the script's (docs/v3/script/radio_input.json, digits kept), timed by
aligning them to the transcript; words the transcript spells differently ("5x" / "five times") are interpolated.
Usage: python3 scripts/v3/build_take.py take1 [--lead 0.35]
"""
import argparse
import difflib
import json
import re
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
SPEC = ROOT / 'docs/v3/script/radio_input.json'
ASSETS = ROOT / 'assets/v3'
OUT = ROOT / 'public/v3'


def norm(w):
    return re.sub(r"[^a-z0-9%']", '', w.lower())


def caption_words(text):
    out = []
    for w in text.split():
        w = re.sub(r'^[\"“(]+|[\"”),.;:—–-]+$', '', w).replace('…', '')
        if w:
            out.append(w)
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('take')
    ap.add_argument('--lead', type=float, default=0.35, help='silence before the voice, so the first-second sound lands first')
    a = ap.parse_args()
    spec = json.loads(SPEC.read_text())
    for n, hook in enumerate(spec['hooks'], 1):
        wav = ASSETS / f'{a.take}_h{n}.wav'
        y, sr = sf.read(wav)
        y = np.concatenate([np.zeros((int(a.lead * sr),) + y.shape[1:]), y, np.zeros((int(0.6 * sr),) + y.shape[1:])])
        OUT.mkdir(parents=True, exist_ok=True)
        sf.write(OUT / f'take_h{n}.wav', y, sr)
        tw = json.loads((ASSETS / f'{a.take}_h{n}_words.json').read_text())['words']
        # transcript tokens, splitting glued "almost10%" style tokens
        tt = []
        for x in tw:
            for part in re.sub(r'(?<=[a-z])(?=\d)', ' ', x['w'].lower()).split():
                tt.append((norm(part), x['s'] + a.lead, x['e'] + a.lead))
        lines = [{'vo': hook['vo'], 'image': hook['image']}] + spec['body']
        sw = [(w, i) for i, ln in enumerate(lines) for w in caption_words(ln['vo'])]
        times = [None] * len(sw)
        sm = difflib.SequenceMatcher(a=[norm(w) for w, _ in sw], b=[t[0] for t in tt], autojunk=False)
        for blk in sm.get_matching_blocks():
            for k in range(blk.size):
                times[blk.a + k] = (tt[blk.b + k][1], tt[blk.b + k][2])
        # interpolate unmatched words between their matched neighbours
        k = 0
        while k < len(sw):
            if times[k] is None:
                j = k
                while j < len(sw) and times[j] is None:
                    j += 1
                t0 = times[k - 1][1] if k > 0 else a.lead
                t1 = times[j][0] if j < len(sw) else len(y) / sr - 0.6
                step = (t1 - t0) / (j - k)
                for m in range(k, j):
                    times[m] = (t0 + step * (m - k), t0 + step * (m - k + 1))
                k = j
            else:
                k += 1
        words = [{'w': w, 's': round(times[i][0], 3), 'e': round(times[i][1], 3), 'line': li} for i, (w, li) in enumerate(sw)]
        segs = []
        for li, ln in enumerate(lines):
            ws = [w for w in words if w['line'] == li]
            segs.append({'s': ws[0]['s'], 'e': ws[-1]['e'], 'image': ln['image']})
        data = {
            'label': f'v3 G2 radio cut · H{n} · owner take ({a.take})',
            'audio': f'v3/take_h{n}.wav',
            'durationSec': round(len(y) / sr, 3),
            'frame0': hook['frame0'],
            'frame0Until': segs[0]['e'] + 0.2,
            'words': words,
            'lines': segs,
            'sfx': spec.get('sfx', []),
        }
        (OUT / f'take_h{n}.json').write_text(json.dumps(data, indent=1))
        unmatched = sum(1 for i in range(len(sw)) if not any(b.a <= i < b.a + b.size for b in sm.get_matching_blocks()))
        print(f'take_h{n}: {data["durationSec"]:.1f} s, {len(words)} words, {unmatched} interpolated')


if __name__ == '__main__':
    main()
