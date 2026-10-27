// canal/slots.tsx: where K4's people and K5's Pip plug into the canal sets.
//
// Every set that holds people (the S1 steps, the towpaths, the forecourt, windows) describes them as PersonSlots and
// renders each through <CastSlot>. A lane (or the kit's own samples) decides what a slot becomes:
//   <CanalCast person={(s) => <K4Person {...map(s)} />} pip={(seat) => <Pip ... />}>  ...sets...  </CanalCast>
// Without a provider, a slot draws a simple placeholder (round head, tombstone torso, back view, one accessory),
// never teal, never a face. Placeholders are only for kit sheets: the film's people come from src/v2r/kit/cast.

import React, {createContext, useContext} from 'react';
import {CM, COATS} from '../../palette';
import {Batch, Paint, ovalPath, P, pickOf, rand, r1} from './core';
import {INK_PX} from '../../palette';
import {torso} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {tiered} from '../tiers';

/** What a person is doing in a slot. 'bust' = a head-back cut by the bottom edge (foreground row). */
export type Pose = 'stand' | 'walk' | 'jog' | 'sit' | 'bust' | 'cycle' | 'dog' | 'lean' | 'read' | 'window';

export type PersonSlot = {
  id: string;
  /** Screen x of the figure's centre line. */
  x: number;
  /** Screen y of the feet (stand / walk / jog / cycle / dog), the seat (sit / read), the bottom edge (bust), or the
   *  window sill (window). */
  y: number;
  /** Height in px: a standing figure's full height (walk / stand / jog / cycle: the rider's head top above the
   *  ground), a seated figure's seat-to-head-top, a bust's head height, a dog's back height, a window figure's
   *  visible height. */
  h: number;
  pose: Pose;
  /** Facing / walking direction: +1 = screen right, -1 = left. Backs to us unless walking across. */
  dir?: 1 | -1;
  seed: string;
  /** Optional overrides (else seeded from the palette's coats / hair). */
  coat?: string;
  hair?: string;
  /** 'hood' | 'beanie' | 'cap' | 'bun' | 'scarf' | 'bag' | 'tote' | 'phone' | 'cup' | 'book' | 'dogLead' | 'none' */
  acc?: string;
  /** Gait clock (s) for walkers (the slot's own time; K4 steps its drawings on it). */
  gait?: number;
  /** Scene seconds when the figure turns its head (a cause 0.1-0.3 s before), or lifts a cup, etc. */
  actAt?: number;
};

/** Pip's seat in a shot: the paw point (bottom centre) and its size. */
export type PipSeat = {id: string; x: number; y: number; size: number; pose?: string; look?: [number, number]};

type CastV = {person?: (s: PersonSlot) => React.ReactNode; pip?: (s: PipSeat) => React.ReactNode};
const CastCtx = createContext<CastV>({});

/** Plug K4's people and K5's Pip into every canal set below. */
export const CanalCast: React.FC<CastV & {children?: React.ReactNode}> = ({person, pip, children}) => {
  const parent = useContext(CastCtx);
  return <CastCtx.Provider value={{person: person ?? parent.person, pip: pip ?? parent.pip}}>{children}</CastCtx.Provider>;
};
export const useCanalCast = () => useContext(CastCtx);

/** One person: K4's renderer if a <CanalCast person> is above, else the placeholder. */
export const CastSlot: React.FC<{s: PersonSlot}> = ({s}) => {
  const c = useContext(CastCtx);
  if (c.person) return <>{c.person(s)}</>;
  return <PlaceholderPerson s={s} />;
};

/** Pip at a seat: K5's renderer if provided, else a placeholder pebble. */
export const PipSlot: React.FC<{seat: PipSeat}> = ({seat}) => {
  const c = useContext(CastCtx);
  if (c.pip) return <>{c.pip(seat)}</>;
  return <PlaceholderPip seat={seat} />;
};

// ---------------------------------------------------------------- placeholders (kit sheets only)

const SKINLESS_HAIR = CM.hair;

