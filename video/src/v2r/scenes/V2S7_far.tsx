// V2S7_far.tsx (lane L5): the SKY, SUN2 and the WEST STRIP of V2S7 (x 0-110 on screen, left of Google's board), back
// to front. WORLD px (V2S7.tsx draws each part in its plane's group of the S7 camera; the sun is screen-fixed).
//   S7Sky        lib/sky's one continuous sunset sky (skies.ts S7_SUNSET: the caption field flat through the band, the
//                light band, the warm horizon at the eye level y 897), the set's bottom layer, unlit, never recoloured
//   S7Sun        SUN2 (260, 620) r 45: a flat disc, no halo (the sky carries the warmth), WHOLE in open sky above the
//                board's top-left (nothing crosses the 7x window of the push-through, V2S7_plan S7_SUN_WINDOW)
//   S7FarRoofs   +3: a far London row on the sunset band (three houses, chimneys, tone-on-tone windows), every fill
//                its step toward the air (planePalette at 4.3: nearly the air itself, pre-compensated for the pen)
//   S7FarTrees   +2: the far street's plane trees in autumn haze, rose-peach crowns, gold where the sun catches them (each value its own
//                step toward the air: the ladder falls >= 3 per plane from the wing, CRAFT §f.2)
//   S7WestEdge   +1: the forecourt's west edge, flush with the wing: a clipped hedge on a low limestone wall (z 25)
// Tier C throughout (<Tier tier="environment" bg={S7_AIR}>): flat fills, no line; the far tops stay at y >= 690 where
// the float could lift them over the board's top rail (x >= 100).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {Sky} from '../../lib/sky';
import {Tier} from '../../lib/tier';
import {Batch, Paint, P, ovalPath, lobes} from '../kit/canal/core';
import {crown as crownD} from '../../lib/sketch';
import {toneOnTone} from '../../lib/depth';
import {SUN2} from '../world/map';
import {S7_SUNSET, S7_AIR} from '../world/skies';
import {farPalette, onPlane, S7_WEST, yAt} from './V2S7_plan';

// ---------------------------------------------------------------- the sky and the sun

/** The one continuous sky (first in the set, unlit: lib/sky draws raw SVG the clean pen never recolours). */
export const S7Sky: React.FC = () => <Sky spec={S7_SUNSET} />;

/** SUN2: screen-fixed, the film's one pop colour (CM.sun, emissive: never recoloured), flat, no halo. */
export const S7Sun: React.FC = () => {
  const {x, y, r} = SUN2;
  return <path d={`M${x - r} ${y}A${r} ${r} 0 1 0 ${x + r} ${y}A${r} ${r} 0 1 0 ${x - r} ${y}Z`} fill={CM.sun} />;
};

// ---------------------------------------------------------------- +3 the far roofs

const ROOF_SRC = [CM.stucco, CM.brickLight, CM.limestone, CM.shadeWarm, CM.brick];
type House = {x0: number; x1: number; top: number; wall: string; roof: 'flat' | 'pitch'; ridge?: number; stacks: [number, number, number][]};
/** Three houses of a far terrace row (screen px; the board hides everything right of x 110 below y 680). Tops >= 690
 *  for x >= 100 (the float moves +3 0.45 x less than the board: it may never lift a roof over the board's rail). */
const HOUSES: House[] = [
  {x0: -70, x1: 18, top: 703, wall: CM.stucco, roof: 'flat', stacks: [[-26, -12, 689], [2, 14, 692]]},
  {x0: 18, x1: 74, top: 726, wall: CM.brickLight, roof: 'pitch', ridge: 709, stacks: [[40, 53, 695]]},
  {x0: 74, x1: 140, top: 697, wall: CM.limestone, roof: 'flat', stacks: []},
];
const ROOF_BASE = 925;

