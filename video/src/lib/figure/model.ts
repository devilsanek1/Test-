// lib/figure model: the refined "you" (docs/look/paint_recipes/people.md). One drawing, three views (profile, back,
// rear 3/4), built from the recipe's numbers at a canonical height of 1000 local units (feet on y = 0, the crown at
// y = -1000; a profile faces screen-LEFT, `facing: 1` mirrors it). Every part is one closed smooth loop; the renderer
// (Figure.tsx) paints each in 2-3 flat planes (lit, shade crescent away from the key, a rim on the key side), no outlines.
//
// The design (§a): 6.75 heads (head 0.148 H), shoulders 0.236 H, waist 0.17 H, a mid-calf A-line coat (hem 0.19 H off
// the ground, 0.28 H wide), long tapered legs (hip joints at 0.505 H), a slender neck, an egg head with ONE hair mass and
// a low bun; ONE flowing element: the scarf's free end (wind.ts). No face beyond a hint: in profile the skin's edge
// (brow, nose, lips, chin) and at most one short closed-eye line; from behind a cheek sliver in rear 3/4.
import {type Pt, add, clamp01, curve, deg, ellipsePts, ik, lerp, mirrorX, rot, smooth, tube} from './geom';
import {endChain, ribbonEdges, type Wind} from './wind';

// ---------------------------------------------------------------- the proportions (H = 1000)

export const H = 1000;
export const PROP = {
  /** Crown to chin: 6.75 heads. */
  head: 148,
  chinY: -852,
  shoulderY: -812,
  waistY: -616,
  /** The hip joints (the legs' pivot). */
  hipY: -505,
  thigh: 245,
  shin: 225,
  /** Ankle joint above the sole. */
  ankle: 42,
  /** The coat's hem (mid-calf). */
  hemY: -190,
  upperArm: 182,
  foreArm: 158,
  hand: 64,
  /** Back view half-widths: shoulders, waist, hips, hem. */
  shoulderHalf: 118,
  waistHalf: 84,
  hipHalf: 106,
  hemHalf: 142,
} as const;

// ---------------------------------------------------------------- the parts

export type Mat = 'coat' | 'hair' | 'skin' | 'legs' | 'boots' | 'scarf' | 'scarfTip' | 'box' | 'leaf' | 'phone';

export type Part = {
  k: string;
  /** Closed loop control points (smooth). */
  pts: Pt[];
  tension?: number;
  mat: Mat;
  /** Which plane: 'form' = lit base + shade crescent + rim (the default); a single flat plane otherwise. */
  plane?: 'form' | 'lit' | 'shade' | 'deep' | 'rim';
  /** The shade crescent's width (local units; along the key's opposite direction). 0 = none. */
  shade?: number;
  /** The rim's width (local units; on the key side). 0 = none. */
  rim?: number;
  /** A value overlay (a fold, the belt, a seam): multiplied over the part named `in`, clipped to it. */
  overlay?: {in: string; tint: number};
  /** Lit by the local light (a phone, a doorway): its key-side planes lift toward the light's colour. */
  local?: boolean;
  /** The soft body gradient (a proposal: people.md §b): darken toward the ground inside this part. */
  grad?: boolean;
};
export type Line = {k: string; d: string; w: number; mat: Mat; plane: 'deep' | 'shade' | 'lit'};
export type Build = {parts: Part[]; lines: Line[]; /** The contact shadow under the feet: [cx, half-width]. */ ground: [number, number]};

export type View = 'profile' | 'back' | 'rear34';
export type Carry = 'none' | 'box' | 'phone';
export type FigurePose = {
  view: View;
  /** Walk phase in steps (0 = contact, the near leg forward; 1 = the next contact). Undefined = standing. */
  step?: number;
  /** Standing: the weight on the far (1) or the near (-1) leg (contrapposto). */
  weight?: 1 | -1;
  /** Chin up (+) or down (-), degrees. */
  chin?: number;
  /** rear 3/4: how far the head turns toward the key side (0..1; 0.35 shows a cheek sliver). */
  turn?: number;
  carry?: Carry;
  /** The flowing element's wind (scarf end). */
  wind?: Wind;
  /** Profile only: the one closed-eye line (default true). */
  eye?: boolean;
  /** Stride factor (1 = the recipe's 0.5 H span at contact). */
  stride?: number;
};

// ---------------------------------------------------------------- the walk (profile; Williams' contact-down-pass-up)

