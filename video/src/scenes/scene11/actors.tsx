// S11 local actors: the cornice / shutter-box pigeons (small ink birds), the sill snail (with its one-antenna-then-the-other
// gag), govB's window (BrowserChrome + the page: 'updating...' lettered in the address pill, ONE fat progress bar with a
// big % flip tile that can't finish, a hiccuping loading ring in the chrome bar, content bars that keep reloading), and
// the CRT power-off screen used for the govA / govC windows (the set's crtContent, which a windowSlot override bypasses).
// All world coordinates (GovernmentPlaza, S01 camera rest); times in scene seconds.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, circle, rectPath, roundRect, smooth, Pt} from '../../lib/sketch';
import {mat, useXf, XG} from '../../lib/xf';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {BrowserChrome, ProgressStep} from '../shared/props';
import {matScale} from '../shared/props/common';
import {CRT} from '../shared/sets';

// ---------------------------------------------------------------- Pigeon

export type PigeonProps = {
  /** Feet (world). */
  x: number;
  y: number;
  s?: number;
  flip?: boolean;
  /** Flies in along an arc from `from` and lands at (x, y) at `at` (wings flap, a landing squash). */
  land?: {at: number; from: Pt; dur?: number};
  /** Side-steps: at each time it hops dx (world px) and turns to face the way it went. */
  shuffle?: {at: number; dx: number}[];
  /** Preens: dips and twists the head into its wing (0.45 s). */
  preenAt?: number;
  /** Little hops in place (with a wing beat). */
  hopAt?: number[];
  /** Hop height (world, default 14). */
  hopH?: number;
  /** Flies off: a 2-frame crouch (turned toward the flight), then a launch along `flyTo` (direction only), the WHOLE
   *  bird (body + head) with flapping wing strokes, nose up; speed `flySpeed` screen px / frame at launch -> 0.45 s
   *  later (it accelerates: no ease-in, no pop-out). */
  flyAt?: number;
  flyTo?: Pt;
  flySpeed?: [number, number];
  color?: string;
  seed?: string;
};

const wings = (t: number, ph: number, hz = 7) => {
  const flap = osc(t, hz, ph) * 9;
  return `M-16 ${(-6 - flap).toFixed(1)}Q-8 -2 0 0Q8 -2 16 ${(-6 - flap).toFixed(1)}`;
};

/** Flight wings: two cream wing blades with ink edges over the body, beating 8 Hz from tips-down (-) to tips-up (+),
 *  big enough to read as flapping at phone size (the landing glide's single stroke reads as a stray line in flight). */
const FlightWings: React.FC<{t: number; ph: number; s: number; k: number; color: string; seed: string}> = ({t, ph, s, k, color, seed}) => {
  const f = osc(t, 8, ph); // -1 .. 1
  const tipY = -12 - f * 15;
  const near = `M-1 -13Q-9 ${(tipY - 2).toFixed(1)} -22 ${tipY.toFixed(1)}Q-12 ${(tipY * 0.4 - 6).toFixed(1)} -3 -9Z`;
  const far = `M3 -13Q11 ${(tipY - 2).toFixed(1)} 21 ${(tipY + 2).toFixed(1)}Q13 ${(tipY * 0.4 - 6).toFixed(1)} 5 -9Z`;
  const w = 2.4 / (k * s);
  return (
    <XG m={mat.scale(s)}>
      <Fill d={far} color={palette.tan} offset={false} mode="none" seed={`${seed}/fwf`} />
      <Ink d={far} width={w * 0.8} taper={false} vary={0} seed={`${seed}/fwfi`} />
      <Fill d={near} color={color} offset={false} mode="none" seed={`${seed}/fwn`} />
      <Ink d={near} width={w * 0.9} taper={false} vary={0} seed={`${seed}/fwni`} />
    </XG>
  );
};

/** A small ink pigeon (the reference's birds: a cream body with a tan wing, an ink DOT eye, a tan beak; no white, no
 *  orange, no cartoon eye), drawn at the parent's ink. Static body: the Pigeon moves it (landing glide, hops, flight). */
const InkBird: React.FC<{s: number; seed: string; color?: string}> = ({s, seed, color = palette.cream}) => {
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  const iw = 2.4 / k;
  const ph = rand(seed, 'ph') * 6.28;
  // idle: an occasional head turn
  const look = Math.sin(t * 1.3 + ph) > 0.75 ? -10 : 0;
  const w = iw / s;
  return (
    <XG m={mat.scale(s)}>
      <Fill d={blob(0, -10, 13, 9, {seed: `${seed}/b`, wobble: 0.04})} color={color} offset={[-2.4 / (k * s), -1.4 / (k * s)]} mode="none" seed={`${seed}/f`} />
      <Ink d="M-11 -16Q-2 -21 6 -18M-12 -4Q-4 1 8 -2M-12 -7L-24 -2" width={w * 0.9} seed={`${seed}/i`} />
      <Fill d="M-6 -14Q2 -16 6 -10Q0 -6 -8 -9Z" color={palette.tan} offset={false} mode="none" seed={`${seed}/w`} />
      <XG m={look ? mat.about(mat.rotate(look), 9, -16) : mat.I}>
        <Fill d={blob(10, -19, 6, 5.6, {seed: `${seed}/h`})} color={color} offset={false} mode="none" seed={`${seed}/hf`} />
        <Ink d={circle(10, -19, 6, {seed: `${seed}/h`, overlap: 12})} width={w * 0.85} seed={`${seed}/hi`} />
        <path d="M15.6 -19.6L20.5 -18.2L15.6 -16.6Z" fill={palette.tan} stroke={palette.ink} strokeWidth={w * 0.45} strokeLinejoin="round" />
        <path d={blob(12.2, -20.2, 1.15, 1.15, {seed: `${seed}/eye`})} fill={palette.ink} />
      </XG>
    </XG>
  );
};

