# COMPOSITION: big quiet areas and one place to look (study and rules, 2026-10-30)

The owner (2026-10-30), on our list of the 10 biggest differences between still v6 and the references: "8 agreed this
is an important point about scene composition" (point 8: simplicity and focus); on still v6: "Our point 8 I’d also
true - our scene is very busy". The playbook rule this feeds: "SCENE COMPOSITION: big quiet areas and one place to
look" (`docs/OWNER_PLAYBOOK.md`): few elements of equal weight, values grouped into a few big masses, one focal point
with the most contrast and the story light, negative space; a busy frame of many mid-tone props is the failure. Two
older owner notes it must live with: the view ("So I think our initial angle snd the view frankly wasn’t bad",
2026-10-29) and the density ("the reference do have more details and density like the the street along the canal ours
is pretty empty while their have density", 2026-10-29).

**What this is.** The COMPOSITION lane of the organic research: notan (dark-light) and value-grouping studies of still
v6 and of the owner's references, all measured the same way at phone width (§1-3); the composition rules for our 9:16
films, each with its numbers and where they come from (§4); three recomposed value thumbnails of scene 1 that apply
them, measured like the references (§5); a check that runs the rules on any still (§6); the doc clashes found (§7).
**Rank:** research notes, the lowest rank on DIRECTION's ladder; nothing here is a rule until it is integrated into
`LAYOUT.md` (§1, §3, §6), `LIFE_AND_DENSITY.md`, `CRAFT.md` §b and §f.8 and the playbook's SCENE COMPOSITION. We learn
methods: the references are only measured (never traced, copied or used as an input to a picture of ours), and no
living artist is a style target. Paths are from `video/`.

| File (`docs/look/organic/`) | What |
|---|---|
| `composition.md` | this report |
| `composition_sheet.png` | the sheet: v6 and four references at 400 px, each as the picture, its 2-, 3- and 5-value notan, what calls the eye and where it is quiet, with its numbers; then v6 in 5 values beside the three recomposed value thumbnails of scene 1 (540 x 960); then the rules at a glance |
| `composition_study.py` | the measuring and drawing script (deterministic): `python3 -B composition_study.py all` (thumbnails, measures, sheet; ~3 min on one core), or `measure`, `thumbs`, `sheet`; `frame STILL.png [--caption] [--subject x0,y0,x1,y1]` checks one still against §4 (§6) |
| `composition_metrics.json` | every number below, per picture (v6, v5, v2 as shipped, refs 01-04, the van painting, the seven posters, T1-T3) |

## 0. Bottom line

- **v6 is busy because about ten things call the eye with nearly equal force.** At phone width, with the values
  squinted, ten separate regions pull at >= 50 % of the strongest (three of them within 30 % of it), and in colour the
  four yellow upper windows out-shout the lit door (the colour formula's #1, #3, #4, #5; the door is #2). The owner's
  painting-style models have one or two such regions (refs 02, 03, 04: 1-2 calls, one rival). Below the calls, v6
  breaks into 31 separate value pieces (refs 2-7) and about 40 named things (by eye; refs 4-6 objects plus their big
  fields), 12 of them on our own quay.
- **The references group their values into three big masses, and their density lives INSIDE a mass.** At a 1 %
  squint and 3 values, their three largest connected masses hold 88-97 % of the frame (v6 82 %); the busiest
  reference, the city at sunset, keeps hundreds of buildings and still holds 95 % in three masses (a dark hill, a mid
  city, a light sky): full is not busy when the detail stays inside its mass at low contrast.
- **Their quiet is big and connected; ours is in pieces.** The references are 67-91 % quiet at a squint (the city
  35 %), with one or two connected quiet masses of 51-77 % and 12-14 %; v6 is 60 % quiet, but in a sky of 28 % and a
  paving of 24 % perforated by props, and its middle third is only 34 % quiet against the references' 60-93 %.
- **One focal point = the subject + the story light + the hardest value step, in one place.** The bus stop's man
  sits inside its one light; the beach couple stand as dark silhouettes ON the lit horizon line; the city's men stand
  dark against the lit city. Scene 1 has exactly this already: the lit Google doorway with her silhouette in it. It
  only has to be the one call (v6's door wins in value but not in colour).
- **Scene 1 recomposed keeps v2's view and changes the values and the props** (§5): T1 (recommended, the light lane's
  rig: the lit door the one light, our quay in a canopy's shade), T2 (counterchange: the far side backlit into one dark
  band with one light in it), T3 (the references' low key and a bigger sky). Each measures as the references do: 1-3
  calls with one rival, on her in value and colour; 4-6 pieces; the three largest masses 89-94 %; 86-88 % quiet as
  flat values (painted, the gate is >= 65 %).
- **The rules (§4) in one line:** design the notan first (3 masses, >= 85 %), keep <= 10 value pieces and <= 6 named
  objects, ONE call (<= 3, one rival) on the subject with the story light, >= 65 % quiet in two connected masses (the
  sky with the band, the near ground), the focal just under the caption band (y 860-1200, x 380-700), one soft
  counterweight, edges found only at the focal, a real dark mass below the band.
- **Four doc rules pull the other way** (§7: "one quiet field", "no hole bigger than the caption band", "12+ distinct
  props", "6-10 % darks in many small pieces, the near world in mid-tones"); they predate the owner's 2026-10-30 note
  and need a reconciling edit by the orchestrator (proposed in §7).

## 1. How it was measured (`composition_study.py`)

- **Inputs.** Still v6 (`docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png`, the captions taken out:
  inside the caption block x 90-990, y 292-600 each row is re-made from the sky beside it; checked against the
  engine's captions-off render of the same frame: the band is the one calm sky); v5 and v2's S1 as shipped (1.0 s) the
  same way; `refs_human_scale/01`-`04` (the mute button inpainted; 04 cropped below the phone's status bar to 720 x
  1294, which is 9:16 within 1 %), `refs_paint/01` (the print's border cropped), the seven posters (`ui_mask.json`'s
  boxes inpainted). Everything at **400 px wide**: phone width, as the owner sees the landscape references full-width on
  his phone.
- **Value** is CIE L* (sRGB, D65). **The squint** is a Gaussian blur of 1 % of the width (4 px): fine texture (reeds,
  stars, a city's windows) merges into its mass there, while a prop of 3-6 % of the width keeps its own shape.
- **Notan.** The squinted L* cut into 2, 3 and 5 groups by multi-Otsu (the cuts that best separate the picture's own
  values, as a painter picks them for a notan). From the 3-value map: **masses** = connected regions >= 1 % of the frame;
  **the 3 largest** = their share of the frame; **pieces** = connected regions of 0.02-1 % (at 400 px, from ~57 px: in
  the 1080 frame a thing of ~20 x 20 px and up); **the dark mass** = the darkest group's share, mean L* and the share of
  it in its two largest regions.
- **What calls the eye.** CRAFT §b's salience (`scripts/qa/retro_tools/hierarchy/analyse.py`), its sigmas scaled to 400
  px: (a) its luminance centre-surround term alone (what a squinting eye sees in a notan) and (b) its full colour formula
  (+ colour contrast and chroma). A **call** is a connected region whose pull is >= 50 % of the frame's strongest (above
  the median); a **rival** is a call whose own peak is >= 70 %. The focal point is the strongest call; "on the subject"
  = inside the subject's box (+3 % margin; boxes by eye in `SUBJECT`). The counts were checked by eye on every picture
  (the sheet's fifth column numbers them).
- **Quiet** = calm at a squint: the local spread of L* (11 px window = 2.75 % of the width, after a 2 px squint) under
  2.5 L*. Reported: the quiet share, its largest and second connected regions, and per third of the height.
- **Limits.** A salience map is a proxy for the eye, not eye tracking; the subject boxes are by eye (+-2 %); the
  landscape references are 2:1 and only ref 04 is 9:16, so per-frame counts compare a 9:16 frame with frames 2.7x
  smaller (per 100k px the pieces read v6 10.9, ref 02 8.7, ref 03 2.4, ref 04 2.4); the value thumbnails are flat
  values, so their quiet share is an upper bound (the painted frame adds in-mass variation, as the references' 2-8 L*).

## 2. What the references do (measured; `composition_sheet.png` rows 2-5)

| Picture | 3 largest masses | masses >= 1 % | pieces | calls (rivals) value / colour | strongest on the subject | quiet: share, largest + 2nd | quiet by thirds (top / mid / bottom) | value groups dark / mid / light % (mean L*) |
|---|---|---|---|---|---|---|---|---|
| ref 04 cloud beast (9:16) | 88 % | 5 | 7 | 2 (1) / 7 (1) | the lit beast (the girl is the quiet second) | 91 %: 77 + 12 | 92 / 93 / 87 | 33 / 50 / 17 (35 / 56 / 76) |
| ref 02 bus stop night | 97 | 4 | 7 | 2 (1) / 1 (1) | yes: the lit shelter, the man in it | 67: 51 + 12 | 76 / 60 / 63 | 36 / 40 / 24 (10 / 23 / 42) |
| ref 03 beach dusk | 94 | 5 | 2 | 1 (1) / 1 (1) | the lit horizon line; the couple stand on it | 74: 55 + 14 | 86 / 80 / 58 | 18 / 49 / 33 (18 / 34 / 48) |
| ref 01 city hill sunset | 95 | 5 | 14 | 11 (5) / 7 (4) | yes (value): the men dark against the lit city | 35: 11 + 5 | 39 / 25 / 42 | 17 / 46 / 37 (8 / 44 / 69) |
| paint ref 01 beach van | 86 | 7 | 7 | 5 (3) / 2 (2) | no: the van and the boulders | 53: 48 + 1 | 94 / 53 / 14 | 18 / 27 / 55 (24 / 46 / 69) |
| the 7 posters (range) | 78-89 | 5-8 | 11-41 | 8-19 (3-8) / 9-18 (2-7) | (the quiet hero: city-poster `composition.md` §2) | 45-63: 35-52 + 1-7 | 93-98 / 23-67 / 10-24 | 17-33 / 21-34 / 42-60 (33-41 / 58-65 / 85-93) |
| **our v6** | **82** | **10** | **31** | **10 (3) / 11 (4)** | **value yes, colour no (#2)** | **60: 28 + 24** | **80 / 34 / 66** | **16 / 39 / 45 (45 / 60 / 81)** |
| v5 / v2 as shipped | 76 / 78 | 9 / 8 | 26 / 28 | 4 (2) / 9 (2); 3 (2) / 11 (3) | v5 yes; v2 value yes, colour no | 69: 30 + 18; 69: 35 + 15 | 88 / 47 / 73; 93 / 46 / 68 | 2 / 32 / 66; 2 / 28 / 70 |

**How each reference reads** (the method, never the picture):
- **Ref 02, the bus stop** (one of the owner's two drawing-style models): three huge masses (the cloud, the night sky,
  the reeds and ground) hold 97 % of the frame; the one light, the red shelter, is the one call, and the man sits
  inside it. The reeds are full of strokes, yet they are one dark mass at a squint: detail inside a mass.
- **Ref 03, the beach** (the other model): one call, the thin lit horizon line with the sun; the couple are the only
  vertical break in it, dark silhouettes standing ON the light. The violet cloud and the wet beach are two big quiet
  masses (55 % + 14 %). Its subject is not the brightest thing: it sits where the hardest value step is.
- **Ref 04, the 9:16 motion piece:** the most quiet (91 %): three masses (the glowing cloud, the sky, the ground strip);
  the lit beast is the one value call, the girl a small quiet figure at the junction of the cloud's light and the
  ground. Its only rival in colour is the cloud's hot edge: in a 9:16 frame a giant soft mass can carry the colour while
  one small shape carries the story.
- **Ref 01, the city at sunset:** the busiest reference (11 calls, 5 rivals: the lit towers), and still 95 % in three
  masses. It reads because the darks are ONE connected mass (the hill), the figures are found by silhouette (dark
  against the lit city), and the city's hundreds of windows stay inside their mid mass. It is a scale shot, held:
  the model for the far side's density, not for a story beat's focus.
- **The posters** are as busy as v6 by these numbers (8-19 calls): a held poster can afford a tour of icons (the
  city-poster study's finding: their hero is quiet, their peak sits in the near frame). The owner's newer models, the
  painted ones, are what "simplicity and focus" points at.

## 3. Where v6 stands (`composition_sheet.png` row 1; bottom left)

- **The calls (value):** 1 the door with her (the strongest, good); 2 the right upper window (a rival at 0.99); 3 the
  central upper window (0.82); 4 the boat at the right edge; 5 the man by the boat; 6 the bollards and the duck by the
  far quay; 7-10 the right edge, the boat's lamp and small specks. **In colour:** the four yellow upper windows are #1, #3, #4 and #5 (the door #2); the
  yellow side panel, the post box, the top-left leaves and the near tree follow. The door is the right focal and v6
  already lights it; what defeats it is everything else at the same pull.
- **The pieces (31) and the named things (about 40, by eye at 400 px):** the sky 6 (the leaf branch, the cloud bar,
  the cumulus, the low deck, the flock, the sun); the far world 3 (the tower, the roofs, the bridge) and 4 lamp posts;
  the facade 10 (five upper windows, three ground-floor panes, the yellow side panel, the door with her); the far quay
  and the water 7 (the bollard row, the man, two boats, the cat, the duck, Pip on his post); our quay 12 (the tree, its
  grass tuft, the planter with pennants, the crate of flowers, the cafe table, two chairs, the potted plant, the bench,
  the post box, the low wall, the fern pot). The references show 4-6 objects plus their big fields.
- **The masses:** 10 masses >= 1 %, the three largest 82 %. The 2-value notan splits the frame in two halves (the light
  sky and facade above, the paving below) with no shape to it: there is no dark mass, the darkest group (16 %, mean L*
  45) is scattered pieces (64 % in its two largest regions; the references 89-100 %).
- **The quiet:** 60 %, but the sky (28 %) is cut by the leaves, two cloud layers and the flock, and the paving (24 %) is
  quiet only between its 12 props: the quiet is the ground the props stand on, not a mass of its own ("things ON a
  field", LIFE_AND_DENSITY §0's failure).
- **Pip** sits on a post right under the door, where the door's light column leads the eye: on the subject's eye path
  (DIRECTION rule 2 forbids it).

## 4. The rules for our 9:16 films (with numbers)

Each rule: the number, where it comes from, and what v6 and the thumbnails measure. The check `composition_study.py
frame` runs R1-R5, R7 and R10 on any still (§6); WARNs, never FAILs: the owner's eye at phone size decides.

- **R1 Design the notan first: three value masses hold >= 85 % of the frame** (at a 1 % squint, 3 values; <= 8 masses
  >= 1 %). The references 86-97 % (the painted models 88-97), the posters 78-89, v6 82, T1-T3 89-94. One value group
  dominates (40-55 % of the frame: the references 40-50), and the groups' means sit >= 13 L* apart (the references 13-36).
  Method: Dow's notan, the massing of dark and light designed before the drawing (*Composition*, 1899); the background
  painters' value thumbnail before any colour. In our pipeline: a 2- and 3-value notan of every exterior shot at G3
  (the board's grey tiers already are one: `STORYBOARD_STYLE.md`), checked at phone width before G4.
- **R2 Few pieces: <= 10 value pieces (0.02-1 % of the frame) in a 9:16 frame; the rest is texture inside a mass**
  (variation within a mass 2-8 L*, the references' in-mass spread). The references 2-7 per frame (ref 04, the one 9:16
  frame, 7), the city 14, the posters 11-41; v6 31; T1-T3 4-6. A small thing either joins a mass (tone-on-tone, no own
  silhouette at a squint) or is one of the few named objects (R6).
- **R3 One call: <= 3 regions pull at >= 50 % of the strongest, and only one at >= 70 % (the focal), in value AND in
  colour.** The painted models 1-2 calls with one rival; the van 5; the city 11 (a held scale shot); the posters 8-19;
  v6 10 (3 rivals) in value and 11 (4 rivals) in colour; v5 4, v2 3. This is the owner's "few elements of equal
  weight" as a number. Method: staging, "one idea at a time, unmistakably clear" (the Disney animators' staging
  principle, Thomas and Johnston, *The Illusion of Life*, 1981); a background supports the one point of interest and
  never competes with it.
- **R4 The focal is the subject, the story light and the frame's hardest value step, in one place.** The references
  put the subject inside the one light (ref 02) or as a dark silhouette on it (ref 03, ref 01): counterchange, light
  against dark at the one spot. Scene 1: the lit doorway (L* >= 95) with her silhouette in it (L* <= 28), a step of
  >= 65 L*; below the caption band no other step over ~40 L* and nothing within 10 L* of the door's light (the light
  lane's rule: the brightest 5 % below the sky within 0.07-0.15 H of her, `organic/light.md` §5.4). The strongest call
  (value and colour) lands on the subject's box: v6 value yes, colour no; T1-T3 both.
- **R5 Big quiet: >= 65 % of the frame quiet at a squint, in two connected masses: the sky field (>= 30 %, the caption
  band inside it) at the top and the near ground (>= 15 %) at the bottom; the things live in the belt between them.**
  The painted models are 67-91 % quiet with masses of 51-77 % and 12-14 %; the middle third holds the detail (ref 02:
  top 76 / mid 60 / bottom 63 % quiet; ref 03: 86 / 80 / 58). v6: 60 %, 28 + 24, its middle third 34 % quiet. T1-T3 (flat
  values): 86-88 %, 36-39 + 23-33. **Quiet is never empty:** a quiet mass is patterned within +-4-6 L* (painted
  variation, dapples, paving joints, fallen leaves, tone-on-tone things), so "full, never empty" (DIRECTION rule 3)
  still holds; what goes is the contrast, not the content (§7 reconciles the doc rules).
- **R6 How many props: <= 6 named objects read at phone size** (the subject, one big secondary mass such as the hero
  cloud, 1-3 supporting things; the fields, sky, water and ground, are not objects). The references 4-6; v6 about 40.
  **The near frame holds <= 2 props, cut by a frame edge and inside the near shade mass (<= 8 L* from it)**: the
  owner's "a small, subtle hint at the edges" (2026-10-29). **The far side stays full** ("the street along the canal
  ... density", 2026-10-29) as texture inside its band: people in twos and threes, a cafe umbrella, bikes, boats, all
  within +-6 L* of the band and none with its own silhouette at a squint (R2).
- **R7 The caption band sits in the light quiet mass, and the focal sits just under it.** The band (y 290-600) is part
  of the frame's largest light quiet mass, flat (dL* <= 1.5, ink >= 7:1: LAYOUT §1). The focal's centre at **y 860-1200
  (0.45-0.62 H) and x 380-700** (the subject axis), **<= 0.15 W off the caption's centre line (x 520)** and **300-650 px
  below the caption block's bottom (y 556)**: the eye reads the words, then drops once, a short way, to the light. Nothing
  calls between the words and the focal (the sky and the far city there stay quiet), and the story light's glow stops
  >= 10 px outside the band (the light lane, `organic/light.md` §5.4). Why these numbers: LAYOUT's read zone (y
  600-1250) and subject axis; a cut made for ads keeps its key reads above y 1250 (LAYOUT §1); the posters' hero centre
  (0.52 of a poster's height, median) lands near y 1050 (0.55 H) once a poster is extended into 9:16 with its top on the
  band at y 300 (our reading of the city-poster `composition.md` §1 and §4). v6's door (630, 965): inside, its centre
  409 px under the block (its top 292); T1's focal (686, 1002): 446 px; T3, tilted for a bigger sky, (686, 1140): 584 px.
- **R8 One counterweight: one big, soft, quiet secondary mass balances the small loud focal** (the hero cloud in the
  top gutter, y 0-290, and the side gutter x > 945, or the far city's glow by the sun), on the other side of the frame
  from the focal, its pull < 50 % of the focal's (it is never a call), its lit side turned toward the key. Method: the
  "steelyard" balance of unequal masses (a big mass near the fulcrum, a small strong one far out; Payne, *Composition of
  Outdoor Painting*, 1941). The painted models do it with their one big cloud (refs 02, 03: quiet; ref 04: the cloud
  carries the colour, the one rival in colour).
- **R9 Edges: found at the focal, lost elsewhere.** The crispest edges (0.5-1.5 px) and the hardest step only at the
  focal (her silhouette, the door's frame); wherever two masses are within ~10 L*, the edge goes soft or lost (the
  cloud's base, the far city into the haze, the reflection's lower edge, the facade into the boat): the recipe book's
  edges (`PAINT_RECIPES.md` §1.6) given a place, and the playbook's "edges are lost and found" (ORGANIC, NOT
  GEOMETRIC).
- **R10 A real dark mass: the darkest value group is 15-40 % of the frame, mean L* <= 45, with >= 80 % of it in one or
  two connected masses below the band.** The references' dark groups: 17-36 % at L* 8-35, 89-100 % in two masses; the
  posters 17-33 % at L* 33-41; v6 16 % at L* 45 in scattered pieces (64 %). T1 39 % at L* 43 (the gentle option, its
  near quay in a mid-dark shade), T2 17 % at L* 32, T3 31 % at L* 27 (the references' key). The owner: "dark and
  contrast are great but that’s very doable that’s just color palette and selection?" (2026-10-30). Clashes with
  CRAFT §f.8 (§7).
- **R11 Colour follows the value plan:** the hot accent (the saturated or warm-lit colour: the one colour key's "one
  hot accent", playbook PROPER LIGHT) only at the focal; everywhere else tone-on-tone inside its mass (dE <= 6-8). v6's
  yellow upper windows are the colour formula's #1: lit windows on the far side get +6-8 L* inside the facade's mass,
  never a saturated yellow, unless one of them is the beat's subject (W, later in S1).
- **R12 Pip and the eye path:** Pip hides inside a mass of the busy belt, tone-on-tone, >= 250 px from the focal and
  never between the words and the focal or on a leading line into it (v6's post under the door sits on the door's light
  column).

**The beat's focal moves only with the story.** One focal at a time (DIRECTION rule 2): when the beat moves to another
subject (S1's push-through into the window W), the value plan prepares it (W's pane is the second lightest thing on
the facade, a step under the door) and the old focal calms as the new one lights. A shot never holds two calls of
equal weight at once.

**For other shot types:** interiors put the two quiet masses on the wall behind the captions and the floor or table;
a close is its own backing plus the subject; a scale shot (the city at sunset is the model) may hold more calls if its
darks stay one mass and its figures read by silhouette; charts are out of scope.

## 5. Scene 1 recomposed: three value thumbnails (`composition_sheet.png`, bottom)

**The view is v2's** (the owner: "our initial angle snd the view frankly wasn’t bad"): the camera on our quay at eye
level, across the canal to the Google building's lit door, the far city and the low sun on the left, the bridge, the
boats on the right; every shape at v6's place (halved to 540 x 960). What changes is the values and the props. Each
thumbnail is flat values (L*), with lost edges where two masses are close and found edges only at the door; the
caption is drawn where the film puts it. Measured with the same script as the references:

| Thumbnail | value plan (L*) | calls (rivals) value / colour | on her | 3 largest masses; pieces | quiet: share, largest + 2nd | dark group | under L* 40 |
|---|---|---|---|---|---|---|---|
| v6 now | (the still) | 10 (3) / 11 (4) | value yes, colour no | 82 %; 31 | 60 %: 28 + 24 | 16 % at 45, scattered | 6 % |
| **T1 one lit door, a shaded quay** (recommended) | sky 80-92, the band 86; facade 52, panes 47 (two lit at 60); door 97, her 24; water 72 with the door's column 90; our quay 42 in the canopy's shade, its lit coping 56 | 1 (1) / 1 (1) | yes, yes | 90 %; 4 | 88 %: 36 + 29 | 39 % at 43 | 1 % |
| **T2 counterchange** | the far side backlit into one dark band (facade 31, towpath 34, boats 27); door 97, her 16; light water 82 with the column 95; our quay light and quiet (62-66) | 3 (1) / 3 (1) | yes, yes | 94 %; 4 | 87 %: 36 + 33 | 17 % at 32 | 16 % |
| **T3 low key, a bigger sky** | the sky darker at the top (60 -> 77 in the band -> 91 by the sun); a dark cloud (52) lit on the sun's side (83); facade 37, door 97, her 14; dusk water 52; our quay one deep mass (25); the camera tilted up 140 px (at 1080) | 1 (1) / 1 (1) | yes, yes | 89 %; 6 | 86 %: 39 + 23 | 31 % at 27 | 45 % |

**What the three share** (each a rule of §4 made concrete):
- One call: the lit door with her dark silhouette in it, its bloom, its pool on the towpath and its broken light column
  in the water pointing at it (R3, R4). The caption sits in the sky's quiet light mass; the eye drops a little right to
  the door, whose top is 284 px under the caption block (T1, T2) or 424 px (T3) (R7).
- Two quiet masses: the sky (one gradient, flat in the band, one soft cloud top right as the counterweight, the sun one
  step off its sky by the far city) and our quay (R5, R8).
- Our quay keeps one cafe table and one chair, cut by the right edge, inside its mass; its paving joints, dapples and a
  few fallen leaves at +-3-6 L* (R5, R6). Gone: the tree, its grass, the planter with pennants, the crate, the potted
  plant, the bench, the post box, the low wall, the fern pot, the top-left leaf branch.
- The far side is full but quiet: the facade one mass with its panes tone-on-tone (two lit warmly but subdued, no
  saturated yellow), the towpath's people, umbrella and bike as texture in their band, one boat; Pip on the boat's
  cabin roof, tone-on-tone, 300 px right of the door (R6, R11, R12).

**Which to take into v7:** T1 by default: it is the light lane's rig (`organic/light.md` §5: the lit door the story
light, the low sun the key, our bank under a canopy's shade), it passes all ten checks (its dark mass, L* 43, sits at
R10's gentle edge and inside CRAFT §f.8's "near world in mid-tones"), and it changes the least of what the owner
liked. **T3 is the look test to show beside it**: the references' value range (45 % under L* 40), a bigger sky,
the most like refs 02 and 03; it needs the owner's call on CRAFT §f.8 (§7). T2 is the most graphic and the boldest
"one light in a dark band" (ref 02's plan), but it turns the far side, where the owner wants density, into a dark band
whose life must read as lit windows and silhouettes: keep it as an option for a night scene.

**For the v7 still, concretely** (scene 1, on v6's code; numbers at 1080 x 1920): remove the near props listed above
and the leaf branch; put our quay under the canopy's shade as one leafy-edged mass from about (0, 1200) to (1080, 1370)
down to the bottom edge (L* ~42-45 in T1's plan; the light lane's 55 -> 42); keep one table and chair at the right
edge, cut by it; dim the upper windows to the facade's mass (+-6 L*, two panes at +8, no saturated yellow) and the
yellow side panel to the facade; the far towpath's life tone-on-tone within +-6 L*; one boat hull; the man, the duck
and the cat at most one of them, tone-on-tone; Pip off the post under the door, onto the boat; one hero cloud in the
top-right gutter with the far deck and streaks within +-4 L* of the sky; then run `composition_study.py frame` (§6) and
look at it at phone size beside refs 02 and 03.

## 6. The check (`composition_study.py frame`)

`python3 -B docs/look/organic/composition_study.py frame STILL.png --caption --subject 0.495,0.435,0.675,0.567`
(`--caption` takes our burned-in caption out first; `--subject` is the subject's box as fractions of the frame).
It prints one line per check, `ok` or `WARN`, and the darks as information. On v6 it WARNs on 9 of 10 (R1 x2, R2, R3 x2,
R4 colour, R5 x2, R10; R7 passes); T1, T2 and T3 pass all 10. It is a working prototype of the
`check_composition.py` that `LAYOUT.md` §8.4 lists as to build; it would join `LAYOUT.md` §6's checks once the owner
approves the rules. Its thresholds are §4's numbers; calibrate them again on the first painted v7 still (the
thumbnails are flat, so a painted frame's quiet share will fall toward the references' 67-91 %).

## 7. Doc clashes found (flagged for the orchestrator; not edited here)

The owner's newest note (SCENE COMPOSITION, 2026-10-30) outranks the older doc rules below; each needs a reconciling
edit in its own doc.
1. **"One quiet field" and "no hole bigger than the caption band"** (DIRECTION rule 3; `LIFE_AND_DENSITY.md` §0 and §2:
   "The quiet field is ONE band touching the top or bottom edge", "no empty patch over ~200 px across", "the biggest
   single flat region <= 20 % of the frame apart from the quiet field", "One quiet field, the rest loaded"; `LAYOUT.md`
   §1's "the one quiet field" row, 15-35 %, "in at most one of the thirds") against "big quiet areas" (R5: two quiet
   masses, the sky >= 30 % and the near ground >= 15 %, ~65 % in all; the references 67-91 %). **Proposal:** up to two
   quiet fields, one touching the top edge (the sky, with the band) and one touching the bottom edge (the near ground),
   the things loaded into the belt between them (the "calm only at a frame edge" spirit kept); a quiet field is always
   patterned (+-4-6 L* of painted variation and tone-on-tone things), so it is never a "hole"; a hole stays what has no
   content at all.
2. **"12+ distinct props" for a wide exterior** (`LIFE_AND_DENSITY.md` §1's table, as examples) against R6's <= 6 named
   objects at phone size. **Proposal:** the 12+ things stay, as texture inside the belt's mass (no own silhouette at a
   squint); <= 6 read as named objects.
3. **The darks** (`CRAFT.md` §f.8, owner-decided 2026-10-29: "6-10 % of the frame under L* 40 in >= 120 pieces ... the
   near world in mid-tones") against R10's real dark mass (the references' darkest group 17-36 % at L* 8-35 in one or
   two masses; the owner 2026-10-30: "dark and contrast are great"; the light lane's relit v6 already 14.8 % at dose 1.0
   and 23.9 % at 1.6, `organic/light.md` §0). **Proposal:** keep the small darks at the focal belt (windows, the hull,
   her silhouette) as f.8 says, and allow one or two big quiet dark masses below the band; the owner picks the key on
   T1 (inside f.8) against T3 (the references' key) in the look test.
4. **Calm below the skyline <= 5 %** (`LAYOUT.md` §8.2, a proposal from the posters: "posters 1-3 %, v2 19-31 %")
   points the other way from R5. **Proposal:** retire it: the posters' loaded lower half is exactly the 8-19 calls the
   owner now calls busy in a film frame.
5. **The near frame "dark, detailed masses cut by >= 2 edges"** (`LAYOUT.md` §8.2, a proposal) against R5-R6 (the near
   ground one quiet mass, <= 2 props, the owner's "small, subtle hint at the edges"). **Proposal:** "dark and quiet, <=
   2 props cut by the edges".
6. **CRAFT §b's check** (salience peak/median >= 2.4, background <= 1.4, top-10 % mass >= 19 %) does not count
   competitors: v6 passes all three (2.61, 1.15 and 20.0 % at 540 px, the caption rows out) while ten things compete,
   and two references fail its peak/median (ref 04 2.02, ref 01 1.59 at 400 px: a big glowing mass lifts the median).
   **Proposal:** add R3's calls (<= 3, one rival, the #1 on the subject in value and colour) to CRAFT §b's check and to
   LAYOUT §6, and keep peak/median as information.

Not a clash: the playbook's "the street or quay across the water full ... many small things in the calm tier" is R6's
far-side texture; DIRECTION rule 2's tiers are R3-R4 in numbers.

## 8. Practice behind the rules (methods only) and licences

- **Notan** (Japanese "dark-light"): the distribution of value masses that carries a composition, designed as flat
  dark and light shapes before any shading; brought into Western teaching by Arthur Wesley Dow, *Composition* (1899),
  whose principles of composition include subordination (one dominant, the rest serving it). Public domain.
  [Wikipedia: Notan](https://en.wikipedia.org/wiki/Notan); [Project Gutenberg #45410](https://m.gutenberg.org/ebooks/45410).
- **Unequal masses and the steelyard:** Edgar Payne, *Composition of Outdoor Painting* (1941): a balance of two unequal
  masses with the focal near the fulcrum; three-spot and other armatures; masses placed by plane (foreground, middle,
  background). [Muddy Colors: 15 types of composition](https://muddycolors.com/2021/04/15-types-of-composition).
- **Staging:** one primary point of interest per frame, secondary elements supporting it; the layout and the background
  reinforce the focal; empty space around the character gives the eye room (the animation staging principle,
  Thomas and Johnston, *The Illusion of Life*, 1981; teaching pages:
  [Brian Lemay, staging](https://www.brianlemay.com/Pages/animationschool/animation/lipsyncbook/staging.html),
  [Wave Motion Cannon, staging](https://wavemotioncannon.com/2017/05/27/animation-principles-staging/)).
- **Background value against the character:** when the background's values sit too close to the foreground's, the
  subject is hard to pick out; block shapes and values first so the background steers attention
  ([Clip Studio Tips, backgrounds that boost characters](https://tips.clip-studio.com/en-us/articles/7156)).
- **Libraries** (no new install; all already used by our QA scripts): NumPy (BSD-3-Clause), SciPy (BSD-3-Clause),
  scikit-image (BSD-3-Clause; multi-Otsu, peak finding), OpenCV (Apache-2.0; inpainting, resizing), Pillow
  (MIT-CMU/HPND; drawing). The sheet's labels use Inter (SIL Open Font License 1.1). All fine for a commercial channel.
- **What we do not take:** any reference's layout, motif or palette; the posters' tour of icons in a film frame; a dark
  sky with white captions (DIRECTION rule 10 allows "white on dark", but our ink-on-sky captions are part of the one
  look: a separate decision).

## 9. Rerun

`python3 -B docs/look/organic/composition_study.py all` (from `video/`; ~3 min on one core: the thumbnails into
`/tmp/organic/composition/thumbs/`, the maps into `/tmp/organic/composition/maps/`, then `composition_metrics.json` and
`composition_sheet.png` here). Deterministic: no randomness except two seeded generators in the thumbnails' drawing;
the same inputs give the same files. `COMP_SCRATCH=/path` moves the scratch.
