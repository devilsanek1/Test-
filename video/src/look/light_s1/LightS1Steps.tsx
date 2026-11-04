// light_s1: OUR BANK with light slots (light_proof.md §2.1): a copy of src/look/paint_s1/V2S1_steps.tsx's S1Steps (the
// seated slot: the bank plane -1 and the near plane -2), each plane's maps in its own float group right after what
// they light. Every part is imported unchanged from paint_s1; in look 'v6' the tree is v6's exactly.
import React from 'react';
import {Tier} from '../../lib/tier';
import {Shade} from '../../lib/light';
import {floodAt} from '../paint_s1/V2S1_clock';
import {BANDS, Coping, StoneBand, edgePath} from '../paint_s1/V2S1_steps_stone';
import {S1ForeMid, S1ForeNear, S1ForeNearOver, S1ForeNearUnder} from '../paint_s1/V2S1_fore';
import {S1Plane, S1_PLANE} from '../paint_s1/V2S1_float';
import {DuskOverlay} from '../paint_s1/dusk';
import {Seg, Slot} from './context';

export const LightS1Steps: React.FC = () => (
  <>
    <S1Plane plane={S1_PLANE.bank} over={<Slot name="bank" />}>
      <Seg name="bank">
        <Tier tier="environment">
          <Coping />
          <StoneBand k={0} />
        </Tier>
        {BANDS.slice(1).map((b) => (
          <React.Fragment key={b.k}>
            <Tier tier="environment">
              <StoneBand k={b.k} />
            </Tier>
            <Shade d={edgePath(b.k)} at={floodAt(540, b.y0)} />
            {b.k === 2 ? <S1ForeMid /> : null}
          </React.Fragment>
        ))}
      </Seg>
    </S1Plane>
    <S1Plane
      plane={S1_PLANE.near}
      under={
        <Seg name="nearunder">
          <S1ForeNearUnder />
        </Seg>
      }
      over={
        <>
          <Seg name="nearover">
            <S1ForeNearOver />
          </Seg>
          <Slot name="near" />
        </>
      }
    >
      <Seg name="near">
        <S1ForeNear />
      </Seg>
    </S1Plane>
    <DuskOverlay x={0} y={1206} w={1080} h={714} stops={[[0, '#FF9F5C', 0.6], [0.45, '#FFB98A', 0.3], [1, '#8F7CC0', 0.45]]} />
  </>
);
