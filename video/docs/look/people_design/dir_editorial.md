# People, direction: CLEAN EDITORIAL

**Status: a look test (2026-10-30), stills only, for the owner to judge.** One of the people-design directions built
on the research in this folder (`diagnose.md`, `design_research.md`, `fashion.md`). It is a look doc: it ranks below
the playbook, `DIRECTION.md` and `CRAFT.md` and changes no rule until the owner picks it. The sheet is
`dir_editorial.png` (2400 x 2800); the reusable SVG components are in `src/look/people_dirs/editorial/`.

**The direction in one line:** elegant, slightly elongated fashion-illustration proportions, crisp flat shapes with
one soft light gradient per form, a refined restrained palette, faces reduced to a profile line or hidden by hair and
angle.

## 0. The ask (owner, verbatim)

- "One thing we I don’t like about people on our design is there is a lot style involved like we need to draw people
  that are beautiful and pleasant and the clothing is appealing. Our. Current design is very old style and frankly
  ugly so it’s tricky I think it will require its own deep research" (2026-10-30)
- "Yes then people I think we should target 20-30 yo today with styles that are just cool and appealing to look at so
  think instagram infkuebcers, New York, Los Angeles, including hair clothing and perhaps less of faces like faces we
  need to find a way to draw in a more generic way" (2026-10-30)
- "Another bit is humans we paint - they should be better / ... On the video the person is not substantially
  different than yours but certainly more refined and clean and more fluid" (2026-10-29)

## 1. What the sheet shows

- **A. HER, the lead (~27; light-medium warm skin, espresso hair; the film's teal as her accent)** in two outfits,
  each from the front 3/4, in profile (walking) and from behind, 640 px tall:
  - *autumn city evening*: an open chocolate wool coat to just below the knee, a cream crew-neck fine knit, a teal
    satin bias midi skirt (the accent), black pointed flats; long layers with curtain bangs, a centre part;
  - *casual weekend*: a teal cropped cardigan (the accent) over a white tee, straight dark-indigo jeans, slim white
    sneakers with a navy side stripe, a canvas tote on the shoulder, oversized sunglasses; a high ponytail.
- **B. Two supporting people, 3/4, 640 px:** a Black man (~28, deep brown skin, twists on a low taper) in a caramel
  suede chore jacket open over a white tee, relaxed navy trousers, the white-sock flash and dark loafers, looking down
  at his phone; an East Asian woman (~24, light skin, a textured black bob) in an oversized cloud-white shirt
  half-tucked into wide mid-blue jeans, burgundy ballet flats, her thumb hooked in a pocket. Beside them: the whole
  cast **at film size, 1:1** (200 px and 140 px tall in 1080 x 1920) on a mid-tone ground (`#B48C7C`, L\* 62), and
  **her in the painted still v6's doorway** (x2; the still's own her painted out of the plate by
  `dir_editorial_plate.py`).
- **C. The face treatment, large** (640 px panels; the head ~240 px): the profile line with one open lash; a 3/4
  face with the eyes lowered; the lost profile; 3/4 and profile with oversized sunglasses; the back of the head; the
  man's head bowed to his phone; the bob in profile.
- A palette strip.

## 2. Construction (why every view agrees)

Each person is ONE simple 3D model, posed, then projected at any view angle (`core.ts`): lofted horizontal
cross-sections (superellipses, interpolated by monotone cubics, so a designed width never overshoots) for the head,
torso, garments and hair shells; tubes along a joint chain (two-bone IK) for limbs, sleeves, trouser legs, the
ponytail and the neck. The screen outline of every form is one closed smooth Catmull-Rom path. So the front 3/4, the
profile and the back are the same person seen from three sides (never three drawings that disagree), a pose is a few
numbers (`poses.ts`), and the walk, the turned head and the hand in a pocket come from the skeleton (`body.ts`).

