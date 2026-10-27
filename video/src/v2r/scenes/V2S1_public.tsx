// V2S1 helper (lane L1, our bank): THE SEATED PUBLIC on our canal-side steps (TREATMENT section 5 "the bottom third"
// and section 3 "the public"; STYLE sections 4-5). Small and simple like reference 1: backs, round heads that are the
// hair, tombstone torsos, one accessory each, no two neighbours alike, never teal, never a face, no hands but a raised
// phone's. 24 seated in staggered, overlapping groups (a picnic, a guitar, a couple leaning in, a parent with a pram,
// friends turned to each other) + 7 near head-backs cut by the frame bottom (hv <= 150: <= ~140 px at the shoulders)
// + the movers (someone arriving, a dog trotting down the steps at 2.80, a pigeon), and their things.
//
// LIFE (seconds = film seconds): something with >= 40 px of motion every 0.4-0.8 s, all of it IN BETWEEN the story
// beats (V2S1_clock: W dark + the doors 0.38-0.56, her step-out 0.92-1.06, every ghost pop +-0.12 s, the "..." stop
// 4.54-4.98 and "life" 4.98-5.35 get small ambient only), so the eye stays on the far towpath at every beat:
//   -0.05 a cup is passed along tread 2 · 0.56 someone walks in along tread 2 (pauses 0.92-1.06) · 0.58 a man stands
//   up and stretches (1.10) and sits back (1.62) · 1.06 a phone comes up by the water · 1.10 a pigeon flutters in
//   and pecks · 2.14 the newcomer sits, a child shuffles along, the pram rocks · 2.62 the dog trots down the steps
//   (sniffs through G3's pop 3.08-3.32) · 3.34 on down to the old dog, the pigeon takes off · 3.93 it sits ·
//   4.33 a phone up for the sunset, the child shuffles again · 5.38 one stands and walks off, the cup goes back.
//   Always: heads turn in pairs, the guitar strums (it rests through the "..."), cups lift, the old dog's tail,
//   a page turns, steam, leaves skitter down the treads.
import React from 'react';
import {useTime, clamp, ease} from '../../lib/time';
import {CM} from '../palette';
import {NearBack} from '../kit/cast';
import type {TraitOverrides} from '../kit/cast';
import {Puffs} from '../kit/canal/life';
import {Sit, Rise, Dog, Pigeon, d12, type SitArms} from './V2S1_steps_figs';
import {Prop, cup, tote, backpack, bookOpen, jacket, cloth, flask, paperBag, apple, guitarCase, pram, bike, skateboard, umbrella, scooter, bowl, lead} from './V2S1_steps_props';
import {Fill} from '../../lib/Fill';
import {strideFor} from '../kit/cast/gait';

const H = CM.hair; // 0 plum-brown, 1 brown, 2 auburn, 3 silver, 4 blonde

// ---------------------------------------------------------------- time helpers

/** 0..1 eased progress of [t0, t1] on the 12 drawings/s clock (a drawn pose). */
const pose = (t: number, t0: number, t1: number, e = ease.inOutCubic) => e(clamp((d12(t) - t0) / (t1 - t0)));
/** 0..1 travel progress of [t0, t1], every frame. */
const go = (t: number, t0: number, t1: number, e = ease.inOutSine) => e(clamp((t - t0) / (t1 - t0)));
/** A value stepping through keys [t, v] with eased 0.25 s transitions (drawn at 12/s). */
function keyed(t: number, keys: [number, number][], dur = 0.25): number {
  let v = 0;
  let from = 0;
  for (const [at, to] of keys) {
    if (d12(t) < at) break;
    v = from + (to - from) * ease.inOutCubic(clamp((d12(t) - at) / dur));
    from = to;
  }
  return v;
}
/** Up-hold-down windows [up, down]: 0 -> 1 -> 0 (lift 0.3 s, lower 0.3 s), drawn at 12/s. */
function lifts(t: number, w: [number, number][], dur = 0.3): number {
  const tq = d12(t);
  let k = 0;
  for (const [up, down] of w) {
    if (tq >= up && tq < down) k = Math.max(k, ease.inOutCubic(clamp((tq - up) / dur)));
    else if (tq >= down && tq < down + dur) k = Math.max(k, 1 - ease.inOutCubic(clamp((tq - down) / dur)));
  }
  return k;
}

// ---------------------------------------------------------------- the people (world px, zoom 1.00 = the cover)

type Seat = {
  id: string;
  x: number;
  y: number;
  h: number;
  t: TraitOverrides;
  turn?: [number, number][];
  quarter?: -1 | 1;
  lean?: number;
  read?: boolean;
  side?: 1 | -1;
  /** Cup lifts [up, down] on `side`. */
  sips?: [number, number][];
  /** Phone windows [up, down] (the one hand allowed). */
  phone?: [number, number][];
  ink: number;
};

const T = (o: TraitOverrides): TraitOverrides => o;

