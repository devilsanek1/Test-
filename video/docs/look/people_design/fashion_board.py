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


def _cr_open(P, n):
    """An open uniform Catmull-Rom through P (its ends pass through the first and last points)."""
    Q = [P[0]] + list(P) + [P[-1]]
    out = []
    for i in range(1, len(Q) - 2):
        p0, p1, p2, p3 = Q[i - 1], Q[i], Q[i + 1], Q[i + 2]
        for k in range(n):
            t = k / n
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                    + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
    out.append(tuple(P[-1]))
    return out


def catmull(pts, closed=True, n=9, corners=()):
    """A smooth curve through pts (uniform Catmull-Rom). At a corner index the curve turns sharply (the loop is cut
    into smooth runs between corners)."""
    pts = [tuple(p) for p in pts]
    if not closed:
        return _cr_open(pts, n)
    cs = sorted(set(c % len(pts) for c in corners))
    if not cs:
        m = len(pts)
        out = []
        for i in range(m):
            p0, p1, p2, p3 = pts[(i - 1) % m], pts[i], pts[(i + 1) % m], pts[(i + 2) % m]
            for k in range(n):
                t = k / n
                t2, t3 = t * t, t * t * t
                out.append(tuple(0.5 * ((2 * p1[j]) + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2
                                        + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3) for j in (0, 1)))
        return out
    rot = pts[cs[0]:] + pts[:cs[0]]
    cs = [(c - cs[0]) for c in cs] + [len(pts)]
    rot = rot + [rot[0]]
    out = []
    for a, b in zip(cs, cs[1:]):
        run = rot[a:b + 1]
        seg = _cr_open(run, n) if len(run) > 2 else list(run)
        out += seg[:-1]
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

        def ankle(ball_x, th):
            t = math.radians(th)
            return (ball_x + 85 * math.cos(t) - ay * math.sin(t), 85 * math.sin(t) + ay * math.cos(t))
        if pose == 'walk':
            s = stride
            self.th_n, self.th_f = 0.0, 22.0
            self.ank_n = ankle(-118 * s - 85, 0.0)
            self.ank_f = ankle(70 * s, 22.0)
        elif pose == 'standb':   # weight on the back leg, the front foot a little forward
            self.th_n = self.th_f = 0.0
            self.ank_n = ankle(-40 - 85, 0.0)
            self.ank_f = ankle(26 - 85, 0.0)
        else:
            self.th_n = self.th_f = 0.0
            self.ank_n = ankle(-22 - 85, 0.0)
            self.ank_f = ankle(20 - 85, 0.0)
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


# ============================================================== shoes (local: the ankle at x = 0, the ball at -85)

def _foot_xf(pts, ankle, theta, ay_local):
    """Rotate a foot about its ball (-85, 0) by theta (deg, heel up) and move it so its ankle sits on `ankle`."""
    t = math.radians(theta)
    bx, by = -85.0, 0.0

    def rot(p):
        x, y = p[0] - bx, p[1] - by
        return (bx + x * math.cos(t) - y * math.sin(t), by + x * math.sin(t) + y * math.cos(t))
    a = rot((0.0, ay_local))
    dx, dy = ankle[0] - a[0], ankle[1] - a[1]
    return [(q[0] + dx, q[1] + dy) for q in (rot(p) for p in pts)]


FOOT = [(15, 64), (27, 34), (30, 10), (22, 0), (-112, 0), (-126, 6), (-118, 17), (-72, 28), (-32, 42), (-15, 64)]


def shoe(kind, ankle, theta, col, skin, far=False, accent=None, sock=None, heel=0):
    """The foot and its shoe in a profile. Returns parts (skin first)."""
    ay = 45 + heel
    xf = lambda pts: _foot_xf(pts, ankle, theta, ay)
    out = []
    sole = tone(col, dL=-9) if lch(col)[0] > 30 else tone(col, dL=10)
    if kind in ('flat', 'sandal'):
        out.append(P(xf(catmull(FOOT, n=5)), skin, 'skin', shade=8, far=far))
    if sock:
        out.append(P(xf([(19, 30), (21, 76), (-17, 76), (-20, 30)]), sock, shade=6, far=far))
    if kind == 'flat':
        body = [(31, 0), (32, 15), (25, 21), (0, 19), (-34, 18), (-62, 23), (-96, 19), (-120, 10), (-130, 3), (-125, 0)]
        out.append(P(xf(catmull(body, n=5, corners=(0, 9))), col, shade=8, rim=3, far=far, name='shoe'))
        out.append(P(xf([(32, 0), (32, 4), (-128, 4), (-128, 0)]), sole, flat=True, clip='shoe', far=far))
    elif kind == 'sandal':
        out.append(P(xf([(31, 0), (31, 8), (-124, 8), (-130, 4), (-126, 0)]), sole, shade=0, far=far))
        out.append(P(xf(catmull([(-52, 8), (-60, 30), (-96, 23), (-104, 8)], n=5, corners=(0, 3))), col, shade=5,
                     far=far))
    elif kind in ('sneaker', 'runner'):
        th = 9 if kind == 'sneaker' else 13
        body = [(32, 0), (34, 30), (28, 45), (8, 41), (-8, 51), (-22, 45), (-62, 31), (-102, 22), (-124, 14),
                (-132, 6), (-127, 0)]
        out.append(P(xf(catmull(body, n=5, corners=(0, 10))), col, shade=8, rim=3, far=far, name='shoe'))
        out.append(P(xf([(36, 0), (36, th), (-136, th), (-136, 0)]), tone(col, dL=-4) if lch(col)[0] > 80 else
                     '#EFE6DA', flat=True, clip='shoe', far=far))
        if accent:
            out.append(P(xf([(-76, th), (-56, th), (12, 38), (-4, 42)]), accent, flat=True, clip='shoe', far=far))
    elif kind == 'loafer':
        body = [(30, 0), (32, 30), (24, 40), (-6, 38), (-46, 40), (-82, 30), (-112, 20), (-128, 8), (-124, 0)]
        out.append(P(xf(catmull(body, n=5, corners=(0, 8))), col, shade=8, rim=4, far=far, name='shoe'))
        out.append(P(xf([(-36, 26), (-30, 44), (-48, 45), (-55, 28)]), tone(col, dL=-6 if lch(col)[0] > 25 else 8),
                     flat=True, clip='shoe', far=far))
        out.append(P(xf([(32, 0), (32, 5), (-128, 5), (-128, 0)]), sole, flat=True, clip='shoe', far=far))
    elif kind == 'kitten':
        foot = [(14, 86), (26, 54), (28, 30), (22, 25), (-10, 16), (-60, 6), (-112, 0), (-128, 3), (-120, 12),
                (-72, 26), (-32, 50), (-14, 86)]
        out.append(P(xf(catmull(foot, n=5)), skin, 'skin', shade=8, far=far))
        out.append(P(xf(catmull([(-136, 1), (-120, 13), (-80, 25), (-60, 27), (-56, 10), (-84, 3), (-112, 0)], n=5,
                                corners=(0, 4))), col, shade=6, rim=3, far=far))
        out.append(P(xf([(-58, 9), (-20, 17), (26, 25), (28, 19), (-20, 11), (-58, 3)]), col, shade=0, far=far))
        out.append(P(xf([(17, 21), (26, 21), (23, 0), (19, 0)]), col, shade=0, far=far))
        out.append(P(xf([(25, 40), (12, 46), (-2, 46)]), col, line=5, far=far))
    elif kind == 'chunky':   # dated (the board's dated row)
        body = [(38, 0), (42, 52), (30, 70), (2, 64), (-22, 76), (-74, 56), (-124, 44), (-146, 24), (-148, 0)]
        out.append(P(xf(catmull(body, n=5, corners=(0, 8))), col, shade=10, rim=3, far=far, name='shoe'))
        out.append(P(xf([(44, 0), (44, 26), (-150, 26), (-150, 0)]), '#E9E2D8', flat=True, clip='shoe', far=far))
    elif kind == 'bootie':   # dated: an ankle bootie with a block heel
        body = [(30, 0), (32, 30), (28, 130), (-26, 130), (-30, 70), (-70, 34), (-112, 18), (-130, 6), (-124, 0),
                (-60, 0), (-40, 10), (10, 10), (10, 0)]
        out.append(P(xf(catmull(body, n=5, corners=(0, 2, 3, 9, 10, 11, 12))), col, shade=8, rim=3, far=far))
    elif kind == 'blob':     # dated: our old round feet
        out.append(P(xf(ellipse(-44, 22, 78, 26)), col, shade=6, far=far))
    return out


