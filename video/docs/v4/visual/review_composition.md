# Video 4 (Helsinki): the composition-and-motion pass, critic's review (cold read)

**Status: DONE (2026-10-30). 6 MUST-FIX; 30 SHOULD-FIX (S1-S26, plus S3b, S12b, S12c, S16b); what works.**
**Read:** `COMPOSITION_PASS.md` and `composition_pass_sheet.png` (the first draft, commit 2cf1ffa6), played in my head
at 1x on a phone against the take (`public/v4/voice_words.json`, 42.24 s); checked against `VISUAL_SCRIPT.md` v2,
`STYLE_ADJUSTMENTS.md` (owner-approved), `../OWNER_NOTES.md`, `../THROUGHLINE.md`, the playbook on video 4's branch,
DIRECTION, CRAFT §a, G3_ANIMATIC §4, PIPELINE_V2 "Frame rate", TYPE_GUIDE (PICKED), SOUND_SYNC, and the library as it
stands now (`/home/user/Test-/video/docs/look/COMPOSITION_SHOTS.md` Part 0, 0b, fixed after this pass was written).
Px at 1080 x 1920, y down; f = round(t x 60). Positions in other frames are the pass's own home-view numbers mapped by
the pass's own framings: x' = s(x - 66) + X, y' = s(y - 838) + Y, with s the computer's drawn width / 216 and (X, Y) its
drawn top-left in that frame (the table in M1).

## Verdict (five lines)
1. **Strong bones:** a carrier on every join on the take's real pauses, the thread on screen across all of them, the
   S10 hold instead of the tilt, the door on a still camera, the phone moved bottom left, the cut on "But" argued honestly
   against the dive's speed. His ideas are present and labelled.
2. **But the frames were planned as if each subject stood alone:** the home view's block is in six of the
   twelve frames (S2, S4, S7-S10) and the pass never draws it; S4's block crosses the caption band, and S7 as written
   cannot exist in this place (M1, M2).
3. **The hook loses its second beat:** the 70,000 wave is drawn tone-on-tone (+6-8 L*), and frame 0 to 1 s has no
   schedule for the subject's paint-on (M3, M4).
4. **The owner would be offered an option that does not work** (a 7x push-through into a 24 px spot) and a person near
   the camera he approved for S11-S12 is replaced by a 60 px bust (M5, M6).
5. **Fix the six MUST-FIX, then the SHOULD-FIX list;** none of them changes the story, the words or the shot list.

## The 1x watch, in brief (a viewer on a phone, the pass as written)

| shot | what the viewer gets, and where the eye goes | where it breaks |
|---|---|---|
| S1 0-4.28 | night sky, "Did you know"; a warm line races across the snow and up; the far city on "Helsinki"; the computer at the left edge on "AI" (a ~425 px jump); the window lights on "heat", in the golden box; "70,000" in honey | the block's paint-on, the bold event, has no frames (M4); the city's windows barely change (M3); the resident crawls (S1) |
| S2 4.28-8.76 | the brush runs back, the camera pushes in and left; the lights blink on "giant"; the walls rise on "buildings" | a 5-storey block stands at the right edge, never drawn (M1); 18-24 px/f on the right side (S13) |
| S3 8.76-10.96 | the top, close; flakes melt; steam pours on "hot" | clean; the push runs the lower rows at up to 25 px/f |
| S4 10.96-17.76 | the pull is "To put it into perspective"; the computer alone; forty kettles pop by rows on "FORTY"; they boil | the block's roof crosses the caption band (M1); 2.7 s of near-nothing before "FORTY" (S10) |
| S5 17.76-19.26 | a fast push up the steam; the mug pops on "tea" | the kettles streak at ~55 px/f (S13); the joke gets ~0.3 s still before the creep |
| S6 19.26-23.46 | the creep, the peak on "data", the coast, the curve; plumes on "blow"; a long hold | "big fans" over boxes already specks (S5) |
| S7 23.46-25.54 | the cut; the bed steps up; the reach on "WANTS" | the frame as written is not in this place: the block and its window fill the "open half" (M2) |
| S8 25.54-28.34 | the plan's walls re-traced on "plan"; 2027 swings on | the right wall and the ferry are behind the block, the ferry above the eye line (M1); 2027 reads ~0.8 s (S11) |
| S9 28.34-29.56 | the dolly lands; the door opens on "how" | landing and door on the same frame (S9) |
| S10 29.56-34.46 | the hall grows on "big"; water runs down; the steam stops on "computers"; hot water out on "water" | the VP text is off the eye line (S6); the hall may be too faint to read (S16b) |
| S11 34.46-38.48 | the follow along the street; the door on "into"; the climb; the window warms | the front slides left, then right (S7); no person near the camera (M6) |
| S12 38.48-42.24 | the pull out; the bubble; the lights answer; the pulse runs home; the window warmer; the un-paint | the hand's entry unplanned (S8); 0.92 s of hold after the payoff (S12) |

## MUST-FIX (each with the exact fix)

### M1. The home view's block is missing from six frames; in S4 it crosses the caption band
The pass gives every medium of the computer as if the computer stood alone, and the sheet draws them so. But the block
(home view x 378-812, roof y 690, foot y 1262) stands only 96 px right of the computer (x 66-282), so every framing
that centres the computer at 1.07-1.56x keeps the block in the frame. Mapped by the pass's own transforms:

| frame (pass) | the computer | the block lands at | what breaks |
|---|---|---|---|
| S2 1.56x | x 372-708, y 920-1508 | x 857-1080, roof y 690, foot 1580 | not drawn or named; the plan's right post (x ~970) is behind it |
| S4 1.56x | x 372-708, y 750-1338 | x 857-1080, **roof y 520** | **the block's top is in the band** (y 290-600) beside the caption seats (ink to x 944): rule 2, TYPE_GUIDE §c; "nothing crosses the band" is false; the right wall (x > 945) is behind it |
| S7 1.07x | x 215-445, y 800-1202 | x 547-1009, roof y 642; its door (741, 1262), its one window (781, 957), the small box (592, 1262) | the "open half" (x 560-1080) is the block; see M2 |
| S8 1.30x | x 400-680, y 959-1449 | x 804-1080, roof y 767, foot 1509 | the plan's right wall (x 930) and the ferry with Pip (x 720-900) are behind it; "the street's first roofs at the right edge" is a 5-storey facade |
| S9-S10 1.5x | x 378-702, y 840-1407 | x 846-1080, roof y 618 | not drawn; the hall's right edge (x > 846) is behind it |

