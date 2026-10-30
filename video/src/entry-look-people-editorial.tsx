// The people design study's CLEAN EDITORIAL direction (docs/look/people_design/dir_editorial.md; the components:
// src/look/people_dirs/editorial/). Stills only (the owner: stills first, no video). Self-contained: no film palette
// module is needed (the direction keeps its own colour maths), so nothing is imported before it.
//   EdSheet   the direction's sheet (docs/look/people_design/dir_editorial.png): her in two outfits x three views at
//             640 px, the two supporting people, the cast at film size (200 and 140 px) on a mid-tone ground, her in
//             the painted still v6's doorway, the face treatment row. 2400 x SHEET_H, one frame.
//   EdTest    a quick test frame of the 8 figures at 640 px (props: finish 'gradient' | 'flat').
//   EdHeads   their heads, large.
// The still (one render at a time on the shared CPUs):
//   GL=angle node scripts/render-frames.mjs EdSheet <dir> 0 --entry=src/entry-look-people-editorial.tsx --concurrency=1
//   then copy <dir>/f00000.png to docs/look/people_design/dir_editorial.png
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {EdTest, TEST_W, TEST_H, EdHeads, HEADS_W, HEADS_H} from './look/people_dirs/editorial/Test';
import {EdSheet, SHEET_W, SHEET_H} from './look/people_dirs/editorial/Sheet';

const Root: React.FC = () => (
  <>
    <Composition id="EdSheet" component={EdSheet} durationInFrames={1} fps={60} width={SHEET_W} height={SHEET_H} />
    <Composition id="EdTest" component={EdTest} durationInFrames={1} fps={60} width={TEST_W} height={TEST_H} defaultProps={{finish: 'gradient' as const, h: 640}} />
    <Composition id="EdHeads" component={EdHeads} durationInFrames={1} fps={60} width={HEADS_W} height={HEADS_H} defaultProps={{span: 250}} />
  </>
);

registerRoot(Root);
