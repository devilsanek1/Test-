// FLOW v5, BREEZE (docs/look/people_design/flow_v5/breeze/NOTES.md): the people sheets and the walk clip. Each sheet is a
// pure SVG string from look/people_dirs/flow_v5/breeze/sheets.ts; the clip draws one frame of it at the composition's
// time. From video/:
//   node scripts/render-frames.mjs F5BHer <dir> 0 --entry=src/entry-look-people-flow5-breeze.tsx --concurrency=1
//   node scripts/render-media.mjs F5BClip motion.mp4 --entry=src/entry-look-people-flow5-breeze.tsx --scale=0.5 --concurrency=1
import React from 'react';
import {AbsoluteFill, Composition, Img, registerRoot, useCurrentFrame, useVideoConfig} from 'remotion';
import {
  sheetHer,
  sheetCast,
  sheetMotion,
  sheetScene,
  clipFrame,
  HER_W,
  HER_H,
  CAST_W,
  CAST_H,
  MOTION_W,
  MOTION_H,
  SCENE_W,
  SCENE_H,
  CLIP_W,
  CLIP_H,
  CLIP_SECONDS,
} from './look/people_dirs/flow_v5/breeze/sheets';
import {REF_CROPS} from './look/people_dirs/flow_v5/breeze/refs';
import {PLATE_V6} from './look/people_dirs/hair_v2/plate';

const Raw: React.FC<{svg: string; bg?: string}> = ({svg, bg = '#2B2C41'}) => (
  <AbsoluteFill style={{background: bg}}>
    <div style={{position: 'absolute', inset: 0}} dangerouslySetInnerHTML={{__html: svg}} />
  </AbsoluteFill>
);
/** Remotion waits for these before it captures (the sheets embed them as data URIs). */
const Preload: React.FC<{srcs: string[]}> = ({srcs}) => (
  <>
    {srcs.map((s, i) => (
      <Img key={i} src={s} style={{position: 'absolute', width: 1, height: 1, opacity: 0}} />
    ))}
  </>
);

const F5BHer: React.FC = () => (
  <>
    <Preload srcs={REF_CROPS.map((r) => r.src)} />
    <Raw svg={sheetHer()} />
  </>
);
const F5BCast: React.FC = () => <Raw svg={sheetCast()} />;
const F5BMotion: React.FC = () => <Raw svg={sheetMotion()} />;
const F5BScene: React.FC = () => (
  <>
    <Preload srcs={[PLATE_V6]} />
    <Raw svg={sheetScene()} />
  </>
);
const F5BClip: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <Raw svg={clipFrame(f / fps)} bg="#C99AA8" />;
};

const Root: React.FC = () => (
  <>
    <Composition id="F5BHer" component={F5BHer} durationInFrames={1} fps={60} width={HER_W} height={HER_H} />
    <Composition id="F5BCast" component={F5BCast} durationInFrames={1} fps={60} width={CAST_W} height={CAST_H} />
    <Composition id="F5BMotion" component={F5BMotion} durationInFrames={1} fps={60} width={MOTION_W} height={MOTION_H} />
    <Composition id="F5BScene" component={F5BScene} durationInFrames={1} fps={60} width={SCENE_W} height={SCENE_H} />
    <Composition id="F5BClip" component={F5BClip} durationInFrames={CLIP_SECONDS * 60} fps={60} width={CLIP_W} height={CLIP_H} />
  </>
);
registerRoot(Root);
