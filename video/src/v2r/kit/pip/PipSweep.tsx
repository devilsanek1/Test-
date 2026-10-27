// PipSweep.tsx — a continuity test (render every frame and diff them: no frame may jump; scripts in the K5 README).
//   0-4 s    the watcher's head sweeps look -1 -> 1 (the face goes round from screen left through the back to the right)
//   4-8 s    the body turns back -> left -> front with a look of 0.4 (out of the watcher's back sector and round)
//   8-12 s   a pose ladder: earsCover (its turn to camera leads by 0.12 s) -> sit -> lookUp -> earsDown -> look 0.7
//   12-16 s  S1's beat: the head follows a walker going left, ears-cover from the front at 13.00, sit 13.60, hop 14.20
//   16-20 s  the size: 120 -> 44 -> 120 px (the 3/4 front head eases to a near profile below 72 px and back)
// The only jumps allowed are the test's own cuts at 4 / 8 / 12 / 16 s.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useTime} from '../../../lib/time';
import {CM} from '../../palette';
import {PipTrack} from './PipTrack';
import {Pip} from './Pip';
import {V2} from './geom';

export const SWEEP_DUR = 20;

export const PipSweep: React.FC = () => {
  const t = useTime();
  if (t < 8) {
    const look = t < 4 ? -1 + (2 * t) / 4 : 0.4;
    const yaw = t < 4 ? 160 : 160 + ((t - 4) / 4) * 200;
    return (
      <AbsoluteFill style={{background: CM.sky}}>
        <svg width={600} height={400}>
          <Pip x={300} y={320} size={180} facing={yaw} look={look} idle={0} seed="sweep" />
        </svg>
      </AbsoluteFill>
    );
  }
  if (t < 12) {
    return (
      <AbsoluteFill style={{background: CM.sky}}>
        <svg width={600} height={400}>
          <PipTrack
            x={300}
            y={320}
            size={180}
            idle={0}
            facing="back"
            keys={[
              {t: 8.2, pose: 'earsCover', dur: 0.12},
              {t: 9.0, pose: 'sit', dur: 0.25},
              {t: 9.6, pose: 'lookUp', dur: 0.3},
              {t: 10.6, pose: 'earsDown', dur: 0.35},
              {t: 11.4, look: 0.7, dur: 0.4},
            ]}
            t={t}
            seed="sweep"
          />
        </svg>
      </AbsoluteFill>
    );
  }
  if (t < 16) {
    const walker = (tt: number): V2 => [380 - Math.max(0, tt - 12.2) * 40, 150];
    return (
      <AbsoluteFill style={{background: CM.sky}}>
        <svg width={600} height={400}>
          <circle cx={walker(t)[0]} cy={walker(t)[1]} r={10} fill={CM.anchor} />
          <PipTrack
            x={330}
            y={330}
            size={150}
            idle={0}
            facing="back"
            keys={[
              {t: 12.3, target: walker},
              {t: 13.0, pose: 'earsCover', dur: 0.1},
              {t: 13.6, pose: 'sit', dur: 0.25},
              {t: 14.2, target: null, hop: {to: [150, 300], height: 60, dur: 0.45}},
            ]}
            t={t}
            seed="sweep"
          />
        </svg>
      </AbsoluteFill>
    );
  }
  const u = (t - 16) / 4;
  const size = 120 - 76 * Math.sin(Math.PI * u);
  return (
    <AbsoluteFill style={{background: CM.sky}}>
      <svg width={600} height={400}>
        <Pip x={300} y={330} size={size} facing="back" look={-0.6} idle={0} seed="sweep" />
      </svg>
    </AbsoluteFill>
  );
};
