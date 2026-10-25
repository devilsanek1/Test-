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
import {World, Sun, palette, skies} from '../lib';
import {sunPoseAt} from '../lib/Sun';
import type {SunMove} from '../lib/Sun';
import {ease as E, lerp, prog, useTime as useTimeLocal} from '../lib/time';
import {camAt, Layer, layerMat} from '../lib/cine/camera';
import type {CamKey} from '../lib/cine/camera';
import {ShotCam} from '../lib/ShotCam';
import {Tod} from '../lib/tod';
import {Ink} from '../lib/Ink';
import {rand} from '../lib/rng';
import type {SkyKey} from '../lib/World';
import {CounterBoard, counterBoardZones, SunGlowSteps} from './shared/props';
import {DomeCity, DOME, TelephoneWires, WIRES} from './shared/sets';
import {DUR, GATES_AT, T} from './scene08/times';
import {BOARD, copingY, depthOf, DOME8, domeY, DOORS3, PIP, PUSH_X, R2} from './scene08/layout';
import {BitRide, CopySpec, GlintSweep, PaperSpecks, Pigeons, Pip, StampHit, WindowWink, WireCopy} from './scene08/cast';
import {clumpBand, CrowdFig, Flood, NearCrowd, NearFig, outsideDome, Pile, PileFig, pileSlots, Rattler, RattlerSpec, roofBand} from './scene08/crowd';
import {BeamSpot, beamHit, Searchlight8, Watchtower8} from './scene08/tower';
import {BoardNote, InkStamp, MinuteWedge} from './scene08/shims';
import {DeckClutter, DistrictTowers, DomePlinth, LightDoors, Neighbours, NEIGHBOUR_F, WireSpans} from './scene08/extras';

// ---------------------------------------------------------------- camera (depth-0 plane = our parapet)

const DOLLY = 1 - 1 / 1.15; // the baseline push is a DOLLY: far rows grow less, the sky and the sun not at all
/** Fix round 2: the payoff's pull-back lands with the depth-0 plane 60 px LOWER than the crane's rest (camera y 900):
 *  the board drops out of the flood band (its top at screen ~1106) while the far rows (f 0.02) and the sky / sun stay
 *  put, so the set point x 700 for S09 is unchanged. */
const VISTA_Y = 900;

/** Position keys; the crane's ZOOM runs on its own track (`craneZoom`, ShotCam add): S07 exits as a pure translation, so
 *  the crane's x / y keep out(quart) from S07's exit speed while the zoom 1.3 -> 1.0 starts at zero rate (inOutSine):
 *  on the cut the frame moves as one (26 px / frame everywhere), no top / bottom speed split. */
export const CAMERA: CamKey[] = [
  {t: 0, x: 540, y: 1260, zoom: 1, push: 0},
  // BIG MOVE 1: the multiplane crane, a fixed 2.0 s from the cut, entering at S07's tilt exit speed (out(quart))
  {t: T.craneEnd, x: 540, y: 960, zoom: 1, push: 0, ease: E.outQuart},
  {t: T.pushAt, x: 540, y: 960, zoom: 1, push: 0},
  // BASELINE: a slow dolly push toward the dome and the board over 'Cloudflare ... forty-five minutes'
  // (x 530: the whole board stays left of the right rail at 1.15, the dome stays clear of it on the left)
  {t: T.pushEnd, x: PUSH_X, y: 1100, zoom: 1, push: DOLLY, ease: E.inOutSine},
  {t: T.pullAt, x: PUSH_X, y: 1100, zoom: 1, push: DOLLY},
  // PEAK again: pull back to the vista on 'millions' (a fixed 0.9 s), the board dropping below the flood band
  {t: T.pullEnd, x: 540, y: VISTA_Y, zoom: 1, push: 0, ease: E.inOutSine},
  {t: DUR + 1, x: 540, y: VISTA_Y, zoom: 1, push: 0},
];
/** The crane's lens zoom (multiplies the keys' zoom): 1.3 -> 1.0 over the crane's 2.0 s, inOutSine in log space. */
export const craneZoom = (t: number) => Math.exp(Math.log(1.3) * (1 - E.inOutSine(prog(t, 0, T.craneEnd))));
const camZoom = (t: number) => camAt(CAMERA, t).zoom * craneZoom(t);

const Cam8: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const t = useTimeLocal();
  return (
    <ShotCam keys={CAMERA} add={{zoom: craneZoom(t)}}>
      {children}
    </ShotCam>
  );
};

// ---------------------------------------------------------------- sky: golden, then a STEPPED uniform dusk tween

const DUSK_STEPS = ['#A0C7B5', '#94BDAA', '#88B3A0', '#7CA995', '#709F8B'];
const SKY: SkyKey[] = [{t: 0, tod: 'golden'}, ...DUSK_STEPS.map((c, i): SkyKey => ({t: T.within + i * 0.15, color: c, wipe: 'snap', ...(i === 4 ? {tod: 'dusk' as const} : {})}))];

// ---------------------------------------------------------------- the sun (screen space, behind every row)

const SUN = {x: DOME.sunV3.x, y: DOME.sunV3.y, r: DOME.sunV3.r};
/** 'forty-five': the sun hops up (fix round 3b: lands at centre 868, top ~606 at rest; the hop's own stretch is clamped
 *  so the disc top never rises above screen y 588, under the caption floor 570) and becomes a clock, landing on the
 *  word. A custom hop (position = a SunMove whose ease carries the ballistic arc; squash / stretch = a wrapper anchored
 *  at the disc bottom): the take-off starts FROM the bottom of the anticipation squash (one in-between frame instead of
 *  the kit hop's one-frame squash -> stretch snap). */
