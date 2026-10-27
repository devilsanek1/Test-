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

import {BBox, bboxOf, clamp, D2R, ellipseShape, fieldShape, lerp, polyShape, Shape, smooth, tubeShape, V2, V3, v3} from './geom';

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
  /** Trunk length multiplier (1 = the short trunk; a raised "sniffing the sky" trunk reaches longer). */
  trunkLen: number;
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
  /** THE WATCHER CHEAT 0..1 (the art director's "watch34"; 1 = the default). While the body is within ~40 deg of
   *  facing away (a perched watcher), the body settles to a 3/4 back turned toward the side it looks, and the head
   *  turns its FACE to that side: 3/4 front above 72 px (the trunk curl, one eye and the blush show), a clean profile
   *  at <= 60 px (the elephant still reads at 44 px). The side: the look / target (< 0 screen left), else the way the
   *  body is turned (FACING back / backRight -> right, backLeft -> left, straight away -> left, west). 0 = the plain
   *  rig (a back view whose head turns away from us). */
  watch: number;
  /** 0..1: turn to the camera. The body swings round to a 3/4 front through the side the head is on, the head faces
   *  us, a target stops pulling the head (S1's ears-cover is played from the FRONT: earsCover sets 1). */
  toCam: number;
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
  trunkLen: 1,
  tuck: 0,
  leap: 0,
  hunch: 0,
  breath: 0,
  tailAngle: 6,
  tailCurl: 0.5,
  tailLen: 1,
  scarfLift: 0.6,
  wind: -1,
  flutter: 0,
  tuftLean: 0,
  eyes: 1,
  watch: 1,
  toCam: 0,
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

// ---------------------------------------------------------------- the watcher (how a perched Pip is seen)

/** Tunables of the watcher cheat (`watch`) and the turn to camera (`toCam`). Degrees. */
export const WATCH = {
  /** The watcher's body: degrees from straight away, turned toward the side it looks (45 = a true 3/4 back)... */
  body: 40,
  /** ...and at <= 60 px, further round toward the profile (the elephant silhouette carries the 44 px S5 end). */
  bodySmall: 62,
  /** The watcher's head: degrees PAST the profile toward us from 72 px up (a 3/4 front: the trunk curl, one eye, the
   *  blush)... */
  past: 34,
  /** ...and at <= 60 px a profile, turned just enough that the eye clears the trunk's root. */
  pastSmall: 14,
  /** |look| >= this turns the face fully to that side. */
  sideLook: 0.3,
  /** The back sector: the cheat is full while the body is >= `full` deg from facing us, gone at <= `none`. */
  full: 140,
  none: 112,
  /** toCam = 1: the body ends this far off facing us (on the side the head came round), the head this far. */
  camBody: 26,
  camHead: 5,
  /** How far the ears follow a turned head (the plain rig lags them at 0.5 so a head turned away keeps a leaf on each
   *  side; the watcher's face-on head carries them all the way: the near leaf flares out behind its eye). */
  earLag: 1,
};

/** Wrap degrees to [-180, 180). */
export const wrap180 = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

/** The plain rig's head yaw (absolute degrees) for a body yaw and a screen-relative look: squared to the camera axis
 *  within 30 deg of front / back, turned up to +-95 deg by look, the look fading out side-on (no flip). */
export function plainHeadYaw(yawDeg: number, look: number): number {
  const cT = Math.cos(yawDeg * D2R);
  const yawD = ((yawDeg % 360) + 360) % 360;
  const dBack = 180 - yawD;
  const dFront = yawD <= 180 ? -yawD : 360 - yawD;
  const fade = (dd: number) => dd * clamp((45 - Math.abs(dd)) / 15);
  const squareTo = Math.abs(dBack) < Math.abs(dFront) ? fade(dBack) : fade(dFront);
  return yawDeg + look * 95 * clamp(cT * 1.6, -1, 1) + squareTo;
}

export type WatchYaw = {
  /** The effective body and head yaw (degrees; 0 = toward us, 90 = facing screen right, 180 = away, 270 = left). */
  body: number;
  head: number;
  /** -1 (its face toward screen left) .. +1 (right): the side the watcher shows its face on. */
  side: number;
  /** 0..1: how much of the watcher cheat is on (watch x the back sector). */
  k: number;
};