/** One leg's foot at cycle phase u (0 = heel strike, 0.6 = toe-off, swing to 1), relative to the hip's x (facing left:
 *  forward = -x). Returns the foot's points (the boot loop) and its ankle. Stance 60 %, swing 40 % (a real walk). */
const FOOT = {
  heel: [24, 42] as Pt,
  ball: [-82, 42] as Pt,
};
/** The ankle boot around the ankle (0, 0), facing left: shaft top, heel block, sole, toe. */
const BOOT: Pt[] = [
  [-24, -66],
  [-25, -30],
  [-44, -6],
  [-80, 10],
  [-102, 24],
  [-106, 36],
  [-98, 42],
  [-40, 42],
  [8, 42],
  [30, 42],
  [31, 30],
  [27, 4],
  [26, -36],
  [24, -68],
];

type FootPose = {ankle: Pt; boot: Pt[]};
function footAt(u: number, hipX: number, D: number, B: number): FootPose {
  const L = FOOT.heel[0] - FOOT.ball[0]; // 106
  const v = (D + B + L) / 0.6; // the walking speed relative to the hip, per cycle
  let pivot: Pt;
  let pivotLocal: Pt;
  let a = 0; // foot rotation (deg): + = clockwise on screen (toe up when pivoting on the heel), - = heel up
  let lift = 0;
  if (u < 0.36) {
    const hx = -D + v * u;
    pivot = [hipX + hx, 0];
    pivotLocal = FOOT.heel;
    a = u < 0.1 ? 14 * (1 - smooth(u / 0.1)) : 0;
  } else if (u < 0.6) {
    const bx = B - v * (0.6 - u);
    pivot = [hipX + bx, 0];
    pivotLocal = FOOT.ball;
    a = -34 * smooth((u - 0.36) / 0.24);
  } else {
    const w = (u - 0.6) / 0.4;
    const e = smooth(w);
    // the ankle travels from the toe-off pose to the heel strike, lifted
    const off = footAt(0.5999, hipX, D, B).ankle;
    const on = footAt(0, hipX, D, B).ankle;
    const ankle: Pt = [off[0] + (on[0] - off[0]) * e, off[1] + (on[1] - off[1]) * e - 58 * Math.sin(Math.PI * Math.min(1, w * 1.05))];
    a = -34 + 48 * smooth((w - 0.1) / 0.9);
    return {ankle, boot: BOOT.map((p) => add(ankle, rot(p, [0, 0], a)))};
  }
  void lift;
  // the ankle from the pivot (the pivot stays on the ground)
  const ankle = add(pivot, rot([-pivotLocal[0], -pivotLocal[1]], [0, 0], a));
  return {ankle, boot: BOOT.map((p) => add(ankle, rot(p, [0, 0], a)))};
}

/** The leg's outline (hip, knee, calf, ankle), facing left: the shin in front, the calf bulging behind. */
function legLoop(hip: Pt, knee: Pt, ankle: Pt, slim = 1): Pt[] {
  const calf = lerp(knee, ankle, 0.3);
  return tube([hip, knee, calf, ankle], [46 * slim, 26 * slim, 27 * slim, 15 * slim], {bulge: [0, 0, -9 * slim, 0]});
}

// ---------------------------------------------------------------- the scarf (the ONE flowing element)

function scarfEnd(root: Pt, rest: number, wind: Wind, side: 1 | -1, length = 270, w0 = 19, w1 = 11): Part[] {
  const c = endChain(root, length, rest, wind, side);
  const {top, bot} = ribbonEdges(c, w0, w1);
  // the upper edge faces the key (lit), the lower half rolls under (shade): two planes along its length
  // a soft rounded tip (one point past the end on the centreline)
  const e = c[c.length - 1];
  const e0 = c[c.length - 2];
  const tipPt: Pt = [e[0] + (e[0] - e0[0]) * 0.35, e[1] + (e[1] - e0[1]) * 0.35];
  const loopPts = [...top, tipPt, ...[...bot].reverse()];
  const mid = c;
  const under = [...mid, ...[...bot].reverse()];
  const n = c.length;
  const k0 = Math.floor(n * 0.86);
  const tipTop = top.slice(k0);
  const tipBot = bot.slice(k0);
  const tip = [...tipTop, tipPt, ...[...tipBot].reverse()];
  return [
    {k: 'scarfEnd', pts: loopPts, tension: 0.4, mat: 'scarf', plane: 'lit', rim: 0},
    {k: 'scarfUnder', pts: under, tension: 0.4, mat: 'scarf', plane: 'shade'},
    {k: 'scarfTip', pts: tip, tension: 0.3, mat: 'scarfTip', plane: 'lit'},
  ];
}

