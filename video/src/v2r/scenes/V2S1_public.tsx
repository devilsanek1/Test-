// V2S1 helper (lane L1, our bank): the small seated public on the step by the water and the THINGS on our steps
// (docs/v2/lanes/conform_L1.md §4-§6; DIRECTION rule 3: no stranger's back in the foreground, only things there).
//   LowRow     tier B: seven small seated backs on the landing by the water (seat line ~1290, ~60 px), half at rest,
//              no two alike, never teal, no dark bun or long dark coat anywhere (her look-alike rule); two slow head
//              turns, no pops, nothing near a beat.
//   Things     tier C: a tote, two takeaway cups, a folded newspaper, a scarf left on a step, a backpack, a flask, a
//              bike cut by the bottom-right, a planter of grasses cut by the left edge, a few fallen leaves. Flat shapes
//              in two tones; lines only where the stroke IS the thing (the bike's frame and wheels, a handle).
//   their light: contact + cast footprints for S1Steps' ShadowLayer (FOOT), so every thing sits on the stone.
import React from 'react';
import {useTime, clamp, ease} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {CM} from '../palette';
import {floodAt} from './V2S1_clock';
import {Seated, castRow, pin} from '../kit/cast';
import type {TraitOverrides} from '../kit/cast';

type Pt = [number, number];
const r1 = (n: number) => Math.round(n * 10) / 10;
const poly = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`).join('') + 'Z';
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${r1(cx - rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx + rx)} ${r1(cy)}A${r1(rx)} ${r1(ry)} 0 1 0 ${r1(cx - rx)} ${r1(cy)}Z`;

// ---------------------------------------------------------------- the low row (tier B)

type Sitter = {x: number; h: number; traits: TraitOverrides; turns?: [number, number][]; lean?: number};
/** Seat line on the landing (the step by the water); Pip's bollard keeps x 610-790 clear. */
export const LOW_SEAT_Y = 1292;
export const LOW: Sitter[] = [
  {x: 64, h: 60, traits: {hair: 'beanie', hatColor: CM.coatMustard, coat: CM.coatSlate}},
  {x: 158, h: 63, traits: {hair: 'short', hairColor: CM.hair[2], coat: CM.coatOat, acc: 'tote'}, turns: [[2.62, 0.45], [4.1, 0]]},
  {x: 266, h: 58, traits: {hair: 'curls', hairColor: CM.hair[1], coat: CM.sage}},
  {x: 384, h: 61, traits: {hair: 'cap', hatColor: CM.brick, coat: CM.coatMustard, acc: 'backpack', accColor: CM.coatSlate}},
  {x: 500, h: 59, traits: {hair: 'long', hairColor: CM.hair[4], coat: CM.brickLight}, lean: -3},
  {x: 872, h: 62, traits: {hair: 'hood', hatColor: CM.stoneShade, coat: CM.stoneShade}, turns: [[3.62, -0.4], [5.05, 0]]},
  {x: 986, h: 60, traits: {hair: 'short', hairColor: CM.hair[3], coat: CM.leafRust, acc: 'scarf', accColor: CM.coatOat}},
];

function keyed(t: number, keys: [number, number][] | undefined, dur = 0.5): number {
  let v = 0;
  let from = 0;
  for (const [at, to] of keys ?? []) {
    if (t < at) break;
    v = from + (to - from) * ease.inOutSine(clamp((t - at) / dur));
    from = to;
  }
  return v;
}

