# Conform brief L4: V2S5 (the far side: the ONE scale reveal)

Read, in order: `docs/look/DIRECTION.md`, `docs/look/CRAFT.md` §a-§d, `docs/v2/THROUGHLINE.md`, this brief; then
`src/lib/LIGHT.md`, the header of `src/lib/tier.tsx` and the kit READMEs' "Tiers"; `docs/v2/STYLE.md` and `L4_spec.md`
for values only. Where `handover_L4.md` or TREATMENT disagree, this brief wins. Budget: ONE agent, ~60-75 min, a commit
every ~20 min; only your shot, 0.4 scale (`--gl=angle --concurrency=2`). The crane is the film's declared scale reveal
and the start of "the other side" (THROUGHLINE §1.3): it runs without the thread, so it must feel GREAT and stay calm.

## 1. Joins
- **In, A push-through out of the sun** (20.40-20.70, centred 20.55; the integrator's scenes.json): Film's push-through
  camera opens S5 zoomed ~7x on its SUN1 at (250, 650) r 65 in the bright slot and pulls back by 20.70 (no camera code of
  yours). Pip is already seated beside the stranger on the bench (415, 1120) on the first frame: delete the arrival hop
  (-0.12 tuck) and any landing.
- **Out, D foreground wipe** 23.72-24.12 (midpoint 23.92, on "any" 24.03; V2S6 starts 23.92): export `Wiper` from
  `V2S5.tsx` (a `WiperComponent`, like `V2S7_wiper.tsx`): one blossom tree passing close to the lens, trunk + crown,
  ~300 px wide (`half` ~150), crossing left to right (dir 'right'), its crown kept below y 600 or as a flat mass whose
  `captionRegions` hold the caption tone; flat fills, no outline (C). The deal board is uncovered by 24.00.
- Delete Pip's 23.90 leap: the tiny Pip stays at the balustrade (366, 1195) until the tree covers it; S6's Pip waits at the
  deal board's foot in the same screen area.
- Nothing new enters, pops or turns in 23.72-24.12 but the tree (the birds already flying keep their pace).

## 2. Retire the calendar flip (DIRECTION: the sun as a character is retired)
The disc stays a disc. "April" (20.76) reads from the beat's own build: the slot's trees burst into blossom (4 frames, the
beat's A), the news box's "Reported Apr 2026" and S4's APR 2026 plate just before. Pip looks up at the blossom on "April"
(its one reaction).

## 3. The crane: keep as built
21.30-23.40 on the one ease, the lamppost wipe, the light burst, the Pentagon clearing the tree on "Pentagon" (22.43), the
plaque, the obelisk, the hold; the far city, river and terrace layers; the 62 px end stranger and the 44 px end Pip.
23.08: the wing's windows warm in ONE flat step (one change), not one by one (`Pentagon warmAt`: a single step).

## 4. Foreground
No stranger's back in it: the stranger is a small full figure on the bench (<= 150 px, mid ground), the terrace people
small. The start's bottom third holds things (the bench front, the stranger's bag, petals as a few flat shapes, the news
box's base, a root bottom-left); the end's holds the terrace floor (paving bands, petal drifts, a bench, a bin, a stroller).

## 5. Tiers (CRAFT §b)
A: the slot's blossom (20.70-20.90) -> the news box (to ~21.75) -> the Pentagon + the plaque (from 22.43). B: the stranger,
Pip (the scale anchors). C: the city, river, trees, the lamppost wipe, joggers, cars, birds, clouds. Far planes draw no
line; the Pentagon keeps one closed outline from 22.43 (A) in its own shade, never near-black.

## 6. Life (<= 3-4 noticeable at once; nothing moves inside the city)
The V of birds (entering at 70-80 % of the move), a jogger pair on the lawn, clouds (0-6 px/s), the stranger turning a
page once (B); taking turns.

## 7. Light: RIG_APRIL (`src/v2r/world/rigs.ts`: the canal's tint family, the April morning key, no pools)
- Start: the sun in the slot at the left; shadows fall right and toward us. End: the sun upper right; shadows fall left and
  toward us (3/4 backlight: tops lit, camera-facing walls in shade). One direction per frame: each plane's casts match the
  sun's side in that frame (switch them behind the lamppost wipe if needed).
- Contact shadows: the bench, the news box, the stranger, Pip, the terrace benches, bin, stroller, the lamppost, people.
  Cast: people, lampposts, trees (parallel). `Shade` one step on the Pentagon's and the obelisk's faces turned from the
  sun; FormShade on round things. No rim (the subject is a building).

## 8. Line
In `V2S5_*` delete `INK_PX.*` per-element weights and every `over` / `breaks` / `jitter:` / `drift` / `misreg` / `open` /
`exitLoose` option, hatching, specks, dash rows (`V2S5_deck_floor` first). Keep rng placement jitter. K3's NewsBox and
Plaque are L5's.

## 9. Report (<= 12 lines, `docs/v2/lanes/report_L4.md`, pushed last)
- A 0.4-scale clip of Film2R 20.3-24.3 s (S4's push-through in, the wipe out), path in the report.
- `check_light.py` A/B at 21.0 (`--subject` the news box) and 23.7 (the Pentagon): PASS.
- `scripts/qa/retro_tools/line/measure.py` at 23.7: strokes <= 80 / Mpx, near-miss ends <= 40, dark-line px <= 3 %.
- Frames 20.40 / 20.55 / 20.70 (out of the sun) and 23.72 / 23.92 / 24.12 (the wipe; the board clear by 24.00).
- `camspeed` <= 15 px/frame on detailed layers through the crane; the band check (y 317-556 pure sky every frame);
  movers in the hold <= 4; `npx tsc --noEmit -p .` clean; REQUEST lines.
