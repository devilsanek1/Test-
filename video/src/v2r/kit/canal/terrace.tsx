// canal/terrace.tsx: HER BANK's brick terrace (TREATMENT §2 B; map S3, S8). Two storeys + a mansard (squat where the
// skyline rule needs it: every top at y >= 600), stock brick in several colours (never one slab), a stucco ground
// floor here and there, sash windows (lit / unlit, switching), doors with fanlights and steps, area railings, window
// boxes, balconies with pots and string lights, chimney stacks on the party walls with pots and aerials, drainpipes,
// bins, a bike on the railings, neighbours in windows (slots), and HER house: the first-floor French window (teal
// frame, Juliet rail, blind up, lamp on, plants) and the teal door, placed EXACTLY on the map's rects.
//   <TerraceRow levels={...} x0={...} houses={...} her={{index, french, door}} />   frontal, screen px
//   terraceBacksInto(b, ...)                                                    the rear elevations (S4)
// A row can be mapped onto a receding wall with lib/persp's <Plane> (S8's lane): it is drawn with Fill / Ink only.

import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {useTime} from '../../../lib/time';
import {line, poly, rect as rectInk} from '../../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, domePath, lobes, lerp, leafPath, inkFor, r1} from './core';
import {litAt, StringLights, Puffs} from './life';
import {CastSlot, PersonSlot} from './slots';
import {railingInto, bikeInto} from './towpath';
import * as MAP from '../../world/map';
import {tiered, TierPart, Slot} from '../tiers';
import type {TierName} from '../tiers';

export type TerraceLevels = {
  /** Pavement / towpath level at the doors (screen y). */
  ground: number;
  /** First-floor level, the cornice (top of the first storey) and the mansard top (>= 600). */
  first: number;
  cornice: number;
  mansardTop: number;
};

export type HouseSpec = {
  /** Width in px. */
  w: number;
  brick?: string;
  /** Ground floor rendered in painted stucco instead of brick. */
  stucco?: boolean;
  door?: 'left' | 'right';
  doorColor?: string;
  /** First floor: two sashes, a French window with a balcony, or a single wide sash. */
  first?: 'two' | 'french' | 'one';
  /** String lights on the balcony (lit from `lightsAt`). */
  lights?: boolean;
  /** A neighbour in a window (slot) on this floor: 'ground' | 'first' | 'dormer'. */
  neighbour?: 'ground' | 'first' | 'dormer';
};

export type HerHouse = {
  index: number;
  /** Her French window (exact screen spot: S3 = W2_CUT, S8 = W). */
  french: MAP.Spot;
  /** Her teal door (exact screen rect, S8) or derived. */
  door?: MAP.Rect;
  /** Lamp on (S3 flash-forward / S8 after 34.95). Default true; or a time it lights. */
  lampAt?: number;
  lampOn?: boolean;
  /** Her silhouette and anything else drawn inside the French window (K4), over the lit room, under the frame. */
  inside?: React.ReactNode;
};

export type TerraceRowProps = {
  x0: number;
  levels: TerraceLevels;
  houses: HouseSpec[];
  her?: HerHouse;
  seed: string;
  /** Lit share of the sash windows (sunset ~0.6). */
  litFrac?: number;
  /** String lights come on (run) at this time; omit = on when `lightsOn`. */
  lightsAt?: number;
  lightsOn?: boolean;
  /** Ink weight of the structure (by distance). */
  ink?: number;
  /** Neighbours' actions: watering at t, kettle steam. */
  waterAt?: number;
  /** Tier of her door and French window (the clean pen): default 'support' (her place off its beat) inside the
   *  environment row; 'subject' on the beats it carries. */
  herTier?: TierName;
};

const BRICKS = [CM.brick, CM.brickLight, CM.brickDeep, CM.brick, CM.brickLight];
const DOORS = [CM.brickDeep, CM.coatMustard, CM.sage, CM.coatSlate, CM.anchor, CM.paper, CM.coatPlum];

