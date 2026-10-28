// V2S2_Water (lane L2; the water swap, 2026-10-28): the canal and the far towpath in S2, on ONE camera (V2S2_Ground): the
// far towpath and its coping follow the wing's base to the VP (kit/canal/wall s2y), our water edge runs to the same VP, so
// the water narrows toward it. Flat colour (CRAFT §c, §f). FILM seconds.
//   S2WaterSurface   THE WATER, drawn by the film's ONE shared water (src/lib/water.tsx; how-to src/lib/WATER.md, S2's
//                    recipe; the rules CRAFT §f.7; the owner on v5's water: "way too cheap ... lazy and cheap"): its
//                    geometry in one place (S2_WATER), every reflection DERIVED from S2's own wall, lamp, boat and colours
//                    as the clean pen draws them, S2_EVENING mirrored (S2's own sky; S2 has no sun disc, so no glitter),
//                    S2_AIR, the rig's water tint. The receding quay mirrors about its own sloped lens line (R1's affine
//                    map, `axis {a0, s}`, past the third column; the map's first three columns as drawn, `axis {line}`)
//   S2FarBank        the far towpath and its coping, stepped to their planes by distance (`recede` toward S2's air),
//                    and ONE far lamp in CM.line (STYLE §2: never plum), stepped to its plane (u 5.5)
//   S2PassingBoat    a narrowboat far down the canal: its bow comes in at the right edge at 7.60, small and slow (it
//                    nears us at walking pace), chimney puffs every ~0.5 s; it never reaches the story windows' columns
//                    or Pip (its bow at x ~742 by 12.98); its reflection is the water's (one dark band, R5)
//   S2Ducks          two ducks paddling on the narrow water right of Pip, clear of it: the kit's mallards exactly, each on
//                    lib/water's floater water (a thin contact lens and its mirrored underside: never a V, they do not
//                    move, CRAFT §f.7h; the kit's paper wake strokes are gone)
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {useTime} from '../../lib/time';
import {Tier} from '../../lib/tier';
import {Fill} from '../../lib/Fill';
import {multiply} from '../../lib/light';
import {parallaxOffset, recede} from '../../lib/depth';
import {tierFill} from '../../lib/pen';
import {bob} from '../../lib/idle';
import {rand} from '../../lib/rng';
import {Water, floaterWater, waterKAt, waterSwayAt, type Axis, type Poly, type WaterSource, type WaterSpec} from '../../lib/water';
import {Batch, Paint, P, Pt as KPt, lerp, ovalPath} from '../kit/canal/core';
import {Lamp} from '../kit/canal/towpath';
import {PerspBoat} from '../kit/canal/boat';
import {Puffs} from '../kit/canal/life';
import {S2_STORY, s2g, s2u, s2x, s2y} from '../kit/canal/wall';
import * as MAP from '../world/map';
import {S2_AIR, S2_EVENING} from '../world/skies';
import {TINT_CANAL} from '../world/rigs';
import {S2_ATM, STAFF_PANE_COOL, litAt, wallCol, wallPlane} from './V2S2_Wall';
import {OUR_EDGE} from './V2S2_Ground';
import {S2_PLANE, s2Float} from './V2S2_Float';

type Pt = [number, number];

/** The far towpath's water edge (the far coping's foot) at column position u. */
export const farCoping = (u: number) => s2y('base', u) + 24 * s2g(u);
/** The far towpath's walking line (where far figures stand) at screen x. */
export const farPath = (x: number): Pt => {
  const u = s2u(x);
  return [x, s2y('base', u) + 12 * s2g(u)];
};
/** The water's middle at screen x (between the far coping and our edge). */
export const waterMid = (x: number): number => (farCoping(s2u(x)) + OUR_EDGE(x)) / 2;

const col = (c: string, p: number) => (p > 0 ? recede(c, p, S2_ATM) : c);

