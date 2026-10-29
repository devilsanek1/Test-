#!/usr/bin/env python3
"""density.py: the DENSITY METER. Is every shot FULL (a dressed, detailed world) and ALIVE (constant motion)?
Catches "way too empty" before the owner sees a cut. Generic: any MP4 (any size, any fps), optional scene list.

  python3 -I scripts/qa/density.py out/v3_g5.mp4 --scenes src/v3/film/scenes.json [--only S9] [--json d.json]
  python3 -I scripts/qa/density.py assets/ref/reference.mp4 --scenes scripts/qa/calib/ref1_scenes.json  # preset ref1
  python3 -I scripts/qa/density.py deliverables/v1/php2shell_final.mp4 --scenes archive/v1/src/data/scenes.json

The numbers are a WARNING SIGNAL, never a quota (OWNER_PLAYBOOK, Visual style: "feeling alive is the key, not an
object count"). Targets and their reasons: docs/look/research/density_numbers.md (measured on reference 1 and v1).

Everything is measured on a 1080-wide CANVAS whatever the input size (540x960 drafts, 1080x1350 reference 1) and in
SECONDS whatever the frame rate: the motion pass resamples the video to --rate (30) fps, so a 60 fps render and a
30 fps reference are measured on the same clock (keep 30: the targets live on it; event sizes and holds are seconds-based).

MOTION (motion_spec section 9 method), quarter canvas resolution (270 px wide), --rate fps:
  change mask   a pixel changed when max over RGB |frame - previous| > --tau (24 of 255; codec noise stays under).
  medium event  a space-time change blob: each frame, changed pixels within 8 canvas px form a blob; a blob continues
                the chain whose footprint of the last 0.067 s holds >= 30 % of it (within 4 canvas px), else it starts
                a new chain; chains never merge (a new pop beside or inside an ongoing motion is its own event, a
                bobbing placard stays one). A chain of >= 500 voxels at 30 fps (16.7 quarter-res px^2 * s: ~ a
                40x40 px object moving for 5 frames) is a MEDIUM EVENT, counted at its onset. Hard cuts (> 35 % of pixels changing at a scene start) are not events;
                a whole-frame change elsewhere (> 50 %: a camera move) is covered time, never a gap. Both break chains.
  ev/s          medium events per second.            gap   longest stretch without a new medium event (shot edges
                count; transition windows of the scene list count as one long event).
  static        share of frames with < 0.1 % of the measured pixels changing; run = longest such run (s).
FULLNESS, half canvas resolution (540 px wide), one frame every --sample s (default 0.25):
  flat          share of 48x48 canvas-px tiles that are FLAT: (almost) no edges (< 0.5 % edge px) and one colour
                (max-channel std < 6). Big empty walls, skies and floors.
  obj           distinct small objects per canvas megapixel: connected Canny edge components (8-connected) with
                >= 16 edge px at half res (a window, a head, a sign, a bottle; a big outline counts once).
  detail        share of tiles with FINE DETAIL (>= 10 % edge px: windows, hatching, faces, signage, clutter).
  objn          (summary line) the same objects as a raw count per frame.
Regions: the caption band (--band, default 290-600) and the --ignore strips (default 1820-1920: draft label, bottom
UI) are left out of every number. 4:5 input (reference 1, card on mint) gets the preset `ref1`: motion inside the card
above its caption strip, fullness inside the art panel.

Verdict per metric: PASS (at target), WARN (under target), FAR (far under target: gate_check --density fails on FAR
at film level). Exit code: 0 (warnings never fail), 2 on bad input.

COZY HOLDS (--cozy, opt-in: one more pass and a second table; the table above, its verdict, the exit code and
gate_check are unchanged). Why: the cozy references are rated FAR on ev/s and gap yet never feel empty (one long walk
is one event); a calm hold is judged on movers present, never-empty frames and steady change instead. Half canvas res
(540 px wide), on the --rate clock, inside --crop, band and ignore strips left out:
  camera        removed FIRST: one global 2D shift per frame (phase correlation of the largest measured row block
                against an anchor frame, re-anchored when the match weakens). The track restarts at every scene start
                and at a JUMP: > 15 % of the pixels changing in one frame after the shift (a loop seam, a zoom crane, a
                flash) or a one-frame camera step > 4 canvas px and > 4x the recent steps (a player restart).
  float         the camera's own speed: mean |velocity| of that shift over 0.27 s windows, canvas px/s at 1080.
                Locked camera reads 0-1 (noise ~0.3); a visible but calm float 8-15; an invisible 1.4 % push-in 1-4.
  chg           share of measured pixels changed over the last --cozy-span s (default 0.2) after the shift: a pixel
                changed when it lies > --tau outside the range of the old frame's 3x3 neighbourhood (+-2 canvas px
                absorbs sub-pixel shifts, a slow zoom and line wobble). A span, not one frame: screen recordings with
                duplicate frames read the same as clean renders.
  movers        moving blobs per frame (a proxy for moving figures): that change mask opened 3x3 (thin line boil
                drops out), changed px within 16 canvas px form one blob, and a blob with >= 400 canvas px^2 changed
                and a mean thickness (area / longest side) >= 6 canvas px is a mover. Still people do not count.
  empty         share of frames with no mover.
  cv            steadiness of change: std / mean of chg over the shot's frames (low = steady: no bursts, no lulls).
  jumps         track restarts inside the shot (a draw-on, a seam, a crane: those frames are not a hold).
  FILM row: movers and empty over all measured frames; cv and float are the median shot.
  Cozy markers (! / !!) are a warning signal from two cozy references (docs/look/research/density_numbers.md): movers
  >= 2 (!! < 1), empty <= 5 % (!! > 20 %), cv <= 0.75 (!! > 1.2); float has no target (river floats ~10 px/s, the
  street is locked at 0: both cozy). The cozy column is informational and never changes the verdict or exit code.
  python3 -I scripts/qa/density.py out/v3_g5.mp4 --scenes src/v3/film/scenes.json --cozy [--cozy-span 0.2] [--json d.json]
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
# kind: 'min' (value must be >= target) or 'max' (value must be <= target); far = the FAR threshold;
# shot = (target, far) for one shot when it differs from the film's.
TARGETS = {
    'evps':   dict(kind='min', target=5.0, far=2.5, shot=(3.5, 1.75), fmt='{:.1f}',
                  why='film: playbook / motion_spec 9 (>= 5/s; ref 1 6.6, v1 7.7); one shot: >= 3.5 (ref 1 shots 3.8-9.1, v1 5.4-14.7)'),
    'gap':    dict(kind='max', target=1.0, far=2.0, fmt='{:.2f}', why='playbook: no gap over 1 s; ref 1 longest 1.00 s'),
    'static': dict(kind='max', target=0.05, far=0.25, fmt='{:.0%}', why='motion_spec 9: <= 5 % near-static frames'),
    'run':    dict(kind='max', target=0.4, far=1.0, fmt='{:.2f}', why='motion_spec 9: no near-static run over 0.4 s'),
    'flat':   dict(kind='max', target=0.40, far=0.55, fmt='{:.0%}', why='v1 32 % (incl. the sky over the band) + margin; ref 1 20 %'),
    'obj':    dict(kind='min', target=105.0, far=70.0, fmt='{:.0f}', why='0.75 x v1 (140/Mpx); far = 0.5 x v1; ref 1 195'),
    'detail': dict(kind='min', target=0.34, far=0.22, fmt='{:.0%}', why='0.75 x v1 (45 %); far = 0.5 x v1; ref 1 58 %'),
}
# medium event tracker (canvas px / seconds), calibrated on reference 1 (6.6 events/s, longest in-shot gap 1.00 s;
# motion_spec 9 measured 5.9/s and 0.97 s) - see density_numbers.md
EVENT = dict(merge=8, link=4, cont=0.3)
MOTION_KEYS = ('evps', 'gap', 'static', 'run')
FULL_KEYS = ('flat', 'obj', 'detail')
# cozy holds (--cozy): markers only, never the verdict; measured on the river reference (movers 2.9, empty 0 %,
# cv 0.14, float 10 px/s) and the street reference (0-7.9 s: movers 3.2, empty 0 %, cv 0.73, float 0.2 = locked)
COZY_TARGETS = {
    'movers': dict(kind='min', target=2.0, far=1.0, fmt='{:.1f}', why='cozy refs 2.9 (river) / 3.2 (street), never below 1'),
    'empty':  dict(kind='max', target=0.05, far=0.20, fmt='{:.0%}', why='cozy refs: 0 % frames without a mover'),
    'cv':     dict(kind='max', target=0.75, far=1.2, fmt='{:.2f}', why='river 0.14 (steady lane), street 0.73 (builds to a peak)'),
}
COZY_KEYS = tuple(COZY_TARGETS)
# mover blob (canvas px): merge radius, min changed area (px^2), min mean thickness; jump thresholds; float window (s)
COZY = dict(merge=16, area=400.0, thick=6.0, jump_frac=0.15, jump_step=4.0, jump_ratio=4.0, win=0.27, open=3)

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
    ch = Chains(merge=EVENT['merge'] // 4, link=EVENT['link'] // 4, hold=hold, cont=EVENT['cont'])
    cut_frames = set()
    for s in a.scene_list[1:]:
        k = int(math.ceil(s['start'] * a.rate - 1e-6))
        cut_frames.update((k, k + 1))
    prev = None
    mask_r = None
    npx = 1
    frac = []
    skip = set()        # cut frames and whole-frame changes: no events, not static
    busy = []           # whole-frame change (camera move, untracked cut): covered time, never a gap
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
        if (f > 0.35 and i in cut_frames) or f > 0.5:
            skip.add(i)
            ch.reset()
            if i not in cut_frames:
                busy.append(((i - 1) / a.rate, i / a.rate))
            continue
        ch.add(i, m)
    onsets = sorted(o for o, v in zip(ch.onset, ch.vox) if v >= min_vox)
    return {'n': len(frac), 'rate': a.rate, 'frac': np.array(frac), 'onsets': np.array(onsets, float) / a.rate,
            'skip': skip, 'busy': busy}


def runs_longest(flags: np.ndarray) -> int:
    best = cur = 0
    for v in flags:
        cur = cur + 1 if v else 0
        best = max(best, cur)
    return best


def motion_stats(mo: dict, s: float, e: float, trans: list) -> dict:
    r = mo['rate']
    trans = list(trans) + [w for w in mo['busy'] if s <= w[0] < e]
    on = mo['onsets'][(mo['onsets'] >= s) & (mo['onsets'] < e)]
    dur = max(1e-6, e - s)
    marks = np.r_[s, on, e]
    gap = 0.0
    for g0, g1 in zip(marks[:-1], marks[1:]):
        free = g1 - g0
        for t0, t1 in trans:            # a transition / camera move is one long event: its time is never a gap
            free -= max(0.0, min(g1, t1) - max(g0, t0))
        gap = max(gap, free)
    i0, i1 = int(math.ceil(s * r)), min(mo['n'], int(math.ceil(e * r)))
    idx = [i for i in range(max(1, i0 + 1), i1) if i not in mo['skip']]
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
    n, _, st, _ = cv2.connectedComponentsWithStats(em, connectivity=8)
    objs = int((st[1:, cv2.CC_STAT_AREA] >= 16).sum())
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


# ---------------------------------------------------------------- cozy holds (--cozy)

def _maxc(im: np.ndarray) -> np.ndarray:
    """Max over the colour channels (cv2: much faster than numpy's reduce on a 3-channel frame)."""
    c = cv2.split(im)
    return cv2.max(cv2.max(c[0], c[1]), c[2])


def _shift(im: np.ndarray, d) -> np.ndarray:
    """Translate an image by d = (dx, dy) px (content at x moves to x + d)."""
    m = np.float32([[1, 0, d[0]], [0, 1, d[1]]])
    return cv2.warpAffine(im, m, (im.shape[1], im.shape[0]), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)


def _row_block(mask: np.ndarray) -> tuple[int, int]:
    """The largest run of fully measured rows (the camera is tracked there, away from the caption band)."""
    best, cur = (0, mask.shape[0]), None
    best_n = 0
    for y, v in enumerate(list(mask.all(axis=1)) + [False]):
        if v and cur is None:
            cur = y
        elif not v and cur is not None:
            if y - cur > best_n:
                best, best_n = (cur, y), y - cur
            cur = None
    return best


def cozy_pass(path: str, info: dict, a) -> dict:
    """Per frame: camera track (canvas px), segment id, changed share over the span, movers (-1 = not measured)."""
    width = CANVAS_W // 2
    sc = width / CANVAS_W                          # analysis px per canvas px
    k = max(1, int(round(a.cozy_span * a.rate)))
    cut_frames = {int(math.ceil(s['start'] * a.rate - 1e-6)) for s in a.scene_list[1:]}
    k3 = np.ones((3, 3), np.uint8)
    kop = np.ones((COZY['open'], COZY['open']), np.uint8)
    mr = max(1, int(round(COZY['merge'] * sc)))
    kmg = cv2.getStructuringElement(cv2.MORPH_RECT, (2 * mr + 1, 2 * mr + 1))
    min_area, min_thick = COZY['area'] * sc * sc, COZY['thick'] * sc
    crit_resp = 0.15
    traj, seg, chg, mov, jumps = [], [], [], [], []
    buf: list[tuple] = []                          # (frame, track px, segment) of the last k + 1 frames
    steps: list[float] = []
    mask = R = win = anchor = prev = prev_g = None
    off = np.zeros(2)
    sid = 0
    npx = 1
    for i, (t, im) in enumerate(frames(path, info, width, a.rate, a.crop)):
        if mask is None:
            mask = region_mask(im.shape[0], im.shape[1], sc, a.crop, a.band, a.ignore)
            npx = max(1, int(mask.sum()))
            y0, y1 = _row_block(mask)
            m = 12 if (y1 - y0) > 64 and im.shape[1] > 64 else 0
            R = (slice(y0 + m, y1 - m), slice(m, im.shape[1] - m))
        g = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY).astype(np.float32)[R]
        if win is None:
            win = cv2.createHanningWindow((g.shape[1], g.shape[0]), cv2.CV_32F)
        jump = i in cut_frames
        if anchor is None:
            anchor, p = g, np.zeros(2)
        else:
            (dx, dy), r = cv2.phaseCorrelate(anchor, g, win)
            if r < crit_resp or abs(dx) > 0.1 * g.shape[1] or abs(dy) > 0.1 * g.shape[0]:
                anchor, off = prev_g, traj[-1] * sc      # re-anchor on the last frame (a long or fast move)
                (dx, dy), r = cv2.phaseCorrelate(anchor, g, win)
            p = off + (dx, dy)
            if not jump:
                d = p - traj[-1] * sc
                f1 = float(cv2.countNonZero(((_maxc(cv2.absdiff(im, _shift(prev, d))) > a.tau) & mask).astype(np.uint8))) / npx
                step = float(np.hypot(*d)) / sc
                med = float(np.median(steps[-15:])) if len(steps) >= 3 else 0.0
                steps.append(step)
                if f1 > COZY['jump_frac'] or (step > COZY['jump_step'] and step > COZY['jump_ratio'] * med + 1.0):
                    jump = True
                    jumps.append(i)
        if jump:                                   # restart the track: new anchor, new segment
            sid += 1
            anchor, off, p, buf, steps = g, np.zeros(2), np.zeros(2), [], []
        traj.append(np.asarray(p, float) / sc)
        seg.append(sid)
        prev, prev_g = im, g
        buf.append((im, np.asarray(p, float), sid))
        if len(buf) > k + 1:
            buf.pop(0)
        if len(buf) < k + 1 or buf[0][2] != sid:
            chg.append(math.nan)
            mov.append(-1)
            continue
        old, po, _ = buf[0]
        d = p - po
        w = _shift(old, d)
        hi, lo = cv2.dilate(w, k3), cv2.erode(w, k3)
        dd = _maxc(cv2.max(cv2.subtract(im, hi), cv2.subtract(lo, im)))
        vm = mask.copy()
        bx, by = int(math.ceil(abs(d[0]))) + 2, int(math.ceil(abs(d[1]))) + 2
        vm[:by], vm[-by:], vm[:, :bx], vm[:, -bx:] = False, False, False, False
        C = ((dd > a.tau) & vm).astype(np.uint8)
        chg.append(float(cv2.countNonZero(C)) / max(1, int(vm.sum())))
        C = cv2.morphologyEx(C, cv2.MORPH_OPEN, kop)
        n, lab = cv2.connectedComponents(cv2.dilate(C, kmg), connectivity=8)
        ys, xs = np.nonzero(C)
        if not len(ys):
            mov.append(0)
            continue
        ll = lab[ys, xs]
        area = np.bincount(ll, minlength=n).astype(float)
        x0, x1 = np.full(n, 1e9), np.full(n, -1e9)
        z0, z1 = np.full(n, 1e9), np.full(n, -1e9)
        np.minimum.at(x0, ll, xs)
        np.maximum.at(x1, ll, xs)
        np.minimum.at(z0, ll, ys)
        np.maximum.at(z1, ll, ys)
        ext = np.maximum(np.maximum(x1 - x0, z1 - z0) + 1, 1)
        ok = (area >= min_area) & (area / ext >= min_thick)
        mov.append(int(ok[1:].sum()))
    return {'n': len(traj), 'rate': a.rate, 'span': a.cozy_span, 'traj': np.array(traj).reshape(-1, 2),
            'seg': np.array(seg, int), 'chg': np.array(chg, float), 'mov': np.array(mov, int), 'jumps': jumps}


