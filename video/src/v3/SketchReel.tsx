// SketchReel: the G3 sketch animatic, drawn entirely from one JSON file (public/v3/animatic.json) so a storyboard
// revision is a data edit. Each shot: a time range, pencil elements (boxes, lines, ellipses, figures, labels, value
// fills), a rough camera move and a labelled transition in. On top: pop captions from the voice's word timings, the
// frame-0 text, the voice and sound cues, and a burned-in "G3 · shot · transition · timecode" label.
//
// Two looks (Animatic.style): 'board' (default; the studio storyboard house style, docs/look/STORYBOARD_STYLE.md §6:
// paper + 4 tones, line weight by role, gesture figures, red notation marks, notes in a strip under the stage, no
// parallax) and 'sketch' (the original warm pencil look, kept so old data renders as before).
// Board API: role 'subject' | 'mid' | 'far' on any element (default: 'subject' for fill 'pop', 'far' for f < 0.5, else
// 'mid'); sw = stroke width override; figure pose / facing / face / hair; text strike; {t: 'mark'}; camera.word; moves[].ease;
// shot.credit and frame0Credit = the small-print slot (sources, a name caption), drawn under the caption, never in the picture.
// Lint before every render: python3 scripts/v3/board_lint.py public/v3/animatic.json

import React from 'react';
import {AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {captionFontStack, useCaptionFont} from '../lib/font';
import {type Pt, arrow, boardLoop, boardPen, ellipse, hatch, line, poly, rect, smooth} from '../lib/sketch';
import {BOARD, type BoardFill, type Role, boardFill, boardTone, detailW, roleLine} from './board';
import {SketchIcon, type IconName} from './SketchIcons';

export type {Role} from './board';
/** board: paper (opaque) / light / mid / dark (dark on the subject, mid elsewhere) / pop (dark + makes the element the
 *  subject); warm and cold are the sketch names (light in board mode) */
type Fill = BoardFill;
export type Style = 'board' | 'sketch';
/** gesture-figure poses (board mode): the pose is the verb */
export type Pose = 'stand' | 'walk' | 'point' | 'reach' | 'hold' | 'shrug' | 'slump' | 'lookup' | 'sit';
/** a face only when the emotion is the beat */
export type Face = 'none' | 'happy' | 'sad' | 'shock' | 'worried';
/** a generic hair cue (board; added for v2: "is this her?"), never a likeness: 'long' = a cap over the back of the head
 *  and hair down to the shoulders, 'bun' = the cap and a bun; in the torso's tone (dark on the subject, mid elsewhere) */
export type Hair = 'none' | 'long' | 'bun';
/** f = depth factor for parallax (1 = moves with the camera, 0 = fixed far plane, > 1 = foreground); the authored end frame is exact for every f.
 *  Board mode has no parallax: f only sets the default role (far if f < 0.5). */
type Depth = {
  f?: number;
  /** board: the plane, which sets line weight and tone (subject 9 px ink + the only dark mass, mid 5 px ink, far 3 px mid grey;
   *  a far shape with a fill is a flat shape with no line unless sw is set) */
  role?: Role;
  /** stroke width override in px (rare; `w` is already a width on rect / hatch / icon) */
  sw?: number;
  /** stroke draw-on: [start, duration] in s after the shot start (the opening "scene is drawn" build) */
  draw?: [number, number];
  /** the fill floods in at this many s after the shot start (0.12 s fade); before it, lines only */
  fillIn?: number;
  /** the element pops out at this many s after the shot start (0.07 s), e.g. a highlight that leaves with its text */
  out?: number;
};
export type El = Depth & (
  | {t: 'rect'; x: number; y: number; w: number; h: number; fill?: Fill; label?: string; in?: number}
  | {t: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill?: Fill; label?: string; in?: number}
  | {t: 'line'; pts: [number, number][]; closed?: boolean; fill?: Fill; in?: number}
  | {t: 'arrow'; x1: number; y1: number; x2: number; y2: number; in?: number}
  | {t: 'hatch'; x: number; y: number; w: number; h: number; in?: number}
  /** x = between the feet, y = the ground, h = standing height (head top at y - h; sit: seat at y - 0.29 h). Board: a
   *  gesture figure (head r 0.09 h, bean torso, limb lines, mitten hands); fill = the torso tone (default: dark on the
   *  subject, light on mid, mid on far); facing default 'r'; face default 'none' (lookup shows the eyes) */
  | {t: 'figure'; x: number; y: number; h: number; pose?: Pose; facing?: 'l' | 'r'; face?: Face; hair?: Hair; fill?: Fill; in?: number}
  /** size default 64 in board (48 in sketch); strike = struck through (true, or the s after the shot start it is drawn) */
  | {t: 'text'; x: number; y: number; text: string; size?: number; strike?: boolean | number; in?: number}
  /** a recognisable pencil object fitted into the box (src/v3/SketchIcons.tsx): x, y = top-left, h defaults to the
   *  icon's natural aspect; fill = body colour (FILLS key, #hex, or 'none'; omitted = the icon's own); text = its own
   *  words (sign, price, chart title, year, chip marking); pts = chart line [[x 0..1, value 0..1], ...]; label = muted caption below */
  | {t: 'icon'; name: IconName; x: number; y: number; w: number; h?: number; fill?: Fill | 'none' | `#${string}`; label?: string;
      text?: string; pts?: [number, number][]; in?: number}
  /** the red-pencil annotation layer (5 px, drawn above everything): circle / underline / frame around the box x, y, w, h;
   *  frame = a dashed end-frame box with corner arrows (dir 'in' by default, 'out' when the word says OUT) and the move's
   *  word (PUSH IN, PULL OUT, PAN L/R, RISE, TILT UP, HOLD); at most one per panel */
  | {t: 'mark'; kind: 'circle' | 'underline' | 'frame'; x: number; y: number; w: number; h: number; word?: string; dir?: 'in' | 'out'; in?: number}
  | {t: 'mark'; kind: 'arrow'; x1: number; y1: number; x2: number; y2: number; word?: string; in?: number});
/** r = roll in degrees (CINEMATIC_GUIDE: <= 2 deg drift, <= 6 deg in action). */
type Cam = {x: number; y: number; z: number; r?: number};
/** outSine = sine ease-out: fastest at the start, peak speed only pi/2 x the average (a rise-over's near ledge, STORYBOARD_STYLE §7);
 *  [x1, y1, x2, y2] = a CSS cubic-bezier (e.g. the S5 pull-back crane's [0.55, 0.03, 0.5, 1.0], CINEMATIC_GUIDE) */
type Ease = 'inout' | 'out' | 'in' | 'linear' | 'unveil' | 'inQuad' | 'outSine' | [number, number, number, number];
export type Shot = {
  id: string;
  s: number;
  e: number;
  /** board: "line 1\nline 2" for the notes strip (line 1 = shot type, COZY / SCALE, the move; line 2 = the one idea) */
  note: string;
  /** board: a scale panel (the colossus cut by the frame, or the extreme close of the scale ladder): board-lint checks
   *  that its subject is BIG (at least 60 % of the frame width, or cut by both side edges) instead of 270-460 px */
  scale?: boolean;
  /** dur = transition length in s (dissolve default 0.2; T10 slow dissolve 0.5-0.8); dip = through dark, flash = through white. */
  transition: {type: 'cut' | 'dissolve' | 'push-through' | 'match-cut' | 'wipe' | 'dip' | 'flash'; label?: string; dur?: number};
  /** word = the slug's camera word (default from the move: PUSH IN, PULL OUT, RISE, TILT DOWN, PAN L/R, HOLD) */
  camera: {from: Cam; to: Cam; ease?: Ease; start?: number; end?: number; word?: string};
  els: El[];
  /** element moves (dx, dy in world px, from at for dur s after the shot start; several on one element add up); ease default 'inout'.
   *  s = the scale the move reaches (about the pivot o, in the coordinates the element's earlier moves leave; geometric in u, or
   *  linear with lin: true, which moves every point on a straight line from the start box to the end box): a plane of an
   *  S5 pull-back moving on one ease (STORYBOARD_STYLE §7). A scaled element keeps its role's line weight on screen
   *  (non-scaling strokes). A move with at + dur <= 0 is already done at the shot start (a constant pre-scale). */
  moves?: {el: number; dx: number; dy: number; at: number; dur: number; ease?: Ease; s?: number; o?: [number, number]; lin?: boolean}[];
  /** the small-print slot (added for v2): a source credit or a name caption, 36 px mid grey under the caption, never
   *  in the picture (e.g. "Source: BBC News, 21 Oct 2026") */
  credit?: string;
};
export type Animatic = {
  /** default 'board' */
  style?: Style;
  label: string;
  audio: string;
  durationSec: number;
  frame0: string;
  frame0Until: number;
  /** a small line under the frame-0 text, shown with it (added for v2, e.g. its source) */
  frame0Credit?: string;
  words: {w: string; s: number; e: number}[];
  sfx: {src: string; t: number; gain?: number}[];
  shots: Shot[];
};

const W = 1080;
const H = 1920;
const PAPER = '#f3ebdd';
const LEAD = '#4a443e';
const MUTED = '#8a7f72';
const FILLS: Record<Fill, string> = {warm: '#f2d49b', cold: '#bac3ce', dark: '#5b5560', paper: '#fbf6ee', pop: '#e0573a', light: '#d6d0c6', mid: '#a49b90'};
const CAPTION_TOP = 300;
/** board: the notes strip under the stage (STORYBOARD_STYLE §3) */
const NOTES_TOP = 1680;
const MAX_CHARS = 16;

// unveil = trapezoid(0.1, 0.6): accelerate over the first 10 %, cruise, decelerate over the last 60 % (Arcane's reveals)
const trapezoid = (a: number, d: number) => {
  const v = 1 / (1 - a / 2 - d / 2);
  return (u: number) => (u < a ? (v * u * u) / (2 * a) : u <= 1 - d ? v * (u - a / 2) : 1 - (v * (1 - u) * (1 - u)) / (2 * d));
};
const EASE: Record<Exclude<Ease, number[]>, (x: number) => number> = {
  inout: Easing.inOut(Easing.sin), out: Easing.out(Easing.cubic), in: Easing.in(Easing.cubic), linear: (x: number) => x,
  unveil: trapezoid(0.1, 0.6), inQuad: Easing.in(Easing.quad), outSine: Easing.out(Easing.sin),
};
const easeOf = (e: Ease = 'inout') => (Array.isArray(e) ? Easing.bezier(e[0], e[1], e[2], e[3]) : EASE[e]);

function camAt(shot: Shot, t: number): Cam {
  const {from, to, ease = 'inout', start = shot.s, end = shot.e} = shot.camera;
  const u = interpolate(t, [start, Math.max(start + 0.01, end)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOf(ease)});
  return {x: from.x + (to.x - from.x) * u, y: from.y + (to.y - from.y) * u, z: from.z + (to.z - from.z) * u,
    r: (from.r ?? 0) + ((to.r ?? 0) - (from.r ?? 0)) * u};
}

/** camera for a plane at depth factor f: the same end frame, f times the move */
function camForDepth(shot: Shot, c: Cam, f: number): Cam {
  const e = shot.camera.to;
  return {x: e.x + (c.x - e.x) * f, y: e.y + (c.y - e.y) * f, z: e.z * Math.pow(c.z / e.z, f), r: c.r};
}

const camTf = (c: Cam) => `translate(${W / 2} ${H / 2}) rotate(${c.r ?? 0}) scale(${c.z}) translate(${-c.x} ${-c.y})`;

/** A pencil path; with `u` < 1 its strokes (subpaths) draw on one after another, so multi-stroke shapes build up. */
const Pen: React.FC<{d: string; u: number; style: React.SVGProps<SVGPathElement>}> = ({d, u, style}) => {
  if (u >= 1) return <path d={d} {...style} />;
  const subs = d.split(/(?=M)/).filter((x) => x.trim());
  return (
    <>
      {subs.map((sp, k) => {
        const v = Math.max(0, Math.min(1, u * subs.length - k));
        return v <= 0 ? null : <path key={k} d={sp} {...style} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - v} />;
      })}
    </>
  );
};

