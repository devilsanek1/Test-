# K7, the Arlington kit (video 2 "One Small Window")

Everything Washington-side in the film, made new for it (TREATMENT.md sections 2, 6, 8, 9; the K2 contract
`src/v2r/world/map.ts` `S5` / `S6`): S5's viewpoint terrace and the six crane planes, S6's gate. Palette: 10 Canal Mint
role tokens only (`src/v2r/palette.ts`, imported first by every entry). Engine tools only (`lib/Ink`, `Fill`, `sketch`,
`persp`, `xf`, `time`, `rng`, `inkComp`; `lib/pullback.tsx` (ported from v3's kit: a film never imports another film's folder) for `PullLayer` / `planeMat` / `startMat` /
`boxMat`). People are K4's, Pip is K5's, the news box / deal board / plaque are K3's (slots below).

Review: `src/entry-v2r-dc.tsx` (palette first) registers **KitDC** (the contact sheet, 2160 x 3000), **CraneEnd** (S5's
landing hold, 1080 x 1920, alive), **CraneMove** (S5 whole, 207 f) and **GateDC** (S6 whole, 244 f).

```bash
npx remotion still  src/entry-v2r-dc.tsx KitDC    out/kit_dc.png --frame=30 --scale=0.5 --gl=angle
npx remotion render src/entry-v2r-dc.tsx CraneMove out/crane.mp4 --gl=angle --concurrency=2 --crf 16
GL=angle node scripts/render-frames.mjs CraneEnd <dir> 0.2 --entry=src/entry-v2r-dc.tsx --scale=0.5
```

## Files