/** Seeded look of a slot: coat, hair and accessory, never teal, neighbours differ by seed. */
export function slotLook(s: PersonSlot): {coat: string; hair: string; acc: string; trouser: string} {
  const coat = s.coat ?? pickOf(COATS.concat([CM.brick, CM.sage, CM.stoneShade, CM.leafRust, CM.box]), s.seed, 'coat');
  const hair = s.hair ?? pickOf(SKINLESS_HAIR, s.seed, 'hair');
  const acc = s.acc ?? pickOf(['hood', 'beanie', 'cap', 'bun', 'scarf', 'bag', 'tote', 'none', 'phone', 'curls'], s.seed, 'acc');
  const trouser = pickOf([CM.paneUnlit, CM.anchor, CM.shadeWarm, CM.line, CM.coatSlate], s.seed, 'tr');
  return {coat, hair, acc, trouser};
}

/** A back-view placeholder in the house grammar (round head, tombstone torso, one accessory; legs only on walkers). */
const PlaceholderPersonBody: React.FC<{s: PersonSlot}> = ({s}) => {
  const t = useTime();
  const b = new Batch();
  drawPlaceholder(b, s, t);
  return <Paint b={b} seed={`pp/${s.seed}`} misreg={s.h > 60} />;
};
export const PlaceholderPerson = tiered('support', {lines: true}, PlaceholderPersonBody);

