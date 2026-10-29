#!/usr/bin/env python3
"""Look lens 4 of the city-poster study (2026-10-28): composition and the one focus.

Per poster (the Instagram UI masked, measured at 1080 px wide) and per v2 still (1080 x 1920), it measures:
  structure  the open sky (the calm region connected to the top edge, bounded by colour steps > dE 6), the title,
             the skyline, the hero's box, the lower half's share of the detail, the corners' values, the calm share;
  focus      CRAFT §b salience (the repo's formula, 540 px wide: peak/median, median, top-10 % mass) and a spectral
             residual map (Hou & Zhang 2007): the hero's share of each, per pixel against its area;
  lines      oblique line segments (LSD, 12-78 deg, >= 40 px, outside the sky and the hero) whose line crosses the
             hero's box, against the same box placed at 200 random spots (the "lead lift");
  capriccio  each icon's salience share (which landmark wins among several);
  9:16       the poster placed in 1080 x 1920 two ways (its top edge on the caption band's top, the sky extended up;
             or cropped to fill) against layout.md §1's zones: where the title, the tallest top and the hero land,
             and whether the band would hold one calm field.
Sheets: img/composition_structure.jpg, _focus.jpg, _916.jpg, _cover_grid.jpg.

  python3 -I video/scripts/look/posters/composition.py all       # numbers (/tmp/posters-composition/composition.json) + sheets
  python3 -I video/scripts/look/posters/composition.py measure   # numbers only
  python3 -I video/scripts/look/posters/composition.py frame STILL.png [--subject x0,y0,x1,y1] [--out overlay.jpg]
      # the composition check on one 1080 x 1920 still: the same numbers (the caption band ignored) + a zone overlay
"""
import argparse
import json
import os
import subprocess
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..', '..'))
REF = os.path.join(ROOT, 'video/docs/look/poster_refs')
STUDY = os.path.join(ROOT, 'video/docs/studies/2026-10-28_city_posters')
MASTER = os.path.join(ROOT, 'video/deliverables/v2/v2r_G7_master_v1.mp4')
SCRATCH = '/tmp/posters-composition'
W = 1080

# layout.md §1 (px at 1080 x 1920): organic UI, ad overlay, band, caption block, read zone, subject axis
Z = dict(top_ui=180, ad_top=(240, 288), band=(290, 600), block=(95, 317, 945, 556), read=(120, 600, 880, 1250),
         axis=(380, 700), rail=(950, 900, 1080, 1500), ad_rail=(780, 840), bottom_ui=1520, ad_bottom=1250)
INK = (0x2B, 0x1B, 0x0A)  # theme.ts ink: the caption text

# Icons per poster, boxes in the screenshot's pixels. The first is the hero (poster_refs/README.md). A/B boxes from
# pro_2_hierarchy.py (37 boxes); the extra icons (*) placed here from the contact sheets (+-15 px).
ICONS = {
    '01_singapore.jpg': [('Marina Bay Sands', [232, 661, 877, 1054]), ('Merlion', [795, 1001, 960, 1219]),
                         ('ArtScience*', [149, 881, 386, 1073]), ('Supertrees*', [797, 724, 1206, 1133])],
    '02_reykjavik.jpg': [('Hallgrimskirkja', [45, 398, 532, 1118]), ('Harpa', [592, 1002, 1140, 1233]),
                         ('Sun Voyager*', [687, 1242, 905, 1411])],
    '03_hanoi.jpg': [('One Pillar Pagoda', [675, 829, 1185, 1377]), ('Huc bridge', [225, 1054, 630, 1204]),
                     ('Turtle Tower*', [506, 844, 590, 928]), ('cyclo', [82, 1279, 368, 1564])],
    '04_buenos_aires.jpg': [('Obelisco', [558, 393, 670, 1065]), ('Casa Rosada', [660, 960, 1206, 1395]),
                            ('La Boca', [0, 930, 300, 1575]), ('domed palace*', [60, 495, 241, 965])],
    '05_cape_town.jpg': [('Table Mountain', [0, 605, 1206, 928]), ('Bo-Kaap', [750, 827, 1206, 1440]),
                         ('lighthouse*', [205, 975, 265, 1090]), ('protea', [0, 1250, 495, 1605])],
    '06_copenhagen.jpg': [('Nyhavn facades', [0, 724, 750, 1219]), ('spire', [183, 364, 300, 882]),
                          ('mermaid', [840, 1114, 1185, 1490]), ('round tower', [600, 836, 738, 1069]),
                          ('Marble Church*', [851, 872, 1012, 1077])],
    '07_kyoto.jpg': [('Kinkaku-ji', [638, 739, 1170, 1129]), ('pagoda', [165, 461, 413, 859]),
                     ('torii', [90, 1054, 435, 1294])],
}
# v2 stills from the G7 master (time, subject box at 1080 x 1920 or None). S1 and S3 boxes: pro_2_hierarchy.py;
# S5 (crane end, the Pentagon + its plaque): placed on the still here.
V2 = [('S1', 5.20, [470, 780, 740, 1090]), ('S2', 9.00, None), ('S3', 14.00, [256, 690, 410, 860]),
      ('S4', 17.50, None), ('S5', 23.40, [322, 838, 1080, 1238]), ('S6', 26.00, None), ('S7', 30.50, None),
      ('S8', 36.00, None)]
