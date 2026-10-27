## PAUSED 22:40 UTC for the depth pass (L5, session `session_014PwCXJBpuhBWJAJtA6vrSe`)
State: resumed 22:16 on the new direction (DIRECTION.md, CRAFT §a-§d, THROUGHLINE.md, conform_L5.md); read them all, rendered the
current S6 / S7 at 0.4 (Film2R 23.9-31.5) beside the approved G4 look clip. NO code changed since the 15:06 checkpoint (tree
clean, `npx tsc --noEmit -p .` 0 errors). The integrator already moved S6 to 23.80 (S5's blossom-tree wipe) and S7 to 28.10
(push-through out of SUN2), zeroed every S6 drift and put S6's Pip seat at (360, 1410) in map.ts; the kit's tiers and the
clean pen are global (boards default to `support`).
Next, in order (conform_L5.md wins; then the depth section the orchestrator adds):
1. K3: check a board promoted with `tier="subject"` (one closed 3.0 px outline in the stiles' own deep warm shade, keys at
   full contrast, popping on in one frame); README: "the legs' contact and cast shadows come from the scene's rig".
2. V2S6: wrap the scene body in `<TimeShift by={0.2}>` (the dc kit's door / window times and every V2S6_* part stay on the
   film-24.00 clock; shot now 23.80-28.10 = inner -0.20..4.10); `<DealBoard tier="subject" clackAt={0.03} />`; delete
   `S6Readers` + the passer-by, the pigeons' flutter (`S6NearFront`), the petal GUST (keep the steady fall), the Pip
   arrival + hop (`S6PipHop`, track keys) -> Pip seated still at (360, 1410) from the first frame, ear flick 'A' at 2.50
   (inner), no other motion; staff walk-in from >= 24.40 (inner >= 0.40) or already under way; nothing enters / pops /
   turns 23.60-24.00 and 27.90-28.30; promenade -> one jogger + small far C figures (< 0.3 % each), no sparrow lift near the
   joins; facade windows 27.08-27.80 in <= 3 grouped switch-ons (draw GateFacade under 3 x-clips with lightAt [t,t] each,
   e.g. 27.08 / 27.44 / 27.80); RIG_APRIL light (contact: board legs, posts, bench, rack, Pip, jogger, staff; cast: board,
   posts, people; Shade on facade planes turned from the sun; FormShade on round things).
3. V2S7: `S7_T0` = 28.10 in V2S7_pip.ts (delete `pipHopAt` / `PIP_HOP` / `S6_T0`); W7 and DOOR_KEYS etc. in V2S7_rig.ts are
   film-28.06-local: shift them by -0.04 (or wrap in `<TimeShift by={-0.04}>`); `<GoogleBoard tier="subject" t0={-0.04}
   headerAt={0.23} creditAt={0.23} clackAt={0.23} />` (header 28.33); Pip seated on the bollard from the first frame
   (delete S7PipHop); delete the cafe's seated backs (`CAFE.s1`, `s0`), `NEAR_BACKS`, `RIM_SITTERS`, `STANDER` near people ->
   cafe things (cups, saucer, folded paper, coat over a chair) + the cafe's people small and at rest in the mid ground;
   the light run 30.10-30.60 in <= 3 switch-ons (group festoonA / B / tree / basin / cafe lights into 3 steps), bulbs
   `SourceCore`, no flicker; nothing starts 32.50-33.10 but the wiper; delete hand-drawn specks / dash rows (V2S7_set,
   V2S7_life first); RIG_CANAL light (contact under the board's legs, tables, chairs, bikes, planters, bollard, Pip; cast
   for the board, tables, plane trees; Shade on the wing's planes turned from the sun).
4. ONE combined critic agent (CRAFT §a-§d + check_light.py + fairness TREATMENT §8 + squint + joins vs THROUGHLINE), fixes,
   then report_L5.md per conform_L5.md §6 (0.4 clip of Film2R 23.6-33.3, check_light at 25.0 / 27.5 / 29.0 / 31.5, line
   measure at 25.0 / 31.0, the join frames, Pip's clause gap, flashes, movers, tsc).
Renders of the pre-conform state: scratchpad `conform/now_sheet.png`, `conform/look_sheet.png` (lost on a restart).

# L5 handover (boards K3 + V2S6 + V2S7), 2026-10-27

## Done (pushed)
- Recon: read COMMON, brief_L5, TREATMENT in full, BUILD.md, map.ts (S6, S7, B, BOARD_BOLLARD, SUN2), dc/gate.tsx (`GateSet`
  with `board`, `pip`, `mid`, `near`, `doorPeople` slots: ready for S6), canal wing `WingS7` + `BoatWiper`, Pip README.
- `src/v2r/kit/boards/texts.ts`: every board line exactly as TREATMENT words it, line breaks MEASURED in Patrick Hand
  (fontTools): clause wraps in 5 lines max 406 px at 34 px; purpose 2 lines (432 px max at 56); all fit a 444 px text width.
- `src/v2r/kit/boards/WorldText.tsx`: `TYPE` scale (header 60, key 56, body 34/30, credit 18/20), `WorldText` (pen = slanted
  clip reveal, pop = spring 0.55->1, off, exit shrink, maxW guard, faux weight), `flowBaselines`. Not yet typechecked/rendered.

## Decisions taken
- ONE A-board face for all: stiles (plum `CM.anchor`) ~30-34 px each side, top/bottom rails ~18-20 px, paper face with a plum
  inset keyline, legs to B_LEGS_Y1. Fairness: the deal board's FACE = B's face exactly (480 x 520; S6 face x 160-640,
  y 700-1220 inside the 560x560 contract rect 120-680 x 680-1240), so the deal and Google boards are equal in size, face,
  type (keys 56, body 34, credit 18) and light (same flat face, same ground shadow).
- Deal board baselines (face y0 700): tag 34 px ~744; purpose 56 px ~818/878; clause 34 px from top 920 (5 lines, 40 lead,
  baselines ~947-1107); thin rule; F12 34 px ~1157 (pop on 26.40); credit 18 px ~1200. Purpose line pops ON 24.03.
- Google board (face B): header 60; follows its (34) + "AI principles" (56) pen 29.65 -> complete 30.04; small row (20) 30.30;
  bans retaliation (34) + "of any kind" (56) pen 30.74 -> complete 32.08; credit 18. Spread to avoid a hole.
- Fingerpost plates (100 px tall): row1 key 56 + body 31 side by side (fits 392 px), row2 credit 18.
- Name tag auto-height (7 rows at name 44 / body 30 / credit 18 ~ 278 px; L3 may adjust).
- S7: own scale 1/1.04 -> 1 about B centre 28.40-30.04 (B exact at 30.04), float zeroed at 30.04, SUN2 in screen space;
  `export const Wiper = BoatWiper` (canal kit). S6: GateSet + boards + Pip enters rising up-right to (770,720) by 24.12,
  `flick:'A'` 26.50, `idle={{flick:false}}`.

## Next
1. `StatementBoard.tsx` (face, stiles, rails, keyline, screws, ground shadow; build fill-first, land/clack spring, enter
   slide, wipe + cloth, smudges, rules) + presets `DealBoard`, `GoogleBoard`, `HerBoard`, `ToldTheBBCBoard`.
2. `small.tsx`: `PaperTag`, `Fingerpost`, `NewsBox`, `Plaque`, `DoorSign`; `index.ts`; README; `src/entry-v2r-boards.tsx`
   (KitBoards sheet + actions clip). Commit + push early (L3, L6 wait on it).
3. V2S6 / V2S7 scenes (S7 forecourt set: fountains, cafe tables + seated backs, plane trees with string lights on at 30.04,
   bikes, planter, basin rim; staff backs in/out of the doors), review files, critic loop, report_L5.md.
Setup notes: `npm ci` done fast; pip opencv-python-headless + fonttools brotli needed; the config's browser path exists.

## Handover 2 (ultracode session, 2026-10-27): stopped at the orchestrator's request (lane moves to an /effort max session)
- Finished: re-read COMMON, brief_L5, handover_L5, TREATMENT (full), BUILD.md, map.ts S6/S7/B, the dc/canal/cast/pip READMEs,
  dc/gate.tsx (`GateSet` slots, `GATE.post`, `doorOpen`), dc/sheets.tsx `GateDC` (a near-complete S6 sample with a STAND-IN
  board: reuse its people/door logic), canal wing.tsx `WingS7` + boat.tsx `BoatWiper` (`half` = 630). `npm ci` done.
- No new repo files: two workflows were launched and STOPPED before any agent wrote code (K3: StatementBoard/presets +
  small.tsx builders -> integrator (index, README, `src/entry-v2r-boards.tsx` sheet + per-preset comps) -> 4 critics (art
  director/readability, standards/fairness, lane API, motion) -> fix loop; S7: planner -> set + life builders
  (`V2S7_set.tsx`, `V2S7_life.tsx`) -> assembler (V2S7.tsx, push, Wiper = BoatWiper)). That plan is still the right one.
- Heard word times (public/v2r/voice_words_heard.json): any 24.03 · veto 26.50 · But 28.31 · Google 28.36 · AI 29.64 ·
  principles 30.04 · bans 30.84 · of 32.08 · kind 32.52-32.70. Shot-local preset defaults: Deal purpose 0.03, F12 2.40;
  Google header 0.30, "AI principles" pen 1.59 -> 1.98, small row 2.24, bans 2.78 -> "of any kind" complete 4.02; Her wipe
  2.79, quote pen 3.61 (S8 start 32.93); BBC board out 2.34 (S2 start 6.10, face 400 x 200: different size, same face/type).
- Next (unchanged): 1) K3 first and push (L2 needs ToldTheBBCBoard at S2.aBoard; L3 PaperTag/Fingerpost; L4 NewsBox/Plaque;
  L6 HerBoard). 2) V2S6 = GateSet + DealBoard (mid plane) + GateDC's people + Pip on the post, flick 'A' 26.50. 3) V2S7
  forecourt on WingS7. Open asks: L6 wants Pip drawn on the S7 wiper roof until 33.00 (handover_L6.md); L3 says the 280x200
  tag is too small at the scale.

## Handover 3 (MAX-effort session `session_014PwCXJBpuhBWJAJtA6vrSe`): CONTROLLED PAUSE 15:06 UTC (account limit; resume after 18:30)
**Done and pushed** (pause checkpoint typecheck-clean: `npx tsc --noEmit -p .` 0 errors):
- **K3 LANDED** (`src/v2r/kit/boards/`): `StatementBoard.tsx` (the one enamel A-board + `DealBoard` / `GoogleBoard` / `HerBoard` / `ToldTheBBCBoard`,
  `boardFrame` geometry, land / clack, the one-stroke wipe), `small.tsx` (`PaperTag` + `NameTag`, `Fingerpost` = `SignPost` + 2 `ArrowPlate`, `NewsBox`,
  `Plaque`, `DoorSign`), `index.ts`, `README.md` (API, clocks per shot, measured fairness, per-lane swaps, open items), `sheets.tsx` + `src/entry-v2r-boards.tsx`
  (KitBoards, Boards-Deal/-Google/-Her/-BBC/-S4/-S5, BoardActions). **Lanes told** by send_message with exact swap JSX: L2, L3, L4, L6. **No critic round on
  K3 yet** (the 4-lens loop was stopped for budget).
- **V2S6 / V2S7 first builds, K3 boards wired** (`V2S6_board` = `DealBoard`, `V2S7_board` = `GoogleBoard`). S6: `V2S6.tsx` + `_rig _board _pip _life _near
  _set` (GateSet planes; promenade, door staff, readers hv <= ~150, a petal burst on "any", Pip arrives 24.00 -> post 24.12, flick 'A' 26.50, hops 27.95).
  S7: `V2S7.tsx` + `_rig _set _life _board _pipdraw _wiper` (forecourt, plane trees + festoons, fountain basin, cafe, steps; band-safe narrowboat wiper:
  `boatInto`, water 2020, clipped to y >= 560, half 630, `captionRegions` [], NO Pip). Shared `V2S7_pip.ts`: `s7CamAt` (4 % push about B 28.40-30.04 + the
  STYLE.md float law: eased legs through `S7_FLOAT_KEYS`, home at 30.04), `pipHopAt` (S6 -> S7: post 27.95, LEVEL launch, apex (732, 720) ON the cut,
  drop onto the bollard by 28.22 = `S7_PIP_LAND`; checked per frame: band, rail and clause clear). `stylecheck_L5.md` pushed (answered by me, no agents).
- Review tools copied to `docs/v2/lanes/l5_tools/` (scratch may vanish): `l5_review.py` (216 px montages vs ref 1 / v1, full key frames, motion strips,
  Film2R frames 1428-1976 at 0.5 with voice, density --cozy, deadframes), `bandcheck.py`, `wf3_lean.js` (the old lean final workflow), `wf2_s6s7.js`.
**Stopped agents:** workflow `v2r-l5-s6s7-build-style`, runId `wf_4b581e01-f7c` (script `l5_tools/wf2_s6s7.js`): builder S6 was in its 7th self-review
round (a per-frame Pip-to-clause gap tool, a NearBack `broad` tweak, hop renders); builder S7 was tuning density (cozy movers fixed to >= 2, mean 3.6;
reducing the forecourt paving's flat share; Pip-landing renders). Neither returned; their critic + fixer never ran. Do NOT `resumeFromRunId` (it would
re-run both builders from scratch). Workflow `v2r-l5-k3-boards` (`wf_2e82bdf7-3ab`) stopped after its integrator. Last renders (scratch, if it survives):
`s6/sheet_r7a.png`, `s6/s6_r6.mp4`, `s7/build/review1/strip_a.png`, `s7/build/full2/`, `k3/int/KitBoards_sheet_0.5.png`.
**Next, in order** (orchestrator budget: ONE agent at a time; no second critic round unless a must-fix breaks the story; no polling):
1. **Pip at the S7 -> S8 wipe: AGREED with L6 (15:07, one message each):** S7 keeps its seated Pip on its board bollard (`BOARD_BOLLARD` under S7's
   camera), unmoved, NO hop, never removed at 32.70, until the wiper's bow covers it (~32.83); S8 owns Pip from the boat's stern deck at 32.97 (x =
   `wipeEdgeX(p, 'left', 630) + 545`, feet y 1648 on the water-2020 hull), leaps 33.00, lands (450, 1205) at 33.20 (L6 keeps it in `V2S8_clock.ts`
   `PIP_ENTRY`; L6 says no map.ts change is needed; the orchestrator asked for the spot in `map.ts`: one comment line on `BOARD_BOLLARD` after resume).
   Check S7 draws Pip on the bollard to its last frame (33.16) and the wiper keeps `half` 630 / water 2020.
2. **Flash safety** (STYLE.md §5 + orchestrator): <= 3 flashes in any 1 s at any size: regroup S7's 30.04 light run (`V2S7_life` festoons / cafe lights,
   `V2S7_set` tree + basin lights) and S6's facade window ticks 27.08-27.80 (dc `GateFacade lightAt`: pass `lightAt` or group the windows in V2S6) into <= 3
   switch-ons per second; no kit `Lamp` 3-frame flicker; one bulb twinkles at a time.
3. **K3 `NameTag`:** its credit row (baseline ~861, x 616-819) enters the right rail (x > 780 below y 840): split it into two short lines or move the tag.
4. **ONE combined critic agent** (K3 + S6 + S7: STYLE.md + TREATMENT §8 / §9 + brief_L5's critic prompt) on fresh renders, then fixers one after the
   other, then the review files (`l5_tools/l5_review.py`, `bandcheck.py`). No full-film renders.
5. **`report_L5.md`** (<= 15 lines; REQUESTS: SUN8 -> (420, 625) (it touches her board's top rail at y 680); K2 `S6.nearHeads` / `BOTTOM_THIRD` sizes ->
   hv <= ~150 per STYLE.md §4; the canal kit's `BoatWiper` crosses the caption band (S7 uses its own)).
