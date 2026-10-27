// V2S3_tLife.tsx (lane L3, V2S3 FAR helper): the life of her bank, WORLD px at the 12.98 match, film seconds.
//   S3Path        her towpath in front of the terrace (paving, coping, rings, bollards, a bench under the tree, a bin,
//                 the LIT heritage lamp) with walkers both ways (K4, ~100-112 px, feet honest: steps = distance /
//                 step length on the 12 drawings/s clock), a dog on a lead, a cyclist heading west
//   S3Inside      what stands INSIDE the lit neighbours' windows (behind the glazing bars): the watering neighbour, the
//                 kettle neighbour
//   S3Outside     what reaches OUT of them (in front): the watering can that tips and drips, the kettle's steam
//   S3RoofLife    birds on the aerials (one lifts and flies west, under the ceiling 582), pigeons on the parapet,
//                 a chimney's smoke clamped at 582-600, the balcony's string lights twinkling
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Paint, frac} from '../kit/canal/core';
import {Towpath, Lamp, bollardInto} from '../kit/canal/towpath';
import {Birds, Pigeons, Puffs, StringLights} from '../kit/canal/life';
import {Person, strideFor, drawn, TraitOverrides} from '../kit/cast';
import {S3_START} from './V2S3_rig';
import {Batch, TK, binInto, line, ovalPath, leafPath, rng, P, lerp} from './V2S3_tParts';

const PATH = {top: 1100, edge: 1130} as const;

// ---------------------------------------------------------------- walkers (feet honest)

type WalkerSpec = {seed: string; x: number; v: number; y: number; h: number; stepPx: number; traits?: TraitOverrides; phase?: number; enter?: number};

/** Where a walker is at film t (x moves every frame; the pose steps on the 12 drawings/s clock). */
const walkerX = (w: WalkerSpec, t: number) => w.x + w.v * (t - (w.enter ?? S3_START));

const Walker: React.FC<{w: WalkerSpec}> = ({w}) => {
  const t = useTime();
  if (w.enter !== undefined && t < w.enter) return null;
  const tq = drawn(t, 12);
  const step = (w.phase ?? 0) + (Math.abs(w.v) * (tq - (w.enter ?? S3_START))) / w.stepPx;
  return <Person x={walkerX(w, t)} y={w.y} h={w.h} exact seed={w.seed} traits={w.traits} pose="walk" view="profile" flip={w.v > 0} step={step} stride={strideFor(w.stepPx, w.h, 'profile')} />;
};

export const WALKERS: WalkerSpec[] = [
  // westbound (screen left): a man with a backpack, an older woman with a tote (slow)
  {seed: 's3w/back', x: 902, v: -66, y: 1117, h: 112, stepPx: 41, traits: {acc: 'backpack', coat: CM.coatSlate, hair: 'short', coatLen: 'jacket'}, phase: 0.3},
  {seed: 's3w/tote', x: 684, v: -44, y: 1121, h: 102, stepPx: 31, traits: {acc: 'tote', coat: CM.coatMustard, hair: 'bun', hairColor: CM.hair[3], coatLen: 'mid'}, phase: 1.1},
  // eastbound (screen right): a dog walker (the dog trots ahead on a lead)
  {seed: 's3w/dog', x: 236, v: 58, y: 1123, h: 106, stepPx: 37, traits: {acc: 'scarf', coat: CM.coatPlum, hair: 'beanie', hatColor: CM.coatMustard, coatLen: 'jacket'}, phase: 0.6},
];

/** The cyclist: heading west from the right edge (rider + bike, K4 'cycle'). */
const CYCLIST = {seed: 's3w/bike', enter: 13.32, x: 1190, v: -280, y: 1124, h: 116} as const;

const Cyclist: React.FC = () => {
  const t = useTime();
  if (t < CYCLIST.enter) return null;
  const x = CYCLIST.x + CYCLIST.v * (t - CYCLIST.enter);
  if (x < -120) return null;
  return <Person x={x} y={CYCLIST.y} h={CYCLIST.h} exact seed={CYCLIST.seed} traits={{coat: CM.brick, hair: 'cap', hatColor: CM.coatSlate, acc: 'backpack', accColor: CM.coatOat}} pose="cycle" view="profile" pedal={1.3} />;
};

/** The dog ahead of the dog walker: a small terrier trotting on a lead (legs step at 12 drawings/s, the body bobs,
 *  the tail wags every frame). Profile facing east (right), like its walker. */
