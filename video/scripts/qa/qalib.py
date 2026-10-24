"""qalib.py: shared machinery for the QA tools in scripts/qa (deadframes, framecheck, beatsync).

Frame sources, camera estimation (ORB + RANSAC similarity, optional second "parallax" layer), camera-compensated
residual change ("life"), cut detection, scene lists and small helpers. Everything is measured in CANVAS px of a
1080-wide canvas, whatever the input resolution, so thresholds carry over between half-scale renders (540x960),
reference 2 (720x1280) and reference 1 (1080x1350).
"""
from __future__ import annotations

import json
import os
import re
from dataclasses import dataclass, field

import cv2
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
CANVAS_W = 1080

cv2.setNumThreads(1)  # the machine is shared: stay on one core per tool

# ---------------------------------------------------------------- defaults (see docs/QA.md "Calibration")

DEFAULTS = dict(
    analysis=0.5,          # analysis resolution relative to the 1080 canvas (540 px wide)
    tau0=22,               # per-pixel residual tolerance (8-bit, max over RGB) for "this pixel changed"
    delta_cam=0.45,        # allowed camera misregistration (analysis px) -> tolerance += 2 * delta * gradient
    delta_static=0.0,      # same for the static-camera hypothesis (renders are pixel-exact; codec noise is left to tau0)
    min_blob=24.0,         # changed blobs smaller than this (canvas px^2) are noise
    dead_px=2000.0,        # a frame is DEAD when its camera-compensated life energy is below this (canvas px^2; ~0.1 % of 1080x1920)
    event_vox=2000.0,      # an EVENT is a space-time change chain of at least this many canvas px^2 * frames
    event_merge=12.0,      # changed pixels closer than this (canvas px) belong to one blob
    event_link=4.0,        # a blob continues a chain when it overlaps the chain's recent footprint within this (canvas px)
    event_hold=2,          # ... changed within the last this many frames (a 1-frame pause in a walk cycle is not a new event)
    caption_band=(280, 600),
)


# ---------------------------------------------------------------- frame sources

def natural_key(s: str):
    return [int(t) if t.isdigit() else t for t in re.split(r'(\d+)', s)]


class FrameSource:
    """Iterate frames of a directory of images (sorted naturally) or a video file, resized to the analysis width."""

    def __init__(self, path: str, fps: float | None = None, analysis: float = DEFAULTS['analysis'], canvas_w: int = CANVAS_W):
        self.path = path
        self.is_dir = os.path.isdir(path)
        self.canvas_w = canvas_w
        if self.is_dir:
            exts = ('.png', '.jpg', '.jpeg', '.webp', '.bmp')
            self.files = sorted([f for f in os.listdir(path) if f.lower().endswith(exts) and not f.startswith('.')], key=natural_key)
            if not self.files:
                raise SystemExit(f'no image frames in {path}')
            im = cv2.imread(os.path.join(path, self.files[0]), cv2.IMREAD_COLOR)
            self.src_h, self.src_w = im.shape[:2]
            self.n = len(self.files)
            self.fps = fps or 30.0
        else:
            cap = cv2.VideoCapture(path)
            if not cap.isOpened():
                raise SystemExit(f'cannot open {path}')
            self.src_w = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            self.src_h = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            self.n = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            vfps = cap.get(cv2.CAP_PROP_FPS) or 30.0
            self.fps = fps or vfps
            cap.release()
        self.src_scale = self.src_w / canvas_w           # source px per canvas px
        self.aw = int(round(canvas_w * analysis))
        self.ah = int(round(self.src_h * self.aw / self.src_w))
        self.a = self.aw / canvas_w                       # analysis px per canvas px
        self.canvas_h = self.src_h / self.src_scale

    def __len__(self):
        return self.n

    def _fit(self, im):
        if im.shape[1] != self.aw or im.shape[0] != self.ah:
            im = cv2.resize(im, (self.aw, self.ah), interpolation=cv2.INTER_AREA)
        return im

    def __iter__(self):
        if self.is_dir:
            for i, f in enumerate(self.files):
                im = cv2.imread(os.path.join(self.path, f), cv2.IMREAD_COLOR)
                yield i, self._fit(im)
        else:
            cap = cv2.VideoCapture(self.path)
            i = 0
            while True:
                ok, im = cap.read()
                if not ok:
                    break
                yield i, self._fit(im)
                i += 1
            cap.release()
            self.n = i

    def full_res(self, i: int):
        """Frame i at source resolution (directories only)."""
        if not self.is_dir:
            raise ValueError('full_res needs a frame directory')
        return cv2.imread(os.path.join(self.path, self.files[i]), cv2.IMREAD_COLOR)


