// S04 cast: Pip (S03's crouch continued, a small settle-hop onto step 2 on 'This', a yawn, drowsy, asleep on 'for', a
// leaf lands on his ear), Bit on lock4 in plain sight (a one-body-height hop on 'bug' with an ink attention ring, a yawn
// + blink on 'like', otherwise he never moves), the passers-by (a pair on 'was', a few far flickers through the
// time-lapse, a striding pair on 'like'), the orange leaf.
//
// Pip is drawn in SCREEN space (the mascot's ink is constant on screen; under this scene's 1.5-1.9 zoom a world-space
// Pip would ink 1.5-1.9x heavier than in S03 / S05), placed from his WORLD feet through the camera every frame and
// scaled with the zoom, so he sits on the step like everything else.

import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {rand} from '../../lib/rng';
import {mat, XG} from '../../lib/xf';
import type {Pt} from '../../lib/sketch';
import {Elephant, hop, popSwitch} from '../../lib/mascot';
import type {Expression, PoseName} from '../../lib/mascot';
import {Bit, bitPath, hopY, landSquash} from '../shared/props';
import {eyeLevel} from '../../lib/persp';
import {SI, STOOP} from '../shared/sets';
import {PIP_AT as S03_PIP_AT, PIP_CUT_FLIP} from '../scene03/cast';
import {CAM_LOCK as S03_CAM, toScreen as s03Screen} from '../scene03/camera';
import type {Beats} from './beats';
import {camMat, Cam, K_REST, toScreen, toWorld} from './camera';

// ---------------------------------------------------------------- Pip

/** Pip's on-screen scale at the cut (S03: 1.2 under its 1.04 lock zoom) and his world scale under this camera. */
const PIP_SCREEN = 1.2 * S03_CAM.zoom;
export const PIP_WORLD_SCALE = PIP_SCREEN / K_REST.zoom;
/** His on-screen scale never grows past S05's sleeping Pip (~1.30 on screen): through the dive (zoom 1.55 -> 1.9) he
 *  holds that size instead of growing to 1.58, so the match cut does not change his size (fix round, cut review). */
export const PIP_SCREEN_MAX = 1.3;
export const pipScreenScale = (cam: Cam) => Math.min(PIP_WORLD_SCALE * cam.zoom, PIP_SCREEN_MAX);
/** Where S03 leaves him: crouching on the blueprint stamp's rump, S03's PIP_AT under S03's lock camera (screen
 *  (410.0, 1438.4) today). Imported, so the hand-off cannot drift when S03 moves him. */
export const PIP_CUT_SCREEN: Pt = s03Screen(S03_CAM, S03_PIP_AT);
export const PIP_FROM: Pt = toWorld(K_REST, PIP_CUT_SCREEN);
/** His spot on step 2's tread, at its left end: the L5 tag hangs right of him, almost straight under lock4. He curls
 *  up asleep FACING LEFT (flipped), rump to the tag's blank bottom-left corner, so his head, his z's and the leaf on
 *  his crown are all left of the tag, over the door's left frame (fix round: head-to-tag crowded one 350 x 150 px spot). */
export const PIP_AT: Pt = [218, STOOP.step2[1]];
/** The sleeping crown (sleep pose, FLIPPED, local px at scale 1, feet = (0, 0)): where the leaf lands. */
export const SLEEP_CROWN: Pt = [-24, -45];

type PipState = {x: number; y: number; squash: number; rotate: number; pose: PoseName; expression?: Expression; amount?: number; look?: number; flip?: boolean};

function pipState(t: number, b: Beats): PipState {
  const crouchFrom = b.pipCrouch; // S03 pops him to stand-side and crouches from cut(it)-0.12
  const air = b.this - b.pipTakeOff;
  // fix round 2 (blocker: he flipped to face right on the cut and hopped backwards): S03 leaves him facing LEFT
  // (PIP_CUT_FLIP, the contract) and his settle-hop travels left, so he faces left from the cut through the stand, the
  // yawn and the drowsy nod into his (flipped) sleep: one facing for the whole scene. hop() already leans him along
  // his travel (screen space); the drowsy nod is mirrored with him.
  const flip = PIP_CUT_FLIP;
  const fr = (r: number) => (flip ? -r : r);
  if (t < b.pipTakeOff) {
    // S03's crouch, continued exactly (same curve as S03's PipS03), plus the stand-side pop's settle
    const sq = 0.2 * Math.sin((Math.min(1, (t - crouchFrom) / 0.14) * Math.PI) / 2) + popSwitch(t, crouchFrom);
    return {x: PIP_FROM[0], y: PIP_FROM[1], squash: sq, rotate: 0, pose: 'stand-side', amount: 0, flip};
  }
  // from S03's spot (already over step 2) a small settle-hop onto the tread
  const h = hop({t, t0: b.pipTakeOff, dur: air, from: {x: PIP_FROM[0], y: PIP_FROM[1]}, to: {x: PIP_AT[0], y: PIP_AT[1]}, height: 18});
  const base = {x: h.x, y: h.y, rotate: h.rotate, flip};
  // fix round: the yawn waits until 'was' (it fired on 'bug' beside the lock: 150 px of the brightest colour stole the
  // beat from Bit). Until then he stands settled on the step (landing squash, then the pose's idle breathing).
  const yawnAt = b.yawn;
  const drowsyAt = b.drowsy;
  if (t < yawnAt) return {...base, squash: h.squash + popSwitch(t, yawnAt), pose: 'stand-side', amount: h.spread};
  if (t < drowsyAt) {
    // the yawn: trunk up, eyes shut, a long stretch (mouth open)
    const u = clamp((t - yawnAt) / (drowsyAt - yawnAt));
    return {...base, squash: popSwitch(t, yawnAt) + popSwitch(t, drowsyAt) - 0.16 * Math.sin(Math.PI * Math.min(1, u * 1.25)), pose: 'trunk-up', expression: 'closed'};
  }
  if (t < b.sleep) {
    // drowsy: heavy lids, one slow nod
    const u = clamp((t - drowsyAt) / (b.sleep - drowsyAt));
    return {...base, squash: popSwitch(t, drowsyAt) + popSwitch(t, b.sleep) + 0.04 * Math.sin(Math.PI * u), rotate: fr(4 * Math.sin(Math.PI * u)), pose: 'sit-front', expression: 'meh'};
  }
  // asleep (curls up on 'for', still facing left); breathing is the pose's own idle
  return {...base, squash: popSwitch(t, b.sleep), rotate: 0, pose: 'sleep', flip: true};
}

