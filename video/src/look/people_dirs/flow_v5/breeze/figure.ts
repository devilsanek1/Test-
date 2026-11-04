// FLOW v5, BREEZE: one person, assembled. breeze(look, {view, pose, t, air, px}) -> parts for render.ts. The order of a
// figure, back to front: the contact shadow, the hair ribbons that stream behind, the far leg, the near leg, the neck,
// the garment(s), an acting arm, the head (skin, the eye, the cap), ribbons that fall in front. The paint is set here:
// one soft gradient per shape toward the key (upper left), the garment's long straight planes, and a thin lit rim on
// the key-facing edges sized in SCREEN pixels (px = the figure's height on screen), so it survives at film size.
import {add, lerp, mix, dirA, outline, smin, smax, type V2} from './v';
import type {Part, Paint} from './render';
import {cloth, skin, dark, lc, shift, type Cloth} from './paint';
import {airAt, type Air} from './air';
import {headParts, neckPart, ellipseD, type HF, type View, type Sex} from './head';
import {hairShapes, setBob, type Cut} from './hair';
import {legD, footD, armD, fistD, ik2, type Build, type Joints} from './body';
import {longCoat, type Shape} from './garments';
import {wideTrousers, bigShirt, croppedKnit, biasSkirt, overcoat, shortShirt, boxyJacket} from './wear';
import type {FlowCtx} from './flow';

export type Outfit =
  | {kind: 'coat'; color: string; hem: number; flare?: number}
  | {kind: 'shirtTrousers'; color: string; bottom: string; waist: number; hemW: number}
  | {kind: 'knitSkirt'; color: string; bottom: string; waist: number; hem: number; w: number}
  | {kind: 'overcoat'; color: string; inner: string; hem: number}
  | {kind: 'shortShirt'; color: string; bottom: string; hem: number; hemW: number; waist: number}
  | {kind: 'jacket'; color: string; bottom: string; hem: number; hemW: number};
export type Look = {
  id: string;
  b: Build;
  skin: string;
  hair: string;
  legs: string;
  cut: Cut;
  outfit: Outfit;
  /** one acting arm (else the arms stay inside the garment; a walk swings the near arm) */
  arm?: 'akimbo' | 'pocket';
  /** the person's own view and pose (the cast sheet) */
  view?: View;
  pose?: Pose;
};
export type Pose = {kind: 'stand'; weight?: 'far' | 'near'; wide?: number} | {kind: 'walk'; phase: number};
export type FigOpts = {view: View; pose: Pose; t: number; air: Air; px: number; mono?: boolean};

// ---------------------------------------------------------------- the poses as joints
/** Standing in the wind, front 3/4 facing screen-left: the weight on the far leg, the free knee eased. */
export function standQ(b: Build, wide = 0): Joints {
  const top = 8;
  const hc: V2 = [-14, top + b.head / 2];
  const nb: V2 = [-6, top + b.head + 40];
  const sh = b.sh;
  return {
    view: 'q',
    head: {c: hc, tilt: -2},
    neckBase: nb,
    shF: [nb[0] - sh * 0.44, nb[1] + 46],
    shN: [nb[0] + sh * 0.48, nb[1] + 40],
    hipF: [-30, 497],
    hipN: [30, 506],
    kneeF: [-27 - wide * 0.5, 742],
    kneeN: [12 + wide * 0.5, 750],
    ankleF: [-22 - wide, 980],
    ankleN: [46 + wide, 980],
    footF: {pitch: 0, face: -1},
    footN: {pitch: -3, face: -1},
  };
}
/** Standing from behind (she faces into the picture): the weight on her left (screen-left, upwind) leg. */
export function standB(b: Build, wide = 0): Joints {
  const top = 8;
  const hc: V2 = [-4, top + b.head / 2];
  const nb: V2 = [-2, top + b.head + 40];
  const sh = b.sh;
  return {
    view: 'b',
    head: {c: hc, tilt: -3},
    neckBase: nb,
    shF: [nb[0] - sh * 0.5, nb[1] + 44],
    shN: [nb[0] + sh * 0.5, nb[1] + 40],
    hipF: [-30, 497],
    hipN: [30, 505],
    kneeF: [-28 - wide * 0.5, 742],
    kneeN: [20 + wide * 0.5, 750],
    ankleF: [-25 - wide, 980],
    ankleN: [42 + wide, 980],
    footF: {pitch: 0, face: -1},
    footN: {pitch: 0, face: -1},
  };
}
/** Standing in profile facing screen-left: the weight on the back leg, the front knee eased, a slight lean into the
 *  wind. */
