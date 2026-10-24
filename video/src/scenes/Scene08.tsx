// S08 "Counted from the announcement" (cut(ready) -> cut(day); 24.09-34.48 s on the take). PEAK 2 in two short doses with a
// baseline count between them (docs/storyboard_v3.md S08):
//   1. the CRANE (fixed 2.0 s, out(quart), multiplane) over our own rooftop parapet: an endless city of websites to the
//      horizon, the film's biggest sun (r260, half-set, two stepped glow rings); the hooded attempters are ALREADY at the
//      doors, rattling handles (not counted).
//   2. BASELINE dolly push (1.0 -> 1.15, sine) on 'Cloudflare ... forty-five minutes': a glass dome draws itself over ONE far
//      district (~1/5), the counter board rises on our parapet (L8 holds alone 1.7 s), the count starts at 'announced'
//      (start flag + L9a, hand-drawn tally gates, no digits), L9b footer; the counted attempters pile up against the
//      dome's flank in steps with the gates; the sun hops up as a clock and sweeps the 45-minute wedge; stamp 1 (L10).
//   3. PAYOFF: on 'millions' an ink-dark crowd floods every row of the city outside the dome and climbs its flanks, and
//      the camera pulls back to the vista; stamp 2 (L11); the sun sets in two steps at screen x 700 (S09's sunrise
//      point) while the sky steps golden -> sage dusk and the far rows relight to dusk haze.
// Match-cut IN from S07 (its 0.40 s tilt): the three wires at screen y 896 / 928 / 960 and the sun at (640, 1021) r110
// half behind the skyline. Match-cut OUT to S09: the sun set at screen x 700 (S09's VP).
//
// Set: the shared DomeCity v3 with the dome slid left of the board (scene08/layout.ts DOME8; fix round 1), its layers
// mapped onto this scene's multiplane depths through `wrap` with the scene's overlays injected per layer; the set's
// own watchtower / searchlight are off (they stood at x 600-650, on the board's top edge): scene08/tower.tsx draws them
// inside the glass. Shared props: CounterBoard, TelephoneWires (WIRES.S08, pole at x 540), Attempter, LeakSheet, Bit,
// SunGlowSteps, InkTextBlock. Local stand-ins (scene08/shims.tsx): MinuteWedge + ease, InkStamp (stampPaper).
import React, {useId} from 'react';
import {World, Sun, palette} from '../lib';
import {ease as E, lerp, prog, useTime as useTimeLocal} from '../lib/time';
import {camAt, Layer} from '../lib/cine/camera';
import type {CamKey} from '../lib/cine/camera';
import {ShotCam} from '../lib/ShotCam';
import type {SkyKey} from '../lib/World';
import {CounterBoard, counterBoardZones, SunGlowSteps} from './shared/props';
import {DomeCity, DOME, TelephoneWires, WIRES} from './shared/sets';
import {DUR, GATES_AT, T} from './scene08/times';
import {BOARD, copingY, depthOf, DOME8, EXTRA_DOORS3, PIP, PUSH_X, R2, R3} from './scene08/layout';
import {BitRide, CopySpec, GlintSweep, PaperSpecks, Pigeons, Pip, StampHit, WindowWink, WireCopy} from './scene08/cast';
import {crowdBand, CrowdFig, Flood, outsideDome, PileFig, pileSlots, Rattler, RattlerSpec, RimPile} from './scene08/crowd';
import {beamEnd, Searchlight8, Watchtower8} from './scene08/tower';
import {BoardNote, InkStamp, MinuteWedge} from './scene08/shims';
import {DeckClutter, ExtraDoors} from './scene08/extras';

// ---------------------------------------------------------------- camera (depth-0 plane = our parapet)

const DOLLY = 1 - 1 / 1.15; // the baseline push is a DOLLY: far rows grow less, the sky and the sun not at all

