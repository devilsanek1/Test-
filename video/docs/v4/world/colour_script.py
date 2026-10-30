"""Video 4's colour script strip (W1): 12 columns, one per shot, readable on a phone.

    python3 -I docs/v4/world/colour_script.py        # from video/; writes docs/v4/world/colour_script.png

Each column: the beat's name, a small value-and-colour thumbnail of its frame (planning shapes only, never a render),
three swatches under it (the key field, the accent, the darks) and its L* range. The colours come from
palette_v4.json beside this file (the world bible's palette, section 3). Rows: S1-S4, S5-S8, S9-S12.
Stdlib + numpy + Pillow; deterministic.
"""
import json
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
PAL = {r['role']: r['hex'] for r in json.load(open(os.path.join(HERE, 'palette_v4.json')))['roles']}
W, H = 1080, 1920              # the film's frame (thumbnails are drawn at this size, then reduced)
PAGE, INK, MUTED = '#F3F1EC', '#24252D', '#6A6A74'
FONT_B = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
FONT_R = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'


def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', size)


def rgb(hx):
    hx = hx.lstrip('#')
    return tuple(int(hx[i:i + 2], 16) for i in (0, 2, 4))


def lab(hx):
    c = np.array(rgb(hx)) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
    xyz = m @ c / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > (6 / 29) ** 3, np.cbrt(xyz), xyz / (3 * (6 / 29) ** 2) + 4 / 29)
    return np.array([116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])])


def from_lab(v):
    L, a, b = v
    fy = (L + 16) / 116
    fx, fz = fy + a / 500, fy - b / 200
    fi = lambda t: t ** 3 if t > 6 / 29 else 3 * (6 / 29) ** 2 * (t - 4 / 29)
    xyz = np.array([fi(fx), fi(fy), fi(fz)]) * np.array([0.95047, 1.0, 1.08883])
    mi = np.linalg.inv(np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750],
                                 [0.0193339, 0.1191920, 0.9503041]]))
    c = np.clip(mi @ xyz, 0, 1)
    c = np.where(c <= 0.0031308, 12.92 * c, 1.055 * c ** (1 / 2.4) - 0.055)
    return tuple(int(round(x * 255)) for x in c)


def vgrad(im, y0, y1, stops, x0=0, x1=W):
    """Fill rows y0..y1 with a vertical gradient through (y, hex) stops, mixed in Lab."""
    dr = ImageDraw.Draw(im)
    ys = [s[0] for s in stops]
    labs = [lab(s[1]) for s in stops]
    for y in range(max(0, y0), min(H, y1)):
        if y <= ys[0]:
            c = labs[0]
        elif y >= ys[-1]:
            c = labs[-1]
        else:
            i = max(j for j in range(len(ys) - 1) if ys[j] <= y)
            t = (y - ys[i]) / max(1, ys[i + 1] - ys[i])
            t = t * t * (3 - 2 * t)
            c = labs[i] * (1 - t) + labs[i + 1] * t
        dr.line([(max(0, x0), y), (min(W, x1) - 1, y)], fill=from_lab(c))


SKY = [(0, PAL['sky.zenith']), (290, PAL['sky.band']), (600, PAL['sky.band']), (780, PAL['sky.low']),
       (980, '#7F7799'), (1095, PAL['sky.glow']), (1150, PAL['air'])]
SNOW = [(1200, PAL['snow.far']), (1500, PAL['snow.mid']), (1920, PAL['snow.near'])]


def sky(im, shift=0, low=None):
    stops = [(y + (shift if y > 600 else 0), c) for y, c in SKY]
    vgrad(im, 0, low or H, stops)


def blob(d, box, fill):
    d.ellipse(box, fill=rgb(fill))


