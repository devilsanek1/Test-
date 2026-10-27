// kit/Street.tsx: street and industrial life at blue hour in the snow (docs/v3/density_plan_g5b.md: S4-S6, S9, S10,
// S11, S14): lit lamp posts and wall lamps with flat halo steps, snowy trees, cars (side / back / front) with snow on
// the roof and their lights on, a headlight band sweeping a wall, the road dressing in perspective (kerbs, snowbanks,
// tyre tracks, lane dashes, a manhole, footprints), a straight-on pavement, a bus stop with people waiting, a receding
// fence, the gate booth with a barrier that lifts (stepped, 0.25 s), signs, floodlights, pallets, crates of gold
// sticks, a forklift on a back-and-forth loop, utility poles, wires with birds that lift off, an ink-only bike.
//
//   <LampPost3 x={120} y={1500} h={300} />                 <WallLamp x={1010} y={680} r={34} />
//   <Car3 x={540} y={1300} w={220} view="side" lights snow />  <HeadlightSweep rect={[0, 600, 1080, 780]} at={[6.4, 8.6]} />
//   <RoadDress road={{xBL: 60, xBR: 600, xTL: 760, xTR: 820, yB: 1700, yT: 980}} />
//   <GateBooth x={880} y={1010} w={150} liftAt={24.2} />      <Forklift x={0} y={980} w={150} loop={{a: 780, b: 860}} carry />
//   <Wire3 a={[40, 700]} b={[900, 760]} sag={30} birds={{n: 5, us: [...], liftAt: 34.76}} />

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, ellipse, line, poly, polyPath, rect as rectInk, roundRect, smooth, wire, wirePoint} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt, Show, Txt, W, TCircle, TEllipse, TPath, TRect} from './util';
import {bob, events, rings, shuttle, stepped, sway, sweep} from './idle';
import {Exhaust, SnowCap, Steam} from './Weather';
import {WinterPerson, personGeo} from './People3';
import {tiered} from '../../../lib/tier';

/** Snow-lit edge on posts and poles (a light sliver on the left so they read against house fronts). */
const SNOWLIT = EMBER.snow;
/** A step under the trodden road (tyre tracks). */
const TRACK = '#A3AECF';

// ---------------------------------------------------------------- lights

export type LampPost3Props = {
  /** Base (canvas px) and height to the lantern (px; 70-300). */
  x: number;
  y: number;
  h?: number;
  /** The lantern hangs from an arm on this side, or sits on top ('top'). */
  arm?: 'left' | 'right' | 'top';
  lit?: boolean;
  /** Flat halo steps (outer, inner): default the dusk sky's lighter step and the lamp gold. */
  halo?: [string, string] | false;
  /** Snow cap on the lantern. */
  snow?: boolean;
  at?: At;
  seed?: string;
  ink?: number;
};

/** A street lamp: a dark post with a snow-lit edge, a lantern with a bright core and flat halo steps, snow on top. */
const LampPost3Body: React.FC<LampPost3Props> = ({x, y, h = 300, arm = 'top', lit = true, halo = [EMBER.skyLow, EMBER.ring], snow = true, at, seed = 'lamp', ink}) => {
  const k = h / 300;
  const pw = Math.max(4, 12 * k);
  const iw = ink ?? (h >= 220 ? W.mid : h >= 120 ? W.far : W.hair);
  const top = y - h;
  const sd = arm === 'left' ? -1 : 1;
  const lx = arm === 'top' ? x : x + sd * 52 * k;
  const ly = arm === 'top' ? top - 6 * k : top + 22 * k;
  const lw = 30 * k;
  const lh = 40 * k;
  const lantern: Pt[] = [[lx - lw / 2, ly], [lx + lw / 2, ly], [lx + lw * 0.32, ly + lh], [lx - lw * 0.32, ly + lh]];
  const armD = arm === 'top' ? '' : `M${x} ${top + 6 * k}Q${x + sd * 30 * k} ${top - 10 * k} ${lx} ${ly}`;
  return (
    <>
      {lit && halo ? (
        <Show at={fillAt(at, 0.1)}>
          <TCircle cx={lx} cy={ly + lh * 0.55} r={lw * 2.6} fill={halo[0]} />
          <TCircle cx={lx} cy={ly + lh * 0.55} r={lw * 1.5} fill={halo[1]} />
        </Show>
      ) : null}
      <Fill rect={[x - pw / 2, top, pw, h]} color={EMBER.dcSide} at={fillAt(at)} seed={`${seed}/p`} />
      <Fill rect={[x - pw / 2, top + 6, Math.max(1.6, pw * 0.25), h - 8]} color={SNOWLIT} at={fillAt(at, 0.03)} offset={false} />
      <Fill rect={[x - pw * 1.1, y - 16 * k, pw * 2.2, 16 * k]} color={EMBER.dcSide} at={fillAt(at, 0.02)} offset={false} />
      <Fill d={polyPath(lantern)} color={lit ? EMBER.core : EMBER.frost} at={fillAt(at, 0.05)} seed={`${seed}/l`} />
      <Fill d={polyPath([[lx - lw * 0.62, ly], [lx + lw * 0.62, ly], [lx + lw * 0.3, ly - 12 * k], [lx - lw * 0.3, ly - 12 * k]])} color={EMBER.anchor} at={fillAt(at, 0.06)} offset={false} />
      {snow ? <TPath d={blob(lx, ly - 13 * k, lw * 0.42, 5 * k + 1, {seed: `${seed}/sn`})} fill={EMBER.snow} /> : null}
      <Ink d={line(x - pw / 2, y, x - pw / 2, top, {over: [0, 0], seed: `${seed}/i1`}) + line(x + pw / 2, y, x + pw / 2, top, {over: [0, 0], seed: `${seed}/i2`}) + poly(lantern, {closed: true, seed: `${seed}/li`, over: [0, 1]}) + armD} at={at} width={iw} />
    </>
  );
};
export const LampPost3 = tiered('environment', {bg: EMBER.sky}, LampPost3Body);

/** A round wall lamp with a flat halo step on the wall (S4: by the shop door; colours = the wall's lighter steps). */
const WallLampBody: React.FC<{x: number; y: number; r?: number; halo?: [string, string]; at?: At; seed?: string; ink?: number}> = ({x, y, r = 34, halo = [EMBER.core, EMBER.ring], at, seed = 'wlamp', ink = W.mid}) => (
  <>
    <Show at={fillAt(at, 0.1)}>
      <TCircle cx={x} cy={y} r={r * 3.2} fill={halo[0]} />
      <TCircle cx={x} cy={y} r={r * 2} fill={halo[1]} />
    </Show>
    <Fill rect={[x - r * 0.3, y - r * 1.6, r * 0.6, r * 0.8]} color={EMBER.anchor} at={fillAt(at)} offset={false} />
    <Fill d={circle(x, y, r)} color={EMBER.core} at={fillAt(at, 0.04)} seed={`${seed}/g`} />
    <Ink d={circle(x, y, r, {seed: `${seed}/i`}) + rectInk(x - r * 0.3, y - r * 1.6, r * 0.6, r * 0.6, {seed: `${seed}/b`, over: [0, 0]})} at={at} width={ink} />
    <TPath d={blob(x, y - r * 1.62, r * 0.42, r * 0.14 + 1, {seed: `${seed}/sn`})} fill={EMBER.snow} />
  </>
);
export const WallLamp = tiered('environment', {bg: EMBER.sky}, WallLampBody);

// ---------------------------------------------------------------- trees

