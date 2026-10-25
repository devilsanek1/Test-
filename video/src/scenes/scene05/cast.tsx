// S05 cast: the two research teams (two depths, varied poses, one 'tech' accessory each), the scan beams, sleeping Pip
// on the banner's bottom rail (+ S04's leaf on his ear, his hop after the messenger), Bit on the blueprint lock detail
// (+ his '!' balloon, his leap onto the messenger's collar), the floating z. The messenger: scene05/messenger.tsx.
// Everything is in S05 world px (BLUEPRINT_WALL anchors) and scene seconds. Notes: docs/scenes/S05.md.
import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {clamp, ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {ElephantTimeline, hop} from '../../lib/mascot';
import {BLUEPRINT_WALL} from '../shared/sets';
import {AlertMark, Bit, bitPath, DEPTH_INK, LOCK} from '../shared/props';
import type {Acc, Hair} from '../../lib/kit';
import {speedLines} from '../../lib/sketch';
import type {Pt} from '../../lib/sketch';
import type {Beats} from './beats';
import {camAt, layerCam, LAYER_F, toScreen, toWorld} from './camera';
import {Investigator, InvestigatorPose, LEG, personGeo, FIG_H, tabletCentre} from './shims';
import {LOCK_C, lp, StepGap} from './plan';
import {collarAt, MESSENGER, MessengerRun} from './messenger';

export {LOCK_C};

/** Front row feet (on the bottom tread / landing) and back row feet (its back edge). */
const FEET = BLUEPRINT_WALL.feetY; // 1470
const FEET_BACK = 1446;
/** Fix round 2: the teams 1.12 x (the baseline playbook's mid-ground, ~0.09-0.10 H on screen). */
const K = 1.12;

// ---------------------------------------------------------------- the teams

type Member = {
  x: number;
  /** Pop-up order inside the team (front left first). */
  rise: number;
  h: number;
  seed: string;
  body: string;
  hair?: Hair;
  hairColor?: string;
  acc?: Acc[];
  back?: boolean;
  tablet?: 'left' | 'right';
  pose?: 'point' | 'clipboard' | 'hips';
  /** Fix round 3: a ponytail with a hair tie of this colour (was long hair: tan on a tan coat read as a bald capsule). */
  tie?: string;
  /** A1 polish: trouser colour (B1's seeded pick was ink-black: the darkest block in the frame, under her tablet). */
  legs?: string;
};

/** Team A (x 130-320) and team B (x 545-735; the messenger right of them): two depths (a back-row member behind each
 *  front pair, partly hidden), different heights and poses, ONE ref-2 'tech' accessory each (a bun, headphones, a laptop
 *  backpack, a cap, a ponytail, a bag strap) and the lanyard strap at the nape (no back badges). One tablet per team,
 *  held at HEAD height. */
export const TEAM_A: Member[] = [
  // fix round 4: A3 / A2 no longer ink-black heads (the row read as three black dots): tan curls, an ochre 'short' head
  // (its three strands and the ears); the messenger keeps his ink hair (S06 continuity)
  {x: 214, rise: 1, h: 117 * K, seed: 's5a3', body: palette.teal, hair: 'curly', hairColor: palette.tan, acc: ['headphones'], back: true, pose: 'point'},
  {x: 156, rise: 0, h: 130 * K, seed: 's5a1', body: palette.sage, hair: 'bun', hairColor: palette.brown, pose: 'clipboard'},
  {x: 274, rise: 2, h: 140 * K, seed: 's5a2', body: palette.tan, hair: 'short', hairColor: palette.brown, acc: ['backpack'], tablet: 'right'},
];
/** Fix round 4: team B shifted left (B1 586 -> 548, B3 644 -> 616, B2 702 -> 690) so B1's bigger, higher tablet (held
 *  up and OUT to the left) and its glow clear sleeping Pip's trunk on the rail. Final polish (review: the glow disc still
 *  touched Pip's trunk): B1 548 -> 530 (the glow's right edge ~25 px clear of him). */
export const TEAM_B: Member[] = [
  {x: 616, rise: 1, h: 116 * K, seed: 's5b3', body: palette.tan, hair: 'cap', back: true},
  {x: 530, rise: 0, h: 128 * K, seed: 's5b1', body: palette.sand, hair: 'short', hairColor: palette.brown, tie: palette.peach, tablet: 'left', legs: palette.tealDark},
  {x: 690, rise: 2, h: 136 * K, seed: 's5b2', body: palette.sage, hair: 'short', hairColor: palette.brown, acc: ['strap'], pose: 'hips'},
];
/** Fix round 4: the tablets 1.4 x (60 world wide in the tablet's frame: held landscape = 85 x 60 world, ~96 x 68 px) and
 *  held HIGH (up and out), so the cards break above the rail onto the banner's paper; a stepped glow disc (white r42 over
 *  mintPale r56 world) backs each one and a big ink sparkle pops above it on the raise. */
const TABLET = 60;
const LIFT = 'high' as const;
const GLOW: [number, number] = [42, 56];

const feetOf = (m: Member) => (m.back ? FEET_BACK : FEET);
/** Fix round 3: the tablets are held LANDSCAPE (they no longer rhyme with the portrait lock box above them). */
const tabletOf = (m: Member) => tabletCentre({x: m.x, y: feetOf(m), h: m.h, seed: m.seed, arm: m.tablet, tabletSize: TABLET, tabletLift: LIFT, landscape: true});

/** Lean toward the lock on 'how': the TORSO and head only, about the hip line (the legs stay planted): 7 deg with an
 *  out-back overshoot, settled in 0.2 s. */
const lean = (t: number, at: number, dir: number) => dir * 7 * E.outBack(1.8)(prog(t, at, LEAN_DUR));
/** Final polish (review: the lean still settled at ~18.845, overlapping the hand's draw-on for 'bad'): 0.16 s from
 *  'how'-0.12 (the last member +0.04), settled by 18.785, before the '!' (18.79). */
const LEAN_DUR = 0.16;

/** Pop-up about the feet with no 'pancake' first frame: a uniform 0.6 -> 1 grow (0.16 s out-cubic) with the pop-up
 *  book's scaleY overshoot on top (1.07 -> 1 over the next 0.1 s). Frame 1 is already a whole (small) person. */
export const PopRise: React.FC<{at: number; x: number; y: number; children?: React.ReactNode}> = ({at, x, y, children}) => {
  const t = useTime();
  if (t < at) return null;
  const u = prog(t, at, 0.16, E.outCubic);
  const base = 0.6 + 0.4 * u;
  const over = u < 1 ? 1 + 0.07 * u : 1 + 0.07 * (1 - prog(t, at + 0.16, 0.1, E.inOutSine));
  if (base >= 1 && over <= 1.0001) return <>{children}</>;
  return <XG m={mat.about(mat.scale(base, base * over), x, y)}>{children}</XG>;
};

/** Draws `children` twice when leaning: the legs (below the hip line) as they are, the coat, head and arms (above it)
 *  rotated about the hip. */
const HipLean: React.FC<{x: number; hipY: number; deg: number; children: React.ReactNode}> = ({x, hipY, deg, children}) => {
  const id = 'hl' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (Math.abs(deg) < 0.01) return <>{children}</>;
  return (
    <>
      <defs>
        <clipPath id={`${id}u`} clipPathUnits="userSpaceOnUse">
          <rect x={x - 400} y={hipY - 800} width={800} height={800 + 1.2} />
        </clipPath>
        <clipPath id={`${id}l`} clipPathUnits="userSpaceOnUse">
          <rect x={x - 400} y={hipY + 1.2} width={800} height={400} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}l)`}>{children}</g>
      <XG m={mat.about(mat.rotate(deg), x, hipY)}>
        <g clipPath={`url(#${id}u)`}>{children}</g>
      </XG>
    </>
  );
};