/** Pip's sleeping crown in WORLD coords under camera `cam` (his screen scale is clamped in the dive, so the point is
 *  derived from his drawn size, not from the world scale): where the leaf sits. Also returns the leaf's scale factor. */
export const pipCrownWorld = (cam: Cam): {p: Pt; k: number} => {
  const ws = pipScreenScale(cam) / cam.zoom;
  return {p: [PIP_AT[0] + SLEEP_CROWN[0] * ws, PIP_AT[1] + SLEEP_CROWN[1] * ws], k: ws / PIP_WORLD_SCALE};
};

/** Pip, in screen space (render inside the world camera: this undoes it). */
export const PipS04: React.FC<{b: Beats; cam: Cam}> = ({b, cam}) => {
  const t = useTime();
  const s = pipState(t, b);
  const [sx, sy] = toScreen(cam, [s.x, s.y]);
  const scale = pipScreenScale(cam);
  return (
    <XG m={mat.inv(camMat(cam))}>
      <Elephant x={sx} y={sy} scale={scale} pose={s.pose} expression={s.expression} amount={s.amount} look={s.look} squash={s.squash} rotate={s.rotate} flip={s.flip} t={t} seed={3} />
    </XG>
  );
};

// ---------------------------------------------------------------- Bit

/** Bit sits on lock4's box top (its right half), in plain sight: 16 world = 24 px on screen at the 1.5 zoom (the size
 *  from which his eye gets a pupil, so the 'like' blink reads). */
const LOCK_TOP = STOOP.lock4.y - STOOP.lock4.h / 2;
export const BIT_AT: Pt = [STOOP.lock4.x + 7, LOCK_TOP];
export const BIT_SIZE = 16;
/** The hop on 'bug' (fix round: the most stressed word got the weakest event): take-off 0.15 s early so the APEX is on
 *  the word (HOP_DUR / 2), two body lengths high (48 px on screen). */
export const HOP_DUR = 0.3;
export const bitHopAt = (b: Beats) => b.bug - HOP_DUR / 2;
/** The 'bug' spot: a peach disc (the caption highlight's paint) with a mid-weight ink ring and five glint ticks around
 *  Bit's seat and the lock box's top (behind the lock), drawn on from w47-0.12 in 0.12 s, held 0.35 s, popped off. */
export const SPOT = {c: [330, 1112] as Pt, r: 30, lead: 0.12, draw: 0.12, hold: 0.35};
export const spotAt = (b: Beats) => b.bug - SPOT.lead;
export const spotOff = (b: Beats) => b.bug + SPOT.hold;

/** Bit: a hop on 'bug' (anticipation, apex on the word, landing squash); on 'like' a yawn (a long stretch up, then a
 *  squash) and a blink; otherwise still. A cream misregistered under-print (offset down-right) separates the ink beetle
 *  from the teal door behind him. */
export const BitS04: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const h0 = bitHopAt(b);
  const lift = hopY(t, h0, HOP_DUR, 2.0 * BIT_SIZE);
  const [lsx, lsy] = landSquash(t, h0 + HOP_DUR, 0.7);
  const antic = t >= h0 - 0.07 && t < h0 ? 1 - 0.2 * Math.sin((Math.PI * (t - (h0 - 0.07))) / 0.07) : 1;
  const air = t > h0 && t < h0 + HOP_DUR;
  // in the air: a stretch on the way up and down, round at the apex
  const u0 = air ? (t - h0) / HOP_DUR : 0;
  const st = air ? 0.16 * Math.abs(Math.cos(Math.PI * u0)) : 0;
  // 'like' (rule-5 lead): the yawn (stretch up, then a settle squash)
  const y0 = b.ghosts2 - 0.1;
  const u = clamp((t - y0) / 0.42);
  const stretch = t >= y0 && u < 0.7 ? Math.sin(Math.PI * (u / 0.7)) : 0;
  const settle = t >= y0 + 0.29 && t < y0 + 0.42 ? Math.sin(Math.PI * ((t - y0 - 0.29) / 0.13)) : 0;
  const sx = (1 - 0.1 * stretch + 0.1 * settle - st * 0.5) * lsx * (antic < 1 ? 2 - antic : 1);
  const sy = (1 + 0.24 * stretch - 0.12 * settle + st) * lsy * antic;
  const [bx, by] = BIT_AT;
  const under = bitPath(bx + 1.5, by + 0.6, BIT_SIZE * 1.06);
  return (
    <XG m={mat.compose(mat.translate(0, lift), mat.about(mat.scale(sx, sy), bx, by))}>
      <Fill d={under} color={palette.cream} offset={false} mode="none" seed="s4/bitu" />
      <Bit x={bx} y={by} size={BIT_SIZE} blinkAt={[y0 + 0.12, y0 + 0.5]} look={air || (t >= y0 && t < y0 + 0.3) ? 'up' : 'auto'} seed="s04/bit" />
    </XG>
  );
};

/** The 'bug' spot behind lock4 (draw it BEFORE the lock): a peach disc pops (20 % -> 100 %, pop spring) while a full
 *  ink ring (2.3 world = 3.4 px, the mid weight) draws on around it in 0.12 s with five glint ticks; held, then popped
 *  off (one frame at 85 %, then gone; no fade). ~90 px across on screen. */