export const LowRow: React.FC = () => {
  const t = useTime();
  const traits = castRow('v2s1/low2', LOW.length, {over: LOW.map((s) => s.traits)});
  return (
    <>
      {LOW.map((s, i) => (
        <Seated key={i} x={s.x} y={LOW_SEAT_Y} h={s.h} seed={`v2s1/low2/${i}`} traits={{...pin(traits[i]), ...s.traits}} turn={keyed(t, s.turns)} lean={s.lean} ink={0} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- the things (tier C)

/** Every thing's footprint on the stone (x centre, base y, width, height) for its contact and cast shadows. */
export type Foot = {x: number; y: number; w: number; h: number; cast?: boolean};
export const FOOT: Foot[] = [
  ...LOW.map((s) => ({x: s.x, y: LOW_SEAT_Y + 2, w: s.h * 0.62, h: s.h, cast: true})),
  {x: 212, y: 1486, w: 52, h: 58, cast: true}, // tote
  {x: 470, y: 1384, w: 18, h: 26, cast: true}, // cup A
  {x: 908, y: 1642, w: 26, h: 38, cast: true}, // cup B
  {x: 336, y: 1622, w: 120, h: 6}, // newspaper
  {x: 392, y: 1500, w: 150, h: 8}, // scarf
  {x: 882, y: 1492, w: 60, h: 66, cast: true}, // backpack
  {x: 1006, y: 1478, w: 20, h: 54, cast: true}, // flask
  {x: 980, y: 1912, w: 260, h: 230, cast: true}, // bike
  {x: 84, y: 1918, w: 250, h: 300, cast: true}, // planter
  {x: 262, y: 1380, w: 40, h: 8}, // book
  {x: 568, y: 1482, w: 70, h: 24, cast: true}, // flowers
  {x: 660, y: 1640, w: 130, h: 12}, // skateboard
  {x: 118, y: 1636, w: 120, h: 14}, // jacket
  {x: 352, y: 1812, w: 230, h: 10}, // picnic cloth
  {x: 300, y: 1792, w: 64, h: 48, cast: true}, // basket
  {x: 610, y: 1820, w: 190, h: 30, cast: true}, // guitar case
  {x: 728, y: 1486, w: 62, h: 40, cast: true}, // coffee carrier
  {x: 792, y: 1640, w: 44, h: 64, cast: true}, // potted plant
  {x: 842, y: 1378, w: 96, h: 10}, // umbrella
  {x: 432, y: 1800, w: 40, h: 34, cast: true}, // thermos + mugs
];

const Tote: React.FC = () => {
  const x = 212;
  const y = 1486;
  return (
    <>
      <Fill d={poly([[x - 24, y - 50], [x + 24, y - 50], [x + 27, y], [x - 27, y]])} color={CM.coatOat} seed="bank/tote" offset={false} />
      <Fill d={poly([[x - 25, y - 30], [x + 25, y - 30], [x + 26, y - 22], [x - 26, y - 22]])} color={CM.sage} seed="bank/toteBand" offset={false} />
      <Ink d={`M${x - 13} ${y - 50}Q${x} ${y - 74} ${x + 13} ${y - 50}`} width={2} color={CM.line} thing at={floodAt(x, y)} seed="bank/toteH" />
    </>
  );
};

const Cup: React.FC<{x: number; y: number; h: number; k: string}> = ({x, y, h, k}) => {
  const w = h * 0.62;
  return (
    <>
      <Fill d={poly([[x - w / 2, y - h], [x + w / 2, y - h], [x + w * 0.38, y], [x - w * 0.38, y]])} color={CM.paper} seed={`bank/${k}`} offset={false} />
      <Fill d={poly([[x - w * 0.47, y - h * 0.66], [x + w * 0.47, y - h * 0.66], [x + w * 0.43, y - h * 0.34], [x - w * 0.43, y - h * 0.34]])} color={CM.brick} seed={`bank/${k}s`} offset={false} />
      <Fill d={poly([[x - w * 0.54, y - h * 1.08], [x + w * 0.54, y - h * 1.08], [x + w * 0.5, y - h * 0.96], [x - w * 0.5, y - h * 0.96]])} color={CM.line} seed={`bank/${k}l`} offset={false} />
    </>
  );
};

const Newspaper: React.FC = () => {
  const x = 336;
  const y = 1622;
  return (
    <>
      <Fill d={poly([[x - 64, y - 4], [x + 52, y - 12], [x + 64, y + 2], [x - 52, y + 8]])} color={CM.paper} seed="bank/paper" offset={false} />
      <Fill d={poly([[x - 6, y - 8], [x + 4, y - 9], [x + 10, y + 5], [x, y + 6]])} color={CM.limestone} seed="bank/paperFold" offset={false} />
    </>
  );
};

const Scarf: React.FC = () => {
  const x = 392;
  const y = 1500;
  return <Fill d={`M${x - 74} ${y - 4}C${x - 34} ${y - 18} ${x + 8} ${y + 10} ${x + 52} ${y - 5}L${x + 72} ${y + 5}C${x + 26} ${y + 20} ${x - 18} ${y - 5} ${x - 68} ${y + 9}Z`} color={CM.coatMustard} seed="bank/scarf" offset={false} />;
};

const Backpack: React.FC = () => {
  const x = 882;
  const y = 1492;
  return (
    <>
      <Fill d={`M${x - 28} ${y}L${x - 30} ${y - 44}Q${x - 28} ${y - 66} ${x} ${y - 66}Q${x + 28} ${y - 66} ${x + 30} ${y - 44}L${x + 28} ${y}Z`} color={CM.coatSlate} seed="bank/pack" offset={false} />
      <Fill d={poly([[x - 24, y - 40], [x + 24, y - 40], [x + 22, y - 30], [x - 22, y - 30]])} color={CM.stoneShade} seed="bank/packFlap" offset={false} />
    </>
  );
};

const Flask: React.FC = () => {
  const x = 1006;
  const y = 1478;
  return (
    <>
      <Fill d={poly([[x - 9, y - 46], [x + 9, y - 46], [x + 9, y], [x - 9, y]])} color={CM.sage} seed="bank/flask" offset={false} />
      <Fill d={poly([[x - 7, y - 54], [x + 7, y - 54], [x + 7, y - 46], [x - 7, y - 46]])} color={CM.coatSlate} seed="bank/flaskCap" offset={false} />
    </>
  );
};

/** The bike leaning on the near tread, cut by the bottom and right edges: its frame and wheels ARE lines (things). */
const Bike: React.FC = () => {
  const R = 122;
  const wy = 1912 - R;
  const ax = 860;
  const bx = 1150;
  const crank: Pt = [1000, wy + 6];
  const seat: Pt = [948, wy - 132];
  const bar: Pt = [1088, wy - 150];
  // a tyre: a filled ring (outer one way, inner the other: the nonzero rule leaves the hole), never a wire circle
  const tyre = (cx: number, r: number) =>
    `M${cx - R} ${wy}A${R} ${R} 0 1 0 ${cx + R} ${wy}A${R} ${R} 0 1 0 ${cx - R} ${wy}Z` +
    `M${cx - r} ${wy}A${r} ${r} 0 1 1 ${cx + r} ${wy}A${r} ${r} 0 1 1 ${cx - r} ${wy}Z`;
  const frame = `M${ax} ${wy}L${crank[0]} ${crank[1]}L${seat[0]} ${seat[1] + 14}L${ax} ${wy}M${crank[0]} ${crank[1]}L${bar[0] - 14} ${bar[1] + 30}L${seat[0]} ${seat[1] + 14}M${bar[0] - 14} ${bar[1] + 30}L${bx} ${wy}`;
  return (
    <>
      <Fill d={tyre(ax, R - 10) + tyre(bx, R - 10)} color={CM.coatSlate} seed="bank/bikeT" offset={false} />
      <Fill d={ell(ax, wy, 9, 9) + ell(bx, wy, 9, 9)} color={CM.coatSlate} seed="bank/bikeHub" offset={false} />
      <Ink d={frame} width={7} color={CM.brickDeep} thing tone={CM.brickDeep} at={floodAt(1000, 1800)} seed="bank/bikeF" />
      <Ink d={`M${bar[0] - 30} ${bar[1]}L${bar[0] + 16} ${bar[1] - 6}`} width={3.4} color={CM.line} thing at={floodAt(1000, 1800)} seed="bank/bikeBar" />
      <Fill d={ell(seat[0], seat[1], 26, 8)} color={CM.coatSlate} seed="bank/bikeSeat" offset={false} />
      <Fill d={ell(crank[0], crank[1], 14, 14)} color={CM.brickDeep} seed="bank/bikeCrank" offset={false} />
    </>
  );
};

/** The planter's wood: a light warm wood (L* ~64), never a dark slab in the calm C band (critic G4). */
const PLANTER_WOOD = '#C48F70';

/** A planter of grasses cut by the left edge: a wooden box, tufts in two sages. */
const Planter: React.FC = () => {
  const x0 = -30;
  const x1 = 210;
  const y0 = 1752;
  const blades = (seed: number, color: string, k: number) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const bx = x0 + 34 + i * 34 + ((i * 37 + seed) % 11);
      const top = y0 - 90 - ((i * 53 + seed) % 50) * k;
      const lean = ((i * 29 + seed) % 31) - 15;
      d += `M${bx - 16} ${y0}C${bx - 16} ${(y0 + top) / 2} ${bx + lean - 8} ${top} ${bx + lean} ${top}C${bx + lean + 8} ${top} ${bx + 16} ${(y0 + top) / 2} ${bx + 16} ${y0}Z`;
    }
    return <Fill d={d} color={color} seed={`bank/grass${seed}`} offset={false} />;
  };
  return (
    <>
      {blades(29, CM.sage, 1.25)}
      {blades(3, CM.sage, 1)}
      {blades(17, CM.leafGold, 0.7)}
      <Fill d={poly([[x0, y0], [x1, y0], [x1, 1940], [x0, 1940]])} color={PLANTER_WOOD} seed="bank/planterBox" offset={false} />
      <Fill d={poly([[x0, y0], [x1, y0], [x1, y0 + 14], [x0, y0 + 14]])} color={CM.brickDeep} seed="bank/planterLip" offset={false} />
    </>
  );
};

/** A few fallen leaves lying on the treads: flat shapes, none on the landing by Pip. */
const LEAVES: [number, number, number, number, string][] = [
  [118, 1360, 12, 20, CM.leafGold],
  [560, 1452, 15, -30, CM.leafRust],
  [760, 1440, 14, 50, CM.leafGold],
  [148, 1580, 18, 10, CM.leafRust],
  [700, 1624, 18, -60, CM.leafGold],
  [420, 1770, 22, 35, CM.leafGold],
  [760, 1730, 22, -15, CM.leafRust],
  [330, 1452, 14, 70, CM.leafRust],
  [980, 1560, 16, -40, CM.leafGold],
  [520, 1590, 17, 20, CM.leafRust],
  [208, 1760, 20, -50, CM.leafGold],
  [700, 1880, 24, 15, CM.leafRust],
];
const Leaves: React.FC = () => {
  const d = (x: number, y: number, L: number, a: number) => {
    const r = (a * Math.PI) / 180;
    const ux = Math.cos(r) * L;
    const uy = Math.sin(r) * L * 0.5;
    return `M${r1(x - ux)} ${r1(y - uy)}Q${r1(x - uy)} ${r1(y + ux * 0.25)} ${r1(x + ux)} ${r1(y + uy)}Q${r1(x + uy)} ${r1(y - ux * 0.25)} ${r1(x - ux)} ${r1(y - uy)}Z`;
  };
  return (
    <>
      <Fill d={LEAVES.filter((l) => l[4] === CM.leafGold).map((l) => d(l[0], l[1], l[2], l[3])).join('')} color={CM.leafGold} seed="bank/leavesG" offset={false} />
      <Fill d={LEAVES.filter((l) => l[4] === CM.leafRust).map((l) => d(l[0], l[1], l[2], l[3])).join('')} color={CM.leafRust} seed="bank/leavesR" offset={false} />
    </>
  );
};

const Book: React.FC = () => {
  const x = 262;
  const y = 1380;
  return (
    <>
      <Fill d={poly([[x - 22, y - 6], [x + 18, y - 10], [x + 22, y], [x - 18, y + 4]])} color={CM.brickDeep} seed="bank/book" offset={false} />
      <Fill d={poly([[x - 19, y - 6], [x + 16, y - 9], [x + 17, y - 6], [x - 18, y - 3]])} color={CM.paper} seed="bank/bookPages" offset={false} />
    </>
  );
};

/** A bunch of autumn flowers in paper, laid on the step (a sign of care). */
const Flowers: React.FC = () => {
  const x = 568;
  const y = 1482;
  const heads = [[-26, -14, CM.box], [-14, -22, CM.coatMustard], [-2, -16, CM.box], [8, -24, CM.leafRust], [-20, -26, CM.coatMustard]] as const;
  return (
    <>
      <Fill d={poly([[x - 4, y - 10], [x + 36, y - 6], [x + 36, y + 2], [x - 4, y + 4]])} color={CM.sage} seed="bank/stems" offset={false} />
      {heads.map(([dx, dy, c], i) => (
        <Fill key={i} d={ell(x + dx, y + dy * 0.55, 9, 7)} color={c} seed={`bank/fl${i}`} offset={false} />
      ))}
      <Fill d={poly([[x - 6, y - 20], [x + 22, y - 10], [x + 22, y + 6], [x - 6, y + 8]])} color={CM.paper} seed="bank/wrap" offset={false} />
    </>
  );
};

const Skateboard: React.FC = () => {
  const x = 660;
  const y = 1640;
  return (
    <>
      <Fill d={`M${x - 64} ${y - 10}Q${x - 70} ${y - 4} ${x - 62} ${y}L${x + 62} ${y - 2}Q${x + 70} ${y - 6} ${x + 62} ${y - 12}Z`} color={CM.coatSlate} seed="bank/skate" offset={false} />
      <Fill d={ell(x - 40, y + 4, 7, 5) + ell(x + 40, y + 3, 7, 5)} color={CM.coatOat} seed="bank/skateW" offset={false} />
    </>
  );
};

const Jacket: React.FC = () => {
  const x = 118;
  const y = 1636;
  return (
    <>
      <Fill d={`M${x - 62} ${y - 6}Q${x - 30} ${y - 22} ${x + 10} ${y - 16}L${x + 60} ${y - 8}Q${x + 50} ${y + 6} ${x + 4} ${y + 6}L${x - 56} ${y + 8}Z`} color={CM.sage} seed="bank/jacket" offset={false} />
      <Fill d={`M${x + 10} ${y - 16}L${x + 60} ${y - 8}L${x + 52} ${y - 2}L${x + 8} ${y - 8}Z`} color={CM.stoneShade} seed="bank/jacketSleeve" offset={false} />
    </>
  );
};

/** A picnic cloth on the wide tread: three flat stripes, a basket with two apples beside it. */
const Picnic: React.FC = () => {
  const x0 = 240;
  const x1 = 470;
  const y0 = 1772;
  const y1 = 1818;
  const stripe = (k: number, c: string) => {
    const a = x0 + ((x1 - x0) * k) / 5;
    const b = x0 + ((x1 - x0) * (k + 1)) / 5;
    return <Fill key={k} d={poly([[a, y0], [b, y0 - 2], [b + 10, y1], [a + 10, y1 + 2]])} color={c} seed={`bank/cloth${k}`} offset={false} />;
  };
  const bx = 300;
  const by = 1792;
  return (
    <>
      {[CM.paper, CM.box, CM.paper, CM.box, CM.paper].map((c, k) => stripe(k, c))}
      <Fill d={`M${bx - 32} ${by - 30}L${bx + 32} ${by - 30}L${bx + 26} ${by}L${bx - 26} ${by}Z`} color={CM.leafGold} seed="bank/basket" offset={false} />
      <Ink d={`M${bx - 22} ${by - 30}Q${bx} ${by - 62} ${bx + 22} ${by - 30}`} width={3} color={CM.line} thing at={floodAt(bx, by)} seed="bank/basketH" />
      <Fill d={ell(bx + 52, by - 6, 9, 9) + ell(bx + 68, by - 4, 8, 8)} color={CM.brick} seed="bank/apples" offset={false} />
    </>
  );
};

/** A guitar case lying along the wide tread. */
const GuitarCase: React.FC = () => {
  const x = 610;
  const y = 1820;
  // a slate case (the plum blob did not read, critic G4): its handle on top and a pale seam along the lid
  return (
    <>
      <Fill d={`M${x + 4} ${y - 16}Q${x + 14} ${y - 32} ${x + 24} ${y - 15}L${x + 19} ${y - 15}Q${x + 14} ${y - 25} ${x + 9} ${y - 16}Z`} color={CM.coatSlate} seed="bank/guitarH" offset={false} />
      <Fill d={`M${x - 96} ${y - 6}Q${x - 98} ${y - 30} ${x - 70} ${y - 30}Q${x - 46} ${y - 30} ${x - 36} ${y - 20}L${x + 60} ${y - 14}Q${x + 96} ${y - 12} ${x + 94} ${y - 2}Q${x + 92} ${y + 8} ${x + 60} ${y + 6}L${x - 36} ${y + 6}Q${x - 46} ${y + 12} ${x - 70} ${y + 12}Q${x - 96} ${y + 12} ${x - 96} ${y - 6}Z`} color={CM.coatSlate} seed="bank/guitar" offset={false} />
      <Fill d={`M${x - 88} ${y - 4}Q${x - 60} ${y - 6} ${x - 36} ${y - 4}L${x + 84} ${y - 2}L${x + 84} ${y + 1}L${x - 36} ${y - 1}Q${x - 60} ${y - 3} ${x - 88} ${y - 1}Z`} color={CM.stoneShade} seed="bank/guitarS" offset={false} />
    </>
  );
};

/** A cardboard carrier with four takeaway cups (a round left for friends). */
const Carrier: React.FC = () => {
  const x = 728;
  const y = 1486;
  return (
    <>
      <Fill d={poly([[x - 31, y - 16], [x + 31, y - 16], [x + 28, y], [x - 28, y]])} color={CM.coatOat} seed="bank/carrier" offset={false} />
      {[-21, -7, 7, 21].map((dx, i) => (
        <React.Fragment key={i}>
          <Fill d={poly([[x + dx - 7, y - 40], [x + dx + 7, y - 40], [x + dx + 5, y - 16], [x + dx - 5, y - 16]])} color={CM.paper} seed={`bank/cc${i}`} offset={false} />
          <Fill d={poly([[x + dx - 8, y - 43], [x + dx + 8, y - 43], [x + dx + 7, y - 39], [x + dx - 7, y - 39]])} color={i % 2 ? CM.line : CM.coatSlate} seed={`bank/ccl${i}`} offset={false} />
        </React.Fragment>
      ))}
    </>
  );
};

/** A small potted plant someone brought (a sign of care). */
const PottedPlant: React.FC = () => {
  const x = 792;
  const y = 1640;
  return (
    <>
      <Fill d={`M${x - 4} ${y - 30}C${x - 26} ${y - 40} ${x - 30} ${y - 66} ${x - 10} ${y - 64}C${x - 4} ${y - 60} ${x - 2} ${y - 44} ${x - 4} ${y - 30}ZM${x + 4} ${y - 30}C${x + 24} ${y - 44} ${x + 30} ${y - 70} ${x + 8} ${y - 68}C${x + 2} ${y - 62} ${x + 2} ${y - 46} ${x + 4} ${y - 30}ZM${x} ${y - 30}C${x - 8} ${y - 52} ${x - 4} ${y - 78} ${x + 2} ${y - 78}C${x + 8} ${y - 76} ${x + 6} ${y - 50} ${x} ${y - 30}Z`} color={CM.sage} seed="bank/plantLeaves" offset={false} />
      <Fill d={poly([[x - 20, y - 32], [x + 20, y - 32], [x + 15, y], [x - 15, y]])} color={CM.brick} seed="bank/plantPot" offset={false} />
      <Fill d={poly([[x - 22, y - 36], [x + 22, y - 36], [x + 21, y - 29], [x - 21, y - 29]])} color={CM.brickDeep} seed="bank/plantRim" offset={false} />
    </>
  );
};

/** A folded umbrella lying on the step (October, London). */
const Umbrella: React.FC = () => {
  const x = 842;
  const y = 1378;
  return (
    <>
      <Fill d={`M${x - 50} ${y - 2}L${x + 30} ${y - 9}Q${x + 40} ${y - 6} ${x + 30} ${y - 1}L${x - 50} ${y + 4}Z`} color={CM.coatPlum} seed="bank/umbrella" offset={false} />
      <Ink d={`M${x + 32} ${y - 5}L${x + 44} ${y - 6}Q${x + 52} ${y - 2} ${x + 46} ${y + 4}`} width={2.4} color={CM.line} thing at={floodAt(x, y)} seed="bank/umbrellaH" />
    </>
  );
};

/** A thermos and two mugs on the picnic cloth. */
const Thermos: React.FC = () => {
  const x = 432;
  const y = 1800;
  return (
    <>
      <Fill d={poly([[x - 7, y - 34], [x + 7, y - 34], [x + 7, y], [x - 7, y]])} color={CM.coatSlate} seed="bank/thermos" offset={false} />
      <Fill d={poly([[x + 12, y - 14], [x + 26, y - 14], [x + 25, y], [x + 13, y]])} color={CM.paper} seed="bank/mug1" offset={false} />
      <Fill d={poly([[x - 28, y - 13], [x - 14, y - 13], [x - 15, y + 1], [x - 27, y + 1]])} color={CM.box} seed="bank/mug2" offset={false} />
    </>
  );
};

/** The things on a given band (drawn after that tread's stone, so the next step's edge covers what sits behind it). */
export const ThingsOn: React.FC<{band: number}> = ({band}) => {
  switch (band) {
    case 1:
      return (
        <>
          <Book />
          <Cup x={470} y={1384} h={26} k="cupA" />
          <Umbrella />
        </>
      );
    case 2:
      return (
        <>
          <Tote />
          <Scarf />
          <Flowers />
          <Carrier />
          <Backpack />
          <Flask />
        </>
      );
    case 3:
      return (
        <>
          <Jacket />
          <Newspaper />
          <Skateboard />
          <PottedPlant />
          <Cup x={908} y={1642} h={38} k="cupB" />
        </>
      );
    case 4:
      return (
        <>
          <Picnic />
          <Thermos />
          <GuitarCase />
        </>
      );
    case 5:
      return (
        <>
          <Bike />
          <Planter />
        </>
      );
    default:
      return null;
  }
};
export {Leaves};
