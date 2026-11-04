// MODERN GRAPHIC people: hands and the things they hold. A hand is a designed MITTEN with a thumb lobe (a notch 35-45 %
// down the hand; design_research.md H1-H3), real size (0.098 H), the wrist breaking off the forearm's line. A bag is a
// slouchy crescent tucked under the arm; the iced coffee is the hand's reason (A5). All two-tone, crisp.
import {V2, V3, RV, rpath, poly, hull, rot, add, sub, mul, norm, perp, rad, lerp, curve} from './geo';
import {Cam, proj, toCam} from './rig';
import type {Skel} from './body';
import type {Tone} from './color';
import type {Part, Region} from './part';

export type HandKind = 'relaxed' | 'edge' | 'grip' | 'open';
/** A hand at the wrist w (screen), pointing along dir (screen), `len` long (local units). thumb: -1 = on the screen-
 *  left of the axis, +1 = right, 0 = hidden (seen from the little-finger side). */
export function hand(name: string, w: V2, dir: V2, len: number, thumb: -1 | 0 | 1, t: Tone, z: number, kind: HandKind = 'relaxed', breakDeg = 12): Part {
  // design the mitten in a local frame: the wrist at the origin, the hand along +y, the thumb on -x
  let pts: RV[];
  if (kind === 'grip') {
    // a closed hand round something: a rounded block with the thumb over it
    pts = [
      [0.22, 0, 0.05],
      [0.3, 0.3, 0.1],
      [0.27, 0.62, 0.16],
      [0.0, 0.7, 0.14],
      [-0.26, 0.6, 0.12],
      [-0.33, 0.36, 0.08],
      [-0.26, 0.05, 0.05],
    ];
  } else if (kind === 'edge' || thumb === 0) {
    pts = [
      [0.13, 0, 0.02],
      [0.16, 0.32, 0.12],
      [0.14, 0.62, 0.14],
      [0.07, 0.9, 0.1],
      [-0.03, 0.98, 0.06],
      [-0.12, 0.86, 0.1],
      [-0.15, 0.55, 0.14],
      [-0.13, 0.05, 0.02],
    ];
  } else {
    // a relaxed hand seen from its back: the fingers together and tapering, a small thumb lobe, the notch 45 % down
    pts = [
      [0.13, 0, 0.02],
      [0.18, 0.27, 0.12],
      [0.175, 0.52, 0.12],
      [0.12, 0.78, 0.1],
      [0.03, 0.975, 0.05],
      [-0.08, 0.9, 0.06],
      [-0.14, 0.66, 0.08],
      [-0.12, 0.5, 0.01],
      [-0.235, 0.43, 0.05],
      [-0.215, 0.23, 0.08],
      [-0.13, 0.03, 0.02],
    ];
  }
  const ang = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI - 90; // local +y onto dir
  const flip = thumb > 0 ? -1 : 1;
  // the wrist breaks toward the thumb side
  const bend = breakDeg * (thumb === 0 ? 0.5 : -flip);
  const P = (p: [number, number]): V2 => add(w, rot([p[0] * flip * len, p[1] * len], [0, 0], ang + bend));
  const out: RV[] = pts.map(([x, y, r]) => [...P([x, y]), (r ?? 0) * len] as RV);
  // shade: the half away from the key (screen-right of the axis, the light comes from the left)
  const a0 = P([0, -0.2]);
  const a1 = P([0, 1.2]);
  const off = 0.08 * len;
  const sh = [add(a0, [off, 0]), add(a1, [off, 0]), add(a1, [len * 2, 0]), add(a0, [len * 2, 0])];
  return {name, d: rpath(out), fill: t.lit, regions: [{d: poly(sh), fill: t.shade}], z};
}

/** The slouchy shoulder bag tucked under the arm: a 3D crescent (length along her front, height, thickness) at
 *  `at` (body space), its face turned out by `yaw` degrees (0 = facing her side). */
