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
import React, {createContext, useContext, useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line} from '../../lib/sketch';
import {Fill} from '../../lib/Fill';
import {Ink} from '../../lib/Ink';
import {Batch, P, Pt, rng, ovalPath, lerp, leafPath, lobes} from '../kit/canal/core';
import {boatInto, boatGeom, BoatOpts} from '../kit/canal/boat';
import {bollardInto} from '../kit/canal/towpath';
import {Puffs} from '../kit/canal/life';
import {Person, Seated} from '../kit/cast';
import * as MAP from '../world/map';
import {CellPaint, Under, barPath, planeLeaf, S1_IRON, S1_HAZE} from './V2S1_set_core';
import {mixHex} from '../../lib/light';
import {atmos} from '../../lib/depth';
import {s1ArchOpening} from './V2S1_set_far';
import {floodAt} from './V2S1_clock';
import {edgeY} from './V2S1_steps_stone';

const S = MAP.S1_SHEET;
const frac = (x: number) => x - Math.floor(x);

// ---------------------------------------------------------------- the far towpath and its bend

/** Bend offset (y px) from the straight at screen x (map S1_TOWPATH_FEET). */
export const s1Bend = (x: number) => MAP.s1TowpathFeetY(x) - S.herLineFeetY;
/** The far towpath on the straight: back edge (the wing's foot / the bridge abutment), the coping, the water. */
export const S1_PATH = {top: 1068, edge: 1111, coping: 15, x0: -40, x1: 1120} as const;
/** The ONE vanishing point of the ground (our steps' BANK.vp, V2S1_steps_stone): every receding edge runs to it. */
const VP_X = 540;
const VP_Y = 965;

function band(x0: number, x1: number, a: number, c: number, off: (x: number) => number): Pt[] {
  const pts: Pt[] = [];
  for (let x = x0; x <= x1 + 20; x += 20) pts.push([Math.min(x, x1), a + off(Math.min(x, x1))]);
  for (let x = x1; x >= x0 - 20; x -= 20) pts.push([Math.max(x, x0), c + off(Math.max(x, x0))]);
  return pts;
}

/** The far towpath: paving in regions (the flood ripples along it), the wall's foot, the limestone coping (it carries
 *  the canal's edge and the bend) and its shade: flat 2-tone planes, no line (tier C), no specks or joints. */
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
    // its slabs: every other one in the second stone, their sides running to the vanishing point (VP_X, VP_Y), finer
    // and closer in value than our own treads' (the far bank recedes: the owner's depth note)
    b.layer();
    const vb = (xe: number) => VP_X + ((xe - VP_X) * (top - VP_Y)) / (edge - VP_Y);
    for (let xe = x0, i = 0; xe < x1; i++) {
      const w = 64 * r.range(0.85, 1.15);
      if (i % 2) b.poly(CM.stucco, [[vb(xe), top + off(vb(xe))], [vb(xe + w), top + off(vb(xe + w))], [xe + w, edge + off(xe + w)], [xe, edge + off(xe)]]);
      xe += w;
    }
    // the wall's foot: a darker strip along the back
    for (let x = x0; x < x1; x += 120) b.poly(CM.stucco, band(x - 1, Math.min(x1, x + 121), top, top + 6, off));
    b.layer();
    // (the broken joints, specks and fallen-leaf specks are gone: CRAFT §c, big areas flat)
    b.layer();
    // the coping (limestone) + its shade, the shade it casts on the water below
    for (let x = x0; x < x1; x += 120) {
      const xe = Math.min(x1, x + 121);
      b.poly(CM.waterDeep, band(x - 1, xe, edge, edge + 8, off));
      b.poly(CM.limestone, band(x - 1, xe, edge - coping, edge, off));
      b.poly(CM.stoneShade, band(x - 1, xe, edge - coping * 0.3, edge, off));
    }
    return {b, u};
  }, []);
  return (
    <>
      <CellPaint b={b} seed="s1path" cell={140} misreg={0.6} />
    </>
  );
};

/** Bollards and lamp posts along the far towpath, shrinking round the bend (the row's diminishing reads as "down the
 *  bending towpath"). Lamps stand at the path's back (the wall side), bollards on the coping. */