type Spark = {at: number; twinkleAt: number; outAt: number; glowStepAt: number};

const TeamMember: React.FC<{m: Member; riseAt: number; raiseAt?: number; chestAt?: number; poseAt: number; leanAt: number; leanDir: number; spark?: Spark}> = ({m, riseAt, raiseAt, chestAt, poseAt, leanAt, leanDir, spark}) => {
  const t = useTime();
  const a = lean(t, leanAt, leanDir);
  const fy = feetOf(m);
  let pose: InvestigatorPose | undefined;
  if (m.pose === 'point') pose = {kind: 'point', at: poseAt, target: LOCK_C, side: 'right'};
  else if (m.pose === 'clipboard') pose = {kind: 'clipboard', side: 'left'};
  else if (m.pose === 'hips') pose = {kind: 'hips'};
  const hipY = fy - (LEG * m.h) / 199;
  return (
    <PopRise at={riseAt} x={m.x} y={fy}>
      <HipLean x={m.x} hipY={hipY} deg={a}>
        <Investigator
          x={m.x}
          y={fy}
          h={m.h}
          raiseAt={raiseAt}
          chestAt={raiseAt !== undefined ? chestAt : undefined}
          legsColor={m.legs}
          idCard={m.acc?.includes('backpack') ? 'pack' : m.tie ? 'side' : 'back'}
          holdChest={!!m.tablet}
          arm={m.tablet}
          tabletSize={TABLET}
          tabletLift={LIFT}
          landscape
          glow={raiseAt !== undefined ? GLOW : undefined}
          glowStepAt={spark?.glowStepAt}
          sparkle={spark ? {at: spark.at, twinkleAt: spark.twinkleAt, outAt: spark.outAt, r: 22} : undefined}
          pose={pose}
          body={m.body}
          hair={m.hair}
          hairColor={m.hairColor}
          ponytail={m.tie}
          acc={m.acc}
          bob={1.2}
          seed={m.seed}
        />
      </HipLean>
    </PopRise>
  );
};

/** Team B's tablet follows team A's by this (s); its beam by BEAM_STAGGER. */
const TAB_STAGGER = 0.07;
const BEAM_STAGGER = 0.05;
/** The 'AI' sparkle of team `k` (0 = A, 1 = B): pops as its tablet comes up (raise + 0.02), twinkles once on the 'AI'
 *  highlight (b.twinkle, B 0.07 s later), pops off as its beam shoots out of the tablet; the glow steps down when the
 *  beams retract. */
const sparkOf = (b: Beats, k: number): Spark => ({
  at: b.tablets + k * TAB_STAGGER + 0.02,
  twinkleAt: b.twinkle + k * TAB_STAGGER,
  outAt: b.beams + k * BEAM_STAGGER,
  glowStepAt: b.ring + 0.02,
});

/** Both teams (back row first). Team A pops up on 'researchers' (0.10 s stagger), team B 0.35 s later (0.08 s); on 'AI'
 *  one tablet per team is raised (0.07 s apart); team A's back-row member points at the lock on 'figured'; on 'how'
 *  everyone leans in toward the lock (torso + head about the hips), settled before 'bad' (its ONE focal event), and the
 *  two tablets pose-swap down to chest height (A1 polish: the raised white cards and glow discs competed with 'bad'). */
