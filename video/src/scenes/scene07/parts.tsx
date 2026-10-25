// scene07/parts.tsx — S07 local helpers: the flat camera, the wire copies (Bit rides one), the board clones (with a
// level of detail), the pigeons, Pip with his flyer gag, the reader's phone copy and the other phones' dark screens, the
// glass panes kept mintPale under the golden relight, the far-roof, wall and ground details and the clock's speed
// wedge. The fill-first pen reveal is scene07/reveal.tsx.

import React, {useId} from 'react';
import {canvas, ease as E, Fill, Ink, lerp, mat, Mat, MOTION, osc, palette, prog, springAt, springs, Tod, useInkScale, useTime, useXf, world, XG, clamp, Pt, hline, poly, polyPath, line, blob, circle} from '../../lib';
import {Elephant, hop} from '../../lib/mascot';
import {rand, rng} from '../../lib/rng';
import {Bird} from '../../lib/kit';
import {Bit, DEPTH_INK, LeakSheet, MarkRing, misregScreen, pendulum} from '../shared/props';
import {measureCaption, useCaptionFont} from '../../lib/font';
import type {PaneRect} from '../shared/props';
import {glintAt, GroundMarks, HALF, SI, wireAt, WIRES} from '../shared/sets';
import type {Beats} from './beats';

// ---------------------------------------------------------------- camera (storyboard flat projection)
// screen = (world - (x, y)) * z + (540, 960). Keys (S07 camera[] in docs/storyboard_v3_resolved.json):
//   cut -> cut+0.21 hold (540,960,1.0) | -> 'fix' push-in to (480,950,1.06) inOut(sine) | hold | the last 0.40 s a
//   TILT-UP to (480,764,1.06) in(sine): every layer except the sun moves down 197 px, exiting at ~775 px/s into S08.

export type Cam = {x: number; y: number; z: number};
export const REST: Cam = {x: 540, y: 960, z: 1};
export const PUSHED: Cam = {x: 480, y: 950, z: 1.06};
/** 760 + 4 / 1.06: S07's end state = S08's first frame (the wires landed ~4 px low, fix round 1). */
export const TILT_TO_Y = 764;

export function camAt(t: number, B: Beats): Cam {
  const p0 = B.cut + 0.21;
  const p1 = B.fix + 0.04; // w78 'fix' word start (the storyboard key)
  const q = prog(t, p0, p1 - p0, E.inOutSine);
  // the push interpolates log-zoom so the zoom rate is smooth
  const z = Math.exp(lerp(0, Math.log(PUSHED.z), q));
  let x = lerp(REST.x, PUSHED.x, q);
  let y = lerp(REST.y, PUSHED.y, q);
  const k = prog(t, B.tilt, B.end - B.tilt, E.inSine);
  if (k > 0) y = lerp(PUSHED.y, TILT_TO_Y, k);
  x = +x.toFixed(3);
  return {x, y, z};
}

export const camMat = (c: Cam): Mat => mat.compose(mat.translate(540, 960), mat.scale(c.z), mat.translate(-c.x, -c.y));

/** Screen-space px the tilt has moved every layer down by (0 before the tilt). */
export function tiltPx(t: number, B: Beats): number {
  if (t < B.tilt) return 0;
  const c = camAt(t, B);
  return (PUSHED.y - c.y) * c.z;
}

// ---------------------------------------------------------------- wire copies (they carry on into S08)

export type WireCopySpec = {
  /** The board clone it lifts off: centre (world), its on-screen width scale (LeakClones w 120 x s) and tilt. The flight
   *  starts exactly there (the clone hides on the same frame). */
  from: Pt;
  fromS?: number;
  fromRot?: number;
  liftAt: number;
  /** Peg: wire index, x on the wire, time it pegs on. */
  wire: 0 | 1 | 2;
  x: number;
  pegAt: number;
  /** Speed along the wire (world px/s, leftwards): `vc` from the peg, then over [rampAt, rampAt + rampDur] the speed
   *  eases (quadratic, no acceleration jump) to `vEnd` (the gust on the tilt; vEnd = S08's hand-over speed). */
  vc: number;
  vEnd?: number;
  rampAt?: number;
  rampDur?: number;
  bit?: boolean;
  bitHopAt?: number;
  /** Over the ramp the copy's lean blends (smoothstep) into S08's lean for the same copy (scene08/cast.tsx copyLean:
   *  5 + 1.5 sin(t8 x 5.3 + rand(seed, 'p') x 6), t8 = t - t0): equal angle and angular speed on the cut (fix round 1:
   *  a 3 deg lean mismatch shifted a sheet ~2.5 px on the cut frame). */
  leanTo?: {seed: string; t0: number};
  seed: string;
};

const COPY = {w: 210, h: 270, s: 0.34};
/** Board clones are LeakClones-size sheets (120 x 150) x their scale. */
export const CLONE = {w: 120, h: 150};

/** Distance a copy has slid along its wire since its peg (world px). */
export function copySlid(c: Pick<WireCopySpec, 'pegAt' | 'vc' | 'vEnd' | 'rampAt' | 'rampDur'>, t: number): number {
  const dt = Math.max(0, t - c.pegAt);
  if (c.vEnd === undefined || c.rampAt === undefined || !c.rampDur) return c.vc * dt;
  const r0 = Math.max(c.pegAt, c.rampAt);
  if (t <= r0) return c.vc * dt;
  const dv = c.vEnd - c.vc;
  const w = Math.min(1, (t - r0) / c.rampDur);
  let d = c.vc * (t - c.pegAt) + (dv * c.rampDur * w * w * w) / 3;
  if (t > r0 + c.rampDur) d += dv * (t - r0 - c.rampDur);
  return d;
}

/** Cruise speed that makes a copy pegged at (x, pegAt) arrive at xEnd at tEnd with speed vEnd, the last rampDur s being
 *  the quadratic ramp (rampAt = tEnd - rampDur). */
export function cruiseFor(x: number, pegAt: number, xEnd: number, vEnd: number, tEnd: number, rampDur: number): number {
  const rampAt = tEnd - rampDur;
  return (x - xEnd - (rampDur * vEnd) / 3) / (rampAt - pegAt + (2 * rampDur) / 3);
}

/** Peg point and swing of a wire copy at t (null before lift-off). */
export function wireCopyAt(t: number, c: WireCopySpec): {pt: Pt; rot: number; s: number; pegged: boolean} | null {
  if (t < c.liftAt) return null;
  const spec = WIRES.S07;
  if (t < c.pegAt) {
    // fly up from the board: out(cubic) with an arc and a flutter, from the clone's own size and tilt
    const q = prog(t, c.liftAt, c.pegAt - c.liftAt, E.outCubic);
    const s0 = c.fromS ?? 0.46;
    const s = lerp(s0, COPY.s, q);
    const to = wireAt(spec, c.wire, c.x);
    // the copy is drawn below its peg point: start with the sheet centred on the clone
    const fx = c.from[0];
    const fy = c.from[1] - (COPY.h / 2 + 6) * s0;
    const x = lerp(fx, to[0], q);
    const y = lerp(fy, to[1], q) - Math.sin(q * Math.PI) * 50;
    const dt = t - c.liftAt;
    return {pt: [x, y], rot: (c.fromRot ?? 0) * (1 - q) + 22 * (1 - q) * Math.sin(dt * 26), s, pegged: false};
  }
  const dt = t - c.pegAt;
  const x = c.x - copySlid(c, t);
  const pt = wireAt(spec, c.wire, x);
  // peg jolt, then a trailing lean against the travel + a slow sway
  let swing = 14 * Math.exp(-dt * 4.2) * Math.sin(dt * 15) + 5 * (1 - Math.exp(-dt * 6)) + 1.5 * Math.sin(dt * 5.3 + c.x);
  if (c.leanTo && c.rampAt !== undefined && c.rampDur) {
    const u = clamp((t - c.rampAt) / c.rampDur);
    const w = u * u * (3 - 2 * u);
    const lean8 = 5 + 1.5 * Math.sin((t - c.leanTo.t0) * 5.3 + rand(c.leanTo.seed, 'p') * 6);
    swing = lerp(swing, lean8, w);
  }
  return {pt, rot: swing, s: COPY.s, pegged: true};
}

