// V2S1 world (lane L1): THE NEAR HALF OF THE SET and its life: the water (y 1110-1215: reflections, ripples, glints,
// split by region so the flood ripples across it, with an f0 ripple underdrawing in ink), the far towpath that BENDS
// AWAY at the left (map S1_TOWPATH_FEET: its paving, joints as thin fills, the coping, the water's far edge, receding
// bollards and lamps that follow the curve), the two moored boats in the right rail (the kit's boatInto painted ink-only),
// the far-towpath life (K4 Person directly, explicit traits; every V2S1_clock KEEP_CLEAR zone respected, no lookalike of
// her within LOOKALIKE_RADIUS_PX) and the calm life of the right rail (a boater on the stern deck, a cat on a roof), the
// plane branch in the top-left gutter (redrawn: a clean twig with five plane leaves), the frame-0 water lines.
// Kit defects worked around here: towpath.tsx Towpath draws its joints in CM.line (a coloured stroke): copied and
// adapted (joints = thin stone fills + an f0 ink underdrawing); boat.tsx boatInto draws the fender ropes in CM.line:
// painted with CellPaint (every stroke CM.ink); life.tsx Branch reads as noise at f0 / 216 px: redrawn.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line} from '../../lib/sketch';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {Batch, P, Pt, rng, ovalPath, lerp, leafPath, lobes} from '../kit/canal/core';
import {boatInto, boatGeom, BoatOpts} from '../kit/canal/boat';
import {bollardInto} from '../kit/canal/towpath';
import {Puffs} from '../kit/canal/life';
import {Person} from '../kit/cast';
import * as MAP from '../world/map';
import {CellPaint, Under, UnderPaint, barPath, planeLeaf} from './V2S1_set_core';
import {floodAt} from './V2S1_clock';

const S = MAP.S1_SHEET;
const frac = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------- the far towpath and its bend

/** Bend offset (y px) from the straight at screen x (map S1_TOWPATH_FEET). */
export const s1Bend = (x: number) => MAP.s1TowpathFeetY(x) - S.herLineFeetY;
/** The far towpath on the straight: back edge (the wing's foot / the bridge abutment), the coping, the water. */
export const S1_PATH = {top: 1068, edge: 1111, coping: 15, x0: -40, x1: 1120} as const;

function band(x0: number, x1: number, a: number, c: number, off: (x: number) => number): Pt[] {
  const pts: Pt[] = [];
  for (let x = x0; x <= x1 + 20; x += 20) pts.push([Math.min(x, x1), a + off(Math.min(x, x1))]);
  for (let x = x1; x >= x0 - 20; x -= 20) pts.push([Math.max(x, x0), c + off(Math.max(x, x0))]);
  return pts;
}

/** The far towpath: paving in regions (the flood ripples along it), broken joints as thin stone fills (their ink only
 *  at f0), specks, fallen leaves, the limestone coping with its lip line in ink (it carries the canal's edge and the
 *  bend), mooring rings and bollards that recede round the curve. */
