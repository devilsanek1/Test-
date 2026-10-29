// The look test's NATURE demo (lane N, STUDY.md §10 items 8-9; notes docs/studies/2026-10-28_city_posters/test/
// ENGINE_NATURE.md): lib/foliage (one species tree, the London plane, and a near leaf spray), lib/wind (one gentle
// wind) and lib/clouds (the hero cumulus) on a plain canal bank in v2's Canal Mint under S1's evening sky and key
// (sun toward 15 deg, el 36: shadows fall right and a little toward us). The palette module is imported FIRST (it
// patches the house theme; read-only use of src/v2r). Compositions (1080 x 1920, 60 fps, 7 s, unless noted):
//   NatureFoliage    the plane on the near bank, the spray in the top gutter, the cumulus in S1's spot; the S1 float
//                    (lib/depth floatAt over v2's S1_FLOAT_LEGS) and the wind with one gust at 2.6 s
//   NatureLadder     the realism ladder (N1): a near plane tree, two mid ones on the far bank, a row of far ones
//   NatureClouds     the hero cumulus and a big one under the band, on S1's sky
//   NatureWindCheck  720 x 1280 at 1:1 (the foliage frame's x 0-720, y 0-1280), 2 s from 1.6 s: twinkle and boil show
// Render:
//   GL=angle node scripts/render-frames.mjs NatureFoliage <dir> 3.0 --entry=src/entry-look-nature.tsx
//   npx remotion render src/entry-look-nature.tsx NatureWindCheck <dir> --sequence --image-format=png --gl=angle --concurrency=2
import './v2r/palette';
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {S1_HORIZON} from './v2r/world/skies';
import {SUN0} from './v2r/world/map';
import {S1_FLOAT_LEGS} from './v2r/scenes/V2S1_float';
import {CM10B} from './look/poster_s1/palette_10b';
import {eveningSky, horizonColor, Sky, skyColorAt} from './lib/sky';
import {floatAt, makeAtmosphere, parallaxOffset, recede} from './lib/depth';
import {fromLch, lch} from './lib/light';
import {Crown, crownGeometry, foliageProblems, LeafSpray, LONDON_PLANE, sprayGeometry, type CrownSpec, type LeafSpraySpec} from './lib/foliage';
import {makeWind, windProblems} from './lib/wind';
import {cloudProblems, Cumulus, cumulusGeometry, type CumulusSpec} from './lib/clouds';

const W = 1080;
const H = 1920;
const FPS = 60;

// ---------------------------------------------------------------- the set: S1's light, its air, one wind

/** Pass 2's palette (10b Canal Mint, full range: lane E's src/look/poster_s1/palette_10b.ts) and S1's evening sky in
 *  it (v2's S1_EVENING with 10b's calmer mint band). */
const P = CM10B;
const S1_EVENING = eveningSky({band: P.sky, horizon: S1_HORIZON, horizonY: 800, sun: {x: SUN0.x, y: SUN0.y, rx: 340}});
const S1_AIR = horizonColor(S1_EVENING, SUN0.x);

/** S1's key (v2r RIG_CANAL: the low western sun, shadows toward 15 deg, el 36). */
const KEY = {kind: 'sun', toward: 15, el: 36} as const;
const ATM = makeAtmosphere({name: 'nature-demo', air: S1_AIR});
/** ONE wind for every piece: a light westerly (S1's falling leaves drift right), one gust crossing at 2.6 s. */
export const WIND = makeWind({seed: 'nature-demo', dir: 0, gusts: [{t: 2.6, strength: 0.6}], joins: [6.1]});
/** The sky a step down (the sky seen through a crown's gaps: Gurney), at y. */
const holeAt = (y: number) => {
  const c = lch(skyColorAt(S1_EVENING, y, 300));
  return fromLch(c.L - 3, c.C, c.h);
};

// ---------------------------------------------------------------- the pieces

