// S08 attempters (fix round 2): every hooded figure in the scene, redrawn to READ as people at phone size.
//   - bust(): a back-view HEAD-AND-SHOULDERS silhouette (round head, a small hood peak on most, a shoulder hump, a
//     2-4 px gap to the next figure), the reference artist's back-view crowd (ref f_5.5 / ref2 f_33), never a spike.
//   - Rattler: an INK-DARK hooded person (head, shoulders, coat, legs, one arm on the handle) on a LIGHT door (cream /
//     peach), a cream rim on the sun side; each rattle = 4 shakes, every shake pops a set of 3 ink marks for 3 frames,
//     alternating sides (right of the handle / left of the figure), and jolts the body (no every-other-frame blink).
//   - Pile: the COUNTED attempters at the dome's foot and up its left flank (x >= 120), ink-dark / tealDark busts with
//     a cream rim, some with a raised arm whose fist is ON the glass: every tap pops two short cream ripple arcs there.
//   - Flood: the 'millions' crowd: ranks of busts (16-20 px on the far skyline, 30-40 px on the mid rooftops), ink-dark
//     and tealDark alternating per figure, a cream rim on the sun side, one or two raised arms per rank; batched per rank.
//   - NearCrowd: 90-120 px busts crowding our coping on 'millions' (the flood's foreground).
// Everything is time-driven (scene seconds), pops (1.25x for 2 frames or the 7 % spring), no fades.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {useLook} from '../../lib/exit';
import {DOME8, flankX, inDome} from './layout';

const SUN_X = 700;
const f1 = (v: number) => v.toFixed(1);
const latest = (ts: number[], t: number): number | undefined => {
  let r: number | undefined;
  for (const x of ts) if (x <= t) r = x;
  return r;
};

// ---------------------------------------------------------------- the bust (head + shoulders, back view)

/** A back-view head-and-shoulders silhouette, base centre (x, y), height h (base to head top): shoulders 0.66 h wide
 *  rising in a hump to the neck, a round head (r 0.2 h) and, with `hood`, a small hood peak leaning to one side. */
export function bust(x: number, y: number, h: number, hood: boolean, lean = 1): string {
  const sw = 0.33 * h;
  const r = 0.2 * h;
  const hy = y - h + r + (hood ? 0.05 * h : 0);
  const sh = y - 0.5 * h; // shoulder top
  const k = 0.5523 * r;
  let d =
    `M${f1(x - sw)} ${f1(y)}V${f1(sh + 0.16 * h)}C${f1(x - sw)} ${f1(sh + 0.02 * h)} ${f1(x - 0.24 * h)} ${f1(sh - 0.02 * h)} ${f1(x - 0.12 * h)} ${f1(sh - 0.03 * h)}` +
    `H${f1(x + 0.12 * h)}C${f1(x + 0.24 * h)} ${f1(sh - 0.02 * h)} ${f1(x + sw)} ${f1(sh + 0.02 * h)} ${f1(x + sw)} ${f1(sh + 0.16 * h)}V${f1(y)}Z`;
  // the head (a circle as 4 cubics)
  d += `M${f1(x - r)} ${f1(hy)}C${f1(x - r)} ${f1(hy - k)} ${f1(x - k)} ${f1(hy - r)} ${f1(x)} ${f1(hy - r)}C${f1(x + k)} ${f1(hy - r)} ${f1(x + r)} ${f1(hy - k)} ${f1(x + r)} ${f1(hy)}C${f1(x + r)} ${f1(hy + k)} ${f1(x + k)} ${f1(hy + r * 1.25)} ${f1(x)} ${f1(hy + r * 1.25)}C${f1(x - k)} ${f1(hy + r * 1.25)} ${f1(x - r)} ${f1(hy + k)} ${f1(x - r)} ${f1(hy)}Z`;
  if (hood) {
    // the hood: a slightly bigger cowl over the head with a small peak (lean = which side the tip falls)
    const R = r * 1.12;
    d += `M${f1(x - R)} ${f1(hy + r * 0.5)}C${f1(x - R * 1.02)} ${f1(hy - r * 0.7)} ${f1(x - r * 0.5)} ${f1(hy - r * 1.15)} ${f1(x + lean * r * 0.25)} ${f1(hy - r * 1.42)}C${f1(x + r * 0.55)} ${f1(hy - r * 1.05)} ${f1(x + R * 1.02)} ${f1(hy - r * 0.6)} ${f1(x + R)} ${f1(hy + r * 0.5)}Z`;
  }
  return d;
}

