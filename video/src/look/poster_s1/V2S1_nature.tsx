// The look test's NATURE (STUDY.md §10 items 8-9; lane N's engine: test/ENGINE_NATURE.md; notes test/SCENE.md): S1's
// bay tree as ONE species tree, the London plane (lib/foliage <Crown>'s geometry, drawn here so Pip can sit inside it),
// the top-left twig as a spray of its own leaves (<LeafSpray>), both in ONE gentle wind (lib/wind), and the kit's cloud
// as the hero cumulus (lib/clouds <Cumulus>). Every piece is opt-in behind its switch (switches.tsx: foliage, cloud);
// off, the scene draws v2's own pieces.
//   the wind   a light westerly (v2 S1's falling leaves drift right), one gust crossing at 2.6 s (after the hook's first
//              beat, clear of the cut at 6.1 and of the push-through's 5.9-6.3)
//   the tree   the planter's tree (near plane -2, v2's box): a young London plane, its crown over the left treads,
//              lit by RIG_CANAL's low western sun (toward 15 deg, el 36); Pip hidden in it under `pipHidden`
//   the spray  the top-left gutter (y < 290: clear of the caption band), the near plane
//   the cloud  v2's hero-cloud spot, upper right, above the caption band over its whole drift (3 px/s)
// The lints (`s1NatureProblems`): foliageProblems, windProblems, cloudProblems; [] = OK.
import React from 'react';
import {Fill} from '../../lib/Fill';
import {Tier} from '../../lib/tier';
import {useTime} from '../../lib/time';
import {skyColorAt} from '../../lib/sky';
import {crownGeometry, foliageProblems, LeafSpray, LONDON_PLANE, sprayGeometry, type ClusterGeom, type CrownSpec, type Layer, type LeafSpraySpec} from '../../lib/foliage';
import {clusterShift, crownDeg, makeWind, windProblems} from '../../lib/wind';
import {cloudProblems, cloudTones, Cumulus, cumulusGeometry, type CumulusSpec} from '../../lib/clouds';
import {CM} from '../../v2r/palette';
import {s1Sky} from './V2S1_sky';

/** S1's key for nature (RIG_CANAL's sun: shadows fall right and a little toward us). */
export const S1_KEY = {kind: 'sun', toward: 15, el: 36} as const;

/** ONE wind for the shot (lane N's recipe, ENGINE_NATURE.md §6). */
export const S1_WIND = makeWind({seed: 'S1', dir: 0, gusts: [{t: 2.6}], joins: [6.1]});

// ---------------------------------------------------------------- the tree (the planter's, near plane)

/** The planter's young London plane: its foot in the planter's soil (v2's trunk foot), the crown over the left treads
 *  (v2's crown box [-48, 1308, 334, 174], a little taller: a plane's dome on its clear trunk), cut by the left edge. */
export const S1_TREE_AT = {foot: [126, 1530] as [number, number], height: 300, width: 372} as const;
/** The crown's spec in the live palette (its green is the palette's sage: v2's or 10b's). */
export const s1TreeSpec = (): CrownSpec => ({
  seed: 's1-bay-plane',
  base: S1_TREE_AT.foot,
  height: S1_TREE_AT.height,
  width: S1_TREE_AT.width,
  plane: -2,
  light: S1_KEY,
  holes: false,
  species: {...LONDON_PLANE, green: CM.sage},
});

/** Pip's seat in the crown: on a limb behind the crown's front clusters, its head and ears among the leaves (found on
 *  a second look); the clusters drawn over it are the front ones whose index is >= `over`. Fitted to the crown above
 *  (V2S1_pip S1_PIP_TREE's size). */
export const S1_PIP_IN_CROWN = {seat: [176, 1418] as [number, number], over: 5} as const;

const Layers: React.FC<{layers: Layer[]; seed: string}> = ({layers, seed}) => (
  <>
    {layers.map((l, i) => (
      <Fill key={i} d={l.d} color={l.color} offset={false} seed={`${seed}/${i}`} />
    ))}
  </>
);

/** The tree: lane N's <Crown> drawn from its geometry (the same transforms: the crown turns about the trunk's foot, each
 *  cluster shifts as a whole), with `pip` drawn between the front clusters (index < over, then Pip, then the rest), so
 *  Pip sways with the crown and the front leaves cover its body. Tier A scope (`exact`: the ladder's tones kept). */
