// S08 "Counted from the announcement" (cut(ready) -> cut(day); 24.09-34.48 s on the take). PEAK 2 in two short doses with a
// baseline count between them (docs/storyboard_v3.md S08):
//   1. the CRANE (fixed 2.0 s, out(quart), multiplane) over our own rooftop parapet: an endless city of websites to the
//      horizon, the film's biggest sun (r260, half-set, two stepped glow rings); the hooded attempters are ALREADY at the
//      doors, rattling handles (not counted).
//   2. BASELINE dolly push (1.0 -> 1.15, sine) on 'Cloudflare ... forty-five minutes': a glass dome draws itself over ONE far
//      district (~1/5), the counter board rises on our parapet (L8 holds alone 1.7 s), the count starts at 'announced'
//      (start flag + L9a, BIG hand-drawn tally gates that overflow the board's frame, no digits), L9b footer; the counted
//      attempters HEAP UP against the OUTSIDE of the dome's left flank, one darkening clump per counted word (A1 fix
//      round 1), the glass ringing where they hit it; the sun hops up as a clock and sweeps the 45-minute wedge; stamp 1.
//   3. PAYOFF: on 'millions' a HOODED crowd floods every rooftop and street of the city outside the dome in three
//      stepped one-frame waves out from the dome (fix round 3b), climbs on over the dome's shoulder and rises behind our
//      own coping, and the camera pulls back to the vista; stamp 2 (L11); the sun sets in two steps at screen x 700
//      (S09's sunrise point) while the sky steps golden -> sage dusk and the far rows relight to dusk haze.
// Match-cut IN from S07 (its 0.40 s tilt): the three wires at screen y 896 / 928 / 960 and the sun at (640, 1021) r110
// half behind the skyline. Match-cut OUT to S09: the sun set at screen x 700 (S09's VP).
//
// Set: the shared DomeCity v3 with a broad shield dome left of the board (scene08/layout.ts DOME8; fix round 3b: its
// right flank runs behind the board), its layers
// mapped onto this scene's multiplane depths through `wrap` with the scene's overlays injected per layer; the set's
// own watchtower / searchlight are off (they stood at x 600-650, on the board's top edge): scene08/tower.tsx draws them
// inside the glass. Shared props: CounterBoard, TelephoneWires (WIRES.S08, pole at x 540), LeakSheet, Bit, FigureArm,
// EdgeOnlooker, SunGlowSteps, InkTextBlock. Local stand-ins (scene08/shims.tsx): MinuteWedge + ease / face, InkStamp
// (clamped start scale, landing time, scale origin), BoardNote. The rooftop flood stands on the set's own buildings
// (scene08/roofs.ts replays the set's row generator).
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
import {line} from '../lib/sketch';
import {Fill} from '../lib/Fill';
import {rand} from '../lib/rng';
import type {SkyKey} from '../lib/World';
import {CounterBoard, counterBoardZones, SunGlowSteps} from './shared/props';
import {DomeCity, DOME, TelephoneWires, WIRES} from './shared/sets';
import {DUR, GATES_AT, T} from './scene08/times';
import {TallyGates, tallySlots} from './scene08/tally';
import {BOARD, copingY, depthOf, DOME8, DOORS3, flankX, PIP, PUSH_X, R2, TOWER8} from './scene08/layout';
import {BitRide, CopySpec, GlintSweep, PaperSpecks, Pigeons, Pip, StampHit, WindowWink, WireCopy} from './scene08/cast';
import {clumpBand, CrowdFig, Flood, GlassPulse, heapSlots, NearCrowd, NearFig, outsideDome, Pile, PileFig, Rattler, RattlerSpec, roofBand} from './scene08/crowd';
import {BeamSpot, Searchlight8, Watchtower8} from './scene08/tower';
import {BoardNote, InkStamp, MinuteWedge} from './scene08/shims';
import {DeckClutter, District, LightDoors, Neighbours, NEIGHBOUR_F, WireSpans} from './scene08/extras';

// ---------------------------------------------------------------- camera (depth-0 plane = our parapet)

const DOLLY = 1 - 1 / 1.15; // the baseline push is a DOLLY: far rows grow less, the sky and the sun not at all
/** The payoff's pull-back lands with the depth-0 plane LOWER than the crane's rest: the board drops out of the flood band
 *  while the far rows and the sky / sun stay put, so the set point x 700 for S09 is unchanged. A1 fix round 1: 30 px
 *  (camera y 930; was 60 px over 1.1 s) so the pull-back fits 1.0 s and lands before the sunset (storyboard: 0.9 s). */
const VISTA_Y = 930;

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
  // PEAK again: pull back to the vista on 'millions' (a fixed 1.0 s), the board dropping below the flood band
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

/** A1 fix round 2 (the S07 -> S08 seam: the far plane stopped dead in one frame while S07's tilt had it moving 26 px /
 *  frame, and the sun braked 41 px down against that static skyline): the whole FAR plane brakes together with the sun.
 *  One screen-space y offset, 41 px out(cubic) over 0.3 s, easing back to 0 by the crane's end (inOutSine, from rest),
 *  applied to the sun, the peach band (sky layer: its top edge = CutBand), rows 0 / 1 and the dome + its glass; row 2 takes 0.6 of it
 *  so the parallax order (row 3 > row 2 > far) holds through the brake. The sun stays half-set on the moving skyline. */
