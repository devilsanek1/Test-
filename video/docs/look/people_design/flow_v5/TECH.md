# FLOW people (v5): the code map

**It serves (read first):** a person carried by the wind, light and alive at phone size: one flowing garment and
long hair ribbons swept one way, a near-blank face, soft flat paint, a lit edge (`../../refs_people_flow/`). Numbers
here describe v4 or the toolchain, never a target. Paths: under `video/src/look/people_dirs/` unless full.

## 1. How a v4 figure is built and drawn
1. **Pose to skeleton** (`people_v4/skel5.ts`): a `Pose5` (pelvis and chest frames, IK targets, head yaw) becomes 3D
   joints (H = 1000; x her left, y up, z front), limbs by two-bone IK.
2. **Camera** (`graphic/rig.ts`): `cam(yaw)`, `proj()`; one key light, upper left.
3. **Clothes** (`people_v4/body5.ts`): lofted ring stacks (`loftX`) and limb tubes (`tubeX`), a computed terminator
   each, folds as slivers; authored hands per view (`hand5.ts`).
4. **Head** (`people_v4/head.ts`): authored pen faces in three views, placed on `headFrame()`.
5. **Hair** (`hair_v4/hair.ts`): authored pieces per view, the hanging ones skinned (`rig.ts`) to spring chains
   (`sim.ts`).
6. **Assembly and paint** (`hair_v4/asm_bodies.ts person6()`, `asm_render.ts`): one part type `P5` (casts, rim
   bands, contact shadow) written as one SVG string in z order.

Measured (her, 3/4, 640 px): 28 parts, 45 clipped regions, 10 casts, 10 rim bands, ~170 SVG paths, ~2,200 cubic
segments, 285 KB; still 28 parts at 200 px; ~25-30 ms a build.

## 2. REUSE
- **Pose and IK** (`people_v4/skel5.ts`): `ik2(a: V3, tgt: V3, l1, l2, pole: V3): {m, e}`; `stand5(sex,
  {headYaw?, arms?, coat?})`, `walk5(sex, ph)`, `ledge5(sex, top?, edge?)`, `ground5(sex)`, `lean5(sex, rail?, rz?)`
  return `Pose5`; a walk's `MotionState`: `asm_bodies.ts walkMotion6(who, t)`.
- **Frames**: `cam(yaw): Cam`, `proj(p: V3, c: Cam): V2`; `graphic_faces/head.ts headFrame(sk, c)`;
  `hair_v4/asm_people.ts hfOf({c, s, rot, yaw})` (any anchor frame).
- **Springs** (`hair_v4/sim.ts`): `simulate(specKey, spec: SimSpec, m: MotionState): V2[][]`; `SimSpec = {rest(hf):
  V2[][], morph(hf), mult: {k, air, damp}[], spring}` (`Spring`: `cut.ts`); `MotionState = {t, key, head(t), wind?(t)}`
  (air velocity, figure units/s). Any chains work (scratch test: five ribbons, 2 s of wind, ~65 ms).
- **Stateless flutter** (`video/src/lib/figure/wind.ts`): `endChain(root, length, rest, {t, strength?}, side?, n?):
  Pt[]`, pure in t.
- **Skinning** (`hair_v4/rig.ts`): `bind(shape, chains)`, `skin(shape, binding, xfs)`, `chainXfs(rest, pose)`,
  `unfold(rest, posed)`; template `hair.ts poseOn`.
- **Paths**: `people_v4/pen.ts` `n(x, y, a, i?, o?, ao?)` (`ao`: a corner), `through(pts, closed): Seg[]`,
  `taper(centre: Seg[], w: (t) => number): Seg[]`, `toD(segs)`; `hair_v4/bez.ts` `lerpShape` (view morph),
  `ribbon(c, w, {at?, root?})`; `graphic/geo.ts offset(line, w)`.
- **Paint**: `graphic/color.ts` `tone(hex): {lit, shade, deep, sheen}`, `mixLab`, `shiftL`; `Paint` gradients
  (`lin`, `rad`); copy `body5.ts litPaint` (unexported).
- **Face and cap**: `head(sex, view, {skin, hair, px})` + `placeHead(h, {c, s, rot})`: a small skull `px` drops eyes,
  ear and marks; a cut's cap piece: `hair.ts resolveView(fitCut(CUTS4[id], sex), view, morph)`.
