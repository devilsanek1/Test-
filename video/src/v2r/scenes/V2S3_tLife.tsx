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
import {Towpath, Lamp, benchInto, bollardInto} from '../kit/canal/towpath';
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

/** The dog ahead of the dog walker: a small trotting dog on a lead (legs step at 12 drawings/s). */
const Dog: React.FC<{w: WalkerSpec}> = ({w}) => {
  const t = useTime();
  const x = walkerX(w, t) + 64;
  const y = w.y + 1;
  const tq = drawn(t, 12);
  const g = Math.sin(tq * 13);
  const b = new Batch();
  const col = CM.coatOat;
  const H = 22;
  const L = 34;
  const bob = Math.abs(Math.sin(tq * 13)) * 1.2;
  const by = y - H * 0.62 - bob;
  // legs (two pairs, scissoring)
  for (const [lx, s] of [[x - L * 0.3, 1], [x + L * 0.28, -1]] as const) {
    b.poly(CM.line, [[lx - 2, by + 3], [lx + 2, by + 3], [lx + 2 + g * s * 4, y], [lx - 2 + g * s * 4, y]]);
    b.poly(col, [[lx - 2.2, by + 2], [lx + 2.2, by + 2], [lx + 2.2 - g * s * 4, y], [lx - 2.2 - g * s * 4, y]]);
  }
  b.fill(col, ovalPath(x, by, L * 0.48, H * 0.3));
  b.fill(col, ovalPath(x + L * 0.5, by - H * 0.3, H * 0.27, H * 0.24));
  b.fill(CM.line, ovalPath(x + L * 0.44, by - H * 0.42, 3.4, 5.2));
  b.fill(col, `M${P(x + L * 0.62, by - H * 0.3)}L${P(x + L * 0.82, by - H * 0.24)}L${P(x + L * 0.64, by - H * 0.16)}Z`);
  b.ink(`M${P(x - L * 0.46, by - 2)}Q${P(x - L * 0.62, by - H * 0.5 + Math.sin(t * 14) * 3)} ${P(x - L * 0.54, by - H * 0.72)}`, 2.2, col);
  b.rect(CM.coatMustard, x + L * 0.36, by - H * 0.18, 3, 5);
  // the lead from the walker's hand to the collar
  const hx = walkerX(w, t) + 14;
  const hy = w.y - w.h * 0.46;
  b.ink(`M${P(hx, hy)}Q${P((hx + x + L * 0.4) / 2, hy + 18)} ${P(x + L * 0.4, by - H * 0.14)}`, 1.2, CM.anchor);
  b.ink(`M${P(x - L * 0.46, by)}Q${P(x, by - H * 0.36)} ${P(x + L * 0.62, by - H * 0.42)}`, TK.detail, CM.ink, 0.3);
  return <Paint b={b} seed="s3dog" misreg={false} />;
};

// ---------------------------------------------------------------- the towpath and its furniture

