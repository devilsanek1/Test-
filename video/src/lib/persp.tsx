// persp.tsx — one-point perspective for the full-bleed world: draw a facade (or a ground grid, a poster, a whole
// kit Building) FLAT in its own rectangle and map it onto a receding quadrilateral. Lines stay hand-drawn (the
// sketch paths are projected point by point), stroke widths stay in screen px, fills keep their misregistration.
//
//   const q = wallQuad({vp: [540, 880], x: 120, top: 380, bottom: 1240, depth: 0.55});   // left wall receding to the VP
//   <Plane quad={q} w={1400} h={860}>                       // children in plane-local px (0..1400 x 0..860)
//     <Building x={0} y={860} w={420} floors={4} floorH={200} at={0.4} seed="L1" />
//     <Window x={600} y={300} w={120} h={180} at={1} />
//   </Plane>
//   const g = groundQuad({vp: [540, 880], y: 1920, x0: -300, x1: 1380, depth: 0.9});    // a floor plane
//   rayPoint([540, 880], [100, 1500], 0.6)   // a point 60% of the way from (100,1500) to the VP
//
// Only <Ink>/<Fill> (and kit components built from them) are projected. Raw SVG elements (<circle>, <text>) inside a
// Plane are NOT: keep those outside, or draw them with Fill/Ink. Nested Place/Pop/Move inside a Plane work.

import React from 'react';
import {parsePath, reduceInstructions} from '@remotion/paths';
import {composeHA, homKey, Homography, ProjProvider, useProj} from './xf';
import type {Pt} from './sketch';

export type Quad = [Pt, Pt, Pt, Pt]; // TL, TR, BR, BL

// ---------------------------------------------------------------- homography math

/** Homography mapping the 4 `src` points onto the 4 `dst` points. */
export function homography(src: Quad, dst: Quad): Homography {
  // 8x8 linear system A h = b with h33 = 1
  const A: number[][] = [];
  const bv: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [x, y] = src[i];
    const [u, v] = dst[i];
    A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
    bv.push(u);
    A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
    bv.push(v);
  }
  const n = 8;
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[p][c])) p = r;
    [A[c], A[p]] = [A[p], A[c]];
    [bv[c], bv[p]] = [bv[p], bv[c]];
    const d = A[c][c] || 1e-12;
    for (let r = 0; r < n; r++) {
      if (r === c) continue;
      const f = A[r][c] / d;
      if (!f) continue;
      for (let k = c; k < n; k++) A[r][k] -= f * A[c][k];
      bv[r] -= f * bv[c];
    }
  }
  const h = bv.map((v, i) => v / (A[i][i] || 1e-12));
  return [h[0], h[1], h[2], h[3], h[4], h[5], h[6], h[7], 1];
}

/** Map local (w x h) rectangle onto `quad`. */
export const rectToQuad = (w: number, h: number, quad: Quad): Homography =>
  homography(
    [
      [0, 0],
      [w, 0],
      [w, h],
      [0, h],
    ],
    quad,
  );

export function applyH(H: Homography, x: number, y: number): Pt {
  const w = H[6] * x + H[7] * y + H[8] || 1e-9;
  return [(H[0] * x + H[1] * y + H[2]) / w, (H[3] * x + H[4] * y + H[5]) / w];
}

const r1 = (n: number) => Math.round(n * 10) / 10;
const projCache = new Map<string, string>();

/** Rewrite path data through a homography (lines exact, curves via their control points). Cached. */
export function projectPath(d: string, H: Homography, key = homKey(H)): string {
  const ck = key + '|' + d;
  let out = projCache.get(ck);
  if (out !== undefined) return out;
  let ins;
  try {
    ins = reduceInstructions(parsePath(d));
  } catch {
    return d;
  }
  const P = (x: number, y: number) => {
    const [u, v] = applyH(H, x, y);
    return `${r1(u)} ${r1(v)}`;
  };
  let s = '';
  for (const i of ins) {
    if (i.type === 'M') s += `M${P(i.x, i.y)}`;
    else if (i.type === 'L') s += `L${P(i.x, i.y)}`;
    else if (i.type === 'C') s += `C${P(i.cp1x, i.cp1y)} ${P(i.cp2x, i.cp2y)} ${P(i.x, i.y)}`;
    else if (i.type === 'Z') s += 'Z';
  }
  if (projCache.size > 60000) projCache.clear();
  projCache.set(ck, s);
  return s;
}

