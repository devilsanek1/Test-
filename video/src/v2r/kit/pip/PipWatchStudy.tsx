// PipWatchStudy.tsx — a design study for the watcher ("watch34") and the turn to camera: forced body / head yaws on a
// grid, then the shipped defaults (watchYaw) at every size. Dev only.
//   npx remotion still src/entry-v2r-pip.tsx PipWatchStudy <out.png> --frame=0 --gl=angle
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {captionFontStack, useCaptionFont} from '../../../lib/font';
import {CM} from '../../palette';
import {Pip, PipDrawing, PipProps} from './Pip';
import {poseParams, PoseName} from './poses';

export const WATCH_STUDY = {w: 2160, h: 2200};

const L: React.FC<{x: number; y: number; t: string; s?: number}> = ({x, y, t, s = 22}) => (
  <text x={x} y={y} fontFamily={captionFontStack} fontSize={s} fill={CM.ink} textAnchor="middle">
    {t}
  </text>
);

export const PipWatchStudy: React.FC = () => {
  useCaptionFont();
  const heads = [220, 250, 270, 285, 300, 315, 330];
  const bodies = [180, 200, 220, 240];
  const cover: [number, number][] = [
    [220, 300],
    [250, 340],
    [270, 350],
    [300, 352],
    [330, 355],
    [350, 355],
  ];
  const defaults: [string, Partial<PipProps>][] = [
    ['back look -0.6', {facing: 'back', look: -0.6}],
    ['back look +0.6', {facing: 'back', look: 0.6}],
    ['back (no look)', {facing: 'back'}],
    ['backLeft (no look)', {facing: 'backLeft'}],
    ['watch34', {pose: 'watch34' as PoseName}],
    ['lookUp L', {facing: 'back', pose: 'lookUp', look: -0.5}],
    ['earsDown', {facing: 'backLeft', pose: 'earsDown'}],
    ['earsCover', {facing: 'back', pose: 'earsCover', look: -0.5}],
  ];
  const sizes = [120, 96, 72, 60, 44];
  const sit = {...poseParams('sit'), breath: 0};
  return (
    <AbsoluteFill style={{background: CM.paper}}>
      <svg width={WATCH_STUDY.w} height={WATCH_STUDY.h}>
        <rect x={0} y={0} width={WATCH_STUDY.w} height={440} fill={CM.bandGold} />
        <L x={300} y={40} t="A · body 220 (3/4 back L), head yaw sweep, 120 px" s={28} />
        {heads.map((h, i) => (
          <g key={h}>
            <PipDrawing x={150 + i * 290} y={330} size={160} params={sit} yaws={{body: 220, head: h}} seed={`a${i}`} />
            <L x={150 + i * 290} y={380} t={`head ${h}`} />
          </g>
        ))}
        <rect x={0} y={440} width={WATCH_STUDY.w} height={440} fill={CM.sky} />
        <L x={300} y={480} t="B · head 300, body yaw sweep" s={28} />
        {bodies.map((b, i) => (
          <g key={b}>
            <PipDrawing x={150 + i * 290} y={770} size={160} params={sit} yaws={{body: b, head: 300}} seed={`b${i}`} />
            <L x={150 + i * 290} y={820} t={`body ${b}`} />
          </g>
        ))}
        {bodies.map((b, i) => (
          <g key={`s${b}`}>
            <PipDrawing x={1350 + i * 200} y={770} size={96} params={sit} yaws={{body: b, head: 300}} seed={`bs${i}`} />
          </g>
        ))}
        <rect x={0} y={880} width={WATCH_STUDY.w} height={440} fill={CM.stucco} />
        <L x={300} y={920} t="C · ears-cover from the front: body / head" s={28} />
        {cover.map(([b, h], i) => (
          <g key={`c${i}`}>
            <PipDrawing x={150 + i * 330} y={1210} size={160} params={{...poseParams('earsCover'), toCam: 0, look: 0, breath: 0}} yaws={{body: b, head: h}} seed={`c${i}`} />
            <L x={150 + i * 330} y={1260} t={`${b} / ${h}`} />
          </g>
        ))}
        <rect x={0} y={1320} width={WATCH_STUDY.w} height={880} fill={CM.bandSunset} />
        <L x={360} y={1360} t="D · shipped defaults (watchYaw) at 120 / 96 / 72 / 60 / 44 px" s={28} />
        {defaults.map(([lab, pr], i) => (
          <g key={lab}>
            {sizes.map((sz, j) => (
              <Pip key={sz} x={140 + i * 265} y={1500 + j * 150 - (sz > 90 ? 0 : 20)} size={sz} idle={0} t={0} seed={`d${i}`} {...pr} />
            ))}
            <L x={140 + i * 265} y={2180} t={lab} />
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