/** The London plane on the near bank: its crown y ~610-1300 (clear of the caption band), cut by the left edge. */
export const PLANE: CrownSpec = {seed: 'plane-s1', base: [318, 1700], height: 1090, plane: -1, light: KEY, holes: holeAt(700), holesAbove: 800, species: {...LONDON_PLANE, green: P.sage}};
/** A near branch of its leaves in the top gutter (y < 290), entering from the top-left corner. */
export const SPRAY: LeafSpraySpec = {seed: 'spray-s1', branch: [[-50, -30], [70, 30], [170, 84], [262, 118]], width: [15, 4], leaves: 10, size: [52, 86], droop: 0.32, light: KEY, autumn: 0.1, species: {...LONDON_PLANE, green: P.sage}};
/** The hero cumulus in S1's spot (the top gutter, y ~122-272: v2 S1's cream cloud was [644, 184, 1004, 270]). */
export const HERO: CumulusSpec = {seed: 'hero-s1', x: 598, base: 272, w: 430, h: 146, light: KEY, sky: (x, y) => skyColorAt(S1_EVENING, y, x), drift: 3};
/** A big cumulus under the band (a scale shot's sky), behind the far city. */
const BIG: CumulusSpec = {seed: 'big', x: 90, base: 820, w: 900, h: 190, towers: 4, light: KEY, sky: (x, y) => skyColorAt(S1_EVENING, y, x), drift: 2.5};

const GREEN = {...LONDON_PLANE, green: P.sage};
const LADDER_NEAR: CrownSpec = {seed: 'ladder-near', base: [820, 1810], height: 860, plane: -1, light: KEY, species: GREEN};
const LADDER_MID: CrownSpec[] = [
  {seed: 'ladder-mid-a', base: [120, 1026], height: 330, plane: 1, light: KEY, atm: ATM, species: GREEN},
  {seed: 'ladder-mid-b', base: [345, 1022], height: 290, plane: 1, light: KEY, atm: ATM, species: GREEN},
];
const LADDER_FAR: CrownSpec[] = [560, 660, 745, 845, 945].map((x, i) => ({seed: `ladder-far-${i}`, base: [x, 1002] as [number, number], height: 120 + (i % 2) * 26, plane: 3, light: KEY, atm: ATM, species: GREEN}));

// the lints, in the browser console of the demo (and in the notes): [] = OK
for (const [name, pr] of [
  ['foliage', foliageProblems({crowns: [crownGeometry(PLANE), crownGeometry(LADDER_NEAR), ...LADDER_MID.map(crownGeometry), ...LADDER_FAR.map(crownGeometry)], sprays: [sprayGeometry(SPRAY)]})],
  ['wind', windProblems(WIND, [{name: 'plane', x: 318, y: 950, plane: -1, kind: 'crown'}, {name: 'plane cluster', x: 200, y: 800, plane: -1, kind: 'cluster'}, {name: 'spray leaf', x: 170, y: 84, plane: -2, kind: 'leaf'}], {t0: 0, t1: 7})],
  ['clouds', cloudProblems([cumulusGeometry(HERO)], {t0: 0, t1: 7, wind: WIND})],
] as [string, string[]][]) {
  if (pr.length) console.warn(`[nature demo] ${name}:\n  ${pr.join('\n  ')}`);
}

// ---------------------------------------------------------------- the backdrop (plain flat shapes, not the subject)

const FAR_CITY: [number, number, number, number, string][] = [
  [-20, 862, 120, 140, P.brickLight], [100, 830, 90, 172, P.stucco], [190, 880, 150, 122, P.brick], [340, 846, 110, 156, P.limestone],
  [450, 900, 140, 102, P.brickLight], [590, 856, 120, 146, P.stucco], [710, 884, 160, 118, P.brick], [870, 840, 110, 162, P.limestone], [980, 872, 140, 130, P.brickLight],
];
const Backdrop: React.FC = () => (
  <>
    {FAR_CITY.map(([x, y, w, h, c], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} fill={recede(c, 3.2, ATM)} />
    ))}
    <rect x={-20} y={1000} width={1120} height={36} fill={recede(P.limestone, 1, ATM)} />
    <rect x={-20} y={1036} width={1120} height={214} fill={P.water} />
    <rect x={-20} y={1120} width={1120} height={10} fill={P.waterDeep} />
    <rect x={-20} y={1250} width={1120} height={22} fill={P.pavingShade} />
    <rect x={-20} y={1272} width={1120} height={700} fill={'#B99387'} />
  </>
);

