// FLOW v5, BREEZE: hair. A smooth dark CAP (the head's darkest value, no strand lines), the hair leaving the back of
// the head as ONE MASS that falls a little, then forks into two or three tapered tips that lift and stream (crisp at
// the root, needle tips), and one or two thin flyaway STRANDS that the air carries farther (feathered tips). Rest
// shapes are authored ALREADY STREAMING in the breeze (air.ts W0); the air lifts them toward level as it rises and lets
// them fall toward hanging as it drops, the tips later than the root, with a gentle travelling flutter. Short men's
// cuts are a cap whose back edge ends in two or three swept points; the calm cut is a bun. Head units: crown -0.5,
// chin +0.5, the face toward screen-left; chain lengths and widths in head heights.
import {outline, ribbon, chainOf, resample, arcs, add, sub, mul, norm, nrm, lerp, S, C, type Nd, type V2} from './v';
import {flowAngles, mirrorA, flutter, W0, type Air} from './air';
import {toFig, type HF, type View} from './head';

/** A thin strand (or any single tapered ribbon). */
export type Rib = {
  root: V2;
  /** the segment angles at W0 for a wind to the right (degrees, screen) */
  rest: number[];
  lens: number[];
  w: number;
  front?: boolean;
  ph: number;
  amp?: number;
  feather?: boolean;
  body?: number;
  /** drawn only at or above this head size (px) */
  minPx?: number;
};
/** A MASS: the hair leaving the back of the head as one band (its centre chain to the split), then forking into a few
 *  tapered tips (lat: where each starts across the band end, +1 = the band's left-of-travel edge, the upper one). */
export type Tip = {lat: number; rest: number[]; lens: number[]; w: number; ph: number};
export type Mass = {root: V2; rootW: number; rest: number[]; lens: number[]; splitW: number; tips: Tip[]; ph: number; amp?: number; front?: boolean};
/** A cap node; f > 0 marks a swept point the air carries (it lengthens as the air rises and flutters a little). */
export type CNd = Nd & {f?: number};
const Cf = (x: number, y: number, f: number): CNd => ({p: [x, y], c: true, f});
export type CutView = {cap: CNd[]; masses?: Mass[]; ribs: Rib[]; bun?: {c: V2; r: number}; ears?: {c: V2; w: number; h: number; a: number}[]};
export type Cut = {id: string; views: Partial<Record<View, CutView>>};

// ---------------------------------------------------------------- her: long hair, swept back by the breeze
/** Her hair leaves the back of the head as ONE mass and forks into a LEAD ribbon (from the band's upper edge: the
 *  longest and thinnest, a slow S along it, 05 and 07) and two shorter tips that fan out below it. */
