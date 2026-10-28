// V2S4_wbacks.tsx (lane L3, V2S4 WORLD helpers): the BACKS plane (+1, 0.6x the truck) at the 17.96 pose, in plane px.
//   left      HER END HOUSE (the thread: conform_L3 §2; map S4.herWindow): the terrace's end house, red stock brick
//             (S3's her house), a stone cornice, a slate mansard with a dormer, a chimney stack with two pots, her teal
//             front door; her first-floor French window, 90 x 102 at (135, 698) (S4HerWindow below, tier B): teal frame,
//             blind UP, a DARK pane (she is not home yet), the fanlight undivided above the transom, the stile from the
//             transom down, a Juliet rail drawn as ONE closed comb (no stroke ends 3-18 px apart: S3's lesson). It enters
//             from the left edge with the plane (starts ~14.95, half in by ~15.6, whole by ~16.3) and sits at the pose
//             left of SUN1's disc (x <= 180; the disc reaches x 185) and 6 px above the DEC plate (y 755).
//   the gap   the sun's column stays low: an allotment yard (a greenhouse, a shed, a water butt, bean leaves,
//             sunflowers gone to seed, an apple tree), so the sun, the gasholder and the far roofs read over it
//   terrace   five house backs: slate roofs (two with box dormers), party-wall stacks with pots, rear sashes (a few
//             warmly lit, static: nothing switches), back extensions with lean-to roofs, skylights and French doors,
//             ivy, two garden trees in autumn leaf
// TIER C (environment: flat, no line; every fill one flat step toward the air: planeBatch(+1), five values); her
// window is tier B. No life moves here (the life budget: one cyclist, smoke, ducks; conform §2): the washing line, the
// raker, the pigeons, the gull, the window reader, the stacks' smoke and the falling leaf specks are gone; nothing
// switches. The light (RIG_CANAL: the low sun at the left) gives the planes turned from it one Shade step and the stacks
// a form step (V2S4_light S4BacksShades, given `BACKS_SHADES`). Nothing tops y 600; the sun's column (plane-x
// sunClear(0.6)) stays below y 716.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {Tier} from '../../lib/tier';
import {Batch, Paint, P, rng, ovalPath, lobes, leafPath, lerp} from '../kit/canal/core';
import * as MAP from '../world/map';
import {ROW, PLANE_X, sunClear} from './V2S4_wcore';
import {S4_PLANE, planeBatch, onPlane} from './V2S4_depth';
import {S4BacksShades} from './V2S4_light';

const K = 0.6;
const [X0, X1] = PLANE_X(K);
const CLEAR = sunClear(K);
const GROUND = ROW.wallTop + 2; // everything below is behind the garden walls

// ---------------------------------------------------------------- her end house (the thread)

/** Her end house (plane px at the pose): its front from off the left edge to x 180 (her window's frame), the stone
 *  cornice at 634-642 under the slate mansard (top 614, a dormer over the door), the chimney stack on the ridge at
 *  x 96-122 (pots to y 601), a narrow first-floor sash beside her window, her teal front door and a ground-floor sash. */
export const HER_HOUSE = {x0: X0 - 10, x1: 180, cornice: 634, mansardTop: 614, stack: {x0: 96, x1: 122, top: 606}} as const;
/** Her window's OUTER box (frame band included): map S4.herWindow, 90 x 102 centred (135, 698). */
const HW = MAP.S4.herWindow;
export const HER_WIN = {x0: HW.x - HW.w / 2, x1: HW.x + HW.w / 2, y0: HW.y - HW.h / 2, y1: HW.y + HW.h / 2} as const;

