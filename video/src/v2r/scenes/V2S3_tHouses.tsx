// V2S3_tHouses.tsx (lane L3, V2S3 FAR helper): her brick terrace across the water, frontal, WORLD px at the 12.98
// match. Four houses west -> east: HER house (red stock brick, the French window at W2_CUT is drawn by V2S3_tHer), a
// yellow-stock house with a parapet and a stucco ground floor (the WATERING neighbour), a dark-brick house with a balcony
// and string lights, a painted stucco house cut by the right edge (the KETTLE neighbour). Two storeys + a squat mansard
// (every top >= 600), stacks with pots, sash windows (lit or not: nothing switches during the shot), doors with
// fanlights and steps, area railings, bins.
// Tier C (environment): flat colour, no lines, no hand marks (CRAFT §c: the brick ticks, the stucco's channelled joints,
// the dentil row, the creeper, the climbing rose and the ink-only bike are gone; the walls are big flat fields). Light
// (CRAFT §d; V2S3_light): every shadow here is a ShadeSink shape the light layer multiplies with the rig's tint family:
// the pilasters' and dormers' east returns and the step risers (`form`), the casts of sills, lintels, hoods, cornice,
// string course, door cases, the balcony and the window boxes (`cast`); the stacks and the bay take a FormShade.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {Paint} from '../kit/canal/core';
import {seamTone} from '../../lib/depth';
import * as MAP from '../world/map';
import {
  Batch, WinSpec, DoorSpec, ShadeSink, shadeSink, winBack, winPane, winFront, litNow, doorInto, areaRailInto, pipeInto, stackInto, binInto, potsInto, rectP, quadP, ovalPath, rng, S3_IRON,
} from './V2S3_tParts';
import {S3TerraceShades} from './V2S3_light';

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
/** Her French window's opening (its frame band straight in the brick: no architrave; kept clear of dressing: the calm
 *  ring). */
export const HER_OPENING = {x0: F.x - F.w / 2, y0: F.y - F.h / 2, x1: F.x + F.w / 2, y1: F.y + F.h / 2} as const;

// ---------------------------------------------------------------- windows and doors