# ============================================================== garments

def _cut(profile, hem, flare, sign):
    """Cut a top-to-bottom profile at the hem; extend it with a flare when the hem is lower than the profile."""
    out = []
    for i, (x, y) in enumerate(profile):
        if y > hem:
            out.append((x, y))
        else:
            x0, y0 = profile[i - 1]
            t = (y0 - hem) / max(1e-6, (y0 - y))
            out.append((x0 + (x - x0) * t + sign * flare, hem))
            return out
    x0, y0 = out[-1]
    out.append((x0 + sign * flare, hem))
    return out


def top_loop(body, hem, ease_f=8, ease_b=8, flare_f=0.0, flare_b=0.0, hang=False, collar=0, neck_open=0,
             hem_curve=0.0, open_front=0.0, front_hem=None):
    """A garment's body in a profile: from the back of the collar down the back, the hem, up the front."""
    fr, bk = body.torso(ease_f, ease_b, hang=hang)
    if hang:
        # straight from the chest's most forward point / from the shoulder blades
        top_f = fr[:3]
        xf = min(x for x, _ in top_f)
        fr = top_f + [(xf - 3 - flare_f * 0.25, 640), (xf - 5 - flare_f * 0.5, 420)]
        xb = max(x for x, _ in bk[:3])
        bk = bk[:3] + [(xb + 4, 640), (max(xb + 6, bk[6][0] + 2), 548), (max(xb + 6, bk[6][0] + 2) + flare_b * 0.4, 420)]
    if open_front:
        fr = [fr[0]] + [(x + open_front * min(1.0, (fr[0][1] - y) / 70.0), y) for x, y in fr[1:]]
    fh = front_hem if front_hem is not None else hem
    F = _cut(fr, fh, flare_f, -1)
    B = _cut(bk, hem, flare_b, +1)
    top = [(B[0][0] - 2, B[0][1] + 6 + collar), (6, 852 + collar * 0.4), (F[0][0] + neck_open, F[0][1] + 4 + collar * 0.5)]
    loop = [top[0]] + B[1:] + [((B[-1][0] + F[-1][0]) / 2, (hem + fh) / 2 - hem_curve)] + F[::-1][:-1] + top[1:][::-1]
    # corners: the two hem corners
    i_bh = len(B)
    i_fh = len(B) + 1
    return catmull(loop, n=7, corners=(i_bh - 0, i_fh))


def skirt_loop(body, hem, kind='aline', flare=1.0):
    wy = 628
    if kind == 'aline':
        pts = [(36, wy + 4), (52, 590), (66, 545), (78 + 30 * flare, 380), (96 + 40 * flare, hem), (-96 - 34 * flare, hem),
               (-76 - 26 * flare, 380), (-56, 545), (-47, wy + 2)]
        return catmull(pts, n=7, corners=(4, 5))
    # bias slip: clings at the hip, swings below the knee
    pts = [(36, wy + 4), (52, 590), (64, 545), (60, 470), (64, 380), (80 * flare, 260), (98 * flare, hem),
           (-92 * flare, hem - 6), (-78 * flare, 260), (-60, 380), (-54, 470), (-52, 540), (-46, wy + 2)]
    return catmull(pts, n=7, corners=(6, 7))


# ============================================================== hair, profile (facing left)

def mix(a, b, t):
    A, B = hex2rgb(a), hex2rgb(b)
    return rgb2hex([int(round(A[i] + (B[i] - A[i]) * t)) for i in range(3)])


def lobes(cx, cy, rx, ry, n, amp, a0, a1, seed=1, rot=0.0):
    """A cloud outline of n unequal lobes on an ellipse arc (curls)."""
    rng = np.random.RandomState(seed)
    sizes = rng.uniform(0.6, 1.4, n)
    sizes = sizes / sizes.sum() * (a1 - a0)
    out = []
    a = a0
    for s in sizes:
        for k in range(8):
            t = k / 8
            ang = math.radians(a + s * t + rot)
            bump = 1 + amp * math.sin(math.pi * t) * (0.7 + 0.3 * s / ((a1 - a0) / n))
            out.append((cx + rx * bump * math.cos(ang), cy + ry * bump * math.sin(ang)))
        a += s
    return out


