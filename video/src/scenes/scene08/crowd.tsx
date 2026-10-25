// S08 attempters (fix round 2; fix round 3b; A1 fix round 1): every hooded figure in the scene, drawn to READ as people
// at phone size.
//   - bustParts(): a back-view HEAD-AND-SHOULDERS silhouette whose HOOD is the dominant shape (A1 fix round 1: a cowl
//     with a pointed peak ~0.2 h above a bare head, ink-dark over a tealDark / ochre coat: hackers, not a concert
//     crowd), the reference artist's back-view crowd (ref f_5.5 / ref2 f_33); a lite LOD (quads) for the far figures
//     (< 12 px); a cream rim stroke on the sun side (hoodRim); a rare arm REACHES toward the dome (armReach).
//   - Rattler (fix round 3b): figures of 50 px and taller are reference-style BACK-VIEW PEOPLE (ref2 f_1 / f_33): a
//     coloured hoodie (tealDark / ochre / teal) with a hood peak and its seam, a hem band, a 3.4 px ink outline with open
//     corners over a slightly misregistered fill, a cream rim on the sun side, the rattling arm a jointed sleeve with a
//     cuff and a sand hand (kit FigureArm), trousers one value lighter (sage / tan / sand) with a leg split line and
//     ink shoe soles; each rattle = 4 shakes, every shake pops 3 ink marks for 3 frames on alternating sides. The 30-40 px
//     row-2 rattlers stay fill-only dark silhouettes (bust + coat + legs).
//   - Pile (A1 fix round 1): the COUNTED attempters HEAPED UP against the OUTSIDE of the dome's left flank (heapSlots: a
//     mound of hooded backs leaning in, hands on the glass), growing from the foot corner per counted word, and on
//     'millions' climbing on over the shoulder (climberSlots); a tap pops 3 short radiating ink impact ticks at a hand
//     on the glass; GlassPulse rings the glass where the heap hits it.
//   - Flood: the 'millions' crowd: packed ROOFTOP ranks on every building of rows 0-2 (roofs.ts) plus street clumps,
//     hooded (0.9), tealDark / ochre coats under ink hoods, a cream rim on the sun side; batched per rank.
//   - NearCrowd: big hooded backs (the near rattlers' hoodie recipe) RISING from behind our coping on 'millions'.
// Everything is time-driven (scene seconds), pops (1.25x for 2 frames or the 7 % spring), no fades.
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {useLook} from '../../lib/exit';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {FigureArm} from '../shared/props';
import {DOME8, domeY, flankX, inDome} from './layout';
import {ROOFS} from './roofs';

const SUN_X = 700;
const f1 = (v: number) => v.toFixed(1);
const latest = (ts: number[], t: number): number | undefined => {
  let r: number | undefined;
  for (const x of ts) if (x <= t) r = x;
  return r;
};

// ---------------------------------------------------------------- the hooded bust (head + shoulders, back view)

/** A1 fix round 1 (the reviewers: the 'millions' payoff read as a cheering concert crowd): every attempter's HOOD is the
 *  dominant silhouette: a cowl wider than a head, sitting straight on the shoulders (no neck) with a soft POINTED tip
 *  ~0.14 h above where a bare head would end (a taller spike read as pine cones / crops in a crowd), filled ink-dark
 *  (one value darker than the coat), over a coat hump. `coat` and `head` are separate paths so the two values batch
 *  apart; `lite` = the far LOD (quads only); `rot` (deg, + = leaning right) tilts the whole
 *  bust about its base centre. Without `hood`: a round ink head (hair). Base centre (x, y), height h (base to the top
 *  of a bare head). */
export function bustParts(x: number, y: number, h: number, hood: boolean, lean = 1, lite = false, rot = 0): {coat: string; head: string} {
  const c = Math.cos((rot * Math.PI) / 180);
  const sn = Math.sin((rot * Math.PI) / 180);
  const P = (dx: number, dy: number) => {
    const u = dx * h;
    const v = -dy * h;
    return `${f1(x + u * c - v * sn)} ${f1(y + u * sn + v * c)}`;
  };
  const coat = lite
    ? `M${P(-0.33, 0)}L${P(-0.33, 0.36)}Q${P(-0.33, 0.53)} ${P(0, 0.53)}Q${P(0.33, 0.53)} ${P(0.33, 0.36)}L${P(0.33, 0)}Z`
    : `M${P(-0.33, 0)}L${P(-0.33, 0.34)}C${P(-0.33, 0.48)} ${P(-0.24, 0.52)} ${P(-0.12, 0.53)}L${P(0.12, 0.53)}C${P(0.24, 0.52)} ${P(0.33, 0.48)} ${P(0.33, 0.34)}L${P(0.33, 0)}Z`;
  let head: string;
  if (hood) {
    const l = lean;
    head = lite
      ? `M${P(-0.2, 0.42)}Q${P(-0.27, 1.0)} ${P(0.05 * l, 1.12)}Q${P(0.27, 1.0)} ${P(0.2, 0.42)}Z`
      : `M${P(-0.19, 0.4)}C${P(-0.25, 0.64)} ${P(-0.24, 0.95)} ${P(-0.08 + 0.03 * l, 1.05)}L${P(0.05 * l, 1.12)}L${P(0.1 + 0.03 * l, 1.04)}C${P(0.24, 0.95)} ${P(0.25, 0.64)} ${P(0.19, 0.4)}Z`;
  } else {
    head = lite
      ? `M${P(-0.2, 0.8)}Q${P(-0.2, 1)} ${P(0, 1)}Q${P(0.2, 1)} ${P(0.2, 0.8)}Q${P(0.2, 0.56)} ${P(0, 0.56)}Q${P(-0.2, 0.56)} ${P(-0.2, 0.8)}Z`
      : `M${P(-0.2, 0.8)}C${P(-0.2, 0.91)} ${P(-0.11, 1)} ${P(0, 1)}C${P(0.11, 1)} ${P(0.2, 0.91)} ${P(0.2, 0.8)}C${P(0.2, 0.69)} ${P(0.11, 0.55)} ${P(0, 0.55)}C${P(-0.11, 0.55)} ${P(-0.2, 0.69)} ${P(-0.2, 0.8)}Z`;
  }
  return {coat, head};
}

/** One closed path (coat + head) for the fill-only uses (the small rattlers). */
export function bust(x: number, y: number, h: number, hood: boolean, lean = 1): string {
  const b = bustParts(x, y, h, hood, lean);
  return b.coat + b.head;
}

/** The sun-side rim of bustParts as a STROKE path (stroke it cream, rw wide): down the sun side `s` of the hood / head
 *  and the outer shoulder, kept half a stroke inside the silhouette. */