export function bag(sk: Skel, side: 'l' | 'r', at: V3, c: Cam, t: Tone, z: number, o: {len?: number; h?: number; th?: number; yaw?: number} = {}): Part[] {
  const s = side === 'l' ? 1 : -1;
  const len = o.len ?? 112;
  const hh = o.h ?? 74;
  const th = o.th ?? 30;
  const yw = rad((o.yaw ?? -14) * s);
  // local axes: u = along the bag (her front), v = up, w = out (her side)
  const u: V3 = [Math.sin(yw) * s, 0, Math.cos(yw)];
  const w: V3 = [Math.cos(yw) * s, 0, -Math.sin(yw)];
  const pt = (uu: number, vv: number, ww: number): V3 => [at[0] + u[0] * uu + w[0] * ww, at[1] + vv, at[2] + u[2] * uu + w[2] * ww];
  // the crescent's profile: a straight-ish top under the arm, a sagging round bottom, soft ends
  const prof: [number, number][] = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const a = Math.PI * (i / N);
    prof.push([-Math.cos(a) * len * 0.5, -Math.sin(a) * hh]); // the bottom arc
  }
  prof.push([len * 0.46, 6], [len * 0.2, 2], [-len * 0.2, 2], [-len * 0.46, 6]); // the top edge
  const front: V2[] = [];
  const back: V2[] = [];
  for (const [uu, vv] of prof) {
    // the bag is fuller in the middle: its thickness swells with depth
    const sw = th * (0.5 + 0.5 * Math.min(1, -vv / hh + 0.3));
    front.push(proj(pt(uu, vv, sw * 0.5), c));
    back.push(proj(pt(uu, vv, -sw * 0.5), c));
  }
  const H = hull(front.concat(back));
  // the visible face: lit or not, and the sagging bottom band in the shade plane
  const wn = toCam(w, c);
  const faceVis = wn[2] > 0 ? front : back;
  const n = wn[2] > 0 ? wn : ([-wn[0], 0, -wn[2]] as V3);
  const litFace = n[0] * c.light[0] + n[2] * c.light[2] + 0.2 > 0;
  const regs: Region[] = [];
  if (!litFace) regs.push({d: poly(faceVis), fill: t.shade});
  // the lower third: the bag's belly turns down, away from the light
  const belly: V2[] = [];
  for (let i = 0; i <= N; i++) {
    const a = Math.PI * (i / N);
    belly.push(proj(pt(-Math.cos(a) * len * 0.5 * 0.92, -Math.sin(a) * hh * 0.62, wn[2] > 0 ? th * 0.5 : -th * 0.5), c));
  }
  const bl = belly.concat(belly.slice().reverse().map((p) => add(p, [0, 200]) as V2));
  regs.push({d: poly(bl), fill: t.shade});
  const parts: Part[] = [{name: `bag`, d: rpath(H.map((p) => [p[0], p[1], 6] as RV)), fill: t.lit, regions: regs, z}];
  return parts;
}

/** A strap from p0 to p1 (screen) as a true line. */
export const strap = (name: string, pts: V2[], wdt: number, color: string, z: number): Part => ({
  name,
  d: curve(pts),
  fill: 'none',
  z,
  line: {w: wdt, color, cap: 'round'},
});

/** The iced coffee: a tall clear cup (latte below, ice above), a domed lid and a straw. `at` = the cup's centre
 *  (screen), its height in local units; tilt in degrees. */
