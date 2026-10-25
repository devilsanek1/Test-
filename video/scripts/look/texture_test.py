#!/usr/bin/env python3
"""Texture + line test (owner, 2026-10-25): a very subtle tone-on-tone halftone on the fills, and thin tapered ink lines
only in key places, vs flat and vs full outlines. Writes HTML pages (1080x1920 frames) for scripts/look/texture_shoot.cjs.

  python3 scripts/look/texture_test.py && node scripts/look/texture_shoot.cjs
Variants: A flat (current), B halftone 6 % + key lines, C halftone 10 % + key lines, D halftone 10 % + full outlines.
Palettes come from docs/look/palettes.json. Output pages: review/look/texture/*.html (+ motion.html for the push test)."""
import json, math, os, random

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
OUT = os.path.join(ROOT, 'review/look/texture')
PAL = {p['name'].split(' ')[0]: p for p in json.load(open(os.path.join(ROOT, 'docs/look/palettes.json')))['palettes']}
K = 3.0          # viewBox 360x640 -> 1080x1920
PITCH = 6.5 / K  # halftone pitch: ~6.5 px at 1080 wide (measured on the reference)


# ---- colour helpers (sRGB <-> CIE Lab, D65)
def _lin(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _gam(c):
    c = max(0.0, min(1.0, c))
    return 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055


def to_lab(h):
    r, g, b = (_lin(int(h[i:i + 2], 16) / 255) for i in (1, 3, 5))
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return 116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))


def from_lab(L, a, b):
    fy = (L + 16) / 116
    fx, fz = fy + a / 500, fy - b / 200
    inv = lambda t: t ** 3 if t ** 3 > 0.008856 else (t - 16 / 116) / 7.787
    x, y, z = inv(fx) * 0.95047, inv(fy), inv(fz) * 1.08883
    r = 3.2406 * x - 1.5372 * y - 0.4986 * z
    g = -0.9689 * x + 1.8758 * y + 0.0415 * z
    bb = 0.0557 * x - 0.2040 * y + 1.0570 * z
    return '#%02X%02X%02X' % tuple(round(_gam(c) * 255) for c in (r, g, bb))


def shade(h, dL):
    L, a, b = to_lab(h)
    return from_lab(max(0, min(100, L + dL)), a, b)


