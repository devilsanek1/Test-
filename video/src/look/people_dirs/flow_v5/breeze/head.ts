// FLOW v5, BREEZE: the head. Near-blank but appealing (OWNER_PLAYBOOK, "Faces, above all the profile"): the skin
// shape carries the contour (a small soft nose, the lips' rhythm, a clean chin and jaw), the light lies on it as one
// soft gradient, and ONE small open eye looks away from us (3/4 and profile, only where the head is big enough); from
// behind, the dark cap is the whole head. Drawn in HEAD UNITS (crown -0.5, chin +0.5, the face toward screen-left) and
// mapped onto the figure by the head's frame. Women: a finer jaw, a smaller nose, a lash flick; men: a squarer jaw, a
// straighter brow, a slightly larger nose, a thicker neck.
import {add, mul, rot, outline, S, type V2, type Nd} from './v';
import type {Part} from './render';
import {soft, type Skin} from './paint';

export type View = 'q' | 'p' | 'b';
export type Sex = 'f' | 'm';
/** The head's frame on the figure: its centre, its height (crown to chin, figure units), its tilt (degrees). */
export type HF = {c: V2; h: number; tilt: number; view: View};
export const toFig = (hf: HF) => (u: V2): V2 => add(hf.c, rot(mul(u, hf.h), [0, 0], hf.tilt));
const mapNodes = (hf: HF, ns: Nd[]): Nd[] => ns.map((n) => ({...n, p: toFig(hf)(n.p)}));

// ---------------------------------------------------------------- the skin outlines (head units)
function skinNodes(view: View, sex: Sex): Nd[] {
  const m = sex === 'm';
  if (view === 'q') {
    // 3/4 facing left: the far contour carries the brow, a peek of the nose and the chin; the features sit a little low
    // on the head (a slightly bigger cranium: appeal without a child's face)
    return [
      S(0.04, -0.5),
      S(-0.22, -0.44),
      S(-0.345, -0.24),
      S(m ? -0.372 : -0.362, -0.04),
      S(-0.346, 0.06, 0.8),
      S(-0.36, 0.13, 0.7),
      S(m ? -0.418 : -0.402, 0.19, 0.5),
      S(-0.356, 0.24, 0.6),
      S(m ? -0.335 : -0.322, 0.32),
      S(m ? -0.3 : -0.262, 0.43),
      S(m ? -0.21 : -0.18, 0.5, 0.9),
      S(m ? -0.02 : -0.06, m ? 0.47 : 0.46),
      S(m ? 0.18 : 0.15, m ? 0.33 : 0.31),
      S(0.3, 0.14),
      S(0.43, -0.08),
      S(0.36, -0.37),
    ];
  }
  if (view === 'p') {
    // the profile facing left: forehead, brow, a small soft nose, the lips, a clean chin, the jaw back to the neck
    const nx = m ? -0.505 : -0.488;
    return [
      S(0.0, -0.5),
      S(-0.24, -0.44),
      S(-0.37, -0.22),
      S(m ? -0.415 : -0.404, -0.02, 0.9),
      S(m ? -0.405 : -0.396, 0.05, 0.7),
      S(nx, 0.165, 0.45),
      S(-0.432, 0.207, 0.5),
      S(-0.426, 0.237, 0.6),
      S(m ? -0.436 : -0.442, 0.268, 0.5),
      S(-0.417, 0.294, 0.5),
      S(m ? -0.424 : -0.428, 0.322, 0.5),
      S(-0.398, 0.366, 0.6),
      S(m ? -0.415 : -0.402, m ? 0.435 : 0.44, 0.8),
      S(m ? -0.35 : -0.34, 0.497, 0.8),
      S(-0.16, m ? 0.485 : 0.472),
      S(m ? 0.08 : 0.06, m ? 0.4 : 0.39),
      S(0.2, 0.26),
      S(0.42, 0.05),
      S(0.42, -0.3),
    ];
  }
  // from behind: the skull and the jaw seen from the back (the cap covers nearly all)
  return [S(0, -0.5), S(-0.36, -0.3), S(-0.4, 0.02), S(-0.3, 0.3), S(-0.12, 0.44), S(0.12, 0.44), S(0.3, 0.3), S(0.4, 0.02), S(0.36, -0.3)];
}

