// K6 canal kit entry (src/v2r/kit/canal/README.md). The palette module FIRST (Canal Mint tokens before any lib / kit
// module reads them). Compositions, 1080 x 1920 at 60 fps:
//   KitCanal          the kit sheet: every piece at the sizes the shot list uses
//   CanalSample-S1    S1's set at the map's positions (the cover pose), people as placeholders unless K4 is plugged
//   CanalSample-S2 / -S4 / -S8   the same for the receding wall, the walk home and the lane
// Stills: node scripts/render-frames.mjs CanalSample-S1 <dir> 5.3 --entry=src/entry-v2r-canal.tsx --scale=0.5 --gl=angle
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {CanalSampleS1, CanalSampleS2, CanalSampleS4, CanalSampleS8, KitCanal} from './v2r/kit/canal/samples';

const W = 1080;
const H = 1920;
const FPS = 60;

const CanalRoot: React.FC = () => (
  <>
    <Composition id="KitCanal" component={KitCanal} durationInFrames={6 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="CanalSample-S1" component={CanalSampleS1} durationInFrames={Math.round(6.1 * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="CanalSample-S2" component={CanalSampleS2} durationInFrames={Math.round(6.88 * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="CanalSample-S4" component={CanalSampleS4} durationInFrames={Math.round(5.69 * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="CanalSample-S8" component={CanalSampleS8} durationInFrames={Math.round(6.15 * FPS)} fps={FPS} width={W} height={H} />
  </>
);

registerRoot(CanalRoot);
