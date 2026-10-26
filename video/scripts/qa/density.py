#!/usr/bin/env python3
"""density.py: the DENSITY METER. Is every shot FULL (a dressed, detailed world) and ALIVE (constant motion)?
Catches "way too empty" before the owner sees a cut. Generic: any MP4 (any size, any fps), optional scene list.

  python3 -I scripts/qa/density.py out/v3_g5.mp4 --scenes src/v3/film/scenes.json [--only S9] [--json d.json]
  python3 -I scripts/qa/density.py assets/ref/reference.mp4 --scenes scripts/qa/calib/ref1_scenes.json  # preset ref1
  python3 -I scripts/qa/density.py deliverables/v1/php2shell_final.mp4 --scenes src/data/scenes.json

The numbers are a WARNING SIGNAL, never a quota (OWNER_PLAYBOOK, Visual style: "feeling alive is the key, not an
object count"). Targets and their reasons: docs/look/research/density_numbers.md (measured on reference 1 and v1).

Everything is measured on a 1080-wide CANVAS whatever the input size (540x960 drafts, 1080x1350 reference 1) and in
SECONDS whatever the frame rate: the motion pass resamples the video to --rate (30) fps, so a 60 fps render and a
30 fps reference are measured on the same clock.

MOTION (motion_spec section 9 method), quarter canvas resolution (270 px wide), --rate fps:
  change mask   a pixel changed when max over RGB |frame - previous| > --tau (24 of 255; codec noise stays under).
  medium event  a space-time change blob: each frame, changed pixels within 8 canvas px form a blob; a blob continues
                the chain whose footprint of the last 0.067 s it overlaps (within 4 canvas px), else it starts a new
                chain; chains never merge (a new pop beside an ongoing motion is its own event). A chain of >= 500
                voxels at 30 fps (16.7 quarter-res px^2 * s: ~ a 40x40 px object moving for 5 frames) is a MEDIUM
                EVENT, counted at its onset. Hard cuts (a scene start, or > 35 % of pixels changing at once) are not
                events and break every chain.
  ev/s          medium events per second.            gap   longest stretch without a new medium event (shot edges
                count; transition windows of the scene list count as one long event).
  static        share of frames with < 0.1 % of the measured pixels changing; run = longest such run (s).
FULLNESS, half canvas resolution (540 px wide), one frame every --sample s (default 0.25):
  flat          share of 48x48 canvas-px tiles that are FLAT: (almost) no edges (< 0.5 % edge px) and one colour
                (max-channel std < 6). Big empty walls, skies and floors.
  obj           distinct small objects per canvas megapixel: connected Canny edge components (after a 3x3 close)
                with >= 24 edge px at half res.
  detail        share of tiles with FINE DETAIL (>= 10 % edge px: windows, hatching, faces, signage, clutter).
Regions: the caption band (--band, default 290-600) and the --ignore strips (default 1820-1920: draft label, bottom
UI) are left out of every number. 4:5 input (reference 1, card on mint) gets the preset `ref1`: motion inside the card
above its caption strip, fullness inside the art panel.

Verdict per metric: PASS (at target), WARN (under target), FAR (far under target: gate_check --density fails on FAR
at film level). Exit code: 0 (warnings never fail), 2 on bad input.
"""
from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

sys.dont_write_bytecode = True
cv2.setNumThreads(1)  # the machine is shared

