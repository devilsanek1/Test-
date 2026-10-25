// S10 the makers' cart on the stoop line (y 1306, just behind the stoops' fronts; behind the stoops, the A-frame sign, the
// hanging plaques and the bollard). Fix round 2 staging, so the hand-out and the SKIP are seen whole:
//  - on 'old' + 0.15 the maker + cart pop up beside the A-frame's right edge and step out (<= 14 px / frame, out-quad),
//    (0.28 s, still 4 frames before the first arm moves), then PARK with the maker in the clear wall between siteL's plaque and siteM's plaque (x 455: nothing in front of him
//    but the A-frame's thin back edge), the cart under siteM's plaque;
//  - each toss is thrown from a RAISED arm (FigureArm, the tag in the hand, released a head above him, clear of every
//    plaque): the LEFT arm flicks a short lob back-left onto siteL's plaque (tick on 'officially'), then the RIGHT arm
//    lobs the second tag high OVER siteM's old plaque (apex >= 74 px above its top, dashed trail) onto siteR's (tick on
//    'supported');
//  - he stays parked through Pip's 'hey!' (the spark has clear wall to the plaque: the cart's front ends at x 612) and
//    rolls out right on 'anymore' (sine ramp to 500 px/s: <= 18 px / frame on screen).
// S09's 'still fixing... / fixed!' card (the shared FixSign, the SAME object as S06 / S07 / S09) hangs flat on a short post
// on the cart's camera-facing side over the wheel, fs 21 ('fixed!' 24.7 px on screen), between siteM's plaque bottom
// (1224) and the stoops (1300). The satchel of tags hangs at the maker's right hip.

import React from 'react';
import {palette} from '../../lib/theme';
import {useTime, prog, ease as E} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import type {Pt} from '../../lib/sketch';
import {FIG_H, FigureArm, FixSign, MakersCart, PopUp, SI, SupportTag} from './kit';
import {mat, XG} from '../../lib/xf';
import {Satchel} from './shims';
import {tagBodyOffset, TAG_W} from './plaques';

/** Cart line (feet y), bed length, the park spot (cart centre), the step-out, the roll-out. */
export const CART = {y: 1306, size: 100, parkX: 562, stepIn: 64, stepDur: 0.28, vMax: 500, acc: 0.5};
const CS = CART.size / 140; // MakersCart local -> world
/** The maker walks this far behind the cart centre (MakersCart: 150 local units). */
export const MAKER_DX = -150 * CS;
/** The maker's figure frame (props Maker: h = 200 local x CS; hip = feet - 62 x figure scale). */
const MAKER_H = 200 * CS;
const SF = MAKER_H / FIG_H;
const HIP_Y = CART.y - 62 * SF;

export type CartTimes = {
  /** The maker + cart pop up / step out beside the A-frame. */
  inAt: number;
  /** Releases (the left arm, then the right) and landings. */
  toss1: number;
  land1: number;
  toss2: number;
  land2: number;
  /** Rolls out right. */
  rollAt: number;
  /** Scene end (the roll keeps going past it). */
  end: number;
};

/** Cart centre x at scene time t: the step-out, parked, then the roll-out (sine ramp to vMax over `acc` s). */
export function cartX(t: number, T: CartTimes): number {
  const {parkX, stepIn, stepDur, vMax, acc} = CART;
  if (t < T.rollAt) return parkX - stepIn + stepIn * E.outQuad(prog(t, T.inAt, stepDur));
  const d = t - T.rollAt;
  if (d < acc) return parkX + (vMax / 2) * (d - (acc / Math.PI) * Math.sin((Math.PI * d) / acc));
  return parkX + (vMax * acc) / 2 + vMax * (d - acc);
}

/** The arm for each toss: side -1 = his left (screen left), +1 = right. Person-local shoulder / hand points. */
const SHOULDER = (side: number): Pt => [side * 32, -76];
const HAND_DOWN = (side: number): Pt => [side * 38, -8];
const HAND_UP = (side: number): Pt => [side * 58, -152];
const RAISE = 0.1;
const HOLD = 0.07;
const LOWER = 0.12;

/** Arm raise 0..1 for a toss released at `toss` (raise 0.1 s out-cubic, hold, lower 0.12 s). */
function armQ(t: number, toss: number): number {
  if (t < toss - RAISE || t >= toss + HOLD + LOWER) return 0;
  if (t < toss) return E.outCubic(prog(t, toss - RAISE, RAISE));
  if (t < toss + HOLD) return 1;
  return 1 - E.inOutSine(prog(t, toss + HOLD, LOWER));
}

const toWorld = (xm: number, p: Pt): Pt => [xm + p[0] * SF, HIP_Y + p[1] * SF];

/** Where a tag leaves the hand (body centre, world) for a toss from `side`: the raised hand + the tag held above it. */
export const throwHand = (T: CartTimes, side: number): Pt => {
  const h = toWorld(cartX(T.toss1, T) + MAKER_DX, HAND_UP(side));
  return [h[0], h[1] - 16];
};

/** A ballistic toss: body centre from `a` to `b` over [t0, t1], apex `h` px above the straight line. */
function tossPos(t: number, t0: number, t1: number, a: Pt, b: Pt, h: number): {p: Pt; u: number} {
  const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  const x = a[0] + (b[0] - a[0]) * u;
  const base = a[1] + (b[1] - a[1]) * u;
  return {p: [x, base - 4 * h * u * (1 - u)], u};
}

