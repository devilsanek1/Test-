# Hair, proportions, stature: the recipe (a DRAFT for the owner, 2026-10-30)

**Status: a draft until the owner picks from job 2's stills** (rendered: `stills/`, read `stills/STILLS.md`; what they
changed in this recipe: its last section, "Changes from the stills"). Once picked it replaces `../../PEOPLE_DESIGN.md` §5.1
(proportions) and §5.4 (the hair library), and the stance and motion parts of §5.7 and §5.9. A look doc: it ranks
below the playbook, `DIRECTION.md` and `CRAFT.md`, and inside the people lane it adds to direction C with the LASH face
(`../dir_graphic.md`, `../faces_graphic.md`), changing only what is written here. The evidence is `RESEARCH.md` (next
to this file): findings F1-F16 and the references, measured.

**The owner, verbatim (2026-10-30):** "We need to iterate on it more and improve the hair and the proportions and
stature / I will send you more references when it come to hair it's never really static or like one firm it's always
a little messy, unstructured wavy / Research the haircuts and the physics of hair and let's make sure it's the most
pleasant and modern recipe we have". The playbook's new rule: "Hair is never static or one firm shape".

**Units:** H = the figure's height, crown to sole (1000 in the engine). u = the skull, crown to chin (the unit of
`hair.ts`; the crown at y -0.5, the chin at 0.5 from the skull's centre). Head-unit landmarks below the crown, for her
build: the chin 1.0 u, the shoulder line 1.42 u, the collarbone ~1.5 u, the bust ~2.1 u, the shoulder blades' lower
edge ~2.2 u, the waist ~2.9 u. px = pixels in the 1080 x 1920 frame; at film size 1 u is 17 px (a 130 px figure) to
28 px (220 px); 1 px is 0.035-0.06 u.

## 0. The recipe on one page

1. **A head of hair is a base mass plus a few locks.** The base mass carries the cut's silhouette (who she is); 2-7
   tapered locks in three sizes (big, medium, small) and 0-4 wisps carry the life. Studios build hair the same way,
   coarse to fine, and physics clumps it the same way (F5, F6).
2. **Every lock is a tapered ribbon on a curved spine:** widest a quarter of the way down, tapering to a point over its
   last third, with one to three S-bends. Never a straight strip, a blunt end or a tube curl.
3. **The silhouette is clear but broken:** at least two locks break the outline, at least one gap shows what is behind,
   the tips end at uneven heights, the two sides differ. "Designed, but not over-designed" (F1).
4. **Texture is a helix:** straight hair a soft S, wavy an S-wave (looser at the root, tighter at the ends), curly a
   chain of loops, coily a lobed cloud (F8).
5. **Gravity wins past 5 cm:** hair shorter than ~0.2 u stands out and holds its shape; longer hair rises 15-20 degrees
   off the scalp and turns down within 0.2-0.3 u, then hangs and drapes over the shoulders (F7).
6. **Hair is lit as a form:** two flat tones and a crisp terminator, a deep tone only in gaps and under overlaps, and a
   sheen that crosses each lock and repeats on each wave crest (F13, F14).
7. **Hair always shows its state:** calm, a breeze, a walk, a turn; the root pinned, the tips moving most, curls keeping
   their curl, every head in a shot in the same wind (F9-F12).
