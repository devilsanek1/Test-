// v7_s1's entry: painter v7's scene 1, the first half (ORGANIC.md §6 steps 4, 1, 2; NOTES.md "v7a"). v2's palette module
// FIRST, exactly as src/entry-look-paint.tsx and src/look/light_s1/entry.tsx do, then one composition, V7S1 (props:
// look 'cut' | 'key' | 'v7a' | 'v7', captions, the bake's parts / slab / movers, design). 1080 x 1920, 60 fps; the still is
// 1.0 s. From video/ (always GL=angle, as the paint stills):
//   GL=angle node scripts/render-frames.mjs V7S1 <dir> 1.0 --entry=src/look/v7_s1/entry.tsx --props='{"look":"v7"}'
// The whole first half end to end (the design frame, the canal, the parts renders, the light bake, the stills, the
// checks, the sheet): bash src/look/v7_s1/bake/run.sh
import '../../v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {V7S1, V7_S1_FPS, V7_S1_FRAMES, type V7S1Props} from './V7S1';

const defaults: V7S1Props = {look: 'v7a', captions: true};

const Root: React.FC = () => (
  <Composition id="V7S1" component={V7S1} defaultProps={defaults} durationInFrames={V7_S1_FRAMES} fps={V7_S1_FPS} width={1080} height={1920} />
);

registerRoot(Root);