- **Render** (`hair_v4/asm_render.ts`): `svgOf(parts: P5[], uid)` (blur, casts, a `rimBand` masked by the
  silhouette), `placeSvg(parts, uid, x, y, h)` (one uid per figure), `fromV4(part, role)` (repairs the face strokes'
  NaN tips).

## 3. REPLACE (what fights the references)
- **Jointed limbs and ring lofts, two tones each**: eleven clothing pieces, each limb a chain of parts (sleeve, hand;
  trouser leg, shin, shoe) following anatomy; theirs: one garment following the wind over two thin legs.
- **Authored hands**: theirs vanish into sleeve and hem.
- **Tailored panels** (facings, collar V, waistband, ribs, folds): detail they never draw; the coat's hem kicks with
  the knees only, never the air.
- **Strand-built cuts** (`cut_*.ts`, `asm_fit.ts`): masses placed node by node per view; the back piece is held by
  bend limits and `unfold`, so it cannot break into long streaming ribbons.
- **Full faces**: theirs are near-blank.
- **Many paths** (measured above), as many at film size; the rim band, sized in figure units, falls under 1 px on a
  200 px figure.

## 4. A FLOW figure
`flow5(who, {pose, yaw, t, wind, px}): P5[]`, drawn by `placeSvg`; code in `people_dirs/flow_v5/`, compositions
`F5*` (`CUTS4.FLOW` is taken: a hair cut).
1. Skeleton: `skelF(build, pose)`, a copy of `skel5` taking a FLOW `Build` (`skel5` hard-wires `buildV4`); project
   once; the rest is 2D.
2. ONE wind `W(t)` feeds hair, hem and any sash.
3. Garment: one closed path, shoulders to a flaring hem (arms inside); the hem a polyline swept downwind, more the
   farther from the body, a few vertices drawn out into pointed tips (corner nodes), fluttered by `endChain` or by
   hem chains in `sim.ts` (a walk's follow-through). Later: an authored silhouette per view skinned to hem chains.
4. Legs: `taper(through([hip, knee, ankle], false), w)` under the garment; boots a rounded wedge each.
5. Arms inside (out: one tapered stroke, no hand); the head: contour face plus cap.
6. Hair: 3-6 `taper`ed ribbons, pointed at the tip, on chains rooted at the cap's back edge. Author their REST
   already streaming: `sim.ts` pulls each bone back to its rest direction, so wind only tilts a hanging chain (the
   test's hung ~45 degrees); the sim adds flutter, lag, follow-through.
7. Paint: per part one soft gradient along the key, one blurred shade region; rim bands on garment, cap, ribbons only.
8. Detail: one `px` switch drops ribbons (one mass at the smallest), tips, sim joints, face marks; edge widths in
   screen px (divided by h/1000) so they survive at film size.
9. Motion: every shape a function of `pose(t)`, `t`, `W(t)` and the sim's deterministic history (cached per
   `MotionState.key`: one key per track).

## 5. Rendering a sheet
`video/src/entry-look-people-flow5.tsx`, after `entry-look-people-bodies4.tsx`:
```tsx
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {placeSvg} from './look/people_dirs/hair_v4/asm_render';
import {flow5} from './look/people_dirs/flow_v5/flow';
const W = 2400, H = 1400;
const F5Sheet: React.FC = () => {
  const svg = placeSvg(flow5({t: useCurrentFrame() / 60}), 'a', 600, 1300, 1000);
  return <AbsoluteFill style={{background: '#2B2C41'}}><svg width={W} height={H}><g dangerouslySetInnerHTML={{__html: svg}} /></svg></AbsoluteFill>;
};
registerRoot(() => <Composition id="F5Sheet" component={F5Sheet} durationInFrames={120} fps={60} width={W} height={H} />);
```
From `video/`:
`node scripts/render-frames.mjs F5Sheet /tmp/claude-0/f5 0,0.5,1 --entry=src/entry-look-people-flow5.tsx --concurrency=1`
(seconds; one bundle); tiled: `scripts/sheet.sh F5Sheet 0 2 12 out.png --entry=... --no-capcheck`; a clip:
`node scripts/render-media.mjs F5Sheet out.mp4 --entry=...`.

**Toolchain check** (`node scripts/render-frames.mjs B6Cast <dir> 0 --entry=src/entry-look-people-bodies4.tsx
--concurrency=1`, 2400 x 1800): bundle 26.8 s (cold cache), the frame 3.6 s with page setup, 34 s wall; correct
picture, nothing failed. Fix, not applied: `scripts/strip.sh` drops `--entry` (forward unknown arguments as `sheet.sh`
does).