export const Pigeon: React.FC<PigeonProps> = ({x, y, s = 0.7, flip = false, land, shuffle = [], preenAt, hopAt = [], hopH = 14, flyAt, flyTo = [-260, -320], flySpeed = [16, 24], color = palette.cream, seed = 'pg'}) => {
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  const ph = rand(seed, 'ph') * 6.28;
  // ---- arriving
  if (land) {
    const dur = land.dur ?? 0.5;
    if (t < land.at - dur) return null;
    if (t < land.at) {
      // a glide in (half linear, half ease-out: it brakes into the landing), the WHOLE bird (body + head) with the
      // flapping wing strokes over its back, tipped nose-up as it brakes: the body never pops in on landing
      const u = prog(t, land.at - dur, dur);
      const q = 0.5 * u + 0.5 * E.outSine(u);
      const px = lerp(land.from[0], x, q);
      const py = lerp(land.from[1], y, q) - Math.sin(q * Math.PI) * 30;
      const dir = land.from[0] > x ? -1 : 1;
      return (
        <XG m={mat.compose(mat.translate(px, py), mat.scale(dir, 1), mat.rotate(-10 * Math.sin(Math.PI * u)))}>
          <InkBird s={s} seed={seed} color={color} />
          <XG m={mat.compose(mat.translate(-2 * s, -16 * s), mat.scale(s * 0.9))}>
            <path d={wings(t, ph)} fill="none" stroke={palette.ink} strokeWidth={2.6 / (k * s)} strokeLinecap="round" strokeLinejoin="round" />
          </XG>
        </XG>
      );
    }
  }
  // ---- standing: position after the shuffles, facing
  let dx = 0;
  let dy = 0;
  let face = flip;
  for (const sh of shuffle) {
    if (t < sh.at) break;
    const q = prog(t, sh.at, 0.18, E.inOutSine);
    dx += sh.dx * q;
    dy -= Math.sin(Math.PI * q) * 5;
    if (t >= sh.at + 0.02) face = sh.dx < 0;
  }
  // ---- flying off: crouch (2 frames, turned toward the flight), then launch, the whole bird flapping, nose up
  if (flyAt !== undefined && t >= flyAt) {
    const d = t - flyAt;
    const CROUCH = 2 / 30;
    const len = Math.hypot(flyTo[0], flyTo[1]) || 1;
    const left = flyTo[0] < 0;
    let ox = 0;
    let oy = 0;
    let sqY = 1;
    let tilt = 0;
    if (d < CROUCH) sqY = 1 - 0.2 * Math.sin(((d / CROUCH) * Math.PI) / 2);
    else {
      const u = d - CROUCH;
      const v0 = (flySpeed[0] * 30) / k;
      const acc = ((flySpeed[1] - flySpeed[0]) * 30) / k / 0.45;
      const dist = v0 * u + 0.5 * acc * u * u;
      ox = (flyTo[0] / len) * dist;
      oy = (flyTo[1] / len) * dist;
      sqY = 1 + 0.14 * Math.exp(-u * 14); // stretch off the launch
      tilt = -16;
    }
    return (
      <XG m={mat.compose(mat.translate(x + dx + ox, y + dy + oy), mat.scale(left ? -1 : 1, 1), mat.rotate(tilt), mat.scale(1, sqY))}>
        <InkBird s={s} seed={seed} color={color} />
        {d >= CROUCH ? <FlightWings t={t} ph={ph} s={s} k={k} color={color} seed={seed} /> : null}
      </XG>
    );
  }
  let flap = false;
  for (const h of hopAt) if (t >= h && t < h + 0.3) {
    dy -= Math.sin(prog(t, h, 0.3) * Math.PI) * hopH;
    flap = true;
  }
  for (const sh of shuffle) if (t >= sh.at && t < sh.at + 0.2) flap = true;
  if (preenAt !== undefined && t >= preenAt + 0.1 && t < preenAt + 0.45) flap = true;
  // landing squash
  let sq = 1;
  if (land && t < land.at + 0.16) sq = 1 - 0.18 * Math.sin(prog(t, land.at, 0.16) * Math.PI);
  // preen: the whole bird dips forward and twists (a head-into-wing peck), twice
  let rot = 0;
  if (preenAt !== undefined && t >= preenAt && t < preenAt + 0.5) rot = 22 * Math.abs(Math.sin(prog(t, preenAt, 0.5) * Math.PI * 2));
  return (
    <XG m={mat.compose(mat.translate(x + dx, y + dy), mat.scale(face ? -1 : 1, sq), mat.rotate(rot))}>
      <InkBird s={s} seed={seed} color={color} />
      {flap ? (
        <XG m={mat.compose(mat.translate(-2 * s, -16 * s), mat.scale(s * 0.9))}>
          <path d={wings(t, ph)} fill="none" stroke={palette.ink} strokeWidth={2.6 / (k * s)} strokeLinecap="round" strokeLinejoin="round" />
        </XG>
      ) : null}
    </XG>
  );
};