/** THE WATER's geometry, in one place (no other S2 code draws water):
 *    top     the far coping's foot (the waterline): farCoping(u), from u -3 (off the left edge) to the right edge (u at
 *            x 1140); the water runs 2 px up under the coping's lip (the far bank is drawn after it)
 *    bottom  our water edge: OUR_EDGE(x), the water running on 30 px under our coping (which covers it)
 *  What stands ABOVE it (drawn after it, so the water may run under all of it): the far towpath + its coping and the
 *  far lamp (S2FarBank), the far walker, the far motes, the passing boat and its smoke, the ducks (all in the wall's
 *  plane group), our bank (the coping and the bollards: V2S2_Near S2Bank), the A-board, Pip on its bollard. */
export const S2_WATER = {
  u0: -3,
  /** The column position at the right edge (x 1140, with the float's overscan). */
  uEnd: () => s2u(1140),
  top: (u: number) => farCoping(u) - 2,
  bottom: (x: number) => OUR_EDGE(x) + 30,
  /** The outline: the top edge left to right (every 0.25 u), then the bottom right to left (every 30 px). */
  poly: (): Pt[] => {
    const top: Pt[] = [];
    for (let u = S2_WATER.u0; u <= S2_WATER.uEnd(); u += 0.25) top.push([s2x(u), S2_WATER.top(u)]);
    const bot: Pt[] = [];
    for (let x = 1160; x >= -60; x -= 30) bot.push([x, S2_WATER.bottom(x)]);
    return [...top, ...bot];
  },
};

// ================================================================= the water's camera and mirror lines

/** S2's water camera: V2S2_Ground's (horizon 700 = the VP's height, focal 1400); the eye 3.90 m over the water (3.83 m
 *  over our towpath, the towpaths ~0.07 m over the water: the far coping's drawn face is 6 g px over the 336 g px from
 *  the horizon to the far waterline, t / e = 0.0179). */
export const S2W_CAM = {horizon: 700, f: 1400, eye: 3.9} as const;
const T_OVER_E = 6 / 336;
const K_LENS = 1 / (1 - T_OVER_E);
/** THE MIRROR LINE under a thing whose base stands on the far towpath at screen y (R1: the lens line under it). */
const lensUnder = (yBase: number): number => S2W_CAM.horizon + (yBase - S2W_CAM.horizon) * K_LENS;
/** The wing's lens line at screen x (under its base: s2y('base')), the map's first three columns as drawn. */
const wallAxisY = (x: number): number => lensUnder(s2y('base', s2u(x)));
/** Past the third column the wing's base runs straight to the VP, and so does its lens line: R1's affine map,
 *  y = a0 + s x (s2y('base', u) = 700 + 312 g at s2x = 1400 - 935 g). */
const A_S = -(312 / 935) * K_LENS;
const A_A0 = S2W_CAM.horizon - 1400 * A_S;
const WALL_AXIS_FAR: Axis = {a0: A_A0, s: A_S};
const WALL_AXIS_NEAR: Axis = {line: wallAxisY};
/** The water's x range (with the float's overscan) and where the far quay turns straight (column 2). */
const X0 = s2x(S2_WATER.u0);
const X1 = 1140;
const X_KINK = s2x(2);
const PAPER = '#FBF3E6';

/** The clean pen's on-screen colours: the wall's tier (environment, the pen's bg) on its plane. */
const env = (c: string) => tierFill(c, 'environment');
const onWall = (c: string, p: number) => env(wallCol(c, p));
const rect = (x0: number, y0: number, x1: number, y1: number): Poly => [
  [x0, y0],
  [x1, y0],
  [x1, y1],
  [x0, y1],
];
/** A band of the wing between two level lines over u0..u1, as a polygon (left to right on top, back along the bottom). */
const wallBand = (top: (u: number) => number, bot: (u: number) => number, u0: number, u1: number): Poly => {
  const pts: Poly = [];
  const n = Math.max(2, Math.ceil((u1 - u0) * 4));
  for (let i = 0; i <= n; i++) {
    const u = lerp(u0, u1, i / n);
    pts.push([s2x(u), top(u)]);
  }
  for (let i = n; i >= 0; i--) {
    const u = lerp(u0, u1, i / n);
    pts.push([s2x(u), bot(u)]);
  }
  return pts;
};
/** The row of the wing whose mirror is our water edge (+4 px): the wing is cut there, so its block and bars end inside
 *  the visible water (S1's wing: "the visible reflection reaches ~2 m up the ground storey"). */
