// PipActions.tsx — every action TREATMENT section 3 gives Pip, in sequence, on a plain test towpath at 1080 x 1920 (a dev
// clip: the stage is scaffolding drawn here, not a film set). Each action is labelled at the top (above the caption band).
//   npx remotion render src/entry-v2r-pip.tsx PipActions <out.mp4> --gl=angle --concurrency=2 --scale=0.5

import React from 'react';
import {AbsoluteFill} from 'remotion';
import {captionFontStack, useCaptionFont} from '../../../lib/font';
import {useTime} from '../../../lib/time';
import {CM} from '../../palette';
import {S1_BOLLARD} from '../../world/map';
import {V2} from './geom';
import {PipKey, PipTrack} from './PipTrack';

export const ACTIONS_DUR = 21;

/** The test stage's seats (base-centres). */
const BOLLARD: V2 = [S1_BOLLARD.x, S1_BOLLARD.y];
const POST: V2 = [360, 1010];
const BOX: V2 = [300, 1105];

/** The boat (S4 / S8): its roof seat moves left. */
const boatX = (t: number) => 1350 - (t - 9.2) * 230;
const BOAT_Y = 1188;

/** The test walker the head follows (S1: her, walking left on the far towpath). */
const walker = (t: number): V2 => [1000 - Math.max(0, t - 1.0) * 160, 1060];

type Seg = {t0: number; t1: number; x: number | ((t: number) => number); y: number; facing: 'back' | 'left' | 'frontLeft' | 'backLeft'; keys: PipKey[]};

const SEGS: Seg[] = [
  // 0-1 draw-on, 1-4.6 perch + head follows the walker, 3.2 ears-cover, 4.6 hop up-left to the post
  {
    t0: -1,
    t1: 5.15,
    x: BOLLARD[0],
    y: BOLLARD[1],
    facing: 'back',
    keys: [
      {t: 0.1, draw: 0.9},
      {t: 1.0, target: walker},
      {t: 3.2, pose: 'earsCover', dur: 0.1},
      {t: 3.9, pose: 'sit', dur: 0.25},
      {t: 4.4, target: null},
      {t: 4.6, hop: {to: POST, height: 120, dur: 0.45}},
    ],
  },
  // 5.15-9.6: on the post: one ear flick, looks up (the sun), ears down, hop onto the passing boat roof
  {
    t0: 5.15,
    t1: 9.97,
    x: POST[0],
    y: POST[1],
    facing: 'back',
    keys: [
      {t: 5.9, look: -0.6, dur: 0.3},
      {t: 6.3, flick: 'A'},
      {t: 6.9, look: -0.45},
      {t: 7.0, pose: 'lookUp', dur: 0.3},
      {t: 8.0, pose: 'earsDown', dur: 0.35},
      {t: 8.1, look: 0},
      {t: 9.0, pose: 'sit', dur: 0.2},
      {t: 9.55, hop: {to: [boatX(9.97), BOAT_Y], height: 70, dur: 0.42}},
    ],
  },
  // 9.97-12.2: rides the boat roof, turns west, hops toward the sun (out of frame, top-left)
  {
    t0: 9.97,
    t1: 12.95,
    x: (t) => boatX(Math.min(t, 12.08)),
    y: BOAT_Y,
    facing: 'back',
    keys: [
      {t: 9.97, ride: {amp: 1.6}, wind: 1},
      {t: 10.9, facing: 'left', dur: 0.4},
      {t: 12.2, hop: {to: [140, 560], height: 140, dur: 0.75, style: 'leap'}},
    ],
  },
  // 13-16.2: comes down onto the window box, turns to us, leaps out through the left edge
  {
    t0: 12.95,
    t1: 16.2,
    x: -120,
    y: 760,
    facing: 'back',
    keys: [
      {t: 13.0, hop: {to: BOX, height: 60, dur: 0.4, crouch: 0.01}},
      {t: 14.2, facing: 'frontLeft', dur: 0.35},
      {t: 15.4, facing: 'back', dur: 0.2},
      {t: 15.7, hop: {to: [-160, 650], height: 120, dur: 0.6, style: 'leap'}},
    ],
  },
  // 16.2-21: drops back onto the bollard, sit-watch, un-build at 19.6, draws back on (the loop)
  {
    t0: 16.2,
    t1: 30,
    x: -150,
    y: 900,
    facing: 'back',
    keys: [
      {t: 16.3, hop: {to: BOLLARD, height: 80, dur: 0.5, crouch: 0.01}},
      {t: 19.6, unbuild: 0.5},
    ],
  },
];

