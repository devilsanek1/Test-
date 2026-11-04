"""v7_s1 bake: THE STORY LIGHT at T3, the references' low key (ORGANIC.md §6 step 2; organic/light.md §5's rig;
composition.md §5's T3: the facade ~37, the door 97, her ~14, the dusk water ~52, our quay one deep quiet mass ~25).
In linear light on the static base render (the KEYED picture: the light is solved against step 1's colours):
out = base x E + G, E the multiplier (shade < 1, light > 1, coloured), G what the air and the lens add. The light
proof's operators are imported from src/look/light_s1/bake/light.py (rims from the distance field, the sun's disc and
its bloom, the pool's projection, the knee, the door's blur); what is v7's is here:
  the shade masses   T3's depth with each mass's own tint, the chroma kept, never a black or grey multiply:
                     the backlit facade (rose-plum on warm surfaces, violet on the glass), the lit panes a step over it
                     (+6-8 L*: R11, never a rival), the far towpath in the far roofs' shadow (its sunlit gap kept), the
                     boat, the far planes a little; OUR BANK under the canopy of the plane tree off-frame left: one deep
                     violet-plum mass, its leafy edge along the canal (clumps of three sizes in an uneven rhythm, a
                     10-24 px penumbra), a few dim gaps of light near that edge, no flecks on the quiet field
  the water          the canal mirrors the light: the facade's shade (and the boat's) mirrored about the waterline into
                     its reflection, the door's column lifted, the sun's glitter
  the key, the story the light proof's (the sun's bloom +2-3 L* and veil, gold rims by tier; the lobby lifted to the
                     hot accent, its lamps, its bloom, the jambs, the pool on the towpath)
Deterministic (seeded by name), numpy + OpenCV only."""
import cv2
import numpy as np

from v7common import H, W, gblur, lab_to_lin, lin_hex, lin_to_lab, rng, smoothstep, srgb_to_lab, to_lin, value_noise
import light as LT  # noqa: E402  the light proof's operators (light_s1/bake/light.py)
import key as KY  # noqa: E402  the dusk family's ramp by L* (light_s1/bake/key.py RAMP_*: here a SHADE colour, not a grade)
from v7labels import OPENING

KEY = LT.KEY            # the low sun: gold-peach #FFC27A
DOOR = LT.DOOR          # the lobby (~2900 K): cream-gold #FFE2AE
HOT = LT.HOT            # the story light's core #FFD08A
LOBBY = lin_hex('#FFC27F')  # the lobby's lift: apricot-gold (h 70), so the lifted lobby stays warm, never lemon
W_SKY = lin_hex('#77709F')  # the violet dusk sky behind the camera, as W's glass reflects it (L* 49)
# T3's shade family (CIE LCh; chroma kept, toward the sky's violet): deeper than the light proof's (#C79AB4, #A49BD6)
SH_FW = lin_hex('#8C5E86')   # the facade's warm surfaces: rose-plum (L* 46 C* 30 h 330)
SH_FC = lin_hex('#837FA9')   # the facade's cool ones (the glass): violet (L* 55 C* 24 h 296)
SH_B = lin_hex('#6F6698')    # our bank in open-sky shade: violet (L* 46 C* 30 h 300)
SH_T = lin_hex('#A088AC')    # the far towpath in the far roofs' shadow (L* 60 C* 22 h 315)