/** A sash window (screen rect) into a batch: frame, two sashes, glazing bars, lit / unlit, a sill. */
export function sashInto(b: Batch, x: number, y: number, w: number, h: number, lit: boolean, seed: string, ink: number) {
  const r = rng(seed);
  b.rect(CM.paper, x - w * 0.06, y - w * 0.06, w * 1.12, h + w * 0.08);
  if (lit) {
    b.rect(CM.lamp, x, y, w, h);
    b.rect(CM.lampCore, x + w * 0.15, y + h * 0.1, w * 0.6, h * 0.4);
    // curtains and a lamp shade or a plant
    b.rect(r.pick([CM.box, CM.coatMustard, CM.blossom, CM.sage]), x, y, w * 0.18, h);
    b.rect(r.pick([CM.box, CM.coatMustard, CM.blossom, CM.sage]), x + w * 0.82, y, w * 0.18, h);
    if (r.chance(0.5)) b.fill(CM.anchor, domePath(x + w * 0.5, y + h * 0.3, w * 0.16, h * 0.08));
  } else {
    b.rect(CM.glass, x, y, w, h);
    b.poly(CM.shadeCool, [[x, y + h * 0.55], [x + w, y + h * 0.4], [x + w, y + h], [x, y + h]]);
    if (r.chance(0.5)) b.rect(CM.coatOat, x, y, w, h * r.range(0.2, 0.45));
  }
  // glazing bars: the meeting rail + one vertical
  b.rect(CM.paper, x, y + h * 0.48, w, Math.max(1.5, h * 0.035));
  b.rect(CM.paper, x + w * 0.48, y, Math.max(1.2, w * 0.04), h);
  b.rect(CM.limestone, x - w * 0.12, y + h, w * 1.24, Math.max(3, h * 0.06));
  if (ink > 0) b.ink(rectInk(x - w * 0.06, y - w * 0.06, w * 1.12, h + w * 0.08, {seed: `${seed}/f`, over: 'small', open: 0.35}), ink);
}

/** A door with a fanlight, a knocker and two steps (screen rect: the door leaf). */
export function doorInto(b: Batch, x: number, y: number, w: number, h: number, color: string, seed: string, ink: number, fanLit = false) {
  b.rect(CM.paper, x - w * 0.12, y - w * 0.62, w * 1.24, h + w * 0.62);
  b.fill(fanLit ? CM.lamp : CM.glass, domePath(x + w / 2, y - w * 0.04, w * 0.5, w * 0.5));
  b.rect(color, x, y, w, h);
  b.rect(CM.shadeWarm, x + w * 0.12, y + h * 0.08, w * 0.76, h * 0.36);
  b.rect(CM.shadeWarm, x + w * 0.12, y + h * 0.52, w * 0.76, h * 0.38);
  b.rect(color, x + w * 0.16, y + h * 0.11, w * 0.68, h * 0.3);
  b.rect(color, x + w * 0.16, y + h * 0.55, w * 0.68, h * 0.32);
  b.fill(CM.coatMustard, ovalPath(x + w * 0.8, y + h * 0.5, w * 0.05, w * 0.05));
  b.rect(CM.coatMustard, x + w * 0.38, y + h * 0.42, w * 0.24, Math.max(1.5, w * 0.04));
  // steps
  b.rect(CM.limestone, x - w * 0.2, y + h, w * 1.4, w * 0.12);
  b.rect(CM.stoneShade, x - w * 0.3, y + h + w * 0.12, w * 1.6, w * 0.1);
  if (ink > 0) b.ink(rectInk(x - w * 0.12, y - w * 0.62, w * 1.24, h + w * 0.62, {seed: `${seed}/d`, over: 'small', open: 0.3}) + `M${P(x, y)}A${r1(w / 2)} ${r1(w / 2)} 0 0 1 ${P(x + w, y)}`, ink);
}

/** Pot plants on a ledge (window box / balcony): terracotta pots with lobed greens and a few flowers. */
export function potsInto(b: Batch, x0: number, x1: number, y: number, s: number, seed: string) {
  const r = rng(seed);
  let x = x0 + s * 0.4;
  while (x < x1 - s * 0.4) {
    const pw = s * r.range(0.7, 1.1);
    b.poly(CM.brickDeep, [[x - pw / 2, y - pw * 0.8], [x + pw / 2, y - pw * 0.8], [x + pw * 0.38, y], [x - pw * 0.38, y]]);
    b.fill(r.pick([CM.sage, CM.sage, CM.leafGold]), lobes(x - pw * 0.75, x + pw * 0.75, y - pw * 0.8, pw * r.range(0.9, 1.6), `${seed}/p${x.toFixed(0)}`, 2));
    if (r.chance(0.5)) for (let k = 0; k < 3; k++) b.fill(r.pick([CM.box, CM.blossom, CM.coatMustard, CM.paper]), ovalPath(x + r.jitter(pw * 0.5), y - pw * r.range(1.1, 1.8), s * 0.12, s * 0.12));
    x += pw * r.range(1.1, 1.5);
  }
}