def cozy_stats(cz: dict, s: float, e: float, trans: list) -> dict:
    r, n = cz['rate'], cz['n']
    idx = [i for i in range(int(math.ceil(s * r)), min(n, int(math.ceil(e * r))))
           if cz['mov'][i] >= 0 and not any(t0 <= i / r < t1 for t0, t1 in trans)]
    mv, ch = cz['mov'][idx], cz['chg'][idx]
    h = max(1, int(round(COZY['win'] * r / 2)))
    sp = [float(np.hypot(*(cz['traj'][i + h] - cz['traj'][i - h]))) / (2 * h / r)
          for i in range(max(h, int(math.ceil(s * r)) + h), min(n - h, int(math.ceil(e * r)) - h))
          if cz['seg'][i - h] == cz['seg'][i + h]]
    nan = math.nan
    return {'frames': len(idx),
            'movers': float(mv.mean()) if len(mv) else nan,
            'movers_min': int(mv.min()) if len(mv) else -1, 'movers_max': int(mv.max()) if len(mv) else -1,
            'movers_p10': float(np.percentile(mv, 10)) if len(mv) else nan,
            'empty': float((mv == 0).mean()) if len(mv) else nan,
            'chg': float(ch.mean()) if len(ch) else nan,
            'cv': float(ch.std() / ch.mean()) if len(ch) > 1 and ch.mean() > 0 else nan,
            'float': float(np.mean(sp)) if sp else nan, 'float_peak': float(np.percentile(sp, 95)) if sp else nan,
            'jumps': int(sum(1 for j in cz['jumps'] if s <= j / r < e))}


