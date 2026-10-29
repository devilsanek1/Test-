#!/usr/bin/env python3
"""Spend meter for Claude Code sessions: the orchestrator and its agents, per agent, role, film and gate.

v2 (2026-10-29, streamlining plan Phase 1 item 1; `2026-10-28_streamline/phase1_meter.md`). v1 (2026-10-25) summed
`usage` on every transcript line, but Claude Code writes one line per content block and repeats the API call's usage on
each, so v1 over-counted about 2.4x (its record: `spend_out.txt`). v2 counts each API call once (message.id +
requestId), and checks itself against the session's own meters.

Usage (UTC times; read-only unless --save):
  python3 video/docs/retro/spend.py                   # this session ($CLAUDE_CODE_SESSION_ID) + its agents
  python3 video/docs/retro/spend.py PATH [PATH ...]   # a session folder, its .jsonl, or a project folder
      --since 2026-10-28T14:20 --until 18:00:00Z      # a window (an ISO time, or 90m / 2h / 1d ago)
      --film v4                                       # agents labelled v4 + the orchestrator's v4 share
      --rates doc                                     # price at 2026-10-28_v4_early_stage_cost.md's rates
      --agents 0                                      # hide the per-agent table (N: show the top N by $)
      --save [--out DIR]                              # also write spend_<session>.txt and .json (default: here)
      --json                                          # print the JSON instead of the text report

What counts. A call is one API request: the orchestrator's and each agent's are deduplicated by message.id +
requestId (the usage is identical on every line of a call). Its context = input + cache read + cache write tokens.
Agents are the Agent tool's (`<session>/subagents/agent-*.jsonl`, labelled by `.meta.json`) and workflow agents
(`subagents/workflows/<run>/`, labelled by `journal.jsonl`). Not in any transcript, so not in the tables: the WebSearch
and WebFetch side calls (on Haiku), the auto-compaction calls, and helper sessions (other cloud sessions: measure
them in their own container). The "Meter check" section prices those gaps from the session's own meters.

Labels drive the grouping: film = "vN" in the label; gate = an explicit "G<n>" in the label (or the workflow's name),
else a keyword guess; role = a keyword guess. Label agents "vN G<n> role: what" (e.g. "v4 G1 critic: cold retell")
and both are exact. Each orchestrator call goes to the film and gate of the agent it started last.
"""
import argparse
import bisect
import datetime as dt
import glob
import json
import os
import re
import statistics
import sys
from collections import Counter, defaultdict

HERE = os.path.dirname(os.path.abspath(__file__))
PROJECTS = os.path.expanduser('~/.claude/projects')
# The session that fixed the meter (lane M's brief): the default when $CLAUDE_CODE_SESSION_ID names no transcript here.
DEFAULT_SESSION = '/root/.claude/projects/-home-user-Test-/d840f028-589b-5942-b9b9-36d752145af8'

# $ per million tokens. 'meter': Claude Code's own cost tracker, fitted with zero residual to this session's ten
# distinct cost-state snapshots (2026-10-27..28): Opus 5.5 input 4, output 20, cache read 0.20, cache write 5 (5-minute
# cache, the agents') or 8 (1-hour cache, the orchestrator's); Haiku 5.5 input 0.10, output 0.50 (its cache rates are
# the same ratios, unmeasured). 'doc': the rates implied in 2026-10-28_v4_early_stage_cost.md (standard ratios fitted
# to one meter reading: cache reads 55 % too high, 1-hour cache writes 52 % too low; 3-14 % low on a total).
RATES = {
    'meter': {
        'claude-opus-5-5': dict(inp=4.0, out=20.0, cr=0.20, cw5m=5.0, cw1h=8.0),
        'claude-haiku-5-5': dict(inp=0.10, out=0.50, cr=0.005, cw5m=0.125, cw1h=0.20),
    },
    'doc': {'*': dict(inp=3.07, out=15.35, cr=0.31, cw5m=3.84, cw1h=3.84)},
}
FIELDS = ('inp', 'cr', 'cw5m', 'cw1h', 'out')

ROLE_RULES = [  # first match wins (lower-case label)
    ('review', r'review|critic|sceptic|skeptic|judge|panel|\bpersonas?\b|cold|audit|lens|viewer'),
    ('verify', r'verif|truth.?check|fact.?check'),
    ('fix', r'\bfix'),
    ('research', r'research|scout|fact.?lock|search'),
    ('write', r'writer|\bwrite|editor|script|spine|synth|merge|\bline'),
    ('build', r'build|\bown\b|kit|\bsets?\b|props|scene|sound|hook|\bcut|edge|render|lane|engine|anim|look|integrat'),
]
GATE_RULES = [  # used only when the label (or workflow name) names no gate; first match wins
    ('process', r'streamline|phase \d|retro|\bmeter\b|codebase|hygiene'),
    ('G0.5', r'core.?line|fact.?lock|truth.?check|research|viewer panel|\bpersonas?\b|sceptic'),
    ('G0', r'scout|topic'),
    ('G1', r'script|writer|spine|hook line|story'),
    ('G2', r'voice|\btake\b|elevenlabs'),
    ('G3', r'animatic|storyboard|sketch|\bboard'),
    ('G4', r'look clip|look test|art director'),
    ('G5', r'blocking|\blane\b|build|scene'),
    ('G6', r'polish|assembly|integrat'),
    ('G7', r'sound|\bmix\b|sfx|master'),
    ('G8', r'cover|posting|publish'),
]