/** The neck: from under the jaw down to the collar (figure units), a slim column; it leans with the head. */
export function neckPart(hf: HF, base: V2, w: number, sk: Skin, view: View): Part {
  const T = toFig(hf);
  // the top joins the skull behind the jaw (hidden under the head), the base runs under the collar
  const topF: V2 = view === 'p' ? T([-0.22, 0.36]) : view === 'q' ? T([-0.12, 0.36]) : T([-0.18, 0.2]);
  const topB: V2 = view === 'p' ? T([0.22, 0.2]) : view === 'q' ? T([0.2, 0.22]) : T([0.18, 0.2]);
  const hw = w / 2;
  const lean = view === 'p' ? 6 : 0;
  const ns: Nd[] = [
    {p: topF},
    {p: [base[0] - hw - lean, base[1] - 0.45 * (base[1] - topF[1])]},
    {p: [base[0] - hw * 1.3 - lean, base[1] + 70], c: true},
    {p: [base[0] + hw * 1.3 + lean, base[1] + 70], c: true},
    {p: [base[0] + hw + lean * 0.5, base[1] - 0.45 * (base[1] - topB[1])]},
    {p: topB},
  ];
  return {
    name: 'neck',
    d: outline(ns),
    // the neck sits in the head's shade: darker under the jaw, lighter toward the collar's light
    fill: {lin: [T([0, 0.42]), [base[0], base[1] + 10]], stops: [[0, sk.shade], [1, sk.base]]},
    z: 17,
  };
}

export type FaceOpts = {
  /** the head's size on screen (px, crown to chin): marks only where they read */
  px: number;
  /** the eye looks this way: -1 screen-left (default) */
  look?: number;
  /** a closed, downcast eye (a serene beat) */
  closed?: boolean;
  /** draw a soft brow */
  brow?: boolean;
};