export const Teams: React.FC<{b: Beats}> = ({b}) => {
  const lean0 = b.how - 0.12;
  const order = (team: Member[]) => [...team].sort((p, q) => Number(!!q.back) - Number(!!p.back));
  return (
    <>
      {order(TEAM_A).map((m) => {
        const i = m.rise;
        const spark = m.tablet ? sparkOf(b, 0) : undefined;
        return <TeamMember key={m.seed} m={m} riseAt={b.teamA + i * 0.1} raiseAt={m.tablet ? b.tablets : undefined} chestAt={b.tabletsDown} poseAt={b.look} leanAt={lean0 + i * 0.02} leanDir={1} spark={spark} />;
      })}
      {order(TEAM_B).map((m) => {
        const i = m.rise;
        const spark = m.tablet ? sparkOf(b, 1) : undefined;
        return <TeamMember key={m.seed} m={m} riseAt={b.teamB + i * 0.08} raiseAt={m.tablet ? b.tablets + TAB_STAGGER : undefined} chestAt={b.tabletsDown} poseAt={b.look} leanAt={lean0 + i * 0.02} leanDir={-1} spark={spark} />;
      })}
    </>
  );
};

/** Where the steps' nosing lines are cut (plan.tsx StepsOverlay): across each figure's legs (hip line to soles, the
 *  leg span + a 3-unit margin), from its pop; the messenger's only while he stands (from 'was.' he runs off). */
export function stepGaps(b: Beats): StepGap[] {
  const gap = (x: number, feet: number, h: number, seed: string, from: number, to?: number): StepGap => {
    const s = h / FIG_H;
    const half = (personGeo(seed).w * 0.36 + 3) * s;
    return {x0: x - half, x1: x + half, y0: feet - LEG * s - 2, y1: feet + 4, from, to};
  };
  return [
    ...TEAM_A.map((m) => gap(m.x, feetOf(m), m.h, m.seed, b.teamA + m.rise * 0.1)),
    ...TEAM_B.map((m) => gap(m.x, feetOf(m), m.h, m.seed, b.teamB + m.rise * 0.08)),
    gap(MESSENGER.x, FEET, MESSENGER.h, MESSENGER.seed, b.teamB + 0.24, b.was),
  ];
}

/** The messenger (scene05/messenger.tsx), popping up with team B. */
export const MessengerDash: React.FC<{b: Beats}> = ({b}) => <MessengerRun b={b} Pop={PopRise} />;

/** The two scan beams: from each raised tablet's top to the lock detail; they shoot out on 'AI'+0.25, sweep the banner in
 *  opposite phase, converge on the lock on 'figured' and retract the moment the ring finds it ('out'-0.04). OPAQUE white
 *  light wedges drawn in the BANNER layer OVER the plan's cream panels and title block and under its re-stroked ink
 *  (paper < cream < beam < ink: every pixel a palette colour). The camera is locked while they live, so the two planes
 *  agree.
 *  Fix round 4 (camspeed WARN 29.8 px/frame at 1.53-1.60 s: ScanBeam's own converge, 170 -> 10 in 0.3 s in-out cubic,
 *  moved each far edge ~27 world/frame, and the sweep added to it): the narrowing is driven HERE (w1 170 -> 10 over
 *  NARROW s, in-out sine, from 'figured'-0.04) and the sweep (6 deg) is damped to 0 over the 0.24 s before it starts, so
 *  the two motions never add. */
// (the far width during the scan is W1_SCAN below; final polish: was W1 = 170, both beams aimed at the lock)
const SWEEP = 6;
/** A1 polish: 0.42 -> 0.30 s (the narrowing was only ~19 % done on 'figured' and finished as the beams retracted: they
 *  never HELD converged). Now 50 % one frame after 'figured' (18.225), done at 18.375, held 0.12 s before the retract
 *  (18.495); peak far-edge speed ~16 px/frame. */
const NARROW = 0.3;
/** A1 polish: the beam's width at the tablet (was 14 world = 16 px: converged, the two beams read as thin drafting
 *  leader lines): 28 world = ~32 px, so the converged cone still reads as light from the tablet meeting on the lock. */
const W0 = 28;
/** A1 polish: a flat strip one palette step darker than the paper (palette.bg) just outside each dashed edge, so the
 *  white wedge separates from the mintPale paper at phone size (white on mintPale is a tiny value step). World px. */
const EDGE_STRIP = 7;

/** The shared ScanBeam's geometry (props Tablet.tsx: wipe on 0.25 s out(cubic), retract 0.2 s in(cubic), sweep about the
 *  source), drawn here as: two palette.bg edge strips, the opaque white wedge, the dashed ink edges (A1 polish: the shared
 *  prop has no edge strip). The narrowing is driven by the caller through w1 (no convergeAt). */