function herHouseInto(b: Batch) {
  const h = HER_HOUSE;
  // L0: the brick front, the mansard's slope, the stack
  b.rect(CM.brick, h.x0, h.cornice, h.x1 - h.x0, GROUND - h.cornice);
  b.poly(CM.shadeCool, [[h.x0, h.cornice], [h.x0 + 4, h.mansardTop], [h.x1 - 8, h.mansardTop], [h.x1, h.cornice]]);
  b.rect(CM.brickLight, h.stack.x0, h.stack.top, h.stack.x1 - h.stack.x0, h.mansardTop - h.stack.top + 2);
  b.layer();
  // L1: the cornice, the stack's cap, the dormer's body, the door case, the ground-floor window's surround
  b.rect(CM.limestone, h.x0, h.cornice, h.x1 - h.x0 + 2, 8);
  b.rect(CM.limestone, h.stack.x0 - 2, h.stack.top, h.stack.x1 - h.stack.x0 + 4, 4);
  b.rect(CM.stucco, 18, h.mansardTop + 4, 36, h.cornice - h.mansardTop - 4);
  b.rect(CM.limestone, 6, 768, 52, GROUND - 768);
  b.rect(CM.limestone, 98, 774, 64, 66);
  b.rect(CM.paper, 26, 660, 42, 80);
  b.layer();
  // L2: two pots, the dormer's pane, her teal door with its fanlight, the sash's dark glass
  b.rect(CM.leafRust, h.stack.x0 + 4, h.stack.top - 5, 7, 6);
  b.rect(CM.brickDeep, h.stack.x0 + 16, h.stack.top - 5, 7, 6);
  b.rect(CM.paneUnlit, 23, h.mansardTop + 9, 26, h.cornice - h.mansardTop - 13);
  b.rect(CM.hero, 12, 790, 40, GROUND - 790);
  b.fill(CM.glass, `M${P(12, 790)}A20 15 0 0 1 ${P(52, 790)}Z`);
  b.rect(CM.paneUnlit, 104, 780, 52, 54);
  b.rect(CM.paneUnlit, 30, 664, 34, 72);
  b.layer();
  // L3: the sashes' meeting rails and sills, the door's knob plate (no specks: one calm bar each)
  b.rect(CM.limestone, 104, 805, 52, 4);
  b.rect(CM.paper, 30, 698, 34, 3);
  b.rect(CM.limestone, 22, 740, 50, 5);
  b.rect(CM.coatMustard, 44, 826, 4, 10);
}

/** Her French window, TIER B (the thread's home spot; S8's design as V2S3_tHer draws it, with S3's undivided fanlight),
 *  dark: she is not home yet. On the backs plane (one flat step toward the air), no outline (tier B). */
function herWindowBatch(): Batch {
  const b = new Batch();
  const {x0, x1, y0, y1} = HER_WIN;
  const fb = 6; // the frame band (S8's 7 % of the width)
  const px0 = x0 + fb;
  const px1 = x1 - fb;
  const py0 = y0 + fb;
  const py1 = y1 - fb;
  const pw = px1 - px0;
  const ph = py1 - py0;
  const transom = py0 + ph * 0.62;
  const pane = onPlane(CM.paneUnlit, S4_PLANE.backs);
  const room = onPlane('#6B7C92', S4_PLANE.backs); // the unlit room one soft step over the dark glass (tone on tone)
  // L0: the frame band (teal) round the opening
  b.rect(onPlane(CM.hero, S4_PLANE.backs), x0, y0, x1 - x0, y1 - y0);
  b.layer();
  // L1: the dark pane
  b.rect(pane, px0, py0, pw, ph);
  b.layer();
  // L2: the unlit room as one soft step: the standard lamp's shade and stand (left), two shelves (right); the blind UP
  b.fill(room, `M${P(px0 + pw * 0.12, py0 + ph * 0.36)}L${P(px0 + pw * 0.3, py0 + ph * 0.36)}L${P(px0 + pw * 0.26, py0 + ph * 0.26)}L${P(px0 + pw * 0.16, py0 + ph * 0.26)}Z`);
  b.rect(room, px0 + pw * 0.2, py0 + ph * 0.36, 2, ph * 0.64);
  b.rect(room, px0 + pw * 0.58, py0 + ph * 0.3, pw * 0.36, 3);
  b.rect(room, px0 + pw * 0.58, py0 + ph * 0.5, pw * 0.36, 3);
  b.rect(onPlane(CM.coatOat, S4_PLANE.backs), px0, py0, pw, Math.max(4, ph * 0.06));
  b.layer();
  // L3: the front: the transom, the stile from the transom down (the fanlight above stays one undivided pane), the
  // bottom rail; then the Juliet rail as ONE closed comb (its top rail and balusters one path: no stroke ends apart)
  const teal = onPlane(CM.hero, S4_PLANE.backs);
  b.rect(teal, px0, transom, pw, 3);
  b.rect(teal, px0 + pw / 2 - 1.5, transom, 3, py1 - transom);
  const ry = py0 + ph * 0.6;
  const n = 9;
  const half = 0.7;
  const xs = Array.from({length: n + 1}, (_, i) => px0 + (pw * i) / n);
  let comb = `M${P(xs[0] - half, ry)}L${P(xs[n] + half, ry)}`;
  for (let i = n; i >= 0; i--) {
    const bx = xs[i];
    comb += `L${P(bx + half, i === n ? ry : ry + 2.4)}L${P(bx + half, py1)}L${P(bx - half, py1)}L${P(bx - half, i === 0 ? ry : ry + 2.4)}`;
  }
  comb += 'Z';
  b.fill(onPlane(CM.anchor, S4_PLANE.backs), comb);
  return b;
}

