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
// foreground layer (depth < 0) whips past. Zoom and the dolly scale interpolate in log space so pushes/pull-backs
// feel constant-speed. `anchor` pins a world point to a screen position for the whole move (push toward the mascot;
// pull back from one window).
// Interpolation is VELOCITY-CONTINUOUS (default interp 'spline'): every channel is a monotone cubic (PCHIP) through
// the keys, so a move that runs through several keys never stops dead and restarts at a key. A segment whose two
// ends are both at rest (a plain two-key move, or a direction change) uses its key's `ease` instead. `CAM.settle`
// (starts in motion) is honoured only on the FIRST segment: a shot that continues the previous shot's move.
//
// Keys:  {t, x?, y?, zoom?, push?, rot?, pan?, tilt?, ease?, anchor?, anchorDepth?, anchorTo?}
//   x, y      world point at the screen centre on the reference plane (default 540, 960 = rest): a TRUCK / CRANE
//             (the camera translates: near layers move more than far ones, the depth-1 sky not at all)
//   pan, tilt the camera ROTATES (px on screen; tilt > 0 looks up, pan > 0 looks right): every layer, the sky and the
//             sun included, shifts by the same amount, so the horizon stays on the sky's horizon and the vanishing
//             lines keep converging on it. Arcane's tilt-up / tilt-down reveal. Applied after anchoring.
//             A `y` crane with the horizon in frame slides the ground's horizon against the depth-1 sky: crane only
//             with the horizon off-frame (or the ground's far edge on a depth ~1 layer); otherwise use `tilt`.
//   anchor    [x, y] world point (in the layer of depth anchorDepth, default 0) kept at screen anchorTo
//             (default: where it is at rest). Overrides x / y for that key.
//   inkComp   OPT-IN ink compensation for the segment ARRIVING at this key (like `ease`): while it runs, every <Layer>
//             draws the engine's strokes at width x (layer scale now / layer scale at the segment start)^-inkComp
//             (lib/inkComp.tsx; house value 0.6: a 3x dive lands at ~1.55x line weight, not 3x). Exactly 1 at the
//             segment start (no width step); the factor HOLDS after the segment ends; flagged segments multiply (a
//             flagged dive in and a flagged pull-back out cancel). If the camera comes back, flag the return key
//             too, or the lines stay thinner than nominal at rest. Handheld / `add` are not compensated.
// Missing values inherit from the previous key. Times are scene seconds (useTime) unless you pass `t`.

import React, {createContext, useContext} from 'react';
import {canvas} from '../theme';
import {Ease, ease as E, clamp, lerp, useTime} from '../time';
import {mat, Mat, XG} from '../xf';
import {rand, Seed} from '../rng';
import type {Pt} from '../sketch';
import {drift} from './util';
import {STAGE_REST, useStageCam} from '../stage';
import {InkScale} from '../inkComp';

export const SCREEN = {w: canvas.width, h: canvas.height, cx: canvas.width / 2, cy: canvas.height / 2} as const;

/** Trapezoid velocity profile: accelerate over `acc` of the move (sine ramp), cruise, decelerate over `dec`.
 *  Peak speed = 1 / (1 - (acc + dec) / 2) x the average (1.43x for 0.25 / 0.35), against 4x for inOutQuart:
 *  flat inked art strobes when a camera whips, so long moves should cruise. */
export function trapezoid(acc = 0.25, dec = 0.35): Ease {
  const a = Math.max(1e-3, acc);
  const d = Math.max(1e-3, dec);
  const v = 1 / (1 - (a + d) / 2);
  return (u: number) => {
    const x = clamp(u);
    if (x < a) return v * (x / 2 - (a / (2 * Math.PI)) * Math.sin((Math.PI * x) / a));
    if (x > 1 - d) {
      const y = 1 - x;
      return 1 - v * (y / 2 - (d / (2 * Math.PI)) * Math.sin((Math.PI * y) / d));
    }
    return v * (a / 2 + (x - a));
  };
}

