// figure.ts: the board's gesture figures (STORYBOARD_STYLE §3): a head circle (r = 0.09 h), a bean torso along one
// curved line of action, limb lines, mitten hands, arms held away from the body. The pose is the verb and carries the
// emotion; people carry no face marks on the board (the mascot alone has a face). Drawn at the element's tier:
// A ink 9 px + the dark torso, B mid 3 px lines + a light torso, C a light flat figure (limbs light 3 px).
// 'smear' = the ONE stretched drawing of a fast transit (G3_ANIMATIC §4): the walk silhouette stretched back along
// `facing` and leaning into the move, three trailing speed strokes, held 2-3 frames between two key poses.
// scripts/g3/board_lint.py reads POSES and SMEAR for figure boxes: keep both plain literals.

import {type Pt, boardLoop, ellipse, smooth} from '../sketch';
import {BOARD, type Weight} from './board';
import type {El} from './types';

export type Limb = [Pt, Pt];
export type PoseDef = {H: Pt; S: Pt; P: Pt; bend: number; arms: [Limb, Limb]; legs: [Limb, Limb]; gaze: Pt; finger?: boolean; eyes?: boolean; cross?: boolean};
// Poses in units of the figure's height h: x forward (toward `facing`), y up from the feet. H = head centre (radius
// 0.09), S = shoulders, P = hips, bend = the line of action's bow (+ = the middle pushes forward); arms and legs are
// [back, front], each [elbow or knee, hand or foot]; gaze = where the eyes look (x forward, y up); cross = the front arm
// crosses the body (it gets a paper edge over a dark torso).
export const POSES: Record<string, PoseDef> = {
  stand: {H: [0, 0.91], S: [0, 0.77], P: [0, 0.48], bend: 0, arms: [[[-0.125, 0.62], [-0.16, 0.47]], [[0.125, 0.62], [0.16, 0.47]]], legs: [[[-0.05, 0.24], [-0.07, 0]], [[0.05, 0.24], [0.07, 0]]], gaze: [0, 0]},
  walk: {H: [0.05, 0.9], S: [0.03, 0.765], P: [0, 0.48], bend: -0.01, arms: [[[-0.07, 0.62], [-0.15, 0.52]], [[0.1, 0.63], [0.19, 0.53]]], legs: [[[-0.06, 0.25], [-0.17, 0.03]], [[0.09, 0.26], [0.15, 0]]], gaze: [0.3, 0]},
  point: {H: [0.02, 0.91], S: [0.01, 0.77], P: [0, 0.48], bend: 0, arms: [[[-0.09, 0.62], [-0.13, 0.47]], [[0.17, 0.75], [0.33, 0.77]]], legs: [[[-0.05, 0.24], [-0.08, 0]], [[0.05, 0.24], [0.08, 0]]], gaze: [0.4, 0], finger: true},
  reach: {H: [0.1, 0.88], S: [0.07, 0.75], P: [0, 0.48], bend: 0, arms: [[[-0.05, 0.62], [-0.14, 0.53]], [[0.22, 0.8], [0.36, 0.95]]], legs: [[[-0.04, 0.23], [-0.13, 0.01]], [[0.07, 0.25], [0.11, 0]]], gaze: [0.35, 0.3]},
  hold: {H: [0, 0.91], S: [0, 0.77], P: [0, 0.48], bend: 0, arms: [[[0.03, 0.6], [0.19, 0.64]], [[0.09, 0.59], [0.22, 0.67]]], legs: [[[-0.05, 0.24], [-0.07, 0]], [[0.05, 0.24], [0.07, 0]]], gaze: [0.3, -0.25], cross: true},
  shrug: {H: [0, 0.895], S: [0, 0.78], P: [0, 0.48], bend: 0, arms: [[[-0.16, 0.66], [-0.25, 0.75]], [[0.16, 0.66], [0.25, 0.75]]], legs: [[[-0.05, 0.24], [-0.07, 0]], [[0.05, 0.24], [0.07, 0]]], gaze: [0, 0]},
  slump: {H: [0.13, 0.75], S: [0.07, 0.66], P: [0, 0.44], bend: -0.05, arms: [[[0.04, 0.5], [0.07, 0.36]], [[0.1, 0.5], [0.13, 0.36]]], legs: [[[0.02, 0.22], [-0.04, 0]], [[0.07, 0.22], [0.05, 0]]], gaze: [0.2, -0.4], cross: true},
  lookup: {H: [-0.03, 0.915], S: [-0.01, 0.775], P: [0, 0.48], bend: 0.03, arms: [[[-0.13, 0.61], [-0.17, 0.48]], [[0.12, 0.61], [0.16, 0.48]]], legs: [[[-0.05, 0.24], [-0.07, 0]], [[0.05, 0.24], [0.07, 0]]], gaze: [0.3, 0.6], eyes: true},
  sit: {H: [0.04, 0.755], S: [0.02, 0.62], P: [-0.02, 0.33], bend: 0, arms: [[[0.03, 0.44], [0.17, 0.46]], [[0.08, 0.45], [0.22, 0.48]]], legs: [[[0.17, 0.33], [0.16, 0]], [[0.21, 0.32], [0.21, 0]]], gaze: [0.3, -0.1], cross: true},
  smear: {H: [0.05, 0.9], S: [0.03, 0.765], P: [0, 0.48], bend: -0.01, arms: [[[-0.07, 0.62], [-0.15, 0.52]], [[0.1, 0.63], [0.19, 0.53]]], legs: [[[-0.06, 0.25], [-0.17, 0.03]], [[0.09, 0.26], [0.15, 0]]], gaze: [0.3, 0]},
};
/** the smear's stretch: sx = the silhouette stretched back along the path, about its leading edge (lead, in h ahead
 *  of the feet); skew = the lean into the move in degrees; trail = the speed strokes' length in h */