The plan's footprint also changes from shot to shot and runs into the block's ground in all three (in home-view x:
-102 to 450 from S2's posts, -23 to 390 from S7, -127 to 475 from S8; the block starts at x 378).

**Fix:**
1. Draw the block in every frame where the transform puts it (the table), as one quiet dark mass cut by the right
   edge, its windows lit a step under (homes). On the feed (x <= 982) its visible part is 125-207 px, inside rule 10's
   216 px for one framing mass, and it is the scale reference "giant" needs in S2 (its floors of lit windows beside
   the machine): say so in S2's frame.
2. **S4:** keep 1.56x but set the computer's top at y >= 850 (the block's roof then lands at y >= 620): the computer
   y 850-1438; the S3 -> S4 pull stays 2.0x, about (540, 785) instead of (540, 590); the kettles in 4-5 shallow rows on
   the floor at y ~1440-1510 (front row's base <= 1515, above the name block), the apex (the lit grille, the hardest
   step) at ~(540, 1060), drop 504 px; the steam then has 230 px under y 620 (it no longer has to bend sideways).
   The S4 -> S5 push then runs about (540, 670), not (540, 470), to land S5's frame unchanged.
3. **One plan footprint in home-view px, x -20 to 360** (it ends 18 px before the block), every shot's walls derived
   from it: S2's posts at x ~238 and ~829; S8's walls at x ~289-781 (a ~490 px inner frame, ~18 % of the frame: C1's
   15-30 %, fully left of the block); S7 as in M2.
4. **S8:** the ferry cannot sit at x 720-900, y ~1150: that is behind the block, and 240 px above S8's eye line (the
   home view's horizon y 1170 maps to y 1389 in S8, 1330 once S8 is lifted per M2), so the boat floats in the sky. Put
   it on the harbour left of the plan: x ~110-280, y ~1335-1380 (lifted S8), Pip at its rail ~(230, 1340), ~400 px
   from the tag.
5. Redraw the sheet's S2, S4, S7, S8, S9 and S10 thumbnails with the block and the corrected walls; G3 draws from the
   sheet.

### M2. S7 as written is not in this place: re-stage it
At 1.07x with the computer at x 215-445 (as written), the block fills the frame's right half (M1's table), its one
window sits at (781, 957), and the small box where the reach starts is at (592, 1262), not (760, 1320): the "open half"
for N15 does not exist (N15 asks "no counterweight"), the reach is ~190 px, not 310, and the eye after the cut has two
calls ~450 px apart (the computer's warm top and the block's one window).
**Fix (recommended):** land the cut on the computer ON the axis at ~1.15x: x' = 1.15(x - 174) + 540,
y' = 1.15(y - 838) + 900. Then the computer is x 416-664, y 900-1335, its warm steaming top the focal at ~(540, 920),
only ~35 px from the pivot the eye holds at the cut (540, 955) (rule 19, N1); the horizon lands at y 1282 (setup A);
the block enters at x 775 (roof y 730) and its one window (x 988-1067) falls off the feed (x > 982); the small box
sits at (823, 1399) and the reach runs from it to the computer's foot (627, 1351), ~200 px in 54 f (f1442-1496,
3.7 px/f), on "WANTS" to "heat.". Lead: **E9** (his, CORE 5·5·5: the camera holds, the reach's tip travels its line
and arrives at the heat's foot), with B1; N15 drops out of the film (it cannot hold its condition here). Lift S8 by
59 px (the computer's top at y 900, foot 1390, the walls' tops ~654, the tag at ~(540, 1091), drop 535): S7 -> S8 is
then ONE push of 1.13x about (540, 900) (one variable, no "in and left"), and S8 -> S9 a 1.16x dolly about
(540, 1282). The turn keeps its jolt from the cut itself (planet to street, high to eye level).
If the owner wants the lean: keep the pass's 1.07x off-axis framing but draw the block, the window (back at the
city's step, S4 below) and the box where they are, and re-code the lead E9 with B1 (the city on the right reaching
for the heat on the left), not N15.

### M3. The hook's "seventy thousand homes" is invisible: the wave is tone-on-tone
S1 lights the city's windows "each a step under the one window (+6-8 L* in their facades)", across a far-city belt
60 px tall (y 1090-1150). That is the hook's "reality overtaking" (DIRECTION 9: the expected thing, then reality
overtaking it at ~2 s), and a +6-8 L* change in a 60 px strip is a subtle effect, which the owner counts as none
(playbook, Hook and pacing: "a subtle effect counts as none"). It also contradicts STYLE_ADJUSTMENTS 3 (owner-approved:
"windows lighting one by one carry the warm accent across the city") and leaves TYPE_GUIDE R3's honey "70,000" (which
"lights up with the warm windows") as the only warm thing on screen at the hook's peak: the caption, not the picture,
would carry the claim.
**Fix:** a travelling front of light that flares, then settles, so the hook's peak is big while the city at rest stays
quiet and the one window stays the call:
- from "seventy" (f140) to "homes?" (f205): the front leaves the one window and runs outward: the block's own panes
  (f140-165), the next block and the street's houses (f155-185), the far city as a sweep of points left and right
  (f175-205), each window flaring to L* ~85, C* ~40 (warm) over 6-8 f and settling within
  ~18 f to L* ~55-60, C* <= 25 (a step of <= 40 L* over the dark facades: rule 4), lit homes at rest;
- the one window holds L* >= 95 with its bloom (no other light within 10 L* of it at rest: rule 4), and its frost
  cleared: it stays the hardest step and the only honey accent once the wave has passed;
- one soft chime on the front's start (sync #5), never a roll of plinks (as the pass says).
At phone size the near blocks' panes (68 x 88 px each at 1x) carry the read; the far belt is the sparkle that says
"and the whole city".

