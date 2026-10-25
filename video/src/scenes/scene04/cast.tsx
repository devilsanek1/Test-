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
import {PIP_AT as S03_PIP_AT} from '../scene03/cast';
import {CAM_LOCK as S03_CAM, toScreen as s03Screen} from '../scene03/camera';
import type {Beats} from './beats';
import {camMat, Cam, K_REST, toScreen, toWorld} from './camera';

// ---------------------------------------------------------------- Pip

/** Pip's on-screen scale at the cut (S03: 1.2 under its 1.04 lock zoom) and his world scale under this camera. */
const PIP_SCREEN = 1.2 * S03_CAM.zoom;
export const PIP_WORLD_SCALE = PIP_SCREEN / K_REST.zoom;
/** Where S03 leaves him: crouching on the blueprint stamp's rump, S03's PIP_AT under S03's lock camera (screen
 *  (410.0, 1438.4) today). Imported, so the hand-off cannot drift when S03 moves him. */
export const PIP_CUT_SCREEN: Pt = s03Screen(S03_CAM, S03_PIP_AT);
export const PIP_FROM: Pt = toWorld(K_REST, PIP_CUT_SCREEN);
/** His spot on step 2's tread, at its left end (his tail at the step's edge): the L5 tag hangs right of him, almost
 *  straight under lock4, its blank bottom-left corner behind his head. */
export const PIP_AT: Pt = [218, STOOP.step2[1]];
/** The sleeping ear (sleep pose, local px at scale 1, feet = (0, 0)), measured on the pose. */
export const SLEEP_EAR: Pt = [14, -25];

type PipState = {x: number; y: number; squash: number; rotate: number; pose: PoseName; expression?: Expression; amount?: number; look?: number; flip?: boolean};

function pipState(t: number, b: Beats): PipState {
  const crouchFrom = b.pipCrouch; // S03 pops him to stand-side and crouches from cut(it)-0.12
  const air = b.this - b.pipTakeOff;
  if (t < b.pipTakeOff) {
    // S03's crouch, continued exactly (same curve as S03's PipS03), plus the stand-side pop's settle
    const sq = 0.2 * Math.sin((Math.min(1, (t - crouchFrom) / 0.14) * Math.PI) / 2) + popSwitch(t, crouchFrom);
    return {x: PIP_FROM[0], y: PIP_FROM[1], squash: sq, rotate: 0, pose: 'stand-side', amount: 0};
  }
  // from S03's spot (already over step 2) a small settle-hop onto the tread
  const h = hop({t, t0: b.pipTakeOff, dur: air, from: {x: PIP_FROM[0], y: PIP_FROM[1]}, to: {x: PIP_AT[0], y: PIP_AT[1]}, height: 18});
  const base = {x: h.x, y: h.y, rotate: h.rotate};
  const yawnAt = b.yawn;
  const drowsyAt = b.yawn + 0.4;
  if (t < yawnAt) return {...base, squash: h.squash + popSwitch(t, yawnAt), pose: 'stand-side', amount: h.spread};
  if (t < drowsyAt) {
    // the yawn: trunk up, eyes shut, a long stretch (mouth open)
    const u = clamp((t - yawnAt) / (drowsyAt - yawnAt));
    return {...base, squash: h.squash + popSwitch(t, yawnAt) + popSwitch(t, drowsyAt) - 0.16 * Math.sin(Math.PI * Math.min(1, u * 1.25)), pose: 'trunk-up', expression: 'closed'};
  }
  if (t < b.sleep) {
    // drowsy: heavy lids, one slow nod
    const u = clamp((t - drowsyAt) / (b.sleep - drowsyAt));
    return {...base, squash: popSwitch(t, drowsyAt) + popSwitch(t, b.sleep) + 0.04 * Math.sin(Math.PI * u), rotate: 4 * Math.sin(Math.PI * u), pose: 'sit-front', expression: 'meh'};
  }
  // asleep (curls up on 'for'); breathing is the pose's own idle
  return {...base, squash: popSwitch(t, b.sleep), rotate: 0, pose: 'sleep'};
}

