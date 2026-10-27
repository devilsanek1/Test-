// V2S3_tHouses.tsx (lane L3, V2S3 FAR helper): her brick terrace across the water, frontal, WORLD px at the 12.98
// match. Four houses west -> east: HER house (red stock brick, the French window at W2_CUT is drawn by V2S3_tHer),
// a yellow-stock house with a parapet and a stucco ground floor (the WATERING neighbour), a dark-brick house with a
// balcony and string lights, a painted stucco house cut by the right edge (the KETTLE neighbour). Two storeys + a squat
// mansard (every top >= 600), stacks with pots and aerials, sash windows lit / unlit (~65 % lit, three switch on),
// doors with fanlights and steps, area railings, a bike on the railings, bins, drainpipes, creeper, a climbing rose.
// Static parts are memoised batches; only the switching panes are rebuilt per frame.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Paint} from '../kit/canal/core';
import * as MAP from '../world/map';
import {
  Batch, TK, WinSpec, DoorSpec, winBack, winPane, winFront, litNow, switches, doorInto, areaRailInto, pipeInto, stackInto, aerialInk,
  brickTicks, creeperInto, roseInto, binInto, bikeInk, potsInto, line, rectInk, ovalPath, rng, P,
} from './V2S3_tParts';

// ---------------------------------------------------------------- the terrace's lines (world px)

export const TL = {
  ground: 1100,
  /** The first-floor string course (her window box hangs over it, 868-900). */
  string: 872,
  cornice: 660,
  mansardTop: 606,
} as const;

export type HouseId = 'her' | 'stock' | 'deep' | 'stucco';
export type House = {id: HouseId; x0: number; x1: number; wall: string; roof: 'mansard' | 'parapet'; top: number};

/** West -> east. Her house is the terrace's WEST END (the west gap with the sun is beyond it). */
export const HOUSES: House[] = [
  {id: 'her', x0: 165, x1: 525, wall: CM.brick, roof: 'mansard', top: 630},
  {id: 'stock', x0: 525, x1: 775, wall: CM.brickLight, roof: 'parapet', top: 640},
  {id: 'deep', x0: 775, x1: 1010, wall: CM.brickDeep, roof: 'mansard', top: 626},
  {id: 'stucco', x0: 1010, x1: 1270, wall: CM.sage, roof: 'mansard', top: 634},
];

const F = MAP.W2_CUT;
/** Her French window's outer frame + stone architrave (kept clear of dressing: the calm ring). */
export const HER_OPENING = {x0: F.x - F.w / 2, y0: F.y - F.h / 2, x1: F.x + F.w / 2, y1: F.y + F.h / 2} as const;

// ---------------------------------------------------------------- windows and doors