export function hoodRim(x: number, y: number, h: number, s: number, hood: boolean, rw: number, rot = 0, shoulder = true): string {
  const c = Math.cos((rot * Math.PI) / 180);
  const sn = Math.sin((rot * Math.PI) / 180);
  const o = (-s * rw * 0.5) / h;
  const P = (dx: number, dy: number) => {
    const u = (dx + o) * h;
    const v = -dy * h;
    return `${f1(x + u * c - v * sn)} ${f1(y + u * sn + v * c)}`;
  };
  const top = hood ? `M${P(s * 0.09, 1.04)}Q${P(s * 0.245, 0.92)} ${P(s * 0.21, 0.56)}` :`M${P(s * 0.03, 0.98)}Q${P(s * 0.2, 0.96)} ${P(s * 0.19, 0.74)}`;
  return shoulder ? top + `M${P(s * 0.22, 0.52)}Q${P(s * 0.33, 0.5)} ${P(s * 0.33, 0.3)}` : top;
}

/** A REACHING arm (A1 fix round 1: replaces the straight raised arms that read as cheering): from the shoulder on side s
 *  out and forward-up at ~40 deg toward the dome / the city (a stroke path; `k` < 1 pulls it in). */
export function armReach(x: number, y: number, h: number, s: number, k = 1, rot = 0): string {
  const c = Math.cos((rot * Math.PI) / 180);
  const sn = Math.sin((rot * Math.PI) / 180);
  const P = (dx: number, dy: number) => {
    const u = dx * h;
    const v = -dy * h;
    return `${f1(x + u * c - v * sn)} ${f1(y + u * sn + v * c)}`;
  };
  return `M${P(s * 0.22, 0.46)}L${P(s * (0.22 + 0.2 * k), 0.46 + 0.1 * k)}L${P(s * (0.22 + 0.36 * k), 0.46 + 0.3 * k)}`;
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
  /** Hoodie / trousers colours (figures >= 50 px; default tealDark / sage). */
  coat?: string;
  legs?: string;
  seed: string;
};

/** One light door (the figure's door): cream fill (peach for every third seed), ink sides + top, a dark handle. */
export function doorPaths(x: number, y: number, dh: number): {fill: string; ink: string; handle: [number, number]} {
  const w = dh * 0.46;
  const fill = `M${f1(x - w / 2)} ${f1(y)}V${f1(y - dh)}H${f1(x + w / 2)}V${f1(y)}Z`;
  const ink = `M${f1(x - w / 2)} ${f1(y + 1)}V${f1(y - dh)}H${f1(x + w / 2)}V${f1(y + 1)}`;
  return {fill, ink, handle: [x + w * 0.28, y - dh * 0.5]};
}

/** The small (row-2, 30-40 px) rattler's body as one fill-only path: hood + head, shoulders, coat, two legs. */
function rattlerBody(x: number, y: number, h: number): string {
  const b = bust(x, y - 0.3 * h, 0.7 * h, true, -1);
  // every sub-path CLOCKWISE (nonzero fill: an opposite winding would punch a hole where the coat overlaps the bust)
  const coat = `M${f1(x - 0.25 * h)} ${f1(y - 0.28 * h)}L${f1(x - 0.23 * h)} ${f1(y - 0.62 * h)}H${f1(x + 0.23 * h)}L${f1(x + 0.25 * h)} ${f1(y - 0.28 * h)}Z`;
  const legs = `M${f1(x - 0.17 * h)} ${f1(y - 0.3 * h)}H${f1(x - 0.03 * h)}V${f1(y)}H${f1(x - 0.17 * h)}Z` + `M${f1(x + 0.03 * h)} ${f1(y - 0.3 * h)}H${f1(x + 0.17 * h)}V${f1(y)}H${f1(x + 0.03 * h)}Z`;
  return b + coat + legs;
}

/** Fix round 3b: a reference-style BACK-VIEW PERSON in a hoodie (feet centre x, y; height h; ref2 f_1 / f_33): the
 *  hoodie (hood with a peak, rounded shoulders, a slightly flared body to the hem) as one closed contour, the trousers
 *  (one value lighter) with a crotch notch, ink shoe soles; plus the hood seam, the hem band line, the leg split line
 *  and the cream rim strip on the sun side `s`. */
export function hoodieFig(x: number, y: number, h: number, s: number) {
  const P = (dx: number, dy: number) => `${f1(x + dx * h)} ${f1(y - dy * h)}`;
  // hood + body contour, clockwise from the hem's left corner
  const body =
    `M${P(-0.205, 0.4)}` +
    `L${P(-0.215, 0.7)}` +
    `C${P(-0.22, 0.77)} ${P(-0.18, 0.8)} ${P(-0.12, 0.805)}` + // left shoulder
    `C${P(-0.135, 0.86)} ${P(-0.13, 0.94)} ${P(-0.06, 0.975)}` + // hood's left side
    `L${P(0.015, 1.0)}` + // the peak
    `C${P(0.12, 0.965)} ${P(0.14, 0.87)} ${P(0.12, 0.805)}` + // hood's right side
    `C${P(0.18, 0.8)} ${P(0.22, 0.77)} ${P(0.215, 0.7)}` + // right shoulder
    `L${P(0.205, 0.4)}Z`;
  const legs = `M${P(-0.175, 0.42)}L${P(-0.165, 0.035)}H${f1(x - 0.015 * h)}L${P(0, 0.29)}L${f1(x + 0.015 * h)} ${f1(y - 0.035 * h)}H${f1(x + 0.165 * h)}L${P(0.175, 0.42)}Z`;
  const shoes = `M${P(-0.19, 0.045)}h${f1(0.17 * h)}v${f1(0.045 * h)}h${f1(-0.17 * h)}Z` + `M${P(0.02, 0.045)}h${f1(0.17 * h)}v${f1(0.045 * h)}h${f1(-0.17 * h)}Z`;
  const seams = `M${P(0.015, 0.99)}Q${P(0.03, 0.9)} ${P(0.0, 0.81)}` + `M${P(-0.2, 0.455)}L${P(0.2, 0.455)}` + `M${P(-0.06, 0.8)}Q${P(0, 0.77)} ${P(0.06, 0.8)}`;
  const legInk = `M${P(-0.175, 0.4)}L${P(-0.165, 0.04)}M${P(0.175, 0.4)}L${P(0.165, 0.04)}M${P(0, 0.29)}L${P(0, 0.05)}`;
  // rim: a strip down the sun-side edge of the hood and the body
  const rw = Math.max(0.022, 3 / h);
  const rim =
    `M${P(s * 0.03, 0.985)}C${P(s * 0.12, 0.955)} ${P(s * 0.135, 0.87)} ${P(s * 0.115, 0.81)}L${P(s * (0.115 - rw), 0.815)}C${P(s * (0.12 - rw), 0.87)} ${P(s * (0.105 - rw), 0.94)} ${P(s * 0.025, 0.97)}Z` +
    `M${P(s * 0.17, 0.79)}C${P(s * 0.21, 0.775)} ${P(s * 0.217, 0.74)} ${P(s * 0.213, 0.7)}L${P(s * 0.203, 0.42)}L${P(s * (0.203 - rw), 0.42)}L${P(s * (0.213 - rw), 0.7)}C${P(s * (0.21 - rw), 0.75)} ${P(s * (0.19 - rw), 0.77)} ${P(s * 0.165, 0.78)}Z`;
  return {body, legs, shoes, seams, legInk, rim, shoulder: (sd: number): [number, number] => [x + sd * 0.17 * h, y - 0.76 * h]};
}