const herMass = (root: V2, rootW: number, tilt: number, lift: number, tipTilt = tilt): Mass => ({
  root,
  rootW,
  rest: [52, 44, 36].map((a) => a - tilt),
  lens: [0.36, 0.36, 0.32],
  splitW: rootW * 0.74,
  ph: 0.4,
  amp: 7,
  tips: [
    // the lead: rises out of the fork, runs level, and its tip dips (the slow S)
    {lat: 0.62, rest: [30, 17, 7, 1, 1, 6, 14, 20].map((a) => a - tipTilt - lift), lens: [0.24, 0.25, 0.25, 0.24, 0.23, 0.22, 0.2, 0.18], w: 0.118, ph: 0.2},
    {lat: 0.02, rest: [34, 30, 28, 29, 31].map((a) => a - tipTilt - lift * 0.6), lens: [0.24, 0.23, 0.21, 0.19, 0.16], w: 0.135, ph: 1.4},
    {lat: -0.62, rest: [50, 47, 46, 48].map((a) => a - tipTilt - lift * 0.3), lens: [0.22, 0.2, 0.18, 0.15], w: 0.125, ph: 2.6},
  ],
});
export const LONG: Cut = {
  id: 'long',
  views: {
    q: {
      cap: [
        S(-0.348, -0.15),
        S(-0.3, -0.27),
        S(-0.18, -0.36),
        C(-0.06, -0.425),
        S(0.0, -0.32),
        S(0.05, -0.16),
        S(0.07, 0.02),
        S(0.1, 0.2),
        S(0.15, 0.36),
        S(0.27, 0.46),
        S(0.48, 0.28),
        S(0.58, -0.06),
        S(0.52, -0.42),
        S(0.27, -0.6),
        S(-0.04, -0.62),
        S(-0.29, -0.52),
        S(-0.405, -0.33),
        S(-0.41, -0.2),
      ],
      masses: [herMass([0.38, 0.1], 0.66, 0, 0)],
      ribs: [],
    },
    p: {
      cap: [
        S(-0.33, -0.31),
        S(-0.19, -0.335),
        S(-0.03, -0.285),
        S(0.05, -0.15),
        S(0.08, 0.03),
        S(0.12, 0.19),
        S(0.22, 0.35),
        S(0.42, 0.34),
        S(0.55, 0.04),
        S(0.51, -0.3),
        S(0.3, -0.53),
        S(0.0, -0.585),
        S(-0.27, -0.5),
        S(-0.395, -0.36),
      ],
      masses: [herMass([0.4, 0.12], 0.56, 12, 4)],
      ribs: [],
    },
    b: {
      cap: [
        S(-0.3, 0.34),
        S(-0.425, 0.04),
        S(-0.41, -0.29),
        S(-0.21, -0.53),
        S(0.08, -0.575),
        S(0.35, -0.45),
        S(0.47, -0.17),
        S(0.49, 0.14),
        S(0.4, 0.4),
        S(0.18, 0.5),
        S(-0.08, 0.46),
      ],
      masses: [{...herMass([0.08, 0.2], 0.8, -22, -6, -8), lens: [0.36, 0.34, 0.28], front: true}],
      ribs: [],
    },
  },
};

// ---------------------------------------------------------------- the cast's cuts
/** A short men's crop: a little volume swept back off the forehead, the back ending in three short swept points, the
 *  ear showing. */
export const CROP: Cut = {
  id: 'crop',
  views: {
    p: {
      cap: [
        S(-0.35, -0.26),
        S(-0.34, -0.42),
        S(-0.22, -0.56),
        S(0.02, -0.62),
        S(0.34, -0.6),
        Cf(0.74, -0.47, 1),
        S(0.55, -0.32),
        Cf(0.63, -0.16, 0.7),
        S(0.47, -0.04),
        S(0.42, 0.1),
        S(0.3, 0.16),
        S(0.2, 0.06),
        S(0.15, -0.08),
        S(0.06, -0.12),
        C(-0.02, 0.04),
        S(-0.07, -0.1),
        S(-0.16, -0.21),
      ],
      ribs: [],
      ears: [{c: [0.09, 0.05], w: 0.09, h: 0.16, a: 8}],
    },
    q: {
      cap: [
        S(-0.36, -0.2),
        S(-0.36, -0.4),
        S(-0.2, -0.56),
        S(0.08, -0.61),
        S(0.38, -0.58),
        Cf(0.76, -0.45, 1),
        S(0.57, -0.3),
        Cf(0.65, -0.13, 0.7),
        S(0.47, 0.02),
        S(0.4, 0.12),
        S(0.3, 0.12),
        S(0.22, 0.0),
        S(0.14, -0.1),
        C(0.06, 0.02),
        S(0.02, -0.14),
        S(-0.12, -0.26),
        S(-0.28, -0.26),
      ],
      ribs: [],
      ears: [{c: [0.16, 0.04], w: 0.08, h: 0.16, a: 6}],
    },
  },
};
/** A men's cut with a little more length, swept back off the forehead, ending at the nape in two swept points. */
export const FLOWM: Cut = {
  id: 'flowm',
  views: {
    q: {
      cap: [
        S(-0.36, -0.22),
        S(-0.37, -0.4),
        S(-0.22, -0.58),
        S(0.06, -0.645),
        S(0.4, -0.61),
        Cf(0.84, -0.46, 1),
        S(0.6, -0.35),
        Cf(0.74, -0.25, 0.8),
        S(0.57, -0.16),
        Cf(0.65, -0.04, 0.6),
        S(0.5, 0.06),
        S(0.37, 0.2),
        S(0.26, 0.2),
        S(0.2, 0.06),
        S(0.14, -0.08),
        C(0.06, 0.04),
        S(0.01, -0.14),
        S(-0.12, -0.27),
        S(-0.27, -0.28),
      ],
      ribs: [{root: [0.4, -0.3], rest: [12, 8, 6], lens: [0.18, 0.16, 0.14], w: 0.05, ph: 2.1, amp: 10, feather: true, minPx: 30}],
      ears: [{c: [0.17, 0.05], w: 0.08, h: 0.16, a: 6}],
    },
  },
};
/** A short textured crop with a crisp hairline and a low fade, one swept point at the crown. */
export const FADE: Cut = {
  id: 'fade',
  views: {
    p: {
      cap: [
        S(-0.36, -0.28),
        S(-0.33, -0.44),
        S(-0.18, -0.57),
        S(0.08, -0.61),
        S(0.34, -0.58),
        Cf(0.65, -0.45, 1),
        S(0.49, -0.34),
        Cf(0.56, -0.24, 0.6),
        S(0.44, -0.14),
        S(0.42, -0.06),
        S(0.3, -0.01),
        S(0.17, -0.07),
        S(0.07, -0.14),
        C(0.0, -0.06),
        S(-0.08, -0.16),
        S(-0.22, -0.26),
      ],
      ribs: [],
      ears: [{c: [0.09, 0.05], w: 0.09, h: 0.16, a: 8}],
    },
  },
};
/** Natural coily hair worn out: a rounded cloud bigger than the skull, its downwind side drawn out into a few soft
 *  swept points (no strand lines). */
