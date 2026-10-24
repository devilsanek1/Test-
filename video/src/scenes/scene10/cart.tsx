// S10 the makers' cart: rolls in from the left along the stoop line (behind the sign and the bollard), a maker pushing,
// a satchel of support tags and the struck 'still fixed!' sign on it. Two tags are tossed: a flick onto siteL's plaque
// (tick) and a high lob that arcs visibly OVER siteM's old plaque (dashed trail) onto siteR's (tick); then the cart
// speeds up and rolls out at the right edge.

import React from 'react';
import {palette} from '../../lib/theme';
import {useTime, prog} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Pt} from '../../lib/sketch';
import {MakersCart, SupportTag} from './kit';
import {mat, XG} from '../../lib/xf';
import {CartSign, Satchel} from './shims';
import {tagBodyOffset} from './plaques';

export const CART = {y: 1330, size: 115, v0: 494, vMax: 760, acc: 0.5};
const CS = CART.size / 140; // MakersCart local -> world

export type CartTimes = {
  /** The cart's nose crosses the left edge. */
  inAt: number;
  pull1: number;
  toss1: number;
  land1: number;
  pull2: number;
  toss2: number;
  land2: number;
  /** Scene end (the roll keeps going past it). */
  end: number;
};

/** Cart centre x at scene time t: constant pace through the tosses, then it speeds up toward the right edge. */
export function cartX(t: number, T: CartTimes): number {
  const {v0, vMax, acc} = CART;
  const xA = -57; // nose (bed half 57 px) at the left edge at inAt
  if (t <= T.land2) return xA + v0 * (t - T.inAt);
  const xB = xA + v0 * (T.land2 - T.inAt);
  const d = t - T.land2;
  const dv = vMax - v0;
  if (d < acc) return xB + v0 * d + (dv / 2) * (d - (acc / Math.PI) * Math.sin((Math.PI * d) / acc));
  return xB + v0 * acc + (dv / 2) * acc + vMax * (d - acc);
}

/** Where the satchel's mouth is on the cart (world) at t. */
const satchelAt = (t: number, T: CartTimes): Pt => [cartX(t, T) - 42, CART.y - 49 * (CART.size / 115) - 2];

/** A ballistic toss: body centre from `a` to `b` over [t0, t1], apex `h` px above the higher end. */
function tossPos(t: number, t0: number, t1: number, a: Pt, b: Pt, h: number): {p: Pt; u: number} {
  const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  const x = a[0] + (b[0] - a[0]) * u;
  const base = a[1] + (b[1] - a[1]) * u;
  const lift = Math.max(0, Math.min(a[1], b[1]) - Math.min(a[1], b[1]) + h);
  return {p: [x, base - 4 * lift * u * (1 - u)], u};
}

export type CartProps = {
  T: CartTimes;
  /** Body-centre landing points of the two tags (world): siteL's and siteR's hang points + tagBodyOffset. */
  land1: Pt;
  land2: Pt;
  tagSize: number;
};

/** The cart, its maker, the satchel and the sign. Draw it in front of the walker, behind the sign and the bollard. */
export const Cart: React.FC<{T: CartTimes}> = ({T}) => {
  const t = useTime();
  const t0 = T.inAt - 0.7;
  if (t < t0) return null;
  const tEnd = T.end + 0.4;
  const x0 = cartX(t0, T);
  const x1 = cartX(tEnd, T);
  const x = cartX(t, T);
  if (x - 123 * (CART.size / 115) - 60 > 1240) return null;
  const roll = {at: t0, to: [x1, CART.y] as Pt, dur: tEnd - t0, ease: (q: number) => (cartX(t0 + q * (tEnd - t0), T) - x0) / (x1 - x0)};
  const bedTop = CART.y - 60 * CS;
  return (
    <>
      <MakersCart x={x0} y={CART.y} size={CART.size} crates={1} roll={roll} pusher at={t0} seed="s10/cart" />
      <Satchel x={x - 42} y={bedTop + 2} w={30} pullAt={[T.pull1, T.pull2]} seed="s10/satchel" />
      <CartSign x={x + 44} y={bedTop} post={34} fontSize={22} seed="s10/csign" />
    </>
  );
};

/** The two flying tags (+ the dashed trail of the lob over siteM). Draw above the sign. */
export const Tosses: React.FC<CartProps> = ({T, land1, land2, tagSize}) => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  const fly = (key: string, t0: number, t1: number, b: Pt, h: number, spin: number, trail: boolean) => {
    if (t < t0) return;
    const a = satchelAt(t0, T);
    const a0: Pt = [a[0] - 18, a[1] - tagSize * 0.45 - 54]; // flicked up clear of the crate, the maker and the sign
    // the dashed trail: from the launch to the tag, retracting from its tail after the landing (0.3 s)
    if (trail && t < t1 + 0.32) {
      const uTail = t <= t1 ? 0 : prog(t, t1 + 0.02, 0.3);
      const uHead = Math.min(1, (t - t0) / (t1 - t0));
      if (uHead - uTail > 0.02) {
        let d = '';
        const n = 26;
        for (let i = 0; i <= n; i++) {
          const u = uTail + ((uHead - uTail) * i) / n;
          const q = tossPos(t0 + u * (t1 - t0), t0, t1, a0, b, h).p;
          d += `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
        }
        out.push(<Ink key={`${key}tr`} d={d} width={2.6} dash="2 11" color={palette.ink} taper={false} seed={`s10/${key}tr`} />);
      }
    }
    if (t >= t1) return;
    const {p, u} = tossPos(t, t0, t1, a0, b, h);
    // the tag spins about its body centre on the way (its check is drawn only when it lands)
    out.push(
      <XG key={key} m={mat.about(mat.rotate(-spin * 360 * u), p[0], p[1])}>
        <SupportTag x={p[0]} y={p[1] - tagBodyOffset(tagSize)} size={tagSize} checkAt={t1 + 1} seed={`s10/${key}`} />
      </XG>,
    );
  };
  fly('toss1', T.toss1, T.land1, land1, 60, 1, false);
  fly('toss2', T.toss2, T.land2, land2, 205, 1.5, true);
  return <>{out}</>;
};