// ---------------------------------------------------------------- PROFILE (facing left)

function profile(p: FigurePose): Build {
  const parts: Part[] = [];
  const lines: Line[] = [];
  const walking = p.step !== undefined;
  const st = p.stride ?? 1;
  const D = 165 * st;
  const B = 235 * st;
  const carry = p.carry ?? 'none';
  const wind = p.wind ?? {t: 0, strength: 1};

  // ---- legs: near (u) and far (u + 0.5)
  const step = p.step ?? 0;
  const uN = (((step / 2) % 1) + 1) % 1;
  const uF = (uN + 0.5) % 1;
  let fN: FootPose;
  let fF: FootPose;
  if (walking) {
    fN = footAt(uN, 0, D, B);
    fF = footAt(uF, 0, D, B);
  } else {
    // standing: the near foot a little forward, the far foot under the hip; the boots flat
    const flat = (x: number): FootPose => {
      const ankle: Pt = [x, -FOOT.heel[1]];
      return {ankle, boot: BOOT.map((q) => add(ankle, q))};
    };
    fN = flat(-30);
    fF = flat(22);
  }
  // the hip height: as high as both planted legs allow (the walk's down / up comes out of it)
  const reach = PROP.thigh + PROP.shin - 4;
  const hipFor = (a: Pt, hx: number) => a[1] - Math.sqrt(Math.max(0, reach * reach - (a[0] - hx) ** 2));
  const hx = walking ? 0 : 0;
  let hipY = PROP.hipY;
  for (const f of [fN, fF]) if (f.ankle[1] > -60) hipY = Math.max(hipY, hipFor(f.ankle, hx));
  const bob = hipY - PROP.hipY;
  const hip: Pt = [hx + 4, hipY];
  const kneeN = ik(hip, fN.ankle, PROP.thigh, PROP.shin, [-1, 0]);
  const kneeF = ik(hip, fF.ankle, PROP.thigh, PROP.shin, [-1, 0]);

  // the far leg and boot first (behind), in their shade plane: depth by value
  parts.push({k: 'legF', pts: legLoop(hip, kneeF, fF.ankle, 0.96), mat: 'legs', plane: 'shade'});
  parts.push({k: 'bootF', pts: fF.boot, tension: 0.35, mat: 'boots', plane: 'shade'});

  // ---- the arms' pivots (the shoulder joint), the swing opposite the legs
  const lean = walking ? 3 : 0; // a walk leans ~3 degrees into the step
  const sh: Pt = [8 - lean * 2.5, -790 + bob * 0.85];
  const swing = walking ? -19 * Math.cos(Math.PI * step) : 0; // + = the near arm forward: opposite the near leg (counterpose)
  const arm = (a: number, bend: number) => {
    const elbow: Pt = [sh[0] - PROP.upperArm * Math.sin(deg(a)), sh[1] + PROP.upperArm * Math.cos(deg(a))];
    const fa = a + bend;
    const wrist: Pt = [elbow[0] - PROP.foreArm * Math.sin(deg(fa)), elbow[1] + PROP.foreArm * Math.cos(deg(fa))];
    const dir: Pt = [-Math.sin(deg(fa)), Math.cos(deg(fa))];
    const nv: Pt = [-dir[1], dir[0]];
    const h0 = add(wrist, [dir[0] * -6, dir[1] * -6]);
    const handPts: Pt[] = [
      add(h0, [nv[0] * 13, nv[1] * 13]),
      add(wrist, [dir[0] * 28 + nv[0] * 14, dir[1] * 28 + nv[1] * 14]),
      add(wrist, [dir[0] * PROP.hand * 0.9 + nv[0] * 3, dir[1] * PROP.hand * 0.9 + nv[1] * 3]),
      add(wrist, [dir[0] * 34 - nv[0] * 10, dir[1] * 34 - nv[1] * 10]),
      add(h0, [-nv[0] * 12, -nv[1] * 12]),
    ];
    const sleeve = tube([sh, elbow, wrist], [37, 31, 29]);
    return {elbow, wrist, sleeve, handPts};
  };
  let armF: ReturnType<typeof arm>;
  let armN: ReturnType<typeof arm>;
  if (carry === 'box') {
    armF = arm(30, 66);
    armN = arm(24, 70);
  } else if (carry === 'phone') {
    armF = arm(16, 112);
    armN = arm(10, 118);
  } else if (walking) {
    armF = arm(-swing, 8 + Math.max(0, -swing) * 0.9);
    armN = arm(swing, 8 + Math.max(0, swing) * 0.9);
  } else {
    armF = arm(-4, 6);
    armN = arm(3, 8);
  }
  // far arm behind the coat (its shade plane), its hand
  parts.push({k: 'armF', pts: armF.sleeve, mat: 'coat', plane: 'shade'});
  parts.push({k: 'handF', pts: armF.handPts, tension: 0.55, mat: 'skin', plane: 'shade'});

  // ---- the near leg
  parts.push({k: 'legN', pts: legLoop(hip, kneeN, fN.ankle), mat: 'legs', shade: 14, rim: 7});
  parts.push({k: 'bootN', pts: fN.boot, tension: 0.35, mat: 'boots', shade: 12, rim: 6});

  // ---- the coat: an A-line from the shoulders to mid-calf, pushed by the forward knee, kicked by the back leg
  const kF = Math.min(kneeN[0], kneeF[0]);
  const kB = Math.max(kneeN[0], kneeF[0]);
  const y0 = bob * 0.9;
  const L = lean;
  const lx = (x: number, y: number) => x + (L * (y + 190)) / 190 * -0.05; // the lean: the top forward
  // the cloth falls from the forward knee (a little flare in front of it) and drapes over the back calf
  const frontHem = Math.min(-84, kF - 30);
  const backHem = Math.max(112, kB + 70);
  const coat: Pt[] = [
    [lx(-30, -826), -826 + y0],
    [lx(-52, -796), -796 + y0],
    [lx(-66, -730), -730 + y0],
    [lx(-60, -676), -676 + y0],
    [lx(-50, -624), -624 + y0],
    [lx(-58, -548), -548 + y0],
    [Math.min(-64, kF * 0.55 - 40), -420 + y0],
    [Math.min(-74, kF - 22), -292 + y0],
    [frontHem, -196 + y0 * 0.6],
    [frontHem * 0.4 + backHem * 0.2, -184 + y0 * 0.6],
    [backHem, -186 + y0 * 0.6],
    [Math.max(88, kB * 0.5 + 40), -340 + y0],
    [70, -480 + y0],
    [48, -622 + y0],
    [56, -700 + y0],
    [64, -762 + y0],
    [44, -808 + y0],
    [22, -830 + y0],
  ];
  parts.push({k: 'coat', pts: coat, tension: 0.5, mat: 'coat', shade: 62, rim: 9, grad: true, local: true});
  // a fold: one long tapering shade shape from the hip to the hem, behind the forward knee (never a line)
  const foldTop: Pt = [6, -520 + y0];
  parts.push({
    k: 'fold',
    pts: [foldTop, [24, -420 + y0], [kB * 0.25 + 30, -196 + y0 * 0.6], [kB * 0.15 + 4, -190 + y0 * 0.6], [-2, -400 + y0]],
    tension: 0.5,
    mat: 'coat',
    overlay: {in: 'coat', tint: 0.8},
  });
  // the belt: a band one value step down, the knot at the side
  parts.push({k: 'belt', pts: [[-90, -636 + y0], [90, -636 + y0], [90, -604 + y0], [-90, -604 + y0]], tension: 0, mat: 'coat', overlay: {in: 'coat', tint: 0.78}});
  parts.push({k: 'knot', pts: ellipsePts([-46, -616 + y0], 15, 13, 8), mat: 'coat', plane: 'shade'});
  parts.push({k: 'tails', pts: [[-48, -610 + y0], [-38, -606 + y0], [-34, -540 + y0], [-48, -536 + y0], [-56, -560 + y0]], tension: 0.4, mat: 'coat', plane: 'shade'});

  // ---- carry: the box (kraft, two planes and a tape strip), a plant's leaves out of the top
  if (carry === 'box') {
    const bx0 = -262;
    const bx1 = -40;
    const by0 = -762 + y0;
    const by1 = -616 + y0;
    for (const [i, lp] of [
      [0, [[-150, by0 + 4], [-178, by0 - 70], [-160, by0 - 96], [-140, by0 - 40]]],
      [1, [[-120, by0 + 4], [-112, by0 - 104], [-90, by0 - 120], [-98, by0 - 30]]],
      [2, [[-96, by0 + 4], [-58, by0 - 66], [-36, by0 - 70], [-70, by0 - 8]]],
    ] as [number, Pt[]][])
      parts.push({k: `leaf${i}`, pts: lp, tension: 0.55, mat: 'leaf', shade: 8});
    parts.push({k: 'box', pts: [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]], tension: 0, mat: 'box', shade: 54, rim: 8, local: true});
    parts.push({k: 'boxTop', pts: [[bx0, by0], [bx1, by0], [bx1 - 6, by0 + 16], [bx0 + 6, by0 + 16]], tension: 0, mat: 'box', plane: 'rim'});
    parts.push({k: 'boxTape', pts: [[bx0, by0 + 52], [bx1, by0 + 52], [bx1, by0 + 66], [bx0, by0 + 66]], tension: 0, mat: 'box', overlay: {in: 'box', tint: 0.86}});
  }

  // ---- the near arm over the coat (or the box's front)
  parts.push({k: 'armN', pts: armN.sleeve, mat: 'coat', shade: 18, rim: 7, local: true});
  parts.push({k: 'handN', pts: armN.handPts, tension: 0.55, mat: 'skin', shade: 10, local: true});
  if (carry === 'phone') {
    const w = lerp(armN.wrist, armF.wrist, 0.5);
    const ph: Pt = [w[0] - 30, w[1] - 10];
    parts.push({k: 'phone', pts: [rot([ph[0] - 6, ph[1] - 30], ph, -28), rot([ph[0] + 8, ph[1] - 30], ph, -28), rot([ph[0] + 8, ph[1] + 30], ph, -28), rot([ph[0] - 6, ph[1] + 30], ph, -28)], tension: 0, mat: 'phone', plane: 'deep'});
  }

  // ---- the head (rotated about the neck top by the chin tilt and the lean)
  const chin = (p.chin ?? 4) + (carry === 'phone' ? -20 : 0);
  const piv: Pt = [-2, -858 + bob * 0.85];
  const H0 = (q: Pt): Pt => rot([q[0] - lean * 3, q[1] + bob * 0.85], piv, chin);
  const skin: Pt[] = (
    [
      [-18, -960],
      [-44, -948],
      [-50, -928],
      [-52, -914],
      [-54, -906],
      [-66, -889],
      [-62, -883],
      [-55, -881],
      [-57, -873],
      [-53, -867],
      [-53, -860],
      [-45, -850],
      [-27, -847],
    ] as Pt[]
  ).map(H0);
  // the neck stays on the shoulders (not rotated): a slender column
  const neck: Pt[] = [
    [-30 - lean * 2, -824 + bob * 0.85],
    [-31 - lean * 2.4, -790 + bob * 0.85],
    [22 - lean * 2.4, -790 + bob * 0.85],
  ];
  const back: Pt[] = ([[22, -842], [28, -880], [34, -930], [10, -966]] as Pt[]).map(H0);
  parts.push({k: 'skin', pts: [...skin, ...neck, ...back], tension: 0.42, mat: 'skin', shade: 20, rim: 6, local: true});
  const hair: Pt[] = (
    [
      [-46, -948],
      [-51, -970],
      [-36, -994],
      [-6, -1004],
      [30, -998],
      [58, -978],
      [71, -950],
      [70, -918],
      [58, -892],
      [40, -880],
      [24, -886],
      [12, -902],
      [0, -914],
      [-12, -928],
      [-30, -936],
      [-42, -940],
    ] as Pt[]
  ).map(H0);
  parts.push({k: 'hair', pts: hair, tension: 0.5, mat: 'hair', shade: 30, rim: 7});
  parts.push({k: 'bun', pts: ellipsePts(H0([66, -902]), 29, 27, 10), mat: 'hair', shade: 16, rim: 6});
  if (p.eye ?? true) {
    lines.push({k: 'eye', d: curve(([[-45, -917], [-38, -912.5], [-30, -914]] as Pt[]).map(H0)), w: 4.6, mat: 'hair', plane: 'deep'});
  }

  // ---- the scarf: the wrap at the neck, a short end over the chest, the long end thrown back (the flowing element)
  const wrap: Pt[] = (
    [
      [-34, -846],
      [-48, -828],
      [-50, -806],
      [-36, -788],
      [-4, -782],
      [28, -788],
      [46, -806],
      [46, -834],
      [32, -854],
      [0, -846],
    ] as Pt[]
  ).map(([x, y]) => [x - lean * 2.4, y + bob * 0.85] as Pt);
  const rootPt: Pt = [36 - lean * 2.4, -826 + bob * 0.85];
  const ends = scarfEnd(rootPt, walking ? 16 : 30, wind, 1);
  parts.push(...ends);
  if (carry !== 'box') {
    const fe = tube([[-36 - lean * 2.4, -806 + bob * 0.85], [-42 - lean * 2.2, -756 + bob * 0.85], [-45 - lean * 1.8, -712 + bob * 0.85]], [18, 17, 16]);
    parts.push({k: 'scarfFront', pts: fe, mat: 'scarf', shade: 12, local: true});
  }
  parts.push({k: 'scarfWrap', pts: wrap, tension: 0.5, mat: 'scarf', shade: 26, rim: 7, local: true});

  const gx = (fN.ankle[0] + fF.ankle[0]) / 2 - 30;
  return {parts, lines, ground: [gx, 150 + Math.abs(fN.ankle[0] - fF.ankle[0]) * 0.5]};
}