const wallCut = (u: number): number => {
  const x = s2x(u);
  return 2 * wallAxisY(x) - (OUR_EDGE(x) + 4);
};

/** Reflection layers (higher = nearer, drawn later). */
const LAYER = {wall: 10, pane: 12, lamp: 13, boat: 20, coping: 31} as const;

/** Every static thing over S2's water (at the 6.70 pose = the float's rest; built once). */
function s2Sources(): WaterSource[] {
  const out: WaterSource[] = [];
  const P1 = S2_PLANE.wall;
  const uEnd = S2_WATER.uEnd();
  // ---- the wing: ONE mass per plane segment (its fins, plinth, band and the far tiers' tone-on-tone panes are one
  // plane simpler, R5), each in the wall's own colour on its plane; the near part (the map's first three columns)
  // about its drawn lens line, the receding part about the straight one (R1's affine map)
  const segs: [number, number, number][] = [
    [-2, 2, 0],
    [2, 2.5, 0],
    [2.5, 6.5, 1],
    [6.5, 14.5, 2],
    [14.5, uEnd, 3],
  ];
  for (const [u0, u1, p] of segs) {
    if (u0 >= u1) continue;
    out.push({id: `wall/${u0}`, thing: wallBand((u) => Math.max(s2y('firstTop', u), wallCut(u)), (u) => s2y('base', u), u0, u1), axis: u1 <= 2 ? WALL_AXIS_NEAR : WALL_AXIS_FAR, color: onWall(CM.brickLight, p), layer: LAYER.wall, plane: P1, breakup: 0.45, narrow: 0.1, solid: p >= 2 ? 1 : 0.6});
  }
  // ---- the far lamp (u 5.5, off): a long thin vertical, whole for 70 %, two bars at most
  {
    const u = 5.5;
    const g = s2g(u);
    const x = s2x(u);
    const y = s2y('base', u) + 12 * g;
    const h = 290 * g;
    const cw = Math.max(2.2, h * 0.034);
    const lamp: Poly = [[x - 1.6 * cw, y], [x - 1.2 * cw, y - 0.08 * h], [x - 0.6 * cw, y - 0.08 * h], [x - 0.45 * cw, y - 0.8 * h], [x + 0.45 * cw, y - 0.8 * h], [x + 0.6 * cw, y - 0.08 * h], [x + 1.2 * cw, y - 0.08 * h], [x + 1.6 * cw, y]];
    out.push({id: 'farLamp', thing: lamp, axis: lensUnder(y), color: env(recede(CM.line, wallPlane(u), S2_ATM)), layer: LAYER.lamp, plane: P1, breakup: 0, narrow: 0.2, taper: 1.2, solid: 0.7, maxBars: 2});
  }
  // ---- the far coping's own face, mirrored: ONE crisp cool band along the far waterline (R10), 2 px over the
  // reflections' start; still (a contact band never sways)
  const top: Pt[] = [];
  const bot: Pt[] = [];
  for (let u = S2_WATER.u0; u <= uEnd + 0.01; u += 0.25) {
    const g = s2g(u);
    top.push([s2x(u), farCoping(u) - 2]);
    bot.push([s2x(u), farCoping(u) + 6 * g + 2]);
  }
  out.push({id: 'coping', refl: [...top, ...bot.reverse()], color: multiply(env(recede(CM.stoneShade, 1, S2_ATM)), TINT_CANAL.form), layer: LAYER.coping, plane: P1, draw: 'crisp'});
  return out;
}

/** The ground storey's panes at t (the procedural ones on the two near planes, and the three ground staff windows SW3-SW5):
 *  a lit pane is LIGHT ON WATER (lib/water LightOpts: a block <= 35 % of its visible length, then 2 leaf slivers); an
 *  unlit or cooled pane is one pale mass. The first storey's panes and her dark window mirror past our edge. */