/** Board strokes in layers (fill, then line), drawn on one subpath after another across all layers; halo = a paper
 *  edge under the line so it reads where it crosses a dark mass (an arm in front of the body). */
type Layer = {fill?: string; fillD?: string; d?: string; w: number; c: string; halo?: boolean};
const Layers: React.FC<{layers: Layer[]; u: number; fillO: number}> = ({layers, u, fillO}) => {
  const subsOf = layers.map((l) => (l.d ? l.d.split(/(?=M)/).filter((x) => x.trim()) : []));
  const total = Math.max(1, subsOf.reduce((n, x) => n + x.length, 0));
  let k = 0;
  return (
    <>
      {layers.map((l, li) => {
        const subs = subsOf[li];
        const k0 = k;
        k += subs.length;
        const paths = (c: string, w: number, tag: string) =>
          subs.map((sp, j) => {
            const v = u >= 1 ? 1 : Math.max(0, Math.min(1, u * total - (k0 + j)));
            if (v <= 0) return null;
            const st = {stroke: c, strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
            return v >= 1 ? <path key={tag + j} d={sp} {...st} /> : <path key={tag + j} d={sp} {...st} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - v} />;
          });
        return (
          <React.Fragment key={li}>
            {l.fill && l.fillD && fillO > 0 ? <path d={l.fillD} fill={l.fill} opacity={fillO} /> : null}
            {l.halo ? paths(BOARD.paper, l.w + 8, 'h') : null}
            {paths(l.c, l.w, 's')}
          </React.Fragment>
        );
      })}
    </>
  );
};

