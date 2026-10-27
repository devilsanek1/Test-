// V2S7_wiper.tsx (lane L5): the foreground wipe from V2S7 into V2S8 (TREATMENT section 5: "narrowboat foreground
// wipe 32.70-33.16; S7's Wiper, bow in only after 32.70"; BUILD.md section 2). A narrowboat glides WEST past the lens
// (dir 'left': the bow leads left), carrying us from Google's forecourt home to her lane.
//
// BAND-SAFE: the kit's BoatWiper draws its stove chimney (to y ~180), a bike and pots on its roof and the tiller arm
// straight through the caption band (y 317-556) while '"of any kind".' is up. This wiper uses the kit's boatInto with
// the SAME 1180 x 980 boat (water 2020: the roof surface ~y 564-604), no roof items, every part that would rise above
// y 560 left out (the chimney, its cap and band, the handrail and stanchions, the tiller and its pin), the whole
// drawing clipped at y 560 on top of that, and its own low, flat roof dressing (a chimney collar with the pipe down
// for the bridges, herb troughs, a coiled rope, a boat pole). Nothing of it ever enters the band, so only sky lies
// behind the caption: captionRegions = [] (one tone). No Pip on it (L6's S8 Pip leaps from behind the stern at 33.00).
//
// Geometry for L6 (screen px; x = the wipe edge Film passes in): S7_WIPER.
import React, {useMemo} from 'react';
import {getBoundingBox} from '@remotion/paths';
import {CM, INK_PX} from '../palette';
import type {WiperComponent} from '../../lib/Film';
import {Batch, Paint, P, ovalPath, domePath, lobes, leafPath as leafPathW} from '../kit/canal/core';
import {boatInto, boatGeom, BoatOpts} from '../kit/canal/boat';
import {mixHex} from './V2S7_rig';

const LEN = 1180;
const H = 980;
const WATER = 2020;
const CLIP_Y = 560;

const opts = (d: 1 | -1): BoatOpts => ({x: -LEN / 2, water: WATER, len: LEN, h: H, dir: d, seed: 'wiper', cabin: CM.sage, topView: 40, roofItems: false, panel: true, fenders: true, lit: true, ink: INK_PX.front});
const G = boatGeom(opts(-1));
/** The doors' lower panels: a flat step of the wood toward the brick (a mix of two role tokens). */
const mixLine = mixHex(CM.line, CM.brick, 0.35);

/** The wiper's geometry (dir 'left', relative to the wipe edge x): for L6's hand-off and checks. */
export const S7_WIPER = {
  /** Static half-width about x (the boat's 590 + ink, misregistration, the fender at the stern). */
  half: 630,
  len: LEN,
  h: H,
  water: WATER,
  /** Nothing of the wiper is drawn above this screen y. */
  clipY: CLIP_Y,
  /** The roof surface's top edge (seen from a little above) and the cabin's roof line. */
  roofTopY: G.roofY - G.roofH - 40,
  roofY: G.roofY,
  /** The stern deck (gunwale top) and the hull's sheer line. */
  gunTopY: G.gunTop,
  hullTopY: G.gunTop + G.gunH,
  /** dir 'left': the stern trails at x + 590, the bow leads at x - 590; the cabin covers x - 401 .. x + 496. */
  sternDx: LEN / 2,
  bowDx: -LEN / 2,
  cabinDx: [-LEN / 2 + (1 - G.c1) * LEN, LEN / 2 - G.c0 * LEN] as [number, number],
} as const;

/** Drop every batch part that rises above `y` (the chimney, handrail, stanchions, tiller and pin). */
function dropAbove(b: Batch, y: number) {
  const top = (d: string) => {
    try {
      return getBoundingBox(d).y1;
    } catch {
      return -Infinity;
    }
  };
  for (const L of b.layers) {
    L.fills.forEach((parts, col) => L.fills.set(col, parts.filter((d) => top(d) >= y - 0.5)));
    L.inks.forEach((run) => {
      run.parts = run.parts.filter((d) => top(d) >= y - 0.5);
    });
  }
}

/** The band-safe dressing: flat things on the roof surface (y >= 566), the stern doors, the cabin side's portholes,
 *  window and roses panel. */