/** Where the body and the head point, after the watcher cheat and the turn to camera. Pure; continuous in every
 *  parameter (the side passes through the back of the head, never a pop). `px` = the drawn size (seat to head top). */
export function watchYaw(p: PoseParams, px = 96): WatchYaw {
  const Hp = plainHeadYaw(p.yaw, p.look);
  const phiB = wrap180(p.yaw); // 0 = facing us, +-180 = away, + = turned toward screen right
  const k = clamp(p.watch) * smooth((Math.abs(phiB) - WATCH.none) / (WATCH.full - WATCH.none));
  // the side: the look first; with no look, the way the body is turned; straight away with no look: west (left)
  const s0 = clamp(p.look / WATCH.sideLook, -1, 1);
  const sb = Math.sign(phiB) * clamp((180 - Math.abs(phiB)) / 20);
  const side = clamp(s0 + (1 - Math.abs(s0)) * (sb - (1 - Math.abs(sb))), -1, 1);
  const sg = side > 0 ? 1 : -1;
  // size: a clean profile at <= 60 px, the 3/4 front from 72 px
  const big = smooth((px - 60) / 12);
  const past = lerp(WATCH.pastSmall, WATCH.past, big);
  const bodyOff = lerp(WATCH.bodySmall, WATCH.body, big);
  // side 0 = the back of the head (180); side +-1 = (90 - past) deg off facing us on that side
  const phiHw = sg * (180 - Math.abs(side) * (90 + past));
  const phiBw = sg * (180 - Math.abs(side) * bodyOff);
  let body = p.yaw + wrap180(phiBw - p.yaw) * k;
  let head = Hp + wrap180(phiHw - Hp) * k;
  // the turn to camera: round through the side the head is on (linear in [-180, 180): never across the back)
  const tc = clamp(p.toCam);
  if (tc > 0) {
    let fb = wrap180(body);
    let fh = wrap180(head);
    if (Math.abs(fb) > 170) fb = sg * Math.abs(fb);
    if (Math.abs(fh) > 170) fh = sg * Math.abs(fh);
    const eb = smooth(tc);
    body = lerp(fb, sg * WATCH.camBody, eb);
    head = lerp(fh, sg * WATCH.camHead, tc);
  }
  return {body, head, side, k};
}

/** Which ear faces us: 1 = ear A (Pip's model +x side), -1 = ear B, 0 = both show (a head seen square from the front
 *  or the back). A face-on watcher hides its far ear behind its head, so a flick goes to the near one (idle.ts,
 *  PipTrack). */
