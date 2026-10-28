// V2S1 helper (lane L1): the shot's PARTICLES (lib/particles; CRAFT §f.6; the owner on v4: they must be SEEN at phone
// size). One exported list of fields, each on its parallax plane: S1Particles draws it (after the world, inside the
// set's <Lit>), and the lint and the phone-size test read the same list.
import React from 'react';
import {CAPTION_BAND, Particles, glitterPath, type ParticlesProps} from '../../lib/particles';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {S1Plane, S1_PLANE} from './V2S1_float';

/** THE PARTICLES, SEEN at phone size (the owner on v4, 2026-10-28: "I don't see any changes in the particles anywhere";
 *  CRAFT §f.6, lib/particles' presets): calm tier-C life a viewer can point at in a 360 px wide frame. Nothing is born
 *  before 0.30 (after the frame-0 flood) or enters in 5.80-6.40 (the push-through join at 6.10), and nothing crosses
 *  the caption band, her, the row or Pip:
 *    motes   sized by distance (CRAFT §f.6). FAR: 8-10 px, L* +16..+20 over the shade behind them, in the low sun's
 *            air: two against the far tower's shaded column, two in front of the backlit far fronts under the roofline
 *            (the sun is behind them). NEAR: three 12-16 px motes (lib plane -2: the preset's on-screen `nearSize`,
 *            drifting at 3-8 px/s) floating slowly past the shaded side of the bay tree's crown (lower left, the
 *            nearest shade), L* +17 over it (lift 19: the crown is away from the sun, one light step down), 2-3 in
 *            view from ~1.8 s: the ones a phone sees
 *    glints  26-36 px sparkles, L* +20..+24, 4-6 twinkling at once (0.3-0.8 s each) in the sun's glitter path
 *    leaves  three 34-40 px palmate plane leaves (the branch's shape: it hangs top left) blowing in from the plane tree
 *            off-frame left on a light westerly, born at 1.2, 2.5 and 3.8 s, fluttering and turning across the water
 *            and our landing toward the middle of the frame, below the row and clear of Pip: 2-3 in view from ~3 s
 *  At most 16 alive across the fields (CRAFT §f.6): 4 far motes + 3 near + 6 glints + 3 leaves. */
export const S1_PARTICLES = {t0: 0.3, t1: 5.75, joins: [6.1], her: [380, 900, 320, 220] as [number, number, number, number]};
/** The copies' row on the far towpath and Pip on its bollard: the leaves keep clear of both. */
const S1_ROW_BOX: [number, number, number, number] = [0, 900, 520, 205];
const S1_PIP_BOX: [number, number, number, number] = [600, 1110, 200, 200];

const sun: [number, number] = [MAP.SUN0.x, MAP.SUN0.y];
const common = {t0: S1_PARTICLES.t0, t1: S1_PARTICLES.t1, joins: S1_PARTICLES.joins, avoid: [CAPTION_BAND, S1_PARTICLES.her], sun};
/** S1's particle fields, each on its parallax plane (data: S1Particles draws them; the lint and the phone-size test
 *  read the same list). */
export const S1_PARTICLE_FIELDS: {plane: number; f: ParticlesProps}[] = [
  {plane: S1_PLANE.farTower, f: {kind: 'motes', seed: 's1motes', region: {rect: [258, 612, 54, 290]}, on: '#B5B5C5', count: 2, size: [8, 10], lift: 18, margin: 8, ...common}},
  {plane: S1_PLANE.farTower, f: {kind: 'motes', seed: 's1motesFar', region: {rect: [26, 798, 222, 104]}, on: '#E1C6BF', count: 2, size: [8, 10], lift: 18, margin: 10, ...common}},
  {plane: S1_PLANE.water, f: {kind: 'glints', seed: 's1glints', region: {poly: glitterPath({x: MAP.SUN0.x, yFar: 1110, yNear: 1166, wFar: 40, wNear: 80})}, on: '#D2C7AF', horizon: 965, size: [26, 36], lift: 22, margin: 8, ...common}},
  {
    plane: S1_PLANE.bank,
    f: {kind: 'leaves', seed: 's1leaves', region: {rect: [-80, 1120, 40, 70]}, on: '#EED4C5', colors: [CM.leafRust, CM.leafGold, CM.leafRust], leaf: 'palmate', births: [1.2, 2.5, 3.8], size: [34, 40], speed: [45, 70], drift: [115, 0], margin: 12, ...common, avoid: [CAPTION_BAND, S1_PARTICLES.her, S1_ROW_BOX, S1_PIP_BOX]},
  },
  // the NEAR motes, last (nearest: over the leaves): the shaded side of the bay's crown (V2S1_fore; rendered L* ~70,
  // '#A5AD9A'; its lit top-left lobe and the stone round it would swallow them) on the near ground's float group; the
  // seed is picked by tracing particlesAt: the curl flow is weak in places, and this one keeps them drifting and apart
  {plane: S1_PLANE.near, f: {kind: 'motes', seed: 's1motesNear101', plane: -2, region: {ellipse: {cx: 228, cy: 1422, rx: 54, ry: 38}}, on: '#A5AD9A', count: 3, lift: 19, margin: 12, ...common, avoid: [CAPTION_BAND, S1_PARTICLES.her, S1_PIP_BOX]}},
];

export const S1Particles: React.FC = () => (
  <>
    {S1_PARTICLE_FIELDS.map(({plane, f}) => (
      <S1Plane key={f.seed} plane={plane}>
        <Particles {...f} />
      </S1Plane>
    ))}
  </>
);
