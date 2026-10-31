// FLOW v5, BREEZE: the cast's clothes, today's clothes translated into the flow grammar. Two simple fluid masses at
// most (a top and a bottom), each ONE shape of long straight runs ending in a few points that lean downwind; no seams,
// cuffs, pockets, buttons or stacks. Wide trousers are one straight wide panel per leg (only the downwind corner swept,
// never a flare) in a deep shade of the person's own colour; a skirt is a bell; a shirt hangs from dropped shoulders,
// long enough to be the bigger shape, and lifts at its loose side; an open overcoat shows its dark column inside.
// Authored for a wind to the right in the breeze (W0); flow.ts moves the free nodes. Each garment is drawn only in the
// views it is used in.
import {outline, poly, lerp, add, smin, smax, type V2} from './v';
import {F, flowNodes, type FN, type FlowCtx} from './flow';
import type {Joints} from './body';
import type {Shape} from './garments';

const ol = (ns: FN[], cx: FlowCtx) => outline(flowNodes(ns, cx));
const none: Shape['planes'] = [];

// ---------------------------------------------------------------- wide trousers: one straight panel per leg
/** Wide-leg trousers from a high waist: each leg ONE straight wide panel hanging from the hip to a hem that just shows
 *  the shoe, never a flare; only each leg's downwind corner is swept, a small point the breeze lifts. In the person's
 *  own colour, a deep shade of it (cast.ts). Returns [far leg, near leg]. */
export function wideTrousers(J: Joints, cx: FlowCtx, o: {waist: number; hemW: number; hem?: number}): Shape[] {
  const w = o.waist;
  const hem = o.hem ?? 978;
  const hw = o.hemW;
  if (J.view === 'p') {
    // profile: each leg a straight panel along the leg's line, its front edge clean, its back (downwind) corner swept
    const leg = (hip: V2, ankle: V2, k: number): Shape => {
      const top = w + 6;
      const half = hw * 0.48;
      const ns: FN[] = [
        F(hip[0] - half, top, 0, {c: true}),
        F(ankle[0] - half - 2, hem + 2, 0.12, {c: true, u: 0, ph: 0.4 + k}),
        F(ankle[0] + half * 0.3, hem - 2, 0.3, {c: true, u: 0.5, ph: 0.7 + k}),
        F(ankle[0] + half + 24, hem - 14, 0.75, {c: true, u: 1, ph: 1.1 + k, amp: 6}),
        F(ankle[0] + half + 2, hem - 58, 0.2, {c: true, u: 0.7, ph: 1.0 + k}),
        F(hip[0] + half + 4, top, 0, {c: true}),
      ];
      return {d: ol(ns, cx), hem, planes: none};
    };
    return [leg(J.hipF, J.ankleF, 0), leg(J.hipN, J.ankleN, 0.6)];
  }
  // 3/4 and from behind: each leg one straight band from the hip to its ankle, as wide at the hem as at the hip; the
  // inner edges meet at the crotch; each leg's downwind (right) corner is the swept point, the near one the larger
  const cxw = (J.hipF[0] + J.hipN[0]) / 2;
  const half = hw * 0.5;
  const fo = J.hipF[0] - 44 - J.ankleF[0];
  const no = J.hipN[0] + 44 - J.ankleN[0];
  const far: FN[] = [
    F(J.hipF[0] - 44, w, 0, {c: true}),
    F(cxw + 4, w, 0, {c: true}),
    F(cxw + 2, 562, 0, {c: true}),
    F(J.ankleF[0] + half + 12, hem - 10, 0.45, {c: true, u: 1, ph: 0.6, amp: 5}),
    F(J.ankleF[0] + 2, hem + 2, 0.2, {c: true, u: 0.5, ph: 0.5}),
    F(J.ankleF[0] + Math.min(fo, -half) - 2, hem + 6, 0.08, {c: true, u: 0, ph: 0.3}),
  ];
  const near: FN[] = [
    F(cxw - 6, w, 0, {c: true}),
    F(J.hipN[0] + 44, w, 0, {c: true}),
    F(J.ankleN[0] + Math.max(no, half), hem - 58, 0.2, {c: true, u: 0.7, ph: 1.1}),
    F(J.ankleN[0] + Math.max(no, half) + 24, hem - 16, 0.75, {c: true, u: 1, ph: 1.2, amp: 6}),
    F(J.ankleN[0] + 6, hem + 2, 0.3, {c: true, u: 0.5, ph: 1.0}),
    F(J.ankleN[0] - half + 2, hem + 8, 0.12, {c: true, u: 0, ph: 0.8}),
    F(cxw - 4, 568, 0, {c: true}),
  ];
  // the inner, turned-away side of each leg in shade: one long straight plane each
  const farShade = poly([[cxw - 28, w], [cxw + 400, w], [cxw + 400, hem + 200], [J.ankleF[0] + 8, hem + 200]]);
  const nearShade = poly([[J.hipN[0] + 14, w + 40], [J.hipN[0] + 400, w], [J.hipN[0] + 400, hem + 200], [J.ankleN[0] + half * 0.3, hem + 200]]);
  return [
    {d: ol(far, cx), hem, planes: [{d: farShade, tone: 'shade', opacity: 0.55}]},
    {d: ol(near, cx), hem, planes: [{d: nearShade, tone: 'shade', opacity: 0.7}]},
  ];
}

