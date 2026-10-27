// Video 2 (restart) K4 cast sheet entry. The palette import MUST stay first: it rewrites the house theme tokens to
// 10 Canal Mint before any lib module is evaluated (src/v2r/palette.ts). Render:
//   npx remotion still src/entry-v2r-cast.tsx KitCast out/kit_cast.png --frame=0 --scale=0.5 --gl=angle
//   npx remotion still src/entry-v2r-cast.tsx CastS1 out/cast_s1.png --frame=0 --gl=angle
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {CastCrowd, CastS1, KitCast, SHEET, WalkTest} from './v2r/kit/cast/KitCast';

const CastRoot: React.FC = () => (
  <>
    <Composition id="KitCast" component={KitCast} fps={60} width={SHEET.w} height={SHEET.h} durationInFrames={120} />
    <Composition id="CastS1" component={CastS1} fps={60} width={1080} height={1920} durationInFrames={120} />
    <Composition id="CastCrowd" component={CastCrowd} fps={60} width={1080} height={1920} durationInFrames={120} />
    <Composition id="CastWalk" component={WalkTest} fps={60} width={1080} height={300} durationInFrames={120} />
  </>
);

registerRoot(CastRoot);
