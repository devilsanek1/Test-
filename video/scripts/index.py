#!/usr/bin/env python3
"""index.py: write scripts/README.md, the index of every tool in video/scripts, from each tool's own header.

  python3 -I scripts/index.py            # (from video/) rewrite scripts/README.md
  python3 -I scripts/index.py --check    # exit 1 if scripts/README.md is stale (a tool was added, moved or re-described)
  python3 -I scripts/index.py --stdout   # print the index instead of writing it

A tool is a .py / .sh / .mjs / .cjs / .js / .ts file under scripts/ (not __pycache__). Its line in the index is the first
sentence of its header: the module docstring (Python), else the first comment block at the top of the file (`#` or
`//`, after the shebang). A leading usage line ("sheet.sh <CompId> ...", "usage: ...") is skipped when a description
follows it, and a leading "<file name>:" / "<file name> --" is dropped. A tool without a header is listed as such, so a
missing docstring shows up here. Folder READMEs are linked. The output has no dates or timings, so it only changes
when the tools do; never edit README.md by hand, re-run this instead.
"""
from __future__ import annotations

import ast
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))  # video/scripts
VIDEO = os.path.dirname(HERE)
OUT = os.path.join(HERE, 'README.md')
CODE = ('.py', '.sh', '.mjs', '.cjs', '.js', '.ts')
SKIP_DIRS = {'__pycache__', 'node_modules'}
MAX = 260
ABBREV = ('e.g.', 'i.e.', 'vs.', 'etc.', 'cf.', 'approx.', 'no.', 'fig.')


def header_text(path: str) -> str:
    """The raw header of a tool: its docstring, else its first comment block (comment markers removed)."""
    try:
        src = open(path, encoding='utf-8', errors='replace').read()
    except OSError:
        return ''
    if path.endswith('.py'):
        try:
            doc = ast.get_docstring(ast.parse(src), clean=True)
        except (SyntaxError, ValueError):
            m = re.match(r'\s*(?:#[^\n]*\n\s*)*[rbuRBU]?("""|\'\'\')(.*?)\1', src, re.S)
            doc = m.group(2).strip() if m else None
        if doc:
            return doc
    lines = src.splitlines()[:40]
    if lines and lines[0].startswith('#!'):
        lines = lines[1:]
    marker = '//' if path.endswith(('.mjs', '.cjs', '.js', '.ts')) else '#'
    # a header comment sits at the top: only blank lines, imports and shell `set` lines may come before it
    preamble = re.compile(r'^\s*$|^\s*(?:import\s|from\s+\S+\s+import\s|set\s+-|const\s+\{[^}]*\}\s*=\s*require\()')
    block: list[str] = []
    in_c = False  # a /* ... */ block (JS)
    for ln in lines:
        s = ln.strip()
        if marker == '//' and not block and s.startswith('/*'):
            in_c = True
            s = s[2:].lstrip('*').strip()
        if in_c:
            end = '*/' in s
            s = s.split('*/')[0].lstrip('*').strip()
            block.append(s)
            if end:
                break
            continue
        if s.startswith(marker) and not re.match(r'#\s*-\*-|#\s*(?:noqa|type:|pylint)', s):
            block.append(s[len(marker):].strip())
        elif block or not preamble.match(ln):
            break
    return '\n'.join(block).strip()