/** A winter tree: 'bare' (branches with snow on them) or 'pine' (stacked tiers with snow caps); a slow sway. */
const SnowTreeBody: React.FC<{x: number; y: number; h?: number; kind?: 'bare' | 'pine'; seed?: string; at?: At; ink?: number; far?: boolean}> = ({x, y, h = 200, kind = 'pine', seed = 'tree', at, ink, far}) => {
  const t = useTime();
  const iw = far ? 0 : ink ?? (h >= 200 ? W.mid : W.far);
  const a = sway(t, 0.8, 4.6, x * 0.01);
  if (kind === 'pine') {
    const tiers = 3;
    const out: React.ReactNode[] = [];
    for (let i = 0; i < tiers; i++) {
      const ty = y - h * 0.12 - i * h * 0.26;
      const tw = h * (0.5 - i * 0.12);
      const th = h * 0.42;
      const tri: Pt[] = [[x - tw / 2, ty], [x, ty - th], [x + tw / 2, ty]];
      out.push(
        <React.Fragment key={i}>
          <Fill d={polyPath(tri)} color={i % 2 ? EMBER.leaf : '#35503A'} at={fillAt(at, i * 0.03)} seed={`${seed}/t${i}`} offset={far ? false : undefined} />
          <Fill d={polyPath([[x - tw * 0.36, ty - th * 0.3], [x, ty - th], [x + tw * 0.36, ty - th * 0.3], [x + tw * 0.18, ty - th * 0.2], [x, ty - th * 0.45], [x - tw * 0.2, ty - th * 0.22]])} color={EMBER.snow} at={fillAt(at, 0.06 + i * 0.03)} offset={false} />
          {iw > 0 ? <Ink d={poly(tri, {seed: `${seed}/ti${i}`, over: [2, 2]})} at={b(at, i * 0.04)} width={iw} /> : null}
        </React.Fragment>,
      );
    }
    return (
      <XG m={mat.about(mat.rotate(a), x, y)}>
        <Fill rect={[x - h * 0.03, y - h * 0.14, h * 0.06, h * 0.14]} color={EMBER.anchor} at={fillAt(at)} offset={false} />
        {out}
      </XG>
    );
  }
  // bare tree: trunk + forked branches, snow along the upper sides
  const r = rng(`btree/${seed}`);
  let br = '';
  let snow = '';
  const branch = (x0: number, y0: number, ang: number, len: number, depth: number) => {
    const x1 = x0 + Math.cos(ang) * len;
    const y1 = y0 + Math.sin(ang) * len;
    br += `M${x0.toFixed(1)} ${y0.toFixed(1)}L${x1.toFixed(1)} ${y1.toFixed(1)}`;
    if (depth >= 1) snow += `M${(x0 + (x1 - x0) * 0.2).toFixed(1)} ${(y0 + (y1 - y0) * 0.2 - 2).toFixed(1)}L${(x0 + (x1 - x0) * 0.8).toFixed(1)} ${(y0 + (y1 - y0) * 0.8 - 2).toFixed(1)}`;
    if (depth < 3) {
      branch(x1, y1, ang - r.range(0.3, 0.6), len * r.range(0.55, 0.72), depth + 1);
      branch(x1, y1, ang + r.range(0.3, 0.6), len * r.range(0.55, 0.72), depth + 1);
    }
  };
  branch(x, y, -Math.PI / 2, h * 0.38, 0);
  return (
    <XG m={mat.about(mat.rotate(a), x, y)}>
      <TPath thing d={br} fill="none" stroke={EMBER.anchor} strokeWidth={Math.max(2, h * 0.02)} strokeLinecap="round" />
      <TPath d={snow} fill="none" stroke={EMBER.snow} strokeWidth={Math.max(1.6, h * 0.012)} strokeLinecap="round" />
    </XG>
  );
};
export const SnowTree = tiered('environment', {bg: EMBER.sky}, SnowTreeBody);

// ---------------------------------------------------------------- cars

export type Car3Props = {
  /** Centre and ground (canvas px); w = length (side) or width (back / front). */
  x: number;
  y: number;
  w?: number;
  view?: 'side' | 'back' | 'front';
  /** Side view: faces right (1) or left (-1). */
  dir?: 1 | -1;
  color?: string;
  /** Headlights (and tail lights) on, with a flat beam step on the ground ahead (side) or two light discs (front). */
  lights?: boolean;
  /** The beam's colour (one step lighter than the ground it lands on). */
  beam?: string;
  /** Snow on the roof and hood (parked cars). */
  snow?: boolean;
  /** Exhaust puffs. */
  exhaust?: boolean;
  /** Wheels turning (side view, moving). */
  rolling?: boolean;
  at?: At;
  seed?: string;
  ink?: number;
};