export const WINDOWS: WinSpec[] = [
  // her house: two dormers (one lit), the ground-floor tripartite window behind lace nets
  {id: 'h1d1', x: 230, y: 637, w: 36, h: 21, bars: 'dormer', surround: 'plain', wall: CM.shadeCool, lit: false, unlit: 'blind', blind: 0.4, sill: false},
  {id: 'h1d2', x: 404, y: 637, w: 36, h: 21, bars: 'dormer', surround: 'plain', wall: CM.shadeCool, lit: true, inner: 'pendant', sill: false},
  {id: 'h1g', x: 330, y: 922, w: 104, h: 112, bars: '2/2', surround: 'stone', wall: CM.brick, lit: false, unlit: 'plant', blind: 0.2},
  {id: 'h1gl', x: 300, y: 922, w: 22, h: 112, bars: '1/1', surround: 'plain', wall: CM.brick, lit: false, unlit: 'sky', sill: false},
  {id: 'h1gr', x: 442, y: 922, w: 22, h: 112, bars: '1/1', surround: 'plain', wall: CM.brick, lit: false, unlit: 'sky', sill: false},
  // the stock-brick house: the WATERING neighbour's window (lit, lower sash up), a blind, the lit front room
  {id: 'h2a', x: 566, y: 708, w: 66, h: 136, bars: '2/2', surround: 'hood', wall: CM.brickLight, lit: true, inner: 'frame', open: 50, box: true, curtain: CM.blossom},
  {id: 'h2b', x: 668, y: 708, w: 66, h: 136, bars: '2/2', surround: 'hood', wall: CM.brickLight, lit: false, unlit: 'blind', blind: 0.36},
  {id: 'h2g', x: 562, y: 920, w: 86, h: 114, bars: '6/6', surround: 'stucco', wall: CM.stucco, lit: true, inner: 'lamp', curtain: CM.coatMustard},
  // the dark-brick house: a narrow sash that switches on, the balcony's French door, a dormer, the kitchen
  {id: 'h3n', x: 794, y: 714, w: 38, h: 130, bars: '2/2', surround: 'arch', wall: CM.brickDeep, lit: [{t: 14.05, on: true}], inner: 'curtains', curtain: CM.sage},
  {id: 'h3f', x: 852, y: 706, w: 74, h: 158, bars: 'french', surround: 'arch', wall: CM.brickDeep, lit: true, inner: 'shelf', sill: false},
  {id: 'h3d', x: 868, y: 633, w: 42, h: 24, bars: 'dormer', surround: 'plain', wall: CM.shadeCool, lit: true, inner: 'none', sill: false},
  {id: 'h3g', x: 884, y: 920, w: 100, h: 114, bars: '6/6', surround: 'arch', wall: CM.brickDeep, lit: true, inner: 'pendant', curtain: CM.box},
  // the stucco house (cut by the right edge): the KETTLE neighbour's window, a dormer that switches on, the bay
  {id: 'h4a', x: 1036, y: 710, w: 62, h: 134, bars: '2/2', surround: 'stucco', wall: CM.sage, lit: true, inner: 'shelf', curtain: CM.leafRust},
  {id: 'h4d', x: 1082, y: 641, w: 38, h: 18, bars: 'dormer', surround: 'plain', wall: CM.shadeCool, lit: [{t: 13.45, on: true}], inner: 'none', sill: false},
  {id: 'h4g1', x: 1030, y: 922, w: 30, h: 110, bars: '1/1', surround: 'plain', wall: CM.stucco, lit: true, inner: 'none', sill: false},
  {id: 'h4g2', x: 1068, y: 916, w: 76, h: 118, bars: '2/2', surround: 'plain', wall: CM.stucco, lit: true, inner: 'lamp', curtain: CM.sage, sill: false},
];

export const DOORS: DoorSpec[] = [
  {id: 'herDoor', x: 184, y: 940, w: 62, h: 126, color: CM.hero, fan: 'arch', fanLit: true, caseStucco: true, ground: TL.ground},
  {id: 'h2door', x: 690, y: 940, w: 62, h: 126, color: CM.coatMustard, fan: 'rect', fanLit: false, caseStucco: true, ground: TL.ground},
  {id: 'h3door', x: 792, y: 942, w: 60, h: 124, color: CM.anchor, fan: 'arch', fanLit: true, caseStucco: false, ground: TL.ground},
];

// ---------------------------------------------------------------- the static back: walls, roofs, stacks, surrounds