const Dog: React.FC<{w: WalkerSpec}> = ({w}) => {
  const t = useTime();
  const x = walkerX(w, t) + 62;
  const y = w.y + 1;
  const tq = drawn(t, 12);
  const ph = tq * 12.5;
  const b = new Batch();
  const col = CM.coatOat;
  const dark = CM.line;
  const bob = Math.abs(Math.sin(ph)) * 1.4;
  const sh = 27; // shoulder height
  const by = y - sh * 0.62 - bob;
  // legs: a trot (diagonal pairs move together), far legs in the darker coat
  const legs: [number, number, string][] = [[-15, 1, dark], [12, -1, dark], [-11, -1, col], [16, 1, col]];
  for (const [lx, s, c] of legs) {
    const sw = Math.sin(ph) * s * 5;
    b.poly(c, [[x + lx - 2.2, by + 2], [x + lx + 2.4, by + 2], [x + lx + 2 + sw, y - 1], [x + lx - 2 + sw, y - 1]]);
    b.rect(c, x + lx - 2.4 + sw, y - 2.4, 5.4, 2.4);
  }
  // body, chest, the head with a snout and a dark ear, the tail up
  b.fill(col, `M${P(x - 19, by - 3)}Q${P(x - 4, by - 11)} ${P(x + 16, by - 8)}Q${P(x + 23, by - 2)} ${P(x + 18, by + 7)}Q${P(x, by + 10)} ${P(x - 18, by + 6)}Z`);
  const hx = x + 22;
  const hy = by - 13 - bob * 0.3;
  b.fill(col, ovalPath(hx, hy, 7.5, 6.8));
  b.fill(col, `M${P(hx + 3, hy - 2)}L${P(hx + 13, hy + 1)}L${P(hx + 12, hy + 5)}L${P(hx + 2, hy + 5)}Z`);
  b.fill(CM.anchor, ovalPath(hx + 12.6, hy + 1.6, 1.8, 1.6));
  b.fill(dark, `M${P(hx - 4, hy - 5)}Q${P(hx - 7, hy + 2)} ${P(hx - 2, hy + 6)}L${P(hx + 1, hy - 4)}Z`);
  b.fill(col, `M${P(x + 14, by - 6)}L${P(hx - 2, hy + 2)}L${P(hx + 3, hy + 6)}L${P(x + 21, by + 2)}Z`);
  const wag = Math.sin(t * 15) * 4;
  b.ink(`M${P(x - 18, by - 2)}Q${P(x - 25, by - 10)} ${P(x - 22 + wag, by - 19)}`, 3, col);
  b.rect(CM.coatMustard, hx - 7, hy + 4, 4, 6);
  b.ink(`M${P(x - 19, by - 3)}Q${P(x - 4, by - 11)} ${P(x + 16, by - 8)}`, TK.detail, CM.ink, 0.2);
  // the lead from the walker's hand to the collar
  const hX = walkerX(w, t) + 16;
  const hY = w.y - w.h * 0.47;
  b.ink(`M${P(hX, hY)}Q${P((hX + hx - 5) / 2, hY + 14)} ${P(hx - 5, hy + 7)}`, 1.3, CM.anchor);
  return <Paint b={b} seed="s3dog" misreg={false} />;
};

/** A London towpath bench seen from the canal: cast-iron ends with scrolled arms, a slatted back behind the seat. */
function benchFrontInto(b: Batch, x: number, y: number, w: number) {
  const seatY = y - 22;
  // the shade under the seat on the paving
  b.poly(CM.stoneShade, [[x - w / 2 + 4, y - 1], [x + w / 2 + 2, y - 1], [x + w / 2 + 12, y + 3], [x - w / 2 + 12, y + 3]]);
  // the back: three slats with gaps (the far side), then the seat's front rail
  for (let k = 0; k < 3; k++) b.rect(CM.line, x - w / 2 + 6, seatY - 30 + k * 8, w - 12, 5.4);
  b.rect(CM.shadeWarm, x - w / 2 + 6, seatY - 4, w - 12, 4);
  b.rect(CM.line, x - w / 2 + 2, seatY, w - 4, 6.5);
  // the iron ends: a leg, an arm scroll
  for (const s of [-1, 1]) {
    const ex = x + s * (w / 2 - 6);
    b.poly(CM.anchor, [[ex - 3, seatY - 32], [ex + 3, seatY - 32], [ex + 3 + s * 2, y], [ex - 3 + s * 2, y]]);
    b.rect(CM.anchor, ex - s * 2 - 6, seatY - 14, 12, 3.2);
    b.fill(CM.anchor, ovalPath(ex + s * 6, seatY - 13, 3.6, 3.6));
  }
  // a takeaway cup and a folded newspaper on the seat
  b.rect(CM.paper, x - 30, seatY - 10, 7, 10);
  b.rect(CM.brick, x - 30, seatY - 7, 7, 3);
  b.poly(CM.paper, [[x + 10, seatY], [x + 34, seatY], [x + 30, seatY - 5], [x + 14, seatY - 5]]);
  b.ink(line(x - w / 2 + 4, seatY - 30, x + w / 2 - 4, seatY - 30, {seed: 'benchTop', over: 'small'}) + line(x - w / 2, seatY, x + w / 2, seatY, {seed: 'benchSeat', over: 'small'}), TK.detail);
}

