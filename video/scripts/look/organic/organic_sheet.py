"""organic_sheet.py: the organic proof's numbers and sheet (docs/look/organic/organic_proof.png, organic_proof.md).
  - the three numbers of techniques.md section 1 (crisp edges, straight, dead-flat), the same method (JPEG q85 at the
    phone's width), on the whole still and on each piece's crop, v6 against the organic frame;
  - the shapes lane's measures (shapes_measure.measure_crop: compass arcs, straight, ruler lines, right angles, crisp
    and lost edges, broken mass edges, mirror symmetry, the clear-geometry density, the divider dimension) on the
    shapes lane's own crops of the four pieces, so the numbers sit beside shapes.md section 2's;
  - the sheet: each piece v6 beside the new one at full size (1:1) and at 400 px (the phone's width), then the whole
    frame before and after; her, Pip and the captions are the scene's own in both (crisp).
Reads the renders (render_inputs.sh) and writes docs/look/organic/organic_proof.png + organic_proof_metrics.json."""
from __future__ import annotations

import json
import os
import sys

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import oc_lib as L  # noqa: E402

sys.path.insert(0, L.ORG_DOCS)

R = os.path.join(L.SCRATCH, 'renders')
OUT_PNG = os.path.join(L.ORG_DOCS, 'organic_proof.png')
OUT_JSON = os.path.join(L.ORG_DOCS, 'organic_proof_metrics.json')
FONT_DIR = '/usr/share/fonts/opentype/inter/'

# display windows (frame px x0, y0, x1, y1) and the shapes lane's measuring crops (shapes_crops.py, ours_*)
PIECES = [
    ('cloud', 'The near cumulus', (560, 0, 1080, 345), (640, 0, 1080, 330),
     "v6's own painting repainted: a FastNoiseLite warp at the cloud octaves (every billow's arc and the disc's arc a free "
     "curve), the outline re-cut at the cloud octaves, found and crisp toward the low sun, lost along the base and the shade "
     "side, then MyPaint flat-brush marks along the billows (far = the most brush)"),
    ('tree', 'The near tree', (0, 1226, 380, 1550), (0, 1250, 310, 1530),
     "a new crown at v6's place: a body, 4 lobes on a ladder, clumps half sunk (three levels, no confetti), lit as one form "
     "with a dark flat underside; leafy found edge toward the light, the shade side broken by dark leaves (never blurred); "
     "fewer, bigger MyPaint dabs; a bowed, tapered trunk"),
    ('facade', 'The facade by the doorway', (300, 580, 900, 1100), (330, 590, 1080, 1080),
     "v6's exact wing (the engine's flat render): a sub-pixel hand-ruled bow, each pane its own reflection and glow (no "
     "template), light moving inside every face, blocky flat-brush marks along the piers and bands, lost edges brushed "
     "over between faces of close value; the door, the fascia and W left as holes (the scene's own, crisp: the focus)"),
    ('paving', 'The paving of our bank', (200, 1300, 840, 1900), (300, 1280, 1080, 1540),
     "v6's treads and flags with the scene's colours: joints broken into pieces with lost gaps and faded ends, each flag its "
     "own value, the bank lit toward the sun, MyPaint strokes along the treads sized by perspective, the nosings brushed "
     "across where the values meet; the props' shadows recovered from the engine and given natural outlines"),
]