/** Hook for primitives: project `d` if inside a <Plane>, else return it unchanged. */
export function useProjected(d: string): string {
  const proj = useProj();
  return proj && d ? projectPath(d, proj.H, proj.key) : d;
}

/** Project a point through the active plane (or return it). */
export function useProjectPoint(): (x: number, y: number) => Pt {
  const proj = useProj();
  return proj ? (x, y) => applyH(proj.H, x, y) : (x, y) => [x, y];
}

// ---------------------------------------------------------------- Plane

/** Children are drawn in plane-local px (0..w x 0..h) and mapped onto `quad` (TL, TR, BR, BL in parent coords). */
export const Plane: React.FC<{quad: Quad; w: number; h: number; children?: React.ReactNode}> = ({quad, w, h, children}) => {
  const parent = useProj();
  let H = rectToQuad(w, h, quad);
  if (parent) H = composeH(parent.H, H);
  return <ProjProvider value={{H, key: homKey(H)}}>{children}</ProjProvider>;
};

function composeH(A: Homography, B: Homography): Homography {
  const r: number[] = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) r.push(A[i * 3] * B[j] + A[i * 3 + 1] * B[3 + j] + A[i * 3 + 2] * B[6 + j]);
  return r as Homography;
}
export {composeHA};

// ---------------------------------------------------------------- one-point perspective helpers

/** Point `k` of the way from `p` toward the vanishing point (k = 0 at p, 1 at the VP). */
export const rayPoint = (vp: Pt, p: Pt, k: number): Pt => [p[0] + (vp[0] - p[0]) * k, p[1] + (vp[1] - p[1]) * k];

/** A vertical wall parallel to the view direction (a street facade): its near edge is the vertical screen segment
 *  x, [top, bottom]; its far edge is `depth` (0..1) of the way to the VP. Returns TL, TR, BR, BL with the plane's
 *  local x running from near (0) to far (w) for a LEFT wall (x < vp.x); for a right wall local x runs far -> near,
 *  so the facade still reads left-to-right. */
export function wallQuad(o: {vp: Pt; x: number; top: number; bottom: number; depth: number}): Quad {
  const nT: Pt = [o.x, o.top];
  const nB: Pt = [o.x, o.bottom];
  const fT = rayPoint(o.vp, nT, o.depth);
  const fB = rayPoint(o.vp, nB, o.depth);
  return o.x < o.vp[0] ? [nT, fT, fB, nB] : [fT, nT, nB, fB];
}

/** A horizontal ground (or ceiling) plane: near edge = screen segment [x0, x1] at height y; far edge `depth` of the
 *  way to the VP. Local x runs left -> right, local y runs FAR (0) -> NEAR (h). */
export function groundQuad(o: {vp: Pt; y: number; x0: number; x1: number; depth: number}): Quad {
  const nL: Pt = [o.x0, o.y];
  const nR: Pt = [o.x1, o.y];
  return [rayPoint(o.vp, nL, o.depth), rayPoint(o.vp, nR, o.depth), nR, nL];
}

/** A frontal plane (facing the camera) at relative depth: the rectangle [x, y, w, h] defined at depth 0 shrunk toward
 *  the VP by `depth` (0..1). Use for buildings at the end of the street, the far skyline, a gate. */
export function frontQuad(o: {vp: Pt; x: number; y: number; w: number; h: number; depth: number}): Quad {
  const c = (p: Pt) => rayPoint(o.vp, p, o.depth);
  return [c([o.x, o.y]), c([o.x + o.w, o.y]), c([o.x + o.w, o.y + o.h]), c([o.x, o.y + o.h])];
}

/** Screen scale of something at relative depth `depth` (0 = at the near plane, 1 = at the VP). */
export const depthScale = (depth: number) => Math.max(0, 1 - depth);

// ---------------------------------------------------------------- the EYE-LEVEL camera (people in perspective)

/** A standing Person at s = 1 (back view, default proportions): hip line -> top of the head INCLUDING the average
 *  hair volume (bare skull 137, + buns / curls / headphone bands; calibrated on KitDemo stills so the measured
 *  camera / person ratio averages the nominal 1.1), and the default leg length (Person `legH` default = 0.62 x
 *  torso). Total = PERSON_BODY_H + legH. */
