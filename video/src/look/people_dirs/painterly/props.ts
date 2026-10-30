// people_dirs/painterly: accessories that read at our sizes (fashion.md §6): a stand collar, a slouchy shoulder bag on a
// strap (a strap IS a line), a cap (its brim an open plate: the top in the light, the underside in shade), an iced
// coffee (the hand's reason), oversized sunglasses (the most current generic face: one reflection streak).
import {type FaceShape, type Q4, type Skeleton, fx, fy, fz, headPoint, ring4, rowsFor, tube} from './body';
import {type V3, add, lerp, mix, nrm, scl, smooth, sub, toWorld, cross, D2R, spline} from './math';
import {type Cam, type Surface, project, toCam} from './mesh';
import {type DecalFn, polyD, smoothD} from './paint';
import type {Part} from './figure';
import {shellPoint, angOf} from './hair';

// ---------------------------------------------------------------- a stand collar around the neck's base

export function collarSurface(sk: Skeleton, c: {key: string; mat: string; h: number; gap: number; ease: number}, res: number): Surface {
  const b = sk.b;
  const base = add(sk.neckBase, [0, -12, 0]);
  const top = add(sk.neckBase, scl(nrm(sub(sk.head.o, sk.neckBase)), c.h));
  const rows = rowsFor(8, res, 4);
  const cols = rowsFor(40, res, 14);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const o = lerp(base, top, t);
    const r = b.neckR + c.ease + 4 * t;
    const q: Q4 = {f: r * 1.02, b: r * 1.12, p: r * 1.08, m: r * 1.08, nf: 2.1, nb: 2.2};
    grid.push(ring4(o, fx(sk.chest), fz(sk.chest), q, cols));
    axis.push(o);
  }
  const mask = (i: number, j: number) => {
    const ang = angOf((j / cols) * Math.PI * 2);
    return Math.abs(ang) - c.gap * (1 + 0.6 * (i / (rows - 1)));
  };
  return {key: c.key, mat: c.mat, grid, axis, wrap: true, open: true, mask, bias: 34, look: {spec: {p: 26, t: 0.4}, blur: 4}};
}

// ---------------------------------------------------------------- a slouchy shoulder bag under the arm, on a strap

export function bagSurfaces(sk: Skeleton, side: 'L' | 'R', bg: {mat: string; strap: string; at?: V3; size?: number}, res: number): Part {
  const s = side === 'L' ? 1 : -1;
  const k = bg.size ?? 1;
  const c = toWorld(sk.pelvis, bg.at ?? [s * 132, 4, -4]);
  const fwd = nrm(fz(sk.pelvis));
  const up = nrm(fy(sk.pelvis));
  // a soft crescent: a tube along a shallow arc (front-back), its rings tall and thin, the bottom fuller
  const L = 78 * k;
  const chain: V3[] = [add(add(c, scl(fwd, L)), scl(up, 22 * k)), add(c, scl(up, -6 * k)), add(add(c, scl(fwd, -L)), scl(up, 20 * k))];
  const t = tube(
    chain,
    rowsFor(18, res, 8),
    rowsFor(20, res, 10),
    (tt) => {
      const w = Math.sin(Math.PI * Math.min(1, Math.max(0, tt))) ** 0.6;
      return {f: 44 * k * w + 3, b: 34 * k * w + 3, p: 16 * k * w + 2, m: 14 * k * w + 2, nf: 2.4, nb: 2.0};
    },
    () => [s, 0, 0],
    {capStart: true, capEnd: true},
  );
  // the tube's ring "front" axis is perpendicular to the chain: make it point up (the bag's height)
  const bag: Surface = {key: 'bag', mat: bg.mat, grid: t.grid, axis: t.axis, wrap: true, bias: 36, look: {spec: {p: 20, t: 0.45}, blur: 5}};
  // the strap: from the bag's two ends up to the shoulder's top (a true line); only the run on the camera's side
  const shTop = add(sk.shoulder[side], [s * -12, 32, -4]);
  const strap: DecalFn = (cam: Cam) => {
    const zS = toCam(cam, sk.shoulder[side])[2];
    const out: ReturnType<DecalFn> = [];
    for (const [k, end, via] of [
      ['strapF', chain[0], add(shTop, [0, -60, 34])],
      ['strapB', chain[2], add(shTop, [0, -60, -34])],
    ] as [string, V3, V3][]) {
      const mid = lerp(end, via, 0.5);
      if (toCam(cam, mid)[2] < zS - 30) continue;
      out.push({key: k, d: smoothD([project(cam, end), project(cam, via), project(cam, shTop)], false), stroke: bg.strap, sw: 5, top: true});
    }
    return out;
  };
  return {surfaces: [bag], decals: [strap]};
}