function backBatch(): Batch {
  const b = new Batch();
  const G = TL.ground;
  // ---- the roofs behind the front walls: mansard slate bands, a parapet
  for (const h of HOUSES) {
    if (h.roof === 'mansard') {
      b.poly(CM.shadeCool, [[h.x0 + 3, TL.cornice + 2], [h.x0 + 12, h.top + 3], [h.x1 - 12, h.top + 3], [h.x1 - 3, TL.cornice + 2]]);
      b.rect(CM.stoneShade, h.x0 + 12, h.top, h.x1 - h.x0 - 24, 4);
    }
  }
  b.layer();
  // slate courses: thin lines across the mansards (the cheapest fullness)
  let slates = '';
  for (const h of HOUSES) {
    if (h.roof !== 'mansard') continue;
    for (let y = h.top + 12; y < TL.cornice - 3; y += 9) slates += `M${P(h.x0 + 10, y)}L${P(h.x1 - 10, y + 0.6)}`;
  }
  b.ink(slates, 1.1, CM.paneUnlit);
  b.layer();
  // ---- the walls
  for (const h of HOUSES) {
    b.rect(h.wall, h.x0, TL.cornice, h.x1 - h.x0, G - TL.cornice);
    if (h.roof === 'parapet') {
      b.rect(h.wall, h.x0, h.top + 6, h.x1 - h.x0, TL.cornice - h.top - 6);
      b.rect(CM.limestone, h.x0 - 2, h.top, h.x1 - h.x0 + 4, 7);
    }
  }
  // the stock house's and the painted house's stucco ground floors
  b.rect(CM.stucco, 525, TL.string + 10, 250, G - TL.string - 10);
  b.rect(CM.stucco, 1010, TL.string + 10, 260, G - TL.string - 10);
  b.layer();
  // stucco rustication on the stock house's ground floor (thin channelled joints)
  for (let y = TL.string + 28; y < G - 4; y += 19) b.rect(CM.stoneShade, 527, y, 246, 1.6);
  // ---- party-wall pilasters + their cast shade to the east (the low sun is west)
  for (const h of HOUSES.slice(1)) {
    b.rect(h.wall === CM.sage ? CM.limestone : CM.brickDeep, h.x0 - 4, TL.cornice + 12, 8, G - TL.cornice - 12);
    b.rect(CM.shadeWarm, h.x0 + 4, TL.cornice + 14, 5, G - TL.cornice - 14);
  }
  // ---- the cornice band (limestone / stucco), gutter, dentils, the string course
  for (const h of HOUSES) {
    const c = h.wall === CM.sage || h.roof === 'parapet' ? CM.stucco : CM.limestone;
    b.rect(CM.shadeCool, h.x0, TL.cornice - 4, h.x1 - h.x0, 4);
    b.rect(c, h.x0 - 2, TL.cornice, h.x1 - h.x0 + 4, 14);
    b.rect(CM.stoneShade, h.x0, TL.cornice + 14, h.x1 - h.x0, 3);
    for (let x = h.x0 + 5; x < h.x1 - 4; x += 9) b.rect(CM.stoneShade, x, TL.cornice + 8, 4, 4);
    b.rect(h.wall === CM.sage ? CM.stucco : CM.limestone, h.x0 - 1, TL.string, h.x1 - h.x0 + 2, 10);
    b.rect(h.wall === CM.sage || h.roof === 'parapet' ? CM.stoneShade : CM.shadeWarm, h.x0, TL.string + 10, h.x1 - h.x0, 2.5);
    // a darker plinth band at the foot (behind the railings)
    b.rect(h.wall === CM.brickDeep ? CM.anchor : h.wall === CM.sage || h.roof === 'parapet' ? CM.shadeCool : CM.brickDeep, h.x0, G - 22, h.x1 - h.x0, 22);
  }
  // ---- brick ticks (clusters, never a texture), kept off the openings and her calm ring
  const holes: [number, number, number, number][] = [
    ...WINDOWS.map((w) => [w.x - 14, w.y - 22, w.x + w.w + 14, w.y + w.h + 12] as [number, number, number, number]),
    ...DOORS.map((d) => [d.x - 20, d.y - 50, d.x + d.w + 20, TL.ground] as [number, number, number, number]),
    [HER_OPENING.x0 - 34, HER_OPENING.y0 - 40, HER_OPENING.x1 + 34, HER_OPENING.y1 + 40],
  ];
  brickTicks(b, 165, TL.cornice + 18, 525, TL.string - 4, [CM.brickDeep, CM.brickLight], 'h1t', 26, holes);
  brickTicks(b, 165, TL.string + 14, 525, TL.ground - 26, [CM.brickDeep, CM.brickLight], 'h1tg', 12, holes);
  brickTicks(b, 525, TL.cornice + 18, 775, TL.string - 4, [CM.brick, CM.stucco], 'h2t', 18, holes);
  brickTicks(b, 775, TL.cornice + 18, 1010, TL.ground - 26, [CM.brick, CM.leafRust], 'h3t', 24, holes);
  b.layer();
  // ---- chimney stacks on the party walls (pots >= 600) + the end stack on her west wall
  stackInto(b, 165, 46, 610, TL.cornice + 2, CM.brickDeep, 'stk0', {pots: 4});
  stackInto(b, 502, 46, 614, TL.cornice + 2, CM.brick, 'stk1', {pots: 3});
  stackInto(b, 752, 46, 611, TL.cornice + 2, CM.brick, 'stk2', {pots: 4});
  stackInto(b, 988, 44, 616, TL.cornice + 2, CM.brickLight, 'stk3', {pots: 3});
  b.ink(
    aerialInk(176, 612, 600, 'aer0', 1) + aerialInk(528, 616, 601, 'aer1', -1) + aerialInk(1010, 618, 600, 'aer3', 1) + aerialInk(786, 613, 602, 'aer2', 1),
    TK.detail,
  );
  // a satellite dish on the stucco house's stack
  b.fill(CM.stoneShade, ovalPath(1022, 641, 8, 10));
  b.rect(CM.shadeCool, 1022, 639, 7, 3);
  b.layer();
  // ---- dormers (cheeks and roofs) on the mansards
  for (const w of WINDOWS.filter((w) => w.bars === 'dormer')) {
    b.rect(CM.stoneShade, w.x - 8, w.y - 6, w.w + 16, w.h + 8);
    b.poly(CM.shadeCool, [[w.x - 13, w.y - 5], [w.x + w.w / 2, w.y - 17], [w.x + w.w + 13, w.y - 5]]);
    b.rect(CM.shadeWarm, w.x + w.w + 8, w.y - 4, 5, w.h + 6);
  }
  // ---- window and door surrounds, frames
  for (const w of WINDOWS) winBack(b, w);
  // her French window's stone architrave + hood (the frame itself is V2S3_tHer's)
  const {x0, y0, x1, y1} = HER_OPENING;
  b.rect(CM.limestone, x0 - 18, y0 - 18, x1 - x0 + 36, y1 - y0 + 18);
  b.rect(CM.limestone, x0 - 26, y0 - 32, x1 - x0 + 52, 12);
  b.rect(CM.stoneShade, x0 - 26, y0 - 20, x1 - x0 + 52, 3);
  b.poly(CM.shadeWarm, [[x1 + 18, y0 - 16], [x1 + 27, y0 - 10], [x1 + 27, y1 + 2], [x1 + 18, y1 + 2]]);
  // the stucco house's bay: a canted projection on the ground floor
  b.rect(CM.limestone, 1020, 900, 140, 10);
  b.rect(CM.stoneShade, 1020, 910, 140, 3);
  b.rect(CM.stucco, 1022, 1036, 136, 42);
  b.rect(CM.stoneShade, 1022, 1036, 136, 3);
  // ---- structure ink: cornice, string course, the mansard tops, party walls (loose, broken, open)
  let st = '';
  st += line(160, TL.cornice, 1180, TL.cornice + 1, {seed: 'cor', over: 'medium'});
  st += line(160, TL.string, 1180, TL.string + 1, {seed: 'str', over: 'medium'});
  for (const h of HOUSES) {
    if (h.roof === 'mansard') st += line(h.x0 + 12, h.top + 3, h.x1 - 12, h.top + 3, {seed: `mt${h.id}`, over: 'small'});
    else st += line(h.x0 - 2, h.top, h.x1 + 2, h.top, {seed: `pt${h.id}`, over: 'small'});
    st += line(h.x0, TL.cornice + 16, h.x0, h.id === 'her' ? TL.ground : TL.ground - 30, {seed: `pw${h.id}`, over: 'small'});
  }
  b.ink(st, TK.struct, CM.ink, 0.12);
  return b;
}

