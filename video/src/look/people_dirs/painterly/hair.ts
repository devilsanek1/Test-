// people_dirs/painterly: hair (dir_painterly.md "Hair"; design_research.md §7, fashion.md §5). Hair is ONE designed mass
// over the skull, built as a shell (the skull's surface pushed out by the hair's volume), open where the face is: the
// face window follows the hairline (a centre part, curtain bangs, a fringe). Long hair continues below the head as a
// curtain behind the shoulders, ending in rounded, bouncy ends; a ponytail is its own tapering tube; curls are a cloud
// of unequal lobes (the light gives each lobe its own sheen); a crop is a close cap with a lighter taper at the nape.
// The light's anisotropic sheen (mesh.ts) draws the one band that says "healthy, groomed hair".
import {type Skeleton, headPoint, rowsFor, tube, fx, fy, fz} from './body';
import {type V3, add, bump, clamp, lerp, mix, nrm, scl, smooth, spline, sub, toWorld, cross, dot} from './math';
import type {Surface} from './mesh';
import type {Decal, DecalFn} from './paint';
import {project} from './mesh';
import {smoothD} from './paint';

const PLAIN = {nose: 0, lips: 0, jaw: 1, chin: 0, cheek: 0, brow: 0};

/** A point on the skull (h units, head-local) pushed out radially by `vol` (h units). */
function shellPoint(u: number, phi: number, vol: number): V3 {
  const p = headPoint(u, phi, PLAIN, true);
  const c: V3 = [0, 0.05, -0.04];
  const r = nrm(sub(p, c));
  return add(p, scl(r, vol));
}
const angOf = (phi: number) => Math.atan2(Math.sin(phi), Math.cos(phi));

export type HairLong = {
  kind: 'long';
  /** The ends' height at the back (world units), the face-framing layer's end (front sides). */
  endBack: number;
  endFront: number;
  /** Volume at the crown and the sides (h units). */
  vol: number;
  /** The part's angle (rad from the front; 0 = centre). */
  part: number;
  /** Curtain bangs: how far they come down the face (0 = none). */
  bangs: number;
};
export type HairPony = {kind: 'pony'; length: number; part?: number};
export type HairCurls = {kind: 'curls'; vol: number; seed: number};
export type HairCrop = {kind: 'crop'; top: number; seed: number};
export type HairSpec = HairLong | HairPony | HairCurls | HairCrop;

type Built = {surfaces: Surface[]; decals: DecalFn[]};

// ---------------------------------------------------------------- the skull's shell, generic

function skullShell(
  sk: Skeleton,
  key: string,
  mat: string,
  opt: {uTop?: number; uLow: number; vol: (u: number, ang: number) => number; window: (u: number, ang: number) => number; rows: number; cols: number; res: number; look?: Surface['look']; bias?: number},
): Surface {
  const h = sk.b.head;
  const rows = rowsFor(opt.rows, opt.res, 10);
  const cols = rowsFor(opt.cols, opt.res, 18);
  const grid: V3[][] = [];
  const axis: V3[] = [];
  const top = opt.uTop ?? 1;
  for (let i = 0; i < rows; i++) {
    const u = mix(top, opt.uLow, i / (rows - 1));
    const row: V3[] = [];
    for (let k = 0; k < cols; k++) {
      const phi = (k / cols) * Math.PI * 2;
      const ang = angOf(phi);
      row.push(toWorld(sk.head, scl(shellPoint(u, phi, opt.vol(u, ang)), h)));
    }
    grid.push(row);
    axis.push(toWorld(sk.head, [0, (u - 0.42) * h * 0.6, -0.04 * h]));
  }
  const mask = (i: number, j: number) => {
    const u = mix(top, opt.uLow, i / (rows - 1));
    const ang = angOf((j / cols) * Math.PI * 2);
    return opt.window(u, ang);
  };
  return {key, mat, grid, axis, wrap: true, open: true, mask, look: opt.look, bias: opt.bias ?? 40};
}

// ---------------------------------------------------------------- long hair: the skull's shell + the curtain

