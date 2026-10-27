// model.ts — "towpath Pip" as a small 3D rig projected to flat 2D parts (docs/v2/TREATMENT.md section 3, K5).
//
// Pip is a pebble-round elephant with no neck: a pebble body, a round head sitting straight on it, two big LEAF ears
// (each leaf = two half-blades on a midrib, so an ear can FOLD along its midrib and FLICK), a short trunk with one curl,
// a three-hair tuft, teddy-bear soles and a short knitted mustard scarf whose two tails lift in the canal wind.
//
// The rig is posed with numbers (PoseParams: every field blends linearly, so pose changes are smooth, never pops),
// projected orthographically (body yaw, head yaw / pitch / roll, a 9 degree camera elevation) and returned as flat
// parts: each part has a 2D shape (inside test + outline), a layer (draw order), a fill role and whether it belongs to
// the silhouette union. Pip.tsx traces the union's outline as ONE loose continuous stroke with 2-3 gaps.
//
// MODEL UNITS: the seated Pip is 95 units from its base to the top of its head (the tuft rises ~9 more). The base
// centre is (0, 0); y grows DOWN (SVG). Pip.tsx scales by size / 95.

import {BBox, bboxOf, clamp, D2R, ellipseShape, fieldShape, lerp, polyShape, Shape, tubeShape, V2, V3, v3} from './geom';

export const MODEL_H = 96;

// ---------------------------------------------------------------- pose parameters

/** Every pose is a set of numbers; poses blend field by field (see blendParams). Angles in degrees. */
export type PoseParams = {
  /** Body facing: 0 = toward us, 90 = facing screen right (profile), 180 = away from us (the watcher), 270 = left. */
  yaw: number;
  /** Head turn, screen-relative: -1 = the face turns toward screen LEFT, +1 toward screen right (about +-78 deg). */
  look: number;
  /** Head pitch: +1 = looking up (about 38 deg), -1 = down. */
  lookUp: number;
  /** Head roll (a curious tilt), degrees, + = clockwise on screen. */
  headTilt: number;
  /** Head sinks into the scarf (units, + = down). */
  headDrop: number;
  /** Ears. A = the ear on Pip's model +x side (screen right when it faces us), B = the other. Droop = degrees below
   *  horizontal (90 = hanging straight down, < 0 = raised); swing = degrees FORWARD (+) or back (-); fold 0..1 = the
   *  lower half-blade folds over along the midrib (1 = a half-leaf). */
  earDroopA: number;
  earDroopB: number;
  earSwingA: number;
  earSwingB: number;
  earFoldA: number;
  earFoldB: number;
  /** Trunk: curl 0..1.3 (1 = the one curl), raise degrees (+ = lifted forward / up), side lean degrees. */
  trunkCurl: number;
  trunkRaise: number;
  trunkSide: number;
  /** Legs: tuck 0..1 (curled under, a small hop), leap 0..1 (front reaching, hind pushing back, soles out). */
  tuck: number;
  leap: number;
  /** Body squashed down onto its seat (0..1), e.g. a flinch. Feet stay put. */
  hunch: number;
  /** Breathing, -1..1 (idle). */
  breath: number;
  /** The tail: angle from hanging straight down (+ = toward screen right), curl 0..1 at its tip, length 0..1.3. */
  tailAngle: number;
  tailCurl: number;
  tailLen: number;
  /** Scarf tails: lift 0..1 by the wind; wind direction on screen -1 (blowing toward left) .. +1. */
  scarfLift: number;
  wind: number;
  /** Scarf tail flutter phase (idle drives it). */
  flutter: number;
  /** Tuft lean, degrees (wind + idle). */
  tuftLean: number;
  /** Eyes open 1 .. closed 0 (blink). */
  eyes: number;
};

export const NEUTRAL: PoseParams = {
  yaw: 160,
  look: 0,
  lookUp: 0,
  headTilt: 0,
  headDrop: 0,
  earDroopA: 32,
  earDroopB: 32,
  earSwingA: 8,
  earSwingB: 8,
  earFoldA: 0.08,
  earFoldB: 0.08,
  trunkCurl: 1,
  trunkRaise: 0,
  trunkSide: 0,
  tuck: 0,
  leap: 0,
  hunch: 0,
  breath: 0,
  tailAngle: 6,
  tailCurl: 0.5,
  tailLen: 1,
  scarfLift: 0.45,
  wind: -1,
  flutter: 0,
  tuftLean: 0,
  eyes: 1,
};

export const PARAM_KEYS = Object.keys(NEUTRAL) as (keyof PoseParams)[];

