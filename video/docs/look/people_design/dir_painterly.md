# Direction: SOFT PAINTERLY people

**Status: a look proposal for the owner to judge (2026-10-30), stills only.** It ranks below the playbook, `DIRECTION.md`
and `CRAFT.md` and changes no rule by itself. It answers the people research (`diagnose.md`, `design_research.md`,
`fashion.md`, next to this file) with one direction: people who sit inside our painted dusk scenes like the owner's
references (the girl in the 9:16 motion piece, the beach couple), drawn with natural proportions, 2-3 painted value
planes per form, a warm key and a cool sky rim, soft edges inside and a crisp silhouette, and the face as a soft
suggestion.

- **The sheet:** `dir_painterly.png` (2400 x 3110). Her in two outfits x three views at 640 px; the two supporting
  people at 640 px; the face treatment (as drawn at 640 px, shown 2.6x); the whole cast at 200 and 140 px on a
  mid-tone ground; her in the painted still v6's doorway (before, after, 2x); the black-fill test at 140 px; the palette.
- **The code:** `src/look/people_dirs/painterly/` (new; nothing else was edited). Render entry
  `src/entry-look-people-painterly.tsx`:
  `GL=angle node scripts/render-frames.mjs PtSheet <dir> 0 --entry=src/entry-look-people-painterly.tsx --concurrency=1`
  (one frame, ~5 s). `PtTest` renders any people and views (props `items`, `h`, `head` for a close crop).
- **The scene crop:** `dir_painterly_crop.py` (next to this file) cuts the doorway out of `paint_still_v6.png`, paints
  the old her out and writes `src/look/people_dirs/painterly/doorway.ts`.

## 0. The ask (owner, verbatim)

- "One thing we I don't like about people on our design is there is a lot style involved like we need to draw people
  that are beautiful and pleasant and the clothing is appealing. Our. Current design is very old style and frankly
  ugly so it's tricky I think it will require its own deep research" (2026-10-30)
- "Yes then people I think we should target 20-30 yo today with styles that are just cool and appealing to look at so
  think instagram infkuebcers, New York, Los Angeles, including hair clothing and perhaps less of faces like faces we
  need to find a way to draw in a more generic way" (2026-10-30)
- "Another bit is humans we paint - they should be better / ... On the video the person is not substantially
  different than yours but certainly more refined and clean and more fluid" (2026-10-29)

## 1. The direction in one paragraph

