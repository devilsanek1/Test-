// The look test's NATURE demo (lane N, STUDY.md §10 items 8-9; notes docs/studies/2026-10-28_city_posters/test/
// ENGINE_NATURE.md): lib/foliage (one species tree, the London plane, and a near leaf spray), lib/wind (one gentle
// wind) and lib/clouds (the hero cumulus) on a plain canal bank in v2's Canal Mint under S1's evening sky and key
// (sun toward 15 deg, el 36: shadows fall right and a little toward us). The palette module is imported FIRST (it
// patches the house theme; read-only use of src/v2r). Compositions (1080 x 1920, 60 fps, 7 s, unless noted):
//   NatureFoliage    the plane on the near bank, the spray in the top gutter, the cumulus in S1's spot; the S1 float
//                    (lib/depth floatAt over v2's S1_FLOAT_LEGS) and the wind with one gust at 2.6 s
//   NatureLadder     the realism ladder (N1): a near plane tree, two mid ones on the far bank, a row of far ones
//   NatureClouds     the hero cumulus and a big one under the band, on S1's sky
//   NatureWindCheck  720 x 1280 at 1:1 (the foliage frame's x 0-720, y 0-1280), 2 s from 1.6 s: twinkle and boil show
// Render:
//   GL=angle node scripts/render-frames.mjs NatureFoliage <dir> 3.0 --entry=src/entry-look-nature.tsx
//   npx remotion render src/entry-look-nature.tsx NatureWindCheck <dir> --sequence --image-format=png --gl=angle --concurrency=2
import './v2r/palette';
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {Clouds, Foliage, Ladder, natureDemoProblems, WIND_CHECK, WindCheck} from './look/nature/demo';

const W = 1080;
const H = 1920;
const FPS = 60;

for (const [name, pr] of natureDemoProblems()) if (pr.length) console.warn(`[nature demo] ${name}:\n  ${pr.join('\n  ')}`);

const NatureRoot: React.FC = () => (
  <>
    <Composition id="NatureFoliage" component={Foliage} durationInFrames={7 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="NatureLadder" component={Ladder} durationInFrames={7 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="NatureClouds" component={Clouds} durationInFrames={7 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="NatureWindCheck" component={WindCheck} durationInFrames={2 * FPS} fps={FPS} width={WIND_CHECK.w} height={WIND_CHECK.h} defaultProps={{still: false}} />
  </>
);

registerRoot(NatureRoot);