def cloud(im, x0, y0, x1, y1):
    """The hero snow cloud: a few overlapping ellipses on a size ladder, its underside lit by the city glow."""
    lay = Image.new('L', (W, H), 0)
    dd = ImageDraw.Draw(lay)
    w, h = x1 - x0, y1 - y0
    for (fx, fy, fw, fh) in [(0.0, 0.35, 0.55, 0.6), (0.3, 0.1, 0.45, 0.75), (0.55, 0.3, 0.4, 0.6),
                             (0.15, 0.5, 0.7, 0.45), (0.72, 0.5, 0.28, 0.4)]:
        dd.ellipse([x0 + fx * w, y0 + fy * h, x0 + (fx + fw) * w, y0 + (fy + fh) * h], fill=255)
    lay = lay.filter(ImageFilter.GaussianBlur(6))
    im.paste(Image.new('RGB', (W, H), rgb(PAL['cloud.body'])), (0, 0), lay)
    lit = Image.new('L', (W, H), 0)
    ImageDraw.Draw(lit).ellipse([x0 + 0.12 * w, y0 + 0.78 * h, x0 + 0.92 * w, y0 + 1.02 * h], fill=200)
    lit = Image.composite(lit, Image.new('L', (W, H), 0), lay).filter(ImageFilter.GaussianBlur(10))
    im.paste(Image.new('RGB', (W, H), rgb(PAL['cloud.lit'])), (0, 0), lit)


def snowfall(d, seed, n=70, y0=0, y1=H):
    r = np.random.default_rng(seed)
    for _ in range(n):
        x, y = r.uniform(0, W), r.uniform(y0, y1)
        s = r.uniform(3, 9)
        if 290 <= y <= 600:
            s = min(s, 5)
        d.ellipse([x - s, y - s, x + s, y + s], fill=(196, 200, 222))


def panes(d, x0, y0, x1, y1, seed, lit_share=0.35, lit=None):
    r = np.random.default_rng(seed)
    cols, rows = 4, 5
    cw, rh = (x1 - x0) / cols, (y1 - y0) / rows
    for i in range(cols):
        for j in range(rows):
            wx, wy = x0 + i * cw + cw * 0.28, y0 + j * rh + rh * 0.25
            ww, wh = cw * r.uniform(0.38, 0.46), rh * r.uniform(0.42, 0.52)
            c = PAL['pane.lit'] if (lit is None and r.uniform() < lit_share) else PAL['pane.dark']
            d.rectangle([wx, wy, wx + ww, wy + wh], fill=rgb(c))


def far_city(d, x0, x1, top=1090, base=1152, seed=3):
    r = np.random.default_rng(seed)
    x = x0
    while x < x1:
        w = r.uniform(30, 80)
        h = r.uniform(18, 60)
        d.rectangle([x, base - h, x + w, base], fill=rgb(PAL['far.city']))
        if r.uniform() < 0.6:
            d.rectangle([x + w * 0.3, base - h * 0.6, x + w * 0.42, base - h * 0.5], fill=rgb(PAL['far.lit']))
        x += w + r.uniform(0, 10)
    d.rectangle([x0, base - 6, x1, base], fill=rgb(PAL['far.roofs']))


def harbour(d, y0, y1, x0=0, x1=W):
    d.rectangle([x0, y0, x1, y1], fill=rgb(PAL['water.near']))
    d.rectangle([x0, y0, x1, y0 + (y1 - y0) * 0.45], fill=rgb(PAL['water.far']))


def computer(d, x0, y0, x1, y1, lights=PAL['comp.light'], hot=False):
    d.rectangle([x0, y0, x1, y1], fill=rgb(PAL['comp.front']))
    side = max(6, (x1 - x0) * 0.12)
    d.rectangle([x0, y0, x0 + side, y1], fill=rgb(PAL['comp.side']))
    d.rectangle([x0, y0, x0 + max(2, side * 0.25), y1], fill=rgb(PAL['comp.rim']))
    rows = 8
    for k in range(rows):
        yy = y0 + (y1 - y0) * (k + 0.5) / rows
        for m in range(5):
            xx = x0 + side + (x1 - x0 - side) * (m + 0.6) / 5.4
            s = max(2, (x1 - x0) * 0.018)
            if (k * 7 + m * 3) % 5 != 0:
                d.ellipse([xx - s, yy - s, xx + s, yy + s], fill=rgb(lights))
    if hot:
        d.rectangle([x0, y0 - 6, x1, y0 + 6], fill=rgb(PAL['comp.hot']))
        d.ellipse([x0 + (x1 - x0) * 0.2, y0 - 10, x1 - (x1 - x0) * 0.2, y0 + 8], fill=rgb(PAL['comp.melt']))


