// OldQuarter — S9 (S12 "too old to fix", S13 board finale + un-build). Golden. Canvas coords at S12 rest.
//
// Door-height eye level (y 1150): we look UP at three website sites built with <SiteFacade/>: siteL (30, 690, 315, 610,
// six storeys, sand: its top meets the golden sky, so it sits a step off it), siteM (360, 820, 280, 480, four storeys,
// cream: the OLD one, an ordinary building), siteR (740, 700, 310, 600, six storeys, mintPale). Each has a browser window, a door (y 1150-1300) with a stoop and a lock,
// and a HANGING PLAQUE sign on a bracket at eye level (y 1190): siteL (300, 1190), siteM (590, 1190) = the plaque that
// turns old (tan, chipped, cobweb, dust, cane), siteR (800, 1190). A street gap x 640-740 recedes to the horizon with a
// second row of 9 sand / tan buildings (every third plaque old) and the far city; a flat peach band only in the gap.
// Ground: one flat field per band (sidewalk, street) with a few broken paving lines + specks. Near layer: a street tree
// cropped at the right edge standing in a tree pit at kerb height, kerb (y 1500), a bollard (700, 1450, Pip), and the
// default foreground (a low railing cut by the left edge). The sites pop up on "one / in / three". S13 adds the
// noticeboard slot (300, 1090, 500, 310; rail 380, 1060, 340, 28) and edge-audience slots (no railing then).
//
//   <OldQuarter sun={<Sun cx={500} cy={690} r={110}/>} sitePopAt={[61.2, 61.5, 61.8]} plaqueSwingAt={62.4}
//     oldPlaque={{flipOldAt: 63.6, cobwebAt: 64.4, dustAt: 64.5, caneAt: 64.7}} />
//   <OldQuarter board={{riseAt: 66.7, pane1: ..., pane2: ...}} audience />          // S13