export function standP(b: Build, wide = 0): Joints {
  const top = 8;
  const hc: V2 = [-10, top + b.head / 2];
  const nb: V2 = [0, top + b.head + 40];
  const shp: V2 = [nb[0] + 6, nb[1] + 36];
  return {
    view: 'p',
    head: {c: hc, tilt: -3},
    neckBase: nb,
    shF: shp,
    shN: shp,
    hipF: [6, 500],
    hipN: [2, 502],
    kneeF: [14 + wide * 0.4, 742],
    kneeN: [-18 - wide * 0.4, 744],
    ankleF: [22 + wide, 980],
    ankleN: [-40 - wide, 980],
    footF: {pitch: 0, face: -1},
    footN: {pitch: -4, face: -1},
  };
}
/** The walk's cycle (s) and the body's bob (figure units, + down) at a phase. The walk in profile facing screen-left
 *  (0 = the near heel strikes in front): the camera tracks, the hips stay at x ~ 0, the planted foot slides back;
 *  stance 62 %, two bobs a cycle, the near arm against the near leg. */
export const WALK_T = 1.1;
export const bobAt = (ph: number) => 7 * Math.cos(2 * Math.PI * 2 * (ph - 0.08));
export function walkP(b: Build, ph: number): Joints {
  const f = ((ph % 1) + 1) % 1;
  const TAU = Math.PI * 2;
  const ZF = b.sex === 'm' ? 150 : 138;
  const ZB = b.sex === 'm' ? 160 : 148;
  const ST = 0.62;
  const hgt = b.ankle * 1.9;
  const foot = (s: number): {a: V2; pitch: number} => {
    let x: number;
    let pitch: number;
    let lift = 0;
    if (s < ST) {
      const u = s / ST;
      x = -ZF + (ZF + ZB) * u;
      pitch = u < 0.12 ? -14 * (1 - u / 0.12) : u < 0.6 ? 0 : 36 * Math.pow((u - 0.6) / 0.4, 1.4);
    } else {
      const u = (s - ST) / (1 - ST);
      const e = u * u * (3 - 2 * u);
      x = ZB - (ZF + ZB) * e;
      pitch = u < 0.3 ? 36 - 30 * (u / 0.3) : 6 - 20 * ((u - 0.3) / 0.7);
      lift = 40 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (1 - u * 0.4);
    }
    // the ankle's height when the heel (pitch < 0) or the ball (pitch > 0) is on the ground
    const r = (Math.abs(pitch) * Math.PI) / 180;
    const up = pitch >= 0 ? 0.62 * b.foot * Math.sin(r) : 0.24 * b.foot * Math.sin(r);
    return {a: [x, 1000 - hgt * 0.62 - up - lift], pitch};
  };
  const L1 = 742 - 503;
  const L2 = 1000 - hgt * 0.62 - 742;
  /** the legs at a phase: the hip (with the bob), each foot, each knee */
  const legsAt = (g: number) => {
    const q = ((g % 1) + 1) % 1;
    const hip: V2 = [2, 503 + bobAt(q)];
    const nF = foot(q);
    const fF = foot((q + 0.5) % 1);
    return {hip, nF, fF, kneeN: ik2(hip, nF.a, L1, L2, 1), kneeF: ik2(hip, fF.a, L1, L2, 1)};
  };
  const now = legsAt(f);
  // a moment ago: a coat's tail trails the stride (its follow-through) and lags the bob a little
  const ago = legsAt(f - 0.11);
  const bob = bobAt(f);
  const top = 8 + bob;
  const hc: V2 = [-6, top + b.head / 2];
  const nb: V2 = [4, top + b.head + 40];
  // the near arm swings a little against the near leg, mostly inside the coat; the elbow eased, the forearm lagging
  const sw = (k: number) => -8 * Math.cos(TAU * (f - k)) - 3;
  const a0 = sw(0);
  const lagA = sw(0.08);
  const shp: V2 = [nb[0] + 4, nb[1] + 34];
  const up = 150;
  const fo = 122;
  const el = add(shp, [-Math.sin((a0 * Math.PI) / 180) * up, Math.cos((a0 * Math.PI) / 180) * up]);
  const bend = 8 + 7 * Math.max(0, Math.min(1, (lagA + 11) / 16));
  const fa = a0 + bend;
  const wr = add(el, [-Math.sin((fa * Math.PI) / 180) * fo, Math.cos((fa * Math.PI) / 180) * fo]);
  return {
    view: 'p',
    head: {c: hc, tilt: 0},
    neckBase: nb,
    shF: shp,
    shN: shp,
    hipF: now.hip,
    hipN: now.hip,
    kneeF: now.kneeF,
    kneeN: now.kneeN,
    ankleF: now.fF.a,
    ankleN: now.nF.a,
    footF: {pitch: now.fF.pitch, face: -1},
    footN: {pitch: now.nF.pitch, face: -1},
    phase: f,
    arm: {sh: shp, el, wr, fist: true},
    lag: {
      trail: smax(ago.kneeN[0], ago.kneeF[0], 22),
      lead: smin(ago.kneeN[0], ago.kneeF[0], 22),
      lift: 1.4 * (bob - bobAt(f - 0.12)),
    },
  };
}

