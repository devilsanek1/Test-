// cine/props.tsx — foreground framing pieces for full-bleed shots: a rooftop Ledge (parapet) to sit the mascot
// and back-view figures on, a stone Balustrade end / Plinth to perch on, a WindowCloseup (one window up close), and
// foreground wipes: something passes close to the lens and the cut rides on its edge.
//
//   <Ledge y={1460} tod="dusk" at={0.1} />                       // parapet across the frame, cropped by its edges
//   <WipeCut at={5.6} dur={0.55} dir="right" kind="column" tod="dusk" a={<Shot ...>} b={<Shot ...>} />
//   <WipePass at={5.6} dur={0.55} dir="right" kind="figure" />   // the element alone (screen space)
//   wipeToneRegions(T, {at: 5.6, kind: 'column'}, 'dark', 'light')  // SkyCaptions regions during the wipe
// The column / passer wipers live in the leaf module ./wipers (core WiperComponent shape, for Film too).

import React from 'react';
import {palette, stroke} from '../theme';
import {ease as E, prog, useTime} from '../time';
import {Ink} from '../Ink';
import {crown, glint, hline, line, rect, textLines, wallTicks} from '../sketch';
import {rng, Seed} from '../rng';
import {ambient, TodLike, TodPalette, useTodPal} from './atmosphere';
import {darker} from './city';
import {Glow} from './light';
import {PathBuf, r1} from './util';
import {CineExitShrink, exitScale, inkOn, lookPaint, useCineState} from './state';
import {lodScale, ROOM_LOD, roomLook, roomMelt, roomShapes} from './windows';
import {roomColors} from './wall';
import {BUILTIN_WIPERS, FoliageWiper, WiperComponent} from '../Film';
import {CINE_WIPE_HALF, CINE_WIPERS, ColumnWiper, PasserWiper, wipeEdgeX, wiperRegions} from './wipers';
import type {ToneRegion} from '../Captions';
import type {CaptionTone} from '../theme';
import {NoExit} from '../exit';
import {useId} from 'react';

export type LedgeProps = {
  /** Back edge of the top surface (where things sit). */
  y: number;
  x0?: number;
  x1?: number;
  /** Top surface depth (px) and front face height. */
  top?: number;
  face?: number;
  tod?: TodLike | TodPalette;
  color?: string;
  /** Draw-on start (ink), fills pop a beat later. Omit = built. */
  at?: number;
  seed?: Seed;
  width?: number;
  /** Floor colour below the face (the roof we stand on). */
  floor?: string;
  /** Roof detail so the floor is never a dead slab: brick courses on the face, a drain pipe, and roof clutter on the
   *  floor (vents, a hatch, a pipe run, an antenna mast, tar seams). Default false. */
  detail?: boolean;
};

/** A rooftop parapet seen from behind and slightly above: lit top surface, shaded front face, inked edges that
 *  overshoot past the frame, brick ticks. Everything below it is the roof floor. */
export const Ledge: React.FC<LedgeProps> = ({y, x0 = -60, x1 = 1140, top = 30, face = 110, tod, color, at, seed = 'ledge', width = stroke.inkBold, floor, detail = false}) => {
  const S = useCineState();
  const t = S.t;
  const p = useTodPal(tod);
  const r = rng(`ledge/${seed}`);
  const c = color ?? ambient(palette.sand, p);
  const shadeC = ambient(darker(palette.sand), p);
  const floorC = floor ?? ambient(palette.tan, p);
  const fp = (at === undefined ? 1 : prog(t, at + 0.25, 0.01)) * exitScale(S.e, 0.6, 0.5);
  const P = (c: string) => lookPaint(S, c, [540, y]);
  const ink =
    hline(x0, x1, y, {seed: `${seed}/a`, over: 'structural'}) +
    hline(x0 + 20, x1 - 10, y + top, {seed: `${seed}/b`, over: 'structural'}) +
    hline(x0, x1, y + top + face, {seed: `${seed}/c`, over: [10, 30]}) +
    line(x0 + (x1 - x0) * r.range(0.62, 0.7), y + top, x0 + (x1 - x0) * r.range(0.62, 0.7) + 2, y + top + face, {seed: `${seed}/j`, over: [0, 4]});
  const ticks = detail ? '' : wallTicks(x0 + 80, y + top + 22, x1 - x0 - 160, face - 40, {seed: `${seed}/t`, n: 7, size: 26});
  const D = detail ? ledgeDetail(x0, x1, y + top, face, seed) : null;
  return (
    <>
      {fp > 0 && S.look.fills !== 'none' ? (
        <g transform={fp < 1 ? `translate(0 ${r1(y + top + face)}) scale(1 ${fp.toFixed(4)}) translate(0 ${r1(-(y + top + face))})` : undefined}>
          <rect x={x0 - 400} y={y + top + face} width={x1 - x0 + 800} height={1400} fill={P(floorC)} />
          <rect x={x0 - 400} y={y + top} width={x1 - x0 + 800} height={face} fill={P(shadeC)} />
          <rect x={x0 - 400} y={y + 3} width={x1 - x0 + 800} height={top} fill={P(c)} />
          {D ? (
            <>
              <path d={D.dark} fill={P(ambient(darker(floorC === palette.tealDark ? palette.tealDark : palette.tan), p))} transform="translate(2 1.5)" />
              <path d={D.mid} fill={P(ambient(palette.teal, p))} transform="translate(2 1.5)" />
              <path d={D.light} fill={P(ambient(palette.sand, p))} transform="translate(2 1.5)" />
            </>
          ) : null}
        </g>
      ) : null}
      <Ink d={ink} at={at} width={width} />
      {ticks ? <Ink d={ticks} at={at === undefined ? undefined : at + 0.3} width={stroke.ink} order="all" /> : null}
      {D ? <Ink d={D.ink} at={at === undefined ? undefined : at + 0.3} width={stroke.ink} /> : null}
      {D ? <Ink d={D.thin} at={at === undefined ? undefined : at + 0.4} width={stroke.inkThin} order="all" /> : null}
    </>
  );
};

