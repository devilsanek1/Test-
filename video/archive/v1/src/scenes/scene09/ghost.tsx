// S09 hidden match-cut: the A2 GHOST. From the hidden cut (B.hidden, zoom 6) Part B shows the WHOLE A2 view of Stoop
// Street drawn through the hidden-cut map (camera.ts a2ToBMat): StoopStreet itself (PartA's `ghost` mode: the set with its
// ground relight, neighbour, walkers, lamp post and clips, but no actors, lock or dusk dressing, which Part B draws live)
// under a time FROZEN on A2's last frame, over a flat sky-coloured backing that hides the hill behind A2's sky. So f73
// equals f72 everywhere outside the moving actors (camMat(zoom 6) x a2ToBMat = A2's zoom 1.5), and the pull-back first
// opens up more of Stoop Street.
// Fix round 2b: it no longer leaves in ONE full-frame pop in the cruise (a jump cut at ~72 px/frame); on 'to install' it
// comes apart outward from door #4 in four steps (matchcut.tsx GHOST, f79 -> f83, camera < ~50 px/frame): the lamp post /
// walkers / puddle, then the blocks right and left of the hero house (clipped away in A2 world above the street line),
// then the hero house and the street. Draw it in TerraceHill's 'house4' wrap, after the house, before DoorMatch / A2Ground.

import React, {useId} from 'react';
import {TimeShift, XG, skies, useTime} from '../../lib';
import {B} from './beats';
import {a2ToBMat} from './camera';
import {GHOST, GHOST_CUT} from './matchcut';
import {GHOST_AT, PartA} from './PartA';

const BIG = 20000;

export const A2Ghost: React.FC = () => {
  const t = useTime();
  const uid = 's9gh' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t < B.hidden || t >= GHOST.all) return null;
  const step = t >= GHOST.left ? 3 : t >= GHOST.right ? 2 : t >= GHOST.props ? 1 : 0;
  const {left, right, street} = GHOST_CUT;
  // what is left of the ghost (A2 world): everything; then the hero column + the street band
  const keep: [number, number, number, number][] =
    step >= 3
      ? [
          [left, -BIG, right - left, BIG * 2],
          [-BIG, street, BIG * 2, BIG],
        ]
      : step >= 2
        ? [
            [-BIG, -BIG, right + BIG, BIG * 2],
            [-BIG, street, BIG * 2, BIG],
          ]
        : [];
  const body = (
    <>
      {/* the World's day sky (Scene09 SKY's last key), opaque: the hill never shows through A2's sky wedges */}
      <rect x={-3000} y={-3000} width={8000} height={8000} fill={skies.day} />
      {/* (+1 ms: the frozen time sits safely past the walkers' `stop`) */}
      <TimeShift by={t - GHOST_AT - 0.001}>
        <PartA ghost ghostStep={step} />
      </TimeShift>
    </>
  );
  return (
    <XG m={a2ToBMat}>
      {keep.length ? (
        <>
          <defs>
            <clipPath id={uid} clipPathUnits="userSpaceOnUse">
              {keep.map((r, i) => (
                <rect key={i} x={r[0]} y={r[1]} width={r[2]} height={r[3]} />
              ))}
            </clipPath>
          </defs>
          <g clipPath={`url(#${uid})`}>{body}</g>
        </>
      ) : (
        body
      )}
    </XG>
  );
};