function s2Panes(t: number): WaterSource[] {
  const out: WaterSource[] = [];
  const P1 = S2_PLANE.wall;
  for (let c = -2; c <= 6; c++) {
    if (S2_STORY.find((s) => s.col === c && s.row === 'ground')) continue;
    const g = s2g(c);
    const x = s2x(c);
    const w = 100 * g * g * (c < 2 ? 1.12 : 1);
    const p = wallPlane(c);
    const y0 = s2y('groundTop', c);
    const y1 = s2y('groundBot', c);
    const ax = c < 2 ? WALL_AXIS_NEAR : WALL_AXIS_FAR;
    const lit = litAt(t, c, 'ground');
    const th = rect(x - w / 2, y0, x + w / 2, y1);
    if (lit) out.push({id: `pane/${c}`, thing: th, axis: ax, color: p > 0 ? env(recede(CM.lamp, p, S2_ATM)) : CM.lamp, kind: 'light', layer: LAYER.pane, plane: P1, light: {solid: 0.33, slivers: 2, step: 6, fall: 1.3}});
    else out.push({id: `pane/${c}`, thing: th, axis: ax, color: env(p > 0 ? recede(CM.glass, p, S2_ATM) : CM.glass), layer: LAYER.pane, plane: P1, breakup: 0.2, narrow: 0.08});
  }
  MAP.S2.staffWindows.forEach((w, i) => {
    const story = S2_STORY.find((s) => s.id === w.id);
    if (!story || story.row !== 'ground') return;
    const cool = t >= MAP.S2.staffOnAt + i * MAP.S2.staffOnStagger;
    const th = rect(w.x - w.w / 2, w.y - w.h / 2, w.x + w.w / 2, w.y + w.h / 2);
    if (!cool) out.push({id: `staff/${w.id}`, thing: th, axis: WALL_AXIS_NEAR, color: CM.lamp, kind: 'light', layer: LAYER.pane, plane: P1, light: {solid: 0.33, slivers: 2, step: 6, fall: 1.3}});
    else out.push({id: `staff/${w.id}`, thing: th, axis: WALL_AXIS_NEAR, color: env(STAFF_PANE_COOL), layer: LAYER.pane, plane: P1, breakup: 0.2, narrow: 0.08});
  });
  return out;
}

/** The passing boat (S2PassingBoat's PerspBoat): its hull + gunwale as ONE dark band (R5) about its own waterline. */
function s2Boat(t: number): WaterSource[] {
  if (t < S2_BOAT.at - 0.01) return [];
  const bowX = S2_BOAT.x0 - (t - S2_BOAT.at) * S2_BOAT.speed;
  const sternX = Math.min(1400, bowX + 230 * s2g(s2u(Math.min(1080, bowX))));
  const lane = (x: number) => waterMid(x) + 4;
  const h = (x: number) => 150 * s2g(s2u(Math.min(1300, x)));
  // the kit's boat in its 1000 x 300 box: the waterline 8 px and the gunwale's top 68 px over the box's foot
  const wlS = lane(sternX) - h(sternX) * (8 / 300);
  const wlB = lane(bowX) - h(bowX) * (8 / 300);
  const gtS = lane(sternX) - h(sternX) * (68 / 300);
  const gtB = lane(bowX) - h(bowX) * (68 / 300);
  const wl = (x: number) => wlB + ((wlS - wlB) * (x - bowX)) / Math.max(1, sternX - bowX);
  return [{id: 'boat', thing: [[bowX, wlB], [sternX, wlS], [sternX, gtS], [bowX, gtB]], axis: {line: wl}, color: env(recede(CM.paneUnlit, 1, S2_ATM)), layer: LAYER.boat, plane: S2_PLANE.wall, breakup: 0, narrow: 0.04, solid: 0.75}];
}

/** The ripple lines' and the fields' clock (film s: steady from before the push-through, nothing born at 6.10). */
const FIELD_T0 = 5.5;
/** A reflection's counter-shift inside the wall's plane group (the shot's float: its thing's share - the wall's). */
const s2WaterFloat = (plane: number, t: number): Pt => {
  const f = s2Float(t);
  const a = parallaxOffset(f, plane);
  const b = parallaxOffset(f, S2_PLANE.wall);
  return [a[0] - b[0], a[1] - b[1]];
};

