// S10 the makers' cart on the OPEN PAVEMENT (fix round 2b: cart line y 1395, in front of the stoops, behind the A-frame
// sign and Pip's bollard), so the S09 continuity object reads whole: bed, wheel, handle, the 'fixed!' card on its post and
// a full-height maker (154 px, 1.08 x the old 143) pushing it, against the empty cream pavement.
//  - ENTRANCE: the cart and the maker walk out from BEHIND the A-frame (no pop): they start hidden behind the board's
//    face, roll right at a constant 14.3 px / frame (15 px on screen) and brake out-quad into the PARK spot (cart centre
//    579 = screen 461-639 for the maker + cart, between the A-frame's back leg and Pip's bollard) just as the first arm
//    rises;
//  - each toss is thrown from a RAISED arm (FigureArm, the tag in the hand, released above his head): the LEFT arm flicks
//    a short lob back-left onto siteL's plaque (tick on 'officially'), then the RIGHT arm, raised straight up, lobs the
//    second tag high OVER siteM's old plaque (a steep launch, clear of Bit and the plate, apex ~115 px above its top,
//    dashed trail) onto siteR's (tick on 'supported'); the lob runs at an even ~34 px / frame along its path;
//  - he stays parked through Pip's 'hey!' and rolls out right on 'anymore' (sine ramp to 500 px/s: <= 18 px / frame).
// S09's 'still fixing... / fixed!' card (the shared FixSign, the SAME object as S06 / S07 / S09) is pinned flat on a short
// post in the bed, under siteM's plaque with clear wall above it (Pip's spark sits there). The satchel of tags rides on
// the bed's back end.

import React, {useId} from 'react';
import {palette} from '../../lib/theme';
import {useTime, prog, ease as E} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import type {Pt} from '../../lib/sketch';
import {FIG_H, FigureArm, FixSign, Maker, MakersCart, OLD_QUARTER, SI, SupportTag} from './kit';
import {mat, XG} from '../../lib/xf';
import {Satchel} from './shims';
import {tagBodyOffset, TAG_W} from './plaques';
import {aFrameCap, signBox} from './street';

/** The A-frame's hinge cap (right end, top) in this scene's layout. */
const CAP = aFrameCap(signBox(OLD_QUARTER.noticeSign));

/** Cart line (wheel ground y), bed length, the park spot (cart centre), the walk-out from behind the A-frame (start x,
 *  cruise speed, braking time), the roll-out. */
export const CART = {y: 1395, size: 100, parkX: 579, x0: 330, v: 428, brake: 0.25, vMax: 500, acc: 0.5};
const CS = CART.size / 140; // MakersCart local -> world
/** The maker stands this far behind the cart centre (his hands on the grip, in front of his back-view body). */
export const MAKER_DX = -99;
/** The maker's height (world) and figure frame (hip = feet - 62 x figure scale). */
export const MAKER_H = 154;
const SF = MAKER_H / FIG_H;
const HIP_Y = CART.y - 62 * SF;

export type CartTimes = {
  /** The cart is parked here (the walk-out brakes into it). */
  parkAt: number;
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

/** When the walk-out starts (hidden behind the A-frame at CART.x0) for a cart parked at `parkAt`. */
export const cartGoAt = (parkAt: number) => parkAt - CART.brake - (CART.parkX - (CART.v * CART.brake) / 2 - CART.x0) / CART.v;

/** Cart centre x at scene time t: the walk-out (cruise, then an out-quad brake), parked, then the roll-out (sine ramp to
 *  vMax over `acc` s). */
export function cartX(t: number, T: CartTimes): number {
  const {parkX, v, brake, vMax, acc} = CART;
  if (t < T.rollAt) {
    const tc = T.parkAt - brake;
    const xc = parkX - (v * brake) / 2;
    if (t < tc) return xc - v * (tc - t);
    const u = Math.min(1, (t - tc) / brake);
    return parkX - ((v * brake) / 2) * (1 - u) * (1 - u);
  }
  const d = t - T.rollAt;
  if (d < acc) return parkX + (vMax / 2) * (d - (acc / Math.PI) * Math.sin((Math.PI * d) / acc));
  return parkX + (vMax * acc) / 2 + vMax * (d - acc);
}

/** The arm for each toss: side -1 = his left (screen left), +1 = right. Person-local shoulder / hand points. The right
 *  arm goes straight UP (the hand over his head) for the high lob, so the tag leaves well left of siteM's plaque. */
const SHOULDER = (side: number): Pt => [side * 32, -76];
const HAND_DOWN = (side: number): Pt => [side * 38, -8];
const HAND_UP = (side: number): Pt => (side < 0 ? [-58, -152] : [-6, -164]);
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
  const h = toWorld(cartX(side < 0 ? T.toss1 : T.toss2, T) + MAKER_DX, HAND_UP(side));
  return [h[0], h[1] - 16];
};

