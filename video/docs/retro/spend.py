#!/usr/bin/env python3
"""Token spend forensics for this session: per workflow, per agent-label category, plus the orchestrator.
Streams every subagent transcript (usage per assistant message), maps agent ids to labels via each workflow's
journal.jsonl, and counts doc reads, failures and rework rounds. Writes spend.json + prints a summary."""
import glob, json, os, re, sys
from collections import defaultdict

P = '/root/.claude/projects/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2'
OUT = os.path.dirname(os.path.abspath(__file__))


def usage_of(path):
    tot = defaultdict(int)
    doc_read_bytes = 0
    reads = 0
    turns = 0
    pending = {}
    try:
        f = open(path, errors='replace')
    except OSError:
        return tot, 0, 0, 0
    for line in f:
        if '"usage"' not in line and '"tool_use"' not in line and '"tool_result"' not in line:
            continue
        try:
            e = json.loads(line)
        except Exception:
            continue
        m = e.get('message') or {}
        u = m.get('usage')
        if m.get('role') == 'assistant' and u:
            turns += 1
            for k in ('input_tokens', 'cache_creation_input_tokens', 'cache_read_input_tokens', 'output_tokens'):
                tot[k] += int(u.get(k) or 0)
        c = m.get('content')
        if isinstance(c, list):
            for b in c:
                if not isinstance(b, dict):
                    continue
                if b.get('type') == 'tool_use' and b.get('name') == 'Read':
                    fp = str((b.get('input') or {}).get('file_path', ''))
                    if '/docs/' in fp and fp.endswith('.md'):
                        pending[b.get('id')] = fp
                if b.get('type') == 'tool_result' and b.get('tool_use_id') in pending:
                    cc = b.get('content')
                    s = json.dumps(cc) if not isinstance(cc, str) else cc
                    doc_read_bytes += len(s)
                    reads += 1
    return tot, doc_read_bytes, reads, turns


def category(label):
    l = (label or '').lower()
    for k in ('review', 'fix', 'build', 'verify', 'own', 'audit', 'ideas', 'edge', 'kit', 'sets', 'props', 'hook', 'sound', 'cut', 'plan', 'research'):
        if k in l:
            return k
    return 'other'


rows = []
labels = {}
failed = set()
wf_of = {}
for j in glob.glob(f'{P}/subagents/workflows/*/journal.jsonl'):
    wf = j.split('/')[-2]
    for line in open(j, errors='replace'):
        try:
            e = json.loads(line)
        except Exception:
            continue
        if e.get('type') == 'started':
            labels[e.get('agentId')] = e.get('label')
            wf_of[e.get('agentId')] = wf
        if e.get('type') == 'failed':
            failed.add(e.get('agentId'))

files = glob.glob(f'{P}/subagents/agent-*.jsonl') + glob.glob(f'{P}/subagents/workflows/*/agent-*.jsonl')
for i, fpath in enumerate(files):
    aid = os.path.basename(fpath)[len('agent-'):-len('.jsonl')]
    tot, dbytes, dreads, turns = usage_of(fpath)
    wf = wf_of.get(aid) or ('agent-tool' if '/workflows/' not in fpath else fpath.split('/')[-2])
    rows.append({'agent': aid, 'wf': wf, 'label': labels.get(aid, ''), 'cat': category(labels.get(aid, '')),
                 'failed': aid in failed, 'in': tot['input_tokens'] + tot['cache_creation_input_tokens'] + tot['cache_read_input_tokens'],
                 'cache_read': tot['cache_read_input_tokens'], 'out': tot['output_tokens'], 'turns': turns,
                 'doc_read_bytes': dbytes, 'doc_reads': dreads})

orch, odb, oreads, oturns = usage_of(f'{P}.jsonl')

# workflow names
names = {}
for w in glob.glob(f'{P}/workflows/*.json'):
    try:
        d = json.load(open(w))
        names[d.get('runId')] = (d.get('scriptPath') or '').split('/')[-1]
    except Exception:
        pass

json.dump({'rows': rows, 'orchestrator': {**orch, 'turns': oturns}, 'names': names}, open(f'{OUT}/spend.json', 'w'))

def agg(key):
    a = defaultdict(lambda: {'in': 0, 'out': 0, 'n': 0, 'failed': 0, 'doc': 0})
    for r in rows:
        k = r[key]
        a[k]['in'] += r['in']; a[k]['out'] += r['out']; a[k]['n'] += 1; a[k]['failed'] += r['failed']; a[k]['doc'] += r['doc_read_bytes']
    return a

T_in = sum(r['in'] for r in rows); T_out = sum(r['out'] for r in rows)
print(f'agents: {len(rows)}  total input {T_in/1e6:.1f}M (cache read {sum(r["cache_read"] for r in rows)/1e6:.1f}M)  output {T_out/1e6:.2f}M')
print(f'orchestrator: input {(orch["input_tokens"]+orch["cache_creation_input_tokens"]+orch["cache_read_input_tokens"])/1e6:.1f}M output {orch["output_tokens"]/1e6:.2f}M turns {oturns}')
print('\nby category (input M / output M / agents / failed / doc-read MB):')
for k, v in sorted(agg('cat').items(), key=lambda kv: -kv[1]['in']):
    print(f'  {k:10s} {v["in"]/1e6:7.1f} {v["out"]/1e6:6.2f} {v["n"]:4d} {v["failed"]:3d} {v["doc"]/1e6:6.1f}')
print('\nby workflow (top 25):')
for k, v in sorted(agg('wf').items(), key=lambda kv: -kv[1]['in'])[:25]:
    print(f'  {names.get(k, k)[:40]:40s} {v["in"]/1e6:7.1f} {v["out"]/1e6:6.2f} {v["n"]:4d} {v["failed"]:3d}')
sc = defaultdict(lambda: {'review': 0, 'fix': 0, 'in': 0})
for r in rows:
    m = re.search(r'S(\d\d)', r['label'] or '')
    if m and r['cat'] in ('review', 'fix', 'build', 'verify', 'own'):
        s = 'S' + m.group(1); sc[s]['in'] += r['in']
        if r['cat'] in ('review', 'verify'): sc[s]['review'] += 1
        if r['cat'] in ('fix', 'own'): sc[s]['fix'] += 1
print('\nper scene (reviews / fixes / input M):')
for s in sorted(sc):
    print(f'  {s} {sc[s]["review"]:3d} {sc[s]["fix"]:3d} {sc[s]["in"]/1e6:7.1f}')
print(f'\ndoc reads: {sum(r["doc_reads"] for r in rows)} reads, {sum(r["doc_read_bytes"] for r in rows)/1e6:.1f} MB of doc text pulled into agent contexts')
print(f'failed agents: {sum(r["failed"] for r in rows)}, their input {sum(r["in"] for r in rows if r["failed"])/1e6:.1f}M')
