// scene07/lens.ts — the lens sheet's OUT phase (motion spec T-MATCH: the page at the lens shrinks into S07's pinned
// notice), as ONE pure function of FILM time, for S06's Wiper to call after its full-frame hold (fix round 2 of S07).
//
// The film shows the lens sheet through S06's `pageAt(T)` (src/scenes/scene06/page.tsx): S06's Wiper draws it above
// both scenes and S07 draws the very same page as its own copy (Scene07.tsx imports LeakPage), so the two can never
// disagree. Today pageAt holds x8.5 (+4 % creep) at HOLD.focus until S06's end (21.985) and then jumps to
// lensWipeAt(S07_LENS) (focus (540, 960), outCubic in log scale): the first S07 frame (22.000) steps x8.8 -> x3.2 and
// recentres ~250 px (review: 'the lens hand-over pops'). The proposed out phase, for pageAt's post-hold branch:
//
//   import {LENS_OUT, lensOutAt} from '../scene07/lens';
//   if (own || T <= LENS_OUT.t0) { ...the hold... }
//   const st = lensOutAt(T, pageAt(LENS_OUT.t0, true)!);   // null from S07's pin on (S07's own notice takes over)
//
// It starts FROM the hold's own state on S06's last frame (21.967: centre, scale, rotation, skew), so there is no jump,
// and ends exactly on S07's notice (295, 1140, x1, -2 deg) at S07's pin (22.165). The zoom is a pure lens pull-back
// about the fixed point F where the sheet's centre stays on the line c(s) = F + s (R - F) (no re-centring), the scale
// eased in LOG space by 1 - (1 - u)^1.4: per-frame scale ratios 0.61, 0.64, 0.66, 0.70, 0.75, then the landing (the
// reference T-MATCH runs ~0.65 a frame; lensWipeAt's outCubic gave 0.40 on the first frame).

import type {Pt} from '../../lib';

export type LensState = {x: number; y: number; s: number; rot: number; skew: number};

export const LENS_OUT = {
  /** S06's last film frame (frame 659): the out phase starts from the hold as drawn there. */
  t0: 659 / 30,
  /** S07's pin (w73 'word' 22.155 - 0.05 + 0.06): the sheet lands; S07's own notice from here. */
  t1: 22.165,
  /** S07's notice (Scene07.tsx NOTICE). */
  rest: {x: 295, y: 1140, s: 1, rot: -2} as const,
  /** Log-scale ease exponent: q = 1 - (1 - u)^pow. */
  pow: 1.4,
  /** Inside the FIRST film frame interval (t0 -> t0 + 1/30) the pull-back eases IN from rest (q ~ u^inPow, meeting the
   *  out curve's value on the film frame t0 + 1/30): the hold before it is nearly static, and every film frame keeps
   *  exactly the 1 - (1 - u)^pow steps. Only in-between times change (S07's own composition samples film time t0 + 0.5 f
   *  on its first frame: there the sheet's solid heading bar sat right behind S06's caption text; now it is still above
   *  it, and on the film frame 22.000 it is already below it). */
  inPow: 3.5,
};

/** The out phase's log-scale progress at u (0..1 over t0..t1). */
function outQ(u: number, o: typeof LENS_OUT): number {
  const q = (v: number) => 1 - Math.pow(1 - v, o.pow);
  const u1 = 1 / 30 / (o.t1 - o.t0);
  return u >= u1 ? q(u) : q(u1) * Math.pow(Math.max(0, u) / u1, o.inPow);
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
