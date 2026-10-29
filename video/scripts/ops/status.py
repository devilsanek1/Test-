#!/usr/bin/env python3
"""One-screen status of a film, for a hand-off or the hourly status: no agent, no reading in the session.

  python3 video/scripts/ops/status.py --film v4            # from anywhere in the repo
  python3 video/scripts/ops/status.py --film v2 --items 14 --commits 10 --width 140
  python3 video/scripts/ops/status.py --film v4 --no-meter # skip the spend section
  python3 video/scripts/ops/status.py --film v4 --transcripts ~/.claude/projects/<project>/<session>

It prints (as Markdown, so it can be pasted into PROGRESS.md or a message):
  1. the last commits touching the film's paths (docs, src, public, assets, audio, deliverables, scripts, review,
     the entry files and context/workflows/vN-*), with any newer ones on other branches and the uncommitted files;
  2. the film's README: its title, its status table (`| Gate | Status | File |`) and its next-step lines
     (no README: the newest PROGRESS.md entry instead);
  3. the open items in PROGRESS.md (its newest entry) and the film's reports (TODO and OPEN lists, REVIEW, MASTER,
     ASSEMBLY, POSTING_KIT, report*, handover*, *_reports/), newest file first: unchecked boxes, "**Open:**" /
     "**Next:**" / "**Left:**" leads, "Open, ...:" / "Left for ...:" sentences, the items under an open-looking heading
     ("Owner TODO", "What a viewer would still notice") and every item of a TODO/OPEN list, minus anything marked DONE /
     FIXED / [x] / superseded (a marker scan: it can miss an item or show a stale one);
  4. the spend so far from the meter (`video/docs/retro/spend.py`), when this container holds the session's
     transcripts (default: this session, $CLAUDE_CODE_SESSION_ID), plus any saved `docs/retro/spend_*.json` records.

Read-only: it runs only read-only git commands (log, rev-parse, and `--no-optional-locks status`) and never fetches.
"""
import argparse
import datetime as dt
import glob
import importlib.util
import json
import os
import re
import subprocess
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..'))
BASES = ('video/docs', 'video/src', 'video/public', 'video/assets', 'video/audio', 'video/deliverables',
         'video/scripts')
STATUS_FILE_RX = re.compile(r'(^|/)(PROGRESS|[^/]*TODO[^/]*|OPEN[^/]*|REVIEW[^/]*|MASTER|ASSEMBLY[^/]*|POSTING_KIT'
                            r'|report[^/]*|[^/]*_report[^/]*|handover[^/]*|HANDOVER[^/]*)\.md$|_reports/[^/]+\.md$', re.I)
LIST_FILE_RX = re.compile(r'(^|/)([^/]*TODO[^/]*|OPEN[^/]*)\.md$', re.I)
DONE_RX = re.compile(r'\bDONE\b|\bDone\b|\(done\b|\[done\b|already done|\bdone[:)\]]|\bCLOSED\b|\bFIXED\b|\bFixed\b'
                     r'|:\s*fixed\b|\bRESOLVED\b|\bResolved\b|\bSHIPPED\b|[Ss]uperseded|\bWONTFIX\b|\bSKIPPED\b|\[x\]'
                     r'|\[stays\b')
LEAD_RX = re.compile(r'^(open|still open|not done|next|left|todo|to do|requests?|blocked|waiting|pending|owner todo)\b',
                     re.I)
SENTENCE_RX = re.compile(r"^(open|still open|not done|pending|left for [^:]{0,50}|waiting on [^:]{0,50})\s*[,:]", re.I)
HEADING_RX = re.compile(r"\b(open|todo|to do|left|next|remaining|still notice|pending|requests?|follow.?ups?"
                        r"|owner.?s call)\b", re.I)
README_LEAD_RX = re.compile(r'^\*\*(next|handed|paused|was the next|blocked|waiting|status|done)', re.I)


def git(*args):
    r = subprocess.run(['git', '-C', ROOT, *args], capture_output=True, text=True,
                       env=dict(os.environ, TZ='UTC', GIT_OPTIONAL_LOCKS='0'))
    return r.stdout if r.returncode == 0 else ''


def film_specs(film):
    names = (film, film + 'r')
    specs = [f'{b}/{n}' for b in BASES for n in names]
    specs += [f':(glob)video/src/entry-{film}[-r.]*', f':(glob)context/workflows/{film}-*',
              f':(glob)context/workflows/{film}r-*', f':(glob)video/review/{film}_*/**']
    return specs


def clean(s):
    s = re.sub(r'\*\*|__|`', '', s)
    return ' '.join(s.split())