export function nearEar(p: PoseParams, px = 96): 1 | -1 | 0 {
  const s = Math.sin(watchYaw(p, px).head * D2R);
  return s < -0.5 ? 1 : s > 0.5 ? -1 : 0;
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
  /** 0..1: mix the fill toward the shade colour (an ear turning round the back of the head). */
  fillMix?: number;
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

const BODY = {cy: -25, rx: 31, ry: 26, rz: 30};
const HEAD = {x: 0, y: -70, z: 4, rx: 30, ry: 26, rz: 27};
const EAR = {len: 46, wUp: 16.5, wLow: 21, bend: 0.1};
const ELEV = 9 * D2R;

// ---------------------------------------------------------------- the build

export type BuildOpts = {
  /** Level of detail: 0 = tiny (<= 55 px: no ribs, no toes, 2 tuft hairs), 1 = full. */
  lod: 0 | 1;
  /** The drawn size (px, seat to head top): the watcher's head is a 3/4 front above 72 px, a profile at <= 60. */
  px?: number;
  /** Design studies only: force the body / head yaw (degrees), bypassing watchYaw. */
  yaws?: {body: number; head: number};
};

export function buildPip(p: PoseParams, o: BuildOpts = {lod: 1}): PipGeom {
  const wy = o.yaws ? {...o.yaws, side: 0, k: 0} : watchYaw(p, o.px ?? 96);
  const th = wy.body * D2R;
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
  // The head's yaw comes from watchYaw: the plain rig squares the head to the camera axis near front / back and turns
  // it +-95 deg by the screen-relative look (fading out side-on); the watcher cheat turns the face round to us on the
  // side it looks; toCam turns it to face us. Seen from BEHIND a head turn is nearly invisible, so the plain rig plays
  // it big (the head leans and tilts toward its look side, the trunk lifts out past the cheek): those tricks follow
  // the head's own backness under the cheat (none for a 3/4 front head), and fade with toCam.
  const bodyBack = clamp(-cT * 1.3);
  const headBack = clamp(-Math.cos(wy.head * D2R) * 1.3);
  const backness = lerp(bodyBack, headBack, wy.k);
  const lk = p.look * (1 - clamp(p.toCam));
  const turnedAway = backness > 0.4 && Math.abs(lk) > 0.38 && Math.max(p.earSwingA, p.earSwingB) < 95;
  const H0: V3 = [HEAD.x - lk * 3.5 * backness * Math.sign(-cT || 1), HEAD.y + headDrop, HEAD.z];
  const psi = wrap180(wy.head - wy.body) * D2R;
  const phi = p.lookUp * 38 * D2R;
  const rho = (p.headTilt + lk * 8 * backness) * D2R;
  const makeRot = (yawR: number, pitchR: number, rollR: number) => {
    const cP = Math.cos(pitchR);
    const sP = Math.sin(pitchR);
    const cY = Math.cos(yawR);
    const sY = Math.sin(yawR);
    const cR = Math.cos(rollR);
    const sR = Math.sin(rollR);
    return (q: V3): V3 => {
      // roll about the forward axis
      const x0 = q[0] * cR - q[1] * sR;
      const y0 = q[0] * sR + q[1] * cR;
      // pitch: face up for > 0
      const y1 = y0 * cP - q[2] * sP;
      const z1 = y0 * sP + q[2] * cP;
      // yaw relative to the body
      return [x0 * cY + z1 * sY, y1, -x0 * sY + z1 * cY];
    };
  };
  const headRot = makeRot(psi, phi, rho);
  const headPt = (q: V3): V3 => view(v3.add(headRot(q), H0));
  const headVec = (q: V3): V3 => viewDir(headRot(q));
  // the ears turn only part of the way with the head (a cartoonist's lag: seen from behind, a turned head keeps one
  // leaf on each side instead of swinging one ear into the middle of the back of the head)
  const earRot = makeRot(psi * lerp(0.5, WATCH.earLag, wy.k), phi * 0.6, rho);
  const earPt = (q: V3): V3 => view(v3.add(earRot(q), H0));
  const earVec = (q: V3): V3 => viewDir(earRot(q));
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
    const droop0 = s === 1 ? p.earDroopA : p.earDroopB;
    const droop = lerp(droop0, lerp(droop0, 72, backness), clamp(((s === 1 ? p.earSwingA : p.earSwingB) - 110) / 15)) * D2R;
    const swing0 = s === 1 ? p.earSwingA : p.earSwingB;
    // from behind, an ear swung past 100 deg would vanish round the face: keep it at the side, pressed forward
    // ears-cover (a swing past 110): from the front the leaves wrap over the eyes; from behind they hang forward-down
    // against the cheeks (a leaf wrapped out of sight would leave a bald blob)
    const cover = clamp((swing0 - 110) / 15);
    const swingV = lerp(swing0, lerp(165, 82, backness), cover);
    const swing = (swingV - earBack) * D2R;
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
      const nz0 = Math.abs(earVec(nFront)[2]);
      if (nz0 < 0.4) {
        let bestT = 0;
        let bestZ = nz0;
        for (let k = 1; k <= 14; k++) {
          for (const sg of [1, -1]) {
            const tau = sg * k * 5 * D2R;
            const z = Math.abs(earVec(v3.rot(nFront, d, tau))[2]);
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
    const wrap = clamp((swingV - 90) / 70);
    const mid = (u: number): V3 =>
      v3.add(v3.add(v3.add(att, v3.mul(d, u * EAR.len)), v3.mul(w, -EAR.bend * EAR.len * u * u)), [0, 0, wrap * 34 * Math.sqrt(u)]);
    const hw = (u: number) => Math.pow(Math.sin(Math.PI * Math.pow(u, 0.72)), 0.85);
    const N = o.lod ? 14 : 9;
    const blade = (dir: V3, W: number): {P: V2[]; mid: V2[]} => {
      const P: V2[] = [];
      const M: V2[] = [];
      for (let i = 0; i <= N; i++) {
        const u = i / N;
        const q = earPt(v3.add(mid(u), v3.mul(dir, W * hw(u))));
        P.push([q[0], q[1]]);
      }
      for (let i = N; i >= 0; i--) {
        const q = earPt(mid(i / N));
        M.push([q[0], q[1]]);
      }
      return {P: [...P, ...M], mid: M};
    };
    const up = blade(w, EAR.wUp);
    const low = blade(wB, EAR.wLow * (1 - 0.12 * fold));
    const rootDepth = earPt(att)[2] - hc[2];
    const bladeDepth = earPt(mid(0.6))[2] - hc[2];
    // in front of the head unless the root has gone round the back (the far ear in a profile)
    const front = wrap > 0.3 ? bladeDepth > 0 : rootDepth > -HEAD.rz * 0.42;
    // over the shoulder: seen from behind with the head turned, the ear on the look side tucks behind the head and
    // the trunk shows in front of it
    const rootX = earPt(att)[0];
    const lookSide = turnedAway && Math.sign(rootX - hc[0]) === Math.sign(lk);
    const layer = lookSide ? 0.35 + rootDepth * 0.0005 : front ? 0.6 + rootDepth * 0.001 : -2 + rootDepth * 0.001;
    const fillRole: FillRole = 'body';
    // the ear darkens to the shade colour as it turns round the back of the head (a colour mix, continuous: no pop
    // when its layer flips at -0.42 R)
    const shadeMix = wrap > 0.3 ? (front ? 0 : 1) : smooth((-rootDepth / HEAD.rz - 0.27) / 0.3);
    const nUp = earVec(nFront);
    const nLow = earVec(nB);
    // lower blade first (it folds behind / over depending on the side we see)
    const lowOnTop = fold > 0.5 && nUp[2] > 0; // folded toward its pink face: the folded blade lies on top when we see that face
    const pUp: Part = {id: `ear${A}u`, group: `ear${A}`, shape: polyShape(up.P), layer, fill: fillRole, fillMix: shadeMix, union: true, lines: front};
    const pLow: Part = {id: `ear${A}l`, group: `ear${A}`, shape: polyShape(low.P), layer: layer + (lowOnTop ? 0.0005 : -0.0005), fill: fillRole, fillMix: shadeMix, union: true, lines: front};
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
          const q = earPt(v3.add(mid(u), v3.mul(dir, W * 0.62 * hw(u))));
          P.push([q[0], q[1]]);
        }
        for (let i = NN; i >= 0; i--) {
          const u = 0.12 + (0.8 * i) / NN;
          const q = earPt(v3.add(mid(u), v3.mul(dir, W * 0.12 * hw(u))));
          P.push([q[0], q[1]]);
        }
        parts.push({id: `ear${A}in${lay}`, group: `ear${A}`, shape: polyShape(P), layer: lay + 0.0002, fill: 'inner', union: false, lines: false});
      }
    }
    // the midrib (a leaf's vein): the fold line when folded, a short vein when open
    {
      const M: V2[] = [];
      const u0 = fold > 0.5 ? 0.02 : 0.18;
      const u1 = fold > 0.5 ? 0.97 : 0.7;
      for (let i = 0; i <= 8; i++) {
        const q = earPt(mid(u0 + ((u1 - u0) * i) / 8));
        M.push([q[0], q[1]]);
      }
      marks.push({pts: M, w: fold > 0.5 ? 0.8 : 0.62, layer: layer + 0.001, group: `ear${A}`, kind: 'midrib'});
      // one pair of side veins (the leaf read at close sizes)
      if (o.lod && fold < 0.5) {
        for (const [dir, W] of [[w, EAR.wUp], [wB, EAR.wLow]] as const) {
          const u = 0.42;
          const a = earPt(mid(u));
          const b = earPt(v3.add(mid(u + 0.17), v3.mul(dir, W * 0.55 * hw(u + 0.17))));
          marks.push({pts: [[a[0], a[1]], [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], [b[0], b[1]]], w: 0.4, layer: layer + 0.001, group: `ear${A}`, kind: 'rib'});
        }
      }
    }
    const rootV = earPt(att);
    if (rootV[0] > earRootRightX) {
      earRootRightX = rootV[0];
      earRootRight = [rootV[0], rootV[1]];
    }
  }

  // ---- trunk: down a little, then one curl forward and up
  {
    const raise = (p.trunkRaise + 80 * Math.abs(lk) * backness) * D2R;
    const g: V3 = [0, Math.cos(raise), Math.sin(raise)];
    const f0: V3 = [0, -Math.sin(raise), Math.cos(raise)];
    const T0: V3 = [0, 6, 25.3];
    // turned away from us the trunk is all we see of the face: a longer, looser hook reads at 86 px (a tight curl
    // closes into a ball)
    const away = backness * smooth((Math.abs(lk) - 0.15) / 0.3); // 0..1, continuous
    const curl = clamp(p.trunkCurl * (1 - 0.28 * away), 0, 1.4);
    const len = clamp(p.trunkLen * (1 + 0.25 * away), 0.5, 2);
    const Ls = (10 + 4 * (1 - Math.min(1, curl))) * len;
    const rc = 6.6 * Math.sqrt(len);
    const arc = curl * 250 * D2R;
    const total = Ls + rc * arc;
    const steps = Math.max(8, Math.ceil(total / 1.6));
    const trace = (chiDeg: number) => {
      const chi = chiDeg * D2R;
      const f = v3.norm(v3.add(v3.mul(f0, Math.cos(chi)), v3.mul(v3.cross(g, f0), Math.sin(chi))));
      const C: V2[] = [];
      const R: number[] = [];
      let pos = T0;
      let depthSum = 0;
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
      return {C, R, depthSum};
    };
    // the curl leans to one side; turned away from us it leans OUT toward the look side, so it clears the cheek
    let chi = 38 + p.trunkSide;
    if (away > 0.001) {
      // which way is "out" for this look (fixed by the geometry), then lean the curl there continuously
      const out = (c: V2[]) => (c[c.length - 1][0] - hc[0]) * Math.sign(lk) + (c[Math.round(c.length * 0.6)][0] - hc[0]) * Math.sign(lk);
      const outSign = out(trace(-38 - p.trunkSide).C) > out(trace(chi).C) ? -1 : 1;
      if (outSign < 0) chi = lerp(38 + p.trunkSide, -38 - p.trunkSide, smooth(Math.abs(lk) / 0.4) * clamp(backness * 2));
    }
    // a face turned to us (the watcher, the turn to camera): the curl leans into the picture plane, so it reads in the
    // silhouette instead of pointing at the lens (its plane faces yaw head + chi: chi pulls it toward the profile);
    // full on a 3/4 head, nothing face-on or from behind (no flip anywhere)
    const faceK = Math.max(wy.k, clamp(p.toCam));
    if (faceK > 0.001) {
      const phiH = wrap180(wy.head);
      const ideal = phiH >= 0 ? 38 * clamp((90 - phiH) / 15, -1, 1) : 38 * clamp((-90 - phiH) / 15, -1, 1);
      chi = lerp(chi, ideal + p.trunkSide, faceK * smooth((Math.abs(Math.sin(phiH * D2R)) - 0.15) / 0.35));
    }
    const {C, R, depthSum} = trace(chi);
    const front = depthSum / (steps + 1) > -HEAD.rz * 0.3;
    parts.push({id: 'trunk', group: 'trunk', shape: tubeShape(C, R), layer: front ? 0.7 : turnedAway ? 0.38 : -2.5, fill: 'body', union: true, lines: front || turnedAway});
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
    // a face turned round to us shows ONE eye: the far one stays hidden until it is clear of the contour
    const eyeMin = lerp(3, 8, Math.max(wy.k, clamp(p.toCam)));
    for (const s of [1, -1]) {
      const e = headPt([s * 12.5, -3, 23.6]);
      const rd = e[2] - hc[2];
      if (rd > eyeMin) {
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
    const hairs = o.lod ? [-32, 0, 30] : [-22, 22];
    const lens = o.lod ? [10, 13, 9.5] : [11, 11];
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
      marks.push({pts, w: 0.72, layer: 0.95, group: 'tuft', kind: 'tuft'});
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
    // soles: forward when seated, down-and-out when tucked, back-and-out in a leap (out = toward us side-on)
    const solN = v3.norm(lerp3([s * 0.28, 0.12, 1], [s * 0.55, 0.8, -0.3], [s * 0.65, 0.3, -0.7]));
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