/** Ledge detail geometry: brick courses on the face (joint lines with staggered head joints, broken), a drain pipe with
 *  brackets, and roof clutter on the floor below (two mushroom vents, a hatch, a pipe run on blocks, a short antenna
 *  mast, tar seams). Fills by tone: dark / mid / light. */
function ledgeDetail(x0: number, x1: number, fy: number, face: number, seed: Seed) {
  const r = rng(`ledgeD/${seed}`);
  const ink = new PathBuf();
  const thin = new PathBuf();
  const dark = new PathBuf();
  const mid = new PathBuf();
  const light = new PathBuf();
  // brick courses: 3-4 joint lines across the face, head joints every ~70 px, staggered per course, some skipped
  const courses = Math.max(2, Math.round(face / 26));
  for (let c = 1; c < courses; c++) {
    const yy = fy + (face * c) / courses;
    let x = x0 + r.range(-30, 0);
    while (x < x1) {
      const len = r.range(140, 320);
      thin.raw(line(x, yy, Math.min(x1 + 20, x + len), yy + r.jitter(1.2), {seed: `${seed}/bc${c}/${Math.round(x)}`, over: [0, 0], breaks: false}));
      x += len + r.range(14, 40);
    }
    for (let hx = x0 + (c % 2 ? 35 : 0) + r.range(0, 20); hx < x1; hx += r.range(58, 84)) {
      if (r.chance(0.35)) continue;
      const ya = yy - face / courses;
      thin.raw(`M${r1(hx)} ${r1(ya + 3)}L${r1(hx + r.jitter(1))} ${r1(yy - 3)}`);
    }
  }
  const fb = fy + face; // floor starts here
  // drain pipe down the face into the floor
  const px = x0 + (x1 - x0) * r.range(0.15, 0.25);
  mid.rect(px - 9, fy - 6, 18, face + 70);
  mid.rect(px - 9, fb + 50, 46, 18);
  ink.raw(line(px - 9, fy - 8, px - 9, fb + 66, {seed: `${seed}/dp1`, over: [0, 0], breaks: false}) + line(px + 9, fy - 8, px + 9, fb + 50, {seed: `${seed}/dp2`, over: [0, 0], breaks: false}) + `M${r1(px + 9)} ${r1(fb + 50)}L${r1(px + 38)} ${r1(fb + 50)}M${r1(px - 9)} ${r1(fb + 68)}L${r1(px + 38)} ${r1(fb + 68)}`);
  for (const k of [0.3, 0.75]) thin.raw(`M${r1(px - 14)} ${r1(fy + face * k)}h28`);
  // floor clutter, nearer = lower and bigger
  const vent = (vx: number, vy: number, s: number) => {
    mid.rect(vx - 11 * s, vy - 34 * s, 22 * s, 34 * s);
    light.raw(`M${r1(vx - 24 * s)} ${r1(vy - 34 * s)}Q${r1(vx)} ${r1(vy - 58 * s)} ${r1(vx + 24 * s)} ${r1(vy - 34 * s)}Z`);
    ink.raw(line(vx - 11 * s, vy, vx - 11 * s, vy - 34 * s, {seed: `${seed}/v${vx}a`, over: [0, 0], breaks: false}) + line(vx + 11 * s, vy, vx + 11 * s, vy - 34 * s, {seed: `${seed}/v${vx}b`, over: [0, 0], breaks: false}));
    ink.raw(`M${r1(vx - 26 * s)} ${r1(vy - 33 * s)}Q${r1(vx)} ${r1(vy - 60 * s)} ${r1(vx + 26 * s)} ${r1(vy - 33 * s)}L${r1(vx - 26 * s)} ${r1(vy - 33 * s)}`);
  };
  vent(x0 + (x1 - x0) * r.range(0.55, 0.62), fb + 120, 1.2);
  vent(x0 + (x1 - x0) * r.range(0.82, 0.9), fb + 70, 0.9);
  // hatch: a raised box with a lid line
  const hx = x0 + (x1 - x0) * r.range(0.3, 0.42);
  const hy = fb + 210;
  dark.rect(hx, hy - 46, 150, 46);
  light.raw(`M${r1(hx - 6)} ${r1(hy - 46)}L${r1(hx + 156)} ${r1(hy - 46)}L${r1(hx + 146)} ${r1(hy - 60)}L${r1(hx + 4)} ${r1(hy - 60)}Z`);
  ink.raw(line(hx - 10, hy - 46, hx + 162, hy - 46, {seed: `${seed}/h1`, over: [4, 6], breaks: false}) + line(hx, hy - 46, hx, hy, {seed: `${seed}/h2`, over: [0, 0], breaks: false}) + line(hx + 150, hy - 46, hx + 150, hy, {seed: `${seed}/h3`, over: [0, 0], breaks: false}));
  thin.raw(`M${r1(hx + 4)} ${r1(hy - 60)}L${r1(hx + 146)} ${r1(hy - 60)}`);
  // pipe run on little blocks along the floor
  const py = fb + 330;
  mid.rect(x0 - 40, py - 14, x1 - x0 + 80, 14);
  ink.raw(line(x0 - 40, py - 14, x1 + 40, py - 16, {seed: `${seed}/pr1`, over: [0, 0], breaks: true}) + line(x0 - 40, py, x1 + 40, py - 2, {seed: `${seed}/pr2`, over: [0, 0], breaks: true}));
  for (let bx = x0 + 60; bx < x1; bx += 190) dark.rect(bx, py, 26, 16);
  // antenna mast with a cross bar
  const ax = x0 + (x1 - x0) * r.range(0.68, 0.74);
  ink.raw(`M${r1(ax)} ${r1(fb + 160)}L${r1(ax)} ${r1(fb + 10)}M${r1(ax - 26)} ${r1(fb + 40)}L${r1(ax + 26)} ${r1(fb + 40)}M${r1(ax - 16)} ${r1(fb + 64)}L${r1(ax + 16)} ${r1(fb + 64)}`);
  // tar seams on the floor
  for (let i = 0; i < 4; i++) {
    const sy = fb + 260 + i * r.range(70, 120);
    const sx = r.range(x0, x1 - 300);
    thin.raw(line(sx, sy, sx + r.range(220, 420), sy + r.jitter(4), {seed: `${seed}/ts${i}`, over: [0, 0], breaks: true}));
  }
  return {ink: ink.d, thin: thin.d, dark: dark.d, mid: mid.d, light: light.d};
}

