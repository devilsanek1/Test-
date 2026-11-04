// FLOW v5, GUST: the garments. Every look is built round ONE long outer piece that IS the figure: narrow at sloping
// shoulders, freer toward the hem; long straight runs ending in sharp points; every hem a few points sweeping
// downwind; folds only as long straight planes from the shoulder down (a lit plane, a shade plane). No construction.
//
// A garment is authored per view as NODES at the designed wind (strength 1): body nodes are fixed to the rig, free
// nodes carry their still-air position too (h) and move between the two with what they feel (air.ts: a quick, stiff
// hem; a slow, loose flag), plus a small flutter. The walk pushes the hem's front corner ahead of the leading knee.
import {type V2, type Node, add, lerp, clamp} from './geo';
import {type Wind, felt, flutter} from './air';
import type {Rig} from './body';

/** A garment node: p at the designed wind; h in still air (absent = fixed to the body); its response. */
export type GN = {
  p: V2;
  h?: V2;
  k?: Node['k'];
  r?: number;
  bow?: number;
  /** response: natural frequency (Hz), delay (s), flutter amplitude (units, along x and y), seed */
  f?: number;
  dl?: number;
  fl?: V2;
  sd?: number;
  /** follows the legs in the walk: rides ahead of the leading knee (front), lies pressed on the leading leg (press),
   *  stays behind the trailing leg (back) */
  leg?: 'front' | 'press' | 'back';
};
export const G = (x: number, y: number, k: Node['k'] = 'round', r = 6, bow = 0): GN => ({p: [x, y], k, r, bow});
/** A free node: designed at (x, y), still at (hx, hy). */
export const F = (x: number, y: number, hx: number, hy: number, k: Node['k'] = 'sharp', o: Partial<GN> = {}): GN => ({p: [x, y], h: [hx, hy], k, r: 4, ...o});

export type GEnv = {t: number; wind: Wind};

/** Evaluate nodes now: the body's offset, the wind (felt per node), the flutter. */
export function evalNodes(ns: GN[], r: Rig, env: GEnv, o: {freeOffset?: (i: number, n: GN, q: V2) => V2} = {}): Node[] {
  return ns.map((n, i) => {
    let q = n.p;
    if (n.h) {
      const s0 = felt(env.wind, n.f ?? 1.9, 0.38, n.dl ?? 0.06, env.t);
      // above the designed wind: a little further, saturating (cloth has a length)
      const s = s0 <= 1 ? Math.max(0, s0) : 1 + 0.3 * (1 - Math.exp(-(s0 - 1) * 2.2));
      q = lerp(n.h, n.p, s);
      const fl = n.fl ?? [4, 3];
      const sd = n.sd ?? i * 0.77;
      const a = Math.min(1.3, s);
      q = add(q, [fl[0] * a * flutter(env.t, 0.8, sd, 0.9, 2.1), fl[1] * a * flutter(env.t + 0.21, 0.6, sd + 3.1, 0.75, 1.9)]);
      if (o.freeOffset) q = o.freeOffset(i, n, q);
    }
    // free cloth follows the body's bob a little late
    q = add(q, n.h ? r.bodyLag(0.05 + (n.dl ?? 0.06) * 1.2) : r.body);
    return {p: q, k: n.k ?? 'round', r: n.r ?? 6, bow: n.bow ?? 0};
  });
}

// ---------------------------------------------------------------- her long open coat
/** body: the one garment (its colour); top: a second piece in the same family drawn over it (a cropped knit, a
 *  jacket over trousers); flag: a back panel flying behind; inner: the slip seen in an open front; dark: trousers in
 *  the legs' dark value. */