export const CAMERA: CamKey[] = [
  {t: 0, x: 540, y: 1260, zoom: 1.3, push: 0},
  // BIG MOVE 1: the multiplane crane, a fixed 2.0 s from the cut, entering at S07's tilt exit speed (out(quart))
  {t: T.craneEnd, x: 540, y: 960, zoom: 1, push: 0, ease: E.outQuart},
  {t: T.pushAt, x: 540, y: 960, zoom: 1, push: 0},
  // BASELINE: a slow dolly push toward the dome and the board over 'Cloudflare ... forty-five minutes'
  // (x 530: the whole board stays left of the right rail at 1.15, the dome stays clear of it on the left)
  {t: T.pushEnd, x: PUSH_X, y: 1100, zoom: 1, push: DOLLY, ease: E.inOutSine},
  {t: T.pullAt, x: PUSH_X, y: 1100, zoom: 1, push: DOLLY},
  // PEAK again: pull back to the vista on 'millions' (a fixed 0.9 s)
  {t: T.pullEnd, x: 540, y: 960, zoom: 1, push: 0, ease: E.inOutSine},
  {t: DUR + 1, x: 540, y: 960, zoom: 1, push: 0},
];

// ---------------------------------------------------------------- sky: golden, then a STEPPED uniform dusk tween

const DUSK_STEPS = ['#A0C7B5', '#94BDAA', '#88B3A0', '#7CA995', '#709F8B'];
const SKY: SkyKey[] = [{t: 0, tod: 'golden'}, ...DUSK_STEPS.map((c, i): SkyKey => ({t: T.within + i * 0.15, color: c, wipe: 'snap', ...(i === 4 ? {tod: 'dusk' as const} : {})}))];

// ---------------------------------------------------------------- the sun (screen space, behind every row)

const SUN = {x: DOME.sunV3.x, y: DOME.sunV3.y, r: DOME.sunV3.r};
const SUN_MOVES = [
  // keeps S07's downward slide for ~4 frames (5 px/frame at the cut, easing off: velocity-continuous) ...
  {at: 0, dur: 0.12, y: 1027, ease: E.outCubic},
  // ... then swells to the peak sun, half-set on the skyline, during the crane
  {at: 0.12, dur: 1.78, x: SUN.x, y: SUN.y, r: SUN.r, ease: E.inOutSine},
  // sinks back onto the horizon after the clock (the comma pause)
  {at: T.comma, dur: 0.4, y: SUN.y, ease: E.inOutSine},
  // the film's one sunset, in two steps, each completing ON its word (gone at screen x 700: S09's sunrise point)
  {at: T.sunset1, dur: 0.16, y: 1130, ease: E.inCubic},
  {at: T.sunset2, dur: 0.16, y: 1320, ease: E.inCubic},
];
// 'forty-five': the sun hops up 150 px (centre 850, top 590) and becomes a clock, landing on the word
const SUN_HOPS = [{t: T.hopOff, to: [SUN.x, 850] as [number, number], h: 18, air: 0.22}];
// the clock face: inset in the hopped sun's visible top (screen centre (700, 750), face r 144: y 606-894, between the
// caption floor 570 and the board's top edge 898 at the push), so the whole 3/4 wedge, all 4 ticks and the hand read
const FACE = {dy: -100, r: 160};

/** The two stepped flat glow rings, both shrinking TOGETHER (no stagger) and gone on `goneAt` (before the sun moves). */
const Rings: React.FC<{at: number; outAt: number; goneAt: number}> = ({at, outAt, goneAt}) => {
  const t = useTimeLocal();
  if (t >= goneAt) return null;
  return (
    <>
      <SunGlowSteps cx={SUN.x} cy={SUN.y} r={SUN.r} at={at + 0.08} outAt={outAt} rings={[{k: 1.5, color: palette.cream}]} />
      <SunGlowSteps cx={SUN.x} cy={SUN.y} r={SUN.r} at={at} outAt={outAt} rings={[{k: 1.25, color: palette.peach}]} />
    </>
  );
};

const SunInSky: React.FC = () => (
  <>
    {/* off before the hop's anticipation (take-off - 0.1 s) */}
    <Rings at={T.settle} outAt={T.hopOff - 0.27} goneAt={T.hopOff - 0.1} />
    {/* back on as the sun lands on the horizon after the comma; off before sunset step 1 starts */}
    <Rings at={T.comma + 0.4} outAt={T.sunset1 - 0.17} goneAt={T.sunset1} />
    <Sun cx={640} cy={1021} r={110} drift={[0, 0]} moves={SUN_MOVES} hops={SUN_HOPS} breathe={0.01}>
      <MinuteWedge r={FACE.r} cy={FACE.dy} at={T.fortyFiveWord} dur={0.6} ease={E.inOutSine} face outAt={T.comma} seed="s8/wedge" />
    </Sun>
  </>
);

