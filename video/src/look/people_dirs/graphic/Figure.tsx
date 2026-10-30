// MODERN GRAPHIC people: draws a built figure at a height (px) with its soles at (x, y). Each part is its lit fill,
// then its regions clipped by its own outline: two flat tones and a crisp terminator, never a gradient or an outline.
import React from 'react';
import type {Built, Part} from './part';

let SEQ = 0;

export type FigProps = {
  fig: Built;
  /** where the soles' centre stands (px) and the figure's height (px, crown to sole) */
  x: number;
  y: number;
  h: number;
  /** mirror (a figure facing the other way under a mirrored rig) */
  flip?: boolean;
  /** every fill in one colour (the black silhouette test) */
  mono?: string;
  /** an id prefix for the clips (unique per instance) */
  uid?: string;
  /** draw the ground contact shadow */
  shadow?: boolean;
  shadowColor?: string;
};

export const Figure: React.FC<FigProps> = ({fig, x, y, h, flip, mono, uid, shadow = true, shadowColor}) => {
  const s = h / 1000;
  const id = uid ?? `gf${++SEQ}`;
  const parts = fig.parts.slice().sort((a, b) => a.z - b.z);
  return (
    <g transform={`translate(${x},${y - h}) scale(${flip ? -s : s},${s})`}>
      {parts.map((p: Part, i) => {
        if (p.ground) {
          if (!shadow || mono) return null;
          return <path key={i} d={p.d} fill={shadowColor ?? p.fill} opacity={p.opacity ?? 1} />;
        }
        if (p.line) {
          return (
            <path
              key={i}
              d={p.d}
              fill="none"
              stroke={mono ?? p.line.color}
              strokeWidth={p.line.w}
              strokeLinecap={p.line.cap ?? 'round'}
              strokeLinejoin="round"
              opacity={p.opacity ?? 1}
            />
          );
        }
        const regs = mono ? [] : (p.regions ?? []).filter((r) => r.d);
        const cid = `${id}-${i}`;
        const cut = p.cut ? `${id}-${i}c` : '';
        return (
          <g key={i} opacity={p.opacity ?? 1} clipPath={cut ? `url(#${cut})` : undefined}>
            {cut ? (
              <clipPath id={cut}>
                <path d={`M-6000 -6000H6000V8000H-6000Z${p.cut}`} clipRule="evenodd" />
              </clipPath>
            ) : null}
            <path d={p.d} fill={mono ?? p.fill} />
            {regs.length ? (
              <>
                <clipPath id={cid}>
                  <path d={p.d} />
                </clipPath>
                <g clipPath={`url(#${cid})`}>
                  {regs.map((r, j) => (
                    <path key={j} d={r.d} fill={r.fill} opacity={r.opacity ?? 1} />
                  ))}
                </g>
              </>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
