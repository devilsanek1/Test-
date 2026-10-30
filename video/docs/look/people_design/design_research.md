# People design research: appeal, contemporary style and generic faces

**Status: a research proposal (2026-10-30), not yet tested on a sheet.** It is a look doc: it ranks below the playbook,
`DIRECTION.md` and `CRAFT.md` and never overrides them. Where it asks another doc to change, §13 lists the change as
a proposal; nothing here is in force until the owner approves it. The diagnosis of our current people is the sibling
file `diagnose.md`; this file is the craft: the principles the best current illustration and animation use, each
turned into numbers or drawing instructions for our SVG engine (`src/lib/figure/`).

**Units.** H = the figure's height, crown to sole (1000 local units in the engine). h = the skull's height, crown to
chin (the face specs). px = pixels at the rendered size in our 1080 x 1920 frame. Our people are mostly 130-220 px
tall (the "you"), smaller in the mid and far ground, and seen from behind, in profile or in 3/4.

**How the sources were read.** Page fetches were blocked in this session (en.wikipedia.org, Valve's CDN); the
sources were read through search summaries. A number marked [n] comes from source n (§14); [ours] is our proposal,
to be proven on a sheet; [measured] is measured on our own files.

## 0. The ask (owner, verbatim)

- "One thing we I don't like about people on our design is there is a lot style involved like we need to draw people
  that are beautiful and pleasant and the clothing is appealing. Our. Current design is very old style and frankly
  ugly so it's tricky I think it will require its own deep research" (2026-10-30)
- "Yes then people I think we should target 20-30 yo today with styles that are just cool and appealing to look at so
  think instagram infkuebcers, New York, Los Angeles, including hair clothing and perhaps less of faces like faces we
  need to find a way to draw in a more generic way" (2026-10-30)
- "Another bit is humans we paint - they should be better / ... On the video the person is not substantially
  different than yours but certainly more refined and clean and more fluid" (2026-10-29)

## 1. The answer on one page

The playbook rules still hold: people are simple, seen from behind, in rear 3/4 or in profile, act with their pose,
and only the one "you" stands at a real size. Inside those rules, twelve changes make people beautiful and current:

1. **Adult, elegant proportions:** 7.8 heads (skull 0.128 H), legs about 5 % longer than average (the hip joint at
   0.545 H), a visible neck, real-size hands (~0.1 H) and feet (~0.15 H). Never the 9-10 heads of a fashion croquis,
   never corporate Memphis's giant limbs on tiny heads. (§3)
2. **Shapes with rhythm:** straights against curves, bulges offset across a limb, one big, one medium and a few small
   shapes, and never twins (two limbs doing the same thing). (§4)
3. **A silhouette that reads at its real size:** the black-fill test at the final pixel size, two clear negative
   spaces, no tangents, and a shape budget by size (8-12 shapes for the "you"; 2 for a crowd dot). (§5)
4. **Hands and feet as small designed shapes:** a mitten with a thumb lobe from 18 px; shoes as a style statement,
   with a light sole band. (§6)
5. **Hair as one designed mass,** plus 1-2 secondary masses and one sheen band. The back view is the hair's
   showcase, so the hair carries identity where a face would. A library of 10 current shapes. (§7)
6. **Clothes as 2-4 masses with believable drape:** volume contrast (a roomy piece against a compact one, width
   ratio >= 1.3), dropped shoulders, full-length wide trousers, folds as 0-1 value sliver per garment. (§8)
7. **Value runs dark at the feet to light at the chest and face; outfits are tonal neutrals plus at most one
   accent;** skin is warm and its shade turns toward red, never grey or violet; hair is the figure's darkest mass. (§9)
8. **Cool body language:** contrapposto (the pelvis tilted 5-8 degrees, the shoulders 3-5 the other way), one hand
   anchored (pocket, phone, cup, strap), the gaze away from the camera, a walk with less arm swing. (§10)
9. **Generic faces that read beautiful, not blank:** a face budget by head size, and only these faces: the back of
   the head, the lost profile, the profile line with at most one mark, sunglasses, hair or a brim hiding the face,
   and (close shots only, if the owner agrees) the "form face" made of light planes. Never a blank frontal oval
   above 12 px, never dot eyes, never pupils or mouths. (§11)
10. **The signals of "now" that read even at 150 px:** oversize sunglasses, a shoulder bag tucked under the arm or a
    big tote, low-profile sneakers, ballet flats or loafers, wide or barrel-leg trousers, a cropped or boxy jacket,
    a phone, an iced coffee, over-ear headphones, a cap. (§8)
11. **What reads dated, never drawn:** corporate Memphis (2017-2020); our own 2015-style flat figure (ball head,
    helmet bob, beanie, box coat); the 2014-2016 autumn uniform (a belted A-line coat, tights, ankle boots, a
    blanket scarf, a bun). (§2)
12. **A cast, not clones:** every crowd mixes skin tones, hair types and builds, with at least 4 silhouettes per 6
    people and an accent colour on at most 1 in 4. (§12)

## 2. What reads dated, what reads now

**Corporate Memphis (2017-2020): the look to avoid.** Facebook's "Alegria" illustration system, made with the studio
Buck from 2017, spread through tech branding until every site looked the same [1]. Its tells: flat geometric
figures, oversized and bendy limbs, small heads, featureless faces, non-representational skin colours (blues and
purples, meant to feel "universal"), bright primaries [1]; and, in our observation, people mid-jump or pointing.
From late 2020 it became a meme; critics call it generic, "featureless" and out of step with the present [1]. It is
part of what reads old.

**What replaced it (2025-2026).** Trend reports agree on a move away from the vector-perfect corporate look toward
work that feels made by hand: texture, grain, imperfect lines, "characters over faceless neutrality", and stylized
realism rather than either blank templates or uncanny photo-real people [2]. For us, that means: believable adult
proportions, specific styling (real garments, real hair), light and shade on every form, and a face strategy that is
deliberate (a choice of angle, light and accessory), never an empty template.

**Our own dated tells** (the full list with measurements is `diagnose.md`): the ball head on a collar with no neck
(our earlier her measured 4.9 heads, people.md §1); helmet bobs and beanies; box coats the same width from shoulder
to hem; the refined her of v6 still at 6.75 heads with short legs (the hip joint at 0.505 H against a real
0.53 H [9]) and hands 60 % of real size (0.064 H against ~0.105 H [9]) [measured, `src/lib/figure/model.ts`
PROP]; and a 2014-2016 autumn uniform (a belted A-line wool coat, tights, ankle boots, a tube scarf, a bun) worn as
one saturated column. Each is answered by a rule below.

**What reads "now" for 20-30 year olds in New York and Los Angeles (2025-2026 snapshots [15]):** wide-leg and barrel
jeans and trousers (the skinny fit is gone); a fitted baby tee or tank over baggy jeans; an oversized blazer or a
distinctive (not basic) leather jacket; black trousers with low-profile loafers or ballet flats; oversize
sunglasses ("the must-have street style accessory", NYFW autumn 2026); for men, wide relaxed trousers, refined
workwear (overshirts, chore coats), bombers, and either chunky retro sneakers or slim low-profile ones; hair that
looks low-effort and natural (blunt bobs, layered and "butterfly" cuts, sleek buns; for men textured crops, modern
mullets, buzz cuts, curls with a taper). Pantone's 2026 colour is a soft white ("Cloud Dancer") [15]. These are
garment types, not any artist's characters: we draw them in our own shapes and palette.

## 3. Proportions

**What the sources say.**
- The real average adult is ~7.5-7.7 heads tall; the classic idealized figure is 8 heads, which reads "noble or
  graceful"; a big head reads young and cute, a small head with a long body reads older and more serious [9].
- Fashion croquis use 9 heads (editorial 10), and the extra length goes mostly into the legs: the legs start at
  head 4 of 9 and take ~55-65 % of the height instead of ~half [9].
- But beauty research sets the limit: legs about 5 % longer than average were rated the most attractive, and
  excessively long legs less attractive, for both sexes and across 27 nations [4]. So we take the croquis's
  direction (a small head, long legs, a long neck) at the dose the research finds attractive, not the croquis's
  extreme (its legs are ~18 % longer than real).
- Body segment lengths as fractions of height (Drillis and Contini, 1966, as reproduced in Winter's biomechanics
  text [9]): chin height 0.870 H, shoulder 0.818 H, hip joint 0.530 H, knee 0.285 H, ankle 0.039 H; upper arm
  0.186 H, forearm 0.146 H, hand 0.108 H, foot 0.152 H; shoulder width 0.259 H, hip width 0.191 H (unisex). Hand
  studies put the hand at ~10.5-11 % of stature [9].

**The proposed proportions** (H = 1000 in the engine; heights above the sole, widths in the back view):

| | real average [9] | croquis, 9 heads [9] | refined her, v6 [measured] | **woman, the "you"** [ours] | **man** [ours] |
|---|---|---|---|---|---|
| skull, crown to chin | 0.130 (7.7 heads) | 0.111 | 0.148 (6.75) | **0.128 (7.8)** | **0.127 (7.9)** |
| chin | 0.870 | 0.889 | 0.852 | 0.872 | 0.873 |
| shoulder line | 0.818 | ~0.84 | 0.812 | 0.818 | 0.815 |
| waist (narrowest) | ~0.62 | ~0.67 | 0.616 | 0.625 | 0.610 |
| hip joint | 0.530 | ~0.58 | 0.505 | **0.545** | **0.540** |
| crotch | ~0.46-0.47 | ~0.56 | (under the coat) | **0.485** | **0.480** |
| knee | 0.285 | ~0.33 | ~0.26 | 0.295 | 0.290 |
| ankle | 0.039 | ~0.05 | 0.042 | 0.040 | 0.040 |
| upper arm / forearm / hand | 0.186 / 0.146 / 0.108 | | 0.182 / 0.158 / **0.064** | 0.183 / 0.148 / **0.098** | 0.186 / 0.150 / **0.105** |
| foot (shoe) | 0.152 | elongated | boot 0.13 | 0.145 (0.155) | 0.152 (0.165) |
| shoulder width | 0.259 (unisex) | | 0.236 | 0.240 | 0.270 |
| waist width | | | 0.168 | 0.160 | 0.185 |
| hip width | 0.191 (unisex) | | 0.212 | 0.210 | 0.195 |
| neck width | | | 0.050 | 0.046 | 0.058 |

**Rules.**
- **P1. Heads:** the skull 0.122-0.133 H (7.5-8.2 heads) for every adult; the "you" 0.128 H. With its hair mass
  the head reads at most 0.14 H tall. Never above 0.14 H (it turns cute and young, as our 4.9-head her did), never
  below 0.115 H (a fashion sketch). Keep heads small at every size: at small sizes painters' first mistake is a big
  head [14].
- **P2. Legs:** the extra length goes into the legs only (the torso stays real): the crotch at 0.48-0.49 H, about
  5 % above the average leg [4]. A man stands ~8 % taller than the woman beside him.
- **P3. The neck shows:** 0.04-0.05 H of visible neck between the chin and the shoulder line, 0.046 H wide (women),
  0.058 H (men). A collar or scarf may cover its base, never all of it, on the "you".
- **P4. Shoulders:** women 0.235-0.245 H, sloping 12-18 degrees from the neck; men 0.26-0.275 H, sloping 8-12
  degrees. Hips: women 0.205-0.215 H, men 0.19-0.195 H. A woman's waist 0.155-0.165 H; a man's 0.18-0.19 H.
- **P5. Variety:** strangers range 7.4-8.0 heads, ±5 % in height, waist and shoulders ±0.015-0.02 H (slim,
  average, athletic, curvy), never one body for everyone.
- At 145 px (the motion reference's girl) these give: head 18.6 px, neck 6.7 px wide, hand 14 px, shoe 22 px; at
  210 px: 27, 9.7, 21 and 33 px. All are drawable.

## 4. Shape language and rhythm

**What the sources say.** Balancing straights against curves is called the most important element of design for
simple, appealing animation characters: straight lines lead the eye fast, curves slow it down, and their contrast
gives interest and elegance; the body has few true straights, so animators exaggerate them [10]. Good gesture uses
offset apexes and avoids parallel forms [9]. The calf's outer (lateral) bulge sits higher and the inner (medial) one
lower [9]. One big, one medium and a few small shapes give rhythm and lead the eye [10]. Mirror-symmetric poses
("twinning") drain life; asymmetry is a route to appeal [10].

**Rules (for our closed Catmull-Rom loops).**
- **S1. Straight against curve on every part.** Across a part, one side is near straight (its control points within
  ±1 % of the part's length off the chord) and the other bowed (a sagitta of 3-8 % of its length):
  - the leg in profile: the shin's front straight, the calf's back curved; the thigh's front curved, its back
    straighter;
  - the arm: the outer contour straighter, the inner curved (biceps, forearm);
  - the torso in profile: the back a long straight, the chest (or the bust) a curve;
  - a garment: a straight hem or a straight trouser crease against a curved hip or shoulder.
- **S2. Offset the bulges across a limb, never mirror them.**
  - The calf: the outer peak at ~0.235 H, the inner peak ~0.03 H lower.
  - The ankle: the inner ankle bone higher than the outer.
  - The forearm: the thumb-side bulge near the elbow, the other side's lower.
  - In contrapposto, the weight side of the waist is a tight curve and the free side a long, flatter one.
- **S3. Big, medium, small.** One garment mass takes ~45-60 % of the figure's area, the next ~20-35 %, and the small
  shapes (head, hands, shoes, bag) the rest. Two equal halves (a jacket and trousers of the same area and value)
  split the figure and read flat.
- **S4. No twins.** The two arms differ by >= 10 degrees at the shoulder or >= 15 at the elbow; the two feet differ
  in angle (>= 10 degrees) or in position; the head never sits square on square shoulders.
- **S5. Corners only where a material is crisp:** a sneaker's sole, a bag's corners, a bob's blunt hem, a blazer's
  lapel, sunglasses. Everything organic is one smooth loop (people.md §a rule 4).
- **S6. Taper every limb toward its end:** thigh : ankle widths ~3 : 1, upper arm : wrist ~1.8 : 1. Uniform tubes
  read stiff.

## 5. Silhouettes at our sizes

**What the sources say.** A strong design is recognisable from a quick glimpse of its outline; fill the figure solid
black and check that the pose and attitude still read; clear negative space keeps a silhouette from becoming a blob
[11]. Valve designed its game characters to be told apart by silhouette at a distance, emphasising silhouettes with
rim highlights rather than dark outlines [3]. Small painted figures need little detail: a tapered "carrot" body with
a small oval head, legs apart or merged in a V, the nearest figures facing away and almost never any facial
features [14].

**The shape budget by size** [ours, extending people.md §b.1]:

| figure height | who | flat shapes | what is drawn | face (§11) |
|---|---|---|---|---|
| >= 300 px | a close "you" (rare) | 12-16 | thumb lobes, sole bands, 2-3 hair masses + sheen + 2-3 loose locks, 1-3 folds per garment | the form face |
| 130-220 px | the "you", a near stranger | 8-12 | mitten hands, shoes with a sole band, hair mass + 1 secondary + sheen, 0-1 fold per garment, 1 accessory, 1 flowing element | profile line (+1 mark from ~140 px), lost profile, sunglasses |
| 60-130 px | mid-ground strangers | 5-7 | hair, skin (face, neck, hands as one material), top, bottom, shoes, <= 1 accessory; 2 planes on the top and hair only | the skin-hair split; sunglasses from ~95 px |
| 30-60 px | far strangers | 3-4 | head with hair, top, legs merged with shoes; 1 value step | none |
| < 30 px | crowd dots | 2 | a head dab and a tapered body, split in a V when walking | none |

**Rules.**
- **L1. The black-fill test at the real size.** Render the figure at its final px height, filled black on white:
  the action (walking, standing, sitting, reaching), woman or man, and the garment type (skirt, coat, trousers) must
  read.
  Test the "you" at 145 and 210 px, a stranger at 60 px.
- **L2. Two negative spaces for the "you":** between an arm and the torso, between the legs (or under a hem), each
  >= 2 px wide at the rendered size (>= 0.01 H at 210 px). A walking figure shows the leg V.
- **L3. No tangents:** two edges either overlap by >= 3 px or are apart by >= 2 px; an edge that just touches another
  (an elbow grazing the waist, a hand kissing the thigh line) reads as a mistake.
- **L4. Profile and 3/4 first.** They show the bends (knee, elbow, the S of the back) that a straight back view
  hides; ref 04's girl is a profile. A back view needs the contrapposto (§10) and the hair (§7) to carry it.
- **L5. Three value groups at most below 100 px** (light, mid, dark), so the figure reads as one shape with a clear
  top and bottom (§9).

## 6. Hands and feet

**What the sources say.** Cartoon hands simplify to a palm block plus one combined finger mass (a mitten), with the
thumb as a separate form, and a finger split off only when the gesture needs it; Disney taught straights against
curves within the hand; clear angle changes at the wrist and knuckles keep the pose readable [10]. Real hands are
~10.5-11 % of stature, feet ~15 % [9].

**Rules.**
- **H1. Size:** hand 0.095-0.105 H (never below 0.085 H: our 0.064 H reads as a stub); the wrist 15-25 % narrower
  than the hand's widest point.
- **H2. Shape by the hand's length in px:**
  - under 10 px: a tapered teardrop (people.md §c);
  - 10-18 px: a mitten, the paddle with a rounded, slightly squared tip;
  - 18-40 px: the mitten plus a thumb lobe, split by a notch reaching 35-45 % down the hand; the back of the hand
    straight, the palm side curved (S1);
  - over 40 px: split the index finger only when it acts (on a phone, a strap).
- **H3. A relaxed hand never continues the forearm's straight line:** the wrist breaks 10-25 degrees, the fingers
  curl 20-35 degrees, the thumb faces forward. The far hand sits in its shade plane.
- **H4. A hidden hand is a cool hand:** in a pocket (the hand gone, the elbow out 15-25 degrees), under a sleeve, or
  holding something. At least one hand of the "you" is anchored (§10).
- **F1. Feet:** 0.145-0.155 H; a shoe adds 0.008-0.015 H at the toe and 0.02-0.045 H of height.
- **F2. Shoes are a style statement, drawn as one shape plus a sole band:**
  - the low-profile sneaker: 0.03 H tall, a rounded toe, a cream sole band 0.008-0.012 H;
  - the chunky sneaker: 0.045 H tall, a bulky toe, the sole band 0.015-0.02 H;
  - the ballet flat or loafer: 0.02-0.025 H tall, a slim oval toe, the instep (skin or sock) showing above;
  - a slim Chelsea boot (cold scenes only): a shaft 0.06-0.08 H tall.
  The sole band is the lightest thing near the ground (cream, L* <= 92, never pure white) and helps the feet read;
  it is a thin band, so the feet stay the dark end of V1 (§9).
- **F3. Standing feet turn out:** the near toe 10-20 degrees, the far foot partly hidden; feet never parallel side
  by side; a contact shadow under each.

## 7. Hair as designed masses

**What the sources say.** Block the big masses first, then medium clumps, then only a few strands: skipping to
detail reads chaotic. Clumps are simplified ribbons or flattened cones flowing from the hairline; keep them bold
(no "spaghetti"); a few loose locks that break the silhouette add life without clutter; shadows where clumps overlap
build volume; fill the head black to check that the hair shape reads [13]. With the face reduced, the hair's
outline does much of the identifying (the silhouette logic of §5 [11]).

**Rules.**
- **R1. One main mass, 0-2 secondary masses** (a bun, a ponytail, bangs, a tucked lock), and 0-3 loose locks that
  break the silhouette, only at >= 200 px. No strands.
- **R2. Volume beyond the skull:** sleek 0.01-0.02 h; normal 0.03-0.06 h; curls and coils 0.15-0.45 h.
- **R3. Design for the view we see.** Our camera mostly sees the back of the head, so the back view is the hair's
  showcase: pick a shape whose outline is distinctive from behind.
- **R4. Contour rhythm:** long smooth arcs (the straights) against a few short bumps or points; a lock's tip tapers
  to ~0.003 H.
- **R5. Planes:** lit, the shade crescent and the rim (people.md §b.3-5), plus ONE sheen band: a lighter crescent
  (+12-18 L*) 0.06-0.10 h thick, following the skull's curve at 20-35 % down from the crown on the key side. On
  curls, 3-5 small sheen arcs instead of one band. A parting is a narrow notch of shade at the top. The sheen is
  the difference between "a hat" and "healthy, groomed hair".
- **R6. The hairline frames the face:** in profile, one clean curve from the forehead (0.15-0.2 h below the crown)
  down in front of the ear; the ear is hidden or one small shape.
- **R7. Hair moves:** a ponytail or long ends are the figure's one flowing element (people.md §e's wind spec); a
  bob's ends lag the head by 2-3 frames.

**The library: 10 shapes that read current** (mostly as seen from behind; h = skull height):

| # | shape | the drawing |
|---|---|---|
| 1 | long, straight, centre part | one mass from the crown to 0.6-1.2 h below the chin, 1.05-1.15x the skull's width at the shoulders, the ends blunt with a slight V; from behind a faint centre shade line; the sheen band |
| 2 | sleek low bun | the mass tight to the skull (+0.01 h), a bun at the nape (an oval 0.35 x 0.28 h), the nape and neck showing: the "groomed" read |
| 3 | high ponytail | the mass tight to the skull, a tie at the crown's back, a teardrop tail 1.0-1.4 h long, 0.3 h wide at the root tapering to a soft point: the flowing element |
| 4 | claw-clip twist | the hair gathered into a vertical twist on the back of the head, 0.5 h tall, a dark clip (0.15 h), 3 short spiky ends fanning above it |
| 5 | blunt bob | the mass ends in a straight horizontal line at 0.9-1.05 h, a little wider at the ends than at the cheeks (an A): the straight hem against the round crown |
| 6 | curtain bangs, long layers | two fringe masses parted at the centre, ending at the cheekbones (0.55-0.65 h), framing the face in 3/4; the lengths flip outward below the shoulders |
| 7 | curls or coils | a cloud mass 0.15-0.45 h beyond the skull, its contour 5-9 scallops of unequal size (big, medium, small), a slightly darker inner band between clumps, 3-5 small sheen arcs |
| 8 | textured crop (men) | 0.06-0.12 h above the skull, a fringe falling forward to 0.25 h above the brow with 3-4 small notches; the sides tight and a step lighter where the skin shows through |
| 9 | curly top, taper fade (men) | a curly mass on top (0.15-0.25 h tall); the sides a thin band close to the skull, mixed toward the skin's tone; a clean neckline |
| 10 | curtains, modern mullet or buzz (men) | curtains: two masses falling to the cheekbones; mullet: longer at the nape (0.3-0.5 h below the hairline); buzz: skull-tight, +0.005 h, a soft hairline |

A cap (forward or backward) or a beanie without a pompom also reads current and solves the hair at small sizes; a
pair of sunglasses pushed up on the head reads current even indoors.

## 8. Clothing: a few appealing shapes with believable drape

**What the sources say.** Cloth hangs from points of support (shoulders, waist, hips) by gravity, and points of
tension (elbows, armpits, crotch, knees) matter as much as gravity; folds are modified by slackness, fullness,
tension, direction and the form beneath [12]. The classic seven folds: pipe, zigzag, spiral, half-lock, diaper,
drop and inert [12]. Hiding the face moves the attention to the clothes [7] (the faceless fashion editorial), so in
our films the wardrobe is a main carrier of beauty.

**Rules.**
- **C1. 2-4 garment masses** plus shoes and at most one bag or accessory (people.md's ~10-shape limit).
- **C2. Volume contrast:** one piece roomy, the other compact, their widest widths in a ratio >= 1.3: an
  oversized jacket over slim or bare legs; a fitted tee over wide or barrel trousers. Both fitted reads 2010s; both
  oversized reads sloppy (unless it is a deliberate matching set).
- **C3. The outline's distance from the body:** fitted <= 0.008 H; relaxed 0.01-0.025 H; oversized 0.03-0.06 H,
  hanging straight down from its support point (no waist pinch unless it is belted or tucked).
- **C4. Dropped shoulders** (the current cut of tees, sweatshirts, coats and blazers): the shoulder turn sits
  0.02-0.035 H outside and 0.015-0.03 H below the shoulder point, one soft arc from the neck to the sleeve, no
  shoulder corner.
- **C5. Lengths that read current:** cropped jackets and tops at the waist (0.60-0.62 H); hip length (0.50 H);
  trousers full length, touching the shoe; skirts mini (~0.40 H) or midi (0.20-0.25 H); long coats to 0.20-0.25 H,
  open and unbelted.
- **C6. Trousers by cut** (per leg):
  - wide-leg: straight down from the hip's widest point, the hem 0.13-0.16 H wide, covering the back half of the shoe;
  - baggy: the same plus a stack at the ankle, 2-3 shallow zigzag value bands in the lowest 0.04-0.06 H;
  - barrel: widest at the knee (~0.12 H), narrowing to ~0.08 H at the hem; the outer contour a long convex curve,
    the inner one straighter (S1).
- **C7. Folds are value slivers, never lines:** 0-1 per garment at 130-220 px, 1-3 at >= 300 px. A fold is a tapered
  spindle 0.04-0.10 H long, <= 0.012 H wide, -8 to -12 L* (a multiplied overlay), starting at a tension point (the
  inner elbow, the armpit, the crotch, the back of the knee, a tuck at the waist) or hanging from a support point
  (a drop fold). In a stride, the one fold worth drawing is the pull from the crotch to the forward knee.
- **C8. The fabric's weight shows in the outline:** heavy cloth (denim, leather, wool) keeps straight outlines,
  crisp hems and few big folds; light cloth (silk, jersey, nylon) clings where it touches and swings, so it is the
  candidate for the flowing element; leather gets one crisp specular streak (+20-25 L*, 0.004-0.006 H wide, along
  the form).
- **C9. One finish detail makes a garment look designed, not a costume:** a hem or cuff band (a 0.006-0.012 H
  value step, like ref 04's hem band), a collar shape (a small V or a crew band), the sneaker's sole band, a
  crossbody strap (a diagonal 0.004-0.006 H wide: a straight that breaks the column).
- **C10. The hem in perspective:** below eye level a hem's line bows down in the middle (the front arc of an
  ellipse), by ~0.005-0.01 H for a garment 0.25 H wide; above eye level it bows up.

**The looks: a starting library of 8** (garment types only; each film dresses its people for its own place,
season and palette):

| | look | the shapes |
|---|---|---|
| A | off-duty (W) | a boxy blazer or leather jacket to the hip, dropped shoulders; a light tee showing at the neck; straight or wide jeans breaking over low sneakers or ballet flats; a shoulder bag tucked under the arm; oversize sunglasses |
| B | Los Angeles summer (W) | a fitted baby tee or tank (compact) over baggy or barrel jeans (roomy); sneakers or flats; or a bias-cut midi slip skirt that clings at the hip and swings below |
| C | New York autumn (W) | a long oversized coat, open and unbelted, dropped shoulders, straight hang, its open front showing a darker column; wide black trousers; loafers; a big tote |
| D | athleisure (W) | a cropped zip jacket or hoodie; bike shorts or a pleated skirt; chunky sneakers with white socks; a cap |
| E | refined workwear (M) | a boxy overshirt or chore coat to the hip, a tee, relaxed straight or wide trousers, low-profile sneakers, a tote or crossbody |
| F | street (M) | an oversized hoodie or tee, baggy jeans or cargos stacking at the ankle, chunky sneakers, a cap or over-ear headphones |
| G | jacket (M) | a bomber or leather jacket cropped at the waist with a tight ribbed hem (roomy body, compact hem), straight trousers, loafers or boots |
| H | summer (M) | a boxy short-sleeve camp-collar shirt, relaxed shorts at the knee, sneakers, sunglasses |

The refined her's look (a belted A-line coat, tights, ankle boots, a wool tube scarf, a bun) becomes look C: the
coat open, unbelted and oversized over wide trousers and loafers, the hair in shape 2 or 4, the scarf replaced by a
lighter flowing element (the ponytail of shape 3, or the coat's open front edge in the wind).

**Never (dated):** skinny jeans; the belted A-line coat with tights and ankle boots; blanket and infinity scarves;
pompom beanies; fedoras; the 2014 "hipster" kit (a big beard, a man bun, braces); messenger bags; bowl and helmet
haircuts; and every corporate-Memphis tell (§2).

## 9. Colour and value on figures

**What the sources say.** Valve's characters follow a read hierarchy: a gradient of value from dark feet to a light
chest, with the highest contrast at chest level where the eye should go [3]. On skin, the zone along the terminator
(the edge between light and shade) is more saturated and warmer, because light scatters inside skin and red light
scatters deepest; it is a thin, local accent, not a global warm shift [13].

**Rules.**
- **V1. Dark at the feet, light at the chest and face** [3], done with flat garment values, not gradients
  (DIRECTION rule 5): shoes and trousers L* 20-45; the top or outer layer L* 40-75; a light layer at the neckline
  (a white tee under a dark jacket, a light collar) L* 80-92, which lights the face area the way a reflector does.
  An all-light outfit (cream head to toe) is the exception, set against a darker ground.
- **V2. Three value groups per figure** (L5), and the hair usually the darkest: with the face reduced, the contrast
  of hair against skin (>= 25 L* for most people) is the face's frame. For blond or light hair, set the head
  against a darker field instead.
- **V3. An outfit is a tonal base plus at most one accent:** two related neutrals (cream and chocolate, black and
  denim, white and navy) at 2-3 values, and one accent piece (a bag, the sneakers' detail, the sunglasses' tint, a
  red or cobalt or butter-yellow item). In a crowd, accents on at most 1 in 4 people; the film's hero colour only
  on the "you" (people.md §b.2).
- **V4. Neutrals inside the house palette** (house DNA: no beige, muddy tan, olive or grey [PALETTE.md]): warm cream
  `#F0EAE1` (the "Cloud Dancer" white) and `#E9DBCA`; warm near-black `#3D2C2D` (never pure black); chocolate
  `#664334`; mocha `#8B6B5A`; caramel `#B58058` (instead of tan); denim `#5781A0` and `#92AFC4`; navy `#254161`;
  oxblood `#743137`; rust `#AF5A3E`; sage `#94A68C` (instead of olive). Accents: butter `#F4E2A5`, red `#C7463F`,
  cobalt `#0066BE`. A film shifts all of them toward its sister palette.
- **V5. Skin: a real range, warm, its shade turned toward red.** Six reference tones, each as lit / shade / deep /
  sheen [ours: lit in LCh; the shade at L* x 0.8, the hue 6 degrees toward red, C* x 1.08; the deep plane at
  L* x 0.68, 10 degrees toward red; a sheen at +10 L*]:

  | tone | lit | shade | deep | sheen (on deep tones) |
  |---|---|---|---|---|
  | S1 light | `#EBC8B0` | `#C19984` | `#A67F6D` | |
  | S2 light-medium | `#DDAF92` | `#B8856B` | `#9F6E58` | |
  | S3 medium, golden | `#C79671` | `#A87250` | `#935D41` | |
  | S4 brown | `#B17A59` | `#985B3F` | `#864A34` | `#BE9A79` |
  | S5 deep brown | `#8B5A42` | `#78432F` | `#6B3628` | `#99785F` |
  | S6 very deep | `#644132` | `#573126` | `#4E2820` | `#745C4C` |

  - The shade is proportional (L* x 0.8, not a fixed -20), so deep skin keeps a readable shade instead of going to
    black; deep skin gets a soft sheen on its key-side planes (cheekbone, forehead, shoulder), which reads
    beautiful and lit.
  - At >= 300 px, a terminator band along the shade's edge: C* x 1.25, the hue 10 degrees toward red,
    0.004-0.006 H wide [13].
  - Never turn skin toward blue, violet or grey (the corporate-Memphis skins and the "sickly" look); the rig's cool
    shade hue reaches only the deep accents (under the chin, under the hair), at most 5-8 degrees.
- **V6. Hair colours:** black-brown `#3A2B27`, dark brown `#533A30`, chestnut `#774D3A`, copper `#A25E3B`, honey
  blonde `#CBA577`, platinum `#DFD6C8` (rare); each with its sheen at +15 L* (e.g. `#5B4D48` on black-brown).
- **V7. The rim and local lights** stay as people.md §b.5 (a thin gold rim on the key side; a phone or doorway
  lighting only what faces it).

## 10. Pose and attitude

**What the sources say.** Contrapposto puts the weight on one straight leg: that hip rises, the shoulders tilt the
other way, and the pit of the neck sits over the weight-bearing foot (the balance line) [10]. Symmetry stiffens a
gesture; asymmetry is appealing [10]. Street-style posing: one hand in a pocket or hooking a thumb while the other
stays loose (the asymmetry); pockets, bag straps, jackets and phones give the hands a reason; mid-stride, between
walking and standing, is the strongest moment; looking slightly to the side or across the street reads candid;
leaning with one ankle crossed over the other reads casual and composed [15].

**Rules.**
- **A1. The line of action first:** one C or S through the whole pose; the head, ribcage and pelvis tilt against each
  other; then place the limbs (people.md §a).
- **A2. Contrapposto in numbers** [ours, from the sources' mechanics]: the pelvis tilts 5-8 degrees (the weight leg's
  hip up); the shoulder line 3-5 degrees the other way; the pit of the neck within ±0.01 H of vertical over the
  weight foot; the weight knee straight (0-5 degrees); the free knee bent 10-25 degrees, its foot 0.04-0.08 H
  forward or aside and turned out 15-30 degrees.
- **A3. The head:** tilted 3-8 degrees off the shoulder line's perpendicular and turned 10-30 degrees away from the
  torso's facing; never square on square shoulders (S4).
- **A4. Posture is the first beauty signal at 145 px:** in profile, the ear over the shoulder over the hip over the
  ankle (±0.02 H); the shoulders down and relaxed, the chest open; never hunched, unless the story asks for a slump.
- **A5. One hand anchored, the other loose:**
  - a pocket: the hand hidden, the forearm 20-40 degrees off the body;
  - a phone: the forearm 60-90 degrees up, the hand at 0.68-0.72 H;
  - an iced coffee: the forearm 45-70 degrees up, the cup at 0.62-0.66 H;
  - a bag strap: the hand at the shoulder (0.78 H);
  - hair or sunglasses: the elbow above the shoulder.
  The loose arm bends 8-20 degrees at the elbow, its hand a little behind the thigh's centre line.
- **A6. The cool walk:** a 2-4 degree lean; a contact span of 0.45-0.55 H; the free arm swings only ±10-15 degrees
  (people.md's ±19 is a neutral walk); one arm often anchored; the head level, or the chin 15-25 degrees down on a
  phone; the hips rotate ~8-10 degrees (women) and the shoulders counter-rotate.
- **A7. The gaze goes into the scene, never to the camera:** at the subject, at a phone, across the street, or back
  over the shoulder (the head 60-100 degrees from the torso) at the story's turn.
- **A8. Never:** a presenter's open arms, pointing, waving, jumping, fist pumps or thumbs up (the corporate-Memphis
  repertoire); both arms straight down; feet parallel side by side; a body square to the camera; both hands on the
  hips. An acting beat (a reach, a shrug, a slump, a look up) is one clear pose, then back to calm.

**The pose library: 10 for 20-30 year olds** (each a starting point for a film's own blocking):
1. walking with a phone (the head bowed 15-20 degrees, the free arm ±12 degrees);
2. walking with an iced coffee;
3. standing in contrapposto, one hand in a pocket, the other on the bag's strap;
4. leaning back on a rail or wall, ankles crossed, the head turned to the view;
5. the glance back over the shoulder (the lost profile turning into a profile);
6. looking up at the subject (the chin up 15-25 degrees, the weight back on the heels, hands in pockets);
7. sitting on a step or ledge: knees up, forearms on the knees, a cup or phone in one hand; or one leg crossed;
8. a pair talking: one leaning in 5-8 degrees, the other laughing (the head back 10-15 degrees);
9. fixing the hair or the sunglasses (one elbow up);
10. carrying: a tote on the shoulder (the elbow clamping the strap), a box held low, a bike walked alongside.

## 11. Generic faces

### 11.1 What "generic" should mean (the research)

- **Average is attractive.** Composite faces averaged from many photos were rated more attractive than nearly all the
  faces they were made from, and more so as more faces went in [5] (very attractive faces can be atypical, but the
  average is reliably pleasant). A generic face is therefore not an empty one: it is an averaged, symmetrical,
  smooth face with no odd feature.
- **Simple faces invite the viewer in.** Simplifying a face amplifies it ("amplification through simplification"):
  the simpler the face, the more people it can stand for, and a simple character in a detailed world works as a mask
  the reader wears into the story [7]. Journey's traveller was given no face (and no arms) so that anyone, of any
  gender or culture, could be it [8]. That is exactly our "you".
- **A hidden face moves the eye to hair and clothes** (the faceless fashion editorial and the faceless-portrait trend)
  [7], which is what the owner's influencer target wants.
- **The risks are specific.** A face that simply vanishes is a classic horror (Japan's noppera-bo: the loss of the
  face, the basic unit of recognition) [6]. Eeriness rises when parts of a character sit at different levels of
  realism (the realism-inconsistency account) [6], and abnormal features such as unnaturally big eyes on a realistic
  face read eerie [6]. So: a blank frontal oval on a believable body is creepy, and dot eyes on adult proportions read
  wrong.

### 11.2 The range, judged

| approach | reads as | where it works | verdict |
|---|---|---|---|
| back view (no face) | the person, through hair and clothes; the viewer becomes them | every size | **the default for the "you"** (playbook) |
| lost profile (3/4 back; the "profil perdu" of portrait drawing [6]) | elegant, candid, a little mysterious | heads >= 12 px | **the default turn** |
| profile line (the skin's edge: brow, nose, lips, chin) | refined; ref 04's girl | heads >= 12 px | **yes: the main face** |
| profile plus one lash line | serene (closed) or attentive (open); ref 04's girl has one at ~145 px | heads >= 18 px | **yes, the one mark** |
| sunglasses (oversize, slim 90s, cat-eye) | cool and current: the 2026 street-style accessory [15]; they hide the eyes (mystery) and make a face read symmetrical [6] | heads >= 12 px, daylight | **yes: about 1 in 3 people outdoors in daylight** |
| hair, a brim or a hood hiding the face; a head bowed over a phone | natural, candid | every size | **yes** |
| the form face (light planes only: lit cheek, nose shade, socket shade, lip tone) | editorial, fashion-like | heads >= 40 px, 3/4 | **close shots only (rare); a proposal that needs the owner's yes (§13)** |
| one brow-and-nose stroke | a fashion sketch; in our no-outline style it becomes the form face's "T-shade" | heads >= 40 px | **only as the T-shade, never a line** |
| two dots (and a smile line) | cute, childish: a mascot's face | | **no: dots belong to Pip** |
| faceless: a blank frontal oval | blank, then creepy as it grows (a mannequin, a stock template, the noppera-bo) | heads < 12 px only | **no above 12 px** |
| lips only (the eyeless beauty shot) | a cosmetics ad; at our sizes a red dot | | **no** |
| full features (open eyes with pupils, a mouth) | a character model, which the owner rejected | | **no** |

**"Faceless" works when the head is small or turned** (back, lost profile, profile: the skin's edge is then the
face); **it fails when a large blank face looks at us.** Beautiful rather than blank comes from three things the
winning rows share: the head's angle shows a designed contour (jaw, cheekbone, nose), light models the head, and
hair and accessories give it identity.

### 11.3 The face budget by head size (the skull's height in px)

| skull height | figure ~ | what the face may show |
|---|---|---|
| < 12 px | < 95 px | nothing: the facing is read from where the skin meets the hair |
| 12-18 px | 95-140 px | ONE of: the profile line (three soft bumps: nose, lips, chin, and the neck's notch); the lost-profile cheek sliver; sunglasses (a dark band 2-3 px tall) |
| 18-40 px | 140-310 px | the above, plus at most ONE mark: a lash line (profile or lost profile); or, in 3/4 front, a nose shade on the side away from the key; lips as a tone at most, never a line |
| 40-140 px | close shots | the profile spec in full (§11.4), the lost profile, sunglasses, or (if approved, §13) the form face (§11.7); no pupils, eye whites, mouth line, nostrils, teeth, blush or freckle dots |

Front views of a person are rare. When one is needed above 12 px, it gets sunglasses, hair over an eye, a brim, or
eyes closed or looking down (a lash arc), never a blank oval and never dots.

### 11.4 The profile spec (h = 1 from the crown to the chin; facing screen-left)

The "face front" is the vertical through the brow's most forward point.
- **The brow** at 0.42 h, 0.01-0.015 h forward of the forehead; **the bridge's dip** at 0.46 h, 0.01-0.02 h behind
  the face front.
- **The nose** straight, or very slightly concave for a softer read; its tip at 0.68 h, forward of the face front by
  0.07-0.09 h (women) or 0.09-0.11 h (men), turned up a little; its underside runs back to the lip at about 100
  degrees [ours].
- **The lips:** the upper lip at 0.78-0.80 h, the mouth's line at 0.82 h, the lower lip at 0.86 h, slightly behind
  the upper. Both sit just behind the line from the nose's tip to the chin (the orthodontists' "E-line": in the original
  norm the upper lip 4 mm and the lower 2 mm behind it [6]); a mouth that crosses it reads as caricature.
- **The chin's front** at 0.95 h, 0.02-0.03 h behind the face front; its bottom at 1.0 h.
- **The jaw** a near-straight line from the chin rising 15-20 degrees to the jaw's angle at 0.80-0.85 h height,
  0.55-0.6 h back: a straight against the round skull (S1).
- **The neck** leaves the jaw 0.3-0.35 h behind the chin's front, slanting forward 10-15 degrees; its back from the
  skull's base (0.75 h) slants the same way; its depth 0.42-0.45 h (women), 0.5-0.55 h (men).
- **The lash line** (the one mark): at 0.5 h, starting 0.06 h behind the face front, 0.08-0.10 h long, ~1 px wide
  (0.46 % H, people.md §c), in the hair's deep tone. Closed: an arc bowed downward, its outer end flicking 1 px up and
  back. Open (looking): straighter, with the same flick.
- At 12-30 px heads, 0.01 h is under a pixel: draw only the three bumps (the nose tip ~1.5-2.5 px proud, one soft
  bump for the lips, the chin) and the neck's notch; the full spec is for heads >= 40 px.

### 11.5 The lost profile (the head turned 110-150 degrees away from the camera)

- **A sliver of cheek** shows past the hair's contour from the cheekbone (0.5 h) to the jaw (0.9 h), 0.06-0.10 h wide
  at its widest (0.55 h): the cheekbone's convexity is the beauty point.
- The jaw's line runs straight from its angle (0.85 h) toward a chin tip that may just show at 0.95-1.0 h.
- At heads >= 25 px: the tip of the nose peeks past the cheek line (1-2 px at 0.66-0.70 h) when the turn is under
  ~120 degrees, and an eyelash flick (1 px at 0.5 h) peeks past the cheek, the classic touch that reads beautiful.
- The ear is hidden by hair, or (short hair) one small shape at 0.45-0.65 h.

### 11.6 Sunglasses

- **Front or 3/4:** the lens tops on the brow line (0.40-0.42 h); the bottoms at 0.55-0.60 h (oversize) or 0.52 h
  (slim 90s); each lens 0.30-0.36 h wide; the bridge gap 0.06-0.08 h at 0.46 h; the pair 80-95 % of the face's
  width. Shapes: the oversize square or round, the slim rectangle, the cat-eye (the outer top corners swept up).
- **Value:** the darkest piece on the head (warm near-black, L* 15-22, or a brown or burgundy tint, L* 25-30), with
  ONE reflection streak on the key-side lens (+25-35 L*, ~0.03 h wide, at 30-45 degrees): it reads glossy and alive.
- **Profile:** a dark wedge 0.12-0.16 h wide in front of the eye line, the temple arm a straight ~1 px line to the
  ear (a real line, like a strap).
- **Pushed up on the head:** a dark band 0.08-0.10 h across the hair's crown: current even at night.
- Daylight, outdoors; about 1 in 3 people; never every face in a shot.

### 11.7 The form face (heads >= 40 px; close shots; rare; a proposal, §13)

The face is made of light, not features:
- **Skin planes:** lit on the front planes (forehead, the key-side cheek, the nose's bridge, the chin); the shade
  crescent on the side plane away from the key, from the temple down the cheek to the jaw, notched in at the
  cheekbone; on the far side, the eye socket as a soft oval of the shade value (0.15 x 0.08 h at 0.48 h).
- **The T-shade:** the brow ridge's shade running down the shaded side of the nose to the nostril's wing as one
  tapered shape, 0.22-0.28 h long and <= 0.06 h wide at its base (our no-outline form of the "brow-and-nose
  stroke"); a small cast wedge under the nose (0.06 x 0.02 h).
- **The lips** as one tone: L* -6 to -10 from the lit skin, the hue 5-10 degrees toward red, C* +8-12; the upper lip
  in shade (it faces down), the lower lip lit (it faces up), a small shade crescent under the lower lip.
- **The jaw's cast** on the neck: a band 0.05-0.10 h under the jaw.
- **Brows** (optional): soft tapered shapes in the hair's colour lifted +8 L*, 0.18-0.22 h long at 0.40-0.42 h, the
  inner end thicker; never black arcs.
- **Eyes:** closed lash arcs (0.12-0.14 h wide, bowed downward, 1-2 lash flicks), lids lowered over a phone, or
  sunglasses. Never open eyes with whites or pupils.

### 11.8 Faces in motion

- A feature never pops in or out between frames (at these sizes a 1-px mark that flickers reads as a glitch): a turn
  reveals or hides the face by the head's rotation (back, lost profile, profile), each view held for >= 0.3 s.
- A blink (a lash line's open/closed swap over 2-3 frames) only at heads >= 25 px, and rarely.
- No lip sync and no expressions: emotion is in the pose (A1-A8) and the head's angle.

## 12. Casting a crowd

- **A real mix for New York and Los Angeles:** every crowd spans the skin range (S1-S6), hair types (straight, wavy,
  curly, coily) and builds (P5).
- **At least 4 different silhouettes per 6 people** (hair shape plus garment shape); no two neighbours are clones,
  and a mirrored figure counts as a clone.
- **Accents on at most 1 in 4** (V3); tier B and C people take calmer colour (C* <= 25, people.md §g) and fewer shapes
  (§5).
- **At least 2 groups in any crowd of 8 or more:** a couple, two friends talking, someone walking a dog; people
  interact, they don't stand in rows.
- **Ages:** the target is 20-30; a film may add older or younger people where its story needs them, by the same
  rules (fewer heads and a bigger head for children).

## 13. What this asks of other docs and the engine (proposals, not applied)

1. **The playbook's "round heads"** (the people bullet, from reference 1): for the "you" and near strangers, small
   egg-shaped heads with designed hair (§3, §7); round heads only for tier C people under ~60 px. This clashes with
   the playbook's wording, so it is the owner's call.
2. **`paint_recipes/people.md` §a and `src/lib/figure/model.ts` PROP:** the skull 0.148 -> 0.128 H; the hip joint
   0.505 -> 0.545 H (knee 0.295 H); the hand 0.064 -> 0.098 H, with a thumb lobe from 18 px; the shoe 0.13 ->
   0.155 H; the wardrobe of §d -> a current look (§8, look C for a cold city); the flowing element -> a ponytail,
   long hair or a light garment instead of the wool scarf.
3. **`src/lib/figure/tones.ts`:** a per-material shade rule for skin (L* x 0.8, the hue toward red, C* x 1.08; §9
   V5) instead of the shared turn toward SHADE_HUE 285, which greys and cools skin.
4. **The form face (§11.7) for close shots:** the playbook says people have no faces ("only the mascot has a face")
   and people.md §c allows one closed-eye line at most. The form face adds light planes, a lip tone and optional
   brows for heads >= 40 px. It is the owner's call; until then a close shot uses the profile line, the lost
   profile, sunglasses or hair.
5. **DIRECTION rule 5 stays as it is:** the dark-feet-to-light-chest hierarchy (V1) is done with flat garment
   values, not gradients; people.md's soft body gradient remains its own proposal.
6. **Next step (production, after the owner's pick):** a stills sheet, at 145 and 210 px and at 640 px, of the
   woman and the man in 3 looks and 3 views each, with the face options of §11.2 side by side, judged at phone size.

## 14. Sources

1. **Corporate Memphis and Alegria.**
   [Wikipedia, Corporate Memphis](https://en.wikipedia.org/wiki/Corporate_Memphis);
   [AIGA Eye on Design, what the think pieces about corporate Memphis tell us](https://eyeondesign.aiga.org/what-the-think-pieces-about-corporate-memphis-tell-us-about-the-state-of-illustration/);
   [Webflow, Blue people and long limbs](https://webflow.com/blog/corporate-memphis).
2. **Illustration trends for 2026.**
   [Creative Bloq, Messy, meaningful and made by humans: the biggest illustration trends for 2026](https://www.creativebloq.com/art/illustration/messy-meaningful-and-made-by-humans-the-biggest-illustration-trends-for-2026).
3. **Valve, read hierarchy and silhouettes.** Mitchell, Francke and Eng,
   [Illustrative Rendering in Team Fortress 2 (NPAR 2007)](https://www.cs.princeton.edu/courses/archive/fall07/cos597B/papers/mitchell-team-fortress.pdf);
   [Stylization with a Purpose (GDC 2008)](https://cdn.steamstatic.com/apps/valve/2008/GDC2008_StylizationWithAPurpose_TF2.pdf).
4. **Leg length and attractiveness.** Sorokowski and Pawlowski (2008), Evolution and Human Behavior,
   [Adaptive preferences for leg length](https://stafforini.com/works/sorokowski-2008-adaptive-preferences-leg/);
   Sorokowski et al. (2011), Journal of Cross-Cultural Psychology,
   [Attractiveness of leg length: report from 27 nations](https://avesis.akdeniz.edu.tr/yayin/18f85e05-6208-4bfe-a08e-53ca1e6a8258/attractiveness-of-leg-length-report-from-27-nations).
5. **Average faces.** Langlois and Roggman (1990), Psychological Science,
   [Attractive faces are only average](https://digitalcommons.usu.edu/fchd_facpub/237).
6. **Faces: eeriness, profiles, sunglasses.** Seyama and Nagayama (2007), "The uncanny valley: effect of realism on
   the impression of artificial human faces", Presence 16(4), cited for unnaturally large eyes in
   [this JPA 2018 abstract](https://www.micenavi.jp/jpa2018/img/figure/10901.pdf);
   Chattopadhyay and MacDorman (2016), [Familiar faces rendered strange](https://doi.org/10.1167/16.11.7), Journal of
   Vision (realism inconsistency); [yokai.jp, Noppera-bo](https://yokai.jp/en/yokai/nopperabo);
   [Beethoven-Haus glossary, lost profile](https://www.beethoven.de/en/glossar_archiv/view/5083782692470784);
   [IIUM Journal of Orthodontics, Ricketts' E-line norms](https://journals.iium.edu.my/ktn/index.php/ijohs/article/view/164);
   [Big Think, why sunglasses read attractive (commentary, not a controlled study)](https://bigthink.com/?p=55599).
7. **Simplified and hidden faces.** McCloud, Understanding Comics (1993), amplification through simplification and
   masking: [EBSCO research starter](https://www.ebsco.com/research-starters/literature-and-writing/understanding-comics-invisible-art-scott-mccloud);
   faceless fashion focus: [Trend Hunter, faceless couture campaigns](https://www.trendhunter.com/trends/balenciaga-fall-2013),
   [500px, faceless portraits](https://iso.500px.com/?p=37611).
8. **Journey's faceless traveller (thatgamecompany).**
   [GDC 2013 Game Narrative Review](https://media.gdcvault.com/gdc2013/GameNarrativeReview/Glenn%20Winters_JourneyNarrativeReviewFinal_GJW.pdf);
   [Push Square interview](https://www.pushsquare.com/news/2012/02/interview_thatgamecompany_journey).
9. **Proportions and anatomy.**
   [Proko, Human proportions: idealistic figures](https://proko.com/human-figure-proportions-idealistic-loomis);
   [Proko, What you need to know about gesture](https://www.proko.com/lesson/what-you-need-to-know-about-gesture);
   [Proko, How to draw the calf](https://www.proko.com/course-lesson/how-to-draw-the-calf-anatomy-for-artists);
   fashion figures: [Croqui Studio, fashion figure proportions](https://croqui-studio.pages.dev/blog/fashion-figure-proportions.html);
   the Drillis-Contini segment model (1966; the fractions as reproduced in Winter, Biomechanics and Motor Control of
   Human Movement): [ISBS 2006, upper-body segment lengths as a proportion of height](https://ojs.ub.uni-konstanz.de/cpa/article/view/292);
   hand length and stature: [International Journal of Research in Medical Sciences](https://www.msjonline.org/index.php/ijrms/article/view/827).
10. **Appeal: straights and curves, twinning, contrapposto, hands.**
    [Animated Spirit, Straights and curves](https://www.animatedspirit.com/straights-curves);
    [Creative Bloq, How to simplify figures for animation](https://www.creativebloq.com/how-to/simplfy-figures-for-animation);
    [ACM SIGGRAPH HyperGraph, Appeal](https://education.siggraph.org/static/HyperGraph/animation/character_animation/principles/appeal.htm);
    [Animator Island, Defining the art: twinning](https://www.animatorisland.com/defining-the-art-twinning/);
    [Life Drawing Academy, Contrapposto](https://lifedrawing.academy/drawing-lessons/contrapposto);
    [Proko, cartoon hand demos](https://proko.com/course-lesson/cartoon-hand-demos).
11. **Silhouettes.**
    [Creative Bloq, How to design instantly recognisable characters using strong silhouettes](https://www.creativebloq.com/art/character-design/how-to-design-instantly-recognisable-characters-using-strong-silhouettes).
12. **Folds and drape.** Bridgman's seven folds:
    [Swinton's Art, 7 kinds of fabric folds](https://swintonsart.com/post/7-kinds-of-fabric-folds-that-are-good-for-painting);
    Hogarth, Dynamic Wrinkles and Drapery (Watson-Guptill).
13. **Hair and skin rendering.**
    [Clip Studio Tips, Drawing stylised hair: shapes, tufts and strands](https://tips.clip-studio.com/zh-tw/articles/6072);
    [Proko community, why there's higher saturation near the terminator](https://proko.com/community/topics/why-there-s-higher-saturation-near-the-terminator);
    [Clip Studio Tips, skin shading](https://tips.clip-studio.com/en-us/articles/16821).
14. **Small painted figures.**
    [Urban Sketchers Chicago, People who need watercolor people](https://urbansketchers-chicago.blogspot.com/2015/05/people-who-need-watercolor-people.html);
    [WetCanvas, putting people in your paintings](https://www.wetcanvas.com/forums/topic/april-mini-class-iv-tutorial-putting-people-in-your-paintings).
15. **Street style, poses and colour, 2025-2026 (snapshots).**
    [Who What Wear, NYFW street style autumn-winter 2026](https://www.whowhatwear.com/fashion/street-style/new-york-fashion-week-street-style-fall-winter-2026);
    [Who What Wear, the California summer uniform 2025](https://www.whowhatwear.com/fashion/outfit-ideas/california-summer-uniform-2025);
    [Who What Wear, wide-leg trousers and ballet flats, 2026](https://www.whowhatwear.com/fashion/outfit-ideas/wide-leg-trousers-ballet-flats-outfits-2026);
    [Wardrobe Oxygen, barrel jeans 2026](https://www.wardrobeoxygen.com/how-to-style-barrel-jeans/);
    [Who What Wear, hair trends 2026](https://www.whowhatwear.com/beauty/hair/hair-trends-2026);
    [FashionUnited, the SS26 menswear trends](https://fashionunited.com/news/fashion/heavy-loads-and-wisecracks-the-ss26-trends-of-the-mens-fashion-weeks/2025071167102);
    [Who What Wear, how to pose like a model off duty](https://www.whowhatwear.com/how-to-pose-for-photos-model-off-duty);
    [Photo Poses, street photo poses](https://photoposes.pages.dev/street-photo-poses/);
    [Texintel, Pantone 11-4201 Cloud Dancer, colour of the year 2026](https://www.texintel.com/press-room/pantone-12-25-p-pantone-unveils-pantone-11-4201-cloud-dancer-as-color-of-the-year-2026-offering-a-sanctuary-of-calm-in-a-chaotic-world).

All of these teach principles. We never copy or trace any artist's or studio's characters, and we name no living
artist as a style target: we draw our own people in our own shapes and palette.