/** Linear blend of two parameter sets (yaw takes the short way round). */
export function blendParams(a: PoseParams, b: PoseParams, k: number): PoseParams {
  if (k <= 0) return a;
  if (k >= 1) return b;
  const out = {...a};
  for (const key of PARAM_KEYS) {
    if (key === 'yaw') {
      let d = ((b.yaw - a.yaw + 540) % 360) - 180;
      out.yaw = a.yaw + d * k;
    } else out[key] = lerp(a[key], b[key], k);
  }
  return out;
}

// ---------------------------------------------------------------- output

export type FillRole = 'body' | 'shade' | 'inner' | 'sole' | 'scarf' | 'eye' | 'cheek' | 'glint';

export type Part = {
  id: string;
  /** Parts of one group never draw lines over each other (an ear's two half-blades). */
  group: string;
  shape: Shape;
  layer: number;
  fill: FillRole | null;
  /** In the silhouette union (its outline is part of the ONE stroke). */
  union: boolean;
  /** Draw its outline where it lies over lower parts (interior lines). */
  lines: boolean;
  /** Draw its whole outline with a thin pen (parts outside the union: scarf tails, the tail). */
  ownOutline?: boolean;
};

export type Mark = {
  /** An open polyline in model 2D. */
  pts: V2[];
  /** Ink weight relative to the contour (1 = the contour's weight). */
  w: number;
  layer: number;
  group: string;
  kind: 'midrib' | 'rib' | 'tuft' | 'scarf' | 'fringe' | 'tailtuft' | 'haunch';
};

export type PipGeom = {
  parts: Part[];
  marks: Mark[];
  /** Key points (model 2D) for the stroke's gaps and for scenes. */
  headTop: V2;
  headCentre: V2;
  base: V2;
  /** The ear root on the screen-right side (the third gap). */
  earRootRight: V2;
  /** Union box (model 2D). */
  box: BBox;
  /** The face points at us (eyes shown). */
  faceVisible: boolean;
};

// ---------------------------------------------------------------- dimensions (model units)

const BODY = {cy: -26, rx: 33, ry: 27, rz: 31};
const HEAD = {x: 0, y: -70, z: 4, rx: 29, ry: 26, rz: 27};
const EAR = {len: 39, wUp: 13.5, wLow: 17, bend: 0.1};
const ELEV = 9 * D2R;

// ---------------------------------------------------------------- the build

export type BuildOpts = {
  /** Level of detail: 0 = tiny (<= 55 px: no ribs, no toes, 2 tuft hairs), 1 = full. */
  lod: 0 | 1;
};

