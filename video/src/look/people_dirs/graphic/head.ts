// MODERN GRAPHIC people: the head, the neck and THE MARK.
// The face is generic by design: a well-built egg (a round cranium against a straight jaw), a long neck, and ONE mark:
// the nose. In 3/4 it is a crisp wedge on the side of the nose away from the key (the "loop" shadow), ending in a
// small foot under the tip; in profile it is the nose in the silhouette plus the same shade under its wing; from behind
// there is none. No eyes, brows or mouth are ever drawn: the hair, the head's angle and the light carry the person.
// Head units: u = the skull's height (crown to chin); origin at the skull's centre; y down; the crown at y -0.5.
import {V2, V3, RV, rpath, rot, rad, add, mul, poly, clamp} from './geo';
import {Cam, proj, toCam, tube} from './rig';
import type {Skel} from './body';
import type {Tone} from './color';
import type {Part} from './part';

export type HeadFrame = {
  c: V2;
  s: number;
  rot: number;
  /** the head's yaw relative to the camera (-90 = profile facing screen-left, 180 = back) */
  yaw: number;
  /** head units -> figure-local screen */
  P: (u: V2) => V2;
  /** many points */
  PP: (us: V2[]) => V2[];
  /** an RV list (radii in head units) -> path */
  R: (pts: RV[], closed?: boolean) => string;
};

export function headFrame(sk: Skel, c: Cam): HeadFrame {
  const yaw = wrap(c.yaw + sk.head.yaw);
  const cs = Math.cos(rad(yaw));
  const sn = Math.sin(rad(yaw));
  const r = sk.head.roll * cs + sk.head.pitch * -sn + 0;
  const ctr = proj(sk.head.c, c);
  const s = sk.b.skull;
  const P = (u: V2): V2 => add(ctr, rot(mul(u, s), [0, 0], r));
  return {
    c: ctr,
    s,
    rot: r,
    yaw,
    P,
    PP: (us) => us.map(P),
    R: (pts, closed = true) => rpath(pts.map(([x, y, rr]) => [...P([x, y]), (rr ?? 0) * s] as RV), closed),
  };
}
export const wrap = (a: number) => ((((a + 180) % 360) + 360) % 360) - 180;

/** Head shapes for one build. `jaw` widens the jaw angle (men 1, women 0), `nose` lengthens the nose. */
type Face = {jaw: number; nose: number; chin: number};
const faceOf = (sk: Skel): Face => (sk.b.sex === 'm' ? {jaw: 1, nose: 1, chin: 1} : {jaw: 0, nose: 0, chin: 0});

/** The 3/4 head facing screen-left (yaw -25..-55): the skull, the far cheek's contour, the jaw; and the mark. */
function head34(f: Face, yaw: number): {skin: RV[]; mark: RV[]; faceX: number; jawAngle: V2; chin: V2; nape: V2; earC: V2} {
  // how far the face line sits left of the skull's centre: 0.47 * sin(|yaw|)
  const t = Math.sin(rad(-yaw));
  const fx = -0.47 * t; // the face's centre line
  const sil = Math.sqrt(Math.pow(0.38 * Math.cos(rad(yaw)), 2) + Math.pow(0.47 * t, 2)); // far silhouette half-width
  const k = f.jaw;
  const jw = 0.27 + 0.04 * k; // near jaw angle x
  const jy = 0.31 + 0.02 * k;
  const chinW = 0.07 + 0.03 * f.chin;
  // the nose: the ridge from between the brows (fx, -0.06) to the tip, which just breaks the far contour
  const nl = 0.155 + 0.02 * f.nose; // projection of the nose
  const tipX = fx - nl * t - 0.005;
  const tipY = 0.185 + 0.01 * f.nose;
  const skin: RV[] = [
    [0.02, -0.5, 0.2],
    [0.33, -0.42, 0.16],
    [0.45, -0.17, 0.18],
    [0.44, 0.04, 0.12],
    [0.37, 0.2, 0.06],
    [jw, jy, 0.03 + 0.02 * k],
    // the jaw line: a straight from the angle to the chin (S1: the straight against the round skull)
    [fx + 0.22 + chinW * 0.5, 0.465, 0.05],
    [fx + 0.1, 0.49 + 0.01 * k, 0.05 + 0.02 * f.chin],
    [fx + 0.02 - 0.01 * k, 0.483 + 0.012 * k, 0.03],
    // the far contour, up: the chin, the lips just proud of the cheek, the nose breaking the contour, the cheekbone,
    // the eye socket's dip, the brow, the temple
    [fx - 0.026 - 0.025 * k, 0.435, 0.04],
    [fx - 0.03 - 0.012 * k, 0.398, 0.02],
    [fx - 0.062 + 0.008 * k, 0.354, 0.012],
    [fx - 0.055, 0.327, 0.005],
    [fx - 0.074 + 0.01 * k, 0.3, 0.012],
    [tipX + 0.036, tipY + 0.042, 0.01],
    [tipX, tipY, 0.012],
    [tipX + 0.02, tipY - 0.055, 0.006],
    [-sil + 0.025, 0.1, 0.02],
    [-sil + 0.01, 0.045, 0.04],
    [-sil + 0.035, -0.015, 0.03],
    [-sil + 0.02, -0.075, 0.04],
    [-sil + 0.025, -0.2, 0.12],
    [-sil + 0.12, -0.4, 0.14],
  ];
  // THE MARK, one crisp shape in the skin's shade: the shade under the near brow ridge (the socket's top, never an
  // eye) running into the nose's shaded side and ending in a foot under the tip: a "7" read as light, not as features
  const bw = 0.17 + 0.03 * k; // the brow arm's length
  const mark: RV[] = [
    [fx + 0.004, -0.058, 0.01],
    [fx + bw * 0.45, -0.07, 0.03],
    [fx + bw, -0.045, 0.02],
    [fx + bw + 0.02, -0.03, 0.0],
    [fx + bw * 0.6, -0.033, 0.03],
    [fx + 0.05, -0.022, 0.03],
    [fx + 0.026, 0.06, 0.03],
    [fx + 0.034, 0.17, 0.03],
    [fx + 0.036, tipY + 0.02, 0.02],
    [fx + 0.012, tipY + 0.052, 0.015],
    [tipX + 0.03, tipY + 0.045, 0.012],
    [tipX + 0.008, tipY + 0.028, 0.004],
    [tipX + 0.036, tipY + 0.02, 0.008],
    [fx - 0.018, tipY + 0.002, 0.02],
    [fx - 0.012, 0.1, 0.04],
    [fx - 0.006, 0.0, 0.02],
  ];
  return {
    skin,
    mark,
    faceX: fx,
    jawAngle: [jw, jy],
    chin: [fx + 0.06, 0.5],
    nape: [0.36, 0.26],
    earC: [0.2 + 0.2 * (1 - t), 0.04],
  };
}