export const CURLS: Cut = {
  id: 'curls',
  views: {
    q: {
      cap: [
        S(-0.355, -0.12),
        S(-0.47, -0.24),
        S(-0.53, -0.46, 1.1),
        S(-0.4, -0.7, 1.1),
        S(-0.12, -0.84, 1.1),
        S(0.22, -0.84, 1.1),
        S(0.52, -0.72, 1.1),
        S(0.74, -0.56, 0.9),
        Cf(1.0, -0.48, 0.9),
        S(0.8, -0.33, 0.8),
        Cf(1.03, -0.2, 1),
        S(0.78, -0.05, 0.8),
        S(0.7, 0.14, 1.1),
        S(0.54, 0.3),
        S(0.34, 0.34),
        S(0.2, 0.22),
        S(0.11, 0.02),
        S(0.05, -0.2),
        S(-0.08, -0.33),
        S(-0.24, -0.3),
      ],
      ribs: [],
    },
  },
};
/** The calm cut: sleek to the head and a round bun on top; only a wisp at the nape moves. */
export const BUN: Cut = {
  id: 'bun',
  views: {
    b: {
      cap: [
        S(-0.41, 0.04),
        S(-0.43, -0.2),
        S(-0.32, -0.46),
        S(0.0, -0.57),
        S(0.32, -0.46),
        S(0.43, -0.2),
        S(0.41, 0.06),
        S(0.33, 0.33),
        S(0.0, 0.42),
        S(-0.33, 0.33),
      ],
      bun: {c: [0.02, -0.66], r: 0.165},
      ribs: [
        {root: [0.2, 0.24], rest: [38, 30, 24], lens: [0.13, 0.12, 0.1], w: 0.045, ph: 1.7, amp: 14, feather: true, minPx: 26},
        {root: [0.1, -0.74], rest: [-8, -2, 6], lens: [0.13, 0.11, 0.1], w: 0.035, ph: 2.9, amp: 14, feather: true, minPx: 30},
      ],
      ears: [
        {c: [-0.43, 0.06], w: 0.07, h: 0.15, a: -6},
        {c: [0.43, 0.06], w: 0.07, h: 0.15, a: 6},
      ],
    },
    q: {
      cap: [
        S(-0.35, -0.2),
        S(-0.28, -0.33),
        S(-0.12, -0.4),
        S(0.02, -0.33),
        S(0.08, -0.16),
        S(0.13, 0.0),
        S(0.24, 0.14),
        S(0.4, 0.16),
        S(0.48, -0.1),
        S(0.44, -0.38),
        S(0.24, -0.54),
        S(-0.06, -0.57),
        S(-0.3, -0.46),
        S(-0.39, -0.3),
      ],
      bun: {c: [0.12, -0.64], r: 0.16},
      ribs: [],
    },
  },
};