#: the doses (1.0 = the tint itself): T3 by default; `lift_to_t1` moves them toward T1's gentler key (NOTES.md v7a)
DOSE = dict(
    facade=1.0,          # the backlit facade, at the tint (wall ~34-45 L*: T3's 37)
    litwin=0.86,         # the lit panes: a step over the facade (+6-8 L*)
    W=0.2,               # W, her dark office pane (the plum anchor): barely shaded, so it stays a dark pane, never a hole
    W_sky=0.22,          # and the dusk sky's reflection in its glass
    sign=0.85,
    planting=0.6,
    towpath=0.85,        # the far towpath in the far roofs' shadow
    far=(0.62, 0.6, 0.7),
    boats=0.85,
    bank=1.0,            # our bank under the canopy (T3's 25)
    water=0.35,          # the facade's reflection takes 35 % of its shade (Fresnel: the dusk canal ~50, a step over the quay)
    glaze_bank=0.55,     # the quay's shade colour: the sky's violet-plum at its value (the dusk family's shade end)
    glaze_facade=0.25,   # the backlit facade's shade a little toward it too (one mass, its two faces kept)
    sun_bloom=1.0, veil=1.0, rims=1.0, lobby=1.0, door_bloom=1.0, pool=1.0, jambs=1.0, column=1.0,
)

#: look v7 (NOTES.md "v7"): v7a's doses plus the quay's light (quay_light): the sky's sheen in the wet stone and the door's
#: light coming across the quay toward the camera (the story light reaching the viewer; refs 03 and 02: a quiet dark mass
#: alive with what it mirrors)
DOSE_V7 = dict(DOSE, quay=1.0, path=1.0, sheen=1.0, gleams=1.0, kerb_broken=1.0, kerb_reflection=1.0)

YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)

# the quay's light (look v7): the door's reflection streak and the sky in the wet
SKY_HI = lin_hex('#B7A8CB')   # the low sky behind the camera, as the far wet stone mirrors it at a grazing angle (L* 71)
SKY_LO = lin_hex('#8A82B5')   # the higher sky, as the near puddles mirror it (L* 56)
PATH_X = 629.0                # the door's opening's centre (OPENING 553-705)
PATH_GOLD = lin_hex('#FFC874')  # the door's light as the dark wet stone mirrors it: its cream-gold, a little deeper (the
                                # wet film keeps the source's colour but only a part of its light: a dim warm gold)