def sheen(poly_pts, col, name_clip, dl=15):
    return P(poly_pts, tone(col, dL=dl, toward=KEY_HUE, dh=6), flat=True, clip=name_clip)


def hair_profile(style, col, skin, cap=False):
    """Returns (parts behind the head, parts over the head)."""
    behind, over = [], []
    sh = 'hair'
    if style == 'bob':      # H1 the textured ("ripped") bob
        pts = [(-46, 990), (-50, 972), (-40, 948), (-33, 914), (-31, 884), (-28, 862), (-16, 872), (-6, 858),
               (8, 870), (22, 856), (36, 868), (50, 857), (62, 870), (68, 904), (68, 944), (60, 980), (36, 1008),
               (0, 1015), (-30, 1006)]
        over.append(P(catmull(pts, n=6, corners=(5, 6, 7, 8, 9, 10, 11, 12)), col, sh, shade=14, rim=3, name='hair'))
        over.append(sheen(catmull([(-30, 1000), (0, 1008), (34, 1000), (52, 982), (40, 986), (0, 994), (-28, 988)], n=5),
                          col, 'hair'))
    elif style == 'layers':  # H2 long layers, curtain bangs, bouncy ends
        back = [(14, 900), (28, 858), (34, 812), (38, 768), (44, 738), (58, 722), (72, 732), (84, 718), (98, 734),
                (102, 772), (96, 830), (84, 890), (70, 940)]
        behind.append(P(catmull(back + [(40, 960)], n=6), col, sh, shade=16, rim=3, far=False, name='hairb'))
        pts = [(-30, 1008), (-50, 990), (-58, 966), (-54, 942), (-44, 924), (-36, 932), (-32, 950), (-22, 930),
               (-12, 905), (4, 892), (24, 900), (52, 920), (66, 950), (60, 985), (34, 1010), (0, 1016)]
        over.append(P(catmull(pts, n=6), col, sh, shade=12, rim=3, name='hair'))
        over.append(sheen(catmull([(-28, 1004), (2, 1010), (34, 1002), (50, 984), (36, 990), (0, 998), (-26, 994)], n=5),
                          col, 'hair'))
    elif style == 'clip':    # H3 the claw-clip twist
        pts = [(-44, 986), (-48, 968), (-38, 950), (-28, 936), (-10, 922), (8, 902), (30, 890), (48, 898), (60, 926),
               (62, 962), (50, 994), (16, 1010), (-24, 1005)]
        over.append(P(catmull(pts, n=6), col, sh, shade=12, rim=3, name='hair'))
        twist = [(40, 990), (62, 996), (78, 970), (78, 930), (66, 904), (52, 908), (50, 950)]
        over.append(P(catmull(twist, n=5), tone(col, dL=-4), sh, shade=8, rim=3))
        for a, L in ((58, 40), (80, 48), (102, 42), (124, 30)):
            r = math.radians(a)
            base = (64, 990)
            tip = (base[0] + L * math.cos(r), base[1] + L * math.sin(r))
            side = (math.cos(r + 1.57) * 8, math.sin(r + 1.57) * 8)
            over.append(P(catmull([(base[0] - side[0], base[1] - side[1]), tip, (base[0] + side[0], base[1] + side[1])],
                                  n=4, corners=(1,)), col, sh, shade=3, rim=2))
        over.append(P(catmull([(50, 966), (88, 964), (92, 948), (86, 936), (50, 940), (46, 952)], n=4,
                              corners=(0, 4)), C['tortoise'], shade=4, rim=2))
        over.append(P(catmull([(-36, 958), (-42, 930), (-38, 902), (-32, 882)], closed=False, n=5), col, line=5))
        over.append(sheen(catmull([(-28, 1000), (6, 1006), (40, 998), (24, 992), (-24, 992)], n=5), col, 'hair'))
    elif style == 'bun':     # H4 the soft low bun with tendrils
        pts = [(-44, 986), (-47, 968), (-36, 948), (-24, 930), (-6, 918), (12, 900), (30, 890), (48, 898), (60, 928),
               (60, 962), (46, 994), (14, 1010), (-20, 1006)]
        over.append(P(catmull(pts, n=6), col, sh, shade=12, rim=3, name='hair'))
        over.append(P(ellipse(54, 892, 24, 19, rot=-15), col, sh, shade=8, rim=2))
        over.append(P(catmull([(-30, 950), (-36, 924), (-30, 902), (-34, 880)], closed=False, n=6), col, line=4))
        over.append(sheen(catmull([(-30, 998), (4, 1004), (36, 994), (20, 988), (-26, 990)], n=5), col, 'hair'))
    elif style == 'pony':    # H5 the sleek low ponytail
        pts = [(-44, 985), (-46, 968), (-36, 950), (-24, 932), (-6, 918), (12, 900), (30, 890), (48, 896), (58, 926),
               (58, 962), (44, 994), (12, 1006), (-20, 1003)]
        over.append(P(catmull(pts, n=6), col, sh, shade=10, rim=3, name='hair'))
        tail = tube([(48, 900), (62, 860), (72, 800), (76, 750), (74, 715)], [11, 13, 11, 7, 2], [11, 13, 11, 7, 2],
                    cap_a=True)
        behind.append(P(tail, col, sh, shade=10, rim=2, name='tail'))
        over.append(P(ellipse(50, 900, 9, 7), tone(col, dL=-6), flat=True))
        over.append(sheen(catmull([(-32, 996), (6, 1002), (40, 990), (24, 984), (-28, 988)], n=5), col, 'hair', dl=24))
        behind.append(sheen(catmull([(56, 860), (68, 820), (72, 780), (66, 800), (58, 840)], n=4), col, 'tail', dl=20))
    elif style == 'braids':  # H6 boho knotless braids
        back = [(16, 900), (30, 850), (40, 760), (46, 660), (54, 590), (66, 572), (80, 584), (94, 572), (108, 590),
                (112, 640), (108, 740), (96, 840), (82, 905), (66, 950)]
        behind.append(P(catmull(back + [(36, 960)], n=6), col, sh, shade=14, rim=3, name='hairb'))
        for k in range(3):
            x0 = 56 + k * 14
            behind.append(P(catmull([(x0, 900), (x0 + 6, 780), (x0 + 10, 680), (x0 + 12, 610)], closed=False, n=5),
                            tone(col, dL=-7), line=3, clip='hairb'))
        behind.append(P(lobes(82, 588, 38, 30, 7, 0.34, 175, 365, seed=4) + [(118, 640), (46, 640)],
                        mix(col, '#B5875C', 0.85), 'hair', shade=8, rim=2))
        pts = [(-44, 986), (-47, 968), (-36, 948), (-24, 930), (-6, 916), (12, 900), (30, 892), (50, 902), (62, 932),
               (62, 966), (46, 998), (14, 1010), (-20, 1006)]
        over.append(P(catmull(pts, n=6), col, sh, shade=12, rim=3, name='hair'))
        over.append(P(ellipse(30, 1012, 20, 16), col, sh, shade=6, rim=2))
        for k in range(4):
            over.append(P(catmull([(-30 + k * 18, 1004 - abs(k - 1.5) * 4), (-24 + k * 20, 960), (-10 + k * 20, 920)],
                                  closed=False, n=4), tone(col, dL=-7), line=3, clip='hair'))
    elif style == 'curls':   # H7 natural curls
        body = lobes(14, 948, 76, 70, 11, 0.13, -70, 250, seed=7)
        cloud = [(-34, 932), (-30, 900), (-14, 872)] + [p for p in body if not (p[0] < -10 and p[1] < 930)]
        over.append(P(catmull(body, n=2), col, sh, shade=16, rim=4, name='hair'))
        for (x, y, r) in ((-20, 996, 14), (14, 1006, 16), (46, 986, 14), (64, 950, 12)):
            over.append(P(ellipse(x, y, r, r * 0.55, a0=200, a1=340, n=10) + [(x, y - r * 0.2)],
                          tone(col, dL=16, toward=KEY_HUE, dh=6), flat=True, clip='hair'))
        # the face's edge stays clear: cut the front with the skin
        over.append(P([(-70, 900), (-70, 975), (-46, 975), (-36, 950), (-28, 925), (-24, 900), (-28, 860), (-70, 860)],
                      skin, 'skin', flat=True, clip='hair'))
    elif style == 'crop':    # H8 the textured / French crop with a low taper
        pts = [(-55, 980), (-50, 996), (-38, 1010), (-24, 1016), (-14, 1012), (0, 1022), (18, 1019), (36, 1012),
               (52, 996), (62, 970), (64, 942), (58, 916), (46, 898), (32, 890), (20, 908), (12, 932), (-2, 940),
               (-8, 918), (-16, 914), (-22, 942), (-34, 962), (-46, 970)]
        over.append(P(catmull(pts, n=6, corners=(0, 3, 4, 5)), col, sh, shade=10, rim=3, name='hair'))
        over.append(P(catmull([(-30, 932), (10, 940), (40, 944), (70, 950), (74, 870), (-30, 870)], n=4,
                              corners=(3, 4, 5)), mix(col, skin, 0.5), flat=True, clip='hair'))
        over.append(sheen(catmull([(-36, 1004), (-4, 1014), (34, 1006), (18, 1000), (-30, 998)], n=5), col, 'hair'))
    elif style == 'twists':  # H9 twists on a taper
        pts = [(-46, 982), (-36, 996), (0, 1004), (40, 996), (58, 966), (60, 930), (48, 900), (32, 890), (20, 910),
               (12, 932), (-2, 940), (-8, 918), (-16, 914), (-22, 942), (-34, 962)]
        over.append(P(catmull(pts, n=6), mix(col, skin, 0.45), sh, shade=6, name='fade'))
        nubs = [(-40, 994, 115), (-26, 1004, 105), (-10, 1011, 95), (6, 1013, 88), (22, 1010, 80), (36, 1004, 70),
                (50, 992, 60), (58, 976, 45), (-30, 1018, 100), (-12, 1026, 92), (6, 1028, 84), (24, 1024, 74),
                (40, 1016, 64)]
        for (x, y, a) in nubs:
            over.append(P(ellipse(x, y, 11, 15, rot=a - 90), col, sh, shade=5, rim=3))
        for (x, y) in ((-24, 1012), (8, 1020), (36, 1010)):
            over.append(P(ellipse(x, y + 4, 3, 2), tone(col, dL=22), flat=True))
    elif style == 'curtains':  # H10 soft curtains with a longer nape
        pts = [(-12, 1018), (-38, 1006), (-54, 988), (-58, 966), (-52, 950), (-42, 940), (-34, 948), (-24, 966),
               (-14, 946), (-8, 918), (2, 896), (18, 878), (36, 862), (54, 858), (64, 880), (68, 916), (66, 954),
               (54, 990), (26, 1014)]
        over.append(P(catmull(pts, n=6, corners=(5, 7)), col, sh, shade=12, rim=3, name='hair'))
        over.append(P(catmull([(-12, 1018), (-20, 1002), (-30, 984)], closed=False, n=4), tone(col, dL=-10), line=3,
                      clip='hair'))
        over.append(sheen(catmull([(-30, 1000), (0, 1010), (36, 1000), (20, 994), (-26, 992)], n=5), col, 'hair'))
    elif style == 'capony':  # H5 through a cap: the tail from the cap's back opening
        pts = [(-44, 978), (-46, 962), (-36, 948), (-24, 932), (-6, 918), (12, 900), (30, 890), (48, 896), (58, 926),
               (58, 962), (44, 984), (-20, 990)]
        over.append(P(catmull(pts, n=6), col, sh, shade=10, rim=3, name='hair'))
        tail = tube([(56, 966), (72, 930), (82, 872), (84, 812), (78, 770)], [12, 14, 12, 7, 2], [12, 14, 12, 7, 2],
                    cap_a=True)
        over.append(P(tail, col, sh, shade=10, rim=2, name='tail'))
        over.append(sheen(catmull([(70, 920), (80, 870), (82, 830), (76, 850), (68, 900)], n=4), col, 'tail', dl=20))
    elif style == 'buzz':    # H10b the overgrown buzz
        pts = [(-44, 980), (-36, 996), (0, 1006), (40, 996), (58, 966), (58, 930), (46, 900), (30, 892), (18, 914),
               (6, 932), (-10, 948), (-28, 962), (-40, 970)]
        over.append(P(catmull(pts, n=6), mix(col, skin, 0.25), sh, shade=6, rim=2, name='hair'))
    elif style == 'none':
        pass
    return behind, over


