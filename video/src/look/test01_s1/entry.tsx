// test01_s1's entry: T01S1, the hero frame of process test 01 (docs/tests/process_test_01_amsterdam/CARD.md), and
// T01Her, the pose sheet her pose was picked on. From video/ (GL=angle, as the look stills):
//   GL=angle node scripts/render-frames.mjs T01S1 <dir> 1.0 --entry=src/look/test01_s1/entry.tsx --props='{"look":"t01"}'
// The whole bake end to end: bash src/look/test01_s1/bake/run.sh <scratch>
import React from 'react';
import {AbsoluteFill, Composition, registerRoot} from 'remotion';
import {T01S1, T01_S1_FPS, T01_S1_FRAMES, type T01S1Props} from './T01S1';
import {T01Her, HER_T01, herWrist, type HerPose} from './her_t01';

const defaults: T01S1Props = {look: 't01', captions: true};

/** Her pose sheet: variants side by side, big, on a dusk slab with the rail's top drawn and a dot on the phone
 *  wrist (the bake's pick). */
const VARIANTS: HerPose[] = [
  HER_T01,
  {...HER_T01, yaw: -34},
  {...HER_T01, yaw: -62},
  {...HER_T01, yaw: 46, phoneSide: 'r', headYaw: 8, headRoll: -4},
  {...HER_T01, lean: 34, bend: 18, headPitch: -40},
];
const RAIL = 607;
const HerSheet: React.FC = () => (
  <AbsoluteFill style={{background: '#5C5B86'}}>
    <svg width={2400} height={1000} viewBox="0 0 2400 1000">
      {VARIANTS.map((p, i) => {
        const x = 260 + i * 470;
        const w = herWrist(x, 930, 800, p);
        return (
          <g key={i}>
            <T01Her x={x} feetY={930} h={800} pose={p} />
            <rect x={x - 200} y={930 - (RAIL / 1000) * 800 - 4} width={400} height={8} fill="#1E2A29" opacity={0.75} />
            <circle cx={w[0]} cy={w[1]} r={7} fill="#FFC35E" />
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);

const Root: React.FC = () => (
  <>
    <Composition id="T01S1" component={T01S1} defaultProps={defaults} durationInFrames={T01_S1_FRAMES} fps={T01_S1_FPS} width={1080} height={1920} />
    <Composition id="T01Her" component={HerSheet} durationInFrames={2} fps={60} width={2400} height={1000} />
  </>
);

registerRoot(Root);