function furnitureBatch(): Batch {
  const b = new Batch();
  // a bench under the tree, facing the canal; a takeaway cup and a folded paper on it
  benchInto(b, 118, PATH.edge - 9, 84, 'front', 's3bench');
  b.rect(CM.paper, 88, PATH.edge - 9 - 84 * 0.42 * 0.55 - 9, 7, 9);
  b.rect(CM.line, 88, PATH.edge - 9 - 84 * 0.42 * 0.55 - 6, 7, 2.4);
  b.rect(CM.paper, 132, PATH.edge - 9 - 84 * 0.42 * 0.55 - 3, 18, 3);
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

/** Busts behind the glazing (drawn between the panes and the sashes). */
export const S3Inside: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  // the watering neighbour leans toward the open sash as the can tips
  {
    const lean = tipAt(t) * 4;
    const hx = WATER.x - lean;
    const hy = 770 + lean * 0.6;
    b.poly(CM.coatPlum, [[hx - 26, WATER.sill], [hx - 22, hy + 22], [hx - 8, hy + 14], [hx + 10, hy + 14], [hx + 22, hy + 22], [hx + 26, WATER.sill]]);
    b.fill(CM.hair[2], ovalPath(hx, hy, 11, 12));
    b.fill(CM.hair[2], ovalPath(hx + 6, hy - 9, 5, 4.6));
    b.fill(CM.brickLight, ovalPath(hx - 2, hy + 12, 3.4, 3));
  }
  // the kettle neighbour at the counter, swaying a hair, looking down at the kettle
  {
    const sw = Math.sin(t * 2.1) * 1.2;
    const hx = KETTLE.x + sw;
    const hy = 778;
    b.poly(CM.coatSlate, [[hx - 24, KETTLE.sill], [hx - 20, hy + 20], [hx - 6, hy + 13], [hx + 8, hy + 13], [hx + 21, hy + 20], [hx + 24, KETTLE.sill]]);
    b.fill(CM.hair[0], ovalPath(hx, hy, 10.5, 11.5));
    b.fill(CM.paper, ovalPath(hx - 18, KETTLE.sill - 9, 7, 6));
    b.rect(CM.anchor, hx - 21, KETTLE.sill - 16, 6, 3);
  }
  return <Paint b={b} seed="s3inside" misreg={false} />;
};

/** The can and its drops, the kettle's steam (in front of the windows). */
export const S3Outside: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  const tip = tipAt(t);
  // the arm out of the open lower sash, the can over the box's left half
  {
    const sh: [number, number] = [WATER.x - 10, 826];
    const hand: [number, number] = [WATER.x - 24 - tip * 4, 834 - tip * 2];
    b.ink(`M${P(sh[0], sh[1])}L${P(hand[0], hand[1])}`, 6, CM.coatPlum);
    const a = (-8 - 38 * tip) * (Math.PI / 180);
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const rot = (x: number, y: number): [number, number] => [hand[0] + x * ca - y * sa, hand[1] + x * sa + y * ca];
    const body = [rot(-2, -4), rot(-16, -4), rot(-16, 7), rot(-2, 7)];
    b.poly(CM.coatSlate, body);
    const sp0 = rot(-15, 0);
    const sp1 = rot(-27, -6);
    b.ink(`M${P(sp0[0], sp0[1])}L${P(sp1[0], sp1[1])}`, 2.2, CM.coatSlate);
    b.ink(`M${P(rot(-4, -4)[0], rot(-4, -4)[1])}Q${P(rot(-9, -12)[0], rot(-9, -12)[1])} ${P(rot(-14, -4)[0], rot(-14, -4)[1])}`, 1.4, CM.coatSlate);
    // drops fall from the spout to the plants while it pours
    if (tip > 0.55) {
      for (let k = 0; k < 4; k++) {
        const u = frac(t * 5.5 + k * 0.25);
        const dx = sp1[0] - 1 - u * 2 + (k % 2) * 2;
        const dy = sp1[1] + 2 + u * (852 - sp1[1]);
        b.fill(CM.glass, ovalPath(dx, dy, 1.4, 2.4));
      }
    }
  }
  // the kettle window's lowered top sash: the gap the steam comes out of
  b.rect(CM.shadeWarm, 1037, 712, 60, 5);
  return (
    <>
      <Paint b={b} seed="s3outside" misreg={false} />
      <Puffs x={1060} y={712} seed="s3kettle" kind="steam" scale={0.62} ceil={584} drift={-30} />
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
    <Pigeons ledge={[600, 720, 628]} n={2} size={15} seed="s3pig" shuffleAt={[13.6]} />
    <StringLights from={[830, 827]} to={[954, 825]} sag={9} n={12} r={3.2} seed="s3slA" on w={1.2} />
    <StringLights from={[842, 708]} to={[936, 708]} sag={7} n={9} r={2.8} seed="s3slB" on w={1.2} />
  </>
);

export {lerp, line};