/** The profile facing screen-left (research §11.4, in centre-origin units: the brow -0.08, the nose's tip 0.18, the
 *  lips 0.29 / 0.36, the chin's front 0.45). */
function headProfile(f: Face): {skin: RV[]; mark: RV[]; jawAngle: V2; nape: V2} {
  const ff = -0.43; // the face front (the brow's forward point)
  const nose = 0.08 + 0.02 * f.nose;
  const k = f.jaw;
  const skin: RV[] = [
    [0.02, -0.5, 0.22],
    [0.38, -0.4, 0.18],
    [0.52, -0.12, 0.16],
    [0.49, 0.13, 0.12],
    [0.34, 0.27, 0.06],
    [0.15 + 0.02 * k, 0.33 + 0.02 * k, 0.04 + 0.02 * k],
    // the jaw's straight to the chin
    [ff + 0.12, 0.5, 0.04],
    [ff + 0.045, 0.497, 0.04],
    [ff + 0.022 - 0.008 * f.chin, 0.452, 0.025],
    [ff + 0.035, 0.405, 0.015],
    // lips: lower, the mouth's corner, upper; then the subnasale
    [ff + 0.006, 0.36, 0.014],
    [ff + 0.022, 0.322, 0.006],
    [ff - 0.008, 0.293, 0.012],
    [ff + 0.002, 0.24, 0.006],
    // the nose: its underside (about 100 degrees to the lip), the tip, the straight ridge, the bridge's dip
    [ff - nose + 0.006, 0.212, 0.012],
    [ff - nose, 0.184, 0.012],
    [ff + 0.016, -0.035, 0.03],
    [ff - 0.004, -0.082, 0.03],
    [ff + 0.012, -0.2, 0.08],
    [ff + 0.1, -0.38, 0.14],
  ];
  // the mark: the shade under the nose's wing (the same wedge as in 3/4, seen from the side)
  const mark: RV[] = [
    [ff - nose + 0.014, 0.205, 0.008],
    [ff - 0.012, 0.236, 0.01],
    [ff + 0.022, 0.212, 0.012],
    [ff + 0.018, 0.168, 0.016],
    [ff - 0.02, 0.158, 0.014],
  ];
  return {skin, mark, jawAngle: [0.15, 0.33], nape: [0.34, 0.27]};
}

