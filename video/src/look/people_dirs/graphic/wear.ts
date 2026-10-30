// MODERN GRAPHIC people: garments as a few big, confident masses (design_research.md §8, fashion.md §3-4).
// Each garment is a LOFT of rings (a torso piece, a coat, a skirt) or a TUBE along a limb (a sleeve, a trouser leg),
// drawn as one rounded polygon in its lit colour with its computed shade plane. Crisp corners only where the cloth is
// crisp (a hem, a cuff, a collar's point); dropped shoulders as one soft arc; ONE roomy piece per figure.
import {V2, V3, RV, rpath, poly, add, sub, mul, norm, perp, lerp, dist} from './geo';
import {Cam, Ring, loft, tube, tubeShade, Tube, proj, ringAngles, surf, ringP, frontArc, toCam} from './rig';
import {Frame, framePt, Skel} from './body';
import type {Tone} from './color';
import type {Part, Region} from './part';

/** A ring that follows a torso frame (its centre offset, twist and roll). */
export const fr = (f: Frame, y: number, a: number, b: number, dz = 0, dx = 0): Ring => ({
  y,
  a,
  b,
  x: f.x + dx,
  z: f.z + dz,
  tw: f.tw,
  roll: f.roll,
});
/** Blend two frames (a waist between the pelvis and the chest). */
export const blend = (a: Frame, b: Frame, t: number): Frame => ({
  x: a.x + (b.x - a.x) * t,
  z: a.z + (b.z - a.z) * t,
  roll: a.roll + (b.roll - a.roll) * t,
  tw: a.tw + (b.tw - a.tw) * t,
});

export type LoftOpts = {
  /** corner radius on the side points (one per ring, or one for all) */
  r?: number | number[];
  /** radius at the bottom corners (the hem) and on the top arc's ends */
  hemR?: number;
  topR?: number;
  /** extra regions (deep shadows, sheens) */
  regions?: Region[];
  cut?: string;
  noShade?: boolean;
};
/** A garment loft as a part (two tones). */
export function loftPart(name: string, rings: Ring[], c: Cam, t: Tone, z: number, o: LoftOpts = {}): Part {
  const L = loft(rings, c);
  const n = rings.length;
  const rr = (i: number) => (Array.isArray(o.r) ? o.r[i] ?? 6 : o.r ?? 6);
  const pts: RV[] = [];
  L.top.forEach((p, i) => pts.push([p[0], p[1], i === 0 || i === L.top.length - 1 ? o.topR ?? 4 : 2]));
  for (let i = 1; i < n - 1; i++) pts.push([L.left[i][0], L.left[i][1], rr(i)]);
  L.bottom.forEach((p, i) => pts.push([p[0], p[1], i === 0 || i === L.bottom.length - 1 ? o.hemR ?? 2 : 1]));
  for (let i = n - 2; i >= 1; i--) pts.push([L.right[i][0], L.right[i][1], rr(i)]);
  const regions: Region[] = [];
  if (!o.noShade && L.shade.length) regions.push({d: poly(L.shade), fill: t.shade});
  if (o.regions) regions.push(...o.regions);
  return {name, d: rpath(pts), fill: t.lit, regions, z, cut: o.cut};
}

