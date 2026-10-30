# The faces_v2 profiles and 3/4 heads, in head units (u: crown to chin = 1, origin at the skull's centre, y down,
# facing screen-left). NOW = LASH exactly as graphic_faces/head.ts draws it; the options are the recipe's drafts.
import math
from geo import lash_pts

BACK = [(0.02, -0.5, 0.22), (0.38, -0.4, 0.18), (0.52, -0.12, 0.16), (0.49, 0.13, 0.12), (0.34, 0.27, 0.06)]


def lm_profile(L):
    """Build the profile loop from named landmarks (each (x, y, r)), crown -> back -> jaw -> chin -> lips -> nose ->
    forehead."""
    order = ['jawA', 'jaw2', 'men', 'chinB', 'chinF', 'chinT', 'mls', 'll', 'sto', 'ul', 'sn', 'col', 'tip', 'supra',
             'dors', 'nas', 'brow2', 'brow', 'fh', 'fh2']
    pts = list(L.get('back', BACK))
    for k in order:
        if k in L and L[k] is not None:
            pts.append(L[k])
    return pts


# ------------------------------------------------------------------ NOW (LASH), from head.ts headProfile
def now_profile(man=False):
    k = 1 if man else 0
    ff = -0.43
    nose = 0.08 + 0.02 * k
    chin = k
    L = {
        'jawA': (0.15 + 0.02 * k, 0.33 + 0.02 * k, 0.04 + 0.02 * k),
        'men': (ff + 0.12, 0.5, 0.04),
        'chinB': (ff + 0.045, 0.497, 0.04),
        'chinF': (ff + 0.022 - 0.008 * chin, 0.452, 0.025),
        'mls': (ff + 0.035, 0.405, 0.015),
        'll': (ff + 0.006, 0.36, 0.014),
        'sto': (ff + 0.022, 0.322, 0.006),
        'ul': (ff - 0.008, 0.293, 0.012),
        'sn': (ff + 0.002, 0.24, 0.006),
        'col': (ff - nose + 0.006, 0.212, 0.012),
        'tip': (ff - nose, 0.184, 0.012),
        'nas': (ff + 0.016, -0.035, 0.03),
        'brow': (ff - 0.004, -0.082, 0.03),
        'fh': (ff + 0.012, -0.2, 0.08),
        'fh2': (ff + 0.1, -0.38, 0.14),
    }
    wing = [(ff - nose + 0.014, 0.205, 0.008), (ff - 0.012, 0.236, 0.01), (ff + 0.022, 0.212, 0.012),
            (ff + 0.018, 0.168, 0.016), (ff - 0.02, 0.158, 0.014)]
    lash = lash_pts(ff + 0.105, 0.0, 0.085 if man else 0.095, 0.014, 0.016 if man else 0.021, 1, 0.45 if man else 1,
                    0.012)
    return dict(name='now', L=L, skin=lm_profile(L), wing=wing, lash=lash, ff=ff, ear=None, eyeY=0.0,
                shade=[(0.2, -0.7), (0.14, 0.2), (0.1, 0.36), (-0.3, 0.5), (-0.3, 0.7), (1.2, 0.7), (1.2, -0.7)],
                neck=dict(front_top=(-0.13, 0.43), back_top=(0.3, 0.2), w=0.36 if not man else 0.46, lean=12),
                adam=False)


def _col(sn, alpha, length):
    a = math.radians(alpha)
    return (sn[0] - length * math.cos(a), sn[1] - length * math.sin(a))


def _lip(sn, beta, length):
    b = math.radians(beta)
    return (sn[0] - length * math.sin(b), sn[1] + length * math.cos(b))


