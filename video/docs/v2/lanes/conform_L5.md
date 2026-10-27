# Conform brief L5: K3 boards + V2S6 (the gate) + V2S7 (Google says)

Read, in order: `docs/look/DIRECTION.md`, `docs/look/CRAFT.md` §a-§d, `docs/v2/THROUGHLINE.md`, this brief; then
`src/lib/LIGHT.md`, the header of `src/lib/tier.tsx` and the kit READMEs' "Tiers"; `docs/v2/STYLE.md` for values only.
Where `handover_L5.md` or TREATMENT disagree, this brief wins; fairness (TREATMENT §8: V2, V9, V14, A5) never bends.
Budget: ONE agent, ~75 min, a commit every ~20 min; only your shots, 0.4 scale (`--gl=angle --concurrency=2`).

## 1. K3 boards (`src/v2r/kit/boards`)
- The engine made every board tier B by default (`src/v2r/kit/tiers.tsx`, the boards README "Tiers"). A scene promotes its
  board with `tier="subject"` on its beat (S2 from 8.44, S6 and S7 the whole shot, S8 from 35.72). Check the A look on one
  still and fix it in the kit if needed: ONE closed 3.0 px outline in the stiles' own deep warm shade (never near-black),
  key lines at full contrast, the outline popping on (one frame), never drawn on. Add to the README: the legs' contact
  and cast shadows come from the scene's rig.
- Delete `INK_PX.*` per-element weights and every `over` / `breaks` / `jitter:` / `drift` / `misreg` / `open` / `exitLoose`
  option in `StatementBoard.tsx` and `small.tsx`. Fix `NameTag`'s credit row out of the right rail (x > 780 below y 840).

## 2. V2S6 (23.92-28.10)
- **In:** uncovered by S5's blossom-tree wipe (23.72-24.12; V2S6 starts 23.92). The board, tag, FULL clause and credit are
  up when uncovered; the purpose line pops on "any" 24.03; the F12 line on "veto" 26.40 (V9, as built).
- **Foreground:** delete the three readers' head-backs. The near plane = the tulip beds' kerb, a bench, a bike rack, fence
  posts with blossom; petals are declared falling weather.
- **Pip** moves from the corner post to the board's foot: on the paving in front of the board at ~(360, 1410) on 23.92
  (feet >= 1410 so its top is >= 200 px below the clause's last line; out of the rail), riding the board's plane (~(465,
  1410) at 28.10): the same screen area as S5's tiny Pip. One ear flick on "veto" 26.50 (its one reaction). Delete the
  24.00-24.12 arrival and the 27.95 hop.
- **Out, A push-through into SUN2** (27.95-28.25, zoom 7, no bridge; V2S7 starts 28.10: the integrator's scenes.json). The
  board holds still and readable to >= 27.95 (F11 needs 27.82). Nothing enters, pops or turns in 27.90-28.30.
- **Tiers:** A = the deal board (whole shot). B = Pip, the door staff (small backs). C = facade, service door, fence,
  tulips, blossom, joggers, birds; facade windows 27.08-27.80 at <= 3 switch-ons per second.
- **Life (<= 3 noticeable at once):** Pip's idle, one jogger, the door staff (the door shuts 25.0 and 27.4), taking turns.
- **Light: RIG_APRIL** (`src/v2r/world/rigs.ts`; the sun at the left, SUN2): shadows fall right and toward us. Contact:
  the board's legs, fence posts, bench, bike rack, Pip, joggers, door staff. Cast: the board on the paving, the posts,
  people. One `Shade` step on facade planes turned from the sun; FormShade on round things.

## 3. V2S7 (28.10-32.93)
- **In:** pulled back out of SUN2 by Film's push-through camera (28.10-28.25, from 7x on S7's sun at (260, 620) r 45).
  Pip sits on the bollard (700, 1205) from the first frame: delete `pipHopAt` (the S6 -> S7 arc). The GOOGLE SAYS header
  and clack land with the leg (~28.30, on "Google" 28.36). Keep the 4 % push 28.40-30.04 (its ONE story move, A5) and the
  float law.
- **Foreground:** delete the café's seated backs at the bottom-left and every near head-back. The bottom third = café
  tables and chairs with things (cups, a folded newspaper, a coat over a chair-back, a saucer), a bike rack, a planter of
  grasses, the fountain basin's rim; the café's people move to the mid ground, small and at rest.
- **Tiers:** A = Google's board (whole shot). B = Pip (sit-watch, NO reaction: V14), door people (small backs). C = the
  wing (plain lit windows, no silhouettes), fountains (steady jets), plane trees, festoons (the run lands just after the
  pen completes, ~30.10-30.60, <= 3 switch-ons per second), a cyclist, boat smoke, leaves.
- **Life (<= 3 noticeable at once):** fountains, one cyclist, door people taking turns; nothing starts in 32.50-33.10 but
  the wiper (bow only after 32.70).
- **Light: RIG_CANAL at sunset** (the sun at the left, SUN2; `toward` ~15): contact under the board's legs, tables,
  chairs, bikes, planters, the bollard, Pip; cast for the board, tables and plane trees; the wing's planes turned from
  the sun one `Shade` step; festoon bulbs are `SourceCore` (no glow), a warm step on the paving only where CRAFT §d.7's
  +4 L* holds.
- **Out:** the narrowboat wipe as built (32.70-33.16); Pip stays seated until the bow covers it (~32.83).

## 4. Line (both shots)
In `V2S6_*` and `V2S7_*` delete `INK_PX.*` per-element weights and every `over` / `breaks` / `jitter:` / `drift` / `misreg`
/ `open` / `exitLoose` option, hatching, specks, dash rows (`V2S7_set`, `V2S7_life`, `V2S7_wiper` first). Keep rng
placement jitter.

## 5. Keep exactly
K3's face, type scale, pen build, clack and wipe; S6's set, board text and timings, the truck, facade and door; S7's
forecourt, the push, Pip's bollard pose (= S8's, A5), the band-safe wiper.

## 6. Report (<= 12 lines, `docs/v2/lanes/report_L5.md`, pushed last)
- A 0.4-scale clip of Film2R 23.6-33.3 s, path in the report; one still of a board as B and as A.
- `check_light.py` A/B at 25.0 and 27.5 (`--subject` the deal board), 29.0 and 31.5 (Google's board): PASS.
- `scripts/qa/retro_tools/line/measure.py` at 25.0 and 31.0: strokes <= 80 / Mpx, near-miss ends <= 40, dark-line <= 3 %.
- Frames 23.72 / 23.92 / 24.12, 27.95 / 28.10 / 28.25 and 32.70 / 32.93 / 33.16; Pip's top-to-clause gap (>= 200 px).
- Flashes <= 3 per second in 27.08-27.80 and 30.04-30.60; movers <= 3; no stranger's back; `npx tsc --noEmit -p .` clean.
