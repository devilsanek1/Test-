// V2S8 cast (lane L6; conform_L6 §4, §5, §6; THROUGHLINE §4 S8).
// HER walking home up the lane (back view, on the house plane: herAt; V2S8_depth S8Plane 'house'), at her door 34.50
// (goIn), through the doorway by 34.68 (the closing door leaf, V2S8_house, covers her). Tier A (the subject): the only
// full outline, her form shade on the side away from the low sun ahead and the RIM along her top and left edge (backlit:
// CRAFT §d.8, conform_L6 §6). Her contact and cast shadows are V2S8_light's.
// THE GHOSTS (three, G4-G6's cues) pop on "can't" ahead of her, left of her door, and the truck slides them in front of
// her shut door (map S8.ghosts, the 240 plane): with her they are the subject while she walks (A, 33.78-34.75), then B
// with their one closed tinted line (line-drawn figures); they un-build LAST (LateExit).
// THE PUBLIC (tier C: no lines, calm): life on the lane at its own planes, crossing SIDEWAYS or walking away (nothing
// comes at the lens), never teal, never over her, the board text, Pip or the ghosts' heads; <= 3 noticeable supporting
// movers at once, taking turns; nothing enters in 38.72-39.08 (the seam). The payoff is hers (critic_L6 MUST 2): no
// one crosses the lane while the quote pens on (36.54-37.70); ONE walker strolls in from the right edge after it.
// Every walker is a FLAT tier-C figure (CRAFT §b-§c): no outline (ink 0), a calm coat (C* <= 25: oat or slate; never
// mustard, brickDeep or teal), the head ONE tone (a beanie or a hood over hair of its own colour, no cheek: nothing
// reads as a face).
import React from 'react';
import {Fill} from '../../lib/Fill';
import {FormShade, Rim} from '../../lib/light';
import {Tier} from '../../lib/tier';
import {useTime, clamp} from '../../lib/time';
import {CM} from '../palette';
import {Her, Person, S8Ghosts, strideFor, FarCrowd, type FarSpot, type TraitOverrides} from '../kit/cast';
import {herAt, herStep, S8T, S8_START, L} from './V2S8_clock';
import type {PlaneId} from './V2S8_clock';
import {S8Plane} from './V2S8_depth';
import {LateExit} from './V2S8_exit';

// ---------------------------------------------------------------- her

export const S8Her: React.FC = () => {
  const t = useTime();
  const p = herAt(t);
  if (!p) return null;
  const atDoor = t >= S8T.herAtDoor;
  // her last step lands on the door step; then one foot up and a hand to the handle (the door's right side)
  const up = atDoor ? clamp((t - S8T.herAtDoor) / 0.1) : 0;
  const fig = atDoor ? (
    <Her x={p.x} y={p.y} h={p.h} pose="goIn" reach={[p.h * 0.2, -p.h * (0.56 + 0.02 * up)]} seed="herS8" />
  ) : (
    <Her x={p.x} y={p.y} h={p.h} pose="walk" view="back" step={herStep(t)} stride={strideFor(21, p.h, 'back')} seed="herS8" />
  );
  const c: [number, number] = [p.x, p.y - p.h / 2];
  return (
    <S8Plane p="house">
      <Tier tier="subject">
        {fig}
        <FormShade of={fig} c={c} size={[p.h * 0.36, p.h]} />
        <Rim of={fig} c={[p.x - p.h * 0.04, p.y - p.h * 0.62]} size={[p.h * 0.34, p.h * 0.62]} width={3.5} cover={0.42} />
      </Tier>
    </S8Plane>
  );
};

// ---------------------------------------------------------------- the ghosts

/** With her, the ghosts are the subject while she walks home (their pop on "can't" to her door shutting). */
export const GHOSTS_A: [number, number] = [S8T.cant, S8T.doorShuts];
export const S8GhostsLayer: React.FC = () => {
  const t = useTime();
  const a = t >= GHOSTS_A[0] && t < GHOSTS_A[1];
  return (
    <LateExit>
      <S8Plane p="ghosts">
        <Tier tier={a ? 'subject' : 'support'} lines>
          <S8Ghosts at={S8T.cant} dx={0} view="back" stagger={0.04} />
        </Tier>
      </S8Plane>
    </LateExit>
  );
};

// ---------------------------------------------------------------- the public

type Walker = {
  seed: string;
  /** Plane the figure travels with. */
  plane: PlaneId;
  /** Film times: enters / leaves. */
  t0: number;
  t1: number;
  /** Landing-pose feet at t0 and t1 (+ heights), in its plane's coords. */
  from: [number, number, number];
  to: [number, number, number];
  pose: 'walk' | 'jog' | 'cycle';
  view: 'back' | 'profile' | 'rear34';
  traits: TraitOverrides;
  rate?: number;
  /** Stride factor (kit gait strideFor: the feet never slide at this speed and rate). Default 1. */
  stride?: number;
  /** A lit bike lamp (cycle only). */
  lamp?: boolean;
};

