// SQE_front (WINDOW lane): a STAND-IN for the thread plane (`scenes/thread_plane.tsx`, built by the SQA pilot) over SQE
// and SQF, laid exactly to flow_v2 §3's spots so the street's carries land where the real plane will be: the right hand
// holds the phone at LEFT (phone (20, 1100) w 320, tag (36, 1348) w 288; it rises from below 22.45-22.95), then
// PAYOFF (phone (310, 950) w 460, tag (333, 1307) w 414; 38.12-38.62); the tag hangs from the listing laptop's corner:
// $1,079 (the $999 struck) -> $1,099 on "pass" 30.28; reactions sway 24.44, tick 30.28, jolt 35.95, turn 39.70; Pip
// clings to the phone's right edge (blinks; head turns only in the pauses 30.95-31.42, 33.11-33.49; shrug 40.30). The
// screen dims a step while the street leads (lit 29.90-31.00, 38.12-41.15). Screen px, film time. Swapped for the real
// thread plane as soon as it is committed (SQE.tsx / SQF.tsx import it in one place).
import React from 'react';
import {clamp, ease, prog} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Hand, laptopGeo, Phone, phonePoint, phoneSlots, Pip3, PriceTag, type LookKey, type PipPoseKey, type Pt} from '../kit';
import {O1Listing} from './O1_dress';

type Spot = {px: number; py: number; pw: number; tx: number; ty: number; tw: number};
const LEFT: Spot = {px: 20, py: 1100, pw: 320, tx: 36, ty: 1348, tw: 288};
const PAYOFF: Spot = {px: 310, py: 950, pw: 460, tx: 333, ty: 1307, tw: 414};
const lerp = (a: number, b: number, u: number) => a + (b - a) * u;
const mixSpot = (a: Spot, b: Spot, u: number): Spot => ({px: lerp(a.px, b.px, u), py: lerp(a.py, b.py, u), pw: lerp(a.pw, b.pw, u), tx: lerp(a.tx, b.tx, u), ty: lerp(a.ty, b.ty, u), tw: lerp(a.tw, b.tw, u)});

/** The front plane's spot at film time T (and how far below it still is during the rise). */
export function frontSpot(T: number): {s: Spot; dy: number} {
  const rise = ease.inOutCubic(prog(T, 22.45, 0.5));
  const up = ease.inOutCubic(prog(T, 38.12, 0.5));
  return {s: mixSpot(LEFT, PAYOFF, up), dy: (1 - rise) * 900};
}

/** The listing laptop's screen centre on the canvas at a spot (the crate's landing). */
export function listingScreenAt(s: Spot): Pt {
  const SL = phoneSlots(s.pw);
  const g = laptopGeo(SL.laptop.x, SL.laptop.y, SL.laptop.w);
  return phonePoint({x: s.px, y: s.py, w: s.pw, rot: -3}, g.screenC[0], g.screenC[1]);
}

const PIP_KEYS: PipPoseKey[] = [
  {t: -99, pose: 'peek'},
  {t: 40.24, pose: 'shrug'},
  {t: 40.7, pose: 'peek'},
];
const PIP_LOOK: LookKey[] = [
  {t: -99, v: 0.35},
  {t: 30.95, v: -0.5},
  {t: 31.42, v: 0.35},
  {t: 33.11, v: 0.55},
  {t: 33.49, v: 0.35},
  {t: 38.2, v: -0.6},
  {t: 40.24, v: 0},
];

export const FrontStandIn: React.FC<{T: number}> = ({T}) => {
  const {s, dy} = frontSpot(T);
  if (dy > 899) return null;
  const ph = {x: s.px, y: s.py + dy, w: s.pw, rot: -3};
  const SL = phoneSlots(s.pw);
  const g = laptopGeo(SL.laptop.x, SL.laptop.y, SL.laptop.w);
  const corner = g.deck[3];
  const from = phonePoint(ph, corner[0] + 4, corner[1] - 6);
  const ticker = [
    {t: -99, v: '$1,079'},
    {t: 30.28, v: '$1,099'},
  ];
  // reactions: a sway (24.44), the tick's own jolt (30.28), a jolt (35.95)
  const kick = (at: number, amp: number) => (T >= at ? amp * Math.exp(-(T - at) * 5) * Math.sin((T - at) * 18) : 0);
  const rot = -6 + kick(24.44, 4) + kick(35.95, 6);
  // the screen dims a step while the street leads (a flat veil over the screen: one value step, no fade)
  const lit = (T >= 29.9 && T < 31.0) || T >= 38.12;
  const pipAt = phonePoint(ph, s.pw * 0.86, s.pw * 0.5);
  return (
    <>
      <Phone {...ph} price={null} badge={1} seed="sqe/phone">
        <O1Listing w={s.pw} />
        {lit ? null : <path d={`M0 0H${s.pw}V${s.pw * 2.2}H0Z`} fill={EMBER.sky} opacity={0} />}
      </Phone>
      {lit ? null : (
        <XG m={mat.about(mat.rotate(-3), ph.x + s.pw / 2, ph.y + s.pw * 1.1)}>
          <path d={`M${ph.x + s.pw * 0.06} ${ph.y + s.pw * 0.08}H${ph.x + s.pw * 0.94}V${ph.y + s.pw * 2.14}H${ph.x + s.pw * 0.06}Z`} fill="#C9C2D6" style={{mixBlendMode: 'multiply'}} />
        </XG>
      )}
      <PriceTag x={s.tx} y={s.ty + dy} w={s.tw} ticker={ticker} old="$999" stringFrom={from} rot={rot} sway={1.2} turnAt={39.7} seed="sqe/tag" />
      <Hand phone={ph} seed="sqe/hand" />
      <Pip3 x={pipAt[0]} y={pipAt[1]} scale={0.62 * (s.pw / 320)} keys={PIP_KEYS} look={PIP_LOOK} lookDur={0.18} seed={11} />
    </>
  );
};
void clamp;