/** A small car (Ember: cold blues, red-brown, cream; never the hero or the pop) with snow on its roof and its lights. */
const Car3Body: React.FC<Car3Props> = ({x, y, w = 220, view = 'side', dir = 1, color = EMBER.dc, lights = true, beam = EMBER.snow, snow = true, exhaust, rolling, at, seed = 'car', ink}) => {
  const t = useTime();
  const iw = ink ?? (w >= 200 ? W.mid : w >= 110 ? W.far : W.hair);
  if (view === 'side') {
    const L = w;
    const bh = L * 0.2;
    const by = y - L * 0.08;
    const body = roundRect(-L / 2, by - bh, L, bh, bh * 0.35);
    const cab: Pt[] = [[-L * 0.3, by - bh], [-L * 0.2, by - bh - L * 0.17], [L * 0.16, by - bh - L * 0.17], [L * 0.3, by - bh]];
    const g1: Pt[] = [[-L * 0.25, by - bh - 2], [-L * 0.17, by - bh - L * 0.14], [-L * 0.03, by - bh - L * 0.14], [-L * 0.03, by - bh - 2]];
    const g2: Pt[] = [[L * 0.01, by - bh - 2], [L * 0.01, by - bh - L * 0.14], [L * 0.14, by - bh - L * 0.14], [L * 0.24, by - bh - 2]];
    const wr = L * 0.1;
    const spin = rolling ? t * 8 : 0;
    const g = (
      <>
        {lights ? <TPath d={`M${L * 0.48} ${by - bh * 0.55}L${L * 1.6} ${y - 2}L${L * 0.6} ${y + 2}Z`} fill={beam} /> : null}
        <Fill d={polyPath(cab)} color={color} at={fillAt(at)} seed={`${seed}/c`} />
        <Fill d={polyPath(g1) + polyPath(g2)} color={EMBER.skyLow} at={fillAt(at, 0.04)} offset={false} />
        <Fill d={body} color={color} at={fillAt(at, 0.02)} seed={`${seed}/b`} />
        <Fill rect={[L * 0.42, by - bh * 0.72, L * 0.07, bh * 0.3]} color={lights ? EMBER.core : EMBER.frost} at={fillAt(at, 0.06)} offset={false} />
        <Fill rect={[-L * 0.5, by - bh * 0.74, L * 0.05, bh * 0.28]} color={EMBER.hl} at={fillAt(at, 0.06)} offset={false} />
        {[-1, 1].map((s) => (
          <g key={s}>
            <TCircle cx={s * L * 0.3} cy={y - wr} r={wr} fill={EMBER.anchor} />
            <TCircle cx={s * L * 0.3} cy={y - wr} r={wr * 0.42} fill={EMBER.frost} />
            {rolling ? <TPath thing d={`M${s * L * 0.3 + Math.cos(spin) * wr * 0.4} ${y - wr + Math.sin(spin) * wr * 0.4}L${s * L * 0.3 - Math.cos(spin) * wr * 0.4} ${y - wr - Math.sin(spin) * wr * 0.4}`} stroke={EMBER.anchor} strokeWidth={1.6} /> : null}
          </g>
        ))}
        {snow ? (
          <>
            <TPath d={blob(-L * 0.02, by - bh - L * 0.175, L * 0.2, L * 0.03 + 1, {seed: `${seed}/s1`})} fill={EMBER.snow} />
            <TPath d={blob(L * 0.4, by - bh - 1, L * 0.09, L * 0.018 + 1, {seed: `${seed}/s2`})} fill={EMBER.snow} />
          </>
        ) : null}
        {iw > 0 ? <Ink d={roundRect(-L / 2, by - bh, L, bh, bh * 0.35, {closed: false, seed: `${seed}/bi`}) + poly(cab, {seed: `${seed}/ci`, over: [0, 0]}) + line(-L * 0.03, by - bh, -L * 0.03, by - bh - L * 0.16, {over: [0, 0], seed: `${seed}/d`})} at={at} width={iw} /> : null}
      </>
    );
    return (
      <>
        {exhaust ? <Exhaust x={x - dir * L * 0.52} y={y - L * 0.06} dir={-dir} size={L / 200} seed={`${seed}/ex`} /> : null}
        <XG m={mat.compose(mat.translate(x, 0), mat.scale(dir, 1))}>{g}</XG>
      </>
    );
  }
  // back / front: symmetric
  const Wd = w;
  const bh = Wd * 0.34;
  const by = y - Wd * 0.08;
  const front = view === 'front';
  return (
    <>
      {exhaust && !front ? <Exhaust x={x - Wd * 0.3} y={y - Wd * 0.06} dir={-1} size={Wd / 200} seed={`${seed}/ex`} /> : null}
      {front && lights ? (
        <>
          <TEllipse cx={x - Wd * 0.3} cy={y + Wd * 0.06} rx={Wd * 0.3} ry={Wd * 0.08} fill={beam} />
          <TEllipse cx={x + Wd * 0.3} cy={y + Wd * 0.06} rx={Wd * 0.3} ry={Wd * 0.08} fill={beam} />
        </>
      ) : null}
      <Fill rect={[x - Wd * 0.46, y - Wd * 0.12, Wd * 0.14, Wd * 0.12]} color={EMBER.anchor} at={fillAt(at)} offset={false} />
      <Fill rect={[x + Wd * 0.32, y - Wd * 0.12, Wd * 0.14, Wd * 0.12]} color={EMBER.anchor} at={fillAt(at)} offset={false} />
      <Fill d={polyPath([[x - Wd * 0.36, by - bh], [x - Wd * 0.26, by - bh - Wd * 0.26], [x + Wd * 0.26, by - bh - Wd * 0.26], [x + Wd * 0.36, by - bh]])} color={color} at={fillAt(at)} seed={`${seed}/c`} />
      <Fill d={polyPath([[x - Wd * 0.3, by - bh - 2], [x - Wd * 0.22, by - bh - Wd * 0.22], [x + Wd * 0.22, by - bh - Wd * 0.22], [x + Wd * 0.3, by - bh - 2]])} color={EMBER.skyLow} at={fillAt(at, 0.04)} offset={false} />
      <Fill d={roundRect(x - Wd / 2, by - bh, Wd, bh, Wd * 0.08)} color={color} at={fillAt(at, 0.02)} seed={`${seed}/b`} />
      <Fill rect={[x - Wd * 0.44, by - bh * 0.75, Wd * 0.14, bh * 0.25]} color={front ? (lights ? EMBER.core : EMBER.frost) : EMBER.hl} at={fillAt(at, 0.06)} offset={false} />
      <Fill rect={[x + Wd * 0.3, by - bh * 0.75, Wd * 0.14, bh * 0.25]} color={front ? (lights ? EMBER.core : EMBER.frost) : EMBER.hl} at={fillAt(at, 0.06)} offset={false} />
      <Fill rect={[x - Wd * 0.12, by - bh * 0.45, Wd * 0.24, bh * 0.22]} color={EMBER.card} at={fillAt(at, 0.07)} offset={false} />
      {snow ? <TPath d={blob(x, by - bh - Wd * 0.26, Wd * 0.28, Wd * 0.04 + 1, {seed: `${seed}/sr`})} fill={EMBER.snow} /> : null}
      {iw > 0 ? <Ink d={roundRect(x - Wd / 2, by - bh, Wd, bh, Wd * 0.08, {closed: false, seed: `${seed}/bi`}) + poly([[x - Wd * 0.36, by - bh], [x - Wd * 0.26, by - bh - Wd * 0.26], [x + Wd * 0.26, by - bh - Wd * 0.26], [x + Wd * 0.36, by - bh]], {seed: `${seed}/ci`, over: [0, 0]})} at={at} width={iw} /> : null}
    </>
  );
};
export const Car3 = tiered('environment', {bg: EMBER.sky}, Car3Body);

/** A car's headlights sweeping across a wall: a flat band one step lighter, skewed, crossing the rect in `dur` at each
 *  time in `at` (S4: ~6.4 and ~8.6, 0.8 s). */
const HeadlightSweepBody: React.FC<{rect: [number, number, number, number]; at: number[]; dur?: number; color?: string; width?: number; dir?: 1 | -1; id?: string}> = ({rect, at, dur = 0.8, color = EMBER.core, width = 160, dir = 1, id = 'hls'}) => {
  const t = useTime();
  const p = sweep(t, at, dur);
  if (p === null) return null;
  const [x, y, w, h] = rect;
  const cx = dir > 0 ? x - width + (w + width * 2) * p : x + w + width - (w + width * 2) * p;
  return (
    <g>
      <defs>
        <clipPath id={`${id}-c`}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <TPath d={`M${cx - width / 2} ${y}h${width}l${-h * 0.25} ${h}h${-width * 1.3}z`} fill={color} clipPath={`url(#${id}-c)`} />
    </g>
  );
};
export const HeadlightSweep = tiered('environment', {bg: EMBER.sky}, HeadlightSweepBody);

// ---------------------------------------------------------------- the road, pavements, footprints

export type RoadQuad = {
  /** Near edge (yB) and far edge (yT), with each edge's left / right x (canvas px). */
  yB: number;
  yT: number;
  xBL: number;
  xBR: number;
  xTL: number;
  xTR: number;
};

/** Screen position on a ground-plane road: u across (0 left .. 1 right), d along (0 near .. 1 far), with true
 *  perspective spacing (the width ratio of the far and near edges sets the depth). */
export function roadPt(R: RoadQuad, u: number, d: number): Pt {
  const r = Math.max(0.02, Math.abs(R.xTR - R.xTL) / Math.max(1, Math.abs(R.xBR - R.xBL)));
  const s = r >= 0.999 ? d : (1 - 1 / (1 + d * (1 / r - 1))) / (1 - r);
  const xl = R.xBL + (R.xTL - R.xBL) * s;
  const xr = R.xBR + (R.xTR - R.xBR) * s;
  return [xl + (xr - xl) * u, R.yB + (R.yT - R.yB) * s];
}
/** Road width scale at depth d (1 at the near edge). */
export const roadScale = (R: RoadQuad, d: number) => {
  const a = roadPt(R, 0, d);
  const c = roadPt(R, 1, d);
  return Math.abs(c[0] - a[0]) / Math.max(1, Math.abs(R.xBR - R.xBL));
};

export type RoadDressProps = {
  road: RoadQuad;
  /** The road band itself (trodden snow by default; false = drawn by the set). */
  fill?: string | false;
  kerbs?: boolean;
  banks?: boolean;
  tracks?: boolean;
  dashes?: boolean;
  manhole?: {u: number; d: number; steam?: boolean} | false;
  footprints?: boolean;
  seed?: string;
  at?: At;
};

/** The road dressed so the flat slab becomes a street: kerbs both sides (2-3 long lines with gaps), snowbanks along
 *  them (ink on the ridge only), two tyre tracks one step darker, faint lane dashes, a manhole, footprints. */
