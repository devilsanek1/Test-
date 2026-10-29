// StoopStreet — S2 (S03 two steps, S04 fourteen years, S09 night / dawn, S10 Part A). Canvas coords at S03 rest.
//
// One-point street, VP (720, 1060) right of centre. Frontal hero townhouse on the left (40,640,480,590): browser window
// (170,760,220,140), door #4 (230,1030,120,200), lock4 (330,1130) 34x42, plaque4 (175,1105) 50, calendar slot
// (385,1040,70,80), and the two-step STOOP (exported on its own: <Stoop/>). Rows of website houses recede on both sides
// (10+ doors per side: stoop, plaque, lock, browser dots), far towers beyond the VP (fill-only), 3 street trees + a near
// tree with season palettes, a lamp post cropped at the left edge with a telephone wire and 2 pigeons, pavement, kerb,
// bollard; the pavement is one flat field with a few broken paving lines + specks; the default foreground is a near kerb
// (two bollards, a drain grate) + a back-view figure cropped by the left edge INSIDE the visible band (ground.tsx); the
// people layer (STOOP.walkers) and street furniture (a planter, a bike) give the street life (life.tsx). Time of day: 'day' | 'morning' | 'night' (teal sky is the
// World's; this set adds 8 cream stars, peach lit windows, tealDark far towers with peach dots, lamp heads with OPAQUE
// stepped glow discs, 2 extra lamps; facades KEEP their day fills while the ground plane, road, sidewalk and kerb take
// the night mapping: mintPale -> sage, cream -> sand, sand -> tan) | 'dawn' (a flat peach horizon band).
// The storyboard beats on the stoop (riser glyphs, tower, check, peach riser, ledge) are the <StoopBeats/> overlay,
// passed in `heroSlot` so it sits in the hero layer.
//
//   <StoopStreet tod="day" stoop={{step1At: 1.9, step2At: 2.3}} heroSlot={<StoopBeats magnifierAt={2.4} wrenchAt={3.1} />} />
//   <StoopStreet tod="night" nightUntil={1.6} heroSlot={<StoopBeats checkAt={2.6} peachAt={2.68} ledgeAt={3.2} />} />
//   stoopStreetDoors()  // [{id: '#4', overDoor, lock, plaque, h, side, i}, ...] near -> far, for ripples / "?" / tags
//
// Use the World sky with a plain colour key at night (NOT tod: 'night'), so the facades keep their day fills.

import React from 'react';
import {palette, skies} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {crown, crownTicks, line, polyPath, rect, rectPath, wire, wirePoint, Pt} from '../../../lib/sketch';
import {wallQuad} from '../../../lib/persp';
import {useTod} from '../../../lib/tod';
import {mat, XG} from '../../../lib/xf';
import {Bird, Tree} from '../../../lib/kit';
import {brickHints, cornice, GlowDiscs, HALF, LayerWrap, NightGround, noWrap, paneFill, SetPlace, SetTod, SI, windowInk} from './common';
import {Foreground, ForegroundSpec, groundMarks, GroundMarks} from './ground';
import {BollardSlot, CalendarSlot, ChromeSlot, CheckSlot, LockProps, MagnifierSlot, PlaqueSlot, WrenchSlot} from './propSlots';
import {Lock} from '../props';
import {FacadeDoor} from './SiteFacade';
import {perspRowLayout, PerspRow, RowHouse} from './rows';
import {Furniture, FurnitureItem, People, PeopleSpec, WalkerAnchor} from './life';

// ---------------------------------------------------------------- layout

export const STOOP = {
  vp: [720, 1060] as Pt,
  hero: {x: 40, y: 640, w: 480, h: 590},
  browser: [170, 760, 220, 140] as [number, number, number, number],
  door4: [230, 1030, 120, 200] as [number, number, number, number],
  lock4: {x: 330, y: 1130, w: 34, h: 42},
  plaque4: {x: 175, y: 1105, size: 50},
  calendar: [385, 1040, 70, 80] as [number, number, number, number],
  /** step 2 (upper) and step 1 (lower) risers. */
  step2: [190, 1230, 220, 70] as [number, number, number, number],
  step1: [160, 1300, 280, 70] as [number, number, number, number],
  magnifier: {x: 300, y: 1335, r: 28},
  wrench: {x: 300, y: 1265, w: 56},
  /** step 1's left half becomes a 600 px brick tower (top y 700). */
  tower: {x: 160, w: 140, top: 700},
  /** step 2's tread stretches into a ledge to the vanishing point. */
  ledge: {from: [410, 1230] as Pt, to: [715, 1062] as Pt},
  lamp: {x: 24, top: 640, lantern: [40, 1000] as Pt},
  wire: {a: [40, 650] as Pt, b: [1080, 690] as Pt, sag: 25},
  pigeons: [[300, 692], [340, 695]] as Pt[],
  bollard: {x: 930, y: 1420, w: 40, h: 90},
  nearTree: {cx: 655, cy: 1040, rx: 70, ry: 84, base: 1380},
  streetTrees: [
    {x: 900, base: 1250, size: 46},
    {x: 820, base: 1176, size: 31},
    {x: 770, base: 1118, size: 20},
  ],
  nightLamps: [
    {x: 820, head: 980, base: 1178},
    {x: 700, head: 1020, base: 1090},
  ],
  towers: [
    [604, 44, 812],
    [664, 58, 760],
    [748, 46, 842],
    [818, 62, 866],
  ] as [number, number, number][],
  /** Pip's spots (S03): pavement, step 1 tread, step 2 tread. */
  pip: {pavement: [520, 1450] as Pt, step1: [380, 1300] as Pt, step2: [380, 1230] as Pt},
  pavementY: 1370,
  /** People layer anchors (life.tsx): two walkers heading up the road to the VP, one stander on the right sidewalk
   *  (heights from the eye-level camera: (feet - 1060) / 1.1). Never on the stoop (x 160-440) or door #4. */
  walkers: [
    {x: 792, y: 1240, h: 164, go: 'vp', body: palette.sand, hair: 'bun', acc: ['backpack']},
    {x: 888, y: 1338, h: 252, go: 'stand', body: palette.sage, hair: 'curly', acc: ['scarf']},
    {x: 742, y: 1150, h: 82, go: 'vp', body: palette.teal, hair: 'short'},
  ] as WalkerAnchor[],
  /** Street furniture (ink-led): a planter right of the stoop, a bike on the near pavement. */
  furniture: [
    {kind: 'planter', x: 482, y: 1394, s: 0.72},
    {kind: 'bike', x: 760, y: 1446, s: 1.05},
  ] as FurnitureItem[],
  // ---- storyboard v3 (S09 Part A)
  /** The crate slot on step 2's tread (bottom centre of the crate: the props LockCrate's ground point). */
  crate: [395, 1226] as Pt,
  /** tod="dusk": the houses whose windows are still lit at the cut (in `duskOffAt` order: they pop off one by one). */
  duskLit: [
    {side: 'left' as const, i: 2},
    {side: 'right' as const, i: 3},
    {side: 'right' as const, i: 1},
  ],
  /** Dawn rim strips (peach) on the facades' sun side (the sun rises at the VP): [0] = the hero house's right edge (hero
   *  layer), [1..4] = the far towers' VP-facing edges (STOOP.towers[0..3]; drawn in the FAR layer with the towers,
   *  clipped to their silhouettes, so a sun in the `sun` slot passes behind them and a scene sun drawn over the far layer
   *  covers them), all below world y 650 (screen >= 600 at the S09 camera). [x, y, w, h]. */
  dawnRims: [
    [512, 660, 8, 570],
    [640, 812, 6, 160],
    [716, 760, 6, 240],
    [748, 842, 6, 160],
    [818, 866, 6, 150],
  ] as [number, number, number, number][],
} as const;

