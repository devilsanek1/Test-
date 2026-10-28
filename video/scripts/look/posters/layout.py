#!/usr/bin/env python3
"""layout.py: draw our 9:16 layout zone map (1080 x 1920) from the numbers the docs give (city-poster study, the
consolidated layout guide: docs/studies/2026-10-28_city_posters/layout.md, section 1).

  python3 -I scripts/look/posters/layout.py --out docs/studies/2026-10-28_city_posters/img/layout_zones.jpg
  python3 -I scripts/look/posters/layout.py --measure     # the two numbers measured here (v1-v3 sky end; cover titles)

Run from `video/`. Three panels, each the full 1080 x 1920 frame (y down), drawn at one scale:
  1. Screen zones: where things may go (platform UI, the caption band and block, the read zone, the subject axis,
     the key-action boxes, the ad overlay, the side margins, the bottom third, paper edges, labels).
  2. Lines: horizon height by shot type (a range bar per type), the thirds, v2's measured sky end.
  3. Across shots and the cover: v2's thread home spots with the B-match tolerance, v2's Pip seats (history: Pip
     hides since 2026-10-28), v3's O1 window, the profile-grid crops and the three covers' measured titles.
Every number lives in the tables below with its source; where two docs disagree both values are drawn, in red.
Pillow only; deterministic.
"""
import argparse
import os

from PIL import Image, ImageDraw, ImageFont

W, H = 1080, 1920
S = 0.62                      # panel scale
PW, PH = int(W * S), int(H * S)
FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
FONTB = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'

# ---- the numbers (canvas px at 1080 x 1920; source in the last field) -------------------------------------------
UI_ORGANIC = [  # (x0, y0, x1, y1, label, source)
    (0, 0, 1080, 180, 'top UI  y < 180', 'G5_BLOCKING §2; theme.ts safe; framecheck'),
    (0, 1520, 1080, 1920, 'bottom UI  y > 1520', 'G5_BLOCKING §2; theme.ts safe; framecheck'),
    (950, 900, 1080, 1500, 'rail', 'G5_BLOCKING §2: x > 950, y 900-1500'),
]
AD_RAIL = [(780, 840), (1080, 840), (1080, 1920), (780, 1920)]      # vertical.md §2; G5 §2; COZY §5
AD_BOTTOM_Y = 1250                                                   # the bottom 35 %: vertical.md §2; v2 STYLE §7
TOP_GUTTER = (0, 0, 1080, 290)        # framing only: COZY §2 (top-edge object y 0-290), 3b.2; vertical.md §1
CAPTION_BAND = (0, 290, 1080, 600)    # DIRECTION rule 10; G5 §2; STORYBOARD §3; LIFE §8; particles.tsx (x 95-945)
CAPTION_BLOCK = (95, 317, 945, 556)   # COZY intro; CINEMATIC notation; sky.tsx CAPTION_BAND; CRAFT §g; v2 STYLE §7
CAPTION_CLIP = (90, 280, 990, 570)    # theme.ts skyCaption clip; ENGINE §2; capcheck BAND (red: a third range)
BASELINES = (387, 510)                # theme.ts skyCaption (98 px, centred on x 520, max 850 px)
READ_ZONE = (120, 600, 880, 1250)     # STORYBOARD §3 (y 600-1250); vertical.md stage (x 120-880); COZY §5
SUBJECT_AXIS = (380, 700)             # STORYBOARD §3 + board lint; COZY §5 (points of interest in scale shots)
KEY_ACTION_DOC = (120, 600, 950, 1480)   # G5_BLOCKING §2
KEY_ACTION_CODE = (90, 200, 990, 1480)   # theme.ts safe.action; ENGINE §2 (red: disagrees with the doc)
SIDE_MARGIN = 120                     # COZY §5; STORYBOARD §3
BOTTOM_THIRD = (0, 1250, 1080, 1920)  # v2 STYLE §1/§7 (masses only, nothing to read); vertical.md §1
CREDIT_TAB = (60, 185, 520, 288)      # G5 §5 (v2: one ink-on-cream tab, y ~185-288)
DRAFT_LABEL = (0, 1850, 330, 1920)    # G5 §2 (bottom-left, y > 1850; never in a master)
PAPER_EDGE_FROM_Y = 640               # COZY 3b.7; v2 STYLE §3 (never y 0-620 or beside the band)