/** On the coping, legs over the water (the low row's farthest edge). Two by the moored boat on the right. */
const COPING: Seat[] = [
  {id: 'c1', x: 98, y: 1223, h: 34, t: T({hair: 'beanie', hatColor: CM.brick, hairColor: H[1], coat: CM.coatSlate, acc: 'none', skin: CM.brickLight}), turn: [[2.7, -0.4], [3.9, 0]], ink: 1.6},
  {id: 'c2', x: 846, y: 1223, h: 35, t: T({hair: 'short', hairColor: H[1], coat: CM.coatMustard, acc: 'none', skin: CM.paving}), turn: [[0.62, 0.55], [2.2, 0.2], [3.4, 0.6]], ink: 1.6},
  {id: 'c3', x: 884, y: 1224, h: 34, t: T({hair: 'long', hairColor: H[4], coat: CM.sage, acc: 'none', skin: CM.brickLight}), turn: [[1.2, -0.5], [2.9, -0.2]], lean: -4, ink: 1.6},
];

/** The landing by the water (heads ~19 px). Pip's bollard keeps x 620-780 clear. */
const LANDING: Seat[] = [
  {id: 'l1', x: 28, y: 1296, h: 46, t: T({hair: 'cap', hatColor: CM.sage, hairColor: H[0], coat: CM.brickLight, acc: 'backpack', accColor: CM.coatSlate}), ink: 1.6},
  {id: 'l2', x: 150, y: 1293, h: 45, t: T({hair: 'curls', hairColor: H[1], coat: CM.coatOat, acc: 'tote', accColor: CM.sage}), turn: [[-1, 0.5], [2.2, 0.15], [3.45, 0.55]], ink: 1.6},
  {id: 'l3', x: 190, y: 1299, h: 47, t: T({hair: 'short', hairColor: H[2], coat: CM.coatSlate, acc: 'none', skin: CM.brickDeep}), turn: [[-1, -0.45], [1.6, -0.1], [2.85, -0.5]], ink: 1.6},
  {id: 'l4', x: 398, y: 1292, h: 45, t: T({hair: 'crop', hairColor: H[0], coat: CM.sage, acc: 'headphones', accColor: CM.coatMustard, skin: CM.brick}), ink: 1.6},
  {id: 'l5', x: 470, y: 1298, h: 47, t: T({hair: 'long', hairColor: H[3], coat: CM.brick, acc: 'scarf', accColor: CM.coatOat}), turn: [[1.3, 0.45], [3.6, 0]], ink: 1.6},
  {id: 'l6', x: 540, y: 1294, h: 46, t: T({hair: 'hood', coat: CM.stoneShade, acc: 'none'}), ink: 1.6},
  {id: 'l7', x: 955, y: 1296, h: 47, t: T({hair: 'short', hairColor: H[4], coat: CM.coatSlate, acc: 'none', skin: CM.brickLight}), phone: [[1.06, 3.34]], side: -1, ink: 1.6},
  {id: 'l8', x: 1046, y: 1291, h: 45, t: T({hair: 'beanie', hatColor: CM.sage, hairColor: H[2], coat: CM.leafRust, acc: 'tote', accColor: CM.coatOat}), ink: 1.6},
];

/** Tread 1 (band 1302-1392; heads ~21 px): a reader, a parent with a child, friends. */
const TREAD1: Seat[] = [
  {id: 't1a', x: 86, y: 1350, h: 53, t: T({hair: 'short', hairColor: H[3], coat: CM.brickDeep, acc: 'none', skin: CM.paving}), read: true, ink: 1.6},
  {id: 't1b', x: 250, y: 1336, h: 51, t: T({hair: 'bun', hairColor: H[4], coat: CM.box, acc: 'strap', accColor: CM.coatSlate}), turn: [[0.7, -0.4], [2.5, 0]], ink: 1.6},
  {id: 't1c', x: 346, y: 1373, h: 56, t: T({hair: 'long', hairColor: H[1], coat: CM.coatMustard, acc: 'none'}), turn: [[-1, 0.5]], ink: 1.6},
  {id: 't1e', x: 506, y: 1341, h: 51, t: T({hair: 'cap', hatColor: CM.coatSlate, hairColor: H[0], coat: CM.coatOat, acc: 'backpack', accColor: CM.brick}), turn: [[3.5, 0.4], [4.4, 0]], ink: 1.6},
  {id: 't1f', x: 846, y: 1361, h: 55, t: T({hair: 'short', hairColor: H[0], coat: CM.sage, acc: 'strap', accColor: CM.coatOat}), turn: [[-1, 0.4], [1.7, 0], [3.0, 0.45]], ink: 1.6},
  {id: 't1g', x: 902, y: 1346, h: 52, t: T({hair: 'curls', hairColor: H[2], coat: CM.stoneShade, acc: 'none'}), turn: [[-1, -0.35], [2.3, -0.5]], lean: -3, ink: 1.6},
  {id: 't1h', x: 1036, y: 1369, h: 56, t: T({hair: 'hood', coat: CM.brick, acc: 'none'}), ink: 1.6},
];