const S2_SPEC: WaterSpec = {
  id: 'S2 canal',
  seed: 's2canal',
  cam: {...S2W_CAM},
  region: {top: (x: number) => farCoping(s2u(x)), bottom: OUR_EDGE, x0: X0, x1: X1, tuckTop: 2, tuckBottom: 30, step: 10},
  sky: S2_EVENING,
  air: S2_AIR,
  // the lit ground beside the water as drawn: the far towpath's paving and our York stone (its two tones)
  notLike: [
    {name: 'the far towpath', hex: env(CM.paving)},
    {name: 'our towpath', hex: '#F0D7C6'},
  ],
  body: '#9CC3BC',
  tint: TINT_CANAL.water,
  tier: 'environment',
  // the toning runs with screen y: the far water by the VP (y ~815) to our edge at the left (y 1290)
  ramp: {yFar: 815, yNear: OUR_EDGE(0)},
  ladder: {k: [0.4, 0.72], y: [815, OUR_EDGE(0)], step: 0.05},
  grid: {dz: 0.45, minPitch: 3, gap: [0.16, 0.26]},
  sources: [],
  moving: (t: number) => [...s2Panes(t), ...s2Boat(t)],
  // ripple lines: 7 slots along the narrow water, clear of Pip's seat and the ducks
  ripples: {
    slots: 7,
    x: [120, 1110],
    y: [930, 1270],
    avoid: [
      [520, 990, 664, 1110],
      [650, 930, 790, 1010],
    ],
    len: [40, 130],
    thick: [1.5, 2.6],
    drift: [6, 14],
    life: [2.6, 4.6],
    t0: FIELD_T0,
  },
  float: s2WaterFloat,
  skyPlane: S2_PLANE.sky,
  // the shot never opens the film: its water is whole from its first frame (a front at film 0, long crossed)
  flood: {origin: [X_KINK, 1036], t0: 0, speed: 6000, pale: 0.7, paper: PAPER},
  joins: [6.1, 12.98],
};
let built = false;
const ensure = () => {
  if (!built) {
    S2_SPEC.sources = s2Sources();
    built = true;
  }
  return S2_SPEC;
};
/** S2's water spec with its sources built (node QA, the lint). */
export const s2WaterSpec = (): WaterSpec => ensure();

/** THE WATER (in the wall's plane group, drawn before the far bank, the boat, the ducks and our bank). */
export const S2WaterSurface: React.FC = () => {
  const t = useTime();
  return <Water spec={ensure()} t={t} />;
};

/** The far bank: the far towpath (paving) and its coping per plane segment (stepped toward the air with distance), then
 *  ONE far lamp on the far towpath (u 5.5, plane +1, CM.line stepped to it), clear of the story windows; none farther
 *  (the far planes stay calm: no dark specks by the VP, CRAFT §f). Drawn right after the water. */
export const S2FarBank: React.FC = () => {
  const uEnd = S2_WATER.uEnd();
  const b = useMemo(() => {
    const b = new Batch();
    const seg: [number, number, number][] = [
      [-3, 2.5, 0],
      [2.5, 6.5, 1],
      [6.5, 14.5, 2],
      [14.5, uEnd, 3],
    ];
    for (const [u0, u1Raw, p] of seg) {
      const u1 = Math.min(u1Raw, uEnd);
      if (u0 >= u1) continue;
      const band = (a: (u: number) => number, c: (u: number) => number): Pt[] => {
        const out: Pt[] = [];
        const n = Math.max(2, Math.ceil((u1 - u0) * 3));
        for (let i = 0; i <= n; i++) out.push([s2x(lerp(u0, u1, i / n)), a(lerp(u0, u1, i / n))]);
        for (let i = n; i >= 0; i--) out.push([s2x(lerp(u0, u1, i / n)), c(lerp(u0, u1, i / n))]);
        return out;
      };
      b.poly(col(CM.paving, p), band((u) => s2y('base', u) - 1, (u) => farCoping(u) - 6 * s2g(u)) as KPt[]);
      b.poly(col(CM.limestone, p), band((u) => farCoping(u) - 6 * s2g(u), (u) => farCoping(u)) as KPt[]);
    }
    return b;
  }, [uEnd]);
  return (
    <>
      <Tier tier="environment">
        <Paint b={b} seed="s2farbank" misreg={false} />
      </Tier>
      <Tier tier="environment">
        {[5.5].map((u, i) => (
          <Lamp key={i} x={s2x(u)} y={s2y('base', u) + 12 * s2g(u)} h={290 * s2g(u)} color={col(CM.line, wallPlane(u))} seed={`s2lamp${i}`} />
        ))}
      </Tier>
    </>
  );
};