HORIZONS = [  # (code, y0 frac, y1 frac, colour, source, flagged?)
    ('K10', 0.15, 0.30, (128, 90, 170), 'COZY K10 high angle', False),
    ('S1', 0.40, 0.40, (40, 120, 200), 'CINEMATIC S1 landing; theme world.horizon 768', False),
    ('VISTA', 0.43, 0.46, (230, 120, 40), 'COZY §5 roof vista', True),
    ('S5', 0.46, 0.46, (200, 80, 40), 'CINEMATIC S5 end', False),
    ('STREET', 0.50, 0.60, (60, 150, 90), 'COZY §2 streets', False),
    ('EYE', 0.52, 0.59, (30, 110, 60), 'COZY §5 / vertical.md eye-height scale', False),
    ('K7', 0.58, 0.64, (150, 60, 120), 'COZY K7 worm\'s-eye', False),
    ('S3', 0.73, 0.73, (90, 90, 90), 'CINEMATIC S3 big sky', False),
    ('WORM', 0.78, 0.78, (210, 40, 40), 'STORYBOARD §7 worm\'s-eye (board)', True),
    ('S4', 0.82, 0.82, (210, 40, 40), 'CINEMATIC S4 breather', True),
]
THIRDS = (640, 1280)                  # LIFE §2
V2_SKY_END = (598, 748, 620)          # measured here on the v2 baseline frames (min, max, median), y where the sky ends

V2_THREAD = [('W', 860, 700, 150, 170), ('M', 335, 785, 133, 164)]   # v2 THROUGHLINE §1 (centre, size)
V2_PIP = [(700, 1235), (590, 1050), (470, 1218), (415, 1120), (360, 1410), (700, 1205), (450, 1205)]  # v2 THROUGHLINE §3
V3_O1_WINDOW = (180, 630, 900, 1060)  # v3 camera_plan_g3 O1 (horizon inside at y 950)
YOU_HEAD_TOP = (1380, 1560)           # LIFE_AND_DENSITY §4: the foreground "you", head 90-140 px, cut by the bottom
CROP_45 = (0, 285, 1080, 1635)        # v2 POSTING_KIT (1080 x 1350 centre crop)
CROP_34 = (0, 240, 1080, 1680)        # v2 POSTING_KIT; v3 POSTING (1080 x 1440)
COVER_TITLES = [('v1', 85, 311, 925, 538), ('v2', 124, 312, 953, 576), ('v3', 163, 333, 878, 615)]  # measured here


def font(size, bold=False):
    return ImageFont.truetype(FONTB if bold else FONT, size)


def dashed_line(d, p0, p1, fill, width=2, dash=12, gap=8):
    (x0, y0), (x1, y1) = p0, p1
    length = ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5
    if length == 0:
        return
    ux, uy = (x1 - x0) / length, (y1 - y0) / length
    t = 0.0
    while t < length:
        t1 = min(t + dash, length)
        d.line([(x0 + ux * t, y0 + uy * t), (x0 + ux * t1, y0 + uy * t1)], fill=fill, width=width)
        t = t1 + gap


def dashed_rect(d, box, fill, width=2, dash=12, gap=8):
    x0, y0, x1, y1 = box
    for a, b in (((x0, y0), (x1, y0)), ((x1, y0), (x1, y1)), ((x1, y1), (x0, y1)), ((x0, y1), (x0, y0))):
        dashed_line(d, a, b, fill, width, dash, gap)


def hatch(d, box, fill, step=14, width=1):
    x0, y0, x1, y1 = box
    for k in range(int(x0 - (y1 - y0)), int(x1), step):
        # a 45-degree line clipped to the box
        ax, ay = k, y1
        bx, by = k + (y1 - y0), y0
        if ax < x0:
            ay -= (x0 - ax); ax = x0
        if bx > x1:
            by += (bx - x1); bx = x1
        if ax <= bx:
            d.line([(ax, ay), (bx, by)], fill=fill, width=width)


