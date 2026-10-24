// Pose builders for the elephant. Local units ~= card px at scale 1. Feet anchor at (0,0), y up is negative.
// Every pose is assembled from the same parts (head, ears, trunk, legs, tail, face) so it stays on-model.
import type React from 'react';
import {Pt, add, clamp, deg, ellipsePts, lerp, loopRange, mirror, smooth, spline, tp, tpt} from './ink';
import {Pen, cappedTube} from './pen';
import {blink, breath, earFlap, tailSwish, trunkSway} from './idle';

export type PoseName =
  | 'sit-back'
  | 'sit-front'
  | 'stand-side'
  | 'walk-side'
  | 'peek'
  | 'trunk-up'
  | 'hold'
  | 'ears-cover'
  | 'shrug'
  | 'sleep';

export const POSES: PoseName[] = [
  'sit-back',
  'sit-front',
  'stand-side',
  'walk-side',
  'peek',
  'trunk-up',
  'hold',
  'ears-cover',
  'shrug',
  'sleep',
];

export type Expression = 'neutral' | 'happy' | 'wide' | 'worried' | 'meh' | 'closed';

export type PoseCtx = {
  t: number;
  seed: number;
  look: number; // -1..1, where the eyes/head point (in local, unflipped space)
  idle: number; // 0..1 multiplier for idle life
  amount?: number; // pose-specific 0..1 (peek: how far out; shrug: how high)
  expression?: Expression;
  prop?: React.ReactNode;
  propRot: number;
  walkRate: number; // walk cycles per second
  flip: boolean;
};

// ---------- base shapes ----------
const HEAD_F: Pt[] = [
  [0, -25], [14, -23.5], [23, -15], [26.5, -3], [24, 9], [15, 18],
  [0, 21.5], [-15, 18], [-24, 9], [-26.5, -3], [-23, -15], [-14, -23.5],
];
const HEAD_S: Pt[] = [
  [0, -23], [12, -21], [20, -12], [22.5, 0], [19, 11], [9, 17.5],
  [-5, 18], [-16, 12], [-22, 1], [-20, -12], [-11, -20.5],
];
const EAR: Pt[] = [[0, -15], [9, -21], [21, -21], [30, -13], [33, 0], [30, 13], [21, 22], [10, 24], [3, 18], [0, 6]];
const EAR_IN: Pt[] = [[5, -10], [12, -15], [21, -14], [27, -7], [28.5, 3], [25, 12], [17, 17], [10, 17], [6, 11], [4, 1]];
const EAR_S: Pt[] = [[0, -14], [-9, -19.5], [-20, -18], [-27.5, -9], [-29, 4], [-24.5, 15], [-15, 22], [-6, 21], [-1, 13], [1, 0]];
const EAR_S_IN: Pt[] = [[-3.5, -9], [-10, -13.5], [-18.5, -12.5], [-23.5, -5], [-24.5, 4.5], [-20.5, 13], [-13, 17], [-7, 15], [-4, 8], [-2.5, -1]];

// ---------- parts ----------
type EarMode = 'front' | 'back' | 'cover' | 'side';

const ear = (pen: Pen, pivot: Pt, side: 1 | -1, rot: number, mode: EarMode, scale: number | [number, number] = 1) => {
  const {c} = pen;
  const [ssx, ssy] = typeof scale === 'number' ? [scale, scale] : scale;
  if (mode === 'side') {
    const xf = {x: pivot[0], y: pivot[1], rot, sx: ssx, sy: ssy};
    const loop = spline(tp(EAR_S, xf), true, 8);
    pen.fill(loop, c.body);
    pen.fill(spline(tp(EAR_S_IN, xf), true, 8), c.earInner, 1);
    pen.ink(loopRange(loop, 0.02, 0.6));
    pen.ink(loopRange(loop, 0.57, 0.93), {overEnd: 0.5});
    return;
  }
  if (mode === 'cover') {
    // ear folded forward over the face: we see its back, pointing inward
    const base = side > 0 ? mirror(EAR) : EAR;
    const xf = {x: pivot[0], y: pivot[1], rot: rot * side, sx: ssx, sy: ssy};
    const loop = spline(tp(base, xf), true, 8);
    pen.fill(loop, c.body);
    // the inner (peach) side curling into view along the lower rim
    const rimOut: Pt[] = [[2, 15], [9, 22], [20, 20.5], [28.5, 12]];
    const rimIn: Pt[] = [[27, 9], [19, 16], [10, 17], [4.5, 12.5]];
    const rim = [...spline(rimOut, false, 5), ...spline(rimIn, false, 5)];
    pen.fill(tp(side > 0 ? mirror(rim) : rim, xf), c.earInner, 0.5);
    pen.ink(loopRange(loop, 0.0, 0.55));
    pen.ink(loopRange(loop, 0.52, 1.02));
    const crease = tp(side > 0 ? mirror([[8, -9], [17, -6], [22, 3]]) : [[8, -9], [17, -6], [22, 3]], xf);
    pen.line(crease, {w: 0.7});
    return;
  }
  const base = side > 0 ? EAR : mirror(EAR);
  const inner = side > 0 ? EAR_IN : mirror(EAR_IN);
  const xf = {x: pivot[0], y: pivot[1], rot: rot * side, sx: ssx, sy: ssy};
  const loop = spline(tp(base, xf), true, 8);
  pen.fill(loop, c.body);
  if (mode === 'front') {
    pen.fill(spline(tp(inner, xf), true, 8), c.earInner, 1);
    pen.ink(loopRange(loop, 0.02, 0.6));
    pen.ink(loopRange(loop, 0.56, 0.86), {overEnd: 0});
  } else {
    pen.ink(loopRange(loop, -0.04, 0.6));
    pen.ink(loopRange(loop, 0.56, 0.97));
    const crease = tp(side > 0 ? [[7, -6], [13, 2], [11, 12]] : mirror([[7, -6], [13, 2], [11, 12]]), xf);
    pen.line(crease, {w: 0.65});
  }
};