type Limb = [Pt, Pt];
type PoseDef = {H: Pt; S: Pt; P: Pt; bend: number; arms: [Limb, Limb]; legs: [Limb, Limb]; gaze: Pt; finger?: boolean; eyes?: boolean; cross?: boolean};
// Gesture-figure poses in units of the figure's height h: x forward (toward `facing`), y up from the feet. H = head
// centre (radius 0.09), S = shoulders, P = hips, bend = the line of action's bow (+ = the middle pushes forward);
// arms and legs are [back, front], each [elbow or knee, hand or foot]; gaze = where the eyes look (x forward, y up);
// cross = the front arm crosses the body (it gets a paper edge over a dark torso).
// scripts/v3/board_lint.py reads this table for figure boxes: keep it one plain literal.
const POSES: Record<Pose, PoseDef> = {
  stand: {H: [0, 0.91], S: [0, 0.77], P: [0, 0.48], bend: 0, arms: [[[-0.125, 0.62], [-0.16, 0.47]], [[0.125, 0.62], [0.16, 0.47]]], legs: [[[-0.05, 0.24], [-0.07, 0]], [[0.05, 0.24], [0.07, 0]]], gaze: [0, 0]},
  walk: {H: [0.05, 0.9], S: [0.03, 0.765], P: [0, 0.48], bend: -0.01, arms: [[[-0.07, 0.62], [-0.15, 0.52]], [[0.1, 0.63], [0.19, 0.53]]], legs: [[[-0.06, 0.25], [-0.17, 0.03]], [[0.09, 0.26], [0.15, 0]]], gaze: [0.3, 0]},
  point: {H: [0.02, 0.91], S: [0.01, 0.77], P: [0, 0.48], bend: 0, arms: [[[-0.09, 0.62], [-0.13, 0.47]], [[0.17, 0.75], [0.33, 0.77]]], legs: [[[-0.05, 0.24], [-0.08, 0]], [[0.05, 0.24], [0.08, 0]]], gaze: [0.4, 0], finger: true},
  reach: {H: [0.1, 0.88], S: [0.07, 0.75], P: [0, 0.48], bend: 0, arms: [[[-0.05, 0.62], [-0.14, 0.53]], [[0.22, 0.8], [0.36, 0.95]]], legs: [[[-0.04, 0.23], [-0.13, 0.01]], [[0.07, 0.25], [0.11, 0]]], gaze: [0.35, 0.3]},
  hold: {H: [0, 0.91], S: [0, 0.77], P: [0, 0.48], bend: 0, arms: [[[0.03, 0.6], [0.19, 0.64]], [[0.09, 0.59], [0.22, 0.67]]], legs: [[[-0.05, 0.24], [-0.07, 0]], [[0.05, 0.24], [0.07, 0]]], gaze: [0.3, -0.25], cross: true},
  shrug: {H: [0, 0.895], S: [0, 0.78], P: [0, 0.48], bend: 0, arms: [[[-0.16, 0.66], [-0.25, 0.75]], [[0.16, 0.66], [0.25, 0.75]]], legs: [[[-0.05, 0.24], [-0.07, 0]], [[0.05, 0.24], [0.07, 0]]], gaze: [0, 0]},
  slump: {H: [0.13, 0.75], S: [0.07, 0.66], P: [0, 0.44], bend: -0.05, arms: [[[0.04, 0.5], [0.07, 0.36]], [[0.1, 0.5], [0.13, 0.36]]], legs: [[[0.02, 0.22], [-0.04, 0]], [[0.07, 0.22], [0.05, 0]]], gaze: [0.2, -0.4], cross: true},
  lookup: {H: [-0.03, 0.915], S: [-0.01, 0.775], P: [0, 0.48], bend: 0.03, arms: [[[-0.13, 0.61], [-0.17, 0.48]], [[0.12, 0.61], [0.16, 0.48]]], legs: [[[-0.05, 0.24], [-0.07, 0]], [[0.05, 0.24], [0.07, 0]]], gaze: [0.3, 0.6], eyes: true},
  sit: {H: [0.04, 0.755], S: [0.02, 0.62], P: [-0.02, 0.33], bend: 0, arms: [[[0.03, 0.44], [0.17, 0.46]], [[0.08, 0.45], [0.22, 0.48]]], legs: [[[0.17, 0.33], [0.16, 0]], [[0.21, 0.32], [0.21, 0]]], gaze: [0.3, -0.1], cross: true},
};

