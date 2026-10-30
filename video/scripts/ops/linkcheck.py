#!/usr/bin/env python3
"""linkcheck.py: after files move, list every reference to their old paths in the repo's docs and code, so none dangles.

  python3 -I video/scripts/ops/linkcheck.py --git <base>      # the moves: renames from <base> (commit, tag, branch)
  python3 -I video/scripts/ops/linkcheck.py --moves <list>    # the moves from a list (format below)
      [--known <tsv>] [--history PREFIX ...] [--only PREFIX ...] [--all] [--json OUT]

Run it from anywhere in the repo, after a move (plain `mv`, committed or not) and before the commit that should leave no
stale reference; each later move runs it with its own base. Exit 0: no stale reference in a live file; 1: some (each
listed with its new path); 2: bad arguments.

The moves. --git <base>: the renames git finds from <base> to HEAD (its rename detection, -M50%), plus the moves not
committed yet: a file of HEAD missing on disk whose exact bytes now sit at a path HEAD lacks. A folder counts as moved
when it is gone and all its files moved with one prefix change (then citing the folder counts too). --moves <list>:
lines "old new", "old -> new" or "old<TAB>new", repo-relative, a folder allowed (its files are the ones now under the
new folder); or JSON: [[old, new], ...], {"old": "new", ...}, or [{"old": ..., "new": ...}, ...].

A reference is a path-like token in a text file git tracks or would track (.md .py .sh .mjs .js .ts .tsx .json and
more; also 'a', 'b' and "a" / "b" joins in code) that resolves to an old path. Bases, in order: the citing file's
folder, video/docs/ (docs cite each other bare), context/workflows/, the parent folders, video/, the repo root; the
first base where the path exists unmoved wins, and a folder counts only from video/ or the root. A bare file name or a
partial path ("scenes/x.tsx") counts only when one file in the repo matches it and no folder cited in the same block
holds it ("in `docs/look/`: `CRAFT.md`" is fine).

Each reference is then:
  history    the citing file is a record and keeps the paths of its day: context/ (agent_reports, conversation,
             summaries, scratchpad_tools, uploads, workflows; not workflows/INDEX.md), video/docs/retro/, a closed
             film's docs (video/docs/v1/, video/docs/v3/), anything under an archive/ folder, and --history PREFIX.
  annotated  its block (the paragraph; a list item with its parents' and the list's lead-in lines; a table row; a code
             block; in code, the run of non-blank lines) or the file's banner (a blockquote at the top of a doc, a code
             file's header) names where the file went (its new path or a folder holding it, e.g. `archive/v1/`), or
             its block names a commit or tag at which the old path exists (e.g. `76c166c1`).
  kept       in the known list as `keep`: deliberate (a never-import rule, data provenance, a tool's history note).
  deferred   in the known list as `todo`: a fix planned for later, printed on every run as a reminder.
  stale      none of the above: fix the path, add a note that says where the file went, or list it as known.

The known list (default: linkcheck_known.tsv beside this script): one reference rule per line, tab-separated:
file glob, old path or folder (repo-relative), keep or todo, why. Lines starting with # are comments. Entries whose old
path moved in this run but match nothing are reported, so the list shrinks as the fixes land.
"""
from __future__ import annotations

import argparse
import ast
import fnmatch
import json
import os
import re
import subprocess
import sys
from collections import defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
TEXT = ('.md', '.txt', '.py', '.sh', '.mjs', '.cjs', '.js', '.ts', '.tsx', '.json', '.html', '.css', '.yml', '.yaml',
        '.toml')
SKIP = ('node_modules/',)
HISTORY = ('context/agent_reports/', 'context/conversation/', 'context/summaries/', 'context/scratchpad_tools/',
           'context/uploads/', 'context/workflows/', 'video/docs/retro/', 'video/docs/v1/', 'video/docs/v3/')
LIVE_RECORDS = ('context/workflows/INDEX.md',)  # live files inside a history folder
TOK = re.compile(r'[A-Za-z0-9_./~${}*<>\-]+')
QJOIN = re.compile(r"""(?:'[^'\n]*'|"[^"\n]*")(?:\s*[,/]\s*(?:'[^'\n]*'|"[^"\n]*"))+""")
QPART = re.compile(r"""'([^'\n]*)'|"([^"\n]*)\"""")
TEMPLATE = re.compile(r'\$\{|<|\*|NN|\{')
LINK = re.compile(r'\]\(([^)\s]+)\)')
HEX = re.compile(r'^[0-9a-f]{7,40}$')
ITEM = re.compile(r'^(\s*)(?:[-*+]|\d+[.)])\s+')
FENCE = re.compile(r'^\s*(```|~~~)')
ROOT = ''


