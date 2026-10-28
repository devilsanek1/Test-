// V2S4_wfar.tsx (lane L3, V2S4 WORLD helpers): the FAR plane (0.3x the truck; the atmosphere's +3.5 step) at the 17.96
// pose in plane px.
// TIER C, one flat step toward the air (planeBatch(+3.5): three values within dE 12, no lines), the far town past the
// atmosphere steps (unlit: CRAFT §d.9).
//   gasholders   two cast-iron guide frames, pale with distance: the LEFT one holds a drum of flats (cx 90: it slides in
//                behind her end house as the backs overtake it, hidden from ~17.06), the RIGHT one (G1, cx 520) stands
//                in the gap right of the sun. NO LINE CROSSES SUN1's DISC (x 185-315, y 585-715) at any frame: the far
//                plane moves 0.3 x 310 = 93 px, so everything above y 716 keeps plane-x < 175 or > 422 (G1: 430-610)
//   far roofs    two rows in flat depth steps, warm stones and bricks (under the golden air the far city takes its
//                warmth: CRAFT §f.2; cool slates and glass greyed toward C* 7 there): pitched, mansard, flat and gable
//                roofs, plain stacks; no windows (far: tone on tone at most), no aerials, no pots; the sun's column stays
//                below y 736
//   viaduct      a brick viaduct, arches, a parapet; no masts or wire (no hairline past the subject's planes), no train
//   birds        a small flock perched on G1's top ring lifts on "heading" (19.78) and flies WEST into the sun's band,
//                pale and small (the brief's "birds west")
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Batch, Paint, P, rng, ovalPath, lerp, r1} from '../kit/canal/core';
import {ROW, PLANE_X, sunClear, clamp01, smooth01} from './V2S4_wcore';
import {S4_PLANE, planeBatch} from './V2S4_depth';

const K = 0.3;
const [X0, X1] = PLANE_X(K);
const CLEAR = sunClear(K);
/** The highest y (smallest) an element spanning [xa, xb] may reach on this plane: in the sun's column 736, so the disc
 *  (bottom y 715) is whole with 20 px of sky under it (never a tangent on a roofline, never a notch: CRAFT §f). */
const topAt = (xa: number, xb: number) => (xb > CLEAR[0] && xa < CLEAR[1] ? 736 : ROW.top);

// ---------------------------------------------------------------- gasholders

type Gas = {cx: number; top: number; r: number; base: number; seed: string; drum?: boolean; tiers?: number};
/** G3 (left, the drum of flats) and G1 (right of the sun's column). Their columns span cx +- r. */
export const GAS: Gas[] = [
  {cx: 90, top: 652, r: 70, base: 860, seed: 'g3', drum: true, tiers: 3},
  {cx: 520, top: 630, r: 90, base: 860, seed: 'g1', tiers: 4},
];

/** One guide frame: columns at the cylinder's visible stations, ring girders (the front arc bows up: we look up at it),
 *  a cap on each column; flat fills only (the lattice bracing reads as nothing at +2 and would be lines). */
function gasFrameInto(b: Batch, g: Gas) {
  const {cx, top, r, base} = g;
  const tiers = g.tiers ?? 3;
  const n = 12;
  const xs: number[] = [];
  for (let k = 0; k <= n / 2; k++) xs.push(cx + r * Math.cos((2 * Math.PI * k) / n));
  xs.sort((a, c) => a - c);
  const bow = r * 0.06;
  const ringY = (i: number) => top + ((base - top) * i) / (tiers + 0.35);
  const frontY = (y: number, x: number) => y - bow * Math.sqrt(Math.max(0, 1 - ((x - cx) / r) ** 2));
  if (g.drum) {
    // the drum of flats inside: a stone cylinder, its shade side to the east
    const dt = top + 26;
    const dr = r * 0.8;
    b.rect(CM.limestone, cx - dr, dt, dr * 2, base - dt);
    b.fill(CM.limestone, `M${P(cx - dr, dt)}Q${P(cx, dt - 9)} ${P(cx + dr, dt)}Z`);
    b.layer();
    b.rect(CM.brickLight, cx + dr * 0.55, dt, dr * 0.45, base - dt);
  }
  b.layer();
  const col = CM.shadeWarm;
  // ring girders: an upper and a lower chord per ring as thin ribbons (front arcs)
  for (let i = 0; i <= tiers; i++) {
    const y = ringY(i);
    const h = i === 0 ? 7 : 5;
    const front: [number, number][] = [];
    for (let k = 0; k <= 24; k++) {
      const x = cx - r + (2 * r * k) / 24;
      front.push([x, frontY(y, x)]);
    }
    const ribbon = (pts: [number, number][], w: number) => {
      let d = `M${P(pts[0][0], pts[0][1])}`;
      for (const [x, yy] of pts.slice(1)) d += `L${P(x, yy)}`;
      for (const [x, yy] of pts.slice().reverse()) d += `L${P(x, yy + w)}`;
      return d + 'Z';
    };
    b.fill(col, ribbon(front, 3));
    if (i === 0) b.fill(col, ribbon(front.map(([x, yy]) => [x, yy + h]), 2.4));
  }
  // columns: one shaft per station with its cap above the top ring
  xs.forEach((x, k) => {
    const edge = k === 0 || k === xs.length - 1;
    const w = edge ? 4 : 3.2;
    b.rect(col, x - w / 2, frontY(top, x) - 5, w, base - top + 5);
    b.rect(col, x - w / 2 - 1.4, frontY(top, x) - 7, w + 2.8, 3);
  });
}