// ---------------------------------------------------------------- the towpath and its furniture

function furnitureBatch(): Batch {
  const b = new Batch();
  // a towpath bench under the tree, facing the canal; a takeaway cup and a folded paper on it
  benchFrontInto(b, 112, PATH.edge - 8, 104);
  // bollards on the coping, a bin, mooring rings
  bollardInto(b, 262, PATH.edge - 4, 17, 'bol1');
  bollardInto(b, 652, PATH.edge - 4, 17, 'bol2');
  bollardInto(b, 1118, PATH.edge - 4, 17, 'bol3');
  binInto(b, 948, PATH.edge - 9, 32, CM.anchor);
  // leaves drifted against the railings' foot
  const r = rng('s3pathLeaves');
  for (let i = 0; i < 22; i++) {
    const x = r.range(-60, 1170);
    b.fill(r.pick([CM.leafGold, CM.leafRust, CM.coatMustard]), leafPath(x, PATH.top + r.range(2, 12), r.range(7, 11), 3, r.range(-30, 30)));
  }
  return b;
}

export const S3Path: React.FC = () => {
  const furn = useMemo(furnitureBatch, []);
  return (
    <>
      <Towpath x0={-80} x1={1180} top={PATH.top} edge={PATH.edge} seed="s3herpath" leaves={12} ink={TK.struct} rings={[180, 420, 560, 830, 1060]} coping={9} />
      <Paint b={furn} seed="s3path/furn" />
      <Lamp x={986} y={PATH.edge - 6} h={252} seed="s3lamp" on pool={0} />
      <Walker w={WALKERS[1]} />
      <Walker w={WALKERS[0]} />
      <Walker w={WALKERS[2]} />
      <Dog w={WALKERS[2]} />
      <Cyclist />
    </>
  );
};

// ---------------------------------------------------------------- the neighbours

/** The watering neighbour (stock-brick house, first floor, window h2a: x 566-632, y 708-844, lower sash up 30). */
const WATER = {x: 606, sill: 844, t0: 13.3, t1: 14.36} as const;
/** The kettle neighbour (painted house, first floor, window h4a: x 1036-1098, y 710-844). */
const KETTLE = {x: 1072, sill: 844} as const;

/** The watering can's tip 0..1: tips over 0.25 s, pours, rights itself. */
const tipAt = (t: number) => {
  if (t < WATER.t0 || t > WATER.t1) return 0;
  const a = Math.min(1, (t - WATER.t0) / 0.25);
  const c = Math.min(1, (WATER.t1 - t) / 0.25);
  const k = Math.min(a, c);
  return k * k * (3 - 2 * k) + Math.sin(t * 9) * 0.04 * Math.min(a, c);
};

/** Busts behind the glazing (drawn between the panes and the sashes): the kettle neighbour at the counter. */
export const S3Inside: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  const sw = Math.sin(t * 2.1) * 1.2;
  const hx = KETTLE.x + sw;
  const hy = 784;
  b.poly(CM.coatMustard, [[hx - 20, KETTLE.sill], [hx - 17, hy + 18], [hx - 5, hy + 12], [hx + 7, hy + 12], [hx + 17, hy + 18], [hx + 20, KETTLE.sill]]);
  b.fill(CM.hair[4], ovalPath(hx, hy, 9, 10));
  b.fill(CM.hair[4], ovalPath(hx + 5, hy - 8, 4.4, 4));
  // the kettle on the counter
  b.fill(CM.paper, ovalPath(hx - 17, KETTLE.sill - 8, 6.5, 5.5));
  b.rect(CM.anchor, hx - 20, KETTLE.sill - 15, 6, 2.6);
  return <Paint b={b} seed="s3inside" misreg={false} />;
};

/** Out of the windows (in front): the watering neighbour leaning out of the raised sash with a can that tips and
 *  drips into the box; the kettle's steam out of the lowered top sash. */