export const BugSpot: React.FC<{at: number; off: number; word: number; k?: number}> = ({at, off, word, k: size = 1}) => {
  const t = useTime();
  if (t < at || t >= off) return null;
  const [cx, cy] = SPOT.c;
  const last = off - t < 1 / 30 + 1e-6;
  // ON the word (Bit at his apex) the spot pings once: the disc swells 12 % and the ticks flash 50 % longer (0.16 s)
  const ping = t >= word && t < word + 0.16 ? Math.sin((Math.PI * (t - word)) / 0.16) : 0;
  const k = size * (last ? 0.85 : (0.2 + 0.8 * springAt(t, at, springs.pop)) * (1 + 0.12 * ping));
  const r = SPOT.r;
  const ring = `M${(cx + r).toFixed(1)} ${cy}A${r} ${r} 0 1 0 ${(cx - r).toFixed(1)} ${cy}A${r} ${r} 0 1 0 ${(cx + r).toFixed(1)} ${cy}`;
  let ticks = '';
  const tl = 12 * (1 + 0.5 * ping);
  for (const a of [-165, -125, -90, -55, -15]) {
    const q = (a * Math.PI) / 180;
    ticks += `M${(cx + Math.cos(q) * (r + 5)).toFixed(1)} ${(cy + Math.sin(q) * (r + 5)).toFixed(1)}L${(cx + Math.cos(q) * (r + 5 + tl)).toFixed(1)} ${(cy + Math.sin(q) * (r + 5 + tl)).toFixed(1)}`;
  }
  return (
    <XG m={mat.about(mat.scale(k), cx, cy)}>
      <Fill d={`M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`} color={palette.peach} offset={false} mode="none" seed="s4/spot" />
      <Ink d={ring} at={at} dur={SPOT.draw} pace="free" width={2.3} taper={false} seed="s4/ring" />
      <Ink d={ticks} at={at + 0.04} dur={SPOT.draw} pace="free" width={2.3} taper={false} seed="s4/ticks" />
    </XG>
  );
};

/** A 3-frame glint star on lock4's box (its top-right corner) on 'bug': a cream four-point star with an ink outline
 *  pops 0 -> 1.15 -> 0.6, then gone. */
export const LockGlint: React.FC<{at: number; p: Pt; size?: number}> = ({at, p, size = 13}) => {
  const t = useTime();
  const dt = t - at;
  if (dt < 0 || dt >= 0.1) return null;
  const k = dt < 0.033 ? 0.7 : dt < 0.067 ? 1.15 : 0.6;
  const s = size;
  const w = s * 0.24;
  const star = `M0 ${-s}Q${w} ${-w} ${s} 0Q${w} ${w} 0 ${s}Q${-w} ${w} ${-s} 0Q${-w} ${-w} 0 ${-s}Z`;
  return (
    <XG m={mat.compose(mat.translate(p[0], p[1]), mat.scale(k), mat.rotate(12))}>
      <Fill d={star} color={palette.cream} offset={false} mode="none" seed="s4/gl" />
      <Ink d={star} width={1.6} taper={false} seed="s4/gli" />
    </XG>
  );
};

// ---------------------------------------------------------------- the passers-by

const VP = STOOP.vp;

export type PasserHair = 'bun' | 'short' | 'long' | 'cap' | 'headphones';
export type PasserAcc = 'strap' | 'backpack' | 'phone';

export type GhostSpec = {
  /** Feet (world) at the pop: on the road along the base of the left row (the only ground right of the stoop). */
  x: number;
  y: number;
  /** In / out (local s): pop in (20 % -> 100 %, spring), out = one-frame shrink pop. */
  in: number;
  out: number;
  /** Walk toward the VP: fraction of the way per second (depth pace). */
  pace?: number;
  /** Steps per second. */
  hz?: number;
  seed: string;
  hair: PasserHair;
  acc?: PasserAcc[];
  /** 'far' = the pairs (ink SI.far, the left row's depth); 'hair' = the far flickers up the road. */
  depth?: 'far' | 'hair';
  /** Mirrored (a back view mirrored is still a back view): the phone arm on the side toward the partner. */
  mirror?: boolean;
  /** A1 fix round (a pair read as two white blocks): one member per pair gets sand trousers or a sand bag. */
  trousers?: string;
  bag?: string;
};

/** The passers-by's camera: horizon at the street's VP, lens 1.7 x a person (the shot is taken from the stoop's top
 *  step, above a passer-by's eyes): a pair member on the road's edge right of the hero house is ~190-245 px on screen
 *  (Pip ~150). Fix round: 1.45 made the pair so wide on the road's narrow strip that the farther member stood in the
 *  right rail or hid behind the nearer one. */
const GHOST_EYE = eyeLevel({horizon: VP[1], vpx: VP[0], ratio: 1.7});

/** Feet (world) of a passer-by at t (walking away along its ray to the VP at `pace` of the way per second). */
export function ghostFeet(g: GhostSpec, t: number): Pt {
  const k = 1 / (1 + (g.pace ?? 0.1) * Math.max(0, t - g.in));
  return [VP[0] + (g.x - VP[0]) * k, VP[1] + (g.y - VP[1]) * k];
}

/** Path helpers in a figure's local frame (units of its height H, feet at (0, 0), y up = negative). Reference 1's
 *  back-view readers (f_9.0) given legs: a round head whose top and back are a HAIR MASS (hairline at the nape, strands
 *  from the crown down to it, never free dashes mid-head), the neck in two short lines into a collar band (no centre
 *  seam: from behind there is no placket), a soft bell of a jacket with round sloped shoulders, sleeves that swing with
 *  the walk, closed trouser legs and dark shoes. */
