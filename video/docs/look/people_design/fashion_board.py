#!/usr/bin/env python3
"""Draws fashion_board.png (next to this file): the shape thumbnails of fashion.md.

Every figure, head and object is built here from our own numbers (fashion.md sections 3-6, design_research.md,
paint_recipes/people.md): closed smooth loops filled flat, a shade crescent (the part minus itself shifted toward the
key light) and a thin rim on the key side, no outlines. Nothing is traced from a photo or another artist's drawing.
Units: H = 1000 local units, the feet on y = 0, the crown at y = 1000, y up; a profile faces screen-left.

Run: python3 fashion_board.py [out.png]   (PIL + numpy; supersampled 3x, then box-filtered)
"""
import math
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFont

# ============================================================== colour (CIE L*C*h)


def _lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _gam(c):
    c = max(0.0, min(1.0, c))
    v = 12.92 * c if c <= 0.0031308 else 1.055 * c ** (1 / 2.4) - 0.055
    return int(round(max(0.0, min(1.0, v)) * 255))


def hex2rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def rgb2hex(r):
    return '#%02X%02X%02X' % tuple(r)


def _lab(rgb):
    r, g, b = [_lin(c) for c in rgb]
    X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047
    Y = 0.2126 * r + 0.7152 * g + 0.0722 * b
    Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(X), f(Y), f(Z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


def _rgb(lab):
    L, a, b = lab
    fy = (L + 16) / 116
    fx, fz = fy + a / 500, fy - b / 200
    fi = lambda t: t ** 3 if t ** 3 > 0.008856 else (t - 16 / 116) / 7.787
    X, Y, Z = 0.95047 * fi(fx), fi(fy), 1.08883 * fi(fz)
    r = 3.2406 * X - 1.5372 * Y - 0.4986 * Z
    g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z
    b2 = 0.0557 * X - 0.2040 * Y + 1.0570 * Z
    return _gam(r), _gam(g), _gam(b2)


def lch(hexc):
    L, a, b = _lab(hex2rgb(hexc))
    return L, math.hypot(a, b), math.degrees(math.atan2(b, a)) % 360


def from_lch(L, C, h):
    return rgb2hex(_rgb((L, C * math.cos(math.radians(h)), C * math.sin(math.radians(h)))))


def tone(hexc, dL=0.0, Lmul=1.0, Cmul=1.0, toward=None, dh=0.0):
    L, C, h = lch(hexc)
    if toward is not None:
        d = ((toward - h + 180) % 360) - 180
        h += max(-dh, min(dh, d))
    return from_lch(max(0.0, min(100.0, L * Lmul + dL)), C * Cmul, h)


SHADE_HUE, KEY_HUE = 285.0, 70.0


def shade_of(c, mat='cloth'):
    L = lch(c)[0]
    if mat == 'skin':
        return tone(c, Lmul=0.82, Cmul=1.08, toward=25, dh=6)
    if mat == 'hair':
        return tone(c, dL=-7 if L < 30 else -12, Cmul=0.95, toward=SHADE_HUE, dh=8)
    return tone(c, dL=-7 if L < 30 else -15, Cmul=0.95, toward=SHADE_HUE, dh=14)


def rim_of(c, mat='cloth'):
    L = lch(c)[0]
    if mat == 'skin':
        return tone(c, dL=7, Cmul=1.04, toward=KEY_HUE, dh=6)
    return tone(c, dL=16 if L < 30 else 11, Cmul=1.05, toward=KEY_HUE, dh=12)


# ============================================================== geometry


def catmull(pts, closed=True, n=9, corners=()):
    """A smooth curve through pts (uniform Catmull-Rom). A corner index is duplicated (a sharp turn)."""
    P = []
    for i, p in enumerate(pts):
        P.append(p)
        if i in corners:
            P.append(p)
    if not closed:
        P = [P[0]] + P + [P[-1]]
    out = []
    m = len(P)
    rng = range(m) if closed else range(1, m - 2)
    for i in rng:
        p0, p1, p2, p3 = P[(i - 1) % m], P[i % m], P[(i + 1) % m], P[(i + 2) % m]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    if not closed:
        out.append(P[-2])
    return out


def ellipse(cx, cy, rx, ry, rot=0.0, n=48, a0=0.0, a1=360.0):
    r = math.radians(rot)
    out = []
    for k in range(n + 1 if a1 - a0 < 360 else n):
        a = math.radians(a0 + (a1 - a0) * k / n)
        x, y = rx * math.cos(a), ry * math.sin(a)
        out.append((cx + x * math.cos(r) - y * math.sin(r), cy + x * math.sin(r) + y * math.cos(r)))
    return out


def tube(chain, wf, wb, n=8, cap_a=False, cap_b=True):
    """A limb or a trouser leg around a chain of joints. wf / wb: half-widths on the 'front' (-x for a chain going
    down) and the 'back' side at each joint. Widths ease between joints; the end caps are round when asked."""
    pts = catmull(chain, closed=False, n=n)
    m = len(chain) - 1
    # parameter of each dense point along the joint chain
    params = [min(m, k / n) for k in range(len(pts))]

    def w_at(ws, s):
        i = min(int(s), m - 1)
        t = s - i
        t = t * t * (3 - 2 * t)
        return ws[i] * (1 - t) + ws[i + 1] * t

    A, B = [], []
    for k, p in enumerate(pts):
        q0 = pts[max(0, k - 1)]
        q1 = pts[min(len(pts) - 1, k + 1)]
        tx, ty = q1[0] - q0[0], q1[1] - q0[1]
        L = math.hypot(tx, ty) or 1.0
        nx, ny = -ty / L, tx / L       # for a chain going down (0,-1): n = (+1, 0) = the back side
        s = params[k]
        A.append((p[0] + nx * w_at(wb, s), p[1] + ny * w_at(wb, s)))
        B.append((p[0] - nx * w_at(wf, s), p[1] - ny * w_at(wf, s)))
    poly = A[:]
    if cap_b:
        e = pts[-1]
        a0 = math.degrees(math.atan2(A[-1][1] - e[1], A[-1][0] - e[0]))
        r = (w_at(wb, m) + w_at(wf, m)) / 2
        for k in range(1, 8):
            a = math.radians(a0 - 180 * k / 8)
            poly.append((e[0] + r * math.cos(a), e[1] + r * math.sin(a)))
    poly += B[::-1]
    if cap_a:
        e = pts[0]
        a0 = math.degrees(math.atan2(B[0][1] - e[1], B[0][0] - e[0]))
        r = (w_at(wb, 0) + w_at(wf, 0)) / 2
        for k in range(1, 8):
            a = math.radians(a0 - 180 * k / 8)
            poly.append((e[0] + r * math.cos(a), e[1] + r * math.sin(a)))
    return poly


def ik(hip, ankle, l1, l2, fwd=-1):
    """Two-bone IK in a profile; the knee bends toward fwd (-1 = screen left, the figure's front)."""
    dx, dy = ankle[0] - hip[0], ankle[1] - hip[1]
    d = math.hypot(dx, dy)
    d = min(d, l1 + l2 - 1e-3)
    a = math.acos(max(-1, min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))))
    base = math.atan2(dy, dx)
    c1 = (hip[0] + l1 * math.cos(base + a), hip[1] + l1 * math.sin(base + a))
    c2 = (hip[0] + l1 * math.cos(base - a), hip[1] + l1 * math.sin(base - a))
    return c1 if (c1[0] - c2[0]) * fwd > 0 else c2


