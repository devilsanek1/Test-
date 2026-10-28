// V2S1 helper (lane L1): the shot's ONE clock and contract, shared by every V2S1_* part (TREATMENT.md sections 3-5,
// map.ts sections 5-6). Pure numbers, nothing draws here. Every part reads its beats, the flood timing, the lockstep
// and the zones the life keeps clear from this file, so the parts built in parallel agree frame for frame.
//
// Conventions: scene seconds = film seconds (S1 starts at 0; t < 0 is the loop underlay, -0.26 ... 0: paper and the
// flat pale shapes, no line yet: S1_F0). Parts draw in WORLD px = screen px: the camera is LOCKED at zoom 1.00 (conform_L1 §2: the 5 %
// pull-out is retired, map s1Zoom = 1.00); V2S1.tsx wraps them in the Look cascade (the pale state, then the flood).
import {clamp, ease} from '../../lib/time';
import {drawn} from '../kit/cast/gait';
import * as MAP from '../world/map';

export const C = MAP.S1_CLOCK;

// ---------------------------------------------------------------- the colour flood
/**
 * lib/exit `Look cascade`: every <Fill> turns from paper to its colour on the frame the front (a circle growing from
 * SUN0's SCREEN spot) reaches its bbox centre in SCREEN px. REVIEW_1 MUST 2: the flood waits for the pen (S1_DRAW,
 * done by 0.39, the lamp click 0.40) and starts at 0.44 (f27: with the ding); 5200 px/s puts the far bottom-right
 * corner (~1560 px) at ~0.74 (f45), so her teal coat (held paper to HER_COAT_AT) lands LAST at f47, done by ~0.8 s.
 * Order: the disc, the sky f27-30 (V2S1_sky), far roofs + bridge, the wing f31-35, water, boats, the far towpath and
 * the steps by f45, her coat f47.
 * Ink is NOT changed by the Look: a stroke drawn in a colour (a bike frame, slab joints in CM.line) stays coloured
 * at f0. Parts draw such strokes in CM.ink until `floodAt` of their spot, then in their colour.
 */
export const FLOOD = {t0: C.flood.t0, speed: 5200} as const;
/** The flood origin in screen px (SUN0 through the f1 camera). */
export const FLOOD_ORIGIN: [number, number] = (() => {
  const p = MAP.s1Screen({x: MAP.SUN0.x, y: MAP.SUN0.y}, FLOOD.t0);
  return [p.x, p.y];
})();
/** When the flood reaches a WORLD point (its screen spot at the flood's own time, zoom ~1.05). */
export const floodAt = (x: number, y: number): number => {
  const p = MAP.s1Screen({x, y}, 0.15);
  return FLOOD.t0 + Math.hypot(p.x - FLOOD_ORIGIN[0], p.y - FLOOD_ORIGIN[1]) / FLOOD.speed;
};
/** Her coat stays paper to f47: the eye lands on her last (REVIEW_1 MUST 2: the flood done by ~0.8 s). */
export const HER_COAT_AT = 0.78;

// ---------------------------------------------------------------- frame 0 in the clean pen (DIRECTION rule 9)
/** Before the flood every fill but a backdrop is mix(colour, paper, S1_PALE) (lib/exit Look `cascade.pale`): C and B land
 *  as flat PALE shapes, no lines. 0.7 reads as a clearly pale first state at 0.4 scale and still parts the planes. */
export const S1_PALE = 0.7;
/** The pen (REVIEW_1 MUST 2; DIRECTION rule 9; playbook "every opening effect BIG enough to stop a thumb"): the strokes
 *  START at frame 0 and are the event: her outline first (one moving pen, her parts in sequence, begun 1 frame before
 *  f0 so frame 0 already shows the tip on her first stroke), then the door (its frame, then the two leaves: one pen per
 *  leaf), then W, whose frame closes on the lamp click (0.40). Each object's pen moves at one steady speed with a
 *  visible TIP on its head (`tip`: a solid disc of radius tip x the line width, the line's own colour), the line at
 *  full contrast and bold (S1_BOLD), ~0.41 s in all; then the flood (FLOOD, 0.44-0.78). */
