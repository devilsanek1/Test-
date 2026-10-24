// cine/props.tsx — foreground framing pieces for full-bleed shots: a rooftop Ledge (parapet) to sit the mascot
// and back-view figures on, a stone Balustrade end / Plinth to perch on, a WindowCloseup (one window up close), and
// foreground wipes: something passes close to the lens and the cut rides on its edge.
//
//   <Ledge y={1460} tod="dusk" at={0.1} />                       // parapet across the frame, cropped by its edges
//   <WipeCut at={5.6} dur={0.55} dir="right" kind="column" tod="dusk" a={<Shot ...>} b={<Shot ...>} />
//   <WipePass at={5.6} dur={0.55} dir="right" kind="figure" />   // the element alone (screen space)

import React from 'react';
import {palette, stroke} from '../theme';
import {ease as E, prog, useTime} from '../time';
import {Ink} from '../Ink';
import {crown, glint, hline, line, rect, textLines, wallTicks} from '../sketch';
import {rng, Seed} from '../rng';
import {ambient, Tod, TodPalette, todPal} from './atmosphere';
import {darker} from './city';
import {Glow} from './light';
import {PathBuf, r1} from './util';
import {ExitShrink, exitScale, inkOn, lookPaint, useCineState} from './state';
import {FigureWiper, FoliageWiper, PoleWiper} from '../Film';
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
  tod?: Tod | TodPalette;
  color?: string;
  /** Draw-on start (ink), fills pop a beat later. Omit = built. */
  at?: number;
  seed?: Seed;
  width?: number;
  /** Floor colour below the face (the roof we stand on). */
  floor?: string;
};

/** A rooftop parapet seen from behind and slightly above: lit top surface, shaded front face, inked edges that
 *  overshoot past the frame, brick ticks. Everything below it is the roof floor. */
export const Ledge: React.FC<LedgeProps> = ({y, x0 = -60, x1 = 1140, top = 30, face = 110, tod = 'day', color, at, seed = 'ledge', width = stroke.inkBold, floor}) => {
  const S = useCineState();
  const t = S.t;
  const p = todPal(tod);
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
  const ticks = wallTicks(x0 + 80, y + top + 22, x1 - x0 - 160, face - 40, {seed: `${seed}/t`, n: 7, size: 26});
  return (
    <>
      {fp > 0 && S.look.fills !== 'none' ? (
        <g transform={fp < 1 ? `translate(0 ${r1(y + top + face)}) scale(1 ${fp.toFixed(4)}) translate(0 ${r1(-(y + top + face))})` : undefined}>
          <rect x={x0 - 400} y={y + top + face} width={x1 - x0 + 800} height={1400} fill={P(floorC)} />
          <rect x={x0 - 400} y={y + top} width={x1 - x0 + 800} height={face} fill={P(shadeC)} />
          <rect x={x0 - 400} y={y + 3} width={x1 - x0 + 800} height={top} fill={P(c)} />
        </g>
      ) : null}
      <Ink d={ink} at={at} width={width} />
      <Ink d={ticks} at={at === undefined ? undefined : at + 0.3} width={stroke.ink} order="all" />
    </>
  );
};

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
  tod?: Tod | TodPalette;
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

/** Half-width of each wiper (the edge travels from -half to W + half). */
const WIPE_HALF: Record<WipeKind, number> = {column: 230, passer: 660, figure: 660, pole: 120, foliage: 460, slab: 760};

/** Outline of the 'passer' wiper (a giant back-view head + shoulders right at the lens) centred on x, screen px. The
 *  same path makes the caption tone region over it (export for tools). */
export function passerPath(x: number): string {
  const hr = 330;
  const hy = 300;
  return (
    `M${x - hr} ${hy}a${hr} ${hr} 0 1 0 ${2 * hr} 0a${hr} ${hr} 0 1 0 ${-2 * hr} 0Z` +
    `M${x - 215} 540H${x + 215}V720H${x - 215}Z` +
    `M${x - 660} 1990L${x - 660} 1060Q${x - 640} 690 ${x - 230} 640L${x + 230} 640Q${x + 640} 690 ${x + 660} 1060L${x + 660} 1990Z`
  );
}