export const PERSON_BODY_H = 145;
export const PERSON_LEG_H = 58.5;

export type EyeLevel = {
  horizon: number;
  vpx: number;
  /** camera height / person height */
  ratio: number;
  /** On-screen height (px) of a standing person whose FEET are at screen y. */
  height: (feetY: number) => number;
  /** Feet y of a standing person `heightPx` tall. */
  feet: (heightPx: number) => number;
  /** Person `s` for feet at y (legH = the Person's local leg length; default legs). */
  s: (feetY: number, legH?: number) => number;
  /** Person `y` (its HIP line) for feet at y. */
  hip: (feetY: number, legH?: number) => number;
  /** Screen x of a ground point X person-heights right (+) / left (-) of the camera axis, at the depth of feetY. */
  x: (X: number, feetY: number) => number;
  /** Screen y of the top of the head of a standing person with feet at y (the head band under the horizon). */
  headTop: (feetY: number) => number;
};

/** EYE-LEVEL CAMERA: reference 2's baseline street, where the VIEWER FEELS SMALL. The lens sits at `ratio` x a
 *  standing person's height (1.1: ref 2 f_1 measured 1.10, f_42 1.14), so every standing head lands in a thin band
 *  just under the horizon (9 % of the feet's distance below it), near people tower over the lower frame and the
 *  crowd converges ON the horizon line. A camera at 2-4x head height looks DOWN on a diorama (the viewer feels big).
 *    const cam = eyeLevel({horizon: world.horizon, vpx: 560});
 *    <Person x={cam.x(-0.5, 1500)} y={cam.hip(1500, 150)} s={cam.s(1500, 150)} legs legH={150} />
 *    <Crowd eye={{horizon: world.horizon}} far={{y: 790, ...}} near={{y: 1250, ...}} />   // rows from the same camera
 *  Check a still with `measureEye(feetY, headTopY, horizon)` (target 1.0-1.2). */
export function eyeLevel(o: {horizon?: number; vpx?: number; ratio?: number} = {}): EyeLevel {
  const horizon = o.horizon ?? 768;
  const vpx = o.vpx ?? 540;
  const ratio = o.ratio ?? 1.1;
  const height = (fy: number) => Math.max(0, fy - horizon) / ratio;
  const s = (fy: number, legH = PERSON_LEG_H) => height(fy) / (PERSON_BODY_H + legH);
  return {
    horizon,
    vpx,
    ratio,
    height,
    feet: (h: number) => horizon + h * ratio,
    s,
    hip: (fy: number, legH = PERSON_LEG_H) => fy - legH * s(fy, legH),
    x: (X: number, fy: number) => vpx + X * height(fy),
    headTop: (fy: number) => fy - height(fy),
  };
}

/** Camera height / person height measured on a frame: (feet - horizon) / (feet - head top). */
export const measureEye = (feetY: number, headTopY: number, horizon: number) => (feetY - horizon) / Math.max(1, feetY - headTopY);

// ---------------------------------------------------------------- the designed view's FAR STAGE (CRAFT §f.5)

/** A thing measured for lib/depth `sizeProblems` (base y, its height in px and in metres), tagged with the camera it
 *  stands under: none = the shot's one camera, 'far' = a declared far stage (the designed view). */
export type StagedThing = {name: string; y: number; px: number; m: number; level?: number; stage?: 'far'};

