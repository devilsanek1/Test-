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
import {Batch, Paint, P, ovalPath, domePath, lobes} from '../kit/canal/core';
import {boatInto, boatGeom, BoatOpts} from '../kit/canal/boat';

const LEN = 1180;
const H = 980;
const WATER = 2020;
const CLIP_Y = 560;

const opts = (d: 1 | -1): BoatOpts => ({x: -LEN / 2, water: WATER, len: LEN, h: H, dir: d, seed: 'wiper', cabin: CM.sage, topView: 40, roofItems: false, panel: true, fenders: true, lit: true, ink: INK_PX.front});
const G = boatGeom(opts(-1));

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

/** The band-safe roof dressing, flat on the roof surface (y >= 566). */
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
  b.ink(`M${P(X(0.08), y0 + 1)}L${P(X(0.84), y0 + 1)}`, INK_PX.mid, CM.ink, 0.35);
}

export const S7Wiper: WiperComponent = ({x, dir}) => {
  const d: 1 | -1 = dir === 'right' ? 1 : -1;
  const b = useMemo(() => {
    const k = new Batch();
    boatInto(k, opts(d), 0);
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