const tuft = (pen: Pen, top: Pt, rot: number, k = 1) => {
  const strands: Pt[][] = [
    [[-2.6, 0.5], [-3.6, -3], [-5.6, -5.6]],
    [[0, 0], [0.3, -3.6], [1.2, -6.8]],
    [[2.6, 0.5], [4.2, -2.6], [6.4, -4.6]],
  ];
  for (const s of strands) pen.line(tp(s.map(([a, b]) => [a * k, b * k] as Pt), {x: top[0], y: top[1], rot}), {w: 0.72, tipIn: 0.8, tipOut: 0.15, over: 0});
};

const nail = (pen: Pen, at: Pt, rot: number, s = 1) => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 8; i++) {
    const a = Math.PI + (i / 8) * Math.PI;
    pts.push([Math.cos(a) * 2.3 * s, Math.sin(a) * 2.5 * s + 0.6]);
  }
  const p = tp(pts, {x: at[0], y: at[1], rot});
  pen.fill(p, pen.c.nail, 0.3);
  pen.ink(p, {w: 0.5, over: 0, tipIn: 0.5, tipOut: 0.5, wobble: 0.1});
};

/** A round foot seen sole-on: body rim, peach pad, three toenails on the rim. rot 0 = toes up. */
const sole = (pen: Pen, at: Pt, rot: number, k = 1) => {
  const c = pen.c;
  const loop = spline(ellipsePts(at[0], at[1], 9.2 * k, 8.4 * k, rot, 12), true, 6);
  pen.fill(loop, c.body);
  pen.fill(spline(ellipsePts(at[0], at[1] + 1.2 * k, 5.6 * k, 4.6 * k, rot, 10), true, 4).map((p) => tpt(p, {x: at[0], y: at[1], px: at[0], py: at[1], rot: 0})), c.earInner, 0.5);
  pen.ink(loopRange(loop, 0.04, 0.98), {over: 0.2});
  for (const a of [-34, 0, 34]) {
    const r = deg(a + rot - 90);
    const p: Pt = [at[0] + Math.cos(r) * 6.6 * k, at[1] + Math.sin(r) * 6.0 * k];
    nail(pen, p, a + rot, 0.78 * k);
  }
};

