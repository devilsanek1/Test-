# Video 4, the G3 camera plan (the contract draft; `G3_ANIMATIC.md` §5 step 2)

**Status:** the camera plan for G3's board (2026-10-30, lane A1), one row per block of the locked visual script v3
(`visual/VISUAL_SCRIPT.md`; the same shot ids and times). It adds only what words can't fix: the numbers (offsets, scale
%, px, frames), the tier map, the set's rig (from W1, `WORLD_BIBLE.md` §2), the `life:` list and the promise line. G3
restages nothing: a change here that changes a block reopens the visual script (starred, dated). Where the board's
thumbnails (step 3) find a number wrong, the number moves and the block stays.
**Inputs:** the visual script v3; W1 (`WORLD_BIBLE.md`: the one camera §1.0, the sets §1, Rig H and Rig P §2, the colour
script §4, the tiers §5, the people §6); the composition pass draft (`visual/COMPOSITION_PASS.md`: its px, kept where
they fit one camera); `docs/look/COMPOSITION_SHOTS.md` (codes, tiers, Part 0b); `LAYOUT.md` §1-2; `TYPE_GUIDE.md` (the
caption recipes); `SOUND_SYNC.md` (the cue types); the take `public/v4/voice_words.json` (42.24 s).
**Conventions:** px at 1080 x 1920, y down; a frame is round(t x 60) on the take's clock; "1x" is the home view; a move's
five values are its word, its duration, its start and end (scale and anchor), its anchor (what holds), its ease. The
caption band y 290-600 is one flat field at every frame (every top at y >= 614); the golden box x 413-667, y 951-1187;
the drop = the focal's distance under the caption block's foot (y 556), 300-450 px, 650 at most; key reads in x 130-870
below y 860; nothing to read at y >= 1519 or under the right rail (x > 877 from y 1032). Speeds: detailed layers <= ~15
px/f, big simple masses and leaving edges may pass faster (a WARN, settled at the 1x watch).

## 1. The one camera and the home view in numbers

**The camera (W1 §1.0, kept):** a standing eye, ~1.6 m, at the street's near edge, level; horizon **y 1150**, one-point,
VP (540, 1150); focal ~1160 px, so a thing H m tall at d m is 1160·H/d px, its foot at y 1150 + 1856/d. One camera per set
(setup A): every home-place shot keeps this height and horizon; only S6 leaves it (inside its hand-off, where nothing
reads). W1 made the call (§7 call 6): y 1150, 0.60 H, meets `LAYOUT.md` §2's street range (to y 1152) and setup A (from
y 1150); this plan's other px were laid on y 1170 (2026-10-30 reconcile: only the horizon changed here), so its 1x
positions sit about 20 px under W1 §1.0-§1.1's: G3's thumbnails (step 3) move them, as the status line says.

