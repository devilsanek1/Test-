// PipSweep.tsx — a continuity test: the head sweeps look -1 -> 1 (0-4 s, from behind), the body turns back -> left ->
// front (4-8 s) with a look of 0.4, and a pose ladder blends sit -> earsCover -> sit -> lookUp -> earsDown (8-12 s).
// Render every frame and diff them: no frame may jump (scripts in the K5 README).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {useTime} from '../../../lib/time';
import {CM} from '../../palette';
import {PipTrack} from './PipTrack';
import {Pip} from './Pip';

export const PipSweep: React.FC = () => {
  const t = useTime();
  const look = t < 4 ? -1 + (2 * t) / 4 : 0.4;
  const yaw = t < 4 ? 160 : t < 8 ? 160 + ((t - 4) / 4) * 200 : 160;
  return (
    <AbsoluteFill style={{background: CM.sky}}>
      <svg width={600} height={400}>
        {t < 8 ? (
          <Pip x={300} y={320} size={180} facing={yaw} look={look} idle={0} seed="sweep" />
        ) : (
          <PipTrack
            x={300}
            y={320}
            size={180}
            idle={0}
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
        )}
      </svg>
    </AbsoluteFill>
  );
};
