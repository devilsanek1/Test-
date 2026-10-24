# SHARED SETS: the sets lane of the shared world kit

`src/scenes/shared/sets/**` (barrel: `src/scenes/shared/sets/index.ts`). Props live in `src/scenes/shared/props/**`
(docs/SHARED_PROPS.md); sets place props through ONE adapter file, `sets/propSlots.tsx`.

```tsx
import {GovernmentPlaza, PLAZA, StoopStreet, Stoop, StoopBeats, stoopStreetDoors, BlueprintStreet, BlueprintWall,
  MakersLane, Workshop, WORKSHOP_CORNER, NoticeboardCorner, TelephoneWires, WIRES, DomeCity, DomeTallies, domeArcY,
  TerraceHill, TerraceRings, TERRACE, TERRACE_FLAT, OldQuarter, SiteFacade, PerspRow, Foreground, groundMarks,
  GroundMarks} from '../shared/sets';
```

![sets](shared_sets_sheet.png)

## 0. Preview (its own Remotion entry: the shared registry stays untouched)

```bash
# one frame (or several) of a set preview: node <render.mjs> SetsPreview <outDir> <t1,t2,..> --props='{"set":..,"variant":..}'
node src/scenes/shared/sets/preview/render.mjs SetsPreview /tmp/o 1.2,3.6 --props='{"set":"plaza"}'
node src/scenes/shared/sets/preview/render.mjs SetsPreview /tmp/o 0 --props='{"set":"plaza","variant":"lineArt"}'
node src/scenes/shared/sets/preview/render.mjs SetsSheet /tmp/o 2          # every set's thumbnail
```

