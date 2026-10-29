// PT lane: the mottle's calibration frame. Flat fields across the value range (paper L* 95 to a dark L* 33), each
// stripe 135 px wide x 1500 tall, wrapped in ONE <Mottle> (band off), so the meter reads std, blotch radius and colour
// per fill from pixels. props: k, seed, scale, chroma, cal (overrides), dx/dy (the group's offset: the float test).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Mottle} from '../../lib/texture';

export const CAL_FIELDS = ['#FBF3EA', '#F4D6C2', '#C5DDD3', '#E3B9A3', '#C9806A', '#86B4AC', '#9A6B5C', '#3A5065'];

export const PtTextureCal: React.FC<{k?: number; seed?: number; scale?: number; chroma?: number; cal?: Record<string, number>; dx?: number; dy?: number; band?: boolean; big?: string}> = ({k = 1, seed = 5, scale = 1, chroma = 1, cal, dx = 0, dy = 0, band = false, big}) => (
  <AbsoluteFill style={{background: '#FFFFFF'}}>
    <svg width={1080} height={1920} viewBox="0 0 1080 1920">
      <g transform={`translate(${dx} ${dy})`}>
        <Mottle k={k} seed={seed} scale={scale} chroma={chroma} cal={cal} band={band ? [290, 600] : null} offset={[dx, dy]}>
          {big ? (
            <rect x={-40} y={-40} width={1160} height={2000} fill={big} />
          ) : (
            CAL_FIELDS.map((c, i) => <rect key={c} x={i * 135} y={160} width={135} height={1600} fill={c} />)
          )}
        </Mottle>
      </g>
    </svg>
  </AbsoluteFill>
);
