// V2S1 helper (lane L1): the shot's PARTICLES (lib/particles; CRAFT §f.6; the owner on v4: they must be SEEN at phone
// size). One exported list of fields, each on its parallax plane: S1Particles draws it (after the world, inside the
// set's <Lit>), and the lint and the phone-size test read the same list. The sun's glints are the water's own now (its
// glitter column's slivers: src/lib/water.tsx through V2S1_water; the owner on v5's four-point stars: "cheap").
import React from 'react';
import {CAPTION_BAND, Particles, particlesAt, type ParticlesProps} from '../../lib/particles';
import {Fill} from '../../lib/Fill';
import {fromLch, lch, useRig} from '../../lib/light';
import {rng} from '../../lib/rng';
import {useTime} from '../../lib/time';
import {CM} from '../../v2r/palette';
import * as MAP from '../../v2r/world/map';
import {S1Plane, S1_PLANE} from './V2S1_float';
import {useSwitches} from './switches';

/** THE PARTICLES, SEEN at phone size (the owner on v4, 2026-10-28: "I don't see any changes in the particles anywhere";
 *  CRAFT §f.6, lib/particles' presets): calm tier-C life a viewer can point at in a 360 px wide frame. Nothing is born
 *  before 0.30 (one near mote is born ~0.6, inside the flood since REVIEW_1 MUST 2: light on pale, unseen) or enters in 5.80-6.40 (the push-through join at 6.10), and nothing crosses
 *  the caption band, her, the row or Pip:
 *    motes   sized by distance (CRAFT §f.6). FAR: 8-10 px, L* +16..+20 over the shade behind them, in the low sun's
 *            air: two against the far tower's shaded column, two in front of the backlit far fronts under the roofline
 *            (the sun is behind them). NEAR: three 12-16 px motes (lib plane -2: the preset's on-screen `nearSize`,
 *            drifting at 3-8 px/s) floating slowly past the shaded side of the bay tree's crown (lower left, the
 *            nearest shade), L* +17 over it (lift 19: the crown is away from the sun, one light step down), 2-3 in
 *            view from ~1.8 s: the ones a phone sees
 *    glints  the water's: lib/water's glitter column under SUN0 (a still gold bed and 4-6 warm-white slivers of
 *            20-34 px nested in it, 0.46-0.78 s each: V2S1_water), counted with these fields
 *    leaves  three 34-40 px palmate plane leaves (the branch's shape: it hangs top left) blowing in from the plane tree
 *            off-frame left on a light westerly, born at 1.2, 2.5 and 3.8 s, fluttering and turning across the water
 *            and our landing toward the middle of the frame, below the row and clear of Pip: 2-3 in view from ~3 s
 *  At most 16 alive across the fields (CRAFT §f.6): 4 far motes + 3 near + 3 leaves here + the water's <= 6 slivers
 *  (V2S1_water's lint: waterProblems with otherAlive S1_PARTICLES_ALIVE). */
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
  {
    plane: S1_PLANE.bank,
    f: {kind: 'leaves', seed: 's1leaves', region: {rect: [-80, 1120, 40, 70]}, on: '#EED4C5', colors: [CM.leafRust, CM.leafGold, CM.leafRust], leaf: 'palmate', births: [1.2, 2.5, 3.8], size: [34, 40], speed: [45, 70], drift: [115, 0], margin: 12, ...common, avoid: [CAPTION_BAND, S1_PARTICLES.her, S1_ROW_BOX, S1_PIP_BOX]},
  },
  // the NEAR motes, last (nearest: over the leaves): the shaded side of the bay's crown (V2S1_fore; rendered L* ~70,
  // '#A5AD9A'; its lit top-left lobe and the stone round it would swallow them) on the near ground's float group; the
  // seed is picked by tracing particlesAt: the curl flow is weak in places, and this one keeps them drifting and apart
  {plane: S1_PLANE.near, f: {kind: 'motes', seed: 's1motesNear101', plane: -2, region: {ellipse: {cx: 228, cy: 1422, rx: 54, ry: 38}}, on: '#A5AD9A', count: 3, lift: 19, margin: 12, ...common, avoid: [CAPTION_BAND, S1_PARTICLES.her, S1_PIP_BOX]}},
];

