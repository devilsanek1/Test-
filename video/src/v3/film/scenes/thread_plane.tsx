// thread_plane (SHARED PIECE, docs/v3/flow_v2.md §1, §3; first version built by the SQA pilot, owned from here on by the
// transition agent): THE THREAD of video 3, your next laptop's paper price tag, on the FRONT PLANE: your right hand
// holding the phone with the shop listing, the tag hanging from the listing laptop's front-left corner, and Pip peeking
// out from behind the phone's right edge. It is SCREEN-FIXED (never moved by a world camera: homeCam, the S5
// pull-back, entryCam all move the stage behind it) and keyed on FILM time, so every sequence that shows it draws the
// identical plane at a seam:
//
//   <ThreadPlane />                       inside any sequence (film time from useFilmTime(); props below override)
//   threadAt(T)                           where everything is at film time T (phone props, tag box, Pip, listing points)
//
// Spots (flow_v2 §3; phone top-left + width, rot -3; the tag box follows at (20, 310) x k, w 0.9 x the phone, rot -6):
//   HIGH-C (340, 980) w 400   0-3.64 (SQA)          LOW-C (340, 1040)   4.00-17.24 (3.64-4.00: down 60, inOutCubic)
//   HIGH2 (340, 900)          17.64-19.40 (17.24-17.64 "your laptop")   then off through the reveal (SQD)
//   LEFT (20, 1100) w 320     22.95-38.12 (rises from below the frame 22.45-22.95, outCubic)
//   PAYOFF (310, 950) w 460   38.62-41.15 (38.12-38.62; HIGH-C x1.15 about (540, 1180))
// The ticker: $999 -> $1,015 / $1,031 / $1,047 / $1,063 / $1,079 on the launches 1.88 / 2.18 / 2.40 / 2.60 / 2.72 (the
// old $999 shown struck from 1.88, struck at 1.92) -> $1,099 on "pass" 30.28. Reactions: the tap 0.50, jolt 15.30, tug
// 18.30, sway 24.44, jolt 35.95, the turn 39.70 (the mini data center "AI" on its back).
// THE TAP (the hook's expected thing, acted after the colour lands; SQA pilot review): the thumb rests on "Add to cart"
// in the frame-0 drawing, lifts 0.30-0.40, comes down 0.44-0.50 and presses on "laptop" (0.50: the button squashes a
// value darker, the cart badge pops 0 -> 1 at 0.52 with the cart-pop sound at 0.50, the tag swings from the press).
// ONE FOCUS (CRAFT §b: a story object off its beat is tier B; SQA pilot review): the thread plane has an OFF-BEAT
// state. The screen dims one value step toward peach while the stage leads (lit 0-4.04, 17.24-18.30, 29.90-31.00,
// 38.12-41.15); the button and the cart badge (left out of the screen's multiply) take a soft blue (C* 18) with no
// outline and the listing's laptop drops to tier B. From 6.35 (home_set's HOOK_CALM_AT: the window sits back in the same
// step, mid-pan) every off-beat stretch is the deeper REST level (early review E2: the bezel L* 48, the screen L* 84,
// the button and badge a screen tint, the tag C* 24: PHONE_REST, TAG_REST); SQA's 4.04-5.80 keeps the pilot's state. The TAG dims to a soft terracotta (C* 38, no outline, the prices
// in its light tint) everywhere but its own beats (full 0-4.04, 15.30-15.90, 17.24-18.90, 24.44-25.04, 29.90-31.00,
// 35.95-36.98, 38.12-41.15: TAG_FULL); off-beat its idle sway is halved and the hand's float drops to 0.3 (eased,
// never a jump).
// Every change is a 2-step change (3 frames at the half step, never a fade); at 4.04 the screen, the button and the tag
// step down in the same frame as the data center goes dark: one event.
//
// Tiers (CRAFT §b): the TAG is the subject on its beats (A: the only full outline, the hero colour; a warm rim on its
// lamp side while it ticks, 1.86-3.30, and through the payoff, 38.62-41.15, with a form shade on its right third: E10;
// the like-pop at 39.88, its back's data center popping as the back lands); the phone is its frame (its UI calm: no stars, delivery row or cards; the
// description lines as light hairlines); the HAND is supporting life (B: its own value, L* ~76, >= 12 above the desk it
// lies over, a same-hue line where it meets the desk and the phone, a form shade crescent on its edges away from the
// lamp); Pip is B (C* <= 25, a ~2 px same-hue line, the 'peek' pose clinging to the phone's right edge, phone-local
// x ~389-489, y ~143-248 at w 400: <= 1 % of the frame): blinks, ear and trunk idle; head turns only in the pauses
// flow_v2 lists.
// Frame 0 (T < 0.3): the phone's and the tag's outlines draw on (the tag complete in ink with its "$999"), the hand's
// and Pip's tinted lines with them. Then the colour floods OUT FROM THE TAG, each fill one step inside its own outline
// (SQA's <Look snapPops>): the tag 0.03, the screen 0.05, the listing 0.06-0.12, the hand and Pip ~0.1, the dark bezel
// LAST (0.15: it closes round the lit screen like the outline thickening outward, never a dark slab under a missing
// screen). T < 0 is the loop underlay (the frame-0 drawing state).
// QA: the input prop {"threadOff": true} draws no plane (the A side of an A/B pair: the plane's exact mask).
import React from 'react';
import {getInputProps} from 'remotion';
import {ease, prog, type Ease} from '../../../lib/time';
import {useFilmTime} from '../../../lib/sequence';
import {Look} from '../../../lib/exit';
import {Tier} from '../../../lib/tier';
import {mat, type Mat, XG} from '../../../lib/xf';
import {EMBER, Hand, laptopGeo, Phone, phonePoint, phoneSlots, Pip3, PriceTag, Show, Txt, type LookKey, type PipPoseKey, type Pt, type TickerStep} from '../kit';
import {stepAt} from '../kit/Haze';
import {FormShade, Lit, mixHex, Rim, type LightRig} from '../kit/Light';
import {PHONE_DIM_BODY, PHONE_DIM_POP} from '../kit/Phone';
import {TAG_DIM} from '../kit/PriceTag';
import {FilmClock, HOME_RIG, HOOK_CALM_AT, LIGHT_ON} from './home_set';

