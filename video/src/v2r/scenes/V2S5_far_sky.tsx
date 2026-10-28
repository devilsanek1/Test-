// V2S5_far_sky.tsx (lane L4, SKY & FAR): the S5 sky, drawn in the FAR plane (END coords; the rig's FAR_S5 maps it):
//   TopClouds   2-3 HUGE flat lobed clouds in the top gutter (crown / body / belly: 3 flat fills, no ink), cut by the
//               side edges at the end AND filling the start's top gutter; every point at y <= 285 at every p (the far
//               plane is 1.08x at the start about the horizon: a point above it moves UP there); drift 3.5 px/s right.
//   HeroBank    the cloud bank >= 1 W on the horizon: flat base, lobed top (lobes 180-450 px, tops >= 610), a low saddle
//               behind the obelisk, low under the sun (the disc and the APRIL page stay whole); it drifts 1.2 px/s.
//   AprilBands  the flat April bands just above the horizon (a cool high step over the gold), below y 600 only.
//   SunS5       the sun disc (the ONE pop) with the APRIL 2026 calendar flip (a squash-flip, never a fade).
// Shapes are sampled polygons (one orientation, so a colour's subpaths union under nonzero), batched one path per colour.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {Batch, Paint, rng, type Pt} from '../kit/dc/core';
import {polyPath} from '../../lib/sketch';
import {SKY} from './V2S5_far_tones';

// ---------------------------------------------------------------- the lobed-cloud maths

/** A lobe: a half-ellipse standing on the cloud's flat base (centre x, width, top y). */
export type Lobe = [cx: number, w: number, top: number];

export type CloudSpec = {
  /** The flat base (y). */
  base: number;
  lobes: Lobe[];
  /** Crown (the lit caps): each lobe's cap is an ellipse kx x ky of the lobe, shifted toward the sun (dx of rx, + =
   *  right) and down from the lobe top (dy of its height); its round bottom shows inside the body. */
  crown?: {kx: number; ky: number; dx: number; dy?: number};
  /** Belly: the shaded band along the base; its top edge is a row of puff bottoms hanging over it (arcs bulging DOWN,
   *  cusps between them) `h` px above the base at the cusps, `dip` px lower in each arc's middle; one per `period`. */
  belly?: {h: number; period: number; dip?: number};
  /** Sampling step (px). */
  step?: number;
};

/** Top of one lobe at x (Infinity outside it). A lobe is the upper half of an ellipse whose centre sits on the base. */
function lobeY(l: Lobe, base: number, x: number): number {
  const rx = l[1] / 2;
  const u = (x - l[0]) / rx;
  if (u <= -1 || u >= 1) return Infinity;
  return base - (base - l[2]) * Math.sqrt(1 - u * u);
}

/** The cloud's upper envelope at x: the highest lobe there (the base where no lobe covers x). */
export function cloudTop(c: CloudSpec, x: number): number {
  let y = c.base;
  for (const l of c.lobes) {
    const v = lobeY(l, c.base, x);
    if (v < y) y = v;
  }
  return y;
}

export const cloudSpan = (c: CloudSpec): [number, number] => [Math.min(...c.lobes.map((l) => l[0] - l[1] / 2)), Math.max(...c.lobes.map((l) => l[0] + l[1] / 2))];

/** A clockwise sampled ellipse (screen coords). */
export function ellPts(cx: number, cy: number, rx: number, ry: number, n = 40): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return out;
}