/** Tread 2 (band 1392-1508; heads ~27 px). */
const TREAD2: Seat[] = [
  {id: 't2b', x: 205, y: 1456, h: 68, t: T({hair: 'long', hairColor: H[2], coat: CM.coatOat, acc: 'none'}), turn: [[-1, 0.4]], lean: 5, ink: 2.2},
  {id: 't2c', x: 247, y: 1463, h: 70, t: T({hair: 'short', hairColor: H[1], coat: CM.coatSlate, acc: 'backpack', accColor: CM.sage, skin: CM.brickLight}), turn: [[-1, -0.2], [2.9, -0.5], [4.2, -0.2]], ink: 2.2},
  {id: 't2f', x: 640, y: 1448, h: 67, t: T({hair: 'crop', hairColor: H[1], coat: CM.coatMustard, acc: 'none', skin: CM.paving}), quarter: 1, ink: 2.2},
  {id: 't2g', x: 712, y: 1463, h: 69, t: T({hair: 'curls', hairColor: H[4], coat: CM.coatSlate, acc: 'scarf', accColor: CM.brick}), quarter: -1, ink: 2.2},
  {id: 't2i', x: 1012, y: 1451, h: 67, t: T({hair: 'long', hairColor: H[0], coat: CM.leafRust, acc: 'none'}), turn: [[1.4, -0.4], [3.7, 0]], ink: 2.2},
];

/** Tread 3 (band 1508-1660; heads ~35 px): the picnic, the guitar, the dogs. */
const TREAD3: Seat[] = [
  {id: 't3a', x: 52, y: 1630, h: 92, t: T({hair: 'beanie', hatColor: CM.coatSlate, hairColor: H[1], coat: CM.leafRust, acc: 'none'}), quarter: 1, ink: 2.2},
  {id: 't3b', x: 176, y: 1641, h: 93, t: T({hair: 'short', hairColor: H[2], coat: CM.sage, acc: 'scarf', accColor: CM.coatMustard, skin: CM.brickLight}), turn: [[-1, -0.3], [1.5, 0.35], [3.4, -0.3]], ink: 2.2},
  {id: 't3c', x: 300, y: 1626, h: 91, t: T({hair: 'long', hairColor: H[4], coat: CM.brickLight, acc: 'none'}), quarter: -1, ink: 2.2},
  {id: 't3e', x: 700, y: 1592, h: 85, t: T({hair: 'short', hairColor: H[4], coat: CM.brick, acc: 'strap', accColor: CM.coatOat}), turn: [[-1, -0.55], [2.4, -0.2], [3.7, -0.55]], ink: 2.2},
  {id: 't3g', x: 1022, y: 1602, h: 87, t: T({hair: 'bun', hairColor: H[1], coat: CM.coatMustard, acc: 'tote', accColor: CM.coatSlate}), sips: [[1.1, 1.75], [3.95, 4.5]], ink: 2.2},
];

/** Tread 4 (band 1660-1850; heads ~45 px): a parent with a pram, a skater, a reader, a phone for the sunset. */
const TREAD4: Seat[] = [
  {id: 't4a', x: 214, y: 1801, h: 116, t: T({hair: 'short', hairColor: H[1], coat: CM.coatOat, acc: 'none', skin: CM.paving}), turn: [[-1, -0.6], [1.2, -0.25], [2.1, -0.65], [4.4, -0.3]], quarter: -1, ink: 3.4},
  {id: 't4b', x: 396, y: 1762, h: 110, t: T({hair: 'bun', hairColor: H[2], coat: CM.coatSlate, acc: 'none'}), sips: [[1.15, 1.85], [3.36, 3.9]], ink: 3.4},
  {id: 't4c', x: 540, y: 1792, h: 114, t: T({hair: 'cap', hatColor: CM.coatMustard, hairColor: H[0], coat: CM.brickDeep, acc: 'none'}), turn: [[2.7, 0.4], [3.6, 0]], ink: 3.4},
  {id: 't4d', x: 745, y: 1752, h: 108, t: T({hair: 'long', hairColor: H[3], coat: CM.sage, acc: 'scarf', accColor: CM.brick}), turn: [[-1, 0.3]], ink: 3.4},
  {id: 't4e', x: 902, y: 1802, h: 117, t: T({hair: 'crop', hairColor: H[2], coat: CM.coatMustard, acc: 'backpack', accColor: CM.coatPlum, skin: CM.brickDeep}), phone: [[4.33, 5.4]], side: -1, ink: 3.4},
];

