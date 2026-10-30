#!/usr/bin/env python3
"""COMPOSITION lane of the organic research (2026-10-30): notan / value-grouping studies of still v6 and the owner's
references, measured the same way, plus recomposed value thumbnails of scene 1.

The owner (2026-10-30), on the difference list: "8 [simplicity and focus] agreed this is an important point about scene
composition"; on still v6: "our scene is very busy". We learn methods from the references (we measure them; nothing is
traced, copied or used as an input to a picture of ours).

Every image is studied at 400 px wide (phone width as the owner sees it), after the platform UI burned into the owner's
screenshots is masked (inpainted) and our captions are taken out (the picture is studied, not the words).

  python3 -B composition_study.py measure   # numbers -> composition_metrics.json (+ per-image maps in the scratch)
  python3 -B composition_study.py thumbs    # the recomposed value thumbnails of scene 1 (540 x 960)
  python3 -B composition_study.py sheet     # composition_sheet.png
  python3 -B composition_study.py all
  python3 -B composition_study.py frame STILL.png [--caption] [--subject x0,y0,x1,y1]   # check one still (§6)

Deterministic (no randomness; numpy, scipy, scikit-image, OpenCV, Pillow: BSD/MIT/Apache/HPND licences).
"""
import json
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage as ndi
from skimage.color import rgb2lab
from skimage.filters import threshold_multiotsu

HERE = os.path.dirname(os.path.abspath(__file__))
VIDEO = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
DOCS = os.path.join(VIDEO, 'docs')
LOOK = os.path.join(DOCS, 'look')
SCRATCH = os.environ.get('COMP_SCRATCH', '/tmp/organic/composition')
W400 = 400  # the study width (phone width)

# ---------------------------------------------------------------------------------------------------------------------
# Inputs. Each entry: path, how to clean it, a short label. 'ui' boxes/circles are in source pixels; they are inpainted
# (OpenCV Telea) before anything is measured. 'crop' is (x0, y0, x1, y1) in source pixels.
# ---------------------------------------------------------------------------------------------------------------------
PT = os.path.join(DOCS, 'studies', '2026-10-28_city_posters')
INPUTS = {
    'v6': dict(path=os.path.join(PT, 'paint_test', 'paint_still_v6.png'), caption=True,
               label='our still v6 (scene 1, captions out)'),
    'v5': dict(path=os.path.join(VIDEO, 'deliverables', 'tests', 'painted_scene1_still_v5.png'), caption=True,
               label='our still v5'),
    'v2ship': dict(path=os.path.join(PT, 'baseline', 'v2_t01.00_S1.jpg'), caption=True,
                   label="v2's S1 as shipped (1.0 s)"),
    'r04': dict(path=os.path.join(LOOK, 'refs_human_scale', '04_cloud_beast_frame.jpg'), crop=(0, 112, 720, 1406),
                label='ref 04 cloud beast (9:16)'),
    'r02': dict(path=os.path.join(LOOK, 'refs_human_scale', '02_bus_stop_night.jpg'), circles=[(1124, 537, 46)],
                label='ref 02 bus stop night'),
    'r03': dict(path=os.path.join(LOOK, 'refs_human_scale', '03_beach_dusk.jpg'), circles=[(1124, 552, 46)],
                crop=(0, 4, 1206, 627), label='ref 03 beach dusk'),
    'r01': dict(path=os.path.join(LOOK, 'refs_human_scale', '01_city_hill_sunset.jpg'), circles=[(1124, 549, 46)],
                label='ref 01 city hill sunset'),
    'p01van': dict(path=os.path.join(LOOK, 'refs_paint', '01_beach_van_dusk.jpg'), crop='auto_white',
                   label='paint ref 01 beach van'),
}
_POSTERS = ['01_singapore', '02_reykjavik', '03_hanoi', '04_buenos_aires', '05_cape_town', '06_copenhagen', '07_kyoto']
SHEET_ROWS = ['v6', 'r04', 'r02', 'r03', 'r01']  # v6 and the four references drawn on the sheet
# the story's subject in each picture (normalised x0, y0, x1, y1 of the cleaned picture; by eye, +-2 %): is the focal
# point on it?
SUBJECT = {
    'v6': (0.495, 0.435, 0.675, 0.567),       # the lit Google doorway with her (S1_SHEET.door 540-720 x 848-1082)
    'v5': (0.495, 0.435, 0.675, 0.567), 'v2ship': (0.495, 0.435, 0.675, 0.567),
    'r04': (0.62, 0.74, 0.76, 0.86),          # the girl (and her cape) by the potted plant
    'r02': (0.355, 0.535, 0.655, 0.875),      # the lit shelter with the man
    'r03': (0.69, 0.57, 0.765, 0.85),         # the couple with the phone's glow
    'r01': (0.37, 0.51, 0.49, 0.87),          # the two men on the hill
    'p01van': (0.48, 0.42, 0.56, 0.52),       # the couple on the boulder
    'T1': (0.495, 0.435, 0.675, 0.567), 'T2': (0.495, 0.435, 0.675, 0.567),
    'T3': (0.495, 0.508, 0.675, 0.640),       # tilted up: everything below the sky 70 px lower (at 540)
}


def _poster_inputs():
    try:
        mask = json.load(open(os.path.join(LOOK, 'poster_refs', 'ui_mask.json')))['images']
    except OSError:
        return
    for p in _POSTERS:
        m = mask[p + '.jpg']
        r0, r1 = m['content_rows']
        INPUTS['poster_' + p[3:]] = dict(path=os.path.join(LOOK, 'poster_refs', p + '.jpg'),
                                         boxes=[m['counter_pill_box'], m['mute_button_box']],
                                         crop=(0, r0, m['size'][0], r1), label='poster ' + p[3:].replace('_', ' '))


_poster_inputs()
for _t in ('T1', 'T2', 'T3'):  # our recomposed value thumbnails, measured the same way
    INPUTS[_t] = dict(path=os.path.join(SCRATCH, 'thumbs', _t + '.png'), label='thumbnail ' + _t)

# our caption block at 1080 x 1920 (LAYOUT §1): the ink and its highlight boxes live in x 95-985, y 290-600
CAP_BOX = (90, 292, 990, 600)


def remove_caption(rgb):
    """Take the burned-in caption out of a 1080 x 1920 frame: inside the block, every row is re-made by a straight
    interpolation between the sky just left and just right of the block (the band is one calm sky: CRAFT §g.1)."""
    out = rgb.copy().astype(np.float32)
    s = rgb.shape[1] / 1080.0  # a 9:16 frame at any width
    x0, y0, x1, y1 = [int(round(v * s)) for v in CAP_BOX]
    e = max(2, int(round(6 * s)))
    for y in range(y0, y1):
        a = out[y, x0 - e:x0].mean(axis=0)
        b = out[y, x1:x1 + e].mean(axis=0)
        t = np.linspace(0, 1, x1 - x0)[:, None]
        out[y, x0:x1] = a * (1 - t) + b * t
    return np.clip(out, 0, 255).astype(np.uint8)


def load(name, width=None):
    spec = INPUTS[name]
    im = np.asarray(Image.open(spec['path']).convert('RGB'))
    if spec.get('caption'):
        im = remove_caption(im)
    mask = np.zeros(im.shape[:2], np.uint8)
    for (cx, cy, r) in spec.get('circles', []):
        cv2.circle(mask, (cx, cy), r, 255, -1)
    for (x0, y0, x1, y1) in spec.get('boxes', []):
        mask[max(0, y0 - 18):y1 + 18, max(0, x0 - 18):x1 + 18] = 255
    if mask.any():
        im = cv2.inpaint(im, mask, 9, cv2.INPAINT_TELEA)
    crop = spec.get('crop')
    if crop == 'auto_white':  # the print's white border and the app's dark bars
        g = im.mean(axis=2)
        rows = np.where((g < 235).mean(axis=1) > 0.9)[0]
        cols = np.where((g[rows.min():rows.max()] < 235).mean(axis=0) > 0.9)[0]
        # the painting is the longest run of such rows
        runs = np.split(rows, np.where(np.diff(rows) != 1)[0] + 1)
        rr = max(runs, key=len)
        crop = (cols.min() + 3, rr.min() + 3, cols.max() - 3, rr.max() - 3)
    if crop:
        x0, y0, x1, y1 = crop
        im = im[y0:y1, x0:x1]
    w = width or W400
    h = int(round(im.shape[0] * w / im.shape[1]))
    small = cv2.resize(im, (w, h), interpolation=cv2.INTER_AREA)
    return small