/** Draws a placeholder person into a batch (exported so crowds can batch many people in one paint). */
export function drawPlaceholder(b: Batch, s: PersonSlot, t: number) {
  const {coat, hair, acc, trouser} = slotLook(s);
  const H = s.h;
  const w = H > 90 ? INK_PX.far : H > 45 ? INK_PX.hair : 0;
  const ph = rand(s.seed, 'ph') * 6.28;
  if (s.pose === 'dog') {
    // a small dog in profile: body, head, tail; trots if gait given
    const L = H * 1.7;
    const dir = s.dir ?? 1;
    const bob = s.gait !== undefined ? Math.abs(Math.sin(s.gait * 9 + ph)) * H * 0.06 : 0;
    const col = pickOf([CM.line, CM.coatOat, CM.anchor, CM.leafGold, CM.paper], s.seed, 'dog');
    const x0 = s.x - L / 2;
    const y0 = s.y - H - bob;
    b.fill(col, ovalPath(s.x, y0 + H * 0.45, L * 0.42, H * 0.3));
    b.fill(col, ovalPath(s.x + dir * L * 0.45, y0 + H * 0.15, H * 0.26, H * 0.22));
    const legPh = s.gait !== undefined ? Math.sin(s.gait * 12 + ph) * H * 0.12 : 0;
    for (const k of [-0.28, 0.25]) {
      b.rect(col, s.x + k * L - H * 0.06 + legPh * (k > 0 ? 1 : -1), y0 + H * 0.6, H * 0.12, H * 0.4 + bob);
    }
    b.ink(`M${P(x0 + (dir > 0 ? 0 : L), y0 + H * 0.35)}l${r1(-dir * H * 0.25)} ${r1(-H * 0.25)}`, w);
    return;
  }
  if (s.pose === 'bust') {
    // a head-back + shoulders cut by the bottom edge: head height H
    const hw = H * 0.84;
    const cx = s.x;
    const headY = s.y - H * 1.35;
    b.fill(coat, torso(cx, s.y + 40, H * 1.55, H * 0.72, 0.42, 0.05) + 'Z');
    b.fill(hair, ovalPath(cx, headY, hw / 2, H / 2));
    if (acc === 'beanie' || acc === 'hood') b.fill(acc === 'hood' ? coat : pickOf([CM.coatMustard, CM.brick, CM.sage, CM.box], s.seed, 'bn'), `M${P(cx - hw * 0.53, headY + H * 0.02)}A${r1(hw * 0.53)} ${r1(H * 0.56)} 0 0 1 ${P(cx + hw * 0.53, headY + H * 0.02)}Z`);
    if (acc === 'cap') b.fill(CM.paneUnlit, `M${P(cx - hw * 0.5, headY - H * 0.08)}A${r1(hw * 0.5)} ${r1(H * 0.44)} 0 0 1 ${P(cx + hw * 0.5, headY - H * 0.08)}Z`);
    if (acc === 'bun') b.fill(hair, ovalPath(cx + hw * 0.05, headY - H * 0.5, H * 0.16, H * 0.14));
    if (acc === 'scarf') b.rect(CM.coatMustard, cx - hw * 0.62, s.y - H * 0.88, hw * 1.24, H * 0.2);
    b.ink(`M${P(cx - hw / 2, headY + H * 0.1)}A${r1(hw / 2)} ${r1(H / 2)} 0 0 1 ${P(cx + hw / 2, headY + H * 0.1)}`, INK_PX.mid, CM.ink, 0.25);
    return;
  }
  if (s.pose === 'window') {
    // a small silhouette in a lit window: head + shoulders, anchor plum
    const hw = H * 0.28;
    b.fill(CM.anchor, torso(s.x, s.y, H * 0.8, H * 0.45, 0.45, 0) + 'Z');
    b.fill(CM.anchor, ovalPath(s.x, s.y - H * 0.62, hw, hw * 1.12));
    return;
  }
  const seated = s.pose === 'sit' || s.pose === 'read';
  // proportions of a standing back-view figure of height H (head 0.2, torso 0.42, legs 0.38)
  const headH = H * (seated ? 0.3 : 0.2);
  const headW = headH * 0.86;
  const torsoH = H * (seated ? 0.58 : 0.42);
  const torsoW = headW * 1.85;
  const footY = s.y;
  const hip = seated ? footY : footY - H * 0.38;
  const bobY = s.pose === 'walk' || s.pose === 'jog' ? Math.abs(Math.sin((s.gait ?? t) * (s.pose === 'jog' ? 9 : 6.5) + ph)) * H * 0.012 : Math.sin(t * 1.3 + ph) * H * 0.006;
  const top = hip - torsoH - bobY;
  // legs (walkers stride; standing figures two columns)
  if (!seated) {
    const g = (s.gait ?? t) * (s.pose === 'jog' ? 9 : 6.5) + ph;
    const st = s.pose === 'walk' || s.pose === 'jog' ? Math.sin(g) * H * (s.pose === 'jog' ? 0.1 : 0.07) : 0;
    const lw = torsoW * 0.3;
    b.rect(trouser, s.x - lw * 1.05 + st, hip - 2, lw, footY - hip + 2);
    b.rect(trouser, s.x + lw * 0.05 - st, hip - 2, lw, footY - hip + 2);
  } else {
    // seated: a flat seat shadow under the torso
    b.rect(CM.shadeWarm, s.x - torsoW * 0.55, footY - 1, torsoW * 1.1, Math.max(2, H * 0.04));
  }
  b.fill(coat, torso(s.x, hip + (seated ? 0 : 2), torsoW, torsoH, 0.42, seated ? 0.12 : 0.06) + 'Z');
  const hy = top - headH * 0.42;
  b.fill(hair, ovalPath(s.x, hy, headW / 2, headH / 2));
  if (acc === 'beanie') b.fill(pickOf([CM.coatMustard, CM.brick, CM.sage, CM.box], s.seed, 'bn'), `M${P(s.x - headW * 0.52, hy - headH * 0.05)}A${r1(headW * 0.52)} ${r1(headH * 0.55)} 0 0 1 ${P(s.x + headW * 0.52, hy - headH * 0.05)}Z`);
  if (acc === 'hood') b.fill(coat, `M${P(s.x - headW * 0.56, hy + headH * 0.2)}A${r1(headW * 0.56)} ${r1(headH * 0.62)} 0 0 1 ${P(s.x + headW * 0.56, hy + headH * 0.2)}Z`);
  if (acc === 'cap') b.fill(CM.paneUnlit, `M${P(s.x - headW * 0.5, hy - headH * 0.1)}A${r1(headW * 0.5)} ${r1(headH * 0.42)} 0 0 1 ${P(s.x + headW * 0.5, hy - headH * 0.1)}Z`);
  if (acc === 'bun') b.fill(hair, ovalPath(s.x, hy - headH * 0.52, headH * 0.17, headH * 0.15));
  if (acc === 'curls') b.fill(hair, ovalPath(s.x, hy - headH * 0.08, headW * 0.6, headH * 0.56));
  if (acc === 'scarf') b.rect(pickOf([CM.coatMustard, CM.box, CM.brickDeep], s.seed, 'sc'), s.x - torsoW * 0.4, top - 1, torsoW * 0.8, headH * 0.22);
  if (acc === 'bag' || acc === 'tote') b.rect(acc === 'tote' ? CM.coatOat : CM.line, s.x + torsoW * 0.42, top + torsoH * 0.35, torsoW * 0.32, torsoH * 0.4);
  if (s.pose === 'cycle') {
    // a bicycle under the rider (side view, wheels as rings)
    const R = H * 0.2;
    const d = s.dir ?? 1;
    const ax = s.x - d * H * 0.32;
    const bx = s.x + d * H * 0.32;
    const wy = footY - R;
    b.ink(`M${P(ax - R, wy)}A${r1(R)} ${r1(R)} 0 1 0 ${P(ax + R, wy)}A${r1(R)} ${r1(R)} 0 1 0 ${P(ax - R, wy)}M${P(bx - R, wy)}A${r1(R)} ${r1(R)} 0 1 0 ${P(bx + R, wy)}A${r1(R)} ${r1(R)} 0 1 0 ${P(bx - R, wy)}M${P(ax, wy)}L${P(s.x, wy - R * 0.2)}L${P(bx, wy)}M${P(s.x, wy - R * 0.2)}L${P(s.x - d * R * 0.2, hip)}`, Math.max(1.6, w));
  }
  if (w > 0) b.ink(`M${P(s.x - headW / 2, hy + headH * 0.1)}A${r1(headW / 2)} ${r1(headH / 2)} 0 0 1 ${P(s.x + headW / 2, hy + headH * 0.1)}`, w, CM.ink, 0.3);
}

