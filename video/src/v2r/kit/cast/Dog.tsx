// K4 cast: THE DOG (TREATMENT section 3 life; S1 a dog trotting down our steps at 2.80 and one lying on a tread, S2 a
// dog on a lead nosing a leaf, S4 / S6 / S7 dogs with walkers). Drawn NEW for this film: a small warm dog in the
// house grammar (flat fills misregistered 2-5 px, a loose ink contour), 30-90 px, never teal and never a rival to
// Pip (no periwinkle, no scarf, no face: a nose, no eyes). Three coats from the confetti colours.
//
//   <Dog x={520} y={1300} h={52} pose="trot" walk={{rate: 3.4}} coat="gold" />            side trot (lane moves x)
//   <Dog x={520} y={1300} h={52} pose="trot" view="back" walk={{rate: 3.4}} />             trotting away from us
//   <Dog x={690} y={1560} h={46} pose="lie" coat="brown" />                               lying on a tread (breathes,
//                                                                                          tail thumps, lifts its head)
//   <Dog x={430} y={1600} h={44} pose="sniff" lead={{x: 470, y: 1500}} />                 nosing a leaf, on a lead
//   <Dog x={430} y={1600} h={44} pose="sit" coat="rust" />
// Poses: trot | walk (side or back view; legs on the 12 drawings/s clock) · stand · sniff · sit · lie. The tail wags
// on every pose (idle). `lead` draws the lead from the collar to a canvas point (the walker's hand: Person pose
// 'reach' with reach = [dx, dy] puts the hand at (x + dx, y + dy), mirrored by flip).

