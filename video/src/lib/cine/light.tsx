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
//   <FlatColor color={palette.peach}> ... </FlatColor>                           // recolour every fill + stroke

import React, {useId, useMemo} from 'react';
import {Ease, ease as E, lerp, osc, prog, useTime} from '../time';
import {Sun, SunMove, SunProps} from '../Sun';
import type {Pt} from '../sketch';
import {TodLike, TodPalette, useTodPal} from './atmosphere';
import {mix, PathBuf, r1} from './util';
import {palette} from '../theme';
import {CineState, exitScale, isPaper, useCineState} from './state';

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
  const S = useCineState();
  const t = S.t;
  if (at !== undefined && t < at) return null;
  if (S.look.fills !== 'color') return null; // light only exists in the coloured state
  const ex = exitScale(S.e, 0.2, 0.05);
  if (ex <= 0) return null;
  const b = (breathe ? 1 + breathe * osc(t, 0.23, cx * 0.01) : 1) * ex;
  const out: React.ReactNode[] = [];
  for (let i = rings - 1; i >= 0; i--) {
    const k = at === undefined ? 1 : E.outBack(1.6)(prog(t, at + i * 0.05, 0.22));
    const rr = r * (1 + (spread * (i + 1)) / rings) * b * k;
    if (rr > 0.3) out.push(<circle key={i} cx={cx} cy={cy} r={r1(rr)} fill={color} opacity={opacity} />);
  }
  if (core) out.push(<circle key="core" cx={cx} cy={cy} r={r1(r * ex)} fill={core} />);
  return <>{out}</>;
};

// ---------------------------------------------------------------- BigSun

export type SunKey = {t: number; x?: number; y?: number; r?: number; ease?: Ease};

export type BigSunProps = Omit<SunProps, 'children'> & {
  tod?: TodLike | TodPalette;
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
  /** Idle bob: amplitude px (default 0) at `bobHz` (default 0.22): a slow float, never perfectly still. */
  bob?: number;
  bobHz?: number;
  children?: React.ReactNode | ((r: number) => React.ReactNode);
};

/** BigSun's default idle drift (px/s): ENGINE rule 6 (>= 10 px/s or a bob). It SETS (sinks) at every time of day but
 *  dawn, where it rises; a little sideways. */
export const sunDrift = (tod: TodLike): [number, number] => (tod === 'dawn' ? [3, -9.5] : [3, 9.5]);

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
 *  every behaviour (they ride on a second, invisible Sun). Default `drift` sunDrift(tod) = ~10 px/s, sinking (setting):
 *  never perfectly still (ENGINE rule 6). Pass [0, 0] to pin it (a match-cut frame) and use `bob` for a float instead.
 *  Inter-shot handoffs: start the next shot's sun where the last one left it and `hops` it to its new place (squash /
 *  stretch / landing squash, landing on a stressed word) once the wiper has passed. */
