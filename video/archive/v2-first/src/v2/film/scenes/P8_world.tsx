// P8_world.tsx (lane L5-scale): the sky and the world beyond the Pentagon, for P8 (the scale beat). The great-scale cues
// (owner, 2026-10-26: "how great the scale feels", like Arcane's rooftop end frame), drawn in flat value steps (no haze
// gradients): a big sky with three WHOLE flat clouds above the caption band (domed tops, a flat scalloped base, a thin
// peach rim on their sun-side bumps; the biggest cut by the right edge only), StylePentagon's dusk band, peach glow and
// low sun with one halo ring (thin cloud bars drift across it), and a world that keeps going past the building in six
// haze steps, far -> near: the palest row of tiny blocks along the whole horizon (under the sun too), the far skyline,
// the far towers (windows twinkling), a mid-rise row on the far bank (window dots switching on), the river with the
// sun's glints and an arched bridge with tiny cars, rows of small gabled houses shrinking toward the horizon (windows
// switching on), a far highway with moving cars, the near woods. Far planes are fill only (no ink). A slow flock passes
// the sun. No aircraft, flags, figures or lettering.
// Coordinates: canvas px of the LANDING frame; P8.tsx moves each plane. The caption band (y 290-600) stays flat sky
// in every frame of the move (cloud bottoms <= 293 at the landing, ~311 at the cut; far tops at y >= 606).
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {polyPath, roundRect} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {clamp, useTime} from '../../../lib/time';
import {DUSK, birdShape, onOff} from '../kit';
import {P8X} from './P8_pal';

const P = DUSK;

// ---------------------------------------------------------------- the sky: bands, the low sun, cloud bars across it

const DUSK_TOP = 588;
const GLOW_TOP = 642;
export const SUN = {cx: 905, cy: 690, r: 62};
const HALO = 98; // ring top y 592

const disc = (r: number) => roundRect(SUN.cx - r, SUN.cy - r, r * 2, r * 2, r);

export const P8SkyBands: React.FC = () => (
  <>
    <Fill rect={[-300, DUSK_TOP, 1680, 600]} color={P.dusk} offset={false} />
    <Fill rect={[-300, GLOW_TOP, 1680, 520]} color={P.glow} offset={false} />
    <Fill d={disc(HALO)} color={P.halo} offset={false} />
    <Fill d={disc(SUN.r)} color={P.sun} offset={false} />
  </>
);

