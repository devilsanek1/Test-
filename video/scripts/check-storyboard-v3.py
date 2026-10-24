"""check-storyboard-v3.py: the director's extra lint for the word-anchored v3 storyboard, on BOTH timings.

  python3 -I scripts/check-storyboard-v3.py                       # resolves docs/storyboard_v3.json against
                                                                  # assets/timing_est_v3.json and assets/timing_v3.json
  python3 -I scripts/check-storyboard-v3.py RES_EST.json RES_REC.json   # or lint two already-resolved storyboards
Checks beyond scripts/check-storyboard.py: beat order identical on both takes, beats inside their scene, life (events/s, onset
gaps with spans), label holds / holdAloneBefore / placement through the camera, Pip pose tops, sun tops, camera on-screen speed
(px/frame) and velocity steps outside the declared allow windows, log-zoom rates across the dive seams, cut-on-action speeds,
peak budget, sign-joke ids.
"""
import json
import math
import re
import sys

PEAK_LIMIT = 18.0
DV_LIMIT = 2.5
FPS = 30
issues = []


def issue(sev, where, msg):
    issues.append((sev, where, msg))
    print(f'  [{sev}] {where}: {msg}')


def cruise(acc=0.25, dec=0.35):
    a, d = acc, dec
    v = 1 / (1 - (a + d) / 2)

    def f(u):
        x = min(1, max(0, u))
        if x < a:
            return v * (x / 2 - (a / (2 * math.pi)) * math.sin(math.pi * x / a))
        if x > 1 - d:
            y = 1 - x
            return 1 - v * (y / 2 - (d / (2 * math.pi)) * math.sin(math.pi * y / d))
        return v * (a / 2 + (x - a))
    return f


def bez(x1, y1, x2, y2):
    def f(u):
        lo, hi = 0.0, 1.0
        for _ in range(40):
            m = (lo + hi) / 2
            x = 3 * (1 - m) ** 2 * m * x1 + 3 * (1 - m) * m ** 2 * x2 + m ** 3
            lo, hi = (m, hi) if x < u else (lo, m)
        m = (lo + hi) / 2
        return 3 * (1 - m) ** 2 * m * y1 + 3 * (1 - m) * m ** 2 * y2 + m ** 3
    return f


EASES = {
    'none': lambda u: 0.0, 'linear': lambda u: u,
    'inOut(sine)': lambda u: 0.5 - 0.5 * math.cos(math.pi * u), 'in(sine)': lambda u: 1 - math.cos(math.pi * u / 2), 'out(sine)': lambda u: math.sin(math.pi * u / 2),
    'in(quad)': lambda u: u * u, 'out(quad)': lambda u: 1 - (1 - u) ** 2, 'in(cubic)': lambda u: u ** 3, 'out(cubic)': lambda u: 1 - (1 - u) ** 3,
    'inOut(cubic)': lambda u: 4 * u ** 3 if u < 0.5 else 1 - (-2 * u + 2) ** 3 / 2, 'out(quart)': lambda u: 1 - (1 - u) ** 4,
    'out(expo)': lambda u: 1.0 if u >= 1 else (1 - 2 ** (-10 * u)) / (1 - 2 ** -10),
    'reveal-from-rest (log zoom, anchored)': cruise(0.25, 0.35),
}


def ease_fn(name):
    if name in EASES:
        return EASES[name]
    m = re.match(r'bezier\(([\d.]+),([\d.]+),([\d.]+),([\d.]+)\)', name.replace(' ', ''))
    if m:
        return bez(*map(float, m.groups()))
    raise KeyError(name)


def cam_state(seg, t):
    u = 0.0 if seg['t1'] <= seg['t0'] else min(1.0, max(0.0, (t - seg['t0']) / (seg['t1'] - seg['t0'])))
    e = ease_fn(seg['ease'])(u)
    f, to = seg['from'], seg['to']
    z = f['zoom'] * (to['zoom'] / f['zoom']) ** e
    if seg.get('interp') == 'log-anchored':
        ax, ay = seg['anchor']['world']
        sx0, sy0 = seg['anchor']['screenFrom']
        sx1, sy1 = seg['anchor']['screenTo']
        sx, sy = sx0 + (sx1 - sx0) * e, sy0 + (sy1 - sy0) * e
        return {'x': ax - (sx - 540) / z, 'y': ay - (sy - 960) / z, 'zoom': z}
    return {'x': f['x'] + (to['x'] - f['x']) * e, 'y': f['y'] + (to['y'] - f['y']) * e, 'zoom': z}