const oval = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const dot = (x: number, y: number) => `M${x} ${y}l0.01 0`;

function figureLayers(el: Extract<El, {t: 'figure'}>, role: Role, seed: string): Layer[] {
  const pose = POSES[el.pose ?? 'stand'] ?? POSES.stand;
  const {x, y, h} = el;
  const s = el.facing === 'l' ? -1 : 1;
  const P = ([u, v]: Pt): Pt => [x + s * u * h, y - v * h];
  const rl = roleLine(role, el.sw);
  const tone = el.fill ? boardFill(el.fill, role) : role === 'subject' ? BOARD.dark : role === 'mid' ? BOARD.light : BOARD.mid;
  const skin = role === 'far' ? BOARD.mid : BOARD.paper;
  const S = P(pose.S);
  const Hp = P(pose.P);
  // the torso: a bean along the line of action from shoulders to hips
  const len = Math.hypot(S[0] - Hp[0], S[1] - Hp[1]) || 1;
  const ux = (S[0] - Hp[0]) / len;
  const uy = (S[1] - Hp[1]) / len;
  const nx = -uy;
  const ny = ux;
  const fwd = nx * s >= 0 ? 1 : -1; // n points forward for facing r
  const bend = pose.bend * h * fwd;
  const M: Pt = [(S[0] + Hp[0]) / 2 + nx * bend, (S[1] + Hp[1]) / 2 + ny * bend];
  const at = (p: Pt, k: number): Pt => [p[0] + nx * k, p[1] + ny * k];
  const cap = 0.035 * h;
  const bean: Pt[] = [
    [S[0] + ux * cap, S[1] + uy * cap], at(S, 0.085 * h), at(M, 0.08 * h), at(Hp, 0.07 * h),
    [Hp[0] - ux * cap, Hp[1] - uy * cap], at(Hp, -0.07 * h), at(M, -0.08 * h), at(S, -0.085 * h),
  ];
  const torso = smooth(bean, {closed: true});
  // arms leave the bean's edge just under the shoulder line; legs leave the hips (drawn behind the torso)
  const sh = (side: number): Pt => [S[0] + nx * side * fwd * 0.075 * h - ux * 0.025 * h, S[1] + ny * side * fwd * 0.075 * h - uy * 0.025 * h];
  const hip = (side: number): Pt => [Hp[0] + nx * side * fwd * 0.035 * h, Hp[1] + ny * side * fwd * 0.035 * h];
  const hr = 0.032 * h;
  const limb = (from: Pt, [j, e]: Limb) => smooth([from, P(j), P(e)]);
  const leg = (side: number, l: Limb) => {
    const f = P(l[1]);
    return `${limb(hip(side), l)}L${f[0] + s * 0.055 * h} ${f[1]}`;
  };
  const hand = (l: Limb): Layer => {
    const [hx, hy] = P(l[1]);
    return {fill: skin, fillD: oval(hx, hy, hr, hr), d: ellipse(hx, hy, hr, hr, {seed: `${seed}/h${hx}`, ...boardLoop(hr, true)}), w: Math.min(rl.w, hr), c: rl.c};
  };
  const [backArm, frontArm] = pose.arms;
  const [backLeg, frontLeg] = pose.legs;
  const r = 0.09 * h;
  const H = P(pose.H);
  // hair: u forward (toward facing), v down, in head radii; the back part goes behind the head, the cap over it
  const hair = role === 'far' ? 'none' : el.hair ?? 'none';
  const hairC = role === 'subject' ? BOARD.dark : BOARD.mid;
  const HP = (u: number, v: number): Pt => [H[0] + s * u * r, H[1] + v * r];
  const behind: Layer[] = [];
  const hairCap: Layer[] = [];
  if (hair !== 'none') {
    const back = hair === 'long'
      ? smooth([HP(-0.1, -0.95), HP(-0.9, -0.55), HP(-1.12, 0.35), HP(-1.0, 1.35), HP(-0.45, 1.55), HP(0.05, 0.8)], {closed: true})
      : oval(...HP(-0.82, -0.78), 0.4 * r, 0.4 * r);
    behind.push({fill: hairC, fillD: back, d: back, w: rl.w, c: rl.c});
    const arc: Pt[] = [];
    for (let a = -50; a >= -230; a -= 15) arc.push(HP(1.05 * Math.cos((a * Math.PI) / 180), 1.05 * Math.sin((a * Math.PI) / 180)));
    const capD = smooth([...arc, HP(-0.15, -0.12)], {closed: true});
    hairCap.push({fill: hairC, fillD: capD, d: capD, w: rl.w, c: rl.c});
  }
  const layers: Layer[] = [
    {d: leg(-1, backLeg), w: rl.w, c: rl.c},
    {d: leg(1, frontLeg), w: rl.w, c: rl.c},
    {d: limb(sh(-1), backArm), w: rl.w, c: rl.c},
    hand(backArm),
    ...behind,
    {fill: tone, fillD: torso, d: torso, w: rl.w, c: rl.c},
    {fill: skin, fillD: oval(H[0], H[1], r, r), d: ellipse(H[0], H[1], r, r, {seed: `${seed}/head`, ...boardLoop(r, true)}), w: rl.w, c: rl.c},
    ...hairCap,
  ];
  // the face: dot eyes, one brow line per eye, one mouth line (only when the emotion is the beat)
  const face = el.face ?? 'none';
  if (role !== 'far' && (face !== 'none' || pose.eyes)) {
    const dw = detailW(role);
    const fx = H[0] + s * r * (0.2 + 0.25 * pose.gaze[0]);
    const fy = H[1] - r * 0.35 * pose.gaze[1];
    const F = (u: number, v: number) => `${fx + u * r} ${fy + v * r}`;
    const ew = Math.max(dw + 3, 0.18 * r);
    layers.push({d: dot(fx - 0.28 * r, fy - 0.08 * r) + dot(fx + 0.28 * r, fy - 0.08 * r), w: ew, c: BOARD.ink});
    let d = '';
    if (face === 'happy') d = `M${F(-0.26, 0.3)}Q${F(0, 0.58)} ${F(0.26, 0.3)}`;
    if (face === 'sad') d = `M${F(-0.24, 0.52)}Q${F(0, 0.3)} ${F(0.24, 0.52)}M${F(-0.44, -0.3)}L${F(-0.14, -0.44)}M${F(0.14, -0.44)}L${F(0.44, -0.3)}`;
    if (face === 'worried') d = `M${F(-0.26, 0.44)}Q${F(-0.13, 0.34)} ${F(0, 0.44)}Q${F(0.13, 0.54)} ${F(0.26, 0.44)}M${F(-0.42, -0.32)}L${F(-0.14, -0.4)}M${F(0.14, -0.4)}L${F(0.42, -0.32)}`;
    if (face === 'shock') d = oval(fx, fy + 0.44 * r, 0.12 * r, 0.15 * r) + `M${F(-0.44, -0.46)}Q${F(-0.29, -0.6)} ${F(-0.14, -0.5)}M${F(0.14, -0.5)}Q${F(0.29, -0.6)} ${F(0.44, -0.46)}`;
    if (d) layers.push({d, w: dw, c: BOARD.ink});
  }
  layers.push({d: limb(sh(1), frontArm), w: rl.w, c: rl.c, halo: !!pose.cross && tone === BOARD.dark}, hand(frontArm));
  if (pose.finger) {
    const [ex, ey] = P(frontArm[0]);
    const [wx, wy] = P(frontArm[1]);
    const l = Math.hypot(wx - ex, wy - ey) || 1;
    layers.push({d: `M${wx} ${wy}L${wx + ((wx - ex) / l) * 0.075 * h} ${wy + ((wy - ey) / l) * 0.075 * h}`, w: Math.max(3, rl.w * 0.8), c: rl.c});
  }
  return layers;
}