const LightBeam: React.FC<{from: Pt; to: Pt; w0: number; w1: number; at: number; amp: number; hz: number; outAt: number; seed: string}> = ({from, to, w0, w1, at, amp, hz, outAt}) => {
  const t = useTime();
  if (t < at) return null;
  const grow = E.outCubic(prog(t, at, 0.25));
  const shrink = 1 - E.inCubic(prog(t, outAt, 0.2));
  if (shrink <= 0.002) return null;
  const sw = amp * osc(t, hz);
  const dx0 = to[0] - from[0];
  const dy0 = to[1] - from[1];
  const a = Math.atan2(dy0, dx0) + (sw * Math.PI) / 180;
  const L = Math.hypot(dx0, dy0) * grow * shrink;
  const d: Pt = [Math.cos(a), Math.sin(a)];
  const n: Pt = [-d[1], d[0]];
  const P = (dist: number, w: number, side: number): Pt => [from[0] + d[0] * dist + (n[0] * side * w) / 2, from[1] + d[1] * dist + (n[1] * side * w) / 2];
  const f = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const A = P(0, w0, -1);
  const B = P(0, w0, 1);
  const C = P(L, w1, 1);
  const D = P(L, w1, -1);
  const so = EDGE_STRIP * 2;
  const strips = `M${f(A)}L${f(D)}L${f(P(L, w1 + so, -1))}L${f(P(0, w0 + so, -1))}Z` + `M${f(B)}L${f(C)}L${f(P(L, w1 + so, 1))}L${f(P(0, w0 + so, 1))}Z`;
  const poly = `M${f(A)}L${f(B)}L${f(C)}L${f(D)}Z`;
  const edges = `M${f(A)}L${f(D)}M${f(B)}L${f(C)}`;
  // final polish (review: each wedge ended mid-plan in a hard slanted cut, a white paper pennant laid on the plan): the
  // beam ENDS in a flat oval FOOTPRINT of light where it falls on the paper (across the beam w1, along it FOOT_K x w1),
  // its palette.bg edge ring and a dashed ink rim on its far half (the near half is inside the beam)
  const Ec: Pt = [from[0] + d[0] * L, from[1] + d[1] * L];
  const oval = (rx: number, ry: number, th0: number, th1: number, steps: number): Pt[] =>
    Array.from({length: steps + 1}, (_, i) => {
      const th = th0 + ((th1 - th0) * i) / steps;
      return [Ec[0] + n[0] * rx * Math.cos(th) + d[0] * ry * Math.sin(th), Ec[1] + n[1] * rx * Math.cos(th) + d[1] * ry * Math.sin(th)] as Pt;
    });
  const rx = w1 / 2;
  const ry = Math.max(3, w1 * FOOT_K);
  const path = (Q: Pt[], close: boolean) => Q.map((p, i) => `${i ? 'L' : 'M'}${f(p)}`).join('') + (close ? 'Z' : '');
  const footRing = path(oval(rx + EDGE_STRIP, ry + EDGE_STRIP * 0.7, 0, 2 * Math.PI, 28), true);
  const foot = path(oval(rx, ry, 0, 2 * Math.PI, 28), true);
  const rim = path(oval(rx, ry, 0, Math.PI, 16), false);
  return (
    <>
      <path d={strips + footRing} fill={palette.bg} />
      <path d={poly + foot} fill={palette.white} />
      <path d={edges + rim} fill="none" stroke={palette.ink} strokeWidth={DEPTH_INK.far} strokeDasharray="9 8" strokeLinecap="round" />
    </>
  );
};

/** The footprint oval's depth along the beam (x its width). */
const FOOT_K = 0.24;
/** Final polish (review: during the sweep the two wedges crossed into a W / X): each beam sweeps ITS OWN half of the plan
 *  (team A the left half, team B the right half, in opposite phase, so they swing toward and away from each other but
 *  never cross), and only the converge brings both onto the lock. World px. */
const HALF_A: Pt = [372, 930];
const HALF_B: Pt = [606, 930];
/** The sweep width during the scan (world, far end): narrower than the old 170 so the two halves keep a clear gap. */
const W1_SCAN = 132;

export const Beams: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const pa = tabletOf(TEAM_A.find((m) => m.tablet)!);
  const pb = tabletOf(TEAM_B.find((m) => m.tablet)!);
  const off = TABLET * 0.5; // the top edge of a landscape tablet
  const outAt = b.ring + 0.02;
  const n0 = b.converge - 0.04;
  const w1 = lerp(W1_SCAN, 10, E.inOutSine(prog(t, n0, NARROW)));
  const amp = SWEEP * (1 - E.inOutSine(prog(t, n0 - 0.24, 0.24)));
  // the aim slides from each half onto the lock over the sweep's damping + the narrowing (0.54 s, in-out sine): the far
  // edges peak at ~19 px/frame
  const k = E.inOutSine(prog(t, n0 - 0.24, 0.24 + NARROW));
  const aim = (h: Pt): Pt => [lerp(h[0], LOCK_C[0], k), lerp(h[1], LOCK_C[1], k)];
  return (
    <>
      <LightBeam from={[pa[0] + 3, pa[1] - off]} to={aim(HALF_A)} w0={W0} w1={w1} at={b.beams} amp={amp} hz={1.1} outAt={outAt} seed="s5beamA" />
      <LightBeam from={[pb[0] - 3, pb[1] - off]} to={aim(HALF_B)} w0={W0} w1={w1} at={b.beams + BEAM_STAGGER} amp={-amp} hz={1.1} outAt={outAt} seed="s5beamB" />
    </>
  );
};

// ---------------------------------------------------------------- Pip

/** Pip's perch on the bottom rail: the set's perchBottom (620) moved 10 left so his trunk-up wake clears the stamp. */
export const PIP_RAIL: Pt = [BLUEPRINT_WALL.perchBottom[0] - 10, BLUEPRINT_WALL.perchBottom[1]];
/** 1.2 on screen at the 1.13 lock. */
export const PIP_SCALE = 1.2 / 1.13;
/** Pip's leap off the rail after the messenger (fix round 2: a HIGH arc, so he rises over the elephant stamp instead of
 *  crossing it). A1 fix round (review: on the cut he hung mid-frame at screen ~(720, 1100), still 360 px from the edge,
 *  and S06 only picks him up at its left edge 0.19 s later: the thread viewers follow vanished mid-frame): take-off
 *  0.03 s BEFORE the truck (the wake face still holds 0.20 s), a longer leap (to x 1420) with less x lag (k^1.3): a
 *  steady ~46 px/frame dash across the frame, so on the cut he is half out of frame RIGHT (centre screen ~(1050, 1180)),
 *  falling fast, and S06 brings him in at its left edge (screen y ~1300-1340, S06 19.97). He rises over the stamp
 *  (feet at world ~1190 as he passes its centre). */
export const pipHop = (b: Beats) => ({t0: b.truck - 0.097, dur: 0.517, to: {x: 1420, y: 1440}, height: 196});
/** Final polish (review: the dash crossed at ~46 px / frame with no smear): take-off 2 frames earlier (19.376) on a
 *  0.517 s leap to the same landing (~35-40 px / frame across the frame, still half out of frame right on the cut), and
 *  the film's smear (3 speed lines trailing him, S10 / S11 / S12's language) on the fast frames. The crouch before it is
 *  0.10 s (was 0.14: it would start inside the wake jolt). */
const PIP_CROUCH = 0.1;
/** The leap's x lag (x eases k^PIP_XLAG: up first, then out). */
const PIP_XLAG = 1.3;

