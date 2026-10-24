// GovernmentPlaza — S1 (S01 hook, S11 close-up + hard cut, S13 un-build underlay = frame 0). PEAK 1.
//
// Four monumental government buildings ("four countries") around a deep gap where the low sun sits:
//   govA Columned Hall (x -120..250, pediment apex (65, 610), cropped by the left edge)
//   govB Domed Capitol (x 250..500, lantern tip 600; the hero: hero window 270,860,210,150, lock box (400,1135) 16x20)
//   govC Clock Tower (x 770..960, behind govD; white clock face r26 at (865,650) that stays white when dark)
//   govD Modern Ministry (x 760..1240, roof 860, base 1290, cropped by the right edge)
// + the far city in the gap (two fill-only haze tiers, lower and smaller than the buildings), the plaza (one flat field
// with a few broken paving lines + specks toward VP (630,1150)), the flat cream sun path with sage shadow wedges, a lamp
// post with a crossbar and 3 pigeons, a foreground tree in a tree pit, Pip's bollard (760,1440), 4 abstract pennants,
// 9 ~40 px citizens (doors are >= 3x a citizen) and 3 onlookers cropped to heads + shoulders in the bottom corners.
// World coordinates = S01 camera rest.
//
//   <GovernmentPlaza state="built" cascadeAt={0.03} sun={<Sun .../>}
//     gov={{govA: {chromeAt: 0.54, screenOnAt: 0.9, shutterAt: 2.4, offAt: 2.4, tagAt: 3.4, padlockAt: 3.64}, ...}}
//     pennantsAt={[1.23, 1.38, 1.53, 1.68]} citizensAt={1.06} lanternOffAt={3.25} pigeonsAt={1.7} pigeonsFlyAt={3.3} />
//   <GovernmentPlaza state="lineArt" />      // frame 0 / the S13 un-build underlay (ink on white, white tombstones)
//   <GovernmentPlaza state="off" />          // the S01 end state (S11 hard cut): shutters down, padlocked, tagged, dark
//   <GovernmentPlaza detail="close" ... />   // S11 govB close-up (zoom 1.85 on (375,793)): extra stone detail
//   wrap={(name, nearness, node) => <Layer depth={1 - nearness}>{node}</Layer>}   // multiplane split
//
// The three states share every path and seed, so the geometry is pixel-identical across them. Every event time is a
// prop (scene seconds); omit an event = it never happens (the 'off' state = every switch-off already happened).

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, osc, prog, useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {Look, useLook} from '../../../lib/exit';
import {arc, blob, circle, crown, crownTicks, ellipse, line, polyPath, rect, rectPath, smooth, vline, Pt} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {mat, XG} from '../../../lib/xf';
import {Bird} from '../../../lib/kit';
import {brickHints, cornice, HALF, LayerWrap, LightsOut, noWrap, OnlyWhilePaper, PaperUntilCascade, SetPlace, SI} from './common';
import {Foreground, ForegroundSpec, groundMarks, GroundMarks} from './ground';
import {BackSoonSlot, BitSlot, BollardSlot, ChromeSlot, CitizenSlot, LockSlot, OnlookerSlot, PadlockSlot, PlaqueSlot, ShutterSlot} from './propSlots';
import {FacadeDoor} from './SiteFacade';

// ---------------------------------------------------------------- layout (anchors for scenes)

export type GovId = 'govA' | 'govB' | 'govC' | 'govD';
type R4 = [number, number, number, number];

export const PLAZA = {
  vp: [630, 1150] as Pt,
  /** Sun slot (S01 rest): centre (630, 800) r150; frame 0 mid-rise at (630, 850). */
  sun: {x: 630, y: 800, r: 150},
  /** Fill-cascade origin (the sun gap). */
  cascadeOrigin: [630, 900] as Pt,
  bollard: {x: 760, y: 1440, w: 50, h: 90},
  /** Pip's feet on the bollard. */
  pip: [760, 1440] as Pt,
  /** Bit on govA's cornice. */
  bit: [200, 705] as Pt,
  lamp: {x: 60, lantern: [60, 1090] as Pt, barY: 1150, bar: [30, 130] as [number, number], top: 1060},
  pigeons: [[52, 1150], [88, 1150], [118, 1150]] as Pt[],
  /** ~40 px citizens (doors are >= 3x a citizen: the monumental scale cue). */
  citizens: [150, 260, 345, 505, 600, 700, 790, 880, 930].map((x, i) => ({x, y: [1262, 1300, 1248, 1286, 1270, 1294, 1240, 1298, 1268][i], h: [40, 44, 38, 42, 40, 44, 36, 42, 38][i], sil: x === 600 || x === 700})),
  /** Edge onlookers cropped to heads + shoulders in the bottom corners (<= 0.15 H visible: framing, not scale). */
  onlookers: [
    {head: [62, 1745] as Pt, s: 1.32},
    {head: [196, 1818] as Pt, s: 1.38},
    {head: [1010, 1765] as Pt, s: 1.34},
  ],
  gov: {
    govA: {window: [95, 820, 150, 120] as R4, door: [120, 1020, 80, 120] as R4, padlock: [170, 945] as Pt, tag: [200, 935] as Pt, pennant: [240, 745] as Pt, lock: [186, 1092, 11, 14] as R4, plaque: [104, 1078, 20] as [number, number, number]},
    govB: {window: [270, 860, 210, 150] as R4, door: [340, 1080, 80, 120] as R4, padlock: [375, 1015] as Pt, tag: [405, 1005] as Pt, pennant: [490, 775] as Pt, lock: [400, 1135, 16, 20] as R4, plaque: [322, 1112, 22] as [number, number, number]},
    govC: {window: [785, 710, 160, 110] as R4, door: null as R4 | null, padlock: [865, 825] as Pt, tag: [835, 815] as Pt, pennant: [775, 700] as Pt, lock: null as R4 | null, plaque: null as [number, number, number] | null},
    govD: {window: [775, 960, 155, 120] as R4, door: [980, 1170, 90, 120] as R4, padlock: [852, 1085] as Pt, tag: [822, 1075] as Pt, pennant: [790, 875] as Pt, lock: [1059, 1232, 12, 15] as R4, plaque: [962, 1205, 20] as [number, number, number]},
  },
  /** govC's clock face. */
  clock: {x: 865, y: 650, r: 26},
  /** S11 framing: camera (375, 793) zoom 1.8 -> 1.85; govB window sill (Pip, snail) at world y 1010. */
  closeup: {cam: [375, 793] as Pt, zoom: 1.85, sill: 1010},
  /** Layer nearness (storyboard depths). */
  layers: {far: 0.1, sun: 0.12, buildings: 0.55, govD: 0.62, ground: 0.7, light: 0.7, near: 1.0},
} as const;

export type GovEvents = {
  /** Chunky browser chrome reveals (omit = already there). */
  chromeAt?: number;
  /** Screen content pops on (omit = on with the chrome). */
  screenOnAt?: number;
  /** The roller shutter slams down (0.16 s, 6 px bounce). */
  shutterAt?: number;
  /** Lights out: the building steps one palette step darker (1-frame pop). */
  offAt?: number;
  /** "back soon" tag swings on; tapAt swings it again. */
  tagAt?: number;
  tagTapAt?: number;
  /** Padlock pops onto the shutter. */
  padlockAt?: number;
  /** Padlock glint (two ink diagonals for 0.3 s). */
  glintAt?: number;
};