/** A row of terrace houses, frontal (screen px; or local px inside a <Plane>). */
const TerraceRowBody: React.FC<TerraceRowProps> = ({x0, levels: Lv, houses, her, seed, litFrac = 0.55, lightsAt, lightsOn = false, ink = INK_PX.mid, waterAt, herTier}) => {
  const t = useTime();
  // scale from the storey height (a first storey is ~3.0 m)
  const pxm = (Lv.first - Lv.cornice) / 3.0;
  const xs: number[] = [];
  {
    let x = x0;
    for (const h of houses) {
      xs.push(x);
      x += h.w;
    }
    xs.push(x);
  }
  const stat = useMemo(() => {
    const b = new Batch();
    const r = rng(seed);
    const wInk = ink;
    // ---- walls, mansards, stacks (back to front: the mansards, then the walls)
    houses.forEach((h, i) => {
      const x = xs[i];
      const w = h.w;
      // mansard: slate slope with dormers, lead roll on top
      b.poly(CM.shadeCool, [[x, Lv.cornice], [x + w * 0.04, Lv.mansardTop], [x + w * 0.96, Lv.mansardTop], [x + w, Lv.cornice]]);
      const nd = w > 90 ? 2 : 1;
      for (let k = 0; k < nd; k++) {
        const dx = x + w * (nd === 1 ? 0.5 : 0.28 + k * 0.44);
        const dw = Math.min(w * 0.22, pxm * 1.0);
        const dh = Math.max(6, (Lv.cornice - Lv.mansardTop) * 0.7);
        b.rect(CM.paper, dx - dw / 2 - 2, Lv.cornice - dh - 2, dw + 4, dh + 2);
        b.rect(CM.glass, dx - dw / 2, Lv.cornice - dh, dw, dh - 2);
        b.poly(CM.shadeCool, [[dx - dw / 2 - 4, Lv.cornice - dh - 2], [dx, Lv.cornice - dh - 2 - Math.min(10, dh * 0.4)], [dx + dw / 2 + 4, Lv.cornice - dh - 2]]);
      }
    });
    // chimney stacks on the party walls (tops clamped to y >= 600) with pots and some aerials
    let aer = '';
    for (let i = 0; i <= houses.length; i++) {
      if (i % 1 !== 0) continue;
      const x = xs[i];
      const sw = pxm * r.range(0.8, 1.1);
      const top = Math.max(602, Lv.mansardTop - pxm * r.range(0.6, 1.0));
      if (top >= Lv.cornice - 4) continue;
      b.rect(BRICKS[(i + 2) % BRICKS.length], x - sw / 2, top + 6, sw, Lv.cornice - top - 6);
      b.rect(CM.limestone, x - sw / 2 - 2, top + 4, sw + 4, 4);
      const np = Math.max(2, Math.round(sw / (pxm * 0.3)));
      for (let k = 0; k < np; k++) {
        const pw = sw / np - 2;
        const px = x - sw / 2 + 1 + k * (sw / np);
        b.rect(r.pick([CM.leafRust, CM.brickDeep, CM.brick]), px, Math.max(600, top - 2), pw, Math.min(8, top + 4 - 600));
      }
      if (r.chance(0.5)) {
        const ay = Math.max(601, top - pxm * 0.6);
        aer += `M${P(x + sw * 0.2, top + 4)}L${P(x + sw * 0.2, ay)}M${P(x + sw * 0.2 - 10, ay + 3)}L${P(x + sw * 0.2 + 10, ay + 3)}M${P(x + sw * 0.2 - 7, ay + 8)}L${P(x + sw * 0.2 + 7, ay + 8)}`;
      }
    }
    b.ink(aer, INK_PX.hair, CM.ink, 0, {thing: true});
    b.layer();
    houses.forEach((h, i) => {
      const x = xs[i];
      const w = h.w;
      const brick = h.brick ?? BRICKS[i % BRICKS.length];
      b.rect(brick, x, Lv.cornice, w, Lv.ground - Lv.cornice);
      if (h.stucco) b.rect(CM.stucco, x, Lv.first + pxm * 0.15, w, Lv.ground - Lv.first - pxm * 0.15);
      // cornice + parapet band, a string course at the first floor
      b.rect(CM.limestone, x - 1, Lv.cornice - 4, w + 2, pxm * 0.32);
      b.rect(CM.stoneShade, x - 1, Lv.cornice + pxm * 0.28, w + 2, 3);
      b.rect(CM.limestone, x - 1, Lv.first, w + 2, pxm * 0.14);
      // party-wall pilaster and a drainpipe
      b.rect(CM.brickDeep, x - 2, Lv.cornice, 4, Lv.ground - Lv.cornice);
      b.rect(CM.shadeCool, x + w - pxm * 0.12, Lv.cornice + pxm * 0.2, Math.max(2, pxm * 0.06), Lv.ground - Lv.cornice - pxm * 0.2);
      // brick ticks
    });
    // area railings along the pavement in front of the whole row
    railingInto(b, xs[0], xs[xs.length - 1], Lv.ground, pxm * 0.9, `${seed}/area`, {pitch: pxm * 1.2, bars: 4});
    return b;
  }, [seed, x0, Lv.ground, Lv.first, Lv.cornice, Lv.mansardTop, houses.length]);

  // ---- per frame: windows (lit switching), doors, balconies, her house (her door and French window in their own
  // batches, painted in her tier part: `herTier`)
  const dyn = new Batch();
  const herDyn = new Batch();
  const herFront = new Batch();
  const slots: React.ReactNode[] = [];
  let k = 0;
  const nWin = houses.length * 3;
  houses.forEach((h, i) => {
    const x = xs[i];
    const w = h.w;
    const isHer = her && her.index === i;
    const doorLeft = (h.door ?? (i % 2 ? 'right' : 'left')) === 'left';
    const dw = pxm * 1.05;
    const dh = pxm * 2.25;
    // ground floor: door + a window
    const dX = isHer && her!.door ? her!.door.x0 : doorLeft ? x + w * 0.12 : x + w - w * 0.12 - dw;
    const dY = isHer && her!.door ? her!.door.y0 : Lv.ground - dh - pxm * 0.25;
    const dW = isHer && her!.door ? her!.door.x1 - her!.door.x0 : dw;
    const dH = isHer && her!.door ? her!.door.y1 - her!.door.y0 : dh;
    doorInto(isHer ? herDyn : dyn, dX, dY, dW, dH, isHer ? CM.hero : h.doorColor ?? DOORS[i % DOORS.length], `${seed}/door${i}`, ink * 0.7, litAt(t, seed, k + 999, nWin));
    const gw = pxm * 1.35;
    const gh = pxm * 1.75;
    const gX = doorLeft ? x + w - w * 0.14 - gw : x + w * 0.14;
    const onG = litAt(t, seed, k++, nWin, {litFrac});
    sashInto(dyn, gX, Lv.ground - gh - pxm * 0.75, gw, gh, onG, `${seed}/g${i}`, ink * 0.6);
    // a window box under the ground window
    potsInto(dyn, gX - gw * 0.05, gX + gw * 1.05, Lv.ground - pxm * 0.62, pxm * 0.3, `${seed}/gb${i}`);
    if (h.neighbour === 'ground' && onG) slots.push(<CastSlot key={`n${i}`} s={{id: `nb${i}`, x: gX + gw * 0.5, y: Lv.ground - pxm * 0.8, h: gh * 0.7, pose: 'window', seed: `${seed}/nb${i}`}} />);
    // first floor
    const fy0 = Lv.cornice + pxm * 0.55;
    const fy1 = Lv.first - pxm * 0.1;
    if (isHer) {
      const F = her!.french;
      const fx = F.x - F.w / 2;
      const fy = F.y - F.h / 2;
      const lamp = her!.lampOn ?? (her!.lampAt === undefined ? true : t >= her!.lampAt);
      // teal frame (the hero), the room (lamp-lit), blind UP (a rolled bar at the top)
      herDyn.rect(CM.hero, fx - F.w * 0.07, fy - F.w * 0.07, F.w * 1.14, F.h + F.w * 0.07);
      herDyn.rect(lamp ? CM.lamp : CM.glass, fx, fy, F.w, F.h);
      if (lamp) herDyn.rect(CM.lampCore, fx + F.w * 0.18, fy + F.h * 0.12, F.w * 0.64, F.h * 0.46);
      herDyn.rect(CM.coatOat, fx, fy, F.w, F.h * 0.06);
      // shelves of books on the back wall, a standard lamp, plants
      for (let s2 = 0; s2 < 2; s2++) {
        const sy = fy + F.h * (0.3 + s2 * 0.18);
        herDyn.rect(CM.line, fx + F.w * 0.55, sy, F.w * 0.4, F.h * 0.02);
        for (let bk = 0; bk < 5; bk++) herDyn.rect([CM.brick, CM.coatMustard, CM.sage, CM.paneUnlit, CM.box][(bk + s2) % 5], fx + F.w * (0.57 + bk * 0.075), sy - F.h * 0.08, F.w * 0.055, F.h * 0.08);
      }
      herDyn.fill(CM.coatMustard, domePath(fx + F.w * 0.2, fy + F.h * 0.32, F.w * 0.09, F.h * 0.06));
      herDyn.rect(CM.anchor, fx + F.w * 0.195, fy + F.h * 0.32, Math.max(1.5, F.w * 0.015), F.h * 0.6);
      herDyn.fill(CM.sage, lobes(fx + F.w * 0.02, fx + F.w * 0.3, fy + F.h, F.h * 0.3, `${seed}/herplant`, 3));
    }
  });
  // her inside (K4's silhouette) goes between the room and the frame: render a second batch after `inside`
  const front = new Batch();
  houses.forEach((h, i) => {
    const x = xs[i];
    const w = h.w;
    const isHer = her && her.index === i;
    const fy0 = Lv.cornice + pxm * 0.55;
    const fy1 = Lv.first - pxm * 0.1;
    if (isHer) {
      const F = her!.french;
      const fx = F.x - F.w / 2;
      const fy = F.y - F.h / 2;
      // the French window's frame and glazing bars over her, the Juliet rail
      herFront.rect(CM.hero, fx + F.w * 0.48, fy, F.w * 0.04, F.h);
      herFront.rect(CM.hero, fx, fy + F.h * 0.62, F.w, F.w * 0.035);
      herFront.rect(CM.hero, fx - F.w * 0.07, fy + F.h - F.w * 0.02, F.w * 1.14, F.w * 0.07);
      const ry = fy + F.h * 0.6;
      herFront.rect(CM.anchor, fx - F.w * 0.1, ry, F.w * 1.2, Math.max(2, F.w * 0.025));
      for (let bx = fx - F.w * 0.08; bx <= fx + F.w * 1.08; bx += F.w * 0.09) herFront.rect(CM.anchor, bx, ry, Math.max(1.2, F.w * 0.012), fy + F.h - ry);
      herFront.ink(rectInk(fx - F.w * 0.07, fy - F.w * 0.07, F.w * 1.14, F.h + F.w * 0.07, {seed: `${seed}/herf`, over: 'small'}), INK_PX.mid);
      return;
    }
    const kind = h.first ?? (['two', 'french', 'one'] as const)[i % 3];
    if (kind === 'french') {
      // a small balcony with pots and (maybe) string lights
      const bw = w * 0.56;
      const bx = x + (w - bw) / 2;
      const fh = (fy1 - fy0) * 0.95;
      const on = litAt(t, seed, k++, nWin, {litFrac});
      sashInto(front, bx + bw * 0.12, fy1 - fh, bw * 0.76, fh, on, `${seed}/fr${i}`, ink * 0.6);
      front.rect(CM.limestone, bx - 6, fy1 - 2, bw + 12, pxm * 0.12);
      railingInto(front, bx - 4, bx + bw + 4, fy1, pxm * 0.8, `${seed}/bal${i}`, {pitch: bw / 3, bars: 4});
      potsInto(front, bx, bx + bw * 0.3, fy1, pxm * 0.35, `${seed}/bp${i}`);
      if (h.neighbour === 'first' && on) slots.push(<CastSlot key={`nf${i}`} s={{id: `nf${i}`, x: bx + bw * 0.5, y: fy1 - pxm * 0.2, h: fh * 0.6, pose: 'window', seed: `${seed}/nf${i}`}} />);
    } else {
      const n = kind === 'two' ? 2 : 1;
      const sw = kind === 'two' ? pxm * 1.15 : pxm * 1.6;
      const sh = (fy1 - fy0) * 0.86;
      for (let j = 0; j < n; j++) {
        const sx = n === 1 ? x + (w - sw) / 2 : x + w * (j === 0 ? 0.18 : 0.82) - sw / 2;
        const on = litAt(t, seed, k++, nWin, {litFrac});
        sashInto(front, sx, fy1 - sh, sw, sh, on, `${seed}/f${i}${j}`, ink * 0.6);
        if (j === 0) potsInto(front, sx - sw * 0.05, sx + sw * 1.05, fy1 + pxm * 0.06, pxm * 0.28, `${seed}/fb${i}`);
        if (h.neighbour === 'first' && on && j === 0) slots.push(<CastSlot key={`nf${i}`} s={{id: `nf${i}`, x: sx + sw * 0.5, y: fy1 - pxm * 0.2, h: sh * 0.6, pose: 'window', seed: `${seed}/nf${i}`}} />);
      }
    }
  });
  // structure ink (cornice, first floor line, party walls), loose
  let st = '';
  st += line(xs[0], Lv.cornice - 4, xs[xs.length - 1], Lv.cornice - 4, {seed: `${seed}/cor`, over: 'medium'});
  st += line(xs[0], Lv.first, xs[xs.length - 1], Lv.first, {seed: `${seed}/ff`, over: 'small'});
  xs.forEach((x, i) => {
    if (i % 2 === 0) st += line(x, Lv.cornice, x, Lv.ground, {seed: `${seed}/pw${i}`, over: 'small'});
  });
  front.ink(st, ink);
  // string lights on balconies and neighbours' life
  const lights: React.ReactNode[] = [];
  houses.forEach((h, i) => {
    if (!h.lights) return;
    const x = xs[i];
    lights.push(<StringLights key={i} from={[x + h.w * 0.1, Lv.first - pxm * 1.05]} to={[x + h.w * 0.9, Lv.first - pxm * 1.0]} sag={pxm * 0.25} n={9} r={Math.max(2.5, pxm * 0.06)} seed={`${seed}/sl${i}`} onAt={lightsAt} on={lightsOn} w={INK_PX.hair} />);
  });
  return (
    <>
      <Paint b={stat} seed={`${seed}/stat`} />
      <Paint b={dyn} seed={`${seed}/dyn`} />
      <TierPart def="support" tier={herTier}>
        <Paint b={herDyn} seed={`${seed}/herDyn`} />
      </TierPart>
      <Slot>{her?.inside}</Slot>
      <Paint b={front} seed={`${seed}/front`} />
      <TierPart def="support" tier={herTier}>
        <Paint b={herFront} seed={`${seed}/herFront`} />
      </TierPart>
      {lights}
      {slots}
      {waterAt !== undefined ? null : null}
    </>
  );
};
export const TerraceRow = tiered('environment', {}, TerraceRowBody);

