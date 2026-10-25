# Workflow wrapup-scenes-wf_349bb5b0-dfe.js (run wf_349bb5b0-dfe, last activity 2026-10-25 10:53 UTC)

Script: `context/workflows/wrapup-scenes-wf_349bb5b0-dfe.js`

---

## review:S09:r1

{
 "score": 8,
 "gate_pass": true,
 "findings": [
  {
   "severity": "minor",
   "at": "Main f1187-f1189 (film 39.567-39.633), src/scenes/scene09/board.tsx boardAt + TramWiper.tsx flight copy",
   "problem": "Pip's boarding leap is drawn in front of the tram's passenger windows for 3 frames: his feet are at y ~1008, then ~868, then ~735 while the roof is at 600. His speed only reaches zero exactly at the roof line, so he looks glued to the glass, between the lens and the tram, before he ends up on the roof. That contradicts the depth (the tram passes in front of the pier).",
   "fix": "In TramWiper, clip the Wiper's PipFlight copy to y < TRAM.roof + 4 wherever the tram body is under him (x < edgeAt(fT(t)) + TRAM.L/2). That way he rises hidden behind the body and pops over the roof edge. Optionally, reach the apex about 1 frame before LAND with the feet at ~588 (head still under the caption band), then settle onto 602. The S10 hand-over comes after LAND and is unaffected."
  },
  {
   "severity": "minor",
   "at": "film 39.20-39.47 (local 4.72-4.99), PartB.tsx TramCue spark at (112, 604)",
   "problem": "The cream 4-point star floats in empty sky with no wire or pantograph. With sound off it reads as a twinkle, not as the tram's pantograph spark. The peach headlamp pool on the street carries the cue alone, and it does that well.",
   "fix": "During CUE_AT..TAKEOFF, draw a short ink overhead-wire stub through the spark (e.g. M0 596 L260 600, 2.4 px, palette.ink) so the spark sits on a wire. Or drop the spark and keep the pool, which is the smaller change."
  },
  {
   "severity": "minor",
   "at": "Main f1186 (film 39.533), board.tsx PipFlight smear (2nd airborne frame)",
   "problem": "The body-colour smear on the 2nd airborne frame is a ~220 px long, ~24 px wide purple stalk under Pip, with an ink speed line on it. At phone size it reads as Pip standing on a purple pole rather than as motion blur.",
   "fix": "Cap the smear length on frame 2 (bot = min(PIER.cap+1, p.y + 140)) and widen it (w = 32-36), or smear on the first airborne frame only (SMEAR_DUR = 1/30 + 0.001)."
  },
  {
   "severity": "minor",
   "at": "Main f1187-f1190 bottom corners (tram skirt) — CROSS-LANE engine/Film",
   "problem": "The outgoing and incoming scenes' paper-edge corner paint cuts white wedges into the tram's skirt (bottom-right on f1187-f1189, bottom-left on f1189-f1190) while the foreground wiper is on screen. This is known and logged in S09.md, and it sits mostly in the platform's bottom UI zone.",
   "fix": "CROSS-LANE (engine / Film): during a foreground wipe, draw the wiper above the scenes' paper-edge paint, or key the edge preset on the wiper's x. There is no S09-lane fix."
  },
  {
   "severity": "minor",
   "at": "docs/scenes/S09.md l.65 (beat table 4.65-5.17) and l.240 (QA S09->S10); docs/WRAPUP.md S09 row",
   "problem": "Fix round 2's code is complete and consistent: working tree clean, tsc clean, nothing half-done in git log. Both known majors are verified fixed in Main: (a) the nose's first frame is f1184 and take-off is f1185 (TAKEOFF local 5.00), preceded by the cue pool from 39.165, Pip's perk and turn, and a crouch from f1180; (b) the cue no longer has a disc at x=-2, the spark is inboard at x 112 and the pool is clear of the edge. But the docs still describe the old boarding (take-off 4.65, a 0.52 s flight, a headlamp glow from 4.52), and WRAPUP still lists both majors as open.",
   "fix": "Append at most 10 lines to S09.md: FR2 boarding (TAKEOFF 5.00 / LAND 5.26, board.tsx), cue = pool + spark from local 4.68, this review (gate PASS, life 10.0, 82 events, 15.87/s, max gap 0.73 s, 0 framecheck errors). Orchestrator: mark the S09 majors closed in WRAPUP.md."
  }
 ]
}