/** Pip's sleeping ear in WORLD coords (where the leaf lands). */
export const pipEarWorld = (): Pt => [PIP_AT[0] + SLEEP_EAR[0] * PIP_WORLD_SCALE, PIP_AT[1] + SLEEP_EAR[1] * PIP_WORLD_SCALE];

/** Pip, in screen space (render inside the world camera: this undoes it). */
export const PipS04: React.FC<{b: Beats; cam: Cam}> = ({b, cam}) => {
  const t = useTime();
  const s = pipState(t, b);
  const [sx, sy] = toScreen(cam, [s.x, s.y]);
  const scale = PIP_WORLD_SCALE * cam.zoom;
  return (
    <XG m={mat.inv(camMat(cam))}>
      <Elephant x={sx} y={sy} scale={scale} pose={s.pose} expression={s.expression} amount={s.amount} look={s.look} squash={s.squash} rotate={s.rotate} flip={s.flip} t={t} seed={3} />
    </XG>
  );
};

// ---------------------------------------------------------------- Bit

/** Bit sits on lock4's box top (its right half), in plain sight: 16 world = 24 px on screen at the 1.5 zoom (the size
 *  from which his eye gets a pupil, so the 'like' blink reads; fix round 1: 16 px was a speck on a phone). */
const LOCK_TOP = STOOP.lock4.y - STOOP.lock4.h / 2;
export const BIT_AT: Pt = [STOOP.lock4.x + 7, LOCK_TOP];
export const BIT_SIZE = 16;
/** The hop on 'bug': take-off 0.10 s early (ENGINE rule 5) so the apex lands on the word; 1.2 body lengths high. */
const HOP_DUR = 0.3;
export const bitHopAt = (b: Beats) => b.bug - 0.1;

/** Bit: a hop on 'bug' (anticipation, apex on the word, landing squash), an ink attention ring around his seat on the
 *  word; on 'like' a yawn (a long stretch up, then a squash) and a blink; otherwise still. A cream misregistered
 *  under-print (offset down-right) separates the ink beetle from the teal door behind him. */
export const BitS04: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const h0 = bitHopAt(b);
  const lift = hopY(t, h0, HOP_DUR, 1.2 * BIT_SIZE);
  const [lsx, lsy] = landSquash(t, h0 + HOP_DUR, 0.74);
  const antic = t >= h0 - 0.07 && t < h0 ? 1 - 0.18 * Math.sin((Math.PI * (t - (h0 - 0.07))) / 0.07) : 1;
  const air = t > h0 && t < h0 + HOP_DUR;
  // 'like': the yawn (stretch up, then a settle squash)
  const y0 = b.ghosts2;
  const u = clamp((t - y0) / 0.42);
  const stretch = t >= y0 && u < 0.7 ? Math.sin(Math.PI * (u / 0.7)) : 0;
  const settle = t >= y0 + 0.29 && t < y0 + 0.42 ? Math.sin(Math.PI * ((t - y0 - 0.29) / 0.13)) : 0;
  const sx = (1 - 0.1 * stretch + 0.1 * settle) * lsx * (antic < 1 ? 2 - antic : 1);
  const sy = (1 + 0.24 * stretch - 0.12 * settle) * lsy * antic;
  const [bx, by] = BIT_AT;
  const under = bitPath(bx + 1.5, by + 0.6, BIT_SIZE * 1.06);
  return (
    <>
      <AttentionRing at={b.bug - 0.03} c={[bx + 1, by - 5]} />
      <XG m={mat.compose(mat.translate(0, lift), mat.about(mat.scale(sx, sy), bx, by))}>
        <Fill d={under} color={palette.cream} offset={false} mode="none" seed="s4/bitu" />
        <Bit x={bx} y={by} size={BIT_SIZE} blinkAt={[y0 + 0.12, y0 + 0.5]} look={air || (t >= y0 && t < y0 + 0.3) ? 'up' : 'auto'} seed="s04/bit" />
      </XG>
    </>
  );
};