/** Static panes (the brief's life budget: no window switches in this shot), each in its state at the match. */
export const WINDOWS: WinSpec[] = [
  // her house: two dormers (one lit), the ground-floor tripartite window behind lace nets
  {id: 'h1d1', x: 230, y: 637, w: 36, h: 21, bars: 'dormer', surround: 'plain', wall: CM.shadeCool, lit: false, unlit: 'blind', blind: 0.4, sill: false},
  {id: 'h1d2', x: 404, y: 637, w: 36, h: 21, bars: 'dormer', surround: 'plain', wall: CM.shadeCool, lit: true, inner: 'pendant', sill: false},
  {id: 'h1g', x: 330, y: 922, w: 104, h: 112, bars: '2/2', surround: 'stone', wall: CM.brick, lit: false, unlit: 'plant', blind: 0.2},
  {id: 'h1gl', x: 300, y: 922, w: 22, h: 112, bars: '1/1', surround: 'plain', wall: CM.brick, lit: false, unlit: 'sky', sill: false},
  {id: 'h1gr', x: 442, y: 922, w: 22, h: 112, bars: '1/1', surround: 'plain', wall: CM.brick, lit: false, unlit: 'sky', sill: false},
  // the stock-brick house: the WATERING neighbour's window (lit, lower sash up), a blind, the lit front room
  {id: 'h2a', x: 566, y: 708, w: 66, h: 136, bars: '2/2', surround: 'hood', wall: CM.brickLight, lit: true, inner: 'frame', open: 50, box: true, curtain: CM.blossom},
  {id: 'h2b', x: 668, y: 708, w: 66, h: 136, bars: '2/2', surround: 'hood', wall: CM.brickLight, lit: false, unlit: 'blind', blind: 0.36, curtain: CM.sage},
  {id: 'h2g', x: 562, y: 920, w: 86, h: 114, bars: '6/6', surround: 'stucco', wall: CM.stucco, lit: true, inner: 'lamp', curtain: CM.coatMustard},
  // the dark-brick house: a narrow sash, the balcony's French door, a dormer, the kitchen
  {id: 'h3n', x: 794, y: 714, w: 38, h: 130, bars: '2/2', surround: 'arch', wall: CM.brickDeep, lit: false, curtain: CM.sage},
  {id: 'h3f', x: 852, y: 706, w: 74, h: 158, bars: 'french', surround: 'arch', wall: CM.brickDeep, lit: true, inner: 'shelf', sill: false},
  {id: 'h3d', x: 868, y: 633, w: 42, h: 24, bars: 'dormer', surround: 'plain', wall: CM.shadeCool, lit: true, inner: 'none', sill: false},
  {id: 'h3g', x: 884, y: 920, w: 100, h: 114, bars: '6/6', surround: 'arch', wall: CM.brickDeep, lit: true, inner: 'pendant', curtain: CM.box},
  // the stucco house (cut by the right edge): the KETTLE neighbour's window, a dormer, the bay
  {id: 'h4a', x: 1036, y: 710, w: 62, h: 134, bars: '2/2', surround: 'stucco', wall: CM.sage, lit: true, inner: 'shelf', curtain: CM.leafRust},
  {id: 'h4d', x: 1082, y: 641, w: 38, h: 18, bars: 'dormer', surround: 'plain', wall: CM.shadeCool, lit: false, inner: 'none', sill: false},
  {id: 'h4g1', x: 1030, y: 922, w: 30, h: 110, bars: '1/1', surround: 'plain', wall: CM.stucco, lit: true, inner: 'none', sill: false},
  {id: 'h4g2', x: 1068, y: 916, w: 76, h: 118, bars: '2/2', surround: 'plain', wall: CM.stucco, lit: true, inner: 'lamp', curtain: CM.sage, sill: false},
];

export const DOORS: DoorSpec[] = [
  {id: 'herDoor', x: 184, y: 940, w: 62, h: 126, color: CM.hero, fan: 'arch', fanLit: true, caseStucco: true, ground: TL.ground},
  {id: 'h2door', x: 690, y: 940, w: 62, h: 126, color: CM.coatMustard, fan: 'rect', fanLit: false, caseStucco: true, ground: TL.ground},
  {id: 'h3door', x: 792, y: 942, w: 60, h: 124, color: CM.sage, fan: 'arch', fanLit: true, caseStucco: false, ground: TL.ground},
];

/** The stacks on the party walls and her end wall (x, w, top, colour, pots): their bodies take a FormShade. */
const STACKS: [number, number, number, string, number][] = [
  [165, 46, 610, CM.brickDeep, 4],
  [502, 46, 614, CM.brick, 3],
  [752, 46, 611, CM.brick, 4],
  [988, 44, 616, CM.brickLight, 3],
];

/** The stucco house's bay (a projection on the ground floor): its face takes a FormShade. */
const BAY = {x0: 1020, x1: 1160, y0: 910, y1: 1078} as const;

// ---------------------------------------------------------------- the static back: walls, roofs, stacks, surrounds