export const S1FarTowpath: React.FC = () => {
  const {b, u} = useMemo(() => {
    const b = new Batch();
    const u = new Under();
    const r = rng('s1farpath');
    const {top, edge, coping, x0, x1} = S1_PATH;
    const H = edge - top;
    const off = s1Bend;
    // the paving, in 120 px strips (the bend's far end floods first)
    for (let x = x0; x < x1; x += 120) b.poly(CM.paving, band(x - 1, Math.min(x1, x + 121), top, edge + 1, off));
    // the wall's foot: a darker strip along the back
    for (let x = x0; x < x1; x += 120) b.poly(CM.stucco, band(x - 1, Math.min(x1, x + 121), top, top + 6, off));
    b.layer();
    // broken joints: short runs + a few cross ticks (thin stone fills; the f0 drawing has them in ink)
    const rows = Math.max(1, Math.round(H / 18));
    for (let k = 1; k <= rows; k++) {
      const yy = top + (H * k) / (rows + 1) - 3;
      let x = x0 + r.range(0, 60);
      while (x < x1) {
        const L = r.range(36, 110) * lerp(0.7, 1, Math.min(1, Math.max(0, x / 500)));
        if (r.chance(0.55)) {
          const a: Pt = [x, yy + off(x) + r.jitter(1)];
          const c: Pt = [x + L, yy + off(x + L) + r.jitter(1.2)];
          b.fill(CM.stoneShade, barPath(a, c, 1.3));
          u.add(Math.round((x + L / 2) / 140) * 140, yy, `M${P(a[0], a[1])}L${P(c[0], c[1])}`, INK_PX.hair);
        }
        if (r.chance(0.3)) {
          const a: Pt = [x + L * 0.5, yy + off(x + L * 0.5)];
          const c: Pt = [x + L * 0.5 + r.jitter(3), yy + off(x + L * 0.5) + H / (rows + 1) - 2];
          b.fill(CM.stoneShade, barPath(a, c, 1.2));
        }
        x += L + r.range(20, 90);
      }
    }
    // specks
    for (let i = 0; i < (x1 - x0) / 26; i++) {
      const sx = r.range(x0, x1);
      b.fill(CM.stoneShade, ovalPath(sx, r.range(top + 4, edge - coping - 2) + off(sx), r.range(1.2, 2.6), r.range(0.8, 1.5)));
    }
    b.layer();
    // fallen leaves (bigger toward the near edge)
    for (let i = 0; i < 16; i++) {
      const yy = r.range(top + H * 0.2, edge - coping - 2);
      const s = lerp(7, 12, (yy - top) / Math.max(1, H)) * lerp(0.7, 1, Math.min(1, Math.max(0, r.next())));
      const lx = r.range(x0 + 20, x1);
      b.fill(r.pick([CM.leafGold, CM.leafRust, CM.coatMustard]), leafPath(lx, yy + off(lx), s, s * 0.35, r.range(-30, 30)));
    }
    b.layer();
    // the coping (limestone) + its shade, the shade it casts on the water below
    for (let x = x0; x < x1; x += 120) {
      const xe = Math.min(x1, x + 121);
      b.poly(CM.waterDeep, band(x - 1, xe, edge, edge + 8, off));
      b.poly(CM.limestone, band(x - 1, xe, edge - coping, edge, off));
      b.poly(CM.stoneShade, band(x - 1, xe, edge - coping * 0.3, edge, off));
    }
    // coping joints (ink: short ticks), the lip line (ink, open, following the bend)
    let j = '';
    let lip = '';
    for (let x = x0 + 30; x < x1; x += r.range(64, 120)) {
      const k = Math.min(1, Math.max(0.55, x / 400));
      j += `M${P(x, edge - coping * k + 1 + off(x))}L${P(x + r.jitter(1), edge - coping * 0.3 + off(x))}`;
    }
    for (let x = x0; x <= x1; x += 20) lip += `${x === x0 ? 'M' : 'L'}${P(x, edge - coping + off(x))}`;
    b.ink(j, INK_PX.hair);
    b.ink(lip, INK_PX.far, CM.ink, 0.15);
    // the water's far edge under the coping (ink on the stone's foot, not on the water)
    let foot = '';
    for (let x = x0; x <= x1; x += 20) foot += `${x === x0 ? 'M' : 'L'}${P(x, edge + off(x))}`;
    b.ink(foot, INK_PX.hair, CM.ink, 0.35);
    // mooring rings (ink circles) on the coping
    for (const rx of [380, 900]) {
      const ry = edge - coping * 0.45 + off(rx);
      b.ink(`M${P(rx - 4, ry)}A4 4 0 1 0 ${P(rx + 4, ry)}A4 4 0 1 0 ${P(rx - 4, ry)}`, INK_PX.hair);
    }
    return {b, u};
  }, []);
  return (
    <>
      <CellPaint b={b} seed="s1path" cell={140} misreg={0.6} />
      <UnderPaint u={u} seed="s1pathU" />
    </>
  );
};

/** Bollards and lamp posts along the far towpath, shrinking round the bend (the row's diminishing reads as "down the
 *  bending towpath"). Lamps stand at the path's back (the wall side), bollards on the coping. */
