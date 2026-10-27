// S10_near (S10 / S14 G5b): the near plane of the queue set. The road dressed in its perspective (kerbs with gaps,
// snowbanks, two tyre tracks, lane dashes, a steaming manhole, footprints on both pavements) with warm lamp pools;
// the wire with sparrows over the left street (they lift when the second data center cuts in, S14); the forecourt
// on the near right (the bus stop with three waiting, a bench under snow, a bin, a bike on the yard fence, a tall lamp
// post cut by the frame, a hydrant on the kerb) and the front row: a parent, a kid who points up the queue and a
// third with a coffee, their backs cut by the bottom edge. Pip rides on the van's roof (VanLife, inside the van's
// group so the S14 shove carries it): looking up the queue, snow slowly capping its head.
import React from 'react';
import {Ink} from '../../../lib/Ink';
import {blob, rect as rectInk} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {mat, XG} from '../../../lib/xf';
import {ease, prog, useTime} from '../../../lib/time';
import {backRowLayout, Bike3, WinterPerson, BusStop, EMBER, Exhaust, Footprints, Pip3, RoadDress, SnowCap, W, Walker, Wire3, ring, roadPt, roadScale} from '../kit';
import type {BackRowPerson, BackRowProps, PipPoseKey, Pt} from '../kit';
import {P, X_ROAD_L, X_ROAD_R, kAtZ, mixHex, quad, type QueueBeats} from './S10_geo';
import {HALO_SNOW, QLamp, type Item} from './S10_left';

// ---------------------------------------------------------------- the road

const roadL = (y: number) => 832 - 1.452 * (y - 856);
const roadR = (y: number) => 912 - 0.649 * (y - 856);
const ROAD = {yB: 1990, yT: 856, xBL: roadL(1990), xBR: roadR(1990), xTL: 832, xTR: 912};

/** The road's dressing and the lamp pools (drawn right over the road band, under everything standing). */
export const RoadGround: React.FC = () => {
  const pools: React.ReactNode[] = [];
  // warm pools under the lamps (flat steps), on the pavements and the road's edges
  [
    {z: 20, X: X_ROAD_L - 0.5, r: 3.2},
    {z: 28, X: X_ROAD_L - 0.5, r: 2.8},
    {z: 15.5, X: -0.6, r: 3.4},
  ].forEach((p, i) => {
    const k = kAtZ(p.z);
    const [x, y] = P(p.X, k, 0);
    pools.push(<ellipse key={`o${i}`} cx={x} cy={y} rx={p.r * k} ry={p.r * k * 0.3} fill={mixHex(EMBER.road, EMBER.ring, 0.4)} />);
    pools.push(<ellipse key={`i${i}`} cx={x} cy={y} rx={p.r * k * 0.55} ry={p.r * k * 0.16} fill={mixHex(EMBER.snow, EMBER.ring, 0.45)} />);
  });
  return (
    <>
      <RoadDress road={ROAD} fill={false} manhole={{u: 0.78, d: 0.05, steam: true}} seed="q/road" />
      <Ruts />
      <TrackEdges />
      {pools}
      <Slush />
      <Reflections />
      <Puddles />
      <Footprints points={FORECOURT_STEPS} size={13} shrink={0.7} seed="q/fcfp" />
    </>
  );
};