function backBatch(sh: ShadeSink, stacks: string[]): Batch {
  const b = new Batch();
  const G = TL.ground;
  // ---- the roofs behind the front walls: mansard slate bands, their caps
  for (const h of HOUSES) {
    if (h.roof === 'mansard') {
      b.poly(CM.shadeCool, [[h.x0 + 3, TL.cornice + 2], [h.x0 + 12, h.top + 3], [h.x1 - 12, h.top + 3], [h.x1 - 3, TL.cornice + 2]]);
      b.rect(CM.stoneShade, h.x0 + 12, h.top, h.x1 - h.x0 - 24, 4);
    }
  }
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
  // ---- party-wall pilasters; their east returns turned from the low western sun (form)
  for (const h of HOUSES.slice(1)) {
    b.rect(h.wall === CM.sage ? CM.limestone : CM.brickDeep, h.x0 - 4, TL.cornice + 12, 8, G - TL.cornice - 12);
    sh.form.push(rectP(h.x0 + 4, TL.cornice + 14, 5, G - TL.cornice - 14));
  }
  // ---- the gutter, the cornice band, the string course (their casts on the wall below), a darker plinth at the foot
  for (const h of HOUSES) {
    const c = h.wall === CM.sage || h.roof === 'parapet' ? CM.stucco : CM.limestone;
    if (h.roof === 'mansard') b.rect(CM.shadeCool, h.x0, TL.cornice - 4, h.x1 - h.x0, 4);
    b.rect(c, h.x0 - 2, TL.cornice, h.x1 - h.x0 + 4, 14);
    sh.cast.push(rectP(h.x0, TL.cornice + 14, h.x1 - h.x0, 3));
    b.rect(h.wall === CM.sage ? CM.stucco : CM.limestone, h.x0 - 1, TL.string, h.x1 - h.x0 + 2, 10);
    sh.cast.push(rectP(h.x0, TL.string + 10, h.x1 - h.x0, 2.5));
    b.rect(seamTone(CM.stucco, 9), h.x0, G - 22, h.x1 - h.x0, 22);
  }
  b.layer();
  // ---- chimney stacks on the party walls (pots >= 600) + the end stack on her west wall
  STACKS.forEach(([x, w, top, col, pots], i) => stacks.push(stackInto(b, x, w, top, TL.cornice + 2, col, `stk${i}`, {pots})));
  // a satellite dish on the stucco house's stack
  b.fill(CM.stoneShade, ovalPath(1022, 641, 8, 10));
  b.layer();
  // ---- dormers (cheeks and roofs) on the mansards; their east cheeks in shade
  for (const w of WINDOWS.filter((w) => w.bars === 'dormer')) {
    b.rect(CM.stoneShade, w.x - 8, w.y - 6, w.w + 16, w.h + 8);
    b.poly(CM.stoneShade, [[w.x - 13, w.y - 5], [w.x + w.w / 2, w.y - 17], [w.x + w.w + 13, w.y - 5]]);
    sh.form.push(rectP(w.x + w.w + 8, w.y - 4, 5, w.h + 6));
  }
  // ---- window and door surrounds, frames
  for (const w of WINDOWS) winBack(b, w, sh);
  // her French window (V2S3_tHer) sits straight in the brick, as S8's does: no light stone surround round it, so her
  // lit pane reads in the darker wall (CRAFT §f.3, the brief's separation); its frame band's cast to the east
  const {x1, y0, y1} = HER_OPENING;
  sh.cast.push(quadP([[x1 + 9, y0 - 6], [x1 + 16, y0], [x1 + 16, y1 + 4], [x1 + 9, y1 + 4]]));
  // the stucco house's bay: a projection on the ground floor, its cornice and the stucco apron
  b.rect(CM.stucco, BAY.x0 + 2, BAY.y0, BAY.x1 - BAY.x0 - 4, BAY.y1 - BAY.y0);
  b.rect(CM.limestone, BAY.x0, 900, BAY.x1 - BAY.x0, 10);
  sh.cast.push(rectP(BAY.x0, 910, BAY.x1 - BAY.x0, 3));
  return b;
}

// ---------------------------------------------------------------- the static front: sashes, doors, the balcony

