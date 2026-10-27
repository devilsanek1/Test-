// K4 cast: the named extras.
//   <Stranger x={310} y={1120} h={150} />            S5: the public, on a bench with an open newspaper (start 120-200 px
//                                                     seated; the end frame's tiny figure at the balustrade 30-45 px)
//   <CafeOwner x={...} y={...} h={170} wipeAt={35.72} reachFrom={[..]} reachTo={[..]} />
//                                                     S8: a small back with an apron and a cloth; wipes the board in one
//                                                     stroke (the hand travels reachFrom -> reachTo, relative to her feet)

import React from 'react';
import {clamp, ease, useTime} from '../../../lib/time';
import {CM} from '../../palette';
import {Model} from './body';
import {BuildProps, Person, Seated} from './People';
import {Traits} from './traits';
import {circlePath, curve, FigureG, Parts, Pt} from './parts';
import {tieredAll} from '../tiers';

export const STRANGER: Partial<Traits> & Partial<Model> = {
  hair: 'short',
  hairColor: CM.hair[3],
  coat: CM.coatMustard,
  coatLen: 'mid',
  acc: 'none',
  skin: CM.brickDeep,
  broad: 1.02,
  tall: 1,
};

export type StrangerProps = BuildProps & {
  /** Seat line (canvas px). */
  x: number;
  y: number;
  /** Seated height. */
  h?: number;
  /** A page turn (the paper lifts a hair) at these times. */
  turnPageAt?: number[];
  seed?: string;
};

/** The stranger on the S5 bench, reading an open newspaper (no masthead, no legible words). */
const StrangerBody: React.FC<StrangerProps> = ({x, y, h = 150, turnPageAt = [], at, fillLag, seed = 'stranger'}) => {
  const t = useTime();
  let lift = 0;
  for (const a of turnPageAt) if (t >= a && t < a + 0.4) lift = Math.sin(((t - a) / 0.4) * Math.PI) * h * 0.02;
  return <Seated x={x} y={y - lift} h={h} seed={seed} traits={STRANGER} model={STRANGER} read at={at} fillLag={fillLag} />;
};
export const Stranger = tieredAll('support', {lines: true}, StrangerBody);

export const CAFE_OWNER: Partial<Traits> & Partial<Model> = {
  hair: 'bun',
  hairColor: CM.hair[4],
  coat: CM.brickDeep,
  coatLen: 'jacket',
  trousers: CM.anchor,
  shoes: CM.line,
  acc: 'none',
  skin: CM.brickLight,
  broad: 1,
  tall: 1,
  apron: CM.coatOat,
};

export type CafeOwnerProps = BuildProps & {
  /** Feet (canvas px). */
  x: number;
  y: number;
  h?: number;
  /** The wipe: the cloth hand travels reachFrom -> reachTo (relative to the feet, px) over wipeDur from wipeAt. */
  wipeAt?: number;
  wipeDur?: number;
  reachFrom?: Pt;
  reachTo?: Pt;
  /** Mirror (wiping toward screen right). */
  flip?: boolean;
  seed?: string;
};

/** The café owner: a small back in an apron with a cloth; one wiping stroke across the board. */
const CafeOwnerBody: React.FC<CafeOwnerProps> = ({x, y, h = 170, wipeAt, wipeDur = 0.45, reachFrom, reachTo, flip, at, fillLag, seed = 'cafeOwner'}) => {
  const t = useTime();
  const from: Pt = reachFrom ?? [-h * 0.12, -h * 0.68];
  const to: Pt = reachTo ?? [-h * 0.5, -h * 0.6];
  const k = wipeAt === undefined ? 0 : ease.inOutCubic(clamp((t - wipeAt) / wipeDur));
  const hand: Pt = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k - Math.sin(k * Math.PI) * h * 0.03];
  const rag = clothParts(hand, h);
  return (
    <>
      <Person x={x} y={y} h={h} exact seed={seed} traits={CAFE_OWNER} model={CAFE_OWNER} pose="reach" view="back" reach={hand} flip={flip} at={at} fillLag={fillLag} />
      <FigureG x={x} y={y} flip={flip} seed={`${seed}/cloth`}>
        <Parts parts={rag} inkPx={h >= 130 ? 2.2 : 1.6} offset={[1.5, 1]} seed="cafeCloth" at={at} fillLag={fillLag} />
      </FigureG>
    </>
  );
};
export const CafeOwner = tieredAll('support', {lines: true}, CafeOwnerBody);

function clothParts(hand: Pt, h: number) {
  const [x, y] = hand;
  const s = h * 0.06;
  const d = curve(
    [
      [x - s * 0.9, y - s * 0.6],
      [x + s * 0.4, y - s * 0.9],
      [x + s * 1.0, y - s * 0.1],
      [x + s * 0.6, y + s * 0.9],
      [x - s * 0.2, y + s * 1.1],
      [x - s * 1.0, y + s * 0.4],
    ],
    true,
    0.5,
  );
  return [
    {k: 'cloth', d, fill: CM.paper, ink: d, w: 0.8},
    {k: 'clothHand', d: circlePath(x + s * 0.2, y + s * 0.15, h * 0.022), fill: CM.brickLight},
  ];
}
