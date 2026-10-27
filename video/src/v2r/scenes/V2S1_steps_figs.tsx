// V2S1 helper (lane L1, our bank): the figures of the seated public, built on the K4 cast geometry (kit/cast/body.ts
// seatParts / standParts, kit/cast/parts.tsx Parts / FigureG) with the house rules enforced HERE:
//   * NO HANDS (STYLE section 4) except a hand holding a raised phone: the kit's seated cup and notebook arms end in
//     a skin hand (kit defect, listed in the report), so `Sit` drops those parts and every sleeve drawn here ends in
//     a plain cuff. A cup rides on the sleeve.
//   * small and simple like reference 1: round heads that are the hair, tombstone torsos, one accessory, backs or a
//     rear 3/4 turn (a cheek crescent at most), never a face.
//   * ink CM.ink only, by size; fills misregistered per figure (misregFor); seeded, deterministic.
// Pieces (local px: the SEAT line / the feet at (0, 0), y up negative, x right):
//   Sit     a seated back: turn, lean, a cup lifted on the sleeve, a cup passed sideways (reach), both arms up in a
//           stretch, a guitar (neck past the left shoulder, a strumming sleeve), a rear 3/4 turn with the near knee.
//   Rise    a standing back that grows out of its seat (k 0 seated .. 1 standing, the legs appear under the coat as
//           it rises: clipped at the seat line), stretches, walks (rear 3/4 or back, 12 drawings/s).
//   Dog     a small dog in profile: lie, sit, stand, trot (12 drawings/s legs), sniff, a wagging tail.
//   Pigeon  stand, peck, walk, fly (wings at 12 drawings/s), on the steps.
//   Shade   a short flat cast shadow on the tread (toward the lens: the low sun is beyond the canal, in the west).
import React, {useId} from 'react';
import {useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {CM} from '../palette';
import {seatParts, standParts, type Model, type SeatOpts} from '../kit/cast/body';
import {traitsFor, type TraitOverrides} from '../kit/cast/traits';
import {drawn, gaitOf, STILL} from '../kit/cast/gait';
import {cached, capsule, circlePath, curve, ellipsePath, FigureG, inkFor, lodFor, misregFor, Parts, polyline, q100, q2, type Lod, type Part, type Pt} from '../kit/cast/parts';
import {XG, mat} from '../../lib/xf';

const f1 = (n: number) => (Math.round(n * 10) / 10).toString();
const P = (x: number, y: number) => `${f1(x)} ${f1(y)}`;

/** Parts of the kit's figures that draw a skin hand (never on our steps, except the raised phone's). */
const HAND_KEYS = new Set(['cupArmH', 'nbArmH', 'reachArmH', 'armLH', 'armNearH', 'armFarH', 'plantHand']);
const noHands = (ps: Part[]) => ps.filter((q) => !HAND_KEYS.has(q.k));
/** The first part of a head (ears and a high bun sit behind it): extra sleeves go in just before. */
const HEAD_KEYS = new Set(['earR', 'earL', 'bunHi', 'head']);
const headIndex = (ps: Part[]) => {
  const i = ps.findIndex((q) => HEAD_KEYS.has(q.k));
  return i < 0 ? ps.length : i;
};

/** A sleeve (coat colour) from the shoulder through an elbow to a plain cuff: no hand. */
function sleeve(k: string, coat: string, from: Pt, elbow: Pt, to: Pt, hw: number, inkOn: boolean): Part[] {
  const d1 = capsule(from, elbow, hw, hw * 0.94);
  const d2 = capsule(elbow, to, hw * 0.94, hw * 0.86);
  return [
    {k: `${k}U`, d: d1, fill: coat, ink: inkOn ? d1 : undefined},
    {k: `${k}F`, d: d2, fill: coat, ink: inkOn ? d2 : undefined},
  ];
}

/** A takeaway cup at (cx, cy) = its base centre, height ch (paper cup, brick sleeve, oat lid). */
export function cupParts(k: string, cx: number, cy: number, ch: number, inkOn: boolean, detail = true): Part[] {
  const cw = ch * 0.64;
  const cd = polyline([[cx - cw / 2, cy - ch], [cx + cw / 2, cy - ch], [cx + cw * 0.38, cy], [cx - cw * 0.38, cy]], true);
  const out: Part[] = [{k: `${k}c`, d: cd, fill: CM.paper, ink: inkOn ? cd : undefined, w: 0.7}];
  if (detail) {
    out.push({k: `${k}s`, d: polyline([[cx - cw * 0.47, cy - ch * 0.62], [cx + cw * 0.47, cy - ch * 0.62], [cx + cw * 0.43, cy - ch * 0.3], [cx - cw * 0.43, cy - ch * 0.3]], true), fill: CM.brick, exact: true});
    const lid = polyline([[cx - cw * 0.58, cy - ch - ch * 0.17], [cx + cw * 0.58, cy - ch - ch * 0.17], [cx + cw * 0.55, cy - ch + ch * 0.04], [cx - cw * 0.55, cy - ch + ch * 0.04]], true);
    out.push({k: `${k}l`, d: lid, fill: CM.coatOat, ink: inkOn ? polyline([[cx - cw * 0.58, cy - ch - ch * 0.17], [cx + cw * 0.58, cy - ch - ch * 0.17]]) : undefined, w: 0.6, exact: true});
  }
  return out;
}

// ---------------------------------------------------------------- Sit

export type SitArms = {
  /** A cup passed sideways: the sleeve reaches toward `to` (local px) by k 0..1, the cup on its cuff. */
  reach?: {to: Pt; k: number; cup?: boolean; side?: 1 | -1};
  /** 0..1: both arms up over the head (a stretch). */
  stretch?: number;
  /** Guitar on the lap: the neck past the left shoulder; strum 0..1 = the right sleeve's stroke. */
  guitar?: {strum: number};
};

export type SitProps = {
  x: number;
  y: number;
  h: number;
  seed: string;
  traits?: TraitOverrides;
  model?: Partial<Model>;
  turn?: number;
  /** 0 (lap) .. 1 (mouth): the cup rises on the sleeve (no hand). */
  cup?: number;
  read?: boolean;
  /** A raised phone (the one hand allowed). */
  phone?: boolean;
  side?: 1 | -1;
  ink?: number;
  lod?: Lod;
  /** Lean (deg) about the seat: toward a neighbour. */
  lean?: number;
  /** Rear 3/4: turned toward screen left (-1) or right (+1): a narrower back, the cheek crescent, the near knee. */
  quarter?: -1 | 1;
  arms?: SitArms;
  /** A cast shadow on the tread (default true). */
  shadow?: boolean;
  /** Extra local offset of the whole figure (a shuffle's hop). */
  dy?: number;
};

/** Seated metrics of the kit's seatParts (so extra sleeves attach where its shoulders are). */
export function seatMetrics(h: number, broad: number) {
  const H = h / 0.56;
  const r = H * 0.112;
  return {H, r, headCy: -h + r, shoulderY: -h + 2 * r + H * 0.03, W: H * 0.35 * broad};
}

/** The effective seated height the kit draws for a requested h (its per-person height factor). */
export const sitH = (h: number, tall: number) => q2(h * (0.96 + (tall - 0.93) * 0.6));

export const Sit: React.FC<SitProps> = (p) => {
  const tr = traitsFor(p.seed, p.traits);
  const m: Model = {...tr, ...(p.model ?? {})};
  const h = sitH(p.h, tr.tall);
  const M = seatMetrics(h, m.broad);
  const lod: Lod = p.lod ?? lodFor(M.H);
  const inkOn = lod <= 1;
  const q = p.quarter ?? 0;
  const turn = p.turn !== undefined ? q100(p.turn) : q ? q * 0.85 : undefined;
  const o: SeatOpts = {h, lod, seed: p.seed, turn, cup: p.cup === undefined ? undefined : q100(p.cup), read: p.read, phone: p.phone, side: p.side};
  const arms = p.arms;
  const key = JSON.stringify(['v2s1sit', p.seed, p.traits ?? 0, p.model ?? 0, o, q, arms ? [arms.reach ? [q100(arms.reach.k), arms.reach.to, arms.reach.cup, arms.reach.side] : 0, q100(arms.stretch ?? 0), arms.guitar ? q100(arms.guitar.strum) : -1] : 0]);
  const parts = cached(key, () => {
    const base = noHands(seatParts(m, o));
    // behind: things in front of the body (the guitar, the fretting sleeve, a rear 3/4 knee) show only past its edge
    const behind: Part[] = [];
    // over the coat, under the head: sleeves out at the side or up (a reach, a stretch)
    const extra: Part[] = [];
    const coat = m.coat;
    const hw = M.H * 0.034;
    if (arms?.reach) {
      const s = arms.reach.side ?? (arms.reach.to[0] >= 0 ? 1 : -1);
      const k = arms.reach.k;
      const sh: Pt = [s * M.W * 0.36, M.shoulderY + M.H * 0.06];
      const rest: Pt = [s * M.W * 0.5, -M.H * 0.06];
      const to: Pt = [rest[0] + (arms.reach.to[0] - rest[0]) * k, rest[1] + (arms.reach.to[1] - rest[1]) * k];
      const el: Pt = [(sh[0] + to[0]) / 2 + s * M.H * 0.03, Math.max(sh[1], to[1]) + M.H * (0.06 - 0.03 * k)];
      extra.push(...sleeve('reach', coat, sh, el, to, hw, inkOn));
      if (arms.reach.cup !== false) extra.push(...cupParts('rc', to[0] + s * M.H * 0.012, to[1] - M.H * 0.004, M.H * 0.07, inkOn, lod === 0));
    }
    if (arms?.stretch !== undefined && arms.stretch > 0) {
      const k = arms.stretch;
      for (const s of [-1, 1] as const) {
        const sh: Pt = [s * M.W * 0.38, M.shoulderY + M.H * 0.05];
        const down: Pt = [s * M.W * 0.52, -M.H * 0.06];
        const up: Pt = [s * M.r * 0.55, M.headCy - M.r - M.H * 0.16];
        const to: Pt = [down[0] + (up[0] - down[0]) * k, down[1] + (up[1] - down[1]) * k];
        const el: Pt = [s * (M.W * 0.5 + M.H * 0.05 * Math.sin(Math.PI * k)), (sh[1] + to[1]) / 2 + M.H * 0.02];
        extra.push(...sleeve(`st${s}`, coat, sh, el, to, hw, inkOn));
      }
    }
    if (arms?.guitar) {
      // the neck runs out past the left shoulder, rising; the headstock beyond; the body hides in the lap. The right
      // sleeve strums (its cuff over the hidden sound hole: a few px up and down).
      const nk0: Pt = [-M.W * 0.2, M.shoulderY + M.H * 0.2];
      const nk1: Pt = [-M.W * 0.2 - M.H * 0.36, M.shoulderY + M.H * 0.02];
      const nw = M.H * 0.022;
      const dx = nk1[0] - nk0[0];
      const dy = nk1[1] - nk0[1];
      const L = Math.hypot(dx, dy);
      const nx = (-dy / L) * nw;
      const ny = (dx / L) * nw;
      const neck = polyline([[nk0[0] + nx, nk0[1] + ny], [nk1[0] + nx, nk1[1] + ny], [nk1[0] - nx, nk1[1] - ny], [nk0[0] - nx, nk0[1] - ny]], true);
      const hs0: Pt = nk1;
      const hs1: Pt = [nk1[0] + (dx / L) * M.H * 0.075, nk1[1] + (dy / L) * M.H * 0.075];
      const head = polyline([[hs0[0] + nx * 1.5, hs0[1] + ny * 1.5], [hs1[0] + nx * 1.7, hs1[1] + ny * 1.7], [hs1[0] - nx * 1.7, hs1[1] - ny * 1.7], [hs0[0] - nx * 1.5, hs0[1] - ny * 1.5]], true);
      // the fretting sleeve reaches out along the neck (only its upper arm shows past the left shoulder)
      behind.push(...sleeve('fret', coat, [-M.W * 0.36, M.shoulderY + M.H * 0.06], [-M.W * 0.62, M.shoulderY + M.H * 0.16], [-M.W * 0.2 - M.H * 0.2, M.shoulderY + M.H * 0.11], hw, inkOn));
      behind.push({k: 'gNeck', d: neck, fill: CM.line, ink: inkOn ? neck : undefined, w: 0.75});
      behind.push({k: 'gHead', d: head, fill: CM.anchor, ink: inkOn ? head : undefined, w: 0.75});
      // the lower bout peeking out at the right hip
      const bout = curve([[M.W * 0.42, -M.H * 0.2], [M.W * 0.62, -M.H * 0.16], [M.W * 0.66, -M.H * 0.06], [M.W * 0.5, -M.H * 0.01], [M.W * 0.4, -M.H * 0.04]], true, 0.5);
      behind.push({k: 'gBout', d: bout, fill: CM.leafGold, ink: inkOn ? bout : undefined, w: 0.75});
      // the strumming sleeve: its elbow out at the right side, the cuff stroking over the hidden sound hole
      const sh: Pt = [M.W * 0.36, M.shoulderY + M.H * 0.06];
      const st = arms.guitar.strum;
      const to: Pt = [M.W * 0.3, -M.H * (0.1 + 0.06 * st)];
      behind.push(...sleeve('strum', coat, sh, [M.W * 0.62, M.shoulderY + M.H * (0.17 + 0.02 * st)], to, hw, inkOn));
    }
    if (q) {
      // rear 3/4: the near knee shows past the hip on the turned side (trousers)
      const kx = q * M.W * 0.5;
      const knee = curve([[q * M.W * 0.2, -M.H * 0.02], [kx + q * M.H * 0.07, -M.H * 0.06], [kx + q * M.H * 0.11, -M.H * 0.1], [kx + q * M.H * 0.05, -M.H * 0.13], [q * M.W * 0.26, -M.H * 0.1]], true, 0.5);
      behind.push({k: 'knee', d: knee, fill: m.trousers, ink: inkOn ? knee : undefined, w: 0.85});
    }
    const i = headIndex(base);
    return [...behind, ...base.slice(0, i), ...extra, ...base.slice(i)];
  });
  const inkPx = p.ink ?? (lod >= 2 ? 0 : inkFor(M.H));
  const off = lod >= 2 ? (false as const) : misregFor(M.H, p.seed);
  const q0 = parts.findIndex((x) => HEAD_KEYS.has(x.k));
  const hi = q0 < 0 ? parts.length : q0;
  // a rear 3/4 narrows the back about the spine, never the head (it stays round)
  const body = q ? (
    <>
      <XG m={mat.scale(0.84, 1)}>
        <Parts parts={parts.slice(0, hi)} inkPx={inkPx} offset={off} seed={p.seed} />
      </XG>
      <Parts parts={parts.slice(hi)} inkPx={inkPx} offset={off} seed={`${p.seed}/h`} />
    </>
  ) : (
    <Parts parts={parts} inkPx={inkPx} offset={off} seed={p.seed} />
  );
  const lean = p.lean ?? 0;
  return (
    <>
      {p.shadow !== false ? <Shade x={p.x + M.W * 0.12} y={p.y} w={M.W * 0.98} len={Math.max(6, M.H * 0.1)} seed={`${p.seed}/sh`} /> : null}
      <FigureG x={p.x} y={p.y + (p.dy ?? 0)} seed={p.seed}>
        {lean ? <XG m={mat.rotate(lean)}>{body}</XG> : body}
      </FigureG>
    </>
  );
};

// ---------------------------------------------------------------- Rise (stand up / sit down / stand / walk)

export type RiseProps = {
  /** The feet = the seat line on the tread (local 0,0). */
  x: number;
  y: number;
  /** The SEATED height this figure has when k = 0 (its standing height is h / 0.56, matching Sit). */
  h: number;
  seed: string;
  traits?: TraitOverrides;
  /** 0 seated .. 1 standing. */
  k: number;
  /** 0..1 arms up (a stretch). */
  stretch?: number;
  /** Walking: the step count (12 drawings/s), the view, facing right. */
  walk?: {step: number; view?: 'back' | 'rear34'; right?: boolean; stride?: number};
  /** Standing view when not walking (default back) and facing right. */
  view?: 'back' | 'rear34';
  right?: boolean;
  turn?: number;
  ink?: number;
  shadow?: boolean;
};

export const Rise: React.FC<RiseProps> = (p) => {
  const uid = 'rz' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const tr = traitsFor(p.seed, p.traits);
  const m: Model = {...tr};
  const h = sitH(p.h, tr.tall);
  const H = q2(h / 0.56);
  const lod: Lod = lodFor(H);
  const inkOn = lod <= 1;
  const k = Math.max(0, Math.min(1, p.k));
  const walking = !!p.walk;
  const view = p.walk?.view ?? p.view ?? 'back';
  const st = walking ? q100(p.walk!.step) : 0;
  const stretch = q100(p.stretch ?? 0);
  const key = JSON.stringify(['v2s1rise', p.seed, p.traits ?? 0, H, view, walking, st, stretch, q100(p.turn ?? 0), p.walk?.stride ?? 1]);
  const parts = cached(key, () => {
    const base = noHands(standParts(m, {view, pose: walking ? 'walk' : 'stand', H, gait: walking ? gaitOf(st) : STILL, stride: p.walk?.stride, turn: p.turn, lod, seed: p.seed, moving: walking}));
    if (!stretch) return base;
    const r = H * 0.112;
    const shoulderY = -H + 2 * r + H * 0.03;
    const headCy = -H + r;
    const W = H * 0.33 * m.broad;
    const extra: Part[] = [];
    for (const s of [-1, 1] as const) {
      const sh: Pt = [s * W * 0.38, shoulderY + H * 0.05];
      const down: Pt = [s * W * 0.55, -H * 0.42];
      const up: Pt = [s * r * 0.5, headCy - r - H * 0.17];
      const to: Pt = [down[0] + (up[0] - down[0]) * stretch, down[1] + (up[1] - down[1]) * stretch];
      const el: Pt = [s * (W * 0.55 + H * 0.06 * Math.sin(Math.PI * stretch)), (sh[1] + to[1]) / 2 + H * 0.02];
      extra.push(...sleeve(`st${s}`, m.coat, sh, el, to, H * 0.032, inkOn));
    }
    const i = headIndex(base);
    return [...base.slice(0, i), ...extra, ...base.slice(i)];
  });
  const inkPx = p.ink ?? (lod >= 2 ? 0 : inkFor(H));
  const drop = 0.44 * H * (1 - k);
  const fig = (
    <XG m={mat.translate(0, drop)}>
      <Parts parts={parts} inkPx={inkPx} offset={lod >= 2 ? false : misregFor(H, p.seed)} seed={p.seed} />
    </XG>
  );
  const W = H * 0.33 * m.broad;
  return (
    <>
      {p.shadow !== false ? <Shade x={p.x + W * 0.12} y={p.y} w={W * (walking ? 0.8 : 0.95)} len={Math.max(6, H * (0.1 + 0.06 * k))} seed={`${p.seed}/sh`} /> : null}
      <FigureG x={p.x} y={p.y} flip={p.walk?.right ?? p.right} seed={p.seed}>
        {k < 1 ? (
          <>
            <defs>
              <clipPath id={uid} clipPathUnits="userSpaceOnUse">
                <rect x={-H} y={-H * 2} width={H * 2} height={H * 2} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${uid})`}>{fig}</g>
          </>
        ) : (
          fig
        )}
      </FigureG>
    </>
  );
};

// ---------------------------------------------------------------- shadows

/** A short flat cast shadow on the tread from a base at (x, y) of width w: toward the lens and a little right (the
 *  sun is low in the west beyond the canal). Colour, never grey; no ink. */
export const Shade: React.FC<{x: number; y: number; w: number; len: number; seed: string}> = ({x, y, w, len, seed}) => {
  const hw = w / 2;
  const sk = len * 0.55;
  const d = curve(
    [
      [x - hw * 0.92, y - len * 0.08],
      [x + hw * 0.95, y - len * 0.1],
      [x + hw * 0.9 + sk, y + len * 0.55],
      [x + sk * 0.6, y + len],
      [x - hw * 0.55 + sk * 0.5, y + len * 0.8],
    ],
    true,
    0.45,
  );
  return <Fill d={d} color={CM.stoneShade} seed={seed} offset={false} />;
};

// ---------------------------------------------------------------- Dog

export type DogPose = 'lie' | 'sit' | 'stand' | 'trot' | 'sniff';
export type DogProps = {
  x: number;
  y: number;
  /** Body length (px). */
  L: number;
  seed: string;
  pose: DogPose;
  /** Trot phase (steps, drawn at 12/s by the caller). */
  step?: number;
  /** Tail wag 0..1 phase. */
  wag?: number;
  /** Head lift 0..1 (a lying dog raises its head). */
  headUp?: number;
  /** Face screen right (the drawing faces left). */
  right?: boolean;
  coat: string;
  patch?: string;
  ear?: string;
  ink?: number;
  shadow?: boolean;
};

function dogParts(o: {L: number; pose: DogPose; step: number; wag: number; headUp: number; coat: string; patch?: string; ear: string; inkOn: boolean}): Part[] {
  const {L, pose, inkOn} = o;
  const out: Part[] = [];
  const lie = pose === 'lie';
  const sit = pose === 'sit';
  const bodyH = L * 0.36;
  const legL = lie ? 0 : L * 0.34;
  const by = lie ? -bodyH * 0.5 : -legL - bodyH * 0.45; // body centre y
  const trot = pose === 'trot';
  const a = Math.PI * o.step;
  const sw = trot ? Math.sin(a) * 0.42 : 0;
  // legs (far pair first), bars from the body to the ground; a trot swings them in diagonal pairs
  if (!lie) {
    const legs: [number, number, string][] = [
      [-L * 0.3, sw, 'lfF'],
      [L * 0.28, -sw, 'lfB'],
      [-L * 0.36, -sw, 'lnF'],
      [L * 0.22, sw, 'lnB'],
    ];
    for (const [lx, th, kk] of legs) {
      if (sit && (kk === 'lfB' || kk === 'lnB')) continue;
      const top: Pt = [lx, by + bodyH * 0.2];
      const foot: Pt = [lx - Math.sin(th) * legL, -Math.max(0, Math.cos(th) * 0) - (trot ? Math.max(0, Math.sin(th * (kk.endsWith('F') ? 1 : -1))) * L * 0.05 : 0)];
      const d = capsule(top, foot, L * 0.05, L * 0.042);
      out.push({k: kk, d, fill: kk.startsWith('lf') ? o.patch ?? o.coat : o.coat, ink: inkOn ? d : undefined, w: 0.8});
    }
  }
  // tail (behind the body): a curve up and back, wagging
  const tb: Pt = [L * 0.48, by - bodyH * 0.25];
  const wagA = Math.sin(o.wag * Math.PI * 2) * 0.5;
  const tt: Pt = [tb[0] + L * (0.22 + 0.06 * wagA), tb[1] - L * (0.26 - 0.08 * wagA)];
  const tail = capsule(tb, tt, L * 0.045, L * 0.022);
  out.push({k: 'tail', d: tail, fill: o.coat, ink: inkOn ? tail : undefined, w: 0.8});
  // body: a soft lozenge; a sitting dog tilts up at the front
  const body = sit
    ? curve([[-L * 0.3, by - bodyH * 0.9], [L * 0.1, by - bodyH * 0.55], [L * 0.38, by + bodyH * 0.2], [L * 0.3, -2], [-L * 0.32, -2], [-L * 0.42, by - bodyH * 0.2]], true, 0.5)
    : curve([[-L * 0.48, by - bodyH * 0.2], [-L * 0.1, by - bodyH * 0.55], [L * 0.42, by - bodyH * 0.45], [L * 0.52, by + bodyH * 0.1], [L * 0.3, by + bodyH * 0.5], [-L * 0.3, by + bodyH * 0.5], [-L * 0.5, by + bodyH * 0.25]], true, 0.5);
  out.push({k: 'body', d: body, fill: o.coat, ink: inkOn ? body : undefined});
  if (o.patch) {
    const pd = curve([[-L * 0.05, by - bodyH * 0.5], [L * 0.22, by - bodyH * 0.42], [L * 0.2, by + bodyH * 0.05], [0, by + bodyH * 0.1]], true, 0.5);
    out.push({k: 'patch', d: pd, fill: o.patch, exact: true});
  }
  // head + muzzle + a floppy ear (no eyes: a nose nub only)
  const down = pose === 'sniff' ? 1 : 0;
  const up = lie ? o.headUp : 1;
  const hx = sit ? -L * 0.36 : -L * 0.56 - down * L * 0.06;
  const hy = sit ? by - bodyH * 1.25 : lie ? by - bodyH * (0.15 + 0.75 * up) : by - bodyH * (0.85 - 1.35 * down);
  const hr = L * 0.17;
  const head = circlePath(hx, hy, hr);
  out.push({k: 'head', d: head, fill: o.coat, ink: inkOn ? head : undefined});
  const mz = curve([[hx - hr * 0.5, hy - hr * 0.35], [hx - hr * 1.75, hy - hr * 0.05 + down * hr * 0.6], [hx - hr * 1.8, hy + hr * 0.45 + down * hr * 0.6], [hx - hr * 0.6, hy + hr * 0.7]], true, 0.45);
  out.push({k: 'muzzle', d: mz, fill: o.coat, ink: inkOn ? mz : undefined, w: 0.85});
  const nose = ellipsePath(hx - hr * 1.72, hy + down * hr * 0.6 + hr * 0.05, hr * 0.2, hr * 0.17);
  out.push({k: 'nose', d: nose, fill: CM.anchor, exact: true});
  const ear = curve([[hx + hr * 0.1, hy - hr * 0.8], [hx + hr * 0.75, hy - hr * 0.55], [hx + hr * 0.85, hy + hr * 0.55], [hx + hr * 0.35, hy + hr * 0.4]], true, 0.5);
  out.push({k: 'ear', d: ear, fill: o.ear, ink: inkOn ? ear : undefined, w: 0.8});
  // a lying dog: the front paws out in front
  if (lie) {
    const paw = capsule([-L * 0.3, -L * 0.05], [-L * 0.62, -L * 0.035], L * 0.05, L * 0.045);
    out.push({k: 'paw', d: paw, fill: o.coat, ink: inkOn ? paw : undefined, w: 0.8});
  }
  // a collar
  const cx = hx + hr * 0.75;
  out.push({k: 'collar', d: polyline([[cx - L * 0.02, hy + hr * 0.2], [cx + L * 0.05, hy + hr * 0.1], [cx + L * 0.08, hy + hr * 1.1], [cx + L * 0.01, hy + hr * 1.2]], true), fill: CM.brick, exact: true});
  return out;
}

export const Dog: React.FC<DogProps> = (p) => {
  const inkPx = p.ink ?? (p.L >= 60 ? 2.2 : p.L >= 30 ? 1.6 : 0);
  const step = q100(p.step ?? 0);
  const wag = q100(p.wag ?? 0);
  const up = q100(p.headUp ?? 1);
  const L = q2(p.L);
  const key = JSON.stringify(['v2s1dog', L, p.pose, step, wag, up, p.coat, p.patch ?? 0, p.ear ?? 0, inkPx > 0]);
  const parts = cached(key, () => dogParts({L, pose: p.pose, step, wag, headUp: up, coat: p.coat, patch: p.patch, ear: p.ear ?? p.coat, inkOn: inkPx > 0}));
  return (
    <>
      {p.shadow !== false ? <Shade x={p.x} y={p.y} w={L * 1.05} len={Math.max(6, L * 0.22)} seed={`${p.seed}/sh`} /> : null}
      <FigureG x={p.x} y={p.y} flip={p.right} seed={p.seed}>
        <Parts parts={parts} inkPx={inkPx} offset={misregFor(L * 1.6, p.seed)} seed={p.seed} />
      </FigureG>
    </>
  );
};

// ---------------------------------------------------------------- Pigeon

export type PigeonProps = {x: number; y: number; s: number; seed: string; pose: 'stand' | 'peck' | 'fly'; k?: number; right?: boolean};

/** A pigeon on (or over) the steps: fill only at this size (the kit's colours: stone body, cool head). k = peck depth
 *  0..1 or the wing beat phase 0..1 (drawn at 12/s by the caller). */
export const Pigeon: React.FC<PigeonProps> = ({x, y, s, seed, pose, k = 0, right}) => {
  const key = JSON.stringify(['v2s1pig', q2(s), pose, q100(k)]);
  const parts = cached(key, () => {
    const out: Part[] = [];
    if (pose === 'fly') {
      const flap = Math.sin(k * Math.PI * 2);
      const wy = s * 0.55 * flap;
      const wing = `M${P(-s * 0.75, -s * 0.5 - wy)}Q${P(-s * 0.2, -s * 0.62)} ${P(0, -s * 0.38)}Q${P(s * 0.2, -s * 0.62)} ${P(s * 0.75, -s * 0.5 - wy)}L${P(s * 0.3, -s * 0.28)}L${P(0, -s * 0.18)}L${P(-s * 0.3, -s * 0.28)}Z`;
      out.push({k: 'wings', d: wing, fill: CM.stoneShade});
      out.push({k: 'body', d: ellipsePath(0, -s * 0.32, s * 0.36, s * 0.16), fill: CM.shadeCool});
      out.push({k: 'head', d: circlePath(-s * 0.4, -s * 0.38, s * 0.13), fill: CM.shadeCool});
      return out;
    }
    const peck = pose === 'peck' ? k : 0;
    out.push({k: 'legs', d: polyline([[-s * 0.06, -s * 0.12], [-s * 0.01, -s * 0.12], [-s * 0.02, 0], [-s * 0.08, 0]], true) + polyline([[s * 0.06, -s * 0.12], [s * 0.11, -s * 0.12], [s * 0.1, 0], [s * 0.04, 0]], true), fill: CM.box, exact: true});
    out.push({k: 'tail', d: polyline([[s * 0.3, -s * 0.3], [s * 0.66, -s * 0.24], [s * 0.3, -s * 0.16]], true), fill: CM.shadeCool});
    out.push({k: 'body', d: ellipsePath(0, -s * 0.3, s * 0.4, s * 0.21), fill: CM.stoneShade});
    out.push({k: 'wing', d: ellipsePath(s * 0.08, -s * 0.33, s * 0.26, s * 0.12), fill: CM.shadeCool});
    const hx = -s * (0.36 + 0.12 * peck);
    const hy = -s * (0.52 - 0.42 * peck);
    out.push({k: 'neck', d: polyline([[-s * 0.2, -s * 0.42], [hx - s * 0.02, hy - s * 0.08], [hx + s * 0.08, hy + s * 0.1], [-s * 0.18, -s * 0.24]], true), fill: CM.shadeCool});
    out.push({k: 'head', d: circlePath(hx, hy, s * 0.12), fill: CM.shadeCool});
    out.push({k: 'beak', d: polyline([[hx - s * 0.1, hy - s * 0.02], [hx - s * 0.24, hy + s * 0.03 + peck * s * 0.04], [hx - s * 0.1, hy + s * 0.05]], true), fill: CM.coatOat, exact: true});
    return out;
  });
  return (
    <FigureG x={x} y={y} flip={right} seed={seed}>
      <Parts parts={parts} inkPx={0} offset={false} seed={seed} />
    </FigureG>
  );
};

/** The time quantised to the house's 12 drawings/s (drawn poses step; travel moves every frame). */
export const d12 = (t: number) => drawn(t, 12);