def cam_at(scene, t):
    segs = scene['camera']
    for s in segs:
        if s['t0'] - 1e-9 <= t <= s['t1'] + 1e-9:
            return cam_state(s, t), s
    s = segs[0] if t < segs[0]['t0'] else segs[-1]
    return cam_state(s, t), s


def proj(c, x, y):
    return (x - c['x']) * c['zoom'] + 540, (y - c['y']) * c['zoom'] + 960


GRID = [((i + 0.5) * 1080 / 7, (j + 0.5) * 1920 / 11) for i in range(7) for j in range(11)]


def disp(ca, cb, pts=GRID):
    out = []
    for (px, py) in pts:
        wx, wy = (px - 540) / ca['zoom'] + ca['x'], (py - 960) / ca['zoom'] + ca['y']
        qx, qy = proj(cb, wx, wy)
        out.append(math.hypot(qx - px, qy - py))
    return out


def lint(path, tag, other=None):
    print(f'================ {tag}: {path}')
    SB = json.load(open(path))
    sc = SB['scenes']
    dur = SB['duration']
    allow = [(a['t0'], a['t1'], a['scene']) for a in SB.get('cameraSpeedAllow', [])]

    def allowed(t):
        return any(a - 1 / FPS - 1e-6 <= t <= b + 1 / FPS + 1e-6 for a, b, _ in allow)

    # tiling
    if abs(sc[0]['start']) > 1e-6 or abs(sc[-1]['end'] - dur) > 1e-6:
        issue('blocker', tag, f"film {sc[0]['start']} -> {sc[-1]['end']} vs duration {dur}")
    for a, b in zip(sc, sc[1:]):
        if abs(a['end'] - b['start']) > 1e-6:
            issue('blocker', f"{tag} {a['id']}/{b['id']}", 'gap / overlap')
    print('  -- life (events/s, longest onset gap incl. spans and scene edges)')
    life = {}
    for s in sc:
        st, en = s['start'], s['end']
        ts = [b['t'] for b in s['beats']]
        if ts != sorted(ts):
            issue('major', f"{tag} {s['id']}", 'beats not sorted: ' + ', '.join(f'{x:.2f}' for x in ts))
        for b in s['beats']:
            if b['t'] < st - 1e-6 or b['t'] > en + 1e-6:
                issue('major', f"{tag} {s['id']} beat {b['t']:.3f}", f"outside the scene {st:.3f}-{en:.3f}: {b['action'][:60]}")
        ev = sum(b['events'] for b in s['beats'])
        eps = ev / (en - st)
        pts = [st]
        for b in s['beats']:
            n = max(1, b['events'])
            sp = b.get('span', 0.0)
            pts += [b['t'] + (sp * k / (n - 1) if n > 1 else 0) for k in range(n)]
        pts = sorted(p for p in pts if p <= en + 1e-6) + [en]
        g, ga = max((b - a, a) for a, b in zip(pts, pts[1:]))
        life[s['id']] = (en - st, ev, eps, g, ga)
        flag = ''
        floor = 6.0 if s['id'] == 'S11' else 5.0
        if eps < floor:
            issue('major', f"{tag} {s['id']}", f'events/s {eps:.1f} < {floor}')
        if g > 0.45:
            issue('minor', f"{tag} {s['id']}", f'onset gap {g:.2f} s at {ga:.2f}')
            flag = ' <-- gap'
        print(f"    {s['id']} {st:6.2f}-{en:6.2f} ({en - st:5.2f} s) events {ev:3d} = {eps:4.1f}/s  longest gap {g:.2f} s at {ga:.2f}{flag}")
    # labels
    print('  -- labels')
    lab = {}
    for s in sc:
        for l in s['labels']:
            lab[l['id'] if l['id'] not in lab else l['id'] + '@' + s['id']] = (s, l)
    for lid, (s, l) in lab.items():
        hold = l['out'] - l['at']
        if l.get('carriesInto'):
            cont = [x for x in lab.values() if x[1]['id'] == l['id'] and x[0]['id'] == l['carriesInto']]
            hold = cont[0][1]['out'] - l['at'] if cont else hold
        if l.get('continues'):
            prev = [x for x in lab.values() if x[1]['id'] == l['id'] and x[0]['id'] == l['continues']]
            hold = l['out'] - prev[0][1]['at'] if prev else hold
        if hold < 1.5 - 1e-6:
            issue('major', f"{tag} {lid}", f'hold {hold:.2f} s < 1.5')
        if l['at'] < s['start'] - 1e-6 or l['out'] > s['end'] + 1e-6:
            issue('major', f"{tag} {lid}", f"life {l['at']:.2f}-{l['out']:.2f} outside {s['id']} {s['start']:.2f}-{s['end']:.2f}")
        ha = l.get('holdAloneBefore')
        if ha:
            nxt = min(lab[x][1]['at'] for x in ha['labels'])
            if nxt - l['at'] < ha['min'] - 1e-6:
                issue('major', f"{tag} {lid}", f"holds alone {nxt - l['at']:.2f} s < {ha['min']} before {ha['labels']}")
            else:
                print(f"    {lid} holds alone {nxt - l['at']:.2f} s before the count ({ha['min']} s required)")
        box = l.get('box')
        if box:
            end_chk = l['out']
            if l.get('exitsWith') and 'camera' in l['exitsWith']:
                end_chk = max(l['at'], s['camera'][-1]['t0'])
            times = [l['at']] + [c[k] for c in s['camera'] for k in ('t0', 't1') if l['at'] < c[k] < end_chk] + [end_chk - 1e-3]
            worst = None
            for t in times:
                c, _ = cam_at(s, t)
                if box['space'] == 'screen':
                    x0, x1, y0, y1 = box['x0'], box['x1'], box['y0'], box['y1']
                else:
                    x0, y0 = proj(c, box['x0'], box['y0'])
                    x1, y1 = proj(c, box['x1'], box['y1'])
                bad = []
                if x0 < 90 - 0.5: bad.append(f'x0 {x0:.0f}')
                if x1 > 930 + 0.5: bad.append(f'x1 {x1:.0f}')
                if y0 < 600 - 0.5: bad.append(f'y0 {y0:.0f}')
                if y1 > 1480 + 0.5: bad.append(f'y1 {y1:.0f}')
                if bad:
                    worst = (t, bad)
            if worst:
                issue('minor', f"{tag} {lid}", f'outside the label box x 90-930 / y 600-1480 at t={worst[0]:.2f}: {worst[1]}')
        print(f"    {s['id']} {lid:4s} {l['at']:6.2f}-{l['out']:6.2f} hold {hold:4.2f} s  {l['text'][:58]}")
    # Pip tops
    for s in sc:
        p = s.get('pip')
        if not p:
            continue
        keys = [(c['t0'], c) for c in s['camera'] if not c.get('transition')] + [(c['t1'], c) for c in s['camera'] if not c.get('transition')]
        for t, seg in keys:
            if p['space'] == 'screen':
                fx, fy = p['x'], p['y']
            else:
                c = cam_state(seg, t)
                if s['id'] == 'S09' and seg.get('interp') == 'log-anchored':
                    continue
                if s['id'] == 'S09' and t >= seg['t0'] and seg['from']['zoom'] == 1.0 and seg['to']['zoom'] == 1.0 and p.get('partB'):
                    pb = p['partB']
                    fx, fy, sc_ = pb['x'], pb['y'], pb['scale']
                    if fy - 108 * sc_ < 560:
                        issue('major', f"{tag} {s['id']} pip(partB)", f'top {fy - 108 * sc_:.0f}')
                    continue
                fx, fy = proj(c, p['x'], p['y'])
            top = fy - 108 * p['scale']
            if top < 560 - 0.5:
                issue('major', f"{tag} {s['id']} pip t={t:.2f}", f'trunk-up top at screen y {top:.0f} < 560')
            if fy > 1510:
                issue('minor', f"{tag} {s['id']} pip t={t:.2f}", f'feet at screen y {fy:.0f} (under the bottom UI)')
    # sun tops
    for s in sc:
        for k in s.get('sunKeys', []):
            if k.get('hidden'):
                continue
            top = k['y'] - k['r'] * max(1.0, k.get('scale', 1.0))
            if top < 560 - 0.5:
                issue('major', f"{tag} {s['id']} sun t={k['t']:.2f}", f'top {top:.0f}')
            for gr in k.get('glow', []):
                if k['y'] - gr < 600 - 0.5:
                    issue('major', f"{tag} {s['id']} sun glow", f"ring top {k['y'] - gr:.0f} < 600")
    # camera speed
    print('  -- camera (on-screen px/frame of a 7 x 11 grid; flat model)')
    for s in sc:
        st, en = s['start'], s['end']
        f0, f1 = math.ceil(st * FPS), math.floor(en * FPS) - 1
        prev = None
        pk, pk_at, pk_all, pk_all_at = 0.0, None, 0.0, None
        for f in range(f0, f1 + 1):
            ta, tb = f / FPS, (f + 1) / FPS
            ca, sa = cam_at(s, ta)
            cb, sb = cam_at(s, tb)
            if sa is not sb and sb.get('cut') and abs(sb['t0'] - tb) < 1 / FPS + 1e-9 or (sa is not sb and sb.get('cut')):
                prev = None
                continue
            d = disp(ca, cb)
            m = max(d)
            if m > pk_all:
                pk_all, pk_all_at = m, ta
            if not allowed(ta):
                if m > pk:
                    pk, pk_at = m, ta
                if m > PEAK_LIMIT:
                    issue('major', f"{tag} {s['id']} camera t={ta:.2f}", f'{m:.1f} px/frame > {PEAK_LIMIT} outside the allow windows')
                if prev is not None and not allowed(ta - 1 / FPS):
                    dv = max(abs(x - y) for x, y in zip(d, prev))
                    if dv > DV_LIMIT:
                        issue('major', f"{tag} {s['id']} camera t={ta:.2f}", f'velocity step {dv:.1f} px/frame/frame > {DV_LIMIT}')
            prev = d
        print(f"    {s['id']} peak {pk:5.1f} px/f outside allow windows (at {pk_at if pk_at is None else round(pk_at, 2)}); overall {pk_all:5.1f} px/f at {pk_all_at if pk_all_at is None else round(pk_all_at, 2)}")
    # dive seams: log-zoom rates; cut-on-action seams: screen speed of the matched point
    print('  -- seams')
    byid = {s['id']: s for s in sc}

    def zrate(seg, t0, t1):
        a, b = cam_state(seg, t0), cam_state(seg, t1)
        return (math.log(b['zoom']) - math.log(a['zoom'])) / (t1 - t0)

    EPS = 1e-4

    for a_id, b_id in (('S01', 'S02'), ('S04', 'S05')):
        A_, B_ = byid[a_id], byid[b_id]
        so, si = A_['camera'][-1], B_['camera'][0]
        ro = zrate(so, so['t1'] - EPS, so['t1'])
        ri = zrate(si, si['t0'], si['t0'] + EPS)
        fo = zrate(so, so['t1'] - 1 / FPS, so['t1'])
        fi = zrate(si, si['t0'], si['t0'] + 1 / FPS)
        ratio = ro / ri if ri else float('inf')
        msg = (f'log-zoom rate at the cut out {ro:.2f}/s -> in {ri:.2f}/s (x{ratio:.2f}; frame averages {fo:.2f} -> {fi:.2f}); '
               f'dive {so["t1"] - so["t0"]:.3f} s, landing {si["t1"] - si["t0"]:.3f} s')
        print(f'    {a_id} -> {b_id}: {msg}')
        if b_id == 'S05' and ratio > 1.5:
            issue('major', f'{tag} {a_id}->{b_id}', msg)
    for a_id, b_id, pt in (('S05', 'S06', (540, 1200)), ('S07', 'S08', (540, 928))):
        A_, B_ = byid[a_id], byid[b_id]
        so, si = A_['camera'][-1], B_['camera'][0]
        vo = disp(cam_state(so, so['t1'] - 1 / FPS), cam_state(so, so['t1']), [pt])[0] * FPS
        vi = disp(cam_state(si, si['t0']), cam_state(si, si['t0'] + 1 / FPS), [pt])[0] * FPS
        msg = f'screen speed at {pt}: out {vo:.0f} px/s -> in {vi:.0f} px/s (x{max(vo, vi) / max(1e-6, min(vo, vi)):.2f}); exit move {so["t1"] - so["t0"]:.3f} s, entry {si["t1"] - si["t0"]:.3f} s'
        print(f'    {a_id} -> {b_id}: {msg}')
        if max(vo, vi) / max(1e-6, min(vo, vi)) > 1.3:
            issue('major', f'{tag} {a_id}->{b_id}', msg)
    # peak budget
    s1, s8, s9, s12 = byid['S01'], byid['S08'], byid['S09'], byid['S12']
    p1 = s1['camera'][-1]['t0'] - s1['start']
    p8 = (s8['camera'][1]['t1'] - s8['start']) + (s8['end'] - s8['camera'][4]['t0'])
    p9 = (s9['end'] - s9['camera'][2]['t1']) + 0.5 * (s9['camera'][2]['t1'] - s9['camera'][2]['t0'])
    p12 = s12['end'] - s12['start']
    tot = p1 + p8 + p9 + p12
    print(f'  -- peak budget: S01 {p1:.2f} + S08 {p8:.2f} + S09B {p9:.2f} + S12 {p12:.2f} (closing beat) = {tot:.2f} s = {100 * tot / dur:.0f} % '
          f'({100 * (tot - p12) / dur:.0f} % without S12)')
    hold9 = s9['end'] - s9['camera'][2]['t1']
    print(f"  -- S09 vista held still {hold9:.2f} s before the tram wipe starts at {byid['S10']['transitionIn']['t0']:.2f} (still until {byid['S10']['transitionIn']['t0'] - s9['camera'][2]['t1']:.2f} s)")
    if byid['S10']['transitionIn']['t0'] - s9['camera'][2]['t1'] < 0.8 - 1e-6:
        issue('major', f'{tag} S09', 'PEAK 3 vista held < 0.8 s before the tram')
    # caption pages
    for s in sc:
        for c in s['captions']:
            d_ = c['e'] - c['s']
            key = ' / '.join(l['text'] for l in c['lines'])
            if d_ < 1.4 - 1e-6 and key not in SB['acceptedShortPages']:
                issue('minor', f"{tag} {s['id']} page '{key}'", f'{d_:.2f} s < 1.4')
    # sign jokes
    ids = [j['id'] for j in SB['engagement']['signJokes']]
    if len(ids) != len(set(ids)):
        issue('minor', tag, f'duplicate sign-joke ids {ids}')
    # loop
    lt = sc[-1].get('transitionOut', {})
    print(f"  -- loop: S12.transitionOut {lt.get('type')} loop={lt.get('loop')} captionAt {lt.get('captionAt')}; film duration {dur}")
    return SB, life


