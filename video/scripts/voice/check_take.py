"""Check an ElevenLabs take against its paste file: transcribe it (Parakeet), align the words, and list everything the
take says that the script doesn't (repeats, read-aloud notes or tags) and anything it skips, with timestamps, plus a
ready clean_take.py command that cuts the extras. Saves the take's word timings next to the take.
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
    if not extras and not missing:
        print('MATCH: the take says exactly the script.')
        return
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


if __name__ == '__main__':
    main()
