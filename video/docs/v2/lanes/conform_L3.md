# Conform brief L3: V2S3 (her window) + V2S4 (the walk home)

Read, in order: `docs/look/DIRECTION.md`, `docs/look/CRAFT.md` §a-§d, `docs/v2/THROUGHLINE.md`, this brief; then
`src/lib/LIGHT.md`, the header of `src/lib/tier.tsx` and the kit READMEs' "Tiers"; `docs/v2/STYLE.md` for values only.
Where `handover_L3.md`, `plan_L3.md` or TREATMENT disagree, this brief wins. Budget: ONE agent, ~90 min (two shots), a
commit every ~20 min; only your shots, 0.4 scale (`--gl=angle --concurrency=2`).

## 1. V2S3 (12.98-14.86)
- **In, B match** at 12.98: her lit home window at M (335, 785) 133 x 164 (= `W2_CUT`, as built); L2 puts her dark office
  window at the same spot and size. Retire the 5 % ease-back (13.00-13.60); keep the 2D float (eased legs within +-12 px),
  home at 12.98 so M is exact on the cut.
- **Pip** sits at **(590, 1050)** from the first frame (S2's spot): on her terrace's front railing below and right of her
  window. It turns to her on "she" 13.96 (its one reaction). Delete the 13.10 landing and the 14.70 leap.
- **Out, A push-through into her** (14.71-15.01, centred 14.86; the integrator's scenes.json): from her silhouette's head
  [330, 742], zoom 12, bridge #36223A (her plum), into S4's pull-back out of her head [720, 912]. At zoom 12 a 10 px miss
  is 120 px, so from 14.60 she stands still at x 330 (head on (330, 742)) and the float is home. Nothing else enters,
  pops or turns in 14.66-15.06 (her free hand moves at 14.28: fine).
- **Foreground:** delete the two walkers' head-backs on our towpath. Things instead: a bench with a bag left on it, a
  mooring bollard and its rope, a few fallen leaves as flat shapes, the lamp foot held from S2 (copy L2's final lamp).
- **Tiers:** A = her window with her silhouette on the phone (the thread). B = Pip, the two lit neighbours (watering,
  kettle steam). C = the terrace, canal, heron, boat smoke, string lights (one twinkle at a time), far walkers.
- **Life (<= 3 noticeable at once):** the watering neighbour, one far walker, smoke; nothing else starts.
- **Light: RIG_CANAL at sunset** (`src/v2r/world/rigs.ts`): the low sun at the left, shadows right and toward us (`toward`
  ~15). Her window = `LitWindow` + a `WindowSpill` on the Juliet rail and the wall below (+4 L*, warm). The terrace front:
  planes turned from the sun one `Shade` step; FormShade on chimneys and bays. Contact and cast shadows: the boat roof's
  pots, bike and rope, the bollards, the bench and its bag, Pip.

## 2. V2S4 (14.86-20.55)
- **In:** the pull-back out of her head (the push-through's incoming leg, 14.86-15.01; she is screen-fixed at x 720, so
  the truck stays as built from 14.86: no rig change); the name tag pops at 15.07 as it lands.
- **Camera:** retire the 6 % push toward SUN1 (18.40-20.10). After the stop (17.96) hold, locked or the 2D float, home
  by 20.40 so the push-through starts exactly on the sun; draw SUN1 at (250, 650) r 65 at zoom 1.00.
- **Out, A push-through into SUN1** (20.40-20.70, zoom 7, no bridge; the integrator's scenes.json). Nothing enters, pops
  or turns in 20.35-20.75 (the birds fly west at 19.80: fine).
- **Thread (new): her house and window ahead at the far left**, in the backs plane: the terrace's end house (brick,
  mansard, a chimney), her first-floor French window (teal frame, Juliet rail, blind UP, a dark pane: she is not home
  yet), 90 x 102, just left of SUN1 (centred (135, 698) at the pose: map `S4.herWindow`, 6 px above the DEC plate so it
  stays in view to the join, and clear of the disc), so the push-through into the sun leaves from it. It rides the backs
  plane (0.6x the path's 310 px truck): half in from the left edge by ~15.6, whole by ~16.3; at the stop she looks west
  along the plates toward it. Tier B (the thread's home spot): never over the plates, the tag
  or the band. Move the gasholder lattice off the sun (no line crosses the sun).
- **Pip:** on the boat roof (470, 1218) from the first frame (delete the 14.95 landing); turns west on "heading" 19.55
  (its one reaction); delete the 20.25 hop (the push-through sweeps it; S5 seats it at (415, 1120)).
- **Tiers:** A = her (the walk, the stop on "objected" 17.96, the look west) + the name tag (15.07-18.80) · the fingerpost
  (DEC 2025 on 18.92, APR 2026 19.45-19.80). B = Pip, her far window, the walkers she passes. C = towpath, lamps, benches,
  backs, gasholders, viaduct, the boat, water (no motion of its own), ducks, heron, smoke, leaves; the birds west (small).
- **Life (<= 3 noticeable at once):** one cyclist, smoke, ducks, taking turns; walkers enter at an edge already walking.
- **Light: RIG_CANAL** (the low sun at the left, `toward` ~15, `el` 36, cap 0.8 h): her cast shadow right and toward us,
  contact under her feet; contact under the post, benches, lamp posts, the boat roof's things, Pip; FormShade on the
  post's right side and round things; rim on her coat's left edge. The tag is screen-locked paper: unlit, no shadow.

## 3. Line (both shots)
THROUGHLINE §6 "Line": the global pen already cleans every stroke, so don't strip `INK_PX` or sketch options by hand;
tier your pieces, author A outlines at `INK_PX.mid` or wider, and delete the hand-drawn marks in `V2S3_*` / `V2S4_*`
(ripple dashes, brick and stone dabs, leaf specks: `V2S3_nground`, `V2S3_tParts`, `V2S4_post` first). K3's plates and
tag are L5's.

## 4. Keep exactly
S3: the terrace and her window's design (= S8's: closed leaves, central teal mullion, gold lamp shade, two shelves,
plants), the boat. S4: her walk, stride and stop, the tag's two builds and text, the post, plates and credits, the boat
foreground.

## 5. Report (<= 12 lines, `docs/v2/lanes/report_L3.md`, pushed last)
- One 0.4-scale clip of Film2R 12.8-20.8 s, its path in the report.
- `check_light.py` A/B (the sky flags of THROUGHLINE §5) at 13.5 (`--subject` her window), 17.0 and 19.9 (her): PASS.
- `scripts/qa/retro_tools/line/measure.py` at 13.5 and 17.0: strokes <= 80 / Mpx, near-miss ends <= 40, dark-line <= 3 %.
- Frames 12.95 / 12.98 / 13.00 (M and Pip in the same spot), 14.71 / 14.86 / 15.01 (into her, out of her) and 20.40 /
  20.55 / 20.70 (into the sun); a still at 16.0 and 19.9 showing her far window.
- Eye check at phone size every 1 s; movers <= 3; no stranger's back; `npx tsc --noEmit -p .` clean; REQUEST lines.

## 6. Depth + particles (2026-10-27; CRAFT §f, `src/lib/DEPTH.md`, THROUGHLINE §5b)
- **S3 planes:** -2 our towpath, -1 the boat, the water, 0 her terrace (her window M), +1 roofs and chimneys, +2 the far
  city on the sunset band (the air #F3C6A6): far fills through `recede` / `planePalette`; the towpath's slab joints to
  its VP (540, 1150) at |ΔL*| >= 6.
- **S3 particles:** `glints` in the low sun's glitter path on the water, `motes` in her window's spill on the wall's
  shade; `joins` [0, 1.88].
- **S4 planes:** -1 the boat, 0 her + towpath + post, +1 the backs (0.6x truck), +2 far roofs and gasholders (0.3x): the
  truck already IS a multiplane move; give each plane its air step (gold band) and keep her teal and the plates off
  their field (the backs behind the plates one shade step darker: `backing`).
- **S4 particles:** `motes` near SUN1, a `leaves` field (1-2) across the towpath, `glints` under SUN1 on the bottom
  water; entrances never in 20.35-20.75 (`joins` [0, 5.69]).
- **Check:** `check_depth.py` at 13.5, 17.0 and 19.9 with a sheet per shot: no FAIL.