/** Her far window (tier B: no outline, calm C* <= 25), drawn on the backs plane over her house. */
export const S4HerWindow: React.FC = () => {
  const b = useMemo(herWindowBatch, []);
  return (
    <Tier tier="support" tone={CM.hero}>
      <Paint b={b} seed="s4herWin" misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- the allotment yard in the sun's gap

const YARD = {gx: 196, gw: 84, ge: 812, gr: 790, sx: 300, sw: 58, st: 800, bx: 382, ax: 486};
const SUNFLOWERS: [number, number][] = [[412, 742], [432, 756], [450, 748]];

function yardInto(b: Batch) {
  const g = GROUND;
  const {gx, gw, ge, gr, sx, sw, st, bx, ax} = YARD;
  const w0 = HER_HOUSE.x1;
  const w1 = CLEAR[1] + 10;
  // L0 the yard's back wall (from her house's corner to the first back extension)
  b.rect(CM.brickLight, w0, 818, w1 - w0, g - 818);
  b.layer();
  // L1 coping; greenhouse glass, the shed, the water butt, the apple trunk
  b.rect(CM.limestone, w0, 815, w1 - w0, 4);
  b.poly(CM.glass, [[gx, g], [gx, ge], [gx + gw / 2, gr], [gx + gw, ge], [gx + gw, g]]);
  b.rect(CM.line, sx, st, sw, g - st);
  b.rect(CM.sage, sx - 22, 832, 16, g - 832);
  b.rect(CM.line, ax - 3, 800, 6, g - 800);
  b.layer();
  // L2 the tomato plants in the greenhouse, the shed's roof / window / door, the butt's lid, the apple crown, the leaves
  b.fill(CM.sage, lobes(gx + 6, gx + gw - 6, g, 34, 's4gh/tom', 4));
  b.poly(CM.paneUnlit, [[sx - 5, st + 2], [sx + sw + 5, st - 7], [sx + sw + 5, st - 2], [sx - 5, st + 7]]);
  b.rect(CM.glass, sx + 8, st + 14, 18, 14);
  b.rect(CM.coatSlate, sx + 32, st + 14, 20, g - st - 14);
  b.rect(CM.coatSlate, sx - 23, 830, 18, 3);
  b.fill(CM.sage, lobes(ax - 34, ax + 30, 812, 70, 's4yard/apple', 4));
  for (const [x, y] of SUNFLOWERS) b.fill(CM.sage, leafPath(x - 6, y + 40, 14, 4.5, 30));
  b.fill(CM.sage, leafPath(bx - 8, 800, 16, 5, 70));
  b.fill(CM.sage, leafPath(bx + 2, 820, 14, 5, 40));
  b.layer();
  // L3 the greenhouse's top glass, the gold of the apple crown, the bean leaves' gold, the sunflower heads
  b.poly(CM.glass, [[gx + 4, ge + 3], [gx + gw / 2, gr + 4], [gx + gw / 2, gr + 14], [gx + 4, ge + 12]]);
  b.fill(CM.leafGold, lobes(ax - 14, ax + 26, 800, 40, 's4yard/apple2', 3));
  b.fill(CM.leafGold, leafPath(bx + 7, 786, 14, 5, -60));
  b.fill(CM.leafGold, leafPath(bx - 4, 772, 12, 4, -30));
  for (const [x, y] of SUNFLOWERS) b.fill(CM.coatMustard, ovalPath(x + 3, y + 2, 9, 7.5));
}

// ---------------------------------------------------------------- the terrace backs

type House = {x0: number; x1: number; brick: string; ridge: number; eave: number; roof: string; dormer?: boolean; ext: 'left' | 'right'; extTop: number; ivy?: boolean; render?: boolean};
export const HOUSES: House[] = [
  {x0: 512, x1: 676, brick: CM.brick, ridge: 618, eave: 660, roof: CM.paneUnlit, ext: 'left', extTop: 776},
  {x0: 676, x1: 846, brick: CM.brick, ridge: 616, eave: 656, roof: CM.shadeCool, dormer: true, ext: 'right', extTop: 770},
  {x0: 846, x1: 1012, brick: CM.brickDeep, ridge: 620, eave: 662, roof: CM.paneUnlit, ext: 'left', extTop: 782, ivy: true},
  {x0: 1012, x1: 1182, brick: CM.brickLight, ridge: 615, eave: 655, roof: CM.shadeCool, dormer: true, ext: 'right', extTop: 772},
  {x0: 1182, x1: X1, brick: CM.brick, ridge: 619, eave: 660, roof: CM.paneUnlit, ext: 'left', extTop: 778},
];
const extOf = (h: House) => {
  const w = h.x1 - h.x0;
  return h.ext === 'left' ? {x0: h.x0, x1: h.x0 + w * 0.48} : {x0: h.x0 + w * 0.52, x1: h.x1};
};
/** The party-wall stack on each house's west boundary (x0): its box (the light layer's form step needs it). */
const stackOf = (h: House, i: number) => {
  const r = rng(`s4house3/${i}`);
  const cw = 22;
  const top = Math.max(ROW.top + 6, h.ridge - 16 - r.range(0, 4));
  return {x0: h.x0 - cw / 2, x1: h.x0 + cw / 2, top, bottom: h.ridge + 6};
};

export type BackWin = {x: number; y: number; w: number; h: number; seed: string; i: number};

/** The windows of the terrace (first-floor pairs and a kitchen window each), in a fixed order. */
export const BACK_WINS: BackWin[] = (() => {
  const out: BackWin[] = [];
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const wy = h.eave + 22;
    out.push({x: h.x0 + w * 0.2, y: wy, w: 32, h: 54, seed: `s4hw${i}0`, i: out.length});
    out.push({x: h.x0 + w * 0.62, y: wy, w: 32, h: 54, seed: `s4hw${i}1`, i: out.length});
    out.push({x: h.ext === 'left' ? h.x0 + w * 0.66 : h.x0 + w * 0.16, y: 800, w: 38, h: 52, seed: `s4hg${i}`, i: out.length});
  });
  return out;
})();
/** The few warmly lit rear windows (static for the whole shot: nothing switches; CRAFT §b's life budget). */
const LIT_WINS = new Set([2, 5, 9, 13]);