def steam(im, cx, y_root, y_top, w_root, w_top, warm=True):
    lay = Image.new('L', (W, H), 0)
    dd = ImageDraw.Draw(lay)
    steps = 26
    for i in range(steps):
        t = i / (steps - 1)
        y = y_root + (y_top - y_root) * t
        w = w_root + (w_top - w_root) * t
        a = int(235 * (1 - t) ** 0.7)
        dd.ellipse([cx - w / 2 + 30 * math.sin(t * 5), y - 60, cx + w / 2 + 30 * math.sin(t * 5), y + 60], fill=a)
    lay = lay.filter(ImageFilter.GaussianBlur(28))
    body = Image.new('RGB', (W, H), rgb(PAL['steam.body']))
    if warm:
        root = Image.new('RGB', (W, H), rgb(PAL['steam.base']))
        g = Image.new('L', (W, H), 0)
        gd = ImageDraw.Draw(g)
        gd.ellipse([cx - w_root * 0.6, y_root - 140, cx + w_root * 0.6, y_root + 40], fill=255)
        g = g.filter(ImageFilter.GaussianBlur(40))
        body = Image.composite(root, body, g)
    im.paste(body, (0, 0), lay)


def window(d, cx, cy, w, h, pane, core):
    d.rectangle([cx - w / 2 - 6, cy - h / 2 - 6, cx + w / 2 + 6, cy + h / 2 + 6], fill=rgb(PAL['win.reveal']))
    d.rectangle([cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2], fill=rgb(pane))
    d.ellipse([cx - w * 0.28, cy - h * 0.3, cx + w * 0.28, cy + h * 0.2], fill=rgb(core))


def bloom(im, cx, cy, r, hx, k=0.35):
    lay = Image.new('L', (W, H), 0)
    ImageDraw.Draw(lay).ellipse([cx - r, cy - r, cx + r, cy + r], fill=int(255 * k))
    lay = lay.filter(ImageFilter.GaussianBlur(r * 0.5))
    im.paste(Image.new('RGB', (W, H), rgb(hx)), (0, 0), lay)


def line(d, pts, hx, w):
    d.line(pts, fill=rgb(hx), width=int(w), joint='curve')


def home_view(im, d, run='warm', win='W1', resident='street', phone=False, seed=1):
    """The home view under one camera (WORLD_BIBLE 1.0): horizon y 1150; the block 378-812 x 667-1200; the computer
    66-282 x 858-1236; the one window (598, 970); the resident's feet at y 1319."""
    sky(im)
    cloud(im, -60, 70, 560, 290)
    d = ImageDraw.Draw(im)
    far_city(d, 0, 380)
    harbour(d, 1152, 1181, 0, 380)
    d.rectangle([0, 1181, W, 1205], fill=rgb(PAL['snow.far']))
    vgrad(im, 1200, H, SNOW)
    for x in (220, 460, 700, 940):          # tyre tracks into the picture (toward the VP)
        line(d, [(540 + (x - 540) * 0.25, 1205), (x, H)], PAL['snow.shade'], 10)
    d.rectangle([378, 667, 812, 1200], fill=rgb(PAL['block.front']))
    panes(d, 400, 700, 790, 1180, seed)
    d.rectangle([812, 720, W, 1200], fill=rgb(PAL['next.block']))
    panes(d, 830, 750, 1080, 1180, seed + 1)
    d.rectangle([378, 663, 812, 673], fill=rgb(PAL['snow.cap']))
    d.rectangle([812, 716, W, 724], fill=rgb(PAL['snow.cap']))
    if run in ('warm', 'pulse'):
        line(d, [(250, 1236), (420, 1215), (560, 1201)], PAL['melt.wet'], 20)
        line(d, [(250, 1236), (420, 1215)], PAL['melt.sheen'], 7)
        line(d, [(420, 1215), (560, 1201)], PAL['water.gold'] if run == 'pulse' else PAL['melt.sheen'], 7)
        line(d, [(598, 1200), (598, 1025)], PAL['water.warm'], 9)
    d.ellipse([405, 1207, 435, 1223], fill=rgb(PAL['iron']))
    computer(d, 66, 858, 282, 1236)
    if win == 'W0':
        window(d, 598, 970, 68, 88, PAL['win.W0'], PAL['win.W0'])
    else:
        pane, core = {'W1': (PAL['win.W1.pane'], PAL['win.W1.core']),
                      'W4': (PAL['win.W4.pane'], PAL['win.W4.core'])}[win]
        bloom(im, 598, 970, 70 if win == 'W1' else 90, pane, 0.30)
        d = ImageDraw.Draw(im)
        window(d, 598, 970, 68, 88, pane, core)
    if resident == 'street':
        d.ellipse([768, 1138, 792, 1164], fill=rgb(PAL['res.hair']))
        d.polygon([(760, 1162), (800, 1162), (812, 1319), (748, 1319)], fill=rgb(PAL['res.coat']))
        d.rectangle([766, 1160, 794, 1172], fill=rgb(PAL['res.knit']))
    elif resident == 'window':
        d.ellipse([588, 958, 606, 978], fill=rgb(PAL['res.silhouette']))
        d.rectangle([584, 976, 612, 1014], fill=rgb(PAL['res.silhouette']))
    d.ellipse([835, 893, 857, 917], fill=rgb(PAL['pip.lit']))
    if phone:
        d.polygon([(150, H), (250, 1430), (520, 1400), (560, H)], fill=rgb(PAL['glove']))
        d.rounded_rectangle([318, 1290, 482, 1500], 18, fill=rgb(PAL['anchor']))
        d.rounded_rectangle([330, 1310, 470, 1480], 10, fill=rgb(PAL['phone.screen']))
        d.rounded_rectangle([352, 1340, 448, 1392], 16, fill=rgb(PAL['bubble']))
    snowfall(d, seed + 7)
    return d