/** Hair ink along the tyre tracks' edges on the near half of the road (the field reads as a trodden street). */
const TrackEdges: React.FC = () => {
  let d = '';
  for (const u of [0.24, 0.33, 0.56, 0.65]) {
    let first = true;
    for (let i = 0; i <= 18; i++) {
      const dd = 0.005 + (i / 18) * 0.5;
      const [x, y] = roadPt(ROAD, u + Math.sin(i * 1.3 + u * 9) * 0.004, dd);
      d += `${first ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      first = false;
    }
  }
  return <Ink d={d} width={W.hair} color={mixHex(EMBER.road, EMBER.dcSide, 0.45)} />;
};

/** Slush ruts: the two tyre tracks pressed into grey-brown grit slush (two flat steps, the near half of the road), so
 *  the big road field is no longer two flat tones. */
const Ruts: React.FC = () => {
  const band = (u0: number, u1: number, d0: number, d1: number, wob: number) => {
    const n = 14;
    const a: Pt[] = [];
    const b: Pt[] = [];
    for (let i = 0; i <= n; i++) {
      const dd = d0 + ((d1 - d0) * i) / n;
      const w = Math.sin(i * 1.1 + wob) * 0.006;
      a.push(roadPt(ROAD, u0 + w, dd));
      b.push(roadPt(ROAD, u1 + w * 0.6, dd));
    }
    return quad([...a, ...b.reverse()]);
  };
  const grit = mixHex(EMBER.road, EMBER.pot, 0.16);
  const wet = mixHex(EMBER.road, EMBER.dc, 0.2);
  return (
    <>
      <path d={band(0.22, 0.35, 0.0, 0.48, 0) + band(0.54, 0.67, 0.0, 0.5, 2)} fill={grit} />
      <path d={band(0.25, 0.31, 0.0, 0.42, 1) + band(0.58, 0.63, 0.0, 0.44, 3)} fill={wet} />
    </>
  );
};

/** Meltwater puddles on the near road, each holding a lamp's warm reflection (flat steps that shimmer) and a drip ring
 *  now and then (small life on the near field). World (X, z) on the road. */
const PUDDLES: {X: number; z: number; r: number; ph: number}[] = [
  {X: -10, z: 13, r: 2.0, ph: 0},
  {X: -7.9, z: 11.2, r: 1.6, ph: 1.3},
  {X: -8.6, z: 16.5, r: 1.7, ph: 2.1},
  {X: -9.6, z: 21, r: 1.5, ph: 0.7},
  {X: -12.8, z: 18.5, r: 1.5, ph: 1.7},
];
const Puddles: React.FC = () => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  PUDDLES.forEach((p, i) => {
    const k = kAtZ(p.z);
    const [x, y] = P(p.X, k, 0);
    const rx = p.r * k;
    const ry = rx * 0.26;
    const d = blob(x, y, rx, ry, {seed: `q/pud${i}`});
    out.push(<path key={`p${i}`} d={d} fill={mixHex(EMBER.road, EMBER.dc, 0.4)} />);
    out.push(<path key={`s${i}`} d={blob(x - rx * 0.1, y - ry * 0.1, rx * 0.78, ry * 0.6, {seed: `q/pus${i}`})} fill={mixHex(EMBER.sky, EMBER.road, 0.25)} />);
    // the lamp's reflection: a warm column broken by the ripples into three tapering pieces, wobbling
    const xc = x + rx * 0.22 + Math.sin(t * 3.1 + p.ph) * rx * 0.025;
    const cw = Math.max(5, rx * 0.16) * (1 + 0.15 * Math.sin(t * 5 + p.ph));
    let col = '';
    [
      [-0.8, -0.38, 1],
      [-0.28, 0.06, 0.72],
      [0.16, 0.44, 0.45],
    ].forEach(([y0, y1, w]) => {
      const ww = cw * w;
      col += `M${(xc - ww / 2).toFixed(1)} ${(y + ry * y0).toFixed(1)}h${ww.toFixed(1)}l${(-ww * 0.12).toFixed(1)} ${(ry * (y1 - y0)).toFixed(1)}h${(-ww * 0.76).toFixed(1)}Z`;
    });
    out.push(<path key={`r${i}`} d={col} fill={EMBER.ring} />);
    out.push(<ellipse key={`h${i}`} cx={xc} cy={y - ry * 0.62} rx={cw * 0.28} ry={ry * 0.12} fill={EMBER.core} />);
    // a drip ring every ~1.4 s
    const cyc = (t + p.ph) % 1.4;
    if (cyc < 0.6) {
      const u = cyc / 0.6;
      out.push(<ellipse key={`d${i}`} cx={x - rx * 0.3} cy={y + ry * 0.1} rx={rx * (0.08 + 0.3 * u)} ry={ry * (0.08 + 0.3 * u)} fill="none" stroke={EMBER.frost} strokeWidth={2.6 * (1 - u) + 0.4} />);
    }
  });
  return <>{out}</>;
};

/** Warm streaks on the wet road under the lamps and the shopfronts (flat, short, broken). */
const Reflections: React.FC = () => {
  const r = rng('q/refl');
  let d = '';
  const spots: [number, number, number][] = [
    [0.04, 0.12, 3],
    [0.06, 0.2, 3],
    [0.1, 0.06, 2],
  ];
  for (const [u, dd, n] of spots) {
    for (let i = 0; i < n; i++) {
      const [x, y] = roadPt(ROAD, u + r.range(-0.02, 0.03), dd + i * 0.012);
      const len = r.range(24, 52) * roadScale(ROAD, dd);
      d += `M${x.toFixed(0)} ${y.toFixed(0)}h${len.toFixed(0)}`;
    }
  }
  return <path d={d} stroke={mixHex(EMBER.road, EMBER.ring, 0.55)} strokeWidth={4} strokeLinecap="round" />;
};

/** A trail of footprints across the near forecourt (from the bus stop to the right edge). */
const FORECOURT_STEPS: Pt[] = Array.from({length: 13}, (_, i) => {
  const k = kAtZ(19.8 - i * 0.05);
  const [x, y] = P(-2.4 + i * 0.42, k, 0);
  return [x, y + Math.sin(i * 0.9) * 4] as Pt;
});

/** A snowman by the bench (a kid's work: a terracotta scarf, coal buttons, twig arms). Base centre on y, h = height. */
const Snowman: React.FC<{x: number; y: number; h: number; seed: string}> = ({x, y, h, seed}) => {
  const t = useTime();
  const r1 = h * 0.3;
  const r2 = h * 0.21;
  const r3 = h * 0.15;
  const c1 = y - r1;
  const c2 = c1 - r1 - r2 * 0.75;
  const c3 = c2 - r2 - r3 * 0.7;
  const tail = Math.sin(t * 2.4) * h * 0.02;
  return (
    <>
      <path d={`M${x - r2 * 0.8} ${c2}l${-h * 0.32} ${-h * 0.16}M${x + r2 * 0.8} ${c2}l${h * 0.3} ${-h * 0.2}l${h * 0.06} ${-h * 0.07}`} stroke={EMBER.anchor} strokeWidth={Math.max(1.6, h * 0.025)} strokeLinecap="round" />
      <path d={blob(x, c1, r1, r1 * 0.94, {seed: `${seed}/1`}) + blob(x, c2, r2, r2 * 0.95, {seed: `${seed}/2`}) + blob(x, c3, r3, r3, {seed: `${seed}/3`})} fill={EMBER.snow} />
      <path d={blob(x, c1, r1, r1 * 0.94, {seed: `${seed}/1`}) + blob(x, c2, r2, r2 * 0.95, {seed: `${seed}/2`}) + blob(x, c3, r3, r3, {seed: `${seed}/3`})} fill="none" stroke={EMBER.ink} strokeWidth={W.far} />
      <path d={`M${x - r2 * 0.9} ${c2 - r2 * 0.75}q${r2 * 0.9} ${r2 * 0.4} ${r2 * 1.8} 0l${-r2 * 0.1} ${r2 * 0.25}q${-r2 * 0.8} ${r2 * 0.35} ${-r2 * 1.6} 0z`} fill={EMBER.pot} />
      <path d={`M${x + r2 * 0.4} ${c2 - r2 * 0.6}l${r2 * 0.25 + tail} ${r2 * 0.9}l${r2 * 0.22} ${-r2 * 0.05}z`} fill={EMBER.pot} />
      <circle cx={x} cy={c2 - r2 * 0.1} r={Math.max(1.6, h * 0.022)} fill={EMBER.anchor} />
      <circle cx={x} cy={c2 + r2 * 0.35} r={Math.max(1.6, h * 0.022)} fill={EMBER.anchor} />
      <circle cx={x - r3 * 0.35} cy={c3 - r3 * 0.15} r={Math.max(1.4, h * 0.018)} fill={EMBER.anchor} />
      <circle cx={x + r3 * 0.35} cy={c3 - r3 * 0.15} r={Math.max(1.4, h * 0.018)} fill={EMBER.anchor} />
      <path d={`M${x} ${c3 + r3 * 0.05}l${r3 * 0.7} ${r3 * 0.12}l${-r3 * 0.7} ${r3 * 0.14}z`} fill={EMBER.pot} />
    </>
  );
};

/** Slush and grit on the near road: short darker strokes and specks along the tracks (texture on the big field). */
const Slush: React.FC = () => {
  const r = rng('q/slush');
  let d = '';
  for (let i = 0; i < 46; i++) {
    const y = r.range(1250, 1910);
    const xl = Math.max(-40, roadL(y));
    const xr = roadR(y);
    const x = r.range(xl + 20, xr - 20);
    const k = (y - 756) / 10.6;
    const len = r.range(0.4, 1.4) * k;
    d += `M${x.toFixed(0)} ${y.toFixed(0)}l${(len * 0.55).toFixed(1)} ${(-len * 0.5).toFixed(1)}`;
  }
  return <path d={d} stroke={mixHex(EMBER.road, EMBER.dcSide, 0.25)} strokeWidth={2.2} strokeLinecap="round" />;
};

// ---------------------------------------------------------------- forecourt props

const Bench: React.FC<{x: number; y: number; w: number; seed: string}> = ({x, y, w, seed}) => {
  const h = w * 0.36;
  return (
    <>
      <rect x={x - w / 2} y={y - h * 0.62} width={w} height={h * 0.14} fill={EMBER.beam} />
      <rect x={x - w / 2} y={y - h} width={w} height={h * 0.12} fill={EMBER.beam} />
      <rect x={x - w / 2} y={y - h * 0.8} width={w} height={h * 0.1} fill={EMBER.beam} />
      <path d={`M${x - w * 0.42} ${y - h * 0.5}v${h * 0.5}M${x + w * 0.42} ${y - h * 0.5}v${h * 0.5}`} stroke={EMBER.anchor} strokeWidth={Math.max(2, w * 0.03)} />
      <path d={blob(x, y - h * 0.64, w * 0.48, h * 0.1 + 2, {seed: `${seed}/s1`}) + blob(x, y - h * 1.02, w * 0.46, h * 0.07 + 1.5, {seed: `${seed}/s2`})} fill={EMBER.snow} />
      <Ink d={`M${x - w / 2} ${y - h * 0.62}h${w}M${x - w / 2} ${y - h}h${w}`} width={W.far} />
    </>
  );
};

const Bin: React.FC<{x: number; y: number; w: number; seed: string}> = ({x, y, w, seed}) => {
  const h = w * 1.35;
  return (
    <>
      <rect x={x - w * 0.06} y={y - h * 1.25} width={w * 0.12} height={h * 1.25} fill={EMBER.dcSide} />
      <path d={`M${x - w / 2} ${y - h}h${w}l${-w * 0.08} ${h * 0.9}h${-w * 0.84}Z`} fill={EMBER.dc} />
      <path d={`M${x - w * 0.36} ${y - h * 0.62}h${w * 0.72}`} stroke={EMBER.dcSide} strokeWidth={1.6} />
      <SnowCap x={x - w * 0.54} y={y - h} w={w * 1.08} h={w * 0.16} seed={`${seed}/sn`} />
      <Ink d={rectInk(x - w / 2, y - h, w, h * 0.9, {seed: `${seed}/i`, over: [0, 1]})} width={W.far} />
    </>
  );
};

/** A fire hydrant on the near kerb (cream with a terracotta cap, snow on top). Base centre on y. */
const Hydrant: React.FC<{x: number; y: number; h: number; seed: string}> = ({x, y, h, seed}) => {
  const w = h * 0.44;
  return (
    <>
      <path d={`M${x - w / 2} ${y}V${y - h * 0.72}Q${x} ${y - h * 0.98} ${x + w / 2} ${y - h * 0.72}V${y}Z`} fill={EMBER.wall} />
      <rect x={x - w * 0.8} y={y - h * 0.56} width={w * 1.6} height={h * 0.13} fill={EMBER.pot} />
      <rect x={x - w * 0.6} y={y - h * 0.08} width={w * 1.2} height={h * 0.08} fill={EMBER.pot} />
      <path d={blob(x, y - h * 0.92, w * 0.42, h * 0.07 + 1, {seed: `${seed}/s`})} fill={EMBER.snow} />
      <Ink d={`M${x - w / 2} ${y}V${y - h * 0.72}Q${x} ${y - h * 0.98} ${x + w / 2} ${y - h * 0.72}V${y}`} width={W.mid} />
    </>
  );
};

/** A kerb bollard (dark post, a warm reflective band, a snow cap). Base centre on y. */
const Bollard: React.FC<{x: number; y: number; h: number; seed: string}> = ({x, y, h, seed}) => {
  const w = h * 0.2;
  return (
    <>
      <rect x={x - w / 2} y={y - h} width={w} height={h} fill={EMBER.dcSide} />
      <rect x={x - w / 2} y={y - h * 0.78} width={w} height={h * 0.12} fill={EMBER.ring} />
      <path d={blob(x, y - h, w * 0.62, h * 0.06 + 1, {seed: `${seed}/s`})} fill={EMBER.snow} />
      <Ink d={rectInk(x - w / 2, y - h, w, h, {seed: `${seed}/i`, over: [0, 1]})} width={W.hair} />
    </>
  );
};

/** A council grit bin (ochre box, a sloped lid with snow, a stencilled GRIT). Base centre on y. */
const GritBin: React.FC<{x: number; y: number; w: number; seed: string}> = ({x, y, w, seed}) => {
  const h = w * 0.62;
  return (
    <>
      <path d={`M${x - w / 2} ${y}V${y - h}H${x + w / 2}V${y}Z`} fill={EMBER.houseLit} />
      <path d={`M${x - w * 0.54} ${y - h}L${x - w * 0.46} ${y - h * 1.3}H${x + w * 0.46}L${x + w * 0.54} ${y - h}Z`} fill={mixHex(EMBER.houseLit, EMBER.beam, 0.35)} />
      <path d={blob(x, y - h * 1.3, w * 0.46, h * 0.1 + 1.5, {seed: `${seed}/s`})} fill={EMBER.snow} />
      <text x={x} y={y - h * 0.36} textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight={800} fontSize={w * 0.2} fill={EMBER.beam}>
        GRIT
      </text>
      <Ink d={`M${x - w / 2} ${y}V${y - h}H${x + w / 2}V${y}M${x - w * 0.54} ${y - h}L${x - w * 0.46} ${y - h * 1.3}H${x + w * 0.46}L${x + w * 0.54} ${y - h}`} width={W.far} />
    </>
  );
};

/** A kid's wooden sledge stood on end against a bollard (slats, a red runner, a tow rope looping to the snow). */
const Sledge: React.FC<{x: number; y: number; h: number; seed: string}> = ({x, y, h, seed}) => {
  const w = h * 0.42;
  const sk = h * 0.12;
  let slats = '';
  for (let i = 1; i < 5; i++) slats += `M${x - w / 2 + sk * (i / 5)} ${y - h * (i / 5)}h${w}`;
  return (
    <>
      <path d={`M${x - w / 2} ${y}L${x - w / 2 + sk} ${y - h}h${w}L${x + w / 2} ${y}Z`} fill={EMBER.desk} />
      <path d={slats} stroke={EMBER.beam} strokeWidth={Math.max(1.4, h * 0.02)} />
      <path d={`M${x - w / 2 - 2} ${y}L${x - w / 2 + sk - 2} ${y - h}M${x + w / 2 + 2} ${y}L${x + w / 2 + sk + 2} ${y - h}`} stroke={EMBER.hero} strokeWidth={Math.max(2, h * 0.04)} strokeLinecap="round" />
      <path d={`M${x + sk * 0.6} ${y - h * 0.94}q${w * 0.9} ${h * 0.3} ${w * 0.5} ${h * 0.96}`} fill="none" stroke={EMBER.anchor} strokeWidth={Math.max(1.2, h * 0.015)} />
      <path d={blob(x + sk, y - h, w * 0.5, h * 0.05 + 1, {seed: `${seed}/s`})} fill={EMBER.snow} />
      <Ink d={`M${x - w / 2} ${y}L${x - w / 2 + sk} ${y - h}h${w}L${x + w / 2} ${y}`} width={W.hair} />
    </>
  );
};

/** The ploughed ridge along the near kerb: a lumpy bank of grey-white snow with grit specks (z0..z1 at X). */
const KerbRidge: React.FC<{X: number; z0: number; z1: number; seed: string}> = ({X, z0, z1, seed}) => {
  const r = rng(seed);
  let d = '';
  let specks = '';
  for (let z = z1; z >= z0; z -= 0.9) {
    const k = kAtZ(z);
    const [x, y] = P(X, k, 0);
    const rx = r.range(0.7, 1.0) * k;
    const ry = r.range(0.22, 0.32) * k;
    d += blob(x, y - ry * 0.4, rx, ry, {seed: `${seed}/${z.toFixed(1)}`});
    for (let i = 0; i < 3; i++) specks += `M${(x + r.range(-0.6, 0.6) * rx).toFixed(0)} ${(y - r.range(0.1, 0.6) * ry).toFixed(0)}h2`;
  }
  return (
    <>
      <path d={d} fill={EMBER.frost} />
      <path d={specks} stroke={EMBER.beam} strokeWidth={2.4} strokeLinecap="round" />
    </>
  );
};

// ---------------------------------------------------------------- the front row

const FRONT_TOP = 1482;
const frontRow = (beats: QueueBeats): BackRowProps => {
  // the kid is drawn last (index 2) but stands in the middle, in front of the adults, so the pointing arm stays on top
  const people: BackRowPerson[] = [
    {hair: 'bun', wear: ['bag'], coat: '#6B4A6E', coatDetail: ['quilt', 'yoke'], sMul: 1.04, dy: 0, dx: -6, moves: [{t: 0.86, kind: 'turn', amp: 1.3}, {t: 2.1, kind: 'lean', amp: 0.8, dir: -1}]},
    {hair: 'short', acc: ['scarf'], wear: ['coffee'], coat: EMBER.dc, coatDetail: ['quilt', 'yoke'], sMul: 1.0, dy: 14, dx: 146, moves: [{t: 1.22, kind: 'nudge', amp: 0.9, dir: -1}, {t: 1.98, kind: 'turn', amp: 1.1}]},
    {hair: 'beanie', wear: ['point'], pointAt: beats.kidPointAt, coat: EMBER.pot, hat: EMBER.dcSide, coatDetail: ['quilt', 'zip'], sMul: 0.72, dy: 84, dx: -134},
  ];
  return {x0: 600, x1: 990, top: FRONT_TOP, head: 106, n: 3, seed: 'q/front', people, snow: true, lookX: 760};
};

/** The front row's left wing along the near pavement (fix round: the near bottom-left was an empty snowfield): a
 *  snowy hood and a shopper in earmuffs with a bag who leans to see up the queue. All at x > 260
 *  and head tops >= 1480, so S14's shoved van (x 0-260, y 1408-1600) stays clear. Drawn behind the main row. */
const frontRowL = (beats: QueueBeats): BackRowProps => {
  const people: BackRowPerson[] = [
    {hair: 'long', acc: ['hood'], coat: '#5E5A86', coatDetail: ['quilt', 'pockets'], sMul: 0.96, dy: 44, dx: 6, moves: [{t: 1.1, kind: 'turn', amp: 1.0}]},
    {hair: 'curly', wear: ['earmuffs', 'bag'], acc: ['scarf'], coat: EMBER.beam, coatDetail: ['yoke', 'pockets'], sMul: 1.0, dy: 8, dx: -10, moves: [{t: beats.rowLeanAt ?? 0.6, kind: 'lean', amp: 0.9, dir: 1}]},
  ];
  return {x0: 262, x1: 572, top: 1500, head: 112, n: 2, seed: 'q/frontL', people, snow: true, lookX: 760};
};

export function nearItems(beats: QueueBeats): Item[] {
  const items: Item[] = [];
  // the wire over the left street (from off the left edge to the factory's corner), sparrows on its left half
  items.push({
    k: 31.7,
    el: <Wire3 key="wire" a={[-60, 778]} b={[648, 744]} sag={34} n={2} gap={11} birds={{us: [0.1, 0.17, 0.25, 0.31, 0.42], size: 16, liftAt: beats.birdsLiftAt, rise: 60, fly: 420}} seed="q/wire" />,
  });
  // the bus stop on the near right pavement
  {
    const z = 21;
    const k = kAtZ(z);
    const [x, y] = P(-3.5, k, 0);
    items.push({k, el: <BusStop key="bus" x={x} y={y} h={2.5 * k} people={3} turnAt={beats.busTurnAt} seed="q/bus" />});
  }
  // the bike on the yard's front fence, the bin, the bench
  {
    const k = kAtZ(30.6);
    const [x, y] = P(0.4, k, 0);
    items.push({k, el: <Bike3 key="bike" x={x} y={y} w={1.7 * k} seed="q/bike" ink={W.hair} />});
  }
  {
    const k = kAtZ(23);
    const [x, y] = P(0.6, k, 0);
    items.push({k, el: <Bin key="bin" x={x} y={y} w={0.55 * k} seed="q/bin" />});
  }
  {
    const k = kAtZ(18.2);
    const [x, y] = P(1.2, k, 0);
    items.push({k, el: <Bench key="bench" x={x} y={y} w={1.6 * k} seed="q/bench" />});
  }
  // the snowman by the bench; a walker with a dog crossing the forecourt (sideways, toward the bus stop)
  {
    const k = kAtZ(19.2);
    const [x, y] = P(0.25, k, 0);
    items.push({k, el: <Snowman key="snowman" x={x} y={y} h={1.25 * k} seed="q/snowman" />});
  }
  {
    const z = 19.6;
    const k = kAtZ(z);
    const a = P(2.6, k, 0);
    const bb = P(-5.2, k, 0);
    items.push({k: k + 0.05, el: <Walker key="fcw" from={a} to={bb} h={1.74 * k} speed={68} phase={0.42} pause={1.1} seed="q/fcw" wear={['snow']} acc={['scarf']} dog />});
  }
  // the tall lamp post on the near right (cut by the front row)
  {
    const k = kAtZ(15.5);
    const [x, y] = P(-0.6, k, 0);
    items.push({k, el: <QLamp key="lpN" x={x} y={y} h={4.6 * k} halo={HALO_SNOW} r={[1.7, 1.05]} seed="q/lpN" ink={W.mid} />});
  }
  // the near kerb corner: the ploughed ridge, bollards, the grit bin, a sledge stood against a bollard, a bike leaning
  items.push({k: kAtZ(13), el: <KerbRidge key="ridge" X={X_ROAD_R + 0.45} z0={13} z1={27} seed="q/ridge" />});
  [16.4, 19, 21.8, 25].forEach((z) => {
    const k = kAtZ(z);
    const [x, y] = P(X_ROAD_R + 0.7, k, 0);
    items.push({k, el: <Bollard key={`bol${z}`} x={x} y={y} h={0.95 * k} seed={`q/bol${z}`} />});
  });
  {
    const k = kAtZ(20.2);
    const [x, y] = P(X_ROAD_R + 1.9, k, 0);
    items.push({k, el: <GritBin key="grit" x={x} y={y} w={1.05 * k} seed="q/grit" />});
  }
  {
    const k = kAtZ(18.9);
    const [x, y] = P(X_ROAD_R + 1.15, k, 0);
    items.push({k: kAtZ(18.95), el: <Sledge key="sledge" x={x} y={y} h={1.05 * k} seed="q/sledge" />});
  }
  {
    const k = kAtZ(16.6);
    const [x, y] = P(X_ROAD_R + 1.7, k, 0);
    items.push({k: kAtZ(16.65), el: <Bike3 key="bikeK" x={x} y={y} w={1.75 * k} seed="q/bikeK" ink={W.hair} flip />});
  }
  // the hydrant on the near kerb
  {
    const k = kAtZ(12);
    const [x, y] = P(X_ROAD_R + 0.6, k, 0);
    items.push({k, el: <Hydrant key="hyd" x={x} y={y} h={0.75 * k} seed="q/hyd" />});
  }
  // the front row (nearest of all)
  items.push({k: 400, el: <FrontRow key="front" beats={beats} />});
  return items;
}

/** The front row (kit BackRow's layout, drawn here so the kid, last in the row, is MIRRORED: the kit's pointing arm goes
 *  up-right, a mirrored back view points up-left, up the queue). */
const FrontRow: React.FC<{beats: QueueBeats}> = ({beats}) => {
  const t = useTime();
  const props = frontRow(beats);
  return (
    <>
      {backRowLayout(frontRowL(beats), t).map(({i, person, lean, cx, hipY}) => (
        <XG key={`l${i}`} m={mat.about(mat.rotate(lean), cx, hipY)}>
          <WinterPerson {...person} />
        </XG>
      ))}
      {backRowLayout(props, t).map(({i, person, lean, cx, hipY}) => (
        <XG key={i} m={i === 2 ? mat.compose(mat.about(mat.scale(-1, 1), cx, hipY), mat.about(mat.rotate(-lean), cx, hipY)) : mat.about(mat.rotate(lean), cx, hipY)}>
          <WinterPerson {...person} />
        </XG>
      ))}
    </>
  );
};

// ---------------------------------------------------------------- the van's life (inside the van's group)

/** Pip on the van's roof, the exhaust, the headlight's beam on the road ahead and (S14) the snow shaken off the roof.
 *  `van` = the van's {x, y, w} (wheels' ground centre); everything is in the van's frame (the shove moves the group). */
export const VanLife: React.FC<{van: {x: number; y: number; w: number}; beats: QueueBeats; layer: 'under' | 'over'}> = ({van, beats, layer}) => {
  const t = useTime();
  const x0 = van.x - van.w / 2;
  const top = van.y - van.w * 0.5;
  const boxW = van.w * 0.68;
  if (layer === 'under') {
    // the beam on the road ahead (a flat step lighter than the road), the exhaust behind
    const hx = x0 + van.w * 0.99;
    const hy = top + van.w * 0.33;
    const beam = quad([
      [hx, hy + 4],
      [hx + 150, hy - 70],
      [hx + 210, hy - 40],
      [hx + 40, van.y - 4],
    ]);
    return (
      <>
        <path d={beam} fill={HALO_SNOW[0]} />
        <Exhaust x={x0 - 4} y={van.y - van.w * 0.06} dir={-1} size={1.1} seed="q/vanex" />
      </>
    );
  }
  // Pip: rides the roof, looking up the queue; S10 on "first dibs" a silhouette change that reads from the back (ears
  // clamped down, a look round toward camera, worried); S14 slides and clings on the shove, then shakes the snow off
  const pushAt = beats.pushAt;
  const keys: PipPoseKey[] = [{t: -1, pose: 'sit-back', look: 0.55}];
  if (beats.pipDroopAt !== undefined) keys.push({t: beats.pipDroopAt, pose: 'ears-cover', look: -0.35, expression: 'worried'});
  if (pushAt !== undefined) {
    keys.push({t: pushAt + 0.02, pose: 'ears-cover', look: -0.4, expression: 'wide'});
    keys.push({t: pushAt + 0.62, pose: 'sit-back', look: 0.55});
  }
  // the slide nets RIGHTWARD (inertia toward the cab, the van is shoved back-left): Pip ends near the box's front end,
  // feet at screen x ~115, clear of the left edge and left of the waiting dots
  const slide = pushAt !== undefined ? ring(t, pushAt, 30, 1.6, 4.5) + 76 * prog(t, pushAt, (beats.pushDur ?? 0.3) + 0.12, ease.outCubic) : 0;
  const pipX = x0 + boxW * 0.62 + slide;
  const pipY = top - 5;
  const out: React.ReactNode[] = [
    <Pip3 key="pip" x={pipX} y={pipY} scale={0.94} keys={keys} jolts={beats.pipDroopAt !== undefined ? [beats.pipDroopAt] : undefined} outdoor snowCap={[0, 4.2]} shakeAt={beats.pipShakeAt} seed={5} />,
  ];
  // snow sliding off the roof on the shove: chunks drop off the back edge and burst on the road
  if (pushAt !== undefined && t >= pushAt) {
    const r = rng('q/vansnow');
    let d = '';
    for (let i = 0; i < 7; i++) {
      const t0 = pushAt + r.range(0, 0.18);
      const dt = t - t0;
      if (dt < 0 || dt > 0.55) continue;
      const sx = x0 + r.range(-6, boxW * 0.35);
      const sy = top - 4 + 300 * dt * dt + 40 * dt;
      const rr = r.range(4, 9) * (1 - Math.max(0, dt - 0.4) / 0.15);
      if (rr > 0.5) d += blob(sx - dt * 60, sy, rr, rr * 0.8, {seed: `q/vs${i}`});
    }
    if (d) out.push(<path key="vsnow" d={d} fill={EMBER.snow} />);
  }
  return <>{out}</>;
};