const LEFT_ROW = {quad: wallQuad({vp: [720, 1060], x: 520, top: 660, bottom: 1370, depth: 0.905}), n: 16, H: 700, hw: 700 * 0.62, storeys: 4, side: 'left' as const, seed: 'stoopL', colors: [palette.cream, palette.sand, palette.mintPale, palette.tan]};
// right wall: roofline through (1080, 620), foot through (1080, 1400); near edge with bleed at x 1220
const R_TOP = 1060 - ((1060 - 620) / 360) * 500;
const R_BOT = 1060 + ((1400 - 1060) / 360) * 500;
const RIGHT_ROW = {quad: wallQuad({vp: [720, 1060], x: 1220, top: R_TOP, bottom: R_BOT, depth: 0.93}), n: 22, H: 700, hw: 700 * 0.62 * 0.42, storeys: 4, side: 'right' as const, seed: 'stoopR', colors: [palette.sand, palette.cream, palette.tan, palette.mintPale]};

export type StoopDoor = {id: string; side: 'hero' | 'left' | 'right'; i: number; overDoor: Pt; lock: {x: number; y: number; h: number}; plaque: {x: number; y: number; size: number}; h: number};

/** Every door, near -> far: '#4' (the hero), then the left row ('#5', '#6', ...) and the right row ('R1', ...). */
export function stoopStreetDoors(): StoopDoor[] {
  const L = perspRowLayout(LEFT_ROW);
  const R = perspRowLayout(RIGHT_ROW);
  const d4 = STOOP.door4;
  const out: StoopDoor[] = [{id: '#4', side: 'hero', i: 0, overDoor: [d4[0] + d4[2] / 2, d4[1] - 50], lock: {x: STOOP.lock4.x, y: STOOP.lock4.y, h: STOOP.lock4.h}, plaque: {...STOOP.plaque4}, h: 590}];
  const map = (side: 'left' | 'right', hs: RowHouse[], pre: string, start: number) => hs.map((h) => ({id: `${pre}${h.i + start}`, side, i: h.i, overDoor: h.overDoor, lock: h.lock, plaque: h.plaque, h: h.h}));
  return [...out, ...map('left', L.houses, '#', 5), ...map('right', R.houses, 'R', 1)].sort((a, b) => b.h - a.h);
}

// ---------------------------------------------------------------- geometry (module level)

