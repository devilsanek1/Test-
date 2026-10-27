// V2S8 cast (lane L6). First pass by the L6 orchestrator (builder D may refine it; keep the contract maths).
// HER walking home up the lane (back view, the house plane: herAt + planeOffset('house')), at her door 34.50 (goIn),
// through the doorway by 34.68 (the closing door leaf, V2S8_house, covers her); THE GHOSTS (three, G4-G6's cues) pop on
// "can't" ahead of her, left of her door, and the truck slides them in front of her shut door (map S8.ghosts, the
// 240 plane); they un-build LAST (LateExit). THE PUBLIC: life on the lane at its own planes, all crossing SIDEWAYS or
// walking away (STYLE.md DENSE-CALM: nothing coming at us), never teal, never her signature, never over her, the board
// text, Pip or the ghosts' heads.
import React from 'react';
import {Fill} from '../../lib/Fill';
import {useTime, clamp} from '../../lib/time';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {Her, Person, S8Ghosts, strideFor, FarCrowd, type FarSpot, type TraitOverrides} from '../kit/cast';
import {herAt, herStep, planeOffset, S8T, S8_START} from './V2S8_clock';
import {LateExit} from './V2S8_exit';

// ---------------------------------------------------------------- her

/** Her flat sunset shadow: the low sun is AHEAD (SUN8, west), so it falls toward us, short and a little right. */
const shadowPath = (x: number, y: number, h: number) => {
  const sx = x - MAP.SUN8.x;
  const sy = y - MAP.SUN8.y;
  const n = Math.hypot(sx, sy) || 1;
  const len = h * 0.3;
  const ex = x + (sx / n) * len;
  const ey = y + (sy / n) * len;
  const w = h * 0.13;
  return `M${(x - w).toFixed(1)} ${y.toFixed(1)}Q${((x + ex) / 2 - w).toFixed(1)} ${((y + ey) / 2).toFixed(1)} ${(ex - w * 0.4).toFixed(1)} ${ey.toFixed(1)}L${(ex + w * 0.4).toFixed(1)} ${ey.toFixed(1)}Q${((x + ex) / 2 + w).toFixed(1)} ${((y + ey) / 2).toFixed(1)} ${(x + w).toFixed(1)} ${y.toFixed(1)}Z`;
};

export const S8Her: React.FC = () => {
  const t = useTime();
  const p = herAt(t);
  if (!p) return null;
  const x = p.x + planeOffset('house', t);
  const atDoor = t >= S8T.herAtDoor;
  // her last step lands on the door step; then one foot up and a hand to the handle (the door's right side)
  const up = atDoor ? clamp((t - S8T.herAtDoor) / 0.1) : 0;
  return (
    <>
      <Fill d={shadowPath(x, p.y, p.h)} color={CM.stoneShade} offset={false} seed="s8herShadow" />
      {atDoor ? (
        <Her x={x} y={p.y} h={p.h} pose="goIn" reach={[p.h * 0.2, -p.h * (0.56 + 0.02 * up)]} seed="herS8" />
      ) : (
        <Her x={x} y={p.y} h={p.h} pose="walk" view="back" step={herStep(t)} stride={strideFor(21, p.h, 'back')} seed="herS8" />
      )}
    </>
  );
};

// ---------------------------------------------------------------- the ghosts

/** The kit's S8Ghosts at map S8.ghosts on the 240 plane; its default pop time is FILM time, so pass the scene time. */
export const S8GhostsLayer: React.FC = () => {
  const t = useTime();
  return (
    <LateExit>
      <S8Ghosts at={S8T.cant} dx={planeOffset('ghosts', t)} view="back" stagger={0.04} />
    </LateExit>
  );
};

// ---------------------------------------------------------------- the public

type Walker = {
  seed: string;
  /** Plane the figure travels with. */
  plane: 'house' | 'far' | 'board';
  /** Film times: enters / leaves. */
  t0: number;
  t1: number;
  /** Landing-pose feet at t0 and t1 (+ heights). */
  from: [number, number, number];
  to: [number, number, number];
  pose: 'walk' | 'jog' | 'cycle';
  view: 'back' | 'profile' | 'rear34';
  traits: TraitOverrides;
  rate?: number;
  /** A lit bike lamp (cycle only). */
  lamp?: boolean;
};

const WALKERS: Walker[] = [
  // pre-truck: a far walker beyond the bend heading away (seen in the gap between the board and her house)
  {seed: 's8far1', plane: 'house', t0: 32.6, t1: 35.2, from: [612, 1004, 74], to: [540, 978, 62], pose: 'walk', view: 'rear34', traits: {hair: 'cap', coat: CM.coatSlate, acc: 'backpack'}, rate: 1.7},
  // pre-truck: a neighbour strolling right along the forecourt, away from her door (in the rail: a mass)
  {seed: 's8nb1', plane: 'house', t0: 32.6, t1: 35.9, from: [930, 1074, 146], to: [1330, 1078, 148], pose: 'walk', view: 'profile', traits: {hair: 'short', hairColor: CM.hair[3], coat: CM.coatOat, acc: 'strap', coatLen: 'mid'}, rate: 1.5},
  // after the truck: a cyclist with a lit lamp crossing the forecourt right -> left, behind the ghosts, then behind the board
  {seed: 's8cyc', plane: 'house', t0: 35.75, t1: 38.6, from: [1300, 1064, 140], to: [600, 1060, 136], pose: 'cycle', view: 'profile', traits: {hair: 'beanie', coat: CM.coatMustard, acc: 'none'}, lamp: true},
  // after the truck: a jogger crossing left -> right along the forecourt, from behind the board, behind the ghosts
  {seed: 's8jog', plane: 'house', t0: 36.95, t1: 38.9, from: [600, 1066, 146], to: [1320, 1070, 150], pose: 'jog', view: 'profile', traits: {hair: 'short', hairColor: CM.hair[1], coat: CM.brickDeep, acc: 'headphones', coatLen: 'jacket'}, rate: 2.8},
];

const WalkerFig: React.FC<{w: Walker; t: number}> = ({w, t}) => {
  const T = t + S8_START; // film time
  if (T < w.t0 || T > w.t1) return null;
  const u = (T - w.t0) / (w.t1 - w.t0);
  const x = w.from[0] + (w.to[0] - w.from[0]) * u + planeOffset(w.plane, t);
  const y = w.from[1] + (w.to[1] - w.from[1]) * u;
  const h = w.from[2] + (w.to[2] - w.from[2]) * u;
  const dir = w.to[0] >= w.from[0] ? 1 : -1;
  const flip = dir === 1;
  const lampX = x + (flip ? 1 : -1) * h * 0.4;
  return (
    <>
      <Person x={x} y={y} h={h} seed={w.seed} pose={w.pose} view={w.view} flip={flip} traits={w.traits} walk={w.pose === 'cycle' ? undefined : {rate: w.rate ?? 1.6}} />
      {w.lamp ? <Fill d={`M${(lampX - 4).toFixed(1)} ${(y - h * 0.4).toFixed(1)}h8v6h-8Z`} color={CM.lampCore} offset={false} seed={`${w.seed}/lamp`} /> : null}
    </>
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
    <>
      <g transform={`translate(${planeOffset('south', t).toFixed(2)} 0)`}>
        <FarCrowd spots={FAR_SPOTS} />
      </g>
      {WALKERS.map((w) => (
        <WalkerFig key={w.seed} w={w} t={t} />
      ))}
    </>
  );
};