// ---------------------------------------------------------------- the searchlight sweep (degrees BELOW the horizontal,
// pointing left across the dome from the tower inside its right flank)

const SWEEP: [number, number][] = [
  [T.that, 4],
  [T.once, -6],
  [T.tens + 0.3, -42], // crosses the dome's crown
  [T.hacking, 20], // sweeps back down and CATCHES a group at the rim, on the word
  [T.fortyFive, 8],
];
const sweepAngle = (t: number) => {
  if (t <= SWEEP[0][0]) return SWEEP[0][1];
  for (let i = 1; i < SWEEP.length; i++) {
    if (t <= SWEEP[i][0]) return lerp(SWEEP[i - 1][1], SWEEP[i][1], E.inOutSine(prog(t, SWEEP[i - 1][0], SWEEP[i][0] - SWEEP[i - 1][0])));
  }
  return 8 + 12 * Math.sin((t - T.fortyFive) * 1.5);
};

// ---------------------------------------------------------------- the near rattlers (row 3: NOT counted)

const at3 = (i: number) => R3[i].x - R3[i].h * 0.16;
const atX = (i: number) => EXTRA_DOORS3[i].x - EXTRA_DOORS3[i].h * 0.16;
const RATTLERS3: RattlerSpec[] = [
  // four on 'ALREADY', two more right after; two give up and hop to the next door on 'attempts'
  {x: at3(0), y: R3[0].y, h: R3[0].h, at: T.already, rattles: [T.already + 0.04, T.rattleA, T.thousands + 0.1, T.in + 0.1, T.millions, T.wave2 + 0.2], seed: 'r3a'},
  {x: at3(1), y: R3[1].y, h: R3[1].h, at: T.already + 0.05, rattles: [T.already + 0.09, T.itWas, T.thousands + 0.15, T.attempts + 0.42, T.comma, T.millions + 0.05], hop: {at: T.attempts, to: atX(1)}, seed: 'r3b'},
  {x: at3(2), y: R3[2].y, h: R3[2].h, at: T.already + 0.1, rattles: [T.already + 0.14, T.rattleA + 0.05, T.thousands + 0.2, T.in, T.millions + 0.1, T.within + 0.3], seed: 'r3c'},
  {x: at3(3), y: R3[3].y, h: R3[3].h, at: T.already + 0.15, rattles: [T.already + 0.19, T.itWas + 0.06, T.tens + 0.2, T.attempts + 0.5, T.millions + 0.1], hop: {at: T.attempts + 0.08, to: atX(2)}, seed: 'r3d'},
  {x: at3(4), y: R3[4].y, h: R3[4].h, at: T.already2, rattles: [T.already2 + 0.04, T.trying + 0.2], seed: 'r3e'},
  {x: atX(0), y: EXTRA_DOORS3[0].y, h: 60, at: T.already2 + 0.06, rattles: [T.already2 + 0.1, T.they + 0.2, T.hacking, T.comma + 0.05, T.wave2], seed: 'r3f'},
];
// 'millions': the near rooftops crowd up too: a second rank of 44-58 px figures pushing in behind the door rattlers
// (left of Pip and the board); on the second wave three more
const CROWD3: RattlerSpec[] = [
  ...[6, 60, 84, 148, 170, 226, 262, 300, 128].map((x, i): RattlerSpec => ({x, y: copingY(x) - 7, h: 58 + ((i * 7) % 17), at: T.millions + (i % 3) * 0.033, rattles: [], seed: `c3_${i}`, mode: 'stand'})),
  ...[40, 200, 312].map((x, i): RattlerSpec => ({x, y: copingY(x) - 8, h: 60 + i * 5, at: T.wave2 + i * 0.05, rattles: [], seed: `c3w_${i}`, mode: 'stand'})),
];
// row 2 (doors across the whole width, 30-40 px) on 'trying': six doors, two of them with a second figure waiting
const RATTLERS2: RattlerSpec[] = [
  ...R2.map((q, i) => ({
    x: q.x - q.h * 0.16,
    y: q.y,
    h: q.h,
    at: T.trying + (i % 3) * 0.1 + Math.floor(i / 3) * 0.05,
    rattles: [T.trying + 0.04 + (i % 3) * 0.1, T.rattleA + i * 0.06, T.itWas + 0.3 + i * 0.05, T.tens + (i % 3) * 0.1, T.attempts + 0.2 + i * 0.04, T.millions + i * 0.03],
    seed: `r2_${i}`,
  })),
  {x: R2[0].x + 20, y: R2[0].y + 1, h: 33, at: T.trying + 0.22, rattles: [T.tens + 0.2], seed: 'r2_w0'},
  {x: R2[5].x + 22, y: R2[5].y + 1, h: 35, at: T.trying + 0.28, rattles: [T.attempts], seed: 'r2_w1'},
];

