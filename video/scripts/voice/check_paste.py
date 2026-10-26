"""Lint an ElevenLabs paste file before the owner generates a take (rules: docs/ELEVENLABS.md, paste format v2;
evidence and spec: docs/voice/PROPOSAL.md section 6).

Every repeat, loop, restart and garble we saw (v3 takes, v2 take 1) came from pastes with a tag mid-line or a
delivery change inside a paragraph; notes, labels and quoted script phrases were read aloud. v2 take 2's format was
clean first time. Errors (exit 1) block a paste; warnings are printed and must be fixed or explained in the commit.

Usage:
  python3 scripts/voice/check_paste.py docs/vN/script/script_elevenlabs.md            # lint + stats
  python3 scripts/voice/check_paste.py docs/vN/script/script_elevenlabs.md --handoff  # the ONLY text the owner gets
Regression: fails the v2 take-1 paste and the v3 pastes @ 4693e6f, ac73038, 1ca72e7; passes the v2 take-2 paste.
"""
import re
import sys

TAG = re.compile(r'\[([^\[\]]*)\]')
ACTIONS = r'\b(correct\w*|repeat\w*|quot\w*|read\w*|list\w*|spell\w*|say|says|saying|said|recap\w*|restat\w*|echo\w*|stammer\w*|interrupt\w*|whisper\w* (?:the|a)|announce\w*)\b'
SOUNDS = r'\b(gasp\w*|laugh\w*|chuckl\w*|giggl\w*|sigh\w*|breath\w*|inhal\w*|exhal\w*|cough\w*|pause\w*|beat|mic|music|applause|clap\w*|snort\w*|sniff\w*|groan\w*|scream\w*|cry|cries|crying|sob\w*)\b'
STEPS = r'\b(then|at the end|afterwards|after that|beat)\b'
GESTURES = r'\b(smil\w*|grin\w*|shrug\w*|nod\w*|lean\w*|wink\w*|frown\w*|point\w*)\b'
NEGATIONS = r"\b(no|not|never|without|don't|nothing)\b"
LABELS = r'^(H\d|alt(ernate)?|note|hook|option|take|version|line \d|v\d)\b'
ACRONYMS = {'AI', 'BBC', 'U.S.', 'US', 'UK', 'EU', 'CEO', 'CIA', 'FBI', 'NASA', 'TV', 'OK'}
SETTINGS = ('Text to Speech page · model Eleven v4 · Stability 50 % (65 % after a broken take, never below 40 %) · '
            'Similarity default · Clone Strength 0 % if shown · never press Enhance')


