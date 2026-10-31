// FLOW v5, BREEZE: the garments. ONE shape per garment, narrow at sloping shoulders and freer toward the hem, long
// straight runs ending in sharp points that sweep downwind, folds (where any) one long straight plane from the shoulder
// down; no lapels, cuffs, pockets, seams, buttons or stacks. Each returns its outline and its planes (polygons seen only
// through the garment's clip). Authored for a wind to the right in the breeze (W0); flow.ts moves the free nodes.
import {outline, poly, lerp, add, sub, norm, smin, smax, type V2} from './v';
import {F, flowNodes, type FN, type FlowCtx} from './flow';
import type {Joints} from './body';

export type Plane = {d: string; tone: 'lit' | 'shade' | 'deep' | 'base'; opacity?: number; blur?: number};
/** A garment: its outline, its planes, its hem's height; `hand` = where a sleeve plane ends (a small hand tick there). */
export type Shape = {d: string; planes: Plane[]; hem: number; hand?: {wr: V2; dir: V2}};

// ---------------------------------------------------------------- the long open coat (her)
/** Her long coat, from the shoulders to mid-shin, open but read as ONE shape (the opening is one straight plane edge).
 *  The breeze shapes it: the upwind side hangs straight and close (in a headwind the front presses onto the leading
 *  leg); the width is all downwind, where the coat's lower half runs out from the waist into ONE long, slightly lifted
 *  tail point and a shorter second point (06's flag and 05's back flare, at breeze strength). The shoulders slope into
 *  the sides in one run; the near arm hangs inside as one long sleeve plane ending in a small hand tick (05), so she
 *  reads as a woman in a coat, never a cape. */