const BRAKE = 41;
export const farBrake = (t: number) => (t < 0 ? 0 : t < 0.3 ? BRAKE * E.outCubic(t / 0.3) : t < T.craneEnd ? BRAKE * (1 - E.inOutSine((t - 0.3) / (T.craneEnd - 0.3))) : 0);
const BRAKE_K: Record<string, number> = {sky: 1, domeGlass: 1, row0: 1, row1: 1, dome: 1, row2: 0.6};
const Brake: React.FC<{k: number; children?: React.ReactNode}> = ({k, children}) => {
  const t = useTimeLocal();
  const o = farBrake(t) * k;
  return o > 0.01 ? <g transform={`translate(0 ${o.toFixed(2)})`}>{children}</g> : <>{children}</>;
};
/** 'forty-five': the sun hops up (fix round 3b: lands at centre 868, top ~606 at rest; the hop's own stretch is clamped
 *  so the disc top never rises above screen y 588, under the caption floor 570) and becomes a clock, landing on the
 *  word. A custom hop (position = a SunMove whose ease carries the ballistic arc; squash / stretch = a wrapper anchored
 *  at the disc bottom): the take-off starts FROM the bottom of the anticipation squash (one in-between frame instead of
 *  the kit hop's one-frame squash -> stretch snap). */