/** Camera presets (seconds / eases) for weighty moves. */
export const CAM = {
  /** default move ease: long, symmetric, heavy. */
  ease: E.inOutCubic,
  /** gentler start/stop for very long moves (4-6 s). */
  slow: E.inOutSine,
  /** a crane / tilt reveal: sine lift-off over 25%, cruise, long soft landing over 35% (peak 1.43x average). */
  reveal: trapezoid(0.25, 0.35),
  /** a move that starts already in motion (continuing a previous shot) and lands softly. First segment only. */
  settle: E.outCubic,
  /** push * f is linear up to `pushKnee`, then saturates smoothly toward `maxPushF` (nothing passes the lens). */
  pushKnee: 0.85,
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
  /** Camera pan (px on screen, + = look right: everything shifts left by the same amount). */
  pan?: number;
  /** Camera tilt (px on screen, + = look up: everything, the sky included, shifts down by the same amount). */
  tilt?: number;
  /** Opt-in ink compensation exponent for the segment ARRIVING at this key (0.6 = house value). Default off. The factor
   *  is HELD after the segment: if the camera comes back, flag the return key too (else lines stay thin at rest). */
  inkComp?: number;
};

/** Camera state. `pan` / `tilt` (screen px) are optional so older literals stay valid. */
export type CamState = {ox: number; oy: number; zoom: number; push: number; rot: number; pan?: number; tilt?: number};
export const CAM_REST: CamState = {ox: 0, oy: 0, zoom: 1, push: 0, rot: 0, pan: 0, tilt: 0};

// ---------------------------------------------------------------- math

/** push * f with a soft knee: identity up to CAM.pushKnee, then a tanh saturation toward CAM.maxPushF (C1, so a
 *  foreground layer's scale never kinks). */
const softPush = (x: number) => {
  const K = CAM.pushKnee;
  const M = CAM.maxPushF;
  return x <= K ? x : K + (M - K) * Math.tanh((x - K) / (M - K));
};
const pushDen = (push: number, f: number) => 1 - softPush(push * f);
/** Screen scale of a layer at `depth`. */
export const layerScale = (c: CamState, depth: number) => c.zoom / pushDen(c.push, 1 - depth);

/** Matrix (world-in-layer -> screen) for a layer at `depth`. */
export function layerMat(c: CamState, depth: number): Mat {
  const f = 1 - depth;
  const s = layerScale(c, depth);
  return mat.compose(mat.translate(SCREEN.cx - (c.pan ?? 0), SCREEN.cy + (c.tilt ?? 0)), c.rot ? mat.rotate(c.rot) : mat.I, mat.scale(s), mat.translate(-SCREEN.cx - c.ox * f, -SCREEN.cy - c.oy * f));
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
    const pan = k.pan ?? prev.pan ?? 0;
    const tilt = k.tilt ?? prev.tilt ?? 0;
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
    prev = {t: k.t, zoom, push, rot, pan, tilt, ox, oy, ease: k.ease ?? CAM.ease, anchor: k.anchor, anchorDepth, anchorTo};
    out.push(prev);
  }
  return out;
}

const dollyLog = (push: number) => Math.log(1 / Math.max(1e-3, 1 - push));
const fromDollyLog = (l: number) => 1 - 1 / Math.exp(l);
const sameAnchor = (a: Resolved, b: Resolved) => !!a.anchor && !!b.anchor && a.anchor[0] === b.anchor[0] && a.anchor[1] === b.anchor[1] && a.anchorDepth === b.anchorDepth;

export type CamInterp = 'spline' | 'ease';

// channels per key: 0 log zoom, 1 dolly-log, 2 rot, 3 ox, 4 oy, 5 anchorTo x, 6 anchorTo y, 7 pan, 8 tilt
const NCH = 9;
type Plan = {R: Resolved[]; v: number[][]; m: number[][]; anch: boolean[]};
const PLAN_CACHE = new WeakMap<CamKey[], Plan>();

