// v8_s1's entry: V8S1, scene 1 of the Google film feeling first (paint_test/v8_card.md, NOTES.md "v8"), and V8Her, the
// pose sheet her pose was picked on. From video/ (GL=angle, as the paint stills):
//   GL=angle node scripts/render-frames.mjs V8S1 <dir> 1.0 --entry=src/look/v8_s1/entry.tsx --props='{"look":"v8"}'
// The whole bake end to end: bash src/look/v8_s1/bake/run.sh <scratch>
import '../../v2r/palette';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {V8S1, V8_S1_FPS, V8_S1_FRAMES, type V8S1Props} from './V8S1';
import {V8Her, HER_V8, type HerPose} from './her_v8';

const defaults: V8S1Props = {look: 'v8', captions: true};

/** Her pose sheet: variants side by side at her film size (the bake's pick). */
const VARIANTS: HerPose[] = [
  {...HER_V8, gust: {hair: 0, lift: 0, coat: 0}},
  HER_V8,
  {...HER_V8, headPitch: 12},
  {...HER_V8, headPitch: -18},
  {...HER_V8, phase: 0.92, headPitch: -12, gust: {hair: 90, lift: 34, coat: 64}},
];
const HerSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#E9C9B8'}}>
    <svg width={2160} height={1000} viewBox="0 0 2160 1000">
      {VARIANTS.map((p, i) => (
        <V8Her key={i} x={240 + i * 420} feetY={900} h={620} pose={p} />
      ))}
    </svg>
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <>
    <Composition id="V8S1" component={V8S1} defaultProps={defaults} durationInFrames={V8_S1_FRAMES} fps={V8_S1_FPS} width={1080} height={1920} />
    <Composition id="V8Her" component={HerSheet} durationInFrames={2} fps={60} width={2160} height={1000} />
  </>
);

registerRoot(Root);
