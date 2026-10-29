// S02 camera (storyboard v3 S02 `camera`): a flat zoom + translate, screen = (world - cam) x zoom + (540, 960).
//   cut -> +0.40 s   (470.6, 794.8, 1.15) -> (472.6, 813.8, 1.30), out(quad): the S01 dive lands and keeps moving IN
//                    while it decelerates; the lock detail stays at screen (560, 1150).
//   +0.40 -> end     (472.6, 813.8, 1.30) -> (474, 807.7, 1.44), inOut(sine): an 11 % creep (the cornice pinned at ~684).
// Zoom is interpolated in log space; both segments meet at zero velocity.
// Fix round 1: the storyboard's out(expo) 0.30 s halved the frame's speed every frame (camspeed: 16.7 -> 7.7 -> 3.6
// px/f, a slam right after the cut). The dive's RATE is now carried on the match object by the loupe (Scene02 loupeK:
// camera + loupe follow one out(cubic) log-zoom curve from ~6.3/s), so the camera itself lands with a constant
// deceleration: out(quad) over 0.40 s = ~26 px/f at the frame corners decelerating ~2.2 px/f per frame (gate 1 limit 2.5).
//
// Hook pass 2 (first 10 s), on top of the creep (the first 0.40 s and everything from 7.24 film are exactly as before):
//   'bug' PUNCH   +6 % log zoom about the lock (world (488, 960), on screen ~(560, 1151)), 0.10 s out(cubic) from
//                 bug-0.10, landing ON 'bug' (5.305 film; the camera stalled there), + a 5 px decaying vertical jolt
//                 (S01's slam jolt shape) on the landing frame. The extra 6 % rides on the creep until the takeover.
//   TAKEOVER      'take over a site' gets its own framing: a PUSH 6.30 -> 6.55 film (out(cubic)) onto a target framing
//                 (~x1.11 over the punched creep, x1.17 over the old creep at 6.55), the takeover (knob -> connector ->
//                 site icon) pulled left toward frame centre (icon centre x ~860 -> ~745) and clear of the right UI rail;
//                 the target creeps +3 % through 'site' (6.55 -> 6.98); the PULL-BACK 6.98 -> 7.24 (out(cubic)) lands
//                 on the creep (the punch's 6 % comes out here), so from 7.24 the camera is the creep, exactly.
//                 The target is the tightest framing the sky allows (nothing rises into the caption band, y < 570):
//                 Pip's ear tips (world ~587) stay >= 575 and the cornice (608) >= 600 on screen, the site icon's
//                 base (1180) <= 1512 (above the bottom UI zone, 1520) and L1's left edge (246) >= ~30 (never cropped). The sun
//                 (screen space) follows 45 % of the push sideways (Scene02, pushShiftX), so Pip keeps clear of it.
import {ease as E, lerp, prog} from '../../lib/time';
import {mat, Mat} from '../../lib/xf';
import {local, W} from './beats';

export type Cam = {x: number; y: number; zoom: number};

const K0: Cam = {x: 470.6, y: 794.8, zoom: 1.15};
const K1: Cam = {x: 472.6, y: 813.8, zoom: 1.3};
// hook pass (wrap-up): a real creep instead of 3 % (1.30 -> 1.44 over ~3.3 s) so the board never sits still; y pans up
// so the cornice stays at screen y ~684 (world 616), the sky and the sun's cap above it unchanged
const K2: Cam = {x: 474.0, y: 807.7, zoom: 1.44};
export const LAND = 0.4;

/** 'bug' punch: +6 % about the lock (BLUEPRINT_WALL.lock, world), 0.10 s out(cubic), landing ON the word. */
const HIT = local(W.bug);
const LOCK_W: [number, number] = [488, 960];
export const PUNCH = {f: 1.06, at: HIT - 0.1, dur: 0.1};
/** The landing jolt (screen px, + = the picture drops): S01's slam-jolt shape, from just before the word so the
 *  landing frame (film f159, 5.300) carries it; +5, -0.8, -1.0, +0.6, 0 px. */
const JOLT = {a: 5, at: HIT - 0.01, decay: 0.05, period: 0.11, dur: 0.3};
/** The takeover push (scene-local; film 6.30 -> 6.55 out(cubic)), the hold creep to 6.98, the pull-back to 7.24. */
export const PUSH = {at: local(6.3), dur: 0.25};
export const PULL = {at: local(6.98), dur: 0.26};
/** The target framing at the end of the hold (PULL.at): world point p sits at screen s at zoom `zoom`; the hold creeps
 *  +3 % about p from the push's landing (PUSH.at + dur) to PULL.at (and keeps that rate before it, while the push runs). */