# ---------------------------------------------------------------- camera estimation

IDENT = np.array([[1, 0, 0], [0, 1, 0]], np.float64)


def sim_params(M):
    """(scale, rotation_deg, tx, ty) of a 2x3 similarity."""
    if M is None:
        return 1.0, 0.0, 0.0, 0.0
    s = float(np.hypot(M[0, 0], M[1, 0]))
    r = float(np.degrees(np.arctan2(M[1, 0], M[0, 0])))
    return s, r, float(M[0, 2]), float(M[1, 2])


def max_disp(M, w, h):
    """Largest displacement (px) of the frame corners under M."""
    pts = np.array([[0, 0], [w, 0], [0, h], [w, h], [w / 2, h / 2]], np.float64)
    q = pts @ M[:, :2].T + M[:, 2]
    return float(np.max(np.hypot(*(q - pts).T)))


def compose(A, B):
    """A after B (both 2x3)."""
    A3 = np.vstack([A, [0, 0, 1]])
    B3 = np.vstack([B, [0, 0, 1]])
    return (A3 @ B3)[:2]


class Camera:
    """Sub-pixel camera estimate between consecutive frames: Shi-Tomasi corners tracked with pyramidal Lucas-Kanade
    (forward-backward checked), RANSAC similarity (scale, rotation, shift), plus a second-layer (parallax) fit.
    ORB matching was tried first and is too coarse: it reads a 0.14 %/frame push as 0.02 %."""

    LK = dict(winSize=(21, 21), maxLevel=4, criteria=(cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 30, 0.01))

    def __init__(self, w, h, feature_mask=None, ncorners=900):
        self.w, self.h = w, h
        self.mask = feature_mask
        self.ncorners = ncorners

    def features(self, gray):
        pts = cv2.goodFeaturesToTrack(gray, maxCorners=self.ncorners, qualityLevel=0.005, minDistance=7, mask=self.mask, blockSize=5)
        pts = pts.reshape(-1, 2).astype(np.float32) if pts is not None else np.zeros((0, 2), np.float32)
        return pts, gray

    def models(self, fa, fb):
        """Camera hypotheses mapping frame a -> frame b: [M1, M2?] (each 2x3 float64), plus diagnostics."""
        pa, ga = fa
        _, gb = fb
        out = []
        info = {'matches': 0, 'inliers1': 0, 'inliers2': 0}
        if len(pa) < 8:
            return out, info
        p0 = pa.reshape(-1, 1, 2)
        p1, st, _ = cv2.calcOpticalFlowPyrLK(ga, gb, p0, None, **self.LK)
        if p1 is None:
            return out, info
        p0r, st2, _ = cv2.calcOpticalFlowPyrLK(gb, ga, p1, None, **self.LK)
        fb_err = np.hypot(*(p0r - p0).reshape(-1, 2).T)
        ok = (st.ravel() == 1) & (st2.ravel() == 1) & (fb_err < 0.3)
        A = p0.reshape(-1, 2)[ok]
        B = p1.reshape(-1, 2)[ok]
        keep = np.hypot(*(A - B).T) < 0.12 * self.w   # a camera never moves more than ~12 % of the width per frame
        A, B = A[keep], B[keep]
        info['matches'] = int(len(A))
        if len(A) < 8:
            return out, info
        M1, inl = cv2.estimateAffinePartial2D(A, B, method=cv2.RANSAC, ransacReprojThreshold=0.35, maxIters=2000, confidence=0.995, refineIters=10)
        if M1 is None:
            return out, info
        inl = inl.ravel().astype(bool)
        info['inliers1'] = int(inl.sum())
        if inl.sum() < 10 or inl.mean() < 0.2:
            return out, info
        # a CAMERA hypothesis must be global: its inliers span the frame (a big moving object is not the camera)
        xs, ys = A[inl, 0], A[inl, 1]
        if (xs.max() - xs.min()) < 0.4 * self.w or (ys.max() - ys.min()) < 0.25 * self.h:
            info['local'] = True
            return out, info
        out.append(M1.astype(np.float64))
        # second layer: a different, camera-like motion of a wide set of features (multiplane parallax)
        A2, B2 = A[~inl], B[~inl]
        if len(A2) >= 30 and max_disp(M1, self.w, self.h) > 0.3:
            M2, inl2 = cv2.estimateAffinePartial2D(A2, B2, method=cv2.RANSAC, ransacReprojThreshold=0.35, maxIters=1000, confidence=0.99, refineIters=10)
            if M2 is not None:
                inl2 = inl2.ravel().astype(bool)
                xs, ys = A2[inl2, 0], A2[inl2, 1]
                if inl2.sum() >= max(30, 0.2 * len(A)) and (xs.max() - xs.min()) > 0.4 * self.w and (ys.max() - ys.min()) > 0.15 * self.h:
                    s1, _, tx1, ty1 = sim_params(M1)
                    s2, _, tx2, ty2 = sim_params(M2)
                    c = np.array([self.w / 2, self.h / 2])
                    d1 = M1[:, :2] @ c + M1[:, 2] - c
                    d2 = M2[:, :2] @ c + M2[:, 2] - c
                    same_zoom = (s1 - 1) * (s2 - 1) > 0 and min(abs(s1 - 1), abs(s2 - 1)) > 2e-4
                    same_pan = float(np.dot(d1, d2)) > 0 and np.linalg.norm(d2) > 0.3
                    if same_zoom or same_pan:
                        out.append(M2.astype(np.float64))
                        info['inliers2'] = int(inl2.sum())
        return out, info