function longHair(sk: Skeleton, hs: HairLong, res: number): Built {
  const b = sk.b;
  const h = b.head;
  const cols = rowsFor(80, res, 22);
  const rowsS = rowsFor(30, res, 10);
  const rowsC = rowsFor(30, res, 8);
  const uJaw = 0.16;
  // the face window by height on the skull (rad from the front): the part at the top, curtain bangs opening around
  // the eyes and framing the cheekbones, then beside the jaw
  const bang = hs.bangs;
  const wF: [number, number][] = [
    [0.0, 1.05],
    [0.16, 1.02],
    [0.3, 0.96],
    [0.42, 0.86 - 0.08 * bang],
    [0.55, 0.64 - 0.12 * bang],
    [0.66, 0.42 - 0.12 * bang],
    [0.76, 0.2],
    [0.83, 0.02],
    [0.86, -0.2],
  ];
  const vol = (u: number, ang: number) => {
    const a = Math.abs(ang);
    let v = hs.vol * (0.75 + 0.35 * smooth(0.95, 0.75, u)) + 0.012 * smooth(0.5, 0.2, u);
    // the bangs stand a little off the forehead; the part pinches the volume
    v += 0.012 * bang * smooth(0.45, 0.6, u) * (1 - smooth(0.5, 1.0, a));
    v -= 0.018 * bump(ang, hs.part, 0.06) * smooth(0.72, 0.9, u);
    // soft clumps: the strands gather in a few vertical lobes
    v += 0.006 * Math.sin(ang * 11 + 0.7) * smooth(0.8, 0.4, u);
    return Math.max(0.005, v);
  };
  // the curtain below the head, in the chest's frame
  const ch = sk.chest;
  const neckC = toWorld(ch, [0, 0, -18]);
  const endAt = (ang: number) => {
    const a = Math.abs(ang); // 0 front .. pi back
    // the layers: face-framing pieces end higher (at the collarbone), the back longest; a soft V at the back
    const k = smooth(1.2, 2.2, a);
    let y = mix(hs.endFront, hs.endBack, k);
    // bouncy ends: rounded scallops, irregular
    y += 18 * Math.pow(Math.abs(Math.sin(ang * 3.2 + 0.6)), 0.7) - 6 * Math.sin(ang * 7.1);
    return y;
  };
  const jawY = toWorld(sk.head, [0, (uJaw - 0.42) * h, 0])[1];
  const grid: V3[][] = [];
  const axis: V3[] = [];
  const total = rowsS + rowsC;
  for (let i = 0; i < total; i++) {
    const row: V3[] = [];
    let axP: V3 = [0, 0, 0];
    for (let k = 0; k < cols; k++) {
      const phi = (k / cols) * Math.PI * 2;
      const ang = angOf(phi);
      let p: V3;
      if (i < rowsS) {
        const u = mix(1, uJaw, i / (rowsS - 1));
        p = toWorld(sk.head, scl(shellPoint(u, phi, vol(u, ang)), h));
      } else {
        const t = (i - rowsS + 1) / rowsC;
        const yEnd = endAt(ang);
        const y = mix(jawY, yEnd, t);
        // the jaw ring (start) and the curtain's ellipse around the upper back (target)
        const p0 = toWorld(sk.head, scl(shellPoint(uJaw, phi, vol(uJaw, ang)), h));
        const sh = smooth(jawY, jawY - 70, y); // 0 at the jaw -> 1 at the shoulders
        // the ellipse: wide behind the shoulders, its back just off the upper back
        const halfW = mix(58, 86, sh) + 10 * smooth(jawY - 60, yEnd, y);
        const back = mix(78, 90, sh);
        const front = mix(30, 40, sh);
        const c = Math.cos(phi);
        const s = Math.sin(phi);
        const zz = c >= 0 ? c * front : c * back;
        const xx = s * halfW;
        // bouncy ends: the last 40 units flip outward then round under
        const ends = smooth(yEnd + 46, yEnd + 6, y);
        const flip = 8 * ends - 6 * smooth(yEnd + 10, yEnd, y);
        const l = Math.hypot(xx, zz) || 1;
        const target = toWorld(ch, [xx + (xx / l) * flip, 0, zz + (zz / l) * flip - 40]);
        const tw: V3 = [target[0], y, target[2]];
        p = lerp([p0[0], y, p0[2]], tw, sh);
        // the curtain follows the neck's centre as the chest leans
        void neckC;
      }
      row.push(p);
      axP = add(axP, p);
    }
    grid.push(row);
    const a = scl(axP, 1 / cols);
    axis.push(i < rowsS ? toWorld(sk.head, [0, (mix(1, uJaw, i / (rowsS - 1)) - 0.42) * h * 0.6, -0.04 * h]) : [a[0], a[1], a[2] + 10]);
  }
  const mask = (i: number, j: number) => {
    const ang = angOf((j / cols) * Math.PI * 2);
    const a = Math.abs(ang);
    if (i < rowsS) {
      const u = mix(1, uJaw, i / (rowsS - 1));
      return (a - spline(wF, u)) * 2;
    }
    const t = (i - rowsS + 1) / rowsC;
    // below the jaw the hair falls behind the shoulders: the front window widens
    const w = mix(1.05, 1.42, smooth(0, 0.35, t));
    return (a - w) * 2;
  };
  const surf: Surface = {key: 'hair', mat: 'hair', grid, axis, wrap: true, open: true, mask, bias: 26, look: {sheen: {t: 0.5, p: 5}, blur: 4.5, rim: 0.45}};
  // the part: a fine line of the hair's deep tone from the hairline back over the crown
  const partDecal: DecalFn = (cam) => {
    const pts = [] as [number, number][];
    for (let k = 0; k <= 8; k++) {
      const u = mix(0.86, 0.99, k / 8);
      const p = toWorld(sk.head, scl(shellPoint(u, hs.part, vol(u, hs.part) + 0.002), h));
      pts.push(project(cam, p));
    }
    return [{key: 'part', target: 'hair', d: smoothD(pts, false), stroke: '#2A1A18', sw: 1.6, blur: 1.2, opacity: 0.55}];
  };
  return {surfaces: [surf], decals: [partDecal]};
}