// ---------------------------------------------------------------- BACK and REAR 3/4 (seen from behind)

/** A leg seen from behind: hip, knee, ankle; the calf curves on both sides. */
function backLeg(hip: Pt, knee: Pt, ankle: Pt, outer: 1 | -1): Pt[] {
  const calf = lerp(knee, ankle, 0.32);
  const c2 = lerp(knee, ankle, 0.7);
  return tube([hip, knee, calf, c2, ankle], [48, 27, 29, 21, 15], {bulge: [0, 0, 4 * outer, 0, 0]});
}
/** A boot seen from behind: the shaft, the heel; `lift` 0..1 raises the heel and shows the sole (walking away). */
function backBoot(ankle: Pt, lift: number, outer: 1 | -1): {boot: Pt[]; sole?: Pt[]} {
  const [x, y] = ankle;
  const toe = 10 * outer; // a sliver of the foot shows on the outer side
  if (lift < 0.05) {
    return {
      boot: [
        [x - 22, y - 62],
        [x + 22, y - 62],
        [x + 23 + Math.max(0, toe), y - 10],
        [x + 22 + Math.max(0, toe), y + 34],
        [x + 20 + Math.max(0, toe), y + 42],
        [x - 20 + Math.min(0, toe), y + 42],
        [x - 22 + Math.min(0, toe), y + 34],
        [x - 23 + Math.min(0, toe), y - 10],
      ],
    };
  }
  // the heel lifted toward us: the boot foreshortened, the sole a dark crescent at its bottom
  const h = 42 - 10 * lift;
  const s = 8 + 14 * lift;
  return {
    boot: [
      [x - 21, y - 60],
      [x + 21, y - 60],
      [x + 23, y - 6],
      [x + 21, y + h],
      [x - 21, y + h],
      [x - 23, y - 6],
    ],
    sole: [
      [x - 21, y + h - s],
      [x + 21, y + h - s],
      [x + 21, y + h],
      [x - 21, y + h],
    ],
  };
}