// ---------------------------------------------------------------- the big shirt, half-tucked (3/4)
/** An oversized shirt from dropped shoulders, long enough to be the bigger shape: only its centre front tucked into
 *  the high waist, its upwind side pressed close, its loose near side lifting into a point swept downwind; an open
 *  collar's small V. */
export function bigShirt(J: Joints, cx: FlowCtx, o: {waist: number}): Shape {
  const nb = J.neckBase;
  const [sfx, sfy] = J.shF;
  const [snx, sny] = J.shN;
  const w = o.waist;
  const ns: FN[] = [
    F(nb[0] - 18, nb[1] - 4, 0, {c: true}),
    F(nb[0] - 42, nb[1] + 8, 0),
    F(sfx + 4, sfy - 4, 0, {k: 1.2}),
    F(sfx - 12, sfy + 40, 0, {k: 0.9}),
    F(sfx - 16, w - 40, 0.06, {u: 0}),
    F(sfx - 10, w + 112, 0.35, {c: true, u: 0.08, ph: 0.3}),
    // the hem rises to the short tuck at the centre front, then falls to the loose near side and its swept point
    F(sfx + 36, w + 80, 0.3, {c: true, u: 0.22, ph: 0.6}),
    F(nb[0] - 18, w + 16, 0, {c: true}),
    F(nb[0] + 26, w + 18, 0, {c: true}),
    F(snx - 8, w + 110, 0.45, {c: true, u: 0.55, ph: 1.1}),
    F(snx + 12, w + 84, 0.4, {c: true, u: 0.66, ph: 1.2}),
    F(snx + 90, w + 70, 0.85, {c: true, u: 1, ph: 1.6, amp: 7}),
    F(snx + 30, w - 50, 0.2, {k: 0.6, u: 0.4}),
    F(snx + 10, sny + 40, 0, {k: 0.9}),
    F(snx - 4, sny - 6, 0, {k: 1.2}),
    F(nb[0] + 30, nb[1] - 2, 0),
    F(nb[0] + 14, nb[1] - 12, 0, {c: true}),
    F(nb[0] - 4, nb[1] + 52, 0, {c: true}),
  ];
  const side = poly([[snx - 26, sny + 10], [snx + 300, sny - 60], [snx + 400, w + 300], [snx - 4, w + 200]]);
  const tuck = poly([[nb[0] - 34, w - 30], [nb[0] + 42, w - 28], [nb[0] + 32, w + 20], [nb[0] - 24, w + 18]]);
  return {d: ol(ns, cx), hem: w + 100, planes: [{d: side, tone: 'shade'}, {d: tuck, tone: 'shade', opacity: 0.35, blur: 10}]};
}