export const BigSun: React.FC<BigSunProps> = ({
  cx = 540,
  cy = 1000,
  r = 150,
  tod,
  path,
  breathe = 0.008,
  glow = 2,
  glowMode = 'rings',
  glowSpread = 0.9,
  glowColor,
  glowOpacity = 0.14,
  color,
  moves: extra = [],
  drift: driftIn,
  bob = 0,
  bobHz = 0.22,
  children,
  ...sunProps
}) => {
  const p = useTodPal(tod);
  const t = useTime();
  const drift = driftIn ?? sunDrift(p.name);
  const x0 = path?.[0]?.x ?? cx;
  const y0 = path?.[0]?.y ?? cy;
  const r0 = path?.[0]?.r ?? r;
  const moves = [...(path ? pathMoves(path) : []), ...extra];
  const common = {cx: x0, cy: y0, r: r0, moves, breathe, drift, ...sunProps};
  const by = bob ? Math.sin(t * bobHz * 6.2832) * bob : 0;
  // the bob moves the disc, not the horizon it sets behind
  if (by && sunProps.horizon !== undefined) (common as {horizon?: number}).horizon = sunProps.horizon - by;
  const body = (
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
  return by ? <g transform={`translate(0 ${by.toFixed(2)})`}>{body}</g> : body;
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
  const S = useCineState();
  const t = S.t;
  if (at !== undefined && t < at) return null;
  if (S.look.fills !== 'color') return null;
  const ex = exitScale(S.e, 0.1, 0.3); // the beam retracts into its source
  if (ex <= 0) return null;
  const a = ((angle + (sweep ? sweep * osc(t, sweepHz, seed) : 0)) * Math.PI) / 180;
  const L = ex * length * (at === undefined ? 1 : E.outCubic(prog(t, at, 0.35)));
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

/** One-sided lighter edge strip (flat): the sun-facing side of a building, a figure's shoulder, a column. Light: it
 *  exists only in the coloured Look (paper / before the cascade wave: no rim) and thins out first in an un-build. */
export const RimLight: React.FC<RimLightProps> = ({rect, side = 'right', points, light = 0, width = 6, color, opacity}) => {
  const S = useCineState();
  const ex = exitScale(S.e, 0.2, 0.05);
  const w = Math.round(width * ex * 4) / 4;
  const anchor: Pt | undefined = rect ? [rect[0] + rect[2] / 2, rect[1] + rect[3] / 2] : points?.[0];
  const off = paperState(S, anchor) || w <= 0.25;
  const d = useMemo(() => {
    if (off) return '';
    if (rect) {
      const [x, y, rw, h] = rect;
      const pb = new PathBuf();
      if (side === 'right') pb.rect(x + rw - w, y, w, h);
      if (side === 'left') pb.rect(x, y, w, h);
      if (side === 'top') pb.rect(x, y, rw, w);
      if (side === 'bottom') pb.rect(x, y + h - w, rw, w);
      return pb.d;
    }
    return points ? rimPath(points, light, w) : '';
  }, [off, rect?.join(), side, points, light, w]);
  return d ? <path d={d} fill={color} opacity={opacity} /> : null;
};

/** true when light / flat-colour treatments must step aside: the paper Look, fills 'none', or the cascade wave has not
 *  reached `p` yet (layer coords; without a point: until the cascade starts). Then silhouettes and rims render their
 *  children NORMALLY (white fills + ink in paper), so frame 0 / the loop frame is line art, not dark blobs. */
export function paperState(S: CineState, p?: Pt): boolean {
  const L = S.look;
  if (L.fills !== 'color') return true;
  if (!L.cascade) return false;
  return p ? isPaper(S, p) : S.t < L.cascade.at;
}

// ---------------------------------------------------------------- Silhouette

export type SilhouetteProps = {
  color: string;
  /** A path to fill directly (cheapest). */
  d?: string;
  /** Or: children drawn fill-only in `color` (any kit element: every fill and stroke is recoloured, see FlatColor). */
  children?: React.ReactNode;
  /** @deprecated ignored (silhouettes no longer use an alpha mask, so there is no mask region to size). */
  bounds?: [number, number, number, number];
  opacity?: number;
};

/** @deprecated kept for old imports; silhouettes no longer use masks. */
export const SIL_BOUNDS: [number, number, number, number] = [-400, -400, 1880, 2720];

/** Recolour EVERY fill and stroke of the children to one flat colour (no offscreen raster, no mask): a scoped CSS rule
 *  on a class overrides the presentation attributes of everything inside ([fill] / [stroke] that are not "none").
 *  This is how cine makes silhouettes and rim copies of any kit element (Person, the mascot, a Building). */
export const FlatColor: React.FC<{color: string; opacity?: number; at?: Pt; children?: React.ReactNode}> = ({color, opacity, at, children}) => {
  const id = 'fc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const S = useCineState();
  // paper Look / before the cascade reaches it: the children draw themselves (white fills + ink), no recolour
  if (paperState(S, at)) return <>{children}</>;
  const css = `.${id} [fill]:not([fill="none"]){fill:${color}!important}.${id} [stroke]:not([stroke="none"]){stroke:${color}!important}`;
  return (
    <g className={id} opacity={opacity}>
      <style>{css}</style>
      {children}
    </g>
  );
};

/** Fill-only flat shape of a path or of any children (a FlatColor copy: exact, fast, no mask tiling). In the paper
 *  Look (or before the cascade reaches `at`) the children render normally; a bare `d` gets a white fill + hairline. */
export const Silhouette: React.FC<SilhouetteProps & {at?: Pt}> = ({color, d, children, opacity, at}) => {
  const S = useCineState();
  if (d) {
    if (paperState(S, at)) return S.look.ink ? <path d={d} fill={S.look.fills === 'none' ? 'none' : palette.white} stroke={palette.ink} strokeWidth={1.6} /> : null;
    const k = exitScale(S.e, 0.3, 0.2);
    if (k <= 0) return null;
    return <path d={d} fill={color} opacity={opacity} />;
  }
  return (
    <FlatColor color={color} opacity={opacity} at={at}>
      {children}
    </FlatColor>
  );
};

/** Rim-light any element: a flat copy of the children in `color`, offset toward the light by (dx, dy), drawn behind
 *  them, so a lighter sliver (3-5 px) shows along the lit edges (backlit figures, the mascot on a ledge).
 *  `silhouette` also draws the element itself fill-only (a backlit figure against the sun). */
export const Rimmed: React.FC<{color: string; dx?: number; dy?: number; silhouette?: string; at?: Pt; bounds?: [number, number, number, number]; children?: React.ReactNode}> = ({color, dx = 4, dy = -3, silhouette, at, children}) => {
  const S = useCineState();
  // light only exists in colour: in paper / before the cascade the element draws itself (no rim copy, no silhouette)
  if (paperState(S, at)) return <>{children}</>;
  return (
    <>
      <g transform={`translate(${dx} ${dy})`}>
        <FlatColor color={color}>{children}</FlatColor>
      </g>
      {silhouette ? <FlatColor color={silhouette}>{children}</FlatColor> : children}
    </>
  );
};
