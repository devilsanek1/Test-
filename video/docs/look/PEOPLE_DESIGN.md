# PEOPLE_DESIGN: how we draw people (direction C with the LASH face, in use for now)

**IN USE FOR NOW (owner, 2026-10-30): direction C, MODERN GRAPHIC, with the LASH face.** The owner picked C "except
the face that looks messed up", then, on six new faces (`people_design/faces_graphic.png`, `faces_graphic.md`): "It’s
better let’s keep it for now / We will iterate more later on". So the people we draw now:
- **Body, shapes, light, clothes, hair:** direction C as in `people_design/dir_graphic.md` (about 7.8 heads, rounded
  polygons in two flat tones, crisp, no outlines; the styling from `people_design/fashion.md`; teal only on her).
- **Face:** LASH (closed-eye lash lines, one flick each, a short soft nose hook; in profile the hair tucked behind the
  eye), from `src/look/people_dirs/graphic_faces/` (`FaceOpt`); under ~200 px tall it drops to EDGE (the contour only);
  sunglasses and caps are accessories some people wear, never everyone; her as the "you" often seen turned away (TURN).
- **Still to iterate later** (the owner): the face, the stiffness of poses and limbs, a level-of-detail switch for small
  figures (dir_graphic.md §8), back views for the supporting cast.
§5 below was written for direction A before the pick: superseded where it differs from C; its research-based rules
(proportions, wardrobe by setting, poses) still guide.

**Status (2026-10-30): the people study's decision page. The design system in §5 is a DRAFT until the owner picks a
direction** on `people_design/directions_compare.png`. A look doc: it ranks below the playbook, `DIRECTION.md` and
`CRAFT.md` and changes no rule by itself; between look docs it wins on people (their bodies, faces, hair, clothes and
poses), and §7 lists what it would ask of the docs above it. It answers the playbook's people bullet: "people get their
own deep design research (a design system: proportions, faces-by-pose, hair, wardrobe by context, palette) before the
next film draws anyone".

**The evidence**, all in `people_design/` next to this file:
- `directions_compare.png`: the three directions side by side with our current her, all on the same panel, ground and
  plate: her autumn city evening look at 640 px (front 3/4, from behind), her face magnified, the cast at film size
  (200 px), her in the painted still v6's doorway, a verdict per column. Rebuilt by `CmpSheet`
  (`src/entry-look-people-compare.tsx`, §8).
- `diagnose.md` + `diagnose_sheet.png`: every person we have drawn, at one height, and why they read old.
- `design_research.md`: the craft, as numbers (15 sources). `fashion.md` + `fashion_board.png`: what 20-30-year-olds
  in New York and Los Angeles wear in autumn 2026, as shapes (15 sources).
- `dir_editorial.*`, `dir_painterly.*`, `dir_graphic.*`: the three direction tests, each a sheet, its rules and an
  honest note.

Units: H = a figure's height, crown to sole (1000 units in the engines); h = the skull, crown to chin; px = pixels in
our 1080 x 1920 frame. Our people are mostly 130-220 px tall (the "you"), smaller in the mid and far ground, and seen
from behind, in profile or in 3/4.

## 0. The owner's brief (verbatim)

- "One thing we I don’t like about people on our design is there is a lot style involved like we need to draw people
  that are beautiful and pleasant and the clothing is appealing. Our. Current design is very old style and frankly
  ugly so it’s tricky I think it will require its own deep research" (2026-10-30)
- "Yes then people I think we should target 20-30 yo today with styles that are just cool and appealing to look at so
  think instagram infkuebcers, New York, Los Angeles, including hair clothing and perhaps less of faces like faces we
  need to find a way to draw in a more generic way" (2026-10-30)
- "Another bit is humans we paint - they should be better / ... On the video the person is not substantially
  different than yours but certainly more refined and clean and more fluid" (2026-10-29, on the 9:16 motion
  reference's girl, `refs_human_scale/04_cloud_beast_girl_strip.jpg`)

So people must be **beautiful and pleasant**, dressed and styled like **cool 20-30-year-olds in New York and Los
Angeles today** (hair and clothes), with **generic faces**, drawn **refined, clean and fluid**. The playbook's rules
still frame it: people small and simple, seen from behind, in rear 3/4 or in profile, acting with their pose; only the
one "you" near the camera, ~130-220 px tall; no outlines; one flowing element.

## 1. Why ours read old (the diagnosis, `diagnose.md`)

1. **Body (hurts most):** 3.7-4.9 heads (the references 6.7-7.4), a round head 0.8x the shoulders' width, no neck, a
   tombstone torso on bar legs: the 2012-2018 pictogram person, copied from reference 1's crowd texture. A toddler,
   even filled black.
2. **Clothes:** one sack coat plus job props; what reads as a garment is 2010s; the refined her wears the 2014-2016
   autumn uniform (a belted A-line coat, tights, ankle boots, a tube scarf, a bun).
3. **Hair:** a ball or a helmet in one flat colour: no cut, parting, volume or sheen.
4. **Colour:** people painted in the set's own tokens, dusty patchworks with no neutral base; the refined her a teal
   column.
5. **Pose:** upright, symmetric, arms hidden or tubes, clones; no hand with somewhere to be.
6. **Render, face, detail:** clip-art outlines or lightless cut paper; the emoji face; detail on badges, not on hair,
   hems and shoes.

