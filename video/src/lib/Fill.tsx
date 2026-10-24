// Fill.tsx — flat colour fills, slightly MISREGISTERED from the linework (offset a few px, like a
// misaligned print), with entrance modes and automatic un-build (drain/collapse) on SceneExit.
//
//   <Fill d={rectPath(100, 200, 300, 180)} color={palette.peach} at={1.4} mode="wipe" dir="up" />
//   <Fill rect={[100, 200, 300, 180]} color={palette.teal} at={2} mode="grow" />   // rises from the bottom
//   <Fill d={blob(480, 400, 60, 60)} color={palette.sun} at={3} mode="pop" />
//   <Drawn d={rect(...)} fill={palette.cream} at={1} />  // ink first, fill lands a beat later
//
// Modes: fade | pop (spring scale from origin) | wipe (reveal toward `dir`) | grow (scale from the edge
// opposite `dir`, slight overshoot) | none. Exit: fade->fade, pop/grow->collapse to origin, wipe->wipe away.

import React, {useMemo} from 'react';
import {getBoundingBox} from '@remotion/paths';
import {misreg, timing} from './theme';
import {Ease, ease as E, prog, springAt, springs, useTime} from './time';
import {exitFillProgress, useExit} from './exit';
import {rng, Seed} from './rng';
import {Ink, InkProps, inkDur, parseInk} from './Ink';
import {rectPath} from './sketch';

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
  rule?: 'nonzero' | 'evenodd';
  style?: React.CSSProperties;
};

const growOrigin = (b: BBox, dir: Dir): [number, number] =>
  dir === 'up' ? [b.x + b.w / 2, b.y + b.h] : dir === 'down' ? [b.x + b.w / 2, b.y] : dir === 'right' ? [b.x, b.y + b.h / 2] : [b.x + b.w, b.y + b.h / 2];

function inset(dir: Dir, visible: number, fromEnd = false): string {
  const h = ((1 - visible) * 100).toFixed(2) + '%';
  // reveal toward dir: hide the far side. fromEnd: hide the near side instead (wipe away toward dir).
  const near = fromEnd;
  switch (dir) {
    case 'right':
      return near ? `inset(0 0 0 ${h})` : `inset(0 ${h} 0 0)`;
    case 'left':
      return near ? `inset(0 ${h} 0 0)` : `inset(0 0 0 ${h})`;
    case 'up':
      return near ? `inset(0 0 ${h} 0)` : `inset(${h} 0 0 0)`;
    case 'down':
      return near ? `inset(${h} 0 0 0)` : `inset(0 0 ${h} 0)`;
  }
}

export const Fill: React.FC<FillProps> = ({
  d: dIn,
  rect,
  color,
  at,
  dur = timing.fillDur,
  ease,
  mode = 'fade',
  dir,
  origin,
  offset,
  seed,
  opacity = 1,
  exit = true,
  exitMode,
  rule,
  style,
}) => {
  const t = useTime();
  const e = useExit();
  const d = useMemo(() => dIn ?? (rect ? rectPath(rect[0], rect[1], rect[2], rect[3]) : ''), [dIn, rect?.[0], rect?.[1], rect?.[2], rect?.[3]]);
  const {jit, off} = useMemo(() => {
    const r = rng(seed ?? d.slice(0, 48));
    const o: [number, number] = offset === false ? [0, 0] : offset ?? [misreg.dx + r.jitter(misreg.jitter), misreg.dy + r.jitter(misreg.jitter)];
    return {jit: r.next(), off: o};
  }, [seed, d, offset === false ? 0 : offset?.[0], offset === false ? 0 : offset?.[1]]);

  const drain = exit ? exitFillProgress(e, jit) : 0;
  if (!d || drain >= 1) return null;

  const wdir: Dir = dir ?? (mode === 'grow' ? 'up' : 'right');
  let enter = 1;
  let scale = 1;
  let sx = 1;
  let sy = 1;
  let op = opacity;
  let clip: string | undefined;
  let org: [number, number] | null = null;
  const needBox = mode === 'pop' || mode === 'grow' || exitMode === 'collapse';
  const box = needBox ? (rect ? {x: rect[0], y: rect[1], w: rect[2], h: rect[3]} : bbox(d)) : null;

  if (at !== undefined && mode !== 'none') {
    if (t < at) return null;
    if (mode === 'pop') {
      scale = springAt(t, at, springs.pop);
      org = origin ?? [box!.x + box!.w / 2, box!.y + box!.h / 2];
    } else if (mode === 'grow') {
      const g = prog(t, at, dur * 1.25, ease ?? E.outBack(1.3));
      org = origin ?? growOrigin(box!, wdir);
      if (wdir === 'up' || wdir === 'down') sy = g;
      else sx = g;
    } else {
      enter = prog(t, at, dur, ease ?? (mode === 'wipe' ? E.inOutCubic : E.outCubic));
      if (mode === 'fade') op *= enter;
      else if (mode === 'wipe' && enter < 1) clip = inset(wdir, enter);
    }
  } else if (at !== undefined && t < at) {
    return null;
  }

  if (drain > 0) {
    const xm = exitMode ?? (mode === 'pop' || mode === 'grow' ? 'collapse' : mode === 'wipe' ? 'wipe' : 'fade');
    if (xm === 'fade') op *= 1 - drain;
    else if (xm === 'wipe') clip = inset(wdir, 1 - drain, true);
    else {
      const k = 1 - E.inCubic(drain);
      if (!org) org = origin ?? (mode === 'grow' ? growOrigin(box!, wdir) : [box!.x + box!.w / 2, box!.y + box!.h / 2]);
      if (mode === 'grow' && (wdir === 'right' || wdir === 'left')) sx *= k;
      else if (mode === 'grow') sy *= k;
      else scale *= k;
    }
  }
  if (op <= 0.001 || scale <= 0.001 || sx <= 0.001 || sy <= 0.001) return null;

  let tr = `translate(${off[0]} ${off[1]})`;
  if (org && (scale !== 1 || sx !== 1 || sy !== 1)) {
    tr += ` translate(${org[0]} ${org[1]}) scale(${scale * sx} ${scale * sy}) translate(${-org[0]} ${-org[1]})`;
  }
  return <path d={d} fill={color} fillRule={rule} opacity={op < 1 ? op : undefined} transform={tr} style={clip ? {...style, clipPath: clip} : style} />;
};

// ---------------------------------------------------------------- Drawn: ink + fill a beat later

export type DrawnProps = Omit<InkProps, 'fill'> & {
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
};

/** Linework + misregistered fill that lands a beat after the ink finishes. */
export const Drawn: React.FC<DrawnProps> = ({fill, fillD, fillMode = 'fade', fillDir, fillDur, fillDelay = timing.fillDelay, fillOffset, fillOpacity, ...ink}) => {
  const drawDur = ink.dur ?? (ink.at !== undefined ? inkDur(parseInk(ink.d).total) : 0);
  const fillAt = ink.at !== undefined ? ink.at + drawDur * 0.8 + fillDelay : undefined;
  return (
    <>
      {fill ? (
        <Fill d={fillD ?? ink.d} color={fill} at={fillAt} mode={fillMode} dir={fillDir} dur={fillDur} offset={fillOffset} seed={ink.seed} opacity={fillOpacity} exit={ink.exit} />
      ) : null}
      <Ink {...ink} />
    </>
  );
};