const RoadDressBody: React.FC<RoadDressProps> = ({road: R, fill = EMBER.road, kerbs = true, banks = true, tracks = true, dashes = true, manhole = {u: 0.42, d: 0.22, steam: true}, footprints = true, seed = 'road', at}) => {
  const P = (u: number, d: number) => roadPt(R, u, d);
  const out: React.ReactNode[] = [];
  const N = 24;
  const band = (u0: number, u1: number, d0 = 0, d1 = 1) => {
    const left: Pt[] = [];
    const right: Pt[] = [];
    for (let i = 0; i <= N; i++) {
      const d = d0 + ((d1 - d0) * i) / N;
      left.push(P(u0, d));
      right.push(P(u1, d));
    }
    return polyPath([...left, ...right.reverse()]);
  };
  if (fill) out.push(<Fill key="road" d={band(0, 1)} color={fill} at={fillAt(at)} offset={false} mode="snap" />);
  if (tracks) {
    out.push(<Fill key="tr1" d={band(0.24, 0.33, 0, 0.98)} color={TRACK} at={fillAt(at, 0.03)} offset={false} />);
    out.push(<Fill key="tr2" d={band(0.56, 0.65, 0, 0.98)} color={TRACK} at={fillAt(at, 0.03)} offset={false} />);
  }
  if (dashes) {
    let d = '';
    for (let k = 0; k < 12; k++) {
      const d0 = 0.03 + k * 0.08;
      if (d0 > 0.95) break;
      d += band(0.485, 0.515, d0, d0 + 0.035);
    }
    out.push(<Fill key="dash" d={d} color={EMBER.snow} at={fillAt(at, 0.05)} offset={false} />);
  }
  if (banks) {
    const r = rng(`banks/${seed}`);
    for (const side of [0, 1]) {
      let fillD = '';
      let ridge = '';
      for (let k = 0; k < 9; k++) {
        const d = k / 9 + r.range(0, 0.04);
        const sc = roadScale(R, d);
        const [bx, by] = P(side ? 1.03 : -0.03, d);
        const rx = 70 * sc * r.range(0.8, 1.3);
        const ry = 22 * sc * r.range(0.8, 1.2);
        fillD += blob(bx + (side ? rx * 0.6 : -rx * 0.6), by - ry * 0.3, rx, ry, {seed: `${seed}/bk${side}${k}`});
        ridge += `M${(bx + (side ? 0 : -rx * 1.2)).toFixed(1)} ${(by - ry * 0.9).toFixed(1)}q${(rx * 0.6).toFixed(1)} ${(-ry * 0.5).toFixed(1)} ${(rx * 1.2).toFixed(1)} 0`;
      }
      out.push(<Fill key={`bank${side}`} d={fillD} color={EMBER.snow} at={fillAt(at, 0.06)} offset={false} />);
      out.push(<Ink key={`ridge${side}`} d={ridge} at={b(at, 0.1)} width={W.hair} />);
    }
  }
  if (kerbs) {
    let d = '';
    for (const u of [0, 1]) {
      for (const [d0, d1] of [[0, 0.3], [0.36, 0.66], [0.72, 1]]) {
        const a = P(u, d0);
        const c = P(u, d1);
        d += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
      }
    }
    out.push(<Ink key="kerb" d={d} at={at} width={W.far} />);
  }
  if (manhole) {
    const [mx, my] = P(manhole.u, manhole.d);
    const sc = roadScale(R, manhole.d);
    out.push(<Fill key="mh" d={ellipse(mx, my, 34 * sc, 12 * sc, {seed: `${seed}/mh`})} color={EMBER.dcSide} at={fillAt(at, 0.08)} offset={false} />);
    out.push(<Ink key="mhi" d={ellipse(mx, my, 34 * sc, 12 * sc, {seed: `${seed}/mhi`}) + `M${mx - 20 * sc} ${my}h${40 * sc}`} at={b(at, 0.1)} width={W.hair} />);
    if (manhole.steam) out.push(<Steam key="mhs" x={mx} y={my - 4} seed={`${seed}/mhs`} rise={60 * sc + 20} r1={10 * sc + 3} />);
  }
  if (footprints) {
    for (const u of [-0.12, 1.12]) {
      const pts: Pt[] = [];
      for (let k = 0; k < 16; k++) pts.push(P(u + Math.sin(k * 0.7) * 0.01, 0.02 + k * 0.055));
      out.push(<Footprints key={`fp${u}`} points={pts} size={9 * roadScale(R, 0.1)} shrink={roadScale(R, 0.9) / roadScale(R, 0.1)} seed={`${seed}/fp${u}`} />);
    }
  }
  return <>{out}</>;
};
export const RoadDress = tiered('environment', {bg: EMBER.sky}, RoadDressBody);

/** Footprints along a path: alternating small ovals one step under the snow (sizes shrink toward the last point). */
const FootprintsBody: React.FC<{points: Pt[]; size?: number; shrink?: number; color?: string; seed?: string}> = ({points, size = 9, shrink = 1, color = EMBER.frost, seed = 'fp'}) => {
  let d = '';
  points.forEach(([px, py], i) => {
    const k = 1 + (shrink - 1) * (i / Math.max(1, points.length - 1));
    const s = size * k;
    const side = i % 2 ? 1 : -1;
    d += blob(px + side * s * 0.7, py, s * 0.5, s * 0.28, {seed: `${seed}/${i}`});
  });
  return <TPath d={d} fill={color} />;
};
export const Footprints = tiered('environment', {bg: EMBER.sky}, FootprintsBody);

/** A straight-on snowy pavement (S4: y 1380-1920): kerb lines (2-3, with gaps), footprints, specks. */
const PavementBody: React.FC<{y0: number; y1?: number; x0?: number; x1?: number; kerbs?: number[]; seed?: string; at?: At; color?: string}> = ({y0, y1 = 2000, x0 = -100, x1 = 1180, kerbs, seed = 'pave', at, color = EMBER.snow}) => {
  const r = rng(`pave/${seed}`);
  const ks = kerbs ?? [y0 + (y1 - y0) * 0.22, y0 + (y1 - y0) * 0.5];
  let kd = '';
  ks.forEach((ky, i) => {
    let x = x0;
    while (x < x1) {
      const len = r.range(260, 520);
      kd += line(x, ky, Math.min(x1, x + len), ky + r.jitter(2), {over: [0, 0], seed: `${seed}/k${i}${Math.round(x)}`});
      x += len + r.range(30, 70);
    }
  });
  const fps: Pt[] = [];
  for (let k = 0; k < 14; k++) fps.push([x0 + 140 + k * 70, y0 + (y1 - y0) * 0.36 + Math.sin(k * 0.8) * 10]);
  let specks = '';
  for (let k = 0; k < 26; k++) {
    const sx = r.range(x0, x1);
    const sy = r.range(y0 + 10, Math.min(y1, y0 + 500));
    specks += `M${sx.toFixed(0)} ${sy.toFixed(0)}h${r.range(6, 14).toFixed(0)}`;
  }
  return (
    <>
      <Fill rect={[x0, y0, x1 - x0, y1 - y0]} color={color} at={fillAt(at)} offset={false} mode="snap" />
      <Footprints points={fps} size={12} seed={`${seed}/fp`} />
      <Ink d={kd} at={at} width={W.far} />
      <Ink d={specks} at={b(at, 0.1)} width={W.hair} color={EMBER.frost} />
    </>
  );
};
export const Pavement = tiered('environment', {bg: EMBER.sky}, PavementBody);

// ---------------------------------------------------------------- bus stop, fence, booth, signs, floodlights

/** A bus stop shelter (snow on the roof, a frost glass back with a glint, a bench, the round sign, a lit ad panel)
 *  with 2-3 people waiting (one checks a phone). Base on y, h = shelter height (160-240). */
