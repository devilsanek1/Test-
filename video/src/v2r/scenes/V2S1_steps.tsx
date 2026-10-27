// V2S1 helper (lane L1): OUR BANK, the bottom third y 1215-1920 (docs/v2/lanes/conform_L1.md §4-§7; THROUGHLINE §1.5:
// no stranger's back in any foreground). Things only on the steps; the small seated public only on the step by the
// water (the mid ground). The bottom third stays the densest band, made of things and calm stone, never of people.
//   tier C  the coping, the landing, five treads as flat two-tone bands (V2S1_steps_stone), the things (V2S1_public)
//   tier B  the low row by the water (V2S1_public LowRow: kit Seated, support with its thin same-hue lines)
//   light   RIG_CANAL (the assembly's Lit): the step edges one `Shade` step (they face away from the low western
//           sun); contact under every sitter and thing, casts along the light (right, a little toward us)
// Drawn back to front, each tread's stone before what stands on it. Pip's bollard and Pip are the pip slot's: x 610-790,
// y 1120-1302 stays clear.
import React from 'react';
import {Tier} from '../../lib/tier';
import {CastShadow, ContactShadow, Shade, ShadowLayer} from '../../lib/light';
import {floodAt} from './V2S1_clock';
import {BANDS, Coping, StoneBand, edgePath} from './V2S1_steps_stone';
import {FOOT, Leaves, LowRow, ThingsOn} from './V2S1_public';

const Shadows: React.FC<{from: number; to: number}> = ({from, to}) => (
  <ShadowLayer>
    {FOOT.filter((f) => f.y >= from && f.y < to).map((f, i) => (
      <React.Fragment key={i}>
        <ContactShadow x={f.x} y={f.y} w={f.w} at={floodAt(f.x, f.y)} />
        {f.cast ? <CastShadow x={f.x} y={f.y} w={f.w * 0.8} h={f.h} at={floodAt(f.x, f.y)} /> : null}
      </React.Fragment>
    ))}
  </ShadowLayer>
);

/** Our bank: the `seated` slot (drawn after the water and the boats, before Pip; the light rig is the assembly's
 *  <Lit rig={RIG_CANAL}>). Every light shape lands with the flood at its spot: frame 0 is pale shapes only. */
export const S1Steps: React.FC = () => (
  <>
    <Tier tier="environment">
      <Coping />
      <StoneBand k={0} />
    </Tier>
    <Shadows from={1230} to={BANDS[1].y0} />
    <LowRow />
    {BANDS.slice(1).map((b) => (
      <React.Fragment key={b.k}>
        <Tier tier="environment">
          <StoneBand k={b.k} />
        </Tier>
        {/* this step's edge faces away from the low western sun: one shade step, under what stands on the tread */}
        <Shade d={edgePath(b.k)} at={floodAt(540, b.y0)} />
        <Shadows from={b.y0} to={b.y1 + (b.k === 5 ? 200 : 0)} />
        <Tier tier="environment">
          <ThingsOn band={b.k} />
        </Tier>
      </React.Fragment>
    ))}
    <Tier tier="environment">
      <Leaves />
    </Tier>
  </>
);