---

## review:S08:r1

{
 "score": 7,
 "gate_pass": true,
 "findings": [
  {
   "severity": "major",
   "at": "Film 27.0-34.48 (vista f1016 / 33.85 s): the dome's interior district and its watchtower. Files: src/scenes/scene08/extras.tsx DISTRICT/LANDMARK (l.128-160), src/scenes/scene08/layout.ts TOWER8 (l.46).",
   "problem": "The apex (y~816) and the foot behind row 2 are now right, but the dome still reads as a mid-distance greenhouse. Its contents sit at row 2's plane. Measured luminance in f1016: the district inside the glass is L 131, the same as row 2's buildings (L 130), while the far rows outside are L 160-171. The district blocks are 2-3x taller than the row-0/1 blocks outside (hMax 150/118, a 166 px landmark slab, against 40-70 px blocks right of the board). They also use palette.teal and sage. The ink-dark watchtower is 200 px tall, about 63% of the dome's 318 px height, which makes the dome look like it is about 1.5 water towers tall. So it is not the colossal far shield of PEAK 2.",
   "fix": "In DISTRICT, cut hMax from 150/118 to about 55/45 and hMin to about 20. Drop LANDMARK top from 958 to about 1065 (w 42 -> 28). Change BACK/FRONT fills from teal/sage to the row-0/row-1 haze colours used outside, one glass-tint step greener, so the interior measures at least L 160. Lower the window-dot contrast. Shrink TOWER8 to about 30% of the dome height (cabin top 922 -> ~1030, light y with it; CATCH_DEG recomputes) and draw its ink at hair weight. Re-check that the beam still lands on the heap at 'hacking' (30.455)."
  },
  {
   "severity": "major",
   "at": "Film 32.78-34.48, the 'millions' flood (f990, f1016, f1034). Scene08.tsx l.370-395 (roofBand / clumpBand rows 0-2) and the row-3/near bands.",
   "problem": "The haze ladder is only half there. Row 0 is a light stipple, which is correct. Row 1 is separate clumps of pointed dark-teal/olive tufts on pale roofs with bare roof between them; at phone size they read as pine stubble. Rows 2/3 and the near band are single straight ranks of the same hooded heads along each roof edge and along the street, which reads as bleachers or a concert. Nothing pours: there are no figures in the street gaps between buildings and nothing flows toward the dome, so the payoff does not make the viewer feel small.",
   "fix": "Rows 0/1: set empty 0 and clump gap 0, mix coat colours about 60% toward the row's haze, use round dot hoods (no pointed tops, no teal darker than row 2's lightest coat), and make row 1 a continuous 20-30 px-deep stipple sheet over its street, not one line. Rows 2/3: add 2-3 ranks with jy 6-10 and per-figure x jitter. Add 3-4 down-slope tongues of figures in the street gaps between row-2 buildings, leaning toward DOME8.cx, so the near half reads as a sea pouring at the dome. Keep the darkest values and ink outlines for the near crowd only."
  },
  {
   "severity": "major",
   "at": "Film 28.86-32.78 ('they / tens / thousands' through stamp 1). Heap at screen x 50-140, y 960-1100 (f896, f969). Scene08.tsx heap clumps around l.280-320.",
   "problem": "With sound off, 'tens of thousands' is not visible in the picture. The only picture of the count is the heap, which grows to about 20-25 figures crammed against the left frame edge, and the left paper edge (x<~52) turns half of them paper-white (f896). The push to x 560 then carries it further out, so at stamp 1 (32.1-32.8) about 10 figures show. For 3 s (29.8-32.8) the city does not change. The escalation is told only by the board's tally and stamp text, so the jump to 'millions' starts from almost nothing.",
   "fix": "Have each count word also add people in the open left third, which stays on screen through the push. On 'they' / 'tens' / 'thousands' grow queues behind the three row-3 door rattlers (screen x 60-300, y 1280-1380) and on the row-2 roofs left of the board (x 80-420, y 1090-1170): +3 / +8 / +20 small hooded figures in coat colours, popping in clumps with the glass ring. On 'hacking' add +6 more and let overflow gates 8/9 add a few. By 'minutes' the left third should be visibly busy, then 'millions' floods everything (three readable steps). Also keep the heap's figures at x >= 60."
  },
  {
   "severity": "major",
   "at": "Film 32.80-34.48: the 11 'millions' climbers over the dome's shoulder, screen x 170-265, y 800-900. Scene08.tsx l.318-330 (climberSlots n:11, h:[22,28]).",
   "problem": "A chain of 22-28 px figures runs from the heap up the silhouette to the apex. At phone size it reads as a caterpillar or vine on a bubble. It also puts a human ruler along the dome's outline (the dome is about 11 figures tall), which undoes 'colossal' more than anything else in the frame. It pops in alone one frame early (f984), like a flash at the dome's top.",
   "fix": "Remove the climbers above the lower third of the flank: set n 11 -> 0 and give those figures to the heap's top rank, or clamp the climber slots to y >= 1020. That keeps the accepted 25-32 px heap cheat at the dome's foot, where its scale against the dome stays ambiguous, and keeps the silhouette clean up to the apex."
  },
  {
   "severity": "major",
   "at": "CROSS-LANE src/lib/edges/hints.ts EDGE_HINTS['S08'] (missing). Left paper edge at x 0-~52 over the heap and rattlers (f896, f969, f1034).",
   "problem": "The paper edge still whitens the left half of the counted heap and the left rattlers and near-crowd figures. At the count beat the main story object shows as white outlines.",
   "fix": "Add these keep rects, screen px, whole shot 24.095-34.483 (union of the measured positions). Heap + left flank (incl. climbers if kept): [0,790,280,1130]. Pip: [290,1260,440,1495] (measured 304-426 x 1276-1478). Board incl. frame: [400,895,912,1475] (face measured 414-898 x 908-1336 at the 1.15 push, 448-872 x 1048-1422 at rest). Near rattlers + rising near crowd left of Pip: [0,1270,340,1490]. Bottom-left neighbour: [0,1480,460,1920]."
  },
  {
   "severity": "minor",
   "at": "Film 29.8-34.48, heap figures (zoom of f1016, x 50-150, y 940-1120). scene08/crowd.tsx PileFig / heapSlots.",
   "problem": "The heap is now hooded figures in 3/4 view with hands on the glass and some coat variety, which is a clear improvement. But they are stacked in a regular grid of tiers like a choir, and about a third of the hoods use the near-black hair token, so at phone size the top of the heap still reads as dark teardrops. The base stands on a pale row-2 roof slab at y~1110 instead of passing behind the roofline.",
   "fix": "Use the dark-brown hood on at most 1 in 6 figures and give the rest coat colours (ochre, teal, cream, rust, sage). Jitter each slot x +/-6 and y +/-5 and lean figures 5-10 degrees into the glass. Move the lowest rank 10-15 px down so row 2's roofline cuts the heap's base."
  }
 ]
}