/** The near head-backs cut by the frame bottom: hv <= 150 (K4 NearBack width 0.84 x hv x broad: <= ~140 px). */
const NEAR: {id: string; x: number; hv: number; t: TraitOverrides; turn?: [number, number][]}[] = [
  {id: 'n1', x: 66, hv: 142, t: T({hair: 'hood', coat: CM.sage, acc: 'none', broad: 1.0})},
  {id: 'n2', x: 202, hv: 134, t: T({hair: 'beanie', hatColor: CM.coatMustard, hairColor: H[1], coat: CM.coatSlate, acc: 'none', skin: CM.brickLight, broad: 0.96}), turn: [[1.2, 0.35], [2.35, 0], [3.45, 0.4], [4.4, 0]]},
  {id: 'n3', x: 342, hv: 148, t: T({hair: 'lowBun', hairColor: H[2], coat: CM.coatOat, acc: 'none', skin: CM.paving, broad: 1.0, scarf: CM.coatMustard} as TraitOverrides)},
  {id: 'n4', x: 478, hv: 130, t: T({hair: 'curls', hairColor: H[1], coat: CM.brick, acc: 'none', broad: 1.02}), turn: [[0.7, -0.3], [2.8, 0]]},
  {id: 'n5', x: 616, hv: 144, t: T({hair: 'cap', hatColor: CM.coatSlate, hairColor: H[0], coat: CM.stoneShade, acc: 'none', skin: CM.brick, broad: 0.98})},
  {id: 'n6', x: 752, hv: 138, t: T({hair: 'short', hairColor: H[4], coat: CM.leafRust, acc: 'headphones', accColor: CM.coatSlate, skin: CM.brickLight, broad: 0.96}), turn: [[1.75, 0.4], [3.6, 0.1]]},
  {id: 'n7', x: 884, hv: 146, t: T({hair: 'long', hairColor: H[0], coat: CM.coatMustard, acc: 'none', broad: 0.98}), turn: [[1.75, -0.35], [3.6, -0.1]]},
];

const SitAt: React.FC<{s: Seat; arms?: SitArms; cupK?: number; dy?: number; dx?: number}> = ({s, arms, cupK, dy, dx}) => {
  const t = useTime();
  const turn = s.turn ? keyed(t, s.turn) : undefined;
  const cupv = cupK ?? (s.sips ? lifts(t, s.sips, 0.32) : undefined);
  const ph = s.phone ? s.phone.some(([a, b]) => d12(t) >= a && d12(t) < b) : false;
  return (
    <Sit x={s.x + (dx ?? 0)} y={s.y} h={s.h} seed={`v2s1/bank/${s.id}`} traits={s.t} model={(s.t as {scarf?: string}).scarf ? {scarf: (s.t as {scarf?: string}).scarf} : undefined} turn={turn} cup={cupv} read={s.read} phone={ph} side={s.side} ink={s.ink} lean={s.lean} quarter={s.quarter} arms={arms} dy={dy} />
  );
};

const Row: React.FC<{seats: Seat[]}> = ({seats}) => (
  <>
    {seats.map((s) => (
      <SitAt key={s.id} s={s} />
    ))}
  </>
);

// ---------------------------------------------------------------- the special people (life)

/** T2: the cup passed along (T2d -> T2e from -0.05, back at 5.40), and T2e's sip. */
const CupPass: React.FC = () => {
  const t = useTime();
  const d: Seat = {id: 't2d', x: 418, y: 1479, h: 71, t: T({hair: 'beanie', hatColor: CM.coatMustard, hairColor: H[1], coat: CM.brick, acc: 'none', skin: CM.brickLight}), ink: 2.2};
  const e: Seat = {id: 't2e', x: 480, y: 1471, h: 70, t: T({hair: 'bun', hairColor: H[0], coat: CM.sage, acc: 'tote', accColor: CM.coatMustard}), ink: 2.2};
  // T2d holds the cup out to the right (-0.05 -> 0.22), lets go; T2e's sleeve meets it and brings it home (0.22-0.38)
  const tq = d12(t);
  const out1 = pose(t, -0.05, 0.22);
  const back1 = pose(t, 0.22, 0.36);
  const dHas = tq < 0.22 || (tq >= 5.52 && tq < 5.95);
  const dK = tq < 0.22 ? out1 : tq < 0.36 ? 1 - back1 : tq < 5.4 ? 0 : tq < 5.52 ? 0 : tq < 5.66 ? 1 - pose(t, 5.52, 5.66) : 0;
  const eK = tq < 0.22 ? 0 : tq < 0.36 ? 1 - back1 : tq < 5.4 ? 0 : tq < 5.52 ? pose(t, 5.4, 5.52) : 0;
  // T2e sips 1.15-1.70 (the cup on her sleeve, lap -> mouth)
  const sip = tq >= 0.36 && tq < 5.4 ? lifts(t, [[1.15, 1.62]], 0.28) : undefined;
  const dArms: SitArms | undefined = dK > 0.02 ? {reach: {to: [62, -40], k: dK, cup: dHas, side: 1}} : undefined;
  const eArms: SitArms | undefined = eK > 0.02 ? {reach: {to: [-22, -34], k: eK, cup: !dHas, side: -1}} : undefined;
  const eLap = !eArms && tq >= 0.36 && tq < 5.4;
  return (
    <>
      <SitAt s={d} arms={dArms} />
      <SitAt s={e} arms={eArms} cupK={eLap ? sip ?? 0 : undefined} />
      {/* her cup's steam while it is in her lap */}
      {eLap && (sip ?? 0) < 0.1 ? <Puffs x={e.x + 26} y={e.y - 34} seed="v2s1/bank/cupsteam" kind="steam" scale={0.18} drift={-6} /> : null}
    </>
  );
};

