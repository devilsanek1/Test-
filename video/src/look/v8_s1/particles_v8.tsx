// v8_s1: the GUST's leaves (paint_test/v8_card.md §1, §9: "a little surprising, alive"): a handful of autumn leaves from
// the plaza's tree caught in the wind off the water as she steps out, tumbling past her right to left: small, warm,
// each its own size, turn and tone, two-toned (their lit half toward the low sun), a couple nearer the camera and
// softer. Tier B/C: small and few, never on her face, never in the caption band. (In motion they drift and turn.)
import React from 'react';
import {useMoverOn} from './context';

type Leaf = {x: number; y: number; s: number; rot: number; col: string; lit: string; blur?: number};
/** Screen px at 1.0 s (the still): around her shoulders and knees, one by her feet, two near the lens. */
export const LEAVES: Leaf[] = [
  {x: 812, y: 1052, s: 13, rot: -28, col: '#C8693F', lit: '#F2B27A'},
  {x: 862, y: 1206, s: 10, rot: 64, col: '#D9963F', lit: '#FFD08A'},
  {x: 455, y: 1118, s: 11, rot: 140, col: '#B8523E', lit: '#EE9C74'},
  {x: 778, y: 1388, s: 15, rot: -110, col: '#CC7B42', lit: '#F7BF83'},
  {x: 402, y: 1342, s: 12, rot: 22, col: '#D69A4C', lit: '#FFD394'},
  {x: 720, y: 1546, s: 9, rot: -60, col: '#B85A3F', lit: '#E8A07A'},
  {x: 948, y: 1468, s: 26, rot: 38, col: '#C86C43', lit: '#F4B27E', blur: 1.6},
  {x: 168, y: 1612, s: 30, rot: -150, col: '#D49448', lit: '#FFCF92', blur: 2.2},
];

const leafPath = (s: number) => {
  const w = s * 0.42;
  return `M${-s} 0C${-s * 0.4} ${-w} ${s * 0.4} ${-w} ${s} 0C${s * 0.4} ${w} ${-s * 0.4} ${w} ${-s} 0Z`;
};
const litHalf = (s: number) => {
  const w = s * 0.42;
  return `M${-s} 0C${-s * 0.4} ${-w} ${s * 0.4} ${-w} ${s} 0C${s * 0.3} ${-w * 0.2} ${-s * 0.3} ${-w * 0.2} ${-s} 0Z`;
};

export const GustLeaves: React.FC = () => {
  const on = useMoverOn('particles');
  if (!on) return null;
  return (
    <g>
      <defs>
        {[1.6, 2.2].map((b) => (
          <filter key={b} id={`v8leafblur${String(b).replace('.', '')}`} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={b} />
          </filter>
        ))}
      </defs>
      {LEAVES.map((l, i) => (
        <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.rot})`} filter={l.blur ? `url(#v8leafblur${String(l.blur).replace('.', '')})` : undefined}>
          <path d={leafPath(l.s)} fill={l.col} />
          <path d={litHalf(l.s)} fill={l.lit} opacity={0.85} />
          <path d={`M${-l.s} 0L${-l.s * 1.35} ${l.s * 0.08}`} stroke={l.col} strokeWidth={Math.max(1, l.s * 0.08)} strokeLinecap="round" />
        </g>
      ))}
    </g>
  );
};