const BusStopBody: React.FC<{x: number; y: number; h?: number; people?: number; turnAt?: number; seed?: string; at?: At; ink?: number}> = ({x, y, h = 200, people = 3, turnAt, seed = 'bus', at, ink}) => {
  const k = h / 200;
  const w = 240 * k;
  const iw = ink ?? (h >= 180 ? W.far : W.hair);
  const x0 = x - w / 2;
  const out: React.ReactNode[] = [];
  out.push(<Fill key="glass" rect={[x0 + 8 * k, y - h + 18 * k, w * 0.62, h - 40 * k]} color={EMBER.frost} at={fillAt(at)} offset={false} />);
  out.push(<Fill key="ad" rect={[x0 + w * 0.68, y - h + 18 * k, w * 0.28, h - 50 * k]} color={EMBER.houseLit} at={fillAt(at, 0.04)} offset={false} />);
  out.push(<Fill key="adp" d={circle(x0 + w * 0.82, y - h * 0.55, 18 * k)} color={EMBER.hl} at={fillAt(at, 0.06)} offset={false} />);
  out.push(<Fill key="bench" rect={[x0 + 14 * k, y - 50 * k, w * 0.56, 10 * k]} color={EMBER.beam} at={fillAt(at, 0.04)} offset={false} />);
  for (let i = 0; i < people; i++) {
    const px = x0 + w * (0.18 + i * 0.22);
    const g = personGeo(`${seed}/p${i}`, {legs: true});
    const hh = h * 0.78;
    const s = hh / (g.legH - g.headTop);
    out.push(<WinterPerson key={`p${i}`} x={px} y={y - g.legH * s} s={s} legs seed={`${seed}/p${i}`} acc={i === 1 ? ['phone'] : undefined} wear={['snow']} breathe={1} ink={iw} moves={turnAt !== undefined ? [{t: turnAt + i * 0.05, kind: 'turn', amp: 1.2}] : []} />);
  }
  out.push(<Fill key="roof" rect={[x0 - 8 * k, y - h, w + 16 * k, 18 * k]} color={EMBER.dcSide} at={fillAt(at, 0.02)} seed={`${seed}/r`} />);
  out.push(<SnowCap key="snow" x={x0 - 8 * k} y={y - h} w={w + 16 * k} h={12 * k} seed={`${seed}/sn`} />);
  out.push(<Fill key="posts" rect={[x0, y - h, 7 * k, h]} color={EMBER.dcSide} at={fillAt(at)} offset={false} />);
  out.push(<Fill key="posts2" rect={[x0 + w - 7 * k, y - h, 7 * k, h]} color={EMBER.dcSide} at={fillAt(at)} offset={false} />);
  // the round bus sign on its own pole
  out.push(<Fill key="sp" rect={[x0 + w + 20 * k, y - h * 1.15, 5 * k, h * 1.15]} color={EMBER.dcSide} at={fillAt(at)} offset={false} />);
  out.push(<Fill key="sg" d={circle(x0 + w + 22 * k, y - h * 1.15, 22 * k)} color={EMBER.card} at={fillAt(at, 0.05)} seed={`${seed}/sg`} />);
  out.push(
    <Show key="sgt" at={fillAt(at, 0.08)}>
      <Txt x={x0 + w + 22 * k} y={y - h * 1.15 + 8 * k} size={Math.max(12, 22 * k)}>
        BUS
      </Txt>
    </Show>,
  );
  out.push(<Ink key="ink" d={rectInk(x0 - 8 * k, y - h, w + 16 * k, 18 * k, {seed: `${seed}/ri`, over: [2, 3]}) + rectInk(x0 + 8 * k, y - h + 18 * k, w * 0.62, h - 40 * k, {seed: `${seed}/gi`, over: [0, 0]}) + circle(x0 + w + 22 * k, y - h * 1.15, 22 * k, {seed: `${seed}/sgi`})} at={at} width={iw} />);
  out.push(<Ink key="gl" d={`M${x0 + 30 * k} ${y - h * 0.7}l${18 * k} ${-22 * k}M${x0 + 42 * k} ${y - h * 0.66}l${18 * k} ${-22 * k}`} at={b(at, 0.1)} width={W.hair} color={EMBER.white} />);
  return <>{out}</>;
};
export const BusStop = tiered('environment', {bg: EMBER.sky}, BusStopBody);

/** A fence receding from `a` to `b` (base points) with post heights h0 -> h1, two rails, snow on the top rail. */
const FenceBody: React.FC<{a: Pt; b: Pt; h0?: number; h1?: number; posts?: number; seed?: string; at?: At; ink?: number; color?: string}> = ({a, b: bb, h0 = 90, h1 = 30, posts = 10, seed = 'fence', at, ink = W.far, color = EMBER.dcSide}) => {
  let postD = '';
  let snow = '';
  const topPts: Pt[] = [];
  const midPts: Pt[] = [];
  for (let i = 0; i < posts; i++) {
    const u = i / (posts - 1);
    // posts evenly spaced in depth: closer together on screen toward b (h1 / h0 = the depth ratio)
    const rr = Math.max(0.02, Math.min(0.999, h1 / h0));
    const s = (1 - 1 / (1 + u * (1 / rr - 1))) / (1 - rr);
    const px = a[0] + (bb[0] - a[0]) * s;
    const py = a[1] + (bb[1] - a[1]) * s;
    const ph = h0 + (h1 - h0) * s;
    postD += `M${px.toFixed(1)} ${py.toFixed(1)}L${px.toFixed(1)} ${(py - ph).toFixed(1)}`;
    snow += blob(px, py - ph - 2, ph * 0.08 + 2, ph * 0.04 + 1.5, {seed: `${seed}/s${i}`});
    topPts.push([px, py - ph * 0.92]);
    midPts.push([px, py - ph * 0.45]);
  }
  const rails = poly(topPts, {seed: `${seed}/t`, over: [0, 0]}) + poly(midPts, {seed: `${seed}/m`, over: [0, 0]});
  return (
    <>
      <TPath thing d={postD} fill="none" stroke={color} strokeWidth={Math.max(3, h0 * 0.07)} strokeLinecap="round" />
      <Ink thing d={rails} at={at} width={ink} />
      <TPath d={snow} fill={EMBER.snow} />
      <TPath d={smooth(topPts.map(([x, y]) => [x, y - 2] as Pt))} fill="none" stroke={EMBER.snow} strokeWidth={Math.max(2, h0 * 0.04)} strokeLinecap="round" />
    </>
  );
};
export const Fence = tiered('environment', {bg: EMBER.sky}, FenceBody);

export type GateBoothProps = {
  /** Booth base centre (canvas px) and width (120-180). */
  x: number;
  y: number;
  w?: number;
  /** The barrier: its length (200-300 px), the side it reaches toward, and when it lifts / lowers. */
  arm?: number;
  armSide?: 'left' | 'right';
  liftAt?: number[];
  lowerAt?: number[];
  /** A guard silhouette in the lit window (hide it when the Guard figure stands outside). */
  guardInside?: boolean;
  seed?: string;
  at?: At;
  ink?: number;
};

/** Barrier angle (deg, 0 = down, 85 = up) at t: each lift / lower is a STEPPED pivot (4 drawings over 0.25 s). */
export function barrierAngle(t: number, liftAt: number[] = [], lowerAt: number[] = []): number {
  const evs = [...liftAt.map((v) => ({t: v, up: true})), ...lowerAt.map((v) => ({t: v, up: false}))].sort((p, q) => p.t - q.t);
  let a = 0;
  for (const e of evs) {
    if (t < e.t) break;
    const k = Math.min(1, stepped((t - e.t) / 0.25, 4) * 1.0001);
    a = e.up ? 85 * k : 85 * (1 - k);
  }
  return a;
}

/** The factory gate: a lit guard booth (snowy roof, a warm window, a door) and a striped barrier arm that lifts in
 *  0.25 s on a stepped pivot. */