export type Shape = {nodes: GN[]; kind: 'body' | 'top' | 'flag' | 'inner' | 'dark'};
export type Panel = {pts: GN[]; tone: 'lit' | 'shade' | 'mid' | 'deep'; op?: number; blur?: number; on?: 'body' | 'top' | 'dark'};
/** A tail of cloth (a belt's end): a ribbon from a root, streaming (figure units). */
export type Tail = {root: V2; a0: number; L: number; bend: number; w: number; seed: number; front?: boolean; tone?: 'mid' | 'shade' | 'deep'};
/** The one acting arm: a slim tapered stroke (a bare forearm out of the sleeve) ending in a small closed fist. */
export type Arm = {c: V2[]; w: [number, number]; fist: number; front?: boolean};
export type GarmentView = {
  shapes: Shape[];
  tails?: Tail[];
  arms?: Arm[];
  /** long straight planes inside the garment: a sleeve (the arm inside it, the hand in the pocket), a facet */
  panels?: Panel[];
  /** the boundary of the shade plane (a straight line from the shoulder down, the shade to its right) */
  planes?: {a: V2; b: V2; side: 1 | -1}[];
  /** the inner layer showing in the open front: the slit (top, bottom-left, bottom-right) */
  slit?: [V2, V2, V2];
  /** the slit open from the collar (a jacket over a tee) rather than parted only below by the wind */
  slitFull?: boolean;
};

/** Her coat, from behind (ref 06): the windward (left) half hangs straight, pressed a little toward the legs as the wind
 *  rises; the coat's own back half flies: rooted down the back from the shoulder blade to the hem, it leaves the body
 *  low (at the waist) and runs in long straight edges to ONE point near knee height, the hem rising into its lower edge.
 *  It is the same cloth turned from the light (the coat's shade), never a cape on top of a whole coat. */
const COAT_B: GarmentView = {
  shapes: [
    {
      kind: 'flag',
      nodes: [
        G(40, 300, 'round', 4),
        G(86, 272, 'smooth'),
        {...F(120, 486, 98, 486, 'round', {f: 1.1, dl: 0.12, fl: [3, 5], sd: 3}), r: 50, bow: -0.03},
        {...F(570, 716, 112, 846, 'sharp', {f: 0.9, dl: 0.18, fl: [10, 16], sd: 1}), bow: 0.02},
        {...F(92, 858, 84, 864, 'round', {f: 1.6, dl: 0.08, fl: [3, 4], sd: 2}), r: 6},
        G(40, 840, 'round', 4),
      ],
    },
    {
      kind: 'body',
      nodes: [
        G(-24, 188, 'smooth'),
        G(24, 188, 'smooth'),
        G(56, 204, 'smooth'),
        G(84, 252, 'round', 24),
        G(94, 430, 'round', 14),
        G(90, 640, 'round', 10),
        {...F(84, 850, 80, 856, 'round', {f: 2.2, fl: [2, 2]}), r: 4},
        F(56, 890, 54, 886, 'sharp', {f: 2.3, fl: [4, 3]}),
        {...F(-6, 852, -8, 856, 'round', {f: 2.3, fl: [3, 2]}), r: 5},
        F(-34, 894, -40, 890, 'sharp', {f: 2.2, fl: [4, 3], sd: 4}),
        {...F(-62, 858, -70, 860, 'round', {f: 2.3, fl: [3, 2]}), r: 4},
        F(-80, 884, -98, 878, 'sharp', {f: 2.0, fl: [3, 3], sd: 5}),
        {...F(-92, 700, -104, 700, 'round', {f: 1.8, fl: [2, 0]}), r: 30},
        G(-104, 470, 'round', 30),
        G(-84, 254, 'round', 26),
        G(-56, 204, 'smooth'),
      ],
    },
  ],
  planes: [{a: [-30, 214], b: [-18, 810], side: 1}],
  panels: [{pts: [G(-58, 230), G(-98, 250), G(-106, 440), G(-88, 572), G(-70, 568), G(-62, 300)], tone: 'lit', op: 0.36}],
};

/** Her coat, front 3/4 (facing the screen left): open down the front over a wine slip; the windward front edge hangs
 *  straight and presses toward the legs; the coat's own back half flies behind, rooted down the back from the shoulder
 *  blade to the hem, leaving the body low and running to one point near knee height. */