export type TubeOpts = {
  /** the end caps: round (a limb), flat (a hem or a cuff), none (hidden under something) */
  start?: 'round' | 'flat';
  end?: 'round' | 'flat';
  /** radius of the corners of a flat end */
  endR?: number;
  /** side smoothing radius */
  r?: number;
  regions?: Region[];
  noShade?: boolean;
  /** a ring (in body space) whose front arc is the bottom: a trouser hem seen from above */
  hemRing?: Ring;
};
/** A tube as a part: the two silhouettes joined by its caps, with the shade plane from its terminator. */
export function tubePart(name: string, chain: V3[], radii: number[], c: Cam, t: Tone, z: number | null, o: TubeOpts = {}): Part & {tube: Tube} {
  const tb = tube(chain, radii, c);
  const pts = tubeOutline(tb, radii, c, o);
  const regions: Region[] = [];
  if (!o.noShade) regions.push({d: poly(tubeShade(tb, 200)), fill: t.shade});
  if (o.regions) regions.push(...o.regions);
  return {name, d: rpath(pts), fill: t.lit, regions, z: z ?? tb.z, tube: tb};
}
export function tubeOutline(tb: Tube, radii: number[], c: Cam, o: TubeOpts = {}): RV[] {
  const n = tb.axis.length;
  const r = o.r ?? 12;
  const pts: RV[] = [];
  const cap = (center: V2, dir: V2, rad: number, from: V2, to: V2): RV[] => {
    // a round cap: from -> around the end (along dir) -> to
    const out: RV[] = [];
    const nrm = perp(dir);
    const steps = 4;
    for (let k = 1; k < steps; k++) {
      const a = (Math.PI * k) / steps;
      // rotate from the "from" side through the tip
      const s = sub(from, center);
      const side = dot2(s, nrm) >= 0 ? 1 : -1;
      const p = add(center, add(mul(nrm, side * Math.cos(a) * rad), mul(dir, Math.sin(a) * rad)));
      out.push([p[0], p[1], rad * 0.5]);
    }
    return out;
  };
  // A side down
  tb.A.forEach((p, i) => pts.push([p[0], p[1], i === 0 || i === n - 1 ? (o.start === 'flat' && i === 0) || (o.end === 'flat' && i === n - 1) ? o.endR ?? 3 : r : r]));
  // the end
  if (o.hemRing) {
    const ring = o.hemRing;
    const ang = ringAngles(ring, c);
    // from the A side's end to the B side's end along the ring's front
    const arc = frontArc(ring, c, ang.left, ang.right, 8);
    const aEnd = tb.A[n - 1];
    const bEnd = tb.B[n - 1];
    const ordered = dist(arc[0], aEnd) < dist(arc[arc.length - 1], aEnd) ? arc : arc.slice().reverse();
    // keep the arc's bow, but pin its ends to the silhouettes
    const a0 = ordered[0];
    const a1 = ordered[ordered.length - 1];
    ordered.forEach((p, i) => {
      const t = i / (ordered.length - 1);
      const base = lerp(a0, a1, t);
      const pin = lerp(aEnd, bEnd, t);
      const q = add(pin, sub(p, base));
      if (i > 0 && i < ordered.length - 1) pts.push([q[0], q[1], 2]);
    });
  } else if (o.end !== 'flat') {
    pts.push(...cap(tb.axis[n - 1], tb.dirs[n - 1], radii[n - 1], tb.A[n - 1], tb.B[n - 1]));
  }
  // B side up
  for (let i = n - 1; i >= 0; i--) {
    const p = tb.B[i];
    pts.push([p[0], p[1], i === 0 || i === n - 1 ? (o.start === 'flat' && i === 0) || (o.end === 'flat' && i === n - 1) ? o.endR ?? 3 : r : r]);
  }
  if (o.start !== 'flat') {
    const d0 = mul(tb.dirs[0], -1) as V2;
    pts.push(...cap(tb.axis[0], d0, radii[0], tb.B[0], tb.A[0]));
  }
  return pts;
}
const dot2 = (a: V2, b: V2) => a[0] * b[0] + a[1] * b[1];

