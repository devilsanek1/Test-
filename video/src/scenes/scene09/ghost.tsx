// S09 hidden match-cut, fix round 2: the A2 GHOST. From the hidden cut (B.hidden, zoom 6) until the one pop in the
// pull-back's cruise (A2_BAND_UNTIL, zoom ~4.2, ~72 px/frame), Part B shows the WHOLE A2 view of Stoop Street drawn
// through the hidden-cut map (camera.ts a2ToBMat): StoopStreet itself (PartA's `ghost` mode: the set with its ground
// relight, neighbour, walkers, lamp post and clips, but no actors, lock or dusk dressing, which Part B draws live) under
// a time FROZEN on A2's last frame, over a flat sky-coloured backing that hides the hill behind A2's sky. So f73 equals
// f72 everywhere outside the moving actors (A2 world x 2 / 3 of the frame at the cut is the same composed transform:
// camMat(zoom 6) x a2ToBMat(0.25) = A2's zoom 1.5), and the pull-back first opens up more of Stoop Street, then pops to the
// hillside while the camera cruises. Draw it in TerraceHill's 'house4' wrap, after the house, before DoorMatch / A2Ground.

import React from 'react';
import {TimeShift, XG, skies, useTime} from '../../lib';
import {B} from './beats';
import {a2ToBMat} from './camera';
import {A2_BAND_UNTIL} from './matchcut';
import {GHOST_AT, PartA} from './PartA';

export const A2Ghost: React.FC = () => {
  const t = useTime();
  if (t < B.hidden || t >= A2_BAND_UNTIL) return null;
  return (
    <XG m={a2ToBMat}>
      {/* the World's day sky (Scene09 SKY's last key), opaque: the hill never shows through A2's sky wedges */}
      <rect x={-3000} y={-3000} width={8000} height={8000} fill={skies.day} />
      {/* (+1 ms: the frozen time sits safely past the walkers' `stop`) */}
      <TimeShift by={t - GHOST_AT - 0.001}>
        <PartA ghost />
      </TimeShift>
    </XG>
  );
};
