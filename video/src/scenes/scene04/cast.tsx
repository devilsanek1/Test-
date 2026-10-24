// S04 cast: Pip (S03's hop lands on step 2 on 'This', a yawn, drowsy, asleep on 'for', a leaf lands on his ear), Bit on
// lock4 in plain sight (hop on 'bug', yawn + blink on 'like', otherwise he never moves), the ink-only ghost passers-by
// (a pair on 'was', the time-lapse flicker ~1 per tear, a striding pair on 'like'), the tan leaf.
//
// Pip is drawn in SCREEN space (the mascot's ink is constant on screen; under this scene's 1.5-1.9 zoom a world-space
// Pip would ink 1.5-1.9x heavier than in S03 / S05), placed from his WORLD feet through the camera every frame and
// scaled with the zoom, so he sits on the step like everything else.

import React from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {rand} from '../../lib/rng';
import {mat, XG} from '../../lib/xf';
import type {Pt} from '../../lib/sketch';
import {Elephant, hop, popSwitch} from '../../lib/mascot';
import type {Expression, PoseName} from '../../lib/mascot';
import {Bit} from '../shared/props';
import {Person} from '../../lib/kit';
import type {Acc, Hair} from '../../lib/kit';
import {eyeLevel} from '../../lib/persp';
import {STOOP} from '../shared/sets';
import type {Beats} from './beats';
import {camMat, Cam, K_REST, toScreen, toWorld} from './camera';
import {popK} from './props';

// ---------------------------------------------------------------- Pip

/** Pip's on-screen scale at the cut (S03: 1.2 under its 1.04 lock zoom) and his world scale under this camera. */
const PIP_SCREEN = 1.2 * 1.04;
export const PIP_WORLD_SCALE = PIP_SCREEN / K_REST.zoom;
/** Where S03 leaves him: crouching at screen (337.2, 1454) facing right (BLUEPRINT.pip under S03's lock camera). */
export const PIP_FROM: Pt = toWorld(K_REST, [337.2, 1454]);
/** His spot on step 2's tread: left of the L5 tag's paper (the tag hangs from lock4 over x 306-500). */
export const PIP_AT: Pt = [238, STOOP.step2[1]];
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
  const h = hop({t, t0: b.pipTakeOff, dur: air, from: {x: PIP_FROM[0], y: PIP_FROM[1]}, to: {x: PIP_AT[0], y: PIP_AT[1]}, height: 26});
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

/** Bit sits on lock4's box top, in plain sight (16 px on screen at the 1.5 zoom). */
export const BIT_AT: Pt = [STOOP.lock4.x + 7, STOOP.lock4.y - STOOP.lock4.h / 2];
export const BIT_SIZE = 16 / 1.5;

/** Bit: hop on 'bug'; on 'like' a yawn (a long stretch up, then a squash) and a blink; otherwise still. */
export const BitS04: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const y0 = b.ghosts2; // 'like'
  const u = clamp((t - y0) / 0.42);
  const stretch = t >= y0 && u < 1 ? Math.sin(Math.PI * Math.min(1, u / 0.7)) * (u < 0.7 ? 1 : 0) : 0;
  const settle = t >= y0 + 0.29 && t < y0 + 0.42 ? Math.sin(Math.PI * ((t - y0 - 0.29) / 0.13)) : 0;
  const sx = 1 - 0.1 * stretch + 0.1 * settle;
  const sy = 1 + 0.24 * stretch - 0.12 * settle;
  return (
    <XG m={mat.about(mat.scale(sx, sy), BIT_AT[0], BIT_AT[1])}>
      <Bit x={BIT_AT[0]} y={BIT_AT[1]} size={BIT_SIZE} hopAt={b.bug} hopH={1.6} blinkAt={[y0 + 0.12, y0 + 0.5]} look={t >= y0 && t < y0 + 0.3 ? 'up' : 'auto'} seed="s04/bit" />
    </XG>
  );
};

// ---------------------------------------------------------------- ghosts

const VP = STOOP.vp;

export type GhostSpec = {
  /** Feet (world) at the pop. */
  x: number;
  y: number;
  /** In / out (local s): pop in (7 % spring), out = one-frame shrink pop. */
  in: number;
  out: number;
  /** Walk toward the VP: fraction of the way per second (depth pace). */
  pace?: number;
  hz?: number;
  seed: string;
  hair?: Hair;
  acc?: Acc[];
  depth?: 'far' | 'hair' | 'mid';
};

/** The street's eye-level camera (StoopStreet: horizon = VP.y 1060, lens 1.1 x a person). */
const EYE = eyeLevel({horizon: VP[1], vpx: VP[0]});
const GHOST_LEG = 150;

/** Feet (world) of a ghost at t (walking away along its ray to the VP at `pace` of the way per second). */
export function ghostFeet(g: GhostSpec, t: number): Pt {
  const k = 1 / (1 + (g.pace ?? 0.12) * Math.max(0, t - g.in));
  return [VP[0] + (g.x - VP[0]) * k, VP[1] + (g.y - VP[1]) * k];
}

/** Line-art back-view passers-by (white paper + ink, reference 1's line-art people): the time-lapse's ghosts. They walk
 *  away up the street, never looking at the door. `filter` picks which ones (depth sorting around the furniture). */
