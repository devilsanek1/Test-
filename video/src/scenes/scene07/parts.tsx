// scene07/parts.tsx — S07 local helpers: the flat camera, the fill-first ink reveal, the wire copies (Bit rides one),
// the pigeons, Pip with his flyer gag, the reader's phone copy.

import React, {useId} from 'react';
import {ease as E, lerp, Look, mat, Mat, palette, prog, springAt, springs, useTime, XG, clamp, Pt} from '../../lib';
import {Elephant, hop} from '../../lib/mascot';
import {Bird} from '../../lib/kit';
import {Bit, LeakSheet} from '../shared/props';
import {wireAt, WIRES} from '../shared/sets';
import type {Beats} from './beats';

// ---------------------------------------------------------------- camera (storyboard flat projection)
// screen = (world - (x, y)) * z + (540, 960). Keys (S07 camera[] in docs/storyboard_v3_resolved.json):
//   cut -> cut+0.21 hold (540,960,1.0) | -> 'fix' push-in to (480,950,1.06) inOut(sine) | hold | the last 0.40 s a
//   TILT-UP to (480,760,1.06) in(sine): every layer (the sun too) moves down 201 px, exiting at ~790 px/s into S08.

export type Cam = {x: number; y: number; z: number};
export const REST: Cam = {x: 540, y: 960, z: 1};
export const PUSHED: Cam = {x: 480, y: 950, z: 1.06};
export const TILT_TO_Y = 760;

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

// ---------------------------------------------------------------- fill-first reveal (motion spec T-MATCH 4-5)
// The new scene arrives as flat fills only, then its linework draws on top -> bottom. Rendered as two passes (fills,
// then the ink clipped to everything above a falling edge) only while the reveal runs; one pass before / after it.

export type RevealPass = 'all' | 'fills' | 'ink';

export const InkReveal: React.FC<{at: number; dur: number; y0: number; y1: number; render: (pass: RevealPass) => React.ReactNode}> = ({at, dur, y0, y1, render}) => {
  const t = useTime();
  const id = 'rv' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (t >= at + dur) return <>{render('all')}</>;
  const fills = <Look ink={false}>{render('fills')}</Look>;
  if (t < at) return fills;
  const edge = lerp(y0, y1, prog(t, at, dur, E.inOutSine));
  return (
    <>
      {fills}
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={-3000} y={-4000} width={7000} height={edge + 4000} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Look fills="none">{render('ink')}</Look>
      </g>
    </>
  );
};

// ---------------------------------------------------------------- wire copies (they carry on into S08)

export type WireCopySpec = {
  /** Where it lifts off the board (world) and when. */
  from: Pt;
  liftAt: number;
  /** Peg: wire index, x on the wire, time it pegs on. */
  wire: 0 | 1 | 2;
  x: number;
  pegAt: number;
  /** Slide speed along the wire (world px/s, leftwards). */
  speed: number;
  bit?: boolean;
  seed: string;
};

const COPY = {w: 210, h: 270, s: 0.34};

/** Peg point and swing of a wire copy at t (null before lift-off). */
export function wireCopyAt(t: number, c: WireCopySpec): {pt: Pt; rot: number; s: number; pegged: boolean} | null {
  if (t < c.liftAt) return null;
  const spec = WIRES.S07;
  if (t < c.pegAt) {
    // fly up from the board: out(cubic) with an arc and a flutter
    const q = prog(t, c.liftAt, c.pegAt - c.liftAt, E.outCubic);
    const to = wireAt(spec, c.wire, c.x);
    const x = lerp(c.from[0], to[0], q);
    const y = lerp(c.from[1], to[1], q) - Math.sin(q * Math.PI) * 50;
    const dt = t - c.liftAt;
    return {pt: [x, y], rot: 22 * (1 - q) * Math.sin(dt * 26), s: lerp(0.46, COPY.s, q), pegged: false};
  }
  const dt = t - c.pegAt;
  const x = c.x - c.speed * dt;
  const pt = wireAt(spec, c.wire, x);
  // peg jolt, then a trailing lean against the travel + a slow sway
  const swing = 14 * Math.exp(-dt * 4.2) * Math.sin(dt * 15) + 5 * (1 - Math.exp(-dt * 6)) + 1.5 * Math.sin(dt * 5.3 + c.x);
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
      {c.bit ? <Bit x={9} y={-0.5} size={18} state="ride" flip look="forward" seed={`${c.seed}/bit`} /> : null}
    </XG>
  );
};

// ---------------------------------------------------------------- pigeons on the wires (hop over a passing peg)

