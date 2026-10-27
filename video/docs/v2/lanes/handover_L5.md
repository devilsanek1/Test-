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