def lerp(a, b, t):
    return (a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t)


def mirror(poly):
    return [(-x, y) for x, y in poly]


def shift_poly(poly, dx, dy):
    return [(x + dx, y + dy) for x, y in poly]


# ============================================================== parts and the renderer


class P:
    """One part: a closed loop (or a line) with its material and planes."""

    def __init__(self, poly, col, mat='cloth', shade=0.0, rim=0.0, clip=None, name=None, line=0.0,
                 flat=False, mult=None, far=False, closed_line=False):
        self.poly, self.col, self.mat = poly, col, mat
        self.shade, self.rim, self.clip, self.name = shade, rim, clip, name
        self.line, self.flat, self.mult, self.far, self.closed_line = line, flat, mult, far, closed_line


KEY = (-0.92, -0.39)   # toward the key light, screen coords (x right, y down): a low sun from the upper left


def _shifted(m, dx, dy):
    out = np.zeros_like(m)
    dx, dy = int(round(dx)), int(round(dy))
    h, w = m.shape
    ys0, ys1 = max(0, dy), min(h, h + dy)
    xs0, xs1 = max(0, dx), min(w, w + dx)
    if ys1 > ys0 and xs1 > xs0:
        out[ys0:ys1, xs0:xs1] = m[ys0 - dy:ys1 - dy, xs0 - dx:xs1 - dx]
    return out


