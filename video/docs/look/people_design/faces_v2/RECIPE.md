# Faces and bodies with appeal: the recipe (faces_v2, a DRAFT, 2026-10-30)

**Status: a DRAFT for the owner's pick (an ITERATION).** Once picked it replaces `../../PEOPLE_DESIGN.md` §5.3 (the face
rule) and updates §5.1 (proportions); until then it changes no rule. It ranks as a look doc (below the playbook,
`DIRECTION.md`, `CRAFT.md`). Why each number: `RESEARCH.md` (F1-F14 and Part 2, the measurements). What to look at:
`SHEETS.md`. Recommended: **her B (CUTE)** and **him A (CLEAN)**; the other options are kept below so the owner can
pick another. The hair is the hair round's (`../hair_v2/`); this recipe owns the face, the ear's showing, the neck and
the body's composition.

Units: **h** = the skull, crown (0) to chin (1); **H** = the figure (1000). The profile faces screen-left; "x behind" =
toward the back of the head, measured from the **face front** (the forehead's most forward point at the brow). All the
numbers are the sheet's own geometry (`sheets_src/faces.py`), so the build can copy them.

## 1. Her face (recommended: B, CUTE: 05's lesson at an adult dose)

**The idea in one line:** a small face set low on a big head, a tiny lifted nose with one crisp point, one soft lip
bump, a small round chin on the face line, a short V jaw that turns up under the ear, a long slim neck, the ear
showing; everything else round (F3, F4, F9).

**The profile** (now = LASH as built, for the change):

| | B (recommended) | now (LASH) | why |
|---|---|---|---|
| forehead | one round curve that bulges 0.011 h ahead of the brow at 0.34 h, then flows into the nose with no notch | upright, flat | F4 (the cute profile's forehead), F8 (female) |
| brow (the face front) | at 0.48 h | 0.42 h | the features 0.05 h lower |
| the bridge (nasion) | 0.545 h, only 0.012 h behind the brow: a shallow bridge (nasofrontal ~150) | 0.465 h, 0.02 behind | F5, F8 |
| **the lash** (closed) | at **0.555 h**, from 0.05 h behind the face front, **0.105 h long**, bowed down 0.018 h, the outer third lifting a touch, ONE flick (1.15x); 0.025 h at its thickest | 0.50 h, 0.095 h long | F10: one curve; lower and longer = the "large, low eye" of F3/F4 without an open eye |
| **the nose** | **0.163 h** from the bridge to the tip; the tip at **0.708 h**, only **0.042 h** proud of the face front; a soft scoop (0.009 h at mid-dorsum); the tip ROUND (radius 0.018 h); the underside rising 42 degrees, so the **nose-to-lip angle ~110** | 0.219 h, 0.080 proud, straight, sharp, ~100 | F4, F5 (the cute end of 95-110; 05 is a cartoon ~120) |
| the wing | one small shade under the tip, never up to the bridge | the same | F14 |
| **the lips** | ONE soft bump in the skin tone (never a line): the upper lip at 0.795 h, **0.012 h behind the tip-to-chin line**, the lower 0.858 h, 0.009 h behind | 0.031 / 0.019 h behind (sunken) | F6 (fuller, modern) |
| the lower face | the nose's base at 0.756 h: **0.244 h** to the chin | 0.260 h | F3 (a smaller chin) |
| **the chin** | small and round (radius 0.04 h), its front at 0.943 h, **0.010 h behind the face front** | 0.022 h behind (weak) | F7 |
| **the jaw** | a short V: from the chin's bottom straight to the angle, **rising ~34 degrees, 0.48 h long**; the angle 0.48 h behind the face front at 0.755 h (just under the ear's lobe) | 0.56 h at 17-20 degrees: a long low shelf | F3, F7 (a narrow, tapering lower face) |
| **the ear** | shows where the hair is tucked behind it: one soft D, 0.225 h tall, 0.105 h wide, tilted back 12 degrees, centred 0.48 h behind the face front at 0.63 h; lit front, shaded back, ONE inner notch | hidden | 05; F14 (one notch, no detail) |
| the neck | leaves the jaw 0.35 h behind the face front; **0.27 h deep** in profile (0.035 H), upright (6 degrees forward), in the shade tone | 0.36 h, leaning 12 | F12; the hair round's upright neck |

**The 3/4 head (yaw -34)** (`sheets_src/sheet_profiles.py`, `Q_HER['B']`): the features 0.05 h lower than now; the near
lash 1.05x long at 0.545 h, the far lash shorter and tucked toward the contour (never twins, F10); the nose's tip at
0.705 h breaking the far contour by only 0.112 h x sin(yaw) (now 0.155); the nose hook (the wing and the shade under
the tip) smaller; the lips 0.01 h forward and 0.015 h lower on the far contour; the near jaw's angle up and in to
(0.235, 0.27) (now (0.27, 0.31)), so the cheek-to-chin line is a V; the far cheek 0.012 h fuller; the near ear shows,
in the shade plane.

**What shows at which size** (the skull on screen; replaces §5.3's table where it differs):

| skull | figure | her face shows |
|---|---|---|
| < 12 px | < 95 px | nothing (the facing reads where the skin meets the hair) |
| 12-18 px | 95-145 px | the contour only: the forehead's curve, the nose's point (1.5-2 px proud), one lip bump, the chin, the jaw's V against the shaded neck |
| 18-40 px | 145-320 px (the film's "you") | the contour + the lash (~1 px) + the ear as one shape (no notch) |
| >= 40 px | close shots | everything above: the wing, the ear's notch, the lips as one tone bump, the 3/4 head |

**The other two (kept for the pick):**
- **A, REFINED:** the placement as now (the lash at 0.50 h); only the parts fixed: the nose 0.203 h, 0.056 h proud,
  softly scooped, round tip, nose-to-lip ~105; the lips 0.020 / 0.012 h behind the line; the chin 0.006 h behind the
  face front; the jaw ~29 degrees; the neck 0.31 h. The least change; reads adult and pleasant, less cute.
- **C, CHIC:** placed low like B; a straighter ski-slope nose with a crisp point (radius 0.009 h, 0.056 h proud,
  ~106); a soft pout (the upper lip 0.017 h behind the line); a pointed V chin 0.004 h behind the face front; a crisp
  straight jaw (~30 degrees); a long neck. Reads fashion-modern, cooler than B.

## 2. His face (recommended: A, CLEAN: manly, friendly, modern)

**The idea in one line:** built of straights and corners: a brow shelf with the forehead sloping back above it, a deep
bridge, a straight strong nose, thinner lips, a square chin ON the face line, a low straight jaw with a crisp corner, a
thick upright neck with an Adam's apple (F2, F8, F9); the closed lash shorter and flatter than hers.

| | A (recommended) | now (LASH, the man) | why |
|---|---|---|---|
| forehead | two planes: the brow shelf, then the forehead sloping back ~14 degrees to the hairline | one plane into the nose | F8 |
| the brow shelf | 0.425 h, 0.008 h proud of the forehead's foot | none | F8, F9 |
| the bridge | 0.47 h, **0.032 h behind the brow**: a deep bridge (nasofrontal ~123) | 0.02 h behind (~129) | F5, F8 |
| the lash | at 0.50 h, 0.085 h long, bowed only 0.010 h, a short flick (0.45x), 0.016 h thick | the same flick | F10 (his eye calmer, flatter) |
| the nose | straight (no scoop), **0.235 h** long, the tip at 0.705 h, 0.060 h proud, a defined tip (radius 0.016 h), the **nose-to-lip angle ~94** | 0.219 h, 0.100 proud, ~96 | F5 (90-95 in men) |
| the lips | thinner (radius 0.01 h), the upper 0.029 h behind the tip-to-chin line | 0.046 h behind | F6 |
| **the chin** | square: a flat front 0.065 h tall (0.905-0.97 h), **0.008 h behind the face front**, its bottom corner crisp | 0.014 h behind, round | F7, F9 |
| **the jaw** | low and straight: **rising ~16 degrees, 0.64 h long**, a crisp corner (radius 0.035 h) 0.64 h behind the face front at 0.855 h | ~17 degrees, no corner | F7, F9 |
| the ear | shows (a short cut): 0.25 h tall, 0.115 h wide, centred at 0.575 h | under the hair | |
| **the neck** | **0.47 h deep** (0.06 H), upright (6 degrees), an **Adam's apple**: one soft bump on the throat line 0.2 h below the jaw; in front, its sides flare into the shoulders (the trapezius) | 0.46 h, leaning, no bump | F9, F12 |

**The 3/4 head:** the brow's bump and the eye socket's dip on the far contour 0.012 h deeper than now; the near jaw's
angle lower and wider (0.33, 0.35) (now (0.31, 0.33)); the chin wider (0.13 h) with a blunt, flat bottom; the nose a
touch less proud (projection factor 0.165, now 0.175), so it reads straight and strong, not big; the two lashes short
and nearly straight; the ear shows.

**At film size** his manliness reads from the jaw's corner against the shaded neck, the thick neck, the short hair and
the V of the body (§3); the lash and the brow shelf are close-shot detail.

**The other two:** **B, SOFT** (the young, gentle-handsome read: a softer brow, a slim nose lifted to ~99, a clear chin
0.009 h behind, a long clean jaw at ~20 degrees, a long neck with a small Adam's apple); **C, RUGGED** (a heavy brow, a
longer nose ~0.24 h, a square chin on the line, a wide jaw at ~14 degrees, a thick neck, and a short beard as ONE flat
tone over the jaw, the chin and the upper lip, never lines; 04's lesson; the beard reads even at film size, so it is a
casting choice for some men, never everyone).

## 3. Bodies: the composition (the numbers that change from §5.1)

Widths are full widths in the front view, H = 1000; the depths are full depths in profile. Only these change; the
heights (§5.1, and the hair round's height sheet) stay.

| | her now (§5.1) | **her recipe** | his now | **his recipe** | why |
|---|---|---|---|---|---|
| skull | 128 (7.8 heads) | 128 (the owner's call: 132, 7.6 heads, if B's face wants a touch more head) | 127 | **125 (8.0 heads)** | F4 (a big head = young: hers held), F9 |
| neck width | 46 (v2 42) | **40**, visible 45-50 long, upright | 58 | **62**, its sides flaring ~30 into the shoulders (the trapezius) | F12 |
| shoulders | 240, sloping 16 degrees | **228, sloping 19** | 272, sloping 10 | **290, sloping 13** | F11 |
| chest | 200 | 194 | 236 | **252** | |
| waist | 158 | **148** (at 0.63 H) | 184 | **180** | F11 |
| hips | 210 | **214** | 196 | **190** | F11 |
| **the ratio** | waist : hips 0.75; shoulders : hips 1.14 (a box through a coat) | **0.69; 1.07** (an hourglass read through clothes) | shoulders : waist 1.48 | **1.61** (the V) | F11 |
| knee / calf / ankle (full widths) | 60 / 66 / 34 | **54 / 62 / 27** (thigh : ankle ~3.6 : 1) | 68 / 74 / 38 | 70 / 78 / 38 | 05's taper |
| arm / elbow / wrist | 50 / 40 / 29 | **44 / 34 / 24** | 60 / 48 / 34 | **66 / 50 / 36** | |
| hand / foot | 98 / 148 | **94 / 140** | 104 / 156 | **108 / 160** | |
| depths: chest / waist / hips | 132 / 116 / 140 | 128 / 108 / 144 (a gentle S, never a bust) | 148 / 128 / 136 | **160** / 124 / 132 | F11, tasteful |

Variety (§5.1's builds: slim, average, athletic, soft) keeps these ratios as the average's and moves the widths by
+-15-20; the ratios never invert (no woman's shoulders wider than her hips + 15, no man without a V).

## 4. Never

- **Caricature:** a nose over 0.24 h long or more than 0.10 h proud; a nose-to-lip angle over ~118 (piggy) or under
  ~88 (droopy); a chin receding more than 0.015 h or jutting more than 0.01 h past the face front; lips past the
  tip-to-chin line; her jaw steeper than ~38 degrees (a doll's point); his jaw wider than his cheekbones in 3/4; any
  single feature changed alone (F1, F14).
- **Sexualised:** no bust or hip exaggeration (her chest depth <= 0.13 H, hips <= 0.22 H wide); no cleavage, crop-top
  posing or hip-out "model" stance as staging; lips at rest, never a seductive pout; no muscle display or bare chest on
  him; the camera never lingers on a body. Tasteful and generic (the playbook).
- **Dated:** corporate Memphis and kin (tiny heads, noodle limbs, blank faces, odd skins); dot eyes; the 2010s circle
  head; big-eyed dolls; heavy outlines; drawn brows as arcs, blush dots, a mouth line (§5.3's list stands) (F13).
- **Uncanny:** realistic parts on the flat face (nostrils, lip lines, eye whites, ear detail beyond one notch); mirror
  twins in 3/4 (two equal lashes); a face too small for its head (the blank-oval mannequin); an open-eyed 3/4 face
  (F10, F14).

## 5. What it asks of the docs above (proposals, the orchestrator's after the owner's pick)

- `PEOPLE_DESIGN.md` §5.3: the profile bullet's numbers become §1 and §2 here (the brow, the nose, the lips against
  the line, the chin ON the face line instead of 0.02-0.03 h behind, the jaw's V for her and the corner for him); the
  lash bullet takes §1's placement; the ear may show where the hair is tucked (new); the size table takes §1's.
- `PEOPLE_DESIGN.md` §5.1: §3's widths and ratios.
- The build (after the hair round lands, so two agents never edit the same code): `graphic_faces/head.ts`
  `headProfile` and `head34` take the options' points from `sheets_src/faces.py` and `Q_HER` / `Q_HIM`; an ear part;
  the Adam's apple and the trapezius; `body.ts` (or `hair_v2/stance.ts`) the widths. Also a gap seen on the way: the
  FcTest man in profile draws no hair (`graphic_faces`, LASH, view 'p').
