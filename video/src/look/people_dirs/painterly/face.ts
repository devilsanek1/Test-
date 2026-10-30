// people_dirs/painterly: the face as a soft suggestion (dir_painterly.md "Face"; design_research.md §11). The head's
// own forms make the face's light (a simplified twin keeps it painterly, body.ts); on top go a few soft marks, all
// placed on the skull's surface in (u, angle) and faded by how much they face the camera, so a turn hides them
// naturally and they never pop:
//   SOCKETS  a soft warm shade under each brow (the eye area), never an eye;
//   LASHES   one short arc per eye (lids lowered: serene) with a flick at the outer end, only on big heads;
//   BROWS    soft tapered strokes, a step lighter than the hair, never black arcs;
//   LIPS     a tone, never a line; a little warm on the cheeks.
// No pupils, eye whites, mouth lines, nostrils or blush dots: the budget of design_research §11.3.
import {type FaceShape, type Skeleton, headPoint} from './body';
import {type V3, cross, nrm, scl, sub, toWorld, mix, smooth, clamp} from './math';
import {type Cam, project, toCam} from './mesh';
import {type Decal, type DecalFn, smoothD} from './paint';
import type {Part} from './figure';

export type FaceMarks = {
  brows?: string;
  lash?: string;
  lips?: string;
  /** Lids lowered (a calm, downward gaze); false = the open, straighter line. */
  lidsDown?: boolean;
  /** Strength of the socket shade (0..1). */
  sockets?: number;
  /** Deep skin: a soft sheen on the cheekbone and the brow (the key side). */
  sheen?: string;
  /** No lashes at all (sunglasses on). */
  noEyes?: boolean;
};

/** The surface point and its visibility (N.V) at head-local (u, angle). */
function at(sk: Skeleton, fs: FaceShape, u: number, ang: number, out = 0.004): {p: V3; n: V3} {
  const h = sk.b.head;
  const P = (uu: number, aa: number) => headPoint(uu, aa, fs);
  const c = P(u, ang);
  const du = sub(P(u + 0.01, ang), P(u - 0.01, ang));
  const da = sub(P(u, ang + 0.02), P(u, ang - 0.02));
  let n = nrm(cross(da, du));
  const radial = sub(c, [0, 0.05, -0.04]);
  if (n[0] * radial[0] + n[1] * radial[1] + n[2] * radial[2] < 0) n = scl(n, -1);
  const pw = toWorld(sk.head, scl([c[0] + n[0] * out, c[1] + n[1] * out, c[2] + n[2] * out], h));
  const nw = nrm(sub(toWorld(sk.head, scl([c[0] + n[0], c[1] + n[1], c[2] + n[2]], h)), toWorld(sk.head, scl(c, h))));
  return {p: pw, n: nw};
}

function vis(cam: Cam, p: V3, n: V3): number {
  const q = toCam(cam, p);
  const nc = sub(toCam(cam, [p[0] + n[0], p[1] + n[1], p[2] + n[2]]), q);
  const v = nrm(sub([0, cam.eyeY, cam.D], q));
  return smooth(0.08, 0.42, nc[0] * v[0] + nc[1] * v[1] + nc[2] * v[2]);
}