const fmt = (v: number) => v.toFixed(1);
/** Head centre / radii (units of H). */
const HC = -0.916;
const HRX = 0.06;
const HRY = 0.066;
function figPaths(H: number, ph: number, hair: PasserHair, acc: PasserAcc[]) {
  const P = (x: number, y: number) => `${fmt(x * H)} ${fmt(y * H)}`;
  const R = (v: number) => fmt(v * H);
  // ---- legs (fix round 2: they read as straight tubes): tapered trousers (hem ~70 % of the hip width) in two segments,
  // thigh and shin; on the stride the lifted leg's heel comes up (a shorter shin from behind) and its shin breaks
  // inward at the knee by up to 5 deg, so every step shows a knee
  // A1 fix round (they read as stiff white suits: tube legs, no knee at this size): the trousers taper harder (hem
  // ~50 % of the hip width) and the lifted leg's knee breaks up to 11 deg with its heel up 0.06 H
  const LIFT = 0.06;
  const lift = [Math.max(0, Math.sin(ph)) * LIFT, Math.max(0, Math.sin(ph + Math.PI)) * LIFT];
  let legs = '';
  let shoes = '';
  [-1, 1].forEach((s, i) => {
    const bot = -0.035 - lift[i];
    const th = ((s * 11 * lift[i]) / LIFT) * (Math.PI / 180); // the knee break (rad), the foot tucks toward the centre
    const kx = s * 0.066;
    const ky = -0.27;
    const rot = (x: number, y: number): [number, number] => {
      const dx = x - kx;
      const dy = y - ky;
      return [kx + dx * Math.cos(th) - dy * Math.sin(th), ky + dx * Math.sin(th) + dy * Math.cos(th)];
    };
    const aO = rot(s * 0.094, bot);
    const aI = rot(s * 0.036, bot);
    legs +=
      `M${P(s * 0.012, -0.415)}L${P(s * 0.008, -0.5)}L${P(s * 0.128, -0.5)}` +
      `C${P(s * 0.128, -0.42)} ${P(s * 0.112, -0.33)} ${P(s * 0.104, ky)}` +
      `L${P(aO[0], aO[1])}L${P(aI[0], aI[1])}L${P(s * 0.03, ky)}` +
      `C${P(s * 0.024, -0.33)} ${P(s * 0.016, -0.38)} ${P(s * 0.012, -0.415)}Z`;
    // the knee: a short crease on the lifted leg's outer edge
    if (lift[i] > LIFT * 0.45) legs += `M${P(s * 0.104, ky + 0.012)}L${P(s * 0.084, ky - 0.006)}`;
    const [cx, cyy] = rot(s * 0.065, bot);
    const sh = 0.026 + lift[i] * 0.25; // a raised heel shows a little more sole
    shoes += `M${P(cx - 0.042, cyy)}Q${P(cx, cyy - 0.02)} ${P(cx + 0.042, cyy)}L${P(cx + 0.04, cyy + sh)}Q${P(cx, cyy + sh + 0.01)} ${P(cx - 0.04, cyy + sh)}Z`;
  });
  // ---- the jacket: a soft bell (fix round 2: the hem was a flat box edge). Round sloped shoulders (radius ~0.1 H), the
  // sides in a little at the waist and out to the hem, ROUNDED hem corners and a hem that dips at the middle
  // A1 fix round: the shoulders slope in one round curve from the collar (no square top corner), the sides come in a
  // little at the waist and FLARE to the hem (no vertical box sides), the hem dips at the middle
  const half = (s: number) =>
    `C${P(s * 0.075, -0.85)} ${P(s * 0.128, -0.832)} ${P(s * 0.146, -0.77)}C${P(s * 0.156, -0.715)} ${P(s * 0.134, -0.655)} ${P(s * 0.136, -0.6)}C${P(s * 0.138, -0.545)} ${P(s * 0.16, -0.5)} ${P(s * 0.166, -0.474)}Q${P(s * 0.166, -0.456)} ${P(s * 0.138, -0.455)}`;
  const halfR = `Q${P(0.166, -0.456)} ${P(0.166, -0.474)}C${P(0.16, -0.5)} ${P(0.138, -0.545)} ${P(0.136, -0.6)}C${P(0.134, -0.655)} ${P(0.156, -0.715)} ${P(0.146, -0.77)}C${P(0.128, -0.832)} ${P(0.075, -0.85)} ${P(0.03, -0.846)}Z`;
  const torso = `M${P(-0.03, -0.846)}${half(-1)}Q${P(0, -0.428)} ${P(0.138, -0.455)}${halfR}`;
  // the neck (two short lines from under the hair into the collar) and the collar band at the nape (convex up, like
  // the kit's CollarBand: a back collar, never a V or a centre seam)
  const neck = `M${P(-0.026, -0.83)}L${P(-0.025, HC + 0.05)}M${P(0.026, -0.83)}L${P(0.025, HC + 0.05)}`;
  const collar = `M${P(-0.07, -0.828)}Q${P(0, -0.86)} ${P(0.07, -0.828)}L${P(0.074, -0.808)}Q${P(0, -0.838)} ${P(-0.074, -0.808)}Z`;
  // ---- arms: tapered sleeves from the shoulders with a sand hand, hanging a little outward and swinging +-8 deg in
  // antiphase with the legs
  const arm = (s: number, swing: number) => {
    const a = ((-s * 4 + swing) * Math.PI) / 180;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const sx0 = s * 0.132;
    const sy0 = -0.79;
    const Q = (u: number, v: number) => P(sx0 + u * c - v * sn, sy0 + u * sn + v * c);
    const sleeve = `M${Q(-0.03, -0.01)}C${Q(-0.032, 0.1)} ${Q(-0.026, 0.2)} ${Q(-0.023, 0.27)}L${Q(0.023, 0.27)}C${Q(0.026, 0.2)} ${Q(0.032, 0.1)} ${Q(0.03, -0.01)}Q${Q(0, -0.03)} ${Q(-0.03, -0.01)}Z`;
    const hand = `M${Q(-0.019, 0.268)}C${Q(-0.022, 0.3)} ${Q(-0.01, 0.318)} ${Q(0, 0.318)}C${Q(0.012, 0.318)} ${Q(0.022, 0.3)} ${Q(0.019, 0.268)}Z`;
    // fix round 2 (the sleeves' inner edges ran down the jacket like side seams): the ink is the OUTER edge, the cuff and
    // only the forearm's inner edge (the upper arm merges into the jacket's side)
    const o = s < 0 ? -1 : 1;
    const sleeveInk = `M${Q(o * 0.03, -0.01)}C${Q(o * 0.032, 0.1)} ${Q(o * 0.026, 0.2)} ${Q(o * 0.023, 0.27)}L${Q(-o * 0.023, 0.27)}L${Q(-o * 0.027, 0.15)}`;
    return {sleeve, sleeveInk, hand};
  };
  const sw = Math.sin(ph) * 8;
  const phone = acc.includes('phone');
  const aL = arm(-1, sw);
  let arms = aL.sleeve;
  let armsInk = aL.sleeveInk;
  let hands = aL.hand;
  let armR = '';
  let phoneD = '';
  if (phone) {
    // on a call: the right arm bent up, hand at the ear, the phone's back to us
    const upper = `M${P(0.118, -0.815)}C${P(0.16, -0.8)} ${P(0.2, -0.76)} ${P(0.214, -0.715)}Q${P(0.218, -0.69)} ${P(0.196, -0.684)}L${P(0.16, -0.69)}L${P(0.104, -0.752)}Z`;
    const fore = `M${P(0.172, -0.694)}L${P(0.205, -0.705)}L${P(0.124, -0.892)}L${P(0.092, -0.878)}Z`;
    armR = fore + upper;
    hands += `M${P(0.09, -0.875)}C${P(0.08, -0.9)} ${P(0.1, -0.918)} ${P(0.118, -0.905)}L${P(0.124, -0.89)}Z`;
    phoneD = `M${P(0.072, -0.975)}L${P(0.114, -0.968)}L${P(0.106, -0.878)}L${P(0.064, -0.884)}Z`;
  } else {
    const aR = arm(1, -sw);
    arms += aR.sleeve;
    armsInk += aR.sleeveInk;
    hands += aR.hand;
  }
  // ---- head (its back) + ears; the hair is a MASS over the top and back, the hairline crosses at the nape
  const head = `M${P(-HRX, HC)}C${P(-HRX, HC - HRY * 1.36)} ${P(HRX, HC - HRY * 1.36)} ${P(HRX, HC)}C${P(HRX, HC + HRY * 0.86)} ${P(0.028, HC + HRY * 1.0)} ${P(0, HC + HRY * 1.0)}C${P(-0.028, HC + HRY * 1.0)} ${P(-HRX, HC + HRY * 0.86)} ${P(-HRX, HC)}Z`;
  const ears = `M${P(-HRX + 0.003, HC + 0.004)}C${P(-HRX - 0.016, HC + 0.0)} ${P(-HRX - 0.016, HC + 0.036)} ${P(-HRX + 0.006, HC + 0.04)}M${P(HRX - 0.003, HC + 0.004)}C${P(HRX + 0.016, HC + 0.0)} ${P(HRX + 0.016, HC + 0.036)} ${P(HRX - 0.006, HC + 0.04)}`;
  // the hair mass: the skull's top + back grown by `g`, down to the hairline at `ny` (its nape point dips `dip`)
  const mass = (g: number, ny: number, dip: number) => {
    const rx = HRX + g;
    const top = HC - HRY * 1.36 - g * 1.5;
    return `M${P(-rx, ny - 0.004)}C${P(-rx - 0.002, HC - 0.02)} ${P(-rx * 0.98, top)} ${P(0, top)}C${P(rx * 0.98, top)} ${P(rx + 0.002, HC - 0.02)} ${P(rx, ny - 0.004)}C${P(rx * 0.7, ny + dip * 0.2)} ${P(0.03, ny + dip * 0.4)} ${P(0, ny + dip)}C${P(-0.03, ny + dip * 0.4)} ${P(-rx * 0.7, ny + dip * 0.2)} ${P(-rx, ny - 0.004)}Z`;
  };
  // strands: long sweeps from the crown down to the hairline (they follow the skull, so they read as hair, not features)
  const strands = (ny: number, k = 1) =>
    `M${P(-0.008, HC - 0.068)}C${P(-0.034, HC - 0.05)} ${P(-0.05 * k, HC - 0.01)} ${P(-0.046 * k, ny - 0.006)}` +
    `M${P(0.006, HC - 0.07)}C${P(0.028, HC - 0.05)} ${P(0.048 * k, HC - 0.012)} ${P(0.044 * k, ny - 0.008)}` +
    `M${P(-0.002, HC - 0.07)}C${P(-0.008, HC - 0.03)} ${P(-0.012, HC + 0.0)} ${P(-0.01, ny + 0.002)}`;
  let hairFill = '';
  let hairInk = '';
  let darkFill = '';
  let capFill = '';
  if (hair === 'short' || hair === 'headphones' || hair === 'bun') {
    const ny = HC + 0.03;
    hairFill = mass(0.005, ny, 0.018);
    hairInk = hairFill + strands(ny);
    if (hair === 'bun') {
      const bun = `M${P(-0.03, HC - 0.088)}C${P(-0.032, HC - 0.13)} ${P(0.032, HC - 0.13)} ${P(0.03, HC - 0.088)}C${P(0.03, HC - 0.07)} ${P(-0.03, HC - 0.07)} ${P(-0.03, HC - 0.088)}Z`;
      hairFill += bun;
      hairInk += bun + `M${P(-0.012, HC - 0.112)}Q${P(0.004, HC - 0.1)} ${P(0.014, HC - 0.112)}`;
    }
    if (hair === 'headphones') {
      // a band over the crown (just outside the hair), cups over the ears
      const rb = HRX + 0.016;
      const tb = HC - HRY * 1.36 - 0.026;
      darkFill =
        `M${P(-rb, HC + 0.004)}C${P(-rb, HC - 0.04)} ${P(-rb * 0.96, tb)} ${P(0, tb)}C${P(rb * 0.96, tb)} ${P(rb, HC - 0.04)} ${P(rb, HC + 0.004)}` +
        `L${P(rb - 0.012, HC + 0.004)}C${P(rb - 0.012, HC - 0.036)} ${P((rb - 0.012) * 0.96, tb + 0.012)} ${P(0, tb + 0.012)}C${P(-(rb - 0.012) * 0.96, tb + 0.012)} ${P(-(rb - 0.012), HC - 0.036)} ${P(-(rb - 0.012), HC + 0.004)}Z` +
        `M${P(-rb - 0.008, HC - 0.012)}Q${P(-rb - 0.012, HC + 0.024)} ${P(-rb - 0.004, HC + 0.05)}L${P(-rb + 0.018, HC + 0.05)}L${P(-rb + 0.018, HC - 0.016)}Z` +
        `M${P(rb + 0.008, HC - 0.012)}Q${P(rb + 0.012, HC + 0.024)} ${P(rb + 0.004, HC + 0.05)}L${P(rb - 0.018, HC + 0.05)}L${P(rb - 0.018, HC - 0.016)}Z`;
    }
  } else if (hair === 'long') {
    // long hair: one mass from the crown over the head and down past the shoulders (it hides the neck and collar),
    // three long strands, a softly uneven ends line
    const rx = HRX + 0.012;
    const top = HC - HRY * 1.36 - 0.012;
    const bot = HC + 0.18;
    hairFill = `M${P(-rx, HC)}C${P(-rx, HC - 0.04)} ${P(-rx * 0.96, top)} ${P(0, top)}C${P(rx * 0.96, top)} ${P(rx, HC - 0.04)} ${P(rx, HC)}C${P(rx + 0.006, HC + 0.08)} ${P(rx + 0.014, bot - 0.04)} ${P(rx + 0.008, bot)}Q${P(0.04, bot + 0.012)} ${P(0.012, bot - 0.004)}Q${P(-0.02, bot + 0.014)} ${P(-rx - 0.008, bot)}C${P(-rx - 0.014, bot - 0.04)} ${P(-rx - 0.006, HC + 0.08)} ${P(-rx, HC)}Z`;
    hairInk = hairFill + `M${P(-0.03, HC - 0.04)}C${P(-0.046, HC + 0.03)} ${P(-0.05, HC + 0.1)} ${P(-0.046, bot - 0.012)}M${P(0.004, HC - 0.06)}C${P(-0.004, HC + 0.02)} ${P(0.004, HC + 0.1)} ${P(0.0, bot - 0.006)}M${P(0.032, HC - 0.04)}C${P(0.048, HC + 0.03)} ${P(0.052, HC + 0.1)} ${P(0.05, bot - 0.012)}`;
  } else if (hair === 'cap') {
    // a cap over the top ~60 %: its band sags gently, the back strap is an arch cut up into it (hair shows through),
    // a button on top; a short hairline under it
    const by = HC + 0.008;
    const rx = HRX + 0.006;
    const top = HC - HRY * 1.36 - 0.01;
    capFill = `M${P(-rx, by)}C${P(-rx, HC - 0.04)} ${P(-rx * 0.96, top)} ${P(0, top)}C${P(rx * 0.96, top)} ${P(rx, HC - 0.04)} ${P(rx, by)}Q${P(0, by + 0.014)} ${P(-rx, by)}Z`;
    const ny = HC + 0.034;
    hairFill = mass(0.003, ny, 0.014);
    hairInk = hairFill;
    const aw = 0.022;
    const ab = by + 0.004;
    const archTop = by - 0.03;
    darkFill = `M${P(-0.004, top - 0.012)}a${R(0.008)} ${R(0.006)} 0 1 1 ${R(0.016)} 0a${R(0.008)} ${R(0.006)} 0 1 1 ${R(-0.016)} 0Z`;
    hairInk += `M${P(-aw, ab)}L${P(-aw, by - 0.008)}C${P(-aw, archTop)} ${P(aw, archTop)} ${P(aw, by - 0.008)}L${P(aw, ab)}M${P(-aw - 0.008, by - 0.006)}L${P(aw + 0.008, by - 0.006)}`;
  }
  // ---- accessories on the back
  let accFill = '';
  let accInk = '';
  if (acc.includes('backpack')) {
    const bp = `M${P(-0.094, -0.775)}C${P(-0.094, -0.81)} ${P(0.094, -0.81)} ${P(0.094, -0.775)}L${P(0.1, -0.575)}Q${P(0.1, -0.55)} ${P(0.07, -0.548)}L${P(-0.07, -0.548)}Q${P(-0.1, -0.55)} ${P(-0.1, -0.575)}Z`;
    accFill += bp;
    // the flap, a zip pull, and the shoulder straps running up over the shoulders
    accInk += bp + `M${P(-0.09, -0.7)}Q${P(0, -0.722)} ${P(0.09, -0.7)}M${P(0.0, -0.712)}l${R(0.004)} ${R(0.026)}M${P(-0.07, -0.8)}Q${P(-0.1, -0.84)} ${P(-0.11, -0.826)}M${P(0.07, -0.8)}Q${P(0.1, -0.84)} ${P(0.11, -0.826)}`;
  }
  if (acc.includes('strap')) {
    const strap = `M${P(-0.124, -0.8)}L${P(-0.1, -0.826)}L${P(0.152, -0.55)}L${P(0.13, -0.526)}Z`;
    const bag = `M${P(0.09, -0.565)}Q${P(0.152, -0.58)} ${P(0.216, -0.565)}L${P(0.212, -0.44)}Q${P(0.152, -0.418)} ${P(0.096, -0.436)}Z`;
    accFill += strap + bag;
    accInk += strap + bag + `M${P(0.096, -0.52)}Q${P(0.152, -0.535)} ${P(0.214, -0.52)}`;
  }
  return {legs, shoes, torso, neck, collar, arms, armsInk, hands, armR, phoneD, head, ears, hairFill, hairInk, darkFill, capFill, accFill, accInk};
}