def label(d, xy, text, size=17, fill=(30, 30, 30), bold=False, bg=(255, 255, 255, 210), anchor='la'):
    f = font(size, bold)
    l, t, r, b = d.textbbox(xy, text, font=f, anchor=anchor)
    d.rectangle([l - 4, t - 3, r + 4, b + 3], fill=bg)
    d.text(xy, text, font=f, fill=fill, anchor=anchor)


class Panel:
    """One 1080 x 1920 frame drawn at scale S onto the sheet at (ox, oy)."""

    def __init__(self, sheet, ox, oy, title):
        self.sheet, self.ox, self.oy = sheet, ox, oy
        self.layer = Image.new('RGB', (PW, PH), (251, 247, 240))   # RGB + an RGBA draw = alpha blending
        self.d = ImageDraw.Draw(self.layer, 'RGBA')
        for y in range(0, H + 1, 100):   # a faint 100 px grid
            self.d.line([(0, y * S), (PW, y * S)], fill=(225, 218, 205, 255), width=1)
        for x in range(0, W + 1, 100):
            self.d.line([(x * S, 0), (x * S, PH)], fill=(225, 218, 205, 255), width=1)
        self.title = title

    def box(self, b):
        return [b[0] * S, b[1] * S, b[2] * S, b[3] * S]

    def pt(self, x, y):
        return (x * S, y * S)

    def fill(self, b, rgba):
        self.d.rectangle(self.box(b), fill=rgba)

    def finish(self):
        dd = ImageDraw.Draw(self.layer)
        dd.rectangle([0, 0, PW - 1, PH - 1], outline=(40, 40, 40), width=2)
        self.sheet.paste(self.layer, (self.ox, self.oy))
        sd = ImageDraw.Draw(self.sheet)
        sd.text((self.ox, self.oy - 44), self.title, font=font(26, True), fill=(20, 20, 20))
        # y ticks (left) every 200 px, x ticks (bottom) at the zone edges
        for y in range(0, H + 1, 200):
            sd.line([(self.ox - 8, self.oy + y * S), (self.ox, self.oy + y * S)], fill=(60, 60, 60), width=1)
            sd.text((self.ox - 12, self.oy + y * S), str(y), font=font(13), fill=(60, 60, 60), anchor='rm')
        for x in (0, 120, 380, 540, 700, 880, 1080):
            sd.line([(self.ox + x * S, self.oy + PH), (self.ox + x * S, self.oy + PH + 8)], fill=(60, 60, 60), width=1)
            sd.text((self.ox + x * S, self.oy + PH + 10), str(x), font=font(13), fill=(60, 60, 60), anchor='ma')


