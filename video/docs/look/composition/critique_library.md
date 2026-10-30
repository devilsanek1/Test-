# Critique: the composition library (`COMPOSITION_SHOTS.md` Part 0 and 0b, `library_sheet.png`, `catalogue.json`, the judges)

Status: DONE (a cold read by the library critic, 2026-10-30; the critic wrote none of the library).

**Read:** `video/docs/look/COMPOSITION_SHOTS.md` (Part 0, 0b, Part 2 §0-§2 and §4-§6 in full; Part 1 and Part 2 §3
by section and by search), `composition/library_sheet.png` (all 10681 px, and `library_sheet.py`'s data),
`composition/catalogue.json` (103 entries), `composition/judges/attention.json`, `story.json`, `fit.json` (scores,
reasons, notes), `catalogue_notes.md`, `reels.md` §0-3, `motion.md` §3-4, against `OWNER_PLAYBOOK.md`, `DIRECTION.md`,
`CRAFT.md` §a, §e, `LAYOUT.md` §2 and `video/src/lib/Film.tsx`. Line numbers below are `COMPOSITION_SHOTS.md`'s as of
19:20 UTC. Px at 1080 x 1920; the feed shows x 98-982.

## Verdict

- **The spine holds.** All 41 of his ideas and T are entries under his names, in his reels' order, first in every tier
  table, each with a tier and a reason; all 14 that land RARE or NOT FOR US, plus the 6 other reel items that do, are
  in the override table (Part 0.1) with a one-line overrule. Leading lines and the vanishing point (his named
  complaint) are CORE.
- **The tier rule is applied the same way to all 103.** Recomputed from the three judges' files: 0 mismatches in tier,
  A·S·F, the mean column, the 61 Part 1 headers, the D3 table and the 24 recipes' device tiers; the sheet loads the
  judges' files directly.
- **But the spine is shown wrong where it matters most, and the guidelines stall a planner.** Six of his ideas that we
  use in EVERY shot (rule of thirds, golden section, foreground, unbalanced, soft near layer, atmospheric layers) read
  RARE or SITUATIONAL, while two of our pure layout rules sit in CORE. Three rules clash with docs that outrank this
  page (the eye jump with CRAFT; the line under the colour and the draw-on's dose with DIRECTION), one with the owner's
  newest words (the extreme wide's "you"), and the golden box has two sets of numbers. Planning a 10-shot film stalled
  at the pull-out after the hook, the second I4, the continuous camera and the device count.
- **10 MUST-FIX** (each with its exact fix), **22 SHOULD-FIX**, and a cut of about 60 % of the page (199 KB to ~80)
  into three sub-files, losing nothing (§7 of the checks).

## MUST-FIX

**M1. Six of his ideas we use in every shot read as rarely used; two of our pure rules sit in CORE.** (the spine;
lines 5-6, 58-79, 137-138, 145, 154, 158, 175, 183, 186, 1178-1189; the sheet)
- *What is wrong.* A1 Rule of thirds (RARE; in every exterior as 2:1 proportions, rule 6), C2 Foreground (RARE; rule 10
  in every shot), E5 A soft near layer (RARE; rule 10), A2 Golden section (SITUATIONAL; "the focal's home in every
  shot", rule 3), D4 Unbalanced (SITUATIONAL; rule 9 in every frame), E6 Atmospheric layers (SITUATIONAL; CRAFT §f.2 in
  every exterior). The owner will read "Foreground: RARE" as "dropped": the playbook asks that every used item be
  "visible in the output, not buried as a side note", and for these six the every-shot use comes only after the tier,
  inside the condition cell and the *Serves* line. Meanwhile N2 (the
  stage square: move "any", join "any", recipes "all") and N5 (headroom) are CORE as rules. The fit judge scored the
  same kind of entry two ways: N2 got 5 as "the 9:16 frame's own grammar", A2 got 4 as "a placement N2's zones already
  enforce rather than a tool of its own"; that one point is the whole gap between CORE (N2, sum 12) and SITUATIONAL
  (A2, sum 11). `catalogue_notes.md` §3's own rule sends a rule with no choice half to `principles.json`.
- *Fix.* (a) Add **§0.3a "Used in every shot (the frame's grammar, not ranked)"** above the frame tiers, his first in
  his order: A1 (the thirds as 2:1 proportions: rule 6), A2 (the golden box: rule 3), C2 with E5 (the near hint, soft
  by value: rule 10), D4 (one soft counterweight: rule 9), E6 (air by distance: CRAFT §f.2); then ours N1 (rule 3), N2
  (rule 2), N3 (rule 6), N5 (rule 3), N6 (rule 2), N7 (rule 5); each row "USED: every shot, rule n". (b) In 0.1 and
  0.3 the tier cell of A1, A2, C2, D4, E5, E6 reads "EVERY SHOT (rule n) · as a shot's lead device: RARE" (or
  SITUATIONAL), and 0.1's "why" cell for A1, C2, E5 starts "in every shot as rule n;". (c) N2 and N5 leave the tier
  tables (no choice half): CORE frames 17 (his 12, ours 5), CORE in all 32; re-count "In five lines" items 2-3 and
  §D4. (d) The sheet opens with an "IN EVERY SHOT" band: A1, A2, C2, D4, E5, E6 under his names, then ours.

**M2. Two different "golden boxes".** (line 542 against 612, 1207, 1430)
- Rule 14 starts every onset "inside the golden box (x 436-644, y 951-1168)" (the feed's visible stage, from
  `vertical.md`); rule 3, Part 1 and Part 2 §0 define the golden box as x 413-667, y 951-1187.
- *Fix.* Rule 14: "started inside the golden box (x 413-667, y 951-1187; on the feed its heart is x 436-644, y
  951-1168)". One name, one box everywhere.

**M3. The eye may jump 370 px across a join; CRAFT allows 220.** (lines 341, 560-561, 1852; not in Part 2 §5)
- `CRAFT.md` §a checks every join's eye jump <= 0.10 and §e defines it over the frame diagonal (2203 px): 220 px
  (`G3_ANIMATIC.md` repeats it). Rule 19, the turn row and Part 2 §4 step 5 allow 370 px on any carried join.
- *Fix.* Rule 19: "the next focal within 150 px of the last (190 px for a light match), 220 px at most (`CRAFT.md` §e:
  eye jump <= 0.10 of the 2203 px diagonal); farther only on a declared plain cut (the turn)". Turn row: "the only
  place the focal may jump > 220 px". §4 step 5: "220 px at most". Add a §5 row: "eye jump: 370 px (attention.md's
  5-degree preview) against CRAFT §a, §e (220 px): CRAFT wins".

**M4. T and RM8 put the world under the line, and draw "once per idea".** (lines 217, 977-979, 1146)
- DIRECTION 9: "colour floods in over the line (it goes under its fill: no outline stays, rule 4)", the painted pieces
  painting on stroke by stroke, the light flooding in from its source. This page: "the colour floods in under it",
  "the world flooding in under it": the reels' overlay, which leaves an outline. DIRECTION 8: a draw-on is frame 0's,
  "and after it only where the drawing is the beat"; T's *9:16* line says "once per idea".
- *Fix.* T's and RM8's wording: "the subject's line draws on in the clean pen, then the colour floods in over it and the
  line ends under its fill: no outline stays (DIRECTION 4, 9); the painted pieces paint on stroke by stroke and the light
  floods in from its source". Replace "once per idea (a mechanism drawn as a line first, a chart in step with the
  voice)" with "after frame 0 only where the drawing is the beat (a chart line in step with the voice: DIRECTION 8)".
  His name for T stays.

**M5. RM8 carries two moves with one dose.** (lines 217, 340, 343, 401, 453, 1146)
- RM8 is the draw-on (dose: "frame 0, then 0-2 where the drawing is the beat") and also "the build (pops, ticks,
  growth)" (its D3 row), which §1's explain row uses in every explain beat ("RM8 the build (one tick per unit of
  cause)") and §3's pattern row for "units pop by rows"; §1's list row pops units with no code at all. A planner
  either breaks the dose or draws a build as a draw-on, which DIRECTION 8 forbids after frame 0.