// ---------------------------------------------------------------- the sill snail

export type SillSnailProps = {
  /** Foot point (world) where the shell first appears. */
  x: number;
  y: number;
  /** Length (world px). The S11 sill snail is ~24. */
  size?: number;
  /** Faces left (default: it crawls in from the right end of the sill). */
  flip?: boolean;
  /** The shell pops in (body still tucked in). */
  shellAt: number;
  /** The body comes out and it crawls (world px/s). */
  crawlAt: number;
  speed?: number;
  /** Pulls into its shell (a 0.10 s snap, at the clunk). */
  hideAt?: number;
  /** One eye stalk pokes out, then the other (+0.2 s). */
  antennaeAt?: number;
  /** The head peeks out again. */
  peekAt?: number;
  seed?: string;
};

const FOOT = smooth(
  [
    [-12, 0],
    [11, 0],
    [13, -2],
    [13, -6],
    [10, -8],
    [6, -5],
    [-2, -3],
    [-10, -2],
  ],
  {closed: true},
);
const SPIRAL = (() => {
  const pts: Pt[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = (i / 16) * Math.PI * 3.4;
    const rr = 6.6 - (i / 16) * 5.4;
    pts.push([-2 + Math.cos(a + 2.2) * rr, -8.5 + Math.sin(a + 2.2) * rr]);
  }
  return smooth(pts);
})();

export const SillSnail: React.FC<SillSnailProps> = ({x, y, size = 24, flip = true, shellAt, crawlAt, speed = 7, hideAt, antennaeAt, peekAt, seed = 'snail11'}) => {
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  if (t < shellAt) return null;
  const s = size / 24;
  const iw = 2.2 / (k * s); // ~2.2 px on screen
  // distance crawled (stops when it hides)
  const crawlEnd = hideAt ?? 1e9;
  // A1 polish (review: 7 world px/s = ~0.4 px / frame never read as motion): a lurch out of the shell first, 20 world
  // px/s (~1.1 px / frame) for 0.3 s, slowing linearly to `speed` by 0.6 s, then the slow crawl
  const crawled = (d: number) => (d <= 0.3 ? 20 * d : d <= 0.6 ? 6 + (20 * (d - 0.3) - ((20 - speed) / 0.3) * (d - 0.3) ** 2 / 2) : 6 + 0.15 * (20 + speed) + speed * (d - 0.6));
  const dist = t >= crawlAt ? crawled(Math.min(t, crawlEnd) - crawlAt) : 0;
  const moving = t >= crawlAt && t < crawlEnd;
  // body extension 0 (tucked) .. 1 (out)
  // fix round 3: the head + stalks are out ON the word (the emergence leads `crawlAt` by 0.06 s over a 0.14 s ramp: out
  // ~0.85 on the word's frame; was a 0.25 s ramp from the word, nothing visible for 2-3 frames), and the startled
  // pull-in SNAPS at its start (outCubic over 0.10 s; was an inCubic 0.16 s that barely moved for 2 frames)
  let out = 0;
  if (t >= crawlAt - 0.06) out = prog(t, crawlAt - 0.06, 0.14, E.outCubic);
  if (hideAt !== undefined && t >= hideAt) out = Math.min(out, 1 - prog(t, hideAt, 0.1, E.outCubic));
  if (peekAt !== undefined && t >= peekAt) out = Math.max(out, 0.55 * prog(t, peekAt, 0.25, E.outBack(1.4)));
  // eye stalks: full while out; after hiding, one then the other pokes out of the shell mouth
  let st1 = out > 0.6 ? 1 : 0;
  let st2 = st1;
  if (antennaeAt !== undefined && t >= antennaeAt) {
    st1 = Math.max(st1, prog(t, antennaeAt, 0.14, E.outBack(1.6)));
    st2 = Math.max(st2, prog(t, antennaeAt + 0.2, 0.14, E.outBack(1.6)));
  }
  const pop = springAt(t, shellAt, springs.pop);
  // each eye stalk pokes out with a little jolt of the shell
  let jolt = 0;
  if (antennaeAt !== undefined) for (const a of [antennaeAt, antennaeAt + 0.2]) if (t >= a && t < a + 0.16) jolt -= 3.5 * Math.sin(prog(t, a, 0.16) * Math.PI);
  const peri = moving ? 1 + 0.07 * Math.sin((t - crawlAt) * 6) : 1;
  const wob = osc(t, 1.3, rand(seed, 'p') * 6) * 1.2;
  // when tucked, the stalks start from the shell mouth (-2 + 6, -6) instead of the head
  const hx = lerp(4, 10, out);
  const hy = lerp(-6, -7, out);
  const stalk = (q: number, dx: number, dy: number) => {
    if (q <= 0.02) return {d: '', eye: null as Pt | null};
    const ex = hx + (dx + wob * 0.6) * q;
    const ey = hy + dy * q;
    return {d: `M${hx.toFixed(2)} ${hy.toFixed(2)}L${ex.toFixed(2)} ${ey.toFixed(2)}`, eye: [ex, ey] as Pt};
  };
  const a1 = stalk(st1, 4, -14);
  const a2 = stalk(st2, 9, -12);
  const eyes = [a1.eye, a2.eye].filter((e): e is Pt => !!e);
  const dirX = flip ? -1 : 1;
  return (
    <XG m={mat.compose(mat.translate(x + dirX * dist, y + jolt), mat.scale(dirX * s * pop, s * pop))}>
      {out > 0.02 ? (
        <XG m={mat.about(mat.scale(peri * lerp(0.3, 1, out), lerp(0.55, 1, out)), -2, 0)}>
          <Fill d={FOOT} color={palette.cream} offset={false} mode="none" seed={`${seed}/ft`} />
          <Ink d={FOOT} width={iw * 0.8} open={0.15} vary={0} seed={`${seed}/fti`} />
        </XG>
      ) : null}
      {a1.d || a2.d ? <Ink d={a1.d + a2.d} width={iw * 0.75} taper={false} order="all" vary={0} seed={`${seed}/st`} /> : null}
      {eyes.length ? <path d={eyes.map((e) => blob(e[0], e[1], 2, 2, {seed: `${seed}/e${e[0].toFixed(0)}`})).join('')} fill={palette.ink} /> : null}
      <Fill d={blob(-2, -8.5, 7.6, 7.4, {seed: `${seed}/sh`})} color={palette.sand} offset={[1.2 / k / s, 0.9 / k / s]} mode="none" seed={`${seed}/sh`} />
      <Ink d={circle(-2, -8.5, 7.6, {seed: `${seed}/sho`, overlap: 6}) + SPIRAL} width={iw * 0.8} vary={0} seed={`${seed}/shi`} />
    </XG>
  );
};