function roofInto(b: Batch, d: 1 | -1) {
  const g = boatGeom(opts(d));
  const roofTop = g.roofY - g.roofH;
  const y0 = roofTop - 40;
  const X = g.X;
  b.layer();
  // the stove chimney's collar with its pipe taken down for the bridges (a brass ring and a low cap)
  const cx = X(0.22);
  b.rect(CM.coatMustard, cx - 26, roofTop - 30, 52, 12);
  b.fill(CM.anchor, domePath(cx, roofTop - 30, 30, 10));
  b.rect(CM.anchor, cx - 30, roofTop - 19, 60, 8);
  // two herb troughs (terracotta) with low tufts
  for (const u of [0.32, 0.39]) {
    const tx = X(u);
    b.rect(CM.brickDeep, tx - 40, roofTop - 22, 80, 18);
    b.fill(u < 0.35 ? CM.sage : CM.leafGold, lobes(tx - 38, tx + 38, roofTop - 21, 15, `wiper/herb${u}`, 4));
  }
  // a coiled rope, a rolled tarpaulin, a long boat pole along the roof
  const rx = X(0.6);
  b.fill(CM.coatOat, ovalPath(rx, y0 + 26, 58, 11));
  b.fill(CM.line, ovalPath(rx, y0 + 26, 28, 5));
  b.rect(CM.coatSlate, X(0.5) - 60, y0 + 18, 120, 15);
  b.rect(CM.coatOat, Math.min(X(0.66), X(0.83)), y0 + 9, Math.abs(X(0.83) - X(0.66)), 5);
  b.fill(CM.paper, ovalPath(X(0.83) - d * 10, y0 + 11, 12, 6));
  // two brass mushroom vents
  for (const u of [0.45, 0.74]) b.fill(CM.coatMustard, domePath(X(u), roofTop - 2, 18, 12));
  // the stern doors (the kit draws one slab at this size): a frame, two leaves with lit glazed tops and wooden lower
  // panels, brass knobs
  b.layer();
  const sc = H / 100;
  const dxa = X(g.c0 + 0.005);
  const dx0 = Math.min(dxa, dxa + d * 34 * sc);
  const dw = 34 * sc;
  const dy0 = g.roofY + 6 * sc;
  const dh = g.gunTop - dy0;
  b.rect(CM.brickDeep, dx0, dy0, dw, dh);
  b.layer();
  for (const k of [0, 1]) {
    const lx = dx0 + 14 + k * (dw / 2);
    const lw = dw / 2 - 24;
    b.rect(CM.line, lx, dy0 + 14, lw, dh - 28);
    b.rect(CM.lamp, lx + 16, dy0 + 40, lw - 32, dh * 0.28);
    b.rect(CM.lampCore, lx + 30, dy0 + 56, lw - 60, dh * 0.12);
    b.rect(mixLine, lx + 16, dy0 + 60 + dh * 0.3, lw - 32, dh * 0.22);
    b.rect(mixLine, lx + 16, dy0 + 80 + dh * 0.52, lw - 32, dh * 0.22);
    b.fill(CM.coatMustard, ovalPath(k ? lx + 22 : lx + lw - 22, dy0 + dh * 0.5, 9, 9));
  }
  b.ink(`M${P(dx0 + dw / 2, dy0 + 10)}L${P(dx0 + dw / 2, dy0 + dh - 10)}`, INK_PX.mid, CM.ink, 0.2);
  // the cabin side (the kit's window layer is replaced: its geometry overlaps at this size): a big lit porthole with a
  // brass rim and curtains, a painted roses panel (no lettering), at true size for a boat right at the lens
  const wy = g.roofY + (g.gunTop - g.roofY) * 0.4;
  const cabinFar = X(g.c1);
  const along = (k: number) => cabinFar - d * k;
  const px = along(118 + 8);
  b.layer();
  b.fill(CM.coatMustard, ovalPath(px, wy, 118, 118));
  b.layer();
  b.fill(CM.coatOat, ovalPath(px, wy, 100, 100));
  b.layer();
  b.fill(CM.lamp, ovalPath(px, wy, 86, 86));
  b.layer();
  b.fill(CM.lampCore, ovalPath(px - 18, wy - 22, 34, 30));
  b.fill(CM.box, `M${P(px - 86, wy - 40)}Q${P(px - 26, wy - 80)} ${P(px - 30, wy + 52)}L${P(px - 84, wy + 30)}Z`);
  b.fill(CM.box, `M${P(px + 86, wy - 40)}Q${P(px + 26, wy - 80)} ${P(px + 30, wy + 52)}L${P(px + 84, wy + 30)}Z`);
  b.fill(CM.sage, lobes(px - 34, px + 30, wy + 64, 46, 'wiper/porthole/plant', 3));
  b.rect(CM.brickDeep, px - 22, wy + 58, 40, 24);
  b.ink(`M${P(px - 118, wy)}A118 118 0 1 0 ${P(px + 118, wy)}A118 118 0 1 0 ${P(px - 118, wy)}`, INK_PX.front, CM.ink, 0.22);
  b.ink(`M${P(px - 86, wy)}A86 86 0 0 1 ${P(px + 86, wy)}`, INK_PX.mid, CM.ink, 0.3);
  // the roses panel between the porthole and the doors
  const rpx = along(118 * 2 + 8 + 30 + 104);
  b.layer();
  b.fill(CM.coatOat, ovalPath(rpx, wy + 6, 104, 76));
  b.layer();
  b.fill(CM.stucco, ovalPath(rpx, wy + 6, 92, 64));
  b.layer();
  b.fill(CM.sage, leafPathW(rpx - 44, wy + 26, 56, 16, -24));
  b.fill(CM.sage, leafPathW(rpx + 46, wy + 22, 56, 16, 22));
  b.fill(CM.sage, leafPathW(rpx + 4, wy + 46, 48, 14, 4));
  b.layer();
  for (const [ox, oy, r0, c] of [[-26, -8, 24, CM.brickLight], [20, -18, 22, CM.leafRust], [34, 18, 18, CM.brickLight], [-8, 22, 16, CM.coatMustard]] as [number, number, number, string][]) {
    b.fill(c, ovalPath(rpx + ox, wy + oy, r0, r0 * 0.92));
  }
  b.layer();
  for (const [ox, oy, r0, c] of [[-26, -8, 24, CM.brickLight], [20, -18, 22, CM.leafRust], [34, 18, 18, CM.brickLight], [-8, 22, 16, CM.coatMustard]] as [number, number, number, string][]) {
    b.fill(mixHex(c, CM.brickDeep, 0.45), ovalPath(rpx + ox + 3, wy + oy + 2, r0 * 0.38, r0 * 0.34));
  }
  b.ink(`M${P(rpx - 104, wy + 6)}A104 76 0 0 1 ${P(rpx + 104, wy + 6)}`, INK_PX.mid, CM.ink, 0.3);
  b.layer();
  // bridge the roof surface and the roof edge (their misregistered fills can leave a 1 px slit between them)
  const cx0 = Math.min(X(g.c0), X(g.c1));
  const cx1 = Math.max(X(g.c0), X(g.c1));
  b.rect(CM.limestone, cx0 - 2, roofTop - 3, cx1 - cx0 + 4, 9);
  // and the gunwale stripe and the hull below it (same reason), along the straight part of the sheer
  const hx0 = Math.min(X(0), X(0.86));
  const hx1 = Math.max(X(0), X(0.86));
  b.rect(CM.anchor, hx0, g.gunTop + g.gunH - 3, hx1 - hx0, 7);
  b.ink(`M${P(X(0.08), y0 + 1)}L${P(X(0.84), y0 + 1)}`, INK_PX.mid, CM.ink, 0.35);
}

export const S7Wiper: WiperComponent = ({x, dir}) => {
  const d: 1 | -1 = dir === 'right' ? 1 : -1;
  const b = useMemo(() => {
    const k = new Batch();
    boatInto(k, opts(d), 0);
    // the kit's window layer (portholes, the flower panel, the stern doors, the tiller) is drawn by roofInto instead
    if (k.layers[2]) {
      k.layers[2].fills.clear();
      k.layers[2].inks.clear();
    }
    dropAbove(k, CLIP_Y);
    roofInto(k, d);
    return k;
  }, [d]);
  return (
    <g transform={`translate(${x.toFixed(2)} 0)`}>
      <defs>
        <clipPath id="s7wiperclip" clipPathUnits="userSpaceOnUse">
          <rect x={-4000} y={CLIP_Y} width={8000} height={3000} />
        </clipPath>
      </defs>
      <g clipPath="url(#s7wiperclip)">
        <Paint b={b} seed="s7wiper" exit={false} />
      </g>
    </g>
  );
};
S7Wiper.half = S7_WIPER.half;
S7Wiper.captionRegions = () => [];