const HOP = {at: T.hopOff, to: 868, air: 0.22, h: 50, antic: 0.1};
const hopEase = (u: number) => u + ((4 * HOP.h) / (SUN.y - HOP.to)) * u * (1 - u);
const SUN_MOVES: SunMove[] = [
  // A1 fix round 2: the cut's brake (41 px down over 0.3 s) is the far plane's `farBrake` (the sun rides it with the
  // skyline); from rest the sun swells to the peak sun, half-set on the skyline, during the crane (inOutSine)
  {at: 0.3, dur: 1.6, x: SUN.x, y: SUN.y, r: SUN.r, ease: E.inOutSine},
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
  // A1 fix round 2: the glass cut-out only once the glass exists (it notched the rings at the crane's settle, before the
  // dome had drawn)
  const glass = t >= T.dome + 0.36;
  return (
    <>
      <defs>
        <clipPath id="s8ringclip" clipPathUnits="userSpaceOnUse">
          <path d={`M-400 -400H1500V2400H-400Z${glass ? DOME_INTERIOR : ''}`} clipRule="evenodd" transform={`matrix(${m.map((v) => v.toFixed(4)).join(' ')})`} />
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
  <Brake k={1}>
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
  </Brake>
);

// ---------------------------------------------------------------- the searchlight sweep (degrees BELOW the horizontal,
// pointing left across the dome from the tower inside its right flank)

/** 'hacking': the beam swings down onto the HEAP outside the left flank (A1 fix round 1): its centre line meets the glass
 *  where the heap presses at y CATCH_Y, the lit pool falls on the people outside. */
const CATCH_Y = 1032;
const CATCH_PT: [number, number] = [flankX(CATCH_Y, -1), CATCH_Y];
const CATCH_DEG = (Math.atan2(CATCH_PT[1] - TOWER8.light[1], TOWER8.light[0] - CATCH_PT[0]) * 180) / Math.PI;
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
  // to the edge door, and D takes A's door (a chain of two hops). Fix round 3b: D rattles between 'says' and 'that'
  // (3.35) and after 'it was' (4.10): fresh medium onsets in the thin 3-5 s stretch
  {...R3(0, 86), at: T.already, rattles: [T.already + 0.04, T.rattleA, T.footer + 0.05, T.thousands + 0.1, T.millions, T.wave2 + 0.2], hop: {at: T.attempts, to: door3(4).x, toY: door3(4).y}, coat: palette.tealDark, legs: palette.sage, seed: 'r3a'},
  {...R3(2, 92), at: T.already + 0.05, rattles: [T.already + 0.09, T.says + 0.05, T.itWas, T.thousands + 0.15, T.attempts + 0.42, T.comma, T.millions + 0.05], coat: palette.brown, legs: palette.tan, seed: 'r3b'},
  {...R3(3, 62), at: T.already + 0.1, rattles: [T.already + 0.14, T.trying + 0.2], coat: palette.teal, legs: palette.sand, seed: 'r3c'},
  {...R3(1, 90), at: T.already2, rattles: [T.already2 + 0.04, T.rattleA + 0.05, T.says + 0.15, T.itWas + 0.14, T.they + 0.2, T.hacking, T.comma + 0.05, T.wave2], hop: {at: T.attempts + 0.12, to: door3(0).x, toY: door3(0).y}, coat: palette.tealDark, legs: palette.tan, seed: 'r3d'},
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

// ---------------------------------------------------------------- the COUNTED heap OUTSIDE the dome's left flank

/** A1 fix round 1 (the reviewers: the counted pile at the dome's foot read as a crowd seated INSIDE the glass): the
 *  counted attempters HEAP UP against the outside of the left flank, from the foot corner outward and upward (hands on
 *  the glass), one visibly growing mass per word: 6 on 'they', +10 on 'tens', +24 on 'thousands', +6 on 'hacking' (A1
 *  fix round 2: the word had no heap clump), the rest on 'millions', when the climbers carry it on up over the shoulder.
 *  A1 fix round 2: the heap stands at the dome's depth BEHIND row 2 (drawn in the dome layer): its feet (base 1124) are
 *  hidden by row 2's roofs / back-fill, so it rises from behind the rooftops instead of floating on the peach band;
 *  3/4-turned hoodies in coat colours (an ink hood on 1 in 4), 2-3 px apart, 3 px rims, sand hands on the glass. */
// A1 fix round 3: the base 12 px lower (row 2's roofline cuts it), every figure at screen x >= 60 (world 72: clear of
// the left paper edge through the push), slots jittered +-6 / +-5 px, leaning 5-10 deg into the glass; the
// 'millions' shoulder climbers are gone (a human ruler up the dome's outline): the heap stays at the dome's foot.
const HEAP_BASE = 1136;
const PILE: PileFig[] = (() => {
  const slots = heapSlots({seed: 's8/heap', base: HEAP_BASE, top: 930, left: -130, h: [25, 32], dy: 15, gap: 2.2, minX: 72, jx: 6, jy: 5, rot: [5, 10]}).filter((q) => q.y - q.h > 952);
  const byD = [...slots].sort((a, b) => a.d - b.d);
  const order = new Map(byD.map((q, i) => [q, i]));
  const N = slots.length;
  const WAVES = [0.12, 0.32, 0.72, 0.86].map((u) => Math.round(u * N));
  const n2 = WAVES[2] - WAVES[1];
  const out: PileFig[] = slots.map((q, idx) => {
    const i = order.get(q)!;
    const stage = i < WAVES[0] ? 0 : i < WAVES[1] ? 1 : i < WAVES[2] ? 2 : i < WAVES[3] ? 3 : 4;
    // each word's wave pops as one clump (a 2-4 frame ripple); 'thousands' ripples out over 0.25 s
    const at =
      stage === 0 ? T.they + i * 0.012 : stage === 1 ? T.tens + (i - WAVES[0]) * 0.008 : stage === 2 ? T.thousands + ((i - WAVES[1]) / n2) * 0.25 : stage === 3 ? T.hacking + (i - WAVES[2]) * 0.011 : T.millions + (i % 3) * 0.033;
    const reachY = q.y - 0.95 * q.h;
    const reachTo: [number, number] | undefined = q.wall ? [flankX(reachY, -1) + 1, reachY] : undefined;
    const hit = q.wall && stage <= 2 && Math.abs(reachY - CATCH_Y) < 26;
    return {
      x: q.x,
      y: q.y,
      h: q.h,
      rot: q.rot,
      at,
      hood: true,
      fill: Math.floor(rand('s8/pc', `${idx}`) * 6),
      dark: rand('s8/pd', `${idx}`) < 0.15,
      reachTo,
      reach: !q.wall && rand('s8/pr', `${idx}`) < 0.3,
      taps: [at + 0.02, ...(stage < 2 ? [T.thousands + (i % 4) * 0.05] : []), T.in + (i % 5) * 0.04, T.stamp1Ring + ((i * 3) % 7) * 0.03, T.millions + (i % 5) * 0.05, T.within + (i % 4) * 0.08],
      flash: hit ? T.hacking : undefined,
    };
  });
  // back to front: higher figures first
  return out.sort((a, b) => a.y - b.y);
})();

/** The ring PULSES on the glass where the heap presses (dome layer, clipped to the glass): one per counted word, bigger
 *  as the count grows ('they' < 'tens' < 'thousands'), plus 'in' and 'millions'. */
const pulseAt = (y: number) => ({x: flankX(y, -1) + 3, y});
const PULSES = [
  {at: T.they + 0.04, ...pulseAt(1076), r: 16},
  {at: T.tens + 0.04, ...pulseAt(1056), r: 26},
  {at: T.thousands + 0.06, ...pulseAt(1022), r: 38},
  // A1 fix round 2: 'hacking' (the searchlight's catch) rings the glass where the beam lands on the heap
  {at: T.hacking + 0.02, ...pulseAt(CATCH_Y), r: 30},
  {at: T.in + 0.02, ...pulseAt(1040), r: 20},
  {at: T.millions + 0.04, ...pulseAt(980), r: 34},
];

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

/** A1 fix round 3 (the reviewers: with sound off 'tens of thousands' was not in the picture): every counted word also
 *  adds people in the open LEFT THIRD (on screen through the push): a share of the row-2 rooftop crowd left of the board
 *  pops early, in clumps, with the glass ring ('they' 2 / 'tens' 5 / 'thousands' 13 / 'hacking' 4 / 'attempts' 2 /
 *  comma 2), and queues grow beside the three near door rattlers (1 / 3 / 7 / 2 / 1 / 1). 'millions' floods the rest. */
const COUNT_STEPS: [number, number, number][] = [
  // [time, row-2 roof figures, near queue figures]
  [T.they + 0.04, 2, 1],
  [T.tens + 0.04, 5, 3],
  [T.thousands + 0.06, 13, 7],
  [T.hacking + 0.02, 4, 2],
  [GATES_AT[7], 2, 1],
  [GATES_AT[8], 2, 1],
];
/** Assigns the count steps' onsets to `figs` in order (a 2-frame ripple per clump); the rest keep their own. */
function countOnsets<F extends {at: number}>(figs: F[], k: 1 | 2): F[] {
  let n = 0;
  const out = figs.map((f) => ({...f}));
  for (const step of COUNT_STEPS) {
    for (let j = 0; j < step[k] && n < out.length; j++, n++) out[n].at = step[0] + Math.min(j, 6) * 0.017;
  }
  return out;
}

/** Near queues beside the three left door rattlers (row 3, near layer): hooded busts in coat colours lined up between
 *  the doors (x 60-300 world, clear of Pip), a front rank at 1426 and a smaller back rank at 1414. */
const QUEUE: CrowdFig[] = (() => {
  const spots: [number, number, number][] = [
    // x, base y, h (in the order they join the count)
    [168, 1426, 50],
    [262, 1426, 52],
    [80, 1426, 48],
    [192, 1414, 44],
    [148, 1414, 42],
    [286, 1414, 44],
    [102, 1414, 44],
    [244, 1416, 42],
    [60, 1416, 42],
    [176, 1404, 38],
    [270, 1404, 38],
    [126, 1404, 38],
    [86, 1404, 36],
    [154, 1396, 34],
    [232, 1398, 34],
  ];
  return countOnsets(
    spots.map(([x, y, h], i) => ({x: x + (rand('s8/q', `x${i}`) - 0.5) * 6, y, h, at: 1e6, rank: y > 1420 ? 2 : y > 1408 ? 1 : 0, fill: (i % 2) as 0 | 1, hood: true})),
    2,
  );
})();

/** A1 fix round 3: the 'millions' sea POURS at the dome: four tongues of figures down ALLEYS cut between row-2
 *  buildings (from row 1's street at 1124 to row 2's street at 1300, widening toward us), sizes 9 -> 17 px with depth,
 *  every figure walking / leaning toward the dome's centre, popping back to front over 0.2 s (the pour). */
const ALLEYS = [
  {x: 186, w0: 16, w1: 44},
  {x: 298, w0: 16, w1: 44},
  {x: 986, w0: 16, w1: 44},
  {x: 1052, w0: 16, w1: 44},
];
const ALLEY_Y: [number, number] = [1122, 1300];
const alleyHalf = (a: (typeof ALLEYS)[number], y: number) => lerp(a.w0, a.w1, (y - ALLEY_Y[0]) / (ALLEY_Y[1] - ALLEY_Y[0])) / 2;
const ALLEY_GEO = (() => {
  let fill = '';
  let ink = '';
  for (const a of ALLEYS) {
    const [y0, y1] = ALLEY_Y;
    const l0 = a.x - a.w0 / 2;
    const r0 = a.x + a.w0 / 2;
    const l1 = a.x - a.w1 / 2;
    const r1 = a.x + a.w1 / 2;
    fill += `M${l0} ${y0}L${r0} ${y0}L${r1} ${y1}L${l1} ${y1}Z`;
    ink += line(l0, y0 - 4, l1, y1, {seed: `s8/al${a.x}`, over: [0, 0]}) + line(r0, y0 - 4, r1, y1, {seed: `s8/ar${a.x}`, over: [0, 0]});
  }
  return {fill, ink};
})();
const TONGUES: CrowdFig[] = (() => {
  const out: CrowdFig[] = [];
  for (const a of ALLEYS) {
    const toward = Math.sign(DOME8.cx - a.x) || 1;
    for (let y = ALLEY_Y[0] + 9, j = 0; y <= ALLEY_Y[1] + 2; j++) {
      const v = (y - ALLEY_Y[0]) / (ALLEY_Y[1] - ALLEY_Y[0]);
      const h = lerp(9, 17, v);
      const half = alleyHalf(a, y);
      const n = Math.max(1, Math.round((2 * half) / (0.6 * h)));
      for (let i = 0; i < n; i++) {
        const k = `${a.x}/${j}/${i}`;
        const x = a.x - half + ((i + 0.5) / n) * 2 * half + (rand('s8/tg', `x${k}`) - 0.5) * 0.3 * h;
        out.push({x, y: y + (rand('s8/tg', `y${k}`) - 0.5) * 3, h: h * (0.85 + 0.3 * rand('s8/tg', `h${k}`)), at: WAVE.row2 + (1 - v) * 0.2, rank: j, fill: ((i + j) % 2) as 0 | 1, hood: true, vx: toward * (3 + 3 * rand('s8/tg', `v${k}`))});
      }
      y += 0.55 * h;
    }
  }
  return out;
})();
const Alleys: React.FC<{at: number}> = ({at}) => {
  const t = useTimeLocal();
  if (t < at) return null;
  return (
    <>
      <Fill d={ALLEY_GEO.fill} color={palette.sand} offset={false} mode="snap" seed="s8/alley" />
      <Ink d={ALLEY_GEO.ink} width={1.4} taper={false} seed="s8/alleyi" />
    </>
  );
};

const FLOOD = (() => {
  // fix round 3b (the reviewers: 'make the flood a MASS, not a texture line'): every building of rows 0-2 gets a PACKED
  // rooftop crowd (roofs.ts replays the set's own rows); plus street crowds at the foot of rows 0 / 1 / 2 (seen in the
  // gaps between the nearer roofs) that walk toward the dome; a mid tier of 20-30 px busts on the row-3 roofs either
  // side of the board. A1 fix round 3, the HAZE LADDER: rows 0 / 1 are continuous value stipple (no empty roofs, no
  // clump gaps; round dot heads in hazed coat colours), row 1's street is a 4-rank sheet; rows 2 / 3 and the streets in
  // jittered ranks (no bleacher lines); the ink and the darkest values stay with the near crowd.
  // 'use it' (fix round 3b: the 4-8 px specks read as grass): four clumps of 11-15 px figures (two ranks) on row-2
  // ROOFTOPS right of the dome, visible at rest, popping 0.08 s apart; they stay and become part of the flood
  const useIt = [
    [496, 566],
    [628, 700],
    [902, 966],
    [998, 1060],
  ].flatMap(([x0, x1], k) => roofBand(`s8/u${k}`, 2, x0, x1, [11, 15], [T.useIt + k * 0.08, T.useIt + k * 0.08], {ranks: 2, clump: [5, 7], empty: 0, arms: 20, rank0: 3}));
  const r2main = [
    ...roofBand('s8/r2', 2, -40, 1120, [13, 19], [WAVE.row2, WAVE.row2, WAVE.row2], {ranks: 3, rank0: 1, arms: 20, empty: 0.05, skip: (x, y) => behindBoard2(x, y) || (x > 94 && x < 211), jy: 4, xj: 0.12}),
    // the two roofs at x 94-211 (the seeded 5 % left them empty: they sit in the counted left third)
    ...roofBand('s8/r2c', 2, 94, 211, [13, 19], [WAVE.row2, WAVE.row2, WAVE.row2], {ranks: 3, rank0: 1, arms: 20, empty: 0, jy: 4, xj: 0.12}),
  ];
  // the counted share: the front two ranks on the roofs left of the board, building by building (a seeded order)
  const isCount = (f: CrowdFig) => f.x > 64 && f.x < 425 && f.rank >= 2;
  // runs of 3-4 neighbours (front rank first), the runs in a seeded order: each word's figures pop as clumps spread
  // over several roofs, not one roof filling up
  const cand = r2main.filter(isCount).sort((a, b) => b.rank - a.rank || a.x - b.x);
  const runs: CrowdFig[][] = [];
  for (const f of cand) {
    const r = runs[runs.length - 1];
    if (r && r.length < 4 && r[0].rank === f.rank && f.x - r[r.length - 1].x < 16) r.push(f);
    else runs.push([f]);
  }
  const counted = countOnsets(runs.sort((a, b) => rand('s8/cb', `${a[0].rank}/${Math.round(a[0].x)}`) - rand('s8/cb', `${b[0].rank}/${Math.round(b[0].x)}`)).flat(), 1);
  const row2 = [
    ...r2main.filter((f) => !isCount(f)),
    ...counted,
    ...roofBand('s8/r2w', 2, -40, 1120, [13, 19], [0, 0, 0, T.wave2], {ranks: 4, rankFrom: 3, rank0: 0, empty: 0.05, skip: behindBoard2, span: 0.2, order: 'ltr', jy: 4, xj: 0.12}),
  ];
  const far = {empty: 0, cgap: 0};
  const row1 = [
    ...roofBand('s8/r1', 1, -40, 1120, [9, 12], [WAVE.row1, WAVE.row1, WAVE.row1], {ranks: 3, rank0: 1, arms: 24, skip: inDomeSkip, ...far}),
    ...roofBand('s8/r1w', 1, -40, 1120, [9, 12], [0, 0, 0, T.wave2 + 0.03], {ranks: 4, rankFrom: 3, rank0: 0, skip: inDomeSkip, span: 0.22, order: 'ltr', ...far}),
  ];
  const row0 = [
    ...roofBand('s8/r0', 0, -40, 1120, [7, 9], [WAVE.row0, WAVE.row0, WAVE.row0], {ranks: 3, rank0: 1, arms: 30, skip: inDomeSkip, ...far}),
    ...roofBand('s8/r0w', 0, -40, 1120, [7, 9], [0, 0, 0, T.wave2 + 0.06], {ranks: 4, rankFrom: 3, rank0: 0, skip: inDomeSkip, span: 0.24, order: 'ltr', ...far}),
  ];
  // the streets: row 0's foot (behind row 1), row 1's street as a continuous 4-rank stipple sheet (behind row 2), row
  // 2's street (above the low row-3 sheds) in jittered ranks, all walking toward the dome
  const st0 = [
    ...clumpBand('s8/s0a', -40, 1120, 1048, 7, WAVE.row0, 0, {clump: [6, 10], gap: [0, 1], jy: 2, skip: inDomeSkip, toward: DOME8.cx, vx: 3}),
    ...clumpBand('s8/s0b', -30, 1120, 1053, 8, T.wave2 + 0.06, 0.24, {order: 'ltr', clump: [6, 10], gap: [0, 1], jy: 2, skip: inDomeSkip, toward: DOME8.cx, vx: 3}),
  ];
  const st1 = [
    ...clumpBand('s8/s1c', -40, 1120, 1104, 8, WAVE.row1, 0, {clump: [6, 10], gap: [0, 1], jy: 2, fj: 2.5, xj: 0.15, skip: inDomeSkip, toward: DOME8.cx, vx: 3}),
    ...clumpBand('s8/s1a', -40, 1120, 1112, 9, WAVE.row1, 0, {clump: [6, 10], gap: [0, 1], jy: 2, fj: 2.5, xj: 0.15, skip: inDomeSkip, toward: DOME8.cx, vx: 4}),
    ...clumpBand('s8/s1d', -40, 1120, 1120, 9, WAVE.row1, 0, {clump: [6, 10], gap: [0, 1], jy: 2, fj: 2.5, xj: 0.15, skip: inDomeSkip, toward: DOME8.cx, vx: 4}),
    ...clumpBand('s8/s1b', -30, 1120, 1128, 10, T.wave2 + 0.03, 0.22, {order: 'ltr', clump: [6, 10], gap: [0, 1], jy: 2, fj: 2.5, xj: 0.15, skip: inDomeSkip, toward: DOME8.cx, vx: 4}),
  ];
  const st2 = [
    ...clumpBand('s8/bm0', -40, 1120, 1292, 13, WAVE.row2, 0, {clump: [3, 7], gap: [0, 8], jy: 8, fj: 3, xj: 0.2, arms: 20, toward: DOME8.cx, vx: 8}),
    ...clumpBand('s8/bm1', -30, 1120, 1304, 15, WAVE.row2, 0, {clump: [3, 7], gap: [0, 10], jy: 8, fj: 3, xj: 0.2, arms: 20, toward: DOME8.cx, vx: 9}),
    ...clumpBand('s8/bm2', -20, 1120, 1314, 17, T.wave2, 0.2, {order: 'ltr', clump: [2, 5], gap: [6, 24], jy: 8, fj: 3, xj: 0.2, arms: 20, toward: DOME8.cx, vx: 10}),
  ];
  // the mid tier: 20-30 px hooded busts on the row-3 rooftops either side of the board (between the 60-90 px rattlers
  // and the far crowd), hooded, at most one in ~20 reaching toward the dome
  const mid = [
    ...roofBand('s8/r3', 3, -40, 1120, [20, 30], [WAVE.mid, WAVE.mid, WAVE.mid], {ranks: 3, rank0: 1, clump: [3, 6], empty: 0.05, arms: 20, skip: (x) => behindBoard3(x), dy: 1, jy: 6, xj: 0.15}),
    // wave 2: 'more rattlers crowd row 3': a street crowd of 38-50 px busts at the row-3 doors where no rattler stands
    // (left of the first door, right of the board), in two jittered ranks
    ...clumpBand('s8/s3k', 900, 1120, 1424, 38, T.wave2, 0.12, {order: 'ltr', clump: [3, 5], gap: [0, 4], jy: 6, fj: 4, xj: 0.2, arms: 20, rank: 0}),
    ...clumpBand('s8/s3', 890, 1120, 1438, 44, T.wave2, 0.12, {order: 'ltr', clump: [3, 5], gap: [0, 6], jy: 6, fj: 4, xj: 0.2, arms: 20, rank: 1}),
    ...clumpBand('s8/s3l', -40, 70, 1440, 44, T.wave2 + 0.05, 0.08, {order: 'ltr', clump: [2, 3], gap: [0, 4], jy: 6, fj: 4, xj: 0.2, arms: 20, rank: 1}),
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
  // a back rank (smaller, 20 px lower) between the front busts, rising with them. A1 fix round 1: all HOODED (the near
  // rattlers' hoodie recipe), coats tealDark / ochre / teal, two reach forward toward the dome (no raised arms)
  // A1 fix round 2: nothing in x 330-450 (a clear gap behind Pip: his ears-cover gag read only when paused against
  // the teal busts)
  {x: 88, h: 84, at: T.millions - 0.01, fill: 2, hood: true, seed: 'n6', dy: -6},
  {x: 178, h: 82, at: T.millions - 0.01, fill: 1, hood: true, seed: 'n7', dy: -6},
  {x: 256, h: 78, at: T.millions + 0.023, fill: 0, hood: true, seed: 'n8', dy: -6},
  {x: 42, h: 100, at: T.millions - 0.01, fill: 0, hood: true, seed: 'n0'},
  {x: 134, h: 108, at: T.millions - 0.01, fill: 1, hood: true, arm: 1, seed: 'n1'},
  {x: 220, h: 96, at: T.millions + 0.023, fill: 0, hood: true, seed: 'n2'},
  {x: 290, h: 84, at: T.millions + 0.023, fill: 2, hood: true, seed: 'n3'},
  {x: 940, h: 104, at: T.millions - 0.01, fill: 0, hood: true, arm: -1, seed: 'n4'},
  {x: 1036, h: 110, at: T.millions + 0.023, fill: 1, hood: true, seed: 'n5'},
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
/** Footer height (world px): two 28 px lines (2.04 em = 57 px). A1 fix round 1: 60 (was 70): the 10 px go to the two
 *  stamps so L10, L11 and the footer keep >= 8 px between them (they were ~4 px apart). */
const FOOTER_H = 60;
const ZONES = counterBoardZones(BOARD_BOX, {footerH: FOOTER_H});
/** L9a's block: the note zone + the gutter up to the first gate (holds 28 px); fix round 2: 11 px right of the flag's
 *  pennant (it touched the 'c' of 'counted'). */
const NOTE_ZONE: [number, number, number, number] = [ZONES.note[0] + 9, ZONES.note[1], ZONES.gates[0] - 4, ZONES.note[3]];
/** A1 fix round 1: the stamp slots placed by hand (prints 34 px, padded tighter, tilted -1.5 / -1.2 deg: the -4 / -3 deg
 *  tilts swung the long prints' corners 14 px into their neighbours): L10 centred at y 1284, L11 at 1334 (>= 8 px from
 *  the tally, from each other and from the footer rule at ~1365). */
const STAMP_BOX: [[number, number, number, number], [number, number, number, number]] = [
  [ZONES.stamps[0][0], 1264, ZONES.stamps[0][2], 1304],
  [ZONES.stamps[1][0], 1314, ZONES.stamps[1][2], 1354],
];
const STAMP_PAD = {x: 0.3, top: 0.12, bot: 0.1};
/** The big tally (scene08/tally.tsx): 2 rows of 3 gates over the board's gates zone (+ its gutter), then the overflow
 *  across the right teal frame. */
/** A1 fix round 2: the zone starts 14 px further right (L9a's underline ran into gate 1's first bar), and the overflow
 *  is scrawled across the right frame BELOW the wire spans (they leave the board's right edge at world y ~1160-1200 for
 *  POLE2): gates, frame, wires and pole no longer knot together; the stamps' right ends stay >= 10 px clear. */
const TALLY = tallySlots([ZONES.gates[0] + 8, ZONES.gates[1] - 2, ZONES.gates[2] + 2, 1254], [
  {cx: 890, cy: 1238, rot: 12},
  {cx: 894, cy: 1290, rot: -10},
  {cx: 884, cy: 1338, rot: 26},
]);

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

/** Fix round 3b: during the header-only hold (L8 alone 1.7 s) the empty face shows the board's CONSTRUCTION in faint
 *  pencil. A1 fix round 2 (the reviewers: the dashed boxes read as a web-form wireframe / loading skeleton): drawn the
 *  way the S03 opener draws its construction: thin SOLID tan strokes with overshooting ends (a flag post + pennant
 *  outline, two ruled baselines for the tally rows with short end ticks, one ruled baseline + a short start tick per
 *  stamp slot). Each piece is ERASED in one frame when its content lands: the flag and the tally rules on gate 1
 *  ('announced'), each slot's rule on its stamp. */
const PENCIL = (() => {
  const [fx0, fy0, fx1, fy1] = ZONES.flag;
  const pw = fx1 - fx0;
  const ph = fy1 - fy0;
  const px = fx0 + pw * 0.3;
  const L = (x0: number, y0: number, x1: number, y1: number, k: string, o: [number, number] = [6, 9]) => line(x0, y0, x1, y1, {seed: `s8/pen${k}`, over: o, drift: 0.6});
  const flag = L(px, fy0 - 6, px, fy1 + 4, 'fp', [4, 6]) + L(px - pw * 0.25, fy1, px + pw * 0.35, fy1, 'fb', [3, 5]) + L(px, fy0 + ph * 0.06, px + pw * 0.62, fy0 + ph * 0.17, 'f1', [2, 4]) + L(px + pw * 0.62, fy0 + ph * 0.17, px, fy0 + ph * 0.3, 'f2', [2, 4]);
  const [gx0, gy0, gx1, gy1] = [TALLY[0].x, TALLY[0].y, TALLY[2].x + TALLY[2].w, TALLY[5].y + TALLY[5].h];
  const gm = (gy0 + gy1) / 2;
  const gates = L(gx0 - 4, gm - 1, gx1 + 2, gm + 1, 'g1') + L(gx0 - 2, gy1 + 1, gx1 + 4, gy1 - 1, 'g2') + L(gx0, gy0 + 4, gx0 - 1, gy0 - 6, 'gt', [2, 3]) + L(gx1, gy1 - 6, gx1 + 1, gy1 + 5, 'gu', [2, 3]);
  const slot = (r: [number, number, number, number], k: string) => {
    const yb = r[3] - 7;
    return L(r[0] + 8, yb, r[2] - 10, yb + 1.5, `${k}b`) + L(r[0] + 8, yb - 22, r[0] + 7, yb + 6, `${k}t`, [2, 3]);
  };
  return {flag, gates, slot1: slot(STAMP_BOX[0], 's1'), slot2: slot(STAMP_BOX[1], 's2')};
})();
const BoardPencil: React.FC<{at: number}> = ({at}) => {
  const t = useTimeLocal();
  if (t < at) return null;
  const pen = (d: string, key: string) => <Ink key={key} d={d} width={1.3} color={palette.tan} taper={false} seed={`s8/pen${key}`} />;
  return (
    <>
      {t < T.announced ? pen(PENCIL.flag, 'f') : null}
      {t < T.announced ? pen(PENCIL.gates, 'g') : null}
      {t < T.stamp1Land ? pen(PENCIL.slot1, 's1') : null}
      {t < T.stamp2Land ? pen(PENCIL.slot2, 's2') : null}
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
 *  sunrise point). A1 fix round 1: a wide, FLAT stepped glow band on the horizon (two horizontal ellipses about
 *  (700, 986): rx 340 / 230, ry 20 / 12) in the sky layer, so row 0 clips its bottom: a band of last light, not a shape
 *  (the fix round 3b concentric circles rose ~50 px above the skyline and read as a second, pink dome next to the glass
 *  one); popping in one frame (0.94x for 2 frames). The last warmth of the peak scene, handing over to S09's lamp glows. */
const Afterglow: React.FC<{at: number}> = ({at}) => {
  const t = useTimeLocal();
  if (t < at) return null;
  const k = t < at + 0.067 ? 0.94 : 1;
  return (
    <>
      <ellipse cx={700} cy={986} rx={340 * k} ry={20 * k} fill="#F5CCAF" />
      <ellipse cx={700} cy={986} rx={230 * k} ry={12 * k} fill={palette.peach} />
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

/** A1 fix round 2: the far crowds relight WITH their rows on 'day' (they kept their clay / tealDark fills on the dusk
 *  haze and popped forward): one flat haze step darker than their row (CSS on the group; no filter, no fade). */
const FLOOD_DUSK: Record<string, string> = {row0: '#738F81', row1: '#647F72'};
const FloodDusk: React.FC<{row: string; children?: React.ReactNode}> = ({row, children}) => {
  const t = useTimeLocal();
  if (t < T.day) return <>{children}</>;
  const cls = `s8fd-${row}`;
  return (
    <g className={cls}>
      <style>{`.${cls} path{fill:${FLOOD_DUSK[row]}}`}</style>
      {children}
    </g>
  );
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
      <FloodDusk row="row0">
        <Flood figs={FLOOD.st0} flickerAt={T.duskIdle} seed="s8/fs0" tier={0} />
        <Flood figs={FLOOD.row0} flickerAt={T.duskIdle} seed="s8/f0" tier={0} />
      </FloodDusk>
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
        {/* A1 fix round 2: a dense far district (row-0/1 scale) pops WITH the glass, its window dots + landmark later */}
        <District at={T.dome + 0.36} chromeAt={T.cloudflare + 0.42} duskAt={T.day} />
      </g>
      <StreetStrip />
      <DuskWindows row="row1" />
      <FloodDusk row="row1">
        <Flood figs={FLOOD.st1} flickerAt={T.duskIdle} seed="s8/fs1" tier={1} />
        <Flood figs={FLOOD.row1} flickerAt={T.duskIdle} seed="s8/ff" tier={1} />
      </FloodDusk>
    </>
  ),
  dome: (
    <>
      <GlintSweep at={T.once} interior={DOME_INTERIOR} x0={DOME8.cx - DOME8.rx - 4} x1={DOME8.cx + DOME8.rx - 40} y={DOME8.by - 50} L={250} />
      {/* fix round 3b: rises 0.12 s early so it is fully up ON 'says' (ENGINE rule 5) */}
      <Watchtower8 at={T.says - 0.12} />
      <g clipPath="url(#s8domeclip)">
        <Searchlight8 at={T.that} angle={sweepAngle} flareAt={T.hacking} />
        {/* A1 fix round 1: the glass rings where the heap hits it, bigger on each counted word */}
        <GlassPulse pulses={PULSES} />
      </g>
      {/* A1 fix round 2: the counted heap (outside the left flank) at the dome's depth, drawn BEFORE row 2 so row 2's
          roofs hide its feet (it rises from behind the rooftops; it used to stand on top of them, close to camera) */}
      <BeamSpot at={T.that} angle={sweepAngle} popAt={T.hacking} minY={975} />
      <Pile figs={PILE} />
    </>
  ),
  row2: (
    <>
      <PaperSpecks spots={PAPER} />
      <DuskWindows row="row2" />
      <Alleys at={WAVE.row2} />
      <Flood figs={TONGUES} flickerAt={T.duskIdle} seed="s8/ft" tier={2} />
      <Flood figs={FLOOD.row2} flickerAt={T.duskIdle} seed="s8/f2" tier={2} />
      <LightDoors row={2} />
      {RATTLERS2.map((r) => (
        <Rattler key={r.seed} {...r} />
      ))}
      <Flood figs={FLOOD.st2} flickerAt={T.duskIdle} seed="s8/fm" tier={2} />
    </>
  ),
  near: (
    <>
      <LightDoors row={3} />
      <Flood figs={FLOOD.mid} flickerAt={T.duskIdle} seed="s8/f3" tier={3} />
      <Flood figs={QUEUE} flickerAt={T.duskIdle} seed="s8/fq" tier={3} />
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
          footer={['Matthew Prince, Cloudflare CEO, on X', "Cloudflare's own count"]}
          footerAt={T.footer}
          footerH={FOOTER_H}
          seed="s8/board"
        />
        <BoardNote zone={NOTE_ZONE} text={['counted from the', 'public announcement', 'attempts, not break-ins']} fontSize={28} at={T.announced + 0.08} underline={{line: 2, at: T.announced + 0.3}} seed="s8/note" />
        <BoardPencil at={T.board + 0.4} />
        {/* A1 fix round 1: the BIG tally (the kit board's gates are off): 42 px bars, 4 px ink, filling the zone by
            'thousands', then overflowing across the right frame */}
        <TallyGates slots={TALLY} at={GATES_AT} width={4} seed="s8/tally" />
      </AboveCoping>
      <InkStamp box={STAMP_BOX[0]} text="first 45 min: tens of thousands" fontSize={34} pad={STAMP_PAD} at={T.stamp1At} land={T.stamp1Land} s0={1.5} rot={-1.5} ring seed="s8/st1" />
      {/* A1 fix round 1: s0 1.3 (was 1.6) about its centre-left (origin 0.15): smaller overlap of L10 / the footer while it
          slams, still clear of Pip; it lands 2 frames after 'millions' (the caption highlight first, then the stamp),
          with a one-frame ink ring */}
      <InkStamp box={STAMP_BOX[1]} text="millions · within a day" fontSize={34} pad={STAMP_PAD} at={T.stamp2At} land={T.stamp2Land} s0={1.3} origin={0.15} rot={-1.2} ring seed="s8/st2" />
      <StampHit box={STAMP_BOX[0]} text="first 45 min: tens of thousands" fontSize={34} pad={STAMP_PAD} rot={-1.5} at={T.stamp1Land} dur={0.3} />
      <StampHit box={STAMP_BOX[1]} text="millions · within a day" fontSize={34} pad={STAMP_PAD} rot={-1.2} at={T.stamp2Land} dur={0.3} />
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
      <Brake k={BRAKE_K[name] ?? 0}>
        <Layer depth={depthOf(name)}>
          <DuskStep on={EARLY.has(name)}>
            <GlassTint on={GLASSY.has(name)}>
              <DuskRelight name={name}>{node}</DuskRelight>
            </GlassTint>
            {EXTRAS[name]}
          </DuskStep>
        </Layer>
      </Brake>
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
