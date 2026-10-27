// V2S1 helper (lane L1): HER and THE GHOST ROW (TREATMENT section 3-4; map s1RowAt / S1_ROW / GHOST_POP; the shot
// clock V2S1_clock). She walks out of the glass doors at 0.97 and strolls west; on each clause an outline copy of her,
// greyer each time, pops one step ahead; on "life" the whole row takes ONE step and three bare outlines pop down the bend.
// STUB: the kit's Her + GhostRow on the shared clock (the exports below are final; the builder replaces the bodies).
import React from 'react';
import {useTime, clamp} from '../../lib/time';
import * as MAP from '../world/map';
import {Her, GhostRow, strideFor} from '../kit/cast';
import {C, s1Step, s1HerXAt, S1_STEP_PX, HER_COAT_AT} from './V2S1_clock';

const STRIDE = strideFor(S1_STEP_PX, 170, 'rear34');

/** Her on the far towpath (from the step-out, 0.97) and the ghost row (from 2.00). The `towpath` slot. */
export const S1Row: React.FC = () => {
  const t = useTime();
  if (t < C.steppingOut) return null;
  const pose = MAP.s1RowAt(t)[0];
  const step = s1Step(t);
  const x = s1HerXAt(t);
  const look = t >= MAP.S1_HER_LOOK_BACK_AT ? clamp((t - MAP.S1_HER_LOOK_BACK_AT) / 0.22) : 0;
  return (
    <>
      {t >= C.ghostPops[0] ? <GhostRow step={step} stride={STRIDE} /> : null}
      {look > 0 ? (
        <Her x={x} y={pose.feetY} h={pose.h} pose="lookBack" look={look} view="rear34" step={step} stride={STRIDE} plant coatAt={HER_COAT_AT} />
      ) : (
        <Her x={x} y={pose.feetY} h={pose.h} pose="walk" view="rear34" step={step} stride={STRIDE} plant coatAt={HER_COAT_AT} />
      )}
    </>
  );
};

/** Her behind the glass doors (t < 0.97; frame 0 and the loop underlay included). The `behindDoor` slot. */
export const S1HerBehindDoor: React.FC = () => {
  const t = useTime();
  if (t >= C.steppingOut) return null;
  return <Her x={s1HerXAt(t)} y={MAP.S1_HER_STEP_OUT.feetFrom} h={MAP.S1_SHEET.herHAtFacade} pose="walk" view="rear34" step={s1Step(t)} stride={STRIDE} plant coatAt={HER_COAT_AT} />;
};
