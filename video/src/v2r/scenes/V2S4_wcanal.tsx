// V2S4_wcanal.tsx (lane L3, V2S4 WORLD helpers): THE CANAL STRIP between her coping and our boat (the 1.0x canal
// plane, plane px at the 17.96 pose; y 1082 -> under our boat's roof at ~1222). Never bare water:
//   - the coping's shade, then the bank's BROKEN reflections (stone coping, brick walls, the lamp posts' plum, the
//     gates' paint), wobbling sideways; ripples in the deep water colour drifting east with the wind; glints that switch
//   - two ducks paddling west with small V wakes; leaves floating; the angler's line and float, which bobs, and dips
//     once on a nibble (16.55) with a ring spreading
// No reflection of her (no teal off her, no dark water behind her).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Batch, Paint, P, rng, ovalPath, leafPath, lerp, frac} from '../kit/canal/core';
import {Ducks} from '../kit/canal/life';
import {ROW, PLANE_X, WIND} from './V2S4_wcore';
import {ANGLER, rodTip} from './V2S4_wcast';

const [X0, X1] = PLANE_X(1);
const Y0 = ROW.edge;
const Y1 = ROW.roofFar + 18;

/** What stands on the bank, for the reflections (plane x ranges and colours). */
const REFL: {x0: number; x1: number; c: string; depth: number}[] = [
  {x0: X0, x1: 128, c: CM.brick, depth: 70},
  {x0: 128, x1: 300, c: CM.stucco, depth: 60},
  {x0: 300, x1: 352, c: CM.coatSlate, depth: 74},
  {x0: 352, x1: 566, c: CM.brickLight, depth: 64},
  {x0: 566, x1: 690, c: CM.brickDeep, depth: 70},
  {x0: 690, x1: 830, c: CM.brick, depth: 66},
  {x0: 830, x1: 882, c: CM.sage, depth: 76},
  {x0: 882, x1: 1110, c: CM.brickLight, depth: 60},
  {x0: 1110, x1: 1250, c: CM.limestone, depth: 66},
  {x0: 1250, x1: 1300, c: CM.brickDeep, depth: 76},
  {x0: 1300, x1: X1, c: CM.brick, depth: 66},
];
const POSTS = [40, 905, 1392, 575];

function waterBase(): Batch {
  const b = new Batch();
  b.rect(CM.water, X0, Y0, X1 - X0, Y1 - Y0);
  b.rect(CM.waterDeep, X0, Y0, X1 - X0, 7);
  return b;
}

function waterLife(b: Batch, t: number) {
  const r = rng('s4canal');
  // the coping's stone, broken just under the edge
  for (let x = X0; x < X1; x += r.range(18, 40)) {
    const L = r.range(16, 46);
    const xx = x + Math.sin(t * 1.2 + x * 0.02) * 2;
    b.fill(CM.limestone, `M${P(xx, Y0 + 9)}L${P(xx + L, Y0 + 9)}L${P(xx + L - 2, Y0 + 12)}L${P(xx + 2, Y0 + 12)}Z`);
  }
  // the walls' and gates' reflections: rows of short dashes, sparser and shorter with depth, wobbling
  REFL.forEach((s, i) => {
    const rows = Math.round(s.depth / 7);
    for (let k = 0; k < rows; k++) {
      const yy = Y0 + 16 + k * 7;
      const keep = 1 - k / rows;
      let x = s.x0 + r.range(0, 24);
      while (x < s.x1) {
        const len = Math.min(s.x1 - x, r.range(14, 44) * (0.45 + keep * 0.65));
        if (r.chance(0.3 + 0.55 * keep)) {
          const xx = x + Math.sin(t * 1.05 + k * 0.85 + i + x * 0.013) * (2 + k * 0.5);
          b.fill(s.c, `M${P(xx, yy)}L${P(xx + len, yy)}L${P(xx + len - 2, yy + 3 + k * 0.2)}L${P(xx + 2, yy + 3 + k * 0.2)}Z`);
        }
        x += len + r.range(8, 26) * (1.3 - keep * 0.6);
      }
    }
  });
  // lamp posts and the fingerpost: plum dashes going down
  for (const px of POSTS) {
    for (let k = 0; k < 9; k++) {
      if (k % 3 === 2) continue;
      const yy = Y0 + 12 + k * 8;
      const xx = px + Math.sin(t * 1.4 + k * 1.1 + px) * (1.5 + k * 0.4);
      b.rect(CM.anchor, xx - 3, yy, 6 - k * 0.3, 4);
    }
  }
  b.layer();
  // ripples drifting east with the wind (bigger toward us)
  const span = X1 - X0;
  for (let i = 0; i < 46; i++) {
    const v = r.next();
    const yy = Y0 + 12 + v * (Y1 - Y0 - 20);
    const s = lerp(0.8, 1.5, v);
    const w = r.range(18, 54) * s;
    const x = X0 + frac((r.range(0, span) + WIND * 9 * s * t) / span) * span;
    const hh = 1.8 * s;
    b.fill(CM.waterDeep, `M${P(x - w / 2, yy)}Q${P(x, yy - hh)} ${P(x + w / 2, yy)}Q${P(x, yy + hh)} ${P(x - w / 2, yy)}Z`);
  }
  // glints: short paper dashes switching on their own clocks
  for (let i = 0; i < 26; i++) {
    const v = r.next();
    const yy = Y0 + 10 + v * (Y1 - Y0 - 16);
    const per = r.range(1.3, 2.8);
    const on = frac(t / per + r.next()) < 0.4;
    const s = lerp(0.8, 1.4, v);
    const x = r.range(X0 + 10, X1 - 10) + Math.sin(t * 0.7 + i) * 5;
    if (on) b.fill(CM.paper, `M${P(x - 8 * s, yy)}L${P(x + 8 * s, yy - 1)}L${P(x + 6 * s, yy + 2 * s)}L${P(x - 6 * s, yy + 2 * s)}Z`);
  }
  // floating leaves, drifting east, bobbing
  for (let i = 0; i < 16; i++) {
    const y = r.range(Y0 + 14, Y1 - 14);
    const k = (y - Y0) / (Y1 - Y0);
    const s = lerp(8, 13, k);
    const x = X0 + frac((r.range(0, span) + WIND * 7 * t) / span) * span;
    b.fill([CM.leafGold, CM.leafRust, CM.coatMustard][i % 3], leafPath(x, y + Math.sin(t * 1.3 + i) * 1.1, s, s * 0.24, r.range(-25, 25)));
  }
}