// ---------------------------------------------------------------- far roof rows

type RowOpts = {x0: number; x1: number; base: number; top: number; spread: number; seed: string; walls: string[]; roofs: string[]; w: [number, number]};

/** One row of far buildings: wall, roof (pitched / mansard / flat / gable / shed), plain chimney stacks. Everything
 *  respects `topAt` (the sun's column). */
function farRowInto(b: Batch, o: RowOpts) {
  const r = rng(o.seed);
  let x = o.x0 - r.range(0, o.w[1] * 0.5);
  let i = 0;
  while (x < o.x1) {
    const w = r.range(o.w[0], o.w[1]);
    const kind = r.weighted([['pitch', 4], ['mansard', 2], ['flat', 2], ['gable', 2], ['shed', 1]] as const);
    const lim = topAt(x - 4, x + w + 4);
    const rh = Math.min(w * 0.3, 26);
    const wallTop = Math.max(lim + (kind === 'flat' ? 4 : rh), o.top + r.jitter(o.spread));
    const wall = o.walls[i % o.walls.length];
    const roof = o.roofs[(i + r.int(0, 2)) % o.roofs.length];
    b.rect(wall, x, wallTop, w + 0.8, o.base - wallTop);
    if (kind === 'pitch') b.poly(roof, [[x - 2, wallTop], [x + w * 0.14, wallTop - rh * 0.75], [x + w * 0.86, wallTop - rh * 0.75], [x + w + 2, wallTop]]);
    if (kind === 'mansard') b.poly(roof, [[x - 1, wallTop], [x + w * 0.07, wallTop - rh], [x + w * 0.93, wallTop - rh], [x + w + 1, wallTop]]);
    if (kind === 'flat') b.rect(CM.brickLight, x - 1, wallTop - 4, w + 2, 4);
    if (kind === 'gable') b.poly(roof, [[x - 2, wallTop], [x + w / 2, wallTop - rh * 1.05], [x + w + 2, wallTop]]);
    if (kind === 'shed') {
      const n = Math.max(2, Math.round(w / 24));
      const pts: [number, number][] = [[x, wallTop]];
      for (let k = 0; k < n; k++) {
        pts.push([x + ((k + 0.8) * w) / n, wallTop - rh * 0.55]);
        pts.push([x + ((k + 1) * w) / n, wallTop]);
      }
      b.poly(roof, pts);
    }
    // plain stacks on the pitched kinds (no pots: at +2 they are specks)
    if (kind !== 'flat' && kind !== 'shed') {
      const ns = r.int(1, 2);
      for (let k = 0; k < ns; k++) {
        const cx = x + w * (ns === 1 ? r.range(0.25, 0.75) : k === 0 ? r.range(0.12, 0.3) : r.range(0.7, 0.88));
        const cw = r.range(9, 14);
        const ch = r.range(10, 20);
        const ct = Math.max(topAt(cx - cw, cx + cw) + 5, wallTop - rh * 0.75 - ch);
        b.rect(wall === CM.brickLight ? CM.brick : CM.brickLight, cx - cw / 2, ct, cw, wallTop - ct);
      }
    }
    x += w + (r.chance(0.15) ? r.range(2, 8) : 0);
    i++;
  }
}

// ---------------------------------------------------------------- the viaduct

const VIA = {deck: 748, base: 862, pitch: 66, x0: X0, x1: X1};

function viaductInto(b: Batch) {
  const {deck, base, pitch, x0, x1} = VIA;
  const dh = 12;
  const pierW = 15;
  b.rect(CM.brickLight, x0, deck, x1 - x0, dh);
  b.rect(CM.limestone, x0, deck - 2.5, x1 - x0, 2.5);
  for (let x = x0; x < x1; x += pitch) {
    b.rect(CM.brickLight, x, deck + dh - 1, pierW, base - deck - dh + 1);
    const ax = x + pierW;
    const aw = pitch - pierW;
    const sp = deck + dh + aw * 0.42;
    b.fill(CM.brickLight, `M${P(ax - 0.5, deck + dh - 0.5)}L${P(ax + aw + 0.5, deck + dh - 0.5)}L${P(ax + aw + 0.5, sp)}A${r1(aw / 2)} ${r1(aw * 0.42)} 0 0 0 ${P(ax - 0.5, sp)}Z`);
  }
}