| file | what |
|---|---|
| `core.tsx` | `Batch` + `Paint` (one Fill per colour, one Ink per weight, z-ordered layers), the flat atmospheric steps `STEP` 0 / 12 / 22 / 40 / 65 % (`atm`, `atmShade`, `INK_AT`, `inkCol`), shape helpers (`crownD`, `cloudD`, `blossomD`, `ribbonD`, `along`), `burstScale` (the 4-frame pop) |
| `lens.ts` | the real Pentagon plan in metres (`PENT`: side 281 m, apothem 193.4, 23.5 m / 5 storeys, courtyard apothem 75.7, five rings E..A with four 6 m light wells, ten corridors, window rows) and the pitched pinhole `MID` (13 deg, f 3000 at 1.6 km, fitted to `PENT_PLACE`): every ground point through one homography, every wall through one projection |
| `pentagon.tsx` | `<Pentagon warmAt>`: shadow on the lawn, courtyard (floor, paths, trees, pavilion, its far walls), the roof annulus, wells, corridor bridges, the two facades facing the lens (long left one in shade, right one grazing-lit; 3/4 backlight), windows, hairline ink. 23.08: windows warm on one by one along the lit wing (the conform wants ONE flat step at `warmAt`: L4, THROUGHLINE §4.5) |
| `vista.tsx` | FAR plane (`FarPlane`: April bands, `HighBars` + big top-gutter clouds, `SunDisc` (its APRIL 2026 calendar flip is retired: the sun is a light, never a character), `CloudBank` >= 1 W with a saddle behind the needle, `FarCity` 8 packed rows + an infinity strip + a dome, a castle, a temple, `Obelisk`) and RIVER plane (`RiverPlane`: cherry fringe, the Potomac with glints / rowers / sails, Memorial Bridge, the 14th Street spans, the near bank, the parkway with cars, the boat basin, a deep parkland band) |
| `valley.tsx` | `MidGround` (MID camera: lawns, ring road, Washington Boulevard with cars, jogging paths with joggers, groves, the dark treetop band just beyond the balustrade) and `NearMid` (START coords: the slope's crowns that frame the slot, the big tree where the Pentagon will land; they burst into blossom and sink below the balustrade) |
| `bloom.tsx` | `BloomCrowns`: a blossoming crown (dark mass, limbs and twigs in ink, lit / mid / shade clumps, single flowers, buds before the burst) |
| `terrace.tsx` | the DECK camera (level, horizon 800, f 1000, 9.2 m up: from the contract's seated end stranger, 62 px at feet 1238), `Terrace` (balustrade, sett paving with a border band and a drain, the slope trees' dappled shade with sunlit shafts, petal drifts, benches, bin, stroller, tulip beds, planter crabapple, hedge cut by the bottom), `StrangerBench` (drawn OVER the seated pair), `TerraceTree` (left frame), `CornerTree` (bottom-right), `LampPost` (+ hanging baskets for the wipe), `Pigeons`, `NearPetals`, `castShadowD` |
| `life.tsx` | `BirdV` (a V crossing toward the landmark in the hold), `Gulls` |
| `crane.ts` | the rig: `CRANE_T` (scene times, 0 = 20.55), `craneP(t)` on the contract's ease `cubicBezier(0.35, 0.03, 0.45, 1.0)` 21.30-23.40, the planes `FAR` `RIVER` `MID_PL` `NEAR_MID_PL` `DECK` + boxes `T1_BOX` `L2_BOX`, the wipe path `wipeAt` / `wipeMat`, `swapAt`, `sunAtStart()`, `craneSpeeds()` |
| `CraneSet.tsx` | `<CraneSet figuresStart figuresEnd deckStart deckEnd wipe p/>`: every plane in its PullLayer on ONE progress |
| `gate.tsx` | S6: `GateFacade` (the low limestone band, windows lighting 27.08-27.80, the sliding service door + `ServicePlate` CLASSIFIED / AUTHORIZED PERSONNEL ONLY, `doorOpen(t)`: shuts behind people at 25.0 and 27.4), `GateLawnTrees`, `GateFence` (a low open park fence, the tall corner post (map `S6.cornerPost`; Pip now sits at the board's foot), tulip beds, the board's kerb), `GateNear` (bollards, chain, shrub, bench + bike rack in the rail), `GateSet` (HELD since the conform: every `GATE_DRIFT` is 0; the truck is retired) |
| `sheets.tsx` | the review compositions (K4 / K5 used to judge; K3 pieces are marked STAND-IN) |

## Tiers (the clean pen, 2026-10-27)
`src/v2r/pen.ts` switches the film to the clean pen with ATTENTION TIERS (`docs/look/CRAFT.md` §b-§c; `../tiers.tsx`).
**Every export is `environment`** (the Arlington environment: no outline, calmer fills, things that ARE lines kept as
hairlines): `CraneSet`, the vista (`FarPlane`, `SkyBands`, `HighBars`, `CloudBank`, `FarCity`, `Obelisk`, `RiverPlane`,
`SunDisc`), `MidGround`, `NearMid`, `Pentagon`, `BloomCrowns`, the terrace (`Terrace`, `TerraceTree`, `CornerTree`,
`LampPost`, `StrangerBench`, `Pigeons`, `NearPetals`), the gate (`GateSet`, `GateFacade`, `GateLawnTrees`,
`GateFence`, `GateNear`, `ServicePlate`), `BirdV`, `Gulls`. Marked things: limbs and twigs, the chain, bike racks and
the bike, mullions, the stroller handle, basket chains, birds' V's, rowers, pigeon legs. Slots (`figuresStart` /
`figuresEnd` / `deckStart` / `deckEnd`, the gate's `doorPeople`, `bars`, `lawn`, `mid`, `board`, `pip`, `near`) draw
as untagged (support with thin lines): K3 / K4 / K5 pieces keep their own tier. Raw SVG fills here are far-plane
atmosphere colours and are not recoloured; raw strokes go through `useTierLine()`. A scene promotes a landmark on its
beat: `<Obelisk tier="subject">`, `<Pentagon tier="subject">` (then its outline returns, in its own shade).

## S5: the planes (END coordinates; p 0 = each scaled k about `o` and slid by `off`)

| plane | k | off (px) | contents | atm step / ink |
|---|---|---|---|---|
| FAR | 1.08 | -850, 0 | sky bands, clouds, the sun, the bank, hills, city, obelisk | 65 % (obelisk 40-50 %), none |
| RIVER | 1.15 | -780, 0 | the Potomac, bridges, near bank, parkway | 40 %, none |
| MID | 1.35 | -640, +380 | the Pentagon + lawns (it RISES into view: the dolly's share) | 22 %, hairline |
| NEAR_MID (start coords) | 1.5 | -300, -560 | the slope crowns (they SINK below the balustrade: the crane's share) | 12 % (warm-dark), full |
| DECK | 150 / 62 | -18, -13 | the terrace, pinned on the stranger (the pivot) | 0 %, full |
| T1 / L2 boxes, WIPE | - | - | terrace tree in from the left, end lamppost in from the right, the wipe sweeping right -> left | 0 %, full |

Measured (`craneSpeeds()`, on-screen points, px per 60 fps frame): far 12.4, river 11.4, mid 11.8, near-mid 10.1, deck
11.5, T1 6.2, L2 4.9 (all detailed layers <= 15); the wipe (a flat mass) 41.3. The sun lands cut by the right edge at
(1058.5, 661.1) r 60.2 and maps to SUN1 (250.0, 650.0) r 65.0 at the start. The wipe touches the backs 22.02-22.23
(14 frames), covers them fully for 11, `swapAt` = 22.117; its finial never above y 838. The caption band y 317-556:
0 non-sky pixels in all 207 frames of CraneMove. Beats by p: the big tree on the right p 0.15-0.40, the light burst as
it sinks, the Pentagon clears it on "Pentagon" (p 0.70), the obelisk rises out of the sinking crowns p 0.77-0.96.

## Decisions (and why)

- **The wipe is a lamppost with two hanging flower baskets**, entering only once its finial is below y ~840: any tall
  near post visible earlier would cross the caption band. A wipe of a few px wide pole cannot hide two figures; the
  baskets give it a 460 px mass at the backs' height.
- **No canopy over the top of the start frame.** Anything overhead must drop through y 317-556 during a crane up; the
  start's "canopy" is the warm-dark blossoming crowns flanking the slot and the slope trees' shade on the floor; the
  top 30 % is the quiet sky (the caption field), as in v3 S9.
- **The far plane slides RIGHT** so the sun travels from the slot (SUN1) to the upper right (cut by the edge): the
  near slope sinks, the foreground sweeps left, the deck holds (an orbit round the pivot).
- **The Pentagon has its own steeper camera** (13 deg) so the five rings and the courtyard read; the far bands above it
  are flat steps (the ground curves away). The obelisk is drawn ~4x its true angular size (huge yet far; CG Scale
  cues 7).
- **People stay small**: terrace backs 60-140 px by the deck camera, joggers on the Pentagon lawns 5-8 px, cars 6-10 px;
  no uniforms, aircraft, weapons, flags, guards, cameras or vehicles at the building (V1-V3, V12, V15).
- S6's fence is a low open park fence with stone piers (calm, never a security wall); the corner post stands tall.

## Open

- K3 news box, deal board and plaque are stand-ins in `sheets.tsx`; the plaque's mount is `TERRACE.plaqueMount`.
- The end stranger (contract h 62, feet 1238) puts the crane 9.2 m up: (feet - horizon) / F ~ 7 seated heights, more
  than CINEMATIC_GUIDE's 2-3; the terrace floor is therefore the bottom 35 %: it is kept in dappled shade with dark
  frames (tree, corner tree, hedge) so the bright view carries the scale.