# ============================================================== accessories (profile)

def sunglasses(kind='big'):
    if kind == 'big':
        lens = [(-60, 953), (-34, 956), (-28, 944), (-33, 922), (-55, 919), (-62, 934)]
    elif kind == 'wrap':
        lens = [(-61, 954), (-24, 958), (-8, 950), (-22, 932), (-58, 927)]
    else:  # tiny oval (dated)
        lens = ellipse(-48, 940, 9, 7)
    out = [P(catmull(lens, n=5) if kind != 'oval' else lens, C['lens'], shade=0, rim=2, name='lens')]
    if kind != 'oval':
        out.append(P([(-56, 950), (-44, 952), (-50, 940)], '#6E6370', flat=True, clip='lens'))
    out.append(P([(-30, 946), (-4, 942), (8, 936)], C['lens'], line=4))
    return out


def headphones(col='#2E2A2C'):
    band = catmull([(10, 950), (16, 986), (12, 1010), (0, 1017), (-12, 1014)], closed=False, n=6)
    return [P(band, col, line=11), P(ellipse(8, 926, 25, 31, rot=-6), col, shade=6, rim=3),
            P(ellipse(4, 926, 14, 20, rot=-6), tone(col, dL=8), flat=True)]


def cap(col, backward=False, pony=None):
    out = []
    dome = [(-46, 966), (-44, 994), (-18, 1022), (22, 1026), (52, 1006), (62, 974), (40, 962), (0, 962)]
    out.append(P(catmull(dome, n=6, corners=(0, 5)), col, shade=10, rim=3, name='cap'))
    out.append(P([(-50, 966), (66, 972), (66, 962), (-50, 958)], tone(col, dL=-8), flat=True, clip='cap'))
    if backward:
        out.append(P(catmull([(52, 974), (104, 962), (112, 954), (56, 960)], n=4, corners=(0, 3)), tone(col, dL=-5),
                     shade=4))
    else:
        out.append(P(catmull([(-44, 970), (-102, 962), (-110, 956), (-46, 960)], n=4, corners=(0, 3)),
                     tone(col, dL=-5), shade=4, rim=2))
    return out


