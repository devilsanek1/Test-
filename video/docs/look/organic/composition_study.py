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


def measure_one(name, save_maps=True):
    rgb = load(name)
    H, W = rgb.shape[:2]
    N = H * W
    lab = lab_of(rgb)
    L = lab[..., 0]
    Ls = squint(L)
    res = dict(name=name, label=INPUTS[name]['label'], size=[W, H])
    # value structure
    res['L_median'] = float(np.median(L))
    res['L_p5_p95'] = [float(np.percentile(L, 5)), float(np.percentile(L, 95))]
    res['dark_share_L40'] = float((L < 40).mean())
    for k in (2, 3, 5):
        labk, thr = posterise(Ls, k)
        res['eta%d' % k] = otsu_eta(Ls, thr)
        res['thr%d' % k] = [float(t) for t in thr]
        res['share%d' % k] = [float((labk == g).mean()) for g in range(k)]
        res['meanL%d' % k] = [float(Ls[labk == g].mean()) if (labk == g).any() else None for g in range(k)]
        comps, rid = components(labk)
        areas = sorted([c[0] for c in comps], reverse=True)
        res['masses%d' % k] = int(sum(a >= MASS_MIN * N for a in areas))
        res['top3_share%d' % k] = float(sum(areas[:3]) / N)
        res['top5_share%d' % k] = float(sum(areas[:5]) / N)
        frags = [a for a in areas if FRAG_MIN * N <= a < MASS_MIN * N]
        res['frags%d' % k] = len(frags)
        res['frags%d_per100k' % k] = len(frags) / N * 1e5
        res['boundary%d' % k] = boundary_share(labk)
        if save_maps:
            np.save(os.path.join(SCRATCH, 'maps', '%s_post%d.npy' % (name, k)), labk.astype(np.uint8))
    # quiet
    sd = local_std(Ls)
    quiet = sd < QUIET_STD
    qcc, qn = ndi.label(quiet, structure=np.ones((3, 3)))
    qareas = np.sort(ndi.sum(np.ones_like(qcc), qcc, index=np.arange(1, qn + 1)))[::-1] if qn else np.array([0])
    res['quiet_share'] = float(quiet.mean())
    res['quiet_largest'] = float(qareas[0] / N)
    res['quiet_regions_2pc'] = int((qareas >= 0.02 * N).sum())
    res['quiet_big_share'] = float(qareas[qareas >= 0.02 * N].sum() / N)
    # salience and the focal point
    S = salience(lab)
    med = float(np.median(S))
    res['sal_peak_over_median'] = float(np.percentile(S, 99) / med)
    blobs, bcc, bt = salience_blobs(S)
    ws = np.array([b[0] for b in blobs]) if blobs else np.array([1.0])
    res['sal_blobs'] = len(blobs)
    res['sal_neff'] = float(ws.sum() ** 2 / (ws ** 2).sum())
    res['sal_top_share'] = float(ws[0] / ws.sum())
    res['sal_equal_weight'] = int((ws >= 0.5 * ws[0]).sum())
    res['sal_second_over_first'] = float(ws[1] / ws[0]) if len(ws) > 1 else 0.0
    res['focal'] = [float(blobs[0][3] / W), float(blobs[0][2] / H)] if blobs else None
    res['blobs'] = [dict(w=float(b[0] / ws[0]), x=float(b[3] / W), y=float(b[2] / H), area=float(b[4] / N))
                    for b in blobs[:12]]
    if save_maps:
        np.save(os.path.join(SCRATCH, 'maps', '%s_quiet.npy' % name), quiet)
        np.save(os.path.join(SCRATCH, 'maps', '%s_sal.npy' % name), S.astype(np.float32))
        np.save(os.path.join(SCRATCH, 'maps', '%s_blobs.npy' % name), bcc.astype(np.int16))
        Image.fromarray(rgb).save(os.path.join(SCRATCH, 'maps', '%s_400.png' % name))
    return res


def cmd_measure(names=None):
    os.makedirs(os.path.join(SCRATCH, 'maps'), exist_ok=True)
    names = names or list(INPUTS)
    out = {}
    for n in names:
        out[n] = measure_one(n)
        r = out[n]
        print('%-22s eta2 %.2f eta3 %.2f eta5 %.2f | masses3 %2d top3 %.2f frags3/100k %5.1f bnd3 %.3f | quiet %.2f '
              'largest %.2f big %d | neff %.1f eq %d top %.2f 2nd %.2f focal %s | dark %.3f Lmed %.0f' % (
                  n, r['eta2'], r['eta3'], r['eta5'], r['masses3'], r['top3_share3'], r['frags3_per100k'],
                  r['boundary3'], r['quiet_share'], r['quiet_largest'], r['quiet_regions_2pc'], r['sal_neff'],
                  r['sal_equal_weight'], r['sal_top_share'], r['sal_second_over_first'],
                  None if r['focal'] is None else '(%.2f,%.2f)' % tuple(r['focal']), r['dark_share_L40'],
                  r['L_median']))
    return out


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'measure'
    if cmd == 'measure':
        res = cmd_measure(sys.argv[2:] or None)
        json.dump(res, open(os.path.join(SCRATCH, 'metrics_draft.json'), 'w'), indent=1)
