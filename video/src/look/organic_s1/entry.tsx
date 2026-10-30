// The ORGANIC PROOF's entry (docs/look/organic/organic_proof.md). v2's palette module FIRST, exactly as
// src/entry-look-paint.tsx does. 1080 x 1920, 60 fps. From video/ (always GL=angle, as the paint stills; one render at
// a time on the shared machine):
//   GL=angle node scripts/render-frames.mjs OrganicS1 <dir> 1.0 --entry=src/look/organic_s1/entry.tsx
//        [--props='{"organic":false}' | '{"variant":"noProps","captions":false}' | ...]
//   GL=angle node scripts/render-frames.mjs OrganicFlat <dir> 1.0 --entry=src/look/organic_s1/entry.tsx --props='{"piece":"wing"}'
// The whole bake, the sheet and the numbers: python3 scripts/look/organic/organic_proof.py (it renders what it needs).
import '../../v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {OrganicFlat, OrganicS1, ORGANIC_S1_FPS, ORGANIC_S1_FRAMES, type OrganicFlatProps, type OrganicS1Props} from './OrganicS1';

const W = 1080;
const H = 1920;
const defaults: OrganicS1Props = {organic: true, captions: true};
const flatDefaults: OrganicFlatProps = {piece: 'wing'};

const OrganicRoot: React.FC = () => (
  <>
    <Composition id="OrganicS1" component={OrganicS1} defaultProps={defaults} durationInFrames={ORGANIC_S1_FRAMES} fps={ORGANIC_S1_FPS} width={W} height={H} />
    <Composition id="OrganicFlat" component={OrganicFlat} defaultProps={flatDefaults} durationInFrames={120} fps={ORGANIC_S1_FPS} width={W} height={H} />
  </>
);

registerRoot(OrganicRoot);
