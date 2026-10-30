// The people design study, direction C (MODERN GRAPHIC), FACE OPTIONS (docs/look/people_design/faces_graphic.md; the
// components: src/look/people_dirs/graphic_faces/, a copy of graphic/'s head, hair, headwear and cast with the face as a
// variant parameter). Stills only (an ITERATION). Self-contained, like the direction's own entry.
//   FcSheet   the sheet (docs/look/people_design/faces_graphic.png), one frame, 2400 px wide (props: rec).
//   FcTest    heads magnified in a row (props: items [{who, view, face}], mag), for quick looks.
// The still (one render at a time on the shared CPUs):
//   node scripts/render-frames.mjs FcSheet <dir> 0 --entry=src/entry-look-people-graphic-faces.tsx --concurrency=1
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {FacesSheet, FACES_W, FACES_H} from './look/people_dirs/graphic_faces/Sheet';
import {build, type Who, type View} from './look/people_dirs/graphic_faces/cast';
import type {FaceOpt} from './look/people_dirs/graphic_faces/head';
import {Figure} from './look/people_dirs/graphic/Figure';
import {BG} from './look/people_dirs/graphic/palette';

type TestProps = {items: {who: Who; view: View; face: FaceOpt}[]; mag: number};
const TW = 2000;
const TH = 700;
const FcTest: React.FC<TestProps> = ({items, mag}) => {
  const colW = TW / Math.max(1, items.length);
  return (
    <AbsoluteFill style={{background: BG.sheet}}>
      <svg width={TW} height={TH} viewBox={`0 0 ${TW} ${TH}`}>
        {items.map((it, i) => {
          const fig = build(it.who, it.view, it.face);
          const H = 640 * mag;
          const s = H / 1000;
          const cx = colW * (i + 0.5) - fig.head[0] * s;
          const cy = TH * 0.4 - fig.head[1] * s;
          return (
            <g key={i}>
              <clipPath id={`t${i}`}>
                <rect x={colW * i + 4} y={4} width={colW - 8} height={TH - 8} />
              </clipPath>
              <g clipPath={`url(#t${i})`}>
                <Figure fig={fig} x={cx} y={cy + H} h={H} uid={`t${i}`} />
              </g>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Root: React.FC = () => (
  <>
    <Composition id="FcSheet" component={FacesSheet} durationInFrames={1} fps={60} width={FACES_W} height={FACES_H} defaultProps={{rec: undefined}} />
    <Composition
      id="FcTest"
      component={FcTest}
      durationInFrames={1}
      fps={60}
      width={TW}
      height={TH}
      defaultProps={{mag: 3, items: [{who: 'herEvening', view: 'q', face: 'lash'}] as TestProps['items']}}
    />
  </>
);

registerRoot(Root);