/** The bust's rim strip (rw wide) on side s (+1 right, -1 left): around the head / hood and down the outer shoulder. */
export function bustRim(x: number, y: number, h: number, s: number, rw: number, hood: boolean): string {
  const sw = 0.33 * h;
  const r = 0.2 * h * (hood ? 1.12 : 1);
  const hy = y - h + 0.2 * h + (hood ? 0.05 * h : 0);
  const sh = y - 0.5 * h;
  const top = hood ? hy - 0.2 * h * 1.3 : hy - r;
  // head: an outer arc from the top to the side, back along an inner arc (a crescent)
  const a = `M${f1(x + s * r * 0.15)} ${f1(top + rw * 0.2)}C${f1(x + s * r * 0.75)} ${f1(top + r * 0.1)} ${f1(x + s * r * 1.02)} ${f1(hy - r * 0.35)} ${f1(x + s * r)} ${f1(hy + r * 0.25)}` + `L${f1(x + s * (r - rw))} ${f1(hy + r * 0.2)}C${f1(x + s * (r - rw) * 0.98)} ${f1(hy - r * 0.3)} ${f1(x + s * r * 0.6)} ${f1(top + r * 0.1 + rw)} ${f1(x + s * r * 0.1)} ${f1(top + rw * 1.1)}Z`;
  const b = `M${f1(x + s * sw)} ${f1(y - 0.04 * h)}V${f1(sh + 0.16 * h)}C${f1(x + s * sw)} ${f1(sh + 0.03 * h)} ${f1(x + s * 0.25 * h)} ${f1(sh - 0.015 * h)} ${f1(x + s * 0.15 * h)} ${f1(sh - 0.025 * h)}` + `L${f1(x + s * 0.15 * h)} ${f1(sh - 0.025 * h + rw)}C${f1(x + s * 0.24 * h)} ${f1(sh + rw * 0.6)} ${f1(x + s * (sw - rw))} ${f1(sh + 0.05 * h)} ${f1(x + s * (sw - rw))} ${f1(sh + 0.16 * h)}V${f1(y - 0.04 * h)}Z`;
  return a + b;
}

/** A raised arm from the shoulder on side s up past the head (a thick stroke path) + where the fist is. */
export function armUp(x: number, y: number, h: number, s: number, reach = 1): {d: string; fist: [number, number]} {
  const sx = x + s * 0.22 * h;
  const sy = y - 0.46 * h;
  const ex = x + s * 0.36 * h;
  const ey = y - 0.82 * h;
  const fx = x + s * (0.3 + 0.08 * reach) * h;
  const fy = y - (1.08 + 0.1 * reach) * h;
  return {d: `M${f1(sx)} ${f1(sy)}L${f1(ex)} ${f1(ey)}L${f1(fx)} ${f1(fy)}`, fist: [fx, fy]};
}

// ---------------------------------------------------------------- rattlers (the near doors: NOT counted)

export type RattlerSpec = {
  /** Door centre x and sill y; the figure stands left of the door centre (0.16 h). */
  x: number;
  y: number;
  /** Figure height. */
  h: number;
  /** Door height (default 1.1 h). */
  dh?: number;
  at: number;
  rattles: number[];
  /** Gives up and hops to the door at x `to` (its sill y follows `toY`). */
  hop?: {at: number; to: number; toY?: number};
  seed: string;
};