# ---------------------------------------------------------------------------------------------------------------------
# Measures
# ---------------------------------------------------------------------------------------------------------------------
SQUINT = 2.0      # px at 400 wide (0.5 % W): the notan's squint
QWIN = 11         # px window for "quiet" (local spread of L* at the squint)
QUIET_STD = 2.5   # L*: a window calmer than this is quiet
MASS_MIN = 0.01   # a value mass is a connected region of one value group >= 1 % of the frame
FRAG_MIN = 0.0002  # a fragment: >= 0.02 % of the frame and < 1 % (at 400 px wide: >= ~57 px in a 9:16 frame)


def lab_of(rgb):
    return rgb2lab(rgb.astype(np.float64) / 255.0)


def squint(L, s=SQUINT):
    return ndi.gaussian_filter(L, s)


def otsu_eta(L, thr):
    """Between-class variance over total variance for the classes cut at thr (Otsu's effectiveness, 0-1)."""
    edges = np.concatenate([[-1e9], thr, [1e9]])
    mu = L.mean(); tot = L.var()
    sb = 0.0
    for a, b in zip(edges[:-1], edges[1:]):
        m = (L > a) & (L <= b)
        if m.any():
            sb += m.mean() * (L[m].mean() - mu) ** 2
    return float(sb / tot) if tot > 0 else 1.0


def posterise(Ls, k):
    thr = threshold_multiotsu(Ls, classes=k, nbins=256) if k > 2 else np.array([threshold_multiotsu(Ls, 2)[0]])
    lab = np.digitize(Ls, thr)  # 0 = darkest
    return lab, thr


def components(lab):
    """All connected regions (8-connected) of a label map: list of (area, group, mask-label) and a region-id map."""
    out = []
    rid = np.zeros(lab.shape, np.int32)
    nxt = 1
    for g in np.unique(lab):
        cc, n = ndi.label(lab == g, structure=np.ones((3, 3)))
        if n == 0:
            continue
        areas = ndi.sum(np.ones_like(cc), cc, index=np.arange(1, n + 1))
        for i, a in enumerate(areas, start=1):
            out.append((int(a), int(g), nxt))
        rid[cc > 0] = cc[cc > 0] + nxt - 1
        nxt += n
    return out, rid


def boundary_share(lab):
    b = np.zeros(lab.shape, bool)
    b[:, 1:] |= lab[:, 1:] != lab[:, :-1]
    b[1:, :] |= lab[1:, :] != lab[:-1, :]
    return float(b.mean())


def local_std(L, w=QWIN):
    m = ndi.uniform_filter(L, w)
    m2 = ndi.uniform_filter(L * L, w)
    return np.sqrt(np.maximum(m2 - m * m, 0))


def salience(lab):
    """CRAFT §b's salience (scripts/qa/retro_tools/hierarchy/analyse.py), its sigmas scaled from 540 to 400 px wide:
    luminance centre-surround contrast /15 + colour contrast /15 + chroma /60, blurred."""
    k = W400 / 540.0
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    lc = 0.5 * (np.abs(L - ndi.gaussian_filter(L, 8 * k)) + np.abs(L - ndi.gaussian_filter(L, 32 * k)))
    ab = np.dstack([a, b])
    abb = np.dstack([ndi.gaussian_filter(a, 24 * k), ndi.gaussian_filter(b, 24 * k)])
    cc = np.linalg.norm(ab - abb, axis=2)
    C = np.hypot(a, b)
    s = lc / 15 + cc / 15 + C / 60
    return ndi.gaussian_filter(s, 10 * k)


CALL = 0.5    # a region whose value pull is >= 50 % of the frame's strongest (above the median) calls the eye
RIVAL = 0.7   # a call whose own peak is >= 70 % of the strongest is a rival: equal weight


def value_salience(L):
    """CRAFT §b's luminance centre-surround term alone, at 400 px wide: what a squinting eye catches in a notan."""
    k = W400 / 540.0
    lc = 0.5 * (np.abs(L - ndi.gaussian_filter(L, 8 * k)) + np.abs(L - ndi.gaussian_filter(L, 32 * k)))
    return ndi.gaussian_filter(lc / 15, 10 * k)


def salience_calls(S):
    """Connected regions of S >= median + CALL * (max - median): one per thing that calls the eye, each with its own
    peak height h (relative), peak and centroid (normalised), area share and box. Sorted by h."""
    H, W = S.shape
    med = float(np.median(S)); top = float(S.max())
    cc, n = ndi.label(S >= med + CALL * (top - med), structure=np.ones((3, 3)))
    out = []
    for i, sl in enumerate(ndi.find_objects(cc), start=1):
        m = cc[sl] == i
        sub = S[sl]
        j = np.argmax(np.where(m, sub, -1))
        py, px = np.unravel_index(j, m.shape)
        cy, cx = ndi.center_of_mass(m)
        out.append(dict(h=round(float((sub[py, px] - med) / (top - med)), 3),
                        px=round((px + sl[1].start) / W, 3), py=round((py + sl[0].start) / H, 3),
                        cx=round((cx + sl[1].start) / W, 3), cy=round((cy + sl[0].start) / H, 3),
                        area=round(float(m.sum()) / (H * W), 5),
                        box=[round(sl[1].start / W, 3), round(sl[0].start / H, 3), round(sl[1].stop / W, 3),
                             round(sl[0].stop / H, 3)]))
    out.sort(key=lambda c: -c['h'])
    return out


NOTAN = 4.0       # px at 400 wide (1 % W): the notan's squint, where texture merges into its mass and props stay


def in_box(x, y, box, W, H, pad=0.03):
    x0, y0, x1, y1 = box
    return (x0 - pad) * W <= x <= (x1 + pad) * W and (y0 - pad) * H <= y <= (y1 + pad) * H