# ---------------------------------------------------------------- residual change

K3 = np.ones((3, 3), np.uint8)


def chan_max(img3):
    b, g, r = cv2.split(img3)
    return cv2.max(cv2.max(b, g), r)


def grad_mag(img):
    """Local step height: 3x3 morphological gradient (max - min), max over the colour channels (uint8).
    A camera misregistration of delta px changes a pixel on such a step by about delta * step."""
    return chan_max(cv2.morphologyEx(img, cv2.MORPH_GRADIENT, K3))


def absdiff_max(a, b):
    return chan_max(cv2.absdiff(a, b))


@dataclass
class Residual:
    changed: np.ndarray        # bool, analysis res: pixels no camera hypothesis explains
    valid: np.ndarray          # bool: pixels that could be measured (inside both frames)
    model: str                 # 'static' | 'camera' | 'camera+parallax'
    M: np.ndarray              # chosen primary transform prev -> cur
    raw_frac: float            # fraction of valid pixels changed under the identity hypothesis


def residual(prev, cur, models, opt, gprev=None):
    """Pixels of `cur` that neither a static camera nor any camera hypothesis explains (tolerant differencing:
    |cur - warp(prev)| > tau0 + delta * local step height of warp(prev), max over RGB)."""
    h, w = cur.shape[:2]
    tau0 = float(opt['tau0'])
    if gprev is None:
        gprev = grad_mag(prev)
    gp = gprev.astype(np.float32)
    r_id = absdiff_max(cur, prev).astype(np.float32)
    changed = r_id > tau0 + opt['delta_static'] * gp
    valid = np.ones((h, w), bool)
    raw_frac = float(changed.mean())
    used = []
    best = None
    for M in models:
        if max_disp(M, w, h) < 0.15:
            continue  # indistinguishable from a static camera
        wp = cv2.warpAffine(prev, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        gw = cv2.warpAffine(gp, M, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE)
        inside = cv2.warpAffine(np.full((h, w), 255, np.uint8), M, (w, h), flags=cv2.INTER_NEAREST, borderValue=0) > 0
        expl = (absdiff_max(cur, wp).astype(np.float32) <= tau0 + opt['delta_cam'] * gw) & inside
        if best is None:
            best = M
            valid &= inside | ~changed   # pixels revealed at the frame edge by the camera are not measurable
        changed &= ~expl
        used.append(M)
    model = 'static' if not used else ('camera' if len(used) == 1 else 'camera+parallax')
    return Residual(changed & valid, valid, model, best if best is not None else IDENT.copy(), raw_frac)


def drop_small(mask, min_px):
    """Remove 8-connected components smaller than min_px; returns (mask, labels, stats, n)."""
    n, lab, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), connectivity=8)
    if n <= 1:
        return np.zeros_like(mask), lab, stats, 0
    keep = stats[:, cv2.CC_STAT_AREA] >= min_px
    keep[0] = False
    lut = np.zeros(n, np.int32)
    idx = np.nonzero(keep)[0]
    lut[idx] = np.arange(1, len(idx) + 1)
    lab2 = lut[lab]
    return lab2 > 0, lab2, stats[np.r_[0, idx]], len(idx)


