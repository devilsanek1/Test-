// SiteFacade — S0, the shared building block: a "website" building (every building in Webtown is a website: its MAIN
// window is a browser window). Frontal elevation drawn in parent coordinates; for one-point perspective wrap it in the
// core <Plane quad={wallQuad(...)}> (it is built from Ink / Fill only, so it projects; pass `lod` explicitly there).
//
//   <SiteFacade x={40} y={1230} w={480} storeys={4} fill={palette.sand} browser={[170, 760, 220, 140]}
//     door={[230, 1030, 120, 200]} plaque="new" lock="closed" at={0.2} seed="hero" />
//   const L = siteFacadeLayout(props)   // anchors: top, browser, door, plaque, lock, windows, step
//
// x = left edge, y = base (ground line). Storeys are counted from the ground (storey 0 = the door floor).
// States: `at` popUp (scaleY 0 -> 1.06 -> 1 about the base) | `drawAt` fill-first draw-on (fills pop, then the ink
// draws top -> bottom, 3-6 strokes in flight) | `offAt` lights out (fills one palette step darker, the screen goes
// tealDark) | `lit` night windows (peach; a number = switch-on time, windows pop on in a seeded order over `litSpan`).
// Level of detail (`lod`): 'full' | 'simple' (no window ink) | 'dots' (window dots, no ink) | 'fill' (one block) |
// 'auto' (by on-screen width; not inside a Plane).

import React from 'react';
import {palette} from '../../../lib/theme';
import {useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, polyPath, rect, rectPath} from '../../../lib/sketch';
import {rand, rng, Seed} from '../../../lib/rng';
import {brickHints, cornice, glintAt, LightsOut, paneFill, PopUp, SI, useZoom, windowInk} from './common';
import {ChromeSlot, LockSlot, LockVariant, PlaqueSlot, PlaqueVariant} from './propSlots';

export type FacadeLod = 'full' | 'simple' | 'dots' | 'fill' | 'auto';
export type Rect = [number, number, number, number];

export type SiteFacadeProps = {
  x: number;
  y: number;
  w: number;
  storeys?: number;
  storeyH?: number;
  /** Facade colour (cream / sand / tan / mintPale ...). */
  fill?: string;
  roof?: 'cornice' | 'flat' | 'gable' | 'none';
  /** Flat tan shade plane on the left 25 % (default true). */
  shade?: boolean;
  /** Cream rim strip on the sun side (default 'right'). */
  rim?: 'left' | 'right' | false;
  bricks?: number;
  cols?: number;
  /** The main window as a browser window (absolute rect), 'auto' (upper middle) or false. */
  browser?: Rect | 'auto' | false;
  /** The door (absolute rect), 'auto' or false. */
  door?: Rect | 'auto' | false;
  doorColor?: string;
  plaque?: PlaqueVariant | false;
  lock?: LockVariant | false;
  lod?: FacadeLod;
  /** Main ink width (parent px). */
  ink?: number;
  at?: number;
  drawAt?: number;
  offAt?: number;
  lit?: boolean | number;
  litFraction?: number;
  litSpan?: number;
  chrome?: boolean;
  chromeAt?: number;
  screenOnAt?: number;
  seed?: Seed;
  /** Per-instance overrides of the prop slots (receive the anchor). */
  slots?: {
    browser?: (r: Rect) => React.ReactNode;
    door?: (r: Rect) => React.ReactNode;
    plaque?: (c: [number, number, number]) => React.ReactNode;
    lock?: (c: [number, number, number, number]) => React.ReactNode;
  };
};

export type FacadeLayout = {
  top: number;
  storeyH: number;
  browser: Rect | null;
  door: Rect | null;
  /** plaque centre x, y and size */
  plaque: [number, number, number] | null;
  /** lock centre x, y, w, h */
  lock: [number, number, number, number] | null;
  windows: Rect[];
  /** door step line y (= base) */
  step: number;
};

