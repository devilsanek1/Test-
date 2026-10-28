// V2S2_Life (lane L2): the shot's own life on top of the set's (conform_L2 §5: <= 3 noticeable supporting movers at
// once, taking turns; every mover enters at an edge or from behind a mass, already moving; nothing pops or stops in open
// view). The set already holds the parapet pigeons (they lift once, 7.85), the urn's steam (the kit Newsstand), the
// passing narrowboat (from the right edge at 7.60) and the ducks at rest. No stranger's back, no dog's trot, no paving
// pigeons (conform_L2 §3, §5). FILM seconds.
//   S2FarLife   ONE far walker on the far towpath, already walking at the right edge from the first frame (the pull-back
//               brings it into view by 6.70), left-bound at a stroll (27 px/s), sized by the wall's scale (~64 px a
//               person at s2g 1), so it stays tiny and slow by the VP; behind the near lamp ~7.1-7.7; x ~874 by 12.98
//   S2Motes     the shot's particles, seen at phone size (S2_PARTICLE_FIELDS: two leaves blown across the open towpath,
//               far motes right of Pip, near motes up the near lamp post), one layer per slot
import React from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {Particles, CAPTION_BAND, type ParticlesProps} from '../../lib/particles';
import {CastSlot} from '../kit/canal/slots';
import {s2g, s2u} from '../kit/canal/wall';
import {farPath} from './V2S2_Water';
import {PAVE} from './V2S2_Near';
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

/** THE PARTICLES, SEEN at phone size (CRAFT §f.6; the owner on S1's leaves: "leafs are great"; the critic, 2026-10-28:
 *  the old far motes hid behind the board 8.94-12.98 and the near ones read as bolts on the planter). One exported
 *  list of fields, each in its parallax plane's group: V2S2 draws each `layer` in its slot, and the lint and the
 *  phone-size test (particles_phone.py) read the same list. FILM seconds; joins = the shot's in and out (6.10, 12.98).
 *    leaves  TWO 34-40 px palmate plane leaves (S1's preset: a visible flutter and turn, warm), blown in from the left
 *            edge (the sun side) on the canal wind, across the open towpath under the bank's things (y ~1340-1490),
 *            clear of Pip, the board, the bench and the caption band, each leaving by the right edge before the
 *            next. They take turns with the story: leaf 1 in view 7.08-9.93 (in after the outline's pop and before
 *            the boat's bow at 7.60; out before the blinds at 10.26); leaf 2 in view 11.07-12.67 (in after the hood at
 *            10.85, a quicker gust: out before the match's quiet 12.78). None enters within 0.2 s of a join or a beat
 *            (8.44, 8.96, 9.48, 10.26-10.60, 10.85, 12.20). Drawn on our towpath's plane BEHIND the near things (the
 *            planter's grass, the bike, the lamp post pass in front of them: depth).
 *    far     three 9-10 px motes in the far air RIGHT of Pip, in front of the near bays' ground floor (x 650-762,
 *            y 866-928: two unlit panes' slate shade and the brick between, left of the lit pane), L* +20 over the
 *            bays' brick (+26 over the slate; over a limestone fin they melt, never a dark speck); nothing stands in
 *            front of them all shot (the board's footprint is left of Pip); seeded to keep apart (>= 24 px)
 *    near    three 12-16 px motes drifting slowly through the bench's cast shade on our bank, right of the bench
 *            (the nearest real shade in the read zone that stays all shot; L* ~68): L* +18 over it, pale specks in
 *            the low sun (on the dark near lamp post the +20 cap left them mid-brown dots that read as bolts);
 *            seeded to keep apart (>= 17 px gap)
 *  8 alive at most (CRAFT §f.6: <= ~10 motes, <= ~16 in all). */
