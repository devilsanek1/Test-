#!/usr/bin/env python3
"""House palette family: checks every palette against the house DNA and writes an HTML board
(the same small scene drawn in each palette) for scripts/look/shoot.cjs to screenshot.

  python3 scripts/look/palette_board.py && node scripts/look/shoot.cjs
Data: docs/look/palettes.json. Output: docs/look/palette_family.png."""
import json, math, os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
DATA = os.path.join(ROOT, 'docs/look/palettes.json')
HTML = os.path.join(ROOT, 'docs/look/palette_board.html')
ROLES = ['bg', 'ground', 'disc', 'hl', 'line', 'skin', 'hero', 'anchor', 'pop', 'ink']


def lab(hexc):
    r, g, b = (int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5))
    lin = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in (r, g, b)]
    x = (0.4124 * lin[0] + 0.3576 * lin[1] + 0.1805 * lin[2]) / 0.95047
    y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2]
    z = (0.0193 * lin[0] + 0.1192 * lin[1] + 0.9505 * lin[2]) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    L = 116 * f(y) - 16
    a = 500 * (f(x) - f(y))
    bb = 200 * (f(y) - f(z))
    return L, math.hypot(a, bb), y


def contrast(h1, h2):
    y1, y2 = lab(h1)[2], lab(h2)[2]
    hi, lo = max(y1, y2), min(y1, y2)
    return (hi + 0.05) / (lo + 0.05)


# The house DNA: what makes the palettes one family (L* = lightness 0-100, C = chroma / colourfulness)
DNA = {
    'bg': lambda L, C: L >= 75 and C <= 20,       # light, soft, never saturated or dark
    'ground': lambda L, C: L >= 60 and C <= 45,   # a soft plane
    'disc': lambda L, C: L >= 55,                 # big soft shape (sun, lamp, highlight)
    'hero': lambda L, C: C >= 30 and 35 <= L <= 72,  # the one saturated colour
    'anchor': lambda L, C: L <= 40,               # deep, tinted, not black
    'pop': lambda L, C: C >= 50 and L >= 50,      # small hot accent
    'ink': lambda L, C: L <= 25,                  # lines and captions
}


def check(p):
    issues = []
    c = p['colors']
    for role, ok in DNA.items():
        L, C, _ = lab(c[role])
        if not ok(L, C):
            issues.append(f'{role} {c[role]} L{L:.0f} C{C:.0f}')
    if contrast(c['ink'], c['bg']) < 7:
        issues.append(f"ink/bg contrast {contrast(c['ink'], c['bg']):.1f} < 7")
    if contrast(c['hero'], c['bg']) < 2.2:
        issues.append(f"hero/bg contrast {contrast(c['hero'], c['bg']):.1f} < 2.2")
    return issues