export const S3Outside: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  const tip = tipAt(t);
  {
    // the neighbour leans out a little further as the can tips
    const lean = tip * 3;
    const hx = WATER.x + 8 - lean;
    const hy = 806 + lean * 0.5;
    b.poly(CM.sage, [[hx - 22, WATER.sill + 1], [hx - 18, hy + 14], [hx - 6, hy + 9], [hx + 8, hy + 9], [hx + 19, hy + 14], [hx + 22, WATER.sill + 1]]);
    b.fill(CM.hair[2], ovalPath(hx, hy, 9, 9.6));
    b.fill(CM.hair[2], ovalPath(hx + 5, hy - 7, 4, 3.8));
    b.fill(CM.brickLight, ovalPath(hx - 7, hy + 3, 2.2, 2.6));
    // the arm out to the can over the box's west half
    const sh: [number, number] = [hx - 12, hy + 17];
    const hand: [number, number] = [hx - 16 - tip * 2, hy + 16 - tip * 2];
    b.ink(`M${P(sh[0], sh[1])}Q${P(sh[0] - 8, sh[1] + 8)} ${P(hand[0], hand[1])}`, 6, CM.sage);
    b.fill(CM.brickLight, ovalPath(hand[0], hand[1], 3, 2.8));
    const a = (-6 - 40 * tip) * (Math.PI / 180);
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const rot = (x: number, y: number): [number, number] => [hand[0] + x * ca - y * sa, hand[1] + x * sa + y * ca];
    b.poly(CM.coatSlate, [rot(2, -2), rot(-18, -2), rot(-18, 12), rot(2, 12)]);
    b.poly(CM.shadeCool, [rot(-18, 8), rot(2, 8), rot(2, 12), rot(-18, 12)]);
    const sp0 = rot(-17, 3);
    const sp1 = rot(-32, -6);
    b.ink(`M${P(sp0[0], sp0[1])}L${P(sp1[0], sp1[1])}`, 2.6, CM.coatSlate);
    b.fill(CM.coatSlate, ovalPath(sp1[0], sp1[1], 2.6, 2.2));
    b.ink(`M${P(rot(1, -2)[0], rot(1, -2)[1])}Q${P(rot(-8, -13)[0], rot(-8, -13)[1])} ${P(rot(-16, -2)[0], rot(-16, -2)[1])}`, 1.6, CM.coatSlate);
    // drops fall from the rose into the plants while it pours
    if (tip > 0.5) {
      for (let k = 0; k < 5; k++) {
        const u = frac(t * 4.6 + k * 0.2);
        const dx = sp1[0] - 2 + (k % 3) * 2.4 - u * 1.5;
        const dy = sp1[1] + 3 + u * (852 - sp1[1]);
        b.fill(CM.paper, ovalPath(dx, dy, 1.6, 3.2));
      }
    }
  }
  // the kettle window's lowered top sash: the gap the steam comes out of
  b.rect(CM.shadeWarm, 1037, 712, 60, 5);
  return (
    <>
      <Paint b={b} seed="s3outside" misreg={false} />
      <Puffs x={1056} y={714} seed="s3kettle" kind="steam" scale={0.72} ceil={590} drift={-26} />
      <Puffs x={1070} y={716} seed="s3kettleB" kind="steam" scale={0.56} ceil={590} drift={-16} />
    </>
  );
};

// ---------------------------------------------------------------- roofs: birds, pigeons, smoke, string lights

export const S3RoofLife: React.FC = () => (
  <>
    <Puffs x={773} y={604} seed="s3chim" kind="smoke" scale={0.5} ceil={583} drift={-44} />
    <Birds from={[506, 604]} to={[532, 604]} n={3} size={9} seed="s3birdsA" liftAt={[13.8]} dir={-1} ceil={584} />
    <Birds from={[171, 603]} to={[196, 603]} n={2} size={9} seed="s3birdsB" />
    <Birds from={[1006, 603]} to={[1032, 603]} n={2} size={9} seed="s3birdsC" liftAt={[14.3]} dir={-1} ceil={584} />
    <Pigeons ledge={[600, 720, 640]} n={2} size={15} seed="s3pig" shuffleAt={[13.6]} />
    <StringLights from={[830, 827]} to={[954, 825]} sag={9} n={12} r={3.2} seed="s3slA" on w={1.2} />
    <StringLights from={[842, 708]} to={[936, 708]} sag={7} n={9} r={2.8} seed="s3slB" on w={1.2} />
    <StringLights from={[58, 946]} to={[166, 968]} sag={11} n={8} r={3} seed="s3slG" on w={1.2} />
    <StringLights from={[-70, 930]} to={[44, 944]} sag={10} n={8} r={3} seed="s3slH" on w={1.2} />
  </>
);

export {lerp, line};