Each person is built once as a soft 3D form (a body of rings, garments over it, hair as one designed mass) and painted,
not rendered: the light of one rig is read off the forms and laid down as a painter blocks a figure, a lit plane, a
soft shade plane (cool on cloth and hair, toward red on skin), one warm highlight band, a thin cool sky rim on the side
away from the key, and on skin a warm, saturated band along the terminator. Inside the figure every edge between planes
is soft (a blur in the figure's own units, broken a little by a dry brush); the silhouette is never soft: every plane is
clipped by a crisp outline, so a figure stays a clean shape at phone size and sits in the painted scene. Because the
form is real, one person turns to any view (front 3/4, profile, back, lost profile) and stays the same person. Faces are
light and two or three marks at most: lowered lids, a soft brow, a lip tone; a cap's shadow or sunglasses hide the eyes.

## 2. How the causes in `diagnose.md` are answered

| # | cause | what this direction does | where |
|---|---|---|---|
| 1 | BODY: 3.7-4.9 heads, ball head, tombstone, bar legs | 7.8 heads (woman), 7.9 (man); an egg skull with a jaw and a nape; a neck; sloped shoulders, a waist, hips; legs 5 % long; tapered limbs with offset calf bulges; real-size hands and feet | §3 |
| 2 | CLOTHES: a sack coat, job props, 2010s | four 2026 looks from `fashion.md` (N3, L1+L2, N5, N1), each with ease, hang and its one detail; no job props | §6 |
| 3 | HAIR: balls and helmets | one mass that HANGS below the skull's widest line (never a bowl), a part, soft clumps, a sheen band; long layers, a ponytail through a cap, a textured bob, curls on a low taper | §5 |
| 4 | COLOUR: dressed in the set's paint | a tonal base per outfit plus one accent; the hero teal only on her (the skirt, the cap); real, warm skins | §7 |
| 5 | POSE: stiff tokens | contrapposto (pelvis 6 degrees, shoulders 3 the other way), one hand anchored (a strap, a cup, a pocket), a short-armed walk, the head turned off the torso | §8 |
| 6 | RENDER: clip-art or a vector sticker | no outlines; 2-3 painted planes per form with soft inner edges, a crisp silhouette, a cool rim, a faint paint grain | §4 |
| 7 | FACE: dot eyes, the visor crescent | the face's own forms make its light; lids, brows and a lip tone only, faded in by head size; profile = the skin's edge | §9 |
| 8 | DETAIL: icons | detail spent on what reads at 130-220 px: hair outline, garment length and width, the shoe, the bag, the cap | §6 |
| 9 | TELLS | no clones (four builds and silhouettes), no stick legs, no balloon heads; the black-fill test passes at 140 px (sheet) | sheet |

## 3. Proportions (H = 1000 units, crown to sole; h = the skull, crown to chin)

| | woman (her, the coat woman) | man |
|---|---|---|
| skull (crown to chin) | 0.128 H = **7.8 heads** (with the hair's volume the head reads ~0.135 H) | 0.127 H = **7.9 heads** |
| chin | 0.872 H | 0.873 H |
| shoulder joints | +-0.088 H at 0.806 H; shoulder width with the deltoids **0.236 H** | +-0.100 H at 0.802 H; **0.268 H** |
| shoulder line | slopes ~15 degrees from the neck's base to the arm (the torso's half-width 0.027 H at 0.852, 0.073 at 0.829, 0.097 at 0.812) | ~10 degrees |
| waist (narrowest) | 0.160 H wide at 0.628 H | 0.184 H at 0.612 H |
| hips | 0.208 H wide at 0.515-0.545 H | 0.190 H |
| hip joint / knee / ankle | **0.545** / 0.295 / 0.042 H (legs ~5 % long, `design_research.md` P2) | 0.540 / 0.290 / 0.042 H |
| neck | 0.046 H wide (radius 23 units), 0.04 H of it visible; it leans 10-15 degrees forward into the skull | 0.056 H wide |
| upper arm / forearm / hand | 0.183 / 0.148 / **0.098** H | 0.186 / 0.150 / **0.105** H |
| foot / shoe | 0.145 H / a flat 0.154 H long, 0.030 H tall; a sneaker or loafer 0.157 H, 0.038 H | 0.152 H / 0.164 H |
| limbs | taper thigh : ankle ~3 : 1; the calf's outer bulge at 0.24 H, the inner 0.03 H lower; the forearm's bulge near the elbow on the thumb side | the same, 8 % heavier |

- **The head** is an egg, not a circle: its half-width is 0.33-0.36 h through the cheekbones, 0.31 h at the jaw's
  angle, 0.15 h at the chin; its back bulges 0.49 h behind the ear axis. Width : height ~0.70.
- **The profile** (the skin's edge, `body.ts` HZM): the brow 0.405 h forward of the ear axis at 0.565 h above the chin,
  the bridge dips at 0.50 h, the nose tip 0.449 h forward at 0.31 h (0.044 h proud of the brow: soft, never pointy),
  the upper lip 0.376 h at 0.20 h, the mouth 0.18 h, the chin's front 0.362 h at 0.07 h. Per-face numbers (`FaceShape`):
  her nose 0.08, jaw 0.97, chin 0.9, cheekbones 1.15, brow ridge 0.7; the man 0.10, 1.08, 1.15, 0.9, 1.2.
- **Variety:** the coat woman is 3 % slimmer; each person has their own face numbers (nose, lips, cheekbones, jaw,
  chin) on the one head model.

## 4. Light and paint (the finish)

**The rig** (one per scene; `PtFigure.tsx` KEY_LEFT; colours in `color.ts`): the key from the upper left, a little in
front (camera space L = normalize(-0.62, 0.50, 0.60)), gold (hue 68); the sky rim from the right and behind
(R = normalize(0.82, 0.22, -0.52)), lilac (hue 288). The camera: the eye at 0.9 H, 5 H away (a person filming a person:
hems and soles bow gently).

**The planes of a material** (from its colour as worn; `color.ts` planes):

| plane | where (N = the form's normal) | colour |
|---|---|---|
| LIT | everything visible (the base fill) | L* +1.5 (+3 on darks), C* x 1.04, the hue 5 degrees toward the key |
| SHADE | N.L < 0.06 (curls 0.12) | cloth and hair: L* -17 (darks -6.5, lights -15), hue 13 degrees toward the sky (34 on near-neutrals): cool; **skin: L* x 0.80, C* x 1.10, hue 7 degrees toward red** (never grey or violet) |
| HI | N.L > 0.84-0.86; leather a specular streak (N.H)^22 > 0.42; hair the anisotropic sheen band | L* +7 (leather +18, hair +13, satin +13), warm |
| RIM | N.R > 0.5 and N.L < 0.32 (never on a lit face); +0.1 on figures under 260 px | L* +17 on darks, +11 mid, +7 skin; C* <= 12 (skin 16); the hue turned toward the sky (skin only 40 degrees) |
| GLOW (skin) | the band from N.L -0.14 to +0.16 along the terminator, figures >= 260 px | L* x 0.90, C* x 1.35 + 3, hue 10 degrees toward red: the warm light in skin |
| UNDER | the inside of a shell (a collar's back, a coat's lining, a cuff) | L* x 0.70 (darks -8), its own hue |

**Soft inside, crisp outside** (`paint.tsx`):
- Every plane but LIT is blurred (a gaussian, sigma in model units, so the softness scales with the figure): shade 7
  (the face 2.8, hair 4.5, curls 2.2, the skirt 8), highlight x 0.8, rim 1.6. At 200 px a sigma of 7 is 1.4 px; at 640 px
  it is 4.5 px.
- Each blurred plane is clipped by the surface's crisp outline, and its edges that end on the silhouette are pushed
  ~3 sigma past it, so the blur never leaves a pale fringe: **the silhouette is always a hard edge.**
- **The dry brush:** at >= 260 px the shade edge is displaced by a fine noise, elongated along the figure's height
  (5.5 units, x 0.7 on highlights): a painted edge, not an airbrushed one.
- **The paint grain:** at >= 260 px a sparse mottle in the figure's own units (it rides the figure, never the screen),
  multiplied at 7 %: "VERY subtle" (DIRECTION rule 4).
- **The ground's occlusion:** below the knees the figure darkens toward the feet (to x 0.88 at the soles, a lilac-warm
  multiply): the dark-feet-to-light-chest hierarchy of `design_research.md` V1, done softly.
- A soft contact shadow under the feet (a multiplied, blurred ellipse).

## 5. Hair (one designed mass)

- **Built as a shell** over the skull (the skull's surface pushed out by the hair's volume, `hair.ts`), open where the
  face is (the window follows a hairline: the part, curtain bangs, the jaw).
- **It hangs:** below the skull's widest line (0.56 h above the chin) long hair falls straight down instead of
  following the skull in to the nape and under the jaw: the silhouette is an oval crown over two falling curtains,
  never a bowl (`hangPoint`). One surface from the crown to the ends (no seam at the jaw).
- **Volume** (beyond the skull): long 0.045-0.07 h; the bob 0.045 h; the ponytail's cap 0.016 h (sleek); curls up to
  0.17 h of lobes.
- **Clumps:** 8 soft vertical lobes around the head, deepening through the lengths (0.009 h, 3.2 units in the curtain):
  the light turns them into long value ribbons.
- **The ends:** long hair ends at 0.676 H at the back and 0.77 H in front (face-framing layers at the collarbone), in
  ~3 round lobes 15 units deep with small notches between (`1 - |cos|^0.55`: never a zigzag), swelling out 7 units and
  rounding under; the bob ends at 0.868 H in 4 shallow notches (7 units).
- **The sheen band:** where the strands (the rows) run perpendicular to the half vector, (sheen)^5 > 0.5: one band
  across the crown on the key side, "healthy, groomed" hair. Curls get a highlight on each lobe instead.
- **The part:** one soft line in the hair's deep tone from the hairline back over the crown (55 %).
- **The library used:** her long layers with curtain bangs (`fashion.md` H2), her ponytail through the cap (L2), the
  coat woman's textured bob (H1), the man's curls on a low taper (H9).

## 6. The wardrobe (garment types, `fashion.md` §4)

A garment is a surface over the body's own rings: an **ease** (how far the cloth stands off the body), a **hang**
(below a support line the cloth no longer follows the body in: it falls straight from the shoulder blades, the bust or
the hips), a **drop** (a widened, softened shoulder line), an **open front** and necklines as masks, a few **drape
lobes** that the light turns into soft value bands, and hems that vary around the body (a half tuck). Every neckline
hugs the neck's base (the ring closes to the neck's radius + 3-6 units above 0.82 H), and the chest's skin is kept
under a garment so an open neck shows skin, never the garment's inside.

| who | the look | the shapes, in H | colour (as worn) | the one detail |
|---|---|---|---|---|
| **Her, autumn city evening** (N3) | a cropped leather jacket worn open, a funnel collar to 0.866 H; a cream top tucked in; a **teal satin slip skirt**; pointed flats; a slouchy burgundy bag under the arm on a thin strap | jacket hem 0.606 H, ease 0.010-0.015 H, drop 0.012; skirt from 0.648 to 0.208 H, 0.244 H wide at the hem, 5 bias folds; flats 0.030 H tall | jacket `#2E2426` (leather: one specular streak), top `#EFE5D8`, skirt `#0B8577` (the hero), flats `#2B2224`, bag `#6E2E33` | her hand on the bag's strap at the chest |
| **Her, casual weekend** (L1 + L2) | an oversized cloud-white shirt, half-tucked, sleeves pushed up; relaxed straight jeans; slim cream sneakers; the **teal cap** with her ponytail through its back; an iced coffee | shirt hem 0.596 H in front, 0.462 H at the back (the tuck), ease 0.007-0.015 H, drop 0.014; sleeves to the mid-forearm; jeans 0.088 H per leg below the knee, a 4-unit stack; ponytail 0.24 H | shirt `#F0EAE1`, jeans `#476E8E`, sneakers `#ECE3D6` on a `#F5F0E8` sole, cap `#0B8577` (the hero) | the cap and the ponytail; the brim's shadow over the eyes |
| **The man** (N5) | a boxy caramel suede chore jacket, open, over a cream tee; relaxed navy trousers cropped to show **white crew socks**; dark loafers | jacket hem 0.488 H, ease 0.016-0.024 H, drop 0.018; trousers 0.100 H per leg, hem 0.074 H, socks to 0.082 H | jacket `#B58058` (suede: matte, no streak), tee `#E9DBCA`, trousers `#254161`, socks `#F0EAE1`, loafers `#3D2C2D` | the white sock flash |
| **The coat woman** (N1) | a long chocolate wool coat, open and unbelted, over a **dark column** (a near-black knit and wide trousers in one tone); near-black loafers; oversized sunglasses | coat hem 0.190 H, hang from 0.748 H, drop 0.018, 4 drape lobes; wide trousers 0.128 H per leg | coat `#664334`, knit and trousers `#2E2426`, loafers `#2A2123` | the open front's dark column |

- **Shoes are a style signal:** the flat (0.154 H long, the vamp low, the instep's skin showing), the slim sneaker and the
  loafer (0.157 H, 0.038 H tall); never a blob foot. Feet turn out 14-26 degrees.
- **Dated, never drawn** (`fashion.md` §8): the belted A-line coat with tights, ankle boots and a tube scarf (the old
  her); chunky sneakers; skinny jeans; pompom beanies; job props.

## 7. Colour

- **Skins** (as worn, before the light): her `#E0B196` (light-medium, S2), the coat woman `#C79671` (medium golden, S3),
  the man `#8B5A42` (deep brown, S5, with a warm sheen `#A5836A` at 35 % on the key-side cheekbone).
- **Hair:** her auburn `#8C4C33`, the bob's espresso `#3A2B27`, the man's black-brown `#2B2324` (the taper `#3E302D`).
- **Outfits:** a tonal base plus at most one accent; the hero teal `#0B8577` only on her (`design_research.md` V3).
- **Value:** dark at the feet (shoes L* 15-25, trousers 27-45), lighter at the chest (a cream top or tee at the neck,
  L* 88-93): `design_research.md` V1, so the face area is the lightest part of most figures.

## 8. Pose

- **Built from targets:** a pelvis (shift, yaw, pitch, roll), a chest, a head, the two ankles and the two wrists; the
  knees and elbows by two-bone IK with a hint; elbows and knees rounded by a 46-58 unit fillet so a bent sleeve never
  folds through itself.
- **Standing:** contrapposto, the weight leg's hip up 6 degrees, the chest 3 the other way, the head yawed 10 and
  tilted 4; the free foot 0.046-0.05 H forward and out, turned 26 degrees.
- **Walking:** the stride 0.25 H, the back heel up 34 degrees, the front toe up 12; the pelvis yaws 7, the chest 6 the
  other way; the free arm swings little (the cool walk), the other is anchored.
- **The hands:** one anchored per person (her: the strap at the chest, or the cup at the waist; the man and the coat
  woman: a pocket, the elbow out); the other relaxed, the wrist broken, the fingers curled 26-30 degrees. Never a
  presenter's open arms or pointing.
- **The gaze** into the scene: lids lowered, the head turned 10-38 degrees off the torso.

## 9. The face: a soft suggestion

- **The head's own forms make its light** (the brow, the cheekbones, the nose, the lips, the jaw are in the mesh), but
  the light reads a simplified twin of the head at 78 %, so features shade softly instead of as holes: the far cheek's
  shade, a nose shade, a soft socket shadow.
- **The marks** (`face.ts`), placed on the skull's surface and faded by how much they face the camera (a turn hides them,
  they never pop):
  - **lids lowered:** one lash arc per eye, 0.43 rad wide, with a flick at the outer end, ~2.2 units thick in the
    hair's deep tone (the man: a straighter, open line);
  - **brows:** a soft tapered stroke, thicker inside, 62 %, a step lighter than black;
  - **the lips as a tone:** a soft upper bow and a fuller lower lip, 0.68 rad wide, 62 %, never a line;
  - a little warmth on the cheeks (16 %), and on deep skin a sheen on the key-side cheekbone.
- **The face budget by the skull's size** (`design_research.md` §11.3): under 12 px nothing; brows, lips and cheeks
  fade in from 12 to 22 px; lashes from 26 to 44 px. At 140 px (skull 18 px) the face is the skin's light with a
  hint of brows and lips; at 200 px (26 px) the same, a little firmer; the lids come in from ~210 px; at 640 px (82 px)
  the full set.
- **The options shown:** lids lowered (her, 3/4), the profile's skin edge (her), the lost profile (the jaw's line past
  the ponytail), the cap's brim shadow across the eyes (a cool multiplied band, 50 %), deep skin with its sheen (the
  man), oversized sunglasses (the coat woman: the darkest shape on the head, one reflection streak per lens, the
  temple arm a line).
