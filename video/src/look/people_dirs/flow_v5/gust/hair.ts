// FLOW v5, GUST: the hair. A smooth dark CAP (the head's darkest value, no strand lines) and a few tapering RIBBONS
// that leave the back of the head as one mass and split later: crisp at the root, needle tips feathering into the sky.
// Each ribbon's rest shape is authored ALREADY STREAMING (the shape at wind strength 1); in still air it hangs; the
// wind's felt strength (air.ts: late and slower toward the tip) moves every bone between the two, with a travelling
// flutter on top and a lag behind the head's bob (follow-through). Short men's cuts end in two or three swept points
// that the wind lifts a little. One calm cut (a low knot) for stillness: nothing on it blows.
// Units: head units (the crown 0,0, the chin y = 100, facing the screen left); ribbon chains root first.
import {type V2, type Node, N, add, mul, sub, len, angOf, dirOf, spline, ribbon, mapNodes, outline, clamp, ellipse} from './geo';
import {type Wind, felt, flutter} from './air';
import {headMap} from './head';
import type {Rig, View} from './body';

export type RibbonSpec = {
  /** the streaming rest shape, root first (head units) */
  pts: V2[];
  /** the width at the root (head units) */
  w: number;
  seed: number;
  /** flutter at the tip (degrees) */
  fl?: number;
  /** the hang in still air: the first bone's angle (screen degrees, 90 = straight down) and the turn per bone */
  hang?: [number, number];
  /** drawn only when the figure is at least this many px tall */
  minPx?: number;
  /** in front of the body (over the shoulder) rather than behind it */
  front?: boolean;
  /** how loose: 1 = a long ribbon, less = stiffer (short hair) */
  loose?: number;
  /** a band of cloth (a belt's tail): one width, a pointed cut end */
  band?: boolean;
  /** one of a MASS: its first `trunk` bones are the same for every ribbon of the mass (the same rest shape, hang, wind
   *  and flutter, measured along `L`), so the hair leaves the head as one mass and parts later */
  mass?: {trunk: number; seed: number; fl: number; L: number};
};
export type CutView = {cap: Node[]; ribbons: RibbonSpec[]; knot?: {c: V2; r: number}};
export type Cut = Partial<Record<View, CutView>>;

// ---------------------------------------------------------------- strands
/** A streaming chain: from the root at angle a0 (screen degrees at the designed wind), L long (head units), turning by
 *  `bend` degrees along its length (most of it toward the tip), with a gentle wave; n bones. */
export function strand(root: V2, a0: number, L: number, bend: number, o: {n?: number; wave?: number; ph?: number; wf?: number} = {}): V2[] {
  const n = o.n ?? 7;
  const pts: V2[] = [root];
  let p = root;
  for (let i = 0; i < n; i++) {
    const u = (i + 0.5) / n;
    const a = a0 + bend * Math.pow(u, 1.4) + (o.wave ?? 0) * Math.sin(Math.PI * (o.wf ?? 1.6) * u + (o.ph ?? 0));
    p = add(p, mul(dirOf(a), L / n));
    pts.push(p);
  }
  return pts;
}
const R = (root: V2, a0: number, L: number, bend: number, w: number, seed: number, o: Partial<RibbonSpec> & {wave?: number; ph?: number} = {}): RibbonSpec => ({
  pts: strand(root, a0, L, bend, {wave: o.wave ?? 4, ph: o.ph ?? seed}),
  w,
  seed,
  fl: o.fl ?? 14,
  hang: o.hang ?? [86, 2],
  minPx: o.minPx,
  front: o.front,
  loose: o.loose,
});

// ---------------------------------------------------------------- a mass that parts
type Branch = {at: V2; to: V2; a0: number; L: number; bend: number; w: number; seed: number; n: number; wave: number; ph: number; wf?: number; fl?: number; minPx?: number};
/** Ribbons that leave the head TOGETHER: each starts at its own root (spread over the back of the head, low) and runs
 *  the mass's trunk, the roots' spread closing from `at` to `to` (head units, about the trunk) so the mass narrows as
 *  it leaves; then each parts on its own gently waved run to a needle tip. */