// ---------------------------------------------------------------- the COUNTED pile against the dome's flank

const PILE: PileFig[] = (() => {
  // a HEAP against the left flank (up to y ~930: it never outlines the arc), widening outward as it grows
  const left = pileSlots(-1, {levels: 13, ground: 10, ranks: (L) => (L < 3 ? 7 : L < 6 ? 6 : L < 9 ? 4 : L < 11 ? 3 : 2), seed: 's8/pileL'});
  // on 'millions' a thin climb up the right flank too (one rank: clear of the board's edge at the push)
  const right = pileSlots(1, {levels: 8, ground: 1, ranks: () => 1, seed: 's8/pileR'});
  const caught = beamEnd(20);
  const out: PileFig[] = [];
  left.forEach((s, i) => {
    // 6 on 'they', +10 on 'tens', +20 on 'thousands' (a ripple), the rest climb on 'millions'
    const at = i < 6 ? T.they + i * 0.03 : i < 16 ? T.tens + (i - 6) * 0.02 : i < 36 ? T.thousands + ((i - 16) / 19) * 0.25 : T.millions + ((i - 36) % 3) * 0.033;
    const hit = Math.hypot(s.x - caught[0], s.y - s.h * 0.5 - caught[1]) < 42;
    out.push({x: s.x, y: s.y, h: s.h, side: -1, at, taps: [at + 0.02, ...(hit ? [T.hacking] : []), T.in + (i % 5) * 0.04, T.stamp1Ring + ((i * 3) % 7) * 0.03, T.millions + (i % 5) * 0.05, T.within + (i % 4) * 0.08], flash: hit ? T.hacking : undefined});
  });
  right.forEach((s, i) => {
    const at = T.millions + (i % 3) * 0.033;
    out.push({x: s.x, y: s.y, h: s.h, side: 1, at, taps: [at + 0.03, T.wave2 + (i % 4) * 0.05, T.within + (i % 3) * 0.1]});
  });
  // back to front: higher figures first, then the outer ranks over the inner ones
  return out.sort((a, b) => a.y - b.y);
})();

// ---------------------------------------------------------------- the flood ('millions'): ink-dark crowds OUTSIDE the dome

const behindBoard = (x: number) => x > BOARD.x0 + 5 && x < BOARD.x1 - 5;
const FLOOD = (() => {
  // 'use it': a first scatter along the far streets (rows 0-1)
  const useIt = crowdBand('s8/u', -40, 1120, 1096, 8, 10, 1, T.useIt, 0.28, {gap: 0.72, rank0: 2, skip: (x, y, h) => outsideDome(x, y, h)});
  // 'millions': ONE burst (2 frames, rippling out from the dome) over the far streets at the dome's foot, the mid
  // rooftops and the near rooftops; then a second wave over the far skyline left to right
  const far = crowdBand('s8/bf', -60, 1140, 1100, 10, 13, 3, T.millions, 0.067, {order: {from: DOME8.cx}, rank0: 3, skip: (x, y, h) => behindBoard(x) || outsideDome(x, y, h)});
  const mid = crowdBand('s8/bm', -40, 1120, 1228, 15, 21, 4, T.millions, 0.067, {order: {from: DOME8.cx}, rank0: 2, skip: (x) => behindBoard(x)});
  // (each band owns its draw ranks: rank0 .. rank0 + ranks - 1, back to front)
  const farWave = crowdBand('s8/wf', -60, 1140, 1030, 9, 11, 2, T.wave2, 0.25, {order: 'ltr', rank0: 0, skip: (x, y, h) => outsideDome(x, y, h)});
  const midWave = crowdBand('s8/wm', -40, 1120, 1182, 12, 15, 2, T.wave2 + 0.06, 0.2, {order: 'ltr', rank0: 0, skip: (x) => behindBoard(x)});
  return {far: [...farWave, ...useIt, ...far] as CrowdFig[], mid: [...midWave, ...mid] as CrowdFig[]};
})();