- *Fix.* Dose table: "RM8 the draw-on: frame 0, then 0-2 where the drawing is the beat (DIRECTION 8)" and a new row
  "RM8b the build (pops, ticks, grows by rows; never a draw-on): one per explain or list beat; pieces every 0.1-0.2 s,
  separate reads >= 0.5 s apart, a pop's ~7 % overshoot at ~12 f". §1's explain and list rows and §3's pattern row say
  RM8b. (Or restore `motion.md`'s I10 "The build" as its own code, scored as RM8 was.)

**M6. The one big move is "exactly 1", yet the payoff takes a second I4; and an ordinary pull-out has no code.**
(lines 220, 344, 454, 1287)
- I4 is "the pull-back, the one big move (S5)", dosed "exactly 1". SR24 (the payoff) and §1's payoff row also use I4
  ("a pull back"; "I4 back out to the matched frame"): a film with a scale reveal and SR24 has two. And after a hook
  close, the way out to the home wide in the same place has no code: RJ4 is capped at 1.15x or 150 px (Film's
  camera-continuous), RM4 is push-in only, and J2's "pull-out" is only the second leg of a push-through into a new
  place (`motion.md` J2: the next scene pulls back out of its own point).
- *Fix.* Part 0.4's I4 row: "I4 The pull-back: a story pull, <= ~2.3x continuous, carrying its own event (rule 18); at
  full scale it is S5, the one big move". Dose table: "I4, a story pull-back: 0-2 a film, never next to the big move"
  and "the one big move, S5 (I4 at scale) or S1 (I6): exactly 1". SR24 and the payoff row: "I4 (a story pull, not the
  big move)". J2's row: "the pull-out is the push-through's second leg (0.6 s, 36 f, out-cubic), never a pull-back on
  its own".

