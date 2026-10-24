// scene07/parts.tsx — S07 local helpers: the flat camera, the fill-first ink reveal, the wire copies (Bit rides one),
// the board clones (with a level of detail), the pigeons, Pip with his flyer gag, the reader's phone copy, the glass
// panes kept mintPale under the golden relight, the far-roof details and the clock's speed wedge.

import React, {useId} from 'react';
import {ease as E, Fill, Ink, lerp, Look, mat, Mat, palette, prog, springAt, springs, Tod, useTime, XG, clamp, Pt, hline, poly, polyPath, line} from '../../lib';
import {Elephant, hop} from '../../lib/mascot';
import {Bird} from '../../lib/kit';
import {Bit, DEPTH_INK, LeakSheet, MarkRing, misregScreen} from '../shared/props';
import type {PaneRect} from '../shared/props';
import {glintAt, HALF, SI, wireAt, WIRES} from '../shared/sets';
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

export const BoardClones: React.FC<{spots: CloneSpot[]; seed: string}> = ({spots, seed}) => {
  const t = useTime();
  return (
    <>
      {spots.map((sp, i) => {
        if (t < sp.at || (sp.liftAt !== undefined && t >= sp.liftAt)) return null;
        const k = springAt(t, sp.at, springs.pop);
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

/** exit: down behind the right-hand readers' coats (fully hidden by the cut: no sliver of ear on the last frames). */
export const PIP = {x: 705, y: 928, s: 1.2, entry: [-150, 1190] as Pt, exit: [1000, 1600] as Pt};
/** The flyer is flicked off this long before the word 'was' (frame 1 already moves ~30 %: out(cubic)). */
export const PEEL_LEAD = 0.08;
const PEEL_DUR = 0.25;

/** Pip's face centre in sit-front (local head centre (0, -67) at scale 1). */
const FACE: Pt = [0, -67];

export const PipS07: React.FC<{B: Beats}> = ({B}) => {
  const t = useTime();
  const land = B.pinPip;
  const inAir = 0.46;
  const offT0 = B.tilt + 0.03; // hop-off take-off on the tilt (crouch from B.tilt - 0.05)
  const offAir = 0.27;
  // 1) leap in from off-frame left after the sheet
  if (t < land) {
    const h = hop({t, t0: land - inAir, dur: inAir, from: {x: PIP.entry[0], y: PIP.entry[1]}, to: {x: PIP.x, y: PIP.y}, height: 150});
    if (!h.airborne && h.k === 0 && t < land - inAir) return null;
    return <Elephant x={h.x} y={h.y} scale={PIP.s} pose="stand-side" amount={h.spread} squash={h.squash} rotate={h.rotate} t={t} seed={7} expression="wide" />;
  }
  // 3) hop off the board, down behind the right-hand readers
  if (t >= offT0 - 0.08) {
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
  const sh = t - (B.was - PEEL_LEAD + 0.02);
  const look = front ? (sh > 0 && sh < 0.16 ? 0.95 * Math.sin(sh * Math.PI * 2 * 7) * (1 - sh / 0.16) : 0) : -0.55;
  const expr = front ? (t < B.was - PEEL_LEAD ? 'wide' : 'meh') : undefined;
  return <Elephant x={PIP.x} y={PIP.y} scale={PIP.s} pose={front ? 'sit-front' : 'sit-back'} look={look} expression={expr} squash={sq} t={t} seed={7} />;
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

/** The leak on a reader's phone screen (pops, fills the screen: ~30 x 38 world) and an ink ring pops around the phone
 *  (a spring + the ring's stroke-on, never a fade). (x, y) = the phone screen centre, world. */
export const PhoneCopy: React.FC<{x: number; y: number; at: number; rot?: number; ringAt?: number}> = ({x, y, at, rot = 0, ringAt}) => {
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
          <MarkRing x={x} y={y} r={46} at={ra} dur={0.14} depth="mid" seed="s7phoneRing" />
        </XG>
      ) : null}
    </>
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
// Drawn into the set's 'roofs' layer (behind the wall): chimney stacks in the roofs' own haze tone, TV aerials and a
// little far pole with two sagging lines on to the left edge, all hairline (far depth).

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
  // aerials: a mast and two cross bars
  const aer = (x: number, y: number, h: number, k: string) =>
    line(x, y, x, y - h, {over: 0, seed: `${seed}/a${k}`}) + line(x - 9, y - h + 5, x + 9, y - h + 5, {over: 0, seed: `${seed}/b${k}`}) + line(x - 6, y - h + 12, x + 6, y - h + 12, {over: 0, seed: `${seed}/c${k}`});
  const aerials = aer(66, 772, 30, '0') + aer(338, 784, 26, '1') + aer(512, 787, 24, '2') + aer(176, 790, 22, '3');
  // the far pole (x 262 on the 808 roof) and its two lines sagging on to the left edge (under the town wires)
  const P = {x: 262, base: 808, top: 774};
  const pole = line(P.x, P.base, P.x, P.top, {over: 0, seed: `${seed}/p`}) + line(P.x - 10, P.top + 4, P.x + 10, P.top + 4, {over: 0, seed: `${seed}/pb`});
  const lines = `M${P.x - 8} ${P.top + 4}Q${(P.x - 8) / 2 - 80} ${P.top + 18} -200 ${P.top + 2}` + `M${P.x + 8} ${P.top + 4}Q${(P.x + 8) / 2 - 70} ${P.top + 24} -200 ${P.top + 10}`;
  return (
    <>
      <Fill d={stacks + caps} color={HALF.sand} offset={false} seed={`${seed}/st`} />
      <Ink d={aerials + pole} width={SI.hair} taper={false} seed={`${seed}/ai`} />
      <Ink d={lines} width={SI.hair * 0.8} taper={false} order="all" seed={`${seed}/pl`} />
    </>
  );
};

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

// ---------------------------------------------------------------- readers waiting low in the frame

/** Translates a reader from `low` px below its place up into it (out(cubic), 0.4 s) from `at`. */
export const RiseFromLow: React.FC<{at: number; low: number; children?: React.ReactNode}> = ({at, low, children}) => {
  const t = useTime();
  const k = E.outCubic(prog(t, at, 0.4));
  return <XG m={mat.translate(0, low * (1 - k))}>{children}</XG>;
};

export {clamp};