// ---------------------------------------------------------------- the long open coat (N1)
export type CoatSpec = {
  tone: Tone;
  /** the inner side of the coat (its facing, seen in the opening's edges and lapels) */
  facing: Tone;
  hemY: number;
  /** half-width at the hem, shoulders (dropped) and chest */
  hemA: number;
  shA: number;
  /** half the opening, in degrees round the front (the front edges at 90 +- open) */
  open: number;
  /** extra depth and forward shift at the hem (a stride pushes the hem) */
  hemB?: number;
  hemZ?: number;
  lapel?: boolean;
  /** draw order of the body (sleeves come with the arms) */
  z: number;
};
export function coatRings(sk: Skel, s: CoatSpec): Ring[] {
  const ch = sk.chest;
  const pv = sk.pelvis;
  const wa = blend(pv, ch, 0.55);
  return [
    fr(ch, 846, 44, 46, -14),
    fr(ch, 812, s.shA - 18, 72, -10),
    fr(ch, 790, s.shA, 82, -8),
    fr(ch, 730, s.shA - 10, 88, -4),
    fr(wa, 620, s.shA - 14, 88, 0),
    fr(pv, 500, s.shA - 6, 92, 2),
    fr(pv, s.hemY, s.hemA, s.hemB ?? 98, s.hemZ ?? 6),
  ];
}
/** The coat body (with its opening cut out and the front edges' facing) and its lapels. */
export function coat(sk: Skel, c: Cam, s: CoatSpec): Part[] {
  const rings = coatRings(sk, s);
  const parts: Part[] = [];
  // the opening: between the two front edges, from above the collar to below the hem
  const edge = (sign: number) =>
    rings.map((r, i) => {
      // the lapels open the edges wider near the top
      const extra = i <= 2 ? 22 - i * 6 : i === 3 ? 6 : 0;
      return surf(r, 90 + sign * (s.open + extra), c);
    });
  const near = edge(-1); // her left of the front (phi < 90)
  const far = edge(+1);
  const nearVis = near.filter((q) => q.facing).length >= 3;
  const farVis = far.filter((q) => q.facing).length >= 3;
  let cut: string | undefined;
  const angs = rings.map((r) => ringAngles(r, c));
  if (nearVis || farVis) {
    // where an edge faces away, the opening runs to the silhouette on that side
    const sidePt = (i: number, sign: number): V2 => {
      const e = (sign < 0 ? near : far)[i];
      if (e.facing) return e.p;
      // a hidden edge: the opening runs out past the silhouette nearest to where that edge projects
      const L = proj(ringP(rings[i], angs[i].left), c);
      const R = proj(ringP(rings[i], angs[i].right), c);
      return Math.abs(L[0] - e.p[0]) < Math.abs(R[0] - e.p[0]) ? [L[0] - 60, L[1]] : [R[0] + 60, R[1]];
    };
    const A = rings.map((_, i) => sidePt(i, -1));
    const B = rings.map((_, i) => sidePt(i, +1));
    const top = [add(A[0], [0, -160]) as V2];
    const topB = [add(B[0], [0, -160]) as V2];
    const bot = add(A[A.length - 1], [0, 160]) as V2;
    const botB = add(B[B.length - 1], [0, 160]) as V2;
    cut = poly([...top, ...A, bot, botB, ...B.slice().reverse(), ...topB]);
  }
  parts.push(
    loftPart('coat', rings, c, s.tone, s.z, {
      r: [6, 30, 34, 20, 10, 10, 3],
      hemR: 3,
      cut,
    }),
  );
  // the front edges' facing: a narrow band inside each visible edge (the cloth's thickness and its inner side)
  const band = (pts: {p: V2; facing: boolean}[], sign: number, tn: Tone, z: number) => {
    const vis = pts.filter((q) => q.facing).map((q) => q.p);
    if (vis.length < 3) return;
    // offset toward the opening by the facing's width
    const w = 7;
    const inner = vis.map((p, i) => {
      const a = vis[Math.max(0, i - 1)];
      const b = vis[Math.min(vis.length - 1, i + 1)];
      const nn = norm(perp(sub(b, a)));
      return add(p, mul(nn, w * (sign < 0 ? 1 : -1)));
    });
    parts.push({name: 'facing', d: poly([...vis, ...inner.reverse()]), fill: tn.lit, z});
  };
  if (s.lapel !== false) {
    // lapels: crisp triangles folded back along each visible edge, from the collar to the break (y ~ 690)
    const lapel = (sign: number) => {
      const r0 = rings[0];
      const rB = {...rings[3], y: 690};
      const topP = surf(r0, 90 + sign * (s.open + 22), c);
      const breakP = surf(rB, 90 + sign * s.open, c);
      const notch = surf({...rings[1], y: 792}, 90 + sign * (s.open + 52), c);
      const tip = surf({...rings[1], y: 768}, 90 + sign * (s.open + 46), c);
      if (!topP.facing || !breakP.facing) return;
      const pts: RV[] = [
        [topP.p[0], topP.p[1], 3],
        [notch.p[0], notch.p[1], 2],
        [tip.p[0], tip.p[1], 2],
        [breakP.p[0], breakP.p[1], 2],
      ];
      // a lapel faces up and out: lit on the key side, a step darker on the far side
      const lit = sign < 0 ? s.facing.lit : s.facing.shade;
      parts.push({name: 'lapel', d: rpath(pts), fill: lit, z: s.z + 1});
    };
    lapel(-1);
    lapel(+1);
  }
  void band; // the facing bands read as outlines: not drawn (the edge is the value step to the inner column)
  return parts;
}