export type PlazaState = 'lineArt' | 'built' | 'off';

export type GovernmentPlazaProps = {
  state?: PlazaState;
  /** 'built': the colour cascade from the sun gap (paper until the wave reaches each fill). Omit = in colour. */
  cascadeAt?: number;
  cascadeSpeed?: number;
  gov?: Partial<Record<GovId, GovEvents>>;
  /** Browser chrome in the windows (default: false in lineArt, true otherwise). */
  chrome?: boolean;
  /** Pennants: unfurl times [govA, govB, govC, govD] (scaleX 0 -> 1, 6 % overshoot); true = up; default: up only in 'off'. */
  pennantsAt?: number[] | boolean;
  /** One wave of every pennant (S11). */
  pennantWaveAt?: number;
  /** Citizens rise in (0.33 s out-exp, 0.05 s stagger, left to right). Omit = standing. false = none. */
  citizensAt?: number | false;
  /** Two citizens raise phones. */
  phonesAt?: number;
  /** The three edge onlookers, cropped to heads + shoulders in the bottom corners. Default true. */
  onlookers?: boolean;
  /** Extra foreground framing (ground.tsx presets 'heads' | 'kerb' | 'railing' | 'treeL' | 'treeR', a list, or a node).
   *  Default none: the plaza frames itself (lamp post, tree, bollard, corner onlookers). */
  foreground?: ForegroundSpec;
  /** Lamp lantern cream -> sand. */
  lanternOffAt?: number;
  /** Pigeons land on the crossbar / scatter. Omit landing = absent (default), true = sitting. */
  pigeonsAt?: number | boolean;
  pigeonsFlyAt?: number;
  /** 'close' adds stone courses, drum windows and finer dome ribs (S11 at zoom 1.85). */
  detail?: 'wide' | 'close';
  /** The sun (scene-owned) is drawn here: behind the far city and every building. */
  sun?: React.ReactNode;
  /** Bollard (Pip's perch). Default true. */
  bollard?: boolean;
  /** Bit idling on govA's cornice at (200, 705) (frame 0 / last frame). Default true; false when the scene animates him. */
  bit?: boolean;
  /** Per-window override (S11: progress bar / loading ring). Receives the window rect. */
  windowSlot?: (id: GovId, r: R4) => React.ReactNode;
  /** Multiplane split (see common LayerWrap). */
  wrap?: LayerWrap;
  x?: number;
  y?: number;
  scale?: number;
  /** Un-build just this set from here (s), over outDur (default 0.5). */
  outAt?: number;
  outDur?: number;
  seed?: string;
};

/** The day haze ladder (style_bible_ref2 8): near #84B09C, far #98C0AE. */
const HAZE = ['#84B09C', '#98C0AE'] as const;

const NEAR = SI.front;
const MID = SI.mid;
const THIN = SI.far;
const HAIR = SI.hair;

// ---------------------------------------------------------------- geometry (module-level, computed once)