/** The near ground's contact shade under the trunk (one flat step). */
const Contact: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => <ellipse cx={x + 8} cy={y + 4} rx={w * 0.75} ry={10} fill={'#A8806E'} />;

const useT = (t0 = 0) => useCurrentFrame() / FPS + t0;
const Float: React.FC<{t: number; plane: number; children?: React.ReactNode}> = ({t, plane, children}) => {
  const [dx, dy] = parallaxOffset(floatAt(t, S1_FLOAT_LEGS), plane);
  return <g transform={`translate(${dx.toFixed(3)} ${dy.toFixed(3)})`}>{children}</g>;
};

/** The foliage frame at scene time t (the wind check draws it through a window). */
const FoliageFrame: React.FC<{t: number}> = ({t}) => (
  <>
    <Sky spec={S1_EVENING} />
    <Cumulus spec={HERO} wind={WIND} t={t} />
    <Float t={t} plane={3}>
      <Backdrop />
    </Float>
    <Float t={t} plane={-1}>
      <Contact x={318} y={1700} w={60} />
      <Crown spec={PLANE} wind={WIND} t={t} />
    </Float>
    <Float t={t} plane={-2}>
      <LeafSpray spec={SPRAY} wind={WIND} t={t} />
    </Float>
  </>
);

const Foliage: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: P.sky}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <FoliageFrame t={t} />
      </svg>
    </AbsoluteFill>
  );
};

const Ladder: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: P.sky}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Sky spec={S1_EVENING} />
        <Backdrop />
        {LADDER_FAR.map((s) => (
          <Crown key={s.seed} spec={s} wind={WIND} t={t} />
        ))}
        {LADDER_MID.map((s) => (
          <Crown key={s.seed} spec={s} wind={WIND} t={t} />
        ))}
        <Contact x={820} y={1810} w={48} />
        <Crown spec={LADDER_NEAR} wind={WIND} t={t} />
      </svg>
    </AbsoluteFill>
  );
};

const Clouds: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill style={{background: P.sky}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Sky spec={S1_EVENING} />
        <Cumulus spec={BIG} wind={WIND} t={t} />
        <Cumulus spec={HERO} wind={WIND} t={t} />
        <Backdrop />
      </svg>
    </AbsoluteFill>
  );
};

/** The wind check: the foliage frame's x 0-720, y 0-1280 at 1:1 (true pixels: a scaled render would make 2 px
 *  lines 1 px and fake a twinkle), 2 s from 1.6 s (the float's first legs and the 2.6 s gust inside it). */
export const WIND_CHECK = {t0: 1.6, x: 0, y: 0, w: 720, h: 1280} as const;
const WindCheck: React.FC = () => {
  const t = useT(WIND_CHECK.t0);
  return (
    <AbsoluteFill style={{background: P.sky}}>
      <svg width={WIND_CHECK.w} height={WIND_CHECK.h} viewBox={`${WIND_CHECK.x} ${WIND_CHECK.y} ${WIND_CHECK.w} ${WIND_CHECK.h}`}>
        <FoliageFrame t={t} />
      </svg>
    </AbsoluteFill>
  );
};

const NatureRoot: React.FC = () => (
  <>
    <Composition id="NatureFoliage" component={Foliage} durationInFrames={7 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="NatureLadder" component={Ladder} durationInFrames={7 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="NatureClouds" component={Clouds} durationInFrames={7 * FPS} fps={FPS} width={W} height={H} />
    <Composition id="NatureWindCheck" component={WindCheck} durationInFrames={2 * FPS} fps={FPS} width={WIND_CHECK.w} height={WIND_CHECK.h} />
  </>
);

registerRoot(NatureRoot);
