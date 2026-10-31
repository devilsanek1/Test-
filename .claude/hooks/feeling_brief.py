#!/usr/bin/env python3
"""Owner rule: start from the feeling, never from a number (CLAUDE.md, "Feeling first" 4; owner, 2026-10-31:
"Saying 65% contrast makes the agent force a design actually sacrificing the feeling").

As a Claude Code PreToolUse hook (`.claude/settings.json`), it reads the hook JSON on stdin and stops a brief that hands
an agent a LOOK NUMBER as a target: a share of the frame ("45 % of the frame dark", "contrast 65 %"), a lightness
target ("L* 40", "L* >= 95"), or a placement ("the focal at (540, 980)", "y 1450-1650"). It checks an Agent/Task
prompt, a Workflow script (inline or by path) and a message to a helper session. The fix it asks for: lead with the
beat's feeling and story moment in words and name the tools; a number that is a hard constraint (the caption band, the
safe zones, 60 fps), a check against a real mistake, or a labelled example may stay if the brief says so in one line:
"Numbers here are examples or checks, not targets." The hook fails open: unreadable input never blocks work.

As a lint: python3 .claude/hooks/feeling_brief.py --lint <file>...  prints the look-number targets it finds (exit 1).
"""
import json
import os
import re
import sys

ACK = re.compile(r'numbers here are examples or checks, not targets', re.I)
LOOKISH = re.compile(r'\b(frame|scene|still|key ?frame|shot|composition|paint|light|look|value|contrast|sky)\b', re.I)
TARGETS = [
    ('a share of the frame as a target',
     re.compile(r'\b\d{1,3}(?:\.\d+)?\s?%\s?(?:of (?:the )?(?:frame|picture|image|screen|sky)|under L\*|dark|darks|'
                r'quiet|contrast|sky|black|shadow)', re.I)),
    ('a share of the frame as a target',
     re.compile(r'\b(?:contrast|darks?|quiet|sky|shadow|negative space|value)\b[^.\n]{0,24}?\b\d{1,3}(?:\.\d+)?\s?%', re.I)),
    ('a lightness target', re.compile(r'\bL\*\s?(?:[<>]=?|<=|>=|≤|≥|~)?\s?\d{1,3}\b')),
    ('a placement', re.compile(r'\(\s?\d{2,4}\s?,\s?\d{2,4}\s?\)')),
    ('a placement', re.compile(r'\b[xy]\s?=?\s?\d{3,4}\s?(?:-|–|to)\s?\d{3,4}\b')),
]
MESSAGE = ('Owner rule (CLAUDE.md, "Feeling first" 4): start from the feeling, never from a number. This brief hands '
           'the agent look numbers as targets: {hits}. Rewrite it to lead with the beat\'s FEELING and story moment '
           'in words and the TOOLS that create it (e.g. "contrastful, so the step out feels bold: one story light, '
           'big quiet darks away from her" instead of "45 % of the frame under L* 40"). If a number is a hard '
           'constraint (the caption band, the safe zones, 60 fps), a check against a real mistake, or a labelled '
           'example, keep it and add this line to the brief: "Numbers here are examples or checks, not targets."')


QUOTED = re.compile(r'"[^"\n]{0,400}"|“[^”]{0,400}”')


def find_targets(text):
    """Return [(kind, snippet)] for the look-number targets in a brief that does not acknowledge them.

    Text inside quotes is someone's words (the owner's notes, a quoted line), never a target the brief sets, so it is
    left out before matching."""
    if not text or ACK.search(text) or not LOOKISH.search(text):
        return []
    text = QUOTED.sub(' ', text)
    hits, seen = [], set()
    for kind, rx in TARGETS:
        for m in rx.finditer(text):
            snip = ' '.join(m.group(0).split())
            if snip not in seen:
                seen.add(snip)
                hits.append((kind, snip))
    return hits


def _texts(tool, ti, cwd):
    if tool in ('Agent', 'Task'):
        if ti.get('subagent_type') != 'fork':
            yield str(ti.get('prompt') or '')
    elif tool == 'Workflow':
        for key, val in ti.items():
            if not isinstance(val, str) or not val.strip():
                continue
            path = val if os.path.isabs(val) else os.path.join(cwd, val)
            if len(val) < 1024 and re.search(r'\.(m?js|ts)$', val) and os.path.isfile(path):
                with open(path, encoding='utf-8', errors='replace') as f:
                    yield f.read()
            elif key in ('script', 'args'):
                yield val
    elif tool.endswith('send_message') and 'claude-code-remote' in tool:
        yield str(ti.get('message') or '')


def hook():
    try:
        data = json.load(sys.stdin)
    except Exception:
        return 0
    tool, ti = data.get('tool_name') or '', data.get('tool_input') or {}
    if not isinstance(ti, dict):
        return 0
    cwd = data.get('cwd') or os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
    hits = []
    try:
        for text in _texts(tool, ti, cwd):
            hits += find_targets(text)
    except Exception:
        return 0
    if hits:
        shown = '; '.join(f'{k}: "{s}"' for k, s in hits[:6]) + (' ...' if len(hits) > 6 else '')
        print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse', 'permissionDecision': 'deny',
                                                 'permissionDecisionReason': MESSAGE.format(hits=shown)}}))
    return 0


def main(argv):
    if len(argv) > 1 and argv[1] == '--lint':
        bad = 0
        for path in argv[2:]:
            with open(path, encoding='utf-8', errors='replace') as f:
                for kind, snip in find_targets(f.read()):
                    print(f'{path}: {kind}: "{snip}"')
                    bad = 1
        return bad
    return hook()


if __name__ == '__main__':
    sys.exit(main(sys.argv))
