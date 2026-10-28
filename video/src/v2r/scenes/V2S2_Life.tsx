// V2S2_Life (lane L2): the shot's own life on top of the set's (conform_L2 §5: <= 3 noticeable supporting movers at
// once, taking turns; every mover enters at an edge or from behind a mass, already moving; nothing pops or stops in open
// view). The set already holds the parapet pigeons (they lift once, 7.85), the urn's steam (the kit Newsstand), the
// passing narrowboat (from the right edge at 7.60) and the ducks at rest. No stranger's back, no dog's trot, no paving
// pigeons (conform_L2 §3, §5). FILM seconds.
//   S2FarLife   ONE far walker on the far towpath, already walking at the right edge from the first frame (the pull-back
//               brings it into view by 6.70), left-bound at a stroll (27 px/s), sized by the wall's scale (~64 px a
//               person at s2g 1), so it stays tiny and slow by the VP; behind the near lamp ~7.1-7.7; x ~874 by 12.98
//   S2Motes     a few motes in the low light at the left edge (the sun side, CRAFT §f.6; conform_L2 §10), seen at phone
//               size: far-air ones over the canal's teal, near ones against the planter's wood (S2_PARTICLE_FIELDS)
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {Particles, CAPTION_BAND, type ParticlesProps} from '../../lib/particles';
import {CastSlot} from '../kit/canal/slots';
import {s2g, s2u} from '../kit/canal/wall';
import {farPath} from './V2S2_Water';
import {PLANTER_WOOD} from './V2S2_Near';
import {S2Plane, S2_PLANE} from './V2S2_Float';

/** The far walker: at x 1060 at 6.10 (off screen under the pull's 1.12), walking left at 27 px/s. */
export const S2_WALKER = {t0: 6.1, x0: 1060, speed: 27, hPerG: 64};

export const S2FarLife: React.FC = () => {
  const t = useTime();
  const x = S2_WALKER.x0 - (t - S2_WALKER.t0) * S2_WALKER.speed;
  const [, y] = farPath(x);
  const h = S2_WALKER.hPerG * s2g(s2u(x));
  return (
    <Tier tier="environment">
      <CastSlot s={{id: 's2far0', x, y, h, pose: 'walk', dir: -1, seed: 's2fw', coat: CM.coatSlate, gait: t}} />
    </Tier>
  );
};

/** THE MOTES, SEEN at phone size (conform_L2 §10: "a few motes in the low light at the left edge (sun side)"; RESUME
 *  2026-10-28: motes 6-10 px in the far air plus 2-4 near-plane motes at 12-16 px against the nearest shade; CRAFT
 *  §f.6). Steady fields ('keep'), alive before the shot so nothing grows in at the push-through (6.10); joins = the
 *  shot's in and out (film 6.10, 12.98):
 *    far air  four 9-10 px motes, L* +20 (LIFT_MAX) over the canal's teal in the left of the frame (the wall's plane:
 *             the kiosk, the newsagent and, from its slide at 8.44, the board stand in front of them)
 *    near     three 13-16 px motes, L* +20 against the planter's dark wood at the bottom-left (our towpath's plane) */
export const S2_PARTICLES = {t0: 4.0, joins: [6.1, 12.98], sun: [-260, 700] as [number, number]};
const common = {t0: S2_PARTICLES.t0, joins: S2_PARTICLES.joins, sun: S2_PARTICLES.sun, avoid: [CAPTION_BAND]};
/** The water wedge left of the board's right stile (between the far coping and our edge, inset). */
const WATER_LEFT: [number, number][] = [
  [140, 1074],
  [536, 1016],
  [536, 1054],
  [140, 1222],
];
export const S2_PARTICLE_FIELDS: {plane: number; layer: 'far' | 'near'; f: ParticlesProps}[] = [
  {plane: S2_PLANE.wall, layer: 'far', f: {kind: 'motes', seed: 's2motesFar', region: {poly: WATER_LEFT}, on: CM.water, count: 4, size: [9, 10], lift: 20, margin: 8, ...common}},
  {plane: S2_PLANE.towpath, layer: 'near', f: {kind: 'motes', seed: 's2motesNear', region: {rect: [8, 1606, 196, 120]}, on: PLANTER_WOOD, count: 3, size: [13, 16], lift: 20, margin: 10, ...common}},
];

/** One layer of the fields, each in its plane group (far: the set's farLife slot, in the wall's plane group already;
 *  near: the extra slot, after the planter). */
export const S2Motes: React.FC<{layer: 'far' | 'near'}> = ({layer}) => (
  <>
    {S2_PARTICLE_FIELDS.filter((x) => x.layer === layer).map(({plane, f}) =>
      layer === 'far' ? (
        <Particles key={f.seed} {...f} />
      ) : (
        <S2Plane key={f.seed} plane={plane}>
          <Particles {...f} />
        </S2Plane>
      ),
    )}
  </>
);