/** The three flat fills of a lobed cloud: body (the whole silhouette), crown (lit caps), belly (the shaded base band). */
export function cloudPaths(c: CloudSpec): {body: string; crown: string; belly: string} {
  const step = c.step ?? 3;
  const [xa, xb] = cloudSpan(c);
  // body: the envelope, then down to the base (clockwise: top left -> right, base right -> left)
  const top: Pt[] = [];
  for (let x = xa; x < xb; x += step) top.push([x, cloudTop(c, x)]);
  top.push([xb, c.base]);
  const body = polyPath([[xa, c.base], ...top, [xb, c.base]]);
  // belly: the band under the puffs' round bottoms (arcs bulging down, cusps between), never above the envelope; the
  // scallops vary in width (seeded) so the base never reads as a machine-made edge
  const g = rng(`cloud/${xa.toFixed(0)}/${c.base}`);
  let belly = '';
  if (c.belly) {
    const {h, period, dip = h * 0.45} = c.belly;
    const cuts: number[] = [xa];
    while (cuts[cuts.length - 1] < xb) cuts.push(cuts[cuts.length - 1] + period * g.range(0.6, 1.4));
    const pts: Pt[] = [];
    let k = 0;
    for (let x = xa; x <= xb; x += step) {
      while (k < cuts.length - 2 && x > cuts[k + 1]) k++;
      const ph = (x - cuts[k]) / (cuts[k + 1] - cuts[k]);
      const arc = Math.sqrt(Math.max(0, 1 - (2 * ph - 1) ** 2)); // 0 at the cusps, 1 mid-arc
      const yb = c.base - h + dip * arc;
      pts.push([x, Math.max(cloudTop(c, x), yb)]);
    }
    belly = polyPath([[xa, c.base], ...pts, [xb, c.base]]);
  }
  // crowns: per lobe (lobes taller than 60 px only), an ellipse pushed toward the sun, its size and shift varied a
  // little (seeded), clamped inside the body (its round bottom stays visible; the belly, drawn over it, cuts any cap
  // that reaches the base)
  let crown = '';
  if (c.crown) {
    const {kx, ky, dx, dy = 0.03} = c.crown;
    for (const l of c.lobes) {
      const rx = l[1] / 2;
      const ry = c.base - l[2];
      const v = [g.range(0.85, 1.12), g.range(0.82, 1.15), g.range(0.7, 1.3)];
      if (ry < 60 || rx < 55) continue;
      const rxc = rx * kx * v[0];
      const ryc = ry * ky * v[1];
      const cx = l[0] + rx * dx * v[2];
      const cy = l[2] + ry * dy + ryc;
      const pts = ellPts(cx, cy, rxc, ryc, 48).map(([x, y]): Pt => {
        const xx = Math.min(xb - 1, Math.max(xa + 1, x));
        return [xx, Math.min(c.base, Math.max(y, cloudTop(c, xx)))];
      });
      crown += polyPath(pts);
    }
  }
  return {body, crown, belly};
}

// ---------------------------------------------------------------- the top-gutter clouds

/** END coords. Every base <= 270 and the lobes reach up to (and past) the top edge: at the start the far plane scales
 *  1.08x about the horizon, so these points move UP there (never down into the band margin 290-317). At the end A is
 *  cut by the left edge and B by the right; at the start B fills the left and C enters at the right. */
const TOP_CROWN = {kx: 0.7, ky: 0.33, dx: 0.2, dy: -0.02};
export const TOP_CLOUDS: CloudSpec[] = [
  // A: cut by the LEFT edge at the end (x -440..490)
  {
    base: 264,
    lobes: [
      [-340, 200, 190],
      [-210, 300, 134],
      [-50, 330, 74],
      [60, 150, 30],
      [140, 300, 42],
      [270, 240, 98],
      [372, 200, 150],
      [446, 90, 206],
    ],
    crown: TOP_CROWN,
    belly: {h: 30, period: 112, dip: 13},
  },
  // B: cut by the RIGHT edge at the end, the left one at the start (x 670..1630)
  {
    base: 246,
    lobes: [
      [730, 120, 196],
      [830, 240, 128],
      [966, 290, 54],
      [1050, 150, 4],
      [1126, 250, 18],
      [1250, 300, 66],
      [1400, 280, 104],
      [1520, 200, 150],
      [1590, 80, 200],
    ],
    crown: TOP_CROWN,
    belly: {h: 30, period: 120, dip: 13},
  },
  // C: cut by the right edge at the start (x 1700..2600)
  {
    base: 270,
    lobes: [
      [1770, 140, 204],
      [1880, 260, 124],
      [2026, 320, 54],
      [2120, 140, 26],
      [2210, 300, 70],
      [2370, 280, 122],
      [2520, 180, 190],
    ],
    crown: TOP_CROWN,
    belly: {h: 30, period: 112, dip: 13},
  },
];