// ================================================================= the spots and the moves (film seconds)

export type PhoneSpot = {x: number; y: number; w: number};
export const PHONE_ROT = -3;
export const TAG_ROT = -6;
/** Phone height = 2.5 w (it runs past the frame bottom into your hand). */
export const PHONE_H = 2.5;
/** The "Add to cart" button's phone-local top (px at w 400): the tag hangs in the price slot above it. */
export const BUTTON_Y = 520;

export const SPOTS = {
  HIGH_C: {x: 340, y: 980, w: 400},
  LOW_C: {x: 340, y: 1040, w: 400},
  HIGH2: {x: 340, y: 900, w: 400},
  LEFT: {x: 20, y: 1100, w: 320},
  PAYOFF: {x: 310, y: 950, w: 460},
} satisfies Record<string, PhoneSpot>;
/** Where the LEFT spot's rise starts: the phone's top below the frame's bottom edge. */
const BELOW: PhoneSpot = {x: 20, y: 1960, w: 320};

type Move = {t0: number; t1: number; from: PhoneSpot; to: PhoneSpot; e: Ease};
/** The thread's moves, in film order (between them it holds the last spot). */
export const THREAD_MOVES: Move[] = [
  {t0: 3.64, t1: 4.0, from: SPOTS.HIGH_C, to: SPOTS.LOW_C, e: ease.inOutCubic},
  {t0: 17.24, t1: 17.64, from: SPOTS.LOW_C, to: SPOTS.HIGH2, e: ease.inOutCubic},
  {t0: 22.45, t1: 22.95, from: BELOW, to: SPOTS.LEFT, e: ease.outCubic},
  {t0: 38.12, t1: 38.62, from: SPOTS.LEFT, to: SPOTS.PAYOFF, e: ease.inOutCubic},
];
/** The thread's declared gap (the scale reveal, SQD): nothing of the plane is drawn inside it. */
export const THREAD_GAP: [number, number] = [19.4, 22.45];

const lerp = (a: number, b: number, k: number) => a + (b - a) * k;

/** The phone's spot at film time T. */
export function phoneSpotAt(T: number): PhoneSpot {
  let s: PhoneSpot = SPOTS.HIGH_C;
  for (const m of THREAD_MOVES) {
    if (T < m.t0) break;
    if (T >= m.t1) {
      s = m.to;
      continue;
    }
    const k = m.e((T - m.t0) / (m.t1 - m.t0));
    return {x: lerp(m.from.x, m.to.x, k), y: lerp(m.from.y, m.to.y, k), w: lerp(m.from.w, m.to.w, k)};
  }
  return s;
}

// ================================================================= the tag: ticker, reactions, lit screen