class EventTracker:
    """Motion EVENTS = space-time change blobs. Each frame, changed pixels within `merge` px of each other form one
    blob (neighbouring fragments of one motion). A blob CONTINUES the chain whose recent footprint (pixels it changed
    in the last `hold` frames, grown by `link` px) it overlaps most; otherwise it STARTS a new chain. Chains never
    merge, so a new pop next to an ongoing motion still counts as its own onset, while a walk cycle that pauses for a
    frame or two stays one event. An event is a chain with >= min_vox canvas px^2 * frames.
    Calibration (docs/QA.md): on reference 1 the onsets match the measured 5.9 events/s and 4-frame median gap."""

    def __init__(self, link=2, merge=6, hold=3):
        self.onset: list[int] = []
        self.last: list[int] = []
        self.vox: list[float] = []
        self.peak: list[float] = []
        self.cx: list[float] = []
        self.cy: list[float] = []
        self.foot = None          # chain id (+1) that last changed each pixel
        self.foot_t = None        # frame index of that change
        self.hold = hold
        self.kl = np.ones((2 * link + 1, 2 * link + 1), np.uint8)
        self.km = np.ones((2 * merge + 1, 2 * merge + 1), np.uint8) if merge else None

    def add(self, i, mask, px_area, a):
        """mask: changed pixels of frame i (noise already removed), analysis res."""
        if self.foot is None:
            self.foot = np.zeros(mask.shape, np.float32)
            self.foot_t = np.full(mask.shape, -10 ** 6, np.int32)
        if not mask.any():
            return
        m8 = mask.astype(np.uint8)
        grp = cv2.dilate(m8, self.km) if self.km is not None else m8
        n, lab, stats, cent = cv2.connectedComponentsWithStats(grp, connectivity=8)
        lab = np.where(mask, lab, 0)
        areas = np.bincount(lab.ravel(), minlength=n)
        recent = np.where(i - self.foot_t <= self.hold, self.foot, 0).astype(np.float32)
        pl = cv2.dilate(recent, self.kl).astype(np.int64) - 1        # chain id or -1
        cont = {}
        both = (lab > 0) & (pl >= 0)
        if both.any():
            pairs, cnt = np.unique(np.stack([lab[both], pl[both]], 1), axis=0, return_counts=True)
            for (cj, g), c in zip(pairs, cnt):
                if c > cont.get(int(cj), (0, -1))[0]:
                    cont[int(cj)] = (int(c), int(g))
        ids = np.full(n, -1, np.int64)
        for j in range(1, n):
            ar = float(areas[j]) * px_area
            if ar <= 0:
                continue
            if j in cont:
                g = cont[j][1]
                self.vox[g] += ar
                self.last[g] = i
                self.peak[g] = max(self.peak[g], ar)
            else:
                g = len(self.onset)
                self.onset.append(i)
                self.last.append(i)
                self.vox.append(ar)
                self.peak.append(ar)
                self.cx.append(float(cent[j][0]) / a)
                self.cy.append(float(cent[j][1]) / a)
            ids[j] = g
        sel = lab > 0
        self.foot[sel] = (ids[lab[sel]] + 1).astype(np.float32)
        self.foot_t[sel] = i

    def break_link(self):
        self.foot = None
        self.foot_t = None

    def events(self, min_vox):
        ev = [{'onset': self.onset[g], 'last': self.last[g], 'vox': self.vox[g], 'peak': self.peak[g], 'cx': self.cx[g], 'cy': self.cy[g]}
              for g in range(len(self.onset)) if self.vox[g] >= min_vox]
        ev.sort(key=lambda e: e['onset'])
        return ev