/** One light door (the figure's door): cream fill (peach for every third seed), ink sides + top, a dark handle. */
export function doorPaths(x: number, y: number, dh: number): {fill: string; ink: string; handle: [number, number]} {
  const w = dh * 0.46;
  const fill = `M${f1(x - w / 2)} ${f1(y)}V${f1(y - dh)}H${f1(x + w / 2)}V${f1(y)}Z`;
  const ink = `M${f1(x - w / 2)} ${f1(y + 1)}V${f1(y - dh)}H${f1(x + w / 2)}V${f1(y + 1)}`;
  return {fill, ink, handle: [x + w * 0.28, y - dh * 0.5]};
}

/** The hooded rattler's body (feet centre x, y; height h) as one path: hood + head, shoulders, coat, two legs. */
function rattlerBody(x: number, y: number, h: number): string {
  const b = bust(x, y - 0.3 * h, 0.7 * h, true, -1);
  // every sub-path CLOCKWISE (nonzero fill: an opposite winding would punch a hole where the coat overlaps the bust)
  const coat = `M${f1(x - 0.25 * h)} ${f1(y - 0.28 * h)}L${f1(x - 0.23 * h)} ${f1(y - 0.62 * h)}H${f1(x + 0.23 * h)}L${f1(x + 0.25 * h)} ${f1(y - 0.28 * h)}Z`;
  const legs = `M${f1(x - 0.17 * h)} ${f1(y - 0.3 * h)}H${f1(x - 0.03 * h)}V${f1(y)}H${f1(x - 0.17 * h)}Z` + `M${f1(x + 0.03 * h)} ${f1(y - 0.3 * h)}H${f1(x + 0.17 * h)}V${f1(y)}H${f1(x + 0.03 * h)}Z`;
  return b + coat + legs;
}

/** A hooded attempter at a door rattling its handle (ink-dark on its LIGHT door: the doors are drawn by the scene,
 *  extras.tsx LightDoors), a cream rim on the sun side; `hop` = gives up and hops to the next door. */