def panel_zones(p):
    d = p.d
    p.fill(TOP_GUTTER, (214, 232, 245, 255))
    p.fill(CAPTION_BAND, (251, 231, 160, 255))
    p.fill(READ_ZONE, (205, 232, 200, 255))
    p.fill(BOTTOM_THIRD, (234, 219, 200, 255))
    p.fill((0, 600, READ_ZONE[0], 1250), (232, 236, 226, 255))
    p.fill((READ_ZONE[2], 600, 1080, 1250), (232, 236, 226, 255))
    # the caption block, its clip window (a third range, red) and baselines with sample captions
    d.rectangle(p.box(CAPTION_BLOCK), outline=(214, 120, 20), width=3)
    dashed_rect(d, p.box(CAPTION_CLIP), (205, 40, 40, 255), width=2, dash=8, gap=6)
    f = font(int(98 * S * 0.62))
    for y, text in zip(BASELINES, ('Captions pop', 'in place, 2 lines')):
        d.line([p.pt(95, y), p.pt(945, y)], fill=(214, 120, 20, 160), width=1)
        d.text(p.pt(520, y), text, font=f, fill=(43, 27, 10), anchor='ms')
    # subject axis inside the read zone
    for x in SUBJECT_AXIS:
        dashed_line(d, p.pt(x, 600), p.pt(x, 1250), (40, 90, 200, 255), width=2)
    # key-action boxes: the doc's (dark green, dashed) and the code's (red, dotted)
    dashed_rect(d, p.box(KEY_ACTION_DOC), (20, 110, 40, 255), width=3, dash=14, gap=8)
    dashed_rect(d, p.box(KEY_ACTION_CODE), (205, 40, 40, 255), width=2, dash=4, gap=6)
    # side margins
    for x in (SIDE_MARGIN, W - SIDE_MARGIN):
        dashed_line(d, p.pt(x, 180), p.pt(x, 1520), (130, 60, 160, 255), width=1, dash=6, gap=6)
    # platform UI (organic): grey hatch
    for b in UI_ORGANIC:
        p.fill(b[:4], (120, 120, 120, 60))
        hatch(d, p.box(b[:4]), (90, 90, 90, 150), step=10)
    # the ad overlay (a boosted post): red dashed
    poly = [p.pt(x, y) for x, y in AD_RAIL]
    for a, b in zip(poly, poly[1:] + poly[:1]):
        dashed_line(d, a, b, (205, 40, 40, 255), width=3)
    dashed_line(d, p.pt(0, AD_BOTTOM_Y), p.pt(780, AD_BOTTOM_Y), (205, 40, 40, 255), width=3)
    # paper edges (opt-in): sides from y 640 and the bottom
    for x in (3, W - 3):
        d.line([p.pt(x, PAPER_EDGE_FROM_Y), p.pt(x, H)], fill=(150, 100, 60, 255), width=4)
    d.line([p.pt(0, H - 3), p.pt(W, H - 3)], fill=(150, 100, 60, 255), width=4)
    # small boxes
    d.rectangle(p.box(CREDIT_TAB), outline=(110, 80, 50), width=2)
    d.rectangle(p.box(DRAFT_LABEL), outline=(110, 80, 50), width=2)
    # labels
    label(d, p.pt(10, 8), 'top UI  y < 180 (TikTok ad 240-288)', 15)
    label(d, p.pt(560, 200), 'top gutter y 0-290: framing only', 15)
    label(d, p.pt(70, 195), 'credit tab y 185-288 (v2)', 13)
    label(d, p.pt(10, 296), 'CAPTION BAND y 290-600 (one flat field)', 15, bold=True)
    label(d, p.pt(10, 566), 'block 317-556 x 95-945 | red: clip 280-570', 13, fill=(160, 30, 30))
    label(d, p.pt(140, 610), 'READ ZONE y 600-1250, x 120-880', 15, bold=True)
    label(d, p.pt(392, 1040), 'subject axis', 14, fill=(40, 90, 200))
    label(d, p.pt(392, 1072), 'x 380-700', 14, fill=(40, 90, 200))
    label(d, p.pt(140, 1180), 'key action (doc) x 120-950, y 600-1480', 13, fill=(20, 110, 40))
    label(d, p.pt(10, 1262), 'ad bottom (35 %): y > 1250', 14, fill=(160, 30, 30))
    label(d, p.pt(10, 1300), 'BOTTOM THIRD y 1250-1920: masses only', 15, bold=True)
    label(d, p.pt(10, 1338), '(foreground cut by the bottom edge)', 13)
    label(d, p.pt(10, 1450), 'red dotted: code safe.action x 90-990, y 200-1480', 13, fill=(160, 30, 30))
    label(d, p.pt(10, 1530), 'bottom UI  y > 1520', 15)
    label(d, p.pt(796, 850), 'ad rail', 14, fill=(160, 30, 30))
    label(d, p.pt(796, 878), 'x > 780', 14, fill=(160, 30, 30))
    label(d, p.pt(796, 906), 'from y 840', 14, fill=(160, 30, 30))
    label(d, p.pt(958, 1180), 'rail', 13)
    label(d, p.pt(958, 1206), 'x>950', 13)
    label(d, p.pt(10, 1862), 'draft label (not in masters)', 12)
    label(d, p.pt(10, 700), 'paper edge', 12, fill=(120, 80, 40))
    label(d, p.pt(10, 724), 'sides from', 12, fill=(120, 80, 40))
    label(d, p.pt(10, 748), 'y 640', 12, fill=(120, 80, 40))
    label(d, p.pt(128, 1420), '120 px side margins', 12, fill=(130, 60, 160))