const GateBoothBody: React.FC<GateBoothProps> = ({x, y, w = 150, arm = 240, armSide = 'left', liftAt, lowerAt, guardInside = true, seed = 'booth', at, ink}) => {
  const t = useTime();
  const k = w / 150;
  const h = w * 1.1;
  const iw = ink ?? W.far;
  const x0 = x - w / 2;
  const sd = armSide === 'left' ? -1 : 1;
  const px = sd < 0 ? x0 - 14 * k : x0 + w + 14 * k;
  const py = y - 46 * k;
  const ang = barrierAngle(t, liftAt, lowerAt);
  const stripes = 6;
  const armFill: React.ReactNode[] = [];
  for (let i = 0; i < stripes; i++) {
    const a0 = (i / stripes) * arm;
    armFill.push(<TRect key={i} x={sd < 0 ? -a0 - arm / stripes : a0} y={-6 * k} width={arm / stripes} height={12 * k} fill={i % 2 ? EMBER.snow : EMBER.beam} />);
  }
  return (
    <>
      <Fill rect={[x0, y - h, w, h]} color={EMBER.wall} at={fillAt(at)} seed={`${seed}/b`} />
      <Fill rect={[x0 + w * 0.12, y - h * 0.78, w * 0.5, h * 0.36]} color={EMBER.houseLit} at={fillAt(at, 0.04)} offset={false} />
      {guardInside ? <Fill d={blob(x0 + w * 0.36, y - h * 0.5, w * 0.11, h * 0.09, {seed: `${seed}/gb`}) + circle(x0 + w * 0.36, y - h * 0.63, w * 0.07)} color={'#C98A64'} at={fillAt(at, 0.06)} offset={false} /> : null}
      <Fill rect={[x0 + w * 0.68, y - h * 0.68, w * 0.24, h * 0.68]} color={EMBER.dc} at={fillAt(at, 0.04)} offset={false} />
      <Fill rect={[x0 - 10 * k, y - h - 18 * k, w + 20 * k, 20 * k]} color={EMBER.dcSide} at={fillAt(at, 0.02)} seed={`${seed}/r`} />
      <SnowCap x={x0 - 10 * k} y={y - h - 18 * k} w={w + 20 * k} h={14 * k} seed={`${seed}/sn`} />
      <Ink d={rectInk(x0, y - h, w, h, {seed: `${seed}/i`, over: [0, 3]}) + rectInk(x0 + w * 0.12, y - h * 0.78, w * 0.5, h * 0.36, {seed: `${seed}/wi`, over: [0, 0]}) + rectInk(x0 - 10 * k, y - h - 18 * k, w + 20 * k, 20 * k, {seed: `${seed}/ri`, over: [2, 2]})} at={at} width={iw} />
      {/* barrier post and arm */}
      <Fill rect={[px - 9 * k, py - 10 * k, 18 * k, y - py + 10 * k]} color={EMBER.dcSide} at={fillAt(at, 0.05)} offset={false} />
      <g transform={`translate(${px} ${py}) rotate(${(sd * -ang).toFixed(2)})`}>
        <Show at={fillAt(at, 0.08)}>{armFill}</Show>
        <TPath d={`M0 ${-6 * k}h${sd * arm}v${12 * k}h${-sd * arm}z`} fill="none" stroke={EMBER.ink} strokeWidth={iw} />
      </g>
    </>
  );
};
export const GateBooth = tiered('environment', {bg: EMBER.sky}, GateBoothBody);

/** A sign on two posts (DELIVERIES, a shop sign): board, letters >= 22 px, snow on top. Base centre on y. */
const PostSignBody: React.FC<{x: number; y: number; w?: number; h?: number; text?: string; size?: number; color?: string; textColor?: string; post?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w = 200, h = 54, text = 'DELIVERIES', size, color = EMBER.card, textColor = EMBER.ink, post = 80, seed = 'sign', at, ink = W.far}) => {
  const top = y - post - h;
  const fs = Math.max(22, size ?? h * 0.6);
  return (
    <>
      <Fill rect={[x - w * 0.36, top + h, 7, post]} color={EMBER.dcSide} at={fillAt(at)} offset={false} />
      <Fill rect={[x + w * 0.36 - 7, top + h, 7, post]} color={EMBER.dcSide} at={fillAt(at)} offset={false} />
      <Fill rect={[x - w / 2, top, w, h]} color={color} at={fillAt(at, 0.03)} seed={`${seed}/b`} />
      <Show at={fillAt(at, 0.06)}>
        <Txt x={x} y={top + h * 0.7} size={fs} fill={textColor} fit={w * 0.88}>
          {text}
        </Txt>
      </Show>
      <SnowCap x={x - w / 2} y={top} w={w} h={10} seed={`${seed}/sn`} />
      <Ink d={rectInk(x - w / 2, top, w, h, {seed: `${seed}/i`, over: [2, 3]})} at={at} width={ink} />
    </>
  );
};
export const PostSign = tiered('environment', {bg: EMBER.sky}, PostSignBody);

/** A floodlight on a bracket with flat halo steps on the wall below (factory brick: warm steps). */
const FloodlightBody: React.FC<{x: number; y: number; s?: number; halo?: [string, string]; dir?: 1 | -1; at?: At; seed?: string; ink?: number}> = ({x, y, s = 1, halo = [EMBER.pot, EMBER.books[0]], dir = 1, at, seed = 'flood', ink = W.far}) => (
  <>
    <Show at={fillAt(at, 0.1)}>
      <TEllipse cx={x + dir * 18 * s} cy={y + 60 * s} rx={70 * s} ry={80 * s} fill={halo[0]} />
      <TEllipse cx={x + dir * 14 * s} cy={y + 40 * s} rx={40 * s} ry={46 * s} fill={halo[1]} />
    </Show>
    <Fill rect={[x - 4 * s, y - 4 * s, dir * 22 * s, 6 * s]} color={EMBER.anchor} at={fillAt(at)} offset={false} />
    <Fill d={polyPath([[x + dir * 16 * s, y - 14 * s], [x + dir * 40 * s, y - 8 * s], [x + dir * 36 * s, y + 14 * s], [x + dir * 14 * s, y + 8 * s]])} color={EMBER.dcSide} at={fillAt(at, 0.03)} seed={`${seed}/h`} />
    <Fill d={polyPath([[x + dir * 36 * s, y - 6 * s], [x + dir * 40 * s, y - 8 * s], [x + dir * 36 * s, y + 14 * s], [x + dir * 33 * s, y + 12 * s]])} color={EMBER.core} at={fillAt(at, 0.05)} offset={false} />
    <Ink d={poly([[x + dir * 16 * s, y - 14 * s], [x + dir * 40 * s, y - 8 * s], [x + dir * 36 * s, y + 14 * s], [x + dir * 14 * s, y + 8 * s]], {closed: true, seed: `${seed}/i`, over: [0, 1]})} at={at} width={ink} />
  </>
);
export const Floodlight = tiered('environment', {bg: EMBER.sky}, FloodlightBody);

// ---------------------------------------------------------------- pallets, crates, forklift

/** A wooden pallet (slats) with optional snow on top; base centre on y. */
const PalletBody: React.FC<{x: number; y: number; w?: number; snow?: boolean; seed?: string; at?: At; ink?: number}> = ({x, y, w = 120, snow = true, seed = 'pallet', at, ink = W.far}) => {
  const h = w * 0.16;
  const x0 = x - w / 2;
  return (
    <>
      <Fill rect={[x0, y - h, w, h * 0.32]} color={EMBER.books[6]} at={fillAt(at)} seed={`${seed}/t`} />
      {[0.05, 0.45, 0.85].map((u, i) => (
        <Fill key={i} rect={[x0 + w * u - w * 0.05, y - h * 0.68, w * 0.12, h * 0.68]} color={EMBER.beam} at={fillAt(at, 0.02)} offset={false} />
      ))}
      {snow ? <SnowCap x={x0} y={y - h} w={w} h={h * 0.5} seed={`${seed}/sn`} /> : null}
      <Ink d={rectInk(x0, y - h, w, h * 0.32, {seed: `${seed}/i`, over: [1, 2]})} at={at} width={ink} />
    </>
  );
};
export const Pallet = tiered('environment', {tone: EMBER.board, bg: EMBER.sky}, PalletBody);

/** A crate of memory sticks: slatted box, gold sticks with black chips showing over the top (S10 forklift, S11 crate,
 *  workers' loads). Base centre on y. */