/** Pure layout of a SiteFacade (anchors for scenes and other sets). */
export function siteFacadeLayout(p: SiteFacadeProps): FacadeLayout {
  const storeys = p.storeys ?? 4;
  const sh = p.storeyH ?? 110;
  const top = p.y - storeys * sh;
  const cols = p.cols ?? Math.max(1, Math.round(p.w / 120));
  const cw = p.w / cols;
  // door
  let door: Rect | null = null;
  if (p.door !== false) {
    if (p.door && p.door !== 'auto') door = p.door;
    else {
      const dw = Math.min(cw * 0.62, sh * 0.62);
      const dh = Math.min(sh * 0.86, dw * 1.9);
      const dc = Math.floor(cols / 2);
      door = [p.x + dc * cw + (cw - dw) / 2, p.y - dh, dw, dh];
    }
  }
  // browser window
  let browser: Rect | null = null;
  if (p.browser !== false) {
    if (p.browser && p.browser !== 'auto') browser = p.browser;
    else {
      const s = Math.max(1, storeys - 2);
      const bw = Math.min(p.w * 0.6, Math.max(cw * 1.5, p.w * 0.42));
      const bh = Math.min(sh * 0.78, bw * 0.66);
      browser = [p.x + (p.w - bw) / 2, p.y - (s + 1) * sh + (sh - bh) * 0.45, bw, bh];
    }
  }
  const plaque: [number, number, number] | null = door && p.plaque !== false ? [door[0] - Math.max(6, door[2] * 0.45), door[1] + door[3] * 0.38, Math.max(4, door[2] * 0.42)] : null;
  const lock: [number, number, number, number] | null = door && p.lock !== false ? [door[0] + door[2] * 0.78, door[1] + door[3] * 0.52, door[2] * 0.2, door[2] * 0.25] : null;
  // ordinary windows: a grid, skipping cells under the browser window and the door
  const windows: Rect[] = [];
  const ww = cw * 0.46;
  const wh = Math.min(sh * 0.56, ww * 1.5);
  for (let s = storeys - 1; s >= 0; s--) {
    for (let c = 0; c < cols; c++) {
      const wx = p.x + c * cw + (cw - ww) / 2;
      const wy = p.y - (s + 1) * sh + (sh - wh) * 0.42;
      const r: Rect = [wx, wy, ww, wh];
      if (s === 0 && door && wx < door[0] + door[2] + 6 && wx + ww > door[0] - 6) continue;
      if (s === 0 && p.plaque !== false && door && wx + ww > door[0] - door[2] && wx < door[0]) continue;
      if (browser && wx < browser[0] + browser[2] + 8 && wx + ww > browser[0] - 8 && wy < browser[1] + browser[3] + 8 && wy + wh > browser[1] - 8) continue;
      windows.push(r);
    }
  }
  return {top, storeyH: sh, browser, door, plaque, lock, windows, step: p.y};
}

const autoLod = (screenW: number): Exclude<FacadeLod, 'auto'> => (screenW >= 150 ? 'full' : screenW >= 60 ? 'simple' : screenW >= 16 ? 'dots' : 'fill');