8. **At film size the moves are few and big:** a break in the outline is >= 2 px, a gap >= 2 px, a wisp >= 1 px at its
   root; a subtle mess is no mess (the playbook's "a subtle one counts as none").
9. **The body stays adult and long-legged (7.8 heads, legs 5 % long); the head with its hair grows** from 0.137 to
   0.14-0.16 H, as in the owner's references.
10. **She stands relaxed, not ramrod:** the neck leans forward from its base (a craniovertebral angle of 55-60 degrees,
    not today's ~72), the back has its S, the weight shift shows through the clothes, one arm hangs off the body (F16).

## (a) The hair system

### a.1 The parts and their order

| part | what it is | count (close / film size) | its tone |
|---|---|---|---|
| back mass | the hair behind the neck and shoulders, seen through gaps and beside the neck | 0-1 | deep |
| **base mass** | the skull plus the cut's volume; smooth over the crown and on the upwind side; its outline IS the cut | 1 | lit and shade |
| **locks** | tapered ribbons that leave the base and break its outline: B (big), M (medium), S (small) | 4-7 / 2-4 | lit and shade (+ sheen) |
| **wisps** | single loose locks or a few hairs, thin and tapered, off the silhouette | 0-4 / 0-2 (0-1 at rest) | lit (or rim) |
| **gaps** | openings between locks at the silhouette's edge, showing the neck, the coat or the background | 1-3 / 1-2 | (what is behind) |
| parting | a notch at the crown where the two sides spring apart | 0-1 | deep |
| sheen | short bands across the locks, on the key side | 2-4 / 1-3 | sheen |

Draw in this order: the base mass and its outline (does the cut read, filled black?), then the big lock, then the
medium, then the small, then the gaps, then the wisps, then the light. The order is Disney's groom order (F6).

### a.2 The lock

- **Spine:** a smooth curve from the root (hidden under the base mass or another lock) to the tip. Straight hair has
  0-1 inflection (a C easing into an S); wavy 2-3; no stretch of spine is straight for more than 0.4 u.
- **Width:** w(s) = w0 x (1 + swell x sin(pi s)) x (1 - s^k)^m along the spine (s = 0 at the root, 1 at the tip), with
  swell 0.1-0.25, k 1.6-2.2 and m 0.7-0.9: widest at 20-35 % of its length, tapering to a point over the last 30-40 %.
- **The tip:** a point, asymmetric (one edge curves into it, the other runs straighter: straight against curve). Never
  a blunt round end; only a blunt cut's perimeter is crisp, and even it splits into 3-5 piecey points (W1).
- **Sizes** (widest width; length):

| size | width | length | per head |
|---|---|---|---|
| B, big | 0.30-0.50 u | the cut's full length from its root | 1-2 |
| M, medium | 0.15-0.25 u | 0.5-0.8 of B's | 1-3 |
| S, small | 0.06-0.12 u | 0.3-0.5 of B's | 1-3 |
| wisp | 0.015-0.03 u close, 0.05-0.07 u at film size | 0.3-0.9 u | 0-4 |

  Each size is at most 0.6x the one above it: the hierarchy must be visible, never five locks of one width.
- **Overlap:** locks overlap each other and the base mass by >= 0.05 u. A lock in front casts a sliver of shade (or
  deep) 0.02-0.04 u wide on the lock behind it, on the side away from the key. Divisions inside the hair are these
  slivers, never drawn lines (F14).
- **The curve is organic:** draw the outline as a smooth spline (`geo.ts` `loop()`/`curve()`), not as a polygon with
  rounded corners (today's `rpath`). The tips are the only corners. (ORGANIC, NOT GEOMETRIC; the people stay crisp.)

### a.3 The head of hair

- **Volume beyond the skull** (F7; random curl swells the mass): sleek 0.02-0.04 u; straight with body 0.05-0.08 u;
  wavy 0.08-0.16 u; curly 0.15-0.30 u; coily 0.25-0.45 u. The head with its hair: 0.135-0.14 H sleek, 0.14-0.15 H
  wavy, 0.145-0.155 H shags, 0.15-0.165 H curls and coils (the references: 0.15-0.165 H). Width from behind: up to
  1.5 u wavy, 1.9 u curly, and never wider than the shoulders.
- **The launch:** at a parting and along the hairline the hair rises 0.04-0.08 u off the scalp at 15-20 degrees, then
  turns down within 0.2-0.3 u (a ponytail leaves its tie at ~17 degrees, F7). Hair is never glued flat to the skull
  except a sleek style, and never stands up past 0.2 u unless it is short (a crop's top) or curly.
- **The silhouette, broken:** at least 2 places where a lock's tip or a wisp breaks the base mass's outline by >= 0.1 u
  (>= 2 px at film size); the hem ends in 3-7 tips at uneven heights (neighbours >= 0.05 u apart; the spread from the
  highest to the lowest tip 0.1-0.35 u by cut); the lowest tip off-centre.
- **Gaps:** 1-3, always at the edge: between the front lock and the mass (the neck shows), between hanging locks near
  the ends (the coat shows), between lifted locks in wind. Each a sliver or a teardrop, >= 0.05 u wide close, >= 0.1 u
  at film size. Never a hole in the middle of the mass.
- **The parting:** a deep notch 0.03-0.05 u wide at the crown, tapering over 0.1-0.15 u. A side part sits 0.15-0.35 u
  off the centre line and its heavy side sweeps over the crown (the volume 60 / 40).
- **Asymmetry:** the two sides differ in at least two of: length (>= 0.08 u), volume (>= 0.04 u), a tuck behind the ear,
  a lock forward over the shoulder. Never a mirror. The same cut keeps the same asymmetry in every view (the parting's
  side, the tucked ear, the forward lock).
- **Wisps:** a wisp is a lock that came loose, so its curve continues the flow; it leaves the silhouette at the crown,
  the parting, the temple or the ends. 0-1 at rest, 2-4 in a breeze. Not every head has one.
- **The LASH face:** in profile and lost profile no lock crosses the eye's lash line (the curtain tucks behind it, as
  `graphic_faces` does now); only the face option "turn" lets a lock fall over the eye.
- **Messiness, three levels** (every cut has one; never beyond 3):

| level | tips breaking the outline | hem spread | wisps | gaps | crossing locks |
|---|---|---|---|---|---|
| 1, clean | 2-3 | <= 0.12 u | 0-1 | 1 | 0 |
| 2, undone | 3-5 | 0.12-0.25 u | 1-2 | 1-2 | 1 |
| 3, tousled | 5-7, in 3-4 directions | 0.2-0.35 u | 2-4 | 2-3 | 1-2 |

### a.4 Texture: the lock's helix

| texture (curl groups) | the spine | the outline | the sheen |
|---|---|---|---|
| straight (I-II) | a soft C or long S, 0-1 inflection | smooth edges, pointed tips | one band per lock, staggered between locks |
| wavy (2A-2C) | an S-wave: wavelength 0.55-0.65 u near the root shortening to 0.4-0.45 u at the ends; amplitude 0.03 u at the root growing to 0.06-0.08 u at the ends; 1.5-2.5 waves | the edges follow the wave in parallel, a little offset (the lock twists) | one dash per wave crest on the lit locks, the dashes of neighbouring locks staggered 0.03-0.08 u |
| curly (3A-3C) | a chain of loops, 0.15-0.3 u apart; the lock ends in a hook (a curl turning back) | the outer edge scalloped, the inner edge with notches | a small arc on the key side of each loop's outer bend |
| coily (4A-4C) | not drawn as locks at film size: the mass is a cloud of lobes | 7-11 lobes of unequal size (2.5 : 1), 1-3 popping out, 2-4 single curls off the edge | 4-8 small arcs or dots on the lobes facing the key |

The weight of the hair below stretches a helix most near the root, so waves and curls are looser at the top and
tighter toward the ends (F7, F8). A curl never straightens: wind and walking bend its spine and stretch it 5-10 %,
and it keeps its loops (F9).

### a.5 Light: tones and sheen

- **Tones per head:** lit (the hair's colour), shade (from the key, computed on the head as today: `dir_graphic.md` §4),
  deep (L\* x 0.63: behind the neck, in gaps, under overlaps, the parting) and sheen (+13-16 L\*). At film size three
  of them (lit, shade, sheen; deep only behind the neck); close, all four. The hair stays the head's darkest mass and
  >= 25 L\* from the skin (§5.4, kept).
- **The terminator** runs across the whole head of hair as one shape (the head is the form), then each lock in front
  gets its own small terminator where it turns away. Connect the shadow shapes; few floating ones (F14).
- **The sheen crosses the flow:** a short band across a lock, at right angles to its direction, 0.6-0.9 of the lock's
  width long (never wall to wall), 0.04-0.07 u thick close and 0.08-0.10 u at film size (>= 2 px), its ends tapered.
  On the crown it sits 20-35 % down from the top on the key side (as now); on the lengths one band per big lock and per
  wave crest. Bands of neighbouring locks step up and down 0.03-0.08 u, so the sheen reads as made of locks, never as
  one painted ring. Light hair (copper, honey, chestnut) may take a second, warmer, more saturated band 0.06-0.1 u below
  the first, toward the tips; black hair only one low, cool band (F13).
- **The rim** (her only, the subject): on the key-side edges of the base mass and the locks that face the key, as now;
  a wisp against a dark ground may be all rim.

### a.6 Film size and close

| figure height | skull | locks beyond the base | wisps | gaps | sheen | tones | inner slivers |
|---|---|---|---|---|---|---|---|
| >= 300 px (close, rare) | >= 38 px | 4-7 (B 1-2, M 2-3, S 1-3) | 1-4 (0.015-0.03 u) | 1-3 (>= 0.05 u) | 2-4 bands | lit, shade, deep, sheen | 2-5 |
| 160-300 px | 20-38 px | 3-5 (B 1, M 1-2, S 1-2) | 0-2 (>= 0.05 u) | 1-2 (>= 0.1 u) | 1-3 bands (>= 2 px) | lit, shade, sheen | 0-2 |
| 130-160 px | 17-20 px | 2-3 (B 1, M 1-2) | 0-1 (the story's wind only) | 1 (>= 0.12 u) | 1-2 bands | lit, shade, sheen | 0 |
| 60-130 px | 8-17 px | 1-2 tips breaking the hem | 0 | 0-1 | 0-1 | two flat tones | 0 |
| < 60 px | | one shape with the head | | | | one or two values | |

At film size everything that makes the hair "messy" must be big enough to see: fewer, larger moves. Detail that falls
under a pixel is dropped, never drawn and lost (`dir_graphic.md` §8's level-of-detail switch, now for hair).

### a.7 Never

- one closed shape with a smooth unbroken outline (a helmet, a tombstone, a cape: today's back view);
- a hem of equal scallops, or one straight blunt line without pieces;
- straight parallel sides longer than 0.5 u;
- a tube curl rolled at the end of a straight strip (today's 3/4 lock);
- every tip at one height, or every lock one width;
- a mirror-symmetric head of hair;
- spaghetti: many thin strands, drawn lines inside the hair, outlines on locks;
- a hole in the middle of the mass;
- hair lifted with no wind and no motion (gravity always), or one head in the wind while its neighbours are calm;
- a curl pulled straight;
- a frizz halo or a fuzzy edge (the mess is designed shapes, never texture);
- more than 4 wisps on a head, wisps on every head, a wisp thinner than 1 px at its figure's size;
- a sheen painted as one ring over separate locks;
- a lock crossing the LASH lash line in profile (except the "turn" face);
- and §5.4's dated list, kept: the helmet bob, the ball bun on top, the bowl cut, the severe slick bun, the high skin
  fade with a quiff, the man bun with a full beard, every head the same brown.

## (b) The hair library: twelve cuts

Named as a stylist would (F1-F4). Lengths are below the crown; volume is beyond the skull. "Motion class" refers to
(c). Curly and coily heads count clumps or lobes instead of locks (they make the outline). Each cut takes the system in (a); only its own numbers are listed. The current H1-H10 map in: H1 -> W1, H2 -> W3,
H7 -> W6, H8 -> M1, H9 -> M5, H10 -> M2; H3 (claw clip), H4 (low bun), H5 (ponytail) and H6 (braids) become the styling
variants below.

| | cut | texture | length | volume | parting | locks, wisps | mess | motion |
|---|---|---|---|---|---|---|---|---|
| W1 | **the soft swing bob** (the ripped bob) | straight to wavy | 1.05-1.2 u at the back, the front 0.05-0.1 u longer | 0.06-0.10 u, the ends swinging out to 1.25-1.35x the skull's width | deep side part, 0.25-0.35 u off centre; the light side tucked behind the ear | B1 M2-3 S1-2; 0-1 | 1-2 | C1 |
| W2 | **the lazy wavy lob** | wavy 2A-2B | 1.4-1.6 u: resting on the shoulders and bending over them | 0.10-0.16 u, widest from the jaw to the ends (1.3-1.45x) | middle or soft side (0.1-0.2 u off) | B1-2 M2-3 S1-2; 1-3 | 2 | C2 |
| W3 | **long shattered layers with curtain bangs** (her default) | straight to wavy (her: 2B) | 2.0-2.5 u (the shoulder blades); the shortest layer 1.1 u at the face; bangs to the cheekbones (0.55-0.7 u) | 0.06-0.12 u at the crown; fuller toward the ends, then a soft V | centre (the bangs part there) | B2 M2-3 S1-2; 2-3 | 2 | C3 |
| W4 | **the butterfly cut** | straight to wavy | 1.9-2.3 u at the back; short "wings" at the cheekbone (0.65-0.75 u) and the chin (1.0-1.1 u); crown layers 0.6-0.8 u | 0.12-0.20 u: widest at the cheek and jaw (1.4-1.5x) | centre or soft side | B2 M2-3 S1-2; 2 | 2-3 | C3 |
| W5 | **the shag** (soft on wavy; curly on 3A-4A) | wavy or curly | 1.3-1.8 u at the back; crown layers 0.5-0.7 u; a curtain fringe 0.5-0.7 u | 0.15-0.25 u at the crown and cheeks (curly 0.2-0.35), narrowing to the nape: an upside-down teardrop | soft centre | B1 M2-3 S2-3; 2-4 | 3 | C1 (curly C4) |
| W6 | **natural curls and coils, the shaped cloud** | 3C-4C | the lowest edge at the jaw to the shoulders (0.9-1.5 u) | 0.25-0.45 u; longer at the top and back than at the sides | none, or a soft side dip | lobes, not locks; 2-4 single curls | 2 | C0 |
| W7 | **the bixie** (a soft razor crop) | straight to wavy | top 0.5-0.8 u swept forward and aside; a wispy fringe to the brow or cheekbone; the nape 0.25-0.4 u below the hairline; ears out | 0.08-0.14 u at the crown, 0.03-0.06 u at the sides | side | M3-4 S2-3; 2-3 | 2-3 | C1 |
| M1 | **the textured crop** (low taper) | straight to wavy | top 0.35-0.55 u, standing 0.08-0.15 u; the fringe to 0.2-0.3 u above the brow in 3-5 choppy points | the sides 0.03-0.06 u (scissor length; the taper only at the sideburn and the nape's lowest 0.1-0.15 u) | none (a crown cowlick instead) | 4-6 short tufts (S-M); 0-1 | 2 | C0 |
| M2 | **the middle-part flow** (curtains) | straight to wavy | 0.9-1.3 u at the back (jaw to collar); curtains to the cheekbones (0.6-0.75 u) | 0.06-0.12 u; the curtains launch 0.05-0.07 u off the part | centre | B2 M2-3 S1-2; 1-2 | 2 | C2 |
| M3 | **the modern mullet** (a soft wolf cut) | wavy to curly | the front and sides 0.3-0.5 u; the crown in short layers 0.4-0.6 u; the back to and past the collar (1.2-1.6 u) | 0.12-0.20 u at the crown | none or soft centre | M3-4 S3; 2 | 3 | C2 |
| M4 | **the curly mop** (low taper; ref 03's boy) | 3A-3C | curls 0.2-0.35 u beyond the skull on top, the fringe of curls to just above the brow; the sides 0.06-0.10 u; the taper at the nape | 0.2-0.35 u on top | none | 8-14 curl clumps (B2-3 M4-6 S3-5); 1-2 single curls | 3 | C4 |
| M5 | **twists on a taper, or the TWA** | 4A-4C | twists 0.15-0.3 u on top; the TWA a cushion 0.1-0.2 u | the sides faded close (0.02-0.04 u) | none | 8-14 short twists, or 8-12 small lobes | 1-2 | C0 |

**The silhouettes, per view** (what job 2 draws; the back view is the showcase):

- **W1, the soft swing bob.** *Back:* a round crown dropping almost straight, then belling out at the hem; the hem in
  4-6 separate pieces at heights 0.04-0.08 u apart, the lowest off-centre; one small lock flicking out at the nape; one
  gap in the hem. *3/4:* the heavy side's big lock curves under the cheekbone and ends at the jaw in a tip that kicks
  forward; the tucked side shows the ear. *Profile:* the crown's arc, a bend at the ear, the hem kicked out behind the
  jaw. *Moves:* little and fast; in wind the hem's pieces separate and lift 10-20 degrees.
- **W2, the lazy wavy lob.** *Back:* a smooth crown, the lengths in 1-2 big wavy locks and 2-3 medium; 4-5 tips spread
  0.1-0.2 u; one lock lies forward over a shoulder, so one side reads shorter; 1-2 gaps at the shoulders. *3/4:* one
  front lock frames the face from the cheekbone in an S; the other side is tucked or falls behind the shoulder.
  *Profile:* the waves fall in an S down the back of the neck to the shoulder, one lock in front of it. *Moves:* the
  waves spring and bounce on the step.
- **W3, long shattered layers with curtain bangs.** *Back:* a V hem of 4-6 tapered tips spread 0.2-0.35 u (ref 02);
  two big locks, 2-3 medium, 1-2 small; 1-2 gaps between locks near the ends. *3/4:* the near bang sweeps from the part
  to the cheekbone and runs into the face-framing layer to the collarbone; the far bang to the cheekbone. *Profile:*
  the bang's curve in front of the ear (tucked behind the lash), the lengths down the back in an S, the ends lifting
  out. *Moves:* her flowing element: the longest lag, a sideways sway in the walk.
- **W4, the butterfly cut.** *Back:* crown layers as 2-3 overlapping medium locks (the feathering), the lengths as two
  big locks and a V of 3-4 tips. *3/4:* a two-tier face frame (the cheekbone wing, the chin wing) flicking away from
  the face; one wisp. *Profile:* the lifted crown, the wings flicking forward and out at the cheek. *Moves:* the wings
  flutter, the lengths swing.
- **W5, the shag.** *Back:* short tapered locks over the crown in 2-3 rows, the lengths as 2-3 medium locks with tips
  pointing out and down in 2-3 directions; 1-2 gaps. *3/4:* the fringe in 2-3 pieces to the brow and cheekbone, locks
  flicking out at the cheek. *Profile:* the crown high and round, the nape thinner and flicking out. *Curly:* each lock
  a chain of 2-3 loops ending in a hook; 1-2 single curls off the crown. *Moves:* the layers lift separately; the curly
  shag bounces.
- **W6, natural curls and coils.** *Back and front:* a rounded cloud wider at the top than at the jaw, one flatter side,
  7-11 lobes of unequal size, 1-3 lobes popping out by >= 0.1 u, 2-4 single small curls (0.06-0.1 u spirals) off the
  key side and the crown; 3-5 shade slivers between the big lobes; deep only under the lowest lobes. *Profile:* the
  cloud reaches 0.35-0.5 u behind the skull and 0.25-0.35 u above it; a clean hairline in front of the ear. *Moves:*
  barely: the whole cloud bounces 2-3 % of its height on the step, the edge curls jiggle, wind presses the upwind side
  0.03-0.05 u.
- **W7, the bixie.** *Back:* a round crown breaking into 4-6 small tapered points at the nape, pointing down and in.
  *3/4:* the fringe in 2-3 tapered pieces sweeping across the brow toward the far side; 1-2 wisps in front of the ear.
  *Profile:* the crown's lift, the fringe's points, the nape's points, the ear clear. *Moves:* the tips flick late.
- **M1, the textured crop.** *Back:* a round crown with 3-5 small tufts breaking its top edge (pointing up and back) and
  one cowlick tuft off-centre; a clean nape a step lighter at the very bottom. *3/4:* the fringe's 3-5 points across
  the brow, angled toward one side. *Profile:* tufts pointing forward and up, the fringe 0.2-0.3 u above the brow.
  *Moves:* it holds its shape (shorter than 0.2 u); the tufts tilt 5-10 degrees downwind, nothing swings (ref 04).
- **M2, the middle-part flow.** *Back:* a round crown, 2-3 medium locks to the collar flicking out at their tips, one
  longer than the other. *3/4:* the near curtain falls in an S to the cheekbone and kicks back toward the ear; the far
  curtain shorter; one forward, one tucked. *Profile:* the curtain sweeping back in front of the ear, the flow down the
  back of the head with a flick at the collar. *Moves:* the curtains swing and fall forward on a nod.
- **M3, the modern mullet.** *Back:* crown tufts, then 3-4 nape locks hanging to the collar with unequal tips (spread
  0.15-0.25 u). *3/4:* the fringe in pieces, the sides close to the ear, the back locks showing behind the neck.
  *Profile:* the stepped line: a short front, a lifted crown, a long nape (one S from the crown to the nape's tip).
  *Moves:* the nape locks swing and flick; the crown tufts bob.
- **M4, the curly mop.** *Back and 3/4:* 8-14 curl clumps, each a tapered lock bending into a hook at its tip, pointing
  out in 3-4 directions; 1-2 single-curl flyaways above the crown; 2-3 gaps between clumps at the edge; the sides
  tighter, the nape clean. *Profile:* the fringe's hooks over the brow, the lifted crown. *Moves:* the curls bounce on
  each step; wind lifts the flyaways, barely the clumps.
- **M5, twists or the TWA.** *All views:* twists as 8-14 small rounded-pointed tufts pointing up and out, unequal; the
  sides faded close with a soft hairline; the TWA as a lobed cushion of 8-12 small lobes. Sheen dots on the tips facing
  the key. *Moves:* the twists tremble; nothing swings.

**Styling variants** (on any long cut, kept from §5.4 and softened): the claw-clip twist (H3, its ends fanning above
the clip); the soft low bun with two tendrils (H4); the low ponytail (H5) as 2-3 locks with a soft S and two
face-framing wisps, never one smooth tube (it swings sideways in the walk, F10); boho knotless braids (H6, as built,
the loose curly ends as the messy part); a cap or a beanie without a pompom.

**Colours:** §5.4's palette, kept (black `#2B2324`, espresso `#3A2B27`, dark brown `#533A30`, chestnut `#774D3A`,
muted copper `#A25E3B`, honey `#CBA577`; platinum rare); her copper `#8A4A31` (`dir_graphic.md` §4).

**Adding a cut from a new reference** (more references are coming): name it as a stylist would; measure its length
(u below the crown), its volume (u beyond the skull), its parting, its texture, its silhouette in the three views, its
lock count by size, its mess level (a.3) and its motion class (c); add one row above and one entry in the cut data
(f). Nothing else changes.

## (c) Hair physics as drawing rules

### c.1 The forces, and what each one draws

| force | the physics (RESEARCH.md) | the drawing rule |
|---|---|---|
| gravity against stiffness | a hair bends under its own weight over ~5 cm, ~0.2 u (F7) | shorter hair holds its shape (tufts, crown layers, baby hairs); longer hair launches off the scalp and hangs, draping over the shoulders and back, never through them |
| the weight in the lengths | the hair below pulls on the hair above (F7, F8) | waves and curls looser at the top, tighter at the ends; long hair narrows to its tips; a long heavy lock hangs straighter than a short one of the same texture |
| curl | every strand a helix (F8); curls spring, never unwind (F9) | a.4's spines; in every state the helix keeps its loops; only the spine bends and stretches 5-10 % |
| clumping | strands cluster at several scales, split in motion, merge at rest (F5, F6) | at rest few gaps and locks merged into the mass; in wind, a walk or a turn more locks separate and more gaps open |
| air | drag acts most on light free ends; the head shields its lee (F11) | the root pinned, the bend growing toward the tip; wisps move first and most; the upwind side lies flat |
| inertia | loose parts lag, overshoot and settle (F12) | in a still of motion the ends sit behind where the head is going; after a stop, ahead of it |

**The bend rule** (one operator for every state): a lock's direction turns by an angle that grows from nothing at the
root to its full value at the tip, d(s) = d_tip x s^1.7 (s = 0 at the root, 1 at the tip). Wind, a walk and a turn
only set d_tip (and its direction) per lock.

**Motion classes** (each cut has one; (b)):

| class | cuts | how far it swings (d_tip) | lag of the ends at 60 fps | settle |
|---|---|---|---|---|
| C0 stiff | crops, twists, the TWA, coils | 0-5 degrees: tufts tremble, edge curls jiggle | 2-4 frames | 0.1-0.2 s |
| C1 short | bobs, the bixie, the shag's layers | 5-12 degrees | 5-7 frames | 0.3-0.5 s, one overshoot |
| C2 medium | the lob, the flow, the mullet's nape | 10-20 degrees | 7-10 frames | 0.5-0.7 s |
| C3 long | long layers, the butterfly, a ponytail | 15-35 degrees, a sideways sway | 10-15 frames | 0.7-1.0 s, two overshoots |
| C4 springy | curls 3A-3C | the clump moves with the head; the curl stretches 5-10 % | the bounce 4-6 frames | 2-3 bounces at ~2.5-3 Hz |

### c.2 The still states (job 2 draws these; no clip yet)

| state | long hair (C3) | lob, flow, mullet (C2) | bob, bixie (C1) | curls (C4) | crops, coils (C0) |
|---|---|---|---|---|---|
| **calm** (standing, no wind) | hangs; the front lock bends over the shoulder; tips per texture; 0-1 gap; 0-1 wisp lifted <= 10 degrees | hangs and rests on the shoulders | hangs; the hem's pieces together | clumps at rest, hooks down and out | as cut |
| **a breeze** (from one side; ref 01) | downwind outer locks d_tip 20-35 degrees; the outline reaches 0.15-0.4 u downwind; 2-4 wisps streaming at 40-70 degrees, the longest 0.5-0.9 u; the upwind side flat (its volume down to 0.02-0.04 u); the lee x 0.4; 2-3 gaps open | d_tip 15-25 degrees; 1-3 wisps | d_tip 10-20 degrees; the hem's pieces separate | clumps tilt 5-10 degrees; flyaways stream; loops kept | tufts 5-10 degrees; the cloud presses 0.03-0.05 u on the upwind side, edge curls stream |
| **walking** (the contact pose, profile or rear 3/4) | the hair trails: d_tip 8-15 degrees back, the ends 0.05-0.15 u behind; at the contact the ends have just landed (spread 0.03-0.05 u wider); a ponytail or long ends swung 10-15 degrees to one side (F10) | d_tip 6-10 degrees back | d_tip 5-8 degrees back | curls compressed 5 % at the contact, stretched 5-10 % at the passing | still |
| **a turn of the head** (mid-turn, e.g. looking back over the shoulder) | the base mass turns with the skull; the tips 15-30 degrees of turn behind the head, the outer locks swung 0.05-0.15 u outward with 1-2 gaps on the outside of the turn; the leading side's locks press on the cheek and neck; the hem fans 20-30 % wider | tips 10-20 degrees behind; flicks swing out | tips 8-12 degrees behind | clumps follow, flyaways lag | turns as one piece |
| (a stop, optional) | the ends swing 0.05-0.15 u forward past rest; curtains fall toward the face | the same, smaller | small | a bounce | none |

Every head in a shot takes the same wind direction; its strength scales with how light the hair is: wisps 1.5-2x, long
straight 1x, wavy 0.8x, bobs 0.5x, crops 0.2x, coils 0.1x.

### c.3 For later motion (after the owner approves a still)

- **The root moves with the head;** the tip follows by the class's lag (c.1). Neighbouring locks are offset 2-5 frames
  (never in unison): the big lock leads, the small ones and the wisps trail.
- **Overshoot and settle:** the first overshoot 30-50 % of the move, the next 25-40 % of that; then rest within the
  class's settle time. A bob settles in 0.3-0.5 s, long hair in 0.7-1.0 s.
- **The walk** (2 steps a second, §5.9): the head bobs twice a stride; the hair's bounce follows 3-5 frames late; a
  ponytail and long ends sway sideways once a stride (F10); curls bounce once a step.
- **Keep-alive:** at rest, only 1-2 wisps and the outer tips move, on `src/lib/figure/wind.ts`'s 1.0 s flutter (<= 3-5
  degrees); its 2.3 s gust lifts the downwind outer locks 5-10 degrees. Never the whole head of hair at once (Disney's
  "subtle keep-alive", F11). wind.ts's travelling bend (the root pinned, the bend reaching the tip 0.8 of a cycle
  late) is the bend rule in time.
- **A turn:** the hair can be posed per view with in-between shapes, or rebuilt from the cut data at each yaw (f); either
  way the lock count and the asymmetry never change mid-turn.

## (d) Proportions and stature

### d.1 What changes from §5.1

| | §5.1 now | the new number | why |
|---|---|---|---|
| skull | 0.125-0.128 H (her 0.128: 7.8 heads) | her **0.128 (kept)**; the cast 0.120-0.137 H by height (d.4) | the references are 7.0-7.5 heads and read elegant through limbs and necks; our 7.8 already does; heights vary by the legs (F15) |
| the head with its hair | at most 0.14 H | **0.135-0.165 H by cut** (a.3); never wider than the shoulders | the references read 0.15-0.165 H; volume is where the life is |
| neck | 0.04-0.05 H visible, 0.042-0.046 H wide (her 0.046), "slanting forward 10-15 degrees" | 0.04-0.05 H visible (kept); **women 0.040-0.044 H wide (her 0.042), men 0.052-0.058**; in profile **the neck's axis leans forward 15-25 degrees** (today ~11) and **the craniovertebral angle (C7 to the ear, from the horizontal) is 55-60 degrees** | ours measures ~72 (a ramrod); healthy 22-year-olds stand at 53.7 ± 5 (F16); the references' necks are 0.27-0.33 u wide |
| the head's place | centred over the chest | in profile the ear **0.06-0.07 H in front of C7** (the base of the neck at the back) and **0.02-0.035 H in front of the shoulder joint** (today it sits right over it); the face plane vertical; the chin level (the jaw 0-5 degrees off the horizontal) | F16; the head forward of the neck's base is what a relaxed, upright neck looks like |
| shoulders | women 0.228-0.240 H sloping 12-18 degrees; men 0.26-0.275 H, 8-12 | widths kept; **women slope 15-20 degrees, men 10-14**, the line from the neck a long soft concave curve; the shoulder points 0.005-0.01 H lower | "shoulders down": relaxed, never squared; a coat's dropped shoulder follows the slope |
| the back in profile | not set (lofts on a vertical axis) | **an S:** the pelvis tilts forward 8-12 degrees (the seat 0.01-0.015 H back), the ribcage leans back 4-6 degrees above the waist; the deepest point of the lower back at 0.62-0.64 H, 0.012-0.02 H in front of the line from the shoulder blades to the seat | the pelvis's normal 13 ± 6 degrees (F16); the references' backs |
| legs | crotch 0.490, knee 0.292 (her) | crotch **0.485-0.49 (kept)**, knee 0.292-0.295 | already the +5 % legs (F15) |
| limb taper | thigh : ankle ~3.4 : 1 | 3.4 : 1 average, **up to 4 : 1 slim** | the references' slim, tapered legs (ref 05 ~4 : 1) |

### d.2 The stance: relaxed and confident

- **One line of action:** a long S from the head through the weight leg (front and back), and the spine's S in profile.
- **Profile:** the shoulder joint, the hip joint and a point just in front of the ankle within ±0.015 H of one vertical
  (`design_research.md` A4); the ear 0.02-0.035 H in front of that line, the neck leaning forward from its base (d.1).
  A4's "ear over the shoulder" is the textbook ideal, and drawn exactly it is the ramrod we measured; relaxed
  22-year-olds stand with the head a little forward (F16; the offset is our estimate from their angle). The chest open;
  the shoulders down and a little back, never rolled forward.
- **Front and back (contrapposto, made visible):** the pelvis tilts 6-8 degrees (the weight hip up) and the hip shifts
  0.015-0.025 H toward the weight side; the shoulders tilt 3-5 degrees the other way; the pit of the neck over the
  weight foot (±0.01 H); the free knee bent 10-25 degrees, its foot 0.04-0.08 H forward or aside, turned out 15-30
  degrees; the head tilted 5-10 degrees and turned 15-25 degrees off the torso. **Through the clothes:** the coat's
  side follows the hip shift and its hem tilts 2-4 degrees with the pelvis; a skirt's hem the same.
- **Arms:** at least one arm off the body, a gap >= 0.015 H between the inner arm and the waist (>= 2 px at 156 px);
  the loose elbow bent 10-20 degrees, its hand behind the thigh's centre line; the other anchored (§5.7). Open, never
  guarded (F16).
- **Never:** the ramrod (a vertical neck, square shoulders, level hips and hem), the slump (a craniovertebral angle
  under 48, a rounded upper back, the head hanging), feet flat and parallel with both knees locked, the camera pose (a
  hip pop over 0.03 H).

### d.3 What reads stiff in our her, and the fix

| measured on `baseline_her.png` (RESEARCH.md) | the fix |
|---|---|
| the neck a vertical block; craniovertebral angle ~72 degrees | the head forward 0.025-0.035 H, the neck's base back 0.005 H, its axis leaning 15-25 degrees: 55-60 degrees |
| the torso a column within 1 degree of vertical; the coat's back one straight line | the profile S (d.1); the coat hangs from the shoulder blades, so its back line leans back from them and the hem swings 0.01-0.02 H forward |
| the weight shift built but hidden (a level hem, shoulders within 2 degrees) | the hip shift 0.02 H pushes the coat's side out; the hem tilts 2-4 degrees; the shoulders 4-5 degrees; the head 6-8 |
| both arms within 0.01 H of the body | one arm off the body (>= 0.015 H gap), the elbow bent |
| the head square (tilt -5, turn 6 degrees) | tilt 6-10, turn 15-25 degrees off the torso |
| the hair a firm sheet with an even scalloped hem | (a) and W3 |

### d.4 Builds and the height sheet

**Builds** (full widths in H; limb radii as a factor on `body.ts`'s):

| | slim | average | athletic | soft |
|---|---|---|---|---|
| women: shoulders / waist / hips | 0.228 / 0.150 / 0.200 | 0.236-0.240 / 0.158 / 0.210 (her) | 0.246 / 0.162 / 0.208 | 0.236 / 0.172 / 0.230 |
| women: limbs | x0.92, thigh : ankle 4 : 1 | x1.0 | x1.06 (calves, upper arms), a stronger S | x1.12 (thighs, upper arms) |
| men: shoulders / waist / hips | 0.255 / 0.175 / 0.188 | 0.268-0.272 / 0.184 / 0.195 | 0.285 / 0.190 / 0.198, neck 0.060 | 0.275 / 0.205 / 0.205 |
| men: limbs | x0.92 | x1.0 | x1.08 | x1.12 |

**The height sheet.** Real adults keep nearly the same head and torso while their legs carry the differences in height
(F15). So the skull scales with H^0.3 and the legs take the rest: heads tall = 7.8 x (H / 168 cm)^0.7, men's skulls 2 %
larger at a given height. Her: 168 cm, 7.8 heads (a little above the average woman's 162.7 cm). The crotch stays near
+5 % legs and never above 0.505 H.

| figure | height | heads | skull (H) | crotch (H) | build |
|---|---|---|---|---|---|
| woman | 152 cm | 7.3 | 0.137 | 0.465 | soft |
| woman | 160 cm | 7.55 | 0.132 | 0.475 | athletic |
| **her** | 168 cm | 7.8 | 0.128 | 0.485 | average to slim |
| woman | 175 cm | 8.0 | 0.125 | 0.494 | slim |
| man | 167 cm | 7.6 | 0.131 | 0.479 | soft |
| man | 177 cm | 7.95 | 0.126 | 0.491 | average |
| man | 182 cm | 8.1 | 0.123 | 0.495 | athletic |
| man | 188 cm | 8.3 | 0.121 | 0.503 | slim |

A man beside her stands ~8 % taller on average (177-182 cm), as §5.1 says. In a lineup the figures share one ground and
one scale (draw each at H_cm / 190 of the tallest); a scale with 150 / 170 / 190 cm marks sits beside them (ref 03).

### d.5 Seated and leaning (refs 01 and 05)

- **On a ledge, legs hanging (ref 05):** the seat on the ledge, the thighs 0-10 degrees below the horizontal, the edge
  under the back of the knee or the mid-thigh; the shins hanging 5-20 degrees forward of vertical, the two at least 10
  degrees apart (one forward, one back); the feet relaxed, pointed 30-50 degrees down. The torso a soft C leaning 10-25
  degrees forward over the hands (holding a cup, a phone, a stone), or upright with the hands on the ledge beside the
  hips; the head bowed 20-35 degrees or turned to the view. With the head bowed the front locks hang straight down,
  away from the cheek, a gap between them (gravity). Seated height, crown to seat: ~0.51 H.
- **On the ground, knees up (ref 01's boy):** the feet flat 0.25-0.35 H in front of the hips, the knees 0.28-0.32 H off
  the ground; one forearm resting on a knee, its hand hanging; the other arm braced behind (the elbow straight) or on the
  other knee; the back leaning back 10-20 degrees or rounded over the knees; the head up to the view.
- **On the ground from behind, legs folded to one side (ref 01's girl):** the back one long C, a hand on the ground on
  the folded side; her hair in the scene's breeze.
- **Back to back (ref 01):** the shoulder blades touching, the two heads tilted 5-10 degrees toward each other.
- **Leaning** (§5.7, kept): the back to a wall or rail, the pelvis 0.05-0.08 H off it, one foot flat on the wall or the
  ankles crossed; or the forearms on a railing seen from behind, the weight on one leg.

### d.6 What reads from behind (the "you" at 130-220 px)

In order of strength: the hair's silhouette (the cut, 2-4 locks breaking it, 1-2 gaps); the head's tilt and turn (a
lost profile's cheek sliver); a long neck between the hair and the collar; the shoulder line, sloping and tilted 3-5
degrees; one arm off the body (the gap at the waist); the hip shift (the coat's side and hem); one straight leg and one
bent; the feet splayed at different depths.

## (e) The still list for job 2 (6-8 stills)

All in direction C with the LASH face; stills only, no clip (an ITERATION). Each still says what the owner should look
at.

| # | still | what is in it | the owner looks at |
|---|---|---|---|
| S1 | **Her, before and after, three views** | the baseline (front 3/4, walking profile, back) beside the new her: W3 in her copper with a 2B wave, the new neck, the S, the visible weight shift, one arm off the body; 640 px, the same evening look | Is the hair alive and never one firm shape, and still clean and premium? Does she stand relaxed and confident, neither stiff nor slumped? Is she still the same person? |
| S2 | **The hair library sheet** | the 12 cuts on 12 people (men and women, skins S1-S6, §5.4's colours): each as a back view and a 3/4 head and shoulders at ~3x film size; below, the same 12 at film size 1:1 (200 px) in colour and filled black | Which cuts read modern and pleasant? Does each read from behind at phone size? Is the mess the right amount, neither wild nor tidy? |
| S3 | **The wind states** | three cuts (W3 long layers, W2 the lazy lob, M4 the curly mop) in four states (calm, a breeze, walking, a turn of the head): a 3 x 4 grid of heads and shoulders at ~3x | Do the states read as wind, a walk and a turn? Is the root pinned and the tip moving most? Do the curls keep their curl? |
| S4 | **The cast at film size in our night scene** | her and 4-5 strangers (different cuts, builds, heights) at 130-220 px in our evening scene: the painted still v6 at dusk, by its lit doorway (`docs/studies/2026-10-28_city_posters/paint_test/paint_still_v6.png`, the plate `dir_graphic_crop.py` makes), or the current film's night set if a newer one exists; one breeze through all of them; 1:1 and 2x crops | At phone size, does the hair read alive and designed rather than noisy? Do they read as cool 20-30-year-olds? Same wind on every head? |
| S5 | **The height-and-build lineup** | the 8 figures of d.4 on one ground beside a 150 / 170 / 190 cm scale, each a different build and cut; the tallest ~1000 px | Adult and pleasant at every height? Legs long but never stretched? Heads small but not tiny with their hair? Real variety? |
| S6 | **Seated and leaning** | her on a ledge in profile (ref 05's pose); two people back to back on the ground from behind, in a breeze (ref 01); one person leaning on a rail from behind | A relaxed stature: the back's soft curve, the legs' natural hang, the hair's fall with a bowed head? |
| S7 (optional) | **Close and far** | four heads (W1, W2, W6, M1) close (skull 60-80 px) with the full hierarchy, beside the same heads at film size | Is the close detail earned, and does it drop out cleanly at film size? |

## (f) Build notes for job 2

- **New files only** (the brief): a folder `video/src/look/people_dirs/hair_v2/` and the entry
  `video/src/entry-look-people-hair.tsx`. Import from `graphic/` (`geo.ts`, `rig.ts`, `body.ts`, `color.ts`, `wear.ts`,
  `feet.ts`, `props.ts`, `palette.ts`) and `graphic_faces/` (the LASH head) without editing them; `hair.ts`, `cast.ts`
  and their sheets keep working as they are.
- **`lock.ts`:** the lock primitive: a spine (root, direction, length, launch, bend, the texture's wave: wavelength and
  amplitude at the root and the tip) and the width profile of a.2, giving a closed smooth outline (`loop()`); the
  overlap sliver; the bend rule d(s) = d_tip x s^1.7.
- **`cuts.ts`:** the 12 cuts as data per view (q, p, b): the base mass, the locks (size, root, direction, length, z in
  front of or behind the face and neck), the wisps, the parting, the asymmetry, the mess level, the motion class. Data,
  so a new reference adds an entry, nothing else.
- **`states.ts`:** calm, breeze, walk and turn as parameter sets (the wind's direction and strength, the lags of c.2)
  applied to every lock through the bend rule.
- **`stance.ts`:** `WOMAN_V2` and `MAN_V2` (the neck width, the shoulder slope), the builds and heights of d.4, and a
  skeleton helper with the head forward (`head.dz`), the neck's lean, the pelvis and chest offsets for the S, the hip
  shift; the seated and leaning poses of d.5.
- **Sheets:** one composition per still (S1-S7). Render one at a time, from `video/`:
  `node scripts/render-frames.mjs <Comp> <outDir> 0 --entry=src/entry-look-people-hair.tsx --concurrency=1`.
- **Check before showing:** each still at phone size (a 1080-wide frame seen at ~6 cm): the a.6 minimums hold, the
  silhouette test passes (a.3), no lock crosses a lash in profile, every head in a shot shares the wind.

## Changes from the stills (job 2, 2026-10-30)

Job 2 built the recipe (`video/src/look/people_dirs/hair_v2/`: `lock.ts`, `cuts.ts`, `states.ts`, `hair.ts`,
`stance.ts`, `people.ts`, `Sheets.tsx`; the entry `video/src/entry-look-people-hair.tsx`) and rendered the stills
(`stills/`, `stills/STILLS.md`). Looking at them at full size and at phone size changed these rules; where a line here
and a line above disagree, this one wins until the owner rules.

**The hair**
- **Waves (a.4): longer, and in phase.** The recipe's wavelengths (0.55-0.65 u at the root, 0.4-0.45 at the ends) put
  ~3 waves on a long lock and read crimped. Wavy 2B is now: wavelength 1.0 u at the root shortening to 0.72 u at the
  ends, amplitude 0.024 u growing to 0.058 u, starting 20 % down the lock: 1.5-2 waves on long hair. **Neighbouring
  locks wave together:** each lock's phase is set by the height where its wave starts, staggered only 0-0.12 turns
  between locks, so the head reads as one set of lazy waves; independent phases read as noise. The terminator waves
  with them. The width narrows where a wave turns edge-on by at most 10 % (more reads beaded), and the wave fades over
  a lock's last quarter so every tip stays a clean point.
- **The sheen (a.5) starts at the lit edge.** A dash floating mid-lock reads as a little smile (with the crown band
  above it, a face). Each dash now begins at the lock's lit edge, clipped crisp by its outline, and tapers inward over
  0.6-0.7 of the width, bowed like a ring seen from above. Only big locks carry dashes: 1 at 130-160 px, 2 at film
  size, 3 close; a medium lock 1 close only; small locks none. The crown band is 2 long stepped pieces (3 never read
  better) on an arc inside the dome (radius 0.45-0.51 u, 20-35 % down on the key side), 0.045 u thick.
- **Separations: the lock's own shade edge, not slivers, at film size.** Slivers cast on the mass by every lock ended
  in short wedges that read as cracks. At film size each lit lock's own thin shade edge (0.15 of its width, waving
  with the lock) separates it; slivers come only close (>= 300 px), only from long locks, and a crossing lock casts
  none. Close size instead adds 1-2 tapered splits inside each big lock (F5: a clump shows its sub-locks).
- **The base mass's hem hides behind the locks:** its own lower edge sits 0.1-0.15 u above the locks' tips, or its
  corners add spiky points between them. The hem's points are the locks'.
- **Wisps:** a flyaway arcing above the crown, on the shade side, reads as an antenna. The one at rest now sits on the
  key side, rooted inside the mass and leaving it gradually (within 0.03-0.06 u of the outline), 0.032-0.034 u wide,
  flat lit (never in the shade plane). In the air the wisps stream from the temple and the ends.
- **The rim only where a lock meets the background:** a rimmed lock lying over the cheek reads as an outline (the
  builder gives interior locks their own names so the rim pass skips them).
- **A centre part needs a deep V-filler** under both sides: the hair rises above the skull, and without it the
  background shows as a white notch. Its top edge joins points on both outlines, so it never pokes above the hair (a
  bigger filler read as a top knot).
- **Short cuts: tufts lie back.** Tufts with hooks, or tips pointing up, read as horns (the mullet's crown) or a crown
  of thorns (twists). Crop tufts lie back along the dome, 0.06-0.12 u above it, with blunter tips (taper m 0.65); a
  mullet's crown layers follow the dome down and out; twists are short rounded tufts (0.12-0.16 u, swell 0.45, m 0.5),
  unequal. A bob's pieces take blunt tips too (m 0.6): "soft swing", not a jagged fringe. Coils' single curls spring
  from inside the cloud's edge as a C (0.16-0.19 u, 200 degrees), never a floating dot.
- **Coils in 3/4:** the cloud sits back from the face (its centre ~0.16 u behind the skull's), its hairline cut
  scalloped, or it reads as a beret.

**Hair physics as drawing (c)**
- **The states are ~1.6x the recipe's ranges.** At film size c.2's ranges read as calm (a subtle one counts as none).
  d_tip, inner to outer locks: breeze C3 32-55, C2 24-40, C1 16-28, C4 8-16, C0 6-12 degrees; walk C3 14-24, C2 11-18,
  C1 8-13, C4 4-8; turn C3 18-34, C2 14-26, C1 10-18, C4 6-14. In a breeze the long hair's outline reaches 0.2-0.3 u
  downwind at the hem and the upwind side presses ~10 % flatter. Curls and coils stay nearly still by design.
- **The turn:** the outside of the turn (the side away from the look) flares and fans 1.6x more than the leading side,
  whose locks press toward the neck; every tip swings toward the outside. A head turned ~50 degrees off a body seen from
  behind is drawn in profile (looking back over the shoulder): the clearest read, and the profile's hair carries the
  swing.
- **Gravity takes over early.** With the head bowed (S6), turning the hair back to vertical by the bend rule (s^1.7)
  left the lengths sloping back as if blown. Gravity now turns a hanging lock back to straight down within its first
  third (F7: a hair bends under its own weight past ~5 cm); the bend rule stays for wind, walk and turn.
- **Locks rooted on the lengths** (below the swing's pivot) ride the mass's own swing and fall, or they come loose
  (one floated free beside the bowed head).

**Proportions and stature (d)**
- **The neck needs depth.** The engine's round neck (0.042 H across) was too thin front to back to fill the throat once
  the head sits forward: a dark gap opened under the jaw in 3/4. The neck is now an elliptical column ~1.4x deeper
  than wide (women ~0.06 H front to back), running from its base up under the skull along its lean.
- **The head forward 0.03 H** with the neck leaning 20 degrees gives a craniovertebral angle of ~58 (S1, measured on the
  skeleton); 0.034 H read slightly turtle-like in 3/4.
- **The tilt reads by its direction:** in 3/4 a tilt that rolls the face down reads bowed and tired; tilting toward the
  raised shoulder, the face a touch up (+6 degrees), reads confident.
- **Views:** the 3/4 her stands with the body at -58 degrees and the head at -38 (turned 20 degrees off the torso);
  a lineup turns the bodies to -40 so the builds' widths compare.
- **The S and the C show only if the clothes follow the waist frame:** a top lofted from the chest straight to the
  pelvis keeps the back a slab; the new top follows the skeleton's waist (the lumbar S standing, the soft C seated).
- **One arm off the body:** her teal bag hangs from the near hand (the arm eased away, a gap at the waist); the far hand
  in the coat's pocket, the elbow out. From behind both arms leave negative space.
- **Seated and leaning:** an arm reaching in front of the body takes its draw order from its wrist (seen from behind
  it goes behind the back; drawn on top, the hands read as on the hips); a hanging foot's shoe is lifted to its ankle.
- **Heights:** the body is drawn at her heights and warped (the head to the chin by the skull, the neck and torso
  stretched to fit, the legs taking the rest); the head and hair are drawn at the figure's own skull size.

**Level of detail:** the hair's tiers (a.6) follow the figure's drawn height; at 130-200 px the faces drop to EDGE
(PEOPLE_DESIGN's status), her LASH kept (the brief). The magnified views on the stills are drawn with the film-size
detail unless they say close.
