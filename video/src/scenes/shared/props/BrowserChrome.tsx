// props/BrowserChrome.tsx — THE "building = website" cue (P4) + the progress bar and the loading / target ring (P6).
//
//   <BrowserChrome x={270} y={860} w={210} h={150} chromeAt={0.46} screenOnAt={0.9} offAt={3.04} />   // govB main window
//   <BrowserChrome x={340} y={866} w={110} h={30} mode="addressRail" railLightAt={32.1} />             // the board's top rail
//   <BrowserChrome ... progress={{at: 55.0, steps: [{t: 55.2, v: 0.04}, {t: 55.9, v: 0.08}]}} ring={{at: 54.9}} />
//   <BrowserChrome ... blinkAt={[10.2]} content={({w, h}) => <MyScreen w={w} h={h} />} />
//   <LoadingRing x={462} y={875} r={10} spin />    <TargetRing x={600} y={858} r={7} at={53.6} pulseAt={54.0} />
//   <ProgressBar x={340} y={866} w={110} h={18} steps={[...]} />
//
// "Chunky" chrome (storyboard): tealDark title bar 30 px, three 15 px dots (cream / sage / peach), an 18 px cream address
// pill, 3.4 ink frame. Screen: cream glow + a peach header block + 3 ink hairlines. Anchor (x, y) = TOP-LEFT of the
// window, w x h in world px (the bar is part of h). Before `screenOnAt` the screen is glass (sage by default); `offAt`
// pops it to tealDark (lights out); `state="off"` starts dark. LOD by on-screen width: < 18 px a flat bar + screen,
// < 70 px no hairlines / dot rings, full above (up to ~390 x 280 on screen: govB at zoom 1.85, house4 at zoom 6).

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade} from '../../../lib/exit';
import {circle, hline, line, rect, rectPath, roundRect} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {bt, Depth, DEPTH_INK, lodOf, PropBase, PropRoot, usePropFrame} from './common';

export type ProgressStep = {t: number; v: number};

export type BrowserChromeProps = PropBase & {
  w: number;
  h: number;
  /** Title bar height (world px). Default min(30, 0.27 h). In 'addressRail' mode the whole h is the bar. */
  bar?: number;
  mode?: 'window' | 'addressRail' | 'progress' | 'dots';
  /** Bar wipes on L->R, dots pop at 0.04 s stagger, pill draws over 0.2 s. Default: at + 0.12 (built if no at). */
  chromeAt?: number;
  /** Screen lights: cream glow pops, peach header wipes, hairlines draw. Omit = already lit (unless glass/off). */
  screenOnAt?: number;
  /** Screen pops to tealDark (lights out). */
  offAt?: number;
  /** Screen flashes white for 2 frames at each time. */
  blinkAt?: number | number[];
  /** 'built' (default) | 'glass' (screen not lit yet, no screenOnAt) | 'off' (dark screen from the start). */
  state?: 'built' | 'glass' | 'off';
  /** Unlit screen colour. Default sage glass. */
  glass?: string;
  /** Unlit chrome: no bar / dots / pill until chromeAt (a plain window first). Default true when chromeAt is given. */
  plainFirst?: boolean;
  /** addressRail: the pill and the dots light up (before: dim teal). */
  railLightAt?: number;
  /** The pill turns into a progress bar (sage segment stepping through steps). */
  progress?: {at?: number; steps: ProgressStep[]};
  /** A loading ring right of the pill. */
  ring?: {at?: number; spin?: boolean | number; pulseAt?: number};
  /** Screen content in SCREEN-LOCAL coords (0, 0 = screen top-left, below the bar). Replaces the default glow page. */
  content?: (area: {w: number; h: number}) => React.ReactNode;
  /** Extra content drawn over the default page. */
  children?: React.ReactNode;
};