def render(parts, hpx, S=3, key=KEY, pad=40):
    """Paint parts (in order) at a figure height of hpx screen px. Returns (RGBA image, (gx, gy)): the pixel of the
    local origin (the ground under the figure)."""
    scale = hpx * S / 1000.0
    xs = [x for p in parts for x, _ in p.poly]
    ys = [y for p in parts for _, y in p.poly]
    minx, maxx, miny, maxy = min(xs) - pad, max(xs) + pad, min(ys) - pad, max(ys) + pad
    W = int(math.ceil((maxx - minx) * scale / S)) * S
    Hh = int(math.ceil((maxy - miny) * scale / S)) * S
    ox, oy = -minx * scale, maxy * scale
    rgb = np.zeros((Hh, W, 3), np.float32)
    alpha = np.zeros((Hh, W), np.float32)
    masks = {}

    def pts(poly):
        return [(ox + x * scale, oy - y * scale) for x, y in poly]

    for p in parts:
        im = Image.new('L', (W, Hh), 0)
        dr = ImageDraw.Draw(im)
        if p.line:
            q = pts(p.poly)
            if p.closed_line:
                q = q + q[:1]
            dr.line(q, fill=255, width=max(1, int(round(p.line * scale))), joint='curve')
            r = p.line * scale / 2
            for x, y in (q[0], q[-1]):
                dr.ellipse([x - r, y - r, x + r, y + r], fill=255)
        else:
            dr.polygon(pts(p.poly), fill=255)
        m = np.asarray(im) > 127
        if p.clip:
            clipm = np.zeros_like(m)
            for c in (p.clip if isinstance(p.clip, (list, tuple)) else [p.clip]):
                clipm |= masks.get(c, np.zeros_like(m))
            m &= clipm
        if p.name:
            masks[p.name] = masks.get(p.name, np.zeros_like(m)) | m
        col = p.col
        if p.far:
            col = shade_of(col, p.mat)
        c = np.array(hex2rgb(col), np.float32)
        if p.mult is not None:
            rgb[m] = rgb[m] * np.array(hex2rgb(p.mult), np.float32) / 255.0
            continue
        rgb[m] = c
        alpha[m] = 1.0
        if p.flat:
            continue
        if p.shade:
            d = p.shade * scale
            sm = m & ~_shifted(m, key[0] * d, key[1] * d)
            rgb[sm] = np.array(hex2rgb(shade_of(col, p.mat)), np.float32)
        if p.rim:
            d = p.rim * scale
            rm = m & ~_shifted(m, -key[0] * d, -key[1] * d)
            rgb[rm] = np.array(hex2rgb(rim_of(col, p.mat)), np.float32)
    out = np.dstack([rgb, alpha * 255.0]).clip(0, 255).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA').reduce(S)
    return img, (ox / S, oy / S)


# ============================================================== the body (profile, facing left)

SKIN = {  # design_research.md V5 (lit)
    'S1': '#EBC8B0', 'S2': '#DDAF92', 'S3': '#C79671', 'S4': '#B17A59', 'S5': '#8B5A42', 'S6': '#644132'}
HAIR = {  # design_research.md V6 (+ ours)
    'black': '#2B2324', 'blackbrown': '#3A2B27', 'espresso': '#3A2B27', 'darkbrown': '#533A30',
    'chestnut': '#774D3A', 'copper': '#A25E3B', 'honey': '#CBA577', 'dkblonde': '#A88257'}