// ---------------------------------------------------------------- the static front: sashes, doors, railings, dressing

function frontBatch(): Batch {
  const b = new Batch();
  const G = TL.ground;
  for (const w of WINDOWS) winFront(b, w);
  b.layer();
  for (const d of DOORS) doorInto(b, d);
  // her door: a brass number plaque (blank) and two pots on her steps; a wall lantern
  b.fill(CM.coatMustard, ovalPath(215, 928, 5, 3.4));
  potsInto(b, [168, 262], 1066, 14, 'herSteps');
  b.layer();
  // drainpipes on the party walls
  pipeInto(b, 519, TL.cornice + 2, G - 4);
  pipeInto(b, 769, TL.cornice + 2, G - 4, CM.anchor);
  pipeInto(b, 1004, TL.cornice + 2, G - 4);
  // the balcony of the dark-brick house: a slab on two brackets, a cast-iron rail, pots
  b.rect(CM.limestone, 828, 864, 128, 8);
  b.rect(CM.stoneShade, 830, 872, 124, 3);
  b.poly(CM.limestone, [[836, 875], [846, 875], [840, 892]]);
  b.poly(CM.limestone, [[938, 875], [948, 875], [944, 892]]);
  b.layer();
  potsInto(b, [842, 936, 948], 864, 15, 'balPots');
  b.layer();
  {
    const top = 826;
    b.rect(CM.anchor, 830, top, 124, 3);
    b.rect(CM.anchor, 830, 858, 124, 2.4);
    for (let x = 834; x < 952; x += 7.5) b.rect(CM.anchor, x - 0.7, top, 1.4, 864 - top);
    for (let x = 845; x < 945; x += 22) {
      // a scroll in each bay (the cast-iron pattern)
      b.ink(`M${P(x, 856)}Q${P(x + 6, 838)} ${P(x + 11, 850)}Q${P(x + 16, 860)} ${P(x + 21, 840)}`, 1.1, CM.anchor);
    }
    b.ink(line(828, top + 1, 956, top + 1, {seed: 'balrail', over: 'small'}), TK.fine);
  }
  b.layer();
  // area railings along the terrace front (they stop at the doorsteps)
  const rail: [number, number][] = [[258, 525], [525, 676], [766, 776], [868, 1010], [1010, 1180]];
  rail.forEach(([a, c], i) => areaRailInto(b, a, c, G, 62, `rail${i}`));
  areaRailInto(b, 160, 168, G, 62, 'railW');
  // a bike locked to the stock house's railings; bins by the dark-brick house's steps
  bikeInk(b, 598, G - 2, 21, CM.brickDeep, 'h2bike', 1);
  binInto(b, 742 + 120, G, 46, CM.coatSlate);
  binInto(b, 742 + 152, G, 46, CM.sage);
  // a recycling box on her neighbour's step, a boot scraper
  b.rect(CM.coatMustard, 655, G - 14, 26, 14);
  b.rect(CM.paper, 657, G - 18, 22, 4);
  b.layer();
  // autumn creeper up her west end wall; a climbing rose round the stucco house's bay; ivy on the deep house
  creeperInto(b, 165, 212, 690, G - 20, 'h1creep', [CM.leafRust, CM.brickDeep, CM.leafRust, CM.leafGold], 6, [[170, 896, 260, 1100]]);
  creeperInto(b, 952, 1008, 760, G - 30, 'h3ivy', [CM.sage, CM.sage, CM.leafGold], 4, [[880, 900, 990, 1040]]);
  roseInto(b, 1012, 1034, 880, G - 40, 'h4rose');
  // the stucco house's bay roof planting
  potsInto(b, [1052, 1092, 1130], 898, 13, 'bayPots');
  return b;
}

// ---------------------------------------------------------------- the component

/** The terrace facades (not her French window, which V2S3_tHer draws over this). */
export const S3Houses: React.FC<{inside?: React.ReactNode}> = ({inside}) => {
  const t = useTime();
  const back = useMemo(backBatch, []);
  const panesStatic = useMemo(() => {
    const b = new Batch();
    for (const w of WINDOWS) if (!switches(w)) winPane(b, w, litNow(w, 0));
    return b;
  }, []);
  const front = useMemo(frontBatch, []);
  // the switching panes (a few lights come on during the shot)
  const dyn = new Batch();
  for (const w of WINDOWS) if (switches(w)) winPane(dyn, w, litNow(w, t));
  return (
    <>
      <Paint b={back} seed="s3h/back" />
      <Paint b={panesStatic} seed="s3h/panes" misreg={false} />
      <Paint b={dyn} seed="s3h/dyn" misreg={false} />
      {inside}
      <Paint b={front} seed="s3h/front" />
    </>
  );
};

export {rectInk, rng};