/** The passing narrowboat: its bow comes in at the right edge at 7.60 (clear of 8.44 / 8.96 by > 0.4 s), gliding left
 *  (toward us) along the water's middle; its length ~20 m in the wall's scale; growth as it nears. Its bow at x ~742
 *  by 12.98, right of the story windows' columns (x <= 520) and of Pip (x <= 640). */
export const S2_BOAT = {at: 7.6, x0: 1086, speed: 64};
export const S2PassingBoat: React.FC = () => {
  const t = useTime();
  if (t < S2_BOAT.at - 0.01) return null;
  const bowX = S2_BOAT.x0 - (t - S2_BOAT.at) * S2_BOAT.speed;
  const sternX = Math.min(1400, bowX + 230 * s2g(s2u(Math.min(1080, bowX))));
  const lane = (x: number) => waterMid(x) + 4;
  const h = (x: number) => 150 * s2g(s2u(Math.min(1300, x)));
  return (
    <Tier tier="environment">
      <PerspBoat stern={[sternX, lane(sternX)]} bow={[bowX, lane(bowX)]} hStern={h(sternX)} hBow={h(bowX)} seed="s2passing" cabin={CM.coatOat} />
      <Puffs x={sternX - 30 * s2g(s2u(Math.min(1080, sternX)))} y={lane(sternX) - h(sternX) - 6} seed="s2boatsmoke" kind="smoke" scale={0.42 * s2g(s2u(Math.min(1080, sternX))) * 2} drift={14} ceil={604} />
    </Tier>
  );
};

/** Two ducks on the narrow water right of Pip (x 660-760), paddling slowly in place, clear of Pip's box and the heads
 *  below: the kit's mallards exactly (its sway and bob, its body, head and beak), each on lib/water's floater water (a
 *  thin dark contact lens at its waterline and its underside mirrored as tapered bars: never a V, they do not move). */
const S2_DUCKS = [
  {x: 690, y: waterMid(690) + 6, size: 26, drake: false},
  {x: 748, y: waterMid(748) + 4, size: 22, drake: true},
] as const;
export const S2Ducks: React.FC = () => {
  const t = useTime();
  const spec = ensure();
  return (
    <Tier tier="environment">
      {S2_DUCKS.map((d, i) => {
        const s = d.size;
        const ph = rand('s2ducks2', i) * 6.28;
        const x = d.x + Math.sin(t * 0.3 + ph) * 6;
        const by = d.y - s * 0.22 + bob(t, s * 0.03, 0.6, ph);
        const face = 1;
        const w = floaterWater({x, y: d.y, len: s, color: env(CM.line), k: waterKAt(spec, d.y + 4), tone: spec.tone, sway: waterSwayAt(spec, d.y + 6, t)});
        const bodyD = `M${P(x - s * 0.55, by)}Q${P(x - s * 0.5, by + s * 0.32)} ${P(x, by + s * 0.3)}Q${P(x + s * 0.5, by + s * 0.3)} ${P(x + s * 0.55, by - s * 0.02)}Q${P(x + face * s * 0.1, by - s * 0.3)} ${P(x - s * 0.55, by)}Z`;
        const headD = ovalPath(x + face * s * 0.4, by - s * 0.32, s * 0.16, s * 0.15);
        const beakD = `M${P(x + face * s * 0.52, by - s * 0.33)}L${P(x + face * s * 0.72, by - s * 0.29)}L${P(x + face * s * 0.52, by - s * 0.25)}Z`;
        return (
          <React.Fragment key={i}>
            <path d={w.refl} fill={w.reflColor} />
            <path d={w.contact} fill={w.contactColor} />
            <Fill d={bodyD} color={d.drake ? CM.coatOat : CM.line} seed={`s2ducks/${i}/body`} offset={false} />
            <Fill d={headD} color={d.drake ? CM.sage : CM.line} seed={`s2ducks/${i}/head`} offset={false} />
            <Fill d={beakD} color={CM.coatMustard} seed={`s2ducks/${i}/beak`} offset={false} />
          </React.Fragment>
        );
      })}
    </Tier>
  );
};