// ---------------------------------------------------------------- the cropped knit and the long bias skirt (from behind)
/** A cropped knit seen from behind: a boxy body to the waist, the sleeves hanging beside it to the wrists. */
export function croppedKnit(J: Joints, cx: FlowCtx, o: {hem: number; cuff: number}): Shape {
  const nb = J.neckBase;
  const [lx, ly] = J.shF;
  const [rx, ry] = J.shN;
  const h = o.hem;
  const cf = o.cuff;
  const ns: FN[] = [
    F(nb[0] - 26, nb[1] - 6, 0, {c: true}),
    F(nb[0] - 50, nb[1] + 6, 0),
    F(lx + 4, ly - 4, 0, {k: 1.2}),
    F(lx - 12, ly + 50, 0, {k: 0.9}),
    F(lx - 12, cf - 6, 0.15, {c: true, u: 0}),
    F(lx + 28, cf + 8, 0.3, {c: true, u: 0.3, ph: 0.4, amp: 6}),
    F(lx + 26, ly + 96, 0, {c: true}),
    F(lx + 30, h, 0.15, {c: true, u: 0.2}),
    F(nb[0] + 4, h + 10, 0.25, {u: 0.45}),
    F(rx - 20, h + 2, 0.35, {c: true, u: 0.6}),
    F(rx - 24, ry + 96, 0, {c: true}),
    F(rx - 14, cf + 6, 0.25, {c: true, u: 0.7}),
    F(rx + 36, cf - 4, 0.55, {c: true, u: 1, ph: 0.8, amp: 7}),
    F(rx + 16, ry + 50, 0.05, {k: 0.9}),
    F(rx - 4, ry - 4, 0, {k: 1.2}),
    F(nb[0] + 50, nb[1] + 6, 0),
    F(nb[0] + 26, nb[1] - 6, 0, {c: true}),
    F(nb[0], nb[1] + 2, 0),
  ];
  const shade = poly([[nb[0] + 30, nb[1] + 20], [rx + 300, ry - 60], [rx + 300, cf + 100], [nb[0] + 40, h + 40]]);
  return {d: ol(ns, cx), hem: h, planes: [{d: shade, tone: 'shade', opacity: 0.8}]};
}
/** A long bias skirt: a bell from a narrow waist to mid-calf, its upwind side close to the legs, its downwind side
 *  catching the breeze, the hem a few points leaning downwind. */
export function biasSkirt(J: Joints, cx: FlowCtx, o: {waist: number; hem: number; w: number}): Shape {
  const x0 = (J.hipF[0] + J.hipN[0]) / 2;
  const w = o.waist;
  const hem = o.hem;
  const hw = o.w;
  const ns: FN[] = [
    F(x0 - 58, w, 0, {c: true}),
    F(x0 + 58, w, 0, {c: true}),
    F(x0 + 74, w + 80, 0.1, {k: 0.8}),
    F(x0 + hw * 0.5, hem - 150, 0.4, {k: 0.5, u: 0.8, ph: 1.4}),
    F(x0 + hw * 0.74, hem - 42, 1, {c: true, u: 1, ph: 1.9, amp: 7}),
    F(x0 + hw * 0.32, hem - 6, 0.6, {c: true, u: 0.72, ph: 1.5}),
    F(x0 + hw * 0.08, hem + 26, 0.65, {c: true, u: 0.56, ph: 1.2}),
    F(x0 - hw * 0.04, hem - 4, 0.5, {c: true, u: 0.42, ph: 1.0}),
    F(x0 - hw * 0.26, hem + 22, 0.55, {c: true, u: 0.24, ph: 0.7}),
    F(x0 - hw * 0.46, hem - 6, 0.45, {c: true, u: 0.06, ph: 0.4}),
    F(x0 - hw * 0.36, hem - 200, 0.15, {k: 0.6, u: 0}),
    F(x0 - 70, w + 80, 0, {k: 0.8}),
  ];
  const shade = poly([[x0 + 18, w], [x0 + 400, w - 40], [x0 + 500, hem + 200], [x0 + hw * 0.16, hem + 200]]);
  return {d: ol(ns, cx), hem, planes: [{d: shade, tone: 'shade', opacity: 0.85}]};
}

// ---------------------------------------------------------------- the overcoat open over a dark column (profile walk)
/** A long overcoat as a column flaring a little; walking into the headwind its front blows open behind the chest so
 *  the dark column (knit and trousers) leads; the back tail lifts. Returns [the dark column, the coat]. */