// ---------------------------------------------------------------- the loading ring (with hiccups)

/** The props LoadingRing's look (peach band, ink rims, an ink arc spinning at 1.2 rev/s), but the spinner HICCUPS:
 *  at each time it stalls for 0.1 s, kicks back 50 deg and carries on, with a tiny pulse. */
export const HiccupRing: React.FC<{x: number; y: number; r: number; hiccups: number[]; inkW: number; spin?: number; fastAt?: number[]}> = ({x, y, r, hiccups, inkW, spin = 1.2, fastAt = []}) => {
  const t = useTime();
  let ang = t * spin * 360;
  // the page tries again: the ring spins at 2x for 0.3 s
  for (const f of fastAt) ang += Math.max(0, Math.min(t - f, 0.3)) * spin * 360;
  let pk = 1;
  for (const h of hiccups) {
    if (t < h) continue;
    // stall 0.1 s (lose the turned angle), then a 50 deg kick back over 0.08 s
    ang -= Math.min(t - h, 0.1) * spin * 360;
    ang -= 50 * prog(t, h + 0.1, 0.08, E.outCubic);
    if (t < h + 0.25) pk = 1 + 0.18 * Math.sin(prog(t, h, 0.25) * Math.PI);
  }
  const band = r * 0.46;
  const a0 = ((ang - 90) * Math.PI) / 180;
  const a1 = ((ang - 10) * Math.PI) / 180;
  return (
    <g transform={`translate(${x} ${y}) scale(${pk.toFixed(4)})`}>
      <circle r={r} fill="none" stroke={palette.peach} strokeWidth={band} />
      <circle r={r + band / 2} fill="none" stroke={palette.ink} strokeWidth={inkW} />
      <circle r={Math.max(0.5, r - band / 2)} fill="none" stroke={palette.ink} strokeWidth={inkW * 0.7} />
      <path d={`M${(Math.cos(a0) * r).toFixed(2)} ${(Math.sin(a0) * r).toFixed(2)}A${r} ${r} 0 0 1 ${(Math.cos(a1) * r).toFixed(2)} ${(Math.sin(a1) * r).toFixed(2)}`} fill="none" stroke={palette.ink} strokeWidth={band * 0.55} strokeLinecap="round" />
    </g>
  );
};

// ---------------------------------------------------------------- govB's window