export type WipeKind = 'column' | 'passer' | 'figure' | 'pole' | 'foliage' | 'slab';

export type WipePassProps = {
  at: number;
  /** Seconds to cross the frame (0.45-0.6 reads as "something passing close"). The edge crosses the centre at at + dur/2. */
  dur?: number;
  dir?: 'left' | 'right';
  /** What passes the lens: a stone 'column' with a capital (default), a 'passer' (a giant back-view silhouette with a
   *  rim), the core 'figure' / 'pole' / 'foliage' wipers, or the old flat 'slab'. All are opaque over the edge +-90 px,
   *  full height. */
  kind?: WipeKind;
  tod?: TodLike | TodPalette;
  /** Body colour (default tealDark, the darkest fill allowed). */
  color?: string;
  /** Lit edge strip on the leading side (default the tod rim / peach). */
  rim?: string;
  /** Parallax scale-up over the pass (default 0.08 = +8 %). */
  grow?: number;
  /** Custom element (screen px) centred on the edge x; p = 0..1 through the pass. */
  children?: (x: number, p: number) => React.ReactNode;
  /** @deprecated (slab only) */
  width?: number;
  seed?: Seed;
};

/** Half-width of each wiper (the edge travels from -half to W + half). Film's own wipers: figure 660, pole 120,
 *  foliage 460 (Film.tsx WIPE_HALF). */
const WIPE_HALF: Record<WipeKind, number> = {...CINE_WIPE_HALF, figure: 660, pole: 120, foliage: 460, slab: 760};

/** Every wiper component by kind (the core Film's built-ins + the cine ones). */
export const WIPERS: Record<Exclude<WipeKind, 'slab'>, WiperComponent> = {...(BUILTIN_WIPERS as Record<'figure' | 'pole' | 'foliage', WiperComponent>), ...CINE_WIPERS};

/** Screen x of the wipe edge at time t, or null outside the pass. The edge eases in-out (sine) across the frame. */
export function wipeEdge(t: number, at: number, dur: number, dir: 'left' | 'right', kind: WipeKind = 'column'): {x: number; p: number} | null {
  const p = prog(t, at, dur);
  if (p <= 0 || p >= 1) return null;
  return {x: wipeEdgeX(p, dir, WIPE_HALF[kind]), p};
}

export type WipeSpec = {at: number; dur?: number; dir?: 'left' | 'right'; kind?: WipeKind; color?: string; grow?: number};

/** Caption tone regions for a cine wipe at time T: the outgoing shot's tone on the unswept side, the incoming one's on
 *  the swept side, and the element's own `captionRegions` (with the 8 % parallax growth) on top. null outside it.
 *  Feed SkyCaptions `regions={(T) => wipeToneRegions(T, wipe, toneBefore, toneAfter) ?? null}`. */
export function wipeToneRegions(T: number, w: WipeSpec, before: CaptionTone, after: CaptionTone): ToneRegion[] | null {
  const dur = w.dur ?? 0.55;
  const dir = w.dir ?? 'right';
  const kind = w.kind ?? 'column';
  const e = wipeEdge(T, w.at, dur, dir, kind);
  if (!e) return null;
  const x = e.x;
  const regs: ToneRegion[] = [
    {tone: before, rect: dir === 'right' ? [x, -200, 1300, 2200] : [-200, -200, x, 2200]},
    {tone: after, rect: dir === 'right' ? [-200, -200, x, 2200] : [x, -200, 1300, 2200]},
  ];
  if (kind === 'slab') regs.push({tone: 'light', rect: [x - WIPE_HALF.slab, -200, x + WIPE_HALF.slab, 2200]});
  else regs.push(...wiperRegions(WIPERS[kind], {x, p: e.p, dir, color: w.color}, w.grow ?? 0.08));
  return regs;
}

