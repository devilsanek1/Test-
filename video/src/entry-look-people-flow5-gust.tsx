// FLOW v5, GUST (docs/look/people_design/flow_v5/gust/NOTES.md): the people rebuilt after the owner's references
// (docs/look/refs_people_flow/): one long outer piece that IS the figure, swept by one wind; hair as a dark cap and a
// few ribbons; a near-blank face. Code: src/look/people_dirs/flow_v5/gust/. One render at a time, from video/:
//   node scripts/render-frames.mjs F5GHer <dir> 0 --entry=src/entry-look-people-flow5-gust.tsx --concurrency=1
//   (also F5GCast, F5GMotion, F5GScene)
//   node scripts/render-media.mjs F5GClip <out.mp4> --entry=src/entry-look-people-flow5-gust.tsx --scale=0.5 --concurrency=1
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {F5GHer, F5GCast, F5GMotion, F5GClip, F5GScene, SIZES as S} from './look/people_dirs/flow_v5/gust/Sheets';

const Root: React.FC = () => (
  <>
    <Composition id="F5GHer" component={F5GHer} durationInFrames={1} fps={60} width={S.HER_W} height={S.HER_H} />
    <Composition id="F5GCast" component={F5GCast} durationInFrames={1} fps={60} width={S.CAST_W} height={S.CAST_H} />
    <Composition id="F5GMotion" component={F5GMotion} durationInFrames={1} fps={60} width={S.MOTION_W} height={S.MOTION_H} />
    <Composition id="F5GClip" component={F5GClip} durationInFrames={240} fps={60} width={S.CLIP_W} height={S.CLIP_H} />
    <Composition id="F5GScene" component={F5GScene} durationInFrames={1} fps={60} width={S.SCENE_W} height={S.SCENE_H} />
  </>
);

registerRoot(Root);