export const Pigeon: React.FC<{wire: 0 | 1 | 2; x: number; hopAt?: number[]; flyAt?: number; flyTo?: Pt; flip?: boolean; color?: string; seed: string}> = ({wire, x, hopAt = [], flyAt, flyTo, flip, color = palette.white, seed}) => {
  const t = useTime();
  const p = wireAt(WIRES.S07, wire, x);
  let dy = 0;
  for (const a of hopAt) {
    const u = (t - a) / 0.3;
    if (u > 0 && u < 1) dy -= 26 * 4 * u * (1 - u);
  }
  return (
    <XG m={mat.translate(0, dy)}>
      <Bird x={p[0]} y={p[1] + 1} s={0.8} seed={seed} flyAt={flyAt} flyTo={flyTo} color={color} flip={flip} />
    </XG>
  );
};

// ---------------------------------------------------------------- Pip (scale 1.2 on the board top) + the flyer gag

export const PIP = {x: 705, y: 928, s: 1.2, entry: [-150, 1190] as Pt, exit: [930, 1480] as Pt};

/** Pip's face centre in sit-front (local head centre (0, -67) at scale 1). */
const FACE: Pt = [0, -67];

export const PipS07: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const land = B.pinPip;
  const inAir = 0.46;
  const offT0 = B.tilt + 0.11; // hop-off take-off (crouch from B.tilt - 0.03)
  const offAir = 0.27;
  // 1) leap in from off-frame left after the sheet
  if (t < land) {
    const h = hop({t, t0: land - inAir, dur: inAir, from: {x: PIP.entry[0], y: PIP.entry[1]}, to: {x: PIP.x, y: PIP.y}, height: 150});
    if (!h.airborne && h.k === 0 && t < land - inAir) return null;
    return <Elephant x={h.x} y={h.y} scale={PIP.s} pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={7} expression="wide" />;
  }
  // 3) hop off the board, down behind the right-hand readers
  if (t >= offT0 - 0.14) {
    const h = hop({t, t0: offT0, dur: offAir, from: {x: PIP.x, y: PIP.y}, to: {x: PIP.exit[0], y: PIP.exit[1]}, height: 34});
    if (h.airborne || t >= offT0) return <Elephant x={h.x} y={h.y} scale={PIP.s} pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={7} expression="meh" />;
    return <Elephant x={h.x} y={h.y} scale={PIP.s} pose="sit-front" squash={h.squash} t={t} seed={7} expression="meh" />;
  }
  // 2) on the board top: sit-back watching the notice; the slap flips him to sit-front behind the flyer; head shake
  const landSq = hop({t, t0: land - inAir, dur: inAir, from: {x: PIP.entry[0], y: PIP.entry[1]}, to: {x: PIP.x, y: PIP.y}, height: 150}).squash;
  const front = t >= B.slap;
  const sw = (dt: number) => (dt > -0.1 && dt < 0.45 ? (dt < 0 ? 0.14 * prog(dt, -0.1, 0.1) : 0.14 * Math.exp(-dt * 9) * Math.cos(dt * Math.PI * 2 * 3.4)) : 0);
  const sq = landSq + sw(t - B.slap) * 1.4;
  // the shake after the peel: look swings left / right, decaying
  const sh = t - (B.was + 0.03);
  const look = front ? (sh > 0 && sh < 0.2 ? 0.95 * Math.sin(sh * Math.PI * 2 * 7) * (1 - sh / 0.2) : 0) : -0.55;
  const expr = front ? (t < B.was ? 'wide' : 'meh') : undefined;
  return <Elephant x={PIP.x} y={PIP.y} scale={PIP.s} pose={front ? 'sit-front' : 'sit-back'} look={look} expression={expr} squash={sq} t={t} seed={7} />;
};

/** The copy that slaps onto Pip's face on 'out' (from pane 2), sticks, and is flicked away on 'was'. */
export const Flyer: React.FC<{B: Beats; from: Pt}> = ({B, from}) => {
  const t = useTime();
  const t0 = B.slap - 0.1;
  if (t < t0) return null;
  const peel = B.was;
  if (t > peel + 0.3) return null;
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
    // flicked away up-right by his trunk
    const q = prog(t, peel, 0.3, E.inQuad);
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

// ---------------------------------------------------------------- the pin dot and the phone copy

export const PinDot: React.FC<{x: number; y: number; at: number}> = ({x, y, at}) => {
  const t = useTime();
  if (t < at) return null;
  const k = springAt(t, at, springs.pop);
  return (
    <g transform={`translate(${x} ${y}) scale(${k.toFixed(4)})`}>
      <circle r={7.5} fill={palette.ink} />
      <circle cx={-2.2} cy={-2.4} r={2.2} fill={palette.cream} />
    </g>
  );
};

/** A tiny copy of the leak on a reader's phone screen (pops). (x, y) = the phone screen centre, world. */
export const PhoneCopy: React.FC<{x: number; y: number; at: number; rot?: number}> = ({x, y, at, rot = 0}) => {
  const t = useTime();
  if (t < at) return null;
  const k = springAt(t, at, springs.pop);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(k))}>
      <LeakSheet x={0} y={0} w={16} h={21} pin={false} depth="hair" seed="s7phone" />
    </XG>
  );
};

export {clamp};