export const Ghosts: React.FC<{list: GhostSpec[]; filter?: (g: GhostSpec) => boolean}> = ({list, filter}) => {
  const t = useTime();
  const live = list.filter((g) => t >= g.in && t < g.out && (!filter || filter(g)));
  // far first
  live.sort((a, b) => ghostFeet(a, t)[1] - ghostFeet(b, t)[1]);
  return (
    <>
      {live.map((g) => {
        const [fx, fy] = ghostFeet(g, t);
        const s = EYE.s(fy, GHOST_LEG);
        const p = popK(t, g.in);
        const last = g.out - t < 1 / 30 + 1e-6;
        const sc = last ? 0.82 : p;
        return (
          <XG key={g.seed} m={mat.about(mat.scale(sc), fx, fy)}>
            <Person x={fx} y={EYE.hip(fy, GHOST_LEG)} s={s} legs legH={GHOST_LEG} walk={g.hz ?? 1.8} style="line" hair={g.hair} acc={g.acc ?? []} ink={g.depth === 'hair' ? 1.8 : 2.4} hero={false} rim={false} seed={g.seed} />
          </XG>
        );
      })}
    </>
  );
};

/** The ghost schedule: the pair on 'was', ~1 per tear through the time-lapse, the striding pair on 'like'. Their feet
 *  are on the pavement / street right of the stoop (screen x ~760-1000); from the L5 tag's pop on they keep right of it. */
export function ghostList(b: Beats, tears: number[]): GhostSpec[] {
  const out: GhostSpec[] = [
    // 'was': a pair, walking away up the street
    {x: 486, y: 1412, in: b.ghosts1, out: b.lapse + 0.07, seed: 'g4a', pace: 0.1, hair: 'short', acc: ['backpack']},
    {x: 588, y: 1352, in: b.ghosts1 + 0.04, out: b.lapse + 0.14, seed: 'g4b', pace: 0.12, hair: 'bun'},
    // 'like': a second pair strides past (faster legs, faster into depth)
    {x: 584, y: 1410, in: b.ghosts2, out: b.ghosts2 + 0.42, seed: 'g4c', pace: 0.32, hz: 2.6, hair: 'curly'},
    {x: 650, y: 1352, in: b.ghosts2 + 0.05, out: b.ghosts2 + 0.47, seed: 'g4d', pace: 0.32, hz: 2.6, hair: 'bun'},
  ];
  // the time-lapse flicker: one per tear (skipping the tears that the pairs cover), short lives, seeded spots
  tears.forEach((ta, i) => {
    if (i === 4 || i === 5) return; // the striding pair is on screen
    const r = (k: string) => rand('s4ghost', `${i}${k}`);
    const y = lerp(1300, 1410, r('y'));
    const afterTag = ta >= b.l5 - 0.05;
    // screen x of the feet: 770-940 before the tag, 860-960 after (clear of the tag's lettering)
    const sx = afterTag ? lerp(860, 960, r('x')) : lerp(770, 940, r('x'));
    const x = toWorld(K_REST, [sx, 0])[0];
    out.push({x, y, in: ta + 0.01, out: ta + 0.12 + r('l') * 0.12, seed: `g4t${i}`, pace: 0.2, hz: 2.2, depth: y < 1380 ? 'hair' : 'far', hair: r('h') > 0.66 ? 'bun' : r('h') > 0.33 ? 'curly' : 'short'});
  });
  return out;
}

// ---------------------------------------------------------------- the leaf

/** A small tan leaf: drifts down from the ivy toward sleeping Pip (pendulum sway, flips) and lands on his ear; it stays
 *  there (rides the world through the dive). */
export const Leaf: React.FC<{from: Pt; to: Pt; at: number; land: number}> = ({from, to, at, land}) => {
  const t = useTime();
  if (t < at) return null;
  const u = clamp((t - at) / (land - at));
  // a falling leaf: down with a sideways pendulum (dying out), slowing at each swing end; every curve is continuous
  // into the landing (u = 1: no sway, flat, at its resting tilt)
  const sway = Math.sin(u * Math.PI * 3.0) * 14 * (1 - u);
  const x = lerp(from[0], to[0], E.inOutSine(u)) + sway;
  const y = lerp(from[1], to[1], u * (0.6 + 0.4 * u));
  const rot = -24 + 40 * Math.sin(u * Math.PI * 3.0) * (1 - u * 0.6);
  const flip = 0.55 + 0.45 * Math.cos(u * Math.PI * 4.0);
  // landing squash (the leaf settles on the ear)
  const d = t - land;
  const sq = d >= 0 && d < 0.2 ? 0.25 * Math.exp(-d * 18) * Math.cos(d * 40) : 0;
  const s = 9;
  const leaf = `M${-s} 0C${-s * 0.5} ${-s * 0.75} ${s * 0.6} ${-s * 0.7} ${s} 0C${s * 0.6} ${s * 0.7} ${-s * 0.5} ${s * 0.75} ${-s} 0Z`;
  const rib = `M${-s * 1.25} 0.5L${s * 0.8} 0`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(1 + sq, flip * (1 - sq)))}>
      <Fill d={leaf} color={palette.tan} offset={false} mode="none" seed="s4leaf" />
      <Ink d={leaf + rib} width={1.3} taper={false} seed="s4leafi" />
    </XG>
  );
};
