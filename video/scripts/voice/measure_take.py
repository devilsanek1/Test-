#!/usr/bin/env python3
"""Measure how a take is DELIVERED (not what it says: check_take.py does that): pace, pauses, liveliness, loudness, and
how much the key words stand out, so a few generated variants can be compared with each other and with a reference
read the owner likes (v4 G2, 2026-10-29: the El Niño reference, docs/voice/refs/2026-10-29_el_nino/, 214 words a
minute, 0.2-0.3 s pauses, a 9-semitone pitch spread).

    python3 scripts/voice/measure_take.py TAKE.wav [TAKE2.wav ...] [--words forty,wants,chatbot]

Per take: length; words a minute over the spoken span; pauses over 0.15 s (count, mean, longest); median pitch and the
p10-p90 pitch spread in semitones (a flat read is about 4-5, a lively one 9-12); the loudness spread of the voiced
frames; and for each --words word, its pitch (semitones over the take's median) and level (dB over the median).
Word times come from Whisper small.en word timestamps ($WHISPER_DIR), which keep the gaps between words (the
recogniser's own times in take_words.json do not). Pitch: librosa's pYIN.
"""
import argparse
import os
import sys

import numpy as np
import soundfile as sf


def whisper_words(y16, model_dir):
    from faster_whisper import WhisperModel
    m = WhisperModel('small.en', device='cpu', compute_type='int8', download_root=model_dir)
    segs, _ = m.transcribe(y16.astype(np.float32), beam_size=5, word_timestamps=True, vad_filter=False)
    return [(w.start, w.end, w.word.strip()) for s in segs for w in s.words]


def measure(path, keys, model_dir):
    import librosa
    import soxr
    y, sr = sf.read(path, dtype='float32')
    if y.ndim > 1:
        y = y.mean(axis=1)
    y16 = soxr.resample(y, sr, 16000) if sr != 16000 else y
    w = whisper_words(y16, model_dir)
    span = w[-1][1] - w[0][0]
    gaps = [w[i][0] - w[i - 1][1] for i in range(1, len(w))]
    big = [g for g in gaps if g > 0.15]
    hop = 256
    f0, _, _ = librosa.pyin(y16, fmin=70, fmax=500, sr=16000, frame_length=1024, hop_length=hop)
    t = librosa.frames_to_time(np.arange(len(f0)), sr=16000, hop_length=hop)
    fv = f0[~np.isnan(f0)]
    p10, p50, p90 = np.percentile(fv, [10, 50, 90])
    rms = librosa.feature.rms(y=y16, frame_length=1024, hop_length=hop)[0]
    db = 20 * np.log10(np.maximum(rms, 1e-5))
    vdb = db[~np.isnan(f0)]
    stress = []
    for s, e, tok in w:
        k = ''.join(c for c in tok.lower() if c.isalpha())
        if k in keys:
            m = (t >= s) & (t <= e)
            ff = f0[m]
            ff = ff[~np.isnan(ff)]
            st = 12 * np.log2(np.mean(ff) / p50) if len(ff) else float('nan')
            stress.append(f'{k} {st:+.1f}st {float(np.mean(db[m]) - np.median(vdb)):+.1f}dB')
    print(f'{os.path.basename(os.path.dirname(path)) or path}/{os.path.basename(path)}: {len(y) / sr:.1f} s, '
          f'{60 * len(w) / span:.0f} words/min, pauses {len(big)} (mean {np.mean(big) if big else 0:.2f}, '
          f'max {max(big) if big else 0:.2f} s), pitch {p50:.0f} Hz spread {12 * np.log2(p90 / p10):.1f} st, '
          f'loudness spread {np.percentile(vdb, 90) - np.percentile(vdb, 10):.1f} dB')
    if stress:
        print('   ' + '; '.join(stress))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('takes', nargs='+')
    p.add_argument('--words', default='', help='comma-separated words whose stress to report')
    p.add_argument('--whisper-dir', default=os.environ.get('WHISPER_DIR', '/tmp/whisper'))
    a = p.parse_args()
    keys = {k.strip().lower() for k in a.words.split(',') if k.strip()}
    for path in a.takes:
        try:
            measure(path, keys, a.whisper_dir)
        except Exception as ex:
            print(path, 'ERROR', type(ex).__name__, ex, file=sys.stderr)


if __name__ == '__main__':
    main()