// the leaked copies landing in the far streets (paper specks)
const PAPER = [
  {x: 40, y: 1250, at: T.were + 0.3, s: 9},
  {x: 30, y: 1110, at: T.were + 0.38, s: 6},
  {x: 210, y: 1262, at: T.were + 0.45, s: 9},
  {x: 60, y: 1118, at: T.were + 0.5, s: 6},
  {x: 300, y: 1250, at: T.were + 0.56, s: 8},
  {x: 160, y: 1240, at: T.were + 0.62, s: 9},
];

// ---------------------------------------------------------------- the copies on the wires (S07 match) + Bit

// x0 / v0 = where and how fast S07 hands each copy over on the cut (scene07 CUT_COPIES / toCut: 387, 280, 124, 216 px/s
// on screen = 298, 215, 95, 166 world px/s here at zoom 1.3); then they ease off along the wire
const COPIES: CopySpec[] = [
  {wire: 0, x0: 128, v0: 298, tau: 0.5, vr: 20, unpegAt: T.were - 0.18, seed: 's8/cp0'},
  {wire: 2, x0: 262, v0: 215, tau: 0.5, vr: 20, unpegAt: T.were, seed: 's8/cp1'},
  {wire: 1, x0: 392, v0: 95, tau: 0.8, vr: 12, unpegAt: 2.62, seed: 's8/cp2'},
];
const BIT_COPY: CopySpec = {wire: 1, x0: 478, v0: 166, tau: 0.45, vr: 6, unpegAt: T.says + 0.35, seed: 's8/cp3'};

// ---------------------------------------------------------------- Pip (scale 0.75: the peak's tininess), LEFT of the board

const PIP_KEYS = [
  {t: 0, pose: 'sit-back' as const, look: -0.35},
  // 'it was': a turn toward the (still empty) board on his right: the glance reads
  {t: T.itWas, pose: 'sit-front' as const, look: 0.9},
  {t: T.itWas + 0.9, pose: 'sit-back' as const, look: 0.7},
  {t: T.tens + 0.15, pose: 'sit-back' as const, look: -0.8},
  {t: T.thousands + 0.2, pose: 'sit-back' as const, look: 0.6},
  {t: T.attempts + 0.1, pose: 'sit-back' as const, look: -0.9},
  {t: T.earsCover, pose: 'ears-cover' as const},
  {t: T.duskIdle, pose: 'sit-front' as const, expression: 'worried' as const},
];

// ---------------------------------------------------------------- the board (clipped above our coping: it stands behind it)

const BOARD_BOX: [number, number, number, number] = [BOARD.x0, BOARD.y0, BOARD.x1, BOARD.y1];
/** Footer height (world px): two 28 px lines with >= 6 px under the divider and >= 8 px above the frame. */
const FOOTER_H = 70;
const ZONES = counterBoardZones(BOARD_BOX, {footerH: FOOTER_H});
/** L9a's block: the note zone + the gutter up to the first gate (holds 28 px). */
const NOTE_ZONE: [number, number, number, number] = [ZONES.note[0] - 2, ZONES.note[1], ZONES.gates[0] - 6, ZONES.note[3]];

const AboveCoping: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const id = 'cp8' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const y = (x: number) => copingY(x) + 1;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={`M-200 -2000H1300V${y(1300).toFixed(1)}L-200 ${y(-200).toFixed(1)}Z`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
};