---

## review:S10:r1

{
 "score": 7.5,
 "gate_pass": true,
 "findings": [
  {
   "severity": "major",
   "at": "film 42.10-44.40 (local 2.47-4.77), checked at 300 px wide",
   "problem": "Old vs current still does not read as HALF at thumbnail size. Only the three near plaques read at 300 px wide, and only one of them is old (siteM, brown), so the frame says 'a third'. The six far plates are about 11 px at that size, sit in a zig-zag column inside the 72 px gap and beside the sun, and read as window texture or stickers. The 1/2 sun pie, which carries 'half', is gone by about 41.6 (pieSolid = W.sites - 0.3), before any plate turns old. So 'half' and 'old' are never on screen together.",
   "fix": "(1) In scene10/beats.ts, set pieSolid to about W.so + 0.1 (about 42.98) so the half-cream sun is still up when the far plates land old (about 42.67). (2) In scene10/secondRow.tsx, when each OLD far plate lands (A, C, E), age the whole building: shift its facade fill one value step toward the old-plate brown (about 35 % wash) and turn its window dots into dark ink ticks, popping on the same frame as the plate's 1-frame dark pop. The old/current split then reads by building mass (40-90 px at 300 px): alternating light and dark far houses beside the dark near plaque. Check it with a 300 px-wide downscale of film 42.80 and 44.20."
  },
  {
   "severity": "major",
   "at": "film 44.49-45.17 (local 4.86-5.54), the 'hey!' gag",
   "problem": "Pip's 'hey!' still reads as a happy trumpet, not as protest at being skipped. The gag pose is the front trunk-up rig: trunk curled overhead, small 'o' mouth, pink blush, round 'wide' eyes, no brows. In cartoon language that reads as delight. The only 'protest' marks are a peach '!' bubble (r 21) stuck on siteM's wall by the door and three spark strokes. At phone size the bubble reads as the door or plaque exclaiming, and at 300 px it is a 6 px dot. Nothing ties Pip's reaction to the skipped tag.",
   "fix": "In scene10/pip.tsx: (1) Replace HeyBubble's round '!' on the wall with a SPIKY shout bubble lettered 'hey!' (caption hand, ink, about 30 px cap on screen, r about 44), attached up-left of Pip's head at about (610, 1210) with its tail into his mouth. It pops on the stamp and holds to heyEnd (shrinks out with the spark, no fade). (2) Give him a cross face. Draw two local 5 px ink brow slashes over his eyes, inner ends low (angled down toward the trunk), inside the same transform as the stamp. Swap expression 'wide' for 'worried' only if its rig brows render inner-low at Pip's scale. (3) Sell the stamp as a stomp: two short ink impact ticks at the bollard top on the squash frame. (4) Aim the spark from the trunk tip at the empty twine hook on siteM's plate, not at the plate centre. Check a 300 px downscale of film 44.70: it must read 'indignant', not 'cheering'."
  },
  {
   "severity": "minor",
   "at": "film 45.07-45.17 (local 5.43-5.54)",
   "problem": "The cart starts rolling out at 44.865. Its FixSign card ('still fixing... / fixed!') slides in behind Pip's left ear for the last 2-3 frames of the 'hey!' hold, before his crouch. The card and the ear make a tangent, and the gag ends cluttered.",
   "fix": "In scene10/cart.tsx, reshape the roll-out ramp, not its start or end: a slower start (for example ease-in cubic over the first 0.3 s instead of the sine ramp) that catches up to the current curve by 45.318. The card's right edge then stays at least 15 px left of Pip's ear until heyEnd (45.175), and the last 0.3 s of the scene (the cut frames) stay pixel-identical."
  }
 ]
}