def bag_tucked(col):
    pts = [(-28, 712), (48, 718), (78, 692), (68, 646), (12, 630), (-26, 654)]
    return [P(catmull(pts, n=6), col, shade=10, rim=3)]


def bag_eastwest(col):
    pts = [(-46, 668), (70, 668), (80, 652), (70, 634), (-46, 634), (-56, 652)]
    return [P(catmull(pts, n=5, corners=()), col, shade=8, rim=3)]


def tote(col, x0=8):
    pts = [(x0, 654), (x0 + 112, 654), (x0 + 124, 470), (x0 + 112, 456), (x0 + 2, 456), (x0 - 8, 470)]
    return [P([(x0 + 18, 650), (6, 832)], tone(col, dL=-8), line=7), P(catmull(pts, n=5, corners=(0, 1)), col,
                                                                        shade=12, rim=3)]


def iced_coffee(at):
    x, y = at
    cup = [(x - 26, y + 52), (x + 26, y + 52), (x + 21, y - 48), (x - 21, y - 48)]
    return [P(cup, '#E7D8C8', shade=0, name='cup'),
            P([(x - 26, y + 18), (x + 26, y + 18), (x + 21, y - 48), (x - 21, y - 48)], '#A87454', flat=True,
              clip='cup'),
            P(catmull([(x - 28, y + 52), (x - 20, y + 64), (x + 20, y + 64), (x + 28, y + 52)], n=4), '#F6F1EA',
              shade=0),
            P([(x + 6, y + 62), (x + 14, y + 104)], '#F6F1EA', line=5)]


# ============================================================== assembling a figure

ORDER = ['far_arm', 'far_leg', 'far_shoe', 'near_leg', 'near_leg_det', 'near_shoe', 'neck', 'inner', 'bottom_over',
         'bottom_det', 'top', 'top_det', 'hair_back', 'head', 'hair', 'head_acc', 'bag', 'near_arm', 'hand_item']


class Fig:
    def __init__(self, sex, pose, skin, arm_n='hang', arm_f='hang', heel=0, stride=1.0):
        self.b = Body(sex, pose, stride=stride, arm=arm_n, arm_far=arm_f, heel=heel)
        self.sex, self.skin, self.heel = sex, SKIN[skin] if skin in SKIN else skin, heel
        self.L = {k: [] for k in ORDER}

    def add(self, layer, parts):
        self.L[layer] += parts if isinstance(parts, list) else [parts]

    def parts(self):
        return [p for k in ORDER for p in self.L[k]]

    # ---- the pieces every figure has
    def legs(self, cut=None, col=None, hem_y=None, fade=None, piping=None):
        b, s = self.b, self.skin
        for side in ('f', 'n'):
            hip, knee, ank = (b.hip_f, b.knee_f, b.ank_f) if side == 'f' else (b.hip_n, b.knee_n, b.ank_n)
            layer = 'far_leg' if side == 'f' else 'near_leg'
            far = side == 'f'
            if cut in (None, 'short'):
                self.add(layer, leg_skin(hip, knee, ank, s, far=far))
            if cut == 'short':
                self.add(layer, trouser_leg(hip, knee, ank, col, 'short', far=far, hem_y=hem_y))
            elif cut:
                self.add(layer, trouser_leg(hip, knee, ank, col, cut, far=far, name='leg_' + side,
                                            hem_y=hem_y))
                if side == 'n' and fade:
                    c = lerp(hip, knee, 0.55)
                    self.add('near_leg_det', P(ellipse(c[0] - 26, c[1], 20, 74, rot=4), tone(col, dL=fade),
                                               flat=True, clip='leg_n'))
                if side == 'n' and piping:
                    self.add('near_leg_det', P([lerp(hip, knee, 0.0), knee, lerp(knee, ank, 0.98)], piping, line=4,
                                               clip='leg_n'))

    def feet(self, kind, col, accent=None, sock=None):
        b = self.b
        self.add('far_shoe', shoe(kind, b.ank_f, b.th_f, col, self.skin, far=True, accent=accent, sock=sock,
                                  heel=self.heel))
        self.add('near_shoe', shoe(kind, b.ank_n, b.th_n, col, self.skin, far=False, accent=accent, sock=sock,
                                   heel=self.heel))

    def arms(self, col, end=0.97, ease=0.0, cuff=None, hand_n=True, hand_f=True, w=(34, 30, 26), name='sleeve_n'):
        self.add('far_arm', arm_parts(self.b.arm_f, self.skin, col, end, far=True, ease=ease, cuff=cuff,
                                      hand_on=hand_f, sleeve_w=w))
        self.add('near_arm', arm_parts(self.b.arm_n, self.skin, col, end, far=False, ease=ease, cuff=cuff,
                                       hand_on=hand_n, sleeve_w=w, name=name))

    def head(self, hair, hair_col, ear_on=False):
        self.add('neck', neck(self.sex, self.skin))
        self.add('head', head_profile(self.sex, self.skin))
        behind, over = hair_profile(hair, HAIR.get(hair_col, hair_col), self.skin)
        self.add('hair_back', behind)
        self.add('hair', over)
        if ear_on:
            self.add('hair', ear(self.skin))

    # ---- helpers on the torso
    def fx(self, y, ease=0.0):
        return _interp(self.b.front, y) - ease

    def bx(self, y, ease=0.0):
        return _interp(self.b.back, y) + ease