export const SMEAR = {sx: 1.7, sy: 0.94, skew: 12, lead: 0.2, trail: 0.55};

/** A figure drawn as layers: fill, then line; halo = a paper edge under the line where it crosses a dark mass. */
export type Layer = {fill?: string; fillD?: string; d?: string; w: number; c: string; halo?: boolean};

const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const dot = (x: number, y: number) => `M${x} ${y}l0.01 0`;

type FigureEl = Extract<El, {t: 'figure'}>;

/** the figure's layers at its weight (tier) */
export function figureLayers(el: FigureEl, wt: Weight, seed: string): Layer[] {
  const pose = POSES[el.pose ?? 'stand'] ?? POSES.stand;
  const {x, y, h} = el;
  const s = el.facing === 'l' ? -1 : 1;
  const P = ([u, v]: Pt): Pt => [x + s * u * h, y - v * h];
  const C = wt.tier === 'C';
  const lineC = C ? wt.openLine : wt.line ?? wt.openLine;
  const lw = C ? 3 : wt.w;
  const torsoTone = el.fill ? wt.fill(el.fill) ?? BOARD.light : wt.tier === 'A' ? wt.tone(BOARD.dark)
    : wt.tier === 'B' ? wt.tone(BOARD.light) : C ? wt.tone(BOARD.light)
    : wt.role === 'subject' ? BOARD.dark : wt.role === 'mid' ? BOARD.light : BOARD.mid;
  const skin = C ? wt.tone(BOARD.light) : wt.role === 'far' && wt.tier === null ? BOARD.mid : wt.tone(BOARD.paper);
  const S = P(pose.S);
  const Hp = P(pose.P);
  // the torso: a bean along the line of action from shoulders to hips
  const len = Math.hypot(S[0] - Hp[0], S[1] - Hp[1]) || 1;
  const ux = (S[0] - Hp[0]) / len;
  const uy = (S[1] - Hp[1]) / len;
  const nx = -uy;
  const ny = ux;
  const fwd = nx * s >= 0 ? 1 : -1;
  const bend = pose.bend * h * fwd;
  const M: Pt = [(S[0] + Hp[0]) / 2 + nx * bend, (S[1] + Hp[1]) / 2 + ny * bend];
  const at = (p: Pt, k: number): Pt => [p[0] + nx * k, p[1] + ny * k];
  const cap = 0.035 * h;
  const bean: Pt[] = [
    [S[0] + ux * cap, S[1] + uy * cap], at(S, 0.085 * h), at(M, 0.08 * h), at(Hp, 0.07 * h),
    [Hp[0] - ux * cap, Hp[1] - uy * cap], at(Hp, -0.07 * h), at(M, -0.08 * h), at(S, -0.085 * h),
  ];
  const torso = smooth(bean, {closed: true});
  const sh = (side: number): Pt => [S[0] + nx * side * fwd * 0.075 * h - ux * 0.025 * h, S[1] + ny * side * fwd * 0.075 * h - uy * 0.025 * h];
  const hip = (side: number): Pt => [Hp[0] + nx * side * fwd * 0.035 * h, Hp[1] + ny * side * fwd * 0.035 * h];
  const hr = 0.032 * h;
  const limb = (from: Pt, [j, e]: Limb) => smooth([from, P(j), P(e)]);
  const leg = (side: number, l: Limb) => {
    const f = P(l[1]);
    return `${limb(hip(side), l)}L${f[0] + s * 0.055 * h} ${f[1]}`;
  };
  const outline = C ? undefined : lineC;
  const hand = (l: Limb): Layer => {
    const [hx, hy] = P(l[1]);
    return {fill: skin, fillD: oval(hx, hy, hr, hr), d: outline ? ellipse(hx, hy, hr, hr, {seed: `${seed}/h${hx}`, ...boardLoop(hr, true)}) : undefined,
      w: Math.min(lw, hr), c: lineC};
  };
  const [backArm, frontArm] = pose.arms;
  const [backLeg, frontLeg] = pose.legs;
  const r = 0.09 * h;
  const Hd = P(pose.H);
  const hair = C || (wt.role === 'far' && wt.tier === null) ? 'none' : el.hair ?? 'none';
  const hairC = wt.tier === 'A' || (wt.tier === null && wt.role === 'subject') ? wt.tone(BOARD.dark) : wt.tone(BOARD.mid);
  const HP = (u: number, v: number): Pt => [Hd[0] + s * u * r, Hd[1] + v * r];
  const behind: Layer[] = [];
  const hairCap: Layer[] = [];
  if (hair !== 'none') {
    const back = hair === 'long'
      ? smooth([HP(-0.1, -0.95), HP(-0.9, -0.55), HP(-1.12, 0.35), HP(-1.0, 1.35), HP(-0.45, 1.55), HP(0.05, 0.8)], {closed: true})
      : oval(...HP(-0.82, -0.78), 0.4 * r, 0.4 * r);
    behind.push({fill: hairC, fillD: back, d: outline ? back : undefined, w: lw, c: lineC});
    const arc: Pt[] = [];
    for (let a = -70; a >= -215; a -= 15) arc.push(HP(1.05 * Math.cos((a * Math.PI) / 180), 1.05 * Math.sin((a * Math.PI) / 180)));
    const capD = smooth([...arc, HP(-0.3, -0.3)], {closed: true});
    hairCap.push({fill: hairC, fillD: capD, d: outline ? capD : undefined, w: lw, c: lineC});
  }
  const layers: Layer[] = [
    {d: leg(-1, backLeg), w: lw, c: lineC},
    {d: leg(1, frontLeg), w: lw, c: lineC},
    {d: limb(sh(-1), backArm), w: lw, c: lineC},
    hand(backArm),
    ...behind,
    {fill: torsoTone, fillD: torso, d: outline ? torso : undefined, w: lw, c: lineC},
    {fill: skin, fillD: oval(Hd[0], Hd[1], r, r), d: outline ? ellipse(Hd[0], Hd[1], r, r, {seed: `${seed}/head`, ...boardLoop(r, true)}) : undefined, w: lw, c: lineC},
    ...hairCap,
  ];
  // a face only on the mascot-like figure that asks for one (people: face 'none', no eyes: the pose acts)
  const face = el.face ?? 'none';
  if (!C && face !== 'none') {
    const dw = wt.detail;
    const fx = Hd[0] + s * r * (0.2 + 0.25 * pose.gaze[0]);
    const fy = Hd[1] - r * 0.35 * pose.gaze[1];
    const F = (u: number, v: number) => `${fx + u * r} ${fy + v * r}`;
    const ew = Math.max(dw + 3, 0.18 * r);
    layers.push({d: dot(fx - 0.28 * r, fy - 0.08 * r) + dot(fx + 0.28 * r, fy - 0.08 * r), w: ew, c: wt.tone(BOARD.ink)});
    let d = '';
    if (face === 'happy') d = `M${F(-0.26, 0.3)}Q${F(0, 0.58)} ${F(0.26, 0.3)}`;
    if (face === 'sad') d = `M${F(-0.24, 0.52)}Q${F(0, 0.3)} ${F(0.24, 0.52)}M${F(-0.44, -0.3)}L${F(-0.14, -0.44)}M${F(0.14, -0.44)}L${F(0.44, -0.3)}`;
    if (face === 'worried') d = `M${F(-0.26, 0.44)}Q${F(-0.13, 0.34)} ${F(0, 0.44)}Q${F(0.13, 0.54)} ${F(0.26, 0.44)}M${F(-0.42, -0.32)}L${F(-0.14, -0.4)}M${F(0.14, -0.4)}L${F(0.42, -0.32)}`;
    if (face === 'shock') d = oval(fx, fy + 0.44 * r, 0.12 * r, 0.15 * r) + `M${F(-0.44, -0.46)}Q${F(-0.29, -0.6)} ${F(-0.14, -0.5)}M${F(0.14, -0.5)}Q${F(0.29, -0.6)} ${F(0.44, -0.46)}`;
    if (d) layers.push({d, w: dw, c: wt.tone(BOARD.ink)});
  }
  layers.push({d: limb(sh(1), frontArm), w: lw, c: lineC, halo: !!pose.cross && torsoTone === BOARD.dark}, hand(frontArm));
  if (pose.finger) {
    const [ex, ey] = P(frontArm[0]);
    const [wx, wy] = P(frontArm[1]);
    const l = Math.hypot(wx - ex, wy - ey) || 1;
    layers.push({d: `M${wx} ${wy}L${wx + ((wx - ex) / l) * 0.075 * h} ${wy + ((wy - ey) / l) * 0.075 * h}`, w: Math.max(3, lw * 0.8), c: lineC});
  }
  if (el.pose === 'smear') {
    // three speed strokes trailing from the back of the stretched silhouette (drawn in the figure's own frame, before
    // the stretch: they stretch with it)
    const back = x - s * 0.12 * h;
    const strokes = [0.78, 0.6, 0.36].map((v, i) => {
      const yy = y - v * h;
      const L = SMEAR.trail * h * (1 - i * 0.18);
      return `M${back} ${yy}L${back - s * L} ${yy}`;
    }).join('');
    layers.unshift({d: strokes, w: Math.max(3, Math.min(lw, 5)), c: C ? wt.openLine : wt.tone(BOARD.mid)});
  }
  return layers;
}

/** the smear's SVG transform (about the figure's leading edge on the ground line) */
export function smearTf(el: FigureEl): string {
  const s = el.facing === 'l' ? -1 : 1;
  const fx = el.x + s * SMEAR.lead * el.h;
  return `translate(${fx} ${el.y}) skewX(${-s * SMEAR.skew}) scale(${SMEAR.sx} ${SMEAR.sy}) translate(${-fx} ${-el.y})`;
}
