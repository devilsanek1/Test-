"""Process test 01 (Amsterdam), the IDEAS step: three whole-frame thumbnails for the moment.

Rough value sketches in grey with one accent (the gold of the waking pages), 9:16 at 1080 x 1920, downscaled onto one
sheet. One small 3D sketch world (a canal, its quays, its houses, the little bridge) seen by three cameras, so all three
ideas are views of the same world; the paper twin is the street mirrored in the water, drawn in paper tones.

Run: python3 video/docs/tests/process_test_01_amsterdam/ideas_sheet.py  (writes ideas_sheet.png beside this file)
"""
import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
FONTS = os.path.join(ROOT, "video", "public", "fonts")
W, H = 1080, 1920
GOLD = np.array([244, 182, 66], float)       # the one accent: the waking pages, her phone, the lit word
GOLD_HOT = np.array([255, 236, 186], float)  # the hot core of the same light
ZB = 0.0                                     # the bridge's centre line along the canal


# ----------------------------------------------------------------------------------------------- camera and clipping
class Cam:
    def __init__(self, pos, yaw=0.0, pitch=0.0, f=1400.0, cx=540.0, cy=960.0):
        self.c = np.array(pos, float)
        self.yaw, self.pitch, self.f, self.cx, self.cy = math.radians(yaw), math.radians(pitch), f, cx, cy

    def cam(self, pts):
        d = np.atleast_2d(np.asarray(pts, float)) - self.c
        cy_, sy_ = math.cos(self.yaw), math.sin(self.yaw)
        x1 = d[:, 0] * cy_ - d[:, 2] * sy_
        z1 = d[:, 0] * sy_ + d[:, 2] * cy_
        y1 = d[:, 1]
        cp, sp = math.cos(self.pitch), math.sin(self.pitch)
        y2 = y1 * cp - z1 * sp
        z2 = y1 * sp + z1 * cp
        return np.stack([x1, y2, z2], 1)

    def scr(self, c):
        return np.stack([self.cx + self.f * c[:, 0] / c[:, 2], self.cy - self.f * c[:, 1] / c[:, 2]], 1)

    def poly(self, pts, near=0.08):
        c = clip_near(self.cam(pts), near)
        if len(c) < 3:
            return None, None
        return [tuple(p) for p in self.scr(c)], float(c[:, 2].mean())

    def pt(self, p):
        c = self.cam([p])
        if c[0, 2] <= 0.05:
            return None, None
        s = self.scr(c)[0]
        return (float(s[0]), float(s[1])), float(c[0, 2])


def clip_near(c, near):
    out = []
    n = len(c)
    for i in range(n):
        a, b = c[i], c[(i + 1) % n]
        ina, inb = a[2] >= near, b[2] >= near
        if ina:
            out.append(a)
        if ina != inb:
            t = (near - a[2]) / (b[2] - a[2])
            out.append(a + t * (b - a))
    return np.array(out) if out else np.zeros((0, 3))


# ------------------------------------------------------------------------------------------------------- the world
def gable_outline(kind, w, rng):
    """Outline above the eave in facade-local (u across, v up), from u=0 to u=w."""
    if kind == "step":
        n = 3
        pts = [(0, 0)]
        for i in range(n):
            u0 = (w / 2) * i / n
            u1 = (w / 2) * (i + 1) / n
            v = 1.2 * (i + 1)
            pts += [(u0 + 0.25 * w / 6, v - 1.2), (u0 + 0.25 * w / 6, v), (u1, v)]
        top = pts[-1][1] + 0.9
        left = pts[1:]
        right = [(w - u, v) for (u, v) in reversed(left)]
        return [(0, 0)] + left + [(w / 2 - 0.5, top), (w / 2 + 0.5, top)] + right + [(w, 0)]
    if kind == "neck":
        nw = w * 0.42
        return [(0, 0), (w * 0.12, 0.6), ((w - nw) / 2, 1.2), ((w - nw) / 2, 4.0), (w / 2, 5.1), ((w + nw) / 2, 4.0),
                ((w + nw) / 2, 1.2), (w * 0.88, 0.6), (w, 0)]
    if kind == "bell":
        pts = [(0, 0)]
        for i in range(1, 12):
            t = i / 12
            u = (w * 0.5) * t
            v = 4.6 * math.sin(t * math.pi / 2) ** 1.6
            pts.append((u * 0.9 + w * 0.05 * t, v))
        pts.append((w / 2, 5.2))
        right = [(w - u, v) for (u, v) in reversed(pts[1:-1])]
        return pts + right + [(w, 0)]
    if kind == "spout":
        return [(0, 0), (w / 2, 4.2), (w, 0)]
    return [(0, 0), (0, 0.9), (w, 0.9), (w, 0)]  # cornice