/** T3f: stands up 0.58-0.90, stretches 1.10-1.55, sits back down 1.62-1.86. */
const Stretcher: React.FC = () => {
  const t = useTime();
  const s: Seat = {id: 't3f', x: 880, y: 1633, h: 92, t: T({hair: 'hood', coat: CM.sage, acc: 'none'}), ink: 2.2};
  const tq = d12(t);
  if (tq < 0.58 || tq >= 1.86) return <SitAt s={s} />;
  const k = tq < 0.9 ? pose(t, 0.58, 0.9, ease.inOutQuad) : tq < 1.62 ? 1 : 1 - pose(t, 1.62, 1.86, ease.inOutQuad);
  const st = tq < 1.1 ? 0 : tq < 1.33 ? pose(t, 1.1, 1.33) : tq < 1.4 ? 1 : 1 - pose(t, 1.4, 1.58);
  return <Rise x={s.x} y={s.y} h={s.h} seed={`v2s1/bank/${s.id}`} traits={s.t} k={k} stretch={st} ink={s.ink} />;
};

/** The newcomer: walks in from the left edge along tread 2 (0.56-0.92, pauses through her step-out, 1.06-1.75),
 *  turns to the water (1.80), sits down 2.14-2.38. Walk 0.9 body heights/s, 12 drawings/s. */
const ARRIVE = {x0: -46, x1: 70, y: 1479, h: 71};
const Arrival: React.FC = () => {
  const t = useTime();
  const traits = T({hair: 'short', hairColor: H[3], coat: CM.brickLight, acc: 'backpack', accColor: CM.coatSlate, skin: CM.paving, coatLen: 'jacket'});
  const seed = 'v2s1/bank/arrive';
  const Hs = ARRIVE.h / 0.56;
  const v = 0.9 * Hs; // px/s
  const tq = d12(t);
  if (tq >= 2.38) return <Sit x={ARRIVE.x1} y={ARRIVE.y} h={ARRIVE.h} seed={seed} traits={traits} ink={2.2} turn={keyed(t, [[2.9, 0.35], [3.9, 0]])} />;
  // travel (every frame): 0.56-0.92 and 1.06-1.75, ending exactly at x1
  const legA = 0.36 * v;
  const legB = ARRIVE.x1 - ARRIVE.x0 - legA;
  const x = t < 0.56 ? ARRIVE.x0 : t < 0.92 ? ARRIVE.x0 + legA * ((t - 0.56) / 0.36) : t < 1.06 ? ARRIVE.x0 + legA : t < 1.75 ? ARRIVE.x0 + legA + legB * go(t, 1.06, 1.75, (u) => u) : ARRIVE.x1;
  const stepPx = 0.3 * Hs;
  const walking = (t >= 0.56 && t < 0.92) || (t >= 1.06 && t < 1.75);
  const step = (x - ARRIVE.x0) / stepPx;
  if (tq < 1.8) {
    // walking (rear 3/4, heading right); stopped mid-stride on the pause
    return <Rise x={x} y={ARRIVE.y} h={ARRIVE.h} seed={seed} traits={traits} k={1} walk={{step: walking || (t >= 0.92 && t < 1.06) ? step : Math.round(step), view: 'rear34', right: true, stride: strideFor(stepPx, Hs, 'rear34')}} ink={2.2} />;
  }
  // turned to the water, then down onto the step
  const k = 1 - pose(t, 2.14, 2.38, ease.inOutQuad);
  return <Rise x={x} y={ARRIVE.y} h={ARRIVE.h} seed={seed} traits={traits} k={k} ink={2.2} turn={tq < 1.95 ? 0.4 : 0} />;
};

/** The leaver: T2h stands up 5.38-5.62 and walks off to the right (5.62 on). */
const Leaver: React.FC = () => {
  const t = useTime();
  const s: Seat = {id: 't2h', x: 902, y: 1486, h: 73, t: T({hair: 'cap', hatColor: CM.brick, hairColor: H[1], coat: CM.coatOat, acc: 'tote', accColor: CM.coatMustard, coatLen: 'jacket'}), turn: [[0.9, 0.3], [2.6, 0]], ink: 2.2};
  const tq = d12(t);
  if (tq < 5.38) return <SitAt s={s} />;
  const Hs = s.h / 0.56;
  if (tq < 5.62) return <Rise x={s.x} y={s.y} h={s.h} seed={`v2s1/bank/${s.id}`} traits={{...s.t, acc: 'none'}} k={pose(t, 5.38, 5.62, ease.inOutQuad)} ink={2.2} />;
  const stepPx = 0.3 * Hs;
  const x = s.x + 0.95 * Hs * (t - 5.62);
  return <Rise x={x} y={s.y} h={s.h} seed={`v2s1/bank/${s.id}`} traits={{...s.t, acc: 'none'}} k={1} walk={{step: (x - s.x) / stepPx, view: 'rear34', right: true, stride: strideFor(stepPx, Hs, 'rear34')}} ink={2.2} />;
};

