// The painted-pieces look test's entry (owner, 2026-10-29, playbook PAINTED PIECES; notes and the engine's API:
// docs/studies/2026-10-28_city_posters/paint_test/NOTES.md). v2's palette module FIRST, exactly as v2's own entry does
// (src/entry-v2r-film.tsx). 1080 x 1920, 60 fps:
//   PaintS1        v2's shipped S1 (src/look/paint_s1, the 'v2' preset of the poster test's copy) with the engine's paint
//                  pass (src/lib/paint) on the sky and its clouds, the bay tree and the stone pier; props: paint (default
//                  true; false = v2's flat S1), pieces (a subset), captions, label
//   PaintS1-flat   the same with the paint off (v2's S1)
//   PaintFlatS1    the bake's input: one piece's flat shapes alone on a transparent frame; props: piece 'sky'|'tree'|'pier'
// The still (always GL=angle; 4 shared CPUs: one render at a time):
//   GL=angle node scripts/render-frames.mjs PaintS1 <dir> 1.0 --entry=src/entry-look-paint.tsx
// The bake (the flat inputs, then the painter; writes public/paint/v2s1/): bash scripts/look/paint/bake_v2s1.sh
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PaintS1, PAINT_S1_FPS, PAINT_S1_FRAMES, type PaintS1Props} from './look/paint_s1/PaintS1';
import {PaintFlatS1, type PaintFlatS1Props} from './look/paint_s1/paint_bake';

const W = 1080;
const H = 1920;
const defaults: PaintS1Props = {paint: true, label: '', captions: true};
const flatDefaults: PaintFlatS1Props = {piece: 'tree'};

const LookPaintRoot: React.FC = () => (
  <>
    <Composition id="PaintS1" component={PaintS1} defaultProps={defaults} durationInFrames={PAINT_S1_FRAMES} fps={PAINT_S1_FPS} width={W} height={H} />
    <Composition id="PaintS1-flat" component={PaintS1} defaultProps={{...defaults, paint: false}} durationInFrames={PAINT_S1_FRAMES} fps={PAINT_S1_FPS} width={W} height={H} />
    <Composition id="PaintFlatS1" component={PaintFlatS1} defaultProps={flatDefaults} durationInFrames={120} fps={PAINT_S1_FPS} width={W} height={H} />
  </>
);

registerRoot(LookPaintRoot);