### M4. Frame 0 to 1 s: no schedule for the subject, an order that contradicts itself, and "popping"
The first second decides the scroll. Before the computer (f84) the pass times only the run (f0-36), the water's start
(f28) and the far city (f38); the subject (the block, the one mass >= 400 px wide: rule 13) has no frames at all, nor
the street, the window's pane, the next block or the resident; and "each piece popping on its own beat" contradicts
DIRECTION 9 (painted pieces paint on "stroke by stroke ... never popping up") and the pass's own "the brush tip ...
(the only onset)". The painter's order quoted (sky, harbour and far city, street, block and window) puts the far city
second, at f38, so everything after it lands at times never given. The run's stroke width is never given (v3's 30 px
sticks were "barely visible": the playbook). And "~675 px in 36 f (~19 px/f, under rule 13's 25), ease in-out" is the
mean: an in-out ease peaks at 1.6x (sine) to 3x (cubic) the mean, 30-56 px/f, over rule 13's 25 px/f for the one pen
tip.
**Fix: write frame 0 and f0-120 as a schedule, in STYLE_ADJUSTMENTS 1's painter's order (the run as T's line first):**
- **f0:** the night sky with the band already laid and calm (it never un-paints: it is the loop's last state, so
  "Did you know" reads warm white from frame 0); the lower field the snow's paper; the brush tip at ~(140, 1230) with
  the run's first ~100 px already laid (never a bare page, never a still frame). The run is a BOLD stroke: >= 24 px wide,
  at full value contrast against the snow (the melt line >= 40 L* under the snow, its warm core inside it).
- **f0-40:** the brush lays the remaining ~575 px to the radiator (598, 1060), in-out sine, mean 14.4 px/f, peak
  <= 25 px/f; it lands in the golden box at f40 (0.67 s, inside rule 13's 0.4-0.7 s), with sync #2.
- **f4-38:** the harbour and the far city as one low wash (y 1090-1214), left to right, landing on "Helsinki" (f38).
- **f10-40:** the street's snow as one broad wash under the run (tier C, quiet).
- **f24-54:** **the block, one dark wash rising from its foot (1262) to its roof (690), ~19 px/f** (reveal.tsx's
  'haze' columns, "a tower: columns, from the ground up"), the window's pane left bare: its front passes the radiator
  and the window's row at ~f35-39 as the brush lands there (f40), so the bold onset peaks in the golden box column at
  0.6-0.7 s.
- **f54-84:** the next block, the cloud, the resident (S-items), each painted stroke by stroke, tier C/B, none started
  within 0.5 s of an A onset closer than 370 px to the focal.
- then f84 the computer, f122 the window, f140 the wave (M3), as written.

### M5. The "no-cut" alternative offered to the owner does not work
The verdict offers, if the owner wants no cut, "one 7x push-through into Helsinki's lit spot (J2, f1373-1442)". J2's
condition (library Part 0b §3, and G3_ANIMATIC §4, a gate spec: "panel A contains a 15-30 %-of-frame sub-frame that
IS panel B") is an opening 15-30 % of the frame. Helsinki's spot is ~24 px (~0.03 % of the frame): after 7x it is
168 px, the curve still round it, nowhere near "the spot's flat warm light". To fill the frame from 24 px takes ~60x,
which is the written dive's speed problem again (the library's own nested budget: each 2.3x step >= 30 f, so ~60x
needs >= ~2.4 s; the pause and "But Helsinki" give 1.15 s). The through-line card's A on this join has the same flaw.
**Fix:** keep the cut (RJ2) as the recommendation and replace the alternative with one that holds the library's
numbers: **a dive into Helsinki's snow cloud (J8, carrier D):** the S6 frame already has "drifting cloud far below";
from ~f1340 one of them drifts (tier C, constant speed) over the pivot, the hold stays locked; f1384-1408 a 3-4x push
into it (in-cubic) until it covers >= 70 % of the stage on the cut frame; the cut hidden in the cloud (J8: on screen
<= 0.5 s, 48 f in all); f1408-1432 S7 emerges as the cloud thins into the falling snow (out-cubic), its midpoint on
"But" (f1408). It is literal (Helsinki is under snow) and keeps every join carried. Say in the verdict that the card's
A was never buildable from a 24 px spot, so the owner picks between the cut and the cloud.

### M6. The person near the camera in S11-S12: the owner-approved picture is replaced, not offered
STYLE_ADJUSTMENTS 4 (owner-approved, 2026-10-30) asks for "S1, S11, S12: a person near the camera ... someone walking
home through the snow in the foreground of the home view (from behind or in profile, about 130-220 px tall) ... The
S12 gloved hand and phone stay", and our own log plans the new people for it (OWNER_NOTES, 2026-10-30 ~14:30 and
~20:15: "video 4's person near the camera (S1, S11, S12)"). The pass keeps the person in S1 only and turns S11-S12's
into "a bust ~60 px" in the lit window, on a reasoning that does not follow (CRAFT §a.3's one "you" limits the
viewer's stand-in, not a stranger: the resident is "never 'you'" by the pass's own words, so nothing stops the
resident being near the camera in S11 too). The 5-line summary lists it under "Open", but every S11-S12 number is
built on the departure, so a "no" from the owner reopens two shots.
**Fix:** design S11-S12 to the owner's version by default and offer the bust as the alternative. One person, one
place, by the horizon-cut rule (a 1.7 m figure at a 1.6 m eye is 1.06 x its feet's depth under the horizon, so "near
the camera" means feet low on the near pavement; at the block's door the same person is only ~110-125 px):
- **S1:** the resident walks in and stops on the near pavement (SHOULD-FIX S1): feet ~(780, 1340), ~180 px,
  profile turning to three-quarter, the head turning up 0.3 s before "heat" (E10's look: the sightline through the
  window's box), so their own window lights as they look at it.
- **S11:** the same person on the same spot, ~207 px at 1.15x (feet ~(809, 1408), head ~y 1200; the street slides them
  in from the right during the follow and they hold when it lands on "into", f2208), looking up as the front climbs and
  the window warms: the heat arrives where they stand.
- **S12:** the same, at ~180 px, as the window steps warmer on "apartment", with your hand and phone bottom left: the
  payoff lands on a person near the camera, as approved; the window lit and empty (one such person a film).
- **The owner's alternative (the pass's):** the walker in S1 only, the 60 px bust in the window in S11-S12. Put both to
  him in one line.
Add DIRECTION rule 3 ("in the foreground only the one 'you' ... strangers small in the mid and far ground") and the
card's §1.5 ("No strangers' backs in any foreground") to the clashes list: STYLE_ADJUSTMENTS 4 is newer and
owner-approved, and library rule 7 now settles it (one tier-B stranger in the mid ground, in profile or three-quarter).

## SHOULD-FIX (each with its fix; grouped by what the task asked to check)

### The first 3 s
- **S1. The resident is a slow-motion glide, at the focal, in a pose the street cannot give.** "From behind ... walking
  left to the door at <= 20 px/s": a side-on street shows a walker in profile, never from behind (library rule 7:
  profile or three-quarter, never a back square to the lens); 20 px/s for a 180 px figure is ~0.11 x its height a
  second, a seventh of the library's walk (~0.8 x height/s, rule 20), so the stepped legs skate or crawl; its centre
  (780, 1250) is ~320 px from the window (rule 14 asks tier-B movers >= 370 px); "painted already walking ... no onset
  of its own" is not so: its paint-on IS an onset; and its head sits on the horizon (y ~1150-1190) in front of the
  block's dark lower facade, so a dark figure vanishes into it. **Fix:** painted on f54-74 (stroke by stroke, M4),
  entering from behind the next block's corner at x ~850 (never under the rail, x 877-954 below y 1032), walking left
  in profile at ~0.5 x height/s (~1.6 px/f, poses held ~5 f) to x ~780 by ~f104 (the short walk stays ~320-370 px from
  the window and ends 18 f before its onset; standing, the figure is no mover), then standing: the head turns up toward the window f98-104 (E10: the look
  leads the light by 0.3 s), so the stop and the look make one beat with the window lighting at f122; a mid-value coat
  with a warm rim from the window (the story light's rim: DIRECTION 5) for a >= 25 L* step against the facade. S11 and
  S12 find them on the same spot (M6). A person walking a path that ends at the story's place is rule 7's own staging.
- **S2. The hook's second change (the computer, f84) starts ~425 px from where the eye is** (the brush's landing in the
  golden box), at x 66-282 with its left 32 px under the feed's crop: rule 14 wants a beat's onset in the golden box.
  **Fix:** lead the eye there: the brush lifts at the radiator and travels in view to the run's source (f62-84, ~15
  px/f, not painting), so the computer is found, not searched for; its paint-on is big (one column wash, its rows of
  lights switching on with #3's hum). Name it "a declared jump, led by the cursor".
- **S3. "Reality overtakes at ~2 s" is mislabelled:** the window lighting on "heat" (f122) is the expected thing (one
  home); the overtaking is the wave from "seventy" (f140). Say so: it is why M3 matters.
- **S3b. The water sets off on "know" (f28), a filler, while the brush is still running:** two movers at once 400 px
  apart (the water's start at x ~140, the brush tip near x 550), 8 f before the brush's landing. **Fix:** the water
  sets off when the brush lands (f40): the landing hands the eye to the thread, one mover at a time; it then runs the
  ~675 px to the radiator by f122 at ~8 px/f (the melt just behind its front).

### One subject at a time; where the eye goes
- **S4. The one window's state after the un-paint is never said.** S1 lights it to L* >= 95 and clears its frost; S2's
  un-paint lifts only "the warm water and its melt"; S11 then "warms a step and its frost clears". **Fix:** the brush
  passing the riser on its way back (~f260) also takes back the window's warm step and lets its frost return (the
  window back to the city's lit level, L* ~55-60), so S7-S10, where the block is now in frame (M1), carry no second
  honey light, and S11 has something to clear.
- **S5. S6's "big fans" lands when the boxes are already specks.** On S5_EASE over f1130-1271 the move is 98 % done
  by "big" (f1256): the near box (~(540, 1120)) is at its landed, planet-scale size, too small for a fan to read; its
  spin is a subtle effect. **Fix:** the visual script's own fallback: land the curve on "blow" (f1312) instead of
  "fans" (f1271): S5_EASE over f1130-1312 (3.03 s of move, inside the library's 2.0-5.0 s), its peak near "just"
  (f1225), 83 % done on "big" (the frame ~2x closer than the landed curve), so the near box is still >= 60 px with fans
  >= 20 px as they start to spin (its onset in the golden box column); the plumes rise on "blow" as the landing's own
  event, then the hold f1312-1373 (61 f, >= 30 f). Also check the move's early stills: the
  block enters top right while its roof is still in the band (scale 2.65 -> 2.27: roof y 563 -> 619 at x > 1040, ~15
  f): lower the pivot 20 px or accept it outside the type frame, declared.
- **S6. S10's vanishing point is above the eye line.** The text puts it at (540, 1150); in S10's frame (1.5x) the home
  view's horizon y 1170 maps to y 1338, and floor lines can only meet on the eye line. The sheet draws them meeting at
  the computer's foot (~y 1390), so only the text is off. **Fix:** VP (540, ~1338) (or ~1270 if the computer becomes 2
  storeys: S26), still hidden behind the computer's lower half; the rows' tops fall toward it from y 660-760.
- **S7. S10 -> S11's follow holds the front at x ~410, so the water slides LEFT on screen.** It leaves the foot at
  x 540 (f1981) and lands at the door at x 556 (f2208): holding it at 410 in between means the front drifts 130 px
  left, then 146 px right, against the thread's one screen direction (the water "never moves upstream"). **Fix:** hold
  it at x ~540-560 (RM3's 410-560 allows it; never left of ~510), the camera starting 4 f after it and matching its
  speed; lead room comes from the street opening ahead as the camera pulls back.
- **S8. S12's hand has no entry.** The phone sits at y 1310-1480 and S11 has no hand, so the hand must rise: when is not
  said, and rising during the pull (f2286-2332) puts a big near mover inside the join's 0.4 s (f2297-2321), which
  CRAFT §a forbids. **Fix:** the hand rises f2296-2328 (32 f, out-cubic, from below the bottom edge, its wrist under the
  name block), declared as the join's second leg ("you look down at your phone"), and the bubble pops on "chatbot"'s
  first frame (f2332; rule 15 allows 0 f, never after); or it rises after the landing and the bubble moves to f2338.

### The thread across the joins; the moves against the words
- **S9. The library's "land >= 30 f before the stop's onset" (Part 0b §2 item 7) fails at most stops,** often at 0 f:
  S2 (lands f341, the lights blink f341), S7 (f1442 / the reach f1442), S8 (f1571 / the re-trace f1571), S9 (f1716 /
  the door f1716; the pass's "the camera stops before the subject moves" is the same frame), S11 (14 f), S3 (20 f),
  S5 (19 f), and S12's bubble pops 6 f BEFORE the pull lands. The take's pauses (19-43 f) cannot always give 30 f.
  **Fix:** list them in the camera plan as declared exceptions (the onset on a camera already under 5 % of its peak
  speed, i.e. inside the out-ease's last ~8 f), and fix the one that breaks a rule outright: S12's bubble pops after
  the landing (S8's fix), never before it.
- **S10. S4's events are not 1.2-1.3 s apart:** "one" (f752) has no event ("it stands alone" is the state since the
  landing at f744), and "makes" (f823) is a subtle "thickens", so from the landing (12.40 s) to "FORTY" (15.06 s) only a
  faint change happens: the cold reader's "softest stretch". **Fix:** "one" (f746): its rows of small lights blink once
  (cool, the gesture planted for S12's "blink back"); "makes" (f817): the steam column doubles in width and quickens, a
  change readable at phone size.
- **S11. The tag's "2027" reads for under 1 s.** It lands on "year" (f1662), starts leaving with the dolly (f1678) and is
  gone by f1710: ~0.3 s still, ~0.8 s on screen, under the library's "the paper held >= 1 s after its number lands"
  and the visual script's f1644-1741. **Fix:** keep the swing on "next" (f1638-1662) and let the tag leave later: the dolly
  f1678-1716 slides it only under the name block (y > 1530) by f1716, off the frame by "would" (f1741, the visual
  script's own time), so it reads ~1 s and never shares the read window with the door; or declare 0.8 s.
- **S12. The payoff's hold is 0.92 s, not 2.46 s.** The 2.46 s counts from the pull's landing; the payoff lands on
  "apartment" (f2424) and the tail starts at f2479 (55 f). **Fix:** the window's step 6 f ahead of its word (f2418,
  rule 15), then 61 f of hold before the tail (>= 1 s).
- **S12b. S12's answer lands on "could" (f2364), an unstressed modal.** It is the chain's middle link (32 f after the
  bubble), so it may stay; if the 1x watch finds the chain hurried or the blink lost, move the blink-back and the
  pulse's start to "soon" (f2375, 6 f ahead of f2381) and run the pulse f2375-2418 (~560 px, ~13 px/f) to the
  radiator. (S11's landing on "into" is fine: there it means "entering".)
- **S12c. Sound: the middle's hard syncs break SOUND_SYNC's spacing.** "Between the hook and the payoff: at most 1 hard
  sync point per 10 s (600 f)" (SOUND_SYNC S8); the proposal puts them 8.4 s (FORTY f899 -> the cut f1402) and 8.9 s
  (the cut -> the steam stopping f1936) apart. **Fix:** FORTY becomes soft (the lids' rattle swells, the count is shown,
  not hit) and the steam stopping becomes texture (the hiss ends with the steam: a sound taken away, no hit): the hard
  syncs are then the hook's four, the cut, the release and the bubble (the #23/#24 22 f clash stays SOUND_SYNC's to
  settle, as the pass says).

### Speed (the one budget: ~15 px/f, PIPELINE_V2 "Frame rate"; a WARN settled at 1x)
- **S13. No camera move is speed-checked, and several are over:** S1's brush 675 px in 36 f "ease in-out" peaks at
  29.5 (sine) to 56 (cubic) px/f, over rule 13's 25 for the pen tip (M4 fixes it); S1 -> S2 ~18-24 px/f on the
  window and the right side; S2 -> S3 (2x in 71 f) 15-25 px/f on the computer's lower rows (r > 355 px); S3 -> S4 ~21
  px/f on the computer's foot; **S4 -> S5 (2x in 52 f, in-out cubic): the kettles' rows ~55 px/f and the lit grille ~28
  px/f at its peak**, 2-3.5x over, a strobe of forty detailed objects; S8 -> S9's tag leaves at ~80 px/f. **Fix (the
  worst):** S4 -> S5 runs f1020-1100 (80 f) on rule 20's long-move cruise (trapezoid(0.25, 0.35), peak 1.43x the mean),
  its midpoint f1060 (6 f ahead of "That's"), landing 11 f before the mug: the kettles ~14 px/f as they leave, the
  grille ~7 px/f. Then run `video/scripts/camspeed.py` on every move's start, middle and end frames (rule 12, rule 22)
  and list the peaks in the pass.

### Variety, rest and the doses (the library as it stands now)
- **S14. The lead count follows the old library.** Now (Part 0b §2 item 3) T "never counts" as a lead, and "a held
  frame that carries two beats keeps one lead": S1 needs a real lead (D7 with SR8, its one lit break; it may lead S1 and
  S4, not neighbours), S9-S10 keep one (E2, B2 inside it), and with M2's E9 the film has **9** different leads (D7, Z3,
  N9, D2, E9, C1, E2, E3, N14), 9 of 11 stops CORE-led, no RARE: inside 6-9. Reword the 5-line summary ("11 different
  leads (the library asks 6-9)" reads as a virtue; it was over).
- **S15. The doses as counted are wrong.** Light events (RM6/I11, 1-3 a film): the window on "heat", the wave, the
  window warming on "homes." (S11) and its step on "apartment" (S12) = 4, not 2. RM8 after frame 0 (0-2): S2's un-paint,
  S7's reach, S8's re-trace = 3. **Fix:** S11's sign of arrival is the frost clearing and the filled radiator, no light
  step (the one step stays on "apartment"): 3 light events; then decide S8 (re-trace: RM8 = 3, declared "the drawing is
  the beat: a plan"; or brighten: I11 = 4, declared) instead of leaving it to the owner.
- **S16. The second half lives in one size band** (S7-S12, 18.8 s, all 1.0-1.5x of the home view): fine for an
  explanation, but say it, and keep the pumping fix where it bites: the S4 -> S5 push (S13) rather than S3's.
- **S16b. His leading lines and vanishing point must be SEEN, not only coded** (the owner, verbatim: "I don't see
  leading lines or vanishing point"). B1 lives only in its side-on form (the run's level and vertical legs: rule 8's
  exception), which reads as a path, not as his converging lines; B2 lives only in S10's hall, drawn "pale marked
  lines (tier C, tone-on-tone)", its convergence mostly in the near band under the app's text. On a phone he may again
  see neither. **Fix:** S10's hall lines at a readable step (>= +15 L* over the ground, >= 3 px at 1.5x), the rows'
  tops converging inside the stage (y 620-1250) so the one-point reads at a glance (the plan must read as a plan
  anyway: the visual script's risk list); and put the refused down-the-street S11 (his B1, B2 and E7 in one frame) to
  him as one line with its cost (two angle changes), instead of settling it here.

### The person near the camera and the human viewpoint
- **S17.** (With M6.) The playbook's DEPTH AND SCALE FROM A HUMAN VIEWPOINT is met in S1, S11 (M6) and S12 (your hand);
  S2-S10 have no human scale, so "giant" leans on the block (M1): say so, and keep the block's floors legible beside the
  computer in S2.

### The caption band and the crop
- **S18.** Beyond M1's S4: S9-S10's block roof lands at y 618 (2 px above the 620 floor: lower the frame 5 px or
  accept); S8's small box lands at (859, 1522), under the name block (at (859, 1463) once S8 is lifted per M2: keep it
  there, so the empty stretch reads in S8); S2's horizon at y 1436 leaves ~80 px of floor above the name block under
  the computer (it stands on the UI's edge: check it at the feed's crop).

### STYLE_ADJUSTMENTS
- **S19. The notan departs from STYLE_ADJUSTMENTS 5 without saying so.** The owner-approved grouping is "a dark near
  street and block, a mid harbour, a light sky"; the pass has a mid-dark sky, one dark mass and the snow as the
  lightest field. Its reason (warm-white captions on a dark sky) is real, but it is a choice the owner approved the
  other way. **Fix:** name it in the pass as a departure with its reason and the alternative (a light sky takes TYPE_GUIDE's
  plum captions), for the G4 look clip to settle; or follow STYLE_ADJUSTMENTS 5.
- **S20. The computer reads as a building.** On the sheet (S1, S11, S12) it is a dark dotted box like the next block. The
  hook says "AI" over it: at phone size it must say "machine". **Fix:** STYLE_ADJUSTMENTS 6 in composition terms: a
  monolith silhouette with no roofline or window grid (its lights tight vertical rows, cool, a step under the window),
  its top steaming or glowing from its first frame, and a value or temperature step from the blocks; draw the sheet that
  way.
- **S21. The opened machine's light (S9-S10) has no colour or value.** "The aperture the lightest area below the sky"
  makes it S9-S10's story light. **Fix:** name it: the computer's own cool light (STYLE_ADJUSTMENTS 3's "second, cooler
  source"), so the one warm accent stays the heat (the steam's glow, then the hot water from "water").

### The cut-vs-continuous verdict's honesty
- **S22.** Besides M5: reason 1 ("his reels mark each new idea with a cut") leans on the list grammar the pass itself
  rules out (RJ1, NOT FOR US): drop it; and replace "a whip in disguise" with the number: the library's nested pull
  allows ~2.3x per 30 f, so ~49x needs ~140 f (2.3 s), and the dive has 69 f (1.15 s). The rest (the turn, one pattern
  interrupt, the bed's step, the cost) stands.

### Buildability in our engine
- **S23. Name the three new engine pieces the pass assumes, with their risk:** (1) the nested-scale chain (S6):
  `src/lib/pullback.tsx` is a continuous multi-plane dolly (planes k ~1.1-5), not nested pictures with hand-off frames
  and an angle change inside a hand-off; it is new work, G3's first build risk; (2) the paint-on reveal
  (`src/lib/paint/reveal.tsx`) has been shown "as stills only": the hook, S2's un-paint and the loop depend on its
  motion, so a 2 s motion test comes before G3's S1; (3) the run laid by a moving brush tip along a path is not what
  reveal.tsx does (it reveals painted plates through seeded masks): it needs a path stroke with a brush body (the pen's
  draw-on, `src/lib/pen.ts`, with a brush). M5's cloud is Film's `foreground-wipe` (carrier D).

### The library moved under the pass (fold these in)
- **S24.** Besides S9 and S14: I12's hand-off rule (the incoming object on the outgoing one's spot within +-40 px, at a
  size within 1.5x on the hand-off frame): give S6's mug -> Helsinki hand-off frame and both sizes; rule 7 now settles
  the resident (M6, S1); E11 now places the hand bottom left at y 1310-1480 (the pass's choice: its clash row with
  TYPE_GUIDE R9 stays); RJ4 "at rest" is now in the join table (gap 7 closed). The 15 gaps are settled in the library:
  shorten the pass's gap list to the ones still open.

### Clashes to add (for the orchestrator)
- **S25.** DIRECTION rule 3 and THROUGHLINE §1.5 ("no strangers' backs in any foreground") against STYLE_ADJUSTMENTS 4
  (a person near the camera, newer, owner-approved; library rule 7 settles it); THROUGHLINE's A on S6 -> S7 (a
  push-through needs a 15-30 % opening; Helsinki's spot is ~24 px: M5); STYLE_ADJUSTMENTS 5's notan against the pass's
  (S19); the home view's sizes against the visual script's (S26).
- **S26. The home view is not one camera by the pass's own horizon-cut rule** (DIRECTION 7: every frame keeps one
  camera). At a 1.6 m eye with the horizon at y 1170, a thing's height is 1.6 x (its screen height) / (its foot's
  depth below y 1170): the computer (378 px, foot 46 px under) is ~13 m, the block (572 px, foot 92 px under) ~10 m,
  so the "giant computer" is taller than the "5-storey" block, which reads 3 storeys; the visual script says the
  block 5 storeys and the computer ~2 storeys (the owner's open question 2). **Fix:** carry the visual script's two
  open owner questions (the un-draw after the hook; the computer's size) in the pass's "Open" line, and once question 2
  is answered set every foot by y_foot = 1170 + 1.6 x height_px / H_m (a 5-storey block, 15 m, with its roof at y 620
  stands on y ~1236; a 2-storey computer at the block's depth is ~268 px tall, or stands nearer the camera to keep its
  size); G3's sheet checks every height that way.

## What works (keep it)
- **The joins.** A named carrier on every join, each midpoint on the next sentence's first word, inside the take's
  real pauses (19-43 f), with its frame numbers; the thread is on screen across every one (the brush, the melt, the
  steam column, the mug's spot, the plumes to the steam, the lights' blink, the hot water's front, the window, the
  run). The S2 thread gap (2.53 s) stays under 3 s.
- **S10's hold instead of the written tilt** (the camera still, the water travels: E9): it keeps the band one field,
  leaves one follow in the film, and lets the steam stopping read with the sound off. The best single call in the pass.
- **S9's door on "how"** as a real door (STYLE_ADJUSTMENTS 2), not a diagram cut.
- **S12's phone moved bottom left, under the run:** out of the rail and the name block; the library has since adopted
  it (E11). The eye path in the voice's order (bubble, computer, pulse, window) is right.
- **S6's pivot** held within +-40 px, the angle change inside a hand-off, a long landing hold, the scale reveal declared
  (CRAFT §a.1) and leaving from and returning to the steam.
- **The cut on "But":** recommended for the right reason (the dive breaks the library's own nested-speed budget) and
  left to the owner; the bed's step on the cut (SOUND_SYNC S13).
- **His ideas first, labelled, and accounted for:** seven of his lead, ten more work inside the frames, and every unused
  one is listed with its reason: the honest accounting the owner asked for.
- **S4's forty as one 5 x 8 block under one apex,** popping by rows 6 f apart (a count is a shape; never forty subjects).
- **The words:** TYPE_GUIDE's seats and recipes per shot, ink <= 585, the 2027 tag's centre moved to keep the drop <= 650.
- **The sync table:** 27 candidates with frames, its own conflicts flagged (#2 vs the ding on "know", #23/#24's 22 f,
  the 43 f release): ready for the sound study.
- **S11's 1.15x landing** from a real constraint (the side-on set's scale ceiling), and the 15 library gaps, which the
  library has since settled.

## For the fix pass (order of work)
1. **The place first (M1, M2, S4, S6, S18, S26):** one script maps every home-view piece (the block, the window, the
   door, the small box, the plan's footprint, the horizon, the resident, Pip, the ferry) into every frame by its
   transform; re-stage S7 (M2), re-frame S4 (M1), lift S8, fix S10's VP; redraw the sheet from it.
2. **The hook (M3, M4, S1-S3b):** the f0-120 schedule, the wave, the resident, the eye's path to the computer.
3. **The verdict (M5, S22):** the cloud in place of the 7x push-through; the reasons by number.
4. **The person (M6, S17):** the owner's version designed, the pass's as his alternative.
5. **Motion (S5, S7-S12b, S13):** the speed table from camspeed.py, the S4 -> S5 push, the follow's pivot, the hand,
   the tag, the payoff hold.
6. **The counts and the notes (S14-S16b, S12c, S19-S21, S23-S25):** leads, doses, sound spacing, the notan, the
   computer's read, the engine risks, the clashes.

## Fix pass (2026-10-31)

Applied to `COMPOSITION_PASS.md` (rewritten), `composition_pass_sheet.py` (one map for every frame, plus `--numbers`,
`--speeds`, `--camspeed`) and `composition_pass_sheet.png`; then checked by the script: every home-view piece in every
frame, the band through every frame of every move (clear, >= 620, in all ten inside x 95-945), and every move's speeds
(analytic, and `video/scripts/camspeed.py --limit 15` on each move rendered at half size from the planning world: its
camera peaks within ~1 px/f of the analytic ones). The library's own fix pass is folded in (codes and tiers as they stand
now: RJ4 a seam only (<= 1.15x) and the moves between stops C, I4 a story pull, T never a lead, RM8b the build, RM8's
un-draw in its dose, E11's lower hand, rule 7's person, I12's hand-off, N9's "never a building").

**MUST-FIX: all 6 done.**
- **M1 done.** The home view is drawn through every frame's map: the block in S2, S4, S7-S10 (and S11, S12) as one quiet
  dark mass cut by the right edge, its panes at the city's level, 125-207 px on the feed; S2 names its floors the scale
  for "giant". S4: the computer at y 875-1463 (the review asked >= 850; 875 also keeps the block's corner >= 620 through the
  S3 -> S4 and S4 -> S5 moves), its roof at y 645, 5 shallow rows of kettles at y 1471-1515, the apex at (540, 1089) (drop
  533), the pull about (540, 719), the push about (540, 666). One plan footprint, x -50 to 360 (30 px wider on the left
  than the review's -20, so S8's inner frame keeps C1's 15 %: 16 %; still 18 px short of the block): S2's posts at x
  192/829, S8's at 250/781, S9's at 204/819. S8's ferry sits on the harbour left of the plan (x ~112-236, y ~1335-1380),
  Pip at its rail (~420 px from the tag). The sheet's S2, S4, S7, S8, S9, S10 are redrawn from the map.
- **M2 done.** S7 on the axis at 1.15x as written (the computer x 416-664, y 900-1335; its warm top ~(540, 925), ~85 px
  from the pivot; the block at x 775, its window off the feed; the box at (823, 1399)); the reach ~204 px in 54 f (to the
  run's start at (639, 1339)); lead E9 with B1, N15 out of the film; S8 lifted 59 px; S7 -> S8 one 1.13x push about
  (540, 900) (RJ4's seam), S8 -> S9 1.16x about (540, 1250) (S9 now 5 px lower: S18). The lean stays in one line as the
  owner's alternative.
- **M3 done** as written (the front f140-205, each window flaring to L* ~85 over 6-8 f and settling to ~55-60 within
  ~18 f, the one window >= 95 and the only honey accent once it has passed). One change: the chime sits where the front
  reaches the far city (f175, "thousand"), not on its start: at f140 it would be 18 f after #4 (hard syncs >= 30 f apart).
- **M4 done.** f0-122 written as a schedule in the painter's order: the band laid at f0 (never un-painted); the run's first
  ~100 px laid with the tip moving; the stroke >= 24 px at a 42 L* step; f0-40 on an out-sine (peak 23 px/f at frame 0,
  decelerating into the landing: an in-out sine would start still, against "never a still frame"); the harbour and far
  city f4-38, the snow f10-40, the block's wash f24-54 crossing the window's row at f36-41; the next block, the cloud and
  the person f54-74; the computer f84; the window f122; the wave f140.
- **M5 done, the cloud redesigned.** The 7x push-through is withdrawn, and the card's A named as never buildable from a
  24 px spot. The alternative is the snow cloud, but as J8's wipe ACROSS the stage (f1384-1432, Film's `foreground-wipe`,
  its edge ~50 px/f, >= 70 % of the stage on the cut frame, never above y 620), not a 3-4x push into a drifting cloud: a
  cloud reaching the pivot between f1340 and f1384 would drift ~14 px a frame (clouds drift 0-15 px a second), and a 3-4x
  push about the pivot sends the Earth's limb and the cloud's top through the band.
- **M6 done.** S11-S12 designed to the owner's version (one person on the near pavement: S1 ~180 px at (780, 1340), S11
  ~207 px at (809, 1408), S12 ~180 px, looking up as the heat arrives), the first draft's bust in the window the
  alternative (the owner's question 2); DIRECTION 3 and the card's §1.5 are in the clashes.

**SHOULD-FIX: 28 done, 2 partly.**
- **S1 done:** painted on f54-74 at x ~858 (~371 px from the window, rule 14), walking left in profile at ~1.6 px/f to x
  ~780 by f104, the head turning up f98-104, a mid-value coat with the window's warm rim and dark legs (>= 25 L* both
  ways). "Entering from behind the next block's corner" is dropped: the block stands behind the pavement, so the person is
  painted on in place.
- **S2 done, and it forced S3b's form:** the brush's trip back to the source (f60-84, ~373 px, peak 22 px/f, "a declared
  jump, led by the cursor") runs right to left, so water setting off at f40 (S3b's fix) would run left to right at the
  same time: the heat now leaves the computer's foot on "AI" (f88-122), led by the brush (the colour flooding over the
  line: T), one mover at a time and the cause before the effect.
- **S3 done. S3b done** (above). **S4 done** (the brush takes back the window's step and its frost on its way down the
  riser). **S5 done** (the curve lands on "blow", f1130-1312, 83 % done on "big": the near box ~75 px, its fans ~25 px;
  the early stills: with the pivot at the mug's centre, 24 home px above the computer's top, the block enters at y >= 682,
  clear; the hero cloud is kept out of the chain: it would cross the band at 0.54-1.36x). **S6 done** (the VP on the eye
  line, (540, 1343) in the lowered frame). **S7 done** (the follow's progress derived from the front: x 540-556, never left
  of 510). **S8 done** (the hand f2296-2328 as the pull's second leg; the bubble on f2332). **S9 done** (the table of
  landings and onsets, each a declared exception on a camera already at rest; S12's bubble fixed). **S10 done.**
- **S11 done another way:** the tag cannot slide down out of the frame (above the eye line a forward move lifts it toward
  the band: "found" below); it hangs on the computer's front panel and leaves with it on "how", so it reads 1.0 s
  (f1662-1722) and never shares the read window with the opened side.
- **S12, S12b, S12c done** (61 f of hold after the step at f2418; the "soon" fallback for G3; FORTY soft and the steam's
  stop a texture: 7 hard syncs, the middle 20.5 s and 15.0 s apart). **S13 done** (S1 -> S2, S2 -> S3, S3 -> S4 and S4 ->
  S5 on the trapezoid cruise; every detailed layer <= 15 px/f, the kettles 14.7 (was ~55); the table from `--speeds`
  and `camspeed.py`).
- **S14 done** (9 leads, 9 of 11 stops CORE-led, no RARE). **S15 done** (no light step in S11: 3 light events; S8
  re-traces, RM8 = 3 declared). **S16 done.** **S16b done** (the hall's lines at +20-40 L* and >= 5 px, the rows' tops
  converging inside the stage; the down-the-street S11 is the owner's question 3). **S17 done.** **S18 done** (S9-S10
  lowered 5 px: the roof at 623; S8's box at (859, 1463); S2 lifted 40 px: its foot 51 px over the name block).
- **S19 done** (named as a departure, for the G4 look clip). **S20 partly:** the monolith (no roofline, no window grid,
  soft top corners, cool light columns a step under the window, the darkest body) reads "machine" from its first frame,
  but its top does not steam before S3: the steam is "really hot"'s own beat (the state rule), and snow sits on its top
  until the melt at f486. **S21 done.**
- **S22 done** (reason 1 dropped; "a whip in disguise" replaced by the number: ~49x needs ~140 f, the voice gives 69 f).
  **S23 done** ("For G3", item 1; plus the derived follow). **S24 done** (I12's hand-off on "use", f1242: the home view's
  lit cluster ~100 px and the planet's Helsinki spot within 1.5x, the mug no longer the hand-off object; rule 7, E11, RJ4
  at rest; the gap list down to the 4 still open). **S25 done** (the clashes, with the library's stale video-4 examples).
  **S26 partly:** carried as open, with the formula and both answers' numbers (the written answer: the block's foot
  ~1227, the computer's ~1263); the feet are not reset before the owner answers the visual script's question 2.

**Found in this fix pass (beyond the review):**
- **The planet's limb crossed the band:** landed at y ~780, it sweeps down through the band as the picture shrinks
  (f1248-1265). It now lands above the band (y 220), the band over the night sea in the sky's own value, and the angle
  change on "use" happens between masses of one value each (the night sky and the sea; the snow and the snowy land).
- **The plan's full top line crossed the band** in S3, S5 and the S2 -> S3 push ("a storey taller than the computer"):
  the plan is now corner posts with short returns, their tops ~0.4 storey over the computer.
- **The block's roof corner and its bumps grazed the band's floor** in the S3 -> S4, S4 -> S5 and S10 -> S11 moves: S3's
  top moved to y 1025, S4's to 875, the bumps to x >= 716: clear in every frame.
- **The follow drifted:** a trapezoid camera let the front wander 502-610 px; derived from the front it holds 540-556.
- **The S2/S3b conflict and the tag's exit** (above); **four gaps for the library** (the pass's "The library's gaps").

**Not done here:** no other doc is edited (the clashes are the orchestrator's); the visual script's two open questions
stay the owner's, as asked there.

**The owner's three questions** (they end `COMPOSITION_PASS.md`, each a visible choice): (1) the turn on "But": a plain
cut, or a snow cloud sweeping across; (2) the person at the end: on the pavement looking up (as approved), or a
silhouette in the lit window; (3) the travel shot: the street side-on, or a turn to look down it (his leading lines and
vanishing point in one frame, at the cost of two camera turns).