/** Thin flat bars drifting across the sun (CINEMATIC S2: one value darker than the glow). */
export const P8CloudBars: React.FC = () => {
  const t = useTime();
  const bars = [
    {x: 820, y: 664, w: 250, h: 9, v: -17},
    {x: 990, y: 686, w: 180, h: 7, v: -24},
    {x: 180, y: 676, w: 300, h: 8, v: -14},
    {x: 520, y: 654, w: 160, h: 6, v: -20},
  ];
  return (
    <>
      {bars.map((b, i) => (
        <path key={i} d={roundRect(b.x + b.v * t, b.y, b.w, b.h, b.h / 2)} fill={P8X.cloudBar} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- the big clouds: three whole flat shapes

const circ = (x: number, y: number, rad: number) =>
  `M${(x - rad).toFixed(1)} ${y.toFixed(1)}a${rad.toFixed(1)} ${rad.toFixed(1)} 0 1 0 ${(2 * rad).toFixed(1)} 0a${rad.toFixed(1)} ${rad.toFixed(1)} 0 1 0 ${(-2 * rad).toFixed(1)} 0Z`;
const ell = (x: number, y: number, rx: number, ry: number) =>
  `M${(x - rx).toFixed(1)} ${y.toFixed(1)}a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(2 * rx).toFixed(1)} 0a${rx.toFixed(1)} ${ry.toFixed(1)} 0 1 0 ${(-2 * rx).toFixed(1)} 0Z`;

/** A whole flat cloud (origin = base centre; up = negative y). Two tiers of round, overlapping bumps: a low row SITTING
 *  on the base (centre y = -r, close enough to overlap) and a dome row riding over its middle (centre y <= -r too: no
 *  bump ever hangs below the base). Small flat ellipses fill the notches between the low bumps, so the underside is
 *  flat with only a soft scallop (never a ruled line). The rim: the sun-side bumps (right of centre), offset down-right,
 *  so the low sun (below right) leaves a thin peach rim on the lower-right flank only. */
const flatCloud = (w: number, h: number, seed: string) => {
  const r = rng(`p8cl/${seed}`);
  type B = [number, number, number];
  const low: B[] = [];
  const m = Math.max(4, Math.round(w / 52));
  const sp = w / m;
  for (let i = 0; i < m; i++) {
    const u = (i + 0.5) / m;
    const end = i === 0 || i === m - 1 ? 0.8 : 1; // smaller bumps at the two ends
    const rad = Math.min(h * 0.3, sp * r.range(0.62, 0.74)) * end;
    low.push([-w / 2 + w * u + r.jitter(3), -rad, rad]);
  }
  const dome: B[] = [];
  const n = Math.max(3, Math.round(w / 88));
  for (let i = 0; i < n; i++) {
    const u = 0.14 + (0.72 * (i + 0.5)) / n + r.jitter(0.015);
    const d = Math.pow(Math.sin(Math.PI * clamp(u, 0.05, 0.95)), 0.9);
    const top = h * (0.6 + 0.4 * d) * r.range(0.93, 1);
    const rad = h * (0.25 + 0.11 * d) * r.range(0.95, 1.05);
    dome.push([-w / 2 + w * u, Math.min(-rad, -(top - rad)), rad]);
  }
  const notch: [number, number, number, number][] = [];
  for (let i = 0; i < m - 1; i++) {
    const ry = Math.min(low[i][2], low[i + 1][2]) * 0.3;
    notch.push([(low[i][0] + low[i + 1][0]) / 2, -ry - r.range(0, 1.5), sp * 0.55, ry]);
  }
  const all = [...low, ...dome];
  const body = all.map(([x, y, rad]) => circ(x, y, rad)).join('') + notch.map(([x, y, rx, ry]) => ell(x, y, rx, ry)).join('');
  const lit = all
    .filter(([x]) => x > w * 0.06)
    .map(([x, y, rad]) => circ(x + rad * 0.09, y + rad * 0.06, rad))
    .join('');
  return {body, lit};
};

type Cloud = {cx: number; base: number; w: number; h: number; v: number; seed: string; far?: boolean};
/** Far -> near. The biggest (c1) is cut by the right edge only; all tops sit at y >= ~108, every base at <= 290. */
const CLOUDS: Cloud[] = [
  {cx: 468, base: 190, w: 200, h: 58, v: 9, seed: 'c3', far: true},
  {cx: 222, base: 266, w: 380, h: 120, v: 16, seed: 'c2'},
  {cx: 905, base: 290, w: 700, h: 182, v: 16, seed: 'c1'},
];
const CLOUD_G = CLOUDS.map((c) => ({...c, ...flatCloud(c.w, c.h, c.seed)}));

export const P8Clouds: React.FC = () => {
  const t = useTime();
  return (
    <>
      {CLOUD_G.map((c) => (
        <g key={c.seed} transform={`translate(${(c.cx + c.v * t).toFixed(2)} ${c.base})`}>
          <path d={c.lit} fill={c.far ? P8X.cloudFarLit : P8X.cloudLit} />
          <path d={c.body} fill={c.far ? P8X.cloudFar : P8X.cloud} />
        </g>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- the far skylines (haze 0, 1 and 2)

const H0_BASE = 708;
const CITY_BASE = 724;
const TOWER_BASE = 734;

const blocks = (seed: string, base: number, hMin: number, hMax: number, wMin: number, wMax: number, gap: number, tall = 0) => {
  const r = rng(seed);
  let d = '';
  for (let x = -60; x < 1140; ) {
    const w = r.range(wMin, wMax);
    const h = tall && r.chance(0.14) ? r.range(hMax, tall) : r.range(hMin, hMax);
    d += polyPath([
      [x, base + 30],
      [x, base - h],
      [x + w, base - h],
      [x + w, base + 30],
    ]);
    x += w + (r.chance(gap) ? r.range(3, 14) : -r.range(0, 6));
  }
  return d;
};

/** The palest row: tiny blocks along the whole horizon, under the sun too (they cut its lower edge). */
const HAZE0 = blocks('p8/haze0', H0_BASE, 5, 19, 7, 22, 0.2);
/** The far skyline (sparser, so the palest row shows through its gaps and over its low blocks). */
const HAZE1 = blocks('p8/haze1', CITY_BASE, 8, 32, 18, 52, 0.42, 54);

/** The far towers: four clusters (left and right of the building's apex), tops at y >= 606. */
const HAZE2 = (() => {
  const r = rng('p8/haze2');
  let d = '';
  const wins: {x: number; y: number; seed: string}[] = [];
  const cluster = (x0: number, x1: number, tall: number) => {
    for (let x = x0; x < x1; ) {
      const w = r.range(16, 44);
      const h = r.chance(0.25) ? r.range(80, tall) : r.range(30, 74);
      const top = TOWER_BASE - h;
      d += polyPath([
        [x, TOWER_BASE + 30],
        [x, top],
        [x + w, top],
        [x + w, TOWER_BASE + 30],
      ]);
      // a setback crown on some tall ones
      if (h > 80 && r.chance(0.6)) d += polyPath([[x + w * 0.25, top + 1], [x + w * 0.25, top - 8], [x + w * 0.75, top - 8], [x + w * 0.75, top + 1]]);
      // a few window lights on the towers (tiny; they twinkle)
      const nw = Math.floor(h / 20);
      for (let k = 0; k < nw; k++) if (r.chance(0.55)) wins.push({x: x + r.range(4, Math.max(5, w - 8)), y: top + r.range(8, h - 8), seed: `w${Math.round(x)}-${k}`});
      x += w + r.range(2, 16);
    }
  };
  cluster(-50, 300, 118);
  cluster(360, 470, 70);
  cluster(700, 860, 92);
  cluster(950, 1140, 112);
  return {d, wins};
})();

export const P8FarCity: React.FC = () => (
  <>
    <Fill d={HAZE0} color={P8X.haze0} offset={false} />
    <Fill d={HAZE1} color={P8X.haze1} offset={false} />
  </>
);

export const P8FarTowers: React.FC = () => {
  const t = useTime();
  return (
    <>
      <Fill d={HAZE2.d} color={P8X.haze2} offset={false} />
      {HAZE2.wins.map((w) => (onOff(t, `p8/${w.seed}`, 1.6 + rand(w.seed, 'p') * 2.4, 0.62) ? <rect key={w.seed} x={w.x} y={w.y} width={4} height={5} fill={P8X.towerLit} /> : null))}
    </>
  );
};

/** A slow flock passing in front of the sun, below the caption band (far-towers px). */
export const P8SkyFlock: React.FC = () => {
  const t = useTime();
  const cx = 1010 - 62 * t;
  const cy = 646 + 6 * t;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const lag = (i % 2 === 0 ? 1 : -1) * Math.ceil(i / 2);
    const x = cx + Math.abs(lag) * 30 + rand('p8sf', `x${i}`) * 14;
    const y = cy + lag * 9 + Math.sin(t * 2.2 + i) * 3;
    const s = 11 + rand('p8sf', `s${i}`) * 4;
    out.push(<path key={i} d={birdShape(x, y, s, Math.floor(t * 7 + i * 1.3) % 2)} fill={P8X.bird} stroke={P8X.bird} strokeWidth={1.4} strokeLinejoin="round" />);
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- the far bank: a mid-rise row, the river, its bridge

const MID_BASE = 750;
const BANK_TOP = 744;
const RIVER: [number, number] = [751, 767];

/** A denser mid-rise row on the far bank (between the skyline and the river), with window dots. */
const MID = (() => {
  const r = rng('p8/mid');
  let d = '';
  let dots = '';
  const wins: {x: number; y: number; seed: string}[] = [];
  for (let x = -50; x < 1140; ) {
    const w = r.range(12, 30);
    const h = r.range(9, 26);
    const top = MID_BASE - h;
    d += polyPath([
      [x, MID_BASE + 4],
      [x, top],
      [x + w, top],
      [x + w, MID_BASE + 4],
    ]);
    // a grid of window dots (two tones: most dark, a few lit and switching)
    for (let yy = top + 4; yy < MID_BASE - 3; yy += 5)
      for (let xx = x + 3; xx < x + w - 3; xx += 5) {
        if (r.chance(0.12)) wins.push({x: xx, y: yy, seed: `m${Math.round(xx)}-${Math.round(yy)}`});
        else if (r.chance(0.55)) dots += `M${xx.toFixed(1)} ${yy.toFixed(1)}h2v2h-2Z`;
      }
    x += w + (r.chance(0.25) ? r.range(2, 8) : -r.range(0, 4));
  }
  return {d, dots, wins};
})();

/** The bridge: a dark deck with a parapet, piers and flat arches over the water (evenodd: the river shows through). */
const BRIDGE = (() => {
  const deck = RIVER[0] - 3;
  const x0 = -40;
  const x1 = 392;
  let d = `M${x0} ${deck}H${x1}V${RIVER[1]}H${x0}Z`;
  const span = 48;
  for (let x = x0 + 6; x + span - 6 <= x1; x += span) {
    const a0 = x + 4;
    const a1 = x + span - 4;
    const cx = (a0 + a1) / 2;
    d += `M${a0} ${RIVER[1]}V${RIVER[1] - 4}Q${a0} ${deck + 4} ${cx} ${deck + 4}Q${a1} ${deck + 4} ${a1} ${RIVER[1] - 4}V${RIVER[1]}Z`;
  }
  const parapet = `M${x0} ${deck - 2}H${x1}V${deck}H${x0}Z`;
  return {deck, d, parapet};
})();

export const P8River: React.FC = () => {
  const t = useTime();
  // glints step at 5 drawings / s: short light dashes; under the sun, its reflection path in peach
  const step = Math.floor(t * 5 + 1e-6);
  const r = rng(`p8/glints${step}`);
  let glints = '';
  for (let i = 0; i < 18; i++) {
    const x = r.range(-20, 1100);
    const y = r.range(RIVER[0] + 2, RIVER[1] - 3);
    glints += roundRect(x, y, r.range(8, 22), 2, 1);
  }
  let sunPath = '';
  for (let i = 0; i < 6; i++) {
    const y = RIVER[0] + 2 + i * 2.3;
    const w = r.range(18, 52);
    sunPath += roundRect(SUN.cx - w / 2 + r.jitter(10), y, w, 2, 1);
  }
  // tiny cars on the bridge, both ways
  const cars: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const span = 470;
    const x = ((((rand('p8br', i) * span + dir * 34 * t) % span) + span) % span) - 50;
    cars.push(<rect key={i} x={x} y={BRIDGE.deck - 5} width={7} height={3} fill={P8X.farCar} />);
    cars.push(<rect key={`h${i}`} x={dir === 1 ? x + 6 : x - 1} y={BRIDGE.deck - 4.5} width={2} height={2} fill={P8X.farLight} />);
  }
  return (
    <>
      <path d={MID.d} fill={P8X.mid} />
      <path d={MID.dots} fill={P8X.bridge} />
      {MID.wins.map((w) => (onOff(t, `p8/${w.seed}`, 1.8 + rand(w.seed, 'p') * 2.2, 0.55) ? <rect key={w.seed} x={w.x} y={w.y} width={2.5} height={2.5} fill={P8X.towerLit} /> : null))}
      <Fill rect={[-300, BANK_TOP, 1680, RIVER[0] - BANK_TOP]} color={P8X.bank} offset={false} />
      <Fill rect={[-300, RIVER[0], 1680, 400]} color={P8X.river} offset={false} />
      <path d={glints} fill={P8X.glint} />
      <path d={sunPath} fill={P.sun} />
      <path d={BRIDGE.d} fill={P8X.bridgeDeck} fillRule="evenodd" />
      <path d={BRIDGE.parapet} fill={P8X.bridge} />
      {cars}
    </>
  );
};

// ---------------------------------------------------------------- the far suburbs, the far highway, the near woods

const SUB_TOP = RIVER[1];
const FAR_ROAD: [number, number] = [822, 830];

/** Rows of small gabled houses (a wall + a two-slope roof, the sun-side slope lit), shrinking toward the horizon, with
 *  tree clumps between them and a few windows switching on. */
const SUBURBS = (() => {
  const r = rng('p8/suburbs');
  let walls = '';
  let roofs = '';
  let lit = '';
  let trees = '';
  const wins: {x: number; y: number; w: number; h: number; seed: string}[] = [];
  const rows = [
    {y: 775, s: 0.55},
    {y: 784, s: 0.66},
    {y: 794, s: 0.8},
    {y: 805, s: 0.95},
    {y: 817, s: 1.12},
  ];
  rows.forEach((row, ri) => {
    const s = row.s;
    for (let x = -60 + r.range(0, 24); x < 1140; ) {
      if (r.chance(0.26)) {
        // a clump of trees
        const rr = r.range(5, 9) * s;
        trees += roundRect(x, row.y - rr * 1.5, rr * 2.4, rr * 1.7, rr * 0.8);
        x += rr * 2.4 + r.range(1, 4);
        continue;
      }
      const w = r.range(11, 17) * s;
      const wh = r.range(4.5, 6.5) * s;
      const rh = r.range(4, 6) * s;
      const top = row.y - wh;
      walls += polyPath([[x, row.y], [x, top], [x + w, top], [x + w, row.y]]);
      // the gable: shade slope (left) and lit slope (right, toward the low sun)
      const ridge = x + w * 0.5;
      roofs += polyPath([[x - 1.2 * s, top + 0.5], [ridge, top - rh], [ridge, top + 0.5]]);
      lit += polyPath([[ridge, top - rh], [x + w + 1.2 * s, top + 0.5], [ridge, top + 0.5]]);
      if (r.chance(0.35)) wins.push({x: x + w * r.range(0.18, 0.55), y: top + wh * 0.3, w: 2.6 * s + 0.6, h: 2.2 * s + 0.6, seed: `sw${ri}-${Math.round(x)}`});
      x += w + r.range(1.5, 6) * s;
    }
  });
  return {walls, roofs, lit, trees, wins};
})();

const WOODS = (() => {
  const r = rng('p8/nearwoods');
  let light = '';
  let dark = '';
  let roofs = '';
  for (let x = -60; x < 1140; ) {
    const rx = r.range(12, 24);
    const ry = r.range(8, 13);
    const y = FAR_ROAD[1] + 15 + r.range(0, 6);
    const crownD = roundRect(x, y - ry, rx * 2, ry * 2 + 20, ry);
    if (r.chance(0.5)) light += crownD;
    else dark += crownD;
    if (r.chance(0.18)) roofs += polyPath([[x + rx, y + 2], [x + rx + 8, y - 8], [x + rx + 24, y - 8], [x + rx + 30, y + 2]]);
    x += rx * r.range(1.1, 1.6);
  }
  return {light, dark, roofs};
})();

export const P8Suburbs: React.FC = () => {
  const t = useTime();
  return (
    <>
      <Fill rect={[-300, SUB_TOP, 1680, 400]} color={P8X.sub} offset={false} />
      <path d={SUBURBS.trees} fill={P8X.subRoof} />
      <path d={SUBURBS.walls} fill={P8X.subWall} />
      <path d={SUBURBS.roofs} fill={P8X.subRoof} />
      <path d={SUBURBS.lit} fill={P8X.subRoofLit} />
      {SUBURBS.wins.map((w) => (onOff(t, `p8/${w.seed}`, 2 + rand(w.seed, 'p') * 2.5, 0.5) ? <rect key={w.seed} x={w.x} y={w.y} width={w.w} height={w.h} fill={P8X.towerLit} /> : null))}
    </>
  );
};

export const P8FarHighway: React.FC = () => {
  const t = useTime();
  const cars: React.ReactNode[] = [];
  for (let i = 0; i < 14; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const span = 1260;
    const x = ((((rand('p8fh', i) * span + dir * 52 * t) % span) + span) % span) - 90;
    const y = dir === 1 ? FAR_ROAD[0] + 1 : FAR_ROAD[0] + 4;
    cars.push(<rect key={i} x={x} y={y} width={9} height={3.5} fill={P8X.farCar} />);
    cars.push(<rect key={`l${i}`} x={dir === 1 ? x + 8 : x - 1.5} y={y + 0.5} width={2.5} height={2.5} fill={P8X.farLight} />);
  }
  return (
    <>
      <Fill rect={[-300, FAR_ROAD[0], 1680, FAR_ROAD[1] - FAR_ROAD[0]]} color={P8X.farRoad} offset={false} />
      {cars}
    </>
  );
};

export const P8NearWoods: React.FC = () => (
  <>
    <Fill rect={[-300, FAR_ROAD[1] + 6, 1680, 560]} color={P.woods} offset={false} />
    <path d={WOODS.light} fill={P.woods} />
    <path d={WOODS.dark} fill={P8X.woodsDark} />
    <path d={WOODS.roofs} fill={P8X.houseRoof} />
  </>
);

/** One big near bird gliding in from the left over the far skyline late in the rise (screen-ish px, sky layer). */
export const P8NearBird: React.FC = () => {
  const t = useTime();
  const u = t - 1.42;
  if (u < 0) return null;
  const x = -50 + 330 * u;
  const y = 688 - 34 * u + Math.sin(u * 5) * 4;
  const glide = Math.floor(u * 3) % 3 === 2; // flap, flap, glide
  return <path d={birdShape(x, y, 22, glide ? 0 : Math.floor(u * 8) % 2)} fill={P8X.bird} stroke={P8X.bird} strokeWidth={2.4} strokeLinejoin="round" />;
};