/** An ink attention ring around Bit's seat on 'bug' (the lock glint as a drawn mark): a ring + three glint ticks draw on
 *  in 0.1 s, grow a little, and are gone after 0.24 s (one frame, no fade). */
const AttentionRing: React.FC<{at: number; c: Pt}> = ({at, c}) => {
  const t = useTime();
  if (t < at || t >= at + 0.24) return null;
  const k = 1 + 0.25 * E.outCubic(clamp((t - at) / 0.24));
  const r = 15 * k;
  const ring = `M${(c[0] + r).toFixed(1)} ${c[1]}A${r} ${r} 0 1 0 ${(c[0] - r).toFixed(1)} ${c[1]}A${r} ${r} 0 1 0 ${(c[0] + r).toFixed(1)} ${c[1]}`;
  let ticks = '';
  for (const a of [-140, -90, -40]) {
    const q = (a * Math.PI) / 180;
    ticks += `M${(c[0] + Math.cos(q) * (r + 4)).toFixed(1)} ${(c[1] + Math.sin(q) * (r + 4)).toFixed(1)}L${(c[0] + Math.cos(q) * (r + 10)).toFixed(1)} ${(c[1] + Math.sin(q) * (r + 10)).toFixed(1)}`;
  }
  return <Ink d={ring + ticks} at={at} dur={0.1} pace="free" width={1.7} taper={false} seed="s4/ring" />;
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
};

/** The passers-by's camera: horizon at the street's VP, lens 1.45 x a person (the shot is taken from about the stoop's
 *  top step, a little above a passer-by's eyes): a pair member on the road's edge right of the hero house is ~250-280
 *  px on screen (Pip ~150), and the heads stay under the near tree's crown. */
const GHOST_EYE = eyeLevel({horizon: VP[1], vpx: VP[0], ratio: 1.45});

/** Feet (world) of a passer-by at t (walking away along its ray to the VP at `pace` of the way per second). */
export function ghostFeet(g: GhostSpec, t: number): Pt {
  const k = 1 / (1 + (g.pace ?? 0.1) * Math.max(0, t - g.in));
  return [VP[0] + (g.x - VP[0]) * k, VP[1] + (g.y - VP[1]) * k];
}