const S1_BOLLARDS = [770, 430, 262, 160, 66];
const S1_FAR_LAMPS = [{x: 1046, h: 366}, {x: 752, h: 340}, {x: 360, h: 0}, {x: 205, h: 0}];
export const S1PathFurniture: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    const {edge, coping} = S1_PATH;
    for (const x of S1_BOLLARDS) {
      const k = MAP.s1FigureHAt(x) / S.herH;
      bollardInto(b, x, edge - coping * 0.5 + s1Bend(x) - 2, 22 * k, `s1bol/${x}`);
    }
    // lamp posts (heritage: plinth, fluted column, lantern), sized by the bend's scale
    for (const L of S1_FAR_LAMPS) {
      const k = MAP.s1FigureHAt(L.x) / S.herH;
      const h = L.h || 350 * k;
      const y = S1_PATH.top + 6 + s1Bend(L.x);
      lampInto(b, L.x, y, h, `s1lamp/${L.x}`);
    }
    return b;
  }, []);
  return <CellPaint b={b} seed="s1furn" cell={120} misreg={0.5} />;
};

/** A heritage lamp post (kit towpath Lamp, copied: its Paint can't be split by region), off (the golden hour). */
function lampInto(b: Batch, x: number, y: number, h: number, seed: string) {
  const color = CM.anchor;
  const cw = Math.max(2.2, h * 0.034);
  b.fill(color, `M${P(x - cw * 1.6, y)}L${P(x - cw * 1.2, y - h * 0.08)}L${P(x + cw * 1.2, y - h * 0.08)}L${P(x + cw * 1.6, y)}Z`);
  b.fill(color, `M${P(x - cw * 0.7, y - h * 0.08)}L${P(x - cw * 0.45, y - h * 0.8)}L${P(x + cw * 0.45, y - h * 0.8)}L${P(x + cw * 0.7, y - h * 0.08)}Z`);
  b.rect(color, x - cw * 1.0, y - h * 0.36, cw * 2, h * 0.018);
  b.rect(color, x - cw * 2.6, y - h * 0.79, cw * 5.2, Math.max(1.5, h * 0.012));
  const lb = y - h * 0.82;
  const lt = y - h * 0.94;
  const lw0 = cw * 1.5;
  const lw1 = cw * 2.4;
  b.fill(CM.glass, `M${P(x - lw0, lb)}L${P(x - lw1, lt)}L${P(x + lw1, lt)}L${P(x + lw0, lb)}Z`);
  b.fill(CM.skyHigh, `M${P(x - lw0 * 0.9, lb)}L${P(x - lw1 * 0.9, lt)}L${P(x - lw1 * 0.35, lt)}L${P(x - lw0 * 0.3, lb)}Z`);
  b.fill(color, `M${P(x - lw1 * 1.15, lt)}L${P(x, lt - h * 0.045)}L${P(x + lw1 * 1.15, lt)}Z`);
  b.fill(color, ovalPath(x, lt - h * 0.055, cw * 0.5, cw * 0.6));
  const w = h > 240 ? INK_PX.far : h > 120 ? INK_PX.hair : 0;
  if (w > 0) {
    b.ink(`M${P(x - lw0, lb)}L${P(x - lw1, lt)}M${P(x + lw0, lb)}L${P(x + lw1, lt)}M${P(x - lw1 * 1.15, lt)}L${P(x, lt - h * 0.045)}L${P(x + lw1 * 1.15, lt)}`, Math.max(1.4, w * 0.7));
    b.ink(line(x - cw * 0.6, y - h * 0.08, x - cw * 0.45, y - h * 0.79, {seed: `${seed}/c`, over: 'small'}), w);
  }
}

/** The bend's lamps and bollards in ink at f0 too (the small ones get no ink in colour). */
export const S1PathFurnitureUnder: React.FC = () => {
  const u = useMemo(() => {
    const u = new Under();
    for (const L of S1_FAR_LAMPS) {
      if (L.h) continue;
      const k = MAP.s1FigureHAt(L.x) / S.herH;
      const h = 350 * k;
      const y = S1_PATH.top + 6 + s1Bend(L.x);
      u.add(L.x, y - h / 2, `M${P(L.x, y)}L${P(L.x, y - h * 0.8)}M${P(L.x - 6, y - h * 0.82)}L${P(L.x - 8, y - h * 0.94)}L${P(L.x + 8, y - h * 0.94)}L${P(L.x + 6, y - h * 0.82)}Z`, INK_PX.hair);
    }
    return u;
  }, []);
  return <UnderPaint u={u} seed="s1furnU" />;
};