export const LAUNCHES = [1.88, 2.18, 2.4, 2.6, 2.72];
export const TICKER: TickerStep[] = [
  {t: -99, v: '$999'},
  {t: 1.88, v: '$1,015'},
  {t: 2.18, v: '$1,031'},
  {t: 2.4, v: '$1,047'},
  {t: 2.6, v: '$1,063'},
  {t: 2.72, v: '$1,079'},
  {t: 30.28, v: '$1,099'},
];
/** The old price shows struck above the new one from the first launch (struck at 1.92). */
export const OLD_AT = 1.88;
export const STRIKE_AT = 1.92;
export const TURN_AT = 39.7;

/** THE TAP (film seconds): the thumb lifts off "Add to cart" 0.30-0.40, comes down 0.44-0.50 and presses at 0.50 (on
 *  "laptop", 0.52); the badge pops at 0.52; the cart-pop sound is public/v3/animatic.json's phone_cart_add at 0.50. */
export const TAP = {lift: [0.3, 0.4] as [number, number], down: [0.44, 0.5] as [number, number], press: 0.5, badge: 0.52, liftPx: 44};
export const REACT = {tap: TAP.press, settle: 2.72, lower: 3.66, jolt: [15.3, 35.95], tug: 18.3, sway: 24.44};
/** The warm rim on the tag's lamp side while it is the lit subject (CRAFT §d.8: the subject only): while it ticks, and
 *  through the payoff from PAYOFF on (early review E10: the light layer changed the payoff tag by dL* 0.0; flow_v2 §5
 *  SQF "rim left, form shade right third"), 4-6 px inside its silhouette. */
export const RIM_WINDOWS: [number, number][] = [
  [1.86, 3.3],
  [38.62, 41.15],
];
/** The payoff's form shade on the tag's right third (away from the lamp, screen-left), with the rim (E10). */
export const FORM_WINDOW: [number, number] = [38.62, 41.15];
/** The like-pop (flow_v2 §4, 39.88 "price": the sound public/v3/animatic.json phone_like_pop): the back's drawing pops
 *  as the back lands, at the turn's midpoint (the G3 board: "on 'price' its back lands: a tiny AI data center"). */
export const LIKE_POP_AT = 39.88;

/** Extra hang angle (deg) from the tag's reactions at film time T (the ticker's own jolts are PriceTag's). */
export function tagReaction(T: number): number {
  let a = 0;
  // the thumb's press jostles the phone: the tag swings and settles over ~1.2 s (the hook's quiet stretch stays alive
  // through the subject itself)
  if (T >= REACT.tap) {
    const d = T - REACT.tap;
    a += 4.2 * Math.exp(-d * 1.5) * Math.sin(d * Math.PI * 2 * 1.3);
  }
  // after the last tick the tag keeps settling (~1 s); the phone lowering (3.64-4.00) gives it one small, quickly
  // damped sway that has settled by the data center's beat at 4.04 (the eye leaves the tag there)
  if (T >= REACT.settle) {
    const d = T - REACT.settle;
    a += 3.2 * Math.exp(-d * 2.0) * Math.sin(d * Math.PI * 2 * 1.5);
  }
  if (T >= REACT.lower) {
    const d = T - REACT.lower;
    a += -2.0 * Math.exp(-d * 4.5) * Math.sin(d * Math.PI * 2 * 1.2);
  }
  for (const j of REACT.jolt) if (T >= j) a += 7 * Math.exp(-(T - j) * 9) * Math.sin((T - j) * 34);
  if (T >= REACT.tug) {
    const d = T - REACT.tug;
    a += -10 * Math.exp(-d * 4.2) * Math.sin(d * 13 + 0.5) - 10 * Math.exp(-d * 9) * Math.sin(0.5) * Math.cos(d * 13);
  }
  if (T >= REACT.sway) {
    const d = T - REACT.sway;
    a += 4.5 * Math.exp(-d * 2.2) * Math.sin(d * Math.PI * 2 * 1.3);
  }
  return a;
}

/** The screen's lit windows (film seconds): elsewhere it sits one value step down (the stage leads). The first one
 *  ends at 4.04 with the data center's beat (one event, not a second change on "data"). "Your laptop" lights it at
 *  17.24 and it dims again as THE stick leaves it on "memory" (18.30: the stick is the subject by 18.86, so the
 *  brightest 5 % sits on the stick, CRAFT §d.2; the HOME lane measured it 0.29 H off with the screen lit to 19.40). */
