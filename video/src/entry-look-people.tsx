// The people recipe's proof (docs/look/paint_recipes/people.md; the engine piece: src/lib/figure). Stills only. v2's
// palette module FIRST (as v2's own entry and the scene-1 v3 entry do): the current her is drawn by that look test's
// code (src/look/scene1_v3, read-only), which needs the clean pen and the house tokens set before any module reads them.
//   PeopleSheet   the proof sheet (docs/look/paint_recipes/people_sheet.png): our current her beside the refined her
//                 at 210 and 640 px, the refined her in four poses (+ a local-light variant), a 4-phase wind strip, the
//                 references beside them. 2400 x 2900, one frame.
//   FigureTest    a quick test frame of the four poses (1920 x 1080).
// The still (one render at a time on the shared CPUs):
//   node scripts/render-frames.mjs PeopleSheet /tmp/people-recipe/sheet 0 --entry=src/entry-look-people.tsx
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FigureTest} from './look/people/FigureTest';
import {PeopleSheet, SHEET_W, SHEET_H} from './look/people/PeopleSheet';

const PeopleRoot: React.FC = () => (
  <>
    <Composition id="PeopleSheet" component={PeopleSheet} durationInFrames={1} fps={60} width={SHEET_W} height={SHEET_H} />
    <Composition id="FigureTest" component={FigureTest} durationInFrames={1} fps={60} width={1920} height={1080} />
  </>
);

registerRoot(PeopleRoot);