export const Rattler: React.FC<RattlerSpec> = ({x, y, h, dh: dhIn, at, rattles, hop}) => {
  const t = useTime();
  const look = useLook();
  if (t < at) return null;
  const dh = dhIn ?? h * 1.1;
  let dx = x;
  let dy = y;
  let lift = 0;
  let air = false;
  let rattleAt = latest(rattles, t);
  if (hop && t >= hop.at) {
    const q = prog(t, hop.at, 0.34);
    dx = lerp(x, hop.to, E.inOutSine(q));
    dy = lerp(y, hop.toY ?? y, q);
    lift = Math.sin(q * Math.PI) * h * 0.38;
    if (q < 1) {
      rattleAt = undefined;
      air = true;
    }
  }
  // 4 shakes 0.133 s apart; each pops its marks for 3 frames (0.1 s), alternating sides, and jolts the body
  let shake = -1;
  if (rattleAt !== undefined && t < rattleAt + 0.53) shake = Math.floor((t - rattleAt) / 0.1333);
  const marksOn = shake >= 0 && t - rattleAt! - shake * 0.1333 < 0.1;
  const jig = shake >= 0 ? (shake % 2 ? -1 : 1) * h * 0.025 : 0;
  const pop = springAt(t, at, springs.pop);
  const fx = dx - h * 0.16 + jig; // the figure's feet centre
  const fy = dy - lift;
  const body = rattlerBody(fx, fy, h);
  const s = fx < SUN_X ? 1 : -1;
  const rw = Math.max(1.6, h * 0.035);
  const rim = bustRim(fx, fy - 0.3 * h, 0.7 * h, s, rw, true) + `M${f1(fx + s * 0.235 * h)} ${f1(fy - 0.6 * h)}L${f1(fx + s * 0.25 * h)} ${f1(fy - 0.3 * h)}L${f1(fx + s * (0.25 * h - rw))} ${f1(fy - 0.3 * h)}L${f1(fx + s * (0.235 * h - rw))} ${f1(fy - 0.6 * h)}Z`;
  const door = doorPaths(dx, dy, dh);
  const [hx, hy] = door.handle;
  // the arm: shoulder -> the handle (a limb: a thick body-coloured stroke)
  const arm = air ? `M${f1(fx + 0.2 * h)} ${f1(fy - 0.58 * h)}L${f1(fx + 0.34 * h)} ${f1(fy - 0.78 * h)}` : `M${f1(fx + 0.18 * h)} ${f1(fy - 0.58 * h)}Q${f1(hx - 0.02 * h)} ${f1(hy - 0.1 * h)} ${f1(hx + jig * 0.5)} ${f1(hy)}`;
  const mw = Math.max(2.2, h * 0.034);
  const L = h * 0.13;
  let marks = '';
  if (marksOn && !air) {
    if (shake % 2 === 0) {
      // right of the handle: three strokes fanning out
      marks = `M${f1(hx + L * 0.45)} ${f1(hy - L * 0.6)}l${f1(L * 0.9)} ${f1(-L * 0.45)}M${f1(hx + L * 0.55)} ${f1(hy)}l${f1(L)} 0M${f1(hx + L * 0.45)} ${f1(hy + L * 0.6)}l${f1(L * 0.9)} ${f1(L * 0.45)}`;
    } else {
      // left of the figure at shoulder height
      const lx = fx - 0.3 * h;
      const ly = fy - 0.62 * h;
      marks = `M${f1(lx)} ${f1(ly - L * 0.6)}l${f1(-L * 0.9)} ${f1(-L * 0.45)}M${f1(lx - L * 0.1)} ${f1(ly)}l${f1(-L)} 0M${f1(lx)} ${f1(ly + L * 0.6)}l${f1(-L * 0.9)} ${f1(L * 0.45)}`;
    }
  }
  const sc = pop < 1 ? `translate(${f1(dx)} ${f1(dy)}) scale(${pop.toFixed(3)}) translate(${f1(-dx)} ${f1(-dy)})` : undefined;
  const color = look.fills === 'color';
  return (
    <g transform={sc}>
      <path d={body} fill={color ? palette.ink : palette.white} stroke={color ? undefined : palette.ink} strokeWidth={1.2} />
      <path d={arm} fill="none" stroke={palette.ink} strokeWidth={h * 0.085} strokeLinecap="round" strokeLinejoin="round" />
      {color ? <path d={rim} fill={palette.cream} /> : null}
      {marks ? <path d={marks} fill="none" stroke={palette.ink} strokeWidth={mw} strokeLinecap="round" /> : null}
    </g>
  );
};

// ---------------------------------------------------------------- the pile (COUNTED: at the dome's foot and flank)

export type PileFig = {x: number; y: number; h: number; at: number; taps: number[]; hood: boolean; fill: 0 | 1; arm?: -1 | 1; flash?: number};

/** Pile slots, in fill order: `front` = ranks of busts along the dome's FOOT (x from x0 to x1, back ranks higher and
 *  smaller), `flank` = a short heap climbing the outside of the LEFT flank (only where the flank is at x >= 120 + 0.3 h). */