/** A hooded attempter at a door rattling its handle (on its LIGHT door: the doors are drawn by the scene, extras.tsx
 *  LightDoors); `hop` = gives up and hops to the next door. h >= 50: a hoodieFig person (fix round 3b); smaller: the
 *  fill-only ink silhouette with a cream rim on the sun side. */
export const Rattler: React.FC<RattlerSpec> = ({x, y, h, dh: dhIn, at, rattles, hop, coat = palette.tealDark, legs = palette.sage, seed}) => {
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
  const s = fx < SUN_X ? 1 : -1;
  const door = doorPaths(dx, dy, dh);
  const [hx, hy] = door.handle;
  const mw = Math.max(2.2, h * 0.034);
  const L = Math.max(7, h * 0.13);
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
  if (h >= 50) {
    const F = hoodieFig(fx, fy, h, s);
    const W = h >= 80 ? 3.4 : 2.8;
    const sh = F.shoulder(1);
    const shL = F.shoulder(-1);
    // the rattling arm: a jointed sleeve to the handle (in the air: raised); the other hangs by the side
    const hand: [number, number] = air ? [fx + 0.36 * h, fy - 1.02 * h] : [hx + jig * 0.5 - 0.02 * h, hy + 0.01 * h];
    const handL: [number, number] = [fx - 0.25 * h, fy - (air ? 0.62 : 0.43) * h];
    return (
      <g transform={sc}>
        <FigureArm sh={shL} hand={handL} w={0.11 * h} coat={color ? coat : palette.white} W={W * 0.85} side={-1} bend={air ? 40 : 8} seed={`${seed}/al`} />
        <Fill d={F.legs} color={color ? legs : palette.white} seed={`${seed}/lg`} />
        <Fill d={F.shoes} color={palette.ink} offset={false} seed={`${seed}/sh`} />
        <Fill d={F.body} color={color ? coat : palette.white} seed={`${seed}/bd`} />
        {color ? <Fill d={F.rim} color={palette.cream} offset={false} seed={`${seed}/rm`} /> : null}
        <Ink d={F.body} width={W} open={0.06} taper={false} seed={`${seed}/bi`} />
        <Ink d={F.legInk} width={W * 0.8} taper={false} seed={`${seed}/li`} />
        <Ink d={F.seams} width={W * 0.6} taper={false} color={color ? palette.ink : palette.ink} seed={`${seed}/se`} />
        <FigureArm sh={sh} hand={hand} w={0.12 * h} coat={color ? coat : palette.white} W={W * 0.85} side={1} bend={air ? 30 : 25} seed={`${seed}/ar`} />
        {marks ? <path d={marks} fill="none" stroke={palette.ink} strokeWidth={mw} strokeLinecap="round" /> : null}
      </g>
    );
  }
  const body = rattlerBody(fx, fy, h);
  const rw = Math.max(1.6, h * 0.035);
  // A1 fix round 1: the rim follows the pointed hood (hoodRim, a stroke) + the coat's sun-side edge
  const rimHood = hoodRim(fx, fy - 0.3 * h, 0.7 * h, s, true, rw * 1.2);
  const rim = `M${f1(fx + s * 0.235 * h)} ${f1(fy - 0.6 * h)}L${f1(fx + s * 0.25 * h)} ${f1(fy - 0.3 * h)}L${f1(fx + s * (0.25 * h - rw))} ${f1(fy - 0.3 * h)}L${f1(fx + s * (0.235 * h - rw))} ${f1(fy - 0.6 * h)}Z`;
  // the arm: shoulder -> the handle (a limb: a thick body-coloured stroke)
  const arm = air ? `M${f1(fx + 0.2 * h)} ${f1(fy - 0.58 * h)}L${f1(fx + 0.34 * h)} ${f1(fy - 0.78 * h)}` : `M${f1(fx + 0.18 * h)} ${f1(fy - 0.58 * h)}Q${f1(hx - 0.02 * h)} ${f1(hy - 0.1 * h)} ${f1(hx + jig * 0.5)} ${f1(hy)}`;
  return (
    <g transform={sc}>
      <path d={body} fill={color ? palette.ink : palette.white} stroke={color ? undefined : palette.ink} strokeWidth={1.2} />
      <path d={arm} fill="none" stroke={palette.ink} strokeWidth={h * 0.085} strokeLinecap="round" strokeLinejoin="round" />
      {color ? <path d={rim} fill={palette.cream} /> : null}
      {color ? <path d={rimHood} fill="none" stroke={palette.cream} strokeWidth={rw * 1.2} strokeLinecap="round" /> : null}
      {marks ? <path d={marks} fill="none" stroke={palette.ink} strokeWidth={mw} strokeLinecap="round" /> : null}
    </g>
  );
};

// ---------------------------------------------------------------- the heap (COUNTED: OUTSIDE the dome's left flank)

/** A counted attempter. `rot` = the lean toward the dome (deg); `reachTo` = the hand ON the glass (wall figures and the
 *  shoulder climbers); `reach` = a free arm reaching up toward the dome (climbing the backs in front). A1 fix round 2:
 *  `fill` = the hoodie colour (0 teal, 1 tealDark, 2 ochre, 3 sand), `dark` = an ink-dark hood (about 1 in 4);
 *  `recoil` = the searchlight catches it: it pops 1.2x for 2 frames with 3 impact ticks at its hand. */
export type PileFig = {x: number; y: number; h: number; at: number; taps: number[]; hood: boolean; fill: number; dark?: boolean; rot: number; reachTo?: [number, number]; reach?: boolean; flash?: number; lite?: boolean};