/** The lost profile (yaw -120..-160) and the back: the skull from behind with the cheek's sliver on the left. */
function headBack(f: Face, yaw: number): {skin: RV[]; cheek: boolean} {
  // 180 = straight back; the turn toward screen-left brings the cheek's contour out on the left
  const turn = clamp((180 - Math.abs(yaw)) / 50, 0, 1); // 0 at the back, 1 at a 50-degree turn
  const k = f.jaw;
  const skin: RV[] = [
    [0, -0.5, 0.2],
    [0.36, -0.38, 0.18],
    [0.41, -0.08, 0.14],
    [0.34, 0.22, 0.1],
    [0.18, 0.36, 0.06],
    [0.0, 0.4, 0.06],
    // the left side: from behind the jaw and cheek bulge out as the head turns
    [-0.16 - 0.1 * turn, 0.38 + 0.08 * turn, 0.05],
    [-0.3 - 0.08 * turn - 0.02 * k, 0.24 + 0.04 * turn, 0.06],
    [-0.38 - 0.03 * turn, 0.05, 0.08],
    [-0.4, -0.12, 0.12],
    [-0.34, -0.38, 0.18],
  ];
  return {skin, cheek: turn > 0.2};
}

export type HeadOut = {
  parts: Part[];
  hf: HeadFrame;
  /** landmarks in head units for the hair and the props */
  lm: {faceX: number; nape: V2; jawAngle: V2; view: 'q' | 'p' | 'b'};
};

/** The head, the neck and the mark as parts. z: neck 50, head 52, mark 53 (the hair and props go round them). */
export function headParts(sk: Skel, c: Cam, skin: Tone, o: {neckDeep?: boolean} = {}): HeadOut {
  const hf = headFrame(sk, c);
  const f = faceOf(sk);
  const parts: Part[] = [];
  const yaw = hf.yaw;
  const ay = Math.abs(yaw);
  let view: 'q' | 'p' | 'b' = 'q';
  if (ay >= 70 && ay <= 112) view = 'p';
  else if (ay > 112) view = 'b';
  // the neck: a slender column from its base to under the skull, ONE flat shade plane (it sits under the jaw): the
  // lit face against the shaded neck is the jaw's line
  const nr = sk.b.neckW / 2;
  const nt = tube([sk.neckBase, sk.neckTop, [sk.neckTop[0], sk.neckTop[1] + 34, sk.neckTop[2] - 6]], [nr * 1.08, nr, nr * 0.96], c);
  const neckD = rpath(
    [...nt.A.map((q, i) => [q[0], q[1], i === 1 ? 6 : 0] as RV), ...nt.B.slice().reverse().map((q, i) => [q[0], q[1], i === 1 ? 6 : 0] as RV)],
    true,
  );
  parts.push({name: 'neck', d: neckD, fill: skin.shade, z: 50});
  void o;

  let lm: HeadOut['lm'];
  if (view === 'q') {
    const h = head34(f, yaw);
    const d = hf.R(h.skin);
    // the side plane away from the key: a designed terminator from the near temple, past the cheekbone's outer edge,
    // to the jaw (the face's front plane stays lit; the mark is the only feature)
    const ts = Math.sin(rad(-yaw));
    const x0 = -0.02 + 0.12 * (0.64 - ts);
    const side = poly(
      hf.PP([
        [x0 + 0.06, -0.62],
        [x0 + 0.03, -0.26],
        [x0 - 0.01, -0.02],
        [x0 - 0.015, 0.12],
        [x0 + 0.03, 0.29],
        [x0 + 0.12, 0.42],
        [x0 + 0.3, 0.62],
        [1.2, 0.62],
        [1.2, -0.62],
      ]),
    );
    parts.push({name: 'head', d, fill: skin.lit, regions: [{d: side, fill: skin.shade}], z: 52});
    parts.push({name: 'mark', d: hf.R(h.mark), fill: skin.shade, z: 53});
    lm = {faceX: h.faceX, nape: h.nape, jawAngle: h.jawAngle, view};
  } else if (view === 'p') {
    const h = headProfile(f);
    const d = hf.R(h.skin);
    // the back of the head and the jaw's underside away from the key
    const shade = poly(hf.PP([[0.2, -0.7], [0.14, 0.2], [0.1, 0.36], [-0.3, 0.5], [-0.3, 0.7], [1.2, 0.7], [1.2, -0.7]]));
    parts.push({name: 'head', d, fill: skin.lit, regions: [{d: shade, fill: skin.shade}], z: 52});
    parts.push({name: 'mark', d: hf.R(h.mark), fill: skin.shade, z: 53});
    lm = {faceX: -0.43, nape: h.nape, jawAngle: h.jawAngle, view};
  } else {
    const h = headBack(f, yaw);
    const d = hf.R(h.skin);
    const shade = poly(hf.PP([[0.12, -0.7], [0.06, 0.7], [1.2, 0.7], [1.2, -0.7]]));
    parts.push({name: 'head', d, fill: skin.lit, regions: [{d: shade, fill: skin.shade}], z: 52});
    lm = {faceX: -0.4, nape: [0.0, 0.36], jawAngle: [-0.3, 0.3], view};
  }
  return {parts, hf, lm};
}

/** A screen point of the head frame for props anchored to the head (glasses, a cap, headphones). */
export const hp = (hf: HeadFrame, u: V2): V2 => hf.P(u);
export const headDepth = (sk: Skel, c: Cam) => toCam(sk.head.c as V3, c)[2];