// ---------------------------------------------------------------- the water

type Refl = {x0: number; x1: number; color: string; depth: number};
const REFL: Refl[] = [
  {x0: 330, x1: 1080, color: CM.brickLight, depth: 46},
  {x0: 0, x1: 320, color: CM.brick, depth: 30},
  {x0: 548, x1: 712, color: CM.lamp, depth: 28},
  {x0: 120, x1: 280, color: CM.sun, depth: 0},
];
const WATER = {y0: S.water.y0 - 2, y1: S.water.y1 + 2, x0: -40, x1: 1120} as const;

/** The canal between the far coping and our bank: base colour in regions, the wing's broken reflection, the sun's
 *  (orange only on the sun disc: its reflection is gold), ripple lenses drifting west, paper glints switching; the
 *  frame-0 drawing = ripple strokes in ink that vanish on the frame the water's colour reaches them. */
export const S1Water: React.FC = () => {
  const t = useTime();
  const {y0, y1, x0, x1} = WATER;
  const H = y1 - y0;
  const base = useMemo(() => {
    const b = new Batch();
    for (let x = x0; x < x1; x += 140) {
      b.rect(CM.water, x - 0.5, y0, 141, H);
      b.rect(CM.waterDeep, x - 0.5, y0, 141, 9);
    }
    return b;
  }, []);
  const under = useMemo(() => {
    const u = new Under();
    const r = rng('s1waterU');
    for (let i = 0; i < 34; i++) {
      const v = r.next();
      const yy = y0 + 14 + v * (H - 20);
      const w = r.range(26, 64) * lerp(0.8, 1.3, v);
      const x = r.range(x0 + 30, x1 - 30);
      const d = `M${P(x - w / 2, yy)}Q${P(x - w / 4, yy - 2.5)} ${P(x, yy)}Q${P(x + w / 4, yy + 2.5)} ${P(x + w / 2, yy)}`;
      u.add(Math.round(x / 140) * 140 + 70, y0 + H / 2, d, INK_PX.hair);
    }
    return u;
  }, []);
  const b = new Batch();
  const r = rng('s1water');
  const rt = y0 + 10;
  REFL.forEach((ref, i) => {
    const color = ref.color === CM.sun ? CM.lamp : ref.color;
    const depth = ref.depth || 60;
    const rows = Math.max(3, Math.round(depth / 7));
    const W = ref.x1 - ref.x0;
    for (let k = 0; k < rows; k++) {
      const yy = rt + 2 + (k / rows) * depth;
      const keep = 1 - k / rows;
      const hh = Math.max(2, 3 + k * 0.3);
      let x = ref.x0 + r.range(0, 30);
      while (x < ref.x1) {
        const len = Math.min(ref.x1 - x, r.range(14, 46) * (0.5 + keep * 0.6) * Math.max(0.5, Math.min(1.4, W / 300)));
        if (r.chance(0.35 + 0.5 * keep)) {
          const xx = x + Math.sin(t * 1.1 + k * 0.9 + i + x * 0.01) * (2 + k * 0.4);
          b.fill(color, `M${P(xx, yy)}L${P(xx + len, yy)}L${P(xx + len - 2, yy + hh)}L${P(xx + 2, yy + hh)}Z`);
        }
        x += len + r.range(8, 30) * (1.2 - keep * 0.5);
      }
    }
  });
  b.layer();
  const span = x1 - x0;
  for (let i = 0; i < 32; i++) {
    const v = r.next();
    const yy = y0 + 16 + v * (H - 22);
    const s = lerp(1, 1.6, v);
    const w = r.range(22, 70) * s;
    const x = x0 + frac((r.range(0, span) - 9 * s * t) / span) * span;
    const hh = 2.2 * s;
    b.fill(CM.waterDeep, `M${P(x - w / 2, yy)}Q${P(x, yy - hh)} ${P(x + w / 2, yy)}Q${P(x, yy + hh)} ${P(x - w / 2, yy)}Z`);
  }
  for (let i = 0; i < 18; i++) {
    const v = r.next();
    const yy = y0 + 14 + v * (H - 18);
    const per = r.range(1.2, 2.6);
    const on = frac(t / per + r.next()) < 0.42;
    const s = lerp(1, 1.6, v);
    const x = r.range(x0 + 20, x1 - 20) + Math.sin(t * 0.8 + i) * 6;
    if (on) b.fill(CM.paper, `M${P(x - 9 * s, yy)}L${P(x + 9 * s, yy - 1)}L${P(x + 7 * s, yy + 2.2 * s)}L${P(x - 7 * s, yy + 2.2 * s)}Z`);
  }
  return (
    <>
      <CellPaint b={base} seed="s1water/base" cell={140} misreg={0} />
      <CellPaint b={b} seed="s1water/life" cell={140} misreg={0} live />
      <UnderPaint u={under} seed="s1water/u" />
    </>
  );
};

