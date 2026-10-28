// V2S3_light.tsx (lane L3): the shot's LIGHT LAYERS under RIG_CANAL at sunset (docs/look/CRAFT.md §d, THROUGHLINE §5,
// lib/LIGHT.md; S1's V2S1_light.tsx is the model). The key is the low western sun at screen left (sunLight toward 15,
// el 36, casts capped at 0.8 h): shadows fall right and a little toward us. Every shape is a flat multiply step of the
// film's ONE tint family (rigs.ts TINT_CANAL; on the water its `water` tint) or a flat lighter step; nothing here
// draws outside V2S3.tsx's <Lit rig={RIG_CANAL}>, and `{"lightOff": true}` turns it all off (check_light's A side).
//   S3TerraceShades  the terrace's ShadeSink (V2S3_tParts): planes turned from the sun and undersides one Shade step,
//                    the casts of sills, lintels, hoods, cornices, door cases, the balcony and the boxes; FormShade on
//                    the chimney stacks and the bay (the side away from the sun)
import React from 'react';
import {FormShade, Shade, Shadow, ShadowLayer} from '../../lib/light';
import type {ShadeSink} from './V2S3_tParts';

/** A ShadeSink drawn as the rig's tint family: casts (one multiply layer) and form steps; FormShade on round or boxy
 *  things given by their silhouette path. */
export const S3TerraceShades: React.FC<{sink: ShadeSink; stacks?: string[]; bay?: string}> = ({sink, stacks, bay}) => (
  <>
    {sink.cast.length ? (
      <ShadowLayer>
        <Shadow d={sink.cast.join('')} tint="cast" />
      </ShadowLayer>
    ) : null}
    {sink.form.length ? <Shade d={sink.form.join('')} /> : null}
    {stacks?.map((d, i) => (
      <FormShade key={i} d={d} />
    ))}
    {bay ? <FormShade d={bay} /> : null}
  </>
);
