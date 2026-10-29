// The people recipe's proof (docs/look/paint_recipes/people.md; the engine piece: src/lib/figure). Stills only.
//   PeopleSheet   the proof sheet (docs/look/paint_recipes/people_sheet.png): our current her beside the refined her
//                 at 210 and 640 px, the refined her in four poses (+ a local-light variant), a 4-phase wind strip, the
//                 references beside them. 2400 x 3000, one frame.
//   FigureTest    a quick test frame of the four poses (1920 x 1080).
// The still: node scripts/render-frames.mjs PeopleSheet /tmp/people-recipe/sheet 0 --entry=src/entry-look-people.tsx
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {FigureTest} from './look/people/FigureTest';

const PeopleRoot: React.FC = () => (
  <>
    <Composition id="FigureTest" component={FigureTest} durationInFrames={1} fps={60} width={1920} height={1080} />
  </>
);

registerRoot(PeopleRoot);
