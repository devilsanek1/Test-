# People direction: MODERN GRAPHIC

**Status: a direction proposal (2026-10-30), proven as stills in `dir_graphic.png` (next to this file).** A look doc: it
ranks below the playbook, `DIRECTION.md` and `CRAFT.md`, changes no other doc, and is the owner's to pick or drop. It
applies `diagnose.md`, `design_research.md` and `fashion.md` (all next to this file) in one style: bold contemporary
simplification, confident geometric shapes, strong silhouettes, styling read from clothes and hair alone, and a face
that is generic by design (one consistent mark). Never corporate Memphis.

**The sheet** (`dir_graphic.png`, 2400 x 3290) shows:
- **A:** HER (27, the film's lead; the film's teal is her accent) in two outfits, each from the front 3/4, in profile
  walking and from behind turning, at 640 px.
- **B:** two supporting people (a man and a woman, other looks, skins and builds) in 3/4 at 640 px, and the face
  treatment: six heads from the 640 px figures, shown 2.5x.
- **C:** the whole cast at film size, 1:1 (200 px and 140 px tall) on a mid tone, and the filled-black silhouette test
  at 140 and 200 px.
- **D:** her in the painted still v6's doorway, at the old her's spot and size (154 px), before and after at 1:1 and 2x;
  the palette as worn.

**The code** is `src/look/people_dirs/graphic/` (a new folder; no shared file was touched). Render the sheet from
`video/` with
`node scripts/render-frames.mjs GrSheet <dir> 0 --entry=src/entry-look-people-graphic.tsx --concurrency=1`
(about 1 s a frame plus a short bundle). `GrTest` draws any figures in a row or their heads magnified (props `h`,
`items`, `heads`). The doorway crop is rebuilt by `python3 docs/look/people_design/dir_graphic_crop.py`.

Units: H = the figure's height, crown to sole (1000 local units). u = the skull's height, crown to chin (the head's
units). px = pixels in our 1080 x 1920 frame.

## 0. The ask (owner, verbatim)

- "One thing we I don't like about people on our design is there is a lot style involved like we need to draw people
  that are beautiful and pleasant and the clothing is appealing. Our. Current design is very old style and frankly
  ugly so it's tricky I think it will require its own deep research" (2026-10-30)
- "Yes then people I think we should target 20-30 yo today with styles that are just cool and appealing to look at so
  think instagram infkuebcers, New York, Los Angeles, including hair clothing and perhaps less of faces like faces we
  need to find a way to draw in a more generic way" (2026-10-30)
- "Another bit is humans we paint - they should be better / ... On the video the person is not substantially
  different than yours but certainly more refined and clean and more fluid" (2026-10-29)

## 1. The direction in one page

1. **Adult, elegant proportions:** 7.8 heads (the skull 0.128 H; with its hair the head reads 0.137-0.139 H), a long
   visible neck, legs about 5 % long, real hands (0.098 H) and feet (0.148 H). Never the 4-5 heads of our old pegs,
   never corporate Memphis's tiny head on bendy limbs.
2. **Every form is ONE rounded polygon:** straight edges joined by deliberate radii. Corners stay crisp only where the
   material is crisp: a hem, a cuff, a sole, a lapel's point, a brim. Curves go where a form is round: the skull, a
   shoulder, a calf, the hair.
3. **Two flat tones per form, a crisp terminator, one key from the upper left.** The light is computed on a small 3D
   rig, so every view of the same person is lit the same. A third, deep tone is used only for cast shadows and depth
   behind the head. There are no outlines, gradients or texture on people.
4. **Styled from clothes and hair alone.** Current garments from `fashion.md`: N1 the long open coat, L2 the baby tee
   with jeans, a cap and a ponytail, N6 the suede bomber, N3 the cropped leather jacket over a statement skirt. Each
   look has one roomy piece and one detail that sells it. Hair is one designed mass with one sheen band.
5. **The face is generic by design: ONE mark.** It is the shade of the brow ridge running into the shaded side of the
   nose (a "7" of light), on a lit face whose side plane turns into shade. There are never eyes, brows, a mouth or
   blush. Sunglasses and a cap's brim shadow are the variants; from behind there is no mark.
6. **A tonal base plus one accent per person.** The film's teal appears only on her: the bag in the evening, the cap
   at the weekend. Skin shade turns toward red, never grey. A thin rim of light falls on her key-side edges only, as
   the subject.

## 2. Proportions (in H; `body.ts`)