/** A leg as a tube from hip to foot with a flat-ish rounded foot. nails: which way the toes face. */
const leg = (pen: Pen, top: Pt, foot: Pt, w: number, color: string, nails: 'front' | 'side' | 'up' | 'none', bend = 0, inkTop = false) => {
  const dx = foot[0] - top[0];
  const dy = foot[1] - top[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const mid: Pt = [top[0] + dx * 0.5 + nx * bend, top[1] + dy * 0.5 + ny * bend];
  const center = spline([top, mid, foot], false, 6);
  // flat-bottom foot: squash the cap
  const {left, right, cap} = cappedTube(center, w * 0.94, w * 1.06);
  const ang = Math.atan2(dy, dx);
  const flat = cap.map((p) => {
    const ux = p[0] - foot[0];
    const uy = p[1] - foot[1];
    const along = ux * Math.cos(ang) + uy * Math.sin(ang);
    return [p[0] - Math.cos(ang) * along * 0.55, p[1] - Math.sin(ang) * along * 0.55] as Pt;
  });
  const loop = [...left, ...flat, ...right.slice().reverse()];
  pen.fill(loop, color);
  const outline = [...left, ...flat, ...right.slice().reverse()];
  const skip = inkTop ? 0 : 1;
  pen.ink(outline.slice(skip, outline.length - skip), {tipIn: 0.25, tipOut: 0.25, over: inkTop ? 1 : 0});
  if (nails === 'none') return;
  const along = (k: number): Pt => [foot[0] - Math.cos(ang) * k, foot[1] - Math.sin(ang) * k];
  if (nails === 'front' || nails === 'up') {
    const footRot = (ang * 180) / Math.PI - 90;
    for (const o of [-0.32, 0, 0.32]) {
      const p = add(along(nails === 'up' ? 1.2 : 1.4), [nx * w * o, ny * w * o]);
      nail(pen, p, footRot, 0.92);
    }
  } else {
    // side view: two nails on the front (+x) corner
    const footRot = (ang * 180) / Math.PI - 90;
    nail(pen, add(along(1.3), [-nx * w * 0.36, -ny * w * 0.36]), footRot, 0.9);
    nail(pen, add(along(1.3), [-nx * w * 0.02, -ny * w * 0.02]), footRot, 0.9);
  }
};

/** Trunk tube. ctrl in absolute coords. Returns the tip and its direction (deg). */
const trunk = (pen: Pen, ctrl: Pt[], w0: number, w1: number, wrinkles: number[] = [0.18, 0.3, 0.42]) => {
  const center = spline(ctrl, false, 6);
  const {left, right, loop} = cappedTube(center, w0, w1);
  pen.fill(loop, pen.c.body);
  pen.ink(loop, {tipIn: 0.1, tipOut: 0.1, over: 0});
  const n = center.length;
  for (const f of wrinkles) {
    const i = Math.round(f * (n - 1));
    const a = left[i];
    const b = right[i];
    const m: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    // bow the wrinkle toward the tip
    const nxt = center[Math.min(n - 1, i + 2)];
    const dir: Pt = [nxt[0] - center[i][0], nxt[1] - center[i][1]];
    const dl = Math.hypot(dir[0], dir[1]) || 1;
    const bow: Pt = [m[0] + (dir[0] / dl) * 0.9, m[1] + (dir[1] / dl) * 0.9];
    pen.line([[lerp(a[0], b[0], 0.3), lerp(a[1], b[1], 0.3)], bow, [lerp(a[0], b[0], 0.72), lerp(a[1], b[1], 0.72)]], {w: 0.6, over: 0, tipIn: 0.5, tipOut: 0.35});
  }
  const tip = center[n - 1];
  const pre = center[n - 3];
  return {tip, angle: (Math.atan2(tip[1] - pre[1], tip[0] - pre[0]) * 180) / Math.PI};
};

const bendCtrl = (ctrl: Pt[], degPerSeg: number): Pt[] => {
  // progressively rotate each segment (like a trunk curling a little more)
  const out: Pt[] = [ctrl[0]];
  let acc = 0;
  for (let i = 1; i < ctrl.length; i++) {
    acc += degPerSeg;
    const seg: Pt = [ctrl[i][0] - ctrl[i - 1][0], ctrl[i][1] - ctrl[i - 1][1]];
    const r = tpt(seg, {rot: acc});
    out.push(add(out[i - 1], r));
  }
  return out;
};

const tail = (pen: Pen, ctrl: Pt[]) => {
  const center = spline(ctrl, false, 6);
  const {loop} = cappedTube(center, 4.6, 3.4);
  pen.fill(loop, pen.c.body, 0.6);
  pen.ink(loop.slice(1, loop.length - 1), {w: 0.72, tipIn: 0.3, tipOut: 0.3, over: 0});
  const n = center.length;
  const tip = center[n - 1];
  const pre = center[n - 3];
  const ang = Math.atan2(tip[1] - pre[1], tip[0] - pre[0]);
  const drop = tp(
    [[0, -1.9], [2.6, -1.7], [5.2, -0.6], [6.6, 0], [5.2, 0.7], [2.6, 1.8], [0, 1.9], [-0.8, 0]],
    {x: tip[0], y: tip[1], rot: (ang * 180) / Math.PI},
  );
  pen.solid(spline(drop, true, 4));
  for (const da of [-0.32, 0.3]) {
    const a = ang + da;
    pen.line([tip, [tip[0] + Math.cos(a) * 4.4, tip[1] + Math.sin(a) * 4.4], [tip[0] + Math.cos(a + da) * 7.4, tip[1] + Math.sin(a + da) * 7.4]], {w: 0.7, tipIn: 1, tipOut: 0.15, over: 0});
  }
};

const eye = (pen: Pen, e: Pt, expr: Expression, bl: number, side: 1 | -1, sizeK = 1) => {
  const ink = pen.c.ink;
  if (expr === 'happy') {
    pen.line([[e[0] - 3.4, e[1] + 1.2], [e[0], e[1] - 2.2], [e[0] + 3.4, e[1] + 1.2]], {w: 0.85, over: 0});
    return;
  }
  if (expr === 'closed') {
    pen.line([[e[0] - 3.4, e[1] - 0.4], [e[0], e[1] + 2.0], [e[0] + 3.4, e[1] - 0.4]], {w: 0.85, over: 0});
    return;
  }
  const big = expr === 'wide' ? 1.3 : 1;
  const rx = 2.45 * big * sizeK;
  const ry = 3.3 * big * sizeK * (1 - bl * 0.92);
  if (bl > 0.7) {
    pen.line([[e[0] - 3, e[1] + 0.6], [e[0], e[1] + 1.2], [e[0] + 3, e[1] + 0.6]], {w: 0.8, over: 0});
  } else {
    pen.solid(ellipsePts(e[0], e[1], rx, ry, 0, 16), ink);
    if (expr === 'wide') pen.solid(ellipsePts(e[0] + 0.9, e[1] - 1.3, 0.9, 0.9, 0, 8), pen.c.shine);
  }
  if (expr === 'meh') {
    // heavy upper lid: a flat line through the top of the eye
    pen.fill(ellipsePts(e[0], e[1] - 2.2, 3.6, 2.3, 0, 12), pen.c.body, 0);
    pen.line([[e[0] - 3.6, e[1] - 0.6], [e[0] + 3.6, e[1] - 0.9]], {w: 0.8, over: 0.4});
  }
  if (expr === 'worried') {
    pen.line([[e[0] - side * 3.8, e[1] - 6.2], [e[0] + side * 3.2, e[1] - 8.6]], {w: 0.75, over: 0});
  }
};

const cheek = (pen: Pen, p: Pt, rx = 4.6, ry = 2.9) => pen.fill(ellipsePts(p[0], p[1], rx, ry, 0, 14), pen.c.cheek, 0.4, 0.95);

const smile = (pen: Pen, a: Pt, k = 1) =>
  pen.line([[a[0], a[1]], [a[0] + 2.4 * k, a[1] + 2.2], [a[0] + 5 * k, a[1] + 0.6]], {w: 0.75, over: 0, tipIn: 0.6, tipOut: 0.3});

// ---------- FRONT rig (sit-front and its variants) ----------
type FrontOpts = {
  headTilt?: number;
  headDy?: number;
  earRot?: number; // base ear rotation (deg, + = droop)
  earMode?: 'front' | 'cover';
  trunk?: Pt[]; // relative to trunk base, before sway / tilt
  trunkW?: [number, number];
  arms?: 'down' | 'shrug';
  shrug?: number;
  expr?: Expression;
  mouth?: 'smile' | 'open' | 'flat' | 'none';
  mouthSide?: 1 | -1;
  hunch?: number;
  swayK?: number;
  showTail?: boolean;
  holdProp?: boolean;
  shiver?: number;
};

const TRUNK_HANG: Pt[] = [[0, 0], [0, 8], [0.6, 16], [2.2, 23.5], [6.2, 28], [10.6, 26.4]];

const frontRig = (pen: Pen, ctx: PoseCtx, o: FrontOpts) => {
  const {t, seed, idle, look} = ctx;
  const c = pen.c;
  const br = breath(t, seed) * idle;
  const bl = blink(t, seed) * idle;
  const hunch = o.hunch ?? 0;
  const shiver = (o.shiver ?? 0) * Math.sin(t * Math.PI * 2 * 9.5) * 0.6;
  const sh = o.shrug ?? 0;

  // tail peeking out on the right, behind the body
  if (o.showTail !== false) {
    const sw = tailSwish(t, seed) * idle;
    const base: Pt = [26, -8];
    const ctrl = bendCtrl([[0, 0], [8, 0.5], [13, -3], [15, -9]], -4 + sw * 9).map((p) => add(p, base));
    tail(pen, ctrl);
  }

  const H: Pt = [look * 1.6 + shiver, -67 + (o.headDy ?? 0) + hunch * 5 - br * 0.6 - sh * 4];
  const tilt = (o.headTilt ?? 0) + look * 2;
  const hp = (p: Pt): Pt => tpt(p, {x: H[0], y: H[1], rot: tilt});
  const earRot = (o.earRot ?? 6) - sh * 10;
  const earMode = o.earMode ?? 'front';

  if (earMode === 'front') {
    ear(pen, hp([-17, -9]), -1, earRot + earFlap(t, seed, -1) * idle - tilt, 'front');
    ear(pen, hp([17, -9]), 1, earRot + earFlap(t, seed, 1) * idle + tilt, 'front');
  }

  // body (breathes from the feet up)
  const bodyCtrl: Pt[] = [
    [0, -50], [17, -47], [28, -35], [33, -19], [33, -6], [27, 0], [0, 1], [-27, 0], [-33, -6], [-33, -19], [-28, -35], [-17, -47],
  ];
  const bsy = (1 + br * 0.014) * (1 - hunch * 0.07) * (1 + sh * 0.04);
  const bsx = (1 - br * 0.006) * (1 + hunch * 0.05);
  pen.shape(tp(bodyCtrl, {sx: bsx, sy: bsy, x: shiver * 0.5}), c.body, [[0.04, 0.47], [0.53, 0.96]]);
  // haunches
  for (const s of [-1, 1] as const) {
    pen.line(tp([[s * 31.5, -25], [s * 27, -14], [s * 18, -7]], {sx: bsx, sy: bsy}), {w: 0.85, over: 0.5});
  }
  // hind feet: soles toward us, like a sitting teddy
  for (const s of [-1, 1] as const) sole(pen, [s * 25.5 + shiver * 0.3, -8.2], -s * 12, 1);
  // front legs
  if ((o.arms ?? 'down') === 'down') {
    for (const s of [-1, 1] as const) leg(pen, [s * 9.4, -34], [s * 10, -0.6], 14, c.body, 'front', 0);
  }

  // head
  const headLoop = spline(tp(HEAD_F, {x: H[0], y: H[1], rot: tilt}), true, 8);
  pen.fill(headLoop, c.body);
  pen.ink(loopRange(headLoop, 0.9, 1.43));
  pen.ink(loopRange(headLoop, 0.55, 0.93), {overEnd: 0.4});
  tuft(pen, hp([0, -24.6]), tilt);
  if (o.arms === 'shrug') {
    for (const s of [-1, 1] as const) {
      const top: Pt = [s * 15, -33 - sh * 3];
      const foot: Pt = [s * (31 + sh * 6), -44 - sh * 10];
      leg(pen, top, foot, 12.5, c.body, 'none', s * 2.5);
      sole(pen, foot, s * 18, 0.82);
    }
  }

  // face
  const expr = o.expr ?? ctx.expression ?? 'neutral';
  if (earMode === 'front') {
    for (const s of [-1, 1] as const) eye(pen, hp([s * 9.6 + look * 2.2, -2]), expr, bl, s);
  }
  for (const s of [-1, 1] as const) cheek(pen, hp([s * 16 + look * 1.2, 7.5]));
  if (earMode === 'cover') {
    // each ear flops forward over its own eye; forehead and trunk stay visible
    const fl = Math.sin(t * Math.PI * 2 * 0.5) * 2 * idle;
    ear(pen, hp([-30.5, -6.5]), -1, -7 + fl, 'cover', [0.76, 0.72]);
    ear(pen, hp([30.5, -6.5]), 1, -7 - fl, 'cover', [0.76, 0.72]);
  }

  // trunk
  const sway = trunkSway(t, seed) * idle * (o.swayK ?? 1);
  const rel = o.trunk ?? TRUNK_HANG;
  const tb = hp([look * 1.4, 8.5]);
  const tctrl = tp(bendCtrl(rel, sway * 3.2), {x: tb[0], y: tb[1], rot: tilt});
  const mouth = o.mouth ?? 'smile';
  if (mouth === 'open') {
    const m = hp([0.5, 16]);
    pen.solid(spline(ellipsePts(m[0], m[1], 4.2, 3.6, 0, 10), true, 4), c.ink);
    pen.solid(ellipsePts(m[0], m[1] + 1.6, 2.6, 1.6, 0, 10), c.cheek);
  }
  let prop: {tip: Pt; angle: number} | null = null;
  const [w0, w1] = o.trunkW ?? [13, 7.6];
  if (o.holdProp && ctx.prop) {
    // draw prop first so the trunk tip wraps over its handle
    const restTip = tp(rel, {x: tb[0], y: tb[1], rot: tilt});
    const n = tctrl.length;
    const ang = Math.atan2(tctrl[n - 1][1] - tctrl[n - 2][1], tctrl[n - 1][0] - tctrl[n - 2][0]);
    const restAng = Math.atan2(restTip[n - 1][1] - restTip[n - 2][1], restTip[n - 1][0] - restTip[n - 2][0]);
    pen.node(tctrl[n - 1], ctx.propRot + ((ang - restAng) * 180) / Math.PI, ctx.prop);
  }
  prop = trunk(pen, tctrl, w0, w1);
  if (mouth === 'smile') {
    if ((o.mouthSide ?? 1) > 0) smile(pen, hp([6.8 + look, 13.6]));
    else pen.line([hp([-6.8 + look, 13.6]), hp([-9.2 + look, 15.8]), hp([-11.8 + look, 14.2])], {w: 0.75, over: 0, tipIn: 0.6, tipOut: 0.3});
  }
  if (mouth === 'flat') pen.line([hp([5.5, 15]), hp([8, 14.4]), hp([11, 15.4])], {w: 0.75, over: 0});

  return {H, tilt, hp, trunkTip: prop};
};

// ---------- poses ----------
const sitFront = (pen: Pen, ctx: PoseCtx) => {
  const d = clamp(ctx.amount ?? 0);
  if (d <= 0) {
    frontRig(pen, ctx, {});
    return;
  }
  // hanging-trunk gag: the trunk dangles straight down past the feet (over a ledge edge) and swings
  const L = lerp(28, 76, d);
  const swing = Math.sin(ctx.t * Math.PI * 2 * 0.55 + ctx.seed) * 5 * ctx.idle * d;
  const n = 7;
  const rel: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const k = i / (n - 1);
    rel.push([Math.sin(k * 1.2) * swing * k + (k > 0.85 ? (k - 0.85) * 40 : 0), k * L]);
  }
  frontRig(pen, ctx, {trunk: rel, trunkW: [13, 7.2], swayK: 0.2});
};