export type GovBWindowProps = {
  r: [number, number, number, number];
  /** Progress steps (fraction): the page's ONE fat bar + its flip-tile % readout (fix round 3: the address pill shows
   *  the lettered 'updating...' instead of a second bar). An UP step JUMPS past its value (+5 %: 8 -> ~14 %, then sags
   *  back to the value over 0.35 s), flashes the fill cream for 2 frames and scale-pops the % tile 1.2x; a down step
   *  snaps (A1 polish: the fill sliver and the trough's outline flash peach for 2 frames and the bar row jolts -/+6 px;
   *  the trough is never filled: a full peach bar read as 100 % / done). */
  steps: ProgressStep[];
  /** Ring hiccups. */
  hiccups: number[];
  /** The page tries again: 'updating...' re-letters (no blank frames), the content bars are gone (reloading), the ring
   *  spins 2x for 0.3 s. The fill and the % tile HOLD (fix round 2: the only regression in the scene is 'yet'). */
  reloadAt?: number[];
  /** The page shakes 'no' (0.24 s, 5 world px decaying: the bar row shakes with it). */
  shakeAt?: number;
  /** The page's three content bars draw on (it is still loading). */
  barsAt?: number[];
  /** Screen-local x where the content bars start (default: the page margin). S11 starts them under the notice's left
   *  edge, so once the notice is taped up they are all under it (no bar ends poking out between Pip's ear and it). */
  barsX0?: number;
  /** The fill's leading edge (its last ~8 px) flickers on / off every 2 frames for 0.27 s without moving; the % tile
   *  stays drawn and ticks once (1 frame). */
  flickerAt?: number;
  /** Loading-ring radius (world; the chrome's own is ~10). */
  ringR?: number;
  /** The loader gives up: a peach '!' badge springs onto the ring's centre (covering the spinner) and holds (the shutter
   *  covers it). */
  alertAt?: number;
  inkW: number;
  children?: React.ReactNode;
  seed?: string;
};

/** BrowserChrome's address-pill geometry (window-local), mirrored from props/BrowserChrome.tsx for a window with a ring. */
export function pillGeom(w: number, h: number) {
  const bar = Math.min(30, h * 0.27);
  const dr = bar * 0.25;
  const sp = bar * 0.63;
  const d0 = bar * 0.47;
  const px = d0 + 2 * sp + dr + bar * 0.38;
  const ringR = bar * 0.33;
  const pw = Math.max(bar, w - px - (ringR * 2 + bar * 0.5));
  const ph = bar * 0.6;
  const py = (bar - ph) / 2;
  return {bar, px, py, pw, ph, ringR, ringX: px + pw + bar * 0.25 + ringR, ringY: bar / 2};
}

/** The page's readout row (screen-local, world px; fix round 3): ONE fat progress bar (116 x 20.5 world = ~193 x 34 px on
 *  screen at 1.66) with a big white % flip tile at its RIGHT end (57 x 37 world = ~95 x 61 px, lettering 31 world = ~51 px);
 *  'updating...' moved up into the address pill (it replaced the pill's own progress stub: one bar in the window, not
 *  two). The row sits above the L14 notice (its paper starts at local y 46). `barsY`: the content bars (under the
 *  notice once it is up). */
export const PAGE = {bx: 22, by: 10.5, bh: 20.5, bw: 116, tile: {x: 144, y: 2, w: 57, h: 37}, tfs: 31, barsY: [58, 76, 94]} as const;

const stepAt = (steps: ProgressStep[], t: number) => {
  let v = steps[0]?.v ?? 0;
  for (const st of steps) if (t >= st.t) v = st.v;
  return v;
};