def cut(s, n):
    return s if len(s) <= n else s[:max(0, n - 1)].rstrip() + '…'


# ---------------------------------------------------------------- 1. commits
def commits(film, n, width):
    specs = film_specs(film)
    fmt = '%h %ad %s'
    out = [f'## Commits touching {film} (last {n})']
    log = git('log', f'-n{n}', '--date=format-local:%m-%d %H:%M', f'--format={fmt}', '--', *specs).splitlines()
    out += [cut(f'- {x}', width) for x in log] or ['- (none)']
    newest = git('log', '-1', '--format=%ct', '--', *specs).strip()
    other = git('log', '--branches', '--remotes', '--not', 'HEAD', '--no-merges', '-n3', '--source',
                '--date=format-local:%m-%d %H:%M', '--format=%ct %h %ad %S %s', '--', *specs).splitlines()
    for line in other:
        ct, rest = line.split(' ', 1)
        if not newest or int(ct) > int(newest):
            rest = rest.replace('refs/remotes/', '').replace('refs/heads/', '')
            out.append(cut(f'- newer, not on this branch: {rest}', width))
    dirty = [l for l in git('status', '--porcelain', '--', *specs).splitlines() if l.strip()]
    if dirty:
        out.append(cut(f'- uncommitted: {len(dirty)} file(s): ' + ', '.join(l[3:] for l in dirty[:4])
                       + (' …' if len(dirty) > 4 else ''), width))
    return out


# ---------------------------------------------------------------- markdown helpers
def blocks(text):
    """Markdown -> list of [kind, indent, text, heading]; kind: heading, item, para, table; continuations joined."""
    out, cur, heading = [], None, ''
    for raw in text.splitlines():
        line = raw.rstrip()
        s = line.lstrip()
        if not s:
            cur = None
            continue
        ind = len(line) - len(s)
        m = re.match(r'([-*+]|\d+[.)])\s+', s)
        if s.startswith('#') or re.fullmatch(r'\*\*[^*]+\*\*:?', s):  # a heading, or a bold line alone
            heading = s.lstrip('#').strip().strip('*:').strip()
            out.append(['heading', 0, heading, heading])
            cur = None
        elif s.startswith('|'):
            out.append(['table', ind, s, heading])
            cur = None
        elif m and not s.startswith('**'):
            cur = ['item', ind, s[m.end():], heading]
            out.append(cur)
        elif cur is not None and (cur[0] == 'para' or ind > cur[1]):
            cur[2] += ' ' + s
        else:
            cur = ['para', ind, s.lstrip('> '), heading]
            out.append(cur)
    return out


def sentences(text):
    return [x for x in re.split(r'(?<=[.!?])\s+(?=[A-Z(*`"])', text) if x]


def bold_lead(text):
    m = re.match(r'\*\*(.+?)\*\*', text)
    return m.group(1).strip() if m else ''


def open_items(text, is_list=False):
    """The open items of one markdown text (see the module doc)."""
    bl = blocks(text)
    items = []
    for i, (kind, ind, body, heading) in enumerate(bl):
        if kind not in ('item', 'para'):
            continue
        if DONE_RX.search(body):
            continue
        leaf = not (i + 1 < len(bl) and bl[i + 1][0] == 'item' and bl[i + 1][1] > ind)
        lead = bold_lead(body)
        if kind == 'item' and re.match(r'\[ \]', body):
            items.append(body[3:].strip())
        elif lead and LEAD_RX.match(lead) and not re.match(r'OPEN\s*#?\d', lead):
            rest = clean(body[re.match(r'\*\*(.+?)\*\*', body).end():]).lstrip(':., ')
            if rest or leaf:
                items.append(f'{clean(lead).rstrip(":")}: {rest}' if rest else clean(lead))
        elif kind == 'item' and leaf and (is_list or HEADING_RX.search(heading or '')):
            items.append(clean(body))
        else:
            for s in sentences(clean(body)):
                if SENTENCE_RX.match(s):
                    items.append(s)
    return [x for x in (clean(i) for i in items) if x]


