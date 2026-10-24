import React, {useId} from 'react';
import {stroke} from '../theme';
import {COLORWAYS, Colorway, ColorwayKey, MASCOT} from './colors';
import {brush, clamp, polyPath, smooth} from './ink';
import {Layer, Pen} from './pen';
import {Expression, POSE_BUILDERS, PoseName} from './poses';

export type ElephantProps = {
  /** feet anchor in the parent's coordinates (card space) */
  x: number;
  y: number;
  /** 1 = about 100 px tall sitting. Line weight stays constant across scales. */
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
  /** pose-specific 0..1 (peek: how far out; shrug: shoulder height) */
  amount?: number;
  /** 0..1 idle-life multiplier (blink, ears, tail, trunk, breathing) */
  idle?: number;
  /** 0..1 draw-on: lines draw first, flat fills arrive a beat later */
  draw?: number;
  /** + squash / - stretch, about the feet (see motion helpers) */
  squash?: number;
  /** degrees, about the feet anchor */
  rotate?: number;
  opacity?: number;
  /** a node held at the trunk tip ('hold' pose, or carried in side poses); authored upright around (0,0) */
  prop?: React.ReactNode;
  propRot?: number;
  /** walk cycles per second for 'walk-side' (see walkSpeed()) */
  walkRate?: number;
  colorway?: ColorwayKey | Colorway;
  lineWeight?: number;
  /** 0..1 opacity of the linework only (0 = fills-only state) */
  ink?: number;
  /** 0..1 opacity of the flat fills only (0 = ink-only state, like the reference's loop frame) */
  fill?: number;
};

// Fill offset in screen px. The reference cat's fill sits ~3 px right / 2 px down of its ink (style bible §9);
// the mascot keeps that one offset per object regardless of flip.
const MISREG = {x: 3, y: 2};

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
}) => {
  const rawId = useId();
  const clipId = `ele-clip-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const c: Colorway = colorway === undefined ? MASCOT : typeof colorway === 'string' ? COLORWAYS[colorway] : colorway;
  const pen = new Pen(seed, c);
  POSE_BUILDERS[pose](pen, {t, seed, look, idle, amount, expression, prop, propRot, walkRate, flip});

  const baseW = (stroke.ink * 1.12 * lineWeight) / scale;
  const lineP = clamp(draw / 0.8);
  const fillP = smooth(0.5, 1, draw);
  const fx = flip ? -1 : 1;
  const mx = (MISREG.x * fx) / scale;
  const my = MISREG.y / scale;

  const inkCount = pen.layers.filter((l) => l.k === 'ink').length || 1;
  const fillCount = pen.layers.filter((l) => l.k === 'fill').length || 1;
  let inkIdx = 0;
  let fillIdx = 0;
  const sx = 1 + squash * 0.55;
  const sy = 1 - squash;

  const out: React.ReactNode[] = [];
  let bucket: React.ReactNode[] = out;
  let clipX: number | null = null;
  const clipped: React.ReactNode[] = [];

  for (let i = 0; i < pen.layers.length; i++) {
    const l: Layer = pen.layers[i];
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
    if (l.k === 'fill') {
      // each flat fill lands a beat after the lines, sliding into its misregistered spot
      const f0 = 0.5 + (fillIdx / fillCount) * 0.28;
      fillIdx += 1;
      const fp = draw >= 1 ? 1 : smooth(f0, f0 + 0.22, draw);
      if (fp <= 0) continue;
      const m = (l.misreg ?? 1) * (1 + (1 - fp) * 2.4);
      bucket.push(
        <path
          key={i}
          d={polyPath(l.pts)}
          fill={l.color}
          opacity={(l.opacity ?? 1) * fp * fill}
          transform={m ? `translate(${(mx * m).toFixed(2)} ${(my * m).toFixed(2)})` : undefined}
        />,
      );
      continue;
    }
    if (l.k === 'solid') {
      if (fillP <= 0) continue;
      // eyes / tufts are ink-coloured: they belong to the linework
      const isInk = l.color === c.ink;
      bucket.push(<path key={i} d={polyPath(l.pts)} fill={l.color} opacity={(l.opacity ?? 1) * (isInk ? Math.min(fillP, 1) * ink : fillP * fill)} />);
      continue;
    }
    if (l.k === 'node') {
      if (fillP <= 0) continue;
      bucket.push(
        <g key={i} transform={`translate(${l.at[0].toFixed(2)} ${l.at[1].toFixed(2)}) rotate(${l.rot.toFixed(2)})`} opacity={fillP}>
          {l.node}
        </g>,
      );
      continue;
    }
    // ink
    const start = (inkIdx / inkCount) * 0.6;
    inkIdx += 1;
    const p = clamp((lineP - start) / 0.4);
    if (p <= 0) continue;
    const d = brush(l.pts, {
      w: baseW * (l.w ?? 1),
      seed: l.seed,
      over: l.over,
      overStart: l.overStart,
      overEnd: l.overEnd,
      tipIn: l.tipIn,
      tipOut: l.tipOut,
      wobble: l.wobble,
      draw: p,
    });
    if (d) bucket.push(<path key={i} d={d} fill={l.color ?? c.ink} opacity={(l.opacity ?? 1) * ink} />);
  }
  if (bucket === clipped && clipped.length) {
    out.push(
      <g key="clip-end" clipPath={`url(#${clipId})`}>
        {clipped.splice(0)}
      </g>,
    );
  }

  return (
    <g
      transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${rotate.toFixed(2)}) scale(${(fx * scale).toFixed(4)} ${scale.toFixed(4)}) scale(${sx.toFixed(4)} ${sy.toFixed(4)})`}
      opacity={opacity}
    >
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