def die(msg):
    print(f'linkcheck: {msg}', file=sys.stderr)
    sys.exit(2)


def git(*args, inp=None, check=True):
    r = subprocess.run(['git', *args], cwd=ROOT or HERE, capture_output=True, text=True, input=inp)
    if check and r.returncode:
        die(f'git {" ".join(args)} failed: {r.stderr.strip()}')
    return r.stdout


def exists(p):
    return os.path.lexists(os.path.join(ROOT, p)) if p else True


def tree(rev):
    """{path: blob} of a commit."""
    out = {}
    for ln in git('ls-tree', '-r', '-z', rev).split('\0'):
        if ln:
            meta, path = ln.split('\t', 1)
            _, typ, blob = meta.split()
            if typ == 'blob':
                out[path] = blob
    return out


# ------------------------------------------------------------------------------------------------ the moves
def moves_from_git(base):
    if git('rev-parse', '--verify', '--quiet', base + '^{commit}', check=False).strip() == '':
        die(f'{base!r} is not a commit here')
    pairs = {}
    parts = git('diff', '-M', '--name-status', '-z', '--diff-filter=R', base, 'HEAD').split('\0')
    i = 0
    while i + 2 < len(parts):
        if parts[i].startswith('R'):
            pairs[parts[i + 1]] = parts[i + 2]
            i += 3
        else:
            i += 1
    head = tree('HEAD')
    gone = [p for p in head if not exists(p)]
    if gone:  # moved on disk, not committed yet: match the bytes
        cand = [p for p in git('ls-files', '-co', '--exclude-standard', '-z').split('\0')
                if p and p not in head and os.path.isfile(os.path.join(ROOT, p))]
        by_blob = defaultdict(list)
        if cand:
            for p, h in zip(cand, git('hash-object', '--stdin-paths', inp='\n'.join(cand) + '\n').split()):
                by_blob[h].append(p)
        for p in gone:
            hits = by_blob.get(head[p], [])
            if len(hits) > 1:
                hits = [h for h in hits if os.path.basename(h) == os.path.basename(p)]
            if len(hits) == 1:
                pairs[p] = hits[0]
    for old in list(pairs):  # a committed rename a->b then b moved on disk: a->c (and b->c)
        new, seen = pairs[old], {old}
        while new in pairs and new not in seen:
            seen.add(new)
            new = pairs[new]
        pairs[old] = new
    known_files = set(tree(base)) | set(head)
    return pairs, infer_dirs(pairs, known_files)


def infer_dirs(pairs, known_files):
    """{old folder: new folder} for each gone folder whose files all moved with one prefix change."""
    cand, clash = {}, set()
    for old, new in pairs.items():
        o, n = old.split('/'), new.split('/')
        s = 0
        while s < min(len(o), len(n)) and o[-1 - s] == n[-1 - s]:
            s += 1
        for j in range(1, s + 1):
            if len(o) - j < 1 or len(n) - j < 1:
                break
            od, nd = '/'.join(o[:len(o) - j]), '/'.join(n[:len(n) - j])
            if cand.get(od, nd) != nd:
                clash.add(od)
            cand[od] = nd
    under = defaultdict(list)
    for f in known_files:
        d = os.path.dirname(f)
        while d:
            under[d].append(f)
            d = os.path.dirname(d)
    dirs = {}
    for od, nd in cand.items():
        if od in clash or exists(od) or not under.get(od):
            continue
        if all(pairs.get(f) == nd + f[len(od):] or exists(nd + f[len(od):]) for f in under[od]):
            dirs[od] = nd
    return dirs