/** Dashed empty stamp slots on the board (an empty form waiting): each is covered by its stamp when it slams. */
const SlotOutline: React.FC<{box: [number, number, number, number]; from: number; to: number}> = ({box, from, to}) => {
  const t = useTimeLocal();
  if (t < from || t >= to) return null;
  const [x0, y0, x1, y1] = box;
  return <path d={`M${x0 + 6} ${y0 + 4}H${x1 - 6}V${y1 - 4}H${x0 + 6}Z`} fill="none" stroke={palette.ink} strokeWidth={1.4} strokeDasharray="7 7" strokeLinecap="round" />;
};

// ---------------------------------------------------------------- dome glass interior (for the overlays' clips)

const DOME_INTERIOR = (() => {
  const a = DOME8;
  let d = '';
  for (let i = 0; i <= 48; i++) {
    const th = (Math.PI * i) / 48;
    d += `${i ? 'L' : 'M'}${(a.cx + Math.cos(th) * a.rx).toFixed(1)} ${(a.by - Math.sin(th) * a.ry).toFixed(1)}`;
  }
  return d + 'Z';
})();

// ---------------------------------------------------------------- dusk

/** The set's peach horizon band, stepped toward sage with the dusk (storyboard layer 1: 'peach band (stepped to sage at
 *  dusk)'): it holds peach through the first steps (the last light), then snaps to a light sage band (two of the
 *  storyboard's dusk steps above the final sky) as the sun goes on 'day'. Drawn over the set's band (the sky layer)
 *  and, one more step lighter, inside the dome's glass. */
const DuskBand: React.FC<{glass?: boolean}> = ({glass}) => {
  const t = useTimeLocal();
  if (t < T.day) return null;
  const c = glass ? DUSK_STEPS[0] : DUSK_STEPS[2];
  const [y0, y1] = DOME.band;
  const node = <path d={`M-300 ${y0}H1400V${y1 + 2}H-300Z`} fill={c} />;
  return glass ? <g clipPath="url(#s8domeclip)">{node}</g> : node;
};

/** On 'day' the far rows relight to DUSK HAZE (fix round 1: they stayed golden cream, brighter than the sky): every fill
 *  of rows 0-1 snaps to one flat haze step above the sky (row 0 #84A895, row 1 #7A9B8A; their glass copies inside the
 *  dome one step lighter); the lit (peach) windows stay the only warm accents. A flat colour override of the set's
 *  fills (CSS on the layer group: no filter, no fade). */
const HAZE: Record<string, [string, string]> = {row0: ['#84A895', '#90B3A1'], row1: ['#7A9B8A', '#86A796']};
const LIT = [palette.peach, '#F5CCAF', palette.sun].map((c) => `:not([fill="${c}"]):not([fill="${c.toLowerCase()}"])`).join('');
const DuskRelight: React.FC<{name: string; children?: React.ReactNode}> = ({name, children}) => {
  const t = useTimeLocal();
  if (t < T.day || !HAZE[name]) return <>{children}</>;
  const [c, g] = HAZE[name];
  const cls = `s8dk-${name}`;
  return (
    <g className={cls}>
      <style>{`.${cls} path[fill]${LIT}:not([fill="none"]){fill:${c}}.${cls} g[clip-path] path[fill]${LIT}:not([fill="none"]){fill:${g}}`}</style>
      {children}
    </g>
  );
};

// ---------------------------------------------------------------- the layers