const HOP = {at: T.hopOff, to: 868, air: 0.22, h: 50, antic: 0.1};
const hopEase = (u: number) => u + ((4 * HOP.h) / (SUN.y - HOP.to)) * u * (1 - u);
const SUN_MOVES: SunMove[] = [
  // fix round 3b: carries S07's downward slide over ~6 frames (10 / 7 / 4 / 2 px per frame: the far plane brakes
  // instead of stopping in 3 frames), still half behind the skyline ...
  {at: 0, dur: 0.2, y: 1045, ease: E.outCubic},
  // ... then swells to the peak sun, half-set on the skyline, during the crane
  {at: 0.2, dur: 1.7, x: SUN.x, y: SUN.y, r: SUN.r, ease: E.inOutSine},
  // the hop ('forty-five')
  {at: HOP.at, dur: HOP.air, y: HOP.to, ease: hopEase},
  // sinks back onto the horizon after the clock (the comma pause)
  {at: T.comma, dur: 0.4, y: SUN.y, ease: E.inOutSine},
  // the film's one sunset, in two steps, each completing ON its word (gone at screen x 700: S09's sunrise point)
  {at: T.sunset1, dur: 0.16, y: 1130, ease: E.inCubic},
  {at: T.sunset2, dur: 0.16, y: 1320, ease: E.inCubic},
];
/** The hop's squash / stretch (sx, sy) at t, anchored at the disc bottom: anticipation squash 1.07 / 0.91 over 0.1 s,
 *  the take-off stretching from that squash to 1.06 by 30 % of the air, back to round by 55 %, a landing stretch of
 *  only 1.03 (the clamp), then a landing squash from that stretch to 0.92 (0.1 s) and back (0.13 s). */
function hopSquash(t: number): [number, number] {
  const t0 = HOP.at;
  if (t < t0 - HOP.antic || t > t0 + HOP.air + 0.23) return [1, 1];
  if (t < t0) {
    const q = E.outCubic(prog(t, t0 - HOP.antic, HOP.antic));
    return [lerp(1, 1.07, q), lerp(1, 0.91, q)];
  }
  if (t < t0 + HOP.air) {
    const u = (t - t0) / HOP.air;
    const sy = u < 0.3 ? lerp(0.91, 1.06, u / 0.3) : u < 0.55 ? lerp(1.06, 1, (u - 0.3) / 0.25) : u < 0.85 ? 1 : lerp(1, 1.03, (u - 0.85) / 0.15);
    return [1 / Math.sqrt(sy), sy];
  }
  // the landing squash starts FROM the landing stretch (no 70 px one-frame drop of the disc top): 1.03 -> 0.92 over
  // 0.1 s, recovering over 0.13 s
  const dt = t - (t0 + HOP.air);
  if (dt < 0.1) {
    const q = E.outCubic(dt / 0.1);
    const sy = lerp(1.03, 0.92, q);
    return [1 / Math.sqrt(sy), sy];
  }
  const q = E.outCubic(Math.min(1, (dt - 0.1) / 0.13));
  const sy = lerp(0.92, 1, q);
  return [1 / Math.sqrt(sy), sy];
}
// the clock face: inset in the hopped sun's visible top (screen centre (700, 768), face r 144: y 624-912, between the
// caption floor 570 and the board's top edge 898 at the push), so the whole 3/4 wedge, all 4 ticks and the hand read
const FACE = {dy: -100, r: 160};

/** The two stepped flat glow rings, both shrinking TOGETHER (no stagger) and gone on `goneAt` (before the sun moves).
 *  Fix round 3b: the playbook's two WARM steps (style_bible_ref2 8: #F19260 at x1.25, peach at x1.5; the outer ring
 *  was cream, the board's value, and read as a pale rainbow), and clipped OUT of the dome's glass (the broad dome now
 *  reaches under the rings: the clip follows the dome layer through the camera). */
const Rings: React.FC<{at: number; outAt: number; goneAt: number}> = ({at, outAt, goneAt}) => {
  const t = useTimeLocal();
  if (t >= goneAt) return null;
  const c = camAt(CAMERA, t);
  const m = layerMat({...c, zoom: c.zoom * craneZoom(t)}, depthOf('dome'));
  return (
    <>
      <defs>
        <clipPath id="s8ringclip" clipPathUnits="userSpaceOnUse">
          <path d={`M-400 -400H1500V2400H-400Z${DOME_INTERIOR}`} clipRule="evenodd" transform={`matrix(${m.map((v) => v.toFixed(4)).join(' ')})`} />
        </clipPath>
      </defs>
      <g clipPath="url(#s8ringclip)">
        <SunGlowSteps cx={SUN.x} cy={SUN.y} r={SUN.r} at={at + 0.08} outAt={outAt} rings={[{k: 1.5, color: palette.peach}]} />
        <SunGlowSteps cx={SUN.x} cy={SUN.y} r={SUN.r} at={at} outAt={outAt} rings={[{k: 1.25, color: '#F19260'}]} />
      </g>
    </>
  );
};

/** Fix round 3: S09 opens on a sage dusk with cream stars; three of them (at S09's own screen spots, measured on its
 *  frame 0) pop in S08's last 0.35 s, one by one, so the stars are already out across the cut. Screen space. */
const STARS = [
  {x: 241, y: 153, r: 4.4, at: T.day + 0.06},
  {x: 669, y: 129, r: 3.1, at: T.day + 0.14},
  {x: 989, y: 175, r: 4.1, at: T.day + 0.22},
];
const Stars: React.FC = () => {
  const t = useTimeLocal();
  return (
    <>
      {STARS.map((s) => (t >= s.at ? <circle key={s.x} cx={s.x} cy={s.y} r={t < s.at + 0.067 ? s.r * 1.5 : s.r} fill={palette.cream} /> : null))}
    </>
  );
};

/** The hop's squash / stretch around the sun (anchored at the disc bottom: the pose from the same moves). */
const HopSquash: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const t = useTimeLocal();
  const [sx, sy] = hopSquash(t);
  if (sx === 1 && sy === 1) return <>{children}</>;
  const p = sunPoseAt(t, {cx: 640, cy: 1021, r: 110, moves: SUN_MOVES});
  const by = p.y + p.r;
  return <g transform={`translate(${p.x.toFixed(2)} ${by.toFixed(2)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(${(-p.x).toFixed(2)} ${(-by).toFixed(2)})`}>{children}</g>;
};