| | woman (her) | the man | rule |
|---|---|---|---|
| skull, crown to chin | 0.128 (7.8 heads) | 0.127 (7.9) | with the hair, the head never above 0.14 H |
| chin / shoulder line | 0.872 / 0.818 | 0.873 / 0.815 | the neck shows 0.04-0.05 H |
| neck width | 0.046 | 0.058 | the neck is ONE flat shade plane |
| shoulders / waist / hips (full width) | 0.240 / 0.158 / 0.210 | 0.272 / 0.184 / 0.196 | the supporting woman 0.232 / 0.214 (a different build) |
| waist / hip joint / crotch | 0.625 / 0.545 / 0.485 | 0.610 / 0.540 / 0.480 | the extra length goes into the legs only |
| knee / ankle | 0.295 / 0.040 | 0.290 / 0.040 | |
| upper arm / forearm / hand | 0.183 / 0.148 / 0.098 | 0.186 / 0.150 / 0.104 | never a 0.064 H stub |
| foot (shoe x1.04-1.07) | 0.148 | 0.156 | slim and low (§6) |
| limb radii: thigh / knee / calf / ankle | 0.050 / 0.030 / 0.033 / 0.017 | 0.054 / 0.034 / 0.037 / 0.019 | tapered (thigh : ankle ~ 3 : 1) |

**Poses** (`cast.ts`), from `design_research.md` §10:
- **Standing contrapposto:** the pelvis rolls 8 degrees (the weight hip up) and shifts 0.012 H over the weight foot;
  the shoulders roll 5 degrees the other way. The free knee eases forward 0.036 H, its foot 0.06 H forward, turned out
  26 degrees.
- **The walk** (contact): a stride of 0.31 H, the back heel up 32 degrees, the hips twisted 8 degrees and the chest 6
  the other way. The free arm swings about 12 degrees; the other arm is anchored.
- **One hand always anchored:** in a pocket (the elbow out 15-25 degrees), round the iced coffee, or clamping the bag.
  Never both arms straight down; never a presenter's or Memphis gesture.
- **Faces turn toward the key** (screen-left on this sheet). The face plane stays lit and the mark falls on the
  nose's far side. A mirrored rig mirrors the faces with it.

## 3. Shape language (`geo.ts` `rpath`, `rig.ts`)

- **The rounded polygon:** each vertex carries a radius. It is cut back along both edges, at most half of each edge,
  and joined by a cubic. The radii in H units:
  - crisp, 1-3: a hem, a cuff, a sole, a lapel's point, a brim, a bob's cut;
  - joints, 10-16: an elbow, a knee, a trouser's waist;
  - big arcs, 26-34: a shoulder, a dropped-shoulder seam;
  - the hair, 0.06-0.22 u.
- **Straight against curve on every part:** a coat's straight side against its arced shoulder, a straight jaw
  against the round skull, a straight trouser leg against the hip's curve.
- **The rig:** torsos and garments are LOFTS of horizontal rings (ellipses with a twist and a roll); limbs are TUBES
  along joint chains. A view is a yaw about the vertical. The projection is orthographic, with an eye at 0.93 H and a
  distance of 6 H. That makes hems bow down about 0.012 H and soles show from about 9 degrees above (C10), with no
  hand-placed perspective.
- **Sleeves start low enough that their round head meets the shoulder line.** A puff above the shoulder read as
  "puffy shoulders" at every size; it was the one silhouette fix of the phone check.
- **Shape counts (measured on the sheet's figures):** 14-28 outline parts and 16-32 inner tone regions per figure,
  18-26 colours. That is above `design_research.md`'s 8-12-shape budget for 130-220 px figures. Small parts (the
  mark, the cap's button, the zip, the hair's clump lines, the rim) fall under 1 px at film size and simply vanish;
  production needs a level-of-detail switch (§9).

## 4. Light and colour (`color.ts`, `palette.ts`)

- **The key:** toward the light = (-0.78, 0.42, 0.46) in camera space (left, up, toward the camera). Every terminator
  is computed from it, per ring and per tube: a vertical cylinder seen from the front keeps 25 % of its width in shade.
- **The planes:**
  - **lit:** the material's colour.
  - **shade:** garments at L* x 0.80 (0.66-0.86 by material), the hue turned at most 10 degrees toward a warm plum
    (h 350), C* x 1.06. Skin at L* x 0.80, the hue turned 6 degrees toward red, C* x 1.08. Very dark materials keep a
    step of at least 7 L*.
  - **deep:** L* x 0.63, used only for the hair behind the neck, a brim's underside and the parting.
  - **sheen:** +15-16 L* on hair, +22 L* on leather, +6 L* on satin.
  - **rim (her only, the subject):** +12 L*, 12 degrees toward gold, a 5.5 x 4 unit band on the upper-left edges of
    her coat, hair, cap, jeans and bag. Never on skin.