export const S1Tree: React.FC<{pip?: React.ReactNode; over?: number}> = ({pip, over = S1_PIP_IN_CROWN.over}) => {
  const t = useTime();
  const spec = s1TreeSpec();
  const g = crownGeometry(spec);
  const plane = spec.plane ?? -1;
  const deg = crownDeg(S1_WIND, t, {x: g.centre[0], y: g.centre[1], plane, seed: spec.seed});
  const cluster = (c: ClusterGeom) => {
    const [dx, dy] = clusterShift(S1_WIND, t, {x: c.c[0], y: c.c[1], plane, seed: spec.seed, i: c.id});
    return (
      <g key={c.id} transform={`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`}>
        <Layers layers={c.layers} seed={`crown/${spec.seed}/${c.id}`} />
      </g>
    );
  };
  const k = pip ? Math.max(0, Math.min(g.front.length, over)) : g.front.length;
  return (
    <Tier tier="subject">
      <g transform={`rotate(${deg.toFixed(4)} ${g.pivot[0]} ${g.pivot[1]})`}>
        {g.back.map(cluster)}
        <Layers layers={g.wood} seed={`crown/${spec.seed}/wood`} />
        {g.front.slice(0, k).map(cluster)}
        {pip}
        {g.front.slice(k).map(cluster)}
      </g>
    </Tier>
  );
};

// ---------------------------------------------------------------- the spray (the top-left gutter, near plane)

/** A near branch of the tree's own leaves entering from the top-left corner (lane N's S1 spray: y <= ~273). */
export const s1SpraySpec = (): LeafSpraySpec => ({
  seed: 's1-spray',
  branch: [[-50, -30], [70, 30], [170, 84], [262, 118]],
  width: [15, 4],
  leaves: 10,
  size: [52, 86],
  droop: 0.32,
  light: S1_KEY,
  autumn: 0.1,
  species: {...LONDON_PLANE, green: CM.sage},
});

export const S1Spray: React.FC = () => <LeafSpray spec={s1SpraySpec()} wind={S1_WIND} />;

// ---------------------------------------------------------------- the hero cumulus (the sky, no float)

/** v2's hero-cloud spot (its kit cloud [640, 160, 1000, 272]): lane N's S1 cumulus, its base at y 272 (clear of the
 *  caption band from 290), drifting right 3 px/s with the wind. `tones` are given (lib/clouds' own defaults, from the
 *  sky at the cloud's centre) so the geometry's cache keys on the palette. */
export const s1CloudSpec = (palette10b: boolean): CumulusSpec => {
  const sky = s1Sky(palette10b);
  const at = (x: number, y: number) => skyColorAt(sky, y, x);
  const o = {x: 598, base: 272, w: 430, h: 146};
  return {seed: 'hero-s1', ...o, light: S1_KEY, sky: at, tones: cloudTones({sky: at(o.x + o.w / 2, o.base - o.h / 2)}), drift: 3};
};

export const S1Cloud: React.FC<{palette10b: boolean}> = ({palette10b}) => <Cumulus spec={s1CloudSpec(palette10b)} wind={S1_WIND} />;

// ---------------------------------------------------------------- the lints

/** Lane N's checks on S1's pieces ([] = OK): the ladder, the light, the thin parts, the caption band and the rail
 *  (foliage); N7's sway ranges and the gust's timing (wind); the band over the drift, the soft steps, the belly (cloud). */
export function s1NatureProblems(palette10b: boolean): string[] {
  const crown = crownGeometry(s1TreeSpec());
  const spray = sprayGeometry(s1SpraySpec());
  return [
    ...foliageProblems({crowns: [crown], sprays: [spray]}),
    ...windProblems(
      S1_WIND,
      [
        {name: 'bay plane', x: crown.centre[0], y: crown.centre[1], plane: -2, kind: 'crown'},
        {name: 'bay plane cluster', x: crown.centre[0], y: crown.centre[1], plane: -2, kind: 'cluster'},
        {name: 'spray leaf', x: 170, y: 84, plane: -2, kind: 'leaf'},
      ],
      {t0: 0, t1: 7},
    ),
    ...cloudProblems([cumulusGeometry(s1CloudSpec(palette10b))], {t0: 0, t1: 7, wind: S1_WIND}),
  ];
}
