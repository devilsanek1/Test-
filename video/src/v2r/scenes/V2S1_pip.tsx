// V2S1 helper (lane L1): PIP and its waterline BOLLARD, the `pip` slot of V2S1 "Walking out" (drawn after our bank).
// TREATMENT section 3 ("Pip", "Pip per shot" S1) and section 4; map.ts PIP V2S1 / S1_BOLLARD / PIP_RULES; STYLE section 4.
//
//   THE BOLLARD  a cast-iron mooring bollard standing on the landing (y 1234-1302), its domed cap under Pip's seat, the
//                map's S1_BOLLARD (700, 1235): 49 px across the lip, ~52 px tall; plum (CM.anchor) with its sun side
//                warm (CM.shadeWarm), ink 3.4 px (mid), ONE misregistration offset for the whole object, a short flat
//                contact shadow. Drawn at EVERY t, t < 0 included (the bare-line state under the loop seam): its fills
//                are <Fill>s inside the shot's Look cascade, so frame 0 shows it as ink on paper and the flood colours it
//                at ~f10.
//   PIP          from t = 0 only (on the loop seam S8's Pip hops onto this bollard: lane L6's request), size 100, the 3/4
//                back watcher, in colour on frame 0's bare page (ref 1's cat), idle life always (ear sway, one fold-and-
//                flick, breathing, scarf flutter, tuft and tail sway). Its beats (scene s = film s):
//     0.00       watches her behind the glass doors (straight ahead, across the canal)
//     1.25       its head follows her west along the far towpath (V2S1_clock s1HerHead)
//     4.98       "life", its ONE reaction, EARS-COVER, read from behind as a whole-silhouette change: the body ducks and
//                shrinks, the head sinks into the scarf and bows away, and a frame later the leaf ears swing up and wrap
//                over its head like two hands, tip to tip; a small tremble for ~0.6 s; it holds, then lifts the leaves
//                off and relaxes into the sit 5.55-5.81 (a flinch of empathy, never a gag)
//     5.76       it crouches; 5.90 it hops up-left into the dive: the arc stays far below y 600, right of her and out of the
//                right rail, toward (590, 1175) = S2's entry point (-70, 1270) under the push-through's own mapping
//                (S1's W meets S2's dark window at the hand-over: S2 = S1 + (-660, +95)), so the hop V2S2 starts at 6.14
//                carries on from where this one leaves the frame.
// Everything is a pure function of the scene seconds (deterministic, 60 fps; the travel moves every frame).
import React from 'react';
import {useTime, clamp, lerp, ease} from '../../lib/time';
import {useExit, useLook} from '../../lib/exit';
import {useInkScale} from '../../lib/inkComp';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {line, arc, poly} from '../../lib/sketch';
import {CM, INK_PX} from '../palette';
import * as MAP from '../world/map';
import {PipDrawing, poseParams, blendParams, applyIdle, aimAt, hopAt, flickShape, clampApex, defaultInk, FACING} from '../kit/pip';
import type {PoseParams, HopSpec} from '../kit/pip';
import {C, s1HerHead} from './V2S1_clock';

type V2 = [number, number];

// ---------------------------------------------------------------- the contract of this part

/** Pip's seat (feet anchor, on the bollard's cap), size, facing, seed. */
export const S1_PIP = {
  seat: MAP.S1_BOLLARD,
  size: 100,
  facing: FACING.back,
  seed: 'pipS1',
  /** Where Pip sits on SCREEN on frame 0 (the 1.05 pull-out about W): the spot S8's seam Pip lands on (lane L6). */
  f0Screen: MAP.s1Screen(MAP.S1_BOLLARD, 0),
  f0Size: 100 * MAP.s1Zoom(0),
} as const;

