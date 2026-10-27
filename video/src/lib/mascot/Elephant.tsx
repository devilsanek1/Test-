import React, {useId} from 'react';
import {stroke} from '../theme';
import {useInkScale} from '../inkComp';
import {COLORWAYS, Colorway, ColorwayKey, MASCOT} from './colors';
import {Pt, brush, clamp, polyPath, rand} from './ink';
import {Layer, Pen} from './pen';
import {Expression, POSE_BUILDERS, PoseName} from './poses';
import {isClean} from '../pen';

export type ElephantProps = {
  /** feet anchor in the parent's coordinates (card space) */
  x: number;
  y: number;
  /** 1 = about 96 px tall sitting. Line weight stays constant across scales. */
  scale?: number;
  /** false = faces/peeks right, true = mirrored */
  flip?: boolean;
  pose?: PoseName;
  /** seconds; drives idle life and walk cycle */
  t: number;
  seed?: number;
  /** -1..1 eye/head direction (before flip) */
  look?: number;
  expression?: Expression;
  /** pose-specific 0..1 (see docs/mascot.md) */
  amount?: number;
  /** 0..1 idle-life multiplier (blink, ears, tail, trunk, breathing) */
  idle?: number;
  /** 0..1 build (draw-on): strokes draw on one after another; each flat fill GROWS 20% -> 100% about its centre
   *  (3-4 frames at the default drawIn speed), landing ~0.16 after its outline starts. Never translucent. */
  draw?: number;
  /** 0..1 un-build (the engine's recipe, no fades): fills shrink to their centres (small first), then the ink
   *  retracts. Feed it unbuild(t, t0) or the engine's useExit(). */
  exit?: number;
  /** + squash / - stretch, about the feet (see motion helpers) */
  squash?: number;
  /** degrees, about the feet anchor */
  rotate?: number;
  /** @deprecated nothing fades: treated as visibility (< 0.5 = not drawn, otherwise fully drawn). */
  opacity?: number;
  /** a node held at the trunk tip ('hold' pose, or carried in side poses); authored upright around (0,0) */
  prop?: React.ReactNode;
  propRot?: number;
  /** walk cycles per second for 'walk-side' (see walkSpeed()) */
  walkRate?: number;
  colorway?: ColorwayKey | Colorway;
  /** Line weight factor (default 1). Multiplied by the enclosing <InkScale> (lib/inkComp.tsx; 1 by default). */
  lineWeight?: number;
  /** 0..1 how much of the linework is drawn (0 = fills-only state). Strokes retract; never an opacity. */
  ink?: number;
  /** 0..1 fill size about each fill's centre (0 = ink-only state, like the reference's loop frame). Never an opacity. */
  fill?: number;
  /** The clean pen's brush (default: on when lib/pen.ts setPen('clean') is on, else off): no overshoot, wander,
   *  pressure noise or width noise, fills registered exactly. The default sketch brush is unchanged. */
  clean?: boolean;
};

// Fill offset in screen px. The reference cat's fill sits ~3 px right / 2 px down of its ink (style bible §9);
// the mascot keeps that one offset per object regardless of flip.
const MISREG = {x: 3, y: 2};

/** Build timing, in `draw` units (drawIn's default 0.9 s maps 1 unit to ~0.9 s). */
export const BUILD = {
  inkSpread: 0.62, // stroke i starts at i/N * inkSpread
  inkDur: 0.2, // one stroke draws in 0.2 (~5 frames)
  fillLag: 0.16, // a fill lands this long after its outline starts (engine: 4-8 frames)
  fillGrow: 0.12, // 20% -> 100% (engine MOTION.fillGrow: 3-4 frames)
  fillFrom: 0.2,
  propAt: 0.72,
} as const;

/** Un-build phases (fractions of `exit`), mirroring the engine's MOTION.unbuild / exit.tsx. */
const UNBUILD = {fill0: 0.1, fillJitter: 0.1, fillSize: 0.12, fillDur: 0.36, ink0: 0.36, inkJitter: 0.08, inkDur: 0.26} as const;