def panel_lines(p):
    d = p.d
    lo, hi, med = V2_SKY_END
    p.fill((0, lo, W, hi), (190, 225, 210, 150))
    d.line([p.pt(0, med), p.pt(W, med)], fill=(60, 140, 110, 255), width=2)
    label(d, p.pt(560, hi + 6), f'v2 measured: sky ends y {lo}-{hi}', 13, fill=(40, 110, 80))
    for y in THIRDS:
        dashed_line(d, p.pt(0, y), p.pt(W, y), (120, 120, 120, 255), width=2, dash=10, gap=8)
        label(d, p.pt(W - 8, y - 4), f'third y {y}', 13, fill=(90, 90, 90), anchor='rs')
    p.fill(CAPTION_BAND, (251, 231, 160, 140))
    n = len(HORIZONS)
    xs = [70 + i * (940 / (n - 1)) for i in range(n)]
    for (code, a, b, col, _src, flag), x in zip(HORIZONS, xs):
        y0, y1 = a * H, b * H
        if y1 - y0 < 6:
            d.line([p.pt(x - 40, y0), p.pt(x + 40, y0)], fill=col + (255,), width=5)
        else:
            d.rectangle([p.pt(x - 16, y0), p.pt(x + 16, y1)], fill=col + (255,))
        d.line([p.pt(x, y1), p.pt(x, y1 + 26)], fill=col + (255,), width=1)
        frac = f'{a:.2f} H' if a == b else f'{a:.2f}-{b:.2f}'
        label(d, p.pt(x, y1 + 30), code, 13, fill=(205, 40, 40) if flag else (20, 20, 20), bold=True, anchor='ma')
        label(d, p.pt(x, y1 + 58), frac, 11, fill=(205, 40, 40) if flag else (40, 40, 40), anchor='ma')
    label(d, p.pt(10, 300), 'horizon y by shot type (bars: ranges)', 15, bold=True)
    label(d, p.pt(10, 1700), 'red = disagrees with another doc or', 13, fill=(160, 30, 30))
    label(d, p.pt(10, 1724), 'puts a figure under the UI (layout.md §6)', 13, fill=(160, 30, 30))
    # the UI zones as a reminder
    for b in UI_ORGANIC:
        hatch(d, p.box(b[:4]), (90, 90, 90, 120), step=12)


def panel_across(p):
    d = p.d
    p.fill(CAPTION_BAND, (251, 231, 160, 140))
    # outside the 4:5 crop, greyed
    p.fill((0, 0, W, CROP_45[1]), (90, 90, 90, 45))
    p.fill((0, CROP_45[3], W, H), (90, 90, 90, 45))
    dashed_rect(d, p.box(CROP_34), (0, 160, 220, 255), width=3, dash=14, gap=8)
    dashed_rect(d, p.box((2, CROP_45[1], W - 2, CROP_45[3])), (200, 0, 200, 255), width=3, dash=14, gap=8)
    label(d, p.pt(10, CROP_34[1] - 34), 'grid 3:4 y 240-1680', 13, fill=(0, 120, 170))
    label(d, p.pt(600, CROP_45[1] - 34), 'grid 4:5 y 285-1635', 13, fill=(160, 0, 160))
    styles = {'v1': (12, 6), 'v2': (20, 0), 'v3': (4, 4)}
    for name, x0, y0, x1, y1 in COVER_TITLES:
        dash, gap = styles[name]
        if gap == 0:
            d.rectangle(p.box((x0, y0, x1, y1)), outline=(60, 60, 60), width=2)
        else:
            dashed_rect(d, p.box((x0, y0, x1, y1)), (60, 60, 60, 255), width=2, dash=dash, gap=gap)
    label(d, p.pt(95, 318), 'cover titles v1 / v2 / v3 (measured)', 13)
    label(d, p.pt(95, 344), 'y 311-615, all in the caption band', 13)
    # v3 O1 window
    d.rectangle(p.box(V3_O1_WINDOW), outline=(40, 90, 200), width=2)
    label(d, p.pt(190, 1000), 'v3 O1 window (frame 0)', 12, fill=(40, 90, 200))
    # v2 thread home spots + the B-match tolerance (spot +-8 % of the frame, size +-20 %)
    for name, cx, cy, w, h in V2_THREAD:
        tx, ty = 0.08 * W, 0.08 * H
        p.fill((cx - tx, cy - ty, cx + tx, cy + ty), (255, 170, 60, 70))
        d.rectangle(p.box((cx - w / 2, cy - h / 2, cx + w / 2, cy + h / 2)), outline=(200, 110, 20), width=3)
        label(d, p.pt(cx, cy), name, 15, fill=(160, 80, 10), bold=True, anchor='mm')
    label(d, p.pt(560, 870), 'v2 thread spots W, M;', 12, fill=(160, 80, 10))
    label(d, p.pt(560, 892), 'shaded: B match +-8 %', 12, fill=(160, 80, 10))
    # v2 Pip seats: history (Pip hides since 2026-10-28)
    for x, y in V2_PIP:
        r = 9
        d.ellipse([p.pt(x - r * 1.6, y - r * 1.6), p.pt(x + r * 1.6, y + r * 1.6)], outline=(120, 100, 180), width=2)
    label(d, p.pt(560, 1300), 'o v2 Pip seats y 1050-1410', 12, fill=(100, 80, 160))
    label(d, p.pt(560, 1322), '(history: Pip hides now)', 12, fill=(100, 80, 160))
    label(d, p.pt(92, 1446), 'Pip now: hidden in a world spot, ~40-90 px;', 12, fill=(100, 80, 160))
    label(d, p.pt(92, 1468), 'never in the band, the rail or over the subject', 12, fill=(100, 80, 160))
    # the "you": head top y 1380-1560 (LIFE_AND_DENSITY §4) crosses the bottom UI line (layout.md §6)
    y0, y1 = YOU_HEAD_TOP
    d.rectangle([p.pt(40, y0), p.pt(80, y1)], fill=(205, 40, 40, 200))
    label(d, p.pt(92, 1336), "the 'you': head top y 1380-1560", 12, fill=(160, 30, 30))
    label(d, p.pt(92, 1358), '(LIFE §4) crosses y 1520', 12, fill=(160, 30, 30))
    for b in UI_ORGANIC:
        hatch(d, p.box(b[:4]), (90, 90, 90, 120), step=12)