export const BrowserChrome: React.FC<BrowserChromeProps> = (p) => {
  const t = useTime();
  const {x = 0, y = 0, w, h, mode = 'window', at, seed = 'bw', outAt, outDur} = p;
  const F = usePropFrame({scale: p.scale, depth: p.depth, ink: p.ink, at, dur: p.dur, baseDur: 0.6, seed, defDepth: 'mid'});
  const lod = mode === 'dots' ? 0 : lodOf(w * F.k, 18, 70);
  if (at !== undefined && t < at) return null;
  const rail = mode === 'addressRail';
  const bar = rail ? h : p.bar ?? Math.min(30, h * 0.27);
  const W = F.W;
  const chromeAt = p.chromeAt ?? bt(at, 0.12);
  const chromeOn = chromeAt === undefined || t >= chromeAt;
  const plainFirst = p.plainFirst ?? p.chromeAt !== undefined;
  const showChrome = chromeOn || !plainFirst;
  // screen state
  const screenOn = p.screenOnAt !== undefined ? t >= p.screenOnAt : p.state !== 'glass' && p.state !== 'off';
  const off = p.state === 'off' || (p.offAt !== undefined && t >= p.offAt);
  const blinks = p.blinkAt === undefined ? [] : Array.isArray(p.blinkAt) ? p.blinkAt : [p.blinkAt];
  const blink = blinks.some((b) => t >= b && t < b + 0.067);
  const sh = h - bar;
  const out: React.ReactNode[] = [];

  // ---- LOD 0: flat bar + screen (window dots from far away)
  if (lod === 0) {
    out.push(<Fill key="s" rect={[0, bar, w, sh]} color={off ? palette.tealDark : screenOn ? palette.cream : p.glass ?? palette.sage} at={at} mode="snap" offset={false} seed={`${seed}/s`} />);
    if (showChrome) out.push(<Fill key="b" rect={[0, 0, w, bar]} color={palette.tealDark} at={chromeAt} mode="snap" offset={false} seed={`${seed}/b`} />);
    return (
      <PropRoot x={x} y={y} s={F.s} outAt={outAt} outDur={outDur}>
        {out}
      </PropRoot>
    );
  }

  // ---- screen
  if (!rail) {
    const sc = off ? palette.tealDark : blink ? palette.white : screenOn ? palette.cream : p.glass ?? palette.sage;
    out.push(<Fill key="screen" rect={[0, bar, w, sh]} color={sc} at={bt(at, 0.1)} mode="wipe" dir="down" offset={F.off} seed={`${seed}/scr`} />);
    if (screenOn && !off && !blink) {
      const on = p.screenOnAt;
      if (p.content) {
        out.push(
          <XG key="content" m={mat.translate(0, bar)}>
            {p.content({w, h: sh})}
          </XG>,
        );
      } else {
        const pad = Math.max(5, w * 0.07);
        const hh = sh * 0.24;
        out.push(<Fill key="hdr" rect={[pad, bar + pad, w - pad * 2, hh]} color={palette.peach} at={bt(on, 0.04)} mode="wipe" dir="right" dur={0.1} offset={false} seed={`${seed}/hdr`} />);
        if (lod === 2) {
          const gy = (sh - pad * 2 - hh) / 4;
          let d = '';
          [0.86, 0.7, 0.5].forEach((f, i) => {
            const yy = bar + pad + hh + gy * (i + 1);
            d += hline(pad, pad + (w - pad * 2) * f, yy, {over: [0, 2], seed: `${seed}/hl${i}`});
          });
          out.push(<Ink key="hair" d={d} at={bt(on, 0.1)} width={DEPTH_INK.hair / F.s} seed={`${seed}/hair`} />);
        }
      }
      if (p.children) out.push(<g key="kids">{p.children}</g>);
    }
    if (off && lod === 2 && p.offAt !== undefined && t < p.offAt + 0.12) {
      // a one-frame collapse line as the screen dies (CRT), no fade
      out.push(<Ink key="crt" d={hline(w * 0.2, w * 0.8, bar + sh / 2, {over: [0, 0], seed: `${seed}/crt`})} width={W * 0.6} color={palette.cream} seed={`${seed}/crt`} />);
    }
  }

  // ---- chrome bar, dots, pill
  if (showChrome) {
    out.push(<Fill key="bar" rect={[0, 0, w, bar]} color={palette.tealDark} at={chromeAt} mode="wipe" dir="right" dur={0.12} offset={F.off} seed={`${seed}/bar`} />);
    const dr = bar * 0.25;
    const sp = bar * 0.63;
    const d0 = bar * 0.47;
    const railLit = !rail || p.railLightAt === undefined || t >= p.railLightAt;
    const dotCols = [palette.cream, palette.sage, palette.peach];
    for (let i = 0; i < 3; i++) {
      const cx = d0 + i * sp;
      const cy = bar / 2;
      const da = rail && p.railLightAt !== undefined ? p.railLightAt + i * 0.04 : bt(chromeAt, 0.08 + i * 0.04);
      const lit = railLit && (da === undefined || t >= da);
      const k = rail && p.railLightAt !== undefined ? (lit ? 1 + 0.3 * (1 - prog(t, da!, 0.1)) : 1) : da === undefined ? 1 : springAt(t, da, springs.pop);
      if (k <= 0.001) continue;
      out.push(
        <XG key={`dot${i}`} m={mat.about(mat.scale(k), cx, cy)}>
          <Fill d={roundRect(cx - dr, cy - dr, dr * 2, dr * 2, dr)} color={lit ? dotCols[i] : palette.teal} offset={false} seed={`${seed}/d${i}`} />
          {lod === 2 ? <Ink d={circle(cx, cy, dr, {seed: `${seed}/di${i}`, overlap: 8})} width={W * 0.5} taper={false} seed={`${seed}/di${i}`} /> : null}
        </XG>,
      );
    }
    // address pill
    const px = d0 + 2 * sp + dr + bar * 0.38;
    const ringR = bar * 0.33;
    const hasRing = !!p.ring;
    const pw = Math.max(bar, w - px - (hasRing ? ringR * 2 + bar * 0.5 : bar * 0.35));
    const ph = bar * 0.6;
    const py = (bar - ph) / 2;
    const pillAt = rail && p.railLightAt !== undefined ? p.railLightAt + 0.06 : bt(chromeAt, 0.1);
    const pillLit = !rail || p.railLightAt === undefined || t >= p.railLightAt + 0.06;
    out.push(<Fill key="pillDim" d={roundRect(px, py, pw, ph, ph / 2)} color={palette.teal} at={bt(chromeAt, 0.06)} mode="snap" offset={false} seed={`${seed}/pd`} />);
    if (pillLit) out.push(<Fill key="pill" d={roundRect(px, py, pw, ph, ph / 2)} color={palette.cream} at={pillAt} mode="wipe" dir="right" dur={0.2} offset={false} seed={`${seed}/pill`} />);
    if (lod === 2) out.push(<Ink key="pillI" d={roundRect(px, py, pw, ph, ph / 2, {closed: false, seed: `${seed}/pi`})} at={bt(chromeAt, 0.06)} dur={0.2} width={W * 0.55} seed={`${seed}/pi`} />);
    // progress segment
    if (p.progress && (mode === 'progress' || p.progress)) {
      const pa = p.progress.at;
      if (pa === undefined || t >= pa) {
        let v = 0;
        for (const st of p.progress.steps) {
          if (t < st.t) break;
          v = lerp(v, st.v, prog(t, st.t, 0.08, E.outCubic));
        }
        const inset = ph * 0.18;
        const segW = Math.max(0, (pw - inset * 2) * v);
        if (segW > 0.3) out.push(<Fill key="seg" d={rectPath(px + inset, py + inset, segW, ph - inset * 2)} color={palette.sage} offset={false} mode="none" seed={`${seed}/seg`} />);
        out.push(<Ink key="segI" d={rect(px, py, pw, ph, {seed: `${seed}/pf`, over: 2})} at={pa} dur={0.15} width={W * 0.6} seed={`${seed}/pf`} />);
      }
    }
    if (p.ring) {
      const rx = px + pw + bar * 0.25 + ringR;
      out.push(<LoadingRing key="ring" x={rx} y={bar / 2} r={ringR} at={p.ring.at} spin={p.ring.spin ?? true} pulseAt={p.ring.pulseAt} width={W * 0.5} seed={`${seed}/ring`} />);
    }
    out.push(<Ink key="barI" d={hline(0, w, bar, {seed: `${seed}/bl`, over: [2, 6]})} at={chromeAt} dur={0.12} width={W * 0.8} seed={`${seed}/bl`} />);
  }

  // ---- frame
  out.push(<Ink key="frame" d={rect(0, 0, w, h, {seed: `${seed}/fr`, over: rail ? 3 : 6})} at={at} dur={0.4} width={W} seed={`${seed}/fr`} />);

  return (
    <PropRoot x={x} y={y} s={F.s} rot={p.rot} outAt={outAt} outDur={outDur}>
      {out}
    </PropRoot>
  );
};

