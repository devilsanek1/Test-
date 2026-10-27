// PipZoom.tsx — a design-study canvas: a few poses big, to judge the line and the details.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CM} from '../../palette';
import {Pip, PipProps} from './Pip';

export const ZOOM = {w: 1600, h: 560};

export const PipZoom: React.FC<{items?: Partial<PipProps>[]; size?: number}> = ({items, size = 300}) => {
  const list: Partial<PipProps>[] = items ?? [
    {facing: 'front'},
    {facing: 'back'},
    {pose: 'earsCover', facing: 'frontLeft'},
    {pose: 'lookUp', facing: 'back'},
  ];
  const gap = ZOOM.w / list.length;
  return (
    <AbsoluteFill style={{background: CM.sky}}>
      <svg width={ZOOM.w} height={ZOOM.h}>
        {list.map((it, i) => (
          <Pip key={i} x={gap * (i + 0.5)} y={ZOOM.h - 80} size={size} idle={0} seed={`z${i}`} {...it} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};