export type CartProps = {
  T: CartTimes;
  /** Body-centre landing points of the two tags (world): siteL's and siteR's hang points + tagBodyOffset. */
  land1: Pt;
  land2: Pt;
  tagSize: number;
};

/** The maker's throwing arms (+ the tag in the raised hand) over the parked maker. */
const ThrowArms: React.FC<{T: CartTimes; xm: number}> = ({T, xm}) => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  ([[-1, T.toss1], [1, T.toss2]] as [number, number][]).forEach(([side, toss]) => {
    const q = armQ(t, toss);
    if (q <= 0) return;
    const sh = SHOULDER(side);
    const d = HAND_DOWN(side);
    const u = HAND_UP(side);
    const hand: Pt = [d[0] + (u[0] - d[0]) * q, d[1] + (u[1] - d[1]) * q];
    out.push(
      <XG key={`arm${side}`} m={mat.compose(mat.translate(xm, HIP_Y), mat.scale(SF))}>
        <FigureArm sh={sh} hand={hand} coat={palette.teal} W={(SI.mid * 0.8) / SF} seed={`s10/marm${side}`} />
      </XG>,
    );
    // the tag in the hand: pops into it half-way up (0.05 s grow), gone at the release (the flying tag takes over)
    if (t >= toss - 0.07 && t < toss) {
      const hw = toWorld(xm, hand);
      const k = 0.2 + 0.8 * E.outCubic(prog(t, toss - 0.07, 0.05));
      const by = hw[1] - 16;
      out.push(
        <XG key={`tag${side}`} m={mat.about(mat.scale(k), hw[0], hw[1])}>
          <SupportTag x={hw[0]} y={by - tagBodyOffset(TAG_W)} size={TAG_W} checkAt={1e6} seed={`s10/hand${side}`} />
        </XG>,
      );
    }
  });
  return <>{out}</>;
};

/** The cart, its maker, his throwing arms, the satchel and the sign card. Drawn in the set's cart slot (behind the
 *  plaques and the A-frame). */
export const Cart: React.FC<{T: CartTimes}> = ({T}) => {
  const t = useTime();
  const t0 = T.inAt;
  if (t < t0) return null;
  const x = cartX(t, T);
  const xm = x + MAKER_DX;
  if (xm - 40 > 1240) return null;
  const x0 = CART.parkX - CART.stepIn;
  const tEnd = T.end + 0.4;
  const x1 = cartX(tEnd, T);
  // one cart, two rolls (the wheel angle and the maker's walk follow the distance from x0): the step-out, then (parked:
  // no walk) the roll-out, whose ease starts at the park spot's fraction so the wheel never snaps
  const roll =
    t < T.rollAt
      ? {at: t0, to: [CART.parkX, CART.y] as Pt, dur: CART.stepDur, ease: E.outQuad}
      : {at: T.rollAt, to: [x1, CART.y] as Pt, dur: tEnd - T.rollAt, ease: (q: number) => (cartX(T.rollAt + q * (tEnd - T.rollAt), T) - x0) / (x1 - x0)};
  const sign = <FixSign x={0} y={0} fs={21} w={120} string={false} rot={-2} strikeAt={-10} fixedAt={-10} ink={2.2} seed="s10/csign" />;
  return (
    <PopUp at={t0} x={x} y={CART.y} over={0.06}>
      <MakersCart x={x0} y={CART.y} size={CART.size} crates={1} roll={roll} pusher sign={sign} signPost={22} signX={-2 / CS} seed="s10/cart" />
      <Satchel x={xm + 17} y={HIP_Y + 8} w={22} pullAt={[T.toss1 - RAISE, T.toss2 - RAISE]} pullDur={0.06} seed="s10/satchel" />
      <ThrowArms T={T} xm={xm} />
    </PopUp>
  );
};

/** The two flying tags (+ the dashed trail of the lob over siteM). Drawn above the plaques and the sign. */
export const Tosses: React.FC<CartProps> = ({T, land1, land2, tagSize}) => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  const fly = (key: string, t0: number, t1: number, a0: Pt, b: Pt, h: number, spin: number, trail: boolean) => {
    if (t < t0) return;
    // the dashed trail: from the hand to the tag; after the landing it retracts from its tail in 0.16 s (no fade)
    if (trail && t < t1 + 0.16) {
      const uTail = t <= t1 ? 0 : E.inOutSine(prog(t, t1, 0.16));
      const uHead = Math.min(1, (t - t0) / (t1 - t0));
      if (uHead - uTail > 0.02) {
        let d = '';
        const n = 30;
        for (let i = 0; i <= n; i++) {
          const u = uTail + ((uHead - uTail) * i) / n;
          const q = tossPos(t0 + u * (t1 - t0), t0, t1, a0, b, h).p;
          d += `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
        }
        out.push(<Ink key={`${key}tr`} d={d} width={2.8} dash="2 11" color={palette.ink} taper={false} seed={`s10/${key}tr`} />);
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
  // the left arm's short lob back-left onto siteL's plaque; the right arm's high lob OVER siteM's old plaque onto siteR's
  fly('toss1', T.toss1, T.land1, throwHand(T, -1), land1, 30, -0.6, false);
  fly('toss2', T.toss2, T.land2, throwHand(T, 1), land2, TOSS2_H, 1.25, true);
  return <>{out}</>;
};

/** The lob's apex above the hand-to-plaque line: its top passes >= 74 px above siteM's plaque top (1104). */
export const TOSS2_H = 106;