def measure_one(name, save_maps=True):
    rgb = load(name)
    H, W = rgb.shape[:2]
    N = H * W
    lab = lab_of(rgb)
    L = lab[..., 0]
    res = dict(name=name, label=INPUTS[name]['label'], size=[W, H])
    # value structure (unblurred)
    res['L_median'] = float(np.median(L))
    res['L_p5_p95'] = [float(np.percentile(L, 5)), float(np.percentile(L, 95))]
    res['dark_share_L40'] = float((L < 40).mean())
    # notan: posterise at the squints; masses, pieces, boundaries
    for tag, sig in (('s2', SQUINT), ('s4', NOTAN)):
        Ls = squint(L, sig)
        for k in (2, 3, 5):
            labk, thr = posterise(Ls, k)
            key = '%s_k%d' % (tag, k)
            comps, rid = components(labk)
            areas = np.array(sorted([c[0] for c in comps], reverse=True), float)
            big = areas[areas >= MASS_MIN * N]
            pieces = areas[(areas >= FRAG_MIN * N) & (areas < MASS_MIN * N)]
            dark = sorted([c[0] for c in comps if c[1] == 0], reverse=True)
            res[key] = dict(
                dark_top2=float(sum(dark[:2]) / N),
                thr=[float(t) for t in thr], eta=otsu_eta(Ls, thr),
                share=[float((labk == g).mean()) for g in range(k)],
                meanL=[float(L[labk == g].mean()) if (labk == g).any() else None for g in range(k)],
                masses=int(len(big)), mass_cover=float(big.sum() / N), top3=float(areas[:3].sum() / N),
                pieces=int(len(pieces)), pieces_per100k=float(len(pieces) / N * 1e5),
                piece_cover=float(pieces.sum() / N), boundary=boundary_share(labk))
            if save_maps:
                np.save(os.path.join(SCRATCH, 'maps', '%s_%s.npy' % (name, key)), labk.astype(np.uint8))
        # in-mass texture: inside the 3-value masses >= 1 %, the spread of the unblurred L*
        if tag == 's4':
            labk, _ = posterise(Ls, 3)
            comps, rid = components(labk)
            sds = []
            for a, g, i in comps:
                if a >= MASS_MIN * N:
                    sds.append((a, float(L[rid == i].std())))
            sds.sort(key=lambda t: -t[0])
            res['inmass_std_top3'] = [round(sd, 2) for a, sd in sds[:3]]
    # quiet: calm at a squint
    sd = local_std(squint(L, SQUINT))
    quiet = sd < QUIET_STD
    qcc, qn = ndi.label(quiet, structure=np.ones((3, 3)))
    qareas = np.sort(ndi.sum(np.ones_like(qcc), qcc, index=np.arange(1, qn + 1)))[::-1] if qn else np.array([0])
    res['quiet_share'] = float(quiet.mean())
    res['quiet_largest'] = float(qareas[0] / N)
    res['quiet_second'] = float(qareas[1] / N) if len(qareas) > 1 else 0.0
    res['quiet_regions_2pc'] = int((qareas >= 0.02 * N).sum())
    res['quiet_big_share'] = float(qareas[qareas >= 0.02 * N].sum() / N)
    # by thirds of the height (the frame's top / middle / bottom)
    res['quiet_by_third'] = [float(quiet[int(i * H / 3):int((i + 1) * H / 3)].mean()) for i in range(3)]
    # what calls the eye: CRAFT §b's luminance term alone (a notan sees value), and its full colour formula
    V = value_salience(L)
    calls = salience_calls(V)
    res['calls'] = len(calls)
    res['rivals'] = int(sum(c['h'] >= RIVAL for c in calls))
    res['calls_list'] = calls[:16]
    res['focal'] = [calls[0]['px'], calls[0]['py']] if calls else None
    S = salience(lab)
    ccalls = salience_calls(S)
    res['colour_calls'] = len(ccalls)
    res['colour_rivals'] = int(sum(c['h'] >= RIVAL for c in ccalls))
    res['colour_focal'] = [ccalls[0]['px'], ccalls[0]['py']] if ccalls else None
    res['sal_p99_over_median'] = float(np.percentile(S, 99) / np.median(S))
    box = SUBJECT.get(name)
    if box:
        res['focal_on_subject'] = bool(calls and in_box(calls[0]['px'] * W, calls[0]['py'] * H, box, W, H))
        res['colour_focal_on_subject'] = bool(ccalls and in_box(ccalls[0]['px'] * W, ccalls[0]['py'] * H, box, W,
                                                                  H))
        rk = [i for i, c in enumerate(calls) if in_box(c['px'] * W, c['py'] * H, box, W, H)]
        res['subject_call_rank'] = rk[0] + 1 if rk else None
        rk = [i for i, c in enumerate(ccalls) if in_box(c['px'] * W, c['py'] * H, box, W, H)]
        res['subject_colour_rank'] = rk[0] + 1 if rk else None
    if save_maps:
        np.save(os.path.join(SCRATCH, 'maps', '%s_V.npy' % name), V.astype(np.float32))
    # the brightest 1 % at the notan squint: where is the light?
    Ls4 = squint(L, NOTAN)
    t = np.percentile(Ls4, 99)
    yy, xx = np.nonzero(Ls4 >= t)
    res['bright1_centroid'] = [round(float(xx.mean() / W), 3), round(float(yy.mean() / H), 3)]
    res['bright1_spread'] = round(float(np.hypot(xx.std() / W, yy.std() / H)), 3)
    if save_maps:
        np.save(os.path.join(SCRATCH, 'maps', '%s_quiet.npy' % name), quiet)
        Image.fromarray(rgb).save(os.path.join(SCRATCH, 'maps', '%s_400.png' % name))
    return res


# ---------------------------------------------------------------------------------------------------------------------
# The recomposed value thumbnails of scene 1 (540 x 960): v2's view across the canal kept (the owner: "our initial angle
# snd the view frankly wasn't bad"), every shape at v6's place (halved), the VALUES regrouped. Flat values in L*, lost
# edges where two values are close (a blur on the mask), found (crisp) edges only at the focal point.
# ---------------------------------------------------------------------------------------------------------------------
TW, TH, SS = 540, 960, 4  # thumbnail size and supersampling

# three value plans for the same drawing (L*). 'sky' = (top, band, horizon by the sun, horizon right)
PLANS = {
    'T1': dict(title='T1 one lit door, a shaded quay', key='recommended: the light lane\'s rig (low sun left, the lit '
               'door the story light); our quay in the canopy\'s shade',
               sky=(80, 86, 92, 87), cloud=(77, 86), city=80, tower=78, sun=95, bridge=(78, 71), facade=52,
               panes=47, lit_panes=60, door=97, her=24, frame=30, towpath=58, life=(53, 64), pool=78, coping=66,
               boat=(44, 55), water=72, refl=55, column=90, glint=89, quay_lit=56, quay=42, dapple=50, props=33,
               pip=57),
    'T2': dict(title='T2 counterchange: a dark band, one light in it', key='the far side backlit into one dark band; '
               'light water below it; a light, quiet near quay',
               sky=(80, 86, 92, 87), cloud=(77, 86), city=82, tower=80, sun=95, bridge=(79, 72), facade=31,
               panes=27, lit_panes=42, door=97, her=16, frame=20, towpath=34, life=(29, 40), pool=66, coping=46,
               boat=(27, 35), water=82, refl=46, column=95, glint=93, quay_lit=66, quay=62, dapple=62, props=40,
               pip=37),
    'T3': dict(title='T3 low key, a bigger sky', key='the references\' value range: a dusk sky darker at the top, a '
               'dark cloud lit on the sun side, dusk water, our quay one deep mass; tilted up 140 px (at 1080)',
               sky=(60, 77, 91, 80), cloud=(52, 83), city=72, tower=66, sun=96, bridge=(63, 56), facade=37,
               panes=33, lit_panes=50, door=97, her=14, frame=18, towpath=40, life=(35, 47), pool=72, coping=50,
               boat=(30, 40), water=52, refl=36, column=88, glint=86, quay_lit=40, quay=25, dapple=31, props=14,
               pip=42, tilt=70),
}


def _catmull(pts, n=10, closed=True):
    """A smooth closed (or open) curve through the points (Catmull-Rom): organic outlines, never polygons."""
    P = np.asarray(pts, float)
    if closed:
        P = np.vstack([P[-1], P, P[0], P[1]])
    else:
        P = np.vstack([P[0], P, P[-1]])
    out = []
    for i in range(1, len(P) - 2):
        p0, p1, p2, p3 = P[i - 1], P[i], P[i + 1], P[i + 2]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
                              (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    if not closed:
        out.append(P[-2])
    return out


def _wobble(x0, x1, y0, y1, amp, seed, n=24):
    """Points along a line with a seeded organic wobble (sum of three sines): a leafy or ragged edge."""
    rng = np.random.default_rng(seed)
    ph = rng.uniform(0, 2 * np.pi, 3)
    fr = np.array([1.7, 3.9, 8.3])
    out = []
    for t in np.linspace(0, 1, n):
        w = (np.sin(fr[0] * 2 * np.pi * t + ph[0]) * 0.55 + np.sin(fr[1] * 2 * np.pi * t + ph[1]) * 0.3 +
             np.sin(fr[2] * 2 * np.pi * t + ph[2]) * 0.15)
        out.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t + amp * w))
    return out