def legend(sheet, x, y, w):
    d = ImageDraw.Draw(sheet)
    rows = [
        ('Panel 1', 'grey hatch = platform UI (organic: G5_BLOCKING §2, theme.ts safe, framecheck); red dashed = the ad overlay of a boosted post (vertical.md §2: bottom 35 %, rail x > 780 from y 840; G5 §2, COZY §5, v2 STYLE §7).'),
        ('', 'yellow = the caption band y 290-600 (DIRECTION 10; G5 §2; STORYBOARD §3; LIFE §8); orange box = the caption block y 317-556, x 95-945, baselines 387 / 510 (COZY, CINEMATIC, sky.tsx, CRAFT §g, theme.ts); red dashed box = the roll/clip window 280-570 (theme.ts, ENGINE, capcheck).'),
        ('', 'green = the read zone y 600-1250, x 120-880 (STORYBOARD §3; vertical.md; COZY §5); blue = the subject axis x 380-700; dark green dashed = key action x 120-950, y 600-1480 (G5 §2); red dotted = the code\'s safe.action x 90-990, y 200-1480 (theme.ts).'),
        ('Panel 2', 'horizon ranges by shot type: K10 high angle, S1 landing (= the engine default 768), roof VISTA (COZY §5), S5 end, STREET (COZY §2), EYE-height scale (COZY §5), K7 worm\'s-eye, S3 big sky, WORM (the board\'s worm\'s-eye), S4 breather. Red = in dispute or puts a figure under the UI.'),
        ('Panel 3', 'the profile-grid crops (v2 POSTING_KIT, v3 POSTING), the three covers\' titles (measured here), v2\'s thread home spots W, M with the B-match tolerance (CRAFT §a), v2\'s Pip seats (THROUGHLINE; retired 2026-10-28: Pip hides), v3\'s O1 window.'),
    ]
    f = font(17)
    fb = font(17, True)
    cy = y
    for head, text in rows:
        if head:
            d.text((x, cy), head, font=fb, fill=(20, 20, 20))
        words, line, lines = text.split(), '', []
        for wd in words:
            t = (line + ' ' + wd).strip()
            if d.textlength(t, font=f) > w - 110:
                lines.append(line); line = wd
            else:
                line = t
        lines.append(line)
        for ln in lines:
            d.text((x + 100, cy), ln, font=f, fill=(40, 40, 40))
            cy += 24
        cy += 8
    return cy