const trunkUp = (pen: Pen, ctx: PoseCtx) => {
  const pulse = 0.5 + 0.5 * Math.sin(ctx.t * Math.PI * 2 * 1.6);
  const r = frontRig(pen, ctx, {
    headTilt: -7,
    headDy: -2,
    earRot: -16 - pulse * 5,
    trunk: [[0, 0], [0.2, -9], [0.8, -19], [1.6, -29], [4, -38], [9.5, -43.5], [15.5, -44]],
    trunkW: [12.4, 8.6],
    expr: ctx.expression ?? 'wide',
    mouth: 'open',
    swayK: 0.4,
  });
  // trumpet lines at the tip
  const tip = r.trunkTip!.tip;
  const a0 = (r.trunkTip!.angle * Math.PI) / 180;
  const len = 5 + pulse * 4;
  for (const da of [-0.8, -0.05, 0.7]) {
    const a = a0 + da;
    const p0: Pt = [tip[0] + Math.cos(a) * 7.5, tip[1] + Math.sin(a) * 7.5];
    const p1: Pt = [tip[0] + Math.cos(a) * (7.5 + len), tip[1] + Math.sin(a) * (7.5 + len)];
    pen.line([p0, p1], {w: 1.05, over: 0, tipIn: 0.6, tipOut: 0.3});
  }
};

