// V2S3_nfolk.tsx (lane L3, V2S3 NEAR helper; WORLD px at the 12.98 match, inside V2S3's camera): two walkers on OUR
// towpath, seen as head-backs cut by the bottom of the frame (reference 1's front row; the owner's people rule: small
// and simple, at most ~140 px WIDE, no faces): one in a beanie strolling RIGHT, one in a cap strolling LEFT, both
// bobbing on their steps (drawn at 12 drawings/s; the travel moves every frame). Each turns its head once: the cap
// toward the boat, the beanie toward the robin on the logs. Never teal. Their cut line sits below the frame's bottom
// (world y 1996), so the 5 % ease-back only reveals more shoulder, never their end.
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {NearBack} from '../kit/cast';
import type {TraitOverrides} from '../kit/cast';

type Walker = {
  seed: string;
  /** Shoulder centre x at the match (12.98) and travel speed (px/s, + = right). */
  x0: number;
  v: number;
  /** Steps per second (the bob: once per step), phase in steps. */
  rate: number;
  phase: number;
  hv: number;
  traits: TraitOverrides;
  /** Head turn keys [t, turn]. */
  turns?: [number, number][];
};

const CUT_Y = 1996;
const T0 = 12.98;

export const S3_WALKERS: Walker[] = [
  {seed: 's3walkA', x0: 96, v: 108, rate: 1.75, phase: 0.2, hv: 168, traits: {hair: 'beanie', hatColor: CM.leafRust, hairColor: CM.hair[1], coat: CM.coatSlate, acc: 'scarf', accColor: CM.coatMustard, broad: 0.96}, turns: [[14.06, 0.42], [14.62, 0.1]]},
  {seed: 's3walkB', x0: 772, v: -98, rate: 1.6, phase: 0.65, hv: 174, traits: {hair: 'cap', hatColor: CM.coatPlum, hairColor: CM.hair[4], coat: CM.coatOat, acc: 'strap', accColor: CM.line, broad: 0.94}, turns: [[13.52, -0.5], [14.3, 0]]},
];

const keyed = (t: number, keys: [number, number][] | undefined, dur = 0.28) => {
  let v = 0;
  let from = 0;
  for (const [at, to] of keys ?? []) {
    if (t < at) break;
    const u = Math.min(1, (t - at) / dur);
    v = from + (to - from) * u * u * (3 - 2 * u);
    from = to;
  }
  return v;
};

export const S3HeadBacks: React.FC = () => {
  const t = useTime();
  const tq = Math.floor(t * 12 + 1e-6) / 12; // drawn bob at 12 drawings/s
  return (
    <>
      {S3_WALKERS.map((w) => {
        const steps = (tq - T0) * w.rate + w.phase;
        const bob = Math.abs(Math.sin(steps * Math.PI)) * 4.5;
        const sway = Math.sin(steps * Math.PI * 0.5) * 2;
        const x = w.x0 + w.v * (t - T0) + sway;
        return <NearBack key={w.seed} x={x} y={CUT_Y - bob} hv={w.hv} seed={w.seed} traits={w.traits} turn={keyed(t, w.turns)} ink={3.4} />;
      })}
    </>
  );
};