CANVAS_W = 1080
# ---------------------------------------------------------------- targets (docs/look/research/density_numbers.md)
# kind: 'min' (value must be >= target) or 'max' (value must be <= target); far = the FAR threshold.
TARGETS = {
    'evps':   dict(kind='min', target=5.0, far=2.5, fmt='{:.1f}', why='motion_spec 9 + playbook (>= 5 medium events/s); ref 1 and v1 both measure >= 5'),
    'gap':    dict(kind='max', target=1.0, far=2.0, fmt='{:.2f}', why='playbook: no gap over 1 s (ref 1 longest in-shot gap ~1 s)'),
    'static': dict(kind='max', target=0.05, far=0.25, fmt='{:.0%}', why='motion_spec 9: <= 5 % near-static frames'),
    'run':    dict(kind='max', target=0.4, far=1.0, fmt='{:.2f}', why='motion_spec 9: no near-static run over 0.4 s'),
    'flat':   dict(kind='max', target=0.35, far=0.55, fmt='{:.0%}', why='ref 1 / v1 film means ~0.2-0.3 incl. sky'),
    'obj':    dict(kind='min', target=110.0, far=55.0, fmt='{:.0f}', why='~0.75 x the emptier reference'),
    'detail': dict(kind='min', target=0.12, far=0.06, fmt='{:.0%}', why='~0.75 x the emptier reference'),
}
MOTION_KEYS = ('evps', 'gap', 'static', 'run')
FULL_KEYS = ('flat', 'obj', 'detail')

PRESETS = {
    # 9:16 house film: caption band in the sky, draft label / bottom UI strip ignored
    'film': dict(crop=None, fcrop=None, band=(290, 600), ignore=[(1820, 1920)]),
    # reference 1 (1080x1350): card x 60..1019, y 60..1289; captions in the card's white strip from y ~960;
    # the art panel x 156..923, y 156..923 (style_bible section 1)
    'ref1': dict(crop=(60, 60, 1020, 960), fcrop=(156, 156, 924, 924), band=None, ignore=[]),
    'whole': dict(crop=None, fcrop=None, band=None, ignore=[]),
}


# ---------------------------------------------------------------- media

def probe(path: str) -> dict:
    out = subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries',
                          'stream=width,height,avg_frame_rate:format=duration', '-of', 'json', path],
                         capture_output=True, text=True, check=True).stdout
    d = json.loads(out)
    s = d['streams'][0]
    a, _, b = s['avg_frame_rate'].partition('/')
    return {'w': int(s['width']), 'h': int(s['height']), 'fps': float(a) / float(b or 1),
            'dur': float(d['format']['duration'])}


def frames(path: str, info: dict, width: int, rate: float, crop=None):
    """Yield (t, rgb uint8) at `rate` fps, `crop` in canvas px (x0, y0, x1, y1), scaled so the canvas is `width` wide."""
    k = info['w'] / CANVAS_W                       # source px per canvas px
    ch = info['h'] / k
    x0, y0, x1, y1 = crop or (0, 0, CANVAS_W, ch)
    s = width / CANVAS_W                           # output px per canvas px
    ow, oh = int(round((x1 - x0) * s)), int(round((y1 - y0) * s))
    vf = [f'fps={rate}']
    if crop:
        vf.append(f'crop={int(round((x1 - x0) * k))}:{int(round((y1 - y0) * k))}:{int(round(x0 * k))}:{int(round(y0 * k))}')
    vf.append(f'scale={ow}:{oh}:flags=area')
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', ','.join(vf), '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
                         stdout=subprocess.PIPE)
    n = ow * oh * 3
    i = 0
    try:
        while True:
            buf = p.stdout.read(n)
            if len(buf) < n:
                break
            yield i / rate, np.frombuffer(buf, np.uint8).reshape(oh, ow, 3)
            i += 1
    finally:
        p.stdout.close()
        p.wait()


def region_mask(h: int, w: int, scale: float, crop, band, ignore) -> np.ndarray:
    """True = measured. Rows of the caption band and ignore strips (canvas y) are excluded."""
    y0 = crop[1] if crop else 0
    m = np.ones((h, w), bool)
    for lo, hi in ([band] if band else []) + list(ignore or []):
        a, b = int(math.floor((lo - y0) * scale)), int(math.ceil((hi - y0) * scale))
        m[max(0, a):max(0, min(h, b)), :] = False
    return m


# ---------------------------------------------------------------- motion