# ------------------------------------------------------------------ the woman's options
def her_A():
    """REFINED: the placement as now (the lash at 0.50 h); the parts fixed: a shorter, softly scooped nose with a
    rounded, lifted tip (NLA ~105), fuller lips near the line, the chin forward, a V jaw, a slimmer neck."""
    sn = (-0.428, 0.232)
    ul = _lip(sn, 19, 0.05)
    col = _col(sn, 34, 0.05)
    L = {
        'jawA': (0.105, 0.272, 0.06),
        'men': (-0.3, 0.5, 0.05),
        'chinB': (-0.372, 0.497, 0.05),
        'chinF': (-0.426, 0.445, 0.035),
        'mls': (-0.41, 0.392, 0.02),
        'll': (-0.437, 0.346, 0.018),
        'sto': (-0.42, 0.313, 0.006),
        'ul': (ul[0], ul[1], 0.016),
        'sn': (sn[0], sn[1], 0.008),
        'col': (col[0], col[1], 0.012),
        'tip': (-0.488, 0.178, 0.017),
        'supra': (-0.466, 0.125, 0.03),
        'dors': (-0.446, 0.055, 0.06),
        'nas': (-0.42, -0.025, 0.04),
        'brow': (-0.432, -0.075, 0.05),
        'fh': (-0.422, -0.2, 0.1),
        'fh2': (-0.33, -0.38, 0.14),
    }
    tip = L['tip']
    wing = [(tip[0] + 0.012, tip[1] + 0.02, 0.008), (sn[0] - 0.012, sn[1] - 0.002, 0.01), (sn[0] + 0.026, sn[1] - 0.022, 0.012),
            (sn[0] + 0.02, sn[1] - 0.066, 0.016), (sn[0] - 0.018, sn[1] - 0.074, 0.014)]
    lash = lash_pts(-0.43 + 0.105, 0.0, 0.1, 0.016, 0.022, 1, 1.05, 0.012)
    return dict(name='A', L=L, skin=lm_profile(L), wing=wing, lash=lash, ff=-0.432, eyeY=0.0,
                ear=dict(c=(0.075, 0.085), h=0.235, w=0.105, rot=12),
                shade=[(0.2, -0.7), (0.15, 0.05), (0.13, 0.22), (0.02, 0.33), (-0.3, 0.52), (-0.3, 0.7), (1.2, 0.7), (1.2, -0.7)],
                neck=dict(front_top=(-0.1, 0.39), back_top=(0.27, 0.2), w=0.31, lean=8), adam=False)


def her_B():
    """CUTE (05's lesson at an adult dose): the features ~0.05 h lower (the lash at 0.555 h), a round forehead that
    bulges a touch, a short scooped button nose (0.16 h) with the tip lifted (NLA ~110), one full soft lip bump near the
    line, a small round chin on the face line, a short V jaw that turns up under the ear, a long slim neck, the ear
    showing."""
    sn = (-0.427, 0.256)
    ul = _lip(sn, 22, 0.042)
    col = _col(sn, 42, 0.044)
    L = {
        'jawA': (0.05, 0.255, 0.07),
        'men': (-0.312, 0.5, 0.05),
        'chinB': (-0.372, 0.494, 0.055),
        'chinF': (-0.422, 0.443, 0.04),
        'mls': (-0.408, 0.399, 0.02),
        'll': (-0.432, 0.358, 0.02),
        'sto': (-0.418, 0.329, 0.006),
        'ul': (ul[0], ul[1], 0.018),
        'sn': (sn[0], sn[1], 0.008),
        'col': (col[0], col[1], 0.012),
        'tip': (-0.474, 0.208, 0.018),
        'supra': (-0.458, 0.172, 0.025),
        'dors': (-0.434, 0.11, 0.05),
        'nas': (-0.42, 0.045, 0.04),
        'brow': (-0.432, -0.02, 0.05),
        'fh': (-0.443, -0.16, 0.12),
        'fh2': (-0.35, -0.385, 0.15),
    }
    tip = L['tip']
    wing = [(tip[0] + 0.012, tip[1] + 0.018, 0.008), (sn[0] - 0.01, sn[1] - 0.002, 0.01), (sn[0] + 0.022, sn[1] - 0.018, 0.012),
            (sn[0] + 0.017, sn[1] - 0.056, 0.014), (sn[0] - 0.016, sn[1] - 0.062, 0.012)]
    lash = lash_pts(-0.43 + 0.1, 0.055, 0.105, 0.018, 0.025, 1, 1.15, 0.01, curl=0.03)
    return dict(name='B', L=L, skin=lm_profile(L), wing=wing, lash=lash, ff=-0.432, eyeY=0.055,
                ear=dict(c=(0.05, 0.13), h=0.225, w=0.105, rot=12),
                shade=[(0.18, -0.7), (0.13, 0.08), (0.11, 0.22), (-0.01, 0.31), (-0.3, 0.52), (-0.3, 0.7), (1.2, 0.7), (1.2, -0.7)],
                neck=dict(front_top=(-0.08, 0.385), back_top=(0.25, 0.2), w=0.27, lean=6), adam=False)