const G = (() => {
  const s = 'gp';
  // ---- govA: columned hall
  // a tall colonnade inside the ceiling (columns 758-1136): the monumental cue
  const A = {x0: -120, x1: 250, apex: [65, 610] as Pt, cornT: 690, cornB: 720, friezeB: 748, colTop: 758, colBot: 1136, styl: 1148, base: 1208};
  const colsA = [-104, -67, -30, 7, 44, 81];
  const ped = polyPath([[-140, A.cornT], A.apex, [270, A.cornT]]);
  const tymp = polyPath([[-104, A.cornT - 6], [65, 626], [234, A.cornT - 6]]);
  const aInk =
    line(-150, A.cornT + 2, A.apex[0], A.apex[1], {seed: `${s}/ar1`, over: [30, 6]}) +
    line(A.apex[0], A.apex[1], 282, A.cornT + 2, {seed: `${s}/ar2`, over: [6, 24]}) +
    line(-104, A.cornT - 6, 65, 628, {seed: `${s}/ar3`, over: [2, 2]}) +
    line(65, 628, 234, A.cornT - 6, {seed: `${s}/ar4`, over: [2, 2]}) +
    cornice(-150, 280, A.cornT, A.cornB - A.cornT, `${s}/ac`, 30) +
    line(-130, A.friezeB, 262, A.friezeB, {seed: `${s}/af`, over: [10, 10]}) +
    line(-130, 734, 262, 734, {seed: `${s}/af2`, over: [4, 6]}) +
    vline(250, A.cornB, A.styl, {seed: `${s}/aR`, over: [0, 4]}) +
    vline(244, A.friezeB, A.styl, {seed: `${s}/aR2`, over: [0, 0]});
  let colInk = '';
  let colFill = '';
  let colShade = '';
  let flutes = '';
  for (const cx of colsA) {
    const w = 26;
    colFill += rectPath(cx - w / 2, A.colTop, w, A.colBot - A.colTop);
    colShade += rectPath(cx - w / 2, A.colTop, w * 0.3, A.colBot - A.colTop);
    colFill += rectPath(cx - 18, A.friezeB, 36, A.colTop - A.friezeB) + rectPath(cx - 16, A.colBot, 32, A.styl - A.colBot);
    colInk +=
      line(cx - w / 2, A.colTop, cx - w / 2, A.colBot, {seed: `${s}/cl${cx}`, over: [0, 0]}) +
      line(cx + w / 2, A.colTop, cx + w / 2, A.colBot, {seed: `${s}/cr${cx}`, over: [0, 0]}) +
      line(cx - 20, A.friezeB + 1, cx + 20, A.friezeB + 1, {seed: `${s}/cc${cx}`, over: [2, 2]}) +
      line(cx - 16, A.colTop, cx + 16, A.colTop, {seed: `${s}/cd${cx}`, over: [1, 1]}) +
      line(cx - 17, A.colBot, cx + 17, A.colBot, {seed: `${s}/cb${cx}`, over: [1, 1]});
    flutes += line(cx - 4, A.colTop + 8, cx - 4, A.colBot - 8, {seed: `${s}/f1${cx}`, over: 0}) + line(cx + 5, A.colTop + 8, cx + 5, A.colBot - 8, {seed: `${s}/f2${cx}`, over: 0});
  }
  const steps = [0, 1, 2].map((i) => [-130 - i * 10, A.styl + i * 20, 392 + i * 20, 20] as R4);
  let stepInk = '';
  steps.forEach((q, i) => (stepInk += line(q[0], q[1], q[0] + q[2], q[1], {seed: `${s}/st${i}`, over: [4, 10]})));
  // ---- govB: domed capitol
  // a taller drum (750-820) under a slightly flatter dome; the lantern tip stays on the ceiling (y 600)
  const B = {x0: 250, x1: 500, top: 820, base: 1200, drum: [268, 750, 214, 70] as R4, dome: {cx: 375, by: 750, rx: 76, ry: 102}, lantern: [365, 614, 20, 34] as R4};
  const domeFill = `M${B.dome.cx - B.dome.rx} ${B.dome.by}A${B.dome.rx} ${B.dome.ry} 0 0 1 ${B.dome.cx + B.dome.rx} ${B.dome.by}Z`;
  const domeInk = arc(B.dome.cx, B.dome.by, B.dome.rx, B.dome.ry, 180, 360, {seed: `${s}/dm`, wobble: 0.01}) + line(B.dome.cx - B.dome.rx - 10, B.dome.by, B.dome.cx + B.dome.rx + 10, B.dome.by, {seed: `${s}/db`, over: [4, 4]});
  let ribs = '';
  for (const u of [-0.62, -0.25, 0.12, 0.48]) {
    const xb = B.dome.cx + u * B.dome.rx;
    ribs += `M${xb.toFixed(1)} ${B.dome.by}Q${(B.dome.cx + u * B.dome.rx * 0.55).toFixed(1)} ${B.dome.by - B.dome.ry * 0.85} ${B.dome.cx} ${B.dome.by - B.dome.ry + 2}`;
  }
  // cream rim strip inside the dome outline, sun side (right)
  const rimPts: Pt[] = [];
  for (let a = 290; a <= 360; a += 7) rimPts.push([B.dome.cx + Math.cos((a * Math.PI) / 180) * (B.dome.rx - 1), B.dome.by + Math.sin((a * Math.PI) / 180) * (B.dome.ry - 1)]);
  for (let a = 360; a >= 290; a -= 7) rimPts.push([B.dome.cx + Math.cos((a * Math.PI) / 180) * (B.dome.rx - 9), B.dome.by + Math.sin((a * Math.PI) / 180) * (B.dome.ry - 9)]);
  const domeRim = polyPath(rimPts);
  const lantern = rectPath(B.lantern[0], B.lantern[1], B.lantern[2], B.lantern[3]) + polyPath([[B.lantern[0] - 3, B.lantern[1]], [375, 600], [B.lantern[0] + B.lantern[2] + 3, B.lantern[1]]]);
  const lanternInk = rect(B.lantern[0], B.lantern[1], B.lantern[2], B.lantern[3], {seed: `${s}/ln`, over: 'small'}) + line(B.lantern[0] - 4, B.lantern[1], 375, 600, {seed: `${s}/lt1`, over: [1, 1]}) + line(375, 600, B.lantern[0] + B.lantern[2] + 4, B.lantern[1], {seed: `${s}/lt2`, over: [1, 1]});
  const bInk =
    cornice(B.drum[0], B.drum[0] + B.drum[2], B.drum[1], 10, `${s}/bdc`, 10) +
    line(B.drum[0], B.drum[1], B.drum[0], B.top, {seed: `${s}/bd1`, over: [0, 2]}) +
    line(B.drum[0] + B.drum[2], B.drum[1], B.drum[0] + B.drum[2], B.top, {seed: `${s}/bd2`, over: [0, 2]}) +
    cornice(B.x0, B.x1, B.top, 18, `${s}/bc`, 22) +
    line(B.x0, B.top, B.x0, B.base, {seed: `${s}/bl`, over: [0, 6]}) +
    line(B.x1, B.top, B.x1, B.base, {seed: `${s}/br`, over: [0, 6]}) +
    line(B.x0 + 12, B.top + 18, B.x0 + 12, B.base - 20, {seed: `${s}/bp1`, over: 0}) +
    line(B.x1 - 12, B.top + 18, B.x1 - 12, B.base - 20, {seed: `${s}/bp2`, over: 0}) +
    line(B.x0 - 12, B.base - 20, B.x1 + 12, B.base - 20, {seed: `${s}/bs1`, over: [4, 8]}) +
    line(B.x0 - 22, B.base, B.x1 + 22, B.base, {seed: `${s}/bs2`, over: [6, 10]}) +
    // small pediment over the door
    line(326, 1066, 380, 1040, {seed: `${s}/bdp1`, over: [4, 1]}) +
    line(380, 1040, 434, 1066, {seed: `${s}/bdp2`, over: [1, 4]}) +
    line(322, 1066, 438, 1066, {seed: `${s}/bdp3`, over: [3, 3]});
  let drumThin = '';
  for (let i = 0; i < 7; i++) {
    const x = B.drum[0] + 18 + i * 30;
    drumThin += line(x, B.drum[1] + 18, x, B.top - 4, {seed: `${s}/dt${i}`, over: 0});
  }
  // ---- govC: clock tower (behind govD)
  const C = {x0: 770, x1: 960, corn: 680, turret: [832, 624, 66, 56] as R4};
  const cInk =
    line(C.x0, C.corn + 12, C.x0, 880, {seed: `${s}/cl`, over: [0, 0]}) +
    line(C.x1, C.corn + 12, C.x1, 880, {seed: `${s}/cr`, over: [0, 0]}) +
    cornice(C.x0 - 6, C.x1 + 6, C.corn, 12, `${s}/cc`, 12) +
    rect(C.turret[0], C.turret[1], C.turret[2], C.turret[3], {seed: `${s}/ct`, edges: 'lr', over: 'small'}) +
    line(C.turret[0] - 6, C.turret[1], 865, 610, {seed: `${s}/cs1`, over: [1, 0]}) +
    line(865, 610, C.turret[0] + C.turret[2] + 6, C.turret[1], {seed: `${s}/cs2`, over: [0, 1]}) +
    line(C.turret[0] - 8, C.turret[1] + 1, C.turret[0] + C.turret[2] + 8, C.turret[1] + 1, {seed: `${s}/cs3`, over: [1, 1]});
  // ---- govD: modern ministry
  const D = {x0: 760, x1: 1240, roof: 860, fascia: 24, base: 1290};
  let gridInk = '';
  let cells = '';
  let cellsDark = '';
  const r = rng(`${s}/dg`);
  const colsX: number[] = [];
  for (let x = D.x0 + 6; x < D.x1; x += 52) colsX.push(x);
  const rowsY = [D.roof + D.fascia, 950, 1030, 1110, 1170];
  for (let i = 0; i < colsX.length - 1; i++) {
    for (let j = 0; j < rowsY.length - 1; j++) {
      const x = colsX[i] + 5;
      const y = rowsY[j] + 5;
      const w = colsX[i + 1] - colsX[i] - 10;
      const h = rowsY[j + 1] - rowsY[j] - 10;
      // the browser window occupies x 775-930, y 960-1080: skip those cells
      if (x + w > 765 && x < 940 && y + h > 945 && y < 1095) continue;
      if (r.chance(0.36)) cellsDark += rectPath(x, y, w, h);
      else cells += rectPath(x, y, w, h);
    }
  }
  for (const x of colsX) if (!(x > 770 && x < 935)) gridInk += line(x, D.roof + D.fascia, x, 1170, {seed: `${s}/gx${x}`, over: [0, 2], breaks: false});
  for (const y of rowsY.slice(1)) gridInk += line(D.x0, y, D.x1 + 20, y, {seed: `${s}/gy${y}`, over: [0, 0]});
  const dInk =
    line(D.x0, D.roof, D.x0, D.base, {seed: `${s}/dl`, over: [4, 4]}) +
    line(D.x0 - 14, D.roof, D.x1 + 40, D.roof, {seed: `${s}/dr`, over: [8, 0]}) +
    line(D.x0 - 8, D.roof + D.fascia, D.x1 + 40, D.roof + D.fascia, {seed: `${s}/df`, over: [4, 0]}) +
    line(D.x0 - 16, 1170, D.x1 + 40, 1170, {seed: `${s}/dg`, over: [6, 0]}) +
    line(D.x0 - 30, D.base, D.x1 + 40, D.base, {seed: `${s}/db`, over: [10, 0]});
  let pilotis = '';
  for (let x = 800; x < 1240; x += 110) if (x < 960 || x > 1080) pilotis += rectPath(x, 1170, 14, D.base - 1170);
  // ---- far city band in the gap (fill-only)
  const fr = rng(`${s}/far`);
  let farA = '';
  let farB = '';
  let farDots = '';
  let farEdges = '';
  // lower and smaller than the buildings around the gap (the far scale cue), two haze tiers on the day ladder
  // (style_bible_ref2 8): a back skyline (#98C0AE, tops 912-968, behind the sun's lower edge) and a front tier of small
  // blocks (#84B09C, tops 1030-1110); both fill-only, back-filled so no sky shows below the skyline
  farA += rectPath(470, 968, 340, 236);
  for (let x = 470; x < 810; ) {
    const w = fr.range(16, 30);
    const top = fr.range(912, 968);
    farA += rectPath(x, top, w + 0.5, 1204 - top);
    farEdges += `M${x.toFixed(1)} 1200L${x.toFixed(1)} ${top.toFixed(1)}L${(x + w).toFixed(1)} ${top.toFixed(1)}`;
    for (let yy = top + 8; yy < 1020; yy += 12) for (let xx = x + 4; xx < x + w - 4; xx += 8) if (fr.chance(0.18)) farDots += rectPath(xx, yy, 3, 4);
    x += w;
  }
  for (let x = 476; x < 806; ) {
    const w = fr.range(14, 26);
    const top = fr.range(1030, 1110);
    if (fr.chance(0.8)) {
      farB += rectPath(x, top, w, 1204 - top);
      for (let yy = top + 7; yy < 1180; yy += 11) for (let xx = x + 4; xx < x + w - 4; xx += 7) if (fr.chance(0.25)) farDots += rectPath(xx, yy, 2.6, 3.4);
    }
    x += w + fr.range(0, 6);
  }
  const cranes =
    // crane 1 (left of the gap): mast, jib, counter-jib, hook
    line(548, 1000, 548, 886, {seed: `${s}/k1a`, over: 0}) + line(554, 1000, 554, 886, {seed: `${s}/k1b`, over: 0}) +
    `M548 990L554 978L548 966L554 954L548 942L554 930L548 918L554 906L548 894` +
    line(512, 890, 612, 890, {seed: `${s}/k1j`, over: [0, 0]}) + line(551, 880, 590, 890, {seed: `${s}/k1t`, over: 0}) + line(600, 890, 600, 914, {seed: `${s}/k1h`, over: 0}) +
    // crane 2 (right)
    line(716, 1000, 716, 902, {seed: `${s}/k2a`, over: 0}) + line(721, 1000, 721, 902, {seed: `${s}/k2b`, over: 0}) +
    `M716 990L721 979L716 968L721 957L716 946L721 935L716 924L721 913L716 904` +
    line(688, 904, 756, 904, {seed: `${s}/k2j`, over: [0, 0]}) + line(698, 904, 698, 924, {seed: `${s}/k2h`, over: 0});
  // ---- plaza ground
  // ground: a few broken paving lines that die toward the viewer + specks (no tile grid)
  const ground = groundMarks({vp: [630, 1150], top: 1212, bottom: 1920, x0: -420, x1: 1560, rays: 5, cross: 2, specks: 18, reach: 0.6, seed: `${s}/gm`});
  const kerbs = line(-150, 1206, 770, 1206, {seed: `${s}/k1`, over: [20, 0]}) + line(-150, 1222, 520, 1224, {seed: `${s}/k2`, over: [20, 8]});
  // sun path + shadow wedges (flat, fixed opacity)
  const pathPoly = polyPath([[560, 1200], [700, 1200], [900, 1480], [620, 1480]]);
  const pathEdges = line(560, 1200, 620, 1480, {seed: `${s}/sp1`, over: 0, breaks: false}) + line(700, 1200, 900, 1480, {seed: `${s}/sp2`, over: 0, breaks: false});
  // path edges extended to the frame bottom: left (560,1200)->(620,1480), right (700,1200)->(900,1480)
  const exL = (y: number) => 560 + ((620 - 560) * (y - 1200)) / 280;
  const exR = (y: number) => 700 + ((900 - 700) * (y - 1200)) / 280;
  const wedgeB = polyPath([[262, 1201], [560, 1201], [exL(2060), 2060], [-200, 2060], [-200, 1700]]);
  const wedgeD = polyPath([[700, 1201], [760, 1201], [760, 1290], [1300, 1290], [1300, 2060], [exR(2060), 2060]]);
  const pathFar = polyPath([[exL(1480), 1480], [exR(1480), 1480], [exR(2060), 2060], [exL(2060), 2060]]);
  // benches
  const bench = (x: number, y: number, w: number) => ({fill: rectPath(x, y, w, 7), ink: line(x - 3, y, x + w + 3, y, {seed: `bn${x}`, over: [2, 2]}) + line(x + 6, y + 7, x + 4, y + 24, {seed: `bl${x}`, over: 0}) + line(x + w - 6, y + 7, x + w - 4, y + 24, {seed: `br${x}`, over: 0})});
  const benches = [bench(205, 1236, 64), bench(468, 1228, 52)];
  // lamp post (near)
  const lampInk =
    line(52, 1990, 54, 1100, {seed: `${s}/lp1`, over: 0}) + line(68, 1990, 66, 1104, {seed: `${s}/lp2`, over: 0}) + line(20, 1150, 140, 1150, {seed: `${s}/lpb`, over: [6, 10]}) + line(24, 1160, 136, 1160, {seed: `${s}/lpb2`, over: [2, 4]}) +
    rect(42, 1066, 36, 40, {seed: `${s}/lpl`, over: 'small'}) + line(36, 1066, 60, 1048, {seed: `${s}/lpr1`, over: [1, 0]}) + line(60, 1048, 84, 1066, {seed: `${s}/lpr2`, over: [0, 1]});
  const lampFill = rectPath(52, 1104, 16, 900) + rectPath(20, 1150, 120, 10) + polyPath([[36, 1066], [60, 1048], [84, 1066]]);
  // foreground tree (cropped right)
  const crownD = crown(1030, 1290, 110, 125, {seed: `${s}/tree`, bumps: 10});
  const treeTicks = crownTicks(1030, 1290, 110, 125, {seed: `${s}/treek`, n: 4, size: 12});
  // trunk into a tree pit on the plaza (not a pole to the frame bottom)
  const trunk = rectPath(1000, 1380, 22, 282);
  const trunkInk = line(1000, 1660, 1000, 1395, {seed: `${s}/t1`, over: 0}) + line(1022, 1660, 1021, 1400, {seed: `${s}/t2`, over: 0}) + ellipse(1011, 1662, 58, 13, {seed: `${s}/pit`, overlap: -40});
  const pit = `M953 1662a58 13 0 1 0 116 0a58 13 0 1 0 -116 0Z`;
  return {pathFar, farEdges, A, colsA, ped, tymp, aInk, colInk, colFill, colShade, flutes, steps, stepInk, B, domeFill, domeInk, ribs, domeRim, lantern, lanternInk, bInk, drumThin, C, cInk, D, gridInk, cells, cellsDark, dInk, pilotis, farA, farB, farDots, cranes, ground, kerbs, pathPoly, pathEdges, wedgeB, wedgeD, benches, lampInk, lampFill, crownD, treeTicks, trunk, trunkInk, pit};
})();