export const CUTS: Record<string, Cut> = {long: LONG, crop: CROP, flowm: FLOWM, fade: FADE, curls: CURLS, bun: BUN};

// ---------------------------------------------------------------- the moving shapes
const LAG = 0.32;
const flatOf = (rest: number[]) => rest.map((a) => a * 0.3 - 4);
const hangOf = (rest: number[]) => rest.map((a) => 90 - (90 - a) * 0.12);

/** A chain's joints now (figure units). s0..s1 = the share of the whole piece this chain covers (for the lag and the
 *  flutter's travelling phase). */
let BOB: ((t: number) => number) | undefined;
/** The head's vertical motion over time (a walk's bob), for the hair's follow-through; undefined = a still body. */
export function setBob(f: ((t: number) => number) | undefined) {
  BOB = f;
}
function chainNow(root: V2, rest: number[], lens: number[], hf: HF, air: Air, t: number, wAt: (t: number) => number, ph: number, amp: number, s0 = 0, s1 = 1): V2[] {
  const sOf = (s: number) => s0 + (s1 - s0) * s;
  const angs = flowAngles(rest, {flat: flatOf(rest), hang: hangOf(rest), w: (s) => wAt(t - LAG * sOf(s)), t: t - 0.25 * s0, ph: ph + 2.2 * s0, amp: amp * (0.5 + 0.5 * s1), dir: air.dir});
  const n = angs.length;
  const fol = angs.map((a, i) => {
    if (!BOB) return a;
    // when the head drops, the hair behind it lags and lifts (and the reverse), the tip later and more
    const s = sOf((i + 0.5) / n);
    const tt = t - 0.1 - 0.16 * s;
    const vy = (BOB(tt + 0.01) - BOB(tt - 0.01)) / 0.02;
    return a - 0.06 * s * vy;
  });
  return chainOf(root, fol.map((a) => mirrorA(a + hf.tilt * 0.3, air.dir)), lens.map((l) => l * hf.h));
}

/** A ribbon's width profile: full at the root, tapering to a needle. */
export const ribW = (w: number, h: number, body = 1) => (s: number) => w * h * Math.pow(Math.max(0, 1 - s), 0.9 / body) * (1 + 0.12 * Math.sin(Math.PI * s * 1.4));

function edges(c: V2[], w: (s: number) => number): {L: V2[]; R: V2[]} {
  const {L: tot, s} = arcs(c);
  const L: V2[] = [];
  const R: V2[] = [];
  for (let i = 0; i < c.length; i++) {
    const a = c[Math.max(0, i - 1)];
    const b = c[Math.min(c.length - 1, i + 1)];
    const nv = nrm(norm(sub(b, a)));
    const hw = w(tot ? s[i] / tot : 0) / 2;
    L.push(add(c[i], mul(nv, hw)));
    R.push(add(c[i], mul(nv, -hw)));
  }
  return {L, R};
}