def her_C():
    """CHIC (the fashion-modern read): placed low like B, a straighter ski-slope nose with a crisp point (NLA ~108), a
    fuller upper lip (a soft pout), a pointed V chin, a crisp straight jaw, a long neck."""
    sn = (-0.43, 0.246)
    ul = _lip(sn, 24, 0.046)
    col = _col(sn, 40, 0.05)
    L = {
        'jawA': (0.085, 0.262, 0.04),
        'men': (-0.33, 0.5, 0.025),
        'chinB': (-0.39, 0.494, 0.03),
        'chinF': (-0.428, 0.444, 0.022),
        'mls': (-0.41, 0.394, 0.016),
        'll': (-0.438, 0.352, 0.02),
        'sto': (-0.42, 0.318, 0.005),
        'ul': (ul[0], ul[1], 0.017),
        'sn': (sn[0], sn[1], 0.006),
        'col': (col[0], col[1], 0.008),
        'tip': (-0.488, 0.198, 0.009),
        'supra': (-0.469, 0.152, 0.02),
        'dors': (-0.44, 0.085, 0.04),
        'nas': (-0.418, 0.02, 0.03),
        'brow': (-0.432, -0.035, 0.04),
        'fh': (-0.43, -0.17, 0.1),
        'fh2': (-0.34, -0.38, 0.14),
    }
    tip = L['tip']
    wing = [(tip[0] + 0.012, tip[1] + 0.018, 0.006), (sn[0] - 0.012, sn[1] - 0.002, 0.008), (sn[0] + 0.024, sn[1] - 0.02, 0.01),
            (sn[0] + 0.018, sn[1] - 0.06, 0.012), (sn[0] - 0.018, sn[1] - 0.066, 0.01)]
    lash = lash_pts(-0.43 + 0.102, 0.035, 0.105, 0.012, 0.024, 1, 1.25, 0.018)
    return dict(name='C', L=L, skin=lm_profile(L), wing=wing, lash=lash, ff=-0.432, eyeY=0.035,
                ear=dict(c=(0.07, 0.11), h=0.225, w=0.1, rot=12),
                shade=[(0.19, -0.7), (0.14, 0.07), (0.12, 0.22), (0.01, 0.31), (-0.32, 0.52), (-0.32, 0.7), (1.2, 0.7), (1.2, -0.7)],
                neck=dict(front_top=(-0.1, 0.385), back_top=(0.26, 0.2), w=0.29, lean=6), adam=False)


# ------------------------------------------------------------------ the man's options
def him_A():
    """CLEAN (the recommended manly face): a brow shelf with the forehead sloping back above it, a deep bridge, a
    straight strong nose (NLA ~95), thinner lips near the line, a square chin ON the face line, a low straight jaw
    (~14 degrees) with a crisp corner, a thick upright neck with an Adam's apple."""
    sn = (-0.433, 0.245)
    ul = _lip(sn, 16, 0.046)
    col = _col(sn, 20, 0.062)
    L = {
        'back': [(0.02, -0.5, 0.22), (0.38, -0.4, 0.18), (0.53, -0.12, 0.16), (0.5, 0.12, 0.1), (0.36, 0.25, 0.05)],
        'jawA': (0.2, 0.355, 0.035),
        'jaw2': (-0.3, 0.495, 0.02),
        'men': (-0.385, 0.5, 0.03),
        'chinB': (-0.425, 0.472, 0.02),
        'chinF': (-0.432, 0.43, 0.012),
        'chinT': (-0.425, 0.405, 0.01),
        'mls': (-0.418, 0.385, 0.014),
        'll': (-0.44, 0.348, 0.012),
        'sto': (-0.427, 0.318, 0.004),
        'ul': (ul[0], ul[1], 0.01),
        'sn': (sn[0], sn[1], 0.006),
        'col': (col[0], col[1], 0.01),
        'tip': (-0.5, 0.205, 0.016),
        'supra': (-0.484, 0.15, 0.02),
        'dors': (-0.45, 0.06, 0.03),
        'nas': (-0.408, -0.03, 0.02),
        'brow2': (-0.44, -0.075, 0.025),
        'brow': (-0.432, -0.115, 0.03),
        'fh': (-0.4, -0.235, 0.08),
        'fh2': (-0.29, -0.405, 0.14),
    }
    tip = L['tip']
    wing = [(tip[0] + 0.016, tip[1] + 0.022, 0.008), (sn[0] - 0.016, sn[1] - 0.002, 0.01), (sn[0] + 0.03, sn[1] - 0.026, 0.012),
            (sn[0] + 0.022, sn[1] - 0.08, 0.016), (sn[0] - 0.024, sn[1] - 0.088, 0.014)]
    lash = lash_pts(-0.43 + 0.115, 0.0, 0.085, 0.01, 0.016, 1, 0.45, 0.016)
    return dict(name='A', L=L, skin=lm_profile(L), wing=wing, lash=lash, ff=-0.44, eyeY=0.0,
                ear=dict(c=(0.1, 0.075), h=0.25, w=0.115, rot=10),
                shade=[(0.2, -0.7), (0.16, 0.05), (0.15, 0.25), (0.08, 0.36), (-0.3, 0.52), (-0.3, 0.7), (1.2, 0.7), (1.2, -0.7)],
                neck=dict(front_top=(-0.14, 0.43), back_top=(0.3, 0.2), w=0.47, lean=6), adam=True, brows=True)


