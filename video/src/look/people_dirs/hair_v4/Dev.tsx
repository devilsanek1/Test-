// HAIR v4: the design desk. A row of panels, each one figure (or its head, magnified) with an optional head-unit grid
// and the rig drawn on top, to draw the cuts against the real heads and look at them while designing.
import React from 'react';
import {Fig4} from './render';
import {person4, type Who} from './people4';
import type {Shading} from './hair';
import type {View, Cut} from './cut';
import type {Part4} from './part4';
import {CUTS4} from './cuts';
import {MOTIONS, motionState, type MotionKind} from './motion4';

export type DevPanel = {who: Who; view: View; cut: string; headYaw?: number; shading?: Shading; grid?: boolean; bones?: boolean; px?: number; mono?: boolean; rim?: boolean; motion?: {kind: MotionKind; t: number}};
export type DevProps = {w: number; h: number; panels: DevPanel[]; zoom?: number; bg?: string; full?: boolean};

const NONE: Cut = {id: 'none', name: 'none', sex: 'f', spring: {k: 1, taper: 1, damp: 1, grav: 0, air: 0, limit: 10}, views: {}};

/** Grid lines in head units as thin parts (figure-local), drawn over the figure. */
function gridParts(P: (u: [number, number]) => [number, number], s: number): Part4[] {
  const out: Part4[] = [];
  for (let x = -10; x <= 10; x++) {
    const a = P([x / 10, -1.0]);
    const b = P([x / 10, 1.6]);
    out.push({name: 'grid', d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, fill: 'none', line: {w: x % 5 === 0 ? 0.006 * s : 0.0025 * s, color: x === 0 ? '#60E0FF' : '#FFFFFF'}, opacity: x % 5 === 0 ? 0.75 : 0.35, z: 98});
  }
  for (let y = -10; y <= 16; y++) {
    const a = P([-1.0, y / 10]);
    const b = P([1.0, y / 10]);
    out.push({name: 'grid', d: `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`, fill: 'none', line: {w: y % 5 === 0 ? 0.006 * s : 0.0025 * s, color: y === 0 ? '#60E0FF' : '#FFFFFF'}, opacity: y % 5 === 0 ? 0.75 : 0.35, z: 98});
  }
  return out;
}

export const DevSheet: React.FC<DevProps> = ({w, h, panels, zoom = 4.2, bg = '#4B4E6B', full}) => {
  const n = panels.length;
  const colW = w / Math.max(1, n);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={w} height={h} fill={bg} />
      {panels.map((pn, i) => {
        const cut = pn.cut === 'none' ? NONE : CUTS4[pn.cut];
        const M = pn.motion ? MOTIONS[pn.motion.kind] : null;
        const bob = M ? M.bob(pn.motion!.t) : ([0, 0] as [number, number]);
        const fig = person4(pn.who, {
          view: M ? M.view : pn.view,
          cut,
          headYaw: M ? M.headYaw(pn.motion!.t) ?? pn.headYaw : pn.headYaw,
          shading: pn.shading,
          px: pn.px ?? 900,
          bones: pn.bones,
          rim: pn.rim,
          bob,
          motion: M ? motionState(pn.motion!.kind, pn.who, pn.motion!.t) : undefined,
        });
        // the camera tracks a walk sideways (the cell follows the body) but not the bob (the bob shows)
        fig.head = [fig.head[0], fig.head[1] - bob[1]];
        if (pn.grid) fig.parts.push(...gridParts(fig.hf.P as (u: [number, number]) => [number, number], fig.hf.s));
        const x = colW * (i + 0.5);
        if (full) {
          const H = h * 0.86;
          return <Fig4 key={i} fig={fig} x={x} y={h - 30} h={H} uid={`d${i}`} mono={pn.mono ? '#211A1D' : undefined} />;
        }
        const H = h * zoom * 0.33;
        const sc = H / 1000;
        const cx = x - fig.head[0] * sc;
        const cy = h * 0.42 - fig.head[1] * sc;
        return (
          <g key={i}>
            <clipPath id={`dc${i}`}>
              <rect x={colW * i + 3} y={3} width={colW - 6} height={h - 6} />
            </clipPath>
            <g clipPath={`url(#dc${i})`}>
              <Fig4 fig={fig} x={cx} y={cy + H} h={H} uid={`d${i}`} mono={pn.mono ? '#211A1D' : undefined} />
            </g>
          </g>
        );
      })}
    </svg>
  );
};
