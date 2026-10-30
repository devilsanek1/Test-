# Why our people read old and ugly: the diagnosis

**Status: the diagnosis (2026-10-30).** A look doc: it ranks below the playbook, `DIRECTION.md` and `CRAFT.md` and
changes no rule by itself. It answers one question: what, concretely, makes the people we have drawn read dated or
unappealing, ranked by how much each cause hurts. The fixes live in the sibling files: `design_research.md` (the
craft: proportions, shapes, hair, clothing, colour, pose, faces) and `fashion.md` (the wardrobe: what 20-30-year-olds
in New York and Los Angeles wear).

**The evidence is `diagnose_sheet.png`** (next to this file; rebuilt by `diagnose_sheet.py`). It shows every person
we have drawn, side by side, each full figure scaled to the same height (300 px from head to feet). The crop IDs used
below (A1-G5) are on it, and the cause numbers (1-9, ranked) are its coloured tags. Its sections:
- **A:** v1's kit Person, in the final master.
- **B:** v2's v2r cast, in the G7 master and on the `KitCast` sheet rendered 1:1.
- **C:** the faces and hands: v2's first pass, the v3 G5b draft and v3's final POV hands.
- **D:** the refined her (`src/lib/figure`), in the painted still v6 and on the people sheet.
- **E:** the owner's references at the same height, plus reference 1, the grammar our cast was built from.
- **F:** everyone at the size the phone shows them.
- **G:** the filled-black silhouette test.

## 0. The ask (owner, verbatim)

- "One thing we I don't like about people on our design is there is a lot style involved like we need to draw people
  that are beautiful and pleasant and the clothing is appealing. Our. Current design is very old style and frankly
  ugly so it's tricky I think it will require its own deep research" (2026-10-30)
- "Yes then people I think we should target 20-30 yo today with styles that are just cool and appealing to look at so
  think instagram infkuebcers, New York, Los Angeles, including hair clothing and perhaps less of faces like faces we
  need to find a way to draw in a more generic way" (2026-10-30)
- "Another bit is humans we paint - they should be better / ... On the video the person is not substantially
  different than yours but certainly more refined and clean and more fluid" (2026-10-29)

## 1. The answer in short

Our people read old because they are not drawn as adults. They are the pictogram person of 2012-2018 flat explainer
illustration:
- a round head nearly as wide as the shoulders;
- a tombstone body on two bar legs;
- 3.7-4.9 heads tall, which is a baby's or a toddler's ratio.

On top of that body:
- they wear costume shorthand instead of clothes;
- their hair is a ball or a helmet;
- they are painted in the colours of the walls behind them;
- they stand stiff and symmetric;
- in v1 and v3 they are outlined like clip art.

The refined her (still v6, the people sheet) fixed most of the body. She still reads old because of what she wears and
how her hair is shaped: a belted A-line wool coat, opaque tights, ankle boots, a tube scarf and a low bun. That is the
2014-2016 autumn uniform, worn as one saturated teal column. The owner said "very old style" on 2026-10-30 while
landing the painted still v6, which has her in it.

**The causes, ranked** (the number is the tag on the sheet):
1. **BODY:** a toddler's proportions under adult clothes. One peg body for everyone.
2. **CLOTHES:** one generic sack coat, plus props that say a job. What does read as a garment is 2010s or older. No
   fabric, no drape, no shoes.
3. **HAIR:** a ball or a helmet in one flat colour. Silver, balding and granny-bun heads. No current cut.
4. **COLOUR:** dressed in the set's paint:
   - dusty mid-tone patchworks;
   - skin like plaster or brick;
   - no neutral base;
   - no single value shape.
5. **POSE:** upright, symmetric and armless or tube-armed. Clones. No attitude.
6. **RENDER:** clip-art outlines and white rim strips (v1, v3), lightless cut-paper (v2r), a vector sticker in a
   painted world (the refined her).
7. **FACE:** the dot-eye emoji face where faces were drawn; a skin-crescent mask in profile.
8. **DETAIL:** spent on job icons, never on what carries style at 130-220 px.
9. **TELLS:** a headless walker, stick legs, nine clones, a frame full of balloon heads.

## 2. How it was measured