class Chains:
    """Space-time change blobs, linked frame to frame (chains never merge; see the module doc)."""

    def __init__(self, merge: int, link: int, hold: int, cont: float = 0.5):
        self.km = cv2.getStructuringElement(cv2.MORPH_RECT, (2 * merge + 1, 2 * merge + 1)) if merge else None
        self.kl = cv2.getStructuringElement(cv2.MORPH_RECT, (2 * link + 1, 2 * link + 1)) if link else None
        self.hold = hold
        self.cont = cont
        self.onset: list[int] = []
        self.vox: list[int] = []
        self.reset()

    def reset(self) -> None:
        self.foot = None
        self.foot_t = None

    def add(self, i: int, mask: np.ndarray) -> None:
        if self.foot is None:
            self.foot = np.zeros(mask.shape, np.int32)           # chain id + 1 that last changed the pixel
            self.foot_t = np.full(mask.shape, -10 ** 6, np.int32)
        if not mask.any():
            return
        m8 = mask.astype(np.uint8)
        grp = cv2.dilate(m8, self.km) if self.km is not None else m8
        n, lab = cv2.connectedComponents(grp, connectivity=8)
        lab = np.where(mask, lab, 0)
        area = np.bincount(lab.ravel(), minlength=n)
        recent = np.where(i - self.foot_t <= self.hold, self.foot, 0)
        if self.kl is not None:
            recent = cv2.dilate(recent.astype(np.float32), self.kl).astype(np.int64)
        best: dict[int, tuple[int, int]] = {}
        both = (lab > 0) & (recent > 0)
        if both.any():
            pairs, cnt = np.unique(np.stack([lab[both], recent[both]], 1), axis=0, return_counts=True)
            for (j, g), c in zip(pairs, cnt):
                if c > best.get(int(j), (0, 0))[0]:
                    best[int(j)] = (int(c), int(g) - 1)
        ids = np.zeros(n, np.int32)
        for j in range(1, n):
            if area[j] <= 0:
                continue
            if j in best and best[j][0] >= self.cont * area[j]:
                g = best[j][1]
                self.vox[g] += int(area[j])
            else:
                g = len(self.onset)
                self.onset.append(i)
                self.vox.append(int(area[j]))
            ids[j] = g + 1
        sel = lab > 0
        self.foot[sel] = ids[lab[sel]]
        self.foot_t[sel] = i


def motion_pass(path: str, info: dict, a) -> dict:
    width = CANVAS_W // 4
    hold = max(1, int(round(a.hold * a.rate)))
    min_vox = a.event_vox * a.rate / 30.0          # 500 voxels at 30 fps; seconds-based
    ch = Chains(merge=max(0, int(round(8 / 4))), link=max(0, int(round(4 / 4))), hold=hold)
    starts = [s['start'] for s in a.scene_list[1:]]
    cut_frames = set()
    for s in starts:
        k = int(math.ceil(s * a.rate - 1e-6))
        cut_frames.update((k, k + 1))
    prev = None
    mask_r = None
    frac = []
    cuts = []
    for i, (t, im) in enumerate(frames(path, info, width, a.rate, a.crop)):
        if prev is None:
            mask_r = region_mask(im.shape[0], im.shape[1], width / CANVAS_W, a.crop, a.band, a.ignore)
            npx = max(1, int(mask_r.sum()))
            prev = im
            frac.append(math.nan)
            continue
        d = cv2.absdiff(im, prev).max(axis=2)
        prev = im
        m = (d > a.tau) & mask_r
        f = float(m.sum()) / npx
        frac.append(f)
        if f > 0.35 and (i in cut_frames or f > 0.5 or not a.scene_list):
            cuts.append(i)
            ch.reset()
            continue
        ch.add(i, m)
    n = len(frac)
    onsets = sorted(o for o, v in zip(ch.onset, ch.vox) if v >= min_vox)
    return {'n': n, 'rate': a.rate, 'frac': np.array(frac), 'onsets': np.array(onsets, float) / a.rate,
            'cuts': [c / a.rate for c in cuts], 'cut_idx': set(cuts)}


def runs_longest(flags: np.ndarray) -> int:
    best = cur = 0
    for v in flags:
        cur = cur + 1 if v else 0
        best = max(best, cur)
    return best