function mass(trunk: {root: V2; a0: number; L: number; bend: number; n: number; wave: number; ph: number; seed: number; fl: number}, hang: [number, number], branches: Branch[]): RibbonSpec[] {
  const tr = strand(trunk.root, trunk.a0, trunk.L, trunk.bend, {n: trunk.n, wave: trunk.wave, ph: trunk.ph});
  const Lm = Math.max(...branches.map((b) => trunk.L + b.L));
  return branches.map((b) => {
    const t = tr.map((q, k) => add(q, lerp2(b.at, b.to, k / trunk.n)));
    const own = strand(t[t.length - 1], b.a0, b.L, b.bend, {n: b.n, wave: b.wave, ph: b.ph, wf: b.wf ?? 2.0});
    return {pts: t.concat(own.slice(1)), w: b.w, seed: b.seed, fl: b.fl ?? 14, hang, minPx: b.minPx, mass: {trunk: trunk.n, seed: trunk.seed, fl: trunk.fl, L: Lm}};
  });
}
const lerp2 = (a: V2, b: V2, t: number): V2 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// ---------------------------------------------------------------- her long hair: one mass parting into three, a wisp
// The hair leaves the back of the head low, as ONE mass, for about a third of its length; then it parts into three
// gently waved ribbons (a long leading one, one rising, one falling) and one fine wisp, each to a needle tip (refs 05,
// 06, 08). At film size the wisp drops out and the three read as one mass splitting.
const LONG_HANG: [number, number] = [86, 1];
const LONG: Cut = {
  p: {
    cap: [
      N(-36.5, 25, 'round', 6),
      N(-27, 3, 'smooth'),
      N(0, -6, 'smooth'),
      N(33, 3, 'smooth'),
      N(53, 32, 'smooth'),
      N(55, 62, 'smooth'),
      N(44, 90, 'round', 10),
      N(22, 96, 'round', 6),
      N(13, 80, 'smooth'),
      N(3, 58, 'smooth'),
      N(-14, 37, 'smooth'),
      N(-29, 28.5, 'smooth'),
    ],
    ribbons: mass({root: [32, 64], a0: 15, L: 132, bend: -4, n: 3, wave: 2, ph: 0, seed: 7, fl: 8}, LONG_HANG, [
      {at: [2, 0], to: [0, 0], a0: 10, L: 276, bend: -14, w: 30, seed: 2, n: 6, wave: 12, ph: 0.4},
      {at: [6, -16], to: [2, -8], a0: 3, L: 206, bend: -12, w: 24, seed: 1, n: 5, wave: 12, ph: 2.6},
      {at: [-4, 18], to: [-2, 9], a0: 20, L: 168, bend: -16, w: 24, seed: 3, n: 5, wave: 12, ph: 4.4},
      {at: [8, -20], to: [3, -10], a0: -4, L: 210, bend: -16, w: 7, seed: 5, n: 5, wave: 16, ph: 1.3, fl: 20, minPx: 300},
    ]),
  },
  q: {
    cap: [
      N(-36, 33, 'round', 5),
      N(-33, 10, 'smooth'),
      N(-8, -6, 'smooth'),
      N(30, -3, 'smooth'),
      N(52, 22, 'smooth'),
      N(58, 54, 'smooth'),
      N(54, 86, 'smooth'),
      N(42, 104, 'round', 8),
      N(34, 96, 'round', 6),
      N(33, 76, 'smooth'),
      N(28, 52, 'smooth'),
      N(16, 30, 'smooth'),
      N(-6, 18, 'smooth'),
      N(-26, 22, 'smooth'),
    ],
    ribbons: mass({root: [38, 68], a0: 16, L: 132, bend: -4, n: 3, wave: 2, ph: 0, seed: 7, fl: 8}, LONG_HANG, [
      {at: [2, 0], to: [0, 0], a0: 11, L: 276, bend: -14, w: 30, seed: 2, n: 6, wave: 12, ph: 0.4},
      {at: [6, -16], to: [2, -8], a0: 4, L: 206, bend: -12, w: 24, seed: 1, n: 5, wave: 12, ph: 2.6},
      {at: [-4, 18], to: [-2, 9], a0: 21, L: 168, bend: -16, w: 24, seed: 3, n: 5, wave: 12, ph: 4.4},
      {at: [8, -20], to: [3, -10], a0: -3, L: 210, bend: -16, w: 7, seed: 5, n: 5, wave: 16, ph: 1.3, fl: 20, minPx: 300},
    ]),
  },
  b: {
    cap: [
      N(-40, 42, 'smooth'),
      N(-31, 8, 'smooth'),
      N(3, -6, 'smooth'),
      N(36, 6, 'smooth'),
      N(49, 40, 'smooth'),
      N(48, 76, 'smooth'),
      N(36, 104, 'smooth'),
      N(30, 126, 'round', 8),
      N(-16, 128, 'round', 10),
      N(-24, 106, 'smooth'),
      N(-38, 82, 'smooth'),
    ],
    ribbons: mass({root: [18, 84], a0: 28, L: 136, bend: -6, n: 3, wave: 2, ph: 0, seed: 7, fl: 8}, LONG_HANG, [
      {at: [2, 0], to: [0, 0], a0: 18, L: 284, bend: -16, w: 34, seed: 2, n: 6, wave: 12, ph: 0.4},
      {at: [8, -18], to: [3, -9], a0: 10, L: 212, bend: -14, w: 26, seed: 1, n: 5, wave: 12, ph: 2.6},
      {at: [-6, 18], to: [-3, 9], a0: 32, L: 172, bend: -16, w: 26, seed: 3, n: 5, wave: 12, ph: 4.4},
      {at: [10, -24], to: [4, -12], a0: 4, L: 216, bend: -18, w: 7, seed: 5, n: 5, wave: 16, ph: 1.3, fl: 20, minPx: 300},
    ]),
  },
};

