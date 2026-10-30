// HAIR v2: a quick test frame (figures in a row, optionally magnified heads), for looking while building.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Figure} from '../graphic/Figure';
import {BG} from '../graphic/palette';
import {build as buildOld} from '../graphic_faces/cast';
import {herV2, personV2, lookOf, type View} from './people';
import {STATES, type StateName} from './states';

export const HT_W = 2000;
export const HT_H = 1100;
export type HtItem = {who: string; view: View; state?: StateName; px?: number; ver?: 2 | 3};
export type HtProps = {h: number; items: HtItem[]; heads?: number; bg?: string; mono?: boolean};

export const HvTest: React.FC<HtProps> = ({h, items, heads, bg, mono}) => {
  const n = items.length;
  const colW = HT_W / Math.max(1, n);
  return (
    <AbsoluteFill style={{background: bg ?? BG.sheet}}>
      <svg width={HT_W} height={HT_H} viewBox={`0 0 ${HT_W} ${HT_H}`}>
        {items.map((it, i) => {
          const H = heads ? h * heads : h;
          const px = it.px ?? h;
          const fig = it.who === 'old' ? buildOld('herEvening', it.view, 'lash') : it.who === 'her' ? herV2({view: it.view, state: STATES[it.state ?? 'calm'], px, ver: it.ver}) : personV2(lookOf(it.who), {view: it.view, state: STATES[it.state ?? 'calm'], px, ver: it.ver});
          const x = colW * (i + 0.5);
          if (heads) {
            const s = H / 1000;
            const cx = x - fig.head[0] * s;
            const cy = HT_H * 0.3 - fig.head[1] * s;
            return (
              <g key={i}>
                <clipPath id={`tc${i}`}>
                  <rect x={colW * i + 4} y={4} width={colW - 8} height={HT_H - 8} />
                </clipPath>
                <g clipPath={`url(#tc${i})`}>
                  <Figure fig={fig} x={cx} y={cy + H} h={H} uid={`t${i}`} mono={mono ? '#2A2124' : undefined} />
                </g>
              </g>
            );
          }
          return <Figure key={i} fig={fig} x={x} y={HT_H - 50} h={H} uid={`t${i}`} mono={mono ? '#2A2124' : undefined} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};