const outCubic = (k: number) => 1 - Math.pow(1 - k, 3);
const inCubic = (k: number) => k * k * k;
const prog = (v: number, a: number, d: number) => clamp((v - a) / d);

const bboxCentre = (pts: Pt[]): {c: Pt; size: number} => {
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const [a, b] of pts) {
    if (a < x0) x0 = a;
    if (a > x1) x1 = a;
    if (b < y0) y0 = b;
    if (b > y1) y1 = b;
  }
  return {c: [(x0 + x1) / 2, (y0 + y1) / 2], size: Math.sqrt(Math.max(0, (x1 - x0) * (y1 - y0)))};
};

const scaleAbout = (c: Pt, k: number) =>
  `translate(${c[0].toFixed(2)} ${c[1].toFixed(2)}) scale(${k.toFixed(4)}) translate(${(-c[0]).toFixed(2)} ${(-c[1]).toFixed(2)})`;

export const Elephant: React.FC<ElephantProps> = ({
  x,
  y,
  scale = 1,
  flip = false,
  pose = 'sit-front',
  t,
  seed = 1,
  look = 0,
  expression,
  amount,
  idle = 1,
  draw = 1,
  exit = 0,
  squash = 0,
  rotate = 0,
  opacity = 1,
  prop,
  propRot = 0,
  walkRate = 1.25,
  colorway,
  lineWeight = 1,
  ink = 1,
  fill = 1,
  clean: cleanProp,
}) => {
  const cleanPen = cleanProp ?? isClean();
  const rawId = useId();
  const inkScale = useInkScale(); // opt-in camera ink compensation (lib/inkComp.tsx): 1 outside an <InkScale>
  const clipId = `ele-clip-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  if (opacity < 0.5 || draw <= 0 || exit >= 1 || scale <= 0) return null;
  const c: Colorway = colorway === undefined ? MASCOT : typeof colorway === 'string' ? COLORWAYS[colorway] : colorway;
  const pen = new Pen(seed, c);
  POSE_BUILDERS[pose](pen, {t, seed, look, idle, amount, expression, prop, propRot, walkRate, flip});

  const baseW = (stroke.ink * 1.12 * lineWeight * inkScale) / scale;
  const fx = flip ? -1 : 1;
  const mx = cleanPen ? 0 : (MISREG.x * fx) / scale;
  const my = cleanPen ? 0 : MISREG.y / scale;
  const inkState = clamp(ink);
  const fillState = clamp(fill);
  const building = draw < 1;

  // stroke start times (draw units), and for every non-ink layer the start of the outline it belongs to
  const layers = pen.layers;
  const inkCount = layers.filter((l) => l.k === 'ink').length || 1;
  const inkStart: number[] = [];
  {
    let n = 0;
    for (const l of layers) {
      inkStart.push(l.k === 'ink' ? (n / inkCount) * BUILD.inkSpread : -1);
      if (l.k === 'ink') n += 1;
    }
  }
  const outlineStart = (i: number) => {
    // a fill is pushed just before its own outline; solids (eyes, tufts) just after the lines they sit on
    for (let j = i + 1; j < layers.length && j <= i + 3; j++) if (inkStart[j] >= 0) return inkStart[j];
    for (let j = i - 1; j >= 0; j--) if (inkStart[j] >= 0) return inkStart[j];
    return 0;
  };
  /** grow factor 0 (absent) or 0.2..1 for a fill/solid/prop arriving at `at` (draw units) */
  const grow = (at: number) => {
    if (!building) return 1;
    const a = Math.min(at, 1 - BUILD.fillGrow);
    if (draw < a) return 0;
    return BUILD.fillFrom + (1 - BUILD.fillFrom) * outCubic(prog(draw, a, BUILD.fillGrow));
  };
  /** shrink factor 1..0 for the un-build */
  const shrink = (i: number, size: number) => {
    if (exit <= 0) return 1;
    const jitter = rand(seed + 41, i);
    const p = prog(exit, UNBUILD.fill0 + jitter * UNBUILD.fillJitter + Math.min(1, size / 90) * UNBUILD.fillSize, UNBUILD.fillDur);
    return 1 - inCubic(p);
  };

  const sx = 1 + squash * 0.55;
  const sy = 1 - squash;

  const out: React.ReactNode[] = [];
  let bucket: React.ReactNode[] = out;
  let clipX: number | null = null;
  const clipped: React.ReactNode[] = [];

  for (let i = 0; i < layers.length; i++) {
    const l: Layer = layers[i];
    if (l.k === 'clip') {
      if (l.on) {
        clipX = l.x;
        bucket = clipped;
      } else {
        out.push(
          <g key={`clip${i}`} clipPath={`url(#${clipId})`}>
            {clipped.splice(0)}
          </g>,
        );
        bucket = out;
      }
      continue;
    }
    if (l.k === 'fill' || l.k === 'solid') {
      const isInkSolid = l.k === 'solid' && l.color === c.ink;
      const {c: ctr, size} = bboxCentre(l.pts);
      const k = grow(outlineStart(i) + BUILD.fillLag) * shrink(i, size) * (isInkSolid ? (inkState > 0 ? 1 : 0) : fillState);
      if (k <= 0.001) continue;
      const m = l.k === 'fill' ? l.misreg ?? 1 : 0;
      const tr = `${m ? `translate(${(mx * m).toFixed(2)} ${(my * m).toFixed(2)}) ` : ''}${k < 1 ? scaleAbout(ctr, k) : ''}`;
      bucket.push(<path key={i} d={polyPath(l.pts)} fill={l.color} transform={tr || undefined} />);
      continue;
    }
    if (l.k === 'node') {
      const k = grow(BUILD.propAt) * shrink(i, 40);
      if (k <= 0.001) continue;
      bucket.push(
        <g key={i} transform={`translate(${l.at[0].toFixed(2)} ${l.at[1].toFixed(2)}) rotate(${l.rot.toFixed(2)})${k < 1 ? ` scale(${k.toFixed(4)})` : ''}`}>
          {l.node}
        </g>,
      );
      continue;
    }
    // ink: draws on from its start, retracts from its end during the un-build
    const s0 = inkStart[i];
    const pIn = building ? prog(draw, s0, BUILD.inkDur) : 1;
    const pOut = exit > 0 ? 1 - prog(exit, UNBUILD.ink0 + rand(seed + 43, i) * UNBUILD.inkJitter, UNBUILD.inkDur) : 1;
    const frac = Math.min(pIn, pOut, inkState);
    if (frac <= 0) continue;
    const d = brush(l.pts, {
      w: baseW * (l.w ?? 1),
      seed: l.seed,
      over: cleanPen ? 0 : l.over,
      overStart: cleanPen ? 0 : l.overStart,
      overEnd: cleanPen ? 0 : l.overEnd,
      tipIn: l.tipIn,
      tipOut: l.tipOut,
      wobble: cleanPen ? 0 : l.wobble,
      press: cleanPen ? 0 : undefined,
      wVar: cleanPen ? 0 : undefined,
      draw: frac,
    });
    if (d) bucket.push(<path key={i} d={d} fill={l.color ?? c.line ?? c.ink} />);
  }
  if (bucket === clipped && clipped.length) {
    out.push(
      <g key="clip-end" clipPath={`url(#${clipId})`}>
        {clipped.splice(0)}
      </g>,
    );
  }

  return (
    <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotate.toFixed(2)}) scale(${(fx * scale).toFixed(4)} ${scale.toFixed(4)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`}>
      {clipX !== null ? (
        <defs>
          <clipPath id={clipId}>
            <rect x={clipX} y={-400} width={800} height={800} />
          </clipPath>
        </defs>
      ) : null}
      {out}
    </g>
  );
};