- **Sources.** Every film's people come from the final masters at full 1080 x 1920:
  - v1: `deliverables/v1/php2shell_final.mp4`;
  - v2: `deliverables/v2/v2r_G7_master_v1.mp4`;
  - v3: `deliverables/v3/v3_final.mp4`, plus the G5b draft `v3_g5b.mp4` for v3's crowds and "you", which the final
    cut down to POV hands and tiny workers.

  The frames are taken at the baseline times of `docs/studies/2026-10-28_city_posters/baseline/`, plus the moments with
  people. The baseline jpgs are half size, so they were not cropped directly. The code's figures were rendered 1:1:
  - `KitCast` (src/entry-v2r-cast.tsx), for `src/v2r/kit/cast` (People.tsx, parts.tsx, body.ts);
  - `KitSheet2` (src/entry-v2-kit.tsx), for `src/v2/film/kit/Her.tsx`.

  `src/lib/figure` is shown through the painted still v6 and `paint_recipes/people_sheet.png`.
  `src/scenes/shared/props/Figures.tsx`, the v1 presets on the kit Person, is shown through v1's frames.
- **Heads tall** = (feet - head top) / (head bottom - head top):
  - the head bottom is the chin, or, from behind, where the head meets the neck or collar;
  - a bun or pom-pom on top is excluded;
  - a hat that sits on the skull is included (A7).

  The red lines on the sheet mark the three points.
- **Head width / shoulder width:** measured on the filled-black silhouettes of the flat-background renders (row
  widths). The long-haired figures are excluded, because their hair hides the neck. For the code's own figures the
  numbers come from the code's constants.
- **Colours** are CIE L\*C\*h (D65) of the code's tokens. Lightness around a figure is the median L\* of a ring 3-10 px
  outside its silhouette.
- **Sizes** are in px of our 1080 x 1920 frame. H is a figure's height from the crown to the sole.

## 3. The causes in detail, ranked

### 1. BODY: a toddler's proportions under adult clothes (hurts most)

