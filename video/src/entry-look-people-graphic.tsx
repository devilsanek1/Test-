// The people design study's MODERN GRAPHIC direction (docs/look/people_design/dir_graphic.md; the components:
// src/look/people_dirs/graphic/). Stills only (the owner: stills first, no video). Self-contained: the direction keeps
// its own colour maths, so no film palette module is imported before it.
//   GrSheet   the direction's sheet (docs/look/people_design/dir_graphic.png), one frame, 2400 px wide.
//   GrTest    a quick test frame: figures in a row (props: h, items [{who, view}], heads).
// The still (one render at a time on the shared CPUs):
//   node scripts/render-frames.mjs GrSheet <dir> 0 --entry=src/entry-look-people-graphic.tsx --concurrency=1
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {GrTest, TEST_W, TEST_H, type TestProps} from './look/people_dirs/graphic/Test';

const testDefaults: TestProps = {
  h: 960,
  items: [
    {who: 'herEvening', view: 'q'},
    {who: 'herEvening', view: 'p'},
    {who: 'herEvening', view: 'b'},
  ],
};

const Root: React.FC = () => (
  <>
    <Composition id="GrTest" component={GrTest} durationInFrames={1} fps={60} width={TEST_W} height={TEST_H} defaultProps={testDefaults} />
  </>
);

registerRoot(Root);