/** A placeholder Pip: a periwinkle pebble with two leaf ears and a mustard scarf (kit sheets only). */
const PlaceholderPipBody: React.FC<{seat: PipSeat}> = ({seat}) => {
  const t = useTime();
  const s = seat.size;
  const b = new Batch();
  const breath = Math.sin(t * 2.2) * s * 0.01;
  const cx = seat.x;
  const cy = seat.y - s * 0.42 - breath;
  b.fill(CM.pipBody, ovalPath(cx, cy, s * 0.42, s * 0.42));
  const flick = Math.max(0, Math.sin(t * 0.9 + 1.3) - 0.92) * 8;
  b.fill(CM.pipShade, ovalPath(cx - s * 0.38, cy - s * 0.12 - flick, s * 0.2, s * 0.26));
  b.fill(CM.pipShade, ovalPath(cx + s * 0.38, cy - s * 0.12, s * 0.2, s * 0.26));
  b.fill(CM.pipEar, ovalPath(cx + s * 0.38, cy - s * 0.1, s * 0.1, s * 0.15));
  b.rect(CM.pipScarf, cx - s * 0.3, cy + s * 0.12, s * 0.6, s * 0.11);
  b.fill(CM.pipBody, ovalPath(cx + s * 0.05, cy + s * 0.08, s * 0.07, s * 0.16));
  b.ink(`M${P(cx - s * 0.4, cy - s * 0.1)}A${r1(s * 0.42)} ${r1(s * 0.42)} 0 1 1 ${P(cx + s * 0.4, cy + s * 0.12)}`, INK_PX.mid);
  return <Paint b={b} seed={`pip/${seat.id}`} />;
};
export const PlaceholderPip = tiered('support', {lines: true}, PlaceholderPipBody);