function housesInto(b: Batch) {
  // P0: roofs, rear walls
  HOUSES.forEach((h) => {
    const w = h.x1 - h.x0;
    b.poly(h.roof, [[h.x0 - 3, h.eave], [h.x0 + 4, h.ridge], [h.x1 - 4, h.ridge], [h.x1 + 3, h.eave]]);
    b.rect(h.render ? CM.stucco : h.brick, h.x0, h.eave, w, GROUND - h.eave);
  });
  b.layer();
  // P1: ridge tiles, the fascia, dormer bodies, the back extensions
  HOUSES.forEach((h) => {
    const w = h.x1 - h.x0;
    const e = extOf(h);
    b.rect(CM.stoneShade, h.x0 + 4, h.ridge - 3, w - 8, 3.5);
    b.rect(CM.limestone, h.x0 - 3, h.eave - 1, w + 6, 4);
    if (h.dormer) b.rect(CM.stucco, h.x0 + w * 0.3, h.ridge + 4, w * 0.42, h.eave - h.ridge - 4);
    b.rect(h.brick === CM.brickLight ? CM.brick : CM.brickLight, e.x0, h.extTop + 14, e.x1 - e.x0, GROUND - h.extTop - 14);
  });
  b.layer();
  // P2: dormer caps and windows, bathroom windows, extension roofs, French-door frames
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const e = extOf(h);
    const wy = h.eave + 22;
    if (h.dormer) {
      const dx = h.x0 + w * 0.3;
      const dw = w * 0.42;
      b.rect(CM.stoneShade, dx - 2, h.ridge + 2, dw + 4, 3);
      b.rect(i === 1 ? CM.lamp : CM.paneUnlit, dx + 6, h.ridge + 11, dw - 12, h.eave - h.ridge - 18);
    }
    b.rect(CM.paper, h.x0 + w * 0.45 - 2, wy + 6, 18, 24);
    b.poly(CM.paneUnlit, [[e.x0 - 3, h.extTop + 16], [e.x0 - 3, h.extTop + (h.ext === 'left' ? 6 : -4)], [e.x1 + 3, h.extTop + (h.ext === 'left' ? -4 : 6)], [e.x1 + 3, h.extTop + 16]]);
    b.rect(CM.paper, lerp(e.x0, e.x1, 0.3) - 3, h.extTop + 28, 46, GROUND - h.extTop - 28);
    b.rect(CM.line, h.x0 + w * 0.2 - 3, wy + 60, 38, 6);
  });
  b.layer();
  // P3: bathroom glass, skylights, French-door glass, ivy, the stacks
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const e = extOf(h);
    const wy = h.eave + 22;
    const r = rng(`s4house3/${i}`);
    b.rect(CM.glass, h.x0 + w * 0.45, wy + 8, 14, 20);
    b.rect(CM.glass, lerp(e.x0, e.x1, 0.35), h.extTop + (h.ext === 'left' ? 0 : 1), 18, 5);
    b.rect(r.chance(0.5) ? CM.glass : CM.paneUnlit, lerp(e.x0, e.x1, 0.3), h.extTop + 31, 40, GROUND - h.extTop - 31);
    if (h.ivy) {
      for (let k = 0; k < 9; k++) {
        const iy = GROUND - k * 24 - r.range(0, 10);
        const ix = h.x0 + w * 0.06 + Math.sin(k * 1.3) * 8;
        b.fill(k % 3 === 2 ? CM.leafGold : CM.sage, lobes(ix - 14, ix + 14, iy, 22, `s4ivy${k}`, 3));
      }
    }
    const s = stackOf(h, i);
    b.rect(i % 2 ? CM.brickLight : CM.brick, s.x0, s.top, s.x1 - s.x0, s.bottom - s.top);
  });
  b.layer();
  // P4: the stacks' caps and pots
  HOUSES.forEach((h, i) => {
    const s = stackOf(h, i);
    b.rect(CM.limestone, s.x0 - 2, s.top, s.x1 - s.x0 + 4, 3.5);
    for (let p = 0; p < 3; p++) b.rect(p === 1 ? CM.leafRust : CM.brickDeep, s.x0 + 2 + p * 6.5, Math.max(ROW.top, s.top - 5), 5, 5);
  });
}