# ---------------------------------------------------------------- 2. README
def readme(film, width):
    path = os.path.join(ROOT, 'video', 'docs', film, 'README.md')
    if not os.path.isfile(path):
        prog = os.path.join(ROOT, 'video', 'docs', film, 'PROGRESS.md')
        out = [f'## State (video/docs/{film}/README.md: none)']
        if not os.path.isfile(prog):
            out.append(f'- no README.md or PROGRESS.md in video/docs/{film}/ (see HANDOFF.md and the film\'s OWNER_NOTES.md)')
        else:
            head, body = newest_entry(open(prog, errors='replace').read())
            out.append(cut(f'- newest PROGRESS.md entry: {head}', width))
            ss = sentences(clean(body))
            if ss:
                out.append(cut(f'  {" ".join(ss[:2])}', width * 2))
        return out
    text = open(path, errors='replace').read()
    first = re.split(r'\n---+\s*\n|\n(?=# )', text.split('\n', 1)[1] if text.startswith('#') else text, maxsplit=1)[0]
    title = text.splitlines()[0].lstrip('# ').strip() if text.startswith('#') else film
    out = [cut(f'## README: {title}', width)]
    table = None
    for block in re.findall(r'((?:^\|.*\|\s*$\n?)+)', text, re.M):
        rows = [r for r in block.strip().splitlines() if not re.match(r'^\|\s*:?-{2,}', r)]
        head = [c.strip().lower() for c in rows[0].strip('|').split('|')]
        if 'status' in head or 'gate' in head:
            table = rows
            break
    if table:
        hdr = [c.strip() for c in table[0].strip('|').split('|')]
        out.append('| ' + ' | '.join(hdr) + ' |')
        out.append('|' + '---|' * len(hdr))
        for r in table[1:]:
            cells = [clean(c) for c in r.strip().strip('|').split('|')]
            fixed = sum(min(len(c), 26) for c in cells[:1] + cells[2:]) + 4 * len(cells)
            room = max(30, width - fixed)
            cells = [cut(c, 26) if j != 1 else cut(c, room) for j, c in enumerate(cells)]
            out.append('| ' + ' | '.join(cells) + ' |')
    for kind, ind, body, heading in blocks(first):
        if kind == 'para' and README_LEAD_RX.match(body):
            out.append(cut(clean(body), 2 * width))
    return out


def newest_entry(text):
    parts = re.split(r'^## ', text, flags=re.M)
    if len(parts) < 2:
        return '', text
    head, _, body = parts[1].partition('\n')
    return head.strip(), body


# ---------------------------------------------------------------- 3. open items
def status_files(film):
    """The film's status files, newest commit first (then by name)."""
    d = f'video/docs/{film}'
    files = []
    seen = set()
    for line in git('log', '--name-only', '--format=', '--', d).splitlines():
        f = line.strip()
        if f and f not in seen:
            seen.add(f)
            files.append(f)
    for f in sorted(glob.glob(os.path.join(ROOT, d, '**', '*.md'), recursive=True)):
        rel = os.path.relpath(f, ROOT)
        if rel not in seen:
            seen.add(rel)
            files.insert(0, rel)  # uncommitted files are the newest
    rel_d = d + '/'
    return [f for f in files if f.startswith(rel_d) and STATUS_FILE_RX.search(f[len(rel_d):])
            and '/archive/' not in f and os.path.isfile(os.path.join(ROOT, f))]


def open_section(film, n_items, width):
    out = ['## Open items (PROGRESS and reports, newest first; a marker scan)']
    shown = 0
    total = 0
    found = []
    for f in status_files(film):
        text = open(os.path.join(ROOT, f), errors='replace').read()
        name = f[len(f'video/docs/{film}/'):]
        if os.path.basename(f) == 'PROGRESS.md':
            head, body = newest_entry(text)
            items = open_items(body)
            name = f'PROGRESS.md ({cut(head, 50)})'
        else:
            items = open_items(text, is_list=bool(LIST_FILE_RX.search(f)))
        if items:
            found.append((name, items))
            total += len(items)
    for name, items in found:
        if shown >= n_items:
            break
        out.append(cut(f'- {name}: {len(items)} open', width))
        for it in items[:max(1, min(3, n_items - shown))]:
            out.append(cut(f'  - {it}', width))
            shown += 1
    rest = len(found) - sum(1 for l in out if l.startswith('- '))
    if rest > 0:
        out.append(f'- … {rest} more file(s) with open items ({total} items in all; --items to show more)')
    if not found:
        out.append('- none found by the marker scan (see the README\'s next step)')
    return out


# ---------------------------------------------------------------- 4. spend
def load_spend():
    spec = importlib.util.spec_from_file_location('spend', os.path.join(ROOT, 'video', 'docs', 'retro', 'spend.py'))
    mod = importlib.util.module_from_spec(spec)
    sys.dont_write_bytecode = True  # no __pycache__ beside the docs
    spec.loader.exec_module(mod)
    return mod


