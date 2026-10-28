// V2S4_particles.tsx (lane L3): the shot's PARTICLES (lib/particles; CRAFT §f.6; THROUGHLINE §5b's S4 row; the owner on
// S1's v4 and v5: they must be SEEN at phone size, and the leaves blown across the open mid ground are the ones that
// work). One exported list of fields, each in the group of the plane it lives on: S4Particles draws it (last, inside the
// shot's <Lit>), and the lint and the phone-size test read the same list. FILM seconds (S4 runs inside <TimeShift>):
// the joins are 14.86 (the pull-back out of her head) and 20.55 (the push-through into SUN1); no entrance touches
// 14.66-15.06 or 20.35-20.75; nothing crosses the caption band, the name tag, the plates or her.
//   (glints) the sun's glints are the WATER's own now (V2S4_water: lib/water's still bed and 4-6 gold-white slivers
//           under SUN1 on the canal strip, CRAFT §f.7e; the four-point star sparkles that stood here read "way too
//           cheap" on S1's v5)
//   leaves  three 34-40 px palmate leaves blown over the garden wall right of her, down across her pale flags and over
//           the canal (rust and gold on the paving and the teal water, where the eye catches them) on the canal breeze
//           (45 px/s east, 50-70 px/s down), born in the hold (18.05, 18.75, 19.45: the towpath is at rest, so the
//           field's screen px are its plane px); they settle on the water (floor 1192), never reaching her, the plates or
//           the boat
//   motes   FAR: four 8-10 px motes, L* +18, in the low sun's light beside SUN1, against her house's brick left of her
//           window on the backs plane (they ride its 0.6x truck, in with her house); NEAR: three 12-16 px motes (lib's
//           `nearSize`, plane -1) drifting in front of our hull's slate shade
// At most 16 alive across the fields and the water (CRAFT §f.6): the water's <= 6 slivers, 3 leaves, 4 far motes, 3 near
// motes (S4_OTHER_ALIVE: the water's lint adds its slivers to these).
import React from 'react';
import {useTime} from '../../lib/time';
import {XG, mat} from '../../lib/xf';
import {CAPTION_BAND, Particles, type ParticlesProps, type Rect} from '../../lib/particles';
import {CM} from '../palette';
import * as MAP from '../world/map';
import {S4_END, S4_K, S4_START, s4PlaneDx} from './V2S4_rig';
import {KEEP} from './V2S4_wcore';

const rectOf = (b: {x0: number; x1: number; y0: number; y1: number}): Rect => [b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0];
/** The joins (film seconds) and the zones every field keeps clear of: the caption band, the name tag, the plates (and
 *  the post), her. */
export const S4_PARTICLES = {
  joins: [S4_START, S4_END],
  tag: rectOf({x0: MAP.S4.nameTag.x0 - 6, x1: MAP.S4.nameTag.x1 + 6, y0: MAP.S4.nameTag.y0 - 6, y1: MAP.S4.nameTag.y1 + 6}),
  plates: rectOf({...KEEP.plates, x1: KEEP.post.x1 + 6}),
  her: rectOf(KEEP.her),
};
const sun: [number, number] = [MAP.S4.sunAtPose.x, MAP.S4.sunAtPose.y];
const avoid = [CAPTION_BAND, S4_PARTICLES.tag, S4_PARTICLES.plates, S4_PARTICLES.her];
const common = {joins: S4_PARTICLES.joins, avoid, sun};

/** Which plane group a field rides: 'screen' (fixed: the sun's glitter path, our screen-fixed boat), or a trucking
 *  plane (its s4PlaneDx offset). */
type Ride = 'screen' | 'backs';

/** S4's particle fields, each with the plane group it rides. */
export const S4_PARTICLE_FIELDS: {ride: Ride; f: ParticlesProps}[] = [
  // the leaves, off the garden tree right of her, across her towpath and over the canal (born in the hold)
  {
    ride: 'screen',
    f: {kind: 'leaves', seed: 's4leaves', region: {rect: [784, 934, 120, 36]}, on: '#E9D2BF', colors: [CM.leafRust, CM.leafGold], leaf: 'palmate', births: [18.05, 18.75, 19.45], size: [34, 40], speed: [50, 70], drift: [45, 0], floor: 1192, margin: 12, ...common},
  },
  // the far motes: in the low sun's light beside SUN1, against her house's brick left of her window (backs plane px at
  // the pose: they ride in with her house)
  {ride: 'backs', f: {kind: 'motes', seed: 's4motes', region: {rect: [16, 652, 70, 92]}, on: '#C08A75', count: 4, size: [8, 10], lift: 18, margin: 10, t0: S4_START - 2, ...common}},
  // the near motes (nearest: last): in front of our hull's slate shade
  {ride: 'screen', f: {kind: 'motes', seed: 's4motesNear', plane: -1, region: {rect: [600, 1656, 420, 40]}, on: '#5E6B80', count: 3, lift: 17, margin: 10, t0: S4_START - 2, ...common}},
];

/** The fields' particles alive at most at once (the water's slivers come on top: waterProblems' otherAlive). */
export const S4_OTHER_ALIVE = 3 + 4 + 3;

const Ride: React.FC<{ride: Ride; children?: React.ReactNode}> = ({ride, children}) => {
  const t = useTime();
  if (ride === 'screen') return <>{children}</>;
  return <XG m={mat.translate(s4PlaneDx(S4_K.backs, t), 0)}>{children}</XG>;
};

export const S4Particles: React.FC = () => (
  <>
    {S4_PARTICLE_FIELDS.map(({ride, f}) => (
      <Ride key={f.seed} ride={ride}>
        <Particles {...f} />
      </Ride>
    ))}
  </>
);