// ---------------------------------------------------------------- shared window hardware (chrome + shutter + lock + tag)

type WinCtx = {id: GovId; ev: GovEvents; off: boolean; chrome: boolean; seed: string; windowSlot?: GovernmentPlazaProps['windowSlot']; k?: number};

const WindowRig: React.FC<WinCtx> = ({id, ev, off, chrome, seed, windowSlot, k = 1}) => {
  const g = PLAZA.gov[id];
  const [x, y, w, h] = g.window;
  return (
    <>
      {windowSlot ? windowSlot(id, g.window) : <ChromeSlot x={x} y={y} w={w} h={h} chrome={chrome} chromeAt={off ? undefined : ev.chromeAt} screenOnAt={off ? undefined : ev.screenOnAt} offAt={off ? -1e6 : ev.offAt} width={MID * k} seed={`${seed}/${id}/bw`} />}
      <ShutterSlot x={x} y={y} w={w} h={h} slamAt={ev.shutterAt} down={off} width={MID * k} seed={`${seed}/${id}/sh`} />
      {off || ev.tagAt !== undefined ? <BackSoonSlot x={g.tag[0]} y={g.tag[1]} at={off ? undefined : ev.tagAt} tapAt={ev.tagTapAt} seed={`${seed}/${id}/tag`} /> : null}
      {off || ev.padlockAt !== undefined ? <PadlockSlot x={g.padlock[0]} y={g.padlock[1]} at={off ? undefined : ev.padlockAt} glintAt={ev.glintAt} seed={`${seed}/${id}/pl`} /> : null}
    </>
  );
};