| set id | variants |
|---|---|
| `plaza` | (S01 demo build), `lineArt`, `off`, `closeup` (S11, zoom 1.85), `dive` (zoom 3.25 into govB's lock box) |
| `stoop` | (S03 steps), `draw` (entrance draw-on), `tower` (S04: tower, seasons, ivy, cobweb), `night` (S09: night + check + ledge) |
| `blueprint` | (S02 wide: grid, stamp, pop-up, plaque count), `closeup` (zoom 2.0 on the lock) |
| `wall` | (S05 at zoom 1.08), `draw` (blueprint draws outward from the lock) |
| `lane` | (S06), `corner` (the same Workshop, S07 preset) |
| `corner` | (S07) |
| `dome` | (S08 rest), `crane` (S08 start, zoom 1.3 on (540, 1260)), `push` (15 %), `dusk` |
| `terrace` | (S10 pull-back 6.0 -> 1.0, + TerraceRings), `match` (zoom 6 hidden-match frame), `rest`, `flat` (sea of doors) |
| `old` | (S12), `board` (S13 at zoom 1.12) |

Demo event times live only in `sets/catalog.tsx` (storyboard v1 values), including the demo beat overlays
(`StoopBeats`, `TerraceRings`, `DomeTallies`). `SET_CATALOG[i].thumb()` renders a set at rest without a World (the props
lane's `SharedKitSheet` draws them in its bottom band).

## 1. The contract (every set)

- **World coordinates = canvas px at that scene's camera rest** (the storyboard numbers, 1080 x 1920). Sets author
  `world.bleed` past the frame edges for pushes, cranes and camera-continuous transitions. `x / y / scale` on a set only
  offset the whole set (thumbnails, reuse); they never change its layout.
- **Build-out on every set:** `outAt` / `outDur` (default `MOTION.unbuild.total`) run the measured un-build (lines
  loosen, fills shrink, slab collapses) on just that set, like every prop's `outAt`; scene-wide exits still use the
  engine's `ExitProvider` / `UnBuild` around the whole scene. Shared base type: `SetBase` in `common.tsx`.
- **Seconds, every event a prop.** Nothing is hard-coded: build-ins are `at` / `drawAt` / named `...At` props in scene
  seconds. Convention: a missing BUILD time = already built; a missing EVENT time = never happens.
- **Sets are LOCATIONS + anchors.** Storyboard beats that may move with a script rewrite live in small overlay
  components that read the set's anchors: `StoopBeats` (riser glyphs, tower, check, peach riser, ledge; pass it to
  `StoopStreet heroSlot`), `TerraceRings` (the 12 target rings), `DomeTallies` (the watchtower board count). States of the
  location itself stay on the set (shutters, lights out, lit windows, the plaque / Bit waves, the fixed door).
- **No fades.** Pop-ups (scaleY 0 -> 1.06 -> 1), 1-frame pops, wipes, draw-ons, swings. Static translucency only for light
  (the plaza sun path, the dome searchlight), and light exists only in the coloured state.
- **The World owns the sky and the camera.** Sets never draw the sky (exceptions: flat horizon bands, night stars, the
  dome's lighter glass sky). Put the scene's `<Sun>` in the set's `sun` slot: it is drawn exactly where it must sit in
  depth (behind the far city / rows / roofs).
- **Multiplane:** `wrap={(name, nearness, node) => <Layer depth={1 - nearness}>{node}</Layer>}` splits any set into its
  layers (nearness follows the storyboard: 0.05 sky ... 1.0 foreground). Layer names are listed per set.
- **Ink by depth** (4.8 / 3.4 / 2.2 / 1.6, far layers fill-only). Ink is in world px and scales with the camera (like the
  reference push-in). Exceptions: `detail="close"` thins govB (S11 at 1.85x); TerraceHill uses a SCREEN-space ladder
  (row 0 3.4, row 1 2.2, rows 2-3 1.6, then none) with a world-unit floor for its zoom-6 match (row 0 0.85): on-screen
  width = max(world x zoom, screen), so there is no pop across the pull-back (`terraceInk(k, zoom)`).
- **Haze ladder** (style_bible_ref2 8): far layers are fill-only and step toward the sky, day `#84B09C` -> `#98C0AE` ->
  sky; on golden skies `HALF.sand` (#E6CEB6). No per-house rects under ~6 px at rest: distant rows collapse into stepped
  skyline bands with a few >= 3 px window dots (TerraceHill, the plaza's far city).
- **The layer against the sky sits 1-2 palette steps off it.** On golden (cream) skies no facade whose top meets the
  sky is cream (sand / tan, or half-sand for far silhouettes); the dome glass uses `glassStep` (never paper-white).
- **Ground = one flat field** with 2-3 broken kerb lines, a few broken paving lines that die toward the viewer and
  sparse specks (`groundMarks`, section 2); never a full perspective tile grid (BlueprintStreet's grid is the blueprint
  sheet itself). **Foreground**: every street set takes `foreground` (ground.tsx presets) so the bottom third is never
  a dead field; it lives in the bottom band (y >= ~1480, under the platform UI).
- **Misregistration** is per object (core `Fill`); TerraceHill and the props use SCREEN-space offsets (/ zoom).
- **Render states**: `<Look fills="paper">` (line art), `<Look cascade>`, the un-build and `<Tod>` relight all work: sets are
  built from core `Ink` / `Fill` (batched paths where numerous). `LightsOut` = one palette step darker (`stepDarker`:
  cream -> sand -> tan, mintPale -> sage -> teal -> tealDark, peach -> tan; whites stay white); `Glass` = the dome glass
  (`glassStep`: a full step lighter for mid / dark tones, HALF a step for light ones: cream -> #F9F0E5, sand -> #E6CEB6,
  peach -> #F5CCAF); `Lighter` = a full step lighter. Night scenes that must KEEP day facades (S09) use a plain sky colour
  key, not `tod: 'night'`, and relight only their ground with `NightGround` (mintPale -> sage, cream -> sand, sand -> tan).
  Glows are `GlowDiscs`: OPAQUE stepped discs (never translucent rings), coloured state only.
- **Props via slots.** `propSlots.tsx` maps each slot to the props-lane component (Lock, ElephantPlaque, Bit, BrowserChrome,
  RollerShutter, ShutterPadlock, BackSoonTag, Bollard, Calendar, RailBoard, CheckFlag, TargetRing, WrenchTag, Magnifier,
  WrenchGlyph, ElephantStamp, ElephantEmblem, Citizen, EdgeOnlooker, Maker, MailSlot, CheckMark, QuestionMark). Change a
  prop's look there once and every set follows. Hero locks take the props-lane `LockProps` directly (`heroLock`, `lock`,
  `house4Lock`), so scenes drive screws / cover / bolt / cobweb / drop / pop-on through the set.

## 2. Building blocks

### Ground and foreground (`ground.tsx`)

```tsx
const g = groundMarks({vp, top, bottom: 1920, x0, x1, rays: 4, cross: 2, specks: 16, reach: 0.6, seed})  // pure paths
<GroundMarks marks={g} width={SI.far} />        // tapered broken lines + 3-10 px specks
<Foreground spec="kerb" | "heads" | "railing" | "treeL" | "treeR" | [...] | node | false at={...} />
```
`groundMarks`: 3-6 paving lines on rays to the VP, each 2-3 pen strokes with gaps, starting near the far edge and dying
by `reach` of the way down; 1-2 partial, broken cross joints; seeded specks (bigger near). `avoid(x, y)` keeps marks off
paths / props. Foreground presets (bottom band, world coords at rest): `heads` = 4 back-view heads + shoulders (props
EdgeOnlooker) at x 70 / 300 / 800 / 1015, tops 0.86-0.91 H, the centre open; `kerb` = a sand kerb band at y 1660 with
bold broken lines, bollards at x 160 and 1046 (cut by the right edge) and a drain grate; `railing` = a low iron railing
(top rail y 1710) from the left edge to an end post at x 700; `treeL` / `treeR` = a teal crown r150-165 cut by the side
edge, trunk into a tree pit at y 1700. Defaults: StoopStreet `kerb`, BlueprintWall `heads`, OldQuarter `railing` (none
while the S13 audience is on); GovernmentPlaza, NoticeboardCorner and TerraceHill none (they frame themselves).

### SiteFacade (S0) — a website building, frontal (or on a core `<Plane>`)

```tsx
<SiteFacade x={30} y={1300} w={315} storeys={6} storeyH={101.7} fill={palette.cream} browser={[100, 880, 190, 130]}
  door={[150, 1150, 90, 150]} plaque="new" lock="closed" at={61.2} offAt={...} lit={...} chromeAt={...} seed="L" />
siteFacadeLayout(props) // -> {top, browser, door, plaque, lock, windows, step}
```
x = left, y = base. Parts: brick hints, tan shade plane on the left 25 %, cream rim strip on the sun side, cornice band,
partial window panes, chunky browser window (BrowserChrome), teal door (`FacadeDoor`), plaque + lock slots. States: `at`
pop-up, `drawAt` fill-first draw-on (ink top -> bottom), `offAt` lights out (screen goes tealDark), `lit` night windows
(number = switch-on time, seeded order over `litSpan`). `lod`: `full | simple | dots | fill | auto` (auto by on-screen
width; pass it explicitly inside a `<Plane>`). `slots.{browser, door, plaque, lock}` replace parts per instance.

### PerspRow / perspRowLayout / quadRowLayout — receding rows of website houses, cheap

```tsx
const row = perspRowLayout({quad: wallQuad({vp, x: 520, top: 660, bottom: 1370, depth: 0.9}), n: 16, storeys: 4, side: 'left'})
const row2 = quadRowLayout({quads: [...], side: 'right', plaque: (i) => ..., plaqueK: 0.16})   // one quad per house
<PerspRow layout={row} popAt={(i) => ...} plaqueAt={(i) => ...} lit={night} litColor={palette.sand} lock={(i) => 'ghost'} />
row.houses[i] = {h, tier, door (quad), overDoor, lock {x, y, h}, plaque {x, y, size}, browser (quad), base, top, ...}
```
Every house is a handful of batched paths computed once in screen space through the wall homography; real props
(Lock, ElephantPlaque) only where the lock is >= `propMin` px (7), flat dots beyond. Ink 2.2 -> 1.6 -> none by tier
(`full` >= 330 px tall, `simple` >= 120, `dots` >= 36, `fill`).

## 3. Sets

### S1 GovernmentPlaza (S01, S11, S13 underlay = frame 0) — PEAK 1

```tsx
<GovernmentPlaza state="built" cascadeAt={0.03} sun={<Sun .../>}
  gov={{govA: {chromeAt, screenOnAt, shutterAt, offAt, tagAt, tagTapAt, padlockAt, glintAt}, govB: {...}, govC, govD}}
  pennantsAt={[1.23, 1.38, 1.53, 1.68]} pennantWaveAt={...} citizensAt={1.06} phonesAt={2.05}
  lanternOffAt={3.25} pigeonsAt={1.7} pigeonsFlyAt={3.3} />
<GovernmentPlaza state="lineArt" />   // frame 0 / the S13 un-build underlay
<GovernmentPlaza state="off" />       // the S01 end state = S11's hard cut
<GovernmentPlaza detail="close" windowSlot={(id, r) => id === 'govB' ? <BrowserChrome ... progress={...} ring={...}/> : undefined} />
```
- **States share every path and seed** (pixel-identical geometry). `lineArt`: ink on white fills, people as white
  tombstones, plain windows (no chrome), no pennants, no light. `built`: colour (optionally the cascade from the sun gap,
  `PLAZA.cascadeOrigin`) + the timed events. `off`: chrome on, every shutter down, padlocked and tagged, every building
  one step darker, the lantern sand, pennants up, the sun path and the clock face still bright.
- **Scale (PEAK 1)**: inside the ceiling the monumental cues are pushed: govA's colonnade runs y 758-1136 (stylobate
  1148, steps to 1208), govB's drum 750-820 under a dome ry 102 (lantern tip still 600), every door is >= 3x a citizen
  (govA door now (120, 1020, 80, 120)), the 9 citizens are 36-44 px, and the far city in the gap is two fill-only haze
  tiers (#98C0AE skyline 912-968 behind the sun's lower edge, #84B09C blocks 1030-1110) with two short cranes. The three
  onlookers are cropped to heads + shoulders in the bottom corners (<= 0.15 H visible: framing, not scale).
  Ceiling-vs-peak trade-off (for the orchestrator): with nothing above y 600 the architecture spans y 600-1208
  (0.32 H); a true playbook peak (colossus >= 0.7 H) would need the ceiling raised for this shot (or a caption-free
  first second), not a set change.
- **Ground**: one flat mintPale plaza field with the sage shadow wedges, the cream sun path, 5 broken paving lines and
  specks (no tile grid); the foreground tree stands in a tree pit at y 1662. `foreground` takes extra presets (default
  none).
- **Anchors** (`PLAZA`, `PLAZA_REST`): sun slot (630, 800) r150 (frame 0 mid-rise (630, 850)); Pip's bollard (760, 1440);
  Bit (200, 705) on govA's cornice (rendered by the set, `bit={false}` when the scene animates him); per building
  `window / door / padlock / tag / pennant / lock / plaque`; govB lock box (400, 1135) 16 x 20; clock (865, 650) r26;
  citizens, onlookers (heads (62, 1745), (196, 1818), (1010, 1765)), pigeons; `closeup` = camera (375, 793) zoom 1.85,
  sill y 1010.
- **Layers** (`wrap` names / nearness): `sun` 0.12 (behind the far city), `far` 0.1, `ground` 0.7, `buildings` 0.55 (govC,
  govA, govB, Bit, 3 pennants), `govD` 0.62, `light` 0.7 (shadow wedges, sun path, joints, benches, citizens), `near` 1.0
  (lamp post + pigeons, tree, bollard, onlookers).
- Ceiling: nothing above world y 600 inside x 90-990 (lantern tip 600); padlocks / tags at x <= 930.
- Note: in `built`, `citizensAt` makes the citizens RISE (absent before); omit it to keep them standing from frame 0 (the
  line-art frame always shows them).

### S2 StoopStreet (S03, S04, S09, S10 Part A) + Stoop

```tsx
<StoopStreet tod="day" sun={...} drawAt={...} chromeAt={...} heroLock={{cobwebAt, screwsOutAt, dropAt, rider, state: 'fixed', popOnAt}}
  stoop={{step1At, step2At}} heroSlot={<StoopBeats magnifierAt wrenchAt towerAt towerDownAt checkAt peachAt ledgeAt ledgeDur />}
  rowLock={(side, i) => 'ghost'} calendar={<Calendar ... tearAt={[...]}/>} season={[{t, s: 'green' | 'peach' | 'tan' | 'bare'}]}
  ivy={0.6} pigeonsFlyAt={...} foreground="kerb" />
<StoopStreet tod="night" nightUntil={1.6} />     // stars, peach windows, opaque lamp glow discs, tower dots, night ground
stoopStreetDoors()  // [{id: '#4' | '#5'.. | 'R1'.., side, overDoor, lock, plaque, h}] near -> far (ripples, "?", tags)
towerRise(t, towerAt, towerDownAt)  // the tower's height (camera tilt sync); never negative (the tower is an overlay)
```
- VP (720, 1060); hero house (40, 640, 480, 590); browser (170, 760, 220, 140); door #4 (230, 1030, 120, 200); lock4
  (330, 1130) 34 x 42; plaque4 (175, 1105) 50; calendar slot (385, 1040, 70, 80); step 2 riser (190, 1230, 220, 70), step 1
  (160, 1300, 280, 70); magnifier (300, 1335) r28, wrench (300, 1265); tower x 160-300 to y 700 (2 % overshoot up, 6 %
  undershoot down; the magnifier rides up at the top face); ledge (410, 1230) -> VP; lamp post x 0-60, wire (40, 650) ->
  right row, pigeons; near tree (655, 1040); bollard (930, 1420). Rows: 16 left doors, 22 right doors.
- `Stoop` is the location (two steps, pop-ups, draw-on); `StoopBeats` is the overlay of the S03-S09 beats (it reads
  STOOP anchors; magnifier / wrench `-1` = already there).
- Ground: pavement = one flat field with 4 broken paving lines + specks; default `foreground: 'kerb'`.
- Layers: `sun` 0.12, `far` 0.1, `ground` 0.4, `rows` 0.4, `hero` 0.7 (hero house + Stoop + heroSlot), `near` 1.0.
- S09 night: use a World sky colour key (`skies.night`), not the World's `tod: 'night'` (facades keep their day fills);
  with the set's `tod="night"` it relights its ground plane, road, sidewalk, horizon strip and the foreground kerb with
  the night mapping (mintPale -> sage, cream -> sand, sand -> tan) and draws the lamp glows as opaque peach /
  half-peach / cream discs. Dawn = World `wipe: 'up'` to cream + this set's peach band (`dawnAt` / `nightUntil`).

### S3 BlueprintStreet (S02)

```tsx
<BlueprintStreet popAt={{L1, ..., R4}} pressAt={...} plaqueAt={{P, L1, R1, L2, R2, L4, R3, L3, L5, R4}} gridAt={7.07}
  stampAt={8.1} ventAt={...} signSwingAt={...} blinkAt={...} lock={{screwsOutAt, coverOpenAt, boltTestAt, gapMarkAt, rider}} sun={...} />
blueprintAnchors()   // {P, L1..L5, R1..R4: {plaque, lock, overDoor, base}}
BLUEPRINT.closeup    // {cam: [580, 960], zoom: 2.0}: the close-up framing of the same world
```
Press house 360..760 (apex (560, 770), eaves 870, base 1180), window (470, 900, 180, 110), door (500, 1010, 120, 170),
lock (595, 1100) 40 x 50, plaque (455, 1085) 50, pen-nib sign r34 at (795, 930), vent puff; side buildings at the
storyboard's screen boundaries (7 PHP plates P L1 R1 L2 R2 L4 R3, 3 blank L3 L5 R4); grid -> VP (560, 950) draws near ->
far; dimension arrows, title block; stamp (330, 1400) 320 x 120. Layers: `sun`, `far`, `ground` 0.8, `press` 0.5, `sides` 0.6.

### S4 BlueprintWall (S05)

```tsx
<BlueprintWall drawAt={...} lock={{gapMarkAt, ...}} stampAt={...} calendar={<Calendar .../>} foreground="heads" sun={<Sun cx={930} cy={725} r={110}/>} />
```
Facade x -140..800 (pilasters lean ~5 deg), cornice 610-650 + tan band + sage shadow band, wing x 800-1220 (roof 840),
the sun notch, steps 1320-1480, ground below. Banner on a rod at y 680, sheet (200, 680, 576, 620), teal frame 12, the
LOCK DETAIL = props Lock `state="blueprint"` at (488, 960) size 75 (draws first: everything else draws outward from it),
stamp r40 (720, 1230). The forecourt is one flat field (4 broken paving lines + specks); default `foreground: 'heads'`
(an audience looking up at the blueprint, under the team's feet line). Anchors: `BLUEPRINT_WALL.perch` (700, 680),
`.calendar`, `.feetY` 1470. Layers: `sun`, `wing`, `facade`, `banner`, `steps`, `foreground`.

### S5 MakersLane + Workshop (S06; Workshop reused as the S07 corner)

```tsx
<MakersLane sun={...} curtainsAt={...} workshop={{glowAt, makersAt, blindDownAt, blindUpAt, signSwingAt, doorOpenAt, slotClickAt, chromeAt}} />
<Workshop layout={WORKSHOP_CORNER} blind="down" glowAt={false} makersAt={false} signSwingAt={...} doorOpenAt={...} />
```
Lane VP (430, 1040), sun (420, 985) r120 behind far-roof silhouettes, peach band 920-1040, left houses (a PerspRow in
sand / tan: their roofline meets the golden sky; curtains = sand "lit" windows), the lane = ONE flat sand field with 4
thin, broken tan shadow bands on rays from the sun and sparse 3-10 px specks; the Workshop sits on a cream kerb / step
plane (tread y 1500-1540, tan face to 1558) whose left end follows the lane's ray through (600, 1500). `WORKSHOP_LANE` (600-1000, roof
720: browser (680, 790, 220, 110), door (620, 1150, 100, 300) + MailSlot (670, 1300), sign r45 (700, 980), shop window
(740, 1060, 200, 240) + blind to 1180, bench + 3 Makers + crate) and `WORKSHOP_CORNER` (780-1220, roof 700: door
(800, 1150, 120, 310), sign r40 (850, 1080), blind window (800, 950, 140, 150)): one component, one design.
Anchors: `MAKERS_LANE.zzz`, `.messengerY`, `.pipY`, `.leakEntry`. Layers: `far`, `sun`, `roofs`, `floor`, `houses`, `workshop`.

### S6 NoticeboardCorner (S07) + TelephoneWires

```tsx
<NoticeboardCorner sun={...} board={{riseAt, railLightAt, pane1: (r) => ..., pane2, paneDarkAt, pane2ScaleInAt}}
  workshop={{doorOpenAt, signSwingAt}} readers={{riseAt, phonesAt}} pigeonsFlyAt={...} />
<TelephoneWires spec={WIRES.S07 | WIRES.S08} pigeons={[{i, x}]} />   wireAt(spec, i, x) -> point (pegged copies)
```
Sand wall 0-780 (tan cornice 840-880 + bold roof line), far roofs in half-sand (#E6CEB6, so the cornice keeps its
silhouette on the golden sky), peach band 760-860, Workshop corner, pole (1000, 620-700), board frame (140, 930, 600,
430) + rail (220, 900, 440, 30) + legs to 1490 (props RailBoard), 4 edge readers (props EdgeOnlooker), ground = one
field with 3 broken paving lines + specks; `foreground` presets optional (default none: the readers frame it).
**Wire contract**: `WIRES.S07` = y 700 / 730 / 760 at x 540 (S07 world); `WIRES.S08` = 1211 / 1235.5 / 1260 (S08 world):
the same 3 wires on screen (896 / 928 / 960) across the tilt-up / crane cut. Anchors: `NOTICE_CORNER.pip` (705, 928),
`.cart`, `.readers`. Layers: `far`, `sun`, `roofs`, `wires`, `wall`, `ground`, `corner`, `board`, `readers`.

### S7 DomeCity (S08) — PEAK 2

```tsx
<DomeCity sun={<Sun cx={700} cy={990} r={165}/>} domeAt={...} domeDur={1.1} glassAt={...} footprintAt={...} dotsAt={...}
  duskAt={42.7} towerAt={...} searchAt={...} searchAngle={(t) => ...} sky={skies.golden} />
<DomeTallies n={count} />   // scene overlay: the count on the watchtower's white board
domeArcY(x)  tallyGatePath(x, y, size, n)  boardTallyPath(n)  DOME.{apex, feet, arc, rattlerDoors, tower, pip, stipple, rows, sun}
```
Rows 0-3 on the golden atmosphere ladder (row 0 half-sand / sand with the terraced-hill silhouette far left, row 1
sand, row 2 tan / sage + ink, row 3 tan / teal + ink; no row is the sky colour); every row is BACK-FILLED in the colour
of the row behind and the sun slot is clipped to y < row 0's base (1052), so the sun never shows below the first
skyline (dome draw-on, crane, dusk included). One bold 4.8 arc (260, 1300) -> (730, 700) -> (1200, 1300) drawn from both
feet up; inside it every fill takes the `Glass` step (the rows are drawn twice: the second pass clipped to the dome;
glass sky #F9F0E5 golden, the day sky #ACD1BF at dusk), cream rim strip, 3 white glint bars, 6 meridians + 3 parallels;
uncovered strip x 90-260 with 4 doors (rattler slots); dashed footprint; watchtower (rises, cabin with a sage window and
a 34 px back-view guard: shoulders, head, peaked cap; white tally board; searchlight: flat cream at a FIXED 0.55 opacity
with dashed edges, default sweep -20..+40 deg, drawn in the dome layer UNDER the arc / lattice ink); foreground ledge
with chimney pots and the antenna (the only tealDark). Dusk: windows pop peach from the horizon outward; the glass
sky follows the dusk sage. Holds the crane start (540, 1260, 1.3) and the 15 % push. Layers: `sky`, `sun`, `city` 0.3,
`dome` 0.55 (glass, searchlight, ink), `near` 0.8, `fg` 1.0. The board count is `<DomeTallies/>`; the glass tallies on
the dome are scene choreography (use `tallyGatePath`).

### S8 TerraceHill / SeaOfDoors (S10 Part B) — PEAK 3

```tsx
<TerraceHill revealFloor={570} plaqueWaveAt={...} bitWaveAt={...} waveStep={0.06} extendAt={...} flagAt={...} fixedAt={...}
  house4Lock={{...}} mode="hill" | "flat" hazeFrom={8} foreground={...} sun={...} />
<TerraceRings at={...} />          // scene overlay (same camera): the 12 target rings, TERRACE.rings
TERRACE.{rows[k] {k, s, w, h, base, top, x0}, house4, matchCam, rings, flag, ridge, sun, hazeFrom}  terraceDoor(k, j, mode)
stairPoint(k, t, mode)  terraceInk(k, zoom)  TERRACE_HAZE
TERRACE_FLAT.{horizon 850, vp (540, 850), sun (540, 850) r240, rows, hazeFrom 6, avenue(j), avenueX}
```
`hill` (default): w_k = 90 * 0.8^k, h_k = 158 * 0.8^k, base_0 1500, base_k = top_(k-1) - 3 * 0.8^k (ridge ~700).
Rows 0-7 are houses (batched per row: fills per colour, a sand shade strip on the left 18 %, screens + bars, doors, plaque
/ lock / Bit dots never under 3 px; rows split into a core and two edge chunks, `extendAt` pops the edges). Ink by depth
in screen space (row 0 3.4, row 1 2.2, rows 2-3 1.6, none beyond) with a world floor for the match; per-house broken roof
lines with overshoot, a doubled cornice on rows 0-1, left wall edges (1 in 6 left open), window / door frames on rows
0-2. Rows from `hazeFrom` (8) on collapse into 3 haze bands (#84B09C, #98C0AE, #A2C8B6): stepped skyline blocks with a
few window dots and sand plaque specks that blink with the wave. House #4 is drawn in full detail (BrowserChrome,
FacadeDoor, plaque, props Lock `fixed`) at facade 482.5-572.5 x 1342-1500, window (500, 1372, 55, 35), door (515,
1439.5, 30, 50), lock (540, 1464.5) 8.5 x 10.5: at `matchCam` (540, 1407) zoom 6 it lands on Part A's door #4 / window /
lock and the cornice at screen y 570. THE FIXED DOOR: from `fixedAt` (default `flagAt`; -1 = on) a stepped sage /
mintPale glow arch around the door and a sage door; the cream check flag (`TERRACE.flag`: foot (548, 1342), pole 76,
40 wide) flies over the tan house above it (hill row 1, j 0 is always tan). `revealFloor`: a row (or band) shows once
its top is below that SCREEN y (14 px spatial pop). Stairs zig-zag up rows 1-6 at x ~612 (`stairPoint`). The near
street is one mintPale field with two kerb lines and specks; S10's bollard + kerb are screen-space scene props.
`flat`: the same houses on a ONE-POINT ground plane (horizon 850, camera height 650 at scale 1): row k at scale 0.74^k,
base = 850 + 650 s, streets between the rows, house columns converging on the VP, an avenue every 7 columns (cream road
wedges to the VP seen through the gaps; row 0 gaps at x 122-212 and 752-842), haze bands from row 6 up to the horizon
where the sun sits half-set (its top at y 610, under the caption block). House #4, the flag and the fixed accent are the
same. The ring anchors are for `hill`; build flat ones from `terraceDoor(k, j, 'flat')`.
Layers: `sun`, `street` 0.9, `hill` 0.6 (ground plane + bands + rows), `house4` 0.6, `foreground` 1.0.

### S9 OldQuarter (S12, S13)

```tsx
<OldQuarter sun={...} sitePopAt={[tL, tM, tR]} plaqueSwingAt={...} oldPlaque={{flipOldAt, cobwebAt, dustAt, caneAt}}
  site={{M: {chromeAt, offAt}}} />
<OldQuarter board={{riseAt, railLightAt, pane1, pane2, paneDarkAt, pane2ScaleInAt, outAt}} audience={{riseAt}} />   // S13
```
Eye level 1150, bases 1300; siteL (30, 690, 315, 610) sand, siteM (360, 820, 280, 480) cream, siteR (740, 700, 310, 600)
mintPale (SiteFacades with browser windows, doors, locks, stoops; the facades whose tops meet the golden sky are a step
off it); hanging plaques (props ElephantPlaque `hanging`) at (300 / 590 / 800, 1190), siteM's turns old; street gap
640-740 with the second row (sand / tan, every third plaque old), far city and a peach band only in the gap; the tree is
cropped right and stands in a tree pit at kerb height (1464); sidewalk and street are flat fields with broken paving
lines + specks; kerb 1500, bollard (700, 1450); default `foreground: 'railing'` (none while the S13 audience is on). S13: board (300, 1090, 500, 310), rail
(380, 1060, 340, 28), legs to 1480; audience heads (90, 1290) (200, 1350) (890, 1320) (1000, 1280). Anchors:
`OLD_QUARTER.crates` (never siteM), `.pipBoard`, `.sun`. Layers: `far`, `sun`, `second`, `ground`, `sites`, `board`,
`near`, `audience`, `foreground`.

## 4. Continuity contracts (storyboard section A)

| contract | where |
|---|---|
| frame 0 = S11 cut = S13 un-build: plaza `lineArt` / `built` / `off` share geometry; Pip's bollard (760, 1440); Bit (200, 705) | GovernmentPlaza |
| S01 govB lock box 16 x 20 at (400, 1135) -> S02 (props Lock size 20 / 50) | PLAZA.gov.govB.lock, BLUEPRINT.lock |
| S04 lock4 (330, 1130) 34 x 42 -> S05 blueprint lock (488, 960) 60 x 75 (props Lock `blueprint`) | STOOP.lock4, BLUEPRINT_WALL.lock |
| S10 Part A lock4 -> Part B house4 lock 8.5 x 10.5 at zoom 6 | TERRACE.house4, TERRACE.matchCam |
| S07 wires -> S08 wires (same screen height / spacing) | WIRES.S07 / WIRES.S08 |
| S08 sun set x 700 / S09 VP at screen (700, 1000) | DOME.sun; STOOP.vp (720, 1060) with S09's camera (560, 1020) |
| S10 row-7 ring r7 -> S11 loading ring | TERRACE.rings[7] |
| S06 workshop = S07 corner; S07 board = S13 board; S12 street -> S13; S03 street in S04 / S09 / S10A | Workshop presets; RailBoard in both; OldQuarter; StoopStreet |

## 5. Decisions (storyboard md vs JSON)

- S04 tower: JSON (600 px, top y 700), now in `StoopBeats`. S03 "everywhere": both supported (`rowLock={() => 'ghost'}`
  and wrench tags at `stoopStreetDoors()[i].overDoor`). S08 dome: JSON (~80 %, mirrored, action left). S10: `mode:
  'hill'` (JSON, default) or `'flat'` (md's "doors to the horizon", on a one-point ground plane). The S10 dive target
  stays the row-7 ring: rows 0-7 are houses, the haze starts at row 8. The S01 push (1.04 vs 1.08) and the S13 hope pose
  are scene / mascot calls.

## 6. Render cost

Measured with `preview/render.mjs`, full 1080 x 1920, concurrency 2, 12 frames over each demo (incl. page setup), review 4,
on a shared machine (load average ~7 on 4 CPUs): the unchanged BlueprintStreet measured 141-180 ms against 131 before,
so read these as roughly x1.1-1.4 of an idle machine.

| set | ms / frame |
|---|---|
| GovernmentPlaza (S01 demo: cascade, chrome, shutters, citizens, onlookers) | 204 |
| StoopStreet (+ kerb foreground) | 200-232 |
| BlueprintStreet (unchanged: the load control) | 141-180 |
| BlueprintWall (+ heads foreground) | 209 |
| MakersLane | 130-225 |
| NoticeboardCorner | 178 |
| DomeCity | 142 |
| TerraceHill (during the 6x pull-back; haze bands replace ~14 far rows) | 152 |
| OldQuarter (+ railing) | 148 |

(KitDemo, for comparison: ~113 ms/frame idle.) Rows, cities and terraces are batched (a few paths per house / row);
static paths are memoised at module level; real props only where they are big enough to read.

## 7. Gaps / notes for scene builders

- Scene-owned by design: the sun (and its morphs), Pip, Bit's choreography (the plaza draws an idle Bit unless
  `bit={false}`), citizens' / readers' timing beyond the slots, the beat overlays (`StoopBeats`, `TerraceRings`,
  `DomeTallies`: the sets lane ships them, the scene places and times them), S04 ghosts and leaf, S08 glass tallies /
  attempters / stipple, S09 flashlight and "?" ripple (anchors: `stoopStreetDoors()`), S10 keeper / snail / bollard
  (anchors: `stairPoint`, `terraceDoor`), the S11 progress bar (pass `windowSlot` for govB), crates and the makers'
  cart.
- The plaza's `built` cascade uses the core `<Look cascade>`; if a scene wants its own cascade, omit `cascadeAt`.
- Sets read the props through `sets/propSlots.tsx`; `NoticeboardPlaceholder` is kept there only for reference.
