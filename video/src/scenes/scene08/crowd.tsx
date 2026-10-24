// S08 attempters (fix round 1): every hooded figure in the scene, built to READ at phone size.
//   - Rattler: the shared Attempter at a door + a one-step-lighter (sage) door behind it, a 2-3 px peach rim strip on
//     the sun side and 2.2 px x 8-10 px rattle marks (the near doors: NOT counted).
//   - RimPile: the COUNTED attempters, ink-dark 18-24 px with a cream rim, pressed against the OUTSIDE of the dome's
//     flank in a pile that grows in visible steps with the tally (6 / +10 / +20 / +more), raising a hand to the glass
//     and tapping it (2-3 short ink tap ticks; no ripple arcs); the searchlight catches a group (cream flash).
//   - Flood: the 'millions' crowd: ink-dark hooded tombstones (8-18 px) with a cream rim on the sun side, packed in
//     ranks over the roofs and streets of every row OUTSIDE the dome, batched one body path + one rim path per rank.
// Everything is time-driven (scene seconds), pops (1.25x for 2 frames), no fades.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {useLook} from '../../lib/exit';
import {Attempter} from '../shared/props';
import {flankX, inDome} from './layout';

const SUN_X = 700;
const latest = (ts: number[], t: number): number | undefined => {
  let r: number | undefined;
  for (const x of ts) if (x <= t) r = x;
  return r;
};

/** A hooded figure seen from behind (feet centre x, y; height h): rounded shoulders 0.62 h wide + a pointed hood
 *  0.34 h wide, so a packed crowd reads as a mass of HEADS (reference 1) rather than a hedge of tombstones. */
function person(x: number, y: number, h: number): string {
  const sw = 0.31 * h;
  const hw = 0.17 * h;
  const f = (v: number) => v.toFixed(1);
  return (
    `M${f(x - sw)} ${f(y)}V${f(y - 0.36 * h)}Q${f(x - sw)} ${f(y - 0.54 * h)} ${f(x - 0.1 * h)} ${f(y - 0.55 * h)}H${f(x + 0.1 * h)}Q${f(x + sw)} ${f(y - 0.54 * h)} ${f(x + sw)} ${f(y - 0.36 * h)}V${f(y)}Z` +
    `M${f(x - hw)} ${f(y - 0.48 * h)}C${f(x - hw * 1.3)} ${f(y - 0.84 * h)} ${f(x - 0.07 * h)} ${f(y - 0.93 * h)} ${f(x)} ${f(y - h)}C${f(x + 0.07 * h)} ${f(y - 0.93 * h)} ${f(x + hw * 1.3)} ${f(y - 0.84 * h)} ${f(x + hw)} ${f(y - 0.48 * h)}Z`
  );
}
/** Its rim strips (rw wide) on side s (+1 right, -1 left): the hood edge and the outer shoulder. */
function personRim(x: number, y: number, h: number, s: number, rw: number): string {
  const sw = 0.31 * h;
  const hw = 0.17 * h;
  const f = (v: number) => v.toFixed(1);
  return (
    `M${f(x + s * hw)} ${f(y - 0.5 * h)}C${f(x + s * hw * 1.3)} ${f(y - 0.84 * h)} ${f(x + s * 0.07 * h)} ${f(y - 0.93 * h)} ${f(x)} ${f(y - h)}C${f(x + s * 0.03 * h)} ${f(y - 0.9 * h)} ${f(x + s * (hw * 1.3 - rw))} ${f(y - 0.82 * h)} ${f(x + s * (hw - rw))} ${f(y - 0.5 * h)}Z` +
    `M${f(x + s * sw)} ${f(y - 0.12 * h)}V${f(y - 0.36 * h)}Q${f(x + s * sw)} ${f(y - 0.54 * h)} ${f(x + s * 0.12 * h)} ${f(y - 0.55 * h)}V${f(y - 0.55 * h + rw)}Q${f(x + s * (sw - rw))} ${f(y - 0.52 * h)} ${f(x + s * (sw - rw))} ${f(y - 0.36 * h)}V${f(y - 0.12 * h)}Z`
  );
}

// ---------------------------------------------------------------- rattlers (the near doors: NOT counted)

export type RattlerSpec = {x: number; y: number; h: number; at: number; rattles: number[]; hop?: {at: number; to: number}; flip?: boolean; seed: string; /** 'stand' = a crowd figure pushing in behind the door rattlers (no door, no handle) */ mode?: 'rattle' | 'stand'};