const COAT_Q: GarmentView = {
  shapes: [
    {
      kind: 'flag',
      nodes: [
        G(60, 300, 'round', 4),
        G(98, 276, 'smooth'),
        {...F(142, 490, 120, 490, 'round', {f: 1.1, dl: 0.12, fl: [3, 5], sd: 3}), r: 50, bow: -0.03},
        {...F(580, 712, 128, 836, 'sharp', {f: 0.9, dl: 0.18, fl: [10, 16], sd: 1}), bow: 0.02},
        {...F(118, 852, 110, 858, 'round', {f: 1.6, dl: 0.08, fl: [3, 4], sd: 2}), r: 6},
        G(70, 830, 'round', 4),
      ],
    },
    {
      kind: 'inner',
      nodes: [G(-40, 228, 'round', 6), G(0, 228, 'round', 6), G(12, 816, 'round', 4), F(-6, 846, -10, 848, 'sharp', {f: 2.2, fl: [3, 2]}), G(-22, 834, 'round', 3), F(-36, 846, -40, 848, 'sharp', {f: 2.2, fl: [3, 2]}), G(-50, 600, 'round', 4)],
    },
    {
      kind: 'body',
      nodes: [
        G(-40, 194, 'smooth'),
        G(10, 178, 'round', 8),
        G(30, 184, 'smooth'),
        G(56, 200, 'smooth'),
        G(84, 240, 'round', 22),
        G(122, 432, 'round', 26),
        G(116, 620, 'round', 12),
        {...F(110, 846, 106, 852, 'round', {f: 2.2, fl: [2, 2]}), r: 4},
        F(80, 884, 78, 880, 'sharp', {f: 2.3, fl: [4, 3]}),
        {...F(24, 852, 22, 856, 'round', {f: 2.3, fl: [3, 2]}), r: 5},
        F(-4, 888, -8, 884, 'sharp', {f: 2.2, fl: [4, 3], sd: 4}),
        {...F(-40, 852, -46, 856, 'round', {f: 2.3, fl: [3, 2]}), r: 4},
        F(-64, 878, -82, 872, 'sharp', {f: 2.0, fl: [3, 3], sd: 5}),
        {...F(-80, 690, -96, 690, 'round', {f: 1.8, fl: [2, 0]}), r: 30},
        G(-100, 432, 'round', 30),
        G(-72, 246, 'round', 22),
        G(-50, 206, 'smooth'),
      ],
    },
  ],
  planes: [{a: [66, 236], b: [104, 812], side: 1}],
  panels: [
    // the near sleeve: the arm inside, the elbow out, the hand in the pocket
    {pts: [G(62, 232), G(96, 238), G(126, 432), G(100, 556), G(74, 562), G(58, 300)], tone: 'lit', op: 0.42},
    // the far sleeve along the far side
    {pts: [G(-60, 238), G(-90, 250), G(-106, 432), G(-80, 558), G(-64, 552), G(-80, 424)], tone: 'lit', op: 0.3},
  ],
  slit: [
    [-18, 234],
    [-36, 826],
    [-2, 826],
  ],
};

/** Her coat in profile, walking into the headwind (ref 05): the wind presses the front against the leading leg (the
 *  knee and the shin show through the cloth), the back flares and its hem streams back in three long points; every
 *  point sweeps downwind. */
