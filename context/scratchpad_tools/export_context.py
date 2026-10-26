#!/usr/bin/env python3
"""Export this session's context into the repo (context/): the conversation (user + assistant text), an actions log,
compaction summaries, uploads (deduped against tracked assets), workflow scripts and agent reports.
Redacts the owner's email; flags anything that looks like a secret."""
import base64, glob, hashlib, json, os, re, shutil, subprocess

SID = '59905704-1101-50eb-baa8-b5e4e9d5d2d2'
PROJ = '/root/.claude/projects/-home-user-Test-'
TRANSCRIPT = f'{PROJ}/{SID}.jsonl'
SESS = f'{PROJ}/{SID}'
UPLOADS = f'/root/.claude/uploads/{SID}'
REPO = '/home/user/Test-'
OUT = f'{REPO}/context'
EMAIL = os.environ.get('OWNER_EMAIL', 'owner@example.invalid')  # the real address is never written into the repo
SECRET_RE = re.compile(r'(sk_[A-Za-z0-9]{24,}|ghp_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[0-9A-Z]{16}|xox[bp]-[A-Za-z0-9-]{20,}|(?i:api[_-]?key|secret|password|token)\s*[:=]\s*["\']?[A-Za-z0-9_\-]{20,})')
SYSREM = re.compile(r'<system-reminder>.*?</system-reminder>', re.S)
MIDTURN = re.compile(r'The user sent a new message while you were working:\n(.*?)\n\nThis is how Claude Code surfaces', re.S)

flags = []


def clean(s):
    s = s.replace(EMAIL, '[owner email]')
    for m in SECRET_RE.finditer(s):
        flags.append(m.group(0)[:6] + '...')
    return SECRET_RE.sub('[REDACTED SECRET]', s)  # API keys pasted into chat never reach the repo


def md5(p):
    h = hashlib.md5()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''):
            h.update(b)
    return h.hexdigest()


for d in ('conversation', 'summaries', 'uploads/inline', 'workflows', 'agent_reports'):
    os.makedirs(f'{OUT}/{d}', exist_ok=True)

# ---- uploads: dedupe against files already tracked in the repo
tracked = subprocess.run(['git', '-C', REPO, 'ls-files', '-z'], capture_output=True).stdout.decode().split('\0')
tracked_md5 = {}
for t in tracked:
    p = f'{REPO}/{t}'
    if t and os.path.isfile(p) and os.path.getsize(p) > 500_000 and re.search(r'\.(mp4|mov|wav|mp3|png|jpe?g)$', t, re.I):
        tracked_md5.setdefault(md5(p), t)
upload_map = {}  # upload path -> repo-relative path
for f in sorted(os.listdir(UPLOADS)):
    p = f'{UPLOADS}/{f}'
    h = md5(p)
    if h in tracked_md5:
        upload_map[p] = tracked_md5[h]
    else:
        shutil.copy2(p, f'{OUT}/uploads/{f}')
        upload_map[p] = f'context/uploads/{f}'


def relink(s):
    for src, dst in upload_map.items():
        s = s.replace(src, dst)
    return s