// ---------------------------------------------------------------- the two moored boats (the right rail)

const BOAT_A: BoatOpts = {x: 786, water: 1140, len: 560, h: 74, dir: -1, seed: 's1boatA', cabin: CM.sage, topView: 8, roofItems: true, panel: false};
const BOAT_B: BoatOpts = {x: 930, water: 1196, len: 520, h: 86, dir: -1, seed: 's1boatB', cabin: CM.coatOat, topView: 10, roofItems: true, panel: true};

const OneBoat: React.FC<{o: BoatOpts; smoke?: boolean; bursts?: number[]}> = ({o, smoke, bursts}) => {
  const b = useMemo(() => {
    const b = new Batch();
    boatInto(b, o, 0);
    return b;
  }, []);
  const g = boatGeom(o);
  const chX = g.X(o.chimney ?? 0.22);
  const chTop = g.roofY - g.roofH - (o.topView ?? 0) * 0.5 - 40 * (o.h / 100);
  return (
    <>
      <CellPaint b={b} seed={`s1boat/${o.seed}`} cell={160} misreg={0.8} />
      {smoke ? <Puffs x={chX} y={chTop - 2} seed={`${o.seed}/smoke`} kind="smoke" scale={Math.max(0.4, Math.min(1.5, o.h / 110))} bursts={bursts} drift={-o.dir * 30 - 20} /> : null}
    </>
  );
};

/** Boat A (behind, sage) with the stove's chimney puff at 0.70 (TREATMENT f42), boat B (front, oat); between them the
 *  calm life of the right rail: a boater on A's stern deck coiling a rope, a ginger cat asleep on B's roof that lifts
 *  its head on the bus (1.10) and on "life" (4.98). */
export const S1Boats: React.FC = () => (
  <>
    <OneBoat o={BOAT_A} smoke bursts={[MAP.S1_CLOCK.doorsOpen + 0.18]} />
    <Boater />
    <OneBoat o={BOAT_B} />
    <Cat />
  </>
);

/** The boater: a small back-ish figure (3/4) at A's stern, a cap, a mustard jumper (no plum, no bun, no long coat:
 *  LOOKALIKE_RADIUS_PX), slowly coiling a rope: a gentle sway, a turn of the head on the ding. */
const Boater: React.FC = () => {
  const t = useTime();
  const g = boatGeom(BOAT_A);
  const x = g.X(0.03);
  const y = g.gunTop + 1;
  const sway = Math.sin(t * 2.1) * 0.06;
  return <Person x={x} y={y} h={112} seed="s1/boater" pose="stand" view="rear34" turn={t > 0.47 && t < 1.3 ? 0.5 : sway} traits={{hair: 'beanie', hatColor: CM.brick, coat: CM.coatMustard, coatLen: 'jacket', trousers: CM.coatSlate, acc: 'none'}} />;
};