# ---------------------------------------------------------------- verdicts and printing

def verdict(key: str, v: float, film: bool = False, table: dict = TARGETS) -> str:
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return '-'
    T = table[key]
    tgt, far = (T['target'], T['far']) if film or 'shot' not in T else T['shot']
    if T['kind'] == 'min':
        return 'PASS' if v >= tgt else 'FAR' if v < far else 'WARN'
    return 'PASS' if v <= tgt else 'FAR' if v > far else 'WARN'


def worst(vs: list[str]) -> str:
    for lvl in ('FAR', 'WARN', 'PASS'):
        if lvl in vs:
            return lvl
    return '-'


def cell(key: str, v: float, film: bool = False, table: dict = TARGETS) -> str:
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return '-'
    s = table[key]['fmt'].format(v)
    vd = verdict(key, v, film, table)
    return s + ('' if vd == 'PASS' else '!' if vd == 'WARN' else '!!')


def load_scenes(path, dur: float) -> list[dict]:
    """path: a scene list JSON file, or the list itself, or None (the whole video is one shot)."""
    if not path:
        return [{'id': 'film', 'start': 0.0, 'end': dur, 'trans': []}]
    d = json.loads(Path(path).read_text()) if isinstance(path, (str, Path)) else path
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
            quiet: bool = False, cozy: bool = False, cozy_span: float = 0.2) -> dict:
    """Measure one video. Returns {'preset', 'shots': [...], 'film': {...}, 'verdict'}; prints the table unless quiet.
    cozy=True adds r['cozy'] to every shot and the film (cozy-hold metrics, see the module doc); nothing else changes."""
    info = probe(mp4)
    if preset == 'auto':
        ar = info['h'] / info['w']
        preset = 'film' if abs(ar - 16 / 9) < 0.02 else 'ref1' if abs(ar - 1.25) < 0.02 else 'whole'
    P = dict(PRESETS[preset])
    a = argparse.Namespace(rate=rate, sample=sample, tau=tau, hold=2 / 30, event_vox=500.0, cozy_span=cozy_span,
                           crop=crop if crop is not None else P['crop'], fcrop=fcrop if fcrop is not None else (P['fcrop'] or crop or P['crop']),
                           band=band if band is not None else P['band'], ignore=ignore if ignore is not None else P['ignore'])
    if a.band in ((), (0, 0)):
        a.band = None
    a.scene_list = load_scenes(scenes, info['dur'])
    mo = motion_pass(mp4, info, a)
    fu = fullness_pass(mp4, info, a)
    cz = cozy_pass(mp4, info, a) if cozy else None
    shots = []
    for sc in a.scene_list:
        if only and sc['id'] != only:
            continue
        r = {'id': sc['id'], 's': sc['start'], 'e': sc['end']}
        r.update(motion_stats(mo, sc['start'], sc['end'], sc['trans']))
        r.update(full_stats(fu, sc['start'], sc['end']))
        r['verdicts'] = {k: verdict(k, r[k]) for k in MOTION_KEYS + FULL_KEYS}
        r['verdict'] = worst(list(r['verdicts'].values()))
        if cz is not None:
            c = cozy_stats(cz, sc['start'], sc['end'], sc['trans'])
            c['verdicts'] = {k: verdict(k, c[k], table=COZY_TARGETS) for k in COZY_KEYS}
            c['verdict'] = worst(list(c['verdicts'].values()))
            r['cozy'] = c
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
    film['verdicts'] = {k: verdict(k, film[k], True) for k in MOTION_KEYS + FULL_KEYS}
    # the film is FAR only when an AVERAGE is far off (ev/s, static, flat, obj, detail); gap / run are worst-shot
    # numbers and one empty shot makes the film WARN, not FAR
    vs = [('WARN' if v == 'FAR' and k in ('gap', 'run') else v) for k, v in film['verdicts'].items()]
    film['verdict'] = worst(vs + ['WARN' if any(r['verdict'] != 'PASS' for r in shots) else 'PASS'])
    film['far'] = [k for k, v in film['verdicts'].items() if v == 'FAR' and k not in ('gap', 'run')]
    if cz is not None:
        film['cozy'] = cozy_film(shots)
    res = {'mp4': mp4, 'preset': preset, 'info': info, 'shots': shots, 'film': film, 'verdict': film['verdict'],
           'regions': {'crop': a.crop, 'fcrop': a.fcrop, 'band': a.band, 'ignore': a.ignore}}
    if not quiet:
        print_table(res)
        if cz is not None:
            print_cozy(res, cozy_span)
    return res


