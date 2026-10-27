# Conform brief L6: V2S8 (her words) + the loop seam

Read, in order: `docs/look/DIRECTION.md`, `docs/look/CRAFT.md` §a-§d, `docs/v2/THROUGHLINE.md`, this brief; then
`src/lib/LIGHT.md`, the header of `src/lib/tier.tsx` and the kit READMEs' "Tiers"; `docs/v2/STYLE.md` and `plan_L6.md`
for values only. Where `handover_L6.md` or TREATMENT disagree, this brief wins; fairness (A5, Q9) never bends. Budget:
ONE agent, ~60-75 min, a commit every ~20 min; only your shot and the seam, 0.4 scale (`--gl=angle --concurrency=2`).

## 1. Joins
- **In, D: S7's narrowboat wipe** (32.70-33.16), as built: Pip on the stern deck 32.97, steps off 33.00, lands on the
  pre-truck bollard (450, 1205) at 33.20 (it rides the carrier).
- **Out, the seam (B + `unbuild` 38.82-39.08):** S1 now opens at zoom 1.00 (its pull-out is retired), so W (860, 700)
  150 x 170 IS S1's frame-0 window: **retire the seam push** (37.70-38.82, `seamZoom`). Keep the truck 34.99-35.60 (the
  shot's ONE story move, A5) and the float law (home at 35.60 and at 38.82).
- The un-build lands on **S1's new frame-0 state** (pale flat tier-C shapes, the subject's outline drawing on, Pip in
  colour: no longer bare ink): use the t < 0 state L1 exports; the ghosts and W leave last. Pip settles from the board
  bollard (700, 1205) to S1's bollard **(700, 1235)** (a 30 px step down, no hop): re-derive `S1_SHIFT`, `S1_PIP` and
  `PIP_SEAM` in `V2S8_clock.ts` at zoom 1.00.
- Nothing new enters, pops or turns in 38.72-39.08 but the un-build.

## 2. Thread: W, the film's last picture
W is visible from ~33.0 (pre-truck (700, 700)); it lights at 34.95 (the thread's answer): a `LitWindow` (L* 85-92, no
glow) plus a `WindowSpill` on the wall and the step below (+4 L*, warm); at W from 35.60 to the seam.

## 3. Foreground
No near heads (as built). Keep the café boat's stern deck things (tables, mugs, a folded chair, a potted bay, a coiled
rope), the paving bands, a drain, the planter and the lamp-post foot. The readers and the café owner stay small backs
(~150-165 px: your planned resize) in the mid ground at the board's foot.

## 4. Tiers (CRAFT §b)
A: her + the three ghosts (her walk 33.16-34.75; the ghosts pop on "can't" 33.78, then B with their tinted line) · W
(34.55-34.95, and the end) · her board (promoted from 35.72: the wipe; the quote 36.54). B: Pip (ears down on "can't": its
one reaction; the look up at W on "not" 37.70 is a lead), the café owner, the two readers, her door. C: the lane, lamps
(the 37.18 run: <= 3 switch-ons per second), the café boat, canal, roofs, the sun, smoke, steam, walkers, a cyclist's lamp.

## 5. Life (<= 3 noticeable supporting movers at once, taking turns)
Her walk (A), then the board's wipe and pen (A); supporting: one walker, smoke or steam, the readers' walk-in (36.4-37.18);
the pre-truck neighbour enters at an edge already walking; nothing comes at the lens.

## 6. Light: RIG_CANAL at sunset (`src/v2r/world/rigs.ts`)
- The key is the low sun ahead (SUN8 at (420, 625), the integrator's map value): shadows fall toward us (`toward` ~85),
  backlit form (tops lit, camera-facing sides one step down).
- Contact shadows: her, the ghosts, Pip and its bollard, the board's legs, the café furniture, planters, the readers, the
  owner. Cast: her (toward the camera), the ghosts, the board, the lamp posts. Rim on her (backlit), along her top and
  left edge only.
- 34.95: W's `LitWindow` + `WindowSpill`. 37.18: each lamp adds its pool as it lights (two flat steps, +4 L* over the
  paving, the rig's pool colours, one lamp at a time).

## 7. Line
In `V2S8_*` delete `INK_PX.*` per-element weights and every `over` / `breaks` / `jitter:` / `drift` / `misreg` / `open` /
`exitLoose` option, hatching, specks, dash rows (`V2S8_house`, `V2S8_set` first). Keep rng placement jitter. The ghosts
keep their one closed outline (line-drawn figures).

## 8. Keep exactly
The lane set and its parallax planes, her walk home, the door (34.55 / 34.75), W, the board's SHE SAYS header, the
one-stroke wipe (35.72) and the quote (36.54), the three ghosts and their spots, the lamp run, the stern hand-off, the
readers stopping on "facts", Pip's board pose (= S7's, A5).

## 9. Report (<= 12 lines, `docs/v2/lanes/report_L6.md`, pushed last)
- A 0.4-scale clip of Film2R 32.5-39.08 s plus the seam into frame 0 (frames 1950-2345 and 0-36), paths in the report.
- `check_light.py` A/B at 34.0 (`--subject` her), 36.0 and 38.0 (the board / W): PASS.
- `scripts/qa/retro_tools/line/measure.py` at 36.0: strokes <= 80 / Mpx, near-miss ends <= 40, dark-line px <= 3 %.
- Frames 32.70 / 32.93 / 33.16 (the wipe, Pip on the stern) and the seam: frame 2344 beside frame 0 (W the same spot and
  size, 150 x 170; Pip within 30 px).
- Flashes <= 3 per second in 37.18-37.80; movers <= 3; `npx tsc --noEmit -p .` clean; REQUEST lines.