/** Drift of the top-gutter clouds (px/s, all one way: huge = slow). */
export const TOP_DRIFT = 3.5;

export const TopClouds: React.FC<{seed?: string}> = ({seed = 's5top'}) => {
  const t = useTime();
  const b = useMemo(() => {
    const B = new Batch();
    const parts = TOP_CLOUDS.map(cloudPaths);
    for (const p of parts) B.fill(SKY.cloudBody, p.body);
    B.layer();
    for (const p of parts) B.fill(SKY.cloudCrown, p.crown);
    B.layer();
    for (const p of parts) B.fill(SKY.cloudBelly, p.belly);
    return B;
  }, []);
  return (
    <g transform={`translate(${(TOP_DRIFT * t).toFixed(2)} 0)`}>
      <Paint b={b} seed={seed} misreg={false} />
    </g>
  );
};

// ---------------------------------------------------------------- the hero bank

/** The sun at the END (cut by the right edge): FAR_END in V2S5_far.tsx reads it. */
export const SUN_END = {x: 1058.5, y: 646, r: 60.2};

/** The hero bank (END coords, base on the horizon 750). Tops >= 610; the saddle behind the obelisk (x ~396). The sun
 *  (x 998-1119, bottom 706) stays a WHOLE disc on the sky (CRAFT §f "Failures the eye catches first": the "speech-bubble"
 *  bite): no lobe reaches it, the nearest bank edge >= 19 px off its rim at every drift (the lobe under it tops at 726,
 *  the two left of it end at x <= 990: `sunGap` below; the start's sun in the slot is the same disc on the same plane). */
export const BANK: CloudSpec = {
  base: 750,
  lobes: [
    [-330, 300, 676],
    [-170, 360, 628],
    [20, 300, 652],
    [150, 220, 618],
    [262, 240, 650],
    [396, 112, 698], // the saddle: the needle stands in the bank's gap
    [468, 190, 664],
    [586, 300, 626],
    [742, 420, 610], // the hero lobe
    [835, 300, 638],
    [915, 150, 686],
    [1060, 240, 726], // under the sun: low, a clear sliver of sky under the disc
    [1150, 150, 704],
    [1236, 220, 664],
    [1360, 380, 616],
    [1548, 330, 642],
    [1722, 400, 612],
    [1920, 330, 650],
    [2100, 380, 624],
    [2290, 300, 660],
    [2440, 260, 700],
  ],
  crown: {kx: 0.68, ky: 0.34, dx: 0.2, dy: -0.02},
  belly: {h: 24, period: 132, dip: 11},
  step: 3,
};
export const BANK_DRIFT = 1.2;

/** The bank's nearest edge to the sun disc (px, END coords; < 0 = a lobe cuts the disc) after `drift` px of drift. */
export function sunGap(drift = 0): number {
  let best = Infinity;
  for (let x = SUN_END.x - 160; x <= SUN_END.x + 160; x += 0.5) {
    const y = cloudTop(BANK, x - drift);
    best = Math.min(best, Math.hypot(x - SUN_END.x, y - SUN_END.y) - SUN_END.r);
  }
  return best;
}

export const HeroBank: React.FC<{seed?: string}> = ({seed = 's5bank'}) => {
  const t = useTime();
  const b = useMemo(() => {
    const B = new Batch();
    const p = cloudPaths(BANK);
    B.fill(SKY.bankBody, p.body);
    B.layer();
    B.fill(SKY.bankCrown, p.crown);
    B.layer();
    B.fill(SKY.bankBelly, p.belly);
    return B;
  }, []);
  return (
    <g transform={`translate(${(BANK_DRIFT * t).toFixed(2)} 0)`}>
      <Paint b={b} seed={seed} misreg={false} />
    </g>
  );
};

// ---------------------------------------------------------------- the April bands

/** Flat bands just above the horizon (END y; they show only in the bank's gaps: the saddle, under the sun). */
export const AprilBands: React.FC<{x0: number; x1: number; horizon: number}> = ({x0, x1, horizon}) => (
  <>
    <rect x={x0} y={horizon - 64} width={x1 - x0} height={30} fill={SKY.bandHigh} />
    <rect x={x0} y={horizon - 34} width={x1 - x0} height={40} fill={SKY.bandGold} />
  </>
);