def moves_from_list(path):
    raw = open(path, encoding='utf-8').read()
    pairs = []
    try:
        data = json.loads(raw)
    except ValueError:
        data = None
    if isinstance(data, dict):
        pairs = list(data.items())
    elif isinstance(data, list):
        for m in data:
            if isinstance(m, (list, tuple)) and len(m) == 2:
                pairs.append((m[0], m[1]))
            elif isinstance(m, dict):
                pairs.append((m['old'], m['new']))
    else:
        for ln in raw.splitlines():
            ln = ln.strip()
            if not ln or ln.startswith('#'):
                continue
            a = re.split(r'\s*->\s*|\t+|\s+', ln, maxsplit=1)
            if len(a) == 2:
                pairs.append((a[0], a[1]))
    files, dirs = {}, {}
    for old, new in pairs:
        old, new = old.strip('/'), new.strip('/')
        if os.path.isdir(os.path.join(ROOT, new)):
            dirs[old] = new
            for d, _, fs in os.walk(os.path.join(ROOT, new)):
                for f in fs:
                    rel = os.path.relpath(os.path.join(d, f), ROOT)
                    files[old + rel[len(new):]] = rel
        else:
            if not exists(new):
                print(f'linkcheck: warning: {new} does not exist (moves list)', file=sys.stderr)
            files[old] = new
    return files, dirs


# ------------------------------------------------------------------------------------------------ the scan
class World:
    """The repo before the moves (where citations were written) and now (where notes point)."""

    def __init__(self, files, dirs):
        self.files, self.dirs = files, dirs
        self.now = [p for p in git('ls-files', '-co', '--exclude-standard', '-z').split('\0') if p and exists(p)]
        back = {v: k for k, v in files.items()}
        self.back = back
        self.pre = set(back.get(p, p) for p in self.now) | set(files)
        self.by_base = defaultdict(set)
        self.suffix = defaultdict(set)
        self.pre_dirs = set()
        for p in self.pre:
            self.by_base[os.path.basename(p)].add(p)
            parts = p.split('/')
            for k in range(1, len(parts)):
                self.suffix['/'.join(parts[k:])].add(p)
            d = os.path.dirname(p)
            while d:
                self.pre_dirs.add(d)
                d = os.path.dirname(d)


def norm(p):
    p = os.path.normpath(p)
    return '' if p == '.' else p


def clean(tok):
    t = tok.strip('`\'"()[],;:')
    t = re.sub(r'\.+$', '', t) if not t.endswith(('..', '/.')) else t
    t = t.rstrip(')')
    prefix = ROOT.rstrip('/') + '/'
    return t[len(prefix):] if t.startswith(prefix) else t


def bases(fdir, explicit):
    if explicit:
        return [fdir + '/' if fdir else '']
    out = [fdir + '/' if fdir else '']
    anc = fdir
    while anc:
        anc = os.path.dirname(anc)
        out.append(anc + '/' if anc else '')
    if fdir.startswith('video/docs'):
        out.insert(1, 'video/docs/')
    if fdir.startswith('context'):
        out.insert(1, 'context/workflows/')
    out += ['video/', '']
    seen, res = set(), []
    for b in out:
        if b not in seen:
            seen.add(b)
            res.append(b)
    return res


def resolve(w, tok, fdir, link, cdir=None):
    """-> (old, new, kind) when the token names a moved path, else None. fdir: the citing file's folder before the
    moves (relative citations resolve from there); cdir: its folder now."""
    t = clean(tok)
    if not t or len(t) < 3 or t.startswith('/'):
        return None
    lit = t
    m = TEMPLATE.search(t)
    templated = bool(m)
    if templated:
        lit = t[:m.start()]
        if '/' not in lit:
            return None
        lit = lit[:lit.rfind('/') + 1]
    explicit = t.startswith(('./', '../')) or link
    has_slash = '/' in lit.strip('/')
    if not has_slash and not templated and not explicit:
        cands = w.by_base.get(os.path.basename(lit.rstrip('/')), set())
        if len(cands) == 1:
            (only,) = cands
            here = fdir if cdir is None else cdir  # the name still works where it is cited (both moved together)?
            if only in w.files and w.files[only] != (here + '/' if here else '') + os.path.basename(lit.rstrip('/')):
                return only, w.files[only], 'bare'
        return None
    for b in bases(fdir, explicit):
        c = norm(b + lit)
        if not c:
            continue
        cd = c.rstrip('/')
        if cd in w.files:
            return cd, w.files[cd], 'exact'
        if explicit or b in ('', 'video/'):
            if cd in w.dirs:
                return cd, w.dirs[cd], 'dir'
            for d, nd in w.dirs.items():
                if cd.startswith(d + '/'):
                    return cd, nd + cd[len(d):], 'template' if templated else 'under'
        if cd in w.pre or cd in w.pre_dirs:
            return None
    if not templated and not explicit and has_slash and not lit.endswith('/'):
        hits = w.suffix.get(lit.lstrip('./'))
        if hits is not None and len(hits) == 1:
            (only,) = hits
            if only in w.files:
                return only, w.files[only], 'suffix'
    return None