def shot(n):
    im = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(im)
    if n == 1:
        home_view(im, d, run='warm', win='W1', resident='street', seed=1)
    elif n == 2:
        sky(im, shift=80)
        far_city(d, 0, W, base=1252)
        harbour(d, 1252, 1300)
        vgrad(im, 1300, H, [(1300, PAL['snow.far']), (1920, PAL['snow.mid'])])
        d.rectangle([846, 610, W, 1300], fill=rgb(PAL['block.front']))
        panes(d, 860, 640, 1080, 1290, 5)
        computer(d, 372, 920, 708, 1510)
        for x in (110, 970):
            line(d, [(x, 625), (x, 1510)], PAL['plan.C'], 7)
        line(d, [(110, 625), (970, 625)], PAL['plan.C'], 7)
        line(d, [(110, 1510), (970, 1510)], PAL['plan.C'], 7)
        snowfall(d, 12)
    elif n == 3:
        sky(im, shift=300)
        steam(im, 540, 900, 640, 520, 900)
        d = ImageDraw.Draw(im)
        computer(d, 204, 915, 876, H + 200, hot=True)
        snowfall(d, 13)
    elif n == 4:
        sky(im, shift=120)
        harbour(d, 1280, 1320)
        vgrad(im, 1320, H, [(1320, PAL['snow.far']), (1920, PAL['snow.mid'])])
        steam(im, 540, 760, 640, 300, 760)
        d = ImageDraw.Draw(im)
        computer(d, 372, 750, 708, 1340, hot=True)
        for x in (70, 1010):
            line(d, [(x, 640), (x, 1600)], PAL['plan.C'], 7)
        for row in range(5):
            y = 1360 + row * 30
            wrow = 480 + row * 45
            for k in range(8):
                x = 540 - wrow / 2 + wrow * (k + 0.5) / 8
                s = 18 + row * 4
                d.ellipse([x - s * 1.2, y + s * 0.5, x + s * 1.2, y + s * 1.1], fill=rgb(PAL['melt.wet']))
                d.rounded_rectangle([x - s * 0.8, y - s, x + s * 0.8, y + s * 0.8], 6, fill=rgb(PAL['kettle.body']))
                d.rectangle([x - s * 0.8, y - s, x - s * 0.3, y + s * 0.8], fill=rgb(PAL['kettle.lit']))
        snowfall(d, 14)
    elif n == 5:
        sky(im, shift=300)
        steam(im, 540, 1000, 560, 760, 1100)
        d = ImageDraw.Draw(im)
        computer(d, 204, 1030, 876, H + 200, hot=True)
        d.rounded_rectangle([470, 885, 610, 1028], 14, fill=rgb(PAL['mug.glaze']))
        d.arc([590, 920, 660, 990], -90, 90, fill=rgb(PAL['mug.glaze']), width=16)
        d.ellipse([474, 872, 606, 902], fill=rgb(PAL['mug.rim']))
        d.ellipse([486, 878, 594, 898], fill=rgb(PAL['tea']))
        snowfall(d, 15, n=40)
    elif n == 6:
        vgrad(im, 0, 1000, [(0, PAL['sky.zenith']), (290, PAL['sky.band']), (600, PAL['sky.band']),
                            (700, PAL['sky.low']), (780, PAL['planet.limb']), (1000, PAL['planet.limb'])])
        d.pieslice([-900, 780, 1980, 3900], 180, 360, fill=rgb(PAL['planet.land']))
        d.arc([-900, 772, 1980, 3900], 196, 344, fill=rgb(PAL['planet.limb']), width=12)
        d.pieslice([-200, 1050, 700, 2300], 180, 300, fill=rgb(PAL['planet.sea']))
        r = np.random.default_rng(6)
        for _ in range(14):
            x, y = r.uniform(0, W), r.uniform(880, 1800)
            d.ellipse([x - 60, y - 14, x + 60, y + 14], fill=rgb(PAL['planet.snowland']))
        for _ in range(9):
            x, y = r.uniform(0, W), r.uniform(1300, 1850)
            d.ellipse([x - 120, y - 24, x + 120, y + 24], fill=rgb(PAL['planet.cloud']))
            d.ellipse([x - 90, y - 26, x + 60, y - 4], fill=rgb(PAL['planet.cloud.lit']))
        for (x, y, s) in [(540, 1120, 26), (300, 1000, 10), (760, 1020, 12), (180, 1400, 18), (880, 1300, 16),
                          (420, 1600, 20), (980, 900, 8)]:
            d.rectangle([x - s, y - s * 0.6, x + s, y + s * 0.6], fill=rgb(PAL['dc.box']))
            steam(im, x, y - s, max(640, y - 260 - s * 4), s * 3, s * 7, warm=False)
            d = ImageDraw.Draw(im)
        bloom(im, 540, 955, 40, PAL['helsinki'], 0.45)
        d = ImageDraw.Draw(im)
        d.ellipse([528, 943, 552, 967], fill=rgb(PAL['helsinki']))
    elif n == 7:
        sky(im, shift=-20)
        far_city(d, 560, W, base=1152)
        harbour(d, 1152, 1200, 450, W)
        vgrad(im, 1200, H, [(1200, PAL['snow.far']), (1920, PAL['snow.near'])])
        steam(im, 330, 800, 640, 220, 520)
        d = ImageDraw.Draw(im)
        computer(d, 215, 800, 445, 1210, hot=True)
        line(d, [(120, 1205), (560, 1205), (600, 1265), (90, 1265), (120, 1205)], PAL['plan.C'], 6)
        d.ellipse([735, 1305, 785, 1335], fill=rgb(PAL['iron']))
        line(d, [(760, 1312), (440, 1222)], PAL['plan.A'], 6)
        line(d, [(760, 1330), (440, 1238)], PAL['plan.A'], 6)
        snowfall(d, 17)
    elif n == 8:
        sky(im, shift=0)
        harbour(d, 1150, 1210)
        d.rectangle([720, 1128, 900, 1160], fill=rgb(PAL['anchor']))
        d.rectangle([750, 1112, 880, 1130], fill=rgb(PAL['ice']))
        for x in (770, 800, 830, 860):
            d.rectangle([x, 1116, x + 10, 1124], fill=rgb(PAL['far.lit']))
        d.ellipse([752, 1100, 768, 1116], fill=rgb(PAL['pip.lit']))
        vgrad(im, 1210, H, [(1210, PAL['snow.far']), (1920, PAL['snow.mid'])])
        steam(im, 540, 960, 640, 240, 520)
        d = ImageDraw.Draw(im)
        computer(d, 400, 959, 680, 1450, hot=True)
        for pts in ([(150, 713), (930, 713)], [(150, 713), (150, 1450)], [(930, 713), (930, 1450)],
                    [(150, 1450), (930, 1450)], [(150, 713), (260, 640)], [(930, 713), (820, 640)],
                    [(260, 640), (820, 640)], [(260, 640), (260, 1330)], [(820, 640), (820, 1330)]):
            line(d, pts, PAL['plan.A'], 7)
        d.rectangle([400, 1065, 680, 1235], fill=rgb(PAL['tag.paper']))
        line(d, [(540, 1065), (540, 1010)], PAL['plan.C'], 4)
        fnt = font(FONT_B, 118)
        d.text((540, 1150), '2027', font=fnt, fill=rgb(PAL['tag.ink']), anchor='mm')
        snowfall(d, 18)
    elif n in (9, 10):
        sky(im, shift=60)
        harbour(d, 1230, 1270)
        vgrad(im, 1270, H, [(1270, PAL['snow.far']), (1920, PAL['snow.mid'])])
        if n == 10:
            for k in range(-5, 6):
                if k == 0:
                    continue
                line(d, [(540, 1150), (540 + k * 260, 1650)], PAL['plan.C'], 5)
                line(d, [(540 + k * 90, 980), (540 + k * 90, 1180)], PAL['plan.C'], 4)
            for y in (700, 760):
                line(d, [(0, y), (W, y)], PAL['plan.C'], 4)
        if n == 9:
            steam(im, 540, 850, 640, 240, 500)
            d = ImageDraw.Draw(im)
        computer(d, 378, 840, 702, 1407)
        inside = PAL['mach.hot'] if n == 9 else PAL['mach.cool']
        d.rectangle([400, 880, 680, 1390], fill=rgb(inside))
        for k in range(1, 8):
            y = 880 + 510 * k / 8
            line(d, [(400, y), (680, y)], PAL['comp.front'], 6)
        d.polygon([(400, 880), (300, 850), (300, 1420), (400, 1390)], fill=rgb(PAL['comp.side']))
        line(d, [(0, 870), (540, 870)], PAL['water.cool'], 10)
        if n == 9:
            line(d, [(540, 880), (540, 1390)], PAL['anchor'], 12)
        else:
            vgrad(im, 880, 1390, [(880, PAL['water.cool']), (1100, PAL['water.cool']), (1390, PAL['water.warm'])],
                  534, 547)
            d = ImageDraw.Draw(im)
            line(d, [(540, 1395), (540, 1420), (W, 1420)], PAL['melt.wet'], 24)
            line(d, [(540, 1395), (540, 1420), (W, 1420)], PAL['water.warm'], 10)
        snowfall(d, 19 + n)
    elif n == 11:
        sky(im, shift=-40)
        far_city(d, 230, 350, base=1132)
        harbour(d, 1132, 1170, 230, 350)
        vgrad(im, 1290, H, [(1290, PAL['snow.far']), (1600, PAL['snow.mid']), (1920, PAL['snow.near'])])
        d.rectangle([0, 1170, W, 1300], fill=rgb(PAL['snow.far']))
        computer(d, -60, 890, 237, 1300)
        d.rectangle([347, 661, 846, 1300], fill=rgb(PAL['block.front']))
        panes(d, 370, 690, 830, 1280, 21)
        d.rectangle([846, 720, W, 1300], fill=rgb(PAL['next.block']))
        panes(d, 860, 750, 1080, 1280, 22)
        line(d, [(237, 1310), (556, 1310)], PAL['melt.wet'], 28)
        line(d, [(237, 1310), (390, 1310)], PAL['water.warm'], 10)
        line(d, [(390, 1310), (600, 1310), (600, 1085)], PAL['water.gold'], 10)
        d.ellipse([372, 1298, 408, 1322], fill=rgb(PAL['iron']))
        steam(im, 390, 1290, 1150, 60, 120)
        d = ImageDraw.Draw(im)
        d.rectangle([570, 1062, 630, 1098], fill=rgb(PAL['radiator.warm']))
        bloom(im, 600, 1000, 80, PAL['win.W1.pane'], 0.30)
        d = ImageDraw.Draw(im)
        window(d, 600, 1000, 78, 101, PAL['win.W1.pane'], PAL['win.W1.core'])
        d.ellipse([589, 988, 609, 1010], fill=rgb(PAL['res.silhouette']))
        d.rectangle([585, 1008, 613, 1048], fill=rgb(PAL['res.silhouette']))
        d.ellipse([819, 889, 843, 913], fill=rgb(PAL['pip.lit']))
        snowfall(d, 23)
    elif n == 12:
        home_view(im, d, run='pulse', win='W4', resident='window', phone=True, seed=1)
    return im