export const SCREEN_LIT: [number, number][] = [
  [-99, 4.04],
  [17.24, 18.3],
  [29.9, 31.0],
  [38.12, 99],
];
/** The TAG's own beats (film seconds): full strength (A) inside, the off-beat tier B outside. 0-4.04 the hook's ticks;
 *  15.30 its jolt on "almost 10%" (0.6 s); 17.24 "your laptop" through the tug as THE stick leaves it (18.30 + 0.6: THE
 *  stick is the subject at 18.86, early SQB-SQF review E2); 24.44 its sway (0.6 s); 29.90-31.00 the crate and $1,099 on
 *  "pass"; 35.95 the jolt as the trucks overtake, until the data center's sign steps up at 36.98 (a step 0.6 s after J5,
 *  never inside a join's 0.4 s); 38.12 the payoff. */
export const TAG_FULL: [number, number][] = [
  [-99, 4.04],
  [15.3, 15.9],
  [17.24, 18.9],
  [24.44, 25.04],
  [29.9, 31.0],
  [35.95, 36.98],
  [38.12, 99],
];
const inWindows = (T: number, w: [number, number][]) => w.some(([a, b]) => T >= a && T < b);
/** A 2-step change on a schedule: 0 = on, 0.5 = the half step (3 frames), 1 = off. */
const twoStep = (T: number, w: [number, number][]) => {
  const a = inWindows(T, w);
  const b = inWindows(T - 0.05, w);
  return a && b ? 0 : !a && !b ? 1 : 0.5;
};
/** 0 = lit, 0.5 = half way (the 3-frame middle step), 1 = dimmed one value step. */
export const screenDim = (T: number): number => twoStep(T, SCREEN_LIT);
/** 0 = the tag at full strength (its beat), 0.5 = the half step, 1 = off-beat (tier B). */
export const tagDim = (T: number): number => twoStep(T, TAG_FULL);
/** How far off its beat the thread is at film time T: 0 on a TAG_FULL beat, 1 off-beat, eased over 0.6 s from each
 *  switch (it scales the plane's idle motion, so every angle and offset stays continuous: never a jump). */
export function offbeat(T: number): number {
  const ev: [number, number][] = [];
  for (const [a, b] of TAG_FULL) ev.push([a, 0], [b, 1]);
  ev.sort((x, y) => x[0] - y[0]);
  let level = 1;
  let from = 1;
  let t0 = -1e9;
  for (const [t, st] of ev) {
    if (t > T) break;
    from = level;
    level = st;
    t0 = t;
  }
  const u = Math.min(1, Math.max(0, (T - t0) / 0.6));
  return from + (level - from) * u * u * (3 - 2 * u);
}
/** The tag's idle sway (deg): 1.2 on its beats, 0.55 off-beat (tier B motion, CRAFT §b: calmer than the beat's
 *  subject). */
export const tagSway = (T: number): number => 1.2 - 0.65 * offbeat(T);
/** The dim step: a warm multiply toward peach (screen white -> #F2D9C8, L* 88, C* 13), never greige or grey. */
export const DIM_TINT = '#F2D9C8';
const DIM_HALF = '#F9ECE4';

/** REST (early review E2: SQB's 9 s chart hold is the film's longest shot, and the dimmed plane still held more of the
 *  frame's salience than the chart): from HOOK_CALM_AT (6.35, the same step as the window sitting back; SQA's 4.04-5.80
 *  off-beat state, the approved pilot, is untouched) every off-beat stretch takes a deeper tier B (CRAFT §b: C* <= 25,
 *  contrast near the stage's, no near-black): the bezel a soft warm brown (L* 48) instead of L* 32 (its edge against the
 *  dimmed screen and the desk was the plane's strongest local contrast), the screen one more peach step (L* 84), the
 *  button and the badge a screen tint (no pop hue), the tag a soft terracotta (C* 24, its prices L* 82, a warm eyelet).
 *  On every beat the plane is full as before; each switch stays a 2-step change. */
export const PHONE_REST = {body: '#8D6A5F', pop: '#DEC1B1'};
export const TAG_REST = {body: '#C38F7F', text: '#E0C7BD', ring: '#D0B6AA', line: '#AB7465'};
const DIM_REST = '#E9CCB9';
const DIM_HALF_REST = '#F5E5DC';
/** 0 = the pilot's off-beat colours (before 6.35), 0.5 = the half step, 1 = rest. */
export const restK = (T: number): number => stepAt(T, HOOK_CALM_AT);

/** The POV hand's skin (B, CRAFT §c: its own value against the desk it lies over: L* ~76 after the support tier's
 *  pull, the desk 63 in the room's ambient; C* ~23). */
