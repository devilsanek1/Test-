// V2S7_particles.tsx (lane L5): the PARTICLES of V2S7, SEEN at phone size (owner on v4: "I don't see any changes in
// the particles"; CRAFT §f.6, lib/particles PRESETS / SEEN_MIN): tier-C life inside the mover budget (none counts as a
// noticeable mover), each a pure function of the shot's time, every entrance clear of the 0.4 s round both joins
// (28.10 = local 0, the wipe 32.70 = local 4.60) and of 32.50-33.10 (nothing new but the wiper), clear of the caption
// band and of Google's board.
//   leaves       three RUST plane leaves (palmate, the preset's 26-40 px; S1 v5's approved colour: on the gold crown and
//                the tan wing gold leaves were lost, dL* 2) blown in from off the right edge, one per birth (0.25 / 2.0 /
//                2.95 s, born out of frame: each in view from 0.9 / 2.2 / 3.3 s, clear of both joins and of 32.50-33.10),
//                west on a gust low across the PALE PAVING in front of the frontage (x 780-1080, y 1035-1100: 110 px/s
//                across, ~30 down, dL* ~30 on the paving), above the jets and right of Pip; the first lands at (809, 1100)
//                at ~3.2 s and goes by 4.0 s, the other two are still in the air at the wipe (plane 0's sizes; drawn in the
//                young plane's float group, the depth they cross). Seed "s7/gust": broad side on (turn |sx| >= 0.3) at the
//                phone checks 30.7 / 31.5 / 32.3
//   motes        7 small motes (6-9 px) in the low sun's light against the wing's shaded brick right of the doors and
//                under the plane's crown (plane +0.6); with the 3 near ones, 10 in all (the owner's note on v5)
//   near motes   3 near motes (12-16 px, lib/particles nearSize) drifting past the nearest shade: the coat over the
//                cafe chair and the cafe's cast shadows (plane -1)
// `particleProblems(S7_PARTICLE_FIELDS, {joins: S7_JOINS})` must be [].
import React from 'react';
import {CM} from '../palette';
import {CAPTION_BAND, Particles, particleProblems, type ParticlesProps, type Rect} from '../../lib/particles';
import {multiply} from '../../lib/light';
import {recede} from '../../lib/depth';
import {TINT_CANAL} from '../world/rigs';
import {SUN2} from '../world/map';
import {S7_ATM, S7_BOARD, S7_TREE} from './V2S7_plan';

/** Shot-local join times: the push-through in (28.10) and the narrowboat wipe out (32.70). */
export const S7_JOINS = [0, 4.6];
/** Google's board (its frame, legs and the side wedge) as a zone every field keeps clear of. */
export const S7_BOARD_BOX: Rect = [S7_BOARD.frame.x0 - 6, S7_BOARD.frame.top - 6, S7_BOARD.frame.x1 - S7_BOARD.frame.x0 + 26, S7_BOARD.legsY - S7_BOARD.frame.top + 12];
/** Pip on the bollard (x 645-755, y 1100-1280): leaves keep clear of it too. */
const PIP_BOX: Rect = [640, 1095, 120, 185];

/** What lies behind the motes: the wing's brick as shown under its Shade step; the near coat. */
const BRICK_SHADED = multiply(recede(CM.brickLight, 1, S7_ATM), TINT_CANAL.form);
/** The near motes drift over the cafe's cast shadows on the paving (a warm rose step): lifted they read as sunlit specks. */
const NEAR_SHADE = multiply(CM.paving, TINT_CANAL.cast);

const common = {joins: S7_JOINS, t0: 0.25, t1: 4.35, atm: S7_ATM, sun: [SUN2.x, SUN2.y] as [number, number]};

export const S7_PARTICLE_FIELDS: ParticlesProps[] = [
  {
    // plane leaves blown in from off the right edge (the young plane's crown overhangs it) on the canal breeze, WEST
    // low across the open paving in front of the frontage: the proven particle (the owner on v5: "leafs are great"),
    // rust as S1's (seen at phone size on the pale paving), the lib preset sizes on the subject's plane (26-40 px), never
    // smaller; a gust (110 px/s across, a slow 28-34 px/s fall) carries them over the paving, above the jets' tops (y
    // 1136) and right of Pip's box
    kind: 'leaves',
    seed: 's7/gust',
    region: {rect: [1105, 1010, 40, 30]},
    on: CM.paving,
    plane: 0,
    leaf: 'palmate',
    colors: [CM.leafRust],
    speed: [28, 34],
    drift: [-110, 0],
    floor: 1100,
    births: [0.25, 2.0, 2.95],
    margin: 12,
    avoid: [CAPTION_BAND, S7_BOARD_BOX, PIP_BOX],
    ...common,
  },
  {
    kind: 'motes',
    seed: 's7/motes',
    region: {rect: [870, 640, 150, 330]},
    on: BRICK_SHADED,
    plane: 0.6,
    count: 7,
    size: [8, 12],
    avoid: [CAPTION_BAND, S7_BOARD_BOX],
    ...common,
  },
  {
    kind: 'motes',
    seed: 's7/nearMotes',
    region: {rect: [20, 1390, 330, 300]},
    on: NEAR_SHADE,
    plane: -1,
    count: 3,
    speed: [2, 5],
    drift: [0, -1.5],
    avoid: [CAPTION_BAND, S7_BOARD_BOX],
    ...common,
  },
];

/** The lint (CRAFT §f.6): caps, contrast, the phone-size floor, speeds, entrances near the joins. */
export const s7ParticleProblems = () => particleProblems(S7_PARTICLE_FIELDS, {joins: S7_JOINS});

/** One field by seed, for the plane groups in V2S7.tsx. */
export const S7Field: React.FC<{seed: string}> = ({seed}) => {
  const f = S7_PARTICLE_FIELDS.find((x) => x.seed === seed);
  return f ? <Particles {...f} /> : null;
};