const StickCrateBody: React.FC<{x: number; y: number; w?: number; h?: number; sticks?: number; snow?: boolean; seed?: string; at?: At; ink?: number}> = ({x, y, w = 120, h, sticks = 5, snow, seed = 'crate', at, ink}) => {
  const H = h ?? w * 0.62;
  const x0 = x - w / 2;
  const iw = ink ?? (w >= 100 ? W.mid : W.far);
  const r = rng(`crate/${seed}`);
  const st: React.ReactNode[] = [];
  for (let i = 0; i < sticks; i++) {
    const sw = w * 0.34;
    const sh = sw * 0.31;
    const sx = x0 + w * 0.08 + (i / Math.max(1, sticks - 1)) * (w * 0.84 - sw);
    const sy = y - H - sh * r.range(0.4, 1.1);
    const rot = r.range(-14, 14);
    st.push(
      <g key={i} transform={`rotate(${rot.toFixed(1)} ${sx + sw / 2} ${sy + sh / 2})`}>
        <TRect x={sx} y={sy} width={sw} height={sh} fill={EMBER.board} stroke={EMBER.ink} strokeWidth={Math.max(1.2, iw * 0.45)} />
        {[0.12, 0.34, 0.56, 0.78].map((u, j) => (
          <TRect key={j} x={sx + sw * u} y={sy + sh * 0.2} width={sw * 0.14} height={sh * 0.5} fill={EMBER.chip} />
        ))}
      </g>,
    );
  }
  let slats = '';
  for (let i = 1; i < 3; i++) slats += line(x0, y - (H * i) / 3, x0 + w, y - (H * i) / 3, {over: [0, 0], seed: `${seed}/s${i}`});
  return (
    <>
      <Show at={fillAt(at, 0.08)}>{st}</Show>
      <Fill rect={[x0, y - H, w, H]} color={EMBER.books[6]} at={fillAt(at)} seed={`${seed}/b`} />
      <Ink d={rectInk(x0, y - H, w, H, {seed: `${seed}/i`, over: [1, 3]}) + line(x0 + w * 0.08, y - H, x0 + w * 0.08, y, {over: [0, 0], seed: `${seed}/v1`}) + line(x0 + w * 0.92, y - H, x0 + w * 0.92, y, {over: [0, 0], seed: `${seed}/v2`})} at={at} width={iw} />
      <Ink d={slats} at={b(at, 0.06)} width={W.hair} />
      {snow ? <SnowCap x={x0} y={y - H} w={w * 0.4} h={8} seed={`${seed}/sn`} /> : null}
    </>
  );
};
export const StickCrate = tiered('environment', {tone: EMBER.board, bg: EMBER.sky}, StickCrateBody);

export type ForkliftProps = {
  /** Ground y and size (body length, 120-200 px). x: a fixed position, or a loop between a and b. */
  x?: number;
  y: number;
  w?: number;
  loop?: {a: number; b: number; dur?: number; hold?: number; phase?: number};
  /** Faces right (1: the forks lead) or left (-1). */
  dir?: 1 | -1;
  /** A crate of sticks on the forks. */
  carry?: boolean;
  seed?: string;
  at?: At;
  ink?: number;
};

/** A forklift (side view): terracotta body and counterweight, a cab cage with the driver, the mast and forks carrying a
 *  crate of sticks; on a back-and-forth loop (drives to b, lifts, reverses to a). */
const ForkliftBody: React.FC<ForkliftProps> = ({x = 0, y, w = 150, loop, dir = 1, carry = true, seed = 'fork', at, ink}) => {
  const t = useTime();
  let fx = x;
  let lift = 0;
  let moving = false;
  if (loop) {
    const sh = shuttle(t, loop.a, loop.b, loop.dur ?? 2.4, loop.hold ?? 0.8, loop.phase ?? 0);
    fx = sh.x;
    moving = !sh.holding;
    lift = sh.holding && sh.end === 1 ? Math.sin(Math.PI * sh.holdK) : 0;
  }
  const L = w;
  const iw = ink ?? (w >= 140 ? W.far : W.hair);
  const wr = L * 0.13;
  const bodyTop = y - L * 0.42;
  const jig = moving ? bob(t, 1, 5) : 0;
  const forkY = y - L * 0.06 - lift * L * 0.25;
  const g = (
    <>
      {/* mast + forks */}
      <TPath thing d={`M${L * 0.42} ${y - L * 0.04}V${y - L * 0.92}M${L * 0.5} ${y - L * 0.04}V${y - L * 0.92}`} stroke={EMBER.anchor} strokeWidth={Math.max(2.4, L * 0.03)} />
      <TPath thing d={`M${L * 0.46} ${forkY}H${L * 0.86}`} stroke={EMBER.anchor} strokeWidth={Math.max(2.4, L * 0.03)} strokeLinecap="round" />
      {carry ? <StickCrate x={L * 0.66} y={forkY - 2} w={L * 0.36} sticks={3} seed={`${seed}/cr`} ink={iw} /> : null}
      {/* cab cage + driver */}
      <TPath thing d={`M${-L * 0.18} ${bodyTop}V${y - L * 0.95}H${L * 0.26}V${bodyTop}`} fill="none" stroke={EMBER.anchor} strokeWidth={Math.max(2, L * 0.022)} />
      <TPath d={blob(L * 0.02, bodyTop - L * 0.12, L * 0.1, L * 0.12, {seed: `${seed}/dv`})} fill={EMBER.dc} />
      <TCircle cx={L * 0.03} cy={bodyTop - L * 0.3} r={L * 0.07} fill={EMBER.anchor} />
      <TPath d={`M${-L * 0.05} ${bodyTop - L * 0.34}a${L * 0.08} ${L * 0.06} 0 0 1 ${L * 0.16} 0z`} fill={WINTER_HAT} />
      {/* body + counterweight */}
      <Fill d={roundRect(-L * 0.42, bodyTop, L * 0.84, L * 0.3, L * 0.05)} color={EMBER.pot} at={fillAt(at)} seed={`${seed}/b`} />
      <Fill d={roundRect(-L * 0.5, bodyTop - L * 0.04, L * 0.2, L * 0.36, L * 0.06)} color={EMBER.beam} at={fillAt(at, 0.02)} offset={false} />
      <Fill rect={[L * 0.28, bodyTop + L * 0.06, L * 0.08, L * 0.06]} color={EMBER.core} at={fillAt(at, 0.04)} offset={false} />
      <Ink d={roundRect(-L * 0.42, bodyTop, L * 0.84, L * 0.3, L * 0.05, {closed: false, seed: `${seed}/bi`})} at={at} width={iw} />
      {[-0.26, 0.26].map((u, i) => (
        <g key={i}>
          <TCircle cx={L * u} cy={y - wr} r={wr} fill={EMBER.anchor} />
          <TCircle cx={L * u} cy={y - wr} r={wr * 0.4} fill={EMBER.frost} />
        </g>
      ))}
      {/* the warning beacon blinks */}
      {Math.floor(t * 2.4) % 2 === 0 ? <TCircle cx={-L * 0.12} cy={y - L * 0.99} r={L * 0.03} fill={EMBER.houseLit} /> : <TCircle cx={-L * 0.12} cy={y - L * 0.99} r={L * 0.03} fill={EMBER.beam} />}
    </>
  );
  return <XG m={mat.compose(mat.translate(fx, jig), mat.scale(dir, 1))}>{g}</XG>;
};
export const Forklift = tiered('environment', {bg: EMBER.sky}, ForkliftBody);
const WINTER_HAT = EMBER.ring;

// ---------------------------------------------------------------- poles, wires, birds