---

## fix:S08:r1

I fixed all five majors and the cheap minor (heap colours and jitter), checked each on renders, and the QA gate passes (life 10.0/10). One trade-off: keeping the heap at x ≥ 60 makes it a narrow stack against the left flank, about 20 figures, at y 950-1136.

1. **Dome (major 1):** district blocks are now 20-55 px in hazed glass greens. In f1016 the inside measures L 179-190, row 2 L 130, the far rows L 195. The district relights with the far rows on 'day'. The landmark is 28 px wide and tops out at y 1065. The watchtower is about 30% of the dome's height (apex 1030), with hair-weight ink and a tealDark cabin. The beam still lands on the heap at 'hacking'.
2. **Flood (major 2):** rows 0 and 1 are a continuous pale stipple: no empty roofs, no clump gaps, coat colours mixed toward the haze, round dot heads on row 1. Row 1's street is a 4-rank sheet. Row 2 has no ink hoods and a hair outline. Rows 2/3 and the streets are in jittered ranks. On 'millions' four alleys (x 186, 298, 986, 1052) fill with streams of figures leaning toward the dome. They read as pouring, but somewhat column-like.
3. **Count with sound off (major 3):** each count word adds clumps on the row-2 roofs left of the board (2/5/13/4/2/2) and queues beside the three left door rattlers (1/3/7/2/1/1). That gives about 3, 8 and 20 people on 'they', 'tens' and 'thousands', on top of the heap.
4. **Climbers (major 4):** removed; the dome's outline is clean up to the apex.
5. **Heap (minor 6):** base moved 12 px down so row 2's roofline cuts it, slots jittered ±6/±5 px, lean 5-10°, six coat colours, dark hood on 15% of figures.
6. **QA gate:** PASS, 8.08 events/s, max gap 0.90 s, 0 framecheck errors, the same 2 ui-zone warnings as before. Pip's last frame is unchanged; the scene notes are appended to `docs/scenes/S08.md`.