export const S1_BOLLARDS = [770, 430, 262, 160, 66];
export const S1_FAR_LAMPS = [{x: 1046, h: 366}, {x: 752, h: 340}, {x: 360, h: 0}, {x: 6, h: 0}];
export const S1PathFurniture: React.FC = () => {
  const b = useMemo(() => {
    const b = new Batch();
    const {edge, coping} = S1_PATH;
    for (const x of S1_BOLLARDS) {
      const k = MAP.s1FigureHAt(x) / S.herH;
      s1BollardInto(b, x, edge - coping * 0.5 + s1Bend(x) - 2, 22 * k);
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

/** A mooring bollard on the coping (kit towpath bollardInto, copied: the kit's is the plum anchor, which is W's alone;
 *  here slate iron, flat, no line: tier C). */
function s1BollardInto(b: Batch, x: number, y: number, h: number) {
  const w = h * 0.9;
  b.fill(S1_IRON, `M${P(x - w * 0.42, y)}L${P(x - w * 0.3, y - h * 0.55)}L${P(x - w * 0.42, y - h * 0.78)}L${P(x + w * 0.42, y - h * 0.78)}L${P(x + w * 0.3, y - h * 0.55)}L${P(x + w * 0.42, y)}Z`);
  b.fill(S1_IRON, `M${P(x - w * 0.46, y - h * 0.76)}A${(w * 0.46).toFixed(1)} ${(h * 0.26).toFixed(1)} 0 0 1 ${P(x + w * 0.46, y - h * 0.76)}Z`);
}

/** A heritage lamp post (kit towpath Lamp, copied: its Paint can't be split by region), off (the golden hour). */
function lampInto(b: Batch, x: number, y: number, h: number, seed: string) {
  const color = S1_IRON; // never the plum anchor (W's alone): a mid-slate iron (tier C)
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

// ---------------------------------------------------------------- the water

type Refl = {x0: number; x1: number; color: string; depth: number};
// two reflections only (the art director, v3: the canal read as a barcode of peach / yellow / terracotta bars): the
// wing's, and the sun's gold column where the glints live; each eased into the water (REFL_SOFT) so they sit on its
// own value steps, through `atmos` (hue kept, chroma eased, never under C* 12): a straight sRGB mix of a warm colour
// into the teal crosses grey (the wing's turned khaki #C0B7A6, the sun's olive #CACBA3: DIRECTION rule 6)
const REFL: Refl[] = [
  {x0: 330, x1: 1080, color: CM.brickLight, depth: 46},
  {x0: 120, x1: 280, color: CM.sun, depth: 0},
];
const REFL_SOFT = 0.5;
// the water runs on under our bank's slanted coping (it reaches y ~1300 at the right edge; the bank covers the rest)
const WATER = {y0: S.water.y0 - 2, y1: S.water.y1 + 96, x0: -40, x1: 1120} as const;
const WATER_H0 = S.water.y1 - S.water.y0 + 4;
// the far water toward the haze, through `atmos` too (the sRGB mix read grey-green, C* 9.8 h 149, and any shade on it
// greyed): a pale teal, C* 12
const WATER_FAR = atmos(CM.water, 0.3, S1_HAZE, {chromaFloor: 12});
const WATER_NEAR = mixHex(CM.water, CM.waterDeep, 0.3);

/** THE WATER STUDY SEAM (owner on v5's water, 2026-10-28: "way too cheap ... lazy and cheap"; docs/v2/water/DIAGNOSIS.md):
 *  a component set here is drawn INSTEAD of S1Water's own body, in the same place (inside the water's parallax plane
 *  group, the environment tier, the flood's Look and RIG_CANAL), with the scene time `t`. Unset (null, the default) =
 *  S1 exactly as before, byte for byte. Only src/entry-v2r-waterstudy.tsx sets it (src/v2r/water_study/cand*.tsx). */
export const S1WaterSlot = createContext<React.FC<{t: number}> | null>(null);
/** The same seam for the duck on the water (S1World draws it in the moored boats' plane, after the boats): a component
 *  set here replaces the kit duck (its body, its bob and its paper V wake), so a candidate water can give it its own
 *  ripples and reflection. Unset = the kit duck exactly as before. */
export const S1DuckSlot = createContext<React.FC<{t: number}> | null>(null);
/** The duck as S1World places it: one mallard at its water's scale (~127 px/m: ~0.5 m long), by the bend, its
 *  waterline y 1136 (the kit's Ducks: body x +-34, head toward +x, a +-6 px sway). */
export const S1_DUCK = {x: 396, y: 1136, size: 62} as const;

/** The canal between the far coping and our bank: base colour in regions, the wing's broken reflection and the sun's
 *  (orange only on the sun disc: its reflection is gold), swaying slowly. No ripple dashes, no glints (CRAFT §c). */
export const S1Water: React.FC = () => {
  const Slot = useContext(S1WaterSlot);
  const t = useTime();
  const {y0, y1, x0, x1} = WATER;
  const H = y1 - y0;
  const base = useMemo(() => {
    const b = new Batch();
    for (let x = x0; x < x1; x += 140) {
      b.rect(CM.water, x - 0.5, y0, 141, H);
      // depth in three flat steps: the far water toward the haze, the near water a step deeper along our coping (it
      // runs to the ground's vanishing point, like the coping)
      b.rect(WATER_FAR, x - 0.5, y0 + 9, 141, WATER_H0 * 0.3);
      const xa = x - 0.5;
      const xb = x + 140.5;
      b.poly(WATER_NEAR, [[xa, edgeY(1184, xa)], [xb, edgeY(1184, xb)], [xb, edgeY(1222, xb)], [xa, edgeY(1222, xa)]]);
      b.rect(CM.waterDeep, x - 0.5, y0, 141, 9);
    }
    return b;
  }, []);
  // the reflections as a few LONG flat bands (no dash rows, CRAFT §c), static: the wing's broken in two by a calm
  // gap, the sun's gold column under the disc, the lit lobby's gold under the doors
  const b = useMemo(() => {
    const b = new Batch();
    const rt = y0 + 10;
    REFL.forEach((ref, i) => {
      const color = atmos(ref.color === CM.sun ? CM.lamp : ref.color, REFL_SOFT, CM.water, {chromaFloor: 12});
      const depth = ref.depth || 60;
      const W = ref.x1 - ref.x0;
      const rr = rng(`s1refl/${i}`);
      // band 1 (far, near the far coping): most of the width, thin; band 2 under it (nearer): shorter, inset and
      // thicker, a calm gap between (bands thicken toward us: the water recedes)
      const h1 = Math.max(3, depth * 0.2);
      const h2 = Math.max(4, depth * 0.32);
      const g1 = W > 300 ? rr.range(0.38, 0.5) : -1;
      if (g1 > 0) {
        b.rect(color, ref.x0 + W * 0.02, rt + 2, W * (g1 - 0.04), h1);
        b.rect(color, ref.x0 + W * (g1 + 0.03), rt + 2, W * (0.95 - g1), h1);
      } else b.rect(color, ref.x0 + W * 0.04, rt + 2, W * 0.92, h1);
      if (ref.color === CM.sun) b.rect(color, ref.x0 + W * 0.16, rt + 2 + h1 + depth * 0.18, W * 0.62, h2);
    });
    return b;
  }, []);
  // the study seam (after every hook, so the hook order never changes): a candidate water replaces this body
  if (Slot) return <Slot t={t} />;
  return (
    <>
      <CellPaint b={base} seed="s1water/base" cell={140} misreg={0} />
      <CellPaint b={b} seed="s1water/refl" cell={140} misreg={0} />
    </>
  );
};

// ---------------------------------------------------------------- the two moored boats (the right rail)

/** Boat A's stern is off the right edge (dir -1: u 0 = the stern at x 1346), so its stove chimney sits at u 0.6 (x ~1010),
 *  on the visible part of the roof, for the 0.70 puff (TREATMENT f42). */
export const BOAT_A: BoatOpts = {x: 786, water: 1140, len: 560, h: 74, dir: -1, seed: 's1boatA', cabin: CM.sage, topView: 8, roofItems: true, panel: false, chimney: 0.6};
export const BOAT_B: BoatOpts = {x: 930, water: 1196, len: 520, h: 86, dir: -1, seed: 's1boatB', cabin: CM.coatOat, topView: 10, roofItems: true, panel: true};

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
    {/* (no chimney puff in S1: the kit's smoke read as lavender bubbles, the art director on v3) */}
    <OneBoat o={BOAT_A} />
    <Boater />
    <OneBoat o={BOAT_B} />
    <Cat />
  </>
);

/** The boater: a small seated back on boat A's cabin roof (the visible end, behind boat B), a beanie and a mustard
 *  jumper (no plum, no bun, no long coat: LOOKALIKE_RADIUS_PX), a mug that rises to the mouth and back (every ~3 s),
 *  the head turning toward the ding (0.47-1.3). */
const Boater: React.FC = () => {
  const t = useTime();
  const g = boatGeom(BOAT_A);
  const x = 962;
  const y = g.roofY - g.roofH - (BOAT_A.topView ?? 0) * 0.4;
  // at rest (the life budget): the cup held low, no turn. Seated height ~0.55 of a 1.70 m figure on the boat's plane.
  const cup = 0 * t;
  return <Seated x={x} y={y} h={88} seed="s1/boater" cup={cup} turn={0.1} ink={0} traits={{hair: 'beanie', hatColor: CM.brick, hairColor: CM.hair[1], coat: CM.coatMustard, coatLen: 'jacket', trousers: CM.coatSlate, acc: 'none'}} />;
};

/** A ginger cat curled on boat B's roof: a loaf of leafRust with a tail curl; lifts its head at 1.10 and 4.98. */
const Cat: React.FC = () => {
  const t = useTime();
  const g = boatGeom(BOAT_B);
  const x = 1004;
  const y = g.roofY - g.roofH - (BOAT_B.topView ?? 0) * 0.45;
  const up = (a: number) => Math.max(0, Math.min(1, (t - a) / 0.12)) * Math.max(0, Math.min(1, (a + 1.3 - t) / 0.2));
  // asleep: no head lifts (the life budget: the hook's novelty is her build only)
  const lift = 0 * Math.max(up(MAP.S1_CLOCK.doorsShut), up(MAP.S1_LIFE_T));
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

/** THE far jogger (the life budget's ONE: conform_L1 §6): small (tier C, ~50 px) on the far bank seen through the
 *  road bridge's arch, beyond the row's far end, jogging WEST 250 -> 140 from 0.30 to 2.50 s and gone behind the
 *  arch's west spring by then: it never crosses her, the doorway or the row (V2S1_clock KEEP_CLEAR), and the row reaches
 *  that x only after 4.0. Cap, mustard top: no lookalike of her. */
export const S1_JOG = {t0: 0.3, t1: 2.5, x0: 250, x1: 130, feet: 1041, h: 50} as const;
export const s1JogX = (t: number) => S1_JOG.x0 + ((S1_JOG.x1 - S1_JOG.x0) * (t - S1_JOG.t0)) / (S1_JOG.t1 - S1_JOG.t0);

export const S1FarLife: React.FC = () => {
  const t = useTime();
  const id = 's1jogclip';
  const jog = t >= S1_JOG.t0 - 0.2 && t <= S1_JOG.t1 + 0.2;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={s1ArchOpening(1042)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {/* someone at rest on the far bank beyond the bridge, seen through its arch (the jogger's scale, ~29 px/m) */}
        <Seated x={70} y={S1_JOG.feet - 2} h={34} seed="s1/archSitter" turn={0} ink={0} traits={{hair: 'long', hairColor: CM.hair[2], coat: CM.brickLight, coatLen: 'jacket', trousers: CM.coatSlate, acc: 'none'}} />
        {jog ? <Person x={s1JogX(t)} y={S1_JOG.feet} h={S1_JOG.h} seed="s1/jog1" ink={0} pose="jog" view="profile" flip={false} walk={{rate: 2.6}} traits={{hair: 'cap', hatColor: CM.coatSlate, hairColor: CM.hair[1], coat: CM.coatMustard, coatLen: 'jacket', trousers: CM.coatSlate, acc: 'none', shoes: CM.paper}} /> : null}
      </g>
    </>
  );
};

// ---------------------------------------------------------------- the plane branch (the top-left gutter, y 0-240)

/** A plane-tree twig reaching in from the top-left corner: one clean ink line (it carries form), five palmate leaves
 *  in gold and rust, held still (SWAY 0 in S1); one leaf lets go at 2.6 and falls. */
export const S1PlaneBranch: React.FC = () => {
  const t = useTime();
  const tq = Math.floor(t * 12) / 12;
  // held still in S1 (critic G4: the sway was one supporting mover too many around the clauses); the falling leaf
  // is the branch's life
  const SWAY = 0;
  const sway = Math.sin(tq * 1.6) * 2.2 * SWAY;
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
  // the stem runs on off the left edge (overscan: the branch is a near twig and floats the most)
  let stemD = `M-70 24L${P(...at(0))}`;
  for (let k = 0.05; k <= 1.001; k += 0.05) stemD += `L${P(...at(k))}`;
  const fills: React.ReactNode[] = [];
  let ribs = '';
  let outl = '';
  leaves.forEach((L, i) => {
    const [bx, by] = at(L.k);
    const wob = Math.sin(tq * 2.3 + i * 1.7) * 6 * SWAY;
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
      {/* tier C: the twig IS a line (a hairline thing); the leaves are flat shapes, no outline or ribs */}
      <Ink d={stemD} width={INK_PX.far} seed="s1brStem" thing />
    </>
  );
};

/** f0 helper: is the water still bare at x? */
export const waterBare = (t: number, x: number) => t < floodAt(x, (S.water.y0 + S.water.y1) / 2);
export {lobes};
