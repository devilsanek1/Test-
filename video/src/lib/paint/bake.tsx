// lib/paint, the bake's input (NOTES.md "the bake"): one piece's FLAT shapes alone on a transparent frame, in its layer's
// own px, wrapped in the same contexts the scene draws them in (its tier, its light rig), so the painter starts from the
// exact flat colours and silhouette the film shows. A film registers one composition per piece (its entry), renders it
// once as a PNG at a time after its flood (scripts/render-frames.mjs, GL=angle), and hands the PNG to
// scripts/look/paint/paint.py. Nothing here is used at film render time.
import React from 'react';
import {AbsoluteFill} from 'remotion';

export const PaintBakeFrame: React.FC<{width: number; height: number; children?: React.ReactNode}> = ({width, height, children}) => (
  <AbsoluteFill style={{background: 'transparent'}}>
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      {children}
    </svg>
  </AbsoluteFill>
);
