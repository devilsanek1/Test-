# Video 4: doc reconcile after phase A (2026-10-30)

The clashes phase A flagged (the W1 world bible's §7 "Flags for the orchestrator"; the visual script agent's flags on
TYPE_GUIDE R4/R7/R9 and THROUGHLINE), fixed in the LOWER doc per CLAUDE.md's order (owner's words > DIRECTION > CRAFT >
PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > look/*.md > the film's own docs' values; the film's world bible and visual
script decide the film's own values). Every edit minimal. Not touched: code and data, `visual/COMPOSITION_PASS.md`,
`look/COMPOSITION_SHOTS.md` (the study session's), the camera plan's numbers beyond the horizon.

Status: IN PROGRESS (this file is written as the work goes).

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

**1c. Pip's colour: one rule for `docs/look/LIFE_AND_DENSITY.md` §5 (line 168-171) and `docs/look/ORGANIC.md` R12 (line
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
  ~1152-1181, her feet ~1319). Checked: no code or data carries a horizon yet (`public/v4/animatic.json`,
  `scripts/v4/`).
