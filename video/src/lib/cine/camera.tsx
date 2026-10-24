// cine/camera.tsx — a weighty multiplane camera for full-bleed shots (canvas coordinates, 1080 x 1920).
//
//   <CineCamera keys={[{t: 0, push: 0}, {t: 6, push: 0.12, y: 930}]} handheld={2}>
//     <Layer depth={1}>    <Sky .../> <BigSun .../> </Layer>    // infinitely far: only the lens zoom moves it
//     <Layer depth={0.8}>  ...far city row...  </Layer>
//     <Layer depth={0}>    ...the reference plane (moves 1:1 with the camera)... </Layer>
//     <Layer depth={-0.6}> ...foreground framing (moves faster, grows faster on a push)... </Layer>
//     <Captions/>  // outside any Layer = screen space (HUD)
//   </CineCamera>
//
// Model. Every layer has a parallax factor f = 1 - depth (1/distance, normalised so the reference plane has f = 1).
// The camera has a lateral offset o (truck / crane, px at the reference plane), a dolly `push` (fraction of the
// distance to the reference plane travelled forward), a lens `zoom` and a roll `rot` (deg). A point p authored
// in a layer lands on screen at
//     screen = C + R(rot) * s_f * (p - C - o * f),      s_f = zoom / (1 - push * f)
// so far layers slide and grow less (real dolly parallax), the sky (depth 1) only follows the lens zoom, and a
// foreground layer (depth < 0) whips past. Keys ease between each other (default inOutCubic); zoom and the dolly
// scale interpolate in log space so pushes/pull-backs feel constant-speed. `anchor` pins a world point to a screen
// position for the whole move (push toward the mascot; pull back from one window).
//
// Keys:  {t, x?, y?, zoom?, push?, rot?, ease?, anchor?, anchorDepth?, anchorTo?}
//   x, y      world point at the screen centre on the reference plane (default 540, 960 = rest)
//   anchor    [x, y] world point (in the layer of depth anchorDepth, default 0) kept at screen anchorTo
//             (default: where it is at rest). Overrides x / y for that key.
// Missing values inherit from the previous key. Times are scene seconds (useTime) unless you pass `t`.

import React, {createContext, useContext} from 'react';
import {canvas} from '../theme';
import {Ease, ease as E, clamp, lerp, useTime} from '../time';
import {mat, Mat, XG} from '../xf';
import {rand, Seed} from '../rng';
import type {Pt} from '../sketch';
import {drift} from './util';
import {STAGE_REST, useStageCam} from '../stage';

export const SCREEN = {w: canvas.width, h: canvas.height, cx: canvas.width / 2, cy: canvas.height / 2} as const;

/** Camera presets (seconds / eases) for weighty moves. */
export const CAM = {
  /** default move ease: long, symmetric, heavy. */
  ease: E.inOutCubic,
  /** gentler start/stop for very long moves (4-6 s). */
  slow: E.inOutSine,
  /** a crane / tilt reveal: slow lift-off, long glide, soft landing. */
  reveal: E.inOutQuart,
  /** a move that starts already in motion (continuing a previous shot) and lands softly. */
  settle: E.outCubic,
  /** max push * f (keeps a layer from passing through the lens). */
  maxPushF: 0.94,
} as const;

export type CamKey = {
  t: number;
  x?: number;
  y?: number;
  zoom?: number;
  push?: number;
  rot?: number;
  ease?: Ease;
  anchor?: Pt;
  anchorDepth?: number;
  anchorTo?: Pt;
};

export type CamState = {ox: number; oy: number; zoom: number; push: number; rot: number};
export const CAM_REST: CamState = {ox: 0, oy: 0, zoom: 1, push: 0, rot: 0};

// ---------------------------------------------------------------- math

const pushDen = (push: number, f: number) => Math.max(1 - CAM.maxPushF, 1 - push * f);
/** Screen scale of a layer at `depth`. */
export const layerScale = (c: CamState, depth: number) => c.zoom / pushDen(c.push, 1 - depth);

/** Matrix (world-in-layer -> screen) for a layer at `depth`. */
export function layerMat(c: CamState, depth: number): Mat {
  const f = 1 - depth;
  const s = layerScale(c, depth);
  return mat.compose(mat.translate(SCREEN.cx, SCREEN.cy), c.rot ? mat.rotate(c.rot) : mat.I, mat.scale(s), mat.translate(-SCREEN.cx - c.ox * f, -SCREEN.cy - c.oy * f));
}

/** World point (in a layer at depth) -> screen. */
export function project(c: CamState, depth: number, p: Pt): Pt {
  const m = layerMat(c, depth);
  return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
}

/** Screen point -> world point in a layer at depth. */
export function unproject(c: CamState, depth: number, p: Pt): Pt {
  const m = mat.inv(layerMat(c, depth));
  return [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];
}

/** Lateral offset that keeps world point `a` (layer at depth) at screen point `to`. */
function anchorOffset(a: Pt, to: Pt, depth: number, zoom: number, push: number): [number, number] {
  const f = 1 - depth;
  if (Math.abs(f) < 1e-4) return [0, 0];
  const s = zoom / pushDen(push, f);
  return [(a[0] - SCREEN.cx - (to[0] - SCREEN.cx) / s) / f, (a[1] - SCREEN.cy - (to[1] - SCREEN.cy) / s) / f];
}

type Resolved = CamState & {t: number; ease: Ease; anchor?: Pt; anchorDepth: number; anchorTo?: Pt};

