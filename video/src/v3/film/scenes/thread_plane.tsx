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
// old $999 shown struck from 1.88, struck at 1.92) -> $1,099 on "pass" 30.28. Reactions: jolt 15.30, tug 18.30, sway
// 24.44, jolt 35.95, the turn 39.70 (the mini data center "AI" on its back). The screen dims one value step while the
// stage leads (lit 0-4.40, 17.24-19.40, 29.90-31.00, 38.12-41.15; a 2-step change, 3 frames apart, never a fade).
//
// Tiers (CRAFT §b): the TAG is the subject (A: the only full outline, the hero colour; a warm rim on its lamp side
// while it ticks, 1.88-3.30); the phone is its frame (its UI calm: no stars, delivery row or cards); the HAND is
// supporting life (B: a same-hue tinted line, one ambient step down like the room); Pip is B (C* <= 25, a ~2 px
// same-hue line, the 'peek' pose clinging to the phone's right edge, phone-local x ~389-489, y ~143-248 at w 400:
// <= 1 % of the frame): blinks, ear and trunk idle; head turns only in the pauses flow_v2 lists.
// Frame 0 (T < 0.3): the phone's and the tag's outlines draw on (the tag complete in ink with its "$999"), the hand's
// and Pip's tinted lines with them; fills land 0.06-0.2. T < 0 is the loop underlay (the frame-0 drawing state).
import React from 'react';
import {ease, type Ease} from '../../../lib/time';
import {useFilmTime} from '../../../lib/sequence';
import {Look} from '../../../lib/exit';
import {mat, type Mat, XG} from '../../../lib/xf';
import {EMBER, Hand, laptopGeo, Phone, phonePoint, phoneSlots, Pip3, PriceTag, Show, Txt, type LookKey, type PipPoseKey, type Pt, type TickerStep} from '../kit';
import {Lit, Rim, Shade, type LightRig} from '../kit/Light';
import {ambientTint, FilmClock, HOME_RIG, LIGHT_ON} from './home_set';

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
export const REACT = {tap: 0.0, settle: 2.72, lower: 3.82, jolt: [15.3, 35.95], tug: 18.3, sway: 24.44};
/** The warm rim on the tag's lamp side while it ticks (CRAFT §d.8: the subject only). */
export const RIM_WINDOW: [number, number] = [1.86, 3.3];

