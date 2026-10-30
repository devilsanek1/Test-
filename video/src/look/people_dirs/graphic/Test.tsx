// MODERN GRAPHIC people: a quick test frame (one or more figures in a row, optionally the heads magnified).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Figure} from './Figure';
import {build, Who, View} from './cast';
import {BG} from './palette';

export const TEST_W = 2000;
export const TEST_H = 1100;
export type TestProps = {h: number; items: {who: Who; view: View}[]; heads?: boolean; bg?: string};

export const GrTest: React.FC<TestProps> = ({h, items, heads, bg}) => {
  const n = items.length;
  const colW = TEST_W / Math.max(1, n);
  return (
    <AbsoluteFill style={{background: bg ?? BG.sheet}}>
      <svg width={TEST_W} height={TEST_H} viewBox={`0 0 ${TEST_W} ${TEST_H}`}>
        {items.map((it, i) => {
          const fig = build(it.who, it.view);
          const x = colW * (i + 0.5);
          if (heads) {
            // the head and shoulders, 3x: the figure drawn 3x taller with its head near the top
            const hh = h * 3;
            return (
              <g key={i}>
                <clipPath id={`tc${i}`}>
                  <rect x={colW * i + 6} y={20} width={colW - 12} height={TEST_H - 40} />
                </clipPath>
                <g clipPath={`url(#tc${i})`}>
                  <Figure fig={fig} x={x} y={60 + hh} h={hh} uid={`t${i}`} />
                </g>
              </g>
            );
          }
          return <Figure key={i} fig={fig} x={x} y={TEST_H - 60} h={h} uid={`t${i}`} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