// ---------------------------------------------------------------- the calm cut: smoothed back into a low knot
const KNOT: Cut = {
  b: {
    cap: [N(-40, 42, 'smooth'), N(-31, 8, 'smooth'), N(3, -5, 'smooth'), N(36, 6, 'smooth'), N(48, 40, 'smooth'), N(46, 72, 'smooth'), N(30, 92, 'round', 8), N(-14, 96, 'round', 8), N(-36, 78, 'smooth')],
    knot: {c: [6, 100], r: 17},
    ribbons: [
      R([16, 100], 12, 80, -12, 7, 1, {hang: [90, 1], fl: 18, wave: 5}),
      R([34, 52], 4, 60, -16, 4, 2, {hang: [84, 2], fl: 22, minPx: 300}),
    ],
  },
};

// ---------------------------------------------------------------- a lob blown back: three short locks with points
const LOB: Cut = {
  p: {
    cap: [N(-36, 26, 'round', 6), N(-26, 3, 'smooth'), N(0, -7, 'smooth'), N(34, 3, 'smooth'), N(54, 32, 'smooth'), N(57, 62, 'smooth'), N(52, 92, 'smooth'), N(40, 108, 'round', 6), N(22, 104, 'round', 6), N(14, 82, 'smooth'), N(4, 58, 'smooth'), N(-14, 36, 'smooth'), N(-29, 28, 'smooth')],
    ribbons: [
      R([34, 62], 12, 128, -12, 36, 1, {hang: [82, 4], fl: 12, wave: 4, loose: 0.75}),
      R([30, 84], 24, 104, -10, 28, 2, {hang: [88, 3], fl: 14, wave: 4, loose: 0.75}),
      R([38, 36], 0, 96, -16, 22, 3, {hang: [74, 6], fl: 14, wave: 4, loose: 0.75}),
    ],
  },
};

// ---------------------------------------------------------------- short men's cuts: lifted, swept back into points
// The cut lifts off the forehead (a soft rise of volume over the hairline) and sweeps back over the crown into two or
// three points that pass the back of the head a little; the hairline is broken (the temple's corner, a short sideburn
// in front of the ear), never a straight fringe line. Short at the sides and the nape (the skin shows over the ear).
const swept = (root: V2, a0: number, L: number, bend: number, w: number, seed: number, minPx?: number): RibbonSpec =>
  R(root, a0, L, bend, w, seed, {hang: [a0 + 16, bend / 6], fl: 7, wave: 1, loose: 0.35, minPx});