/** Extra hang angle (deg) from the tag's reactions at film time T (the ticker's own jolts are PriceTag's). */
export function tagReaction(T: number): number {
  let a = 0;
  // the thumb's tap jostles the phone: the tag swings and settles over ~1.2 s (the hook's quiet stretch stays alive
  // through the subject itself)
  if (T >= REACT.tap) {
    const d = T - REACT.tap;
    a += 4.2 * Math.exp(-d * 1.5) * Math.sin(d * Math.PI * 2 * 1.3);
  }
  // after the last tick the tag keeps settling (~1 s), and when the phone lowers (3.64-4.00) it swings from inertia
  // and settles through "data centers are." (physical secondary motion on the subject; small next to the beat)
  if (T >= REACT.settle) {
    const d = T - REACT.settle;
    a += 3.2 * Math.exp(-d * 2.0) * Math.sin(d * Math.PI * 2 * 1.5);
  }
  if (T >= REACT.lower) {
    const d = T - REACT.lower;
    a += -3.4 * Math.exp(-d * 1.5) * Math.sin(d * Math.PI * 2 * 1.2);
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

export const SCREEN_LIT: [number, number][] = [
  [-99, 4.4],
  [17.24, 19.4],
  [29.9, 31.0],
  [38.12, 99],
];
const litAt = (T: number) => SCREEN_LIT.some(([a, b]) => T >= a && T < b);
/** 0 = lit, 0.5 = half way (the 3-frame middle step), 1 = dimmed one value step. */
export function screenDim(T: number): number {
  const a = litAt(T);
  const b = litAt(T - 0.05);
  return a && b ? 0 : !a && !b ? 1 : 0.5;
}
/** The dim step: a warm multiply (screen white -> L* ~89), never grey. */
export const DIM_TINT = '#EBDFD5';
const DIM_HALF = '#F5EFEA';

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
  dim: number;
};

/** The hand holding the phone breathes: a tiny hand-held float of the whole plane (px, deg; ~5 px/s at most), keyed
 *  on film time so both sides of every seam draw it identically. Life on the subject itself, never a camera move. */
export function handFloat(T: number): {dx: number; dy: number; rot: number} {
  const w = (p: number) => (Math.PI * 2) / p;
  return {
    dx: 1.6 * Math.sin(T * w(4.3) + 0.7) + 0.5 * Math.sin(T * w(1.9) + 2.1),
    dy: 2.6 * Math.sin(T * w(3.1) + 0.2) + 0.7 * Math.sin(T * w(1.7) + 1.3),
    rot: 0.25 * Math.sin(T * w(3.7) + 1.1),
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

/** The screen's dim step (a multiply over the screen's rounded rect, phone-local). */
const ScreenDim: React.FC<{w: number; h: number; dim: number}> = ({w, h, dim}) => {
  if (dim <= 0) return null;
  const k = w / 400;
  const r = 42 * k;
  return (
    <g style={{mixBlendMode: 'multiply'}}>
      <rect x={16 * k} y={16 * k} width={w - 32 * k} height={h - 32 * k} rx={r} ry={r} fill={dim >= 1 ? DIM_TINT : DIM_HALF} />
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
        <PriceTag x={x} y={y} w={w} rot={rot} sway={1.2} stringFrom={stringFrom} value="$999" seed="thread/tag" />
      </Look>
      {T < fillT + 0.04 ? (
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

/** THE THREAD PLANE at film time T (see the header). Screen space: draw it after the stage, outside any world camera. */
export const ThreadPlane: React.FC<ThreadPlaneProps> = ({T: Tin, rig = HOME_RIG, children, pip = true, tag = true, tagProps}) => {
  const Tf = useFilmTime();
  const T = Tin ?? Tf;
  if (T >= THREAD_GAP[0] && T < THREAD_GAP[1]) return null;
  const S = threadAt(T);
  const {phone, k} = S;
  // frame 0 (film time): outlines mid-draw at T 0, fills land 0.06-0.2 (FILL_LAG 0.18)
  const AT = {phone: -0.12, listing: -0.04, tag: -0.06, hand: -0.1, pip: -0.1};
  const tagEl = (
    <PriceTag
      x={S.tag.x}
      y={S.tag.y}
      w={S.tag.w}
      rot={S.tag.rot}
      sway={1.2}
      stringFrom={S.tag.stringFrom}
      ticker={TICKER}
      old={T >= OLD_AT ? '$999' : undefined}
      oldAt={OLD_AT}
      strikeAt={STRIKE_AT}
      turnAt={TURN_AT}
      at={AT.tag}
      seed="thread/tag"
      {...tagProps}
    />
  );
  const hand = <Hand phone={phone} pressAt={0} at={AT.hand} seed="thread/hand" tier="support" />;
  return (
    <FilmClock T={T}>
      <Lit rig={rig} off={T < LIGHT_ON}>
        <Phone {...phone} price={null} badge={1} badgeAt={0.05} pressAt={0} at={AT.phone} seed="thread/phone">
          {/* the tag hangs in the price slot: the listing's title rule under it would peek out as a stray line */}
          <Show at={AT.phone + 0.21}>
            <rect x={30 * k} y={284 * k} width={250 * k} height={34 * k} fill={EMBER.screen} />
          </Show>
          <ListingRest w={phone.w} at={AT.listing + 0.2} T={T} />
          {children}
          <ScreenDim w={phone.w} h={phone.h} dim={S.dim} />
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
            {T >= RIM_WINDOW[0] && T < RIM_WINDOW[1] ? <Rim of={tagEl} c={[S.tag.x + S.tag.w * 0.55, S.tag.y + S.tag.w * 0.25]} size={[S.tag.w, S.tag.w * 0.5]} width={5 * k} /> : null}
          </>
        ) : null}
        {hand}
        {/* the hand sits one ambient step down like the room (B: it never outshines the tag) */}
        <Shade of={hand} tint={ambientTint(T)} />
      </Lit>
    </FilmClock>
  );
};