import React from 'react';
import {palette} from '../../../lib/theme';
import {useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {crown, crownTicks, ellipse, line, polyPath, rectPath, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {osc} from '../../../lib/time';
import {rand} from '../../../lib/rng';
import {LayerWrap, noWrap, PopUp, SetPlace, SI} from './common';
import {Foreground, ForegroundSpec, groundMarks, GroundMarks} from './ground';
import {BollardSlot, HangingPlaqueSlot, NoticeboardSlot, OnlookerSlot, PaneRect, PlaqueSlot, SupportTagSlot} from './propSlots';
import {SiteFacade, SiteFacadeProps} from './SiteFacade';
import type {Acc, Hair} from '../../../lib/kit';
import {Furniture, FurnitureItem, People, PeopleSpec, WalkerAnchor} from './life';

type R4 = [number, number, number, number];

export const OLD_QUARTER = {
  eye: 1150,
  base: 1300,
  kerb: 1500,
  sites: {
    L: {x: 30, top: 690, w: 315, storeys: 6, fill: palette.sand, browser: [100, 880, 190, 130] as R4, door: [150, 1150, 90, 150] as R4, sign: {x: 300, y: 1190, wallX: 246}},
    M: {x: 360, top: 820, w: 280, storeys: 4, fill: palette.cream, browser: [420, 920, 190, 120] as R4, door: [470, 1150, 90, 150] as R4, sign: {x: 590, y: 1190, wallX: 566}},
    R: {x: 740, top: 700, w: 310, storeys: 6, fill: palette.mintPale, browser: [770, 860, 170, 130] as R4, door: [850, 1150, 90, 150] as R4, sign: {x: 800, y: 1190, wallX: 844}},
  },
  gap: [640, 740] as [number, number],
  vp: [690, 1150] as Pt,
  band: [1040, 1150] as [number, number],
  /** Crate spots on the steps (makers ship, keepers install; never siteM). */
  crates: {L: [195, 1320] as Pt, R: [895, 1320] as Pt},
  bollard: {x: 700, y: 1450, w: 46, h: 86},
  sun: {x: 500, y: 690, r: 110},
  /** S13 board + audience. */
  board: {frame: [300, 1090, 500, 310] as R4, rail: [380, 1060, 340, 28] as R4, legsY: 1480},
  audience: [
    {head: [90, 1290] as Pt, hair: 'curly' as Hair, body: palette.teal, acc: ['hood'] as Acc[]},
    {head: [200, 1350] as Pt, hair: 'bun' as Hair, body: palette.sand, acc: ['scarf'] as Acc[]},
    {head: [890, 1320] as Pt, hair: 'short' as Hair, body: palette.sage, acc: ['collar'] as Acc[]},
    {head: [1000, 1280] as Pt, hair: 'cap' as Hair, body: palette.brown, acc: [] as Acc[]},
  ],
  /** Pip on the board top (S13). */
  pipBoard: [760, 1090] as Pt,
  /** People layer (life.tsx): a walker UP the street gap (feet 1262, h 100: past siteM's old plaque, its corner and
   *  cane and the cart line, so he never covers the S10 'old' event or Pip; he walks away to the VP, pace 0.3 = S10's
   *  GapWalker), a stander cut by the left edge (heights from the door-height eye level: (feet - 1150) / 1.1). The gap
   *  walker is FARTHER than the cart line (cartY 1330): the set draws him before the cart slot. */
  walkers: [
    {x: 696, y: 1262, h: 100, go: 'vp', pace: 0.3, body: palette.teal, hair: 'short', acc: ['backpack']},
    {x: 64, y: 1478, h: 296, go: 'stand', body: palette.sage, hair: 'curly', acc: ['scarf']},
  ] as WalkerAnchor[],
  /** Street furniture: a planter on the sidewalk, a bike by the tree. */
  furniture: [
    {kind: 'planter', x: 420, y: 1486, s: 0.78},
    {kind: 'bike', x: 960, y: 1496, s: 0.95, flip: true},
  ] as FurnitureItem[],
  /** Rooftops (review 5: one distinct type + one rooftop detail per site, all under the y-600 ceiling): siteL a teal
   *  mansard with two dormers, siteM a TV antenna, siteR balconies, rooftop plants and a water tank on legs. */
  roofs: {mansard: {base: 690, top: 616, x0: 22, x1: 353, inset: 30}, dormers: [[112, 640], [238, 640]] as Pt[], antenna: {x: 616, base: 820, top: 730}, tank: {x: 978, y: 618, w: 54, h: 42, legs: 700}, balconies: [800, 1000] as number[]},
  // ---- storyboard v3 (S10)
  /** The A-frame notice sign's board face on the left pavement ([x0, y0, x1, y1], LabelTag kind 'sign' `box`); its legs
   *  stand below it. Rendered through the `noticeSign` slot in front of the cart, behind the near layer. */
  noticeSign: [125, 1262, 445, 1462] as [number, number, number, number],
  /** The makers' cart's line along the frontage (the stoop line, feet y): the cart slot rolls here, behind the sign and the
   *  bollard. */
  cartY: 1330,
  /** v3 second-row 'old' mask: 5 of 9, alternating (secondOld="half"). */
  secondOldHalf: [true, false, true, false, true, false, true, false, true] as boolean[],
  /** Support-tag hang points (props SupportTag) on the three hanging plaques (hung over each plate's upper-right corner,
   *  clear of the A-frame sign) and their size. */
  support: {L: [348, 1166] as Pt, M: [640, 1164] as Pt, R: [848, 1166] as Pt, size: 34},
  /** v3: the second-row buildings that SHOW in the street gap (>= 20 px of wall between siteM and siteR) carry their
   *  plaque at a readable size on their gap wall (`gapPlaque`, default 20 world px with secondOld = >= 21 px on screen in
   *  S10), centred on the visible strip at y `gapPlaqueY`, above siteM's hanging plaque and its bracket; with 'half'
   *  that is one current and one OLD plate. The caretaker's tag on the old gap door is drawn at `caretakerScale`. */
  gapPlaqueY: 1062,
  caretakerScale: 1.6,
} as const;

type SiteId = 'L' | 'M' | 'R';

const G = (() => {
  const s = 'oq';
  const VP = OLD_QUARTER.vp;
  // street gap receding to the horizon
  const streetGap = polyPath([[640, OLD_QUARTER.base], [740, OLD_QUARTER.base], [VP[0] + 3, VP[1]], [VP[0] - 3, VP[1]]]);
  // second row of 9 buildings (behind the near row), tops 760-800, base on the eye line
  const second: {x: number; w: number; top: number; c: string; plaque: 'new' | 'old'}[] = [];
  let x = 330;
  for (let i = 0; i < 9; i++) {
    const w = 52 + rand(s, `w${i}`) * 16;
    // the second row's tops meet the golden sky: sand / tan, never cream (one or two steps off the sky)
    second.push({x, w, top: 760 + rand(s, `t${i}`) * 40, c: [palette.sand, palette.tan, palette.sand][i % 3], plaque: i % 3 === 2 ? 'old' : 'new'});
    x += w + 2;
  }
  let secondInk = '';
  let secondWin = '';
  let secondDoors = '';
  let secondDoorInk = '';
  for (const b of second) {
    secondInk += line(b.x, b.top, b.x + b.w, b.top, {seed: `${s}/st${b.x}`, over: 'small', breaks: false}) + line(b.x, b.top, b.x, OLD_QUARTER.eye, {seed: `${s}/sl${b.x}`, over: 0, breaks: false});
    for (let yy = b.top + 14; yy < OLD_QUARTER.eye - 40; yy += 34) secondWin += rectPath(b.x + b.w * 0.2, yy, b.w * 0.24, 16) + rectPath(b.x + b.w * 0.56, yy, b.w * 0.24, 16);
    // v3: a street door per second-row building (they show in the street gap)
    const dx = b.x + b.w * 0.12;
    secondDoors += rectPath(dx, OLD_QUARTER.eye - 30, 14, 30);
    secondDoorInk += line(dx, OLD_QUARTER.eye, dx, OLD_QUARTER.eye - 30, {seed: `${s}/sd${b.x}a`, over: 0, breaks: false}) + line(dx - 1, OLD_QUARTER.eye - 30, dx + 15, OLD_QUARTER.eye - 30, {seed: `${s}/sd${b.x}b`, over: 'small', breaks: false}) + line(dx + 14, OLD_QUARTER.eye - 30, dx + 14, OLD_QUARTER.eye, {seed: `${s}/sd${b.x}c`, over: 0, breaks: false});
  }
  // v3: the second-row buildings visible in the street gap, their plaque centre on the visible strip, and the window
  // batch with the gap plaques' storey left blank (a plate replaces that window)
  const gapBuildings = second
    .map((b, i) => {
      const lo = Math.max(b.x, 640);
      const hi = Math.min(b.x + b.w, 740);
      return {i, cx: (lo + hi) / 2, vis: hi - lo};
    })
    .filter((g) => g.vis >= 20);
  let secondWinGap = '';
  second.forEach((b, i) => {
    const gb = gapBuildings.find((g) => g.i === i);
    for (let yy = b.top + 14; yy < OLD_QUARTER.eye - 40; yy += 34) {
      if (gb && yy + 16 > OLD_QUARTER.gapPlaqueY - 16 && yy < OLD_QUARTER.gapPlaqueY + 16) continue;
      secondWinGap += rectPath(b.x + b.w * 0.2, yy, b.w * 0.24, 16) + rectPath(b.x + b.w * 0.56, yy, b.w * 0.24, 16);
    }
  });
  // far city at the end of the gap
  const far = rectPath(642, 1100, 22, 50) + rectPath(664, 1080, 18, 70) + rectPath(684, 1110, 26, 40) + rectPath(712, 1090, 24, 60);
  const kerb = line(-160, OLD_QUARTER.kerb, 1240, OLD_QUARTER.kerb + 2, {seed: `${s}/k`, over: 0}) + line(-160, OLD_QUARTER.kerb + 20, 1240, OLD_QUARTER.kerb + 23, {seed: `${s}/k2`, over: 0});
  // the sidewalk and the street: one flat field each, a few broken paving lines + specks (no tile grid)
  const walk = groundMarks({vp: [690, 1150], top: OLD_QUARTER.base + 30, bottom: OLD_QUARTER.kerb - 6, x0: -700, x1: 2000, rays: 4, cross: 1, specks: 8, reach: 0.9, seed: `${s}/gw`});
  const street = groundMarks({vp: [690, 1150], top: OLD_QUARTER.kerb + 40, bottom: 1920, x0: -200, x1: 1300, rays: 0, cross: 1, specks: 14, seed: `${s}/gs`});
  // stoops in front of each door
  const stoops = (['L', 'M', 'R'] as SiteId[]).map((id) => {
    const d = OLD_QUARTER.sites[id].door;
    return rectPath(d[0] - 14, OLD_QUARTER.base, d[2] + 28, 12) + rectPath(d[0] - 26, OLD_QUARTER.base + 12, d[2] + 52, 12);
  });
  const stoopInk = (['L', 'M', 'R'] as SiteId[])
    .map((id) => {
      const d = OLD_QUARTER.sites[id].door;
      return line(d[0] - 18, OLD_QUARTER.base, d[0] + d[2] + 18, OLD_QUARTER.base, {seed: `${s}/so${id}`, over: 'small'}) + line(d[0] - 30, OLD_QUARTER.base + 12, d[0] + d[2] + 30, OLD_QUARTER.base + 12, {seed: `${s}/st${id}`, over: 'small'}) + line(d[0] - 30, OLD_QUARTER.base + 24, d[0] + d[2] + 30, OLD_QUARTER.base + 24, {seed: `${s}/sb${id}`, over: 'small'});
    })
    .join('');
  // near street tree cropped at the right edge
  const treeCrown = crown(1040, 1050, 110, 135, {seed: `${s}/tree`, bumps: 10});
  const treeTicks = crownTicks(1040, 1050, 110, 135, {seed: `${s}/treek`, n: 4, size: 12});
  // the trunk stands in a tree pit at kerb height (style bible 8), not a pole to the frame bottom
  const trunk = rectPath(1022, 1150, 24, 312);
  const trunkInk = line(1022, 1462, 1022, 1160, {seed: `${s}/t1`, over: 0}) + line(1046, 1462, 1045, 1165, {seed: `${s}/t2`, over: 0}) + ellipse(1034, 1464, 54, 12, {seed: `${s}/pit`, overlap: -40});
  const pit = `M980 1464a54 12 0 1 0 108 0a54 12 0 1 0 -108 0Z`;
  // rooftops
  const RF = OLD_QUARTER.roofs;
  const M = RF.mansard;
  const mansard = polyPath([[M.x0, M.base], [M.x0 + M.inset, M.top], [M.x1 - M.inset, M.top], [M.x1, M.base]]);
  let dormers = '';
  let dormerGlass = '';
  let dormerInk = '';
  for (const [dx, dy] of RF.dormers) {
    dormers += rectPath(dx - 20, dy, 40, 44) + polyPath([[dx - 25, dy + 1], [dx, dy - 18], [dx + 25, dy + 1]]);
    dormerGlass += rectPath(dx - 12, dy + 10, 24, 28);
    dormerInk += line(dx - 28, dy + 2, dx, dy - 18, {seed: `${s}/dr${dx}a`, over: [3, 1]}) + line(dx, dy - 18, dx + 28, dy + 2, {seed: `${s}/dr${dx}b`, over: [1, 3]}) + line(dx - 20, dy + 2, dx - 20, dy + 44, {seed: `${s}/dr${dx}c`, over: 0}) + line(dx + 20, dy + 2, dx + 20, dy + 44, {seed: `${s}/dr${dx}d`, over: 0}) + line(dx - 12, dy + 10, dx + 12, dy + 10, {seed: `${s}/dr${dx}e`, over: 0});
  }
  const mansardInk = line(M.x0 - 6, M.base + 2, M.x0 + M.inset, M.top, {seed: `${s}/ml`, over: [2, 4]}) + line(M.x1 - M.inset, M.top, M.x1 + 6, M.base + 2, {seed: `${s}/mr`, over: [4, 2]}) + line(M.x0 + M.inset - 10, M.top, M.x1 - M.inset + 10, M.top, {seed: `${s}/mt`, over: [6, 6]}) + line(M.x0 + 14, M.base - 34, M.x1 - 14, M.base - 34, {seed: `${s}/mm`, over: 0});
  const A = RF.antenna;
  const antenna = line(A.x, A.base, A.x, A.top, {seed: `${s}/an`, over: 0}) + line(A.x - 34, A.top + 14, A.x + 30, A.top + 14, {seed: `${s}/an1`, over: [2, 2]}) + line(A.x - 26, A.top + 34, A.x + 24, A.top + 34, {seed: `${s}/an2`, over: [2, 2]}) + line(A.x - 18, A.top + 52, A.x + 16, A.top + 52, {seed: `${s}/an3`, over: [2, 2]}) + line(A.x, A.top + 60, A.x + 42, A.base, {seed: `${s}/an4`, over: 0});
  const T = RF.tank;
  const tank = rectPath(T.x - T.w / 2, T.y, T.w, T.h) + polyPath([[T.x - T.w / 2 - 4, T.y], [T.x, T.y - 16], [T.x + T.w / 2 + 4, T.y]]);
  const tankInk = line(T.x - T.w / 2 - 6, T.y + 1, T.x, T.y - 16, {seed: `${s}/tk1`, over: [2, 0]}) + line(T.x, T.y - 16, T.x + T.w / 2 + 6, T.y + 1, {seed: `${s}/tk2`, over: [0, 2]}) + line(T.x - T.w / 2, T.y, T.x - T.w / 2, T.y + T.h, {seed: `${s}/tk3`, over: 0}) + line(T.x + T.w / 2, T.y, T.x + T.w / 2, T.y + T.h, {seed: `${s}/tk4`, over: 0}) + line(T.x - T.w / 2 - 2, T.y + T.h, T.x + T.w / 2 + 2, T.y + T.h, {seed: `${s}/tk5`, over: [2, 2]}) + line(T.x - T.w / 2 + 6, T.y + T.h, T.x - T.w / 2 + 2, T.legs, {seed: `${s}/tk6`, over: 0}) + line(T.x + T.w / 2 - 6, T.y + T.h, T.x + T.w / 2 - 2, T.legs, {seed: `${s}/tk7`, over: 0}) + line(T.x - T.w / 2 + 4, T.y + T.h + 22, T.x + T.w / 2 - 4, T.legs - 6, {seed: `${s}/tk8`, over: 0}) + line(T.x - 12, T.y + 10, T.x - 12, T.y + T.h - 6, {seed: `${s}/tk9`, over: 0});
  // rooftop plants along siteR's roof (scalloped shrubs) + two balconies (slab overshooting, a glass rail)
  const plants = crown(800, 684, 26, 18, {seed: `${s}/pl1`, bumps: 6}) + crown(846, 688, 20, 14, {seed: `${s}/pl2`, bumps: 5}) + crown(890, 686, 24, 16, {seed: `${s}/pl3`, bumps: 6});
  const R = OLD_QUARTER.sites.R;
  let balcSlab = '';
  let balcRail = '';
  let balcInk = '';
  for (const by of RF.balconies) {
    const bx0 = 952;
    const bx1 = R.x + R.w + 26;
    balcSlab += rectPath(bx0 - 14, by, bx1 - bx0 + 14, 9);
    balcRail += rectPath(bx0 - 8, by - 34, bx1 - bx0 + 2, 34);
    balcInk += line(bx0 - 22, by, bx1 + 10, by, {seed: `${s}/bs${by}`, over: [6, 10]}) + line(bx0 - 18, by + 9, bx1 + 6, by + 9, {seed: `${s}/bs2${by}`, over: [4, 8]}) + line(bx0 - 8, by - 34, bx1, by - 34, {seed: `${s}/br${by}`, over: [3, 6]});
    for (let x = bx0 + 14; x < bx1; x += 26) balcInk += line(x, by - 32, x, by - 2, {seed: `${s}/bv${by}/${x}`, over: 0});
  }
  return {secondDoors, secondDoorInk, street: streetGap, second, secondInk, secondWin, secondWinGap, gapBuildings, far, kerb, walk, streetMarks: street, stoops, stoopInk, treeCrown, treeTicks, trunk, trunkInk, pit, mansard, dormers, dormerGlass, dormerInk, mansardInk, antenna, tank, tankInk, plants, balcSlab, balcRail, balcInk};
})();

/** A host's own patch on an old door: a small sage tag tied to the handle (static; fill + hair ink). (x, y) = the knot;
 *  `k` scales it about the knot (v3: OLD_QUARTER.caretakerScale, 9 -> 14 px wide, >= 12 px on screen in S10). */
const CaretakerTag: React.FC<{x: number; y: number; k?: number; seed: string}> = ({x, y, k = 1, seed}) => (
  <XG m={mat.about(mat.scale(k), x, y)}>
    <Fill d={polyPath([[x - 4, y + 3], [x + 4, y + 2], [x + 4.5, y + 12], [x - 4.5, y + 12.5]])} color={palette.sage} offset={false} seed={`${seed}/f`} />
    <Ink d={`M${x} ${y - 1}L${x} ${y + 2.5}M${x - 4} ${y + 3}L${x + 4} ${y + 2}L${x + 4.5} ${y + 12}L${x - 4.5} ${y + 12.5}Z`} width={1.1 / Math.max(1, k * 0.8)} taper={false} vary={0} seed={`${seed}/i`} />
  </XG>
);

export type OldQuarterProps = {
  sun?: React.ReactNode;
  /** The three sites pop up (pop-up book) [L, M, R]. Omit = standing. */
  sitePopAt?: [number?, number?, number?];
  /** Hanging plaque signs swing out (all three, 0.06 s apart). */
  plaqueSwingAt?: number;
  /** siteM's plaque ages: flip to old, cobweb, dust, cane (props ElephantPlaque events). Omit flipOldAt = already old. */
  oldPlaque?: {flipOldAt?: number; cobwebAt?: number; dustAt?: number; caneAt?: number};
  /** Second row plaques blink (every third is old). */
  secondPlaques?: boolean;
  /** Storyboard v3: which second-row plaques are OLD (9 booleans, left to right) or 'half' (5 of 9, alternating:
   *  OLD_QUARTER.secondOldHalf). Default: every third (review 5). */
  secondOld?: boolean[] | 'half';
  /** The old second-row plaques paper-flip from new to old (one time = 0.04 s apart over the old ones, left to right,
   *  each with a dust puff +0.1 s; or one time per plaque). Omit = old from the start. */
  secondOldAt?: number | number[];
  /** A host's own patch: one OLD second-row door (the one in the street gap) carries a small sage tag tied to its handle
   *  (a static pauser detail). Default true with secondOld="half". */
  caretakerTag?: boolean;
  /** v3: the plaques of the second-row buildings that show in the street gap, drawn at this size (world px) on their
   *  gap wall at OLD_QUARTER.gapPlaqueY (readable: with 'half' one current + one OLD plate), their support tags and
   *  flips with them. Default 20 when `secondOld` is given, else false (review 5: every plaque size 10 at the eye line). */
  gapPlaque?: number | false;
  /** The makers' sage support tags (props SupportTag) land on the hanging plaques L / M / R (OLD_QUARTER.support), and
   *  `second` = tiny tags pop onto the CURRENT second-row plaques in a wave (0.04 s apart) that skips the old ones. */
  supportAt?: {L?: number; M?: number; R?: number; second?: number};
  /** Slot: the A-frame notice sign (OLD_QUARTER.noticeSign box), e.g. (box) => <LabelTag kind="sign" box={box} .../>. */
  noticeSign?: React.ReactNode | ((box: [number, number, number, number]) => React.ReactNode);
  /** Slot: the makers' cart (props MakersCart) on the stoop line OLD_QUARTER.cartY, drawn behind the sign and the
   *  bollard (in front of the sites and the walkers). */
  cart?: React.ReactNode;
  /** S13: the noticeboard (RailBoard props) and the edge audience. */
  board?: {riseAt?: number; railLightAt?: number; pane1?: (r: PaneRect) => React.ReactNode; pane2?: (r: PaneRect) => React.ReactNode; paneDarkAt?: number; pane2ScaleInAt?: number; outAt?: number} | false;
  audience?: boolean | {riseAt?: number};
  bollard?: boolean;
  band?: boolean;
  /** Foreground framing in the bottom band (ground.tsx presets). Default: 'railing' (a low iron railing cut by the
   *  left edge, ending in a post at x 700); none while the S13 audience is on. false = none. */
  foreground?: ForegroundSpec;
  /** Per-site SiteFacade overrides (chromeAt, offAt, lit...). */
  site?: Partial<Record<SiteId, Partial<SiteFacadeProps>>>;
  /** Back-view walkers on OLD_QUARTER.walkers (life.tsx). Default on while the S13 audience is off; false = nobody;
   *  'gap' = only the street-gap walker (S10; = {n: 1}). */
  people?: PeopleSpec | 'gap';
  /** Street furniture (default OLD_QUARTER.furniture); false = none; 'bike' = the bike only (S10). */
  furniture?: FurnitureItem[] | false | 'bike';
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  /** Un-build just this set from here (s), over outDur (default 0.5). */
  outAt?: number;
  outDur?: number;
  seed?: string;
};

export const OldQuarter: React.FC<OldQuarterProps> = ({sun, sitePopAt = [], plaqueSwingAt, oldPlaque = {}, secondPlaques = true, secondOld, secondOldAt, caretakerTag, gapPlaque: gapPlaqueIn, supportAt = {}, noticeSign, cart, board = false, audience = false, bollard = true, band = true, foreground, site = {}, people: peopleIn, furniture: furnitureIn = OLD_QUARTER.furniture, wrap = noWrap, x = 0, y = 0, scale = 1, outAt, outDur, seed = 'oq'}) => {
  const t = useTime();
  const S = OLD_QUARTER.sites;
  const people: PeopleSpec | undefined = peopleIn === 'gap' ? {n: 1} : peopleIn;
  const furniture: FurnitureItem[] | false = furnitureIn === 'bike' ? OLD_QUARTER.furniture.filter((f) => f.kind === 'bike') : furnitureIn;
  // v3 second-row plaques: the old mask, the flip times (over the old ones, left to right), the support-tag wave (over the
  // current ones), the caretaker's tag on the old door in the street gap
  const oldMask = secondOld === 'half' ? OLD_QUARTER.secondOldHalf : secondOld;
  const isOld = (i: number) => (oldMask ? !!oldMask[i] : G.second[i].plaque === 'old');
  const oldIdx = G.second.map((_, i) => i).filter(isOld);
  const curIdx = G.second.map((_, i) => i).filter((i) => !isOld(i));
  const flipAt = (i: number) => (secondOldAt === undefined ? undefined : Array.isArray(secondOldAt) ? secondOldAt[oldIdx.indexOf(i)] : secondOldAt + oldIdx.indexOf(i) * 0.04);
  const gapDoor = G.second.findIndex((b, i) => isOld(i) && b.x + b.w * 0.12 + 7 > OLD_QUARTER.gap[0] && b.x + b.w * 0.12 + 7 < OLD_QUARTER.gap[1]);
  const showCaretaker = (caretakerTag ?? secondOld === 'half') && gapDoor >= 0;
  const gapPlaque = gapPlaqueIn ?? (secondOld !== undefined ? 20 : false);
  const gapOf = (i: number) => (gapPlaque === false ? undefined : G.gapBuildings.find((g) => g.i === i));
  // a plaque's spot + size: the gap buildings' readable plates on their gap wall, the rest at the eye line (size 10)
  const plaqueSpot = (i: number) => {
    const gb = gapOf(i);
    const b = G.second[i];
    return gb ? {x: gb.cx, y: OLD_QUARTER.gapPlaqueY, size: gapPlaque as number} : {x: b.x + b.w * 0.5, y: OLD_QUARTER.eye - 20, size: 10};
  };
  const far = (
    <>
      {band ? <Fill rect={[600, OLD_QUARTER.band[0], 200, OLD_QUARTER.band[1] - OLD_QUARTER.band[0] + 2]} color={palette.peach} offset={false} mode="snap" seed={`${seed}/band`} /> : null}
      <Fill d={G.far} color={palette.sand} offset={false} mode="snap" seed={`${seed}/far`} />
    </>
  );
  const second = (
    <>
      {G.second.map((b, i) => (
        <Fill key={i} rect={[b.x, b.top, b.w, OLD_QUARTER.eye - b.top]} color={b.c} seed={`${seed}/s2${i}`} />
      ))}
      <Fill d={gapPlaque === false ? G.secondWin : G.secondWinGap} color={palette.sage} offset={false} seed={`${seed}/s2w`} />
      <Fill d={G.secondDoors} color={palette.teal} offset={false} seed={`${seed}/s2d`} />
      <Ink d={G.secondInk} width={SI.far} taper={false} seed={`${seed}/s2i`} />
      <Ink d={G.secondDoorInk} width={SI.hair} taper={false} seed={`${seed}/s2di`} />
      {secondPlaques
        ? G.second.map((_b, i) => {
            const old = isOld(i);
            const fa = old ? flipAt(i) : undefined;
            // a flipping plaque starts new and paper-flips old at fa (props ElephantPlaque flipOldAt), with a dust puff
            const sp = plaqueSpot(i);
            return <PlaqueSlot key={`p${i}`} x={sp.x} y={sp.y} size={sp.size} variant={old && fa === undefined ? 'old' : 'new'} width={sp.size > 10 ? SI.far : SI.hair} extra={fa !== undefined ? {flipOldAt: fa, dustAt: fa + 0.1} : undefined} seed={`${seed}/s2p${i}`} />;
          })
        : null}
      {secondPlaques && supportAt.second !== undefined
        ? curIdx.map((i, n) => {
            // hung over the plate's upper-right corner, scaled with it (size 9 on a 10 px plate)
            const sp = plaqueSpot(i);
            const k = sp.size / 10;
            return <SupportTagSlot key={`st${i}`} x={sp.x + 3 * k} y={sp.y + 4 * k} size={9 * k} at={(supportAt.second as number) + n * 0.04} seed={`${seed}/s2t${i}`} />;
          })
        : null}
      {showCaretaker ? (
        gapPlaque === false ? (
          <CaretakerTag x={G.second[gapDoor].x + G.second[gapDoor].w * 0.12 + 11} y={OLD_QUARTER.eye - 16} seed={`${seed}/ctag`} />
        ) : (
          // v3: readable (OLD_QUARTER.caretakerScale), knotted higher on the handle so it hangs inside the door's height
          <CaretakerTag x={G.second[gapDoor].x + G.second[gapDoor].w * 0.12 + 11} y={OLD_QUARTER.eye - 24} k={OLD_QUARTER.caretakerScale} seed={`${seed}/ctag`} />
        )
      ) : null}
    </>
  );
  const ground = (
    <>
      <Fill rect={[-160, OLD_QUARTER.base, 1400, 800]} color={palette.mintPale} offset={false} seed={`${seed}/pave`} />
      <Fill d={G.street} color={palette.cream} offset={false} seed={`${seed}/gap`} />
      <Fill rect={[-160, OLD_QUARTER.kerb, 1400, 22]} color={palette.sand} offset={false} seed={`${seed}/kerbF`} />
      <Ink d={G.kerb} width={SI.front} seed={`${seed}/kerb`} />
      <GroundMarks marks={G.walk} width={SI.far} seed={`${seed}/gw`} />
      <GroundMarks marks={G.streetMarks} width={SI.far} seed={`${seed}/gs`} />
    </>
  );
  const roofNode = (id: SiteId) =>
    id === 'L' ? (
      <>
        <Fill d={G.mansard} color={palette.teal} seed={`${seed}/mans`} />
        <Fill d={G.dormers} color={palette.sand} seed={`${seed}/dorm`} />
        <Fill d={G.dormerGlass} color={palette.tealDark} offset={false} seed={`${seed}/dormg`} />
        <Ink d={G.mansardInk + G.dormerInk} width={SI.mid} seed={`${seed}/mansi`} />
      </>
    ) : id === 'M' ? (
      <Ink d={G.antenna} width={SI.far} taper={false} seed={`${seed}/ant`} />
    ) : (
      <>
        <Fill d={G.tank} color={palette.tan} seed={`${seed}/tank`} />
        <Ink d={G.tankInk} width={SI.far} taper={false} seed={`${seed}/tanki`} />
        <Fill d={G.plants} color={palette.sage} seed={`${seed}/plants`} />
        <Ink d={G.plants} width={SI.far} open={0.15} seed={`${seed}/plantsi`} />
      </>
    );
  const balconies = (
    <>
      <Fill d={G.balcRail} color={palette.sage} seed={`${seed}/brail`} />
      <Fill d={G.balcSlab} color={palette.cream} offset={false} seed={`${seed}/bslab`} />
      <Ink d={G.balcInk} width={SI.far} taper={false} seed={`${seed}/balci`} />
    </>
  );
  const siteNode = (id: SiteId, i: number) => {
    const c = S[id];
    const node = (
      <>
        {roofNode(id)}
        <SiteFacade x={c.x} y={OLD_QUARTER.base} w={c.w} storeys={c.storeys} storeyH={(OLD_QUARTER.base - c.top) / c.storeys} fill={c.fill} roof="cornice" browser={c.browser} door={c.door} plaque={false} lock="closed" cols={c.w > 300 ? 3 : 2} seed={`${seed}/site${id}`} {...site[id]} />
        {id === 'R' ? balconies : null}
        <Fill d={G.stoops[i]} color={palette.sand} seed={`${seed}/stoop${id}`} />
      </>
    );
    return (
      <PopUp key={id} at={sitePopAt[i]} x={c.x + c.w / 2} y={OLD_QUARTER.base + 24}>
        {node}
      </PopUp>
    );
  };
  const sites = (
    <>
      {siteNode('M', 1)}
      {siteNode('L', 0)}
      {siteNode('R', 2)}
      <Ink d={G.stoopInk} width={SI.mid} taper={false} seed={`${seed}/stoopI`} />
      {(['L', 'M', 'R'] as SiteId[]).map((id, i) => {
        const sg = S[id].sign;
        const popped = sitePopAt[i] === undefined || t >= (sitePopAt[i] as number);
        if (!popped) return null;
        const swing = plaqueSwingAt !== undefined ? plaqueSwingAt + i * 0.06 : undefined;
        if (id === 'M')
          return <HangingPlaqueSlot key={id} x={sg.x} y={sg.y} size={120} wallX={sg.wallX} variant={oldPlaque.flipOldAt === undefined ? 'old' : 'new'} swingAt={swing} flipOldAt={oldPlaque.flipOldAt} cobwebAt={oldPlaque.cobwebAt} dustAt={oldPlaque.dustAt} caneAt={oldPlaque.caneAt} seed={`${seed}/plq${id}`} />;
        return <HangingPlaqueSlot key={id} x={sg.x} y={sg.y} size={112} wallX={sg.wallX} swingAt={swing} seed={`${seed}/plq${id}`} />;
      })}
      {(['L', 'M', 'R'] as SiteId[]).map((id) => {
        const at = supportAt[id];
        if (at === undefined) return null;
        const p = OLD_QUARTER.support[id];
        return <SupportTagSlot key={`sup${id}`} x={p[0]} y={p[1]} size={OLD_QUARTER.support.size} at={at} seed={`${seed}/sup${id}`} />;
      })}
    </>
  );
  const sway = osc(t, 0.3, 2.1) * 0.5;
  const near = (
    <>
      <Fill d={G.pit} color={palette.tan} offset={false} seed={`${seed}/pit`} />
      <XG m={mat.about(mat.rotate(sway), 1034, 1464)}>
        <Fill d={G.trunk} color={palette.brown} seed={`${seed}/trunk`} />
        <Ink d={G.trunkInk} width={SI.front} taper={false} />
        <Fill d={G.treeCrown} color={palette.sage} seed={`${seed}/crown`} />
        <Ink d={G.treeCrown} width={SI.front} open={0.12} seed={`${seed}/crowni`} />
        <Ink d={G.treeTicks} width={SI.mid} taper={false} />
      </XG>
      {bollard ? <BollardSlot x={OLD_QUARTER.bollard.x} y={OLD_QUARTER.bollard.y} w={OLD_QUARTER.bollard.w} h={OLD_QUARTER.bollard.h} seed={`${seed}/bollard`} /> : null}
    </>
  );
  const B = OLD_QUARTER.board;
  const boardNode = board === false ? null : <NoticeboardSlot x={B.frame[0]} y={B.frame[1]} w={B.frame[2]} h={B.frame[3]} legsY={B.legsY} rail={B.rail} seed={`${seed}/board`} {...board} />;
  const aud =
    audience === false
      ? null
      : OLD_QUARTER.audience.map((a, i) => <OnlookerSlot key={i} x={a.head[0]} y={a.head[1]} head={84} hair={a.hair} body={a.body} acc={a.acc} riseAt={typeof audience === 'object' && audience.riseAt !== undefined ? audience.riseAt + i * 0.06 : undefined} rim={i < 2 ? 'left' : 'right'} seed={`${seed}/aud${i}`} />);
  return (
    <SetPlace x={x} y={y} scale={scale} outAt={outAt} outDur={outDur}>
      {wrap('far', 0.05, far)}
      {sun ? wrap('sun', 0.1, sun) : null}
      {wrap('second', 0.3, second)}
      {wrap('ground', 0.6, ground)}
      {wrap('sites', 0.6, sites)}
      {wrap('board', 0.8, boardNode)}
      {/* people FARTHER than the cart line (the gap walker, feet 1262 and up the gap): behind the cart */}
      {wrap('peopleFar', 0.75, <People anchors={OLD_QUARTER.walkers} vp={OLD_QUARTER.vp} spec={people} def={audience === false} split={{y: OLD_QUARTER.cartY, side: 'far'}} seed={`${seed}/ppl`} />)}
      {/* the cart on the stoop line (y 1330): in front of the sites and the gap walker, behind nearer walkers, the sign
          and the bollard */}
      {cart ? wrap('cart', 0.8, cart) : null}
      {wrap(
        'people',
        0.85,
        <>
          <Furniture items={audience === false ? furniture : false} seed={`${seed}/furn`} />
          <People anchors={OLD_QUARTER.walkers} vp={OLD_QUARTER.vp} spec={people} def={audience === false} split={{y: OLD_QUARTER.cartY, side: 'near'}} seed={`${seed}/ppl`} />
        </>,
      )}
      {noticeSign ? wrap('sign', 0.9, typeof noticeSign === 'function' ? noticeSign(OLD_QUARTER.noticeSign) : noticeSign) : null}
      {wrap('near', 1.0, near)}
      {wrap('audience', 1.0, aud)}
      {wrap('foreground', 1.0, <Foreground spec={foreground === undefined ? (audience === false ? 'railing' : false) : foreground} seed={`${seed}/fg`} />)}
    </SetPlace>
  );
};