**CROSS-LANE (`src/lib/edges/hints.ts`):** add `EDGE_HINTS['S08']` keep rects in screen px, whole shot 24.095-34.483: heap [0,930,280,1145], roof count clumps [0,1060,440,1180], Pip [290,1260,440,1495], board [400,895,912,1475], near rattlers/queues/near crowd [0,1270,340,1490], bottom-left neighbour [0,1480,460,1920].

Changed files are `/home/user/Test-/video/src/scenes/Scene08.tsx` and, in `/home/user/Test-/video/src/scenes/scene08/`, `layout.ts`, `tower.tsx`, `extras.tsx` and `crowd.tsx`. Nothing is committed.

---

## fix:S10:r1

S10 fix round 1: both majors are fixed, and the minor (the cart card) is only partly fixed because the full fix doesn't fit. QA gate on S10 passes, life 10.0/10, 0 errors, 2 UI-zone warnings (bottom zone f128-143 and right rail f175-177). Nothing committed.
- **Major (a), half / old at 300 px** (`scene10/beats.ts`, `scene10/secondRow.tsx`):
  - The 1/2 sun pie now stays up until 42.98 (`pieSolid = W.so + 0.1`), so it is on screen when the far plates land old.
  - When each old far plate lands (A, C, E), its whole building ages on the same frame: the wall turns brown-olive and its windows become dark ink ticks. I used a 70% brown wash, not the 35% you suggested: at 35% the old houses were still lighter than the tan current ones at 300 px.
  - Far windows are now drawn inside each building, because the shared window layer sat on top of the nearer gap houses.
  - Checked at 300 px on film 42.80 and 44.20: the far row now alternates dark old houses and tan current ones next to the brown near plaque, with the half pie up.
- **Major (b), Pip's 'hey!'** (`scene10/pip.tsx`):
  - The round '!' on the wall is replaced by a spiky peach 'hey!' bubble (about 33 px letters on screen), up-left of his head with its tail aimed at his mouth. It pops on the stamp and shrinks out by heyEnd.
  - His face is now cross: 'wide' is swapped for 'worried' (its rig brows do render inner-low), plus two 5 px brow slashes that move with the stamp.
  - Two impact ticks appear at the bollard top for 0.1 s on the squash frame, and the spark is now aimed at the empty twine hook.
  - Checked on full-scale 44.50-44.70 and a 300 px 44.70: it reads indignant.
- **Minor, cart card** (`scene10/cart.tsx`): the cart now holds still until 45.066, then pushes off up to 17.9 px per frame and rejoins the old curve at 45.318. The maker only starts walking when the cart moves.
  - The 15 px clearance can't be met: the parked card is only about 12 px from his ear. Under the 18 px/frame limit, the card now touches the ear at 45.133 and overlaps on 45.167 only, instead of from 45.067 on. Ending the 'hey!' one frame earlier would clear it fully.