def spend_section(film, paths, width):
    out = ['## Spend (the meter: each API call once, $ at Claude Code\'s own rates)']
    try:
        spend = load_spend()
    except (OSError, SyntaxError, ImportError) as e:
        return out + [f'- the meter could not load: {e}']
    live = set()
    try:
        meter = spend.load(paths or None)
        S = spend.film_summary(meter, film)
        live = set(S['sessions'])
        check = next((s['check'] for s in meter['sessions'] if s.get('check')), {})
        extra = ''
        if check.get('snapshots'):
            x = check['snapshots'][-1]
            extra = f" (about ${S['session_usd'] + x['main_model'] - x['transcripts'] + x['haiku']:,.2f} with the Haiku and compaction side calls)"
        sid = ', '.join(s[:8] for s in S['sessions'])
        out.append(cut(f"- this container's session {sid}: ${S['session_usd']:,.2f} so far{extra}: orchestrator "
                       f"${S['orch_usd']:,.2f}, {S['agents']} agents ${S['agents_usd']:,.2f}; last hour ${S['last_hour_usd']:,.2f}",
                       width * 2))
        if S['film_usd'] > 0:
            out.append(cut(f"- {film} in it: ${S['film_usd']:,.2f} ({S['film_agents']} agents ${S['film_agents_usd']:,.2f} + the "
                           f"orchestrator's share ${S['film_orch_usd']:,.2f}, by the agent it started last)", width * 2))
        elif S['unlabelled']:
            out.append(f"- {film} in it: nothing labelled {film} ({S['unlabelled']} agents name no film: label agents "
                       f"'{film} G<n> role: what' so the meter can group them)")
        else:
            out.append(f'- {film} in it: nothing (no agent labelled {film}; its sessions ran elsewhere)')
        if S['running']:
            out.append(cut('- running: ' + '; '.join(S['running']), width * 2))
    except SystemExit as e:
        out.append(f'- no transcripts in this container ({e}); the meter runs where the session runs')
    saved = []
    for j in sorted(glob.glob(os.path.join(ROOT, 'video', 'docs', 'retro', 'spend_*.json'))):
        try:
            d = json.load(open(j))
        except (OSError, ValueError):
            continue
        if d.get('version') != 2 or d.get('film') or d.get('since') or d.get('until'):
            continue
        sessions = {a['session'] for a in d.get('agents', [])}
        if sessions & live:
            continue
        usd = sum(a['usd'] for a in d['agents'] if a.get('film') == film)
        orch = 0.0
        for c in d.get('calls', []):  # [ts, agent, model, input, cache read, cache write 5m, 1h, output, film, gate]
            if c[8] == film and d['agents'][c[1]]['kind'] == 'orchestrator':
                r = spend.RATES['meter'].get(c[2]) or spend.RATES['meter']['claude-opus-5-5']
                orch += (c[3] * r['inp'] + c[4] * r['cr'] + c[5] * r['cw5m'] + c[6] * r['cw1h'] + c[7] * r['out']) / 1e6
        if usd or orch:
            saved.append(f"{os.path.basename(j)} (session {d['agents'][0]['session'][:8]}, saved {d['generated'][:16]}): "
                         f"{film} ${usd + orch:,.2f} (agents ${usd:,.2f} + the orchestrator's share ${orch:,.2f})")
    if saved:
        out.append(cut('- saved records: ' + '; '.join(saved), width * 2))
    return out


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0], epilog=__doc__.split('\n\n', 1)[1],
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--film', required=True, help='the film, e.g. v4')
    ap.add_argument('--commits', type=int, default=6, help='how many commits to list (default 6)')
    ap.add_argument('--items', type=int, default=10, help='how many open items to list (default 10)')
    ap.add_argument('--width', type=int, default=120, help='line width (default 120)')
    ap.add_argument('--no-meter', action='store_true', help='skip the spend section')
    ap.add_argument('--transcripts', action='append', help='transcripts for the meter (default: this session)')
    a = ap.parse_args(argv)
    film = a.film.strip().lower()
    if not re.fullmatch(r'v\d+', film):
        ap.error('--film takes vN, e.g. v4')
    if not os.path.isdir(os.path.join(ROOT, 'video', 'docs', film)):
        ap.error(f'no video/docs/{film}/')
    now = dt.datetime.now(dt.timezone.utc)
    branch = git('rev-parse', '--abbrev-ref', 'HEAD').strip() or '?'
    head = git('rev-parse', '--short', 'HEAD').strip() or '?'
    lines = [f'# Status {film}, {now:%Y-%m-%d %H:%M} UTC (branch {branch} at {head})', '']
    for part in (commits(film, a.commits, a.width), readme(film, a.width), open_section(film, a.items, a.width)):
        lines += part + ['']
    if not a.no_meter:
        lines += spend_section(film, a.transcripts, a.width)
    print('\n'.join(lines).rstrip())


if __name__ == '__main__':
    main()