/** The beats (scene seconds). */
export const S1_PIP_T = {
  /** The head leaves the doorway and follows her. */
  follow: C.pipHeadFollows,
  /** Ears-cover on "life" (4.98 audible): the body ducks first (4.96), the ears follow a frame later; in by ~5.10. */
  duck: C.life - 0.02,
  duckDur: 0.09,
  ears: C.life - 0.005,
  earsDur: 0.12,
  /** The tremble after the cover lands. */
  tremble: C.life + 0.05,
  trembleDur: 0.6,
  /** It lifts the leaves off (5.55) and the body rises after them. */
  relaxEars: 5.55,
  relaxEarsDur: 0.24,
  relaxBody: 5.58,
  relaxBodyDur: 0.23,
  /** The hop: crouch 5.76, take-off 5.90. */
  hop: C.pipHopsUpLeft,
  crouch: 0.14,
  hopDur: 0.3,
  /** The one idle fold-and-flick: in the widest gap between story beats (G2 2.53 ... G3 3.20). */
  flick: 2.86,
} as const;

/** The hop's landing (feet, world px): S2's entry point (-70, 1270) mapped back through the push-through. */
export const S1_PIP_HOP_TO: V2 = [-70 + (MAP.W.x - MAP.S2.herDarkWindow.x), 1270 - (MAP.S2.herDarkWindow.y - MAP.W.y)];

// ---------------------------------------------------------------- Pip's ears-cover

/** The body's half of the flinch: it hunches, the head sinks into the scarf and bows, the tail tucks, the scarf tails
 *  drop limp (the eyes shut, though from behind we never see them). */
const COVER_BODY: Partial<PoseParams> = {
  hunch: 0.6,
  headDrop: 14,
  lookUp: -0.45,
  trunkCurl: 1.3,
  trunkRaise: -8,
  tailAngle: -3,
  tailCurl: 1,
  tailLen: 0.72,
  scarfLift: 0.18,
  eyes: 0,
};
/** The ears' half: from behind, the two leaves swing up and wrap over the crown, tip to tip, like hands over the head. */
const COVER_EARS: Partial<PoseParams> = {
  earDroopA: -122,
  earDroopB: -122,
  earSwingA: 12,
  earSwingB: 12,
  earFoldA: 0,
  earFoldB: 0,
};
/** How much smaller the whole silhouette gets in the cover (1 = none). */
const COVER_SHRINK = 0.92;

const pickParams = (from: PoseParams, keys: Partial<PoseParams>): Partial<PoseParams> => {
  const o: Partial<PoseParams> = {};
  for (const k of Object.keys(keys) as (keyof PoseParams)[]) o[k] = from[k];
  return o;
};

/** 0..1 weights of the cover at t: the body (ducks first, rises last) and the ears (up a frame later, off first). */
export const s1CoverAt = (t: number): {body: number; ears: number} => {
  const T = S1_PIP_T;
  const body = ease.outCubic(clamp((t - T.duck) / T.duckDur)) * (1 - ease.inOutCubic(clamp((t - T.relaxBody) / T.relaxBodyDur)));
  const ears = ease.outCubic(clamp((t - T.ears) / T.earsDur)) * (1 - ease.inOutCubic(clamp((t - T.relaxEars) / T.relaxEarsDur)));
  return {body, ears};
};

/** The gaze target (world px): her behind the doors, then her, walking west (blended over 0.3 s from 1.25). */
const DOORWAY: V2 = s1HerHead(0);
const gazeAt = (t: number): V2 => {
  if (t <= S1_PIP_T.follow) return DOORWAY;
  const k = ease.inOutCubic(clamp((t - S1_PIP_T.follow) / 0.3));
  const h = s1HerHead(t);
  return [lerp(DOORWAY[0], h[0], k), lerp(DOORWAY[1], h[1], k)];
};

/** The hop spec (the arc's apex clamped to stay at y >= 600, the caption band's margin: PIP_RULES.arcMinY). */
const HOP: HopSpec = (() => {
  const from: V2 = [S1_PIP.seat.x, S1_PIP.seat.y];
  const height = clampApex(from, S1_PIP_HOP_TO, 100, MAP.PIP_RULES.arcMinY);
  return {t0: S1_PIP_T.hop, dur: S1_PIP_T.hopDur, from, to: S1_PIP_HOP_TO, height, style: 'tuck', crouch: S1_PIP_T.crouch, land: 0.2};
})();