// ---------------------------------------------------------------- assembly
const toneOf = (c: Cloth, t: 'lit' | 'shade' | 'deep' | 'base') => (t === 'lit' ? c.lit : t === 'shade' ? c.shade : t === 'base' ? c.base : c.deep);

/** The joints for a view and pose. */
export function jointsOf(b: Build, view: View, pose: Pose): Joints {
  if (pose.kind === 'walk') return walkP(b, pose.phase);
  const wd = pose.wide ?? 0;
  return view === 'b' ? standB(b, wd) : view === 'p' ? standP(b, wd) : standQ(b, wd);
}

/** One acting arm in 3/4 (the near arm): the hand on the hip, or the forearm into a trouser pocket. */
function actingArm(J: Joints, kind: 'akimbo' | 'pocket', waist: number): {sh: V2; el: V2; wr: V2; sleeveTo: number; hand: boolean} {
  const [snx, sny] = J.shN;
  const sh: V2 = [snx - 12, sny + 20];
  if (kind === 'akimbo') return {sh, el: [snx + 62, 372], wr: [snx + 6, waist + 8], sleeveTo: 0.56, hand: true};
  return {sh, el: [snx + 22, 404], wr: [snx - 4, waist + 76], sleeveTo: 0.44, hand: false};
}

export function breeze(L: Look, o: FigOpts): Part[] {
  const b = L.b;
  const J = jointsOf(b, o.view, o.pose);
  const s = o.px / 1000;
  // screen-pixel sizes in figure units
  const px = (v: number) => v / s;
  const rimW = Math.max(px(1.25), Math.min(px(2.4), 3.2));
  const rim = (color: string, op = 1, k = 1) => ({dx: rimW * 0.78 * k, dy: rimW * 0.62 * k, color, opacity: op});
  const w = (t: number) => airAt(o.air, t);
  const cx: FlowCtx = {air: o.air, t: o.t, w, top: J.neckBase[1] + 30};
  const of = L.outfit;
  const C = cloth(of.color);
  const SK = skin(L.skin);
  const HR = dark(L.hair);
  const LG = dark(L.legs);
  const parts: Part[] = [];
  const clothPaint = (c: Cloth, top: number, bot: number): Paint => ({lin: [[-160, top - 40], [200, bot + 40]], stops: [[0, c.lit], [0.55, c.base], [1, shift(c.base, -4)]]});
  const garment = (name: string, g: Shape, c: Cloth, z: number, top: number, o2: {fall?: boolean} = {}): Part => ({
    name,
    d: g.d,
    fill: clothPaint(c, top, g.hem),
    z,
    regions: [
      ...g.planes.map((p) => ({d: p.d, fill: toneOf(c, p.tone), opacity: p.opacity ?? (p.tone === 'lit' ? 0.5 : 0.85), blur: p.blur})),
      // a soft deepening toward the hem: the light falls off down a long shape
      ...(o2.fall === false ? [] : [{d: `M-600 ${g.hem - 260}H600V${g.hem + 300}H-600Z`, fill: {lin: [[0, g.hem - 260], [0, g.hem + 30]], stops: [[0, c.deep, 0], [1, c.deep, 0.3]]} as Paint}]),
    ],
    rim: rim(c.rim, 0.95),
  });

  // the contact shadow
  const gx = (J.ankleF[0] + J.ankleN[0]) / 2;
  parts.push({name: 'shadow', ground: true, d: ellipseD([gx + 10, 1000], 150, 15), fill: {rad: {c: [gx + 10, 1000], r: 150, ry: 15}, stops: [[0, '#000', 0.55], [0.6, '#000', 0.25], [1, '#000', 0]]}, z: 0, blur: px(1.5)});

  // the legs and feet: two slim dark strokes and small wedges, the far one first (trousered legs a little fuller)
  const trousered = of.kind === 'overcoat';
  const lb: Build = trousered ? {...b, knee: b.knee * 1.3, ankle: b.ankle * 1.25} : b;
  const legPaint: Paint = {lin: [[0, 760], [0, 1000]], stops: [[0, LG.base], [1, LG.lit]]};
  const legs: [V2, V2, V2, {pitch: number; face: number}, string][] = [
    [J.hipF, J.kneeF, J.ankleF, J.footF, 'F'],
    [J.hipN, J.kneeN, J.ankleN, J.footN, 'N'],
  ];
  legs.forEach(([hp, kn, an, ft, k], i) => {
    const z = 10 + i * 2;
    parts.push({name: `leg${k}`, d: legD(hp, kn, an, lb), fill: legPaint, z, rim: rim(LG.rim, 0.55)});
    parts.push({name: `foot${k}`, d: footD(an, b, o.view, ft, 1000), fill: shift(LG.base, -2), z: z + 1, rim: rim(LG.rim, 0.55)});
  });

  // the head's frame
  const hf: HF = {c: J.head.c, h: b.head, tilt: J.head.tilt, view: o.view === 'p' || o.pose.kind === 'walk' ? 'p' : o.view};
  const headPx = b.head * s;

  // hair: the cap, the mass and the strands (behind the body unless marked)
  const ph0 = o.pose.kind === 'walk' ? o.pose.phase - o.t / WALK_T : 0;
  setBob(o.pose.kind === 'walk' ? (tt: number) => bobAt(ph0 + tt / WALK_T) : undefined);
  const hs = hairShapes(L.cut, hf, o.air, o.t, w, headPx);
  setBob(undefined);
  const hairPaint: Paint = {lin: [add(hf.c, [-hf.h * 0.5, -hf.h * 0.5]), add(hf.c, [hf.h * 2.2, hf.h * 1.6])], stops: [[0, HR.lit], [0.3, HR.base], [1, shift(HR.base, -2)]]};
  hs.masses.forEach((m, i) => {
    parts.push({name: `mass${i}`, d: m.d, fill: hairPaint, z: m.front ? 33 : 6 + i * 0.01, rim: rim(HR.rim, 0.85)});
  });
  hs.ribs.forEach((r, i) => {
    parts.push({
      name: `rib${i}`,
      d: r.d,
      fill: hairPaint,
      z: r.front ? 33 : 5 + i * 0.01,
      rim: rim(HR.rim, 0.85),
      fade: r.feather ? {a: r.root, b: r.tip, from: 0.55} : {a: r.root, b: add(r.tip, [(r.tip[0] - r.root[0]) * 0.06, (r.tip[1] - r.root[1]) * 0.06]), from: 0.9},
    });
  });

  // the neck
  parts.push(neckPart(hf, J.neckBase, b.neck, SK, hf.view));

  // the garments
  const top = J.neckBase[1];
  let waist = 470;
  if (of.kind === 'coat') {
    const g = longCoat(J, cx, {hem: of.hem, flare: of.flare});
    parts.push(garment('coat', g, C, 20, top));
    // the sleeve plane's small hand tick (05): a closed hand just out of the sleeve's end
    if (g.hand && !J.arm) {
      const hw = b.sex === 'm' ? 19 : 16;
      const hl = b.sex === 'm' ? 27 : 24;
      parts.push({name: 'handTick', d: fistD(g.hand.wr, g.hand.dir, hw, hl), fill: {lin: [g.hand.wr, add(g.hand.wr, [g.hand.dir[0] * hl, g.hand.dir[1] * hl])], stops: [[0, SK.shade], [1, SK.base]]}, z: 20.5, rim: rim(SK.rim, 0.8)});
    }
  } else if (of.kind === 'shirtTrousers') {
    waist = of.waist;
    const B = cloth(of.bottom);
    const [tf, tn] = wideTrousers(J, cx, {waist: of.waist, hemW: of.hemW});
    parts.push(garment('trouserF', tf, B, 15, of.waist, {fall: false}));
    parts.push(garment('trouserN', tn, B, 16, of.waist, {fall: false}));
    parts.push(garment('shirt', bigShirt(J, cx, {waist: of.waist}), C, 20, top, {fall: false}));
  } else if (of.kind === 'knitSkirt') {
    waist = of.waist;
    const B = cloth(of.bottom);
    parts.push(garment('skirt', biasSkirt(J, cx, {waist: of.waist, hem: of.hem, w: of.w}), B, 18, of.waist));
    parts.push(garment('knit', croppedKnit(J, cx, {hem: of.waist + 6, cuff: of.waist + 76}), C, 20, top, {fall: false}));
  } else if (of.kind === 'overcoat') {
    const I = cloth(of.inner);
    const [col, coat] = overcoat(J, cx, {hem: of.hem});
    parts.push(garment('column', col, I, 18, top, {fall: false}));
    parts.push(garment('overcoat', coat, C, 20, top));
  } else if (of.kind === 'shortShirt') {
    const B = cloth(of.bottom);
    waist = of.waist;
    const [tf, tn] = wideTrousers(J, cx, {waist: of.waist, hemW: of.hemW});
    parts.push(garment('trouserF', tf, B, 15, of.waist, {fall: false}));
    parts.push(garment('trouserN', tn, B, 16, of.waist, {fall: false}));
    parts.push(garment('shirt', shortShirt(J, cx, {hem: of.hem}), C, 20, top, {fall: false}));
  } else if (of.kind === 'jacket') {
    const B = cloth(of.bottom);
    const [tf, tn] = wideTrousers(J, cx, {waist: of.hem - 40, hemW: of.hemW});
    parts.push(garment('trouserF', tf, B, 15, of.hem - 40, {fall: false}));
    parts.push(garment('trouserN', tn, B, 16, of.hem - 40, {fall: false}));
    parts.push(garment('jacket', boxyJacket(J, cx, {hem: of.hem}), C, 20, top, {fall: false}));
  }

  // the acting arm: the walk's near arm swings; a standing 3/4 figure may act with one arm
  if (J.arm) {
    const a = armD(J.arm.sh, J.arm.el, J.arm.wr, {upper: b.sex === 'm' ? 36 : 30, wrist: b.sex === 'm' ? 21 : 19}, {len: b.sex === 'm' ? 32 : 30, fist: J.arm.fist});
    parts.push({name: 'hand', d: a.hand, fill: {lin: [J.arm.wr, a.handTip], stops: [[0, SK.base], [1, SK.lit]]}, z: 21, rim: rim(SK.rim, 0.8)});
    // the sleeve in the garment's own colour where it leaves the shoulder (so it emerges from the one shape)
    parts.push({name: 'sleeve', d: a.sleeve, fill: {lin: [add(J.arm.sh, [-30, 0]), add(J.arm.wr, [30, 0])], stops: [[0, C.lit], [1, C.base]]}, z: 22, rim: rim(C.rim, 0.95)});
  } else if (L.arm && o.view === 'q') {
    const A = actingArm(J, L.arm, waist);
    // the bare forearm (a slim skin stroke), the sleeve over the upper arm, a small closed hand
    const fore = armD(A.el, lerp(A.el, A.wr, 0.5), A.wr, {upper: b.sex === 'm' ? 27 : 22, wrist: b.sex === 'm' ? 21 : 17}, {len: b.sex === 'm' ? 30 : 26, fist: true});
    parts.push({name: 'forearm', d: fore.sleeve, fill: {lin: [A.el, A.wr], stops: [[0, SK.shade], [1, SK.base]]}, z: 21, rim: rim(SK.rim, 0.8)});
    if (A.hand) parts.push({name: 'hand', d: fore.hand, fill: SK.base, z: 21.5, rim: rim(SK.rim, 0.8)});
    const upTo = lerp(A.el, A.wr, A.sleeveTo - 0.5);
    const up = armD(A.sh, lerp(A.sh, A.el, 0.55), A.el, {upper: b.sex === 'm' ? 50 : 40, wrist: b.sex === 'm' ? 40 : 34}, {len: 1});
    void upTo;
    parts.push({name: 'sleeve', d: up.sleeve, fill: {lin: [A.sh, A.el], stops: [[0, C.lit], [1, C.base]]}, z: 22, rim: rim(C.rim, 0.95)});
  }

  // the head: skin, the ears, the eye, the cap
  const face = headParts(hf, b.sex as Sex, SK, HR.eye, {px: headPx});
  face.forEach((p) => {
    if (p.name === 'skin') p.rim = rim(SK.rim, 0.9);
    parts.push(p);
  });
  hs.ears.forEach((e, i) => {
    const P = (x: number, y: number): V2 => add(e.c, rot2([x * e.w, y * e.h], e.a));
    const d = outline([
      {p: P(-0.45, -0.42)},
      {p: P(0.1, -0.52)},
      {p: P(0.5, -0.1)},
      {p: P(0.3, 0.42)},
      {p: P(-0.1, 0.5)},
      {p: P(-0.5, 0.1)},
    ]);
    parts.push({name: `ear${i}`, d, fill: SK.base, z: 30.5, regions: headPx >= 24 ? [{d: ellipseD(P(0.05, 0.02), e.w * 0.22, e.h * 0.26), fill: SK.shade, opacity: 0.7, blur: e.w * 0.08}] : [], rim: rim(SK.rim, 0.7)});
  });
  parts.push({name: 'cap', d: hs.cap, fill: hairPaint, z: 32, rim: rim(HR.rim, 0.85)});
  if (hs.bun) parts.push({name: 'bun', d: hs.bun, fill: hairPaint, z: 32.5, rim: rim(HR.rim, 0.85)});
  void mix;
  void dirA;
  void lc;
  return parts;
}

const rot2 = (v: V2, deg: number): V2 => {
  const r = (deg * Math.PI) / 180;
  return [v[0] * Math.cos(r) - v[1] * Math.sin(r), v[0] * Math.sin(r) + v[1] * Math.cos(r)];
};