def quay_light(L, dose):
    """The quay's light (linear, additive: a reflection is light the stone's colour does not filter), on our bank's
    pixels: (1) the SKY'S SHEEN in the wet: the damp film and the puddles mirror the dusk sky, strongest at the grazing
    far end by the canal (Fresnel), a violet lift near the camera; (2) THE DOOR'S PATH: the lit opening mirrored by the
    rough wet stone as one soft vertical streak below the door, from the coping down to the frame's bottom (the story
    light coming to the viewer: the eye travels up it to the door), brightest by the canal, broken into level dashes by
    the stone's grain, strong in the puddles, weak on the dry stone and the lips (a riser mirrors nothing of the door);
    (3) a few small GLEAMS where puddle edges in the path catch the door. Shares quay.py's wet field with the painted
    piece, so the reflections sit on the painted puddles."""
    import quay as Q
    wet, pud, _ = Q.wet_field()
    R = Q.regions()
    bank = np.clip(L['bank'], 0, 1)
    lips = np.zeros((H, W), np.float32)
    for k in range(1, 7):
        lips = np.maximum(lips, R['lip'][k].astype(np.float32))
    lips = gblur(lips, 0.6)
    level = 1.0 - 0.85 * lips                                       # treads, landing and coping are level; lips are not
    damp = np.clip(wet - pud, 0, 1)
    # (1) the sky's sheen
    far = smoothstep(1720.0, 1230.0, YY)                            # 1 by the canal, 0 near the camera
    fres = 0.035 + 0.11 * far
    sky = SKY_LO[None, None] * (1 - far[..., None]) + SKY_HI[None, None] * far[..., None]
    sheen_w = (0.3 * damp + 1.0 * pud) * fres * level * bank * dose['sheen']
    G = sheen_w[..., None] * sky
    # (2) the door's path
    y_cop = Q.edge_y(Q.COPING[1], PATH_X)
    t = np.clip((YY - y_cop) / (H - y_cop), 0, 1)                   # 0 at the coping, 1 at the frame's bottom
    half = 70.0 + 55.0 * t                                          # the opening's half-width, spreading toward us
    lat = 1 - smoothstep(0.55 * half, 1.35 * half, np.abs(XX - PATH_X))
    along = 0.17 + 0.83 * np.exp(-(YY - y_cop) / 420.0)
    along = np.where(YY < y_cop - 3, 0.0, along)
    grain = value_noise('v7/quay/path_grain', (H, W), 12, octaves=2, gain=0.5, aniso=(7.0, 1.0))
    dashes = np.clip(0.62 + 0.55 * grain, 0.15, 1.0)
    # by the canal the puddles carry it (bright dashes); toward the camera the wet film carries it as one soft glow (a
    # puddle there must not become a bright island in the dark quay: composition R2)
    surf_far = 0.24 + 0.76 * np.clip(pud * 1.1 + 0.6 * damp, 0, 1)
    surf_near = 0.5 + 0.3 * np.clip(pud + 0.6 * damp, 0, 1)
    surf = surf_far * (1 - t ** 0.8) + surf_near * t ** 0.8
    path = lat * along * dashes * surf * level * bank * dose['path']
    # inside the path the door's gold outshines the sky's violet (the sheen gives way to it)
    G *= (1 - 0.65 * lat * smoothstep(y_cop, y_cop + 30, YY))[..., None]
    G += (gblur(path, 1.2) * 0.3)[..., None] * PATH_GOLD
    # (3) gleams: a few puddle edges in the path's core catch the door (small level glints, 2-6 px)
    r = rng('v7/quay/gleams')
    edge = np.clip(gblur(pud, 1.0) - gblur(pud, 3.0), 0, 1) * (1 - smoothstep(0.4 * 70, 1.0 * 70, np.abs(XX - PATH_X)))
    edge *= smoothstep(y_cop, y_cop + 20, YY) * (1 - smoothstep(1380, 1560, YY)) * bank
    ys, xs = np.nonzero(edge > 0.05)
    gl = np.zeros((H, W), np.float32)
    if len(xs):
        for j in r.choice(len(xs), size=min(10, len(xs)), replace=False):
            cx, cy = float(xs[j]), float(ys[j])
            rx, ry = r.uniform(1.6, 3.4), r.uniform(0.6, 1.0)
            e = ((XX[int(cy) - 4:int(cy) + 5, int(cx) - 6:int(cx) + 7] - cx) / rx) ** 2 + ((YY[int(cy) - 4:int(cy) + 5, int(cx) - 6:int(cx) + 7] - cy) / ry) ** 2
            g = np.exp(-e) * r.uniform(0.5, 1.0)
            sl = gl[int(cy) - 4:int(cy) + 5, int(cx) - 6:int(cx) + 7]
            np.maximum(sl, g.astype(np.float32), out=sl)
    G += (gl * 0.32 * dose['gleams'] * bank)[..., None] * HOT
    return G * dose['quay'], dict(path=path, sheen=sheen_w, gleams=gl)


def waterline(x):
    """The far quay's waterline (the painter's spec: (0, 1068) -> (460, 1111), level beyond)."""
    return 1068.0 + 43.0 * np.clip(x / 460.0, 0, 1)