/** A ginger cat curled on boat B's roof: a loaf of leafRust with a tail curl; lifts its head at 1.10 and 4.98. */
const Cat: React.FC = () => {
  const t = useTime();
  const g = boatGeom(BOAT_B);
  const x = g.X(0.62);
  const y = g.roofY - g.roofH - 6;
  const up = (a: number) => Math.max(0, Math.min(1, (t - a) / 0.12)) * Math.max(0, Math.min(1, (a + 1.3 - t) / 0.2));
  const lift = Math.max(up(MAP.S1_CLOCK.doorsShut), up(MAP.S1_LIFE_T));
  const b = new Batch();
  b.fill(CM.leafRust, `M${P(x - 22, y)}Q${P(x - 24, y - 15)} ${P(x - 4, y - 16)}Q${P(x + 16, y - 16)} ${P(x + 20, y)}Z`);
  // the tail round the front
  b.fill(CM.leafRust, `M${P(x - 18, y)}Q${P(x - 4, y + 4)} ${P(x + 14, y - 1)}L${P(x + 14, y - 4)}Q${P(x - 4, y)} ${P(x - 18, y - 3)}Z`);
  // the head (lifts) + two ear points
  const hx = x + 16;
  const hy = y - 9 - lift * 6;
  b.fill(CM.leafRust, ovalPath(hx, hy, 8, 6.5));
  b.fill(CM.leafRust, `M${P(hx - 6, hy - 3)}L${P(hx - 4, hy - 11)}L${P(hx - 1, hy - 5)}Z`);
  b.fill(CM.leafRust, `M${P(hx + 1, hy - 5)}L${P(hx + 5, hy - 11)}L${P(hx + 6, hy - 2)}Z`);
  b.fill(CM.brickDeep, `M${P(x - 14, y - 13)}Q${P(x - 4, y - 16)} ${P(x + 6, y - 14)}L${P(x + 6, y - 12)}Q${P(x - 4, y - 14)} ${P(x - 14, y - 11)}Z`);
  b.ink(`M${P(x - 22, y)}Q${P(x - 24, y - 15)} ${P(x - 4, y - 16)}Q${P(x + 8, y - 16)} ${P(x + 12, y - 12)}`, INK_PX.hair);
  return <CellPaint b={b} seed="s1cat" cell={1000} misreg={0} live />;
};

// ---------------------------------------------------------------- the far-towpath life

/** Jogger 1 (TREATMENT f96): in frame at f0 on the bend (x ~57, ink only), runs EAST at 360 px/s (~2.4 body heights/s)
 *  on the path's back half, out of the doorway zone until 1.25 (x 507), passes BEHIND her at 1.66, clear of her by
 *  ~1.85, gone right by 3.0. Cap, mustard top, slate tights (no plum, bun or long coat near her). */
export const S1_JOG1 = {pass: 1.66, at: 655, speed: 360} as const;
/** Jogger 2 (TREATMENT f195): enters left ~1.9, runs EAST at 295 px/s through the row unaware (G3 ~3.40, after G3's
 *  pop), passes her ~3.95, beyond x 600 by 4.4 (the row's zone), gone right by ~5.8. Beanie, rust top. */
export const S1_JOG2 = {pass: 3.95, at: 561, speed: 295} as const;
export const s1Jog1X = (t: number) => S1_JOG1.at + S1_JOG1.speed * (t - S1_JOG1.pass);
export const s1Jog2X = (t: number) => S1_JOG2.at + S1_JOG2.speed * (t - S1_JOG2.pass);

const Jogger: React.FC<{x: number; seed: string; traits: React.ComponentProps<typeof Person>['traits']; rate: number}> = ({x, seed, traits, rate}) => {
  if (x < -70 || x > 1150) return null;
  const xx = Math.max(-200, Math.min(1300, x));
  const feet = MAP.s1TowpathFeetY(Math.max(0, Math.min(1080, xx))) - 9;
  const h = MAP.s1FigureHAt(Math.max(0, Math.min(1080, xx))) * 0.94;
  return <Person x={xx} y={feet} h={h} seed={seed} pose="jog" view="profile" flip walk={{rate}} traits={traits} />;
};

/** A walker far right on the towpath behind the boats (calm: 0.9 body heights/s east, then gone at the edge). */
const S1_WALKER = {x0: 905, t0: 0, speed: 0} as const;