def motion_stats(mo: dict, s: float, e: float, trans: list) -> dict:
    r = mo['rate']
    on = mo['onsets'][(mo['onsets'] >= s) & (mo['onsets'] < e)]
    dur = max(1e-6, e - s)
    marks = np.r_[s, on, e]
    gap = 0.0
    for g0, g1 in zip(marks[:-1], marks[1:]):
        free = g1 - g0
        for t0, t1 in trans:            # a transition is one long event: its time is never a gap
            free -= max(0.0, min(g1, t1) - max(g0, t0))
        gap = max(gap, free)
    i0, i1 = int(math.ceil(s * r)), min(mo['n'], int(math.ceil(e * r)))
    idx = [i for i in range(max(1, i0 + 1), i1) if i not in mo['cut_idx']]
    fr = mo['frac'][idx] if idx else np.array([])
    static = fr < 0.001
    return {'evps': len(on) / dur, 'events': int(len(on)), 'gap': float(gap),
            'static': float(static.mean()) if len(fr) else math.nan,
            'run': runs_longest(static) / r if len(fr) else math.nan}


# ---------------------------------------------------------------- fullness

def fullness_frame(im: np.ndarray, mask: np.ndarray, tile: int, canvas_per_px: float) -> dict:
    grey = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY)
    e = cv2.Canny(grey, 40, 110) > 0
    h, w = grey.shape
    ty, tx = h // tile, w // tile
    E = e[:ty * tile, :tx * tile].reshape(ty, tile, tx, tile).mean(axis=(1, 3))
    imf = im[:ty * tile, :tx * tile].astype(np.float32).reshape(ty, tile, tx, tile, 3)
    S = imf.std(axis=(1, 3)).max(axis=2)
    M = mask[:ty * tile, :tx * tile].reshape(ty, tile, tx, tile).all(axis=(1, 3))
    nt = max(1, int(M.sum()))
    flat = ((E < 0.005) & (S < 6.0) & M).sum() / nt
    detail = ((E >= 0.10) & M).sum() / nt
    em = (e & mask).astype(np.uint8)
    closed = cv2.morphologyEx(em, cv2.MORPH_CLOSE, np.ones((3, 3), np.uint8)) | em
    n, lab, st, _ = cv2.connectedComponentsWithStats(closed, connectivity=8)
    cnt = np.bincount(lab[em > 0].ravel(), minlength=n)
    objs = int((cnt[1:] >= 24).sum())
    area_mpx = mask.sum() * canvas_per_px ** 2 / 1e6
    return {'flat': float(flat), 'detail': float(detail), 'obj': objs / max(1e-6, area_mpx), 'objn': objs}


def fullness_pass(path: str, info: dict, a) -> list[dict]:
    width = CANVAS_W // 2
    tile = 48 // 2
    out = []
    mask = None
    for t, im in frames(path, info, width, 1.0 / a.sample, a.fcrop):
        if mask is None:
            mask = region_mask(im.shape[0], im.shape[1], width / CANVAS_W, a.fcrop, a.band, a.ignore)
        r = fullness_frame(im, mask, tile, CANVAS_W / width)
        r['t'] = t
        out.append(r)
    return out


def full_stats(fu: list[dict], s: float, e: float) -> dict:
    rows = [r for r in fu if s <= r['t'] < e] or [min(fu, key=lambda r: abs(r['t'] - (s + e) / 2))]
    return {k: float(np.mean([r[k] for r in rows])) for k in ('flat', 'obj', 'detail', 'objn')} | {
        'flat_worst': float(max(r['flat'] for r in rows))}


# ---------------------------------------------------------------- verdicts and printing

def verdict(key: str, v: float) -> str:
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return '-'
    T = TARGETS[key]
    if T['kind'] == 'min':
        return 'PASS' if v >= T['target'] else 'FAR' if v < T['far'] else 'WARN'
    return 'PASS' if v <= T['target'] else 'FAR' if v > T['far'] else 'WARN'


def worst(vs: list[str]) -> str:
    for lvl in ('FAR', 'WARN', 'PASS'):
        if lvl in vs:
            return lvl
    return '-'


def cell(key: str, v: float) -> str:
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return '-'
    s = TARGETS[key]['fmt'].format(v)
    vd = verdict(key, v)
    return s + ('' if vd == 'PASS' else '!' if vd == 'WARN' else '!!')


