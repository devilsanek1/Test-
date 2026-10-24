// S11 local actors: the cornice / shutter-box pigeons (small ink birds), the sill snail (with its one-antenna-then-the-other
// gag), govB's window (BrowserChrome + the page: a FAT lettered progress bar 'updating... 8%' that can't finish, a
// hiccuping loading ring in the chrome bar, content bars that keep reloading), and the CRT power-off screen used for the
// govA / govC windows (the set's crtContent, which a windowSlot override bypasses).
// All world coordinates (GovernmentPlaza, S01 camera rest); times in scene seconds.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, circle, rectPath, roundRect, smooth, Pt} from '../../lib/sketch';
import {mat, useXf, XG} from '../../lib/xf';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';
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
  /** Flies off (kit Bird flight). */
  flyAt?: number;
  flyTo?: Pt;
  color?: string;
  seed?: string;
};

const wings = (t: number, ph: number) => {
  const flap = osc(t, 7, ph) * 9;
  return `M-16 ${(-6 - flap).toFixed(1)}Q-8 -2 0 0Q8 -2 16 ${(-6 - flap).toFixed(1)}`;
};

/** A small ink pigeon (the reference's birds: a cream body with a tan wing, an ink DOT eye, a tan beak; no white, no
 *  orange, no cartoon eye). The kit Bird's body plan and flight (wing strokes only), drawn at the parent's ink. */