export type S1PipState = {x: number; y: number; size: number; params: PoseParams; squash: number; rotate: number};

/** Pip's whole state at scene time t (pure). */
export function s1PipAt(t: number): S1PipState {
  const T = S1_PIP_T;
  const base = poseParams('sit');
  base.yaw = S1_PIP.facing;
  // ---- the ears-cover (the one reaction): the body and the ears on their own weights (overlapping action)
  const kc = s1CoverAt(t);
  let p = base;
  if (kc.body > 0) p = {...p, ...pickParams(blendParams(base, {...base, ...COVER_BODY}, kc.body), COVER_BODY)};
  if (kc.ears > 0) p = {...p, ...pickParams(blendParams(base, {...base, ...COVER_EARS}, kc.ears), COVER_EARS)};
  let x = S1_PIP.seat.x;
  let y = S1_PIP.seat.y;
  const size = S1_PIP.size * lerp(1, COVER_SHRINK, kc.body);
  // the flinch: a quick downward jolt as it ducks, then the body stays hunched
  let squash = 0.08 * Math.sin(Math.PI * clamp((t - T.duck) / 0.15));
  let rotate = 0;
  // ---- the hop (crouch, take-off stretch, the arc, side-on in the air, the ears' follow-through)
  let air = 0;
  if (t >= HOP.t0 - (HOP.crouch ?? 0.12)) {
    const st = hopAt(t, HOP);
    x = st.x;
    y = st.y;
    squash += st.squash;
    rotate = st.rotate;
    air = st.air;
    if (st.crouch > 0) p = blendParams(p, {...poseParams(st.phase === 'land' ? 'land' : 'crouch'), yaw: p.yaw, look: p.look, wind: p.wind}, st.crouch * 0.8);
    if (st.air > 0) p = blendParams(p, {...poseParams(st.airborne), yaw: st.dir < 0 ? FACING.left : FACING.right, look: 0, wind: -st.dir}, st.air);
    p = {...p, earDroopA: p.earDroopA + st.earKick, earDroopB: p.earDroopB + st.earKick * 0.85};
  }
  // ---- the head follows her (it bows and turns away from her in the cover; side-on in the air)
  {
    const a = aimAt([x, y - size * 0.74], gazeAt(t));
    const wLook = (1 - 0.7 * kc.body) * (1 - air);
    const wUp = (1 - kc.body) * (1 - air);
    p = {...p, look: lerp(p.look, a.look, wLook), lookUp: lerp(p.lookUp, Math.max(p.lookUp, a.lookUp), wUp)};
  }
  // ---- the one idle fold-and-flick (ear B = the screen-right leaf from behind)
  {
    const k = flickShape(t - T.flick);
    if (k) p = {...p, earDroopB: p.earDroopB - 30 * k, earSwingB: p.earSwingB + 14 * k, earFoldB: p.earFoldB + 0.35 * Math.max(0, k)};
  }
  // ---- the tremble after the cover lands (~0.6 s, 12.5 Hz, decaying): the body shivers, the leaves quiver
  {
    const dt = t - T.tremble;
    if (dt >= 0 && dt < T.trembleDur) {
      const env = clamp(dt / 0.05) * Math.exp(-dt * 2.4) * (1 - clamp((dt - T.trembleDur + 0.1) / 0.1));
      x += 1.5 * env * Math.sin(dt * 12.5 * Math.PI * 2);
      const q = 2.6 * env * Math.sin(dt * 12.5 * Math.PI * 2 + 1.3);
      p = {...p, earDroopA: p.earDroopA + q, earDroopB: p.earDroopB - q};
    }
  }
  // ---- idle life, always (the scheduled flick is ours, above)
  p = applyIdle(p, t, S1_PIP.seed, {amount: 1, flick: false});
  return {x, y, size, params: p, squash, rotate};
}

