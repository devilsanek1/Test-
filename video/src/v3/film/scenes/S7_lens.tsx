// S7_lens (lane L4-desk): the see-inside bubble of S7. The board's circle + line (a callout from a spot on the
// laptop's keyboard up to a round bubble that holds the memory stick) as a real prop: a warm-white disc with a mid
// ink ring, a slim warm-white wedge tail (ink on both sides) running down to the spot on the deck, where it ends in a
// small ring (the "here, inside"). It grows out of that spot (scale 0.2 -> 1 about the tip, 0.14 s, a small
// overshoot, like the kit bubbles); the contents pop a beat later. Flat: no fades, no gradients.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, ellipse, polyPath} from '../../../lib/sketch';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Pop, type Pt} from '../kit';

export type S7LensProps = {
  /** Bubble centre and radius (canvas px). */
  cx: number;
  cy: number;
  r: number;
  /** The spot on the laptop the bubble looks into (the tail's tip). */
  tip: Pt;
  /** Pop time (scene seconds). */
  at: number;
  /** When the contents pop (default at + 0.08). */
  contentAt?: number;
  seed?: string;
  ink?: number;
  children?: React.ReactNode;
};

export const S7Lens: React.FC<S7LensProps> = ({cx, cy, r, tip, at, contentAt, seed = 's7/lens', ink = 3.4, children}) => {
  const t = useTime();
  if (t < at) return null;
  const s = 0.2 + 0.8 * prog(t, at, 0.14, ease.outBack(1.3));
  // the tail: a slim wedge from the rim (base +-0.2 rad around the direction to the tip, set inside the disc so the
  // disc's own fill covers the join) down to the tip
  const ang = Math.atan2(tip[1] - cy, tip[0] - cx);
  const baseR = r * 0.9;
  const b1: Pt = [cx + Math.cos(ang - 0.2) * baseR, cy + Math.sin(ang - 0.2) * baseR];
  const b2: Pt = [cx + Math.cos(ang + 0.2) * baseR, cy + Math.sin(ang + 0.2) * baseR];
  // the spot: a small ellipse lying on the deck (3/4 from above); the tail stops at its rim
  const ra = 16;
  const rb = 10;
  const rimD = (ra * rb) / Math.hypot(rb * Math.cos(ang), ra * Math.sin(ang));
  const end: Pt = [tip[0] - Math.cos(ang) * rimD, tip[1] - Math.sin(ang) * rimD];
  const nx = -Math.sin(ang);
  const ny = Math.cos(ang);
  const e1: Pt = [end[0] + nx * 3, end[1] + ny * 3];
  const e2: Pt = [end[0] - nx * 3, end[1] - ny * 3];
  const tail = polyPath([b1, e1, e2, b2]);
  return (
    <XG m={mat.about(mat.scale(s), tip[0], tip[1])}>
      <Fill d={tail} color={EMBER.card} offset={false} />
      <Ink d={`M${b1[0].toFixed(1)} ${b1[1].toFixed(1)}L${e1[0].toFixed(1)} ${e1[1].toFixed(1)}M${b2[0].toFixed(1)} ${b2[1].toFixed(1)}L${e2[0].toFixed(1)} ${e2[1].toFixed(1)}`} width={ink * 0.7} taper={false} />
      {/* the spot on the deck */}
      <Fill d={blob(tip[0], tip[1], ra, rb, {seed: `${seed}/spot`})} color={EMBER.card} offset={false} />
      <Ink d={ellipse(tip[0], tip[1], ra, rb, {seed: `${seed}/spotI`})} width={ink * 0.7} />
      {/* the disc */}
      <Fill d={blob(cx, cy, r, r, {seed: `${seed}/disc`, wobble: 0.015})} color={EMBER.card} seed={`${seed}/discF`} />
      <Ink d={circle(cx, cy, r, {seed: `${seed}/discI`})} width={ink} />
      <Pop at={contentAt ?? at + 0.08} x={cx} y={cy} dur={0.12} overshoot>
        {children}
      </Pop>
    </XG>
  );
};
