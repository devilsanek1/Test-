# Depth analysis: why v2's G4 look clip reads flat, in numbers (2026-10-27)

The owner on `deliverables/v2/v2r_G4_look.mp4` (S1, the canal opening): "the foreground and the main focus still blurs
with the background supporting entities ... the Google office vs the building on the background - they are all blurred
together ... there is no distance effect nor perspective here. Similarly the bottom part of the view - there is little to
no perspective or depth here at all. The shadows added are better." His rule is the playbook's DEPTH AND SEPARATION and
DIRECTION rule 2's depth clause. This page measures WHY the clip reads flat, against reference 1 and v1, and turns it into
a depth spec with numbers and checks: the proposal for `CRAFT.md` §f, which DIRECTION already points to.

**Rank:** research notes (the lowest rank). Nothing here is a rule until the integrator moves it into `CRAFT.md`.
**Companion:** `2026-10-27_effects_libraries.md` (the scout: libraries, the hue-kept `atmos()` colour operator,
particles). This page does not repeat it; where both give a number, they agree (§8.9).
**Tools:** `scripts/qa/retro_tools/depth/` (the scripts that produced every number here; frames stay in the scratchpad).

## 0. In short
- **The far city wears the wing's colours.** Same mean value (L* 74-76 against 76), more chroma, a redder hue (33-54°
  against the wing's and the air's 70-71°), as much contrast (0.8-1.1x the wing's) and the most detail in the frame
  (1.5-1.8x the wing's visible edges). Its windows are shrunk (the size says "far") but nothing else is: size says far,
  colour and contrast say near. In the references the farthest plane sits within ΔE 6-10 of its air, with its darks
  lifted to within 2-13 L* of the air, few values, and (in v1, fill-only like us) 0.14-0.44x the near plane's contrast.
- **The wing's silhouette melts at its top-west corner.** Its cream fin (L* 90) stands on the gold band (L* 88):
  |ΔL*| 2, 100 % "same value" over 150 px. Subjects in the references part from what is behind them by a median
  |ΔL*| 15-38, with at most 21 % of the silhouette on a same-value neighbour.
- **The bank is an elevation.** 82-84 % of its visible line length is level and none of it runs to the bank's
  vanishing point (540, 965): the slab joints do, but at |ΔL*| 3.3-3.6, under what reads at phone size. The one-point
  streets of the references put 19-44 % of their visible line length on one vanishing point.
- **Two cameras.** The far bank is drawn for a low camera (her eye ratio 0.76; 77 px/m per 100 px below the horizon),
  our side of the canal for a high one (19-41). The ducks and the seated public on our landing come out SMALLER per
  metre than her across the water (41 and 63 px/m against 100): a size inversion, which pushes the near ground away.
  The references hold one camera within ±7 % (reference 1) and ±12 % (v1).
- **The spec (§8):** declared planes with flat steps toward the lowest sky step behind them (the farthest within ΔE 10,
  ≤ 4 values, contrast ≤ 0.5x the subject plane's); a subject silhouette at median |ΔL*| ≥ 15 with ≤ 20 % on a same
  value; every ground the camera looks down on ≥ 20 % visible receding lines; one camera per shot and never a size
  inversion; tier = story role (weight), plane = distance (colour, size, texture): both apply.
- **S1 now (§10):** L1's depth pass (the G4 v2 clip) halved the far city's contrast and cut its chroma by ~40 %, and
  the ground pass in the code made the bank recede (68-75 % of its visible line length runs to its vanishing points,
  4-10 % level). Still open: the wing's corner (|ΔL*| 1.8), the far city's haze toward a colour that is not the sky
  behind it (ΔE 12-15), the light row on a light field (29 % same value) and the two cameras.

## 1. What was measured
- **Frames** (ffmpeg `-ss t -i file -frames:v 1`; scratchpad only): the G4 look clip at 0.5, 1.2, 3.0 and 5.4 s;
  reference 1 (`assets/ref/reference.mp4`, 1080 x 1350) at 1.0, 6.0, 15.5 and 17.5 s; v1
  (`deliverables/v1/php2shell_final.mp4`) at 1.0, 10.0, 20.5, 25.5, 38.5 and 45.5 s. For §10 also the G4 v2 clip
  (`deliverables/v2/v2r_G4_look_v2.mp4`) and a 0.4-scale still render of the code at 874799d (L1's ground pass).
  CINEMATIC_GUIDE's Arcane frames are not kept in the repo; their measured numbers are quoted from the guide.
- **Space:** CIE Lab (OpenCV, float RGB), frames 540 px wide unless said; §10 compares all three S1 states at 432 px.
- **Planes:** hand boxes per depth plane, near to far (the sun disc masked). The **air** is the colour right behind the
  farthest plane: in S1 the gold horizon band (#F6D9BC, L* 88), not the mint caption sky; in the references their sky
  or band behind the far city. Per plane: mean L*, C*, the hue of the mean colour, the darkest 5 % (L* p5), the L* range
  (p5-p95), local contrast (mean |L* − Gaussian(L*, σ 8)|, = CRAFT §e's σ 16 at 1080), visible edges (the share of
  pixels with a colour step ΔE ≥ 6 per px), value steps (6-L* bins holding ≥ 3 % of the plane), ΔE76 to the air.
- **Separation:** the subject's mask (a polygon, or GrabCut in a hand box), sampled every 4 px along its outline; at
  each sample the fill inside (2-8 px) against the fill outside (2-10 px), drawn dark lines left out of both bands. Per
  silhouette: median |ΔL*|, the share of samples with |ΔL*| < 5 ("same value"), the longest same-value run, and how often
  a drawn line sits on the edge.
- **Ground:** at 1080 px, Canny on L* and probabilistic Hough (segments ≥ 36 px); each segment's angle, length and
  cross contrast (|ΔL*| at ±3 px). Classes: horizontal (≤ 4°), vertical (84-96°), oblique; the vanishing point (VP) is
  the point most oblique length runs to (within 2.5°). Shares are of the line length, and "visible" means |ΔL*| ≥ 6.
- **Size:** px per metre of things of known size (from the scene's own numbers: `map.ts` S1_SHEET, V2S1_public, the
  ducks in V2S1_set; the references by eye from zoomed crops), against the base's height below the horizon. For one
  camera over one ground, px/m ÷ (px below the horizon) is a constant k (= 1 / the camera's height); for people it is
  the engine's eye ratio, `persp.tsx` `measureEye` = (feet − horizon) / height.

## 2. Planes: no atmospheric step at all
**The G4 look clip at 5.4 s** (0.5, 1.2 and 3.0 s agree within ±1.5 L*; the air is the gold band, L* 87.6, C* 18.2, h 70):

| plane, near to far | L* | C* | hue | L* p5 | L* range | local contrast | visible edges | values | ΔE to air |
|---|---|---|---|---|---|---|---|---|---|
| near treads (bike, planter) | 69.0 | 14.7 | 48 | 44.1 | 33.1 | 4.1 | 0.20 | 5 | 20.1 |
| mid treads (props) | 85.6 | 10.8 | 70 | 73.9 | 16.2 | 2.6 | 0.14 | 4 | 8.3 |
| landing (seated public) | 83.5 | 11.7 | 68 | 56.6 | 33.6 | 4.7 | 0.24 | 4 | 8.9 |
| canal water | 76.8 | 16.2 | 159 | 64.3 | 20.2 | 2.1 | 0.32 | 4 | 22.7 |
| far towpath, her and the row | 69.9 | 15.5 | 66 | 33.9 | 56.3 | 12.1 | 0.64 | 8 | 20.1 |
| **the wing (the main focus)** | 76.1 | 18.0 | 71 | 22.1 | 69.6 | 8.2 | 0.48 | 6 | 13.1 |
| **far city, front row** | 76.3 | 19.3 | 54 | 64.0 | 26.4 | 6.7 | **0.86** | 6 | 12.5 |
| **far city, back rows** | 74.2 | 15.5 | 33 | 52.5 | 37.8 | **9.0** | 0.73 | **8** | **18.3** |

**The references: the nearest building plane against the farthest plane**

| frame | near plane: L* / contrast / p5 / range / values / ΔE air | farthest plane: the same | far ÷ near contrast | far hue (air) |
|---|---|---|---|---|
| v1 @25.5 (far city behind the low sun) | mid city 62.9 / 8.8 / 27.5 / 56.2 / 7 / 26.6 | far city 81.0 / 1.3 / 78.0 / 5.7 / 1 / **6.9** | 0.15 | 66 (63) |
| v1 @38.5 (the wide city) | near rows 65.8 / 16.6 / 18.0 / 76.8 / 11 / 24.0 | farthest rows 69.8 / 2.3 / 65.8 / 15.2 / 4 / **8.8** | 0.14 | 165 (167) |
| v1 @1.0 (the plaza) | buildings 66.2 / 12.8 / 11.5 / 83.2 / 9 / 21.9 | far city 74.2 / 5.7 / 65.8 / 24.0 / 6 / **5.9** | 0.44 | 152 (167) |
| ref 1 @1.0 (the street) | mid facades 63.7 / 16.3 / 21.6 / 58.0 / 11 / 24.8 | street end 79.4 / 8.5 / 41.0 / 54.8 / 3 / **6.4** | 0.52 | 141 (167) |
| ref 1 @17.5 | facades 64.9 / 14.5 / 21.1 / 69.3 / 8 / 20.6 | glass tower 67.7 / 11.5 / 29.2 / 61.1 / 6 / **10.4** | 0.80 | 159 (166) |
| ref 1 @15.5 | facades 73.3 / 14.6 / 24.5 / 75.4 / 8 / 13.4 | glass tower 82.7 / 13.1 / 36.0 / 63.9 / 4 / **8.7** | 0.90 | 141 (166) |
| **G4 @5.4** | the wing 76.1 / 8.2 / 22.1 / 69.6 / 6 / 13.1 | far city 74.2-76.3 / 6.7-9.0 / 52.5-64.0 / 26.4-37.8 / 6-8 / **12.5-18.3** | **0.82-1.09** | **33-54 (70)** |

Reference 1 keeps an ink line on its far planes, so its far contrast and range stay higher; v1 draws its far planes
fill-only, as our clean pen does (`CRAFT.md` §c), so v1 is the model for the numbers.
- **The farthest plane takes its air.** It sits within ΔE 5.9-10.4 of the sky or band behind it, and it is always
  the building plane closest to that air; its hue turns toward the air's (v1 @38.5: 74 → 81 → 95 → 165° toward a 167° sky). In
  the G4 clip the far city's back rows are farther from the air (18.3) than the wing in front of them (13.1), and turn
  away from its hue.
- **Its darks climb to the air:** p5 within 2-13 L* of the air in v1 (65.8-78.0); the G4 far city's p5 is 24-35 L*
  under its air, because its windows are iron grey (`S1_IRON`, L* 64) and lamp yellow.
- **It holds few values and little contrast:** v1's two clean far planes hold 1 and 4 values (CINEMATIC's 5/5/4/3/2)
  and an L* range of 6-15, at 0.14-0.15x the near plane's contrast (0.44x at @1.0, whose far-city box also holds the
  sun's power symbol). The G4 far city has 6-8 values and the contrast of the wing in front of it, and its visible-edge
  density (0.73-0.86) is the highest of any plane in the frame: the busiest region is the one meant to recede.
- **One clear step from the subject's plane to the plane behind it:** ΔE 11.0-22.6 between their mean colours in the
  references (a wide vista of many rows may step ~5 per row, v1 @38.5, as long as the ladder keeps falling toward the
  air); the G4 wing to the far city: **5.6**. The far towpath, the wing and the far city read as one plane.
- **Code:** `V2S1_set_far.tsx` draws the three far rows in the near role colours (`CM.brick`, `brickLight`, `stucco`,
  `limestone`, `stoneShade`, windows in `S1_IRON`, `glass`, `lamp`): no step toward the air on any of them.

## 3. Separation: the subject against what is right behind it
Fill against fill (drawn lines left out), 540 px:

| silhouette | median \|ΔL*\| | p25 | same value (\|ΔL*\| < 5) | longest same-value run (1080 px) | a line on the edge |
|---|---|---|---|---|---|
| G4: the wing's west edge, all of it (y 610-930) | **2.9** | 2.1 | **54 %** | 152 px | 0 % |
| ... against the gold band (y 610-760) | **2.1** | 1.9 | **100 %** | **144 px** | 0 % |
| ... below the far roofs (y 760-930) | 16.1 | 10.0 | 14 % | 16 px | 0 % |
| G4: her (tier A) on the wing's wall | 26.8 | 18.8 | 17 % | 72 px | 92 % |
| G4: the copies' row (tier A) on the far city and bridge | 12.3 | 6.0 | 23 % | 64 px | 66 % |
| G4: the glass door (tier A at 0.5 s) on the wall | 11.4 | 4.9 | 25 % | 128 px | 100 % |
| ref 1 @17.5: the shelter (subject) | 35.6 | 26.5 | 0 % | 0 | 100 % |
| ref 1 @17.5: the near heads | 38.2 | 24.1 | 4 % | 40 px | 96 % |
| v1 @1.0: the near buildings on the far city | 14.7 | 11.2 | 11 % | 32 px | 100 % |
| v1 @10.0: the PHP house (subject) on the sky | 15.4 | 7.2 | 17 % | 168 px | 92 % |
| v1 @20.5: the walker (subject) | 32.1 | 17.9 | 1 % | 8 px | 92 % |
| v1 @25.5: the near heads | 18.6 | 8.3 | 21 % | 56 px | 75 % |

- The references part their subjects from what is behind them by FILL (median |ΔL*| 15-38, ≤ 21 % same value), and add
  a line on top. Our environment has no line (`CRAFT.md` §c), so the fill step is all there is.
- The wing's edge is fine where brick stands behind it (16), and gone where its lit cream fin meets the gold band (2):
  a light shape on a light field of the same value. The rule the references follow is the cozy guide's value sandwich:
  a lit edge goes on a darker field, a shaded edge on a lighter one.
- Her silhouette passes (her teal and plum on the peach wall). The light copies (oat coats L* ~85, white hair L* ~93)
  stand on a pale stone bridge and far city: 23 % same value, carried by their thin outlines only.

## 4. Ground: an elevation of bands
Visible lines (|ΔL*| ≥ 6), shares of their length:

| frame | horizontal | to one VP | other obliques | the VP |
|---|---|---|---|---|
| ref 1 @1.0, the street (one-point) | 23 % | **44 %** | 11 % | (675, 464) of 1080 x 1350 |
| ref 1 @6.0, the street with the crowd | 38 % | 33 % | 8 % | the same |
| v1 @10.0, the square (one-point) | 33 % | 19 % | 3 % | (567, 982); verticals 45 % |
| v1 @20.5, the side street | 28 % | 14 % | 8 % | (405, 1008); verticals ~50 % |
| v1 @1.0, the plaza | 40 % | 8 % | 20 % (shadow wedges) | |
| v1 @25.5 / @45.5, a parapet or rail across the foreground | 77-79 % | 0-1 % | 0-1 % | depth from the big near backs and overlap |
| **G4 @0.5-5.4, our bank** | **82-84 %** | **0 %** to its VP (540, 965) | 15-17 % (the bike, props, shadow wedges) | the joints DO run there, at \|ΔL*\| 3.3-3.6 |

- The tread spacing does grow toward us (90, 116, 152, 190 px: 2.1x; v1's square ~2.8x by eye), so the bank has some
  foreshortening; what it lacks is anything that runs INTO the picture at a value step you can see. The two stones of
  the slabs (`stucco` L* 91.3, `paving` 87.5) differ by 3.8 L*.
- The bank's values: landing 83.5, mid treads 85.6, near treads 69.0 (only where the bike and the planter are): no
  step darker per plane toward us (the cozy guide's 5/10/13/14 L*).
- A frontal foreground can work (v1 @25.5): there the depth comes from big overlapping backs of heads (|ΔL*| 18.6) and
  their scale. The G4 bank has neither: its things keep one size from the landing to the bottom edge (§5).

## 5. Size: two cameras and an inversion
k = px per metre ÷ (px below the horizon) × 100; one camera over one ground keeps k constant:

| shot | things (base y, px/m) | k | eye ratio (people) |
|---|---|---|---|
| ref 1 @6.0, the crowd (heads, horizon 464) | near 205 → farthest 27 px/m | **54-61 (±7 %)** | |
| v1 @20.5, four walkers (horizon 1008) | 26 → 160 px/m | **24-31 (±12 %)** | 1.9-2.4 |
| **G4, the far bank** (horizon 965 = the bank's VP): the storey 3.2 m = 288 px, the door, her 170 px | 90-100 | **77** | her 0.76 |
| G4, on the water: the ducks (24 px, 0.58 m) | 41 | **19** | |
| G4, our landing: the seated public (56-63 px) | 63 | **19** | 3.0 (as standing) |
| G4, our treads: cups, tote, backpack, skateboard, guitar case, bike | 145-253 | 21-41 | |
| code now (874799d, horizon 1000): her / the ducks / the landing's public / table and tote | 100 / 41 / 45-80 / 140-173 | **105** / 23 / 23 / 18-25 | her 0.56, the public 2.5 |

- The far bank is drawn for a camera about 1 m above its towpath, our side for one 2.5-5 m up. Whichever is "right",
  the two together put the ducks and the people on our landing (41-80 px/m) BELOW her px/m (100) though they are
  1.7-2.5x nearer: the eye reads small as far, so the near ground slides behind the far bank. Reference 1 and v1 keep
  one camera for every person in the frame.
- Our treads' things fit a horizon at y ~700 (k 16-27 against her 25): v1's own raised camera (her eye ratio ~2.3).

## 6. What the guides already say, and where S1 broke them
| rule (source) | G4 look clip |
|---|---|
| 3-4 planes, 5 in S1, each farther plane a value step paler and nearer the sky's hue; no haze, glow or gradient (`CINEMATIC_GUIDE.md` Rules 4) | 3 distinct in effect (wing, far city and towpath within ΔE 5.6-8.9 of each other); far city as dark as the wing, hue turned away |
| atmospheric steps toward the sky 0 / 12 / 22 / 40 / 65 %, values 5/5/4/3/2, lines by tier (Scale cues 5; dc kit `atm()`) | 0 % on every far row; 6-8 values |
| darks climb to the sky (Scale cues checklist) | far darks 24-35 L* under the air |
| windows shrink with the plane; mid ones tone-on-tone within dL* 15, far none, never dark specks (Scale cues 2) | the sizes shrink (4-11 px); the colours do not: iron grey and lamp yellow |
| tier C: local contrast ≤ 7, C90 ≤ 25 (`CRAFT.md` §b) | the far city 6.7-9.0 and 28-34 on its own plane (the scout: checked only over the whole environment, it passed) |
| the value sandwich: the darkest mass right behind the seam, so light figures pop (`COZY_AND_SCALE.md` 3b.2) | the light row on the lightest stretch; the lit fin on the band |
| a value step darker per plane toward the viewer, 5/10/13/14 L* (COZY §4) | landing 83.5 → mid treads 85.6 (lighter) → near treads 69.0 |
| riverside backdrop: each farther row ~10-15 L* lighter (COZY 3b.2) | far rows 76.3 → 74.2 (darker) |
| riverside: "depth by overlap and stacking upward, no vanishing lines" (COZY 3b.2) | applied to the WHOLE frame, our bank included: the clash behind the flat bank (fixed in COZY with this page, §11) |
| one eye-level camera; check `measureEye` (`persp.tsx`) | two cameras (k 77 against 19-41) |

## 7. Diagnosis in plain words
1. **Every depth cue disagrees with the others.** The far city is small (far) but as dark, saturated, contrasty and
   busy as the wing (near); the people on our landing are low in the frame (near) but tiny (far). When cues disagree,
   the eye gives up on distance and reads one flat poster: the owner's "blurred together, no distance effect".
2. **Light against light at the subject's edge.** The pale palette puts the lit cream fin on a gold band of the same
   value; no line on tier C rescues it. The one fix is a value step: a darker field behind a lit edge.
3. **The bank was built as an elevation.** Treads as full-width level bands in two stones 3.8 L* apart, things of one
   size on every tread: nothing runs into the picture where you can see it.
4. **The rules existed but nothing measured them per plane.** The tier-C budget passed as an average over the calm sky,
   water and bank; the atmospheric ladder lives in the dc kit but S1's far rows never called it; the riverside recipe
   said "no vanishing lines" without saying "on the far side".

## 8. DEPTH SPEC (proposed `CRAFT.md` §f; warnings with numbers, like §b)
**8.1 Planes and the air.** Every set declares its planes in its W1 world bible and on the G3 board: plane 0 = the
subject's plane; −1 the foreground; +1 ... +4 farther. 4-6 planes in a shot (5-7 on a vista). Each plane names its
**air**: the lowest sky step right behind it (DIRECTION rule 6, one continuous sky). Distance and story role are two
separate axes, and both apply to everything: the TIER sets the weight (outline, contrast inside its plane, motion), the
PLANE sets the colour, size, texture scale and how simple it is.

**8.2 Atmospheric steps (flat, one fixed step per plane, never a gradient).** Plane +k takes one step toward its air,
0 / 12 / 22 / 40 / 65 % for k = 0 ... +4, on every fill of the plane, windows and dressing included, with the hue kept
(the scout's `atmos()`; a straight sRGB mix toward a sky of the other temperature turns brick tan or grey). A backlit
plane takes the rig's form shade first. Targets, measured on its pixels:
- the farthest plane's mean within **ΔE 10** of its air (references 5.9-10.4; G4 12.5-18.3); ΔE to the air falls plane
  by plane going away (≥ 3 per step), the farthest plane the closest;
- one clear step between the subject's plane and the plane behind it: **ΔE ≥ 12** between their means (references
  11.0-22.6; G4 5.6);
- the farthest plane's darks within **20 L*** of its air (v1 2-13; G4 24-35), its L* range ≤ 15 (v1's clean far planes
  6-15), ≤ 4 values (v1's 1 and 4; CINEMATIC 5/5/4/3/2);
- its local contrast ≤ **0.5x** the subject plane's (v1 0.14-0.44; G4 0.82-1.09) and ≤ 4; its visible-edge density
  ≤ 0.5x the subject plane's (v1 0.17-0.19x; G4 1.5-1.8x);
- its chroma moves toward its air's, never under C* 8 (never grey); hue within 30° of the air's, or in the rig's shade
  family when it is backlit;
- far windows and small parts are the wall's own colour one tone-on-tone step away (ΔE ≤ 6 from the wall), never a dark
  speck, never the lamp colour (one story window may be one soft step lighter);
- planes nearer than the subject (−1) take no air: they read near by size, overlap and a value step darker or warmer
  (the cozy 5/10/13/14 L*), under tier C's contrast cap.

**8.3 Separation.** Sampled along the silhouette as in §1 (fill only):
- **tier A:** median |ΔL*| ≥ **15** (references 15-38), ≤ **20 %** of the silhouette on a same value (|ΔL*| < 5), no
  same-value run over 60 px. Her: 26.8 / 17 %; the copies 12.3 / 23 %; the door 11.4 / 25 %.
- **the subject plane's big masses against the plane behind them** (a building's outline, tier C): median ≥ **12**,
  ≤ 25 % same value, no same-value run over 100 px (the wing's corner: 2.1 / 100 % / 144 px).
- How: a lit edge on a darker field, a shaded edge on a lighter one; overlap, never a tangent; where the field changes
  along an edge, the edge's own value changes with it (counterchange). A tier-A outline helps; it never replaces the
  fill step.

**8.4 Ground perspective** (any ground the camera looks down on: a street, a floor, steps, a quay, a plaza):
- one horizon per shot from its camera (`eyeLevel` or the set's VP), shared by every ground, wall and figure;
- ≤ 60 % of its visible line length horizontal and ≥ **20 %** running to the shot's vanishing point(s) (references
  19-44 %; G4 0 %; the code now 68-75 %); a receding line counts when it is a visible step: |ΔL*| ≥ 6, or a flat tone
  band ≥ 3 px wide;
- spacing grows toward us ≥ 2x from the ground's far edge to its near edge (v1's square ~2.8x by eye; G4 treads 2.1x;
  the code now 4.4x), and blocks, joints and litter get finer with distance (lay them out flat in the plane's own
  coordinates and project them: `lib/persp.tsx`);
- a frontal ground (riverside steps, a quay seen square on) still needs things that run into the picture (a stair end
  or cheek, a kerb, bollards, a rail, a row of rings) or a 15-30° turn into two-point (L1's ground pass), plus §8.5;
- values: each nearer ground plane one step darker or warmer than the one behind it.

**8.5 Size: one camera.**
- No size inversion: a thing of known size on a nearer plane is never drawn at a smaller px/m than one on a farther
  plane (G4 and now: the ducks and the landing's public at 0.4-0.8x her px/m). This is the strongest warning of the spec.
- People on one ground level keep one eye ratio (feet − horizon) / height within ±15 % (reference 1 ±7 %, v1 ±12 %);
  a different level (a stair, a quay above the water) shifts it by that level, never by more.
- If the true sizes make the foreground too big, raise the camera (a higher horizon compresses near against far),
  crop, or move the thing to the plane where its size is right; never shrink it to calm it (calm is tier B's colour and
  contrast).

**8.6 Overlap.** Each plane overlaps the one behind it somewhere (a lamp post across the wing's edge, the bridge across
the far rows); one near repoussoir is cut by the frame (COZY 3b.2).

**8.7 Particles: depth through motion** (the scout's §6 has the craft and the code). On a locked or floating camera a
few small flat movers at 2-3 depths are the parallax: size and speed scale with the plane (near ones 2-3x the far ones
in both), each in its plane's colour step; 4-8 at once at most, tier C, outside the caption band, nothing new in the
0.4 s around a join, a pure function of the frame and a seed.

**8.8 Tier and plane together.**
- The plane sets colour, size and texture for every element; the tier sets weight on top: the subject on a far plane
  takes at most HALF its plane's air step (it may read one plane nearer), keeps its outline and the §8.3 separation
  (Arcane's landmark: "the darkest far shape against the palest cloud"; v1's far house kept full contrast).
- Tier B (people near the story, the mascot) keeps its plane's size and is calmed by colour and contrast only.
- Tier C takes the full plane step; its contrast cap (§b) is checked PER PLANE, not averaged over the environment.
- Atmospheric steps help the hierarchy: the far planes' contrast at ≤ 0.5x the subject plane's is attention given back
  to the subject.

**8.9 Agreement with the scout's numbers.** The scout proposes the plane right behind the subject at local contrast
≤ 0.6x and C90 ≤ 0.7x the subject's (that is the +1 step; §8.2's 0.5x is for the farthest), and |ΔL*| ≥ 12 along ≥ 70 %
of a silhouette (§8.3's masses: ≥ 12 median, ≤ 25 % same value; tier A is held tighter at 15 / 20 %).

**8.10 Owner decisions (not in this spec).** A continuous fog (a gradient toward the horizon), depth-of-field blur, a
glow or bloom: DIRECTION forbids them, and the references reach depth without them (v1's flat steps). A parallax float
(each plane drifting at f = 1 − depth) changes COZY 3b.5's one-card float: the scout's item 7.

## 9. How to measure (for `scripts/qa/check_depth.py`; the research code is `scripts/qa/retro_tools/depth/`)
- **Input:** a still, plus a per-shot depth sheet (JSON): the planes (name, index, boxes or polygons; or an A/B render
  with a `planesOff` prop, the way `check_light.py` uses `lightOff`), the air box per plane, the tier-A silhouettes
  (polygon, or a GrabCut box) and the masses whose edges matter, the ground box and the set's horizon / VPs, and the
  things of known size (name, plane, base y, px, metres: from the scene's own map, e.g. `S1_SHEET` and FOOT lists).
- **Planes** (`depth_measure.stats`): per plane L*, C*, hue, p5, range, local contrast, visible edges, values, ΔE to
  air; WARN on any §8.2 target, on a ΔE-to-air ladder that does not fall, and on the subject-plane step < 12.
- **Separation** (`depth_measure.separation`): per silhouette median |ΔL*|, same-value share, longest run; WARN on §8.3.
- **Ground** (`depth_measure.ground`, with the shot's declared VPs): visible shares level / to the VPs / other, the
  found VP against the declared horizon (±3 % H), and the receding lines' median contrast; WARN under §8.4's targets,
  "elevation" when ≥ 70 % is level and < 10 % recedes, and "invisible perspective" when the receding lines exist under
  |ΔL*| 6 (G4's case).
- **Size** (`run_scale.py`): px/m and k per thing, eye ratio per person; WARN on any inversion and on k spread > 1.35x
  on one ground level.
- **When:** the G4 look clip (every film), each G5 lane's stills at its key times, at 432 px (0.4 scale) or 540 px; the
  numbers here are at 540 px unless said (the local-contrast σ scales with the width).

## 10. S1: what to change (the G4 clip, its v2, the code now)
**Measured at 432 px, 5.4 s** (3.0 s agrees):

| | G4 look clip (the owner saw) | G4 look clip v2 (L1's depth pass) | code now (874799d, the ground pass) | target (§8) |
|---|---|---|---|---|
| far city front row: L* / local contrast / visible edges / ΔE to the band | 76.2 / 6.6 / 0.85 / 12.6 | 81.8 / 3.3 / 0.38 / 11.7 | 82.0 / 3.2 / 0.33 / 12.6 | — / ≤ 4.3 (0.5x the wing's 8.6) / ≤ 0.22 / ≤ 14 |
| far city back rows: the same | 74.0 / 9.2 / 0.74 / 18.5 | 81.2 / 4.8 / 0.44 / 14.6 | 81.4 / 4.8 / 0.41 / 15.4 | — / ≤ 4 / ≤ 0.22 / ≤ 10 |
| step wing → far city / front → back rows (ΔE) | 5.6 / 8.9 | 7.5 / 3.2 | 7.8 / 3.1 | ≥ 12 / ≥ 3 |
| far city hue (the band 72°) / darks p5 | 54-32° / 54-64 | 48-36° / 72-75 | 48-38° / 72-75 | toward the air / ≥ air − 20 (68) |
| wing's west edge below the far roofs: \|ΔL*\| / same | 14.8 / 6 % | 12.2 / 12 % | 12.1 / 6 % | ≥ 12 / ≤ 25 % |
| wing's west edge on the gold band: \|ΔL*\| / same / run | 2.0 / 100 % / 150 px | 2.0 / 100 % / 150 px | 1.8 / 100 % / 150 px | ≥ 12 / ≤ 25 % / ≤ 100 px |
| the copies' row (tier A): \|ΔL*\| / same / run | 11.8 / 24 % / 60 px | 11.1 / 27 % / 150 px | 11.2 / 29 % / 170 px | ≥ 15 / ≤ 20 % / ≤ 60 px |
| her (tier A) | 25.0 / 12 % | 25.1 / 10 % | 25.6 / 12 % | ≥ 15 / ≤ 20 % |
| our bank's visible lines: level / to its declared VPs | 83 / 0 % | 88 / 1 % (joints at \|ΔL*\| 3.6) | **4 / 75 %** (3.0 s: 10 / 68 %) | ≤ 60 / ≥ 20 % |
| our bank's values, landing → mid → near | 83.5 → 85.6 → 69.5 | 82.4 → 83.0 → 78.6 | **83.8 → 80.0 → 73.7** | a step darker each |
| k (px/m per 100 px below the horizon): far bank / our side | 77 / 19-41 | 77 / 19 (landing, ducks) | 105 / 18-25 | one camera (±15 %) |

**Done by the depth pass and the ground pass:** the far city's contrast, chroma and darks (back rows' contrast 9.2 →
4.8, darks +18 L*); a calmer plain block behind the wing's lower west edge (its edge step went 14.8 → 12.1: still at
§8.3's floor, not darker); the bank in two-point perspective with value steps toward us. That answers most of "the
bottom part" and half of "the Google office vs the building behind".

**Still to do, in order of effect** (L1's files; this page changes none of them):
1. **The wing's top-west corner** (y 610-760, 150 px of its silhouette on the band at |ΔL*| 2). With the new
   continuous sky (DIRECTION rule 6) the band becomes the lowest sky step, still light. Give the lit fin a darker field
   (a backlit far silhouette, the gasholder or the far rows, rising behind the corner to the parapet at ≤ L* 76: the
   fin at L* 90 then parts by ≥ 14), or put the corner in the wing's darker material (brick `#C9806A`, L* 61: a pixel
   mock gave the whole west edge median 11.0, 10 % same value). Not `brickLight` (L* 74) while the far rows sit at
   L* 72-78: they match (95 % same value in the mock).
2. **Haze toward the sky behind the far city.** `S1_HAZE` (#EADCD8, a rose at h 42, C* 5.5) is not the band behind
   the rows (#F6D9BC, h 72), so the rows end ΔE 12-15 from their air with a hue 24-34° off it, and the front and back
   rows now share one value (ΔE 3.1 between them). Take the haze from the redesigned sky's lowest step, step the rows
   apart again (front row ≤ ΔE 14, back rows ≤ 10 from it, ≥ 3 between them), and keep the far city ≥ ΔE 12 from the
   wing. Hue kept (the scout's `atmos()`: brick at 40 % → #D9A493, L* 72, C* 24), so nothing goes tan or grey.
3. **A darker field behind the light copies** (the value sandwich): the haze made the bridge and the far rows behind the
   row paler, and the row lost separation (24 → 29 % same value). Keep the bridge's band behind their bodies at
   L* ≤ 70 (its brick spandrels; the bridge is plane +1 or +2, so a 12-22 % step, not today's 30-36 %) and the far rows
   behind their heads at L* ≤ 78. The glass door (tier A in 0.45-1.40) is borderline too: 11.4 / 25 % at 0.5 s.
4. **The size inversion.** The seated public on our landing (43-80 px, eye ratio 2.5 against her 0.56) and the ducks
   (22-26 px) are smaller per metre than her across the water. Cheapest: put the public where 50-80 px is right (the far
   towpath, the bridge, a far quay) and keep our landing for things and Pip; ducks at ≥ 55 px long, or none.
5. **One camera.** The far bank is drawn for a horizon at y 965-1000 (her eye ratio 0.56-0.76), our bank's things for one
   near y 700 (k 16-27 against her 25 there). Either keep the low camera and draw our side's things 3-5x bigger (a few
   big things cut by the frame), or raise the horizon to y ~720-760 (her eye ratio ~2, v1's camera) and move the ground's
   VPs with it; the far rows then rise toward the horizon, behind the wing's corner, which also serves item 1. A
   composition call for L1 and the orchestrator; until it is made, item 4 removes the inversion.
6. **Particles** at 2-3 depths in the empty `S1Particles` slot (motes in the low sun's light by the far bank, a leaf
   or two over our bank, glints in the sun's glitter column on the water), sized and paced by plane (§8.7).

## 11. Doc fixes made with this page
- `COZY_AND_SCALE.md` 3b.2 RIVERSIDE said "depth by overlap and stacking upward, no vanishing lines" for the whole view;
  against the owner's "a ground plane that recedes" (playbook DEPTH AND SEPARATION) it is now the far side only, and any
  ground in front of us recedes (DIRECTION rule 2). 3b.1's "no vanishing point at all is the coziest vista" now says the
  far END is closed, not that nothing recedes.
- Left for the integrator: the dc kit's comments still say "ink full, full, hairline, none, none" by plane (`core.tsx`
  `INK_AT`, the retired line-by-depth ladder; the clean pen overrides it), and its `atm()` mixes toward the mint sky in
  sRGB (the scout's §4 has the fix).
