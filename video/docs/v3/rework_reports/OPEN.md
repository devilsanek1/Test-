# v3 rework: open items for the transition agent and the assembly (orchestrator, 2026-10-27)

From the WINDOW (SQE+SQF) and REVEAL (SQD) lane reports (both sessions archived):
1. SQE/SQF `H2Scene`: swap `FrontStandIn` for the real `thread_plane` (one line; the plane has landed).
2. thread_plane: draw SQE's `<CrateHop to={listing laptop screen centre at T}>` over the plane at 29.90-30.25 (default
   (171, 1236)); the tag ticks to $1,099 at 30.28 ("pass").
3. SQD: OutsideFar now draws `RevealBirds`: drop SQD's own birds layer if it still draws one (no double birds).
4. SQD: the DC's lit sign enters at ~21.0 (whole by ~21.35), approved; flow_v2 §4 updated.
5. SQD speed WARNs during the x27 pull-back (the DC's flat edge ~50 px/f while entering; town 23, street 29 px/f): check by
   eye at full size; soften only if it strobes.
6. The queue reads small at phone size outside the x1.35 push (WINDOW used flow_v2 §7's read fallback): check at phone size.
7. J3: SQC must draw `J3Stick` from 18.86 (sent to the HOME helper).
8. SQF's payoff hold is 56 % static on the meter, calm on purpose (exhaust puffs, a far car): keep unless it reads frozen.

From the HOME lane (SQB + SQC, max effort):
9. thread_plane.tsx: SCREEN_LIT `[17.24, 19.4]` -> `[17.24, 18.3]` (the screen dims as THE stick leaves it, so the
   brightest 5 % sits on the stick at 18.88).
10. home_set.tsx, optional: 2-3 calm tier-C things only SQB sees (the slope right of the skylight; the desk right of the
    phone) if SQB should be as full as H1 (SQB flat 39 % / detail 20 % vs SQA 31 / 25).
11. gate_check: J3's push-through cut at frame 1164 is not detected as a spike now that the stick matches across it; the cut
    is there (stills). Accept, or detect push-through cuts by the declared frame.
12. The doodles' "$999" / "BETTER" (~9 px on a phone) don't read; the captions carry the joke. Consider bigger labels.

## Early max-effort review (SQB-SQF)

Two independent MAX-effort reviews of SQB-SQF in the early full render (`film_half.mp4`, rendered at 9fab768), merged
into one list (2026-10-27): R1 story, joins and hierarchy; R2 the look (line, light, fullness). Film seconds, px at
1080 x 1920, measured per CRAFT §e with the captions masked, with `scripts/qa` (density.py with the scenes shifted by 5.80,
check_light on 34 light-off/on pairs) and `scripts/qa/retro_tools` (carry, jumps, tiers, line, ends). SQA was not reviewed
(its fixer is at work). Ranked most severe first: the blocker, then what the owner sees longest and closest to their
notes. Each item gives the sequence, time and area; its sources (R1 #n, R2 #n; a plain #n is an item above); the owner's
words it answers; what was measured; the fix and its file.

**The joins hand over cleanly** (carry / eye jump / colour shift, 108 px wide): J2 0.85 / 0.049 / 10.5; J3 0.44 / 0.04 /
17.9 (over 15, not declared: E6); J4 0.52 / 0.088 / 17.5 (a declared light change); J5 1.00 / 0.098 / 0.2. The only
single-frame pops are the stand-in phone's dim switches (E1). The failures are inside the sequences: the eye is pulled off
the beat, the far field is as loud as the subject, and the cause-and-effect links are too small to read.

**Since the render:** the SQA fixer's work-in-progress commits (3a003ee, 7e4fb5b) changed the shared `thread_plane.tsx`,
`home_set.tsx` and kit pieces that SQB and SQC draw. The thread plane's off-beat state (E2) and the hand lifted off the desk
(R2: in the render the skin sat dL* ~1 from the desk in SQB and SQC) have landed: re-measure them in the next render, don't
rebuild them. E8, E10 and E13 are still as reviewed at HEAD (d6f8f38); SQD-SQF's own files are unchanged. `thread_plane.tsx`,
`home_set.tsx` and `kit/PriceTag.tsx` stay the SQA fixer's while it works (uncommitted edits in all three at 23:26 UTC):
send E1's like-pop, E2, E8, E10, E12 and E13 to it as requests, or make them after its commit.

- **E1. BLOCKING. SQE+SQF 22.45-41.0 (and SQD's tail from 22.25), lower left: the stand-in front plane is a second "you"
  and hides the thread's price** (R1 #2, R2's notes; escalates #1; E2 and E10 reach SQE/SQF only through it). Owner: "too
  incoherent"; "not sure what to keep my attention on". `SQE_front.tsx` `FrontStandIn`: its phone has no `buttonY`, so
  `Hand` puts the thumb on the price. The last digit of $1,079 / $1,099 is hidden 23.0-39.70 (the tick 30.28, the jolt
  35.95, the payoff hold 38.62-39.70), and the thumb covers part of the mini data center after the turn (39.95-41.0). The
  hand is drawn at `Hand`'s default subject tier (full dark outline), not the plane's support tier. The screen dim is a cool
  lilac multiply (#C9C2D6, C* 11; the real plane's is a warm peach) that switches in one frame: ~6 % of the frame jumps at
  29.90, 31.00 and 38.13. flow_v2 §4's 39.88 like-pop is missing (nothing draws it: not the stand-in, not the plane, not
  SQF). **Fix:** `SQE.tsx` `H2Scene`: `<FrontStandIn T={T} />` -> `<ThreadPlane />`, and
  `<CrateHop to={threadAt(T).listingScreen} />`; delete `SQE_front.tsx` (SQD draws `H2Scene` from 22.25, so this covers its
  tail too); the like-pop in `thread_plane.tsx` (a request). Check stills at 30.40, 35.97, 38.90 and 40.10: the thumb on
  "Add to cart" below the tag, the digits and the "AI" back clear.

- **E2. SQB 5.80-15.30 and SQE 22.95-35.95, lower half: the thread plane owns the frame off its beats** (R1 #1, R2's
  notes). Owner: "not sure what to keep my attention on"; "the main arc going where the attention should be". Hero = pixels
  within dE 14 of #D9542F / #B5432A; salience per CRAFT §e at 540 wide. SQB: the phone holds 82-95 % of the hero pixels,
  100 % of the pop and 70-94 % of the top-3 % salience (the tag alone 65-81 %); the chart, tier A, holds 5-18 % of the
  hero and 0-29 % of the salience. SQE: the phone holds 63-71 % of the hero and 45-67 % of the salience while the street is
  A. At 18.90 the tag holds 44 % and THE stick 24 %. In the render only the screen dimmed off-beat; the tag, the
  hero-orange listing laptop and the blue "Add to cart" pop (all tier B here, flow_v2 §5) never stepped down. **Fix**
  (`thread_plane.tsx`; build it once, as the SQA fixer's "thread off-beat dim", task #18): outside SCREEN_LIT and ±0.6 s of
  each reaction (15.30, 18.30, 24.44, 30.28, 35.95), step the tag (fill toward EMBER.screen, C* <= ~30, no full outline,
  lighter price ink), the listing laptop and the button/badge (EMBER.pop -> a screen tint) one tier down: a 2-step change,
  3 frames apart like the dim, back to A on each beat. 7e4fb5b's `TAG_FULL` / `tagDim` now does most of this. Left:
  re-render and meet the target (the stage holds >= 50 % of hero and salience at 8.5, 14.9, 26.1 and 32.2; SQE only after
  E1); `TAG_FULL` keeps the tag at A through 15.30-19.40, so at 18.90 it is at full strength as in the render (end that
  window by ~18.9: the 18.30 tug + 0.6 s), and it has no A window for the 24.44 sway (R1's windows give it one).

- **E3. SQD's hold 21.4-22.68, SQE and SQF 22.68-41.1, the window band y 600-1000 (top left): the far field is as loud as
  the subject, and the data center's own beat at 36.98 never fires** (R2 #1 + R1 #4). Owner: "not sure what to keep my
  attention on"; "too rough and messy, a lot of rough lines"; the supporting details "a bit more subtle but yet alive". The
  band's local contrast averages 10-12, against 11-14 for the street that holds the beat's subject (CRAFT §b: C <= 7,
  subject / environment >= 2). The data center (tier C in SQE) is at 17-21.3, against the street's A band at 11-12; the
  town rows 19-20 (navy walls #414C75, L* 33, under snow-white caps, L* 93: ~30 zigzags edge to edge). Depth is inverted:
  the far planes are darker than the near street. The DC body (L* 17) carries S9's 3 x 6 px LED dashes, each blinking at
  its own rate: 87 % of the hold frames change there, about a dozen tiny movers with the white sign. Lines: 200-255
  strokes per Mpx, 175-228 short, 460-650 near-miss ends (budget 80 / 25 / 40); ~125 of the ~400 strokes per frame are the
  DC grids, 50-77 the town. The 36.98 sign step is drawn UNDER the hall (`outside.tsx` L292, before `<Hall />`): DC L*
  45.2 -> 45.2, sign p98 92.5 -> 92.5, so "an AI data center" has no visual event (at 37.2 the DC holds 0.7 % of the top
  salience, and the motion goes to a worker and the far car). **Fix:** `S9_far.tsx` `Hall` / `HallB`: drop `LEDS` /
  `ledsD` for the clean pen's 3 long soft bands per row (home_set's `DC_LED` #A8B6DE), no blink. `outside.tsx`
  `OutsideFar`: the hall at tier environment outside its two beats (A 21.0-21.6 on "AI data centers.", A 36.88-38.7 on the
  sign step), the sign panel and LED rows within dL* 15 of the facade, the body one haze step; at 36.98 step the lit panel
  and letters UP, drawn on top of the hall (the `signUp` path after `<Hall />`). `outside.tsx` `HouseRow` (and the far
  roof rows): walls ~50 % into the far ground (L* 55-62), caps one pale step (L* ~84, not EMBER.snow), raw fills through
  `useTierPaint`. Then re-measure the plane against CRAFT §b-c (C: local contrast <= 7, <= dL* 15 inside one plane).

- **E4. SQE 29.90-30.25 (sill to phone) and 31.40-35.95 (street, right): "laptop makers pass that on" has no visible
  cause** (R1 #3; escalates #2 and #6: the causal link, not only the queue). Owner: "There is no story"; "the main arc
  going where the attention should be". The crate hop, SQE's one object carry (carrier D), shrinks from 34 to 16 px as it
  comes toward the glass (`crateHop` w0 34 / w1 16: ~0.01-0.06 % of the frame), so the tag ticks to $1,099 out of
  nowhere. After the push releases (28.93-29.60), the BETTER van (~130 px wide, its label ~10 px) and the overtake play at
  rest size. **Fix:** `outside.tsx` `crateHop` (kit `Fleet.tsx` `crateFlightPose` lerps w0 -> w1: give it a mid-arc width
  key): 34 -> ~120 px at the sill -> ~40 px into the screen over ~0.45 s (29.85-30.30), with the screen lit.
  `h2_window.tsx` `PUSH`: hold x1.35 until SQF (out0 / out1 -> 36.36-36.98, its "nothing new" stretch), or add a second
  push for 31.40-35.95.

- **E5. SQD 19.60-22.68, centre: "a mountain of memory sticks" doesn't read at phone size, and the street steals "By the
  mountain."** (R1 #5; flow_v2 §7's declared risk). Owner: "There is no story"; "not sure what to keep my attention on".
  THE stick is gold with near-black chips; its neighbours are tan planks with L* 60 chips. They read as pallets at
  19.7-20.5, then as a haystack or brick texture of ~6 x 2 px marks, with the summit stick ~15 px. At 21.40 the street
  (lit gate, trucks, vans, workers, the white "CHIP PICKUP" board, bench, bike) holds 81 % of the top salience; the DC and
  the mountain hold 17 %. **Fix:** `SQD_peak.tsx` `RevealPeak` (one pass with E7): the neighbours in THE stick's colours
  at C contrast (gold board, chips ~L* 40-45), fewer and bigger toward the crest, flat colour lower down; the summit stick
  at >= ~30 px in H2. Merge note: chips at L* 40-45 sit 26-31 under the gold (#D4A46E, L* 71), past CRAFT §c's C limit
  (dL* 15 inside one plane), which the REVEAL lane kept on purpose ("too busy"): get the read from size and count first,
  and if the chips must darken, declare it in flow_v2 as the reveal's exception. `outside.tsx`: `FaceQueue` ("CHIP
  PICKUP", not in flow_v2) only from 23.10, and the gate's pool and trucks one value calmer until then (with E11's warm
  steps).

- **E6. J3 19.20-19.65, the caption band: the push sweeps the window's giant sign through the captions** (R1 #6 + R2 #9).
  Owner: "no clean transitions". The x3-x7 push-out carries the H1 window's "AI DATA CENTER" sign through the band under
  "memory chips.": for ~8 frames it reads "AI memory chips. NTER", and 80-150 px black letters fill the top until 19.38
  (DIRECTION rule 10). Then "And so do" is dark ink on navy sky, 19.43-19.62. J3's colour shift (17.9) is over 15 and not
  declared. **Fix:** `captions.json`: end the "memory chips." page at ~19.12 (after "chips"), so the band is empty during
  the push ("And so do" still pops at 19.40). `scenes.json` SQD `captionTone`: the 'down' wipe at t 0.03, dur 0.15 (now t
  0.15, dur 0.4). The sign at C after SQA's beat (E8). `flow_v2.md` §6: declare J3's light change.

- **E7. SQD 19.40-20.2, centre: THE stick, J3's landing subject, hovers over the pile** (R2 #2). Owner: "too rough and
  messy"; "the light is weirdly put". There is a sky gap under it, up to ~55 px at 19.70 and wider at 19.40; its contact
  shadow is an ellipse painted across that gap and past the pile's left edge; its cold rim crosses the left side notch,
  outside the silhouette (CRAFT §d.6, §d.8). Cause: the mound sits 1-4 H2 px below the stick, which x27 magnifies;
  `J3StickLight` builds the rim on a plain rect and does not clip the shadow. **Fix:** `SQD_peak.tsx`: raise the mound's
  shoulders (or seat 2 crest sticks) so the stick rests on gold along its length at k 27; clip `ContactShadow` to the pile;
  take the rim's `d` from `stickParts(w).outline`.

- **E8. SQC 16.60-19.40 (also J2, J3 and SQB's window strip), the window centre: H1's data center never leaves tier
  'subject' after 4.04** (R2 #3 + R1 #6). Owner: "not sure what to keep my attention on". `home_set.tsx` `HomeDataCenter`
  has `tier={T >= DC_DARK_AT ? 'subject' : 'support'}` (still so at HEAD): a near-black block with a white sign keeps the
  subject's outline and contrast behind the phone. The window's local contrast is 13.0 against 8.9 for the listing at
  17.70, and 13.1 against 15.7 for the stick at 18.87 (the building matches the stick's salience at 18.90); flow_v2 §5
  says "DC calm". Its sign is E6's giant letters. With E2's tag and #9's lit screen, three things upstage THE stick at
  ~18.9. **Fix** (`home_set.tsx`, a request to the SQA fixer): 'subject' only from 4.04 to the end of SQA's DC beat
  (~4.6), then 'support' with the sign at C contrast; the H1 window's roofs get E3's haze.

- **E9. SQD 21.0 to SQF 41.0, centre right: the notice is the highest-contrast text for 20 s** (R1 #7). Owner: "not sure
  what to keep my attention on". "~5x" (72 px) stays at full contrast through the hop, the tick and the BETTER van
  (29.9-32.84); "2027" (84 px) stays through the payoff, where the phone cuts it to a stray "027" beside the turned tag
  (38.62-41.0). **Fix:** `outside.tsx` `OutsideStreet` `faces` (drawn by kit `Fleet.tsx` `NoticeFlip`): each face at full
  contrast for ~1.5 s from its swing (27.08, 34.60), then one value down with the small lines hidden; at 36.98 a blank
  face, so the payoff is the tag and the data center only (with E5's `FaceQueue` from 23.10).

- **E10. SQF 38.62-41.15, the payoff tag: no light at all, and dash rows on its back** (R2 #4). Owner: "lighting and
  shadows should be gentle but should exist"; "too rough and messy". The light layer changes the tag by dL* 0.0 at 38.70;
  flow_v2 §5 asks for "rim left, form shade right third". E1's swap won't fix it: the plane's `RIM_WINDOW` is [1.86, 3.3]
  only, with no tag `FormShade` (still so at HEAD). The back (40.05+) draws the kit `DataCenter` with the default 'ticks'
  dash rows, blinking. **Fix** (requests to the SQA fixer): `thread_plane.tsx`: a rim window 38.62-41.15 (lamp side, 4-6
  px inside) and a `FormShade` on the tag's right third. `kit/PriceTag.tsx`: the back's `DataCenter` gets
  `ledStyle="bands"` and `blink={false}`.

- **E11. SQD's hold, SQE and SQF (21.4-41.15), the left street and the gate's pool: light that never lands** (R2 #6).
  Owner: "the light is weirdly put". The road-mouth lamp in `outside.tsx` (its lantern `EMBER.core` at (232, 956)) is lit
  but casts no pool. The gate pool's outer step #E2D6D6 renders at C* 4, a grey-pink on snow of C* 8 (CRAFT §d.7: both
  steps lighter and warmer than their ground). Warm-lit is 4.9-7.0 % of the frame, against CRAFT §d.10's 8-15 % (the
  WINDOW lane measured 4.8-5.7 %). **Fix:** `outside.tsx`: a `LightPool` from `streetLamp([232, 962], [232, 1094])` with
  two warm steps; the gate pool's steps warm: outer ~L* 87 C* 12-14, inner ~L* 91 C* 16 (one value calmer until 23.10:
  E5).

- **E12. SQB 6.5-16.6, the film's longest shot: still enough to repeat "way too empty"** (R2 #8; escalates #10 from
  optional). Owner (G5): "way too empty"; the supporting details "a bit more subtle but yet alive". density.py rates detail
  FAR (20 % against 34; obj 95); on the cozy meter 62 % of the frames have no mover (FAR; SQE 3 %). Apart from the line,
  only the snow in a 150 px window strip moves. **Fix** (`home_set.tsx`, a request to the SQA fixer): #10's 2-3 calm C
  things, plus the set's own slow life made visible in SQB's framing (skylight snow or cloud drift, one string-light bulb
  stepping every ~1.5 s); <= 3 noticeable.

- **E13. SQB 6.5-16.6 bottom corners and SQC bottom right: the desk books' shadows are unrotated rects under books turned
  -8° and +6°** (R2 #5). Owner: "too rough and messy"; "the light is weirdly put". `home_set.tsx` draws
  `DESK_BOOKS.map(... <Shadow d={rectD(bk.x, bk.y + 6, bk.w, bk.h + 6)} />)` (still so at HEAD): a dark 10-20 px wedge
  sticks out at two opposite corners of each book, a doubled, misregistered shape. **Fix** (a request to the SQA fixer):
  draw the `Shadow` inside the same `XG m={mat.about(mat.rotate(bk.rot), cx, cy)}` as `DeskBook`, offset +3 / +5 away from
  the lamp.

- **E14. SQD's hold, SQE and SQF, the mountain's right flank (x 880-940, y 770-900): the factory chimney's puffs read as
  holes in the pile** (R2 #7). Owner: "too rough and messy". `outside.tsx` `FactoryRoof` draws snow-and-sky ellipses
  (rise 120, ceil 700) from x 896, in front of the gold; S9's `HallPlume` was kept off the gold for exactly this reason.
  **Fix:** `outside.tsx` `FactoryRoof`: tint the puffs a light step of `PEAK_TONES.lit` with r1 <= 7, or move them off the
  pile.

- **E15. SQF 41.00-41.15 and the loop seam, the caption band: white captions on the pale un-built page** (R2 #10). Owner:
  "no clean transitions". The rolled-in frame-0 captions are white on the pale page, then flip to dark at the loop; the
  rule is ink on light, and the loop must land on frame 0's state. **Fix:** `SQF.tsx` `captionTone`: add a 'dark' key at
  local 4.64 (film 41.00), or at 4.49 (40.85).

**Notes (not ranked):**
- `check_light.py`: its FAILs at 18.87 are #9 plus a false positive: it counts the caption's highlight box as part of the
  caption band (mask the box).
- Evidence. R1: frames and the measuring scripts (`tools/joins.py`, `sal.py`, `movers.py`, `spikes.py`, `tagmotion.py`)
  in `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/review1/`. R2: crops, light-off/on
  pairs and `density.txt` in `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rev2/`. The
  render: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/early/film_half.mp4`.
  These are session scratch: copy what you need before the session ends.