function channels(r: Resolved): number[] {
  return [Math.log(r.zoom), dollyLog(r.push), r.rot, r.ox, r.oy, r.anchorTo?.[0] ?? NaN, r.anchorTo?.[1] ?? NaN, r.pan ?? 0, r.tilt ?? 0];
}

/** Monotone cubic (Fritsch-Carlson / PCHIP) tangents; ends at rest. NaN values break the chain (tangent 0). */
function pchip(ts: number[], ys: number[], linked: boolean[]): number[] {
  const n = ys.length;
  const m = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    if (!linked[i] || !linked[i + 1]) continue; // segment i-1..i or i..i+1 is not part of this chain
    const h0 = ts[i] - ts[i - 1];
    const h1 = ts[i + 1] - ts[i];
    if (h0 <= 0 || h1 <= 0) continue;
    const d0 = (ys[i] - ys[i - 1]) / h0;
    const d1 = (ys[i + 1] - ys[i]) / h1;
    if (!(d0 * d1 > 0)) continue; // direction change, a flat side or NaN: rest at this key
    const w1 = 2 * h1 + h0;
    const w2 = h1 + 2 * h0;
    m[i] = (w1 + w2) / (w1 / d0 + w2 / d1);
  }
  return m;
}

function plan(keys: CamKey[]): Plan {
  let p = PLAN_CACHE.get(keys);
  if (p) return p;
  const R = resolve(keys);
  const anch = R.map((r, i) => i > 0 && sameAnchor(R[i - 1], r)); // segment (i-1 -> i) is anchored
  const ts = R.map((r) => r.t);
  const vals = R.map(channels);
  const v: number[][] = [];
  const m: number[][] = [];
  for (let c = 0; c < NCH; c++) {
    const ys = vals.map((x) => x[c]);
    // a channel is continuous across a key only if both adjacent segments interpolate it
    const linked = R.map((_, i) => i > 0 && (c < 3 || c >= 7 ? true : c < 5 ? !anch[i] : anch[i]));
    v.push(ys);
    m.push(pchip(ts, ys, linked));
  }
  p = {R, v, m, anch};
  // ANCHOR SWITCH (a key between an anchored and a free segment, or two different anchors): the anchorTo channel rests
  // at the key, but the anchored OFFSET keeps moving with the zoom / dolly. Hand that velocity to the free ox / oy
  // channel as its tangent at the key, so the screen motion stays velocity-continuous (gate 1: a push that retargets
  // keeps its speed; before: 4.9 -> 2.9 px / frame in one frame).
  for (let i = 1; i < R.length - 1; i++) {
    if (anch[i] === anch[i + 1]) continue;
    const a = anch[i] ? R[i] : R[i + 1]; // the anchored side's key (anchor, depth)
    const to = R[i].anchorTo ?? (a.anchor ? ([a.anchor[0], a.anchor[1]] as Pt) : undefined);
    if (!a.anchor || !to) continue;
    const h = 1e-3;
    const st = (tt: number) => {
      // zoom / push are C1 across keys: sample them in the segment after the key (before it for the last key)
      const seg = Math.min(R.length - 1, i + 1);
      return anchorOffset(a.anchor!, to, a.anchorDepth, Math.exp(chAt(p!, 0, seg, tt)), fromDollyLog(chAt(p!, 1, seg, tt)));
    };
    const o1 = st(R[i].t + h);
    const o0 = st(R[i].t);
    m[3][i] = (o1[0] - o0[0]) / h;
    m[4][i] = (o1[1] - o0[1]) / h;
  }
  PLAN_CACHE.set(keys, p);
  return p;
}

/** Channel c of segment i (keys i-1 -> i) at time t: cubic Hermite through the plan's tangents, or the key's ease when
 *  both ends rest (or when forced). */