/** Path helpers in a figure's local frame (units of its height H, feet at (0, 0), y up = negative). */
const fmt = (v: number) => v.toFixed(1);
function figPaths(H: number, ph: number, hair: PasserHair, acc: PasserAcc[]) {
  const P = (x: number, y: number) => `${fmt(x * H)} ${fmt(y * H)}`;
  // legs: closed trouser shapes, the lifted foot (heel up) alternates with the step phase
  const lift = [Math.max(0, Math.sin(ph)) * 0.04, Math.max(0, Math.sin(ph + Math.PI)) * 0.04];
  let legs = '';
  let shoes = '';
  [-1, 1].forEach((s, i) => {
    const bot = -0.035 - lift[i];
    legs += `M${P(s * 0.006, -0.5)}L${P(s * 0.122, -0.5)}L${P(s * 0.104, bot)}L${P(s * 0.03, bot)}L${P(s * 0.012, -0.41)}Z`;
    const cx = s * 0.067;
    const sh = 0.026 + lift[i] * 0.25; // a raised heel shows a little more sole
    shoes += `M${P(cx - 0.042, bot)}Q${P(cx, bot - 0.022)} ${P(cx + 0.042, bot)}L${P(cx + 0.04, bot + sh)}Q${P(cx, bot + sh + 0.01)} ${P(cx - 0.04, bot + sh)}Z`;
  });
  // the jacket: sloped shoulders from the neck, a slight waist, a soft curved hem
  const torso = `M${P(-0.13, -0.47)}C${P(-0.128, -0.53)} ${P(-0.12, -0.6)} ${P(-0.128, -0.66)}C${P(-0.138, -0.72)} ${P(-0.152, -0.745)} ${P(-0.148, -0.772)}C${P(-0.14, -0.812)} ${P(-0.08, -0.832)} ${P(-0.034, -0.842)}L${P(0.034, -0.842)}C${P(0.08, -0.832)} ${P(0.14, -0.812)} ${P(0.148, -0.772)}C${P(0.152, -0.745)} ${P(0.138, -0.72)} ${P(0.128, -0.66)}C${P(0.12, -0.6)} ${P(0.128, -0.53)} ${P(0.13, -0.47)}Q${P(0, -0.452)} ${P(-0.13, -0.47)}Z`;
  const seam = `M${P(0, -0.835)}L${P(0.002, -0.75)}M${P(-0.118, -0.535)}Q${P(-0.08, -0.528)} ${P(-0.05, -0.532)}`;
  // arms: closed sleeves from the shoulders, hanging a little outward (a sliver of air at the hands), swinging in
  // antiphase with the legs
  const arm = (s: number, swing: number) => {
    // local sleeve: u across, v down from the shoulder, rotated so the hand hangs outward (+ the swing)
    const a = ((-s * 7 + swing) * Math.PI) / 180;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    const sx0 = s * 0.13;
    const sy0 = -0.79;
    const Q = (u: number, v: number) => P(sx0 + u * c - v * sn, sy0 + u * sn + v * c);
    return `M${Q(-0.028, 0)}C${Q(-0.03, 0.1)} ${Q(-0.024, 0.2)} ${Q(-0.022, 0.29)}Q${Q(0, 0.315)} ${Q(0.022, 0.29)}C${Q(0.024, 0.2)} ${Q(0.03, 0.1)} ${Q(0.028, 0)}Z`;
  };
  const sw = Math.sin(ph) * 5;
  const phone = acc.includes('phone');
  let arms = arm(-1, sw);
  let armR = '';
  let phoneD = '';
  if (phone) {
    // on a call: the right arm bent up, hand at the ear, the phone's back to us
    const upper = `M${P(0.12, -0.815)}L${P(0.2, -0.74)}Q${P(0.225, -0.715)} ${P(0.21, -0.69)}L${P(0.165, -0.69)}L${P(0.105, -0.75)}Z`;
    const fore = `M${P(0.175, -0.7)}L${P(0.2, -0.705)}L${P(0.118, -0.9)}L${P(0.09, -0.885)}Z`;
    armR = fore + upper;
    phoneD = `M${P(0.072, -0.97)}L${P(0.112, -0.965)}L${P(0.104, -0.875)}L${P(0.066, -0.88)}Z`;
  } else arms += arm(1, -sw);
  // head (the back of it) + hair
  const hr = 0.062;
  const hc = -0.925;
  const head = `M${P(-hr, hc)}C${P(-hr, hc - 0.11)} ${P(hr, hc - 0.11)} ${P(hr, hc)}C${P(hr, hc + 0.07)} ${P(0.03, hc + 0.085)} ${P(0, hc + 0.085)}C${P(-0.03, hc + 0.085)} ${P(-hr, hc + 0.07)} ${P(-hr, hc)}Z`;
  let hairFill = '';
  let hairInk = '';
  let darkFill = '';
  if (hair === 'bun') {
    hairFill = `M${P(-0.034, hc - 0.085)}a${fmt(0.036 * H)} ${fmt(0.032 * H)} 0 1 1 ${fmt(0.068 * H)} 0a${fmt(0.036 * H)} ${fmt(0.032 * H)} 0 1 1 ${fmt(-0.068 * H)} 0Z`;
    hairInk = hairFill + `M${P(-0.04, hc - 0.05)}Q${P(-0.01, hc - 0.02)} ${P(-0.02, hc + 0.05)}M${P(0.04, hc - 0.05)}Q${P(0.012, hc - 0.02)} ${P(0.022, hc + 0.05)}`;
  } else if (hair === 'long') {
    hairFill = `M${P(-0.074, hc - 0.01)}C${P(-0.08, hc + 0.06)} ${P(-0.082, hc + 0.12)} ${P(-0.07, hc + 0.15)}L${P(0.07, hc + 0.15)}C${P(0.082, hc + 0.12)} ${P(0.08, hc + 0.06)} ${P(0.074, hc - 0.01)}Z`;
    hairInk = hairFill + `M${P(-0.028, hc + 0.04)}Q${P(-0.034, hc + 0.09)} ${P(-0.036, hc + 0.14)}M${P(0.026, hc + 0.05)}Q${P(0.03, hc + 0.1)} ${P(0.03, hc + 0.14)}`;
  } else if (hair === 'cap') {
    hairInk = `M${P(-hr, hc - 0.012)}Q${P(0, hc + 0.012)} ${P(hr, hc - 0.012)}M${P(-0.022, hc - 0.002)}Q${P(0, hc - 0.03)} ${P(0.022, hc - 0.002)}`;
    darkFill = `M${P(-0.012, hc - 0.1)}a${fmt(0.012 * H)} ${fmt(0.01 * H)} 0 1 1 ${fmt(0.024 * H)} 0a${fmt(0.012 * H)} ${fmt(0.01 * H)} 0 1 1 ${fmt(-0.024 * H)} 0Z`;
  } else if (hair === 'headphones') {
    darkFill =
      `M${P(-0.078, hc + 0.005)}C${P(-0.08, hc - 0.13)} ${P(0.08, hc - 0.13)} ${P(0.078, hc + 0.005)}L${P(0.062, hc + 0.005)}C${P(0.062, hc - 0.105)} ${P(-0.062, hc - 0.105)} ${P(-0.062, hc + 0.005)}Z` +
      `M${P(-0.094, hc - 0.02)}h${fmt(0.034 * H)}v${fmt(0.06 * H)}h${fmt(-0.034 * H)}Z` +
      `M${P(0.06, hc - 0.02)}h${fmt(0.034 * H)}v${fmt(0.06 * H)}h${fmt(-0.034 * H)}Z`;
    hairInk = `M${P(-0.03, hc - 0.04)}L${P(-0.022, hc + 0.0)}M${P(0.01, hc - 0.05)}L${P(0.014, hc - 0.01)}`;
  } else {
    hairInk = `M${P(-0.045, hc + 0.02)}l${fmt(0.012 * H)} ${fmt(0.025 * H)}M${P(-0.008, hc + 0.03)}l${fmt(0.004 * H)} ${fmt(0.028 * H)}M${P(0.035, hc + 0.02)}l${fmt(-0.008 * H)} ${fmt(0.026 * H)}`;
  }
  // accessories on the back
  let accFill = '';
  let accInk = '';
  if (acc.includes('backpack')) {
    const bp = `M${P(-0.092, -0.78)}Q${P(0, -0.81)} ${P(0.092, -0.78)}L${P(0.098, -0.56)}Q${P(0, -0.54)} ${P(-0.098, -0.56)}Z`;
    accFill += bp;
    accInk += bp + `M${P(-0.07, -0.66)}Q${P(0, -0.675)} ${P(0.07, -0.66)}`;
  }
  if (acc.includes('strap')) {
    const strap = `M${P(-0.118, -0.81)}L${P(-0.09, -0.83)}L${P(0.15, -0.545)}L${P(0.125, -0.52)}Z`;
    const bag = `M${P(0.09, -0.56)}L${P(0.215, -0.565)}L${P(0.21, -0.43)}Q${P(0.15, -0.415)} ${P(0.095, -0.43)}Z`;
    accFill += strap + bag;
    accInk += strap + bag;
  }
  return {legs, shoes, torso, seam, arms, armR, phoneD, head, hairFill, hairInk, darkFill, accFill, accInk};
}