def tokens(line):
    toks = [m.group(0) for m in TOK.finditer(line)]
    for qj in QJOIN.finditer(line):  # os.path.join(ROOT, 'audio', 'cues.json'); ROOT / "audio" / "cues.json"
        toks.append('/'.join(a or b for a, b in QPART.findall(qj.group(0))))
    return toks


def now_paths(tok, fdir):
    """Existing paths (today's tree) a token names, from the usual bases and video/docs/ (doc indexes cite from it)."""
    t = clean(tok)
    if not t or t.startswith('/') or TEMPLATE.search(t) or '/' not in t.strip('/'):
        return []
    out = []
    explicit = t.startswith(('./', '../'))
    for b in bases(fdir, explicit) + ([] if explicit else ['video/docs/']):
        c = norm(b + t)
        if c and exists(c):
            out.append(c.rstrip('/'))
    return out


# ------------------------------------------------------------------------------------------------ blocks and banners
def md_scopes(lines):
    """Per line: the line indexes whose text can annotate it."""
    n = len(lines)
    scope = [None] * n
    i = 0
    while i < n:
        m = FENCE.match(lines[i])
        if m:
            j = i + 1
            while j < n and not lines[j].lstrip().startswith(m.group(1)):
                j += 1
            rng = frozenset(range(i, min(j, n - 1) + 1))
            for k in rng:
                scope[k] = rng
            i = j + 1
        else:
            i += 1
    i = 0
    while i < n:
        if scope[i] is not None or not lines[i].strip():
            i += 1
            continue
        j = i
        while j < n and scope[j] is None and lines[j].strip():
            j += 1
        md_run(lines, list(range(i, j)), scope)
        i = j
    return scope


def indent(s):
    return len(s) - len(s.lstrip(' '))


def md_run(lines, run, scope):
    items = [k for k in run if ITEM.match(lines[k]) and not lines[k].lstrip().startswith('|')]
    if not items:
        for k in run:
            scope[k] = frozenset([k]) if lines[k].lstrip().startswith('|') else frozenset(run)
        return
    lead = [k for k in run if k < items[0]]

    def own(m):  # an item's own lines: up to the next item marker
        out = [m]
        for k in run:
            if k > m:
                if k in items:
                    break
                out.append(k)
        return out

    def item_of(k):
        for m in reversed([x for x in items if x <= k]):
            if m == k or indent(lines[m]) < indent(lines[k]) or not lines[k].startswith(' '):
                return m
        return None

    for k in run:
        if lines[k].lstrip().startswith('|'):
            scope[k] = frozenset([k])
            continue
        if k in lead:
            scope[k] = frozenset(lead)
            continue
        m = item_of(k)
        s = set(lead)
        while m is not None:
            s.update(own(m))
            parent = None
            for p in reversed([x for x in items if x < m]):
                if indent(lines[p]) < indent(lines[m]):
                    parent = p
                    break
            m = parent
        scope[k] = frozenset(s)


def code_scopes(lines):
    n = len(lines)
    scope = [None] * n
    i = 0
    while i < n:
        if not lines[i].strip():
            scope[i] = frozenset([i])
            i += 1
            continue
        j = i
        while j < n and lines[j].strip():
            j += 1
        rng = frozenset(range(i, j))
        for k in rng:
            scope[k] = rng
        i = j
    return scope