/** Pip (from t = 0). */
const S1PipFigure: React.FC = () => {
  const t = useTime();
  const exit = useExit();
  const look = useLook();
  const inkScale = useInkScale();
  if (t < 0) return null;
  const s = s1PipAt(t);
  return (
    <PipDrawing
      x={s.x}
      y={s.y}
      size={s.size}
      params={s.params}
      squash={s.squash}
      rotate={s.rotate}
      draw={1}
      exit={exit}
      paint="colour"
      inkPx={defaultInk(s.size) * inkScale}
      seed={S1_PIP.seed}
      drawInk={look.ink}
    />
  );
};

// ---------------------------------------------------------------- the bollard

/** The bollard's profile (world px): levels and half-widths. EY = the ellipse ratio of its round sections seen from
 *  our seated eye height (its cap sits ~270 px under the horizon at f 1400 px: ~11 deg down). The crown stands 2.5 px
 *  proud of Pip's seat (1235): Pip's pebble rests a hair into the dome, so it sits ON it. */
const BOL = {
  x: S1_PIP.seat.x,
  crown: S1_PIP.seat.y - 2.5,
  EY: 0.19,
  dome: {y: 1243.5, r: 20},
  lip: {y0: 1243.5, y1: 1250, r: 24.5},
  ring: {y: 1261, r: 18.4},
  body: {y0: 1251.5, y1: 1276.5, r0: 16.8, r1: 19.6},
  foot: {y: 1284, r: 23},
} as const;
const BOL_OFF: [number, number] = [1.5, 1.5];