export function overcoat(J: Joints, cx: FlowCtx, o: {hem: number}): Shape[] {
  const nb = J.neckBase;
  const hem = o.hem;
  const lead = smin(J.kneeN[0], J.kneeF[0], 22);
  const trail = smax(J.kneeN[0], J.kneeF[0], 22);
  const hipY = J.hipF[1];
  // the dark column: the chest's front from the neck to the hips (the trousers continue as the legs)
  const col: FN[] = [
    F(nb[0] - 22, nb[1] - 6, 0, {c: true}),
    F(nb[0] - 40, nb[1] + 40, 0, {k: 1.1}),
    F(nb[0] - 48, 330, 0),
    F(nb[0] - 44, hipY + 20, 0),
    F(nb[0] - 30, hipY + 70, 0, {c: true}),
    F(nb[0] + 20, hipY + 70, 0, {c: true}),
    F(nb[0] + 20, nb[1] - 6, 0, {c: true}),
  ];
  const frontX = smin(-40, lead - 6, 18);
  // the back follows the trailing knee a moment ago: the tail trails the stride and swings after it
  const backX = smax(70, (J.lag ? J.lag.trail : trail) + 50, 18);
  const lift = J.lag ? J.lag.lift : 0;
  const coat: FN[] = [
    F(nb[0] - 10, nb[1] - 10, 0, {c: true}),
    F(nb[0] - 24, nb[1] + 30, 0, {k: 0.9}),
    F(nb[0] - 30, 330, 0.1, {k: 0.7, u: 0}),
    F(frontX + 10, hem + 6, 0.45, {c: true, u: 0.05, ph: 0.6}),
    F(lerp([frontX, 0], [backX, 0], 0.4)[0], hem - 12, 0.45, {c: true, u: 0.25, ph: 0.8}),
    F(lerp([frontX, 0], [backX, 0], 0.62)[0] + 6, hem + 18, 0.65, {c: true, u: 0.5, ph: 1.2, amp: 6}),
    F(lerp([frontX, 0], [backX, 0], 0.62)[0] + 14, hem - 18, 0.6, {c: true, u: 0.6, ph: 1.3}),
    F(backX + 104, hem - 52 - lift, 1, {c: true, u: 1, ph: 2.0, amp: 8}),
    F(nb[0] + 70, 400, 0.15, {k: 0.6, u: 0.35}),
    F(nb[0] + 52, nb[1] + 44, 0, {k: 1.1}),
    F(nb[0] + 34, nb[1] - 4, 0),
    F(nb[0] + 22, nb[1] - 22, 0, {c: true}),
  ];
  const a: V2 = [nb[0] + 10, nb[1] + 26];
  const b: V2 = [lerp([frontX, 0], [backX, 0], 0.5)[0] + 6, hem + 40];
  const shade = poly([a, [a[0] + 400, a[1] - 80], [b[0] + 400, b[1] + 200], b]);
  return [
    {d: ol(col, cx), hem: hipY + 70, planes: none},
    {d: ol(coat, cx), hem, planes: [{d: shade, tone: 'shade'}]},
  ];
}

// ---------------------------------------------------------------- the big short-sleeved shirt (3/4)
/** An oversized short-sleeved shirt worn loose, ONE shape: dropped shoulders, the upwind side hanging straight, the
 *  sleeves' ends and the hem in points swept downwind, the near side lifting into the longest; an open collar's small
 *  V. */