/** An arm from the (rotated) shoulder on side s to a fist at `to`; `k` < 1 pulls it back (a tap). The elbow bows down. */
function armTo(x: number, y: number, h: number, s: number, to: [number, number], k = 1, rot = 0): {d: string; fist: [number, number]} {
  const c = Math.cos((rot * Math.PI) / 180);
  const sn = Math.sin((rot * Math.PI) / 180);
  const u = s * 0.22 * h;
  const v = -0.46 * h;
  const sx = x + u * c - v * sn;
  const sy = y + u * sn + v * c;
  const fx = sx + (to[0] - sx) * k;
  const fy = sy + (to[1] - sy) * k;
  const ex = (sx + fx) / 2 - s * 0.03 * h;
  const ey = (sy + fy) / 2 + 0.08 * h;
  return {d: `M${f1(sx)} ${f1(sy)}L${f1(ex)} ${f1(ey)}L${f1(fx)} ${f1(fy)}`, fist: [fx, fy]};
}

export type HeapSlot = {x: number; y: number; h: number; wall: boolean; rot: number; d: number};

/** A1 fix round 1 (the reviewers: 'the counted pile looks INSIDE the glass dome, a stadium crowd'): the counted
 *  attempters HEAP UP against the OUTSIDE of the dome's left flank, a mound of hooded backs (hands on the glass), never
 *  inside the arc's silhouette. The mound rises from the base line (feet `base`, hidden behind row 2's roofs: A1 fix
 *  round 2) at x `left` to the wall at height `top` (a bulging slope); figures stand in staggered rows `dy` apart with
 *  2-3 px GAPS between them (A1 fix round 2: they touched and merged into one cone), each body left of the flank
 *  (shoulder and hood). Every figure turns 3/4 toward the flank (leaning 8-12 deg right); the ones touching the wall are
 *  `wall` (hands on the glass). `d` = the distance from the foot corner (the heap GROWS from the corner outward and
 *  upward: the scene pops the slots in `d` order). Sorted back (high) to front (low) for drawing. */
export function heapSlots(o: {seed: string; base: number; top: number; left: number; h: [number, number]; dy: number; gap: number; minX: number; jx?: number; jy?: number; rot?: [number, number]}): HeapSlot[] {
  const out: HeapSlot[] = [];
  const hm = (o.h[0] + o.h[1]) / 2;
  const wx = flankX(o.top, -1);
  const surf = (x: number) => o.base - (o.base - o.top) * Math.pow(Math.max(0, Math.min(1, (x - o.left) / Math.max(1, wx - o.left))), 0.7);
  const corner = flankX(o.base, -1);
  const rows = Math.ceil((o.base - o.top) / o.dy) + 1;
  for (let j = 0; j < rows; j++) {
    let x = o.minX + (j % 2 ? hm * 0.38 : 0) + rand(o.seed, `x${j}`) * 4;
    let i = 0;
    while (x < DOME8.cx) {
      const h = lerp(o.h[0], o.h[1], rand(o.seed, `h${j}/${i}`)) * (1 - 0.1 * (j / rows));
      // A1 fix round 3: +-jy / +-jx jitter per slot (the regular tiers read as a choir)
      const y = o.base - j * o.dy + (rand(o.seed, `y${j}/${i}`) - 0.5) * 2 * (o.jy ?? 1.5);
      // outside the glass: the shoulder corner and the hood's sun side clear of the flank (leaning right ~10 deg)
      const xm = Math.min(flankX(y - 0.5 * h, -1) - 0.42 * h - 1, flankX(y - 1.1 * h, -1) - 0.42 * h - 1);
      if (x > xm) break;
      const xj = Math.max(o.minX, Math.min(xm, x + (rand(o.seed, `jx${j}/${i}`) - 0.5) * 2 * (o.jx ?? 0)));
      if (y - 1.05 * h >= surf(xj) - 6) {
        const wall = xj > xm - 0.5 * h;
        const [r0, r1] = o.rot ?? [8, 12];
        const rot = r0 + rand(o.seed, `r${j}/${i}`) * (r1 - r0);
        out.push({x: xj, y, h, wall, rot, d: Math.hypot((corner - xj) * 0.85, o.base - y)});
      }
      // A1 fix round 2: a 2-3 px gap between neighbours (coat width 0.66 h)
      x += 0.66 * h + o.gap + rand(o.seed, `p${j}/${i}`) * 1.2;
      i++;
    }
  }
  return out.sort((a, b) => a.y - b.y);
}

/** The shoulder climbers ('millions' carries the heap up over the shoulder): standing ON the glass (feet on the arc at
 *  x0..x1, the body above it: outside), leaning up-slope. */
export function climberSlots(o: {seed: string; x0: number; x1: number; n: number; h: [number, number]}): HeapSlot[] {
  const out: HeapSlot[] = [];
  for (let k = 0; k < o.n; k++) {
    const u = k / Math.max(1, o.n - 1);
    const h = lerp(o.h[0], o.h[1], rand(o.seed, `fh${k}`));
    const x = lerp(o.x0, o.x1, u) + (rand(o.seed, `fx${k}`) - 0.5) * 6;
    // the arc's slope at x: lean into it (up-slope = right on the left shoulder)
    const slope = (domeY(x + 4) - domeY(x - 4)) / 8;
    const rot = Math.max(6, Math.min(26, (-Math.atan(slope) * 180) / Math.PI * 0.6));
    out.push({x, y: domeY(x) + 2, h, wall: true, rot, d: 0});
  }
  return out;
}

/** The heap's hoodie colours (A1 fix round 3: teal, ochre, cream, clay, sage, tealDark: coat colours with variety). */
export const PILE_COATS = [palette.teal, palette.brown, palette.cream, palette.tan, palette.sage, palette.tealDark];

/** A 3/4-turned hooded bust (back view turned toward the flank on the right): `bustParts` plus the sand cheek sliver in
 *  the hood's right opening and the hood shifted 0.04 h toward the glass. */
function pileBust(x: number, y: number, h: number, rot: number) {
  const b = bustParts(x, y, h, true, 1, false, rot);
  const c = Math.cos((rot * Math.PI) / 180);
  const sn = Math.sin((rot * Math.PI) / 180);
  const P = (dx: number, dy: number) => {
    const u = dx * h;
    const v = -dy * h;
    return `${f1(x + u * c - v * sn)} ${f1(y + u * sn + v * c)}`;
  };
  // the cheek: a narrow sand crescent inside the hood's right edge, from the hood's middle down to the jaw
  const cheek = `M${P(0.15, 0.9)}C${P(0.2, 0.82)} ${P(0.2, 0.62)} ${P(0.15, 0.5)}C${P(0.1, 0.58)} ${P(0.09, 0.78)} ${P(0.15, 0.9)}Z`;
  // the sun-side rim (3 px): down the hood's right side and the right shoulder
  const rim = `M${P(0.1, 1.03)}Q${P(0.22, 0.95)} ${P(0.215, 0.86)}` + `M${P(0.21, 0.52)}Q${P(0.31, 0.5)} ${P(0.315, 0.32)}`;
  return {coat: b.coat, head: b.head, cheek, rim};
}