function resolve(keys: CamKey[]): Resolved[] {
  const out: Resolved[] = [];
  let prev: Resolved = {...CAM_REST, t: 0, ease: CAM.ease, anchorDepth: 0};
  for (const k of keys) {
    const zoom = k.zoom ?? prev.zoom;
    const push = k.push ?? prev.push;
    const rot = k.rot ?? prev.rot;
    let ox: number;
    let oy: number;
    const anchorDepth = k.anchorDepth ?? 0;
    let anchorTo: Pt | undefined;
    if (k.anchor) {
      anchorTo = k.anchorTo ?? [k.anchor[0], k.anchor[1]];
      [ox, oy] = anchorOffset(k.anchor, anchorTo, anchorDepth, zoom, push);
    } else {
      ox = k.x !== undefined ? k.x - SCREEN.cx : prev.ox;
      oy = k.y !== undefined ? k.y - SCREEN.cy : prev.oy;
    }
    prev = {t: k.t, zoom, push, rot, ox, oy, ease: k.ease ?? CAM.ease, anchor: k.anchor, anchorDepth, anchorTo};
    out.push(prev);
  }
  return out;
}

const dollyLog = (push: number) => Math.log(1 / Math.max(1e-3, 1 - push));
const fromDollyLog = (l: number) => 1 - 1 / Math.exp(l);
const sameAnchor = (a: Resolved, b: Resolved) => !!a.anchor && !!b.anchor && a.anchor[0] === b.anchor[0] && a.anchor[1] === b.anchor[1] && a.anchorDepth === b.anchorDepth;

/** Camera state at time t (no handheld). */
export function camAt(keys: CamKey[], t: number): CamState {
  if (!keys.length) return CAM_REST;
  const R = resolve(keys);
  if (t <= R[0].t) return R[0];
  for (let i = 1; i < R.length; i++) {
    const a = R[i - 1];
    const b = R[i];
    if (t > b.t) continue;
    const p = b.ease(clamp((t - a.t) / Math.max(1e-6, b.t - a.t)));
    const zoom = Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), p));
    const push = fromDollyLog(lerp(dollyLog(a.push), dollyLog(b.push), p));
    const rot = lerp(a.rot, b.rot, p);
    if (sameAnchor(a, b)) {
      const to: Pt = [lerp(a.anchorTo![0], b.anchorTo![0], p), lerp(a.anchorTo![1], b.anchorTo![1], p)];
      const [ox, oy] = anchorOffset(b.anchor!, to, b.anchorDepth, zoom, push);
      return {ox, oy, zoom, push, rot};
    }
    return {ox: lerp(a.ox, b.ox, p), oy: lerp(a.oy, b.oy, p), zoom, push, rot};
  }
  return R[R.length - 1];
}

/** Subtle deterministic handheld drift: amp px at the reference plane (+ amp * 0.035 deg roll). */
export function handheldAt(t: number, amp: number, seed: Seed = 'hh'): CamState {
  if (!amp) return CAM_REST;
  const p1 = rand(seed, 'a') * 6.28;
  const p2 = rand(seed, 'b') * 6.28;
  const p3 = rand(seed, 'c') * 6.28;
  return {ox: amp * drift(t, 0.11, p1), oy: amp * 0.8 * drift(t, 0.09, p2), zoom: 1, push: 0, rot: amp * 0.035 * drift(t, 0.07, p3)};
}

// ---------------------------------------------------------------- React

const CamCtx = createContext<CamState>(CAM_REST);

/** Current camera state (rest outside a CineCamera). */
export const useCam = () => useContext(CamCtx);

export type CineCameraProps = {
  keys?: CamKey[];
  /** Handheld drift amplitude in px (0 = locked; 1.5-4 reads as a held camera). */
  handheld?: number;
  seed?: Seed;
  /** Override time (seconds). Default scene time. */
  t?: number;
  /** Extra state added on top (e.g. a shake you compute yourself). */
  add?: Partial<CamState>;
  /** Fold in the core TRANSITION camera (useStageCam) with full multiplane parallax. Use it inside
   *  <World stage="context"> (a flat World already applies the stage camera to everything: leave this false). */
  stage?: boolean;
  children?: React.ReactNode;
};

export const CineCamera: React.FC<CineCameraProps> = ({keys = [], handheld = 0, seed = 'cam', t: tIn, add, stage = false, children}) => {
  const tScene = useTime();
  const sc = useStageCam();
  const t = tIn ?? tScene;
  const base = camAt(keys, t);
  const h = handheldAt(t, handheld, seed);
  const st = stage ? sc : STAGE_REST;
  const cam: CamState = {
    ox: base.ox + h.ox + (add?.ox ?? 0) + st.ox,
    oy: base.oy + h.oy + (add?.oy ?? 0) + st.oy,
    zoom: base.zoom * (add?.zoom ?? 1) * st.zoom,
    push: base.push + (add?.push ?? 0),
    rot: base.rot + h.rot + (add?.rot ?? 0) + st.rot,
  };
  return <CamCtx.Provider value={cam}>{children}</CamCtx.Provider>;
};

/** A multiplane layer: children are authored in world coordinates (= screen at rest) and parallax by depth.
 *  depth 1 = infinitely far (sky), 0 = reference plane, < 0 = in front of it (foreground framing). */
export const Layer: React.FC<{depth?: number; children?: React.ReactNode}> = ({depth = 0, children}) => {
  const c = useCam();
  return <XG m={layerMat(c, depth)}>{children}</XG>;
};

/** Screen-constant stroke width inside a layer: pass the width you want ON SCREEN. */
export const useScreenWidth = (depth: number) => {
  const c = useCam();
  const s = layerScale(c, depth);
  return (px: number) => px / s;
};
