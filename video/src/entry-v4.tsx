// Video 4 (Helsinki) gate cuts, isolated from every other film: G3Reel = the G3 animated sketchbook (docs/G3_ANIMATIC.md),
// drawn by the shared G3 kit (src/lib/g3/) from public/v4/animatic.json over the locked voice (public/v4/voice.wav,
// 42.24 s), 1080 x 1920 at 60 fps, its duration from the voice. Lint before every render:
//   python3 -I scripts/g3/board_lint.py public/v4/animatic.json
// Render the 540p60 reel (from video/; one render at a time on the shared CPUs):
//   node scripts/render-media.mjs G3Reel out/v4/g3_skeleton.mp4 --entry=src/entry-v4.tsx --scale=0.5
// Stills (film seconds): node scripts/render-frames.mjs G3Reel out/v4/stills 2.1,6.5 --entry=src/entry-v4.tsx --scale=0.5
// Captions: the production component (src/lib/captions2/, TYPE_GUIDE.md) from public/v4/captions2.json, on the board's
// light paper ('light': plum ink) and monochrome ('mono': the lit hand by size, weight and swell, no colour or glow).
// v3's pop captions instead: drop the captions prop (src/lib/g3/Captions.tsx PopCaptions is the default).
import React from 'react';
import {registerRoot} from 'remotion';
import {Captions2} from './lib/captions2';
import {G3ReelComposition, type CaptionLayer} from './lib/g3';

const V4Captions: CaptionLayer = () => <Captions2 src="v4/captions2.json" tone="light" mono />;

const V4Root: React.FC = () => (
  <>
    <G3ReelComposition id="G3Reel" film="v4" animatic="v4/animatic.json" voice="v4/voice.wav" captions={V4Captions} />
  </>
);

registerRoot(V4Root);