/** One passer-by: a complete back-view line-art figure (white paper fills, ink outlines; closed trouser legs and
 *  sleeves, an identity detail), reference 1's readers (f_9.0) given legs. (x, y) = feet, H = height (world px). The
 *  upper body rolls +-1.5 deg with the gait. */
export const Passer: React.FC<{x: number; y: number; H: number; t: number; hz: number; hair: PasserHair; acc: PasserAcc[]; ink: number; seed: string; trousers?: string; bag?: string}> = ({x, y, H, t, hz, hair, acc, ink, seed, trousers = palette.white, bag = palette.white}) => {
  const ph = t * hz * Math.PI + rand(seed, 'ph') * 6.28;
  const bob = -Math.abs(Math.sin(ph)) * 0.012 * H;
  const sway = Math.sin(ph) * 0.006 * H;
  const roll = Math.sin(ph) * 1.5;
  const g = figPaths(H, ph, hair, acc);
  const W = palette.white;
  const layer = (d: string, k: string, fill: string = W, w = ink) =>
    d ? (
      <React.Fragment key={k}>
        <Fill d={d} color={fill} offset={false} mode="none" seed={`${seed}/${k}f`} />
        <Ink d={d} width={w} taper={false} seed={`${seed}/${k}i`} />
      </React.Fragment>
    ) : null;
  const long = hair === 'long';
  // fix round 2: a sand misregistered under-print on the shadow side (left, away from the sun) separates the white
  // figure from the cream road, the way Bit's under-print separates him from the door
  const UP = H * 0.008;
  return (
    <XG m={mat.translate(x + sway, y + bob)}>
      <XG m={mat.translate(-UP, UP * 0.75)}>
        <Fill d={g.legs + g.torso + g.head + (long ? g.hairFill : '')} color={palette.sand} offset={false} mode="none" seed={`${seed}/up`} />
      </XG>
      {layer(g.legs, 'lg', trousers)}
      <Fill d={g.shoes} color={palette.ink} offset={false} mode="none" seed={`${seed}/sh`} />
      <XG m={mat.about(mat.rotate(roll), 0, -0.47 * H)}>
        {layer(g.torso, 'to')}
        <Ink d={g.neck} width={ink * 0.8} taper={false} seed={`${seed}/nk`} />
        {long ? null : layer(g.collar, 'co', W, ink * 0.8)}
        {layer(g.accFill ? g.accInk : '', 'ac', bag)}
        <Fill d={g.arms} color={W} offset={false} mode="none" seed={`${seed}/arf`} />
        <Ink d={g.armsInk} width={ink} taper={false} seed={`${seed}/ari`} />
        {layer(g.hands, 'hn', palette.sand, ink * 0.8)}
        <Ink d={g.ears} width={ink * 0.8} taper={false} seed={`${seed}/ea`} />
        {layer(g.head, 'hd')}
        {g.hairFill ? <Fill d={g.hairFill} color={W} offset={false} mode="none" seed={`${seed}/hf`} /> : null}
        {g.hairInk ? <Ink d={g.hairInk} width={ink * 0.85} taper={false} seed={`${seed}/hi`} /> : null}
        {layer(g.capFill, 'cp')}
        {g.darkFill ? <Fill d={g.darkFill} color={palette.ink} offset={false} mode="none" seed={`${seed}/dk`} /> : null}
        {layer(g.armR, 'aR')}
        {layer(g.phoneD, 'ph')}
      </XG>
    </XG>
  );
};