const hold = (pen: Pen, ctx: PoseCtx) => {
  frontRig(pen, ctx, {
    headTilt: -4,
    trunk: [[0, 0], [6, 4], [15, 5.4], [24, 2], [30, -5], [32, -13]],
    trunkW: [13, 7.4],
    expr: ctx.expression ?? 'neutral',
    swayK: 0.5,
    holdProp: true,
    mouthSide: -1,
  });
};

const earsCover = (pen: Pen, ctx: PoseCtx) => {
  frontRig(pen, ctx, {
    hunch: 1,
    headDy: 1,
    earMode: 'cover',
    trunk: [[0, 0], [0.6, 7], [-0.6, 13.5], [-4.6, 16.6], [-8.8, 14.6], [-9.2, 10]],
    trunkW: [12.5, 6.8],
    mouth: 'none',
    showTail: false,
    swayK: 0.3,
    shiver: ctx.idle,
  });
  // little worry marks
  const wob = Math.sin(ctx.t * Math.PI * 2 * 1.2) * 0.8;
  pen.line([[-40, -78 + wob], [-45, -82 + wob]], {w: 0.8, over: 0});
  pen.line([[-41, -70 + wob], [-47, -71 + wob]], {w: 0.8, over: 0});
  pen.line([[40, -78 - wob], [45, -82 - wob]], {w: 0.8, over: 0});
  pen.line([[41, -70 - wob], [47, -71 - wob]], {w: 0.8, over: 0});
};

const shrug = (pen: Pen, ctx: PoseCtx) => {
  const a = ctx.amount ?? 0.75 + 0.25 * Math.sin(ctx.t * Math.PI * 2 * 0.6);
  frontRig(pen, ctx, {
    headTilt: 9,
    arms: 'shrug',
    shrug: a,
    earRot: -2,
    trunk: [[0, 0], [-1.6, 6.5], [-1, 13], [2.6, 18], [7.4, 18.6], [10.4, 15.4]],
    expr: ctx.expression ?? 'meh',
    mouth: 'flat',
    swayK: 0.5,
  });
};