# ---- transcript
events = []  # (ts, kind, text)
actions = []
agent_reports = []
summaries = []
seen_user = set()
tool_names = {}
img_n = 0
for line in open(TRANSCRIPT, errors='replace'):
    try:
        e = json.loads(line)
    except Exception:
        continue
    if e.get('isSidechain'):
        continue
    ts = (e.get('timestamp') or '')[:19].replace('T', ' ')
    t = e.get('type')
    if t == 'attachment':
        a = e.get('attachment') or {}
        if a.get('type') == 'queued_command':
            pr = a.get('prompt')
            if isinstance(pr, str) and not pr.lstrip().startswith('<task-notification>'):
                txt = SYSREM.sub('', pr).strip()
                if txt.startswith('<agent-message'):
                    events.append((ts, 'SUBAGENT HAND-BACK (not the owner)', txt))
                elif txt and not txt.startswith('<') and txt not in seen_user:
                    seen_user.add(txt)
                    events.append((ts, 'USER (sent while the assistant was working)', txt))
        continue
    m = e.get('message') or {}
    c = m.get('content')
    if t == 'user':
        if e.get('isCompactSummary'):
            summaries.append((ts, c if isinstance(c, str) else json.dumps(c)))
            events.append((ts, 'CONTEXT COMPACTION', f'(The conversation was summarised here: see context/summaries/compaction_{len(summaries)}.md)'))
            continue
        if e.get('isMeta'):
            continue
        if isinstance(c, str):
            txt = SYSREM.sub('', c).strip()
            if txt.startswith('<task-notification>') or txt.startswith('<command-') or not txt:
                continue
            if txt not in seen_user:
                seen_user.add(txt)
                events.append((ts, 'USER', txt))
            continue
        if isinstance(c, list):
            texts, imgs = [], []
            for b in c:
                if not isinstance(b, dict):
                    continue
                if b.get('type') == 'tool_result':
                    cc = b.get('content')
                    s = cc if isinstance(cc, str) else json.dumps(cc)
                    for mm in MIDTURN.finditer(s.replace('\\n', '\n')):
                        txt = mm.group(1).strip()
                        if txt and txt not in seen_user:
                            seen_user.add(txt)
                            events.append((ts, 'USER (sent while the assistant was working)', txt))
                    if b.get('tool_use_id') in tool_names and tool_names[b['tool_use_id']][0] == 'Agent':
                        body = cc if isinstance(cc, str) else '\n'.join(x.get('text', '') for x in cc if isinstance(x, dict))
                        agent_reports.append((ts, tool_names[b['tool_use_id']][1], body))
                elif b.get('type') == 'text':
                    tx = SYSREM.sub('', b.get('text', '')).strip()
                    if tx:
                        texts.append(tx)
                elif b.get('type') == 'image':
                    src = b.get('source') or {}
                    if src.get('type') == 'base64':
                        ext = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif'}.get(src.get('media_type'), 'bin')
                        img_n += 1
                        name = f"{ts.replace(' ', '_').replace(':', '')}_{img_n}.{ext}"
                        open(f'{OUT}/uploads/inline/{name}', 'wb').write(base64.b64decode(src['data']))
                        imgs.append(f'context/uploads/inline/{name}')
            if texts or imgs:
                body = '\n\n'.join(texts)
                if imgs:
                    body += ('\n\n' if body else '') + '\n'.join(f'[image: {p}]' for p in imgs)
                if body not in seen_user:
                    seen_user.add(body)
                    events.append((ts, 'USER', body))
        continue
    if t == 'assistant' and isinstance(c, list):
        for b in c:
            if not isinstance(b, dict):
                continue
            if b.get('type') == 'text' and b.get('text', '').strip():
                events.append((ts, 'ASSISTANT', b['text'].strip()))
            elif b.get('type') == 'tool_use':
                name = b.get('name', '?')
                inp = b.get('input') or {}
                desc = inp.get('description') or inp.get('file_path') or inp.get('query') or inp.get('subject') or inp.get('message') or ''
                if name == 'Workflow':
                    mm = re.search(r"name:\s*'([^']+)'", inp.get('script') or '')
                    desc = (mm.group(1) if mm else '') or inp.get('scriptPath', '') or inp.get('name', '')
                if name == 'Agent':
                    desc = inp.get('description', '')
                tool_names[b.get('id')] = (name, str(desc))
                actions.append((ts, name, str(desc).replace('\n', ' ')[:200]))

# ---- write conversation (split by day)
by_day = {}
for ts, kind, txt in events:
    by_day.setdefault(ts[:10], []).append((ts, kind, txt))
index = []
for day, evs in sorted(by_day.items()):
    fn = f'conversation/CONVERSATION_{day}.md'
    with open(f'{OUT}/{fn}', 'w') as f:
        f.write(f'# Conversation, {day} (UTC)\n\nThe owner\'s messages verbatim and the assistant\'s replies as the owner saw them '
                '(tool calls are in ACTIONS_LOG.md). Upload paths are rewritten to their place in this repo.\n\n')
        for ts, kind, txt in evs:
            f.write(f'---\n\n**{kind}** · {ts}\n\n{clean(relink(txt))}\n\n')
    index.append(fn)