def scene(c, uid):
    """A 9:16 mini scene in our flat style: caption, sun disc, line-art house and tree, ground, a figure holding a
    phone with a notification badge (the pop). Each shape uses one palette role."""
    g = f'grain{uid}'
    return f'''<svg viewBox="0 0 360 640" width="300" height="533" xmlns="http://www.w3.org/2000/svg">
<defs><filter id="{g}" x="0" y="0" width="100%" height="100%">
<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="4" result="n"/>
<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.9 0 0 0 -0.52" result="dots"/>
<feComposite in="dots" in2="SourceGraphic" operator="in" result="d2"/>
<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="d2"/></feMerge></filter></defs>
<rect width="360" height="640" fill="{c['bg']}"/>
<circle cx="262" cy="214" r="66" fill="{c['disc']}"/>
<path d="M0 520 Q 90 492 180 512 T 360 504 L360 640 L0 640Z" fill="{c['ground']}" filter="url(#{g})"/>
<g fill="none" stroke="{c['line']}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round">
 <path d="M16 400 L66 356 L116 400 M26 400 L26 516 L106 516 L106 400"/><rect x="40" y="420" width="20" height="26"/><rect x="72" y="420" width="20" height="26"/><path d="M58 516 L58 474 L74 474 L74 516"/>
 <path d="M318 512 L318 452 M318 470 L302 456 M318 462 L334 446"/><circle cx="318" cy="424" r="34"/>
</g>
<path d="M150 418 L212 418 L226 556 L194 556 L181 468 L168 556 L136 556 Z" fill="{c['anchor']}" filter="url(#{g})"/>
<ellipse cx="152" cy="560" rx="19" ry="7" fill="{c['ink']}"/><ellipse cx="210" cy="560" rx="19" ry="7" fill="{c['ink']}"/>
<path d="M136 432 Q130 330 150 302 Q181 288 212 302 Q232 330 226 432 Z" fill="{c['hero']}" filter="url(#{g})"/>
<path d="M148 312 Q128 360 120 410" stroke="{c['hero']}" stroke-width="22" stroke-linecap="round" fill="none"/>
<path d="M212 312 Q244 296 258 266" stroke="{c['hero']}" stroke-width="22" stroke-linecap="round" fill="none"/>
<circle cx="119" cy="416" r="10" fill="{c['skin']}"/><circle cx="262" cy="258" r="10" fill="{c['skin']}"/>
<rect x="172" y="276" width="18" height="18" fill="{c['skin']}"/><circle cx="181" cy="262" r="25" fill="{c['skin']}"/>
<path d="M155 262 Q154 228 182 230 Q210 230 208 262 Q200 244 182 246 Q166 246 155 262Z" fill="{c['anchor']}"/>
<g stroke="{c['ink']}" stroke-width="1.6" fill="none" stroke-linecap="round">
 <path d="M168 300 L181 330 L194 300"/><path d="M200 360 Q204 390 200 420"/><path d="M176 262 q2 4 0 8"/><path d="M174 278 q7 4 13 0"/>
</g>
<rect x="252" y="226" width="16" height="27" rx="3" fill="{c['ink']}" transform="rotate(14 260 240)"/>
<circle cx="273" cy="224" r="8" fill="{c['pop']}"/>
<g stroke="{c['pop']}" stroke-width="2.4" stroke-linecap="round"><path d="M284 212 L292 204"/><path d="M288 226 L298 226"/><path d="M276 208 L278 198"/></g>
<rect x="230" y="98" width="86" height="38" rx="4" fill="{c['hl']}"/>
<text x="36" y="88" font-family="Inter" font-weight="700" font-size="30" fill="{c['ink']}">Why is everyone</text>
<text x="36" y="126" font-family="Inter" font-weight="700" font-size="30" fill="{c['ink']}">talking about <tspan>this?</tspan></text>
</svg>'''


def main():
    data = json.load(open(DATA))
    cards = []
    for i, p in enumerate(data['palettes']):
        issues = [] if p.get('baseline') else check(p)
        print(f"{p['name']:<22} {'OK' if not issues else 'ISSUES: ' + '; '.join(issues)}")
        sw = ''.join(f'<div class="sw"><div style="background:{p["colors"][r]}"></div><span>{r}</span></div>' for r in ROLES)
        cards.append(f'<div class="card"><div class="num">{i + 1}</div>{scene(p["colors"], i)}<h3>{p["name"]}</h3><p>{p["mood"]}</p><div class="sws">{sw}</div></div>')
    html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
body{{margin:0;padding:28px 32px;background:#FFFFFF;font-family:Inter,sans-serif;color:#222;width:1336px}}
h1{{font-size:26px;margin:0 0 4px}} .sub{{font-size:15px;color:#555;margin:0 0 20px;max-width:1300px;line-height:1.4}}
.grid{{display:grid;grid-template-columns:repeat(4,1fr);gap:22px 18px}}
.card{{position:relative}} .card svg{{display:block;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.12)}}
.num{{position:absolute;top:8px;left:8px;background:#fff;border-radius:50%;width:26px;height:26px;text-align:center;line-height:26px;font-weight:700;font-size:14px;box-shadow:0 1px 3px rgba(0,0,0,.2)}}
h3{{margin:8px 0 2px;font-size:17px}} p{{margin:0 0 6px;font-size:12.5px;color:#555;line-height:1.35;min-height:34px}}
.sws{{display:flex;gap:3px}} .sw{{width:30px;font-size:7.5px;color:#666;line-height:1.2}} .sw div{{height:22px;border-radius:3px;border:1px solid rgba(0,0,0,.08)}}
</style></head><body><h1>House palette family: same style, each one its own</h1>
<div class="sub">{data['dna_summary']}</div><div class="grid">{''.join(cards)}</div></body></html>'''
    open(HTML, 'w').write(html)
    print('wrote', HTML)


if __name__ == '__main__':
    main()