def _interp(profile, y):
    for (x0, y0), (x1, y1) in zip(profile, profile[1:]):
        if y1 <= y <= y0:
            t = (y0 - y) / max(1e-6, y0 - y1)
            return x0 + (x1 - x0) * t
    return profile[-1][0] if y < profile[-1][1] else profile[0][0]


def band(f, y0, y1, ease_f, ease_b, col, clip=None, flat=True):
    return P([(f.fx(y0, ease_f), y0), (f.bx(y0, ease_b), y0), (f.bx(y1, ease_b), y1), (f.fx(y1, ease_f), y1)],
             col, flat=flat, clip=clip, shade=0 if flat else 8)


def neckline(col, sex='w', kind='crew'):
    if kind == 'crew':
        pts = [(-30, 842), (-14, 850), (8, 852), (10, 840), (-14, 836), (-29, 832)]
    elif kind == 'shirt':
        pts = [(28, 862), (8, 870), (-22, 856), (-32, 838), (-16, 842), (20, 848)]
    elif kind == 'vee':   # the lay-flat camp collar's open V (skin), the collar around it
        pts = [(-31, 842), (-12, 848), (-44, 770), (-52, 792)]
    return P(catmull(pts, n=4), col, shade=5, rim=2)


def lapel(col, open_x=0):
    pts = [(34, 868), (12, 878), (-22, 862), (-50 + open_x, 800), (-40 + open_x, 776), (-20 + open_x, 820), (8, 852),
           (30, 852)]
    return P(catmull(pts, n=4, corners=(3, 4)), col, shade=6, rim=3)


# ============================================================== the fourteen looks (fashion.md section 4)

def look_N1():   # the long open coat
    f = Fig('w', 'standb', 'S5', arm_n='tuck')
    coat, col_in = C['chocolate'], C['leather']
    f.legs('wide', col_in)
    f.feet('loafer', C['leather'])
    f.head('bun', 'blackbrown')
    f.add('inner', P(top_loop(f.b, 170, ease_f=4, ease_b=-6), col_in, shade=10))
    f.add('top', P(top_loop(f.b, 180, ease_f=12, ease_b=16, hang=True, flare_f=12, flare_b=30, collar=10,
                            open_front=30), coat, shade=26, rim=5, name='top'))
    f.add('top_det', lapel(tone(coat, dL=3), open_x=30))
    f.add('bag', bag_tucked(C['burgundy']))
    f.arms(coat, end=0.97, ease=6, w=(38, 32, 28))
    return f


def look_N2(coat=C['caramel']):   # the trench, belt untied
    f = Fig('w', 'walk', 'S1', arm_n='tuck', arm_f='swingf')
    f.legs('slim', C['indigo'], fade=7)
    f.feet('flat', C['red'])
    f.head('bob', 'espresso')
    f.add('inner', P(top_loop(f.b, 250, ease_f=3, ease_b=-6), C['cloud'], shade=10))
    f.add('top', P(top_loop(f.b, 250, ease_f=10, ease_b=14, hang=True, flare_f=16, flare_b=34, collar=12,
                            open_front=28), coat, shade=24, rim=5, name='top'))
    f.add('top_det', lapel(tone(coat, dL=3), open_x=28))
    t1 = tube([(44, 624), (76, 566), (106, 506), (126, 470)], [8, 8, 7, 7], [8, 8, 7, 7])
    t2 = tube([(50, 620), (84, 580), (112, 552)], [8, 8, 7], [8, 8, 7])
    f.add('top_det', [P(t2, tone(coat, dL=-6), shade=4, rim=2, far=True), P(t1, tone(coat, dL=-6), shade=5, rim=3)])
    f.add('top_det', P([(f.bx(632, 14) - 34, 632), (f.bx(632, 14), 632), (f.bx(616, 14), 616),
                        (f.bx(616, 14) - 34, 616)], tone(coat, dL=-8), flat=True, clip='top'))
    f.add('bag', bag_eastwest(C['chocolate']))
    f.arms(coat, end=0.96, ease=4, w=(36, 31, 27))
    return f


def look_N3():   # the leather jacket and the statement skirt
    f = Fig('w', 'stand', 'S2', heel=22)
    f.legs(None)
    f.feet('kitten', C['leather'])
    f.head('layers', 'copper')
    f.add('bottom_over', P(skirt_loop(f.b, 188, 'aline', 0.9), C['tomato'], shade=24, rim=4, name='skirt'))
    jk = C['leather']
    f.add('top', P(top_loop(f.b, 604, ease_f=18, ease_b=22, collar=26), jk, shade=12, rim=6, name='top'))
    f.add('top_det', band(f, 618, 604, 18, 22, tone(jk, dL=4), clip='top'))
    f.arms(jk, end=0.95, ease=5, w=(36, 31, 27))
    s, e, w = f.b.arm_n
    f.add('hand_item', P([(s[0] - 22, s[1] - 4), (e[0] - 22, e[1] + 6), (e[0] - 18, e[1] - 40)],
                         tone(jk, dL=24, toward=KEY_HUE, dh=10), line=5, clip='sleeve_n'))
    return f


