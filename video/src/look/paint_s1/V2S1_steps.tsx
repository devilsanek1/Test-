// V2S1 helper (lane L1): OUR BANK, the bottom third y 1215-1920 (docs/v2/lanes/conform_L1.md §4-§7; THROUGHLINE §1.5:
// no stranger's back in any foreground). Things only on the steps; the small seated public only on the step by the
// water (the mid ground). The bottom third stays the densest band, made of BIG things at near scale (V2S1_fore), never
// of people and never an even scatter of small props (the orchestrator's G4 fix: the scatter read empty at 216 px).
//   tier C  the coping, the landing, five treads as calm two-tone stone blocks (V2S1_steps_stone); the foreground's
//           bench, planter + bay, crates, café set, parapet + pier (V2S1_fore)
//   light   RIG_CANAL (the assembly's Lit): the step edges one `Shade` step (they face away from the low western
//           sun); contact under every sitter and thing, casts along the light (right, a little toward us)
// Drawn back to front, each tread's stone before what stands on it. Pip's bollard and Pip are the pip slot's: x 610-790,
// y 1120-1302 stays clear.
import {DuskOverlay} from './dusk';
import React from 'react';
import {Tier} from '../../lib/tier';
import {Shade} from '../../lib/light';
import {floodAt} from './V2S1_clock';
import {BANDS, Coping, StoneBand, edgePath} from './V2S1_steps_stone';
import {S1ForeMid, S1ForeNear, S1ForeNearOver, S1ForeNearUnder} from './V2S1_fore';
import {S1Plane, S1_PLANE} from './V2S1_float';

/** Our bank: the `seated` slot (drawn after the water and the boats, before Pip; the light rig is the assembly's
 *  <Lit rig={RIG_CANAL}>). Every light shape lands with the flood at its spot: frame 0 is pale shapes only. */
export const S1Steps: React.FC = () => (
  <>
    <S1Plane plane={S1_PLANE.bank}>
    <Tier tier="environment">
      <Coping />
      <StoneBand k={0} />
    </Tier>
    {/* (the small seated public by the water is gone: at their depth they were smaller per metre than her across the
        water (check_depth: a size inversion); a few people at rest now sit on the far side, V2S1_set_far / _life) */}
    {BANDS.slice(1).map((b) => (
      <React.Fragment key={b.k}>
        <Tier tier="environment">
          <StoneBand k={b.k} />
        </Tier>
        {/* this step's edge faces away from the low western sun: one shade step, under what stands on the tread */}
        <Shade d={edgePath(b.k)} at={floodAt(540, b.y0)} />
        {b.k === 2 ? <S1ForeMid /> : null}
      </React.Fragment>
    ))}
    </S1Plane>
    {/* (the look test's texture: the near things' shadows on the treads and the props' strips go outside its mottle) */}
    <S1Plane plane={S1_PLANE.near} under={<S1ForeNearUnder />} over={<S1ForeNearOver />}>
      <S1ForeNear />
    </S1Plane>
    {/* (paint v5) the bank and the near things in the low sun: warm peach toward it (left), lilac away from it */}
    <DuskOverlay x={0} y={1206} w={1080} h={714} stops={[[0, '#FF9F5C', 0.6], [0.45, '#FFB98A', 0.3], [1, '#8F7CC0', 0.45]]} />
  </>
);