**M7. A film on one continuous camera has no rules, and video 4 is one.** (lines 253, 359, 411-414)
- Video 4's G2.5 script is "12 shots on one continuous camera" (`video/docs/v4/STYLE_FIT_2026-10-30.md`), the library's
  first use. Part 0.5 says RJ4 covers "any change inside one place (closer, wider, along it)"; §3 caps it at <= 1.15x or
  150 px; §2.1 says "a C move inside a panel keeps one shot". So 12 continuous "shots" are one shot: §2's 3.5 s
  average, the 6-9 devices and every join dose count nothing, and a 2x change between two of them has no home.
- *Fix.* RJ4's row: "a small change inside one place (at a seam <= 1.15x or 150 px; larger changes are a move inside
  one panel)". Add §2 item 7: "**A film on one continuous camera.** Each beat's framing is a STOP and counts as a shot
  for items 1-4 and the dose table. Between two stops the camera makes the in-shot move that fits (RM4 <= 2x in, I4 a
  story pull out, I5 a tilt, I6 a rise, RM3 a follow), its midpoint on the next sentence's first word, landing >= 30 f
  before the stop's onset; the change counts as a C join in the join doses. RJ4 (Film's camera-continuous) only where
  two panels meet."

**M8. The sheet renames two of his ideas.** (`library_sheet.py` line 88-94, SHORTNAME)
- D4 is tiled "The steelyard" (his: "Unbalanced"); D7 "Pattern, one break" (his: "Patterns / repetition"). The
  playbook: his items "in their order and names".
- *Fix.* SHORTNAME D4 -> "Unbalanced", D7 -> "Patterns / repetition" (ours may follow as a subtitle); re-render
  `library_sheet.png`. While there: E1 -> "One small figure where the lines meet", E10 -> "The near 'you' over the
  shoulder" (Part 0's names).

**M9. The device count cannot be applied.** (lines 338, 366-369)
- §2.3: "6-9 different frame devices: 4-6 CORE, 2-3 SITUATIONAL, 0-2 RARE", "one device leads each shot". The hook row
  names five CORE codes for one shot (T, N7, N1, E2 or C1, E8), and N1, N2, N5, N7 are every-shot rules, so nothing
  says which code is a shot's lead. My 10-shot plan (§3 below) had 8 leads: 7 CORE (over the 4-6 cap, for no stated
  reason) and 1 SITUATIONAL (under the 2-3 floor).
- *Fix.* §2.3: "Count LEAD devices only: one per shot, the code named first in the shot's row of the camera plan; the
  every-shot grammar (§0.3a, M1) never counts. A 10-12-shot film uses 6-9 different leads, >= 7 in 10 shots led by a
  CORE device, at most 2 RARE (each once), never a NOT FOR US one; the home place's lead returns with it (N14), any
  other lead at most twice, never in neighbouring shots." Drop the 4-6 and 2-3 sub-ranges. Hook row: "lead E2 (or
  C1), drawn by T as RM8; keeps N1, N7, E8".

