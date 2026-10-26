"""Lint an ElevenLabs paste file before the owner generates a take (rules: docs/ELEVENLABS.md).

Catches what went wrong on v3: notes/labels that v4 reads aloud, quoted script words inside tags (v4 speaks them),
action words in tags ("correcting yourself" made v4 repeat the previous line), digits and symbols in the spoken text.
And on v2 take 1: mid-line tags (the line derailed / the ending looped 3x) and negations or long tags in cues.
Prints the spoken text, word count and estimated length. Exit code 1 if anything must be fixed.
Usage: python3 scripts/voice/check_paste.py docs/vN/script/script_elevenlabs.md
"""
import re
import sys

ACTIONS = r'\b(correct\w*|repeat\w*|quot\w*|read\w*|list\w*|spell\w*|say|says|saying|recap\w*|restat\w*|echo\w*)\b'
TAG = re.compile(r'\[([^\]]*)\]')


def main():
    path = sys.argv[1]
    errors, warnings, spoken = [], [], []
    prev_tag = False
    for n, raw in enumerate(open(path, encoding='utf-8').read().splitlines(), 1):
        line = raw.strip()
        if not line:
            continue
        if line.startswith(('#', '---', '>', '|', '- ', '* ')) or re.match(r'^(H\d|alternate|note|hook|line \d)', line, re.I):
            errors.append(f'{n}: looks like a heading or note; ElevenLabs will read it aloud: {line[:60]}')
        for tag in TAG.findall(line):
            if re.search(r'["“”]', tag) or re.search(r"(^|\s)'[^']+'", tag):
                errors.append(f'{n}: a tag quotes words; v4 speaks quoted text: [{tag}]')
            if re.search(ACTIONS, tag, re.I):
                errors.append(f'{n}: a tag names an action, v4 may act it out (name a tone instead): [{tag}]')
            if re.search(r'\d', tag):
                errors.append(f'{n}: digits in a tag: [{tag}]')
            if re.search(r'\b(no|not|never|without|don\'t)\b', tag, re.I):
                warnings.append(f'{n}: a negation in a tag (say what you want, not what to avoid): [{tag}]')
            if len(tag.split()) > 9:
                warnings.append(f'{n}: long tag ({len(tag.split())} words; keep it 3-8): [{tag}]')
        if TAG.search(line) and not re.fullmatch(r'\s*\[[^\]]*\]\s*', line) and (TAG.sub('', line.split('[', 1)[0]).strip() or line.count('[') > 1):
            warnings.append(f'{n}: a mid-line tag; split the line in two, each with its own tag (v2 take 1 looped): {line[:60]}')
        speech = TAG.sub(' ', line).strip()
        if not speech:
            prev_tag = True
            continue
        if not prev_tag and not line.startswith('['):
            warnings.append(f'{n}: spoken line without a cue before it')
        if re.search(r'\d', speech):
            errors.append(f'{n}: digits in spoken text; spell numbers out: {speech[:60]}')
        if re.search(r'[%$&/=+@#()]', speech):
            errors.append(f'{n}: symbol in spoken text; spell it out: {speech[:60]}')
        if re.search(r'\bUS\b', speech):
            warnings.append(f'{n}: "US" can be read as "us"; write "U.S."')
        spoken.append(speech)
        prev_tag = False
    text = ' '.join(spoken)
    words = len(re.findall(r"[A-Za-z][A-Za-z'.]*", text))
    print(text)
    print(f'\n{words} words, about {words / 165 * 60:.1f} s at 165 wpm (plus beats)')
    for w in warnings:
        print('WARN ', w)
    for e in errors:
        print('ERROR', e)
    print('OK: paste-safe' if not errors else f'{len(errors)} error(s): fix before sending')
    sys.exit(1 if errors else 0)


if __name__ == '__main__':
    main()
