// sets/propSlots.tsx — THE ONLY PLACE THE SETS IMPORT PROPS FROM.
//
// Each export is a slot named after the props-lane component it stands for (src/scenes/shared/props/**, built in
// parallel). While a prop is not ready, the slot draws a simple on-style PLACEHOLDER (marked `PLACEHOLDER`); when the
// prop lands, the slot body becomes a one-line adapter to it, and every set picks it up. Scenes can also replace any
// slot per set instance through the set's `slots` prop.
//
// Slot geometry conventions: (x, y) = centre unless the name says otherwise; sizes in the parent's units.

import React from 'react';
import {palette, stroke} from '../../../lib/theme';
import {ease as E, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {arc, blob, check, circle, ellipse, hline, line, polyPath, rect, rectPath, roundRect, smooth} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {Padlock, Noticeboard} from '../../../lib/kit';
import {rand, Seed} from '../../../lib/rng';
import {glintAt, popK, PopAt} from './common';

// ---------------------------------------------------------------- elephant emblem (P2 ElephantEmblem stand-in)

/** PLACEHOLDER for props ElephantEmblem: a generic side-on elephant with its trunk raised, as one ink path in a
 *  unit box (-0.5..0.5), scaled by `s`. Never periwinkle, never the PHP logo. */
export function elephantPath(cx: number, cy: number, s: number, old = false): string {
  const P = (x: number, y: number) => `${(cx + x * s).toFixed(1)} ${(cy + y * s).toFixed(1)}`;
  // body + head + raised trunk, two legs, ear, tail
  const body = `M${P(-0.34, 0.18)}C${P(-0.42, -0.05)} ${P(-0.28, -0.24)} ${P(-0.02, -0.22)}C${P(0.12, -0.3)} ${P(0.3, -0.26)} ${P(0.33, -0.1)}C${P(0.4, -0.18)} ${P(0.42, -0.36)} ${P(0.36, -0.44)}`;
  const under = `M${P(0.3, 0.02)}C${P(0.3, 0.12)} ${P(0.22, 0.2)} ${P(0.18, 0.22)}L${P(-0.3, 0.22)}`;
  const legs = `M${P(-0.24, 0.2)}L${P(-0.24, 0.36)}M${P(-0.12, 0.2)}L${P(-0.12, 0.36)}M${P(0.08, 0.2)}L${P(0.08, 0.36)}M${P(0.18, 0.2)}L${P(0.18, 0.36)}`;
  const ear = `M${P(0.12, -0.18)}C${P(0.02, -0.1)} ${P(0.04, 0.06)} ${P(0.16, 0.04)}`;
  const tail = `M${P(-0.36, 0.04)}C${P(-0.44, 0.08)} ${P(-0.46, 0.14)} ${P(-0.44, 0.18)}`;
  const eye = `M${P(0.24, -0.14)}l0.01 0`;
  const curl = old ? `M${P(0.36, -0.44)}C${P(0.3, -0.5)} ${P(0.26, -0.42)} ${P(0.32, -0.4)}` : '';
  return body + under + legs + ear + tail + eye + curl;
}

export const ElephantGlyph: React.FC<{x: number; y: number; s: number; width?: number; color?: string; at?: number; old?: boolean}> = ({x, y, s, width = stroke.inkThin, color = palette.ink, at, old}) => (
  <Ink d={elephantPath(x, y, s, old)} width={width} color={color} at={at} taper={false} vary={0} />
);

// ---------------------------------------------------------------- P4 BrowserChrome

export type ChromeSlotProps = {
  /** Window rect (top-left, size). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Chrome reveal (bar wipes on, dots pop 0.04 s apart, pill draws 0.2 s). Omit = already there. */
  chromeAt?: number;
  /** false = a plain window (no chrome yet / ever). */
  chrome?: boolean;
  /** Screen content (cream glow + peach header + 3 hairlines) pops on. Omit = on. */
  screenOnAt?: number;
  /** Screen goes dark (tealDark). */
  offAt?: number;
  /** Level of detail: 'full' | 'simple' (bar + dots + screen fill, no hairlines) | 'dots' (a lit rect + 3 dots). */
  lod?: 'full' | 'simple' | 'dots';
  /** Frame ink (on-screen px of the parent). */
  width?: number;
  seed?: Seed;
  /** Glass colour of the plain window state. */
  glass?: string;
};

/** PLACEHOLDER for props BrowserChrome (P4): the "chunky" chrome of a website window. */
export const ChromeSlot: React.FC<ChromeSlotProps> = ({x, y, w, h, chromeAt, chrome = true, screenOnAt, offAt, lod = 'full', width = stroke.ink, seed = 'chrome', glass = palette.sage}) => {
  const t = useTime();
  const bar = Math.max(3, Math.min(30, h * 0.21));
  const hasChrome = chrome && (chromeAt === undefined || t >= chromeAt);
  const screenOn = hasChrome && (screenOnAt === undefined || t >= screenOnAt);
  const dark = offAt !== undefined && t >= offAt;
  const sy = y + (hasChrome ? bar : 0);
  const sh = h - (hasChrome ? bar : 0);
  const out: React.ReactNode[] = [];
  // screen / glass
  const screenColor = dark ? palette.tealDark : screenOn ? palette.cream : hasChrome ? palette.mintPale : glass;
  out.push(<Fill key="scr" rect={[x, sy, w, sh]} color={screenColor} seed={`${seed}/s`} offset={hasChrome ? [1.5, 1] : undefined} />);
  if (!hasChrome && lod !== 'dots') out.push(<Ink key="gl" d={glintAt(x + w * 0.2, y + h * 0.7, Math.min(w, h) * 0.35, `${seed}/g`)} width={width * 0.5} taper={false} />);
  if (hasChrome) {
    const wipe = chromeAt === undefined ? 1 : prog(t, chromeAt, 0.12);
    out.push(<Fill key="bar" rect={[x, y, w * wipe, bar]} color={palette.tealDark} offset={false} seed={`${seed}/b`} />);
    const dr = Math.min(bar * 0.25, 7.5);
    if (lod !== 'dots' || bar > 5) {
      [palette.cream, palette.sage, palette.peach].forEach((c, i) => {
        const cx = x + bar * 0.5 + i * dr * 2.6;
        const k = popK(t, chromeAt === undefined ? undefined : chromeAt + 0.08 + i * 0.04, 0.25, 0.16);
        if (k > 0) out.push(<circle key={`d${i}`} cx={cx} cy={y + bar / 2} r={dr * k} fill={c} />);
      });
    }
    if (lod === 'full' && w > 60) {
      const px = x + bar * 0.5 + dr * 2.6 * 2 + dr * 2.4;
      const pw = Math.max(10, x + w - bar * 0.4 - px);
      const ph = Math.min(18, bar * 0.6);
      const pd = chromeAt === undefined ? 1 : prog(t, chromeAt + 0.1, 0.2);
      if (pd > 0) out.push(<Fill key="pill" d={roundRect(px, y + (bar - ph) / 2, pw * pd, ph, ph / 2)} color={palette.cream} offset={false} seed={`${seed}/p`} />);
    }
    if (screenOn && !dark && lod !== 'dots') {
      const hh = sh * 0.24;
      out.push(<Fill key="hdr" rect={[x + w * 0.08, sy + sh * 0.12, w * 0.84, hh]} color={palette.peach} offset={false} seed={`${seed}/h`} />);
      if (lod === 'full') {
        let d = '';
        for (let i = 0; i < 3; i++) d += hline(x + w * 0.1, x + w * (0.9 - (i === 2 ? 0.3 : i * 0.08)), sy + sh * (0.52 + i * 0.15), {seed: `${seed}/l${i}`, over: 0});
        out.push(<Ink key="ln" d={d} width={Math.max(0.6, width * 0.45)} taper={false} vary={0} />);
      }
    }
  }
  if (lod !== 'dots') out.push(<Ink key="fr" d={rect(x, y, w, h, {seed: `${seed}/f`, over: 'small'}) + (hasChrome ? hline(x, x + w, y + bar, {seed: `${seed}/bl`, over: 0}) : '')} width={width} taper={false} />);
  return <>{out}</>;
};

// ---------------------------------------------------------------- P1 Lock

export type LockVariant = 'closed' | 'open' | 'blueprint' | 'sketch' | 'ghost' | 'dot' | 'fixed';
export type LockSlotProps = {x: number; y: number; w: number; h: number; variant?: LockVariant; width?: number; seed?: Seed; at?: number};

/** PLACEHOLDER for props Lock (P1): sand box, two screws, keyhole; 'fixed' = sage with a cream tag; 'dot' = LOD. */
export const LockSlot: React.FC<LockSlotProps> = ({x, y, w, h, variant = 'closed', width = stroke.inkThin, seed = 'lock', at}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const x0 = x - w / 2;
  const y0 = y - h / 2;
  if (variant === 'dot') return <Fill rect={[x0, y0, w, h]} color={palette.sand} offset={false} seed={`${seed}/d`} />;
  const body = variant === 'fixed' ? palette.sage : variant === 'blueprint' || variant === 'sketch' ? palette.white : palette.sand;
  const out: React.ReactNode[] = [];
  if (variant !== 'ghost') out.push(<Fill key="b" d={roundRect(x0, y0, w, h, Math.min(w, h) * 0.12)} color={body} seed={`${seed}/b`} />);
  const kh = `M${(x - w * 0.07).toFixed(2)} ${(y + h * 0.12).toFixed(2)}L${(x + w * 0.07).toFixed(2)} ${(y + h * 0.12).toFixed(2)}L${x.toFixed(2)} ${(y - h * 0.06).toFixed(2)}Z`;
  if (variant !== 'ghost' && w >= 6) out.push(<Fill key="kh" d={blob(x, y - h * 0.08, w * 0.09, w * 0.09, {seed: `${seed}/k`}) + kh} color={palette.ink} offset={false} seed={`${seed}/kh`} />);
  if (w >= 10 && variant !== 'ghost') {
    out.push(<circle key="s1" cx={x0 + w * 0.2} cy={y0 + h * 0.14} r={Math.max(0.6, w * 0.06)} fill={palette.ink} />);
    out.push(<circle key="s2" cx={x0 + w * 0.8} cy={y0 + h * 0.86} r={Math.max(0.6, w * 0.06)} fill={palette.ink} />);
  }
  out.push(<Ink key="o" d={roundRect(x0, y0, w, h, Math.min(w, h) * 0.12, {closed: false, seed: `${seed}/o`})} width={width} taper={false} dash={variant === 'ghost' ? `${(w * 0.18).toFixed(1)} ${(w * 0.12).toFixed(1)}` : undefined} />);
  if (variant === 'fixed') {
    out.push(<Fill key="tag" d={roundRect(x + w * 0.3, y + h * 0.1, w * 0.55, h * 0.45, 2)} color={palette.cream} offset={false} seed={`${seed}/t`} />);
    out.push(<Ink key="ck" d={check(x + w * 0.57, y + h * 0.32, w * 0.32)} width={width * 0.8} taper={false} />);
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- P2 ElephantPlaque

export type PlaqueVariant = 'new' | 'blank' | 'old' | 'dot';
/** PLACEHOLDER for props ElephantPlaque (P2): square sand plate with the ink elephant; blank cream; old tan. */
export const PlaqueSlot: React.FC<{x: number; y: number; size: number; variant?: PlaqueVariant; width?: number; seed?: Seed; at?: number}> = ({x, y, size, variant = 'new', width = stroke.inkThin, seed = 'plq', at}) => {
  const t = useTime();
  const k = popK(t, at);
  if (k <= 0) return null;
  const s = size * k;
  const col = variant === 'blank' ? palette.cream : variant === 'old' ? palette.tan : palette.sand;
  if (variant === 'dot' || s < 6) return <Fill rect={[x - s / 2, y - s / 2, s, s]} color={col} offset={false} seed={`${seed}/d`} />;
  return (
    <>
      <Fill d={roundRect(x - s / 2, y - s / 2, s, s, s * 0.08)} color={col} seed={`${seed}/f`} />
      <Ink d={rect(x - s / 2, y - s / 2, s, s, {seed: `${seed}/i`, over: 'small'})} width={width} taper={false} />
      {variant !== 'blank' && s >= 10 ? <Ink d={elephantPath(x, y + s * 0.02, s * 0.72, variant === 'old')} width={Math.max(0.7, width * 0.7)} taper={false} vary={0} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- P3 Bit

/** PLACEHOLDER for props Bit (P3): solid ink beetle (16 x 10 at size 16) with a cream eye dot and antennae. */
export const BitSlot: React.FC<{x: number; y: number; size?: number; flip?: boolean; at?: number; seed?: Seed}> = ({x, y, size = 16, flip, at, seed = 'bit'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const s = size;
  const f = flip ? -1 : 1;
  const wig = osc(t, 1.3, rand(String(seed), 'p') * 6) * 0.06 * s;
  return (
    <>
      <path d={blob(x, y - s * 0.3, s * 0.5, s * 0.32, {seed: `${seed}/b`})} fill={palette.ink} />
      <circle cx={x + f * s * 0.42} cy={y - s * 0.34} r={s * 0.16} fill={palette.ink} />
      <circle cx={x + f * s * 0.46} cy={y - s * 0.38} r={s * 0.05} fill={palette.cream} />
      <path
        d={`M${x + f * s * 0.5} ${y - s * 0.44}q${f * s * 0.12} ${-s * 0.24 + wig} ${f * s * 0.3} ${-s * 0.3}M${x + f * s * 0.46} ${y - s * 0.46}q${f * s * 0.02} ${-s * 0.24} ${f * s * 0.14} ${-s * 0.36 - wig}`}
        fill="none"
        stroke={palette.ink}
        strokeWidth={Math.max(0.6, s * 0.07)}
        strokeLinecap="round"
      />
    </>
  );
};

// ---------------------------------------------------------------- P5 shutter set

/** PLACEHOLDER for props Shutter (P5): roller shutter box (18 px) above the window rect; on `slamAt` it drops over
 *  the window in 0.16 s (ease-in) with a 6 px bounce. Ribs every 14 px. `peephole` = r12 cream-rim hole. */
export const ShutterSlot: React.FC<{x: number; y: number; w: number; h: number; slamAt?: number; down?: boolean; boxH?: number; peephole?: [number, number]; width?: number; seed?: Seed}> = ({x, y, w, h, slamAt, down, boxH = 18, peephole, width = stroke.ink, seed = 'sh'}) => {
  const t = useTime();
  let k = down ? 1 : 0;
  if (!down && slamAt !== undefined && t >= slamAt) {
    const fall = prog(t, slamAt, 0.16, E.inQuad);
    const bounce = t > slamAt + 0.16 ? Math.max(0, Math.sin(prog(t, slamAt + 0.16, 0.14) * Math.PI)) * 6 : 0;
    k = fall - bounce / (h + boxH);
  }
  const top = y - boxH;
  const len = (h + boxH) * k;
  const out: React.ReactNode[] = [];
  if (len > boxH) {
    const bot = top + len;
    out.push(<Fill key="s" rect={[x, top, w, len]} color={palette.tealDark} offset={[1.5, 1]} seed={`${seed}/s`} />);
    let ribs = '';
    for (let yy = top + boxH + 14; yy < bot - 4; yy += 14) ribs += hline(x + 2, x + w - 2, yy, {seed: `${seed}/r${Math.round(yy)}`, over: 0});
    out.push(<Ink key="r" d={ribs} width={Math.max(0.6, width * 0.45)} taper={false} vary={0} />);
    out.push(<Ink key="o" d={line(x, top, x, bot, {over: 0, seed: `${seed}/l`}) + line(x + w, top, x + w, bot, {over: 0, seed: `${seed}/rr`}) + hline(x - 3, x + w + 3, bot, {seed: `${seed}/b`, over: 'small'})} width={width} taper={false} />);
    if (peephole && k >= 1) {
      out.push(<circle key="ph" cx={peephole[0]} cy={peephole[1]} r={12} fill={palette.cream} />);
      out.push(<Ink key="phi" d={circle(peephole[0], peephole[1], 12, {seed: `${seed}/ph`})} width={width * 0.7} taper={false} />);
    }
  }
  out.push(<Fill key="box" rect={[x - 4, top, w + 8, boxH]} color={palette.tealDark} offset={[1.5, 1]} seed={`${seed}/bx`} />);
  out.push(<Ink key="bxi" d={rect(x - 4, top, w + 8, boxH, {seed: `${seed}/bxi`, over: 'small'})} width={width} taper={false} />);
  return <>{out}</>;
};

/** Shutter padlock (kit Padlock, sand body, ink shackle): 24 x 28 by default, pops on at `at`. Distinct from the door lock. */
export const PadlockSlot: React.FC<{x: number; y: number; size?: number; at?: number; seed?: Seed}> = ({x, y, size = 24, at, seed = 'pl'}) => {
  const t = useTime();
  const k = popK(t, at, 0.12, 0.18);
  if (k <= 0) return null;
  return (
    <XG m={mat.about(mat.scale(k), x, y)}>
      <Padlock x={x} y={y + size * 0.1} size={size} color={palette.sand} shackleColor={palette.sand} seed={seed} width={stroke.inkThin} />
    </XG>
  );
};

/** PLACEHOLDER for props BackSoonTag (P5): white 30 x 36 tag with an ink clock, hung from (x, y); swings -16 -> 0 deg
 *  over 0.5 s from `at`, again on `tapAt`. */
export const BackSoonSlot: React.FC<{x: number; y: number; at?: number; tapAt?: number; w?: number; h?: number; seed?: Seed}> = ({x, y, at, tapAt, w = 30, h = 36, seed = 'tag'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const swing = (t0: number | undefined) => (t0 === undefined || t < t0 ? 0 : -16 * Math.exp(-6 * (t - t0)) * Math.cos((t - t0) * 12.5));
  const a = (at !== undefined ? swing(at) : 0) + swing(tapAt);
  return (
    <XG m={mat.about(mat.rotate(a), x, y)}>
      <Ink d={`M${x} ${y}L${x} ${y + 6}`} width={stroke.inkHair} taper={false} />
      <Fill d={roundRect(x - w / 2, y + 6, w, h, 3)} color={palette.white} seed={`${seed}/f`} />
      <Ink d={roundRect(x - w / 2, y + 6, w, h, 3, {closed: false, seed: `${seed}/o`}) + circle(x, y + 6 + h * 0.5, w * 0.28, {seed: `${seed}/c`}) + `M${x} ${y + 6 + h * 0.5}L${x} ${y + 6 + h * 0.34}M${x} ${y + 6 + h * 0.5}L${x + w * 0.14} ${y + 6 + h * 0.56}`} width={stroke.inkHair} taper={false} />
    </XG>
  );
};

// ---------------------------------------------------------------- P17 Bollard

/** PLACEHOLDER for props Bollard (P17): cream post 50 x 90, ink 4.8; (x, y) = top centre (Pip's feet). */
export const BollardSlot: React.FC<{x: number; y: number; w?: number; h?: number; width?: number; seed?: Seed; at?: number}> = ({x, y, w = 50, h = 90, width = stroke.inkBold, seed = 'bollard', at}) => (
  <PopAt at={at} x={x} y={y + h}>
    <Fill d={`M${x - w / 2} ${y + h}L${x - w / 2} ${y + w * 0.3}Q${x - w / 2} ${y} ${x} ${y}Q${x + w / 2} ${y} ${x + w / 2} ${y + w * 0.3}L${x + w / 2} ${y + h}Z`} color={palette.cream} seed={`${seed}/f`} />
    <Ink d={`M${x - w / 2} ${y + h + 6}L${x - w / 2} ${y + w * 0.3}Q${x - w / 2} ${y} ${x} ${y}Q${x + w / 2} ${y} ${x + w / 2} ${y + w * 0.3}L${x + w / 2} ${y + h + 6}` + hline(x - w / 2, x + w / 2, y + w * 0.62, {seed: `${seed}/b`, over: 'small'})} width={width} taper={false} />
  </PopAt>
);

// ---------------------------------------------------------------- hanging signs (P2 variants)

/** PLACEHOLDER for props ElephantPlaque 'round hanging sign' (S06 r45 / S07 r40): sand disc on an iron bracket from
 *  the wall at (wallX, y - r - 24). `swingAt` = pendulum -16 -> 0 deg over 0.5 s. */
export const RoundSignSlot: React.FC<{x: number; y: number; r: number; wallX: number; swingAt?: number; width?: number; seed?: Seed}> = ({x, y, r, wallX, swingAt, width = stroke.ink, seed = 'rsign'}) => {
  const t = useTime();
  const top = y - r - 18;
  const a = swingAt !== undefined && t >= swingAt ? -16 * Math.exp(-5 * (t - swingAt)) * Math.cos((t - swingAt) * 12.5) : 0;
  return (
    <>
      <Ink d={line(wallX, top, x + r * 0.4, top, {seed: `${seed}/br`, over: [0, 4]}) + line(wallX, top + r * 0.6, x - r * 0.2, top, {seed: `${seed}/st`, over: 0})} width={width} taper={false} />
      <XG m={mat.about(mat.rotate(a), x, top)}>
        <Ink d={`M${x - r * 0.4} ${top}L${x - r * 0.4} ${y - r + 2}M${x + r * 0.4} ${top}L${x + r * 0.4} ${y - r + 2}`} width={stroke.inkHair} taper={false} />
        <Fill d={blob(x, y, r, r, {seed: `${seed}/d`})} color={palette.sand} seed={`${seed}/df`} />
        <Ink d={circle(x, y, r, {seed: `${seed}/di`})} width={width} taper={false} />
        <Ink d={elephantPath(x, y + r * 0.04, r * 1.3)} width={stroke.inkThin} taper={false} vary={0} />
      </XG>
    </>
  );
};

/** PLACEHOLDER for props ElephantPlaque 'hanging square plaque' (S12 / S13, 110-130 px) on a bracket from wallX. */
export const HangingPlaqueSlot: React.FC<{x: number; y: number; size: number; wallX: number; variant?: PlaqueVariant; swingAt?: number; at?: number; seed?: Seed}> = ({x, y, size, wallX, variant = 'new', swingAt, at, seed = 'hp'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const top = y - size / 2 - 22;
  const a = swingAt !== undefined && t >= swingAt ? -16 * Math.exp(-5 * (t - swingAt)) * Math.cos((t - swingAt) * 12.5) : 0;
  return (
    <>
      <Ink d={line(wallX, top, x + size * 0.45, top, {seed: `${seed}/br`, over: [0, 5]}) + line(wallX, top + size * 0.35, x - size * 0.1, top, {seed: `${seed}/st`, over: 0})} width={stroke.ink} taper={false} />
      <XG m={mat.about(mat.rotate(a), x, top)}>
        <Ink d={`M${x - size * 0.3} ${top}L${x - size * 0.3} ${y - size / 2}M${x + size * 0.3} ${top}L${x + size * 0.3} ${y - size / 2}`} width={stroke.inkHair} taper={false} />
        <PlaqueSlot x={x} y={y} size={size} variant={variant} width={stroke.ink} seed={seed} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- P15 glyphs, flags, rings

/** PLACEHOLDER for props CheckFlag (60 px flag on a pole); (x, y) = pole foot. */
export const CheckFlagSlot: React.FC<{x: number; y: number; size?: number; at?: number; width?: number; seed?: Seed}> = ({x, y, size = 60, at, width = stroke.ink, seed = 'cf'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const rise = at === undefined ? 1 : E.outBack(1.4)(prog(t, at, 0.3));
  const h = size * 1.6 * rise;
  return (
    <>
      <Ink d={`M${x} ${y}L${x} ${y - h}`} width={width} taper={false} />
      <Fill d={polyPath([[x, y - h], [x + size, y - h + size * 0.1], [x + size * 0.92, y - h + size * 0.62], [x, y - h + size * 0.55]])} color={palette.cream} seed={`${seed}/f`} />
      <Ink d={polyPath([[x, y - h], [x + size, y - h + size * 0.1], [x + size * 0.92, y - h + size * 0.62], [x, y - h + size * 0.55]]) + check(x + size * 0.48, y - h + size * 0.3, size * 0.4)} width={width * 0.8} taper={false} />
    </>
  );
};

/** PLACEHOLDER for props TargetRing / LoadingRing (P6): peach ring + ink outline. */
export const TargetRingSlot: React.FC<{x: number; y: number; r: number; at?: number; width?: number; seed?: Seed}> = ({x, y, r, at, width = stroke.inkThin, seed = 'tr'}) => {
  const t = useTime();
  const k = popK(t, at, 0.15, 0.2);
  if (k <= 0) return null;
  const rr = r * k;
  return (
    <>
      <circle cx={x} cy={y} r={rr} fill="none" stroke={palette.peach} strokeWidth={Math.max(1, rr * 0.35)} />
      <Ink d={circle(x, y, rr * 1.18, {seed: `${seed}/o`})} width={width} taper={false} />
    </>
  );
};

/** PLACEHOLDER for props WrenchTag (P15): sage tag with a cream wrench. */
export const WrenchTagSlot: React.FC<{x: number; y: number; size: number; at?: number; seed?: Seed}> = ({x, y, size, at, seed = 'wt'}) => {
  const t = useTime();
  const k = popK(t, at, 0.15);
  if (k <= 0) return null;
  const s = size * k;
  if (s < 5) return <Fill rect={[x - s / 2, y - s / 2, s, s]} color={palette.sage} offset={false} seed={`${seed}/d`} />;
  return (
    <>
      <Fill d={roundRect(x - s / 2, y - s / 2, s, s, s * 0.18)} color={palette.sage} seed={`${seed}/f`} />
      <Ink d={roundRect(x - s / 2, y - s / 2, s, s, s * 0.18, {closed: false, seed: `${seed}/o`})} width={Math.max(0.8, s * 0.045)} taper={false} />
      <path d={wrenchPath(x, y, s * 0.62)} fill="none" stroke={palette.cream} strokeWidth={Math.max(1, s * 0.11)} strokeLinecap="round" />
    </>
  );
};

/** Wrench glyph path (centre, length). */
export function wrenchPath(x: number, y: number, L: number): string {
  const a = L * 0.5;
  return `M${x - a * 0.7} ${y + a * 0.7}L${x + a * 0.35} ${y - a * 0.35}M${x + a * 0.2} ${y - a * 0.75}a${a * 0.32} ${a * 0.32} 0 1 0 ${a * 0.55} ${a * 0.55}`;
}
/** Magnifier glyph path (centre, radius of the lens). */
export function magnifierPath(x: number, y: number, r: number): string {
  return circle(x - r * 0.2, y - r * 0.2, r, {seed: `mg${Math.round(x)}`}) + line(x + r * 0.5, y + r * 0.5, x + r * 1.3, y + r * 1.3, {over: 0, seed: `mgh${Math.round(x)}`});
}

// ---------------------------------------------------------------- P8 Noticeboard with address rail

/** PLACEHOLDER for props NoticeboardRail (P8): kit Noticeboard (teal frame, two mintPale panes, legs) + an
 *  address-bar rail (cream pill + three dots) on the top frame. Frame rect x, y, w, h; legs to legsY. */
export const NoticeboardSlot: React.FC<{x: number; y: number; w: number; h: number; legsY: number; rail?: [number, number, number, number]; at?: number; seed?: Seed; children?: React.ReactNode}> = ({x, y, w, h, legsY, rail, at, seed = 'nb', children}) => (
  <>
    <Noticeboard x={x} y={y} w={w} h={h} legs={legsY - (y + h)} at={at} seed={seed}>
      {children}
    </Noticeboard>
    {rail ? (
      <>
        <Fill d={roundRect(rail[0], rail[1], rail[2], rail[3], rail[3] / 2)} color={palette.cream} at={at} seed={`${seed}/rail`} />
        <Ink d={roundRect(rail[0], rail[1], rail[2], rail[3], rail[3] / 2, {closed: false, seed: `${seed}/raili`})} width={stroke.inkThin} at={at} taper={false} />
        {[palette.cream, palette.sage, palette.peach].map((c, i) => (
          <circle key={i} cx={rail[0] + rail[3] * 0.7 + i * rail[3] * 0.62} cy={rail[1] + rail[3] / 2} r={rail[3] * 0.22} fill={c} stroke={palette.ink} strokeWidth={1} />
        ))}
      </>
    ) : null}
  </>
);

// ---------------------------------------------------------------- P2 ElephantStamp, P14 Calendar

/** PLACEHOLDER for props ElephantStamp: perspective ellipse ring (sand ring + ink elephant squashed). */
export const ElephantStampSlot: React.FC<{x: number; y: number; rx: number; ry: number; ring?: number; at?: number; seed?: Seed}> = ({x, y, rx, ry, ring = 14, at, seed = 'stamp'}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const k = at === undefined ? 1 : 1 + 1.6 * (1 - E.inOutCubic(prog(t, at, 0.27)));
  return (
    <XG m={mat.about(mat.scale(k), x, y)}>
      <path d={blob(x, y, rx, ry, {seed: `${seed}/o`}) + blob(x, y, rx - ring, ry - ring * (ry / rx), {seed: `${seed}/i`})} fill={palette.sand} fillRule="evenodd" />
      <Ink d={ellipse(x, y, rx, ry, {seed: `${seed}/oi`}) + ellipse(x, y, rx - ring, ry - ring * (ry / rx), {seed: `${seed}/ii`})} width={stroke.inkThin} taper={false} />
      <XG m={mat.about(mat.scale(1, ry / rx), x, y)}>
        <Ink d={elephantPath(x, y, rx * 1.1)} width={stroke.ink} taper={false} vary={0} />
      </XG>
    </XG>
  );
};

/** PLACEHOLDER for props Calendar (P14): tear-off calendar 70 x 80, cream pages, sand header, no numerals. */
export const CalendarSlot: React.FC<{x: number; y: number; w?: number; h?: number; at?: number; seed?: Seed}> = ({x, y, w = 70, h = 80, at, seed = 'cal'}) => (
  <PopAt at={at} x={x + w / 2} y={y}>
    <Fill rect={[x, y, w, h]} color={palette.cream} seed={`${seed}/p`} />
    <Fill rect={[x, y, w, h * 0.22]} color={palette.sand} offset={false} seed={`${seed}/h`} />
    <Ink d={rect(x, y, w, h, {seed: `${seed}/o`, over: 'small'}) + hline(x, x + w, y + h * 0.22, {seed: `${seed}/hl`, over: 0}) + circle(x + w * 0.5, y + h * 0.6, w * 0.16, {seed: `${seed}/s`})} width={stroke.inkThin} taper={false} />
  </PopAt>
);

/** Stand-in check mark stroke (P15 CheckMark): strokes on over 0.17 s from `at`. */
export const CheckSlot: React.FC<{x: number; y: number; size: number; at?: number; width?: number}> = ({x, y, size, at, width = stroke.inkBold}) => <Ink d={check(x, y, size)} at={at} dur={0.17} width={width} />;

/** re-export for sets that draw the props-lane glyph shapes themselves */
export {smooth, arc, springAt, springs};