export const HAND_SKIN = '#E2AD94';
/** The description lines under the button: light hairlines (the listing's text stays quiet next to the tag). */
const DESC_TONE = '#DCCBC0';

// ================================================================= Pip

/** Pip's eyes and head: looking down-left at the tag; turns only in the pauses flow_v2 §1 lists. Peek pose's `look`
 *  never takes 0 (the pose reads 0 as its default 0.6). */
export const PIP_LOOK: LookKey[] = [
  {t: -99, v: -0.62},
  {t: 1.22, v: 0.3}, // "soon?": it looks up at you ...
  {t: 1.5, v: -0.62}, // ... and back to the tag before "AI's"
  {t: 9.04, v: -0.95}, // SQB: up at the card
  {t: 11.14, v: -0.62}, // back to the tag
  // SQE / SQF (the WINDOW lane's beats): it watches the street, the tag after the $1,099 tick, the BETTER van
  {t: 22.45, v: 0.35},
  {t: 30.95, v: -0.5},
  {t: 31.42, v: 0.35},
  {t: 33.11, v: 0.55},
  {t: 33.49, v: 0.35},
  {t: 38.2, v: -0.6}, // PAYOFF: down at the tag
  {t: 40.24, v: 0.05},
];
/** Pose / expression keys: the ears-droop beat on "buy one." (10.92) as the 'meh' face, back on "But"; the shrug on
 *  40.30 (the WINDOW lane's 40.24-40.70). */
export const PIP_KEYS: PipPoseKey[] = [
  {t: -99, pose: 'peek', amount: 0.86},
  {t: 1.2, pose: 'peek', amount: 1}, // "soon?": it leans out from behind the phone ...
  {t: 1.6, pose: 'peek', amount: 0.86}, // ... and tucks back before the first launch
  {t: 10.92, pose: 'peek', amount: 0.86, expression: 'meh'},
  {t: 11.48, pose: 'peek', amount: 0.86},
  {t: 40.24, pose: 'shrug'},
  {t: 40.7, pose: 'peek', amount: 0.86},
];
/** Pip's grip point on the phone's right edge (phone-local px at w 400) and its scale per phone k. */
export const PIP_GRIP: Pt = [400, 240];
export const PIP_SCALE = 1.35;

// ================================================================= where everything is (film time T)

export type ThreadState = {
  T: number;
  /** Phone props (top-left, width, height, rotation, button) for <Phone> / <Hand> / phonePoint. */
  phone: {x: number; y: number; w: number; h: number; rot: number; buttonY: number};
  k: number;
  /** The phone's local -> canvas matrix (its rotation about its centre). */
  m: Mat;
  /** The tag box (top-left, width, hang angle incl. the reactions) and where its string ties on (canvas px). */
  tag: {x: number; y: number; w: number; rot: number; stringFrom: Pt};
  /** The listing laptop (phone-local geometry) and its screen centre on the canvas (sticks lift off it). */
  listing: ReturnType<typeof laptopGeo>;
  listingScreen: Pt;
  /** Pip: its grip point and scale (phone-local), drawn in the phone's frame. */
  pip: {x: number; y: number; scale: number};
  /** The screen's dim (0 lit, 0.5 half step, 1 one value step down) and the tag's (0 its beat, 1 off-beat). */
  dim: number;
  tagDim: number;
  /** The thumb tip (phone-local px): resting on the button, lifted, pressing. */
  thumb: Pt;
};

/** The thumb tip at film time T (phone-local px at width w): the button's right part (the Hand's default), lifted back
 *  along the thumb toward its base 0.30-0.40 (outCubic), held, brought down 0.44-0.50 (inCubic), then the press's 8 px
 *  dip 0.50-0.64. */
export function thumbAt(T: number, w: number): Pt {
  const k = w / 400;
  const S = phoneSlots(w, 372, BUTTON_Y);
  const tip: Pt = [S.button.x + S.button.w * 0.88, S.button.y + S.button.h * 0.55];
  const base: Pt = [460 * k, S.button.y + 344 * k];
  const len = Math.hypot(tip[0] - base[0], tip[1] - base[1]) || 1;
  const u: Pt = [(tip[0] - base[0]) / len, (tip[1] - base[1]) / len];
  const up = prog(T, TAP.lift[0], TAP.lift[1] - TAP.lift[0], ease.outCubic) * (1 - prog(T, TAP.down[0], TAP.down[1] - TAP.down[0], ease.inCubic));
  const back = TAP.liftPx * k * up;
  const dip = T >= TAP.press ? 8 * k * Math.sin(Math.PI * prog(T, TAP.press, 0.14, ease.linear)) : 0;
  return [tip[0] - u[0] * back, tip[1] - u[1] * back + dip];
}