/** A1 polish: the 'stand-side' key moved from take-off - 0.14 to take-off, so the wake gag face (trunk-up, wide) holds
 *  f79-f88 (0.30 s) and no Pip pose pop lands on the messenger's envelope / run pops (f82 / f83); the anticipation stays
 *  as the hop's crouch squash on the trunk-up pose. */
const pipKeys = (b: Beats, t0: number) => [
  {t: -10, pose: 'sleep' as const},
  {t: b.pipWake, pose: 'trunk-up' as const, expression: 'wide' as const},
  {t: t0, pose: 'stand-side' as const, expression: 'wide' as const},
];

/** The roll-over settle on the match cut (S04 leaves him asleep elsewhere on screen: the pop reads as him rolling over
 *  in his sleep): 14 deg (toward his head: he sleeps FACING LEFT, as S04 leaves him) and a squash that settle in 0.18 s. */
const rollOver = (t: number) => {
  const u = clamp(t / 0.18);
  return {rot: 14 * (1 - E.outCubic(u)), sq: 0.12 * (1 - E.outCubic(u))};
};

/** Wrap-up, cut S04|S05 (review: Pip jumped (+345, +166) px on the cut while the lock, Bit and L5 held): S04's last
 *  frame (Main f497) leaves him asleep FACING LEFT, feet at screen (274.3, 1146.3), screen scale 1.30 (scene04 PIP_AT
 *  (218, 1230) through its dive camera; its scale clamp); one more frame of S04's zoom about lock4 (0.84 /s) puts the
 *  feet at (268.4, 1151.6). Scene05 maps it to world through the landing camera on Main's first S05 frame (`PipFrom`). */
export const S04_PIP: [number, number, number] = [268.4, 1151.6, 1.3];
/** World feet, ON-SCREEN scale, and the scene time of Main's first S05 frame. */
export type PipFrom = {x: number; y: number; sc: number; t0: number};
/** The tumble: the landing's hit rolls him off S04's spot, still asleep and facing left: he DROPS first (y out-quad: his
 *  crown clears L5's lower-left corner), then rolls right onto his perch (x in-out sine), his screen scale easing
 *  1.30 -> the perch's, tilting 0 -> 14 deg into the roll-over, which then settles as before (0.18 s). */
const TUMBLE = 0.3;
export const pipRailPose = (t: number, end: number, from?: PipFrom) => {
  const k = from ? clamp((t - from.t0) / TUMBLE) : 1;
  if (from && k < 1) {
    const xp = E.inOutSine(k);
    const s = lerp(from.sc / camAt(t, end).zoom, PIP_SCALE, xp);
    return {x: lerp(from.x, PIP_RAIL[0], xp), y: lerp(from.y, PIP_RAIL[1], E.outQuad(k)), s, rot: 14 * xp, sq: -0.06 * Math.sin(Math.PI * k)};
  }
  const ro = rollOver(from ? t - from.t0 - TUMBLE : t);
  return {x: PIP_RAIL[0], y: PIP_RAIL[1], s: PIP_SCALE, rot: ro.rot, sq: ro.sq};
};

/** Pip ON THE RAIL (banner layer, riding its sway and its parallax): asleep FACING LEFT (flipped, exactly as S04 leaves
 *  him, S04's tan leaf still on his crown), jolts awake on 'it' turning right toward the messenger (trunk-up, wide: the
 *  pose pop carries the turn), crouches; gone at take-off (<PipHop> takes over in the steps plane). */
export const PipOnRail: React.FC<{b: Beats; from?: PipFrom}> = ({b, from}) => {
  const t = useTime();
  const H = pipHop(b);
  if (t >= H.t0) return null;
  const h = hop({t, t0: H.t0, dur: H.dur, from: {x: PIP_RAIL[0], y: PIP_RAIL[1]}, to: H.to, height: H.height});
  const crouch = t >= H.t0 - PIP_CROUCH;
  const jolt = t >= b.pipWake ? -10 * Math.sin(Math.PI * clamp((t - b.pipWake) / 0.16)) : 0;
  const p = pipRailPose(t, b.end, from);
  const x = p.x + h.x - PIP_RAIL[0];
  const y = p.y + h.y - PIP_RAIL[1];
  const el = <ElephantTimeline x={x} y={y + jolt} scale={p.s} t={t} seed={5} keys={pipKeys(b, H.t0)} squash={(crouch ? h.squash : 0) + p.sq} rotate={0} flip={t < b.pipWake} />;
  return p.rot !== 0 ? <XG m={mat.about(mat.rotate(p.rot), x, y)}>{el}</XG> : el;
};

/** Cut S05|S06 (phase B): the leap's HEIGHT climbs to its apex ON the cut (world y PIP_APEX_Y at b.end): rise =
 *  1 - (1 - u)^3 over take-off -> cut, so he still springs off the rail as fast as the old hop (over the stamp: feet
 *  ~1160 world, 30 above its ring, as he passes it) and then levels out: the last 4 frames hang at the top of the arc as
 *  he leaves frame right (S05's last frame: feet screen ~(1091, 1118), ~40 px/frame right, ~0 vertical), so S06 picks
 *  him up on its FIRST frame at the same height, half in at its left edge above the messenger's head, and drops him in
 *  behind the messenger (scene06/parts.tsx pipEntry). Was: the hop's own arc (apex at f588, then falling 45 px/frame
 *  through the cut at screen y ~1262), which S06 could only pick up 5 frames later below the messenger's head. x keeps
 *  the hop's k^1.3 lag; the nose levels out with the climb (-10 deg at take-off -> 0 at the apex). */
export const PIP_APEX_Y = 1080;
const pipLeapU = (t: number, t0: number, apexT: number) => clamp((t - t0) / (apexT - t0));
const pipLeapY = (t: number, t0: number, apexT: number) => PIP_RAIL[1] - (PIP_RAIL[1] - PIP_APEX_Y) * (1 - Math.pow(1 - pipLeapU(t, t0, apexT), 3));