C = {  # the wardrobe palette (fashion.md 2.5)
    'cloud': '#F0EAE1', 'cream': '#E9DBCA', 'butter': '#F4E2A5', 'pink': '#E9B9B3', 'sage': '#94A68C',
    'caramel': '#B58058', 'rust': '#AF5A3E', 'red': '#C7463F', 'tomato': '#C8503E', 'denim': '#5781A0',
    'cocoa': '#8B6B5A', 'chocolate': '#664334', 'burgundy': '#743137', 'indigo': '#2F4566', 'navy': '#254161',
    'nearblack': '#3D2C2D', 'leather': '#2E2426', 'teal': '#0B8577', 'tortoise': '#6B4630', 'lens': '#2A2326',
    'white': '#F6F1EA'}


class Body:
    """Landmarks of one figure in a profile (facing left), by sex and pose."""

    def __init__(self, sex='w', pose='stand', stride=1.0, arm='hang', arm_far='hang', heel=0.0):
        self.sex, self.pose = sex, pose
        m = sex == 'm'
        self.m = m
        self.heel = heel   # a heel's height (kitten heel 22): raises the ankle
        # torso, front (-x) and back (+x) profiles (woman / man)
        if m:
            self.front = [(-30, 836), (-58, 790), (-62, 760), (-58, 712), (-51, 640), (-52, 590), (-55, 535)]
            self.back = [(30, 842), (58, 800), (60, 760), (52, 700), (44, 645), (52, 590), (58, 548), (52, 505)]
        else:
            self.front = [(-26, 834), (-50, 798), (-63, 766), (-56, 716), (-45, 632), (-50, 578), (-53, 528)]
            self.back = [(24, 840), (50, 800), (52, 772), (43, 700), (35, 640), (50, 592), (63, 548), (56, 502)]
        self.neck_w = 27 if m else 23
        self.shoulder = (6, 806) if m else (5, 808)
        hipy = 528 if pose == 'walk' else 540
        self.hip_n = (2, hipy)      # the near hip joint
        self.hip_f = (10, hipy + 2)   # the far hip joint
        self.l1, self.l2 = 252, 250
        ay = 45 + heel
        if pose == 'walk':
            s = stride
            # passing-to-contact: the near leg forward, flat; the far leg back, its heel rising
            self.ank_n = (-118 * s, ay)
            self.ank_f = (128 * s, 68 + heel)
            self.toe_lift_f = 22   # degrees the back foot rolls onto its toe
        elif pose == 'standb':   # weight on the back leg, the front foot a step forward and turned out
            self.ank_n = (-40, ay)
            self.ank_f = (26, ay)
            self.toe_lift_f = 0
        else:
            self.ank_n = (-22, ay)
            self.ank_f = (20, ay)
            self.toe_lift_f = 0
        self.knee_n = ik(self.hip_n, self.ank_n, self.l1, self.l2)
        self.knee_f = ik(self.hip_f, self.ank_f, self.l1, self.l2)
        # arms: shoulder -> elbow -> wrist
        self.arm_n = self._arm(arm, near=True)
        self.arm_f = self._arm(arm_far, near=False)

    def _arm(self, kind, near):
        sx, sy = self.shoulder
        if not near:
            sx += 6
        u, f = 182, 160
        if kind == 'hang':
            e = (sx + 10, sy - u)
            w = (e[0] - 6, e[1] - f)
        elif kind == 'swingf':   # swung forward (walking)
            a1, a2 = math.radians(-90 - 16), math.radians(-90 - 30)
            e = (sx + u * math.cos(a1), sy + u * math.sin(a1))
            w = (e[0] + f * math.cos(a2), e[1] + f * math.sin(a2))
        elif kind == 'swingb':   # swung back
            a1, a2 = math.radians(-90 + 18), math.radians(-90 + 8)
            e = (sx + u * math.cos(a1), sy + u * math.sin(a1))
            w = (e[0] + f * math.cos(a2), e[1] + f * math.sin(a2))
        elif kind == 'tuck':     # a bag tucked under the arm: the elbow back, the forearm forward
            a1, a2 = math.radians(-90 + 14), math.radians(-90 - 42)
            e = (sx + u * math.cos(a1), sy + u * math.sin(a1))
            w = (e[0] + f * math.cos(a2), e[1] + f * math.sin(a2))
        elif kind == 'pocket':   # the hand in a trouser pocket (the hip)
            a1, a2 = math.radians(-90 + 16), math.radians(-90 - 24)
            e = (sx + u * math.cos(a1), sy + u * math.sin(a1))
            w = (e[0] + f * math.cos(a2), e[1] + f * math.sin(a2))
        elif kind == 'hold':     # the forearm raised forward (a cup, a phone)
            a1, a2 = math.radians(-90 + 6), math.radians(-90 - 105)
            e = (sx + u * math.cos(a1), sy + u * math.sin(a1))
            w = (e[0] + f * math.cos(a2), e[1] + f * math.sin(a2))
        elif kind == 'strap':    # the hand on a shoulder strap
            a1, a2 = math.radians(-90 + 4), math.radians(-90 - 150)
            e = (sx + u * math.cos(a1), sy + u * math.sin(a1))
            w = (e[0] + f * math.cos(a2), e[1] + f * math.sin(a2))
        else:
            raise ValueError(kind)
        return [(sx, sy), e, w]

    # --- the profile of the torso with an ease (the garment's distance from the body) and its hem
    def torso(self, ease_f=0.0, ease_b=0.0, top=None, hem=None, flare=0.0, hang=False, waist_pinch=1.0):
        """A garment's body loop (front and back profiles with ease), from the neck to the hem (y)."""
        fr = [(x - ease_f, y) for x, y in self.front]
        bk = [(x + ease_b, y) for x, y in self.back]
        if hang:   # hangs straight from the chest / shoulder blades: no waist
            xf = min(x for x, _ in fr[:4])
            fr = fr[:3] + [(xf - 2, fr[3][1]), (xf - 4, (fr[3][1] + 500) / 2)]
            xb = max(x for x, _ in bk[:3])
            bk = bk[:3] + [(max(xb, bk[i][0]) + 2, bk[i][1]) for i in range(3, len(bk))]
        return fr, bk


