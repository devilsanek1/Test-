# Video 4: doc reconcile after phase A (2026-10-30)

The clashes phase A flagged (the W1 world bible's §7 "Flags for the orchestrator"; the visual script agent's flags on
TYPE_GUIDE R4/R7/R9 and THROUGHLINE), fixed in the LOWER doc per CLAUDE.md's order (owner's words > DIRECTION > CRAFT >
PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > look/*.md > the film's own docs' values; the film's world bible and visual
script decide the film's own values). Every edit minimal. Not touched: code and data, `visual/COMPOSITION_PASS.md`,
`look/COMPOSITION_SHOTS.md` (the study session's), the camera plan's numbers beyond the horizon.

Status: DONE (2026-10-30). Sections 1-2 answer the flags; section 3 fixes what plainly contradicted a higher doc on
the way (each in the lower doc); section 4 lists what is not ours to fix here, for the orchestrator.

## Edits (doc, line, before -> after, why)

### 1. The world bible's flags (`WORLD_BIBLE.md` §7)

**1a. `docs/look/CRAFT.md` §d.2, line 273-276 (the night-exterior row).**
- Before: "Night exterior: lit windows and bulbs 85-92; pools 88-91 on ground snow at 83-85; sky-facing snow caps 87-89,
  thin, never above the pool core (a sky at ~45 lights them); sky ~45."
- After: "Night exterior, the high-key snowy night (video 3's rework): lit windows and bulbs 85-92; [the same numbers];
  sky ~45. A dark-key night (T3, `ORGANIC.md` §8) takes its night values from its film's world bible, inside this
  section's rules (video 4: `docs/v4/WORLD_BIBLE.md` §2-§3)."
- Why: the row is v3's high-key night (snow 83-85) and predates the dark key T3 (decided 2026-10-30 under the owner's
  hand-over, `ORGANIC.md` §8) and the type guide's night band (L* 31); read as the only night it contradicts both. The
  numbers stand for a high-key night; a T3 night (video 4: snow 31-50, the band 31, the window 95) is its world
  bible's, which still obeys every §d rule (light lighter than what it lights, one story light, the brightest 5 % on
  the subject).

**1b. `docs/look/CRAFT.md` §g.1, line 557-560 (the zenith note).**
- Before: "... (v7 takes sky top B, #afb3d8, L* 75.9 over a field of ~82: the owner saw no difference between A and B,
  so the call was ours, 2026-10-30, by the playbook's "Never ask the owner to choose between options they can't tell
  apart"), the caption field FLAT ..."
- After: the same parenthesis, then "; a dark key's zenith: video 4's night keeps 5.6 L* under its band, inside the
  cap, `docs/v4/WORLD_BIBLE.md` §3, while v7a's T3 still went 17 deeper, 60 against 77, with `check_banding.py` PASS on
  the still and the master encode still due, flagged in `docs/studies/2026-10-28_city_posters/paint_test/NOTES.md`
  v7a)".
- Why: W1's flag (this film keeps 5.6, inside "up to ~6 L*"; v7a's T3 went 17 and stays flagged there). The note says
  where both dark-key cases stand without moving the cap: v4 needs no exception, v7a's still is not a film yet.

**1c. Pip's colour: one rule for `docs/look/LIFE_AND_DENSITY.md` §5 (line 168-172) and `docs/look/ORGANIC.md` R12 (line
384-385).**
- Before (LIFE §5): "a colourway ... that stays its own hue (ΔE76 >= 20 from every ground it sits on, never the hero or
  the pop colour)". Before (R12): "Pip hides inside a mass of the busy belt, tone-on-tone, >= 250 px from the focal".
- After (LIFE §5): "(never the hero or the pop colour; ONE rule with `ORGANIC.md` R12: ΔE76 >= 20 from the field it is
  seen against, so a second look finds it, while its value stays close to the seat it sits in, so at a squint it joins
  that mass and makes no call; video 4: lavender, L* 56, on its balcony's snow, L* 60, ΔE ~15, seen against the slate
  facade, ΔE ~39: `docs/v4/WORLD_BIBLE.md` §1.1, §7)". After (R12): "tone-on-tone with the seat it sits in (its own
  hue still dE76 >= 20 off the field behind it: `LIFE_AND_DENSITY.md` §5's one rule)".
- Why: read literally, "ΔE >= 20 from every ground" and "tone-on-tone" cannot both hold. Both look docs, each on its
  own topic, and each half serves the owner's "hidden on purpose ... found on a second look" (DIRECTION rule 2): R12
  keeps Pip out of the calls at a squint (the newer SCENE COMPOSITION words), LIFE §5 keeps it findable. The bible met
  both by splitting the neighbours: its seat (the balcony's snow under it, ΔE 14.8, lit side 4 L* under it) and the
  field behind it (the slate facade, ΔE 39.2): measured here on `world/palette_v4.json`'s hexes (CIE76). No number is
  set for "close": the check is R3's (Pip is never one of the frame's calls).

**1d. The horizon: y 1150 (W1 §1.0, §7 call 6; `world/palette_v4.json` `camera_home_place`).**
- `docs/v4/visual/VISUAL_SCRIPT.md`, "For the orchestrator", the horizon line (309). Before: "W1 sets y 1170 (0.61 H),
  18 px under `LAYOUT.md` §2's street range (to y 1152): y 1150 would meet both (W1's call; the camera plan follows
  W1)." After: "W1 sets y 1150 (0.60 H, its call 6), inside `LAYOUT.md` §2's street range (to y 1152) and the
  library's setup A (from y 1150), so it meets both (the camera plan follows W1)."
- The same doc, the W1 re-check line (310). Before: "216 x 378 px, its foot at y ~1256". After: "216 x 378 px, its foot
  at y ~1236 on the 1150 horizon" (1150 + 1856 / 21.5 = 1236; ~1256 was the 1170 camera's).
- The same doc, "The folds", the composition pass's "Fixed, and why" (276), the ONE governing line added after (h):
  "(i) the horizon: W1's y 1150 governs over the pass's 1170 (`WORLD_BIBLE.md` §1.0, its call 6: inside `LAYOUT.md`
  §2's street range, to y 1152, and the library's setup A, from y 1150; the camera plan carries it; reconcile,
  2026-10-30)." No shot changes (the blocks name no horizon), so the lock stands.
- The same doc, the section head (304): "## For the orchestrator (... ; answered 2026-10-30: `../production/RECONCILE.md`)".
- `docs/v4/camera_plan_g3.md` §1, the camera (21-26), and §5's `vp` (440): before "horizon **y 1170**, one-point, VP
  (540, 1170); ... its foot at y 1170 + 1856/d ... Flag: y 1170 is 0.61 H, 18 px under `LAYOUT.md` §2's street range
  (to y 1152); y 1150 would meet both (W1's call)." and "`vp: [540, 1170]`"; after "horizon **y 1150**, one-point, VP
  (540, 1150); ... its foot at y 1150 + 1856/d ... W1 made the call (§7 call 6): y 1150, 0.60 H, meets `LAYOUT.md` §2's
  street range (to y 1152) and setup A (from y 1150); this plan's other px were laid on y 1170 (2026-10-30 reconcile:
  only the horizon changed here), so its 1x positions sit about 20 px under W1 §1.0-§1.1's: G3's thumbnails (step 3)
  move them, as the status line says." and "`vp: [540, 1150]`".
- `docs/v4/WORLD_BIBLE.md` §7, the flags' head: "(not edited here)" -> "(not edited here; answered 2026-10-30 in
  `production/RECONCILE.md`)".
- Why: W1 decides the film's camera ("every size in §1 follows it, and the camera plan takes it"); the plan says "W1
  §1.0, kept" yet carried 1170 (W1's §7 claimed it already carried 1150), and v3's flag line still read 1170. 1150 meets
  both `LAYOUT.md` §2 (<= 1152) and the library's setup A (>= 1150). Not edited: `visual/COMPOSITION_PASS.md` (the
  study session's; its 1170 is governed by v3's line (i), which joins v3's fixes (a)-(h) for its fix pass) and every
  camera-plan number but the horizon (its 1x table, e.g. the computer y 878-1256, the harbour y 1170-1205, the
  resident's feet ~1340, is G3's to move; W1 §1.0-§1.1 gives them on 1150: the computer 858-1236, the harbour
  ~1152-1181, her feet ~1319). Checked (before the G3 lanes' builders exist): no code or data carries a horizon
  yet (`public/v4/animatic.json`, `public/v4/lanes/`, `scripts/v4/`).

### 2. The visual script agent's flags (`VISUAL_SCRIPT.md`, "For the orchestrator")

**2a. `docs/look/TYPE_GUIDE.md` R4, line 161-164 (video 4's example).**
- Before: "S7 (23.46-25.54, the turn: WIDE, the dive lands on "WANTS" and holds while the pen draws the plan's pipe out
  toward the computer): "But Helsinki" pops at 23.417 s (frame 1405) · "wants" at 23.967 s (frame 1438, 2 frames before
  its word) · ..."
- After: "S7 (23.46-25.54, the turn: WIDE, after the film's one plain cut, a small settle in lands on "WANTS" and holds
  while the plan's stretch is drawn out toward the computer): "But Helsinki" pops on the cut at 23.367 s (frame 1402:
  the group changes within 2 frames of it) · "wants" at 24.000 s (frame 1440, 2 frames before its word) · "that heat."
  at 24.583 s (frame 1475) · all until 25.500 s (frame 1530)."
- Why: v3 S7 has no dive (the plain cut at 23.37, f1402, then a 1.04x settle landing on "WANTS"), what is drawn is
  "the plan's stretch" (by the brush, never a pen), and v3 asks "the group changes within 2 frames of the cut"; f1405
  is 3 after.
  "WANTS" starts at 24.04 in the locked take (f1442), so 2 frames before is f1440, the guide's own rule; the production
  captions (`public/v4/captions2.json` g18) already play exactly these frames. The picture's action is named without
  "brush" here, since in this guide "the brush" is the retired type face.

**2b. `docs/look/TYPE_GUIDE.md` R7, line 204-208 (video 4's example).**
- Before: "S8 (25.54-28.34, MEDIUM: the plan, walls only marked out; the slow push lands on "plan" 26.18): ... pinned to
  the plan's front wall on the subject axis below the computer's middle: "2027", until S9's push takes it out of the
  frame's bottom (by "would", 29.02)."
- After: "S8 (... ; the push lands on "has" 25.80, the walls stand out on "plan" 26.18): ... on the subject axis at the
  computer's middle: "2027", until S9's dolly takes it out of the frame's bottom (by "how", 28.70)."
- Why: v3 S8's push runs from the end of "heat." to "has" (25.80) with the walls' light pull on "plan"; the tag sits at
  the computer's middle (the drop's 650 px limit: v3, the camera plan's (540, 1150), drop 594); S9's dolly slides it
  out by "how" (v3 S8 Words, `captions2.json` w1 "until": 28.7). The caption's seat C and times (27.033-28.300) already
  matched (`captions2.json` g20).

**2c. `docs/look/TYPE_GUIDE.md` R9, lines 229, 231, 234.**
- Before: "your gloved hand and phone at the bottom right"; ""heat" in the lit hand, honey, at 39.900 s (frame 2394, 2
  frames before its word)"; Checks: "clear of the phone (bottom right)".
- After: "at the bottom left"; "at 39.933 s (frame 2396, 2 frames before its word)"; "clear of the phone (bottom left)".
- Why: v3's delegated call 9 moved the phone to the bottom left (Instagram's buttons run down the right; SR13, E11).
  "heat" starts at 39.98 in the locked take, so the pop is f2396 by the guide's rule (as `captions2.json` g29 plays it);
  2394 came from an earlier word time. The other R9 times (38.433, 39.367, 40.217, held to f2515) already matched.

**2d. Leftover brush wording after the pleasantness pass: `docs/look/TYPE_GUIDE.md` §i, line 368-370 (a head note).**
- Before: §i's bullets ("The brush's comma", "The brush's real size: ... R3 is now 300 px (figures ~136 px), centred
  near x 440", "its brush to 184 px", "R10: ... the brush 250 px", "Still 14 added: the brush write-on") read as current
  numbers after the owner's last note retired the brush.
- After (one note under the heading): "The bullets before the owner's note (the last) are the brush era, kept as
  history: the pleasantness pass then retired the brush, and §b-§e hold the numbers now (R3 250 px, figures ~130 px,
  near x 466; R4 at 362 / 482 / 578, the lit word 160 / 156 px; R7's "2027" at 122 px, figures ~72 px; R10's lit word
  ~200 px)."
- Why: the owner (2026-10-30, "shouldn't look like a blood message on the wall") retired the brush, the burnt red and
  the write-on; §i's earlier bullets contradicted §b-§e's picked numbers. Checked: no recipe (R1-R10), no check in §f and
  no motion row in §d carries brush or burnt wording ("burned in" in §g is the captions being in the picture, not the
  colour); §h is job 2's still list, a record of what each still showed, left as it is.

**2e. `docs/v4/THROUGHLINE.md` (the G1 card) against v3: the carriers, the person, the thread's signs.** The card keeps
its G1 words (owner-approved with the script) and each stale line gets a "v3:" note beside it; v3's "Departures from
the card" names every change, and the card now points to it.
- Line 7-15, a head note added: "Since the visual script v3 (`visual/VISUAL_SCRIPT.md`, LOCKED for G3 2026-10-30; its
  "Departures from the card" names each): the picture is v3's where it departs from this card, and the lines marked
  "v3:" below say so. The carriers are C x10, F x1 (the plain cut on "But") and B x1 (the loop); the heat shows as the
  melt over a pipe under the snow, steam from the manhole and the window's frost clearing (no cut-open ground; one soft
  cut up the block's wall); a snowy night under one camera (no designed view); the resident near the camera (S1 walking
  home, S11-S12 in the one lit window), never "you"; the giant computer about 2 storeys; no "≈ 40" tag; the plan marked
  out (W1: pale chalk lines); the times, the thread's coverage and Pip's spots are v3's and W1's. The core line, the
  thread (the heat as warm water), its home spot, the home place and the one comparison shot stand."
- The thread's signs, §1.2 (line 54-58). Before: "an orange ribbon of water in the cut-open pipe (cold blue where it
  runs cool, gold after the small box on the pipe) and a curl of steam where the heat meets the cold air, in flat lit
  and shade tones." After: "v3: warm water in a pipe under the snow, its signs the snow melting over it wherever it
  runs, steam puffing from the manhole as it passes and the frost clearing on the window it reaches, and steam where
  the heat is let go into the cold air (G1 had an orange ribbon of water in a cut-open pipe, cold blue where it ran
  cool, gold after the small box, and a curl of steam, in flat lit and shade tones)." Why: v3's "The thread" and
  STYLE_ADJUSTMENTS 2 (owner-approved: no diagram cut-away); "never as a glow" stays, as v3's delegated call 7 keeps it.
- The home place, §1.3 (line 78-88). Added beside the G1 words: "(v3: at night, under one camera at a standing
  eye, since DIRECTION rule 7's designed view is on hold)", "(v3: no cut-open ground, the pipe unseen under the snow but
  where the heat shows)", "(v3: above the snow)", and on the "≈ 40" tag "(L4; v3: no tag, the 40 drawn kettles are the
  number)". Why: "as ONE designed view (DIRECTION rule 7)" contradicts DIRECTION rule 7 itself (the designed view on
  hold since 2026-10-29: every frame keeps one camera) and the owner-approved STYLE_ADJUSTMENTS (a cold blue snowy night;
  no cut-away; the designed view ON HOLD); the tag is v3's departure (S4: the drawn kettles are the number).
- The comparison shot, §1.4 (line 89, 93-94): "at dusk (v3: at night)"; "left by A (the push down into Helsinki's lit
  windows; v3: by the film's one plain cut, F, on "But", the heat on both sides)". Why: the carrier (v3 S6 -> S7, RJ2).
- The person, §1.5 (line 96-103). Before: "(since fix round 2 the voice's last line says "a chatbot", so the
  "you" is the picture's alone)" and "No strangers' backs in any foreground: the city's people stay small silhouettes in
  lit windows, in the mid and far ground." After: the first gains "; v3: the locked take says "So your chatbot ...", the
  core line restored, §1.1, and the picture's "you" stays POV only"; the second gains "v3: one person near the camera,
  the resident (`visual/STYLE_ADJUSTMENTS.md` 4, owner-approved; v3's delegated call 4): walking home on the near snow in
  S1, in rear three-quarter (never square from behind), and at home in the one lit window in S11-S12; never "you",
  never a stranger's back (W1 §6)." Why: the locked take (`public/v4/voice_words.json`: "So your chatbot could soon heat
  an apartment in Helsinki.") and the owner-approved person near the camera.
- Truth in the picture, §1.7 (line 111-112): "about a person's height (v3: about 2 storeys, its delegated call 2; its
  height isn't checked: FL 2.2)". Why: v3's delegated call 2, under the owner's hand-over.
- The joins, §3: the head (line 141) "0 plain cuts" -> "0 plain cuts; v3: one, on "But""; L6 -> L7 (152) "A
  push-through" -> "A push-through (v3: F, the plain cut at 23.37 s, the heat on both sides)"; L11 -> L12 (157) "A
  push-through (pulled back out)" -> "(pulled back out; v3: C, a continuous 1.15x pull anchored on the one window)"; the
  count (160) "Carriers: A x2, B x1, C x9, no D, E or F." + " v3: C x10, F x1 (on "But"), B x1 (the loop), no A." Why:
  v3's counts (C x10, F x1, B x1) and its departures (L6 -> L7 the plain cut the card allowed; L11 -> L12 a continuous
  pull, since a 1.15x pull back through no opening is no push-through). The "what leads" cells stay G1's; v3's blocks
  say what leads each join now (the head note).
- Open for G3, §5 item 4 (line 185-186): "with the "≈ 40" tag (v3: no tag; 5 rows of 8 in front of it)".
- Not changed: the history paragraphs ("What fix round 2 / fix round 1 / draft 3 changed here", their carrier counts
  included), §2's G1 estimates, §1.6 Pip and the "what leads" cells (all under the head note), the card's rank line.

### 3. Found on the way, fixed in the lower doc

**3a. `docs/look/TYPE_GUIDE.md` §c, line 65-69 (where words sit, by shot type).**
- Before: "WIDE and the home view (S1, S7, S12) ... The far city starts just under it, so ink stays at y <= 585." ·
  "MEDIUM (S2's end, S4, S8, S11)" · "CLOSE (S3, S5, S9, S10)".
- After: "WIDE and the home view (S1, S7, S11, S12) ... The roofs start just under it (video 4's tops stop at y >=
  614), so ink stays at y <= 585." · "MEDIUM (S2's end, S4, S8, S9, S10)" · "CLOSE (S3, S5)".
- Why: these are v2's shot types (`visual/archive/VISUAL_SCRIPT_v2.md`: S9 and S10 CLOSE, S11 MEDIUM); v3 makes S9
  and S10 MEDIUM (S9's frame held) and S11 WIDE (the home view a step closer). Under v3 and W1 §1.0 the far city sits
  on the horizon (~y 1090-1150), far under the band; what starts under it are the roofs and the tops (all at y >= 614).
  The placement rules themselves are unchanged.

**3b. `docs/look/TYPE_GUIDE.md` R2, line 128:** "the home view paints itself, the pipe first" -> "the run first". Why:
v3 S1 lays the run (the heat's path; the pipe stays unseen under the snow: STYLE_ADJUSTMENTS 2).

**3c. `docs/look/TYPE_GUIDE.md` R6, line 190-192:** "until 19.217 s (the start of S6's move)" -> "until 19.217 s (when
S6's first group pops; S6's move starts at the end of "tea.", 18.84)". Why: v3 S5's join and S6's camera start the big
move at the end of "tea." (18.84); 19.217 is when "Normally," pops (R8).

**3d. `docs/look/TYPE_GUIDE.md` R7's spec, line 200-201.**
- Before: "in the object's ink (deep plum #3A2B48 on cream paper)".
- After: "in the object's ink (the stills: deep plum #3A2B48 on cream paper; a film keys the paper and its ink to its
  palette, video 4: W1's deep indigo #1F2B4B on pale lilac-white #D5D6E7, 9.7:1)".
- Why: read as the spec, cream paper in a night keyed cold breaks DIRECTION rule 6's ONE colour key (W1's colour story:
  the warm is the heat and nothing else; §1.5: the tag "never warm"); the rule is "in the object's ink", and the film's
  values are its world bible's. 9.7:1 measured here (WCAG) on `world/palette_v4.json`'s two hexes.

**3e. `docs/v4/THROUGHLINE.md` §1.3 and §1.5** (with 2e): "as ONE designed view (DIRECTION rule 7)" against DIRECTION
rule 7 (the designed view on hold since 2026-10-29), and "the voice's last line says "a chatbot"" against the locked take
("So your chatbot ..."): each gets its "v3:" note (2e).

## 4. Found, not fixed here (for the orchestrator)

1. **The dark key's rewording (`ORGANIC.md` §8 D3, C7, C8), owed since v7a.** T3 was decided 2026-10-30 ~19:00 UTC
   under the owner's hand-over (`ORGANIC.md` §8, "Decided ...": "D3's wording follows v7a"), and v7a is done
   (`paint_test/NOTES.md` v7a, its first flag). Still saying "pending", or still the gentle key: `DIRECTION.md`'s intro
   (line 58, "One call is still the owner's: the dark key"), rule 5 (line 158, "Night is temperature, not darkness",
   against T3's dark night: W1 §0, 60-70 % of a home-view frame under L* 40), rule 6 (line 160-181: "never one dark
   mass", line 169-170; "owner's pick pending"); `CRAFT.md`'s intro (line 24-25), §d.2's L* 35 floor (line 279) and
   its check, §f.8 (line 509); `LAYOUT.md` §1 (52), §6 (179), §8.2 (247); the playbook's "A full value range" bullet
   (line 492). These are the higher docs here (and the playbook holds the owner's words), and the change rewords rules
   in three docs together, so it is not a minimal reconcile: one pass, as D3 planned (DIRECTION rule 6, CRAFT §f.8 and
   the playbook bullet together, from v7a's numbers). Until then W1's declared exceptions (§7) carry video 4.
2. **The production captions' world word** (`public/v4/captions2.json`, `world` w1, data, not edited): "ink": "#3A2B48"
   (the stills' plum) where W1 keys the tag to indigo #1F2B4B on #D5D6E7 (3d). Nothing changes at G3 (monochrome);
   the tooling lane or G4 rekeys it.
3. **The camera plan's 1x px are on y 1170** (`camera_plan_g3.md` §1's table and the shots' 1x numbers; e.g. the
   computer y 878-1256, the harbour y 1170-1205, the far city's tops y 1110-1150, her feet ~1340): the plan now says
   so (1d). W1 §1.0-§1.1 has them on 1150 (the computer 858-1236, the harbour ~1152-1181, the far city's tops
   ~1090-1148, her feet ~1319); the G3 lanes, who read the plan as the contract, move them at their thumbnails.
4. **`visual/COMPOSITION_PASS.md` still says y 1170** (its §1 and its clash list): the study session's; v3's fold (i)
   joins its fixes (a)-(h) for the pass's fix pass.
5. **W1 §1.1's Pip line** reads "seated against the slate facade (lavender on slate: tone-on-tone at a squint ...)":
   by the one rule (1c) the slate is the field it is seen against (ΔE ~39: the second look) and the balcony's snow its
   seat (ΔE ~15: the squint join), as W1's own §7 says. W1 is the density revision's file now (not edited here beyond
   the §7 head's pointer, 1d); its revision may move Pip's seat, and the rule holds wherever it goes.
6. **Seen, not a clash:** `LAYOUT.md` §8.2's Pip spot (line 257) "x 140-760" (marked a proposal there) against W1's
   balcony at x ~830-845 (inside the busy belt, clear of the rail, >= 250 px from the focal: R12 holds), so W1's seat
   stands.
