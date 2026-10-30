// Video 4 (Helsinki) gate cuts, isolated from every other film: G3Reel = the G3 animated sketchbook (docs/G3_ANIMATIC.md),
// drawn by the shared G3 kit (src/lib/g3/) from public/v4/animatic.json over the locked voice (public/v4/voice.wav,
// 42.24 s), 1080 x 1920 at 60 fps, its duration from the voice. Lint before every render:
//   python3 -I scripts/g3/board_lint.py public/v4/animatic.json
// Render the 540p60 reel (from video/; one render at a time on the shared CPUs):
//   node scripts/render-media.mjs G3Reel out/v4/g3_skeleton.mp4 --entry=src/entry-v4.tsx --scale=0.5
// Stills (e.g. each panel's middle): node scripts/render-frames.mjs G3Reel out/v4/stills 2.1,6.5 --entry=src/entry-v4.tsx --scale=0.5
// Captions: v3's pop captions (src/lib/g3/Captions.tsx) until the production component (src/lib/captions2/) lands.
import React from 'react';
import {registerRoot} from 'remotion';
import {G3ReelComposition} from './lib/g3';

const V4Root: React.FC = () => (
  <>
    <G3ReelComposition id="G3Reel" film="v4" animatic="v4/animatic.json" voice="v4/voice.wav" />
  </>
);

registerRoot(V4Root);
