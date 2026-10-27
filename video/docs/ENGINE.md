# ENGINE: cheat-sheet for scene agents (core lane; written for v1, whose shot plan was "storyboard v3")

> **v1-era engine API (banner, 2026-10-27).** Use this page for the API: §1 rules 1-5, 7 and 10, §2, §4-§8, §10-§14.
> Its look is v1's and retired: rules 6, 8 and 9 (marked below), §3's template look (a per-shot push, a drifting,
> beating sun, structural overshoot, a crowd inked by depth), §9's sun as a character, the sketch pen as a film's line,
> glow discs and the full-colour loop seam (a new film un-builds into frame 0: `docs/G5_BLOCKING.md` §1). The current
> direction is `docs/look/DIRECTION.md` (numbers: `docs/look/CRAFT.md`); in a film the clean pen and tiers draw
> everything (§7). "v3" on this page means v1's storyboard v3 (`docs/storyboard_v3.md`), never video 3 (except
> "KitSheet3" in §11). Never brief a lane from its look.

Full-bleed, cinematic, hand-drawn. (v1's lanes read `docs/BRIEF.md` first; a new film's lanes read
`docs/look/DIRECTION.md` and `docs/look/CRAFT.md`, then this page for the API.)

**v1's storyboard v3 in one paragraph (the 55.36 s voice).** Film transitions add NO camera: every `transitionIn` is
`cut`, `matchcut` or `foreground-wipe` (element `'scene'`: the outgoing scene's exported `Wiper`), and every camera move
is a scene key (ShotCam / CineCamera keys or a World `push` with explicit `to` / `at` / `dur`). The loop is a
FULL-COLOUR seam: the last scene's `transitionOut {type: 'cut', loop: true, captionAt}` plays it to its end untouched
(no un-build, nothing underneath) and its last frame must equal frame 0; the captions still roll back to page 1 at
`captionAt` and frame 0 finishes that roll (section 5). Labels are scene-owned props; captions never render them
(section 6). A stepped uniform sky tween is consecutive `snap` keys with explicit colours (section 4).
Camera / light / skyline / city kit: **`docs/CINE.md`** (`src/lib/cine`). Mascot: **`docs/mascot.md`** (`src/lib/mascot`).
Look: v1's was `docs/style_bible.md` + `docs/style_bible_ref2.md` (full-bleed numbers win); a new film's is
`docs/look/DIRECTION.md`. Motion numbers: `docs/motion_spec.md` (all of them live in `MOTION`, `src/lib/spec.ts`).

```ts
import {World, ShotCam, Tod, TodAnchor, useTod, Sun, Ink, Fill, Drawn, rect, line, Plane, wallQuad, eyeLevel, Person,
  Crowd, ExitShrink, MOTION, palette, skies, world, skyCaption} from '../lib';
import {Layer, BigSun, EndlessCity, Skyline} from '../lib/cine';
import {Elephant, ElephantTimeline} from '../lib/mascot';
```

## 1. The ten rules

1. **Everything is seconds.** `useTime()` = scene-local seconds (0 = your scene's `start` in `src/data/scenes.json`).
   Never frame numbers. `useGlobalTime()` = VO seconds. VO word times: `assets/timing.json` (`words[i].s`).
2. **Deterministic.** `rng(seed)` / `rand(seed, key)` (Remotion `random`), never `Math.random`.
3. **No fades. Ever.** Nothing animates opacity. Things pop (1 frame), grow 20%→100% (0.12 s), wipe, slide, rise or
   draw on. Static translucency is allowed only for light shafts / glows (cine kit). Legacy fade names (`Fill
   mode="fade"`, `exitMode="fade"`, `build="fade"`, `Tween` opacity, card `opacity`, timeline `crossfade` / `zoom`)
   are `@deprecated` (your editor strikes them through): they are 1-frame switches or v1-card only.
4. **Flat.** No CSS/SVG blur, filters, gradients, masks with soft edges. Palette tokens only (`palette.*`, `skies.*`).
5. **Lead the voice** (motion spec 7): small element `word.s - 0.10`, big build/burst `word.s - 0.25..0.40` so it
   completes on the word, ✓/✗ marks on the word, sun beats on the word (±0.05). Captions apply their own leads.
6. **Retired (v1's "≥ 5 visual events per second, no gap > 1.0 s", 2026-10-27):** never a still frame, but life by
   tiers (`docs/look/CRAFT.md` §b: one mover leads, supporting life small, slow and taking turns); events/s is
   information, never a target; the sun is no idle motion.
7. **People are always seen from behind** (`Person`: ears, neck, back of the head, no faces).
8. **Retired (v1's "ink weight by depth", 2026-10-27):** ink by TIER, never by depth: `setPen('clean')` in the film's
   look module, tiers through `tiered()` / `<Tier>` (§7; `docs/look/CRAFT.md` §c). `depthInk` stays for v1 renders.
9. **Retired (v1's "one colossal element per scene ... gentle pushes, 2-3 Arcane-scale peaks", 2026-10-27):** one big
   scale reveal per film (`docs/look/DIRECTION.md` rule 7), holds locked or a slow float, never a push per shot
   (`docs/look/COZY_AND_SCALE.md` 3b.5). The EYE-LEVEL camera of section 2b (the lens at ~1.1 x a standing person's
   height) stays the default street camera.
10. **Captions own the sky band** (`skyCaption.clipTop`–`clipBottom`, screen space): keep busy detail, skyline tops and
    sky-band steps out of it (tops below y 600). Dark ink on light skies, white on dark skies (`captionTone`).
    `scripts/sheet.sh` checks it for you (section 11).

## 2. Coordinates, the frame and the numbers

- **World coordinates = canvas pixels at camera rest**: x 0..1080, y 0..1920, y down. `world.horizon` and `world.vp`
  are defaults, not rules.
- Author **`world.bleed` past every edge** for ground, walls and sky-reaching things: `camera-continuous`, `push-through`
  and the World `push` show beyond the frame. The sky is always infinite (World sizes it).
- **Safe zones** (`safe`): platform UI covers the top, the bottom and a right rail. The bottom = ground and foreground
  framing only.

### 2b. The camera: eye level (the viewer feels small)

Reference 2 keeps the lens at **1.10-1.14 x a standing person's height** (f_1, f_42 measured). Consequence: every
standing head, near or far, sits in a thin band **just under the horizon** (9 % of its feet's distance below it); near
people tower over the lower frame (0.30-0.45 H), the crowd converges ON the horizon line, towers rise above it. Place
people from ONE camera (`eyeLevel`, persp.tsx) instead of guessing scales:

```tsx
const cam = eyeLevel({horizon: world.horizon, vpx: 560});     // ratio 1.1 (camera / person height)
cam.height(1500)                 // px tall for feet at y 1500: (1500 - 768) / 1.1 = 665
<Person x={cam.x(-0.3, 1500)} y={cam.hip(1500, 150)} s={cam.s(1500, 150)} legs legH={150} />   // X = person-heights
<Crowd eye={{horizon: world.horizon}} far={{y: 790, x0: cam.x(0.3, 790), x1: cam.x(0.8, 790)}}
       near={{y: 1190, x0: cam.x(0.32, 1190), x1: cam.x(0.82, 1190)}} rows={13} />    // y = FEET lines
// set dressing in person-heights at its feet line: a door 1.2, a house eave 1.1-1.4, a palm 5-8, a car 0.85 tall
```

Check a still: `measureEye(feetY, headTopY, horizon)` = camera / person height, **target 1.0-1.2** (KitDemo v3 at
4.4 s: walkers 1.06 / 1.08 (1.04 to the top of the bun), nearest queue adult 1.04 (a tall jitter); nominal 1.1). Peaks may go lower (worm's eye: heads above the horizon)
but never higher than ~1.3. The reference figure is `src/dev/KitDemo.tsx` (section 10).

Current values (always reference the TOKEN in code, never the literal):

<!-- numbers:begin (generated by scripts/engine-numbers.mjs from src/lib/theme.ts: do not edit by hand) -->
| token | value |
|---|---|
| caption font | Patrick Hand ('CaptionHand') **98 px**, centred on x **520**, max line **850 px** (`skyCaption`) |
| caption baselines | line 1 **y 387**, line 2 **y 510**, one-line page **y 448** |
| caption band (clip window) | **y 280-570**: keep busy detail, skyline tops and sky band steps out of it (tops below y 600) |
| caption motion | `scroll` (reference 1's measured scroll / rise / wipe) |
| sky highlight box | top 0.9 em, bottom 0.19 em, padding 0.19 em both sides, radius 0.02 em, trailing punctuation inside (`skyHighlightBox`) |
| world | 1080 x 1920 px, horizon **y 768**, vanishing point **[540, 768]**, bleed **140 px** (`world`) |
| sun | centre **(540, 650)**, r **100** (`sunWorld`; baseline r 94-120, peaks only 270-490) |
| safe zones | UI covers y < 180, y > 1520, right rail x > 950 for y 900-1500; key action inside x 90-990, y 200-1480 (`safe`) |
| ink by depth | front 4.8, mid 3.4, far 2.2, hair 1.6 px; far layers no ink (`depthInk`) |
| skies | day #ACD1BF, golden #ACD1BF, dusk #6D988B, night #588077, deep #3E605F (`skies`) |
| time of day | sky day #ACD1BF, golden #ACD1BF, dusk #6D988B, night #588077, dawn #ACD1BF; caption tone day dark, golden dark, dusk dark, night light, dawn dark (`todSky`, `todTone`) |
<!-- numbers:end -->

## 3. A complete minimal scene (v1's template: copy the API, never the look)

> Its look is v1's and retired: the per-shot `push`, the drifting, beating `Sun`, the structural overshoot, `Crowd`'s
> ink by depth and `rim`. A new film writes the same API in the clean pen and tiers (§7), with its own kit; the craft
> tooling lane (`docs/PIPELINE_V2.md`) rebuilds this template on it.

`src/scenes/Scene07.tsx` (auto-registered as `S07`; the id must exist in `src/data/scenes.json`):

```tsx
import React from 'react';
import {World, Sun, Fill, Ink, Drawn, Plane, wallQuad, Building, Crowd, Person, Tod, Palm, hline, rect, rectPath,
  palette, stroke, world, useTime, eyeLevel, ExitShrink, WiperComponent, FigureWiper} from '../lib';
import {ElephantTimeline} from '../lib/mascot';

const H = world.horizon;             // 768: reference 2's 0.40 H
const VP: [number, number] = [560, H];
const cam = eyeLevel({horizon: H, vpx: VP[0]});   // the lens at 1.1 x person height (section 2b)

const Scene07: React.FC = () => {
  const t = useTime();               // scene seconds; VO word at 35.162 s with start 32.947 => t = 2.215
  return (
    // one sky + one light: each key with `tod` wipes the sky down and relights every OBJECT in one frame as the
    // sky edge passes it (no fade, no edge through figures); `push` = reference 2's per-shot gentle zoom (+6 % / 2 s)
    <World sky={[{t: 0, tod: 'golden'}, {t: 4.2, tod: 'dusk', wipe: 'down'}]} push={{anchor: VP}}>
      {/* 1 sky-level: the sun sits on the horizon, beats on stressed words; it is never perfectly still (in a World it
             drifts 10 px/s by default; drift={[0, 0]} pins it for a match-cut on the sun) */}
      <Sun cx={560} cy={690} horizon={H} beats={[1.33, {t: 2.215, amp: 0.13}]} />
      {/* 2 far layer: fill-only, its own relight row (night: sage -> the night haze step); palm 6 person-heights */}
      <Tod role="far"><Palm x={cam.x(4.5, 800)} y={800} h={cam.height(800) * 6} at={0.4} seed="p7" /></Tod>
      {/* 3 ground: a flat fill + one long ink line (structural overshoot past the frame) */}
      <Fill rect={[-140, H, 1360, 1160]} color={palette.mintPale} offset={false} />
      <Ink d={hline(-60, 1140, H, {seed: 'h7'})} at={0.1} width={stroke.ink} />
      {/* 4 a facade receding to the vanishing point: draw it flat, map it onto the wall plane; its near edge (x -60)
             stands at feet y 1050 and is 2.2 person-heights tall (two low storeys: the top stays under the caption band) */}
      <Plane quad={wallQuad({vp: VP, x: -60, top: 1050 - cam.height(1050) * 2.2, bottom: 1050, depth: 0.7})} w={1400} h={440}>
        <Building x={0} y={440} w={600} floors={2} floorH={220} at={0.3} seed="b7" color={palette.cream} lightAt={4.5} />
      </Plane>
      {/* 5 an organic queue from behind walking into the distance: EYE-LEVEL rows (y = feet; scales from the camera,
             heads hug the horizon), ink by depth, far rows fill-only, rim light; rise builds front -> back */}
      <Crowd eye={{horizon: H}} far={{y: 790, x0: cam.x(0.3, 790), x1: cam.x(0.8, 790)}} near={{y: 1190, x0: cam.x(0.3, 1190), x1: cam.x(0.85, 1190)}}
             rows={12} at={1.0} span={1.8} build="rise" seed="c7" jitter={{x: 0.3, y: 0.15, scale: [0.62, 1.06]}} rim="left" />
      {/* 6 an actor: ink first, its fill lands 0.13-0.27 s later */}
      <Drawn d={rect(700, 1200, 160, 120, {seed: 'sign7'})} fillD={rectPath(700, 1200, 160, 120)} fill={palette.peach} at={2.1} width={stroke.inkBold} />
      {/* 7 the mascot (other lane's API): its un-build is a shrink to its feet, or its own exit={useExit()} (both
             opacity-free; docs/mascot.md "No fades") */}
      <ExitShrink x={480} y={1540}>
        <ElephantTimeline x={480} y={1540} scale={1.4} t={t} seed={7} keys={[{t: 0, pose: 'sit-back'}]} />
      </ExitShrink>
      {/* 8 a hero walker from the same camera (0.34 H, head just under the horizon; sleeves, hands, rim strip) */}
      <Person x={cam.x(-0.3, 1480)} y={cam.hip(1480, 150)} s={cam.s(1480, 150)} at={0.4} build="draw" legs legH={150}
              walk={1.7} ink={stroke.inkBold} seed="fg7" />
    </World>
  );
};
export default Scene07;

/** Optional: this scene's own close-to-the-lens element for {type: 'foreground-wipe', element: 'scene'} OUT of it,
 *  with the caption tone over it (where it covers the caption band, which tone reads on it). */
export const Wiper: WiperComponent = (p) => <FigureWiper {...p} color={palette.teal} />;
Wiper.captionRegions = (p) => FigureWiper.captionRegions!({...p, color: palette.teal});
Wiper.half = FigureWiper.half;   // optional: the element's real half-width (else derived from captionRegions)
```

`src/data/scenes.json` entry (v3: generated by `python3 -I scripts/anchor/resolve.py` from the word-anchored
`docs/storyboard_v3.json` through `scripts/anchor/engine_emit.py`; never edit it by hand, manual tweaks go in
`src/data/scenes.overrides.json`). The caption tone follows
`todTone`: **ink on day, golden AND dusk** (white on the sage dusk sky is only 3.2:1, ink 5.1:1), **white only from a
night key**. The template above goes golden -> dusk, so its captions stay dark the whole scene:

```json
{"id": "S07", "start": 32.947, "end": 38.566,
 "transitionIn": {"type": "foreground-wipe", "dur": 0.38, "element": "scene", "dir": "right"},
 "captionTone": [{"t": 0, "tone": "dark"}]}
```

A scene that reaches NIGHT switches the tone at the night key, with the same `wipe` / `dur` as that sky key so the
caption colour follows the sky edge: sky `{t: 6.1, tod: 'night', wipe: 'down', dur: 0.45}` ->
`"captionTone": [{"t": 0, "tone": "dark"}, {"t": 6.1, "tone": "light", "wipe": "down", "dur": 0.45}]`.

Preview it: `scripts/still.sh S07 2.0 previews/s07.png` (composition time = scene time) or the whole film
`scripts/sheet.sh Main 30 36 12 previews/s07_sheet.png` (+ caption check).

Multiplane shot (parallax layers): wrap the layers in **`<ShotCam push>`** (or `<ShotCam keys={...}>`) inside a
`<World stage="context">`. ShotCam = the cine `CineCamera` with the transition camera folded in; it is safe in a flat
World too (a flat World consumes the transition camera, so nothing is applied twice).

```tsx
<World stage="context" sky={[{t: 0, tod: 'day'}]}>
  <ShotCam push={{to: 1.06, dur: 2}}>
    <Layer depth={0.8}> far </Layer>  <Layer depth={0}> ... </Layer>  <Layer depth={-0.5}> framing </Layer>
  </ShotCam>
</World>
```

## 4. Stage: World, sky, time of day, camera, Film

| API | what |
|---|---|
| `<World sky tod? horizon? push? stage? overlay?>` | scene root. Full-bleed SVG in world px, the sky slab behind everything (it collapses LAST in an un-build). `sky` = colour \| bands `string[]` (top → horizon, all steps below y 600) \| a cine `TOD.x` palette (its bands + its name) \| `SkyKey[]` = `{t, color?, tod?, wipe?: 'down'\|'up'\|'left'\|'right'\|'snap', dur? = 0.4}`. A key's `tod` relights the scene in step with the sky wipe: the SKY slab wipes, and every OBJECT flips whole in one frame when the sky edge reaches its centre / its `<TodAnchor>` (motion spec #12: per-object pops staggered by height; no clip edge through figures; drawn once, no extra render cost). A key with only `tod` takes `todSky[tod]`. **Golden = the same flat day sky** (`skies.golden` = `skies.day`, style_bible_ref2 8): golden hour is told by the light (the golden relight row: pale-green fields warm to cream, clouds cream, figure rims peach) and a big low sun, never by a cream sky. (`skies.cream` exists for a deliberate warm paper beat: no relight row is built for it.) Storyboard notes that say "cream sky" for golden hour or dawn (S06, S08 "sky wipes cream -> sage", S09 "dawn cream") predate this decision: build them as `tod: 'golden'` (or `'dawn'`) on the day sky, and a dusk key `{tod: 'dusk', wipe: 'down'}` for "-> sage". |
| `push` | `true` or `{to = 1.06, dur = 2, at = 0, anchor = world.vp, ease = in-out sine}` (`MOTION.camera.push`): the gentle per-shot zoom every shot should carry (ref 2: +1.3…+5.9 %, starting with the cut). < 1 = pull-out (ref 2's night act). **After an incoming pull-back** (every `push-through`, camera-continuous `'out'`) the DEFAULT `to` is the matching pull-out 1 / 1.06 (`pushTo`): the pull-back lands into a slow continuing pull-back, one move with no reversal. An explicit `to` that runs against the incoming leg (a push-in after a pull-back, a pull-out after camera-continuous `'in'`) waits until that leg has settled (`pushStart`, Film passes the leg's `settle` time; also in ShotCam): no camera bounce. `inkComp?`: opt-in ink compensation for a big push (4b). |
| `stage` | `'flat'` (default): the transition camera moves the scene as one plane and is CONSUMED (children see `useStageCam()` = rest). `'context'`: World does not apply it; `<ShotCam>` / `<CineCamera stage>` folds it in with parallax. `useWorldStage()` tells which. |
| `<Tod value? role? map?>`, `<TodAnchor at>`, `useTod(at?)`, `relight(c, tod, role)` | time-of-day relight (lib/tod.tsx). Every `<Fill>` maps its colour through the shared step table `todSteps` (theme.ts, reference 2 measured: only light fields step down, whites stay white, ink / sun / highlight never move). Roles: `'far'` (hills, far rows: night sage → `nightFar`), `'cloud'`, `'framing'` (corner fronds: a darker teal silhouette on the dusk sky, one step lighter than the night sky). `<TodAnchor at={[x, y]}>` = everything inside flips together (kit components anchor themselves: Person, Building, Wall, Tree, Palm, Car, WaterTower, LampPost, UtilityPole, Noticeboard, Window, Door, Cloud). **Cine pieces** (Skyline, EndlessCity, Monument, TinyCrowd, StringLights, ...) read the same context (`useTodPal`): **omit their `tod`**; wrap a piece / row in `<TodAnchor at={[cx, cy]}>` (its centre, world coords, inside the World) and it flips when the sky edge reaches IT (the anchored time of day is the context's value; unanchored pieces switch at the vanishing point). **Never call `useTod()` in the scene body** (the component that returns `<World>`): it runs above the World and returns `'day'`; call it only in components rendered inside the World. Golden row: `mintPale` → cream, clouds → cream, rims (`role="rim"`) → peach. `node scripts/engine-numbers.mjs --check` fails if any relit fill, or any light base fill that meets the sky (white, cream, sand, mintPale, tan), or the bulb halo lands within one palette step (1.15:1) AND within dE 15 of its sky (`relightProblems`). |
| sky keys: `snap` and the stepped tween | A key WITHOUT `tod` only recolours the sky: it inherits the light, never relights an object, and never cuts a running relight wave short. Only a key that CHANGES `tod` relights; with `wipe: 'snap'` every object relights in that one frame. A **stepped uniform tween** (style_bible_ref2 9.2: no wipe edge crosses the captions; storyboard v3 S08 dusk) = consecutive `snap` keys with explicit colours, the LAST one carrying the new `tod`: `[{t: 0, tod: 'golden'}, {t: 5.0, color: '#A0C7B5', wipe: 'snap'}, {t: 5.15, color: '#94BDAA', wipe: 'snap'}, {t: 5.3, color: '#88B3A0', wipe: 'snap'}, {t: 5.45, color: '#7CA995', wipe: 'snap'}, {t: 5.6, color: '#709F8B', tod: 'dusk', wipe: 'snap'}]`. Verified: the sky steps on each key, fills stay golden on the four colour-only steps and flip to dusk in the one frame of the `tod` key. The caption tone for such a tween is a plain key at the `tod` key's time (or none: dusk reads with ink). |
| `skies.*`, `todSky`, `todTone` | sky colours and the caption tone that reads on each time of day. |
| `<ScreenSpace>` | children ignore the transition camera AND the push (HUD-like layers inside a World). |
| `useScene()` | `{id, start, end, dur, transitionIn?: {type, dur, dir?}}` (VO seconds) |
| `useTransition()` | `{type, phase: 'in'\|'out', p}` while this scene is entering/leaving, else null |
| `<ShotCam push? keys? handheld?>`, `pushKeys()` | multiplane camera with the transition camera folded in (see 3). Keys / `push` take an opt-in `inkComp` (4b). |
| `<InkScale value? zoom? from? k? reset?>`, `useInkScale()`, `inkCompFactor()` | opt-in ink compensation across big zooms (4b). |
| `<Film scenes components wipers captions offset? only?>` | Main's sequencer (you don't render it). Captions (with tone regions, section 6) + soundtrack (`public/mix.wav` if present, else `public/vo.mp3`). |
| `<Standalone captions tone unbuild loop cam>` | dev previews: one scene + captions (+ un-build + loop) at frame/fps time. |

Root registers `Main` (whole film), **one composition per scene id** (that scene alone, its captions, the soundtrack
offset to its range, its own un-build) and the dev compositions in `src/dev/registry.ts`.

### 4b. Ink weight across big zooms: `inkComp` (opt-in, default OFF)

A camera that zooms the world by z scales every stroke by z: S01's 0.33 s dive (x3.07) lands its 3.4 px set lines at
the cut as 9-11 px (style ceiling 5.2 px) while S02 opens at 2-5 px, so the line weight jumps across the match cut.
Inside an **`<InkScale>`** (lib/inkComp.tsx) the engine's strokes are drawn at width x factor, factor = (z / z0)^-k:
a zoom keeps only z^(1-k) of its line growth (**house k = 0.6** (`INK_COMP_K`): a 3x dive lands at ~1.55x, not 3x).
It is a context read per stroke (no extra pass); outside any InkScale the factor is exactly 1 and nothing changes.
Nested InkScales multiply. Honoured by `<Ink>` (so `<Drawn>`, `<InkGroup>` and every kit / set / prop line drawn with
Ink), the mascot `<Elephant>` (its `lineWeight` x factor), `<ClockHands>` and the kit `Bird` flight stroke. A raw
`<path strokeWidth>` you draw yourself: multiply by `useInkScale()`. Geometry is NOT compensated (dash spacing,
misregistration offsets, sizes). `<ScreenSpace>` resets it to 1 (no camera zooms it).

| camera | opt in | factor |
|---|---|---|
| your own transform (S01's `layerMat`, any scene camera.ts) | `<XG m={layerMat(t, name)}><InkScale value={inkCompFactor(zoomNow, 0.6, zoomAtMoveStart)}>...</InkScale></XG>` (or `<InkScale zoom={zoomNow} from={zoomAtMoveStart}>`) | what you pass; use `from` = the zoom where the compensated move starts, so it is exactly 1 there (no width step) |
| `<ShotCam keys>` / `<CineCamera keys>` | **in the dive keys, set `inkComp: 0.6`** on the key that ENDS the segment (like `ease`): `[{t: 4.385, zoom: 1.04}, {t: 4.715, zoom: 3.19, inkComp: 0.6}]` | per `<Layer>`: (layer scale now / layer scale at the segment start)^-k (dolly parallax included), 1 at the segment start, HELD after it (**if the camera comes back, flag the return key too**, or the lines stay thinner than nominal at rest); flagged segments multiply (a flagged dive in and a flagged pull-back out cancel); handheld / `add` not compensated |
| `<World push>` | `push={{to: 2.5, dur: 1, inkComp: 0.6}}` | pushZoom^-k (one zoom, the same for everything in the World) |
| `<ShotCam push>` | `push={{to: 2.5, dur: 1, inkComp: 0.6}}` | a DOLLY (it becomes two flagged keys), so per `<Layer>`: (layer scale now / layer scale at the push start)^-k: far layers grow less and get less (measured, a 4 px line at `to` 2.5: depth 0 10 -> 6 px, depth 0.5 5.75 -> 4.76 px) |
| Film `camera-continuous` / `push-through` | `transitionIn: {type: 'push-through', zoom: 7, inkComp: 0.6}` | zoom^-k on both legs (`StageCam.ink`; a flat World applies it, `<CineCamera stage>` / ShotCam folds it into its Layers) |

**The factor is HELD after a flagged segment.** If the camera comes back, flag the return key too, or the lines stay
thinner than nominal at rest (measured: keys 1 -> 3x flagged, hold, -> 1x UNflagged: a 4 px line renders 2.0 px with
the camera back at zoom 1; with the return key flagged too it is 4.0 px again). A `<World push>` / transition factor
and your own `inkCompFactor(zoomNow, k, from)` follow the zoom live instead (back to 1 when the zoom is back at `from`).
`useScreenWidth(depth)(px)` (CINE.md) is no longer screen-constant inside a flagged camera when fed to `<Ink>` (Ink
multiplies by the layer factor): divide it by `useInkScale()` there.

**Coverage gaps (raw strokes).** Only the pieces listed above read the factor. A raw `<path strokeWidth>` stays
uncompensated even inside an opted-in InkScale unless its width is multiplied by `useInkScale()`. The shared props and
sets are DONE (every raw ink width in `scenes/shared/props/**` and `sets/**` reads the factor, incl. BrowserChrome, Lock,
SunMorphs and GovernmentPlaza's pennant chevron; the deliberate exceptions are listed in SHARED_PROPS.md 1 /
SHARED_SETS.md 1). Still raw: core `FigureWiper` (screen space, never zoomed: fine) and the lib/cine pieces (city,
street, props, monument, sky, tower, wall, wipers, lens, light, windows, figures). **Fills are never compensated**: a
fill sized in world units to tuck under a line (a bleed / spill past an edge) grows with the zoom and can read as a
heavy bar next to a thinned line; size such a spill in screen px (`/ matScale(useXf())`, in a component, not a plain
render callback) instead.

Verified (temporary lab entries, removed): CineCamera keys 1 -> 3x: a 4 px line 12 px -> 6 px, held after the
segment; World push 2.5x: 10 -> 6 px; push-through x7 at u 0.9: 20 -> 8 px; S01 with the opt-in (below): the set's
door frame / lintel at the cut 9-11 px -> 5-6 px (mid lines 6-7 -> 3-4 px), S02 opens at 2-5 px. Default off: S01,
S08 (ShotCam), S10 (World push + ScreenSpace) render pixel-identical to before.

**S01 opts in in its set `wrap`** (it uses its OWN camera, scene01/camera.ts `layerMat`, applied per GovernmentPlaza
layer through the set's `wrap`, not the engine's keys; its camera.ts exports `inkComp(t, layer)` = the factor relative
to the dive start, ramped sun layer included). **The clean opt-in (recommended) wraps the set AND the extras**:

```tsx
const wrap = (name, _n, node) => (
  <XG m={layerMat(t, name)}><InkScale value={inkComp(t, name)}>{node}{extra[name] ?? null}</InkScale></XG>
);
```

and drops every manual dive multiplier from the extras (`ink` / `inkK` / `lineWeight` x inkComp(t), `/ zoomAt(t)`):
an extra that reads the context (Ink-based kit people, `<Elephant>`, cast.tsx's `useInkScale()` readers) would else be
compensated twice. With the full form, extras without a manual multiplier (Bit, LanternOff, TreeTicks, Pigeon,
Onlookers, S01Branch) are compensated too, as far as they draw with `<Ink>` (their raw strokeWidths: see coverage gaps).
The minimal step, `<XG ...><InkScale value={inkComp(t, name)}>{node}</InkScale>{extra[name] ?? null}</XG>`, wraps the
set only and leaves those extras at the raw dive weight; it is a stopgap, not the target. (The S01 lane's plaza.tsx is
already on the full form; cast.tsx reads `useInkScale()`.)

## 5. Transitions (`transitionIn` of the INCOMING scene; c = its `start`)

A new film's joins are carriers A-F (`docs/look/CRAFT.md` §a); their engine types are mapped in
`docs/G5_BLOCKING.md` §2 (the push-through and camera-continuous below are carriers A and C again).

**v3: transitions add no camera.** `cut`, `matchcut` and `foreground-wipe` never move a scene (Film passes the rest
camera: `useStageCam()` = rest, `useScene().transitionIn.settle` = 0 for cuts, `zoomDir` = 0, so a World / ShotCam
`push` starts at its own `at`). Every camera move is a scene key; never rely on the default World push (+6 %).
`camera-continuous` and `push-through` remain for v2 material only (not in the v3 storyboard).

| type | params (defaults) | what happens / what the scenes must do |
|---|---|---|
| `cut` | – | hard cut at c; no camera |
| `matchcut` | – | hard cut at c, no camera of its own (no zoom, no settle): both scenes put the shared object (sun, horizon line, a door, the mascot) at the SAME screen spot, each with its own camera keys (a dive that ends on the cut and a landing that starts on it belong to the two scenes) |
| `camera-continuous` | `dur` 1.4, `dir` 'in'\|'out'\|'up'\|'down'\|'left'\|'right', `amount` (incoming travel: zoom ≤ 1.15 or px ≤ 150; default scales with dur), `focus`/`to` [x,y] | ONE weighty move: the outgoing camera accelerates into the cut over dur/2 (ease-in cubic), the incoming scene continues at the same velocity and decelerates over `dur` after the cut (out-cubic): 90 % of the settle takes ~0.54 x dur (0.88 s → 14 frames). Incoming starts zoomed out / offset: author the bleed. |
| `foreground-wipe` | `dur` 0.8, `element` 'figure'\|'pole'\|'foliage'\|'column'\|'passer'\|'scene', `dir` 'right', `color`, `captionTone` | something passes right in front of the lens; old scene on the unswept side, new scene behind it. `'scene'` = the OUTGOING module's `export const Wiper: WiperComponent` ({x, p, dir, color}, screen px, opaque over x±90 for the full height; give it a static `captionRegions`, and optionally a static `half`). The edge runs from `-half - 30` to `W + half + 30`, where `half` = the element's REAL half-width (ink + misregistration): built-ins carry it (`FigureWiper.half` 671, `PoleWiper.half` 131, `FoliageWiper.half` 552; cine column 230 / passer 680), a scene `Wiper` without `half` gets it from its `captionRegions` bounds + 10 px (`wiperHalf`), else the figure's, so the element enters and leaves fully off-frame (no edge sliver). Captions are split at the wipe edge and take the wiper's tone over the element (built-ins: hooded figure / pole → white, foliage per crown; cine column / passer → white). The edge moves with an in-out sine (`wipeEdgeX`). **No drift (v3)**: both scenes stay put under the element (the scenes' own cameras keep running); `drift: 50` restores v2's 50 px parallax drift of both scenes. v3: S07 (S06's printed leak sheet) and S10 (S09's tram) are `element: 'scene'`; a scene without its own `Wiper` falls back to the hooded figure. A Wiper that is not opaque for the full frame height (a tram under open sky) must still cover x ± 90 top to bottom (a pole, a raised sheet edge, steam), or the clip edge shows. Verified with a 1300 px tram, `half` 660: measured extents match `wipeEdgeX` to the pixel, off-frame at p 0 and p 1. |
| `push-through` | `dur` 1.1, `from` [x,y] (outgoing point), `to` [x,y] (incoming point, default centre), `zoom` 7, `bridge` colour, `inkComp` (opt-in, 4b; also on `camera-continuous`) | the outgoing scene zooms into `from` until it fills the frame (match its colour to the incoming scene), optional 3-frame flat `bridge`, the incoming scene pulls back out of `to`. The incoming World `push` defaults to a gentle pull-out that continues the pull-back (section 4). |
| `unbuild` | `dur` 0.5 | the outgoing scene un-builds ON TOP of the incoming one, which is already rendered at local t < 0: design your t < 0 state (ink-only line art via `<Look fills="paper">` or nothing). The new caption tone follows the collapsing slab edge. |
| last scene `transitionOut` (v3) | `{type: 'cut', loop: true, captionAt}` | **the v3 loop: a full-colour seam (S12's rewind).** The last scene plays to its last frame untouched: no un-build, nothing rendered underneath, the first scene is never shown at t < 0. The cut back to frame 0 IS the loop, so the last scene's last frame must equal frame 0 (S12 rewinds to one step before the frame-0 press) and the seam must be mid-motion (spec T6: frame 0 releases the press). `filmLoop(scene)` tells Film code which loop it is. |
| last scene `transitionOut` (v1 / v2) | `{type: 'unbuild', dur, loop: true, captionAt}` | un-builds into the FIRST scene at its t < 0 state (the line-art loop). Frame 0 must equal that state AND the seam must be MID-MOTION (spec T6): start the opening's first motions slightly BEFORE t 0, e.g. `<Sun rise={{at: -0.12, ...}}>` and `<Look cascade={{at: -0.05, ...}}>` (negative start times are allowed everywhere), so the underlay is already moving while it is revealed (KitDemo: 358→359→0→1 = 0.6 / 4.2 / 2.3 % of pixels change; no held frames). |
| loop captions (both) | `captionAt` (default end − 0.22) | Captions roll back to page 1 at `captionAt` (the scroll START, VO s): page 1 exactly as frame 0 shows it, laid out by its FINAL line count (line 1 on its frame-0 baseline, never re-centred as a one-line page; line 2 and its box stay hidden and rise after the seam at their own times; boxes frame 0 shows arrive already drawn). **The seam is "end + 1 frame"** (storyboard v1 / v3): the roll keeps the measured scroll curve, time-scaled (0.2-0.45 s) so page 1 is `LOOP_SEAM_PX` = **24 px low at the seam**; frame 0 shows it 24 px low and its first frames finish the same roll (SkyCaptions `loopAt` / `loopEnd`, `loopRollDur`). Measured on Main (captionAt 55.26, seam 55.367): line 1's offset 80 → 44 → **frame 0: 24** → 14 → 6 → 2 → 2 → 0 px, settled at frame 5 (0.17 s): no step, no jump. A `captionAt` with more room (≥ 0.19 s before the seam) uses the measured 0.45 s and lands closer than 24 px (KitDemo: 6 px). |

Outgoing and incoming scenes keep rendering through overlaps (they hold their end state; local time keeps running).

## 6. Captions

- Data: `src/data/captions.json` = `[{s, e, lines: [{text, s}], highlights: [{text, s}], style?}]`, all **word-start**
  times on the CURRENT voice (v3, `assets/timing.json` = `assets/timing_v3.json`, 55.36 s; the last page ends exactly
  on it: checked by `engine-numbers --check` and the resolve guard). v3: generated with scenes.json by
  `python3 -I scripts/anchor/resolve.py` (paging + highlights from `docs/storyboard_v3.json`). The v2 node generators
  (`node scripts/gen-captions.mjs [--storyboard]`) still work on the old storyboards. Overrides:
  `src/data/captions.overrides.json` (by page index).
- **Empty band across a dive or match cut (`out`).** A page with `out: t` scrolls up and away at `t` (the standard
  scroll curve, clear of the band ~0.1 s later) with no page replacing it; the next page then rolls into an empty
  band instead of pushing the old one. S01 uses it so no caption sits over the 0.33 s dive into the lock:
  `{"1": {"out": 4.285}, "2": {"s": 4.755}}` (page 3's s = cut + scroll lead, so its roll starts exactly on the cut).
- **Labels are scene-owned props, never captions.** The storyboard's on-screen labels (`labelStyle`: tags on strings,
  cards, slips, an A-frame sign, the S08 board; Patrick Hand 34-40 px ink on cream, pinned / hung / taped in the
  world) are drawn by the scene that owns them (the shared `LabelTag` prop), in WORLD space, under the camera, at
  screen y 600-1480. Captions render only `lines` and `highlights` of captions.json: no label field exists there, no
  generator writes one, and SkyCaptions never draws anything outside the caption band (y 280-570, clipped). Never put
  label text into captions.json or a caption override; never draw a label in the caption band.
- Motion (measured, applied in `SkyCaptions`): page change = whole stack scrolls up (clip height + 20) in 0.45 s
  `bezier(0, 0.7, 0.12, 1)` starting 0.04 s before the first word (old page gone in 2–3 frames); line 2 rises
  ~1.15 pitches in 0.42 s, 0.08 s early; highlight box wipes L→R, `bezier(0.3, 0.3, 0.1, 1)`, 0.19 s + 0.3 ms/px,
  0.10 s early. First page = hook style (×1.06) and is on screen at frame 0. Lines wider than `skyCaption.maxWidth`
  shrink the page font.
- **Highlight box** = `skyHighlightBox` (reference 2): square, 0.19 em padding on both sides, top 0.90 em (ascenders
  inside), bottom 0.19 em, trailing punctuation INSIDE ('asking.'). The word stays ink on peach in both tones.
- **Tone** = `captionTone` in scenes.json (scene-local `t`). A key switches in one frame, or with `wipe: 'down'|'up'`
  (+ `dur`) follows the sky wipe edge. Film splits the captions SPATIALLY across foreground wipes (edge + wiper),
  un-build slabs and tone wipes: the text is rendered once per region, clipped. Direct use:
  `<SkyCaptions split={{x: (T) => edge(T), left: 'light', right: 'dark'}}>` or `regions={(T) => ToneRegion[]}`
  (`{tone, rect: [x0, y0, x1, y1]}` or `{tone, d, transform}`, painted in order). `toneOn(color)` picks the tone that
  reads on a flat colour; `contrast(a, b)` = WCAG ratio.
- Orchestrator switch: `skyCaption.motion` = `'pop'` (the house default for every film, playbook "Captions": pages,
  lines and boxes pop in one frame; Film `captionMotion: 'pop'`) or `'scroll'` (v1's measured scroll / rise / wipe and
  still the theme's code value; it clipped letters on the posted reel).

## 7. Drawing primitives

| API | notes |
|---|---|
| **the clean pen** (`lib/pen.ts`, `lib/tier.tsx`) | **a new film's default (2026-10-27).** `setPen('clean', {bg, emissive})` once, at module load, in the film's look module (v3: `src/v3/film/look.ts`). Every `Ink` / `Fill` (and every kit piece drawn with them) then draws each shape as ONE closed path, fills registered exactly, no overshoot, drift, breaks, jitter, open contours, taper or loosening, and `hatch`, `scribble`, `wallTicks`, `crownTicks`, `speedLines`, `cross` draw nothing; line and fill come from the TIER: kit pieces declare a default with `tiered('environment', {tone}, Body)`, scenes force one with `<Tier tier="environment" bg={...}>`, raw SVG asks `useTierLine()` / `useTierPaint()`, idle motion scales by `useTierMotion()` (`docs/look/CRAFT.md` §b-§c; header of `lib/pen.ts`). The sketch pen (the rows below as written) stays for v1 / v2 renders and G3 boards. `lib/cine`'s drawing pieces are not clean-pen-aware (`docs/CINE.md`). |
| `<Ink d at? dur? width? color? order='seq'\|'all' pace='spec'\|'free' open? taper? dash?>` | pen draw-on. **Spec pacing**: every subpath is one stroke of 0.10–0.20 s whatever its length, successive strokes start 1 frame apart (3–6 in flight). `dur` only spreads the stroke starts. Long strokes taper. Un-build: lines loosen, then retract (sketch pen; under the clean pen an object draws on as one stroke, no taper unless asked, no loosening) (inside an `<ExitSync>`, e.g. every Person: WITH the group's fills). `inkDrawTime(d, dur?)` = total time. |
| `<Fill d\|rect color at? mode dir? dur? offset? exitMode? opacity? lookExempt?>` | flat fill, misregistered (`misreg`) by default under the sketch pen (the clean pen registers it exactly; a subject's outline goes inside its fill with `<Ink inside={fillPath}>`), relit by the current `<Tod>`. Modes: `pop` (default: 20%→100% about its centre in 0.12 s), `snap` (1 frame), `wipe` (linear, 0.12 s; `dir`), `grow` (from an edge, out-expo 0.2 s), `spring` (7% overshoot), `none`. Exit: shrinks to its centre; fills covering ≥ ~55% of the frame (sky, a bleed ground, a big wall) are the slab: they collapse LAST under the World sky's ONE falling edge (a slab fill is eaten when that edge reaches it; never a second slab with its own top edge). |
| `<Drawn d fill at ...ink>` | ink + its fill landing 0.13–0.27 s after the outline STARTS (seeded). |
| `<Look fills='paper'\|'none'\|'color' ink? cascade={{at, origin, speed}}>` | render states: paper = ink on white fills (frame 0 / loop frame), `ink={false}` = fills only, `cascade` = paper until a wave from `origin` (the VP) reaches each fill (the opening fill cascade, ~0.3 s; `at` may be negative so the loop seam is mid-motion). The World sky keeps its colour. **Cine pieces are state-aware** (`cine/state.tsx`: Skyline, EndlessCity, Monument, StringLights, ...): they un-build (sink into their base, small first) and take paper / cascade (white fills + hairlines) by themselves. **Never wrap them** in an exit / Look-aware group: the un-build would run twice and the paper hairlines would be hidden. |
| sketch (`lib/sketch.ts`) | `line hline vline rect poly smooth circle ellipse blob arc wire wirePoint crown crownTicks glint hatch arrow check cross textLines wallTicks speedLines scribble` (ink paths: overshoot, drift, breaks, seeded, under the sketch pen; one closed path each under the clean pen) + closed fills `rectPath roundRect polyPath torso blob crown`. Memoised: calling them every frame is cheap. |
| `<Plane quad w h>` + `wallQuad({vp, x, top, bottom, depth})`, `groundQuad(...)`, `frontQuad(...)`, `rayPoint(vp, p, k)` | **one-point perspective**: draw anything flat in plane-local px, it is projected onto the receding quad; strokes keep screen widths. Only Ink/Fill (and kit built from them) are projected. |
| `XG`, `mat`, `Place` | affine groups that also work inside a Plane (folded into the projection). |

## 8. Motion

| API | notes (MOTION constants in `src/lib/spec.ts`) |
|---|---|
| `prog(t, start, dur, ease)`, `keys`, `springAt(t, at, springs.pop\|rise)`, `stagger`, `spread`, `osc` | time helpers (`lib/time.ts`). `springs.pop` = 7% overshoot @ 0.2 s, `springs.rise` = 3%. `bez(x1,y1,x2,y2)` = CSS cubic-bezier. |
| `<Pop at x y>` | scale-in about (x, y), 7% overshoot. |
| `<Rise at dist=140 dur=0.33>` / `<Sink at>` | rise ~own height from below with out(exp) 0.33 s; sink = exit 0.2 s ease-in. Hide the entry behind something. |
| `<Move from to at dur arc>`, `<Walk>`, `<Wobble>` (idle), `<Shake>`, `<Tween>` | slides, walks, idle life. |
| `<Appear at outAt>` | 1-frame pop in/out. |
| `<UnBuild at dur=0.5>` / `<NoExit>` / `useExit()` | local un-build with the measured recipe (loosen → fills shrink → ink retracts → slab collapses). |
| `<ExitSync seed? jitter?>` | one un-build window for a group: its fills share one jitter and its ink retracts WITH those fills instead of after them, so a figure leaves as one. **Every `Person` (so every `Crowd`) is wrapped in it**: while a front figure shrinks, the ones behind are whole or gone, never a tangle of bare outlines. Use it for your own overlapping figures / props. |
| `<ExitShrink x y>` | raw-SVG characters (the MASCOT) un-build by shrinking to their FEET anchor with the fills' ease-in window (~0.18 s of a 0.5 s un-build; a reversed pop). For the mascot, `<ExitShrink>` or the Elephant's own **`exit={useExit()}`** (fills shrink, then the ink retracts, in the un-build order; docs/mascot.md "No fades") are both fine. The Elephant's `draw` is opacity-free too (its fills grow 20% → 100%). |
| Camera vocabulary | `MOTION.camera` = THE vocabulary for both kits (the cine `CAM` presets carry identical values): `ease` in-out cubic (default move), `slow` in-out sine (4–6 s moves), `reveal` = cruise trapezoid(0.25, 0.35) (crane / tilt: peak 1.43 x its average speed), `settle` out-cubic (starts in motion), `push` (per-shot zoom), `peakPxPerFrame` 18 (flat ink strobes above ~15-20 px / frame: size long moves so the PEAK stays under it). `cruiseEase(acc, dec)` builds other cruises. |

## 9. The sun (a character)

v1's API. In a new film the sun is light, never a character or idle motion: one light rig per set, and a source never
moves between cuts (`docs/look/CRAFT.md` §d.1).

`<Sun cx cy r horizon rise beats bounce hops moves drift breathe at>` — in a World it defaults to `sunWorld`.
- `rise={{at, from: VP}}`: emerges from the vanishing point in 0.37 s (ease-out) then pulses +7% (the opening).
- `beats={[t, {t, amp}]}`: +4…+13% pulses (attack 0.08 / hold 0.08 / release 0.27), the PEAK lands on t (stressed words).
- `bounce={{times: [...], h}}`: ballistic bounces whose touch-downs land on word onsets, with landing squash.
- `hops={[{t, to: [x, y], h = 74, air = 1.03}]}`: anticipation squash 0.1 s, stretch, floaty arc, landing squash.
- `moves` (set / slide / grow), `drift` px/s, `horizon` clips it (setting behind a line). **In a World the sun drifts
  by default** (`SUN_IDLE_DRIFT` = [10, 0] px/s from scene t 0: never perfectly still); `drift={[0, 0]}` pins it (a
  match-cut on the sun: its x at the cut is `cx + 10 * t` unless pinned). The cine `BigSun` sinks by default instead.
- Order matters for depth: draw it before the skyline to sit BEHIND silhouettes (huge low sun, Arcane), or after
  everything (card-style anchor). The cine `BigSun` wraps it with time-of-day colours.

## 10. Kit (`lib/kit`)

v1's kit: references and engine primitives, never a film's assets (playbook: each film draws its own). Its glow discs
and halos (`Festoon`, `LampPost`: up to 2.2x) and rim slivers predate `docs/look/CRAFT.md` §d (one halo step of at
most 1.7x or none; a rim only on the subject, inside its silhouette).

- `Person` (back view; `build` draw/pop/rise; `ink` = on-screen weight; `hair` short/long/bun/cap/beanie/bald/curly;
  `acc` backpack/headphones/strap/phone/scarf/sign/collar/hood; `legs`, `legH`; `lod` 0/1/2). **Hero detail**
  (around s = `heroFrom`, default 1.2, or `hero` true / false to force it): arms in sleeves (seams inset 18 %), cuffs,
  waistband, sand hands, hood; **`rim`** 'left'|'right'|false = reference 2's 3 px pure-white strip inside the outline
  (default 'left' for heroes; relit peach at golden via `<Tod role="rim">`). `walk={steps/s}` walks in place (move x / y /
  s yourself to walk into depth). **Level of detail never pops**: every size-dependent detail RAMPS with the scale over
  its own short window (the rim shortens along the edge, seams thin, hands shrink into the sleeves, the hood sinks to the
  collar, the nape notch flattens), staggered and jittered per person, so a figure walking into depth (s 1.32 → 1.08)
  loses its detail over ~15 frames instead of in one. To keep the detail fixed for a whole shot pass **`lodScale`**
  (the s the LOD decisions use, e.g. the starting scale). Moving a whole crowd in depth: use the camera (World `push`,
  ShotCam), which never changes LOD; `Crowd`'s ink ladder and lod switches are ramped / jittered per person too. If a
  crowd's `far` / `near` rows must animate, give it **`layout={{far, near}}`** (the rows at the start of the shot):
  the slots (who stands where, how many per row) and every LOD decision are frozen and carried onto the moving rows;
  without it a row that gains a slot re-lays out in one frame.
- `Crowd` (rows far→near, depth ink via `crowdInk(s)`, far rows fill-only blobs, `build`, `order`, `limit`;
  **`eye={{horizon, ratio?}}`**: rows' `y` are FEET lines and every scale comes from the eye-level camera (section 2b;
  legs on every row); **`jitter={{x, y, scale: [min, max]}}`** for an organic queue (children, tall adults,
  overlapping pairs, feet on the ground), **`rim`** for people with s ≥ ~0.6 (ramped), `heroFrom` (default 0.7) for sleeves /
  hands). **`build='rise'`** fills front → back by default and a person RISES only where the entry is hidden (the row in
  front already stands, or the front row's feet are at the frame bottom / `occluded`); everyone else pops, so nobody
  sprouts out of bare pavement (`order='back'` + `'rise'` therefore needs an occluder to actually rise).
- `Person` hero heads (lod 0, head > 60 px): a notched nape hairline and hair strands on light hair (never a smooth
  skin-coloured disc); caps at hero size drop the strap opening and keep a non-skin nape; scarves sit below the
  collar line (a scarf right under the head read as a beard under a face).
- `Building` (+ **`lightAt` / `lit` / `litColor`**: windows switch on one by one at night), `Wall`, `Ground`, `Window`,
  `WindowGrid`, `Door`, `Tree`, `Bike`, `Bird`, `BirdsOnWire`, `Festoon` (string lights, plane-safe; a lit
  bulb at night gets reference 2's OPAQUE flat halo disc, r 2.2 x the bulb, `glow.bulbHalo` #749484, behind the wire:
  `todBulbHalo`; no halo by day / at dusk; never a translucent overlay),
  `LampPost` (`lightAt`: a 1-frame flicker on; a static translucent cone and a STEPPED FLAT glow: an opaque peach disc `glow.lamp` r 18 plus, at night, the `todBulbHalo` step r 30), `UtilityPole`, **Town** (`Palm`, `Fronds` (also top-corner framing), `WaterTower`, `Car` (back view, `lightsOn`)),
  `BrowserWindow` (switch-off = CRT squash, no fades), `Padlock`, `Noticeboard`, `Paper`, `Stamp`, `Bug`, `Shield`,
  `Cloud`, `Server`, `Laptop`, `Place`. Every component takes `at` (omit = already built) and a `seed`.
- Built-in wipers: `FigureWiper` (`src/lib/FigureWiper.tsx`: a hooded passer-by at the lens, drawn like the cine
  passer: one closed outline with an irregular, slightly peaked hood, back seam and creases, the hood's drape ink
  overshooting the silhouette, fills misregistered 5 px, an ~8 px rim sliver (`rim`, default sage) INSIDE the leading
  outline, a walking bob), `PoleWiper`, `FoliageWiper` (each with `captionRegions`), plus the cine `column` / `passer`.

Reference figure (`src/dev/KitDemo.tsx` v3, copy its CAMERA block): an EYE-LEVEL street (lens 1.1 x person height,
horizon world.horizon): every head in the band just under the horizon, a queue converging on the horizon line
(`Crowd eye`), two hero walkers (0.36 / 0.34 H, heads at y ~815) and a passer-by cut by the left edge and the frame bottom, the mascot at
the walkers' feet, a huge low sun flanked by far palms, a far skyline under the caption band, single-storey houses
(left) and a long low row behind a picket fence (right) on receding planes, string lights, corner fronds,
day → dusk → night (per-object relight), and an un-build that loops mid-motion.

## 11. Preview and check commands

```bash
npx tsc --noEmit                                         # must be clean
scripts/still.sh <Comp> <sec> out.png [--scale=0.5]      # one frame (Comp = Main, S01..S13, KitDemo, CineDemo, ...)
#   still / sheet / strip bundle ONLY what the composition needs (render-frames --entry=auto): a dev composition gets a
#   generated entry with just its own file, Main / S01.. use src/entry-film.ts (no dev previews), so another lane's
#   half-written file can't break your previews. --entry=full = src/index.ts (everything, like the Studio).
scripts/sheet.sh <Comp> <t0> <t1> <n> out.png [--scale=0.35] [--cols=N] [--no-capcheck]   # contact sheet + caption check
#   any sheet / still composition stays <= 16384 px tall: Chrome tiles a taller page wrongly (the content past
#   y 16384 is painted over the top of the page), so lay tall kit sheets out in columns (v3 KitSheet3: 2160 x 9600)
scripts/strip.sh <Comp> <t0> <t1> out.png [--crop=WxH+X+Y] [--scale=0.5] [--step=1]  # EVERY frame: check motion
node scripts/capcheck.mjs Main                           # caption legibility: 4 frames per scene + every transition window
node scripts/capcheck.mjs S07 --verbose --viz=/tmp/cc    # one scene; --viz paints failing background pixels magenta
node scripts/engine-numbers.mjs [--check]                # regenerate / verify the numbers block of this page; --check
                                                         # also fails (STALE) if scenes.json / captions.json do not end
                                                         # on the voice or a relight row vanishes into its sky
python3 -I scripts/anchor/resolve.py                     # v3: docs/storyboard_v3.json -> src/data/scenes.json +
                                                         # captions.json (orchestrator only; refuses unless both end
                                                         # on the voice)
node scripts/gen-captions.mjs --storyboard               # v2: captions.json from storyboard paging + timing.json
node scripts/gen-scenes.mjs                              # v2: scenes.json from docs/storyboard_v2voice.json (+ overrides)
npx remotion render src/index.ts Main out/main.mp4       # full render (shared 4-CPU machine: render ranges)
```

**Caption check** (`scripts/capcheck.mjs` / `capcheck.py`, also run by `sheet.sh`): each frame is rendered a second
time with input props `{capcheck: 'mask'}` (SkyCaptions draws code colours per tone, Film skips the scenes); in the
caption band, the background within 0.3 em of the glyphs (excluding glyph and highlight pixels) is measured against
the ACTIVE tone's text colour. FAIL = more than 5 % below 3:1. Fix by keeping detail out of the band, darkening /
lightening the sky, or a tone key / region.

Look at your frames next to `assets/ref2/f_*.png` and `assets/ref/f_*.png` before calling a scene done.

## 12. Performance rules

Measured (concurrency 2, 1080×1920, incl. page setup): KitDemo v3 (two eye-level crowds ~90 figures, 4 hero-size
people, 3 planes, 3 festoons, cine skyline rows, 7 palms) **~130-150 ms/frame** (40 spread frames: 149), the same
during a time-of-day relight (objects flip, nothing is drawn twice).
- No filters, blur, gradients, masks with soft edges, `<foreignObject>`. Clip paths only where needed.
- Path generators are memoised; still, build static geometry once (module scope or `useMemo`) and **merge static
  linework into one `<Ink d={a + b + c}>`** instead of hundreds of elements.
- Far crowds: let `Crowd` pick `lod` 2 (fill-only blobs). Hundreds of lod-0 people get slow.
- `Plane` projections are cached per (homography, path): static planes are free after the first frame. Animating a
  plane's quad every frame re-projects every path every frame: move planes with a camera / `XG` instead.
- Return `null` early for things not yet visible (`at` does it for you) and for things far off-frame.
- Heavy per-frame math belongs in pure functions of `t`; never keep state between frames.

## 13. Legacy (v1 card layout, still exported)

`Page`, `Card`, `Art`, `Panel`, `Timeline`, `Stage`, `Captions` (card captions, `highlightBox`), card `Camera`,
`PanelClip`, card transitions (flip / swipe / sheet / crossfade). Not used by Main; `crossfade`, the card `zoom` and
card `opacity` animate opacity, are `@deprecated` and must not be used in the film.

## 14. Which to use (core vs cine)

| need | use | not |
|---|---|---|
| scene root, sky, time of day | core `<World sky={[{t, tod, wipe}]}>` (one sky, relights every Fill; accepts a cine `TOD.x` as `sky`) | a second sky: a cine `<Sky>` inside a World that already has one |
| relight cine pieces | omit `tod` (they read the World's `<Tod>`); wrap each piece / row in `<TodAnchor at={[cx, cy]}>` at its centre so it flips when the sky edge reaches it | a fixed `tod` that ignores the World's wipe; `useTod()` in the scene body (returns 'day') |
| a story push (holds stay locked or float: `docs/look/COZY_AND_SCALE.md` 3b.5) | World `push` (flat scenes) / `<ShotCam push>` (layers) | hand-rolled zoom tweens; a push in every shot (v1) |
| multiplane camera moves | `<ShotCam keys>` = cine `CineCamera` + transition camera (`stage`) | CineCamera without `stage` inside `<World stage="context">` (drops the transition move) |
| camera eases | `MOTION.camera.{ease, slow, reveal, settle, push}` (cine `CAM.*` carry the same values) | ad-hoc beziers, inOutQuart reveals (4 x peak speed: strobes) |
| placing people / props in depth | `eyeLevel()` camera (2b) + `Crowd eye` | hand-tuned `s` per row (drifts to a high, diorama camera) |
| string lights | core `Festoon` (`at` build, `lightAt` or the cine-style `on={{at, dur}}` switch-on; Ink/Fill: projects on Planes, relights, un-builds) | cine `StringLights` (`at`, `on={at, dur}`, sway, tod palette: raw SVG) for cine vistas |
| crowds | core `Crowd` for anything ≥ ~20 px tall (back-view Person, depth ink, jitter, rim); cine `TinyCrowd` for thousands of specks | Crowd for specks (slow) |
| perspective | core `Plane` + `wallQuad` (projects whole kit components) | cine `quadMap` / `persp1` (point math for cine geometry) |
| far city / skyline | cine `Skyline` / `EndlessCity` as they are (state-aware: own un-build + paper Look; KitDemo `FarCity`) | wrapping them in an exit / Look group (double un-build); stepped-block placeholders |
| hills | a core `<Fill>` with `smooth()` bumps under `<Tod role="far">` (relights, un-builds) | cine `Hills` inside a relit World (raw SVG, takes `tod`) |