export const S1_DRAW = {
  her: {at: -1 / 60, dur: 0.22, tip: 1.25},
  doorFrame: {at: 0.12, dur: 0.09, tip: 1.25},
  leaves: {at: 0.18, dur: 0.14, tip: 1.25},
  w: {at: 0.27, dur: 0.12, tip: 1.25},
} as const;
/** The draw-on's bold line: the subject's 3.0 px A line x 1.8 = 5.4 px (>= 5 px at 1080, so it reads at 360 px) while
 *  the pen draws, easing back to the house A line over the flood (FLOOD.t0 .. `until`): an InkScale (lib/inkComp)
 *  around frame 0's three subjects, so widths, the tier colour and the tip follow the clean pen. */
export const S1_BOLD = {k: 1.8, until: 0.8} as const;
export const s1Bold = (t: number): number =>
  t < FLOOD.t0 ? S1_BOLD.k : t >= S1_BOLD.until ? 1 : 1 + (S1_BOLD.k - 1) * (1 - ease.inOutSine(clamp((t - FLOOD.t0) / (S1_BOLD.until - FLOOD.t0))));
/** Tier A spans (film s): W is the subject before the lamp click and from her look back to the dive (support, no
 *  outline, between them); the door (with its
 *  canopy letters) from frame 0 through her step-out and the doors shutting (A at 0.45-1.40 in conform_L1 §5; it is
 *  also one of frame 0's three drawn subjects, so it holds A from the loop underlay on). */
export const S1_TIER_A = {w: [[-1, 0.4], [5.59, 6.25]] as [number, number][], door: [-1, 1.4] as [number, number]} as const;
export const wIsSubject = (t: number) => S1_TIER_A.w.some(([a, b]) => t >= a && t < b);
export const doorIsSubject = (t: number) => t >= S1_TIER_A.door[0] && t < S1_TIER_A.door[1];
/** Pip: absent at t < 0 (S8's Pip owns the loop seam) and while the pen draws the subject; with the flood (FLOOD.t0)
 *  its tinted line draws on over 0.30 s, its fills paper until the flood reaches its seat, then its colour. */
export const S1_PIP = {seat: [700, 1235] as [number, number], from: FLOOD.t0, drawDur: 0.3, size: 100} as const;

/**
 * S1_F0: the t < 0 / frame-0 state, for lane L6 (S8 un-builds onto it; the loop seam). Everything at zoom 1.00, screen px.
 *   paper sky (World sky CM.white); every fill PALE (mix toward the paper by `pale`), backdrops paper; NO line at
 *   t < 0 (the un-build lands on paper and pale shapes); from frame 0 the pen draws the subject (S1_DRAW: her behind
 *   the glass door, mid-stride, x 692, feet MAP.S1_HER_STEP_OUT.feetFrom; the door frame + its two leaves, shut; W's
 *   frame, W lamp-lit, CM.lamp flat pane), bold, with its tip; the sun half-coloured (SunHalf: the lower-left half
 *   CM.sun, the rest pale); Pip ABSENT (its bollard drawn, pale) until its line draws on with the flood.
 *   Then the flood from SUN0 (FLOOD: t0 0.44, 5200 px/s), her teal coat last (HER_COAT_AT 0.78).
 */
export const S1_F0 = {
  pale: S1_PALE,
  /** The page (CM.white, the World sky at f0): what the pale shapes are mixed toward. */
  paper: '#FBF3E6',
  outline: {at: S1_DRAW.her.at, end: S1_DRAW.w.at + S1_DRAW.w.dur, perObject: 'one moving pen with a tip (the leaves: one per leaf)', bold: S1_BOLD.k},
  drawn: ['her behind the glass door', 'the door frame + leaves', "W's frame"],
  sunHalf: true,
  flood: {t0: FLOOD.t0, speed: FLOOD.speed, origin: FLOOD_ORIGIN, herCoatAt: HER_COAT_AT},
  W: {x: MAP.W.x, y: MAP.W.y, w: MAP.W.w, h: MAP.W.h, zoom: 1.0, state: 'lamp-lit until 0.40, then plum'},
  pip: {absentBefore: 0, seat: S1_PIP.seat, lineFrom: S1_PIP.from, lineDur: S1_PIP.drawDur, bollardTop: S1_PIP.seat},
} as const;