# ============================================================== builders (the head, the limbs)

def head_profile(sex, skin):
    if sex == 'm':
        pts = [(26, 880), (48, 900), (58, 930), (56, 962), (42, 990), (14, 1004), (-18, 1001), (-40, 988),
               (-52, 966), (-55, 950), (-52, 941), (-55, 934), (-63, 918), (-60, 911), (-56, 908), (-57, 902),
               (-54, 897), (-56, 892), (-54, 882), (-48, 873), (-34, 869), (-10, 872), (8, 884)]
    else:
        pts = [(24, 882), (46, 900), (55, 928), (53, 960), (40, 987), (13, 1001), (-16, 999), (-37, 986),
               (-49, 965), (-52, 950), (-49, 941), (-51, 935), (-60, 919), (-58, 913), (-54, 909), (-55, 904),
               (-52, 900), (-54, 896), (-50, 885), (-44, 876), (-32, 871), (-10, 873), (8, 884)]
    return P(catmull(pts, n=6), skin, 'skin', shade=10, rim=3, name='head')


def neck(sex, skin):
    w = 27 if sex == 'm' else 23
    pts = [(-w + 2, 890), (-w - 1, 858), (-w - 4, 826), (w + 4, 828), (w + 1, 862), (w - 2, 892)]
    return P(catmull(pts, n=6, corners=(2, 3)), skin, 'skin', shade=14, name='neck')


def ear(skin):
    return P(ellipse(6, 922, 8, 13, rot=-8), skin, 'skin', shade=5)


def hand(wrist, elbow, skin, far=False, length=66, width=26):
    ang = math.atan2(wrist[1] - elbow[1], wrist[0] - elbow[0])
    pts = []
    for k in range(24):
        t = 2 * math.pi * k / 24
        # a teardrop: wide near the wrist, tapering to the fingertips
        r = 0.5 * (1 + math.cos(t))
        x = (length * 0.5) * (1 - math.cos(t)) * 0.98
        y = (width / 2) * math.sin(t) * (0.55 + 0.45 * (1 - x / length))
        pts.append((x, y))
    out = [(wrist[0] + x * math.cos(ang) - y * math.sin(ang), wrist[1] + x * math.sin(ang) + y * math.cos(ang))
           for x, y in pts]
    return P(out, skin, 'skin', shade=6, far=far)