/** The child beside the parent on tread 1: shuffles along toward her 2.14-2.38 and 4.33-4.52 (two little hops). */
const Child: React.FC = () => {
  const t = useTime();
  const x0 = 402;
  const hop = (a: number, b: number) => {
    const u = clamp((d12(t) - a) / (b - a));
    return u > 0 && u < 1 ? -Math.abs(Math.sin(u * Math.PI * 2)) * 4 : 0;
  };
  const dx = -22 * go(t, 2.14, 2.38) - 16 * go(t, 4.33, 4.52);
  const s: Seat = {id: 't1d', x: x0, y: 1371, h: 36, t: T({hair: 'beanie', hatColor: CM.coatMustard, hairColor: H[4], coat: CM.box, acc: 'none', skin: CM.brickLight}), turn: [[0.3, -0.5], [1.2, 0], [2.5, -0.5], [3.3, 0]], ink: 1.6};
  return <SitAt s={s} dx={dx} dy={hop(2.14, 2.38) + hop(4.33, 4.52)} />;
};

/** The guitarist on tread 3, strumming (rests through the "..." 4.54-5.35). */
const Guitarist: React.FC = () => {
  const t = useTime();
  const s: Seat = {id: 't3d', x: 470, y: 1637, h: 93, t: T({hair: 'curls', hairColor: H[0], coat: CM.coatSlate, acc: 'none', skin: CM.brick}), turn: [[2.2, -0.2], [3.3, 0]], ink: 2.2};
  const tq = d12(t);
  const resting = tq >= 4.54 && tq < 5.35;
  // a strum on every 1/6 s (down, up), drawn at 12/s
  const strum = resting ? 0.3 : Math.round(tq * 12) % 2 === 0 ? 1 : 0;
  return <SitAt s={s} arms={{guitar: {strum}}} />;
};

// ---------------------------------------------------------------- the dogs, the pigeon (movers change z-slot by depth)

/** The trotting dog's path: in from the right edge along tread 4 (2.62-3.06), sniffs through G3 (3.06-3.34), on down
 *  the steps to the old dog (3.34-3.68), turns, sits by it (3.93-4.07). Legs at 12/s; travel every frame. */
const DOG_PATH: {t: number; x: number; y: number}[] = [
  {t: 2.62, x: 1122, y: 1716},
  {t: 3.06, x: 968, y: 1652},
  {t: 3.34, x: 960, y: 1650},
  {t: 3.68, x: 846, y: 1598},
];
function dogAt(t: number) {
  const P0 = DOG_PATH;
  if (t <= P0[0].t) return {x: P0[0].x, y: P0[0].y, moving: false, leg: 0};
  for (let i = 1; i < P0.length; i++) {
    if (t <= P0[i].t) {
      const u = (t - P0[i - 1].t) / (P0[i].t - P0[i - 1].t);
      const e = i === 2 ? u : ease.inOutSine(u);
      return {x: P0[i - 1].x + (P0[i].x - P0[i - 1].x) * e, y: P0[i - 1].y + (P0[i].y - P0[i - 1].y) * e, moving: i !== 2, leg: i};
    }
  }
  const L = P0[P0.length - 1];
  return {x: L.x, y: L.y, moving: false, leg: 9};
}
/** Which band a ground y belongs to (0 landing ... 5). */
const bandOf = (y: number) => (y < 1302 ? 0 : y < 1392 ? 1 : y < 1508 ? 2 : y < 1660 ? 3 : y < 1850 ? 4 : 5);

const TrotDog: React.FC<{band: number}> = ({band}) => {
  const t = useTime();
  if (t < 2.62) return null;
  const p = dogAt(t);
  if (bandOf(p.y) !== band) return null;
  const L = 0.62 * (p.y - 965) * 0.1 + 10; // ~0.5 m dog: 56 px on tread 4 -> 48 on tread 3
  const tq = d12(t);
  const pz = p.moving ? 'trot' : tq < 3.68 ? 'sniff' : tq < 3.93 ? 'stand' : 'sit';
  const step = p.moving ? tq * 6.5 : 0;
  const wag = tq * 3.2;
  // it turns to face the old dog (right) once it has arrived
  const right = tq >= 3.8;
  return <Dog x={p.x} y={p.y} L={L} seed="v2s1/bank/trotdog" pose={pz} step={step} wag={wag} right={right} coat={CM.brickLight} ear={CM.brickDeep} ink={1.6} />;
};

/** The old dog lying on tread 3 by its people: its head comes up when the young dog arrives (3.6), its tail goes. */
const OldDog: React.FC = () => {
  const t = useTime();
  const tq = d12(t);
  const up = tq < 3.55 ? 0.35 : 0.35 + 0.65 * pose(t, 3.55, 3.75);
  const wag = tq < 3.55 ? Math.floor(tq * 1.5) * 0.5 : tq * 4;
  return <Dog x={790} y={1618} L={66} seed="v2s1/bank/olddog" pose="lie" headUp={up} wag={wag} coat={CM.coatOat} ear={CM.leafGold} patch={CM.leafGold} ink={2.2} />;
};

/** The pigeon: flutters in from the right edge (1.10-1.42) onto tread 2, pecks, walks (2.14-2.38), takes off when the
 *  dog trots by (3.34) and leaves low to the right. */
