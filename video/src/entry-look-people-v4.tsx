// PEOPLE v4, faces and bodies at illustration quality (docs/look/people_design/faces_v2/V4.md): the head API and the
// body API in src/look/people_dirs/people_v4/ (pen.ts the authored curves, faces.ts the faces as data, head.ts
// head(sex, view), body.ts body(sex, build, pose, outfit), paint.ts the parts and the SVG writer). Stills only (an
// ITERATION). One render at a time, from video/:
//   node scripts/render-frames.mjs PvHer docs/look/people_design/faces_v2/stills_v4 0 --entry=src/entry-look-people-v4.tsx --concurrency=1
// PEOPLE v4 ASSEMBLED (docs/look/people_design/hair_v4/final/FINAL.md): the hair round's cuts (src/look/people_dirs/
// hair_v4/) fitted to these heads and bodies and lit as one character (hair_v4/asm_people.ts, asm_fit.ts,
// asm_render.ts, asm_motion.ts, SheetsFinal.tsx). One render at a time, from video/:
//   node scripts/render-frames.mjs P4Before <dir> 0 --entry=src/entry-look-people-v4.tsx --concurrency=1
//   (also P4Cast, P4Motion, P4Scene)
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {PvHer, PvHim, PvBodies, FACE_W, FACE_H, BODY_W, BODY_H} from './look/people_dirs/people_v4/Sheets';
import {P4Before, BEFORE_W, BEFORE_H, P4Cast, CAST_W, CAST_H, P4Motion, MOTION_W, MOTION_H, P4Scene, SCENE_W, SCENE_H} from './look/people_dirs/hair_v4/SheetsFinal';

const Root: React.FC = () => (
  <>
    <Composition id="PvHer" component={PvHer} durationInFrames={1} fps={60} width={FACE_W} height={FACE_H} />
    <Composition id="PvHim" component={PvHim} durationInFrames={1} fps={60} width={FACE_W} height={FACE_H} />
    <Composition id="PvBodies" component={PvBodies} durationInFrames={1} fps={60} width={BODY_W} height={BODY_H} />
    <Composition id="P4Before" component={P4Before} durationInFrames={1} fps={60} width={BEFORE_W} height={BEFORE_H} />
    <Composition id="P4Cast" component={P4Cast} durationInFrames={1} fps={60} width={CAST_W} height={CAST_H} />
    <Composition id="P4Motion" component={P4Motion} durationInFrames={1} fps={60} width={MOTION_W} height={MOTION_H} />
    <Composition id="P4Scene" component={P4Scene} durationInFrames={1} fps={60} width={SCENE_W} height={SCENE_H} />
  </>
);

registerRoot(Root);