/** Overlays injected into the DomeCity v3 layers (by its layer names). */
const EXTRAS: Record<string, React.ReactNode> = {
  sky: <DuskBand />,
  domeGlass: (
    <>
      <defs>
        <clipPath id="s8domeclip" clipPathUnits="userSpaceOnUse">
          <path d={DOME_INTERIOR} />
        </clipPath>
      </defs>
      <DuskBand glass />
    </>
  ),
  row1: (
    <>
      <WindowWink x={8} y={1040} cols={4} rows={3} at={T.once + 0.05} size={5} />
      <Flood figs={FLOOD.far} flickerAt={T.duskIdle} seed="s8/ff" />
    </>
  ),
  dome: (
    <>
      <GlintSweep at={T.once} interior={DOME_INTERIOR} x0={82} x1={420} y={1060} L={190} />
      <Watchtower8 at={T.says} />
      <g clipPath="url(#s8domeclip)">
        <Searchlight8 at={T.that} angle={sweepAngle} duskAt={T.day} />
      </g>
      <RimPile figs={PILE} />
    </>
  ),
  row2: (
    <>
      <PaperSpecks spots={PAPER} />
      {RATTLERS2.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
      <Flood figs={FLOOD.mid} flickerAt={T.duskIdle} seed="s8/fm" />
    </>
  ),
  near: (
    <>
      <ExtraDoors />
      {CROWD3.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
      {RATTLERS3.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
    </>
  ),
  fg: (
    <>
      <DeckClutter />
      <Pigeons flyAt={T.trying} />
      <TelephoneWires spec={WIRES.S08} seed="s8/wires" />
      <AboveCoping>
        {COPIES.map((c) => (
          <WireCopy key={c.seed} {...c} />
        ))}
        <WireCopy {...BIT_COPY} />
      </AboveCoping>
      <AboveCoping>
        <CounterBoard
          box={BOARD_BOX}
          riseAt={T.board}
          header={['Cloudflare · sits in front', 'of about 1 in 5 websites']}
          headerSize={38}
          flagAt={T.announced}
          gatesAt={GATES_AT}
          footer={['Matthew Prince, Cloudflare CEO, on X', "Cloudflare's own count"]}
          footerAt={T.footer}
          footerSize={28}
          footerH={FOOTER_H}
          seed="s8/board"
        />
        <BoardNote zone={NOTE_ZONE} text={['counted from the', 'public announcement', 'attempts, not break-ins']} fontSize={28} at={T.announced + 0.08} seed="s8/note" />
        <SlotOutline box={ZONES.stamps[0]} from={T.board + 0.4} to={T.stamp1At} />
        <SlotOutline box={ZONES.stamps[1]} from={T.board + 0.4} to={T.stamp2At} />
      </AboveCoping>
      <InkStamp box={ZONES.stamps[0]} text="first 45 min: tens of thousands" fontSize={34} at={T.stamp1At} land={T.stamp1Land} s0={1.5} rot={-4} seed="s8/st1" />
      <InkStamp box={ZONES.stamps[1]} text="millions · within a day" fontSize={34} at={T.stamp2At} land={T.stamp2Land} s0={2.0} rot={-3} seed="s8/st2" />
      <StampHit box={ZONES.stamps[0]} at={T.stamp1Land} dur={0.3} />
      <StampHit box={ZONES.stamps[1]} at={T.stamp2Land} dur={0.3} />
      <BitRide plan={{copy: BIT_COPY, hopAt: T.bitHop, land: [BOARD.x0 + 32, BOARD.y0], crawlAt: T.bitHop + 0.55, crawlTo: [ZONES.top[0] - 14, BOARD.y0], alertAt: T.millionsWord, zoomAt: (tt) => camAt(CAMERA, tt).zoom, cheers: [T.tens + 0.06, T.thousands + 0.06, T.attempts + 0.1], size: 20}} />
      <Pip plan={{hopAt: T.settle - 0.48, hopFrom: [-90, copingY(-90)], hopDur: 0.48, spot: PIP, keys: PIP_KEYS, scale: 0.75}} />
    </>
  ),
};

const wrap = (name: string, _nearness: number, node: React.ReactNode) =>
  // the sun is screen space (it only swells and sets: no parallax, no lens)
  name === 'sun' ? (
    node
  ) : (
    <Layer depth={depthOf(name)}>
      <DuskRelight name={name}>{node}</DuskRelight>
      {EXTRAS[name]}
    </Layer>
  );

const Scene08: React.FC = () => (
  <World stage="context" sky={SKY}>
    <ShotCam keys={CAMERA}>
      <DomeCity
        dome={DOME8}
        wrap={wrap}
        sun={<SunInSky />}
        dotsAt={0.12}
        domeAt={T.cloudflare}
        domeDur={0.5}
        towerAt={1e6}
        footprintAt={false}
        duskAt={T.within}
        observer={false}
      />
    </ShotCam>
  </World>
);

export default Scene08;
