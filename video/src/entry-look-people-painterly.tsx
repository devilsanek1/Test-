// The people design study's SOFT PAINTERLY direction (docs/look/people_design/dir_painterly.md; the components:
// src/look/people_dirs/painterly/). Stills only (the owner: stills first, no video). Self-contained: the direction keeps
// its own colour maths, so no film palette module is imported before it.
//   PtSheet   the direction's sheet (docs/look/people_design/dir_painterly.png), one frame.
//   PtTest    a quick test frame: one person in several views (props: who, h, views, pose).
// The still (one render at a time on the shared CPUs):
//   GL=angle node scripts/render-frames.mjs PtSheet <dir> 0 --entry=src/entry-look-people-painterly.tsx --concurrency=1
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PtTest, TEST_W, TEST_H, type TestProps} from './look/people_dirs/painterly/Test';

const testDefaults: TestProps = {
  h: 640,
  items: [
    {who: 'herEvening', view: 'front34'},
    {who: 'herEvening', view: 'profileL'},
    {who: 'herEvening', view: 'back'},
  ],
};

const Root: React.FC = () => (
  <>
    <Composition id="PtTest" component={PtTest} durationInFrames={1} fps={60} width={TEST_W} height={TEST_H} defaultProps={testDefaults} />
  </>
);

registerRoot(Root);