/** The head's skin and its marks. */
export function headParts(hf: HF, sex: Sex, sk: Skin, hairDeep: string, o: FaceOpts): Part[] {
  const T = toFig(hf);
  const out: Part[] = [];
  const ns = mapNodes(hf, skinNodes(hf.view, sex));
  // one soft gradient toward the key (upper left); the far side of the 3/4 face and the profile's front are the lit side
  const fill = soft(T([-0.45, -0.35]), T([0.4, 0.45]), sk.lit, sk.base);
  const regions = [] as NonNullable<Part['regions']>;
  if (hf.view !== 'b' && o.px >= 16) {
    // the cheek's warmth
    const cc = hf.view === 'q' ? T([-0.16, 0.2]) : T([-0.2, 0.2]);
    regions.push({d: ellipseD(cc, 0.11 * hf.h, 0.07 * hf.h), fill: {rad: {c: cc, r: 0.11 * hf.h}, stops: [[0, sk.blush, sex === 'f' ? 0.5 : 0.18], [1, sk.blush, 0]]}});
    // the side of the face turned from the key: a soft shade toward the jaw and the back
    const sd = hf.view === 'q' ? T([0.2, 0.22]) : T([0.12, 0.3]);
    regions.push({d: ellipseD(sd, 0.26 * hf.h, 0.22 * hf.h), fill: {rad: {c: sd, r: 0.26 * hf.h}, stops: [[0, sk.shade, 0.75], [1, sk.shade, 0]]}});
  }
  out.push({name: 'skin', d: outline(ns), fill, z: 30, regions});
  if (hf.view === 'b') return out;
  // the eye: one small open eye looking away (screen-left): the dark iris toward the look, the upper lid's lash over
  // it ending in a small flick, a sliver of the eye's white behind the iris where the head is big enough
  if (o.px >= 11) {
    const q = hf.view === 'q';
    const ec = T(q ? [-0.15, 0.06] : [-0.3, 0.06]);
    const sc = hf.h;
    const ang = (q ? -4 : -2) + hf.tilt;
    const P = (x: number, y: number): V2 => add(ec, rot([x * sc, y * sc], [0, 0], ang));
    const look = o.look ?? -1;
    const f = sex === 'f';
    if (o.closed) {
      out.push({name: 'eye', d: outline([{p: P(-0.06, 0.0), c: true}, {p: P(0, 0.03)}, {p: P(0.07, -0.004), c: true}, {p: P(0, 0.014)}]), fill: hairDeep, z: 31});
    } else if (o.px < 18) {
      // tiny: one dark mark
      out.push({name: 'eye', d: ellipseD(P(-0.01, 0.0), 0.034 * sc, 0.04 * sc), fill: hairDeep, z: 31});
    } else {
      const ew = q ? 0.066 : 0.048;
      if (o.px >= 34) {
        // the white: a small almond, the iris over its look-side end
        out.push({name: 'eyeWhite', d: outline([{p: P(-ew, 0.004), c: true}, {p: P(-ew * 0.2, -0.026)}, {p: P(ew, -0.012), c: true}, {p: P(ew * 0.1, 0.026)}]), fill: sk.lit, z: 30.8, opacity: 0.92});
      }
      const ix = look * ew * 0.36;
      out.push({name: 'iris', d: ellipseD(P(ix, 0.004), (q ? 0.03 : 0.024) * sc, 0.034 * sc), fill: hairDeep, z: 31});
      // the lash: a tapered arc over the eye, thickest past its middle, the outer end flicked up
      const lw = (f ? 0.017 : 0.014) * sc;
      const a0 = P(-ew * 1.08, 0.006);
      const a1 = P(-ew * 0.15, -0.03);
      const a2 = P(ew * 0.82, -0.02);
      const a3 = f ? P(ew * 1.34, -0.05) : P(ew * 1.02, -0.012);
      out.push({
        name: 'lash',
        d: outline([
          {p: a0, c: true},
          {p: [a1[0], a1[1] - lw * 0.5]},
          {p: [a2[0], a2[1] - lw * 0.62]},
          {p: a3, c: true},
          {p: [a2[0], a2[1] + lw * 0.45]},
          {p: [a1[0], a1[1] + lw * 0.42]},
        ]),
        fill: hairDeep,
        z: 31.1,
      });
    }
    if (o.brow !== false && o.px >= 26) {
      const b0 = hf.view === 'q' ? T([-0.25, -0.045]) : T([-0.37, -0.045]);
      const b1 = hf.view === 'q' ? T([-0.06, sex === 'f' ? -0.07 : -0.055]) : T([-0.22, sex === 'f' ? -0.072 : -0.06]);
      const bw = (sex === 'f' ? 0.022 : 0.034) * hf.h;
      const mdl: V2 = [(b0[0] + b1[0]) / 2, (b0[1] + b1[1]) / 2 - 0.02 * hf.h];
      out.push({
        name: 'brow',
        d: outline([{p: [b0[0], b0[1] + bw * 0.5], c: true}, {p: [mdl[0], mdl[1] + bw * 0.5]}, {p: b1, c: true}, {p: [mdl[0], mdl[1] - bw * 0.6]}, {p: [b0[0], b0[1] - bw * 0.5], c: true}]),
        fill: hairDeep,
        opacity: 0.62,
        z: 31,
      });
    }
  }
  return out;
}

export function ellipseD(c: V2, rx: number, ry: number): string {
  const k = 0.5523;
  const f = (v: number) => (Math.round(v * 100) / 100).toString();
  const [x, y] = c;
  return `M${f(x + rx)} ${f(y)}C${f(x + rx)} ${f(y + ry * k)} ${f(x + rx * k)} ${f(y + ry)} ${f(x)} ${f(y + ry)}C${f(x - rx * k)} ${f(y + ry)} ${f(x - rx)} ${f(y + ry * k)} ${f(x - rx)} ${f(y)}C${f(x - rx)} ${f(y - ry * k)} ${f(x - rx * k)} ${f(y - ry)} ${f(x)} ${f(y - ry)}C${f(x + rx * k)} ${f(y - ry)} ${f(x + rx)} ${f(y - ry * k)} ${f(x + rx)} ${f(y)}Z`;
}