class Canvas:
    """An L* canvas at SS x supersampling; shapes are masks (anti-aliased by the supersampling), optionally blurred
    (a lost edge), composited flat. Work is cropped to each shape's box."""

    def __init__(self):
        self.L = np.zeros((TH * SS, TW * SS), np.float32)

    def _mask(self, draw_fn):
        m = Image.new('L', (TW * SS, TH * SS), 0)
        draw_fn(ImageDraw.Draw(m))
        bb = m.getbbox()
        return m, bb

    def put_mask(self, m, bb, v, soft=0.0, alpha=1.0):
        if bb is None:
            return
        pad = int(3 * soft * SS) + 2
        x0, y0 = max(0, bb[0] - pad), max(0, bb[1] - pad)
        x1, y1 = min(TW * SS, bb[2] + pad), min(TH * SS, bb[3] + pad)
        a = np.asarray(m.crop((x0, y0, x1, y1)), np.float32) / 255.0
        if soft > 0:
            a = ndi.gaussian_filter(a, soft * SS)
        if np.ndim(alpha):
            al = alpha[y0:y1, x0:x1]
        else:
            al = alpha
        a = np.clip(a * al, 0, 1)
        sub = self.L[y0:y1, x0:x1]
        vv = v[y0:y1, x0:x1] if np.ndim(v) else v
        self.L[y0:y1, x0:x1] = sub * (1 - a) + vv * a

    def shape(self, pts, v, soft=0.0, curve=False, alpha=1.0):
        q = _catmull(pts) if curve else pts
        q = [(x * SS, y * SS) for x, y in q]
        m, bb = self._mask(lambda d: d.polygon(q, fill=255))
        self.put_mask(m, bb, v, soft, alpha)

    def blobs(self, ells, v, soft=0.0, alpha=1.0):
        """A union of ellipses (cx, cy, rx, ry): lobed masses (clouds, foliage, dapples)."""
        def fn(d):
            for cx, cy, rx, ry in ells:
                d.ellipse([(cx - rx) * SS, (cy - ry) * SS, (cx + rx) * SS, (cy + ry) * SS], fill=255)
        m, bb = self._mask(fn)
        self.put_mask(m, bb, v, soft, alpha)

    def line(self, pts, v, width, soft=0.0, alpha=1.0):
        q = [(x * SS, y * SS) for x, y in pts]
        m, bb = self._mask(lambda d: d.line(q, fill=255, width=max(1, int(width * SS)), joint='curve'))
        self.put_mask(m, bb, v, soft, alpha)

    def result(self):
        return cv2.resize(self.L, (TW, TH), interpolation=cv2.INTER_AREA)


def draw_thumb(plan):
    P = PLANS[plan]
    dy = P.get('tilt', 0)  # a small tilt up: the whole world below the sky moves down by dy (more sky)
    c = Canvas()
    yy = np.arange(TH * SS, dtype=np.float32)[:, None] / SS
    xx = np.arange(TW * SS, dtype=np.float32)[None, :] / SS
    top, band, hor_sun, hor_r = P['sky']
    HOR = 482 + dy
    # the sky: ONE gradient, flat in the caption band (y 145-300), lightest toward the sun at the horizon
    sky = np.where(yy < 145, top + (band - top) * (yy / 145.0), band)
    hor = hor_r + (hor_sun - hor_r) * np.exp(-((xx - 97) / 210.0) ** 2)
    t = np.clip((yy - 300) / (HOR - 300), 0, 1) ** 1.3
    sky = np.where(yy > 300, band + (hor - band) * t, sky)
    c.L[:] = np.broadcast_to(sky, c.L.shape)
    Y = lambda y: y + dy  # noqa: E731  (everything on the ground moves with the tilt)
    # the sun: one step off its sky, half behind the far roofs (a soft glow, never a call)
    c.blobs([(97, Y(372), 24, 24)], P['sun'] - 2, soft=7, alpha=0.55)
    c.blobs([(97, Y(372), 10, 10)], P['sun'], soft=1.0)
    # the cloud: ONE lobed mass in the top gutter (never in the band), its lit face toward the sun (lower left) a broad
    # area, never a rim band; its base lost
    lobes = [(338, 104, 40, 22), (384, 78, 44, 36), (438, 60, 50, 44), (496, 50, 52, 46), (540, 70, 40, 44),
             (470, 104, 66, 22), (400, 110, 70, 18)]
    cm = Image.new('L', (TW * SS, TH * SS), 0)
    dd = ImageDraw.Draw(cm)
    for cx, cy, rx, ry in lobes:
        dd.ellipse([(cx - rx) * SS, (cy - ry) * SS, (cx + rx) * SS, (cy + ry) * SS], fill=255)
    cmask = ndi.gaussian_filter(np.asarray(cm, np.float32) / 255.0, 2.2 * SS)
    lit = np.clip((470 - xx - 0.9 * (yy - 40)) / 120.0, 0, 1)  # the side toward the low sun (left, below)
    base = np.clip((yy - 96) / 30.0, 0, 1)                     # the base melts into the sky (a lost edge)
    a = cmask * (1 - 0.65 * base)
    c.L = c.L * (1 - a) + (P['cloud'][0] + (P['cloud'][1] - P['cloud'][0]) * lit) * a
    # the far city by the sun: one pale mass on its own plane, edges lost in the haze
    city = [(0, Y(392)), (14, Y(384)), (30, Y(386)), (36, Y(372)), (58, Y(374)), (64, Y(386)), (92, Y(388)),
            (100, Y(378)), (118, Y(380)), (124, Y(392)), (150, Y(394)), (158, Y(402)), (160, Y(500)), (0, Y(500))]
    c.shape(city, P['city'], soft=1.6)
    c.shape([(117, Y(304)), (148, Y(306)), (149, Y(446)), (117, Y(446))], P['tower'], soft=1.4)
    # the bridge: a light deck and its arch, the opening a step down
    c.shape([(0, Y(472)), (160, Y(474)), (160, Y(526)), (0, Y(526))], P['bridge'][0], soft=0.8)
    arch = [(80 + 66 * np.cos(a), Y(527) - 24 * np.sin(a)) for a in np.linspace(np.pi, 0, 20)]
    c.shape(arch, P['bridge'][1], soft=0.9)
    c.shape([(0, Y(470)), (160, Y(472)), (160, Y(476)), (0, Y(474))], P['bridge'][0] + 6, soft=0.5)
    # the facade: ONE mass (backlit by the low sun), its roof line soft with planting
    roof = [(x, Y(y)) for x, y in _wobble(156, 540, 303, 300, 2.2, 11, n=30)]
    c.shape(roof + [(540, Y(552)), (156, Y(552))], P['facade'], soft=0.6)
    # the upper floor's panes: tone-on-tone (lost edges), two lit warmly but subdued
    for (x0, x1, lit, j) in ((190, 232, False, 1), (240, 298, True, -2), (310, 372, False, 2), (392, 462, False, -1),
                             (478, 538, True, 1)):
        c.shape([(x0, Y(312 + j)), (x1, Y(312 - j)), (x1, Y(392)), (x0, Y(392 + j))],
                P['lit_panes'] if lit else P['panes'], soft=1.2)
    for (x0, x1) in ((176, 262), (382, 476)):  # the ground floor's glass, tone-on-tone
        c.shape([(x0, Y(410)), (x1, Y(410)), (x1, Y(530)), (x0, Y(530))], P['panes'], soft=1.2)
    # the boats along the far quay at the right; Pip hides on the cabin (tone-on-tone, off the eye path)
    c.shape([(392, Y(548)), (430, Y(540)), (540, Y(538)), (540, Y(588)), (420, Y(590)), (398, Y(572))], P['boat'][0],
            soft=0.8, curve=True)
    c.shape([(440, Y(522)), (540, Y(520)), (540, Y(542)), (440, Y(544))], P['boat'][1], soft=0.8)
    c.blobs([(472, Y(517), 6, 6)], P['pip'], soft=0.5)
    # the far towpath: one band, its life tone-on-tone (texture inside the mass, never separate calls)
    c.shape([(0, Y(524)), (540, Y(524)), (540, Y(554)), (0, Y(552))], P['towpath'], soft=0.5)
    rng = np.random.default_rng(7)
    groups = [(14, 'pp'), (34, 'u'), (61, 'p'), (96, 'ppp'), (140, 'b'), (188, 'u'), (214, 'pp'), (246, 'p'),
              (392, 'pp'), (420, 'p')]
    for gx, kind in groups:  # people, a cafe table with its umbrella, a bike: small, low contrast, never a row
        for j, ch in enumerate(kind):
            x = gx + j * rng.uniform(5, 8)
            v = P['life'][(j + len(kind)) % 2]
            if ch == 'p':
                h = rng.uniform(9, 14)
                c.shape([(x, Y(549)), (x + 3.6, Y(549)), (x + 3.2, Y(549 - h * 0.7)), (x + 1.8, Y(549 - h)),
                         (x + 0.4, Y(549 - h * 0.7))], v, soft=0.6)
            elif ch == 'u':
                c.shape([(x - 9, Y(536)), (x + 9, Y(536)), (x + 1, Y(530)), (x - 1, Y(530))], v, soft=0.6)
                c.shape([(x - 0.6, Y(536)), (x + 0.6, Y(536)), (x + 0.6, Y(549)), (x - 0.6, Y(549))], v, soft=0.5)
            elif ch == 'b':
                c.blobs([(x, Y(545), 3.2, 3.2), (x + 9, Y(545), 3.2, 3.2)], v, soft=0.6)
    c.shape([(0, Y(548)), (540, Y(549)), (540, Y(556)), (0, Y(555))], P['coping'], soft=0.6)
    # THE FOCAL: the lit doorway (the story light), her dark silhouette in it, its pool on the towpath
    c.blobs([(318, Y(549), 64, 8)], P['pool'], soft=3.0)
    c.shape([(266, Y(420)), (364, Y(420)), (364, Y(545)), (266, Y(545))], P['frame'])
    c.shape([(271, Y(425)), (359, Y(425)), (359, Y(543)), (271, Y(543))], P['door'] - 4)
    c.blobs([(315, Y(505), 50, 46)], P['door'], soft=10)   # the lobby brightest low and central (its lamps)
    her = [(343, 462), (349, 462), (351, 470), (348, 478), (352, 500), (350, 522), (352, 540), (346, 541),
           (344, 524), (340, 541), (334, 541), (337, 520), (336, 498), (339, 478), (338, 469)]
    c.shape([(x, Y(y)) for x, y in her], P['her'], curve=True)
    # the water: the sky's reflection, the facade's reflection (one soft mass, ragged below), the door's light column
    # (broken by a few ripples), the sun's glint
    e0, e1 = (0, Y(575)), (540, Y(645))
    c.shape([(0, Y(555)), (540, Y(556)), e1, e0], P['water'], soft=0.3)
    rag = [(x, Y(y)) for x, y in _wobble(540, 158, 600, 590, 5.0, 31, n=26)]
    c.shape([(158, Y(556)), (540, Y(556))] + rag, P['refl'], soft=1.6)
    for k, y in enumerate((572, 588)):  # two calm ripple lines across the reflection
        c.shape([(170 + 30 * k, Y(y)), (520, Y(y + 1)), (520, Y(y + 2.4)), (170 + 30 * k, Y(y + 1.6))], P['water'],
                soft=0.7, alpha=0.7)
    col = [(300, Y(556)), (336, Y(556)), (333, Y(574)), (329, Y(596)), (324, Y(620)), (319, Y(638)),
           (314, Y(620)), (309, Y(596)), (304, Y(574))]
    c.shape(col, P['column'], soft=1.6, curve=True)
    for y in (571, 590, 611):  # ripples break the column
        c.shape([(292, Y(y)), (346, Y(y + 0.5)), (346, Y(y + 2.0)), (292, Y(y + 1.6))], P['water'], soft=0.9,
                alpha=0.8)
    for (x0, x1, y) in ((82, 112, 558), (88, 108, 565), (92, 103, 573)):  # the sun's glint: three short strokes
        c.shape([(x0, Y(y)), (x1, Y(y)), (x1 - 2, Y(y + 2.4)), (x0 + 2, Y(y + 2.4))], P['glint'], soft=0.8)
    # our near quay: the coping lit by the sky, then the canopy's shade (ONE quiet mass with a leafy edge and a few
    # dapples), its paving joints and fallen leaves tone-on-tone (quiet is never empty)
    c.shape([e0, e1, (540, 960), (0, 960)], P['quay_lit'], soft=0.4)
    leafy = [(x, Y(y)) for x, y in _wobble(0, 540, 612, 698, 7.0, 23, n=40)]
    c.shape(leafy + [(540, 960), (0, 960)], P['quay'], soft=1.8)
    for (cx, cy, rx, ry) in ((118, 650, 22, 6), (236, 684, 30, 7), (402, 728, 18, 5), (60, 742, 14, 4)):
        c.blobs([(cx, Y(cy), rx, ry)], P['dapple'], soft=2.2)
    vp = (1500, HOR)
    for y0 in (700, 780, 880):  # paving joints receding to the vanishing point, +-3 L*
        yb = Y(y0)
        if yb >= 960:
            continue
        c.line([(0, yb), (540, yb + (vp[1] - yb) * 540 / vp[0])], P['quay'] + 3, 1.2, soft=0.6)
    for (lx, ly, r) in ((150, 812, 3), (205, 860, 2.5), (330, 905, 3), (92, 930, 2.5), (280, 790, 2)):
        if Y(ly) < 955:
            c.blobs([(lx, Y(ly), r * 1.6, r)], P['quay'] + 6, soft=0.5)
    # a hint at the edges: one cafe table and chair cut by the right edge, inside the shade (tone-on-tone)
    c.blobs([(512, Y(826), 46, 9)], P['props'], soft=0.6)                                   # the round top
    c.shape([(506, Y(830)), (516, Y(830)), (518, Y(930)), (504, Y(930))], P['props'], soft=0.6)  # its stem
    c.blobs([(511, Y(934), 26, 6)], P['props'], soft=0.6)                                   # its foot
    c.shape([(420, Y(846)), (432, Y(842)), (436, Y(880)), (466, Y(878)), (470, 960), (462, 960), (460, Y(896)),
             (436, Y(898)), (434, 960), (426, 960)], P['props'], soft=0.6)                  # a chair, its back to us
    return c.result()


