// S11 local actors: the cornice / shutter-box pigeons, the sill snail (with its one-antenna-then-the-other gag), govB's
// window (BrowserChrome + a stalling progress bar + a hiccuping loading ring + the page that keeps trying to reload).
// All world coordinates (GovernmentPlaza, S01 camera rest); times in scene seconds.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../lib/time';
import {rand} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {Bird} from '../../lib/kit';
import {blob, circle, rectPath, smooth, Pt} from '../../lib/sketch';
import {mat, useXf, XG} from '../../lib/xf';
import {BrowserChrome, ProgressStep} from '../shared/props';
import {matScale} from '../shared/props/common';

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
  /** Little hops in place. */
  hopAt?: number[];
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

export const Pigeon: React.FC<PigeonProps> = ({x, y, s = 0.7, flip = false, land, shuffle = [], preenAt, hopAt = [], flyAt, flyTo = [-260, -320], color = palette.white, seed = 'pg'}) => {
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
  for (const h of hopAt) if (t >= h && t < h + 0.22) dy -= Math.sin(prog(t, h, 0.22) * Math.PI) * 9;
  // landing squash
  let sq = 1;
  if (land && t < land.at + 0.16) sq = 1 - 0.18 * Math.sin(prog(t, land.at, 0.16) * Math.PI);
  // preen: the whole bird dips forward and twists (a head-into-wing peck), twice
  let rot = 0;
  if (preenAt !== undefined && t >= preenAt && t < preenAt + 0.5) rot = 22 * Math.abs(Math.sin(prog(t, preenAt, 0.5) * Math.PI * 2));
  return (
    <XG m={mat.compose(mat.translate(x + dx, y + dy), mat.scale(face ? -1 : 1, sq), mat.rotate(rot))}>
      <Bird x={0} y={0} s={s} seed={seed} flyAt={flyAt} flyTo={face ? [-flyTo[0], flyTo[1]] : flyTo} color={color} />
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
  const a1 = stalk(st1, 2.5, -7.5);
  const a2 = stalk(st2, 5.5, -6);
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
      {eyes.length ? <path d={eyes.map((e) => blob(e[0], e[1], 1.35, 1.35, {seed: `${seed}/e${e[0].toFixed(0)}`})).join('')} fill={palette.ink} /> : null}
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
  /** Progress steps (fraction of the pill). */
  steps: ProgressStep[];
  /** Ring hiccups. */
  hiccups: number[];
  /** The page tries to reload: its content vanishes for one frame and re-wipes L -> R. */
  reloadAt?: number[];
  /** The page shakes 'no' (0.22 s). */
  shakeAt?: number;
  /** The page's three content bars draw on (it is still loading). */
  barsAt?: number[];
  /** The fill edge flickers (cream tick, 3 frames on / off) without moving. */
  flickerAt?: number;
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

const Page: React.FC<{w: number; h: number; reloadAt: number[]; shakeAt?: number; barsAt: number[]; seed: string}> = ({w, h, reloadAt, shakeAt, barsAt, seed}) => {
  const t = useTime();
  // the latest reload that has started: the page blanks for one frame and rebuilds (header wipe, button pop)
  let ra: number | undefined;
  for (const r of reloadAt) if (t >= r) ra = r;
  const blank = ra !== undefined && t < ra + 1 / 30;
  const dx = shakeAt !== undefined && t >= shakeAt && t < shakeAt + 0.24 ? Math.sin(prog(t, shakeAt, 0.24) * Math.PI * 3) * 5 * (1 - prog(t, shakeAt, 0.24)) : 0;
  if (blank) return null;
  const pad = Math.max(5, w * 0.07);
  const hh = h * 0.24;
  const wipe = ra !== undefined ? prog(t, ra + 1 / 30, 0.16, E.outCubic) : 1;
  const btnK = ra !== undefined ? springAt(t, ra + 0.2, springs.pop) : 1;
  // content bars (the page still loading): each draws on L -> R at its time; a reload hides them again
  const gy = (h - pad * 2 - hh) / 3.6;
  const bars: React.ReactNode[] = [];
  [0.84, 0.62, 0.74].forEach((f, i) => {
    const at = barsAt[i];
    if (at === undefined || t < at || (ra !== undefined && ra > at)) return;
    const q = prog(t, at, 0.14, E.outCubic);
    const yy = pad + hh + gy * (i + 0.75);
    bars.push(<Fill key={i} d={rectPath(pad, yy - 3, (w - pad * 2) * f * q, 6.5)} color={i === 1 ? palette.sage : palette.sand} offset={false} mode="none" seed={`${seed}/bar${i}`} />);
  });
  return (
    <XG m={mat.translate(dx, 0)}>
      <Fill d={rectPath(pad, pad, (w - pad * 2) * wipe, hh)} color={palette.peach} offset={false} mode="none" seed={`${seed}/hdr`} />
      {/* a sage 'update' button on the header's right end: the thing that cannot finish */}
      {wipe > 0.85 && btnK > 0.01 ? (
        <XG m={mat.about(mat.scale(btnK), w - pad - hh * 1.1, pad + hh * 0.5)}>
          <Fill d={rectPath(w - pad - hh * 1.9, pad + hh * 0.22, hh * 1.6, hh * 0.56)} color={palette.sage} offset={false} mode="none" seed={`${seed}/btn`} />
        </XG>
      ) : null}
      {bars}
    </XG>
  );
};

export const GovBWindow: React.FC<GovBWindowProps> = ({r, steps, hiccups, reloadAt = [], shakeAt, barsAt = [], flickerAt, inkW, children, seed = 's11/govB'}) => {
  const t = useTime();
  const [x, y, w, h] = r;
  const g = pillGeom(w, h);
  // flicker: a cream tick on the fill edge, on/off every 2 frames for 0.27 s
  let flick: React.ReactNode = null;
  if (flickerAt !== undefined && t >= flickerAt && t < flickerAt + 0.27 && Math.floor((t - flickerAt) * 15) % 2 === 0) {
    let v = 0;
    for (const st of steps) if (t >= st.t) v = st.v;
    const inset = g.ph * 0.18;
    const ex = x + g.px + inset + (g.pw - inset * 2) * v;
    flick = <path d={`M${(ex + 1.2).toFixed(1)} ${(y + g.py + inset - 1).toFixed(1)}V${(y + g.py + g.ph - inset + 1).toFixed(1)}`} stroke={palette.white} strokeWidth={2.4} />;
  }
  return (
    <>
      <BrowserChrome x={x} y={y} w={w} h={h} ink={inkW} progress={{steps}} ring={{at: 1e6}} content={({w: sw, h: sh}) => <Page w={sw} h={sh} reloadAt={reloadAt} shakeAt={shakeAt} barsAt={barsAt} seed={seed} />} seed={seed}>
        {null}
      </BrowserChrome>
      {flick}
      <HiccupRing x={x + g.ringX} y={y + g.ringY} r={g.ringR} hiccups={hiccups} inkW={inkW * 0.5} />
      {children}
    </>
  );
};