export const SiteFacade: React.FC<SiteFacadeProps> = (p) => {
  const t = useTime();
  const zoom = useZoom();
  const seed = String(p.seed ?? `sf${Math.round(p.x)},${Math.round(p.y)}`);
  const L = siteFacadeLayout(p);
  const lod = p.lod && p.lod !== 'auto' ? p.lod : autoLod(p.w * zoom);
  const fill = p.fill ?? palette.cream;
  const W = p.ink ?? SI.mid;
  const {x, y, w} = p;
  const H = y - L.top;
  const r = rng(`sf/${seed}`);
  const drawAt = p.drawAt;
  const fillAt = drawAt; // fill-first: fills snap at drawAt, ink follows
  const inkAt = drawAt !== undefined ? drawAt + 0.12 : undefined;

  // ---- fills
  const fills: React.ReactNode[] = [];
  const roofH = p.roof === 'gable' ? Math.min(w * 0.32, 80) : 0;
  const body = p.roof === 'gable' ? polyPath([[x, y], [x, L.top], [x + w / 2, L.top - roofH], [x + w, L.top], [x + w, y]]) : rectPath(x, L.top, w, H);
  fills.push(<Fill key="body" d={body} color={fill} at={fillAt} mode="snap" seed={`${seed}/b`} />);
  if (lod === 'fill') {
    return wrap(p, <LightsOut at={p.offAt}>{fills}</LightsOut>);
  }
  if (p.shade !== false) fills.push(<Fill key="shade" rect={[x, L.top, w * 0.25, H]} color={shadeOf(fill)} at={fillAt} mode="snap" offset={false} seed={`${seed}/sh`} />);
  if (p.rim !== false) {
    const rw = Math.max(1.5, Math.min(9, w * 0.03));
    fills.push(<Fill key="rim" rect={[(p.rim ?? 'right') === 'right' ? x + w - rw : x, L.top, rw, H]} color={rimOf(fill)} at={fillAt} mode="snap" offset={false} seed={`${seed}/rim`} />);
  }
  if (p.roof === 'cornice' || p.roof === undefined) {
    const bh = Math.max(3, Math.min(16, H * 0.035));
    fills.push(<Fill key="cb" rect={[x - 4, L.top - bh, w + 8, bh]} color={palette.tan} at={fillAt} mode="snap" offset={false} seed={`${seed}/cb`} />);
  }
  // windows: glass partial fills (merged), night lights
  const litOn = p.lit === true || (typeof p.lit === 'number' && t >= p.lit);
  let glass = '';
  let curtain = '';
  let lit = '';
  L.windows.forEach((q, i) => {
    const k = rand(seed, `w${i}`);
    const on = litOn && k < (p.litFraction ?? 0.6) && (typeof p.lit !== 'number' || t >= p.lit + rand(seed, `wt${i}`) * (p.litSpan ?? 0.6));
    if (on) lit += rectPath(q[0], q[1], q[2], q[3]);
    else if (lod === 'dots') glass += rectPath(q[0], q[1], q[2], q[3]);
    else if (k > 0.8) curtain += paneFill(q[0], q[1], q[2], q[3], `${seed}/c${i}`);
    else glass += paneFill(q[0], q[1], q[2], q[3], `${seed}/g${i}`);
  });
  if (glass) fills.push(<Fill key="glass" d={glass} color={lod === 'dots' ? palette.tealDark : palette.sage} at={fillAt} mode="snap" seed={`${seed}/gl`} />);
  if (curtain) fills.push(<Fill key="cur" d={curtain} color={palette.sand} at={fillAt} mode="snap" seed={`${seed}/cu`} />);
  if (lit) fills.push(<Fill key="lit" d={lit} color={palette.peach} mode="snap" seed={`${seed}/lit`} />);
  // door
  const doorNode = L.door ? (p.slots?.door ? p.slots.door(L.door) : <FacadeDoor r={L.door} color={p.doorColor} lod={lod} seed={`${seed}/door`} at={fillAt} inkAt={inkAt} width={W} />) : null;

  // ---- ink (top -> bottom order, one path: the spec pacing gives 3-6 strokes in flight)
  let inkD = '';
  let thinD = '';
  if (lod === 'full' || lod === 'simple') {
    if (p.roof === 'gable') inkD += line(x - 10, L.top + 4, x + w / 2, L.top - roofH, {seed: `${seed}/g1`, over: [4, 2]}) + line(x + w / 2, L.top - roofH, x + w + 10, L.top + 4, {seed: `${seed}/g2`, over: [2, 4]});
    else if (p.roof !== 'none') inkD += cornice(x, x + w, L.top - Math.max(3, Math.min(16, H * 0.035)), Math.max(3, Math.min(16, H * 0.035)), seed, Math.min(24, w * 0.06));
    inkD += line(x, L.top, x, y, {seed: `${seed}/vl`, over: [2, 6]}) + line(x + w, L.top, x + w, y, {seed: `${seed}/vr`, over: [2, 6]});
    if (lod === 'full') {
      for (let i = 0; i < L.windows.length; i++) {
        const q = L.windows[i];
        thinD += windowInk(q[0], q[1], q[2], q[3], `${seed}/w${i}`, {mullion: q[2] > 22, sill: true});
      }
      const nb = p.bricks ?? Math.max(2, Math.round((w * H) / 40000));
      if (nb > 0) thinD += brickHints(x + w * 0.05, L.top + 10, w * 0.9, H - 20, seed, nb, Math.min(24, w * 0.08));
    }
  }

  const browserNode =
    L.browser ? (
      p.slots?.browser ? (
        p.slots.browser(L.browser)
      ) : (
        <ChromeSlot x={L.browser[0]} y={L.browser[1]} w={L.browser[2]} h={L.browser[3]} chrome={p.chrome} chromeAt={p.chromeAt} screenOnAt={p.screenOnAt} offAt={p.offAt} lod={lod === 'full' ? 'full' : lod === 'simple' ? 'simple' : 'dots'} width={W} seed={`${seed}/bw`} />
      )
    ) : null;
  const plaqueNode = L.plaque && lod !== 'dots' ? (p.slots?.plaque ? p.slots.plaque(L.plaque) : <PlaqueSlot x={L.plaque[0]} y={L.plaque[1]} size={L.plaque[2]} variant={p.plaque || 'new'} seed={`${seed}/pq`} width={Math.max(0.8, W * 0.6)} />) : null;
  const lockNode = L.lock ? (p.slots?.lock ? p.slots.lock(L.lock) : <LockSlot x={L.lock[0]} y={L.lock[1]} w={L.lock[2]} h={L.lock[3]} variant={lod === 'dots' ? 'dot' : p.lock || 'closed'} seed={`${seed}/lk`} width={Math.max(0.8, W * 0.6)} />) : null;

  const content = (
    <>
      <LightsOut at={p.offAt}>
        {fills}
        {doorNode}
      </LightsOut>
      {inkD ? <Ink d={inkD} width={W} at={inkAt} seed={`${seed}/ink`} /> : null}
      {thinD ? <Ink d={thinD} width={W * 0.66} at={inkAt !== undefined ? inkAt + 0.1 : undefined} taper={false} seed={`${seed}/thin`} /> : null}
      {browserNode}
      <LightsOut at={p.offAt}>
        {plaqueNode}
        {lockNode}
      </LightsOut>
    </>
  );
  void r;
  return wrap(p, content);
};