/** Screen rect of a BrowserChrome (world coords) for placing shutters / peepholes / content. */
export function chromeScreen(x: number, y: number, w: number, h: number, bar?: number): {x: number; y: number; w: number; h: number; bar: number} {
  const b = bar ?? Math.min(30, h * 0.27);
  return {x, y: y + b, w, h: h - b, bar: b};
}

// ---------------------------------------------------------------- LoadingRing / TargetRing

export type RingProps = {
  x: number;
  y: number;
  r?: number;
  at?: number;
  /** Spinner: true (1.2 rev/s) or rev/s. */
  spin?: boolean | number;
  /** +25 % pulse with an ink ring that expands (0.25 s). */
  pulseAt?: number | number[];
  /** Pop (7 % overshoot) at this time instead of at `at`. */
  popAt?: number;
  outAt?: number;
  /** Ink outline width (world px). */
  width?: number;
  depth?: Depth;
  seed?: Seed;
  color?: string;
};

/** Peach ring with an ink outline: the S11 loading ring and S10's "could be hit" target rings (same component). */
export const LoadingRing: React.FC<RingProps> = ({x, y, r = 10, at, spin, pulseAt, popAt, outAt, width, depth, seed = 'ring', color = palette.peach}) => {
  const t = useTime();
  const start = popAt ?? at;
  if (start !== undefined && t < start) return null;
  if (outAt !== undefined && t >= outAt + 0.12) return null;
  const pop = start !== undefined ? springAt(t, start, springs.pop) : 1;
  const outK = outAt !== undefined ? 1 - E.inCubic(prog(t, outAt, 0.12)) : 1;
  const pulses = pulseAt === undefined ? [] : Array.isArray(pulseAt) ? pulseAt : [pulseAt];
  let pk = 1;
  let ripple = 0;
  for (const pa of pulses) {
    if (t >= pa && t < pa + 0.3) {
      const q = (t - pa) / 0.3;
      pk *= 1 + 0.25 * Math.sin(Math.PI * Math.min(1, q * 1.5));
      ripple = q;
    }
  }
  const k = pop * outK * pk;
  if (k <= 0.001) return null;
  const iw = width ?? DEPTH_INK[depth ?? 'far'];
  const band = r * 0.46;
  const sp = spin === undefined || spin === false ? 0 : spin === true ? 1.2 : spin;
  const ang = sp ? (t * sp * 360) % 360 : 0;
  const a0 = ((ang - 90) * Math.PI) / 180;
  const a1 = ((ang - 10) * Math.PI) / 180;
  return (
    <ExitFade x={x} y={y}>
      <g transform={`translate(${x} ${y}) scale(${k.toFixed(4)})`}>
        <circle r={r} fill="none" stroke={color} strokeWidth={band} />
        <circle r={r + band / 2} fill="none" stroke={palette.ink} strokeWidth={iw} />
        {r > 6 ? <circle r={Math.max(0.5, r - band / 2)} fill="none" stroke={palette.ink} strokeWidth={iw * 0.7} /> : null}
        {sp ? <path d={`M${(Math.cos(a0) * r).toFixed(2)} ${(Math.sin(a0) * r).toFixed(2)}A${r} ${r} 0 0 1 ${(Math.cos(a1) * r).toFixed(2)} ${(Math.sin(a1) * r).toFixed(2)}`} fill="none" stroke={palette.ink} strokeWidth={band * 0.55} strokeLinecap="round" /> : null}
      </g>
      {ripple > 0 ? <circle cx={x} cy={y} r={(r + band) * (1 + ripple * 0.9)} fill="none" stroke={palette.ink} strokeWidth={iw * (1 - ripple)} /> : null}
    </ExitFade>
  );
};

