// P8_world.tsx (lane L5-scale): the sky and the world beyond the Pentagon, for P8 (the scale beat). The great-scale cues
// (owner, 2026-10-26: "how great the scale feels", like Arcane's rooftop end frame), drawn in flat value steps (no haze
// gradients): a big sky with HUGE clouds over the caption band (their undersides lit by the low sun), StylePentagon's
// dusk band, peach glow and low sun with one halo ring (thin cloud bars drift across it), and a world that keeps going
// past the building: the farthest skyline, the far towers (a few windows twinkling), the river with the sun's glints and
// a bridge with tiny cars, rows of suburbs (windows switching on), a far highway with moving cars, the near woods. Far
// planes are fill only (no ink). A slow flock passes the sun. No aircraft, flags, figures or lettering.
// Coordinates: canvas px of the LANDING frame; P8.tsx moves each plane. The caption band (y 290-600) stays flat sky
// in every frame of the move (clouds end at y <= 250, far tops at y >= 606 at the landing).
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {polyPath, roundRect} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
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

// ---------------------------------------------------------------- the huge clouds (above the caption band)

/** A flat cumulus heap on a flat base (origin = base centre): a dome of round bumps over a low row of small ones. Two
 *  flat tones: the body, and the sun's light (the low sun is right and below them) left as a rim on the bumps' right
 *  and lower sides and a band along the flat underside. */
const cumulus = (w: number, h: number, seed: string) => {
  const r = rng(`p8cu/${seed}`);
  const circ = (x: number, y: number, rad: number) => `M${(x - rad).toFixed(1)} ${y.toFixed(1)}a${rad.toFixed(1)} ${rad.toFixed(1)} 0 1 0 ${(2 * rad).toFixed(1)} 0a${rad.toFixed(1)} ${rad.toFixed(1)} 0 1 0 ${(-2 * rad).toFixed(1)} 0Z`;
  const bumps: [number, number, number][] = [];
  const n = Math.max(5, Math.round(w / 95));
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n + r.jitter(0.03);
    const dome = Math.pow(Math.sin(Math.PI * Math.min(0.98, Math.max(0.02, u))), 1.4);
    const rad = h * (0.2 + 0.3 * dome) * r.range(0.85, 1.15);
    const y = -(h - rad) * dome * r.range(0.9, 1.0) - rad * 0.35;
    bumps.push([-w / 2 + w * u, Math.min(-rad * 0.35, y), rad]);
  }
  const m = Math.max(4, Math.round(w / 70));
  for (let i = 0; i < m; i++) {
    const u = (i + 0.5) / m;
    const rad = h * r.range(0.12, 0.18);
    // sitting ON the flat base (never poking below it: a row of beads)
    bumps.push([-w / 2 + w * 0.08 + w * 0.84 * u + r.jitter(10), -h * 0.2 - rad * 0.55, rad]);
  }
  const bh = h * 0.22;
  const base = (dy: number) => roundRect(-w / 2, -bh + dy, w, bh, bh / 2);
  const lit = bumps.map(([x, y, rad]) => circ(x, y, rad)).join('') + base(0);
  const body = bumps.map(([x, y, rad]) => circ(x - rad * 0.13, y - rad * 0.08, rad)).join('') + roundRect(-w / 2 - w * 0.02, -bh - h * 0.07, w * 0.97, bh, bh / 2);
  return {lit, body};
};

type Cloud = {cx: number; base: number; w: number; h: number; v: number; seed: string};
/** Far layer: smaller, slower, a violet step. Near layer: HUGE heaps (the biggest is cut by the top and right edges). */
const FAR_CLOUDS: Cloud[] = [
  {cx: 500, base: 168, w: 260, h: 92, v: 11, seed: 'f0'},
  {cx: -120, base: 132, w: 360, h: 120, v: 11, seed: 'f1'},
];
const NEAR_CLOUDS: Cloud[] = [
  {cx: 905, base: 238, w: 840, h: 430, v: 19, seed: 'n0'},
  {cx: 190, base: 222, w: 500, h: 215, v: 19, seed: 'n1'},
];
const cloudGeo = (c: Cloud) => ({...c, ...cumulus(c.w, c.h, c.seed)});
const FAR_G = FAR_CLOUDS.map(cloudGeo);
const NEAR_G = NEAR_CLOUDS.map(cloudGeo);

