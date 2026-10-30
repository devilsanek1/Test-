// The people design study, iteration 2: HAIR, PROPORTIONS AND STATURE (docs/look/people_design/hair_v2/: BRIEF.md,
// RESEARCH.md, RECIPE.md; the stills in stills/). Direction C (MODERN GRAPHIC) with the LASH face; the new code in
// src/look/people_dirs/hair_v2/ (lock.ts the lock primitive, cuts.ts the cut library as data, states.ts calm / breeze /
// walk / turn, hair.ts the builder, stance.ts the new proportions and stances, people.ts the new figures). Stills only
// (an ITERATION). One composition per still (RECIPE (e)), plus HvTest for quick looks. One render at a time:
//   node scripts/render-frames.mjs HvS1 <dir> 0 --entry=src/entry-look-people-hair.tsx --concurrency=1
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {HvTest, HT_W, HT_H, type HtProps} from './look/people_dirs/hair_v2/Test';
import {HvS1, S1_W, S1_H, HvS2, S2_W, S2_H, HvS3, S3_W, S3_H, HvS4, S4_W, S4_H, HvS5, S5_W, S5_H, HvS6, S6_W, S6_H, HvS7, S7_W, S7_H} from './look/people_dirs/hair_v2/Sheets';

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
  </>
);

registerRoot(Root);