/** A wooden utility pole with a crossbar, insulators and a snow cap; base on y. */
const UtilityPole3Body: React.FC<{x: number; y: number; h?: number; seed?: string; at?: At; ink?: number}> = ({x, y, h = 520, seed = 'pole', at, ink}) => {
  const k = h / 520;
  const pw = 14 * k;
  const top = y - h;
  const iw = ink ?? (h >= 400 ? W.mid : W.far);
  return (
    <>
      <Fill rect={[x - pw / 2, top, pw, h]} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/p`} />
      <Fill rect={[x - pw / 2, top + 4, Math.max(1.6, pw * 0.22), h - 6]} color={SNOWLIT} at={fillAt(at, 0.02)} offset={false} />
      <Fill rect={[x - 70 * k, top + 26 * k, 140 * k, 10 * k]} color={EMBER.beam} at={fillAt(at, 0.03)} offset={false} />
      {[-58, -22, 22, 58].map((dx, i) => (
        <TRect key={i} x={x + dx * k - 3 * k} y={top + 16 * k} width={6 * k} height={10 * k} fill={EMBER.frost} />
      ))}
      <TPath d={blob(x, top - 2, pw * 0.8, 4 * k + 1, {seed: `${seed}/sn`}) + blob(x, top + 24 * k, 70 * k, 3 * k + 1, {seed: `${seed}/sb`})} fill={EMBER.snow} />
      <Ink d={line(x - pw / 2, y, x - pw / 2, top, {over: [0, 0], seed: `${seed}/i1`}) + line(x + pw / 2, y, x + pw / 2, top, {over: [0, 0], seed: `${seed}/i2`}) + rectInk(x - 70 * k, top + 26 * k, 140 * k, 10 * k, {seed: `${seed}/cb`, over: [3, 3]})} at={at} width={iw} />
    </>
  );
};
export const UtilityPole3 = tiered('environment', {bg: EMBER.sky}, UtilityPole3Body);

export type Wire3Props = {
  a: Pt;
  b: Pt;
  sag?: number;
  /** Extra parallel wires (gap px). */
  n?: number;
  gap?: number;
  /** Birds sitting on the (first) wire: count / positions (0..1 along), size, and when they lift off and wheel away.
   *  `rise` / `fly` (px / s, defaults 240 / 260) shape the getaway: a low flat dash keeps them under a caption band. */
  birds?: {n?: number; us?: number[]; size?: number; liftAt?: number; color?: string; rise?: number; fly?: number};
  ink?: number;
  seed?: string;
  at?: At;
};

/** Utility wires with sitting birds (head bobs, a turn now and then) that LIFT on a cause: staggered take-offs, wings
 *  flapping, an arc up and away, gone in ~1.6 s (S14: the second data center cuts in). */
const Wire3Body: React.FC<Wire3Props> = ({a, b: bb, sag = 26, n = 1, gap = 10, birds, ink = W.hair, seed = 'wire', at}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  let wd = '';
  for (let i = 0; i < n; i++) wd += wire(a[0], a[1] + i * gap, bb[0], bb[1] + i * gap, sag, {seed: `${seed}/w${i}`, over: [0, 0]});
  const out: React.ReactNode[] = [<Ink thing key="w" d={wd} width={ink} />];
  if (birds) {
    const nb = birds.n ?? birds.us?.length ?? 4;
    const us = birds.us ?? Array.from({length: nb}, (_, i) => 0.12 + (i / nb) * 0.4);
    const size = birds.size ?? 18;
    const col = birds.color ?? EMBER.anchor;
    const r = rng(`birds/${seed}`);
    us.forEach((u, i) => {
      const [bx, by] = wirePoint(a[0], a[1], bb[0], bb[1], sag, u);
      const dirB = r.chance(0.5) ? 1 : -1;
      const ph = r.range(0, 6);
      const lift = birds.liftAt !== undefined ? birds.liftAt + i * 0.06 + r.range(0, 0.08) : undefined;
      if (lift !== undefined && t >= lift) {
        const d = t - lift;
        if (d > 1.7) return;
        const fx = bx + dirB * (d * (birds.fly ?? 260) + d * d * 80);
        const fy = by - d * (birds.rise ?? 240) + d * d * 40 * ((birds.rise ?? 240) / 240) + Math.sin(d * 6 + ph) * 6;
        const w = size * 0.6;
        const lf = Math.sin(t * 2 * Math.PI * 3.2 + ph) * w * 0.7;
        out.push(<TPath thing key={`f${i}`} d={`M${fx - w} ${fy - lf}Q${fx - w * 0.4} ${fy - w * 0.3} ${fx} ${fy}Q${fx + w * 0.4} ${fy - w * 0.3} ${fx + w} ${fy - lf}`} fill="none" stroke={col} strokeWidth={2.2} strokeLinecap="round" />);
        return;
      }
      const hb = bob(t, 1.2, 0.9, ph) + (Math.floor(t / 2.3 + ph) % 3 === 0 ? -1.5 : 0);
      const look = Math.floor(t / 1.7 + ph) % 2 === 0 ? dirB : -dirB;
      const s = size / 18;
      out.push(
        <g key={`b${i}`} transform={`translate(${bx.toFixed(1)} ${by.toFixed(1)}) scale(${(look * s).toFixed(3)} ${s.toFixed(3)})`}>
          <TPath d={blob(0, -7, 7, 5.5, {seed: `${seed}/bb${i}`})} fill={col} />
          <TCircle cx={5} cy={-13 + hb} r={3.8} fill={col} />
          <TPath d={`M8 ${-13 + hb}l4 1-4 1z`} fill={EMBER.books[0]} />
          <TPath thing d={`M-6 -6l-6 4`} stroke={col} strokeWidth={3} strokeLinecap="round" />
        </g>,
      );
    });
  }
  return <>{out}</>;
};
export const Wire3 = tiered('environment', {bg: EMBER.sky}, Wire3Body);

/** An ink-only bike leaning (S4: at the left edge), snow on the saddle. Wheel base on y, w = length. */
const Bike3Body: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number; flip?: boolean}> = ({x, y, w = 200, seed = 'bike', at, ink = W.far, flip}) => {
  const r = w * 0.2;
  const k = flip ? -1 : 1;
  const xa = x - k * w * 0.32;
  const xb = x + k * w * 0.32;
  const yw = y - r;
  const seat: Pt = [x - k * w * 0.1, y - r * 2.6];
  const bar: Pt = [x + k * w * 0.22, y - r * 2.9];
  const crank: Pt = [x, yw];
  const d = circle(xa, yw, r, {seed: `${seed}/w1`}) + circle(xb, yw, r, {seed: `${seed}/w2`}) + poly([[xa, yw], crank, seat, [xa, yw]], {seed: `${seed}/f1`, over: [0, 0]}) + poly([crank, [bar[0] - k * w * 0.04, bar[1] + r * 0.6], [xb, yw]], {seed: `${seed}/f2`, over: [0, 0]}) + line(seat[0], seat[1], bar[0] - k * w * 0.04, bar[1] + r * 0.6, {over: [0, 0], seed: `${seed}/top`}) + line(bar[0] - k * w * 0.04, bar[1] + r * 0.6, bar[0], bar[1], {over: [0, 0], seed: `${seed}/stem`}) + line(bar[0] - k * w * 0.06, bar[1], bar[0] + k * w * 0.06, bar[1] - 4, {over: [0, 0], seed: `${seed}/hb`}) + line(seat[0] - k * w * 0.06, seat[1], seat[0] + k * w * 0.05, seat[1], {over: [0, 0], seed: `${seed}/seat`});
  return (
    <>
      <Ink thing d={d} at={at} width={ink} />
      <TPath d={blob(seat[0], seat[1] - 3, w * 0.06, 3.5, {seed: `${seed}/sn`})} fill={EMBER.snow} />
    </>
  );
};
export const Bike3 = tiered('environment', {bg: EMBER.sky}, Bike3Body);

/** One-off moving car along a line between two times (S10: a car passes on the far cross street at 23.4). */
const PassingCarBody: React.FC<{from: Pt; to: Pt; t0: number; t1: number; w?: number; color?: string; seed?: string}> = ({from, to, t0, t1, w = 90, color = EMBER.beam, seed = 'pass'}) => {
  const t = useTime();
  if (t < t0 || t > t1) return null;
  const k = (t - t0) / (t1 - t0);
  const x = from[0] + (to[0] - from[0]) * k;
  const y = from[1] + (to[1] - from[1]) * k;
  return <Car3 x={x} y={y} w={w} view="side" dir={to[0] >= from[0] ? 1 : -1} color={color} lights snow={false} rolling seed={seed} />;
};
export const PassingCar = tiered('environment', {bg: EMBER.sky}, PassingCarBody);

/** Seeded random-time helper for set lanes: the times (in [t0, t1)) at which "something small happens" every gap. */
export const lifeBeats = (seed: string, t0: number, t1: number, gap: [number, number] = [0.6, 1.2]) => events(`beats/${seed}`, t0, t1, gap).filter((v) => v >= t0 && v < t1);

/** Jolt offset for set pieces (things hop on a cause). */
export const useHop = (ats: number[] | undefined, amp = 4) => {
  const t = useTime();
  return -Math.abs(rings(t, ats, amp, 4, 7));
};
