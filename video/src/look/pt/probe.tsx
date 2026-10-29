// PT lane probe (temporary): can an SVG filter carry a world-locked mottle through a sub-pixel float? Variants:
// 'none' (flat), 'turb' (feTurbulence), 'image' (feImage of a tileable PNG + feTile). props.dx = the group's x offset.
import React from 'react';
import {AbsoluteFill, staticFile, useCurrentFrame} from 'remotion';

const FIELDS = ['#F4D6C2', '#C5DDD3', '#C9806A', '#3A5065'];

export const PtProbe: React.FC<{variant: 'none' | 'turb' | 'image'; dx: number; k1: number; freq: number; oct: number; lin?: boolean}> = ({variant, dx, k1, freq, oct, lin}) => {
  useCurrentFrame();
  const f = variant === 'none' ? undefined : 'url(#ptm)';
  return (
    <AbsoluteFill style={{background: '#FFFFFF'}}>
      <svg width={1080} height={1920} viewBox="0 0 1080 1920">
        <g transform={`translate(${dx} 0)`}>
          <defs>
            {variant === 'turb' ? (
              <filter id="ptm" filterUnits="userSpaceOnUse" x={-60} y={-60} width={1200} height={2040} colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves={oct} seed={3} result="t" />
                <feColorMatrix in="t" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1" result="g" />
                <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1={k1} k2={1 - k1 * 0.5} k3={0} k4={0} colorInterpolationFilters={lin ? "linearRGB" : "sRGB"} />
              </filter>
            ) : variant === 'image' ? (
              <filter id="ptm" filterUnits="userSpaceOnUse" x={-60} y={-60} width={1200} height={2040} colorInterpolationFilters="sRGB">
                <feImage href={staticFile('look/pt/probe_mottle.png')} x={0} y={0} width={512} height={512} preserveAspectRatio="none" result="img" />
                <feTile in="img" result="g" />
                <feComposite in="SourceGraphic" in2="g" operator="arithmetic" k1={k1} k2={1 - k1 * (128 / 255)} k3={0} k4={0} colorInterpolationFilters={lin ? "linearRGB" : "sRGB"} />
              </filter>
            ) : null}
          </defs>
          <g filter={f}>
            {FIELDS.map((c, i) => (
              <rect key={c} x={i * 270} y={100} width={270} height={1700} fill={c} />
            ))}
            {/* a hard vertical edge and a 2 px line, to see whether the layer snaps */}
            <rect x={300.0} y={1820} width={2} height={80} fill="#3A5065" />
          </g>
        </g>
      </svg>
    </AbsoluteFill>
  );
};