const G = (() => {
  const s = 'stp';
  const {x, y, w, h} = STOOP.hero;
  const base = y + h; // 1230
  const wins: [number, number, number, number][] = [
    [70, 712, 62, 92],
    [70, 862, 62, 92],
    [70, 1012, 62, 92],
    [428, 712, 62, 92],
    [428, 862, 62, 92],
    [466, 1132, 36, 70],
  ];
  let winInk = '';
  let glass = '';
  wins.forEach((q, i) => {
    winInk += windowInk(q[0], q[1], q[2], q[3], `${s}/w${i}`, {mullion: q[2] > 40});
    glass += paneFill(q[0], q[1], q[2], q[3], `${s}/g${i}`);
  });
  const heroInk = cornice(x, x + w, y, 40, `${s}/c`, 30) + line(x, y + 40, x, base, {seed: `${s}/l`, over: [2, 8]}) + line(x + w, y + 40, x + w, base, {seed: `${s}/r`, over: [2, 8]}) + line(x - 10, base, x + w + 14, base, {seed: `${s}/b`, over: [6, 10]});
  const plinthInk = line(x, base, x, STOOP.pavementY, {seed: `${s}/pl`, over: [0, 4]}) + line(x + w, base, x + w, STOOP.pavementY, {seed: `${s}/pr`, over: [0, 4]});
  const bricks = brickHints(x + 20, y + 60, w - 40, h - 80, `${s}/bk`, 5, 26);
  // street ground
  const VP = STOOP.vp;
  const kerbR = (yy: number) => VP[0] + ((980 - VP[0]) * (yy - VP[1])) / (STOOP.pavementY - VP[1]);
  const footR = (yy: number) => VP[0] + ((1080 - VP[0]) * (yy - VP[1])) / (1400 - VP[1]);
  const road = polyPath([[VP[0] - 1, VP[1] + 1], [VP[0] + 2, VP[1] + 1], [980, STOOP.pavementY], [520, STOOP.pavementY]]);
  const pavR = polyPath([[VP[0] + 2, VP[1] + 1], [footR(1500), 1500], [1300, 1500], [1300, STOOP.pavementY], [980, STOOP.pavementY]]);
  const kerbInk = line(VP[0] + 2, VP[1] + 2, kerbR(1372), 1372, {seed: `${s}/kr`, over: [0, 0], breaks: false}) + line(-150, STOOP.pavementY, 1230, STOOP.pavementY, {seed: `${s}/kn`, over: [0, 0]}) + line(-150, STOOP.pavementY + 18, 1230, STOOP.pavementY + 20, {seed: `${s}/kn2`, over: [0, 0]});
  // the pavement: one flat field, a few broken paving lines that die toward the viewer, specks (no tile grid)
  const ground = groundMarks({vp: VP, top: STOOP.pavementY + 26, bottom: 1920, x0: -520, x1: 1640, rays: 4, cross: 2, specks: 16, reach: 0.58, seed: `${s}/gm`});
  // lamp post cropped at the left edge, lantern on an arm, telephone wire from its top
  const lp = STOOP.lamp;
  const lampFill = rectPath(lp.x - 12, lp.top, 24, 1400) + rectPath(lp.x, lp.lantern[1] - 46, 42, 6);
  const lampInk = line(lp.x - 12, 2000, lp.x - 12, lp.top, {seed: `${s}/lp1`, over: 0}) + line(lp.x + 12, 2000, lp.x + 12, lp.top + 4, {seed: `${s}/lp2`, over: 0}) + line(lp.x - 26, lp.top + 12, lp.x + 34, lp.top + 12, {seed: `${s}/lpb`, over: [4, 6]}) + line(lp.x + 12, lp.lantern[1] - 46, lp.lantern[0] + 26, lp.lantern[1] - 46, {seed: `${s}/arm`, over: [0, 4]});
  const lantern = polyPath([[lp.lantern[0] + 6, lp.lantern[1] - 40], [lp.lantern[0] + 42, lp.lantern[1] - 40], [lp.lantern[0] + 36, lp.lantern[1] + 6], [lp.lantern[0] + 12, lp.lantern[1] + 6]]);
  const wireD = wire(STOOP.wire.a[0], STOOP.wire.a[1], STOOP.wire.b[0] + 160, STOOP.wire.b[1] + 6, STOOP.wire.sag * 1.15, {seed: `${s}/wire`});
  // near tree
  const t = STOOP.nearTree;
  const treeCrown = crown(t.cx, t.cy, t.rx, t.ry, {seed: `${s}/tree`, bumps: 9});
  const treeTicks = crownTicks(t.cx, t.cy, t.rx, t.ry, {seed: `${s}/treet`, n: 4, size: 11});
  const trunk = rectPath(t.cx - 7, t.cy + t.ry * 0.6, 14, t.base - t.cy - t.ry * 0.6);
  const trunkInk = line(t.cx - 7, t.base, t.cx - 6, t.cy + t.ry * 0.5, {seed: `${s}/tt1`, over: 0}) + line(t.cx + 7, t.base, t.cx + 6, t.cy + t.ry * 0.6, {seed: `${s}/tt2`, over: 0}) + line(t.cx, t.cy + t.ry * 0.9, t.cx - t.rx * 0.3, t.cy + t.ry * 0.45, {seed: `${s}/br1`, over: 0}) + line(t.cx + 2, t.cy + t.ry * 1.0, t.cx + t.rx * 0.28, t.cy + t.ry * 0.62, {seed: `${s}/br2`, over: 0});
  const bare = line(t.cx, t.cy + t.ry * 0.6, t.cx - t.rx * 0.5, t.cy - t.ry * 0.3, {seed: `${s}/b1`, over: 0}) + line(t.cx, t.cy + t.ry * 0.5, t.cx + t.rx * 0.45, t.cy - t.ry * 0.5, {seed: `${s}/b2`, over: 0}) + line(t.cx, t.cy + t.ry * 0.3, t.cx + 4, t.cy - t.ry * 0.8, {seed: `${s}/b3`, over: 0}) + line(t.cx - t.rx * 0.25, t.cy, t.cx - t.rx * 0.6, t.cy - t.ry * 0.1, {seed: `${s}/b4`, over: 0});
  // far towers (fill-only, the far city beyond the VP): stepped roof silhouettes on the day haze ladder (the farther
  // pair #98C0AE, the nearer pair #84B09C: both step TOWARD the sky), a few >= 3 px window dots; at night the same
  // silhouettes in tealDark with peach dots
  let towers = '';
  let towersFar = '';
  let towerDots = '';
  let towerDayDots = '';
  STOOP.towers.forEach(([tx, tw, top], i) => {
    // stepped roof: a set-back top storey + a short mast / tank on two of them
    const setback = tw * 0.22;
    const d = rectPath(tx, top + 22, tw, VP[1] + 4 - top - 22) + rectPath(tx + setback, top, tw - setback * 2, 24) + (i % 2 ? rectPath(tx + tw * 0.46, top - 26, 4, 28) : rectPath(tx + tw * 0.2, top - 12, tw * 0.28, 14));
    if (i === 0 || i === 2) towersFar += d;
    else towers += d;
    for (let yy = top + 34; yy < VP[1] - 8; yy += 15) for (let xx = tx + 6; xx < tx + tw - 6; xx += 11) if ((xx * 7 + yy * 3) % 5 < 2) towerDots += rectPath(xx, yy, 4, 6);
    for (let yy = top + 36; yy < VP[1] - 20; yy += 22) for (let xx = tx + 7; xx < tx + tw - 7; xx += 12) if ((xx * 5 + yy * 7) % 9 < 2) towerDayDots += rectPath(xx, yy, 3.5, 4.5);
  });
  // dawn rims of the far towers (STOOP.dawnRims[1..4] <-> STOOP.towers[0..3]) clipped to each tower's silhouette (body
  // + set-back top storey): no peach where a rim rect sticks out into the sky beside the top storey
  const isect = (a: number[], b: number[]) => {
    const x0 = Math.max(a[0], b[0]);
    const y0 = Math.max(a[1], b[1]);
    const x1 = Math.min(a[0] + a[2], b[0] + b[2]);
    const y1 = Math.min(a[1] + a[3], b[1] + b[3]);
    return x1 > x0 && y1 > y0 ? rectPath(x0, y0, x1 - x0, y1 - y0) : '';
  };
  const towerRims = STOOP.towers.map(([tx, tw, top], i) => {
    const rim = STOOP.dawnRims[i + 1];
    if (!rim) return '';
    const setback = tw * 0.22;
    return isect(rim, [tx, top + 22, tw, VP[1] + 4 - top - 22]) + isect(rim, [tx + setback, top, tw - setback * 2, 24]);
  });
  return {wins, winInk, glass, heroInk, plinthInk, bricks, road, pavR, kerbInk, ground, lampFill, lampInk, lantern, wireD, treeCrown, treeTicks, trunk, trunkInk, bare, towers, towersFar, towerDots, towerDayDots, towerRims};
})();

/** The day haze ladder for the far towers (style_bible_ref2 8): nearer #84B09C, farther #98C0AE. */
const TOWER_HAZE = ['#84B09C', '#98C0AE'] as const;