// his: a neat quiff pushed back
const SHORT: Cut = {
  p: {
    cap: [
      N(-33, 21, 'round', 3),
      N(-38.5, 8, 'smooth'),
      N(-30, -7, 'smooth'),
      N(-6, -14, 'smooth'),
      N(26, -10, 'smooth'),
      N(46, 5, 'smooth'),
      N(53, 30, 'smooth'),
      N(50, 56, 'smooth'),
      N(42, 70, 'round', 6),
      N(32, 69, 'round', 5),
      N(28, 54, 'smooth'),
      N(20, 45, 'round', 5),
      N(11, 46, 'round', 2),
      N(9, 54, 'round', 2),
      N(3, 52, 'round', 2),
      N(-1, 35, 'round', 3),
      N(-13, 27, 'smooth'),
      N(-25, 25, 'smooth'),
    ],
    ribbons: [swept([-26, -4], -2, 82, 30, 30, 1), swept([-6, -4], 8, 74, 26, 26, 2), swept([12, 6], 20, 58, 20, 18, 3, 300)],
  },
};
// his: a longer, looser top swept back and up, the points passing the crown further
const SHORT2: Cut = {
  p: {
    cap: [
      N(-32, 22, 'round', 3),
      N(-40, 6, 'smooth'),
      N(-32, -10, 'smooth'),
      N(-8, -17, 'smooth'),
      N(24, -13, 'smooth'),
      N(46, 2, 'smooth'),
      N(53, 28, 'smooth'),
      N(50, 56, 'smooth'),
      N(42, 70, 'round', 6),
      N(32, 69, 'round', 5),
      N(28, 54, 'smooth'),
      N(20, 45, 'round', 5),
      N(11, 46, 'round', 2),
      N(9, 54, 'round', 2),
      N(3, 52, 'round', 2),
      N(-2, 33, 'round', 3),
      N(-14, 27, 'smooth'),
      N(-25, 26, 'smooth'),
    ],
    ribbons: [swept([-28, -8], -6, 94, 36, 32, 1), swept([-8, -8], 4, 88, 32, 28, 2), swept([10, 2], 16, 70, 26, 20, 3, 300)],
  },
};
// a close crop: the cap follows the skull with a little height on top, a crisp lifted hairline with the temple's
// corner, two short swept points at the crown; from behind the dark cap over the top and back, the nape bare
const CROP: Cut = {
  p: {
    cap: [
      N(-31, 22, 'round', 3),
      N(-36, 8, 'smooth'),
      N(-27, -7, 'smooth'),
      N(-2, -13, 'smooth'),
      N(28, -8, 'smooth'),
      N(47, 10, 'smooth'),
      N(53, 36, 'smooth'),
      N(49, 60, 'smooth'),
      N(41, 72, 'round', 6),
      N(31, 70, 'round', 5),
      N(27, 54, 'smooth'),
      N(19, 46, 'round', 5),
      N(6, 44, 'round', 2),
      N(-1, 33, 'round', 3),
      N(-13, 27, 'smooth'),
      N(-24, 25, 'smooth'),
    ],
    ribbons: [swept([-10, -6], 4, 64, 26, 26, 1), swept([10, 0], 16, 54, 22, 20, 2, 300)],
  },
  b: {
    cap: [N(-41, 44, 'smooth'), N(-32, 8, 'smooth'), N(2, -7, 'smooth'), N(36, 5, 'smooth'), N(48, 40, 'smooth'), N(46, 70, 'round', 10), N(22, 88, 'round', 10), N(-20, 88, 'round', 10), N(-41, 70, 'round', 8)],
    ribbons: [
      R([0, -2], 4, 50, 14, 18, 1, {hang: [24, 4], fl: 6, wave: 1, loose: 0.35}),
      R([14, 10], 14, 42, 12, 14, 2, {hang: [34, 4], fl: 6, wave: 1, loose: 0.35}),
    ],
  },
};

export const CUTS: Record<string, Cut> = {LONG, KNOT, LOB, SHORT, SHORT2, CROP};

// ---------------------------------------------------------------- evaluation
export type HairEnv = {t: number; wind: Wind; px: number};

/** One ribbon's centre line now (figure units). A ribbon of a mass runs the mass's bones identically until it parts:
 *  the wind and the flutter are measured along the mass's length, the flutter's phase handed over to its own after. */
