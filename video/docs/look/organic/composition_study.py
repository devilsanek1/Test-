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


def load(name):
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
    h = int(round(im.shape[0] * W400 / im.shape[1]))
    small = cv2.resize(im, (W400, h), interpolation=cv2.INTER_AREA)
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


def salience_blobs(S, rel=0.5):
    """Blobs of the salience map above median + rel * (p99.5 - median); each blob's weight = its salience mass above
    the median. Returns blobs sorted by weight: (weight, peak, cy, cx, area, label) and the label map."""
    med = np.median(S); p = np.percentile(S, 99.5)
    t = med + rel * (p - med)
    cc, n = ndi.label(S > t, structure=np.ones((3, 3)))
    blobs = []
    for i in range(1, n + 1):
        m = cc == i
        w = float((S[m] - med).sum())
        pk = float(S[m].max())
        cy, cx = ndi.center_of_mass(np.where(m, S - med, 0))
        blobs.append((w, pk, cy, cx, int(m.sum()), i))
    blobs.sort(key=lambda t: -t[0])
    return blobs, cc, t


NOTAN = 4.0       # px at 400 wide (1 % W): the notan's squint, where texture merges into its mass and props stay
PEAK_DIST = 12    # px (3 % W): two salience peaks closer than this are one element


def salience_peaks(S, floor_rel=0.25):
    """Local maxima of the salience map (each a thing that calls the eye), heights above the frame's median,
    normalised by the highest: [(h, x, y)] sorted high to low."""
    from skimage.feature import peak_local_max
    med = float(np.median(S)); top = float(S.max())
    pk = peak_local_max(S, min_distance=PEAK_DIST, threshold_abs=med + floor_rel * (top - med), exclude_border=False)
    out = [((S[y, x] - med) / (top - med), int(x), int(y)) for y, x in pk]
    out.sort(key=lambda t: -t[0])
    return out


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
            res[key] = dict(
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
        np.save(os.path.join(SCRATCH, 'maps', '%s_sal.npy' % name), S.astype(np.float32))
        Image.fromarray(rgb).save(os.path.join(SCRATCH, 'maps', '%s_400.png' % name))
    return res


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


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'measure'
    if cmd == 'measure':
        res = cmd_measure(sys.argv[2:] or None)
        json.dump(res, open(os.path.join(SCRATCH, 'metrics_draft.json'), 'w'), indent=1)