/** One passer-by: a complete back-view line-art figure (white paper fills, ink outlines; closed trouser legs and
 *  sleeves, an identity detail), reference 1's readers (f_9.0) given legs. (x, y) = feet, H = height (world px). */
export const Passer: React.FC<{x: number; y: number; H: number; t: number; hz: number; hair: PasserHair; acc: PasserAcc[]; ink: number; seed: string}> = ({x, y, H, t, hz, hair, acc, ink, seed}) => {
  const ph = t * hz * Math.PI + rand(seed, 'ph') * 6.28;
  const bob = -Math.abs(Math.sin(ph)) * 0.012 * H;
  const sway = Math.sin(ph) * 0.006 * H;
  const g = figPaths(H, ph, hair, acc);
  const W = palette.white;
  const layer = (d: string, k: string, fill = W) =>
    d ? (
      <React.Fragment key={k}>
        <Fill d={d} color={fill} offset={false} mode="none" seed={`${seed}/${k}f`} />
        <Ink d={d} width={ink} taper={false} seed={`${seed}/${k}i`} />
      </React.Fragment>
    ) : null;
  return (
    <XG m={mat.translate(x + sway, y + bob)}>
      {layer(g.legs, 'lg')}
      <Fill d={g.shoes} color={palette.ink} offset={false} mode="none" seed={`${seed}/sh`} />
      {layer(g.torso, 'to')}
      <Ink d={g.seam} width={ink * 0.7} taper={false} seed={`${seed}/se`} />
      {layer(g.accFill ? g.accInk : '', 'ac')}
      {layer(g.arms, 'ar')}
      {layer(g.head, 'hd')}
      {g.hairFill ? <Fill d={g.hairFill} color={W} offset={false} mode="none" seed={`${seed}/hf`} /> : null}
      {g.hairInk ? <Ink d={g.hairInk} width={ink * 0.8} taper={false} seed={`${seed}/hi`} /> : null}
      {g.darkFill ? <Fill d={g.darkFill} color={palette.ink} offset={false} mode="none" seed={`${seed}/dk`} /> : null}
      {layer(g.armR, 'aR')}
      {layer(g.phoneD, 'ph')}
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
          <XG key={g.seed} m={mat.about(mat.scale(sc), fx, fy)}>
            <Passer x={fx} y={fy} H={H} t={t} hz={g.hz ?? 1.9} hair={g.hair} acc={g.acc ?? []} ink={g.depth === 'hair' ? SI.hair : SI.far} seed={g.seed} />
          </XG>
        );
      })}
    </>
  );
};