/** Rear sashes (frames, glass, a lit room's lamp and curtains; the meeting rail and the sill): static. */
function sashesInto(b: Batch, wins: BackWin[]) {
  const lit = (w: BackWin) => LIT_WINS.has(w.i);
  for (const w of wins) b.rect(CM.paper, w.x - 3, w.y - 3, w.w + 6, w.h + 5);
  b.layer();
  for (const w of wins) b.rect(lit(w) ? CM.lamp : CM.paneUnlit, w.x, w.y, w.w, w.h);
  b.layer();
  for (const w of wins) {
    const r = rng(w.seed);
    if (lit(w)) {
      b.rect(CM.lampCore, w.x + w.w * 0.22, w.y + w.h * 0.12, w.w * 0.5, w.h * 0.36);
      const c = r.pick([CM.box, CM.coatMustard, CM.blossom, CM.sage, CM.leafRust]);
      b.rect(c, w.x, w.y, w.w * 0.2, w.h);
      b.rect(c, w.x + w.w * 0.8, w.y, w.w * 0.2, w.h);
    } else if (r.chance(0.5)) b.rect(CM.coatOat, w.x, w.y, w.w, w.h * r.range(0.18, 0.4));
  }
  b.layer();
  for (const w of wins) {
    b.rect(CM.paper, w.x, w.y + w.h * 0.48, w.w, 2.2);
    b.rect(CM.limestone, w.x - 5, w.y + w.h + 2, w.w + 10, 4);
  }
}