def measure():
    """Print (1) where the flat sky ends in each baseline frame (half-size film frames: the first row below y 300,
    full res, where > 25 % of the row's pixels sit > 18 RGB from the row median for 6 rows, the caption ink and the
    peach highlight box masked and dilated); (2) the cover titles' ink lines and box (ink #2B1B0A within 60 RGB,
    box #F6B892 within 25, searched in x 60-1020, y 250-640)."""
    import glob
    import numpy as np
    from PIL import ImageFilter
    base = 'docs/studies/2026-10-28_city_posters/baseline'
    ink_rgb, box_rgb = np.array([0x2B, 0x1B, 0x0A], np.float32), np.array([0xF6, 0xB8, 0x92], np.float32)
    for path in sorted(glob.glob(os.path.join(base, 'v*_t*.jpg'))):
        im = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)
        h, w, _ = im.shape
        cap = (np.sqrt(((im - box_rgb) ** 2).sum(axis=2)) < 45) | (im.mean(axis=2) < 120)
        cap = np.asarray(Image.fromarray((cap * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(7))) > 0
        prof = np.zeros(h)
        for y in range(h):
            keep = ~cap[y]
            if keep.sum() >= 0.3 * w:
                r = im[y][keep]
                prof[y] = float((np.sqrt(((r - np.median(r, axis=0)) ** 2).sum(axis=1)) > 18).mean())
        end = next((y for y in range(150, h - 6) if (prof[y:y + 6] > 0.25).all()), None)
        print(f'{os.path.basename(path):26s} sky ends at full-res y ~{end * 2 if end else None}')
    covers = {'v1': 'deliverables/cover.png', 'v2': 'deliverables/v2/v2r_cover.png', 'v3': 'deliverables/v3/cover.png'}
    y0, y1, x0, x1 = 250, 640, 60, 1020
    for name, path in covers.items():
        sub = np.asarray(Image.open(path).convert('RGB')).astype(np.float32)[y0:y1, x0:x1]
        ink = np.sqrt(((sub - ink_rgb) ** 2).sum(axis=2)) < 60
        rows = np.where(ink.sum(axis=1) > 15)[0]
        lines, start = [], None
        for i, r in enumerate(rows):
            if start is None:
                start = r
            if i + 1 == len(rows) or rows[i + 1] - r > 12:
                lines.append((int(start + y0), int(r + y0))); start = None
        cols = np.where(ink.sum(axis=0) > 3)[0]
        brow = np.where((np.sqrt(((sub - box_rgb) ** 2).sum(axis=2)) < 25).sum(axis=1) > 60)[0]
        print(f'{name} cover: ink lines {lines}, ink x {int(cols.min() + x0)}-{int(cols.max() + x0)}, '
              f'box y {int(brow.min() + y0)}-{int(brow.max() + y0)}')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', default='docs/studies/2026-10-28_city_posters/img/layout_zones.jpg')
    ap.add_argument('--measure', action='store_true', help='print the measured numbers instead of drawing')
    a = ap.parse_args()
    if a.measure:
        measure()
        return
    margin, gap, top = 70, 60, 150
    sw = margin * 2 + PW * 3 + gap * 2
    sh = top + PH + 50 + 330
    sheet = Image.new('RGB', (sw, sh), (255, 255, 255))
    d = ImageDraw.Draw(sheet)
    d.text((margin, 20), 'Our 9:16 frame (1080 x 1920): every layout zone the docs define, with its numbers',
           font=font(30, True), fill=(20, 20, 20))
    d.text((margin, 58), 'City-poster study, layout.md section 1 (Part A: what we already decided). Red = two docs disagree.',
           font=font(18), fill=(70, 70, 70))
    ps = [Panel(sheet, margin + i * (PW + gap), top, t) for i, t in
          enumerate(('1. Screen zones', '2. Horizons and lines', '3. Across shots, the cover'))]
    panel_zones(ps[0]); panel_lines(ps[1]); panel_across(ps[2])
    for p in ps:
        p.finish()
    legend(sheet, margin, top + PH + 46, sw - 2 * margin)
    os.makedirs(os.path.dirname(a.out) or '.', exist_ok=True)
    sheet.save(a.out, quality=90)
    print(a.out, sheet.size)


if __name__ == '__main__':
    main()