const sitBack = (pen: Pen, ctx: PoseCtx) => {
  const {t, seed, idle, look} = ctx;
  const c = pen.c;
  const br = breath(t, seed) * idle;
  const bsy = 1 + br * 0.014;
  const bsx = 1 - br * 0.006;
  const body: Pt[] = [
    [0, -52], [18, -48.5], [29, -36], [33.5, -19], [32.5, -5], [25, 0], [0, 1], [-25, 0], [-32.5, -5], [-33.5, -19], [-29, -36], [-18, -48.5],
  ];
  pen.shape(tp(body, {sx: bsx, sy: bsy}), c.body, [[0.05, 0.47], [0.54, 0.97]]);
  // haunch lines, like the reference cat
  for (const s of [-1, 1] as const) pen.line(tp([[s * 32, -21], [s * 27.5, -10], [s * 17, -2.6]], {sx: bsx, sy: bsy}), {w: 0.9, over: 0.4});
  // back wrinkles: the cat's stripes, translated
  const stripes: [number, number][] = [[-36.5, 17], [-28, 21], [-19.5, 15.5]];
  stripes.forEach(([y, w], i) => {
    const yy = y * bsy;
    pen.line([[-w / 2 + i * 0.6, yy - 0.6], [0.5, yy + 1.9], [w / 2 + i * 0.4, yy - 0.4]], {w: 0.95, tipIn: 0.5, tipOut: 0.2, over: 0});
  });
  // tail: along the ledge, then hanging over its edge
  const sw = tailSwish(t, seed) * idle;
  const hang = bendCtrl([[0, 0], [3, 6], [3.6, 13], [2.2, 20]], sw * 6);
  const tctrl: Pt[] = [[5, -4], [15, -1.6], [24.5, 0.6], ...hang.slice(1).map((p) => add(p, [29.5, 2.2]))];
  tail(pen, tctrl);

  const H: Pt = [look * 2.4, -69 - br * 0.6];
  const tilt = look * 5;
  const hp = (p: Pt): Pt => tpt(p, {x: H[0], y: H[1], rot: tilt});
  // trunk tip peeking past the head when looking sideways
  if (Math.abs(look) > 0.05) {
    const s = Math.sign(look);
    const k = smooth(0.05, 0.8, Math.abs(look));
    const tb = hp([s * 14, 17]);
    const ctrl = tp([[0, 0], [s * 7, 4.5], [s * 15, 6.5], [s * 22, 5], [s * 26.5, 0.6], [s * 27.4, -3.6]], {x: tb[0], y: tb[1], sx: lerp(0.55, 1, k), sy: lerp(0.55, 1, k)});
    trunk(pen, ctrl, 10, 6.6, []);
  }
  const headLoop = spline(tp(HEAD_F, {x: H[0], y: H[1], rot: tilt}), true, 8);
  pen.fill(headLoop, c.body);
  // like the cat: the top of the head between the ears is left open
  pen.ink(loopRange(headLoop, 0.055, 0.44));
  pen.ink(loopRange(headLoop, 0.56, 0.945), {overEnd: 0.4});
  tuft(pen, hp([0, -24.6]), tilt);
  for (const s of [-1, 1] as const) ear(pen, hp([s * 16.5, -8]), s, 8 + earFlap(t, seed, s) * idle + s * tilt, 'back');
};

type SideOpts = {
  walk?: boolean;
  rate?: number;
};

export const WALK = {
  stride: 19, // foot travel per cycle (local units)
  duty: 0.58, // fraction of the cycle a foot is planted
};
/** Local units per second the body must travel for planted feet not to slide (multiply by scale for px). */
export const walkSpeed = (rate = 1.25) => (WALK.stride / WALK.duty) * rate;

const footCycle = (ph: number) => {
  // ph in [0,1): 0..duty planted (moves back), duty..1 swing (moves forward and lifts)
  const p = ((ph % 1) + 1) % 1;
  const A = WALK.stride / 2;
  if (p < WALK.duty) {
    const s = p / WALK.duty;
    return {dx: A - 2 * A * s, lift: 0};
  }
  const s = (p - WALK.duty) / (1 - WALK.duty);
  const e = s * s * (3 - 2 * s);
  return {dx: -A + 2 * A * e, lift: Math.sin(Math.PI * s) * 6.4};
};