def cozy_film(shots: list[dict]) -> dict:
    """Film row of the cozy table: movers / empty over all measured frames; cv and float = the median shot."""
    cs = [r['cozy'] for r in shots if r['cozy']['frames']]
    nf = sum(c['frames'] for c in cs) or 1
    med = (lambda k: float(np.median([c[k] for c in cs if not math.isnan(c[k])])) if any(not math.isnan(c[k]) for c in cs) else math.nan)
    f = {'frames': sum(c['frames'] for c in cs),
         'movers': sum(c['movers'] * c['frames'] for c in cs) / nf if cs else math.nan,
         'movers_min': min((c['movers_min'] for c in cs), default=-1), 'movers_max': max((c['movers_max'] for c in cs), default=-1),
         'empty': sum(c['empty'] * c['frames'] for c in cs) / nf if cs else math.nan,
         'chg': sum(c['chg'] * c['frames'] for c in cs) / nf if cs else math.nan,
         'cv': med('cv'), 'float': med('float'), 'float_peak': med('float_peak'), 'jumps': sum(c['jumps'] for c in cs)}
    f['verdicts'] = {k: verdict(k, f[k], True, COZY_TARGETS) for k in COZY_KEYS}
    f['verdict'] = worst(list(f['verdicts'].values()))
    return f