/** text width in px in the caption hand (exact once the font is loaded; an estimate outside a browser) */
let measureCtx: CanvasRenderingContext2D | null | undefined;
function textWidth(s: string, size: number) {
  if (measureCtx === undefined) measureCtx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  if (!measureCtx) return s.length * size * 0.5;
  measureCtx.font = `${size}px ${captionFontStack}`;
  return measureCtx.measureText(s).width;
}

const MarkView: React.FC<{el: Extract<El, {t: 'mark'}>; seed: string; u: number}> = ({el, seed, u}) => {
  const w = el.sw ?? 5;
  const st = {stroke: BOARD.red, strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const pen = {breaks: false, jitter: 0.5, drift: 0.2};
  const word = (x: number, y: number, anchor: 'start' | 'middle' | 'end') =>
    el.word ? <text x={x} y={y} fontSize={48} fill={BOARD.red} textAnchor={anchor} fontFamily={captionFontStack}>{el.word}</text> : null;
  if (el.kind === 'arrow') {
    const {x1, y1, x2, y2} = el;
    const l = Math.hypot(x2 - x1, y2 - y1) || 1;
    return (
      <>
        <Pen d={arrow(x1, y1, x2, y2, {seed, head: 34, ...pen})} u={u} style={st} />
        {word(x1 - ((x2 - x1) / l) * 24, y1 - ((y2 - y1) / l) * 24 + 16, x2 >= x1 ? 'end' : 'start')}
      </>
    );
  }
  const {x, y, w: bw, h: bh} = el;
  if (el.kind === 'circle') {
    const rx = bw / 2 + 22;
    const ry = bh / 2 + 22;
    const cx = x + bw / 2;
    const cy = y + bh / 2;
    return (
      <>
        <Pen d={ellipse(cx, cy, rx, ry, {seed, wobble: 0.03, overlap: 18})} u={u} style={st} />
        {word(cx + rx * 0.72, cy - ry * 0.72 - 14, 'start')}
      </>
    );
  }
  if (el.kind === 'underline') {
    const ly = y + bh + 14;
    return (
      <>
        <Pen d={line(x - 8, ly, x + bw + 8, ly, {seed, over: [0, 0], bow: 4, ...pen})} u={u} style={st} />
        {word(x + bw / 2, ly + 56, 'middle')}
      </>
    );
  }
  // frame: the planned end frame, dashed, with an arrow at each corner and the move's word
  const out = el.dir ? el.dir === 'out' : /OUT/i.test(el.word ?? '');
  const L = Math.max(50, Math.min(120, 0.18 * Math.min(bw, bh)));
  const corners: [number, number, number, number][] = [[x, y, -1, -1], [x + bw, y, 1, -1], [x + bw, y + bh, 1, 1], [x, y + bh, -1, 1]];
  const arrows = corners
    .map(([cx, cy, sx, sy], k) => {
      const ox = (sx * Math.SQRT1_2);
      const oy = (sy * Math.SQRT1_2);
      const [a, b] = out ? [12, 12 + L] : [12 + L, 12];
      return arrow(cx + ox * a, cy + oy * a, cx + ox * b, cy + oy * b, {seed: `${seed}/c${k}`, head: 22, ...pen});
    })
    .join('');
  return (
    <>
      <path d={`M${x} ${y}H${x + bw}V${y + bh}H${x}Z`} {...st} strokeDasharray="30 18" opacity={u > 0 ? 1 : 0} />
      <Pen d={arrows} u={u} style={st} />
      {y > 80 ? word(x + 4, y - 18, 'start') : word(x + 16, y + 60, 'start')}
    </>
  );
};

const FILL_KEYS = new Set<string>(Object.keys(FILLS));
/** the element's plane: role, or 'subject' for a pop fill, 'far' for f < 0.5, else 'mid' */
export const roleOf = (el: El): Role =>
  el.role ?? ('fill' in el && el.fill === 'pop' ? 'subject' : el.f !== undefined && el.f < 0.5 ? 'far' : 'mid');

const Element: React.FC<{el: El; t: number; shot: Shot; i: number; board: boolean}> = ({el, t, shot, i, board}) => {
  const gone = el.out === undefined ? 1 : interpolate(t - shot.s, [el.out, el.out + 0.07], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const appear = gone * (el.in === undefined ? 1 : interpolate(t - shot.s, [el.in, el.in + 0.1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  if (appear <= 0) return null;
  let dx = 0;
  let dy = 0;
  // scale moves compose in list order (SVG applies the list right to left); translation-only moves just add up
  const tfs: string[] = [];
  let scaled = false;
  for (const m of shot.moves ?? []) {
    if (m.el !== i) continue;
    const u = interpolate(t - shot.s, [m.at, m.at + m.dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: easeOf(m.ease)});
    if (m.s !== undefined && m.s !== 1) {
      const S = m.lin ? 1 + (m.s - 1) * u : Math.pow(m.s, u);
      const [ox, oy] = m.o ?? [0, 0];
      tfs.unshift(`translate(${ox + m.dx * u} ${oy + m.dy * u}) scale(${S}) translate(${-ox} ${-oy})`);
      scaled = true;
    } else if (scaled) {
      tfs.unshift(`translate(${m.dx * u} ${m.dy * u})`);
    } else {
      dx += m.dx * u;
      dy += m.dy * u;
    }
  }
  const seed = `${shot.id}-${i}`;
  const local = t - shot.s;
  const drawU = el.draw ? interpolate(local, [el.draw[0], el.draw[0] + Math.max(0.01, el.draw[1])], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const fillO = el.fillIn === undefined ? 1 : interpolate(local, [el.fillIn, el.fillIn + 0.12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const role = roleOf(el);
  const rl = roleLine(role, el.sw);
  const subject = role === 'subject';
  const stroke = board
    ? {stroke: rl.c, strokeWidth: rl.w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const}
    : {stroke: LEAD, strokeWidth: el.sw ?? 4, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const pen = board ? boardPen(subject) : {};
  const fillC = (f?: Fill) => (f === undefined ? undefined : board ? boardFill(f, role) : FILLS[f]);
  // board: a far shape with a (non-paper) fill is a flat tone with no line, unless sw asks for one
  const flat = (fc?: string) => board && role === 'far' && el.sw === undefined && !!fc && fc !== BOARD.paper;
  const label = (x: number, top: number, bottom: number, s?: string) =>
    !s ? null : board
      ? <text x={x} y={bottom + 62} fontSize={60} fill={BOARD.ink} textAnchor="middle" fontFamily={captionFontStack}>{s}</text>
      : <text x={x} y={(top + bottom) / 2 + 12} fontSize={34} fill={MUTED} textAnchor="middle" fontFamily={captionFontStack}>{s}</text>;
  let body: React.ReactNode = null;
  switch (el.t) {
    case 'rect': {
      const fc = fillC(el.fill);
      body = (
        <>
          {fc && <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={fc} opacity={fillO} />}
          {!flat(fc) && <Pen d={rect(el.x, el.y, el.w, el.h, {seed, ...pen})} u={drawU} style={stroke} />}
          {label(el.x + el.w / 2, el.y, el.y + el.h, el.label)}
        </>
      );
      break;
    }
    case 'ellipse': {
      const fc = fillC(el.fill);
      body = (
        <>
          {fc && <ellipse cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} fill={fc} opacity={fillO} />}
          {!flat(fc) && <Pen d={ellipse(el.cx, el.cy, el.rx, el.ry, {seed, ...(board ? boardLoop(Math.max(el.rx, el.ry), subject) : {})})} u={drawU} style={stroke} />}
          {label(el.cx, el.cy - el.ry, el.cy + el.ry, el.label)}
        </>
      );
      break;
    }
    case 'line': {
      const pts = el.pts;
      const fc = el.closed ? fillC(el.fill) : undefined;
      body = (
        <>
          {fc && <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={fc} opacity={fillO} />}
          {!flat(fc) && <Pen d={poly(pts, {seed, closed: el.closed, ...pen})} u={drawU} style={stroke} />}
        </>
      );
      break;
    }
    case 'arrow':
      body = <Pen d={arrow(el.x1, el.y1, el.x2, el.y2, {seed, ...(board ? {head: 12 + 2 * rl.w, breaks: false, jitter: pen.jitter, drift: pen.drift} : {})})} u={drawU} style={stroke} />;
      break;
    case 'hatch':
      body = board
        ? <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={BOARD.mid} opacity={el.fillIn !== undefined ? fillO : drawU} />
        : <Pen d={hatch(el.x, el.y, el.w, el.h, {seed})} u={drawU} style={{...stroke, strokeWidth: 2}} />;
      break;
    case 'figure': {
      if (board) {
        body = <Layers layers={figureLayers(el, role, seed)} u={drawU} fillO={fillO} />;
        break;
      }
      const r = el.h * 0.12;
      body = (
        <>
          <Pen d={ellipse(el.x, el.y - el.h + r, r, r, {seed})} u={drawU} style={stroke} />
          <Pen d={poly([[el.x - el.h * 0.16, el.y], [el.x - el.h * 0.12, el.y - el.h * 0.72], [el.x + el.h * 0.12, el.y - el.h * 0.72], [el.x + el.h * 0.16, el.y]], {seed: seed + 'b'})} u={drawU} style={stroke} />
        </>
      );
      break;
    }
    case 'text': {
      const size = el.size ?? (board ? 64 : 48);
      const col = board ? rl.c : LEAD;
      let strike: React.ReactNode = null;
      if (el.strike !== undefined && el.strike !== false) {
        const su = typeof el.strike === 'number'
          ? interpolate(local, [el.strike, el.strike + 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : drawU;
        const tw = textWidth(el.text, size);
        const sy = el.y - size * 0.3;
        const sw = el.sw ?? Math.max(board ? rl.w : 4, Math.round(size * 0.07));
        strike = su > 0 ? (
          <Pen d={line(el.x - tw / 2 - 10, sy + size * 0.06, el.x + tw / 2 + 10, sy - size * 0.06, {seed: `${seed}/x`, over: [0, 0], breaks: false, jitter: 0.5, drift: 0})}
            u={su} style={{...stroke, stroke: col, strokeWidth: sw}} />
        ) : null;
      }
      body = (
        <>
          <text x={el.x} y={el.y} fontSize={size} fill={col} textAnchor="middle" fontFamily={captionFontStack}>{el.text}</text>
          {strike}
        </>
      );
      break;
    }
    case 'icon': {
      const raw = el.fill;
      const fill = raw === undefined ? undefined : raw === 'none' ? null
        : FILL_KEYS.has(raw) ? (board ? boardFill(raw as Fill, role) : FILLS[raw as Fill])
        : board ? boardTone(raw, role) : raw;
      body = <SketchIcon name={el.name} x={el.x} y={el.y} w={el.w} h={el.h} fill={fill} text={el.text} label={el.label} pts={el.pts}
        seed={seed} drawU={drawU} fillO={fillO} t={local} board={board ? {role, sw: el.sw} : undefined} />;
      break;
    }
    case 'mark':
      body = <MarkView el={el} seed={seed} u={drawU} />;
      break;
  }
  if (scaled) {
    return <g opacity={appear} className="nss" transform={[...tfs, `translate(${dx} ${dy})`].join(' ')}>{body}</g>;
  }
  return <g opacity={appear} transform={`translate(${dx} ${dy})`}>{body}</g>;
};

/** One shot at time t. mode 'board' (default): no parallax, marks on top; 'sketch': the original look. */
export const ShotView: React.FC<{shot: Shot; t: number; mode?: Style}> = ({shot, t, mode = 'board'}) => {
  const board = mode === 'board';
  const c = camAt(shot, t);
  // the annotation layer (marks) draws above the scene; everything else keeps its order
  const order = shot.els.map((_, i) => i).sort((a, b) => Number(shot.els[a].t === 'mark') - Number(shot.els[b].t === 'mark'));
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
      <rect width={W} height={H} fill={board ? BOARD.paper : PAPER} />
      {shot.moves?.some((m) => m.s !== undefined && m.s !== 1) ? <style>{'.nss *{vector-effect:non-scaling-stroke}'}</style> : null}
      {order.map((i) => {
        const el = shot.els[i];
        return (
          <g key={i} transform={camTf(board || el.f === undefined || el.f === 1 ? c : camForDepth(shot, c, el.f))}>
            <Element el={el} t={t} shot={shot} i={i} board={board} />
          </g>
        );
      })}
    </svg>
  );
};

/** board notes strip, line 1: "S9 · <shot type, COZY / SCALE> · <move>" (the move word added unless the note names it) */
function notesLine1(shot: Shot): string {
  const head = (shot.note ?? '').split('\n')[0];
  const mv = camWord(shot.camera);
  return [shot.id, head, head.toUpperCase().includes(mv) ? '' : mv].filter(Boolean).join(' · ');
}

/** the slug's camera word: camera.word, or read from the move (zoom first, then the on-screen travel) */
export function camWord(cam: Shot['camera']): string {
  if (cam.word) return cam.word;
  const zr = cam.to.z / cam.from.z;
  if (zr > 1.03) return 'PUSH IN';
  if (zr < 0.97) return 'PULL OUT';
  const dx = (cam.to.x - cam.from.x) * cam.to.z;
  const dy = (cam.to.y - cam.from.y) * cam.to.z;
  if (Math.abs(dy) > 24 && Math.abs(dy) >= Math.abs(dx)) return dy < 0 ? 'RISE' : 'TILT DOWN';
  if (Math.abs(dx) > 24) return dx > 0 ? 'PAN R' : 'PAN L';
  return 'HOLD';
}

function pages(words: Animatic['words']) {
  const out: Animatic['words'][] = [];
  let cur: Animatic['words'] = [];
  for (const w of words) {
    const len = cur.reduce((n, x) => n + x.w.length + 1, 0) + w.w.length;
    const sentenceEnd = cur.length > 0 && /[.?!]$/.test(cur[cur.length - 1].w);
    if (cur.length && (len > MAX_CHARS || sentenceEnd)) {
      out.push(cur);
      cur = [];
    }
    cur.push(w);
  }
  if (cur.length) out.push(cur);
  return out;
}

export const SketchReel: React.FC<{data: Animatic}> = ({data}) => {
  useCaptionFont();
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const t = f / fps;
  const mode: Style = data.style ?? 'board';
  const board = mode === 'board';
  const paper = board ? BOARD.paper : PAPER;
  const ink = board ? BOARD.ink : LEAD;
  const shots = data.shots;
  const k = Math.max(0, shots.findIndex((s, i) => t >= s.s && t < (shots[i + 1]?.s ?? Infinity)));
  const shot = shots[k];
  const prev = shots[k - 1];
  const since = t - shot.s;
  const tr = shot.transition.type;
  const dur = shot.transition.dur ?? (tr === 'dissolve' ? 0.2 : tr === 'push-through' ? 0.3 : tr === 'wipe' ? 0.25 : tr === 'dip' ? 0.3 : tr === 'flash' ? 0.12 : 0);
  const inTr = prev && dur > 0 && since < dur;
  const u = inTr ? since / dur : 1;

  const ps = pages(data.words.map((w) => ({...w, w: w.w.replace(/([a-z])(\d)/i, '$1 $2')})));
  const page = t < (ps[0]?.[0].s ?? 0) ? ps[0] : ps.find((p, i) => t >= p[0].s && t < (ps[i + 1]?.[0].s ?? Infinity));
  const popD = page ? (page === ps[0] ? 99 : (t - page[0].s) * fps) : 0;
  const pop = {
    opacity: interpolate(popD, [0, 2], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
    scale: interpolate(popD, [0, 2, 5], [0.86, 1.04, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
  };
  const tc = `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
  const trText = `${tr}${shot.transition.label ? ` (${shot.transition.label})` : ''}`;

  return (
    <AbsoluteFill style={{background: paper, fontFamily: captionFontStack}}>
      <Audio src={staticFile(data.audio)} />
      {data.sfx.map((s, i) => (
        <Sequence key={i} from={Math.round(s.t * fps)}>
          <Audio src={staticFile(s.src)} volume={s.gain ?? 0.6} />
        </Sequence>
      ))}

      {inTr && tr === 'push-through' ? (
        <div style={{position: 'absolute', inset: 0, transform: `scale(${1 + 0.4 * u})`, opacity: 1 - u}}><ShotView shot={prev} t={t} mode={mode} /></div>
      ) : null}
      <div style={{position: 'absolute', inset: 0, opacity: inTr && tr !== 'wipe' && tr !== 'dip' && tr !== 'flash' ? u : 1,
        clipPath: inTr && tr === 'wipe' ? `inset(0 ${100 - u * 100}% 0 0)` : undefined}}>
        <ShotView shot={shot} t={t} mode={mode} />
      </div>
      {inTr && (tr === 'dissolve' || tr === 'wipe') ? (
        <div style={{position: 'absolute', inset: 0, opacity: tr === 'dissolve' ? 1 - u : 1, clipPath: tr === 'wipe' ? `inset(0 0 0 ${u * 100}%)` : undefined}}>
          <ShotView shot={prev} t={t} mode={mode} />
        </div>
      ) : null}

      {inTr && (tr === 'dip' || tr === 'flash') && u < 0.5 ? (
        <div style={{position: 'absolute', inset: 0}}><ShotView shot={prev} t={t} mode={mode} /></div>
      ) : null}
      {inTr && (tr === 'dip' || tr === 'flash') ? (
        <div style={{position: 'absolute', inset: 0, background: tr === 'dip' ? (board ? BOARD.ink : '#2a2420') : '#ffffff', opacity: 1 - Math.abs(2 * u - 1)}} />
      ) : null}
      {t < data.frame0Until && (
        <div style={{position: 'absolute', top: CAPTION_TOP - 160, left: 60, right: 60, textAlign: 'center', fontSize: 86, fontWeight: 700,
          lineHeight: 1.05, color: ink}}>
          {data.frame0}
          {data.frame0Credit ? <div style={{fontSize: 36, fontWeight: 400, lineHeight: 1.2, marginTop: 4, color: board ? BOARD.mid : MUTED}}>{data.frame0Credit}</div> : null}
        </div>
      )}
      {shot.credit && !(t < data.frame0Until && data.frame0Credit) ? (
        <div style={{position: 'absolute', top: CAPTION_TOP + 236, left: 60, right: 60, textAlign: 'center', fontSize: 36, lineHeight: 1.2,
          color: board ? BOARD.mid : MUTED}}>{shot.credit}</div>
      ) : null}
      {page && (
        <div style={{position: 'absolute', top: CAPTION_TOP + 80, left: 60, right: 60, textAlign: 'center', fontSize: 100, lineHeight: 1.1,
          color: ink, opacity: pop.opacity, transform: `scale(${pop.scale})`, textShadow: board ? undefined : `0 0 18px ${PAPER}, 0 0 8px ${PAPER}`}}>
          {page.map((w) => w.w).join(' ')}
        </div>
      )}

      {board ? (
        // the notes strip (y 1680-1920, STORYBOARD_STYLE §3): big words the director reads on a 25 % sheet. Line 1 (48 px ink):
        // shot id, shot type, COZY / SCALE, the camera move; line 2 (38 px ink): the one idea and the transition. The note's
        // first line (before '\n') is line 1; the move word is appended when line 1 does not name it. No label, no timecode.
        <div style={{position: 'absolute', top: NOTES_TOP, left: 0, right: 0, bottom: 0, background: BOARD.paper, borderTop: `2px solid ${BOARD.light}`}}>
          <div style={{margin: '14px 52px 0', fontSize: 48, lineHeight: 1.1, fontWeight: 700, color: BOARD.ink, display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
            {notesLine1(shot)}
          </div>
          <div style={{margin: '6px 52px 0', fontSize: 38, lineHeight: 1.15, color: BOARD.ink, display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
            {[shot.note.split('\n')[1], trText].filter(Boolean).join(' · ')}
          </div>
        </div>
      ) : (
        <>
          <div style={{position: 'absolute', bottom: 210, left: 70, right: 70, textAlign: 'center', fontSize: 34, color: MUTED, fontStyle: 'italic',
            lineHeight: 1.25, textShadow: `0 0 10px ${PAPER}`}}>{shot.note}</div>
          <div style={{position: 'absolute', top: 120, left: 60, fontSize: 30, color: MUTED}}>
            {data.label} · {shot.id} · {inTr || since < 0.6 ? trText : ''} · {tc}
          </div>
        </>
      )}
    </AbsoluteFill>
  );
};
