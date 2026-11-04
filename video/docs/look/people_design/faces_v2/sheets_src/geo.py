# Geometry helpers for the faces_v2 design sheets: a port of direction C's rounded-corner path (graphic/geo.ts rpath)
# and the LASH face's lash and nose shapes (graphic_faces/head.ts), so the sheet draws in the code's own language.
import math

K = 0.5523


def _f(v):
    return f"{v:.2f}"


def rpath(pts, closed=True):
    """pts: [(x, y, r)] in screen units; r = corner radius (0 = sharp)."""
    n = len(pts)
    if n < 2:
        return ''

    def p(i):
        return (pts[i][0], pts[i][1])

    def corner(i):
        v = p(i)
        r = pts[i][2] if len(pts[i]) > 2 else 0
        prev = p((i - 1) % n)
        nxt = p((i + 1) % n)
        if r <= 0 or (not closed and (i == 0 or i == n - 1)):
            return (v, v, v, 0)
        d1 = math.dist(prev, v)
        d2 = math.dist(v, nxt)
        t1 = min(r, d1 * 0.5)
        t2 = min(r, d2 * 0.5)

        def towards(a, b, t):
            l = math.dist(a, b) or 1
            return (a[0] + (b[0] - a[0]) / l * t, a[1] + (b[1] - a[1]) / l * t)

        return (towards(v, prev, t1), towards(v, nxt, t2), v, r)

    cs = [corner(i) for i in range(n)]
    d = ''

    def P(q):
        return f"{_f(q[0])},{_f(q[1])}"

    for i in range(n):
        a, b, v, r = cs[i]
        if i == 0:
            d += 'M' + P(b if r else v)
        elif r:
            h1 = (a[0] + (v[0] - a[0]) * K, a[1] + (v[1] - a[1]) * K)
            h2 = (b[0] + (v[0] - b[0]) * K, b[1] + (v[1] - b[1]) * K)
            d += f"L{P(a)}C{P(h1)} {P(h2)} {P(b)}"
        else:
            d += 'L' + P(v)
    if closed:
        a, b, v, r = cs[0]
        if r:
            h1 = (a[0] + (v[0] - a[0]) * K, a[1] + (v[1] - a[1]) * K)
            h2 = (b[0] + (v[0] - b[0]) * K, b[1] + (v[1] - b[1]) * K)
            d += f"L{P(a)}C{P(h1)} {P(h2)} {P(b)}"
        d += 'Z'
    return d


def poly(pts):
    return 'M' + 'L'.join(f"{_f(x)},{_f(y)}" for x, y in pts) + 'Z'


class Frame:
    """Head units (u: crown to chin = 1, origin at the skull's centre, y down) -> screen."""

    def __init__(self, cx, cy, s, rot=0.0, mirror=False):
        self.cx, self.cy, self.s, self.rot, self.m = cx, cy, s, math.radians(rot), mirror

    def P(self, u):
        x, y = u[0], u[1]
        if self.m:
            x = -x
        c, s = math.cos(self.rot), math.sin(self.rot)
        X = x * c - y * s
        Y = x * s + y * c
        return (self.cx + X * self.s, self.cy + Y * self.s)

    def R(self, pts, closed=True):
        out = []
        for q in pts:
            X, Y = self.P(q)
            out.append((X, Y, (q[2] if len(q) > 2 else 0) * self.s))
        return rpath(out, closed)

    def poly(self, pts):
        return poly([self.P(q) for q in pts])


def lash_pts(cx, cy, w, sag, th, out, flick=1.0, tilt=0.01, curl=0.0):
    """graphic_faces/head.ts lashPts: the closed lid's line, bowed down by sag, fullest past its middle, tapering to a
    point at the inner corner, ONE flick up and out at the outer corner. curl > 0 lifts the outer third (a happier,
    younger lid)."""
    N = 9
    top, bot = [], []
    for i in range(N + 1):
        s = i / N
        x = cx + out * (s - 0.5) * w
        y = cy + sag * (1 - (2 * s - 1) ** 2) - tilt * s - curl * max(0, s - 0.55) ** 2
        w0 = th * (math.sin(math.pi * (0.05 + 0.82 * s)) ** 0.75)
        top.append((x, y - w0 * 0.25, 0.004))
        bot.append((x - out * w0 * 0.15, y + w0 * 0.75, 0.004))
    o = top[N]
    tip = (o[0] + out * w * 0.17 * flick, o[1] - w * 0.13 * flick, 0)
    return top + [tip] + bot[::-1]