/** The mass now: one outline from the root band down to the split and out along each forked tip. */
function massShape(m: Mass, hf: HF, air: Air, t: number, wAt: (t: number) => number): {d: string; root: V2; tips: V2[]} {
  const T = toFig(hf);
  const amp = m.amp ?? 8;
  const total = m.lens.reduce((a, b) => a + b, 0) + Math.max(...m.tips.map((tp) => tp.lens.reduce((a, b) => a + b, 0)));
  const sSplit = m.lens.reduce((a, b) => a + b, 0) / total;
  const M = resample(chainNow(T(m.root), m.rest, m.lens, hf, air, t, wAt, m.ph, amp, 0, sSplit), 4);
  const wM = (s: number) => (m.rootW + (m.splitW - m.rootW) * Math.pow(s, 0.8)) * hf.h;
  const eM = edges(M, wM);
  const end = M[M.length - 1];
  const dirEnd = norm(sub(end, M[M.length - 2]));
  const nv = nrm(dirEnd);
  const half = (m.splitW * hf.h) / 2;
  const tips = m.tips
    .slice()
    .sort((a, b) => b.lat - a.lat)
    .map((tp) => {
      const st = add(end, mul(nv, half * tp.lat));
      // the tip starts a little back inside the band so its join never shows
      const st2 = add(st, mul(dirEnd, -0.04 * hf.h));
      const ch = resample(chainNow(st2, tp.rest, tp.lens, hf, air, t, wAt, m.ph + tp.ph, amp * 1.25, sSplit, 1), 4);
      return {ch, e: edges(ch, ribW(tp.w, hf.h, 1.1))};
    });
  const ns: Nd[] = [];
  ns.push({p: eM.L[0], c: true});
  for (let i = 1; i < eM.L.length - 1; i++) ns.push({p: eM.L[i]});
  const J0 = 3;
  tips.forEach((tp, k) => {
    const n = tp.ch.length;
    const from = k === 0 ? 1 : J0;
    for (let i = from; i < n - 1; i++) ns.push({p: tp.e.L[i]});
    ns.push({p: tp.ch[n - 1], c: true});
    const to = k === tips.length - 1 ? 1 : J0;
    for (let i = n - 2; i >= to; i--) ns.push({p: tp.e.R[i]});
    if (k < tips.length - 1) {
      const nx = tips[k + 1];
      ns.push({p: lerp(tp.e.R[J0 - 1], nx.e.L[J0 - 1], 0.5), c: true});
    }
  });
  for (let i = eM.R.length - 2; i >= 1; i--) ns.push({p: eM.R[i]});
  ns.push({p: eM.R[0], c: true});
  return {d: outline(ns), root: M[0], tips: tips.map((tp) => tp.ch[tp.ch.length - 1])};
}

export type HairShapes = {cap: string; masses: {d: string; front: boolean; root: V2; tips: V2[]}[]; ribs: {d: string; front: boolean; feather: boolean; tip: V2; root: V2}[]; bun?: string; ears: {c: V2; w: number; h: number; a: number}[]};
export function hairShapes(cut: Cut, hf: HF, air: Air, t: number, wAt: (t: number) => number, px: number): HairShapes {
  const v = cut.views[hf.view] ?? cut.views.q ?? cut.views.p ?? cut.views.b!;
  const T = toFig(hf);
  // the cap's swept points: lengthened as the air rises above the breeze, shortened in a lull, with a little flutter
  const wNow = wAt(t);
  const capNodes = v.cap.map((n, i) => {
    if (!n.f) return {p: T(n.p), c: n.c, k: n.k};
    const anchor: V2 = [0.36, -0.28];
    const d = sub(n.p, anchor);
    const fl = flutter(t, 0.6 + 0.1 * i, 1.3 * i, 0.7);
    const grow = 1 + n.f * (0.22 * (wNow - W0) / W0 + 0.07 * fl);
    const a = (n.f * 7 * fl * Math.PI) / 180;
    const r: V2 = [d[0] * Math.cos(a) - d[1] * Math.sin(a), d[0] * Math.sin(a) + d[1] * Math.cos(a)];
    return {p: T(add(anchor, mul(r, grow))), c: n.c, k: n.k};
  });
  const cap = outline(capNodes);
  const masses = (v.masses ?? []).map((m) => ({...massShape(m, hf, air, t, wAt), front: !!m.front}));
  const ribs = v.ribs
    .filter((r) => px >= (r.minPx ?? 0))
    .map((r) => {
      const ch = chainNow(T(r.root), r.rest, r.lens, hf, air, t, wAt, r.ph, r.amp ?? 10);
      const rb = ribbon(ch, ribW(r.w, hf.h, r.body ?? 1), {n: 4});
      return {d: rb.d, front: !!r.front, feather: !!r.feather, tip: rb.tip, root: ch[0]};
    });
  let bun: string | undefined;
  if (v.bun) {
    const c = T(v.bun.c);
    const r = v.bun.r * hf.h;
    bun = outline([S(c[0] + r, c[1]), S(c[0], c[1] + r * 0.92), S(c[0] - r, c[1]), S(c[0], c[1] - r)]);
  }
  const ears = (v.ears ?? []).map((e) => ({c: T(e.c), w: e.w * hf.h, h: e.h * hf.h, a: e.a + hf.tilt}));
  return {cap, masses, ribs, bun, ears};
}

export {C};