SHOTS = [
    (1, 'S1', 'hook', 'L* 12-64', '95', 'sky.band', 'water.warm', 'anchor'),
    (2, 'S2', 'computer', 'L* 14-64', '80', 'sky.band', 'comp.light', 'comp.front'),
    (3, 'S3', 'really hot', 'L* 14-74', '74', 'steam.body', 'steam.base', 'comp.front'),
    (4, 'S4', 'forty kettles', 'L* 14-74', '74', 'snow.far', 'steam.base', 'comp.front'),
    (5, 'S5', 'a lot of tea', 'L* 16-82', '58', 'steam.body', 'tea', 'mug.glaze'),
    (6, 'S6', 'the planet', 'L* 12-64', '86', 'planet.land', 'helsinki', 'planet.sea'),
    (7, 'S7', 'wants', 'L* 14-78', '74', 'snow.mid', 'steam.base', 'comp.front'),
    (8, 'S8', 'the plan', 'L* 14-86', '74', 'plan.A', 'steam.base', 'comp.front'),
    (9, 'S9', 'how?', 'L* 14-74', '70', 'sky.low', 'mach.hot', 'comp.front'),
    (10, 'S10', 'water', 'L* 14-76', '76', 'plan.C', 'water.warm', 'mach.cool'),
    (11, 'S11', 'into homes', 'L* 12-64', '95', 'snow.far', 'water.gold', 'block.front'),
    (12, 'S12', 'payoff', 'L* 12-64', '95', 'sky.band', 'win.W4.pane', 'anchor'),
]