const STARS: Pt[] = [
  [96, 120],
  [262, 214],
  [470, 96],
  [690, 190],
  [905, 132],
  [1010, 236],
  [160, 640],
  [960, 610],
];

// ---------------------------------------------------------------- the stoop (exported part)

export type StoopProps = {
  /** Steps pop up (scaleY from their base, 6 % overshoot). Omit = there. */
  step1At?: number;
  step2At?: number;
  /** Draw-on (fill-first, then ink). */
  drawAt?: number;
  seed?: string;
};

/** Tower height (px above step 1's top) at time t: 0 -> 600 (+2 %) -> back to 0 (0.24 s drop). Never negative: the
 *  tower is an overlay on step 1's left half (StoopBeats). */
export function towerRise(t: number, at?: number, downAt?: number): number {
  const full = STOOP.step1[1] - STOOP.tower.top; // 600
  let k = 0;
  if (at !== undefined && t >= at) {
    const p = prog(t, at, 0.36, E.outCubic);
    k = p < 1 ? p * 1.02 : 1.02 - 0.02 * prog(t, at + 0.36, 0.14, E.inOutSine);
  }
  if (downAt !== undefined && t >= downAt) k = lerp(1, 0, prog(t, downAt, 0.24, E.inQuad));
  return Math.max(0, k) * full;
}

const TREAD = 9;

/** The two-step stoop in front of door #4 (a LOCATION: steps only; the S03-S09 beats are <StoopBeats/>). */
export const Stoop: React.FC<StoopProps> = ({step1At, step2At, drawAt, seed = 'stoop'}) => {
  const t = useTime();
  const [s2x, s2y, s2w, s2h] = STOOP.step2;
  const [s1x, s1y, s1w, s1h] = STOOP.step1;
  const k2 = popUpK(t, step2At);
  const k1 = popUpK(t, step1At);
  const ia = drawAt !== undefined ? drawAt + 0.1 : undefined;
  const out: React.ReactNode[] = [];
  if (k2 > 0) {
    const g = (
      <>
        <Fill d={polyPath([[s2x - 6, s2y - TREAD], [s2x + s2w + 6, s2y - TREAD], [s2x + s2w, s2y], [s2x, s2y]])} color={palette.sand} at={drawAt} mode="snap" seed={`${seed}/t2`} />
        <Fill rect={[s2x, s2y, s2w, s2h]} color={palette.cream} at={drawAt} mode="snap" seed={`${seed}/r2`} />
        <Ink d={line(s2x - 8, s2y - TREAD, s2x + s2w + 8, s2y - TREAD, {seed: `${seed}/i2a`, over: [3, 6]}) + line(s2x - 2, s2y, s2x + s2w + 4, s2y, {seed: `${seed}/i2b`, over: [2, 4]}) + line(s2x, s2y, s2x, s2y + s2h, {seed: `${seed}/i2c`, over: [0, 0]}) + line(s2x + s2w, s2y, s2x + s2w, s2y + s2h, {seed: `${seed}/i2d`, over: [0, 0]})} width={SI.mid} at={ia} />
      </>
    );
    out.push(<React.Fragment key="s2">{k2 < 1 ? <XG m={mat.about(mat.scale(1, k2), s2x + s2w / 2, s1y)}>{g}</XG> : g}</React.Fragment>);
  }
  if (k1 > 0) {
    const g = (
      <>
        <Fill d={polyPath([[s1x - 6, s1y - TREAD], [s1x + s1w + 6, s1y - TREAD], [s1x + s1w, s1y], [s1x, s1y]])} color={palette.sand} at={drawAt} mode="snap" seed={`${seed}/t1`} />
        <Fill rect={[s1x, s1y, s1w, s1h]} color={palette.cream} at={drawAt} mode="snap" seed={`${seed}/r1`} />
        <Ink
          d={
            line(s1x - 8, s1y - TREAD, s1x + s1w + 8, s1y - TREAD, {seed: `${seed}/i1a`, over: [3, 6]}) +
            line(s1x - 2, s1y, s1x + s1w + 4, s1y, {seed: `${seed}/i1d`, over: [2, 4]}) +
            line(s1x, s1y, s1x, s1y + s1h, {seed: `${seed}/i1e`, over: [0, 0]}) +
            line(s1x + s1w, s1y, s1x + s1w, s1y + s1h, {seed: `${seed}/i1g`, over: [0, 0]})
          }
          width={SI.mid}
          at={ia}
        />
      </>
    );
    out.push(<React.Fragment key="s1">{k1 < 1 ? <XG m={mat.about(mat.scale(1, k1), s1x + s1w / 2, s1y + s1h)}>{g}</XG> : g}</React.Fragment>);
  }
  return <>{out}</>;
};

export type StoopBeatsProps = {
  /** Step 1's LEFT half shoots up into a 600 px brick tower (2 % overshoot) / drops back down. */
  towerAt?: number;
  towerDownAt?: number;
  /** Riser glyphs ink on (magnifier on step 1 = find, wrench on step 2 = fix). Omit = absent; -1 = there. */
  magnifierAt?: number;
  wrenchAt?: number;
  /** The magnifier rides up on the tower face (redrawn at 34 px). Default true. */
  magnifierRide?: boolean;
  /** Check mark over step 1's magnifier (0.17 s). */
  checkAt?: number;
  /** Step 2's riser turns peach. */
  peachAt?: number;
  /** Step 2's tread stretches into a ledge to the vanishing point over ledgeDur. */
  ledgeAt?: number;
  ledgeDur?: number;
  seed?: string;
};

/** The storyboard's stoop BEATS as an overlay that reads the STOOP anchors (S03 riser glyphs, S04 tower, S09 check / peach
 *  riser / ledge). Pass it to <StoopStreet heroSlot={...}/> so it sits in the hero layer (under the near tree). */