const TARGET = {p: [690, 1040] as [number, number], s: [732, 1290] as [number, number], zoom: 1.582, creep: 1.03};

const mixCam = (a: Cam, b: Cam, q: number): Cam => ({x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q), zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), q))});

/** Zoom a camera by f about a world point p (p keeps its place on screen). */
const zoomAbout = (c: Cam, f: number, p: [number, number]): Cam => ({x: p[0] - (p[0] - c.x) / f, y: p[1] - (p[1] - c.y) / f, zoom: c.zoom * f});

/** Blend two cameras: log zoom, and the screen position of the world anchor a, both linear in w. */
const blendAbout = (c0: Cam, c1: Cam, w: number, a: [number, number]): Cam => {
  const s0 = toScreen(c0, a);
  const s1 = toScreen(c1, a);
  const zoom = Math.exp(lerp(Math.log(c0.zoom), Math.log(c1.zoom), w));
  return {x: a[0] - (lerp(s0[0], s1[0], w) - 540) / zoom, y: a[1] - (lerp(s0[1], s1[1], w) - 960) / zoom, zoom};
};

/** The creep alone (LAND -> end): the path the pull-back lands on. */
const creepAt = (t: number, end: number): Cam => mixCam(K1, K2, prog(t, LAND, end - LAND, E.inOutSine));

const joltY = (t: number) => {
  const u = t - JOLT.at;
  return u < 0 || u >= JOLT.dur ? 0 : JOLT.a * Math.exp(-u / JOLT.decay) * Math.cos((2 * Math.PI * u) / JOLT.period);
};

/** The takeover target framing at scene time t (creeping +3 % about TARGET.p over the hold). */
const targetAt = (t: number): Cam => {
  const hold0 = PUSH.at + PUSH.dur;
  const zoom = TARGET.zoom * Math.pow(TARGET.creep, (t - PULL.at) / (PULL.at - hold0));
  return {x: TARGET.p[0] - (TARGET.s[0] - 540) / zoom, y: TARGET.p[1] - (TARGET.s[1] - 960) / zoom, zoom};
};

/** The camera WITHOUT the takeover push: the creep with the 'bug' punch's 6 %, which comes out with the pull-back. */
const basePunched = (t: number, end: number): Cam => {
  const k = prog(t, PUNCH.at, PUNCH.dur, E.outCubic) * (1 - prog(t, PULL.at, PULL.dur, E.outCubic));
  return zoomAbout(creepAt(t, end), Math.pow(PUNCH.f, k), LOCK_W);
};

/** Screen x shift the takeover push gives the facade point that sits at screen (sx, sy) on the push-free camera
 *  (0 outside PUSH.at .. PULL.at + PULL.dur). Scene02 moves the screen-space sun by a share of it (a far layer's
 *  parallax), so Pip, carried left by the push, keeps his distance from the disc. */
export function pushShiftX(t: number, end: number, sx: number, sy: number): number {
  if (t <= PUSH.at || t >= PULL.at + PULL.dur) return 0;
  const b = basePunched(t, end);
  return toScreen(camAt(t, end), [(sx - 540) / b.zoom + b.x, (sy - 960) / b.zoom + b.y])[0] - sx;
}

/** Camera at scene time t (end = scene length, the creep's end key). */
export function camAt(t: number, end: number): Cam {
  if (t <= LAND) return mixCam(K0, K1, prog(t, 0, LAND, E.outQuad));
  const creep = creepAt(t, end);
  if (t < PUNCH.at || t >= PULL.at + PULL.dur) return creep;
  // the pull-back: from the target onto the creep itself (the punch's 6 % comes out with it)
  if (t >= PULL.at) return blendAbout(creep, targetAt(t), 1 - E.outCubic(prog(t, PULL.at, PULL.dur)), TARGET.p);
  const punched = zoomAbout(creep, Math.pow(PUNCH.f, prog(t, PUNCH.at, PUNCH.dur, E.outCubic)), LOCK_W);
  const c = {...punched, y: punched.y - joltY(t) / punched.zoom};
  return t > PUSH.at ? blendAbout(c, targetAt(t), prog(t, PUSH.at, PUSH.dur, E.outCubic), TARGET.p) : c;
}

/** World -> screen matrix of a camera. */
export const camMat = (c: Cam): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.zoom), mat.translate(-c.x, -c.y));

/** World point -> screen point. */
export const toScreen = (c: Cam, p: [number, number]): [number, number] => [(p[0] - c.x) * c.zoom + 540, (p[1] - c.y) * c.zoom + 960];