**M10. The extreme wide's "you" is 60-150 px; the owner's newest words say ~130-220 and "never a far panorama".**
(lines 168, 526, 829, 1088, 1626; not in Part 2 §5)
- Playbook DEPTH AND SCALE FROM A HUMAN VIEWPOINT (2026-10-29, the newest owner note on this; DIRECTION 7): "the camera
  stands where a person would stand, near a person at a real size" (~130-220 px), "never a far panorama", "the scale
  comes from a near human figure against a far, big world, not from moving the camera away". Z1 and rule 11 take
  `LAYOUT.md` §2's K-wide observer (60-150 px, "always the 'you'"), a lower doc.
- *Fix.* Z1 and rule 11: "the 'you' 130-220 px near the camera (S5's end 170-200 px); the scale from the world past
  every edge and tiny strangers 15-60 px". D2's *9:16* line and SR15's layout ("60-150 px in a K wide", "an anchor
  60-150 px in a K wide") -> "the 'you' 130-220 px; strangers 15-60 px as the tiny anchors".
  Add a §5 row: "the K wides' 'you' 60-150 px (`LAYOUT.md` §2) against the playbook's DEPTH AND SCALE: the owner's words
  win; LAYOUT to fix in the same turn (CLAUDE.md: a clash is a bug)".

## SHOULD-FIX

**The ranking's method and how it reads**
- **S1. The tier rule's text has an overlap and a hole** (lines 99-104). "RARE ... or any lens at 1" also matches
  A4, D3 (1·2·2), J9 (2·2·1) and every 1·1·1, which are NOT FOR US; and a sum of 12 with a lens at 2 (5·5·2) has no
  tier. *Fix:* "CORE: sum >= 12, no lens under 3. SITUATIONAL: sum 9-11 with no lens under 2, or sum >= 12 with a lens
  at 2. RARE: sum 6-8, or sum 9-11 with a lens at 1. NOT FOR US: sum <= 5." (No result changes: recomputed.)
- **S2. "Blind" is overstated** (lines 91-92). The attention judge's grounding doc, `attention.md` §7, had already
  scored the owner's 41 for attention, and its notes list the 10 it moved (C1, E1, D1, E3, D4, E5, E10, B5, B12, B13).
  *Fix:* "blind to each other and to `catalogue_prior.json`; the attention judge started from `attention.md` §7's
  scores of his 41 and moved 10 (its notes)".
- **S3. "22 of the 24 would change tier if their outlying lens were dropped"** (line 295) holds only if EITHER the
  highest or the lowest lens may be dropped; dropping only the highest changes 14, only the lowest 10. *Fix:* say "if
  either extreme lens were dropped".
- **S4. 28 of his 42 sit one judge-point from a tier line, and nothing says so.** Sum 12 (CORE by one point): B1, B2,
  B4, D2, E7 (and ours N2, N5, Z4, RM7, RJ3, J11); sum 11 (one short of CORE): A2, A7, E1, E4, E6, E10, E11 (and N13,
  Z3, J6, J7, J15); sum 9 (SITUATIONAL by one): B3, B8, B9, B10, B11, D4; sum 8 (one short): B5, B6, B13, D5, D6, E5;
  sum 6 (RARE by one): A5, B7; sum 5 (NOT FOR US, one short of RARE): A4, D3. One judge per lens, no second read:
  leading lines (3·4·5) are CORE by a single point. *Fix:* mark these "(edge)" after their A·S·F in Part 0 and say in
  0.2 that an edge tier is the owner's to settle in one line; or a second judge per lens re-scores only the edge
  entries (52 of the 103).
- **S5. Attention 1 means "does nothing" as well as "hurts"** (the judge's scale; its own note: "A1, A3, A4, A5, C2 do
  nothing for the eye rather than harm it"). "Rule of thirds 1·3·3" reads to the owner as harm. *Fix:* in 0.1's header,
  "attention 1 = does nothing for the eye or hurts; for A1, A3, A5, C2 it is the first".
- **S6. The "modern cinematography" he asked to rank has no column.** He asked for his references, what makes a frame
  engaging and attention-capturing, and "super modern cinematography", all ranked. Attention is a lens; modern enters
  only through the story judge's grounding, and the `modern.md` 0-15 scores sit unused in `catalogue_prior.json`; and
  "ours" lumps four strands. *Fix:* tag each "ours" row with its strand ([attention], [modern], [classic], [our docs])
  and show the `modern.md` score beside A·S·F where one exists (no tier change); or say in 0.2 why modern is not a lens.

**The guidelines (where the 10-shot plan stalled; §3 below)**
- **S7. §1's beat rows offer 6-12 frames each with no way to pick one** (the setup row names 12). The pick lives in
  Part 2 §2's recipe table, which §1 never points to. *Fix:* a "recipes" column in §1: hook SR1; setup SR2-SR5;
  explain SR8-SR11, SR20; turn SR18, SR19; reveal SR14-SR17; list or comparison SR20-SR22; payoff SR23, SR24, SR13;
  loop SR1 (as frame 0).
- **S8. Joins are picked by device, but a planner knows what changes.** `motion.md` §4.3's ten-row "which join for
  which change" table (closer or wider -> RJ4; into a place through an opening -> J2; another place with the thread ->
  J3/J4; a traveller -> J7; a hidden jump -> J8; this becomes that -> J10; time passes -> J11; to the proof -> J13 or J2
  into paper; the turn -> RJ2; the end -> RJ3) is the fastest answer to "how transitions fit". *Fix:* put it at the head
  of §3, with Part 0's codes.