/** The fields' particles alive at most at once (the water's slivers come on top: waterProblems' otherAlive). */
export const S1_PARTICLES_ALIVE = 10;

/** (the look test's foliage) The near field under lane N's London plane: v2's near motes sat on the bay's shade (L*
 *  ~70); in front of N's narrower, darker crown v1 moved them into its shaded right side (a light tint over '#375C53'),
 *  where they read as painted dots; since the fix pass they are CROWN_GLINTS. */
export function s1ParticleFields(foliage: boolean): {plane: number; f: ParticlesProps}[] {
  if (!foliage) return S1_PARTICLE_FIELDS;
  return S1_PARTICLE_FIELDS.map((q) => (q.f.seed === 's1motesNear101' ? {plane: q.plane, f: CROWN_GLINTS} : q));
}

/** (fix pass 1, REVIEW.md SHOULD 7; under `foliage`) The near field as LEAF-SHAPED GLINTS at the crown's lit edge: a
 *  leaf on the crown's top-left contour catches the low sun and lets it go, two at a time at most (lib/particles'
 *  glints timing, slowed: grow in, shrink out, never a fade), each a small pointed leaf in the sun's warm light, 20-24
 *  px on screen (the phone-size floor). v1's near motes were two flat pale discs on the crown's shade side that read as
 *  painted dots (cold SHOULD 4); the playbook's particles are motes in the light. `on`: the crown's lit leaf tone. */
export const CROWN_GLINTS: ParticlesProps = {
  kind: 'glints',
  seed: 's1crownGlints',
  plane: -2,
  region: {ellipse: {cx: 92, cy: 1262, rx: 82, ry: 20}},
  on: '#9DB289',
  count: 2,
  size: [9, 10.5],
  life: [0.9, 1.4],
  gap: [0.5, 1.2],
  drift: [0, 0],
  lift: 20,
  margin: 10,
  ...common,
  avoid: [CAPTION_BAND, S1_PARTICLES.her, S1_PIP_BOX],
};
const GLINT_LEAF = {w: 0.42, hue: 86, C: 26} as const;
/** A pointed leaf (an almond with a stalk end), `len` long, rotated `deg` about its centre. */
const leafGlintD = (x: number, y: number, len: number, deg: number) => {
  const a = (deg * Math.PI) / 180;
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  const T = (u: number, v: number) => `${(x + u * ca - v * sa).toFixed(1)} ${(y + u * sa + v * ca).toFixed(1)}`;
  const h = len / 2;
  const w = (len * GLINT_LEAF.w) / 2;
  return `M${T(-h, 0)}Q${T(-h * 0.2, -w * 1.5)} ${T(h, 0)}Q${T(-h * 0.2, w * 1.5)} ${T(-h, 0)}Z`;
};
const LeafGlints: React.FC<{f: ParticlesProps}> = ({f}) => {
  const t = useTime();
  const rig = useRig();
  const keyFrom = rig.key.kind === 'sun' ? (rig.key.toward + 180) % 360 : null;
  const ps = particlesAt(t, f, keyFrom);
  if (!ps.length) return null;
  const on = lch(f.on);
  return (
    <>
      {ps.map((p) => {
        const r = rng(`${f.seed}/${p.id}`);
        const deg = r.range(-70, 20);
        const color = fromLch(Math.min(94, on.L + (f.lift ?? 20) + 2 * p.tone), GLINT_LEAF.C, GLINT_LEAF.hue);
        return <Fill key={p.id} d={leafGlintD(p.x, p.y, p.size, deg)} color={color} offset={false} backdrop />;
      })}
    </>
  );
};

export const S1Particles: React.FC = () => (
  <>
    {s1ParticleFields(useSwitches().foliage).map(({plane, f}) => (
      // (the look test: a particle is a mover, not a surface: never mottled, and its own small group stays unfiltered)
      <S1Plane key={f.seed} plane={plane} texture={false}>
        {f === CROWN_GLINTS ? <LeafGlints f={f} /> : <Particles {...f} />}
      </S1Plane>
    ))}
  </>
);
