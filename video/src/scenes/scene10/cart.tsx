// S10 the makers' cart on the stoop line (y 1306, just behind the stoops' fronts: its wheels pass clear above Pip's
// ears; behind the stoops, the A-frame sign, the hanging plaques and the bollard). On 'old' + 0.15
// the maker + cart pop up and step out from behind the A-frame's RIGHT edge into the clear part of the frame (siteM's
// stoop), walking slowly while he hands out tags: a short flick back-left onto siteL's plaque (tick), then a lob OVER
// siteM's old plaque (dashed trail, retracted from its tail right after the landing) onto siteR's (tick). Then he speeds
// up (<= 18 px / frame on screen: flat ink strobes above it) and rolls out at the right edge. S09's 'still fixing... /
// fixed!' card (shared FixSign) is pinned flat on the cart's front under the deck, below plaque height.

import React from 'react';
import {palette} from '../../lib/theme';
import {useTime, prog, ease as E} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import type {Pt} from '../../lib/sketch';
import {FixSign, MakersCart, PopUp, SupportTag} from './kit';
import {mat, XG} from '../../lib/xf';
import {Satchel} from './shims';
import {tagBodyOffset} from './plaques';

/** Cart line (feet y), bed length, the step-out (x at `inAt`, entry speed decaying to a slow walk), the roll-out. */
export const CART = {y: 1306, size: 115, xIn: 560, vIn: 200, vWalk: 45, tau: 0.25, vMax: 500, acc: 0.5};
const CS = CART.size / 140; // MakersCart local -> world
/** The maker walks this far behind the cart centre (MakersCart: 150 local units). */
export const MAKER_DX = -150 * CS;

export type CartTimes = {
  /** The maker + cart pop up / step out from behind the A-frame. */
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

/** Cart centre x at scene time t: a step out that slows to a walk through the tosses, then the speed-up (sine ramp to
 *  vMax over `acc` s, from the second toss's launch) and the roll out at the right edge. */
export function cartX(t: number, T: CartTimes): number {
  const {xIn, vIn, vWalk, tau, vMax, acc} = CART;
  const walk = (d: number) => xIn + vWalk * d + (vIn - vWalk) * tau * (1 - Math.exp(-d / tau));
  const d0 = Math.max(0, t - T.inAt);
  const tB = T.toss2;
  if (t <= tB) return walk(d0);
  const xB = walk(tB - T.inAt);
  const vB = vWalk + (vIn - vWalk) * Math.exp(-(tB - T.inAt) / tau);
  const d = t - tB;
  const dv = vMax - vB;
  if (d < acc) return xB + vB * d + (dv / 2) * (d - (acc / Math.PI) * Math.sin((Math.PI * d) / acc));
  return xB + vB * acc + (dv / 2) * acc + vMax * (d - acc);
}

/** Where a tag is flicked up from (world) at t: a head above the maker, clear of him, the plaques and the A-frame (the
 *  satchel's pulled tag is gone two frames before it appears here). */
export const throwHand = (t: number, T: CartTimes): Pt => [cartX(t, T) + MAKER_DX + 2, 1064];

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

/** The cart, its maker, the satchel and the sign card. Drawn in the set's cart slot (behind the plaques and the sign). */
export const Cart: React.FC<{T: CartTimes}> = ({T}) => {
  const t = useTime();
  const t0 = T.inAt;
  if (t < t0) return null;
  const tEnd = T.end + 0.4;
  const x0 = cartX(t0, T);
  const x1 = cartX(tEnd, T);
  const x = cartX(t, T);
  if (x + MAKER_DX - 40 > 1240) return null;
  const roll = {at: t0, to: [x1, CART.y] as Pt, dur: tEnd - t0, ease: (q: number) => (cartX(t0 + q * (tEnd - t0), T) - x0) / (x1 - x0)};
  const bedTop = CART.y - 60 * CS;
  const bedBot = CART.y - 47 * CS;
  return (
    <PopUp at={t0} x={x} y={CART.y} over={0.06}>
      <MakersCart x={x0} y={CART.y} size={CART.size} crates={1} roll={roll} pusher seed="s10/cart" />
      <Satchel x={x - 46} y={bedTop + 2} w={30} pullAt={[T.pull1, T.pull2]} seed="s10/satchel" />
      {/* S09's sign card, pinned flat on the cart's front under the deck (never up in the plaque band) */}
      <FixSign x={x + 66} y={bedBot + 1} fs={16} string={false} rot={-3} strikeAt={-10} fixedAt={-10} ink={2.2} seed="s10/csign" />
    </PopUp>
  );
};

/** The two flying tags (+ the dashed trail of the lob over siteM). Drawn above the plaques and the sign. */
export const Tosses: React.FC<CartProps> = ({T, land1, land2, tagSize}) => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  const fly = (key: string, t0: number, t1: number, b: Pt, h: number, spin: number, trail: boolean) => {
    if (t < t0) return;
    const a0 = throwHand(t0, T);
    // the dashed trail: from the hand to the tag; after the landing it retracts from its tail in 0.16 s (no fade)
    if (trail && t < t1 + 0.16) {
      const uTail = t <= t1 ? 0 : E.inOutSine(prog(t, t1, 0.16));
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
  // a short flick back-left onto siteL's plaque, then the lob over siteM's (apex under siteM's window, over its bracket)
  fly('toss1', T.toss1, T.land1, land1, 36, -1, false);
  fly('toss2', T.toss2, T.land2, land2, 40, 1.5, true);
  return <>{out}</>;
};