/** A passer-by right in front of the lens: fill-only silhouette (back view), a peach rim on the leading side. */
export const PasserWiper: React.FC<{x: number; p: number; dir: 'left' | 'right'; color?: string; rim?: string}> = ({x, p, dir, color = palette.tealDark, rim = palette.peach}) => {
  const bob = Math.abs(Math.sin(p * Math.PI * 3)) * 10;
  const d = passerPath(x);
  const lead = dir === 'right' ? 7 : -7;
  const ink = line(x - 660, 1060, x - 660, 1990, {seed: 'pw/l', over: [0, 0], breaks: false}) + line(x + 660, 1060, x + 660, 1990, {seed: 'pw/r', over: [0, 0], breaks: false});
  return (
    <g transform={bob ? `translate(0 ${r1(-bob)})` : undefined}>
      <path d={d} fill={rim} transform={`translate(${lead} -4)`} />
      <path d={d} fill={color} />
      {/* hair: a darker cap of the head (back view), ears as small bumps */}
      <path d={`M${r1(x - 315)} 399A330 330 0 1 1 ${r1(x + 315)} 399Q${x} 470 ${r1(x - 315)} 399Z`} fill={palette.ink} />
      <path d={`M${x - 330} 300a330 330 0 1 1 660 0`} fill="none" stroke={palette.ink} strokeWidth={stroke.inkBold + 1} strokeLinecap="round" />
      <path d={`M${x - 660} 1060Q${x - 640} 690 ${x - 230} 640M${x + 230} 640Q${x + 640} 690 ${x + 660} 1060M${x - 300} 760Q${x} 880 ${x + 300} 760`} fill="none" stroke={palette.ink} strokeWidth={stroke.inkBold + 1} strokeLinecap="round" />
      <path d={ink} fill="none" stroke={palette.ink} strokeWidth={stroke.inkBold + 1} strokeLinecap="round" />
    </g>
  );
};

/** Screen x of the wipe edge at time t, or null outside the pass. The edge eases in-out across the frame. */
export function wipeEdge(t: number, at: number, dur: number, dir: 'left' | 'right', kind: WipeKind = 'column'): {x: number; p: number} | null {
  const p = prog(t, at, dur);
  if (p <= 0 || p >= 1) return null;
  const half = WIPE_HALF[kind];
  const x = -half - 30 + (1080 + 2 * half + 60) * E.inOutSine(p);
  return {x: dir === 'right' ? x : 1080 - x, p};
}

/** A near-lens stone column: shaft with fill-only flutes, capital and base mouldings in doubled ink, a lit rim on the
 *  leading side. Screen px, centred on x. */
export const ColumnWiper: React.FC<{x: number; p: number; dir: 'left' | 'right'; color?: string; rim?: string; light?: string}> = ({x, dir, color = palette.tealDark, rim = palette.peach, light = palette.teal}) => {
  const w = 300;
  const L = x - w / 2;
  const lead = dir === 'right' ? 1 : -1;
  const fl = new PathBuf();
  for (const f of [0.2, 0.42, 0.64]) fl.rect(L + w * f, 210, w * 0.08, 1560);
  const capW = 400;
  const ink =
    line(L, 170, L, 1820, {seed: 'cw/l', over: [0, 0], breaks: false}) +
    line(L + w, 170, L + w, 1820, {seed: 'cw/r', over: [0, 0], breaks: false}) +
    line(x - capW / 2 - 10, 110, x + capW / 2 + 10, 110, {seed: 'cw/c1', over: [6, 12], breaks: false}) +
    line(x - capW / 2, 128, x + capW / 2, 128, {seed: 'cw/c2', over: [4, 8], breaks: false}) +
    line(x - capW / 2 + 20, 190, x + capW / 2 - 20, 190, {seed: 'cw/c3', over: [4, 8], breaks: false}) +
    line(x - capW / 2 + 20, 1830, x + capW / 2 - 20, 1830, {seed: 'cw/b1', over: [4, 8], breaks: false}) +
    line(x - capW / 2, 1852, x + capW / 2, 1852, {seed: 'cw/b2', over: [6, 12], breaks: false});
  const rx = lead > 0 ? L + w - 12 : L;
  return (
    <>
      <rect x={L} y={-60} width={w} height={2040} fill={color} />
      <path d={fl.d} fill={light} />
      <rect x={x - capW / 2} y={110} width={capW} height={80} fill={color} />
      <rect x={x - capW / 2} y={1830} width={capW} height={150} fill={color} />
      <rect x={rx} y={190} width={12} height={1640} fill={rim} />
      <rect x={lead > 0 ? x + capW / 2 - 14 : x - capW / 2} y={128} width={14} height={62} fill={rim} />
      <path d={ink} fill="none" stroke={palette.ink} strokeWidth={stroke.inkBold + 1} strokeLinecap="round" />
    </>
  );
};