/** A ballistic toss: body centre from `a` to `b` over [t0, t1], apex `h` px above the straight line. */
function tossPos(t: number, t0: number, t1: number, a: Pt, b: Pt, h: number): {p: Pt; u: number} {
  const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
  const x = a[0] + (b[0] - a[0]) * u;
  const base = a[1] + (b[1] - a[1]) * u;
  return {p: [x, base - 4 * h * u * (1 - u)], u};
}

/** The high lob as a cubic Bezier (steep launch from the raised hand, apex over siteM's plaque, a falling approach onto
 *  siteR's), walked at an even speed (arc-length table): `at(s)` for s = 0..1 of the path length. */
function lobPath(a: Pt, b: Pt): (s: number) => Pt {
  const c1: Pt = [a[0] - 10, a[1] - LOB.rise];
  const c2: Pt = [b[0] - 51, b[1] - LOB.fall];
  const bz = (u: number): Pt => {
    const v = 1 - u;
    const k0 = v * v * v;
    const k1 = 3 * u * v * v;
    const k2 = 3 * u * u * v;
    const k3 = u * u * u;
    return [k0 * a[0] + k1 * c1[0] + k2 * c2[0] + k3 * b[0], k0 * a[1] + k1 * c1[1] + k2 * c2[1] + k3 * b[1]];
  };
  const N = 48;
  const us: number[] = [0];
  const ls: number[] = [0];
  let prev = bz(0);
  for (let i = 1; i <= N; i++) {
    const p = bz(i / N);
    ls.push(ls[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
    us.push(i / N);
    prev = p;
  }
  const L = ls[N];
  return (s: number) => {
    const target = Math.min(1, Math.max(0, s)) * L;
    let i = 1;
    while (i < N && ls[i] < target) i++;
    const f = (target - ls[i - 1]) / Math.max(1e-6, ls[i] - ls[i - 1]);
    return bz(us[i - 1] + (us[i] - us[i - 1]) * f);
  };
}
/** The high lob's Bezier handles: straight up from the hand over his head (x 475), over siteM's plaque, down into
 *  siteR's. Measured on the path (tag body 42 x 34): >= 6 px clear of Bit (dangling off the plaque's top-left), >= 21 px
 *  clear of the plaque face, apex 989 (115 px above its top); 513 px long = 34 px / frame over the 0.5 s flight. */
export const LOB = {rise: 307, fall: 190};

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

/** The cart, its maker, his throwing arms, the satchel and the sign card. Scene10 draws it in the 'sign' layer, after
 *  the stoops and the hanging plaques and before the A-frame (it walks out from behind the board). */
export const Cart: React.FC<{T: CartTimes}> = ({T}) => {
  const t = useTime();
  const clipId = 's10cartclip' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const t0 = cartGoAt(T.parkAt);
  if (t < t0) return null;
  const x = cartX(t, T);
  const xm = x + MAKER_DX;
  if (xm - 40 > 1240) return null;
  const x0 = CART.x0;
  const tEnd = T.end + 0.4;
  const x1 = cartX(tEnd, T);
  // one cart, two rolls (the wheel angle follows the distance from x0): the walk-out, then (parked) the roll-out, whose
  // ease starts at the park spot's fraction so the wheel never snaps; the sign jolts as each roll starts
  const roll =
    t < T.rollAt
      ? {at: t0, to: [CART.parkX, CART.y] as Pt, dur: T.parkAt - t0, ease: (q: number) => (cartX(t0 + q * (T.parkAt - t0), T) - x0) / (CART.parkX - x0)}
      : {at: T.rollAt, to: [x1, CART.y] as Pt, dur: tEnd - T.rollAt, ease: (q: number) => (cartX(T.rollAt + q * (tEnd - T.rollAt), T) - x0) / (x1 - x0)};
  const moving = t < T.parkAt - 0.04 || t >= T.rollAt + 0.06;
  const sign = <FixSign x={0} y={0} fs={21} w={114} string={false} rot={-2} strikeAt={-10} fixedAt={-10} ink={2.2} seed="s10/csign" />;
  // while he walks behind the A-frame, his bun would glide along the board's top as a dark knob: clip him to the right
  // of the board's hinge cap above its top (the board itself hides the rest)
  const hide = xm - 30 < CAP.right;
  const maker = <Maker x={xm} y={CART.y} h={MAKER_H} walk={moving ? {at: t < T.rollAt ? t0 : T.rollAt, hz: 2.3} : undefined} seed="s9cart/maker" />;
  return (
    <>
      {hide ? (
        <>
          <defs>
            <clipPath id={clipId}>
              <path d={`M-2000 -2000H4000V4000H-2000ZM-2000 -2000V${CAP.top + 14}H${CAP.right}V-2000Z`} clipRule="evenodd" />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>{maker}</g>
        </>
      ) : (
        maker
      )}
      <MakersCart x={x0} y={CART.y} size={CART.size} crates={0} roll={roll} sign={sign} signPost={CART_SIGN.post} signX={CART_SIGN.x} seed="s10/cart" />
      <Satchel x={x - 34 * CS * 1.4} y={CART.y - 60 * CS} w={24} pullAt={[T.toss1 - RAISE, T.toss2 - RAISE]} pullDur={0.06} seed="s10/satchel" />
      <ThrowArms T={T} xm={xm} />
    </>
  );
};

/** The card's post (world px above the bed top) and its spot along the bed (cart-local units): the card (pinned flat,
 *  w 114, fs 21) spans x 512-626, y 1285-1339 with the cart parked: under siteM's plaque (bottom 1224) with 60 px of clear
 *  wall above it, left of Pip's spark, its foot on the bed. */
export const CART_SIGN = {post: 62, x: -17};

/** The two flying tags (+ the dashed trail of the lob over siteM). Drawn above the plaques and the sign. */
export const Tosses: React.FC<CartProps> = ({T, land1, land2, tagSize}) => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  const fly = (key: string, t0: number, t1: number, at: (u: number) => Pt, spin: number, trail: boolean) => {
    if (t < t0) return;
    // the dashed trail: from the hand to the tag; after the landing it retracts from its tail in 0.16 s (no fade)
    if (trail && t < t1 + 0.16) {
      const uTail = t <= t1 ? 0 : E.inOutSine(prog(t, t1, 0.16));
      const uHead = Math.min(1, (t - t0) / (t1 - t0));
      if (uHead - uTail > 0.02) {
        let d = '';
        const n = 30;
        for (let i = 0; i <= n; i++) {
          const q = at(uTail + ((uHead - uTail) * i) / n);
          d += `${i ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
        }
        out.push(<Ink key={`${key}tr`} d={d} width={2.8} dash="2 11" color={palette.ink} taper={false} seed={`s10/${key}tr`} />);
      }
    }
    if (t >= t1) return;
    const u = Math.min(1, Math.max(0, (t - t0) / (t1 - t0)));
    const p = at(u);
    // the tag spins about its body centre on the way (its check is drawn only when it lands)
    out.push(
      <XG key={key} m={mat.about(mat.rotate(-spin * 360 * u), p[0], p[1])}>
        <SupportTag x={p[0]} y={p[1] - tagBodyOffset(tagSize)} size={tagSize} checkAt={t1 + 1} seed={`s10/${key}`} />
      </XG>,
    );
  };
  // the left arm's short lob back-left onto siteL's plaque; the right arm's high lob OVER siteM's old plaque onto siteR's
  const a1 = throwHand(T, -1);
  fly('toss1', T.toss1, T.land1, (u) => tossPos(T.toss1 + u * (T.land1 - T.toss1), T.toss1, T.land1, a1, land1, TOSS1_H).p, -0.6, false);
  const lob = lobPath(throwHand(T, 1), land2);
  fly('toss2', T.toss2, T.land2, lob, 1.25, true);
  return <>{out}</>;
};

/** The short lob's height above the hand-to-plaque line (fix round 2b: 30 -> 40, flight 0.23 s). */
export const TOSS1_H = 40;
