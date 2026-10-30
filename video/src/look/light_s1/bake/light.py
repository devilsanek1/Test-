"""light_s1 bake: THE LIGHT (organic/light.md §5's plan for scene 1, doses in light_proof.md §3), in linear light on the
static base render: out = base x E + G, E the multiplier (shade < 1, light > 1, coloured), G the light the air and
the lens add (blooms, the in-scatter veil, rims on dark edges). Every shade mass has a named caster, every light a
named source (light.md §5.4):
  the key     the low October sun, in frame half behind the far roofs (its disc in the painted sky): its bloom (four
              sigmas, the wide two stretched along the horizon), the in-scatter veil over the far city, gold rims on
              what rises into it (the far roofline, the tower's sun side, the bridge's parapet, the wing's parapet,
              planting and west corner, the lamp heads, our coping), the sunlit gap of the far towpath (x < 120-420)
  the story   the lit Google doorway: the lobby lifted a step and warmed (the scene's one hot accent), its three lamps,
              its bloom (2.5 / 8 / 22 px), the light on the jambs, its pool on the towpath (a separate layer: her live
              shadows are cut out of it), its column in the canal
  the shade   the backlit facade (rose-plum on warm surfaces, violet on cool ones), the far towpath in the far roofs'
              shadow, the boats, the far planes a little; our bank and its things under the canopy of a tree off-screen
              left: one leafy-edged mass with holes of light at its edge and a few dapples (sun flecks)
Deterministic (seeded by name), numpy + OpenCV only."""
import cv2
import numpy as np

from common import (BAND, BAND_GUARD, H, W, gblur, lin_hex, rng, smoothstep, srgb_to_lab, to_lin, to_srgb, value_noise)
from labels import OPENING

KEY = lin_hex('#FFC27A')        # the low sun: gold-peach
DOOR = lin_hex('#FFE2AE')       # the lobby (~2900 K): cream-gold
HOT = lin_hex('#FFD08A')        # the story light's core, a touch hotter (the one hot accent)
SHADE_W = lin_hex('#C79AB4')    # shade on warm surfaces: rose-plum (CRAFT §d.3: chroma kept)
SHADE_C = lin_hex('#A49BD6')    # shade on cool surfaces: violet (toward the sky)

#: the light's doses (light_proof.md §3): 1.0 = light.md's spec; the owner asked for proper light with real darks
DOSE = dict(
    facade=0.88,        # the backlit facade's shade strength (light.md 0.52)
    towpath=0.66,       # the far towpath in the far roofs' shadow (light.md 0.36)
    far=(0.62, 0.6, 0.66),  # far roofs, tower, bridge: backlit (their fronts face us, away from the sun)
    litwin=0.72,        # the lit office panes: a step under the story light (light.md §2.1)
    boats=0.55,
    bank=1.0,           # our bank under the canopy (light.md 0.80)
    sun_bloom=1.0,
    veil=1.0,
    rims=1.0,
    lobby=1.0,
    door_bloom=1.0,
    pool=1.0,
    jambs=1.0,
    water=1.0,
)

YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)


def band_fade():
    """1 outside the caption band's guard, 0 inside it, a smooth ramp over 60 px below (nothing reaches the words)."""
    y0 = BAND[1] + BAND_GUARD
    return smoothstep(y0, y0 + 70, YY)


def find_sun(base, L):
    """The painted disc: the brightest compact blob of the sky by SUN0's spot (the sky piece draws it)."""
    Ls = srgb_to_lab(base)[..., 0]
    win = (XX > 120) & (XX < 280) & (YY > 680) & (YY < 820) & (L['sky'] > 0.5)
    ref = np.percentile(Ls[win], 50)
    m = (win & (Ls > ref + 2.5)).astype(np.uint8)
    n, cc, st, cen = cv2.connectedComponentsWithStats(m, 8)
    if n <= 1:
        return (195.0, 750.0, 20.0), np.zeros((H, W), np.float32)
    i = 1 + int(np.argmax(st[1:, cv2.CC_STAT_AREA]))
    cx, cy = cen[i]
    r = float(np.sqrt(st[i, cv2.CC_STAT_AREA] / np.pi))
    disc = (cc == i).astype(np.float32)
    return (float(cx), float(cy), r), disc


