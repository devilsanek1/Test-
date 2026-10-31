# Video 4 (Helsinki): the composition-and-motion pass (12 shots, from the composition library)

**In five lines**
1. **Kept:** the story, the 12 shots, every word and its time, the warm-water thread, the planet move, the loop; STYLE_ADJUSTMENTS applied (a brush, organic heat, one key with the window the story light, a person near the camera in S1, S11 and S12, one place to look, the computer a monolith).
2. **Framed:** ONE home view drawn through every frame's map, so the block, the plan, the run and the person sit where the camera puts them; each of the 11 stops led by one device, his first (D7, D2, E9, C1, E2, E3; ours Z3, N9, N14): 9 leads, 9 stops CORE-led, no RARE; his leading lines are the run and the reach, his vanishing point S10's hall, drawn to be seen.
3. **Moved:** the hook scheduled frame by frame from frame 0 (the line, the machine, the heat, the window, then the city's wave as reality overtaking it); every camera move speed-checked (peaks 1-15 px/f, analytic and `camspeed.py`); S10 holds while the water travels; one follow.
4. **The cut, for the owner:** one plain cut on "But" (recommended) or a snow cloud wiping across (J8); the written dive (~49x) and a push-through into Helsinki's ~24 px spot (~60x) would each need ~2.3-2.4 s of nested pull where the voice gives 1.15 s, so neither is offered.
5. **Open:** three questions for the owner (the last section); the visual script's two still stand (the un-draw after the hook; the computer's size, which resets the home view's feet by the horizon rule); 7 hard syncs for the sound study.

**Status:** a planning pass for the owner, before G3 (the playbook: "Every film's visual script gets a composition-and-motion
pass from the shot library"), after its critic's review and one fix pass (`review_composition.md`: 6 MUST-FIX, 30
SHOULD-FIX; each outcome in its "Fix pass" section). G3 builds and plays the real sketch, and its 1x phone watch settles
every number here. The library is cited by code and tier as it stands after its own fix pass
(`video/docs/look/COMPOSITION_SHOTS.md` Part 0, 0b; `composition/recipes.md`; `composition/critique_library.md`, Fix
pass). **Sheet:** `composition_pass_sheet.png` (12 planning value thumbnails, drawn by `composition_pass_sheet.py`; not a
render). The script is the one source of the place's numbers: `--numbers` prints every piece in every frame and the band
check through every move, `--speeds` every move's peak screen speeds, `--camspeed DIR` renders each move at half size
from the planning world and runs `video/scripts/camspeed.py` on it.
**Inputs:** `VISUAL_SCRIPT.md` (v2), `STYLE_ADJUSTMENTS.md` (owner-approved), `../OWNER_NOTES.md`, `../THROUGHLINE.md`,
`../script/script_g1.md`, `video/public/v4/voice_words.json` (42.24 s), the playbook (video 4's branch), `TYPE_GUIDE.md`
(PICKED: the caption seats), `SOUND_SYNC.md`.

**Conventions.** Px at 1080 x 1920, y down. A frame is round(t x 60) on the take's clock (f257 = 4.28 s); "the picture
6 f ahead" of a word means its event starts 6 f before the word's start. Tiers: CORE, SIT (situational), RARE. "His" = an
idea from the owner's five reels (A1-E11, T, RM, RJ); "ours" = our additions (N, Z, I, J). **Maps:** every frame but the
closes (S3, S5) and the planet (S6) is the home view through its map x' = s(x - 66) + X, y' = s(y - 838) + Y (s = the
computer's drawn width / 216, (X, Y) its drawn top-left: the table below). **A move** between two stops is one zoom about
one fixed screen point (a straight dolly toward an off-axis target is one move: rule 12), geometric in scale, on one
ease: trapezoid(0.25, 0.35) (peak 1.43x the mean: rule 20's cruise), in-out sine (1.57x) or in-out cubic (3x). **The
feed:** Instagram's Reels tab shows x 98-982; its rail is x 877-954, y 1032-1660 (nothing to read at x > 870 below y
860); the name block starts at y 1519. The caption band is y 290-600 (ink at y <= 585, seats L x 440 / C x 520 / R x
600: TYPE_GUIDE §c); every top at y >= 620. The golden box (the focal's home) is x 413-667, y 951-1187; the drop is the
focal's distance under the caption block's foot (y 556), 300-450 px, 650 at most. Values: L* 97 the story light only, 80
light, 60 mid, 40 mid-dark, 18 dark.

## The 12 shots at a glance

| shot | time (s) · frames | lead (tier) · recipe; the rest | move inside (code) | join out (code, carrier) · frames |
|---|---|---|---|---|
| S1 the hook | 0.00-4.28 · f0-257 | **D7** CORE · SR1 + SR8; T (frame 0's drawing, never a lead); N7, E2, E8 CORE; A2, E4, E6, D4 SIT | RM8 the run f0-40; the computer f84; RM1 the heat f88-122; RM6 the window f122; RM6 the wave f140-205 | C: RM4 1.56x in and left with RM8's un-paint, f235-325 trapezoid, the cruise from "AI" f257 |
| S2 the computer | 4.28-8.76 · f257-526 | **Z3** SIT · SR25; N7 CORE; C1 CORE (from "buildings") | RM7; the lights blink f335; the plan's posts rise f409-429 | C: RM4 2x lean-in, f490-570 trapezoid, the cruise over "Those" f526 |
| S3 really hot | 8.76-10.96 · f526-658 | **N9** CORE · SR12; N1 CORE; A2 SIT | RM7; wisps f578; RM6 steam pours f606 | C: I4 a story pull 2x, f636-742 trapezoid, the cruise from "To" f658 |
| S4 forty kettles | 10.96-17.76 · f658-1066 | **D7** CORE · SR21; D5 RARE (once); B3, Z3 SIT | RM7; blink f746; steam f817; RM8b the rows f898-922; boil f967 | C: RM4 2x up the steam, f1012-1102 trapezoid, the cruise over "That's" f1066 |
| S5 a lot of tea | 17.76-19.26 · f1066-1156 | **N9** CORE · SR12; N1 CORE | RM7; the mug pops f1111 (RM8b) | C: the one big move begins as a creep, f1130 |
| S6 the planet | 19.26-23.46 · f1156-1408 | **D2** CORE · SR17; D1, E8 CORE; Z1, E6, N6 SIT | I4 at scale + I12, f1130-1312 S5_EASE, x124; locked f1312-1373 | **RJ2 (F) on "But"**, a plain cut f1402 (alt: J8 (D), a snow cloud, f1384-1432) |
| S7 the turn | 23.46-25.54 · f1408-1532 | **E9** CORE · SR25; B1 CORE; N7 | the incoming push 1.045x f1372-1442; RM8 the reach f1442-1496 | C: RJ4's seam 1.13x, f1513-1556 sine, midpoint "The" f1532 |
| S8 the plan, 2027 | 25.54-28.34 · f1532-1700 | **C1** CORE · SR6; Z4, N7 CORE | RM7; RM8 the re-trace f1571-1595; the tag f1638-1662 | C: RM4 1.16x, f1678-1716 sine, midpoint "So" f1700 |
| S9 how? | 28.34-29.56 · f1700-1774 | **E2** CORE · SR6 (one held frame with S10); C1 CORE | the panel (and the tag) swings open f1716-1740 | C: RJ4 at rest, the voice runs on into "A" f1774 |
| S10 water takes the heat | 29.56-34.46 · f1774-2068 | (E2 leads the held frame) B2, E9, D7 CORE; A6 SIT inside it | RM7; RM8b the hall f1792-1816; RM1 the water f1862-1936; out f1975 | C: RM3 the follow, f1979-2208, the front held at x 540-556 |
| S11 into homes | 34.46-38.48 · f2068-2309 | **E3** SIT · SR10 then SR25; B8 SIT; E2, D7 CORE | RM3 + I12 lands on "into" f2208; RM1 the climb f2222-2246 | C: RJ4's seam, a 1.15x pull on the window, f2286-2332 cubic, midpoint "So" f2309 |
| S12 the payoff | 38.48-42.24 · f2309-2534 | **N14** CORE · SR24 + SR13; B1, E8, E2 CORE; B8, E11 SIT | the hand f2296-2328; the bubble f2332; RM1 the pulse f2364-2418; the step f2418 | RJ3 the loop (B), the tail f2479-2534 to frame 0 |

## The place in numbers (W1: the home view; every frame's map)

The visual script's layout, translated to the library and to STYLE_ADJUSTMENTS. **Setup A** (rule 6): the camera at a
standing eye (~1.6 m) on the street's near edge, level; **the horizon at y 1170**, so the sky with the band is ~57 % of
the frame (LAYOUT's default y 768 yields to rule 6 here: the library's clash row 5). The far city sits on the real
horizon (the designed view is on hold: DIRECTION 7).

| piece (the home view, 1x) | where (px) | value and job |
|---|---|---|
| sky with the band | y 0-1100; the band y 290-600 one flat field | the top quiet field (>= 30 %): a cool night sky, mid-dark (the captions warm white on it) |
| hero snow cloud | centre (230, 170), 620 x 230 (the top gutter, cut by the left edge) | the steelyard's soft weight (D4, rule 9), < 50 % of the focal's pull; drawn only where it stays above the band |
| far city | a belt on the horizon, tops y 1090-1150 | tier C; dark before the wave, its points lit at rest after it (S1, M3) |
| harbour | y 1166-1214 | dark; a ferry crossing (seen in S8, left of the plan) |
| **the giant computer** | x 66-282 (216 wide), y 838-1216, the left third | **a monolith** (STYLE_ADJUSTMENTS 6): no roofline, no window grid, soft top corners, its small cool lights in tight vertical columns (L* ~80, a step under the window); its body the darkest value; snow on its top |
| the plan (from "buildings") | corner posts at x -50 and 360, from the snow (front line y 1240) to y 756, short top returns at the corners | marked out, tier C, L* ~80 lines: **no full top line** (it would cut the closes' sky and cross the band in the moves); it ends 18 px before the block |
| the block | x 378-812, roof y 690 (its snow's top), foot y 1262; a stair tower x 716-752 to y 668, a chimney x 786-800 to y 674 | one closed dark shape on the axis; its panes (60 x 80, five columns x four rows) one texture (D7), dark before the wave, lit at the city's level (L* ~55-60) after it |
| **the one window** | **(598, 985), 68 x 88**, the radiator under its sill at (598, 1062) | **the focal**: L* >= 95 when lit (the story light, the one honey accent), in the golden box, drop 429; between S2's un-paint and S12's step it sits at the city's level (its frost back on until S11's arrival clears it) |
| next block | x 812-1100, roof ~760, cut by the right edge | quiet; Pip on its snowy balcony at (840, 900), 256 px from the focal |
| the street | y 1214-1920 | the near quiet field (>= 15 %), snow patterned +-4-6 L*; kerb and tram rails tone-on-tone |
| **the run** | frame 0's start (140, 1214) under the computer's foot -> (260, 1220) -> (330, 1272) -> the manhole (420, 1272) -> (598, 1272) -> up the riser to the radiator (598, 1062): 685 px | the thread: a bold melt line (>= 24 px, L* ~18 on the L* 60 snow: a 42 L* step), the warm water's honey core inside it, steam from the manhole; the riser the one kept cut, soft and irregular (STYLE_ADJUSTMENTS 2) |
| **the person near the camera** | feet (780, 1340), ~180 px (head top y ~1160), walking left in profile, turning to three-quarter | tier B (rule 7: one stranger in the mid ground, 110-220 px, profile or three-quarter; never "you"); a mid-value coat with the window's warm rim (>= 25 L* over the dark facade), dark legs on the snow; whose home it is |

**The frames' maps** (`composition_pass_sheet.py --numbers`; the block is in every frame the camera puts it, M1):

| frame | s · (X, Y) | the computer | the block (on the feed) | horizon | the plan's posts | notes |
|---|---|---|---|---|---|---|
| S1, S12 | 1 · (66, 838) | x 66-282, y 838-1216 | x 378-812 | 1170 | -50 / 360, tops 756 | S12 only: the posts (they rise in S2) |
| S2 | 1.5556 · (372, 880) | x 372-708, y 880-1468 | x 857, roof 650 (125 px) | 1396 | 192 / 829, tops 752 | lifted 40 px: the foot 51 px over the name block, the drop 454 |
| S3 | 3.1111 · (204, 1025) | its top 672 wide at y 1025 | off (x 1175) | 2038 | off (-157 / 1119) | the melt in the golden box, drop 469 |
| S4 | 1.5556 · (372, 875) | x 372-708, y 875-1463 | x 857, roof 645 (125 px) | 1378 | 192 / 829, tops 734 | M1: the roof under the band |
| S5 | 3.1111 · (204, 1084) | its top at y 1084 | off | 2117 | off | the mug at the pivot (540, 1010) |
| S7 | 1.15 · (416, 900) | x 416-664, y 900-1335 | x 775, roof 730 (207 px); its window off the feed | 1282 | 282 / 754, tops 806 | M2: on the axis |
| S8 | 1.2963 · (400, 900) | x 400-680, y 900-1390 | x 804, roof 708 (178 px) | 1330 | 250 / 781, tops 794 | M2: lifted 59 px |
| S9, S10 | 1.5 · (378, 845) | x 378-702, y 845-1412 | x 846, roof 623 (136 px) | 1343 | 204 / 819, tops 722 | lowered 5 px (S18) |
| S11 | 1.15 · (-12, 831) | x -12-237 (cut by the left edge) | x 347-846, roof 661 | 1213 | -145 / 326, top 737 | the window at (600, 1000) |

**The notan** (3 values at a squint): the night sky with the band (top ~57 %, mid-dark), one dark mass (the block, the
computer, the far belt and the harbour), the snow (the near field, mid: the lightest big field); the window the hardest
step (W on K). Named objects at phone size: the window and its block, the computer, the run, the person, the cloud (5;
rule 5 <= 6). **A declared departure** from STYLE_ADJUSTMENTS 5 (owner-approved: "a dark near street and block, a mid
harbour, a light sky"): the sky stays mid-dark because the captions read warm white on a night sky (TYPE_GUIDE night B),
the one window is the hardest step on a dark block (rule 4), and snow is light by nature; the alternative is a light sky
with TYPE_GUIDE's plum captions. The G4 look clip settles it.

**Sizes by the horizon-cut rule (S26: open with the owner's question 2).** At a 1.6 m eye with the horizon at y 1170, a
thing's height is 1.6 x (its screen height) / (its foot's depth under y 1170): as drawn, the computer reads ~13 m and the
block ~10 m (3 storeys), so the "giant computer" is taller than the "5-storey" block. Once the owner answers the visual
script's question 2, every foot is set by y_foot = 1170 + 1.6 x height_px / H_m: **the written answer** (the computer
~2 storeys, the block 5): the block (15 m) with its roof at y 690 stands on y ~1227; the computer (~6.5 m) keeps its 216
x 378 px only standing nearer the camera (its foot at y ~1263), or is ~232 px tall at the block's depth; **the card's
answer** (a cabinet about a person's height): ~71 px at the block's depth, reached only through a push-through (the
visual script: A x3). Until then the numbers here are the planning stand-in; G3's sheet checks every height that way.

**The person near the camera (M6).** STYLE_ADJUSTMENTS 4 (owner-approved) asks for "S1, S11, S12: a person near the
camera ... someone walking home through the snow in the foreground of the home view (from behind or in profile, about
130-220 px tall) ... The S12 gloved hand and phone stay"; the playbook's people in use (2026-10-30) draw them. So, by
default, one person, one place: **S1** they walk in and stop on the near pavement, feet ~(780, 1340), ~180 px, the head
turning up 0.3 s before "heat" (E10's look: the sightline through the window's box), so their window lights as they
look at it; **S11** the same person on the same spot, ~207 px at 1.15x (feet ~(809, 1408)), slid in from the right by
the follow, looking up as the front climbs and the frost clears: the heat arrives where they stand; **S12** the same, at
~180 px, as the window steps warmer on "apartment", your hand and phone bottom left: the payoff lands on a person, the
window lit and empty (one such person a film: rule 7). A stranger near the camera, never "you": the one "you" stays POV
(your hand); rule 7 allows one tier-B stranger in the mid ground in profile or three-quarter when the "you" is POV, and
STYLE_ADJUSTMENTS 4 is newer than DIRECTION 3's and the card's "no strangers in any foreground" (a clash row). The first
draft's version (the walker in S1 only, a ~60 px bust in the lit window in S11-S12) is the owner's alternative
(question 2).

## The shots

### S1 · 0.00-4.28 s · f0-257 · the hook ("Did you know Helsinki wants AI to heat seventy thousand homes?")
**(a) The frame: SR1 THE DRAWN SUBJECT with SR8 THE BREAK IN THE ROW.** Lead **D7** (CORE, his pattern with ONE break:
the block's panes one texture, the window the break); T is frame 0's drawing (the line first, then the colour over it:
never counted as a lead); **N7** (CORE) the block one closed dark shape, the window the hardest step; **E2** and **E8**
(CORE) the lit opening carrying the one honey accent; A2 (SIT) the golden box; E4 (SIT) the walker's room ahead; E6 and
N6 (SIT) the stacked distances; D4 (SIT) the cloud's counterweight. The home view above. The band's sky is laid at frame 0
and never un-paints, so "Did you know" reads warm white from frame 0 (R2, the hook's 136 px, seat L; ink <= 585). Crop:
the run starts at x >= 140 (the feed hides x < 98 and the page still slides for 0.4 s); nothing to read at y >= 1519 or
under the rail (the person's front edge at x ~810). **Eye:** the brush tip on the run with the first caption; its landing
in the golden box (0.67 s); led back to the source, where the machine appears (1.4 s); the heat running to the window;
the window lighting on "heat" (2.0 s); then the wave outward from it (2.3-3.4 s).
**(b) The motion, as a schedule (M4; STYLE_ADJUSTMENTS 1's painter's order, the run as T's line first):**
- **f0:** the night sky with the band already laid and calm; the lower field the snow's paper; the run's first ~100 px
  already laid from (140, 1214), the brush tip at its end (~(240, 1219)) and moving (never a bare page, never a still
  frame). The run is a BOLD stroke: >= 24 px wide, L* ~18 on the snow's L* 60 (a 42 L* step).
- **f0-40:** the brush lays the remaining ~585 px to the radiator (598, 1062) on an out-sine (moving from frame 0,
  decelerating into its landing): mean 14.6 px/f, peak 23 px/f at the start (rule 13: one pen tip <= ~25 px/f); it lands
  in the golden box at f40 (0.67 s, inside rule 13's 0.4-0.7 s), with sync #2.
- **f4-38:** the harbour and the far city as one low wash (y 1090-1214), left to right, landing on "Helsinki" (f38).
- **f10-40:** the street's snow as one broad wash under the run (tier C, quiet).
- **f24-54:** **the block, one dark wash rising from its foot (1262) to its roof (690) at ~19 px/f** (reveal.tsx's 'haze'
  columns, "a tower: columns, from the ground up"), the window's pane left bare: its front passes the radiator at f35 and
  the window's row at f36-41 as the brush lands (f40), so the bold onset peaks in the golden box's column at 0.6-0.7 s.
- **f54-74:** the next block, the cloud and the person painted on stroke by stroke (tier C/B); the person painted on
  already walking at x ~858 (~371 px from the window: rule 14's 370), then walking left in profile at ~1.6 px/f (0.5 x
  their height a second, poses held ~5 f) to x ~780 by f104.
- **f60-84:** the brush lifts at the radiator and travels in view (not painting) to the run's start at the computer's
  site (260, 1220): ~373 px, trapezoid, mean 15.5 px/f, peak 22: **a declared jump, led by the cursor**, so the machine
  is found, not searched for (the review's S2).
- **f84-102:** the computer paints on as one column wash rising from its foot (~21 px/f), its columns of small cool
  lights switching on with the hum (sync #3; "AI" f90): the second change, 1.2-1.7 s.
- **f88-122:** the brush leads the warm colour back along the run, from the computer's foot to the radiator (~565 px,
  trapezoid, mean 16.6 px/f, peak 23.8): the warm water floods the line and the line ends under its fill (T), the melt
  widening just behind the front, a puff of steam from the manhole as it passes (~f100). The heat leaves on "AI": the
  cause before the effect, one mover at a time (the review's S3b: the water no longer sets off on "know").
- **f98-104:** the person's head turns up toward the window (E10's look, 0.3 s ahead of the light); f104 they stop at
  (780, 1340) and stand (no mover).
- **f122:** the radiator fills; **the window lights** (a 6-18 f ramp to L* >= 95, the bloom at the source only) and its
  frost clears (sync #4; "heat" f128): the expected thing, one home.
- **f140-205 (M3, "seventy" to "homes?"): reality overtakes.** A travelling front of light leaves the one window and runs
  outward: the block's own panes (f140-165), the next block and the street's houses (f155-185), the far city as a sweep of
  points left and right (f175-205); each window flares to L* ~85, C* ~40 (warm) over 6-8 f and settles within ~18 f to L*
  ~55-60, C* <= 25 (<= ~42 L* over the dark facades: rule 4), lit homes at rest. The one window holds L* >= 95 with its
  bloom (no other light within 10 L* of it at rest) and its frost cleared: the hardest step and the only honey accent once
  the wave has passed. One soft chime as the front reaches the far city (f175, "thousand": sync #5, 53 f after #4),
  never a roll of plinks. At phone size the near blocks' panes (60 x 80 px) carry the read; the far belt is the sparkle
  that says "and the whole city".
- **f205-235:** the hook's picture whole; the brush rests at the radiator (the cursor, still).
**(c) The join S1 -> S2: C, RM4 1.56x in and left about (-485, 762) (a straight dolly toward the computer: one move) with
RM8's un-paint.** At the end of "homes?" (f235) the brush tip runs back from the radiator down the riser, taking back
the window's warm step (the window back to the city's lit level, L* ~55-60, its frost returning: the review's S4), then
along the run to the computer's foot by ~f300 (~8.7 px/f), lifting the warm water and its melt (the same reveal run
backwards: STYLE_ADJUSTMENTS 1); the camera follows 2-4 f behind it: f235-325, trapezoid, accelerating to "AI" (f257),
cruising f257-294, landing f325 (16 f before "giant"'s blink). Peaks: the frame grid 12.9 px/f (`camspeed.py` 13.9), the
window 10.8, the block's right side 11.2. Nothing else enters in f245-269 (the 0.4 s round "AI"); the city's windows
stay lit (homes: FL 6.1).
**(d) Why:** the line first plus one lit break beats an establishing wide with a cut to the window, because frame 0 must
be the scene being made (the playbook), the one window must read as "a home" before the city overtakes it, and the
machine must arrive as the cause of the heat the viewer then watches travel.

### S2 · 4.28-8.76 s · f257-526 ("AI actually runs on giant computers, in buildings called data centers.")
**(a) The frame: lead Z3 (SIT, the medium: the explainer's working size) in SR25, N7 (CORE), C1 (CORE) from
"buildings".** The push lands with the computer on the axis, **336 x 588 px (x 372-708, y 880-1468)**, its upper light
columns the focal at ~(540, 1010) (drop 454), its foot 51 px over the name block; the horizon at y 1396, the harbour and
the far belt low behind it. **The block at the right edge** (x 857-1080, roof 650; 125 px on the feed: inside rule 10's
216 px for one framing mass), one quiet dark mass with its floors of lit windows: **the scale "giant" needs** (S17),
the one human scale in S2-S10. On "buildings" the plan's corner posts rise at x 192 and 829 to y 752 (a grow, 0.33 s,
out-expo, f409-429): a frame within the frame round the machine (637 x 753 px, ~23 % of the frame: C1's 15-30 %), "a
building that is not there yet". Band: the night sky, flat (R1 captions walk the seats C, L, R, C). **Eye:** the brush
tip riding back along the run, then the computer as the push lands, its lights blinking on "giant", then the posts.
**(b) The motion: RM7 after the push lands (f325).** "giant" (f341): its light columns blink (it is working; the picture
6 f ahead, f335); "buildings" (f415): the posts rise (f409-429).
**(c) The join S2 -> S3: C, RM4 2x lean-in about (540, 735)** (the point the camera travels toward, just above the top:
the top slides from y 880 to 1025 on a straight line). The cue first: the flakes landing on its top start to melt at f486
(the end of "centers." is f493); the push follows 4 f after: f490-570, trapezoid, the cruise f510-542 over "Those"
(f526), landing f570. Peaks: grid 14.8 px/f (`camspeed.py` 15.1), its foot 14.6, its lower lights 13.0.
**(d) Why:** the push in and left on "giant" beats a cut to the computer, because the un-paint needs the eye to ride back
along the run to its source: the camera follows the brush to where the heat starts.

### S3 · 8.76-10.96 s · f526-658 ("Those computers get really hot.")
**(a) The frame: SR12 THE CLOSE: lead N9 (CORE: one object, the machine's top, >= 650 px on one quiet backing; never a
building: S20), N1 (CORE), A2 (SIT).** The computer's top **672 px wide (x 204-876) at y 1025**; the melt on it at (540,
1025) lit warm from inside (the one accent: the heat), in the golden box (drop 469); steam rising off it and thinning out
at y >= 620 (405 px of open night to rise in); the snowy night behind one quiet dark field; the plan's posts off the frame
(x -157, 1119) and no top line across the sky. Words: "hot." lifted in the captions (R5). **Eye:** the melt, then the
steam pouring up toward the words.
**(b) The motion: RM7 from the landing (f570).** "really" (f584): the first wisps rise off the melt (f578); "hot" (f612):
**steam pours off** (RM6's burst at the focal, its onset in the golden box's column, f606).
**(c) The join S3 -> S4: C, I4 a story pull 2x about (540, 719),** carrying its own event (the room the kettles will
need; "To put it into perspective" is its picture; never next to the big move: two joins away). It starts 30 f after the
pour's onset (f636, so the pour's state reads >= 0.5 s), cruises f662-704 over "To put it into", lands f742 (4 f before
"one"). The steam column's top drops from ~620 to ~670 as the machine shrinks under it. Peaks: grid 11.2 (`camspeed.py`
11.4), the computer's foot 11.2.
**(d) Why:** the close on "really hot" beats holding S2's medium, because the melt and the steam must read at phone size
(a 672 px top, not 336), and the pull that follows IS the connector "To put it into perspective".

### S4 · 10.96-17.76 s · f658-1066 ("To put it into perspective, just one of these computers makes as much heat as FORTY kettles, boiling non-stop.")
**(a) The frame: SR21 THE LINEUP: lead D7 (CORE, his pattern: forty kettles as ONE texture, the lit grille its one
break), D5 (RARE, his pyramid; its one use in the film), B3 and Z3 (SIT).** The computer **336 x 588 (x 372-708, y
875-1463)** is the pyramid's apex, its grille lit (x 522-558, y 993-1185), the hardest step at ~(540, 1089) in the golden
box (drop 533); its steam rises from y 875 and thins out at y >= 620 (255 px: no sideways bend). **The block at the right
edge, roof y 645** (M1: under the band; 125 px on the feed). On "FORTY" 5 shallow rows of 8 kettles on the snowy floor at
its foot, their bases at y 1471-1515 (the front row's base at 1515, above the name block), seen a little from above so the
rows recede toward it (B3): the back row 470 px wide, the front row 650 px (x 215-865), kettles 56-72 px (>= 60 in the
front three rows), one mid texture (+-6 L*), lids and spouts behind a clear front row: the pyramid's base 650 px (>= 540).
The plan's posts at x 192 and 829 (tops 734). No "40" tag in the picture (the caption's 40 is R3's big number). Crop: the
front row ends at x 865 (left of the rail) and y 1515. **Eye:** the computer alone on "one", its steam on "makes", the
kettles' spread on "FORTY", back up their steam to the grille.
**(b) The motion: RM7 with RM8b's build (the review's S10: an event every 1.0-1.3 s).** "one" (f752): its light columns
blink once (cool: the gesture planted for S12's "blink back"; f746); "makes" (f823): the steam column doubles in width
and quickens (f817), a change readable at phone size; **"FORTY" (f904): the kettles pop by rows** (RM8b), back row first,
one row every 6 f (f898-922), each pop ~7 % overshoot peaking at ~12 f; "boiling" (f973): all boil, lids rattling (their
own small loops, tier C), their steam joining the column (f967). Events at f746, f817, f898, f967: never > 1.5 s without
a story change.
**(c) The join S4 -> S5: C, RM4 2x up the steam about (540, 666), f1012-1102 on rule 20's long-move cruise**
(trapezoid, peak 1.43x the mean; the first draft's 52 f in-out cubic ran the kettles at ~55 px/f: the review's S13), the
cruise f1034-1070 over "That's" (f1066), landing f1102, 9 f before the mug. Peaks: grid 13.9 (`camspeed.py` 14.1), the
kettles' front row 14.7 as they leave, the grille 7.6.
**(d) Why:** forty as a 5 x 8 block under one apex reads "how many" at a glance (SR21: a count is a shape); a ring round
the machine (B13) or kettles drawn one by one would be forty subjects.

### S5 · 17.76-19.26 s · f1066-1156 ("That's a lot of tea.")
**(a) The frame: SR12 THE CLOSE again (not a neighbour of S3): lead N9 (CORE: the machine's top, 672 px, the object; the
mug its one call), N1 (CORE).** The computer's top 672 px wide (x 204-876) at y 1084; **the mug ~140 x 140 (~190 with its
handle) at (540, 1010)** on the top, big enough to read on a phone: this spot is **the pivot** the next shot holds (drop
454). Steam fills the field above (patterned, thinning at y >= 620): the steam is the quiet field, the mug the one small
calm call in it. Words: R6, "That's a lot" / "of" / "tea." lettered in the open space above the mug, clear of its curl.
**Eye:** the steam's field, then the mug popping.
**(b) The motion: RM7 from the landing (f1102).** "tea" (f1117): the mug pops (RM8b; start f1111, peak ~f1123), its
small curl of steam joining the rest; nothing else happens to it.
**(c) The join S5 -> S6: C, the one big move (I4 at scale) with I12, the carrier the mug's spot and the steam.** At the
end of "tea." (f1130) it begins as a creep (S5_EASE: never still, one peak, a long landing); on "Normally," (f1156) it is
still creeping off the mug. The declared scale reveal leaves from the thread (the steam round the mug) and returns to it
at the next join (CRAFT §a.1).
**(d) Why:** a close on the mug at the pivot beats a wider joke frame, because the next move needs its pivot already where
the eye is, and one joke wants one beat.

### S6 · 19.26-23.46 s · f1156-1408 ("Normally, data centers just use big fans to blow that heat outside.")
**(a) The frame: SR17 THE ONE BIG MOVE: lead D2 (CORE, his scale), D1 (CORE, the negative space), E8 (CORE, the warm
accent kept on Helsinki: STYLE_ADJUSTMENTS 8), Z1, E6, N6 (SIT).** The landed frame (painted, one colour key): **the
Earth from high above at night, its limb at y ~220, above the band** (a thin light at y 220-270, space above it); the band
and the stage down to ~y 900 over the open sea, in the night sky's own value: one flat field through the whole move (and
D1's negative space); **Helsinki a small warm lit spot at the pivot (540, 1010)**, ~24-27 px (the city), the one hot
accent, on a coast; the snowy land below it with plain boxes with roof fans, the near box on the axis at ~(540, 1175),
~32 px, the far ones tiny (the world going on past every edge); their plumes rise on "blow" and thin out at y >= 620.
Generic land, no coast a viewer can name, Helsinki never the only spot without a plume (FL 8.2, 8.12). Words: R8, seat C
only, no seat change during the move. **Eye:** held on the pivot all the way out, then the near box's fans on "big", then
the plumes. **Why the limb sits above the band (found in this fix pass):** the first draft landed it at y ~780 with the
band in the sky; as the planet picture shrinks toward the pivot, a limb above the pivot sweeps down through the band
(here between 3.1x and 1.8x of the landed frame, f1248-1265): rule 2's band and rule 12's middle frames forbid it. Landing
it above the band, with the sea in the sky's value, keeps the band flat at every frame.
**(b) The motion: I4 at scale, the nested pull (CORE), with I12 the pivot.** f1130-1312 (3.03 s, landing on "blow": the
review's S5), one S5_EASE cubic-bezier(0.55, 0.03, 0.50, 1.0) over the whole chain, x124 in all (the home view from 3.11x
to 0.025x): its mean x2.21 per 30 f (the library's nested pull: <= ~2.3x), its peak at f1226 ("just") at 2.08x the mean,
where a detail 273 px from the pivot moves 15 px/f, so only the home view's big masses lie beyond. The pivot held within
+-40 px of (540, 1010) all the way. On the words (`--numbers`): "Normally," (f1156) creeping off the mug (2.65x); "data"
(f1196) the street at ~1x passing round the pivot, the eye-level world its outer picture (its horizon below the pivot,
its sky the band's flat field; the hero cloud stays out of the chain: it would cross the band at 0.54-1.36x); "centers"
(f1206) 0.68x; "just" (f1225) 0.26x at the peak; **"use" (f1242) the hand-off (I12):** the home view at ~0.105x (113 px
wide, its lit cluster ~100 px, centred within ~40 px of the pivot) and the planet picture's Helsinki spot drawn over it at
~100 px (within 1.5x): the angle changes (eye level to high above) inside this hand-off, the big masses matching (the
night sky and the dark sea one value, the snow and the snowy land one value), where nothing reads; "big" (f1256) 83 %
done, 2.3x the landed frame: the near box ~75 px at ~(540, 1398), its fans ~25 px start to spin (its onset in the golden
box's column, >= 0.5 s from any other); "fans" (f1271) 1.5x; "blow" (f1312) landed: the plumes rise off every box (the
landing's own event: a pull carries its own event). **Locked f1312-1373** (61 f >= 30 f, under 5 % of the peak speed).
**(c) The join S6 -> S7: recommended RJ2 (F, RARE: the "But" turn only), a plain cut at f1402 (23.37 s), 6 f before "But"
(f1408),** from the landed frame after its hold (the library: a scale shot is left by RJ2 only on a "But", from the landed
frame). The carrier: the heat let go on both sides (the boxes' plumes, then the computer's steam) and the music's step on
"But" (SOUND_SYNC S13). The size jumps far more than 20 %, the angle from high above to eye level; the incoming camera is
already moving (S7's push, keyed f1372, cut into at f1402); the eye's jump from the pivot (540, 1010) to S7's warm top
(540, 925) is ~85 px. From the end of "outside." (f1373) to the cut the curve holds while the wind drops to the street's
hush. **The owner's alternative (no cut): J8 (D), a snow cloud wipes across,** f1384-1432 (48 f, Film's
`foreground-wipe`, 0.8 s): a near, soft snow cloud (tier C, one flat value) slides in from the left across the stage, its
edge on an in-out sine peaking ~50 px/f, covering >= 70 % of the stage (y 620-1520) on the cut frame (f1408, on "But"),
never above y 620; S7's frame behind it with its push already moving; it clears to the right by f1432, the street
revealed in falling snow (literal: Helsinki is under snow). **Not offered:** the first draft's "one 7x push-through into
Helsinki's lit spot" and the card's A: J2 needs an opening 15-30 % of the frame and the spot is ~24 px (~0.03 %); 7x
leaves it 168 px with the curve still round it, and filling the frame from 24 px takes ~60x, the written dive's problem
again (each 2.3x step >= 30 f, so >= ~2.4 s; the pause and "But Helsinki" give 1.15 s).
**(d) Why:** "Normally" means everywhere, so one continuous move from a mug to the planet beats any cut there; the pivot
keeps the eye on one spot while the world grows, which is what makes the scale felt.

### S7 · 23.46-25.54 s · f1408-1532 · the turn ("But Helsinki WANTS that heat.")
**(a) The frame, re-staged (M2): lead E9 (his, CORE 5·5·5: the camera holds, the reach's tip travels its line and
arrives at the heat's foot) in SR25, with B1 (CORE: the reach as a leading line ending at the cause) and N7.** The cut
lands on the computer **on the axis at 1.15x: x 416-664, y 900-1335**, its warm steaming top the focal at ~(540, 925)
(the heat let go: the one accent), ~85 px from the pivot the eye held at the cut (rule 19, N1); the horizon at y 1282
(setup A); the plan's posts at x 282 and 754 (tops 806) round it; **the block enters at x 775** (roof y 730, its panes at
the city's level; 207 px on the feed), its one window (x 988-1067) off the feed (x > 982); the small box (the manhole) at
**(823, 1399)**; the kettles and the mug gone. Words: R4, the landing word "wants" in the lit hand, rows 362/482/578 in
the band. **Eye:** the warm top (the turn is felt from the cut itself: planet to street, high to eye level), then the
reach crossing toward it. N15 (the off-balance) drops out of the film: its condition, "no counterweight", cannot hold in
this place (the block fills the first draft's "open half", and its window was a second light 450 px away).
**(b) The motion: S7's incoming push 1.10x -> 1.15x about (540, 921), f1372-1442 (in-out sine, cut into mid-move at
f1402), landing on "WANTS" (f1442); then RM7 with RM8 (the drawing is the beat: a plan).** "WANTS" f1442-1496: the brush
cursor draws the plan's stretch as a marked-out line on the snow (a surveyor's line, empty) from the small box (823,
1399) along to (719, 1399) and up to the computer's foot (639, 1339): ~204 px in 54 f (3.8 px/f); it reaches the foot on
"heat." (f1496) and stops; the steam keeps rising. The camera holds f1442-1513 (1.18 s: the pause after the heaviest
line). The path ends at the computer's foot (y 1339), under the golden box; the heat it reaches for rises through the box
(declared).
**(c) The join S7 -> S8: C, RJ4's seam, a 1.13x push about (540, 900)** (the computer's top holds its spot: one variable,
no "in and left"), f1513-1556, in-out sine, midpoint "The" (f1532), landing f1556 (15 f before the re-trace); the carrier
the steam rising over the plan's empty stretch. Peaks: grid 4.6 (`camspeed.py` 4.8).
**(d) Why:** the cut is the turn's jolt (planet to street, high to eye level), so the frame can stay centred and still:
the reach's line does the turning, drawn across empty snow toward the cause. **If the owner wants the lean:** keep the
first draft's 1.07x off-axis framing, but draw the block, its window (back at the city's level) and the box where they
land, and lead with E9 and B1 (the city on the right reaching for the heat on the left), not N15.

### S8 · 25.54-28.34 s · f1532-1700 ("The city has a plan to use it, starting next year.")
**(a) The frame, lifted 59 px (M2): lead C1 (CORE, his frame within a frame: the plan's posts frame the machine) in SR6,
Z4 (CORE, the paper), N7 (CORE).** The plan alone, MEDIUM: its corner posts at x 250 and 781 (tops y 794, its front line
on the snow at y 1421) frame the machine (531 x 627 px, ~16 % of the frame: C1's 15-30 %, fully left of the block); **the
computer inside on the axis, 280 x 490 (x 400-680, y 900-1390)**, its steam out of the open top, thinning at y >= 620;
the horizon at y 1330 and the harbour (y 1330-1387) behind; **a ferry on the harbour left of the plan** (x ~112-236, y
~1335-1380), Pip at its rail ~(202, 1339) (~420 px from the tag); the block at the right edge (x 804, roof 708; 178 px on
the feed); the plan's empty stretch marked out from the small box (859, 1463) to the computer's foot (651, 1395), so the
reach of S7 still reads. **The 2027 tag** (~280 x 170, "2027" at 122 px, the figures ~72 px: TYPE_GUIDE R7) **pinned to
the computer's front panel** on the axis, centre (540, 1091) (drop 535): light paper on the dark machine, the hardest step
once it lands. **Eye:** the posts as they are re-traced, then the tag.
**(b) The motion: RM7 with RM8 (the drawing is the beat: a plan; the RM8 dose is then 3, declared: S15).** "plan"
(f1571): the brush cursor re-traces the two posts and the front line (three ~8 f strokes, f1571-1595). "next" (f1644):
the tag swings on (start f1638, a pendulum settle ~0.4 s, ~7 % overshoot, landing by "year" f1662). Then still.
**(c) The join S8 -> S9: C, RM4 1.16x about (540, 1250), f1678-1716, in-out sine, midpoint "So" (f1700); the carrier the
computer's small lights blinking at the end of "year." (f1678).** Peaks: grid 7.6 (`camspeed.py` 8.3). The camera never
passes the plan: the tag (y 1091) is above the eye line (y 1330), so a forward dolly through its plane would lift it, and
the posts' tops, up through the band (a found error: the first draft's tag "slid out of the frame's bottom"). The tag
stays on the panel and leaves WITH it on "how": it reads 1.0 s (f1662-1722) and never shares the read window with the
opened side (the review's S11).
**(d) Why:** the plan as an inner frame round the machine beats a finished building or a label, because "a plan, not
built" must read at a glance (FL 6.7), and the one word in the picture lives on paper in the place (SR22).

### S9 · 28.34-29.56 s · f1700-1774 ("So how would that work?")
**(a) The frame: lead E2 (CORE, his lit opening: the machine's opened side) in SR6, C1 (CORE, "look in here"); one held
frame with S10, one lead.** The computer at 1.5x the home view, **324 x 567 (x 378-702, y 845-1412)**, centred; the
plan's posts at x 204 and 819 (tops 722) round it; the block at the right edge (x 846, roof 623; 136 px on the feed); its
inlet (the thin pipe, there since "AI") comes in from the left edge at y ~889 to its top, cool water still in it; steam
off its top, thinning at y >= 620. On "how" its front panel swings open on a hinge at its left edge, taking the tag with
it: **inside, x ~400-680, y ~885-1396, the 8 stacked machines lit by the computer's own cool light** (L* ~85-90, a step
under the story light: STYLE_ADJUSTMENTS 3's "second, cooler source"; the review's S21), and a dark pipe running down past
each one, empty. The one warm accent stays the heat (the steam's glow, then the hot water from "water"). A real door, not
a diagram cut (STYLE_ADJUSTMENTS 2). Focal: the opened side's centre ~(540, 1140) (drop 584). **Eye:** the panel opening,
then down the empty pipe.
**(b) The motion: the push lands f1716; the panel swings f1716-1740 (out-cubic, 0.4 s), its picture 6 f ahead of "how"
(f1722);** the tag turns edge-on with it by ~f1728. Then RM7.
**(c) The join S9 -> S10: C, RJ4 at rest.** The voice runs on with no pause ("work?" into "A", f1774); the picture holds;
nothing starts until "big" (f1792).
**(d) Why:** a door opening on "how" beats the written push still running through it, because the onset reads only on a
still camera, and a real door keeps the machine organic.

### S10 · 29.56-34.46 s · f1774-2068 ("A big new data center would take the heat out of its computers with water in pipes.")
**(a) The frame: S9's frame held (E2 leads it); inside it B2 (CORE, his vanishing point, hidden behind the subject: rule
8), D7 (CORE, the planned machines one texture, the one real opened machine the break), E9 (CORE, the subject travels the
device's line), A6 (SIT, the cross: the vertical pipe on the floor line).** On "big" the plan grows into a hall behind
it: **rows of marked-out machines receding to a vanishing point on the eye line at (540, 1343), hidden behind the
computer's lower half** (the review's S6: floor lines meet only on the eye line). **Seen, not only coded (the review's
S16b):** the rows' tops fall from y ~640 at the left edge toward it inside the stage (they pass behind the machine's left
side at y ~1130), their feet rise from y ~1560, each row's front a vertical mark; the hall's lines at L* ~80 on the
mid-dark sky and the snow (a step of +20-40 L*, >= 5 px at this size: readable on a phone); on the right only the strip
between the machine and the block (x 702-846) shows the hall (the block stands nearer, in front of it); the floor's joints
converge under the app's text; no roof (the night sky with the band above stays one field). The one real computer solid,
dark and lit inside: everything points at the cause (B3's job, done by B2's lines). **Eye:** the hall opening out behind
on "big", back to the machine, then down the pipe with the water, through the golden box to the foot (y ~1412: a drop of
856 px, beyond rule 3's 650, declared: the travel is the beat, and the follow picks the water up there).
**(b) The motion: RM7 held, with RM1 (his E9 in motion).** "big" (f1798): the rows grow up from the floor (RM8b, a 0.4 s
grow, front rows first, one group, f1792-1816). "take" (f1868): **cool water runs in at the top (540, ~885) and down the
pipe past each machine** (start f1862), ~510 px to the last machine by "computers" (f1936): ~6.9 px/f, the eye following
one point; the steam off the top thins as it goes and **stops at f1936** (the hiss ends with it: a sound taken away).
"water" (f1981): it leaves the foot (540, ~1412) hot (f1975; cool blue in, honey out: the heat is the water from here)
into the plan's stretch under the snow heading right, and the snow over it starts to melt. The camera holds instead of
the written tilt: a tilt would carry the machine's lit body up through the band (rule 2) and make two follows in a row
with S11 (Part 0b §2.4).
**(c) The join S10 -> S11: C, RM3 the film's one follow (SIT), the carrier the hot water's front.** The camera starts 4 f
after the front (f1979) on one straight path back and right (0.77x about (-1293, 785): 1.5x -> 1.15x), its progress
derived from its subject so **the front holds its screen spot at x 540-556** (the review's S7: the first draft's x ~410
slid the water left, then right, against the thread's one direction); its lead room comes from the street opening ahead
as the camera pulls back; the seam with S11 mid-move on "Then" (f2068); the front's path stays inside the stage (y ~1412
-> 1330). Peaks: grid 4.7 (`camspeed.py` 5.0), the window 4.4; the largest frame-to-frame speed step 0.9 px/f.
**(d) Why:** the camera holding while the water runs down beats the tilt, because the water's descent is the beat (the
camera moving would split the eye), and the hall's vanishing point hidden behind the machine says "a big new data
center" without a second subject.

### S11 · 34.46-38.48 s · f2068-2309 ("Then pipes under the streets carry that heat into people's homes.")
**(a) The frame: lead E3 (SIT, his stillness against motion: the front held still while the street slides by; its merged
N10 is the pivot) in SR10, landing as SR25; B8 (SIT, his S-curve in its angular form: the run's legs end on the focal),
E2 and D7 (CORE: the one window, its row).** It lands as the home view at 1.15x anchored on the window: **the block x
347-846, roof y 661 (its stair tower 635), foot y 1319; the one window at (600, 1000), ~78 x 101,** at the city's lit level,
frost on; the run's street leg at y ~1330 from x ~292 to the door at x 556, the manhole at x ~395, the melt and the warm
water up to the front; the riser up to the radiator at (600, 1089); the computer cut by the left edge (x < 237); the
plan's right post at x 326 (top 737); tram and footprints above the run, small and slow; Pip on the next block's balcony
at ~(878, 902) (above the rail's top, y 1032). **The person near the camera (M6):** on the near pavement, feet ~(809,
1408), ~207 px (head ~y 1201), in three-quarter, looking up at the window; the follow slides them in from the right and
they hold when it lands. Band: the night sky. The front's pivot (y ~1330) sits under the golden box while the street
slides (declared: the street lies under the block); the window, where it ends, is in it (drop 444). **Eye:** the front,
held, during the follow; then the door; then up the riser to the window, where the person is looking too.
**(b) The motion: RM3 + I12 (the front held within x 540-556) lands on "into" (f2208).** "pipes" (f2098): mid-follow, the
front passes the manhole: a puff of steam from it and the melt widening past it (the boost). Then RM7 locked, with RM1:
the front reaches the door (f2208), **climbs the riser on "people's" (f2222-2246, ~241 px, ~10 px/f)** and fills the
radiator on "homes." (f2249): the window's frost clears and the radiator warms, the sign of arrival with **no light step**
(the one step stays on "apartment": the review's S15). Rest f2249-2286.
**(c) The join S11 -> S12: C, RJ4's seam, a 1.15x pull back about (585, 885)** (the window slides from (600, 1000) to
(598, 985), inside the golden box), f2286-2332, in-out cubic, its midpoint on "So" (f2309), where the bed lifts: the
release (SOUND_SYNC S7), in a voice pause of 0.72 s (43 f; the library: the picture's release stays on its word, the
locked take's pause is SOUND_SYNC's: clash row 32). The carrier: the one window, its radiator just filled. Peaks: grid 9.3
(`camspeed.py` 9.4).
**(d) Why:** one follow with the front as the pivot beats a cut or a held wide, because it carries the eye from the
machine's foot to the block on the thread itself, and a held wide would be S12's frame one shot early; landing at 1.15x
keeps the street run above the name block while the window sits in the golden box (Part 2 §0: the side-on set's scale
ceiling, 1.48x here). **The owner's alternative** (question 3): a down-the-street S11 (his B1, B2 and E7 in one frame).

### S12 · 38.48-42.24 s · f2309-2534 · the payoff ("So your chatbot could soon heat an apartment in Helsinki.")
**(a) The frame: SR24 THE WHOLE RUN with SR13 THE HANDS: lead N14 (CORE, the deliberate match: S1's frame, now read end
to end), B1 and E8 (CORE: the run as one line in the story's order, ending on the one hot accent), E2 (CORE), B8 and E11
(SIT).** The home view, its run warm end to end, the city's windows lit at rest, the plan's posts pale round the computer
(x -50 off the frame, x 360; tops 756). **The person near the camera** on the pavement at (780, 1340), ~180 px, in
three-quarter, looking up at the window. POV: **your gloved hand rises from the bottom LEFT (the wrist under the name
block as a mass), the phone's screen ~140 x 170 at x 330-470, y 1310-1480 (centre (400, 1395))**, under the run's street
leg and below the computer: cause above, effect in hand; the screen a step under the window (it never takes the hardest
step). E11 now places the hand bottom left, lower (y 1310-1480) where the thread's run crosses its box. Words: R9, "heat"
in the lit hand, the last group at the hook's 136 px. **Eye** (the voice's order): the bubble (400, 1395) -> the
computer's lights (~(174, 1027)) -> the pulse along the street -> the window (598, 985), where the person's look ends too:
a zigzag in three legs ending on the focal (B8's angular form).
**(b) The motion: the pull lands on "chatbot" (f2332); then RM7 locked, with RM1 the pulse.** Your hand rises f2296-2328
(32 f, out-cubic, from below the bottom edge, its wrist under the name block), declared as the pull's second leg ("you
look down at your phone": the review's S8). The chat bubble pops on "chatbot"'s first frame (f2332: rule 15 allows 0 f,
never after; on the landing frame, never before it). "could" (f2364): the computer's light columns all blink back at once
(planted in S2 and S4) and a pulse of warm water leaves its foot; "heat" (f2399): the pulse runs under the street, the melt
widening a step as it passes (~565 px in 54 f, ~10.5 px/f); "apartment" (f2424): **the window's step at f2418** (6 f ahead:
the film's hardest step and its warmest light), then **61 f of hold** before the tail (>= 1 s: the review's S12). "Helsinki."
(f2464): only the snow and far life move. *If the 1x watch finds the chain hurried* (the review's S12b): the blink-back
and the pulse's start move to "soon" (f2375) and the pulse runs f2375-2418 (~13 px/f).
**(c) The join S12 -> S1: RJ3 (CORE) the loop, B (the thread match).** The tail f2479-2534 (55 f): the home view
un-paints in reverse order (the hand and phone first, the person, the far city, the harbour, the street, the plan's posts,
the block, the computer; the run last, the brush tip retreating along it f2484-2534 on an in-out sine, peak ~18 px/f) to
frame 0's drawing state: the run's first ~100 px from (140, 1214) and the brush tip at its end; the band's sky never
un-paints; the captions back to page 1 ~13 f before the seam; no hit on the seam. On "Did" (f8) the brush sweeps on.
**(d) Why:** the exact frame of the hook, now readable end to end, beats a new payoff picture, because the rewatch must
land on the same picture (SR24), and the heat arriving where a person stands lands the payoff on someone.

## The film as a whole

**The sequence of stops** (the lead · its tier · the size against the home view · the intensity):

| | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | S9-S10 | S11 | S12 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| lead | D7 | Z3 | N9 | D7 | N9 | D2 | E9 | C1 | E2 | E3 | N14 |
| tier | CORE | SIT | CORE | CORE | CORE | CORE | CORE | CORE | CORE | SIT | CORE |
| size | 1x wide | 1.56x medium | 3.11x close | 1.56x medium | 3.11x close | planet | 1.15x wide | 1.30x medium | 1.5x medium (held) | 1.15x wide | 1x wide |
| intensity | contrast (hook) | calm | rising | calm, counting | smile | awe | contrast (turn) | calm | question, explaining | travel | release |

- **Variety (Part 0b §2 item 3, the library as it stands; the review's S14):** 11 stops (S9 and S10 share one held
  frame, so one lead), **9 different leads**: his 6 (D7, D2, E9, C1, E2, E3), ours 3 (Z3, N9, N14); 9 of 11 stops
  CORE-led (82 %), 2 SIT, no RARE: inside 6-9 leads, >= 7 in 10 CORE, <= 2 RARE. T is frame 0's drawing and never counts.
  No lead in neighbouring stops; D7 (S1, S4) and N9 (S3, S5) lead twice each, never as neighbours.
- **His ideas inside the frames, every one accounted for:** working without leading: B1 (S1, S7, S11, S12: the run and the
  reach), B2 (S10's hall: its vanishing point on the eye line, its rows converging inside the stage), B3 (S4), B8 (S11,
  S12), D1 (S6: the dark sea above Helsinki), D5 (S4, once), A6 (S10), E4 (S1's walker, S11's lead room), E8 (every
  focal), E10's look (S1, S11, S12: the person's head turning up before the light), E11 (S12), and in every shot the
  grammar A1, A2, C2 with E5, D4, E6. Not used, each with no beat in this one side-on place: A3, A5, A7, B5, B6, B7, B9,
  B10, B11, B12, B13, C3, D6, E1 (no raised view, stair or slope, no near framing mass, no second state at once; the
  "you" POV only); B4 and E7 (a lane into depth: the down-the-street S11 would carry them with B1 and B2, the owner's
  question 3); A4 and D3 NOT FOR US.
- **Neighbours differ** (Part 0b §2.4): in size (S2-S3, S3-S4, S4-S5: 2x each; S5-S6; S6-S7) or in device (S1-S2,
  S7-S8 1.13x, S8-S9 1.16x, S11-S12 1.15x); one height throughout (a standing eye) except S6 (from high above): one
  camera per set.
- **Rhythm:** shots 4.28, 4.48, 2.20, 6.80, 1.50, 4.20, 2.08, 2.80, 1.22, 4.90, 4.02, 3.76 s (mean 3.52 >= 3.5; as 11
  stops 3.84); no three near-equal in a row; a story change on the subject every ~1.0-1.4 s; never > 1 s without a mover
  (snow, steam, the ferry, the person's walk in S1).
- **Rest:** the big move's landing hold (f1312-1373, 61 f); the turn's hold after "WANTS" (f1442-1513, 1.18 s); the
  explanation's one held camera (S9-S10, f1716-1979, 4.4 s); the payoff's hold (f2418-2479, 1.02 s after the window's
  step; the camera locked from f2332). No D1/S2 breather (SR16): the story goes from the planet straight into the turn,
  and the landing hold does that job.
- **The second half lives in one size band (the review's S16):** S7-S12 (18.8 s) are all 1.0-1.5x of the home view: right
  for an explanation in one place (its variety is in the device and the events: the reach, the paper, the opened machine,
  the hall, the follow, the payoff). The in-out run S2-S6 (push, push, pull, push, the big pull) is each line's own
  picture; the pumping fix sits where it bit, the S4 -> S5 push (now a 90 f cruise).
- **Moves, against the doses (Part 0b §0's table, after the library's fix pass):** RM7 holds in every stop; RM1 (the
  subject travels) in S1, S7, S10, S11, S12; **RM4 story pushes 4** (S1 -> S2 on "giant", S2 -> S3 on "really hot", S4 ->
  S5 on the joke, S8 -> S9 on the question; the dose 2-4), plus S7's 1.045x incoming push and the two RJ4 seams (<= 1.15x:
  S7 -> S8, S11 -> S12); **I4 a story pull 1** (S3 -> S4; 0-2, never next to the big move) and **the one big move 1** (S5
  -> S6, I4 at scale); **RM3 the follow 1** (S10 -> S11); **RM6/I11 light events 3** (the window on "heat", the wave, the
  window's step on "apartment"; S11's arrival is the frost and the radiator, no light step: the review's S15); **RM8
  draw-ons after frame 0: 3, one over the 0-2 dose, declared** (S2's un-paint, S7's reach, S8's re-trace: each the
  drawing as the beat, "only wanted", "wanted", "a plan"; the brightening alternative for S8 would put the light events at
  4 instead, so the pass decides: re-trace); RM8b builds 3 (S4's rows, S5's mug, S10's hall).

**Joins, against the doses** (recommended; the visual script's in brackets):

| carrier | joins | count | the library's dose |
|---|---|---|---|
| C, the continuous camera | S1->S2, S2->S3, S3->S4, S4->S5 (moves between stops), S5->S6 (the big move), S7->S8 (RJ4 seam), S8->S9, S9->S10 (RJ4 at rest), S10->S11 (the follow), S11->S12 (RJ4 seam) | 10 (C x9) | on one place, every join but the turn's (Part 0b §2 item 7) |
| F, RJ2 the plain cut | S6->S7 on "But" | 1 (0) | 0-2, each on a "But" |
| D, J8 the wipe | none (the owner's alternative on S6->S7: the snow cloud) | 0 (0) | 0-2 |
| A, J2 the push-through | none (S6->S7: not buildable from a 24 px spot; S11->S12: a 1.15x pull is C) | 0 (A x2) | each entry into another place through an opening (1-3) |
| B, RJ3 the loop | S12->S1 | 1 (1) | 1 |

J3/J4 (the matches), J7 (the carry), J10 (the morph), J11 (the light change across a cut) and J13 (the paper) are unused:
one home place, one key all film (DIRECTION 5), no paper but the tag.

**Speeds (the review's S13): every move's peak, px per 60 fps frame** (the budget ~15 for detailed layers: PIPELINE_V2
"Frame rate"; `composition_pass_sheet.py --speeds` analytic on the frame grid and the named things, `--camspeed`
rendering each move at half size from the planning world and running `video/scripts/camspeed.py --limit 15` on it):

| move | frames · ease | about | grid peak (analytic / camspeed) | the named things |
|---|---|---|---|---|
| S1 -> S2 | f235-325 · trapezoid | (-485, 762), 1.56x | 12.9 / 13.9 | the window 10.8, the block's right side 11.2, the brush on the riser 11.2 |
| S2 -> S3 | f490-570 · trapezoid | (540, 735), 2x | 14.8 / 15.1 | its foot 14.6, its lower lights 13.0, the plan's post 10.1 |
| S3 -> S4 | f636-742 · trapezoid | (540, 719), 0.5x | 11.2 / 11.4 | its foot 11.2, its lower lights 10.4 |
| S4 -> S5 | f1012-1102 · trapezoid | (540, 666), 2x | 13.9 / 14.1 | the kettles' front row 14.7, the grille 7.6 (first draft: ~55, ~28) |
| S5 -> S6 | f1130-1312 · S5_EASE, nested x124 | the pivot (540, 1010) | 15 px/f at 273 px from the pivot at the peak | only big simple masses beyond ~270 px near f1226 |
| S7 in | f1372-1442 · sine | (540, 921), 1.045x | 1.0 / 1.8 | |
| S7 -> S8 | f1513-1556 · sine | (540, 900), 1.13x | 4.6 / 4.8 | the small box 2.7 |
| S8 -> S9 | f1678-1716 · sine | (540, 1250), 1.16x | 7.6 / 8.3 | the block's roof 3.9 |
| S10 -> S11 | f1979-2208 · derived from the front | (-1293, 785), 0.77x | 4.7 / 5.0 | the window 4.4, the person's head 4.1 |
| S11 -> S12 | f2286-2332 · cubic | (585, 885), 0.87x | 9.3 / 9.4 | the computer's lights 4.1 |

`camspeed.py`'s camera measure agrees with the analytic peaks within ~1 px/f in all nine; its fast-local-motion WARNs
(16-23 px/f, on moves whose fastest drawn point runs <= 15) and S8 -> S9's two velocity-step flags (1.4 -> 4.0 px/f at its
5th frame and back at its 34th, where the analytic curve rises 2.2 -> 2.7) come from its estimator on a flat planning
drawing (few features; rows of identical panes and dots: the tool's own caveat): the analytic curves are smooth (the
largest frame-to-frame step 0.9 px/f). Re-run it on G3's sketch.
**The band through every move** (`--numbers`: the block's roof and its stair tower and chimney, the plan's post tops,
every frame of every move inside the caption band's width, x 95-945): clear (>= 620) in all ten; that is why S3's top sits
at y 1025, S4's at y 875, the block's roof bumps at x >= 716 and the plan has no full top line.

**Onsets against landings (the review's S9; Part 0b §2 item 7 asks a landing >= 30 f before the stop's onset):** the
take's pauses (19-43 f) cannot always give 30 f, so these onsets come 0-16 f after their landing, on a camera already at
rest (declared): S2's blink 10 f after (f325 / f335), S3's wisps 8 f (f570 / f578; its pour 36 f), S4's blink 4 f (f742 /
f746), S5's mug 9 f (f1102 / f1111), S7's reach 0 f (the landing word's own picture, f1442), S8's re-trace 15 f (f1556 /
f1571), S9's panel 0 f (f1716), S11's climb 14 f (f2208 / f2222; the front's arrival is the landing itself). S6 lands with
its own event (the plumes). The one that broke a rule is fixed: S12's bubble now pops on the landing frame (f2332), not 6 f
before it.

## The verdict: "one continuous camera, no cuts" against his reels and the library

**His reels** join every idea with a hard cut through a black line card (RJ1, NOT FOR US) because they are lists; his one
continuous take, reel 03's sheet (RJ4, CORE 4·5·5), is the closest model for a story told in one place. **The library**
ranks RJ4 CORE and the plain cut RJ2 RARE (3·3·2), its condition DIRECTION 1's: at most two F a film, each on a "But"; on
one continuous camera every join may be C but the turn's (Part 0b §2 item 7).

**Keep the continuous camera for 10 of the 11 joins between shots.** The film is one place, one thread and one travelling
look; its joins sit inside sentences' pauses of 0.32-0.72 s (none at all between S9 and S10), which only a moving camera
can bridge; and "one flowing story, never a bunch of shots stitched together" is the owner's own rule.

**Cut once, on "But" (S6 -> S7, 23.46 s): a plain cut serves better than the written dive.** The reasons:
1. *Craft, in numbers:* the written dive runs ~49x back through every step of the planet move in 69 f (1.15 s); the
   library's nested pull allows ~2.3x per 30 f, so ~49x needs ~140 f (2.3 s): twice the time the voice gives, which is
   why it would read as a whip (J9, NOT FOR US) and repeat steps the viewer has just seen.
2. *Story:* "But" is the film's turn; the library's turn grammar enters it by RJ2 (SR18's join) and leaves a scale shot by
   RJ2 only on a "But", from the landed frame after its hold.
3. *Attention:* one cut at 23.4 s is a single pattern interrupt where the second half begins (the plan), after 23 s of
   unbroken camera (M12: every cut costs the eye something, so cuts are rationed and related).
4. *Sound:* the cut and the bed's step on "But" make one event (SOUND_SYNC S13); the thread is on both sides (the plumes,
   then the computer's steam: heat let go).
5. *Cost:* no reverse nested chain to build.
**The owner's alternative (no cut): the snow cloud wipe (J8, D),** f1384-1432, as in S6 (c): slower and softer, literal
(Helsinki is under snow), every join then carried. The first draft's "7x push-through into Helsinki's lit spot" is
withdrawn: J2 needs an opening of 15-30 % of the frame, the spot is ~24 px, and the card's A on this join had the same
flaw.

**Considered and not recommended:** a down-the-street S11 (his B1, B2 and E7 in one frame, the water racing up a receding
melt line to the door), reached by a carry (J7) from S10: it costs two angle changes (into S11, and back to S12's matched
frame) for a picture the side-on run already says; it is the owner's question 3, since it is the one frame where his
leading lines and vanishing point would lead. A match cut (J3) on the steam in place of S4's pull back: the pull back IS
"To put it into perspective".

## Sync candidates (for the sound-sync study; `SOUND_SYNC.md` decides)

Each is a moment where a move, a join or a change of the subject lands on a stressed word or carries a sound. The picture
leads its word by ~6 f; a hard sync sits on its event's first visible frame or up to 2 f after, never before.
**Proposed spend** (marked H; the review's S12c): the hook's four, the cut, the release and the bubble: **7 hard syncs in
42 s**, the middle at 20.5 s (#5 -> #15) and 15.0 s (#15 -> #23) apart (SOUND_SYNC: at most one per 10 s after the hook).
S = soft (a swell, a carrier, a bed's step), T = texture (no hit).

| # | s · frame | word | the picture | kind | note |
|---|---|---|---|---|---|
| 1 | 0.00-0.67 · f0-40 | (Did you know) | the brush lays the run | T | the brush on paper (S1, the quiet floor) |
| 2 | 0.67 · f40 | before "Helsinki" (f38) | the brush lands at the radiator, in the golden box | **H** | the trigger click in the first second; the visual script's ding on "know" (f28) is dropped (12 f from this one) |
| 3 | 1.40 · f84 | "AI" (f90) | the computer paints on, its lights switch on | **H** | the hum (44 f after #2) |
| 4 | 2.03 · f122 | "heat" (f128) | the one window lights | **H** | (38 f after #3) |
| 5 | 2.92 · f175 | "thousand" (f174) | the wave reaches the far city | **H** | one soft chime (53 f after #4), never a roll of plinks (X8) |
| 6 | 3.92-5.42 · f235-325 | "AI" (f257) | the un-paint and the push | T | the reverse sweep; no whoosh on the join (X3) |
| 7 | 6.82 · f409 | "buildings" (f415) | the plan's posts rise | S | a soft sweep, or nothing |
| 8 | 10.10 · f606 | "hot" (f612) | the steam pours off | S | a rising hiss onset |
| 9 | 14.97 · f898 | "FORTY" (f904) | the kettles pop by rows | S | was H: the lids' rattle swells; the count is shown, not hit |
| 10 | 16.12 · f967 | "boiling" (f973) | all boil | T | a rolling boil as a bed |
| 11 | 18.52 · f1111 | "tea" (f1117) | the mug pops at the pivot | S | the joke's button: a small dry clink, or nothing |
| 12 | 18.84-21.87 · f1130-1312 | "Normally" ... "blow" | the one big move | S | one rising swell under the move (O7), cresting at f1309, 3 f before "blow" |
| 13 | 20.83 · f1250 | before "big" (f1256) | the near box's fans start | S | the whirr's onset |
| 14 | 21.77 · f1306 | "blow" (f1312) | the plumes rise | T | wind |
| 15 | 23.37 · f1402 | 6 f before "But" | **the cut** (or the cloud's peak cover, f1408) | **H** | the turn: the bed steps up on the cut (S13); the wind drops to the street's hush before it (from f1373) |
| 16 | 24.03-24.93 · f1442-1496 | "WANTS" | the reach is drawn | T | the brush on snow; no hit on the landing word (the voice is the count, O2) |
| 17 | 27.30 · f1638 | "next" (f1644) | the tag swings on | S | a paper flick |
| 18 | 28.60 · f1716 | before "how" (f1722) | the panel swings open | S | a soft clunk |
| 19 | 32.27 · f1936 | "computers" | the steam stops | T | was H: the hiss ends on the frame the steam ends (a sound taken away, no hit) |
| 20 | 32.92-33.98 · f1975-2039 | "water", "pipes" | hot water out, the melt starts | T | the flow brightens |
| 21 | 34.87 · f2092 | "pipes" (f2098) | the front passes the manhole | S | a soft lift with the puff of steam |
| 22 | 37.38 · f2243 | "homes." (f2249) | the radiator fills, the frost clears | S | the radiator's tick (the thread's sound, O3) |
| 23 | 38.40 · f2304 | 5 f before "So" (f2309) | the pull's midpoint | **H** | THE release: the bed lifts; its pause is 0.72 s (43 f), under the 48 f the release asks: SOUND_SYNC's to settle (clash row 32) |
| 24 | 38.87 · f2332 | "chatbot" (f2332) | the chat bubble pops on the landing frame | **H** | the last phone sound, answering #2; 28 f after #23 (hard syncs >= 30 f apart): if #23 stays a hard hit, #24's pop sits 2 f after its frame (f2334) or #23 becomes the bed's soft step |
| 25 | 39.40 · f2364 | "could" | the lights blink back, the pulse leaves | S | a soft blip |
| 26 | 40.30 · f2418 | "apartment" (f2424) | the window's warm step | S | a warm low note under the voice (no second release, X7) |
| 27 | 41.32-42.24 · f2479-2534 | (the tail) | the un-paint to frame 0 | T | the reverse sweep runs into frame 0's brush; no hit on the seam |

## The library's gaps

The first draft's 15 are settled in the library (`composition/critique_library.md`, Fix pass: SR25 THE SECTION, Part 2
§0's side-on scale ceiling, rule 7's person near the camera, the nested pull, rule 12's straight dolly, RM8's un-draw in
its dose, RJ4 at rest, E11 and SR13's lower hand, rule 2's bending steam, I12's hand-off, rule 8's side-on legs, the
one-place counts, RJ2 out of a landed scale shot, a light change in a held frame as RM6 or I11, rule 21's locked-take
release). **Still open, found in this fix pass (for the library):**
1. **A prop above the eye line in a forward dolly rises, it does not fall.** Passing a plane (a wall, a sign) sends
   whatever stands above the eye line up through the band; the library's dolly-through never says so (S8's tag, the
   plan's top line): exit it by its own action (the tag leaves with the panel), or keep the camera off its plane.
2. **The nested pull's angle change and the band.** A high view's horizon (the planet's limb) above the pivot sweeps down
   through the band as the picture shrinks; land it above the band (S6: y 220) or bear it at a hand-off below the band, and
   make the big masses on both sides of the angle change one value each (the night sky and the dark sea; the snow and the
   snowy land).
3. **I12's hand-off when the two objects cannot match in size** (a 140 px mug and a whole city): the hand-off object is
   the outgoing picture's lit cluster round the pivot, not the mug (S6 on "use").
4. **A follow's progress from its subject.** RM3 says "the subject held at x 410-560, within +-40 px"; with a trapezoid
   camera and a steadily moving subject the subject drifts ~100 px (here 502-610 px); deriving the camera's progress from
   the subject's path holds it (here 540-556, the largest speed step 0.9 px/f).

## Clashes found (for the orchestrator; no other doc edited from here)

- **DIRECTION rule 3 and THROUGHLINE §1.5** ("in the foreground only the one 'you' ... strangers small"; "No strangers'
  backs in any foreground") against **STYLE_ADJUSTMENTS 4** (a person near the camera in S1, S11, S12; newer,
  owner-approved); the library's rule 7 settles it (one tier-B stranger in the mid ground, profile or three-quarter).
- **THROUGHLINE's A on S6 -> S7** (a push-through into Helsinki's lit windows) against J2's condition (an opening 15-30 %
  of the frame; the spot is ~24 px): F, or the J8 cloud.
- **STYLE_ADJUSTMENTS 5's notan** ("a dark near street and block, a mid harbour, a light sky") against this pass's (a
  mid-dark sky, one dark mass, the snow the lightest field): for the G4 look clip.
- **VISUAL_SCRIPT's sizes** (the block 5 storeys, the computer ~2) against its own home view by the horizon-cut rule (as
  drawn ~10 m and ~13 m): the owner's question 2, then every foot reset.
- **VISUAL_SCRIPT S6's "Earth's curve at dusk"** with the sky above it, and the library's SR17 video-4 line ("the band in
  the sky above it one flat field"), against the move's middle frames: the limb would sweep through the band; this pass
  lands it above the band, the band over the night sea in the sky's value.
- **The library's video-4 examples that follow the first draft:** SR18 (S7 "on the computer at x ~215-445, off the axis
  ... the open half") and SR25 ("the resident at the window"): the turn is now centred (M2) and the person on the
  pavement (M6).
- **TYPE_GUIDE R9** (v4 branch: the payoff's words "clear of the phone (bottom right)") against the phone bottom LEFT (E11,
  SR13): R9's check follows.
- **VISUAL_SCRIPT S10's tilt down** against rule 2 and Part 0b §2.4 (two follows in a row): the camera holds, the water
  travels (E9).
- **VISUAL_SCRIPT S6 -> S7's dive** (~49x in 1.15 s) against the nested pull's ~2.3x per 30 f: F or the J8 cloud.
- **VISUAL_SCRIPT S11 -> S12 coded A:** a 1.15x pull back is C (RJ4's seam).
- **VISUAL_SCRIPT S1's ding on "know"** and its warm water setting off there: the ding is dropped for the landing's click
  (#2) and the heat leaves on "AI" (one mover at a time).
- **VISUAL_SCRIPT S8's tag "below the computer's middle" on the plan's front wall, taken out by S9's push:** above the eye
  line a push lifts it toward the band; it now hangs on the computer's front panel and leaves with it on "how".
- **LAYOUT §1's default horizon (y 768)** against rule 6's setup A (y 1150-1300): the home view uses y 1170 (the library's
  clash row 5).
- **The take's 0.72 s pause before "So"** against SOUND_SYNC's >= 0.8 s release pause (the library's clash row 32).

## For G3 (what to check first when the sketch plays)

1. The engine's three new pieces before S1 is built (the review's S23): **the paint-on in motion** (`src/lib/paint/
   reveal.tsx` has been shown as stills only; the hook, S2's un-paint and the loop depend on it: a 2 s motion test first);
   **the run laid by a moving brush tip along a path** (reveal.tsx reveals painted plates through seeded masks; this needs
   a path stroke with a brush body, `src/lib/pen.ts`'s draw-on with a brush); **the nested-scale chain** (S6;
   `src/lib/pullback.tsx` is a continuous multi-plane dolly, planes k ~1.1-5, not nested pictures with hand-off frames and
   an angle change inside one: new work, G3's first build risk). The J8 cloud, if picked, is Film's `foreground-wipe`
   ('scene' element, 0.8 s); the follow's derived progress is `composition_pass_sheet.py`'s `follow_p`.
2. S1 at 1x on a phone: the landing at f40 reads as the first onset; the computer is found at f84 (led by the cursor);
   "heat" (f122-128) is the expected thing and the wave (f140-205) overtakes it, big enough to count (the flare to L* ~85
   on the near panes).
3. S6's hand-off on "use" (f1242): the angle change unseen, the band one value at every frame, the limb landing above it;
   the near box's fans readable on "big".
4. S7: the centred turn reads as a turn (the cut's jolt) and the reach as "wanting".
5. S10's water at ~6.9 px/f down the pipe reads as one point; the steam stops on "computers" with the sound off; the hall's
   rows read as a hall converging behind the machine.
6. S11's follow holds the front at x 540-556; the person slides in and holds; S12's phone at the bottom left with the run
   above it, at the feed's crop with its interface drawn (rule 22).
7. Every move's start, middle and end frames as stills (rule 12), and `camspeed.py` on the real sketch.

## For the owner: three questions (each a picture you can tell apart at a glance)

The visual script's own two questions (the un-draw after the hook; the computer's size) are already with the owner there
and are not repeated here.

1. **The turn on "But" (S6 -> S7):** a plain cut from the planet straight to the street (recommended: one jolt where the
   second half starts), or a soft snow cloud sweeping across the screen and clearing onto the street (no cut, slower)?
2. **The person at the end (S11-S12):** standing on the snowy pavement in front of the block, looking up at the window as
   the heat arrives (as you approved; drawn by default), or a small silhouette inside the lit window, at home?
3. **The travel shot (S11):** keep the street side-on, sliding past the hot water as it runs to the door (default: the
   camera never turns), or turn to look down the street, the water racing up a line that recedes to the door (your
   leading lines and vanishing point in one frame; it costs two turns of the camera, into S11 and back for the payoff)?
