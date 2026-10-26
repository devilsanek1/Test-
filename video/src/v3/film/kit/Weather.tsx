// kit/Weather.tsx: the outside's idle layer at blue hour, first snow (docs/v3/density_plan_g5b.md §0, §2): snow in
// near / mid / far layers (half density and small flakes in the caption band), snow ridges and caps, frost in the
// glass corners, puff trains (chimney smoke, steam, the data center's cooling plume, exhaust), the near house fronts
// seen through a window (lit windows switching, silhouettes, chimneys), drifting cloud masses, a low snow-cloud bank,
// a flapping V of birds and icicles that drip. Flat fills, no gradients, no opacity; everything moves by time.
//
//   <SnowLayers x={180} y={630} w={720} h={430} layers={['far', 'mid', 'near']} seed="o1" />
//   <SnowSill x0={180} x1={900} y={1060} />            <Frost x={180} y={630} w={720} h={430} corners={['bl', 'br']} />
//   <Smoke x={520} y={990} />  <Steam x={..} y={..} />  <CoolingPlume x={..} y={..} ceil={600} />  <Exhaust .. />
//   <NearRoofs x0={180} x1={900} y={1062} seed="o1" force={[{i: 2, t: 4.6, on: false}]} />
//   <SkyClouds x0={-100} x1={1180} y0={60} y1={280} n={4} />   <CloudBank y={1010} h={70} />
//   <BirdV at={20} from={[80, 760]} to={[520, 690]} dur={2.2} />  <Icicles x0={0} x1={1080} y={262} n={6} drip />

import React, {useMemo} from 'react';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {blob, crown, smooth} from '../../../lib/sketch';
import {EMBER} from '../palette';
import {At, Pt} from './util';
import {events, puffs, PuffOpts, windowLit, WindowForce} from './idle';
import {WindowSilhouette, SilWho} from './People3';

/** The caption band (screen y): weather passes here at half density, flakes <= 6 px. */
export const BAND: [number, number] = [290, 600];

// ---------------------------------------------------------------- snow layers

export type SnowLayer = 'far' | 'mid' | 'near';

const LAYER = {
  far: {r: [1.4, 2.4], v: [16, 26], n: 0.00016, wob: 2, color: EMBER.snow},
  mid: {r: [2.6, 4.2], v: [30, 46], n: 0.00008, wob: 4, color: EMBER.snow},
  near: {r: [5, 8], v: [70, 110], n: 0.000016, wob: 7, color: EMBER.snow},
} as const;

export type SnowLayersProps = {
  /** The area (canvas px; default the whole frame plus bleed). */
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  layers?: SnowLayer[];
  /** Density multiplier (1 = the plan's window counts: ~40 far and ~8 near in O1's glass). */
  density?: number;
  /** Fall speed multiplier (S9's move: near flakes streak past). */
  speed?: number;
  /** Sideways wind (px / s). */
  wind?: number;
  /** Per-layer screen offset (parallax under a camera move): far, mid, near. */
  offset?: Partial<Record<SnowLayer, Pt>>;
  /** The calm band (default BAND); null = no band rule (inside a window under the band). */
  band?: [number, number] | null;
  /** Flake colour override (e.g. frost on a light wall). */
  color?: string;
  seed?: string;
  at?: At;
};

/** Falling snow in parallax layers: far (tiny, slow, dense), mid, near (big, fast, sparse). Inside the caption band
 *  every other flake shrinks to nothing over 24 px (half density) and no flake is drawn over 6 px. Deterministic. */