export const WireCopy: React.FC<{c: WireCopySpec}> = ({c}) => {
  const t = useTime();
  const st = wireCopyAt(t, c);
  if (!st) return null;
  const {pt, rot, s, pegged} = st;
  const hang = (COPY.h / 2 + 6) * s;
  // peg snap: a quick squash on the peg
  const sq = pegged ? 1 - 0.12 * Math.exp(-(t - c.pegAt) * 22) : 1;
  return (
    <XG m={mat.compose(mat.translate(pt[0], pt[1]), mat.rotate(rot), mat.scale(1, sq))}>
      <LeakSheet x={0} y={hang} w={COPY.w} h={COPY.h} scale={s} peg={pegged} pin={false} depth="far" seed={c.seed} />
      {c.bit ? <Bit x={9} y={-0.5} size={18} state="ride" flip look="forward" hopAt={c.bitHopAt} seed={`${c.seed}/bit`} /> : null}
    </XG>
  );
};

// ---------------------------------------------------------------- board clones (level of detail)
// Below s 0.85 a clone is the paper, its heading bar, two rules and the ringed Bit doodle: no lock sketch (at phone size
// the sketch is grey hairline noise). A clone with `liftAt` hides on that frame: its wire copy flies on from its place.

export type CloneSpot = {x: number; y: number; at: number; rot: number; s: number; liftAt?: number};

const LiteSheet: React.FC<{x: number; y: number; w: number; h: number; rot: number; s: number; seed: string}> = ({x, y, w, h, rot, s, seed}) => {
  const iw = DEPTH_INK.far / s;
  const f = Math.min(w, h) * 0.15;
  const pts: Pt[] = [
    [-w / 2, -h / 2],
    [w / 2 - f, -h / 2],
    [w / 2, -h / 2 + f],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
  const off = misregScreen(seed);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(s))}>
      <Fill d={polyPath(pts)} color={palette.white} offset={[off[0] / s, off[1] / s]} seed={`${seed}/f`} />
      <Fill d={polyPath([[w / 2 - f, -h / 2], [w / 2 - f, -h / 2 + f], [w / 2, -h / 2 + f]])} color={palette.sand} offset={false} seed={`${seed}/ear`} />
      <Ink d={poly(pts, {closed: true, seed: `${seed}/o`, over: 2.5})} width={iw} seed={`${seed}/o`} />
      <Ink d={`M${w / 2 - f} ${-h / 2}L${w / 2 - f + 1} ${-h / 2 + f}L${w / 2} ${-h / 2 + f}`} width={iw * 0.8} seed={`${seed}/eo`} />
      <Ink d={hline(-w * 0.36, w * 0.04, -h * 0.3, {over: 0, seed: `${seed}/hd`})} width={iw * 2.1} seed={`${seed}/hd`} />
      <Ink d={hline(-w * 0.36, w * 0.22, -h * 0.17, {over: 0, seed: `${seed}/l1`}) + hline(-w * 0.36, w * 0.06, -h * 0.07, {over: 0, seed: `${seed}/l2`})} width={iw * 0.9} seed={`${seed}/tl`} />
      <Bit x={w * 0.12} y={h * 0.27} size={w * 0.26} state="doodle" seed={`${seed}/bit`} />
      <MarkRing x={w * 0.12} y={h * 0.21} r={w * 0.21} width={iw * 1.3} seed={`${seed}/ring`} />
    </XG>
  );
};

/** Pop spring pre-roll of a board clone (s): springs.pop is at ~19 % after 0.035 s. */
const CLONE_PRE = 0.035;