/** The REAR of a terrace (S4): back extensions, small windows, drainpipes, garden walls, a tree or two, washing on a
 *  line, a shed; flat and a little cooler (it faces the towpath across the back gardens). Batched. */
export function terraceBacksInto(b: Batch, x0: number, x1: number, ground: number, top: number, seed: string, t = 0, litFrac = 0.3) {
  const r = rng(seed);
  let x = x0;
  let i = 0;
  const pxm = (ground - top) / 9;
  while (x < x1) {
    const w = r.range(4.2, 5.6) * pxm;
    const brick = BRICKS[i % BRICKS.length];
    const tTop = Math.max(602, top + r.jitter(pxm * 0.4));
    // main back wall + a half-width back extension (lower)
    b.rect(brick, x, tTop + pxm * 1.4, w, ground - tTop - pxm * 1.4);
    b.poly(CM.shadeCool, [[x, tTop + pxm * 1.4], [x + w * 0.1, tTop], [x + w * 0.9, tTop], [x + w, tTop + pxm * 1.4]]);
    const ex = r.chance(0.5) ? x : x + w * 0.5;
    b.rect(BRICKS[(i + 1) % BRICKS.length], ex, ground - pxm * 3.6, w * 0.5, pxm * 3.6);
    b.poly(CM.shadeWarm, [[ex, ground - pxm * 3.6], [ex + w * 0.5, ground - pxm * 4.3], [ex + w * 0.5, ground - pxm * 3.6]]);
    // windows (small, some lit)
    for (let k = 0; k < 2; k++) {
      for (let row = 0; row < 2; row++) {
        const wx = x + w * (0.18 + k * 0.42);
        const wy = tTop + pxm * (1.9 + row * 2.6);
        if (wy + pxm * 1.3 > ground - pxm * 3.6 && ((wx >= ex && wx < ex + w * 0.5) || (wx + pxm * 0.8 > ex && wx < ex + w * 0.5))) continue;
        const on = litAt(t, seed, i * 4 + k * 2 + row, 400, {litFrac});
        b.rect(CM.paper, wx - 2, wy - 2, pxm * 0.8 + 4, pxm * 1.3 + 4);
        b.rect(on ? CM.lamp : CM.paneUnlit, wx, wy, pxm * 0.8, pxm * 1.3);
      }
    }
    // a drainpipe, a vent, a satellite dish now and then
    b.rect(CM.shadeCool, x + w * 0.92, tTop + pxm * 1.4, Math.max(2, pxm * 0.08), ground - tTop - pxm * 1.4);
    if (r.chance(0.3)) b.fill(CM.paper, ovalPath(x + w * 0.7, tTop + pxm * 1.9, pxm * 0.3, pxm * 0.3));
    // a chimney stack
    const cs = Math.max(602, tTop - pxm * 0.8);
    b.rect(BRICKS[(i + 2) % BRICKS.length], x + w * 0.05, cs, pxm * 0.8, tTop + pxm * 0.4 - cs);
    b.rect(CM.leafRust, x + w * 0.05 + 1, Math.max(600, cs - 4), pxm * 0.3, 5);
    b.rect(CM.brickDeep, x + w * 0.05 + pxm * 0.45, Math.max(600, cs - 4), pxm * 0.3, 5);
    x += w;
    i++;
  }
  // garden walls along the front with trees and a shed, washing on lines
  b.layer();
  b.rect(CM.brickLight, x0, ground - pxm * 1.8, x1 - x0, pxm * 1.8);
  b.rect(CM.limestone, x0, ground - pxm * 1.8 - 3, x1 - x0, 4);
  for (let xx = x0 + r.range(40, 120); xx < x1; xx += r.range(180, 320)) {
    const h = pxm * r.range(3, 5);
    const R = h * 0.42;
    b.rect(CM.line, xx - 3, ground - h * 0.55, 6, h * 0.55 - pxm * 1.8);
    b.fill(r.pick([CM.sage, CM.leafGold, CM.sage, CM.leafRust]), lobes(xx - R, xx + R, ground - h * 0.45, R * 1.4, `${seed}/tr${xx.toFixed(0)}`, 3));
  }
  for (let xx = x0 + r.range(100, 200); xx < x1; xx += r.range(300, 460)) {
    const y = ground - pxm * 2.4;
    let d = `M${P(xx, y)}Q${P(xx + 60, y + 8)} ${P(xx + 120, y)}`;
    for (let k = 0; k < 4; k++) b.rect(r.pick([CM.paper, CM.box, CM.coatMustard, CM.sage, CM.blossom]), xx + 12 + k * 26, y + 4 + Math.sin(k) * 2, 16, 20);
    b.ink(d, INK_PX.hair, CM.ink, 0, {thing: true});
    d = '';
  }
}

export {lerp, leafPath, inkFor, poly, Puffs, bikeInto};
export type {PersonSlot};