export function pileSlots(o: {seed: string; front: {x0: number; x1: number; y: number; h: [number, number]; ranks: number}; flank: {y0: number; y1: number; n: number; h: [number, number]}}): {x: number; y: number; h: number; rank: number; flank: boolean}[] {
  const out: {x: number; y: number; h: number; rank: number; flank: boolean}[] = [];
  const F = o.front;
  for (let r = 0; r < F.ranks; r++) {
    const hm = lerp(F.h[0], F.h[1], 0.5) * (1 - r * 0.1);
    let x = F.x0 + (r % 2 ? hm * 0.36 : 0) + rand(o.seed, `s${r}`) * 4;
    let i = 0;
    while (x < F.x1) {
      const h = lerp(F.h[0], F.h[1], rand(o.seed, `h${r}/${i}`)) * (1 - r * 0.1);
      out.push({x, y: F.y - r * hm * 0.42 + (rand(o.seed, `y${r}/${i}`) - 0.5) * 2, h, rank: r, flank: false});
      x += h * 0.66 + 2.5 + rand(o.seed, `p${r}/${i}`) * 2;
      i++;
    }
  }
  for (let k = 0; k < o.flank.n; k++) {
    const u = k / Math.max(1, o.flank.n - 1);
    const y = lerp(o.flank.y0, o.flank.y1, u);
    const h = lerp(o.flank.h[0], o.flank.h[1], rand(o.seed, `fh${k}`));
    const x = flankX(y - h * 0.6, -1) - h * 0.3 - 1;
    if (x - h * 0.33 >= 118) out.push({x, y, h, rank: F.ranks + k, flank: true});
  }
  return out;
}

/** The counted pile: batched ink / tealDark busts with a cream rim (sun side), raised arms whose fists are ON the glass;
 *  a tap pops two short cream ripple arcs at the fist (2 steps, 0.2 s) and nudges the arm; flash = the searchlight
 *  catches the figure (cream body + ink outline for 2 frames). */