// ---------------------------------------------------------------- birds: perched on G1, lifting west on "heading"

export const FLOCK_AT = 19.78;
const G1 = GAS[1];
const FLOCK = Array.from({length: 7}, (_, i) => {
  const r = rng(`s4flock/${i}`);
  const x = lerp(G1.cx - G1.r * 0.7, G1.cx + G1.r * 0.2, (i + r.range(0.1, 0.9)) / 7);
  const bow = G1.r * 0.06 * Math.sqrt(Math.max(0, 1 - ((x - G1.cx) / G1.r) ** 2));
  return {x, y: G1.top - bow - 7, face: r.chance(0.6) ? -1 : 1, delay: r.range(0, 0.16), vx: r.range(250, 320), cruise: r.range(522, 548), s: r.range(12, 15), ph: r.range(0, 6.28)};
});
/** The birds' colour: a soft warm grey a tone darker than the sky they cross (planeBatch recedes it one more step). */
const BIRD = CM.shadeWarm;

function flockInto(b: Batch, t: number) {
  for (const f of FLOCK) {
    const ft = t - FLOCK_AT - f.delay;
    const s = f.s;
    if (ft < 0) {
      // perched on the top ring: a plump body, head and tail (still: no pecks, the life budget)
      b.fill(BIRD, ovalPath(f.x, f.y, s * 0.4, s * 0.27));
      b.fill(BIRD, ovalPath(f.x + f.face * s * 0.34, f.y - s * 0.22, s * 0.16, s * 0.15));
      b.fill(BIRD, `M${P(f.x - f.face * s * 0.28, f.y - s * 0.04)}L${P(f.x - f.face * s * 0.66, f.y + s * 0.12)}L${P(f.x - f.face * s * 0.28, f.y + s * 0.13)}Z`);
      continue;
    }
    // lift (a hop up), then a long glide-and-flap WEST, climbing OVER the sun (cruise y 522-548, the disc's top 585):
    // nothing crosses the disc, and the push-through carries them up and out (critic_L3 MUST 1)
    const x = f.x - f.vx * ft * smooth01(ft / 0.25) * 0.6 - f.vx * Math.max(0, ft - 0.12) * 0.4;
    const up = Math.sin(clamp01(ft / 0.35) * Math.PI) * 14;
    const y = Math.max(516, lerp(f.y, f.cruise, smooth01(ft / 0.35)) - up + Math.sin(ft * 3 + f.ph) * 3);
    if (x < X0 - 20) continue;
    const flap = Math.sin(ft * 24 + f.ph);
    const wx = s * 0.66;
    const wy = s * 0.5 * flap;
    b.fill(BIRD, `M${P(x - wx, y - wy)}Q${P(x - wx * 0.4, y - wy * 0.2 - s * 0.05)} ${P(x, y + s * 0.08)}Q${P(x + wx * 0.4, y - wy * 0.2 - s * 0.05)} ${P(x + wx, y - wy)}L${P(x + wx * 0.5, y - wy * 0.5 + s * 0.09)}L${P(x, y + s * 0.22)}L${P(x - wx * 0.5, y - wy * 0.5 + s * 0.09)}Z`);
  }
}

// ---------------------------------------------------------------- the plane

/** The far plane's static drawing (one plane palette). */
export function farStatic(): Batch {
  const b = new Batch();
  for (const g of GAS) gasFrameInto(b, g);
  b.layer();
  farRowInto(b, {x0: X0, x1: X1, base: ROW.wallTop, top: 728, spread: 10, seed: 's4farA', walls: [CM.limestone, CM.stucco, CM.brickLight, CM.limestone], roofs: [CM.brickLight, CM.shadeWarm, CM.brick], w: [44, 96]});
  b.layer();
  farRowInto(b, {x0: X0, x1: X1, base: ROW.wallTop, top: 752, spread: 8, seed: 's4farB', walls: [CM.brickLight, CM.stucco, CM.limestone, CM.brickLight, CM.box], roofs: [CM.brick, CM.shadeWarm, CM.brickDeep], w: [52, 120]});
  b.layer();
  viaductInto(b);
  return planeBatch(b, S4_PLANE.far);
}

export const FarPlane: React.FC = () => {
  const t = useTime();
  const st = useMemo(farStatic, []);
  const birds = new Batch();
  flockInto(birds, t);
  planeBatch(birds, S4_PLANE.far);
  return (
    <>
      <Paint b={st} seed="s4farSt" misreg={false} />
      <Paint b={birds} seed="s4farBirds" misreg={false} />
    </>
  );
};