# ---- a tapered brush stroke (filled polygon), like src/lib/mascot/ink.ts brush()
def taper(pts, w, n=24):
    """pts: [p0, c, p2] quadratic or [p0, p1] line, in viewBox units. Width peaks mid-stroke, tapers to ~15 % at the tips."""
    if len(pts) == 2:
        pts = [pts[0], ((pts[0][0] + pts[1][0]) / 2, (pts[0][1] + pts[1][1]) / 2), pts[1]]
    (x0, y0), (cx, cy), (x2, y2) = pts
    P, N = [], []
    for i in range(n + 1):
        t = i / n
        x = (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * x2
        y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t * t * y2
        dx = 2 * (1 - t) * (cx - x0) + 2 * t * (x2 - cx)
        dy = 2 * (1 - t) * (cy - y0) + 2 * t * (y2 - cy)
        d = math.hypot(dx, dy) or 1
        hw = w / 2 * max(0.15, math.sin(math.pi * t) ** 0.7)
        P.append((x - dy / d * hw, y + dx / d * hw))
        N.append((x + dy / d * hw, y - dx / d * hw))
    ring = P + N[::-1]
    return 'M' + ' L'.join(f'{x:.2f} {y:.2f}' for x, y in ring) + 'Z'


# ---- the scene
COAT = 'M136 432 Q130 330 150 302 Q181 288 212 302 Q232 330 226 432 Z'
TROUSERS = 'M150 418 Q147 470 140 552 Q156 560 170 554 L181 470 L192 554 Q206 560 222 552 Q215 470 212 418 Z'
HAIR = 'M155 262 Q154 228 182 230 Q210 230 208 262 Q200 244 182 246 Q166 246 155 262Z'
GROUND = 'M0 520 Q 90 492 180 512 T 360 504 L360 640 L0 640Z'
ARM_L = 'M148 312 Q128 360 120 410'
ARM_R = 'M212 312 Q244 296 258 266'
KEY_LINES = [  # (points, width in viewBox units): creases, collar, folds, mouth, ear: the "key places"
    ([(166, 436), (163, 480), (158, 540)], 1.0), ([(197, 436), (200, 480), (205, 540)], 1.0),
    ([(168, 301), (174, 318), (181, 331)], 1.1), ([(194, 301), (188, 318), (181, 331)], 1.1),
    ([(203, 352), (206, 385), (203, 416)], 1.0), ([(141, 360), (137, 372)], 0.9),
    ([(232, 300), (238, 296)], 0.9), ([(175, 277), (181, 281), (187, 277)], 0.9),
    ([(205, 256), (208, 262), (205, 268)], 0.8), ([(162, 232 + 10), (170, 236)], 0.7),
]


def defs(c, d, rnd):
    """One halftone pattern per fill colour: the fill plus a dot d L* darker (lighter on very light fills)."""
    out = []
    for role in ('hero', 'anchor', 'skin', 'disc', 'ground'):
        base = c[role]
        L = to_lab(base)[0]
        dot = shade(base, -d if L < 88 else d * 0.5)
        out.append(f'<pattern id="ht-{role}" patternUnits="userSpaceOnUse" width="{PITCH:.3f}" height="{PITCH:.3f}" '
                   f'patternTransform="rotate(45)"><rect width="{PITCH:.3f}" height="{PITCH:.3f}" fill="{base}"/>'
                   f'<circle cx="{PITCH / 2:.3f}" cy="{PITCH / 2:.3f}" r="{PITCH * 0.3:.3f}" fill="{dot}"/></pattern>')
    return ''.join(out)


def flecks(rnd, n=420):
    """Sparse paper-white flecks over the figure area (only visible on mid and dark fills)."""
    return ''.join(f'<circle cx="{rnd.uniform(110, 270):.1f}" cy="{rnd.uniform(225, 565):.1f}" r="{rnd.uniform(0.18, 0.34):.2f}" fill="#FFFFFF" opacity="0.55"/>' for _ in range(n))


def scene(c, variant):
    """variant: A flat, B ht 6 + key lines, C ht 10 + key lines, D ht 10 + full outlines."""
    rnd = random.Random(7)
    tex = variant != 'A'
    d = 6 if variant == 'B' else 10
    f = (lambda role: f'url(#ht-{role})') if tex else (lambda role: c[role])
    ink = c['ink']
    s = [f'<defs>{defs(c, d, rnd) if tex else ""}</defs>', f'<rect width="360" height="640" fill="{c["bg"]}"/>',
         f'<circle cx="262" cy="214" r="66" fill="{f("disc")}"/>', f'<path d="{GROUND}" fill="{f("ground")}"/>',
         f'<g fill="none" stroke="{c["line"]}" stroke-width="{1.2 if tex else 2.6}" stroke-linejoin="round" stroke-linecap="round">'
         '<path d="M16 400 L66 356 L116 400 M26 400 L26 516 L106 516 L106 400"/><rect x="40" y="420" width="20" height="26"/>'
         '<rect x="72" y="420" width="20" height="26"/><path d="M58 516 L58 474 L74 474 L74 516"/>'
         '<path d="M318 512 L318 452 M318 470 L302 456 M318 462 L334 446"/><circle cx="318" cy="424" r="34"/></g>']
    outline = f' stroke="{ink}" stroke-width="0.9" stroke-linejoin="round"' if variant == 'D' else ''
    if variant == 'D':  # full outlines: an ink stroke under each limb
        s += [f'<path d="{ARM_L}" stroke="{ink}" stroke-width="23.8" stroke-linecap="round" fill="none"/>',
              f'<path d="{ARM_R}" stroke="{ink}" stroke-width="23.8" stroke-linecap="round" fill="none"/>']
    s += [f'<path d="{TROUSERS}" fill="{f("anchor")}"{outline}/>',
          f'<ellipse cx="155" cy="558" rx="19" ry="7" fill="{ink}"/><ellipse cx="207" cy="558" rx="19" ry="7" fill="{ink}"/>',
          f'<path d="{COAT}" fill="{f("hero")}"{outline}/>',
          f'<path d="{ARM_L}" stroke="{f("hero")}" stroke-width="22" stroke-linecap="round" fill="none"/>',
          f'<path d="{ARM_R}" stroke="{f("hero")}" stroke-width="22" stroke-linecap="round" fill="none"/>',
          f'<circle cx="119" cy="416" r="10" fill="{f("skin")}"{outline}/><circle cx="262" cy="258" r="10" fill="{f("skin")}"{outline}/>',
          f'<rect x="172" y="276" width="18" height="18" fill="{f("skin")}"/><circle cx="181" cy="262" r="25" fill="{f("skin")}"{outline}/>',
          f'<path d="{HAIR}" fill="{f("anchor")}"{outline}/>']
    if variant == 'A':  # the current board's uniform thin lines
        s.append(f'<g stroke="{ink}" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M168 300 L181 330 L194 300"/>'
                 '<path d="M200 360 Q204 390 200 420"/><path d="M176 262 q2 4 0 8"/><path d="M174 278 q7 4 13 0"/></g>')
    else:
        s.append(f'<g fill="{ink}">' + ''.join(f'<path d="{taper(p, w)}"/>' for p, w in KEY_LINES) + '</g>')
        s.append(flecks(rnd))
    s += [f'<rect x="252" y="226" width="16" height="27" rx="3" fill="{ink}" transform="rotate(14 260 240)"/>',
          f'<circle cx="273" cy="224" r="8" fill="{c["pop"]}"/>',
          f'<g stroke="{c["pop"]}" stroke-width="2.4" stroke-linecap="round"><path d="M284 212 L292 204"/><path d="M288 226 L298 226"/><path d="M276 208 L278 198"/></g>']
    return ''.join(s)


CAPTION = lambda c: (f'<rect x="230" y="98" width="86" height="38" rx="4" fill="{c["hl"]}"/>'
                     f'<text x="36" y="88" font-family="Inter" font-weight="700" font-size="30" fill="{c["ink"]}">Why is everyone</text>'
                     f'<text x="36" y="126" font-family="Inter" font-weight="700" font-size="30" fill="{c["ink"]}">talking about this?</text>')


def page(body):
    return f'<!doctype html><html><head><meta charset="utf-8"><style>html,body{{margin:0;background:#fff}}svg{{display:block}}</style></head><body>{body}</body></html>'


def main():
    os.makedirs(OUT, exist_ok=True)
    for key in ('2', '7'):
        c = PAL[key]['colors']
        for v in 'ABCD':
            svg = f'<svg width="1080" height="1920" viewBox="0 0 360 640" xmlns="http://www.w3.org/2000/svg">{scene(c, v)}{CAPTION(c)}</svg>'
            open(os.path.join(OUT, f'p{key}_{v}.html'), 'w').write(page(svg))
    # motion: variant B, palette 7; a 5 s push-in (1.0 -> 1.22) with a slight drift; the texture is locked to the shapes
    c = PAL['7']['colors']
    svg = (f'<svg width="1080" height="1920" viewBox="0 0 360 640" xmlns="http://www.w3.org/2000/svg">'
           f'<g id="cam">{scene(c, "B")}</g>{CAPTION(c)}</svg>')
    js = ('<script>window.setT=t=>{const e=t<0.5?2*t*t:1-Math.pow(-2*t+2,2)/2;const s=1+0.22*e;'
          'const cx=182,cy=380;document.getElementById("cam").setAttribute("transform",'
          '`translate(${cx} ${cy}) scale(${s}) translate(${-cx+6*e} ${-cy-4*e})`)};setT(0)</script>')
    open(os.path.join(OUT, 'motion.html'), 'w').write(page(svg + js))
    print('pages in', OUT)


if __name__ == '__main__':
    main()