export const BoardClones: React.FC<{spots: CloneSpot[]; seed: string}> = ({spots, seed}) => {
  const t = useTime();
  return (
    <>
      {spots.map((sp, i) => {
        if (t < sp.at || (sp.liftAt !== undefined && t >= sp.liftAt)) return null;
        // A1 fix round 1 (motion spec: a pop starts at >= 20 %): the spring starts CLONE_PRE before the clone is first drawn
        // (L7's approach), so its first frame on either grid is a >= 19 % sheet on its beat, not a 2-12 % speck
        const k = springAt(t, sp.at - CLONE_PRE, springs.pop);
        return (
          <XG key={i} m={mat.about(mat.scale(k), sp.x, sp.y)}>
            {sp.s >= 0.85 ? (
              <LeakSheet x={sp.x} y={sp.y} w={CLONE.w} h={CLONE.h} rot={sp.rot} scale={sp.s} seed={`${seed}/${i}`} />
            ) : (
              <LiteSheet x={sp.x} y={sp.y} w={CLONE.w} h={CLONE.h} rot={sp.rot} s={sp.s} seed={`${seed}/${i}`} />
            )}
          </XG>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- pigeons on the wires (hop over a passing peg)

export const Pigeon: React.FC<{wire: 0 | 1 | 2; x: number; at?: number; hopAt?: number[]; flyAt?: number; flyTo?: Pt; flip?: boolean; color?: string; seed: string}> = ({wire, x, at, hopAt = [], flyAt, flyTo, flip, color = palette.white, seed}) => {
  const t = useTime();
  const p = wireAt(WIRES.S07, wire, x);
  let dy = 0;
  for (const a of hopAt) {
    const u = (t - a) / 0.3;
    if (u > 0 && u < 1) dy -= 26 * 4 * u * (1 - u);
  }
  return (
    <XG m={mat.translate(0, dy)}>
      <Bird x={p[0]} y={p[1] + 1} s={0.8} seed={seed} at={at} flyAt={flyAt} flyTo={flyTo} color={color} flip={flip} />
    </XG>
  );
};

// ---------------------------------------------------------------- Pip (scale 1.2 on the board top) + the flyer gag

/** entry (A1 fix round 2): the lens sheet covers the whole frame until ~22.05 and its right edge only clears the board's
 *  right end (x ~745) on the 22.067 film frame, so a leap from the LEFT was never seen (his first visible frame was the
 *  landing). He now drops in from off-frame RIGHT over the workshop's upper floor (the way he leaves at the tilt), a low
 *  0.3 s arc that comes out from behind the shrinking sheet: film frames 22.067 / 22.1 / 22.133 show him airborne at
 *  x ~806 / 757 / 707 (~50 px a frame), landing at `landLag` after pinPip (22.135, on the sheet's pin frame, 0.02 s
 *  before 'word'); he holds the side pose through the landing squash for `holdSide` s, then turns to sit-back with a
 *  0.1 s turn squash. exit (fix round 1): an arc UP and out of the right frame edge over the workshop's window box (feet
 *  never below the board top y 928, so it never crosses J4 or the round sign). Fix round 3: the landing point 905 -> 760
 *  world, so the hop RISES out of the frame: it crosses the right edge with his feet at screen y ~780 (above the like /
 *  comment rail, y 900-1500), over the workshop's upper floor, not through the rail. */
export const PIP = {x: 705, y: 928, s: 1.2, entry: [1150, 880] as Pt, inAir: 0.3, inH: 20, landLag: 0.03, holdSide: 0.065, exit: [1085, 760] as Pt, offLead: 0.02, offAir: 0.32, offH: 30};
/** The flyer is flicked off this long before the word 'was' (frame 1 already moves ~30 %: out(cubic)). Fix round 2:
 *  0.08 -> 0.14 so the head shake after it got a full 0.2 s before the hop-off crouch; A1 fix round 1: 0.14 -> 0.09
 *  (ENGINE rule 5's small-element lead): the face clears on ~film frame 23.500, the shake straddles 'was' (23.545) with
 *  the phone copy and the pigeon, and it carries on into the hop-off crouch (overlapping action) instead of being cut. */
export const PEEL_LEAD = 0.09;
/** The head shake after the peel: one 5 Hz swing pair (each half-swing 3 frames), look +-1 decaying to 0.5, with a head
 *  roll of SHAKE.roll deg on the same curve (the sit-front `look` alone moved the face a few px: invisible at 7 Hz). */
const SHAKE = {lead: 0.005, dur: 0.2, hz: 5, roll: 6};
const PEEL_DUR = 0.25;

/** Pip's face centre in sit-front (local head centre (0, -67) at scale 1). */
const FACE: Pt = [0, -67];

export const PipS07: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const land = B.pinPip + PIP.landLag;
  const inAir = PIP.inAir;
  const offT0 = B.tilt - PIP.offLead; // hop-off take-off as the tilt starts (crouch from offT0 - 0.08)
  const entry = (tt: number) => hop({t: tt, t0: land - inAir, dur: inAir, from: {x: PIP.entry[0], y: PIP.entry[1]}, to: {x: PIP.x, y: PIP.y}, height: PIP.inH});
  // the shake after the peel: look swings right / left at 5 Hz (3 frames a half-swing), decaying, with a head roll; it
  // carries on through the hop-off crouch (A1 fix round 1)
  const sh = t - (B.was - PEEL_LEAD + SHAKE.lead);
  const shake = sh > 0 && sh < SHAKE.dur ? Math.sin(sh * Math.PI * 2 * SHAKE.hz) * (1 - (0.5 * sh) / SHAKE.dur) : 0;
  // 1) drop in from off-frame right (behind the lens sheet until it clears), facing left
  if (t < land) {
    const h = entry(t);
    if (!h.airborne) return null; // still off frame (no crouch drawn off-screen)
    return <Elephant x={h.x} y={h.y} scale={PIP.s} flip pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={7} expression="wide" />;
  }
  // 3) hop off the board: up-right over the window box and out of the right frame edge
  if (t >= offT0 - 0.08) {
    const h = hop({t, t0: offT0, dur: PIP.offAir, from: {x: PIP.x, y: PIP.y}, to: {x: PIP.exit[0], y: PIP.exit[1]}, height: PIP.offH});
    if (t >= offT0 + PIP.offAir) return null; // past the frame edge
    if (h.airborne || t >= offT0) return <Elephant x={h.x} y={h.y} scale={PIP.s} pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={7} expression="meh" />;
    return <Elephant x={h.x} y={h.y} scale={PIP.s} pose="sit-front" look={shake} rotate={shake * SHAKE.roll} squash={h.squash} t={t} seed={7} expression="meh" />;
  }
  // 2) on the board top: the landing in the side pose (A1 fix round 2: 2 frames of the land squash), then sit-back
  //    watching the notice (a 0.1 s turn squash); on the 'out' rustle (the copy leaves pane 2, B.out) he turns to
  //    sit-front, so the copy lands on his FACE 0.1 s later (fix round 2: he turned on the slap, the copy hit the back of
  //    his head first); head shake after the peel
  const landSq = entry(t).squash;
  const turnBack = land + PIP.holdSide;
  if (t < turnBack) return <Elephant x={PIP.x} y={PIP.y} scale={PIP.s} flip pose="stand-side" squash={landSq} t={t} seed={7} expression="wide" />;
  const front = t >= B.out;
  const sw = (dt: number) => (dt > -0.1 && dt < 0.45 ? (dt < 0 ? 0.14 * prog(dt, -0.1, 0.1) : 0.14 * Math.exp(-dt * 9) * Math.cos(dt * Math.PI * 2 * 3.4)) : 0);
  // a small turn squash on each flip (one 0.1 s dip), then the slap's squash
  const turnSq = (t0: number) => (t >= t0 && t < t0 + 0.1 ? 0.06 * Math.sin(((t - t0) / 0.1) * Math.PI) : 0);
  const sq = landSq + sw(t - B.slap) * 1.4 + turnSq(B.out) + turnSq(turnBack);
  const look = front ? shake : -0.55;
  const expr = front ? (t < B.was - PEEL_LEAD ? 'wide' : 'meh') : undefined;
  return <Elephant x={PIP.x} y={PIP.y} scale={PIP.s} pose={front ? 'sit-front' : 'sit-back'} look={look} rotate={front ? shake * SHAKE.roll : 0} expression={expr} squash={sq} t={t} seed={7} />;
};

/** The copy that slaps onto Pip's face on 'out' (from pane 2), sticks, and is flicked away on 'was'. */
export const Flyer: React.FC<{B: Beats; from: Pt}> = ({B, from}) => {
  const t = useTime();
  const t0 = B.slap - 0.1;
  if (t < t0) return null;
  const peel = B.was - PEEL_LEAD;
  if (t > peel + PEEL_DUR) return null;
  // Pip's head follows his squash about the feet: keep the flyer on it
  const sw = (dt: number) => (dt > 0 && dt < 0.45 ? 0.14 * Math.exp(-dt * 9) * Math.cos(dt * Math.PI * 2 * 3.4) * 1.4 : 0);
  const sq = sw(t - B.slap);
  const face: Pt = [PIP.x + FACE[0] * PIP.s, PIP.y + FACE[1] * PIP.s * (1 - sq) + 4];
  let x = face[0];
  let y = face[1];
  let rot = -6 + 2.5 * Math.sin((t - B.slap) * 8);
  let s = 1;
  let sx = 1;
  let sy = 1;
  if (t < B.slap) {
    const q = prog(t, t0, B.slap - t0, E.inQuad);
    x = lerp(from[0], face[0], q);
    y = lerp(from[1], face[1], q) - Math.sin(q * Math.PI) * 40;
    rot = lerp(14, -6, q) + 30 * Math.sin(q * 6);
    s = lerp(0.8, 1, q);
  } else {
    const d = t - B.slap;
    if (d < 0.14) {
      // slap: squash flat onto the face, then recover
      const k = Math.exp(-d * 30);
      sx = 1 + 0.16 * k;
      sy = 1 - 0.16 * k;
    }
  }
  if (t >= peel) {
    // flicked away up-right by his trunk (a flick: fast off the face, out(cubic))
    const q = prog(t, peel, PEEL_DUR, E.outCubic);
    x = lerp(face[0], 1180, q);
    y = face[1] - Math.sin(q * Math.PI * 0.8) * 120 + q * 40;
    rot = -6 + 260 * q;
  }
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(s * sx, s * sy))}>
      <LeakSheet x={0} y={0} w={64} h={82} pin={false} depth="mid" seed="s7flyer" />
    </XG>
  );
};

// ---------------------------------------------------------------- J4's focal cue on 'fix' (A1 fix round 1)
// With the sound off, 'the fix is NOT ready' rested on the small 'still fixing...' card at the right; the eye was on the
// big clock ('time passes'). On 'fix' + J4_CUE the card pops 1.15x and settles, and an ink underline is scribbled under
// 'still': clock and sign read as one idea.

/** The cue's lead after 'fix' (the clock pops on 'fix' itself, the sign answers it). */
export const J4_CUE = 0.15;

/** The sign's pop-and-settle scale at t (1 outside the cue): up to 1.15 in 0.06 s (out(cubic)), then a damped settle
 *  (one small undershoot), back to 1 by ~0.4 s. */
export function j4Pop(t: number, at: number): number {
  const dt = t - at;
  if (dt <= 0 || dt > 0.6) return 1;
  if (dt < 0.06) return 1 + 0.15 * E.outCubic(dt / 0.06);
  const u = dt - 0.06;
  return 1 + 0.15 * Math.exp(-u * 9) * Math.cos(u * Math.PI * 2 * 2.2);
}

/** A quick ink underline under the first word ('still') of a FixSign hung at (x, y) with lettering fs (props FixSign
 *  layout: card top y + 0.5 fs, row-1 baseline 1.05 fs below it, the line centred on x), drawn on in 0.13 s as one pen
 *  stroke (out and a shorter stroke back under it), turning with the card's own tilt and swing (FixSign: rot -2 +
 *  pendulum(swingAt, 12 deg, 0.5 s, 0.9)) about the hang point. */
export const StillUnderline: React.FC<{x: number; y: number; fs: number; at: number; swingAt?: number; text?: string; word?: string; seed: string}> = ({x, y, fs, at, swingAt, text = 'still fixing...', word = 'still', seed}) => {
  useCaptionFont();
  const t = useTime();
  if (t < at) return null;
  const lw = measureCaption(text, fs);
  const ww = measureCaption(word, fs);
  const x0 = x - lw / 2 - fs * 0.06;
  const x1 = x - lw / 2 + ww + fs * 0.1;
  const by = y + fs * 0.5 + fs * 1.05 + fs * 0.2;
  const d = `M${x0.toFixed(1)} ${(by + 0.6).toFixed(1)}Q${((x0 + x1) / 2).toFixed(1)} ${(by - 2.2).toFixed(1)} ${x1.toFixed(1)} ${(by - 0.8).toFixed(1)}L${(x0 + fs * 0.35).toFixed(1)} ${(by + fs * 0.2).toFixed(1)}Q${((x0 + x1) / 2).toFixed(1)} ${(by + fs * 0.14).toFixed(1)} ${(x1 - fs * 0.25).toFixed(1)} ${(by + fs * 0.16).toFixed(1)}`;
  const ang = -2 + pendulum(t, swingAt, 12, 0.5, 0.9);
  return (
    <XG m={mat.about(mat.rotate(ang), x, y)}>
      <Ink d={d} at={at} dur={0.13} width={2.5} taper={false} seed={seed} />
    </XG>
  );
};

// ---------------------------------------------------------------- the pin dot and the phone copy

/** The notice's pin: grows 20 % -> 100 % (motion spec fill pop) with the 7 % spring, so it reads on its first frames. */
export const PinDot: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const t = useTime();
  if (t < at) return null;
  const k = 0.2 + 0.8 * springAt(t, at, springs.pop);
  return (
    <g transform={`translate(${x} ${y}) scale(${k.toFixed(4)})`}>
      <circle r={7.5} fill={palette.ink} />
      <circle cx={-2.2} cy={-2.4} r={2.2} fill={palette.cream} />
    </g>
  );
};

/** The leak on a reader's phone screen (pops, fills the screen: ~30 x 38 world) and an ink ring pops around the phone
 *  (a spring + the ring's stroke-on, never a fade). (x, y) = the phone screen centre, world. */
export const PhoneCopy: React.FC<{x: number; y: number; at: number; rot?: number; ringAt?: number; ringR?: number}> = ({x, y, at, rot = 0, ringAt, ringR = 46}) => {
  const t = useTime();
  if (t < at) return null;
  const k = springAt(t, at, springs.pop);
  const ra = ringAt ?? at;
  const kr = t >= ra ? springAt(t, ra, springs.pop) : 0;
  return (
    <>
      <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(k))}>
        <LeakSheet x={0} y={0} w={30} h={38} pin={false} depth="hair" seed="s7phone" />
      </XG>
      {kr > 0 ? (
        <XG m={mat.about(mat.scale(kr), x, y)}>
          <MarkRing x={x} y={y} r={ringR} at={ra} dur={0.14} depth="mid" seed="s7phoneRing" />
        </XG>
      ) : null}
    </>
  );
};