def make_houses(rng):
    houses = []
    kinds = ["step", "neck", "bell", "spout", "cornice", "neck", "bell", "step", "cornice", "neck"]
    for side in (-1, 1):
        z = -120.0
        k = 0 if side < 0 else 3
        while z < 420:
            w = rng.uniform(5.2, 8.4)
            if abs(z + w / 2 - ZB) < 7:  # the bridge's street meets the quay here: a gap, a side street
                z += 7.5
                continue
            eave = rng.uniform(11.0, 15.5)
            kind = kinds[k % len(kinds)]
            k += 1
            floors = int((eave - 1.6) // 3.0)
            lit = [[rng.random() < 0.22 for _ in range(3)] for _ in range(floors)]
            tone = rng.uniform(-10, 10)
            houses.append(dict(side=side, z0=z, w=w, eave=eave, kind=kind, floors=floors, lit=lit, tone=tone,
                               out=gable_outline(kind, w, rng)))
            z += w + rng.uniform(0.0, 0.25)
    return houses


def house_polys(h, mirror=False):
    """Yields (kind, world_pts) for one house: facade, windows. Mirror = the paper twin (y -> -y)."""
    s = h["side"]
    x = 14.0 * s
    def P(u, v):
        y = 1.6 + v
        return (x, -y if mirror else y, h["z0"] + u)
    w, e = h["w"], h["eave"] - 1.6
    outline = [(0, 0), (0, e)] + [(u, e + v) for (u, v) in h["out"][1:-1]] + [(w, e), (w, 0)]
    yield "facade", [P(u, v) for (u, v) in outline]
    for i in range(h["floors"]):
        v0 = 1.0 + i * 3.0 if i else 0.4
        ws = 3 if w > 6.6 else 2
        for j in range(ws):
            uc = w * (j + 1) / (ws + 1)
            ww, wh = (1.05, 1.9) if i else (1.2, 2.3)
            yield ("win_lit" if h["lit"][i][j % 3] else "win"), [P(uc - ww / 2, v0), P(uc - ww / 2, v0 + wh),
                                                                 P(uc + ww / 2, v0 + wh), P(uc + ww / 2, v0)]


def bridge_parts(mirror=False):
    """The little humped bridge: front and back faces with the arch cut out, deck, railings."""
    sgn = -1 if mirror else 1
    span, rise = 4.6, 2.9
    def deck_y(x):
        return 1.9 + 1.8 * max(0.0, 1 - (abs(x) / 10.5) ** 2)
    arch = [(span * math.cos(t), rise * math.sin(t)) for t in np.linspace(0, math.pi, 24)]
    parts = []
    for zf, name in ((ZB - 3.0, "front"), (ZB + 3.0, "back")):
        top = [(x, deck_y(x)) for x in np.linspace(-10.5, 10.5, 22)]
        pts = [(-10.5, 0.0)] + top + [(10.5, 0.0), (span, 0.0)] + arch + [(-span, 0.0)]
        parts.append((name, [(px, sgn * py, zf) for (px, py) in pts]))
    ring = []  # the voussoir ring round the arch on the front face
    outer = [((span + 0.55) * math.cos(t), (rise + 0.5) * math.sin(t)) for t in np.linspace(0, math.pi, 24)]
    ring = outer + list(reversed(arch))
    parts.append(("ring", [(px, sgn * py, ZB - 3.02) for (px, py) in ring]))
    # railings: a top rail band on both edges
    for zf in (ZB - 3.0, ZB + 3.0):
        xs = np.linspace(-10.5, 10.5, 22)
        top = [(x, deck_y(x) + 1.0) for x in xs]
        bot = [(x, deck_y(x) + 0.88) for x in reversed(xs)]
        parts.append(("rail", [(px, sgn * py, zf - 0.02) for (px, py) in top + bot]))
    return parts, deck_y


# ------------------------------------------------------------------------------------------------------- painting
def vgrad(img, y0, y1, v0, v1):
    a = np.asarray(img, float)
    ys = np.arange(H)[:, None]
    t = np.clip((ys - y0) / max(1, (y1 - y0)), 0, 1)
    g = v0 + (v1 - v0) * t
    a[:, :, :] = g[:, :, None]
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def grey(v):
    v = int(max(0, min(255, v)))
    return (v, v, v)


def soft(img, r):
    return img.filter(ImageFilter.GaussianBlur(r))


def mask_from_polys(polys):
    m = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(m)
    for p in polys:
        if p and len(p) >= 3:
            d.polygon(p, fill=255)
    return m


def add_light(img, center, ax, ay, strength=1.0, core=0.35, mask=None):
    """Composite the gold story light: a soft elliptical bloom (screen-like), hot at its core."""
    rgba = img.mode == "RGBA"
    a = np.asarray(img.convert("RGB"), float)
    yy, xx = np.mgrid[0:H, 0:W]
    r2 = ((xx - center[0]) / ax) ** 2 + ((yy - center[1]) / ay) ** 2
    g = np.exp(-r2 * 2.2) * strength
    hot = np.exp(-r2 * 2.2 / core) * strength
    if mask is not None:
        g = g * mask
        hot = hot * mask
    g = g[:, :, None]
    hot = hot[:, :, None]
    a = a + (GOLD - a * 0.35) * np.clip(g, 0, 1) * 0.9
    a = a + (GOLD_HOT - a) * np.clip(hot, 0, 1) * 0.85
    out = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    return out.convert("RGBA") if rgba else out


def ribbon(draw_img, pts, w0, w1, col, blur=0):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    n = len(pts)
    for i in range(n - 1):
        t = i / (n - 1)
        wdt = w0 + (w1 - w0) * t
        d.line([pts[i], pts[i + 1]], fill=col, width=max(1, int(wdt)))
    if blur:
        layer = soft(layer, blur)
    draw_img.alpha_composite(layer)


def bezier(p0, p1, p2, p3, n=60):
    out = []
    for t in np.linspace(0, 1, n):
        a = (1 - t) ** 3
        b = 3 * (1 - t) ** 2 * t
        c = 3 * (1 - t) * t * t
        d = t ** 3
        out.append((a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]))
    return out


def script_marks(d, x0, y0, x1, y1, rows, col, rng, wmin=6, wmax=22, thick=2):
    """Handwriting as a TEXTURE: rows of short soft dabs, never letters."""
    if x1 - x0 < 6 or y1 - y0 < 6:
        return
    for r in range(rows):
        y = y0 + (r + 0.6) * (y1 - y0) / (rows + 0.4)
        x = x0 + rng.uniform(0, 6)
        while x < x1 - 4:
            w = rng.uniform(wmin, wmax)
            d.line([(x, y + rng.uniform(-1, 1)), (min(x1, x + w), y + rng.uniform(-1.5, 1.5))], fill=col, width=thick)
            x += w + rng.uniform(3, 9)


# ------------------------------------------------------------------------------------------------- the paper twin
def paint_twin(cam, houses, rng, base_paper=138, writing=104, page_lines=True, bridge_tone=128):
    """Returns (rgb image of the twin layer, paper mask). The twin's 'sky' is the dark water itself."""
    img = Image.new("RGB", (W, H), grey(50))
    paper = Image.new("L", (W, H), 0)
    writing = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(img)
    dp = ImageDraw.Draw(paper)
    dwr = ImageDraw.Draw(writing)
    items = []
    for h in houses:
        for kind, pts in house_polys(h, mirror=True):
            p, z = cam.poly(pts)
            if p:
                items.append((z, kind, p, h))
    parts, _ = bridge_parts(mirror=True)
    for kind, pts in parts:
        p, z = cam.poly(pts)
        if p:
            items.append((z, "b_" + kind, p, None))
    # quay walls of the twin (paper bundles along the water's edge)
    for s in (-1, 1):
        for z0 in np.arange(-120, 420, 9.0):
            pts = [(8.0 * s, 0, z0), (8.0 * s, -1.6, z0), (8.0 * s, -1.6, z0 + 9), (8.0 * s, 0, z0 + 9)]
            p, z = cam.poly(pts)
            if p:
                items.append((z, "quay", p, None))
    items.sort(key=lambda it: -it[0])
    for z, kind, p, h in items:
        fade = max(0.0, min(1.0, (z - 30) / 260))  # far twin dims into the dark water
        if kind == "facade":
            v = base_paper + (h["tone"] if h else 0) * 0.6
            v = v * (1 - 0.55 * fade) + 50 * 0.55 * fade
            if page_lines and z < 170:
                gable_page(d, dp, dwr, cam, h, rng, fade, v)
                twin_pages(d, dp, dwr, cam, h, rng, fade, v)
            else:
                d.polygon(p, fill=grey(v - 12))
                dp.polygon(p, fill=255)
        elif kind.startswith("win"):
            v = 82 * (1 - fade) + 50 * fade
            d.polygon(p, fill=grey(v))
            dp.polygon(p, fill=0)
        elif kind == "b_front" or kind == "b_back":
            d.polygon(p, fill=grey(bridge_tone if kind == "b_front" else 46))
            dp.polygon(p, fill=255 if kind == "b_front" else 0)
            if kind == "b_front":  # the twin's spandrel: long sheets laid in courses, written on
                bridge_sheets(d, dwr, cam, rng, bridge_tone)
        elif kind == "b_ring":
            d.polygon(p, fill=grey(bridge_tone + 22))
            dp.polygon(p, fill=255)
        elif kind == "b_rail":
            d.polygon(p, fill=grey(88))
        elif kind == "quay":
            v = 112 * (1 - fade) + 50 * fade
            d.polygon(p, fill=grey(v))
            dp.polygon(p, fill=255)
    return img, paper, writing