export const P8Clouds: React.FC = () => {
  const t = useTime();
  const draw = (gs: ReturnType<typeof cloudGeo>[], body: string, lit: string) =>
    gs.map((c) => (
      <g key={c.seed} transform={`translate(${(c.cx + c.v * t).toFixed(2)} ${c.base})`}>
        <path d={c.lit} fill={lit} />
        <path d={c.body} fill={body} />
      </g>
    ));
  return (
    <>
      {draw(FAR_G, P8X.cloudFar, P8X.cloudFarLit)}
      {draw(NEAR_G, P8X.cloud, P8X.cloudLit)}
    </>
  );
};

// ---------------------------------------------------------------- the far skylines (haze 1 and 2)

const CITY_BASE = 714;

const HAZE1 = (() => {
  const r = rng('p8/haze1');
  let d = '';
  for (let x = -60; x < 1140; ) {
    const w = r.range(22, 60);
    const h = r.chance(0.14) ? r.range(44, 58) : r.range(10, 38);
    d += polyPath([
      [x, CITY_BASE + 30],
      [x, CITY_BASE - h],
      [x + w, CITY_BASE - h],
      [x + w, CITY_BASE + 30],
    ]);
    x += w + (r.chance(0.3) ? r.range(3, 14) : -r.range(0, 8));
  }
  return d;
})();

/** The far towers: two clusters (left and right of the building's apex), tops at y >= 606. */
const HAZE2 = (() => {
  const r = rng('p8/haze2');
  let d = '';
  const wins: {x: number; y: number; seed: string}[] = [];
  const cluster = (x0: number, x1: number, tall: number) => {
    for (let x = x0; x < x1; ) {
      const w = r.range(16, 44);
      const h = r.chance(0.25) ? r.range(70, tall) : r.range(24, 64);
      const top = CITY_BASE - h;
      d += polyPath([
        [x, CITY_BASE + 30],
        [x, top],
        [x + w, top],
        [x + w, CITY_BASE + 30],
      ]);
      // a setback crown on some tall ones
      if (h > 70 && r.chance(0.6)) d += polyPath([[x + w * 0.25, top + 1], [x + w * 0.25, top - 8], [x + w * 0.75, top - 8], [x + w * 0.75, top + 1]]);
      // a few window lights on the towers (tiny; they twinkle)
      const nw = Math.floor(h / 22);
      for (let k = 0; k < nw; k++) if (r.chance(0.55)) wins.push({x: x + r.range(4, Math.max(5, w - 8)), y: top + r.range(8, h - 8), seed: `w${Math.round(x)}-${k}`});
      x += w + r.range(2, 16);
    }
  };
  cluster(-50, 300, 104);
  cluster(360, 470, 60);
  cluster(700, 860, 80);
  cluster(950, 1140, 100);
  return {d, wins};
})();

export const P8FarCity: React.FC = () => <Fill d={HAZE1} color={P8X.haze1} offset={false} />;

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

// ---------------------------------------------------------------- the river, its bridge, the far bank

const BANK_TOP = 706;
const RIVER: [number, number] = [718, 734];

const BRIDGE = (() => {
  const deck = 720;
  let d = roundRect(-40, deck, 420, 4, 1);
  for (let x = -20; x < 380; x += 46) d += polyPath([[x, deck + 3], [x + 5, deck + 3], [x + 5, RIVER[1]], [x, RIVER[1]]]);
  return {deck, d};
})();