- **S9. Where to rest after the big move is self-contradictory** (line 380): "after a dense or a scale beat, a breather
  ... never next to the big move", and the big move is a scale beat. *Fix:* "after the big move its landing hold (>= 30
  f) is the rest; a breather (D1, S2, 2.5-3 s) follows another scale or dense beat, never directly before or after the
  big move".
- **S10. The focal's height has four ranges** (rule 3 y 950-1050; N5 y 856-1006; the golden box y 951-1187; R7 y
  860-1200). *Fix:* one target, y 951-1006 (where the drop and the golden box meet), and one allowed range, y 860-1200;
  every other mention points to rule 3.
- **S11. A one-screen planning card.** A 10-shot plan with numbers needs Part 0b (253 lines of dense codes) plus Part 2
  §2 and Part 0b §3's numbers, ~45 KB: more than 10 minutes of careful reading before planning starts. *Fix:* a card
  at the head of Part 0b: Part 2 §4's six steps, a beat -> recipe -> lead -> move -> join table (S7, S8), the dose
  table, the five numbers every shot keeps (focal home, drop, band, read window, onsets).

**The motion grammar**
- **S12. RM4's floor sits at the rate the library calls frozen** (lines 556, 1314, 1372, 1466, 1613). ">= 3 % in <= 2
  s" is 1.5 %/s; `motion.md` I3 puts the floor at "~1.5 % a second" and the D3 row says the reels' 1.4 %/s push "reads
  frozen" while 2.6 %/s "is visible". The playbook: a subtle effect counts as none. *Fix (proposal, with a §5 row
  against `COZY_AND_SCALE.md` 3b.5's 3 %):* ">= 5 % in <= 2 s (>= 2.5 %/s)".
- **S13. "A lean-in out-cubic" starts at peak speed** (line 395), against "never a linear camera start" (line 432).
  *Fix:* "an out-cubic lean-in only when the push starts on a cut or as a join's incoming leg; inside a held shot,
  in-out cubic".
- **S14. J11's carrier is "the light, in place"** (lines 259, 400), not one of DIRECTION 1's A-F, and `CRAFT.md` §a has
  every join name a letter. *Fix:* "J11 inside one panel is no join (no letter); across a cut it is B (the same frame
  matched)".
- **S15. No picture of a move or a join.** The sheet draws frames only; the 36 moves and joins are labels. *Fix (an
  ITERATION job, rough, about an hour):* a grey 60 fps strip or clip, 2-3 s per CORE move and join (RM1, RM4, RM6, RM7,
  RM8, I4, I11, I12, RJ3, RJ4, J2, J3, J4, J10, J11) on one home frame, each with its numbers burned in.

**Numbers for our frame**
- **S16. Rule 6 says "never y 900-1020" without the deferral** (lines 503-506, 1012): `LAYOUT.md` §2's street (y
  960-1152) and eye-height scale horizons (y 998-1133) win (§5 row 5), but a planner reading rule 6 obeys "never".
  *Fix:* "(until approved, `LAYOUT.md` §2's street 0.50-0.60 H and eye-height scale 0.52-0.59 H stand: Part 2 §5 row 5)".
- **S17. "The read zone" is used but never defined here** (lines 67, 79, 197, 606, 618, 630, 1215). *Fix:* "the read
  zone (y 600-1250, the ad-cut floor: `reels.md` §0)" once in the Conventions, or write "the ad-cut floor (y 1250)".
  A4's "in the band (y 483-656)": 655 is 55 px under the band; write "at or just under the band (y 482 / 655)".