export const StoopBeats: React.FC<StoopBeatsProps> = ({towerAt, towerDownAt, magnifierAt, wrenchAt, magnifierRide = true, checkAt, peachAt, ledgeAt, ledgeDur = 0.45, seed = 'stoopBeats'}) => {
  const t = useTime();
  const [s2x, s2y, s2w, s2h] = STOOP.step2;
  const [s1x, s1y, , s1h] = STOOP.step1;
  const rise = towerRise(t, towerAt, towerDownAt);
  const out: React.ReactNode[] = [];
  if (peachAt !== undefined && t >= peachAt) out.push(<Fill key="peach" rect={[s2x + 2, s2y + 2, s2w - 4, s2h - 3]} color={palette.peach} offset={false} mode="snap" seed={`${seed}/peach`} />);
  // the ledge: step 2's tread stretched to the VP (the far end slides along the tread line), riser in perspective
  const lp = ledgeAt === undefined ? 0 : E.outCubic(prog(t, ledgeAt, ledgeDur));
  if (lp > 0) {
    const L0 = STOOP.ledge.from;
    const L1 = STOOP.ledge.to;
    const lx = lerp(L0[0], L1[0], lp);
    const ly = lerp(L0[1], L1[1], lp);
    const riserH = (yy: number) => s2h * ((yy - STOOP.vp[1]) / (L0[1] - STOOP.vp[1]));
    const ry0 = riserH(L0[1]);
    const ry1 = riserH(ly);
    out.push(<Fill key="lr" d={polyPath([[s2x + s2w - 2, L0[1]], [lx, ly], [lx, ly + ry1], [s2x + s2w - 2, L0[1] + ry0]])} color={palette.cream} offset={false} seed={`${seed}/lr`} />);
    out.push(<Fill key="lt" d={polyPath([[s2x + s2w, L0[1] - TREAD], [lx + 2, ly - TREAD * (ry1 / ry0)], [lx, ly], [s2x + s2w, L0[1]]])} color={palette.sand} offset={false} seed={`${seed}/lt`} />);
    out.push(<Ink key="li" d={`M${L0[0]} ${L0[1] - TREAD}L${lx.toFixed(1)} ${(ly - TREAD * (ry1 / ry0)).toFixed(1)}M${L0[0]} ${L0[1]}L${lx.toFixed(1)} ${ly.toFixed(1)}M${L0[0]} ${L0[1] + ry0}L${lx.toFixed(1)} ${(ly + ry1).toFixed(1)}`} width={SI.far} taper={false} />);
  }
  // the tower over step 1's left half
  if (rise > 0.5) {
    const half = STOOP.tower.w;
    const top = s1y - rise;
    out.push(
      <React.Fragment key="tower">
        <Fill rect={[s1x, top, half, s1h + rise]} color={palette.sand} mode="snap" seed={`${seed}/tw`} />
        <Fill rect={[s1x, top, 22, s1h + rise]} color={palette.tan} offset={false} mode="snap" seed={`${seed}/tsh`} />
        <Fill d={polyPath([[s1x - 6, top - TREAD], [s1x + half + 6, top - TREAD], [s1x + half, top], [s1x, top]])} color={palette.sand} mode="snap" seed={`${seed}/ttop`} />
        <Ink d={line(s1x - 8, top - TREAD, s1x + half + 4, top - TREAD, {seed: `${seed}/a`, over: [3, 2]}) + line(s1x - 2, top, s1x + half, top, {seed: `${seed}/c`, over: [2, 2]}) + line(s1x, top, s1x, s1y + s1h, {seed: `${seed}/e`, over: [0, 0]}) + line(s1x + half, top, s1x + half, s1y + s1h, {seed: `${seed}/f`, over: [0, 0]})} width={SI.mid} />
        {rise > 60 ? <Ink d={brickHints(s1x + 26, top + 30, half - 40, rise - 20, `${seed}/tb`, Math.min(8, Math.round(rise / 70)), 22)} width={SI.far} taper={false} /> : null}
      </React.Fragment>,
    );
  }
  const mg = STOOP.magnifier;
  if (magnifierAt !== undefined) {
    const riding = magnifierRide && rise > 30;
    const my = riding ? s1y - rise + 70 : mg.y;
    const mx = riding ? s1x + STOOP.tower.w / 2 : mg.x;
    const mr = riding ? lerp(mg.r, 34, Math.min(1, rise / 500)) : mg.r;
    out.push(<MagnifierSlot key="mag" x={mx} y={my} r={mr} at={magnifierAt < 0 ? undefined : magnifierAt} seed={`${seed}/mag`} />);
  }
  if (wrenchAt !== undefined) out.push(<WrenchSlot key="wr" x={STOOP.wrench.x} y={STOOP.wrench.y} w={STOOP.wrench.w} at={wrenchAt < 0 ? undefined : wrenchAt} seed={`${seed}/wr`} />);
  if (checkAt !== undefined) out.push(<CheckSlot key="ck" x={mg.x + 6} y={mg.y - 4} size={70} at={checkAt} />);
  return <>{out}</>;
};

function popUpK(t: number, at?: number): number {
  if (at === undefined) return 1;
  if (t < at) return 0;
  const a = prog(t, at, 0.16, E.outCubic);
  return a < 1 ? a * 1.06 : 1.06 - 0.06 * prog(t, at + 0.16, 0.1, E.inOutSine);
}

// ---------------------------------------------------------------- the set

export type Season = 'green' | 'peach' | 'tan' | 'bare';
const SEASON: Record<Season, string | null> = {green: palette.sage, peach: palette.peach, tan: palette.tan, bare: null};

