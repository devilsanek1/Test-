"""Check an ElevenLabs take against its paste file: transcribe it (Parakeet), align the words, and list everything the
take says that the script doesn't (repeats, read-aloud notes or tags) and anything it skips, with timestamps, plus a
ready clean_take.py command that cuts the extras. Saves the take's word timings next to the take.
Also (docs/voice/PROPOSAL.md section 4): a take longer than 1.3x the expected length (script words / 2.8 per s) is
BROKEN; silences over 1.0 s inside the take are flagged for a listen; a word the recogniser hears differently gets a
Whisper second opinion (a misheard "BBC" is not a fault; a swallowed "Google" is). Exit 0 = MATCH, 1 = not clean.
Usage: python3 scripts/voice/check_take.py TAKE.wav docs/vN/script/script_elevenlabs.md MODEL_DIR
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

ONES = 'zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen'.split()
TENS = 'zero ten twenty thirty forty fifty sixty seventy eighty ninety'.split()


def num_words(n):
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
    if n < 1000:
        return ONES[n // 100] + ' hundred' + ('' if n % 100 == 0 else ' ' + num_words(n % 100))
    return str(n)


def tokens(text):
    """normalised word tokens: lowercase, digits and % spelled out, punctuation dropped"""
    text = re.sub(r'(?<=[a-z])(?=\d)', ' ', text.lower())
    text = text.replace('%', ' percent').replace('u.s.', 'us')
    text = re.sub(r'\d+', lambda m: num_words(int(m.group())), text)
    return re.findall(r"[a-z']+", text.replace("'s", "s").replace("’s", "s"))


def whisper_window(take, a, b):
    """Whisper small.en on [a, b] s of the take, or None if faster-whisper is not installed."""
    try:
        import numpy as np
        import soundfile as sf
        sys.path.insert(0, str(Path(__file__).parent))
        from generate_take import second_opinion, DEFAULT_MODEL_DIR
    except Exception:
        return None
    y, sr = sf.read(take, dtype='float32')
    if y.ndim > 1:
        y = y.mean(1)
    seg = y[max(0, int(a * sr)):int(b * sr)]
    import os
    return second_opinion(seg, sr, os.environ.get('WHISPER_DIR', str(Path(DEFAULT_MODEL_DIR).parent / 'fw')))


def main():
    take, paste, model = sys.argv[1], sys.argv[2], sys.argv[3]
    words_path = Path(take).with_name(Path(take).stem + '_words.json')
    here = Path(__file__).parent
    subprocess.run([sys.executable, '-I', str(here / 'transcribe.py'), take, model, str(words_path)], check=True, capture_output=True)
    tw = json.loads(words_path.read_text())
    # each transcript word may expand to several tokens ("10%" -> ten percent); keep its time on every token
    tt, tt_time = [], []
    for w in tw['words']:
        for tok in tokens(w['w']):
            tt.append(tok)
            tt_time.append((w['s'], w['e']))
    script = re.sub(r'\[[^\]]*\]', ' ', open(paste, encoding='utf-8').read())
    st = tokens(script)
    ops = difflib.SequenceMatcher(a=st, b=tt, autojunk=False).get_opcodes()
    extras, missing = [], []
    for op, a0, a1, b0, b1 in ops:
        if op in ('insert', 'replace') and b1 > b0:
            extras.append((tt_time[b0][0], tt_time[b1 - 1][1], ' '.join(tt[b0:b1]), ' '.join(st[a0:a1])))
        if op == 'delete':
            missing.append(' '.join(st[a0:a1]))
    print(f"take: {tw['duration']:.2f} s, {len(tt)} words (script {len(st)}); timings -> {words_path}")
    expected = len(st) / 2.8
    broken = tw['duration'] > 1.3 * expected
    if broken:
        print(f"BROKEN: {tw['duration']:.1f} s is over 1.3x the expected {expected:.0f} s: reject this take (regenerate), don't cut it")
    gaps = [(a['e'], b['s']) for a, b in zip(tw['words'], tw['words'][1:]) if b['s'] - a['e'] > 1.0]
    for a, b in gaps:
        print(f'LISTEN: a {b - a:.2f} s silence at {a:.2f} s (over 1.0 s inside a take)')
    # a replaced word that only differs in spacing ("can'tveto") is fine; anything else gets a Whisper second opinion
    kept = []
    for s0, e0, said, exp in extras:
        squash = lambda x: re.sub(r'(.)\1+', r'\1', x.replace(' ', '').replace("'", ''))
        if exp and squash(said) == squash(exp):  # spacing or a merged sound at a word boundary, not a misread
            continue
        if exp:
            alt = whisper_window(take, s0 - 1.0, e0 + 1.0)
            if alt is not None and exp.replace(' ', '') in ''.join(tokens(alt)):
                print(f'OK (Whisper) {s0:6.2f}-{e0:6.2f} s  Parakeet heard "{said}", Whisper hears "{exp}": listen once')
                continue
        kept.append((s0, e0, said, exp))
    extras = kept
    if not extras and not missing:
        print('MATCH: the take says exactly the script.' + (' But it is too long: see BROKEN above.' if broken else ''))
        sys.exit(1 if broken else 0)
    for s, e, said, expected in extras:
        print(f'EXTRA {s:6.2f}-{e:6.2f} s  said: "{said}"' + (f'  (script: "{expected}")' if expected else ''))
    for m in missing:
        print(f'MISSING: "{m}"')
    inserts = [(s, e) for s, e, _, expected in extras if not expected]
    if inserts:
        keep, t = [], 0.0
        for s, e in inserts:
            keep.append([round(t, 2), round(s, 2)])
            t = e
        keep.append([round(t, 2), round(tw['duration'], 2)])
        print(f"\ncut the extras: python3 scripts/voice/clean_take.py {take} <out>.wav '{json.dumps(keep)}'  (then re-run this check on <out>.wav)")
    sys.exit(1)


if __name__ == '__main__':
    main()