// ---------------------------------------------------------------- a ponytail (under a cap) and the hair tight to the skull

function ponyHair(sk: Skeleton, hs: HairPony, res: number): Built {
  const h = sk.b.head;
  const wF: [number, number][] = [
    [0.0, 3.4],
    [0.22, 3.4],
    [0.26, 1.7],
    [0.35, 1.2],
    [0.5, 1.12],
    [0.62, 1.0],
    [0.72, 0.78],
    [0.79, 0.3],
    [0.81, -0.3],
  ];
  const cap = skullShell(sk, 'hair', 'hair', {
    uLow: 0.2,
    vol: (u, ang) => 0.016 + 0.01 * smooth(0.6, 0.3, u) * smooth(1.2, 2.4, Math.abs(ang)),
    window: (u, ang) => (Math.abs(ang) - spline(wF, u)) * 2,
    rows: 34,
    cols: 72,
    res,
    look: {sheen: {t: 0.5, p: 5}, blur: 4, rim: 0.45},
    bias: 20,
  });
  // the tail: from the cap's back opening, out and down, swinging a little to the figure's left
  const root = toWorld(sk.head, [0, 0.12 * h, -0.47 * h]);
  const a1 = toWorld(sk.head, [0.02 * h, -0.08 * h, -0.66 * h]);
  const len = hs.length;
  const a2: V3 = add(a1, [6, -len * 0.45, -10]);
  const a3: V3 = add(a2, [10, -len * 0.42, 6]);
  const tail = tube(
    [root, a1, a2, a3],
    rowsFor(30, res, 10),
    rowsFor(22, res, 10),
    (t) => {
      const r = h * spline(
        [
          [0, 0.085],
          [0.08, 0.11],
          [0.3, 0.15],
          [0.6, 0.13],
          [0.85, 0.075],
          [1, 0.012],
        ],
        t,
      );
      return {f: r * 0.85, b: r * 0.85, p: r, m: r};
    },
    () => fx(sk.chest),
    {capEnd: true, disp: (t, phi) => 1.6 * Math.sin(phi * 5 + t * 9) * smooth(0.1, 0.4, t)},
  );
  const tailS: Surface = {key: 'pony', mat: 'hair', grid: tail.grid, axis: tail.axis, wrap: true, bias: 22, look: {sheen: {t: 0.45, p: 4}, blur: 4, rim: 0.45}};
  // the hair tie: a small dark band at the root
  const tie = tube(
    [toWorld(sk.head, [0, 0.13 * h, -0.45 * h]), toWorld(sk.head, [0, 0.08 * h, -0.53 * h])],
    rowsFor(5, res, 3),
    rowsFor(16, res, 8),
    () => ({f: 0.1 * h, b: 0.1 * h, p: 0.105 * h, m: 0.105 * h}),
    () => fx(sk.chest),
  );
  const tieS: Surface = {key: 'tie', mat: 'tie', grid: tie.grid, axis: tie.axis, wrap: true, bias: 23, noRim: true};
  return {surfaces: [cap, tailS, tieS], decals: []};
}

// ---------------------------------------------------------------- curls: a cloud of unequal lobes