**One fix to the composition pass and to W1 (the computer's place):** the closes need the computer's top >= 650 px wide
(N9) after two pushes of at most 2x (S1 -> S2 1.56x, S2 -> S3 2x), so the home view's computer must be >= ~210 px wide.
W1's computer (4 m wide at ~32 m) is 145 px wide and cannot get there; the pass's 216 px fits, but its foot at y 1216
under a 378 px body makes it ~13 m tall behind a ~10 m block. Under one camera the computer is **~7 m tall (about 2
storeys) and ~4 m wide, standing at ~21.5 m**, nearer than the block (~37 m), on the quay that comes forward at the
street's end: **216 x 378 px, x 66-282, y 878-1256**, about two-thirds of the block's height on screen. Every close's
px below (the pass's, which W1 copies) holds, because each is relative to the computer's box.

| piece (1x, the home view) | where (px) | in metres (one camera) | job |
|---|---|---|---|
| the sky with the band | y 0-1100; the band y 290-600 one flat field | | the top quiet field (~45-50 % of the frame) |
| the hero snow cloud | x 0-520, y 60-280, cut by the left edge | | the soft counterweight (D4), across from the focal |
| the far city | a belt on the horizon, tops y 1110-1150 (its tallest pieces to ~1100) | 1-3 km | tier C; the 70,000 wave lands here |
| the harbour | y 1170-1205 | 40 m+ | the mid band: the ferry, ice floes |
| **the giant computer** | **x 66-282, y 878-1256**; its lights' centre ~(174, 1010) | 7 x 4 m at ~21.5 m (54 px/m) | the cause; left third; its left 32 px under the feed's crop (a mass) |
| the plan's footprint (S1) and walls (from S2) | footprint on the snow, front edge y ~1270 (x ~-8 to 356), back edge y ~1246 (x ~37-311); walls ~9.3 m: tops y >= 682 at 1x | ~5.8 m wide x 6 m deep, front at ~18.5 m, back open to the harbour | marked out; its right edge >= 20 px off the block's (no tangent) |
| the block | x 378-812, roof y ~690, foot y ~1220 | 5 storeys, ~17 x 14 m at ~37 m (31 px/m) | the dark mass on the axis; ~20 windows as one row with one break |
| **the one window** | **(598, 985), 68 x 88**; the radiator under its sill at ~(598, 1050) | 3rd floor | **the focal**: the golden box, drop 429 px |
| the next block | x 812-1080, roof ~740-760, cut by the right edge | | quieter; Pip's balcony ~(845, 905) |
| the street | y ~1205-1920 (the far kerb y ~1220, the near snow from ~1300) | 11-37 m | the bottom quiet field (~30 %) |
| **the run** | leg 1, the plan's stretch: (160, 1252) -> the manhole (420, 1226); leg 2, the city's pipe along the far kerb: -> the door (560, 1222); leg 3, the soft cut up the wall: -> the radiator (598, 1050); ~578 px | | the thread: the melt line, the manhole's steam, the riser's cut |
| the resident (S1) | x ~780, feet y ~1340, ~180 px (head top ~1160, on the horizon line); walking away to the left at ~1 m/s, ~150 px by 3.92 s | 1.7 m at ~11 m, to ~13 m | tier B: the person near the camera (rear three-quarter) |
| the near frame | two snow-capped bollards cut by the bottom-right corner (x > 900, y > 1700) | | the hint at the edges (rule 10), a mass under the UI |

**The notan** (W1 §0, §4; T3 as a night): the sky dark at the top (26) with the band flat (31), lightening to the horizon
glow (64); one dark belt against it (the block 23, the computer 16, the far city 48 into the air); the snow a mid field,
light far (50) and dark near (31); the one window the hardest step (95 on 23). At G3 these are the board's grey steps
(the far paler, the near darker), the window the board's lightest mark below the band.

## 2. The plan at a glance (one row per shot)

| shot | time · frames | type · size | lead (tier) · recipe | the move: word, duration, start -> end, anchor, ease | the join out: code (carrier), frames | cozy / scale |
|---|---|---|---|---|---|---|
| S1 | 0.00-4.28 · f0-257 | WIDE · 1x, the home view | D7 (CORE) · SR1 + SR8; T as RM8 | HOLD, 3.92 s, 1x, the home view, locked | RJ4 (C): push in-and-left f235-341, fastest f257 | cozy: the street, a lit window, a person near the camera; scale from the vast sky and the far city |
| S2 | 4.28-8.76 · f257-526 | WIDE -> MEDIUM · 1.56x | Z3 (SIT); C1 from "buildings" | PUSH IN-AND-LEFT (one dolly), 1.77 s, 1x -> 1.56x, the computer (174, 1067) -> (540, 1215), in-cubic 22 f + out-cubic 84 f | RJ4 (C): lean-in f493-541, fastest f524 | the mechanism's medium; the plan's walls a frame within the frame |
| S3 | 8.76-10.96 · f526-658 | CLOSE · 3.12x | N9 (CORE) · SR12 | PUSH IN (lean-in), 0.8 s, 1.56x -> 3.12x about the top's centre (540, 930), in-cubic 31 f + out-cubic 17 f | RJ4 + I4 (C): pull f638-744, fastest f658 | close: one object |
| S4 | 10.96-17.76 · f658-1066 | MEDIUM · 1.56x | D7 (CORE) · SR21; D5 (RARE, once) | PULL BACK (a story pull, I4), 1.77 s, 3.12x -> 1.56x about the steam column's top (540, 590), in-cubic 20 f + out-cubic 86 f | RJ4 (C): push f1040-1085, fastest f1064 | the lineup: one cause above many |
| S5 | 17.76-19.26 · f1066-1156 | CLOSE · 3.12x | N9 (CORE) · SR12 | PUSH IN (up the column), 0.75 s, 1.56x -> 3.12x about (540, 470), in-cubic 24 f + out-cubic 21 f | RJ4 + I12 (C): the big move from f1130 | close: the joke, the pivot set |
| S6 | 19.26-23.46 · f1156-1408 | CLOSE -> EXTREME WIDE · the nested pull | D2 (CORE) · SR17 | PULL BACK, the one big move (I4 at scale, nested), 2.35 s, f1130-1271, the pivot (540, 955) held +-40 px, S5_EASE cubic-bezier(0.55, 0.03, 0.50, 1.0); locked f1271-1402 | **RJ2 (F)**: the plain cut at f1402 | SCALE: the one big move |
| S7 | 23.46-25.54 · f1408-1532 | WIDE · ~1.07x, from the street's start | N15 (RARE, once) · SR18 | SETTLE IN, 1.04x, keyed f1372-1442 (cut into at f1402), the computer's top, out-cubic; locked f1442-1513 | RJ4 (C): push in-and-left f1513-1550, fastest f1530 | the turn: off-balance, an open half |
| S8 | 25.54-28.34 · f1532-1700 | MEDIUM · 1.3x | C1 (CORE); Z4 | PUSH IN-AND-LEFT (re-centring), 0.62 s, 1.07x -> 1.3x, the computer (330, 1005) -> (540, 1205), in-cubic 17 f + out-cubic 20 f; then locked | RJ4 (C): dolly f1678-1716, fastest f1698 | the plan as the frame within the frame |
| S9 | 28.34-29.56 · f1700-1774 | MEDIUM · 1.5x | E2 (CORE); C1 | DOLLY IN through the plan's open front, 0.63 s, 1.3x -> 1.5x, the computer (540, 1205) -> (540, 1124), the front wall faster (parallax), in-cubic 20 f + out-cubic 18 f | RJ4 at rest (C) | the lit opening |
| S10 | 29.56-34.46 · f1774-2068 | MEDIUM · 1.5x, S9's frame held | E2 kept (the held frame); B2, D7, E9 support | HOLD, locked, f1716-1979 | RM3 (C): the one follow from f1979, cruising on "Then" | scale by repetition: the hall far wider than the frame |
| S11 | 34.46-38.48 · f2068-2309 | WIDE · 1.5x -> 1.15x | E3 (SIT); B8 | FOLLOW (RM3 + I12), 3.82 s, f1979-2208, a dolly back and right on one straight path, the front held at x ~410 (+-40), trapezoid (accelerate to f2040, cruise, decelerate f2150-2208); locked f2208-2286 | RJ4 (C): pull back f2286-2326, midpoint f2306 | cozy: the street, the block, the lit window, a person at home |
| S12 | 38.48-42.24 · f2309-2534 | WIDE, POV · 1.15x -> 1x | N14 (CORE) · SR24 + SR13 | PULL BACK, 0.67 s, 1.15x -> 1x about the window ((600, 1000) -> (598, 985)), in-out cubic, f2286-2326; locked f2326-2534 | RJ3 (B): the loop, the un-paint f2479-2534 | cozy and scale: the whole run, your hand |

**Counts:** 9 different leads (D7 x2, Z3, N9 x2, D2, N15, C1, E2 held over S9-S10, E3, N14; the library asks 6-9), 9 of 12
shots CORE-led, one RARE lead (N15); joins C x10, F x1, B x1; the one big move once; one story pull (S3 -> S4) besides
it, not next to it; one follow; two draw-ons after frame 0 (S2's un-paint, S7's reach), the loop's aside; three light
events (S1's window and its wave, S8's walls, S12's warm step). Neighbours differ in size or device at every join.

## 3. The shots

### S1 · 0.00-4.28 · f0-257 · the opening
- **Shot type · framing:** WIDE, the home place (§1's table exactly; this frame is also S12's and the loop's). The focal
  the one window (598, 985), drop 429; before "heat" the eye rides the brush tip, then the computer on "AI" (174, 1010).
- **Cozy / scale:** the street held by the block and the plan site; the vast sky (~45-50 %) and the far city past both
  edges for the scale; the resident near the camera, a real person's size.
- **Move:** HOLD · 3.92 s (f0-235) · 1x -> 1x · the home view · locked. Element moves (the RM8 build, then RM6):
  - f0-36: the brush lays the run, (160, 1252) -> (420, 1226) -> (560, 1222) -> (598, 1050), ~578 px at ~16 px/f (rule
    13's pen tip <= 25), ease in-out; lands in the golden box at f36.
  - f0-60: the world paints on in a painter's order, each piece its own beat (the reveal forwards): the sky's washes and
    the hero cloud (f0-20), the harbour and the far city (f20-38, landing on "Helsinki" f38), the street and its snow
    (f30-50), the block and its window, unlit (f40-60); the resident painted mid-stride with the street (no onset of her
    own).
  - f28-122: the warm water from the run's left end at ~6.1 px/f, its melt opening just behind the front, widening past
    the manhole (~f70; no puff here: the hook keeps its count).
  - f76-84: the brush paints the computer at the source (its fill lands f84, 6 f before "AI"); its footprint marks
    itself out round it; its lights come on.
  - f122-134: the window W0 -> W1 (a 12 f ramp, the bloom at the pane only), its frost clearing and the sill's snow melting
    over f122-150.
  - f140-235: the wave: the street's windows (f140-165), across the harbour (f165-175), the far city's belt (f170-205),
    each a step under the one window, never a second break.
  - f30-257: the resident walks away to the left at ~1 m/s (180 -> ~150 px), stepped poses (held ~5 f); the push of S2
    leaves her behind on the right.
- **Join:** RJ4 (C) -> S2, the brush tip the carrier: f235 the tip comes back onto the radiator and runs back along the
  run (un-painting, ~6 px/f), the camera 2-4 f behind it; nothing enters f245-269 (the 0.4 s round "AI" f257).
- **Tiers:** A the brush tip and the run (to f90), the computer as it is painted (f84), the one window (from f122), the
  wave (f140-235) · B the resident, Pip, the computer's lights after "AI" · C the sky and clouds, the far city until
  the wave, the harbour and ferry, the far tram, the block's facade, the next block, the street's snow, the falling snow.
- **Rig (W1 Rig H):** the key the blue hour's afterglow, screen LEFT, a sky light on tops and left faces (thin cool rims
  by tier, contact shadows, no long casts); the story light the one window (W1 from "heat": the spill on its sill and a
  trapezoid on the facade under it); the second source the computer's small lights (a cool pool on the snow round its
  foot, a flattened ellipse rx ~1.2x its width, ry/rx ~0.25); the one shadow value the board's mid grey, to the right of
  things.
- **life:** snow (3 depths: near 8-12 px slow, mid 4-6, far 2-3) · the resident walking · the ferry crossing the harbour ·
  a far tram on the far shore · the computer's lights blinking (after f84) · 2-3 window silhouettes at rest · the clouds
  drifting (0-6 px/s) · Pip's blink.
- **Promise:** grey belt on the horizon = the far city's roofs, cranes and a dome, lit by the wave; tone rows on the block
  = ~20 windows (unlit, lit, curtained, a plant, a candle bridge, two silhouettes); scribble at the block's foot = bikes
  under snow and the door's canopy; marks on the near snow = tyre tracks and footprints running into the picture; the
  left third's lines = the plan's footprint, marked out.
- **Captions:** R2 at 136 px: "Did you know" from f0 (line 1 from x ~120, baseline 395), "Helsinki" builds at f36 (line 2,
  baseline 525); "wants AI / to heat" at seat R f64-138; R3: "70,000" lit at f138 (baseline 482), "homes?" at f203
  (baseline 578, its right edge ~x 930), to f254.
- **Sound:** T the brush's sweep over air (no bed) · H f36 the ding · H f84 a low soft hit · H f122 the radiator's tick ·
  H f170 one soft chime · S f235 the bed enters small.
- **Pip:** on the next block's snowy balcony ~(845, 905), 40-60 px, 273 px from the focal, off the run and the words.

### S2 · 4.28-8.76 · f257-526
- **Shot type · framing:** WIDE -> MEDIUM. Lands at 1.56x on the computer: **337 x 590, x 372-708, y 920-1510**, its
  lights' centre ~(540, 1050) in the golden box (drop ~494, under 650); behind it the harbour and the far belt low against
  the glow. From "buildings" the plan's walls on three sides (front, left, right; the back open to the harbour), their
  posts at x ~255 and ~825 (the 5.8 m plan of §1), tops y >= 625: a frame within the frame ~24 % of the frame (C1's
  15-30 %; the pass's posts at x 110 and 970 made it ~37 %).
- **Cozy / scale:** the mechanism at the explainer's working size; the walls hold it.
- **Move:** PUSH IN-AND-LEFT (one straight dolly toward an off-axis target: one move, rule 12) · 1.77 s (f235-341) · 1x
  -> 1.56x · the computer (174, 1067) -> (540, 1215) (the zoom's fixed point at ~(-480, 803), off the frame's left) ·
  in-cubic f235-257 (fastest on "AI"), out-cubic f257-341 (landing on "giant"). Speeds at the peak: the computer ~11
  px/f; the window leaving to the right ~17 px/f, the frame's right edge ~25 px/f (WARN: leaving masses; the eye rides
  the brush tip). Then locked f341-493.
- **Element moves:** f235-341 the un-paint (the run's warm water and melt lifted from the radiator back to the computer,
  the sill's snow whole again, the frost back on the pane, last the plan's stretch); f341 the lights blink (working);
  f409-429 the walls rise (a grow, out-expo, 0.33 s; never a draw-on).
- **Join:** RJ4 (C) -> S3: f493 the flakes on its top start to melt (the cue), the lean-in starts.
- **Tiers:** A the brush tip un-painting (to f341), the computer (from f341), the walls rising (f409-429) · B the walls
  once landed, the manhole · C the street, the block leaving, the harbour, the far city, the sky, the snow.
- **Rig:** Rig H (the window leaves the frame; the computer's lights the brightest below the band, its cool pool on the
  snow; the key's rim up its left edge, 4-6 px as tier A).
- **life:** snow · the computer's lights · a gull over the harbour (once, tier C).
- **Promise:** the scribble round its foot = the plan site's snow; the far band = the harbour with ice and the far city.
- **Captions:** R1, the seats C, L, R, C: "AI actually runs" (C, f254-317) · "on giant / computers," (L, f317-388) · "in
  buildings / called" (R, f388-451) · "data centers." (C, f451-523).
- **Sound:** T the reverse sweep (f235-341) · S f409 a soft low sweep (optional).
- **Pip:** none.

### S3 · 8.76-10.96 · f526-658
- **Shot type · framing:** CLOSE (SR12). The computer's top **674 px wide (x 203-877)**, its edge at y ~930 on the axis;
  the melt on it at (540, 930); the steam rising and thinning, bending aside under the band (it never enters it); the
  night behind one quiet field (the sky's lower half). Drop ~374.
- **Move:** PUSH IN, the lean-in (RM4 with I12) · 0.8 s (f493-541) · 1.56x -> 3.12x · about the top's centre (540, 930),
  held still · in-cubic f493-524 (fastest 2 f before "Those"), out-cubic f524-541 (a 17 f arrival) · lands ~"computers"
  (f539), 37 f before the steam's onset. The frame's corners leave at up to ~50-70 px/f (WARN: the sky and the floor,
  big simple masses; the top at the pivot near-still). Then locked f541-638.
- **Element moves:** f493- the flakes melting on landing (a loop); f578 the melt turns to steam ("really"); f606-618 the
  steam pours off (the burst at the focal, rising to the band's floor).
- **Join:** RJ4 + I4 (C) -> S4: from f638 the pull back, the column's top held at the band's floor.
- **Tiers:** A the top: the melt, then the steam · C the night sky, the harbour beyond, the snow.
- **Rig:** Rig H (the key's sky light on the top's left half; the steam's underside lifted cool by the lights).
- **life:** snow (near flakes crossing, landing and melting).
- **Promise:** the field behind = the sky's lower half, quiet; the column = the steam, thinning.
- **Captions:** R5: "Those computers" (C) f523; "get" f562, "really" f582, "hot." lifted (the lit hand at the running size)
  at f610; to f655.
- **Sound:** T the sizzle from f493 · S f606 the hiss's onset (it stays, quiet, while the computer steams).
- **Pip:** none (a close).

### S4 · 10.96-17.76 · f658-1066
- **Shot type · framing:** MEDIUM (SR21). The computer **337 x 590, x 372-708, y 750-1340**, the apex, its lights the
  hardest step at ~(540, 960) (drop 404); its steam from y 750, bending aside under the band; on "FORTY" 5 rows of 8
  kettles on the snowy floor in front of it, seen a little from above so the rows recede toward it: the back row ~420 px
  wide at y ~1360 (x 330-750), the front row ~540 px at y ~1480 (x 270-810: D5's base >= 540), kettles 50-68 px, one
  texture with a clear front row, inside the plan's posts at x ~255 and ~825. Nothing to read under the rail or below y 1519.
- **Move:** PULL BACK, a story pull (I4) · 1.77 s (f638-744) · 3.12x -> 1.56x · about the column's top (540, 590) · in-cubic
  f638-658 (fastest on "To"), out-cubic f658-744 (landing on "just"). The floor rises into the frame at up to ~19 px/f
  (WARN: a simple mass). Then locked f744-1040.
- **Element moves:** f817 the steam thickens ("makes"); f898-922 the kettles pop by rows, back row first, one row every 6 f,
  each pop ~7 % overshoot peaking at ~12 f (RM8b); f967- all boil, lids rattling (small loops, tier C), their steam
  joining the column.
- **Join:** RJ4 (C) -> S5: from f1040 the push up the column.
- **Tiers:** A the computer alone (f752), the kettles as one crowd (f898), the steam column · B the plan's side walls, the
  lids rattling · C the snowy floor, the harbour, the far city, the sky, the snow.
- **Rig:** Rig H (the kettles' tops lit by the sky light; each kettle's own small melt ring at its foot).
- **life:** snow · the steam · lids rattling (from f967) · the computer's lights.
- **Promise:** the grey block in front = 40 kettles in 5 x 8 rows (lids and spouts behind a clear front row), each in its
  own small melt ring; the posts at the sides = the plan's walls.
- **Captions:** R1 at the band's seats ("To put it / into perspective," · "just one / of these computers" · "makes as much
  / heat as"); R3: "40" with "kettles," at f901 (the lit hand, the kettles popping on the same word), then "boiling /
  non-stop.".
- **Sound:** T the hum deepening (f817) · H f898 ONE clatter · T the rolling boil (from f967).
- **Pip:** none.

### S5 · 17.76-19.26 · f1066-1156
- **Shot type · framing:** CLOSE (SR12, not a neighbour of S3). The computer's top 674 px wide, its edge at y ~1030; **the
  mug ~140 x 140 (~190 with its handle) at (540, 955)** on it: the pivot S6 holds; the steam field above (the quiet
  field, thinning under the band). Drop 399.
- **Move:** PUSH IN, up the column (one straight dolly toward a point above the top) · 0.75 s (f1040-1085) · 1.56x ->
  3.12x · about (540, 470) (the top drops from y 750 to ~1030) · in-cubic f1040-1064 (fastest 2 f before "That's"),
  out-cubic f1064-1085 (landing on "a"), 26 f before the mug. The kettles leave the bottom at up to ~45-60 px/f (WARN:
  leaving; the eye rides the column near the pivot); fallback: the push runs to f1105 (65 f). Then locked f1085-1130.
- **Element moves:** f1111-1123 the mug pops (peak ~f1123), its curl of steam joining the rest.
- **Join:** RJ4 + I12 (C) -> S6: the big move creeps off the mug's spot from f1130.
- **Tiers:** A the mug (from f1111) on the top · B the steam field · C the sky, the snow.
- **Rig:** Rig H (the mug's shaded side the subject's step; the tea a small warm call).
- **life:** the steam · snow.
- **Promise:** the field above = the steam, patterned, thinning; the dark band at the foot = the computer's top.
- **Captions:** R6: "That's a lot" (150 px, from x ~110, baseline 400) f1063 · "of" f1105 · "tea." (190 px, ending near x
  890, baseline 570) f1115; to f1153; clear of the mug's curl.
- **Sound:** S f1111 a small dry clink.
- **Pip:** none (a close).

### S6 · 19.26-23.46 · f1156-1408 · the one scale shot
- **Shot type · framing:** CLOSE -> EXTREME WIDE (SR17). The end frame (W1 §1.4): the Earth's curve, its limb at y ~780
  (the sky ~41 % with the band flat in it); **Helsinki a small lit spot at the pivot (540, 955), ~24 px**; plain boxes with
  roof fans along the land, the near box just below on the axis at ~(540, 1120), the far ones tiny; plumes thinning at y
  >= 614; clouds far below; a far flock. Generic land.
- **Move:** PULL BACK, the one big move (I4 at scale, the nested pull) with the pivot (I12) · 2.35 s (f1130-1271) · from
  the mug close (3.12x of the home view) through the computer and its kettles, the home view framed round the computer's
  top, the home view shrinking to a cluster of lit windows (~60 px), the coast from high above (Helsinki that cluster),
  the land widening, to the curve (Helsinki ~24 px): about 350x in all · the pivot held within +-40 px of (540, 955)
  the whole way, handed from the mug to Helsinki's spot at one screen spot (the incoming object within +-40 px and 1.5x
  of the outgoing one on the hand-off frame) · ONE S5_EASE over the whole chain, cubic-bezier(0.55, 0.03, 0.50, 1.0): a
  creep (frame 1 at ~3 % of the peak), the peak near "data" (f1196), a long landing. On the words: "Normally," f1156 still
  creeping; "data" f1196 the home view small, handing over to the coast (the angle changes from eye level to high above
  inside this hand-off, where nothing reads); "centers" f1206 the coast and its boxes; "just" f1223 the land widening;
  "big" f1256 almost landed; "fans" f1271 landed. Then locked f1271-1402 (131 f, the landing hold). Speeds: at the peak a
  detail 540 px from the pivot moves ~45 px/f and one 260 px away ~22 px/f: only big simple masses (land, cloud, sea) beyond
  ~200 px of the pivot near the peak (WARN; each hand-off frame drawn as a still, rule 12). Fallbacks: land on "blow"
  (f1312); or a snow cloud passing the lens hides the home-view-to-coast hand-off (J8).
- **Element moves:** f1250 the near box's fans start ("big"); f1306 the plumes rise off every box, a few far boxes send
  none ("blow").
- **Join:** **RJ2 (F)** -> S7 at **f1402** (23.37 s, 6 f before "But"): the size and the angle both change; the thread on
  both sides (the plumes; the computer's steam); the incoming camera already settling; the eye's jump ~220 px (from (540,
  955) to the computer at ~(330, 880)), the turn's declared exception (<= 370).
- **Tiers:** A the pivot (the mug's spot, then Helsinki's spot), the near box's fans (f1250), the plumes (f1306) · B the far
  boxes · C the land, the sea, the clouds, the limb, the sky, the far flock.
- **Rig (W1 Rig P):** the sun just below the west limb, screen LEFT (Rig H's side, so the move never flips the light); the
  limb's thin band lit; the clouds' tops lit from the left; the land in night; Helsinki the one warm spot with a small
  bloom; the plumes lit cool from the left; the one shadow value the board's mid grey.
- **life:** the clouds drifting · a far flock crossing once · the fans (the beat) · the plumes (the beat).
- **Promise:** the dotted belt along the coast = data center boxes with roof fans, shrinking to specks to the edges; the
  pale masses below the limb = clouds; the specks = far cities, cool and dim; the one lit spot = Helsinki.
- **Captions:** R8, seat C only, no seat change while the world moves: "Normally," f1153 · "data centers" builds f1194 ·
  "just use / big fans" f1220-1295 · "to blow that / heat outside." f1295-1402 (the group leaves on the cut).
- **Sound:** S the swell f1130-1268 (crest 3 f before "fans") · S f1250 the whirr's onset · T the wind from f1306, dropping
  to the street's hush from f1373.
- **Pip:** none (never on the curve).

### S7 · 23.46-25.54 · f1408-1532 · the turn
- **Shot type · framing:** WIDE, the plan from the street's start (SR18; the same height and horizon, the camera trucked
  left of the home view's spot). **The computer off the axis at x ~215-445 (231 x 404, y ~806-1210)**, its steam rising to
  y ~620, its top lit warm from inside; the focal ~(330, 880); the plan's footprint marked on the snow round it; the open
  half (x 560-1080): the street's open snow, the harbour and the far city on the horizon, the sky; no counterweight; the
  block out of the frame to the right; the city's pipe ends at a manhole at ~(760, 1320).
- **Move:** SETTLE IN (RM4) · keyed f1372-1442, the cut landing on it mid-move at f1402, so only its last 40 f show · 1.04x
  · the computer's top held · out-cubic · landing on "WANTS" (f1442). Then locked f1442-1513 (the hold after
  the heaviest line).
- **Element moves:** f1436-1490 the reach: the brush draws the plan's stretch as a marked-out line on the snow from the
  manhole (760, 1320) to the computer's foot (~330, 1210), ~310 px at ~5.7 px/f, empty; it stops at the foot (6 f before
  "heat."); the steam keeps rising.
- **Join:** RJ4 (C) -> S8: from f1513 the push re-centring on the plan.
- **Tiers:** A the computer's rising steam, the reach (f1436-1490) · B the manhole, the plan's footprint lines · C the
  street's start, the harbour, the far city, the sky, the snow, a far tram.
- **Rig:** Rig H (no window in frame: the brightest below the band is the computer's warm top and its lights).
- **life:** snow · the steam · a far tram on the far shore · the far windows.
- **Promise:** the open snow = the street's start, its tracks running to the VP; the far band = the harbour and the far
  city, lit.
- **Captions:** R4, the landing word: "But Helsinki" (row 1, baseline 362) on the cut (within 2 f of f1402; TYPE_GUIDE's
  example pops it at f1405) · "wants" (the lit hand, lowercase, baseline 482) f1438 · "that heat." (baseline 578) f1475 ·
  to f1530.
- **Sound:** H f1402 the cut with the bed's change (a layer leaves) · T the brush on snow f1436-1490.
- **Pip:** none (the turn).

### S8 · 25.54-28.34 · f1532-1700
- **Shot type · framing:** MEDIUM (C1, Z4). The plan alone: its marked-out walls on three sides round the computer, open to
  the snow and the harbour, tops y >= 640; **the computer inside on the axis, 281 x 491 (x 400-680, y 959-1450)**, its steam
  out of the open top; a ferry beyond the walls at x ~720-900, y ~1150; the street's first roofs at the right edge. **The
  2027 tag ~280 x 170 px, centre (540, 1150)**, on the front wall at the computer's middle (drop 594, under 650), "2027" at
  ~72 px tall figures (TYPE_GUIDE R7).
- **Move:** PUSH IN-AND-LEFT, re-centring (RM4) · 0.62 s (f1513-1550) · 1.07x -> 1.3x · the computer (330, 1005) -> (540,
  1205) · in-cubic f1513-1530 (fastest 2 f before "The"), out-cubic f1530-1550 (landing ~"has" f1548); peak ~23 px/f at
  the computer (WARN, short). Then locked f1550-1678.
- **Element moves:** f1565-1604 the walls stand out, wall by wall (left, front, right; ~13 f each, a light pull I11:
  one grey step lighter on the board); f1638-1662 the tag swings on (a pendulum settle ~0.4 s, ~7 % overshoot), landing by
  "year" (f1662).
- **Join:** RJ4 (C) -> S9: f1678 the computer's lights blink (the cue), the dolly starts.
- **Tiers:** A the plan's walls (f1565-1604), the tag (from f1638) · B the computer and its steam, the ferry, Pip · C the
  harbour, the street's first roofs, the sky, the snow.
- **Rig:** Rig H (the tag the hardest step once it lands; the walls a step lighter when they are the subject).
- **life:** snow falling through the open plan · the steam out of its top · the ferry beyond · the far windows.
- **Promise:** the lines = the plan's walls, marked out, the snow settling on their bottom lines; the far band = the
  harbour with the ferry and the far city.
- **Captions:** R1: "The city has a plan" + "to use it," (a build, f1529-1625) · "starting / next year." (seat C, f1622-1698);
  R7 the tag (on the world layer, moving with its wall).
- **Sound:** S f1638 a paper flick.
- **Pip:** at the ferry's rail ~(760, 1150), tone-on-tone with its upper deck, 220+ px from the tag.

### S9 · 28.34-29.56 · f1700-1774
- **Shot type · framing:** MEDIUM (E2, C1). The computer at 1.5x, **324 x 567 (x 378-702, y 840-1407)**, centred; its inlet
  in from the left edge at y ~870 to its top; on "how" its front swings open on a hinge at its left edge: **inside, x
  ~400-680, y ~880-1390, the 8 stacked machines** (each ~60 px tall), hot, their small lights on, and a pipe down past
  each one, empty. The focal the opened side's centre ~(540, 1135), drop 579.
- **Move:** DOLLY IN through the plan's open front (RM4, a true dolly with parallax) · 0.63 s (f1678-1716) · 1.3x -> 1.5x
  (the front wall's plane ~1.9x, so it and the tag slide out of the bottom by f1710) · the computer (540, 1205) -> (540,
  1124) · in-cubic f1678-1698 (fastest 2 f before "So"), out-cubic f1698-1716 (landing as the door starts, 6 f before
  "how"). Then locked f1716-1979 (through S10).
- **Element moves:** f1716-1740 the door swings open (out-cubic, 0.4 s).
- **Join:** RJ4 at rest (C) -> S10: no move; the voice runs on into "A" (f1774); nothing starts until "big".
- **Tiers:** A the opened side: the door, the 8 hot machines, the empty pipe · B the inlet and its cool water, the steam ·
  C the snow beyond, the plan's walls, the sky.
- **Rig:** Rig H (the opened side the lightest area below the sky; its warm spill on the door's inner face and the snow
  under it).
- **life:** snow beyond the plan · the steam · the small lights.
- **Promise:** the stacked trays = 8 machines with rows of tiny lights; the dark line = the pipe down past them.
- **Captions:** R1: "So how / would that work?" (seat C) f1698-1772.
- **Sound:** S f1716 a soft latch and clunk.
- **Pip:** none (a close).

### S10 · 29.56-34.46 · f1774-2068
- **Shot type · framing:** MEDIUM, S9's frame held (E2 kept as the held frame's one lead; B2, D7, E9 support). On "big" the
  hall grows round the computer: rows of marked-out machines receding to a VP hidden behind it at ~(540, 1150), the floor's
  joints converging on it, the near rows' tops at y ~660-760 falling toward the VP (all under the band), the walls running
  past both side edges, no roof; the plan's floor ends at the harbour's edge. The water's path from the top (540, ~880)
  to the foot (540, ~1407): a drop of 851 px at its end, beyond 650, declared (the travel is the beat; the follow picks the
  front up there).
- **Move:** HOLD, locked, f1716-1979 (RM7), with RM1 (the subject travels the machine's line).
- **Element moves:** f1792-1816 the hall's rows grow from the floor (front rows first, one group, 0.4 s); f1862-1930 cool
  water runs in at the top and down past each machine (~510 px at ~7.5 px/f, the eye on one point), each machine cooling
  as the front passes (~8.5 f apart; their small lights stay on), the water below warming, the steam thinning; **f1930 the
  steam stops**; f1975 hot water out at the foot into the plan's stretch heading right, the snow over it starting to melt.
- **Join:** RM3 (C) -> S11: the follow starts f1979 (4 f after the front leaves the foot), cruising on "Then" (f2068).
- **Tiers:** A the hall growing (f1792-1816, until it lands), the water and the machines cooling (f1862-1930), the steam
  stopping, the hot water out (f1975) · B the hall's rows once landed, the inlet · C the snow, the sky.
- **Rig:** Rig H (the machines' warm states as the board's grey steps: hot = a light grey, cooled = a mid grey, the small
  lights kept as marks).
- **life:** the water (the beat) · the steam thinning · snow beyond the plan · the small lights.
- **Promise:** the receding rows = the planned hall's machines, marked out, past both edges; the floor's lines = its
  joints, converging on the VP behind the computer.
- **Captions:** R1 at the band's seats: "A big new / data center" · "would take / the heat" · "out of its / computers" ·
  "with water / in pipes." (the two middle groups ~21.5 characters a second: flagged and kept).
- **Sound:** T water in the pipe from f1862 · H f1930 the hiss ends on the steam's last frame · T the flow brightens f1975.
- **Pip:** none (a close).

### S11 · 34.46-38.48 · f2068-2309
- **Shot type · framing:** WIDE, landing as the home view at 1.15x (E3; B8; E2 and D7): anchored on the window, which goes
  from (598, 985) at 1x to **(600, 1000), ~78 x 101** (W1 §1.7: the block x ~347-846, roof y ~661; the run along the kerb at
  y ~1300, the manhole at x ~390, the door at x ~556; the soft cut up to the radiator at ~(600, 1075); the computer cut by
  the left edge). The resident in the window: a bust ~60 px, in profile, looking out (W1 §6).
- **Move:** FOLLOW (RM3 with I12) · 3.82 s (f1979-2208) · 1.5x -> 1.15x · a dolly back and right on one straight path, the
  front held at x ~410 (+-40; its lead room to the right) while the street slides by at ~2-4 px/f (under the ~6.4 px/f
  sideways estimate) · a trapezoid: accelerating f1979-2040, cruising through "Then" (f2068), decelerating f2150-2208,
  landing on "into" with the front at the door (the front runs on to x ~556 while the camera settles). Then locked
  f2208-2286.
- **Element moves:** f2092 the front passes the manhole: a puff of steam rises (lit warm from below) and past it the melt
  widens; f2216-2243 it climbs the soft cut (~230 px, ~8.5 px/f); f2243 it fills the radiator: the sill's snow melts and
  the frost clears round the resident (W2 -> W3; no light step).
- **Join:** RJ4 (C) -> S12: the pull back from f2286, its midpoint ~f2306 (3 f before "So").
- **Tiers:** A the front and its melt, the manhole's puff (f2092), the climb and the radiator, the one window · B the
  resident in the window, the walkers, Pip · C the street, the block's facade, the tram, the footprints, the snow, the sky.
- **Rig:** Rig H (the window W2 -> W3; the melt's sheen and the manhole's warm puff the pools that move with the thread).
- **life:** the tram crossing in the near lane (never over the front, the cut or the window) · 2-3 walkers on the pavement
  (60-130 px, sideways, never toward the camera) · footprints in the snow · snow falling · window silhouettes.
- **Promise:** the dark strip opening in the snow = the melt over the hot water; the scribble on the pavement = walkers and
  footprints; the near lane's long mass = the tram.
- **Captions:** R1: "Then pipes" + "under the streets" (a build) · "carry that heat" · "into people's homes." (held into the pause
  to ~f2302, then out).
- **Sound:** T the pipe's flow · S f2092 a soft lift · S f2243 the radiator's tick · then the hold: the bed low, the
  quietest moment (f2249-2307).
- **Pip:** on a balcony above the street ~(830, 900), never in a window the water reaches.

### S12 · 38.48-42.24 · f2309-2534 · the payoff
- **Shot type · framing:** WIDE, POV (N14 with SR13): S1's frame (§1's table) with what the story has added since: the
  plan's walls (since S2), the resident in the one window, the whole run warm, and **your gloved hand rising from the
  bottom LEFT, the phone's screen ~140 x 170 at x 330-470, y 1310-1480 (centre (400, 1395))**, under the run's street leg
  and below the computer, the wrist under the bottom bar as a mass. The eye's path in the voice's order: the bubble (400,
  1395) -> the computer's lights (174, 1010) -> the pulse along the street -> the window (598, 985).
- **Move:** PULL BACK (a small story pull) · 0.67 s (f2286-2326) · 1.15x -> 1x · about the window ((600, 1000) -> (598,
  985), a smooth path inside the golden box) · in-out cubic, its midpoint ~f2306 · landing as the bubble pops (f2326);
  the hand rises in during the pull, then holds still. Then locked f2326-2534.
- **Element moves:** f2326 the chat bubble pops (no words, no logo); f2358 the computer's lights all blink back and a
  pulse leaves its foot; f2358-2418 the pulse runs the run (~578 px, ~9.6 px/f), the melt widening a step past the
  manhole; f2418 it reaches the radiator: the window W3 -> W4, a step warmer round the resident (a 6-18 f ramp); f2458-
  only the snow and the far life move; the tail f2479-2534 (the loop, below).
- **Join:** RJ3 (B) -> S1, the loop.
- **Tiers:** A in the voice's order: the bubble (f2326), the computer's lights (f2358), the pulse (f2393), the window
  (f2418) · B your glove and phone (held still after rising), the resident in the window, Pip · C the whole home view's
  world.
- **Rig:** Rig H (the window W4, the film's warmest; the phone's cool spill on your glove's fingers; the computer's lights'
  blink).
- **life:** snow · the ferry · a far tram · the clouds · Pip's blink.
- **Promise:** as S1's; the dark mitten shape at the bottom left = your glove and phone, its screen a cool light a step
  under the window.
- **Captions:** R9: "So your chatbot" (row 1, baseline 390, from x ~110) f2306 · "could soon" (row 2, baseline 545) f2362 ·
  "heat" (the lit hand, last on row 2) f2394 · then "an apartment / in Helsinki." (136 px, seat C) f2413-2515; clear of the
  phone and the run. "Did you know" back at f2521.
- **Sound:** S the release, the bed's one lift, crest f2307 · H f2326 a soft pop · S f2358 a soft blip · T the flow under the
  pulse · S f2418 a warm low note · T the reverse sweep from f2479 (no hit on the seam).
- **Pip:** back on its balcony ~(845, 905).

### The loop · 41.32-42.24 · f2479-2534
- **Move:** none (locked); the un-paint, the reveal run backwards (RM8's un-build, RJ3), all ease-in: your hand and phone
  (f2479-2490), the far city and the harbour (f2485-2500), the street (f2495-2510), the block with the resident
  (f2505-2518), the computer in its plan (f2510-2520), the run last, the brush tip retreating from the radiator to (160,
  1252) (f2515-2534): frame 0's state (the quiet sky, the brush tip, the run's start).
- **Join -> S1:** B (RJ3): the same spot and the same picture; the brush lays the run again; the ding returns at f36.

## 4. The checks (on this plan; the board re-runs them)

- **The five numbers:** every landed focal in the golden box or declared: S1 and S12 the window (598, 985), drop 429; S2
  (540, 1050), 494; S3 (540, 930), 374; S4 (540, 960), 404; S5 (540, 955), 399; S6 (540, 955); S7 (330, 880), the turn's
  off-balance (declared); S8 the tag (540, 1150), 594; S9 (540, 1135), 579; S10 the water's path to (540, 1407), 851
  (declared: the travel is the beat); S11 the window (600, 1000), 444. The band clear at every frame (steam, walls, plumes
  and the hall under y 614). One onset a beat, the picture ~6 f ahead of its word.
- **The eye across each join:** <= 150 px or carried: S1 -> S2 by the brush tip and the push; S2 -> S3 ~120; S3 -> S4 and S4
  -> S5 on the column; S5 -> S6 the pivot (0); S6 -> S7 ~220 (the turn, declared); S7 -> S8 carried by the push; S8 -> S9
  the tag to the door (~15); S9 -> S10 the same frame; S10 -> S11 carried by the front; S11 -> S12 the window held; the loop
  the same picture.
- **Moves land before their shot's first event** (Part 0b §2.7's 30 f) where the voice allows: S2 -> S3 37 f; S3 -> S4 79 f;
  S4 -> S5 26 f; S7 -> S8 ~15 f before the walls; S8 -> S9 0 f before the door (the voice gives 22 f from "So" to "how";
  the fallback opens the door on "would"); S11 -> S12 the bubble on the landing frame.
- **Speeds over the budget (WARNs for the 1x watch):** S2's leaving edge (~25 px/f), the 2x pushes' corners (S3, S5: up to
  ~50-70 px/f, leaving masses), S6's peak beyond ~200 px of the pivot, S8's short re-centring (~23 px/f). Everything the
  eye must read stays under ~15 px/f: the brush (16), the water (6-10), the front (2-4), the climb (8.5), the reach (5.7).
- **The doses:** as §2's counts; RM8 after frame 0: 2 (the un-paint, the reach); light events: 3; one big move; one follow;
  F x1 on "But"; the mover budget: at most 3-4 noticeable supporting movers at once (S1: snow, the resident, the ferry,
  the far tram taking turns; S11: the tram, the walkers), none entering in the 0.4 s round a join.
- **Sound:** the cue list in the visual script's "The sync plan" (31 cues, 8 hard); the board's `sfx` plays each with its
  type and event, on its event's first visible frame (`SOUND_SYNC.md` §4's check list at G3).

## 5. For the board (the fields lint reads)

- **Per panel:** `device` and `carrier` as §2 (RJ4/C x10, RJ2/F at S6 -> S7, RJ3/B the loop); the camera's five values as
  §3; `tier` on every element as §3's tier maps; `rig: 'H'` on every home-place panel, `'P'` on S6; `planes` and `vp:
  [540, 1150]` from W1 §1.0 (the closes' horizon under the frame's foot, the VP kept); `life:` as §3, each with one
  placeholder element; `promise` as §3; 2-3 ambient loops per set panel from the kit (snow, steam, a window light, a
  cloud's drift).
- **The density key:** the home view (S1's landed frame) fully dressed in scribble at its tiers (W1 §1.1's list), approved
  at G3; every other panel built to its level.
- **The thread:** its path (the run, then the steam, then the water) and its home spot (the one window and its radiator) on
  every panel; the scale reveal S6 declared; coverage ~92 % outside it, no gap over 3 s (0.00-0.46, 5.68-8.22).
- **Stills to draw** (rule 12): every move's start, middle and end frames; S6's hand-off frames; the join frames (f257,
  f526, f658, f1066, f1156, f1402, f1532, f1700, f1774, f2068, f2309, f2534), each at the feed's crop with its buttons drawn.