// ---------------------------------------------------------------- tops
export type TopSpec = {tone: Tone; hemY: number; neckA?: number; fit?: number; z: number; hemA?: number};
/** A fine knit or a fitted tee as a torso loft (the sleeves are tubes on the arms). */
export function top(sk: Skel, c: Cam, s: TopSpec): Part {
  const ch = sk.chest;
  const pv = sk.pelvis;
  const b = sk.b;
  const wa = blend(pv, ch, 0.55);
  const fit = s.fit ?? 4;
  const rings: Ring[] = [
    fr(ch, 842, s.neckA ?? 30, 32, -10),
    fr(ch, 812, b.shoulderW / 2 - 14 + fit, 50, -10),
    fr(ch, b.chestY + 30, b.chestW / 2 + fit + 6, b.chestD + fit, -2),
    fr(ch, b.chestY - 15, b.chestW / 2 + fit, b.chestD + fit + 2, 2),
    fr(wa, b.waistY, b.waistW / 2 + fit, b.waistD + fit, 0),
    fr(pv, s.hemY, s.hemA ?? (b.hipW / 2 - 8 + fit), b.hipD - 4 + fit, 0),
  ];
  return loftPart('top', rings, c, s.tone, s.z, {r: [4, 26, 20, 16, 14, 2], hemR: 3});
}

// ---------------------------------------------------------------- trousers
export type TrouserSpec = {
  tone: Tone;
  /** leg radius at the thigh, knee and hem (wide-leg ~ 64, straight ~ 52, slim ~ 44) */
  thigh: number;
  knee: number;
  hem: number;
  /** the hem's height above the sole at the back (it breaks over the shoe) */
  hemY: number;
  /** the waistband's height (high rise ~ 610) */
  riseY: number;
  z: number;
  /** a lighter fade band down the front of the thigh (denim) */
  fade?: string;
};
export function trousers(sk: Skel, c: Cam, s: TrouserSpec): Part[] {
  const parts: Part[] = [];
  const pv = sk.pelvis;
  const b = sk.b;
  // the seat fills only the middle (the crotch); the two legs themselves make the hips, so nothing sticks out
  const seat: Ring[] = [
    fr(pv, s.riseY, b.waistW / 2 + 2, b.waistD + 6, 0),
    fr(pv, b.hipY + 20, b.hipW / 2 - 18, b.hipD + 4, 0),
    fr(pv, b.crotch + 6, b.hipW / 2 - 40, b.hipD - 6, 2),
  ];
  parts.push(loftPart('seat', seat, c, s.tone, s.z, {r: 10, hemR: 14, noShade: true}));
  for (const side of ['l', 'r'] as const) {
    const L = sk.leg[side];
    const out = side === 'l' ? 1 : -1;
    // the leg from the waistband: its outer edge is the hip's curve, then it hangs from the hip's widest point
    const wx = L.hip[0] * 0.78;
    const top: V3 = [wx, s.riseY - 6, L.hip[2]];
    const hipOut: V3 = [L.hip[0] + out * 6, L.hip[1] - 10, L.hip[2]];
    const r0 = Math.max(30, b.waistW / 2 + 6 - Math.abs(wx));
    const ankle = L.ankle;
    const dir = norm3v(sub3v(ankle, L.knee));
    // the hem lands on the shoe: at hemY for a planted foot, just under the ankle for a raised heel
    const hy = Math.max(s.hemY, ankle[1] - 46);
    const k = (ankle[1] - hy) / Math.max(0.2, -dir[1]);
    const hemP: V3 = [ankle[0] + dir[0] * k, hy, ankle[2] + dir[2] * k];
    const chain: V3[] = [top, hipOut, L.knee, hemP];
    const radii = [r0, s.thigh, s.knee, s.hem];
    const tb = tube(chain, radii, c);
    const ring: Ring = {y: hy, a: s.hem, b: s.hem * 0.92, x: hemP[0], z: hemP[2]};
    const pts = tubeOutline(tb, radii, c, {start: 'flat', end: 'flat', r: 10, endR: 2, hemRing: ring});
    const regs: Region[] = [{d: poly(tubeShade(tb, 240)), fill: s.tone.shade}];
    const z = s.z + (tb.z > 0 ? 0.3 : -0.3) + tb.z * 0.001;
    parts.push({name: `leg-${side}`, d: rpath(pts), fill: s.tone.lit, regions: regs, z});
  }
  return parts;
}
const sub3v = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm3v = (a: V3): V3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / l, a[1] / l, a[2] / l];
};