function curlHair(sk: Skeleton, hs: HairCurls, res: number): Built {
  const sd = hs.seed;
  const wF: [number, number][] = [
    [0.0, 1.12],
    [0.12, 1.08],
    [0.3, 0.98],
    [0.45, 0.9],
    [0.58, 0.75],
    [0.7, 0.52],
    [0.78, 0.22],
    [0.82, -0.2],
  ];
  const lobes = (u: number, ang: number) =>
    0.55 * Math.sin(ang * 7 + u * 9.5 + sd) + 0.3 * Math.sin(ang * 12 - u * 15 + sd * 2.3) + 0.15 * Math.sin(ang * 19 + u * 23 + sd * 0.7);
  const vol = (u: number, ang: number) => {
    const a = Math.abs(ang);
    // fuller at the sides and the back, longer at the back (to the jaw), softer at the hairline
    let v = hs.vol * (0.78 + 0.22 * smooth(0.4, 1.8, a)) * (0.6 + 0.4 * smooth(0.0, 0.35, u));
    v *= 1 - 0.35 * smooth(0.95, 1.0, u) * 0;
    v += 0.06 * lobes(u, ang) * smooth(0.0, 0.25, u);
    // close to the face at the hairline the cloud thins
    v *= 0.55 + 0.45 * smooth(0.0, 0.5, a - spline(wF, u) + 0.2);
    return Math.max(0.03, v);
  };
  const cloud = skullShell(sk, 'hair', 'hair', {
    uLow: 0.02,
    vol,
    window: (u, ang) => (Math.abs(ang) - spline(wF, u)) * 2,
    rows: 64,
    cols: 108,
    res,
    look: {hi: 0.62, blur: 3.2, rim: 0.42, shade: 0.12},
    bias: 30,
  });
  return {surfaces: [cloud], decals: []};
}

// ---------------------------------------------------------------- the crop: a textured top over a low taper

function cropHair(sk: Skeleton, hs: HairCrop, res: number): Built {
  const sd = hs.seed;
  // the hairline: the fringe's notched edge across the forehead, above the ears, down to the nape
  const front = (ang: number) => 0.765 + 0.022 * Math.abs(Math.sin(ang * 13 + sd)) + 0.02 * smooth(0.25, 0.7, Math.abs(ang));
  const hairline = (u: number, ang: number) => {
    const a = Math.abs(ang);
    if (a < 0.95) return (u - front(ang)) * 6; // the forehead
    if (a < 1.25) return (u - mix(front(ang), 0.5, smooth(0.95, 1.25, a))) * 6; // the temples
    if (a < 1.75) return (u - 0.6 + 0.05 * Math.cos((a - 1.25) * 6)) * 6; // over the ear: an arc above it
    return (u - mix(0.36, 0.24, smooth(1.75, 2.6, a))) * 6; // behind the ear to the nape
  };
  const taperTop = (ang: number) => mix(0.62, 0.48, smooth(1.4, 2.8, Math.abs(ang)));
  const top = (u: number, ang: number) => {
    const a = Math.abs(ang);
    let v = 0.016 + hs.top * smooth(0.6, 0.9, u) * (1 - 0.35 * smooth(0.6, 2.6, a));
    // the fringe falls forward: more at the front-top
    v += 0.02 * smooth(0.82, 0.92, u) * (1 - smooth(0.2, 1.2, a));
    // texture: a few soft tufts
    v += 0.012 * Math.sin(ang * 9 + u * 21 + sd) * smooth(0.72, 0.95, u);
    return v;
  };
  const main = skullShell(sk, 'hair', 'hair', {
    uLow: 0.2,
    vol: top,
    window: (u, ang) => Math.min(hairline(u, ang), (u - taperTop(ang)) * 8 + 0.02),
    rows: 40,
    cols: 84,
    res,
    look: {sheen: {t: 0.48, p: 4}, blur: 3.2, rim: 0.45},
    bias: 30,
  });
  const taper = skullShell(sk, 'taper', 'taper', {
    uLow: 0.2,
    vol: () => 0.008,
    window: (u, ang) => Math.min(hairline(u, ang), (taperTop(ang) + 0.03 - u) * 8),
    rows: 26,
    cols: 84,
    res,
    look: {blur: 3, rim: 0.5},
    bias: 29,
  });
  return {surfaces: [taper, main], decals: []};
}

export function hairOf(sk: Skeleton, hs: HairSpec, res: number): Built {
  switch (hs.kind) {
    case 'long':
      return longHair(sk, hs, res);
    case 'pony':
      return ponyHair(sk, hs, res);
    case 'curls':
      return curlHair(sk, hs, res);
    case 'crop':
      return cropHair(sk, hs, res);
  }
}

export {shellPoint, angOf};
export type {Decal};
void fy;
void fz;
void cross;
void dot;
void clamp;