/** The element passing the lens (screen space, outside any Layer). Use WipeCut to also split the two shots on its edge. */
export const WipePass: React.FC<WipePassProps> = ({at, dur = 0.55, dir = 'right', kind = 'column', tod, color, rim, grow = 0.08, children, seed = 'wipe'}) => {
  const t = useTime();
  const P = useTodPal(tod);
  const E0 = wipeEdge(t, at, dur, dir, kind);
  if (!E0) return null;
  const {x, p} = E0;
  const body = color ?? palette.tealDark;
  const rimC = rim ?? (P.rim === palette.white ? palette.cream : P.rim);
  let el: React.ReactNode;
  if (children) el = children(x, p);
  else if (kind === 'passer') el = <PasserWiper x={x} p={p} dir={dir} color={body} rim={rimC} />;
  else if (kind === 'column') el = <ColumnWiper x={x} p={p} dir={dir} color={body} rim={rimC} />;
  else if (kind === 'foliage') el = <FoliageWiper x={x} p={p} dir={dir} color={color ?? palette.teal} />;
  else if (kind !== 'slab') {
    const W = WIPERS[kind];
    el = <W x={x} p={p} dir={dir} color={body} />;
  } else {
    const half = WIPE_HALF.slab;
    el = (
      <>
        <rect x={x - half} y={-60} width={half * 2} height={2040} fill={body} />
        <rect x={dir === 'right' ? x + half - 26 : x - half} y={-60} width={26} height={2040} fill={rimC} />
        <path d={line(dir === 'right' ? x + half : x - half, -60, dir === 'right' ? x + half : x - half, 1980, {seed: `${seed}/e`, over: [0, 0]})} fill="none" stroke={palette.ink} strokeWidth={9} strokeLinecap="round" />
      </>
    );
  }
  const k = 1 + grow * p;
  return (
    <NoExit>
      <g transform={`translate(${r1(x)} 1920) scale(${k.toFixed(4)}) translate(${r1(-x)} -1920)`}>{el}</g>
    </NoExit>
  );
};

/** A foreground-wipe cut between two shots: `a` (outgoing) stays on the unswept side of the moving edge, `b`
 *  (incoming) is revealed behind it, and the element passing the lens covers the edge. Render a and b as <Shot>s
 *  whose ranges overlap [at, at + dur]. Screen space (CineFrame root). */
export const WipeCut: React.FC<Omit<WipePassProps, 'children'> & {a: React.ReactNode; b: React.ReactNode; element?: WipePassProps['children']}> = ({a, b, element, ...w}) => {
  const t = useTime();
  const id = 'wc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const dur = w.dur ?? 0.55;
  const dir = w.dir ?? 'right';
  const E0 = wipeEdge(t, w.at, dur, dir, w.kind ?? 'column');
  if (!E0) return <>{t < w.at + dur / 2 ? a : b}</>;
  const x = Math.max(0, Math.min(1080, E0.x));
  // dir right: the edge moves right; the new shot appears on its left
  const rb: [number, number] = dir === 'right' ? [-100, x] : [x, 1180];
  const ra: [number, number] = dir === 'right' ? [x, 1180] : [-100, x];
  return (
    <>
      <defs>
        <clipPath id={`${id}a`} clipPathUnits="userSpaceOnUse">
          <rect x={ra[0]} y={-100} width={Math.max(0, ra[1] - ra[0])} height={2120} />
        </clipPath>
        <clipPath id={`${id}b`} clipPathUnits="userSpaceOnUse">
          <rect x={rb[0]} y={-100} width={Math.max(0, rb[1] - rb[0])} height={2120} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}a)`}>{a}</g>
      <g clipPath={`url(#${id}b)`}>{b}</g>
      <WipePass {...w}>{element}</WipePass>
    </>
  );
};

// ---------------------------------------------------------------- Plinth

/** A stone block / low wall end to perch a mascot or a figure on (front face, lit cap, ink). Top-centre at (x, y). */
export const Plinth: React.FC<{x: number; y: number; w?: number; h?: number; tod?: TodLike | TodPalette; seed?: Seed; width?: number}> = ({x, y, w = 260, h = 420, tod, seed = 'plinth', width = stroke.inkBold}) => (
  <CineExitShrink x={x} y={y + h} axis="y" size={0.2}>
    <PlinthBody x={x} y={y} w={w} h={h} tod={tod} seed={seed} width={width} />
  </CineExitShrink>
);