export type FarStage = {
  /** The tag of everything drawn on this stage (`splitStages`: sizeProblems runs once per camera). */
  stage: 'far';
  /** The stage's OWN horizon (screen y): its ground meets the sky here, the junction hidden behind a nearer band (water,
   *  trees, a wall, roofs) that carries no receding line. */
  horizon: number;
  vpx: number;
  /** The stage camera's focal length (px) and height over the stage's ground (m): its scale is f / z px per metre at
   *  distance z (set f above the shot's lens to draw the far city bigger than one camera allows: the posters 1.4-3.6x). */
  f: number;
  height: number;
  /** The float share of the stage: 0. Its things are at infinity: the float, a crane or a push move the near layers by
   *  their share and the stage not at all, so both horizons hold (DIRECTION rule 8; P1 §3.4). */
  parallax: 0;
  /** A stage point (x metres right of the axis, z metres away, `level` metres up) -> screen px. The camera looks level
   *  and straight (no yaw): every face is frontal, nothing recedes in the far zone. */
  pt: (x: number, z: number, level?: number) => Pt;
  /** Screen y of the stage's ground at distance z: where a thing at z stands (a hair under the horizon when far). */
  baseY: (z: number) => number;
  /** px per metre of anything at distance z. */
  scale: (z: number) => number;
  /** A frontal elevation standing on the stage: screen x `x0` .. `x1` (px: a designed view is placed on screen), at
   *  distance z, from `level` to `level + h` metres. TL, TR, BR, BL. */
  front: (o: {x0: number; x1: number; z: number; h: number; level?: number}) => Quad;
  /** A skyline profile standing on the stage at distance z: [screen x, height in metres] pairs, left to right, closed
   *  down to the stage's ground (`level` metres under it to bury the base deeper): one SVG path. */
  profile: (pts: readonly (readonly [number, number])[], z: number, o?: {level?: number}) => string;
  /** The thing for sizeProblems (tagged 'far'): base at distance z, `h` metres tall. */
  thing: (name: string, z: number, h: number, level?: number) => StagedThing;
};

const fmt = (n: number) => (Math.round(n * 10) / 10).toString();

/** THE FAR STAGE of a designed view (owner, 2026-10-29: "Go with your suggestions", `STUDY.md` §9 decision 4 (a); CRAFT
 *  §f.5; `perspective.md` L2): ONE declared second horizon for the far city, its water and its scale anchor, in the home
 *  place's establishing view and the scale landing only. A level pinhole of its own (`horizon`, `f`, `height`), frontal
 *  (no receding line), its things placed in screen x and sized in metres; the near world keeps the shot's one camera.
 *  In 9:16 the posters' lifted stages map to y ~1090-1215 against a near eye at y 1380-1480 (`img/perspective_916.jpg`);
 *  a seated bank like v2's S1 (lens horizon 965) lifts its stage behind its far roofs. Pure; nothing else changes.
 *    const st = farStage({horizon: 806, f: 2800, height: 30});
 *    <Fill d={st.profile([[-40, 90], [60, 90], [60, 140], [140, 140]], 3000)} ... />   // a far skyline
 *    sizeProblems(splitStages(things).far, {horizon: st.horizon, height: st.height})     // measured on its own stage */
export function farStage(o: {horizon: number; vpx?: number; f?: number; height?: number}): FarStage {
  const horizon = o.horizon;
  const vpx = o.vpx ?? 540;
  const f = o.f ?? 1400;
  const height = o.height ?? 1.6;
  const zz = (z: number) => Math.max(1e-3, z);
  const pt = (x: number, z: number, level = 0): Pt => [vpx + (f * x) / zz(z), horizon + (f * (height - level)) / zz(z)];
  const scale = (z: number) => f / zz(z);
  const baseY = (z: number) => horizon + (f * height) / zz(z);
  const front: FarStage['front'] = ({x0, x1, z, h, level = 0}) => {
    const b = baseY(z) - level * scale(z);
    const t = b - h * scale(z);
    return [[x0, t], [x1, t], [x1, b], [x0, b]];
  };
  const profile: FarStage['profile'] = (pts, z, po = {}) => {
    if (!pts.length) return '';
    const s = scale(z);
    const b = baseY(z) + (po.level ?? 0) * s;
    let d = `M${fmt(pts[0][0])} ${fmt(b)}`;
    for (const [x, h] of pts) d += `L${fmt(x)} ${fmt(baseY(z) - h * s)}`;
    return d + `L${fmt(pts[pts.length - 1][0])} ${fmt(b)}Z`;
  };
  const thing = (name: string, z: number, h: number, level = 0): StagedThing => ({name, y: baseY(z), px: h * scale(z), m: h, level, stage: 'far'});
  return {stage: 'far', horizon, vpx, f, height, parallax: 0, pt, baseY, scale, front, profile, thing};
}

/** Splits measured things by the camera they stand under, so lib/depth `sizeProblems` runs once per camera: the near
 *  world against the shot's lens, the far stage against its own horizon (it never WARNs "two cameras" across them). */
export function splitStages<T extends {stage?: 'far'}>(things: readonly T[]): {one: T[]; far: T[]} {
  return {one: things.filter((t) => t.stage !== 'far'), far: things.filter((t) => t.stage === 'far')};
}