export function ribbonLine(r: Rig, spec: RibbonSpec, env: HairEnv): V2[] {
  const m = headMap(r);
  const k = r.head.k;
  const root = m(spec.pts[0]);
  const n = spec.pts.length - 1;
  const loose = spec.loose ?? 1;
  const [h0, hTurn] = spec.hang ?? [88, 2];
  const ms = spec.mass;
  const total = ms ? ms.L : spec.pts.reduce((acc, q, i) => (i ? acc + len(sub(q, spec.pts[i - 1])) : 0), 0);
  const pts: V2[] = [root];
  let p = root;
  let s0 = 0;
  const wdir = env.wind.dir;
  for (let i = 0; i < n; i++) {
    const seg = sub(spec.pts[i + 1], spec.pts[i]);
    const sl = len(seg);
    const L = sl * k;
    // where along the hair this bone sits (0 root .. 1 the longest tip), quantized for the response cache
    const u = Math.round(clamp((s0 + sl / 2) / total, 0, 1) * 40) / 40;
    s0 += sl;
    // the designed (streaming) angle, turned with the wind's direction
    const A = angOf(seg) + wdir;
    const H = h0 + hTurn * i;
    let dA = A - H;
    while (dA > 180) dA -= 360;
    while (dA < -180) dA += 360;
    // what this bone feels: later and slower toward the tip
    const s = felt(env.wind, (2.4 - 1.3 * u) / Math.sqrt(loose), 0.42, 0.035 * i, env.t);
    const sc = clamp(s, 0, 1);
    // above the designed wind the ribbon does not over-rotate: it straightens toward the wind's own line
    const over = clamp((s - 1) * 1.3, 0, 0.85);
    let to = wdir - 4 - A;
    while (to > 180) to -= 360;
    while (to < -180) to += 360;
    // the flutter: the mass's own until the ribbon parts, its own after (handed over across two bones)
    const own = ms ? clamp((i - ms.trunk + 1) / 2.5, 0, 1) : 1;
    const flA = ms ? ms.fl + ((spec.fl ?? 14) - ms.fl) * own : spec.fl ?? 14;
    const wave = ms ? flutter(env.t, u, ms.seed) * (1 - own) + flutter(env.t, u, spec.seed) * own : flutter(env.t, u, spec.seed);
    const fl = flA * (0.12 + 0.88 * Math.pow(u, 1.15)) * Math.min(1.2, Math.max(sc, s * 0.9)) * loose;
    let a = H + dA * sc + to * over + fl * wave;
    // the head's bob: the ribbon lags behind it (rises as the head drops)
    a -= 0.03 * r.vy * u * Math.cos(a * Math.PI / 180);
    p = add(p, mul(dirOf(a), L));
    pts.push(p);
  }
  return pts;
}

/** The ribbon as a path: crisp root, needle tip; its width falls slowly at first (one mass) then tapers. */
export function ribbonPath(r: Rig, spec: RibbonSpec, env: HairEnv): {d: string; root: V2; tip: V2} {
  const c = spline(ribbonLine(r, spec, env), 8);
  const k = r.head.k;
  const w0 = spec.w * k;
  // never thinner than ~1.1 px before the last fifth (it must survive at film size)
  const minW = (1.1 * 1000) / env.px;
  const d = spec.band
    ? ribbon(c, (u) => (u > 0.985 ? 0 : Math.max(minW, w0 * (u < 0.8 ? 1 - 0.1 * u : (0.92 * (1 - u)) / 0.2))))
    : ribbon(c, (u) => {
        // a ribbon of a mass stays full after it parts and tapers late to its needle; a lone one tapers all along
        const body = spec.mass ? w0 * Math.pow(1 - u, 0.55) * (1 - 0.3 * u) : w0 * Math.pow(1 - u, 0.85) * (1 + 0.12 * Math.sin(Math.PI * Math.min(1, u * 2.2)));
        return u > 0.97 ? 0 : Math.max(body, u < 0.8 ? minW : minW * (1 - (u - 0.8) / 0.17));
      });
  return {d, root: c[0], tip: c[c.length - 1]};
}

export function cutView(cut: Cut, v: View): CutView {
  return (cut[v] ?? cut.p ?? cut.b ?? cut.q) as CutView;
}

export function capPath(r: Rig, cut: Cut): string {
  const cv = cutView(cut, r.hv);
  const m = headMap(r);
  let d = outline(mapNodes(cv.cap, m));
  if (cv.knot) {
    const c = m(cv.knot.c);
    d += ellipse(c, cv.knot.r * r.head.k, cv.knot.r * r.head.k * 0.92);
  }
  return d;
}