def rim_band(mask, width, l_field, p=1.0, soft=0.8):
    """The rim of a silhouette toward a light (light.md §4.3): inside, within `width` px of the edge (the exact
    Euclidean distance transform), weighted by max(0, n . l)^p, n the outward normal (the blurred mask's gradient)."""
    m8 = (mask > 0.5).astype(np.uint8)
    if m8.sum() == 0:
        return np.zeros((H, W), np.float32)
    d = cv2.distanceTransform(m8, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    sm = gblur(mask.astype(np.float32), 1.6)
    gy, gx = np.gradient(sm)
    n = np.sqrt(gx * gx + gy * gy) + 1e-6
    nx, ny = -gx / n, -gy / n
    ndl = np.clip(nx * l_field[0] + ny * l_field[1], 0, 1) ** p
    band = (1 - smoothstep(width - soft, width + soft, d)) * (m8 > 0)
    # the inner part of the normal is unreliable far from the edge: the band is thin, so the blurred gradient is fine
    return (band * ndl).astype(np.float32)


def toward_field(pt):
    dx = pt[0] - XX
    dy = pt[1] - YY
    n = np.sqrt(dx * dx + dy * dy) + 1e-6
    return dx / n, dy / n


def canopy_mask(bank_top):
    """Our bank's shade: the canopy of a tree off-screen left (light.md §4.2: a cast shadow from a named thing, never a
    vignette). Its edge is a designed leafy line just below the coping (the sunlit strip along the water): clumps of
    three sizes in an uneven rhythm (shapes.md: no repeated template), a few holes of light near the edge, the
    penumbra 10-24 px (the caster's distance x the sun's 0.53 deg). Returns the shade's coverage 0..1."""
    r = rng('light_s1/canopy')
    # the edge line: the coping's line (bank_top(x)) pushed down by a strip that narrows to the left (nearer the
    # caster), with three octaves of clumps
    x = np.arange(W, dtype=np.float32)
    base_off = 26 + 22 * (x / W) ** 1.3
    clumps = np.zeros(W, np.float32)
    for size, amp, n in ((150, 15, 8), (62, 8, 20), (24, 4, 50)):
        cs = np.sort(r.uniform(-size, W + size, n))
        for c in cs:
            w = size * r.uniform(0.55, 1.25)
            a = amp * r.uniform(0.5, 1.2) * (1 if r.random() < 0.72 else -0.8)
            clumps += a * np.exp(-0.5 * ((x - c) / (w * 0.42)) ** 2)
    edge = bank_top + base_off + clumps
    yy = YY
    dist = yy - edge[None, :]                    # > 0 below the edge (in shade)
    pen = 10 + 14 * (XX / W)                      # the penumbra widens away from the caster
    m = smoothstep(-pen * 0.5, pen * 0.5, dist)
    # holes of light near the edge (gaps in the canopy): a few irregular islands, each a union of 2-3 small ellipses
    # broken by noise, a little stretched along the light (from the sun's ground point toward us)
    holes = np.zeros((H, W), np.float32)
    brk = value_noise('light_s1/canopy/holes', (H, W), 14, octaves=2)
    for i in range(4):
        cx0 = r.uniform(80, W - 80)
        cy0 = edge[int(cx0)] + r.uniform(6, 24)
        for j in range(int(r.integers(2, 4))):
            cx = cx0 + r.normal(0, 9)
            cy = cy0 + r.normal(0, 5)
            rx = r.uniform(4, 10)
            ry = rx * r.uniform(1.2, 1.7)
            ang = np.arctan2(cy - 965, cx - 195)
            c, s_ = np.cos(ang), np.sin(ang)
            u = (XX - cx) * c + (yy - cy) * s_
            v = -(XX - cx) * s_ + (yy - cy) * c
            e = (u / ry) ** 2 + (v / rx) ** 2 + 0.35 * brk
            holes = np.maximum(holes, (1 - smoothstep(0.45, 1.3, e)) * r.uniform(0.22, 0.4))
    m = m * (1 - holes)
    return np.clip(m, 0, 1).astype(np.float32), edge


def dapples(canopy, edge):
    """Sun flecks inside the shade: the sun's image through gaps in the leaves, so ellipses stretched along the light,
    in two uneven clusters (light.md §6.3: never single soft discs). Returns 0..1."""
    r = rng('light_s1/dapples')
    out = np.zeros((H, W), np.float32)
    brk = value_noise('light_s1/dapples/break', (H, W), 9, octaves=2)
    for (cx0, cy0, n) in ((262, 1416, 5), (868, 1548, 4)):
        for i in range(n):
            cx = cx0 + r.normal(0, 34)
            cy = cy0 + r.normal(0, 18)
            rx = r.uniform(2.5, 6.5)
            ry = rx * r.uniform(1.5, 2.3)
            ang = np.arctan2(cy - 965, cx - 195)
            c, s = np.cos(ang), np.sin(ang)
            u = (XX - cx) * c + (YY - cy) * s
            v = -(XX - cx) * s + (YY - cy) * c
            e = (u / ry) ** 2 + (v / rx) ** 2 + 0.3 * brk
            out = np.maximum(out, (1 - smoothstep(0.45, 1.3, e)) * r.uniform(0.25, 0.42))
    return out * canopy


def bank_top_line(L):
    """Our bank's top edge (the coping on the water) per column."""
    m = L['bank'] + L['near'] > 0.5
    top = np.full(W, H, np.float32)
    has = m.any(0)
    top[has] = np.argmax(m[:, has], 0)
    return top


def pool_field(door_box=OPENING, coping_y=1111.0):
    """The door's pool on the towpath (light.md §4.6): the opening projected forward (a trapezoid widening toward us,
    1.45x by the coping), its falloff from the lamps' height (cos^3), its sides softening with distance (an area
    light's penumbra, 3 -> 12 px). Returns 0..1 (1 at the threshold's middle)."""
    x0, _, x1, y_th = door_box
    cx = (x0 + x1) / 2
    hw0 = (x1 - x0) / 2
    d = np.clip((YY - y_th) / (coping_y - y_th), 0, None)
    hw = hw0 * (1 + 0.45 * d)
    sig = 3 + 9 * np.clip(d, 0, 1.4)
    side = 1 - smoothstep(-sig, sig, np.abs(XX - cx) - hw)
    fall = (1 + (d * 0.85) ** 2) ** -1.5
    front = smoothstep(y_th - 3, y_th + 2, YY)
    return (side * fall * front).astype(np.float32)


def light(base, L, vis, A, dose=DOSE, return_parts=False):
    """The lit static picture (linear light) and its parts. base: sRGB float (the static base render)."""
    B = to_lin(base)
    lab = srgb_to_lab(base)
    warmth = smoothstep(-12, 10, lab[..., 2] + 0.4 * lab[..., 1])
    tint = SHADE_C[None, None] * (1 - warmth[..., None]) + SHADE_W[None, None] * warmth[..., None]
    fade = band_fade()
    (sx, sy, sr), disc = find_sun(base, L)
    SUN = (sx, sy)
    l_sun = toward_field(SUN)

    # ---------------------------------------------------------------- 1. the shade masses
    S = np.zeros((H, W), np.float32)
    fac = dose['facade'] * (0.82 + 0.18 * smoothstep(620, 1080, YY))       # deeper toward the ground (the sky lights tops)
    for k in ('wall', 'glass', 'doorframe', 'W', 'leaves', 'pigeons', 'sign'):
        S += L[k] * fac
    S += L['planting'] * 0.25 * dose['facade']
    gap = 1 - smoothstep(120, 420, XX)                                    # the west gap's sunlit stretch of the far towpath
    S += L['towpath'] * dose['towpath'] * (1 - gap)
    lamp_shade = dose['facade'] * (0.72 + 0.2 * smoothstep(800, 840, YY)) * (1 - 0.6 * gap)   # the unlit lanterns toned down (never a rival to the door), the posts below fully, in the far roofs' shadow
    S += L['lamps'] * lamp_shade
    r_s = np.hypot((XX - sx) / 1.6, YY - sy)
    veil = np.exp(-r_s / 300.0)
    fr, ft, fb = dose['far']
    S += L['farroofs'] * fr * (1 - veil) + L['fartower'] * ft * (1 - 0.8 * veil) + L['bridge'] * fb * (1 - 0.6 * veil)
    S += L['boats'] * dose['boats']
    btop = bank_top_line(L)
    canopy, edge = canopy_mask(btop)
    dap = dapples(canopy, edge)
    shade_bank = canopy * (1 - dap)
    S += (L['bank'] + L['near']) * dose['bank'] * shade_bank
    S = np.clip(S, 0, 1.2)
    # our bank lies in open shade under the sky (no warm bounce reaches it): its tint leans further toward the violet
    wb = warmth * (1 - 0.55 * (L['bank'] + L['near']))
    tint = SHADE_C[None, None] * (1 - wb[..., None]) + SHADE_W[None, None] * wb[..., None]
    E = 1 - S[..., None] * (1 - tint)
    E *= (1 - L['litwin'] * (1 - dose['litwin']))[..., None]
    G = np.zeros((H, W, 3), np.float32)

    # ---------------------------------------------------------------- 2. the key's light where it reaches
    sunlit_tp = L['towpath'] * gap
    E += sunlit_tp[..., None] * KEY * 0.45
    strip = (L['bank'] + L['near']) * (1 - canopy)
    E += strip[..., None] * KEY * 0.36
    E += ((L['bank'] + L['near']) * dap)[..., None] * KEY * 0.42           # the flecks: the sun itself, warm

    # ---------------------------------------------------------------- 3. rims on what the sun touches (static)
    rims = np.zeros((H, W), np.float32)
    sil = lambda *ks: sum(vis[k] for k in ks)
    near_sun = np.exp(-np.hypot(XX - sx, YY - sy) / 420.0)
    r_far = rim_band(L['farroofs'] + L['fartower'] + L['bridge'], 1.8, l_sun, p=1.2) * (0.35 + 0.65 * near_sun)
    r_tower = rim_band(L['fartower'], 2.2, l_sun, p=1.0) * 0.8
    r_wing = rim_band(sil('wing', 'doorleaves'), 2.6, l_sun, p=1.0) * smoothstep(1010, 700, YY)
    r_lamps = rim_band(L['lamps'], 1.6, l_sun, p=0.9) * np.maximum(smoothstep(960, 780, YY), gap)
    r_boats = rim_band(L['boats'], 1.6, l_sun, p=1.2) * 0.45
    r_cope = rim_band(L['bank'] + L['near'], 3.0, l_sun, p=0.8) * (1 - canopy)
    r_spray = rim_band(L['spray'], 2.0, l_sun, p=1.0)
    rims = np.maximum.reduce([r_far * 0.22, r_tower * 0.32, r_wing * 0.62, r_lamps * 0.5, r_boats * 0.5, r_cope * 0.7, r_spray * 0.6])
    rims = gblur(rims, 0.6) * dose['rims'] * fade
    E += rims[..., None] * KEY * 1.5
    G += rims[..., None] * KEY * 0.05

    # ---------------------------------------------------------------- 4. the key's glow: the bloom AT the sun, the veil
    core = disc.copy()
    bl = (0.34 * gblur(core, 4) + 0.22 * gblur(core, 14)
          + 0.11 * cv2.GaussianBlur(core, (0, 0), sigmaX=80, sigmaY=40, borderType=cv2.BORDER_REPLICATE)
          + 0.06 * cv2.GaussianBlur(core, (0, 0), sigmaX=230, sigmaY=105, borderType=cv2.BORDER_REPLICATE))
    bl = bl / max(1e-6, bl.max()) * dose['sun_bloom']
    air = L['sky'] + L['cloud'] + L['farroofs'] + L['fartower'] + 0.8 * L['bridge'] + 0.5 * L['water'] + 0.6 * L['spray']
    G += (bl * 0.7 * fade * air)[..., None] * KEY
    wide = np.exp(-np.hypot((XX - sx) / 2.2, YY - sy) / 170.0)           # the warm air round the low sun (falls off)
    G += (wide * 0.06 * fade * air * dose['sun_bloom'])[..., None] * KEY
    E += (disc * 0.06)[..., None] * KEY                                    # the disc lifted, never fogged
    vfar = (L['farroofs'] + L['fartower'] + 0.7 * L['bridge'] + 0.6 * (L['sky'] + L['cloud']) * smoothstep(640, 760, YY))
    G += (veil * vfar * 0.10 * dose['veil'] * fade)[..., None] * KEY

    # ---------------------------------------------------------------- 5. the story light: the lobby, its lamps, its bloom
    lob = L['lobby']
    E += (lob * 0.42 * dose['lobby'])[..., None] * HOT
    Ls = lab[..., 0]
    x0, y0, x1, y1 = OPENING
    inop = ((XX >= x0) & (XX <= x1) & (YY >= y0) & (YY <= y1)).astype(np.float32)
    bright = lob * smoothstep(80, 90, Ls)
    # the three lamps: their shades' lit undersides
    lamps_core = lob * smoothstep(93, 97, Ls) * (YY < 900)
    bloom_d = (0.30 * gblur(bright, 2.5) + 0.22 * gblur(bright, 8) + 0.12 * gblur(bright, 22))
    bloom_d = bloom_d / max(1e-6, bloom_d.max())
    outside = 1 - gblur(inop, 1.0)
    G += (bloom_d * outside * 0.26 * dose['door_bloom'])[..., None] * DOOR
    halo = gblur(bright, 55)
    halo = halo / max(1e-6, halo.max())
    G += (halo * outside * 0.07 * dose['door_bloom'] * fade)[..., None] * DOOR
    G += (gblur(lamps_core, 3) * 0.10)[..., None] * HOT
    # the jambs and the soffit: the lobby's light on the frame's inner faces and the surround next to the opening
    inop8 = (inop > 0.5).astype(np.uint8)
    d_out = cv2.distanceTransform(1 - inop8, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    jam = np.exp(-d_out / 5.0) * (1 - inop) * (YY > y0 - 14) * (YY < y1 + 2) * (L['doorframe'] + L['wall'] + L['sign'] + L['leaves'])
    E += (jam * 0.9 * dose['jambs'])[..., None] * DOOR
    G += (jam * 0.035 * dose['jambs'])[..., None] * DOOR

    # ---------------------------------------------------------------- 6. the water: the door's column, the sun's glitter
    wl = L['water']
    wLs = Ls * wl
    med = np.median(Ls[wl > 0.5])
    col = wl * smoothstep(med + 6, med + 18, Ls) * smoothstep(520, 560, XX) * (1 - smoothstep(700, 740, XX))
    glit = wl * smoothstep(med + 6, med + 18, Ls) * (1 - smoothstep(110, 290, np.abs(XX - sx) + 110))
    G += (gblur(col, 5) * 0.12 * dose['water'])[..., None] * DOOR
    E += (gblur(col, 2) * 0.55 * dose['water'])[..., None] * HOT
    G += (gblur(glit, 4) * 0.05 * dose['water'])[..., None] * KEY

    # ---------------------------------------------------------------- 7. the pool (its own layer: her shadows cut it live)
    pf = pool_field()
    ground = L['towpath'] + L['lamps'] * (YY > 1040)
    pool_E = (pf * ground * 1.6 * dose['pool'])[..., None] * DOOR

    lit = B * E + G
    lit_pool = lit + B * pool_E
    if not return_parts:
        return lit, lit_pool
    return lit, lit_pool, dict(S=S, E=E, G=G, canopy=canopy, dapples=dap, rims=rims, sun=(sx, sy, sr), pool=pf * ground,
                               bloom_sun=bl, bloom_door=bloom_d * outside, edge=edge, column=gblur(col, 4))


def knee(lin, k=0.9, base=None):
    """A soft shoulder above k (linear) that approaches 1.0, so a lift never clips flat. With `base` (the unlit linear
    picture), only what the light LIFTED is shouldered, never below the base: an unlit pixel stays exactly itself."""
    over = np.clip(lin - k, 0, None)
    out = np.where(lin > k, k + over / (1 + over / (1.0 - k)), lin)
    if base is None:
        return out
    return np.where(lin > base + 1e-6, np.maximum(out, np.minimum(base, lin)), lin)


def door_blur(lit_lin, L, sigma=7.0, gain=1.0):
    """The lit opening blurred (her wrap's light, light.md §4.7): the lobby's lit light, its own colour, the box with
    the frame + 40 px. Returns (sRGB image, box)."""
    x0, y0, x1, y1 = OPENING
    bx = (x0 - 46, y0 - 40, x1 - x0 + 92, y1 - y0 + 70)
    src = lit_lin * L['lobby'][..., None] * gain
    bl = np.stack([gblur(src[..., c], sigma) for c in range(3)], -1)
    crop = bl[bx[1]:bx[1] + bx[3], bx[0]:bx[0] + bx[2]]
    return to_srgb(np.clip(crop, 0, 1)), bx
