// PT lane probe 2 (temporary): the cost of a per-plane mottle filter. Four planes of ~300 flat rects each, each in its
// own float group (dx animated by frame), with or without the filter (variant 'none' | 'turb' | 'image').
import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';
import {rng} from '../../lib/rng';

const COLS = ['#F4D6C2', '#EFCEB9', '#E2C1AD', '#C5DDD3', '#C9806A', '#D6A695', '#3A5065', '#86B4AC'];
const PLANES = [0.05, 0.35, 0.6, 1];

const rects = PLANES.map((_, p) => {
  const r = rng(`probe2/${p}`);
  return Array.from({length: 300}, (_, i) => ({x: r.range(-40, 1080), y: 300 + p * 400 + r.range(0, 420), w: r.range(20, 120), h: r.range(10, 80), c: COLS[(i + p) % COLS.length]}));
});

const Filt: React.FC<{id: string; variant: string; seed: number}> = ({id, variant, seed}) =>
  variant === 'turb' ? (
    <filter id={id} filterUnits="userSpaceOnUse" x={-160} y={-160} width={1400} height={2240} colorInterpolationFilters="sRGB">
      <feTurbulence type="fractalNoise" baseFrequency={0.012} numOctaves={2} seed={seed} result="t" />
      <feColorMatrix in="t" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="g" />
      <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1={0.06} k2={0.97} k3={0} k4={0} />
    </filter>
  ) : (
    <filter id={id} filterUnits="userSpaceOnUse" x={-160} y={-160} width={1400} height={2240} colorInterpolationFilters="sRGB">
      <feImage href={staticFile('look/pt/probe_mottle.png')} x={-seed * 37} y={-seed * 53} width={512} height={512} preserveAspectRatio="none" result="img" />
      <feTile in="img" result="g" />
      <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1={0.05} k2={1 - 0.05 * (128 / 255)} k3={0} k4={0} />
    </filter>
  );

export const PtProbe2: React.FC<{variant: 'none' | 'turb' | 'image'}> = ({variant}) => {
  const f = useCurrentFrame();
  const dx = Math.sin(f / 20) * 6;
  const dy = Math.cos(f / 27) * 4;
  return (
    <AbsoluteFill style={{background: '#C5DDD3'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        {PLANES.map((k, p) => (
          <g key={p} transform={`translate(${(dx * k).toFixed(3)} ${(dy * k).toFixed(3)})`}>
            {variant !== 'none' ? (
              <defs>
                <Filt id={`pf${p}`} variant={variant} seed={p + 1} />
              </defs>
            ) : null}
            <g filter={variant !== 'none' ? `url(#pf${p})` : undefined}>
              {rects[p].map((r, i) => (
                <rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} fill={r.c} />
              ))}
            </g>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