/** The road's left edge (the left row's foot line) at world y: feet must be at or right of it. */
const roadEdgeX = (y: number) => 520 + ((1370 - y) / (1370 - VP[1])) * (VP[0] - 520);

/** The passers-by. At most two on screen at any frame, never on top of each other: the pair on 'was' (rule-5 leads),
 *  far flickers up the road on alternate tears when no pair is there, the striding pair on 'like'. Every one's feet are
 *  on the road at the base of the left row, right of the hero house (screen x ~825-990), behind the planter. */
export function ghostList(b: Beats, tears: number[]): GhostSpec[] {
  const out: GhostSpec[] = [
    // 'was': a pair, walking away up the street (one near the hero house's corner, one a step ahead and farther)
    {x: roadEdgeX(1328) + 6, y: 1328, in: b.ghosts1 - 0.1, out: tears[1], seed: 'g4a', pace: 0.08, hz: 1.9, hair: 'short', acc: ['backpack']},
    {x: roadEdgeX(1285) + 25, y: 1285, in: b.ghosts1 - 0.06, out: tears[2], seed: 'g4b', pace: 0.08, hz: 2.1, hair: 'long', acc: ['strap']},
    // 'like': a second pair strides past (faster legs, faster into depth)
    {x: roadEdgeX(1322) + 6, y: 1322, in: b.ghosts2 - 0.1, out: tears[8], seed: 'g4c', pace: 0.16, hz: 2.8, hair: 'headphones', acc: []},
    {x: roadEdgeX(1281) + 25, y: 1281, in: b.ghosts2 - 0.05, out: tears[9], seed: 'g4d', pace: 0.16, hz: 2.9, hair: 'bun', acc: ['phone']},
  ];
  // the time-lapse flickers: far up the road (half size, hair ink), one at a time, only while at most one pair member is
  // on screen
  const flick = [1, 2, 9, 10, 11, 12, 13];
  const hairs: PasserHair[] = ['cap', 'bun', 'short', 'long', 'headphones', 'short', 'cap'];
  flick.forEach((i, k) => {
    const ta = tears[i];
    if (ta === undefined) return;
    const r = (q: string) => rand('s4ghost', `${i}${q}`);
    const y = lerp(1228, 1246, r('y'));
    // consecutive flickers swap in the same frame (one at a time: a time-lapse jump), a lone one lives 0.1 s
    const next = flick[k + 1] === i + 1 ? tears[i + 1] : ta + 0.1;
    out.push({x: roadEdgeX(y) + lerp(8, 20, r('x')), y, in: ta, out: next, seed: `g4t${i}`, pace: 0.2, hz: 2.4, depth: 'hair', hair: hairs[k], acc: r('a') > 0.5 ? ['strap'] : []});
  });
  return out;
}