- **The value pattern (V1-V2):** shoes dark, the light at the chest (her cream knit at L* 93 inside a coat at L* 20;
  the tee's white), the hair the darkest mass on the head. Hair against skin is at least 25 L* (her copper L* 39 on
  skin L* 75).
- **Skins** (lit / shade, L*):
  - S2, light-medium (her): `#DDAF92` 75 / `#B8856C` 60.
  - S3, medium golden (the man): `#C79671` 66 / `#A87150` 53.
  - S5, deep brown (the woman): `#8E5C43` 44 / `#7B4430` 35.
- **Hair:**
  - copper (her): `#8A4A31`, L* 39, sheen `#B4744F`;
  - black-brown (him): `#2F2627`, L* 16, sheen `#544949`;
  - black (her braids): `#2B2324`, with honey ends `#A8784F`.
- **Wardrobe:**
  - warm near-black `#3A2E33` (L* 20);
  - Cloud Dancer `#F0EAE1` (93);
  - cream `#E6D7C3` (87);
  - denim `#557B9A` (50);
  - cognac suede `#9E5A3C` (46);
  - indigo `#2F4566` (29);
  - burgundy leather `#743137` (30);
  - butter satin `#F2DD9C` (88);
  - **the film's teal `#0B8577` (50): only on her.**
- **One accent per person:** her teal, his cream headphones on a cognac bomber, the woman's butter skirt. There is no
  beige, muddy tan, olive or grey. Shadows are colour.

## 5. The face (`head.ts`, `headwear.ts`)

**The head** (u = the skull's height, origin at its centre, the crown at -0.5):
- an egg: a round cranium against a straight jaw (S1);
- 0.76 u wide and 0.94 u deep; the men's jaw is 0.04 u wider.

**3/4 (yaw -25 to -55):**
- The face line sits at x = -0.47 sin|yaw|.
- The far contour runs brow, eye socket, cheekbone, then the nose's tip breaking the contour by about 0.03 u, then
  the lips just proud of the cheek, then the chin.
- The jaw is a straight from the angle (0.27, 0.31) to the chin; the men's jaw is 0.04 u wider and the chin 0.03 u
  broader.

**Profile:** the brow at -0.08, the nose's tip at 0.18 (0.08 u forward; the men's 0.10), the lips at 0.29 / 0.36, the
chin's front at 0.45 (`design_research.md` §11.4).

**THE MARK: one shape, in the skin's shade.**
- **The brow arm:** from the face line 0.17 u along (0.20 for the men), at y -0.07 to -0.03, 0.025-0.04 u thick.
  It is the shade under the brow ridge, never a brow and never an eye.
- **The nose wedge:** joins the brow arm and runs down the nose's shaded side to the wing at y ~0.2; it is 0.03-0.05 u
  wide.
- **The foot:** under the tip, ending in a point 0.008 u inside it.

**Around the mark:**
- **The side plane:** a designed terminator from the near temple, past the cheekbone's outer edge, to the jaw. The
  face's front plane stays lit; the side goes to shade.
- **The neck:** one flat shade plane. The lit face against it is the jaw's line, so the jaw needs no line or band.

**By view and accessory:**
- **In profile:** the face is the silhouette; the mark is the same shade under the nose's wing.
- **Lost profile and back:** no mark; the cheek's lit sliver shows past the hair.
- **Sunglasses:** oversize lenses at -0.11 to 0.11 u, the far lens past the contour, ONE reflection streak. The nose
  wedge shows below the bridge.
- **A cap:** its brim's shadow is a crisp band across the brow and the eyes, in the skin's shade. The nose wedge shows
  below it.

**Sizes.** The mark is about 3 x 25 px on a 640 px figure, about 1 x 8 px at 200 px, and under a pixel at 140 px. That
is the face budget of `design_research.md` §11.3: at film size it is only a hint of which way the face turns.

## 6. Hair, clothes and shoes (`hair.ts`, `wear.ts`, `feet.ts`, `props.ts`)