// ---------------------------------------------------------------- a cap: the dome and the brim

export function capSurfaces(sk: Skeleton, cp: {mat: string; brimMat?: string}, res: number): Part {
  const h = sk.b.head;
  const band: [number, number][] = [
    [0, 0.74],
    [0.8, 0.7],
    [1.4, 0.6],
    [2.2, 0.55],
    [3.15, 0.53],
  ];
  const rows = rowsFor(26, res, 10);
  const cols = rowsFor(72, res, 18);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  for (let i = 0; i < rows; i++) {
    const t = i / (rows - 1);
    const row: V3[] = [];
    for (let k = 0; k < cols; k++) {
      const phi = (k / cols) * Math.PI * 2;
      const ang = angOf(phi);
      const uB = spline(band, Math.abs(ang));
      const u = mix(1, uB, t);
      // the crown stands off the hair; six soft panels
      const vol = 0.05 + 0.03 * smooth(0.75, 0.98, u) + 0.004 * Math.cos(ang * 6);
      row.push(toWorld(sk.head, scl(shellPoint(u, phi, vol), h)));
    }
    grid.push(row);
    axis.push(toWorld(sk.head, [0, (mix(1, 0.6, t) - 0.42) * h * 0.6, -0.04 * h]));
  }
  // the back opening above the strap (the ponytail comes through it)
  const mask = (i: number, j: number) => {
    const t = i / (rows - 1);
    const ang = angOf((j / cols) * Math.PI * 2);
    return Math.max(Math.PI - Math.abs(ang) - 0.32, (0.62 - t) * 3);
  };
  const dome: Surface = {key: 'cap', mat: cp.mat, grid, axis, wrap: true, open: true, mask, bias: 50, look: {blur: 4.5, hi: 0.8, rim: 0.45}};
  // the brim: an open plate from the band (front) forward and a little down, curved across
  const bR = rowsFor(10, res, 5);
  const bC = rowsFor(30, res, 12);
  const bg: V3[][] = [];
  const ba: V3[] = [];
  for (let i = 0; i < bR; i++) {
    const r = i / (bR - 1);
    const row: V3[] = [];
    for (let k = 0; k < bC; k++) {
      const a = mix(-1.05, 1.05, k / (bC - 1));
      const base = shellPoint(0.735, a, 0.06);
      // forward along the head's front, longest at the centre; the sides curve down
      const len = 0.58 * Math.cos(a * 0.82) ** 0.7;
      const p: V3 = [base[0] * (1 - 0.18 * r), base[1] - r * len * Math.sin(14 * D2R) - 0.06 * r * Math.abs(a) ** 2, base[2] + r * len * Math.cos(14 * D2R)];
      row.push(toWorld(sk.head, scl(p, h)));
    }
    bg.push(row);
    ba.push(toWorld(sk.head, [0, 0.4 * h, 0.2 * h]));
  }
  const brim: Surface = {key: 'brim', mat: cp.brimMat ?? cp.mat, grid: bg, axis: ba, wrap: false, open: true, bias: 52, look: {blur: 3, hi: 0.85, rim: 0.4}};
  return {surfaces: [dome, brim], decals: []};
}

// ---------------------------------------------------------------- an iced coffee in the hand

export function cupSurfaces(sk: Skeleton, side: 'L' | 'R', res: number): Part {
  const ap = sk.pose.arms[side];
  const wr = sk.wrist[side];
  const dir = nrm(ap.handDir ?? sub(wr, sk.elbow[side]));
  const palm = nrm(ap.palm ?? [0, 0, 1]);
  // the cup stands upright in the palm's grip
  const c = add(add(wr, scl(dir, sk.b.hand * 0.42)), scl(palm, 36));
  const H = 104;
  const bot = add(c, [0, -H * 0.42, 0]);
  const top = add(c, [0, H * 0.58, 0]);
  const mid = lerp(bot, top, 0.62);
  const r = (tt: number) => mix(31, 39, tt);
  const lower = tube([bot, mid], rowsFor(10, res, 5), rowsFor(24, res, 12), (tt) => ({f: r(tt * 0.62), b: r(tt * 0.62), p: r(tt * 0.62), m: r(tt * 0.62)}), () => [1, 0, 0]);
  const upper = tube([mid, top], rowsFor(6, res, 4), rowsFor(24, res, 12), (tt) => ({f: r(0.62 + tt * 0.38), b: r(0.62 + tt * 0.38), p: r(0.62 + tt * 0.38), m: r(0.62 + tt * 0.38)}), () => [1, 0, 0]);
  const lidT = tube([add(top, [0, -2, 0]), add(top, [0, 10, 0])], rowsFor(5, res, 3), rowsFor(24, res, 12), (tt) => {
    const rr = mix(41, 26, tt * tt);
    return {f: rr, b: rr, p: rr, m: rr};
  }, () => [1, 0, 0], {capEnd: true});
  const straw: DecalFn = (cam) => [{key: 'straw', d: polyD([project(cam, add(top, [4, 8, 2])), project(cam, add(top, [14, 66, -6]))], false), stroke: '#F1ECE4', sw: 6.5, top: true}];
  return {
    surfaces: [
      {key: 'cup', mat: 'cup', grid: lower.grid, axis: lower.axis, wrap: true, bias: 60, look: {blur: 3.5, hi: 0.72}},
      {key: 'cupTop', mat: 'cupTop', grid: upper.grid, axis: upper.axis, wrap: true, bias: 60.5, look: {blur: 3.5, hi: 0.72}},
      {key: 'lid', mat: 'lid', grid: lidT.grid, axis: lidT.axis, wrap: true, bias: 61, look: {blur: 3, hi: 0.75}},
    ],
    decals: [straw],
  };
}