/** Pip in the air (steps plane, f = 1): the hop starts from the rail point as the banner layer showed it at take-off
 *  (its parallax offset folded in, so there is no jump when he changes plane). */
export const PipHop: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  const H = pipHop(b);
  if (t < H.t0) return null;
  const c0 = camAt(H.t0, b.end);
  const fromX = PIP_RAIL[0] + (1 - LAYER_F.banner) * (c0.x - 540);
  const at = (tt: number) => {
    const h = hop({t: tt, t0: H.t0, dur: H.dur, from: {x: fromX, y: PIP_RAIL[1]}, to: H.to, height: H.height});
    // the leap goes UP first (x lags: k^1.3), so he rises over the elephant stamp before he crosses it
    const k = clamp((tt - H.t0) / H.dur);
    const air = h.airborne && tt >= H.t0;
    return {h, x: air ? lerp(fromX, H.to.x, Math.pow(k, PIP_XLAG)) : h.x, y: air ? pipLeapY(tt, H.t0, b.end) : h.y, rot: air ? -10 * Math.pow(1 - pipLeapU(tt, H.t0, b.end), 2) : h.rotate};
  };
  const {h, x, y, rot} = at(t);
  // his on-screen velocity (steps plane, the trucking camera included), back in world units for the smear
  const dt = 1 / 30;
  const prev = at(t - dt);
  const cA = layerCam(camAt(t - dt, b.end), LAYER_F.steps);
  const cB = layerCam(camAt(t, b.end), LAYER_F.steps);
  const sA = toScreen(cA, [prev.x, prev.y]);
  const sB = toScreen(cB, [x, y]);
  const v: Pt = [(sB[0] - sA[0]) / dt / cB.zoom, (sB[1] - sA[1]) / dt / cB.zoom];
  return (
    <>
      {h.airborne && t - H.t0 > dt ? <PipSmear x={x} y={y} vx={v[0]} vy={v[1]} sc={PIP_SCALE} zoom={cB.zoom} /> : null}
      <ElephantTimeline x={x} y={y} scale={PIP_SCALE} t={t} seed={5} keys={pipKeys(b, H.t0)} squash={h.squash} rotate={rot} amount={h.airborne ? h.spread : undefined} />
    </>
  );
};

/** Speed lines behind a fast Pip (the film's smear language: S10 / S11 / S12, copied here, never imported across
 *  scenes). WORLD px: (x, y) = his feet, (vx, vy) = his on-screen velocity in world px / s, `sc` = his scale. 3 short ink
 *  lines anchored behind his body centre along -velocity, their length growing with his speed; drawn only above
 *  SMEAR_MIN screen px / frame. */
const SMEAR_MIN = 22;
const PipSmear: React.FC<{x: number; y: number; vx: number; vy: number; sc: number; zoom: number}> = ({x, y, vx, vy, sc, zoom}) => {
  const sp = Math.hypot(vx, vy);
  const pxf = (sp * zoom) / 30;
  if (pxf < SMEAR_MIN) return null;
  const ux = -vx / sp;
  const uy = -vy / sp;
  const cx = x + ux * 50 * sc;
  const cy = y - 46 * sc + uy * 50 * sc;
  const len = Math.max(20, Math.min(50, pxf * 0.8)) / zoom;
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
  return <Ink d={speedLines(cx, cy, {n: 3, len, gap: 15 * sc, angle: ang, seed: 's5pipSpd/l'})} width={2.6 / zoom} taper={false} seed="s5pipSpd/i" />;
};

// ---------------------------------------------------------------- S04's leaf (continuity) and the z

/** The sleeping crown (sleep pose, FLIPPED, local px at scale 1, feet = (0, 0)): S04 scene04/cast.tsx SLEEP_CROWN. */
const SLEEP_CROWN: Pt = [-24, -45];
/** S04's TAN leaf at its resting pose on the crown (scene04/cast.tsx LEAF_REST: rot -14, flip 0.62; LEAF_S 13). */
const LEAF_S = 13;
const LEAF_REST = {rot: -14, flip: 0.62};
const leafD = (s: number) => `M${-s} 0C${-s * 0.5} ${-s * 0.8} ${s * 0.55} ${-s * 0.75} ${s} 0C${s * 0.55} ${s * 0.75} ${-s * 0.5} ${s * 0.8} ${-s} 0Z`;
const leafRib = (s: number) => `M${-s * 1.3} 0.6L${s * 0.75} 0M${-s * 0.1} 0L${s * 0.25} ${-s * 0.32}M${-s * 0.1} 0L${s * 0.25} ${s * 0.32}`;
const LeafShape: React.FC<{x: number; y: number; rot: number; fy: number}> = ({x, y, rot, fy}) => (
  <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(1, fy))}>
    <Fill d={leafD(LEAF_S)} color={palette.tan} offset={false} mode="none" seed="s5leaf" />
    <Ink d={leafD(LEAF_S) + leafRib(LEAF_S)} width={1.6} taper={false} seed="s5leafi" />
  </XG>
);
const CROWN: Pt = [PIP_RAIL[0] + SLEEP_CROWN[0] * PIP_SCALE, PIP_RAIL[1] + SLEEP_CROWN[1] * PIP_SCALE - 2];
/** Where the flicked leaf lands: the second tread, LEFT of Pip (fix round 3: it flies off his crown away from his body,
 *  not across his face), in the clear stretch between the two teams' raised tablets. */
const LEAF_LAND: Pt = [470, 1356];
const LEAF_FALL = 0.25;