The refined her (`src/lib/figure`, still v6) fixed most of the body; her outfit, hair, colour and stiff back views still
read old. Never over-correct into corporate Memphis (tiny heads, bendy limbs, purple skin): just as dated.

## 2. What the research says (the key rules)

- **Proportions:** a real adult is ~7.5-7.7 heads; 8 reads graceful. Legs about 5 % longer than average were rated most
  attractive across 27 nations, excessively long ones less (so never the 9-10-head fashion croquis). A visible neck,
  real hands (~0.1 H) and feet (~0.15 H). A big head reads young and cute.
- **Shapes:** straight against curve on every part; bulges offset across a limb, never mirrored; one big, one medium
  and a few small shapes; no twins (two limbs doing the same thing); every limb tapers; corners only where a material
  is crisp.
- **Silhouette:** a design must read filled black at its real pixel size, with clear negative spaces and no tangents.
  At 130-220 px only the silhouette, the head's size, the hair's shape, the value pattern, the shoes and one accessory
  survive.
- **Value and colour:** dark at the feet, light at the chest and face (a game studio's "read hierarchy"); one big value
  shape per person; an outfit is a tonal base plus at most one accent; skin is warm and its shade turns toward red,
  never grey or violet; the hair is the head's darkest mass.
- **Hair is the face from behind:** one designed mass, 0-2 secondary masses, one sheen band ("healthy hair" is the
  season's word). Its outline carries the identity a face would.
- **Clothes:** 2-4 masses; ONE roomy piece against compact ones; current lengths; one finish detail; folds as value
  slivers. **The 2026 line is long, clean and balanced** after five years of oversize; **the feet are the tell**
  (slim, low shoes; chunky sneakers now read dated); New York is structure and darks, Los Angeles ease and light; draw
  the durable core (2+ years), never the micro-trend.
- **Faces:** an averaged face is reliably attractive; a simple face invites the viewer in (a mask they wear); a blank
  frontal oval on a believable body, or dot eyes on adult proportions, read eerie. A generic face that reads beautiful
  has three things: a designed contour (the profile, the cheek's sliver), light on the head, and identity from hair and
  accessories (sunglasses are 2026's street-style accessory and the most current generic face).
- **Pose:** contrapposto, one hand anchored (a pocket, a strap, a phone, a cup), the gaze into the scene, a walk with
  little arm swing. Never the corporate-Memphis repertoire (pointing, waving, jumping, open arms).

## 3. The three directions (three lines each)

**A · CLEAN EDITORIAL** (`dir_editorial.*`; `src/look/people_dirs/editorial/`). Fashion-illustration proportions (8.1
heads, the length in the legs) on one posed 3D model per person; each form one crisp shape with ONE soft light
gradient. Faces: the profile line, one lash, sunglasses, the lost profile. The most beautiful and current; model-tall.

**B · SOFT PAINTERLY** (`dir_painterly.*`; `.../painterly/`). 7.8 heads on a soft 3D form painted in 2-3 planes from a
scene rig (a warm key, a cool sky rim), soft inside a crisp silhouette. Faces: lowered lids, soft brows, a lip tone.
Sits softest in paint, but reads as soft 3D at 640 px (inflated cloth, mittens), bends "people crisp", renders slowest.

**C · MODERN GRAPHIC** (`dir_graphic.*`; `.../graphic/`). 7.8 heads; every form one rounded polygon in two flat tones
with a crisp computed terminator. Face: ONE mark, the brow ridge's shade running into the nose. The house rule exactly,
crispest at film size and cheapest; but stiff tube limbs, a mannequin face up close, and hair drawn per view.

| | NOW (the refined her) | A editorial | B painterly | C graphic |
|---|---|---|---|---|
| beautiful, pleasant | no | **best** | good | good |
| current (20-30, NY/LA) | no (2015) | yes | yes | yes |
| generic face that is not blank | one closed-eye line | **profile, lash, sunglasses** | lids, lip tone (soft) | one mark (severe up close) |
| refined, clean | clean | **yes** | soft, not clean | **yes** |
| fluid (pose, line) | profile only | **yes** | yes | stiff |
| fits DIRECTION rules 4-5 | yes | the playbook's "soft gradients" | bends "crisp" | **exactly** |
| reads at 200 px | as a teal column | yes | yes | **crispest** |
| every view from one model | no | **yes, hair included** | yes | body yes, hair per view |
| render cost | low | medium (25-40 paths) | high (~0.25 s a big figure) | **lowest** |

## 4. The recommendation: A, CLEAN EDITORIAL (a draft until the owner picks)

**Why A:**
1. **It answers the first word, "beautiful".** Side by side (`directions_compare.png`), A is the most attractive and
   the most current: elegant adult proportions, slender real hands, glossy hair with a sheen, garments with fit, length
   and drape, a calm, confident pose. It stays simple: at 200 and 140 px it reads by the hair's outline, the hem
   lengths, one value split and the feet.
2. **It is "refined, clean and fluid", as the playbook already describes the motion reference's girl:** "few shapes
   lit warm on one side with soft gradients, no outlines". The silhouette stays crisp, so people stay "crisp and
   clean" in a painted world (playbook PAINTED PIECES).
3. **Its faces are generic and still beautiful:** the profile line, one lash, sunglasses, the lost profile, the head
   bowed, with a budget by size; the close 3/4 face with lowered lashes reads serene, never blank or creepy.
4. **One 3D model per person:** every view and pose comes from a few numbers, and the hair is a shell on the same
   model, so a turn needs no hand-drawn in-betweens (C's hair is drawn per view).
5. **It holds in the scene:** at the old her's spot in v6's doorway she reads as a young woman in a coat and a midi
   skirt, with the hero colour as the doorway's accent.

**Why not B:** at 640 px it reads as soft 3D more than paint (inflated cloth, few folds, mitten hands); the blur inside
every figure bends DIRECTION rule 4's "people crisp" and the playbook's "people stay crisp and clean"; and it is the
heaviest to render at 60 fps. **Why not C**, the close second: it follows the house rule exactly and costs the least,
but its tube limbs are stiff (not "fluid"), its close face is severe, and its hair needs in-betweens for every turn. Its
finish is right for small people, so A takes it there.

**What A must fix** (its own honest note): **model-tall** (8.1 heads; the system below draws the "you" at 7.8-8.0 and
strangers at 7.4-8.0); **the sticker risk** (light from the scene's rig, tested in a look clip); **small 2.5D seams** at
640 px (invisible at film size; fix only for close shots); **a small repertoire** (no sitting, leaning or crowds yet);
**stills only** (motion and the cost of 60 fps untested).

**The grafts:**
- **From C (graphic):** two flat tones with a crisp terminator for people under ~130 px (A's gradient is a few pixels
  there); a level-of-detail switch with a shape budget by size; the black-silhouette test at 140 and 200 px; the rim on
  the subject only (DIRECTION rule 5); the cap's brim shadow as a face option; the camera that bows hems and shows soles
  from just above (`design_research.md` C10).
- **From B (painterly):** light from the scene's own rig, read off the forms in camera space, so a figure keeps its
  light when it turns or is mirrored (A and C mirror the key with the figure today); the warm, saturated skin band along
  the terminator in close shots; long hair that hangs straight below the skull's widest line, never a bowl; and, as a
  proposal to test, far crowds under ~30 px as soft painted dabs, the owner's depth balance ("the close objects are
  more sharp while further objects are more like brushes and painting", 2026-10-30).
- **Kept from the refined her (`src/lib/figure`, `paint_recipes/people.md`):** the wind spec for the flowing element,
  the walk spec, the local light (a phone, a lit door) that lights only what faces it and is near it.

## 5. The people design system (DRAFT: direction A with the grafts)

Every film still draws its own people (playbook: no reusable assets); this system is the grammar they share. "Built"
marks what A's code already draws; the rest is to build.

### 5.1 Proportions

| (H = 1000, heights above the sole) | woman: the "you" | man | strangers |
|---|---|---|---|
| skull, crown to chin | **0.125-0.128 H (7.8-8.0 heads)**; A's sheet is 0.123 (8.1) | 0.123-0.127 H (7.9-8.1) | 0.125-0.135 H (7.4-8.0) |
| the head with its hair | at most 0.14 H | at most 0.14 H | never above 0.14 H, never below 0.115 H |
| chin / shoulder line | 0.873 / 0.806-0.818 | 0.875 / 0.800-0.815 | |
| visible neck | 0.04-0.05 H long, 0.042-0.046 H wide, slanting forward 10-15 degrees | 0.054-0.058 H wide | |
| shoulders (outer) | 0.228-0.240 H, sloping 12-18 degrees | 0.26-0.275 H, sloping 8-12 degrees | +-0.015-0.02 H (slim, average, athletic, curvy) |
| waist / hips | 0.15-0.16 H at 0.63 H / 0.20-0.21 H at 0.52 H | 0.18-0.19 H / 0.19-0.195 H | +-0.015-0.02 H |
| hip joint / crotch / knee / ankle | 0.548 / **0.490** / 0.292 / 0.040 | 0.540 / 0.482 / 0.288 / 0.042 | crotch 0.47-0.49 (ordinary legs) |
| upper arm / forearm / hand | 0.178 / 0.146 / **0.096-0.098** | 0.186 / 0.152 / 0.104 | |
| foot (a shoe adds 0.008-0.015 at the toe) | 0.148 | 0.158 | |
| limb taper | thigh : ankle ~3.4 : 1; upper arm : wrist ~1.8 : 1; the calf's outer peak at ~0.235 H, the inner ~0.03 H lower | | |

- The extra length goes into the legs only; the torso stays real. A man stands ~8 % taller than the woman beside him.
- The head is an egg, never a circle: a round cranium against a straight jaw, a flatter face plane, a nape; from
  behind it is ~0.37-0.44 of the shoulders' width (our pegs 0.76-0.91, the refined her 0.53). Ears show only where hair
  is tied back or short.
- Variety: no two neighbours share a build; a crowd of six has at least four silhouettes.

### 5.2 Shapes, finish and light

- **One closed smooth loop per form,** no outlines. True lines only for things that are lines: a strap (~0.0075 H), a
  sunglasses arm, a lash (~0.0042 H), a cable. Corners only where a material is crisp: a hem, a cuff, a sole, a lapel,
  a brim, a bob's cut, a bag's corner, a lens.
- **Rhythm:** straight against curve on every part (the shin straight, the calf curved; the back long and straight, the
  chest curved; a straight hem under a curved hip); bulges offset across a limb; one garment mass 45-60 % of the
  figure's area, the next 20-35 %, the small shapes the rest; no twins (the arms differ by >= 10 degrees at the
  shoulder or >= 15 at the elbow; the feet by >= 10 degrees or in position).
- **The silhouette test:** filled black at its real size (the "you" at 140 and 200 px, a stranger at 60 px), the
  action, woman or man and the garment type read; two negative spaces >= 2 px for the "you" (arm and waist, the legs or
  under a hem); no tangents (edges overlap >= 3 px or part >= 2 px).
- **The finish (A, built):** each form is ONE soft linear gradient across its narrow axis toward the key (the lit
  colour's highlight at 0, the base at 0.3, the shade from 0.8 to 1); the parts of one garment share one gradient, so
  no seam shows. Crisp flat shapes on top only where a form casts on another (the head's shadow on the neck, 0.13 h
  down) or a material is crisp (the hair's sheen, a sole band, a stripe, a lens's glint, a fold).
- **The ramp (A, built), from one lit colour per material in CIE L\*C\*h:** highlight L\* +4.5, its hue up to 5 degrees
  toward the key's gold; shade L\* minus max(5, 0.17 L\* + 1.5) (skin max(6, 0.15 L\*), hair max(4, 0.2 L\*)), the hue up
  to 6 degrees toward warm red, never toward grey or violet; deep (cast shapes, a garment's inside) 1.75x the shade
  step; sheen L\* +9 (hair +13, satin +14, leather +18). The hero colour keeps its hue.
- **Level of detail (from C, to build):** at >= 130 px the gradient finish; at 60-130 px two flat tones per form (lit
  and shade, a crisp terminator from the same model: DIRECTION rule 5's flat tones); under 60 px one or two flat values.
- **Light (from B, to build):** the key and its colour come from the set's rig and are read off the model in camera
  space, so a figure keeps the scene's light when it turns or is mirrored. **Rim:** only on the subject (DIRECTION rule
  5): a thin warm edge on the key side (+12-14 L\*, toward gold, ~0.9 % H). **Local light:** a phone or a lit door
  lifts only the planes that face it and are near it (+10-14 L\*, at most 12 degrees toward its hue; a phone's light
  clipped to ~0.25 H round it), never the whole silhouette (`people.md` §b.5). **Skin in close shots (>= 300 px):** a
  warm band along the terminator, C\* x1.25, 10 degrees toward red, 0.004-0.006 H wide. A contact shadow under the
  feet, multiplied.

### 5.3 The face rule

Faces are generic by design, never blank: a **designed contour**, **light on the head**, and **identity from hair and
accessories**. A face never looks at the camera. The default views stay the playbook's: from behind, the lost profile,
the profile; a front view is rare.

| the skull on screen | figure (at 7.9 heads) | what the face may show |
|---|---|---|
| < 12 px | < ~95 px | nothing: the facing reads from where the skin meets the hair |
| 12-18 px | ~95-145 px | ONE of: the profile line (three soft bumps: nose, lips, chin; the neck's notch), the lost profile's cheek sliver, sunglasses (a dark band) |
| 18-40 px | ~145-320 px | the above plus at most ONE mark: a lash (closed: serene or looking down; open: attentive) in profile or lost profile, or, in a 3/4 front face, the nose's shade (the "T-shade") |
| >= 40 px | close shots, rare | the 3/4 face with both lashes lowered, the T-shade and a lip tone (a tone, never a line); or sunglasses, a cap's brim shadow over the eyes, hair over one eye, the head bowed (**the owner's call**: it goes past "only the mascot has a face") |

- **The profile** (h = crown to chin): the brow at 0.42 h; the nose straight or a touch concave, its tip at 0.68 h,
  0.07-0.09 h proud (men 0.09-0.11), turned up a little; the lips just behind the line from the nose's tip to the chin;
  the chin's front 0.02-0.03 h behind the brow's; the jaw a near-straight line rising 15-20 degrees to its angle.
- **The lash:** one tapered stroke ~1 px wide at film size (0.42-0.46 % H) in the hair's deep tone, at 0.5 h; closed =
  bowed down with a small up-flick at the outer end.
- **The lost profile:** a sliver of cheek past the hair from the cheekbone to the jaw (0.06-0.10 h at its widest); from
  ~25 px skulls the nose's tip and a lash flick may peek past it.
- **Sunglasses** (oversized, from the brow to the cheekbone): the darkest piece on the head, ONE glint streak on the key
  side, the arm a true line to the ear; about one person in three outdoors in daylight, never every face in a shot.
- **Never:** dot eyes, pupils, eye whites, a mouth line, nostrils, brows drawn as arcs, blush dots, freckle dots, an
  open-eyed 3/4 face, or a blank frontal oval above 12 px.
- **In motion:** a mark fades with the head's turn, never pops; each view holds >= 0.3 s; a blink only on skulls >= 25
  px, and rarely; no lip sync and no expressions: emotion lives in the pose and the head's angle.

### 5.4 The hair library

One main mass, 0-2 secondary masses (a bun, a ponytail, bangs, a tucked lock), 0-3 loose locks that break the outline
(only at >= 200 px), and ONE sheen band (a crescent +12-18 L\*, 0.06-0.10 h thick, 20-35 % down from the crown on the
key side; on curls 3-5 small sheen arcs instead). Volume beyond the skull: sleek 0.01-0.02 h, normal 0.03-0.07 h,
curls and coils 0.15-0.45 h. Long hair hangs straight below the skull's widest line (B); it is never a bowl, a helmet
or a ball. The back view is the showcase: pick a shape whose outline says who it is from behind. Ten styles (fashion.md
§5 has the full drawing of each; A builds four of them):

| | style | who | the shapes | the one detail | built |
|---|---|---|---|---|---|
| H1 | textured ("ripped") bob, side part | W | one mass to the jaw, a little wider at the ends, 3-5 soft uneven notches in the hem | the separated hem (never a tucked-under helmet) | A (bob) |
| H2 | long layers, curtain bangs | W | a long fall resting on the back to the shoulder blades, fuller at the bottom, bangs parted at the centre to the cheekbones | the rounded, bouncy ends; the bangs framing the face in 3/4 | A (long) |
| H3 | claw-clip twist | W | the hair twisted up the back of the head, a clip 0.5 h wide across it, 4-5 ends fanning above the crown, the nape bare | the fanned ends above the clip | |
| H4 | soft low bun with tendrils | W | a centre part, smooth to a low bun at the nape (0.45 x 0.35 h), two loose tendrils in front of the ears | the tendrils (never the severe slick bun or the high ball bun) | |
| H5 | sleek ponytail, low or high | W | tight to the skull (+0.01 h), a strong sheen, a tie, a tapering tail 1.2-1.6 h with a soft S | the gloss and the swing (the flowing element) | A (pony) |
| H6 | boho knotless braids | W | one long mass with 4-7 darker grooves, often half-up; the last 0.3-0.4 h breaks into small loose curls, lighter | the curly ends | C |
| H7 | natural curls | W or M | a cloud 0.25-0.40 h beyond the skull, 6-9 lobes of unequal size, longer at the back | unequal lobes (never a perfect circle) | |
| H8 | textured or French crop, low taper | M | a top 0.06-0.12 h above the skull with 3-4 notches, a short forward fringe; sides and nape a step lighter | the low taper and the choppy fringe | |
| H9 | twists or curls on a taper | M | 6-10 short twists or lobes on top (0.15-0.25 h), the sides faded close | the textured top against clean sides | A (twists) |
| H10 | soft curtains, longer nape (or the overgrown buzz) | M | a centre part, curtains to the cheekbones, the nape touching the collar; the buzz skull-tight +0.015 h | the centre part's curve | C |

- **Colours** (each with its sheen at +13-15 L\*): black `#2B2324`, black-brown/espresso `#3A2B27`, dark brown `#533A30`,
  chestnut `#774D3A`, muted copper `#A25E3B`, honey blonde `#CBA577`; platinum `#DFD6C8` rare. The hair is the head's
  darkest mass and >= 25 L\* from the skin; for blond hair set the head against a darker field.
- A cap (forward or backward, a ponytail through it) or a beanie without a pompom is current and solves hair at small
  sizes; sunglasses pushed up on the hair read current even at night.
- **Never:** the helmet bob, the ball bun on top, the comb-line bowl cut, the severe slick bun, the high skin fade with a
  quiff, the man bun with a full beard, every head the same brown.

### 5.5 The wardrobe, by setting

**The rules for every look:** 2-4 garment masses plus shoes and at most one bag or accessory; ONE roomy piece against
compact ones (their widest widths >= 1.3 apart: a long coat over a slim column, a fitted top over wide trousers); the
outline's distance from the body: compact <= 0.01 H, relaxed 0.015-0.025 H, roomy 0.03-0.06 H, hanging straight from
its support; dropped shoulders on coats, shirts, tees and knits; ONE finish detail that sells the look (an open front, a
hem band, white socks, a half tuck, a cap's brim); folds as 0-1 value sliver per garment at film size; slim, low shoes
with a light sole band (the feet are the tell). The job, the hobby and the mood show through the place, the prop in the
hand and the pose, never a costume (no lanyards, badges, aprons, hi-vis or clipboards as identity). Draw the durable
core; a season's novelty is at most one accent per figure.

Lengths and widths (fashion.md §3.2, in H above the sole): cropped 0.58-0.62; hip 0.48-0.50; an oversized shirt's back
0.44-0.47; a trench or short coat 0.24-0.30; a long coat 0.17-0.20; a midi skirt 0.15-0.22; shorts at the knee
0.28-0.32; trousers to the shoe. At the hem, from behind: a long open coat 0.30-0.32 wide, a wide trouser leg 0.13-0.14,
straight 0.10-0.11, slim-straight 0.085-0.09.

**Autumn city evening** (the New York grammar; any cool city in October): structure, darks, layers.
- *Her (A, built):* an open chocolate wool coat to just below the knee, a cloud-cream knit at the neck, a satin bias
  midi skirt in the film's hero colour, black pointed flats; long layers with curtain bangs (H2).
- *The library* (fashion.md N1-N7): the long open coat over a dark column (one-tone knit and wide trousers) with
  loafers; the trench worn open, its belt untied and its two tails as the flowing element, over slim-straight dark
  jeans and ballet flats; the cropped leather jacket with a funnel collar over a statement midi skirt; the commuter knit
  (below); suede and white socks (him: a boxy suede or chore jacket, a cream tee, relaxed pleated trousers, white crew
  socks, loafers; A built); the leather or suede bomber with slim low sneakers; the long overcoat with a hoodie's hood
  over its collar (winter).
- *Colour:* near-black, chocolate, navy, burgundy, indigo, caramel, a cream layer at the neck; one accent (red flats, a
  burgundy bag).

**Office** (a 2026 workplace for 20-30: a studio, a start-up, a newsroom; indoors the coat is off, so the top layer
shows; composed from the trend sources' New York and Los Angeles pieces):
- *The commuter knit (W):* a fine knit or a boxy sweater vest over a white shirt showing at the collar, the cuffs and
  the hem; wide black trousers; loafers; a big soft tote; wired over-ear headphones (the band over the crown is the
  read).
- *The half-tucked shirt (W):* an oversized button-down (cloud white or a pale stripe), sleeves pushed up, half-tucked
  into slim-straight dark jeans or wide black trousers; ballet flats or kitten slingbacks; an east-west bag in the hand.
- *The light blazer (W or M):* an unstructured blazer worn open over a white tee (the white triangle lights the chest),
  relaxed straight trousers, loafers or slim sneakers, the hands in the pockets.
- *Him:* a quarter-zip or a textured knit polo over relaxed pleated trousers, loafers with white socks or slim
  sneakers; or a chore coat or overshirt over a tee, straight trousers, a crossbody strap.
- *The hand's reason:* a laptop held low, a coffee, a phone, a notebook. *Never:* the suit and tie as the default, a
  headset, a lanyard, the khaki-and-polo "business casual", a figure hunched at a desk unless the story asks.

**Home** (soft, current, still dressed; not in the trend sources, so built from the library's garments and rules):
- an oversized crewneck sweatshirt or a soft knit, wide lounge trousers or a matching knit set, socks (a coloured or
  white sock as the accent) or bare feet; the hair in a claw clip (H3) or a soft low bun (H4);
- on a warm day: a big washed tee over loose shorts, or a tank with a slip skirt, bare feet, the hair loose or in a
  ponytail;
- in the evening: a fine cardigan over a tank, wide trousers; a lamp or a phone as the local light;
- *the hand's reason:* a mug, a phone, a book, a laptop on the knees. *Never:* printed pyjamas, onesies, character
  slippers, a dressing gown worn as a costume.

**Warm coast** (the Los Angeles grammar; any warm place: a beach, a southern city, summer): ease, light and varied
colour, light layers (fashion.md L1-L7).
- *Her:* the big shirt half-tucked into relaxed wide-leg jeans with coloured ballet flats and big sunglasses; or the
  baby tee, relaxed straight jeans, slim sneakers and a cap with the ponytail through it, an iced coffee; or a satin slip
  skirt with an oversized knit and flat sandals.
- *The library:* the athleisure set (fitted leggings and top, an oversized sweatshirt, white socks, slim runners); the
  boxy camp-collar shirt over knee shorts with loafers and white socks (him); the washed tee with tapered cargos and a
  cap; the light blazer over a tee (a warm autumn evening).
- *Colour:* cloud white, butter, washed denim, baby pink, sage, a navy or chocolate anchor; sunglasses on about one in
  three in daylight.

**Dressing a film:** pick the grammar by the place and the weather, never the real city; the "you" wears one look all
film; a crowd of six has at least four looks, two men, four hair styles and the whole skin range; at least two groups in
any crowd of eight or more (a couple, two friends talking, someone with a dog); ages 20-30 unless the story asks.
**Never (dated):** skinny jeans, ankle booties under them, the belted A-line coat with tights and a blanket scarf, the
oversized blazer over baggy jeans, head-to-toe beige, light-wash mom jeans, chunky "dad" sneakers, round blob feet,
micro bags, tiny oval sunglasses, pompom beanies, fedoras, messenger bags.

### 5.6 The palette rule

- **An outfit is a tonal base plus at most ONE accent:** two related neutrals at 2-3 values (cream and chocolate, black
  and denim, white and navy) and one accent piece (a bag, the flats, a cap, a skirt).
- **The film's hero colour belongs to the "you" alone, on ONE mid-size piece** (a skirt, a cropped cardigan, a cap, a
  bag), **never her biggest mass**: no hero-colour column (diagnose cause 4; DIRECTION rule 6, "saturation as confetti,
  never fields"). Nobody else in the film wears it.
- **Value:** dark at the feet (shoes and trousers L\* 15-45), the outer layer L\* 30-75, a light layer at the neckline
  L\* 80-94 that lights the face like a reflector; each person one clear value shape against its ground, so a film picks
  each look's value against its set (a dark coat against a lit doorway, a light shirt against a dusk street).
- **The wardrobe palette, inside the house** (never beige, muddy tan, olive or grey; never pure black or white; a film
  shifts them toward its sister palette): cloud `#F0EAE1`, cream `#E9DBCA`, butter `#F4E2A5`, baby pink `#E9B9B3`, sage
  `#94A68C`, caramel `#B58058`, rust `#AF5A3E`, red `#C7463F`, mid denim `#5781A0`, cocoa `#8B6B5A`, chocolate
  `#664334`, burgundy `#743137`, indigo `#2F4566`, navy `#254161`, warm near-blacks `#3D2C2D` and `#2E2426`.
- **Skin, a real range, warm** (lit / shade): S1 `#EBC8B0` / `#C19984`, S2 `#DDAF92` / `#B8856B`, S3 `#C79671` /
  `#A87250`, S4 `#B17A59` / `#985B3F`, S5 `#8B5A42` / `#78432F`, S6 `#644132` / `#573126`. The shade is L\* x0.8, the hue
  6 degrees toward red, C\* x1.08, so deep skin keeps a readable shade; deep skin gets a soft sheen on its key-side
  planes. Never toward blue, violet or grey.
- **People are never painted in the set's own tokens** (a wall's, a window's or the caption's colour): garments are
  garment colours. In a crowd, accents on at most one person in four, and tier B people calm (C\* <= 25).

### 5.7 The pose library

**Every pose:** the line of action first (one C or S), then the limbs. Contrapposto in numbers: the pelvis tilts 5-8
degrees (the weight leg's hip up), the shoulders 3-5 degrees the other way, the pit of the neck over the weight foot, the
free knee bent 10-25 degrees, its foot 0.04-0.08 H forward or aside and turned out 15-30 degrees. The head tilts 3-8
degrees and turns 10-30 degrees off the torso. One hand anchored, the other loose (the elbow bent 8-20 degrees, the
wrist breaking 10-25 degrees). The gaze goes into the scene. **Never:** pointing, waving, jumping, fist pumps, thumbs
up, a presenter's open arms, both arms straight down, feet parallel side by side, a body square to the camera, both
hands on the hips. An acting beat (a reach, a shrug, a slump, a look up) is one clear pose, then back to calm.

1. **Standing** (A, built): contrapposto, one hand in a pocket (the elbow out 15-25 degrees, the hand hidden) or a thumb
   hooked in a jeans pocket or a hand on the bag's strap; the other loose; front 3/4, or from behind with the head
   turned to a lost profile.
2. **Walking** (A, built as a contact pose; the cycle is to build): a 2-4 degree lean; feet 0.3-0.5 H apart at the
   contact; the free arm swings only +-10-15 degrees, the other anchored (a pocket, a strap, a cup, a phone); the hips
   rotate 8-10 degrees (women) and the shoulders counter-rotate; in profile or 3/4 from behind.
3. **Sitting** (to build): on a step, a ledge, a bench or a café chair: the hips at the seat's height, the back upright
   or a soft C; on a low step the knees up and the forearms on the knees, a cup or a phone in one hand; on a chair one
   leg crossed (knee over knee, or ankle over knee for men) or the feet apart and turned out; from behind on a bench,
   the backrest cuts the back and the head turns to the view. Never slumped unless the story asks.
4. **Leaning** (to build): back against a wall or a rail, the pelvis 0.05-0.08 H off it, the shoulders touching, one
   foot flat against the wall or the ankles crossed, the head turned to the view; or forearms on a railing seen from
   behind, the weight on one leg, the other knee bent: the viewer's own pose before a view.
5. **Looking at a phone** (A, built: the `phone` arm): the head bowed 15-25 degrees, the forearm 60-90 degrees up, the
   hand at 0.68-0.72 H, the phone 0.03 x 0.06 H; the other hand in a pocket or on a strap; standing or walking. Its
   cool glow lights only the face, the hand and the forearm (§5.2's local light).
6. **Carrying** (part built): an iced coffee (the forearm 45-70 degrees up, the cup at 0.62-0.66 H); a tote on the
   shoulder (the elbow clamping the strap); a box held low on both forearms.
7. **Two together** (to build): one leaning in 5-8 degrees, the other laughing (the head back 10-15 degrees); walking
   side by side, the steps out of phase.

### 5.8 Sizes and detail by shot size

| figure height (px in 1080 x 1920) | who | shapes | finish | face (§5.3) | hands, feet | hair | detail |
|---|---|---|---|---|---|---|---|
| >= 300 (close, rare) | the "you" seen close | 12-16 | the gradient; the skin's terminator band; 1-3 folds per garment | the close set (owner's call) | a mitten with a thumb lobe; the index finger split only when it acts; the shoe with its sole band and detail | main mass, 1-2 secondary, the sheen, 2-3 loose locks | one hoop's glint, the leather's streak, a knit's rib band; check the 2.5D seams |
| 130-220 (the "you", a near stranger) | the scale person near the camera | 8-12 | the gradient | profile line or lost profile or sunglasses; one lash from ~145 px | a mitten (+ thumb lobe once the hand is 18 px); shoes with a sole band | main mass, 1 secondary, the sheen | one accessory, one flowing element, 0-1 fold per garment, the look's one detail |
| 60-130 (mid-ground strangers) | tier B life | 5-7 | two flat tones | the skin-hair split; sunglasses from ~95 px | the hand a skin dab; feet a value shape | one mass, the sheen | at most one accessory; no true lines |
| 30-60 (far strangers) | tier C | 3-4 | one or two flat values | none | merged with the legs | one shape with the head | a top-bottom value split, the hem length |
| < 30 (a crowd) | texture | 2 | one value (soft painted dabs: a proposal to test) | none | | | a head dab and a tapered body, split in a V when walking |

- Only the one "you" (or the mascot) stands in the foreground; strangers stay small in the mid and far ground
  (playbook). Faces of strangers stay below the 18 px skull in practice.
- What survives at phone size: a detail >= 0.02 H across with a 15 L\* step, or a true line >= 0.006 H; a detail of skin
  against a garment (an open collar, a bare ankle) needs the same 15 L\* step. Logos, prints, buttons and stitching are
  never drawn under 300 px.
- A's figures today are 25-40 paths with gradients and masks; the LOD switch exists to keep a crowd cheap.

### 5.9 Motion (notes for later; nothing here is tested in motion)

- **One model, every view:** a turn is the model's yaw, so the body, the clothes and the hair turn together (A's hair is
  a shell on the skull); the face's marks fade with the turn; hold each view >= 0.3 s.
- **The walk** (`people.md` §e): 2 steps a second (a stroll 0.55-0.6 s a step); stance 60 %, swing 40 %; the heel
  strikes with the toe up ~14 degrees, the heel lifts to ~34 at toe-off; the hip's down after the contact and up after
  the passing (~3 % H); the cool walk's arm +-10-15 degrees, one arm anchored; the hips and shoulders counter-rotate;
  the planted foot never slides.
- **The idle:** the body still; only the flowing element moves; at most one breath per 4 s (the shoulders +-0.3 % H)
  and one small act per 4-6 s (a head turn, a weight shift), eased. Never a body that sways all the time.
- **The flowing element** is the look's own, ONE per figure: long hair's ends, the ponytail, a satin skirt's hem, a
  coat's open edge, a trench's belt tails (never an added scarf). It runs on `src/lib/figure/wind.ts` (a 1.0 s flutter,
  a 2.3 s gust, the root pinned, the bend travelling root to tip 0.8 of a cycle late); a bob's ends lag 2-3 frames; a
  coat's back hem follows the back calf ~2 frames late.
- **Cloth:** hems swing with the walk; a fold may slide with the limb but never pops in or out.
- **Acting:** one clear pose per beat, then back to calm; no lip sync, no facial expressions.
- **Cost at 60 fps:** measure one "you" plus ten strangers in the first look clip; build each pose once and cache it
  (a pose is a few numbers); strangers take the LOD finish.

### 5.10 The first steps (after the owner's pick)

1. The owner picks on `directions_compare.png` (A, B, C, or a mix).
2. Build the pick into the engine as a shared module (A's components plus the grafts: 7.8-8.0 heads, the LOD switch,
   the light from the rig in camera space, sitting and leaning, the walk cycle, the ten hair styles, the four settings'
   garments).
3. Prove it in a 6-8 s look clip in the v6 set: her walking at ~156 px with 6-10 strangers at 60-130 px, one turn,
   the flowing element in the wind, the cost per frame; judged at phone size.
4. Then land §7's changes in the docs above.

## 6. Watch-outs

- **Beauty is in the restraint:** 8-12 shapes for the "you", one accent, one detail, one flowing element. Adding parts
  is how our people got old.
- **Never one body, never clones:** builds, heights, hair and looks vary in every crowd; a mirrored figure is a clone.
- **The "you" stays a person the viewer can be:** from behind or in profile most of the time, her face reduced, her
  clothes and hair carrying her.
- **Do not chase the micro-trend:** a film lives on the feed for months; the durable core ages slower.
- **The references teach principles, never characters:** we never copy or trace an artist's or a studio's people, and
  name no living artist as a style target.

## 7. What this asks of the docs above it (proposals, not applied: the orchestrator's, after the owner's pick)

1. **The playbook's people bullet:** "round heads" (from reference 1) becomes small egg heads with designed hair at
   7.8-8.0 heads for the "you" and near strangers (round heads only for far crowds under ~40 px); "only the mascot has
   a face" meets the face budget of §5.3 (the owner asked for "a more generic way" to draw faces). Its "few shapes lit
   warm on one side with soft gradients" already covers A's finish.
2. **DIRECTION rule 3** ("no faces") and **rule 5** ("never ... gradients"): a people exception, the soft gradient per
   form above ~130 px (the playbook's own wording) and two flat tones below; the face budget instead of "no faces".
3. **`paint_recipes/people.md`:** §a's proportions (the skull 0.148 -> 0.125-0.128 H, the hip joint 0.505 -> 0.548 H,
   the hand 0.064 -> 0.096 H, the shoe 0.13 -> ~0.155 H); §c's hands and face -> §5.3; §d's "London October evening"
   wardrobe (the belted teal A-line coat, the scarf, tights, ankle boots, the bun) and "the reference teaches refinement,
   not wardrobe" -> §5.5; the flowing element -> the look's own.
4. **`people_design/fashion.md` §7** ("the film's hero colour on its roomy piece"): the hero colour goes on one
   mid-size piece, never the biggest mass (§5.6).
5. **`src/lib/figure/tones.ts`:** the skin's shade turns toward red (§5.6), not toward the shared `SHADE_HUE` 285.
6. **`src/v2r/kit/cast/README.md`** ("Reference 1's grammar: a round head that IS the hair..."): far crowds only.

## 8. Files

- `docs/look/people_design/directions_compare.png` (2400 x 2940): `CmpSheet` in `src/entry-look-people-compare.tsx`
  (code `src/look/people_dirs/compare/Sheet.tsx`, which imports each direction's own components and changes none):
  `GL=angle node scripts/render-frames.mjs CmpSheet <dir> 0 --entry=src/entry-look-people-compare.tsx --concurrency=1`,
  then copy `<dir>/f00000.png`. Rows: her at 640 px (front 3/4, from behind; our current her in rear 3/4 and walking in
  profile, as the still v6 draws her); the faces of those figures magnified 2.4x; the cast at 200 px on one mid-tone
  ground; her in v6's doorway at ~156 px, shown 2x; a verdict per column; the recommendation.
- The study: `people_design/diagnose.md` (+ `diagnose_sheet.png`, `diagnose_sheet.py`), `design_research.md`,
  `fashion.md` (+ `fashion_board.png`, `fashion_board.py`), and per direction `dir_*.md`, `dir_*.png` and its doorway
  script (`dir_editorial_plate.py`, `dir_painterly_crop.py`, `dir_graphic_crop.py`).
- The code: `src/look/people_dirs/{editorial,painterly,graphic}/` (entries `src/entry-look-people-{editorial,painterly,
  graphic}.tsx`); our current her `src/lib/figure/` (as the still v6 draws her: `src/look/paint_s1/V2S1_row.tsx`
  `V6_HER_POSE`).