def canopy_v7(bank_top):
    """Our bank's shade: the canopy of the plane tree off-frame left (the leaves that blow in from 1.2 s come from it),
    cast by the low sun over the whole quay. Its edge is a designed shape along the canal (light.md §4.2; ORGANIC §4.1:
    clumps of three sizes in an uneven rhythm, never a template): the shade reaches the coping at the left (nearer the
    caster) and frays toward the water at the right, where a few gaps of dim light fall on the coping and the landing.
    Returns (coverage 0..1, the edge line, the light gaps 0..1)."""
    r = rng('v7_s1/canopy')
    x = np.arange(W, dtype=np.float32)
    # the edge runs at the coping's top at the left, 0-22 px under it at the right (the light reaches the far lip there)
    base_off = -16 + 22 * (x / W) ** 1.4
    clumps = np.zeros(W, np.float32)
    for size, amp, n in ((170, 18, 7), (64, 9, 17), (22, 4.5, 44)):
        cs = np.sort(r.uniform(-size, W + size, n))
        for c in cs:
            w = size * r.uniform(0.5, 1.3)
            a = amp * r.uniform(0.45, 1.25) * (1 if r.random() < 0.7 else -0.8)
            clumps += a * np.exp(-0.5 * ((x - c) / (w * 0.42)) ** 2)
    edge = bank_top + base_off + clumps
    dist = YY - edge[None, :]
    pen = 10 + 14 * (XX / W)                      # the penumbra widens away from the caster
    m = smoothstep(-pen * 0.5, pen * 0.5, dist)
    # a few gaps of light near the edge (holes in the canopy): irregular islands of 2-3 small ellipses stretched along
    # the light (from the sun's ground point toward us), dim (the low sun's light through leaves)
    holes = np.zeros((H, W), np.float32)
    brk = value_noise('v7_s1/canopy/holes', (H, W), 14, octaves=2)
    for cx0 in (640.0, 930.0):
        cx0 = cx0 + r.uniform(-40, 40)
        cy0 = edge[int(cx0)] + r.uniform(10, 26)
        for j in range(int(r.integers(2, 4))):
            cx = cx0 + r.normal(0, 11)
            cy = cy0 + r.normal(0, 5)
            rx = r.uniform(4, 9)
            ry = rx * r.uniform(1.4, 2.0)
            ang = np.arctan2(cy - 965, cx - 195)
            c, s_ = np.cos(ang), np.sin(ang)
            u = (XX - cx) * c + (YY - cy) * s_
            v = -(XX - cx) * s_ + (YY - cy) * c
            e = (u / ry) ** 2 + (v / rx) ** 2 + 0.35 * brk
            holes = np.maximum(holes, (1 - smoothstep(0.45, 1.3, e)) * r.uniform(0.25, 0.4))
    return np.clip(m * (1 - holes), 0, 1).astype(np.float32), edge, holes


def mirror_rows(field, x_axis_line):
    """A per-pixel field mirrored about the waterline into the canal, the painter's own mapping (paint.py paint_canal:
    the water at depth dd under the waterline shows the design row waterline - 3 - dd)."""
    yw = x_axis_line[None, :]
    ym = np.clip(np.round(2 * yw - YY - 3), 0, H - 1).astype(np.int32)
    return field[ym, XX.astype(np.int32)]