function chAt(P: Plan, c: number, i: number, t: number, force = false): number {
  const {R, v, m} = P;
  const a = R[i - 1];
  const b = R[i];
  const h = Math.max(1e-6, b.t - a.t);
  const u = clamp((t - a.t) / h);
  const m0 = m[c][i - 1];
  const m1 = m[c][i];
  const y0 = v[c][i - 1];
  const y1 = v[c][i];
  if (force || (m0 === 0 && m1 === 0)) return lerp(y0, y1, b.ease(u));
  const u2 = u * u;
  const u3 = u2 * u;
  return (2 * u3 - 3 * u2 + 1) * y0 + (u3 - 2 * u2 + u) * h * m0 + (-2 * u3 + 3 * u2) * y1 + (u3 - u2) * h * m1;
}

/** Camera state at time t (no handheld). interp 'spline' (default) is velocity-continuous across keys; 'ease'
 *  eases every segment on its own (the old behaviour: the camera rests at every key). */
export function camAt(keys: CamKey[], t: number, interp: CamInterp = 'spline'): CamState {
  if (!keys.length) return CAM_REST;
  const P = plan(keys);
  const {R, anch} = P;
  if (t <= R[0].t) return R[0];
  for (let i = 1; i < R.length; i++) {
    const b = R[i];
    if (t > b.t) continue;
    const forceEase = interp === 'ease' || (i === 1 && b.ease === CAM.settle);
    const ch = (c: number) => chAt(P, c, i, t, forceEase);
    const zoom = Math.exp(ch(0));
    const push = fromDollyLog(ch(1));
    const rot = ch(2);
    const pan = ch(7);
    const tilt = ch(8);
    if (anch[i]) {
      const to: Pt = [ch(5), ch(6)];
      const [ox, oy] = anchorOffset(b.anchor!, to, b.anchorDepth, zoom, push);
      return {ox, oy, zoom, push, rot, pan, tilt};
    }
    return {ox: ch(3), oy: ch(4), zoom, push, rot, pan, tilt};
  }
  return R[R.length - 1];
}

/** A started ink-compensated segment: the camera's zoom / dolly at its start and now (clamped to its end). */
export type CamInkSeg = {z0: number; p0: number; z1: number; p1: number; k: number};

/** Does any key flag its segment for ink compensation? */
export const hasInkComp = (keys: CamKey[]) => keys.some((k) => !!k.inkComp);

/** The ink-compensated segments (CamKey.inkComp) that have started by time t. */
export function camInkSegs(keys: CamKey[], t: number, interp: CamInterp = 'spline'): CamInkSeg[] {
  const out: CamInkSeg[] = [];
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i].inkComp;
    if (!k || t <= keys[i - 1].t) continue;
    const a = camAt(keys, keys[i - 1].t, interp);
    const b = camAt(keys, Math.min(t, keys[i].t), interp);
    out.push({z0: a.zoom, p0: a.push, z1: b.zoom, p1: b.push, k});
  }
  return out;
}

/** Stroke-width factor of a layer at `depth` for those segments (1 = none): per segment
 *  (layer scale now / layer scale at its start)^-k, multiplied. */
export function camInkFactor(segs: CamInkSeg[], depth: number): number {
  let f = 1;
  const pf = 1 - depth;
  for (const s of segs) f *= Math.pow(s.z1 / pushDen(s.p1, pf) / (s.z0 / pushDen(s.p0, pf)), -s.k);
  return f;
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
/** Ink compensation of the enclosing CineCamera (null = none: its Layers render exactly as before). */
const CamInkCtx = createContext<{segs: CamInkSeg[]; stage: number} | null>(null);

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
  /** 'spline' (default): velocity-continuous through the keys. 'ease': each segment eases on its own. */
  interp?: CamInterp;
  /** Fold in the core TRANSITION camera (useStageCam) with full multiplane parallax. Use it inside
   *  <World stage="context"> (a flat World already applies the stage camera to everything: leave this false).
   *  A transition flagged with `inkComp` (StageCam.ink) is folded into every Layer's ink factor too. */
  stage?: boolean;
  children?: React.ReactNode;
};