const COAT_P: GarmentView = {
  shapes: [
    {
      kind: 'body',
      nodes: [
        G(-30, 196, 'smooth'),
        G(18, 176, 'round', 8),
        G(36, 186, 'smooth'),
        G(56, 214, 'smooth'),
        G(66, 292, 'round', 16),
        {...F(96, 540, 86, 540, 'round', {f: 1.8, fl: [2, 0]}), r: 40},
        {...F(246, 806, 116, 846, 'sharp', {f: 1.2, dl: 0.12, fl: [8, 10], sd: 1}), bow: -0.02},
        {...F(150, 828, 104, 850, 'round', {f: 1.6, dl: 0.06, fl: [3, 3]}), r: 6, leg: 'back'},
        {...F(196, 874, 96, 872, 'sharp', {f: 1.4, dl: 0.1, fl: [7, 6], sd: 2}), bow: -0.02},
        {...F(86, 858, 64, 862, 'round', {f: 2.0, fl: [3, 2]}), r: 6, leg: 'back'},
        F(40, 884, 20, 882, 'sharp', {f: 2.2, fl: [4, 3], sd: 3}),
        {...F(-10, 862, -16, 862, 'round', {f: 2.3, fl: [3, 2]}), r: 6},
        {...F(-40, 874, -46, 872, 'round', {f: 2.2, fl: [2, 2]}), r: 10, leg: 'press'},
        {...F(-62, 720, -66, 720, 'round', {f: 2.2, fl: [2, 0]}), r: 30, leg: 'press'},
        {...F(-66, 600, -68, 600, 'round', {f: 2.2, fl: [1, 0]}), r: 40, leg: 'press'},
        G(-58, 440, 'round', 30),
        G(-52, 270, 'round', 14),
        G(-40, 218, 'smooth'),
      ],
    },
  ],
  planes: [{a: [-6, 220], b: [-22, 570], side: -1}],
  panels: [{pts: [G(-14, 226), G(30, 230), G(46, 430), G(-8, 554), G(-42, 544), G(-30, 300)], tone: 'lit', op: 0.4}],
};

export const COAT = {q: COAT_Q, p: COAT_P, b: COAT_B};

/** The walk's push on the hem: the front corner rides ahead of the leading knee ('front'), or the headwind presses the
 *  cloth against the leading leg at the node's height ('press': the knee and the shin show through); the back stays
 *  behind the trailing leg ('back'). Returns the node's new position. */
export function walkPush(r: Rig, n: GN, q: V2): V2 {
  if (!n.leg || r.ph === undefined) return q;
  // a soft min / max (no kink where the legs cross)
  const K = 14;
  const smin = (xs: number[]) => -K * Math.log(xs.reduce((acc, x) => acc + Math.exp(-x / K), 0));
  const smax = (xs: number[]) => K * Math.log(xs.reduce((acc, x) => acc + Math.exp(x / K), 0));
  // the cloth follows the legs a little late and smoothed: the average over the last 0.1 s
  const samples = [0, 0.025, 0.05, 0.075, 0.1].map((dt) => (r.legsAt ? r.legsAt(dt) : r.legs));
  // a leg's centre line at height y (the thigh above the knee, the shin below)
  const legX = (l: {hip: V2; knee: V2; ankle: V2}, y: number) => {
    const [a, b] = y <= l.knee[1] ? [l.hip, l.knee] : [l.knee, l.ankle];
    const u = clamp((y - a[1]) / Math.max(1, b[1] - a[1]), 0, 1.2);
    return a[0] + (b[0] - a[0]) * u;
  };
  const y = q[1] + r.body[1];
  if (n.leg === 'press') {
    // the cloth lies on the leg's front (half the leg's width and a little air): the leg pushes it forward at once, the
    // wind presses it back a little late (never behind the leg)
    const now = smin(samples[0].map((l) => legX(l, y)));
    const late = samples.reduce((acc, legs) => acc + smin(legs.map((l) => legX(l, y))), 0) / samples.length;
    return [smin([now, late]) - r.body[0] - 24 + (q[0] - n.p[0]) * 0.3, q[1]];
  }
  if (n.leg === 'front') {
    const lead =
      samples.reduce((acc, legs) => {
        const kx = smin(legs.map((l) => l.knee[0]));
        const ax = smin(legs.map((l) => l.ankle[0]));
        return acc + smin([kx - 26, (kx + ax) / 2 - 30]);
      }, 0) /
        samples.length -
      r.body[0];
    return [smin([q[0], lead + (q[0] - n.p[0]) * 0.4]), q[1] - Math.max(0, n.p[0] - lead) * 0.08];
  }
  const back = samples.reduce((acc, legs) => acc + smax(legs.map((l) => Math.max(legX(l, y), l.knee[0]))), 0) / samples.length - r.body[0];
  return [smax([q[0], back + 34]), q[1]];
}