export const P8River: React.FC = () => {
  const t = useTime();
  // glints step at 5 drawings / s: short light dashes; under the sun, its reflection path in peach
  const step = Math.floor(t * 5 + 1e-6);
  const r = rng(`p8/glints${step}`);
  let glints = '';
  for (let i = 0; i < 16; i++) {
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
  for (let i = 0; i < 5; i++) {
    const dir = i % 2 === 0 ? 1 : -1;
    const span = 460;
    const x = ((((rand('p8br', i) * span + dir * 34 * t) % span) + span) % span) - 50;
    cars.push(<rect key={i} x={x} y={BRIDGE.deck - 3} width={7} height={3} fill={P8X.farCar} />);
    cars.push(<rect key={`h${i}`} x={dir === 1 ? x + 6 : x - 1} y={BRIDGE.deck - 2.5} width={2} height={2} fill={P8X.farLight} />);
  }
  return (
    <>
      <Fill rect={[-300, BANK_TOP, 1680, RIVER[0] - BANK_TOP]} color={P8X.bank} offset={false} />
      <Fill rect={[-300, RIVER[0], 1680, 400]} color={P8X.river} offset={false} />
      <path d={glints} fill={P8X.glint} />
      <path d={sunPath} fill={P.sun} />
      <path d={BRIDGE.d} fill={P8X.bridge} />
      {cars}
    </>
  );
};

// ---------------------------------------------------------------- the far suburbs, the far highway, the near woods

const SUB_TOP = RIVER[1];
const FAR_ROAD: [number, number] = [764, 771];

const SUBURBS = (() => {
  const r = rng('p8/suburbs');
  let roofs = '';
  let lit = '';
  let trees = '';
  const wins: {x: number; y: number; seed: string}[] = [];
  const rows = [
    {y: 742, s: 0.8},
    {y: 751, s: 0.9},
    {y: 760, s: 1.0},
  ];
  rows.forEach((row, ri) => {
    for (let x = -60 + r.range(0, 20); x < 1140; ) {
      if (r.chance(0.32)) {
        // a clump of trees
        const rr = r.range(5, 9) * row.s;
        trees += roundRect(x, row.y - rr * 1.4, rr * 2.4, rr * 1.6, rr * 0.8);
        x += rr * 2.4 + r.range(1, 5);
        continue;
      }
      const w = r.range(8, 14) * row.s;
      const h = r.range(4, 7) * row.s;
      roofs += polyPath([[x, row.y], [x, row.y - h], [x + w, row.y - h], [x + w, row.y]]);
      lit += polyPath([[x - 1, row.y - h], [x + w * 0.5, row.y - h - 3 * row.s], [x + w + 1, row.y - h]]);
      if (r.chance(0.3)) wins.push({x: x + w * r.range(0.2, 0.6), y: row.y - h * 0.6, seed: `sw${ri}-${Math.round(x)}`});
      x += w + r.range(2, 7);
    }
  });
  return {roofs, lit, trees, wins};
})();

const WOODS = (() => {
  const r = rng('p8/nearwoods');
  let light = '';
  let dark = '';
  let roofs = '';
  for (let x = -60; x < 1140; ) {
    const rx = r.range(12, 24);
    const ry = r.range(8, 13);
    const y = FAR_ROAD[1] + 17 + r.range(0, 6);
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
      <path d={SUBURBS.roofs} fill={P8X.subRoof} />
      <path d={SUBURBS.lit} fill={P8X.subRoofLit} />
      {SUBURBS.wins.map((w) => (onOff(t, `p8/${w.seed}`, 2 + rand(w.seed, 'p') * 2.5, 0.5) ? <rect key={w.seed} x={w.x} y={w.y} width={3} height={2.5} fill={P8X.towerLit} /> : null))}
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
    <Fill rect={[-300, FAR_ROAD[1] + 8, 1680, 500]} color={P.woods} offset={false} />
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