export const CineCamera: React.FC<CineCameraProps> = ({keys = [], handheld = 0, seed = 'cam', t: tIn, add, stage = false, interp = 'spline', children}) => {
  const tScene = useTime();
  const sc = useStageCam();
  const t = tIn ?? tScene;
  const base = camAt(keys, t, interp);
  const h = handheldAt(t, handheld, seed);
  const st = stage ? sc : STAGE_REST;
  const cam: CamState = {
    ox: base.ox + h.ox + (add?.ox ?? 0) + st.ox,
    oy: base.oy + h.oy + (add?.oy ?? 0) + st.oy,
    zoom: base.zoom * (add?.zoom ?? 1) * st.zoom,
    push: base.push + (add?.push ?? 0),
    rot: base.rot + h.rot + (add?.rot ?? 0) + st.rot,
    pan: (base.pan ?? 0) + (add?.pan ?? 0),
    tilt: (base.tilt ?? 0) + (add?.tilt ?? 0),
  };
  // opt-in ink compensation (CamKey.inkComp, a flagged transition's StageCam.ink): static per camera whether it is on,
  // so the Layers' tree keeps its shape
  const flagged = hasInkComp(keys);
  const ink = flagged || stage ? {segs: flagged ? camInkSegs(keys, t, interp) : [], stage: stage ? sc.ink ?? 1 : 1} : null;
  return (
    <CamCtx.Provider value={cam}>
      <CamInkCtx.Provider value={ink}>{children}</CamInkCtx.Provider>
    </CamCtx.Provider>
  );
};

/** A multiplane layer: children are authored in world coordinates (= screen at rest) and parallax by depth.
 *  depth 1 = infinitely far (sky), 0 = reference plane, < 0 = in front of it (foreground framing). */
export const Layer: React.FC<{depth?: number; children?: React.ReactNode}> = ({depth = 0, children}) => {
  const c = useCam();
  const ink = useContext(CamInkCtx);
  if (!ink) return <XG m={layerMat(c, depth)}>{children}</XG>;
  return (
    <XG m={layerMat(c, depth)}>
      <InkScale value={camInkFactor(ink.segs, depth) * ink.stage}>{children}</InkScale>
    </XG>
  );
};

/** Screen-constant stroke width inside a layer: pass the width you want ON SCREEN. (Under a flagged `inkComp` camera an
 *  <Ink> also multiplies it by the layer's factor: divide by useInkScale() to stay exactly screen-constant; a raw
 *  <path strokeWidth> is not compensated, so use the value as is.) */
export const useScreenWidth = (depth: number) => {
  const c = useCam();
  const s = layerScale(c, depth);
  return (px: number) => px / s;
};

// ---------------------------------------------------------------- checks

/** The full camera (keys + handheld) at time t, as a CineCamera with those props would compute it. */
export function camFull(keys: CamKey[], t: number, o: {handheld?: number; seed?: Seed; interp?: CamInterp} = {}): CamState {
  const base = camAt(keys, t, o.interp ?? 'spline');
  const h = handheldAt(t, o.handheld ?? 0, o.seed ?? 'cam');
  return {...base, ox: base.ox + h.ox, oy: base.oy + h.oy, rot: base.rot + h.rot};
}

/** Layer -> screen matrix over time for a camera path (e.g. to precompute what a moving camera will show). */
export const camPath = (keys: CamKey[], depth = 0, o: {handheld?: number; seed?: Seed; interp?: CamInterp} = {}) => (t: number): Mat => layerMat(camFull(keys, t, o), depth);