V2_CAPTION = [95, 299, 985, 600]  # the caption block plus its highlight boxes: ignored like a poster's title
COVERS = {'v1': 'video/deliverables/cover.png', 'v2': 'video/deliverables/v2/v2r_cover.png',
          'v3': 'video/deliverables/v3/cover.png'}
SHOW_916 = ['04_buenos_aires.jpg', '02_reykjavik.jpg', '05_cape_town.jpg']


def font(size):
    for p in ('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def to_lab(rgb):
    return cv2.cvtColor(rgb.astype(np.float32) / 255, cv2.COLOR_RGB2LAB)


def load_poster(name, masks):
    rgb = np.array(Image.open(os.path.join(REF, name)).convert('RGB'))
    m = masks[name]
    r0, r1 = m['content_rows']
    rgb = rgb[r0:r1]
    h0, w0 = rgb.shape[:2]
    bad = np.zeros((h0, w0), np.uint8)
    for k in ('counter_pill_box', 'mute_button_box'):
        x0, y0, x1, y1 = m[k]
        bad[max(0, y0 - r0):max(0, y1 - r0), x0:x1] = 1
    bad = cv2.dilate(bad, np.ones((49, 49), np.uint8))  # +24 px: 03's pill box is ~25 px short of the pill
    s = W / w0
    h = round(h0 * s)
    rgb = cv2.resize(rgb, (W, h), interpolation=cv2.INTER_AREA)
    bad = cv2.resize(bad, (W, h), interpolation=cv2.INTER_NEAREST)
    clean = cv2.inpaint(rgb, bad, 5, cv2.INPAINT_TELEA)  # for drawing only; measurements use `valid`
    boxes = [(lab, [b[0] * s, (b[1] - r0) * s, b[2] * s, (b[3] - r0) * s]) for lab, b in ICONS[name]]
    return dict(rgb=rgb, clean=clean, valid=bad == 0, boxes=boxes, scale=s)


def box_mask(shape, b, pad=0.0):
    m = np.zeros(shape[:2], bool)
    H, Wd = shape[:2]
    x0, y0, x1, y1 = b
    m[int(max(0, y0 - pad)):int(min(H, y1 + pad)), int(max(0, x0 - pad)):int(min(Wd, x1 + pad))] = True
    return m


def find_title(L, valid):
    """Dark letters on the sky in the top 20 % (posters): the row cluster with the most letter-sized blobs."""
    H = L.shape[0]
    bh = cv2.morphologyEx(L, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
    zone = np.zeros_like(valid)
    zone[:int(0.2 * H)] = True
    n, _, st, cen = cv2.connectedComponentsWithStats(((bh > 15) & zone & valid).astype(np.uint8))
    comps = [i for i in range(1, n) if 6 <= st[i, 3] <= 70 and st[i, 2] <= 90 and st[i, 4] >= 12]
    if not comps:
        return None
    ys = np.array([cen[i][1] for i in comps])
    best = max(comps, key=lambda i: int((np.abs(ys - cen[i][1]) < 20).sum()))
    sel = [i for i in comps if abs(cen[i][1] - cen[best][1]) < 20]
    x0 = min(st[i, 0] for i in sel); y0 = min(st[i, 1] for i in sel)
    x1 = max(st[i, 0] + st[i, 2] for i in sel); y1 = max(st[i, 1] + st[i, 3] for i in sel)
    return dict(box=[int(x0), int(y0), int(x1), int(y1)], letters=len(sel),
                cap=float(np.median([st[i, 3] for i in sel])))


def sky_mask(lab, valid, ignore):
    """The open sky: pixels connected to the top edge without crossing a colour step > dE 6 (over 6 px, sigma 2)."""
    b = cv2.GaussianBlur(lab, (0, 0), 2)
    d = np.zeros(lab.shape[:2], np.float32)
    d[:-6] = np.linalg.norm(b[6:] - b[:-6], axis=2)
    dx = np.zeros_like(d)
    dx[:, :-6] = np.linalg.norm(b[:, 6:] - b[:, :-6], axis=2)
    edge = np.maximum(d, dx) > 6
    edge[ignore] = False
    edge = cv2.dilate(edge.astype(np.uint8), np.ones((3, 3), np.uint8)).astype(bool)
    free = ~edge & (valid | ignore)
    _, lb = cv2.connectedComponents(free.astype(np.uint8), connectivity=4)
    top = np.unique(lb[:3][free[:3]])
    return np.isin(lb, top[top > 0])


def craft_salience(rgb):
    """CRAFT §b salience (scripts/qa/retro_tools/hierarchy/analyse.py), on a 540-wide frame."""
    lab = to_lab(rgb)
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    lc = 0.5 * (np.abs(L - cv2.GaussianBlur(L, (0, 0), 8)) + np.abs(L - cv2.GaussianBlur(L, (0, 0), 32)))
    ab = np.dstack([a, b])
    cc = np.linalg.norm(ab - cv2.GaussianBlur(ab, (0, 0), 24), axis=2)
    C = np.hypot(a, b)
    return cv2.GaussianBlur(lc / 15 + cc / 15 + C / 60, (0, 0), 10)


def spectral_residual(L, out_shape):
    h, w = L.shape
    g = cv2.resize(L, (128, max(8, round(h * 128 / w))), interpolation=cv2.INTER_AREA).astype(np.float64)
    F = np.fft.fft2(g)
    A = np.log(np.abs(F) + 1e-9)
    R = A - cv2.blur(A, (3, 3))
    s = np.abs(np.fft.ifft2(np.exp(R + 1j * np.angle(F)))) ** 2
    s = cv2.GaussianBlur(s, (0, 0), 5)
    return cv2.resize(s.astype(np.float32), (out_shape[1], out_shape[0]), interpolation=cv2.INTER_CUBIC).clip(0)


def segments(L):
    img = np.clip(cv2.GaussianBlur(L, (0, 0), 1) * 2.55, 0, 255).astype(np.uint8)
    try:
        segs = cv2.createLineSegmentDetector(cv2.LSD_REFINE_STD).detect(img)[0]
        segs = segs.reshape(-1, 4) if segs is not None else np.zeros((0, 4))
    except Exception:  # an OpenCV build without LSD
        e = cv2.Canny(img, 40, 100)
        segs = cv2.HoughLinesP(e, 1, np.pi / 180, 40, minLineLength=40, maxLineGap=4)
        segs = segs.reshape(-1, 4).astype(np.float32) if segs is not None else np.zeros((0, 4))
    return segs


def crosses(segs, boxes):
    """(n segs, m boxes) bool: the infinite line through each segment crosses each box (corner side test)."""
    x1, y1, x2, y2 = [segs[:, i][:, None] for i in range(4)]
    dx, dy = x2 - x1, y2 - y1
    sides = []
    for cx, cy in ((0, 1), (2, 1), (0, 3), (2, 3)):
        sides.append(np.sign(dx * (boxes[None, :, cy] - y1) - dy * (boxes[None, :, cx] - x1)))
    sides = np.stack(sides)
    return (sides.max(0) >= 0) & (sides.min(0) <= 0)


def lead_lines(L, sky, use, hero, rng):
    H, Wd = L.shape
    s = segments(L)
    if len(s) == 0:
        return None
    ln = np.hypot(s[:, 2] - s[:, 0], s[:, 3] - s[:, 1])
    ang = np.degrees(np.arctan2(np.abs(s[:, 3] - s[:, 1]), np.abs(s[:, 2] - s[:, 0])))
    mx = np.clip(((s[:, 0] + s[:, 2]) / 2).astype(int), 0, Wd - 1)
    my = np.clip(((s[:, 1] + s[:, 3]) / 2).astype(int), 0, H - 1)
    pad = 0.03 * Wd
    hb = np.array([hero[0] - pad, hero[1] - pad, hero[2] + pad, hero[3] + pad])
    inside = (mx >= hb[0]) & (mx <= hb[2]) & (my >= hb[1]) & (my <= hb[3])
    keep = (ln >= 40) & (ang >= 12) & (ang <= 78) & ~sky[my, mx] & use[my, mx] & ~inside
    s, ln, mx, my = s[keep], ln[keep], mx[keep], my[keep]
    if ln.sum() == 0:
        return None
    hit = crosses(s, hb[None])[:, 0]
    share = float(ln[hit].sum() / ln.sum())
    bw, bh_ = hb[2] - hb[0], hb[3] - hb[1]
    xs = rng.uniform(0, max(1, Wd - bw), 200)
    ys = rng.uniform(0.15 * H, max(0.15 * H + 1, H - bh_), 200)
    rb = np.stack([xs, ys, xs + bw, ys + bh_], 1)
    hits = crosses(s, rb)
    ins = (mx[:, None] >= rb[None, :, 0]) & (mx[:, None] <= rb[None, :, 2]) & \
          (my[:, None] >= rb[None, :, 1]) & (my[:, None] <= rb[None, :, 3])
    w = ln[:, None] * ~ins
    exp = float(np.mean((w * hits).sum(0) / np.maximum(w.sum(0), 1)))
    return dict(share=share, expected=exp, lift=share / max(exp, 1e-6), n=int(len(ln)),
                hit_len=float(ln[hit].sum()), segs=s[hit].round(1).tolist())


def measure(rgb, valid, ignore, boxes, rng, title=None):
    """boxes: [(label, [x0,y0,x1,y1])], the first is the hero (or [] for a still with no subject)."""
    H, Wd = rgb.shape[:2]
    lab = to_lab(rgb)
    L = lab[..., 0]
    use = valid & ~ignore
    sky = sky_mask(lab, valid, ignore)
    rows = np.arange(H)[:, None] * np.ones((1, Wd))
    low = np.array([np.max(np.where(sky[:, x])[0]) if sky[:, x].any() else 0 for x in range(Wd)])
    gx = cv2.Sobel(cv2.GaussianBlur(L, (0, 0), 1), cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(cv2.GaussianBlur(L, (0, 0), 1), cv2.CV_32F, 0, 1, ksize=3)
    E = np.hypot(gx, gy) * use
    lc = cv2.blur(np.abs(L - cv2.GaussianBlur(L, (0, 0), 16)), (31, 31))
    calm = (lc < 2.0) & use
    c = int(0.2 * Wd), int(0.2 * H)
    corners = {k: float(np.median(L[sl][use[sl]])) for k, sl in
               (('TL', np.s_[:c[1], :c[0]]), ('TR', np.s_[:c[1], -c[0]:]), ('BL', np.s_[-c[1]:, :c[0]]),
                ('BR', np.s_[-c[1]:, -c[0]:]))}
    r = dict(H=H, sky=float(sky[valid | ignore].mean() * 100),
             skyline_med=float(np.median(low) / H * 100), skyline_p2=float(np.percentile(low, 2) / H * 100),
             lower_detail=float(E[rows >= H / 2].sum() / E.sum() * 100),
             lower_stuff=float(((~sky) & use & (rows >= H / 2)).sum() / max(1, ((~sky) & use).sum()) * 100),
             detail_cy=float((E * rows).sum() / E.sum() / H * 100),
             calm=float(calm.sum() / use.sum() * 100), calm_below=float((calm & ~sky).sum() / use.sum() * 100),
             L_med=float(np.median(L[use])), corners=corners, skyline=low.tolist())
    if title:
        r['title'] = dict(title, y=float((title['box'][1] + title['box'][3]) / 2 / H * 100),
                          cap_pct=float(title['cap'] / H * 100), w_pct=float((title['box'][2] - title['box'][0]) / Wd * 100))
    # salience at 540 wide
    h2 = round(H * 540 / Wd)
    S = craft_salience(cv2.resize(rgb, (540, h2), interpolation=cv2.INTER_AREA))
    v2_ = cv2.resize(use.astype(np.uint8), (540, h2), interpolation=cv2.INTER_NEAREST).astype(bool)
    SR = spectral_residual(L, (h2, 540))
    Sv = S[v2_]
    top = np.sort(Sv)[::-1]
    r['sal'] = dict(peak_med=float(np.percentile(Sv, 99) / np.median(Sv)), med=float(np.median(Sv)),
                    conc10=float(top[:len(top) // 10].sum() / top.sum() * 100))
    r['icons'] = []
    if boxes:
        t1, t5 = np.percentile(Sv, 99), np.percentile(SR[v2_], 95)
        for i, (labl, b) in enumerate(boxes):
            bm = box_mask((h2, 540), [v * 540 / Wd for v in b]) & v2_
            area = bm.sum() / v2_.sum()
            ic = dict(label=labl, box_pct=[b[0] / Wd * 100, b[1] / H * 100, (b[2] - b[0]) / Wd * 100, (b[3] - b[1]) / H * 100],
                      area=float(area * 100), sal_share=float(S[bm].sum() / Sv.sum() * 100),
                      sal_lift=float(S[bm].mean() / S[v2_ & ~bm].mean()),
                      sr_share=float(SR[bm].sum() / SR[v2_].sum() * 100),
                      top1_in=float(((S >= t1) & bm).sum() / max(1, ((S >= t1) & v2_).sum()) * 100),
                      sr_top5_in=float(((SR >= t5) & bm).sum() / max(1, ((SR >= t5) & v2_).sum()) * 100))
            if i == 0:
                hm = box_mask(rgb.shape, b)
                ring = box_mask(rgb.shape, b, pad=0.04 * Wd) & ~hm & use
                labm = lambda m: np.median(lab[m], axis=0)
                ic.update(sky_contact=float(sky[ring].mean() * 100), L_hero=float(np.median(L[hm & use])),
                          L_ring=float(np.median(L[ring])), dE_ring=float(np.linalg.norm(labm(hm & use) - labm(ring))),
                          cx=float((b[0] + b[2]) / 2 / Wd), cy=float((b[1] + b[3]) / 2 / H),
                          top_vs_skyline=float(b[1] / H * 100 - r['skyline_med']),
                          lead=lead_lines(L, sky, use, b, rng))
            r['icons'].append(ic)
    return r, S, SR, sky


def band_rows(Lband, m):
    """Row means of L* over the band's open sky (the title or caption left out): their range is the gradient."""
    return np.array([Lband[i][m[i]].mean() for i in range(len(Lband)) if m[i].sum() > 50] or [0.0])


def wcag(rgb_a, rgb_b):
    def lum(c):
        c = np.asarray(c, float) / 255
        c = np.where(c <= 0.03928, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
        return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
    l1, l2 = sorted([lum(rgb_a), lum(rgb_b)], reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


def sky_extension(img, rows=200):
    """A plain sky colour per row for the rows above the poster: the top rows' trend, extrapolated gently."""
    top = img[:rows].reshape(rows, -1, 3).astype(np.float32).mean(1)
    k = np.polyfit(np.arange(rows), top, 1)
    return lambda n: np.clip(np.array([k[0] * (-(n - i)) * 0.5 + top[:20].mean(0) for i in range(n)]), 0, 255)


def place(p, mode, y_off=300):
    """The poster in 1080 x 1920: 'extend' (its top edge at y_off, the sky extended up, the near frame below to draw)
    or 'crop' (scaled to fill the height, cropped round the hero). Returns canvas, transform (s, dx, dy), drawn mask."""
    img, H = p['clean'], p['clean'].shape[0]
    canvas = np.zeros((1920, W, 3), np.uint8)
    painted = np.zeros((1920, W), np.uint8)  # 0 poster, 1 sky extended, 2 to draw
    if mode == 'extend':
        ext = sky_extension(img)(y_off)
        canvas[:y_off] = ext[:, None, :].astype(np.uint8)
        painted[:y_off] = 1
        h = min(H, 1920 - y_off)
        canvas[y_off:y_off + h] = img[:h]
        if y_off + h < 1920:
            canvas[y_off + h:] = (58, 58, 64)
            painted[y_off + h:] = 2
        return canvas, (1.0, 0.0, float(y_off)), painted
    s = 1920 / H
    big = cv2.resize(img, (round(W * s), 1920), interpolation=cv2.INTER_CUBIC)
    hx = (p['boxes'][0][1][0] + p['boxes'][0][1][2]) / 2 * s
    x0 = int(np.clip(hx - W / 2, 0, big.shape[1] - W))
    canvas[:] = big[:, x0:x0 + W]
    return canvas, (s, -float(x0), 0.0), painted


def tf(b, t):
    s, dx, dy = t
    return [b[0] * s + dx, b[1] * s + dy, b[2] * s + dx, b[3] * s + dy]


def pip_spot(canvas, hero, avoid_band=True):
    """Hide Pip where the detail is: the busiest 60 px window in y 700-1480, x 140-760, >= 250 px from the hero's
    centre and outside its box (+80 px). A second-look find, never on the subject's eye path."""
    L = to_lab(canvas)[..., 0]
    g = np.hypot(cv2.Sobel(L, cv2.CV_32F, 1, 0), cv2.Sobel(L, cv2.CV_32F, 0, 1))
    d = cv2.blur(g, (61, 61))
    ok = np.zeros_like(d, bool)
    ok[700:1480, 140:760] = True
    ok &= ~box_mask(d.shape, hero, pad=80)
    yy, xx = np.mgrid[:d.shape[0], :d.shape[1]]
    ok &= np.hypot(xx - (hero[0] + hero[2]) / 2, yy - (hero[1] + hero[3]) / 2) >= 250
    d[~ok] = -1
    y, x = np.unravel_index(np.argmax(d), d.shape)
    return int(x), int(y)


def zone_overlay(canvas, hero=None, title=None, pip=None, painted=None, f=None, label=None):
    im = Image.fromarray(canvas).convert('RGBA')
    ov = Image.new('RGBA', im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(ov)
    red = (220, 40, 40, 70)
    d.rectangle([0, 0, W, Z['top_ui']], fill=red)
    d.rectangle([0, Z['bottom_ui'], W, 1920], fill=red)
    d.rectangle([Z['rail'][0], Z['rail'][1], W, Z['rail'][3]], fill=red)
    for y in (Z['ad_top'][1], Z['ad_bottom']):
        for x in range(0, W, 40):
            d.line([x, y, x + 20, y], fill=(220, 40, 40, 230), width=5)
    for y in range(Z['ad_rail'][1], Z['ad_bottom'], 40):
        d.line([Z['ad_rail'][0], y, Z['ad_rail'][0], y + 20], fill=(220, 40, 40, 230), width=5)
    d.rectangle([0, Z['band'][0], W - 1, Z['band'][1]], outline=(40, 110, 230, 255), width=6)
    d.rectangle(Z['block'], fill=(40, 110, 230, 45))
    d.rectangle(Z['read'][:2] + Z['read'][2:], outline=(30, 170, 60, 255), width=6)
    for x in Z['axis']:
        for y in range(Z['read'][1], Z['read'][3], 40):
            d.line([x, y, x, y + 20], fill=(30, 170, 60, 255), width=4)
    if painted is not None:
        ys = np.where(painted[:, 0] == 2)[0]
        if len(ys):
            for k in range(-1920, W, 36):
                d.line([k, ys[0], k + 1920 - ys[0], 1920], fill=(150, 150, 160, 120), width=4)
    im = Image.alpha_composite(im, ov)
    d = ImageDraw.Draw(im)
    fb = font(46)
    d.text((Z['block'][0] + 20, 335), 'caption line one', fill=(43, 27, 10, 255), font=font(64))
    d.text((Z['block'][0] + 20, 455), 'caption line two', fill=(43, 27, 10, 255), font=font(64))
    if title:
        d.rectangle(title, outline=(220, 0, 200, 255), width=6)
    if hero:
        d.rectangle(hero, outline=(255, 210, 0, 255), width=9)
    if pip:
        d.ellipse([pip[0] - 32, pip[1] - 32, pip[0] + 32, pip[1] + 32], outline=(150, 90, 220, 255), width=8)
        d.text((pip[0] + 38, pip[1] - 26), 'Pip', fill=(150, 90, 220, 255), font=fb)
    if painted is not None:
        ys = np.where(painted[:, 0] == 1)[0]
        if len(ys):
            d.text((24, ys[-1] - 60), 'sky extended', fill=(60, 60, 60, 255), font=fb)
        ys = np.where(painted[:, 0] == 2)[0]
        if len(ys):
            d.text((24, ys[0] + 12), 'near frame to draw', fill=(255, 255, 255, 255), font=fb)
    if label:
        d.rectangle([0, 1920 - 84, W, 1920], fill=(255, 255, 255, 230))
        d.text((20, 1920 - 72), label, fill=(0, 0, 0, 255), font=font(50))
    return im.convert('RGB')


def heat(rgb, S, use):
    s = S.copy()
    s[~use] = 0
    s = np.clip(s / np.percentile(s[use], 99.5), 0, 1)
    hm = cv2.applyColorMap((s * 255).astype(np.uint8), cv2.COLORMAP_INFERNO)[..., ::-1]
    return (0.45 * rgb + 0.55 * hm).astype(np.uint8)


def sheet(panels, cols, pw, path, pad=12, lab_h=52, fs=19):
    rows = [panels[i:i + cols] for i in range(0, len(panels), cols)]
    hs = [max(int(p[0].height * pw / p[0].width) for p in r) for r in rows]
    out = Image.new('RGB', (cols * (pw + pad) + pad, sum(hs) + len(rows) * (lab_h + pad) + pad), (245, 243, 238))
    d = ImageDraw.Draw(out)
    y = pad
    for r, h in zip(rows, hs):
        for i, (im, t) in enumerate(r):
            x = pad + i * (pw + pad)
            im2 = im.resize((pw, int(im.height * pw / im.width)), Image.LANCZOS)
            out.paste(im2, (x, y + lab_h))
            for k, line in enumerate(t.split('\n')[:2]):
                d.text((x, y + 4 + k * (fs + 4)), line, fill=(20, 20, 20), font=font(fs))
        y += h + lab_h + pad
    if max(out.size) > 2400:
        f = 2400 / max(out.size)
        out = out.resize((int(out.width * f), int(out.height * f)), Image.LANCZOS)
    out.save(path, quality=85)


def draw_structure(rgb, r, boxes, title_box):
    im = Image.fromarray(rgb).convert('RGB')
    d = ImageDraw.Draw(im)
    H, Wd = rgb.shape[:2]
    for k in (1, 2):
        d.line([Wd * k / 3, 0, Wd * k / 3, H], fill=(255, 255, 255), width=3)
        d.line([0, H * k / 3, Wd, H * k / 3], fill=(255, 255, 255), width=3)
    d.line([0, H / 2, Wd, H / 2], fill=(255, 255, 255), width=1)
    sl = r['skyline']
    d.line([(x, sl[x]) for x in range(0, Wd, 4)], fill=(0, 200, 255), width=5)
    if title_box:
        d.rectangle(title_box, outline=(220, 0, 200), width=5)
    for i, (labl, b) in enumerate(boxes):
        d.rectangle(b, outline=(255, 210, 0) if i == 0 else (255, 120, 0), width=9 if i == 0 else 4)
        d.text((b[0] + 8, b[1] + 6), labl.rstrip('*'), fill=(255, 210, 0) if i == 0 else (255, 120, 0), font=font(30))
    if boxes and r['icons'] and r['icons'][0].get('lead'):
        for x1, y1, x2, y2 in r['icons'][0]['lead']['segs']:
            d.line([x1, y1, x2, y2], fill=(255, 30, 30), width=6)
    return im


def frames_v2():
    os.makedirs(os.path.join(SCRATCH, 'frames'), exist_ok=True)
    out = []
    for sid, t, b in V2:
        p = os.path.join(SCRATCH, 'frames', f'v2_{sid}_{t:05.2f}.png')
        if not os.path.exists(p):
            subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(t), '-i', MASTER, '-frames:v', '1', p],
                           check=True)
        out.append((sid, t, b, p))
    return out


def run(do_sheets, img_dir):
    os.makedirs(SCRATCH, exist_ok=True)
    rng = np.random.default_rng(7)
    masks = json.load(open(os.path.join(REF, 'ui_mask.json')))['images']
    res, keep = {}, {}
    for name in sorted(ICONS):
        p = load_poster(name, masks)
        L = to_lab(p['rgb'])[..., 0]
        t = find_title(L, p['valid'])
        ign = box_mask(L.shape, [t['box'][0] - 12, t['box'][1] - 12, t['box'][2] + 12, t['box'][3] + 12]) if t else \
            np.zeros(L.shape, bool)
        r, S, SR, sky = measure(p['clean'], p['valid'], ign, p['boxes'], rng, title=t)
        # 9:16 placements
        H = L.shape[0]
        top = r['skyline_p2'] / 100 * H
        hero = p['boxes'][0][1]
        pl = {}
        for mode in ('extend', 'crop'):
            cv_, tr, painted = place(p, mode)
            hb = tf(hero, tr)
            tb = tf(t['box'], tr) if t else None
            band = cv_[Z['band'][0]:Z['band'][1]]
            bl = to_lab(band)
            sky916 = np.zeros((1920, W), bool)
            sky_t = cv2.resize(sky.astype(np.uint8), (round(W * tr[0]), round(H * tr[0])),
                               interpolation=cv2.INTER_NEAREST).astype(bool)
            y0, x0 = int(tr[2]), int(-tr[1])
            hh = min(sky_t.shape[0], 1920 - y0)
            sky916[y0:y0 + hh] = sky_t[:hh, x0:x0 + W]
            sky916[painted == 1] = True
            bandsky = sky916[Z['band'][0]:Z['band'][1]]
            tm = np.zeros((1920, W), bool)
            if tb:
                tm[max(0, int(tb[1]) - 12):int(tb[3]) + 12, max(0, int(tb[0]) - 12):int(tb[2]) + 12] = True
            b0, b1 = Z['block'][1], Z['block'][3]  # the rule's rows: the caption block, y 317-556
            rowsL = band_rows(to_lab(cv_[b0:b1])[..., 0], (sky916 & ~tm)[b0:b1])
            med = np.median(band.reshape(-1, 3), axis=0)
            pl[mode] = dict(title_y=((tb[1] + tb[3]) / 2) if tb else None, tallest_top=top * tr[0] + tr[2],
                            hero=[int(round(float(v))) for v in hb], hero_cy=(hb[1] + hb[3]) / 2,
                            hero_area=float(max(0, min(hb[2], W) - max(hb[0], 0)) * (hb[3] - hb[1]) / (W * 1920) * 100),
                            band_open_sky=float(bandsky.mean() * 100), band_L_p5=float(np.percentile(bl[..., 0], 5)),
                            band_rowL_range=float(rowsL.max() - rowsL.min()),
                            band_ink_ratio=float(wcag(INK, med)),
                            lost_width=float((1 - W / (W * tr[0])) * 100) if mode == 'crop' else 0.0,
                            bottom_drawn=int((painted == 2).sum() // W),
                            under_bottom_ui=float(((y0 + H * tr[0]) - Z['bottom_ui']) / (H * tr[0]) * 100)
                            if mode == 'extend' else None)
            if do_sheets and name in SHOW_916:
                keep.setdefault('916', []).append((name, mode, cv_, hb, tb, painted))
        r['p916'] = pl
        res[name] = r
        if do_sheets:
            keep.setdefault('posters', []).append((name, p, r, S, t))
        print(f"{name}: sky {r['sky']:.0f}%  skyline {r['skyline_med']:.0f}% (top {r['skyline_p2']:.0f}%)  "
              f"title y {r['title']['y'] if t else -1:.1f}%  hero {r['icons'][0]['area']:.1f}%  "
              f"sal {r['icons'][0]['sal_share']:.1f}% (x{r['icons'][0]['sal_lift']:.2f})  "
              f"lead {r['icons'][0]['lead']['lift'] if r['icons'][0]['lead'] else 0:.2f}")
    # v2 stills and the covers (1080 x 1920; the caption block / the title ignored like a poster's title)
    v2res = {}
    for sid, t, b, path in frames_v2():
        rgb = np.array(Image.open(path).convert('RGB'))
        valid = np.ones(rgb.shape[:2], bool)
        ign = box_mask(rgb.shape, V2_CAPTION)
        r, S, SR, sky = measure(rgb, valid, ign, [('subject', b)] if b else [], rng)
        L = to_lab(rgb)[..., 0]
        b0, b1 = Z['block'][1], Z['block'][3]
        r['band_rowL_range'] = float(np.ptp(band_rows(L[b0:b1], (sky & ~ign)[b0:b1])))
        v2res[sid] = r
        if do_sheets and sid in ('S1', 'S3', 'S5'):
            keep.setdefault('v2', []).append((sid, rgb, r, S, b))
        print(f"v2 {sid}: sky {r['sky']:.0f}% skyline {r['skyline_med']:.0f}% lower detail {r['lower_detail']:.0f}% "
              f"peak/med {r['sal']['peak_med']:.2f}" + (f" subj {r['icons'][0]['area']:.1f}% sal {r['icons'][0]['sal_share']:.1f}%" if b else ''))
    covers = {}
    for k, rel in COVERS.items():
        rgb = np.array(Image.open(os.path.join(ROOT, rel)).convert('RGB'))
        L = to_lab(rgb)[..., 0]
        bh = cv2.morphologyEx(L, cv2.MORPH_BLACKHAT, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
        n, _, st, _ = cv2.connectedComponentsWithStats(((bh > 25) & box_mask(L.shape, [60, 280, 1020, 640])).astype(np.uint8))
        hs = [st[i, 3] for i in range(1, n) if 25 <= st[i, 3] <= 140 and st[i, 4] > 150]
        covers[k] = dict(letter_h=float(np.median(hs)) if hs else None, letters=len(hs))
        if k == 'v2':
            r, S, SR, sky = measure(rgb, np.ones(L.shape, bool), box_mask(L.shape, V2_CAPTION),
                                    [('her + door', V2[0][2])], rng)
            covers[k]['measure'] = {kk: vv for kk, vv in r.items() if kk != 'skyline'}
        keep.setdefault('covers', []).append((k, rgb))
    for name, r in res.items():
        if r.get('title'):
            r['title']['tile_cap_px'] = r['title']['cap'] * 360 / W  # at a 360-px-wide grid tile
    out = dict(posters={k: {kk: vv for kk, vv in v.items() if kk != 'skyline'} for k, v in res.items()},
               v2={k: {kk: vv for kk, vv in v.items() if kk != 'skyline'} for k, v in v2res.items()}, covers=covers)
    json.dump(out, open(os.path.join(SCRATCH, 'composition.json'), 'w'), indent=1,
              default=lambda o: o.item() if hasattr(o, 'item') else str(o))
    print('numbers:', os.path.join(SCRATCH, 'composition.json'))
    if do_sheets:
        draw_sheets(keep, res, v2res, covers, img_dir)
    return out


def draw_sheets(keep, res, v2res, covers, img_dir):
    os.makedirs(img_dir, exist_ok=True)
    short = lambda n: n[3:-4].replace('_', ' ').title()
    # 1 structure: grid, thirds, title, open-sky line, hero and icons, the lines that lead to the hero
    panels = []
    for name, p, r, S, t in keep['posters']:
        h = r['icons'][0]
        lead = h['lead']['lift'] if h['lead'] else 0
        panels.append((draw_structure(p['clean'], dict(r, skyline=r['skyline']), p['boxes'], t['box'] if t else None),
                       f"{short(name)}: sky {r['sky']:.0f}%, hero {h['area']:.0f}%\n"
                       f"title y {r['title']['y']:.0f}%, lead {lead:.1f}x, low half {r['lower_detail']:.0f}%"))
    for sid, rgb, r, S, b in keep['v2']:
        bx = [('subject', b)] if b else []
        h = r['icons'][0] if b else None
        panels.append((draw_structure(rgb, r, bx, V2_CAPTION),
                       f"v2 {sid}: sky {r['sky']:.0f}%, subject {h['area']:.1f}%\n"
                       f"lead {(h['lead'] or {}).get('lift', 0):.1f}x, low half {r['lower_detail']:.0f}%"))
    sheet(panels, 5, 440, os.path.join(img_dir, 'composition_structure.jpg'))
    # 2 focus: CRAFT §b salience heat, the hero's share of it
    panels = []
    for name, p, r, S, t in keep['posters']:
        rgb = cv2.resize(p['clean'], (S.shape[1], S.shape[0]), interpolation=cv2.INTER_AREA)
        use = cv2.resize(p['valid'].astype(np.uint8), (S.shape[1], S.shape[0]), interpolation=cv2.INTER_NEAREST).astype(bool)
        im = Image.fromarray(heat(rgb, S, use))
        d = ImageDraw.Draw(im)
        for i, (labl, b) in enumerate(p['boxes']):
            d.rectangle([v / 2 for v in b], outline=(255, 255, 255) if i == 0 else (120, 200, 255), width=4 if i == 0 else 2)
        h = r['icons'][0]
        panels.append((im, f"{short(name)}: hero {h['sal_share']:.0f}% of it\non {h['area']:.0f}% of area, peak/med {r['sal']['peak_med']:.1f}"))
    for sid, rgb, r, S, b in keep['v2']:
        im = Image.fromarray(heat(cv2.resize(rgb, (S.shape[1], S.shape[0]), interpolation=cv2.INTER_AREA), S,
                                  ~box_mask(S.shape, [v / 2 for v in V2_CAPTION])))
        if b:
            ImageDraw.Draw(im).rectangle([v / 2 for v in b], outline=(255, 255, 255), width=4)
        h = r['icons'][0]
        panels.append((im, f"v2 {sid}: subject {h['sal_share']:.0f}% of it\non {h['area']:.1f}% of area, peak/med {r['sal']['peak_med']:.1f}"))
    sheet(panels, 5, 330, os.path.join(img_dir, 'composition_focus.jpg'), fs=16)
    # 3 9:16: three posters extended and cropped, our zones, Pip's likely spot; v2 S1 and S5 for reference
    panels = []
    for name, mode, cv_, hb, tb, painted in keep['916']:
        pip = pip_spot(cv_, hb)
        pl = res[name]['p916'][mode]
        lab_ = (f"{short(name)}: {'extend, top at y 300' if mode == 'extend' else 'crop to fill'}\n"
                f"title y {pl['title_y']:.0f}, tallest top y {pl['tallest_top']:.0f}")
        panels.append((zone_overlay(cv_, hero=hb, title=tb, pip=pip, painted=painted), lab_))
    for sid, rgb, r, S, b in keep['v2']:
        if sid in ('S1', 'S5'):
            pip = None
            panels.append((zone_overlay(rgb, hero=b, pip=pip), f"v2 {sid}, as built\nsky {r['sky']:.0f}%, subject {r['icons'][0]['area']:.1f}%"))
    sheet(panels, 4, 400, os.path.join(img_dir, 'composition_916.jpg'))
    # 4 the cover grid: our three covers and three posters as 3:4 grid tiles (360 px wide)
    tiles = []
    for k, rgb in keep['covers']:
        c = rgb[240:1680]
        lh = covers[k]['letter_h']
        tiles.append((Image.fromarray(c), f"{k} cover, 3:4 crop\nletters ~{lh * 360 / W:.0f} px at 360 px" if lh else f"{k} cover"))
    for name, p, r, S, t in keep['posters']:
        if name in ('02_reykjavik.jpg', '04_buenos_aires.jpg', '06_copenhagen.jpg'):
            tiles.append((Image.fromarray(p['clean']), f"{short(name)} poster\ntitle caps ~{r['title']['tile_cap_px']:.0f} px at 360 px"))
    sheet(tiles, 3, 360, os.path.join(img_dir, 'composition_cover_grid.jpg'))
    print('sheets:', img_dir)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('cmd', choices=['all', 'measure', 'frame'])
    ap.add_argument('still', nargs='?')
    ap.add_argument('--img-dir', default=os.path.join(STUDY, 'img'))
    ap.add_argument('--subject')
    ap.add_argument('--out')
    a = ap.parse_args()
    if a.cmd == 'frame':
        rgb = np.array(Image.open(a.still).convert('RGB').resize((W, 1920)))
        b = [float(v) for v in a.subject.split(',')] if a.subject else None
        r, S, SR, sky = measure(rgb, np.ones(rgb.shape[:2], bool), box_mask(rgb.shape, V2_CAPTION),
                                [('subject', b)] if b else [], np.random.default_rng(7))
        r.pop('skyline')
        if r['icons'] and r['icons'][0].get('lead'):
            r['icons'][0]['lead'].pop('segs')
        print(json.dumps(r, indent=1))
        if a.out:
            zone_overlay(rgb, hero=b).save(a.out, quality=85)
        return
    run(a.cmd == 'all', a.img_dir)


if __name__ == '__main__':
    main()
