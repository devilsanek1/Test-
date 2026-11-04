// HAIR v4: Fig4, the figure renderer for Part4 (graphic/Figure.tsx plus gradients, soft regions and the silhouette rim).
// It draws a built figure at a height (px) with its soles at (x, y), parts in z order; each part is its fill (flat or a
// gradient), its regions clipped by its outline (flat, gradient, or blurred), then its rim band.
import React from 'react';
import type {Part4, Paint, Region4} from './part4';

let SEQ = 0;
export type Fig4Built = {parts: Part4[]; box?: {x0: number; x1: number; y0: number; y1: number}; head: [number, number]};
export type Fig4Props = {
  fig: Fig4Built;
  x: number;
  y: number;
  h: number;
  flip?: boolean;
  mono?: string;
  uid?: string;
  shadow?: boolean;
  /** draw only parts whose name passes (a bust: skip the legs) */
  only?: (p: Part4) => boolean;
};

const grad = (id: string, p: Paint) => (
  <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={p.a[0]} y1={p.a[1]} x2={p.b[0]} y2={p.b[1]}>
    {p.stops.map(([o, c, a], i) => (
      <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
    ))}
  </linearGradient>
);

export const Fig4: React.FC<Fig4Props> = ({fig, x, y, h, flip, mono, uid, shadow = true, only}) => {
  const s = h / 1000;
  const id = uid ?? `f4_${++SEQ}`;
  const parts = fig.parts.filter((p) => !only || only(p)).slice().sort((a, b) => a.z - b.z);
  // the figure's silhouette for the rim bands: every solid part
  const solid = parts.filter((p) => !p.ground && !p.line && p.d && (p.opacity ?? 1) > 0.5);
  return (
    <g transform={`translate(${x},${y - h}) scale(${flip ? -s : s},${s})`}>
      {parts.map((p, i) => {
        if (p.ground) {
          if (!shadow || mono) return null;
          return <path key={i} d={p.d} fill={p.fill} opacity={p.opacity ?? 1} />;
        }
        if (p.line) {
          return <path key={i} d={p.d} fill="none" stroke={mono ?? p.line.color} strokeWidth={p.line.w} strokeLinecap={p.line.cap ?? 'round'} strokeLinejoin="round" opacity={p.opacity ?? 1} />;
        }
        const cid = `${id}-c${i}`;
        const gid = `${id}-g${i}`;
        const regs: Region4[] = mono ? [] : (p.regions ?? []).filter((r) => r.d);
        const fill = mono ? mono : p.paint ? `url(#${gid})` : p.fill;
        const rb = !mono && p.rimBand ? p.rimBand : null;
        const cut = p.cut ? `${id}-k${i}` : '';
        return (
          <g key={i} opacity={p.opacity ?? 1} clipPath={cut ? `url(#${cut})` : undefined}>
            <defs>
              {cut ? (
                <clipPath id={cut}>
                  <path d={`M-6000 -6000H6000V8000H-6000Z${p.cut}`} clipRule="evenodd" />
                </clipPath>
              ) : null}
              {p.paint && !mono ? grad(gid, p.paint) : null}
              {regs.length || rb ? (
                <clipPath id={cid}>
                  <path d={p.d} />
                </clipPath>
              ) : null}
              {regs.map((r, j) => (
                <React.Fragment key={j}>
                  {r.paint ? grad(`${gid}r${j}`, r.paint) : null}
                  {r.blur ? (
                    <filter id={`${id}-b${i}_${j}`} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={6000} height={9000}>
                      <feGaussianBlur stdDeviation={r.blur} />
                    </filter>
                  ) : null}
                </React.Fragment>
              ))}
              {rb ? (
                <mask id={`${id}-m${i}`} maskUnits="userSpaceOnUse" x={-3000} y={-3000} width={6000} height={9000}>
                  <path d={p.d} fill="#fff" />
                  <g transform={`translate(${rb.dx},${rb.dy})`}>
                    {solid.map((q, k) => (
                      <path key={k} d={q.d} fill="#000" />
                    ))}
                  </g>
                </mask>
              ) : null}
              {rb && rb.blur ? (
                <filter id={`${id}-rb${i}`} filterUnits="userSpaceOnUse" x={-3000} y={-3000} width={6000} height={9000}>
                  <feGaussianBlur stdDeviation={rb.blur} />
                </filter>
              ) : null}
            </defs>
            <path d={p.d} fill={fill} />
            {regs.length ? (
              <g clipPath={`url(#${cid})`}>
                {regs.map((r, j) => (
                  <path key={j} d={r.d} fill={r.paint ? `url(#${gid}r${j})` : r.fill} opacity={r.opacity ?? 1} filter={r.blur ? `url(#${id}-b${i}_${j})` : undefined} />
                ))}
              </g>
            ) : null}
            {rb ? (
              <g clipPath={`url(#${cid})`}>
                <g mask={`url(#${id}-m${i})`}>
                  <rect x={-3000} y={-3000} width={6000} height={9000} fill={rb.color} opacity={rb.opacity ?? 1} filter={rb.blur ? `url(#${id}-rb${i})` : undefined} />
                </g>
              </g>
            ) : null}
          </g>
        );
      })}
    </g>
  );
};