- **No outlines, ever.** Edges are steps of value between filled shapes. The only true lines are things that are
  lines in life: a bag strap (7.5 units), a sunglasses arm (~6), a lash (4.2; 0.42 % H).
- **Corners only where the material is crisp** (design_research S5): a sleeve's cuff, a trouser hem on the shoe, the
  coat's hem, a tote's top, the phone. Everything organic is one smooth loop.
- **Layers by depth** (`parts.ts`): far limbs, legs, shoes, lower garments, the neck, tops, the garment's inside
  (lining, in shade: what you see through an open front), outer garments, the neck's front above the collar, the head,
  the face's marks, hair, the near arm, the hand, accessories. A sleeve's cap sits inside its garment's shoulder (the
  garment's shoulder is built at shX + the sleeve's radius + 2), so an arm leaves the shoulder in one line.

## 3. Proportions (H = 1000, crown to sole; heights above the sole)

| | woman (her, the friend) | man |
|---|---|---|
| skull, crown to chin | **123** (8.1 heads); the friend 124 | **121** (8.3 heads) |
| neck: visible length / width | ~0.05 H / 0.042-0.046 H, slanting forward ~13 degrees | ~0.05 H / 0.054-0.059 H |
| shoulder joints / outer shoulders | y 806, x +-88 / +-114 (0.228 H wide) | y 800, x +-106 / +-136 (0.272 H) |
| chest / waist / hip half-widths | 88 / 73 / 101 (at y 738 / 632 / 516) | 110 / 90 / 97 (728 / 612 / 510) |
| hip joint / crotch / knee / ankle | 548 / 490 / 292 / 40 | 540 / 482 / 288 / 42 |
| upper arm / forearm / hand | 178 / 146 / **96** | 186 / 152 / **104** |
| foot (bare) | 148 | 158 |
| limb radii: thigh, knee, calf, ankle | 50, 26, 30, 14.5 (thigh : ankle 3.4 : 1) | 56, 30, 34, 17.5 |
| arm radii: upper arm, elbow, forearm, wrist | 25, 19, 20.5, 14 (1.8 : 1) | 29, 23, 24.5, 17 |

- **The elongation is in the legs only** (the crotch at 0.49 H, ~5 % above average, the dose the leg-length research
  finds most attractive, design_research §3); the torso stays real. 8.1 heads is near the top of the range (P1: 7.5-8.2); strangers
  should run 7.6-8.2 (P5), and a man stands ~8 % taller than the woman beside him (scale `h` by 1.08 when they share
  a frame; the sheet draws everyone at 640 px).
- **The calf** peaks high and behind (s 0.6 of the leg, pushed 7 units back) with its inner bulge a little lower
  (offset 3 units toward the inside at s 0.7), then a long concave sweep to a slim ankle (S2, S6).
- **Hands** are real size (0.096 H) and slender (0.32 of their length wide at the knuckles): four designed shapes
  (side with a thumb lobe split ~40 % down, back, grip, thumb hooked over a pocket), the wrist breaking ~10 degrees
  (H1-H3). At least one hand of each standing pose is anchored (a pocket, the strap, the phone).
- **Feet:** a low shoe is drawn over a bare foot (heel, instep rising to the ankle, toes) in the leg's gradient group,
  so the leg runs into the foot with no seam and the instep shows above a pump's or a flat's low vamp.

## 4. Light and palette

**One soft linear gradient per form** (`Person.tsx`): across the form's narrow axis, toward the key at the screen's
upper left; stops: hi at 0, base at 0.3, shade from 0.8 to 1. Parts of one garment share one gradient (a group), so
no seam shows where they overlap. Crisp flat shapes on top only where a form casts on another or a material is
crisp: the head's cast shadow on the neck, the hair's sheen, a sole band, a stripe, a lens's glint, folds.

