// Fill.tsx — flat colour fills, slightly MISREGISTERED from the linework (offset a few px, like a
// misaligned print), CLIPPED TO THE PANEL rectangle (style bible rule 1: fills stop on the panel edge, ink
// runs past it), with entrance modes and automatic un-build (drain/collapse) on SceneExit.
//
//   <Fill d={rectPath(100, 200, 300, 180)} color={palette.peach} at={1.4} mode="wipe" dir="up" />
//   <Fill rect={[100, 200, 300, 180]} color={palette.teal} at={2} mode="grow" />   // rises from the bottom
//   <Fill d={blob(480, 400, 60, 60)} color={palette.sun} at={3} mode="pop" />
//   <Drawn d={circle(...)} fill={palette.sage} at={1} />  // ink first, fill lands a beat later
//   <Unclipped> ...actors whose fills may leave the panel (people, props)... </Unclipped>
//
// Modes: fade (near-instant, default) | pop (spring scale from origin) | wipe (reveal toward `dir`) |
// grow (scale from the edge opposite `dir`, slight overshoot) | none.
// Exit: fade->fade, pop/grow->collapse to origin, wipe->wipe away. Big fills leave last.

import React, {createContext, useContext, useId, useMemo} from 'react';
import {getBoundingBox} from '@remotion/paths';
import {misreg, panel as panelGeo, timing} from './theme';
import {Ease, ease as E, prog, springAt, springs, useTime} from './time';
import {exitFillProgress, useExit} from './exit';
import {rng, Seed} from './rng';
import {Ink, InkProps, inkDur, parseInk} from './Ink';
import {rectPath} from './sketch';
import {mat, useXf} from './xf';

export type BBox = {x: number; y: number; w: number; h: number};
const bboxCache = new Map<string, BBox>();
export function bbox(d: string): BBox {
  let b = bboxCache.get(d);
  if (!b) {
    try {
      const r = getBoundingBox(d);
      b = {x: r.x1, y: r.y1, w: r.x2 - r.x1, h: r.y2 - r.y1};
    } catch {
      b = {x: 0, y: 0, w: 0, h: 0};
    }
    if (bboxCache.size > 20000) bboxCache.clear();
    bboxCache.set(d, b);
  }
  return b;
}

// ---------------------------------------------------------------- panel clipping

type ClipV = {id: string | null; rect: [number, number, number, number]};
const ClipCtx = createContext<ClipV>({id: null, rect: [panelGeo.x, panelGeo.y, panelGeo.w, panelGeo.h]});

/** Defines the panel clip for a subtree (Art does this for every scene). rect defaults to theme.panel. */
export const PanelClip: React.FC<{children?: React.ReactNode; rect?: [number, number, number, number]}> = ({children, rect = [panelGeo.x, panelGeo.y, panelGeo.w, panelGeo.h]}) => {
  const id = 'pc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={rect[0]} y={rect[1]} width={rect[2]} height={rect[3]} />
        </clipPath>
      </defs>
      <ClipCtx.Provider value={{id, rect}}>{children}</ClipCtx.Provider>
    </>
  );
};

/** Fills inside are NOT clipped to the panel (actors: people, cat, props, the sun). */
export const Unclipped: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const v = useContext(ClipCtx);
  return <ClipCtx.Provider value={{id: null, rect: v.rect}}>{children}</ClipCtx.Provider>;
};

/** Current panel-clip context ({id, rect}); id null = unclipped. */
export const useFillClip = () => useContext(ClipCtx);

// ---------------------------------------------------------------- Fill

export type FillMode = 'fade' | 'pop' | 'wipe' | 'grow' | 'none';
export type Dir = 'right' | 'left' | 'up' | 'down';