- **S18. Small doses and conditions.** J8 "1-2 at most" (line 462) reads as required: "0-2". D2's ">= 10:1 over a
  130-220 px figure" needs a 1300-2200 px giant: add "(its full height, cut by the top: LAYOUT K7)" in Part 0's row.

**The sheets**
- **S19. Seven tiles show the plain cut as "the join it offers to the next one"** (`library_sheet.py` PAIR: D2, B11,
  N11, A5, B6, N15, M3); Part 0 gives RJ2 as their way IN (D2 "RJ2 in, J2 back"; N15, M3 "in by RJ2"). A CORE scale
  frame advertising a plain cut also undercuts DIRECTION 7 (a scale beat never arrives by a plain cut except on a
  "But"). *Fix:* show the join out (D2 J2; B11, N11 RJ4; A5, B6, N15, M3 J3 or RJ4 home) with "in: RJ2" as a tag.
- **S20. Three tiles break their own rules.** Z4 draws the "paper" ~32 % of the stage wide with a ~180 px number on
  the giant computer (its rule: >= 60 %, 120-160 px, paper); B5's and B6's lines run into the band (y ~540-570) against
  rule 2 and B5's own "below y 600"; N9's tile is a building filling the stage up close (N1's nearly so), the "wall in
  your face" the playbook rejects ("suffocating"). *Fix:* redraw those tiles; N9's condition adds "an object (a mug, a
  radiator, a phone), never a building or a wall".
- **S21. `devices_sheet.png` still prints the first library's verdicts** (A4 and D3 "ADAPT", C2 "YES"), against the
  tiers, and §D4 still points to it. *Fix:* relabel it from the judges (as `library_sheet.py` loads them) or stamp it
  "first library, verdicts superseded".
- **S22. The sheet's E-tiles use short names that differ from Part 0** (E9 "Held frame, the subject travels" for "The
  camera holds; the subject travels the device's line"). *Fix:* Part 0's names, wrapped (with M8).

## What works (keep it)

- **The spine, structurally.** His 41 and T are entries with his names (two sheet labels aside: M8), in `reels.md`'s
  order, first in every tier table and on the sheet; his other 16 reel items (X1-X3, RM1-RM9, RJ1-RJ4) are entries too;
  merges went INTO his entries (N4 -> B10, N8 -> B8, N10 -> E3), never the other way. His ideas are 19 of the 34 CORE.
- **The override table at the very top** (0.1): each low one with its scores, a reason in our frame's numbers and what
  we use instead, overruled in one line ("A4 SITUATIONAL"), with the recipe variants that come back named. The owner
  can see and reverse every demotion in a minute.
- **One rule, no hand moves, and the evidence kept.** The tiers, scores and means reproduce exactly from the judges'
  files; each judge's file has its scale, a reason per entry, its distribution and a check of the owner's against ours
  (attention 2.84 vs 3.07, fit 3.57 vs 3.20, story 11 vs 8 fives); 0.6 says why the lenses split.
- **"A tier says how readily, not how often; the owner's doses stand whatever the tier"** (0.2): the right guard, it
  keeps the one big move CORE and once, the cozy home >= 50 %.
- **The motion grammar's core idea** (0b §3): "a frame's device already holds its motion" (lines are a path, an opening
  a portal, a fixed shape an anchor, a tall thing a tilt, a near layer a wiper, a quiet field a hold), so a shot is
  planned frame -> move -> join -> carrier -> timing. That is the answer to "how animations and transitions fit"; with
  60 fps frame counts, named easing curves, one speed budget, the join on the next sentence's first word, the sound tied
  in (`SOUND_SYNC.md` wins) and a dose table that names its source per row.