# ---------------------------------------------------------------- time
def parse_time(s, now=None):
    """An ISO time (UTC unless it says otherwise), 'HH:MM[:SS]' today, or '90m' / '2h' / '1d' ago."""
    if s is None:
        return None
    now = now or dt.datetime.now(dt.timezone.utc)
    m = re.fullmatch(r'\s*(\d+(?:\.\d+)?)\s*([mhd])\s*', s)
    if m:
        n, u = float(m.group(1)), m.group(2)
        return now - dt.timedelta(minutes=n) * {'m': 1, 'h': 60, 'd': 1440}[u]
    t = s.strip().replace(' ', 'T')
    if re.fullmatch(r'\d\d:\d\d(:\d\d)?Z?', t):
        t = now.strftime('%Y-%m-%dT') + t
    t = t.replace('Z', '+00:00')
    d = dt.datetime.fromisoformat(t)
    return d if d.tzinfo else d.replace(tzinfo=dt.timezone.utc)


def ts_of(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00')) if s else None


def hm(d):
    return d.strftime('%m-%d %H:%M') if d else '-'


# ---------------------------------------------------------------- labels
def film_of(label, wf=''):
    m = re.search(r'\bv(\d+)r?\b', f'{label} {wf}', re.I)
    return f'v{m.group(1)}' if m else '-'


def gate_of(label, wf=''):
    m = re.search(r'\bG(\d+(?:\.\d)?[a-z]?)\b', label or '')
    if m:
        return 'G' + m.group(1)
    m = re.search(r'(?:^|[-_/])g(\d{1,2})([a-z]?)(?=[-_.]|$)', (wf or '').lower())
    if m:
        d = m.group(1)
        return ('G0.5' if d == '05' else 'G' + d) + m.group(2)
    low = (label or '').lower()
    for gate, rx in GATE_RULES:
        if re.search(rx, low):
            return gate
    return '?'


def role_of(label):
    low = (label or '').lower()
    for role, rx in ROLE_RULES:
        if re.search(rx, low):
            return role
    return 'other'


# ---------------------------------------------------------------- transcripts
TS_RX = re.compile(r'"timestamp":"([^"]+)"')
READING_KEYS = ('cache_read_tokens', 'cache_write_tokens', 'cost_usd', 'input_tokens', 'output_tokens')


def count_images(node):
    n = 0
    if isinstance(node, list):
        for x in node:
            n += count_images(x)
    elif isinstance(node, dict):
        if node.get('type') == 'image':
            n += 1
        for k in ('content', 'attachment', 'message'):
            if k in node:
                n += count_images(node[k])
    return n


def tool_result_text(block):
    c = block.get('content')
    if isinstance(c, list):
        return ''.join(x.get('text', '') for x in c if isinstance(x, dict))
    return c if isinstance(c, str) else ''


def parse_transcript(path):
    """One transcript: its deduplicated calls and counters (plus, for an orchestrator, the session's meter records)."""
    calls = {}
    out = dict(path=path, lines_with_usage=0, line_sum=Counter(), images=0, image_ts=[], tools=Counter(), doc_reads=0,
               doc_read_bytes=0, doc_read_log=[], first_ts=None, last_ts=None, limit_hit=False, snapshots=[], readings=[],
               compactions=[])
    pending, gs_ids = {}, set()
    last_seen = None
    try:
        f = open(path, errors='replace')
    except OSError:
        return out, []
    with f:
        for lineno, line in enumerate(f):
            m = TS_RX.search(line)
            if m:
                last_seen = m.group(1)
                out['first_ts'] = out['first_ts'] or last_seen
                out['last_ts'] = last_seen
            want = (('"type":"assistant"' in line and '"usage"' in line) or '"type":"image"' in line
                    or '"type":"cost-state"' in line or '"compact_boundary"' in line
                    or ((pending or gs_ids) and '"tool_result"' in line
                        and any(i in line for i in list(pending) + list(gs_ids))))
            if not want:
                continue
            try:
                e = json.loads(line)
            except ValueError:
                continue
            kind = e.get('type')
            if kind == 'assistant':
                msg = e.get('message') or {}
                u = msg.get('usage')
                model = msg.get('model') or '?'
                if not isinstance(u, dict):
                    continue
                if model == '<synthetic>':  # e.g. "You've hit your 5-hour limit": no API call
                    text = ' '.join(b.get('text', '') for b in msg.get('content') or [] if isinstance(b, dict))
                    out['limit_hit'] = 'limit' in text.lower()
                    continue
                out['limit_hit'] = False
                out['lines_with_usage'] += 1
                cc = u.get('cache_creation') or {}
                cw = int(u.get('cache_creation_input_tokens') or 0)
                cw1h = int(cc.get('ephemeral_1h_input_tokens') or 0)
                row = dict(inp=int(u.get('input_tokens') or 0), cr=int(u.get('cache_read_input_tokens') or 0),
                           cw5m=cw - cw1h, cw1h=cw1h, out=int(u.get('output_tokens') or 0))
                for k, v in row.items():
                    out['line_sum'][k] += v
                key = (msg.get('id'), e.get('requestId'))
                if key == (None, None):
                    key = ('line', lineno)
                c = calls.get(key)
                if c is None:
                    c = calls[key] = dict(ts=e.get('timestamp') or last_seen, model=model, tools=0, web=0,
                                          key=key if key[0] != 'line' else (path, lineno), **row)
                else:  # the same call on another content-block line: keep the largest figure of each field
                    for k, v in row.items():
                        c[k] = max(c[k], v)
                for b in msg.get('content') or []:
                    if isinstance(b, dict) and b.get('type') == 'tool_use':
                        name = b.get('name') or '?'
                        inp = b.get('input') or {}
                        out['tools'][name] += 1
                        c['tools'] += 1
                        c['web'] += name in ('WebSearch', 'WebFetch')
                        fp = str(inp.get('file_path', ''))
                        if name == 'Read' and '/docs/' in fp and fp.endswith('.md'):
                            pending[b.get('id')] = fp
                        if name.endswith('__get_session') and not inp.get('session_id'):  # this session's meter
                            gs_ids.add(b.get('id'))
            elif kind in ('user', 'attachment'):
                n_img = count_images(e.get('message') or e.get('attachment') or {})
                out['images'] += n_img
                out['image_ts'] += [e.get('timestamp') or last_seen] * n_img
                content = (e.get('message') or {}).get('content')
                for b in content if isinstance(content, list) else []:
                    if not (isinstance(b, dict) and b.get('type') == 'tool_result'):
                        continue
                    tid = b.get('tool_use_id')
                    if tid in pending:
                        out['doc_read_log'].append((e.get('timestamp') or last_seen, len(tool_result_text(b))))
                        out['doc_reads'] += 1
                        out['doc_read_bytes'] += out['doc_read_log'][-1][1]
                        pending.pop(tid, None)
                    elif tid in gs_ids:  # a get_session result: the server's meter for this session
                        gs_ids.discard(tid)
                        try:
                            d = json.loads(tool_result_text(b))
                            usage = ((d.get('ccr') or d).get('external_metadata') or {}).get('usage') or {}
                        except (ValueError, AttributeError):
                            continue
                        if all(k in usage for k in READING_KEYS):
                            out['readings'].append(dict(ts=e.get('timestamp') or last_seen,
                                                        **{k: float(usage[k]) for k in READING_KEYS}))
            elif kind == 'cost-state':  # Claude Code's own cost tracker, saved when its worker stops
                out['snapshots'].append(dict(ts=last_seen, total=e.get('totalCostUSD'), models=e.get('modelUsage') or {}))
            elif kind == 'system' and e.get('subtype') == 'compact_boundary':
                cm = e.get('compactMetadata') or {}
                out['compactions'].append(dict(ts=e.get('timestamp'), trigger=cm.get('trigger'),
                                               pre_tokens=cm.get('preTokens')))
    rows = sorted(calls.values(), key=lambda c: c['ts'] or '')
    return out, rows


def resolve_sessions(paths):
    """Each path -> sessions [{sid, main (orchestrator .jsonl or None), folder (or None)}]."""
    sessions = []
    for p in paths:
        p = os.path.abspath(os.path.expanduser(p)).rstrip('/')
        if p.endswith('.jsonl') and os.path.isfile(p) and os.path.basename(p).startswith('agent-'):  # one agent
            parts = p.split(os.sep)
            sid = parts[parts.index('subagents') - 1] if 'subagents' in parts[:-1] else os.path.basename(p)[6:-6]
            sessions.append(dict(sid=sid, main=None, folder=None, files=[p]))
        elif p.endswith('.jsonl') and os.path.isfile(p):
            sessions.append(dict(sid=os.path.basename(p)[:-6], main=p, folder=p[:-6] if os.path.isdir(p[:-6]) else None))
        elif os.path.isdir(p) and (os.path.isfile(p + '.jsonl') or os.path.isdir(os.path.join(p, 'subagents'))):
            sessions.append(dict(sid=os.path.basename(p), main=p + '.jsonl' if os.path.isfile(p + '.jsonl') else None,
                                 folder=p))
        elif os.path.isdir(p) and glob.glob(os.path.join(p, '*.jsonl')):  # a project folder: every session in it
            for j in sorted(glob.glob(os.path.join(p, '*.jsonl'))):
                sessions += resolve_sessions([j])
        else:
            sys.exit(f'spend.py: no transcripts at {p}')
    out, seen = [], set()
    for s in sessions:  # a session named twice (its folder and its .jsonl) counts once
        key = (s['main'], s['folder'], tuple(s.get('files') or ()))
        if key not in seen:
            seen.add(key)
            out.append(s)
    return out


def default_paths():
    sid = os.environ.get('CLAUDE_CODE_SESSION_ID')
    if sid:
        hits = glob.glob(os.path.join(PROJECTS, '*', sid + '.jsonl'))
        if hits:
            return [hits[0][:-6]]
    return [DEFAULT_SESSION]


def agent_files(folder):
    """[(path, label, kind, workflow, meta)] for every agent transcript in a session folder."""
    out = []
    if not folder:
        return out
    sub = os.path.join(folder, 'subagents')
    labels, failed, wf_name = {}, set(), {}
    for j in glob.glob(os.path.join(sub, 'workflows', '*', 'journal.jsonl')):
        for line in open(j, errors='replace'):
            try:
                e = json.loads(line)
            except ValueError:
                continue
            if e.get('type') == 'started':
                labels[e.get('agentId')] = e.get('label') or ''
            elif e.get('type') == 'failed':
                failed.add(e.get('agentId'))
    for w in glob.glob(os.path.join(folder, 'workflows', '*.json')):
        try:
            d = json.load(open(w))
            wf_name[d.get('runId')] = os.path.basename(d.get('scriptPath') or '')
        except (OSError, ValueError):
            pass
    for path in sorted(glob.glob(os.path.join(sub, '**', 'agent-*.jsonl'), recursive=True)):
        aid = os.path.basename(path)[len('agent-'):-len('.jsonl')]
        meta = {}
        try:
            meta = json.load(open(path[:-len('.jsonl')] + '.meta.json'))
        except (OSError, ValueError):
            pass
        rel = os.path.relpath(path, sub).split(os.sep)
        if len(rel) >= 3 and rel[0] == 'workflows':
            run = rel[1]
            out.append((path, labels.get(aid, ''), 'workflow', wf_name.get(run, run), dict(meta, failed=aid in failed)))
        else:
            out.append((path, meta.get('description') or '', 'agent', '', meta))
    return out


def first_prompt(path, n=70):
    try:
        with open(path, errors='replace') as f:
            for line in f:
                e = json.loads(line)
                c = (e.get('message') or {}).get('content')
                if e.get('type') == 'user' and isinstance(c, str):
                    return '~' + ' '.join(c.split())[:n]
    except (OSError, ValueError):
        pass
    return ''


# ---------------------------------------------------------------- the meter
def price(c, rates):
    table = RATES[rates]
    r = table.get(c['model']) or table.get('*') or table['claude-opus-5-5']
    return sum(c[k] * r[k] for k in FIELDS) / 1e6


def load(paths=None, since=None, until=None, film=None, now=None):
    """Read the transcripts and return the meter: agents (the orchestrators first), calls, sessions' meter records."""
    now = now or dt.datetime.now(dt.timezone.utc)
    paths = paths or default_paths()
    t0, t1 = parse_time(since, now), parse_time(until, now)
    agents, sessions = [], []
    for s in resolve_sessions(paths):
        recs = []
        if s['main']:
            info, rows = parse_transcript(s["main"])
            recs.append(dict(id=s['sid'][:8], label=f'orchestrator {s["sid"][:8]}', kind='orchestrator', workflow='',
                             meta={}, info=info, rows=rows))
        singles = []
        for path in s.get('files') or []:
            try:
                meta = json.load(open(path[:-len('.jsonl')] + '.meta.json'))
            except (OSError, ValueError):
                meta = {}
            singles.append((path, meta.get('description') or '', 'agent', '', meta))
        for path, label, kind, wf, meta in agent_files(s['folder']) + singles:
            info, rows = parse_transcript(path)
            recs.append(dict(id=os.path.basename(path)[6:-6][:9], label=label or first_prompt(path), kind=kind,
                             workflow=wf, meta=meta, info=info, rows=rows))
        seen = set()  # a call copied into a second transcript (e.g. a forked agent's inherited history) counts once
        for r in recs:
            r['rows'] = [c for c in r['rows'] if not (c['key'] in seen or seen.add(c['key']))]
        for r in recs:
            r['session'] = s['sid']
            if r['kind'] == 'orchestrator':
                r.update(film='', gate='', role='orchestrate')
            else:
                r.update(film=film_of(r['label'], r['workflow']), gate=gate_of(r['label'], r['workflow']),
                         role=role_of(r['label']))
            r['start'] = r['rows'][0]['ts'] if r['rows'] else r['info']['first_ts']
            for c in r['rows']:
                c['t'] = ts_of(c['ts'])
                c['usd'] = price(c, 'meter')
                c['usd_doc'] = price(c, 'doc')
            r['status'] = status_of(r, now)
        # the orchestrator's calls go to the film and gate of the agent it started last
        starts = sorted((a['start'], a['film'], a['gate']) for a in recs if a['kind'] != 'orchestrator' and a['start'])
        keys = [x[0] for x in starts]
        for a in recs:
            if a['kind'] == 'orchestrator':
                for c in a['rows']:
                    i = bisect.bisect_right(keys, c['ts'] or '') - 1
                    c['film'], c['gate'] = (starts[i][1], starts[i][2]) if i >= 0 else ('-', 'start')
            else:
                for c in a['rows']:
                    c['film'], c['gate'] = a['film'], a['gate']
        sessions.append(dict(s, check=meter_check(recs)))
        agents += recs
    def inside(t):
        return (not t0 or (t and t >= t0)) and (not t1 or (t and t <= t1))

    for a in agents:  # the window and the film filter
        a['all_rows'] = a['rows']
        a['rows'] = [c for c in a['rows'] if inside(c['t']) and (not film or c['film'] == film)]
        a['images'] = sum(1 for x in a['info']['image_ts'] if inside(ts_of(x))) if a['rows'] else 0
        docs = [n for x, n in a['info']['doc_read_log'] if inside(ts_of(x))] if a['rows'] else []
        a['doc_reads'], a['doc_read_bytes'] = len(docs), sum(docs)
    return dict(now=now, paths=paths, since=t0, until=t1, film=film, agents=agents, sessions=sessions)


def status_of(a, now):
    if a['kind'] == 'orchestrator':
        return ''
    if a['meta'].get('failed'):
        return 'failed'
    if a['meta'].get('finished'):
        return 'done'
    if a['info']['limit_hit']:
        return 'limit'
    last = ts_of(a['info']['last_ts'])
    if last and now - last < dt.timedelta(minutes=15):
        return 'running'
    return 'stopped' if a['kind'] == 'agent' else ''


def stats(rows):
    s = Counter()
    for c in rows:
        for k in FIELDS:
            s[k] += c[k]
        s['usd'] += c['usd']
        s['usd_doc'] += c['usd_doc']
        s['tools'] += c.get('tools', 0)
        s['web'] += c.get('web', 0)
    s['calls'] = len(rows)
    s['cw'] = s['cw5m'] + s['cw1h']
    ctx = [c['inp'] + c['cr'] + c['cw5m'] + c['cw1h'] for c in rows]
    s['ctx_first'] = ctx[0] if ctx else 0
    s['ctx_mean'] = statistics.mean(ctx) if ctx else 0
    s['ctx_max'] = max(ctx) if ctx else 0
    return s


def meter_check(recs):
    """Compare the transcripts with the session's own meters: Claude Code's cost tracker (cost-state snapshots in the
    orchestrator's transcript) and the server's (get_session `usage`, as read by the orchestrator or an agent)."""
    orch = [a for a in recs if a['kind'] == 'orchestrator']
    if not orch:
        return {}
    rows = sorted((c for a in recs for c in a['rows']), key=lambda c: c['ts'] or '')
    keys = [c['ts'] or '' for c in rows]
    cum, acc = [], Counter()
    for c in rows:
        for k in FIELDS:
            acc[k] += c[k]
        acc['usd'] += c['usd']
        cum.append(Counter(acc))

    def upto(ts):
        i = bisect.bisect_right(keys, ts or '') - 1
        return cum[i] if i >= 0 else Counter()

    info = orch[0]['info']
    snaps, seen = [], set()
    for s in info['snapshots']:
        if s['total'] in seen:
            continue
        seen.add(s['total'])
        t = upto(s['ts'])
        models = s['models']
        opus = sum(v.get('costUSD', 0) for k, v in models.items() if 'haiku' not in k)
        haiku = sum(v.get('costUSD', 0) for k, v in models.items() if 'haiku' in k)
        searches = sum(v.get('webSearchRequests', 0) for v in models.values())
        cr = sum(v.get('cacheReadInputTokens', 0) for k, v in models.items() if 'haiku' not in k)
        snaps.append(dict(ts=s['ts'], total=s['total'], main_model=opus, haiku=haiku, web_searches=searches,
                          transcripts=t['usd'], cr_meter=cr, cr_transcripts=t['cr']))
    readings, seen = [], set()
    for a in recs:
        for r in a['info']['readings']:
            k = (r['ts'], r['cost_usd'])
            if k in seen:
                continue
            seen.add(k)
            t = upto(r['ts'])
            readings.append(dict(r, transcripts=t['usd'], cr_transcripts=t['cr'], cw_transcripts=t['cw5m'] + t['cw1h'],
                                 out_transcripts=t['out'], in_transcripts=t['inp']))
    readings.sort(key=lambda r: r['ts'])
    return dict(snapshots=snaps, readings=readings, compactions=info['compactions'],
                transcripts_now=cum[-1]['usd'] if cum else 0.0)


# ---------------------------------------------------------------- the report
def group(meter, key):
    g = defaultdict(lambda: dict(agents=set(), rows=[], orch=[], images=0, tools=0))
    for a in meter['agents']:
        if not a['rows']:
            continue
        if a['kind'] == 'orchestrator':
            if key in ('film', 'gate', 'film_gate'):
                by = defaultdict(list)
                for c in a['rows']:
                    by[(c['film'], c['gate'])].append(c)
                for (f, gt), rows in by.items():
                    k = {'film': f, 'gate': gt, 'film_gate': (f, gt)}[key]
                    g[k]['orch'] += rows
                continue
            if key != 'role':
                continue
            k = a['role']
        else:
            k = {'role': a['role'], 'film': a['film'], 'gate': a['gate'], 'film_gate': (a['film'], a['gate']),
                 'workflow': a['workflow'] or '(Agent tool)'}[key]
        g[k]['agents'].add(a['id'])
        g[k]['rows'] += a['rows']
        g[k]['images'] += a['images']
        g[k]['tools'] += stats(a['rows'])['tools']
    return g


def fmt_m(x):
    return f'{x / 1e6:,.1f}'


def report(meter, rates='meter', top=None):
    usd = 'usd' if rates == 'meter' else 'usd_doc'
    other = 'usd_doc' if rates == 'meter' else 'usd'
    agents = [a for a in meter['agents'] if a['rows']]
    allrows = [c for a in agents for c in a['rows']]
    T = stats(allrows)
    L = []
    w = L.append
    win = f"{hm(meter['since'])} -> {hm(meter['until'] or meter['now'])} UTC" if (meter['since'] or meter['until']) else 'all'
    w(f"Spend meter v2 (each API call once), {meter['now'].strftime('%Y-%m-%d %H:%M')} UTC")
    for s in meter['sessions']:
        n = sum(1 for a in meter['agents'] if a['session'] == s['sid'] and a['kind'] != 'orchestrator')
        src = s['folder'] or s['main'] or ', '.join(s.get('files') or [])
        w(f"  transcripts: {src} (orchestrator {'yes' if s['main'] else 'no'}, {n} agent{'' if n == 1 else 's'})")
    w(f"  window: {win}" + (f"; film {meter['film']} only (agents labelled {meter['film']} + the orchestrator's share)" if meter['film'] else ''))
    w("  rates $/M: " + ("meter = Claude Code's own cost tracker: Opus in 4, out 20, cache read 0.20, cache write 5 (5 min) / 8 (1 h)"
                         if rates == 'meter' else "doc = 2026-10-28_v4_early_stage_cost.md: in 3.07, out 15.35, cache read 0.31, cache write 3.84"))
    w('')
    if not allrows:
        w('No calls in this window.')
        return '\n'.join(L)
    times = [c['t'] for c in allrows if c['t']]
    w(f"TOTAL {T['calls']:,} calls, {hm(min(times))} -> {hm(max(times))}: cache read {fmt_m(T['cr'])}M, cache write "
      f"{fmt_m(T['cw'])}M, input {T['inp'] / 1e3:,.0f}k, output {fmt_m(T['out'])}M = ${T[usd]:,.2f}"
      f" (at the {'doc' if rates == 'meter' else 'meter'}'s rates ${T[other]:,.2f})")
    o = [c for a in agents if a['kind'] == 'orchestrator' for c in a['rows']]
    ag = [a for a in agents if a['kind'] != 'orchestrator']
    if o:
        S = stats(o)
        w(f"  orchestrator: {S['calls']:,} calls, mean context {S['ctx_mean'] / 1e3:,.0f}k (max {S['ctx_max'] / 1e3:,.0f}k), "
          f"${S[usd]:,.2f} ({100 * S[usd] / T[usd]:.0f} %)")
    if ag:
        S = stats([c for a in ag for c in a['rows']])
        w(f"  {len(ag)} agent{'' if len(ag) == 1 else 's'}: {S['calls']:,} calls, mean context {S['ctx_mean'] / 1e3:,.0f}k, ${S[usd]:,.2f} ({100 * S[usd] / T[usd]:.0f} %)")
    ls = Counter()
    for a in agents:
        ls.update(a['info']['line_sum'])
    ded = sum(T[k] for k in ('inp', 'cr', 'cw5m', 'cw1h'))
    if ded and not (meter['since'] or meter['until'] or meter['film']):
        w(f"  v1's per-line sum would report {sum(ls[k] for k in ('inp', 'cr', 'cw5m', 'cw1h')) / ded:.2f}x this input "
          f"({sum(a['info']['lines_with_usage'] for a in agents):,} lines for {T['calls']:,} calls)")
    w('')

    alt = '$doc' if rates == 'meter' else '$meter'
    hdr = (f"{'agents':>6} {'calls':>6} {'ctx/call':>8} {'imgs':>5} {'out M':>6} {'read M':>7} {'write M':>7} {'$':>9} "
           f"{alt:>8} {'share':>6}")

    def row(name, g, width=22):
        S = stats(g['rows'] + g.get('orch', []))
        n = len(g['agents'])
        return (f"{name[:width]:<{width}} {n if n else '':>6} {S['calls']:>6,} {S['ctx_mean'] / 1e3:>7,.0f}k {g['images']:>5} "
                f"{S['out'] / 1e6:>6.2f} {S['cr'] / 1e6:>7.1f} {S['cw'] / 1e6:>7.2f} {S[usd]:>9,.2f} {S[other]:>8,.2f} "
                f"{100 * S[usd] / T[usd]:>5.0f}%")

    w('By role')
    w(f"{'role':<22} " + hdr)
    for k, g in sorted(group(meter, 'role').items(), key=lambda kv: -stats(kv[1]['rows'])[usd]):
        w(row(k, g))
    w('')
    w("By film and gate (each orchestrator call goes to the film and gate of the agent it started last; 'start' = before any)")
    w(f"{'film gate':<22} " + hdr + f" {'of it orch $':>12}")
    for (f, gt), g in sorted(group(meter, 'film_gate').items(), key=lambda kv: (kv[0][0], gate_key(kv[0][1]))):
        os_ = stats(g['orch'])[usd] if g['orch'] else 0
        w(row(f'{f} {gt}', g) + f" {os_:>12,.2f}")
    wfs = group(meter, 'workflow')
    if any(k != '(Agent tool)' for k in wfs):
        w('')
        w('By workflow')
        w(f"{'workflow':<40} " + hdr)
        for k, g in sorted(wfs.items(), key=lambda kv: -stats(kv[1]['rows'])[usd])[:25]:
            w(row(k, g, 40))
    sc = defaultdict(lambda: dict(review=0, fix=0, rows=[]))
    for a in ag:
        m = re.search(r'\bS(\d\d)\b', a['label'] or '')
        if m:
            s = sc['S' + m.group(1)]
            s['rows'] += a['rows']
            s['review'] += a['role'] in ('review', 'verify')
            s['fix'] += a['role'] == 'fix'
    if sc:
        w('')
        w('Per scene: reviews / fixes / $')
        for s in sorted(sc):
            w(f"  {s} {sc[s]['review']:3d} {sc[s]['fix']:3d} {stats(sc[s]['rows'])[usd]:9,.2f}")
    w('')
    shown = sorted(agents, key=lambda a: a['start'] or '')
    if top is not None:
        shown = sorted(agents, key=lambda a: -stats(a['rows'])[usd])[:top] if top else []
    if shown:
        w('Per agent' + (f' (top {top} by $)' if top else ' (in start order)') +
          ': calls, tool calls, context on the first call / mean / max (k tokens), images seen, output k, $')
        w(f"{'id':<9} {'started':<11} {'label':<44} {'film':<4} {'gate':<7} {'role':<11} {'calls':>5} {'tools':>5} "
          f"{'ctx0':>5} {'mean':>5} {'max':>5} {'imgs':>4} {'out k':>6} {'$':>8} {alt:>7} status")
        for a in shown:
            S = stats(a['rows'])
            w(f"{a['id'][:9]:<9} {hm(ts_of(a['start'])):<11} {(a['label'] or '')[:44]:<44} {a['film'] or '':<4} "
              f"{a['gate'] or '':<7} {a['role'][:11]:<11} {S['calls']:>5} {S['tools']:>5} "
              f"{S['ctx_first'] / 1e3:>5.0f} {S['ctx_mean'] / 1e3:>5.0f} {S['ctx_max'] / 1e3:>5.0f} {a['images']:>4} "
              f"{S['out'] / 1e3:>6.0f} {S[usd]:>8,.2f} {S[other]:>7,.2f} {a['status']}")
        w('')
    web = sum(stats(a['rows'])['web'] for a in agents)
    docs = sum(a['doc_reads'] for a in agents)
    w(f"Other counters: {web} WebSearch/WebFetch calls (their Haiku side calls are priced in the meter check, not here); "
      f"{docs} doc reads, {sum(a['doc_read_bytes'] for a in agents) / 1e6:.1f} MB of docs pulled into contexts; "
      f"{sum(1 for a in ag if a['status'] in ('failed', 'limit', 'stopped'))} agents failed or stopped, "
      f"{sum(1 for a in ag if a['status'] == 'running')} running.")
    if not (meter['since'] or meter['until'] or meter['film']):
        for s in meter['sessions']:
            L += check_lines(s)
    return '\n'.join(L)


def gate_key(g):
    m = re.match(r'G(\d+)(?:\.(\d))?([a-z]?)', g or '')
    return (0, int(m.group(1)), int(m.group(2) or 0), m.group(3)) if m else (1, 0, 0, g)


def check_lines(s):
    ch = s.get('check') or {}
    L = []
    if not (ch.get('snapshots') or ch.get('readings')):
        return L
    L.append('')
    L.append(f"Meter check, session {s['sid'][:8]} (cumulative, at meter rates)")
    if ch.get('snapshots'):
        x = ch['snapshots'][-1]
        gap = x['main_model'] - x['transcripts']
        L.append(f"  Claude Code's own meter (the cost-state the orchestrator's worker writes when it stops; last at ~{hm(ts_of(x['ts']))}): "
                 f"${x['total']:,.2f} = Opus ${x['main_model']:,.2f} + Haiku ${x['haiku']:,.2f} ({x['web_searches']} web searches: "
                 f"WebSearch/WebFetch side calls, in no transcript).")
        L.append(f"  Transcripts up to then: ${x['transcripts']:,.2f}, so ${gap:,.2f} of Opus calls are in no transcript "
                 f"(cache read {fmt_m(x['cr_meter'] - x['cr_transcripts'])}M: the auto-compaction call"
                 f"{'s' if len(ch.get('compactions') or []) != 1 else ''} ({len(ch.get('compactions') or [])} here) and other side calls).")
        L.append(f"  Session total now, about: transcripts ${ch['transcripts_now']:,.2f} + those side calls as of then "
                 f"(${gap + x['haiku']:,.2f}) = ${ch['transcripts_now'] + gap + x['haiku']:,.2f}.")
    if ch.get('readings'):
        L.append("  The server's meter (get_session `usage`): it includes the agents and the Haiku side calls, and within one worker")
        L.append("  it tracks the transcripts call for call, but it can lose usage across worker restarts (2026-10-28, at the 5-hour")
        L.append("  limits: about 10 %), so read it as a lower bound:")
        L.append(f"  {'read at':<12} {'server $':>9} {'transcripts $':>13} {'diff':>8} | {'cache read M server / transcripts':>34} | {'output M':>15}")
        for r in ch['readings']:
            L.append(f"  {hm(ts_of(r['ts'])):<12} {r['cost_usd']:>9,.2f} {r['transcripts']:>13,.2f} {r['cost_usd'] - r['transcripts']:>+8.2f} | "
                     f"{r['cache_read_tokens'] / 1e6:>16.1f} / {r['cr_transcripts'] / 1e6:<15.1f} | {r['output_tokens'] / 1e6:>6.2f} / {r['out_transcripts'] / 1e6:<6.2f}")
    return L


# ---------------------------------------------------------------- for status.py and --json
def film_summary(meter, film, last=dt.timedelta(hours=1)):
    """A few numbers for one film from a loaded meter (all-time; the film's agents + the orchestrator's share)."""
    out = dict(session_usd=0.0, orch_usd=0.0, agents=0, agents_usd=0.0, film_usd=0.0, film_agents=0, film_agents_usd=0.0,
               film_orch_usd=0.0, last_hour_usd=0.0, running=[], unlabelled=0,
               sessions=[s['sid'] for s in meter['sessions']])
    since = meter['now'] - last
    for a in meter['agents']:
        rows = a['all_rows']
        S = stats(rows)
        out['session_usd'] += S['usd']
        out['last_hour_usd'] += sum(c['usd'] for c in rows if c['t'] and c['t'] >= since)
        if a['kind'] == 'orchestrator':
            out['orch_usd'] += S['usd']
            out['film_orch_usd'] += sum(c['usd'] for c in rows if c['film'] == film)
        else:
            out['agents'] += 1
            out['agents_usd'] += S['usd']
            if a['film'] == '-' and a['gate'] != 'process':
                out['unlabelled'] += 1
            if a['film'] == film:
                out['film_agents'] += 1
                out['film_agents_usd'] += S['usd']
            if a['status'] == 'running':
                out['running'].append(f"{a['label'][:40]} ({S['calls']} calls, ${S['usd']:.2f})")
    out['film_usd'] = out['film_agents_usd'] + out['film_orch_usd']
    return out


def to_json(meter, rates='meter'):
    usd = 'usd' if rates == 'meter' else 'usd_doc'
    agents = []
    for i, a in enumerate(meter['agents']):
        S = stats(a['rows'])
        agents.append(dict(n=i, id=a['id'], session=a['session'], kind=a['kind'], label=a['label'], workflow=a['workflow'],
                           film=a['film'], gate=a['gate'], role=a['role'], status=a['status'], start=a['start'],
                           calls=S['calls'], lines_with_usage=a['info']['lines_with_usage'],
                           tool_calls=S['tools'], tools_all_time=dict(a['info']['tools']),
                           images=a['images'], web_calls=S['web'], doc_reads=a['doc_reads'],
                           doc_read_bytes=a['doc_read_bytes'], ctx_first=S['ctx_first'],
                           ctx_mean=round(S['ctx_mean']), ctx_max=S['ctx_max'], input=S['inp'], cache_read=S['cr'],
                           cache_write_5m=S['cw5m'], cache_write_1h=S['cw1h'], output=S['out'],
                           usd=round(S['usd'], 4), usd_doc_rates=round(S['usd_doc'], 4)))
    calls = [[c['ts'], i, c['model'], c['inp'], c['cr'], c['cw5m'], c['cw1h'], c['out'], c['film'], c['gate']]
             for i, a in enumerate(meter['agents']) for c in a['rows']]
    calls.sort(key=lambda r: r[0] or '')
    return dict(version=2, generated=meter['now'].isoformat(), paths=meter['paths'], rates=rates, rate_table=RATES,
                since=meter['since'].isoformat() if meter['since'] else None,
                until=meter['until'].isoformat() if meter['until'] else None, film=meter['film'],
                total_usd=round(sum(x['usd'] for x in agents), 4), agents=agents,
                checks={s['sid']: s['check'] for s in meter['sessions']},
                call_columns=['ts', 'agent', 'model', 'input', 'cache_read', 'cache_write_5m', 'cache_write_1h',
                              'output', 'film', 'gate'],
                calls=calls, usd_field=usd)


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split('\n\n')[0],
                                 formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__.split('\n\n', 1)[1])
    ap.add_argument('paths', nargs='*', help='session folders, their .jsonl files, or project folders '
                                            '(default: $CLAUDE_CODE_SESSION_ID, else ' + DEFAULT_SESSION + ')')
    ap.add_argument('--since', help='only calls from this time (ISO, HH:MM today, or 90m / 2h / 1d ago; UTC)')
    ap.add_argument('--until', help='only calls up to this time')
    ap.add_argument('--film', help='only this film (vN): its labelled agents and the orchestrator calls attributed to it')
    ap.add_argument('--rates', choices=('meter', 'doc'), default='meter',
                    help="meter = Claude Code's own cost tracker (exact; default); doc = the v4 cost doc's rates")
    ap.add_argument('--agents', type=int, default=None, help='per-agent table: 0 hides it, N shows the top N by $')
    ap.add_argument('--json', action='store_true', help='print the JSON instead of the text report')
    ap.add_argument('--save', action='store_true', help='also write spend_<session>.txt and .json')
    ap.add_argument('--out', default=HERE, help='folder for --save (default: beside this script)')
    a = ap.parse_args(argv)
    meter = load(a.paths or None, since=a.since, until=a.until, film=a.film)
    text = report(meter, rates=a.rates, top=a.agents)
    js = to_json(meter, rates=a.rates)
    print(json.dumps(js, indent=1) if a.json else text)
    if a.save:
        tag = '_'.join(s['sid'][:8] for s in meter['sessions'])
        suffix = (f'_{a.film}' if a.film else '') + ('_window' if (a.since or a.until) else '') + \
                 ('_docrates' if a.rates == 'doc' else '')
        base = os.path.join(a.out, f'spend_{tag}{suffix}')
        with open(base + '.txt', 'w') as f:
            f.write(text + '\n')
        with open(base + '.json', 'w') as f:
            json.dump(js, f, separators=(',', ':'))
        print(f'\nwrote {base}.txt and {base}.json', file=sys.stderr)


if __name__ == '__main__':
    main()
