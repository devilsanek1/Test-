// The city-poster look test's ENGINE DEMOS (STUDY.md §10 build items 2-4; notes docs/studies/2026-10-28_city_posters/
// test/ENGINE.md). Its own bundle: no film imports it. Compositions (1080 x 1920, 60 fps, one frame):
//   LookEngineDepth    lib/depth: the float by 1/z, the +5 ghost step, nearStep's floor, anchorTones
//   LookEnginePalette  the 10b roles (src/look/poster_s1/palette_10b.ts) and lib/gamut siblings
//   LookEngineLight    lib/light FormShade per tier; props {outlines}: the pen's tier-A line flag
// GL=angle node scripts/render-frames.mjs LookEngineLight <dir> 0 --entry=src/entry-look-engine.tsx --props='{"outlines":false}'
import './look/engine/pen';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {DepthDemo, LightDemo, PaletteDemo} from './look/engine/EngineDemo';

const Root: React.FC = () => (
  <>
    <Composition id="LookEngineDepth" component={DepthDemo} durationInFrames={1} fps={60} width={1080} height={1920} />
    <Composition id="LookEnginePalette" component={PaletteDemo} durationInFrames={1} fps={60} width={1080} height={1920} />
    <Composition id="LookEngineLight" component={LightDemo} defaultProps={{outlines: true}} durationInFrames={1} fps={60} width={1080} height={1920} />
  </>
);

registerRoot(Root);
