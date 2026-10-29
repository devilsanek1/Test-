// The city-poster look test's entry (docs/studies/2026-10-28_city_posters/STUDY.md §10; notes in that folder's
// test/SCENE.md). v2's palette module is imported FIRST, exactly as v2's own entry does (src/entry-v2r-film.tsx): it sets
// the clean pen and rewrites the house tokens in place before any lib or kit module reads them. 1080 x 1920, 60 fps:
//   PosterS1          7.0 s (420 f): v2's S1 0-6.1 s with its locked voice and pop captions, then a 0.9 s locked hold;
//                     props: preset 'v2' | 'pass1' | 'pass2', any single switch (src/look/poster_s1/switches.tsx), label,
//                     audio 'voice' | 'mix' | 'none', captions
//   PosterS1-v2       the same, every switch off (v2's S1 exactly, plus the hold)
//   PosterS1-pass1    STUDY §10's pass 1
//   PosterS1-pass2    every decided change
// Stills (always GL=angle; 4 shared CPUs: one render at a time, --concurrency=2):
//   GL=angle node scripts/render-frames.mjs PosterS1 <dir> 0,1.0,3.0,5.2 --entry=src/entry-look-poster.tsx --scale=0.5 --props='{"preset":"pass2"}'
// Clip:
//   npx remotion render src/entry-look-poster.tsx PosterS1-pass2 out/poster_s1_pass2.mp4 --gl=angle --concurrency=2
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PosterS1, POSTER_S1_FPS, POSTER_S1_FRAMES, type PosterS1Props} from './look/poster_s1/PosterS1';
import type {PosterPreset} from './look/poster_s1/switches';

const W = 1080;
const H = 1920;
const PRESETS: PosterPreset[] = ['v2', 'pass1', 'pass2'];
const defaults: PosterS1Props = {preset: 'v2', label: '', audio: 'voice', captions: true};

const LookPosterRoot: React.FC = () => (
  <>
    <Composition id="PosterS1" component={PosterS1} defaultProps={defaults} durationInFrames={POSTER_S1_FRAMES} fps={POSTER_S1_FPS} width={W} height={H} />
    {PRESETS.map((p) => (
      <Composition key={p} id={`PosterS1-${p}`} component={PosterS1} defaultProps={{...defaults, preset: p}} durationInFrames={POSTER_S1_FRAMES} fps={POSTER_S1_FPS} width={W} height={H} />
    ))}
  </>
);

registerRoot(LookPosterRoot);
