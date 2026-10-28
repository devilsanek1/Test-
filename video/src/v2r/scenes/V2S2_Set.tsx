// V2S2_Set (lane L2): the S2 set, conformed (conform_L2 §3-§6, §10; DIRECTION rules 2-8; CRAFT §c, §d, §f). Screen px at
// the 6.70 pose, FILM seconds (the scene wraps it in <TimeShift by={-6.1}>). ONE camera (V2S2_Ground: the VP (1400,
// 700)), planes stepping toward S2's air (V2S2_Wall S2_ATM), the gentle parallax float per plane (V2S2_Float S2Plane),
// tier C everywhere but the story pieces (they come in through the slots with their own tiers).
// Back to front:
//   plane +1   the wall (V2S2_Wall: the wing + its stepped tiers, the story windows, the overlay), the parapet pigeons
//              (they lift once, 7.85), the water + the far towpath + the far lamps (V2S2_Water), the far life (slot),
//              the passing boat (from 7.55), the ducks
//   plane -0.5 our towpath's far rows (V2S2_Near S2Towpath part 'far': the ground under the bank's things)
//   plane 0    our coping + railing (V2S2_Near S2Bank), Pip (slot) on the coping, the A-board (slot: drawn BEFORE the
//              kiosk so it slides out from behind it), the kiosk (its awning clear of SW5), the newsagent (slot), the
//              bench (its iron ends CM.line, never plum) with its people (slot drawn before the backrest)
//   plane -1   our towpath's near rows (part 'near'), the light on our towpath (V2S2_Light), the kiosk's foot (bundles,
//              crate), the dog lying at rest, the planter of grasses, the slim near lamp + the bike locked to it
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {Tier} from '../../lib/tier';
import {Pigeons} from '../kit/canal/life';
import {Newsstand} from '../kit/canal/newsstand';
import {Batch, Paint} from '../kit/canal/core';
import {seamTone} from '../../lib/depth';
import {S2Wall} from './V2S2_Wall';
import type {S2WallProps} from './V2S2_Wall';
import {S2Water, S2PassingBoat, S2Ducks} from './V2S2_Water';
import {S2Bank, S2Towpath, S2NearThings, S2KioskFoot} from './V2S2_Near';
import {S2TowpathLight, S2BankLight, S2PlanterForm} from './V2S2_Light';
import {S2Plane, S2_PLANE} from './V2S2_Float';
import {S2_BENCH, S2_BENCH_SEAT} from './V2S2_Layout';

export {S2_BENCH_SEAT};

/** The kiosk (kit Newsstand): cut by the left edge; its right end at x 104 so its awning (x1 + 26) stays clear of SW5
 *  (x >= 130 above y 1010). */
export const S2_KIOSK = {x0: -70, x1: 104, top: 918, ground: 1292};

/** The bench, back view (wood slats CM.line's lighter wood, iron ends CM.line: never plum): feet on S2_BENCH.y1. */
const BENCH_WOOD = '#B9744E';
const S2BenchBack: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    const {x0, x1, y1} = S2_BENCH;
    const w = x1 - x0;
    const h = w * 0.42;
    const cx = (x0 + x1) / 2;
    for (const k of [-0.42, 0.42]) b.rect(CM.line, cx + k * w - w * 0.025, y1 - h * 0.62, w * 0.05, h * 0.62);
    for (let s = 0; s < 3; s++) b.rect(s === 1 ? seamTone(BENCH_WOOD, 8) : BENCH_WOOD, cx - w / 2, y1 - h * (1 - s * 0.15), w, h * 0.1);
    b.rect(seamTone(BENCH_WOOD, 12), cx - w / 2 + 4, y1 - h * 0.55, w - 8, h * 0.06);
    return b;
  }, []);
  return <Paint b={b} seed="s2bench" misreg={false} />;
};

export type V2S2SetProps = Pick<S2WallProps, 'staffCoolAt' | 'storyOverlay' | 'storyTier'> & {
  /** The A-board TOLD THE BBC: drawn BEFORE the kiosk so it slides out from behind it. */
  aBoard?: React.ReactNode;
  /** The bench people (reporter + staffer), drawn before the bench's backrest. */
  bench?: React.ReactNode;
  /** The newsagent, in front of the kiosk's corner (drawn after it). */
  agent?: React.ReactNode;
  /** Pip on the coping at its seat (in front of the railing). */
  pip?: React.ReactNode;
  /** The far towpath's life (plane +1). */
  farLife?: React.ReactNode;
  /** Particles and other light life (drawn last, each in its own plane group). */
  extra?: React.ReactNode;
};

export const V2S2Set: React.FC<V2S2SetProps> = ({staffCoolAt, storyOverlay, storyTier, aBoard, agent, bench, pip, farLife, extra}) => (
  <>
    <S2Plane plane={S2_PLANE.wall}>
      <S2Wall staffCoolAt={staffCoolAt} storyOverlay={storyOverlay} storyTier={storyTier} />
      <Pigeons ledge={[90, 520, 652]} n={5} size={22} seed="s2parapet" liftAt={7.85} dir={1} ceil={600} />
      <S2Water />
      {farLife}
      <S2PassingBoat />
      <S2Ducks />
    </S2Plane>
    <S2Plane plane={-0.5}>
      <S2Towpath part="far" />
    </S2Plane>
    <S2Plane plane={S2_PLANE.subject}>
      <S2Bank />
      <S2BankLight />
      {pip}
      {aBoard}
      <Tier tier="environment">
        <Newsstand x0={S2_KIOSK.x0} x1={S2_KIOSK.x1} top={S2_KIOSK.top} ground={S2_KIOSK.ground} seed="s2news" />
      </Tier>
      {agent}
      <S2KioskFoot />
      {bench}
      <Tier tier="environment">
        <S2BenchBack />
      </Tier>
    </S2Plane>
    <S2Plane plane={S2_PLANE.towpath}>
      <S2Towpath part="near" />
      <S2TowpathLight />
      <S2NearThings />
      <S2PlanterForm />
    </S2Plane>
    {extra}
  </>
);