const PlinthBody: React.FC<{x: number; y: number; w: number; h: number; tod?: TodLike | TodPalette; seed: Seed; width: number}> = ({x, y, w, h, tod, seed, width}) => {
  const S = useCineState();
  const p = useTodPal(tod);
  const P = (c: string) => lookPaint(S, c, [x, y]);
  const cap = 26;
  const x0 = x - w / 2;
  const ink =
    hline(x0 - 14, x0 + w + 14, y, {seed: `${seed}/a`, over: [8, 18]}) +
    hline(x0 - 14, x0 + w + 14, y + cap, {seed: `${seed}/b`, over: [6, 12]}) +
    line(x0, y + cap, x0, y + h, {seed: `${seed}/l`, over: [0, 0]}) +
    line(x0 + w, y + cap, x0 + w, y + h, {seed: `${seed}/r`, over: [0, 0]});
  return (
    <>
      <rect x={x0} y={y + cap} width={w} height={h} fill={P(ambient(palette.sand, p))} />
      <rect x={x0} y={y + cap} width={w * 0.22} height={h} fill={P(ambient(palette.tan, p))} />
      <rect x={x0 - 12} y={y + 2} width={w + 24} height={cap} fill={P(ambient(palette.cream, p))} />
      {inkOn(S) ? <path d={ink} fill="none" stroke={palette.ink} strokeWidth={width} strokeLinecap="round" /> : null}
      {inkOn(S) ? <path d={wallTicks(x0 + 30, y + cap + 40, w - 60, h - 80, {seed: `${seed}/t`, n: 3, size: 22})} fill="none" stroke={palette.ink} strokeWidth={stroke.ink} strokeLinecap="round" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- Balustrade

export type BalustradeProps = {
  /** Front-left corner of the pedestal top (where a mascot sits: top centre = (x + w / 2, y)). */
  x: number;
  y: number;
  /** Pedestal width / height (it runs down past the frame bottom). */
  w?: number;
  h?: number;
  /** The rail continues to this side (cropped by the frame edge). */
  side?: 'left' | 'right';
  tod?: TodLike | TodPalette;
  /** A lit edge strip on this side (backlight from the sun). */
  rim?: 'left' | 'right' | 'none';
  width?: number;
  seed?: Seed;
};

/** A stone balustrade end: a pedestal with cap and base mouldings (doubled ink), a rail running off the frame edge on
 *  short vase balusters. Foreground framing to perch the mascot on in a civic / monumental shot. */
export const Balustrade: React.FC<BalustradeProps> = (props) => (
  <CineExitShrink x={props.x + (props.w ?? 220) / 2} y={props.y + (props.h ?? 900)} axis="y" size={0.25}>
    <BalustradeBody {...props} />
  </CineExitShrink>
);

const BalustradeBody: React.FC<BalustradeProps> = ({x, y, w = 220, h = 900, side = 'right', tod, rim = 'none', width = stroke.inkBold, seed = 'bal'}) => {
  const S = useCineState();
  const p = useTodPal(tod);
  const P = (c: string) => lookPaint(S, c, [x + w / 2, y]);
  const stone = ambient(palette.cream, p);
  const shade = ambient(palette.sand, p);
  const dark = ambient(palette.tan, p);
  const capH = 34;
  const railY = y + 150; // top of the rail
  const railH = 40;
  const balH = 190;
  const dirX = side === 'right' ? 1 : -1;
  const edge = side === 'right' ? x + w : x;
  const far = side === 'right' ? 1500 : -500;
  // balusters: vase = narrow neck + round belly + base, every 74 px off to the side
  const bal = new PathBuf();
  const balInk: string[] = [];
  for (let i = 0; i < 9; i++) {
    const bx = edge + dirX * (52 + i * 74);
    const top = railY + railH;
    bal.rect(bx - 9, top, 18, 30);
    bal.circle(bx, top + 30 + 52, 30);
    bal.rect(bx - 22, top + balH - 28, 44, 28);
    balInk.push(line(bx - 9, top, bx - 9, top + 34, {seed: `${seed}/b${i}a`, over: [0, 2], breaks: false}) + line(bx + 9, top, bx + 9, top + 34, {seed: `${seed}/b${i}b`, over: [0, 2], breaks: false}));
  }
  const ink =
    line(x - 16, y, x + w + 16, y, {seed: `${seed}/c1`, over: [6, 14], breaks: false}) +
    line(x - 10, y + capH, x + w + 10, y + capH, {seed: `${seed}/c2`, over: [4, 10], breaks: false}) +
    line(x + 4, y + capH + 12, x + w - 4, y + capH + 12, {seed: `${seed}/c3`, over: [2, 6], breaks: false}) +
    line(x, y + capH, x, y + h, {seed: `${seed}/l`, over: [0, 0], breaks: false}) +
    line(x + w, y + capH, x + w, y + h, {seed: `${seed}/r`, over: [0, 0], breaks: false}) +
    line(edge, railY, far, railY, {seed: `${seed}/rt`, over: [0, 0], breaks: false}) +
    line(edge, railY + railH, far, railY + railH, {seed: `${seed}/rb`, over: [0, 0], breaks: false}) +
    line(edge, railY + railH + balH, far, railY + railH + balH, {seed: `${seed}/rl`, over: [0, 0], breaks: false}) +
    // a recessed panel on the pedestal face
    line(x + 34, y + 120, x + w - 34, y + 120, {seed: `${seed}/p1`, over: [2, 4], breaks: false}) +
    line(x + 34, y + 120, x + 34, y + h, {seed: `${seed}/p2`, over: [2, 0], breaks: false}) +
    line(x + w - 34, y + 120, x + w - 34, y + h, {seed: `${seed}/p3`, over: [2, 0], breaks: false});
  const railX = side === 'right' ? edge : far;
  const railW = Math.abs(far - edge);
  const showInk = inkOn(S, 0.3);
  return (
    <>
      {/* rail + balusters (behind the pedestal) */}
      <rect x={railX} y={railY} width={railW} height={railH} fill={P(stone)} />
      <path d={bal.d} fill={P(shade)} />
      <rect x={railX} y={railY + railH + balH} width={railW} height={h} fill={P(dark)} />
      {/* pedestal */}
      <rect x={x} y={y + capH} width={w} height={h} fill={P(shade)} />
      <rect x={side === 'right' ? x : x + w * 0.78} y={y + capH} width={w * 0.22} height={h} fill={P(dark)} />
      <rect x={x - 10} y={y + 2} width={w + 20} height={capH} fill={P(stone)} />
      {rim !== 'none' && S.look.fills === 'color' ? <rect x={rim === 'right' ? x + w - 5 : x} y={y + capH} width={5} height={h * 0.55} fill={palette.peach} /> : null}
      {rim !== 'none' && S.look.fills === 'color' ? <rect x={rim === 'right' ? x + w + 4 : x - 10} y={y + 2} width={6} height={capH} fill={palette.peach} /> : null}
      {showInk ? <path d={ink} fill="none" stroke={palette.ink} strokeWidth={width} strokeLinecap="round" /> : null}
      {showInk ? <path d={balInk.join('')} fill="none" stroke={palette.ink} strokeWidth={stroke.ink} strokeLinecap="round" /> : null}
    </>
  );
};

// ---------------------------------------------------------------- WindowCloseup

export type WindowCloseupProps = {
  /** Glass opening size in local px (draw at ~1x, then place it on a facade with affineFromTri). */
  w?: number;
  h?: number;
  tod?: TodLike | TodPalette;
  /** Room light switches off (pop). */
  offAt?: number;
  /** The monitor (a website) switches off. Default offAt + 0.35. */
  screenOffAt?: number;
  seed?: Seed;
  /** Person at the desk (back view). */
  person?: React.ReactNode;
  /** Room light on from the start (default true). false = a dark neighbour window: no lamp, dark room. */
  lit?: boolean;
  /** Back-view chair in front of the person's lower torso (default: when there is a person). */
  chair?: boolean;
  /** Desk + monitor (default true). */
  desk?: boolean;
  /** The web page on the monitor refreshes every `screenTick` s (its text lines re-flow: a small pop). */
  screenTick?: number;
  /** The room light switches on at this time (dark before). */
  onAt?: number;
  /** The curtain is drawn closed at this time (a pop). */
  curtainAt?: number;
  /** The room light flickers off for two frames at these times (on a stressed word). */
  flickerAt?: number[];
  /** Level of detail, fixed: 'full' (everything), 'room' (the flat room colour, curtain and transom only), 'glass'
   *  (one flat pane in `litColor` / `darkColor`, pixel-identical to a WallOfWindows grid pane). Default 'full'.
   *  Prefer `screenW`: the close-up then degrades ITSELF, element by element, as the camera pulls away. */
  detail?: 'full' | 'room' | 'glass';
  /** The glass's on-screen width (px). Small things drop at staggered sizes (person < 80, chair / plant < 72, desk
   *  < 64, lamp / glints / ink < 56; x 0.9-1.1 by `lodJitter`), and the big areas MELT instead of popping: the frame band
   *  (70 -> 50 px), the floor band (62 -> 44), the curtain and transom (56 -> 42) shrink to nothing, so at 'glass'
   *  (< ~42 px) nothing is left to vanish and the swap to the grid pane is invisible. Overrides `detail`. */
  screenW?: number;
  /** 0..1 per cell: jitters the drop sizes (so no step lands on every cell in the same frame). Default 0.5. */
  lodJitter?: number;
  /** Room colour when lit / unlit (default peach / the tod's tealDark). Pass the grid's pane colours for this cell
   *  (litColors[floor(k3 * n)], windowDark) so a close-up and its grid pane match exactly. */
  litColor?: string;
  darkColor?: string;
  /** Force the lit state (overrides lit / onAt / offAt / flicker), e.g. from wallCellState(). */
  on?: boolean;
};

/** One lit window up close: frame, transom, curtain, pendant lamp with a stepped glow, a desk with a monitor showing
 *  a web page, a plant on the sill, glints. Local origin = top-left of the glass. */
export const WindowCloseup: React.FC<WindowCloseupProps> = (props) => (
  <CineExitShrink x={(props.w ?? 420) / 2} y={(props.h ?? 760) / 2} size={0.15}>
    <WindowCloseupBody {...props} />
  </CineExitShrink>
);



const WindowCloseupBody: React.FC<WindowCloseupProps> = ({w = 420, h = 760, tod, offAt, screenOffAt, seed = 'wc', person, lit: lit0 = true, chair, desk = true, screenTick, onAt, curtainAt, flickerAt, detail = 'full', litColor, darkColor, on: onIn, screenW, lodJitter = 0.5}) => {
  const t = useTime();
  const p = useTodPal(tod);
  const flick = (flickerAt ?? []).some((f) => t >= f && t < f + 0.07);
  const lit = onIn ?? (lit0 && (onAt === undefined || t >= onAt) && !flick);
  const on = onIn ?? (lit && (offAt === undefined || t < offAt));
  const scrOn = lit && t < (screenOffAt ?? (offAt === undefined ? Infinity : offAt + 0.35));
  const litC = litColor ?? palette.peach;
  const darkC = darkColor ?? ambient(palette.tealDark, p);
  // level of detail: from the screen width (element by element, melting the big areas), or a fixed level
  // (the SAME ladder, shapes, colours and random look as WallOfWindows grid panes: ROOM_LOD / roomShapes / roomColors)
  const W = screenW !== undefined ? screenW / lodScale(lodJitter) : detail === 'full' ? 1e6 : detail === 'room' ? ROOM_LOD.lamp - 0.01 : 0;
  if (W < ROOM_LOD.glass) return <rect x={0} y={0} width={w} height={h} fill={on ? litC : darkC} />;
  const full = W >= ROOM_LOD.lamp; // lamp, glints
  const deskOn = W >= ROOM_LOD.desk; // desk + monitor, frame ink
  const chairOn = W >= ROOM_LOD.chair; // chair, plant
  const personOn = W >= ROOM_LOD.person;
  const kFrame = roomMelt(W, ROOM_LOD.frame);
  const kFloor = roomMelt(W, ROOM_LOD.floor);
  const kCurtain = roomMelt(W, ROOM_LOD.curtain);
  const showChair = (chair ?? !!person) && chairOn;
  const look = roomLook(seed, lit);
  const curtainRight = look.curtainRight;
  const plantOn = look.plant;
  const fr = 22;
  const room = on ? litC : darkC;
  const rcol = roomColors(on, litC, darkC, p);
  const roomDark = rcol.floor;
  const lampX = w * 0.64;
  const deskY = h * 0.6;
  const mon = {x: w * 0.47, y: h * 0.42, w: w * 0.36, h: h * 0.15};
  // an unlit window keeps the cool night values and stays close to its grid pane: the room IS the pane colour, the
  // curtain one step lighter (tealDark on the darker panes), the frame band sage; captions can sit on it
  const frameC = on || lit ? palette.cream : palette.sage;
  const curtainDark = rcol.curtain;
  const ink = rect(-fr, -fr, w + fr * 2, h + fr * 2, {seed: `${seed}/o`, over: 'medium'}) + rect(0, 0, w, h, {seed: `${seed}/i`, over: 'small'}) + hline(-fr - 30, w + fr + 30, h + fr + 14, {seed: `${seed}/s`, over: [20, 30]}) + hline(-fr - 24, w + fr + 24, h + fr + 30, {seed: `${seed}/s2`, over: [10, 20]});
  const tr = hline(0, w, h * 0.3, {seed: `${seed}/tr`, over: [2, 4]}) + hline(0, w, h * 0.3 + 14, {seed: `${seed}/tr2`, over: [2, 4]});
  const sh = roomShapes(curtainAt !== undefined && t >= curtainAt ? 0.86 : look.curtainW, false, kCurtain, kFloor);
  const curtain = sh.curtain ? sh.curtain.map(([u, v], i) => `${i ? 'L' : 'M'}${r1(u * w)} ${r1(v * h)}`).join('') + 'Z' : '';
  const fr2 = fr * kFrame;
  // sub-pixel at room sizes: the misregistration offset only at full detail
  const mis = full ? 2 : 0;
  const chairX = w * 0.3;
  const chairW = w * 0.3;
  const chairY = h * 0.8;
  const chairH = h * 0.12;
  // back-view chair (ref 2 f_33): an inked frame (posts overshooting the top rail), two slats, the seat edge and leg
  // stubs below it
  const cx0 = chairX - chairW / 2;
  const cx1 = chairX + chairW / 2;
  const seatY = chairY + chairH + h * 0.035;
  const chairInk =
    line(cx0, seatY, cx0, chairY - 6, {seed: `${seed}/cp1`, over: [0, 5], breaks: false}) +
    line(cx1, seatY, cx1, chairY - 6, {seed: `${seed}/cp2`, over: [0, 5], breaks: false}) +
    line(cx0 - 5, chairY, cx1 + 5, chairY, {seed: `${seed}/ct`, over: [3, 3], breaks: false}) +
    line(cx0, chairY + chairH * 0.42, cx1, chairY + chairH * 0.42, {seed: `${seed}/cs1`, over: [0, 0], breaks: false}) +
    line(cx0, chairY + chairH * 0.8, cx1, chairY + chairH * 0.8, {seed: `${seed}/cs2`, over: [0, 0], breaks: false}) +
    line(cx0 - chairW * 0.08, seatY, cx1 + chairW * 0.08, seatY, {seed: `${seed}/cse`, over: [2, 2], breaks: false}) +
    `M${r1(cx0 + chairW * 0.06)} ${r1(seatY)}L${r1(cx0 + chairW * 0.04)} ${r1(h)}M${r1(cx1 - chairW * 0.06)} ${r1(seatY)}L${r1(cx1 - chairW * 0.04)} ${r1(h)}`;
  const chairFill = `M${r1(cx0)} ${r1(chairY)}H${r1(cx1)}V${r1(chairY + chairH * 0.42)}H${r1(cx0)}ZM${r1(cx0)} ${r1(chairY + chairH * 0.42 + 6)}H${r1(cx1)}V${r1(chairY + chairH * 0.8)}H${r1(cx0)}ZM${r1(cx0 - chairW * 0.08)} ${r1(seatY - 8)}H${r1(cx1 + chairW * 0.08)}V${r1(seatY)}H${r1(cx0 - chairW * 0.08)}Z`;
  const lamp = `M${lampX - 34} ${h * 0.2}L${lampX + 34} ${h * 0.2}L${lampX + 20} ${h * 0.14}L${lampX - 20} ${h * 0.14}Z`;
  const tick = screenTick ? Math.max(0, Math.floor(t / screenTick)) : 0;
  const web = textLines(mon.x + 16, mon.y + 38, mon.w - 32, {seed: `${seed}/web${tick}`, n: 3, gap: 16});
  const plant = crown(w * 0.8, h + fr - 46, 38, 30, {seed: `${seed}/pl`, bumps: 7});
  return (
    <>
      {/* frame band + interior (the band and the floor melt away with the screen size) */}
      {fr2 > 0.5 ? <rect x={-fr2} y={-fr2} width={w + fr2 * 2} height={h + fr2 * 2} fill={frameC} /> : null}
      <rect x={0} y={0} width={w} height={h} fill={room} />
      {sh.floor !== null ? <rect x={0} y={h * sh.floor} width={w} height={h * (1 - sh.floor)} fill={roomDark} /> : null}
      {on && full ? <Glow cx={lampX} cy={h * 0.21} r={30} rings={3} spread={2.6} color={palette.cream} opacity={0.32} /> : null}
      {full ? <path d={`M${lampX} 0L${lampX} ${h * 0.14}`} stroke={palette.ink} strokeWidth={2.2} /> : null}
      {full ? <path d={lamp} fill={on ? palette.cream : ambient(palette.teal, p)} /> : null}
      {/* desk + monitor (the website) */}
      {desk && deskOn ? (
        <>
          <rect x={w * 0.22} y={deskY - 8} width={w * 0.78} height={16} fill={on ? palette.brown : palette.teal} />
          <rect x={mon.x} y={mon.y} width={mon.w} height={mon.h} fill={palette.ink} />
          <rect x={mon.x + 7} y={mon.y + 7} width={mon.w - 14} height={mon.h - 14} fill={scrOn ? (screenTick && tick % 2 ? palette.mintPale : palette.white) : ambient(palette.tealDark, p)} />
          {scrOn ? <rect x={mon.x + 7} y={mon.y + 7} width={mon.w - 14} height={16} fill={palette.sage} /> : null}
          {scrOn && screenTick ? (() => {
            // a new page every tick: an image block jumps to a new place / colour (a visible pop)
            const pr = rng(`wc/${seed}/pg${tick}`);
            const bw = (mon.w - 14) * pr.range(0.35, 0.5);
            const bh = (mon.h - 30) * pr.range(0.45, 0.8);
            const bx = mon.x + 7 + pr.range(0, mon.w - 14 - bw);
            return <rect x={bx} y={mon.y + 25} width={bw} height={bh} fill={pr.pick([palette.peach, palette.sky, palette.sand])} />;
          })() : null}
          {scrOn ? <path d={web} fill="none" stroke={palette.ink} strokeWidth={2} strokeLinecap="round" /> : null}
          <path d={`M${mon.x + mon.w / 2} ${mon.y + mon.h}L${mon.x + mon.w / 2} ${deskY - 8}`} stroke={palette.ink} strokeWidth={6} />
        </>
      ) : null}
      {/* the person (back view) on a chair seen from behind (ref 2 f_33: white back + ink) */}
      {personOn ? person : null}
      {showChair ? (
        <>
          <path d={chairFill} fill={on ? palette.cream : palette.sage} transform="translate(3 2)" />
          <path d={chairInk} fill="none" stroke={palette.ink} strokeWidth={stroke.ink} strokeLinecap="round" />
        </>
      ) : null}
      {/* curtain, transom bar, plant, glints */}
      {curtain ? <path d={curtain} fill={on ? rcol.curtain : lit ? ambient(palette.tan, p) : curtainDark} transform={curtainRight ? `translate(${w + mis} ${mis}) scale(-1 1)` : mis ? `translate(${mis} ${mis})` : undefined} /> : null}
      {full ? <path d={`M${w * 0.06} 6Q${w * 0.08} ${h * 0.4} ${w * 0.05} ${h * 0.7}M${w * 0.11} 6Q${w * 0.14} ${h * 0.4} ${w * 0.09} ${h * 0.71}`} fill="none" stroke={palette.ink} strokeWidth={2} strokeLinecap="round" /> : null}
      {sh.transom ? <rect x={0} y={h * sh.transom[0]} width={w} height={h * (sh.transom[1] - sh.transom[0])} fill={on ? rcol.transom : lit ? frameC : curtainDark} /> : null}
      {plantOn && chairOn ? <rect x={w * 0.68} y={h + fr - 44} width={58} height={44} fill={on ? palette.brown : palette.tealDark} /> : null}
      {plantOn && chairOn ? <path d={plant} fill={on ? palette.sage : palette.teal} transform="translate(3 2)" /> : null}
      {plantOn && chairOn ? <Ink d={plant} width={stroke.ink} exit={false} /> : null}
      {full ? <path d={glint(w * 0.12, h * 0.26, 70, {seed: `${seed}/g`})} stroke={on ? palette.white : ambient(palette.sage, p)} strokeWidth={4} strokeLinecap="round" /> : null}
      {deskOn ? <Ink d={ink + tr} width={stroke.ink} exit={false} /> : null}
    </>
  );
};