export function buildPip(p: PoseParams, o: BuildOpts = {lod: 1}): PipGeom {
  const th = p.yaw * D2R;
  const cT = Math.cos(th);
  const sT = Math.sin(th);
  const cE = Math.cos(ELEV);
  const sE = Math.sin(ELEV);
  /** body-local 3D -> view: [x, y, depth] (depth + = toward us). */
  const view = (q: V3): V3 => {
    const x = q[0] * cT + q[2] * sT;
    const z = -q[0] * sT + q[2] * cT;
    return [x, q[1] * cE + z * sE, z * cE - q[1] * sE];
  };
  const viewDir = (q: V3): V3 => view(q); // linear (no translation) for directions

  // ---- body (a pebble: wider and flatter below its middle, a touch narrower on top), breathing, hunch
  const hunch = clamp(p.hunch, -0.3, 0.6);
  const bry = BODY.ry * (1 + 0.018 * p.breath) * (1 - 0.13 * hunch) * (1 - 0.06 * p.leap);
  const brx = BODY.rx * (1 - 0.008 * p.breath) * (1 + 0.05 * hunch) * (1 - 0.05 * p.tuck);
  const bcy = -bry + 1;
  const bodyTopShift = BODY.cy - bcy + (BODY.ry - bry) * 1.0; // how far the top came down
  const bodyC = view([0, bcy, 0]);
  // seen side-on the pebble shows its depth: a leap stretches it nose to tail
  const brz = BODY.rz * (1 + 0.3 * clamp(p.leap) + 0.06 * clamp(p.tuck));
  const brx2 = Math.sqrt((brx * cT) ** 2 + (brz * sT) ** 2);
  const pebble = (x: number, y: number) => {
    const v = (y - bodyC[1]) / bry;
    const k = 1 + 0.07 * v; // wider below
    const u = (x - bodyC[0]) / (brx2 * k);
    const pv = v > 0 ? Math.pow(Math.abs(v), 2.7) : v * v;
    return Math.sqrt(u * u + pv) - 1;
  };
  const bodyShape = fieldShape(pebble, bodyC[0], bodyC[1], [bodyC[0] - brx2 * 1.12, bodyC[1] - bry * 1.02, bodyC[0] + brx2 * 1.12, bodyC[1] + bry * 1.02], 64);

  // ---- head rig: head-local -> body-local (roll, pitch, yaw relative to the body) -> view
  const headDrop = p.headDrop + bodyTopShift * 0.9;
  const H0: V3 = [HEAD.x, HEAD.y + headDrop, HEAD.z];
  const sgn = cT < -0.05 ? -1 : 1;
  // a near-front / near-back body: the head squares up to the camera axis at look 0 (so look +-1 turns it the same
  // amount either way); a profile keeps its head in line with the body
  const yawD = ((p.yaw % 360) + 360) % 360;
  const squareTo = Math.abs(yawD - 180) <= 32 ? 180 - yawD : yawD <= 32 ? -yawD : yawD >= 328 ? 360 - yawD : 0;
  const psi = (p.look * 95 * D2R) / sgn + squareTo * D2R;
  const phi = p.lookUp * 38 * D2R;
  const rho = p.headTilt * D2R;
  const cP = Math.cos(phi);
  const sP = Math.sin(phi);
  const cY = Math.cos(psi);
  const sY = Math.sin(psi);
  const cR = Math.cos(rho);
  const sR = Math.sin(rho);
  const headRot = (q: V3): V3 => {
    // roll about the forward axis
    const x0 = q[0] * cR - q[1] * sR;
    const y0 = q[0] * sR + q[1] * cR;
    // pitch: face up for phi > 0
    const y1 = y0 * cP - q[2] * sP;
    const z1 = y0 * sP + q[2] * cP;
    // yaw relative to the body
    return [x0 * cY + z1 * sY, y1, -x0 * sY + z1 * cY];
  };
  const headPt = (q: V3): V3 => view(v3.add(headRot(q), H0));
  const headVec = (q: V3): V3 => viewDir(headRot(q));
  const hc = view(H0);
  const headShape = ellipseShape(hc[0], hc[1], HEAD.rx, HEAD.ry, rho * 0.6, 44);
  const relDepth = (q: V3) => headPt(q)[2] - hc[2];
  const faceDir = headVec([0, 0, 1]);
  const faceVisible = faceDir[2] > -0.2;
  const headYawTot = th + psi;
  /** Profile cheat: the ears swing back as the head turns side-on, so a profile still shows a leaf flap. */
  const earBack = 50 * Math.pow(Math.abs(Math.sin(headYawTot)), 3);

  const parts: Part[] = [];
  const marks: Mark[] = [];

  parts.push({id: 'body', group: 'body', shape: bodyShape, layer: 0, fill: 'body', union: true, lines: false});
  parts.push({id: 'head', group: 'head', shape: headShape, layer: 0.4, fill: 'body', union: true, lines: faceVisible});

  // ---- ears: two half-blades on a curved midrib each
  let earRootRight: V2 = [hc[0] + HEAD.rx, hc[1]];
  let earRootRightX = -Infinity;
  for (const s of [1, -1] as const) {
    const A = s === 1 ? 'A' : 'B';
    const droop = (s === 1 ? p.earDroopA : p.earDroopB) * D2R;
    const swing = ((s === 1 ? p.earSwingA : p.earSwingB) - earBack) * D2R;
    const fold = clamp(s === 1 ? p.earFoldA : p.earFoldB, 0, 1);
    const att: V3 = [s * 22.5, -9, -6];
    // a rigid leaf frame: at rest the midrib points straight out sideways, the upper half-blade up, the inner (pink)
    // face forward; droop turns it about the forward axis, swing about the vertical axis (+ = forward)
    const ax1: V3 = [0, 0, s];
    const ax2: V3 = [0, -s, 0];
    const frame = (v: V3) => v3.rot(v3.rot(v, ax1, droop), ax2, swing);
    const d = frame([s, 0, 0]);
    let w = frame([0, -1, 0]); // the upper half-blade's direction
    let nFront = frame([0, 0, 1]); // the inner (pink) face
    // never edge-on: a leaf seen side-on is a sliver, so it twists about its midrib toward us (the smallest twist
    // that shows it at >= 0.4 of its width; a cheat every cartoonist makes)
    {
      const nz0 = Math.abs(headVec(nFront)[2]);
      if (nz0 < 0.4) {
        let bestT = 0;
        let bestZ = nz0;
        for (let k = 1; k <= 14; k++) {
          for (const sg of [1, -1]) {
            const tau = sg * k * 5 * D2R;
            const z = Math.abs(headVec(v3.rot(nFront, d, tau))[2]);
            if (z > bestZ + 1e-6 && bestZ < 0.4) {
              bestZ = z;
              bestT = tau;
            }
          }
          if (bestZ >= 0.4) break;
        }
        w = v3.rot(w, d, bestT);
        nFront = v3.rot(nFront, d, bestT);
      }
    }
    const foldAng = s * fold * 165 * D2R;
    const wB = v3.rot(v3.mul(w, -1), d, foldAng); // the lower half-blade, folded about the midrib
    const nB = v3.rot(nFront, d, foldAng);
    // past 90 deg of forward swing the leaf wraps round the front of the face (ears-cover): the root stays at the
    // side, the blade is carried forward over the face
    const wrap = clamp(((s === 1 ? p.earSwingA : p.earSwingB) - 90) / 70);
    const mid = (u: number): V3 =>
      v3.add(v3.add(v3.add(att, v3.mul(d, u * EAR.len)), v3.mul(w, -EAR.bend * EAR.len * u * u)), [0, 0, wrap * 34 * Math.sqrt(u)]);
    const hw = (u: number) => Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.85);
    const N = o.lod ? 14 : 9;
    const blade = (dir: V3, W: number): {P: V2[]; mid: V2[]} => {
      const P: V2[] = [];
      const M: V2[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const q = headPt(v3.add(mid(u), v3.mul(dir, W * hw(u))));
        P.push([q[0], q[1]]);
      }
      for (let i = N; i >= 0; i--) {
        const q = headPt(mid(i / N));
        M.push([q[0], q[1]]);
      }
      return {P: [...P, ...M], mid: M};
    };
    const up = blade(w, EAR.wUp);
    const low = blade(wB, EAR.wLow * (1 - 0.12 * fold));
    const rootDepth = relDepth(att);
    const bladeDepth = relDepth(mid(0.6));
    // in front of the head unless the root has gone round the back (the far ear in a profile)
    const front = wrap > 0.3 ? bladeDepth > 0 : rootDepth > -HEAD.rz * 0.42;
    const layer = front ? 0.6 + rootDepth * 0.001 : -2 + rootDepth * 0.001;
    const fillRole: FillRole = front ? 'body' : 'shade';
    const nUp = headVec(nFront);
    const nLow = headVec(nB);
    // lower blade first (it folds behind / over depending on the side we see)
    const lowOnTop = fold > 0.5 && nUp[2] > 0; // folded toward its pink face: the folded blade lies on top when we see that face
    const pUp: Part = {id: `ear${A}u`, group: `ear${A}`, shape: polyShape(up.P), layer, fill: fillRole, union: true, lines: front};
    const pLow: Part = {id: `ear${A}l`, group: `ear${A}`, shape: polyShape(low.P), layer: layer + (lowOnTop ? 0.0005 : -0.0005), fill: fillRole, union: true, lines: front};
    parts.push(pUp, pLow);
    // the pink inner face where it faces us
    for (const [bl, n, dir, W, lay] of [
      [up, nUp, w, EAR.wUp, pUp.layer],
      [low, nLow, wB, EAR.wLow, pLow.layer],
    ] as const) {
      void bl;
      if (front && n[2] > 0.12) {
        const P: V2[] = [];
        const NN = 10;
        for (let i = 0; i <= NN; i++) {
          const u = 0.12 + (0.8 * i) / NN;
          const q = headPt(v3.add(mid(u), v3.mul(dir, W * 0.62 * hw(u))));
          P.push([q[0], q[1]]);
        }
        for (let i = NN; i >= 0; i--) {
          const u = 0.12 + (0.8 * i) / NN;
          const q = headPt(v3.add(mid(u), v3.mul(dir, W * 0.12 * hw(u))));
          P.push([q[0], q[1]]);
        }
        parts.push({id: `ear${A}in${lay}`, group: `ear${A}`, shape: polyShape(P), layer: lay + 0.0002, fill: 'inner', union: false, lines: false});
      }
    }
    // the midrib (a leaf's vein): the fold line when folded, a short vein when open
    if (front) {
      const M: V2[] = [];
      const u0 = fold > 0.5 ? 0.02 : 0.18;
      const u1 = fold > 0.5 ? 0.97 : 0.7;
      for (let i = 0; i <= 8; i++) {
        const q = headPt(mid(u0 + ((u1 - u0) * i) / 8));
        M.push([q[0], q[1]]);
      }
      marks.push({pts: M, w: fold > 0.5 ? 0.8 : 0.55, layer: layer + 0.001, group: `ear${A}`, kind: 'midrib'});
    }
    const rootV = headPt(att);
    if (rootV[0] > earRootRightX) {
      earRootRightX = rootV[0];
      earRootRight = [rootV[0], rootV[1]];
    }
  }

  // ---- trunk: down a little, then one curl forward and up
  {
    const raise = p.trunkRaise * D2R;
    const g: V3 = [0, Math.cos(raise), Math.sin(raise)];
    const f0: V3 = [0, -Math.sin(raise), Math.cos(raise)];
    const chi = (38 + p.trunkSide) * D2R;
    const f = v3.norm(v3.add(v3.mul(f0, Math.cos(chi)), v3.mul(v3.cross(g, f0), Math.sin(chi))));
    const T0: V3 = [0, 6, 25.3];
    const curl = clamp(p.trunkCurl, 0, 1.4);
    const Ls = 10 + 4 * (1 - Math.min(1, curl));
    const rc = 6.6;
    const arc = curl * 250 * D2R;
    const total = Ls + rc * arc;
    const C: V2[] = [];
    const R: number[] = [];
    let pos = T0;
    let depthSum = 0;
    const steps = Math.max(8, Math.ceil(total / 1.6));
    for (let i = 0; i <= steps; i++) {
      const sArc = (i / steps) * total;
      if (i > 0) {
        const s0 = ((i - 1) / steps) * total;
        const ang = 18 * D2R + Math.max(0, (s0 + sArc) / 2 - Ls) / rc;
        const ds = total / steps;
        pos = v3.add(pos, v3.add(v3.mul(g, Math.cos(ang) * ds), v3.mul(f, Math.sin(ang) * ds)));
      }
      const q = headPt(pos);
      C.push([q[0], q[1]]);
      R.push(lerp(5.6, 2.5, Math.pow(sArc / total, 0.8)));
      depthSum += q[2] - hc[2];
    }
    const front = depthSum / (steps + 1) > -HEAD.rz * 0.3;
    parts.push({id: 'trunk', group: 'trunk', shape: tubeShape(C, R), layer: front ? 0.7 : -2.5, fill: 'body', union: true, lines: front});
    // two little trunk creases (only side-on: seen end-on they read as a mouth)
    if (front && o.lod && Math.abs(Math.sin(headYawTot)) > 0.55) {
      for (const k of [0.22, 0.36]) {
        const i = Math.round(k * steps);
        const a = C[Math.max(0, i - 1)];
        const b = C[Math.min(steps, i + 1)];
        const tx = b[0] - a[0];
        const ty = b[1] - a[1];
        const l = Math.hypot(tx, ty) || 1;
        const r = R[i] * 0.55;
        const c = C[i];
        marks.push({pts: [[c[0] - (ty / l) * r, c[1] + (tx / l) * r], [c[0] + (tx / l) * 0.8, c[1] + (ty / l) * 0.8], [c[0] + (ty / l) * r, c[1] - (tx / l) * r]], w: 0.45, layer: 0.701, group: 'trunk', kind: 'rib'});
      }
    }
  }

  // ---- eyes and cheeks (face side only)
  if (faceVisible) {
    for (const s of [1, -1]) {
      const e = headPt([s * 12.5, -3, 23.6]);
      const rd = e[2] - hc[2];
      if (rd > 3) {
        const fs = clamp(rd / HEAD.rz, 0.35, 1);
        const open = clamp(p.eyes, 0.08, 1);
        parts.push({id: `eye${s}`, group: 'head', shape: ellipseShape(e[0], e[1], 2.5 * fs, 3.3 * open, rho, 14), layer: 0.45, fill: 'eye', union: false, lines: false});
        if (o.lod && open > 0.6) parts.push({id: `glint${s}`, group: 'head', shape: ellipseShape(e[0] + 0.8 * fs, e[1] - 1.1, 0.8, 0.8, 0, 8), layer: 0.451, fill: 'glint', union: false, lines: false});
        const ch = headPt([s * 17, 7, 19.5]);
        if (ch[2] - hc[2] > 4) parts.push({id: `cheek${s}`, group: 'head', shape: ellipseShape(ch[0], ch[1], 3.6 * fs, 2.3, rho, 12), layer: 0.44, fill: 'cheek', union: false, lines: false});
      }
    }
  }

  // ---- tuft: three hairs from the top of the head (through the stroke's head-top gap)
  const top = headPt([0, -HEAD.ry, 1]);
  const upV = headVec([0, -1, 0]);
  {
    const base = Math.atan2(upV[1], upV[0]) + p.tuftLean * D2R;
    const hairs = o.lod ? [-30, 0, 28] : [-20, 20];
    const lens = o.lod ? [8, 10.5, 7.5] : [8.5, 8.5];
    hairs.forEach((a0, i) => {
      const a = base + a0 * D2R;
      const L = lens[i];
      const r0: V2 = [top[0] + Math.cos(a) * 1.5, top[1] + Math.sin(a) * 1.5];
      const bend = (a0 >= 0 ? 1 : -1) * 0.35 + p.tuftLean * 0.01;
      const pts: V2[] = [];
      for (let k = 0; k <= 4; k++) {
        const u = k / 4;
        const aa = a + bend * u;
        pts.push([r0[0] + Math.cos(aa) * L * u, r0[1] + Math.sin(aa) * L * u]);
      }
      marks.push({pts, w: 0.62, layer: 0.95, group: 'tuft', kind: 'tuft'});
    });
  }

  // ---- legs: sit -> tuck / leap
  const lerp3 = (a: V3, b: V3, c: V3): V3 => {
    const k1 = clamp(p.tuck);
    const k2 = clamp(p.leap);
    return [a[0] + (b[0] - a[0]) * k1 + (c[0] - a[0]) * k2, a[1] + (b[1] - a[1]) * k1 + (c[1] - a[1]) * k2, a[2] + (b[2] - a[2]) * k1 + (c[2] - a[2]) * k2];
  };
  const hy = (BODY.ry - bry) * 0.5; // a hunch lowers the hips a hair
  for (const s of [1, -1]) {
    // front leg (a stubby column) and its foot
    const top3 = lerp3([s * 10, -24 + hy, 22], [s * 10, -27, 17], [s * 10, -29, 19]);
    const bot3 = lerp3([s * 10.5, -4.5, 24], [s * 10, -15, 25], [s * 9, -19, 40]);
    const a = view(top3);
    const b = view(bot3);
    const legDepth = (a[2] + b[2]) / 2 - bodyC[2];
    const frontLeg = legDepth > 4;
    parts.push({id: `fleg${s}`, group: `fleg${s}`, shape: tubeShape([[a[0], a[1]], [b[0], b[1]]], [7, 7.2]), layer: frontLeg ? 0.2 + legDepth * 0.0005 : -1 + legDepth * 0.0005, fill: frontLeg ? 'body' : 'shade', union: true, lines: frontLeg});
    // hind foot (an egg) with the teddy-bear sole
    const fc3 = lerp3([s * 20, -8.5, 17], [s * 15, -13, 6], [s * 12, -15, -29]);
    const fc = view(fc3);
    const footDepth = fc[2] - bodyC[2];
    const frontFoot = footDepth > 6;
    const solN = v3.norm(lerp3([s * 0.28, 0.12, 1], [0, 1, -0.35], [s * 0.1, 0.35, -1]));
    const sv = viewDir(solN);
    const footRot = Math.atan2(sv[1], sv[0]) + Math.PI / 2;
    parts.push({id: `foot${s}`, group: `foot${s}`, shape: ellipseShape(fc[0], fc[1], 11.5, 9.6, Math.abs(sv[2]) > 0.7 ? 0 : footRot * 0.25, 30), layer: frontFoot ? 0.25 + footDepth * 0.0005 : -0.9 + footDepth * 0.0005, fill: frontFoot ? 'body' : 'shade', union: true, lines: frontFoot});
    if (sv[2] > 0.25) {
      // the sole faces us: one big pad + three toe beans (lod 1), drawn on the foot's face
      const centre3 = v3.add(fc3, v3.mul(solN, 7.5));
      const uAx = v3.norm(v3.cross(solN, [0, -1, 0.0001])); // sole-plane right
      const vAx = v3.norm(v3.cross(uAx, solN)); // sole-plane up
      const ring = (cx: number, cy: number, rx: number, ry: number, n = 12): V2[] => {
        const out: V2[] = [];
        for (let i = 0; i < n; i++) {
          const t = (i / n) * Math.PI * 2;
          const q = view(v3.add(centre3, v3.add(v3.mul(uAx, cx + Math.cos(t) * rx), v3.mul(vAx, cy + Math.sin(t) * ry))));
          out.push([q[0], q[1]]);
        }
        return out;
      };
      const lay = (frontFoot ? 0.25 + footDepth * 0.0005 : -0.9) + 0.0003;
      parts.push({id: `pad${s}`, group: `foot${s}`, shape: polyShape(ring(0, -1.6, 5.4, 4.4)), layer: lay, fill: 'sole', union: false, lines: false});
      if (o.lod) for (const [tx, ty] of [[-4.2, 4.4], [0, 5.9], [4.2, 4.4]] as const) parts.push({id: `toe${s}${tx}`, group: `foot${s}`, shape: polyShape(ring(tx, ty, 1.7, 1.5, 8)), layer: lay, fill: 'sole', union: false, lines: false});
    }
  }

  // ---- scarf: a knitted band round the no-neck, a knot at the side, two short tails lifting in the wind
  const sy = -48.5 + headDrop * 0.55 - (BODY.ry - bry) * 0.2;
  const rs = 20.5 * (1 + 0.04 * hunch);
  const hs = 8.5;
  {
    // band silhouette (yaw-independent ring): back arc of the top ring + front arc of the bottom ring
    const ring = (y: number, from: number, to: number, n: number): V2[] => {
      const out: V2[] = [];
      for (let i = 0; i <= n; i++) {
        const a = from + ((to - from) * i) / n;
        const q = view([rs * Math.sin(a), y, rs * Math.cos(a)]);
        out.push([q[0], q[1]]);
      }
      return out;
    };
    // the ring point that is leftmost on screen: angle where view x is minimal -> a = -th - 90deg
    const aL = -th - Math.PI / 2;
    const knit = (P: V2[], amp: number, n: number): V2[] => P.map(([x, y], i) => [x, y + amp * Math.sin((i / Math.max(1, P.length - 1)) * Math.PI * n)]);
    const topBack = ring(sy - hs / 2, aL + Math.PI * 2, aL + Math.PI, 18); // left -> over the back -> right
    const botFront = knit(ring(sy + hs / 2, aL + Math.PI, aL, 18), 0.35, 7); // right -> under the front -> left
    const band = [...topBack, ...botFront];
    parts.push({id: 'scarf', group: 'scarf', shape: polyShape(band), layer: 0.5, fill: 'scarf', union: true, lines: false});
    // the band's top-front edge and the knit ribs on the front half
    const topFront = ring(sy - hs / 2, aL + Math.PI, aL, 18);
    marks.push({pts: topFront, w: 0.55, layer: 0.5005, group: 'scarf', kind: 'scarf'});
    marks.push({pts: botFront, w: 0.7, layer: 0.5005, group: 'scarf', kind: 'scarf'});
    if (o.lod) {
      for (let k = 1; k < 7; k++) {
        const a = aL + Math.PI - (k / 7) * Math.PI;
        const q0 = view([rs * Math.sin(a), sy - hs * 0.22, rs * Math.cos(a)]);
        const q1 = view([rs * Math.sin(a), sy + hs * 0.28, rs * Math.cos(a)]);
        marks.push({pts: [[q0[0], q0[1]], [q1[0] + 0.4, q1[1]]], w: 0.36, layer: 0.5004, group: 'scarf', kind: 'rib'});
      }
    }
    // knot at Pip's +x side, a little behind the side (visible from the back and the front)
    const ak = 100 * D2R;
    const kq = view([(rs + 2.5) * Math.sin(ak), sy + 1, (rs + 2.5) * Math.cos(ak)]);
    const knotFront = kq[2] > bodyC[2] - 4;
    const kLayer = knotFront ? 0.56 : -1.5;
    parts.push({id: 'knot', group: 'scarfT', shape: ellipseShape(kq[0], kq[1], 5.2, 4.6, 0.3, 16), layer: kLayer + 0.001, fill: 'scarf', union: false, lines: false, ownOutline: true});
    // two tails: hang from the knot, lifted by the wind, fluttering (a travelling wave)
    const lift = clamp(p.scarfLift, 0, 1.2);
    const wind = clamp(p.wind, -1, 1);
    const side = kq[0] >= bodyC[0] ? 1 : -1;
    const tails: [number, number, number][] = [
      [19, 8.2, 0],
      [15, 7.2, 1],
    ];
    for (const [len, wid, i] of tails) {
      const hang = side * (14 + i * 16) * D2R; // hanging slightly outward
      const blown = wind * (lerp(35, 82, lift) + i * 8) * D2R;
      const ang0 = lerp(hang, blown, clamp(lift * 1.2));
      const C: V2[] = [];
      const R: number[] = [];
      const n = 8;
      for (let k = 0; k <= n; k++) {
        const u = k / n;
        const wave = Math.sin(p.flutter * Math.PI * 2 - u * 4.2 + i * 1.7) * (0.18 + 0.32 * lift) * u;
        const a = ang0 + wave;
        if (k === 0) C.push([kq[0] + Math.sin(ang0) * 1.5, kq[1] + Math.cos(ang0) * 1.5 + 1]);
        else {
          const prev = C[k - 1];
          C.push([prev[0] + Math.sin(a) * (len / n), prev[1] + Math.cos(a) * (len / n)]);
        }
        R.push((wid / 2) * (1 - 0.15 * u));
      }
      const tail = tubeShape(C, R);
      parts.push({id: `stail${i}`, group: 'scarfT', shape: tail, layer: kLayer - 0.001 * (i + 1), fill: 'scarf', union: false, lines: false, ownOutline: true});
      // fringe at the end: three little ticks
      const e = C[n];
      const pe = C[n - 1];
      const dx = e[0] - pe[0];
      const dy = e[1] - pe[1];
      const l = Math.hypot(dx, dy) || 1;
      const ux = dx / l;
      const uy = dy / l;
      if (o.lod) for (const f of [-0.6, 0, 0.6]) {
        const bx = e[0] - uy * R[n] * f + ux * R[n] * 0.6;
        const by = e[1] + ux * R[n] * f + uy * R[n] * 0.6;
        marks.push({pts: [[bx, by], [bx + ux * 3.2, by + uy * 3.2]], w: 0.42, layer: kLayer, group: 'scarfT', kind: 'fringe'});
      }
      // one knit rib across the tail
      if (o.lod) {
        const m = C[Math.round(n * 0.45)];
        const mm = C[Math.round(n * 0.45) + 1];
        const tx = mm[0] - m[0];
        const ty = mm[1] - m[1];
        const tl = Math.hypot(tx, ty) || 1;
        const r = R[Math.round(n * 0.45)] * 0.75;
        marks.push({pts: [[m[0] - (ty / tl) * r, m[1] + (tx / tl) * r], [m[0] + (ty / tl) * r, m[1] - (tx / tl) * r]], w: 0.36, layer: kLayer, group: 'scarfT', kind: 'rib'});
      }
    }
  }

  // ---- the tail: from the back of the pebble, hanging over the seat's edge (or streaming back in a leap)
  {
    const root3: V3 = [0, -10, -BODY.rz + 1];
    const rq = view(root3);
    const rootDepth = rq[2] - bodyC[2];
    const len = 21 * clamp(p.tailLen, 0, 1.4);
    const a0 = p.tailAngle * D2R;
    const C: V2[] = [];
    const R: number[] = [];
    const n = 7;
    let x = rq[0];
    let y = rq[1];
    for (let k = 0; k <= n; k++) {
      const u = k / n;
      const a = a0 + p.tailCurl * 1.4 * u * u * (p.tailAngle >= 0 ? 1 : -1);
      if (k > 0) {
        x += Math.sin(a) * (len / n);
        y += Math.cos(a) * (len / n);
      }
      C.push([x, y]);
      R.push(lerp(2.4, 1.7, u));
    }
    const front = rootDepth > 0;
    if (len > 2) {
      parts.push({id: 'tail', group: 'tail', shape: tubeShape(C, R), layer: front ? 0.3 : -1.2, fill: front ? 'body' : 'shade', union: false, lines: false, ownOutline: true});
      // the tail tip: a little leaf-brush of three hairs
      const e = C[n];
      const pe = C[n - 1];
      const ang = Math.atan2(e[1] - pe[1], e[0] - pe[0]);
      for (const da of o.lod ? [-0.5, 0, 0.5] : [-0.35, 0.35]) {
        const aa = ang + da;
        marks.push({pts: [e, [e[0] + Math.cos(aa) * 4.4, e[1] + Math.sin(aa) * 4.4]], w: 0.5, layer: front ? 0.301 : -1.19, group: 'tail', kind: 'tailtuft'});
      }
    }
  }

  // ---- haunches: two short arcs low on the back where the seated thighs are (the back view's only body marks)
  if (cT < -0.3 && p.leap < 0.5 && p.tuck < 0.5) {
    for (const sd of [1, -1]) {
      const P: V2[] = [];
      // a quadratic from the seat up and in: the outline of a seated thigh seen from behind
      const A0: V3 = [sd * brx * 0.66, -3, -BODY.rz * 0.62];
      const A1: V3 = [sd * brx * 0.74, -15, -BODY.rz * 0.72];
      const A2: V3 = [sd * brx * 0.42, -21, -BODY.rz * 0.86];
      for (let k = 0; k <= 8; k++) {
        const u = k / 8;
        const q = view([
          (1 - u) * (1 - u) * A0[0] + 2 * u * (1 - u) * A1[0] + u * u * A2[0],
          (1 - u) * (1 - u) * A0[1] + 2 * u * (1 - u) * A1[1] + u * u * A2[1],
          (1 - u) * (1 - u) * A0[2] + 2 * u * (1 - u) * A1[2] + u * u * A2[2],
        ]);
        P.push([q[0], q[1]]);
      }
      marks.push({pts: P, w: 0.55, layer: 0.01, group: 'body', kind: 'haunch'});
    }
  }

  // ---- union box
  let box: BBox = [Infinity, Infinity, -Infinity, -Infinity];
  for (const pt of parts) {
    if (!pt.union) continue;
    box = [Math.min(box[0], pt.shape.box[0]), Math.min(box[1], pt.shape.box[1]), Math.max(box[2], pt.shape.box[2]), Math.max(box[3], pt.shape.box[3])];
  }
  void bboxOf;
  return {
    parts,
    marks,
    headTop: [top[0], top[1]],
    headCentre: [hc[0], hc[1]],
    base: [bodyC[0], 0],
    earRootRight,
    box,
    faceVisible,
  };
}