def lstar_to_grey(L):
    """L* (a* = b* = 0) to an sRGB grey (exact CIE inverse + sRGB transfer)."""
    fy = (np.asarray(L, np.float64) + 16) / 116
    Y = np.where(fy > 6 / 29, fy ** 3, 3 * (6 / 29) ** 2 * (fy - 4 / 29))
    v = np.where(Y <= 0.0031308, 12.92 * Y, 1.055 * np.power(np.clip(Y, 0, None), 1 / 2.4) - 0.055)
    return np.clip(np.round(v * 255), 0, 255).astype(np.uint8)


def cmd_thumbs():
    os.makedirs(os.path.join(SCRATCH, 'thumbs'), exist_ok=True)
    for plan in PLANS:
        L = draw_thumb(plan)
        g = lstar_to_grey(L)
        Image.fromarray(np.dstack([g] * 3)).save(os.path.join(SCRATCH, 'thumbs', plan + '.png'))
        np.save(os.path.join(SCRATCH, 'thumbs', plan + '_L.npy'), L.astype(np.float32))
        print(plan, 'L range %.0f-%.0f' % (L.min(), L.max()))


def cmd_measure(names=None):
    os.makedirs(os.path.join(SCRATCH, 'maps'), exist_ok=True)
    names = names or list(INPUTS)
    out = {}
    for n in names:
        out[n] = measure_one(n)
        r = out[n]
        a = r['s4_k3']
        print('%-20s s4k3 masses %2d cover %.2f top3 %.2f pieces %3d | quiet %.2f L %.2f 2nd %.2f thirds %s | calls %2d '
              'rivals %2d focal %s on-subj %s (#%s) | colour calls %2d rivals %2d focal %s on-subj %s (#%s)'
              % (n, a['masses'], a['mass_cover'], a['top3'], a['pieces'], r['quiet_share'], r['quiet_largest'],
                 r['quiet_second'], [round(v, 2) for v in r['quiet_by_third']], r['calls'], r['rivals'], r['focal'],
                 r.get('focal_on_subject'), r.get('subject_call_rank'), r['colour_calls'], r['colour_rivals'],
                 r['colour_focal'], r.get('colour_focal_on_subject'), r.get('subject_colour_rank')))
    return out