# ---------------------------------------------------------------- edges (cut detection, busyness)

def edges(img_bgr, lo=60, hi=140):
    g = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
    return cv2.Canny(g, lo, hi) > 0


def edge_newness(e_prev, e_cur, M, mask, tol=2):
    """Fraction of cur edges (inside mask) with no prev edge within tol px after warping prev by M."""
    h, w = e_cur.shape
    ep = e_prev.astype(np.uint8)
    if M is not None and max_disp(M, w, h) >= 0.5:
        ep = cv2.warpAffine(ep, M, (w, h), flags=cv2.INTER_NEAREST, borderValue=0)
    k = np.ones((2 * tol + 1, 2 * tol + 1), np.uint8)
    near = cv2.dilate(ep, k) > 0
    ec = e_cur & mask
    n = int(ec.sum())
    if n < 50:
        return 0.0, n
    return float((ec & ~near).sum()) / n, n


def detect_cuts(newness, frac, fps, thresh=0.5, min_frac=0.12, merge_s=0.4, min_gap_s=0.5):
    """Cut frames from per-frame edge newness (max over 1- and 4-frame baselines) and changed-pixel fraction.
    Returns a list of {frame, score}."""
    n = len(newness)
    cand = [i for i in range(1, n) if newness[i] >= thresh and frac[i] >= min_frac]
    groups = []
    for i in cand:
        if groups and i - groups[-1][-1] <= max(1, int(round(merge_s * fps))):
            groups[-1].append(i)
        else:
            groups.append([i])
    cuts = []
    for g in groups:
        best = max(g, key=lambda i: (newness[i] * frac[i]))
        if cuts and (best - cuts[-1]['frame']) < min_gap_s * fps:
            if newness[best] * frac[best] > cuts[-1]['score']:
                cuts[-1] = {'frame': best, 'score': float(newness[best] * frac[best])}
            continue
        cuts.append({'frame': best, 'score': float(newness[best] * frac[best])})
    return cuts


# ---------------------------------------------------------------- scenes

@dataclass
class Scene:
    id: str
    start: float              # seconds on the clip timeline (frame 0 = clip t0)
    end: float
    trans: list = field(default_factory=list)   # [(t0, t1, type)] transition windows (seconds)
    note: str = ''


def film_transition_windows(scenes_json):
    """Transition windows [t0, t1] (VO seconds) of a src/data/scenes.json list, mirroring src/lib/Film.tsx."""
    dflt = {'cut': 0, 'matchcut': 0, 'camera-continuous': 1.4, 'foreground-wipe': 0.8, 'push-through': 1.1, 'unbuild': 0.5}
    wins = []
    ss = sorted(scenes_json, key=lambda s: s['start'])
    for i, s in enumerate(ss):
        tr = s.get('transitionIn')
        if i > 0 and tr:
            c = float(s['start'])
            ty = tr.get('type', 'cut')
            d = float(tr.get('dur', dflt.get(ty, 0)))
            if ty == 'camera-continuous':
                wins.append((c - d / 2, c + d, ty, s['id']))
            elif ty == 'push-through':
                hold = 0.1 if tr.get('bridge') else 0.0
                wins.append((c - (d - hold) * 0.45 - hold / 2, c + hold / 2 + (d - hold) * 0.55, ty, s['id']))
            elif ty == 'foreground-wipe':
                wins.append((c - d / 2, c + d / 2, ty, s['id']))
            elif ty == 'unbuild':
                wins.append((c - d, c, ty, s['id']))
            else:
                wins.append((c, c + 1 / 30, ty, s['id']))
        to = s.get('transitionOut')
        if to and to.get('type') == 'unbuild':
            d = float(to.get('dur', 0.5))
            wins.append((float(s['end']) - d, float(s['end']), 'unbuild-loop', s['id']))
    return wins