def font(size, weight='Regular'):
    for f in (FONT_DIR + 'Inter-%s.otf' % weight, '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            continue
    return ImageFont.load_default()


def load_rgb8(path):
    return cv2.imread(path)[..., ::-1].copy()


# ------------------------------------------------------------------------------------------- the numbers

def three_numbers(rgb8, box=None):
    """techniques.md section 1, the same code (techniques_demo.measure): crisp edges, soft edges, straight, flat31,
    on the whole image or inside one box (the edges found on the whole image, counted inside the box)."""
    im = cv2.cvtColor(rgb8, cv2.COLOR_RGB2BGR)
    im = cv2.imdecode(cv2.imencode('.jpg', im, [cv2.IMWRITE_JPEG_QUALITY, 85])[1], 1)
    Lc = cv2.cvtColor(im.astype(np.float32) / 255.0, cv2.COLOR_BGR2Lab)[..., 0]
    valid = np.ones(Lc.shape, np.uint8)
    if box:
        valid[:] = 0
        x0, y0, x1, y1 = box
        valid[y0:y1, x0:x1] = 1
    valid = cv2.erode(valid, np.ones((9, 9), np.uint8)).astype(bool) if not box else valid.astype(bool)
    Ls = cv2.GaussianBlur(Lc, (0, 0), 0.7)
    g = np.hypot(cv2.Sobel(Ls, cv2.CV_32F, 1, 0, ksize=3), cv2.Sobel(Ls, cv2.CV_32F, 0, 1, ksize=3)) / 8.0
    step = cv2.dilate(Lc, np.ones((9, 9), np.uint8)) - cv2.erode(Lc, np.ones((9, 9), np.uint8))
    can = cv2.Canny(np.clip(Lc * 2.55, 0, 255).astype(np.uint8), 20, 50, L2gradient=True) > 0
    E = can & (step >= 8.0) & valid
    width = step[E] / np.maximum(g[E], 1e-3)
    crisp, soft = float((width < 3.0).mean()), float((width >= 4.5).mean())
    em = (E * 255).astype(np.uint8)
    lines = cv2.HoughLinesP(em, 1, np.pi / 360, 40, minLineLength=60, maxLineGap=3)
    lm = np.zeros_like(em)
    if lines is not None:
        for lx0, ly0, lx1, ly1 in lines.reshape(-1, 4):
            cv2.line(lm, (int(lx0), int(ly0)), (int(lx1), int(ly1)), 255, 3)
    straight = float(((lm > 0) & E).sum() / max(E.sum(), 1))
    interior = valid & (cv2.dilate(can.astype(np.uint8), np.ones((9, 9), np.uint8)) == 0)
    n1 = cv2.blur(Lc, (31, 31))
    n2 = cv2.blur(Lc * Lc, (31, 31))
    flat31 = float((np.sqrt(np.maximum(n2 - n1 * n1, 0))[interior] < 0.35).mean())
    return dict(crisp=round(crisp, 4), soft=round(soft, 4), straight=round(straight, 4), flat31=round(flat31, 4),
                edge_density=round(float(E.sum() / max(valid.sum(), 1)), 4))


def shapes_numbers(rgb8, box):
    import shapes_lib as S
    import shapes_measure as M
    rgb = S.normalize_image(cv2.cvtColor(rgb8, cv2.COLOR_RGB2BGR))
    x0, y0, x1, y1 = box
    out, _ = M.measure_crop(rgb[y0:y1, x0:x1])
    e, w, m = out['edges'], out['edge_width'], out['mass_edges']
    nan = lambda v: None if v is None or (isinstance(v, float) and not np.isfinite(v)) else round(float(v), 4)
    return dict(arcs=nan(e['arc']), straight=nan(e['straight']), ruler=nan(e['long']), free=nan(e['free']),
                right_angles=nan(e['right_angle']), corners_per_100px=nan(e['corners_per_100px']),
                crisp_visible=nan(w['crisp']), median_width_px=nan(w['median_width']), lost_mass=nan(m['lost']),
                broken_mass=nan(m['busy']), symmetry=nan(out['symmetry']['median']),
                clear_geometric=nan(out['clear'].get('geometric_density')), divider_D=nan(out['divider_D']))


def measure(v6, after):
    res = {'frame': {'v6': three_numbers(v6), 'organic': three_numbers(after)}, 'pieces': {}}
    for key, title, disp, sbox, _ in PIECES:
        res['pieces'][key] = {
            'three': {'v6': three_numbers(v6, disp), 'organic': three_numbers(after, disp)},
            'shapes': {'v6': shapes_numbers(v6, sbox), 'organic': shapes_numbers(after, sbox)},
            'display_box': disp, 'shapes_box': sbox}
        print(key, res['pieces'][key]['three'], res['pieces'][key]['shapes'])
    return res


# --------------------------------------------------------------------------------------------- the sheet

def pct(v):
    return '-' if v is None else f'{v * 100:.0f} %'


def make_sheet(v6, after, res, out_path=OUT_PNG):
    BG = (250, 249, 246)
    INK = (34, 32, 38)
    DIM = (110, 106, 116)
    PH = 400 / 1080.0
    f_t, f_h, f_b, f_s = font(40, 'SemiBold'), font(27, 'SemiBold'), font(21), font(19)
    rows = []
    W = 2300
    pad = 30

    def text_block(lines, width, fnt, fill=INK, lh=1.35):
        img = Image.new('RGB', (width, 10), BG)
        d = ImageDraw.Draw(img)
        out = []
        for ln in lines:
            words, cur = ln.split(' '), ''
            for wd in words:
                t = (cur + ' ' + wd).strip()
                if d.textlength(t, font=fnt) > width:
                    out.append(cur)
                    cur = wd
                else:
                    cur = t
            out.append(cur)
        h = int(len(out) * fnt.size * lh) + 6
        img = Image.new('RGB', (width, h), BG)
        d = ImageDraw.Draw(img)
        for i, t in enumerate(out):
            d.text((0, int(i * fnt.size * lh)), t, font=fnt, fill=fill)
        return img

    # the title
    head = text_block(["Organic proof: four v6 pieces repainted so they stop reading \"square and proper\""], W - 2 * pad, f_t)
    sub = text_block(["Scene 1 of v2 (\"She quit Google.\"), 1.0 s, rendered by the engine (src/look/organic_s1: each piece one baked image in "
                      "its own plane's slot; her, Pip, the props and the captions are the scene's own, drawn over it, untouched). "
                      "Per piece: v6 | organic at full size (1:1), then both at 400 px wide (the phone), and the numbers on the shapes "
                      "lane's crop (arcs, straight and ruler lines, crisp visible edges, lost and broken mass edges, symmetry; "
                      "references' targets in brackets, shapes.md section 6)."], W - 2 * pad, f_b, DIM)
    rows += [head, sub]
    targets = {'cloud': dict(arcs='<= 10', ruler='<= 5', crisp_visible='15-40', lost_mass='15-25', broken_mass='>= 20'),
               'tree': dict(arcs='<= 5', ruler='<= 3', crisp_visible='<= 30', lost_mass='>= 7', broken_mass='>= 35'),
               'facade': dict(arcs='-', ruler='<= 15', crisp_visible='<= 60', lost_mass='2-5', broken_mass='>= 40'),
               'paving': dict(arcs='-', ruler='<= 15', crisp_visible='<= 45', lost_mass='>= 10', broken_mass='>= 40')}
    for key, title, disp, sbox, how in PIECES:
        x0, y0, x1, y1 = disp
        a = v6[y0:y1, x0:x1]
        b = after[y0:y1, x0:x1]
        sa = cv2.resize(a, None, fx=PH, fy=PH, interpolation=cv2.INTER_AREA)
        sb = cv2.resize(b, None, fx=PH, fy=PH, interpolation=cv2.INTER_AREA)
        S6, SO = res['pieces'][key]['shapes']['v6'], res['pieces'][key]['shapes']['organic']
        T6, TO = res['pieces'][key]['three']['v6'], res['pieces'][key]['three']['organic']
        tg = targets[key]
        lines = [f"{'':18s}{'v6':>8s}{'organic':>10s}  refs",
                 f"{'compass arcs':18s}{pct(S6['arcs']):>8s}{pct(SO['arcs']):>10s}  {tg['arcs']}",
                 f"{'straight':18s}{pct(S6['straight']):>8s}{pct(SO['straight']):>10s}",
                 f"{'ruler lines':18s}{pct(S6['ruler']):>8s}{pct(SO['ruler']):>10s}  {tg['ruler']}",
                 f"{'right angles':18s}{pct(S6['right_angles']):>8s}{pct(SO['right_angles']):>10s}",
                 f"{'crisp visible':18s}{pct(S6['crisp_visible']):>8s}{pct(SO['crisp_visible']):>10s}  {tg['crisp_visible']}",
                 f"{'lost mass edges':18s}{pct(S6['lost_mass']):>8s}{pct(SO['lost_mass']):>10s}  {tg['lost_mass']}",
                 f"{'broken mass edges':18s}{pct(S6['broken_mass']):>8s}{pct(SO['broken_mass']):>10s}  {tg['broken_mass']}",
                 f"{'mirror symmetry':18s}{S6['symmetry'] or 0:>8.2f}{SO['symmetry'] or 0:>10.2f}  <= 0.65",
                 f"{'clear geometry':18s}{S6['clear_geometric'] or 0:>8.0f}{SO['clear_geometric'] or 0:>10.0f}",
                 '',
                 'techniques.md 1, this window:',
                 f"{'razor edges':18s}{pct(T6['crisp']):>8s}{pct(TO['crisp']):>10s}",
                 f"{'straight (Hough)':18s}{pct(T6['straight']):>8s}{pct(TO['straight']):>10s}",
                 f"{'dead-flat area':18s}{pct(T6['flat31']):>8s}{pct(TO['flat31']):>10s}"]
        mono = font(19, 'Medium')
        try:
            mono = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 18)
        except OSError:
            pass
        num = text_block(lines, 470, mono, INK, 1.32)
        gap = 14
        big_w = a.shape[1] * 2 + gap
        # 1:1 pair, then the 400 px pair stacked, then the numbers
        cell_h = max(a.shape[0], sa.shape[0] * 2 + gap + 30, num.height)
        row = Image.new('RGB', (W - 2 * pad, cell_h + 70), BG)
        d = ImageDraw.Draw(row)
        d.text((0, 0), title, font=f_h, fill=INK)
        cap = text_block([how], W - 2 * pad - 10, f_s, DIM)
        row.paste(cap, (0, 36))
        top = 36 + cap.height + 4
        row = row.resize((W - 2 * pad, top + cell_h + 30))
        row = Image.new('RGB', (W - 2 * pad, top + cell_h + 34), BG)
        d = ImageDraw.Draw(row)
        d.text((0, 0), title, font=f_h, fill=INK)
        row.paste(cap, (0, 36))
        xa = 0
        row.paste(Image.fromarray(a), (xa, top + 24))
        row.paste(Image.fromarray(b), (xa + a.shape[1] + gap, top + 24))
        d.text((xa, top), 'v6, full size', font=f_s, fill=DIM)
        d.text((xa + a.shape[1] + gap, top), 'organic, full size', font=f_s, fill=DIM)
        xs = xa + big_w + 28
        d.text((xs, top), '400 px wide (phone)', font=f_s, fill=DIM)
        row.paste(Image.fromarray(sa), (xs, top + 24))
        row.paste(Image.fromarray(sb), (xs, top + 24 + sa.shape[0] + gap))
        d.text((xs + sa.shape[1] + 8, top + 24), 'v6', font=f_s, fill=DIM)
        d.text((xs + sa.shape[1] + 8, top + 24 + sa.shape[0] + gap), 'organic', font=f_s, fill=DIM)
        xn = max(xs + sa.shape[1] + 100, W - 2 * pad - num.width)
        row.paste(num, (xn, top + 24))
        rows.append(row)
    # the whole frame, before and after: at 540 px (half size) and at the phone's 400 px
    half = [cv2.resize(x, (540, 960), interpolation=cv2.INTER_AREA) for x in (v6, after)]
    ph = [cv2.resize(x, (400, 711), interpolation=cv2.INTER_AREA) for x in (v6, after)]
    fr = Image.new('RGB', (W - 2 * pad, 960 + 110), BG)
    d = ImageDraw.Draw(fr)
    d.text((0, 0), 'The whole frame: v6 | organic (half size), then both at 400 px (the phone)', font=f_h, fill=INK)
    Fv, Fo = res['frame']['v6'], res['frame']['organic']
    d.text((0, 38), (f"whole still (techniques.md 1): razor edges {pct(Fv['crisp'])} -> {pct(Fo['crisp'])}, straight {pct(Fv['straight'])} -> "
                     f"{pct(Fo['straight'])}, dead-flat {pct(Fv['flat31'])} -> {pct(Fo['flat31'])} (references: 0.3-4.6 %, 1-13 %, 0-20 %)"),
           font=f_s, fill=DIM)
    fr.paste(Image.fromarray(half[0]), (0, 80))
    fr.paste(Image.fromarray(half[1]), (560, 80))
    fr.paste(Image.fromarray(ph[0]), (1140, 80))
    fr.paste(Image.fromarray(ph[1]), (1560, 80))
    d.text((0, 80 + 966), 'v6', font=f_s, fill=DIM)
    d.text((560, 80 + 966), 'organic', font=f_s, fill=DIM)
    d.text((1140, 80 + 717), 'v6 at 400 px', font=f_s, fill=DIM)
    d.text((1560, 80 + 717), 'organic at 400 px', font=f_s, fill=DIM)
    rows.append(fr)
    foot = text_block(["Rerun: python3 scripts/look/organic/organic_proof.py (seeded: the same bytes on every run). Methods learned "
                       "from the references, never copied or traced; no reference is an input to any picture here."], W - 2 * pad, f_s, DIM)
    rows.append(foot)
    Ht = sum(r.height for r in rows) + pad * (len(rows) + 1)
    sheet = Image.new('RGB', (W, Ht), BG)
    y = pad
    for r_ in rows:
        sheet.paste(r_, (pad, y))
        y += r_.height + pad
    sheet.save(out_path, optimize=True)
    return sheet.size


def main():
    v6 = load_rgb8(os.path.join(R, 'v6_cap.png'))
    after = load_rgb8(os.path.join(R, 'after_cap.png'))
    res = measure(v6, after)
    bake = os.path.join(L.SCRATCH, 'pieces', 'bake_stats.json')
    if os.path.exists(bake):
        res['bake'] = json.load(open(bake))
    det = os.path.join(L.SCRATCH, 'determinism.json')
    if os.path.exists(det):
        res['determinism'] = json.load(open(det))
    cost = os.path.join(L.SCRATCH, 'cost.json')
    if os.path.exists(cost):
        res['render_cost'] = json.load(open(cost))
    json.dump(res, open(OUT_JSON, 'w'), indent=1)
    print('sheet', make_sheet(v6, after, res), '->', OUT_PNG)


if __name__ == '__main__':
    main()