What we draw:
- **Heads tall: 3.7-4.9. The references: 6.7-7.4.**
  - v1: A1 4.4, A3 4.7, A9 4.0; A7 2.8 with its beanie.
  - v2: B1 4.5, B2 4.1, B3 4.2, B7 4.5; the short-haired public in `KitCast` 3.7-4.4.
  - v2's first-pass her: C1 4.6, with her hair mass; her skull alone is 5.6.
  - The people sheet's "current her": D6 4.8.
  - The references: E1 6.7 (ref 04's girl, the head wrap included), E2 7.3 (ref 03), E3 7.4 (ref 01).

  In code:
  - `src/lib/kit/Person.tsx`: head radius 0.23-0.26 x the torso width, about 4.25 heads;
  - `src/v2r/kit/cast/body.ts`: head radius 0.112 H, 4.46 heads.

  4-5 heads is the ratio of a baby or a toddler; an adult reads at 7-8. This one number is why our people read as a
  "cute infographic" (people.md §1). It is also why styling cannot save them: adult clothes on a toddler's body read as
  a costume (C2's lanyard, A9's apron).
- **A compass-circle head, almost as wide as the shoulders.**
  - From behind, the head is 0.76-0.91 of the shoulders' width: the public in G1, the 300 px figure 0.81, the current
    her 0.87.
  - Ref 01's man: 0.39.
  - The head is drawn with `circlePath` / `circle()`, so it has no skull shape: no jaw, no nape, no bulge at the back
    of the head.
- **Ears stuck out** on every bare-headed back view:
  - v1 by design: "ears stick out on both sides (the strongest 'seen from behind' cue)", Person.tsx;
  - v2r: `ear()` in body.ts.

  Two skin half-discs on a circle read as a teddy or a toy (A10, B5, B7, B8).
- **No neck, a box for a torso.**
  - v1's neck is a short block; v2r's head sits on the collar.
  - The torso is a tombstone (`tomb()` in parts.tsx): a rectangle with rounded top corners, flaring to the hem by 3 %
    (jacket), 8 % (mid) or 15 % (long). There is no shoulder slope, chest, waist or hip; it is one width from the
    shoulder to the hem.
  - v1's torso is ~0.47 H wide (86-100 px on its ~199 px figure). Adult shoulders are ~0.25 H, so it is a fridge.
  - v2r's torso is 0.33 H wide.
- **Short legs, bar limbs, pucks for feet.**
  - Leg below the coat, v1: 0.31 H (A1; the legs are 0.62 x the torso's height), A7 0.20 H, A9 0.29 H.
  - Leg below the coat, v2: B1 0.24, B2 0.13, B3 0.27 H.
  - v2r's three coat lengths stop 0.31, 0.24 or 0.16 H above the feet.
  - An adult's crotch is at ~0.47 H, so our legs are half to two-thirds of an adult's.
  - Legs are two parallel capsules, 0.094 H wide at the top and 0.084 H at the ankle (v2r): no thigh, knee, calf or
    ankle.
  - Feet are white-soled pucks (v1) or ellipses 0.10 x 0.048 H (v2r).
- **Arms and hands.**
  - Arms are hidden inside the coat on v2r back views ("a hanging arm outside the silhouette read as a stick",
    cast/README.md).
  - Elsewhere an arm is one straight tube with a disc or a mitten at the end (A4, A5, B3, B4, B11, C9).
  - Wherever hands are big, they are mittens and sausage fingers (C1, C4, C6).
  - v3's POV hand is in most of v3's final frames at ~600 px: a flat finger with an oval nail over stacked sausage
    fingers (C5).
- **One body for everyone.**
  - The cast varies colour, hair kind and accessory on one peg: v2r `traits.ts` allows a height x0.93-1.05 and a
    width x0.93-1.1.
  - No build, gender or age shows in the silhouette. G1 shows seven people as one shape.

Which era: the pictogram person of 2012-2018 flat UI and explainer illustration, and of kids' apps.

Where it came from: reference 1 (the France reel, `assets/ref/`) draws exactly this grammar (E4: ~4.7 heads, round
heads, backpacks, bar legs). It uses it as a crowd texture: dozens of overlapping figures with 15-35 px heads (E4, E5),
never one person to look at. The owner pointed at those people for their size and simplicity: "don't use big models of
people; the people in the first example video are the right direction" (2026-10-27). We also copied their body: "Reference 1's
grammar: ... a round head that IS the hair (backs), a neck, a tombstone torso, one accessory, two leg bars"
(`src/v2r/kit/cast/README.md`). Then we used it for single people at 130-300 px and for near backs cut by the frame.
At those sizes the toddler proportions are what you see.

Still in the refined her: mostly fixed.
- What is fixed:
  - 6.6 heads measured (D7);
  - a neck;
  - sloped shoulders, a waist and a flared hem;
  - tapered legs;
  - G4 reads as a person.
- What is left:
  - legs on the short side (hip joints at 0.505 H), with the mid-calf hem showing little of them;
  - hands as a small teardrop (0.064 H, ~60 % of real size; `design_research.md` §2);
  - arms that hang straight (D8);
  - from behind, the head still 0.53 of the shoulders' width (0.124 / 0.236 H in `model.ts`).

### 2. CLOTHES: costume shorthand, no fashion, and what does read is 2010s or older

- **One garment for everyone.**
  - v1 and v2r put every person in the same tombstone "coat" over two leg tubes. v2r has three lengths, `CoatLen`
    'jacket' | 'mid' | 'long'.
  - Even the "jacket" stops 0.31 H above the feet. A real jacket ends at the hip, ~0.5 H, so every coat reaches
    mid-thigh or lower (B9).
  - There is nothing to read as a style:
    - no tops;
    - no trousers with a cut (wide, straight, cropped);
    - no skirts or shorts;
    - no layers, such as a jacket open over a tee;
    - no fit, oversized against fitted.
- **Roles worn as props.** Identity is pinned on with the props of a job, not the clothes of a person. They read as
  job icons:
  - a lanyard and badge (A3, A6, C2, C7);
  - an apron with a back bow (A9, B11);
  - hi-vis (C11);
  - a clipboard (A3);
  - a newspaper (v2r's stranger);
  - a potted plant and a tote (B1);
  - a pencil through a bun (C7).
- **What does read as a garment is old-coded:**
  - The ghosts' trench with a back belt bow (B6): classic, read as older.
  - The refined her's outfit (D1, D7-D11): a belted A-line wool coat to mid-calf, opaque tights, ankle boots, a tube
    scarf and a low bun. That is the 2014-2016 autumn uniform (`design_research.md` §2). To a 20-30-year-old today it
    is their teacher's coat. People.md chose it ("the reference teaches refinement, not wardrobe"; "London October
    evening"), so the wardrobe was never redesigned.
  - Pom-pom beanies (A7, A11, B10, C8), earmuffs (C8) and a panama hat (A11): early-2010s winter knits, children's
    earmuffs, an older tourist.
  - A cable knit (C10), a messenger bag (A8) and a cream bell coat like a poncho (A2): classic or 2000s.
  - Puffers drawn as tubes with evenly ruled lines (C8, C9). The garment is current, but the ruling makes it a
    2010s vector icon.
- **No fabric.**
  - Wool, denim, nylon and cotton are the same flat fill.
  - There is no drape: nothing hangs from the shoulder points, gathers at a belt or breaks at the shoe.
  - There are no folds where the body bends: an elbow, a knee, a strap pulling across the chest.
  - There is no hem that swings.
  - The v1 and v2r coat is a rigid shell. The refined her's coat is a smooth bell with one fold overlay; walking away
    she is "a teal column" (D10; people.md §4.1).
- **No shoes worth reading.** We draw pucks (v1), ellipses (v2r) and plain ankle boots (the refined her). At 150 px
  the shoe is one of the few style signals that survive, and we draw no recognisable shoe: a chunky sneaker, a
  loafer, a ballet flat, a boot with a shaft.

The target, a wardrobe that reads 20-30 in New York or Los Angeles today, is `fashion.md` §2-§4.

### 3. HAIR: balls and helmets

- **The head IS the hair.** In v1 and v2r ("a round head that IS the hair (backs)"), hair is a circle in one flat
  colour. Every hair kind is that circle plus an attachment (`traits.ts` HairKind):
  - 'bun': a second ball on top, which reads as a granny bun or a mouse ear (A9, B4, B11);
  - 'lowBun': a ball on the nape (B1);
  - 'curls': a circle with nine bumps (A11, B9, B10);
  - 'long': a flat strip down the back (B9), or v1's carrot-shaped ponytail (A5);
  - v1's near backs: a bowl cut with comb lines (A10).
- **Nothing a current cut needs can be drawn:**
  - no volume, parting, layers, flow or hairline;
  - so no long layers, curtain bangs, blunt bob, sleek middle-part bun, textured crop, defined curls or taper.
- **Headwear on about one in five:** the cap, beanie and hood weights in `traits.ts` add up to 19 %. It is always the
  pom-pom beanie or the plain cap.
- **Hair colours make the crowd older or toy-like:**
  - silver is one of v2r's five hair colours, so one in five strangers;
  - bald crowns with a horseshoe of hair (B10, C2);
  - teal hair on one in eight of v1's people (`PERSON_HAIR` tealDark).
- **The refined her** has a smooth helmet egg with a low bun ball (D11). It is neat, but with no volume or part it
  reads as an air hostess's bun from the 1950s.

From behind, the hair is the main thing that says who someone is, and it is the least designed part.

### 4. COLOUR: dressed in the set's paint

- **v1:** every coat is a wall colour. `PERSON_BODIES`:
  - sand, "mid walls, necks/skin";
  - tan, "dark walls";
  - cream, "light walls";
  - sage, "glass panes, tree crowns";
  - teal, "doors, frames";
  - brown, "posts";
  - peach, "placards".

  The skin is the mid-wall sand, L\* 78 C\* 18: plaster. Shoes are teal, peach or cream. People melt into the
  facades behind them (A1-A12).
- **v2r:** 8 of the 11 coat colours of the public are set tokens:
  - brick, brickLight and brickDeep: the facades;
  - sage and stoneShade;
  - leafRust: the leaves;
  - box: the caption highlight;
  - coatSlate: the same hex as paneUnlit, the unlit window.

  All five skins are set tokens:
  - paving, L\* 88 C\* 14: plaster;
  - brick and brickDeep, at hue 40-43: brick red, where real skin sits at hue ~50-65;
  - brickLight;
  - box.
- **v3:** 8 of the crowd's 10 coats are set tokens (`WINTER` in People3.tsx):
  - the data centre's body and its shade side;
  - the sky band;
  - the desk and the shelf;
  - the window reveal;
  - the wall;
  - the beam wood.

  The hi-vis is the caption highlight box (`EMBER.hl`).
- **The result: busy dusty patchworks, not one value shape.**
  - Each 150 px figure has 5-8 colour patches, all mid-tones (L\* 36-90).
  - There is no neutral base: no black, white, grey, denim or camel, which every street outfit is built on.
  - The references' people are one value shape:
    - a near-black silhouette with one lit edge: ref 01's man, median L\* 6 against L\* 50 around him; ref 03's
      couple, L\* 18 against 37;
    - or one light figure on a mid ground (ref 04).
- **The refined her:** the hero teal (C\* 33) covers her biggest mass, a full-length coat, so she is a saturated
  column (D1, D10). The rose scarf and the plum tights are two more accents.
- **Which era:** the dusty mustard, rust, plum, slate and sage are the 1970s revival of late-2010s illustration.
  v1's teal, sand and cream are 2014 flat design.

### 5. POSE: stiff tokens

- **Stance:** upright and symmetric, both feet side by side, the weight on both legs (A1-A3, A6-A9, B7, B9, G1). The
  walk is a leg swing under a still peg.
- **Arms:**
  - none on v2r's back views;
  - one straight tube raised level or vertical (A4, A5, B4, B11, C9);
  - hands on hips (A6);
  - the refined her's arms hang straight to mid-thigh (D7, D8, D10).
- **Clones:** nine near-identical ghosts walk in lockstep (B6), and rows repeat one stance (A11, C8).
- **Missing:**
  - contrapposto, one hip up and the other knee bent;
  - asymmetry;
  - a hand with somewhere to be: a pocket, a strap, a phone, a cup;
  - a head tilt;
  - the dropped shoulders of someone at ease.

  "Cool" is mostly attitude, and these figures have none. The refined her's walking profile (D9) is the one view with
  life.

### 6. RENDER: line and shading

- **v1, v2's first pass and v3: a clip-art finish.**
  - One dark outline on every shape: 3.4 px mid, 4.8 px front, about 1.5-3 % of a 130-300 px figure's height.
  - Inner lines on every seam, badge and backpack.
  - A 3 px pure-white rim strip inside one edge (v1's heroes, v3's puffers in C8).
  - Flat fills.

  That is the 2010s clip-art and colouring-book finish (sections A and C).
- **v2r:** a thin same-hue line and flat fills with no light (section B): cut-paper pegs.
- **The refined her:**
  - no outlines;
  - three flat planes per part;
  - a crisp crescent terminator.

  She is clean, but a hard-edged vector sticker inside v6's painted world (D1; people.md §4.1, point 4).
- The thick outline is already retired for future films (the clean pen: no outlines, 2026-10-29). What is left is a
  decision about finish: lit planes, and how crisp a figure sits in a painted world.

### 7. FACE

- **The faces we drew** (v2's first pass C1-C3, v3 G5b's "you" C6, the staffers C2):
  - two dot eyes;
  - brow dashes;
  - a C-hook nose;
  - one mouth line or an "o";
  - C-arc ears;
  - all on a circle or an oval.

  This is the 2018-2021 corporate-flat or emoji face. It is generic in the template sense, and childish. The owner's
  "generic" means simplified and still beautiful.
- **Since 2026-10-27 people have no faces, and the stand-ins read worse than a face.** The v2r profile is a flat skin
  crescent cut out of the hair ball, which reads as a mask or a visor (B2). Back views get stuck-out ears (cause 1).
- **The best face we have** is the refined her's profile: the skin's own edge and one closed-eye line (D9; people.md
  §c).

### 8. DETAIL: spent on icons, not on style

- **What survives at 130-220 px** (section F) is only:
  - the silhouette;
  - the head's size;
  - the hair's shape;
  - the value pattern;
  - one accessory.
- **Our detail goes to things that do not survive or say nothing about the person:**
  - badges (~8 px);
  - backpack rectangles with pocket lines;
  - bows;
  - a plant;
  - a clipboard;
  - headphone discs;
  - ruled quilting;
  - a pencil in a bun.

  (A1, A3, A6, B1, C7, C8.)
- **None goes to what carries style at that size:**
  - the hair's outline;
  - the garment's silhouette: cropped or long, boxy or fitted;
  - the width of the trousers and where they break;
  - the shoe;
  - how a bag is carried.

### 9. TELLS: cheap artifacts

- v6's walker under the arch: the arch's edge cuts off his head, and his stick legs split ~70 degrees with no knees
  (D3).
- v6's 48 px bridge walkers: a grey ball on two sticks (D4).
- Nine near-identical ghosts in lockstep (B6).
- v1's near crowd: a third of the frame is balloon heads (A11).

## 4. The ranking, and why in this order

| # | cause | how strongly it reads old or ugly (1-5) | which of our people | still visible at 130-220 px | still in the refined her |
|---|---|---|---|---|---|
| 1 | BODY | 5 | all of v1, v2, v3 | yes: it is the silhouette, even at 48 px (D4, G) | partly: legs, hands, arms |
| 2 | CLOTHES | 5 | all | yes: the silhouette and the colour masses | yes, all of it |
| 3 | HAIR | 4 | all | yes: the top of the silhouette, the main cue from behind | yes |
| 4 | COLOUR | 4 | all | yes | partly: the teal column |
| 5 | POSE | 3 | nearly all | yes | yes |
| 6 | RENDER | 4 for outlines, 2 for flat | outlines: v1, v2's first pass, v3; flat: v2r | yes (outlines) | partly: the sticker finish |
| 7 | FACE | 4 where drawn | few, all retired; the profile mask in v2r | partly | no |
| 8 | DETAIL | 2 | most of v1, v2r, v3 | the icons do not survive | mostly fixed |
| 9 | TELLS | 3 | a few | yes | n/a |

1. **BODY comes first.** It is in nearly every person, it reads even as a black shape at 48 px, and it sets the
   genre (a kids' explainer) before anything else is seen. No wardrobe survives it.
2. **CLOTHES and HAIR come next.** Once the body is right (the refined her), they are what still reads old, and they
   are what says "20-30, New York or Los Angeles", or fails to.
3. **COLOUR comes before POSE.** Colour touches every figure in every frame and decides drab against appealing at any
   size. Pose decides cool, but our pegs cannot pose until the body is fixed.
4. **RENDER is sixth.** It is a strong "old" signal, but the thick outline is already retired. What is left is a
   choice of finish.
5. **FACE is seventh.** It hurt badly where it appeared, but faces are rare and retired. It is a design question
   again because the owner asked for "a more generic way" to draw them.

## 5. What still reads old in the refined her, ranked

The next design starts from `src/lib/figure/`, so this is her own list:
1. **The outfit:** a belted A-line wool coat to mid-calf, opaque tights, ankle boots and a tube scarf (D1, D7-D11).
   It is 2014-2016, and full length makes one column that hides the legs, the clearest adult cue.
2. **The hair:** a smooth helmet egg and a low bun ball, with no volume, part or movement (D11).
3. **The colour:** the hero teal on the biggest mass (D10), plus two accents, rose and plum, with no neutral base.
4. **The pose:** arms hang straight, the weight is even, and no hand has anything to do (D7, D8, D10). The walking
   profile (D9) is the one view that reads current.
5. **The finish:** crisp vector planes in a painted world (D1).
6. **The last of the proportions:**
   - legs on the short side (hip joints at 0.505 H);
   - small teardrop hands (0.064 H);
   - from behind, the head still 0.53 of the shoulders' width.

## 6. Do not over-correct

Shrinking the head and stretching the limbs past natural leads to corporate Memphis (2017-2020: tiny heads, huge
bendy limbs, flat purple or blue skin, people mid-jump), which is just as dated.

The target is:
- natural adult proportions: the references are 6.7-7.4 heads (`design_research.md` §3);
- real garments with drape;
- real, warm skin tones;
- one big, clear value shape per person.

## 7. For the orchestrator (not applied: this file changes no other doc)

- **Playbook, People bullet:** it still says "round heads" ("People small and simple like reference 1 (... round
  heads ...)"). That wording is the source of causes 1 and 3, and the owner's words of 2026-10-30 supersede it.
- **The same wording elsewhere:** `src/v2r/kit/cast/README.md` ("Reference 1's grammar") and people.md ("The reference
  teaches refinement, not wardrobe", the source of cause 2 in the refined her).
- **Reference 1's people are a crowd texture.** Its round-head peg fits figures under ~40 px, in far crowds only.

## 8. Rebuild the sheet

`python3 docs/look/people_design/diagnose_sheet.py`, run from `video/`:
1. Once, it extracts the master frames (ffmpeg) and renders `KitCast` and `KitSheet2` (Remotion, `--gl=angle`,
   `--concurrency=1`) into `out/people_design/`, which git ignores.
2. It then builds the sheet with Pillow, deterministically.

The crop boxes, captions and tags are in `items()` in the script.