def load_scenes(path, duration, t0=0.0, only=None):
    """Scene list on the CLIP timeline (clip t = film t - t0). Accepts src/data/scenes.json-style lists or
    {"scenes": [...]}; each scene needs id/start/end (seconds). Returns (scenes, transition windows)."""
    with open(path) as f:
        data = json.load(f)
    if isinstance(data, dict):
        data = data.get('scenes', [])
    wins = film_transition_windows(data)
    for s in data:  # explicit windows (reference scene lists): "transitions": [[t0, t1, "label"], ...] in film s
        for w in s.get('transitions', []) or []:
            wins.append((float(w[0]), float(w[1]), str(w[2]) if len(w) > 2 else 'transition', s['id']))
    out = []
    for s in sorted(data, key=lambda x: x['start']):
        if only and s['id'] != only:
            continue
        a, b = float(s['start']) - t0, float(s['end']) - t0
        if b <= 0 or a >= duration:
            continue
        sc = Scene(str(s['id']), max(0.0, a), min(duration, b), note=s.get('note', '') or s.get('set', '') or '')
        for (w0, w1, ty, sid) in wins:
            w0, w1 = w0 - t0, w1 - t0
            if w1 > sc.start and w0 < sc.end:
                sc.trans.append((max(sc.start, w0), min(sc.end, w1), ty))
        out.append(sc)
    if out:
        out[-1].end = max(out[-1].end, duration) if abs(out[-1].end - duration) < 0.5 else out[-1].end
    return out, [(w0 - t0, w1 - t0, ty, sid) for (w0, w1, ty, sid) in wins]


def scenes_from_cuts(cut_frames, n, fps, prefix='C', min_len=1.0):
    """Segments between detected cuts; a segment shorter than min_len s (a loop un-build, a flash of a shot) joins its
    neighbour. Each cut gets a +-3-frame transition window."""
    b = [0] + sorted(c for c in cut_frames if 0 < c < n) + [n]
    k = 1
    while k < len(b) - 1:
        if (b[k] - b[k - 1]) < min_len * fps or (b[k + 1] - b[k]) < min_len * fps:
            del b[k]
        else:
            k += 1
    out = []
    for k in range(len(b) - 1):
        sc = Scene(f'{prefix}{k + 1:02d}', b[k] / fps, b[k + 1] / fps, note='detected cut' if k else '')
        if k:
            sc.trans.append((b[k] / fps, (b[k] + 3) / fps, 'detected cut'))
        if k < len(b) - 2:
            sc.trans.append(((b[k + 1] - 3) / fps, b[k + 1] / fps, 'detected cut'))
        out.append(sc)
    return out


# ---------------------------------------------------------------- misc

def runs(flags):
    """[(start, end_inclusive)] of consecutive True runs."""
    out = []
    i = 0
    n = len(flags)
    while i < n:
        if flags[i]:
            j = i
            while j + 1 < n and flags[j + 1]:
                j += 1
            out.append((i, j))
            i = j + 1
        else:
            i += 1
    return out


def wcag_lum(rgb):
    c = np.asarray(rgb, np.float64) / 255.0
    c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    return 0.2126 * c[..., 0] + 0.7152 * c[..., 1] + 0.0722 * c[..., 2]


def contrast(la, lb):
    hi = np.maximum(la, lb)
    lo = np.minimum(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def write_json(path, obj):
    os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(obj, f, indent=1, default=lambda o: float(o) if isinstance(o, (np.floating,)) else int(o) if isinstance(o, np.integer) else str(o))


def fmt_t(sec):
    return f'{sec:.2f}s'