def print_cozy(res: dict, span: float) -> None:
    print(f"cozy holds: camera shift removed first, change over {span:.2f} s (informational: never changes the verdict)")
    hdr = f"{'shot':8} {'time':>11} {'movers':>7} {'min-max':>8} {'empty':>6} {'cv':>6} {'chg':>6} {'float px/s':>11} {'jumps':>6}  cozy"
    print(hdr)
    print('-' * len(hdr))
    for r in res['shots'] + [res['film']]:
        if r['id'] == 'FILM':
            print('-' * len(hdr))
        c = r['cozy']
        t = f"{r['s']:5.2f}-{r['e']:5.2f}"
        q = (lambda k: cell(k, c[k], r['id'] == 'FILM', COZY_TARGETS))
        mm = f"{c['movers_min']}-{c['movers_max']}" if c['movers_min'] >= 0 else '-'
        fl = '-' if math.isnan(c['float']) else f"{c['float']:.1f}" + (f" ({c['float_peak']:.0f})" if not math.isnan(c['float_peak']) else '')
        ch = '-' if math.isnan(c['chg']) else f"{c['chg']:.1%}"
        print(f"{r['id']:8} {t:>11} {q('movers'):>7} {mm:>8} {q('empty'):>6} {q('cv'):>6} {ch:>6} {fl:>11} {c['jumps']:>6}  {c['verdict']}")
    tg = '  '.join(f"{k} {'>=' if T['kind'] == 'min' else '<='}{T['fmt'].format(T['target'])}" for k, T in COZY_TARGETS.items())
    print(f"cozy marks: {tg}   (! / !!; float = mean (p95) camera px/s at 1080: river ref ~10, street ref 0 = locked)")


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
        c = (lambda k: cell(k, r[k], r['id'] == 'FILM'))
        print(f"{r['id']:8} {t:>11} {c('evps'):>6} {c('gap'):>6} {c('static'):>7} {c('run'):>6} {c('flat'):>6} {c('obj'):>8} {c('detail'):>7}  {r['verdict']}")
    tg = '  '.join(f"{k} {'>=' if T['kind'] == 'min' else '<='}{T['fmt'].format(T['target'])}"
                   + (f" (shot {T['fmt'].format(T['shot'][0])})" if 'shot' in T else '') for k, T in TARGETS.items())
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
    ap.add_argument('--cozy', action='store_true', help='also measure the cozy-hold metrics (camera float, movers, empty frames, cv)')
    ap.add_argument('--cozy-span', type=float, default=0.2, help='cozy: change is measured over this many seconds (default 0.2)')
    a = ap.parse_args()
    tup = (lambda s: tuple(float(x) for x in s.split(',')))
    band = None if a.band is None else (() if a.band == 'none' else tup(a.band))
    ignore = None if a.ignore is None else ([] if a.ignore == ['none'] else [tup(x) for x in a.ignore if x != 'none'])
    if not Path(a.mp4).exists():
        print(f'density: no such file {a.mp4}', file=sys.stderr)
        return 2
    res = analyze(a.mp4, a.scenes, a.preset, a.rate, a.sample, a.tau, band, ignore,
                  tup(a.crop) if a.crop else None, tup(a.fcrop) if a.fcrop else None, a.only, cozy=a.cozy, cozy_span=a.cozy_span)
    if a.json:
        Path(a.json).write_text(json.dumps(res, indent=1, default=lambda o: sorted(o) if isinstance(o, set) else str(o)))
    return 0


if __name__ == '__main__':
    sys.exit(main())