/** The passers-by alive at t (far first). They walk away up the road, never looking at the door; pop in 20 % -> 100 %
 *  (pop spring), out in one frame (a shrink pop, then gone). */
export const Ghosts: React.FC<{list: GhostSpec[]}> = ({list}) => {
  const t = useTime();
  const live = list.filter((g) => t >= g.in && t < g.out);
  live.sort((a, b) => ghostFeet(a, t)[1] - ghostFeet(b, t)[1]);
  return (
    <>
      {live.map((g) => {
        const [fx, fy] = ghostFeet(g, t);
        const H = GHOST_EYE.height(fy);
        const last = g.out - t < 1 / 30 + 1e-6;
        const sc = last ? 0.82 : 0.2 + 0.8 * springAt(t, g.in, springs.pop);
        return (
          <XG key={g.seed} m={mat.about(mat.scale(g.mirror ? -sc : sc, sc), fx, fy)}>
            <Passer x={fx} y={fy} H={H} t={t} hz={g.hz ?? 1.9} hair={g.hair} acc={g.acc ?? []} ink={g.depth === 'hair' ? SI.hair : SI.far} seed={g.seed} trousers={g.trousers} bag={g.bag} />
          </XG>
        );
      })}
    </>
  );
};

/** The road's left edge (the left row's foot line) at world y: feet must be at or right of it. */
const roadEdgeX = (y: number) => 520 + ((1370 - y) / (1370 - VP[1])) * (VP[0] - 520);