export function shortShirt(J: Joints, cx: FlowCtx, o: {hem: number}): Shape {
  const nb = J.neckBase;
  const [sfx, sfy] = J.shF;
  const [snx, sny] = J.shN;
  const h = o.hem;
  const ns: FN[] = [
    F(nb[0] - 20, nb[1] - 2, 0, {c: true}),
    F(nb[0] - 46, nb[1] + 8, 0),
    F(sfx + 6, sfy - 4, 0, {k: 1.2}),
    // the far short sleeve: pressed on its upwind side, its end leaning downwind
    F(sfx - 18, sfy + 40, 0, {k: 0.9}),
    F(sfx - 18, sfy + 106, 0.2, {c: true, u: 0.05, ph: 0.2}),
    F(sfx + 18, sfy + 120, 0.45, {c: true, u: 0.3, ph: 0.4, amp: 6}),
    F(sfx + 10, sfy + 142, 0, {k: 0.8}),
    // the far side hangs straight to the hem
    F(sfx + 4, h - 12, 0.25, {c: true, u: 0, ph: 0.5}),
    // the hem: a few points leaning downwind, the near side's the longest
    F(nb[0] - 26, h + 16, 0.45, {c: true, u: 0.25, ph: 0.8}),
    F(nb[0] + 10, h - 6, 0.4, {c: true, u: 0.4, ph: 0.9}),
    F(snx + 4, h + 12, 0.6, {c: true, u: 0.65, ph: 1.2, amp: 6}),
    F(snx + 14, h - 14, 0.55, {c: true, u: 0.75, ph: 1.3}),
    F(snx + 72, h - 26, 0.9, {c: true, u: 1, ph: 1.6, amp: 7}),
    F(snx + 30, sny + 152, 0.2, {k: 0.7, u: 0.5}),
    // the near sleeve, its end a point swept downwind
    F(snx + 66, sny + 96, 0.6, {c: true, u: 0.85, ph: 1.6, amp: 7}),
    F(snx + 20, sny + 46, 0, {k: 0.9}),
    F(snx - 4, sny - 4, 0, {k: 1.2}),
    F(nb[0] + 30, nb[1] - 2, 0),
    F(nb[0] + 14, nb[1] - 12, 0, {c: true}),
    // the open collar's small V
    F(nb[0] - 4, nb[1] + 50, 0, {c: true}),
  ];
  const side = poly([[snx - 20, sny + 6], [snx + 300, sny - 60], [snx + 400, h + 300], [snx - 4, h + 100]]);
  const farPanel = poly([[nb[0] - 400, nb[1] - 60], [nb[0] - 20, nb[1] - 60], [nb[0] - 4, nb[1] + 50], [nb[0] - 16, h + 200], [nb[0] - 400, h + 200]]);
  return {d: ol(ns, cx), hem: h, planes: [{d: farPanel, tone: 'lit', opacity: 0.4}, {d: side, tone: 'shade'}]};
}

// ---------------------------------------------------------------- the short boxy jacket (profile, standing)
/** A short boxy chore jacket in profile: straight runs from the shoulder to a hem at the hip, a small stand collar at
 *  the back of the neck, the back hem's point lifting downwind; the hands in its pockets (the arms inside). */
export function boxyJacket(J: Joints, cx: FlowCtx, o: {hem: number}): Shape {
  const nb = J.neckBase;
  const h = o.hem;
  const ns: FN[] = [
    F(nb[0] - 20, nb[1] - 4, 0, {c: true}),
    F(nb[0] - 44, nb[1] + 30, 0, {k: 1.1}),
    F(nb[0] - 56, 330, 0, {k: 0.8}),
    F(nb[0] - 56, h + 6, 0.25, {c: true, u: 0, ph: 0.4}),
    F(nb[0] + 4, h - 8, 0.3, {c: true, u: 0.3, ph: 0.7}),
    F(nb[0] + 52, h + 16, 0.55, {c: true, u: 0.55, ph: 1.0, amp: 6}),
    F(nb[0] + 128, h - 34, 0.95, {c: true, u: 1, ph: 1.4, amp: 7}),
    F(nb[0] + 74, 330, 0.12, {k: 0.7, u: 0.4}),
    F(nb[0] + 56, nb[1] + 40, 0, {k: 1.1}),
    F(nb[0] + 36, nb[1] - 4, 0),
    F(nb[0] + 24, nb[1] - 24, 0, {c: true}),
  ];
  const a: V2 = [nb[0] + 12, nb[1] + 20];
  const b: V2 = [nb[0] + 24, h + 40];
  const shade = poly([a, [a[0] + 400, a[1] - 80], [b[0] + 400, b[1] + 200], b]);
  return {d: ol(ns, cx), hem: h, planes: [{d: shade, tone: 'shade'}]};
}

export {add};
