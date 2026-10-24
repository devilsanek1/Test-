# SHARED PROPS: the props lane of the shared world kit

`src/scenes/shared/props/**` (barrel: `src/scenes/shared/props/index.ts`). Sets live in `src/scenes/shared/sets/**`
(docs/SHARED_SETS.md); scenes use both.

```tsx
import {Lock, Bit, BrowserChrome, ElephantPlaque, RollerShutter, PowerGlyph, SunPress, RailBoard, Keeper} from '../shared/props';
```

Dev sheet: `src/dev/SharedKitSheet.tsx` (composition `SharedKitSheet`, 10 s; every cell loops on a 5 s clock, the bottom
band shows a thumbnail of every set from `sets/catalog.tsx` plus the SeaOfDoors (`TerraceHill mode="flat"`, added by the
sheet next to TerraceHill unless the catalog lists it): 10 thumbnails; the QA modes `look` / `unbuildAt` reach the
thumbnails too). The sun cells show each morph on two skies (pie: day + golden; 45-minute wedge: golden + dusk).
`mode: 'context'` also has the S10 keeper (h 300) and the S13 caretaker (h 225) at film size. `mode: 'lock'` = the P1 bolt
test at the S02 close-up size (200 px) and at 100 px on a teal door, without the bracket, + fixed / blueprint / paper /
sketch / bracket variants. `mode: 'heads'` = cap wearers (Keeper, Caretaker, capped EdgeOnlookers) and the Ghost at film
size and at phone-thumbnail scale (x 0.3), colour and paper.

```bash
scripts/still.sh SharedKitSheet 2.5 out.png                                         # every prop, mid-animation
node scripts/render-frames.mjs SharedKitSheet /tmp/o 3.5 --props='{"mode":"context"}' # props at FILM SIZE on plain walls
node scripts/render-frames.mjs SharedKitSheet /tmp/o 4.6 --props='{"look":"paper"}'  # frame-0 line-art state
node scripts/render-frames.mjs SharedKitSheet /tmp/o 2.3 --props='{"unbuildAt":2.0}' # the un-build on every prop
node scripts/render-frames.mjs SharedKitSheet /tmp/o 2.5 --props='{"thumbs":false}'  # props only (cost check)
node scripts/render-frames.mjs SharedKitSheet /tmp/o 0.9,1.3,1.5,1.9 --props='{"mode":"lock"}'  # stub, stop, ghost, Bit
node scripts/render-frames.mjs SharedKitSheet /tmp/o 0.5 --props='{"mode":"heads"}'  # add "look":"paper" for line art
scripts/strip.sh SharedKitSheet 0.45 1.6 o.png --crop=216x196+216+84 --scale=1 --cols=12   # one cell, every frame
```

## 1. The contract (every prop)

| prop | meaning |
|---|---|
| `x, y` | anchor in the parent's coordinates (world px at camera rest). Each component states its anchor (box centre, top-left, feet, wall point...). |
| `size` / `scale` | the main dimension in world px (lock height, plate side, Bit length, figure height `h`...) or a plain scale. |
| `depth` | ink ladder `'front' 4.8 \| 'mid' 3.4 \| 'far' 2.2 \| 'hair' 1.6 \| 'none'`. `ink` = explicit width in WORLD px. Ink scales with the camera (like the reference push-in); pass `ink={w / zoom}` to hold a screen weight through a zoom. |
| `at`, `dur` | build-in: draw-on starts at `at` (omit = already built). `dur` stretches the build schedule where it is meaningful (Lock, BrowserChrome, ElephantPlaque, LockCrate). |
| `outAt`, `outDur` | build-out of just this prop: the measured un-build (lines loosen, fills shrink, ink retracts), default 0.5 s. Every prop takes it (`withOut()` in `common.tsx` adds it where a prop has no own exit). The scene un-build (`unbuild` transition, `<UnBuild>`) works without it. |
| `seed` | deterministic variation (give siblings different seeds). |
| `state` | the named rest state; named event times (`screwsOutAt`, `swingAt`, `slamAt`...) animate from it. |

- **Seconds everywhere, nothing hard-coded**: every beat time comes in as a prop (the storyboard JSON is on the v1 VO and is
  warped to v2 by `scripts/timewarp.py`).
