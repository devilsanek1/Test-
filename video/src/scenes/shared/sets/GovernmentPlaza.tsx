// GovernmentPlaza — S1 (S01 hook, S11 close-up + hard cut, S13 un-build underlay = frame 0). PEAK 1.
//
// Four monumental government buildings ("four countries") around a narrow gap where the low sun sits. PEAK-1 layout
// (review 5): ~1.35x taller under the same y-600 ceiling, bases y 1400-1470, horizon / VP (720, 1384) = 0.72 H:
//   govA Columned Hall (x -40..400: the FULL order, 2 column pairs, window + door in the wide central bay, 3 steps)
//   govB Domed Capitol (x 396..640, lantern tip 600, tall drum; the hero: window 414,970,208,146, lock box (543,1318) 22x27)
//   govC Clock Tower (x 800..1000, behind govD; white clock face r26 at (870,670) that stays white when dark)
//   govD Modern Ministry (x 790..1240, roof 880, base 1470, cut by the right edge): the nearest, biggest mass
// + the far city in the gap (kit v3b: fill-only civic silhouettes in 3 depth tiers on a horizon line at y 1166, the
// plaza's far steps below it), the plaza (one flat mintPale field with a few broken paving lines + specks, ONE sage
// shade wedge from govA's side; ground="sage" = the old two wedges), the flat cream sun path, a lamp post at the left edge with a crossbar
// and 3 pigeons, a foreground tree in a tree pit, Pip's bollard (812,1426), 4 abstract pennants, 6 readable 55-75 px
// citizens on the VP axis + 4 far ones, an onlooker cropped by the left edge INSIDE the visible band and 2 heads in the
// bottom corners. World coordinates = S01 camera rest. docs/SHARED_SETS.md section 8 lists the anchors this moved.
//
//   <GovernmentPlaza state="built" cascadeAt={0.03} sun={<Sun .../>}
//     gov={{govA: {chromeAt: 0.54, screenOnAt: 0.9, shutterAt: 2.4, offAt: 2.4, tagAt: 3.4, padlockAt: 3.64}, ...}}
//     pennantsAt={[1.23, 1.38, 1.53, 1.68]} citizensAt={1.06} lanternOffAt={3.25} pigeonsAt={1.7} pigeonsFlyAt={3.3} />
//   <GovernmentPlaza state="lineArt" />      // frame 0 / the S13 un-build underlay (ink on white, white tombstones,
//                                            // ink-only browser chrome; chrome={false} = plain windows)
//   <GovernmentPlaza state="off" />          // the S01 end state (S11 hard cut): shutters down, padlocked, tagged, dark
//   <GovernmentPlaza detail="close" ... />   // S11 govB close-up (PLAZA.closeup: zoom 1.6 on (518,826)): stone detail
//   wrap={(name, nearness, node) => <Layer depth={1 - nearness}>{node}</Layer>}   // multiplane split
//
// The three states share every path and seed, so the geometry is pixel-identical across them. Every event time is a
// prop (scene seconds); omit an event = it never happens (the 'off' state = every switch-off already happened).

import React from 'react';
import {palette} from '../../../lib/theme';
import {clamp, ease as E, osc, prog, TimeProvider, TimeShift, useTime} from '../../../lib/time';
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
import type {BackSoonTagProps, ShutterPadlockProps} from './propSlots';
import {FacadeDoor} from './SiteFacade';

// ---------------------------------------------------------------- layout (anchors for scenes)

export type GovId = 'govA' | 'govB' | 'govC' | 'govD';
type R4 = [number, number, number, number];

/** Far civic skyline in the sun gap (storyboard v3 `farCivic`, kit v3b layout): six fill-only silhouettes (domes,
 *  pediments, clock spires) in THREE depth tiers that shrink with distance, standing on the far city's horizon line
 *  (`PLAZA.civicBase`, world y 1166) at the top of the plaza's far steps. Listed LEFT TO RIGHT (the order `civicOffAt`
 *  steps them dark; `civicOnAt` relights them right to left). `depth` 0 = back (smallest, lightest), 1 = mid, 2 = near
 *  (biggest); each owns the stretch `band` [x0, x1] of its depth's low roofline band (`PLAZA.civicBands[depth]`), so a
 *  whole tier steps dark with its two silhouettes. `tier` = the v3 colour family (0 far, 1 nearer), kept for old readers.
 *  `top` = the silhouette's highest point (all under the power glyph's lower edge, y 957). */
export const PLAZA_CIVIC = [
  {id: 'templeM', kind: 'temple', tier: 1, depth: 1, x0: 624, x1: 672, top: 1030, cx: 648, band: [590, 692]},
  {id: 'domeF', kind: 'dome', tier: 1, depth: 2, x0: 640, x1: 704, top: 1036, cx: 672, lantern: true, band: [590, 716]},
  {id: 'spireB', kind: 'spire', tier: 0, depth: 0, x0: 680, x1: 700, top: 966, cx: 690, band: [590, 720]},
  {id: 'spireM', kind: 'spire', tier: 1, depth: 1, x0: 700, x1: 730, top: 996, cx: 715, band: [692, 840]},
  {id: 'domeB', kind: 'dome', tier: 0, depth: 0, x0: 728, x1: 762, top: 982, cx: 745, lantern: true, band: [720, 840]},
  {id: 'templeF', kind: 'temple', tier: 1, depth: 2, x0: 728, x1: 788, top: 1060, cx: 758, band: [716, 840]},
] as const;

/** PEAK-1 layout (review 5): the architecture is ~1.35x taller than storyboard v1 (bases y 1400-1470 instead of
 *  1200-1290) under the same y-600 ceiling, the horizon / VP sits low (0.72 H) so the tiny citizens stand at the feet of
 *  colossal facades, and govD is the nearest, biggest mass running off the right edge. */
export const PLAZA = {
  vp: [720, 1384] as Pt,
  /** Horizon (eye level of the plaza camera): far city base, readable citizens' heads just under it. */
  horizon: 1384,
  /** Sun slot (S01 rest): centre (720, 900) r155, in the gap between govB and govD (its glyph clear of both flanks,
   *  its lower quarter behind the far city); frame 0 mid-rise at (720, 950). */
  sun: {x: 720, y: 900, r: 155},
  /** Fill-cascade origin (the sun gap). */
  cascadeOrigin: [720, 1000] as Pt,
  /** Pip's bollard at the foot of the sun path (y = TOP = Pip's feet). */
  bollard: {x: 812, y: 1426, w: 50, h: 90},
  /** Pip's feet on the bollard. */
  pip: [812, 1426] as Pt,
  /** Bit on govA's cornice band (size 22 in the wide shot). */
  bit: [262, 742] as Pt,
  bitSize: 22,
  lamp: {x: 50, lantern: [50, 1066] as Pt, barY: 1126, bar: [-10, 164] as [number, number], top: 1036},
  pigeons: [[84, 1126], [118, 1126], [148, 1126]] as Pt[],
  /** Citizens: 6 READABLE back-view figures 55-75 px on the VP axis (feet y 1452-1494, heads just under the horizon),
   *  plus 4 x ~40 px FAR texture on govA's / govB's steps and deep in the gap. sil = flat sage cut-out (far). */
  citizens: [
    {x: 600, y: 1470, h: 64, sil: false},
    {x: 660, y: 1452, h: 56, sil: false},
    {x: 706, y: 1486, h: 72, sil: false},
    {x: 742, y: 1458, h: 58, sil: false},
    {x: 548, y: 1494, h: 75, sil: false},
    {x: 880, y: 1492, h: 70, sil: false},
    {x: 232, y: 1452, h: 42, sil: false},
    {x: 318, y: 1446, h: 38, sil: false},
    {x: 694, y: 1418, h: 36, sil: true},
    {x: 760, y: 1424, h: 40, sil: true},
  ],
  /** Indices of the two citizens that raise phones. */
  phoneIdx: [2, 5],
  /** Back-view onlookers: [0] is cropped by the LEFT edge INSIDE the visible band (head y 1450: the near layer a phone
   *  still shows); [1], [2] are heads + shoulders in the bottom corners (under the platform UI: framing only). */
  onlookers: [
    {head: [52, 1452] as Pt, s: 1.28},
    {head: [236, 1818] as Pt, s: 1.38},
    {head: [1010, 1765] as Pt, s: 1.34},
  ],
  /** Per building: window / door rects, the shutter padlock (body centre) and the tag hang point on the shutter rail
   *  (storyboard v3: spaced so the LETTERED 'back soon' tag (64-84 px wide, govB >= 80) clears the padlock; all at
   *  x <= 930), the pennant root, the door lock box and plaque. */
  gov: {
    govA: {window: [118, 906, 144, 108] as R4, door: [148, 1228, 84, 164] as R4, padlock: [190, 1019] as Pt, tag: [246, 1009] as Pt, pennant: [392, 760] as Pt, lock: [218, 1312, 14, 18] as R4, plaque: [126, 1292, 26] as [number, number, number]},
    govB: {window: [414, 970, 208, 146] as R4, door: [478, 1236, 82, 166] as R4, padlock: [488, 1121] as Pt, tag: [566, 1111] as Pt, pennant: [612, 820] as Pt, lock: [543, 1318, 22, 27] as R4, plaque: [454, 1300, 28] as [number, number, number]},
    govC: {window: [812, 734, 132, 106] as R4, door: null as R4 | null, padlock: [904, 845] as Pt, tag: [846, 835] as Pt, pennant: [800, 722] as Pt, lock: null as R4 | null, plaque: null as [number, number, number] | null},
    govD: {window: [800, 1004, 146, 124] as R4, door: [992, 1300, 96, 170] as R4, padlock: [900, 1133] as Pt, tag: [840, 1123] as Pt, pennant: [798, 990] as Pt, lock: [1068, 1392, 15, 19] as R4, plaque: [972, 1352, 24] as [number, number, number]},
  },
  /** govC's clock face. */
  clock: {x: 870, y: 670, r: 26},
  /** S11 framing: camera (518, 826) zoom 1.6 (govB's lantern lands at screen y >= 603, the window fills screen
   *  x 374-707, y 1191-1425); govB window sill (Pip, snail) at world y 1122. */
  closeup: {cam: [518, 826] as Pt, zoom: 1.6, sill: 1122},
  /** The S01 -> S02 dive: camera that puts govB's 22 x 27 lock box at screen (560, 1090) at 52 x 65 px. */
  dive: {cam: [535, 1264] as Pt, zoom: 2.4},
  /** Layer nearness (storyboard depths). */
  layers: {far: 0.1, sun: 0.12, buildings: 0.55, govD: 0.62, ground: 0.7, light: 0.7, near: 1.0},
  /** Storyboard v3: the far civic silhouettes (left to right), see PLAZA_CIVIC. */
  civic: PLAZA_CIVIC,
  /** Kit v3b: the far city ends on this horizon line (the top of the plaza's far steps); below it, in the gap, the far
   *  steps (3 flights shrinking with distance, cream / half-sand) run down to the plaza horizon (1384). */
  civicBase: 1166,
  /** Top of each depth's low roofline band (back, mid, near): each tier shows a ~35 px strip over the one in front. */
  civicBands: [1058, 1092, 1126] as readonly number[],
  /** Storyboard v3 frame 0 (= S12's last frame): the sun at the bottom of its SunPress (0.88) in its rest slot. */
  frame0: {sun: {x: 720, y: 900, r: 155}, press: 0.88},
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
  // ---- storyboard v3 (S01 power-off wave, S12 rewind). Reversed events are stepped like a tape (set `rewindFps`).
  /** The browser screen powers off like a CRT: lit -> bright horizontal line -> dot -> dark (0.15 s). The building
   *  itself stays lit (`offAt` steps it darker). From a held line (`screenLineAt`) it continues from the line. */
  screenOffAt?: number;
  /** From here the screen IS the bright horizontal line (the frame-0 state: govB mid power-off). From a dark screen it
   *  steps back dot -> line (rewind-stepped). */
  screenLineAt?: number;
  /** The roller shutter rolls back UP: the slam reversed, stepped (S12 rewind). */
  liftAt?: number;
  /** Duration of the reversed slam (default 0.25 s). */
  liftDur?: number;
  /** Lights back on: the building pops one palette step lighter again (undoes `offAt`). */
  onAt?: number;
  /** The shutter drops only this fraction of the window (govC: 0.5; default 1). The padlock and tag ride its rail. */
  shutterStop?: number;
  /** Alias of `shutterStop` (a FRACTION, like props RollerShutter `stopAt`). */
  stopAt?: number;
  /** The tag swings back up and pops off (S12 rewind, stepped). */
  tagOutAt?: number;
  /** The padlock pops off (S12 rewind). */
  padlockOutAt?: number;
  /** govB's dome lantern: cream -> sand ('purpose') and back on (the rewind). Omit both = it follows offAt / onAt. */
  lanternOffAt?: number;
  lanternOnAt?: number;
  /** Extra props for the props-lane tag / padlock (e.g. the lettered 'back soon' variant once it lands). */
  tagProps?: Partial<BackSoonTagProps>;
  padlockProps?: Partial<ShutterPadlockProps>;
};