- **Cut frames:** the first 0.3 s are pixel-identical. In the last 0.3 s only the far-row patch (screen x 604-740, y 604-1140) differs, because the aged houses stay aged; the cart and Pip are identical. S10 to S11 is a hard cut, so nothing there has to match.
- I appended 10 lines to `docs/scenes/S10.md`.
- CROSS-LANE: none.

Files are in /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrap/S10:
- `qa/REPORT.md`
- `fin_sheet.png`
- `r3_thumbs.png`

---

## review:S08:r2

{
 "score": 7.5,
 "gate_pass": true,
 "findings": [
  {
   "severity": "blocker",
   "at": "S08 4.8-10.39 s (film 28.9-34.48), worst in the wide 9.3-10.39 s; src/scenes/Scene08.tsx l.293 heapSlots({h:[25,32], dy:15, top:930 ...})",
   "problem": "The heap's people break the dome's scale. They stand at the dome's foot, behind row 2, but they are 25-32 px tall, about twice the 15-17 px row-2 rooftop crowd standing NEARER to us. The heap is also a 6-7 tier column climbing about a third of the left flank. That makes the dome only about 10 people tall, so it reads as a greenhouse on the next block, not a colossal shield over a far district. Measured on the full-res frames f279 and f309 (crops in /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrap/S08/rev2/heap_end_x3.png).",
   "fix": "Make the heap a low, wide mound at the foot instead of a climbing column. heapSlots h [25,32] -> [15,19], dy 15 -> 9, gap 2.2 -> 1.5, top 930 -> ~1010, and change the y-h > 952 filter to match. That gives 3-4 tiers of figures, about 1.1x the row-2 size. Keep the 6 coat colours and the ink hood on 15 %. Only the glass-side figure of each tier gets a sand hand on the glass. Keep the per-word growth by count: WAVES stay as fractions of N, and N roughly doubles. Move CATCH_Y 1032 -> ~1080 so the 'hacking' beam still lands on the mound. Re-check that every heap figure stays at screen x >= 60."
  },
  {
   "severity": "major",
   "at": "from the dome draw on 'Cloudflare' to the end (scene 2.33-10.39 s); the dome arc is drawn by shared DomeCity.tsx l.638-639 at SI.front (4.8)",
   "problem": "The dome outline uses the FOREGROUND ink weight, 4.8 world px, which is about 5.5 px on screen during the 1.15 push. It is dark ink with crisp ink meridians and white glints, so it is the darkest, heaviest line in the far plane, heavier than row 2's outlines and as heavy as the board frame. It pulls the dome forward to the mid-ground and fails 'at the far plane's haze value'. In the wide the dome also looks smaller than the board (the board is about 440x410 px).",
   "fix": "In lane: wrap the 'dome' layer in a scoped CSS override, the same mechanism as GlassTint (class + <style>). Target the two arc halves (seeds .../arcL and .../arcR, stroke-width 4.8): stroke-width ~2.2 (SI.far) and a hazed ink of roughly 55 % ink mixed into the far haze (~#5B6E62 golden, ~#4E675C after 'within'). Set the lattice to opacity 0.55 and the glint bars to 0.6. If the attributes can't be targeted, CROSS-LANE: add a DomeCity `domeInk={width,color}` prop in src/scenes/shared/sets/DomeCity.tsx."
  },
  {
   "severity": "major",
   "at": "S08 4.1-8.6 s (film 28.2-32.7), 'announced' -> 'minutes,'",
   "problem": "With sound off, 'tens of thousands' shows a few dozen people: about 4 near rattlers, a ~30-figure heap and 2-5-head clumps on six roofs. On 'millions' about 1500 figures arrive at once, so the visible escalation is 'a handful -> millions'. Only the stamp text says 'tens of thousands' (strip: /tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrap/S08/rev2/countstrip.png).",
   "fix": "Bring the FAR value stipple in during the count so 'tens of thousands' already hazes the far city. Rows 0/1 rank 0 (roofBand s8/r1 and s8/r0, plus the far street clumps s8/s0a and s8/s1c) pop at T.thousands + 0.06 in 'ltr' over ~0.25 s, and rank 1 at T.in. The remaining far ranks, rows 2/3, the alleys and the near crowd stay on 'millions' unchanged. The count then grows far -> near along the haze ladder, and 'millions' is the next order of magnitude."
  },
  {
   "severity": "major",
   "at": "S08 9.6-10.39 s (film 33.7-34.48, incl. the held S08|S09 cut frame); rows 0/1 lite LOD in scene08/crowd.tsx (bustParts lite, roofBand arms 24/30)",
   "problem": "At dusk the far crowd reads as dark grass or stubble on the skyline. The lite quads are a single value, #5E8A78, DARKER than their own buildings (#84A895), and spiky with arms, silhouetted on the afterglow band, so the haze ladder inverts in the frame the viewer holds. In golden light the same rows read as a pale fringe (/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/wrap/S08/rev2/farcrowd_dusk.png).",
   "fix": "On rows 0/1 and the far street bands, set arms: 0. Draw the lite busts as overlapping round-topped blobs (width >= 0.8 h, 1-2 px overlap) so they form a scalloped crowd mass, not a comb. In the dusk relight (FloodDusk / DuskRelight for row0 and row1), set the far crowd fill one small step off the building value (~#76998A, lighter than row 2's coats). The last 0.3 s change only in those far figures: Pip, the sky, the stars and the set point stay identical for the S09 cut."
  },
  {
   "severity": "major",
   "at": "S08 8.7-10.39 s (film 32.8-34.48); ALLEYS / TONGUES in Scene08.tsx l.406-446, row-2 roof strips",
   "problem": "The middle plane of the flood reads as 'concert + pillars', not a sea pouring over the city. Each of the four alley tongues is a narrow (16 -> 44 px), 178 px tall vertical stack of heads that reads as a textured pillar at phone size. Every row-2 roof carries a neat, even-topped 2-3 rank strip of heads, like rooftop bleachers.",
   "fix": "ALLEYS w0 16 -> 8 and w1 44 -> ~84, and let each tongue's foot fan ~30 px into the row-2 street band so it widens and spills toward us. On the rooftop strips, rank0 gets jy +-5 and size jitter 0.8-1.2 for a ragged top contour, plus 2-3 figures per roof stepping over the front edge (spilling down the facade). No new devices, same pop times."
  },
  {
   "severity": "minor",
   "at": "whole shot, Main f723-f1034; EDGE_HINTS['S08'] in src/lib/edges/hints.ts (CROSS-LANE)",
   "problem": "S08 still has no edge keep rects. The left paper edge (about x 0-50 from y ~740 down) turns the near rattlers and the neighbour at x < 50 into white ghost outlines in the final wide (f1033). The heap, Pip, the board and the tally overflow have no protection if the edge moves.",
   "fix": "CROSS-LANE, add keep rects in screen px (1080x1920, union over crane, push and wide; checked on f192/f258/f279/f309/f1033): heap + left flank + beam catch [0,930,280,1145]; roof count clumps left of the board [0,1030,440,1180]; Pip [290,1260,440,1495] (last frame ~(395,1470)); board + tally overflow [400,895,950,1475] (the overflow reaches x ~945 at 'minutes'); near rattlers, queues and near crowd [0,1270,340,1490]; bottom-left neighbour [0,1480,460,1920]. Optional: right neighbour's hands-to-head [740,1540,1080,1920] (film 33.1-34.48). If finding 1 lands, the heap rect can tighten to [0,990,260,1145]."
  }
 ]
}