- **Part 2 §5's clash table** (28 rows, each with the doc that wins and what the page does until then) and §4's pass,
  whose Helsinki example already catches a real fault (two follows in a row: video 4's shots S10 and S11).
- **NOT FOR US is honest:** each with a reason and an "instead", the reels' own fade, black card, title and handheld
  among them, and the doc in force named.
- **Numbers checked and right:** the thirds x 360 / 720 (x 393 / 687 on the feed), the phi lines x 413 / 667, y 733 /
  1187 (the stage square's 951 / 1169), the diagonals 60.6 and 40.4 degrees, the stage square's eyes (454, 987) and
  (626, 1133), 226 px apart, E2's 67 L* step, RM1's ~144 px/s for a 180 px walker, RM5's 0.13-0.25 px/f, I4's 156 +
  42 f = DIRECTION 7's 2.6 + 0.7 s, J2's 30 + 36 f, RJ4 = `Film.tsx`'s camCont (0.7 s before the cut, 1.4 s after,
  <= 1.15x or 150 px), I5's front-loaded trapezoid, the trapezoid(0.25, 0.35) peak of 1.43x the mean, every count in
  "In five lines", 0.3-0.5 and §D4.

## The checks, in detail

### 1. The spine
- His 41 (A1-A7, B1-B13, C1-C3, D1-D7, E1-E11) and T: all 42 in `catalogue.json` (`source: "owner"`), in Part 0 with a
  tier and A·S·F, in Part 1 §D1 with a header, a reference (reel and time) and a reason. Names match `reels.md` §3 in
  Part 0 and Part 1; on the sheet D4 and D7 do not (M8).
- Low tiers: 12 RARE (A1, A3, A5, B5, B6, B7, B12, B13, C2, D5, D6, E5) and 2 NOT FOR US (A4, D3): all 14 in 0.1; the 6
  other reel items that land low (RJ2 RARE; X1, X2, RM9, RJ1, X3 NOT FOR US) under the rule line. Complete.
- Coverage in the playbook's terms (USED / ADAPTED / REJECTED): REJECTED = NOT FOR US, each with a reason; USED and
  ADAPTED = the Part 1 headers ("used as it is" / "adapted"), with the recipes in Part 0's last column. The gap is
  visibility: the six used in every shot read as rare (M1).

### 2. The tier rule, recomputed
- Method: the sum of the three judges' scores per id from `judges/*.json`; CORE sum >= 12 and min >= 3; SITUATIONAL 9-11
  and min >= 2; NOT FOR US <= 5; else RARE. Compared with Part 0's tables (tier, A·S·F, mean), the 61 Part 1 frame
  headers (X1, X2, X4, X5, X7, X8 have none: listed in 0.3 and Part 2 §3 only), the D3 table (36 moves and joins) and
  the device tiers of SR1-SR24. **Mismatches: 0.** Counts: frames 19 / 24 / 16 / 8, moves 8 / 5 / 0 / 4, joins 7 / 6 /
  2 / 4; his 41 and T 12 / 16 / 12 / 2 (with X1 and X2, his frames 12 / 16 / 12 / 4), his moves 5 / 3 / 0 / 1, his
  joins 2 / 0 / 1 / 2. The lowest-lens guard never acts (as 0.2 says).
- What the recomputation exposes is not a mismatch but fragility (S4) and a scope error (M1: the same kind of entry
  judged as a rule for ours and as a device for his).

### 3. The 10-minute test: a 40 s explainer in 10 shots from Part 0b alone
The film: video 4's story as the library describes it (a snowy night in Helsinki, the warm water the thread, the one
window its home spot, the giant computer by the harbour), cut to 10 shots. What I could plan, and where I stopped:

| # | s | beat | lead frame · recipe | move | join out | stuck? |
|---|---|---|---|---|---|---|
| 1 | 0-3.5 | hook: the lit window | E2 · SR1 | RM8 draw-on 0-1.2 s; RM6 the window lights on its word ~2 s | ? | **A** |
| 2 | 3.5-8 | setup: the street, snow | B2 + E7 · SR3 | RM7; RM1 the "you" walks to the door | J3 on the window (B) | **B** |
| 3 | 8-12 | explain: the computer by the harbour | D2 · SR15 | I5 tilt-up 3.5-4.5 s | J3 on the glow (B) | |
| 4 | 12-16 | explain: its heat into the water | C3 · SR11 | I11 from the computer to the pipe | RJ4 (C) | |
| 5 | 16-20 | explain: the water runs to the homes | E9 · SR20 | RM1 the warm front travels the melt line | J7 (D) | |
| 6 | 20-24 | scale: a city of homes | D2 · SR17 | I4 = S5, 2.6 + 0.7 s, I12 the pivot | J2 back home (A) | **C** |
| 7 | 24-27 | turn: "But ..." | N14 · SR19 | RM7 0.5-1.0 s; I11 the glow goes out | J11 | **D** |
| 8 | 27-31 | proof: 2027 | Z4 · SR22 (on the phone in hand, E11) | RM8 the number in step | J2 (A) | |
| 9 | 31-36 | payoff: the window, the tea | E2 + E8 · SR24 | "I4 a pull back" | RJ3 | **E** |
| 10 | 36-40 | loop | T · SR1 | RM7, then the un-build 0.5 s | RJ3 | **F** |

