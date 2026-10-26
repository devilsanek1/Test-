// Video 3 G5 kit sheet entry. The palette import MUST stay first: it rewrites the house theme tokens to Autumn Ember
// before any lib module is evaluated (src/v3/film/palette.ts). Render:
//   npx remotion still src/entry-v3-kit.tsx KitSheet3 out/kit_sheet.png --frame=90 --scale=0.5
import './v3/film/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {KitSheet3, SHEET} from './v3/film/kit/KitSheet3';
import {KitSheetLife, LIFE_SHEET} from './v3/film/kit/KitSheetLife';

const KitRoot: React.FC = () => (
  <>
    <Composition id="KitSheet3" component={KitSheet3} fps={60} width={SHEET.w} height={SHEET.h} durationInFrames={240} />
    <Composition id="KitSheetLife" component={KitSheetLife} fps={60} width={LIFE_SHEET.w} height={LIFE_SHEET.h} durationInFrames={240} />
  </>
);

registerRoot(KitRoot);