def banner(path, text, lines):
    if path.endswith('.md'):
        for i, ln in enumerate(lines[:15]):
            if ln.startswith('>'):
                j = i
                while j < len(lines) and lines[j].startswith('>'):
                    j += 1
                return frozenset(range(i, j))
        return frozenset()
    if path.endswith('.py'):
        try:
            body = ast.parse(text).body
            if body and isinstance(body[0], ast.Expr) and isinstance(getattr(body[0], 'value', None), ast.Constant) \
                    and isinstance(body[0].value.value, str):
                return frozenset(range(body[0].lineno - 1, body[0].end_lineno))
        except (SyntaxError, ValueError):
            pass
    out = []
    for i, ln in enumerate(lines[:60]):
        s = ln.strip()
        if i == 0 and s.startswith('#!'):
            continue
        if s.startswith(('//', '#', '/*', '*')):
            out.append(i)
        elif s or out:
            break
    return frozenset(out)


# ------------------------------------------------------------------------------------------------ classify
def is_history(path, extra):
    if path in LIVE_RECORDS:
        return False
    return path.startswith(HISTORY + tuple(extra)) or '/archive/' in '/' + path


def load_known(path):
    rules = []
    if not path or not os.path.exists(path):
        return rules
    for n, ln in enumerate(open(path, encoding='utf-8'), 1):
        if not ln.strip() or ln.startswith('#'):
            continue
        f = ln.rstrip('\n').split('\t')
        if len(f) < 3 or f[2] not in ('keep', 'todo'):
            die(f'{path}:{n}: want "file-glob<TAB>old<TAB>keep|todo<TAB>why"')
        rules.append({'glob': f[0], 'old': f[1].strip('/'), 'kind': f[2], 'why': f[3] if len(f) > 3 else '',
                      'line': n, 'hits': 0})
    return rules


class Pointers:
    """Does a set of lines name where a moved file went (or a commit holding its old path)?"""

    def __init__(self):
        self.tags = set(git('tag', '-l').split())
        self.cache = {}

    def at_rev(self, rev, old):
        k = (rev, old)
        if k not in self.cache:
            self.cache[k] = subprocess.run(['git', 'cat-file', '-e', f'{rev}:{old}'], cwd=ROOT,
                                           capture_output=True).returncode == 0
        return self.cache[k]

    def named(self, toks, fdir, old, new, revs=True):
        for tok in toks:
            t = clean(tok)
            if HEX.match(t) or t in self.tags:
                if revs and self.at_rev(t, old):
                    return True
                continue
            for p in now_paths(tok, fdir):
                if (new == p or new.startswith(p + '/')) and not (old == p or old.startswith(p + '/')):
                    return True
        return False


def scan(w, args, known):
    ptr = Pointers()
    refs = []
    for rel in sorted(w.now):
        if rel.startswith(SKIP) or '/node_modules/' in rel or not rel.endswith(TEXT):
            continue
        if args.only and not rel.startswith(tuple(args.only)):
            continue
        p = os.path.join(ROOT, rel)
        try:
            if os.path.getsize(p) > 3_000_000:
                continue
            text = open(p, encoding='utf-8', errors='replace').read()
        except OSError:
            continue
        lines = [ln[:4000] for ln in text.split('\n')]
        fdir = os.path.dirname(w.back.get(rel, rel))  # relative citations resolve from where the file was
        hist = is_history(rel, args.history)
        scopes = ban = None
        found = []
        for i, line in enumerate(lines):
            links = set(LINK.findall(line))
            seen = set()
            for tok in tokens(line):
                r = resolve(w, tok, fdir, tok in links, os.path.dirname(rel))
                if r and (r[0], tok) not in seen:
                    seen.add((r[0], tok))
                    found.append((i, tok, r))
        if not found:
            continue
        if not hist:
            scopes = md_scopes(lines) if rel.endswith('.md') else code_scopes(lines)
            ban = banner(rel, text, lines)
        toks_of = {}
        for i, tok, (old, new, kind) in found:
            ref = {'file': rel, 'line': i + 1, 'token': clean(tok), 'old': old, 'new': new, 'kind': kind,
                   'text': lines[i].strip()[:300]}
            if hist:
                ref['cat'] = 'history'
                refs.append(ref)
                continue
            sc = scopes[i] | ban
            for key in (sc, scopes[i], ban):
                if key not in toks_of:
                    toks_of[key] = [t for k in sorted(key) for t in tokens(lines[k])]
            st = toks_of[sc]
            if kind in ('bare', 'suffix'):  # "in `docs/look/`: `CRAFT.md`": a folder cited in the block holds it
                lit = clean(tok)
                folders = set()
                for t in st:
                    for q in now_paths(t, fdir):
                        folders.add(q if os.path.isdir(os.path.join(ROOT, q)) else os.path.dirname(q))
                if any(exists(f + '/' + lit) for f in folders if f):
                    continue
            rule = next((k for k in known if fnmatch.fnmatch(rel, k['glob'])
                         and (old == k['old'] or old.startswith(k['old'] + '/'))), None)
            # a commit counts in the reference's own block only: a banner's commit holds every pre-move path
            if ptr.named(toks_of[scopes[i]], fdir, old, new) or ptr.named(toks_of[ban], fdir, old, new, revs=False):
                ref['cat'] = 'annotated'
            elif rule:
                rule['hits'] += 1
                ref['cat'] = 'kept' if rule['kind'] == 'keep' else 'deferred'
                ref['why'] = rule['why']
            else:
                ref['cat'] = 'stale'
            refs.append(ref)
    return refs


