# SHARED PROPS: the props lane of the shared world kit

`src/scenes/shared/props/**` (barrel: `src/scenes/shared/props/index.ts`). Sets live in `src/scenes/shared/sets/**`
(docs/SHARED_SETS.md); scenes use both.

```tsx
import {Lock, Bit, BrowserChrome, ElephantPlaque, RollerShutter, PowerGlyph, SunPress, RailBoard, Keeper} from '../shared/props';
import {LabelTag, RewindGlyph, CounterBoard, DiagramHand, SiteIcon, KeyCross, StickyNote, Sticker, CheckBoxTag, CheckBoxTags,
  SupportTag, FixSign} from '../shared/props';                           // storyboard v3 pieces (section 9b)
```

Dev sheet: `src/dev/SharedKitSheet.tsx` (composition `SharedKitSheet`, 10 s; every cell loops on a 5 s clock, the bottom
band shows a thumbnail of every set from `sets/catalog.tsx` plus the SeaOfDoors (`TerraceHill mode="flat"`, added by the
sheet next to TerraceHill unless the catalog lists it): 10 thumbnails; the QA modes `look` / `unbuildAt` reach the
thumbnails too). The sun cells show each morph on two skies (pie: day + golden; 45-minute wedge: golden + dusk).
`mode: 'context'` also has the S10 keeper (h 300) and the S13 caretaker (h 225) at film size. `mode: 'lock'` = the P1 bolt
test at the S02 close-up size (200 px) and at 100 px on a teal door, without the bracket, + fixed / blueprint / paper /
sketch / bracket variants. `mode: 'heads'` = cap wearers (Keeper, Caretaker, capped EdgeOnlookers) and the Ghost at film
size and at phone-thumbnail scale (x 0.3), colour and paper. `mode: 'figures'` (kitv3b) = every back-view preset at film
size: the S06 Messenger (260, seed `s5msg`), a curly Messenger, Investigator, Maker, Keeper with arms raised; citizens
whose seeded kit hair is sand / clay next to untouched ones; six EdgeOnlookers at the S07 size raising phones (raises at
0.5 s: render 0.6-0.8 for the swing, 2.0 for the pose). `mode: 'figfix'` (kitv3b fix round) = collar bands cut around
LONG hair (Investigator 'inv3', S05's 's5b1', a long-haired Messenger, EdgeOnlooker 'collar' + 'long') and around the hero
nape (90 px), S03's near walkers ('s03/nearR' on tan: tealDark band; on sand: tan band), a 60 px 'collar' head, S02's three
onlookers at 2x (seed 's2on/a': seeded clay 'short' at 53 px -> ink-brown), a 12-citizen crowd (hair variety); render 2.0.

```bash
scripts/still.sh SharedKitSheet 2.5 out.png                                         # every prop, mid-animation
node scripts/render-frames.mjs SharedKitSheet /tmp/o 3.5 --props='{"mode":"context"}' # props at FILM SIZE on plain walls
node scripts/render-frames.mjs SharedKitSheet /tmp/o 4.6 --props='{"look":"paper"}'  # frame-0 line-art state
node scripts/render-frames.mjs SharedKitSheet /tmp/o 2.3 --props='{"unbuildAt":2.0}' # the un-build on every prop
node scripts/render-frames.mjs SharedKitSheet /tmp/o 2.5 --props='{"thumbs":false}'  # props only (cost check)
node scripts/render-frames.mjs SharedKitSheet /tmp/o 0.9,1.3,1.5,1.9 --props='{"mode":"lock"}'  # stub, stop, ghost, Bit
node scripts/render-frames.mjs SharedKitSheet /tmp/o 0.5 --props='{"mode":"heads"}'  # add "look":"paper" for line art
node scripts/render-frames.mjs SharedKitSheet /tmp/o 0.6,0.7,2 --props='{"mode":"figures"}'  # hair discs, collars, arms
node scripts/render-frames.mjs SharedKitSheet /tmp/o 2.5 --props='{"mode":"v3"}'     # the storyboard-v3 pieces (section 9b)
node scripts/render-frames.mjs SharedKitSheet /tmp/o 1.0,2.5 --props='{"mode":"v3fix"}'  # v3 review: FixSign + cart slot,
                                                   # LockCrate lid / tags, BackSoonTag ladder, board footer, LabelTag minFont
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
- **Camera ink compensation** (opt-in, docs/ENGINE.md 4b): raw `strokeWidth`: multiply by `useInkScale()` (lib/inkComp.tsx)
  so camera ink compensation reaches it (lines drawn with core `<Ink>` get it already; 1 outside an `<InkScale>`, so
  nothing changes by default). **Done (kitv3b core review request)**: every raw `strokeWidth` in `props/**` reads the
  factor (`const ks = useInkScale()` at the component's top level, `strokeWidth={w * ks}`): Lock (ghost outline, glint,
  `LockSpecks`), BrowserChrome's `LoadingRing` / `TargetRing` (ink circles, spinner, ripple), SunMorphs (PowerGlyph glints,
  RewindGlyph, SunPress / PressRipple ripples, SunPie rims, HoursClock, MinuteWedge), Shutter (peephole ink ring), Figures
  (Citizen paper outline, CollarBand mask holes, Attempter), Labels (`InkTextBlock` strike, `CheckBoxTags`,
  StickyNote slap marks), Glyphs (MarkRing ping, QuestionMark ink rim + its dot's ink rim), Bit (eye / shell highlight
  lines), Diagram (SiteIcon), Elephant (plaque pulse rings, `PlaqueSpecks`), Tablet (ScanBeam). Hub dots shrink with
  their lines, like the core ClockHands hub: HoursClock `r = sw * 0.95 * ks`, MinuteWedge `r = w * 1.3 * ks`.
  Deliberately NOT compensated: body geometry drawn as a stroke, not ink (the ring's coloured band, the peephole's cream
  rim, the QuestionMark's cream body, the Attempter's arm); the sub-7 px text stand-in bars (`InkTextBlock`, FixSign
  rows and 'fixed!'), which must match the `<text>` they swap to at 7 px (text is never compensated, so a thinned bar
  would jump in weight at the swap); and all fills. Factor 1 = pixel-identical (S01/S02/S05/S07/S08/S10/S11/S12 frames
  checked). The props S01's dive shows (Lock, BrowserChrome frame, RollerShutter) were already compensated: their
  linework is `<Ink>`.
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
<LockCrate x={215} y={1226} size={58} lidAt={0.96} tagsAt={1.25} ink={2.2} />       // S09: shut, lid pops, tags rise
<LidCrate x={215} y={1226} size={58} lidAt tagsAt ink seed />                       // = the S09 shim name, same props
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
- `LockCrate` (anchor = bottom centre, `size` = width, height 0.62 x): sand crate, tan shade strip, slats, `n` fixed locks
  peeking out (`checkAt` ticks their tags). v3 (S09 Part A, the S09 `LidCrate` shim promoted, same prop names): `lid`
  (a tan lid slab; default true when `lidAt` is given) keeps it SHUT, no locks showing; `lidAt` = the lid pops open
  (hinged at its back-left end, 0 -> -118 deg with the 7 % spring), the dark interior shows and the locks bob up into
  the opening (0.04 s apart); `tagsAt` = `tags` (default n + 1) EMPTY cream `CheckBoxTag`s rise out of it on sticks
  (0.04 s apart, each pops + swings). Without `lid` / `lidAt` it is the v2 open crate, unchanged. `LidCrate` = the
  same with the shim defaults (size 70, ink 2.2, lid on): S09 only changes its import.
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
<ElephantStamp ... print="solid" | "line" flip color />            // kit v3b: 'solid' (default) rubber-stamp print
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
- **Stamp print (kit v3b, DEFAULT CHANGED)**: `print="solid"` (default) = a rubber-stamp print: ONE flat fill (`color`,
  default tealDark) over the whole stamp silhouette, misregistered 3 px against its ink edge, a cream border ring inset
  (0.8 x `ring` in, 0.32 x `ring` wide) and the elephant reversed out in cream (line art carved in the print colour; a
  plain cream silhouette under ~24 px on screen). It reads at ~130 px on a cream ground (S03 'It's in PHP': the old
  print was hairline ink with a cream fill on the cream street). `flip` mirrors the elephant (faces left: S03 keeps its
  trunk clear of Pip on the print's right end). `print="line"` = the v1-v3 badge (sand ring, cream line-art elephant,
  default colour sand): the BlueprintWall corner stamp (S02 / S05) passes it, so that badge is unchanged.
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
<BackSoonTag x={566} y={1111} lettered size={104} at={3.7} liftAt={53.9} />           // v3 govB: one line, 25 px
lightsOut(colour)  // the 1-frame step map: cream->sand, sand->tan, mintPale->sage, white->cream, peach->tan
```

18 px tealDark box with ink; the curtain unrolls (tealDark, ink ribs every 14 px moving with the bottom edge, sand bottom
rail with a handle). `slamAt`: 0.16 s ease-in drop + a 6 px bounce; `liftAt` rolls up (0.3 s). The padlock is visually
distinct from the P1 door lock (a shackle loop, no cover / screws). The tag swings -16 -> 0 (0.5 s); `tapAt` swings again.
v3 `BackSoonTag lettered`: 'back soon' in CaptionHand instead of the clock (default width **100**: one line at ~24 px). Auto
layout: ONE line only when its lettering is >= `minFont` (world px, default 22 = the on-screen floor at zoom 1; pass
22 / zoom for a pulled-back shot), else 'back' / 'soon' stack on two BIGGER lines (one line is always the smaller font on
the same width: 0.24 W vs 0.34 W). At zoom 1 that means: width < ~92 -> two lines (60: 20, 74: 25, 84: 29 px), >= 92 ->
one line (92: 22, 100: 24, 104: 25 px); the layout never depends on the camera, so it cannot flip mid-shot. `font` fixes
the size (one line if it fits), a `text` pair forces two lines. Also `text`, `w` = alias of `size`, `inkPx` = screen ink,
`twirlAt` (spins once on its
string, 0.45 s), `liftAt` (S12: swings back UP 0 -> -16 deg stepped, one shrunken frame, gone), `outAt` pops it off in one
shrunken frame (lettered / liftAt; the clock tag keeps the un-build unless `outMode="pop"`). `ShutterPadlock outMode="pop"`
= the same 1-frame pop off (default still the un-build).

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
<SunPress mode="release" at={0} cx cy r><Sun .../></SunPress>      // v3 frame 0: AT `at` the bottom of the squash + ripple at r
<SunPress mode="reverse" at={55.01} cx cy r><Sun .../></SunPress>  // v3 S12: the release backwards (stepped 12 Hz), HOLDS the bottom
<Sun ...>{(r) => <RewindGlyph r={r} at={53.45} outAt={54.95} nudgeAt={[53.9, 54.4]} />}</Sun>   // v3 S12 rewind button
<Sun ...>{(r) => <SunPie r={r} n={2} cream={1} spokesAt slicesAt />}</Sun>                     // v3 S10 1/2 pie (works as is)
<SunGlowSteps cx={700} cy={1000} r={260} at={26.1} />                                             // v3 S08 r260 (x1.25 / x1.5)
```

- v3 frame-0 / rewind pair: `mode="release"` (S01) and `mode="reverse"` (S12) share `releaseState(u)` (u 0 = the bottom:
  scale 0.88, the ink ripple ring AT r with full width; u 1 = released, the ripple at r + 40 thinned to nothing), so S12's
  last frame and S01's frame 0 are the same picture. Before `at`, release holds the bottom; reverse shows the released sun.
- `RewindGlyph`: two solid left-pointing cream triangles, corners rounded by a stroke of the PowerGlyph weight (same size:
  half-height = the power ring 56/150 r). Swap: `<PowerGlyph outAt={T} />` + `<RewindGlyph at={T + 0.06} outAt={F} />` +
  `<PowerGlyph at={F + 0.06} />` (pop in 7 %, shrink out 0.12 s; never both full at once). `nudgeAt` jabs it left (0.16 s).

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
| `MakersCart` | ground under the centre; `size` 160 | ochre handcart, crates of fixed locks; `roll={{at, to, dur}}` (wheel turns with the distance), `dropCrateAt[]` (last crate first; lands with a tick and STAYS in world coords), `skipAt`, `pusher`, `flip`. v3 **`sign`** (a node: J5, `<FixSign x={0} y={0} .../>`): an ink post stands in the bed's front end and the node hangs from its top, (0, 0) = that hook, in WORLD px (not scaled or mirrored with the cart, so a flipped cart keeps its lettering); it rides the roll and the skips and jolts when the roll starts / a skip lands. `signPost` = post height above the bed top (world, default 0.55 x size; 0 / false = none), `signX` = post position on the bed (cart-local -70..70, default 46 = the front end). `cartSignHook({x, y, size, flip, signPost, signX})` = the rest hook in world coords. |
| `Tram` | centre x, top y; 1500 x 600 | teal, mintPale windows, peach lamps, ink 4.8; `cross={{at, dur: 0.4, from: -1100, to: 1100}}`; `tramRoof(y)` = perch. |
| `CheckMark`, `MarkRing` (`pingAt`), `Cobweb` (`corner`), `Magnifier`, `WrenchGlyph`, `WrenchTag` (sage + cream wrench), `CheckFlag` (`raiseAt`), `QuestionMark`, `AlertMark`, `Swing`, `PopAt` | centre (flag: pole foot) | P15: the same marks in every scene. Check 0.17 s, ring 0.17 s. |

### P11 back-view figure presets (`Figures.tsx`)

Anchors are the FEET; `h` = total height (world px). Common: `riseAt` (own height from behind the feet line, 0.33 s
out(exp)), `walk={{at, hz, to, dur}}`, `bob`, `flip`, `depth` (default by size: >= 260 front, >= 120 mid, >= 70 far, else hair).

| preset | look | extra props |
|---|---|---|
| `EdgeOnlooker` | tier A: head centre + `head` diameter; a long coat that ALWAYS runs off the frame bottom (its length is derived every frame from the camera transform: frame bottom + 40 px, never less than world.h + bleed; `frameBottom` overrides), so no hem and no legs can show; hanging arms (sleeve seam, cuff, sand hand at a natural arm length), a fixed-length white rim strip, ink 4.8 | `raisePhoneAt` / `lowerPhoneAt` (0.3 s outBack, shoulder jolt; kitv3b: a JOINTED arm driven by joint angles: the upper arm swings up while the elbow folds the forearm up ahead of it (bend 30 deg in the raised pose, +30 deg mid-swing), elbow out, tapered sleeve, cuff line, inner-elbow crease; the palm cups the phone's lower edge behind it, thumb + two finger tips wrap its sides in front; a coat tension FOLD draws from the raised arm's armpit toward the spine with the raise; hanging and raised hand points are the old ones, so every phone rests where it did), `phoneSide` (default: the side facing the frame centre), `arms` ('both' / 'near' / false), `hair` ('cap' = our `BackHead` over a straight collar band, head raised so the neck shows; never the kit cap or kit head), `hairColor` (default: the kit's seeded pick, a sand pick becomes ochre / ink-brown; a clay pick on a 'short' / 'bun' head becomes ochre or ink-brown (seeded coin) BELOW the kit's hero-head size: clay stays only when `head` >= the kit's per-person hero threshold + 3 px (about 60-66 px; Person.tsx headT, hero head >= 80 % in), where the hero strands + notched nape read as hair. At S02's 50-54 px heads a clay disc had neither and read as a bald head; a swapped DARK disc also gets the exact disc under the kit's misregistered one, so no light crescent), `acc` ('hood' drawn here, under the head; not with 'cap'; 'backpack' dropped; kitv3b: 'collar' = a straight `CollarBand`, never the kit V (S03 's03/nearR' changed from the V to the band), cut around the head, hero nape and long hair, never the hair colour; under a cap it is dropped, BackHead draws the band), `body`, `rim` |
| `Citizen` | 40-55 px kit Person with legs (also used larger as near walkers) | `silhouette` (flat sage cut-out; white tombstone in paper), `color`, `hairColor` (kitv3b; default: the seeded pick, sand / clay plain discs become ochre / ink-brown) |
| `Investigator` | 110-140 px, ink shield badge on the back, straight collar band | `raiseAt` / `lowerAt` (arm swings up with a SparkleTablet), `arm`, `hairColor` (as Citizen), `collar` ('band' default since kitv3b / 'v' = the old kit chevron / false) |
| `Messenger` | teal coat, ink-brown hair disc, straight tealDark collar band | `pullAt` (envelope out of the coat to shoulder height), `holdEnvelope`; `messengerHand(x, y, h)` (unchanged); kitv3b: `hair` (kit style passthrough, default 'short'), `hairColor` (default `palette.ink`: a FULL hair-colour disc; was the seeded clay pick, read as a skin disc in S06), `collar` ('band' default / 'v' = old / false) |
| `Maker` | teal + cream apron (Y straps meeting mid-back, bow, apron edges; crossed X straps read as "crossed out"); no caps | `bust` (waist-up at a bench), `work` (nodding hz), `hairColor` (as Citizen) |
| `Keeper` | sand coat with a tan collar band, teal cap, ochre hair, teal trousers, ochre tool belt (hammer, pouch); NOT a maker | `reachAt` + `holding` (e.g. `<NewLockIcon/>`), `installAt`, `climb={{at, steps, run, rise}}`, `cap` (colour or false), `hair`; < 30 px = sand speck |
| `Caretaker` | teal coat with a tealDark collar band, sage cap, ochre hair, key ring r22 with sand keys | `raiseKeysAt`, `jingleAt`, `glintAt`, `cap`, `hair` |
| `Attempter` | hooded, tealDark, ink hood point | `mode` `tap` (`tapAt[]`, ripple arcs at `tapPoint`) / `rattle` (`rattleAt`, handle + marks) / `stand` |
| `AttemptStipple` | 4-8 px hooded tombstones | ONE path for hundreds, each pops at `at` |
| `Ghost` | ink-only back-view figure on `BackBody` (no fills): a clean head dome flowing into the neck lines (the only opening is the nape), ears, collar band, torso, walking legs | `at` draws it on (torso, head, legs, collar), `walk`, `hair` 'bun' (other hair / `acc` not drawn) |

The presets mirror the kit Person's seeded torso width / head radius / shoulder rounding and coat pick (`personGeo`,
`personCoat` in `Figures.tsx`) to keep hand-placed arms, caps and belts on the body; if `kit/Person.tsx`'s `makeSpec` draw
order changes, update them (kitv3b: also `kitPicks` = hair style weights, hair colour + its coat-clash swap, walk phase).

Hair and collars (kitv3b, S06 review: the Messenger's seeded clay 'short' head read as a bald / skin disc from behind).
`skinSafeHair(colour, coat?, style?, seed?)` (exported): sand -> ochre (ink-brown on an ochre coat), clay too on plain-disc
styles ('short', 'bun'); long / curly shapes keep any colour. Fix round (crowd variety: 62 % of preset short / bun heads
had gone ochre): with `seed`, clay goes to ochre OR ink-brown by a seeded coin (`rand(seed, 'hairfix') < 0.5` = ink-brown;
always ink-brown on an ochre coat); sand stays -> ochre. Every preset passes its seed (Citizen, Investigator, Maker,
EdgeOnlooker); without `seed` the old clay -> ochre mapping holds. The legged presets (Messenger, Investigator, Maker, Citizen) never
pass `hairColor` to the kit Person (that skips a seeded draw and re-seeds the trousers, shoes and WALK PHASE: S05 -> S06
trouser continuity, S06's planted stride): `HairOver` redraws the kit's own head disc (+ bun + part line, curly crown,
long hair) with the kit's seeds over it, so the misregistered fill and the open outline land exactly on the kit's; it
rides the kit's walk bob, relights at the kit's anchor and un-builds in its ExitSync group. Dark hair (ink, tealDark)
also gets the exact disc under the misregistered one, so the outline never floats as a separate arc. It draws only
when the colour changes (Messenger: always). EdgeOnlooker passes `hairColor` to the kit only for a swapped pick (the
re-seed only moves its hat / scarf colour). The collar band (`CollarBand`, one palette step darker than the coat) is drawn
after the kit Person (Messenger, Investigator, EdgeOnlooker 'collar') but CUT around the kit's head with a luminance mask
(fix round): the kit head disc + ink circle, the 'long' hair shape, the 'curly' crown and the hero nape notch (scaled like
the kit's), each filled and stroked at the ink width, so the band goes behind the hair: it never paints across long hair
like a strap (Investigator 'long', e.g. S05's 's5b1') and never hides a hero head's notched nape (S03 'nearR'). Its
colour is never the hair colour: when `darker(coat)` equals the hair (tan coat + ochre hair) or the coat, it falls back
to tealDark (ink-brown when the hair / coat is tealDark). Cap wearers (`BackHead`) draw it under the head as before.

`FigureArm` (exported; every preset's raised arm: Investigator, Messenger, Keeper, Caretaker, EdgeOnlooker's phone arm).
Props `{sh, hand, w = 19, coat, W, seed, hand2 = true, bend?, side?, elbow?}` in person-local units, unchanged call shape
from the old private `Arm`. Upper arm + forearm are straight and meet at an ELBOW pushed off the shoulder-hand chord by
`bend` (default follows the raise: 0 hanging, easing to 30 deg once the hand is level with the shoulder or above), out /
down on the shoulder's side (`side`), the outer corner rounded and the inner one tight with a short crease; the sleeve
tapers 1 -> 0.9 -> 0.74 toward the wrist, a cuff line crosses it at 80 % of the forearm, and an inked sand hand sits
behind the cuff (`hand2={false}`: none). `elbow` = an explicit elbow point (joint-angle rigs). The hand point is still
the sleeve end, so held things (tablet, keys, envelope, `holding`) are where they were. Scenes that mirror a preset's arm
to hand it over (S06's messenger after the door beat) should draw `FigureArm` with the same props.

Back-view heads for cap wearers (reviews 4 + 5: at phone size a cap over a full hair-colour disc, a zig-zag nape and a V
chevron collar read as a bearded face looking at the camera). `Keeper`, `Caretaker` (via `BackBody`) and capped
`EdgeOnlooker`s draw `BackHead` (Figures.tsx), never the kit Person's head: a sand NECK block (0.45 x head wide, style
bible 6) visible between the head and the collar; the hair ends in a SMOOTH NAPE (the sides taper into the neck, a
shallow curve crosses it: no zig-zag, no round hair "chin", no strands under the cap); sand ears just under the cap band;
the cap covers the top ~65 % down to a gently sagging band, its back STRAP a clear notch (an arch cut up into the cap
with HAIR showing through, over a thin strap with a buckle tick) and a button. The collar is a straight `CollarBand` a
step darker than the coat (no V). `h` is their true feet-to-cap height. Checked in colour and line art at film size and
at phone-thumbnail scale (`mode: 'heads'`).

## 9b. Storyboard v3 pieces (labels, rewind, board, diagram, tags, notes)

Sheet: `--props='{"mode":"v3"}'` (every piece below at film size, on a 5 s clock; `look` / `unbuildAt` reach it too).

### LabelTag (labelStyle: every on-screen label L1-L14)

```tsx
<LabelTag kind="tag" x={385} y={1150} text={['in the code since', 'at least 2012']} fontSize={30} at={15.39} />  // hangs from (x, y)
<LabelTag kind="card" box={[215, 700, 540, 745]} text="PHP2Shell · two linked flaws" at={5.78} />              // pin dot
<LabelTag kind="card" box={[215, 1100, 600, 1185]} text={L2} at={6.57} leader={[700, 1150]} />                // + leader
<LabelTag kind="card" box={[490, 1320, 910, 1440]} text={L3} at={9.26} flipTo={{at: 12.51, text: L4}} />      // paper flip
<LabelTag kind="slip" box={[205, 688, 650, 760]} text={L6} at={18.11} />                                      // paper clip
<LabelTag kind="notice" x={300} y={1080} text={['FBI · NSA', 'UK NCSC · CERT-EU']} at={46.2} />               // 4 tapes
<LabelTag kind="sign" box={[125, 1262, 445, 1462]} fontSize={26} text={L13} at={41.0} />                      // A-frame
<LabelTag kind="stamp" box={[450, 1295, 870, 1338]} text="first 45 min: tens of thousands" at={32.0} />       // slams
```

- **Anchor**: `box` [x0, y0, x1, y1] = the PAPER (the storyboard's label box; for `sign` the board face, its teal frame
  wraps it and the legs stand `legH` (0.32 x h) below). Without a box, (x, y) = the paper centre, except `tag` (the HANG
  point: the string's top) and `sign` (the GROUND point). `w` / `h` fix the paper; by default it fits the text.
  `labelBox(props)` returns the rest rect (for lint boxes / leaders).
- **Text**: `text` (string, or one string per line; '\n' splits) or `lines`. `fontSize` (alias `size`) in WORLD px
  (default 36, sign 30, stamp 34): the label lives in the world, so divide the on-screen target by the camera zoom
  (S02: `40 / 1.3`). With a box (or w / h) the font SHRINKS to fit (never grows) down to **`minFont`** (world px,
  default 0.85 x fontSize); if the box cannot hold that, the PAPER GROWS past the box instead (keeping the attachment:
  tag / card / slip grow down from the top edge, a sign grows up from its legs, stamp / notice about the centre, wider
  about the centre x) and the browser console gets ONE `[LabelTag] ... the box fits only N world px` warning per label
  (Studio / Chrome devtools). `labelBox(props)` returns the grown rect. `minFont={fontSize * 0.5}` = the old behaviour.
  `align` center | left.
  Below 7 px on screen the text becomes hairline placeholders.
- **Look**: cream paper (`paper` / `color`), ink text (`textColor`), 2.2 px outline (`ink` world px, `inkPx` SCREEN px,
  or `depth`), fill misregistered in screen space. Paper Look = white paper + ink text (labels read in line art);
  `<Look ink={false}>` hides the text with the ink. Kind details: tag = clipped top corners, sand eyelet, string;
  card = soft corners + ink pin dot; slip = tealDark paper clip over the top edge; notice = 4 sand tape strips
  (`tapeStagger` 0.04 s after the paper); sign = teal A-frame (tapered frame, legs, crossbar, handle slot; `frame={false}`
  = paper only); stamp = double ink border, -3.5 deg.
- **Motion**: `at` = pop (7 % spring) about the attachment (tag: hang point, card: pin, slip: clip, sign: ground,
  notice / stamp: centre); tags add the pendulum -16 -> 0 (0.5 s; `swing={false}` off, `swing` on any kind = on);
  `swing={t | [t..]}` swings again; stamps SLAM (ring 0.13 s, print 2.6 x -> 1 x in 0.27 s); `flipTo` = `{at, text}` (or
  several, or text + `flipAt`): scaleX through edge-on in 0.2 s, the text (and size) swap at the edge-on; `outAt` = one
  shrunken frame (x 0.72), then gone (`outMode="unbuild"` = the measured 0.5 s un-build). `leader` = [x, y] or
  `{to, at}`: an ink line from the nearest paper edge + an end dot, drawn 0.12 s after the pop. `rot` / `tilt` = static
  tilt (default a seeded +-1.2 deg; tags and signs hang straight). Aliases for scene shims: `variant` / `type` / `style` =
  `kind`, `size` = `fontSize`, `lines` = `text`, `color` = `paper`.
- Text in a `<Plane>` is NOT projected (raw SVG text): put labels on screen-facing surfaces (cards in front of a ground
  plane), not inside a plane.

### FixSign (J3 -> J4 -> J5: the one 'still fixing...' sign)

```tsx
<MakersLane workshop={{blind: 'down', blindSign: (a) => <FixSign x={a.x} y={a.y} fs={27} swingAt={[B.headsUp]} />}} />  // S06 J3
<NoticeboardCorner workshop={{blindSign: (a) => <FixSign x={a.x} y={a.y} fs={27} swingAt={[B.fix]} />}} />              // S07 J4
<MakersCart x={760} y={1432} size={150} pusher roll={...} signPost={132} signX={34}
  sign={<FixSign x={0} y={0} w={224} fs={36} strikeAt={B.out} fixedAt={B.out + 0.1} />} />                              // S09 J5
<FixSign x={x + 46} y={bedTop - 64} w={118} fs={18} strikeAt={-10} fixedAt={-10} />                                      // S10 end state
```

- ONE component for the four appearances (the S09 `CartSign` shim promoted; `CartSign` is exported as an alias, same
  props `{x, y, w, fs, strikeAt, fixedAt, ink, seed}`, so S09 / S10 only change the import). Use it in the Workshop
  `blindSign` slot too (S06's LabelTag card and S07's BlindSign shim) so J3 / J4 / J5 show the SAME sign: pass only `fs`
  (27 on the blinds) and every scene gets the same proportions and line break.
- Anchor (x, y) = the HANG point (the nail on the blind / the cart post's hook); the cream card hangs 0.5 fs below it on
  a V string (`string={false}` = pinned flat, an ink pin at the top centre, anchor = the pin). Card = `w` (default: fits
  the lettering + 0.5 fs margins: ~5 fs) x 2.55 fs: row 1 'still fixing...' (one line, `text` / `lines` override; an
  array = several lines, + 1 fs height each), row 2 = the room 'fixed!' is scribbled into (`fixedText`, 1.12 fs, -4 deg).
  `h` overrides the height (rows keep their proportions). `fixSignBox(props)` = the card rect.
- Motion: `at` pops it in (7 % spring + a small pendulum), `swingAt` = taps (12 deg), `strikeAt` = one ink stroke across
  each row-1 line (0.12 s draw-on, lines 0.05 s apart) + a -7 deg jolt, `fixedAt` = 'fixed!' scribbled in with an L -> R
  wipe (0.16 s, out-cubic), `outAt` = one shrunken frame. Strike / fixed times in the past = the end state (S10).
- Look: cream card (`paper`), 2.2 px outline (`ink` world / `inkPx` screen), the fill misregistered in screen space, ink
  lettering (hairlines under 7 px on screen); paper Look = white card. Keep the lettering >= 24 px on screen (fs x zoom).

### CounterBoard (S08: the one count device)

```tsx
<CounterBoard box={[430, 1080, 890, 1440]} riseAt={26.64} header={['Cloudflare · sits in front', 'of about 1 in 5 websites']}
  flagAt={28.34} note={['counted from the', 'public announcement', 'attempts, not break-ins']}
  footer={['Matthew Prince, Cloudflare CEO, on X', "Cloudflare's own count"]} footerAt={28.74}
  gatesAt={[28.40, 28.86, 29.23, 29.33, 29.43, 29.82, 29.92, 30.86, 32.59]}
  stamps={[{at: 32.02, text: 'first 45 min: tens of thousands'}, {at: 32.85, text: 'millions · within a day'}]} />
```

Teal 8 px frame, cream face, two tealDark posts (`post` 80 px below the board, behind the parapet), a sage shield with a
cream glass dome top-left (`emblem={false}` off). Zones follow the storyboard layout scaled to the box
(`counterBoardZones(box)`: emblem, header, flag, note, gates, the two stamp slots, footer, and `top` = Bit's perch at the
top edge's right end). Painted text pops in place (7 % spring): header (`headerAt`, default with the board; 33 world px =
38 on screen at the 1.15 push), note (`noteAt` = flagAt + 0.08; 26), footer (`footerAt`; default **28**: its zone is now
58 board px tall (x the box's y scale; was 47), so two lines hold >= 28 px from zoom 1.0 (S08's 460 x 390 box: up to
~31 world); the room came from the note / gates band, 3 note lines still fit at 27). `footerH` (world px) sets the
footer height (the stamps and the band move with it): pass the same value to `counterBoardZones(box, {footerH})`. S08:
`footerSize={26}` caps it at 26 world: drop it (default 28) or pass >= 28. The start flag (sage pennant on a short pole) pops at `flagAt`. `gatesAt[i]` = tally
gate i strokes on (4 hand-drawn bars + the strike, 0.12 s) in rows of `gateCols` (3); never digits. `stamps[i]` = a
LabelTag stamp in slot i (29 world px, `fontSize` / `rot` per stamp). `riseAt`: rises board height + posts from below its
base (0.33 s out(expo)), clipped at the posts' foot so it never shows under its base. `outAt`: un-build.

### Diagram pieces (S02, S05 callback) — the S02 shims, promoted (same props)

`DiagramHand {x, y (the pinch point), angle -20, scale, enterAt, from 760, settle 0.12, turnAt, turnDeg 38, exitAt, ink
3.4}` + v3 extras: `drawAt` / `undrawAt` (+ `drawDur` 0.25: the dashes draw on along the outlines / come off in reverse,
the S05 "redraw"), `dash` [7, 5.5] world px, `handFill` (default NONE: a bare dashed hand per the request, the lock
drawing reads through it; the S02 shim used white), `sleeve` teal / `cuff` tealDark (the attempters' hoodie; false = ink
only), `color`. `SiteIcon {x, y, w, h (box, top-left), at, takenAt (hatching floods the window, then the roof flag pops at
+0.2), unlockAt (shackle pops open), flutterAt, ink}`. `KeyCross {x, y, size 60, at, crossAt (0.06 s cross), settleAt (8 %
pulse), ink}`. Helpers: `dashPath(points, dash, gap, phase)` (explicit dashes for connectors that draw on / march),
`pointAlong(points, s)`, `flattenPath(d)` (absolute M L H V C Z -> polylines).

### Notes, sticker, tags

```tsx
<StickyNote x={540} y={1180} lines={['Turn it off', 'and on again']} strike="and on again" size={30} slapAt={50.6} strikeAt={52.2} />
<Sticker x={640} y={1060} w={124} />                                                    // S03 'I [heart] PHP ?', static
<CheckBoxTag x y size={40} at />  <CheckBoxTag ... ticked />  <CheckBoxTag ... tickAt />   // S09 the crate's cream tag
<CheckBoxTags spots={[{x, y, size, at, ticked}]} ink={0.8} inkFrom={8} boxFrom={12} />    // hundreds: 4 paths
<SupportTag x y size={44} at checkAt stampAt swingAt />                                  // S10 sage, elephant-stamped
```

- `StickyNote` (the S11 shim's props): (x, y) = rest centre; `w` / `h` (default: a square that fits the text), `lines` /
  `text`, `size` / `fontSize` (world; keep >= 24 px on screen), `strike` = the SUBSTRING struck (its measured extent only),
  `strikeAt` (0.15 s ink stroke), `slapAt` (lands with a 0.12 s squash 1.12 x / 0.8 y + three slap ticks; before it the
  note flutters in on an arc, turning edge-on: `flutter={{from, dur 0.36, spin 70}}`, default from 220 px up-left,
  `flutter={false}` = no flutter), `curlAt` (bottom-right corner curls, 0.4 s), `rot` -4, `color`, `ink` / `inkPx`,
  `outAt` (1-frame pop). Cream paper, sand adhesive band, ink outline.
- `Sticker`: (x, y) centre, `w` 124 (lettering 0.25 w), `rot` -6, white sticker with a sand peeled corner, 'I' + a DRAWN
  peach heart + 'PHP' in CaptionHand, and a scribbled ink '?' half off its right edge (`question={false}` off). Static
  (`at` only if it must pop).
- `CheckBoxTag`: hang point (x, y), `size` = width; cream skewed tag (the LockCrate tag) on a short loop, an ink check
  BOX, EMPTY unless `ticked` / `tickAt` (0.17 s tick). Pops + swings at `at`. Below 10 px on screen: a cream speck.
  `CheckBoxTags` = the batched wave (cream bodies / ink outlines + loops from `inkFrom` / boxes from `boxFrom` / ticks):
  each spot pops for one frame at +30 % at its `at`; Look-aware (paper = white bodies).
- `SupportTag`: hang point, `size` 44; sage rounded tag, a bold cream check (`checkAt` strokes it), an ink-ring stamp
  with the solid elephant (`stampAt` slams it; >= 22 px on screen), eyelet + loop. Below 22 px: sage + cream check only.

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

Storyboard v3 round (24 frames, concurrency 1, machine at load ~11 with twelve scene agents rendering): FontTest 208,
SharedKitSheet `v3` (~45 v3 instances: 13 labels incl. a sign and stamps, the counter board with 9 gates and 2 stamps, two
diagram hands, site icon, key, sticky note, sticker, 60 batched check-box tags, 3 support tags, shutters, suns) **216**,
`thumbs: false` 308. A label / tag / note costs well under 1 ms; the board ~2 ms; hundreds of check-box tags = 4 paths.

v3 review round (12 frames, concurrency 1, machine at load ~10): SharedKitSheet `v3fix` (6 FixSigns, 2 MakersCarts with a
sign slot + pusher, 3 crates (2 with lids, 4 rising check-box tags each), 6 lettered tags, the board, 3 grown labels, a
paper-Look row) **384** ms/frame, `v3` 265, FontTest 237 in the same pass. A FixSign costs about a LabelTag (one card,
2-3 text nodes, 1-2 strike strokes); the cart's sign slot adds one post stroke.

So a typical prop costs well under 1 ms. Hundreds of far things go through the batched components (`LockSpecks`,
`PlaqueSpecks`, `BitSwarm`, `AttemptStipple`: 1-3 paths whatever the count), never through hundreds of `<Lock>`s.

## 12. Known gaps / requests

- v3: labels are raw SVG text, so they are not projected by a `<Plane>` (place them on a screen-facing card) and they
  leave with `ExitFade` (shrink) in an un-build. LabelTag sizes are world px (divide by the zoom for an on-screen size).
- v3 review: the CounterBoard footer zone is 58 board px (two lines at >= 28 px from zoom 1); S08 still passes
  `footerSize={26}` (drop it or pass 28). LabelTag boxes that are too small now GROW the paper (minFont 0.85 x
  fontSize) instead of shrinking the text to 0.5 x: check the console for `[LabelTag]` warnings and enlarge those boxes.

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
