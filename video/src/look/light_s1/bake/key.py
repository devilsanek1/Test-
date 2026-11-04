"""light_s1 bake: the ONE COLOUR KEY (the owner, 2026-10-30: dark and contrast "that's just color palette and
selection? Similarly point 2"; the playbook's PROPER LIGHT: "ONE COLOUR KEY per scene (one strong colour family with one
hot accent, never a mix of unrelated pastels)"). PALETTE work, done here as one colour function on the lit picture
(light_proof.md §3.3), so production can apply the same function to the palette itself (the table in §3.3):
  the family    the dusk: violet shade -> rose-plum -> peach -> cream-gold light; it is the sky's own family, so the sky
                and its clouds are the key's SOURCE and stay as painted (their hue untouched; the band stays the band)
  off-family    every hue outside the arc violet .. rose .. gold (greens, teals, blues, mints) is turned toward its
                nearer end and loses chroma with the turn (the teal glass to slate-violet, the mint lanterns to
                lavender-grey, the green tree to olive in the plum shade)
  a glaze       everything below the sky takes a share of the family's colour at its own value (warm light, violet
                shade: dusk's split), the painter's unifying wash
  the accent    ONE hot accent: the lit doorway's light (the lobby, its bloom, its pool, its column in the water) gets
                more chroma toward gold; every other light calms: the lit office panes go to a quiet warm cream inside
                the facade's mass (composition.md R11: +6-8 L* over the facade, never a saturated yellow), the near
                maple leaves lose a third of their chroma
  the darks     below the caption band the darks deepen a step (contrast is palette work too), the band untouched
Pure function of the colours, the labels and the door's light field: deterministic."""
import numpy as np

from common import H, W, BAND, lab_to_lin, lin_to_lab, smoothstep, to_lin, to_srgb

#: the family's ramp by L* (a*, b*): violet-plum shade, rose-plum, rose, peach, cream-gold light (from the sky's own
#: colours and light.md §4.9's shade and light table)
RAMP_L = np.array([10, 30, 45, 60, 72, 84, 95], np.float32)
RAMP_A = np.array([16, 18, 18, 16, 14, 9, 4], np.float32)
RAMP_B = np.array([-22, -18, -9, 3, 14, 20, 22], np.float32)

#: the accent: the doorway's gold
ACCENT_H = 76.0

DOSE = dict(
    turn=0.62,          # how far an off-family hue turns toward the family
    turn_chroma=0.68,   # the chroma it keeps at a full 90-degree turn
    glaze=0.24,         # the family's share in every colour below the sky
    litwin_c=0.42,      # the lit panes' chroma kept
    litwin_dl=-5.0,     # and their value step (into the facade's mass)
    accent_c=1.28,      # the door light's chroma gain
    leaves_c=0.7,
    darks=8.0,          # L* taken off the darks below the band (full at L* <= 25, none above 65)
    family_c=1.12,      # in-family hues a little richer (one STRONG family, never greyed)
    zenith=-5.0,        # the sky's top a step deeper (y 0 -> 0 by y 250, well above the band): a dusk sky's gradient
)


def _ramp(Lv):
    return np.interp(Lv, RAMP_L, RAMP_A), np.interp(Lv, RAMP_L, RAMP_B)


def key_lab(lab, sky, accent, litwin, leaves, below, zen=None, dose=DOSE):
    """The key on L*a*b* (any shape): sky = how much the pixel is the key's source (sky, clouds), accent = the door's
    light field (0..1), litwin = the lit panes, leaves = the near maple leaves, below = 0 in the caption band, 1 below."""
    Lv, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    C = np.hypot(a, b)
    h = np.degrees(np.arctan2(b, a)) % 360
    # 1. off-family hues turn toward the nearer end of the arc (gold at 85, violet at 285)
    off = (h > 88) & (h < 282)
    to_gold = h < 185
    target_h = np.where(to_gold, 85.0, 285.0)
    dist = np.where(to_gold, h - 85.0, 285.0 - h)
    turn = dose['turn'] * smoothstep(0, 25, dist) * off
    h2 = h + (target_h - h) * turn
    kept = 1 - (1 - dose['turn_chroma']) * np.clip(turn * dist / 90.0 / max(dose['turn'], 1e-6), 0, 1)
    C2 = C * np.where(off, kept, dose['family_c'] * (1 - sky) + sky)
    # 2. the lit panes calm, the leaves calm, the door's light gets the one hot accent
    C2 = C2 * (1 - litwin * (1 - dose['litwin_c'])) * (1 - leaves * (1 - dose['leaves_c']))
    acc = accent * smoothstep(55, 80, Lv)
    C2 = C2 * (1 + acc * (dose['accent_c'] - 1))
    h2 = h2 + acc * (((ACCENT_H - h2 + 180) % 360) - 180) * 0.6
    L2 = Lv + litwin * dose['litwin_dl']
    hr = np.radians(h2)
    a2, b2 = C2 * np.cos(hr), C2 * np.sin(hr)
    # 3. the glaze toward the family at the pixel's value (not on the sky: it is the source)
    ra, rb = _ramp(L2)
    g = dose['glaze'] * (1 - sky) * (1 - 0.7 * acc)
    a2 = a2 * (1 - g) + ra * g
    b2 = b2 * (1 - g) + rb * g
    # 4. the darks a step deeper below the band
    L2 = L2 - dose['darks'] * smoothstep(65, 25, L2) * below * (1 - sky)
    # the sky keeps its own colour (its hue and chroma: it is the source), only its top a step deeper
    s = sky
    Lsky = Lv + zen * dose['zenith'] if zen is not None else Lv
    out = np.stack([L2 * (1 - s) + Lsky * s, a2 * (1 - s) + a * s * (1 + 0.1 * (zen if zen is not None else 0)), b2 * (1 - s) + b * s * (1 + 0.1 * (zen if zen is not None else 0))], -1)
    return out.astype(np.float32)


def accent_field(L, extra=None):
    """Where the door's light is: the lobby, its bloom, its pool, its column (light.py's parts)."""
    acc = L['lobby'].copy()
    if extra is not None:
        acc = np.maximum(acc, extra)
    return np.clip(acc, 0, 1)


_ACC = {}


def set_accent(field):
    _ACC['f'] = field


def key(T, L, base, flat=False):
    """The key on an sRGB float image. `flat`: an image of the door's light alone (her wrap's light): all accent."""
    lab = lin_to_lab(to_lin(T))
    if flat:
        z = np.zeros(T.shape[:2], np.float32)
        out = key_lab(lab, z, np.ones_like(z), z, z, np.ones_like(z))
        return np.clip(to_srgb(np.clip(lab_to_lin(out), 0, 1)), 0, 1)
    sky = np.clip(L['sky'] + L['cloud'], 0, 1)
    acc = _ACC.get('f', accent_field(L))
    yy = np.mgrid[0:H, 0:W][0].astype(np.float32)
    below = smoothstep(BAND[1] + 10, BAND[1] + 80, yy)
    zen = 1 - smoothstep(0, 250, yy)
    out = key_lab(lab, sky, acc, L['litwin'], L['spray'], below, zen)
    return np.clip(to_srgb(np.clip(lab_to_lin(out), 0, 1)), 0, 1)