- **Never:** pupils, eye whites, a mouth line, nostrils, dots.

## 10. In the scene (the doorway test)

Her evening look, walking out of v6's lit doorway at the old her's spot and size (her soles at y 1083, 158 px tall, the
sheet's last row): the painted crop keeps v6's own light; she carries the rig of the scene (the key from the low sun on
the left, the lilac sky rim on the right). Her teal skirt is the doorway's colour accent as the old her's coat was, the
leather jacket gives the frame a real dark next to the lit interior, and the crisp silhouette keeps her a clean shape
against the painted wall. At 1:1 she reads as a young woman in a cropped jacket and a midi skirt; the old her reads as
a coat and tights.

## 11. Strengths and weak spots (honest)

**Strengths**
- **Adult, current, distinct:** 7.8 heads with real hands, necks, shoulders and hips; four looks that read 2026 at
  200 and 140 px by silhouette, length, value and one detail; the black-fill test passes at 140 px (the skirt, the cap
  and cup, the cropped trousers, the long coat).
- **One model, every view:** a person turns to any angle and stays the same person (the sheet's turnarounds); new views
  cost nothing. Light and shade come from the forms, so the planes are always right for the rig.
- **It sits in the painted world:** soft planes inside, a crisp outline outside, the scene's warm key and lilac rim;
  the doorway test reads as one picture.
- **Faces that are generic but pleasant:** calm lids, a lip tone and the head's light; sunglasses and a cap's brim give
  cool alternatives; the faces never look at the camera.
- **Parametric and deterministic:** outfits, hair, poses and skins are data (`cast.ts`); a crowd is a list.

**Weak spots**
- **More "soft 3D" than hand-painted at 640 px.** The forms are smooth and the paint character (the brush break, the
  grain) is subtle; garments look a little inflated, with few folds (a handful of drape lobes, no wrinkles at the elbow
  or the knee). A true painted look would need a second paint pass (stroke shapes on the shade edge, colour drift inside
  a plane).
- **Hands are mittens with a thumb:** right at film size, plain at 640 px (the hand on the strap reads as "a hand", not
  as fingers wrapped around a strap).
- **Close-range geometry tells:** a slight shoulder pad where a sleeve head meets a torso garment, the shirt has no real
  collar (its open neck is a cut-out), the cap's brim is a thin slab, sleeve cuffs show a sliver of their inside,
  the long hair is one smooth mass with no loose lock breaking its outline.
- **The draw order is per surface** (a depth sort plus the enclosure rule `covers` and the hand's `holds`): two forms
  that touch (a hand on the face, crossed arms) can sort wrong and need a rule per pose.
- **Cost:** ~0.25 s per 640 px figure and ~0.1 s per small one in Chrome (meshes, marching squares, blur filters; the
  sheet's 45 figures render in ~5 s); fine for stills and a few figures a frame, but a 60 fps shot with many large
  figures would need caching per pose.
- **Rules it bends** (the owner's call): DIRECTION rule 4 keeps "the subject and people crisp" and rule 5 asks for
  "2-3 flat tones" with no blur or gradients; this direction keeps the silhouette crisp but softens every edge inside
  the figure (the playbook's own people bullet asks for "few shapes lit warm on one side with soft gradients"). Faces
  with lids and lips go past the playbook's "no faces" (the owner's 2026-10-30 note asks for generic faces instead).
- **Stills only:** the walk, the hair's follow-through and the cloth's swing are not tested in motion yet.

## 12. Files

- `src/look/people_dirs/painterly/`: `math.ts` (vectors, splines, IK, fillets), `color.ts` (L\*C\*h, the planes),
  `mesh.ts` (surfaces, the camera, the plane regions by marching squares), `paint.tsx` (the painter), `body.ts` (builds,
  the skeleton, the skin surfaces, the head), `garments.ts`, `hair.ts`, `face.ts`, `props.ts` (the bag, the cap, the cup,
  sunglasses), `figure.ts` (a person -> a model), `cast.ts` (the four people and their poses), `PtFigure.tsx` (the
  component: `<PainterlyFigure person pose view h x y uid />`), `Sheet.tsx`, `Test.tsx`, `doorway.ts` (generated).
- `src/entry-look-people-painterly.tsx` (PtSheet, PtTest).
- `docs/look/people_design/dir_painterly.png`, `dir_painterly.md`, `dir_painterly_crop.py`.
