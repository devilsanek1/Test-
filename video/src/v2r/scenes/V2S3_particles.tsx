// V2S3_particles.tsx (lane L3): the shot's PARTICLES (lib/particles; CRAFT §f.6; the owner on S1's v4 and v5: they must
// be SEEN at phone size, and the leaves blown across the open mid ground are the ones that work). One exported list of
// fields, each on its parallax plane: S3Particles draws it (last, inside the shot's <Lit>), and the lint and the
// phone-size test read the same list. FILM seconds (S3 runs inside <TimeShift>): the joins are 12.98 (the B match) and
// 14.86 (the push-through into her); no entrance touches 12.78-13.18 or 14.66-15.06; nothing crosses the caption band,
// her window or Pip.
//   glints  26-36 px sparkles, L* +22, 4-6 twinkling at once (0.3-0.8 s each) in the low sun's glitter path on the
//           canal (S3_WATER.glitter), on top of the water component
//   leaves  two 34-40 px palmate leaves blown across her towpath and over the canal on a light westerly (115 px/s across,
//           45-70 px/s down) from the tree past her end wall: one already in flight at the cut (born 12.20, its grow-in
//           long before the join), one born at 13.30; they settle on the water (floor 1176), never reaching the boat
//   motes   FAR: four 8-10 px motes, L* +18, in the evening light beside her window, against the shaded brick east of
//           its architrave (the wall's shade); NEAR: three 12-16 px motes (lib's `nearSize`, plane -2) drifting in the
//           low sun's light in front of our hull's shade
// At most 15 alive across the fields (<= 16: CRAFT §f.6): 6 glints, 2 leaves, 4 far motes, 3 near motes.
import React from 'react';
import {CAPTION_BAND, Particles, glitterPath, type ParticlesProps, type Rect} from '../../lib/particles';
import {CM} from '../palette';
import {S3Plane} from './V2S3_float';
import {S3_END, S3_PLANE, S3_START} from './V2S3_rig';
import {S3_WATER} from './V2S3_water';
import {SUN3} from './V2S3_tWest';

/** The joins (film seconds) and the zones every field keeps clear of: the caption band, her window (frame band and
 *  sill), Pip on its railing. */
export const S3_PARTICLES = {joins: [S3_START, S3_END], her: [254, 688, 162, 190] as Rect, pip: [528, 936, 136, 136] as Rect};
const sun: [number, number] = [SUN3.x, SUN3.y];
const avoid = [CAPTION_BAND, S3_PARTICLES.her, S3_PARTICLES.pip];
const common = {joins: S3_PARTICLES.joins, avoid, sun};
const G = S3_WATER.glitter;

/** S3's particle fields, each on its parallax plane. */
export const S3_PARTICLE_FIELDS: {plane: number; f: ParticlesProps}[] = [
  // glints in the glitter path (its far edge foreshortened toward an apparent horizon at y 900, so the far sparkles
  // stay >= 20 px: the shot's camera horizon, 1150, sits below the canal's far edge in this stylised elevation)
  {plane: S3_PLANE.water, f: {kind: 'glints', seed: 's3glints', region: {poly: glitterPath({x: G.x, yFar: G.yFar, yNear: G.yNear, wFar: G.wFar, wNear: G.wNear})}, on: G.on, horizon: 900, size: [26, 36], lift: 22, margin: 8, ...common}},
  // the leaves, blown from the tree past her end wall across her towpath and over the canal
  {
    plane: S3_PLANE.terrace,
    f: {kind: 'leaves', seed: 's3leaves', region: {rect: [-24, 1004, 44, 40]}, on: '#D2BAAB', colors: [CM.leafRust, CM.leafGold], leaf: 'palmate', births: [12.2, 13.3], size: [34, 40], speed: [45, 70], drift: [115, 0], floor: 1176, margin: 12, ...common},
  },
  // the far motes: beside her window, against the shaded brick east of the architrave
  {plane: S3_PLANE.terrace, f: {kind: 'motes', seed: 's3motes', region: {rect: [430, 726, 66, 126]}, on: '#B57562', count: 4, size: [8, 10], lift: 18, margin: 10, ...common}},
  // the near motes (nearest: last): in front of our hull's shade (its slate, rendered ~#616F82)
  {plane: S3_PLANE.towpath, f: {kind: 'motes', seed: 's3motesNear', plane: -2, region: {rect: [340, 1572, 420, 40]}, on: '#616F82', count: 3, lift: 17, margin: 10, ...common}},
];

export const S3Particles: React.FC = () => (
  <>
    {S3_PARTICLE_FIELDS.map(({plane, f}) => (
      <S3Plane key={f.seed} plane={plane}>
        <Particles {...f} />
      </S3Plane>
    ))}
  </>
);