export type FillProps = {
  /** Closed path. Or use `rect`. */
  d?: string;
  /** [x, y, w, h] shortcut. */
  rect?: [number, number, number, number];
  color: string;
  /** Entrance start (scene s). Omit = already there. */
  at?: number;
  /** Entrance duration. Defaults: fade 0.12, wipe timing.fillDur, grow 0.38 (pop uses a spring). */
  dur?: number;
  ease?: Ease;
  mode?: FillMode;
  /** wipe: reveal direction (default 'right'); grow: growth direction (default 'up'). */
  dir?: Dir;
  /** pop/grow origin in the same coordinates. Default: bbox centre (pop) / bbox edge (grow). */
  origin?: [number, number];
  /** Misregistration offset. Default: theme misreg + seeded jitter. false = exact. */
  offset?: [number, number] | false;
  seed?: Seed;
  opacity?: number;
  /** React to SceneExit (default true). */
  exit?: boolean;
  exitMode?: 'fade' | 'collapse' | 'wipe';
  /** exitMode 'wipe': the direction the remaining fill retreats toward (default = dir). 'down' = the top edge
   *  drops to the bottom (the reference's wall collapse). */
  exitDir?: Dir;
  /** Clip to the panel (default: follow context; Art clips, <Unclipped> doesn't). */
  clip?: boolean;
  rule?: 'nonzero' | 'evenodd';
  style?: React.CSSProperties;
};

const growOrigin = (b: BBox, dir: Dir): [number, number] =>
  dir === 'up' ? [b.x + b.w / 2, b.y + b.h] : dir === 'down' ? [b.x + b.w / 2, b.y] : dir === 'right' ? [b.x, b.y + b.h / 2] : [b.x + b.w, b.y + b.h / 2];

function inset(dir: Dir, visible: number, fromEnd = false): string {
  const h = ((1 - visible) * 100).toFixed(2) + '%';
  switch (dir) {
    case 'right':
      return fromEnd ? `inset(0 0 0 ${h})` : `inset(0 ${h} 0 0)`;
    case 'left':
      return fromEnd ? `inset(0 ${h} 0 0)` : `inset(0 0 0 ${h})`;
    case 'up':
      return fromEnd ? `inset(0 0 ${h} 0)` : `inset(${h} 0 0 0)`;
    case 'down':
      return fromEnd ? `inset(${h} 0 0 0)` : `inset(0 0 ${h} 0)`;
  }
}

const PANEL_AREA = panelGeo.w * panelGeo.h;