const PIG = {land: [800, 1440] as [number, number]};
const PigeonLife: React.FC<{layer: 'ground' | 'air'}> = ({layer}) => {
  const t = useTime();
  if (t < 1.1 || t >= 3.72) return null;
  const tq = d12(t);
  const s = 26;
  if (t < 1.42) {
    if (layer !== 'air') return null;
    const u = go(t, 1.1, 1.42, ease.outCubic);
    const x = 1120 + (PIG.land[0] - 1120) * u;
    const y = 1360 + (PIG.land[1] - 1360) * u - Math.sin(u * Math.PI) * 14;
    return <Pigeon x={x} y={y} s={s} seed="v2s1/bank/pig" pose="fly" k={(tq * 5) % 1} />;
  }
  if (t >= 3.34) {
    if (layer !== 'air') return null;
    const u = go(t, 3.34, 3.72, ease.inQuad);
    const x = PIG.land[0] - 20 + 360 * u;
    const y = PIG.land[1] - 10 - 120 * u;
    return <Pigeon x={x} y={y} s={s} seed="v2s1/bank/pig" pose="fly" k={(tq * 5.5) % 1} right />;
  }
  if (layer !== 'ground') return null;
  const walkDx = -20 * go(t, 2.14, 2.38);
  const peck = Math.max(0, Math.sin(tq * 7.5)) > 0.8 ? 1 : 0;
  return <Pigeon x={PIG.land[0] + walkDx} y={PIG.land[1]} s={s} seed="v2s1/bank/pig" pose={tq < 1.5 ? 'stand' : 'peck'} k={peck} />;
};

/** A second pigeon pecking about the landing all along (small life). */
const LandingPigeon: React.FC = () => {
  const t = useTime();
  const tq = d12(t);
  const x = 300 + Math.round(Math.sin(tq * 0.9) * 2) * 6;
  const peck = Math.max(0, Math.sin(tq * 6.1 + 1)) > 0.75 ? 1 : 0;
  return <Pigeon x={x} y={1288} s={17} seed="v2s1/bank/pig2" pose="peck" k={peck} right={Math.sin(tq * 0.9) < 0} />;
};

// ---------------------------------------------------------------- the things on the steps

/** Static props per band (world px). */
const PROPS: Record<number, {parts: () => ReturnType<typeof cup>; ink: number; seed: string}[]> = {
  0: [
    {parts: () => scooter('sc', 262, 1288, 70, -4), ink: 1.6, seed: 'scooter'},
    {parts: () => [...cup('lc1', 222, 1298, 11), ...cup('lc2', 512, 1296, 11)], ink: 1.6, seed: 'lcups'},
    {parts: () => tote('lt', 1006, 1296, 0.46, CM.sage), ink: 1.6, seed: 'ltote'},
  ],
  1: [
    {parts: () => umbrella('um', 690, 1366, 92, -6), ink: 1.6, seed: 'umbrella'},
    {parts: () => [...cup('t1cu', 742, 1376, 13), ...cup('t1cu2', 600, 1352, 12)], ink: 1.6, seed: 't1cups'},
    {parts: () => jacket('t1j', 150, 1368, 0.52, CM.coatPlum, 6), ink: 1.6, seed: 't1jacket'},
    {parts: () => backpack('t1bp', 966, 1370, 0.5, CM.coatMustard, CM.brick), ink: 1.6, seed: 't1pack'},
  ],
  2: [
    {parts: () => backpack('t2bp', 128, 1478, 0.62, CM.coatPlum, CM.coatOat), ink: 2.2, seed: 't2pack'},
    {parts: () => bookOpen('t2bk', 318, 1478, 0.62, CM.brick, -10), ink: 1.6, seed: 't2book'},
    {parts: () => [...cup('t2c1', 560, 1482, 16), ...cup('t2c2', 958, 1490, 16)], ink: 1.6, seed: 't2cups'},
    {parts: () => tote('t2t', 1062, 1470, 0.62, CM.coatOat), ink: 2.2, seed: 't2tote'},
  ],
  3: [
    {parts: () => [...cloth('pc', 74, 326, 1540, 1596), ...flask('pf', 132, 1574, 30), ...cup('pc1', 178, 1580, 17), ...cup('pc2', 244, 1572, 16), ...paperBag('pb', 286, 1574, 26), ...apple('pa', 214, 1588, 5)], ink: 2.2, seed: 'picnic'},
    {parts: () => guitarCase('gc', 600, 1632, 124, CM.coatPlum, -4), ink: 2.2, seed: 'gcase'},
    {parts: () => [...bowl('db', 870, 1600, 12), ...lead('dl', 732, 1636, 0.9)], ink: 1.6, seed: 'dogbowl'},
  ],
  4: [
    {parts: () => pram('pr', 52, 1792, 128), ink: 3.4, seed: 'pram'},
    {parts: () => skateboard('sk', 652, 1806, 118, 3), ink: 2.2, seed: 'skate'},
    {parts: () => [...bookOpen('t4bk', 826, 1772, 0.95, CM.coatSlate, 8), ...cup('t4cu', 470, 1770, 24)], ink: 2.2, seed: 't4book'},
    {parts: () => tote('t4t', 300, 1790, 1.0, CM.coatMustard), ink: 3.4, seed: 't4tote'},
  ],
};