def him_B():
    """SOFT MASCULINE (the young, gentle-handsome read: 03's student, the 'idol'): a softer brow, a straight slim nose
    lifted a touch (NLA ~99), a clear chin a hair behind the line, a long clean jaw, a long neck with a small Adam's
    apple."""
    sn = (-0.432, 0.24)
    ul = _lip(sn, 17, 0.047)
    col = _col(sn, 26, 0.058)
    L = {
        'jawA': (0.17, 0.33, 0.04),
        'jaw2': (-0.3, 0.497, 0.03),
        'men': (-0.375, 0.5, 0.035),
        'chinB': (-0.42, 0.466, 0.025),
        'chinF': (-0.427, 0.43, 0.02),
        'mls': (-0.416, 0.388, 0.016),
        'll': (-0.44, 0.346, 0.014),
        'sto': (-0.426, 0.315, 0.005),
        'ul': (ul[0], ul[1], 0.012),
        'sn': (sn[0], sn[1], 0.006),
        'col': (col[0], col[1], 0.01),
        'tip': (-0.494, 0.197, 0.014),
        'supra': (-0.48, 0.14, 0.02),
        'dors': (-0.448, 0.05, 0.04),
        'nas': (-0.414, -0.03, 0.03),
        'brow': (-0.436, -0.09, 0.035),
        'fh': (-0.415, -0.22, 0.09),
        'fh2': (-0.31, -0.395, 0.14),
    }
    tip = L['tip']
    wing = [(tip[0] + 0.014, tip[1] + 0.02, 0.008), (sn[0] - 0.014, sn[1] - 0.002, 0.01), (sn[0] + 0.028, sn[1] - 0.024, 0.012),
            (sn[0] + 0.02, sn[1] - 0.074, 0.016), (sn[0] - 0.02, sn[1] - 0.082, 0.014)]
    lash = lash_pts(-0.43 + 0.11, 0.0, 0.09, 0.012, 0.018, 1, 0.6, 0.014)
    return dict(name='B', L=L, skin=lm_profile(L), wing=wing, lash=lash, ff=-0.436, eyeY=0.0,
                ear=dict(c=(0.095, 0.08), h=0.245, w=0.11, rot=10),
                shade=[(0.2, -0.7), (0.16, 0.05), (0.15, 0.24), (0.06, 0.34), (-0.3, 0.52), (-0.3, 0.7), (1.2, 0.7), (1.2, -0.7)],
                neck=dict(front_top=(-0.12, 0.42), back_top=(0.29, 0.2), w=0.42, lean=6), adam=True, brows=True)