/** The leaf on Pip's crown (banner layer, riding the sway and his roll-over) until he jolts awake on 'it'. */
export const LeafOnCrown: React.FC<{b: Beats; from?: PipFrom}> = ({b, from}) => {
  const t = useTime();
  if (t >= b.pipWake) return null;
  // it rides his crown through the cut's tumble (feet, scale and roll from pipRailPose); CROWN once he is on the rail
  const p = pipRailPose(t, b.end, from);
  const k = p.s / PIP_SCALE;
  const cx = p.x + SLEEP_CROWN[0] * p.s;
  const cy = p.y + SLEEP_CROWN[1] * p.s - 2;
  return (
    <XG m={mat.compose(p.rot !== 0 ? mat.about(mat.rotate(p.rot), p.x, p.y) : mat.I, k !== 1 ? mat.about(mat.scale(k), cx, cy) : mat.I)}>
      <LeafShape x={cx} y={cy} rot={LEAF_REST.rot} fy={LEAF_REST.flip} />
    </XG>
  );
};

/** The jolt flicks it off: a 0.25 s tumble (up, spinning, then down) onto the steps, where it stays (steps layer). */
export const LeafFall: React.FC<{b: Beats}> = ({b}) => {
  const t = useTime();
  if (t < b.pipWake) return null;
  const u = clamp((t - b.pipWake) / LEAF_FALL);
  const x = lerp(CROWN[0], LEAF_LAND[0], E.outQuad(u));
  const y = lerp(CROWN[1], LEAF_LAND[1], u * u) - 46 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u * 0.4);
  const rot = LEAF_REST.rot + 300 * E.outCubic(u);
  const fy = u < 1 ? LEAF_REST.flip + 0.36 * Math.abs(Math.sin(u * Math.PI * 2.2)) : 0.42;
  return <LeafShape x={x} y={y} rot={u < 1 ? rot : 8} fy={fy} />;
};

/** A z floats up from sleeping Pip on 'before' (fix round 4: in PIP'S OWN z style, not a heavy annotation Z: the mascot's
 *  sleep-pose glyph, top bar / diagonal / bottom bar, mirrored as he sleeps facing left, the same tapered thin stroke,
 *  1.6 x his biggest z = 18 world = 20 px): it pops in small beside his own z's, rises along the rail band while it
 *  grows, and pops off (one shrunken frame) before it reaches the door elevation's foot line (world 1190). */
const Z_SIZE = 18;
const Z_DUR = 0.6;
export const BigZ: React.FC<{at: number; end: number; from?: PipFrom}> = ({at, end, from}) => {
  const t = useTime();
  if (t < at || t >= at + Z_DUR + 1 / 30) return null;
  // wrap-up: on 'before' he is still tumbling onto the rail (pipRailPose): the z rides beside his head until he lands
  const f = pipRailPose(t, end, from);
  const p: Pt = [f.x, f.y];
  const q = prog(t, at, Z_DUR, E.outQuad);
  const off = t >= at + Z_DUR ? 0.72 : 1;
  const s = Z_SIZE * lerp(0.55, 1, E.outBack(1.4)(prog(t, at, 0.22))) * off;
  const x = p[0] - 44 - 28 * q + 2.5 * osc(t, 3, 0.3);
  const y = p[1] - 58 - 30 * q;
  // the mascot's z polyline (poses.ts sleep), flipped: [s - a, b]
  const P = (a: number, c: number) => `${(x + (s - a) - s / 2).toFixed(1)} ${(y + c - s / 2).toFixed(1)}`;
  const z = `M${P(0, 0)}L${P(s, -0.2)}L${P(0.2, s)}L${P(s * 1.05, s)}`;
  return <Ink d={z} width={2.9} vary={0.1} seed="s5z" />;
};

// ---------------------------------------------------------------- Bit: in the drawing, caught on 'bad', stows away

/** Bit's spots: the socket mouth (posing as part of the lock drawing, 18 world = 20 px) and the lock box's top-left
 *  edge (silhouetted on the paper, 21 world = 24 px, legs and antennae clear of the linework). */
const SOCKET: Pt = (() => {
  const p = lp(LOCK.peek[0], LOCK.peek[1]);
  return [p[0] - 1, p[1] + 1];
})();
const EDGE: Pt = lp(-33, -50);
const HOP_OUT = 0.22;
/** Fix round 3: where S04 leaves him on the cut: sitting on the lock box's top, right half (S04 BIT_AT = lock4 + 7 world
 *  at 0.42 world / lock unit = +16.7 units), 16 world x the dive's 1.9 zoom = 30 px = 28 world here at the 1.08 landing.
 *  On 'before' he hops DOWN into the socket (shrinking to the drawing's 18: posing as part of it). */
const TOP: Pt = lp(16.7, -50);
const TOP_SIZE = 28;
const HOP_IN = 0.2;
/** The leap onto the messenger's collar (S06: Bit hides in the collar and peeks out on 'gave'). */
/** Final polish (review: 550 px in 0.24 s, ~70 px / frame, he read as disconnected specks): 0.33 s (~48 px / frame), a
 *  0.03 s sit and a 0.08 s duck, so he is in the collar by 19.74 (the cut 19.773). */
const LEAP = {dur: 0.33, height: 150, sit: 0.03, duck: 0.08};

function bitOnLockAt(t: number, inAt: number, outAt: number): {x: number; y: number; size: number; flip: boolean; out: boolean; air: boolean} {
  const arc = (a: Pt, c: Pt, u: number, hgt: number): Pt => [lerp(a[0], c[0], u), lerp(a[1], c[1], u) - hgt * 4 * u * (1 - u)];
  if (t < inAt) return {x: TOP[0], y: TOP[1], size: TOP_SIZE, flip: false, out: true, air: false};
  if (t < inAt + HOP_IN) {
    const u = E.inOutSine((t - inAt) / HOP_IN);
    const p = arc(TOP, SOCKET, u, 22);
    return {x: p[0], y: p[1], size: lerp(TOP_SIZE, 18, u), flip: u > 0.5, out: true, air: true};
  }
  if (t < outAt) return {x: SOCKET[0], y: SOCKET[1], size: 18, flip: true, out: false, air: false};
  if (t < outAt + HOP_OUT) {
    const u = E.inOutSine((t - outAt) / HOP_OUT);
    const p = arc(SOCKET, EDGE, u, 26);
    return {x: p[0], y: p[1], size: lerp(18, 21, u), flip: true, out: true, air: true};
  }
  return {x: EDGE[0], y: EDGE[1], size: 21, flip: false, out: true, air: false};
}