// ---------------------------------------------------------------- her walk = the row's lockstep
/**
 * Her step count, ONE number for the whole row (the ghosts and the outlines walk in lockstep), sampled on the 12
 * drawings/s clock (house rule: drawn poses step, travel moves every frame). 1 step = one foot forward; the legs are
 * at full scissor on x.5 and passing on whole numbers.
 *   t < 0.55   0.5: mid-stride behind the glass (frame 0 and the loop underlay)
 *   0.55-0.97  -> 1.5: one slow step toward the opening doors
 *   0.97-4.54  -> 7.5: the stroll, 1.68 steps/s x 23.8 px = her 40 px/s (short steps), so the "..." stop at 4.54
 *              freezes EVERY figure exactly mid-stride (x.5: the legs apart, never together)
 *   4.98-5.25  -> 8.5: ONE step together on "life" (her 537 -> 510), the other leg forward; held to the dive.
 */
export const S1_STEPS = {f0: 0.5, door: {t0: 0.55, to: 1.5}, walk: {to: 7.5}, life: {dur: 0.27, to: 8.5}} as const;
export const s1Step = (t: number): number => {
  const tq = drawn(t, 12);
  if (tq < C.steppingOut) return S1_STEPS.f0 + (S1_STEPS.door.to - S1_STEPS.f0) * clamp((tq - S1_STEPS.door.t0) / (C.steppingOut - S1_STEPS.door.t0));
  if (tq < C.life) return S1_STEPS.door.to + (S1_STEPS.walk.to - S1_STEPS.door.to) * clamp((tq - C.steppingOut) / (C.stop.t0 - C.steppingOut));
  return S1_STEPS.walk.to + (S1_STEPS.life.to - S1_STEPS.walk.to) * clamp((tq - C.life) / S1_STEPS.life.dur);
};
/** Her stroll's step length on the straight (px at 170 px tall): 40.06 px/s / 1.68 steps/s. */
export const S1_STEP_PX = MAP.S1_HER_WALK_PX_S / ((S1_STEPS.walk.to - S1_STEPS.door.to) / (C.stop.t0 - C.steppingOut));

/** Her x behind the glass before the step-out (0.55-0.97 she nears the opening doors: 692 -> 680), then map s1HerX. */
export const s1HerXAt = (t: number): number => (t < C.steppingOut ? 692 - 12 * clamp((t - 0.55) / (C.steppingOut - 0.55)) : MAP.s1HerX(t));
/** Her head centre (world px) for Pip's gaze. */
export const s1HerHead = (t: number): [number, number] => {
  const p = MAP.s1RowAt(Math.max(t, 0))[0];
  return [s1HerXAt(t), p.feetY - p.h * 0.9];
};

// ---------------------------------------------------------------- zones the life keeps clear
/** World px, film seconds. Far-towpath life (walkers, joggers, cyclists, dogs) never enters these; checked by eye on
 *  the review strip. `herX` zones follow her. */
export const KEEP_CLEAR: {why: string; t0: number; t1: number; x0: number; x1: number; y0: number; y1: number; followsHer?: boolean}[] = [
  {why: 'the doorway is hers alone (the lamp click, the doors, her step-out)', t0: 0.4, t1: 1.25, x0: 520, x1: 740, y0: 820, y1: 1110},
  {why: 'nothing over her (+-75 px of her x) while she stands out alone and G1 pops', t0: 1.25, t1: 2.45, x0: -75, x1: 75, y0: 880, y1: 1110, followsHer: true},
  {why: "nothing over G1's pop spot (one step ahead of her)", t0: 1.8, t1: 2.45, x0: 515, x1: 640, y0: 880, y1: 1110},
  {why: 'the row far end and the three bare outlines read clean', t0: 4.5, t1: 6.1, x0: 0, x1: 230, y0: 880, y1: 1110},
  {why: 'nothing over her or the row from the stop through the cover to the dive (the cover frame is 5.30)', t0: 4.4, t1: 6.1, x0: 0, x1: 600, y0: 880, y1: 1110},
];
/** No passer-by within 300 px of her may echo her: no plum coat, no bun or low bun, no long coat, never teal. */
export const LOOKALIKE_RADIUS_PX = 300;