def load_scenes(path: str | None, dur: float) -> list[dict]:
    if not path:
        return [{'id': 'film', 'start': 0.0, 'end': dur, 'trans': []}]
    d = json.loads(Path(path).read_text())
    if isinstance(d, dict):
        d = d.get('scenes', [])
    out = []
    for s in d:
        st = float(s.get('start', s.get('s', 0)))
        en = float(s.get('end', s.get('e', dur)))
        trans = [(float(x[0]), float(x[1])) for x in s.get('transitions', []) if len(x) >= 2]
        out.append({'id': str(s.get('id', len(out) + 1)), 'start': st, 'end': min(en, dur), 'trans': trans})
    return sorted(out, key=lambda x: x['start'])


def analyze(mp4: str, scenes: str | None = None, preset: str = 'auto', rate: float = 30.0, sample: float = 0.25,
            tau: float = 24.0, band=None, ignore=None, crop=None, fcrop=None, only: str | None = None,
            quiet: bool = False) -> dict:
    """Measure one video. Returns {'preset', 'shots': [...], 'film': {...}, 'verdict'}; prints the table unless quiet."""
    info = probe(mp4)
    if preset == 'auto':
        ar = info['h'] / info['w']
        preset = 'film' if abs(ar - 16 / 9) < 0.02 else 'ref1' if abs(ar - 1.25) < 0.02 else 'whole'
    P = dict(PRESETS[preset])
    a = argparse.Namespace(rate=rate, sample=sample, tau=tau, hold=2 / 30, event_vox=500.0,
                           crop=crop if crop is not None else P['crop'], fcrop=fcrop if fcrop is not None else (P['fcrop'] or crop or P['crop']),
                           band=band if band is not None else P['band'], ignore=ignore if ignore is not None else P['ignore'])
    if a.band in ((), (0, 0)):
        a.band = None
    a.scene_list = load_scenes(scenes, info['dur'])
    mo = motion_pass(mp4, info, a)
    fu = fullness_pass(mp4, info, a)
    shots = []
    for sc in a.scene_list:
        if only and sc['id'] != only:
            continue
        r = {'id': sc['id'], 's': sc['start'], 'e': sc['end']}
        r.update(motion_stats(mo, sc['start'], sc['end'], sc['trans']))
        r.update(full_stats(fu, sc['start'], sc['end']))
        r['verdicts'] = {k: verdict(k, r[k]) for k in MOTION_KEYS + FULL_KEYS}
        r['verdict'] = worst(list(r['verdicts'].values()))
        shots.append(r)
    # film summary: time-weighted means; gap / run = the worst shot; ev/s = all events / all time
    tot = sum(r['e'] - r['s'] for r in shots) or 1.0
    film = {'id': 'FILM', 's': shots[0]['s'] if shots else 0, 'e': shots[-1]['e'] if shots else 0,
            'events': sum(r['events'] for r in shots), 'evps': sum(r['events'] for r in shots) / tot,
            'gap': max((r['gap'] for r in shots), default=0.0), 'run': max((r['run'] for r in shots if not math.isnan(r['run'])), default=0.0)}
    for k in ('static', 'flat', 'obj', 'detail', 'objn'):
        vals = [(r[k], r['e'] - r['s']) for r in shots if not math.isnan(r[k])]
        film[k] = sum(v * w for v, w in vals) / max(1e-6, sum(w for _, w in vals))
    film['flat_worst'] = max((r['flat_worst'] for r in shots), default=0.0)
    film['med_gap'] = float(np.median(np.diff(mo['onsets']))) if len(mo['onsets']) > 1 else math.nan
    film['verdicts'] = {k: verdict(k, film[k]) for k in MOTION_KEYS + FULL_KEYS}
    # a film is FAR only when its averages are far off; one empty shot makes it WARN
    film['verdict'] = worst(list(film['verdicts'].values()) + ['WARN' if any(r['verdict'] != 'PASS' for r in shots) else 'PASS'])
    res = {'mp4': mp4, 'preset': preset, 'info': info, 'shots': shots, 'film': film, 'verdict': film['verdict'],
           'regions': {'crop': a.crop, 'fcrop': a.fcrop, 'band': a.band, 'ignore': a.ignore}}
    if not quiet:
        print_table(res)
    return res


