// ShotSketch: one still per frame, a 9:16 pencil sketch of a shot type for the cinematic guidebook
// (docs/look/CINEMATIC_GUIDE.md). Data: public/look/cine_sketches.json = {sketches: [{name, rule, shot}]}, where `shot`
// uses SketchReel's Shot schema (els, camera; drawn at the camera's end state). Frame i = sketch i.
// Render one: npx remotion still src/entry-v3.tsx ShotSketch out/sketch_<i>.png --frame=<i>

import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {captionFontStack, useCaptionFont} from '../lib/font';
import {ShotView, type Shot} from './SketchReel';

export type SketchData = {sketches: {name: string; rule: string; shot: Shot}[]};

export const ShotSketch: React.FC<{data: SketchData}> = ({data}) => {
  useCaptionFont();
  const f = useCurrentFrame();
  const sk = data.sketches[Math.min(f, data.sketches.length - 1)];
  return (
    <AbsoluteFill style={{background: '#f3ebdd', fontFamily: captionFontStack}}>
      <ShotView shot={sk.shot} t={sk.shot.e} />
      <div style={{position: 'absolute', top: 70, left: 60, right: 60, textAlign: 'center', fontSize: 84, fontWeight: 700, color: '#4a443e'}}>{sk.name}</div>
      <div style={{position: 'absolute', bottom: 90, left: 70, right: 70, textAlign: 'center', fontSize: 42, lineHeight: 1.25, color: '#4a443e',
        background: 'rgba(243,235,221,0.9)', padding: '18px 10px'}}>{sk.rule}</div>
    </AbsoluteFill>
  );
};
