// PEOPLE v4, BODIES (docs/look/people_design/bodies_v4/NOTES.md, stills/STILLS.md): poses, hands, clothes and
// proportions on the v4 people (src/look/people_dirs/people_v4/skel5.ts, hand5.ts, body5.ts; the assembly
// hair_v4/asm_bodies.ts; the stills hair_v4/asm_sheets_bodies.tsx). Stills only (an ITERATION). One render at a time,
// from video/:
//   node scripts/render-frames.mjs B6Before <dir> 0 --entry=src/entry-look-people-bodies4.tsx --concurrency=1
//   (also B6Cast, B6Poses, B6Walk; B6Dev is the working sheet)
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {B6Dev, DEV_W, DEV_H, B6Before, BEFORE6_W, BEFORE6_H, B6Cast, CAST6_W, CAST6_H, B6Poses, POSES6_W, POSES6_H, B6Walk, WALK6_W, WALK6_H} from './look/people_dirs/hair_v4/asm_sheets_bodies';

const Root: React.FC = () => (
  <>
    <Composition id="B6Before" component={B6Before} durationInFrames={1} fps={60} width={BEFORE6_W} height={BEFORE6_H} />
    <Composition id="B6Cast" component={B6Cast} durationInFrames={1} fps={60} width={CAST6_W} height={CAST6_H} />
    <Composition id="B6Poses" component={B6Poses} durationInFrames={1} fps={60} width={POSES6_W} height={POSES6_H} />
    <Composition id="B6Walk" component={B6Walk} durationInFrames={1} fps={60} width={WALK6_W} height={WALK6_H} />
    <Composition id="B6Dev" component={B6Dev} durationInFrames={1} fps={60} width={DEV_W} height={DEV_H} />
  </>
);

registerRoot(Root);