/** The passers-by. At most two on screen at any frame: the pair on 'was' (rule-5 leads), far flickers up the road on
 *  alternate tears when no pair is there, the striding pair on 'like'. Every one's feet are on the road at the base of
 *  the left row, right of the hero house, behind the planter. Fix round: the pairs walk in a little NEARER (lower,
 *  further left on the road edge: the road edge runs right as it recedes), so each body stays at screen x <= ~945 out
 *  of the right rail while they walk away; the feet sit on the edge line (+2 / +4), the farther member half behind the
 *  nearer one's shoulder. */
export function ghostList(b: Beats, tears: number[]): GhostSpec[] {
  const out: GhostSpec[] = [
    // 'was': a pair, walking away up the street (one at the hero house's corner, one a step ahead and farther)
    {x: roadEdgeX(1338) - 4, y: 1338, in: b.ghosts1 - 0.1, out: tears[1], seed: 'g4a', pace: 0.06, hz: 1.9, hair: 'short', acc: ['backpack'], bag: palette.sand},
    {x: roadEdgeX(1290) - 4, y: 1290, in: b.ghosts1 - 0.06, out: tears[2], seed: 'g4b', pace: 0.06, hz: 2.1, hair: 'long', acc: ['strap'], trousers: palette.sand},
    // 'like': a second pair strides past (faster legs, faster into depth)
    {x: roadEdgeX(1336) - 4, y: 1336, in: b.ghosts2 - 0.1, out: tears[8], seed: 'g4c', pace: 0.12, hz: 2.8, hair: 'headphones', acc: []},
    {x: roadEdgeX(1290) - 4, y: 1290, in: b.ghosts2 - 0.05, out: tears[9], seed: 'g4d', pace: 0.12, hz: 2.9, hair: 'bun', acc: ['phone'], mirror: true, trousers: palette.sand},
  ];
  // the time-lapse flickers: up the road (hair ink), one at a time, only while at most one pair member is on screen;
  // fix round 2 (framecheck: they stood in the right rail, x ~945-985): a little nearer (y 1264-1274) and on the row's
  // foot line (-8..-12 world), so their bodies stay at screen x <= ~940
  const flick = [1, 2, 9, 10, 11, 12, 13];
  const hairs: PasserHair[] = ['cap', 'bun', 'short', 'long', 'headphones', 'short', 'cap'];
  flick.forEach((i, k) => {
    const ta = tears[i];
    if (ta === undefined) return;
    const r = (q: string) => rand('s4ghost', `${i}${q}`);
    const y = lerp(1264, 1274, r('y'));
    // consecutive flickers swap in the same frame (one at a time: a time-lapse jump), a lone one lives 0.1 s
    const next = flick[k + 1] === i + 1 ? tears[i + 1] : ta + 0.1;
    out.push({x: roadEdgeX(y) - 8 - lerp(0, 4, r('x')), y, in: ta, out: next, seed: `g4t${i}`, pace: 0.2, hz: 2.4, depth: 'hair', hair: hairs[k], acc: r('a') > 0.5 ? ['strap'] : []});
  });
  return out;
}