/** Half an ellipse (the front, lower half) as points: from the left end to the right end through the front. */
const frontHalf = (cx: number, cy: number, rx: number, ry: number, n = 10): V2[] => {
  const out: V2[] = [];
  for (let i = 0; i <= n; i++) {
    const a = Math.PI - (Math.PI * i) / n;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
};
/** The back (upper) half of an ellipse, left to right. */
const backHalf = (cx: number, cy: number, rx: number, ry: number, n = 10): V2[] => frontHalf(cx, cy, rx, ry, n).map(([px, py]) => [px, 2 * cy - py] as V2);
const pts = (P: V2[]) => P.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('');

const bollardPaths = () => {
  const {x, crown, EY, dome, lip, body, foot} = BOL;
  // ---- fills (every sub-shape winds clockwise on screen, so one path is their union)
  // the post: body + the flared foot, its front edge on the ground an ellipse arc
  const post = pts([
    [x - body.r0, body.y0],
    [x + body.r0, body.y0],
    [x + body.r1, body.y1],
    [x + foot.r, foot.y],
    ...frontHalf(x, foot.y, foot.r, foot.r * EY).reverse().slice(1, -1),
    [x - foot.r, foot.y],
    [x - body.r1, body.y1],
  ]) + 'Z';
  // the lip (the flange under the cap): its top face, its front
  const lipD = pts([...backHalf(x, lip.y0, lip.r, lip.r * EY), ...frontHalf(x, lip.y1, lip.r, lip.r * EY).reverse()]) + 'Z';
  // the dome: its silhouette over the crown and its base's front half-ellipse on the lip's top face
  const domeH = dome.y - crown;
  const domeTop: V2[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = Math.PI + (Math.PI * i) / 16;
    domeTop.push([x + Math.cos(a) * dome.r, dome.y + Math.sin(a) * domeH]);
  }
  const domeD = pts([...domeTop, ...frontHalf(x, dome.y, dome.r, dome.r * EY).reverse().slice(1)]) + 'Z';
  // the sun side (west, screen left; the sun is low behind the wing's west end): a warm band down the post, the lip's
  // top face and its west end; on the dome a shoulder catching the light
  const litLow =
    pts([[x - body.r0 + 0.5, body.y0 + 1], [x - body.r0 + 7, body.y0 + 1], [x - body.r1 + 8, body.y1], [x - foot.r + 8, foot.y + 2], [x - foot.r + 0.8, foot.y]]) + 'Z' +
    pts([...backHalf(x, lip.y0, lip.r - 1, (lip.r - 1) * EY), ...frontHalf(x, lip.y0, lip.r - 1, (lip.r - 1) * EY).reverse()]) + 'Z' +
    pts([[x - lip.r + 0.5, lip.y0 + 1], [x - lip.r + 5.5, lip.y0 + 2.5], [x - lip.r + 5.5, lip.y1 + 2.5], [x - lip.r + 0.5, lip.y1]]) + 'Z';
  const litDome = pts([...domeTop.slice(1, 7), [x - dome.r * 0.3, dome.y - domeH * 0.55], [x - dome.r * 0.78, dome.y - 1]]) + 'Z';
  // a short contact shadow on the landing (flat colour, never ink), to the lower right (away from the low west sun)
  const shadow = pts([
    [x - foot.r + 3, foot.y + 1],
    [x + foot.r, foot.y - 1],
    [x + foot.r + 16, foot.y + 3.5],
    [x + foot.r + 8, foot.y + 8.5],
    [x - foot.r + 12, foot.y + 7.5],
  ]) + 'Z';
  // ---- ink: what carries form (the cap's curve, the flange, the post's west side, the ring, the ground line), small
  // overshoots, the east side and the ground line left partly open
  const M = INK_PX.mid;
  const F = INK_PX.far;
  const ink: {d: string; w: number}[] = [
    {d: arc(x, dome.y, dome.r, domeH, 184, 356, {seed: 'bolDome'}), w: M},
    {d: arc(x, lip.y0, lip.r, lip.r * EY, 168, 12, {seed: 'bolLipTop'}), w: F},
    {d: arc(x, lip.y1, lip.r + 0.6, lip.r * EY, 178, 2, {seed: 'bolLipBot'}), w: M},
    {d: line(x - lip.r - 0.3, lip.y0 - 0.5, x - lip.r - 0.6, lip.y1 + 0.5, {seed: 'bolLipW', over: [1.5, 1]}), w: M},
    {d: line(x + lip.r + 0.2, lip.y0 + 1, x + lip.r + 0.4, lip.y1 - 0.5, {seed: 'bolLipE', over: [0.5, 0]}), w: M},
    {d: poly([[x - body.r0, body.y0 + 2], [x - body.r1, body.y1], [x - foot.r, foot.y]], {seed: 'bolPostW', joined: true, jitter: 0.3}), w: M},
    {d: poly([[x + body.r0, body.y0 + 4], [x + body.r1 - 0.2, body.y1 - 4]], {seed: 'bolPostE', joined: true, jitter: 0.3}), w: M},
    {d: line(x + body.r1 + 0.6, body.y1 + 1.5, x + foot.r, foot.y - 0.5, {seed: 'bolFootE', over: [0, 1]}), w: M},
    {d: arc(x, BOL.ring.y, BOL.ring.r, BOL.ring.r * EY, 170, 10, {seed: 'bolRing'}), w: F},
    {d: arc(x, foot.y, foot.r + 0.8, foot.r * EY, 180, 45, {seed: 'bolGround'}), w: M},
  ];
  return {post, lipD, domeD, litLow, litDome, shadow, ink};
};
const BOLLARD = bollardPaths();

/** The waterline bollard (every t, t < 0 included). */
const S1Bollard: React.FC = () => (
  <>
    <Fill d={BOLLARD.shadow} color={CM.stoneShade} offset={false} seed="s1bolShadow" />
    <Fill d={BOLLARD.post + BOLLARD.lipD} color={CM.anchor} offset={BOL_OFF} seed="s1bolPlum" />
    <Fill d={BOLLARD.litLow} color={CM.shadeWarm} offset={BOL_OFF} seed="s1bolLit" />
    <Fill d={BOLLARD.domeD} color={CM.anchor} offset={BOL_OFF} seed="s1bolDome" />
    <Fill d={BOLLARD.litDome} color={CM.shadeWarm} offset={BOL_OFF} seed="s1bolDomeLit" />
    {BOLLARD.ink.map((k, i) => (
      <Ink key={i} d={k.d} width={k.w} seed={`s1bolInk${i}`} />
    ))}
  </>
);

// ---------------------------------------------------------------- the slot

/** Pip and its bollard. The `pip` slot (drawn after the steps). */
export const S1Pip: React.FC = () => (
  <>
    <S1Bollard />
    <S1PipFigure />
  </>
);
