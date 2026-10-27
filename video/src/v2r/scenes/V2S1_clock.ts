// V2S1 helper (lane L1): the shot's ONE clock and contract, shared by every V2S1_* part (TREATMENT.md sections 3-5,
// map.ts sections 5-6). Pure numbers, nothing draws here. Every part reads its beats, the flood timing, the lockstep
// and the zones the life keeps clear from this file, so the parts built in parallel agree frame for frame.
//
// Conventions: scene seconds = film seconds (S1 starts at 0; t < 0 is the loop underlay, -0.26 ... 0, the bare-line
// state). Parts draw in WORLD px = zoom-1.00 screen px (the cover pose, 5.30); V2S1.tsx wraps them in the pull-out
// camera (map s1Zoom: 1.05 -> 1.00 about W, ease-in, 0-4.90) and in the Look cascade (the flood).
import {clamp} from '../../lib/time';
import {drawn} from '../kit/cast/gait';
import * as MAP from '../world/map';

export const C = MAP.S1_CLOCK;

// ---------------------------------------------------------------- the colour flood
/**
 * lib/exit `Look cascade`: every <Fill> turns from paper to its colour on the frame the front (a circle growing from
 * SUN0's SCREEN spot at f1) reaches its bbox centre in SCREEN px. 5800 px/s puts the far bottom-right corner (~1560
 * px) at f17, so her teal coat (held paper to f18 with `coatAt`) lands LAST. Order (TREATMENT section 4): the disc, the
 * sky f2-5 (V2S1_sky), far roofs + bridge f4-8, the wing f6-12, water f9-13, boats f11-14, the far towpath and the
 * steps f12-17, her coat f18.
 * Ink is NOT changed by the Look: a stroke drawn in a colour (a bike frame, slab joints in CM.line) stays coloured
 * at f0. Parts draw such strokes in CM.ink until `floodAt` of their spot, then in their colour.
 */
export const FLOOD = {t0: 0.02, speed: 5800} as const;
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
/** Her coat stays paper to f18: the eye lands on her last. */
export const HER_COAT_AT = 0.3;

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