export const WALKERS: Walker[] = [
  // pre-truck: a far walker beyond the bend heading away (seen in the gap between the board and her house); hooded
  {seed: 's8far1', plane: 'house', t0: 32.6, t1: 35.2, from: [612, 1004, 74], to: [540, 978, 62], pose: 'walk', view: 'rear34', traits: {hair: 'hood', coat: CM.coatSlate, acc: 'backpack'}, rate: 1.7},
  // pre-truck: a neighbour strolling right along the forecourt, away from her door: the wipe reveals it already
  // walking (S8 shows right of the boat first) and it leaves at the right edge by ~34.6
  {seed: 's8nb1', plane: 'house', t0: 32.6, t1: 35.0, from: [930, 1074, 146], to: [1300, 1078, 148], pose: 'walk', view: 'profile', traits: {hair: 'beanie', hairColor: CM.hair[1], hatColor: CM.hair[1], coat: CM.coatOat, acc: 'strap', coatLen: 'mid'}, rate: 1.5},
  // after the quote (from 37.95, the lamp run done): ONE slow stroller in from the right edge, already walking, left
  // along the back of her forecourt (feet y 1064-1066: behind the ghosts' depth, drawn before them), behind the near
  // lamp's post, never reaching the heritage lamp's foot (x <= 1017) or the ghosts; still there at the seam, it
  // un-builds with the rest (it entered long before 38.72). Starts just off the right edge (x 1120: the frame edge
  // after the truck plus its half-width and the float).
  {seed: 's8w2', plane: 'house', t0: 37.95, t1: 39.08, from: [1120, 1064, 140], to: [1046, 1066, 140], pose: 'walk', view: 'profile', traits: {hair: 'beanie', hairColor: CM.hair[1], hatColor: CM.hair[1], coat: CM.coatSlate, trousers: CM.anchor, shoes: CM.hair[0], acc: 'none', coatLen: 'mid'}, rate: 1.4, stride: strideFor(74 / 1.13 / 1.4, 140)},
];

/** A walker's feet + height at scene t (its plane's landing coords), or null outside its time. */
export const walkerAt = (w: Walker, t: number): {x: number; y: number; h: number; dir: 1 | -1} | null => {
  const T = t + S8_START; // film time
  if (T < w.t0 || T > w.t1) return null;
  const u = (T - w.t0) / (w.t1 - w.t0);
  return {
    x: w.from[0] + (w.to[0] - w.from[0]) * u,
    y: w.from[1] + (w.to[1] - w.from[1]) * u,
    h: w.from[2] + (w.to[2] - w.from[2]) * u,
    dir: w.to[0] >= w.from[0] ? 1 : -1,
  };
};

/** The walkers' heads: no skin crescent at the front of a profile head (one tone: nothing reads as a face). */
const NO_CHEEK = {cheek: false} as const;

const WalkerFig: React.FC<{w: Walker; t: number}> = ({w, t}) => {
  const p = walkerAt(w, t);
  if (!p) return null;
  const lampX = p.x + p.dir * p.h * 0.4;
  return (
    <S8Plane p={w.plane}>
      {/* flat tier C: ink 0 (no outline at any LOD), no cheek crescent (the head stays one tone) */}
      <Person x={p.x} y={p.y} h={p.h} seed={w.seed} pose={w.pose} view={w.view} flip={p.dir === 1} traits={w.traits} walk={w.pose === 'cycle' ? undefined : {rate: w.rate ?? 1.6}} stride={w.stride} ink={0} model={NO_CHEEK} />
      {w.lamp ? <Fill d={`M${(lampX - 4).toFixed(1)} ${(p.y - p.h * 0.4).toFixed(1)}h8v6h-8Z`} color={CM.lampCore} offset={false} seed={`${w.seed}/lamp`} /> : null}
    </S8Plane>
  );
};

/** Tiny figures on the far (south) towpath across the canal: seen left of the board and in the pre-truck gap. */
const FAR_SPOTS: FarSpot[] = [
  {x: 40, y: 944, h: 16, seed: 's8f1', vx: 9, wrap: [-60, 600]},
  {x: 210, y: 946, h: 15, seed: 's8f2', vx: -7, wrap: [-60, 600]},
  {x: 470, y: 947, h: 13, seed: 's8f3', vx: 6, wrap: [-60, 600]},
];

export const S8Public: React.FC = () => {
  const t = useTime();
  return (
    <Tier tier="environment">
      <S8Plane p="south">
        <FarCrowd spots={FAR_SPOTS} />
      </S8Plane>
      {WALKERS.map((w) => (
        <WalkerFig key={w.seed} w={w} t={t} />
      ))}
    </Tier>
  );
};

/** The un-build: nothing of the public is left to enter after this (conform_L6 §1: 38.72-39.08 is the un-build's). */
export const PUBLIC_QUIET_FROM = L(38.6);