def twin_pages(d, dp, dwr, cam, h, rng, fade, v):
    """One house of the twin as old pages laid in its shape: sheets askew with dark water between them, a curled
    corner here and there, rows of writing as a texture."""
    s = h["side"]
    x = 14.0 * s
    def P(u, vv):
        return (x, -(1.6 + vv), h["z0"] + u)
    w, e = h["w"], h["eave"] - 1.6
    cols = 2 if w > 6.2 else 1
    rows = max(2, int(e / 3.9))
    for r in range(rows):
        for c in range(cols):
            u0 = w * c / cols + rng.uniform(0.15, 0.4)
            u1 = w * (c + 1) / cols - rng.uniform(0.15, 0.4)
            v0 = e * r / rows + rng.uniform(0.15, 0.4)
            v1 = e * (r + 1) / rows - rng.uniform(0.05, 0.3)
            uc, vc = (u0 + u1) / 2, (v0 + v1) / 2
            a = rng.uniform(-0.1, 0.1)
            def R(u, vv):
                du, dv = u - uc, vv - vc
                return P(uc + du * math.cos(a) - dv * math.sin(a), vc + du * math.sin(a) + dv * math.cos(a))
            curl = rng.random() < 0.55
            cu = min(1.2, (u1 - u0) * 0.28)
            corners = [(u0, v0), (u0, v1), (u1 - (cu if curl else 0), v1), (u1, v1 - (cu if curl else 0)), (u1, v0)]
            p, zz = cam.poly([R(*q) for q in corners])
            if not p:
                continue
            pv = v + 16 + rng.uniform(-10, 10)
            d.polygon(p, fill=grey(pv))
            dp.polygon(p, fill=255)
            edge, _ = cam.poly([R(u0, v0), R(u0, v0 + 0.14), R(u1, v0 + 0.14), R(u1, v0)])
            if edge:
                d.polygon(edge, fill=grey(pv + 22))
            if curl:
                ear, _ = cam.poly([R(u1 - cu, v1), R(u1, v1 - cu), R(u1 - cu * 1.05, v1 - cu * 1.05)])
                if ear:
                    d.polygon(ear, fill=grey(pv + 34))
            n = max(3, int((v1 - v0) / 0.45))
            for k in range(n):
                vv = v0 + (k + 0.8) * (v1 - v0) / (n + 0.6)
                uu = u0 + 0.25 + rng.uniform(0, 0.3)
                while uu < u1 - 0.35:
                    ln = rng.uniform(0.35, 1.1)
                    a1, _ = cam.pt(R(uu, vv))
                    b1, _ = cam.pt(R(min(u1 - 0.3, uu + ln), vv + rng.uniform(-0.05, 0.05)))
                    if a1 and b1:
                        col = grey(pv - 38 * (1 - 0.5 * fade))
                        d.line([a1, b1], fill=col, width=2 if zz < 60 else 1)
                        dwr.line([a1, b1], fill=255, width=2 if zz < 60 else 1)
                    uu += ln + rng.uniform(0.15, 0.4)


def gable_page(d, dp, dwr, cam, h, rng, fade, v):
    """The gable as one page cut to its outline (inset, so the water shows round it), written on."""
    s = h["side"]
    x = 14.0 * s
    e = h["eave"] - 1.6
    w = h["w"]
    out = h["out"]
    cxg = w / 2
    pts = []
    for (u, vv) in out:
        uu = cxg + (u - cxg) * 0.9
        pts.append((x, -(1.6 + e + vv * 0.9 + 0.15), h["z0"] + uu))
    p, zz = cam.poly(pts)
    if p and len(p) >= 3:
        pv = v + 8
        d.polygon(p, fill=grey(pv))
        dp.polygon(p, fill=255)


def bridge_sheets(d, dwr, cam, rng, tone):
    """The twin bridge's face: big old sheets laid round the arch, askew, written on, the water between them."""
    span, rise = 4.6, 2.9
    for vv in np.arange(0.25, 3.7, 1.0):
        x0 = -10.4 + rng.uniform(0, 0.6)
        while x0 < 10.2:
            x1 = x0 + rng.uniform(2.2, 3.0)
            xm = (x0 + x1) / 2
            inside = abs(xm) < span + 0.9 and vv < rise * math.sqrt(max(0.0, 1 - (xm / (span + 0.9)) ** 2)) + 0.5
            if not inside:
                a = rng.uniform(-0.06, 0.06)
                h_ = 0.86
                q = [(x0, vv), (x0, vv + h_), (x1, vv + h_ + a * 3), (x1, vv + a * 3)]
                p, _ = cam.poly([(qx, -qy, ZB - 3.04) for (qx, qy) in q])
                if p:
                    t = tone + 14 + rng.uniform(-8, 10)
                    d.polygon(p, fill=grey(t))
                    for k in range(3):
                        yy = vv + 0.22 + k * 0.24
                        a1, _ = cam.pt((x0 + 0.2, -(yy + a * 1.5), ZB - 3.05))
                        b1, _ = cam.pt((x1 - rng.uniform(0.3, 0.9), -(yy + a * 1.5), ZB - 3.05))
                        if a1 and b1:
                            d.line([a1, b1], fill=grey(t - 36), width=2)
                            dwr.line([a1, b1], fill=255, width=2)
            x0 = x1 + rng.uniform(0.12, 0.3)


def ledger_voussoirs(img, cam, mirror=True, tone=150, rng=None):
    """The twin's arch: its voussoirs are bound ledgers standing spine-out round the opening (the ring's paper half)."""
    d = ImageDraw.Draw(img)
    span, rise = 4.6, 2.9
    n = 13
    for i in range(n):
        t0 = math.pi * (i + 0.08) / n
        t1 = math.pi * (i + 0.9) / n
        def A(t, k):
            return ((span + k * 0.95) * math.cos(t), (rise + k * 0.9) * math.sin(t))
        quad = [A(t0, 0), A(t0, 1), A(t1, 1), A(t1, 0)]
        p, _ = cam.poly([(x, -y if mirror else y, ZB - 3.03) for (x, y) in quad])
        if not p:
            continue
        v = tone + (rng.uniform(-10, 14) if rng else 0)
        d.polygon(p, fill=grey(v))
        for kb in (0.25, 0.75):  # the spine's bands
            b0 = A(t0 + (t1 - t0) * 0.05, kb)
            b1 = A(t1 - (t1 - t0) * 0.05, kb)
            pa, _ = cam.pt((b0[0], -b0[1] if mirror else b0[1], ZB - 3.04))
            pb, _ = cam.pt((b1[0], -b1[1] if mirror else b1[1], ZB - 3.04))
            if pa and pb:
                d.line([pa, pb], fill=grey(v - 40), width=3)


# ---------------------------------------------------------------------------------------------- the real street
def paint_street(img, cam, houses, rng, sky_lum, skip_near=None):
    d = ImageDraw.Draw(img)
    items = []
    for h in houses:
        for kind, pts in house_polys(h):
            p, z = cam.poly(pts)
            if p:
                items.append((z, kind, p, h))
    for s in (-1, 1):  # quay walls (brick, the real side of the waterline)
        for z0 in np.arange(-120, 420, 9.0):
            pts = [(8.0 * s, 0, z0), (8.0 * s, 1.6, z0), (8.0 * s, 1.6, z0 + 9), (8.0 * s, 0, z0 + 9)]
            p, z = cam.poly(pts)
            if p:
                items.append((z, "quay", p, None))
            pts = [(8.0 * s, 1.6, z0), (14.0 * s, 1.6, z0), (14.0 * s, 1.6, z0 + 9), (8.0 * s, 1.6, z0 + 9)]
            p, z = cam.poly(pts)
            if p:
                items.append((z + 0.01, "street", p, None))
    items.sort(key=lambda it: -it[0])
    for z, kind, p, h in items:
        haze = max(0.0, min(1.0, (z - 25) / 230))
        if kind == "facade":
            v = 92 + h["tone"]
            v = v * (1 - haze) + (sky_lum - 18) * haze
            d.polygon(p, fill=grey(v))
        elif kind == "win_lit":
            v = 212 * (1 - haze * 0.6) + (sky_lum) * haze * 0.6
            d.polygon(p, fill=grey(v))
        elif kind == "win":
            v = 60 * (1 - haze) + (sky_lum - 30) * haze
            d.polygon(p, fill=grey(v))
        elif kind == "quay":
            v = 58 * (1 - haze) + (sky_lum - 40) * haze
            d.polygon(p, fill=grey(v))
        elif kind == "street":
            v = 74 * (1 - haze) + (sky_lum - 30) * haze
            d.polygon(p, fill=grey(v))