const SunInSky: React.FC = () => (
  <>
    <Stars />
    {/* fix round 3: the rings pop off in 3 frames straight into the hop's anticipation (one action ending on
        'forty-five'; they used to shrink 0.3 s early, in the gap between 'attempts' and 'in') */}
    <Rings at={T.settle} outAt={T.hopOff - 0.2} goneAt={T.hopOff - 0.1} />
    {/* fix round 2: no second ring pair after the clock (it held only 0.24 s and blinked over the payoff): the sun stays
        ringless from the clock through the sunset */}
    <HopSquash>
      <Sun cx={640} cy={1021} r={110} drift={[0, 0]} moves={SUN_MOVES} breathe={0.01}>
        <MinuteWedge r={FACE.r} cy={FACE.dy} at={T.fortyFiveWord} dur={0.6} ease={E.inOutSine} face outAt={T.comma} seed="s8/wedge" />
      </Sun>
    </HopSquash>
  </>
);

// ---------------------------------------------------------------- the searchlight sweep (degrees BELOW the horizontal,
// pointing left across the dome from the tower inside its right flank)

/** 'hacking': the beam swings down onto the pile at the dome's foot (its centre line ends at the foot ~x 158). */
const CATCH_DEG = 39;
const SWEEP: [number, number][] = [
  [T.that, 4],
  [T.once, -6],
  [T.tens + 0.3, -42], // crosses the dome's crown
  [T.hacking, CATCH_DEG], // sweeps back down and CATCHES a group of the pile, on the word
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

const door3 = (i: number) => DOORS3[i];
const R3 = (i: number, h: number) => ({x: door3(i).x, y: door3(i).y, dh: door3(i).h, h});
const RATTLERS3: RattlerSpec[] = [
  // 'ALREADY': three pop (the two nearest at 86-92 px), a fourth on the second beat; on 'attempts' A gives up and hops
  // to the edge door, and D takes A's door (a chain of two hops)
  {...R3(0, 86), at: T.already, rattles: [T.already + 0.04, T.rattleA, T.itWas + 0.06, T.thousands + 0.1, T.millions, T.wave2 + 0.2], hop: {at: T.attempts, to: door3(4).x, toY: door3(4).y}, coat: palette.tealDark, legs: palette.sage, seed: 'r3a'},
  {...R3(2, 92), at: T.already + 0.05, rattles: [T.already + 0.09, T.says + 0.05, T.itWas, T.thousands + 0.15, T.attempts + 0.42, T.comma, T.millions + 0.05], coat: palette.brown, legs: palette.tan, seed: 'r3b'},
  {...R3(3, 62), at: T.already + 0.1, rattles: [T.already + 0.14, T.trying + 0.2], coat: palette.teal, legs: palette.sand, seed: 'r3c'},
  {...R3(1, 90), at: T.already2, rattles: [T.already2 + 0.04, T.rattleA + 0.05, T.they + 0.2, T.hacking, T.comma + 0.05, T.wave2], hop: {at: T.attempts + 0.12, to: door3(0).x, toY: door3(0).y}, coat: palette.tealDark, legs: palette.tan, seed: 'r3d'},
];
// row 2 (doors across the whole width, 32-40 px) on 'trying'; one extra rattle at 2.25 s (the crane's settle: a fresh
// onset in the gap before the end of 'it')
const RATTLERS2: RattlerSpec[] = R2.map((q, i) => ({
  x: q.x,
  y: q.y,
  h: q.h,
  dh: q.h * 1.18,
  at: T.trying + (i % 3) * 0.1 + Math.floor(i / 3) * 0.05,
  // fix round 3b: two more row-2 rattle waves between 'that' and 'announced' (3.35 / 4.05 s: fresh onsets in the thin
  // 3-5 s stretch)
  rattles: [T.trying + 0.04 + (i % 3) * 0.1, ...(i === 1 ? [2.25] : []), T.rattleA + i * 0.06, T.says + 0.155 + i * 0.04, T.itWas + 0.09 + i * 0.04, T.tens + (i % 3) * 0.1, T.attempts + 0.2 + i * 0.04, T.millions + i * 0.03],
  seed: `r2_${i}`,
}));

// ---------------------------------------------------------------- the COUNTED pile at the dome's foot (x >= 120)

/** Where the beam lands on 'hacking' (on the crowd in front of the foot): the caught group is around this x. */
const CATCH_X = beamHit(CATCH_DEG).p[0];

const PILE: PileFig[] = (() => {
  // fix round 3: ranks IN FRONT of the near foot (rank 0's base just below the foot line, every further rank stepping
  // down and forward), so only heads, raised fists and ripples overlap the bottom of the glass; on 'millions' a heap
  // climbs the OUTSIDE of the left flank, hands on the glass
  // fix round 3b: the climbers stand ON the broad dome's left shoulder (feet on the arc at x 104-236)
  const slots = pileSlots({seed: 's8/pile', front: {x0: 112, x1: 404, y: 1099, h: [24, 30], ranks: 4}, flank: {x0: 102, x1: 250, n: 14, h: [21, 27], minX: 96}});
  const early = slots.filter((s) => !s.flank && s.rank < 3).sort((a, b) => a.rank - b.rank || a.x - b.x);
  const late = slots.filter((s) => s.flank || s.rank >= 3);
  const out: PileFig[] = [];
  const n = early.length;
  early.forEach((s, i) => {
    // 6 on 'they', +10 on 'tens', the rest on 'thousands' (a ripple left to right); the back rank (against the glass)
    // fills first
    const at = i < 6 ? T.they + i * 0.03 : i < 16 ? T.tens + (i - 6) * 0.02 : T.thousands + ((i - 16) / Math.max(1, n - 17)) * 0.25;
    const hit = s.rank <= 1 && Math.abs(s.x - CATCH_X) < 30;
    const armP = s.rank === 0 ? 0.5 : s.rank === 1 ? 0.22 : 0;
    const arm = rand('s8/pa', `${i}`) < armP ? ((rand('s8/pas', `${i}`) < 0.5 ? -1 : 1) as -1 | 1) : undefined;
    out.push({
      x: s.x,
      y: s.y,
      h: s.h,
      at,
      hood: rand('s8/ph', `${i}`) < 0.65,
      fill: (i % 2) as 0 | 1,
      arm,
      taps: [at + 0.02, ...(i < 16 ? [T.thousands + (i % 4) * 0.05] : []), ...(hit ? [T.hacking] : []), T.in + (i % 5) * 0.04, T.stamp1Ring + ((i * 3) % 7) * 0.03, T.millions + (i % 5) * 0.05, T.within + (i % 4) * 0.08],
      flash: hit ? T.hacking : undefined,
    });
  });
  late.forEach((s, i) => {
    // fix round 3b: every climber is up by 'millions' + 1 frame (they used to ripple in until f266, after the burst)
    const at = s.flank ? T.millions + (s.rank % 2) * 0.033 : T.millions + (i % 3) * 0.033;
    const reach = 0.5 * s.h;
    out.push({
      x: s.x,
      y: s.y,
      h: s.h,
      at,
      hood: rand('s8/ph', `l${i}`) < 0.65,
      fill: (i % 2) as 0 | 1,
      arm: s.flank ? 1 : i % 4 === 0 ? -1 : undefined,
      // the hand ON the glass up-slope of the climber's feet
      reachTo: s.flank ? [s.x + reach, domeY(s.x + reach) + 1.5] : undefined,
      taps: [at + 0.03, T.wave2 + (i % 4) * 0.05, T.within + (i % 3) * 0.1],
    });
  });
  // back to front: higher figures first
  return out.sort((a, b) => a.y - b.y);
})();

// ---------------------------------------------------------------- the flood ('millions'): crowds OUTSIDE the dome

/** The burst as three stepped WAVES out from the dome, one frame each (fix round 3b): row 2 on 'millions' - 0.15 (8.69,
 *  f261), the mid tier on row 3 at f262, row 1 at 8.76 (f263), row 0 (the far skyline) at 8.89 (f267); wave 2 (9.19)
 *  adds every row's back rank left to right. */
const WAVE = {row2: T.millions, row1: T.millions + 0.07, row0: T.millions + 0.2, mid: T.millions + 0.03};
/** Row-2 figures behind the board (x 450-870) are hidden there unless they stand on a roof high enough to show above
 *  the board's top edge at the vista (world y < 1092). */
const behindBoard2 = (x: number, y: number) => x > 450 && x < 870 && y > 1092;
/** Row-3 figures (the mid tier) only where the board does not cover them. */
const behindBoard3 = (x: number) => x > 400 && x < 905;
const inDomeSkip = (x: number, y: number, h: number) => outsideDome(x, y, h) || (x > DOME8.cx - DOME8.rx - 4 && x < DOME8.cx + DOME8.rx + 4 && y > DOME8.by - 30 && y < DOME8.by + 8);

const FLOOD = (() => {
  // fix round 3b (the reviewers: 'make the flood a MASS, not a texture line'): every building of rows 0-2 gets a PACKED
  // rooftop crowd (roofs.ts replays the set's own rows) in clumps with 1-5 px gaps and ~5 % empty roofs: rows 0-1 at
  // 7-12 px, row 2 at 13-19 px, 3 ranks on the burst + a 4th on wave 2 (the far skyline: silhouettes on the peach band
  // and against the sun); plus street clumps at the foot of rows 0 / 1 / 2 (seen in the gaps between the nearer
  // roofs) that walk toward the dome; a mid tier of 20-30 px raised-arm busts on the row-3 roofs either side of the board.
  // 'use it' (fix round 3b: the 4-8 px specks read as grass): four clumps of 10-14 px figures on row-2 ROOFTOPS right
  // of the dome, visible at rest; they stay and become part of the flood
  const useIt = [
    [496, 566],
    [628, 700],
    [902, 966],
    [998, 1060],
  ].flatMap(([x0, x1], k) => roofBand(`s8/u${k}`, 2, x0, x1, [10, 14], [T.useIt + k * 0.06], {ranks: 1, clump: [3, 5], empty: 0, arms: 4, rank0: 3}));
  const row2 = [
    ...roofBand('s8/r2', 2, -40, 1120, [13, 19], [WAVE.row2, WAVE.row2, WAVE.row2], {ranks: 3, rank0: 1, arms: 7, empty: 0.05, skip: behindBoard2}),
    ...roofBand('s8/r2w', 2, -40, 1120, [13, 19], [0, 0, 0, T.wave2], {ranks: 4, rankFrom: 3, rank0: 0, empty: 0.05, skip: behindBoard2, span: 0.2, order: 'ltr'}),
  ];
  const row1 = [
    ...roofBand('s8/r1', 1, -40, 1120, [9, 12], [WAVE.row1, WAVE.row1, WAVE.row1], {ranks: 3, rank0: 1, arms: 9, empty: 0.05, skip: inDomeSkip}),
    ...roofBand('s8/r1w', 1, -40, 1120, [9, 12], [0, 0, 0, T.wave2 + 0.03], {ranks: 4, rankFrom: 3, rank0: 0, empty: 0.05, skip: inDomeSkip, span: 0.22, order: 'ltr'}),
  ];
  const row0 = [
    ...roofBand('s8/r0', 0, -40, 1120, [7, 9], [WAVE.row0, WAVE.row0, WAVE.row0], {ranks: 3, rank0: 1, arms: 12, empty: 0.05, skip: inDomeSkip}),
    ...roofBand('s8/r0w', 0, -40, 1120, [7, 9], [0, 0, 0, T.wave2 + 0.06], {ranks: 4, rankFrom: 3, rank0: 0, empty: 0.05, skip: inDomeSkip, span: 0.24, order: 'ltr'}),
  ];
  // the streets: clumps at the foot of row 0 (behind row 1), row 1 (on the StreetStrip, behind row 2) and row 2 (above
  // the low row-3 sheds), walking toward the dome
  const st0 = [
    ...clumpBand('s8/s0a', -40, 1120, 1048, 7, WAVE.row0, 0, {clump: [4, 8], gap: [0, 6], jy: 2, skip: inDomeSkip, toward: DOME8.cx, vx: 3}),
    ...clumpBand('s8/s0b', -30, 1120, 1053, 8, T.wave2 + 0.06, 0.24, {order: 'ltr', clump: [4, 8], gap: [0, 8], jy: 2, skip: inDomeSkip, toward: DOME8.cx, vx: 3}),
  ];
  const st1 = [
    ...clumpBand('s8/s1a', -40, 1120, 1114, 9, WAVE.row1, 0, {clump: [4, 8], gap: [0, 6], jy: 3, arms: 9, skip: inDomeSkip, toward: DOME8.cx, vx: 4}),
    ...clumpBand('s8/s1b', -30, 1120, 1124, 10, T.wave2 + 0.03, 0.22, {order: 'ltr', clump: [4, 8], gap: [0, 8], jy: 3, skip: inDomeSkip, toward: DOME8.cx, vx: 4}),
  ];
  const st2 = [
    ...clumpBand('s8/bm0', -40, 1120, 1294, 13, WAVE.row2, 0, {clump: [3, 7], gap: [0, 8], jy: 3, arms: 7, toward: DOME8.cx, vx: 8}),
    ...clumpBand('s8/bm1', -30, 1120, 1304, 15, WAVE.row2, 0, {clump: [3, 7], gap: [0, 10], jy: 3, arms: 6, toward: DOME8.cx, vx: 9}),
    ...clumpBand('s8/bm2', -20, 1120, 1313, 17, T.wave2, 0.2, {order: 'ltr', clump: [2, 5], gap: [6, 24], jy: 3, arms: 5, toward: DOME8.cx, vx: 10}),
  ];
  // the mid tier: 20-30 px raised-arm busts on the row-3 rooftops either side of the board (between the 60-90 px
  // rattlers and the far crowd)
  const mid = [
    ...roofBand('s8/r3', 3, -40, 1120, [20, 30], [WAVE.mid, WAVE.mid], {ranks: 2, rank0: 1, clump: [3, 6], empty: 0.05, arms: 1.6, skip: (x) => behindBoard3(x), dy: 1}),
    // wave 2: 'more rattlers crowd row 3': a street crowd of 38-50 px busts at the row-3 doors where no rattler stands
    // (left of the first door, right of the board)
    ...clumpBand('s8/s3', 890, 1120, 1438, 44, T.wave2, 0.12, {order: 'ltr', clump: [3, 5], gap: [0, 6], jy: 3, arms: 3, rank: 0}),
    ...clumpBand('s8/s3l', -40, 70, 1440, 44, T.wave2 + 0.05, 0.08, {order: 'ltr', clump: [2, 3], gap: [0, 4], jy: 3, arms: 3, rank: 0}),
  ];
  return {
    row0: row0 as CrowdFig[],
    st0: st0 as CrowdFig[],
    row1: row1 as CrowdFig[],
    st1: st1 as CrowdFig[],
    row2: [...useIt, ...row2] as CrowdFig[],
    st2: st2 as CrowdFig[],
    mid: mid as CrowdFig[],
  };
})();

// 'millions': big busts RISE from behind our coping (fix round 3b: the fg layer, clipped above the coping, so they rise
// on the word at the push framing; they used to sit in the near layer at copingY + 30 where the parapet hid them until
// the pull-back's parallax revealed them, after the word). Left of Pip and right of the board; the lower 26-30 px stay
// behind the coping.
const NEAR: NearFig[] = [
  // a back rank (smaller, 20 px lower) between the front busts, rising with them
  {x: 92, h: 84, at: T.millions - 0.01, fill: 0, hood: true, seed: 'n6', dy: -6},
  {x: 188, h: 82, at: T.millions - 0.01, fill: 1, hood: false, arm: 1, seed: 'n7', dy: -6},
  {x: 278, h: 80, at: T.millions + 0.023, fill: 0, hood: true, seed: 'n8', dy: -6},
  {x: 44, h: 100, at: T.millions - 0.01, fill: 0, hood: true, arm: 1, seed: 'n0'},
  {x: 140, h: 108, at: T.millions - 0.01, fill: 1, hood: true, seed: 'n1'},
  {x: 236, h: 96, at: T.millions + 0.023, fill: 0, hood: false, arm: -1, seed: 'n2'},
  {x: 318, h: 90, at: T.millions + 0.023, fill: 1, hood: true, seed: 'n3'},
  {x: 940, h: 104, at: T.millions - 0.01, fill: 1, hood: true, arm: -1, seed: 'n4'},
  {x: 1036, h: 110, at: T.millions + 0.023, fill: 0, hood: true, seed: 'n5'},
].map(({dy = 0, ...f}) => ({...f, y: copingY(f.x) + 28 + dy})) as NearFig[];

// the leaked copies landing in the far streets (paper specks)
const PAPER = [
  {x: 40, y: 1250, at: T.were + 0.3, s: 14},
  {x: 30, y: 1110, at: T.were + 0.38, s: 10},
  {x: 210, y: 1262, at: T.were + 0.45, s: 15},
  {x: 60, y: 1118, at: T.were + 0.5, s: 10},
  {x: 300, y: 1250, at: T.were + 0.56, s: 13},
  {x: 160, y: 1240, at: T.were + 0.62, s: 15},
];

// ---------------------------------------------------------------- the copies on the wires (S07 match) + Bit

// x0 / v0 = where and how fast S07 hands each copy over on the cut (scene07 CUT_COPIES / toCut: 387, 280, 124, 216 px/s
// on screen = 298, 215, 95, 166 world px/s here at zoom 1.3); then they ease off along the wire
const COPIES: CopySpec[] = [
  {wire: 0, x0: 128, v0: 298, tau: 0.5, vr: 20, unpegAt: T.were - 0.18, seed: 's8/cp0'},
  {wire: 2, x0: 262, v0: 215, tau: 0.5, vr: 20, unpegAt: T.were, seed: 's8/cp1'},
  // fix round 2: lets go at 2.22 s (end of 'it'), a fresh onset in the crane's settle
  {wire: 1, x0: 392, v0: 95, tau: 0.8, vr: 12, unpegAt: 2.22, seed: 's8/cp2'},
];
const BIT_COPY: CopySpec = {wire: 1, x0: 478, v0: 166, tau: 0.45, vr: 6, unpegAt: T.says + 0.35, seed: 's8/cp3'};

// ---------------------------------------------------------------- Pip (scale 0.75: the peak's tininess), LEFT of the board

const PIP_KEYS = [
  {t: 0, pose: 'sit-back' as const, look: -0.35},
  // 'it was': fix round 2: he stands up in PROFILE facing RIGHT at the (still empty) board for 0.45 s (the sit-front
  // glance looked at the viewer; a sit-back head turn barely moved), then sits back down still looking at it
  {t: T.itWas, pose: 'stand-side' as const},
  {t: T.itWas + 0.45, pose: 'sit-back' as const, look: 0.7},
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
/** L9a's block: the note zone + the gutter up to the first gate (holds 28 px); fix round 2: 11 px right of the flag's
 *  pennant (it touched the 'c' of 'counted'). */
const NOTE_ZONE: [number, number, number, number] = [ZONES.note[0] + 9, ZONES.note[1], ZONES.gates[0] - 4, ZONES.note[3]];

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

/** Fix round 3b: during the header-only hold (L8 alone 1.7 s) the empty face shows the board's CONSTRUCTION in faint tan
 *  pencil (1.1 px, the 'not finished, waiting' read instead of a blank 440 x 380 face): the start flag's post and
 *  pennant outline, an empty dashed tally frame in the gates zone and two dashed stamp slots. Each goes when its inked
 *  counterpart arrives: the flag on 'announced', the tally frame on 'tens', the slots as their stamps land. */
const PENCIL = (() => {
  const [fx0, fy0, fx1, fy1] = ZONES.flag;
  const pw = fx1 - fx0;
  const ph = fy1 - fy0;
  const px = fx0 + pw * 0.3;
  const flag = `M${px} ${fy0}L${px} ${fy1}M${px - pw * 0.25} ${fy1}L${px + pw * 0.35} ${fy1}M${px} ${fy0 + ph * 0.06}L${px + pw * 0.62} ${fy0 + ph * 0.17}L${px} ${fy0 + ph * 0.3}`;
  const box = (r: [number, number, number, number], i: number) => `M${r[0] + i} ${r[1] + i}H${r[2] - i}V${r[3] - i}H${r[0] + i}Z`;
  return {flag, gates: box(ZONES.gates, 4), slot1: box(ZONES.stamps[0], 3), slot2: box(ZONES.stamps[1], 3)};
})();
const BoardPencil: React.FC<{at: number}> = ({at}) => {
  const t = useTimeLocal();
  if (t < at) return null;
  const pen = (d: string, key: string, dash?: string) => <Ink key={key} d={d} width={1.1} color={palette.tan} taper={false} dash={dash} seed={`s8/pen${key}`} />;
  return (
    <>
      {t < T.announced ? pen(PENCIL.flag, 'f') : null}
      {t < T.tens ? pen(PENCIL.gates, 'g', '6 5') : null}
      {t < T.stamp1Land ? pen(PENCIL.slot1, 's1', '6 5') : null}
      {t < T.stamp2Land ? pen(PENCIL.slot2, 's2', '6 5') : null}
    </>
  );
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

/** Fix round 3 (the S07 -> S08 seam): S07's golden band ends at screen ~934 on its last frame (its tilt moves 26 px /
 *  frame), the set's band top (world 880) sat at screen 856 on our first: a 78 px jump UP while everything else moved
 *  down. The band's top now starts at world 960 (= screen 960 at the crane's 1.3 lens: where S07's band edge lands
 *  next) and settles to 880 with an inOutSine over the crane (starting STILL, as a horizon should under a crane): a
 *  sky-coloured cover over the band's top part, gone at the crane's end. */
const CutBand: React.FC = () => {
  const t = useTimeLocal();
  if (t >= T.craneEnd) return null;
  const y1 = 960 - 80 * E.inOutSine(prog(t, 0, T.craneEnd));
  if (y1 <= DOME.band[0] + 0.5) return null;
  return <path d={`M-300 ${DOME.band[0] - 2}H1400V${y1.toFixed(1)}H-300Z`} fill={skies.golden} />;
};

/** After the sun has gone ('day'), a STEPPED peach afterglow stays on the horizon at the set point (x 700: S09's
 *  sunrise point). Fix round 3b: two concentric true CIRCLES (centre (700, 1230), r 282 / 256) in the sky layer, so row 0
 *  clips them and only arcs ~50 / ~25 px high show above the skyline (the flat half-ellipses read as a lens / saucer);
 *  popping in one frame (0.94x for 2 frames). The last warmth of the peak scene, handing over to S09's lamp glows. */
const Afterglow: React.FC<{at: number}> = ({at}) => {
  const t = useTimeLocal();
  if (t < at) return null;
  const k = t < at + 0.067 ? 0.94 : 1;
  return (
    <>
      <circle cx={700} cy={1230} r={282 * k} fill="#F5CCAF" />
      <circle cx={700} cy={1230} r={256 * k} fill={palette.peach} />
    </>
  );
};

/** Fix round 3: the 'windows pop peach across the city' beat ('within'): three clearly peach windows per row, from the
 *  horizon outward (row 0, then row 1, then row 2), on building faces clear of the board, the dome and the right rail.
 *  Flat peach (row 2 with a hair ink edge), popping (1.3x for 2 frames). */
const DUSK_WINDOWS: Record<string, {x: number; y: number; w: number; h: number; at: number}[]> = {
  row0: [
    {x: 566, y: 1013, w: 6, h: 8, at: T.within + 0.04},
    {x: 812, y: 1015, w: 6, h: 8, at: T.within + 0.1},
    {x: 1004, y: 1012, w: 6, h: 8, at: T.within + 0.16},
  ],
  row1: [
    {x: 540, y: 1080, w: 8, h: 11, at: T.within + 0.22},
    {x: 784, y: 1077, w: 8, h: 11, at: T.within + 0.28},
    {x: 1012, y: 1079, w: 8, h: 11, at: T.within + 0.34},
  ],
  row2: [
    {x: 72, y: 1214, w: 12, h: 16, at: T.within + 0.4},
    {x: 300, y: 1232, w: 12, h: 16, at: T.within + 0.46},
    {x: 912, y: 1206, w: 12, h: 16, at: T.within + 0.52},
  ],
};
const DuskWindows: React.FC<{row: string}> = ({row}) => {
  const t = useTimeLocal();
  let d = '';
  for (const q of DUSK_WINDOWS[row] ?? []) {
    if (t < q.at) continue;
    const k = t < q.at + 0.067 ? 1.3 : 1;
    const w = q.w * k;
    const h = q.h * k;
    d += `M${(q.x - w / 2).toFixed(1)} ${(q.y - h / 2).toFixed(1)}h${w.toFixed(1)}v${h.toFixed(1)}h${(-w).toFixed(1)}Z`;
  }
  if (!d) return null;
  return <path d={d} fill={palette.peach} stroke={row === 'row2' ? palette.ink : undefined} strokeWidth={row === 'row2' ? 1.4 : undefined} />;
};

/** On 'day' the far rows relight to DUSK HAZE: every fill of rows 0-1 snaps to one flat haze step above the sky (row 0
 *  #84A895, row 1 #7A9B8A; their glass copies inside the dome one step lighter); the lit (peach) windows stay the only
 *  warm accents. A flat colour override of the set's fills (CSS on the layer group: no filter, no fade). */
const HAZE: Record<string, [string, string]> = {row0: ['#84A895', '#90B3A1'], row1: ['#7A9B8A', '#86A796']};
const LIT = [palette.peach, '#F5CCAF', palette.sun].map((c) => `:not([fill="${c}"]):not([fill="${c.toLowerCase()}"])`).join('');
/** Row 1's street: a ground strip under row 1's foot (y 1119-1165, row 2's back-fill colour), so the vista framing
 *  (camera y 900: row 2 drops ~14 px more than row 1) shows a street there instead of a sky-coloured slit; the far
 *  crowd stands on it. Relights with row 1 on 'day'. */
const StreetStrip: React.FC = () => {
  const t = useTimeLocal();
  return <path d="M-300 1119H1400V1165H-300Z" fill={t >= T.day ? HAZE.row1[0] : palette.sand} />;
};

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

/** Fix round 3: the glass is ONE VALUE DARKER (it was a pale wash the same value as the light far rows, so the dome
 *  read as 'filled' and the cream searchlight vanished on it): the glass sky #CCE4D2 -> the day sky's #ACD1BF, the
 *  glass peach band half-peach -> peach, and the city's glass copies half-sand -> #ACD1BF (a cool mint tint): inside the
 *  dome (mint + the teal district) and outside (the warm sand city) are two distinct values, and the cream cone reads
 *  on every part of the glass. A flat colour override of the set's glass copies (CSS on the layer group; no filter, no
 *  fade); off from 'day' (the dusk relight owns the glass then). */
const GLASS_TINT: [string, string][] = [
  ['#CCE4D2', skies.golden],
  ['#F5CCAF', palette.peach],
  // fix round 3b: the far rows' glass copies one value DARKER than the glass sky (they were the glass sky's own colour:
  // the interior read as a flat bowl of water under the band until the towers popped)
  ['#E6CEB6', '#94BDAA'],
];
const GLASS_CSS = GLASS_TINT.map(([a, b]) => `.s8gt g[clip-path] path[fill="${a}"],.s8gt g[clip-path] path[fill="${a.toLowerCase()}"]{fill:${b}}`).join('');
const GlassTint: React.FC<{on: boolean; children?: React.ReactNode}> = ({on, children}) => {
  const t = useTimeLocal();
  if (!on || t >= T.day) return <>{children}</>;
  return (
    <g className="s8gt">
      <style>{GLASS_CSS}</style>
      {children}
    </g>
  );
};
const GLASSY = new Set(['domeGlass', 'row0', 'row1']);

/** Fix round 2: the near half of the dusk relight lands EARLY, on the sky's third snap (`within` + 0.3): row 2, row 3
 *  and the neighbours flip to dusk there; the deck, the parapet and the board flip with the sky's `tod` key on 'day'.
 *  Two snaps instead of one 214k px^2 pop 0.4 s before the cut. */
const DUSK_EARLY = T.within + 0.3;
const DuskStep: React.FC<{on: boolean; children?: React.ReactNode}> = ({on, children}) => {
  const t = useTimeLocal();
  return on && t >= DUSK_EARLY ? <Tod value="dusk">{children}</Tod> : <>{children}</>;
};

// ---------------------------------------------------------------- the layers

/** Overlays injected into the DomeCity v3 layers (by its layer names). */
const EXTRAS: Record<string, React.ReactNode> = {
  sky: (
    <>
      <CutBand />
      <DuskBand />
      <Afterglow at={T.day + 0.03} />
    </>
  ),
  row0: (
    <>
      <DuskWindows row="row0" />
      <Flood figs={FLOOD.st0} flickerAt={T.duskIdle} seed="s8/fs0" />
      <Flood figs={FLOOD.row0} flickerAt={T.duskIdle} seed="s8/f0" />
    </>
  ),
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
      <WindowWink x={760} y={1040} cols={4} rows={3} at={T.once + 0.05} size={5} />
      {/* fix round 3: a second wink on 'that' (an onset in the thin 'says / that / once' stretch) */}
      <WindowWink x={560} y={1078} cols={3} rows={2} at={T.that + 0.02} size={6} />
      <g clipPath="url(#s8domeclip)">
        {/* fix round 3b: the towers pop WITH the glass (the arc closes on 'Cloudflare'), their browser windows later */}
        <DistrictTowers at={T.dome + 0.36} chromeAt={T.cloudflare + 0.42} />
      </g>
      <StreetStrip />
      <DuskWindows row="row1" />
      <Flood figs={FLOOD.st1} flickerAt={T.duskIdle} seed="s8/fs1" />
      <Flood figs={FLOOD.row1} flickerAt={T.duskIdle} seed="s8/ff" />
    </>
  ),
  dome: (
    <>
      <GlintSweep at={T.once} interior={DOME_INTERIOR} x0={96} x1={440} y={1060} L={200} />
      {/* fix round 3b: rises 0.12 s early so it is fully up ON 'says' (ENGINE rule 5) */}
      <Watchtower8 at={T.says - 0.12} />
      <g clipPath="url(#s8domeclip)">
        <Searchlight8 at={T.that} angle={sweepAngle} />
      </g>
    </>
  ),
  row2: (
    <>
      <PaperSpecks spots={PAPER} />
      <DuskWindows row="row2" />
      <Flood figs={FLOOD.row2} flickerAt={T.duskIdle} seed="s8/f2" />
      <LightDoors row={2} />
      {RATTLERS2.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
      <Flood figs={FLOOD.st2} flickerAt={T.duskIdle} seed="s8/fm" />
    </>
  ),
  near: (
    <>
      <LightDoors row={3} />
      <Flood figs={FLOOD.mid} flickerAt={T.duskIdle} seed="s8/f3" />
      {RATTLERS3.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
    </>
  ),
  fg: (
    <>
      <AboveCoping>
        <NearCrowd figs={NEAR} />
      </AboveCoping>
      <DeckClutter />
      <Pigeons flyAt={T.trying} />
      <TelephoneWires spec={WIRES.S08} seed="s8/wires" />
      <WireSpans />
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
          footerH={FOOTER_H}
          seed="s8/board"
        />
        <BoardNote zone={NOTE_ZONE} text={['counted from the', 'public announcement', 'attempts, not break-ins']} fontSize={28} at={T.announced + 0.08} underline={{line: 2, at: T.announced + 0.3}} seed="s8/note" />
        <BoardPencil at={T.board + 0.4} />
      </AboveCoping>
      <InkStamp box={ZONES.stamps[0]} text="first 45 min: tens of thousands" fontSize={34} at={T.stamp1At} land={T.stamp1Land} s0={1.5} rot={-4} seed="s8/st1" />
      {/* fix round 3b: s0 1.6 (was 2.0) scaled about the print's left end (origin 0.05): the oversized print stays right of
          Pip's head (screen x >= ~385 at the push) while it slams, and still lands on 'millions' */}
      <InkStamp box={ZONES.stamps[1]} text="millions · within a day" fontSize={34} at={T.stamp2At} land={T.stamp2Land} s0={1.6} origin={0.05} rot={-3} seed="s8/st2" />
      <StampHit box={ZONES.stamps[0]} text="first 45 min: tens of thousands" fontSize={34} rot={-4} at={T.stamp1Land} dur={0.3} />
      <StampHit box={ZONES.stamps[1]} text="millions · within a day" fontSize={34} rot={-3} at={T.stamp2Land} dur={0.3} />
      <BitRide plan={{copy: BIT_COPY, hopAt: T.bitHop, land: [BOARD.x0 + 32, BOARD.y0], crawlAt: T.bitHop + 0.55, crawlTo: [ZONES.top[0] - 14, BOARD.y0], alertAt: T.millionsWord, zoomAt: camZoom, cheers: [T.itWas + 0.05, T.tens + 0.06, T.thousands + 0.06, T.attempts + 0.1], size: 20}} />
      <Pip plan={{hopAt: T.settle - 0.48, hopFrom: [-90, copingY(-90)], hopDur: 0.48, spot: PIP, keys: PIP_KEYS, scale: 0.75}} />
    </>
  ),
};

const EARLY = new Set(['row2', 'near']);
const wrap = (name: string, _nearness: number, node: React.ReactNode) =>
  // the sun is screen space (it only swells and sets: no parallax, no lens)
  name === 'sun' ? (
    node
  ) : (
    <>
      <Layer depth={depthOf(name)}>
        <DuskStep on={EARLY.has(name)}>
          <GlassTint on={GLASSY.has(name)}>
            <DuskRelight name={name}>{node}</DuskRelight>
          </GlassTint>
          {EXTRAS[name]}
        </DuskStep>
      </Layer>
      {name === 'row2' ? (
        // fix round 3: the counted pile + the dome's plinth, at the DOME's depth but drawn after row 2, so the crowd
        // pressed against the foot is never hidden by row 2's roofs during the push
        <Layer depth={depthOf('dome')}>
          <DomePlinth at={T.dome + 0.36} />
          <BeamSpot at={T.that} angle={sweepAngle} popAt={T.hacking} />
          <Pile figs={PILE} />
        </Layer>
      ) : null}
      {name === 'fg' ? (
        // the rooftop neighbours: nearer than our parapet (they drop away faster during the crane)
        <Layer depth={1 - NEIGHBOUR_F}>
          <DuskStep on>
            <Neighbours reactAt={T.millions + 0.32} flinchAt={T.millions + 0.01} />
          </DuskStep>
        </Layer>
      ) : null}
    </>
  );

const Scene08: React.FC = () => (
  <World stage="context" sky={SKY}>
    <Cam8>
      <DomeCity
        dome={DOME8}
        wrap={wrap}
        sun={<SunInSky />}
        dotsAt={0.12}
        domeAt={T.dome}
        domeDur={0.36}
        towerAt={1e6}
        footprintAt={false}
        duskAt={T.within}
        observer={false}
        doors={false}
      />
    </Cam8>
  </World>
);

export default Scene08;