const Page: React.FC<{w: number; h: number; steps: ProgressStep[]; reloadAt: number[]; shakeAt?: number; barsAt: number[]; barsX0?: number; flickerAt?: number; inkW: number; seed: string}> = ({w, steps, reloadAt, shakeAt, barsAt, barsX0, flickerAt, inkW, seed}) => {
  useCaptionFont();
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  // the latest reload that has started: the content bars are gone (reloading); the fill and the % hold
  let ra: number | undefined;
  for (const r of reloadAt) if (t >= r) ra = r;
  const dx = shakeAt !== undefined && t >= shakeAt && t < shakeAt + 0.24 ? Math.sin(prog(t, shakeAt, 0.24) * Math.PI * 3) * 5 * (1 - prog(t, shakeAt, 0.24)) : 0;
  const {bx, by, bh, bw} = PAGE;
  // ---- the value: steps, an up-step's jump past its value
  let v = stepAt(steps, t);
  let flash = false;
  // a DOWN step (the regression on 'yet'): the fill SLIVER and the trough's outline flash peach for 2 frames as the
  // fill snaps back and the bar row jolts (-6 / +6 px on the 2 frames), the sound-off cue of "can't update yet" with the
  // ring's '!' badge and the tile's flip (A1 polish: the whole trough flashing peach read as a full bar = done)
  let regress = false;
  let jolt = 0;
  for (let i = 1; i < steps.length; i++) {
    const st = steps[i];
    const d = t - st.t;
    if (d >= 0 && d < 2 / 30 && steps[i].v < steps[i - 1].v) {
      regress = true;
      jolt = (d < 1 / 30 ? -6 : 6) / k;
    }
    if (d < 0 || steps[i].v <= steps[i - 1].v) continue;
    // the jump: 8 -> ~14 % in 0.1 s, then it sags back to the step's value (a stall you can see at phone size)
    if (d < 0.1) v += 0.05 * Math.sin((d / 0.1) * (Math.PI / 2));
    else if (d < 0.45) v += 0.05 * Math.cos(((d - 0.1) / 0.35) * (Math.PI / 2)) ** 2;
    if (d < 2 / 30) flash = true;
  }
  // 'FBI': ONLY the fill's leading edge flickers (its last 5 world = ~8 px drop out every other 2 frames) without the
  // fill moving; the % tile stays drawn (fix round 3: a tile blinking out read as a render glitch) and ticks once
  const flickOff = flickerAt !== undefined && t >= flickerAt && t < flickerAt + 0.27 && Math.floor((t - flickerAt) * 15) % 2 === 0;
  const tick = flickerAt !== undefined && t >= flickerAt && t < flickerAt + 1 / 30 ? -7 : 0;
  // ---- the % tile: a paper flip (old digits fold shut, new ones unfold) at each change of the shown number
  const shown = (tt: number) => Math.round(stepAt(steps, tt) * 100);
  let pct = shown(t);
  let flipY = 1;
  // an UP step scale-pops the tile 1.2x about its centre (with the flip): the 8 -> 9 % reads on a phone
  let tilePop = 1;
  for (let i = 1; i < steps.length; i++) {
    const d = t - steps[i].t;
    if (d < 0 || d >= 0.45 || steps[i].v <= steps[i - 1].v) continue;
    tilePop = 1 + 0.2 * (d < 0.06 ? Math.sin((d / 0.06) * (Math.PI / 2)) : Math.exp(-(d - 0.06) * 9) * Math.cos((d - 0.06) * Math.PI * 2 * 1.6));
  }
  for (let i = 1; i < steps.length; i++) {
    const d = t - steps[i].t;
    if (d < 0 || d >= 0.16 || shown(steps[i].t) === shown(steps[i].t - 1e-3)) continue;
    if (d < 0.08) {
      pct = shown(steps[i].t - 1e-3);
      flipY = 1 - d / 0.08;
    } else flipY = (d - 0.08) / 0.08;
  }
  const iw = inkW;
  const T = PAGE.tile;
  const tcx = T.x + T.w / 2;
  const tcy = T.y + T.h / 2;
  const tileM = mat.compose(mat.about(mat.rotate(tick), tcx, tcy), flipY !== 1 || tilePop !== 1 ? mat.about(mat.scale(tilePop, tilePop * Math.max(0.04, flipY)), tcx, tcy) : mat.I);
  // content bars (the page still loading): each draws on L -> R at its time; a reload hides them again
  const bars: React.ReactNode[] = [];
  [0.84, 0.62, 0.74].forEach((f, i) => {
    const at = barsAt[i];
    if (at === undefined || t < at || (ra !== undefined && ra > at)) return;
    const q = 0.2 + 0.8 * prog(t, at, 0.067, E.outCubic);
    const yy = PAGE.barsY[i];
    const x0 = barsX0 ?? bx;
    const cw = (w - 10 - x0) * f;
    bars.push(
      <XG key={i} m={mat.about(mat.scale(q), x0 + cw / 2, yy)}>
        <Fill d={rectPath(x0, yy - 5.5, cw, 11)} color={i === 1 ? palette.sage : palette.tan} offset={false} mode="none" seed={`${seed}/bar${i}`} />
      </XG>,
    );
  });
  const fillW = (bw - 5) * Math.min(1, v);
  const fillShown = flickOff ? Math.max(0, fillW - 5) : fillW;
  return (
    <XG m={mat.translate(dx, 0)}>
      {bars}
      <SiteHeader seed={seed} />
      <XG m={jolt ? mat.translate(jolt, 0) : mat.I}>
      {/* the fat bar: white trough, teal fill (cream for two frames on an up-step; on 'yet' the sliver + outline peach) */}
      <Fill d={roundRect(bx, by, bw, bh, 5)} color={palette.white} offset={false} mode="none" seed={`${seed}/trough`} />
      {fillShown > 0.3 ? <Fill d={rectPath(bx + 2.5, by + 2.5, fillShown, bh - 5)} color={regress ? palette.peach : flash ? palette.cream : palette.teal} offset={false} mode="none" seed={`${seed}/fill`} /> : null}
      {regress ? <path d={roundRect(bx - 1.2, by - 1.2, bw + 2.4, bh + 2.4, 6)} fill="none" stroke={palette.peach} strokeWidth={iw * 1.6} strokeLinejoin="round" /> : null}
      <Ink d={roundRect(bx, by, bw, bh, 5, {closed: false, seed: `${seed}/troughi`})} width={iw * 0.85} taper={false} vary={0} seed={`${seed}/troughi`} />
      {/* the % flip tile, right of the bar */}
      <XG m={tileM}>
        <Fill d={roundRect(T.x, T.y, T.w, T.h, 4)} color={palette.white} offset={[1.6 / k, 1.2 / k]} mode="none" seed={`${seed}/tile`} />
        <Ink d={roundRect(T.x, T.y, T.w, T.h, 4, {closed: false, seed: `${seed}/tilei`})} width={iw * 0.8} taper={false} vary={0} seed={`${seed}/tilei`} />
        <text x={tcx} y={T.y + T.h / 2 + PAGE.tfs * 0.36} fontFamily={captionFontStack} fontSize={PAGE.tfs} fill={palette.ink} textAnchor="middle">
          {`${pct}%`}
        </text>
      </XG>
      </XG>
    </XG>
  );
};

