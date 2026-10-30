// The people design study's comparison sheet (docs/look/people_design/directions_compare.png; the decision and the
// draft design system: docs/look/PEOPLE_DESIGN.md): the three directions (src/look/people_dirs/{editorial,painterly,
// graphic}) side by side with our current her (src/lib/figure as the painted still v6 draws her). Stills only.
// Self-contained: each direction keeps its own colour maths, and src/lib/figure needs no film palette.
//   CmpSheet   2400 x CMP_H, one frame.
// The still (one render at a time on the shared CPUs):
//   GL=angle node scripts/render-frames.mjs CmpSheet <dir> 0 --entry=src/entry-look-people-compare.tsx --concurrency=1
//   then copy <dir>/f00000.png to docs/look/people_design/directions_compare.png
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {CompareSheet, CMP_W, CMP_H} from './look/people_dirs/compare/Sheet';

const Root: React.FC = () => (
  <>
    <Composition id="CmpSheet" component={CompareSheet} durationInFrames={1} fps={60} width={CMP_W} height={CMP_H} />
  </>
);

registerRoot(Root);
