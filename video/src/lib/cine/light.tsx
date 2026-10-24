// cine/light.tsx — light as drama, in FLAT style: the big low sun, stepped glows, light shafts as translucent flat
// polygons, one-sided rim-light strips, and fill-only silhouettes of anything. Translucency is static (never
// animated); things switch on by popping or wiping, never fading.
//
//   <BigSun cx={600} cy={1010} horizon={1012} tod="dusk" path={[{t: 0, y: 990}, {t: 6, y: 1060}]} pulse={[2.1]} />
//   <Glow cx={300} cy={400} r={6} rings={3} spread={1.6} color={TOD.night.glow} />   // a bulb halo (ref 2 f_38)
//   <LightShaft from={[900, -100]} angle={112} length={2200} w0={60} w1={520} beams={3} sweep={3} />
//   <RimLight rect={[100, 400, 200, 600]} side="right" width={7} color={palette.peach} />
//   <RimLight points={roofPts} light={-60} width={5} color={palette.cream} />
//   <Silhouette color={TOD.dusk.silhouette}> <Person .../> </Silhouette>        // any kit element, fill-only
//   <Silhouette d={path} color="#2F4847" />

import React, {useId, useMemo} from 'react';
import {Ease, ease as E, lerp, osc, prog, useTime} from '../time';
import {Sun, SunMove, SunProps} from '../Sun';
import type {Pt} from '../sketch';
import {Tod, TodPalette, todPal} from './atmosphere';
import {mix, PathBuf, r1} from './util';
import {palette} from '../theme';

// ---------------------------------------------------------------- Glow

export type GlowProps = {
  cx: number;
  cy: number;
  /** Core radius (the lit thing itself). */
  r: number;
  /** Number of stepped halo discs. Default 3. */
  rings?: number;
  /** Outer halo radius = r * (1 + spread). Default 1.4. */
  spread?: number;
  color: string;
  /** Opacity of EACH disc (stacking makes the steps). Default 0.16. */
  opacity?: number;
  /** Also draw the solid core disc in this colour. */
  core?: string;
  /** Slow size breathing (fraction). */
  breathe?: number;
  /** Switch on at this time (rings pop out one by one). */
  at?: number;
};

/** Stepped concentric flat discs (no gradient): each ring is a flat translucent disc; overlaps form the steps. */
export const Glow: React.FC<GlowProps> = ({cx, cy, r, rings = 3, spread = 1.4, color, opacity = 0.16, core, breathe = 0, at}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const b = breathe ? 1 + breathe * osc(t, 0.23, cx * 0.01) : 1;
  const out: React.ReactNode[] = [];
  for (let i = rings - 1; i >= 0; i--) {
    const k = at === undefined ? 1 : E.outBack(1.6)(prog(t, at + i * 0.05, 0.22));
    const rr = r * (1 + (spread * (i + 1)) / rings) * b * k;
    if (rr > 0.3) out.push(<circle key={i} cx={cx} cy={cy} r={r1(rr)} fill={color} opacity={opacity} />);
  }
  if (core) out.push(<circle key="core" cx={cx} cy={cy} r={r} fill={core} />);
  return <>{out}</>;
};

// ---------------------------------------------------------------- BigSun

export type SunKey = {t: number; x?: number; y?: number; r?: number; ease?: Ease};

export type BigSunProps = Omit<SunProps, 'children'> & {
  tod?: Tod | TodPalette;
  /** Set / rise path: keys of position (and radius) over scene time (converted to core Sun moves). */
  path?: SunKey[];
  /** Halo discs behind the disc (0 = none). Default 2. They follow every Sun behaviour (hops, beats). */
  glow?: number;
  /** 'rings' (default, style_bible_ref2 8): OPAQUE flat rings at r x1.25 (sun/peach mix #F19160) and x1.5 (peach), more
   *  rings continue the steps toward the sky. 'stack': translucent discs whose overlaps make the steps. */
  glowMode?: 'rings' | 'stack';
  glowSpread?: number;
  glowColor?: string;
  glowOpacity?: number;
  children?: React.ReactNode | ((r: number) => React.ReactNode);
};

function pathMoves(path: SunKey[]): SunMove[] {
  const out: SunMove[] = [];
  for (let i = 1; i < path.length; i++) out.push({at: path[i - 1].t, dur: path[i].t - path[i - 1].t, x: path[i].x, y: path[i].y, r: path[i].r, ease: path[i].ease ?? E.inOutSine});
  return out;
}

