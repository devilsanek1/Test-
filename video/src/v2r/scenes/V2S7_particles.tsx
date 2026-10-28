// V2S7_particles.tsx (lane L5): the PARTICLES of V2S7, SEEN at phone size (owner on v4: "I don't see any changes in
// the particles"; CRAFT §f.6, lib/particles PRESETS / SEEN_MIN): tier-C life inside the mover budget (none counts as a
// noticeable mover), each a pure function of the shot's time, every entrance clear of the 0.4 s round both joins
// (28.10 = local 0, the wipe 32.70 = local 4.60) and of 32.50-33.10 (nothing new but the wiper), clear of the caption
// band and of Google's board.
//   leaves       three plane leaves (palmate, 26-39 px on screen) off the young plane's crown, one per birth across the
//                hold (0.95 / 2.35 / 3.60 s), drifting west on the canal breeze down to the forecourt (plane +0.5)
//   motes        8 small motes (6-9 px) in the low sun's light against the wing's shaded brick right of the doors and
//                under the plane's crown (plane +0.6)
//   near motes   3 near motes (12-16 px, lib/particles nearSize) drifting past the nearest shade: the slate coat over
//                the cafe chair (plane -1)
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
const COAT = recede(CM.coatSlate, -1, S7_ATM);

const common = {joins: S7_JOINS, t0: 0.25, t1: 4.35, atm: S7_ATM, sun: [SUN2.x, SUN2.y] as [number, number]};

export const S7_PARTICLE_FIELDS: ParticlesProps[] = [
  {
    kind: 'leaves',
    seed: 's7/leaves',
    region: {rect: [S7_TREE.crown.x0 + 14, 700, 120, 120]},
    on: BRICK_SHADED,
    plane: 0.5,
    leaf: 'palmate',
    colors: [CM.leafGold, CM.leafRust, CM.coatMustard],
    size: [32, 48],
    floor: 1080,
    drift: [-18, 0],
    births: [0.95, 2.35, 3.6],
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
    count: 8,
    size: [8, 12],
    avoid: [CAPTION_BAND, S7_BOARD_BOX],
    ...common,
  },
  {
    kind: 'motes',
    seed: 's7/nearMotes',
    region: {rect: [40, 1390, 300, 300]},
    on: COAT,
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