export function longCoat(J: Joints, cx: FlowCtx, o: {hem: number; flare?: number}): Shape {
  const nb = J.neckBase;
  const hem = o.hem;
  const fl = o.flare ?? 1;
  if (J.view === 'q') {
    // front 3/4 facing left; the breeze from the left
    const [sfx, sfy] = J.shF;
    const [snx, sny] = J.shN;
    const ns: FN[] = [
      F(nb[0] - 19, nb[1] - 4, 0, {c: true}),
      // the far shoulder slopes into the upwind side in one run, which then hangs straight and close
      F(nb[0] - 44, nb[1] + 12, 0, {k: 1.05}),
      F(sfx + 4, sfy + 24, 0, {k: 1.1}),
      F(sfx - 8, sfy + 96, 0, {k: 0.9}),
      F(sfx - 11, 560, 0.05, {k: 0.6, u: 0}),
      F(sfx - 8, hem + 4, 0.22, {c: true, u: 0, ph: 0.2}),
      // the hem: a small front point, a notch, the shorter second point, a notch, the long tail lifted downwind
      F(nb[0] - 28, hem + 30, 0.4, {c: true, u: 0.18, ph: 0.3}),
      F(nb[0] + 8, hem + 6, 0.38, {c: true, u: 0.3, ph: 0.3}),
      F(snx + 112 * fl, hem - 14, 0.72, {c: true, u: 0.52, ph: 0.4, amp: 6}),
      F(snx + 50 * fl, hem - 46, 0.55, {c: true, u: 0.62, ph: 0.4}),
      F(snx + 200 * fl, hem - 78, 1, {c: true, u: 1, ph: 0.5, amp: 8}),
      // the near side: one long straight run from the tail up to the waist, then the sleeve's line to the shoulder
      F(snx + 26, 420, 0.12, {k: 0.55, u: 0.3}),
      F(snx + 14, sny + 50, 0, {k: 0.9}),
      F(snx - 6, sny - 4, 0, {k: 1.1}),
      F(nb[0] + 32, nb[1] - 4, 0),
      F(nb[0] + 16, nb[1] - 18, 0, {c: true}),
      // the V of the open neck
      F(nb[0] - 4, nb[1] + 46, 0, {c: true}),
    ];
    const d = outline(flowNodes(ns, cx));
    // planes: the far panel (facing the key) lit; the near side, turned away, in shade, split by long straight edges
    const vB: V2 = [nb[0] - 4, nb[1] + 46];
    const notch: V2 = [nb[0] - 26, hem - 4];
    const farPanel = poly([[nb[0] - 400, nb[1] - 60], [nb[0] - 19, nb[1] - 60], [nb[0] - 19, nb[1] - 6], vB, notch, [notch[0] - 6, hem + 200], [nb[0] - 400, hem + 200]]);
    const side = poly([[snx - 22, sny + 6], [snx + 300, sny - 60], [snx + 500, hem + 300], [snx + 34, hem + 40]]);
    const arm = sleevePlane([snx - 4, sny + 14], [snx + 14, 612], 44, 34);
    return {d, hem, planes: [{d: farPanel, tone: 'lit'}, {d: side, tone: 'shade'}, ...arm.planes], hand: arm.hand};
  }
  if (J.view === 'p') {
    // profile facing left, walking into the headwind: the front one straight run from the chest pressed onto the
    // leading leg; the back one straight run from the shoulder blade out to the tail, which trails the stride (the
    // knees a moment ago) and lifts in the air
    const lead = smin(J.kneeN[0], J.kneeF[0], 22);
    const trail = J.lag ? J.lag.trail : smax(J.kneeN[0], J.kneeF[0], 22);
    const frontX = lead - 24;
    const backX = smax(64, trail + 44, 18);
    const lift = J.lag ? J.lag.lift : 0;
    const ns: FN[] = [
      F(nb[0] - 17, nb[1] - 6, 0, {c: true}),
      F(nb[0] - 38, nb[1] + 36, 0, {k: 1.1}),
      F(nb[0] - 48, 330, 0, {k: 0.7}),
      F(nb[0] - 46, 500, 0.04, {k: 0.7, u: 0}),
      // pressed onto the leading leg: just in front of its knee, then its shin
      F(lead - 26, 742, 0.1, {k: 0.8, u: 0.02}),
      F(frontX, hem + 18, 0.28, {c: true, u: 0.06, ph: 0.2}),
      F(frontX + 44, hem - 4, 0.34, {c: true, u: 0.2, ph: 0.3}),
      F(backX + 56 * fl, hem - 6, 0.72, {c: true, u: 0.52, ph: 0.4, amp: 6}),
      F(backX + 2 * fl, hem - 42, 0.55, {c: true, u: 0.62, ph: 0.4}),
      F(backX + 150 * fl, hem - 66 - lift, 1, {c: true, u: 1, ph: 0.5, amp: 8}),
      F(nb[0] + 72, 430, 0.12, {k: 0.6, u: 0.3}),
      F(nb[0] + 48, nb[1] + 44, 0, {k: 1.1}),
      F(nb[0] + 26, nb[1] - 6, 0),
      F(nb[0] + 18, nb[1] - 22, 0, {c: true}),
    ];
    const d = outline(flowNodes(ns, cx));
    // the back half turned from the key: one straight plane edge from the shoulder down
    const a: V2 = [nb[0] + 4, nb[1] + 26];
    const b: V2 = [mixN(frontX, backX, 0.55), hem + 40];
    const shade = poly([a, [a[0] + 400, a[1] - 80], [b[0] + 500, b[1] + 200], b]);
    return {d, hem, planes: [{d: shade, tone: 'shade'}]};
  }
  // from behind: the upwind side hangs straight and close; the back panel runs out downwind from the waist into one
  // long lifted tail and a shorter second point (06's flag, gently); one plane edge where the upwind arm hangs
  const [lx, ly] = J.shF;
  const [rx, ry] = J.shN;
  const ns: FN[] = [
    F(nb[0] - 22, nb[1] - 20, 0, {c: true}),
    F(nb[0] - 46, nb[1] + 4, 0, {k: 1.05}),
    F(lx + 2, ly + 26, 0, {k: 1.1}),
    F(lx - 8, ly + 100, 0, {k: 0.9}),
    F(lx - 11, 560, 0.05, {k: 0.6, u: 0}),
    F(lx - 8, hem + 2, 0.22, {c: true, u: 0, ph: 0.2}),
    F(nb[0] - 30, hem + 30, 0.4, {c: true, u: 0.18, ph: 0.3}),
    F(nb[0] - 4, hem + 4, 0.38, {c: true, u: 0.3, ph: 0.3}),
    F(rx + 108 * fl, hem - 14, 0.72, {c: true, u: 0.52, ph: 0.4, amp: 6}),
    F(rx + 48 * fl, hem - 50, 0.55, {c: true, u: 0.62, ph: 0.4}),
    F(rx + 196 * fl, hem - 84, 1, {c: true, u: 1, ph: 0.5, amp: 8}),
    F(rx + 24, 420, 0.12, {k: 0.55, u: 0.3}),
    F(rx + 10, ry + 48, 0, {k: 0.9}),
    F(rx - 8, ry - 8, 0, {k: 1.1}),
    F(nb[0] + 44, nb[1] + 2, 0),
    F(nb[0] + 22, nb[1] - 20, 0, {c: true}),
    F(nb[0], nb[1] - 12, 0),
  ];
  const d = outline(flowNodes(ns, cx));
  const a: V2 = [nb[0] + 30, nb[1] + 30];
  const b: V2 = [nb[0] + 52, hem + 40];
  const shade = poly([a, [a[0] + 400, a[1] - 80], [b[0] + 600, b[1] + 200], b]);
  // where the upwind arm hangs: its plane, turned to the key, ends at mid-thigh in one straight edge
  const armEdgeTop: V2 = [lx + 40, ly + 50];
  const armEdgeBot: V2 = [lx + 26, 600];
  const armPlane = poly([[lx - 200, ly - 40], [lx + 30, ly - 40], armEdgeTop, armEdgeBot, [lx - 14, 668], [lx - 200, 668]]);
  return {d, hem, planes: [{d: shade, tone: 'shade'}, {d: armPlane, tone: 'lit', opacity: 0.55}]};
}
const mixN = (a: number, b: number, t: number) => a + (b - a) * t;