/** Sun centre / radius at time t for a start + moves (mirrors the core Sun's move logic; ignores hops / bounces). */
export function sunState(t: number, cx: number, cy: number, r: number, moves: SunMove[]): {x: number; y: number; r: number} {
  let x = cx;
  let y = cy;
  let rad = r;
  for (const m of moves) {
    const p = prog(t, m.at, m.dur ?? 1, m.ease ?? E.inOutCubic);
    if (p <= 0) break;
    x = lerp(x, m.x ?? x, p);
    y = lerp(y, m.y ?? y, p);
    rad = lerp(rad, m.r ?? rad, p);
  }
  return {x, y, r: rad};
}

/** Stepped halo rings in sun-local coordinates (for a Sun child). */
const SunHalo: React.FC<{r: number; rings: number; spread: number; color: string; opacity: number; mode: 'rings' | 'stack'}> = ({r, rings, spread, color, opacity, mode}) => {
  if (mode === 'rings') {
    // measured proposal: x1.25 in mix(sun, peach) then x1.5 in peach; further rings step toward `color`
    const cols = [mix(palette.sun, palette.peach, 0.5), palette.peach];
    for (let i = 2; i < rings; i++) cols.push(mix(palette.peach, color, Math.min(1, (i - 1) / (rings - 1))));
    return (
      <>
        {cols
          .slice(0, rings)
          .map((c, i) => <circle key={i} cx={0} cy={0} r={r1(r * (1 + 0.25 * (i + 1)))} fill={c} />)
          .reverse()}
      </>
    );
  }
  return (
    <>
      {Array.from({length: rings}, (_, j) => {
        const i = rings - 1 - j;
        return <circle key={i} cx={0} cy={0} r={r1(r * (1 + (spread * (i + 1)) / rings))} fill={color} opacity={opacity} />;
      })}
    </>
  );
};

/** The huge orange disc on the horizon (r 150 by default). Wraps the core <Sun> (beats, bounce, hops, drift, rise,
 *  moves, set behind a horizon line, overlays via children(r)) and adds stepped glow discs behind it that follow
 *  every behaviour (they ride on a second, invisible Sun). */
export const BigSun: React.FC<BigSunProps> = ({
  cx = 540,
  cy = 1000,
  r = 150,
  tod = 'dusk',
  path,
  breathe = 0.008,
  glow = 2,
  glowMode = 'rings',
  glowSpread = 0.9,
  glowColor,
  glowOpacity = 0.14,
  color,
  moves: extra = [],
  children,
  ...sunProps
}) => {
  const p = todPal(tod);
  const x0 = path?.[0]?.x ?? cx;
  const y0 = path?.[0]?.y ?? cy;
  const r0 = path?.[0]?.r ?? r;
  const moves = [...(path ? pathMoves(path) : []), ...extra];
  const common = {cx: x0, cy: y0, r: r0, moves, breathe, ...sunProps};
  return (
    <>
      {glow > 0 ? (
        <Sun {...common} color="none">
          {(rad: number) => <SunHalo r={rad} rings={glow} spread={glowSpread} color={glowColor ?? (glowMode === 'rings' ? p.skyBands[p.skyBands.length - 1] : p.glow)} opacity={glowOpacity} mode={glowMode} />}
        </Sun>
      ) : null}
      <Sun {...common} color={color ?? p.sunColor}>
        {children}
      </Sun>
    </>
  );
};

// ---------------------------------------------------------------- LightShaft

export type LightShaftProps = {
  /** Source point (may be off-screen). */
  from: Pt;
  /** Direction of travel in degrees (0 = right, 90 = down). */
  angle: number;
  length?: number;
  /** Width at the source / at the far end. */
  w0?: number;
  w1?: number;
  /** Number of parallel beams (stripes with gaps), or explicit [offset, widthFraction] pairs (-0.5..0.5). */
  beams?: number | [number, number][];
  color?: string;
  opacity?: number;
  /** Slow sweep amplitude (deg) and rate (Hz). */
  sweep?: number;
  sweepHz?: number;
  /** Switch on: the beam shoots out from the source over 0.35 s. */
  at?: number;
  seed?: number;
};

/** Translucent flat light polygons from a source (cathedral / window / god rays). */
export const LightShaft: React.FC<LightShaftProps> = ({from, angle, length = 2000, w0 = 50, w1 = 500, beams = 1, color = '#FFFFFF', opacity = 0.18, sweep = 0, sweepHz = 0.07, at, seed = 0}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const a = ((angle + (sweep ? sweep * osc(t, sweepHz, seed) : 0)) * Math.PI) / 180;
  const L = length * (at === undefined ? 1 : E.outCubic(prog(t, at, 0.35)));
  const d: Pt = [Math.cos(a), Math.sin(a)];
  const n: Pt = [-d[1], d[0]];
  const list: [number, number][] =
    typeof beams === 'number' ? (beams <= 1 ? [[0, 1]] : Array.from({length: beams}, (_, i) => [-0.5 + (i + 0.5) / beams, (0.62 / beams) * (i % 2 ? 0.7 : 1.15)] as [number, number])) : beams;
  const pb = new PathBuf();
  for (const [o, wf] of list) {
    const e0a = o - wf / 2;
    const e0b = o + wf / 2;
    const P = (k: number, w: number, dist: number): Pt => [from[0] + d[0] * dist + n[0] * k * w, from[1] + d[1] * dist + n[1] * k * w];
    pb.quad(P(e0a, w0, 0), P(e0b, w0, 0), P(e0b, w1, L), P(e0a, w1, L));
  }
  return <path d={pb.d} fill={color} opacity={opacity} />;
};