def look_N4():   # the commuter knit, headphones, tote
    f = Fig('w', 'walk', 'S3', arm_n='swingb', arm_f='swingf', stride=0.9)
    f.legs('wide', C['leather'])
    f.feet('loafer', C['leather'])
    f.head('pony', 'black')
    f.add('head_acc', headphones())
    f.add('inner', P(top_loop(f.b, 474, ease_f=7, ease_b=9), C['cloud'], shade=8))
    knit = C['navy']
    f.add('top', P(top_loop(f.b, 492, ease_f=10, ease_b=12), knit, shade=12, rim=4, name='top'))
    f.add('top_det', band(f, 506, 492, 10, 12, tone(knit, dL=-6), clip='top'))
    f.add('top_det', neckline(C['cloud'], kind='shirt'))
    f.add('bag', tote(C['burgundy'], x0=22))
    f.arms(knit, end=0.9, ease=3, cuff=C['cloud'])
    return f


def look_N5():   # suede and white socks
    f = Fig('m', 'standb', 'S2', arm_n='pocket', arm_f='pocket')
    f.legs('straight', C['navy'])
    f.feet('loafer', C['leather'], sock=C['white'])
    f.head('crop', 'darkbrown', ear_on=True)
    jk = C['caramel']
    f.add('top', P(top_loop(f.b, 486, ease_f=20, ease_b=24, hang=True), jk, shade=14, rim=3, name='top'))
    f.add('top_det', neckline(C['cream']))
    f.add('top_det', P([(28, 846), (8, 760), (-26, 640), (-40, 586)], C['leather'], line=7))
    f.add('top_det', P(catmull([(-66, 600), (-26, 602), (-22, 548), (-64, 546)], n=4, corners=(0, 1, 2, 3)),
                       C['leather'], shade=4, rim=2))
    f.arms(jk, end=0.9, ease=8, hand_n=False, hand_f=False, w=(40, 34, 30))
    return f


def look_N6():   # the bomber and slim sneakers
    f = Fig('m', 'walk', 'S6', arm_n='swingb', arm_f='swingf')
    f.legs('slim', C['indigo'], fade=7)
    f.feet('sneaker', C['cloud'], accent=C['red'])
    f.head('twists', 'black')
    jk = C['leather']
    f.add('top', P(top_loop(f.b, 606, ease_f=26, ease_b=30, collar=6), jk, shade=12, rim=6, name='top'))
    f.add('top_det', P([(f.fx(606, 12), 606), (f.bx(606, 16), 606), (f.bx(582, 14), 582), (f.fx(582, 10), 582)],
                       tone(jk, dL=-3), shade=4, rim=3))
    f.add('top_det', neckline(C['cloud']))
    f.arms(jk, end=0.92, ease=8, cuff=tone(jk, dL=-3), w=(40, 36, 30))
    s, e, w = f.b.arm_n
    f.add('hand_item', P([(s[0] - 24, s[1] - 6), (e[0] - 26, e[1] + 4)], tone(jk, dL=26, toward=KEY_HUE, dh=10),
                         line=5, clip='sleeve_n'))
    return f


def look_N7():   # the long overcoat, hood out
    f = Fig('m', 'stand', 'S2')
    f.legs('straight', C['nearblack'])
    f.feet('sneaker', C['cloud'], accent=C['nearblack'])
    f.head('curtains', 'chestnut')
    coat = C['caramel']
    f.add('top', P(top_loop(f.b, 286, ease_f=14, ease_b=18, hang=True, flare_f=8, flare_b=18, collar=10), coat,
                   shade=24, rim=5, name='top'))
    f.add('top_det', lapel(tone(coat, dL=3)))
    f.add('top_det', P(catmull([(12, 852), (26, 884), (56, 890), (80, 870), (82, 838), (56, 816), (26, 826)], n=5),
                       C['cream'], shade=10, rim=3))
    f.add('top_det', neckline(C['cream']))
    f.arms(coat, end=0.96, ease=6, w=(38, 33, 29))
    return f


def look_L1():   # the big shirt and coloured flats
    f = Fig('w', 'walk', 'S2', arm_n='swingb', arm_f='swingf')
    f.legs('relaxed', C['denim'], fade=8)
    f.feet('flat', C['pink'])
    f.head('clip', 'honey')
    f.add('head_acc', sunglasses('big'))
    sh = C['cloud']
    f.add('top', P(top_loop(f.b, 440, ease_f=22, ease_b=30, front_hem=598, collar=4, hem_curve=-30), sh, shade=14,
                   rim=3, name='top'))
    f.add('top_det', neckline(tone(sh, dL=-3), kind='shirt'))
    f.arms(sh, end=0.74, ease=10, cuff=tone(sh, dL=-4), w=(40, 34, 30))
    return f


def look_L2():   # baby tee, jeans, cap and ponytail
    f = Fig('w', 'stand', 'S4')
    f.legs('relaxed', C['indigo'], fade=7)
    f.feet('sneaker', C['cloud'], accent=C['red'])
    f.head('capony', 'darkbrown')
    f.add('head_acc', cap(C['red']))
    f.add('head_acc', sunglasses('wrap'))
    f.add('top', P(top_loop(f.b, 606, ease_f=3, ease_b=4, collar=-2), C['cloud'], shade=10, rim=3, name='top'))
    f.add('top_det', neckline(tone(C['cloud'], dL=-4)))
    f.arms(C['cloud'], end=0.3, ease=3, w=(30, 28, 26))
    return f