const DoorRig: React.FC<{id: GovId; seed: string; inkW: number}> = ({id, seed, inkW}) => {
  const g = PLAZA.gov[id];
  if (!g.door) return null;
  return (
    <>
      <FacadeDoor r={g.door} seed={`${seed}/${id}/door`} width={inkW} />
      {g.plaque ? <PlaqueSlot x={g.plaque[0]} y={g.plaque[1]} size={g.plaque[2]} seed={`${seed}/${id}/pq`} width={HAIR} /> : null}
      {g.lock ? <LockSlot x={g.lock[0]} y={g.lock[1]} w={g.lock[2]} h={g.lock[3]} seed={`${seed}/${id}/lk`} width={THIN * 0.7} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- pennants

const PENNANT_STYLE: {base: string; mark: string; kind: 'dot' | 'chevron' | 'stripe' | 'star'; dir: 1 | -1; ang: number}[] = [
  {base: palette.peach, mark: palette.ink, kind: 'dot', dir: 1, ang: -28},
  {base: palette.sage, mark: palette.cream, kind: 'chevron', dir: 1, ang: -34},
  {base: palette.sand, mark: palette.teal, kind: 'stripe', dir: -1, ang: -30},
  {base: palette.tealDark, mark: palette.cream, kind: 'star', dir: -1, ang: -22},
];

const Pennant: React.FC<{i: number; root: Pt; at?: number; up: boolean; waveAt?: number; seed: string}> = ({i, root, at, up, waveAt, seed}) => {
  const t = useTime();
  if (!up && (at === undefined || t < at)) return null;
  const st = PENNANT_STYLE[i];
  const L = 58; // pole length
  const a = (st.ang * Math.PI) / 180;
  const tip: Pt = [root[0] + st.dir * Math.cos(a) * L, root[1] + Math.sin(a) * L];
  // unfurl: scaleX 0 -> 1.06 -> 1 (out-cubic 0.18 s, settle 0.12 s)
  let k = 1;
  if (!up && at !== undefined) {
    const p1 = prog(t, at, 0.18, E.outCubic);
    k = p1 < 1 ? p1 * 1.06 : 1.06 - 0.06 * prog(t, at + 0.18, 0.12, E.inOutSine);
  }
  const wave = waveAt !== undefined && t >= waveAt && t < waveAt + 0.7 ? Math.sin(prog(t, waveAt, 0.7) * Math.PI * 2) * Math.exp(-2.5 * (t - waveAt)) : 0;
  const fw = 60 * k;
  const fh = 36;
  const dir = st.dir;
  // flag in pole-tip local coords (hangs from the pole tip, flying outward)
  const flagPts: Pt[] = [
    [0, 0],
    [dir * fw * 0.5, -3 + wave * 4],
    [dir * fw, 2 + wave * 6],
    [dir * fw * 0.96, fh * 0.5 + wave * 5],
    [dir * fw, fh - 2 + wave * 6],
    [dir * fw * 0.5, fh - 4 + wave * 4],
    [0, fh],
  ];
  const flag = smooth(flagPts, {closed: true, tension: 0.35});
  let mark: React.ReactNode = null;
  const cx = dir * fw * 0.5;
  const cy = fh * 0.5 + wave * 4;
  if (k > 0.5) {
    if (st.kind === 'dot') mark = <path d={blob(cx, cy, 6, 6, {seed: `${seed}/pd${i}`}) + blob(cx + dir * 15, cy - 6, 3.2, 3.2, {seed: `${seed}/pd2${i}`})} fill={st.mark} />;
    if (st.kind === 'chevron') mark = <path d={`M${cx - dir * 14} ${cy - 9}L${cx + dir * 4} ${cy}L${cx - dir * 14} ${cy + 9}`} fill="none" stroke={st.mark} strokeWidth={5} strokeLinejoin="round" />;
    if (st.kind === 'stripe') mark = <path d={rectPath(Math.min(cx - dir * 22, cx + dir * 22), cy - 5, 44 * k, 10)} fill={st.mark} />;
    if (st.kind === 'star') {
      const pts: Pt[] = [];
      for (let j = 0; j < 10; j++) {
        const rr = j % 2 ? 4.5 : 10;
        const aa = -Math.PI / 2 + (j * Math.PI) / 5;
        pts.push([cx + Math.cos(aa) * rr, cy + Math.sin(aa) * rr]);
      }
      mark = <path d={polyPath(pts)} fill={st.mark} />;
    }
  }
  return (
    <>
      <Ink d={line(root[0], root[1], tip[0], tip[1], {seed: `${seed}/pp${i}`, over: [0, 3]})} width={THIN} taper={false} />
      <XG m={mat.translate(tip[0], tip[1])}>
        <Fill d={flag} color={st.base} seed={`${seed}/pf${i}`} />
        {mark}
        <Ink d={flag} width={THIN} taper={false} seed={`${seed}/pi${i}`} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- the four buildings

type BProps = {ev: GovEvents; off: boolean; chrome: boolean; detail: 'wide' | 'close'; seed: string; windowSlot?: GovernmentPlazaProps['windowSlot']; k: number};

const GovA: React.FC<BProps> = ({ev, off, chrome, seed, windowSlot, k}) => (
  <>
    <LightsOut at={ev.offAt} on={off || undefined}>
      <Fill d={G.ped} color={palette.cream} seed={`${seed}/aped`} />
      <Fill d={G.tymp} color={palette.sand} offset={false} seed={`${seed}/atymp`} />
      <Fill rect={[-140, G.A.cornT, 412, G.A.cornB - G.A.cornT]} color={palette.tan} offset={false} seed={`${seed}/acorn`} />
      <Fill rect={[-130, G.A.cornB, 380, G.A.styl - G.A.cornB]} color={palette.cream} seed={`${seed}/afac`} />
      <Fill rect={[-130, G.A.friezeB, 375, G.A.styl - G.A.friezeB]} color={palette.sand} offset={false} seed={`${seed}/awall`} />
      <Fill rect={[-130, G.A.friezeB, 90, G.A.styl - G.A.friezeB]} color={palette.tan} offset={false} seed={`${seed}/ashade`} />
      <Fill d={G.colFill} color={palette.cream} seed={`${seed}/acol`} />
      <Fill d={G.colShade} color={palette.sand} offset={false} seed={`${seed}/acols`} />
      {G.steps.map((q, i) => (
        <Fill key={i} rect={q} color={i % 2 ? palette.sand : palette.cream} offset={false} seed={`${seed}/ast${i}`} />
      ))}
      <DoorRig id="govA" seed={seed} inkW={MID * k} />
    </LightsOut>
    <Ink d={G.aInk} width={MID * k} seed={`${seed}/aink`} />
    <Ink d={G.colInk + G.stepInk} width={MID * 0.85 * k} taper={false} seed={`${seed}/acolink`} />
    <Ink d={G.flutes} width={HAIR * k} taper={false} seed={`${seed}/aflute`} />
    <WindowRig k={k} id="govA" ev={ev} off={off} chrome={chrome} seed={seed} windowSlot={windowSlot} />
  </>
);

const GovB: React.FC<BProps> = ({ev, off, chrome, detail, seed, windowSlot, k}) => {
  const B = G.B;
  const close = detail === 'close';
  return (
    <>
      <LightsOut at={ev.offAt} on={off || undefined}>
        <Fill d={G.lantern} color={palette.cream} seed={`${seed}/blant`} />
        <Fill d={G.domeFill} color={palette.sand} seed={`${seed}/bdome`} />
        <Fill d={G.domeRim} color={palette.cream} offset={false} seed={`${seed}/brim`} />
        <Fill rect={B.drum} color={palette.cream} seed={`${seed}/bdrum`} />
        <Fill rect={[B.drum[0], B.drum[1], B.drum[2] * 0.22, B.drum[3]]} color={palette.sand} offset={false} seed={`${seed}/bdrums`} />
        <Fill rect={[B.x0 - 10, B.top, B.x1 - B.x0 + 20, 18]} color={palette.tan} offset={false} seed={`${seed}/bcorn`} />
        <Fill rect={[B.x0, B.top + 18, B.x1 - B.x0, B.base - B.top - 18]} color={palette.cream} seed={`${seed}/bfac`} />
        <Fill rect={[B.x0, B.top + 18, (B.x1 - B.x0) * 0.24, B.base - B.top - 18]} color={palette.sand} offset={false} seed={`${seed}/bshade`} />
        <Fill rect={[B.x0 - 22, B.base - 20, B.x1 - B.x0 + 44, 20]} color={palette.sand} offset={false} seed={`${seed}/bstep`} />
        <Fill d={polyPath([[326, 1066], [380, 1040], [434, 1066]])} color={palette.sand} offset={false} seed={`${seed}/bdped`} />
        {close ? <Fill d={drumSlits()} color={palette.tealDark} offset={false} seed={`${seed}/bslit`} /> : null}
        <DoorRig id="govB" seed={seed} inkW={MID * k} />
      </LightsOut>
      <Ink d={G.domeInk + G.lanternInk} width={MID * k} seed={`${seed}/bdomeink`} />
      <Ink d={G.ribs} width={THIN * k} taper={false} color={palette.teal} seed={`${seed}/bribs`} />
      <Ink d={G.bInk} width={MID * k} seed={`${seed}/bink`} />
      <Ink d={G.drumThin + (close ? stoneCourses(B.x0 + 14, B.x1 - 14, B.top + 30, B.base - 30, `${seed}/bsc`) + brickHints(B.x0 + 20, 1020, 200, 160, `${seed}/bbh`, 4, 18) : '')} width={HAIR * k} taper={false} seed={`${seed}/bthin`} />
      <WindowRig k={k} id="govB" ev={ev} off={off} chrome={chrome} seed={seed} windowSlot={windowSlot} />
      {/* window sill (Pip / snail perch in S11) */}
      <Ink d={line(262, 1013, 488, 1013, {seed: `${seed}/bsill`, over: [6, 6]}) + line(266, 1021, 484, 1021, {seed: `${seed}/bsill2`, over: [2, 2]})} width={MID * k} taper={false} />
    </>
  );
};

const drumSlits = () => {
  let d = '';
  for (let i = 0; i < 6; i++) d += rectPath(G.B.drum[0] + 30 + i * 30, G.B.drum[1] + 22, 8, 24);
  return d;
};
const stoneCourses = (x0: number, x1: number, y0: number, y1: number, seed: string) => {
  let d = '';
  for (let y = y0 + 34, i = 0; y < y1; y += 44, i++) {
    const r = rng(`${seed}/${i}`);
    let x = x0 + r.range(0, 30);
    while (x < x1) {
      const L = r.range(18, 40);
      // keep the window area clear
      if (!(y > 850 && y < 1030 && x + L > 262 && x < 488) && !(y > 1030 && x + L > 320 && x < 440)) d += `M${x.toFixed(1)} ${y.toFixed(1)}L${Math.min(x1, x + L).toFixed(1)} ${(y + r.jitter(0.6)).toFixed(1)}`;
      x += L + r.range(30, 70);
    }
  }
  return d;
};

const GovC: React.FC<BProps> = ({ev, off, chrome, seed, windowSlot, k}) => {
  const C = G.C;
  return (
    <>
      <LightsOut at={ev.offAt} on={off || undefined}>
        <Fill d={polyPath([[C.turret[0] - 6, C.turret[1]], [865, 610], [C.turret[0] + C.turret[2] + 6, C.turret[1]]])} color={palette.teal} seed={`${seed}/croof`} />
        <Fill rect={C.turret} color={palette.tan} seed={`${seed}/ctur`} />
        <Fill rect={[C.x0 - 6, C.corn, C.x1 - C.x0 + 12, 12]} color={palette.sand} offset={false} seed={`${seed}/ccorn`} />
        <Fill rect={[C.x0, C.corn + 12, C.x1 - C.x0, 200]} color={palette.tan} seed={`${seed}/cfac`} />
        <Fill rect={[C.x0, C.corn + 12, 40, 200]} color={palette.brown} offset={false} seed={`${seed}/cshade`} />
      </LightsOut>
      {/* the clock face stays white when the building goes dark (white is never stepped) */}
      <Fill d={blob(PLAZA.clock.x, PLAZA.clock.y, PLAZA.clock.r, PLAZA.clock.r, {seed: `${seed}/clk`})} color={palette.white} seed={`${seed}/clkf`} />
      <Ink d={circle(PLAZA.clock.x, PLAZA.clock.y, PLAZA.clock.r, {seed: `${seed}/clki`}) + `M865 650L865 632M865 650L878 656`} width={THIN * k} taper={false} />
      <Ink d={G.cInk} width={MID * k} seed={`${seed}/cink`} />
      <Ink d={brickHints(C.x0 + 10, C.corn + 20, C.x1 - C.x0 - 20, 30, `${seed}/cbh`, 3, 20) + brickHints(C.x0 + 8, 828, C.x1 - C.x0 - 16, 30, `${seed}/cbh2`, 2, 20)} width={THIN * k} taper={false} />
      <WindowRig k={k} id="govC" ev={ev} off={off} chrome={chrome} seed={seed} windowSlot={windowSlot} />
    </>
  );
};

const GovD: React.FC<BProps> = ({ev, off, chrome, seed, windowSlot, k}) => {
  const D = G.D;
  return (
    <>
      <LightsOut at={ev.offAt} on={off || undefined}>
        <Fill rect={[D.x0, D.roof, D.x1 - D.x0 + 40, D.base - D.roof]} color={palette.cream} seed={`${seed}/dfac`} />
        <Fill d={G.cells} color={palette.mintPale} offset={false} seed={`${seed}/dcell`} />
        <Fill d={G.cellsDark} color={palette.sage} offset={false} seed={`${seed}/dcelld`} />
        <Fill rect={[D.x0, D.roof, D.x1 - D.x0 + 40, D.fascia]} color={palette.tealDark} offset={false} seed={`${seed}/dfasc`} />
        <Fill rect={[D.x0, 1170, D.x1 - D.x0 + 40, D.base - 1170]} color={palette.sage} offset={false} seed={`${seed}/dground`} />
        <Fill d={G.pilotis} color={palette.mintPale} offset={false} seed={`${seed}/dpil`} />
        <DoorRig id="govD" seed={seed} inkW={MID * k} />
      </LightsOut>
      <Ink d={G.dInk} width={MID * k} seed={`${seed}/dink`} />
      <Ink d={G.gridInk} width={THIN * k} taper={false} seed={`${seed}/dgrid`} />
      <WindowRig k={k} id="govD" ev={ev} off={off} chrome={chrome} seed={seed} windowSlot={windowSlot} />
    </>
  );
};

// ---------------------------------------------------------------- layers

const FarCity: React.FC<{seed: string}> = ({seed}) => (
  <>
    <Fill d={G.farA} color={HAZE[1]} offset={false} seed={`${seed}/farA`} />
    <Fill d={G.farB} color={HAZE[0]} offset={false} seed={`${seed}/farB`} />
    <Fill d={G.farDots} color={HALF.daySky} offset={false} seed={`${seed}/farD`} />
    <Ink d={G.cranes} width={HAIR} taper={false} seed={`${seed}/cranes`} />
    <OnlyWhilePaper p={[630, 1000]}>
      <Ink d={G.farEdges} width={HAIR} taper={false} seed={`${seed}/farE`} />
    </OnlyWhilePaper>
  </>
);



const Ground: React.FC<{seed: string}> = ({seed}) => (
  <>
    <Fill rect={[-160, 1196, 1400, 900]} color={palette.mintPale} offset={false} seed={`${seed}/plaza`} />
    <Ink d={G.kerbs} width={THIN} seed={`${seed}/kerbs`} />
  </>
);

const LightLayer: React.FC<{seed: string}> = ({seed}) => (
  <>
    <Fill d={G.wedgeB} color={palette.sage} offset={false} mode="snap" seed={`${seed}/wedgeB`} />
    <Fill d={G.wedgeD} color={palette.sage} offset={false} mode="snap" seed={`${seed}/wedgeD`} />
    {/* the flat sun path: cream at a FIXED partial opacity (never animated) with dashed ink edges; light only exists in
        the coloured state, so the line-art frame shows just its edges */}
    <Fill d={G.pathFar} color={palette.mintPale} offset={false} mode="snap" seed={`${seed}/pathFar`} />
    <GroundMarks marks={G.ground} width={THIN} seed={`${seed}/gm`} />
    <SunPath seed={seed} />
    {G.benches.map((b, i) => (
      <React.Fragment key={i}>
        <Fill d={b.fill} color={palette.sand} seed={`${seed}/bench${i}`} />
        <Ink d={b.ink} width={THIN} taper={false} />
      </React.Fragment>
    ))}
  </>
);

const SunPath: React.FC<{seed: string}> = ({seed}) => (
  <>
    <LightOnly>
      <Fill d={G.pathPoly} color={palette.cream} opacity={0.82} offset={false} mode="snap" seed={`${seed}/path`} />
    </LightOnly>
    <Ink d={G.pathEdges} width={THIN} dash="10 9" seed={`${seed}/pathi`} />
  </>
);

/** Light (shafts, glows) exists only in the coloured state: hidden in the paper / line-art look. */
const LightOnly: React.FC<{children?: React.ReactNode}> = ({children}) => {
  // Fill already turns white in paper; we hide translucent light there entirely instead
  return <LookGate>{children}</LookGate>;
};
const LookGate: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const look = useLook();
  const t = useTime();
  if (look.fills !== 'color') return null;
  // under the opening cascade the light switches on once the colour wave has left the gap (1-frame pop, no fade)
  if (look.cascade && t < look.cascade.at + 0.12) return null;
  return <>{children}</>;
};

const Citizens: React.FC<{at?: number; phonesAt?: number; seed: string}> = ({at, phonesAt, seed}) => {
  const t = useTime();
  const phones = phonesAt !== undefined && t >= phonesAt;
  return (
    <>
      {PLAZA.citizens.map((c, i) => (
        <PaperUntilCascade key={i} p={[c.x, c.y - c.h / 2]}>
          <CitizenSlot x={c.x} y={c.y} h={c.h} silhouette={c.sil} riseAt={at === undefined ? undefined : at + i * 0.05} acc={phones && (i === 2 || i === 7) ? ['phone'] : undefined} seed={`${seed}/cit${i}`} />
        </PaperUntilCascade>
      ))}
    </>
  );
};

const Onlookers: React.FC<{seed: string}> = ({seed}) => (
  <>
    {PLAZA.onlookers.map((o, i) => (
      <OnlookerSlot
        key={i}
        x={o.head[0]}
        y={o.head[1]}
        head={60 * o.s * 1.05}
        hair={(['short', 'bun', 'cap'] as const)[i]}
        body={[palette.teal, palette.sand, palette.sage][i]}
        acc={i === 1 ? ['scarf'] : i === 2 ? ['collar'] : ['hood']}
        rim={i === 2 ? 'right' : 'left'}
        seed={`${seed}/onl${i}`}
      />
    ))}
  </>
);

const Near: React.FC<{lanternOffAt?: number; off: boolean; pigeonsAt?: number | boolean; pigeonsFlyAt?: number; bollard: boolean; onlookers: boolean; seed: string}> = ({lanternOffAt, off, pigeonsAt, pigeonsFlyAt, bollard, onlookers, seed}) => {
  const t = useTime();
  const lanternOff = off || (lanternOffAt !== undefined && t >= lanternOffAt);
  const pigeons = !off && (pigeonsAt === true || (typeof pigeonsAt === 'number' && t >= pigeonsAt));
  const sway = osc(t, 0.3, 1.2) * 0.6;
  return (
    <>
      {/* lamp post in front of govA (x 40-80) with a crossbar where 3 pigeons land */}
      <Fill d={G.lampFill} color={palette.tealDark} seed={`${seed}/lamp`} />
      <Fill rect={[44, 1068, 32, 36]} color={lanternOff ? palette.sand : palette.cream} offset={false} mode="snap" seed={`${seed}/lantern`} />
      <Ink d={G.lampInk} width={NEAR} seed={`${seed}/lampi`} />
      {pigeons
        ? PLAZA.pigeons.map((p, i) => (
            <Bird key={i} x={p[0]} y={p[1]} s={0.8} seed={`${seed}/pg${i}`} at={typeof pigeonsAt === 'number' ? pigeonsAt + i * 0.06 : undefined} flyAt={pigeonsFlyAt !== undefined ? pigeonsFlyAt + i * 0.05 : undefined} flyTo={[180 + i * 60, -340]} color={i === 1 ? palette.sand : palette.white} flip={i === 2} />
          ))
        : null}
      {/* foreground tree cropped at the right edge */}
      <Fill d={G.pit} color={palette.tan} offset={false} seed={`${seed}/pit`} />
      <XG m={mat.about(mat.rotate(sway), 1011, 1662)}>
        <Fill d={G.trunk} color={palette.brown} seed={`${seed}/trunk`} />
        <Ink d={G.trunkInk} width={NEAR} taper={false} />
        <Fill d={G.crownD} color={palette.sage} seed={`${seed}/crown`} />
        <Ink d={G.crownD} width={NEAR} open={0.12} seed={`${seed}/crowni`} />
        <Ink d={G.treeTicks} width={MID} taper={false} />
      </XG>
      {bollard ? <BollardSlot x={PLAZA.bollard.x} y={PLAZA.bollard.y} w={PLAZA.bollard.w} h={PLAZA.bollard.h} seed={`${seed}/bollard`} /> : null}
      {onlookers ? <Onlookers seed={seed} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- the set

export const GovernmentPlaza: React.FC<GovernmentPlazaProps> = ({
  state = 'built',
  cascadeAt,
  cascadeSpeed = 3300,
  gov = {},
  chrome,
  pennantsAt,
  pennantWaveAt,
  citizensAt,
  phonesAt,
  onlookers = true,
  foreground,
  lanternOffAt,
  pigeonsAt,
  pigeonsFlyAt,
  detail = 'wide',
  sun,
  bollard = true,
  bit = true,
  windowSlot,
  wrap = noWrap,
  x = 0,
  y = 0,
  scale = 1,
  outAt,
  outDur,
  seed = 'plaza',
}) => {
  const off = state === 'off';
  const lineArt = state === 'lineArt';
  const ch = chrome ?? !lineArt;
  const ev = (id: GovId): GovEvents => (lineArt ? {} : gov[id] ?? {});
  const pennantUp = pennantsAt === true || (pennantsAt === undefined && off);
  const pennantTimes = Array.isArray(pennantsAt) ? pennantsAt : [];
  const bp = {off, chrome: ch, detail, seed, windowSlot, k: detail === 'close' ? 0.7 : 1};
  const L = PLAZA.layers;

  const scene = (
    <>
      {sun ? wrap('sun', L.sun, sun) : null}
      {wrap('far', L.far, <FarCity seed={seed} />)}
      {wrap('ground', L.ground, <Ground seed={seed} />)}
      {wrap(
        'buildings',
        L.buildings,
        <>
          <GovC ev={ev('govC')} {...bp} />
          <GovA ev={ev('govA')} {...bp} />
          <GovB ev={ev('govB')} {...bp} />
          {bit ? <BitSlot x={PLAZA.bit[0]} y={PLAZA.bit[1]} size={16} seed={`${seed}/bit`} /> : null}
          {(pennantUp || pennantTimes.length) && !lineArt
            ? (['govA', 'govB', 'govC'] as GovId[]).map((id, i) => <Pennant key={id} i={i} root={PLAZA.gov[id].pennant} at={pennantTimes[i]} up={pennantUp} waveAt={pennantWaveAt} seed={seed} />)
            : null}
        </>,
      )}
      {wrap(
        'govD',
        L.govD,
        <>
          <GovD ev={ev('govD')} {...bp} />
          {(pennantUp || pennantTimes.length) && !lineArt ? <Pennant i={3} root={PLAZA.gov.govD.pennant} at={pennantTimes[3]} up={pennantUp} waveAt={pennantWaveAt} seed={seed} /> : null}
        </>,
      )}
      {wrap(
        'light',
        L.light,
        <>
          <LightLayer seed={seed} />
          {citizensAt !== false ? <Citizens at={lineArt || off ? undefined : citizensAt} phonesAt={lineArt ? undefined : phonesAt} seed={seed} /> : null}
        </>,
      )}
      {wrap(
        'near',
        L.near,
        <>
          <Near lanternOffAt={lanternOffAt} off={off} pigeonsAt={lineArt ? undefined : pigeonsAt} pigeonsFlyAt={pigeonsFlyAt} bollard={bollard} onlookers={onlookers} seed={seed} />
          <Foreground spec={foreground} seed={`${seed}/fg`} />
        </>,
      )}
    </>
  );
  const looked = lineArt ? (
    <Look fills="paper">{scene}</Look>
  ) : cascadeAt !== undefined ? (
    <Look cascade={{at: cascadeAt, origin: PLAZA.cascadeOrigin, speed: cascadeSpeed}}>{scene}</Look>
  ) : (
    scene
  );
  return (
    <SetPlace x={x} y={y} scale={scale} outAt={outAt} outDur={outDur}>
      {looked}
    </SetPlace>
  );
};

/** S11 framing helper: the camera centre / zoom that frames govB's window as the storyboard measures it. */
export const plazaCloseup = PLAZA.closeup;

/** The REST layout: S01's opening frame and S11's ending frame (camera at rest, sun slot, Pip, Bit). Frame 0 =
 *  <GovernmentPlaza state="lineArt"/> with the sun mid-rise at sunFrame0; S11's hard cut = state "off". */
export const PLAZA_REST = {camera: {x: 540, y: 960, zoom: 1}, sun: PLAZA.sun, sunFrame0: {x: 630, y: 850, r: 150}, pip: PLAZA.pip, bit: PLAZA.bit, bollard: PLAZA.bollard} as const;