/** The element passing the lens (screen space, outside any Layer). Use WipeCut to also split the two shots on its edge. */
export const WipePass: React.FC<WipePassProps> = ({at, dur = 0.55, dir = 'right', kind = 'column', tod = 'dusk', color, rim, grow = 0.08, children, seed = 'wipe'}) => {
  const t = useTime();
  const P = todPal(tod);
  const E0 = wipeEdge(t, at, dur, dir, kind);
  if (!E0) return null;
  const {x, p} = E0;
  const body = color ?? palette.tealDark;
  const rimC = rim ?? (P.rim === palette.white ? palette.cream : P.rim);
  let el: React.ReactNode;
  if (children) el = children(x, p);
  else if (kind === 'passer') el = <PasserWiper x={x} p={p} dir={dir} color={body} rim={rimC} />;
  else if (kind === 'figure') el = <FigureWiper x={x} p={p} dir={dir} color={body} />;
  else if (kind === 'pole') el = <PoleWiper x={x} p={p} dir={dir} color={body} />;
  else if (kind === 'foliage') el = <FoliageWiper x={x} p={p} dir={dir} color={color ?? palette.teal} />;
  else if (kind === 'slab') {
    const half = WIPE_HALF.slab;
    el = (
      <>
        <rect x={x - half} y={-60} width={half * 2} height={2040} fill={body} />
        <rect x={dir === 'right' ? x + half - 26 : x - half} y={-60} width={26} height={2040} fill={rimC} />
        <path d={line(dir === 'right' ? x + half : x - half, -60, dir === 'right' ? x + half : x - half, 1980, {seed: `${seed}/e`, over: [0, 0]})} fill="none" stroke={palette.ink} strokeWidth={9} strokeLinecap="round" />
      </>
    );
  } else el = <ColumnWiper x={x} p={p} dir={dir} color={body} rim={rimC} />;
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
export const Plinth: React.FC<{x: number; y: number; w?: number; h?: number; tod?: Tod | TodPalette; seed?: Seed; width?: number}> = ({x, y, w = 260, h = 420, tod = 'day', seed = 'plinth', width = stroke.inkBold}) => (
  <ExitShrink x={x} y={y + h} axis="y" size={0.2}>
    <PlinthBody x={x} y={y} w={w} h={h} tod={tod} seed={seed} width={width} />
  </ExitShrink>
);

const PlinthBody: React.FC<{x: number; y: number; w: number; h: number; tod: Tod | TodPalette; seed: Seed; width: number}> = ({x, y, w, h, tod, seed, width}) => {
  const S = useCineState();
  const p = todPal(tod);
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
  tod?: Tod | TodPalette;
  /** A lit edge strip on this side (backlight from the sun). */
  rim?: 'left' | 'right' | 'none';
  width?: number;
  seed?: Seed;
};

/** A stone balustrade end: a pedestal with cap and base mouldings (doubled ink), a rail running off the frame edge on
 *  short vase balusters. Foreground framing to perch the mascot on in a civic / monumental shot. */
export const Balustrade: React.FC<BalustradeProps> = (props) => (
  <ExitShrink x={props.x + (props.w ?? 220) / 2} y={props.y + (props.h ?? 900)} axis="y" size={0.25}>
    <BalustradeBody {...props} />
  </ExitShrink>
);

const BalustradeBody: React.FC<BalustradeProps> = ({x, y, w = 220, h = 900, side = 'right', tod = 'day', rim = 'none', width = stroke.inkBold, seed = 'bal'}) => {
  const S = useCineState();
  const p = todPal(tod);
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
  tod?: Tod | TodPalette;
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
};

/** One lit window up close: frame, transom, curtain, pendant lamp with a stepped glow, a desk with a monitor showing
 *  a web page, a plant on the sill, glints. Local origin = top-left of the glass. */
export const WindowCloseup: React.FC<WindowCloseupProps> = (props) => (
  <ExitShrink x={(props.w ?? 420) / 2} y={(props.h ?? 760) / 2} size={0.15}>
    <WindowCloseupBody {...props} />
  </ExitShrink>
);

const WindowCloseupBody: React.FC<WindowCloseupProps> = ({w = 420, h = 760, tod = 'night', offAt, screenOffAt, seed = 'wc', person, lit: lit0 = true, chair, desk = true, screenTick, onAt, curtainAt, flickerAt}) => {
  const t = useTime();
  const p = todPal(tod);
  const flick = (flickerAt ?? []).some((f) => t >= f && t < f + 0.07);
  const lit = lit0 && (onAt === undefined || t >= onAt) && !flick;
  const on = lit && (offAt === undefined || t < offAt);
  const scrOn = lit && t < (screenOffAt ?? (offAt === undefined ? Infinity : offAt + 0.35));
  const showChair = chair ?? !!person;
  const rr = rng(`wc/${seed}`);
  const curtainRight = !lit && rr.chance(0.5);
  const plantOn = lit || rr.chance(0.6);
  const fr = 22;
  const room = on ? palette.peach : ambient(palette.tealDark, p);
  const roomDark = on ? palette.tan : ambient(darker(palette.tealDark), p);
  const lampX = w * 0.64;
  const deskY = h * 0.6;
  const mon = {x: w * 0.47, y: h * 0.42, w: w * 0.36, h: h * 0.15};
  // an unlit window keeps the cool night values (frame sage, curtain teal): captions can sit on it
  const frameC = on || lit ? palette.cream : palette.sage;
  const ink = rect(-fr, -fr, w + fr * 2, h + fr * 2, {seed: `${seed}/o`, over: 'medium'}) + rect(0, 0, w, h, {seed: `${seed}/i`, over: 'small'}) + hline(-fr - 30, w + fr + 30, h + fr + 14, {seed: `${seed}/s`, over: [20, 30]}) + hline(-fr - 24, w + fr + 24, h + fr + 30, {seed: `${seed}/s2`, over: [10, 20]});
  const tr = hline(0, w, h * 0.3, {seed: `${seed}/tr`, over: [2, 4]}) + hline(0, w, h * 0.3 + 14, {seed: `${seed}/tr2`, over: [2, 4]});
  const curtainW = curtainAt !== undefined && t >= curtainAt ? 0.86 : lit ? 0.17 : rr.range(0.3, 0.46);
  const curtain = `M0 0L${w * curtainW} 0Q${w * (curtainW + 0.03)} ${h * 0.4} ${w * (curtainW - 0.04)} ${h * 0.72}L0 ${h * 0.74}Z`;
  const chairX = w * 0.3;
  const chairW = w * 0.3;
  const chairY = h * 0.8;
  const chairH = h * 0.12;
  const chairInk = rect(chairX - chairW / 2, chairY, chairW, chairH, {seed: `${seed}/ch`, over: 'small'}) + `M${chairX - chairW * 0.36} ${chairY + chairH}L${chairX - chairW * 0.36} ${h}M${chairX + chairW * 0.36} ${chairY + chairH}L${chairX + chairW * 0.36} ${h}`;
  const lamp = `M${lampX - 34} ${h * 0.2}L${lampX + 34} ${h * 0.2}L${lampX + 20} ${h * 0.14}L${lampX - 20} ${h * 0.14}Z`;
  const tick = screenTick ? Math.max(0, Math.floor(t / screenTick)) : 0;
  const web = textLines(mon.x + 16, mon.y + 38, mon.w - 32, {seed: `${seed}/web${tick}`, n: 3, gap: 16});
  const plant = crown(w * 0.8, h + fr - 46, 38, 30, {seed: `${seed}/pl`, bumps: 7});
  return (
    <>
      {/* frame band + interior */}
      <rect x={-fr} y={-fr} width={w + fr * 2} height={h + fr * 2} fill={frameC} />
      <rect x={0} y={0} width={w} height={h} fill={room} />
      <rect x={0} y={deskY} width={w} height={h - deskY} fill={roomDark} />
      {on ? <Glow cx={lampX} cy={h * 0.21} r={30} rings={3} spread={2.6} color={palette.cream} opacity={0.32} /> : null}
      <path d={`M${lampX} 0L${lampX} ${h * 0.14}`} stroke={palette.ink} strokeWidth={2.2} />
      <path d={lamp} fill={on ? palette.cream : ambient(palette.teal, p)} />
      {/* desk + monitor (the website) */}
      {desk ? (
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
      {person}
      {showChair ? (
        <>
          <rect x={chairX - chairW / 2 + 3} y={chairY + 2} width={chairW} height={chairH} fill={on ? palette.white : palette.sage} />
          <path d={chairInk} fill="none" stroke={palette.ink} strokeWidth={stroke.ink} strokeLinecap="round" />
        </>
      ) : null}
      {/* curtain, transom bar, plant, glints */}
      <path d={curtain} fill={on ? palette.sand : lit ? ambient(palette.tan, p) : palette.teal} transform={curtainRight ? `translate(${w + 2} 2) scale(-1 1)` : 'translate(2 2)'} />
      <path d={`M${w * 0.06} 6Q${w * 0.08} ${h * 0.4} ${w * 0.05} ${h * 0.7}M${w * 0.11} 6Q${w * 0.14} ${h * 0.4} ${w * 0.09} ${h * 0.71}`} fill="none" stroke={palette.ink} strokeWidth={2} strokeLinecap="round" />
      <rect x={0} y={h * 0.3} width={w} height={14} fill={frameC} />
      {plantOn ? <rect x={w * 0.68} y={h + fr - 44} width={58} height={44} fill={on ? palette.brown : palette.tealDark} /> : null}
      {plantOn ? <path d={plant} fill={on ? palette.sage : palette.teal} transform="translate(3 2)" /> : null}
      {plantOn ? <Ink d={plant} width={stroke.ink} exit={false} /> : null}
      <path d={glint(w * 0.12, h * 0.26, 70, {seed: `${seed}/g`})} stroke={on ? palette.white : ambient(palette.sage, p)} strokeWidth={4} strokeLinecap="round" />
      <Ink d={ink + tr} width={stroke.ink} exit={false} />
    </>
  );
};