- **No fades**: things pop (7 % spring), draw on, wipe, slide, swing, squash. Static translucency only for the scan beam.
- **Misregistration in SCREEN space**: one offset per object, 2.4-4 px, 2/3 right-down; divided by the accumulated screen scale
  (camera zoom x parents x prop scale, read from `useXf()`), so a zoom-6 hidden match keeps the same print offset on screen.
- **LOD by on-screen size** (the same `useXf()` scale as `screenSize`/`toScreen` in `lib/cine/state.tsx`): each prop drops
  detail below its thresholds (listed per prop) and becomes a flat dot / bar far away.
- **Render states**: `<Look fills="paper">` turns every fill white (frame 0 / loop line art; Bit, the sun and its overlays stay
  coloured), `<Look ink={false}>` = fills only; light (glow steps, scan beam) exists only in the coloured state.
- **Time of day**: fills go through `<Tod>` like every kit `Fill` (World sky keys relight them).
- Helpers in `common.tsx`: `usePropFrame`, `PropRoot`, `misregScreen`, `pendulum` (motion spec #14: -16 -> 0, ~0.5 s),
  `landSquash`, `hopY`, `alongPath`, `withOut`, `DEPTH_INK`.

## 2. P1 Lock: the PHP lock (and the fix)

```tsx
<Lock x={400} y={1135} size={20} depth="far" />                                    // S01 govB lock box (16 x 20)
<Lock x={595} y={1100} size={100} screwsOutAt={5.2} coverOpenAt={5.4} boltTestAt={5.9}
      bit />                       // S02 close-up: stops short 6.10, ghost "should be" 6.26-6.56, Bit peeks out of the socket 6.62
<Lock x={488} y={960} size={75} state="blueprint" at={21.5} />                      // S05 detail, ink on white
<Lock ... state="sketch" />  <Lock ... state="ghost" popOnAt={14.2} />  <Lock ... state="dot" />
<Lock x={330} y={1130} size={42} state="fixed" at={1.2} checkAt={1.4} tagSwingAt={2} />  // THE FIX
<Lock ... dropAt={48.6} dropDist={260} rider={<Bit .../>} />                        // falls with a clunk, Bit rides
<LockCrate x={440} y={1440} size={80} n={3} />   <NewLockIcon size={50} grip="bottom" />
<LockSpecks spots={[{x, y, size, at, fixed}]} ink={0.6} />                          // hundreds of far locks, 3 paths
```

- Anchor = box centre; `size` = box height (width 0.8 x). Local design box 80 x 100; `LOCK` lists the local points (`gap`,
  `housing`, `strike`, `slot` (socket), `rim`, `peek`, `keyhole`, `screws`, `loop`, `tip`, `boltR`) and
  `lockPoint(x, y, size, LOCK.gap)` maps one to world coordinates (place rings, a rider).
- Look: sand box, left tan shade strip, two screws, a hinged cream cover with a keyhole. Inside (cover open, review 5: the
  central metaphor must read without any engineer's marks): a teal cavity; a narrow guide at the left; a LONG cream BAR
  bolt (13 units tall, up to 30 long, bevelled tip, a groove line) aimed straight at the receiving SOCKET on its axis: a
  tealDark notch in the strike's left face (one step darker than the cavity) lined by a 3-unit CREAM RIM, so the hole is
  the highest-contrast thing in the box. Before the test a 5-unit stub already points at it. Bit lives in the socket.
- Read check (`mode: 'lock'`): at 100 px and at the S02 close-up size (200 px) the sequence reads as "the bolt almost
  reaches its hole and stops short" with no bracket; the gap left is 9 units (9 px at 100 px, 18 px at 200 px).
- States: `closed` (default) | `open` (cover already open) | `blueprint` (ink on white + centre line + dimension line) |
  `sketch` (loose double strokes, for the leaked page) | `ghost` (dashed outline) | `dot` (LOD) | `fixed`.
- Events: `screwsOutAt` (spin 0.1 s, pop out, 0.08 s apart), `coverOpenAt` / `coverCloseAt` (hinge 0.2 s: scaleX 1 ->
  edge-on (an ink edge line) -> -0.3, its tan back showing: ~6 frames at 30 fps), `boltTestAt` (the bar is a stub until
  then; it shoots 0.2 s out(cubic) ~77 % of the way from the guide to the socket mouth (75 % from the stub), hits its stop
  9 units SHORT of the socket and knocks back 3 units over 0.14 s; the fixed bolt seats IN the socket with a 1-unit
  settle), `shouldBeAt` (default boltTestAt + 0.36 on a flawed lock, `false` = never: a dashed CREAM ghost of the full
  bolt slides from the short tip into the socket in 0.07 s, holds `shouldBeDur` 0.3 s, then is gone in one frame: the
  "should be"), `gapMarkAt` (optional dashed dimension bracket + ring, cream on the cavity, ink on paper, 0.17 s; if used,
  put it after the ghost, >= boltTestAt + 0.7), `glintAt`, `lensGlintAt`
  (white bar sweeps the box, 0.32 s), `cobwebAt` (0.3 s), `dropAt` + `dropDist` (gravity 4200 px/s^2, 10 deg tilt, landing
  squash), `popOnAt` (7 % spring), `checkAt` (0.17 s; on the tag for `fixed`), `tagSwingAt`. Slots: `rider` (lock-local,
  rides every move), `inside` (in the cavity under the cover).
- `bit` (true or `{peekAt, hideAt, alertAt, size, peekAmount, seed}`): Bit inside the cavity, flipped to face the bolt,
  peeking OUT OF the socket into the gap (clipped at the socket mouth): head, eye and antennae in the gap, the antennae
  just touching the bolt tip. `peekAt` defaults to boltTestAt + 0.72 (stop +0.2, recoil, ghost 0.36-0.66, then Bit).
  Defaults: size 15 lock units (30 px on a 200 px close-up, so his pupil shows), peekAmount 0.28.
- Paper / line-art state (`<Look fills="paper">`, frame 0 and the S13 un-build): the box, the cover outline and the
  keyhole stay ink at every LOD >= 1 (the keyhole fill is look-exempt), screws stay ink dots, an open lock shows its
  cavity, guide, bar, strike and socket as outlines (the ghost and bracket switch to ink); LOD 0 gets an ink outline. A
  closed lock never reads as an empty box.
- **Fixed variant** (resolves the S06 "shackle" conflict): the SAME box silhouette in sage, the bar seated in the socket, and a cream
  check tag on a loop at the top-right corner. Its build is body -> loop -> tag at 0.07 s steps, so the S06 "shackle" beat is
  the loop: the fix reads as the same lock, repaired.
- LOD: < 7 px a flat box, < 28 px no screw slots / hinge / shade, full above (the zoom-3.25 dive and 80 x 100 close-up).
- Match cuts: one design at every size (S01 16 x 20 -> S02 40 x 50; S04 34 x 42 -> S05 blueprint 60 x 75; S10 A -> B at zoom 6).
  At a cut, give both sides the same on-screen ink (`ink`), e.g. S01 at zoom 3.25 with `depth="far"` = 7.2 px on screen.

## 3. P2 Elephant emblem, plaques, stamp

```tsx
<ElephantEmblem x y size={60} style="modern|old" mode="auto|line|solid" bg={plateColour} />
<ElephantPlaque x y size={50} />                                    // square sand wall plate (anchor = centre)
<ElephantPlaque ... variant="blank" />  <ElephantPlaque ... size={4} variant="dot" blinkAt={51.2} />
<ElephantPlaque x={wallX} y={wallY} size={90} variant="round" side="right" swingAt={27.5} />    // anchor = bracket wall point
<ElephantPlaque ... size={120} variant="hanging" flipOldAt={62.4} cobwebAt={63} dustAt={63.1} caneAt={63.3} />
<ElephantStamp x={330} y={1400} rx={160} ry={60} slamAt={7.9} />   <ElephantStamp x y r={40} at />
<PlaqueSpecks spots={[{x, y, size, at, old}]} />                    // S10's wave: dots blink on, batched
```

- One generic ink elephant, side-on, trunk raised (Pip copies the pose in S02); never periwinkle, never the PHP logo. A single
  silhouette outline + far legs + ear + eye; solid ink silhouette under ~24 px on screen (reads at 14 px), line art above,
  details (wrinkles, trunk rings, toenails) from 40 / 70 px.
- `age="old"` (or `flipOldAt`): tan plate with a chipped corner, curlier details (ear spiral, curled tail, trunk flourish,
  engraved lines), cobweb, 5 dust specks, a 70 px ochre cane the emblem leans 12 deg on (`caneAt`: pop, then the lean).
- Events: `tickOnAt` (count pop), `pulseAt` (112 % + two ink ring pulses, 0.2 s), `swingAt` (round / hanging: pendulum),
  `flipOldAt` (paper flip 0.2 s, swaps at the edge-on), `cobwebAt`, `dustAt`, `caneAt`, `wobbleAt`, `blinkAt` (cream flash +
  125 %). Stamp: `slamAt` = ink ring 0.13 s, then the print 2.6 x -> 1.0 x in 0.27 s (motion spec #15).
- `signCentre(x, y, size, side)` = the face centre of a hanging sign.

## 4. P3 Bit, the ink beetle

```tsx
<Bit x={200} y={705} size={16} />                                     // anchor = feet, middle of the body; faces right
<Bit ... peekAt={6.4} peekAmount={0.75} hideAt={7.2} />              // peeks forward past an edge at x (clipped behind it)
<Bit ... hopAt={3.2} />  <Bit ... alertAt={24.0} alertDur={0.9} />    // hop with squash; ink "!" + antennae up
<Bit crawl={{at: 18, path: [[330, 1112], [360, 1000]], speed: 60}} state="scuttle" />
<Bit ... state="silhouette" />  <Bit ... state="doodle" at={32} />   // wave speck / the leaked page's line version
<BitSwarm spots={[{x, y, size, at, flip}]} />                         // S02 seven locks, S10 every lock: ONE path
```

States: `idle` (antennae wiggle, breathing) | `peek` | `hide` | `crawl` | `scuttle` (fast legs) | `ride` (calm; ride by
nesting him in a moving parent, e.g. a Lock `rider`) | `hop` | `alert` | `silhouette` | `doodle`. Solid ink in every Look
state (he is in the frame-0 line art). LOD: < 6 px silhouette; the cream eye is drawn above that and kept >= 1.4 px radius
on screen (so the 16 px hook-frame Bit still has a face on a phone); the shell highlight from 12 px.

Gaze and blink (review 5, from 24 px on screen; the eye grows continuously over 20-28 px to make room): an ink PUPIL in
the cream eye looks toward the action. `look` = `'auto'` (default: forward on a peek / crawl, up on an alert or a hop,
idle Bits glance forward / up / back with instant saccades every ~1.6 s, seeded) | `'forward'` | `'up'` | `'back'` |
`'down'` | `[dx, dy]` in his facing frame (+x = the way he faces, so it follows `flip`). Calm Bits (idle / peek / ride)
blink on their own every ~2.6-4 s (2 frames: the eye becomes a cream lid curve); `blinkAt` adds blinks, `blink={false}`
turns them off. Never while the "!" is up. Recommended size for
wide-shot cornice / plaza Bits: 20-24 px. `bitPath(x, y, size)` adds one
silhouette to your own batch. The kit `Icons.Bug` (orange, top view) is NOT Bit: use Bit for the story's bug.

## 5. P4 BrowserChrome, P6 progress bar + rings

```tsx
<BrowserChrome x={270} y={860} w={210} h={150} chromeAt={0.46} screenOnAt={0.94} offAt={2.87} />  // top-left anchor
<BrowserChrome ... state="off" />  <BrowserChrome ... blinkAt={[10.2]} />  <BrowserChrome ... content={({w, h}) => ...} />
<BrowserChrome x y w={440} h={30} mode="addressRail" railLightAt={32.1} />                       // the board's top rail
<BrowserChrome ... progress={{at: 55.0, steps: [{t: 55.2, v: 0.04}, {t: 55.9, v: 0.08}, {t: 56.6, v: 0.11}]}} ring={{at: 54.9}} />
<LoadingRing x={462} y={875} r={10} spin />   <TargetRing x={600} y={858} r={7} popAt={53.6} pulseAt={54} />  // same component
<ProgressBar x y w={110} h={18} steps={[...]} />   chromeScreen(x, y, w, h) -> the screen rect below the bar
```

- Chunky chrome: tealDark title bar (default min(30, 0.27 h)), three dots (cream / sage / peach, 0.25 bar radius), a cream
  address pill (0.6 bar), ink frame by depth. Screen: cream glow + peach header block + 3 hairlines (or your `content`).
- `chromeAt`: bar wipes L->R (0.12 s), dots pop 0.04 s apart, pill wipes 0.2 s; with `chromeAt` the window is a plain glass
  window before it (`plainFirst`). `screenOnAt` lights the screen (glass sage before it, or `glass`), `offAt` pops it to
  tealDark (lights out, one CRT line frame), `blinkAt` = 2 white frames.
- LOD by on-screen width: < 18 px a flat bar + screen (window dots), < 70 px no hairlines / dot rings.

## 6. P5 Shutters (S01, S11)

```tsx
<RollerShutter x={270} y={860} w={210} h={150} slamAt={2.82} />                        // covers the window rect
<RollerShutter ... state="down" peephole={{x: 375, y: 935, r: 12}} />                 // a real hole: the bar shows through
<ShutterPadlock x={375} y={1015} at={3.72} glintAt={4.28} />                          // 24 x 28, body centre
<BackSoonTag x={405} y={1006} at={3.45} tapAt={58.2} />                               // hang point; tag 30 x 36 below
lightsOut(colour)  // the 1-frame step map: cream->sand, sand->tan, mintPale->sage, white->cream, peach->tan
```

18 px tealDark box with ink; the curtain unrolls (tealDark, ink ribs every 14 px moving with the bottom edge, sand bottom
rail with a handle). `slamAt`: 0.16 s ease-in drop + a 6 px bounce; `liftAt` rolls up (0.3 s). The padlock is visually
distinct from the P1 door lock (a shackle loop, no cover / screws). The tag swings -16 -> 0 (0.5 s); `tapAt` swings again.

## 7. P7 Sun morphs (sun-local overlays; r = 110 / 120 / 150 / 165)

```tsx
<Sun cx cy r={150}>{(r) => <PowerGlyph r={r} glintAt={2.155} />}</Sun>            // bold frame-0 glyph (r56, 10 px at r150)
<PowerGlyph r={r} inkOnAt={57.4} />                                                 // S11 draws on
<PowerGlyph x={430} y={1245} ring={26} width={10} color={palette.ink} colorAt={67.4} toColor={palette.cream}
            fly={{at: 70.10, dur: 0.37, to: [630, 850, 56]}} />                     // S13 pane glyph docks on the sun
<SunPress at={2.28} cx cy r><Sun .../></SunPress>                                  // 0.88 squash 0.08 s, release 0.2 s, ripple r->r+40
<SunPress at={68.0} amount={0.06} .../>  <SunPress mode="land" .../>               // S13 echo / S06 landing (-10 % y, in place)
<Sun ...>{(r) => <SunPie r={r} n={10} cream={3} spokesAt={8.97} slicesAt={9.82} solidAt={10.6} />}</Sun>   // 7/10; n=3 cream=1 for 1/3
<Sun ...>{(r) => <HoursClock r={r} at={33.9} spinAt={34.0} spinDur={1.1} turns={3.5} hourSteps={4} outAt={35.2} />}</Sun>
<Sun ...>{(r) => <MinuteWedge r={r} at={39.2} dur={0.61} fraction={0.75} />}</Sun>                         // ticks pop, one sweep, a tick
<WaxSeal from={[sunEdgeX, sunEdgeY]} to={envelopeSeal(ex, ey)} at={25.70} dur={0.33} arc={120} />          // world coords
<SunGlowSteps cx cy r at={69.1} />   // OPAQUE stepped discs peach 1.25 r + cream 1.5 r; render BEFORE the Sun
<Sun ...>{(r) => <HeatTicks r={r} at={22.0} />}</Sun>
```

- `SunPie`: each "missing" slice (`sliceColor`, default cream) carries an ink RIM ARC on the disc edge, so on a cream
  (golden) sky the disc silhouette stays whole and the slice reads as a slice, not a hole. Spokes default to far ink (2.2:
  dividers, not a wheel) and retract on their own 0.1 s after `solidAt` (`spokesOutAt` overrides), so the solid end state
  is a clean disc.
- `MinuteWedge` ("45 minutes"): 4 ink quarter ticks pop (0.04 s apart), then the hand sweeps a PEACH sector (`sweepColor`)
  with an ink rim arc and an ink start radius; a thin orange ring stays outside it. Peach contrasts with the day (mint),
  golden (cream) and dusk (sage) skies and with the orange disc, so "3/4 swept" is the dominant shape on any sky
  (checked on golden and dusk in the sheet).

The seal is the film's one allowed orange prop (r16, wax drips, ink ring, a tiny solid elephant); it pops out of the sun,
drops along a dotted ink arc (the trail retracts after the landing), squashes, settles with a pendulum.

## 8. P8 RailBoard + LeakSheet (S07, S13)

```tsx
<RailBoard x={140} y={930} w={600} h={430} rail={{w: 440, h: 30}} riseAt={30.6} railLightAt={32.1}
  pane1={(r) => <LeakSheet x={r.x + r.w / 2} y={r.y + r.h / 2} at={30.5} />} pane2={(r) => <LeakClones spots={...} />} />
<RailBoard x={300} y={1090} w={500} h={310} rail={{w: 340, h: 28}} paneDarkAt={67.4} pane2ScaleInAt={67.9} outAt={69.84} ... />
<LeakSheet x y w={210} h={270} at doodleAt ringAt lensWipe={{at: 30.48, from: [620, 1500], peak: 8}} />
<LeakSheet ... flutter={{at: 30.2, from: [-200, 1100]}} />   <LeakSheet ... peg scale={0.4} />   // S06 blow-in / wire copy
boardPanes(x, y, w, h) -> the two pane rects;  lensWipeAt(t, lensWipe, rest) -> where a lens wipe is (scenes can reuse it)
```

Wraps the kit `Noticeboard` (teal 13 px frame, mintPale panes with glints, legs) with a BrowserChrome `addressRail` on the top
frame. `riseAt` (0.33 s out(exp)), `railLightAt`, `paneDarkAt` (+ `darkPane`), `pane2ScaleInAt` (0.2 -> 1, answer-panel
curve). Un-build: linework retracts, pane 2 is the LAST fill to go. The leaked page is drawn by us (the kit `Paper` has no
lock sketch): white, sand dog-ear, 5 px pin dot (or two pegs), heading bar, the Lock `sketch` + a Bit `doodle`, an ink ring.
Lens wipe = motion spec T-MATCH: grow to `peak` about `focus` in 4 f, 3 f of full white, shrink into place in 6 f.

## 9. P9-P17 everything else

| component | anchor / size | notes |
|---|---|---|
| `Envelope` | centre; `size` 60 (x 40) | `pullFromCoatAt` + `coatY` (rises from behind the coat line, twist 0.3 s), `carry` (walk bob), `slot={{at, x, y, w}}` (aligns, slides through in 0.25 s, clipped by the slot). `envelopeSeal(x, y)` = seal point. |
| `MailSlot` | centre; 50 x 10 | sand plate, dark slot, `clickAt` flap. |
| `Snail` | feet; `size` 24 (S09 ~12, S11 ~24, specks) | `popAt`, `crawl={{at, speed: 6, max}}` (peristalsis), `hideAt` (into the shell), `flip`. |
| `Calendar` | top-left of 70 x 80 | `pages` (`season` 0-3 pictograms, `yearPages(n)` 3 x 4 grids, `summer` peach heat-wave, `blank`), `tearAt[]` (each page flips up and flies off in `tearDur` 0.1 s). No numerals. |
| `Bollard` | bottom centre; 50 x 90 | cream, ink 4.8, tan band, base. `bollardTop(x, y)` = Pip's perch. |
| `SparkleTablet` | centre; 60 x 85 | white tablet, ink four-point sparkle twinkling by size, `raiseAt`. `sparklePath()` for your own. |
| `ScanBeam` | `from` -> `to` | flat mintPale at fixed 0.5 opacity, dashed ink edges; `at` (shoots out 0.25 s), `sweep`, `convergeAt`. |
| `MakersCart` | ground under the centre; `size` 160 | ochre handcart, crates of fixed locks; `roll={{at, to, dur}}` (wheel turns with the distance), `dropCrateAt[]` (last crate first; lands with a tick and STAYS in world coords), `skipAt`, `pusher`, `flip`. |
| `Tram` | centre x, top y; 1500 x 600 | teal, mintPale windows, peach lamps, ink 4.8; `cross={{at, dur: 0.4, from: -1100, to: 1100}}`; `tramRoof(y)` = perch. |
| `CheckMark`, `MarkRing` (`pingAt`), `Cobweb` (`corner`), `Magnifier`, `WrenchGlyph`, `WrenchTag` (sage + cream wrench), `CheckFlag` (`raiseAt`), `QuestionMark`, `AlertMark`, `Swing`, `PopAt` | centre (flag: pole foot) | P15: the same marks in every scene. Check 0.17 s, ring 0.17 s. |

### P11 back-view figure presets (`Figures.tsx`)

Anchors are the FEET; `h` = total height (world px). Common: `riseAt` (own height from behind the feet line, 0.33 s
out(exp)), `walk={{at, hz, to, dur}}`, `bob`, `flip`, `depth` (default by size: >= 260 front, >= 120 mid, >= 70 far, else hair).

| preset | look | extra props |
|---|---|---|
| `EdgeOnlooker` | tier A: head centre + `head` diameter; a long coat that ALWAYS runs off the frame bottom (its length is derived every frame from the camera transform: frame bottom + 40 px, never less than world.h + bleed; `frameBottom` overrides), so no hem and no legs can show; hanging arms (sleeve seam, cuff, sand hand at a natural arm length), a fixed-length white rim strip, ink 4.8 | `raisePhoneAt` / `lowerPhoneAt` (the arm swings up about the shoulder, 0.3 s outBack, phone in hand, shoulder jolt), `phoneSide` (default: the side facing the frame centre), `arms` ('both' / 'near' / false), `hair` ('cap' = our `BackHead` over a straight collar band, head raised so the neck shows; never the kit cap or kit head), `acc` ('hood' drawn here, under the head; not with 'cap'; 'backpack' dropped), `body`, `rim` |
| `Citizen` | 40-55 px kit Person with legs | `silhouette` (flat sage cut-out; white tombstone in paper), `color` |
| `Investigator` | 110-140 px, ink shield badge on the back | `raiseAt` / `lowerAt` (arm swings up with a SparkleTablet), `arm` |
| `Messenger` | teal coat | `pullAt` (envelope out of the coat to shoulder height), `holdEnvelope`; `messengerHand(x, y, h)` |
| `Maker` | teal + cream apron (Y straps meeting mid-back, bow, apron edges; crossed X straps read as "crossed out"); no caps | `bust` (waist-up at a bench), `work` (nodding hz) |
| `Keeper` | sand coat with a tan collar band, teal cap, ochre hair, teal trousers, ochre tool belt (hammer, pouch); NOT a maker | `reachAt` + `holding` (e.g. `<NewLockIcon/>`), `installAt`, `climb={{at, steps, run, rise}}`, `cap` (colour or false), `hair`; < 30 px = sand speck |
| `Caretaker` | teal coat with a tealDark collar band, sage cap, ochre hair, key ring r22 with sand keys | `raiseKeysAt`, `jingleAt`, `glintAt`, `cap`, `hair` |
| `Attempter` | hooded, tealDark, ink hood point | `mode` `tap` (`tapAt[]`, ripple arcs at `tapPoint`) / `rattle` (`rattleAt`, handle + marks) / `stand` |
| `AttemptStipple` | 4-8 px hooded tombstones | ONE path for hundreds, each pops at `at` |
| `Ghost` | ink-only back-view figure on `BackBody` (no fills): a clean head dome flowing into the neck lines (the only opening is the nape), ears, collar band, torso, walking legs | `at` draws it on (torso, head, legs, collar), `walk`, `hair` 'bun' (other hair / `acc` not drawn) |

The presets mirror the kit Person's seeded torso width / head radius / shoulder rounding and coat pick (`personGeo`,
`personCoat` in `Figures.tsx`) to keep hand-placed arms, caps and belts on the body; if `kit/Person.tsx`'s `makeSpec` draw
order changes, update them.

Back-view heads for cap wearers (reviews 4 + 5: at phone size a cap over a full hair-colour disc, a zig-zag nape and a V
chevron collar read as a bearded face looking at the camera). `Keeper`, `Caretaker` (via `BackBody`) and capped
`EdgeOnlooker`s draw `BackHead` (Figures.tsx), never the kit Person's head: a sand NECK block (0.45 x head wide, style
bible 6) visible between the head and the collar; the hair ends in a SMOOTH NAPE (the sides taper into the neck, a
shallow curve crosses it: no zig-zag, no round hair "chin", no strands under the cap); sand ears just under the cap band;
the cap covers the top ~65 % down to a gently sagging band, its back STRAP a clear notch (an arch cut up into the cap
with HAIR showing through, over a thin strap with a buckle tick) and a button. The collar is a straight `CollarBand` a
step darker than the coat (no V). `h` is their true feet-to-cap height. Checked in colour and line art at film size and
at phone-thumbnail scale (`mode: 'heads'`).

## 10. Continuity contracts this lane honours

- Frame 0 = the S13 un-build end: every prop has a clean `Look fills="paper"` state (ink on white; Bit stays ink; the sun keeps
  its bold cream glyph); `PowerGlyph fly` docks the pane glyph on the sun as the frame-0 glyph.
- Lock silhouette is one design at every size and in `blueprint` / `sketch` (match cuts S01->S02, S04->S05, S10 A->B).
- S10 row-7 target ring = S11 loading ring: `TargetRing` IS `LoadingRing`.
- Same object, same design: the S07 board = the S13 board (`RailBoard`, smaller); the S06 leak sheet = the S07 lens wipe and
  the pinned notice (`LeakSheet` with `flutter`, then `lensWipe`); the messenger and his envelope continue S05 -> S06.
- Sun rhymes: `SunPie` 7/10 and 1/3; `SunPress` for S01, S11 and the S13 echo (`amount={0.06}`).

## 11. Render cost (measured, concurrency 1, 1080 x 1920)

| frame (review 5, 24 frames each, shared machine at load ~2) | ms / frame |
|---|---|
| FontTest (baseline: simple page) | 127 |
| SharedKitSheet `context` (about 25 props at film size + keeper, caretaker, 2 onlookers) | 122 |
| SharedKitSheet `lock` (7 locks incl. two 200 px close-ups) | 122 |
| SharedKitSheet `thumbs: false` (about 135 prop instances) | 167 |
| SharedKitSheet (+ the 10 set thumbnails, sets lane) | 274 |

(review 4 at load ~4.5: FontTest 146, context 155, props only 215-227, with thumbnails ~400, KitDemo 251.)

So a typical prop costs well under 1 ms. Hundreds of far things go through the batched components (`LockSpecks`,
`PlaqueSpecks`, `BitSwarm`, `AttemptStipple`: 1-3 paths whatever the count), never through hundreds of `<Lock>`s.

## 12. Known gaps / requests

- Raw-SVG parts (ring bands, clock hands, ripples, the seal's trail, attempters) leave with `ExitFade` (shrink / 1-frame pop)
  instead of retracting stroke by stroke.
- The Maker's apron is read from behind (straps + bow + edges); a front apron never shows (people are always back view).
- `EdgeOnlooker` draws a hood (`acc: ['hood']`) by rendering the kit Person's head a second time, clipped to the head,
  over the hood (the kit only draws hoods on hero figures, and hero detail puts cuffs / hands at the hip).
- Sets lane: `BitSlot` defaults to 16 px; 20-24 px reads better in wide shots (Bit itself now keeps its eye at 16 px; his
  pupil and blinks need >= 24 px on screen).
- Sets lane: a `Lock` with `boltTestAt` now flashes its ghost "should be" at +0.36-0.66 by default; a `gapMarkAt` earlier
  than +0.7 overlaps it (the catalog's BlueprintStreet preview uses +0.4): move it later or drop it.
- Engine lane (optional): the kit Person's hero nape (zig-zag hairline) under a `cap` reads as a beard at phone size; the
  props lane no longer uses the kit cap / kit head for cap wearers (`BackHead`), but kit crowds with `hair: 'cap'` still do.
- Engine lane (optional): kit `Icons.Bug` is an orange top-view bug; the film's bug is `Bit` (solid ink side view). Consider
  deprecating `Bug` or re-styling it to Bit so the two never meet in a scene.