def paint_trees(img, cam, rng, zs, tone=58, sky_lum=150):
    """Elms along the quays: soft dark canopies (big shapes, lost edges), thin trunks."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    trees = []
    for s in (-1, 1):
        for z in zs:
            trees.append((s * 9.6, z))
    trees.sort(key=lambda t: -cam.pt((t[0], 0, t[1]))[1] if cam.pt((t[0], 0, t[1]))[0] else 0)
    for x, z in trees:
        base, dz = cam.pt((x, 1.6, z))
        top, _ = cam.pt((x, 9.5, z))
        if not base or dz < 3:
            continue
        haze = max(0.0, min(1.0, (dz - 25) / 230))
        v = tone * (1 - haze) + (sky_lum - 25) * haze
        r = cam.f * 3.4 / dz
        d.line([base, (top[0], top[1] + r * 0.5)], fill=grey(v - 6) + (255,), width=max(1, int(cam.f * 0.35 / dz)))
        for k in range(5):
            ox, oy = rng.uniform(-0.9, 0.9) * r, rng.uniform(-0.6, 0.5) * r
            rr = r * rng.uniform(0.55, 0.85)
            d.ellipse([top[0] + ox - rr, top[1] + oy - rr * 0.8, top[0] + ox + rr, top[1] + oy + rr * 0.8],
                      fill=grey(v) + (235,))
    layer = soft(layer, 2.5)
    img.alpha_composite(layer)


def paint_bridge(img, cam, rng, face=92, lit_from=None):
    d = ImageDraw.Draw(img)
    parts, deck_y = bridge_parts()
    order = []
    for kind, pts in parts:
        p, z = cam.poly(pts)
        if p:
            order.append((z, kind, p))
    order.sort(key=lambda it: -it[0])
    for z, kind, p in order:
        if kind == "back":
            d.polygon(p, fill=grey(34))  # the vault's shade seen through the arch
        elif kind == "front":
            d.polygon(p, fill=grey(face))
        elif kind == "ring":
            d.polygon(p, fill=grey(face + 14))
        elif kind == "rail":
            d.polygon(p, fill=grey(38))
    # railing bars (iron), only on the front edge
    for x in np.linspace(-10.2, 10.2, 52):
        a, _ = cam.pt((x, deck_y(x) + 0.05, ZB - 3.0))
        b, _ = cam.pt((x, deck_y(x) + 0.95, ZB - 3.0))
        if a and b:
            d.line([a, b], fill=grey(40), width=2)
    return deck_y


def ink(c, a=255):
    return tuple(int(v) for v in c) + (a,)


def smooth(pts, n=12):
    """A closed smooth outline through control points (Catmull-Rom), for soft organic silhouettes."""
    out = []
    m = len(pts)
    for i in range(m):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % m], pts[(i + 2) % m]
        for t in np.linspace(0, 1, n, endpoint=False):
            t2, t3 = t * t, t * t * t
            x = 0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
                       (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3)
            y = 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
                       (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)
            out.append((x, y))
    return out


def her_front(img, foot, s, rail_y_off=0.59):
    """Her, seen from the canal: leaning over the near railing toward us, head bowed to the water, forearms on the
    rail, the phone held out over the water. Lit from below by the waking pages."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x, y = foot
    col = (44, 44, 44, 255)
    rail = y - rail_y_off * s
    d.polygon(smooth([(x - 0.11 * s, y - 0.2 * s), (x - 0.13 * s, rail), (x - 0.15 * s, y - 0.78 * s),
                      (x - 0.05 * s, y - 0.83 * s), (x + 0.05 * s, y - 0.83 * s), (x + 0.15 * s, y - 0.78 * s),
                      (x + 0.13 * s, rail), (x + 0.11 * s, y - 0.2 * s)], 8), fill=col)  # the coat
    d.ellipse([x - 0.065 * s, y - 0.9 * s, x + 0.065 * s, y - 0.77 * s], fill=(40, 40, 40, 255))  # head, bowed
    d.polygon(smooth([(x - 0.085 * s, y - 0.8 * s), (x - 0.075 * s, y - 0.9 * s), (x, y - 0.935 * s),
                      (x + 0.075 * s, y - 0.9 * s), (x + 0.09 * s, y - 0.79 * s), (x + 0.06 * s, y - 0.74 * s),
                      (x - 0.06 * s, y - 0.74 * s)], 6), fill=(32, 32, 32, 255))  # hair falling forward
    for sx in (-1, 1):  # forearms on the rail
        d.line([(x + sx * 0.14 * s, y - 0.76 * s), (x + sx * 0.12 * s, rail - 0.01 * s), (x + sx * 0.03 * s,
               rail + 0.01 * s)], fill=col, width=max(3, int(0.05 * s)))
    d.line([(x + 0.13 * s, y - 0.76 * s), (x + 0.02 * s, y - 0.52 * s)], fill=(70, 70, 70, 255),
           width=max(2, int(0.03 * s)))  # the scarf's end, the one flowing piece
    img.alpha_composite(layer)
    hand = (x - 0.03 * s, rail + 0.06 * s)
    rim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(rim)
    dr.arc([x - 0.065 * s, y - 0.9 * s, x + 0.065 * s, y - 0.77 * s], 20, 160, fill=ink(GOLD, 255),
           width=max(2, int(0.022 * s)))  # her face lit from below
    dr.line([(x - 0.13 * s, rail + 0.02 * s), (x + 0.13 * s, rail + 0.02 * s)], fill=ink(GOLD, 200),
            width=max(2, int(0.02 * s)))  # the undersides of her forearms
    img.alpha_composite(soft(rim, 1.2))
    phone(img, hand, s * 0.045)
    return hand