/** Alias: S10's "could be hit" rings are the S11 loading ring (the push-through match object). */
export const TargetRing = LoadingRing;

// ---------------------------------------------------------------- ProgressBar (standalone)

/** A cream bar with a sage segment stepping through `steps` (the morphed address pill, ~200 x 33 px on screen).
 *  (x, y) = top-left; h = bar height. `at` draws the frame. */
export const ProgressBar: React.FC<{x: number; y: number; w: number; h: number; steps: ProgressStep[]; at?: number; width?: number; depth?: Depth; seed?: Seed}> = ({x, y, w, h, steps, at, width, depth, seed = 'pb'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  let v = 0;
  for (const st of steps) {
    if (t < st.t) break;
    v = lerp(v, st.v, prog(t, st.t, 0.08, E.outCubic));
  }
  const iw = width ?? DEPTH_INK[depth ?? 'far'];
  const inset = h * 0.18;
  return (
    <>
      <Fill d={roundRect(x, y, w, h, h / 2)} color={palette.cream} at={at} mode="wipe" dir="right" dur={0.2} offset={false} seed={`${seed}/b`} />
      {v > 0 ? <Fill d={rectPath(x + inset, y + inset, (w - inset * 2) * v, h - inset * 2)} color={palette.sage} offset={false} seed={`${seed}/s`} /> : null}
      <Ink d={rect(x, y, w, h, {seed: `${seed}/f`, over: 2})} at={at} dur={0.15} width={iw} seed={`${seed}/f`} />
      <Ink d={line(x + w * 0.02, y + h + 3, x + w * 0.3, y + h + 3, {over: [0, 0], seed: `${seed}/u`})} at={bt(at, 0.1)} width={iw * 0.5} seed={`${seed}/u`} />
    </>
  );
};