export const S1FarLife: React.FC = () => {
  const t = useTime();
  return (
    <>
      <Jogger x={s1Jog1X(t)} seed="s1/jog1" rate={2.9} traits={{hair: 'cap', hatColor: CM.coatSlate, hairColor: CM.hair[1], coat: CM.coatMustard, coatLen: 'jacket', trousers: CM.coatSlate, acc: 'none', shoes: CM.paper}} />
      <Jogger x={s1Jog2X(t)} seed="s1/jog2" rate={2.7} traits={{hair: 'beanie', hatColor: CM.sage, coat: CM.leafRust, coatLen: 'jacket', trousers: CM.shadeCool, acc: 'headphones', accColor: CM.coatOat, shoes: CM.paper}} />
      {/* a man reading the moorings sign far right, behind the boats: a slight sway, a turn on the ding */}
      <Person x={S1_WALKER.x0 + 140} y={MAP.s1TowpathFeetY(1045) - 14} h={MAP.s1FigureHAt(1045) * 0.9} seed="s1/standR" pose="stand" view="back" turn={t > 0.5 && t < 1.6 ? -0.45 : Math.sin(t * 1.3) * 0.08} traits={{hair: 'short', hairColor: CM.hair[2], coat: CM.coatSlate, coatLen: 'jacket', trousers: CM.line, acc: 'backpack', accColor: CM.brick}} />
    </>
  );
};

// ---------------------------------------------------------------- the plane branch (the top-left gutter, y 0-240)

/** A plane-tree twig reaching in from the top-left corner: one clean ink line (it carries form), five palmate leaves
 *  in gold and rust, swaying gently about the stem (drawn poses at 12/s); one leaf lets go at 2.6 and falls. */
export const S1PlaneBranch: React.FC = () => {
  const t = useTime();
  const tq = Math.floor(t * 12) / 12;
  const sway = Math.sin(tq * 1.6) * 2.2;
  const stem: Pt[] = [[-10, 46], [60, 70], [128, 104], [176, 136], [206, 168]];
  const at = (k: number): Pt => {
    const i = Math.min(stem.length - 2, Math.floor(k * (stem.length - 1)));
    const u = k * (stem.length - 1) - i;
    const a = stem[i];
    const c = stem[i + 1];
    return [lerp(a[0], c[0], u) + sway * k, lerp(a[1], c[1], u) + sway * k * 0.6];
  };
  const leaves: {k: number; R: number; deg: number; col: string; side: number}[] = [
    {k: 0.22, R: 50, deg: -60, col: CM.leafGold, side: -1},
    {k: 0.4, R: 58, deg: 100, col: CM.leafRust, side: 1},
    {k: 0.6, R: 50, deg: -30, col: CM.coatMustard, side: -1},
    {k: 0.78, R: 46, deg: 120, col: CM.leafGold, side: 1},
    {k: 0.98, R: 44, deg: 40, col: CM.leafRust, side: 0},
  ];
  let stemD = `M${P(...at(0))}`;
  for (let k = 0.05; k <= 1.001; k += 0.05) stemD += `L${P(...at(k))}`;
  const fills: React.ReactNode[] = [];
  let ribs = '';
  let outl = '';
  leaves.forEach((L, i) => {
    const [bx, by] = at(L.k);
    const wob = Math.sin(tq * 2.3 + i * 1.7) * 6;
    // the petiole: a short ink stroke from the stem
    const pl = 12;
    const a = ((L.deg + wob) * Math.PI) / 180;
    const px = bx + Math.cos(a) * pl;
    const py = by + Math.sin(a) * pl;
    const lf = planeLeaf(px, Math.min(py, 236 - L.R), L.R, L.deg + wob, `s1br${i}`);
    fills.push(<Fill key={`l${i}`} d={lf.d} color={L.col} seed={`s1brl${i}`} />);
    ribs += lf.ribs;
    outl += lf.d;
    ribs += `M${P(bx, by)}L${P(px, Math.min(py, 236 - L.R))}`;
  });
  return (
    <>
      {fills}
      <Ink d={stemD} width={INK_PX.far} seed="s1brStem" />
      <Ink d={outl} width={INK_PX.hair} seed="s1brOut" open={0.25} />
      <Ink d={ribs} width={INK_PX.hair} seed="s1brRib" />
    </>
  );
};

/** f0 helper: is the water still bare at x? */
export const waterBare = (t: number, x: number) => t < floodAt(x, (S.water.y0 + S.water.y1) / 2);
export {lobes};
