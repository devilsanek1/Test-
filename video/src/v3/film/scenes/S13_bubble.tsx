// S13_bubble (lane L3-you): the thought bubble for S13, the kit ThoughtBubble's look (warm-white cloud, mid ink, two
// trailing circles to the thinker's head, the same pop from the tail) with the cloud CENTRED on (cx, cy), radii
// (rx, ry). Stopgap: kit ThoughtBubble passes crown(cx, cy + 0.92 ry, rx, 1.84 ry), and crown takes an ellipse
// centre and radii, so its cloud spans cy - 0.92 ry .. cy + 2.76 ry and swallows the head and its own dots
// (REQUEST to the kit lane in the L3 report). Swap back to the kit's ThoughtBubble once it is fixed.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, crown} from '../../../lib/sketch';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, type Pt} from '../kit';

export const S13Bubble: React.FC<{cx: number; cy: number; rx: number; ry: number; to: Pt; at?: number; seed?: string; ink?: number; children?: React.ReactNode}> = ({cx, cy, rx, ry, to, at, seed = 's13/bubble', ink = 3.4, children}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const s = at === undefined ? 1 : 0.2 + 0.8 * prog(t, at, 0.16, ease.outBack(1.3));
  const cloud = crown(cx, cy, rx, ry, {seed: `${seed}/c`, bumps: 9, round: 0.75});
  // the rim point facing the head, then the two circles stepping down to it
  const th = Math.atan2((to[1] - cy) / ry, (to[0] - cx) / rx);
  const rim: Pt = [cx + Math.cos(th) * rx, cy + Math.sin(th) * ry];
  const at01 = (k: number): Pt => [rim[0] + (to[0] - rim[0]) * k, rim[1] + (to[1] - rim[1]) * k];
  const d1 = at01(0.38);
  const d2 = at01(0.76);
  const r1 = Math.max(10, rx * 0.105);
  const r2 = Math.max(7, rx * 0.066);
  return (
    <XG m={mat.about(mat.scale(s), to[0], to[1])}>
      <Fill d={blob(d2[0], d2[1], r2, r2, {seed: `${seed}/d2`})} color={EMBER.card} offset={false} />
      <Ink d={circle(d2[0], d2[1], r2, {seed: `${seed}/d2I`})} width={ink * 0.8} />
      <Fill d={blob(d1[0], d1[1], r1, r1, {seed: `${seed}/d1`})} color={EMBER.card} offset={false} />
      <Ink d={circle(d1[0], d1[1], r1, {seed: `${seed}/d1I`})} width={ink * 0.8} />
      <Fill d={cloud} color={EMBER.card} offset={false} />
      <Ink d={cloud} width={ink} />
      {children}
    </XG>
  );
};
