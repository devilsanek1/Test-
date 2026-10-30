// The people design study, hair v4 (docs/look/people_design/hair_v4/: BRIEF.md, V4.md, RESEARCH.md, stills/STILLS.md):
// six cuts drawn as authored Bézier shapes on the skull's frame, bound to a 2D cut-out rig (cap rigid, hanging pieces
// skinned to bone chains simulated with springs). Code: src/look/people_dirs/hair_v4/. Stills only (an ITERATION).
// One render at a time, from video/:
//   node scripts/render-frames.mjs H4Cuts <dir> 0 --entry=src/entry-look-people-hair4.tsx --concurrency=1
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {H4Cuts, CUTS_W, CUTS_H, H4Shading, SHADE_W, SHADE_H, H4Motion, MOTION_W, MOTION_H} from './look/people_dirs/hair_v4/Sheets4';
import {DevSheet, type DevProps} from './look/people_dirs/hair_v4/Dev';

const devDefaults: DevProps = {
  w: 2400,
  h: 900,
  panels: [
    {who: 'her', view: 'q', cut: 'LONG'},
    {who: 'W1', view: 'q', cut: 'LOB'},
    {who: 'W6', view: 'q', cut: 'CLOUD'},
    {who: 'W4', view: 'q', cut: 'PONY'},
    {who: 'M1', view: 'q', cut: 'CROP'},
    {who: 'M2', view: 'q', cut: 'FLOW'},
  ],
};
const DevComp: React.FC<DevProps> = (p) => <DevSheet {...p} />;

const Root: React.FC = () => (
  <>
    <Composition id="H4Cuts" component={H4Cuts} durationInFrames={1} fps={60} width={CUTS_W} height={CUTS_H} />
    <Composition id="H4Shading" component={H4Shading} durationInFrames={1} fps={60} width={SHADE_W} height={SHADE_H} />
    <Composition id="H4Motion" component={H4Motion} durationInFrames={1} fps={60} width={MOTION_W} height={MOTION_H} />
    <Composition id="H4Dev" component={DevComp} durationInFrames={1} fps={60} width={2400} height={900} defaultProps={devDefaults} />
  </>
);

registerRoot(Root);