export type StoopStreetProps = {
  tod?: SetTod;
  /** Night features (stars, lit windows, lamp glows, tower dots) pop off at this time (the dawn). */
  nightUntil?: number;
  /** Dawn: the peach horizon band AND peach rim strips on the facades' sun side (STOOP.dawnRims) pop at this time
   *  (default: with tod 'dawn' / nightUntil). Inside a World whose sky key turns 'dawn' (S09: {tod: 'dawn', wipe: 'up'})
   *  each piece also pops when the wipe edge reaches it, and the dusk features pop off the same way. */
  dawnAt?: number;
  /** Which dawn rims draw (indices into STOOP.dawnRims: 0 = the hero house, 1-4 = the far towers): true = all
   *  (default), false = none, e.g. [0] = the hero's only. The tower rims sit in the far layer with the towers. */
  dawnRims?: boolean | number[];
  /** tod="dusk" (S09's cut, under a World dusk key): the lamp glows ON and a few windows lit (STOOP.duskLit), no stars,
   *  no night ground; they pop off at nightUntil / as the dawn wipe passes them. The lit windows pop off one by one at
   *  these times (STOOP.duskLit order). */
  duskOffAt?: number[];
  /** The lamp-post glow drops one step for two frames (one flicker, no blink). */
  glowFlickerAt?: number;
  /** v3 slot: the crate on step 2's tread (STOOP.crate (395, 1226), drawn on the stoop, under heroSlot). */
  crate?: React.ReactNode;
  /** The sun (scene-owned): drawn behind the far towers. */
  sun?: React.ReactNode;
  /** The two steps (pop-ups / draw-on). The storyboard beats on them are <StoopBeats/> in `heroSlot`. */
  stoop?: StoopProps;
  /** Drawn in the hero layer right after the stoop (under the near tree): StoopBeats, the keeper, Pip's perch... */
  heroSlot?: React.ReactNode;
  /** Foreground framing in the bottom band (ground.tsx presets; default 'kerb': a near kerb, two cropped bollards and a
   *  drain grate). false = none. */
  foreground?: ForegroundSpec;
  /** Entrance draw-on: fill-first, top to bottom, the rows ripple near -> far. */
  drawAt?: number;
  /** Hero browser window chrome events. */
  chromeAt?: number;
  screenOnAt?: number;
  /** The hero lock: props-lane Lock props (screwsOutAt, cobwebAt, dropAt, rider, state 'fixed' + popOnAt ...). */
  heroLock?: Partial<LockProps> | false;
  /** Lock variant on every row door (S03 'ghost' ripple, S10 etc.). */
  rowLock?: (side: 'left' | 'right', i: number) => 'closed' | 'ghost' | 'fixed' | 'dot' | false;
  /** Calendar slot: replace with the scene's Calendar (tears); false = none. */
  calendar?: React.ReactNode | false;
  /** Near-tree season, or keyed seasons [{t, s}] (1-frame palette pops). */
  season?: Season | {t: number; s: Season}[];
  /** Ivy growth on door #4's frame (0..1). */
  ivy?: number;
  /** Pigeons on the wire (default true); they take off at pigeonsFlyAt. */
  pigeons?: boolean;
  pigeonsFlyAt?: number;
  bollard?: boolean;
  /** Back-view walkers / standers on STOOP.walkers (life.tsx). Default on; false = nobody (S04). */
  people?: PeopleSpec;
  /** Street furniture (default STOOP.furniture: a planter + a bike); false = none. */
  furniture?: FurnitureItem[] | false;
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  /** Un-build just this set from here (s), over outDur (default 0.5). */
  outAt?: number;
  outDur?: number;
  seed?: string;
};

