// cine/frame.tsx — a minimal full-bleed SVG root in canvas coordinates (1080 x 1920) for cine shots and dev
// previews. The core lane's full-bleed stage can host the same children instead (they only need an <svg> parent
// in canvas coordinates).
//
//   <CineFrame bg={TOD.dusk.skyBands[0]}> <CineCamera ...> <Layer depth={1}> ... </Layer> </CineCamera> </CineFrame>
//   <Shot from={6} to={12}> ...children see scene time t - 6, hidden outside [from, to)... </Shot>

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {canvas} from '../theme';
import {TimeShift, useTime} from '../time';

export const CineFrame: React.FC<{bg?: string; children?: React.ReactNode; overlay?: React.ReactNode}> = ({bg = '#000000', children, overlay}) => (
  <AbsoluteFill style={{background: bg, overflow: 'hidden'}}>
    <svg width={canvas.width} height={canvas.height} viewBox={`0 0 ${canvas.width} ${canvas.height}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}}>
      {children}
    </svg>
    {overlay}
  </AbsoluteFill>
);

/** A shot on a local clock: renders children only for t in [from, to), with time shifted so the shot starts at 0. */
export const Shot: React.FC<{from: number; to: number; children?: React.ReactNode}> = ({from, to, children}) => {
  const t = useTime();
  if (t < from || t >= to) return null;
  return <TimeShift by={from}>{children}</TimeShift>;
};
