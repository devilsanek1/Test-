// The people design study, iteration 2: HAIR, PROPORTIONS AND STATURE (docs/look/people_design/hair_v2/: BRIEF.md,
// RESEARCH.md, RECIPE.md; the stills in stills/). Direction C (MODERN GRAPHIC) with the LASH face; the new code in
// src/look/people_dirs/hair_v2/ (lock.ts the lock primitive, cuts.ts the cut library as data, states.ts calm / breeze /
// walk / turn, hair.ts the builder, stance.ts the new proportions and stances, people.ts the new figures). Stills only
// (an ITERATION). One composition per still (RECIPE (e)), plus HvTest for quick looks; iteration 3 adds HvS1v3-HvS4v3,
// HvS8 (the references beside v2) and HvS9 (beside v3). One render at a time:
//   node scripts/render-frames.mjs HvS1 <dir> 0 --entry=src/entry-look-people-hair.tsx --concurrency=1
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {HvTest, HT_W, HT_H, type HtProps} from './look/people_dirs/hair_v2/Test';
import {HvS1, S1_W, S1_H, HvS2, S2_W, S2_H, HvS3, S3_W, S3_H, HvS4, S4_W, S4_H, HvS5, S5_W, S5_H, HvS6, S6_W, S6_H, HvS7, S7_W, S7_H} from './look/people_dirs/hair_v2/Sheets';
// iteration 3 (after the owner's note on the v2 stills): the v3 sheets and the two comparison sheets (SheetsV3.tsx)
import {HvS1v3, S1V3_W, S1V3_H, HvS2v3, S2V3_W, S2V3_H, HvS3v3, S3V3_W, S3V3_H, HvS4v3, S4V3_W, S4V3_H, HvS8, HvS9, S8_W, S8_H} from './look/people_dirs/hair_v2/SheetsV3';

const testDefaults: HtProps = {
  h: 640,
  items: [
    {who: 'old', view: 'q'},
    {who: 'her', view: 'q'},
    {who: 'old', view: 'b'},
    {who: 'her', view: 'b'},
    {who: 'her', view: 'p'},
  ],
};

const Root: React.FC = () => (
  <>
    <Composition id="HvTest" component={HvTest} durationInFrames={1} fps={60} width={HT_W} height={HT_H} defaultProps={testDefaults} />
    <Composition id="HvS1" component={HvS1} durationInFrames={1} fps={60} width={S1_W} height={S1_H} />
    <Composition id="HvS2" component={HvS2} durationInFrames={1} fps={60} width={S2_W} height={S2_H} />
    <Composition id="HvS3" component={HvS3} durationInFrames={1} fps={60} width={S3_W} height={S3_H} />
    <Composition id="HvS4" component={HvS4} durationInFrames={1} fps={60} width={S4_W} height={S4_H} />
    <Composition id="HvS5" component={HvS5} durationInFrames={1} fps={60} width={S5_W} height={S5_H} />
    <Composition id="HvS6" component={HvS6} durationInFrames={1} fps={60} width={S6_W} height={S6_H} />
    <Composition id="HvS7" component={HvS7} durationInFrames={1} fps={60} width={S7_W} height={S7_H} />
    <Composition id="HvS1v3" component={HvS1v3} durationInFrames={1} fps={60} width={S1V3_W} height={S1V3_H} />
    <Composition id="HvS2v3" component={HvS2v3} durationInFrames={1} fps={60} width={S2V3_W} height={S2V3_H} />
    <Composition id="HvS3v3" component={HvS3v3} durationInFrames={1} fps={60} width={S3V3_W} height={S3V3_H} />
    <Composition id="HvS4v3" component={HvS4v3} durationInFrames={1} fps={60} width={S4V3_W} height={S4V3_H} />
    <Composition id="HvS8" component={HvS8} durationInFrames={1} fps={60} width={S8_W} height={S8_H} />
    <Composition id="HvS9" component={HvS9} durationInFrames={1} fps={60} width={S8_W} height={S8_H} />
  </>
);

registerRoot(Root);