/** 'frame0' (storyboard v3) = 'built' with govB's screen held as the bright horizontal line (mid power-off; pass
 *  gov.govB.screenOffAt to release it), every other screen lit, no shutters: frame 0 = S12's last frame. */
export type PlazaState = 'lineArt' | 'built' | 'off' | 'frame0';

/** The plaza floor: 'light' (kit v3b default) or the review-5 'sage' wedges. */
export type PlazaGround = 'light' | 'sage';

export type GovernmentPlazaProps = {
  state?: PlazaState;
  /** 'built': the colour cascade from the sun gap (paper until the wave reaches each fill). Omit = in colour. */
  cascadeAt?: number;
  cascadeSpeed?: number;
  gov?: Partial<Record<GovId, GovEvents>>;
  /** Browser chrome in the windows (default: true in every state; in lineArt it is ink-only: bar outline, dot rings,
   *  pill). Pass false for plain windows (storyboard v1's line-art frame). */
  chrome?: boolean;
  /** Pennants: unfurl times [govA, govB, govC, govD] (scaleX 0 -> 1, 6 % overshoot); true = up; default: up only in 'off'. */
  pennantsAt?: number[] | boolean;
  /** One wave of every pennant (S11). */
  pennantWaveAt?: number;
  /** Citizens rise in (0.33 s out-exp, 0.05 s stagger, left to right). Omit = standing. false = none. */
  citizensAt?: number | false;
  /** Two citizens raise phones (one time or several). */
  phonesAt?: number | number[];
  /** ...and lower them again (the latest raise / lower event wins). */
  phonesDownAt?: number | number[];
  /** The edge onlookers (one in the visible band at the left edge, two cropped in the bottom corners). Default true. */
  onlookers?: boolean;
  /** Extra foreground framing (ground.tsx presets, a list, or a node). Default none: the plaza frames itself (lamp
   *  post, tree, bollard, the edge onlookers). */
  foreground?: ForegroundSpec;
  /** Lamp lantern cream -> sand. */
  lanternOffAt?: number;
  /** Lamp lantern relights (S12 rewind). */
  lanternOnAt?: number;
  /** The plaza floor (kit v3b): 'light' (default) = the mintPale plaza with ONE sage shade wedge from govA's side
   *  (~27 % of the visible plaza) and the cream sun path, so the teal / dark figures stand on a LIGHT ground; 'sage' =
   *  the review-5 look (two sage wedges from govB's and govD's sides, ~60 % of the plaza). */
  ground?: PlazaGround;
  /** Storyboard v3 far civic skyline in the sun gap (PLAZA_CIVIC: domes, pediments, clock spires as whole fill-only
   *  silhouettes) instead of the generic block city with window dots and cranes. Default true. */
  farCivic?: boolean;
  /** The civic silhouettes step one fill darker as WHOLE shapes: one time = left to right, 0.06 s apart; an array =
   *  per silhouette, left to right (PLAZA_CIVIC order). 'off' state: dark from the start. */
  civicOffAt?: number | number[];
  /** ...and relight (S12 rewind): one time = right to left, 0.06 s apart; an array = per silhouette (left to right). */
  civicOnAt?: number | number[];
  /** Two far domes' lit lanterns pop off (0.06 s apart); they relight with their dome's civicOnAt. */
  civicLanternsOffAt?: number;
  /** Steps per second of the reversed (rewind) events: liftAt, screenOnAt after an off, screenLineAt from dark, tagOutAt. */
  rewindFps?: number;
  /** Seconds added to the clock of the idle-only pieces (Bit's idle, the tree sway, the edge onlookers' breathing). The
   *  loop seam: S12 passes -(its duration) so its last frame idles exactly like S01's frame 0. Default 0. */
  idleOffset?: number;
  /** Pigeons land on the crossbar / scatter. Omit landing = absent (default), true = sitting. */
  pigeonsAt?: number | boolean;
  pigeonsFlyAt?: number;
  /** 'close' adds stone courses, drum windows and finer dome ribs (S11 close-up). */
  detail?: 'wide' | 'close';
  /** The sun (scene-owned) is drawn here: behind the far city and every building. */
  sun?: React.ReactNode;
  /** Bollard (Pip's perch). Default true. */
  bollard?: boolean;
  /** Bit idling on govA's cornice (frame 0 / last frame). Default true; false when the scene animates him. */
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
/** govD is the nearest building: a heavier mid ink. */
const NEARMID = 4.0;

// ---------------------------------------------------------------- geometry (module-level, computed once)

const G = (() => {
  const s = 'gp';
  const HZ = PLAZA.horizon;
  // ---- govA: columned hall, the FULL order: pediment, entablature, 2 pairs of colossal columns (y 806-1392) with the
  // browser window and the door in the wide central bay, stylobate, 3 steps
  const A = {x0: -40, x1: 400, apex: [180, 614] as Pt, pedL: -64, pedR: 424, cornT: 712, cornB: 748, friezeB: 794, colTop: 806, colBot: 1392, styl: 1404, base: 1462};
  const colsA = [28, 82, 298, 352];
  const CW = 46;
  const ped = polyPath([[A.pedL, A.cornT], A.apex, [A.pedR, A.cornT]]);
  const tymp = polyPath([[A.pedL + 44, A.cornT - 8], [A.apex[0], A.apex[1] + 20], [A.pedR - 44, A.cornT - 8]]);
  const aInk =
    line(A.pedL - 14, A.cornT + 4, A.apex[0], A.apex[1], {seed: `${s}/ar1`, over: [30, 6]}) +
    line(A.apex[0], A.apex[1], A.pedR + 14, A.cornT + 4, {seed: `${s}/ar2`, over: [6, 30]}) +
    line(A.pedL + 44, A.cornT - 8, A.apex[0], A.apex[1] + 20, {seed: `${s}/ar3`, over: [2, 2]}) +
    line(A.apex[0], A.apex[1] + 20, A.pedR - 44, A.cornT - 8, {seed: `${s}/ar4`, over: [2, 2]}) +
    cornice(A.pedL - 10, A.pedR + 6, A.cornT, A.cornB - A.cornT, `${s}/ac`, 34) +
    line(A.x0 - 10, A.friezeB, A.x1 + 12, A.friezeB, {seed: `${s}/af`, over: [10, 14]}) +
    line(A.x0 - 6, 772, A.x1 + 8, 772, {seed: `${s}/af2`, over: [4, 8]}) +
    vline(A.x1, A.cornB, A.styl, {seed: `${s}/aR`, over: [0, 4]}) +
    vline(A.x1 - 8, A.friezeB, A.styl, {seed: `${s}/aR2`, over: [0, 0]});
  let colInk = '';
  let colFill = '';
  let colShade = '';
  let flutes = '';
  for (const cx of colsA) {
    const w = CW;
    colFill += rectPath(cx - w / 2, A.colTop, w, A.colBot - A.colTop);
    colShade += rectPath(cx - w / 2, A.colTop, w * 0.3, A.colBot - A.colTop);
    // capital (abacus + echinus) and base (plinth)
    colFill += rectPath(cx - 30, A.friezeB, 60, A.colTop - A.friezeB) + rectPath(cx - 27, A.colBot, 54, A.styl - A.colBot);
    colInk +=
      line(cx - w / 2, A.colTop, cx - w / 2, A.colBot, {seed: `${s}/cl${cx}`, over: [0, 0]}) +
      line(cx + w / 2, A.colTop, cx + w / 2, A.colBot, {seed: `${s}/cr${cx}`, over: [0, 0]}) +
      line(cx - 32, A.friezeB + 1, cx + 32, A.friezeB + 1, {seed: `${s}/cc${cx}`, over: [2, 2]}) +
      line(cx - 26, A.colTop, cx + 26, A.colTop, {seed: `${s}/cd${cx}`, over: [1, 1]}) +
      line(cx - 28, A.colBot, cx + 28, A.colBot, {seed: `${s}/cb${cx}`, over: [1, 1]});
    // ONE flute per column (right of centre, clear of the shade strip), a long pen stroke with its natural breaks:
    // 3 parallel flutes + the 2 column edges + the shade edge read as a barcode in S01's 3x dive
    flutes += line(cx + 7, A.colTop + 34, cx + 7, A.colBot - 46, {seed: `${s}/fl${cx}`, over: 0});
  }
  // the 3-step crepidoma, each step wider than the one above
  const steps = [0, 1, 2].map((i) => [A.x0 - 20 - i * 14, A.styl + i * 19, A.x1 - A.x0 + 40 + i * 28, 19] as R4);
  let stepInk = line(A.x0 - 8, A.styl, A.x1 + 8, A.styl, {seed: `${s}/sty`, over: [6, 6]});
  steps.forEach((q, i) => (stepInk += line(q[0], q[1] + q[3], q[0] + q[2], q[1] + q[3], {seed: `${s}/st${i}`, over: [6, 12]})));
  // ---- govB: domed capitol with a TALL drum (792-904) and a 3-step base; lantern tip on the ceiling (y 600)
  const B = {x0: 396, x1: 640, cx: 518, top: 904, cornB: 926, base: 1402, drum: [424, 792, 188, 112] as R4, dome: {cx: 518, by: 792, rx: 90, ry: 140}, lantern: [508, 612, 20, 40] as R4};
  const domeFill = `M${B.dome.cx - B.dome.rx} ${B.dome.by}A${B.dome.rx} ${B.dome.ry} 0 0 1 ${B.dome.cx + B.dome.rx} ${B.dome.by}Z`;
  const domeInk = arc(B.dome.cx, B.dome.by, B.dome.rx, B.dome.ry, 180, 360, {seed: `${s}/dm`, wobble: 0.01}) + line(B.dome.cx - B.dome.rx - 12, B.dome.by, B.dome.cx + B.dome.rx + 12, B.dome.by, {seed: `${s}/db`, over: [4, 4]});
  let ribs = '';
  for (const u of [-0.64, -0.28, 0.1, 0.46]) {
    const xb = B.dome.cx + u * B.dome.rx;
    ribs += `M${xb.toFixed(1)} ${B.dome.by}Q${(B.dome.cx + u * B.dome.rx * 0.55).toFixed(1)} ${B.dome.by - B.dome.ry * 0.85} ${B.dome.cx} ${B.dome.by - B.dome.ry + 2}`;
  }
  // cream rim strip inside the dome outline, sun side (right)
  const rimPts: Pt[] = [];
  for (let a = 290; a <= 360; a += 7) rimPts.push([B.dome.cx + Math.cos((a * Math.PI) / 180) * (B.dome.rx - 1), B.dome.by + Math.sin((a * Math.PI) / 180) * (B.dome.ry - 1)]);
  for (let a = 360; a >= 290; a -= 7) rimPts.push([B.dome.cx + Math.cos((a * Math.PI) / 180) * (B.dome.rx - 10), B.dome.by + Math.sin((a * Math.PI) / 180) * (B.dome.ry - 10)]);
  const domeRim = polyPath(rimPts);
  const lantern = rectPath(B.lantern[0], B.lantern[1], B.lantern[2], B.lantern[3]) + polyPath([[B.lantern[0] - 3, B.lantern[1]], [B.cx, 600], [B.lantern[0] + B.lantern[2] + 3, B.lantern[1]]]);
  const lanternInk = rect(B.lantern[0], B.lantern[1], B.lantern[2], B.lantern[3], {seed: `${s}/ln`, over: 'small'}) + line(B.lantern[0] - 4, B.lantern[1], B.cx, 600, {seed: `${s}/lt1`, over: [1, 1]}) + line(B.cx, 600, B.lantern[0] + B.lantern[2] + 4, B.lantern[1], {seed: `${s}/lt2`, over: [1, 1]});
  const bSteps = [0, 1, 2].map((i) => [B.x0 - 14 - i * 12, B.base + i * 16, B.x1 - B.x0 + 28 + i * 24, 16] as R4);
  let bInk =
    cornice(B.drum[0], B.drum[0] + B.drum[2], B.drum[1], 12, `${s}/bdc`, 12) +
    line(B.drum[0], B.drum[1], B.drum[0], B.top, {seed: `${s}/bd1`, over: [0, 2]}) +
    line(B.drum[0] + B.drum[2], B.drum[1], B.drum[0] + B.drum[2], B.top, {seed: `${s}/bd2`, over: [0, 2]}) +
    cornice(B.x0, B.x1, B.top, B.cornB - B.top, `${s}/bc`, 24) +
    line(B.x0, B.top, B.x0, B.base, {seed: `${s}/bl`, over: [0, 6]}) +
    line(B.x1, B.top, B.x1, B.base, {seed: `${s}/br`, over: [0, 6]}) +
    line(B.x0 + 14, B.cornB, B.x0 + 14, B.base - 4, {seed: `${s}/bp1`, over: 0}) +
    line(B.x1 - 14, B.cornB, B.x1 - 14, B.base - 4, {seed: `${s}/bp2`, over: 0}) +
    line(B.x0 - 8, B.base, B.x1 + 8, B.base, {seed: `${s}/bs0`, over: [4, 8]}) +
    // small pediment over the door
    line(464, 1222, 519, 1194, {seed: `${s}/bdp1`, over: [4, 1]}) +
    line(519, 1194, 574, 1222, {seed: `${s}/bdp2`, over: [1, 4]}) +
    line(460, 1222, 578, 1222, {seed: `${s}/bdp3`, over: [3, 3]});
  bSteps.forEach((q, i) => (bInk += line(q[0], q[1] + q[3], q[0] + q[2], q[1] + q[3], {seed: `${s}/bs${i + 1}`, over: [6, 10]})));
  let drumThin = '';
  for (let i = 0; i < 6; i++) {
    const x = B.drum[0] + 22 + i * 29;
    drumThin += line(x, B.drum[1] + 22, x, B.top - 6, {seed: `${s}/dt${i}`, over: 0});
  }
  // ---- govC: clock tower (behind govD)
  const C = {x0: 800, x1: 1000, corn: 700, turret: [835, 640, 70, 60] as R4};
  const cInk =
    line(C.x0, C.corn + 12, C.x0, 900, {seed: `${s}/cl`, over: [0, 0]}) +
    line(C.x1, C.corn + 12, C.x1, 900, {seed: `${s}/cr`, over: [0, 0]}) +
    cornice(C.x0 - 6, C.x1 + 6, C.corn, 12, `${s}/cc`, 12) +
    rect(C.turret[0], C.turret[1], C.turret[2], C.turret[3], {seed: `${s}/ct`, edges: 'lr', over: 'small'}) +
    line(C.turret[0] - 6, C.turret[1], 870, 606, {seed: `${s}/cs1`, over: [1, 0]}) +
    line(870, 606, C.turret[0] + C.turret[2] + 6, C.turret[1], {seed: `${s}/cs2`, over: [0, 1]}) +
    line(C.turret[0] - 8, C.turret[1] + 1, C.turret[0] + C.turret[2] + 8, C.turret[1] + 1, {seed: `${s}/cs3`, over: [1, 1]});
  // ---- govD: modern ministry, the NEAREST mass (roof 880, base 1470), cut by the right edge
  const D = {x0: 790, x1: 1240, roof: 880, fascia: 30, base: 1470, ground: 1380};
  let gridInk = '';
  let cells = '';
  let cellsDark = '';
  const r = rng(`${s}/dg`);
  const colsX: number[] = [];
  for (let x = D.x0 + 6; x < D.x1; x += 68) colsX.push(x);
  const rowsY = [D.roof + D.fascia, 1000, 1094, 1188, 1282, D.ground];
  const winA = PLAZA.gov.govD.window;
  for (let i = 0; i < colsX.length - 1; i++) {
    for (let j = 0; j < rowsY.length - 1; j++) {
      const x = colsX[i] + 6;
      const y = rowsY[j] + 6;
      const w = colsX[i + 1] - colsX[i] - 12;
      const h = rowsY[j + 1] - rowsY[j] - 12;
      // the browser window occupies its rect: skip those cells
      if (x + w > winA[0] - 12 && x < winA[0] + winA[2] + 12 && y + h > winA[1] - 14 && y < winA[1] + winA[3] + 14) continue;
      if (r.chance(0.36)) cellsDark += rectPath(x, y, w, h);
      else cells += rectPath(x, y, w, h);
    }
  }
  for (const x of colsX) if (!(x > winA[0] - 6 && x < winA[0] + winA[2] + 6)) gridInk += line(x, D.roof + D.fascia, x, D.ground, {seed: `${s}/gx${x}`, over: [0, 2], breaks: false});
  for (const y of rowsY.slice(1, -1)) gridInk += line(D.x0, y, D.x1 + 20, y, {seed: `${s}/gy${y}`, over: [0, 0]});
  const dInk =
    line(D.x0, D.roof, D.x0, D.base, {seed: `${s}/dl`, over: [4, 4]}) +
    line(D.x0 - 16, D.roof, D.x1 + 40, D.roof, {seed: `${s}/dr`, over: [10, 0]}) +
    line(D.x0 - 8, D.roof + D.fascia, D.x1 + 40, D.roof + D.fascia, {seed: `${s}/df`, over: [4, 0]}) +
    line(D.x0 - 18, D.ground, D.x1 + 40, D.ground, {seed: `${s}/dg`, over: [8, 0]}) +
    line(D.x0 - 34, D.base, D.x1 + 40, D.base, {seed: `${s}/db`, over: [12, 0]});
  let pilotis = '';
  for (let x = 830; x < 1240; x += 120) if (x < 970 || x > 1100) pilotis += rectPath(x, D.ground, 16, D.base - D.ground);
  // ---- far city band in the gap (fill-only), sitting on the horizon
  const fr = rng(`${s}/far`);
  let farA = '';
  let farB = '';
  let farDots = '';
  let farEdges = '';
  // two haze tiers on the day ladder (style_bible_ref2 8): a back skyline (#98C0AE, tops 968-1050, behind the sun's
  // lower edge) and a front tier of blocks (#84B09C, tops 1150-1300); both fill-only, back-filled down to the horizon
  const gx0 = 600;
  const gx1 = 820;
  farA += rectPath(gx0, 1050, gx1 - gx0, HZ + 4 - 1050);
  for (let x = gx0; x < gx1; ) {
    const w = fr.range(18, 34);
    const top = fr.range(968, 1050);
    farA += rectPath(x, top, w + 0.5, HZ + 4 - top);
    farEdges += `M${x.toFixed(1)} ${HZ}L${x.toFixed(1)} ${top.toFixed(1)}L${(x + w).toFixed(1)} ${top.toFixed(1)}`;
    for (let yy = top + 9; yy < 1130; yy += 13) for (let xx = x + 4; xx < x + w - 4; xx += 8) if (fr.chance(0.18)) farDots += rectPath(xx, yy, 3, 4);
    x += w;
  }
  for (let x = gx0 + 4; x < gx1 - 4; ) {
    const w = fr.range(16, 30);
    const top = fr.range(1150, 1300);
    if (fr.chance(0.8)) {
      farB += rectPath(x, top, w, HZ + 4 - top);
      for (let yy = top + 8; yy < HZ - 16; yy += 12) for (let xx = x + 4; xx < x + w - 4; xx += 8) if (fr.chance(0.25)) farDots += rectPath(xx, yy, 3, 4);
    }
    x += w + fr.range(0, 6);
  }
  const cranes =
    // crane 1 (left of the gap): mast, jib, counter-jib, hook
    line(662, 1140, 662, 1000, {seed: `${s}/k1a`, over: 0}) + line(669, 1140, 669, 1000, {seed: `${s}/k1b`, over: 0}) +
    `M662 1130L669 1116L662 1102L669 1088L662 1074L669 1060L662 1046L669 1032L662 1018L669 1004` +
    line(624, 1004, 736, 1004, {seed: `${s}/k1j`, over: [0, 0]}) + line(665, 992, 708, 1004, {seed: `${s}/k1t`, over: 0}) + line(722, 1004, 722, 1032, {seed: `${s}/k1h`, over: 0}) +
    // crane 2 (right)
    line(778, 1150, 778, 1028, {seed: `${s}/k2a`, over: 0}) + line(784, 1150, 784, 1028, {seed: `${s}/k2b`, over: 0}) +
    `M778 1140L784 1126L778 1112L784 1098L778 1084L784 1070L778 1056L784 1042L778 1030` +
    line(746, 1030, 810, 1030, {seed: `${s}/k2j`, over: [0, 0]}) + line(756, 1030, 756, 1054, {seed: `${s}/k2h`, over: 0});
  // ---- plaza ground: a few broken paving lines that die toward the viewer + specks (no tile grid)
  const ground = groundMarks({vp: PLAZA.vp, top: HZ + 70, bottom: 1920, x0: -420, x1: 1560, rays: 5, cross: 2, specks: 18, reach: 0.6, seed: `${s}/gm`, avoid: (x, y) => y < 1470 && x > 380 && x < 640});
  const kerbs = line(-150, A.base + 8, 650, A.base + 10, {seed: `${s}/k1`, over: [20, 0]}) + line(-150, A.base + 26, 520, A.base + 28, {seed: `${s}/k2`, over: [20, 8]});
  // sun path (flat, fixed opacity) from the gap at the horizon down the plaza to Pip's bollard, + sage shadow wedges
  const pL0: Pt = [668, HZ + 4];
  const pR0: Pt = [774, HZ + 4];
  const pL1: Pt = [700, 1530];
  const pR1: Pt = [930, 1530];
  const exL = (y: number) => pL0[0] + ((pL1[0] - pL0[0]) * (y - pL0[1])) / (pL1[1] - pL0[1]);
  const exR = (y: number) => pR0[0] + ((pR1[0] - pR0[0]) * (y - pR0[1])) / (pR1[1] - pR0[1]);
  const pathPoly = polyPath([pL0, pR0, pR1, pL1]);
  const pathEdges = line(pL0[0], pL0[1], pL1[0], pL1[1], {seed: `${s}/sp1`, over: 0, breaks: false}) + line(pR0[0], pR0[1], pR1[0], pR1[1], {seed: `${s}/sp2`, over: 0, breaks: false});
  const wedgeB = polyPath([[300, A.base + 2], [B.x1, B.base + 50], [pL0[0], pL0[1]], [exL(2060), 2060], [-200, 2060], [-200, 1760]]);
  const wedgeD = polyPath([[pR0[0], pR0[1]], [D.x0, pR0[1]], [D.x0, D.base], [1300, D.base], [1300, 2060], [exR(2060), 2060]]);
  const pathFar = polyPath([pL1, pR1, [exR(2060), 2060], [exL(2060), 2060]]);
  // kit v3b (default ground 'light'): ONE diagonal shade plane from govA's side (style bible: one shade plane) on the
  // light plaza: from the kerb under govA / govB's steps (x <= 440) down-left to x ~150 at the frame bottom, ~27 % of
  // the visible plaza (the 'sage' ground keeps the two old wedges, ~60 %)
  const wedgeA = polyPath([[-200, A.base - 2], [440, A.base - 2], [60, 2060], [-200, 2060]]);
  // benches
  const bench = (x: number, y: number, w: number) => ({fill: rectPath(x, y, w, 8), ink: line(x - 3, y, x + w + 3, y, {seed: `bn${x}`, over: [2, 2]}) + line(x + 6, y + 8, x + 4, y + 28, {seed: `bl${x}`, over: 0}) + line(x + w - 6, y + 8, x + w - 4, y + 28, {seed: `br${x}`, over: 0})});
  const benches = [bench(330, 1470, 76), bench(940, 1486, 64)];
  // lamp post (near, cut by the left edge) with a crossbar where the pigeons land
  const L = PLAZA.lamp;
  const lampInk =
    line(L.x - 8, 1990, L.x - 7, L.lantern[1] + 22, {seed: `${s}/lp1`, over: 0}) + line(L.x + 8, 1990, L.x + 7, L.lantern[1] + 24, {seed: `${s}/lp2`, over: 0}) +
    line(L.bar[0], L.barY, L.bar[1], L.barY, {seed: `${s}/lpb`, over: [6, 10]}) + line(L.bar[0] + 4, L.barY + 10, L.bar[1] - 4, L.barY + 10, {seed: `${s}/lpb2`, over: [2, 4]}) +
    rect(L.x - 18, L.lantern[1] - 20, 36, 42, {seed: `${s}/lpl`, over: 'small'}) + line(L.x - 24, L.lantern[1] - 20, L.x, L.top, {seed: `${s}/lpr1`, over: [1, 0]}) + line(L.x, L.top, L.x + 24, L.lantern[1] - 20, {seed: `${s}/lpr2`, over: [0, 1]});
  const lampFill = rectPath(L.x - 8, L.lantern[1] + 22, 16, 1990 - L.lantern[1]) + rectPath(L.bar[0], L.barY, L.bar[1] - L.bar[0], 10) + polyPath([[L.x - 24, L.lantern[1] - 20], [L.x, L.top], [L.x + 24, L.lantern[1] - 20]]);
  const lanternRect: R4 = [L.x - 16, L.lantern[1] - 18, 32, 38];
  // foreground tree (cropped right, in front of govD's ground floor)
  const crownD = crown(1078, 1300, 112, 124, {seed: `${s}/tree`, bumps: 10});
  const treeTicks = crownTicks(1078, 1300, 112, 124, {seed: `${s}/treek`, n: 4, size: 13});
  const trunk = rectPath(1046, 1390, 24, 168);
  const trunkInk = line(1046, 1556, 1046, 1404, {seed: `${s}/t1`, over: 0}) + line(1070, 1556, 1069, 1408, {seed: `${s}/t2`, over: 0}) + ellipse(1058, 1558, 60, 14, {seed: `${s}/pit`, overlap: -40});
  const pit = `M998 1558a60 14 0 1 0 120 0a60 14 0 1 0 -120 0Z`;
  return {wedgeA, pathFar, farEdges, A, colsA, CW, ped, tymp, aInk, colInk, colFill, colShade, flutes, steps, stepInk, B, bSteps, domeFill, domeInk, ribs, domeRim, lantern, lanternInk, bInk, drumThin, C, cInk, D, gridInk, cells, cellsDark, dInk, pilotis, farA, farB, farDots, cranes, ground, kerbs, pathPoly, pathEdges, wedgeB, wedgeD, benches, lampInk, lampFill, lanternRect, crownD, treeTicks, trunk, trunkInk, pit};
})();

// ---------------------------------------------------------------- far civic skyline (v3, kit v3b layout)

/** Haze steps of the civic depths: [lit, dark] per depth (back, mid, near). Lit = the day haze ladder (back #A2C8B6 ->
 *  near #84B09C, stepping toward the sky with distance); the switch-off is a CLEAR two-value step (1.7-2.1:1: back
 *  #A2C8B6 -> #6E9A88, near #84B09C -> #4E786A) so 'Europe' reads on a phone, the depths still ~1.2:1 apart when dark.
 *  The lit windows / clock faces / lanterns (cream) turn tealDark on the same step. */
const CIVIC_FILL: [string, string][] = [
  ['#A2C8B6', '#6E9A88'],
  ['#93BCAA', '#5E897A'],
  ['#84B09C', '#4E786A'],
];

const CIV = (() => {
  const CB = PLAZA.civicBase;
  // every silhouette runs 30 px under the horizon line (the far steps, drawn after, cover it: no seam under parallax)
  const base = CB + 30;
  const f = (n: number) => n.toFixed(1);
  const R = (x: number, y: number, w: number, h: number) => rectPath(x, y, w, h);
  return PLAZA_CIVIC.map((c) => {
    const {x0, x1, top, cx, depth} = c;
    const near = depth === 2;
    const back = depth === 0;
    const bandTop = PLAZA.civicBands[depth];
    const r = rng(`gp/civ/${c.id}`);
    // the low roofline band this silhouette owns (+ one raised roof block so it never reads as a flat slab)
    const [bx0, bx1] = c.band;
    let d = R(bx0, bandTop, bx1 - bx0 + 0.5, base - bandTop);
    const bw = r.range(16, 26);
    const bxs = r.range(bx0 + 6, bx1 - bw - 6);
    d += R(bxs, bandTop - r.range(7, 12), bw, 14);
    let lantern = '';
    let dots = '';
    const dot = (x: number, y: number, w: number, h: number) => (dots += R(x, y, w, h));
    if (c.kind === 'dome') {
      // drum with a cornice lip, a half-ellipse dome, a lantern (glazed: the lit window that pops off) with a pointed cap
      const lanW = near ? 14 : 9;
      const lanH = near ? 18 : 13;
      const rx = (x1 - x0) / 2 - 3;
      const ry = near ? 26 : 20;
      const domeTop = top + 6 + lanH;
      const drumTop = domeTop + ry;
      d +=
        `M${f(x0)} ${base}L${f(x0)} ${f(drumTop + 5)}L${f(x0 - 3)} ${f(drumTop + 5)}L${f(x0 - 3)} ${f(drumTop)}` +
        `L${f(cx - rx)} ${f(drumTop)}A${f(rx)} ${ry} 0 0 1 ${f(cx + rx)} ${f(drumTop)}` +
        `L${f(x1 + 3)} ${f(drumTop)}L${f(x1 + 3)} ${f(drumTop + 5)}L${f(x1)} ${f(drumTop + 5)}L${f(x1)} ${base}Z` +
        `M${f(cx - lanW / 2)} ${f(domeTop + 3)}L${f(cx - lanW / 2)} ${f(top + 6)}L${f(cx)} ${f(top)}L${f(cx + lanW / 2)} ${f(top + 6)}L${f(cx + lanW / 2)} ${f(domeTop + 3)}Z`;
      lantern = R(cx - lanW / 2 + 2, top + 8, lanW - 4, lanH - 4);
      // drum windows
      const n = near ? 3 : 2;
      const ww = near ? 5 : 3;
      const wh = near ? 8 : 5;
      for (let i = 0; i < n; i++) dot(cx - ((n - 1) / 2 - i) * (near ? 14 : 10) - ww / 2, drumTop + (near ? 11 : 9), ww, wh);
    } else if (c.kind === 'temple') {
      // a pediment over a cornice lip on a colonnade block; the column gaps are the lit window slits
      const pedH = near ? 18 : 14;
      const corn = top + pedH;
      d +=
        `M${f(x0)} ${base}L${f(x0)} ${f(corn + 6)}L${f(x0 - 4)} ${f(corn + 6)}L${f(x0 - 4)} ${f(corn)}L${f(cx)} ${f(top)}` +
        `L${f(x1 + 4)} ${f(corn)}L${f(x1 + 4)} ${f(corn + 6)}L${f(x1)} ${f(corn + 6)}L${f(x1)} ${base}Z`;
      const n = near ? 4 : 3;
      const sw = near ? 5 : 4;
      const sh = near ? 20 : 14;
      const pitch = (x1 - x0 - 12) / (n - 1);
      for (let i = 0; i < n; i++) dot(x0 + 6 + i * pitch - sw / 2, corn + 12, sw, sh);
    } else {
      // clock spire: tower, belfry lip, a tall pointed spire up to `top`; a round clock face (lit) under the belfry
      const spH = back ? 30 : 34;
      const bel = top + spH;
      d +=
        `M${f(x0 + 3)} ${base}L${f(x0 + 3)} ${f(bel + 6)}L${f(x0)} ${f(bel + 6)}L${f(x0)} ${f(bel)}L${f(cx)} ${f(top)}` +
        `L${f(x1)} ${f(bel)}L${f(x1)} ${f(bel + 6)}L${f(x1 - 3)} ${f(bel + 6)}L${f(x1 - 3)} ${base}Z`;
      const fr = back ? 4.5 : 7;
      const fy = bel + 8 + fr;
      dots += `M${f(cx - fr)} ${f(fy)}a${fr} ${fr} 0 1 0 ${f(2 * fr)} 0a${fr} ${fr} 0 1 0 ${f(-2 * fr)} 0Z`;
      dot(cx - (back ? 1.5 : 2.5), fy + fr + 8, back ? 3 : 5, back ? 6 : 9);
    }
    // band windows: a few lit dots along the band's visible strip (>= 3 px; bigger nearer)
    const dw = near ? 5 : back ? 3 : 4;
    const dh = near ? 6 : back ? 4 : 5;
    for (let x = bx0 + r.range(6, 14); x < bx1 - 8; x += r.range(16, 26)) if (r.chance(0.42)) dot(x, bandTop + (near ? 10 : 8), dw, dh);
    return {...c, d, lantern, dots};
  });
})();

/** Paint order: back -> mid -> near (indices into CIV, which is left to right). */
const CIV_DRAW = CIV.map((c, i) => [c.depth, i] as const)
  .sort((a, b) => a[0] - b[0] || a[1] - b[1])
  .map((q) => q[1]);

/** The plaza's far steps under the far city's horizon line (kit v3b): a cream coping (the horizon line) and three
 *  flights that shrink with distance (8 / 12 / 20 px steps, cream nosings over half-sand risers: a quiet light field
 *  under the dark skyline, not a striped one) separated by cream landings, from y 1166 down to the plaza horizon; the
 *  last riser runs on under the plaza (hidden by it). */
const FAR_STEPS = (() => {
  const CB = PLAZA.civicBase;
  const x0 = 590;
  const w = 250;
  let cream = rectPath(x0, CB, w, 5);
  let half = '';
  let sand = '';
  let lines = `M${x0} ${CB}H${x0 + w}`;
  let y = CB + 5;
  const flights: [number, number, 'half' | 'sand', number][] = [
    [4, 8, 'half', 6],
    [4, 12, 'half', 8],
    [6, 20, 'half', 0],
  ];
  flights.forEach(([n, h, riser, landing]) => {
    for (let i = 0; i < n; i++) {
      const nose = Math.max(3, Math.round(h * 0.34));
      cream += rectPath(x0, y, w, nose);
      if (riser === 'sand') sand += rectPath(x0, y + nose, w, h - nose + 0.5);
      else half += rectPath(x0, y + nose, w, h - nose + 0.5);
      lines += `M${x0} ${(y + nose).toFixed(1)}H${x0 + w}`;
      y += h;
    }
    if (landing) {
      cream += rectPath(x0, y, w, landing);
      lines += `M${x0} ${y.toFixed(1)}H${x0 + w}`;
      y += landing;
    }
  });
  // the last riser runs on under the plaza field (the ground layer covers it; no sky seam under multiplane parallax)
  sand += rectPath(x0, y, w, 1480 - y);
  return {cream, half, sand, lines};
})();

const FarSteps: React.FC<{seed: string}> = ({seed}) => (
  <>
    <Fill d={FAR_STEPS.sand} color={palette.sand} offset={false} mode="none" seed={`${seed}/fstS`} />
    <Fill d={FAR_STEPS.half} color={HALF.sand} offset={false} mode="none" seed={`${seed}/fstH`} />
    <Fill d={FAR_STEPS.cream} color={palette.cream} offset={false} mode="none" seed={`${seed}/fstC`} />
    <OnlyWhilePaper p={[715, 1260]}>
      <Ink d={FAR_STEPS.lines} width={HAIR} taper={false} seed={`${seed}/fstE`} />
    </OnlyWhilePaper>
  </>
);

/** Per-silhouette event times (left-to-right order). */
function civicTimes(v: number | number[] | undefined, dir: 'lr' | 'rl'): (number | undefined)[] {
  const n = PLAZA_CIVIC.length;
  if (v === undefined) return new Array(n).fill(undefined);
  if (Array.isArray(v)) return PLAZA_CIVIC.map((_, i) => v[i]);
  return PLAZA_CIVIC.map((_, i) => v + (dir === 'lr' ? i : n - 1 - i) * 0.06);
}

const FarCivic: React.FC<{off: boolean; offAt?: number | number[]; onAt?: number | number[]; lanternsOffAt?: number; seed: string}> = ({off, offAt, onAt, lanternsOffAt, seed}) => {
  const t = useTime();
  const offs = civicTimes(offAt, 'lr');
  const ons = civicTimes(onAt, 'rl');
  // lantern index (left to right) for the lanternsOffAt stagger
  const lanternIdx = CIV.map((c, i) => CIV.slice(0, i).filter((q) => 'lantern' in q && q.lantern).length);
  return (
    <>
      {CIV_DRAW.map((i) => {
        const c = CIV[i];
        const dark = latestState(t, [offs[i]], [ons[i]], off);
        const [lit, drk] = CIVIC_FILL[c.depth];
        let lanternOn = false;
        if ('lantern' in c && c.lantern) {
          // with civicLanternsOffAt a lantern stays lit through its dome's step until then (S01: the domes step on
          // 'Europe', the lanterns go 0.25 s later) and relights with its dome; without it, it follows the dome
          const lOff = lanternsOffAt !== undefined ? lanternsOffAt + lanternIdx[i] * 0.06 : undefined;
          lanternOn = lanternsOffAt !== undefined ? !latestState(t, [lOff], [ons[i]], off) : !dark;
        }
        return (
          <React.Fragment key={c.id}>
            <Fill d={c.d} color={dark ? drk : lit} offset={false} mode="none" seed={`${seed}/civ${i}`} />
            <Fill d={c.dots} color={dark ? palette.tealDark : palette.cream} offset={false} mode="none" seed={`${seed}/civd${i}`} />
            {c.lantern ? <Fill d={c.lantern} color={lanternOn ? palette.cream : palette.tealDark} offset={false} mode="none" seed={`${seed}/civl${i}`} /> : null}
          </React.Fragment>
        );
      })}
      <OnlyWhilePaper p={[710, 1100]}>
        <Ink d={CIV.map((c) => c.d).join('')} width={HAIR} taper={false} seed={`${seed}/civE`} />
      </OnlyWhilePaper>
    </>
  );
};

// ---------------------------------------------------------------- v3 event helpers

const arr = (v?: number | number[]): number[] => (v === undefined ? [] : Array.isArray(v) ? v : [v]);

/** Latest-event toggle: true after a `trueAt` time, false after a `falseAt` time (the most recent one <= t wins; a tie
 *  goes to false), `init` before any. */
export function latestState(t: number, trueAt: (number | undefined)[], falseAt: (number | undefined)[], init: boolean): boolean {
  let best = -Infinity;
  let s = init;
  for (const a of trueAt) if (a !== undefined && a <= t && a >= best) (best = a), (s = true);
  for (const a of falseAt) if (a !== undefined && a <= t && a >= best) (best = a), (s = false);
  return s;
}

/** Rewind-stepped progress 0..1 of a reversed move over `dur`, held in steps of 1 / fps (the first step lands ON the
 *  event, so a rewind never shows a dead frame at its start). */
export function rewindStep(t: number, at: number, dur: number, fps = 12): number {
  if (t < at) return 0;
  const n = Math.floor((t - at) * fps + 1e-6) + 1;
  return Math.min(1, n / Math.max(1, dur * fps));
}

/** CRT phases of a browser screen: u 0 = lit, CRT_LINE = the bright horizontal line, 1 = dark. Forward (power-off)
 *  runs CRT_DUR (0.15 s, smooth); backward (the rewind) runs CRT_REV per full sweep, stepped at `fps`. */
export const CRT = {dur: 0.15, rev: 0.17, line: 0.4, dot: 0.75} as const;

const crtOnIsReverse = (ev: GovEvents) =>
  ev.screenOnAt !== undefined && ((ev.screenOffAt !== undefined && ev.screenOffAt < ev.screenOnAt) || (ev.screenLineAt !== undefined && ev.screenLineAt < ev.screenOnAt));

/** The screen's CRT phase u at t from the v3 screen events (pure). */
export function crtPhase(t: number, ev: GovEvents, fps = 12, init = 0): number {
  const evs: {t: number; to: number}[] = [];
  if (ev.screenOffAt !== undefined) evs.push({t: ev.screenOffAt, to: 1});
  if (ev.screenLineAt !== undefined) evs.push({t: ev.screenLineAt, to: CRT.line});
  if (ev.screenOnAt !== undefined && crtOnIsReverse(ev)) evs.push({t: ev.screenOnAt, to: 0});
  evs.sort((a, b) => a.t - b.t);
  let from = init;
  let to = init;
  let t0 = -Infinity;
  const at = (tt: number) => {
    if (t0 === -Infinity || from === to) return from;
    const dt = tt - t0;
    if (to > from) return Math.min(to, from + dt / CRT.dur);
    const n = Math.floor(dt * fps + 1e-6) + 1;
    return Math.max(to, from - n / (fps * CRT.rev));
  };
  for (const e of evs) {
    if (e.t > t) break;
    from = at(e.t);
    t0 = e.t;
    to = e.to;
  }
  return at(t);
}

/** The CRT overlay drawn as the window's screen content (screen-local coords): tealDark glass with the bright band
 *  (u < line: the lit screen squashing to a line), the line (shrinking to a dot), the dot (shrinking to nothing). Opaque
 *  stepped glow (cream halo, white core): no fades. */
const crtContent = (u: number, seed: string) => ({w, h}: {w: number; h: number}) => {
  const cx = w / 2;
  const cy = h / 2;
  const lh = Math.max(4, h * 0.065);
  let core = '';
  let halo = '';
  if (u < CRT.line) {
    const p = E.inQuad(u / CRT.line);
    const bh = lh + (h - lh) * (1 - p);
    core = rectPath(0, cy - bh / 2, w, bh);
    halo = rectPath(0, cy - (bh / 2 + lh * 0.9), w, bh + lh * 1.8);
  } else if (u < CRT.dot) {
    const p = (u - CRT.line) / (CRT.dot - CRT.line);
    const bw = Math.max(lh * 2, (w - 8) * (1 - E.outQuad(p)));
    core = rectPath(cx - bw / 2, cy - lh / 2, bw, lh);
    halo = rectPath(cx - bw / 2 - lh * 0.6, cy - lh * 1.4, bw + lh * 1.2, lh * 2.8);
  } else {
    const r = lh * 1.1 * (1 - (u - CRT.dot) / (1 - CRT.dot));
    if (r > 0.4) {
      core = `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
      const R = r * 2;
      halo = `M${cx - R} ${cy}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0Z`;
    }
  }
  return (
    <>
      <Fill d={rectPath(-1, -1, w + 5, h + 5)} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/crtg`} />
      {halo ? <Fill d={halo} color={palette.cream} offset={false} mode="none" seed={`${seed}/crth`} /> : null}
      {core ? <Fill d={core} color={palette.white} offset={false} mode="none" seed={`${seed}/crtc`} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- shared window hardware (chrome + shutter + lock + tag)

type WinCtx = {id: GovId; ev: GovEvents; off: boolean; chrome: boolean; seed: string; windowSlot?: GovernmentPlazaProps['windowSlot']; k?: number; fps?: number;
  /** 'window' = the screen + shutter, 'hardware' = the tag + padlock hanging on its rail (drawn LAST, after the
   *  building's sill / ink, so no stroke of the facade cuts through them), 'all' = both (default). */
  part?: 'all' | 'window' | 'hardware'};

/** The reversed slam's forward window (the drop without its bounce), replayed backwards by `liftAt`. */
const SLAM_DROP = 0.16;

/** The shutter (props RollerShutter via the slot), with the v3 extras done here: a partial drop (`shutterStop`) is a
 *  shutter over the top fraction of the window; `liftAt` replays the slam backwards, stepped like a tape. */
const ShutterRig: React.FC<{x: number; y: number; w: number; h: number; ev: GovEvents; off: boolean; fps: number; width: number; seed: string}> = ({x, y, w, h, ev, off, fps, width, seed}) => {
  const t = useTime();
  if (!off && ev.liftAt !== undefined && t >= ev.liftAt) {
    const D = ev.liftDur ?? 0.25;
    if (t >= ev.liftAt + D) return <ShutterSlot x={x} y={y} w={w} h={h} width={width} seed={seed} />;
    const q = rewindStep(t, ev.liftAt, D, fps);
    return (
      <TimeProvider global={(1 - q) * SLAM_DROP} offset={0}>
        <ShutterSlot x={x} y={y} w={w} h={h} slamAt={0} width={width} seed={seed} />
      </TimeProvider>
    );
  }
  return <ShutterSlot x={x} y={y} w={w} h={h} slamAt={ev.shutterAt} down={off} width={width} seed={seed} />;
};

/** The 'back soon' tag; `outAt` = it swings back up (0 -> -16 deg, stepped) and pops off (S12 rewind). */
const TagRig: React.FC<{x: number; y: number; at?: number; tapAt?: number; outAt?: number; fps: number; extra?: Partial<BackSoonTagProps>; seed: string}> = ({x, y, at, tapAt, outAt, fps, extra, seed}) => {
  const t = useTime();
  const tag = <BackSoonSlot x={x} y={y} at={at} tapAt={tapAt} extra={extra} seed={seed} />;
  if (outAt === undefined || t < outAt) return tag;
  const SW = 0.17;
  if (t >= outAt + SW + 1 / fps) return null;
  // the swing pivots on the tag's real hang point (tagProps x / y move it off the PLAZA.gov slot: S01's rail offsets)
  const px = extra?.x ?? x;
  const py = extra?.y ?? y;
  if (t >= outAt + SW) return <XG m={mat.about(mat.compose(mat.rotate(-16), mat.scale(0.55)), px, py)}>{tag}</XG>;
  return <XG m={mat.about(mat.rotate(-16 * rewindStep(t, outAt, SW, fps)), px, py)}>{tag}</XG>;
};

/** The shutter padlock; `outAt` = one shrunken step, then gone (a pop off). */
const PadlockRig: React.FC<{x: number; y: number; at?: number; glintAt?: number; outAt?: number; fps: number; extra?: Partial<ShutterPadlockProps>; seed: string}> = ({x, y, at, glintAt, outAt, fps, extra, seed}) => {
  const t = useTime();
  const pl = <PadlockSlot x={x} y={y} at={at} glintAt={glintAt} extra={extra} seed={seed} />;
  if (outAt === undefined || t < outAt) return pl;
  if (t >= outAt + 1 / fps) return null;
  return <XG m={mat.about(mat.scale(0.55), extra?.x ?? x, extra?.y ?? y)}>{pl}</XG>;
};

const WindowRig: React.FC<WinCtx> = ({id, ev, off, chrome, seed, windowSlot, k = 1, fps = 12, part = 'all'}) => {
  const t = useTime();
  const g = PLAZA.gov[id];
  const [x, y, w, h] = g.window;
  const stop = clamp(ev.shutterStop ?? ev.stopAt ?? 1, 0.05, 1);
  // padlock / tag hang from the shutter's bottom rail: a partial shutter carries them up with it
  const dy = (stop - 1) * h;
  // the screen: v1 = chrome offAt (with the building's lights out); v3 = the CRT phase from the screen events
  const crt = !off && (ev.screenOffAt !== undefined || ev.screenLineAt !== undefined);
  const u = off ? 1 : crt ? crtPhase(t, ev, fps) : 0;
  const v1On = ev.screenOnAt !== undefined && !crtOnIsReverse(ev) ? ev.screenOnAt : undefined;
  const chromeOff = off ? -1e6 : crt ? (u >= 0.999 ? -1e6 : undefined) : ev.offAt;
  const content = crt && u > 0.001 && u < 0.999 ? crtContent(u, `${seed}/${id}/crt`) : undefined;
  const showTag = (off || ev.tagAt !== undefined) && part !== 'window';
  const showLock = (off || ev.padlockAt !== undefined) && part !== 'window';
  const showWin = part !== 'hardware';
  return (
    <>
      {!showWin ? null : windowSlot ? (
        windowSlot(id, g.window)
      ) : (
        <ChromeSlot x={x} y={y} w={w} h={h} chrome={chrome} chromeAt={off ? undefined : ev.chromeAt} screenOnAt={off ? undefined : v1On} offAt={chromeOff} content={content} width={MID * k} seed={`${seed}/${id}/bw`} />
      )}
      {showWin ? <ShutterRig x={x} y={y} w={w} h={h * stop} ev={ev} off={off} fps={fps} width={MID * k} seed={`${seed}/${id}/sh`} /> : null}
      {showTag ? <TagRig x={g.tag[0]} y={g.tag[1] + dy} at={off ? undefined : ev.tagAt} tapAt={ev.tagTapAt} outAt={off ? undefined : ev.tagOutAt} fps={fps} extra={ev.tagProps} seed={`${seed}/${id}/tag`} /> : null}
      {showLock ? <PadlockRig x={g.padlock[0]} y={g.padlock[1] + dy} at={off ? undefined : ev.padlockAt} glintAt={ev.glintAt} outAt={off ? undefined : ev.padlockOutAt} fps={fps} extra={ev.padlockProps} seed={`${seed}/${id}/pl`} /> : null}
    </>
  );
};

/** Lights out (`offAt`) and back on (`onAt`): the latest one wins; the 'off' state starts dark. */
const isDark = (t: number, ev: GovEvents, off: boolean) => latestState(t, [ev.offAt], [ev.onAt], off);

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

type BProps = {ev: GovEvents; off: boolean; chrome: boolean; detail: 'wide' | 'close'; seed: string; windowSlot?: GovernmentPlazaProps['windowSlot']; k: number; fps: number};

const GovA: React.FC<BProps> = ({ev, off, chrome, seed, windowSlot, k, fps}) => {
  const t = useTime();
  const A = G.A;
  return (
    <>
      <LightsOut on={isDark(t, ev, off)}>
        <Fill d={G.ped} color={palette.cream} seed={`${seed}/aped`} />
        <Fill d={G.tymp} color={palette.sand} offset={false} seed={`${seed}/atymp`} />
        <Fill rect={[A.pedL, A.cornT, A.pedR - A.pedL, A.cornB - A.cornT]} color={palette.tan} offset={false} seed={`${seed}/acorn`} />
        <Fill rect={[A.x0, A.cornB, A.x1 - A.x0, A.styl - A.cornB]} color={palette.cream} seed={`${seed}/afac`} />
        {/* the cella wall in the portico's shadow, a shade plane on its left */}
        <Fill rect={[A.x0, A.friezeB, A.x1 - A.x0 - 8, A.styl - A.friezeB]} color={palette.sand} offset={false} seed={`${seed}/awall`} />
        <Fill rect={[A.x0, A.friezeB, 70, A.styl - A.friezeB]} color={palette.tan} offset={false} seed={`${seed}/ashade`} />
        <Fill d={G.colFill} color={palette.cream} seed={`${seed}/acol`} />
        <Fill d={G.colShade} color={palette.sand} offset={false} seed={`${seed}/acols`} />
        {G.steps.map((q, i) => (
          <Fill key={i} rect={q} color={i % 2 ? palette.sand : palette.cream} offset={false} seed={`${seed}/ast${i}`} />
        ))}
        <Fill rect={[A.x0 - 8, A.colBot, A.x1 - A.x0 + 16, A.styl - A.colBot]} color={palette.cream} offset={false} seed={`${seed}/asty`} />
        <DoorRig id="govA" seed={seed} inkW={MID * k} />
      </LightsOut>
      <Ink d={G.aInk} width={MID * k} seed={`${seed}/aink`} />
      <Ink d={G.colInk + G.stepInk} width={MID * 0.85 * k} taper={false} seed={`${seed}/acolink`} />
      <Ink d={G.flutes} width={HAIR * k} taper={false} seed={`${seed}/aflute`} />
      <WindowRig k={k} fps={fps} id="govA" ev={ev} off={off} chrome={chrome} seed={seed} windowSlot={windowSlot} />
    </>
  );
};

const GovB: React.FC<BProps> = ({ev, off, chrome, detail, seed, windowSlot, k, fps}) => {
  const t = useTime();
  const B = G.B;
  const close = detail === 'close';
  const win = PLAZA.gov.govB.window;
  const sill = win[1] + win[3] + 6;
  const lanternLit = ev.lanternOffAt === undefined && ev.lanternOnAt === undefined ? !isDark(t, ev, off) : latestState(t, [ev.lanternOnAt], [ev.lanternOffAt], !off);
  return (
    <>
      {/* the dome lantern: its own switch (v3 lanternOffAt / lanternOnAt), else it follows the building's lights */}
      <Fill d={G.lantern} color={lanternLit ? palette.cream : palette.sand} seed={`${seed}/blant`} />
      <LightsOut on={isDark(t, ev, off)}>
        <Fill d={G.domeFill} color={palette.sand} seed={`${seed}/bdome`} />
        <Fill d={G.domeRim} color={palette.cream} offset={false} seed={`${seed}/brim`} />
        <Fill rect={B.drum} color={palette.cream} seed={`${seed}/bdrum`} />
        <Fill rect={[B.drum[0], B.drum[1], B.drum[2] * 0.22, B.drum[3]]} color={palette.sand} offset={false} seed={`${seed}/bdrums`} />
        <Fill rect={[B.x0 - 12, B.top, B.x1 - B.x0 + 24, B.cornB - B.top]} color={palette.tan} offset={false} seed={`${seed}/bcorn`} />
        <Fill rect={[B.x0, B.cornB, B.x1 - B.x0, B.base - B.cornB]} color={palette.cream} seed={`${seed}/bfac`} />
        <Fill rect={[B.x0, B.cornB, (B.x1 - B.x0) * 0.24, B.base - B.cornB]} color={palette.sand} offset={false} seed={`${seed}/bshade`} />
        {G.bSteps.map((q, i) => (
          <Fill key={i} rect={q} color={i % 2 ? palette.cream : palette.sand} offset={false} seed={`${seed}/bstep${i}`} />
        ))}
        <Fill d={polyPath([[464, 1222], [519, 1194], [574, 1222]])} color={palette.sand} offset={false} seed={`${seed}/bdped`} />
        {close ? <Fill d={drumSlits()} color={palette.tealDark} offset={false} seed={`${seed}/bslit`} /> : null}
        <DoorRig id="govB" seed={seed} inkW={MID * k} />
      </LightsOut>
      <Ink d={G.domeInk + G.lanternInk} width={MID * k} seed={`${seed}/bdomeink`} />
      <Ink d={G.ribs} width={THIN * k} taper={false} color={palette.teal} seed={`${seed}/bribs`} />
      <Ink d={G.bInk} width={MID * k} seed={`${seed}/bink`} />
      <Ink d={G.drumThin + (close ? stoneCourses(B.x0 + 16, B.x1 - 16, B.cornB + 20, B.base - 30, `${seed}/bsc`) + brickHints(B.x0 + 22, 1150, 200, 200, `${seed}/bbh`, 4, 20) : '')} width={HAIR * k} taper={false} seed={`${seed}/bthin`} />
      <WindowRig k={k} fps={fps} id="govB" ev={ev} off={off} chrome={chrome} seed={seed} windowSlot={windowSlot} part="window" />
      {/* window sill (Pip / snail perch in S11) */}
      <Ink d={line(win[0] - 10, sill, win[0] + win[2] + 10, sill, {seed: `${seed}/bsill`, over: [6, 6]}) + line(win[0] - 6, sill + 9, win[0] + win[2] + 6, sill + 9, {seed: `${seed}/bsill2`, over: [2, 2]})} width={MID * k} taper={false} />
      {/* the tag + padlock hang over the sill: drawn after it (the sill strokes used to cut through them) */}
      <WindowRig k={k} fps={fps} id="govB" ev={ev} off={off} chrome={chrome} seed={seed} part="hardware" />
    </>
  );
};

const drumSlits = () => {
  let d = '';
  for (let i = 0; i < 6; i++) d += rectPath(G.B.drum[0] + 18 + i * 29, G.B.drum[1] + 30, 9, 34);
  return d;
};
const stoneCourses = (x0: number, x1: number, y0: number, y1: number, seed: string) => {
  const win = PLAZA.gov.govB.window;
  const door = PLAZA.gov.govB.door;
  let d = '';
  for (let y = y0 + 34, i = 0; y < y1; y += 46, i++) {
    const r = rng(`${seed}/${i}`);
    let x = x0 + r.range(0, 30);
    while (x < x1) {
      const L = r.range(18, 40);
      // keep the window and door area clear
      if (!(y > win[1] - 12 && y < win[1] + win[3] + 20 && x + L > win[0] - 8 && x < win[0] + win[2] + 8) && !(y > door[1] - 40 && x + L > door[0] - 16 && x < door[0] + door[2] + 16)) d += `M${x.toFixed(1)} ${y.toFixed(1)}L${Math.min(x1, x + L).toFixed(1)} ${(y + r.jitter(0.6)).toFixed(1)}`;
      x += L + r.range(30, 70);
    }
  }
  return d;
};

const GovC: React.FC<BProps> = ({ev, off, chrome, seed, windowSlot, k, fps}) => {
  const t = useTime();
  const C = G.C;
  return (
    <>
      <LightsOut on={isDark(t, ev, off)}>
        <Fill d={polyPath([[C.turret[0] - 6, C.turret[1]], [870, 606], [C.turret[0] + C.turret[2] + 6, C.turret[1]]])} color={palette.teal} seed={`${seed}/croof`} />
        <Fill rect={C.turret} color={palette.tan} seed={`${seed}/ctur`} />
        <Fill rect={[C.x0 - 6, C.corn, C.x1 - C.x0 + 12, 12]} color={palette.sand} offset={false} seed={`${seed}/ccorn`} />
        <Fill rect={[C.x0, C.corn + 12, C.x1 - C.x0, 200]} color={palette.tan} seed={`${seed}/cfac`} />
        <Fill rect={[C.x0, C.corn + 12, 40, 200]} color={palette.brown} offset={false} seed={`${seed}/cshade`} />
      </LightsOut>
      {/* the clock face stays white when the building goes dark (white is never stepped) */}
      <Fill d={blob(PLAZA.clock.x, PLAZA.clock.y, PLAZA.clock.r, PLAZA.clock.r, {seed: `${seed}/clk`})} color={palette.white} seed={`${seed}/clkf`} />
      <Ink d={circle(PLAZA.clock.x, PLAZA.clock.y, PLAZA.clock.r, {seed: `${seed}/clki`}) + `M${PLAZA.clock.x} ${PLAZA.clock.y}L${PLAZA.clock.x} ${PLAZA.clock.y - 18}M${PLAZA.clock.x} ${PLAZA.clock.y}L${PLAZA.clock.x + 13} ${PLAZA.clock.y + 6}`} width={THIN * k} taper={false} />
      <Ink d={G.cInk} width={MID * k} seed={`${seed}/cink`} />
      <Ink d={brickHints(C.x0 + 10, C.corn + 20, C.x1 - C.x0 - 20, 30, `${seed}/cbh`, 3, 20) + brickHints(C.x0 + 8, 850, C.x1 - C.x0 - 16, 26, `${seed}/cbh2`, 2, 20)} width={THIN * k} taper={false} />
      <WindowRig k={k} fps={fps} id="govC" ev={ev} off={off} chrome={chrome} seed={seed} windowSlot={windowSlot} />
    </>
  );
};

const GovD: React.FC<BProps> = ({ev, off, chrome, seed, windowSlot, k, fps}) => {
  const t = useTime();
  const D = G.D;
  return (
    <>
      <LightsOut on={isDark(t, ev, off)}>
        <Fill rect={[D.x0, D.roof, D.x1 - D.x0 + 40, D.base - D.roof]} color={palette.cream} seed={`${seed}/dfac`} />
        <Fill d={G.cells} color={palette.mintPale} offset={false} seed={`${seed}/dcell`} />
        <Fill d={G.cellsDark} color={palette.sage} offset={false} seed={`${seed}/dcelld`} />
        <Fill rect={[D.x0, D.roof, D.x1 - D.x0 + 40, D.fascia]} color={palette.tealDark} offset={false} seed={`${seed}/dfasc`} />
        <Fill rect={[D.x0, D.ground, D.x1 - D.x0 + 40, D.base - D.ground]} color={palette.sage} offset={false} seed={`${seed}/dground`} />
        <Fill d={G.pilotis} color={palette.mintPale} offset={false} seed={`${seed}/dpil`} />
        <DoorRig id="govD" seed={seed} inkW={NEARMID * k} />
      </LightsOut>
      <Ink d={G.dInk} width={NEARMID * k} seed={`${seed}/dink`} />
      <Ink d={G.gridInk} width={THIN * k} taper={false} seed={`${seed}/dgrid`} />
      <WindowRig k={k * (NEARMID / MID)} fps={fps} id="govD" ev={ev} off={off} chrome={chrome} seed={seed} windowSlot={windowSlot} />
    </>
  );
};

// ---------------------------------------------------------------- layers

const FarCity: React.FC<{seed: string; civic?: React.ReactNode}> = ({seed, civic}) =>
  civic ? (
    <>
      {/* v3: the civic silhouettes ARE the far city in the gap; kit v3b: it ends on a horizon line (y 1166) at the top
          of the plaza's far steps instead of running down to the plaza as one teal slab */}
      {civic}
      <FarSteps seed={seed} />
    </>
  ) : (
  <>
    <Fill d={G.farA} color={HAZE[1]} offset={false} seed={`${seed}/farA`} />
    <Fill d={G.farB} color={HAZE[0]} offset={false} seed={`${seed}/farB`} />
    <Fill d={G.farDots} color={HALF.daySky} offset={false} seed={`${seed}/farD`} />
    <Ink d={G.cranes} width={HAIR} taper={false} seed={`${seed}/cranes`} />
    <OnlyWhilePaper p={[710, 1150]}>
      <Ink d={G.farEdges} width={HAIR} taper={false} seed={`${seed}/farE`} />
    </OnlyWhilePaper>
  </>
  );

const Ground: React.FC<{seed: string}> = ({seed}) => (
  <>
    <Fill rect={[-160, PLAZA.horizon, 1400, 2080 - PLAZA.horizon]} color={palette.mintPale} offset={false} seed={`${seed}/plaza`} />
    <Ink d={G.kerbs} width={THIN} seed={`${seed}/kerbs`} />
  </>
);

const LightLayer: React.FC<{seed: string; ground: PlazaGround}> = ({seed, ground}) => (
  <>
    {ground === 'sage' ? (
      <>
        <Fill d={G.wedgeB} color={palette.sage} offset={false} mode="snap" seed={`${seed}/wedgeB`} />
        <Fill d={G.wedgeD} color={palette.sage} offset={false} mode="snap" seed={`${seed}/wedgeD`} />
        <Fill d={G.pathFar} color={palette.mintPale} offset={false} mode="snap" seed={`${seed}/pathFar`} />
      </>
    ) : (
      <Fill d={G.wedgeA} color={palette.sage} offset={false} mode="snap" seed={`${seed}/wedgeA`} />
    )}
    {/* the flat sun path: cream at a FIXED partial opacity (never animated) with dashed ink edges; light only exists in
        the coloured state, so the line-art frame shows just its edges */}
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

const Citizens: React.FC<{at?: number; phonesAt?: number | number[]; phonesDownAt?: number | number[]; seed: string}> = ({at, phonesAt, phonesDownAt, seed}) => {
  const t = useTime();
  const phones = latestState(t, arr(phonesAt), arr(phonesDownAt), false);
  const idx = PLAZA.phoneIdx as readonly number[];
  return (
    <>
      {PLAZA.citizens.map((c, i) => (
        <PaperUntilCascade key={i} p={[c.x, c.y - c.h / 2]}>
          <CitizenSlot x={c.x} y={c.y} h={c.h} silhouette={c.sil} riseAt={at === undefined ? undefined : at + i * 0.05} acc={phones && idx.includes(i) ? ['phone'] : undefined} seed={`${seed}/cit${i}`} />
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
        rim={i === 2 ? 'left' : 'right'}
        arms={i === 0 ? 'near' : 'both'}
        seed={`${seed}/onl${i}`}
      />
    ))}
  </>
);

const Near: React.FC<{lanternOffAt?: number; lanternOnAt?: number; off: boolean; pigeonsAt?: number | boolean; pigeonsFlyAt?: number; bollard: boolean; onlookers: boolean; idle: number; seed: string}> = ({lanternOffAt, lanternOnAt, off, pigeonsAt, pigeonsFlyAt, bollard, onlookers, idle, seed}) => {
  const t = useTime();
  const lanternOff = latestState(t, [lanternOffAt], [lanternOnAt], off);
  const pigeons = !off && (pigeonsAt === true || (typeof pigeonsAt === 'number' && t >= pigeonsAt));
  const sway = osc(t + idle, 0.3, 1.2) * 0.6;
  return (
    <>
      {/* lamp post at the left edge (cut by it) with a crossbar where 3 pigeons land */}
      <Fill d={G.lampFill} color={palette.tealDark} seed={`${seed}/lamp`} />
      <Fill rect={G.lanternRect} color={lanternOff ? palette.sand : palette.cream} offset={false} mode="snap" seed={`${seed}/lantern`} />
      <Ink d={G.lampInk} width={NEAR} seed={`${seed}/lampi`} />
      {pigeons
        ? PLAZA.pigeons.map((p, i) => (
            <Bird key={i} x={p[0]} y={p[1]} s={0.8} seed={`${seed}/pg${i}`} at={typeof pigeonsAt === 'number' ? pigeonsAt + i * 0.06 : undefined} flyAt={pigeonsFlyAt !== undefined ? pigeonsFlyAt + i * 0.05 : undefined} flyTo={[180 + i * 60, -340]} color={i === 1 ? palette.sand : palette.white} flip={i === 2} />
          ))
        : null}
      {/* foreground tree cropped at the right edge, in front of govD's ground floor */}
      <Fill d={G.pit} color={palette.tan} offset={false} seed={`${seed}/pit`} />
      <XG m={mat.about(mat.rotate(sway), 1058, 1558)}>
        <Fill d={G.trunk} color={palette.brown} seed={`${seed}/trunk`} />
        <Ink d={G.trunkInk} width={NEAR} taper={false} />
        <Fill d={G.crownD} color={palette.sage} seed={`${seed}/crown`} />
        <Ink d={G.crownD} width={NEAR} open={0.12} seed={`${seed}/crowni`} />
        <Ink d={G.treeTicks} width={MID} taper={false} />
      </XG>
      {bollard ? <BollardSlot x={PLAZA.bollard.x} y={PLAZA.bollard.y} w={PLAZA.bollard.w} h={PLAZA.bollard.h} seed={`${seed}/bollard`} /> : null}
      {onlookers ? (
        <TimeShift by={-idle}>
          <Onlookers seed={seed} />
        </TimeShift>
      ) : null}
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
  lanternOnAt,
  pigeonsAt,
  pigeonsFlyAt,
  phonesDownAt,
  farCivic = true,
  ground = 'light',
  civicOffAt,
  civicOnAt,
  civicLanternsOffAt,
  rewindFps = 12,
  idleOffset = 0,
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
  const ch = chrome ?? true;
  const ev = (id: GovId): GovEvents => {
    if (lineArt) return {};
    const e = gov[id] ?? {};
    // frame 0 (v3): govB's screen is held as the bright line until its screenOffAt releases it
    return state === 'frame0' && id === 'govB' && e.screenLineAt === undefined ? {...e, screenLineAt: -1e6} : e;
  };
  const pennantUp = pennantsAt === true || (pennantsAt === undefined && off);
  const pennantTimes = Array.isArray(pennantsAt) ? pennantsAt : [];
  const bp = {off, chrome: ch, detail, seed, windowSlot, k: detail === 'close' ? 0.7 : 1, fps: rewindFps};
  const L = PLAZA.layers;

  const scene = (
    <>
      {sun ? wrap('sun', L.sun, sun) : null}
      {wrap('far', L.far, <FarCity seed={seed} civic={farCivic ? <FarCivic off={off} offAt={lineArt ? undefined : civicOffAt} onAt={lineArt ? undefined : civicOnAt} lanternsOffAt={lineArt ? undefined : civicLanternsOffAt} seed={seed} /> : undefined} />)}
      {wrap('ground', L.ground, <Ground seed={seed} />)}
      {wrap(
        'buildings',
        L.buildings,
        <>
          <GovC ev={ev('govC')} {...bp} />
          <GovA ev={ev('govA')} {...bp} />
          <GovB ev={ev('govB')} {...bp} />
          {bit ? (
            <TimeShift by={-idleOffset}>
              <BitSlot x={PLAZA.bit[0]} y={PLAZA.bit[1]} size={PLAZA.bitSize} seed={`${seed}/bit`} />
            </TimeShift>
          ) : null}
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
          <LightLayer seed={seed} ground={ground} />
          {citizensAt !== false ? <Citizens at={lineArt || off ? undefined : citizensAt} phonesAt={lineArt ? undefined : phonesAt} phonesDownAt={lineArt ? undefined : phonesDownAt} seed={seed} /> : null}
        </>,
      )}
      {wrap(
        'near',
        L.near,
        <>
          <Near lanternOffAt={lineArt ? undefined : lanternOffAt} lanternOnAt={lineArt ? undefined : lanternOnAt} off={off} pigeonsAt={lineArt ? undefined : pigeonsAt} pigeonsFlyAt={pigeonsFlyAt} bollard={bollard} onlookers={onlookers} idle={idleOffset} seed={seed} />
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

/** Storyboard v3: what S01 hangs on its closed shutters (scene01/plaza.tsx `S01_GOV`, mirrored here so the kit's
 *  shut-down state = S01's last state): LETTERED 'back soon' tags (govB 104 px, govA 74, govC 62 wide) and the padlock /
 *  tag x positions S01 shifts apart on the rails (the default `PLAZA.gov` slots overlap once a tag is lettered; govC's
 *  tag hangs right of its padlock). No event times: `plazaShutdownGov` adds them. If S01 changes its numbers, pass its
 *  spec as `plazaShutdownGov(at, S01_GOV)` (that always wins). */
export const PLAZA_SHUTDOWN: Record<'govA' | 'govB' | 'govC', GovEvents> = {
  govA: {padlockProps: {x: 152}, tagProps: {lettered: true, size: 74, x: 226}},
  govB: {padlockProps: {x: 462}, tagProps: {lettered: true, size: 104, x: 562}},
  govC: {shutterStop: 0.5, padlockProps: {x: 838}, tagProps: {lettered: true, size: 62, x: 900}},
};

/** The closing events of the shut-down state: set to `at`. */
const SHUTDOWN_CLOSE = ['screenOffAt', 'shutterAt', 'offAt', 'padlockAt', 'tagAt', 'lanternOffAt'] as const;
/** Everything else timed in a source spec is dropped (a missing build time = built, a missing event = never): the
 *  build-ins (chromeAt, screenOnAt), the transient beats (tagTapAt, glintAt) and any rewind events (liftAt, onAt,
 *  tagOutAt, padlockOutAt, lanternOnAt, screenLineAt): the rewinding scene merges its own. */
const SHUTDOWN_DROP = ['chromeAt', 'screenOnAt', 'tagTapAt', 'glintAt', 'screenLineAt', 'liftAt', 'onAt', 'tagOutAt', 'padlockOutAt', 'lanternOnAt'] as const;

/** Strip the timed props (at, tapAt, twirlAt, liftAt, outAt, lockAt, glintAt, ...) of a tag / padlock spec: keep its
 *  look and placement (lettered, text, size, font, x, y, inkPx, ...). */
function stripTimes<T extends object>(p: T | undefined): T | undefined {
  if (!p) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(p)) if (k !== 'at' && !/At$/.test(k) && k !== 'outDur') out[k] = v;
  return out as T;
}

/** One building's shut-down events from a source spec (S01's): every closing event it has at `at`. */
function shutdownOf(src: GovEvents, at: number): GovEvents {
  const ev: GovEvents = {...src};
  for (const k of SHUTDOWN_DROP) delete ev[k];
  for (const k of SHUTDOWN_CLOSE) if (src[k] !== undefined) ev[k] = at;
  const tagProps = stripTimes(src.tagProps);
  const padlockProps = stripTimes(src.padlockProps);
  if (tagProps) ev.tagProps = tagProps;
  else delete ev.tagProps;
  if (padlockProps) ev.padlockProps = padlockProps;
  else delete ev.padlockProps;
  return ev;
}

/** Storyboard v3: the gov events of the state S01 leaves the plaza in (S12's hard cut, the cover frame), every event at
 *  `at` (default -1: already happened): govA + govB screens off, shuttered, darker, padlocked, tagged; govB's dome
 *  lantern off; govC's screen off, its shutter HALF down, padlocked, tagged (not darker); govD lit. The tags are S01's
 *  LETTERED 'back soon' tags at S01's rail positions (`PLAZA_SHUTDOWN`), so the cut opens on exactly what S01 left.
 *  `from` = a scene's own S01 gov spec (scene01/plaza.tsx `S01_GOV`): returned with every CLOSING event it has
 *  (screenOffAt, shutterAt, offAt, padlockAt, tagAt, lanternOffAt) set to `at`, its non-time props kept (shutterStop,
 *  tagProps / padlockProps look + x / y) and every other time dropped (build-ins, glints, taps, twirls): the exact
 *  S01 end state whatever S01 tunes. Merge the rewind events over it (liftAt, onAt, tagOutAt, padlockOutAt, screenOnAt,
 *  lanternOnAt, screenLineAt), plus the set props civicOffAt={at} lanternOffAt={at} phonesAt={at} for the far skyline,
 *  the lamp and the phones. */
export function plazaShutdownGov(at = -1, from?: Partial<Record<GovId, GovEvents>>): Record<'govA' | 'govB' | 'govC', GovEvents> & Partial<Record<'govD', GovEvents>> {
  if (from) {
    const out: Partial<Record<GovId, GovEvents>> = {};
    for (const id of ['govA', 'govB', 'govC', 'govD'] as const) {
      const src = from[id];
      if (src) out[id] = shutdownOf(src, at);
    }
    return {govA: out.govA ?? {}, govB: out.govB ?? {}, govC: out.govC ?? {}, ...(out.govD ? {govD: out.govD} : {})};
  }
  const closed: GovEvents = {screenOffAt: at, shutterAt: at, offAt: at, padlockAt: at, tagAt: at};
  const S = PLAZA_SHUTDOWN;
  return {
    govA: {...closed, padlockProps: {...S.govA.padlockProps}, tagProps: {...S.govA.tagProps}},
    govB: {...closed, lanternOffAt: at, padlockProps: {...S.govB.padlockProps}, tagProps: {...S.govB.tagProps}},
    govC: {screenOffAt: at, shutterAt: at, shutterStop: S.govC.shutterStop, padlockAt: at, tagAt: at, padlockProps: {...S.govC.padlockProps}, tagProps: {...S.govC.tagProps}},
  };
}

/** S11 framing helper: the camera centre / zoom that frames govB's window as the storyboard measures it. */
export const plazaCloseup = PLAZA.closeup;

/** The REST layout: S01's opening frame and S11's ending frame (camera at rest, sun slot, Pip, Bit). Frame 0 =
 *  <GovernmentPlaza state="lineArt"/> (ink-only browser chrome by default) with the sun mid-rise at sunFrame0; S11's
 *  hard cut = state "off". */
export const PLAZA_REST = {camera: {x: 540, y: 960, zoom: 1}, sun: PLAZA.sun, sunFrame0: {x: 720, y: 950, r: 155}, pip: PLAZA.pip, bit: PLAZA.bit, bollard: PLAZA.bollard} as const;
