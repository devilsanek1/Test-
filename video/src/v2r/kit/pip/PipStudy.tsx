// PipStudy.tsx — a quick design study canvas (turnaround + poses, big) used while designing towpath Pip.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CM} from '../../palette';
import {Pip} from './Pip';
import {FACING} from './poses';
import {PoseName} from './poses';

export const STUDY = {w: 1600, h: 1300};

export const PipStudy: React.FC<{size?: number}> = ({size = 200}) => {
  const yaws = [FACING.front, FACING.frontRight, FACING.right, FACING.backRight, FACING.back, 180];
  const poses: PoseName[] = ['sit', 'alert', 'earsCover', 'earsDown', 'lookUp', 'tuck', 'leap'];
  return (
    <AbsoluteFill style={{background: CM.sky}}>
      <svg width={STUDY.w} height={STUDY.h}>
        <rect x={0} y={430} width={STUDY.w} height={420} fill={CM.stucco} />
        <rect x={0} y={850} width={STUDY.w} height={450} fill={CM.brickLight} />
        {yaws.map((yw, i) => (
          <Pip key={i} x={140 + i * 265} y={360} size={size} facing={yw} idle={0} seed={`s${i}`} />
        ))}
        {[-1, -0.6, -0.3, 0.3, 0.6, 1].map((lk, i) => (
          <Pip key={`l${i}`} x={140 + i * 265} y={760} size={size * 0.8} look={lk} idle={0} seed={`l${i}`} />
        ))}
        {(
          [
            ['earsCover', 'back'],
            ['earsCover', 'frontLeft'],
            ['earsDown', 'back'],
            ['earsDown', 'front'],
            ['lookUp', 'back'],
            ['tuck', 'left'],
            ['leap', 'left'],
          ] as const
        ).map(([p, f], i) => (
          <Pip key={`${p}${i}`} x={120 + i * 228} y={1180} size={size * 0.8} pose={p} facing={f} idle={0} seed={`p${i}`} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