import React from 'react';
import {useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {rng} from '../../../lib/rng';
import {CM} from '../../palette';
import {BuildProps} from './People';
import {drawn, selfSteps} from './gait';
import {capsule, circlePath, curve, ellipsePath, FigureG, Part, Parts, polyline, Pt, q100, q2} from './parts';
import {tieredAll} from '../tiers';

export type DogPose = 'trot' | 'walk' | 'stand' | 'sniff' | 'sit' | 'lie';
export type DogCoat = 'gold' | 'rust' | 'brown';
export type DogView = 'side' | 'back';

/** The three coats (confetti colours, TREATMENT section 2): body, ears / saddle, a light patch, the collar. */
export const DOG_COATS: Record<DogCoat, {body: string; ear: string; patch: string | null; collar: string; ears: 'flop' | 'prick'}> = {
  gold: {body: CM.leafGold, ear: CM.leafRust, patch: null, collar: CM.brickDeep, ears: 'flop'},
  rust: {body: CM.leafRust, ear: CM.brickDeep, patch: CM.paper, collar: CM.coatMustard, ears: 'flop'},
  brown: {body: CM.hair[1], ear: CM.hair[0], patch: CM.coatOat, collar: CM.brick, ears: 'prick'},
};
export const DOG_SIZE = {min: 30, max: 90} as const;

export type DogProps = BuildProps & {
  /** Feet (canvas px): the paws' line (lying: the belly's ground line). */
  x: number;
  y: number;
  /** Height to the top of the head when standing (30-90 px). */
  h: number;
  pose?: DogPose;
  view?: DogView;
  coat?: DogCoat;
  /** Face right (the drawing faces left). */
  flip?: boolean;
  /** Steps taken (trot / walk legs, 12 drawings/s); or `walk` to self-clock. */
  step?: number;
  walk?: {rate: number; t0?: number; phase?: number};
  /** Tail wag (Hz, sampled at 12 drawings/s). Default by pose; 0 = still. */
  wag?: number;
  /** A lead from the collar to this canvas point (the walker's hand), sagging `sag` px (default 14 % of the span). */
  lead?: {x: number; y: number; sag?: number};
  /** lie: the head resting on the paws (default: up). */
  headDown?: boolean;
  seed?: string;
  ink?: number;
};

type DogGeo = {parts: Part[]; collar: Pt};

const DEG = Math.PI / 180;

/** Pure geometry: a dog of height h in LOCAL px (feet at 0, facing left). */
function dogParts(o: {h: number; pose: DogPose; view: DogView; coat: DogCoat; step: number; tail: number; breath: number; lift: number; twitch: number; headDown: boolean; lod: number}): DogGeo {
  const {h, pose, view, coat} = o;
  const C = DOG_COATS[coat];
  const inkOn = o.lod <= 1;
  const out: Part[] = [];
  const S = (x: number, y: number): Pt => [x * h, y * h];
  const legW = 0.055 * h;
  const ink = (d: string) => (inkOn ? d : undefined);
  const paw = (p: Pt, k: string) => {
    const d = ellipsePath(p[0] - 0.012 * h, p[1] - 0.014 * h, 0.045 * h, 0.022 * h);
    out.push({k, d, fill: C.body, ink: o.lod === 0 ? d : undefined, w: 0.7});
  };
  const flopEar = (cx: number, cy: number, k: string, dx = 0) => {
    const d = curve([S(cx + 0.02 + dx, cy - 0.05), S(cx + 0.09 + dx, cy - 0.02), S(cx + 0.1 + dx, cy + 0.11), S(cx + 0.05 + dx, cy + 0.15), S(cx + 0.01 + dx, cy + 0.06)], true, 0.5);
    out.push({k, d, fill: C.ear, ink: ink(d), w: 0.8});
  };
  const prickEar = (cx: number, cy: number, k: string, dx = 0) => {
    const d = polyline([S(cx - 0.02 + dx, cy - 0.04), S(cx + 0.03 + dx, cy - 0.17), S(cx + 0.08 + dx, cy - 0.03)], true);
    out.push({k, d, fill: C.ear, ink: ink(d), w: 0.8});
  };
  const tailFrom = (base: Pt, len: number, up: number, k: string) => {
    // the tail: a tapered curl from `base`, its angle `up` (rad from horizontal-back) swinging by the wag
    const a = up + o.tail;
    const mid: Pt = [base[0] + Math.cos(a - 0.35) * len * 0.55, base[1] - Math.sin(a - 0.35) * len * 0.55];
    const tip: Pt = [base[0] + Math.cos(a) * len, base[1] - Math.sin(a) * len];
    const d = `M${base[0].toFixed(1)} ${base[1].toFixed(1)}Q${mid[0].toFixed(1)} ${mid[1].toFixed(1)} ${tip[0].toFixed(1)} ${tip[1].toFixed(1)}`;
    const w = Math.max(1.2, 0.05 * h);
    const fillD = capsule(base, mid, w * 0.9, w * 0.7) + capsule(mid, tip, w * 0.7, w * 0.35);
    out.push({k, d: fillD, fill: C.body, ink: inkOn ? d : undefined, w: 1.0});
  };

  if (view === 'back') {
    // trotting away: the hind legs alternate, the rump, the back receding, the head and ears above, the tail up
    const ph = Math.PI * o.step;
    const bob = pose === 'trot' || pose === 'walk' ? -Math.abs(Math.cos(ph)) * 0.02 * h : 0;
    const liftL = pose === 'trot' || pose === 'walk' ? Math.max(0, Math.cos(ph)) * 0.07 * h : 0;
    const liftR = pose === 'trot' || pose === 'walk' ? Math.max(0, -Math.cos(ph)) * 0.07 * h : 0;
    // the head (farthest, small above the receding back) and its ears
    const hc = S(-0.02, -0.8);
    if (C.ears === 'prick') {
      prickEar(-0.13, -0.84 + bob / h, 'earL');
      prickEar(0.03, -0.84 + bob / h, 'earR');
    }
    const hd = circlePath(hc[0], hc[1] + bob, 0.105 * h);
    out.push({k: 'head', d: hd, fill: C.body, ink: ink(hd)});
    if (C.ears === 'flop') {
      flopEar(-0.2, -0.84 + bob / h, 'earL');
      flopEar(0.07, -0.84 + bob / h, 'earR');
    }
    const shoulders = ellipsePath(0, -0.64 * h + bob, 0.16 * h, 0.08 * h);
    out.push({k: 'back', d: shoulders, fill: C.body, ink: ink(shoulders)});
    const collarD = ellipsePath(-0.01 * h, -0.71 * h + bob, 0.085 * h, 0.022 * h);
    if (o.lod <= 1) out.push({k: 'collar', d: collarD, fill: C.collar, ink: ink(collarD), w: 0.7});
    for (const [s, lift] of [
      [-1, liftL],
      [1, liftR],
    ] as [number, number][]) {
      const top: Pt = [s * 0.11 * h, -0.4 * h + bob];
      const foot: Pt = [s * 0.12 * h, -lift];
      const d = capsule(top, foot, legW * 1.1, legW);
      out.push({k: `leg${s}`, d, fill: C.body, ink: ink(d)});
      paw(foot, `paw${s}`);
    }
    const rump = curve([S(-0.23, -0.36), S(-0.26, -0.5), S(-0.17, -0.63), S(0, -0.66), S(0.17, -0.63), S(0.26, -0.5), S(0.23, -0.36), S(0, -0.31)].map(([x, y]) => [x, y + bob] as Pt), true, 0.5);
    out.push({k: 'rump', d: rump, fill: C.body, ink: ink(rump)});
    if (C.patch && o.lod <= 1) out.push({k: 'seat', d: ellipsePath(0, -0.4 * h + bob, 0.1 * h, 0.05 * h), fill: C.ear, exact: true});
    // the tail up from the top of the rump, swinging side to side (a wider arc than in profile)
    tailFrom([0.02 * h, -0.6 * h + bob], 0.28 * h, Math.PI / 2 - 0.45 + o.tail * 1.6, 'tail');
    return {parts: out, collar: [0, -0.74 * h + bob]};
  }

  if (pose === 'lie') {
    // lying on the ground, facing left: the body low, front paws forward, the haunch curled, tail on the ground
    const br = o.breath * 0.012 * h;
    tailFrom(S(0.44, -0.07), 0.3 * h, -0.1 + Math.max(0, o.tail) * 0.6, 'tail');
    const body = curve([S(-0.36, 0), S(-0.43, -0.16), [-0.3 * h, -0.31 * h - br], [0.02 * h, -0.29 * h - br], [0.3 * h, -0.31 * h - br], S(0.48, -0.17), S(0.44, 0), S(0, 0.01)], true, 0.5);
    out.push({k: 'body', d: body, fill: C.body, ink: ink(body)});
    const haunch = ellipsePath(0.26 * h, -0.13 * h - br * 0.5, 0.16 * h, 0.11 * h);
    out.push({k: 'haunch', d: haunch, fill: C.body, ink: o.lod === 0 ? haunch : undefined, w: 0.8});
    for (const [k, dy] of [
      ['legF', -0.02],
      ['legN', 0.015],
    ] as [string, number][]) {
      const a: Pt = S(-0.3, -0.08 + dy);
      const b: Pt = S(-0.66, -0.03 + dy);
      const d = capsule(a, b, legW, legW * 0.9);
      out.push({k, d, fill: C.body, ink: ink(d)});
    }
    const lift = o.lift; // 0..1 the head lifts (idle)
    const hc: Pt = o.headDown ? S(-0.6, -0.17 - 0.12 * lift) : S(-0.5, -0.52 - 0.04 * lift);
    if (!o.headDown) {
      const nd = capsule(S(-0.32, -0.24), hc, 0.085 * h, 0.075 * h);
      out.push({k: 'neck', d: nd, fill: C.body, ink: o.lod === 0 ? nd : undefined, w: 0.8});
    }
    headSide(hc, 0, 'head');
    collarAt(S(-0.36, -0.3));
    return {parts: out, collar: S(-0.36, -0.3)};
  }

  if (pose === 'sit') {
    tailFrom(S(0.26, -0.05), 0.3 * h, -0.05 + Math.max(0, o.tail) * 0.5, 'tail');
    const hc = S(-0.36, -0.88);
    const legF = capsule(S(-0.2, -0.46), S(-0.24, 0), legW, legW * 0.9);
    out.push({k: 'legFar', d: legF, fill: C.body, ink: ink(legF)});
    const body = curve([S(-0.3, -0.42), S(-0.33, -0.62), S(-0.22, -0.74), S(0.02, -0.52), S(0.22, -0.26), S(0.26, -0.06), S(0.08, 0), S(-0.18, -0.1)], true, 0.5);
    out.push({k: 'body', d: body, fill: C.body, ink: ink(body)});
    const haunch = ellipsePath(0.1 * h, -0.14 * h, 0.17 * h, 0.13 * h);
    out.push({k: 'haunch', d: haunch, fill: C.body, ink: o.lod === 0 ? haunch : undefined, w: 0.8});
    const legN = capsule(S(-0.26, -0.44), S(-0.29, 0), legW, legW * 0.9);
    out.push({k: 'legNear', d: legN, fill: C.body, ink: ink(legN)});
    paw(S(-0.29, 0), 'pawN');
    if (C.patch && o.lod <= 1) out.push({k: 'chest', d: curve([S(-0.31, -0.46), S(-0.33, -0.62), S(-0.26, -0.66), S(-0.24, -0.5)], true, 0.5), fill: C.patch, exact: true});
    const nd = capsule(S(-0.27, -0.66), hc, 0.085 * h, 0.075 * h);
    out.push({k: 'neck', d: nd, fill: C.body, ink: o.lod === 0 ? nd : undefined, w: 0.8});
    headSide(hc, 0, 'head');
    collarAt(S(-0.29, -0.7));
    return {parts: out, collar: S(-0.29, -0.7)};
  }

  // ---- standing poses, side view (trot, walk, stand, sniff)
  const moving = pose === 'trot' || pose === 'walk';
  const ph = Math.PI * o.step;
  const A = (pose === 'trot' ? 26 : 18) * DEG;
  const bob = moving ? -Math.abs(Math.cos(ph)) * (pose === 'trot' ? 0.03 : 0.015) * h : 0;
  const legAt = (hipX: number, pair: 1 | -1, near: boolean) => {
    const th = moving ? A * Math.sin(ph) * pair : 0;
    const swing = moving ? Math.max(0, Math.cos(ph) * pair) : 0;
    const top: Pt = [hipX * h, -0.42 * h + bob];
    const L = 0.42 * h;
    const foot: Pt = [top[0] - Math.sin(th) * L, top[1] + Math.cos(th) * L - swing * 0.06 * h];
    // a back leg bends at the hock (backward, +x), a front leg stays straight with a little wrist forward
    const hock = hipX > 0 ? 0.06 * h : -0.012 * h;
    const knee: Pt = [(top[0] + foot[0]) / 2 + hock + (pair > 0 ? 1 : -1) * swing * 0.03 * h, (top[1] + foot[1]) / 2 + (hipX > 0 ? 0.03 * h : 0)];
    const d = capsule(top, knee, legW * 1.05, legW) + capsule(knee, foot, legW, legW * 0.85);
    out.push({k: `leg${hipX}${near ? 'n' : 'f'}`, d, fill: near ? C.body : C.ear, ink: ink(d)});
    paw(foot, `paw${hipX}${near ? 'n' : 'f'}`);
  };
  // the far legs first (front-far moves with back-near: a trot's diagonal pairs)
  legAt(-0.27, -1, false);
  legAt(0.31, 1, false);
  // the tail behind the rump
  const happy = pose === 'sniff' ? 1.15 : moving ? 0.75 : 0.95;
  tailFrom([0.43 * h, -0.64 * h + bob], 0.3 * h, happy, 'tail');
  const body = curve(
    [S(-0.38, -0.4), S(-0.42, -0.56), S(-0.3, -0.68), S(0.08, -0.66), S(0.36, -0.69), S(0.47, -0.58), S(0.45, -0.46), S(0.32, -0.39), S(0.0, -0.37)].map(([x, y]) => [x, y + bob] as Pt),
    true,
    0.5,
  );
  out.push({k: 'body', d: body, fill: C.body, ink: ink(body)});
  if (C.patch && o.lod <= 1) {
    const chest = curve([S(-0.38, -0.42), S(-0.42, -0.55), S(-0.36, -0.62), S(-0.3, -0.48)].map(([x, y]) => [x, y + bob] as Pt), true, 0.5);
    out.push({k: 'chest', d: chest, fill: C.patch, exact: true});
  }
  legAt(-0.32, 1, true);
  legAt(0.35, -1, true);
  // neck and head: up (trot / walk / stand) or down to the ground (sniff)
  const sniff = pose === 'sniff';
  const hc: Pt = sniff ? [-0.64 * h, -0.24 * h + o.twitch * 0.02 * h] : [-0.53 * h, -0.84 * h + bob];
  const neckFrom: Pt = [-0.36 * h, -0.6 * h + bob];
  const nd = capsule(neckFrom, hc, 0.09 * h, 0.08 * h);
  out.push({k: 'neck', d: nd, fill: C.body, ink: o.lod === 0 ? nd : undefined, w: 0.8});
  headSide(hc, sniff ? -55 : 0, 'head');
  const col: Pt = [neckFrom[0] + (hc[0] - neckFrom[0]) * 0.3, neckFrom[1] + (hc[1] - neckFrom[1]) * 0.3];
  collarAt(col);
  return {parts: out, collar: col};

  /** A side head at hc, the muzzle pointing left and rotated by `rot` deg (down = negative), an ear, the nose. */
  function headSide(hc0: Pt, rot: number, k: string) {
    const a = rot * DEG;
    const R = (dx: number, dy: number): Pt => [hc0[0] + (dx * Math.cos(a) - dy * Math.sin(a)) * h, hc0[1] + (dx * Math.sin(a) + dy * Math.cos(a)) * h];
    // muzzle: from the head centre to the left
    const mz = capsule(R(-0.06, 0.03), R(-0.24, 0.05), 0.065 * h, 0.05 * h);
    out.push({k: `${k}Mz`, d: mz, fill: C.patch && coat === 'brown' ? C.patch : C.body, ink: ink(mz)});
    const hd = circlePath(hc0[0], hc0[1], 0.14 * h);
    out.push({k, d: hd, fill: C.body, ink: ink(hd)});
    const ns = R(-0.27, 0.035);
    out.push({k: `${k}Nose`, d: ellipsePath(ns[0], ns[1], 0.028 * h, 0.022 * h), fill: CM.anchor, exact: true});
    if (C.ears === 'flop') {
      const e = curve([R(0.0, -0.12), R(0.09, -0.08), R(0.11, 0.05), R(0.06, 0.1), R(0.02, 0.0)], true, 0.5);
      out.push({k: `${k}Ear`, d: e, fill: C.ear, ink: ink(e), w: 0.8});
    } else {
      const e = polyline([R(-0.02, -0.11), R(0.04, -0.27), R(0.1, -0.09)], true);
      out.push({k: `${k}Ear`, d: e, fill: C.ear, ink: ink(e), w: 0.8});
    }
  }
  function collarAt(c: Pt) {
    if (o.lod > 1) return;
    const d = ellipsePath(c[0], c[1], 0.022 * h, 0.08 * h);
    out.push({k: 'collar', d, fill: C.collar, ink: o.lod === 0 ? d : undefined, w: 0.5});
  }
}

const WAG_DEFAULT: Record<DogPose, number> = {trot: 2.4, walk: 1.8, stand: 2.2, sniff: 3.0, sit: 1.6, lie: 1.1};

/** A dog (30-90 px): trot / walk (side or back), stand, sniff, sit, lie; a tail-wag idle; an optional lead. */
const DogBody: React.FC<DogProps> = ({x, y, h, pose = 'stand', view = 'side', coat = 'gold', flip, step, walk, wag, lead, headDown, seed = 'dog', ink, at, fillLag}) => {
  const t = useTime();
  const tq = drawn(t, 12);
  const H = q2(Math.max(DOG_SIZE.min * 0.8, h));
  const r = rng(`dog/${seed}`);
  const ph0 = r.range(0, 6.28);
  const moving = pose === 'trot' || pose === 'walk';
  let st = step ?? 0;
  if (walk) st = selfSteps(t, walk.rate, walk.t0 ?? 0, walk.phase ?? 0);
  const wr = wag ?? WAG_DEFAULT[pose];
  // the tail swings on the 12 drawings/s clock (a lying tail thumps: up only)
  const tail = wr > 0 ? Math.sin(tq * wr * Math.PI * 2 + ph0) * (pose === 'lie' || pose === 'sit' ? 0.22 : 0.3) : 0;
  const breath = pose === 'lie' ? Math.sin((tq / 1.7) * Math.PI * 2 + ph0) : 0;
  // idle: a lying dog lifts its head now and then; a sniffing dog's nose twitches in bursts
  const cyc = (tq + ph0) % 3.6;
  const lift = pose === 'lie' && cyc > 2.6 ? Math.sin(((cyc - 2.6) / 1.0) * Math.PI) : 0;
  const tw = (tq * 3 + ph0) % 2;
  const twitch = pose === 'sniff' && tw < 0.75 ? Math.sin(tq * 12 * Math.PI) : 0;
  const lod = H >= 46 ? 0 : 1;
  const key = JSON.stringify(['dog', H, pose, view, coat, moving ? q100(st) : 0, q100(tail), q100(breath), q100(lift), q100(twitch), !!headDown, lod]);
  const geo = cachedGeo(key, () => dogParts({h: H, pose, view, coat, step: moving ? st : 0, tail, breath, lift, twitch, headDown: !!headDown, lod}));
  const inkPx = ink ?? (H >= 60 ? 2.2 : H >= 34 ? 1.6 : 1.2);
  const sgn = flip ? -1 : 1;
  const cx = x + sgn * geo.collar[0];
  const cy = y + geo.collar[1];
  let leadEl: React.ReactNode = null;
  if (lead) {
    const span = Math.hypot(lead.x - cx, lead.y - cy);
    const sag = lead.sag ?? span * 0.14;
    const mx = (cx + lead.x) / 2;
    const my = Math.max(cy, lead.y) + sag;
    leadEl = <Ink d={`M${cx.toFixed(1)} ${cy.toFixed(1)}Q${mx.toFixed(1)} ${my.toFixed(1)} ${lead.x.toFixed(1)} ${lead.y.toFixed(1)}`} width={Math.max(1.2, inkPx * 0.8)} color={CM.anchor} taper={false} at={at} seed={`${seed}/lead`} />;
  }
  return (
    <>
      <FigureG x={x} y={y} flip={flip} seed={seed}>
        <Parts parts={geo.parts} at={at} fillLag={fillLag} inkPx={inkPx} offset={[Math.max(1, H * 0.035), Math.max(0.7, H * 0.024)]} seed={seed} />
      </FigureG>
      {leadEl}
    </>
  );
};
export const Dog = tieredAll('support', {lines: true}, DogBody);

const DOG_GEO = new Map<string, DogGeo>();
function cachedGeo(key: string, build: () => DogGeo): DogGeo {
  let v = DOG_GEO.get(key);
  if (!v) {
    v = build();
    if (DOG_GEO.size > 3000) DOG_GEO.clear();
    DOG_GEO.set(key, v);
  }
  return v;
}

/** A walker's hand for a lead: Person pose 'reach' with `reach` = [dx, dy] relative to the feet puts the hand here. */
export const handAt = (px: number, py: number, reach: [number, number], flip?: boolean) => ({x: px + (flip ? -reach[0] : reach[0]), y: py + reach[1]});