function wrap(p: SiteFacadeProps, node: React.ReactNode) {
  return p.at !== undefined ? (
    <PopUp at={p.at} x={p.x + p.w / 2} y={p.y}>
      {node}
    </PopUp>
  ) : (
    <>{node}</>
  );
}

/** Shade plane colour for a facade colour (one step darker). */
export function shadeOf(c: string): string {
  switch (c) {
    case palette.cream:
      return palette.sand;
    case palette.sand:
      return palette.tan;
    case palette.mintPale:
      return palette.sage;
    case palette.tan:
      return palette.brown;
    case palette.white:
      return palette.mintPale;
    default:
      return palette.tan;
  }
}
/** Rim strip colour for a facade colour (lighter). */
export function rimOf(c: string): string {
  return c === palette.cream || c === palette.mintPale || c === palette.white ? palette.white : palette.cream;
}

// ---------------------------------------------------------------- door

/** Teal door: frame reveal (tan band left + top), sage glass upper panel(s), tealDark kick panels, bar handle. */
export const FacadeDoor: React.FC<{r: Rect; color?: string; double?: boolean; lod?: FacadeLod; seed: Seed; at?: number; inkAt?: number; width?: number; frame?: string}> = ({r, color = palette.teal, double, lod = 'full', seed, at, inkAt, width = SI.mid, frame = palette.tan}) => {
  const [x, y, w, h] = r;
  const dbl = double ?? w > h * 0.55;
  const band = Math.max(2, Math.min(14, w * 0.12));
  const leaves = dbl ? 2 : 1;
  const lw = w / leaves;
  let glass = '';
  let kick = '';
  for (let i = 0; i < leaves; i++) {
    const lx = x + i * lw;
    const px = lw * 0.16;
    glass += rectPath(lx + px, y + h * 0.08, lw - 2 * px, h * 0.46);
    kick += rectPath(lx + px, y + h * 0.66, lw - 2 * px, h * 0.25);
  }
  const fills = (
    <>
      <Fill d={rectPath(x - band, y - band, w + band, h + band)} color={frame} at={at} mode="snap" seed={`${seed}/fr`} />
      <Fill rect={[x, y, w, h]} color={color} at={at} mode="snap" seed={`${seed}/d`} />
      {lod !== 'dots' ? <Fill d={glass} color={palette.sage} at={at} mode="snap" offset={false} seed={`${seed}/g`} /> : null}
      {lod !== 'dots' ? <Fill d={kick} color={palette.tealDark} at={at} mode="snap" offset={false} seed={`${seed}/k`} /> : null}
    </>
  );
  if (lod === 'dots' || lod === 'fill') return fills;
  let d = rect(x, y, w, h, {seed: `${seed}/o`, edges: 'tlr', over: 'small'}) + line(x - band - 4, y - band, x + w + 6, y - band, {seed: `${seed}/t`, over: 'small'});
  if (dbl) d += line(x + lw, y, x + lw, y + h, {seed: `${seed}/m`, over: 0});
  let thin = '';
  if (lod === 'full') {
    for (let i = 0; i < leaves; i++) {
      const lx = x + i * lw;
      const px = lw * 0.16;
      thin += rect(lx + px, y + h * 0.08, lw - 2 * px, h * 0.46, {seed: `${seed}/gi${i}`, over: 'small', edges: 'tlr'});
      if (w > 40) thin += glintAt(lx + px + (lw - 2 * px) * 0.3, y + h * 0.36, h * 0.12, `${seed}/gl${i}`);
      const hx = i === 0 && dbl ? lx + lw - lw * 0.18 : lx + lw * 0.14;
      thin += line(hx, y + h * 0.42, hx, y + h * 0.58, {seed: `${seed}/h${i}`, over: 0});
    }
  }
  return (
    <>
      {fills}
      <Ink d={d} width={width} at={inkAt} taper={false} seed={`${seed}/i`} />
      {thin ? <Ink d={thin} width={width * 0.6} at={inkAt !== undefined ? inkAt + 0.08 : undefined} taper={false} seed={`${seed}/ti`} /> : null}
    </>
  );
};