def leg_skin(hip, knee, ankle, skin, far=False, name=None, thick=1.0):
    calf = lerp(knee, ankle, 0.28)
    low = lerp(knee, ankle, 0.75)
    chain = [hip, knee, calf, low, ankle]
    wf = [x * thick for x in (52, 27, 27, 17, 15)]
    wb = [x * thick for x in (54, 27, 36, 19, 16)]
    return P(tube(chain, wf, wb), skin, 'skin', shade=14, rim=3, far=far, name=name)


def trouser_leg(hip, knee, ankle, col, cut, far=False, name=None, hem_y=None):
    """cut: wide, straight, slim, relaxed, cargo, legging, short."""
    ank = ankle
    if hem_y is not None:   # extend or cut the leg to a hem height
        t = (knee[1] - hem_y) / max(1e-3, (knee[1] - ankle[1]))
        ank = lerp(knee, ankle, t)
    W = {'wide': ((66, 60, 64), (70, 62, 66)), 'straight': ((58, 50, 50), (62, 52, 52)),
         'slim': ((54, 44, 42), (58, 45, 44)), 'relaxed': ((62, 58, 60), (66, 60, 62)),
         'cargo': ((62, 52, 46), (68, 56, 48)), 'legging': ((52, 28, 18), (55, 30, 19)),
         'short': ((60, 58, 58), (64, 60, 60))}[cut]
    mid = lerp(knee, ank, 0.5)
    chain = [hip, knee, mid, ank]
    wf = [W[0][0], W[0][1], (W[0][1] + W[0][2]) / 2, W[0][2]]
    wb = [W[1][0], W[1][1], (W[1][1] + W[1][2]) / 2, W[1][2]]
    if cut == 'legging':
        calf = lerp(knee, ank, 0.28)
        chain = [hip, knee, calf, ank]
        wf, wb = [52, 27, 27, 16], [55, 28, 35, 17]
    if cut == 'short':
        chain = [hip, lerp(hip, knee, 0.5), ank]
        wf, wb = [60, 58, 58], [64, 60, 60]
    p = tube(chain, wf, wb, cap_b=False)
    if cut != 'short':
        # the hem sits flat on the shoe: square off the bottom
        p = [(x, max(y, (hem_y if hem_y is not None else ankle[1] - 26))) for x, y in p]
    return P(p, col, shade=22, rim=4, far=far, name=name)


def arm_parts(chain, skin, sleeve_col, sleeve_end=1.0, far=False, ease=0.0, cuff=None, name=None, hand_on=True,
              sleeve_w=(34, 30, 26)):
    """A sleeve from the shoulder to sleeve_end of the arm's length (1.0 = the wrist), the skin below it, the hand."""
    s, e, w = chain
    parts = []
    if sleeve_end < 1.0:   # bare forearm (and upper arm) below the sleeve
        parts.append(P(tube([s, e, w], [24, 20, 15], [24, 20, 15], cap_a=True), skin, 'skin', shade=8, rim=2,
                       far=far))
    if sleeve_end > 0:
        if sleeve_end <= 0.53:
            t = sleeve_end / 0.53
            end = lerp(s, e, t)
            ch = [s, lerp(s, end, 0.5), end]
            ws = [sleeve_w[0] + ease, sleeve_w[0] + ease - 2, sleeve_w[1] + ease]
        else:
            t = (sleeve_end - 0.53) / 0.47
            end = lerp(e, w, min(1.0, t))
            ch = [s, e, end]
            ws = [sleeve_w[0] + ease, sleeve_w[1] + ease, sleeve_w[2] + ease]
        parts.append(P(tube(ch, ws, ws, cap_a=True, cap_b=False) + [], sleeve_col, shade=14, rim=4, far=far,
                       name=name))
        if cuff:
            ce = ch[-1]
            prev = ch[-2]
            ang = math.atan2(ce[1] - prev[1], ce[0] - prev[0])
            back = (ce[0] - 16 * math.cos(ang), ce[1] - 16 * math.sin(ang))
            parts.append(P(tube([back, ce], [ws[-1] + 1, ws[-1] + 1], [ws[-1] + 1, ws[-1] + 1], cap_b=False),
                           cuff, shade=6, far=far))
    if hand_on:
        parts.append(hand(w, e, skin, far=far))
    return parts