/** The counted heap: each figure drawn WHOLE, back (high) to front (low), so a nearer figure covers the one behind (A1
 *  fix round 2, the reviewers: 'identical black teardrops / a pine cone'): a 3/4-turned hoodie in a COAT colour (teal /
 *  tealDark / ochre / sand; an ink-dark hood on ~1 in 4) with a 1.6 px ink outline, a sand cheek sliver toward the
 *  glass, a 3 px cream rim on the sun side, and for the wall figures a coat sleeve with a SAND HAND DOT on the glass.
 *  A tap pops 3 radiating ink impact ticks at the hand (2 steps, 5 frames) and pulls the arm back; flash = the
 *  searchlight catches the figure: cream for 3 frames, a 1.2x recoil for 2 frames and 3 impact ticks. Pops 1.25x for 2
 *  frames about its base. */
export const Pile: React.FC<{figs: PileFig[]}> = ({figs}) => {
  const t = useTime();
  const look = useLook();
  if (look.fills !== 'color') return null;
  const out: React.ReactNode[] = [];
  let ticks = '';
  figs.forEach((f, i) => {
    if (t < f.at) return;
    const caught = f.flash !== undefined && t >= f.flash && t < f.flash + 0.067;
    const k = t < f.at + 0.067 ? 1.25 : caught ? 1.2 : 1;
    const h = f.h * k;
    const flashing = f.flash !== undefined && t >= f.flash && t < f.flash + 0.1;
    const b = pileBust(f.x, f.y, h, f.rot);
    const aw = Math.max(2.6, f.h * 0.12);
    const tap = latest(f.taps, t);
    const tapping = tap !== undefined && t < tap + 0.167;
    const coat = PILE_COATS[f.fill % PILE_COATS.length];
    let arm = '';
    let hand: [number, number] | undefined;
    const tickAt = (p: [number, number], from: [number, number], q: number) => {
      const r0 = f.h * (0.16 + 0.07 * q);
      const r1 = r0 + f.h * 0.18;
      const base = Math.atan2(p[1] - from[1], p[0] - from[0]);
      for (const da of [-0.8, 0, 0.8]) {
        const th = base + da;
        ticks += `M${f1(p[0] + Math.cos(th) * r0)} ${f1(p[1] + Math.sin(th) * r0)}L${f1(p[0] + Math.cos(th) * r1)} ${f1(p[1] + Math.sin(th) * r1)}`;
      }
    };
    if (f.reachTo) {
      const a = armTo(f.x, f.y, h, 1, f.reachTo, tapping ? 0.78 : 1, f.rot);
      arm = a.d;
      hand = a.fist;
      // the reference's impact language, ON the glass at the hand: 3 short radiating ink ticks that pop out a step on the
      // 3rd frame (5 frames in all); the searchlight's catch pops them too
      if (tapping) tickAt(f.reachTo, [f.x, f.y - 0.46 * h], t - tap! < 0.1 ? 0 : 1);
      else if (f.flash !== undefined && t >= f.flash && t < f.flash + 0.167) tickAt(f.reachTo, [f.x, f.y - 0.46 * h], t - f.flash < 0.1 ? 0 : 1);
    } else if (f.reach) arm = armReach(f.x, f.y, h, 1, tapping ? 0.75 : 1, f.rot);
    const ink = Math.max(1.4, f.h * 0.055);
    out.push(
      <g key={i}>
        {arm ? (
          <>
            <path d={arm} stroke={palette.ink} strokeWidth={aw + ink * 1.6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d={arm} stroke={flashing ? palette.cream : coat} strokeWidth={aw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </>
        ) : null}
        {hand ? <circle cx={hand[0]} cy={hand[1]} r={Math.max(2.4, f.h * 0.085)} fill={palette.sand} stroke={palette.ink} strokeWidth={ink * 0.8} /> : null}
        <path d={b.coat} fill={flashing ? palette.cream : coat} stroke={palette.ink} strokeWidth={ink} strokeLinejoin="round" />
        <path d={b.head} fill={flashing ? palette.cream : f.dark ? palette.ink : coat} stroke={palette.ink} strokeWidth={ink} strokeLinejoin="round" />
        {!flashing ? <path d={b.cheek} fill={palette.sand} /> : null}
        {!flashing ? <path d={b.rim} stroke={palette.cream} strokeWidth={3} strokeLinecap="round" fill="none" /> : null}
      </g>,
    );
  });
  if (!out.length) return null;
  return (
    <>
      {out}
      {ticks ? <path d={ticks} stroke={palette.ink} strokeWidth={2.6} strokeLinecap="round" fill="none" /> : null}
    </>
  );
};

/** A1 fix round 1 (the count must read at phone size): a ring PULSE on the glass where the heap presses (clip it to the
 *  dome interior): two concentric ink arcs stepping out once (r0 -> 1.6 r0 on the 3rd frame), 6 frames; bigger on the
 *  bigger words ('tens', 'thousands'). */
export const GlassPulse: React.FC<{pulses: {at: number; x: number; y: number; r: number}[]}> = ({pulses}) => {
  const t = useTime();
  let d = '';
  let w = 3;
  for (const p of pulses) {
    if (t < p.at || t >= p.at + 0.2) continue;
    const r = t < p.at + 0.1 ? p.r : p.r * 1.6;
    w = Math.max(2.4, p.r * 0.07);
    for (const rr of [r, r * 0.62]) d += `M${f1(p.x - rr)} ${f1(p.y)}a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(2 * rr)} 0a${f1(rr)} ${f1(rr)} 0 1 0 ${f1(-2 * rr)} 0`;
  }
  return d ? <path d={d} stroke={palette.ink} strokeWidth={w} fill="none" /> : null;
};

// ---------------------------------------------------------------- the flood ('millions': OUTSIDE the dome)

export type CrowdFig = {x: number; y: number; h: number; at: number; rank: number; fill: 0 | 1; hood: boolean; arm?: -1 | 1; vx?: number};

/** Fix round 3: CLUMPS along a street instead of evenly spaced ranks (the old bands read as bleacher rows). Clumps of
 *  `clump` figures (3-6) shoulder to shoulder (size jitter +-20 %, y jitter `jy` per clump + 1.5 px per figure), 0-12 px
 *  gaps between clumps, every `arms`-th figure (seeded) with a raised arm; `vx` = a slow drift along the street TOWARD
 *  x `toward` (the crowd flows to the dome; 0 = still). Pop order: `order` (ltr | out-from x | in-to x). */
export function clumpBand(
  seed: string,
  x0: number,
  x1: number,
  y: number,
  h: number,
  at: number,
  span: number,
  o: {clump?: [number, number]; gap?: [number, number]; jy?: number; fj?: number; xj?: number; order?: 'ltr' | 'rand' | {from: number} | {to: number}; skip?: (x: number, y: number, h: number) => boolean; rank?: number; arms?: number; hoods?: number; toward?: number; vx?: number; sizeJ?: number} = {},
): CrowdFig[] {
  const out: CrowdFig[] = [];
  const [c0, c1] = o.clump ?? [3, 6];
  const [g0, g1] = o.gap ?? [0, 12];
  const jy = o.jy ?? 6;
  const sj = o.sizeJ ?? 0.2;
  let x = x0 + rand(seed, 'x0') * h;
  let c = 0;
  let i = 0;
  while (x < x1) {
    const n = c0 + Math.floor(rand(seed, `n${c}`) * (c1 - c0 + 1));
    const cy = y + (rand(seed, `cy${c}`) - 0.5) * 2 * jy;
    let last = h;
    for (let j = 0; j < n && x < x1; j++, i++) {
      const hh = h * (1 - sj + 2 * sj * rand(seed, `h${i}`));
      const fy = cy + (rand(seed, `y${i}`) - 0.5) * 2 * (o.fj ?? 1.5);
      const fx = x + (rand(seed, `xj${i}`) - 0.5) * 2 * (o.xj ?? 0) * hh;
      if (!(o.skip && o.skip(fx, fy, hh))) {
        const ord = o.order ?? 'rand';
        const u =
          ord === 'ltr' ? (x - x0) / (x1 - x0) : ord === 'rand' ? rand(seed, `a${i}`) : 'from' in ord ? Math.min(1, Math.abs(x - ord.from) / 700) : 1 - Math.min(1, Math.abs(x - ord.to) / 700);
        const arm = o.arms && rand(seed, `ar${i}`) < 1 / o.arms ? ((rand(seed, `as${i}`) < 0.5 ? -1 : 1) as -1 | 1) : undefined;
        const vx = o.toward !== undefined && o.vx ? Math.sign(o.toward - x) * o.vx * (0.7 + 0.6 * rand(seed, `v${c}`)) : undefined;
        out.push({x: fx, y: fy, h: hh, at: at + u * span, rank: o.rank ?? 0, fill: (i % 2) as 0 | 1, hood: rand(seed, `hd${i}`) < (o.hoods ?? 0.9), arm, vx});
      }
      last = hh;
      x += hh * 0.62 * (0.7 + 0.6 * rand(seed, `p${i}`)) + 0.5;
    }
    x += g0 + rand(seed, `g${c}`) * (g1 - g0) + last * 0.1;
    c++;
  }
  return out;
}

/** Skip helper: outside-the-dome only (a figure's head inside the glass is dropped). */
export const outsideDome = (x: number, y: number, h: number) => inDome(x, y - h * 0.4) || inDome(x - h * 0.33, y - h * 0.5) || inDome(x + h * 0.33, y - h * 0.5) || inDome(x, y - h);

/** Fix round 3b: a packed ROOFTOP crowd on row `ri` (roofs.ts: the set's own buildings) over x0..x1: `ranks` ranks per
 *  roof (rank 0 = the front, its base on the roof edge; every further rank 0.3 h higher, 8 % smaller and half a
 *  shoulder across), shoulder to shoulder in clumps of `clump` with 1-5 px gaps, a seeded share of roofs left empty
 *  (`empty`), every `arms`-th figure with a raised arm. Rank r pops at at[r] (one frame per rank: the burst), or at
 *  at[r] + the figure's share of `span` in `order`; `rankFrom` skips the front ranks (a later wave adds the back rank).
 *  `skip` drops figures (behind the board, inside the dome). */
export function roofBand(
  seed: string,
  ri: number,
  x0: number,
  x1: number,
  h: [number, number],
  at: number[],
  o: {ranks?: number; rankFrom?: number; clump?: [number, number]; empty?: number; arms?: number; skip?: (x: number, y: number, h: number) => boolean; span?: number; order?: 'ltr' | {from: number}; rank0?: number; dy?: number; cgap?: number; jy?: number; xj?: number} = {},
): CrowdFig[] {
  const out: CrowdFig[] = [];
  const ranks = o.ranks ?? 2;
  const [c0, c1] = o.clump ?? [3, 8];
  for (const b of ROOFS[ri]) {
    if (b.x + b.w < x0 || b.x > x1) continue;
    if (rand(seed, `e${Math.round(b.x)}`) < (o.empty ?? 0.1)) continue;
    for (let r = ranks - 1; r >= (o.rankFrom ?? 0); r--) {
      const hm = lerp(h[0], h[1], 0.5) * (1 - 0.08 * r);
      let x = b.x + 1 + (r % 2 ? hm * 0.33 : 0) + rand(seed, `s${Math.round(b.x)}/${r}`) * hm * 0.3;
      let i = 0;
      let n = c0 + Math.floor(rand(seed, `n${Math.round(b.x)}/${r}/0`) * (c1 - c0 + 1));
      while (x < b.x + b.w - 1 && x < x1) {
        const k = `${Math.round(b.x)}/${r}/${i}`;
        const hh = lerp(h[0], h[1], rand(seed, `h${k}`)) * (1 - 0.08 * r);
        // A1 fix round 3: `jy` = an extra per-figure step BACK from the roof edge (up only: they stay on the roof), `xj` =
        // per-figure x jitter (fraction of h): no straight ranks along the roof edge
        const y = b.top + (o.dy ?? 0.5) - r * 0.3 * hm * (0.7 + 0.6 * rand(seed, `ry${k}`)) + (rand(seed, `y${k}`) - 0.5) * (r ? 0.24 * hm : 1.2) - rand(seed, `jy${k}`) * (o.jy ?? 0);
        const fx = Math.max(b.x + 1, Math.min(b.x + b.w - 1, x + (rand(seed, `xj${k}`) - 0.5) * 2 * (o.xj ?? 0) * hh));
        if (x >= x0 && !(o.skip && o.skip(fx, y, hh))) {
          const ord = o.order;
          const u = !ord ? 0 : ord === 'ltr' ? (x - x0) / (x1 - x0) : Math.min(1, Math.abs(x - ord.from) / 700);
          const arm = o.arms && rand(seed, `ar${k}`) < 1 / o.arms ? ((rand(seed, `as${k}`) < 0.5 ? -1 : 1) as -1 | 1) : undefined;
          out.push({x: fx, y, h: hh, at: (at[r] ?? at[at.length - 1]) + u * (o.span ?? 0), rank: (o.rank0 ?? 0) + (ranks - 1 - r), fill: ((i + r) % 2) as 0 | 1, hood: rand(seed, `hd${k}`) < 0.9, arm});
        }
        // A1 fix round 2: the spacing jitters +-30 % (even ranks read as stubble at phone size)
        x += hh * 0.62 * (0.7 + 0.6 * rand(seed, `p${k}`)) + 0.4;
        i++;
        if (--n <= 0) {
          x += (1 + rand(seed, `g${k}`) * 4) * (o.cgap ?? 1);
          n = c0 + Math.floor(rand(seed, `n${k}`) * (c1 - c0 + 1));
        }
      }
    }
  }
  return out;
}

/** Hood colours of the nearer flood tiers (A1 fix round 2: ~1/4 each of ink, tealDark, ochre and clay, so the crowd
 *  reads as varied heads, not as dark bristle) and their coats (teal, tealDark, ochre, sand). */
const FLOOD_HOODS = [palette.ink, palette.tealDark, palette.brown, palette.tan];
const FLOOD_COATS = [palette.teal, palette.tealDark, palette.brown, palette.sand];
/** A1 fix round 3: row 2 (mid distance) has no ink hoods: the darkest values and the ink stay with the near crowd. */
const MID_HOODS = [palette.teal, palette.tealDark, palette.brown, palette.tan];
/** The far tiers: row 0 = fill-only clay / sand round-topped blobs (one value step darker than the row, close to the
 *  sky value: no ink, no hood point); row 1 = fill-only tealDark / ochre quads (the lite bust in ONE colour). */
/** A1 fix round 3 (the reviewers: row 1's dark teal / olive tufts read as pine stubble): the coat colours mixed ~60-70 %
 *  toward the row's haze (row 0 HALF.sand, row 1 sand), round dot heads, no pointed hoods. */
const FAR0 = [palette.tan, palette.tan, '#C9AE8E', '#BBB5A4', palette.sand];
const FAR1 = ['#9D9D8E', '#B5946E', '#A8AB97', '#C3A58B', '#A39C8C'];

/** Row 1's figure: round-shouldered body + a round dot head (base centre x, y; height h). */
function dotFig(x: number, y: number, h: number): {body: string; head: string} {
  const w = Math.max(3, 0.6 * h);
  const bh = 0.58 * h;
  const rr = w * 0.32;
  const hr = Math.max(1.4, 0.2 * h);
  const hy = y - bh - hr * 0.75;
  return {
    body: `M${f1(x - w / 2)} ${f1(y)}V${f1(y - bh + rr)}Q${f1(x - w / 2)} ${f1(y - bh)} ${f1(x - w / 2 + rr)} ${f1(y - bh)}H${f1(x + w / 2 - rr)}Q${f1(x + w / 2)} ${f1(y - bh)} ${f1(x + w / 2)} ${f1(y - bh + rr)}V${f1(y)}Z`,
    head: `M${f1(x - hr)} ${f1(hy)}a${f1(hr)} ${f1(hr)} 0 1 0 ${f1(2 * hr)} 0a${f1(hr)} ${f1(hr)} 0 1 0 ${f1(-2 * hr)} 0Z`,
  };
}

/** Row 0's figure: a round-topped capsule (base centre x, y; height h). */
function blobFig(x: number, y: number, h: number): string {
  const w = Math.max(2.2, 0.5 * h);
  const r = w / 2;
  return `M${f1(x - r)} ${f1(y)}V${f1(y - h + r)}A${f1(r)} ${f1(r)} 0 0 1 ${f1(x + r)} ${f1(y - h + r)}V${f1(y)}Z`;
}

/** The flood: per rank the reaching arms, the coats, the hoods and the cream rims (sun side), back ranks first (A1 fix
 *  round 1: hooded silhouettes, no raised arms: a rare arm REACHES toward the dome). A1 fix round 2 (the reviewers: ink
 *  hoods up to the horizon broke the haze ladder and read as stubble): the value steps by DEPTH (`tier`): 0 = row 0,
 *  fill-only clay / sand blobs 3-6 px with round tops; 1 = row 1, fill-only tealDark / ochre quads; 2 = row 2, coloured
 *  hoods (ink / tealDark / ochre / clay, ~1/4 each) over coloured coats with a thin ink outline (1.4 px); 3 = row 3 and
 *  nearer, the same with the full bust and the cream rims. Pops 1.3x for 2 frames; drifting figures walk toward the
 *  dome (a 1-step bob every 0.2 s); after `flickerAt` a seeded third of the crowd bobs 1-2 px in 0.1 s steps. */
export const Flood: React.FC<{figs: CrowdFig[]; flickerAt?: number; seed: string; tier?: 0 | 1 | 2 | 3}> = ({figs, flickerAt, seed, tier = 3}) => {
  const t = useTime();
  const look = useLook();
  if (look.fills !== 'color') return null;
  const step = flickerAt !== undefined && t >= flickerAt ? Math.floor((t - flickerAt) / 0.1) : -1;
  // per rank: fills by colour (Map colour -> path), outlines, rims, arms
  const fills: Map<string, string>[] = [];
  const hoods: Map<string, string>[] = [];
  const outline: string[] = [];
  const rims: string[] = [];
  const rimW: number[] = [];
  const arms: string[] = [];
  const aw: number[] = [];
  const add = (m: Map<string, string>[], r: number, c: string, d: string) => {
    const mm = (m[r] = m[r] ?? new Map());
    mm.set(c, (mm.get(c) ?? '') + d);
  };
  figs.forEach((f, i) => {
    if (t < f.at) return;
    const k = t < f.at + 0.067 ? 1.3 : 1;
    const h = f.h * k;
    // drifting figures WALK (a 1-step bob every 0.2 s, phase per figure); after `flickerAt` a third of the rest bob too
    const walk = f.vx ? (Math.floor((t - f.at) / 0.2 + rand(seed, `w${i}`) * 2) % 2 ? -Math.max(0.6, h * 0.05) : 0) : 0;
    const bob = walk || (step >= 0 && rand(seed, `f${i}`) < 0.35 && (step + i) % 2 === 0 ? -Math.max(1, h * 0.06) : 0);
    const y = f.y + bob;
    const fx = f.vx ? f.x + f.vx * (t - f.at) : f.x;
    const r = f.rank;
    const u = rand(seed, `c${i}`);
    if (tier === 0) {
      add(fills, r, FAR0[Math.floor(u * FAR0.length)], blobFig(fx, y, h * 0.62));
      return;
    }
    const lean = f.vx ? (Math.sign(f.vx) as 1 | -1) : rand(seed, `l${i}`) < 0.5 ? -1 : 1;
    if (tier === 1) {
      const b = dotFig(fx, y, h * 0.85);
      const ci = Math.floor(u * FAR1.length);
      add(fills, r, FAR1[ci], b.body);
      add(hoods, r, FAR1[(ci + 1 + Math.floor(rand(seed, `hc${i}`) * 3)) % FAR1.length], b.head);
      return;
    }
    const lite = tier === 2 && f.h < 12;
    const b = bustParts(fx, y, h, f.hood, lean, lite);
    const ci = Math.floor(u * 4);
    let hi = Math.floor(rand(seed, `hc${i}`) * 4);
    if (hi === ci && ci !== 0) hi = (hi + 1) % 4; // a hood one value off its coat (an ink hood on any coat)
    add(fills, r, FLOOD_COATS[ci], b.coat);
    add(hoods, r, (tier === 2 ? MID_HOODS : FLOOD_HOODS)[hi], b.head);
    outline[r] = (outline[r] ?? '') + b.coat + b.head;
    if (tier === 3 || f.h >= 15) {
      const s = fx < SUN_X ? 1 : -1;
      rimW[r] = Math.max(0.9, f.h * 0.065);
      rims[r] = (rims[r] ?? '') + hoodRim(fx, y, h, s, f.hood, rimW[r], 0, !lite);
    }
    if (f.arm) {
      // a REACH toward the dome (pulsing in and out, 0.2 s steps)
      const pump = Math.floor((t - f.at) / 0.2 + rand(seed, `ap${i}`) * 2) % 2;
      const toward = (Math.sign(DOME8.cx - fx) || 1) as 1 | -1;
      arms[r] = (arms[r] ?? '') + armReach(fx, y, h, toward, pump ? 0.8 : 1);
      aw[r] = Math.max(1.2, f.h * 0.12);
    }
  });
  const out: React.ReactNode[] = [];
  const n = Math.max(fills.length, hoods.length);
  const ow = tier === 3 ? 1.8 : 1.0;
  for (let r = 0; r < n; r++) {
    if (arms[r]) out.push(<path key={`a${r}`} d={arms[r]} stroke={palette.ink} strokeWidth={aw[r]} strokeLinecap="round" strokeLinejoin="round" fill="none" />);
    if (outline[r]) out.push(<path key={`o${r}`} d={outline[r]} stroke={palette.ink} strokeWidth={ow * 2} strokeLinejoin="round" fill="none" />);
    for (const [c, d] of fills[r] ?? []) out.push(<path key={`f${r}${c}`} d={d} fill={c} />);
    for (const [c, d] of hoods[r] ?? []) out.push(<path key={`h${r}${c}`} d={d} fill={c} />);
    if (rims[r]) out.push(<path key={`r${r}`} d={rims[r]} stroke={palette.cream} strokeWidth={rimW[r]} strokeLinecap="round" fill="none" />);
  }
  return out.length ? <>{out}</> : null;
};

// ---------------------------------------------------------------- the near crowd ('millions': our coping's foreground)

export type NearFig = {x: number; y: number; h: number; at: number; fill: 0 | 1 | 2; hood: boolean; arm?: -1 | 1; seed: string};

const NEAR_COATS = [palette.tealDark, palette.brown, palette.teal];

/** Big hooded backs RISING from behind our coping on 'millions' (fg layer, clipped above the coping by the scene, so they
 *  rise ON the word at the push framing): A1 fix round 1 (the reviewers: they read as concert spectators on bleachers):
 *  the near RATTLERS' recipe (hoodieFig: a coloured hoodie whose pointed hood with its seam is the silhouette, a 3.4 px
 *  open-cornered ink outline over a misregistered fill, a cream rim on the sun side), hunched toward the city, no raised
 *  arms: `arm` = one jointed sleeve (kit FigureArm) REACHING forward toward the dome, a sand hand at its end. The bust's
 *  top (hood peak) is at y - h; each rises its own height + 10 px in 0.2 s out(expo) and sways 1-2 px. */
export const NearCrowd: React.FC<{figs: NearFig[]; rise?: number}> = ({figs, rise = 0.2}) => {
  const t = useTime();
  const look = useLook();
  const color = look.fills === 'color';
  return (
    <>
      {figs.map((f) => {
        if (t < f.at) return null;
        const up = E.outExpo(prog(t, f.at, rise));
        const sway = Math.sin(t * 2.1 + rand(f.seed, 'ph') * 6) * 1.5;
        const x = f.x + sway;
        const H = f.h * 2.1;
        const top = f.y - f.h + (1 - up) * (f.h + 10);
        const feet = top + H;
        const s = x < SUN_X ? 1 : -1;
        const F = hoodieFig(x, feet, H, s);
        const coat = NEAR_COATS[f.fill % 3];
        const W = 3.4;
        let arm: React.ReactNode = null;
        if (f.arm) {
          const sh = F.shoulder(f.arm);
          // forward and up toward the dome (a pointing / grabbing reach, elbow out), pumping 2 steps
          const pump = Math.floor((t - f.at) / 0.22) % 2 ? 0.9 : 1;
          const hand: [number, number] = [sh[0] + f.arm * 0.2 * H * pump, sh[1] - 0.24 * H * pump];
          arm = <FigureArm sh={sh} hand={hand} w={0.12 * H} coat={color ? coat : palette.white} W={W * 0.85} side={f.arm} bend={35} seed={`${f.seed}/ar`} />;
        }
        return (
          <g key={f.seed}>
            <Fill d={F.body} color={color ? coat : palette.white} seed={`${f.seed}/bd`} />
            {color ? <Fill d={F.rim} color={palette.cream} offset={false} seed={`${f.seed}/rm`} /> : null}
            <Ink d={F.body} width={W} open={0.06} taper={false} seed={`${f.seed}/bi`} />
            <Ink d={F.seams} width={W * 0.6} taper={false} seed={`${f.seed}/se`} />
            {arm}
          </g>
        );
      })}
    </>
  );
};