/** The page's header from frame 0 (A1 polish: the page under the bar was blank white until the first content bar at
 *  0.30 s, and nothing marked the site as a GOVERNMENT one): a small ink crest (a domed capitol: dome + lantern tick,
 *  entablature, three columns, plinth; ~18 world = ~30 px on screen) in the gap LEFT of the progress trough (local
 *  x 2-20, clear of Pip's ear, which covers local x < 12 only below y ~43), and one short tealDark title bar under the
 *  bar row (local x 34-108, y 44.5-50: the notice covers it from 0.96 s). Page-local, world px. */
const SiteHeader: React.FC<{seed: string}> = ({seed}) => {
  const k = Math.max(1e-4, matScale(useXf()));
  const w = 2 / k; // ~2 px ink
  const cx = 11;
  const dome = `M${cx - 5.6} 18.6A5.6 6.4 0 0 1 ${cx + 5.6} 18.6Z`;
  const ink = `M${cx} 12.4L${cx} 9.2M${cx - 7} 19.6L${cx + 7} 19.6M${cx - 4.6} 20.4L${cx - 4.6} 26.4M${cx} 20.4L${cx} 26.4M${cx + 4.6} 20.4L${cx + 4.6} 26.4M${cx - 8} 27.6L${cx + 8} 27.6`;
  return (
    <>
      <Fill d={dome} color={palette.teal} offset={false} mode="none" seed={`${seed}/crestF`} />
      <path d={dome} fill="none" stroke={palette.ink} strokeWidth={w} strokeLinejoin="round" />
      <path d={ink} fill="none" stroke={palette.ink} strokeWidth={w} strokeLinecap="round" />
      <Fill d={rectPath(34, 44.5, 74, 5.5)} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/title`} />
    </>
  );
};

/** 'updating...' lettered INSIDE the address pill (fix round 3: it replaces BrowserChrome's progress stub there), the
 *  dots cycling every 0.3 s, re-lettering u, up, upd ... after a reload (0.25 s, no blank frames). Window-local. */
const PillText: React.FC<{w: number; h: number; reloadAt: number[]; shakeAt?: number}> = ({w, h, reloadAt, shakeAt}) => {
  useCaptionFont();
  const t = useTime();
  const g = pillGeom(w, h);
  let ra: number | undefined;
  for (const r of reloadAt) if (t >= r) ra = r;
  const dots = '.'.repeat(1 + (Math.floor(t / 0.3) % 3));
  const word = 'updating' + dots;
  const nTxt = ra !== undefined && t < ra + 0.25 ? 1 + Math.floor(prog(t, ra, 0.25) * (word.length - 1)) : word.length;
  const fs = g.ph * 0.82;
  const dx = shakeAt !== undefined && t >= shakeAt && t < shakeAt + 0.24 ? Math.sin(prog(t, shakeAt, 0.24) * Math.PI * 3) * 2.5 * (1 - prog(t, shakeAt, 0.24)) : 0;
  return (
    <text x={g.px + g.ph * 0.5 + dx} y={g.py + g.ph * 0.5 + fs * 0.34} fontFamily={captionFontStack} fontSize={fs} fill={palette.ink}>
      {word.slice(0, nTxt)}
    </text>
  );
};

/** The loader's '!' badge: a peach disc with an ink rim and a lettered '!' that springs in at `at` (scale 0 -> 1.18 -> 1
 *  over 0.2 s, about its centre) and holds. */
export const AlertBadge: React.FC<{x: number; y: number; r: number; at: number; inkW: number; seed: string}> = ({x, y, r, at, inkW, seed}) => {
  useCaptionFont();
  const t = useTime();
  if (t < at) return null;
  const d = t - at;
  const s = d < 0.08 ? 0.35 + 0.83 * E.outCubic(d / 0.08) : 1 + 0.18 * Math.exp(-(d - 0.08) * 14) * Math.cos((d - 0.08) * Math.PI * 2 * 3);
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(s))}>
      <Fill d={blob(0, 0, r, r, {seed: `${seed}/d`})} color={palette.peach} offset={false} mode="none" seed={`${seed}/f`} />
      <Ink d={circle(0, 0, r, {seed: `${seed}/i`})} width={inkW} taper={false} vary={0} seed={`${seed}/i`} />
      <text x={0} y={r * 0.58} fontFamily={captionFontStack} fontSize={r * 1.75} fill={palette.ink} textAnchor="middle">
        !
      </text>
    </XG>
  );
};

export const GovBWindow: React.FC<GovBWindowProps> = ({r, steps, hiccups, reloadAt = [], shakeAt, barsAt = [], barsX0, flickerAt, ringR, alertAt, inkW, children, seed = 's11/govB'}) => {
  const [x, y, w, h] = r;
  const g = pillGeom(w, h);
  const rr = ringR ?? g.ringR;
  return (
    <>
      <BrowserChrome
        x={x}
        y={y}
        w={w}
        h={h}
        ink={inkW}
        ring={{at: 1e6}}
        content={({w: sw, h: sh}) => <Page w={sw} h={sh} steps={steps} reloadAt={reloadAt} shakeAt={shakeAt} barsAt={barsAt} barsX0={barsX0} flickerAt={flickerAt} inkW={inkW} seed={seed} />}
        seed={seed}
      >
        {null}
      </BrowserChrome>
      <XG m={mat.translate(x, y)}>
        <PillText w={w} h={h} reloadAt={reloadAt} shakeAt={shakeAt} />
      </XG>
      <HiccupRing x={x + w - rr * 1.3 - 1.5} y={y + g.ringY} r={rr} hiccups={hiccups} fastAt={reloadAt} inkW={inkW * 0.5} />
      {/* fix round 2: the badge 1.3x (it reads at phone size on 'yet') */}
      {alertAt !== undefined ? <AlertBadge x={x + w - rr * 1.3 - 1.5} y={y + g.ringY} r={rr * 1.27} at={alertAt} inkW={inkW * 0.7} seed={`${seed}/alert`} /> : null}
      {children}
    </>
  );
};

// ---------------------------------------------------------------- the CRT power-off screen (govA / govC windows)

/** The set's CRT overlay (GovernmentPlaza crtContent), for windows S11 draws itself through `windowSlot`: tealDark glass
 *  with the bright band (u < line: the lit screen squashing to a line), the line (shrinking to a dot), the dot. Opaque
 *  stepped glow (cream halo, white core): no fades. */
export const crtContent = (u: number, seed: string, coreColor: string = palette.white, haloColor: string = palette.cream) => ({w, h}: {w: number; h: number}) => {
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
    const rr = lh * 1.1 * (1 - (u - CRT.dot) / (1 - CRT.dot));
    if (rr > 0.4) {
      core = `M${cx - rr} ${cy}a${rr} ${rr} 0 1 0 ${2 * rr} 0a${rr} ${rr} 0 1 0 ${-2 * rr} 0Z`;
      const R = rr * 2;
      halo = `M${cx - R} ${cy}a${R} ${R} 0 1 0 ${2 * R} 0a${R} ${R} 0 1 0 ${-2 * R} 0Z`;
    }
  }
  return (
    <>
      <Fill d={rectPath(-1, -1, w + 5, h + 5)} color={palette.tealDark} offset={false} mode="none" seed={`${seed}/crtg`} />
      {halo ? <Fill d={halo} color={haloColor} offset={false} mode="none" seed={`${seed}/crth`} /> : null}
      {core ? <Fill d={core} color={coreColor} offset={false} mode="none" seed={`${seed}/crtc`} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- plain panes (govC / govD at the right edge)

/** A plain window pane for the edge buildings (govC / govD are cut by the right edge in the close-up: their browser
 *  chrome read as stray dots and bars there). Fix round 1: GLASS, not a blank cream card: mintPale glass, a thin mullion
 *  cross and two white diagonal glints (reference 1's noticeboard glass) inside an ink frame; `crt` (0..1, the set's CRT
 *  phase) plays the power-off (tealDark glass, the bright band -> line -> dot) and then holds the dark screen (one glint
 *  stays on the dark glass). */
export const PlainPane: React.FC<{r: [number, number, number, number]; inkW: number; crt?: number; seed: string}> = ({r, inkW, crt = 0, seed}) => {
  const [x, y, w, h] = r;
  const dark = crt >= 0.999;
  // at the frame edge: the first visible frame is an already-squashed band, cream core / peach halo (no white block)
  const cu = Math.max(crt, CRT.line * 0.85);
  const k = Math.max(1e-4, matScale(useXf()));
  const mx = x + w * 0.5;
  const my = y + h * 0.46;
  const mull = `M${mx.toFixed(1)} ${y}L${(mx + 0.6).toFixed(1)} ${y + h}M${x} ${my.toFixed(1)}L${x + w} ${(my - 0.8).toFixed(1)}`;
  // two short parallel glints in the upper-left light of the pane (white, ~3 px on screen), one in the lower-right
  const gl = (gx: number, gy: number, L: number) => `M${gx.toFixed(1)} ${(gy + L).toFixed(1)}L${(gx + L * 0.8).toFixed(1)} ${gy.toFixed(1)}`;
  const glints = gl(x + w * 0.12, y + h * 0.1, h * 0.22) + gl(x + w * 0.2, y + h * 0.12, h * 0.13) + gl(x + w * 0.62, y + h * 0.58, h * 0.16);
  return (
    <>
      <Fill d={rectPath(x, y, w, h)} color={dark ? palette.tealDark : palette.mintPale} offset={false} mode="none" seed={`${seed}/pane`} />
      {crt > 0.001 && !dark ? <XG m={mat.translate(x, y)}>{crtContent(cu, `${seed}/crt`, palette.cream, palette.peach)({w, h})}</XG> : null}
      {crt <= 0.001 ? <path d={glints} fill="none" stroke={palette.white} strokeWidth={3.2 / k} strokeLinecap="round" /> : null}
      {dark ? <path d={gl(x + w * 0.12, y + h * 0.1, h * 0.2)} fill="none" stroke={palette.sage} strokeWidth={2.6 / k} strokeLinecap="round" /> : null}
      <Ink d={mull} width={inkW * 0.55} taper={false} vary={0.05} seed={`${seed}/mull`} />
      <Ink d={rectPath(x, y, w, h)} width={inkW} taper={false} vary={0} seed={`${seed}/frame`} />
    </>
  );
};
