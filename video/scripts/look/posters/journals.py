#!/usr/bin/env python3
"""The journal-corpus study's tools (video/docs/studies/2026-10-28_city_posters/journals/README.md has the method).

  python3 video/scripts/look/posters/journals.py merge      # parts/corpus_feeds.csv + corpus_C*.csv -> corpus.csv (validated, deduped)
  python3 video/scripts/look/posters/journals.py select [N] # stage 2: triage top N + a random 10 % control -> stage2_ids.txt
  python3 video/scripts/look/posters/journals.py sample     # a seeded 20 % of stage 2, stratified by source -> blind_sample_ids.txt
  python3 video/scripts/look/posters/journals.py check scores.csv [--fix]   # ranges, tags, the sums (--fix recomputes them)
  python3 video/scripts/look/posters/journals.py agreement  # scores.csv vs scores_blind.csv on the sample (markdown)
  python3 video/scripts/look/posters/journals.py stats      # per cluster and the base rates (needs clusters.csv; markdown)
  python3 video/scripts/look/posters/journals.py slices     # the owner's two slices: tech in the cities, data centres
  python3 video/scripts/look/posters/journals.py top [N]    # the candidates: gate pass, fit >= 6, WOW >= 1, not a past topic
  python3 video/scripts/look/posters/journals.py chart      # cluster_chart.png: clusters by story value (x) and visual fit (y)

Paths default to the study folder; --dir overrides it. Scores: fit = W+H+D+N+M (0-10); value = (6R+5T+3Mo+2F+1S)/17;
owner = (6R+5T+4fit+3Mo+2F+1S)/21 (TOPIC_CRITERIA's order, our fit as "visually appealing").
"""
import argparse
import csv
import math
import os
import random
import re
import sys
from collections import Counter, defaultdict
from urllib.parse import urlsplit

DEFAULT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'docs', 'studies',
                           '2026-10-28_city_posters', 'journals')
WINDOW = ('2026-09-28', '2026-10-28')
SEED = 20261028
OUTLETS = {
    'time.com': 'TIME', 'forbes.com': 'Forbes', 'bloomberg.com': 'Bloomberg', 'fortune.com': 'Fortune',
    'technologyreview.com': 'MIT Technology Review', 'scientificamerican.com': 'Scientific American',
    'nationalgeographic.com': 'National Geographic', 'smithsonianmag.com': 'Smithsonian',
    'washingtonpost.com': 'The Washington Post', 'cnn.com': 'CNN', 'npr.org': 'NPR',
    # from the outlets' RSS feeds (fetched by the orchestrating session: feeds_raw.csv)
    'economist.com': 'The Economist', 'nytimes.com': 'The New York Times', 'theguardian.com': 'The Guardian',
    'newyorker.com': 'The New Yorker', 'wired.com': 'Wired', 'theatlantic.com': 'The Atlantic', 'ft.com': 'Financial Times',
}
CORPUS_COLS = ['id', 'outlet', 'date', 'date_source', 'headline', 'url', 'section', 'type', 'stratum', 'query',
               'summary', 'collector', 'source', 'feed_tags']
SCORE_COLS = ['id', 'W', 'H', 'D', 'N', 'M', 'fit', 'gate', 'gate_reason', 'R', 'T', 'Mo', 'F', 'S', 'value', 'owner',
              'wow', 'world', 'real_place', 'happens_to', 'conflict', 'everyday', 'mood', 'ad_risk', 'past_topic', 'tech_ai',
              'news_shape', 'telling_shape', 'view', 'dup_of', 'confidence', 'note']
RANGES = {'W': (0, 3), 'H': (0, 2), 'D': (0, 2), 'N': (0, 1), 'M': (0, 2),
          'R': (1, 10), 'T': (1, 10), 'Mo': (1, 10), 'F': (1, 10), 'S': (1, 10)}
ENUMS = {'gate': {'pass', 'fail'}, 'world': {'real', 'metaphor', 'none'}, 'happens_to': {'to', 'in', 'none'},
         'conflict': {'Y', 'N'}, 'everyday': {'Y', 'N'}, 'ad_risk': {'Y', 'N'}, 'past_topic': {'Y', 'N'},
         'tech_ai': {'Y', 'N'}, 'mood': {'pos', 'neg', 'mixed'}, 'confidence': {'high', 'med', 'low'}}
SHAPES = ['nature hits a town', 'something huge gets built', 'one person crosses a big world',
          'a crowd does one thing at once', 'new machines on real streets', 'real capers', 'finds at the edge',
          'the system as a world', 'above and below', 'two worlds side by side', 'the place changes', 'none fits']


def path(args, name):
    return os.path.normpath(os.path.join(args.dir, name))