/** The hand holding the phone breathes: a tiny hand-held float of the whole plane (px, deg; ~5 px/s at most), keyed
 *  on film time so both sides of every seam draw it identically. Life on the subject itself, never a camera move. */
export function handFloat(T: number): {dx: number; dy: number; rot: number} {
  const w = (p: number) => (Math.PI * 2) / p;
  // off its beat the plane is tier B, a big near thing that only breathes while the stage acts (CRAFT §b: <= 2 %W/s):
  // 0.3 of the float (~0.2 %W/s), eased with offbeat(), so the beat's subject owns the motion (the SQA pilot review:
  // the phone's float was 88 % of the motion over 4.47-5.10 while the data center was the subject)
  const a = 1 - 0.7 * offbeat(T);
  return {
    dx: a * (1.6 * Math.sin(T * w(4.3) + 0.7) + 0.5 * Math.sin(T * w(1.9) + 2.1)),
    dy: a * (2.6 * Math.sin(T * w(3.1) + 0.2) + 0.7 * Math.sin(T * w(1.7) + 1.3)),
    rot: a * 0.25 * Math.sin(T * w(3.7) + 1.1),
  };
}

export function threadAt(T: number): ThreadState {
  const s0 = phoneSpotAt(T);
  const f = handFloat(T);
  const s = {x: s0.x + f.dx, y: s0.y + f.dy, w: s0.w};
  const k = s.w / 400;
  const phone = {x: s.x, y: s.y, w: s.w, h: s.w * PHONE_H, rot: PHONE_ROT + f.rot, buttonY: BUTTON_Y};
  const SL = phoneSlots(phone.w, 372, BUTTON_Y);
  const listing = laptopGeo(SL.laptop.x, SL.laptop.y, SL.laptop.w);
  const corner = listing.deck[3];
  const stringFrom = phonePoint(phone, corner[0] + 4 * k, corner[1] - 6 * k);
  const m = mat.compose(mat.translate(phone.x, phone.y), mat.about(mat.rotate(phone.rot), phone.w / 2, phone.h / 2));
  return {
    T,
    phone,
    k,
    m,
    tag: {x: s.x + 20 * k, y: s.y + 310 * k, w: 360 * k, rot: TAG_ROT + tagReaction(T), stringFrom},
    listing,
    listingScreen: phonePoint(phone, listing.screenC[0], listing.screenC[1]),
    pip: {x: PIP_GRIP[0] * k, y: PIP_GRIP[1] * k, scale: PIP_SCALE * k},
    dim: screenDim(T),
    tagDim: tagDim(T),
    thumb: thumbAt(T, phone.w),
  };
}

// ================================================================= the plane

/** The listing's calm lower half (phone-local, under the button): two light text lines and a row of rating stars in
 *  the screen's own light tones (no delivery row, no "you may also like" cards: the subject's frame stays quiet). */
const ListingRest: React.FC<{w: number; at?: number; T: number}> = ({w, at, T}) => {
  const k = w / 400;
  const y0 = (BUTTON_Y + 128) * k;
  const star = (cx: number, cy: number, r: number) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    }
    return d + 'Z';
  };
  const stars = [0, 1, 2, 3, 4].map((i) => star((52 + i * 26) * k, y0 + 70 * k, 10 * k)).join('');
  // the page finishes loading in the hook's quiet stretch: the rating, then the two lines (small pops on the subject)
  const a0 = at ?? -99;
  return (
    <>
      {T >= a0 + 1.0 ? <path d={stars} fill="#F4C98C" /> : null}
      {T >= a0 + 1.12 ? <rect x={40 * k} y={y0 + 108 * k} width={250 * k} height={12 * k} rx={6 * k} fill="#EFE6DF" /> : null}
      {T >= a0 + 1.22 ? <rect x={40 * k} y={y0 + 136 * k} width={190 * k} height={12 * k} rx={6 * k} fill="#EFE6DF" /> : null}
    </>
  );
};

/** A rounded rect as one closed path (phone-local px). */
const rrD = (x: number, y: number, w: number, h: number, r: number) =>
  `M${x + r} ${y}H${x + w - r}A${r} ${r} 0 0 1 ${x + w} ${y + r}V${y + h - r}A${r} ${r} 0 0 1 ${x + w - r} ${y + h}H${x + r}A${r} ${r} 0 0 1 ${x} ${y + h - r}V${y + r}A${r} ${r} 0 0 1 ${x + r} ${y}Z`;