if __name__ == '__main__':
    if len(sys.argv) >= 3:
        res_est, res_rec = sys.argv[1], sys.argv[2]
    else:
        import os
        import subprocess
        import tempfile
        root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
        sbp = sys.argv[1] if len(sys.argv) == 2 else os.path.join(root, 'docs/storyboard_v3.json')
        tmp = tempfile.mkdtemp(prefix='sbv3lint.')
        res_est, res_rec = os.path.join(tmp, 'res_est.json'), os.path.join(tmp, 'res_rec.json')
        for tf, out in (('assets/timing_est_v3.json', res_est), ('assets/timing_v3.json', res_rec)):
            r = subprocess.run([sys.executable, '-I', os.path.join(root, 'scripts/anchor/resolve.py'), sbp, '--timing', os.path.join(root, tf), '-o', out, '--no-engine', '--quiet'],
                               cwd=root, capture_output=True, text=True)
            if r.returncode != 0:
                print(r.stdout + r.stderr)
                sys.exit(f'resolve.py failed on {tf}')
    est_sb, est_life = lint(res_est, 'EST')
    rec_sb, rec_life = lint(res_rec, 'REC')
    # same beat order on both takes
    for se, sr in zip(est_sb['scenes'], rec_sb['scenes']):
        oe = [b['action'] for b in sorted(se['beats'], key=lambda b: b['t'])]
        orr = [b['action'] for b in sorted(sr['beats'], key=lambda b: b['t'])]
        if oe != orr:
            issue('major', se['id'], 'beat order differs between the estimate and the recording')
    n = {k: sum(1 for i in issues if i[0] == k) for k in ('blocker', 'major', 'minor')}
    print('TOTAL', n)
    sys.exit(1 if n['blocker'] or n['major'] else 0)