def read_csv(p):
    with open(p, newline='', encoding='utf-8') as f:
        return list(csv.DictReader(f))


def write_csv(p, rows, cols):
    with open(p, 'w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=cols, extrasaction='ignore')
        w.writeheader()
        w.writerows(rows)


def host_key(url):
    host = urlsplit(url.strip()).netloc.lower().split(':')[0]
    for pre in ('www.', 'edition.', 'amp.'):
        if host.startswith(pre):
            host = host[len(pre):]
    return host


def outlet_of(url):
    host = host_key(url)
    for dom, name in OUTLETS.items():
        if host == dom or host.endswith('.' + dom):
            return name
    return None


def url_key(url):
    s = urlsplit(url.strip())
    p = re.sub(r'/(amp/?)?$', '', s.path.rstrip('/'))
    return host_key(url) + p.lower()


# ---------------------------------------------------------------- merge and sample

def cmd_merge(args):
    # the feeds first: a story found both ways keeps its feed row (complete, dated lists)
    parts = sorted(f for f in os.listdir(path(args, 'parts')) if re.fullmatch(r'corpus_C\d+\.csv', f))
    if os.path.exists(path(args, os.path.join('parts', 'corpus_feeds.csv'))):
        parts = ['corpus_feeds.csv'] + parts
    kept, dropped, seen = [], [], {}
    for f in parts:
        for r in read_csv(path(args, os.path.join('parts', f))):
            r = {k: (v or '').strip() for k, v in r.items() if k}
            why = []
            outlet = outlet_of(r.get('url', ''))
            if not r.get('url', '').startswith('http'):
                why.append('no url')
            elif outlet is None:
                why.append('url not one of the outlets')
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', r.get('date', '')):
                why.append('no date')
            elif not (WINDOW[0] <= r['date'] <= WINDOW[1]):
                why.append('date outside the window')
            feed = r.get('stratum') == 'F'
            for k in ('headline',) if feed else ('headline', 'summary'):
                if not r.get(k):
                    why.append('no ' + k)
            if r.get('stratum') not in ('A', 'B', 'F'):
                why.append('stratum not A/B/F')
            key = url_key(r.get('url', ''))
            if not why and key in seen:
                why.append('duplicate of ' + seen[key])
            if why:
                dropped.append((r.get('id', '?'), f, '; '.join(why)))
                continue
            seen[key] = r.get('id', '?')
            r['outlet'] = outlet
            r['collector'] = r.get('collector') or f[len('corpus_'):-len('.csv')]
            r['source'] = 'rss' if feed else 'search'
            kept.append(r)
    write_csv(path(args, 'corpus.csv'), kept, CORPUS_COLS)
    log = ['# merge log', f'kept {len(kept)}, dropped {len(dropped)}']
    log += [f'- {sid} ({f}): {why}' for sid, f, why in dropped]
    with open(path(args, os.path.join('parts', 'merge_log.txt')), 'w', encoding='utf-8') as fh:
        fh.write('\n'.join(log) + '\n')
    print('\n'.join(log[:2]))
    by = Counter((r['outlet'], r['stratum']) for r in kept)
    print('\n| outlet | search A | search B | feeds | all |\n|---|---|---|---|---|')
    for o in sorted({o for o, _ in by}):
        a, b, f_ = by[(o, 'A')], by[(o, 'B')], by[(o, 'F')]
        print(f'| {o} | {a} | {b} | {f_} | {a + b + f_} |')
    print('\ntypes:', dict(Counter(r.get('type', '') for r in kept)))
    weeks = Counter('09-28..10-06' if r['date'] <= '2026-10-06' else '10-07..10-20' if r['date'] <= '2026-10-20'
                    else '10-21..10-28' for r in kept)
    print('dates:', dict(sorted(weeks.items())))
    short = [r['id'] for r in kept if r['source'] == 'search' and len(r['summary'].split()) < 10]
    if short:
        print('thin summaries (< 10 words):', ' '.join(short))


def cmd_select(args):
    """Stage 2: the top N by the triage (t_fit, then t_wow) plus a seeded random 10 % of the rest as a control."""
    corpus = {r['id']: r for r in read_csv(path(args, 'corpus.csv'))}
    tri = {}
    for f in sorted(os.listdir(path(args, 'parts'))):
        if re.fullmatch(r'triage_\w+\.csv', f):
            for r in read_csv(path(args, os.path.join('parts', f))):
                if r['id'] in corpus:
                    tri[r['id']] = r
    missing = sorted(set(corpus) - set(tri))
    if missing:
        print(f'not triaged ({len(missing)}): ' + ' '.join(missing[:40]))
    rank = sorted(tri, key=lambda i: (-(num(tri[i]['t_fit']) or 0), -(num(tri[i]['t_wow']) or 0), i))
    top = rank[:args.n]
    rest = rank[args.n:]
    rng = random.Random(SEED)
    control = sorted(rng.sample(rest, math.ceil(0.1 * len(rest)))) if rest else []
    write_csv(path(args, 'triage.csv'), [dict(tri[i], stage2='top' if i in top else 'control' if i in control else '')
                                         for i in sorted(tri)], ['id', 't_fit', 't_wow', 't_conf', 'stage2'])
    with open(path(args, 'stage2_ids.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(sorted(top + control)) + '\n')
    cut = num(tri[top[-1]]['t_fit']) if top else None
    print(f'{len(tri)} triaged; stage 2 = top {len(top)} (t_fit >= {cut}) + control {len(control)} = '
          f'{len(top) + len(control)} -> stage2_ids.txt, triage.csv')


def cmd_sample(args):
    rows = read_csv(path(args, 'corpus.csv'))
    if os.path.exists(path(args, 'stage2_ids.txt')):
        with open(path(args, 'stage2_ids.txt'), encoding='utf-8') as f:
            keep = {x.strip() for x in f if x.strip()}
        rows = [r for r in rows if r['id'] in keep]
    rng = random.Random(SEED)
    by = defaultdict(list)
    for r in rows:
        by[r['source']].append(r['id'])
    ids = []
    for c in sorted(by):
        ids += rng.sample(by[c], math.ceil(0.2 * len(by[c])))
    ids.sort()
    with open(path(args, 'blind_sample_ids.txt'), 'w', encoding='utf-8') as f:
        f.write('\n'.join(ids) + '\n')
    print(f'{len(ids)} of {len(rows)} ids (seed {SEED}, stratified by source) -> blind_sample_ids.txt')


# ---------------------------------------------------------------- scores

def num(v):
    try:
        return float(v)
    except (TypeError, ValueError):
        return None


def sums(r):
    s = {k: num(r.get(k)) for k in RANGES}
    if any(v is None for v in s.values()):
        return None
    fit = s['W'] + s['H'] + s['D'] + s['N'] + s['M']
    value = (6 * s['R'] + 5 * s['T'] + 3 * s['Mo'] + 2 * s['F'] + s['S']) / 17
    owner = (6 * s['R'] + 5 * s['T'] + 4 * fit + 3 * s['Mo'] + 2 * s['F'] + s['S']) / 21
    return fit, value, owner


def shape_of(v):
    v = (v or '').strip().lower().rstrip('.')
    if v in SHAPES:
        return v
    for s in SHAPES:
        if s.split(' ', 1)[-1] in v or v in s:
            return s
    return None


def cmd_check(args):
    p = args.file if os.path.isabs(args.file) else path(args, args.file)
    rows = read_csv(p)
    problems = []
    corpus = {r['id'] for r in read_csv(path(args, 'corpus.csv'))}
    if os.path.basename(p) == 'scores_blind.csv':
        with open(path(args, 'blind_sample_ids.txt'), encoding='utf-8') as f:
            want = {x.strip() for x in f if x.strip()}
    elif os.path.exists(path(args, 'stage2_ids.txt')):
        with open(path(args, 'stage2_ids.txt'), encoding='utf-8') as f:
            want = {x.strip() for x in f if x.strip()}
    else:
        want = corpus
    have = [r['id'] for r in rows]
    missing = sorted(want - set(have))
    extra = sorted(set(have) - want)
    dups = sorted(k for k, n in Counter(have).items() if n > 1)
    if missing:
        problems.append(f'missing ids ({len(missing)}): ' + ' '.join(missing))
    if extra:
        problems.append('ids not expected: ' + ' '.join(extra))
    if dups:
        problems.append('ids twice: ' + ' '.join(dups))
    for r in rows:
        for k, (lo, hi) in RANGES.items():
            v = num(r.get(k))
            if v is None or not (lo <= v <= hi) or v != int(v):
                problems.append(f"{r['id']}: {k}={r.get(k)!r} not an integer in {lo}-{hi}")
        w = num(r.get('wow'))
        if w is None or w not in (0, 1, 2):
            problems.append(f"{r['id']}: wow={r.get('wow')!r} not 0, 1 or 2")
        for k, allowed in ENUMS.items():
            if (r.get(k) or '').strip() not in allowed:
                problems.append(f"{r['id']}: {k}={r.get(k)!r} not in {sorted(allowed)}")
        sh = shape_of(r.get('telling_shape'))
        if sh is None:
            problems.append(f"{r['id']}: telling_shape={r.get('telling_shape')!r} not on the list")
        elif args.fix:
            r['telling_shape'] = sh
        t = sums(r)
        if t is None:
            continue
        fit, value, owner = t
        if args.fix:
            r['fit'], r['value'], r['owner'] = '%d' % fit, '%.2f' % value, '%.2f' % owner
        elif num(r.get('fit')) != fit or abs((num(r.get('value')) or -9) - value) > 0.011 or \
                abs((num(r.get('owner')) or -9) - owner) > 0.011:
            problems.append(f"{r['id']}: fit/value/owner do not match the sub-scores (run with --fix)")
    if args.fix:
        cols = SCORE_COLS + [c for c in rows[0].keys() if c not in SCORE_COLS] if rows else SCORE_COLS
        write_csv(p, rows, cols)
        print(f'fixed sums in {p}')
    print(f'{len(rows)} rows; {len(problems)} problems')
    for x in problems[:200]:
        print(' -', x)
    return 1 if problems else 0


# ---------------------------------------------------------------- agreement

def spearman(a, b):
    from scipy.stats import spearmanr
    return float(spearmanr(a, b).statistic)


def pearson(a, b):
    from scipy.stats import pearsonr
    return float(pearsonr(a, b).statistic)


def qwk(a, b, lo, hi):
    """Quadratic weighted kappa for integer ratings in lo..hi."""
    k = hi - lo + 1
    o = [[0] * k for _ in range(k)]
    for x, y in zip(a, b):
        o[int(x) - lo][int(y) - lo] += 1
    n = len(a)
    ha = [sum(row) for row in o]
    hb = [sum(o[i][j] for i in range(k)) for j in range(k)]
    num_, den = 0.0, 0.0
    for i in range(k):
        for j in range(k):
            w = (i - j) ** 2 / (k - 1) ** 2 if k > 1 else 0
            num_ += w * o[i][j]
            den += w * ha[i] * hb[j] / n
    return 1 - num_ / den if den else float('nan')


def cohen(a, b):
    n = len(a)
    po = sum(x == y for x, y in zip(a, b)) / n
    ca, cb = Counter(a), Counter(b)
    pe = sum(ca[c] * cb[c] for c in set(a) | set(b)) / n / n
    return (po - pe) / (1 - pe) if pe < 1 else float('nan'), po


def cmd_agreement(args):
    first = {r['id']: r for r in read_csv(path(args, 'scores.csv'))}
    blind = {r['id']: r for r in read_csv(path(args, args.blind))}
    ids = sorted(i for i in blind if i in first and sums(first[i]) and sums(blind[i]))
    n = len(ids)
    out = [f'**Blind check: {n} stories** (the second scorer saw only the corpus rows and the rubric).', '']
    fa = [sums(first[i])[0] for i in ids]
    fb = [sums(blind[i])[0] for i in ids]
    diff = [y - x for x, y in zip(fa, fb)]
    mad = sum(abs(d) for d in diff) / n
    within = sum(abs(d) <= 1 for d in diff) / n
    rho = spearman(fa, fb)
    verdict = 'GOOD' if rho >= 0.7 and mad <= 1.0 and within >= 0.7 else \
        'POOR' if rho < 0.6 or mad > 1.5 else 'ACCEPTABLE'
    out += ['| Measure | Fit (0-10) | Value (0-10) | Owner score |', '|---|---|---|---|']
    va = [sums(first[i])[1] for i in ids]
    vb = [sums(blind[i])[1] for i in ids]
    oa = [sums(first[i])[2] for i in ids]
    ob = [sums(blind[i])[2] for i in ids]
    out.append(f'| Spearman rho | {rho:.2f} | {spearman(va, vb):.2f} | {spearman(oa, ob):.2f} |')
    out.append(f'| Pearson r | {pearson(fa, fb):.2f} | {pearson(va, vb):.2f} | {pearson(oa, ob):.2f} |')
    out.append(f'| Mean absolute difference | {mad:.2f} | {sum(abs(y - x) for x, y in zip(va, vb)) / n:.2f} | '
               f'{sum(abs(y - x) for x, y in zip(oa, ob)) / n:.2f} |')
    out.append(f'| Within +-1 | {within:.0%} | {sum(abs(y - x) <= 1 for x, y in zip(va, vb)) / n:.0%} | '
               f'{sum(abs(y - x) <= 1 for x, y in zip(oa, ob)) / n:.0%} |')
    out.append(f'| Mean (second - first) | {sum(diff) / n:+.2f} | {sum(y - x for x, y in zip(va, vb)) / n:+.2f} | '
               f'{sum(y - x for x, y in zip(oa, ob)) / n:+.2f} |')
    out += ['', f'**Verdict on fit: {verdict}** (good: rho >= 0.7, MAD <= 1.0, >= 70 % within +-1; poor: rho < 0.6 or '
            'MAD > 1.5).', '', '| Sub-score | Exact | Within +-1 | Weighted kappa | Mean (second - first) |',
            '|---|---|---|---|---|']
    for k, (lo, hi) in RANGES.items():
        a = [int(num(first[i][k])) for i in ids]
        b = [int(num(blind[i][k])) for i in ids]
        out.append(f'| {k} | {sum(x == y for x, y in zip(a, b)) / n:.0%} | '
                   f'{sum(abs(x - y) <= 1 for x, y in zip(a, b)) / n:.0%} | {qwk(a, b, lo, hi):.2f} | '
                   f'{sum(y - x for x, y in zip(a, b)) / n:+.2f} |')
    a = [int(num(first[i].get('wow')) or 0) for i in ids]
    b = [int(num(blind[i].get('wow')) or 0) for i in ids]
    out.append(f'| wow | {sum(x == y for x, y in zip(a, b)) / n:.0%} | '
               f'{sum(abs(x - y) <= 1 for x, y in zip(a, b)) / n:.0%} | {qwk(a, b, 0, 2):.2f} | '
               f'{sum(y - x for x, y in zip(a, b)) / n:+.2f} |')
    out += ['', '| Tag | Agreement | Cohen kappa |', '|---|---|---|']
    for k in ('gate', 'world', 'happens_to', 'mood', 'telling_shape', 'conflict', 'everyday', 'ad_risk', 'tech_ai'):
        f = (lambda v: shape_of(v) or v) if k == 'telling_shape' else (lambda v: (v or '').strip())
        a = [f(first[i].get(k)) for i in ids]
        b = [f(blind[i].get(k)) for i in ids]
        kap, po = cohen(a, b)
        out.append(f'| {k} | {po:.0%} | ' + ('n/a (one value only)' if math.isnan(kap) else f'{kap:.2f}') + ' |')
    big = sorted(((abs(d), i, x, y) for d, i, x, y in zip(diff, ids, fa, fb) if abs(d) >= 3), reverse=True)
    if big:
        out += ['', 'Fit disagreements of 3+ points: ' + '; '.join(f'{i} ({x:.0f} vs {y:.0f})' for _, i, x, y in big)]
    print('\n'.join(out))
    return 0 if verdict != 'POOR' else 2


# ---------------------------------------------------------------- clusters, top, chart

def load_all(args):
    corpus = {r['id']: r for r in read_csv(path(args, 'corpus.csv'))}
    scores = {r['id']: r for r in read_csv(path(args, 'scores.csv'))}
    clusters = {}
    if os.path.exists(path(args, 'clusters.csv')):
        clusters = {r['id']: r['cluster'].strip() for r in read_csv(path(args, 'clusters.csv'))}
    return corpus, scores, clusters


def cluster_table(args):
    corpus, scores, clusters = load_all(args)
    groups = defaultdict(list)
    for i, c in clusters.items():
        if i in scores and sums(scores[i]):
            groups[c].append(i)
    table = []
    for c, ids in groups.items():
        fits = [sums(scores[i])[0] for i in ids]
        vals = [sums(scores[i])[1] for i in ids]
        owners = [sums(scores[i])[2] for i in ids]
        dup = {i for i in ids if (scores[i].get('dup_of') or '').strip() in ids}
        table.append({
            'cluster': c, 'rows': len(ids), 'events': len(ids) - len(dup),
            'fit': sum(fits) / len(ids), 'value': sum(vals) / len(ids), 'owner': sum(owners) / len(ids),
            'fit6': sum(f >= 6 for f in fits) / len(ids),
            'pos': sum(scores[i]['mood'] == 'pos' for i in ids) / len(ids),
            'real': sum(scores[i]['world'] == 'real' for i in ids) / len(ids),
            'to': sum(scores[i]['happens_to'] == 'to' for i in ids) / len(ids),
            'fail': sum(scores[i]['gate'] == 'fail' for i in ids) / len(ids),
            'wow2': sum(num(scores[i].get('wow')) == 2 for i in ids) / len(ids),
            'tech': sum(scores[i].get('tech_ai') == 'Y' for i in ids) / len(ids),
            'shapes': Counter(shape_of(scores[i]['telling_shape']) for i in ids).most_common(2),
            'ids': ids,
        })
    table.sort(key=lambda t: -(t['fit'] + t['value']))
    return corpus, scores, clusters, table


def cmd_stats(args):
    corpus, scores, clusters, table = cluster_table(args)
    unassigned = sorted(set(scores) - set(clusters))
    print(f'**{len(scores)} scored rows, {len(clusters)} clustered, {len(table)} clusters.**' +
          (f' Not clustered: {" ".join(unassigned)}' if unassigned else ''))
    print('\n| Cluster | Rows | Events | Mean fit | Mean value | Mean owner | Fit >= 6 | WOW 2 | Positive | Real place | '
          'Happens TO | Tech/AI | Gate fail | Top telling shapes |')
    print('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|')
    for t in table:
        sh = ', '.join(f'{s} ({n})' for s, n in t['shapes'])
        print(f"| {t['cluster']} | {t['rows']} | {t['events']} | {t['fit']:.1f} | {t['value']:.1f} | "
              f"{t['owner']:.1f} | {t['fit6']:.0%} | {t['wow2']:.0%} | {t['pos']:.0%} | {t['real']:.0%} | "
              f"{t['to']:.0%} | {t['tech']:.0%} | {t['fail']:.0%} | {sh} |")
    for label, keep in (('Stratum A (section-neutral: the base rate)', 'A'), ('Stratum B (place-targeted)', 'B'),
                        ('All rows', None)):
        ids = [i for i in scores if sums(scores[i]) and (keep is None or corpus.get(i, {}).get('stratum') == keep)]
        if not ids:
            continue
        fits = [sums(scores[i])[0] for i in ids]
        print(f'\n**{label}: {len(ids)} rows.** Mean fit {sum(fits) / len(fits):.1f}; fit >= 6: '
              f'{sum(f >= 6 for f in fits) / len(fits):.0%}; fit >= 8: {sum(f >= 8 for f in fits) / len(fits):.0%}; '
              f'gate fail: {sum(scores[i]["gate"] == "fail" for i in ids) / len(ids):.0%}.')
        hist = Counter(int(f) for f in fits)
        print('Fit histogram: ' + ', '.join(f'{k}: {hist[k]}' for k in range(11)))
    for dim in ('outlet', 'section', 'type'):
        agg = defaultdict(list)
        for i in scores:
            if sums(scores[i]) and i in corpus:
                agg[corpus[i].get(dim, '') or '?'].append(sums(scores[i])[0])
        rows = sorted(agg.items(), key=lambda kv: -sum(kv[1]) / len(kv[1]))
        if dim == 'section':
            rows = [kv for kv in rows if len(kv[1]) >= 4]
        print(f'\n| By {dim} | Rows | Mean fit | Fit >= 6 |\n|---|---|---|---|')
        for k, v in rows:
            print(f'| {k} | {len(v)} | {sum(v) / len(v):.1f} | {sum(f >= 6 for f in v) / len(v):.0%} |')


def print_slice(title, ids, corpus, scores):
    ids = [i for i in ids if sums(scores[i])]
    if not ids:
        print(f'\n**{title}: none.**')
        return
    fits = [sums(scores[i])[0] for i in ids]
    vals = [sums(scores[i])[1] for i in ids]
    wows = [num(scores[i].get('wow')) or 0 for i in ids]
    print(f'\n**{title}: {len(ids)} rows.** Mean fit {sum(fits) / len(ids):.1f}, mean value {sum(vals) / len(ids):.1f}, '
          f'WOW 2: {sum(w == 2 for w in wows)}, positive: {sum(scores[i]["mood"] == "pos" for i in ids)}.')
    print('\n| id | Owner | Fit | Value | WOW | Outlet, date | Headline | View |\n|---|---|---|---|---|---|---|---|')
    for i in sorted(ids, key=lambda q: -sums(scores[q])[2]):
        f, v, o = sums(scores[i])
        c = corpus.get(i, {})
        print(f"| {i} | {o:.2f} | {f:.0f} | {v:.2f} | {scores[i].get('wow')} | {c.get('outlet')}, {c.get('date')} | "
              f"{c.get('headline', '')} | {scores[i].get('view', '')} |")


def cmd_slices(args):
    corpus, scores, _ = load_all(args)
    tech = [i for i, r in scores.items() if r.get('tech_ai') == 'Y' and (num(r.get('W')) or 0) >= 2]
    dc = [i for i in scores if re.search(r'data[ -]?cent(er|re)s?', (corpus.get(i, {}).get('headline', '') + ' ' +
                                                                   corpus.get(i, {}).get('summary', '')), re.I)]
    print_slice('Tech in the cities (tech_ai Y and W >= 2)', tech, corpus, scores)
    print_slice('Data centres (headline or summary)', dc, corpus, scores)


def cmd_top(args):
    corpus, scores, _ = load_all(args)
    cand = [i for i, r in scores.items() if sums(r) and r['gate'] == 'pass' and r['past_topic'] == 'N'
            and sums(r)[0] >= 6 and (num(r.get('wow')) or 0) >= 1]
    cand.sort(key=lambda i: (-round(sums(scores[i])[2], 2), -(num(scores[i].get('wow')) or 0)))
    print(f'{len(cand)} candidates (gate pass, fit >= 6, WOW >= 1, not a past topic); top {args.n} by owner score:\n')
    print('| # | id | Owner | Fit | Value | WOW | Mood | Outlet, date | Headline | View |\n'
          '|---|---|---|---|---|---|---|---|---|---|')
    for k, i in enumerate(cand[:args.n], 1):
        f, v, o = sums(scores[i])
        c = corpus.get(i, {})
        print(f"| {k} | {i} | {o:.2f} | {f:.0f} | {v:.2f} | {scores[i].get('wow')} | {scores[i]['mood']} | "
              f"{c.get('outlet')}, {c.get('date')} | "
              f"{c.get('headline', '')} | {scores[i].get('view', '')} |")


def cmd_chart(args):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    from matplotlib import font_manager, patheffects

    corpus, scores, clusters, table = cluster_table(args)
    if not table:
        sys.exit('no clusters.csv rows')
    for w in ('Regular', 'Medium', 'SemiBold'):
        fp = f'/usr/share/fonts/opentype/inter/Inter-{w}.otf'
        if os.path.exists(fp):
            font_manager.fontManager.addfont(fp)
    plt.rcParams['font.family'] = 'Inter' if any('Inter' in f.name for f in font_manager.fontManager.ttflist) \
        else 'DejaVu Sans'
    SURFACE, INK, INK2, MUTED, RULE, SERIES = '#fcfcfb', '#0b0b0b', '#52514e', '#8a8984', '#e3e2de', '#2a78d6'
    W, H, DPI = 1080, 1500, 100
    fig = plt.figure(figsize=(W / DPI, H / DPI), dpi=DPI, facecolor=SURFACE)
    ax = fig.add_axes([0.13, 0.22, 0.82, 0.57], facecolor=SURFACE)
    xs = [t['value'] for t in table]
    ys = [t['fit'] for t in table]
    ns = [t['rows'] for t in table]
    x0 = math.floor(min(xs) * 2) / 2 - 0.5
    x1 = math.ceil(max(xs) * 2) / 2 + 0.5
    y0 = max(0, math.floor(min(ys)) - 1)
    y1 = min(10, math.ceil(max(ys)) + 1)
    ax.set_xlim(x0, x1)
    ax.set_ylim(y0, y1)
    allf = [sums(scores[i])[0] for i in scores if sums(scores[i])]
    allv = [sums(scores[i])[1] for i in scores if sums(scores[i])]
    mf, mv = sum(allf) / len(allf), sum(allv) / len(allv)
    ax.axhline(mf, color=RULE, lw=1.5, zorder=1)
    ax.axvline(mv, color=RULE, lw=1.5, zorder=1)
    ax.text(x1 - 0.05, y1 - 0.15, 'fits our look\nand worth telling', ha='right', va='top', fontsize=22,
            color=MUTED, zorder=2)
    ax.text(x1 - 0.05, mf - 0.12, f'average fit {mf:.1f}', ha='right', va='top', fontsize=17, color=MUTED)
    ax.text(mv + 0.04, y0 + 0.12, f'average value {mv:.1f}', ha='left', va='bottom', fontsize=17, color=MUTED)
    k = 5200 / max(ns)
    ax.scatter(xs, ys, s=[k * n for n in ns], color=SERIES, alpha=0.82, edgecolors=SURFACE, linewidths=2.5,
               zorder=3)
    # labels: 3 rings x 8 directions around each bubble; the least crowded spot wins (a leader line when it sits
    # off the first ring); never on another label, as rarely as possible on a bubble, always inside the plot
    fig.canvas.draw()
    rend = fig.canvas.get_renderer()
    axbox = ax.get_window_extent()
    circles = []
    for x, y, n in zip(xs, ys, ns):
        cx, cy = ax.transData.transform((x, y))
        circles.append((cx, cy, math.sqrt(k * n) / 2 * DPI / 72))

    def hits_circle(b, c):
        nx, ny = min(max(c[0], b[0]), b[2]), min(max(c[1], b[1]), b[3])
        return (nx - c[0]) ** 2 + (ny - c[1]) ** 2 < c[2] ** 2

    def hits_box(a, b):
        return not (a[2] < b[0] or a[0] > b[2] or a[3] < b[1] or a[1] > b[3])

    inv = ax.transData.inverted()
    placed = []
    for j in sorted(range(len(table)), key=lambda q: -ns[q]):
        cx, cy, r = circles[j]
        txt = ax.text(0, 0, f"{table[j]['cluster']} ({ns[j]})", fontsize=20, color=INK, zorder=5,
                      path_effects=[patheffects.withStroke(linewidth=5, foreground=SURFACE)])
        best = None
        for ring_i, ring in enumerate((7, 38, 76, 120)):
            for deg in (0, 180, 90, 270, 35, 145, 325, 215, 60, 120, 300, 240):
                a = math.radians(deg)
                ca, sa = math.cos(a), math.sin(a)
                px, py = cx + ca * (r + ring), cy + sa * (r + ring)
                ha = 'left' if ca > 0.3 else 'right' if ca < -0.3 else 'center'
                va = 'bottom' if sa > 0.3 else 'top' if sa < -0.3 else 'center'
                txt.set_position(inv.transform((px, py)))
                txt.set_ha(ha)
                txt.set_va(va)
                e = txt.get_window_extent(rend)
                b = (e.x0 - 4, e.y0 - 3, e.x1 + 4, e.y1 + 3)
                inside = b[0] >= axbox.x0 + 2 and b[2] <= axbox.x1 - 2 and b[1] >= axbox.y0 + 2 and b[3] <= axbox.y1 - 2
                score = (0 if inside else 1000) + 100 * sum(hits_box(b, o) for o in placed) + \
                    20 * sum(hits_circle(b, c) for q, c in enumerate(circles) if q != j) + 3 * ring_i
                if best is None or score < best[0]:
                    best = (score, (px, py, ha, va), b, ring_i, (cx + ca * r, cy + sa * r))
            if best[0] < 3 * (ring_i + 1):
                break
        _, (px, py, ha, va), b, ring_i, edge = best
        txt.set_position(inv.transform((px, py)))
        txt.set_ha(ha)
        txt.set_va(va)
        placed.append(b)
        if ring_i > 0:
            (x0_, y0_), (x1_, y1_) = inv.transform(edge), inv.transform((px, py))
            ax.plot([x0_, x1_], [y0_, y1_], color=MUTED, lw=1.2, zorder=4, solid_capstyle='round')
    for s in ('top', 'right'):
        ax.spines[s].set_visible(False)
    for s in ('left', 'bottom'):
        ax.spines[s].set_color(RULE)
    ax.tick_params(colors=INK2, labelsize=18, length=0, pad=8)
    ax.grid(False)
    ax.set_xlabel('Story value (0-10): relevant, true, positive, fresh, shareable', fontsize=19, color=INK2,
                  labelpad=14)
    ax.set_ylabel('Visual fit with our look (0-10)', fontsize=19, color=INK2, labelpad=14)
    n_all = len(scores)
    outlets = len({corpus[i]['outlet'] for i in scores if i in corpus})
    fig.text(0.06, 0.955, args.title or 'Which kinds of news fit our look', fontsize=40, color=INK, weight=600,
             va='top')
    fig.text(0.06, 0.905, f'{n_all} stories from {outlets} big outlets, 28 Sep - 28 Oct 2026.\n'
             'Each bubble is one kind of story; bigger = more stories.', fontsize=21, color=INK2, va='top',
             linespacing=1.4)
    # size key
    key_n = sorted({max(1, round(max(ns) / 4)), max(1, round(max(ns) / 2)), max(ns)})
    fig.text(0.06, 0.06, 'Bubble size:', fontsize=19, color=INK2, va='center')
    kax = fig.add_axes([0.25, 0.015, 0.7, 0.09], facecolor=SURFACE)
    kax.set_xlim(0, 3)
    kax.set_ylim(0, 1)
    kax.axis('off')
    for j, n in enumerate(key_n):
        kax.scatter([0.35 + j], [0.5], s=[k * n], color=SERIES, alpha=0.82, edgecolors=SURFACE, linewidths=2.5)
        r_px = math.sqrt(k * n) / 2 * DPI / 72
        kax.text(0.35 + j + (r_px + 12) / (0.7 * W / 3), 0.5, f'{n} stories', fontsize=18, color=INK2, va='center')
    out = path(args, 'cluster_chart.png')
    fig.savefig(out, dpi=DPI, facecolor=SURFACE)
    print('wrote', out)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dir', default=DEFAULT_DIR)
    sub = ap.add_subparsers(dest='cmd', required=True)
    sub.add_parser('merge')
    sub.add_parser('sample')
    se = sub.add_parser('select')
    se.add_argument('n', nargs='?', type=int, default=250)
    c = sub.add_parser('check')
    c.add_argument('file')
    c.add_argument('--fix', action='store_true')
    a = sub.add_parser('agreement')
    a.add_argument('--blind', default='scores_blind.csv')
    sub.add_parser('stats')
    sub.add_parser('slices')
    t = sub.add_parser('top')
    t.add_argument('n', nargs='?', type=int, default=10)
    ch = sub.add_parser('chart')
    ch.add_argument('--title', default='')
    args = ap.parse_args()
    fn = {'merge': cmd_merge, 'select': cmd_select, 'sample': cmd_sample, 'check': cmd_check, 'agreement': cmd_agreement,
          'stats': cmd_stats, 'slices': cmd_slices, 'top': cmd_top, 'chart': cmd_chart}[args.cmd]
    sys.exit(fn(args) or 0)


if __name__ == '__main__':
    main()