// ---------------------------------------------------------------- oversized sunglasses

export function sunglassesMarks(sk: Skeleton, fs: FaceShape, g: {color: string; glint: string}): Part {
  const h = sk.b.head;
  const fn: DecalFn = (cam) => {
    const out: ReturnType<DecalFn> = [];
    // the frame sits on a gently curved plane in front of the eyes (wraps a little with the head)
    const lensAt = (side: number, a: number, rad: number): V3 => {
      // a soft square lens: superellipse in (x, y) around the lens centre
      const cx = side * 0.19;
      const cy = 0.075;
      const w = 0.165;
      const hh = 0.13;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const n = 3.2;
      const x = cx + Math.sign(ca) * Math.abs(ca) ** (2 / n) * w * rad + (sa > 0 ? 0 : 0);
      const y = cy + Math.sign(sa) * Math.abs(sa) ** (2 / n) * hh * rad - (side * x > 0.26 ? 0.015 : 0);
      // z: the face's front at this x plus a stand-off, wrapping back toward the sides
      const zFace = headPoint(0.5 + y, Math.asin(Math.max(-0.95, Math.min(0.95, x / 0.37))), fs)[2];
      return [x * 1.02, y, zFace + 0.07 - 0.25 * x * x];
    };
    for (const side of [1, -1]) {
      const pts: [number, number][] = [];
      const ptsW: V3[] = [];
      for (let k = 0; k < 24; k++) {
        const a = (k / 24) * Math.PI * 2;
        const p = lensAt(side, a, 1);
        ptsW.push(p);
        pts.push(project(cam, toWorld(sk.head, scl(p, h))));
      }
      // facing: the lens's normal (forward, turned with the head) against the view
      const c = toWorld(sk.head, scl(lensAt(side, 0, 0), h));
      const nW = nrm(sub(toWorld(sk.head, scl(add(lensAt(side, 0, 0), [side * 0.25, 0, 1]), h)), c));
      const q = toCam(cam, c);
      const nc = sub(toCam(cam, add(c, nW)), q);
      const v = nrm(sub([0, cam.eyeY, cam.D], q));
      const facing = nc[0] * v[0] + nc[1] * v[1] + nc[2] * v[2];
      if (facing < -0.05) continue;
      out.push({key: `lens${side}`, d: smoothD(pts), fill: g.color, top: true});
      // one reflection streak on each lens, at 35 degrees
      const s0 = project(cam, toWorld(sk.head, scl(lensAt(side, 2.4, 0.62), h)));
      const s1 = project(cam, toWorld(sk.head, scl(lensAt(side, 2.0, 0.85), h)));
      const s2 = project(cam, toWorld(sk.head, scl(lensAt(side, -0.9, 0.35), h)));
      out.push({key: `glint${side}`, d: polyD([s0, s1, s2]), fill: g.glint, opacity: 0.55 * Math.max(0, Math.min(1, facing * 3)), top: true, blur: 1.2});
      // the temple arm: back to the ear
      const t0 = project(cam, toWorld(sk.head, scl(lensAt(side, 0, 1), h)));
      const t1 = project(cam, toWorld(sk.head, scl([side * 0.36, 0.06, -0.02], h)));
      out.push({key: `arm${side}`, d: polyD([t0, t1], false), stroke: g.color, sw: 3, top: true});
    }
    // the bridge
    const b0 = project(cam, toWorld(sk.head, scl(lensAt(1, Math.PI, 1), h)));
    const b1 = project(cam, toWorld(sk.head, scl(lensAt(-1, 0, 1), h)));
    out.push({key: 'bridge', d: polyD([b0, b1], false), stroke: g.color, sw: 3.4, top: true});
    return out;
  };
  return {surfaces: [], decals: [fn]};
}

void cross;
void headPoint;