export type CamSpeed = {
  /** Fastest on-screen motion of any sampled screen point (px per frame) and when / where / on which layer. */
  max: number;
  at: number;
  depth: number;
  point: Pt;
  /** Mean over the move of the per-frame maximum (px / frame). */
  avg: number;
  /** VELOCITY CONTINUITY: the largest change of any sampled point's on-screen speed from one frame to the next
   *  (px / frame per frame) and when. A smooth move stays well under ~0.6; a stall, slam or whip at a key shows up
   *  as a spike (the old anchor-switch hitch: 1.9). */
  maxDv: number;
  dvAt: number;
};

/** On-screen speed of a camera move: for every frame in [t0, t1] and every layer depth, the screen points of a grid
 *  (default 7 x 11 over the frame) are followed to the next frame; returns the fastest (px / frame). Flat inked art
 *  strobes above ~15-20 px / frame: keep long cruises under that (CAM.reveal peaks at 1.43x its average). */
export function camSpeed(keys: CamKey[], o: {t0?: number; t1?: number; fps?: number; depths?: number[]; grid?: [number, number]; handheld?: number; seed?: Seed} = {}): CamSpeed {
  const fps = o.fps ?? 30;
  const t0 = o.t0 ?? keys[0]?.t ?? 0;
  const t1 = o.t1 ?? keys[keys.length - 1]?.t ?? 0;
  const depths = o.depths ?? [0];
  const [gx, gy] = o.grid ?? [7, 11];
  const pts: Pt[] = [];
  for (let i = 0; i < gx; i++) for (let j = 0; j < gy; j++) pts.push([(SCREEN.w * (i + 0.5)) / gx, (SCREEN.h * (j + 0.5)) / gy]);
  let best: CamSpeed = {max: 0, at: t0, depth: depths[0], point: pts[0], avg: 0, maxDv: 0, dvAt: t0};
  let sum = 0;
  let n = 0;
  let prev: Float64Array | null = null;
  let maxDv = 0;
  let dvAt = t0;
  for (let f = Math.round(t0 * fps); f < Math.round(t1 * fps); f++) {
    const ta = f / fps;
    const tb = (f + 1) / fps;
    const ca = camFull(keys, ta, o);
    const cb = camFull(keys, tb, o);
    let fm = 0;
    const cur = new Float64Array(depths.length * pts.length);
    let j = 0;
    for (const d of depths) {
      for (const sp of pts) {
        const w = unproject(ca, d, sp);
        const q = project(cb, d, w);
        // velocity vector, so a direction flip counts as a change too
        const vx = q[0] - sp[0];
        const vy = q[1] - sp[1];
        const v = Math.hypot(vx, vy);
        cur[j++] = v;
        if (v > fm) fm = v;
        if (v > best.max) best = {...best, max: v, at: ta, depth: d, point: sp};
      }
    }
    if (prev) {
      for (let k = 0; k < cur.length; k++) {
        const dv = Math.abs(cur[k] - prev[k]);
        if (dv > maxDv) {
          maxDv = dv;
          dvAt = ta;
        }
      }
    }
    prev = cur;
    sum += fm;
    n++;
  }
  return {...best, avg: n ? sum / n : 0, maxDv, dvAt};
}

/** On-screen speed (max over the grid and the depths, px / frame) of the frame starting at time t. Use it at a CUT:
 *  a camera must still be moving at the wipe midpoint on both sides (gate 1: no stall at a seam). Recipe: put the
 *  outgoing shot's LAST key 1-2 s past its end and the incoming shot's FIRST key 0.5-1.5 s before its start (negative
 *  t), so both cameras are mid-move through the transition (CineDemo: every seam >= ~1 px / frame). */
export function camSpeedAt(keys: CamKey[], t: number, o: {fps?: number; depths?: number[]; grid?: [number, number]; handheld?: number; seed?: Seed} = {}): number {
  const fps = o.fps ?? 30;
  return camSpeed(keys, {...o, t0: t, t1: t + 1 / fps}).max;
}