def print_table(res: dict) -> None:
    i = res['info']
    print(f"density {Path(res['mp4']).name}: {i['w']}x{i['h']} {i['fps']:g} fps {i['dur']:.2f} s, preset {res['preset']} "
          f"(band {res['regions']['band']}, ignore {res['regions']['ignore']}, crop {res['regions']['crop']}, fullness crop {res['regions']['fcrop']})")
    hdr = f"{'shot':8} {'time':>11} {'ev/s':>6} {'gap s':>6} {'static':>7} {'run s':>6} {'flat':>6} {'obj/Mpx':>8} {'detail':>7}  verdict"
    print(hdr)
    print('-' * len(hdr))
    for r in res['shots'] + [res['film']]:
        if r['id'] == 'FILM':
            print('-' * len(hdr))
        t = f"{r['s']:5.2f}-{r['e']:5.2f}"
        print(f"{r['id']:8} {t:>11} {cell('evps', r['evps']):>6} {cell('gap', r['gap']):>6} {cell('static', r['static']):>7} "
              f"{cell('run', r['run']):>6} {cell('flat', r['flat']):>6} {cell('obj', r['obj']):>8} {cell('detail', r['detail']):>7}  {r['verdict']}")
    tg = '  '.join(f"{k} {'>=' if T['kind'] == 'min' else '<='}{T['fmt'].format(T['target'])}" for k, T in TARGETS.items())
    print(f"targets: {tg}   (! = WARN, !! = FAR)")
    f = res['film']
    print(f"density: {res['verdict']}  {f['events']} medium events ({f['evps']:.1f}/s, median gap {f['med_gap']:.2f} s), "
          f"flat {f['flat']:.0%} (worst frame {f['flat_worst']:.0%}), {f['objn']:.0f} objects/frame, detail {f['detail']:.0%}")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split('\n')[0], formatter_class=argparse.RawDescriptionHelpFormatter, epilog=__doc__)
    ap.add_argument('mp4')
    ap.add_argument('--scenes', help='scene list JSON: [{id, start|s, end|e, transitions?: [[t0, t1], ...]}] or {"scenes": [...]}')
    ap.add_argument('--only', help='report this shot only (the whole video is still measured)')
    ap.add_argument('--preset', default='auto', choices=['auto'] + list(PRESETS))
    ap.add_argument('--band', help='caption band y0,y1 (canvas px) left out; "none" = keep everything')
    ap.add_argument('--ignore', action='append', help='another y0,y1 strip to leave out (repeatable); "none" clears the preset')
    ap.add_argument('--crop', help='measure only x0,y0,x1,y1 (canvas px)')
    ap.add_argument('--fcrop', help='fullness crop x0,y0,x1,y1 (default: --crop)')
    ap.add_argument('--rate', type=float, default=30.0, help='motion analysis rate (fps); thresholds are seconds-based')
    ap.add_argument('--sample', type=float, default=0.25, help='fullness: one frame every this many seconds')
    ap.add_argument('--tau', type=float, default=24.0, help='change threshold (8-bit, max over RGB)')
    ap.add_argument('--json', help='write the results here')
    a = ap.parse_args()
    tup = (lambda s: tuple(float(x) for x in s.split(',')))
    band = None if a.band is None else (() if a.band == 'none' else tup(a.band))
    ignore = None if a.ignore is None else ([] if a.ignore == ['none'] else [tup(x) for x in a.ignore if x != 'none'])
    if not Path(a.mp4).exists():
        print(f'density: no such file {a.mp4}', file=sys.stderr)
        return 2
    res = analyze(a.mp4, a.scenes, a.preset, a.rate, a.sample, a.tau, band, ignore,
                  tup(a.crop) if a.crop else None, tup(a.fcrop) if a.fcrop else None, a.only)
    if a.json:
        Path(a.json).write_text(json.dumps(res, indent=1, default=lambda o: sorted(o) if isinstance(o, set) else str(o)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