const Props: React.FC<{band: number}> = ({band}) => (
  <>
    {(PROPS[band] ?? []).map((p) => (
      <Prop key={p.seed} parts={p.parts()} ink={p.ink} seed={`v2s1/bank/${p.seed}`} />
    ))}
  </>
);

/** Leaves skittering down a tread in the canal wind (every frame; their spin drawn at 12/s). */
const Skitter: React.FC<{band: number}> = ({band}) => {
  const t = useTime();
  const conf = [
    null,
    {y: 1384, v: -38, x0: 620, s: 10, c: CM.leafGold},
    {y: 1500, v: -46, x0: 980, s: 13, c: CM.leafRust},
    {y: 1652, v: -52, x0: 420, s: 16, c: CM.coatMustard},
    {y: 1840, v: -60, x0: 760, s: 20, c: CM.leafGold},
  ][band];
  if (!conf) return null;
  const x = ((((conf.x0 + conf.v * t) % 1240) + 1240) % 1240) - 80;
  const a = Math.round(d12(t) * 12) * 37;
  const k = Math.abs(Math.cos((a * Math.PI) / 180));
  const L = conf.s;
  const w = Math.max(1.2, L * 0.2 * (0.4 + 0.6 * k));
  const cx = x;
  const cy = conf.y - 2 - Math.abs(Math.sin(t * 5)) * 3;
  const ang = (a * Math.PI) / 180;
  const ux = Math.cos(ang) * L * 0.5;
  const uy = Math.sin(ang) * L * 0.25;
  const d = `M${(cx - ux).toFixed(1)} ${(cy - uy).toFixed(1)}Q${(cx - uy * 2).toFixed(1)} ${(cy + w).toFixed(1)} ${(cx + ux).toFixed(1)} ${(cy + uy).toFixed(1)}Q${(cx + uy * 2).toFixed(1)} ${(cy - w).toFixed(1)} ${(cx - ux).toFixed(1)} ${(cy - uy).toFixed(1)}Z`;
  return <Fill d={d} color={conf.c} seed={`v2s1/bank/skit${band}`} offset={false} />;
};

// ---------------------------------------------------------------- the rows, far to near (V2S1_steps interleaves the stone)

/** Everything that sits on band k (0 = the coping + landing ... 4), drawn after that band's stone. */
export const BankRow: React.FC<{band: number}> = ({band}) => {
  if (band === 0)
    return (
      <>
        <Skitter band={0} />
        <Row seats={COPING} />
        <Props band={0} />
        <LandingPigeon />
        <Row seats={LANDING} />
      </>
    );
  if (band === 1)
    return (
      <>
        <Skitter band={1} />
        <Props band={1} />
        <Row seats={TREAD1} />
        <Child />
      </>
    );
  if (band === 2)
    return (
      <>
        <Skitter band={2} />
        <Props band={2} />
        <PigeonLife layer="ground" />
        <Arrival />
        <Row seats={TREAD2} />
        <CupPass />
        <Leaver />
      </>
    );
  if (band === 3)
    return (
      <>
        <Skitter band={3} />
        <Props band={3} />
        <Puffs x={136} y={1542} seed="v2s1/bank/flasksteam" kind="steam" scale={0.26} drift={-8} />
        <OldDog />
        <TrotDog band={3} />
        <Row seats={TREAD3} />
        <Guitarist />
        <Stretcher />
      </>
    );
  if (band === 4)
    return (
      <>
        <Skitter band={4} />
        <Props band={4} />
        <TrotDog band={4} />
        <Row seats={TREAD4} />
      </>
    );
  return null;
};

/** The bike leaning on its stand, cut by the bottom-right (on the near tread, behind the near row). */
export const NearBike: React.FC = () => <Prop parts={bike('bk', 1000, 1934, 96, -1)} ink={4.8} seed="v2s1/bank/bike" off={[2.5, 1.5]} />;

/** The near head-backs, cut by the frame bottom across the full width (ink 4.8: the front of the depth ladder). */
export const NearRow: React.FC = () => {
  const t = useTime();
  return (
    <>
      {NEAR.map((n) => (
        <NearBack key={n.id} x={n.x} y={1920} hv={n.hv} seed={`v2s1/bank/${n.id}`} traits={n.t} model={(n.t as {scarf?: string}).scarf ? {scarf: (n.t as {scarf?: string}).scarf} : undefined} turn={n.turn ? keyed(t, n.turn) : undefined} ink={4.8} />
      ))}
    </>
  );
};

/** Flyers over the steps (drawn last on our bank). */
export const BankAir: React.FC = () => <PigeonLife layer="air" />;

/** For the review: every seat (id, x, seat y, h) of the layout. */
export const BANK_SEATS = {COPING, LANDING, TREAD1, TREAD2, TREAD3, TREAD4, NEAR};