def lint(path):
    raw = open(path, encoding='utf-8').read()
    errors, warns = [], []
    E = lambda n, m: errors.append(f'{n}: {m}')
    Wn = lambda n, m: warns.append(f'{n}: {m}')
    lines = raw.splitlines()
    paras = []          # (line no, tag or None, speech)
    prev_blank = True
    for n, line in enumerate(lines, 1):
        s = line.strip()
        if not s:
            prev_blank = True
            continue
        if not prev_blank:
            E(n, 'two non-blank lines in a row: one paragraph = one line, blank line between [E4]')
        prev_blank = False
        if s.startswith(('#', '>', '|', '- ', '* ', '```', '---', '===')) or re.match(LABELS, s, re.I) or re.search(r'https?://', s):
            E(n, f'heading / note / label / URL: ElevenLabs reads it aloud [E1]: {s[:50]}')
        if re.search(r'[(){}<>]', s) or s.count('[') != s.count(']') or re.search(r'\[[^\]]*\[', s) or '[]' in s.replace(' ', ''):
            E(n, 'brackets other than one [...] per tag, unbalanced, nested or empty [E2]')
        tags = list(TAG.finditer(s))
        if tags and tags[0].start() != 0:
            E(n, f'a tag after spoken words (mid-line): the cause of every loop/restart we saw [E3]: {s[:60]}')
        if len(tags) > 1:
            E(n, 'more than one tag in a paragraph (a delivery change inside a paragraph) [E3/E4]')
        speech = TAG.sub(' ', s).strip()
        if tags and not speech:
            E(n, 'a tag alone on a line: put it at the start of its paragraph, same line [E4]')
        tag = tags[0].group(1).strip() if tags else None
        if tag is not None:
            if not tag:
                E(n, 'empty tag [E2]')
            if re.search(r'["“”]', tag) or re.search(r"(^|\s)'[^']+'", tag):
                E(n, f'quotes in a tag: v4 speaks quoted text [E6]: [{tag}]')
            if re.search(r'\d', tag):
                E(n, f'digits in a tag [E6]: [{tag}]')
            for rx, what in ((ACTIONS, 'an action word'), (SOUNDS, 'a sound / reaction word'), (STEPS, 'a multi-step word')):
                m = re.search(rx, tag, re.I)
                if m:
                    E(n, f'{what} ("{m.group(0)}") in a tag: v4 may act it out or make the sound [E6]: [{tag}]')
            if len(tag.split()) > 8:
                E(n, f'a tag over 8 words [E6]: [{tag}]')
            elif len(tag.split()) > 4:
                Wn(n, f'a long tag ({len(tag.split())} words; 1-4 is the format) [W1]: [{tag}]')
            if re.search(NEGATIONS, tag, re.I):
                Wn(n, f'a negation in a tag (say what you want) [W2]: [{tag}]')
            m = re.search(GESTURES, tag, re.I)
            if m:
                Wn(n, f'a gesture word ("{m.group(0)}") in a tag [W3]: [{tag}]')
        paras.append((n, tag, speech))

    if not paras:
        E(0, 'empty paste')
        return errors, warns, {}
    if paras[0][1] is None:
        E(paras[0][0], 'the first paragraph must start with a tag [E5]')
    last = lines[paras[-1][0] - 1].strip()
    if TAG.search(last) and TAG.sub('', last).strip() == '' or last.endswith(('…', '...')) or not re.search(r'[.?!]["”]?$', last):
        E(paras[-1][0], 'the last paragraph must end on . ? or ! (no tag, ellipsis or note after it) [E5]')

    text = ' '.join(p[2] for p in paras)
    nwords = len(re.findall(r"[A-Za-z][A-Za-z'.]*", text))
    ntags = sum(1 for p in paras if p[1] is not None)
    nchars = len(raw.strip())
    tagchars = sum(len(f'[{p[1]}]') for p in paras if p[1] is not None)
    per100 = ntags / max(1, nwords) * 100

    # spoken text
    for n, tag, sp in paras:
        if re.search(r'\d', sp):
            E(n, f'digits in spoken text: spell numbers out [E8]: {sp[:50]}')
        if re.search(r'[%$&/=+@#*_~^|]', sp):
            E(n, f'a symbol in spoken text: spell it out [E8]: {sp[:50]}')
        if re.search(r'[\U0001F300-\U0001FAFF☀-➿]', sp):
            E(n, 'emoji in spoken text [E8]')
        if re.search(r'—|–| - |--', sp):
            E(n, 'a dash used as a break: v4 cuts the speaker off [E8]')
        if re.search(r'\bUS\b', sp):
            Wn(n, '"US" can be read as "us": write "U.S." [W10]')
        if re.search(r'\bAnd [A-Z][a-z]', sp):
            Wn(n, f'"And" right before a capitalised name: v4 swallowed the first sound once ("And \'oogle") [W11]: {sp[:50]}')
        caps = [w for w in re.findall(r"\b[A-Z][A-Z'.]+\b", sp) if w.strip('.') not in {a.strip('.') for a in ACRONYMS}]
        if len(caps) > 1:
            Wn(n, f'more than one CAPS word in a paragraph [W8]: {caps}')
        if len(re.findall(r"[A-Za-z']+", sp)) > 45:
            Wn(n, 'a paragraph over 45 words [W13]')
        if tag and len(tag.split()) >= 3:
            for k in range(len(sp.split()) - 2):
                tri = ' '.join(sp.split()[k:k + 3]).lower().strip('.,?!…')
                if tri and tri in tag.lower():
                    E(n, f'a 3-word run from the spoken text in the tag ("{tri}") [E6]')
    caps_all = [w for p in paras for w in re.findall(r"\b[A-Z][A-Z'.]+\b", p[2]) if w.strip('.') not in {a.strip('.') for a in ACRONYMS}]
    if len(caps_all) > 3:
        Wn(0, f'more than 3 CAPS words in the script [W8]: {caps_all}')
    ell = text.count('…') + text.count('...')
    if ell > 1:
        Wn(0, f'{ell} ellipses (at most one per script) [W9]')
    if any(p[2].startswith(('…', '...')) for p in paras):
        Wn(0, 'an ellipsis at a paragraph start [W9]')
    for a, b in zip(paras, paras[1:]):
        if a[1] is not None and b[1] is not None and a[1].lower() == b[1].lower():
            Wn(b[0], 'the same tag again (tags carry forward; drop it) [W4]')
    toks = [w.lower().strip('.,?!…') for w in text.split()]
    seen, dup = {}, set()
    for k in range(len(toks) - 2):
        tri = ' '.join(toks[k:k + 3])
        if tri in seen and k - seen[tri] > 3:
            dup.add(tri)
        seen.setdefault(tri, k)
    if dup:
        Wn(0, f'3-word phrases used twice (landing spots if v4 loses its place) [W12]: {sorted(dup)[:6]}')
    starts = [' '.join(p[2].split()[:2]).strip('.,') for p in paras]
    rep = sorted({s for s in starts if starts.count(s) > 1})
    if rep:
        Wn(0, f'paragraphs that start the same way [W12]: {rep}')

    # density and size
    if ntags > 8 or per100 > 7:
        E(0, f'{ntags} tags = {per100:.1f} per 100 words (max 8 and 7 per 100) [E7]')
    elif per100 > 5.5:
        Wn(0, f'{per100:.1f} tags per 100 words (aim 3-5.5) [W5]')
    if nchars > 1200 or nwords > 150:
        E(0, f'{nchars} characters / {nwords} words (max 1,200 / 150) [E9]')
    elif nchars > 900:
        Wn(0, f'{nchars} characters (aim 650-900) [W6]')
    if tagchars > 0.15 * nchars:
        Wn(0, f'tags are {tagchars / nchars:.0%} of the characters (aim under 15 %) [W7]')

    exp = nwords / 2.8
    return errors, warns, {'text': text, 'words': nwords, 'chars': nchars, 'tags': ntags, 'per100': per100,
                           'expected': exp, 'max': exp * 1.3, 'raw': raw.strip()}


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    path = sys.argv[1]
    handoff = '--handoff' in sys.argv[2:]
    errors, warns, st = lint(path)
    if handoff:
        if errors:
            for e in errors:
                print('ERROR', e)
            print(f'{len(errors)} error(s): nothing to hand over until they are fixed')
            sys.exit(1)
        print('Paste everything inside the box into ElevenLabs:\n')
        print('```\n' + st['raw'] + '\n```\n')
        print(f'{st["words"]} words: about {st["expected"]:.0f} s. A take longer than {st["max"]:.0f} s went wrong: '
              'press Regenerate (free, same text).')
        print(f'Settings: {SETTINGS}.')
        print('Make three takes from one paste (Generate, then Regenerate twice without editing), download all three, '
              'and send them with a screenshot of the settings panel; we keep the best.')
        for w in warns:
            print('  (note for us) WARN', w)
        sys.exit(0)
    print(st.get('text', ''))
    if st:
        print(f"\n{st['words']} words, {st['chars']} characters, {st['tags']} tags ({st['per100']:.1f} per 100 words); "
              f"expected about {st['expected']:.0f} s, max {st['max']:.0f} s")
    for w in warns:
        print('WARN ', w)
    for e in errors:
        print('ERROR', e)
    print('OK: paste-safe' if not errors else f'{len(errors)} error(s): fix before sending')
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