with open(f'{OUT}/conversation/USER_MESSAGES.md', 'w') as f:
    f.write('# Every message from the owner, verbatim (UTC)\n\nThe fastest way to know what the owner asked for and how they talk.\n\n')
    for ts, kind, txt in events:
        if kind.startswith('USER'):
            f.write(f'---\n\n**{ts}**{" (mid-turn)" if "while" in kind else ""}\n\n{clean(relink(txt))}\n\n')
with open(f'{OUT}/conversation/ACTIONS_LOG.md', 'w') as f:
    f.write('# Actions log: every tool call the orchestrating assistant made (UTC)\n\n| time | tool | what |\n|---|---|---|\n')
    for ts, name, desc in actions:
        f.write(f"| {ts} | {name} | {clean(desc).replace('|', '/')} |\n")
for i, (ts, s) in enumerate(summaries, 1):
    open(f'{OUT}/summaries/compaction_{i}.md', 'w').write(f'# Context compaction {i} ({ts} UTC)\n\nThe summary the assistant continued from after its context filled up.\n\n{clean(relink(s))}\n')
with open(f'{OUT}/agent_reports/agent_tool_reports.md', 'w') as f:
    f.write('# Reports from single agents (Agent tool)\n\n')
    for ts, desc, body in agent_reports:
        f.write(f'---\n\n## {ts} · {desc}\n\n{clean(body)}\n\n')

# ---- workflows: scripts + per-run agent reports
names = {}
for w in glob.glob(f'{SESS}/workflows/*.json'):
    try:
        d = json.load(open(w))
        names[d.get('runId')] = d
    except Exception:
        pass
for sp in glob.glob(f'{SESS}/workflows/scripts/*.js'):
    shutil.copy2(sp, f'{OUT}/workflows/{os.path.basename(sp)}')
wf_rows = []
for j in sorted(glob.glob(f'{SESS}/subagents/workflows/*/journal.jsonl'), key=os.path.getmtime):
    run = j.split('/')[-2]
    d = names.get(run) or {}
    script = os.path.basename(d.get('scriptPath') or '') or run
    labels, results, failed = {}, [], []
    for line in open(j, errors='replace'):
        try:
            e = json.loads(line)
        except Exception:
            continue
        if e.get('type') == 'started':
            labels[e.get('agentId')] = e.get('label') or ''
        elif e.get('type') == 'result':
            r = e.get('result')
            results.append((labels.get(e.get('agentId'), e.get('agentId')), r if isinstance(r, str) else json.dumps(r, indent=1, ensure_ascii=False)))
        elif e.get('type') == 'failed':
            failed.append((labels.get(e.get('agentId'), e.get('agentId')), str(e.get('error', ''))[:200]))
    when = __import__('datetime').datetime.fromtimestamp(os.path.getmtime(j), __import__('datetime').UTC).strftime('%Y-%m-%d %H:%M')
    fn = f"agent_reports/{when[:10]}_{when[11:].replace(':', '')}_{script.replace('.js', '')}.md"
    with open(f'{OUT}/{fn}', 'w') as f:
        f.write(f'# Workflow {script} (run {run}, last activity {when} UTC)\n\nScript: `context/workflows/{script}`\n\n')
        for lab, r in results:
            f.write(f'---\n\n## {lab}\n\n{clean(r)}\n\n')
        if failed:
            f.write('---\n\n## Failed agents\n\n' + '\n'.join(f'- {lab}: {err}' for lab, err in failed) + '\n')
    wf_rows.append((when, script, len(results), len(failed), fn))
with open(f'{OUT}/workflows/INDEX.md', 'w') as f:
    f.write('# Workflow runs (multi-agent scripts), oldest first\n\n| last activity (UTC) | script | agents done | failed | reports |\n|---|---|---|---|---|\n')
    for when, script, n, nf, fn in wf_rows:
        f.write(f'| {when} | `{script}` | {n} | {nf} | `context/{fn}` |\n')

print('events', len(events), 'user', sum(1 for e in events if e[1].startswith('USER')), 'actions', len(actions), 'summaries', len(summaries), 'inline imgs', img_n, 'agent reports', len(agent_reports), 'workflow runs', len(wf_rows))
print('days', index)
print('upload map', json.dumps({os.path.basename(k): v for k, v in upload_map.items()}, indent=0))
print('SECRET FLAGS', flags[:20])
