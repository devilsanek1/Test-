#!/usr/bin/env python3
"""G0.5 core line bookkeeping when the stages run as separate agents (no Workflow tool): the same maths as the
G0.5 workflow templates (`context/workflows/v4-g05-facts-and-core-line-*.js`), kept in files so a usage-limit stop
loses nothing.

  python3 scripts/coreline.py collect <dir>   writers/*.json + seeds.json -> candidates.json (deduped, ids L1..Ln)
  python3 scripts/coreline.py score <dir>     judges/*.json -> ranked.json (score out of 90: gut x3, truth x2,
                                              clarity x2, payoff, share) and finalists.json (top 7 with truth >= 6,
                                              plus the seeds)
<dir> is the film's core-line folder, e.g. docs/v4/core_line. A writer file is {"lines": [{line, frame0, emotion,
backing, payoff}]}; a judge file is {"scores": [{id, gut, truth, clarity, payoff, share, fix, note}], "top5": [...]}.
"""
import glob
import json
import os
import re
import sys

KEYS = ('gut', 'truth', 'clarity', 'payoff', 'share')


def norm(s):
    return re.sub(r'\s+', ' ', re.sub(r'[^a-z0-9%$ ]', '', s.lower())).strip()


def load(path):
    with open(path, encoding='utf-8') as f:
        return json.load(f)


def save(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=1, ensure_ascii=False)
        f.write('\n')


def collect(d):
    seen, cands = set(), []

    def add(c, source):
        k = norm(c['line'])
        if k in seen:
            return
        seen.add(k)
        cands.append({'id': f'L{len(cands) + 1}', 'source': source, **c})

    seeds = os.path.join(d, 'seeds.json')
    if os.path.exists(seeds):
        for s in load(seeds):
            add({'line': s['line'], 'frame0': s['frame0'], 'emotion': '', 'backing': '', 'payoff': ''}, s['source'])
    for f in sorted(glob.glob(os.path.join(d, 'writers', '*.json'))):
        for c in load(f).get('lines', []):
            add({k: c.get(k, '') for k in ('line', 'frame0', 'emotion', 'backing', 'payoff')},
                'lever:' + os.path.splitext(os.path.basename(f))[0])
    save(os.path.join(d, 'candidates.json'), cands)
    print(f"{len(cands)} unique candidate lines -> {os.path.join(d, 'candidates.json')}")


def score(d):
    cands = load(os.path.join(d, 'candidates.json'))
    agg = {c['id']: {**{k: 0.0 for k in KEYS}, 'n': 0, 'fixes': [], 'notes': []} for c in cands}
    judges = sorted(glob.glob(os.path.join(d, 'judges', '*.json')))
    for f in judges:
        for s in load(f).get('scores', []):
            g = agg.get(s.get('id'))
            if not g:
                continue
            for k in KEYS:
                g[k] += float(s.get(k, 0))
            g['n'] += 1
            if s.get('fix'):
                g['fixes'].append(s['fix'])
            if s.get('note'):
                g['notes'].append(s['note'])
    ranked = []
    for c in cands:
        g = agg[c['id']]
        n = g['n'] or 1
        av = {k: round(g[k] / n, 1) for k in KEYS}
        s90 = round((3 * g['gut'] + 2 * g['truth'] + 2 * g['clarity'] + g['payoff'] + g['share']) / n, 1)
        ranked.append({**c, **av, 'score90': s90, 'judged_by': g['n'], 'fixes': g['fixes'], 'notes': g['notes']})
    ranked.sort(key=lambda r: -r['score90'])
    eligible = [r for r in ranked if r['truth'] >= 6]
    finalists = eligible[:7] + [r for r in ranked if r['source'] == 'G0 doc' and r not in eligible[:7]]
    save(os.path.join(d, 'ranked.json'), ranked)
    save(os.path.join(d, 'finalists.json'), finalists)
    print(f"{len(judges)} judge file(s); {len(ranked) - len(eligible)} line(s) dropped for truth < 6")
    for r in finalists:
        print(f"  {r['id']:>4} {r['score90']:5.1f}  truth {r['truth']:4.1f}  {r['source']:16s} {r['line']}")


if __name__ == '__main__':
    if len(sys.argv) != 3 or sys.argv[1] not in ('collect', 'score'):
        sys.exit(__doc__)
    {'collect': collect, 'score': score}[sys.argv[1]](sys.argv[2])