/** A sleeve plane hanging from the shoulder's roll to the wrist: one long straight band (its leading edge lit, its
 *  back edge in a soft shade, its end one straight cut), the hand tick placed where it ends. */
export function sleevePlane(top: V2, wr: V2, wTop: number, wEnd: number): {planes: Plane[]; hand: {wr: V2; dir: V2}} {
  const dir = norm(sub(wr, top));
  // toward screen-left of a hanging arm (x falls): the leading edge, facing the key
  const lv: V2 = [-dir[1], dir[0]];
  const at = (c: V2, w: number, side: number, along = 0): V2 => [c[0] + lv[0] * w * 0.5 * side + dir[0] * along, c[1] + lv[1] * w * 0.5 * side + dir[1] * along];
  const up = -60;
  const L0 = at(top, wTop, 1, up);
  const R0 = at(top, wTop, -1, up);
  // the end: one straight cut, a touch lower at the back
  const L1 = at(wr, wEnd, 1, -4);
  const R1 = at(wr, wEnd, -1, 4);
  const body = poly([L0, R0, R1, L1]);
  const litStrip = poly([L0, lerp(L0, R0, 0.2), lerp(L1, R1, 0.18), L1]);
  const backShade = poly([lerp(L0, R0, 0.78), R0, R1, lerp(L1, R1, 0.8)]);
  return {
    planes: [
      {d: body, tone: 'base', opacity: 1},
      {d: backShade, tone: 'shade', opacity: 0.55, blur: 3},
      {d: litStrip, tone: 'lit', opacity: 0.7},
    ],
    hand: {wr: lerp(L1, R1, 0.5), dir},
  };
}

export {add};