function frontBatch(sh: ShadeSink): Batch {
  const b = new Batch();
  const G = TL.ground;
  for (const w of WINDOWS) winFront(b, w, sh);
  b.layer();
  for (const d of DOORS) doorInto(b, d, sh);
  // her door: a wall lantern right of the case (lit glass), a blank brass plaque, two pots on her steps
  b.rect(S3_IRON, 271, 926, 2, 9);
  b.poly(S3_IRON, [[263, 936], [281, 936], [277, 930], [267, 930]]);
  b.rect(CM.lamp, 265.5, 936, 13, 17);
  b.rect(S3_IRON, 264, 953, 16, 3);
  b.fill(CM.coatMustard, ovalPath(272, 980, 5, 3.6));
  potsInto(b, [168, 262], 1066, 14, 'herSteps');
  b.layer();
  // drainpipes on the party walls (mid iron: no dark line down the facade)
  pipeInto(b, 519, TL.cornice + 2, G - 4);
  pipeInto(b, 769, TL.cornice + 2, G - 4);
  pipeInto(b, 1004, TL.cornice + 2, G - 4);
  // the balcony of the dark-brick house: a slab on two brackets (its cast below), pots, a mid-iron rail
  b.rect(CM.limestone, 828, 864, 128, 8);
  sh.cast.push(rectP(830, 872, 124, 3));
  b.poly(CM.limestone, [[836, 875], [846, 875], [840, 892]]);
  b.poly(CM.limestone, [[938, 875], [948, 875], [944, 892]]);
  b.layer();
  potsInto(b, [842, 936, 948], 864, 15, 'balPots');
  b.layer();
  {
    const top = 826;
    b.rect(S3_IRON, 830, top, 124, 3);
    b.rect(S3_IRON, 830, 858, 124, 2.4);
    for (let x = 834; x < 952; x += 15) b.rect(S3_IRON, x - 0.8, top, 1.6, 864 - top);
  }
  // the stucco house's bay roof planting
  potsInto(b, [1052, 1092, 1130], 898, 13, 'bayPots');
  return b;
}

/** In front of the facades at the foot: the area railings, the bins, a recycling box (their shadows: V2S3_light). */
function streetBatch(): Batch {
  const b = new Batch();
  const G = TL.ground;
  const rail: [number, number][] = [[258, 525], [525, 676], [766, 776], [868, 1010], [1010, 1180]];
  // (the rail before the stucco house's ground-floor window rises to its sill: no thin brick gap between them)
  rail.forEach(([a, c], i) => areaRailInto(b, a, c, G, a === 868 ? 66 : 62, `rail${i}`));
  areaRailInto(b, 160, 168, G, 62, 'railW');
  binInto(b, 742 + 120, G, 46, CM.coatSlate);
  binInto(b, 742 + 152, G, 46, CM.sage);
  b.rect(CM.coatMustard, 655, G - 14, 26, 14);
  b.rect(CM.paper, 657, G - 18, 22, 4);
  void rng;
  return b;
}

/** Things standing on her towpath at the terrace's foot (for their contact shadows): bins, the recycling box, pots. */
export const TERRACE_FEET: {x: number; y: number; w: number; h: number}[] = [
  {x: 862, y: TL.ground, w: 28, h: 46},
  {x: 894, y: TL.ground, w: 28, h: 46},
  {x: 668, y: TL.ground, w: 26, h: 14},
];

// ---------------------------------------------------------------- the component

/** The terrace facades (not her French window, which V2S3_tHer draws over this), with their light layer. */
export const S3Houses: React.FC<{inside?: React.ReactNode}> = ({inside}) => {
  const built = useMemo(() => {
    const back: ShadeSink = shadeSink();
    const front: ShadeSink = shadeSink();
    const stacks: string[] = [];
    const bb = backBatch(back, stacks);
    const fb = frontBatch(front);
    const panes = new Batch();
    for (const w of WINDOWS) winPane(panes, w, litNow(w, 0));
    return {bb, fb, panes, street: streetBatch(), back, front, stacks};
  }, []);
  return (
    <>
      <Paint b={built.bb} seed="s3h/back" misreg={false} />
      <S3TerraceShades sink={built.back} stacks={built.stacks} bay={rectP(BAY.x0 + 2, BAY.y0, BAY.x1 - BAY.x0 - 4, BAY.y1 - BAY.y0)} />
      <Paint b={built.panes} seed="s3h/panes" misreg={false} />
      {inside}
      <Paint b={built.fb} seed="s3h/front" misreg={false} />
      <S3TerraceShades sink={built.front} />
      <Paint b={built.street} seed="s3h/street" misreg={false} />
    </>
  );
};