/** Bit poses as part of the lock drawing in the socket mouth (banner layer). Caught on 'bad': his ink '!' balloon pops
 *  0.08 s BEFORE the word (readable on it) and he hops OUT onto the lock box's top-left edge ON the word, looking up at
 *  the hand; at `leapAt` he leaves the plan (<BitLeap> takes over in the steps layer) and the balloon pops off. */
export const BitOnLock: React.FC<{inAt: number; alertAt: number; balloonAt: number; leapAt: number}> = ({inAt, alertAt, balloonAt, leapAt}) => {
  const t = useTime();
  const s = bitOnLockAt(t, inAt, alertAt);
  const showAlert = t >= balloonAt && t < leapAt;
  return (
    <>
      {t < leapAt ? <Bit x={s.x} y={s.y} size={s.size} flip={s.flip} state={s.air ? 'hop' : undefined} look={t < inAt ? 'auto' : s.out ? 'up' : 'forward'} seed="s5bit" /> : null}
      {showAlert ? <AlertBubble x={ALERT[0]} y={ALERT[1]} tail={[EDGE[0], EDGE[1] - 12]} at={balloonAt} /> : null}
    </>
  );
};

/** A1 fix round (review: solid-ink Bit vanished on the messenger's dark hair and collar band, the rewatch payoff and the
 *  hand-off to S06's stowaway lost): a CREAM keyline round his shell + head silhouette while he leaps and rides (the
 *  sparkles' keyline treatment), ~2.5 px outside his outline on screen. */
const BitKey: React.FC<{x: number; y: number; size: number}> = ({x, y, size}) => (
  <path d={bitPath(x, y, size)} fill={palette.cream} stroke={palette.cream} strokeWidth={5} strokeLinejoin="round" />
);

/** Bit's leap (steps layer): from the lock box edge (where the banner layer shows it) along a high arc onto the
 *  messenger's right collar (tracking it as he starts to run), a 0.05 s sit, then he ducks INTO the collar (clipped at
 *  the collar line) by ~19.63: S06's stowaway, peeking out of the same collar on 'gave'. */
export const BitLeap: React.FC<{b: Beats; leapAt: number}> = ({b, leapAt}) => {
  const t = useTime();
  const id = 'bl5' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < leapAt) return null;
  const tl = t - leapAt;
  const duck0 = LEAP.dur + LEAP.sit;
  if (tl > duck0 + LEAP.duck) return null;
  const cam = camAt(t, b.end);
  const steps = layerCam(cam, LAYER_F.steps);
  const from = toWorld(steps, toScreen(layerCam(cam, LAYER_F.banner), EDGE));
  const to = collarAt(t, b);
  if (tl < LEAP.dur) {
    const u = E.inOutSine(tl / LEAP.dur);
    const x = lerp(from[0], to[0], u);
    const y = lerp(from[1], to[1], u) - LEAP.height * 4 * u * (1 - u);
    return (
      <>
        <BitKey x={x} y={y} size={lerp(21, 20, u)} />
        <Bit x={x} y={y} size={lerp(21, 20, u)} state="hop" look="forward" seed="s5bit" />
      </>
    );
  }
  const k = clamp((tl - duck0) / LEAP.duck);
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={to[0] - 60} y={to[1] - 80} width={120} height={80 + 1.5} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <BitKey x={to[0]} y={to[1] + k * 20 * 0.9} size={20} />
        <Bit x={to[0]} y={to[1] + k * 20 * 0.9} size={20} state="ride" look={k > 0 ? 'down' : 'forward'} seed="s5bit" />
      </g>
    </>
  );
};

/** Where the '!' balloon sits: up-left of the lock, OUTSIDE the found ring (r92), below the L6 slip. */
const ALERT: Pt = [392, 856];

/** A white balloon (r 30 world = 34 px on screen) with a bold ink '!' and a tail toward Bit: it pops (7 % spring) and
 *  holds. */
const AlertBubble: React.FC<{x: number; y: number; tail: Pt; at: number}> = ({x, y, tail, at}) => {
  const t = useTime();
  if (t < at) return null;
  const r = 30;
  const dx = tail[0] - x;
  const dy = tail[1] - y;
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  // the tail: a short wedge from the balloon edge toward Bit (stops ~16 px short of him)
  const b0: Pt = [x + ux * r * 0.7 - uy * 10, y + uy * r * 0.7 + ux * 10];
  const b1: Pt = [x + ux * r * 0.7 + uy * 10, y + uy * r * 0.7 - ux * 10];
  const reach = Math.min(L - 16, r + 30);
  const tip: Pt = [x + ux * reach, y + uy * reach];
  const disc = `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
  const tailD = `M${b0[0].toFixed(1)} ${b0[1].toFixed(1)}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}L${b1[0].toFixed(1)} ${b1[1].toFixed(1)}`;
  const circleOpen = `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`;
  const k = springAt(t, at, springs.pop);
  if (k <= 0.001) return null;
  return (
    <XG m={mat.about(mat.scale(k), tip[0], tip[1])}>
      <path d={disc + tailD + 'Z'} fill={palette.white} />
      <Ink d={circleOpen + tailD} width={2.8} taper={false} vary={0} order="all" seed="s5bub" />
      <AlertMark x={x} y={y - 2} size={38} seed="s5alert" />
    </XG>
  );
};