export const Fill: React.FC<FillProps> = ({
  d: dIn,
  rect,
  color,
  at,
  dur,
  ease,
  mode = 'fade',
  dir,
  origin,
  offset,
  seed,
  opacity = 1,
  exit = true,
  exitMode,
  exitDir,
  clip,
  rule,
  style,
}) => {
  const t = useTime();
  const e = useExit();
  const clipCtx = useContext(ClipCtx);
  const m = useXf();
  const localId = 'fc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const d = useMemo(() => dIn ?? (rect ? rectPath(rect[0], rect[1], rect[2], rect[3]) : ''), [dIn, rect?.[0], rect?.[1], rect?.[2], rect?.[3]]);
  const {jit, off} = useMemo(() => {
    const r = rng(seed ?? d.slice(0, 48));
    const o: [number, number] = offset === false ? [0, 0] : offset ?? [misreg.dx + r.jitter(misreg.jitter), misreg.dy + r.jitter(misreg.jitter)];
    return {jit: r.next(), off: o};
  }, [seed, d, offset === false ? 0 : offset?.[0], offset === false ? 0 : offset?.[1]]);
  if (!d) return null;
  const box = rect ? {x: rect[0], y: rect[1], w: rect[2], h: rect[3]} : bbox(d);
  const size = Math.sqrt(Math.min(1, (box.w * box.h * Math.abs(m[0] * m[3] - m[1] * m[2])) / PANEL_AREA));
  const drain = exit ? exitFillProgress(e, jit, size) : 0;
  if (drain >= 1) return null;

  const wdir: Dir = dir ?? (mode === 'grow' ? 'up' : 'right');
  let scale = 1;
  let sx = 1;
  let sy = 1;
  let op = opacity;
  let clipCss: string | undefined;
  let org: [number, number] | null = null;

  if (at !== undefined) {
    if (t < at) return null;
    if (mode === 'pop') {
      scale = springAt(t, at, springs.pop);
      org = origin ?? [box.x + box.w / 2, box.y + box.h / 2];
    } else if (mode === 'grow') {
      const g = prog(t, at, dur ?? 0.38, ease ?? E.outBack(1.3));
      org = origin ?? growOrigin(box, wdir);
      if (wdir === 'up' || wdir === 'down') sy = g;
      else sx = g;
    } else if (mode === 'fade') {
      op *= prog(t, at, dur ?? 0.12, ease ?? E.outCubic);
    } else if (mode === 'wipe') {
      const p = prog(t, at, dur ?? timing.fillDur, ease ?? E.inOutCubic);
      if (p < 1) clipCss = inset(wdir, p);
    }
  }

  if (drain > 0) {
    const xm = exitMode ?? (mode === 'pop' || mode === 'grow' ? 'collapse' : mode === 'wipe' ? 'wipe' : 'fade');
    if (xm === 'fade') op *= 1 - drain;
    else if (xm === 'wipe') clipCss = inset(exitDir ?? wdir, 1 - drain, true);
    else {
      const k = 1 - E.inCubic(drain);
      if (!org) org = origin ?? (mode === 'grow' ? growOrigin(box, wdir) : [box.x + box.w / 2, box.y + box.h / 2]);
      if (mode === 'grow' && (wdir === 'right' || wdir === 'left')) sx *= k;
      else if (mode === 'grow') sy *= k;
      else scale *= k;
    }
  }
  if (op <= 0.001 || scale <= 0.001 || sx <= 0.001 || sy <= 0.001) return null;

  let tr = `translate(${off[0].toFixed(2)} ${off[1].toFixed(2)})`;
  if (org && (scale !== 1 || sx !== 1 || sy !== 1)) {
    tr += ` translate(${org[0]} ${org[1]}) scale(${(scale * sx).toFixed(4)} ${(scale * sy).toFixed(4)}) translate(${-org[0]} ${-org[1]})`;
  }
  const path = <path d={d} fill={color} fillRule={rule} opacity={op < 1 ? op : undefined} transform={tr} style={clipCss ? {...style, clipPath: clipCss} : style} />;

  const doClip = clip ?? clipCtx.id !== null;
  if (!doClip || !clipCtx.id) return path;
  if (mat.isIdentity(m)) return <g clipPath={`url(#${clipCtx.id})`}>{path}</g>;
  // inside a transformed group: clip with the panel rect mapped into local coordinates
  const [px, py, pw, ph] = clipCtx.rect;
  return (
    <>
      <defs>
        <clipPath id={localId} clipPathUnits="userSpaceOnUse">
          <rect x={px} y={py} width={pw} height={ph} transform={mat.str(mat.inv(m))} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${localId})`}>{path}</g>
    </>
  );
};

// ---------------------------------------------------------------- Drawn: ink + fill a beat later

export type DrawnProps = InkProps & {
  /** Fill colour (omit for linework only). */
  fill?: string;
  /** Closed shape for the fill (default: same as `d`). */
  fillD?: string;
  fillMode?: FillMode;
  fillDir?: Dir;
  fillDur?: number;
  /** Extra delay after the ink finishes before the fill lands. Default theme timing.fillDelay. */
  fillDelay?: number;
  fillOffset?: [number, number] | false;
  fillOpacity?: number;
  fillClip?: boolean;
};

/** Linework + misregistered fill that lands a beat after the ink finishes. */
export const Drawn: React.FC<DrawnProps> = ({fill, fillD, fillMode = 'fade', fillDir, fillDur, fillDelay = timing.fillDelay, fillOffset, fillOpacity, fillClip, ...ink}) => {
  const drawDur = ink.dur ?? (ink.at !== undefined ? inkDur(parseInk(ink.d).total) : 0);
  const fillAt = ink.at !== undefined ? ink.at + drawDur * 0.8 + fillDelay : undefined;
  return (
    <>
      {fill ? (
        <Fill d={fillD ?? ink.d} color={fill} at={fillAt} mode={fillMode} dir={fillDir} dur={fillDur} offset={fillOffset} seed={ink.seed} opacity={fillOpacity} exit={ink.exit} clip={fillClip} />
      ) : null}
      <Ink {...ink} />
    </>
  );
};