/** A hooded attempter at a door rattling its handle; `hop` = gives up and hops to the next door (its door highlight
 *  goes with it). Accents for readability: sage door behind, peach rim strip, big rattle marks. */
export const Rattler: React.FC<RattlerSpec> = ({x, y, h, at, rattles, hop, flip, seed, mode = 'rattle'}) => {
  const t = useTime();
  const look = useLook();
  if (t < at) return null;
  let px = x;
  let py = y;
  let rattleAt = latest(rattles, t);
  let air = false;
  if (hop && t >= hop.at) {
    const q = prog(t, hop.at, 0.34);
    px = lerp(x, hop.to, E.inOutSine(q));
    py = y - Math.sin(q * Math.PI) * h * 0.38;
    if (q < 1) {
      rattleAt = undefined;
      air = true;
    }
  }
  const rattleDur = 0.5;
  const rattling = rattleAt !== undefined && t >= rattleAt && t < rattleAt + rattleDur;
  // the Attempter's own geometry (shared Figures.tsx), to lay the accents on it
  const pop = springAt(t, at, springs.pop);
  const jig = rattling ? Math.sin(t * 60) * h * 0.03 : 0;
  const tw = h * 0.36;
  const th = h * 0.5;
  const top = py - h * 0.38 - th;
  const hr = h * 0.12;
  const hcx = px + jig;
  const hcy = top - hr * 0.7;
  const iw = h >= 36 ? Math.max(1.6, h * 0.035) : 0;
  const rw = h >= 50 ? 3 : 2;
  const s = px < SUN_X ? 1 : -1;
  const ins = iw / 2 + rw / 2;
  const ex = hcx + s * (tw / 2 - ins);
  const rim =
    `M${ex.toFixed(1)} ${(top + th * 0.95).toFixed(1)}V${(top + tw * 0.4).toFixed(1)}Q${ex.toFixed(1)} ${(top + ins).toFixed(1)} ${(hcx + s * 2).toFixed(1)} ${(top + ins).toFixed(1)}` +
    `M${(hcx + s * (hr * 1.05 - ins)).toFixed(1)} ${(hcy + hr * 0.3).toFixed(1)}Q${(hcx + s * (hr * 1.12 - ins)).toFixed(1)} ${(hcy - hr * 0.7).toFixed(1)} ${(hcx + s * 0.6).toFixed(1)} ${(hcy - hr * 1.55).toFixed(1)}`;
  // door highlight: the door this figure stands at (door centre = figure x + 0.16 h), one step lighter
  const dh = h * 1.18;
  const dw = dh * 0.42;
  const dcx = px + h * 0.16;
  const hx = hcx + tw * 0.66;
  const hy = top + th * 0.45;
  const stand = mode === 'stand';
  const marks = !stand && rattling && Math.floor(t * 15) % 2 === 0 ? `M${hx + 4} ${hy - 5}l8 -4M${hx + 5} ${hy}l10 0M${hx + 4} ${hy + 5}l8 4` : '';
  const sc = pop < 1 ? `translate(${px} ${py}) scale(${pop.toFixed(3)}) translate(${-px} ${-py})` : undefined;
  return (
    <>
      {!air && !stand && look.fills === 'color' ? <path d={`M${(dcx - dw / 2 + 1.5).toFixed(1)} ${(py - 0.5).toFixed(1)}V${(py - dh + 1.5).toFixed(1)}H${(dcx + dw / 2 - 1.5).toFixed(1)}V${(py - 0.5).toFixed(1)}Z`} fill={palette.sage} transform={sc} /> : null}
      <Attempter x={px} y={py} h={h} mode={stand ? 'stand' : 'rattle'} riseAt={at} rattleAt={stand ? undefined : rattleAt} rattleDur={rattleDur} flip={flip} seed={seed} />
      {look.fills === 'color' ? (
        <g transform={sc}>
          <path d={rim} fill="none" stroke={palette.peach} strokeWidth={rw} strokeLinecap="round" />
          {stand ? null : <path d={`M${hcx + tw * 0.36} ${top + th * 0.2}L${hcx + tw * 0.62} ${top + th * 0.25}`} stroke={palette.tealDark} strokeWidth={h * 0.09} strokeLinecap="round" fill="none" />}
          {marks ? <path d={marks} stroke={palette.ink} strokeWidth={2.2} strokeLinecap="round" fill="none" /> : null}
        </g>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- the rim pile (COUNTED: pressed against the glass)

export type PileFig = {x: number; y: number; h: number; side: -1 | 1; at: number; taps: number[]; flash?: number};

/** Slots of a pile against the dome's flank (side -1 = left, +1 = right), in fill order (it grows up and out).
 *  levels: feet y = foot - L * 13; ranks per level shrink with height (a heap); the ground level spreads `ground`
 *  figures away from the glass. */
export function pileSlots(side: -1 | 1, o: {foot?: number; levels: number; ground: number; ranks: (L: number) => number; seed: string}): {x: number; y: number; h: number; order: number}[] {
  const foot = o.foot ?? 1086;
  const out: {x: number; y: number; h: number; order: number}[] = [];
  for (let L = 0; L < o.levels; L++) {
    const nk = L === 0 ? o.ground : o.ranks(L);
    for (let k = 0; k < nk; k++) {
      const h = lerp(18, 24, rand(o.seed, `h${L}/${k}`));
      const y = foot - L * 13 + (rand(o.seed, `y${L}/${k}`) - 0.5) * 3;
      const touch = flankX(y - h * 0.78, side);
      const x = touch + side * (h * 0.25 + 3 + k * 10.5 + (rand(o.seed, `x${L}/${k}`) - 0.5) * 3);
      out.push({x, y, h, order: L * 1.0 + k * 0.85 + rand(o.seed, `o${L}/${k}`) * 0.3});
    }
  }
  return out.sort((a, b) => a.order - b.order);
}

/** The counted pile: ink-dark hooded figures (cream rim on the glass side) with a hand on the glass; taps = 2-3 short
 *  ink ticks at the hand for 0.3 s; flash = the searchlight catches it (cream body for 2 frames). Drawn back to front
 *  (higher figures first, then the outer ranks) as a handful of batched paths. */
export const RimPile: React.FC<{figs: PileFig[]}> = ({figs}) => {
  const t = useTime();
  const look = useLook();
  if (look.fills !== 'color') return null;
  let body = '';
  let lit = '';
  let rim = '';
  let arms = '';
  let ticks = '';
  for (const f of figs) {
    if (t < f.at) continue;
    const k = t < f.at + 0.067 ? 1.25 : 1;
    const h = f.h * k;
    const {x, y, side} = f;
    const flashing = f.flash !== undefined && t >= f.flash && t < f.flash + 0.067;
    const b = person(x, y, h);
    if (flashing) lit += b;
    else body += b;
    rim += personRim(x, y, h, x < SUN_X ? 1 : -1, Math.max(1.8, h * 0.09));
    // the hand on the glass
    const sx = x - side * h * 0.22;
    const sy = y - h * 0.5;
    const hx = flankX(y - h * 0.95, side) + side * 1.5;
    const hy = y - h * 0.95;
    arms += `M${sx.toFixed(1)} ${sy.toFixed(1)}L${hx.toFixed(1)} ${hy.toFixed(1)}`;
    const tap = latest(f.taps, t);
    if (tap !== undefined && t < tap + 0.3 && Math.floor((t - tap) * 15) % 2 === 0) {
      // 3 short ticks fanning out from the touch point, on the glass side
      for (const a of [-50, 0, 50]) {
        const r = ((a + (side > 0 ? 180 : 0)) * Math.PI) / 180;
        const c = Math.cos(r);
        const sn = Math.sin(r);
        ticks += `M${(hx + c * 3).toFixed(1)} ${(hy + sn * 3).toFixed(1)}l${(c * 5).toFixed(1)} ${(sn * 5).toFixed(1)}`;
      }
    }
  }
  if (!body && !lit) return null;
  return (
    <>
      {arms ? <path d={arms} stroke={palette.ink} strokeWidth={2.4} strokeLinecap="round" fill="none" /> : null}
      {body ? <path d={body} fill={palette.ink} /> : null}
      {lit ? <path d={lit} fill={palette.cream} stroke={palette.ink} strokeWidth={1} /> : null}
      {rim ? <path d={rim} fill={palette.cream} /> : null}
      {ticks ? <path d={ticks} stroke={palette.ink} strokeWidth={1.6} strokeLinecap="round" fill="none" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- the flood ('millions': OUTSIDE the dome)

export type CrowdFig = {x: number; y: number; h: number; at: number; rank: number};

/** A packed band of hooded figures: `ranks` rows (back rank higher and smaller), shoulder to shoulder (pitch 0.42 h
 *  with jitter) over x0..x1 with feet at yFeet (+- jy); pop times = at + (the figure's share of span) in `order`
 *  (rand | ltr | out-from (x)). `skip` drops figures (inside the dome, behind the board ...). */
export function crowdBand(
  seed: string,
  x0: number,
  x1: number,
  yFeet: number,
  h0: number,
  h1: number,
  ranks: number,
  at: number,
  span: number,
  o: {jy?: number; gap?: number; order?: 'rand' | 'ltr' | {from: number}; skip?: (x: number, y: number, h: number) => boolean; rank0?: number} = {},
): CrowdFig[] {
  const out: CrowdFig[] = [];
  for (let r = ranks - 1; r >= 0; r--) {
    const hm = lerp(h0, h1, 0.5) * (1 - r * 0.08);
    let x = x0 + rand(seed, `s${r}`) * hm * 0.4;
    let i = 0;
    while (x < x1) {
      const h = lerp(h0, h1, rand(seed, `h${r}/${i}`)) * (1 - r * 0.07);
      const y = yFeet - r * hm * 0.38 + (rand(seed, `y${r}/${i}`) - 0.5) * 2 * (o.jy ?? 1.5);
      // seeded gaps: the crowd breaks into clumps (the back ranks thin out in places)
      const gapHere = (o.gap !== undefined && rand(seed, `g${r}/${Math.floor(i / 6)}`) < o.gap) || (r > 0 && rand(seed, `G${r}/${Math.floor(i / 5)}`) < 0.18 * r);
      if (!gapHere && !(o.skip && o.skip(x, y, h))) {
        const ord = o.order ?? 'rand';
        const u = ord === 'ltr' ? (x - x0) / (x1 - x0) : ord === 'rand' ? rand(seed, `a${r}/${i}`) : Math.min(1, Math.abs(x - ord.from) / 700);
        out.push({x, y, h, at: at + u * span, rank: (o.rank0 ?? 0) + (ranks - 1 - r)});
      }
      x += h * (0.42 + rand(seed, `p${r}/${i}`) * 0.16);
      i++;
    }
  }
  return out;
}

/** Skip helper: outside-the-dome only (a figure's head inside the glass is dropped). */
export const outsideDome = (x: number, y: number, h: number) => inDome(x, y - h * 0.5) || inDome(x - h * 0.3, y - h) || inDome(x + h * 0.3, y - h);

/** The flood: per rank one ink-dark body path + one cream rim path (sun side), back ranks first. Pops 1.25x for 2
 *  frames; after `flickerAt` a seeded third of the crowd bobs 1-2 px in 0.1 s steps (it seethes). */
export const Flood: React.FC<{figs: CrowdFig[]; flickerAt?: number; seed: string; color?: string}> = ({figs, flickerAt, seed, color = palette.ink}) => {
  const t = useTime();
  const look = useLook();
  if (look.fills !== 'color') return null;
  const step = flickerAt !== undefined && t >= flickerAt ? Math.floor((t - flickerAt) / 0.1) : -1;
  const bodies: string[] = [];
  const bodies2: string[] = [];
  const rims: string[] = [];
  figs.forEach((f, i) => {
    if (t < f.at) return;
    const k = t < f.at + 0.067 ? 1.25 : 1;
    const h = f.h * k;
    const bob = step >= 0 && rand(seed, `f${i}`) < 0.35 && (step + i) % 2 === 0 ? -Math.max(1, h * 0.12) : 0;
    const y = f.y + bob;
    if (rand(seed, `c${i}`) < 0.3) bodies2[f.rank] = (bodies2[f.rank] ?? '') + person(f.x, y, h);
    else bodies[f.rank] = (bodies[f.rank] ?? '') + person(f.x, y, h);
    rims[f.rank] = (rims[f.rank] ?? '') + personRim(f.x, y, h, f.x < SUN_X ? 1 : -1, Math.max(1, h * 0.1));
  });
  const out: React.ReactNode[] = [];
  for (let r = 0; r < Math.max(bodies.length, bodies2.length); r++) {
    if (bodies[r]) out.push(<path key={`b${r}`} d={bodies[r]} fill={color} />);
    if (bodies2[r]) out.push(<path key={`c${r}`} d={bodies2[r]} fill={palette.tealDark} />);
    if (rims[r]) out.push(<path key={`r${r}`} d={rims[r]} fill={palette.cream} />);
  }
  return out.length ? <>{out}</> : null;
};