const sideRig = (pen: Pen, ctx: PoseCtx, o: SideOpts) => {
  const {t, seed, idle, look} = ctx;
  const c = pen.c;
  const walking = !!o.walk;
  const rate = o.rate ?? ctx.walkRate;
  const cyc = t * rate;
  const br = breath(t, seed) * idle;
  const bob = walking ? Math.cos(cyc * Math.PI * 4) * 1.1 : br * 0.5;
  const headBob = walking ? Math.cos(cyc * Math.PI * 4 - 0.7) * 1.5 : -br * 0.6;
  const roll = walking ? Math.sin(cyc * Math.PI * 2) * 1.2 : 0;

  // tail
  const sw = (walking ? Math.sin(cyc * Math.PI * 2 + 1) * 0.9 : tailSwish(t, seed) * idle) + (ctx.amount && !walking ? clamp(ctx.amount) * 2.2 : 0);
  const tbase: Pt = [-37, -35 + bob];
  tail(pen, bendCtrl([[0, 0], [-5.5, 5], [-7.5, 12], [-6.5, 18]], sw * 7 - 3).map((p) => add(p, tbase)));

  // legs: lateral-sequence walk (near-hind, near-front, far-hind, far-front)
  const legs = [
    {hip: [-15.5, -25] as Pt, far: true, ph: 0.5},
    {hip: [19, -25] as Pt, far: true, ph: 0.75},
  ];
  const near = [
    {hip: [-24, -24] as Pt, far: false, ph: 0},
    {hip: [11.5, -24] as Pt, far: false, ph: 0.25},
  ];
  const leap = walking ? 0 : clamp(ctx.amount ?? 0);
  const drawLeg = (L: {hip: Pt; far: boolean; ph: number}) => {
    const hip: Pt = [L.hip[0], L.hip[1] + bob];
    let foot: Pt = [L.hip[0], 0];
    let bend = 0;
    if (leap > 0) {
      const front = L.hip[0] > 0;
      foot = [L.hip[0] + (front ? 1 : -1) * WALK.stride * 0.62 * leap + (L.far ? 2 : 0), -(front ? 5 : 2.5) * leap];
      bend = (front ? 3 : -2) * leap;
    }
    if (walking) {
      const f = footCycle(cyc + L.ph);
      foot = [L.hip[0] + f.dx, -f.lift];
      bend = f.lift * 0.55 * (L.hip[0] < 0 ? -1 : 1);
    }
    leg(pen, hip, foot, L.far ? 13 : 14, L.far ? c.shade : c.body, 'side', bend);
  };
  legs.forEach(drawLeg);

  // body
  const body: Pt[] = [
    [-38, -38], [-31, -51], [-15, -57], [3, -56], [18, -49.5], [24.5, -37], [22, -23.5], [10, -18.5], [-10, -18], [-28, -19.5], [-37.5, -27],
  ];
  const bsy = 1 + (walking ? 0 : br * 0.012);
  pen.shape(tp(body, {sy: bsy, rot: roll, y: bob}), c.body, [[0.97, 1.52], [0.5, 0.92]]);
  // hip line
  pen.line(tp([[-24, -46], [-30, -38], [-31, -28]], {rot: roll, y: bob}), {w: 0.85, over: 0.3});
  near.forEach(drawLeg);

  // head
  const H: Pt = [27 + look * 0.8, -58 + bob + headBob * 0.6];
  const tilt = (walking ? Math.sin(cyc * Math.PI * 4 - 0.5) * 1.6 : 0) + look * 3;
  const hp = (p: Pt): Pt => tpt(p, {x: H[0], y: H[1], rot: tilt});
  const headLoop = spline(tp(HEAD_S, {x: H[0], y: H[1], rot: tilt}), true, 8);
  pen.fill(headLoop, c.body);
  pen.ink(loopRange(headLoop, 0.86, 1.4));
  pen.ink(loopRange(headLoop, 0.6, 0.9));
  tuft(pen, hp([-1, -22.6]), tilt - 6);

  // trunk
  const sway = walking ? Math.sin(cyc * Math.PI * 2 - 0.6) * 0.9 : trunkSway(t, seed) * idle;
  let rel: Pt[] = [[0, 0], [5, 8], [7.4, 18], [6.6, 27], [9.6, 32.4], [14.4, 30.6]];
  if (ctx.prop) rel = [[0, 0], [7, 4], [15, 4.4], [22, 1.6], [27, -3.4]];
  const tb = hp([15, 1]);
  const tctrl = tp(bendCtrl(rel, sway * 3), {x: tb[0], y: tb[1], rot: tilt});
  if (ctx.prop) {
    const n = tctrl.length;
    const restTip = tp(rel, {x: tb[0], y: tb[1], rot: tilt});
    const ang = Math.atan2(tctrl[n - 1][1] - tctrl[n - 2][1], tctrl[n - 1][0] - tctrl[n - 2][0]);
    const restAng = Math.atan2(restTip[n - 1][1] - restTip[n - 2][1], restTip[n - 1][0] - restTip[n - 2][0]);
    pen.node(tctrl[n - 1], ctx.propRot + ((ang - restAng) * 180) / Math.PI, ctx.prop);
  }
  trunk(pen, tctrl, 13, 7.4);

  // ear over the side of the head
  const flap = (walking ? Math.sin(cyc * Math.PI * 2 + 0.4) * 5 : earFlap(t, seed, 1) * idle) - leap * 14;
  ear(pen, hp([-4, 2.5]), 1, 6 + flap + tilt * 0.3, 'side', 0.88);

  // face
  const bl = blink(t, seed) * idle;
  const expr = ctx.expression ?? 'neutral';
  eye(pen, hp([9.8 + look * 1.6, -4]), expr, bl, 1);
  cheek(pen, hp([11.5, 6.5]), 4.2, 2.8);
  smile(pen, hp([8.6, 12.4]), 0.9);
};

const standSide = (pen: Pen, ctx: PoseCtx) => sideRig(pen, ctx, {});
const walkSide = (pen: Pen, ctx: PoseCtx) => sideRig(pen, ctx, {walk: true});

const peek = (pen: Pen, ctx: PoseCtx) => {
  const {t, seed, idle} = ctx;
  const c = pen.c;
  const a = clamp(ctx.amount ?? 1);
  const look = ctx.look || 0.6;
  const H: Pt = [lerp(-30, 11, a), -38 + Math.sin(t * Math.PI * 2 * 0.35) * 0.8 * idle];
  const tilt = lerp(4, 13, a) + Math.sin(t * Math.PI * 2 * 0.22 + seed) * 2 * idle;
  const hp = (p: Pt): Pt => tpt(p, {x: H[0], y: H[1], rot: tilt});
  pen.clip(0, true);
  ear(pen, hp([17, -9]), 1, 2 + earFlap(t, seed, 1) * idle, 'front');
  const headLoop = spline(tp(HEAD_F, {x: H[0], y: H[1], rot: tilt}), true, 8);
  pen.fill(headLoop, c.body);
  pen.ink(loopRange(headLoop, 0.9, 1.43));
  pen.ink(loopRange(headLoop, 0.55, 0.93));
  tuft(pen, hp([0, -24.6]), tilt);
  const bl = blink(t, seed) * idle;
  const expr = ctx.expression ?? 'neutral';
  for (const s of [-1, 1] as const) eye(pen, hp([s * 9.6 + look * 2.4, -2]), expr, bl, s);
  for (const s of [-1, 1] as const) cheek(pen, hp([s * 16 + look, 7.5]));
  const sway = trunkSway(t, seed) * idle;
  const tb = hp([look * 1.4, 8.5]);
  trunk(pen, tp(bendCtrl([[0, 0], [0.4, 7.5], [1.4, 15], [4.6, 20.6], [9.4, 21.4], [12.2, 18]], sway * 3.5), {x: tb[0], y: tb[1], rot: -tilt * 0.6}), 12.5, 7.2);
  smile(pen, hp([6.8 + look, 13.6]));
  pen.clip(0, false);
  // the front foot gripping the edge (drawn over the occluder)
  const fy = -4 + (1 - a) * 4;
  const fx = lerp(-7, 1.5, a);
  const loop = spline(ellipsePts(fx, fy, 6.4, 7.8, 0, 12), true, 6);
  pen.fill(loop, c.body);
  pen.ink(loopRange(loop, 0.02, 0.9), {over: 0.2});
  for (const k of [-0.5, 0, 0.5]) nail(pen, [fx + 4.6 - Math.abs(k) * 1.4, fy + k * 7.6], 90 + k * 30, 0.74);
};