/** A raised phone's screen taken out of the white-paper family (fix round 2: four white phones + the notice + 8 clones +
 *  4 wire copies + 2 cards made the board a white mosaic): a teal-dark screen inset in the kit phone's white face (a thin
 *  white rim stays, clear of the grip's finger tips) with a tiny peach copy glyph, lit 0.17 s after the raise pop (once
 *  the kit's overshoot has settled: the screen wakes, with the 20 % -> 100 % spring). (x, y, w, h) = the kit phone's
 *  white face (world), measured on a render at tRef; dy = the reader's own idle bob (EdgeOnlooker: osc(t, 0.5,
 *  rand(seed, 'b') x 6) x 1.5) relative to tRef. */
export const PhoneScreen: React.FC<{x: number; y: number; w: number; h: number; at: number; tRef: number; seed: string}> = ({x, y, w, h, at, tRef, seed}) => {
  const t = useTime();
  if (t < at) return null;
  const bob = (tt: number) => osc(tt, 0.5, rand(seed, 'b') * 6) * 1.5;
  const k = 0.2 + 0.8 * springAt(t, at, springs.pop);
  const sw = w * 0.64;
  const sh = h * 0.82;
  const gw = sw * 0.46;
  const gh = sh * 0.36;
  const f = gw * 0.28;
  const glyph = polyPath([
    [-gw / 2, -gh / 2],
    [gw / 2 - f, -gh / 2],
    [gw / 2, -gh / 2 + f],
    [gw / 2, gh / 2],
    [-gw / 2, gh / 2],
  ]);
  return (
    <XG m={mat.compose(mat.translate(x, y + bob(t) - bob(tRef)), mat.scale(k))}>
      <rect x={-sw / 2} y={-sh / 2} width={sw} height={sh} rx={sw * 0.16} fill={palette.tealDark} />
      <XG m={mat.translate(0, -sh * 0.06)}>
        <path d={glyph} fill={palette.peach} />
        <path d={`M${(-gw * 0.3).toFixed(2)} ${(-gh * 0.18).toFixed(2)}h${(gw * 0.42).toFixed(2)}`} stroke={palette.tealDark} strokeWidth={Math.max(1.2, gh * 0.09)} strokeLinecap="round" />
      </XG>
    </XG>
  );
};

// ---------------------------------------------------------------- glass panes (mintPale under the golden relight)
// The golden step table turns mintPale glass into cream (the same value as the wall and the paving): the board read as
// a beige slab. The panes keep their day glass (a static day Tod) and get two glint strokes in a top corner clones
// never land on. Rendered through the RailBoard pane slots, so the kit's pane outline, tint and handle stay on top.

