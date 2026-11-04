// Scene 1, still v3 (docs/studies/2026-10-28_city_posters/scene_rethink/NOTES.md "still_v3"): v2's S1 view, the camera
// at human height close to her, in our v2 look with the look test's pass-2 lessons (src/look/scene1_v3/). v2's palette
// module is imported FIRST, exactly as v2's own entry does: it sets the clean pen and rewrites the house tokens in place
// before any lib or kit module reads them. 1080 x 1920, 60 fps:
//   Scene1V3   2.0 s (120 f); props: preset (default 'pass2'), any single look-test switch, label, audio 'none' | 'voice'
// The still (the frame at 1.6 s; GL=angle, one render at a time on the 4 shared CPUs):
//   GL=angle node scripts/render-frames.mjs Scene1V3 /tmp/scene1-v3/full 1.6 --entry=src/entry-look-scene1v3.tsx --scale=1
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Scene1V3, SCENE1V3_FPS, SCENE1V3_FRAMES, type Scene1V3Props} from './look/scene1_v3/Scene1V3';

const defaults: Scene1V3Props = {preset: 'pass2', label: '', audio: 'none', captions: true};

const Scene1V3Root: React.FC = () => (
  <Composition id="Scene1V3" component={Scene1V3} defaultProps={defaults} durationInFrames={SCENE1V3_FRAMES} fps={SCENE1V3_FPS} width={1080} height={1920} />
);

registerRoot(Scene1V3Root);