// ---------------------------------------------------------------- the leaf

/** The leaf's half length (world): ~40 px long on screen at the 1.5 zoom. */
const LEAF_S = 13;
const leafD = (s: number) => `M${-s} 0C${-s * 0.5} ${-s * 0.8} ${s * 0.55} ${-s * 0.75} ${s} 0C${s * 0.55} ${s * 0.75} ${-s * 0.5} ${s * 0.8} ${-s} 0Z`;
const leafRib = (s: number) => `M${-s * 1.3} 0.6L${s * 0.75} 0M${-s * 0.1} 0L${s * 0.25} ${-s * 0.32}M${-s * 0.1} 0L${s * 0.25} ${s * 0.32}`;
/** Its resting pose on Pip's crown (deg, flip). */
export const LEAF_REST = {rot: -14, flip: 0.62};

/** The last TAN autumn leaf (storyboard: tan, ink outline): lets go of the ivy on the door's left frame as the vine goes
 *  bare, drifts down (pendulum sway, a slow flip) and lands on sleeping Pip's crown (a 3-frame squash on the still
 *  camera) ~0.3 s before the dive, so it is seen at rest; then it rides his head through the dive (his drawn size, see
 *  pipCrownWorld). ~40 px on screen. */
export const Leaf: React.FC<{from: Pt; at: number; land: number; cam: Cam}> = ({from, at, land, cam}) => {
  const t = useTime();
  if (t < at) return null;
  const crown = pipCrownWorld(cam);
  const to = crown.p;
  const u = clamp((t - at) / (land - at));
  // down with a sideways pendulum (dying out), every curve continuous into the landing (u = 1: at rest)
  const sway = Math.sin(u * Math.PI * 2.5) * 14 * (1 - u);
  const x = lerp(from[0], to[0], E.inOutSine(u)) + sway;
  const y = lerp(from[1], to[1], u * (0.55 + 0.45 * u));
  const rot = lerp(-30, LEAF_REST.rot, u) + 34 * Math.sin(u * Math.PI * 2.5) * (1 - u * 0.7);
  const flip = lerp(0.74 + 0.26 * Math.cos(u * Math.PI * 3.0), LEAF_REST.flip, u * u);
  // landing squash (the leaf settles on the crown): 3 frames
  const d = t - land;
  const sq = d >= 0 && d < 0.1 ? 0.3 * Math.sin(Math.PI * (d / 0.1)) : 0;
  const s = LEAF_S * (u >= 1 ? crown.k : 1);
  return (
    <XG m={mat.compose(mat.translate(x, y - 2 * (u >= 1 ? crown.k : 1)), mat.rotate(rot), mat.scale(1 + sq * 0.6, flip * (1 - sq)))}>
      <Fill d={leafD(s)} color={palette.tan} offset={false} mode="none" seed="s4leaf" />
      <Ink d={leafD(s) + leafRib(s)} width={1.6} taper={false} seed="s4leafi" />
    </XG>
  );
};