// ---------------------------------------------------------------- sleeves
export type SleeveSpec = {tone: Tone; /** radii at the shoulder, elbow and cuff */ r: [number, number, number]; /** where the cuff ends along the forearm (1 = the wrist) */ len?: number; z?: number};
export function sleeve(sk: Skel, side: 'l' | 'r', c: Cam, s: SleeveSpec): Part & {tube: Tube} {
  const A = sk.arm[side];
  const k = s.len ?? 1;
  const cuff: V3 = [A.el[0] + (A.wr[0] - A.el[0]) * k, A.el[1] + (A.wr[1] - A.el[1]) * k, A.el[2] + (A.wr[2] - A.el[2]) * k];
  // the sleeve's round head sits so its top meets the shoulder line: never a puff above it
  const top = capTop(sk, A.sh, A.el, s.r[0]);
  return tubePart(`sleeve-${side}`, [top, A.el, cuff], [s.r[0], s.r[1], s.r[2]], c, s.tone, s.z ?? null, {
    start: 'round',
    end: 'flat',
    endR: 3,
    r: 14,
  });
}
/** The start of a sleeve: on the upper arm, just low enough that its round head's top meets the shoulder line. */
function capTop(sk: Skel, sh: V3, el: V3, r: number): V3 {
  const want = sk.b.shoulderY + 4 - r;
  if (sh[1] <= want) return sh;
  const t = Math.min(0.6, (sh[1] - want) / Math.max(1, sh[1] - el[1]));
  return lerp3v(sh, el, t);
}
/** The cuff's screen points (the hand comes out of it). */
export function cuffOf(sk: Skel, side: 'l' | 'r', c: Cam, len = 1): {p: V2; dir: V2} {
  const A = sk.arm[side];
  const cuff: V3 = [A.el[0] + (A.wr[0] - A.el[0]) * len, A.el[1] + (A.wr[1] - A.el[1]) * len, A.el[2] + (A.wr[2] - A.el[2]) * len];
  const p = proj(cuff, c);
  const e = proj(A.el, c);
  return {p, dir: norm(sub(p, e))};
}
export const depthOf = (p: V3, c: Cam) => toCam(p, c)[2];

// ---------------------------------------------------------------- bare limbs and short sleeves
/** A bare arm from the shoulder (or partway down the upper arm) to the wrist, in skin. */
export function bareArm(sk: Skel, side: 'l' | 'r', c: Cam, t: Tone, z: number | null, from = 0.0): Part & {tube: Tube} {
  const A = sk.arm[side];
  const b = sk.b;
  const s0: V3 = lerp3v(A.sh, A.el, from);
  return tubePart(`arm-${side}`, [s0, A.el, A.wr], [b.armR * (1 - 0.1 * from), b.elbowR, b.wristR], c, t, z, {start: 'round', end: 'flat', endR: 2, r: 16});
}
/** A short sleeve: from the shoulder to a fraction k of the upper arm. */
export function shortSleeve(sk: Skel, side: 'l' | 'r', c: Cam, t: Tone, r0: number, r1: number, k: number, z: number | null): Part & {tube: Tube} {
  const A = sk.arm[side];
  const top = capTop(sk, A.sh, A.el, r0);
  const end: V3 = lerp3v(A.sh, A.el, k);
  return tubePart(`ssleeve-${side}`, [top, end], [r0, r1], c, t, z, {start: 'round', end: 'flat', endR: 2, r: 12});
}
/** Bare lower legs (below a skirt): knee, calf, ankle. */
export function bareLegs(sk: Skel, c: Cam, t: Tone, z: number): Part[] {
  const b = sk.b;
  return (['l', 'r'] as const).map((side) => {
    const L = sk.leg[side];
    const calf: V3 = lerp3v(L.knee, L.ankle, 0.22);
    const lowCalf: V3 = lerp3v(L.knee, L.ankle, 0.55);
    const p = tubePart(`shin-${side}`, [L.knee, calf, lowCalf, L.ankle], [b.kneeR, b.calfR, b.calfR * 0.72, b.ankleR], c, t, null, {start: 'round', end: 'round', r: 14});
    return {...p, z: z + p.tube.z * 0.001};
  });
}
const lerp3v = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