// ---------------------------------------------------------------- the leaf

/** A small orange autumn leaf: lets go of the ivy over the lintel, drifts down across door #4's teal glass (pendulum
 *  sway, a slow flip) and lands on sleeping Pip's ear (a 3-frame squash on the still camera); it stays there and rides
 *  the dive. ~30 px on screen. */
export const Leaf: React.FC<{from: Pt; to: Pt; at: number; land: number}> = ({from, to, at, land}) => {
  const t = useTime();
  if (t < at) return null;
  const u = clamp((t - at) / (land - at));
  // down with a sideways pendulum (dying out), every curve continuous into the landing (u = 1: flat, at rest)
  const sway = Math.sin(u * Math.PI * 2.5) * 16 * (1 - u);
  const x = lerp(from[0], to[0], E.inOutSine(u)) + sway;
  const y = lerp(from[1], to[1], u * (0.55 + 0.45 * u));
  const rot = -20 + 36 * Math.sin(u * Math.PI * 2.5) * (1 - u * 0.7);
  const flip = 0.74 + 0.26 * Math.cos(u * Math.PI * 3.0);
  // landing squash (the leaf settles on the ear): 2-3 frames
  const d = t - land;
  const sq = d >= 0 && d < 0.14 ? 0.3 * Math.sin(Math.PI * (d / 0.1)) * (d < 0.1 ? 1 : 0) : 0;
  const s = 10.5;
  const leaf = `M${-s} 0C${-s * 0.5} ${-s * 0.8} ${s * 0.55} ${-s * 0.75} ${s} 0C${s * 0.55} ${s * 0.75} ${-s * 0.5} ${s * 0.8} ${-s} 0Z`;
  const rib = `M${-s * 1.3} 0.6L${s * 0.75} 0M${-s * 0.1} 0L${s * 0.25} ${-s * 0.32}M${-s * 0.1} 0L${s * 0.25} ${s * 0.32}`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(1 + sq * 0.6, flip * (1 - sq)))}>
      <Fill d={leaf} color={palette.sun} offset={false} mode="none" seed="s4leaf" />
      <Ink d={leaf + rib} width={1.4} taper={false} seed="s4leafi" />
    </XG>
  );
};