def him_C():
    """RUGGED (the most mature): a heavy brow, a longer nose with a soft bump, a square chin a touch forward, a wide
    angular jaw, a thick neck, and a short beard as ONE flat tone over the jaw and chin (04's lesson), never lines."""
    sn = (-0.424, 0.25)
    ul = _lip(sn, 12, 0.044)
    col = _col(sn, 16, 0.072)
    L = {
        'back': [(0.02, -0.5, 0.22), (0.38, -0.4, 0.18), (0.54, -0.12, 0.16), (0.51, 0.12, 0.1), (0.37, 0.26, 0.05)],
        'jawA': (0.22, 0.37, 0.03),
        'jaw2': (-0.3, 0.5, 0.02),
        'men': (-0.395, 0.505, 0.03),
        'chinB': (-0.442, 0.476, 0.02),
        'chinF': (-0.447, 0.432, 0.012),
        'chinT': (-0.435, 0.405, 0.01),
        'mls': (-0.416, 0.388, 0.014),
        'll': (-0.43, 0.352, 0.01),
        'sto': (-0.42, 0.322, 0.004),
        'ul': (ul[0], ul[1], 0.008),
        'sn': (sn[0], sn[1], 0.006),
        'col': (col[0], col[1], 0.01),
        'tip': (-0.512, 0.212, 0.016),
        'supra': (-0.494, 0.155, 0.02),
        'dors': (-0.47, 0.06, 0.03),
        'nas': (-0.404, -0.03, 0.02),
        'brow2': (-0.446, -0.07, 0.02),
        'brow': (-0.437, -0.115, 0.03),
        'fh': (-0.395, -0.24, 0.08),
        'fh2': (-0.28, -0.41, 0.14),
    }
    tip = L['tip']
    wing = [(tip[0] + 0.016, tip[1] + 0.022, 0.008), (sn[0] - 0.016, sn[1] - 0.002, 0.01), (sn[0] + 0.03, sn[1] - 0.026, 0.012),
            (sn[0] + 0.022, sn[1] - 0.084, 0.016), (sn[0] - 0.024, sn[1] - 0.092, 0.014)]
    lash = lash_pts(-0.43 + 0.118, 0.005, 0.085, 0.008, 0.016, 1, 0.4, 0.016)
    beard = [(0.06, 0.03, 0.03), (0.0, 0.14, 0.06), (-0.26, 0.27, 0.06), (-0.36, 0.262, 0.03), (-0.44, 0.262, 0.0),
             (-0.6, 0.262, 0), (-0.6, 0.7, 0), (0.4, 0.7, 0), (0.3, 0.32, 0.05), (0.14, 0.12, 0.04), (0.12, 0.03, 0.02)]
    return dict(name='C', L=L, skin=lm_profile(L), wing=wing, lash=lash, ff=-0.446, eyeY=0.005,
                ear=dict(c=(0.11, 0.075), h=0.25, w=0.12, rot=10),
                shade=[(0.21, -0.7), (0.17, 0.05), (0.16, 0.25), (0.09, 0.37), (-0.3, 0.53), (-0.3, 0.7), (1.2, 0.7), (1.2, -0.7)],
                neck=dict(front_top=(-0.15, 0.44), back_top=(0.31, 0.2), w=0.5, lean=5), adam=True, brows=True,
                beard=beard)


HER = {'now': now_profile(False), 'A': her_A(), 'B': her_B(), 'C': her_C()}
HIM = {'now': now_profile(True), 'A': him_A(), 'B': him_B(), 'C': him_C()}


# ------------------------------------------------------------------ measurement (the same as RESEARCH Part 2)
def ang(a, o, b):
    v1 = (a[0] - o[0], a[1] - o[1])
    v2 = (b[0] - o[0], b[1] - o[1])
    c = (v1[0] * v2[0] + v1[1] * v2[1]) / math.hypot(*v1) / math.hypot(*v2)
    return math.degrees(math.acos(max(-1, min(1, c))))


def behind(p, a, b):
    """horizontal distance of p behind the line a-b (positive = behind, for a face looking left)"""
    t = (p[1] - a[1]) / (b[1] - a[1])
    x = a[0] + t * (b[0] - a[0])
    return p[0] - x


def measure(F):
    L = F['L']
    ff = F['ff']
    g = L.get('brow2', L['brow'])
    m = {}
    m['eye'] = F['eyeY'] + 0.5
    m['nasion'] = L['nas'][1] + 0.5
    m['tipY'] = L['tip'][1] + 0.5
    m['noseLen'] = L['tip'][1] - L['nas'][1]
    m['proj'] = ff - L['tip'][0]
    m['NLA'] = ang(L['col'], L['sn'], L['ul'])
    m['NFA'] = ang(g, L['nas'], L['tip'])
    m['UL'] = behind(L['ul'], L['tip'], L['chinF'])
    m['LL'] = behind(L['ll'], L['tip'], L['chinF'])
    m['chin'] = L['chinF'][0] - ff
    m['lower'] = 0.5 - L['sn'][1]
    ja = L['jawA']
    jb = L.get('jaw2', L['men'])
    m['jawRise'] = math.degrees(math.atan2(jb[1] - ja[1], ja[0] - jb[0]))
    m['jawLen'] = math.hypot(ja[0] - L['chinB'][0], ja[1] - L['chinB'][1])
    return m


if __name__ == '__main__':
    for nm, S in (('her', HER), ('him', HIM)):
        for k, F in S.items():
            m = measure(F)
            print(f"{nm} {k:4s} eye {m['eye']:.3f} nasion {m['nasion']:.3f} tip {m['tipY']:.3f} len {m['noseLen']:.3f} "
                  f"proj {m['proj']:.3f} NLA {m['NLA']:.0f} NFA {m['NFA']:.0f} UL {m['UL']:.3f} LL {m['LL']:.3f} "
                  f"chin {m['chin']:+.3f} lower {m['lower']:.3f} jaw {m['jawRise']:.0f}deg {m['jawLen']:.2f}")