def light_v7(base, L, vis, A, dose=DOSE):
    """The lit static picture (linear light), the pool layer and the parts. base: sRGB float (the static base)."""
    B = to_lin(base)
    lab = srgb_to_lab(base)
    warmth = smoothstep(-12, 10, lab[..., 2] + 0.4 * lab[..., 1])[..., None]
    fade = LT.band_fade()
    (sx, sy, sr), disc = LT.find_sun(base, L)
    l_sun = LT.toward_field((sx, sy))
    tint_f = SH_FC[None, None] * (1 - warmth) + SH_FW[None, None] * warmth

    # ---------------------------------------------------------------- 1. the shade masses (E = 1 - S (1 - tint))
    E = np.ones((H, W, 3), np.float32)

    def shade(S, tint):
        nonlocal E
        E = E * (1 - S[..., None] * (1 - tint))

    fac = dose['facade'] * (0.9 + 0.1 * smoothstep(620, 1080, YY))           # a touch deeper toward the ground
    wingS = sum(L[k] for k in ('wall', 'glass', 'doorframe', 'leaves', 'pigeons')) * fac + L['W'] * dose['W']
    wingS = wingS + L['sign'] * dose['sign'] + L['planting'] * dose['planting'] + L['litwin'] * dose['litwin']
    gap = 1 - smoothstep(120, 420, XX)                                        # the far towpath's sunlit stretch (west gap)
    lampS = L['lamps'] * dose['facade'] * (0.9 + 0.1 * smoothstep(800, 840, YY)) * (1 - 0.5 * gap)
    shade(np.clip(wingS + lampS, 0, 1), tint_f)
    # the far towpath in the far roofs' shadow; its west stretch only half in it (the sun reaches it through the gap,
    # low and dim: a step under the door's light, never a rival: R4)
    shade(L['towpath'] * dose['towpath'] * (1 - 0.5 * gap), SH_T[None, None])
    r_s = np.hypot((XX - sx) / 1.6, YY - sy)
    veil = np.exp(-r_s / 300.0)
    fr, ft, fb = dose['far']
    farS = L['farroofs'] * fr * (1 - veil) + L['fartower'] * ft * (1 - 0.8 * veil) + L['bridge'] * fb * (1 - 0.6 * veil)
    shade(farS, LT.SHADE_C[None, None] * (1 - warmth) + LT.SHADE_W[None, None] * warmth)
    shade(L['boats'] * dose['boats'], tint_f)
    btop = LT.bank_top_line(L)
    canopy, edge, holes = canopy_v7(btop)
    bankL = L['bank'] + L['near']
    # the canopy's shade deepens away from the open water (the sky dome lights the quay's far edge more; the frame's
    # bottom lies deepest under the leaves): a ramp INSIDE the one mass (CRAFT §d.4: colour and light moving in a shape)
    skylit = 1 - 0.26 * (1 - smoothstep(1240, 1880, YY))
    # no sun flecks inside it (light.md §4.2: dapples "in clusters of uneven sizes, or none": the proof's clusters read as
    # specks at 400 px here); the fallen leaves and the ramp pattern the quiet field
    shade(bankL * dose['bank'] * canopy * skylit, SH_B[None, None])
    G = np.zeros((H, W, 3), np.float32)
    # W, her dark office pane (its lamp off since 0.40): its glass reflects the violet dusk sky behind the camera, a
    # quarter of it (light.md §2.8), so it reads as a dark pane, never a black hole calling the eye (R3)
    G += (L['W'] * dose['W_sky'])[..., None] * W_SKY

    # ---------------------------------------------------------------- 2. the key's light where it reaches
    E += (L['towpath'] * gap)[..., None] * KEY * 0.18                         # the far towpath's sunlit gap
    E += (bankL * (1 - canopy) * (1 - holes))[..., None] * KEY * 0.15          # the lit lip beyond the canopy's edge
    E += (bankL * holes)[..., None] * KEY * 0.12                               # the dim gaps of light near the edge

    # ---------------------------------------------------------------- 3. rims on what the sun touches (static)
    sil = lambda *ks: sum(vis[k] for k in ks)
    near_sun = np.exp(-np.hypot(XX - sx, YY - sy) / 420.0)
    r_far = LT.rim_band(L['farroofs'] + L['fartower'] + L['bridge'], 1.8, l_sun, p=1.2) * (0.35 + 0.65 * near_sun)
    r_tower = LT.rim_band(L['fartower'], 2.2, l_sun, p=1.0) * 0.8
    r_wing = LT.rim_band(sil('wing', 'doorleaves'), 2.6, l_sun, p=1.0) * smoothstep(1010, 700, YY)
    r_lamps = LT.rim_band(L['lamps'], 1.6, l_sun, p=0.9) * np.maximum(smoothstep(960, 780, YY), gap)
    r_boats = LT.rim_band(L['boats'], 1.6, l_sun, p=1.2) * 0.5
    r_cope = LT.rim_band(bankL, 3.0, l_sun, p=0.8) * (1 - canopy)
    if dose.get('kerb_broken'):
        # look v7: the canopy's leafy edge throws its clumps across the kerb too: the sunlit lip lit in pieces (lost over
        # ~half its length), never one ruled line of light along the whole canal
        kb = value_noise('v7_s1/kerb_light', (1, W + 400), 46, octaves=2, gain=0.5)[0, 200:200 + W]
        r_cope = r_cope * smoothstep(-0.05, 0.3, kb)[None, :]
    rims = np.maximum.reduce([r_far * 0.22, r_tower * 0.32, r_wing * 0.62, r_lamps * 0.5, r_boats * 0.55, r_cope * 0.7])
    rims = gblur(rims, 0.6) * dose['rims'] * fade
    E += rims[..., None] * KEY * 1.6
    G += rims[..., None] * KEY * 0.05

    # ---------------------------------------------------------------- 4. the key's glow: the bloom AT the sun, the veil
    core = disc.copy()
    bl = (0.34 * gblur(core, 4) + 0.22 * gblur(core, 14)
          + 0.11 * cv2.GaussianBlur(core, (0, 0), sigmaX=80, sigmaY=40, borderType=cv2.BORDER_REPLICATE)
          + 0.06 * cv2.GaussianBlur(core, (0, 0), sigmaX=230, sigmaY=105, borderType=cv2.BORDER_REPLICATE))
    bl = bl / max(1e-6, bl.max()) * dose['sun_bloom']
    air = L['sky'] + L['cloud'] + L['farroofs'] + L['fartower'] + 0.8 * L['bridge'] + 0.5 * L['water']
    G += (bl * 0.7 * fade * air)[..., None] * KEY
    wide = np.exp(-np.hypot((XX - sx) / 2.2, YY - sy) / 170.0)
    G += (wide * 0.06 * fade * air * dose['sun_bloom'])[..., None] * KEY
    E += (disc * 0.06)[..., None] * KEY
    vfar = (L['farroofs'] + L['fartower'] + 0.7 * L['bridge'] + 0.6 * (L['sky'] + L['cloud']) * smoothstep(640, 760, YY))
    G += (veil * vfar * 0.10 * dose['veil'] * fade)[..., None] * KEY

    # ---------------------------------------------------------------- 5. the story light: the lobby, its lamps, its bloom
    lob = L['lobby']
    E += (lob * 0.30 * dose['lobby'])[..., None] * LOBBY
    Ls = lab[..., 0]
    x0, y0, x1, y1 = OPENING
    inop = ((XX >= x0) & (XX <= x1) & (YY >= y0) & (YY <= y1)).astype(np.float32)
    bright = lob * smoothstep(78, 90, Ls)
    lamps_core = lob * smoothstep(93, 97, Ls) * (YY < 900)
    bloom_d = (0.30 * gblur(bright, 2.5) + 0.22 * gblur(bright, 8) + 0.12 * gblur(bright, 22))
    bloom_d = bloom_d / max(1e-6, bloom_d.max())
    outside = 1 - gblur(inop, 1.0)
    G += (bloom_d * outside * 0.24 * dose['door_bloom'])[..., None] * DOOR
    halo = gblur(bright, 55)
    halo = halo / max(1e-6, halo.max())
    G += (halo * outside * 0.05 * dose['door_bloom'] * fade)[..., None] * DOOR
    G += (gblur(lamps_core, 3) * 0.10)[..., None] * HOT
    inop8 = (inop > 0.5).astype(np.uint8)
    d_out = cv2.distanceTransform(1 - inop8, cv2.DIST_L2, cv2.DIST_MASK_PRECISE)
    jam = np.exp(-d_out / 5.0) * (1 - inop) * (YY > y0 - 14) * (YY < y1 + 2) * (L['doorframe'] + L['wall'] + L['sign'] + L['leaves'])
    E += (jam * 1.6 * dose['jambs'])[..., None] * DOOR
    G += (jam * 0.03 * dose['jambs'])[..., None] * DOOR

    # ---------------------------------------------------------------- 6. the water mirrors the light
    wl = L['water']
    yw = waterline(XX[0])
    # the facade's (and the boat's, the towpath's) shade mirrored into the canal: E's departure from 1, mirrored,
    # where the water shows that thing's reflection (not the sky's)
    Em = mirror_rows(E, yw)
    mirror_src = mirror_rows(L['wall'] + L['glass'] + L['litwin'] + L['doorframe'] + L['W'] + L['towpath'] + L['lamps'] + L['boats'], yw)
    below = (YY > yw[None, :] + 6).astype(np.float32)
    wS = np.clip(mirror_src, 0, 1) * below * wl * dose['water']
    E = E * (1 - wS[..., None] * (1 - Em))
    if dose.get('kerb_reflection'):
        # look v7: the canal mirrors our kerb's dark wet face just beyond it: a band 3-10 px deep over the water at the
        # kerb, its far edge rippled (the water's own small waves), so the kerb's edge is LOST into its reflection and
        # the visible step moves to a broken, wavering line (ORGANIC §4.1: a long edge lost where it meets a close value)
        kb_top = btop[None, :]
        depth = 6.5 + 3.5 * value_noise('v7_s1/kerb_refl', (1, W + 400), 40, octaves=2)[0, 200:200 + W][None, :]
        ripple = 1.6 * value_noise('v7_s1/kerb_ripple', (H, W), 5, octaves=2, aniso=(4.0, 1.0))
        dd = kb_top - YY + ripple
        refl = smoothstep(depth + 1.5, depth - 1.5, dd) * (dd > -1.5) * wl
        E = E * (1 - (0.62 * refl)[..., None] * (1 - lin_hex('#5E5378')[None, None]))
    # the door's column (the light on water: water E2) and the sun's glitter
    med = np.median(Ls[wl > 0.5])
    col = wl * smoothstep(med + 4, med + 16, Ls) * smoothstep(520, 560, XX) * (1 - smoothstep(700, 740, XX))
    glit = wl * smoothstep(med + 6, med + 18, Ls) * (1 - smoothstep(110, 290, np.abs(XX - sx) + 110))
    G += (gblur(col, 5) * 0.12 * dose['column'])[..., None] * DOOR
    E += (gblur(col, 2) * 0.75 * dose['column'])[..., None] * HOT
    G += (gblur(glit, 4) * 0.05)[..., None] * KEY

    # ---------------------------------------------------------------- 7. the pool (its own layer: her shadows cut it live)
    pf = LT.pool_field()
    ground = L['towpath'] + L['lamps'] * (YY > 1040)
    pool_E = (pf * ground * 1.6 * dose['pool'])[..., None] * DOOR

    lit = B * E + G
    # ---------------------------------------------------------------- 8. the shade's colour: the sky's violet-plum
    # A shade mass is lit by the dusk sky alone, so its colour is the sky's shade family at the mass's own value (light.md
    # §2.8; key.py's ramp by L*: violet-plum low, rose mid, peach high), the value structure inside kept: the quay one
    # violet-plum mass (never the maroon a warm stone times a violet gives), the facade a little toward it
    wgl = (dose['glaze_bank'] * bankL * canopy + dose['glaze_facade'] * np.clip(wingS, 0, 1))[..., None]
    if wgl.max() > 0:
        lab_l = lin_to_lab(np.clip(lit, 0, None))
        ra, rb = KY._ramp(lab_l[..., 0])
        lab_l[..., 1] += (ra - lab_l[..., 1]) * wgl[..., 0]
        lab_l[..., 2] += (rb - lab_l[..., 2]) * wgl[..., 0]
        lit = np.where(wgl > 0, np.clip(lab_to_lin(lab_l), 0, None), lit)
    quay = None
    if dose.get('quay'):
        # look v7: the quay's light, after the glaze (a reflection keeps its source's colour: the door's gold, the sky's
        # violet), on the bank's pixels only
        Gq, quay = quay_light(L, dose)
        lit = lit + Gq
    lit_pool = lit + B * pool_E
    return lit, lit_pool, dict(quay=quay, E=E, G=G, canopy=canopy, holes=holes, rims=rims, sun=(sx, sy, sr), pool=pf * ground,
                               bloom_sun=bl, bloom_door=bloom_d * outside, edge=edge, column=gblur(col, 4))