// ---------------------------------------------------------------- RimLight

/** Strips (quads) along the polygon edges whose outward normal faces the light direction. lightDeg = direction
 *  TO the light (0 = light on the right, -90 = light above). */
export function rimPath(points: Pt[], lightDeg: number, width: number, threshold = 0.25): string {
  const n = points.length;
  if (n < 3) return '';
  let area = 0;
  for (let i = 0; i < n; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[(i + 1) % n];
    area += x0 * y1 - x1 * y0;
  }
  const sgn = area > 0 ? 1 : -1; // y-down: positive area = clockwise on screen
  const la = (lightDeg * Math.PI) / 180;
  const L: Pt = [Math.cos(la), Math.sin(la)];
  const pb = new PathBuf();
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    // outward normal for a clockwise (screen) polygon is (dy, -dx) / len
    const nx = (sgn * dy) / len;
    const ny = (-sgn * dx) / len;
    if (nx * L[0] + ny * L[1] < threshold) continue;
    pb.quad(a, b, [b[0] - nx * width, b[1] - ny * width], [a[0] - nx * width, a[1] - ny * width]);
  }
  return pb.d;
}

export type RimLightProps = {
  /** Rectangle [x, y, w, h] + side, or a polygon + light direction. */
  rect?: [number, number, number, number];
  side?: 'left' | 'right' | 'top' | 'bottom';
  points?: Pt[];
  light?: number;
  width?: number;
  color: string;
  opacity?: number;
};

/** One-sided lighter edge strip (flat): the sun-facing side of a building, a figure's shoulder, a column. */
export const RimLight: React.FC<RimLightProps> = ({rect, side = 'right', points, light = 0, width = 6, color, opacity}) => {
  const d = useMemo(() => {
    if (rect) {
      const [x, y, w, h] = rect;
      const pb = new PathBuf();
      if (side === 'right') pb.rect(x + w - width, y, width, h);
      if (side === 'left') pb.rect(x, y, width, h);
      if (side === 'top') pb.rect(x, y, w, width);
      if (side === 'bottom') pb.rect(x, y + h - width, w, width);
      return pb.d;
    }
    return points ? rimPath(points, light, width) : '';
  }, [rect?.join(), side, points, light, width]);
  return d ? <path d={d} fill={color} opacity={opacity} /> : null;
};

// ---------------------------------------------------------------- Silhouette

export type SilhouetteProps = {
  color: string;
  /** A path to fill directly (cheapest). */
  d?: string;
  /** Or: children whose alpha becomes the silhouette (any kit element). Mask region [x, y, w, h]. */
  children?: React.ReactNode;
  bounds?: [number, number, number, number];
  opacity?: number;
};

/** Default mask region (layer coords): the frame plus a margin. Keep masks under ~4000 px a side (Chrome rasterises
 *  masks as one texture; bigger regions tile and repeat). Pass `bounds` for content far outside the frame. */
export const SIL_BOUNDS: [number, number, number, number] = [-400, -400, 1880, 2720];

/** Fill-only dark shape of a path or of any children (alpha mask: the children's coverage is filled flat). */
export const Silhouette: React.FC<SilhouetteProps> = ({color, d, children, bounds = SIL_BOUNDS, opacity}) => {
  const id = 'sil' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (d) return <path d={d} fill={color} opacity={opacity} />;
  const [x, y, w, h] = bounds;
  return (
    <>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={x} y={y} width={w} height={h} style={{maskType: 'alpha'}}>
          {children}
        </mask>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={color} mask={`url(#${id})`} opacity={opacity} />
    </>
  );
};

/** Rim-light any element: a flat silhouette of the children in `color`, offset toward the light by (dx, dy),
 *  drawn behind them, so a lighter sliver shows along the lit edges (backlit figures, the mascot on a ledge). */
export const Rimmed: React.FC<{color: string; dx?: number; dy?: number; bounds?: [number, number, number, number]; children?: React.ReactNode}> = ({color, dx = 5, dy = -3, bounds, children}) => (
  <>
    <g transform={`translate(${dx} ${dy})`}>
      <Silhouette color={color} bounds={bounds}>
        {children}
      </Silhouette>
    </g>
    {children}
  </>
);