// ---------------------------------------------------------------- the bomber (N6): roomy body, rib hem band, rib cuffs
export type BomberSpec = {tone: Tone; rib: Tone; z: number; /** the V at the neck showing the tee: depth (y of the zip's end) */ vY?: number};
export function bomber(sk: Skel, c: Cam, s: BomberSpec): Part[] {
  const ch = sk.chest;
  const pv = sk.pelvis;
  const b = sk.b;
  const wa = blend(pv, ch, 0.55);
  const sh = b.shoulderW / 2 - 4;
  const rings: Ring[] = [
    fr(ch, 846, 46, 48, -12),
    fr(ch, 814, sh - 18, 70, -10),
    fr(ch, 790, sh, 82, -6),
    fr(ch, 730, sh - 8, 90, -2),
    fr(wa, 650, sh - 12, 90, 2),
    fr(wa, 616, sh - 18, 86, 2),
    fr(pv, 604, b.waistW / 2 + 16, b.waistD + 16, 2),
  ];
  const band: Ring[] = [fr(pv, 606, b.waistW / 2 + 16, b.waistD + 16, 2), fr(pv, 568, b.waistW / 2 + 18, b.waistD + 16, 2)];
  // the V at the neck: the zip opened to vY
  const vY = s.vY ?? 750;
  const e1 = surf(rings[0], 90 - 26, c);
  const e2 = surf(rings[0], 90 + 26, c);
  const tip = surf({...rings[3], y: vY}, 90, c);
  let cut: string | undefined;
  if (e1.facing || e2.facing || tip.facing) cut = poly([add(e1.p, [0, -80]) as V2, e1.p, tip.p, e2.p, add(e2.p, [0, -80]) as V2]);
  return [
    loftPart('bomber', rings, c, s.tone, s.z, {r: [6, 30, 34, 24, 20, 8, 2], hemR: 2, cut}),
    loftPart('bomberBand', band, c, s.rib, s.z + 0.2, {r: 2, hemR: 3}),
  ];
}
/** A sleeve with a rib cuff (a narrower band at the wrist). */
export function ribSleeve(sk: Skel, side: 'l' | 'r', c: Cam, t: Tone, rib: Tone, r: [number, number, number], z: number): Part[] {
  const A = sk.arm[side];
  const top = capTop(sk, A.sh, A.el, r[0]);
  const cuffStart: V3 = lerp3v(A.el, A.wr, 0.8);
  const cuffEnd: V3 = lerp3v(A.el, A.wr, 0.98);
  const body = tubePart(`sleeve-${side}`, [top, A.el, cuffStart], [r[0], r[1], r[2]], c, t, z, {start: 'round', end: 'flat', endR: 4, r: 14});
  const cuff = tubePart(`cuff-${side}`, [lerp3v(A.el, A.wr, 0.76), cuffEnd], [r[2] * 0.78, r[2] * 0.74], c, rib, z + 0.1, {start: 'flat', end: 'flat', endR: 2, r: 4});
  return [body, cuff];
}

