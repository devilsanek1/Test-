// Video 2 G5 kit entry (kit lane). The palette import MUST stay first: it rewrites the house theme tokens to Cream &
// Cobalt before any lib module is evaluated (src/v2/film/palette.ts). Compositions (60 fps):
//   KitSheet2   every kit prop and variant, labelled, at every size the board uses it (1080 wide, as tall as needed)
//   KitSets2    props {set}: one set layout fully dressed with its ambient life running (1080 x 1920, 4 s)
// Render:
//   npx remotion still src/entry-v2-kit.tsx KitSheet2 out.png --frame=90 --scale=0.5
//   node scripts/render-frames.mjs KitSets2 <dir> 1,2 --entry=src/entry-v2-kit.tsx --props='{"set":"nookWide"}' --scale=0.25
import './v2/film/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {KitSheet2, SHEET2} from './v2/film/kit/KitSheet2';
import {KitSets2, KIT_SETS} from './v2/film/kit/KitSets2';

const KitRoot: React.FC = () => (
  <>
    <Composition id="KitSheet2" component={KitSheet2} fps={60} width={SHEET2.w} height={SHEET2.h} durationInFrames={240} />
    <Composition id="KitSets2" component={KitSets2} fps={60} width={1080} height={1920} durationInFrames={480} defaultProps={{set: KIT_SETS[0] as string}} />
  </>
);

registerRoot(KitRoot);