export const PaneGlass: React.FC<{r: PaneRect; corner: 'tl' | 'tr'; seed: string}> = ({r, corner, seed}) => {
  const gx = corner === 'tl' ? r.x + 26 : r.x + r.w - 44;
  return (
    <>
      <Tod value="day">
        <Fill rect={[r.x, r.y, r.w, r.h]} color={palette.mintPale} offset={false} seed={`${seed}/g`} />
      </Tod>
      <Ink d={glintAt(gx, r.y + 46, 30, `${seed}/gl`)} width={SI.far} taper={false} seed={`${seed}/gl`} />
    </>
  );
};

// ---------------------------------------------------------------- far-roof details (the town the wires run out to)
// Drawn into the set's 'roofs' layer (behind the wall): chimney stacks in the roofs' own haze tone and a line of three far
// poles (diminishing to the left) with two sagging lines on to the left edge, all hairline (far depth). A1 fix round 1:
// no TV aerials.

export const FarRoofDetails: React.FC<{seed?: string}> = ({seed = 's7roofs'}) => {
  const chim: [number, number, number, number][] = [
    [-30, 790, 16, 22],
    [128, 790, 14, 18],
    [232, 808, 18, 20],
    [418, 800, 14, 16],
    [700, 812, 16, 20],
  ];
  let stacks = '';
  for (const [x, y, w, h] of chim) stacks += `M${x} ${y}V${y - h}H${x + w}V${y}Z`;
  let caps = '';
  for (const [x, y, w, h] of chim) caps += `M${x - 3} ${y - h}H${x + w + 3}V${y - h - 4}H${x - 3}Z`;
  // A1 fix round 1: NO TV aerials (three small masts with cross bars read as '天' / '‡' glyphs at phone size, and a yagi
  // on a chimney sat right on the town's wire 2): the far-city step (FarCity) and the receding far poles carry the skyline
  // the far poles: the one at x 262 on the 808 roof and two smaller ones further off (x 205, 18: h 34 -> 23 -> 16), their
  // two lines running from pole to pole and on out of the left edge: a line of poles receding into the city
  const poles = [
    {x: 262, base: 808, h: 34, bar: 10},
    {x: 205, base: 808, h: 23, bar: 7},
    {x: 18, base: 790, h: 16, bar: 5},
  ];
  let pole = '';
  poles.forEach((p, i) => {
    const top = p.base - p.h;
    pole += line(p.x, p.base, p.x, top, {over: 0, seed: `${seed}/p${i}`}) + line(p.x - p.bar, top + 4 * (p.h / 34), p.x + p.bar, top + 4 * (p.h / 34), {over: 0, seed: `${seed}/pb${i}`});
  });
  // each line sags between its tie points (the crossbar ends, inset 2)
  const ties = (side: -1 | 1): Pt[] => [...poles.map((p): Pt => [p.x + side * (p.bar - 2), p.base - p.h + 4 * (p.h / 34)]), [-200, side < 0 ? 776 : 783]];
  const sagLine = (pts: Pt[], sag: number) =>
    pts
      .slice(1)
      .map((b, i) => {
        const a = pts[i];
        return `${i ? '' : `M${a[0].toFixed(1)} ${a[1].toFixed(1)}`}Q${((a[0] + b[0]) / 2).toFixed(1)} ${(Math.max(a[1], b[1]) + sag * (Math.abs(a[0] - b[0]) / 120)).toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
      })
      .join('');
  const lines = sagLine(ties(-1), 7) + sagLine(ties(1), 9);
  return (
    <>
      <Fill d={stacks + caps} color={HALF.sand} offset={false} seed={`${seed}/st`} />
      <Ink d={pole} width={SI.hair} taper={false} seed={`${seed}/ai`} />
      <Ink d={lines} width={SI.hair * 0.8} taper={false} order="all" seed={`${seed}/pl`} />
    </>
  );
};

/** A1 fix round 1 (the colossal 'whole city' the wires run out to did not read: a thin band of a few bumps): one
 *  FILL-ONLY far-city step behind the far roofs on the left, a haze tone between the golden sky and the roofs, no ink
 *  (style bible: far layers flatter, closer to the sky): a stepped skyline 20-40 px above the roofline (a dome, a
 *  tower, flat blocks) that steps down and thins toward the left edge. World px, drawn first in the set's 'roofs' layer
 *  (x <= 452: clear of the sun's disc and the clock; screen y > 600 at every camera pose: under the caption band). */
export const FAR_CITY_HAZE = '#98C0AE';
export const FarCity: React.FC<{seed?: string}> = ({seed = 's7city'}) => {
  const top: Pt[] = [
    [452, 812], [452, 766], [430, 766], [430, 748], [418, 748], [418, 762], [392, 762], [392, 756],
    [356, 756], [356, 768], [318, 768], [318, 752], [304, 752], [304, 744], [296, 744], [296, 752], [282, 752], [282, 764],
    [248, 764], [248, 772], [214, 772], [214, 760], [186, 760], [186, 770], [158, 770], [158, 776], [120, 776], [120, 768],
    [96, 768], [96, 778], [62, 778], [62, 774], [34, 774], [34, 782], [-20, 782], [-20, 786], [-160, 786], [-160, 812],
  ];
  // a small dome on the tower block at x 392-356 (the city's one round silhouette, far and flat)
  const dome = `M362 756A12 11 0 0 1 386 756Z`;
  return <Fill d={polyPath(top) + dome} color={FAR_CITY_HAZE} offset={false} mode="snap" seed={seed} />;
};

// ---------------------------------------------------------------- quiet wall details (the left wall field)
// Fix round 1: the left wall (screen x 0-170 after the push) was a bare flat field. A drainpipe down the wall's left end
// (hopper head under the cornice, three brackets, a shoe at the paving) and the torn corner of an old poster, both
// static, at the mid ink weight, in the wall's own family (tan / cream / sand): architecture, not events. Drawn into the
// set's 'wall' layer (behind the board and the readers).

export const WallDetails: React.FC<{seed?: string}> = ({seed = 's7wall'}) => {
  const P = {x: 6, w: 14, top: 884, bot: 1548};
  const pipe = `M${P.x} ${P.top + 26}V${P.bot - 14}Q${P.x} ${P.bot} ${P.x + 12} ${P.bot}H${P.x + P.w + 14}V${P.bot - P.w}H${P.x + P.w}V${P.top + 26}Z`;
  const head = polyPath([
    [P.x - 9, P.top],
    [P.x + P.w + 9, P.top],
    [P.x + P.w + 3, P.top + 26],
    [P.x - 3, P.top + 26],
  ]);
  const brackets = [1000, 1200, 1400].map((y, i) => line(P.x - 4, y, P.x + P.w + 4, y + 0.5, {over: 0, seed: `${seed}/b${i}`})).join('');
  // the torn poster corner: an old notice's top-left, its lower-right edge torn off (a zig-zag), one faded band + rules
  const Q = {x: 34, y: 1112, w: 74, h: 58};
  const torn: Pt[] = [
    [Q.x, Q.y],
    [Q.x + Q.w, Q.y + 2],
    [Q.x + Q.w - 6, Q.y + 14],
    [Q.x + Q.w - 16, Q.y + 19],
    [Q.x + Q.w - 22, Q.y + 33],
    [Q.x + Q.w - 36, Q.y + 38],
    [Q.x + 30, Q.y + 50],
    [Q.x + 14, Q.y + 52],
    [Q.x + 6, Q.y + Q.h],
    [Q.x - 1, Q.y + Q.h - 2],
  ];
  const band = polyPath([
    [Q.x + 4, Q.y + 8],
    [Q.x + Q.w - 6, Q.y + 9],
    [Q.x + Q.w - 9, Q.y + 15],
    [Q.x + 4, Q.y + 15],
  ]);
  const rules = line(Q.x + 7, Q.y + 25, Q.x + 44, Q.y + 25.5, {over: 0, seed: `${seed}/r1`}) + line(Q.x + 7, Q.y + 34, Q.x + 30, Q.y + 34.5, {over: 0, seed: `${seed}/r2`});
  return (
    <>
      <Fill d={pipe + head} color={palette.tan} seed={`${seed}/pf`} />
      <Ink d={pipe + head + brackets} width={SI.mid} taper={false} seed={`${seed}/pi`} />
      <XG m={mat.about(mat.rotate(-4), Q.x, Q.y)}>
        <Fill d={polyPath(torn)} color={palette.cream} seed={`${seed}/qf`} />
        <Fill d={band} color={palette.sand} offset={false} seed={`${seed}/qb`} />
        <Ink d={poly(torn, {closed: true, seed: `${seed}/qo`, over: 1})} width={SI.mid * 0.8} taper={false} seed={`${seed}/qo`} />
        <Ink d={rules} width={SI.far * 0.8} taper={false} seed={`${seed}/qr`} />
        <circle cx={Q.x + 5} cy={Q.y + 5} r={2.6} fill={palette.ink} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- the ground in front of the wall (fix round 2)
// The board stood on a bare cream plane. Static, in the set's 'ground' layer (so the pen reveal draws its marks): the
// wall's flat contact shadow (backlit: it falls toward us), misregistered, its lower edge stepped; a short cast strip
// under each board leg; a pale pavement strip between the set's two kerb lines; a dropped copy lying flat, a fallen
// leaf and loose cobble ticks in y 1555-1660 (the empty lower centre, above the bottom UI zone).

export const GroundDetails: React.FC<{seed?: string}> = ({seed = 's7ground'}) => {
  const shadow = polyPath([
    [-160, 1499],
    [790, 1499],
    [812, 1516],
    [560, 1517],
    [548, 1524],
    [180, 1525],
    [168, 1519],
    [-150, 1520],
  ]);
  const legs = [205, 672].map((x) => polyPath([[x - 8, 1499], [x + 8, 1499], [x + 30, 1531], [x + 14, 1531]])).join('');
  const strip = polyPath([[-160, 1521], [1240, 1523], [1240, 1543], [-160, 1541]]);
  // the dropped copy: a small sheet lying flat on the paving (a flattened, turned rectangle), heading bar + a rule
  const C = {x: 585, y: 1606, w: 62, h: 24, rot: -9};
  const sheet: Pt[] = [
    [-C.w / 2, -C.h / 2],
    [C.w / 2 - 8, -C.h / 2],
    [C.w / 2, -C.h / 2 + 4],
    [C.w / 2, C.h / 2],
    [-C.w / 2, C.h / 2],
  ];
  const leaf = `M424 1636Q432 1622 447 1625Q442 1640 424 1636Z`;
  // A1 fix round 1: the set's long ground rays and its cross read as a registration '+' under the board (S07 drops them,
  // `withoutGroundMarks`); the paving gets reference 2's ground ticks instead: short PAIRED dashes and small grass commas,
  // 8-20 px, densest along the kerb and thinning toward the frame bottom (the bottom UI zone), clear of the dropped copy
  // and the leaf
  const dash = (x: number, y: number, l: number, k: string) => {
    const r = rng(`${seed}/d${k}`);
    const a = r.range(-4, 4);
    const g = r.range(5, 8);
    const l2 = l * r.range(0.45, 0.7);
    const dy = Math.tan((a * Math.PI) / 180);
    return line(x, y, x + l, y + l * dy, {over: 0, seed: `${seed}/da${k}`}) + line(x + l + g, y + (l + g) * dy + r.range(-1, 1), x + l + g + l2, y + (l + g + l2) * dy, {over: 0, seed: `${seed}/db${k}`});
  };
  const comma = (x: number, y: number, h: number, k: string) => {
    const r = rng(`${seed}/g${k}`);
    const lean = r.range(-0.35, 0.35) * h;
    const h2 = h * r.range(0.55, 0.75);
    return `M${x.toFixed(1)} ${y.toFixed(1)}q${(lean * 0.2).toFixed(1)} ${(-h * 0.55).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)}` + `M${(x + 4).toFixed(1)} ${(y + 0.5).toFixed(1)}q${(2 + lean * 0.3).toFixed(1)} ${(-h2 * 0.5).toFixed(1)} ${(4 + lean * 0.6).toFixed(1)} ${(-h2).toFixed(1)}`;
  };
  const DASHES: [number, number, number][] = [
    [262, 1561, 14], [384, 1566, 12], [512, 1559, 16], [640, 1563, 12], [748, 1568, 14], [858, 1560, 12],
    [318, 1596, 12], [478, 1604, 10], [700, 1598, 13],
    [404, 1668, 11], [628, 1676, 12], [520, 1742, 10],
  ];
  const COMMAS: [number, number, number][] = [
    [226, 1578, 11], [452, 1580, 9], [586, 1572, 10], [812, 1584, 11],
    [366, 1632, 9], [668, 1640, 10], [492, 1702, 8], [742, 1712, 9],
  ];
  const ticks = DASHES.map(([x, y, l], i) => dash(x, y, l, `${i}`)).join('') + COMMAS.map(([x, y, h], i) => comma(x, y, h, `${i}`)).join('');
  // A1 fix round 2 (eye level, 'feel a little small': the pavement was a flat strip of ticks between S06's deep lane and
  // S08's crane): four paving seams converging on a vanishing point at (480, 800) (behind the board, on the eye line),
  // spreading wider toward the frame bottom, each a hand-ruled line broken once; and short slab joints between them,
  // their spacing growing toward us. Static, far ink, in the set's ground layer (the pen's ground rows draw them on).
  const VP: Pt = [480, 800];
  const seamX = (xk: number, y: number) => VP[0] + ((xk - VP[0]) * (y - VP[1])) / (1548 - VP[1]);
  const SEAMS = [128, 352, 604, 846];
  let seams = '';
  SEAMS.forEach((xk, i) => {
    const r = rng(`${seed}/sm${i}`);
    const yb = 1548 + r.range(70, 130); // the one break
    const g = r.range(10, 18);
    seams += line(seamX(xk, 1548), 1548, seamX(xk, yb), yb, {over: 0, seed: `${seed}/sa${i}`});
    seams += line(seamX(xk, yb + g), yb + g, seamX(xk, 1930), 1930, {over: 0, seed: `${seed}/sb${i}`});
  });
  // slab joints: a short cross line in some of the bays, nearer = lower and further apart
  const JOINTS: [number, number, number][] = [
    [0, 1606, 0.55],
    [1, 1652, 0.6],
    [2, 1596, 0.5],
    [1, 1790, 0.5],
    [2, 1738, 0.62],
  ];
  JOINTS.forEach(([b, y, f], i) => {
    const xa = seamX(SEAMS[b], y);
    const xb = seamX(SEAMS[b + 1], y);
    const w = (xb - xa) * f;
    const x0 = xa + (xb - xa - w) * (i % 2 ? 0.2 : 0.65);
    seams += line(x0, y, x0 + w, y + 1.5, {over: 0, seed: `${seed}/j${i}`});
  });
  return (
    <>
      <Fill d={shadow + legs} color={palette.sand} seed={`${seed}/sh`} />
      <Fill d={strip} color={HALF.sand} offset={false} seed={`${seed}/st`} />
      <Ink d={seams} width={SI.far} taper={false} seed={`${seed}/sm`} />
      <XG m={mat.compose(mat.translate(C.x, C.y), mat.rotate(C.rot))}>
        <Fill d={polyPath(sheet)} color={palette.white} seed={`${seed}/cf`} />
        <Ink d={poly(sheet, {closed: true, seed: `${seed}/co`, over: 1.5})} width={SI.far} taper={false} seed={`${seed}/co`} />
        <Ink d={hline(-C.w * 0.36, -C.w * 0.02, -C.h * 0.18, {over: 0, seed: `${seed}/ch`})} width={SI.far * 1.8} taper={false} seed={`${seed}/ch`} />
        <Ink d={hline(-C.w * 0.36, C.w * 0.2, C.h * 0.16, {over: 0, seed: `${seed}/cr`})} width={SI.hair} taper={false} seed={`${seed}/cr`} />
      </XG>
      <Fill d={leaf} color={palette.brown} seed={`${seed}/lf`} />
      <Ink d={leaf + 'M426 1635Q436 1630 444 1626'} width={SI.hair} taper={false} seed={`${seed}/li`} />
      <Ink d={ticks} width={SI.far} taper={false} seed={`${seed}/tk`} />
    </>
  );
};

/** The set's ground layer without its GroundMarks (the long perspective rays and the cross that read as a registration
 *  mark under the board, A1 fix round 1): the paving fill and the kerb stay exactly as the kit draws them. */
export function withoutGroundMarks(node: React.ReactNode): React.ReactNode {
  if (!React.isValidElement(node)) return node;
  const kids = React.Children.toArray((node.props as {children?: React.ReactNode}).children);
  return <>{kids.filter((c) => !(React.isValidElement(c) && c.type === GroundMarks))}</>;
}

// ---------------------------------------------------------------- the clock's speed wedge
// While the minute hand of the shared HoursClock turns faster than ~25 deg / frame, a flat peach wedge trails it (a
// cartoon smear, so the spin reads as one fast sweep, not as jumps). Same angle maths and pop / out scale as the clock.

export const SpinWedge: React.FC<{r: number; at: number; spinAt: number; spinDur: number; turns: number; outAt: number}> = ({r, at, spinAt, spinDur, turns, outAt}) => {
  const t = useTime();
  if (t < at || t < spinAt || t > spinAt + spinDur) return null;
  const pop = springAt(t, at, springs.pop);
  const outK = 1 - E.inBack(1.4)(prog(t, outAt, 0.16));
  const k = Math.max(0, pop * outK);
  if (k <= 0.002) return null;
  const ang = (tt: number) => -90 + 360 * turns * E.inOutSine(clamp((tt - spinAt) / spinDur));
  const a1 = ang(t);
  const rate = a1 - ang(t - 1 / 30); // deg per frame
  if (rate < 25) return null;
  const lag = Math.min(85, rate * 1.6);
  const R = r * 0.818 * 0.8;
  const D = Math.PI / 180;
  const a0 = a1 - lag;
  const p0 = [Math.cos(a0 * D) * R, Math.sin(a0 * D) * R];
  const p1 = [Math.cos(a1 * D) * R, Math.sin(a1 * D) * R];
  const d = `M0 0L${p0[0].toFixed(2)} ${p0[1].toFixed(2)}A${R.toFixed(2)} ${R.toFixed(2)} 0 0 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}Z`;
  return (
    <g transform={`scale(${k.toFixed(4)})`}>
      <path d={d} fill={palette.peach} />
    </g>
  );
};

/** The clock's FACE (fix round 3): an opaque sun-orange disc inside the cream ring, scaled with the HoursClock's own pop /
 *  out (same maths as the kit: 7 % spring pop, inBack(1.4) out over 0.16 s), drawn under the ring and the hands. The
 *  three wires cross the sun right where the clock sits (wire 1 passes 7 px under the hub on the lifted pose, wire 2
 *  through it as the sun goes down): the face hides them inside the ring, so the hub and hands are never skewered. */
export const ClockFace: React.FC<{r: number; at: number; outAt: number}> = ({r, at, outAt}) => {
  const t = useTime();
  const ks = useInkScale();
  if (t < at) return null;
  const k = Math.max(0, springAt(t, at, springs.pop) * (1 - E.inBack(1.4)(prog(t, outAt, 0.16))));
  if (k <= 0.002) return null;
  const R = r * 0.818;
  const sw = r * 0.07 * ks;
  return <circle r={(R - sw * 0.5 + 0.6) * k} fill={palette.sun} />;
};

/** The sky above everything that hides the sun (fix round 3: the clock overlay is clipped to it, so it sinks behind the
 *  far roofs with the disc): WORLD px (apply it inside the camera group, it rides the push and the tilt). The top contour
 *  of the set's far roofs (NoticeboardCorner G.roofs, x -160..780) with FarRoofDetails' two chimney stacks near the sun
 *  (418, 700) cut in, the workshop's roof line (704) right of x 776; 0.5 px above each edge. The wall cornice (840) lies
 *  under the roofs everywhere, so the roofs are the envelope. */
export const CLOCK_SKY_CLIP = (() => {
  const top: Pt[] = [
    [-400, 812], [-60, 812], [-60, 790], [40, 790], [60, 772], [80, 790], [190, 790], [190, 808], [300, 808], [300, 784], [372, 784], [372, 800],
    [415, 800], [415, 780], [435, 780], [435, 800], [470, 800], [500, 780], [530, 800], [640, 800], [640, 812],
    [697, 812], [697, 788], [719, 788], [719, 812], [776, 812], [776, 700], [1500, 700],
  ];
  return 'M-400 -4000L1500 -4000' + top.reverse().map(([x, y]) => `L${x} ${y - 0.5}`).join('') + 'Z';
})();

/** Golden relight helper (fix round 3, palette value): clay -> sand for the lit wall fields (map for <Tod map>). */
const TAN_UC = palette.tan.toUpperCase();
export const litWall = (c: string) => (c.toUpperCase() === TAN_UC ? palette.sand : c);

/** A set layer drawn as it is, then once more relit (clay -> sand, `litWall`) over it, limited to the half-plane past
 *  `at` (world x for edge 'x': x >= at; world y for edge 'y': y >= at). A1 fix round 1 (the 1 px light seam down the
 *  workshop corner during the push): a rect clip-path is applied by Chrome PER DRAW, so on the pixel column its edge
 *  half covers, every draw of the relit copy got a partial coverage and the facade's sand fill under the door bled
 *  through the door's teal ('conflation'). The relit copy is now cut by a MASK, applied once to the composited copy (the
 *  edge pixel is a blend of two identical teals), and the edge is snapped to an even canvas px through the current
 *  world -> screen transform (a whole device px at 1x and at the 0.5x previews), crispEdges. */
export const LitCopy: React.FC<{edge: 'x' | 'y'; at: number; children?: React.ReactNode}> = ({edge, at, children}) => {
  const m = useXf();
  const id = 's7lit' + useId().replace(/[^a-zA-Z0-9]/g, '');
  // screen = k * world + o on the clip's axis (the flat camera: no rotation or skew)
  const snap = (v: number, k: number, o: number) => (Math.abs(k) < 1e-6 ? v : (Math.round((k * v + o) / 2) * 2 - o) / k);
  const r = edge === 'x' ? {x: snap(at, m[0], m[4]), y: -6000, width: 12000, height: 12000} : {x: -6000, y: snap(at, m[3], m[5]), width: 12000, height: 12000};
  return (
    <>
      {children}
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-6000} y={-6000} width={12000} height={12000}>
          <rect x={r.x.toFixed(4)} y={r.y.toFixed(4)} width={r.width} height={r.height} fill="#fff" shapeRendering="crispEdges" />
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        <Tod map={litWall}>{children}</Tod>
      </g>
    </>
  );
};

/** The one shade plane left on the public wall (fix round 3): a flat clay band, no outline, down the wall LEFT of the
 *  board (light from the right, style bible 6 'shading'): the board stands off the wall, its recess / shadow side. */
export const BoardShade: React.FC<{seed?: string}> = ({seed = 's7bshade'}) => (
  <Fill d={polyPath([[121, 922], [140, 922], [140, 1500], [124, 1500]])} color={palette.tan} offset={false} seed={seed} />
);

/** The board's centre latch is two INK-coloured fills (kit Noticeboard handles): two parallel thick bars either side of
 *  the centre stile, which read as a pause glyph near the centre of a vertical video. Fix round 3 covered them in the
 *  reveal's fills pass only; A1 fix round 1 covers them for the whole scene (with the glass they sit on: PaneGlass' day
 *  mintPale + the kit's 12 % tint, relit) and the board gets one round knob on the stile instead (`LatchKnob`). The left
 *  cover stops 1.5 px short of the stile so the stile's own ink line is never clipped (a 1 px sliver of bar there just
 *  thickens the line). */
export const LatchCover: React.FC<{board: readonly [number, number, number, number]}> = ({board}) => {
  const [x, y, w, h] = board;
  const fb = 13;
  const gw = (w - fb * 2 - 7) / 2;
  const rects: [number, number, number, number][] = [
    [x + fb + gw - 12, y + h / 2 - 25, 10.5, 50],
    [x + fb + gw + 8.5, y + h / 2 - 25, 11.5, 50],
  ];
  return (
    <>
      {rects.map((r, i) => (
        <React.Fragment key={i}>
          <Tod value="day">
            <Fill rect={r} color={palette.mintPale} offset={false} mode="snap" seed={`s7latch${i}`} />
          </Tod>
          <Fill rect={r} color={palette.mintPale} opacity={0.12} offset={false} mode="snap" seed={`s7latcht${i}`} />
        </React.Fragment>
      ))}
    </>
  );
};

/** The board's latch (A1 fix round 1): ONE small round knob on the centre stile (r 7, ink 2.2, sand fill), in place of
 *  the kit's two bars (LatchCover). Drawn in the set's reveal: its fill shows with the fills, the pen inks it with the
 *  stile. */
export const LatchKnob: React.FC<{board: readonly [number, number, number, number]}> = ({board}) => {
  const [x, y, w, h] = board;
  const cx = x + w / 2;
  const cy = y + h / 2;
  return (
    <>
      <Fill d={blob(cx, cy, 7, 7, {seed: 's7knob', wobble: 0.02})} color={palette.sand} offset={false} seed="s7knobF" />
      <Ink d={circle(cx, cy, 7, {seed: 's7knob', wobble: 0.02, overlap: 12})} width={2.2} taper={false} seed="s7knobI" />
      <circle cx={cx - 2} cy={cy - 2.2} r={1.6} fill={palette.cream} />
    </>
  );
};

/** A back-view reader's HANGING near arm without a hand (fix round 3: the kit's puffy sand hand under the cuff read as a
 *  mitten; style bible: no drawn hands on back-view figures): the kit EdgeOnlooker's own sleeve seam + cuff line, same
 *  geometry and seeds (mirrors Figures.tsx personGeo / torsoSides / the arms block: the torso length follows the frame
 *  bottom read from the transform, the rise, the idle bob), for a reader drawn with arms={false}. Draw it right after
 *  that EdgeOnlooker, with the same props, while its phone arm is down. */
export const DownSleeve: React.FC<{x: number; y: number; head: number; seed: string; cap?: boolean; riseAt?: number; bob?: number}> = ({x, y, head, seed, cap, riseAt, bob = 1.5}) => {
  const t = useTime();
  const m = useXf();
  if (riseAt !== undefined && t < riseAt) return null;
  const geo = (torsoH: number) => {
    const r = rng(`person/${seed}`);
    const w = r.range(86, 100);
    const hr = w * r.range(0.23, 0.26);
    const round = r.range(0.36, 0.45);
    return {w, hr, round, h: torsoH, hy: -torsoH - hr * 0.86};
  };
  const g0 = geo(95);
  const s = head / (g0.hr * 2);
  const iv = mat.inv(m);
  const Y = canvas.height + 40;
  const yb = Math.max(world.h + world.bleed, iv[3] * Y + iv[5], iv[1] * canvas.width + iv[3] * Y + iv[5]);
  const lift = cap ? 1.32 : 0.86;
  const need = (yb + 30 - y) / s - g0.hr * lift;
  const torsoH = Math.min(8000, Math.max(220, Math.ceil(need / 64) * 64));
  const g = geo(torsoH);
  const hyUse = cap ? -torsoH - g.hr * lift : g.hy;
  const rise = riseAt !== undefined ? (1 - MOTION.rise.ease(prog(t, riseAt, MOTION.rise.dur))) * head * 2.2 : 0;
  const hipY = y - hyUse * s + (bob ? osc(t, 0.5, rand(seed, 'b') * 6) * bob : 0);
  const W = DEPTH_INK.front / s;
  const sx = m[0] * x + m[2] * y + m[4];
  const sd: 1 | -1 = sx < canvas.width / 2 ? 1 : -1;
  const hw = g.w / 2;
  const bx = hw * 1.07;
  const R = Math.min(g.w * g.round, g.h * 0.8);
  const xAt = (yy: number) => hw + ((bx - hw) * (yy - (-g.h + R))) / (g.h - R);
  const d = g.w * 0.18;
  const yTop = -g.h + R - Math.sqrt(Math.max(0, R * R - (R - d) * (R - d))) + g.w * 0.03;
  const yCuff = -g.h + g.w * 1.05;
  const xc = xAt(yCuff);
  const seam = `M${(sd * (hw - d)).toFixed(2)} ${yTop.toFixed(2)}Q${(sd * (hw - d + g.w * 0.012)).toFixed(2)} ${((yTop + yCuff) / 2).toFixed(2)} ${(sd * (xc - d)).toFixed(2)} ${yCuff.toFixed(2)}`;
  const cuff = `M${(sd * (xc - 0.5)).toFixed(2)} ${yCuff.toFixed(2)}L${(sd * (xc - d)).toFixed(2)} ${(yCuff + 0.6).toFixed(2)}`;
  return (
    <XG m={mat.translate(0, rise)}>
      <XG m={mat.compose(mat.translate(x, hipY), mat.scale(s))}>
        <Ink d={seam + cuff} width={W * 0.85} taper={false} seed={`${seed}/seam${sd}`} />
      </XG>
    </XG>
  );
};

// ---------------------------------------------------------------- readers waiting low in the frame

/** Translates a reader from `low` px below its place up into it (out(cubic), 0.4 s) from `at`. */
export const RiseFromLow: React.FC<{at: number; low: number; children?: React.ReactNode}> = ({at, low, children}) => {
  const t = useTime();
  const k = E.outCubic(prog(t, at, 0.4));
  return <XG m={mat.translate(0, low * (1 - k))}>{children}</XG>;
};

export {clamp};