// ---------------------------------------------------------------- the sun + the APRIL 2026 page

export type SunProps = {x?: number; y?: number; r?: number; flip?: [number, number]; label?: [string, string]};

/** The sun disc (the pop) that flips into a calendar page APRIL 2026 and back (squash-flip; never a fade). */
export const SunS5: React.FC<SunProps> = ({x = SUN_END.x, y = SUN_END.y, r = SUN_END.r, flip, label = ['APRIL', '2026']}) => {
  const t = useTime();
  useCaptionFont();
  let mode: 'disc' | 'page' = 'disc';
  let sx = 1;
  if (flip) {
    const [a, b] = flip;
    const q = 0.09;
    if (t >= a && t < a + q) sx = 1 - (t - a) / q;
    else if (t >= a + q && t < b - q) {
      mode = 'page';
      sx = Math.min(1, (t - a - q) / q);
    } else if (t >= b - q && t < b) {
      mode = 'page';
      sx = 1 - (t - (b - q)) / q;
    } else if (t >= b && t < b + q) sx = (t - b) / q;
  }
  sx = Math.max(0.02, sx);
  if (mode === 'disc') {
    return (
      <g transform={`translate(${x} ${y}) scale(${sx.toFixed(3)} 1)`}>
        <circle r={r} fill={CM.sun} />
      </g>
    );
  }
  // the page: paper, a sun-orange header with two binder rings, APRIL on the header, 2026 large below (the year is
  // the read); rounded corners; a thin ink keyline open at the top (the header's top edge is the ring line)
  const w = r * 1.86;
  const h = r * 2.0;
  const hh = h * 0.36;
  const rr = 7;
  const page = `M${-w / 2 + rr} ${-h / 2}H${w / 2 - rr}Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + rr}V${h / 2 - rr}Q${w / 2} ${h / 2} ${w / 2 - rr} ${h / 2}H${-w / 2 + rr}Q${-w / 2} ${h / 2} ${-w / 2} ${h / 2 - rr}V${-h / 2 + rr}Q${-w / 2} ${-h / 2} ${-w / 2 + rr} ${-h / 2}Z`;
  const header = `M${-w / 2 + rr} ${-h / 2}H${w / 2 - rr}Q${w / 2} ${-h / 2} ${w / 2} ${-h / 2 + rr}V${-h / 2 + hh}H${-w / 2}V${-h / 2 + rr}Q${-w / 2} ${-h / 2} ${-w / 2 + rr} ${-h / 2}Z`;
  return (
    <g transform={`translate(${x} ${y}) scale(${sx.toFixed(3)} 1)`}>
      <path d={page} fill={CM.paper} />
      <path d={header} fill={CM.sun} />
      <path d={`M${-w / 2 + 6} ${-h / 2 + hh}H${w / 2 - 6}`} stroke={CM.ink} strokeWidth={1.6} strokeLinecap="round" fill="none" />
      <circle cx={-w * 0.24} cy={-h / 2 + 5} r={4.6} fill={CM.ink} />
      <circle cx={w * 0.24} cy={-h / 2 + 5} r={4.6} fill={CM.ink} />
      <text x={0} y={-h / 2 + hh * 0.8} textAnchor="middle" fontFamily={captionFontStack} fontSize={r * 0.5} fill={CM.ink}>
        {label[0]}
      </text>
      <text x={0} y={h * 0.36} textAnchor="middle" fontFamily={captionFontStack} fontSize={r * 0.74} fill={CM.ink}>
        {label[1]}
      </text>
      <path d={`M${-w / 2} ${-h / 2 + 10}V${h / 2 - 6}Q${-w / 2} ${h / 2} ${-w / 2 + 6} ${h / 2}H${w / 2 - 6}Q${w / 2} ${h / 2} ${w / 2} ${h / 2 - 6}V${-h / 2 + 10}`} fill="none" stroke={CM.ink} strokeWidth={2.4} strokeLinecap="round" />
    </g>
  );
};