const circD = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}A${r} ${r} 0 1 0 ${cx + r} ${cy}A${r} ${r} 0 1 0 ${cx - r} ${cy}Z`;

/** The screen's dim step (a multiply over the screen's rounded rect, phone-local), with the button and the cart badge
 *  left out (even-odd holes): they take their own soft off-beat blue (Phone `dim`), which a peach multiply would turn
 *  grey (#9AACCB x #F2D9C8 = C* 7). */
const ScreenDim: React.FC<{w: number; h: number; dim: number; rest?: number}> = ({w, h, dim, rest = 0}) => {
  if (dim <= 0) return null;
  const k = w / 400;
  const S = phoneSlots(w, 372, BUTTON_Y);
  const bt = S.button;
  const d = rrD(16 * k, 16 * k, w - 32 * k, h - 32 * k, 42 * k) + rrD(bt.x, bt.y, bt.w, bt.h, 20 * k) + circD(S.badge.x, S.badge.y, S.badge.r);
  const full = rest > 0 ? mixHex(DIM_TINT, DIM_REST, rest) : DIM_TINT;
  const half = rest > 0 ? mixHex(DIM_HALF, DIM_HALF_REST, rest) : DIM_HALF;
  return (
    <g style={{mixBlendMode: 'multiply'}}>
      <path d={d} fillRule="evenodd" fill={dim >= 1 ? full : half} />
    </g>
  );
};

/** Frame 0's tag: complete in ink with its "$999" until the fills land (the board's frame 0), then the live tag. */
const TagFrame0: React.FC<{S: ThreadState; tagAt: number}> = ({S, tagAt}) => {
  const T = S.T;
  const fillT = tagAt + 0.18;
  if (T >= fillT + 0.3) return null;
  const {x, y, w, rot, stringFrom} = S.tag;
  const h = w * 0.5;
  const hole: Pt = [x + w * 0.12, y + w * 0.25];
  return (
    <>
      <Look fills="none">
        <PriceTag x={x} y={y} w={w} rot={rot} sway={1.2} stringFrom={stringFrom} stringThrough value="$999" seed="thread/tag" />
      </Look>
      {T < fillT ? (
        <XG m={mat.compose(mat.translate(hole[0], hole[1]), mat.rotate(rot + 1.2 * Math.sin(T * 1.7 + 0)), mat.translate(-w * 0.12, -w * 0.25))}>
          <Txt x={w * 0.6} y={h * 0.68} size={w * 0.25} fit={w * 0.66} fill={EMBER.ink}>
            $999
          </Txt>
        </XG>
      ) : null}
    </>
  );
};

export type ThreadPlaneProps = {
  /** Film seconds (default: useFilmTime()). */
  T?: number;
  /** The light rig the plane reads (default HOME_RIG, the nook's: the lamp on screen-left). */
  rig?: LightRig;
  /** Drawn in the phone's local frame after its UI (e.g. a stick lifting off the listing). */
  children?: React.ReactNode;
  /** Leave Pip out (a lane drawing its own Pip beat), or the tag. */
  pip?: boolean;
  tag?: boolean;
  /** Overrides for the tag (e.g. the loop's turn back: {turn: k, value: '$999'}). */
  tagProps?: Partial<React.ComponentProps<typeof PriceTag>>;
};

/** QA: the render's input props say `{"threadOff": true}`: no thread plane in any composition (the A side of an A/B
 *  pair, like `lightOff`: the pixels that differ from the normal frame are the plane's exact mask, so a check can
 *  split the hero pixels, the salience and the motion between the plane and the stage). Read once. */
let THREAD_OFF: boolean | null = null;
const threadOff = () => {
  if (THREAD_OFF === null) {
    try {
      THREAD_OFF = (getInputProps() as {threadOff?: unknown} | undefined)?.threadOff === true;
    } catch {
      THREAD_OFF = false;
    }
  }
  return THREAD_OFF;
};

/** THE THREAD PLANE at film time T (see the header). Screen space: draw it after the stage, outside any world camera. */
export const ThreadPlane: React.FC<ThreadPlaneProps> = ({T: Tin, rig = HOME_RIG, children, pip = true, tag = true, tagProps}) => {
  const Tf = useFilmTime();
  const T = Tin ?? Tf;
  if (threadOff()) return null;
  if (T >= THREAD_GAP[0] && T < THREAD_GAP[1]) return null;
  const S = threadAt(T);
  const {phone, k} = S;
  // frame 0 (film time): outlines mid-draw at T 0; every fill lands FILL_LAG (0.18 s) after its piece's `at`, one step
  // inside its outline (SQA's <Look snapPops>), so the colour floods OUT FROM THE TAG: the tag 0.033, the screen 0.05,
  // the photo and the listing's laptop 0.06-0.1, the hand 0.08-0.16, the button 0.12, the dark bezel last (0.15)
  const AT = {phone: -0.16, listing: -0.04, tag: -0.147, hand: -0.1, pip: -0.1, bezel: 0.15};
  // REST (E2): from 6.35 the off-beat colours are the calmer rest ones (the beats are unchanged: dim 0 ignores them)
  const r = restK(T);
  const tagDimColors = r > 0 ? {body: mixHex(TAG_DIM.body, TAG_REST.body, r), text: mixHex(TAG_DIM.text, TAG_REST.text, r), ring: mixHex(TAG_DIM.ring, TAG_REST.ring, r), line: mixHex(TAG_DIM.line, TAG_REST.line, r)} : undefined;
  const phoneDimColors = r > 0 ? {body: mixHex(PHONE_DIM_BODY, PHONE_REST.body, r), pop: mixHex(PHONE_DIM_POP, PHONE_REST.pop, r)} : undefined;
  const tagEl = (
    <PriceTag
      x={S.tag.x}
      y={S.tag.y}
      w={S.tag.w}
      rot={S.tag.rot}
      sway={tagSway(T)}
      stringFrom={S.tag.stringFrom}
      stringThrough
      ticker={TICKER}
      old={T >= OLD_AT ? '$999' : undefined}
      oldAt={OLD_AT}
      strikeAt={STRIKE_AT}
      turnAt={TURN_AT}
      backPopAt={LIKE_POP_AT}
      dim={S.tagDim}
      dimColors={tagDimColors}
      at={AT.tag}
      seed="thread/tag"
      {...tagProps}
    />
  );
  // the hand (B): its own value over the desk, a same-hue line where it meets the desk and the phone (the support tier's
  // `lines`), no small marks; the thumb taps (TAP)
  const hand = <Hand phone={phone} thumbTo={S.thumb} skin={HAND_SKIN} details={false} closedThumb at={AT.hand} seed="thread/hand" />;
  // the hand's form shade: a crescent on its edges away from the lamp (screen-left), ~1/3 of the thumb's width
  const handC = phonePoint(phone, 380 * k, 700 * k);
  return (
    <FilmClock T={T}>
      <Lit rig={rig} off={T < LIGHT_ON}>
        <Phone
          {...phone}
          price={null}
          titleRule={false}
          badge={1}
          badgeAt={TAP.badge}
          pressAt={TAP.press}
          pressDark
          dim={S.dim}
          dimColors={phoneDimColors}
          bodyFillAt={AT.bezel}
          descTone={DESC_TONE}
          at={AT.phone}
          seed="thread/phone"
        >
          <ListingRest w={phone.w} at={AT.listing + 0.2} T={T} />
          {children}
          <ScreenDim w={phone.w} h={phone.h} dim={S.dim} rest={r} />
        </Phone>
        {pip ? (
          <XG m={S.m}>
            <Pip3 x={S.pip.x} y={S.pip.y} scale={S.pip.scale} keys={PIP_KEYS} look={PIP_LOOK} lookDur={0.2} at={AT.pip} drawDur={0.5} seed={7} />
          </XG>
        ) : null}
        {tag ? (
          <>
            {tagEl}
            <TagFrame0 S={S} tagAt={AT.tag} />
            {T >= FORM_WINDOW[0] && T < FORM_WINDOW[1] ? <FormShade of={tagEl} c={[S.tag.x + S.tag.w * 0.55, S.tag.y + S.tag.w * 0.25]} size={[S.tag.w, S.tag.w * 0.5]} frac={0.33} /> : null}
            {RIM_WINDOWS.some(([a, b]) => T >= a && T < b) ? <Rim of={tagEl} c={[S.tag.x + S.tag.w * 0.55, S.tag.y + S.tag.w * 0.25]} size={[S.tag.w, S.tag.w * 0.5]} width={5 * k} /> : null}
          </>
        ) : null}
        <Tier tier="support" lines>
          {hand}
          <FormShade of={hand} c={handC} size={[110 * k, 110 * k]} kind="crescent" frac={0.22} />
        </Tier>
      </Lit>
    </FilmClock>
  );
};