def her_side(img, foot, s, f=1):
    """Her in a three-quarter side view: leaning out over the railing, one hand reaching down toward the light,
    the phone in the other at her chest."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x, y = foot
    col = (44, 44, 44, 255)
    def X(u):
        return x + f * u * s
    def Y(v):
        return y - v * s
    d.polygon([(X(-0.06), Y(0)), (X(-0.02), Y(0)), (X(0.0), Y(0.45)), (X(-0.08), Y(0.45))], fill=col)
    d.polygon([(X(0.02), Y(0)), (X(0.06), Y(0)), (X(0.05), Y(0.45)), (X(-0.02), Y(0.45))], fill=col)
    d.polygon(smooth([(X(-0.09), Y(0.24)), (X(-0.09), Y(0.5)), (X(0.0), Y(0.76)), (X(0.12), Y(0.82)),
                      (X(0.2), Y(0.76)), (X(0.1), Y(0.55)), (X(0.08), Y(0.25))], 8), fill=col)  # the coat, leaning
    hc = (X(0.24), Y(0.82))
    r = 0.062 * s
    d.ellipse([hc[0] - r, hc[1] - r, hc[0] + r, hc[1] + r], fill=(40, 40, 40, 255))
    d.polygon(smooth([(hc[0] - f * r * 1.2, hc[1] - r * 0.3), (hc[0] - f * r * 0.2, hc[1] - r * 1.25),
                      (hc[0] + f * r * 0.9, hc[1] - r * 0.7), (hc[0] + f * r * 0.5, hc[1] + r * 0.6),
                      (hc[0] - f * r * 0.6, hc[1] + r * 1.5), (hc[0] - f * r * 1.4, hc[1] + r * 1.1)], 6),
              fill=(32, 32, 32, 255))  # hair, its ends lifting
    reach = (X(0.42), Y(0.5))
    d.line([(X(0.14), Y(0.74)), (X(0.3), Y(0.62)), reach], fill=col, width=max(3, int(0.045 * s)))
    d.line([(X(0.1), Y(0.72)), (X(0.17), Y(0.64))], fill=col, width=max(3, int(0.045 * s)))
    img.alpha_composite(layer)
    rim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(rim)
    dr.arc([hc[0] - r, hc[1] - r, hc[0] + r, hc[1] + r], 10 if f > 0 else 100, 90 if f > 0 else 170,
           fill=ink(GOLD), width=max(2, int(0.02 * s)))
    dr.line([(X(0.15), Y(0.73)), (X(0.31), Y(0.61)), reach], fill=ink(GOLD, 210), width=max(2, int(0.016 * s)))
    dr.line([(X(0.19), Y(0.74)), (X(0.1), Y(0.3))], fill=ink(GOLD, 150), width=max(2, int(0.014 * s)))
    img.alpha_composite(soft(rim, 1.2))
    phone(img, (X(0.17), Y(0.63)), s * 0.035)
    return reach


def phone(img, at, r):
    ph = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(ph).rounded_rectangle([at[0] - r * 0.7, at[1] - r * 1.2, at[0] + r * 0.7, at[1] + r * 1.2],
                                         max(1, int(r * 0.3)), fill=ink(GOLD_HOT))
    img.alpha_composite(soft(ph, max(4, r * 2.2)))
    img.alpha_composite(soft(ph, max(2, r * 0.8)))
    img.alpha_composite(ph)


def bike(img, at, s):
    d = ImageDraw.Draw(img)
    bx, by = at
    rr = 0.33 * s
    c = (42, 42, 42, 255)
    w = max(2, int(s * 0.045))
    for cxw in (bx - 0.55 * s, bx + 0.55 * s):
        d.ellipse([cxw - rr, by - 2 * rr, cxw + rr, by], outline=c, width=w)
    d.line([(bx - 0.55 * s, by - rr), (bx, by - rr * 1.1), (bx + 0.55 * s, by - rr), (bx + 0.2 * s, by - 2.1 * rr),
            (bx - 0.1 * s, by - rr * 1.1)], fill=c, width=w)
    d.line([(bx + 0.2 * s, by - 2.1 * rr), (bx + 0.32 * s, by - 2.5 * rr)], fill=c, width=w)
    d.line([(bx - 0.12 * s, by - 2.0 * rr), (bx - 0.28 * s, by - 2.0 * rr)], fill=c, width=w)  # saddle
    d.rectangle([bx + 0.38 * s, by - 2.3 * rr, bx + 0.66 * s, by - 1.85 * rr], fill=c)  # the basket


def light_column(img, base, top, w_base, rng, strands=3, sheets=4, bold=1.0):
    """The answer climbing: the waking writing leaves the water as a winding stream of gold light, its loops of
    script coming loose around it (a texture of light, never letters); where it leaves, a few sheets curl up."""
    dx, dy = top[0] - base[0], top[1] - base[1]
    L = math.hypot(dx, dy)
    nx, ny = -dy / L, dx / L
    def path(ph, amp):
        pts = []
        for i in range(80):
            t = i / 79
            off = math.sin(t * 4.2 + ph) * amp * (1 - t) ** 0.9 + math.sin(t * 1.3) * amp * 0.6
            pts.append((base[0] + dx * t + nx * off, base[1] + dy * t + ny * off))
        return pts
    main = path(0.4, w_base * 0.45)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ribbon(glow, main, 70 * bold, 18 * bold, ink(GOLD, 130))
    img.alpha_composite(soft(glow, 24))
    img.alpha_composite(soft(glow, 10))
    ribbon(img, main, 22 * bold, 4 * bold, ink(GOLD, 210), blur=3)
    ribbon(img, main, 8 * bold, 2, ink(GOLD_HOT, 245))
    for k in range(strands - 1):
        sp = path(rng.uniform(1.5, 4.5), w_base * rng.uniform(0.25, 0.6))
        ribbon(img, sp, 8, 2, ink(GOLD, 170), blur=2)
        ribbon(img, sp, 2.5, 1, ink(GOLD_HOT, 220))
    dl = ImageDraw.Draw(img)
    for i in range(70):
        t = rng.random() ** 1.4
        j = min(79, int(t * 79))
        px, py = main[j]
        spread = (1 - t) * w_base * 0.9 + 14
        px += rng.uniform(-spread, spread)
        py += rng.uniform(-12, 12)
        sz = (11 * (1 - t) + 3) * rng.uniform(0.7, 1.3)
        dl.arc([px - sz, py - sz * 0.5, px + sz, py + sz * 0.5], rng.uniform(0, 140), rng.uniform(200, 350),
               fill=ink(GOLD_HOT, 215), width=2)
    for k in range(sheets):  # sheets peeling up off the twin where the light leaves the water
        sx = base[0] + rng.uniform(-1.0, 1.0) * w_base * 0.9
        sy = base[1] + rng.uniform(-10, 18)
        s = rng.uniform(16, 26)
        a = rng.uniform(-0.5, 0.5)
        ca, sa = math.cos(a), math.sin(a)
        quad = [(-s, -s * 0.5), (s * 0.8, -s * 0.75), (s, s * 0.45), (-s * 0.9, s * 0.6)]
        q = [(sx + u * ca - v * sa, sy + u * sa + v * ca) for (u, v) in quad]
        lay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        dq = ImageDraw.Draw(lay)
        dq.polygon(q, fill=ink(GOLD_HOT, 240))
        for r in range(3):
            vv = -s * 0.3 + r * s * 0.3
            dq.line([(sx - s * 0.6 * ca - vv * sa, sy - s * 0.6 * sa + vv * ca),
                     (sx + s * 0.5 * ca - vv * sa, sy + s * 0.5 * sa + vv * ca)], fill=(170, 112, 40, 200), width=2)
        img.alpha_composite(soft(lay, 10))
        img.alpha_composite(lay)


def lantern(img, center, ax, ay, writing, strength=0.75):
    """Lit paper glows like a lantern and its writing shows through: darken the writing to a warm brown in the light."""
    rgba = img.mode == "RGBA"
    a = np.asarray(img.convert("RGB"), float)
    yy, xx = np.mgrid[0:H, 0:W]
    g = np.exp(-(((xx - center[0]) / ax) ** 2 + ((yy - center[1]) / ay) ** 2) * 2.2)
    m = (np.asarray(writing, float) / 255.0) * g * strength
    m = m[:, :, None]
    a = a * (1 - m) + np.array([150, 96, 34], float) * m
    out = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    return out.convert("RGBA") if rgba else out


def caption(img, lines, lit_word, size=116, lit_size=150):
    """The caption in its band (y 290-600): warm white, the lit word gold (the hand: Gaegu)."""
    f = ImageFont.truetype(os.path.join(FONTS, "Gaegu-300.woff2"), size)
    fl = ImageFont.truetype(os.path.join(FONTS, "Gaegu-700.woff2"), lit_size)
    d = ImageDraw.Draw(img)
    baselines = [395, 515]
    for li, line in enumerate(lines):
        words = line.split(" ")
        widths = [d.textlength(wd, font=(fl if wd == lit_word else f)) for wd in words]
        sp = d.textlength(" ", font=f)
        x = 540 - (sum(widths) + sp * (len(words) - 1)) / 2
        for wd, wdt in zip(words, widths):
            ft = fl if wd == lit_word else f
            col = ink(GOLD)[:3] if wd == lit_word else (242, 240, 236)
            if wd == lit_word:
                halo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
                ImageDraw.Draw(halo).text((x, baselines[li]), wd, font=ft, fill=col + (190,), anchor="ls")
                img.alpha_composite(soft(halo, 10))
            d.text((x, baselines[li]), wd, font=ft, fill=col, anchor="ls")
            x += wdt + sp


def ripples(img, cam, center_w, radii, rng, alpha=150, width=3):
    """Natural ripple rings: broken glints of the gold light on the water, never a drawn target."""
    d = ImageDraw.Draw(img)
    for r in radii:
        on = False
        seg = []
        for t in np.linspace(0, 2 * math.pi, 140):
            p, _ = cam.pt((center_w[0] + r * math.cos(t), 0.0, center_w[2] + r * math.sin(t)))
            if not p:
                continue
            if rng.random() < 0.08:
                on = not on
                if seg and len(seg) > 1:
                    d.line(seg, fill=ink(GOLD_HOT if r < radii[1] else GOLD, alpha), width=width)
                seg = []
            if on:
                seg.append(p)
        if on and len(seg) > 1:
            d.line(seg, fill=ink(GOLD, alpha), width=width)


def sky(img, top_v, hor_v, hor_y, rng):
    img2 = vgrad(img.convert("RGB"), 0, hor_y, top_v, hor_v).convert("RGBA")
    cl = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(cl)
    for k in range(5):  # a few long soft dusk clouds low in the sky, below the band
        y = rng.uniform(640, hor_y - 60)
        x = rng.uniform(-100, 900)
        v = int(hor_v - rng.uniform(4, 16))
        d.ellipse([x, y, x + rng.uniform(300, 600), y + rng.uniform(18, 34)], fill=(v, v, v, 150))
    img2.alpha_composite(soft(cl, 10))
    return img2


def houseboat_parts(side, z0, length=18.0, mirror=False):
    sgn = -1 if mirror else 1
    xi, xo = (7.9 - 3.4, 7.9) if side > 0 else (-7.9 + 3.4, -7.9)
    parts = []
    def q(ax, ay, bx, by, z1, z2):
        return [(ax, sgn * ay, z1), (ax, sgn * by, z1), (bx, sgn * by, z2), (bx, sgn * ay, z2)]
    parts.append(("hull", [(xi, 0, z0), (xi, sgn * 0.9, z0), (xi, sgn * 0.9, z0 + length), (xi, 0, z0 + length)]))
    parts.append(("hull_end", [(xi, 0, z0), (xi, sgn * 0.9, z0), (xo, sgn * 0.9, z0), (xo, 0, z0)]))
    ci = xi + 0.4 * side
    parts.append(("cabin", [(ci, sgn * 0.9, z0 + 2), (ci, sgn * 2.7, z0 + 2), (ci, sgn * 2.7, z0 + length - 2),
                            (ci, sgn * 0.9, z0 + length - 2)]))
    for k in range(4):
        zz = z0 + 3.5 + k * 3.3
        parts.append(("hb_win" if k % 2 == 0 else "hb_win_dark",
                      [(ci - 0.01 * side, sgn * 1.4, zz), (ci - 0.01 * side, sgn * 2.2, zz),
                       (ci - 0.01 * side, sgn * 2.2, zz + 1.6), (ci - 0.01 * side, sgn * 1.4, zz + 1.6)]))
    return parts


def paint_houseboats(img, cam, boats, mirror=False, paper_tone=None, dp=None):
    d = ImageDraw.Draw(img)
    items = []
    for side, z0 in boats:
        for kind, pts in houseboat_parts(side, z0, mirror=mirror):
            p, z = cam.poly(pts)
            if p:
                items.append((z, kind, p))
    items.sort(key=lambda it: -it[0])
    for z, kind, p in items:
        haze = max(0.0, min(1.0, (z - 25) / 230))
        if mirror:
            v = {"hull": paper_tone - 20, "hull_end": paper_tone - 26, "cabin": paper_tone,
                 "hb_win": paper_tone - 40, "hb_win_dark": paper_tone - 40}[kind]
            v = v * (1 - 0.5 * haze) + 50 * 0.5 * haze
            d.polygon(p, fill=grey(v))
            if dp is not None:
                dp.polygon(p, fill=255 if not kind.startswith("hb_win") else 0)
        else:
            v = {"hull": 50, "hull_end": 44, "cabin": 84, "hb_win": 206, "hb_win_dark": 58}[kind]
            v = v * (1 - haze) + 150 * haze * 0.8 + v * haze * 0.2
            d.polygon(p, fill=grey(v))


def finish(img):
    """A light softening: the sketch reads as values, not as hard vector edges."""
    return img.filter(ImageFilter.GaussianBlur(0.8))


def dim_twin(twin, center, sx, sy, floor=0.5):
    a = np.asarray(twin, float)
    yy, xx = np.mgrid[0:H, 0:W]
    g = np.exp(-(((xx - center[0]) / sx) ** 2 + ((yy - center[1]) / sy) ** 2))
    k = (floor + (1 - floor) * g)[:, :, None]
    base = 46.0
    a = base + (a - base) * k
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def twin_layer(cam, houses, rng, water_poly_world, boats=(), voussoirs=True):
    wp, _ = cam.poly(water_poly_world)
    water = mask_from_polys([wp])
    twin, paper, writing = paint_twin(cam, houses, rng)
    dp = ImageDraw.Draw(paper)
    paint_houseboats(twin, cam, boats, mirror=True, paper_tone=140, dp=dp)
    if voussoirs:
        ledger_voussoirs(twin, cam, mirror=True, tone=156, rng=rng)
    return water, twin, paper, writing


# --------------------------------------------------------------------------------------------------------- IDEA 1
def idea_ring(houses):
    """THE PAPER HALF: from a canal boat, the bridge and its paper twin close into one ring; inside it, under her,
    the pages wake and their light climbs to her phone; through the ring the dark twin runs on out of sight."""
    rng = random.Random(11)
    cam = Cam((0.7, 1.25, ZB - 28.0), yaw=0.0, pitch=3.5, f=1520)
    hv = 184
    img = sky(Image.new("RGB", (W, H)), 88, hv, 1040, rng)
    d = ImageDraw.Draw(img)
    tp, _ = cam.pt((-3.0, 0.0, 700.0))  # a far church tower in the haze down the canal: the world goes on
    if tp:
        d.polygon(smooth([(tp[0] - 8, tp[1]), (tp[0] - 8, tp[1] - 120), (tp[0] - 3, tp[1] - 150),
                          (tp[0], tp[1] - 200), (tp[0] + 3, tp[1] - 150), (tp[0] + 8, tp[1] - 120),
                          (tp[0] + 8, tp[1])], 3), fill=grey(hv - 22))
    boats = [(-1, ZB + 16.0), (1, ZB + 44.0)]
    water, twin, paper, writing = twin_layer(cam, houses, rng, [(-8, 0, ZB - 27.0), (-8, 0, 900), (8, 0, 900),
                                                                 (8, 0, ZB - 27.0)], boats)
    c0, _ = cam.pt((-0.35, 0.0, ZB - 4.4))
    twin = dim_twin(twin, (c0[0], c0[1] + 60), 420, 330, floor=0.42)
    img.paste(twin.convert("RGBA"), (0, 0), water)
    paint_street(img, cam, houses, rng, hv)
    paint_houseboats(img, cam, boats)
    paint_trees(img, cam, rng, [ZB + 13, ZB + 25, ZB + 38, ZB + 53, ZB + 71, ZB + 93, ZB + 120], sky_lum=hv)
    deck_y = paint_bridge(img, cam, rng)
    for lx in (-6.8, 6.4):  # the bridge's lamps: just lit, quieter than the story light
        a, _ = cam.pt((lx, deck_y(lx), ZB - 3.1))
        b, _ = cam.pt((lx, deck_y(lx) + 3.3, ZB - 3.1))
        if a and b:
            d.line([a, b], fill=grey(38), width=5)
            d.polygon(smooth([(b[0] - 8, b[1] + 4), (b[0] - 10, b[1] - 12), (b[0], b[1] - 20), (b[0] + 10, b[1] - 12),
                              (b[0] + 8, b[1] + 4)], 3), fill=grey(196))
    drop_w = (-0.35, 0.0, ZB - 4.4)
    drop, _ = cam.pt(drop_w)
    wm = np.asarray(water, float) / 255.0
    pm = np.asarray(soft(paper.convert("L"), 1), float) / 255.0
    lit = (drop[0], drop[1] + 60)
    img = add_light(img, lit, 300, 230, strength=1.0, core=0.1, mask=wm * (0.25 + 0.75 * pm))
    img = lantern(img, lit, 300, 230, soft(writing, 0.6), strength=0.8)
    img = add_light(img, (drop[0], drop[1] - 80), 230, 110, strength=0.5, core=0.04)  # the vault lit from below
    ripples(img, cam, drop_w, [0.9, 1.9, 3.1], rng, alpha=120, width=2)
    foot, _ = cam.pt((-0.6, deck_y(-0.6), ZB - 2.6))
    hand = her_front(img, foot, 136)
    bk, _ = cam.pt((1.9, deck_y(1.9), ZB - 2.7))
    bike(img, bk, 64)
    a, _ = cam.pt((-2.4, deck_y(-2.4) + 0.95, ZB - 3.0))  # redraw the rail in front of her coat
    b, _ = cam.pt((1.2, deck_y(1.2) + 0.95, ZB - 3.0))
    ImageDraw.Draw(img).line([a, (foot[0], foot[1] - 0.6 * 136), b], fill=grey(36), width=6)
    light_column(img, (drop[0], drop[1] + 14), (hand[0], hand[1] + 4), 110, rng, strands=3, sheets=6, bold=1.6)
    caption(img, ["now answer", "your questions"], "answer")
    return finish(img.convert("RGB"))


# --------------------------------------------------------------------------------------------------------- IDEA 2
def idea_shoulder(houses):
    """HER QUESTION LANDS: over her shoulder on the bridge, looking down her canal; where her question fell, the
    water wakes in rings across the dark paper twin, and the writing climbs back to her hand."""
    rng = random.Random(23)
    cam = Cam((1.1, 5.3, ZB + 0.6), yaw=-2.0, pitch=-6.0, f=1150)
    hv = 180
    img = sky(Image.new("RGB", (W, H)), 86, hv, 840, rng)
    d = ImageDraw.Draw(img)
    tp, _ = cam.pt((4.0, 0.0, 700.0))
    if tp:
        d.polygon(smooth([(tp[0] - 7, tp[1]), (tp[0] - 7, tp[1] - 100), (tp[0], tp[1] - 160), (tp[0] + 7, tp[1] - 100),
                          (tp[0] + 7, tp[1])], 3), fill=grey(hv - 22))
    low = [dict(h, eave=h["eave"] * 0.8, out=[(u, v * 0.8) for (u, v) in h["out"]]) for h in houses]
    boats = [(-1, ZB + 30.0), (1, ZB + 52.0)]
    water, twin, paper, writing = twin_layer(cam, low, rng, [(-8, 0, ZB + 3.0), (-8, 0, 900), (8, 0, 900),
                                                             (8, 0, ZB + 3.0)], boats, voussoirs=False)
    c0, _ = cam.pt((0.4, 0.0, ZB + 10.5))
    twin = dim_twin(twin, c0, 520, 260, floor=0.45)
    img.paste(twin.convert("RGBA"), (0, 0), water)
    paint_street(img, cam, low, rng, hv)
    paint_houseboats(img, cam, boats)
    paint_trees(img, cam, rng, [ZB + 17, ZB + 29, ZB + 43, ZB + 60, ZB + 82, ZB + 108, ZB + 140], sky_lum=hv)
    drop_w = (0.4, 0.0, ZB + 10.5)
    drop, _ = cam.pt(drop_w)
    wm = np.asarray(water, float) / 255.0
    pm = np.asarray(soft(paper.convert("L"), 1), float) / 255.0
    img = add_light(img, drop, 400, 150, strength=1.0, core=0.1, mask=wm * (0.25 + 0.75 * pm))
    img = lantern(img, drop, 400, 150, soft(writing, 0.6), strength=0.8)
    ripples(img, cam, drop_w, [1.0, 2.2, 3.6, 5.2, 7.0], rng, alpha=170, width=3)
    # the railing in the near ground (iron, cut by the frame)
    dd = ImageDraw.Draw(img)
    for x in range(-20, W + 40, 54):
        dd.line([(x, 1262 - 26 * x / W), (x - 8, H)], fill=grey(38), width=6)
    dd.line([(0, 1266), (W, 1238)], fill=grey(34), width=14)
    # her: the back of her head and hair, coat collar and scarf, her shoulder (cut by the left and bottom), her arm
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dl = ImageDraw.Draw(layer)
    dl.polygon(smooth([(-60, 1300), (60, 1215), (210, 1190), (360, 1225), (470, 1330), (520, 1520), (520, 2000),
                       (-60, 2000)], 10), fill=(42, 42, 42, 255))  # coat and shoulder
    dl.polygon(smooth([(90, 1215), (170, 1150), (280, 1160), (330, 1225), (250, 1262), (140, 1262)], 8),
               fill=(60, 60, 60, 255))  # the scarf round her neck
    dl.ellipse([92, 955, 302, 1180], fill=(38, 38, 38, 255))  # head from behind
    dl.polygon(smooth([(70, 1030), (105, 955), (200, 925), (292, 960), (322, 1040), (318, 1130), (300, 1185),
                       (262, 1218), (226, 1196), (182, 1226), (140, 1200), (96, 1214), (78, 1150)], 10),
               fill=(30, 30, 30, 255))  # hair: a bob, its ends lifting a little
    dl.polygon(smooth([(330, 1222), (420, 1206), (540, 1214), (622, 1222), (640, 1246), (600, 1262), (470, 1262),
                       (360, 1280)], 8), fill=(42, 42, 42, 255))  # her arm out over the rail
    img.alpha_composite(soft(layer, 1.0))
    rim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(rim)
    dr.arc([92, 955, 302, 1180], 330, 400, fill=ink(GOLD, 230), width=5)  # the light on her cheek line
    dr.line([(400, 1262), (600, 1262)], fill=ink(GOLD, 220), width=4)  # and under her arm
    img.alpha_composite(soft(rim, 1.5))
    hand = (636, 1228)
    phone(img, hand, 22)
    light_column(img, (drop[0], drop[1] - 6), (hand[0] + 6, hand[1] + 10), 90, rng, strands=3, sheets=5, bold=1.3)
    caption(img, ["now answer", "your questions"], "answer")
    return finish(img.convert("RGB"))


# --------------------------------------------------------------------------------------------------------- IDEA 3
def idea_lift(houses):
    """COME TO LIGHT: low from a houseboat deck by the bridge, looking up at her against the dusk; the twin's pages
    lift out of the canal, glowing like paper lanterns, and rise in a slow spiral to her open hand."""
    rng = random.Random(37)
    cam = Cam((4.8, 1.5, ZB - 11.5), yaw=-24.0, pitch=15.0, f=1180)
    hv = 186
    img = sky(Image.new("RGB", (W, H)), 86, hv, 1250, rng)
    low = [dict(h, eave=h["eave"] * 0.86, out=[(u, v * 0.86) for (u, v) in h["out"]]) for h in houses]
    boats = [(-1, ZB + 12.0)]
    water, twin, paper, writing = twin_layer(cam, low, rng, [(-8, 0, ZB - 15.5), (-8, 0, 900), (8, 0, 900),
                                                             (8, 0, ZB - 15.5)], boats)
    c0, _ = cam.pt((-0.8, 0.0, ZB - 5.2))
    twin = dim_twin(twin, c0, 480, 300, floor=0.45)
    img.paste(twin.convert("RGBA"), (0, 0), water)
    paint_street(img, cam, low, rng, hv)
    paint_houseboats(img, cam, boats)
    paint_trees(img, cam, rng, [ZB + 12, ZB + 25, ZB + 40, ZB - 21, ZB - 35], sky_lum=hv)
    deck_y = paint_bridge(img, cam, rng)
    drop_w = (-0.8, 0.0, ZB - 5.2)
    drop, _ = cam.pt(drop_w)
    wm = np.asarray(water, float) / 255.0
    pm = np.asarray(soft(paper.convert("L"), 1), float) / 255.0
    img = add_light(img, drop, 300, 140, strength=1.0, core=0.1, mask=wm * (0.3 + 0.7 * pm))
    img = lantern(img, drop, 300, 140, soft(writing, 0.6), strength=0.8)
    foot, _ = cam.pt((-0.9, deck_y(-0.9), ZB - 2.6))
    hand = her_side(img, foot, 250, f=1)
    # the pages lifting off the twin, glowing like paper lanterns, rising in a loose spiral to her reaching hand
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dl = ImageDraw.Draw(layer)
    n = 19
    for i in range(n):
        t = max(0.0, min(1.0, (i + 0.3) / n + rng.uniform(-0.04, 0.04)))
        y = drop[1] + (hand[1] + 40 - drop[1]) * (t ** 0.85) + rng.uniform(-30, 30)
        x = (drop[0] + (hand[0] - drop[0]) * t + math.sin(t * 6.0 + 0.4) * 130 * (1 - t) ** 0.8
             + rng.uniform(-90, 90) * (1 - t) ** 0.6)
        s = 44 * (1 - 0.55 * t) + rng.uniform(-7, 7)
        a = rng.uniform(-0.8, 0.8)
        ca, sa = math.cos(a), math.sin(a)
        cu = s * 0.35 if rng.random() < 0.5 else 0
        quad = [(-s, -s * 1.3), (s - cu, -s * 1.3), (s, -s * 1.3 + cu), (s, s * 1.3), (-s, s * 1.3)]
        q = [(x + u * ca - v * sa, y + u * sa + v * ca) for (u, v) in quad]
        dl.polygon(q, fill=ink(GOLD_HOT, 245))
        for r in range(5):  # the writing showing through the lit paper
            vv = -s * 0.95 + r * s * 0.45
            dl.line([(x + (-s * 0.7) * ca - vv * sa, y + (-s * 0.7) * sa + vv * ca),
                     (x + (s * rng.uniform(0.2, 0.65)) * ca - vv * sa, y + (s * rng.uniform(0.2, 0.65)) * sa + vv * ca)],
                    fill=(170, 112, 40, 210), width=2)
    glow = soft(layer, 18)
    img.alpha_composite(glow)
    img.alpha_composite(glow)
    img.alpha_composite(layer)
    # the near frame: the houseboat's deck edge with potted plants, cut by the bottom right
    dd = ImageDraw.Draw(img)
    dd.polygon([(540, H), (620, 1712), (W, 1618), (W, H)], fill=grey(40))
    leaves = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dlv = ImageDraw.Draw(leaves)
    for px, py, pr in ((740, 1690, 34), (860, 1660, 46), (1000, 1630, 36)):
        dd.polygon([(px - pr * 0.55, py - pr * 1.0), (px + pr * 0.55, py - pr * 1.0), (px + pr * 0.42, py),
                    (px - pr * 0.42, py)], fill=grey(52))
        for k in range(6):  # a soft leafy crown, big shapes, no spiky lines
            ox, oy = rng.uniform(-0.7, 0.7) * pr, rng.uniform(-1.6, -0.9) * pr
            rr = pr * rng.uniform(0.45, 0.7)
            dlv.ellipse([px + ox - rr, py - pr + oy - rr * 0.8, px + ox + rr, py - pr + oy + rr * 0.8],
                        fill=(50, 50, 50, 255))
    img.alpha_composite(soft(leaves, 2))
    caption(img, ["now answer", "your questions"], "answer")
    return finish(img.convert("RGB"))


# --------------------------------------------------------------------------------------------------------- the sheet
def sheet(frames, titles, notes, picked=None, out="ideas_sheet.png"):
    tw, th = 540, 960
    gap, top, bottom = 40, 150, 230
    sw = 3 * tw + 4 * gap
    sh = top + th + bottom
    S = Image.new("RGB", (sw, sh), (236, 233, 228))
    d = ImageDraw.Draw(S)
    fT = ImageFont.truetype(os.path.join(FONTS, "Gaegu-700.woff2"), 56)
    fH = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 26)
    fN = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 21)
    title = "Process test 01, Amsterdam: three whole-frame ideas for the hook's moment"
    size = 56
    while d.textlength(title, font=fT) > sw - 2 * gap and size > 30:
        size -= 2
        fT = ImageFont.truetype(os.path.join(FONTS, "Gaegu-700.woff2"), size)
    d.text((gap, 30), title, font=fT, fill=(40, 36, 34))
    d.text((gap, 100), "Rough value sketches (grey, one accent: the gold of the waking pages). Caption: \"now answer "
           "your questions\". 9:16, each thumbnail about phone size.", font=fN, fill=(80, 74, 70))
    for i, (fr, t, n) in enumerate(zip(frames, titles, notes)):
        x = gap + i * (tw + gap)
        S.paste(fr.resize((tw, th), Image.LANCZOS), (x, top))
        if picked == i:
            d.rectangle([x - 8, top - 8, x + tw + 7, top + th + 7], outline=tuple(int(c) for c in GOLD), width=6)
        d.text((x, top + th + 18), t, font=fH, fill=(40, 36, 34))
        yy = top + th + 58
        for line in n:
            d.text((x, yy), line, font=fN, fill=(70, 64, 60))
            yy += 28
    S.save(os.path.join(HERE, out))
    return S


if __name__ == "__main__":
    rng = random.Random(5)
    houses = make_houses(rng)
    f1 = idea_ring(houses)
    f2 = idea_shoulder(houses)
    f3 = idea_lift(houses)
    if os.environ.get("KEEP_FULL"):  # a folder for the full-size frames (a scratch folder, never the repo)
        for i, f in enumerate((f1, f2, f3), 1):
            f.save(os.path.join(os.environ["KEEP_FULL"], f"idea{i}_full.png"))
    titles = ["1  THE PAPER HALF  (picked)", "2  HER QUESTION LANDS", "3  COME TO LIGHT"]
    notes = [["From a boat on her canal: the bridge and its", "paper twin close into one ring; under her the",
              "pages wake and their light climbs to her phone.", "Gives: a hushed whoa, a glowing door; the twin",
              "runs on through it into the dark."],
             ["Over her shoulder, down her canal: where her", "question fell the twin wakes in rings and the",
              "writing climbs back to her hand.", "Gives: quiet, personal, dim; her dark mass and",
              "the vanishing point split the eye."],
             ["Low from a houseboat deck: the twin's pages", "lift out of the canal like lanterns and rise",
              "in a loose column to her hand.", "Gives: a joyful lift, 'flying letters'; loud,",
              "and the street's twin barely plays."]]
    picked = int(os.environ.get("PICKED", "0"))  # idea 1, THE PAPER HALF, was picked (IDEAS.md)
    sheet([f1, f2, f3], titles, notes, picked=picked)
    print("ok")