const LABELS: [number, string][] = [
  [0, 'draw-on (an entrance; at f0 Pip is already in colour)'],
  [1.0, 'perched on the bollard: the head follows her'],
  [3.2, 'ears-cover (S1 "life")'],
  [4.4, 'hop up-left to a post'],
  [5.9, 'head turns (S2 "But")'],
  [6.3, 'one ear flick (S6 "veto")'],
  [7.0, 'looks up (S5 the sun, S8 her window)'],
  [8.0, 'ears down (S8 "can\'t")'],
  [9.4, 'hop onto a moving boat roof'],
  [10.0, 'rides the roof (S4 / S8)'],
  [10.9, 'turns west (S4 "heading")'],
  [12.0, 'leaps into the sun (S4 -> S5)'],
  [12.95, 'lands on her window box (S3)'],
  [14.2, 'turns (S3 "she")'],
  [15.6, 'leaps out through the left edge (S3)'],
  [16.3, 'lands on the bollard: sit-watch (S7)'],
  [19.6, 'un-build (the loop seam)'],
];

const Boat: React.FC<{x: number}> = ({x}) => (
  <g>
    <path d={`M${x - 260} ${BOAT_Y} L${x + 260} ${BOAT_Y} L${x + 290} ${BOAT_Y + 60} L${x - 290} ${BOAT_Y + 60} Z`} fill={CM.sage} stroke={CM.ink} strokeWidth={3.4} strokeLinejoin="round" />
    <rect x={x - 300} y={BOAT_Y + 60} width={600} height={20} fill={CM.anchor} />
    {[-180, -60, 60, 180].map((d) => (
      <circle key={d} cx={x + d} cy={BOAT_Y + 32} r={11} fill={CM.paper} stroke={CM.ink} strokeWidth={2.2} />
    ))}
    <rect x={x + 150} y={BOAT_Y - 46} width={16} height={46} fill={CM.brickDeep} stroke={CM.ink} strokeWidth={2.2} />
  </g>
);

export const PipActions: React.FC = () => {
  useCaptionFont();
  const t = useTime();
  const seg = SEGS.find((s) => t >= s.t0 && t < s.t1) ?? SEGS[SEGS.length - 1];
  const label = [...LABELS].reverse().find(([lt]) => t >= lt)?.[1] ?? '';
  const w = walker(t);
  const bx = boatX(t);
  const x = typeof seg.x === 'function' ? seg.x(t) : seg.x;
  return (
    <AbsoluteFill style={{background: CM.sky}}>
      <svg width={1080} height={1920}>
        {/* far roofs, far towpath, water, our bank */}
        <rect x={0} y={600} width={1080} height={200} fill={CM.bandGold} />
        {[0, 160, 330, 520, 700, 880].map((rx, i) => (
          <rect key={rx} x={rx} y={650 + (i % 3) * 30} width={150} height={170} fill={i % 2 ? CM.brickLight : CM.stucco} />
        ))}
        <rect x={0} y={800} width={1080} height={300} fill={CM.paving} />
        <rect x={0} y={1095} width={1080} height={120} fill={CM.water} />
        <rect x={0} y={1215} width={1080} height={705} fill={CM.limestone} />
        <circle cx={200} cy={560} r={70} fill={CM.sun} />
        {/* the post and the window box */}
        <rect x={POST[0] - 14} y={POST[1]} width={28} height={90} fill={CM.line} stroke={CM.ink} strokeWidth={3} />
        <rect x={BOX[0] - 90} y={BOX[1]} width={180} height={34} fill={CM.brick} stroke={CM.ink} strokeWidth={3} />
        {/* the walker the head follows */}
        <g>
          <rect x={w[0] - 14} y={w[1] - 110} width={28} height={80} rx={12} fill={CM.coatSlate} />
          <circle cx={w[0]} cy={w[1] - 128} r={16} fill={CM.hair[0]} />
          <rect x={w[0] - 10} y={w[1] - 34} width={8} height={34} fill={CM.ink} />
          <rect x={w[0] + 2} y={w[1] - 34} width={8} height={34} fill={CM.ink} />
        </g>
        {t > 9 && t < 14 ? <Boat x={bx} /> : null}
        {/* the bollard */}
        <path d={`M${BOLLARD[0] - 30} ${BOLLARD[1]} L${BOLLARD[0] + 30} ${BOLLARD[1]} L${BOLLARD[0] + 26} ${BOLLARD[1] + 90} L${BOLLARD[0] - 26} ${BOLLARD[1] + 90} Z`} fill={CM.anchor} stroke={CM.ink} strokeWidth={3.4} />
        <PipTrack x={x} y={seg.y} size={96} facing={seg.facing} keys={seg.keys} seed="actions" />
        <text x={540} y={150} fontFamily={captionFontStack} fontSize={44} fill={CM.ink} textAnchor="middle">
          {label}
        </text>
        <text x={540} y={210} fontFamily={captionFontStack} fontSize={30} fill={CM.ink} textAnchor="middle">
          {`towpath Pip · K5 actions · ${t.toFixed(2)} s`}
        </text>
      </svg>
    </AbsoluteFill>
  );
};
