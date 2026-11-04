"""Shared word normalisation for comparing what a voice take says (heard by Parakeet or Whisper) with the script.

Why (v4 G2, 2026-10-29): Parakeet writes numbers as digits ("70 000", "40"), the scripts spell them ("seventy thousand",
"forty"), and the old comparisons turned "70 000" into "seventy zero": every v4 take was rejected for a word it said
right, generate_take.py threw the whole-script reads away and fell back to stitched paragraphs. Here a number in the
heard text becomes words in whichever reading the script uses (cardinal "seventy thousand", year "twenty ten",
digit by digit), chosen against the expected words. num2words would do the cardinals, but it doesn't install on this
Python (its docopt dependency fails to build) and we need the year and digit readings and the choice anyway, so this is
our own, covered by --selftest.

    from textnorm import tokens          # tokens(heard_text, expected_tokens) -> list of words
    python3 scripts/voice/textnorm.py --selftest
"""
import difflib
import itertools
import re
import sys

ONES = ('zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen '
        'seventeen eighteen nineteen').split()
TENS = 'zero ten twenty thirty forty fifty sixty seventy eighty ninety'.split()
SCALES = [(10 ** 9, 'billion'), (10 ** 6, 'million'), (1000, 'thousand'), (100, 'hundred')]


def cardinal(n):
    """12 -> 'twelve', 70000 -> 'seventy thousand', 2027 -> 'two thousand twenty seven' (no 'and', as Parakeet and
    our scripts write it)."""
    if n < 20:
        return ONES[n]
    if n < 100:
        return TENS[n // 10] + ('' if n % 10 == 0 else ' ' + ONES[n % 10])
    for size, name in SCALES:
        if n >= size:
            head, rest = divmod(n, size)
            return cardinal(head) + ' ' + name + ('' if rest == 0 else ' ' + cardinal(rest))
    return str(n)


def year(n):
    """2010 -> 'twenty ten', 2027 -> 'twenty twenty seven', 1999 -> 'nineteen ninety nine', 1905 -> 'nineteen oh
    five', 2005 -> 'two thousand five', 1900 -> 'nineteen hundred'."""
    hi, lo = divmod(n, 100)
    if n % 1000 == 0:
        return cardinal(n)
    if lo == 0:
        return cardinal(hi) + ' hundred'
    if 2000 < n < 2010:
        return 'two thousand ' + ONES[lo]
    return cardinal(hi) + ' ' + (('oh ' + ONES[lo]) if lo < 10 else cardinal(lo))


def readings(num):
    """The ways a number written in digits may have been said."""
    n = int(num)
    out = [cardinal(n)]
    if 1000 <= n <= 2999:
        out.append(year(n))
    if len(num) > 1:
        out.append(' '.join(ONES[int(d)] for d in num))
    return list(dict.fromkeys(out))


def _base(text):
    text = text.lower().replace('’', "'").replace('…', ' ')
    text = re.sub(r'(?<=[a-z])(?=\d)|(?<=\d)(?=[a-z])', ' ', text)
    text = re.sub(r'(?<=\d)[ ,.](?=\d{3}\b)', '', text)               # 70 000, 70,000, 70.000 -> 70000
    text = re.sub(r'(?<=\d)\.(?=\d)', ' point ', text)                # 2.5 -> 2 point 5
    text = text.replace('%', ' percent').replace('u.s.', 'us').replace('&', ' and ')
    text = text.replace("'s", 's').replace("'", '')
    text = re.sub(r'[-/]', ' ', text)
    return text


def tokens(text, expected=None):
    """Lowercase words with punctuation dropped and every number spelled out; with `expected` (the script's tokens),
    each number takes the reading that matches the script best."""
    text = _base(text)
    parts = re.split(r'(\d+)', text)
    nums = [i for i in range(1, len(parts), 2)]
    if not nums:
        return re.findall(r'[a-z]+', text)
    options = [readings(parts[i]) for i in nums]
    best, best_score = None, None
    combos = itertools.product(*options) if expected is not None else [tuple(o[0] for o in options)]
    exp_str = ' ' + ' '.join(expected) + ' ' if expected is not None else ''
    for k, combo in enumerate(combos):
        if k > 500:                       # a line with many numbers: keep the best found so far
            break
        p = list(parts)
        for i, r in zip(nums, combo):
            p[i] = ' ' + r + ' '
        cand = re.findall(r'[a-z]+', ''.join(p))
        if expected is None:
            return cand
        # a reading the script contains word for word wins (a lone heard word "2010" against "... twenty ten ..."),
        # then the closest whole line
        found = sum((' ' + r + ' ') in exp_str for r in combo)
        score = (found, difflib.SequenceMatcher(None, cand, expected).ratio())
        if best_score is None or score > best_score:
            best, best_score = cand, score
    return best


def _selftest():
    exp = lambda s: tokens(s)
    cases = [
        ('did you know helsinki wants ai to heat 70 000 homes', 'Did you know Helsinki wants AI to heat seventy thousand homes?'),
        ('as much heat as 40 kettles boiling non stop', 'as much heat as FORTY kettles, boiling non-stop.'),
        ('in 2010 a small data center', 'In twenty ten, a small data center'),
        ('so from 2027 your chatbot', 'So from twenty twenty-seven, your chatbot'),
        ('starting in 2027', 'starting in two thousand twenty-seven'),
        ('a 69% chance', 'a sixty-nine percent chance'),
        ('70,000 flats', 'seventy thousand flats'),
        ('about 2.5 times', 'about two point five times'),
        ("that's a lot of tea", "That's a lot of tea."),
        ('call 911', 'call nine one one'),
        ('2010', 'Back in twenty ten, a small data center under a cathedral started heating seventy thousand homes.'),
    ]
    bad = 0
    for heard, script in cases:
        e = exp(script)
        got = tokens(heard, e)
        ok = got == e or (len(got) < len(e) and ' '.join(got) in ' '.join(e))
        bad += not ok
        print(('pass ' if ok else 'FAIL ') + f'{heard!r} -> {" ".join(got)!r}' + ('' if ok else f'  (script: {" ".join(e)!r})'))
    print('OK: all cases pass' if not bad else f'FAIL: {bad} case(s)')
    return 1 if bad else 0


if __name__ == '__main__':
    if '--selftest' in sys.argv:
        sys.exit(_selftest())
    print(' '.join(tokens(' '.join(sys.argv[1:]))))