export const StoopStreet: React.FC<StoopStreetProps> = ({
  tod = 'day',
  nightUntil,
  dawnAt,
  dawnRims = true,
  duskOffAt,
  glowFlickerAt,
  crate,
  sun,
  stoop,
  heroSlot,
  foreground = ['kerb', 'edgeL'],
  drawAt,
  chromeAt,
  screenOnAt,
  heroLock = {},
  rowLock,
  calendar,
  season = 'green',
  ivy = 0,
  pigeons = true,
  pigeonsFlyAt,
  bollard = true,
  people,
  furniture = STOOP.furniture,
  wrap = noWrap,
  x = 0,
  y = 0,
  scale = 1,
  outAt,
  outDur,
  seed = 'stoop',
}) => {
  const t = useTime();
  const night = tod === 'night' && (nightUntil === undefined || t < nightUntil);
  const dusk = tod === 'dusk' && (nightUntil === undefined || t < nightUntil);
  const dawnBand = tod === 'dawn' || (dawnAt !== undefined && t >= dawnAt) || ((tod === 'night' || tod === 'dusk') && nightUntil !== undefined && t >= nightUntil);
  const rimOn = (i: number) => (Array.isArray(dawnRims) ? dawnRims.includes(i) : dawnRims);
  const sz = typeof season === 'string' ? season : season.reduce<Season>((acc, k) => (t >= k.t ? k.s : acc), season[0]?.s ?? 'green');
  const crownColor = SEASON[sz];
  const VP = STOOP.vp;
  const fa = drawAt;
  const ia = drawAt !== undefined ? drawAt + 0.12 : undefined;
  const hero = STOOP.hero;
  const L = perspRowLayout(LEFT_ROW);
  const R = perspRowLayout(RIGHT_ROW);

  // the dawn peach horizon band sits BEHIND the sun slot (band -> sun -> towers): a sun rising at the VP (S09 'with')
  // shows over the band between the towers instead of being painted over by it
  const dawnLayer = (
    <DawnOnly on={dawnBand} p={[720, 1000]}>
      <Fill rect={[-160, 940, 1400, 124]} color={palette.peach} offset={false} mode="snap" seed={`${seed}/dawn`} />
    </DawnOnly>
  );
  const farLayer = (
    <>
      {night ? <Stars seed={seed} /> : null}
      <Fill d={G.towersFar} color={night ? palette.tealDark : TOWER_HAZE[1]} offset={false} mode="snap" at={fa} seed={`${seed}/towersF`} />
      <Fill d={G.towers} color={night ? palette.tealDark : TOWER_HAZE[0]} offset={false} mode="snap" at={fa} seed={`${seed}/towers`} />
      {night ? <Fill d={G.towerDots} color={palette.peach} offset={false} mode="snap" seed={`${seed}/tdots`} /> : <Fill d={G.towerDayDots} color={HALF.daySky} offset={false} mode="snap" at={fa} seed={`${seed}/tddots`} />}
      {/* kit v3b: the towers' dawn rims live HERE, with the towers (after the sun slot, clipped to their silhouettes),
          not in the hero layer where they stood as stray peach bars across a rising sun */}
      {G.towerRims.map((d, i) =>
        d && rimOn(i + 1) ? (
          <DawnOnly key={`trim${i}`} on={dawnBand} p={[STOOP.dawnRims[i + 1][0], STOOP.dawnRims[i + 1][1] + STOOP.dawnRims[i + 1][3] / 2]}>
            <Fill d={d} color={palette.peach} offset={false} mode="snap" seed={`${seed}/rim${i + 1}`} />
          </DawnOnly>
        ) : null,
      )}
      <NightGround on={night}>
        <Fill rect={[600, VP[1] - 2, 330, 8]} color={palette.mintPale} offset={false} at={fa} mode="snap" seed={`${seed}/hz`} />
      </NightGround>
    </>
  );

  // night relights the ground plane (ref 2's night mapping: mintPale -> sage, cream -> sand); facades keep day fills
  const ground = (
    <>
      <NightGround on={night}>
        <Fill rect={[-160, VP[1], 1400, 1000]} color={palette.mintPale} offset={false} at={fa} mode="snap" seed={`${seed}/pave`} />
        <Fill d={G.road} color={palette.cream} offset={false} at={fa} mode="snap" seed={`${seed}/road`} />
        <Fill d={G.pavR} color={palette.mintPale} offset={false} at={fa} mode="snap" seed={`${seed}/pavR`} />
      </NightGround>
      <Ink d={G.kerbInk} width={SI.front} at={ia} seed={`${seed}/kerb`} />
      <GroundMarks marks={G.ground} width={SI.far} at={ia} seed={`${seed}/gm`} />
    </>
  );

  const rows = (
    <>
      <PerspRow layout={R} drawAt={drawAt !== undefined ? drawAt + 0.2 : undefined} lit={night} lock={rowLock ? (i) => rowLock('right', i) : undefined} seed={`${seed}/R`} />
      {STOOP.streetTrees.map((tr, i) => (
        <Tree key={i} x={tr.x} y={tr.base} size={tr.size} h={tr.size * 2.4} color={i % 2 ? palette.teal : palette.sage} sway={false} width={i === 0 ? SI.far : SI.hair} seed={`${seed}/st${i}`} at={drawAt !== undefined ? drawAt + 0.4 + i * 0.05 : undefined} />
      ))}
      <PerspRow layout={L} drawAt={drawAt !== undefined ? drawAt + 0.15 : undefined} lit={night} lock={rowLock ? (i) => rowLock('left', i) : undefined} seed={`${seed}/L`} />
      {dusk
        ? STOOP.duskLit.map((q, k) => {
            const h = (q.side === 'left' ? L : R).houses[q.i];
            if (!h || !h.g.lit || (duskOffAt?.[k] !== undefined && t >= (duskOffAt[k] as number))) return null;
            return (
              <DuskOnly key={`dl${k}`} p={[(h.base[0] + h.top[0]) / 2, (h.base[1] + h.top[1]) / 2]}>
                <Fill d={h.g.lit} color={palette.peach} mode="snap" offset={false} seed={`${seed}/dl${k}`} />
              </DuskOnly>
            );
          })
        : null}
      {night || dusk
        ? STOOP.nightLamps.map((l, i) => (
            <React.Fragment key={i}>
              <Ink d={line(l.x, l.base, l.x, l.head + 8, {seed: `${seed}/nl${i}`, over: 0})} width={SI.far} taper={false} />
              <DuskOnly p={[l.x, l.head]} gate={dusk}>
                <GlowDiscs cx={l.x} cy={l.head} steps={[[i ? 24 : 34, palette.peach], [i ? 15 : 21, HALF.peach], [i ? 7 : 10, palette.cream]]} />
              </DuskOnly>
            </React.Fragment>
          ))
        : null}
    </>
  );

  const heroNode = (
    <>
      {/* fills first (fill-first draw-on) */}
      <Fill rect={[hero.x - 6, hero.y, hero.w + 12, 40]} color={palette.tan} offset={false} at={fa} mode="snap" seed={`${seed}/hc`} />
      <Fill rect={[hero.x - 6, hero.y - 6, hero.w + 12, 7]} color={palette.cream} offset={false} at={fa} mode="snap" seed={`${seed}/hrim`} />
      <Fill rect={[hero.x, hero.y + 40, hero.w, hero.h - 40]} color={palette.sand} at={fa} mode="snap" seed={`${seed}/hf`} />
      <Fill rect={[hero.x, hero.y + 40, hero.w * 0.25, hero.h - 40]} color={palette.tan} offset={false} at={fa} mode="snap" seed={`${seed}/hs`} />
      <Fill rect={[hero.x, hero.y + hero.h, hero.w, STOOP.pavementY - hero.y - hero.h]} color={palette.tan} at={fa} mode="snap" seed={`${seed}/plinth`} />
      {G.wins.map((q, i) => (
        <Fill key={i} rect={[q[0] - 6, q[1] - 6, q[2] + 12, q[3] + 12]} color={palette.cream} offset={false} at={fa} mode="snap" seed={`${seed}/wf${i}`} />
      ))}
      {G.wins.map((q, i) => (
        <Fill key={`g${i}`} rect={q} color={night ? palette.peach : palette.sage} at={fa} mode="snap" seed={`${seed}/wg${i}`} />
      ))}
      {night ? null : <Fill d={G.glass} color={palette.mintPale} offset={false} at={fa} mode="snap" seed={`${seed}/wgl`} />}
      <FacadeDoor r={STOOP.door4} seed={`${seed}/door4`} at={fa} inkAt={ia} width={SI.mid} />
      <Ink d={G.heroInk} width={SI.mid} at={ia} seed={`${seed}/hink`} />
      <Ink d={G.winInk + G.bricks} width={SI.far} taper={false} at={ia !== undefined ? ia + 0.15 : undefined} seed={`${seed}/hwin`} />
      <Ink d={G.plinthInk} width={SI.mid} at={ia} taper={false} />
      <ChromeSlot x={STOOP.browser[0]} y={STOOP.browser[1]} w={STOOP.browser[2]} h={STOOP.browser[3]} chromeAt={chromeAt} screenOnAt={screenOnAt} width={SI.mid} seed={`${seed}/hbw`} />
      <PlaqueSlot x={STOOP.plaque4.x} y={STOOP.plaque4.y} size={STOOP.plaque4.size} seed={`${seed}/pq4`} width={SI.far} />
      {calendar === false ? null : calendar ?? <CalendarSlot x={STOOP.calendar[0]} y={STOOP.calendar[1]} w={STOOP.calendar[2]} h={STOOP.calendar[3]} seed={`${seed}/cal`} />}
      {ivy > 0 ? <Ivy k={ivy} seed={seed} /> : null}
      {heroLock === false ? null : <Lock x={STOOP.lock4.x} y={STOOP.lock4.y} size={STOOP.lock4.h} seed={`${seed}/lock4`} ink={SI.far} {...heroLock} />}
      <Stoop {...stoop} drawAt={stoop?.drawAt ?? drawAt} seed={`${seed}/stoop`} />
      {/* v3 dawn rim on the hero house's sun side (the towers' rims are drawn with the towers in the far layer) */}
      {rimOn(0) ? (
        <DawnOnly on={dawnBand} p={[STOOP.dawnRims[0][0] + STOOP.dawnRims[0][2] / 2, STOOP.dawnRims[0][1] + STOOP.dawnRims[0][3] / 2]}>
          <Fill rect={STOOP.dawnRims[0]} color={palette.peach} offset={false} mode="snap" seed={`${seed}/rim0`} />
        </DawnOnly>
      ) : null}
      {crate}
      {heroSlot}
    </>
  );

  const nearNode = (
    <>
      {/* near street tree right of the stoop (seasons pop by palette) */}
      <Fill d={G.trunk} color={palette.brown} at={fa} mode="snap" seed={`${seed}/ntt`} />
      {crownColor ? <Fill d={G.treeCrown} color={crownColor} at={fa} mode="snap" seed={`${seed}/ntc`} /> : null}
      <Ink d={G.trunkInk + (crownColor ? '' : G.bare)} width={SI.mid} taper={false} at={ia} />
      {crownColor ? <Ink d={G.treeCrown} width={SI.mid} open={0.12} at={ia} seed={`${seed}/ntci`} /> : null}
      {crownColor ? <Ink d={G.treeTicks} width={SI.far} taper={false} at={ia} /> : null}
      {/* lamp post cropped at the left edge + the telephone wire + pigeons */}
      <Ink d={G.wireD} width={SI.far} taper={false} at={ia} seed={`${seed}/wire`} />
      {pigeons
        ? STOOP.pigeons.map((p, i) => {
            const q = wirePoint(STOOP.wire.a[0], STOOP.wire.a[1], STOOP.wire.b[0] + 160, STOOP.wire.b[1] + 6, STOOP.wire.sag * 1.15, (p[0] - STOOP.wire.a[0]) / (STOOP.wire.b[0] + 160 - STOOP.wire.a[0]));
            return <Bird key={i} x={q[0]} y={q[1] + 1} s={0.85} seed={`${seed}/pg${i}`} flyAt={pigeonsFlyAt !== undefined ? pigeonsFlyAt + i * 0.1 : undefined} color={i ? palette.sand : palette.white} />;
          })
        : null}
      {night || dusk ? (
        <DuskOnly p={[STOOP.lamp.lantern[0] + 24, STOOP.lamp.lantern[1] - 18]} gate={dusk}>
          <GlowDiscs cx={STOOP.lamp.lantern[0] + 24} cy={STOOP.lamp.lantern[1] - 18} steps={glowFlickerAt !== undefined && t >= glowFlickerAt && t < glowFlickerAt + 0.067 ? [[38, HALF.peach]] : [[52, palette.peach], [38, HALF.peach]]} />
        </DuskOnly>
      ) : null}
      <Fill d={G.lampFill} color={palette.tealDark} at={fa} mode="snap" seed={`${seed}/lamp`} />
      <Fill d={G.lantern} color={night ? palette.cream : palette.cream} at={fa} mode="snap" seed={`${seed}/lant`} />
      <Ink d={G.lampInk + rect(STOOP.lamp.lantern[0] + 6, STOOP.lamp.lantern[1] - 40, 36, 46, {seed: `${seed}/lanti`, over: 'small'})} width={SI.front} at={ia} seed={`${seed}/lampi`} />
      {bollard ? <BollardSlot x={STOOP.bollard.x} y={STOOP.bollard.y} w={STOOP.bollard.w} h={STOOP.bollard.h} seed={`${seed}/bollard`} /> : null}
      <NightGround on={night}>
        <Foreground spec={foreground} seed={`${seed}/fg`} />
      </NightGround>
    </>
  );

  return (
    <SetPlace x={x} y={y} scale={scale} outAt={outAt} outDur={outDur}>
      {wrap('dawn', 0.1, dawnLayer)}
      {sun ? wrap('sun', 0.12, sun) : null}
      {wrap('far', 0.1, farLayer)}
      {wrap('ground', 0.4, ground)}
      {wrap('rows', 0.4, rows)}
      {wrap('hero', 0.7, heroNode)}
      {wrap(
        'people',
        0.8,
        <>
          <Furniture items={furniture} seed={`${seed}/furn`} />
          <People anchors={STOOP.walkers} vp={STOOP.vp} spec={people} seed={`${seed}/ppl`} />
        </>,
      )}
      {wrap('near', 1.0, nearNode)}
    </SetPlace>
  );
};