/** Trees in the back gardens: a big autumn plane (house 3) and a smaller one (house 5); still (no sway). */
const TREES = [
  {x: 930, base: GROUND, h: 190, seed: 's4tree1'},
  {x: 1250, base: GROUND, h: 150, seed: 's4tree2'},
];

function treesInto(b: Batch) {
  const geo = TREES.map((tr) => ({...tr, R: tr.h * 0.42, cy: tr.base - tr.h * 0.62}));
  for (const g of geo) b.fill(CM.line, `M${P(g.x - 6, g.base)}L${P(g.x - 3, g.cy + g.R * 0.2)}L${P(g.x + 3, g.cy + g.R * 0.2)}L${P(g.x + 6, g.base)}Z`);
  b.layer();
  for (const g of geo) b.fill(CM.sage, lobes(g.x - g.R, g.x + g.R, g.cy + g.R * 0.75, g.R * 1.6, `${g.seed}/a`, 5));
  b.layer();
  for (const g of geo) {
    b.fill(CM.leafGold, lobes(g.x - g.R * 0.75, g.x + g.R * 0.2, g.cy + g.R * 0.3, g.R * 1.0, `${g.seed}/b`, 3));
    b.fill(CM.leafRust, lobes(g.x + g.R * 0.05, g.x + g.R * 0.85, g.cy + g.R * 0.62, g.R * 0.8, `${g.seed}/c`, 3));
  }
  b.layer();
  for (const g of geo) b.fill(CM.coatMustard, lobes(g.x - g.R * 0.3, g.x + g.R * 0.35, g.cy - g.R * 0.25, g.R * 0.6, `${g.seed}/d`, 2));
}

/** The light layer's shapes on this plane (plane px): planes turned from the low western sun (the back extensions' east
 *  returns, the dormers' east cheeks) take one Shade step; the stacks take a form step on their east side. */
export const BACKS_SHADES = (() => {
  const form: string[] = [];
  const stacks: string[] = [];
  HOUSES.forEach((h, i) => {
    const w = h.x1 - h.x0;
    const e = extOf(h);
    form.push(`M${P(e.x1 - 10, h.extTop + (h.ext === 'left' ? 10 : 16))}L${P(e.x1, h.extTop + (h.ext === 'left' ? 9 : 15))}L${P(e.x1, GROUND)}L${P(e.x1 - 10, GROUND)}Z`);
    if (h.dormer) form.push(`M${P(h.x0 + w * 0.72, h.ridge + 6)}L${P(h.x0 + w * 0.72 + 14, h.ridge + 14)}L${P(h.x0 + w * 0.72 + 14, h.eave - 2)}L${P(h.x0 + w * 0.72, h.eave - 2)}Z`);
    const s = stackOf(h, i);
    stacks.push(`M${P(s.x0, s.top + 3.5)}L${P(s.x1, s.top + 3.5)}L${P(s.x1, s.bottom)}L${P(s.x0, s.bottom)}Z`);
  });
  const st = HER_HOUSE.stack;
  stacks.push(`M${P(st.x0, st.top + 4)}L${P(st.x1, st.top + 4)}L${P(st.x1, HER_HOUSE.mansardTop + 2)}L${P(st.x0, HER_HOUSE.mansardTop + 2)}Z`);
  return {form, stacks};
})();

// ---------------------------------------------------------------- the plane

/** The whole backs plane (static: one batch, one plane palette), her window over it, then its light layer. */
export const BacksPlane: React.FC = () => {
  const stat = useMemo(() => {
    const b = new Batch();
    herHouseInto(b);
    b.layer();
    housesInto(b);
    b.layer();
    sashesInto(b, BACK_WINS);
    b.layer();
    yardInto(b);
    b.layer();
    treesInto(b);
    return planeBatch(b, S4_PLANE.backs, {keep: [CM.lamp, CM.lampCore, CM.hero]});
  }, []);
  return (
    <>
      <Paint b={stat} seed="s4backsSt" misreg={false} />
      <S4HerWindow />
      <S4BacksShades form={BACKS_SHADES.form} stacks={BACKS_SHADES.stacks} />
    </>
  );
};