export function faceMarks(sk: Skeleton, fm: FaceMarks, res: number, fs: FaceShape): Part {
  void res;
  const fn: DecalFn = (cam) => {
    const out: Decal[] = [];
    const skullPx = sk.b.head * cam.s;
    // the face budget by the skull's size in px (design_research §11.3)
    const big = smooth(26, 44, skullPx); // lashes, brows at full strength from ~44 px
    const mid = smooth(12, 22, skullPx);
    for (const side of [1, -1]) {
      // the socket: a soft shade under the brow
      const ring: [number, number][] = [];
      const c0 = at(sk, fs, 0.5, side * 0.5);
      const vv = vis(cam, c0.p, c0.n);
      if (vv > 0.01) {
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * Math.PI * 2;
          const u = 0.505 + 0.045 * Math.sin(a) + 0.008 * Math.cos(a);
          const ang = side * (0.5 + 0.2 * Math.cos(a));
          ring.push(project(cam, at(sk, fs, u, ang).p));
        }
        out.push({key: `sock${side}`, target: 'head', d: smoothD(ring), fill: '#9C5F4B', blur: 3.2, opacity: (fm.sockets ?? 0.5) * vv * mid, blend: 'multiply'});
      }
      // the lashes: one arc along the lowered lid, a flick at the outer end
      if (!fm.noEyes && fm.lash && big > 0.01) {
        const pts: [number, number][] = [];
        const down = fm.lidsDown ?? true;
        for (let k = 0; k <= 8; k++) {
          const t = k / 8;
          const ang = side * mix(0.31, 0.74, t);
          const u = 0.488 - (down ? 0.012 : 0.004) * Math.sin(Math.PI * t) + 0.004 * t;
          pts.push(project(cam, at(sk, fs, u, ang, 0.006).p));
        }
        const fl = at(sk, fs, 0.508, side * 0.8, 0.006);
        pts.push(project(cam, fl.p));
        const cm = at(sk, fs, 0.49, side * 0.52);
        const v2 = vis(cam, cm.p, cm.n);
        if (v2 > 0.01) out.push({key: `lash${side}`, target: 'head', d: smoothD(pts, false), stroke: fm.lash, sw: 2.2, blur: 0.5, opacity: 0.9 * v2 * big});
      }
      // the brows: a soft tapered stroke (thicker inside)
      if (fm.brows && mid > 0.01) {
        const up: [number, number][] = [];
        const dn: [number, number][] = [];
        for (let k = 0; k <= 8; k++) {
          const t = k / 8;
          const ang = side * mix(0.15, 0.8, t);
          const u = 0.59 + 0.012 * Math.sin(Math.PI * Math.min(1, t * 1.3)) - 0.012 * t;
          const w = mix(0.022, 0.006, t);
          up.push(project(cam, at(sk, fs, u + w * 0.5, ang, 0.005).p));
          dn.push(project(cam, at(sk, fs, u - w * 0.5, ang, 0.005).p));
        }
        const cm = at(sk, fs, 0.59, side * 0.45);
        const v3 = vis(cam, cm.p, cm.n);
        if (v3 > 0.01) out.push({key: `brow${side}`, target: 'head', d: smoothD([...up, ...dn.reverse()]), fill: fm.brows, blur: 1.1, opacity: 0.62 * v3 * mid});
      }
      // a little warmth on the cheek (the key side mostly)
      const ck = at(sk, fs, 0.36, side * 0.78);
      const vc = vis(cam, ck.p, ck.n);
      if (vc > 0.01) {
        const pts: [number, number][] = [];
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          pts.push(project(cam, at(sk, fs, 0.36 + 0.06 * Math.sin(a), side * (0.78 + 0.2 * Math.cos(a))).p));
        }
        out.push({key: `cheek${side}`, target: 'head', d: smoothD(pts), fill: '#D9776A', blur: 6, opacity: 0.16 * vc * mid});
      }
      if (fm.sheen) {
        const sh = at(sk, fs, 0.42, side * 0.85);
        const vs = vis(cam, sh.p, sh.n) * clamp(-toCam(cam, [0, 0, 0])[0] * 0 + 1);
        const pts: [number, number][] = [];
        for (let k = 0; k < 10; k++) {
          const a = (k / 10) * Math.PI * 2;
          pts.push(project(cam, at(sk, fs, 0.43 + 0.035 * Math.sin(a), side * (0.8 + 0.16 * Math.cos(a))).p));
        }
        out.push({key: `sheen${side}`, target: 'head', d: smoothD(pts), fill: fm.sheen, blur: 4, opacity: 0.35 * vs * mid});
      }
    }
    // the lips: one soft tone (the upper lip a touch deeper)
    if (fm.lips) {
      const top: [number, number][] = [];
      const bot: [number, number][] = [];
      for (let k = 0; k <= 8; k++) {
        const t = k / 8;
        const ang = mix(-0.2, 0.2, t);
        const bow = Math.sin(Math.PI * t);
        top.push(project(cam, at(sk, fs, 0.178 + 0.03 * bow, ang, 0.003).p));
        bot.push(project(cam, at(sk, fs, 0.178 - 0.032 * bow, ang, 0.003).p));
      }
      const cm = at(sk, fs, 0.18, 0);
      const vl = Math.max(vis(cam, cm.p, cm.n), 0);
      if (vl > 0.01) out.push({key: 'lips', target: 'head', d: smoothD([...top, ...bot.reverse()]), fill: fm.lips, blur: 1.6, opacity: 0.5 * vl * mid});
    }
    return out;
  };
  return {surfaces: [], decals: [fn]};
}