function behind(p: FigurePose): Build {
  const parts: Part[] = [];
  const lines: Line[] = [];
  const r34 = p.view === 'rear34';
  const turn = r34 ? (p.turn ?? 0.38) : 0;
  const walking = p.step !== undefined;
  const wind = p.wind ?? {t: 0, strength: 1};
  // asymmetry of the rear 3/4: the key-side (left) shoulder seen wider, the far side narrower
  const ax = (x: number) => (x < 0 ? x * (1 + 0.06 * turn) : x * (1 - 0.14 * turn)) - 10 * turn;

  // ---- legs
  let hipL: Pt;
  let hipR: Pt;
  let ankL: Pt;
  let ankR: Pt;
  let liftL = 0;
  let liftR = 0;
  let tilt = 0; // the hem's tilt (+ = higher on the right)
  if (walking) {
    // walking away: the left leg planted under the body, the right foot lifting at toe-off (nearer to us: lower, its
    // sole showing), the hips dropping a little on the free side
    const ph = (((p.step ?? 0) % 2) + 2) % 2;
    const k = Math.sin(Math.PI * ph); // 0..1..0 over a step
    hipL = [-44, PROP.hipY - 6];
    hipR = [44, PROP.hipY + 6];
    ankL = [-34, -PROP.ankle];
    ankR = [40, -PROP.ankle - 60 * (0.6 + 0.4 * k) + 22];
    liftR = 0.6 + 0.4 * k;
    tilt = -6;
  } else {
    // standing, contrapposto: the weight on the right leg (straight, under the centre), the left knee soft and the foot
    // turned out a little forward (up the screen); the right hip higher
    const wR = (p.weight ?? 1) === 1;
    hipL = [ax(-46), PROP.hipY + (wR ? 8 : -8)];
    hipR = [ax(46), PROP.hipY + (wR ? -8 : 8)];
    ankL = wR ? [ax(-70), -PROP.ankle - 14] : [ax(-30), -PROP.ankle];
    ankR = wR ? [ax(22), -PROP.ankle] : [ax(70), -PROP.ankle - 14];
    tilt = wR ? 8 : -8;
  }
  // seen from behind the knee bends in depth: on screen it stays on the hip-ankle line
  const kneeL = lerp(hipL, ankL, 0.52);
  const kneeR = lerp(hipR, ankR, walking ? 0.6 : 0.52);
  const bootL = backBoot(ankL, liftL, -1);
  const bootR = backBoot(ankR, liftR, 1);
  parts.push({k: 'legL', pts: backLeg(hipL, kneeL, ankL, -1), mat: 'legs', shade: 16, rim: 6});
  parts.push({k: 'legR', pts: backLeg(hipR, kneeR, ankR, 1), mat: 'legs', shade: 16, rim: 6});
  parts.push({k: 'bootL', pts: bootL.boot, tension: 0.3, mat: 'boots', shade: 12, rim: 5});
  parts.push({k: 'bootR', pts: bootR.boot, tension: 0.3, mat: 'boots', shade: 12, rim: 5});
  if (bootR.sole) parts.push({k: 'soleR', pts: bootR.sole, tension: 0.2, mat: 'boots', plane: 'deep'});

  // ---- the arms (hanging; walking away they swing in depth: the forward one shorter, the back one longer)
  const armSide = (side: 1 | -1, swingK: number) => {
    // the sleeve hangs from a rounded shoulder, a little off the body, the elbow soft, the hand turned in
    const sh: Pt = [ax(side * 92), -792];
    const lenK = 1 - 0.1 * swingK; // foreshortened when swinging away from us
    const elbow: Pt = [sh[0] + side * 34, sh[1] + PROP.upperArm * lenK];
    const wrist: Pt = [elbow[0] - side * 16, elbow[1] + PROP.foreArm * lenK * (1 - 0.15 * swingK)];
    const sleeve = tube([sh, lerp(sh, elbow, 0.5), elbow, wrist], [34, 30, 25, 22]);
    const hand: Pt[] = [
      [wrist[0] - 12, wrist[1] - 4],
      [wrist[0] + 12, wrist[1] - 4],
      [wrist[0] + 10 - side * 2, wrist[1] + 30],
      [wrist[0] - side * 4, wrist[1] + 48 * (1 - 0.4 * swingK)],
      [wrist[0] - 10 - side * 3, wrist[1] + 28],
    ];
    return {sleeve, hand};
  };
  const swing = walking ? 1 : 0;
  const aL = armSide(-1, walking ? 0.2 * swing : 0);
  const aR = armSide(1, walking ? 1 * swing : 0);

  // ---- the coat (A-line, belted)
  const hemL = -PROP.hemHalf + 12 - (walking ? 4 : 0);
  const hemR = PROP.hemHalf - 12 + (walking ? 6 : 0);
  const half: Pt[] = [
    [-26, -844],
    [-64, -834],
    [-96, -816],
    [-110, -794],
    [-109, -740],
    [-92, -660],
    [-80, -620],
    [-90, -566],
    [-102, -506],
    [-112, -410],
    [-121, -300],
  ];
  const left = half.map(([x, y]) => [ax(x), y] as Pt);
  const right = mirrorX(half)
    .reverse()
    .map(([x, y]) => [ax(x), y] as Pt);
  const hemY = (x: number) => PROP.hemY + 4 - (tilt * x) / PROP.hemHalf;
  const coat: Pt[] = [
    ...left,
    [ax(hemL), hemY(hemL)],
    [ax(hemL * 0.5), hemY(hemL * 0.5) + 4],
    [ax(0), hemY(0) + 6],
    [ax(hemR * 0.5), hemY(hemR * 0.5) + 4],
    [ax(hemR), hemY(hemR)],
    ...right,
  ];
  parts.push({k: 'armR', pts: aR.sleeve, mat: 'coat', plane: 'shade'});
  parts.push({k: 'handR', pts: aR.hand, tension: 0.5, mat: 'skin', plane: 'shade'});
  parts.push({k: 'coat', pts: coat, tension: 0.5, mat: 'coat', shade: 74, rim: 9, grad: true});
  // the centre back: a vent from the hem (a slim value shape), the belt band, the hips' fold on the free side
  parts.push({k: 'vent', pts: [[ax(-3), -300], [ax(3), -300], [ax(10), hemY(0) + 6], [ax(-6), hemY(0) + 6]], tension: 0.2, mat: 'coat', overlay: {in: 'coat', tint: 0.74}});
  parts.push({k: 'belt', pts: [[-140, -638], [140, -638], [140, -604], [-140, -604]], tension: 0, mat: 'coat', overlay: {in: 'coat', tint: 0.78}});
  parts.push({
    k: 'fold',
    pts: [[ax(-60), -560], [ax(-40), -420], [ax(-56), hemY(-56) + 4], [ax(-84), hemY(-84) + 4], [ax(-76), -420]],
    tension: 0.5,
    mat: 'coat',
    overlay: {in: 'coat', tint: 0.84},
  });
  parts.push({k: 'armL', pts: aL.sleeve, mat: 'coat', shade: 18, rim: 7});
  parts.push({k: 'handL', pts: aL.hand, tension: 0.5, mat: 'skin', shade: 8});

  // ---- the scarf wrap, the head, the bun; the flowing end blown to the right
  const wrap: Pt[] = [
    [ax(-60), -852],
    [ax(-70), -826],
    [ax(-58), -804],
    [ax(0), -796],
    [ax(58), -804],
    [ax(70), -826],
    [ax(62), -852],
    [ax(0), -862],
  ];
  const hx = -14 * turn; // the head turns toward the key side
  const head: Pt[] = (
    [
      [0, -1004],
      [40, -995],
      [60, -964],
      [62, -924],
      [52, -892],
      [33, -874],
      [0, -868],
      [-33, -874],
      [-52, -892],
      [-62, -924],
      [-60, -964],
      [-40, -995],
    ] as Pt[]
  ).map(([x, y]) => [x + hx, y] as Pt);
  if (turn > 0) {
    // rear 3/4: a cheek and jaw sliver on the key side (no features, ever)
    const cw = 18 * clamp01(turn / 0.4);
    parts.push({
      k: 'cheek',
      pts: [
        [hx - 50, -940],
        [hx - 62 - cw * 0.45, -912],
        [hx - 62 - cw * 0.6, -884],
        [hx - 50 - cw * 0.55, -856],
        [hx - 34 - cw * 0.3, -842],
        [hx - 24, -856],
        [hx - 40, -900],
      ],
      tension: 0.5,
      mat: 'skin',
      shade: 0,
      rim: 6,
    });
  }
  const ends = scarfEnd([ax(54), -836], 24, wind, 1, 270, 19, 11);
  parts.push(...ends);
  parts.push({k: 'scarfWrap', pts: wrap, tension: 0.5, mat: 'scarf', shade: 34, rim: 7});
  parts.push({k: 'hair', pts: head, tension: 0.5, mat: 'hair', shade: 46, rim: 8});
  const bc: Pt = [hx + 34 * turn, -884];
  parts.push({k: 'bun', pts: ellipsePts(bc, 31, 29, 10), mat: 'hair', shade: 18, rim: 6});
  parts.push({k: 'bunUnder', pts: [[bc[0] - 22, bc[1] + 14], [bc[0] + 22, bc[1] + 14], [bc[0] + 10, bc[1] + 29], [bc[0] - 10, bc[1] + 29]], tension: 0.6, mat: 'hair', plane: 'deep'});

  const gx = (ankL[0] + ankR[0]) / 2;
  return {parts, lines, ground: [gx, 150]};
}

/** The figure's parts for a pose (local units, H = 1000; profile faces screen-left). */
export function buildFigure(p: FigurePose): Build {
  return p.view === 'profile' ? profile(p) : behind(p);
}