/** Dusk features (glows, lit windows) at world point p: gone once the World's dawn wipe has reached p (useTod is 'dawn'
 *  there) — the lamp glows pop off as the wipe passes them. `gate` false = always shown (night mode). */
const DuskOnly: React.FC<{p: Pt; gate?: boolean; children?: React.ReactNode}> = ({p, gate = true, children}) => {
  const tod = useTod(p);
  if (gate && tod === 'dawn') return null;
  return <>{children}</>;
};

/** Dawn pieces (band, rims) at world point p: shown from `on` (dawnAt / nightUntil) or once the World's dawn wipe has
 *  reached p. */
const DawnOnly: React.FC<{p: Pt; on: boolean; children?: React.ReactNode}> = ({p, on, children}) => {
  const tod = useTod(p);
  return on || tod === 'dawn' ? <>{children}</> : null;
};

const Stars: React.FC<{seed: string}> = ({seed}) => {
  const t = useTime();
  return (
    <>
      {STARS.map((p, i) => {
        const r = 3 + (i % 3) + osc(t, 0.4 + i * 0.07, i) * 0.8;
        return <circle key={i} cx={p[0]} cy={p[1]} r={r} fill={palette.cream} data-seed={seed} />;
      })}
    </>
  );
};

/** Ivy creeping up door #4's frame (x 210-235, y 1300 -> 1040): an ink vine + sage leaf blobs, grown to k (0..1). */
const Ivy: React.FC<{k: number; seed: string}> = ({k, seed}) => {
  const y0 = 1300;
  const y1 = lerp(y0, 1040, Math.min(1, k));
  const pts: Pt[] = [];
  for (let y = y0; y >= y1; y -= 16) pts.push([222 + Math.sin(y * 0.09) * 9, y]);
  if (pts.length < 2) return null;
  let leaves = '';
  pts.forEach((p, i) => {
    if (i % 2 === 0) leaves += `M${p[0] + 4} ${p[1]}a6 4 0 1 0 12 0a6 4 0 1 0 -12 0z`;
    else leaves += `M${p[0] - 16} ${p[1]}a6 4 0 1 0 12 0a6 4 0 1 0 -12 0z`;
  });
  return (
    <>
      <Ink d={pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('')} width={SI.far} taper={false} seed={`${seed}/ivy`} />
      <Fill d={leaves} color={palette.sage} offset={false} mode="snap" seed={`${seed}/ivyl`} />
    </>
  );
};

/** Sky colour helpers for scenes (the World owns the sky). */
export const STOOP_SKY = {day: skies.day, night: skies.night, dawn: palette.cream};

