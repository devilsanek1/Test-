// scene07/lens.ts — the lens sheet's OUT phase (motion spec T-MATCH: the page at the lens shrinks into S07's pinned
// notice), as ONE pure function of FILM time, for S06's Wiper to call after its full-frame hold (fix round 2 of S07).
//
// The film shows the lens sheet through S06's `pageAt(T)` (src/scenes/scene06/page.tsx): S06's Wiper draws it above
// both scenes and S07 draws the very same page as its own copy (Scene07.tsx imports LeakPage), so the two can never
// disagree. pageAt's post-hold branch (S06 fix round 3) runs this out phase:
//
//   import {LENS_OUT, lensOutAt} from '../scene07/lens';
//   if (own || T <= LENS_OUT.t0) { ...the hold (x7.8 + 4 % creep about the doodle)... }
//   return lensOutAt(T, pageAt(LENS_OUT.t0, true)!);   // null from S07's pin on (S07's own notice takes over)
//
// It starts FROM the hold's own state (centre, scale, rotation, skew), so there is no jump, and ends exactly on S07's
// notice (295, 1140, x1, -2 deg) at S07's pin (22.165). The zoom is a pure lens pull-back about the fixed point F where
// the sheet's centre stays on the line c(s) = F + s (R - F) (no re-centring), the scale eased in LOG space.
// A1 fix round 1 (the frame-22.000 'strikethrough'): the sheet has to cross the caption band (S06's two lines, then the
// roll to 'but word got out before') on its way down; on film frame 22.000 its top ink edge ran through 'They gave the
// PHP' and the dog-ear cut 'heads-up,'. The out phase now starts one film frame later, from the hold on S07's first film
// frame (t0 = 22.000: the full page, white paper over the whole band), and eases in and out: q = 1 - (1 - u^1.6)^1.7,
// film frames x8.11 -> 6.21 -> 3.78 -> 2.14 -> 1.29 -> the pin (ratios 0.77, 0.61, 0.57, 0.60, 0.78; the reference
// T-MATCH runs ~0.65 a frame). On 22.033 the top edge is above the rolling caption and the solid heading bar sits in the gap between
// 'people a heads-up,' and the incoming line; from 22.067 the whole sheet is below the caption (checked on cmp06 against
// the caption mask: every sheet edge, the dog-ear and the heading bar >= 14 px clear of every glyph box).

import type {Pt} from '../../lib';

export type LensState = {x: number; y: number; s: number; rot: number; skew: number};

export const LENS_OUT = {
  /** The out phase starts from the hold as drawn on this film frame: S07's first film frame (frame 660). A1 fix round 1:
   *  was S06's last frame (659), which put the sheet's top edge through the caption on 22.000. */
  t0: 660 / 30,
  /** S07's pin (w73 'word' 22.155 - 0.05 + 0.06): the sheet lands; S07's own notice from here. */
  t1: 22.165,
  /** S07's notice (Scene07.tsx NOTICE). */
  rest: {x: 295, y: 1140, s: 1, rot: -2} as const,
  /** Log-scale progress q = 1 - (1 - u^inPow)^pow (u = 0..1 over t0..t1): an ease in from the near-static hold
   *  (inPow) and a light ease out onto the board (pow). */
  pow: 1.7,
  inPow: 1.6,
};

/** The out phase's log-scale progress at u (0..1 over t0..t1). */
function outQ(u: number, o: typeof LENS_OUT): number {
  const v = Math.max(0, Math.min(1, u));
  return 1 - Math.pow(1 - Math.pow(v, o.inPow), o.pow);
}

/** Where the lens sheet is at film time T during the out phase (screen px), from the hold state `from` at LENS_OUT.t0;
 *  null from t1 on. */
export function lensOutAt(T: number, from: LensState, o = LENS_OUT): LensState | null {
  if (T >= o.t1) return null;
  const u = Math.max(0, Math.min(1, (T - o.t0) / (o.t1 - o.t0)));
  const q = outQ(u, o);
  const s = from.s * Math.pow(o.rest.s / from.s, q);
  // the fixed point of the pull-back: c(s) = F + s (R - F) passes through the hold centre at from.s and R at 1
  const R: Pt = [o.rest.x, o.rest.y];
  const k = from.s - o.rest.s;
  const F: Pt = k > 1e-6 ? [(from.s * R[0] - from.x) / k, (from.s * R[1] - from.y) / k] : R;
  return {
    x: F[0] + s * (R[0] - F[0]),
    y: F[1] + s * (R[1] - F[1]),
    s,
    rot: from.rot + (o.rest.rot - from.rot) * q,
    skew: from.skew * (1 - q),
  };
}