def show(path):
    return path[len('video/'):] if path.startswith('video/') else path


def main(argv=None):
    global ROOT
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    src = ap.add_mutually_exclusive_group(required=True)
    src.add_argument('--git', metavar='BASE', help='the moves: renames from BASE to HEAD, plus uncommitted moves')
    src.add_argument('--moves', metavar='LIST', help='the moves from a list file (text or JSON)')
    ap.add_argument('--known', default=os.path.join(HERE, 'linkcheck_known.tsv'), help='the known list (TSV)')
    ap.add_argument('--history', action='append', default=[], metavar='PREFIX', help='more record folders')
    ap.add_argument('--only', action='append', default=[], metavar='PREFIX', help='scan only files under PREFIX')
    ap.add_argument('--all', action='store_true', help='also list the annotated, kept and deferred references')
    ap.add_argument('--json', metavar='OUT', help='write every reference (with its class) as JSON')
    args = ap.parse_args(argv)
    ROOT = git('rev-parse', '--show-toplevel').strip()
    if args.git:
        files, dirs = moves_from_git(args.git)
        origin = f'git renames since {args.git}'
    else:
        files, dirs = moves_from_list(os.path.abspath(args.moves))
        origin = args.moves
    if not files:
        print(f'linkcheck: no moves found ({origin})')
        return 0
    known = load_known(args.known)
    w = World(files, dirs)
    refs = scan(w, args, known)
    by = defaultdict(list)
    for r in refs:
        by[r['cat']].append(r)
    print(f'linkcheck: {len(files)} moved files ({len(dirs)} folders) from {origin}; '
          f'{len(refs)} references to an old path')
    blurb = {'history': 'records, left as they are', 'annotated': 'a note says where the file went',
             'kept': 'known list: deliberate', 'deferred': 'known list: to fix later', 'stale': 'to fix'}
    for cat in ('history', 'annotated', 'kept', 'deferred', 'stale'):
        rs = by.get(cat, [])
        print(f'  {cat:<9} {len(rs):>5} in {len(set(r["file"] for r in rs)):>3} files  ({blurb[cat]})')
    listed = ('stale', 'deferred') + (('annotated', 'kept') if args.all else ())
    for cat in listed:
        rs = by.get(cat, [])
        if not rs:
            continue
        print(f'\n{cat}:')
        groups = defaultdict(list)  # kept / deferred: each reason once
        for r in rs:
            groups[r.get('why', '')].append(r)
        for why, grp in groups.items():
            if why:
                print(f'  ({why})')
            for r in grp:
                print(f'  {r["file"]}:{r["line"]}: `{r["token"]}` -> {show(r["new"])}')
    moved_now = set(files) | set(dirs)
    unused = [k for k in known if not k['hits'] and (k['old'] in moved_now or any(f.startswith(k['old'] + '/')
                                                                                  for f in files))]
    if unused and not args.only:
        print('\nknown-list entries that match nothing now (remove them):')
        for k in unused:
            print(f'  line {k["line"]}: {k["glob"]}  {k["old"]}  ({k["kind"]})')
    if args.json:
        json.dump({'moves': files, 'folders': dirs, 'refs': refs}, open(args.json, 'w'), indent=1)
    return 1 if by.get('stale') else 0


if __name__ == '__main__':
    sys.exit(main())