def main():
    page = Image.new('RGB', (1080, 1920), rgb(PAGE))
    d = ImageDraw.Draw(page)
    d.text((40, 34), 'Video 4 · colour script', font=font(FONT_B, 52), fill=rgb(INK))
    d.text((40, 100), 'cold blue snowy night · one warm accent: the heat', font=font(FONT_R, 30), fill=rgb(MUTED))
    tw, th = 220, 391
    gap = (1080 - 4 * tw) // 5
    lab_f, name_f, num_f = font(FONT_B, 38), font(FONT_R, 28), font(FONT_R, 26)
    top = 160
    row_h = 548
    for i, (n, sid, name, rng, acc, k_role, a_role, d_role) in enumerate(SHOTS):
        r, c = divmod(i, 4)
        x = gap + c * (tw + gap)
        y = top + r * row_h
        d.text((x, y), sid, font=lab_f, fill=rgb(INK))
        sid_w = d.textlength(sid + ' ', font=lab_f)
        d.text((x + sid_w, y + 9), name, font=name_f, fill=rgb(MUTED))
        thumb = shot(n).resize((tw, th), Image.LANCZOS)
        page.paste(thumb, (x, y + 50))
        d.rectangle([x - 1, y + 49, x + tw, y + 50 + th], outline=rgb('#B9B7B0'), width=1)
        sy = y + 50 + th + 10
        sw = (tw - 2 * 8) // 3
        for j, role in enumerate((k_role, a_role, d_role)):
            sx = x + j * (sw + 8)
            d.rectangle([sx, sy, sx + sw, sy + 40], fill=rgb(PAL[role]), outline=rgb('#B9B7B0'))
        d.text((x, sy + 50), rng, font=num_f, fill=rgb(INK))
        aw = d.textlength(rng + '  ', font=num_f)
        d.ellipse([x + aw, sy + 56, x + aw + 20, sy + 76], fill=rgb(PAL[a_role]), outline=rgb('#8F8D86'))
        d.text((x + aw + 28, sy + 50), acc, font=num_f, fill=rgb(INK))
    ly = top + 3 * row_h + 2
    d.text((40, ly), 'under each: key · accent · darks; L* range, then the accent', font=font(FONT_R, 26),
           fill=rgb(MUTED))
    legend = [('night sky', 'sky.band'), ('glow', 'sky.glow'), ('snow', 'snow.far'), ('the heat', 'water.warm'),
              ('window', 'win.W1.pane'), ('lights', 'comp.light'), ('plan', 'plan.A')]
    lx = 40
    lf = font(FONT_R, 25)
    for label, role in legend:
        d.rectangle([lx, ly + 44, lx + 30, ly + 74], fill=rgb(PAL[role]), outline=rgb('#8F8D86'))
        d.text((lx + 38, ly + 46), label, font=lf, fill=rgb(INK))
        lx += 38 + d.textlength(label, font=lf) + 26
    out = os.path.join(HERE, 'colour_script.png')
    page.save(out, optimize=True)
    print('wrote', out)


if __name__ == '__main__':
    main()