**Hair:** one main mass with a designed cut, 0.06-0.09 u of volume beyond the skull, and ONE sheen crescent
(0.07 u thick, +16 L*) across the crown on the key side.
- **Her long layers:** a near curtain framing the face, with the long lock over the shoulder and a bouncy curled end
  (L = 1.66 u below the head's centre). A far curtain sweeps to the cheekbone. Behind the neck, a mass in the deep
  tone. From behind: four unequal lobes at the ends and two clump spindles.
- **Her weekend:** the sides pulled back with the ear shown, one face-framing wisp, and a ponytail 1.2-1.3 u long
  through the cap's back opening, ending in a curl. It is the flowing element.
- **His soft curtains:** a centre part as a crisp notch of shade, the near curtain to the brow and the far one to the
  cheekbone, the nape longer.
- **The braids:** knotless and half-up with a top knot, 3-4 grooves per mass in the shade or deep tone, curly honey
  ends; one group falls over the near shoulder.

**Clothes:** 2-4 masses per look, ONE roomy.
- **The long open coat:**
  - shoulders dropped to 0.14 H a side; the hem at 0.18 H, 0.30 H wide;
  - open at 90 +- 22 degrees round the front, widening at the lapels to +-44 degrees;
  - lapels are crisp triangles from the collar to the break at 0.69 H;
  - the opening is a cut, so the cream column inside shows through.
- **Wide trousers:** a leg radius of 0.064-0.066 H, hanging from the hip's widest point. The hem lands on the shoe
  and bows with the perspective. The two legs make the hips (the seat fills only the crotch, with no shade of its own).
- **Jeans:** 0.052 / 0.045 / 0.047 H (thigh, knee, hem): relaxed straight.
- **The baby tee:** fitted (+0.002 H of ease), ending at the jeans' waistband, short sleeves to 42 % of the upper arm.
- **The bomber:** the body roomy, a rib band 0.038 H tall at 0.57-0.61 H, rib cuffs, the zip open into a V to
  0.74 H showing the tee.
- **The cropped leather jacket:** a funnel collar to the jaw, hemmed at the waist (0.61 H), a zip as a true line, and
  ONE crisp sheen streak inside the key-side edge of the body and the sleeves.
- **The bias satin midi skirt:** clings at the hip, then flares to 0.28 H at a 0.205 H hem, with one sheen crescent
  down the bias.

**Shoes:** a 3D point cloud (sections from the heel to the toe) projected and wrapped in its hull, a light sole band,
and the visible side in shade when it faces away from the key.
- pointed flats: a low flat, about 0.03-0.04 H tall over the heel, tapering to a point;
- slim sneakers: cream, with a stripe and a sole band of about 0.013 H;
- kitten slingbacks: the foot pitched 12 degrees about the ball, a heel of about 0.022 H.

**Props:**
- **Hands:** a mitten with a thumb lobe and a notch 45 % down, the wrist breaking 12 degrees.
- **The iced coffee:** gripped as ONE band of fingers across the cup, with the thumb above.
- **Her teal shoulder bag:** a 3D crescent 0.128 x 0.086 H, tucked under the arm so it peeks behind it.

## 7. What the research asked, and where the sheet answers it

| `diagnose.md` cause | what this direction does |
|---|---|
| 1 BODY (3.7-4.9 heads, a ball head on a tombstone) | 7.8 heads, an egg head on a long neck, a tapered body with a waist, tapered limbs, real hands and feet (§2) |
| 2 CLOTHES (a sack coat, 2010s items) | N1, L2, N6, N3 from `fashion.md`, each with one roomy piece and its one detail; no belted A-line coat, tights, ankle boots or blanket scarf (§6) |
| 3 HAIR (balls and helmets) | designed masses with volume, a cut, a parting notch, one sheen crescent, lobes, a ponytail, curtains, braids (§6) |
| 4 COLOUR (dressed in the set's paint) | a tonal base plus one accent, warm neutrals, skin turned toward red, the teal only on her (§4) |
| 5 POSE (stiff, symmetric) | contrapposto, one hand always anchored, a calm walk, the head turned and tilted (§2) |
| 6 RENDER (clip-art outlines, lightless cut paper, a sticker) | no outlines; two lit tones with computed terminators; a rim only on her (§4). Still crisp vector: see §8 |
| 7 FACE (dot eyes, a skin-crescent mask) | ONE consistent mark, light rather than features; sunglasses and the brim as variants (§5) |
| 8 DETAIL (spent on job icons) | spent on the hair's outline, the hem lengths, the trouser width, the shoes and the one accessory |
| 9 TELLS | no headless walkers or stick legs; 8 different silhouettes in the black test |

## 8. Honest note: strengths and weak spots

**Strengths.**
- **It reads at film size.** In the black test at 140 px, the long coat, the walking coat, the cap with the coffee,
  the man and the skirt are each identifiable. At 200 px the looks, hem lengths, trouser widths, hair shapes and
  accents (the teal cap, the teal bag) all survive.
- **The cast is current and adult:** nothing on the sheet uses `fashion.md`'s dated list, and the proportions fix the
  "cute infographic" read at its source.
- **One rig, every view.** The same person is consistent and identically lit from the front, the side and behind,
  which matters for a film that turns its "you". Any new pose or view is a few joint coordinates, not a new drawing.
- **The face never goes creepy at our sizes.** It is never blank, and no eyes stare at the camera. The mark is the
  same in every person, and sunglasses and the brim give variety.
- **It fits the v6 world:** in the doorway at 154 px she reads as one clear value shape against the lit interior,
  cleaner and more adult than the old her.
- **Cheap to produce:** a figure renders in milliseconds, and the whole sheet in under a second after a short bundle.

**Weak spots.**
- **Some stiffness.** Tubes and lofts give straight limbs with little S-rhythm (the calves and the arms' bulges are
  weaker than `design_research.md` S1-S2 asks). The standing poses are correct but a little wooden next to a hand
  drawing, and the walking legs are straight tubes.
- **The face at 640 px is "editorial mannequin":** handsome, but without the warmth a hand-drawn face has. At some
  angles the brow arm can read as a squint. The mark and the side plane are untested in motion: a turning head would
  need its in-between yaws checked frame by frame.
- **Too many small shapes for film size:** 14-28 parts per figure, against a budget of 8-12 at 130-220 px. Under
  ~140 px the mark, the rim, the zip and the clump lines are sub-pixel. A production version needs a level-of-detail
  switch: drop them below a figure height, and merge hands and the mark.
- **The hair is designed per view in head units, not derived from the rig.** A turn between views needs in-between
  shapes, which costs animation time; the clothes and the body come for free.
- **Crisp vector in a painted world.** The house keeps people crisp, but next to v6's painted clouds and trees a flat
  two-tone figure can still read as a sticker. The rim helps and the soft painterly direction answers this better.
- **One key direction only.** The sheet lights everything from the upper left. A figure facing away from the key
  needs the rule "faces stay lit" (§2), and is untested.
- **Dark looks need a light ground.** The black coat is ideal against the lit doorway but would merge with a dusk
  street: a film should pick each look's value against its set (V2).
- **Hands are simple mittens.** They are right at film size and plain at 640 px.

## 9. What this would ask of other docs (proposals, not applied; the owner's call)

- **The playbook's people bullet** ("round heads"): small egg heads at 7.8 heads for the "you" and near strangers
  (`design_research.md` §13.1).
- **`paint_recipes/people.md` §c:** it allows one closed-eye line at most; this direction's mark is the brow-ridge
  shade into the nose plus a shaded side plane. The owner's yes is needed before a film uses it.
- **`paint_recipes/people.md` §d:** the wardrobe becomes `fashion.md`'s looks: here N1 (the long open coat) and L2 (the
  baby tee, cap and ponytail) for her.
- **A level-of-detail rule for people** (none exists yet): which parts drop out at which figure height.

## 10. Files

- **`src/look/people_dirs/graphic/`:**
  - `geo.ts`: maths and the rounded polygon;
  - `color.ts`: Lab/LCh and the tones;
  - `rig.ts`: the projection, rings, lofts, tubes and terminators;
  - `body.ts`: the builds and the skeleton;
  - `head.ts`: the head, the neck and THE MARK;
  - `hair.ts`: long layers, the ponytail, curtains and braids;
  - `headwear.ts`: the cap, the ear, sunglasses and headphones;
  - `wear.ts`: the coat, the tops, the trousers, sleeves, the bomber, the leather jacket and the skirt;
  - `feet.ts`: the shoes and the contact shadow;
  - `props.ts`: hands, the bag, the iced coffee and the grip;
  - `palette.ts`: the wardrobe palette;
  - `cast.ts`: poses and outfits;
  - `Figure.tsx`: the renderer;
  - `Sheet.tsx` and `Test.tsx`: the compositions;
  - `doorway.ts`: generated.
- **`src/entry-look-people-graphic.tsx`:** the compositions `GrSheet` and `GrTest`.
- **`docs/look/people_design/dir_graphic_crop.py`:** the v6 doorway crop with the old her painted out.