# ---------------------------------------------------------------------------------------------------------------------
# The sheet
# ---------------------------------------------------------------------------------------------------------------------
FONT_DIR = '/usr/share/fonts/opentype/inter/'
BG = (244, 240, 234)
INK = (34, 30, 36)
SUB = (96, 90, 98)
CALL_C = (236, 112, 28)     # what calls the eye (orange)
SUBJ_C = (22, 150, 160)     # the story's subject (teal)
QUIET_C = (90, 150, 230)    # quiet (blue)
POST_L = {2: (24, 86), 3: (24, 56, 88), 5: (18, 36, 55, 74, 92)}  # the L* each posterised group is shown at


def font(size, weight='Regular'):
    for f in (FONT_DIR + 'Inter-%s.otf' % weight, '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            continue
    return ImageFont.load_default()


def grey_of(L):
    g = lstar_to_grey(L)
    return np.dstack([g] * 3)


def tile_notan(name, k, tag='s4'):
    lab = np.load(os.path.join(SCRATCH, 'maps', '%s_%s_k%d.npy' % (name, tag, k)))
    return grey_of(np.asarray(POST_L[k], float)[lab])


def _dim(rgb, keep=0.45):
    L = lab_of(rgb)[..., 0]
    g = lstar_to_grey(100 - (100 - L) * keep).astype(np.float32)
    return np.dstack([g] * 3)


def _outline(mask):
    e = mask & ~ndi.binary_erosion(mask, iterations=2)
    return e


def tile_calls(name, res, scale=1.0):
    rgb = np.asarray(Image.open(os.path.join(SCRATCH, 'maps', '%s_400.png' % name)).convert('RGB'))
    H, W = rgb.shape[:2]
    V = np.load(os.path.join(SCRATCH, 'maps', '%s_V.npy' % name))
    med = float(np.median(V)); top = float(V.max())
    cc, n = ndi.label(V >= med + CALL * (top - med), structure=np.ones((3, 3)))
    out = _dim(rgb)
    for i in range(1, n + 1):
        m = cc == i
        out[_outline(m)] = CALL_C
    im = Image.fromarray(out.astype(np.uint8))
    d = ImageDraw.Draw(im)
    box = SUBJECT.get(name)
    if box:
        x0, y0, x1, y1 = box[0] * W, box[1] * H, box[2] * W, box[3] * H
        for t in np.arange(x0, x1, 8):
            d.line([(t, y0), (min(t + 4, x1), y0)], fill=SUBJ_C, width=2)
            d.line([(t, y1), (min(t + 4, x1), y1)], fill=SUBJ_C, width=2)
        for t in np.arange(y0, y1, 8):
            d.line([(x0, t), (x0, min(t + 4, y1))], fill=SUBJ_C, width=2)
            d.line([(x1, t), (x1, min(t + 4, y1))], fill=SUBJ_C, width=2)
    f = font(17, 'Bold')
    for j, c in enumerate(res['calls_list'][:12]):
        x, y = c['px'] * W, c['py'] * H
        if j == 0:
            d.ellipse([x - 15, y - 15, x + 15, y + 15], outline=CALL_C, width=3)
        lab = str(j + 1)
        tx, ty = min(max(x + 10, 2), W - 16), min(max(y - 24, 2), H - 20)
        d.text((tx + 1, ty + 1), lab, font=f, fill=(255, 255, 255))
        d.text((tx, ty), lab, font=f, fill=CALL_C if c['h'] < RIVAL else (200, 40, 20))
    cf = res.get('colour_focal')
    if cf and res.get('focal') and np.hypot(cf[0] - res['focal'][0], (cf[1] - res['focal'][1]) * H / W) > 0.05:
        x, y = cf[0] * W, cf[1] * H
        d.polygon([(x, y - 11), (x + 11, y), (x, y + 11), (x - 11, y)], outline=(170, 40, 160), width=3)
    return np.asarray(im)


def tile_quiet(name, res):
    rgb = np.asarray(Image.open(os.path.join(SCRATCH, 'maps', '%s_400.png' % name)).convert('RGB'))
    q = np.load(os.path.join(SCRATCH, 'maps', '%s_quiet.npy' % name))
    out = _dim(rgb, 0.4)
    tint = np.array(QUIET_C, np.float32)
    out = np.where(q[..., None], out * 0.55 + tint * 0.45, out)
    qcc, qn = ndi.label(q, structure=np.ones((3, 3)))
    if qn:
        areas = ndi.sum(np.ones_like(qcc), qcc, index=np.arange(1, qn + 1))
        big = qcc == (int(np.argmax(areas)) + 1)
        out[_outline(big)] = (20, 60, 170)
    return out.astype(np.uint8)


def tile_picture(name):
    rgb = np.asarray(Image.open(os.path.join(SCRATCH, 'maps', '%s_400.png' % name)).convert('RGB')).copy()
    if INPUTS[name].get('caption') or name.startswith('T'):
        im = Image.fromarray(rgb)
        d = ImageDraw.Draw(im)
        s = rgb.shape[1] / 1080.0
        for yb in (290, 600):
            for t in range(0, rgb.shape[1], 10):
                d.line([(t, yb * s), (t + 5, yb * s)], fill=(60, 60, 60), width=1)
        rgb = np.asarray(im)
    return rgb


def numbers_line(r):
    a = r['s4_k3']
    return ('3 values: %d masses >= 1 %% (the 3 largest %d %% of the frame) - %d pieces 0.02-1 %%  |  calls the eye: %d '
            '(rivals %d), colour %d  |  quiet %d %% (largest %d %%)  |  L* median %d, under 40: %d %%'
            % (a['masses'], round(100 * a['top3']), a['pieces'], r['calls'], r['rivals'], r['colour_calls'],
               round(100 * r['quiet_share']), round(100 * r['quiet_largest']), round(r['L_median']),
               round(100 * r['dark_share_L40'])))


def thumb_annotated(plan, r):
    g = np.asarray(Image.open(os.path.join(SCRATCH, 'thumbs', plan + '.png')).convert('RGB'))
    im = Image.fromarray(g.copy())
    d = ImageDraw.Draw(im)
    # the caption, where the film puts it (LAYOUT §1: block y 317-556, centred on x 520; at 540: y 158-278, x 260)
    f = font(46, 'Medium')
    words = [('She ', False), ('quit', True), (' Google.', False)]
    tw = sum(d.textlength(w, font=f) for w, _ in words)
    x = 260 - tw / 2; y = 196
    band_L = PLANS[plan]['sky'][1]
    for w, hi in words:
        wl = d.textlength(w, font=f)
        if hi:
            d.rectangle([x - 4, y + 2, x + wl + 4, y + 56], fill=tuple([int(lstar_to_grey(min(band_L - 8, 80)))] * 3))
        d.text((x, y), w, font=f, fill=(28, 26, 30))
        x += wl
    for yb in (145, 300):
        for t in range(0, 540, 12):
            d.line([(t, yb), (t + 6, yb)], fill=(30, 120, 200), width=2)
    d.text((6, 147), 'caption band', font=font(15, 'Medium'), fill=(30, 120, 200))
    # the focal ring and the eye's path: read the words, drop to the one lit door
    fx, fy = r['focal'][0] * 540, r['focal'][1] * 960
    d.ellipse([fx - 74, fy - 74, fx + 74, fy + 74], outline=CALL_C, width=3)
    d.line([(262, 262), (fx - 28, fy - 70)], fill=CALL_C, width=3)
    ang = np.arctan2((fy - 70) - 262, (fx - 28) - 262)
    tip = (fx - 28, fy - 70)
    d.polygon([tip, (tip[0] - 14 * np.cos(ang - 0.45), tip[1] - 14 * np.sin(ang - 0.45)),
               (tip[0] - 14 * np.cos(ang + 0.45), tip[1] - 14 * np.sin(ang + 0.45))], fill=CALL_C)
    return np.asarray(im)


def value_bar(d, x, y, w, r, f):
    """The 3-value groups at the squint as one bar: share of the frame, each segment at its mean L*."""
    a = r['s4_k3']
    xx = x
    names = ('dark', 'mid', 'light')
    for g in range(3):
        sw = int(round(w * a['share'][g]))
        L = a['meanL'][g] if a['meanL'][g] is not None else 50
        gv = int(lstar_to_grey(L))
        d.rectangle([xx, y, xx + sw, y + 30], fill=(gv, gv, gv))
        for lab in ('%s %d %% (L* %d)' % (names[g], round(100 * a['share'][g]), round(L)),
                    '%s %d %%' % (names[g], round(100 * a['share'][g])), '%d %%' % round(100 * a['share'][g])):
            if d.textlength(lab, font=f) < sw - 8:
                d.text((xx + 5, y + 6), lab, font=f, fill=(255, 255, 255) if L < 55 else (20, 20, 20))
                break
        xx += sw


def wrap(d, text, f, width):
    lines, line = [], ''
    for w in text.split(' '):
        if line and d.textlength(line + w, font=f) > width:
            lines.append(line.rstrip()); line = ''
        line += w + ' '
    lines.append(line.rstrip())
    return lines


RULES_AT_A_GLANCE = [
    ('1 Notan first', '3 value masses hold >= 85 % of the frame (refs 86-97, v6 82); <= 8 masses >= 1 %'),
    ('2 Few pieces', '<= 10 value pieces of 0.02-1 % per frame (refs 2-7, v6 31); the rest is texture in a mass'),
    ('3 One call', 'calls the eye <= 3 and ONE rival (refs 1-2, v6 10 with 3 rivals); #1 on the subject in value '
                   'AND colour'),
    ('4 The focal', 'subject + story light + the frame\'s hardest value step in one place: lit door, her dark '
                    'silhouette in it'),
    ('5 Big quiet', '>= 65 % quiet at a squint in 2 connected masses: the sky (>= 30 %, the band in it) and the near '
                    'ground (>= 15 %)'),
    ('6 Props', '<= 6 named objects read at phone size (refs 4-6, v6 about 40); the near frame <= 2 props, cut by an '
                'edge, inside the shade'),
    ('7 Under the band', 'the focal at y 860-1200, x 380-700, <= 0.15 W off the caption\'s centre line; nothing '
                         'calls between them'),
    ('8 One counterweight', 'one big soft secondary mass (the hero cloud) opposite the focal, its pull < 50 % of it'),
    ('9 Edges', 'found (crisp, hardest step) only at the focal; lost where two masses are within ~10 L*'),
    ('10 A real dark mass', 'the darkest group 15-40 % of the frame, L* <= 45, >= 80 % of it in 2 masses below '
                            'the band (refs 89-100 %; v6 64 %)'),
]


def cmd_sheet():
    res = json.load(open(os.path.join(HERE, 'composition_metrics.json')))
    M = 40; G = 14; TWD = 400
    SW = M * 2 + 6 * TWD + 5 * G
    cols = ['the picture, 400 px wide', '2 values (notan)', '3 values', '5 values',
            'what calls the eye (1 = strongest)', 'quiet at a squint (blue)']
    blocks = []
    for name in SHEET_ROWS:
        r = res[name]
        tiles = [tile_picture(name), tile_notan(name, 2), tile_notan(name, 3), tile_notan(name, 5),
                 tile_calls(name, r), tile_quiet(name, r)]
        blocks.append((name, r, tiles))
    rows_h = sum(t[2][0].shape[0] + 34 + 58 + 26 for t in blocks)
    TH_B = 960
    H = 200 + 40 + rows_h + 120 + TH_B + 290 + 46 + 5 * 62 + 100
    sh = Image.new('RGB', (SW, H), BG)
    d = ImageDraw.Draw(sh)
    d.text((M, 26), 'Composition: notan and value grouping, still v6 against the references, and scene 1 '
           'recomposed', font=font(40, 'Bold'), fill=INK)
    d.text((M, 84), 'The owner (2026-10-30): "8 [simplicity and focus] agreed this is an important point about scene '
           'composition"; on still v6: "our scene is very busy".', font=font(24), fill=SUB)
    d.text((M, 118), 'Every picture at 400 px wide (phone width), platform UI masked, our captions taken out; values '
           'squinted at 1 % of the width, then cut into 2 / 3 / 5 groups (multi-Otsu on L*). Calls = regions whose '
           'value pull (CRAFT §b\'s luminance term)', font=font(20), fill=SUB)
    d.text((M, 146), 'is >= 50 % of the frame\'s strongest; rivals >= 70 % (red numbers); the purple diamond = the '
           'colour formula\'s strongest when it is elsewhere; teal dashes = the story\'s subject. Quiet = local L* '
           'spread < 2.5 over 2.75 % of the width.', font=font(20), fill=SUB)
    y = 200
    for i, c in enumerate(cols):
        d.text((M + i * (TWD + G), y), c, font=font(22, 'SemiBold'), fill=INK)
    y += 40
    for name, r, tiles in blocks:
        d.text((M, y), INPUTS[name]['label'] + ('  (dashes: our caption band, y 290-600)' if name == 'v6' else ''),
               font=font(24, 'Bold'), fill=INK)
        y += 34
        h = tiles[0].shape[0]
        for i, t in enumerate(tiles):
            sh.paste(Image.fromarray(t.astype(np.uint8)), (M + i * (TWD + G), y))
        y += h + 8
        d.text((M, y), numbers_line(r), font=font(21), fill=INK)
        focal = 'focal on the subject' if r.get('focal_on_subject') else 'focal elsewhere'
        if name == 'v6':
            extra = ('the door wins in value, but four yellow upper windows out-shout it in colour (the colour formula\'s '
                     '#1, #3, #4, #5); the near props, the tree and Pip add their own calls one level down')
        elif name == 'r04':
            extra = ('three masses (cloud, sky, ground) hold 88 %; the lit beast is the one value call; the girl sits at '
                     'the junction of light and ground, quiet and small')
        elif name == 'r02':
            extra = ('the one light (the red shelter) is the one call, the man inside it; cloud, reeds and ground are '
                     'three big quiet masses')
        elif name == 'r03':
            extra = ('one call: the lit horizon line with the sun; the couple stand ON it as dark silhouettes; the cloud and '
                     'the beach are two big quiet masses')
        else:
            extra = ('a dense city still reads: 3 masses hold 95 % (dark hill, mid city, light sky), the men dark against '
                     'the lit city; the busiest reference (11 calls)')
        d.text((M, y + 26), focal + ': ' + extra, font=font(19), fill=SUB)
        y += 58 + 26
    # section B: the thumbnails
    d.text((M, y + 10), 'Scene 1 recomposed: the same view across the canal, the values regrouped (value thumbnails, '
           '540 x 960, flat values; measured like the pictures above)', font=font(30, 'Bold'), fill=INK)
    d.text((M, y + 54), 'One lit door as the only call (the story light, her silhouette in it); the sky and our quay as '
           'two big quiet masses; the far side\'s life tone-on-tone inside its band; one prop at the edge; Pip hidden on '
           'the boat.', font=font(21), fill=SUB)
    y += 110
    xs = [M + i * (540 + 22) for i in range(4)]
    v6_540 = load('v6', width=540)
    L540 = lab_of(v6_540)[..., 0]
    lab5, _ = posterise(squint(L540, NOTAN * 540 / 400), 5)
    v6n = grey_of(np.asarray(POST_L[5], float)[lab5])
    sh.paste(Image.fromarray(v6n), (xs[0], y))
    for i, plan in enumerate(PLANS):
        sh.paste(Image.fromarray(thumb_annotated(plan, res[plan])), (xs[i + 1], y))
    yb = y + TH_B + 10
    f19, f20 = font(19), font(20)
    value_bar(d, xs[0], yb, 540, res['v6'], font(16, 'Medium'))
    d.text((xs[0], yb + 42), 'v6 now, in 5 values', font=font(24, 'Bold'), fill=INK)
    r = res['v6']
    ly = yb + 76
    for line in ['calls %d (rivals %d), colour calls %d' % (r['calls'], r['rivals'], r['colour_calls']),
            'the colour formula\'s #1: the yellow upper windows',
            '3-value: %d masses, the 3 largest %d %%; pieces %d' % (r['s4_k3']['masses'], round(100 * r['s4_k3']['top3']),
                                                                    r['s4_k3']['pieces']),
            'quiet %d %% (largest %d %%)' % (round(100 * r['quiet_share']), round(100 * r['quiet_largest'])),
            'L* median %d; under L* 40: %d %%' % (round(r['L_median']), round(100 * r['dark_share_L40'])),
            'about 40 named things (by eye), 12 on our quay']:
        d.text((xs[0], ly), line, font=f20, fill=INK); ly += 26
    for i, plan in enumerate(PLANS):
        P = PLANS[plan]; r = res[plan]; x = xs[i + 1]
        value_bar(d, x, yb, 540, r, font(16, 'Medium'))
        d.text((x, yb + 42), P['title'], font=font(24, 'Bold'), fill=INK)
        ly = yb + 76
        for line in wrap(d, P['key'], f19, 535):
            d.text((x, ly), line, font=f19, fill=SUB); ly += 24
        ly += 4
        for line in ['calls %d (rivals %d), colour calls %d; the focal on her: %s' % (
                r['calls'], r['rivals'], r['colour_calls'], 'yes' if r.get('focal_on_subject') else 'no'),
                '3-value: %d masses, the 3 largest %d %%; pieces %d' % (
                    r['s4_k3']['masses'], round(100 * r['s4_k3']['top3']), r['s4_k3']['pieces']),
                'quiet %d %% (largest %d %%)' % (round(100 * r['quiet_share']), round(100 * r['quiet_largest'])),
                'L* median %d; under L* 40: %d %%' % (round(r['L_median']), round(100 * r['dark_share_L40']))]:
            d.text((x, ly), line, font=f20, fill=INK); ly += 26
    # the rules at a glance
    ry = yb + 290
    d.text((M, ry), 'The rules at a glance (9:16, at phone width; the numbers, sources and checks: composition.md)',
           font=font(28, 'Bold'), fill=INK)
    ry += 46
    colw = (SW - 2 * M) // 2
    for k, (head, body) in enumerate(RULES_AT_A_GLANCE):
        cx = M + (k % 2) * colw; cy = ry + (k // 2) * 62
        d.text((cx, cy), head, font=font(21, 'Bold'), fill=CALL_C if k < 4 else INK)
        for j, line in enumerate(wrap(d, body, font(20), colw - 250)):
            d.text((cx + 236, cy + j * 25), line, font=font(20), fill=INK)
    d.text((M, H - 44), 'Script: video/docs/look/organic/composition_study.py (all | measure | thumbs | sheet), '
           'deterministic; numbers: composition_metrics.json; the rules: composition.md. We measure the references to '
           'learn methods; nothing is traced or used as input.', font=font(18), fill=SUB)
    out = os.path.join(HERE, 'composition_sheet.png')
    sh.save(out, optimize=True)
    print(out, sh.size, os.path.getsize(out) // 1024, 'KB')


# ---------------------------------------------------------------------------------------------------------------------
# The check for one still (composition.md §6): WARNs against the rules, never a FAIL (the owner judges).
# ---------------------------------------------------------------------------------------------------------------------
CHECKS = [  # (rule, what, test(r) -> bool, how it is shown)
    ('R1', '3 value masses hold >= 85 % of the frame', lambda r: r['s4_k3']['top3'] >= 0.85,
     lambda r: 'the 3 largest %d %%' % round(100 * r['s4_k3']['top3'])),
    ('R1', '<= 8 value masses >= 1 %', lambda r: r['s4_k3']['masses'] <= 8,
     lambda r: '%d masses' % r['s4_k3']['masses']),
    ('R2', '<= 10 value pieces (0.02-1 %)', lambda r: r['s4_k3']['pieces'] <= 10,
     lambda r: '%d pieces' % r['s4_k3']['pieces']),
    ('R3', '<= 3 calls, 1 rival (value)', lambda r: r['calls'] <= 3 and r['rivals'] <= 1,
     lambda r: '%d calls, %d rivals' % (r['calls'], r['rivals'])),
    ('R3', '<= 3 calls, 1 rival (colour)', lambda r: r['colour_calls'] <= 3 and r['colour_rivals'] <= 1,
     lambda r: '%d calls, %d rivals' % (r['colour_calls'], r['colour_rivals'])),
    ('R4', 'the strongest call on the subject, value and colour',
     lambda r: r.get('focal_on_subject', True) and r.get('colour_focal_on_subject', True),
     lambda r: 'value #%s, colour #%s' % (r.get('subject_call_rank'), r.get('subject_colour_rank'))),
    ('R5', '>= 65 % quiet at a squint', lambda r: r['quiet_share'] >= 0.65,
     lambda r: '%d %%' % round(100 * r['quiet_share'])),
    ('R5', 'two connected quiet masses: >= 30 % and >= 15 %',
     lambda r: r['quiet_largest'] >= 0.30 and r['quiet_second'] >= 0.15,
     lambda r: '%d %% + %d %%' % (round(100 * r['quiet_largest']), round(100 * r['quiet_second']))),
    ('R7', 'the focal at y 860-1200, x 380-700 (9:16)',
     lambda r: r['focal'] is None or (0.448 <= r['focal'][1] <= 0.625 and 0.352 <= r['focal'][0] <= 0.648),
     lambda r: 'at (%d, %d)' % (round(r['focal'][0] * 1080), round(r['focal'][1] * 1920)) if r['focal'] else '-'),
    ('R10', 'a dark mass: the dark group 15-40 %, L* <= 45, >= 80 % of it in 2 masses',
     lambda r: (0.15 <= r['s4_k3']['share'][0] <= 0.40 and (r['s4_k3']['meanL'][0] or 99) <= 45 and
                r['s4_k3']['dark_top2'] >= 0.8 * r['s4_k3']['share'][0]),
     lambda r: '%d %% at L* %d, %d %% in its 2 largest' % (
         round(100 * r['s4_k3']['share'][0]), round(r['s4_k3']['meanL'][0] or 0),
         round(100 * r['s4_k3']['dark_top2'] / max(r['s4_k3']['share'][0], 1e-6)))),
]


def cmd_frame(argv):
    """python3 -B composition_study.py frame STILL.png [--caption] [--subject x0,y0,x1,y1 (fractions)]"""
    path = argv[0]
    INPUTS['_frame'] = dict(path=path, caption='--caption' in argv, label=os.path.basename(path))
    if '--subject' in argv:
        SUBJECT['_frame'] = tuple(float(v) for v in argv[argv.index('--subject') + 1].split(','))
    r = measure_one('_frame', save_maps=False)
    print('%s at 400 px wide%s' % (path, ', captions taken out' if '--caption' in argv else ''))
    for rule, what, test, show in CHECKS:
        try:
            ok = bool(test(r))
        except (TypeError, KeyError):
            ok = True
        print('  %-4s %-4s %-52s %s' % ('ok' if ok else 'WARN', rule, what, show(r)))
    print('  info      under L* 40: %d %% (CRAFT §f.8 asks 6-10 %%); L* median %d' % (
        round(100 * r['dark_share_L40']), round(r['L_median'])))
    return r


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'measure'
    if cmd == 'frame':
        os.makedirs(os.path.join(SCRATCH, 'maps'), exist_ok=True)
        cmd_frame(sys.argv[2:])
        sys.exit(0)
    if cmd in ('thumbs', 'all'):
        cmd_thumbs()
    if cmd in ('measure', 'all'):
        res = cmd_measure(sys.argv[2:] if cmd == 'measure' and len(sys.argv) > 2 else None)
        path = os.path.join(HERE, 'composition_metrics.json')
        if cmd == 'measure' and len(sys.argv) > 2 and os.path.exists(path):
            old = json.load(open(path)); old.update(res); res = old
        json.dump(res, open(path, 'w'), indent=1, default=float)
    if cmd in ('sheet', 'all'):
        cmd_sheet()