def first_sentence(name: str, text: str) -> str:
    """One line from a header: the first paragraph, minus a leading usage line and self-name, cut at its first sentence."""
    if not text:
        return ''
    paras = re.split(r'\n\s*\n', text.strip())
    para = paras[0].splitlines()
    stem = re.escape(name)
    usage = re.compile(rf'^(?:usage:\s*)?(?:[\w./-]*/)?{stem}(?:\s+[<\[]|\s*$)|^usage:', re.I)
    # drop a leading usage line (and its indented continuation lines) when something follows it
    if para and usage.match(para[0]):
        rest = para[1:]
        while rest and re.match(r'^\s*[<\[]|^\s{2,}', rest[0]):
            rest = rest[1:]
        if rest:
            para = rest
        elif len(paras) > 1:
            para = paras[1].splitlines()
    s = ' '.join(x.strip() for x in para if x.strip())
    s = re.sub(rf'^(?:scripts/)?(?:[\w./-]*/)?{stem}\s*(?::|--|—|-)\s+', '', s)
    s = re.sub(r'\s+', ' ', s).strip()
    # first sentence: a ". " / "? " / "! " at bracket depth 0, not after an abbreviation, before an upper-case letter or
    # a usage line ("node ...", "python3 ...", "usage: ...")
    depth = 0
    cmd = re.compile(r'(?:node|python3|npx|bash|usage:|scripts/)\s?', re.I)
    for i, ch in enumerate(s):
        if ch in '([{':
            depth += 1
        elif ch in ')]}':
            depth = max(0, depth - 1)
        elif ch in '.?!' and depth == 0 and i + 2 < len(s) and s[i + 1] == ' ' and (
                s[i + 2].isupper() or s[i + 2] in '`"' or cmd.match(s, i + 2)):
            word = s[:i + 1].split(' ')[-1].lower()
            if word in ABBREV or re.fullmatch(r'\w\.', word):
                continue
            s = s[:i + 1]
            break
    s = re.sub(r'\s*:$', '.', s)
    if len(s) > MAX:
        s = s[:MAX].rsplit(' ', 1)[0].rstrip(',;:') + ' …'
    first = s.split(' ', 1)[0].rstrip(':,;.') if s else ''
    if s and s[0].islower() and first.isalpha():  # a plain word, never a file name or an identifier
        s = s[0].upper() + s[1:]
    return s


def collect():
    """{folder (relative to video/): ([(tool path, line)], [readme paths])}, folders in a stable order."""
    out = {}
    for d, dirs, files in os.walk(HERE):
        dirs[:] = sorted(x for x in dirs if x not in SKIP_DIRS and not x.startswith('.'))
        rel = os.path.relpath(d, VIDEO)
        tools, notes = [], []
        for f in sorted(files):
            p = os.path.join(d, f)
            if f == 'README.md' and p != OUT:
                notes.append(os.path.relpath(p, VIDEO))
            elif f.endswith(CODE):
                tools.append((os.path.relpath(p, VIDEO), first_sentence(f, header_text(p))))
        if tools or notes:
            out[rel] = (tools, notes)
    return out


def render() -> str:
    idx = collect()
    n = sum(len(t) for t, _ in idx.values())
    missing = sum(1 for t, _ in idx.values() for _, line in t if not line)
    lines = [
        '# video/scripts: the tool index',
        '',
        '<!-- generated by scripts/index.py: do not edit by hand -->',
        'Generated by `python3 -I scripts/index.py` from each tool\'s own docstring or header comment, so it never drifts:',
        're-run it after adding, moving or re-describing a tool (`--check` exits 1 when this page is stale). Paths are from',
        '`video/`. Usage and flags are in each tool\'s header; how the tools fit the gates: `docs/PIPELINE_V2.md` ("Studio',
        'toolkit"), `docs/G5_BLOCKING.md` §4 (previews) and §7 (the gate check). v1-only tools are archived in',
        '`archive/v1/scripts/` (the `v1-final` tag has them in place).',
        '',
        f'{n} tools in {len(idx)} folders' + (f'; {missing} without a header (add a docstring or a first comment line).' if missing else '.'),
    ]
    for folder, (tools, notes) in idx.items():
        lines += ['', f'## `{folder}/`', '']
        for nt in notes:
            lines.append(f'Folder notes: [`{os.path.relpath(nt, "scripts")}`]({os.path.relpath(nt, "scripts")}).')
        if notes and tools:
            lines.append('')
        if tools:
            lines += ['| tool | what it does |', '|---|---|']
            for path, line in tools:
                cell = (line or '_(no header: add a docstring or a first comment line)_').replace('|', '\\|')
                lines.append(f'| `{path}` | {cell} |')
    return '\n'.join(lines) + '\n'


def main(argv: list[str]) -> int:
    text = render()
    if '--stdout' in argv:
        sys.stdout.write(text)
        return 0
    old = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
    if '--check' in argv:
        if old == text:
            print('scripts/README.md is up to date')
            return 0
        print('scripts/README.md is STALE: run python3 -I scripts/index.py')
        return 1
    if old != text:
        with open(OUT, 'w', encoding='utf-8') as f:
            f.write(text)
    print(f'wrote {os.path.relpath(OUT, VIDEO)}' if old != text else 'scripts/README.md unchanged')
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