const sleep = (pen: Pen, ctx: PoseCtx) => {
  const {t, seed, idle, flip} = ctx;
  const c = pen.c;
  const br = breath(t, seed, 3.6) * idle;
  // tail curled around the rump
  tail(pen, [[-34, -9], [-41, -5.5], [-42.5, -0.5], [-38, 2]]);
  // far front leg (stretched forward)
  leg(pen, [6, -8], [30, -3.4], 9.6, c.shade, 'side', 0);
  const body: Pt[] = [[-36, 0], [-38.5, -11], [-32, -23], [-16, -30], [2, -29.5], [15, -23], [20, -11], [17, 0.5]];
  pen.shape(tp(body, {sy: 1 + br * 0.045, sx: 1 - br * 0.01}), c.body, [[0.86, 1.36], [0.46, 0.75]]);
  // tucked hind leg
  pen.line(tp([[-30, -4], [-27, -15], [-15, -17.5], [-8, -10]], {sy: 1 + br * 0.045}), {w: 0.85, over: 0.3});
  const hf = spline(ellipsePts(-12, -3.6, 8.4, 4.4, 0, 12), true, 6);
  pen.fill(hf, c.body);
  pen.ink(loopRange(hf, 0.0, 0.85), {over: 0});
  nail(pen, [-4.6, -4.6], 90, 0.7);
  nail(pen, [-4.4, -1.4], 90, 0.7);
  // near front leg
  leg(pen, [4, -6], [27, -2.8], 10, c.body, 'side', 0);
  // head resting on the paws
  const H: Pt = [27, -20.5 + br * 0.4];
  const tilt = 10;
  const hp = (p: Pt): Pt => tpt(p, {x: H[0], y: H[1], rot: tilt});
  const headLoop = spline(tp(HEAD_S, {x: H[0], y: H[1], rot: tilt, sx: 0.96, sy: 0.96}), true, 8);
  pen.fill(headLoop, c.body);
  pen.ink(loopRange(headLoop, 0.86, 1.4));
  pen.ink(loopRange(headLoop, 0.62, 0.88));
  tuft(pen, hp([-1, -22]), tilt - 10, 0.9);
  // trunk curled on the ground
  const tb = hp([15, 2]);
  trunk(pen, [tb, add(tb, [5.6, 4]), add(tb, [8.6, 9.6]), add(tb, [6.6, 13.2]), add(tb, [2.2, 13.2]), add(tb, [0.6, 9.6])], 12, 6.8, [0.2, 0.34]);
  ear(pen, hp([-3, -6]), 1, 26 + Math.sin(t * 0.9) * 1.2 * idle, 'side', 0.96);
  eye(pen, hp([9.6, -3]), 'closed', 0, 1);
  cheek(pen, hp([11.5, 6]), 4.2, 2.8);
  // floating z's
  for (let i = 0; i < 3; i++) {
    const p = (t / 2.6 + i / 3) % 1;
    const op = Math.sin(Math.PI * p);
    if (op < 0.05) continue;
    const s = lerp(3.2, 6.4, p);
    const base: Pt = [H[0] + 8 + p * 16, H[1] - 26 - p * 26];
    let z: Pt[] = [[0, 0], [s, -0.2], [0.2, s], [s * 1.05, s]];
    if (flip) z = z.map(([a, b]) => [s - a, b] as Pt);
    const pts = z.map((q) => add(q, base));
    pen.layers.push({k: 'ink', pts, seed: seed * 3 + i * 17 + Math.floor(t / 2.6 + i / 3) * 5, w: 0.85, over: 0, tipIn: 0.6, tipOut: 0.4, opacity: op});
  }
};

export const POSE_BUILDERS: Record<PoseName, (pen: Pen, ctx: PoseCtx) => void> = {
  'sit-back': sitBack,
  'sit-front': sitFront,
  'stand-side': standSide,
  'walk-side': walkSide,
  peek,
  'trunk-up': trunkUp,
  hold,
  'ears-cover': earsCover,
  shrug,
  sleep,
};

/** Approximate local-space bounds of each pose (for layout and clipping). Feet at y=0. */
export const POSE_BOUNDS: Record<PoseName, {x0: number; x1: number; y0: number; y1: number}> = {
  'sit-back': {x0: -52, x1: 52, y0: -100, y1: 28},
  'sit-front': {x0: -54, x1: 54, y0: -100, y1: 2}, // amount=1 (trunk dangle): y1 = 24
  'stand-side': {x0: -52, x1: 64, y0: -88, y1: 2},
  'walk-side': {x0: -52, x1: 66, y0: -90, y1: 2},
  peek: {x0: -8, x1: 66, y0: -72, y1: 6},
  'trunk-up': {x0: -58, x1: 60, y0: -112, y1: 2},
  hold: {x0: -54, x1: 70, y0: -100, y1: 2},
  'ears-cover': {x0: -50, x1: 50, y0: -96, y1: 2},
  shrug: {x0: -56, x1: 56, y0: -112, y1: 2},
  sleep: {x0: -46, x1: 62, y0: -80, y1: 4},
};