---

## review:S10:r2

{
 "score": 7.5,
 "gate_pass": true,
 "findings": [
  {
   "severity": "major",
   "at": "film 44.50-45.17 (local 4.87-5.54), Pip on the bollard; scene10/pip.tsx",
   "problem": "The fix round made 'hey!' read as a shout (spiky bubble, brow slashes, stomp ticks), but it still doesn't say 'you skipped that one'. At 44.50 Pip pops out of the side-on pose facing the cart (43.7-44.47) into a front pose facing the camera. His eyes look into the lens, his trunk points straight up between them and his cheeks are pink. At 300 px wide the brow slashes disappear and the shape is the old trunk-up cheer. The bubble's tail goes to his ear, and the bubble sits nearer the maker's head than Pip's mouth. So the shout is aimed at the viewer, not at the maker or the plaque he skipped.",
   "fix": "Play the hey in the side-on facing-LEFT pose he already holds from 43.705, with no pop to the front pose at 44.50. Thrust the trunk up-left at siteM's old plaque, tip the head back toward it, open the mouth wide to shout, keep the brow slash and drop the cheek blush for the beat. Move the bubble about 25 px right and down so its tail ends at his mouth; this also clears the tangent with the plaque's bent corner. Keep the 45.175 turn-right crouch and the hop exit as they are. Optional (cart.tsx): have the maker turn his head or shrug toward Pip for 0.2 s around 44.75 so the shout has someone to land on."
  },
  {
   "severity": "major",
   "at": "film 42.15-44.9 (from siteM's flip to 'anymore'), at 300 px wide; scene10/sites.tsx, scene10/secondRow.tsx",
   "problem": "'About half are old' still doesn't read at thumbnail size. In the near row only 1 of 3 plaques is old, so the picture shows one in three. All the old marks sit in the centre-right, and the left half of the frame stays fresh. Ageing the far facades (Wrap FR1) only adds a brown column in the gap. The far CURRENT plates (cream, 40 px) disappear at 300 px, so the far row doesn't alternate old and current; it reads as one brown cluster. The 1/2 sun pie carries 'half' alone, and it settles at 42.98.",
   "fix": "When siteM's plaque flips (42.145), age siteM's own facade with the far row's recipe: facade = mix(wall, brown, ~0.55), window panes become slanted ink ticks, plus one peeled-render patch. The old block is then siteM plus the aged gap column: the middle half of the street between fresh siteL and siteR. Make the far current plates (P0, A, D) read light-on-dark at 300 px: sage frame band one step darker, cream face. This changes siteM in the last 0.3 s, which is fine for the hard cut to govB."
  },
  {
   "severity": "minor",
   "at": "film 39.77-39.87 (local 0.13-0.23, f1192-f1196), the opening frames; scene10/sites.tsx SiteSketch timing",
   "problem": "Once the tram's tail has passed, the uncovered set is nearly empty for 3-4 frames. It shows a mint sky, the sun and 2-3 stray vertical strokes. The window boxes of the line-art sketch only start drawing at about 39.90, so on a phone this reads as a blank frame between the wipe and the build.",
   "fix": "Start the SiteSketch draw-on of siteL and siteM 0.08-0.10 s earlier. The strip the wipe uncovers then already has facade edges, the cornice and the first window boxes as the tram passes. Keep siteR after the tail and keep Pip's leap as it is."
  },
  {
   "severity": "minor",
   "at": "film 44.57-45.13 (local 4.93-5.50), the held 'hey!'",
   "problem": "After the stamp, Pip and the bubble are frozen for about 0.57 s; only the 3 spark strokes change. The scene's other motion (the far wave, the update bar) keeps the life metric up. The gag itself still looks like a held drawing in the middle of a shout.",
   "fix": "Put a small secondary on 'anymore' (44.985): a 2-frame ear flap or a 2 px body tremble on Pip, and a 4 % squash-pop on the bubble. Change no poses."
  }
 ]
}

---

## Failed agents

- fix:S08:r2: 
- review:S08:r3: 
- fix:S10:r2: 
- review:S10:r3: 
