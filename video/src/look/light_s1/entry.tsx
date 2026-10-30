// The LIGHT AND TEXTURE PROOF's entry (docs/look/organic/light_proof.md). v2's palette module FIRST, exactly as
// src/entry-look-paint.tsx does (src/entry-v2r-film.tsx), then one composition, LightS1 (props: look 'v6' | 'light' |
// 'full', captions, and the bake's parts / slab / movers). 1080 x 1920, 60 fps; the still is 1.0 s. From video/:
//   GL=angle node scripts/render-frames.mjs LightS1 <dir> 1.0 --entry=src/look/light_s1/entry.tsx --props='{"look":"full"}'
// The whole proof (the parts renders, the bake, the three stills, the sheet): bash src/look/light_s1/bake/run.sh
import '../../v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {LightS1, LIGHT_S1_FPS, LIGHT_S1_FRAMES, type LightS1Props} from './LightS1';

const defaults: LightS1Props = {look: 'full', captions: true};

const Root: React.FC = () => (
  <Composition id="LightS1" component={LightS1} defaultProps={defaults} durationInFrames={LIGHT_S1_FRAMES} fps={LIGHT_S1_FPS} width={1080} height={1920} />
);

registerRoot(Root);