**The ramp** (`color.ts`, CIE L\*C\*h): from one lit colour per material,
- hi: L\* +4.5 (hair +3, whites +2.5), the hue turned up to 5 degrees toward the key's gold (h 72);
- shade: L\* minus max(5, 0.17 L\* + 1.5) (skin max(6, 0.15 L\*); hair max(4, 0.2 L\*)), proportional so a dark coat
  keeps a readable step and a cream knit never greys; the hue turned up to 6 degrees toward warm red (h 28; skin
  toward h 32 with C\* x 1.08); **the hero teal keeps its hue** (C\* x 1.06);
- deep (cast shapes, the garment's inside): 1.75 x the shade step;
- sheen: L\* +9 (hair +13, satin +14, leather +18).
Shadows are colour, never grey or violet (DIRECTION rule 5; design_research V5).

**The cast's colours** (lit values):

| | hex | L\* | C\* | h |
|---|---|---|---|---|
| her skin (light-medium, warm) | `#DCAA8A` | 73 | 27 | 59 |
| his skin (deep brown) | `#8B5A42` | 43 | 28 | 52 |
| the friend's skin (light) | `#EBC8B0` | 83 | 19 | 62 |
| espresso hair (hers) / black-brown (theirs) | `#3A2B27` / `#2B2324` | 19 / 15 | 8 / 4 | 40 / 11 |
| **teal, the hero (v2's)** | `#0B8577` | 50 | 33 | 182 |
| chocolate (her coat) | `#5E3E31` | 30 | 18 | 48 |
| cloud cream (knit, tees, shirt) | `#EEE6DB` - `#F2ECE4` | 92-94 | 5-6 | 82 |
| indigo (her jeans) | `#33476A` | 30 | 23 | 278 |
| canvas (tote) / cream sole | `#E4D5C0` / `#D8C6AD` | 86 / 81 | 12 / 15 | 82 / 81 |
| caramel suede (his jacket) | `#AD7752` | 55 | 33 | 60 |
| navy (his trousers) | `#283651` | 23 | 19 | 279 |
| mid denim (her friend's jeans) | `#5F86A6` | 54 | 22 | 257 |
| burgundy (flats, the friend's one accent) | `#7A3238` | 31 | 34 | 21 |
| near-black leather (pumps, loafers) | `#2B2325` / `#3E2A22` | 15 / 19 | 4 / 12 | 1 / 48 |

**Rules.**
- **An outfit is a tonal base plus at most one accent** (V3). The hero teal goes on her only, on ONE piece per
  outfit and never on the biggest mass (the skirt under a chocolate coat; the cropped cardigan over indigo), so she
  is never a teal column again (diagnose cause 4). Strangers take one accent at most (the friend's burgundy flats).
- **Value: dark at the feet, light at the chest** (V1): shoes and trousers L\* 15-31, the outer layer 30-55, a light
  layer at the neckline L\* 92-94 (the knit, the tee, the shirt's V) that frames the face like a reflector. The
  exception is a deliberate light shoe (the slim white sneaker, the white sock flash): a style signal, kept small.
- **Hair is the darkest mass on the head** and at least 25 L\* from the skin (V2): her hair 19 on skin 73.
- **House DNA** (PALETTE.md): no beige, olive or grey anywhere; the neutrals are cream, chocolate, caramel, indigo,
  navy, burgundy.

## 5. Faces: generic, never blank

A face here is made of three things the best faceless editorial work shares: **a designed contour** (the profile line
or the cheek's sliver), **light** (the head's own gradient, a shade under the jaw) and **identity from hair and
accessories**. Never dot eyes, pupils, eye whites, a mouth line, nostrils, brows as arcs, or a blank frontal oval.

- **The profile line is the geometry** (`head.ts`): the skull's sections follow design_research §11.4 (the brow at
  0.42 h, a straight nose turned up a little, its tip 0.07-0.09 h proud at 0.68 h, the lips just behind the E-line, the
  chin 0.03 h behind the face's front, the jaw rising to its angle), so a profile's silhouette IS the face. The face's
  front is a flatter plane than the round back of the skull (superellipse exponent 2.45 from the brow to the jaw, 2.0
  behind), so a 3/4 face keeps its far eye instead of wrapping it away.
- **The head's cast shadow on the neck**: the head's outline shifted 0.13 h down and 0.05 h away from the key, in the
  skin's shade, clipped to the neck. It turns a neck from a pipe into a form, and the throat meets the jaw ~0.3 h
  behind the chin.
- **The face budget follows the head's size on screen** (design_research §11.3; `faceParts` in `figure.ts`, from the
  skull's height in px):

  | skull | figure | what the face shows |
  |---|---|---|
  | < 12 px | < 98 px | nothing but where the skin meets the hair; sunglasses from ~11 px |
  | 12-18 px | 98-146 px | ONE of: the profile line, sunglasses (lenses and bridge), the lost profile's cheek |
  | 18-40 px | 146-325 px | + one mark: a lash in profile or lost profile, or in a 3/4 front face the nose's T-shade |
  | >= 40 px | close shots | a 3/4 front face gets both lashes (the far one foreshortened, left out below 0.05 h so it never reads as a dot), the T-shade, a lip tone; the lost profile's lash flick (not under curtain bangs) |

- **The lash** (the one mark): at 0.505 h, from 16 to 47 degrees off the face's front, 4.2 units wide (0.42 % H);
  closed = bowed down 0.016 h with an up-flick at the outer end (serene, or looking down at a phone); open = nearly
  straight. Past ~112 degrees of turn the eye is behind the cheek and the lost profile takes over.
- **Oversized sunglasses** (fashion A1; the 2026 street-style accessory): from the brow line (0.385 h) to the
  cheekbone (0.612 h), 6-57 degrees off the front, rounded-square, the darkest piece on the head (`#2A2124`, L\* 14),
  one glint streak on the key-side lens, the arm a true line to the ear. About one person in three, outdoors, in
  daylight.
- **The T-shade** (close 3/4 faces; our no-outline form of the brow-and-nose stroke): from 0.48 to 0.72 h down the
  side of the nose that faces away from the key, widening from 1.5 to 10 degrees at the nostril, a small wedge under the
  tip; skin shade at 60 % opacity. **The lip tone**: L\* -8, C\* +9, the hue 9 degrees redder than the skin, at 55 %
  opacity, on the face's near half only (on a turned face the far half sits on the contour and reads as a blot).
- **Ears** show only where the hair is tied back or short (the ponytail, the taper): one small skin shape.

## 6. Hair: the head's identity

Each style is ONE main mass (a shell over the skull with real volume, in the head's frame) cut along a designed
hairline, 0-2 secondary masses, and ONE sheen (`hair.ts`). The masses of one head share one gradient.

- **The hairline is a table per style** (`FACE` in `hair.ts`): the face opening's half-angle off the front by the
  height down the skull, separately left and right (a side part), wrapping behind the ear and round the nape for
  tied-back and short styles. Cut as two half regions so a view from behind never bridges the back of the head.
- **Volume beyond the skull** (R2): long +0.05 h at the hairline, +0.066 at the sides, +0.09 at the back, +0.05 on
  top; the ponytail sleek, +0.01-0.03; the bob +0.08 at the temples, flaring wider to the ends (an A); the twists
  +0.15 on top plus the lobes.
- **The sheen** (R5): a crescent set just inside the contour where it faces the key (`contourBand` in `core.ts`):
  0.03-0.04 h in from the edge, 0.06-0.07 h thick at its middle, tapering at both ends, up to 0.85-0.95 h long, at
  L\* +13; on the ponytail a band down its key side; on long hair a second long sheen down the fall in side and back
  views; on the twists three short arcs on the key-side lobes. This is the difference between a helmet and groomed,
  healthy hair.
- **The four styles on the sheet:**
  - *Long layers with curtain bangs, centre part* (her A; fashion H2): the bangs open from the part in a soft arch to
    the cheekbones (the opening 2 degrees at 0.13 h, 31 at 0.28 h, 64 at 0.5 h), framing the eyes in 3/4 and sweeping
    past the eye in profile; a parting notch; the fall rests ON the back (its front edge on the neck and the back's
    surface, 0.2 h thick), spreads over the shoulders (to 1.04 h wide) and ends in a soft V (the sides lifted 0.2 h)
    with two shallow notches seen from behind: bouncy ends, not a straight blunt slab.
  - *High ponytail* (her B; H5 placed high): sleek to the skull, a clean hairline that frees the ear and the nape,
    a tie at 0.2 h down the back of the crown, the tail 1.3 h long, 0.13 h at its widest, with a soft S: her flowing
    element.
  - *Textured bob, side part* (the friend; H1): chin length, graduated (up to 0.075 h shorter at the back), the ends
    a little wider than the cheeks, five soft uneven notches (0.045-0.07 h deep): separated ends, never a comb.
  - *Twists on a low taper* (the man; H9): a rounded top (not a flat-top) scalloped into lobes of unequal size
    (period 0.105 h, height up to 0.045 h), the sides and nape a lighter taper (the skin showing through).

## 7. Clothing

Garments are 1-2 lofted masses that follow the contrapposto spine; fit is the distance from the body (C3: compact
<= 0.01 H, relaxed 0.015-0.025, roomy 0.03-0.06), ONE roomy piece per figure against compact ones (C2), current
lengths (C5) and cuts (C6), and ONE finish detail each (C9). Folds are value slivers (tapered spindles at 50-65 %
opacity, never lines; C7): 0-2 per garment.

| | piece | length (H, above the sole) | fit | the one detail |
|---|---|---|---|---|
| her A | wool coat, open, unbelted | hem 0.268 (just below the knee) | roomy: +0.027 at the chest, +0.033 at the hem; the shoulder's half-width 0.124 H (dropped) | notch lapels; the open front shows its dark inside; two drop folds and a vent at the back |
| | fine knit, crew neck | tucked at 0.626 | compact | the neckline hugging the neck |
| | satin bias midi slip skirt (teal) | 0.168 | clings at the hip, swings below | one soft sheen spindle over the hip (the flowing element in a walk) |
| | pointed flats | toe 0.163 H long | | the instep showing above the low vamp |
| her B | cropped cardigan (teal) | 0.606 (the waist) | relaxed; dropped shoulder | a V over the white tee, a ribbed hem band, a lighter placket |
| | straight jeans, dark indigo | to the shoe (0.016 below the ankle) | relaxed straight, 0.092-0.11 H wide | the pull from the crotch to the forward knee in the walk |
| | slim low sneakers | 0.158 H long, 0.045 tall | | a cream sole band 0.009 H and a navy side stripe |
| | canvas tote on the shoulder | 0.18 H tall | | the strap lying on the shoulder |
| the man | suede chore jacket, open | 0.47 (the hip) | boxy, +0.03-0.04; the shoulder's half-width 0.146 H (dropped) | the flat collar and the open front over the white tee |
| | relaxed navy trousers | 0.016 above the ankle | relaxed straight | the white-sock flash between the hem and the loafer; a soft crease |
| the friend | oversized shirt, half-tucked | front tucked at 0.644, the back tail to 0.47 | oversized (the shoulder's half-width 0.125 H, dropped), sleeves pushed to the forearm | the open V and the collar points; a placket sliver |
| | wide jeans, mid denim | covering the shoe's back (0.03 below the ankle) | wide, 0.14 H at the hem | one long drop fold per leg |
| | burgundy ballet flats | | | the accent |

Sleeve radii (on arms of 25 / 29): the coat 34-29, the cardigan 29-19 (a 16-unit cuff band), the jacket 38-33,
the shirt 35-29 (pushed to 0.42 of the forearm, a 20-unit cuff).

**Never** (fashion §8, diagnose cause 2): the belted A-line coat with tights, ankle boots and a tube scarf; skinny
jeans; chunky sneakers; pompom beanies; a job worn as a prop; a box coat the same width from shoulder to hem.

## 8. Pose

Contrapposto in numbers (`skeleton` in `body.ts`; design_research A2): the pelvis shifts 16 units over the weight
foot and tilts 6 degrees (that hip up), the ribcage tilts 3.2 degrees the other way, the free foot 26-46 units forward
and 10-18 out, turned out 20-30 degrees. Arms: a coat pocket (the arm nearly straight, the elbow soft and back,
never a chicken wing), a front jeans pocket with the thumb out, a back pocket (the elbow out), the bag's strap, a
phone at the chest, a relaxed hang (the elbow 8-20 degrees), the walk's swing (+-12-14 degrees, one arm anchored).
The head turns 4-50 degrees off the body, nods, rolls 2-3 degrees; the gaze goes into the scene, never to the camera
(A7). The walk is a contact pose: the feet 0.3 H apart (a calm step; design_research A6 allows up to 0.5), a
2.5-degree lean, the back heel lifted 24-34 degrees.

## 9. The diagnosis, cause by cause

| # | cause (diagnose.md) | here |
|---|---|---|
| 1 | BODY: 3.7-4.9 heads, ball head, tombstone torso, bar legs, stub hands | 8.1-8.3 heads; an egg skull with a jaw on a visible slanting neck (from behind the skull is 0.37 of the shoulders' width, 0.44 with long hair); a sloped shoulder, waist and hip; tapered limbs with knees, calves and ankles; real-size slender hands; feet in real shoes |
| 2 | CLOTHES: one sack coat, job props, 2010s garments | four current outfits (fashion N1/N2, N4-N6, L1), garments with fit, length and one detail each, folds as slivers, no props that say a job |
| 3 | HAIR: balls and helmets | designed masses with volume, a parting, a sheen; curtain bangs, a high ponytail, a textured bob, twists on a taper |
| 4 | COLOUR: dressed in the set's paint | tonal neutrals + one accent; warm skins in a real range, shade turned toward red; hair the darkest mass; the teal on her only, never her biggest mass |
| 5 | POSE: stiff, symmetric | contrapposto, anchored hands, turned heads, a walk with one arm anchored |
| 6 | RENDER: clip-art outlines; lightless cut paper | no outlines; one soft gradient per form; crisp cast shapes only where a form casts |
| 7 | FACE: dot eyes; a skin mask in profile | the profile line, one lash, sunglasses, the lost profile, a size budget; no dots |
| 8 | DETAIL on icons | detail goes to the hair's outline, the garment's length and fit, the shoe, the bag's carry |
| 9 | TELLS | no stick legs, no clones, the far eye dropped rather than dotted |

## 10. Using the components

- `EdPerson` (`Person.tsx`): `<EdPerson x y h person pose flip? finish? shadow? pxScale? />` draws a person with the
  feet at (x, y), `h` px tall; `pxScale` tells it the true screen size inside a zoomed group (the face budget uses it).
- `buildPerson(person, pose, flip, px)` (`figure.ts`) returns the parts back to front (each a closed outline, a
  material, a tone, a layer); a film can restyle or animate them.
- A person = a `Build` (`WOMAN`, `MAN` in `body.ts`), a hairstyle, an outfit, materials (one lit colour + a kind:
  cloth, skin, hair, hero, leather, satin, denim, light, lens) and a face spec (`cast.ts`). Poses are in `poses.ts`.
- The sheet: `src/entry-look-people-editorial.tsx`, composition `EdSheet`;
  `GL=angle node scripts/render-frames.mjs EdSheet <dir> 0 --entry=src/entry-look-people-editorial.tsx --concurrency=1`.
  The doorway plate: `dir_editorial_plate.py` (its header has the command).

## 11. The phone check (the sheet at 400 px wide) and the one fix

At 400 px wide the silhouettes, the two outfits and the faces row read at once; the text does not (expected), and the
cast at film size is a strip of small figures, as on a real phone. Three things were fixed, once: the doorway test was
too small to judge her in the scene (now x2, cropped to the door); her autumn coat read as a plain brown column from
behind (two drop folds now hang from the shoulder blades, design_research C7); and the lost profile's lash flick
stuck out of the hair under the curtain bangs (it now shows only where no hair covers the eye's height).

## 12. An honest note

**Strengths.**
- **It reads at film size.** At 200 and 140 px the coat's length, the skirt, the jeans' width, the ponytail, the bob,
  the twists, the white sneakers and the sock flash all carry; nobody needs a face to be someone.
- **Adult, current and calm.** The proportions, the garments and the hair are what 20-30-year-olds wear in 2026, in
  a palette that stays inside the house, and the finish (clean shapes, one gradient each) sits in the painted still
  without fighting it (the doorway).
- **One model, every view.** Front 3/4, profile and back agree because they are one 3D person; a new pose is a few
  numbers; the same parts serve any size, with the face's detail following the size on screen.
- **Faces solved by design, not omission:** the profile line, one lash, sunglasses, the lost profile, the bowed head;
  the close 3/4 face with lowered eyes reads serene, not blank.

**Weak spots.**
- **It is clean, not painted.** Next to the owner's painted references (and to the PAINTED PIECES rule for skies and
  chosen set pieces) these are crisp vector forms with smooth gradients; in a painted world they may read a little
  "sticker". The doorway test holds up, but a film would want to test them under its own light (no local lights or
  rim are built yet: the phone's glow, a doorway's spill).
- **2.5D seams.** Building from lofts and tubes leaves small tells at joins: the faint seam of a sleeve's cap on a
  knit's shoulder, the narrow strip of the far front panel of an open coat in 3/4 (its dark inside now shows behind
  the inner layers, as a real lining would), a far hand that sits a little awkwardly at a coat's far edge. None reads
  at 200 px; at 640 px a careful eye finds them.
- **Elongation risk.** 8.1-8.3 heads with long legs is the top of the attractive range; in a crowd of these everyone
  looks like a model. Strangers should be drawn at 7.6-8.0 heads with ordinary legs (P5).
- **Limited repertoire.** Four outfits, four hairstyles, four hand shapes, standing and walking poses. No sitting,
  no leaning, no interaction between two people, no children or older people, no crowd tiers (people at 30-100 px
  need fewer parts; each figure here is 25-40 paths with gradients and masks).
- **Stills only.** The walk is a single contact pose, not a cycle; hair and hems have no follow-through yet; the cost
  of 60 fps scenes with several people is unmeasured.
- **The close 3/4 face is the riskiest panel.** Two closed lashes, a T-shade and a lip tone read serene and
  beautiful to us; an open-eyed 3/4 face is deliberately not designed (it would need eyes, which the research rates
  creepy or cartoonish on adult proportions).

## 13. What it would ask of other docs (proposals, not applied; the owner's pick first)

- **The playbook's people bullet** still says "round heads" (from reference 1); this direction draws egg skulls with
  designed hair for the "you" and near strangers (round heads only for far crowds under ~40 px).
- **`paint_recipes/people.md` §a/§d and `src/lib/figure/`**: the proportions of §3 here, the wardrobe of §7 (her A
  replaces the belted teal A-line coat, the tights, the boots, the scarf and the bun), the hair library of §6, and the
  face budget of §5.
- **The face rule** ("only the mascot has a face"; people.md §c, one closed-eye line at most): this direction keeps
  one mark at film size, and adds the close-shot 3/4 face (two lashes, the T-shade, a lip tone) only for heads of
  40 px and more, which is the owner's call (design_research §13.4).