export const Pile: React.FC<{figs: PileFig[]}> = ({figs}) => {
  const t = useTime();
  const look = useLook();
  if (look.fills !== 'color') return null;
  let body0 = '';
  let body1 = '';
  let lit = '';
  let rim = '';
  let arms = '';
  let ripples = '';
  for (const f of figs) {
    if (t < f.at) continue;
    const k = t < f.at + 0.067 ? 1.25 : 1;
    const h = f.h * k;
    const flashing = f.flash !== undefined && t >= f.flash && t < f.flash + 0.067;
    const b = bust(f.x, f.y, h, f.hood, f.x < DOME8.cx ? 1 : -1);
    if (flashing) lit += b;
    else if (f.fill) body1 += b;
    else body0 += b;
    rim += bustRim(f.x, f.y, h, f.x < SUN_X ? 1 : -1, Math.max(1.6, h * 0.08), f.hood);
    if (f.arm) {
      const tap = latest(f.taps, t);
      const tapping = tap !== undefined && t < tap + 0.2;
      const a = armUp(f.x, f.y, h, f.arm, tapping ? 0.6 : 1);
      arms += a.d;
      if (tapping) {
        const q = t - tap! < 0.1 ? 0 : 1;
        const [px, py] = a.fist;
        for (const rr of [h * (0.2 + 0.1 * q), h * (0.36 + 0.12 * q)]) {
          // a ripple ON the glass: a short arc over the fist (its open side down), the outer one wider
          const a0 = (-150 * Math.PI) / 180;
          const a1 = (-30 * Math.PI) / 180;
          ripples += `M${f1(px + Math.cos(a0) * rr)} ${f1(py + Math.sin(a0) * rr)}A${f1(rr)} ${f1(rr)} 0 0 1 ${f1(px + Math.cos(a1) * rr)} ${f1(py + Math.sin(a1) * rr)}`;
        }
      }
    }
  }
  if (!body0 && !body1 && !lit) return null;
  const aw = figs.length ? Math.max(2, figs[0].h * 0.12) : 2;
  return (
    <>
      {arms ? <path d={arms} stroke={palette.ink} strokeWidth={aw} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
      {body0 ? <path d={body0} fill={palette.ink} /> : null}
      {body1 ? <path d={body1} fill={palette.tealDark} /> : null}
      {lit ? <path d={lit} fill={palette.cream} stroke={palette.ink} strokeWidth={1.2} /> : null}
      {rim ? <path d={rim} fill={palette.cream} /> : null}
      {ripples ? <path d={ripples} stroke={palette.cream} strokeWidth={2.4} strokeLinecap="round" fill="none" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- the flood ('millions': OUTSIDE the dome)

export type CrowdFig = {x: number; y: number; h: number; at: number; rank: number; fill: 0 | 1; hood: boolean; arm?: -1 | 1};

/** A band of busts: `ranks` rows (back rank higher and smaller), shoulder to shoulder with a 2-4 px gap over x0..x1,
 *  base at yBase (+- jy); pop times = at + (the figure's share of span) in `order` (rand | ltr | out-from x). Fill
 *  alternates ink / tealDark per figure; `arms` raised arms per rank. `skip` drops figures (inside the dome, behind the
 *  board ...). */
export function crowdBand(
  seed: string,
  x0: number,
  x1: number,
  yBase: number,
  h0: number,
  h1: number,
  ranks: number,
  at: number,
  span: number,
  o: {jy?: number; gap?: number; order?: 'rand' | 'ltr' | {from: number}; skip?: (x: number, y: number, h: number) => boolean; rank0?: number; arms?: number; hoods?: number} = {},
): CrowdFig[] {
  const out: CrowdFig[] = [];
  for (let r = ranks - 1; r >= 0; r--) {
    const hm = lerp(h0, h1, 0.5) * (1 - r * 0.1);
    let x = x0 + rand(seed, `s${r}`) * hm * 0.4 + (r % 2 ? hm * 0.33 : 0);
    let i = 0;
    const row: CrowdFig[] = [];
    while (x < x1) {
      const h = lerp(h0, h1, rand(seed, `h${r}/${i}`)) * (1 - r * 0.1);
      const y = yBase - r * hm * 0.45 + (rand(seed, `y${r}/${i}`) - 0.5) * 2 * (o.jy ?? 1.5);
      const gapHere = o.gap !== undefined && rand(seed, `g${r}/${Math.floor(i / 5)}`) < o.gap;
      if (!gapHere && !(o.skip && o.skip(x, y, h))) {
        const ord = o.order ?? 'rand';
        const u = ord === 'ltr' ? (x - x0) / (x1 - x0) : ord === 'rand' ? rand(seed, `a${r}/${i}`) : Math.min(1, Math.abs(x - ord.from) / 700);
        row.push({x, y, h, at: at + u * span, rank: (o.rank0 ?? 0) + (ranks - 1 - r), fill: (i % 2) as 0 | 1, hood: rand(seed, `hd${r}/${i}`) < (o.hoods ?? 0.6)});
      }
      x += h * 0.66 + 2 + rand(seed, `p${r}/${i}`) * 2;
      i++;
    }
    // one or two raised arms per rank (seeded picks, spread out)
    const na = Math.min(row.length, o.arms ?? 2);
    for (let a = 0; a < na; a++) {
      const j = Math.floor(((a + 0.3 + rand(seed, `ar${r}/${a}`) * 0.4) / na) * row.length);
      if (row[j]) row[j].arm = rand(seed, `as${r}/${a}`) < 0.5 ? -1 : 1;
    }
    out.push(...row);
  }
  return out;
}

/** Skip helper: outside-the-dome only (a figure's head inside the glass is dropped). */
export const outsideDome = (x: number, y: number, h: number) => inDome(x, y - h * 0.4) || inDome(x - h * 0.33, y - h * 0.5) || inDome(x + h * 0.33, y - h * 0.5) || inDome(x, y - h);

/** The flood: per rank the ink bodies, the tealDark bodies, the raised arms and the cream rims (sun side), back ranks
 *  first. Pops 1.25x for 2 frames; after `flickerAt` a seeded third of the crowd bobs 1-2 px in 0.1 s steps (it
 *  seethes), the raised arms pump. */
export const Flood: React.FC<{figs: CrowdFig[]; flickerAt?: number; seed: string}> = ({figs, flickerAt, seed}) => {
  const t = useTime();
  const look = useLook();
  if (look.fills !== 'color') return null;
  const step = flickerAt !== undefined && t >= flickerAt ? Math.floor((t - flickerAt) / 0.1) : -1;
  const b0: string[] = [];
  const b1: string[] = [];
  const rims: string[] = [];
  const arms: string[] = [];
  const aw: number[] = [];
  figs.forEach((f, i) => {
    if (t < f.at) return;
    const k = t < f.at + 0.067 ? 1.25 : 1;
    const h = f.h * k;
    const bob = step >= 0 && rand(seed, `f${i}`) < 0.35 && (step + i) % 2 === 0 ? -Math.max(1, h * 0.06) : 0;
    const y = f.y + bob;
    const d = bust(f.x, y, h, f.hood, rand(seed, `l${i}`) < 0.5 ? -1 : 1);
    if (f.fill) b1[f.rank] = (b1[f.rank] ?? '') + d;
    else b0[f.rank] = (b0[f.rank] ?? '') + d;
    rims[f.rank] = (rims[f.rank] ?? '') + bustRim(f.x, y, h, f.x < SUN_X ? 1 : -1, Math.max(1.2, h * 0.08), f.hood);
    if (f.arm) {
      const pump = Math.floor((t - f.at) / 0.2 + rand(seed, `ap${i}`) * 2) % 2;
      arms[f.rank] = (arms[f.rank] ?? '') + armUp(f.x, y, h, f.arm, pump ? 0.75 : 1).d;
      aw[f.rank] = Math.max(1.6, h * 0.12);
    }
  });
  const out: React.ReactNode[] = [];
  const n = Math.max(b0.length, b1.length);
  for (let r = 0; r < n; r++) {
    if (arms[r]) out.push(<path key={`a${r}`} d={arms[r]} stroke={palette.ink} strokeWidth={aw[r]} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
    if (b0[r]) out.push(<path key={`b${r}`} d={b0[r]} fill={palette.ink} />);
    if (b1[r]) out.push(<path key={`c${r}`} d={b1[r]} fill={palette.tealDark} />);
    if (rims[r]) out.push(<path key={`r${r}`} d={rims[r]} fill={palette.cream} />);
  }
  return out.length ? <>{out}</> : null;
};

// ---------------------------------------------------------------- the near crowd ('millions': our coping's foreground)

export type NearFig = {x: number; y: number; h: number; at: number; fill: 0 | 1; hood: boolean; arm?: -1 | 1; seed: string};

/** Big busts (90-120 px) pushing in behind our coping (their lower half hidden by it): spring pop, ink outline 2.4,
 *  a cream rim on the sun side, a raised fist that pumps; they sway 1-2 px. */
export const NearCrowd: React.FC<{figs: NearFig[]}> = ({figs}) => {
  const t = useTime();
  const look = useLook();
  const color = look.fills === 'color';
  return (
    <>
      {figs.map((f) => {
        if (t < f.at) return null;
        const k = springAt(t, f.at, springs.pop);
        const sway = Math.sin(t * 2.1 + rand(f.seed, 'ph') * 6) * 1.5;
        const x = f.x + sway;
        const h = f.h;
        const s = x < SUN_X ? 1 : -1;
        const d = bust(x, f.y, h, f.hood, s);
        const arm = f.arm ? armUp(x, f.y, h, f.arm, Math.floor((t - f.at) / 0.22) % 2 ? 0.7 : 1) : undefined;
        return (
          <g key={f.seed} transform={k < 1 ? `translate(${f1(x)} ${f1(f.y)}) scale(${k.toFixed(3)}) translate(${f1(-x)} ${f1(-f.y)})` : undefined}>
            {arm ? <path d={arm.d} stroke={palette.ink} strokeWidth={h * 0.11} strokeLinecap="round" strokeLinejoin="round" fill="none" /> : null}
            <path d={d} fill={color ? (f.fill ? palette.tealDark : palette.ink) : palette.white} stroke={palette.ink} strokeWidth={2.4} strokeLinejoin="round" />
            {color ? <path d={bustRim(x, f.y, h, s, Math.max(2.4, h * 0.05), f.hood)} fill={palette.cream} /> : null}
          </g>
        );
      })}
    </>
  );
};