const InkBird: React.FC<{s: number; seed: string; flyAt?: number; flyTo: Pt; color?: string}> = ({s, seed, flyAt, flyTo, color = palette.cream}) => {
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  const iw = 2.4 / k;
  const ph = rand(seed, 'ph') * 6.28;
  const fly = flyAt !== undefined ? prog(t, flyAt, 1.6, E.inQuad) : 0;
  if (fly >= 1) return null;
  if (fly > 0) {
    const fx = flyTo[0] * fly;
    const fy = flyTo[1] * fly - Math.sin(fly * Math.PI) * 40;
    return (
      <XG m={mat.compose(mat.translate(fx, fy - 12 * s), mat.scale(s * (1 - fly * 0.4)))}>
        <path d={wings(t, ph)} fill="none" stroke={palette.ink} strokeWidth={iw / (s * (1 - fly * 0.4))} strokeLinecap="round" strokeLinejoin="round" />
      </XG>
    );
  }
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

export const Pigeon: React.FC<PigeonProps> = ({x, y, s = 0.7, flip = false, land, shuffle = [], preenAt, hopAt = [], hopH = 14, flyAt, flyTo = [-260, -320], color = palette.cream, seed = 'pg'}) => {
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  const ph = rand(seed, 'ph') * 6.28;
  // ---- arriving
  if (land) {
    const dur = land.dur ?? 0.5;
    if (t < land.at - dur) return null;
    if (t < land.at) {
      const q = prog(t, land.at - dur, dur, E.outQuad);
      const px = lerp(land.from[0], x, q);
      const py = lerp(land.from[1], y, q) - Math.sin(q * Math.PI) * 30;
      return (
        <XG m={mat.compose(mat.translate(px, py - 12 * s), mat.scale(s * (0.75 + 0.25 * q)))}>
          <path d={wings(t, ph)} fill="none" stroke={palette.ink} strokeWidth={2.6 / (k * s)} strokeLinecap="round" strokeLinejoin="round" />
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
  let flap = false;
  for (const h of hopAt) if (t >= h && t < h + 0.3) {
    dy -= Math.sin(prog(t, h, 0.3) * Math.PI) * hopH;
    flap = true;
  }
  for (const sh of shuffle) if (t >= sh.at && t < sh.at + 0.2) flap = true;
  // landing squash
  let sq = 1;
  if (land && t < land.at + 0.16) sq = 1 - 0.18 * Math.sin(prog(t, land.at, 0.16) * Math.PI);
  // preen: the whole bird dips forward and twists (a head-into-wing peck), twice
  let rot = 0;
  if (preenAt !== undefined && t >= preenAt && t < preenAt + 0.5) rot = 22 * Math.abs(Math.sin(prog(t, preenAt, 0.5) * Math.PI * 2));
  return (
    <XG m={mat.compose(mat.translate(x + dx, y + dy), mat.scale(face ? -1 : 1, sq), mat.rotate(rot))}>
      <InkBird s={s} seed={seed} flyAt={flyAt} flyTo={face ? [-flyTo[0], flyTo[1]] : flyTo} color={color} />
      {flap && (flyAt === undefined || t < flyAt) ? (
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
  /** Pulls into its shell (0.2 s, at the clunk). */
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
  const dist = t >= crawlAt ? (Math.min(t, crawlEnd) - crawlAt) * speed : 0;
  const moving = t >= crawlAt && t < crawlEnd;
  // body extension 0 (tucked) .. 1 (out)
  let out = 0;
  if (t >= crawlAt) out = prog(t, crawlAt, 0.25, E.outCubic);
  if (hideAt !== undefined && t >= hideAt) out = Math.min(out, 1 - prog(t, hideAt, 0.16, E.inCubic));
  if (peekAt !== undefined && t >= peekAt) out = Math.max(out, 0.55 * prog(t, peekAt, 0.25, E.outBack(1.4)));
  // eye stalks: full while out; after hiding, one then the other pokes out of the shell mouth
  let st1 = out > 0.6 ? 1 : 0;
  let st2 = st1;
  if (antennaeAt !== undefined && t >= antennaeAt) {
    st1 = Math.max(st1, prog(t, antennaeAt, 0.14, E.outBack(1.6)));
    st2 = Math.max(st2, prog(t, antennaeAt + 0.2, 0.14, E.outBack(1.6)));
  }
  const pop = springAt(t, shellAt, springs.pop);
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
    <XG m={mat.compose(mat.translate(x + dirX * dist, y), mat.scale(dirX * s * pop, s * pop))}>
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
export const HiccupRing: React.FC<{x: number; y: number; r: number; hiccups: number[]; inkW: number; spin?: number}> = ({x, y, r, hiccups, inkW, spin = 1.2}) => {
  const t = useTime();
  let ang = t * spin * 360;
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
  /** Progress steps (fraction): the address pill AND the page's fat bar + its flip-tile % readout. An UP step springs
   *  past its value (+2.5 %) and flashes the fill cream for 2 frames; a down step snaps. */
  steps: ProgressStep[];
  /** Ring hiccups. */
  hiccups: number[];
  /** The page tries to reload: the readout row and the bar blank for 2 frames, the lettering pops back, the fill regrows. */
  reloadAt?: number[];
  /** The page shakes 'no' (0.24 s, 5 world px decaying: the bar row shakes with it). */
  shakeAt?: number;
  /** The page's three content bars draw on (it is still loading). */
  barsAt?: number[];
  /** The fill (and the % tile) flickers on / off every 2 frames for 0.27 s without moving. */
  flickerAt?: number;
  /** Loading-ring radius (world; the chrome's own is ~10). */
  ringR?: number;
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

/** The page's readout layout (screen-local): lettering row, then the fat bar (180 x 15 world = ~290 x 25 px on screen). */
export const PAGE = {fs: 20, ty: 23, by: 30, bh: 15, bw: 180, barsY: [58, 76, 94]} as const;

const stepAt = (steps: ProgressStep[], t: number) => {
  let v = steps[0]?.v ?? 0;
  for (const st of steps) if (t >= st.t) v = st.v;
  return v;
};

const Page: React.FC<{w: number; h: number; steps: ProgressStep[]; reloadAt: number[]; shakeAt?: number; barsAt: number[]; flickerAt?: number; inkW: number; seed: string}> = ({w, h, steps, reloadAt, shakeAt, barsAt, flickerAt, inkW, seed}) => {
  useCaptionFont();
  const t = useTime();
  const k = Math.max(1e-4, matScale(useXf()));
  // the latest reload that has started: the readout blanks for two frames and rebuilds
  let ra: number | undefined;
  for (const r of reloadAt) if (t >= r) ra = r;
  const blank = ra !== undefined && t < ra + 2 / 30;
  const dx = shakeAt !== undefined && t >= shakeAt && t < shakeAt + 0.24 ? Math.sin(prog(t, shakeAt, 0.24) * Math.PI * 3) * 5 * (1 - prog(t, shakeAt, 0.24)) : 0;
  const bx = (w - PAGE.bw) / 2;
  // ---- the value: steps, an up-step's spring past its value, the reload regrow
  let v = stepAt(steps, t);
  let flash = false;
  for (let i = 1; i < steps.length; i++) {
    const st = steps[i];
    const d = t - st.t;
    if (d < 0 || steps[i].v <= steps[i - 1].v) continue;
    if (d < 0.1) v += 0.025 * Math.sin((d / 0.1) * (Math.PI / 2));
    else if (d < 0.35) v += 0.025 * Math.cos(((d - 0.1) / 0.25) * (Math.PI / 2)) ** 2;
    if (d < 2 / 30) flash = true;
  }
  if (ra !== undefined && t >= ra + 2 / 30) v *= 0.15 + 0.85 * prog(t, ra + 2 / 30, 0.15, E.outCubic);
  const flickOff = flickerAt !== undefined && t >= flickerAt && t < flickerAt + 0.27 && Math.floor((t - flickerAt) * 15) % 2 === 0;
  // ---- the % tile: a paper flip (old digits fold shut, new ones unfold) at each change of the shown number
  const shown = (tt: number) => Math.round(stepAt(steps, tt) * 100);
  let pct = shown(t);
  let flipY = 1;
  for (let i = 1; i < steps.length; i++) {
    const d = t - steps[i].t;
    if (d < 0 || d >= 0.16 || shown(steps[i].t) === shown(steps[i].t - 1e-3)) continue;
    if (d < 0.08) {
      pct = shown(steps[i].t - 1e-3);
      flipY = 1 - d / 0.08;
    } else flipY = (d - 0.08) / 0.08;
  }
  const iw = inkW;
  const tileW = 34;
  const tileH = 24;
  const tileX = bx + PAGE.bw - tileW;
  const tileY = PAGE.ty - 19;
  const dots = '.'.repeat(1 + (Math.floor(t / 0.3) % 3));
  const txtK = ra !== undefined && t >= ra + 2 / 30 ? 0.25 + 0.75 * springAt(t, ra + 2 / 30, springs.pop) : 1;
  // content bars (the page still loading): each draws on L -> R at its time; a reload hides them again
  const bars: React.ReactNode[] = [];
  [0.84, 0.62, 0.74].forEach((f, i) => {
    const at = barsAt[i];
    if (at === undefined || t < at || (ra !== undefined && ra > at)) return;
    const q = 0.2 + 0.8 * prog(t, at, 0.067, E.outCubic);
    const yy = PAGE.barsY[i];
    const bw = (w - bx * 2) * f;
    bars.push(
      <XG key={i} m={mat.about(mat.scale(q), bx + bw / 2, yy)}>
        <Fill d={rectPath(bx, yy - 5.5, bw, 11)} color={i === 1 ? palette.sage : palette.tan} offset={false} mode="none" seed={`${seed}/bar${i}`} />
      </XG>,
    );
  });
  if (blank) return <>{bars}</>;
  return (
    <XG m={mat.translate(dx, 0)}>
      {/* 'updating...' */}
      <XG m={txtK !== 1 ? mat.about(mat.scale(txtK), bx, PAGE.ty - 7) : mat.I}>
        <text x={bx} y={PAGE.ty} fontFamily={captionFontStack} fontSize={PAGE.fs} fill={palette.ink}>
          {'updating' + dots}
        </text>
      </XG>
      {/* the % flip tile */}
      {!flickOff ? (
        <XG m={flipY !== 1 ? mat.about(mat.scale(1, Math.max(0.04, flipY)), tileX + tileW / 2, tileY + tileH / 2) : mat.I}>
          <Fill d={roundRect(tileX, tileY, tileW, tileH, 3)} color={palette.white} offset={[1.6 / k, 1.2 / k]} mode="none" seed={`${seed}/tile`} />
          <Ink d={roundRect(tileX, tileY, tileW, tileH, 3, {closed: false, seed: `${seed}/tilei`})} width={iw * 0.7} taper={false} vary={0} seed={`${seed}/tilei`} />
          <text x={tileX + tileW / 2} y={PAGE.ty} fontFamily={captionFontStack} fontSize={PAGE.fs} fill={palette.ink} textAnchor="middle">
            {`${pct}%`}
          </text>
        </XG>
      ) : null}
      {/* the fat bar: white trough, teal fill (cream for two frames on an up-step) */}
      <Fill d={roundRect(bx, PAGE.by, PAGE.bw, PAGE.bh, 4)} color={palette.white} offset={false} mode="none" seed={`${seed}/trough`} />
      {!flickOff && v > 0.002 ? <Fill d={rectPath(bx + 2.5, PAGE.by + 2.5, (PAGE.bw - 5) * Math.min(1, v), PAGE.bh - 5)} color={flash ? palette.cream : palette.teal} offset={false} mode="none" seed={`${seed}/fill`} /> : null}
      <Ink d={roundRect(bx, PAGE.by, PAGE.bw, PAGE.bh, 4, {closed: false, seed: `${seed}/troughi`})} width={iw * 0.8} taper={false} vary={0} seed={`${seed}/troughi`} />
      {bars}
    </XG>
  );
};

export const GovBWindow: React.FC<GovBWindowProps> = ({r, steps, hiccups, reloadAt = [], shakeAt, barsAt = [], flickerAt, ringR, inkW, children, seed = 's11/govB'}) => {
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
        progress={{steps}}
        ring={{at: 1e6}}
        content={({w: sw, h: sh}) => <Page w={sw} h={sh} steps={steps} reloadAt={reloadAt} shakeAt={shakeAt} barsAt={barsAt} flickerAt={flickerAt} inkW={inkW} seed={seed} />}
        seed={seed}
      >
        {null}
      </BrowserChrome>
      <HiccupRing x={x + w - rr * 1.3 - 1.5} y={y + g.ringY} r={rr} hiccups={hiccups} inkW={inkW * 0.5} />
      {children}
    </>
  );
};

// ---------------------------------------------------------------- the CRT power-off screen (govA / govC windows)

/** The set's CRT overlay (GovernmentPlaza crtContent), for windows S11 draws itself through `windowSlot`: tealDark glass
 *  with the bright band (u < line: the lit screen squashing to a line), the line (shrinking to a dot), the dot. Opaque
 *  stepped glow (cream halo, white core): no fades. */
export const crtContent = (u: number, seed: string) => ({w, h}: {w: number; h: number}) => {
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
      {halo ? <Fill d={halo} color={palette.cream} offset={false} mode="none" seed={`${seed}/crth`} /> : null}
      {core ? <Fill d={core} color={palette.white} offset={false} mode="none" seed={`${seed}/crtc`} /> : null}
    </>
  );
};