def look_L3():   # the slip skirt and the big knit
    f = Fig('w', 'walk', 'S5', arm_n='swingb', arm_f='swingf', stride=0.85)
    f.legs(None)
    f.feet('sandal', C['cloud'])
    f.head('braids', 'black')
    sk = C['butter']
    f.add('bottom_over', P(shift_poly(skirt_loop(f.b, 168, 'bias', 1.0), 0, 0), sk, shade=18, rim=4, name='skirt'))
    f.add('bottom_det', P(catmull([(-58, 556), (-20, 572), (30, 566), (68, 546), (66, 526), (30, 546), (-20, 551),
                                   (-58, 536)], n=4), tone(sk, dL=6), flat=True, clip='skirt'))
    kn = C['chocolate']
    f.add('top', P(top_loop(f.b, 470, ease_f=22, ease_b=26, collar=2), kn, shade=14, rim=4, name='top'))
    f.add('top_det', band(f, 486, 470, 22, 26, tone(kn, dL=-5), clip='top'))
    f.arms(kn, end=1.0, ease=10, cuff=tone(kn, dL=-5), w=(40, 36, 32))
    return f


def look_L4():   # the athleisure set and an iced coffee
    f = Fig('w', 'stand', 'S3', arm_n='hold')
    f.legs('legging', C['sage'], piping=C['white'])
    f.feet('runner', C['cloud'], accent=C['sage'], sock=C['white'])
    f.head('curls', 'darkbrown')
    f.add('head_acc', sunglasses('big'))
    sw = C['cloud']
    f.add('top', P(top_loop(f.b, 476, ease_f=24, ease_b=28, collar=0), sw, shade=12, rim=3, name='top'))
    f.add('top_det', band(f, 492, 476, 24, 28, tone(sw, dL=-5), clip='top'))
    f.arms(sw, end=0.92, ease=10, cuff=tone(sw, dL=-5), w=(40, 36, 30))
    s, e, w = f.b.arm_n
    f.add('hand_item', iced_coffee((w[0] - 16, w[1] + 2)))
    return f


def look_L5():   # the boxy camp shirt and knee shorts
    f = Fig('m', 'walk', 'S4', arm_n='swingb', arm_f='swingf')
    f.legs('short', C['cream'], hem_y=300)
    f.feet('loafer', C['chocolate'], sock=C['white'])
    f.head('buzz', 'darkbrown', ear_on=True)
    f.add('head_acc', sunglasses('big'))
    sh = C['rust']
    f.add('top', P(top_loop(f.b, 482, ease_f=26, ease_b=30, hang=True), sh, shade=14, rim=4, name='top'))
    f.add('top_det', P(catmull([(30, 860), (6, 868), (-30, 850), (-56, 790), (-46, 778), (-22, 834), (22, 848)], n=4,
                               corners=(3, 4)), tone(sh, dL=6), shade=4, rim=2))
    f.add('top_det', P(catmull([(-33, 848), (-14, 852), (-40, 782), (-50, 800)], n=3, corners=(0, 1, 2, 3)), f.skin,
                       'skin', shade=4))
    f.arms(sh, end=0.46, ease=12, w=(40, 38, 36))
    return f


def look_L6():   # the washed tee, cargos and a cap
    f = Fig('m', 'standb', 'S1', arm_n='pocket', arm_f='pocket')
    f.legs('cargo', C['cream'])
    b = f.b
    c = lerp(b.hip_n, b.knee_n, 0.5)
    f.add('near_leg_det', P([(c[0] - 18, c[1] + 40), (c[0] + 30, c[1] + 40), (c[0] + 30, c[1] - 30),
                             (c[0] - 18, c[1] - 30)], tone(C['cream'], dL=-9), flat=True, clip='leg_n'))
    f.feet('sneaker', C['cloud'], accent=C['nearblack'])
    f.head('crop', 'darkbrown', ear_on=True)
    f.add('head_acc', cap(C['navy'], backward=True))
    te = C['nearblack']
    f.add('top', P(top_loop(f.b, 452, ease_f=26, ease_b=30, collar=-2), te, shade=8, rim=6, name='top'))
    f.add('top_det', neckline(tone(te, dL=4)))
    f.arms(te, end=0.5, ease=12, hand_n=False, hand_f=False, w=(40, 38, 36))
    return f


def look_L7():   # the light blazer over a tee
    f = Fig('m', 'standb', 'S6', arm_n='pocket', arm_f='pocket')
    f.legs('straight', C['chocolate'])
    f.feet('loafer', C['leather'])
    f.head('curls', 'black')
    f.add('inner', P(top_loop(f.b, 470, ease_f=3, ease_b=-6), C['cloud'], shade=8))
    bz = C['sage']
    f.add('top', P(top_loop(f.b, 468, ease_f=12, ease_b=16, collar=4, open_front=30), bz, shade=14, rim=4,
                   name='top'))
    f.add('top_det', lapel(tone(bz, dL=4), open_x=30))
    f.arms(bz, end=0.93, ease=6, hand_n=False, hand_f=False)
    return f


LOOKS = [('N1', 'The long open coat', look_N1), ('N2', 'The trench, belt untied', look_N2),
         ('N3', 'Leather and a statement skirt', look_N3), ('N4', 'The commuter knit', look_N4),
         ('N5', 'Suede and white socks', look_N5), ('N6', 'The bomber, slim sneakers', look_N6),
         ('N7', 'The overcoat, hood out', look_N7),
         ('L1', 'The big shirt, coloured flats', look_L1), ('L2', 'Baby tee, cap and ponytail', look_L2),
         ('L3', 'The slip skirt and the big knit', look_L3), ('L4', 'The athleisure set', look_L4),
         ('L5', 'The camp shirt and knee shorts', look_L5), ('L6', 'The washed tee, cargos, cap', look_L6),
         ('L7', 'The light blazer over a tee', look_L7)]


if __name__ == '__main__' and len(sys.argv) > 1 and sys.argv[1] == '--test':
    out = sys.argv[2]
    names = sys.argv[3].split(',')
    fns = dict((k, fn) for k, _, fn in LOOKS)
    imgs = []
    for n in names:
        img, g = render(fns[n]().parts(), 520)
        imgs.append((img, g))
    W = sum(i.width for i, _ in imgs) + 40 * (len(imgs) + 1)
    Hh = max(i.height for i, _ in imgs) + 80
    board = Image.new('RGB', (W, Hh), '#EFE6DD')
    x = 40
    for img, (gx, gy) in imgs:
        board.paste(img, (x, Hh - 40 - int(gy)), img)
        x += img.width + 40
    board.save(out)
    print('saved', out, board.size)