- **A** From a >= 400 px window to the lane is a 2-3x pull-out in one place: RJ4 is capped at 1.15x or 150 px, RM4 is
  push-in only, I4 is the one big move, J2 needs an opening to enter. No code fits (M6, M7).
- **B** The setup row offers 12 frames; the pick came only from Part 2 §2's recipe table (S7).
- **C** "After a scale beat, a breather ... never next to the big move": shot 6 is both (S9).
- **D** J11 has no carrier letter for the board JSON (S14).
- **E** SR24's I4 is a second "one big move" (M6).
- **F** The count: 8 lead devices, 7 CORE (cap 4-6) and 1 SITUATIONAL (floor 2-3), and the hook row's five CORE codes
  for one shot left the "lead" undefined (M9).
- Time: the reading alone (Part 0b's 253 lines, then Part 2 §2 and Part 0b §3 for numbers) is past the 10-minute
  budget (S11). With M6, M7, M9, S7, S8 and S9 fixed, every stop above has an answer on one screen.

### 4. Does the motion grammar answer "how animations and transitions fit"?
Yes in principle: the frame -> move -> join -> carrier -> timing chain, the voice timing, the speeds, the easing, the
sound and the dose are all there, in 60 fps numbers. Not yet in practice: two codes carry two jobs each (RM8: M5; I4:
M6), the continuous camera has no rules (M7), the join is picked by device instead of by what changes (S8), one ease
starts hard (S13), one join has no carrier letter (S14), the push floor sits at the frozen rate (S12), and nothing shows
a move or a join (S15).

### 5. Conflicts with the owner's words and with DIRECTION (not already in Part 2 §5)
- The owner's words: the six every-shot ideas shown as rarely used against "every used item is visible in the output"
  (M1); the extreme wide's 60-150 px "you" against DEPTH AND SCALE (M10); the sheet's renamed D4 and D7 against "in
  their order and names" (M8); N9's building tile against "never a wall in your face" (S20).
- DIRECTION: the line under the colour and "once per idea" against rules 4, 8, 9 (M4); the build counted as the
  draw-on against rule 8 (M5); J11's carrier against rule 1 (S14); the D2 tile's plain cut against rule 7 (S19).
- CRAFT (above this page): the eye jump (M3).

### 6. Numbers wrong for our frame or the crop
M2 (two golden boxes), M3 (370 px vs 220), M10 (60-150 px), S10 (four focal heights), S12 (the push floor), S16
(rule 6's "never" over LAYOUT's horizons), S17 (the undefined read zone; 655 is not in the band), S18 (J8's dose, D2's
10:1), S20 (Z4's 32 % paper, B5 and B6 into the band). The crop numbers themselves (x 98-982, the rails x 877-954 from y
1032 and TikTok's from y 797, the name block from y 1519, key reads x 130-945 to y 860 then x 130-870 to y 1519) are
right and consistent across rules 1, 9, 13, Part 2 §0 and the judges.

### 7. Bloat: what to cut
The page is 1920 lines, 199 KB (~50k tokens per read, and every agent of the Helsinki pass reads it):

| part | lines | KB | verdict |
|---|---|---|---|
| Part 0 (ranked tables, override, splits) | 270 | 33 | keep; move 0.6 (the splits, 41 lines) to `catalogue_notes.md` |
| Part 0b (guidelines, rules) | 253 | 29 | keep; merge §3's "Shared by every move and join" into rules 14-21 (they repeat timing, easing, speed and sound nearly word for word) |
| Part 1 (the catalogue in detail) | 615 | 55 | move to `composition/catalogue_detail.md` (it repeats `catalogue.json`'s what, numbers and ref, and Part 0's conditions); keep a 3-line pointer |
| Part 2 §0-§2 (numbers, recipe table) | 95 | 12 | keep |
| Part 2 §3 (recipe prose, SR1-SR24) | 544 | 49 | move to `composition/recipes.md`; §2's one-line table stays |
| Part 2 §4 (the pass) | 31 | 3 | keep (with S11's card) |
| Part 2 §5 (clashes) | 40 | 10 | move to `composition/library_clashes.md`; the 14 rows open since the first library go to HANDOFF's queue for the owner |

The main page becomes ~650 lines, ~80 KB: Part 0, 0b, Part 2 §0, §2, §4; nothing is lost and his 41 stay visible
on it.