/** The angler's line and float (the rod is on the path plane: V2S4_wcast). */
function floatInto(b: Batch, t: number) {
  const [tx, ty] = rodTip(t);
  const fx = tx - 10;
  const nib = t - ANGLER.nibbleAt;
  const dip = nib > 0 && nib < 0.32 ? Math.sin((nib / 0.32) * Math.PI) * 7 : 0;
  const fy = 1136 + Math.sin(t * 1.9) * 1.3 + dip;
  // ring spreading from the nibble
  if (nib > 0 && nib < 1.1) {
    const R = 6 + nib * 34;
    const th = Math.max(0.6, 2.2 * (1 - nib / 1.1));
    b.fill(CM.paper, `M${P(fx - R, fy + 2)}Q${P(fx, fy + 2 - R * 0.2)} ${P(fx + R, fy + 2)}Q${P(fx, fy + 2 - R * 0.2 + th)} ${P(fx - R, fy + 2)}Z`);
    b.fill(CM.waterDeep, `M${P(fx - R, fy + 3)}Q${P(fx, fy + 3 + R * 0.22)} ${P(fx + R, fy + 3)}Q${P(fx, fy + 3 + R * 0.22 - th)} ${P(fx - R, fy + 3)}Z`);
  }
  b.fill(CM.waterDeep, ovalPath(fx, fy + 3, 9, 2.4));
  b.poly(CM.box, [[fx - 2.6, fy - 9], [fx + 2.6, fy - 9], [fx + 3.4, fy + 1], [fx - 3.4, fy + 1]]);
  b.poly(CM.paper, [[fx - 3.4, fy - 1], [fx + 3.4, fy - 1], [fx + 2.4, fy + 3], [fx - 2.4, fy + 3]]);
  b.rect(CM.anchor, fx - 0.6, fy - 15, 1.2, 6);
  b.ink(`M${P(tx, ty)}Q${P(tx - 4, (ty + fy) / 2)} ${P(fx, fy - 14)}`, 0.8, CM.ink);
}

export const CanalPlane: React.FC = () => {
  const t = useTime();
  const base = useMemo(waterBase, []);
  const b = new Batch();
  waterLife(b, t);
  b.layer();
  floatInto(b, t);
  return (
    <>
      <Paint b={base} seed="s4canalBase" misreg={false} />
      <Paint b={b} seed="s4canalLife" misreg={false} />
      <Ducks ducks={[{x: 684, y: 1166, size: 28, vx: -15, drake: true}, {x: 730, y: 1180, size: 25, vx: -15}]} seed="s4ducks" x0={X0} x1={X1} />
    </>
  );
};