export const S7FarRoofs: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const C = farPalette(ROOF_SRC, 4.3);
    for (const h of HOUSES) {
      k.rect(C[h.wall], h.x0, h.top, h.x1 - h.x0 + 0.6, ROOF_BASE - h.top);
      if (h.roof === 'pitch' && h.ridge !== undefined) k.poly(C[CM.shadeWarm], [[h.x0 - 2, h.top], [h.x0 + 10, h.ridge], [h.x1 - 10, h.ridge], [h.x1 + 2, h.top]]);
      else k.rect(C[CM.limestone], h.x0 - 1, h.top - 3, h.x1 - h.x0 + 2, 3);
      for (const [a, c, top] of h.stacks) {
        k.rect(C[CM.brick], a, top, c - a, h.top - top + 1);
        k.rect(C[CM.limestone], a - 1.5, top, c - a + 3, 3);
      }
    }
    k.layer();
    // windows: tone-on-tone (a +3 window is the wall's own colour one soft step, never a speck: CRAFT §f.2), >= 8 px
    for (const h of HOUSES) {
      const win = toneOnTone(C[h.wall], {dE: 3});
      for (let y = h.top + 14; y < 900; y += 26) for (let x = h.x0 + 9; x + 8 < h.x1 - 4; x += 19) k.rect(win, x, y, 8, 12);
    }
    return k;
  }, []);
  return (
    <Tier tier="environment" bg={S7_AIR}>
      <Paint b={b} seed="s7/farRoofs" misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- +2 the far street's plane trees

type FarTree = {x: number; base: number; cy: number; rx: number; ry: number; tone: string; seed: string};
/** Plane trees along the far street (z ~70 m, ~7.5 m tall): crowns 745-875, trunks to the hedge's top (y 944). */
const FAR_TREES: FarTree[] = [
  {x: -8, base: 940, cy: 806, rx: 64, ry: 58, tone: CM.leafGold, seed: 's7/ft/a'},
  {x: 70, base: 940, cy: 820, rx: 50, ry: 52, tone: CM.leafGold, seed: 's7/ft/b'},
  {x: 132, base: 940, cy: 798, rx: 46, ry: 50, tone: CM.leafGold, seed: 's7/ft/c'},
];

export const S7FarTrees: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    // three values per crown on +2, each its own step toward the air (the main gold one plane step, the lit and the
    // far side a little more: the plane's mean sits >= 3 closer to the air than the wing's, and >= 3 farther than
    // the roofs': the ladder of CRAFT §f.2)
    const main = onPlane(CM.brickLight, 2.1);
    const lit = onPlane('#E6C084', 2.6);
    const far = onPlane(CM.leafGold, 2.6);
    const trunk = onPlane(CM.stoneShade, 2.4);
    for (const t of FAR_TREES) k.rect(trunk, t.x - 4, t.cy + t.ry * 0.6, 8, t.base - (t.cy + t.ry * 0.6));
    k.layer();
    for (const t of FAR_TREES) {
      k.fill(main, crownD(t.x, t.cy, t.rx, t.ry, {seed: t.seed, round: 0.75}));
      k.fill(lit, crownD(t.x - t.rx * 0.32, t.cy - t.ry * 0.26, t.rx * 0.4, t.ry * 0.36, {seed: `${t.seed}/lit`, round: 0.75}));
      k.fill(far, crownD(t.x + t.rx * 0.36, t.cy + t.ry * 0.32, t.rx * 0.36, t.ry * 0.3, {seed: `${t.seed}/sh`, round: 0.75}));
    }
    return k;
  }, []);
  return (
    <Tier tier="environment" bg={S7_AIR}>
      <Paint b={b} seed="s7/farTrees" misreg={false} />
    </Tier>
  );
};

// ---------------------------------------------------------------- +1 the west edge: a clipped hedge on a low wall

/** The hedge top, the wall's coping and the forecourt line under it (screen y, z 25). */
export const S7_WEST_Y = {hedge: yAt(S7_WEST.z, S7_WEST.hedge), wall: yAt(S7_WEST.z, S7_WEST.wall), base: yAt(S7_WEST.z)} as const;

export const S7WestEdge: React.FC = () => {
  const b = useMemo(() => {
    const k = new Batch();
    const {hedge, wall, base} = S7_WEST_Y;
    const x0 = -70;
    const x1 = 360;
    // the hedge: a clipped box with a softly lobed top; its sunlit top a step lighter
    k.fill(onPlane(CM.sage, 1), lobes(x0, x1, wall + 2, wall - hedge + 2, 's7/hedge', 9));
    k.layer();
    k.fill(onPlane('#C7D2B4', 1), lobes(x0, x1, hedge + 9, 9, 's7/hedgeTop', 12));
    k.layer();
    // the wall: limestone, its coping a lit sliver
    k.rect(onPlane(CM.limestone, 1), x0, wall, x1 - x0, base - wall);
    k.rect(onPlane(CM.paper, 1), x0, wall - 2, x1 - x0, 3.5);
    return k;
  }, []);
  return (
    <Tier tier="environment" bg={S7_AIR}>
      <Paint b={b} seed="s7/westEdge" misreg={false} />
    </Tier>
  );
};

/** The wall's face (south, away from the low sun): its Shade path for V2S7_light. */
export const s7WestWallFace = () => `M${P(-70, S7_WEST_Y.wall + 1.5)}L${P(360, S7_WEST_Y.wall + 1.5)}L${P(360, S7_WEST_Y.base)}L${P(-70, S7_WEST_Y.base)}Z`;

export {ovalPath};

// ---------------------------------------------------------------- +2 smoke from a moored boat's stove beyond the hedge

/** Smoke from a narrowboat's stove on the canal beyond the west hedge (its roof hidden by the hedge): four warm-grey
 *  puffs rising slowly and drifting west on the breeze, each growing in and shrinking out (never a fade), staying
 *  below y 860; a pure function of the time. On +2 (the far street's air step). */
export const S7BoatSmoke: React.FC<{t: number}> = ({t}) => {
  const b = new Batch();
  const cols = [onPlane('#D8C4BA', 1.6), onPlane('#E2D2C8', 1.6)];
  const x0 = 78;
  const y0 = 930;
  for (let i = 0; i < 4; i++) {
    const u = (((t + 10) / 3.2 + i / 4) % 1 + 1) % 1;
    const r = 4 + 11 * Math.sin(Math.PI * Math.min(1, u * 1.15)) * (u < 0.87 ? 1 : (1 - u) / 0.13);
    if (r < 1) continue;
    const x = x0 - 34 * u - 6 * Math.sin(u * 5 + i);
    const y = y0 - 72 * u;
    b.fill(cols[i % 2], ovalPath(x, y, r, r * 0.86));
  }
  return (
    <Tier tier="environment" bg={S7_AIR}>
      <Paint b={b} seed="s7/boatSmoke" misreg={false} />
    </Tier>
  );
};