export const SnowLayers: React.FC<SnowLayersProps> = ({x = -100, y = -100, w = 1280, h = 2120, layers = ['far', 'mid', 'near'], density = 1, speed = 1, wind = 0, offset, band = BAND, color, seed = 'snow', at}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const out: React.ReactNode[] = [];
  for (const L of layers) {
    const spec = LAYER[L];
    const r = rng(`snowL/${seed}/${L}`);
    const n = Math.max(1, Math.round(w * h * spec.n * density));
    const off = offset?.[L] ?? [0, 0];
    let d = '';
    for (let i = 0; i < n; i++) {
      const x0 = r.range(x, x + w);
      const y0 = r.range(y, y + h);
      const v = r.range(spec.v[0], spec.v[1]) * speed;
      let rad = r.range(spec.r[0], spec.r[1]);
      const ph = r.range(0, 6.28);
      const fy = y + ((((y0 - y + v * t) % h) + h) % h) + off[1];
      const fx = x + ((((x0 - x + wind * t + Math.sin(t * 0.8 + ph) * spec.wob) % w) + w) % w) + off[0];
      if (band) {
        const into = Math.min(fy - band[0], band[1] - fy);
        if (into > 0) {
          rad = Math.min(rad, 3);
          if (i % 2 === 1) rad *= Math.max(0, 1 - into / 24);
        }
      }
      if (rad < 0.5) continue;
      d += `M${(fx - rad).toFixed(1)} ${fy.toFixed(1)}a${rad.toFixed(1)} ${rad.toFixed(1)} 0 1 0 ${(2 * rad).toFixed(1)} 0a${rad.toFixed(1)} ${rad.toFixed(1)} 0 1 0 ${(-2 * rad).toFixed(1)} 0`;
    }
    if (d) out.push(<path key={L} d={d} fill={color ?? spec.color} />);
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- snow ridges, caps, frost

/** A snow ridge on a sill or ledge: a bumpy mound from x0 to x1 sitting on y, height h, with a hair ink top. */
export const SnowSill: React.FC<{x0: number; x1: number; y: number; h?: number; seed?: string; ink?: number; at?: At; drips?: number}> = ({x0, x1, y, h = 16, seed = 'sill', ink = 1.6, at, drips = 0}) => {
  const t = useTime();
  const pts = useMemo(() => {
    const r = rng(`sill/${seed}`);
    const n = Math.max(3, Math.round((x1 - x0) / 38));
    const p: Pt[] = [[x0 - 4, y + 1]];
    for (let i = 0; i <= n; i++) p.push([x0 + ((x1 - x0) * i) / n + r.jitter(6), y - h * r.range(0.55, 1)]);
    p.push([x1 + 4, y + 1]);
    return p;
  }, [x0, x1, y, h, seed]);
  if (at !== undefined && t < at) return null;
  const top = smooth(pts.slice(1, -1));
  const fillD = top + `L${x1 + 4} ${y + 2}L${x0 - 4} ${y + 2}Z`;
  const r2 = rng(`sillD/${seed}`);
  const dr: React.ReactNode[] = [];
  for (let i = 0; i < drips; i++) {
    const dx = r2.range(x0 + 10, x1 - 10);
    const dl = r2.range(6, 14);
    dr.push(<path key={i} d={`M${dx - 3} ${y}Q${dx} ${y + dl * 1.4} ${dx + 3} ${y}Z`} fill={EMBER.snow} />);
  }
  return (
    <>
      <path d={fillD} fill={EMBER.snow} />
      {dr}
      {ink > 0 ? <path d={top} fill="none" stroke={EMBER.ink} strokeWidth={ink} strokeLinecap="round" /> : null}
    </>
  );
};

/** A snow cap on top of a box (a sign, a car roof, a booth, a lamp head): a soft slab overhanging by `over`. */
export const SnowCap: React.FC<{x: number; y: number; w: number; h?: number; over?: number; seed?: string; ink?: number}> = ({x, y, w, h = 10, over = 4, seed = 'cap', ink = 0}) => {
  const d = blob(x + w / 2, y - h * 0.35, w / 2 + over, h * 0.65, {seed: `cap/${seed}`});
  return (
    <>
      <path d={d} fill={EMBER.snow} />
      {ink > 0 ? <path d={`M${x - over} ${y - h * 0.2}Q${x + w / 2} ${y - h * 1.15} ${x + w + over} ${y - h * 0.2}`} fill="none" stroke={EMBER.ink} strokeWidth={ink} strokeLinecap="round" /> : null}
    </>
  );
};

/** Frost in the corners of a pane: scalloped flat blobs (frost) with small star ticks, like the G4 style frame. */
export const Frost: React.FC<{x: number; y: number; w: number; h: number; corners?: ('tl' | 'tr' | 'bl' | 'br')[]; size?: number; seed?: string; ink?: number}> = ({x, y, w, h, corners = ['bl', 'br'], size = 90, seed = 'frost', ink = 1.6}) => {
  const out: React.ReactNode[] = [];
  corners.forEach((c, i) => {
    const cx = c[1] === 'l' ? x : x + w;
    const cy = c[0] === 't' ? y : y + h;
    const sgx = c[1] === 'l' ? 1 : -1;
    const sgy = c[0] === 't' ? 1 : -1;
    const d = crown(cx + sgx * size * 0.12, cy + sgy * size * 0.08, size * 0.95, size * 0.62, {seed: `${seed}/${c}`, bumps: 6, round: 0.75});
    const r = rng(`frostT/${seed}/${i}`);
    let ticks = '';
    for (let k = 0; k < 3; k++) {
      const tx = cx + sgx * r.range(size * 0.2, size * 0.75);
      const ty = cy + sgy * r.range(size * 0.12, size * 0.45);
      const s = r.range(4, 7);
      ticks += `M${tx - s} ${ty}L${tx + s} ${ty}M${tx} ${ty - s}L${tx} ${ty + s}M${tx - s * 0.7} ${ty - s * 0.7}L${tx + s * 0.7} ${ty + s * 0.7}M${tx - s * 0.7} ${ty + s * 0.7}L${tx + s * 0.7} ${ty - s * 0.7}`;
    }
    out.push(
      <g key={c}>
        <path d={d} fill={EMBER.frost} />
        {ink > 0 ? <path d={ticks} fill="none" stroke={EMBER.ink} strokeWidth={ink} strokeLinecap="round" /> : null}
      </g>,
    );
  });
  return (
    <g>
      <defs>
        <clipPath id={`frc-${seed}`}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#frc-${seed})`}>{out}</g>
    </g>
  );
};

// ---------------------------------------------------------------- puff trains

export type PuffTrainProps = PuffOpts & {
  /** The source (canvas px). */
  x: number;
  y: number;
  color?: string;
  /** Hair ink round each puff (default none: smoke is fill-only). */
  ink?: number;
  at?: At;
};

/** A flat puff train: each puff grows, rises, drifts and shrinks to nothing (no fade), 2-3 s loop. */
export const PuffTrain: React.FC<PuffTrainProps> = ({x, y, color = EMBER.skyLow, ink = 0, at, ...o}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const ps = puffs(t - (at ?? 0), o, y);
  let d = '';
  for (const p of ps) d += blob(x + p.x, y + p.y, p.r, p.r * 0.86, {seed: `${o.seed ?? 'pf'}/${Math.round(p.k * 7)}`});
  if (!d) return null;
  return (
    <>
      <path d={d} fill={color} />
      {ink > 0 ? <path d={d} fill="none" stroke={EMBER.ink} strokeWidth={ink} /> : null}
    </>
  );
};

/** Chimney smoke against the dusk sky: a lighter flat step, drifting right. */
export const Smoke: React.FC<Omit<PuffTrainProps, 'color'> & {color?: string}> = (p) => <PuffTrain n={5} life={2.8} rise={110} drift={46} r0={5} r1={18} wobble={4} {...p} color={p.color ?? EMBER.skyLow} />;

/** Steam (a mug, a vent, a coffee cup, a manhole): small white puffs rising straight. */
export const Steam: React.FC<Omit<PuffTrainProps, 'color'> & {color?: string}> = (p) => <PuffTrain n={4} life={1.8} rise={70} drift={4} r0={3} r1={9} wobble={5} {...p} color={p.color ?? EMBER.snow} />;

/** The data center's cooling plume (one per roof unit): big slow puffs, never above `ceil` (default 600: the band). */
export const CoolingPlume: React.FC<Omit<PuffTrainProps, 'color'> & {color?: string}> = (p) => <PuffTrain n={5} life={3.2} rise={160} drift={30} r0={10} r1={30} wobble={6} ceil={600} {...p} color={p.color ?? EMBER.frost} />;

/** Exhaust from a vehicle's pipe: a puff every ~0.6 s drifting back (dir -1 = left). */
export const Exhaust: React.FC<{x: number; y: number; dir?: number; size?: number; seed?: string; color?: string}> = ({x, y, dir = -1, size = 1, seed = 'ex', color = EMBER.frost}) => (
  <PuffTrain x={x} y={y} n={3} life={1.8} rise={26 * size} drift={dir * 60 * size} r0={3 * size} r1={10 * size} wobble={3} seed={seed} color={color} />
);

// ---------------------------------------------------------------- near house fronts (through a window)

export type NearRoofsProps = {
  /** Extent and the ground line (the fronts stand on y; behind a window this is the glass's lower edge region). */
  x0: number;
  x1: number;
  y: number;
  /** Fronts' height range (px). */
  h?: [number, number];
  n?: number;
  seed?: string;
  /** Fill only (behind glass: default true). */
  far?: boolean;
  /** Chimney smoke from every chimney (default true). */
  smoke?: boolean;
  /** Indices of windows (in the block's order) that get a silhouette, and who they are. */
  sil?: Record<number, SilWho>;
  /** Scripted switches (O1: one goes off at 4.6). */
  force?: WindowForce[];
  gap?: [number, number];
  at?: At;
};

/** 2-4 house fronts face-on behind the window: varied gables and flat tops in the cold roofs blue, snowy roofs, 6-10
 *  warm lit windows on one switching schedule (2 with silhouettes), chimneys with smoke drifting right. Fill only. */
export const NearRoofs: React.FC<NearRoofsProps> = ({x0, x1, y, h = [70, 110], n = 3, seed = 'near', far = true, smoke = true, sil = {1: 'cross', 4: 'read'}, force, gap, at}) => {
  const t = useTime();
  const plan = useMemo(() => {
    const r = rng(`nearR/${seed}`);
    const span = x1 - x0;
    const houses: {x: number; w: number; h: number; gable: boolean; chimney: number | null}[] = [];
    let cx = x0 - r.range(10, 40);
    for (let i = 0; i < n + 1 && cx < x1; i++) {
      const w = (span / n) * r.range(0.75, 1.15);
      houses.push({x: cx, w, h: r.range(h[0], h[1]), gable: r.chance(0.6), chimney: r.chance(0.75) ? r.range(0.15, 0.7) : null});
      cx += w + r.range(-8, 12);
    }
    const windows: {x: number; y: number; w: number; h: number}[] = [];
    for (const hs of houses) {
      const cols = hs.w > 150 ? 3 : 2;
      const rows = hs.h > 95 ? 2 : 1;
      const ww = hs.w * 0.16;
      const wh = hs.h * (rows === 2 ? 0.22 : 0.3);
      for (let rr = 0; rr < rows; rr++)
        for (let c = 0; c < cols; c++) {
          windows.push({x: hs.x + hs.w * ((c + 0.5) / cols) - ww / 2, y: y - hs.h + hs.h * (rows === 2 ? 0.18 + rr * 0.42 : 0.35), w: ww, h: wh});
        }
    }
    return {houses, windows};
  }, [x0, x1, y, h[0], h[1], n, seed]);
  if (at !== undefined && t < at) return null;
  const body = EMBER.roofs;
  const out: React.ReactNode[] = [];
  plan.houses.forEach((hs, i) => {
    const top = y - hs.h;
    const peak = top - hs.w * 0.36;
    const d = hs.gable ? `M${hs.x} ${y + 4}L${hs.x} ${top}L${hs.x + hs.w / 2} ${peak}L${hs.x + hs.w} ${top}L${hs.x + hs.w} ${y + 4}Z` : `M${hs.x} ${y + 4}L${hs.x} ${top}L${hs.x + hs.w} ${top}L${hs.x + hs.w} ${y + 4}Z`;
    const snowD = hs.gable
      ? `M${hs.x - 6} ${top + 4}L${hs.x + hs.w / 2} ${peak - 6}L${hs.x + hs.w + 6} ${top + 4}L${hs.x + hs.w - 2} ${top + 12}L${hs.x + hs.w / 2} ${peak + 8}L${hs.x + 2} ${top + 12}Z`
      : `M${hs.x - 4} ${top - 6}h${hs.w + 8}v10h${-hs.w - 8}Z`;
    if (hs.chimney !== null) {
      const chx = hs.x + hs.w * hs.chimney;
      const chTop = hs.gable ? peak + (top - peak) * Math.abs(hs.chimney - 0.5) * 2 - 26 : top - 24;
      out.push(<rect key={`ch${i}`} x={chx} y={chTop} width={14} height={top - chTop + 10} fill={body} />);
      out.push(<rect key={`chs${i}`} x={chx - 2} y={chTop - 4} width={18} height={6} fill={EMBER.snow} />);
      if (smoke) out.push(<Smoke key={`sm${i}`} x={chx + 7} y={chTop - 4} seed={`${seed}/sm${i}`} rise={90} />);
    }
    out.push(<path key={`h${i}`} d={d} fill={i % 2 ? EMBER.dcSide : body} />);
    out.push(<path key={`s${i}`} d={snowD} fill={EMBER.snow} />);
  });
  const W = plan.windows.length;
  plan.windows.forEach((wd, i) => {
    out.push(<WindowSilhouette key={`w${i}`} {...wd} far={far} who={sil[i] ?? 'none'} dark={EMBER.dcDark} seed={`${seed}/w${i}`} lit={(tt) => windowLit(tt, `near/${seed}`, i, W, {gap, litFrac: 0.75, force})} />);
  });
  return <>{out}</>;
};

// ---------------------------------------------------------------- sky: clouds, a low bank, birds

export type SkyCloudsProps = {
  /** The drift lane (canvas px): clouds wrap across x0..x1 inside y0..y1 (keep y1 <= 290 over the caption band). */
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  n?: number;
  /** Size range (px wide). */
  w?: [number, number];
  /** px / s (6-10 by the plan). */
  speed?: number;
  color?: string;
  seed?: string;
};

/** Big flat cloud masses drifting (a lighter or darker flat step of the sky), wrapping. */
export const SkyClouds: React.FC<SkyCloudsProps> = ({x0 = -200, x1 = 1280, y0 = 40, y1 = 280, n = 4, w = [300, 620], speed = 8, color = '#66759E', seed = 'clouds'}) => {
  const t = useTime();
  const r = rng(`cl/${seed}`);
  const span = x1 - x0;
  let d = '';
  for (let i = 0; i < n; i++) {
    const cw = r.range(w[0], w[1]);
    const ch = cw * r.range(0.16, 0.24);
    const base = r.range(x0, x1);
    const sp = speed * r.range(0.8, 1.2);
    const cy = r.range(y0 + ch * 0.6, y1 - ch * 0.5);
    const cx = x0 + ((((base - x0 + sp * t) % (span + cw)) + span + cw) % (span + cw)) - cw / 2;
    // a flat-bottomed cloud: crown top, straight base
    d += crown(cx, cy, cw / 2, ch, {seed: `${seed}/${i}`, bumps: 5, round: 0.62});
  }
  return <path d={d} fill={color} />;
};

/** A pale low snow-cloud bank on the horizon (S9: the dark hall and the mountain stand against the palest shape). */
export const CloudBank: React.FC<{y: number; h?: number; x0?: number; x1?: number; color?: string; seed?: string; drift?: number}> = ({y, h = 70, x0 = -200, x1 = 1280, color = EMBER.skyLow, seed = 'bank', drift = 3}) => {
  const t = useTime();
  const r = rng(`bank/${seed}`);
  const pts: Pt[] = [];
  const n = 12;
  for (let i = 0; i <= n; i++) pts.push([x0 + ((x1 - x0) * i) / n + Math.sin(t * 0.2 + i) * drift, y - h * r.range(0.45, 1)]);
  return <path d={smooth(pts) + `L${x1} ${y + 2}L${x0} ${y + 2}Z`} fill={color} />;
};

/** A V of 4-5 birds crossing (16-24 px, clear V wings flapping; lighter than the sticks: dcSide by default). */
export const BirdV: React.FC<{at: number; from: Pt; to: Pt; dur?: number; n?: number; size?: number; color?: string; seed?: string; width?: number}> = ({at, from, to, dur = 2.4, n = 5, size = 20, color = EMBER.dcSide, seed = 'bv', width = 2.2}) => {
  const t = useTime();
  if (t < at || t > at + dur) return null;
  const k = (t - at) / dur;
  const dir = Math.sign(to[0] - from[0]) || 1;
  let d = '';
  for (let i = 0; i < n; i++) {
    const rank = Math.ceil(i / 2);
    const side = i % 2 ? 1 : -1;
    const bx = from[0] + (to[0] - from[0]) * k - dir * rank * size * 1.5;
    const by = from[1] + (to[1] - from[1]) * k + side * rank * size * 0.9 + Math.sin(t * 3 + i) * 2;
    const w = size / 2;
    const lift = Math.sin(t * 2 * Math.PI * 2.6 + i * 1.3) * w * 0.6;
    d += `M${bx - w} ${by - lift}Q${bx - w * 0.4} ${by - w * 0.3} ${bx} ${by}Q${bx + w * 0.4} ${by - w * 0.3} ${bx + w} ${by - lift}`;
  }
  return <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />;
};

// ---------------------------------------------------------------- icicles

/** Icicles hanging under a ledge (frost fill, hair ink); with `drip`, a drop falls from one of them every ~1.2 s. */
export const Icicles: React.FC<{x0: number; x1: number; y: number; n?: number; len?: [number, number]; drip?: boolean; seed?: string; ink?: number}> = ({x0, x1, y, n = 5, len = [16, 44], drip = true, seed = 'ice', ink = 1.6}) => {
  const t = useTime();
  const ice = useMemo(() => {
    const r = rng(`ice/${seed}`);
    return Array.from({length: n}, () => ({x: r.range(x0, x1), l: r.range(len[0], len[1]), w: r.range(5, 9)}));
  }, [x0, x1, n, len[0], len[1], seed]);
  let fill = '';
  let line = '';
  for (const c of ice) {
    fill += `M${c.x - c.w} ${y}L${c.x + c.w} ${y}L${c.x + 0.6} ${y + c.l}Z`;
    line += `M${c.x - c.w} ${y + 1}L${c.x + 0.6} ${y + c.l}L${c.x + c.w} ${y + 1}`;
  }
  const drops: React.ReactNode[] = [];
  if (drip && ice.length) {
    const ev = events(`drip/${seed}`, -4, 120, [0.9, 1.5]);
    for (let k = 0; k < ev.length; k++) {
      const d = t - ev[k];
      if (d < 0) break;
      if (d > 0.45) continue;
      const c = ice[k % ice.length];
      const fy = y + c.l + 4 + 420 * d * d;
      const rr = 3 * (1 - Math.max(0, d - 0.3) / 0.15);
      if (rr > 0.4) drops.push(<path key={k} d={blob(c.x + 0.6, fy, rr * 0.8, rr * 1.2, {seed: `dr${k}`})} fill={EMBER.frost} />);
    }
  }
  return (
    <>
      <path d={fill} fill={EMBER.frost} />
      {ink > 0 ? <path d={line} fill="none" stroke={EMBER.ink} strokeWidth={ink} strokeLinejoin="round" /> : null}
      {drops}
    </>
  );
};