// ---------------------------------------------------------------- the cropped leather jacket (N3)
export type JacketSpec = {tone: Tone; z: number; hemY?: number; zip?: string};
export function leatherJacket(sk: Skel, c: Cam, s: JacketSpec): Part[] {
  const ch = sk.chest;
  const pv = sk.pelvis;
  const b = sk.b;
  const wa = blend(pv, ch, 0.55);
  const sh = b.shoulderW / 2 + 6;
  const hemY = s.hemY ?? 612;
  const rings: Ring[] = [
    fr(ch, 866, 36, 38, -8),
    fr(ch, 834, 44, 44, -12),
    fr(ch, 812, sh - 14, 66, -10),
    fr(ch, 792, sh, 76, -6),
    fr(ch, 730, sh - 8, 84, -2),
    fr(wa, 660, sh - 12, 82, 0),
    fr(wa, hemY, sh - 12, 80, 0),
  ];
  const L = loft(rings, c);
  // the leather's crisp sheen: one streak inside the key-side silhouette, from the shoulder down
  const streak: V2[] = [];
  const inner: V2[] = [];
  for (let i = 2; i < rings.length - 1; i++) {
    const p = L.left[i];
    streak.push([p[0] + 9, p[1] + (i === 2 ? 10 : 0)]);
    inner.push([p[0] + 16, p[1] + (i === 2 ? 10 : 0)]);
  }
  const parts: Part[] = [
    loftPart('jacket', rings, c, s.tone, s.z, {r: [4, 10, 26, 30, 20, 10, 2], hemR: 2, regions: [{d: poly([...streak, ...inner.reverse()]), fill: s.tone.sheen}]}),
  ];
  if (s.zip) {
    // the zip: a true line down the centre front, from the collar to the hem
    const pts: V2[] = [];
    for (const r of [rings[0], rings[2], rings[4], rings[5], rings[6]]) {
      const q = surf(r, 90, c);
      if (q.facing) pts.push(q.p);
    }
    if (pts.length >= 2) parts.push({name: 'zip', d: 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L'), fill: 'none', z: s.z + 0.3, line: {w: 3, color: s.zip, cap: 'butt'}});
  }
  return parts;
}
/** A sleeve with the leather's sheen streak along its key side. */
export function leatherSleeve(sk: Skel, side: 'l' | 'r', c: Cam, t: Tone, r: [number, number, number], z: number): Part {
  const p = sleeve(sk, side, c, {tone: t, r, len: 0.97, z});
  const tb = p.tube;
  // the key-side silhouette is the one NOT in shade; the streak runs just inside it, toward the axis
  const lit = tb.shadeSide === 'A' ? tb.B : tb.A;
  const inward = (i: number): V2 => norm(sub(tb.axis[i], lit[i]));
  const a = lit.slice(1, -1).map((q, j) => add(q, mul(inward(j + 1), 6)) as V2);
  const b2 = lit.slice(1, -1).map((q, j) => add(q, mul(inward(j + 1), 12)) as V2);
  return {...p, regions: [...(p.regions ?? []), {d: poly([...a, ...b2.reverse()]), fill: t.sheen}]};
}

// ---------------------------------------------------------------- the bias satin midi skirt (L3 / N3)
export type SkirtSpec = {tone: Tone; z: number; hemY: number; hemA: number; swing?: number};
export function slipSkirt(sk: Skel, c: Cam, s: SkirtSpec): Part {
  const pv = sk.pelvis;
  const b = sk.b;
  const sw = s.swing ?? 0;
  const rings: Ring[] = [
    fr(pv, 622, b.waistW / 2 + 4, b.waistD + 4, 0),
    fr(pv, 560, b.hipW / 2 - 2, b.hipD + 2, 0),
    fr(pv, 505, b.hipW / 2 + 4, b.hipD + 6, 2),
    fr(pv, 400, b.hipW / 2 + 12, b.hipD + 14, 4, sw * 0.3),
    fr(pv, 300, s.hemA - 14, b.hipD + 24, 6, sw * 0.6),
    fr(pv, s.hemY, s.hemA, b.hipD + 30, 8, sw),
  ];
  const L = loft(rings, c);
  // the satin's sheen: one soft crescent along the key-side hip, thinning as it runs down the bias
  const p0 = L.left[1];
  const p1 = L.left[2];
  const p2 = L.left[3];
  const p3 = L.left[4];
  const sheen: V2[] = [
    [p0[0] + 16, p0[1] + 4],
    [p1[0] + 30, p1[1]],
    [p2[0] + 40, p2[1]],
    [p3[0] + 64, p3[1] + 30],
    [p2[0] + 28, p2[1] + 6],
    [p1[0] + 18, p1[1] + 4],
  ];
  return loftPart('skirt', rings, c, s.tone, s.z, {r: [3, 30, 24, 30, 30, 2], hemR: 3, regions: [{d: poly(sheen), fill: s.tone.sheen}]});
}