export function icedCoffee(at: V2, hgt: number, tilt: number, z: number, col: {coffee: Tone; clear: string; lid: string; straw: string}): Part[] {
  const wTop = hgt * 0.34;
  const wBot = hgt * 0.25;
  const P = (x: number, y: number): V2 => add(at, rot([x, y], [0, 0], tilt));
  const cupPts: RV[] = [
    [...P(-wTop, -hgt * 0.5), 2] as RV,
    [...P(wTop, -hgt * 0.5), 2] as RV,
    [...P(wBot, hgt * 0.5), hgt * 0.05] as RV,
    [...P(-wBot, hgt * 0.5), hgt * 0.05] as RV,
  ];
  const lvl = -hgt * 0.22; // the coffee's level
  const coffee: V2[] = [P(-wTop * 1.2, lvl), P(wTop * 1.2, lvl), P(wTop * 1.2, hgt), P(-wTop * 1.2, hgt)];
  const milk: V2[] = [P(-wTop * 1.2, lvl), P(wTop * 1.2, lvl), P(wTop * 1.2, lvl + hgt * 0.13), P(-wTop * 1.2, lvl + hgt * 0.13)];
  const sh: V2[] = [P(wTop * 0.35, -hgt), P(wTop * 2, -hgt), P(wTop * 2, hgt), P(wBot * 0.3, hgt)];
  const parts: Part[] = [
    {
      name: 'cup',
      d: rpath(cupPts),
      fill: col.clear,
      regions: [
        {d: poly(coffee), fill: col.coffee.lit},
        {d: poly(milk), fill: col.coffee.sheen},
        {d: poly(sh), fill: col.coffee.shade, opacity: 0.55},
      ],
      z,
    },
  ];
  const lid: RV[] = [
    [...P(-wTop * 1.08, -hgt * 0.5), 2] as RV,
    [...P(-wTop * 0.8, -hgt * 0.6), hgt * 0.05] as RV,
    [...P(wTop * 0.8, -hgt * 0.6), hgt * 0.05] as RV,
    [...P(wTop * 1.08, -hgt * 0.5), 2] as RV,
    [...P(wTop * 1.08, -hgt * 0.46), 1] as RV,
    [...P(-wTop * 1.08, -hgt * 0.46), 1] as RV,
  ];
  parts.push({name: 'lid', d: rpath(lid), fill: col.lid, z: z + 0.01});
  parts.push({name: 'straw', d: curve([P(wTop * 0.15, -hgt * 0.55), P(wTop * 0.32, -hgt * 0.93)]), fill: 'none', z: z - 0.01, line: {w: hgt * 0.07, color: col.straw, cap: 'butt'}});
  return parts;
}

export const lerpV = lerp;
export const perpV = perp;
export const normV = norm;
export const subV = sub;
export const mulV = mul;

/** A hand round a cup: the back of the hand from the wrist, the fingers as one band across the cup (its lower third
 *  when held up, its top when carried hanging), the thumb a small lobe above. */
export function gripCup(name: string, wrist: V2, cupC: V2, cupW: number, cupH: number, len: number, t: Tone, z: number, hanging: boolean): Part[] {
  const bandY = hanging ? cupC[1] - cupH * 0.3 : cupC[1] + cupH * 0.08;
  const bh = len * 0.34;
  const side = wrist[0] >= cupC[0] ? 1 : -1; // the forearm comes from this side
  const x0 = cupC[0] - cupW * 0.56;
  const x1 = cupC[0] + cupW * 0.56;
  const band: RV[] = [
    [x0, bandY - bh / 2, bh * 0.4],
    [x1, bandY - bh / 2, bh * 0.4],
    [x1, bandY + bh / 2, bh * 0.45],
    [x0, bandY + bh / 2, bh * 0.45],
  ];
  // the back of the hand: from the wrist to the band's near end
  const near: V2 = [side > 0 ? x1 : x0, bandY];
  const dir = norm(sub(near, wrist));
  const nr: V2 = [-dir[1], dir[0]];
  const w0 = len * 0.17;
  const w1 = bh * 0.5;
  const back: RV[] = [
    [wrist[0] + nr[0] * w0, wrist[1] + nr[1] * w0, 2],
    [near[0] + nr[0] * w1, near[1] + nr[1] * w1, w1 * 0.6],
    [near[0] - nr[0] * w1, near[1] - nr[1] * w1, w1 * 0.6],
    [wrist[0] - nr[0] * w0, wrist[1] - nr[1] * w0, 2],
  ];
  const thumb: RV[] = [
    [near[0] - side * cupW * 0.12, bandY - bh * 0.45, 3],
    [near[0] - side * cupW * 0.32, bandY - bh * 0.95, bh * 0.25],
    [near[0] - side * cupW * 0.18, bandY - bh * 1.05, bh * 0.25],
    [near[0] + side * cupW * 0.02, bandY - bh * 0.5, 3],
  ];
  const sh = poly([
    [cupC[0] + cupW * 0.15, bandY - len],
    [cupC[0] + cupW * 3, bandY - len],
    [cupC[0] + cupW * 3, bandY + len],
    [cupC[0] + cupW * 0.15, bandY + len],
  ]);
  return [
    {name: `${name}-back`, d: rpath(back), fill: t.lit, regions: [{d: sh, fill: t.shade}], z},
    {name: `${name}-fingers`, d: rpath(band), fill: t.lit, regions: [{d: sh, fill: t.shade}], z: z + 0.05},
    {name: `${name}-thumb`, d: rpath(thumb), fill: t.lit, regions: [{d: sh, fill: t.shade}], z: z + 0.1},
  ];
}