export const S2_PARTICLES = {t0: 4.0, joins: [6.1, 12.98], sun: [-260, 700] as [number, number]};
const common = {t0: S2_PARTICLES.t0, joins: S2_PARTICLES.joins, sun: S2_PARTICLES.sun, avoid: [CAPTION_BAND]};
/** What the leaves keep clear of (screen px at the pose): Pip on its bollard, the TOLD THE BBC board at rest (its
 *  frame, legs and back wedge), the bench with its pair, and the caption band. */
const S2_PIP_ZONE: [number, number, number, number] = [536, 930, 110, 170];
const S2_BOARD_ZONE: [number, number, number, number] = [84, 1034, 452, 264];
const S2_BENCH_ZONE: [number, number, number, number] = [596, 1090, 204, 200];
const LEAF_AVOID = [CAPTION_BAND, S2_PIP_ZONE, S2_BOARD_ZONE, S2_BENCH_ZONE];
/** The leaves' common look: S1's preset (palmate, 34-40 px on screen at plane 0's scale, rust and gold), on the far
 *  rows' stone (their contrast is held against it), a light fall (50-65 px/s) on a westerly. */
const leafLook = {kind: 'leaves' as const, leaf: 'palmate' as const, on: PAVE.far.a, colors: [CM.leafRust, CM.leafGold], size: [34, 40] as [number, number], speed: [50, 65] as [number, number], margin: 12, ...common, avoid: LEAF_AVOID};
/** The far motes' air: in front of the near bays' ground floor right of Pip, left of their lit pane (the wall's plane
 *  +1 group): two unlit panes' slate shade (L* 62) and the brick between. */
const FAR_AIR: [number, number, number, number] = [650, 866, 112, 62];
/** The bays' brick right of Pip, as drawn (plane +1): what the far motes are lifted over. */
const BAY_BRICK = '#CF9A83';
/** The bench's cast shade on our bank's paving, as drawn (its core): what the near motes are lifted over. */
const BENCH_SHADE = '#C1A096';
export const S2_PARTICLE_FIELDS: {plane: number; layer: 'far' | 'leaves' | 'near'; f: ParticlesProps}[] = [
  {plane: S2_PLANE.wall, layer: 'far', f: {kind: 'motes', seed: 's2motesFar3', region: {rect: FAR_AIR}, on: BAY_BRICK, count: 3, size: [9, 10], lift: 20, margin: 8, ...common, avoid: [CAPTION_BAND, S2_PIP_ZONE]}},
  // leaf 1: born off the left edge at 6.80 (its grow-in hidden), in view 7.08 -> 9.93, out by the right edge
  {plane: S2_PLANE.towpath, layer: 'leaves', f: {...leafLook, seed: 's2leafA', region: {rect: [-175, 1356, 30, 16]}, births: [6.8], drift: [400, 0], life: [4.5, 4.5]}},
  // leaf 2: born off the left edge at 10.80, in view 11.07 -> 12.67 (a quicker gust), out by the right edge
  {plane: S2_PLANE.towpath, layer: 'leaves', f: {...leafLook, seed: 's2leaf2D', region: {rect: [-200, 1356, 30, 16]}, colors: [CM.leafGold, CM.leafRust], births: [10.8], drift: [690, 0], life: [3.5, 3.5]}},
  // the near motes, last (nearest): through the bench's cast shade right of the bench (V2S2_Light: on screen #C1A096)
  {plane: S2_PLANE.towpath, layer: 'near', f: {kind: 'motes', seed: 's2motesShade1', plane: -2, region: {ellipse: {cx: 872, cy: 1296, rx: 64, ry: 27}}, on: BENCH_SHADE, count: 3, lift: 18, margin: 10, ...common}},
];

/** One layer of the fields, each in its plane group (far: the set's farLife slot, in the wall's plane group already;
 *  leaves: the set's `leaves` slot on our towpath, before the near things; near: the extra slot, drawn last). */
export const S2Motes: React.FC<{layer: 'far' | 'leaves' | 'near'}> = ({layer}) => (
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
