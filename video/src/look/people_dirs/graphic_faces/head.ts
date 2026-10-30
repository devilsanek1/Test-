// MODERN GRAPHIC people, FACE OPTIONS (docs/look/people_design/faces_graphic.md): a copy of graphic/head.ts with the
// face as a variant parameter. The head, the neck and the light planes are the direction's own (an egg: a round cranium
// against a straight jaw, a long neck in one shade plane, the side plane away from the key); what sits ON the face is
// the option:
//   now     the current mark: the brow ridge's shade running into the nose's shaded side (the reference, unchanged)
//   edge    nothing inside the face: the far contour (brow, nose, lips, chin) and the light planes are the face
//   lash    closed-eye lash lines (one tapered crescent per eye, one flick at the outer corner) and a short, soft
//           nose plane (the wing and the shade under the tip; never up to the brow)
//   glow    ONE warm tone (the skin turned toward rose) on the cheek's apple and on the lips; no lines
//   shades  oversized sunglasses (headwear.ts) and the soft nose plane below them
//   brim    a cap (headwear.ts): its brim's crisp shadow over the eyes, the soft nose plane below it
//   turn    the face turned away: the lost profile by default (the cheek's sliver, the nose's tip and one lash flick
//           peeking past the cheek); in profile the hair comes forward over the eye (hair.ts)
// The 3/4 head also holds at a slight turn (yaw -16): below |yaw| 22 the far contour blends from the nose-and-lips
// edge to the far cheek and jaw (the nose then sits inside the face), so a near-front head has no notch.
// Head units: u = the skull's height (crown to chin); origin at the skull's centre; y down; the crown at y -0.5.
import {V2, V3, RV, rpath, rot, rad, add, mul, poly, clamp, lerp} from '../graphic/geo';
import {Cam, proj, toCam, tube} from '../graphic/rig';
import type {Skel} from '../graphic/body';
import {fromLch, lch, mixLab, type Tone} from '../graphic/color';
import type {Part, Region} from '../graphic/part';

export type FaceOpt = 'now' | 'edge' | 'lash' | 'glow' | 'shades' | 'brim' | 'turn';

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

/** How much of the 3/4 contour (the nose and lips on the far edge) a yaw shows: 1 from |yaw| 22 (the direction's own
 *  3/4 head, unchanged), 0 at |yaw| 16 and nearer the front (the far cheek and jaw are the edge). */
export const contourBlend = (yaw: number) => clamp((Math.abs(yaw) - 16) / 6, 0, 1);

type L34 = {
  fx: number;
  t: number;
  b: number;
  tipX: number;
  tipY: number;
  sil: number;
};

/** The 3/4 head facing screen-left (yaw -16..-60): the skull, the far contour, the jaw; and the landmarks. */
function head34(f: Face, yaw: number, b: number): {skin: RV[]; mark: RV[]; L: L34; jawAngle: V2; chin: V2; nape: V2} {
  // how far the face line sits left of the skull's centre: 0.47 * sin(|yaw|)
  const t = Math.sin(rad(-yaw));
  const fx = -0.47 * t; // the face's centre line
  const sil = Math.sqrt(Math.pow(0.38 * Math.cos(rad(yaw)), 2) + Math.pow(0.47 * t, 2)); // far silhouette half-width
  const k = f.jaw;
  const jw = 0.27 + 0.04 * k - 0.05 * (1 - b); // near jaw angle x
  const jy = 0.31 + 0.02 * k;
  const chinW = 0.07 + 0.03 * f.chin;
  // the nose: the ridge from between the brows (fx, -0.06) to the tip, which just breaks the far contour
  const nl = 0.155 + 0.02 * f.nose; // projection of the nose
  const tipX = fx - nl * t - 0.005;
  const tipY = 0.185 + 0.01 * f.nose;
  const ns = 0.94 + 0.06 * b; // the near side narrows a little toward the front
  // the far contour from the chin up: in 3/4 the lips just proud of the cheek, the nose breaking the contour, the
  // cheekbone, the eye socket's dip, the brow, the temple ...
  const c34: RV[] = [
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
  // ... and near the front the same 14 points walk the far jaw up to the far cheekbone (the nose is inside the face)
  const CF: V2 = [fx - 0.05 - 0.02 * k, 0.462];
  const FA: V2 = [-sil + 0.075 - 0.02 * k, 0.29 + 0.02 * k];
  const J = (s: number): V2 => lerp(CF, FA, s);
  const cFront: RV[] = [
    [...CF, 0.05],
    [...J(0.22), 0.03],
    [...J(0.42), 0.03],
    [...J(0.58), 0.03],
    [...J(0.78), 0.04],
    [...FA, 0.06],
    [-sil + 0.045, 0.235, 0.05],
    [-sil + 0.03, 0.165, 0.05],
    [-sil + 0.02, 0.1, 0.04],
    [-sil + 0.012, 0.045, 0.06],
    [-sil + 0.02, -0.015, 0.06],
    [-sil + 0.018, -0.075, 0.06],
    [-sil + 0.025, -0.2, 0.12],
    [-sil + 0.12, -0.4, 0.14],
  ];
  const far: RV[] = c34.map((p, i) => [p[0] * b + cFront[i][0] * (1 - b), p[1] * b + cFront[i][1] * (1 - b), (p[2] ?? 0) * b + (cFront[i][2] ?? 0) * (1 - b)]);
  const skin: RV[] = [
    [0.02, -0.5, 0.2],
    [0.33 * ns, -0.42, 0.16],
    [0.45 * ns, -0.17, 0.18],
    [0.44 * ns, 0.04, 0.12],
    [0.37 * ns, 0.2, 0.06],
    [jw, jy, 0.03 + 0.02 * k],
    // the jaw line: a straight from the angle to the chin (S1: the straight against the round skull)
    [fx + 0.22 + chinW * 0.5, 0.465, 0.05],
    [fx + 0.1, 0.49 + 0.01 * k, 0.05 + 0.02 * f.chin],
    [fx + 0.02 - 0.01 * k, 0.483 + 0.012 * k, 0.03],
    ...far,
  ];
  // THE MARK (option 'now', unchanged): the shade under the near brow ridge running into the nose's shaded side and
  // ending in a foot under the tip
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
  return {skin, mark, L: {fx, t, b, tipX, tipY, sil}, jawAngle: [jw, jy], chin: [fx + 0.06, 0.5], nape: [0.36, 0.26]};
}

/** The profile facing screen-left (research §11.4, in centre-origin units: the brow -0.08, the nose's tip 0.18, the
 *  lips 0.29 / 0.36, the chin's front 0.45). */
function headProfile(f: Face): {skin: RV[]; mark: RV[]; jawAngle: V2; nape: V2; ff: number; nose: number} {
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
  // the shade under the nose's wing (the same as in 3/4, seen from the side)
  const mark: RV[] = [
    [ff - nose + 0.014, 0.205, 0.008],
    [ff - 0.012, 0.236, 0.01],
    [ff + 0.022, 0.212, 0.012],
    [ff + 0.018, 0.168, 0.016],
    [ff - 0.02, 0.158, 0.014],
  ];
  return {skin, mark, jawAngle: [0.15, 0.33], nape: [0.34, 0.27], ff, nose};
}

/** The lost profile (yaw -110..-160) and the back: the skull from behind with the cheek's sliver on the left. With
 *  `peek` (option 'turn', |yaw| under ~140) the nose's tip just breaks the cheek's line. */
function headBack(f: Face, yaw: number, peek = 0): {skin: RV[]; cheek: boolean; turn: number} {
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
    ...(peek > 0
      ? ([
          [-0.385 - 0.012 * peek, 0.205, 0.02],
          [-0.405 - 0.03 * peek, 0.165, 0.012],
          [-0.4 - 0.01 * peek, 0.12, 0.03],
        ] as RV[])
      : []),
    [-0.38 - 0.03 * turn, 0.05, 0.08],
    [-0.4, -0.12, 0.12],
    [-0.34, -0.38, 0.18],
  ];
  return {skin, cheek: turn > 0.2, turn};
}

// ---------------------------------------------------------------- the option's marks
/** A closed-eye lash line in head units: the lid's line from the inner corner to the outer one, bowed downward by
 *  `sag`, fullest past its middle (the lashes) and tapering to a point at the inner corner, with ONE flick up and out
 *  at the outer corner. `out` = +1 when the outer corner is screen-right. */
function lashPts(cx: number, cy: number, w: number, sag: number, th: number, out: 1 | -1, flick = 1, tilt = 0.01): RV[] {
  const N = 9;
  const top: RV[] = [];
  const bot: RV[] = [];
  for (let i = 0; i <= N; i++) {
    const s = i / N; // 0 the inner corner .. 1 the outer corner
    const x = cx + out * (s - 0.5) * w;
    const y = cy + sag * (1 - Math.pow(2 * s - 1, 2)) - tilt * s;
    const w0 = th * Math.pow(Math.sin(Math.PI * (0.05 + 0.82 * s)), 0.75);
    top.push([x, y - w0 * 0.25, 0.004]);
    bot.push([x - out * w0 * 0.15, y + w0 * 0.75, 0.004]);
  }
  const o = top[N];
  const tip: RV = [o[0] + out * w * 0.17 * flick, o[1] - w * 0.13 * flick, 0];
  return [...top.slice(0, N + 1), tip, ...bot.slice().reverse()];
}

/** The soft nose plane in 3/4: the near wing's shade and the shade under the tip, one small hook (never up to the
 *  brow). */
function nose34(L: L34, k: number): RV[] {
  const {fx, tipX, tipY} = L;
  const d = 0.005 * k;
  return [
    [fx + 0.03, 0.105, 0.02],
    [fx + 0.043, 0.16, 0.02],
    [fx + 0.062, 0.19 + d, 0.025],
    [fx + 0.056, tipY + 0.035 + d, 0.02],
    [fx + 0.02, tipY + 0.042 + d, 0.015],
    [tipX + 0.03, tipY + 0.034, 0.01],
    [tipX + 0.012, tipY + 0.022, 0.004],
    [tipX + 0.04, tipY + 0.02, 0.008],
    [fx + 0.022, tipY + 0.014, 0.015],
    [fx + 0.035, 0.175, 0.015],
    [fx + 0.027, 0.13, 0.015],
  ];
}

/** The warm tone: the lit skin turned 16 degrees toward rose, C* + 7, L* - 3 (the cheek's apple and the lips). */
export const glowOf = (skinLit: string) => {
  const q = lch(skinLit);
  return fromLch(q.L - 3, q.C + 6, q.h - 11);
};
/** The lash colour: the hair's deep tone with a little of the skin's shade (dark and warm, never black ink). */
export const lashOf = (hairDeep: string, skinShade: string) => mixLab(hairDeep, skinShade, 0.22);

export type HeadOpts = {face?: FaceOpt; hair?: Tone};
export type HeadOut = {
  parts: Part[];
  hf: HeadFrame;
  /** landmarks in head units for the hair and the props */
  lm: {faceX: number; nape: V2; jawAngle: V2; view: 'q' | 'p' | 'b'; blend: number};
};

/** The head, the neck and the face option as parts. z: neck 50, head 52, marks 53-53.6 (the hair and props go round
 *  them). */
export function headParts(sk: Skel, c: Cam, skin: Tone, o: HeadOpts = {}): HeadOut {
  const face: FaceOpt = o.face ?? 'now';
  const hf = headFrame(sk, c);
  const f = faceOf(sk);
  const parts: Part[] = [];
  const yaw = hf.yaw;
  const ay = Math.abs(yaw);
  const lashC = lashOf(o.hair?.deep ?? '#4A2A22', skin.shade);
  const glow = glowOf(skin.lit);
  const man = sk.b.sex === 'm';
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

  let lm: HeadOut['lm'];
  if (view === 'q') {
    // 'now' keeps the direction's own geometry wherever it held (|yaw| >= 20); every other option, and any yaw nearer
    // the front, uses the blended contour
    const b = face === 'now' && ay >= 20 ? 1 : contourBlend(yaw);
    const h = head34(f, yaw, b);
    const {fx, t} = h.L;
    const cs = Math.cos(rad(yaw));
    const d = hf.R(h.skin);
    // the side plane away from the key: a designed terminator from the near temple, past the cheekbone's outer edge,
    // to the jaw (the face's front plane stays lit). It tracks the cheekbone's outer edge (0.3 u off the face line).
    const x0 = face === 'now' && ay >= 20 ? -0.02 + 0.12 * (0.64 - t) : fx + 0.3 * cs + 0.005;
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
    const regions: Region[] = [{d: side, fill: skin.shade}];
    const softNose = () => regions.push({d: hf.R(nose34(h.L, f.nose)), fill: skin.shade});
    // the eyes' places: the near eye 0.14 u off the face line, the far one tucked toward the far contour
    const eN: V2 = [fx + 0.14 * cs, -0.005];
    const wN = 0.13 * cs + 0.02;
    const eF: V2 = [fx - (0.07 + 0.065 * (1 - h.L.b)), 0.0];
    const wF = 0.058 + 0.04 * (1 - h.L.b);
    if (face === 'lash') {
      softNose();
      const th = man ? 0.017 : 0.022;
      parts.push({name: 'lashNear', d: hf.R(lashPts(eN[0], eN[1], wN, 0.022, th, 1, man ? 0.45 : 1)), fill: lashC, z: 53.5});
      parts.push({name: 'lashFar', d: hf.R(lashPts(eF[0], eF[1], wF, 0.014, th * 0.85, -1, man ? 0.45 : 0.9, 0.006)), fill: lashC, z: 53.5});
    } else if (face === 'glow') {
      // ONE warm tone: the near cheek's apple, the far one when the face is near the front, and the lips (clipped at
      // the far contour, so in 3/4 the lips' bumps on the edge take the tone)
      // the near cheek: a draped plane along the cheekbone, rising toward the temple, kept inside the lit front
      const cx0 = fx + 0.075;
      const cx1 = Math.min(x0 - 0.03, cx0 + 0.24);
      regions.push({d: hf.R([[cx0, 0.15, 0.03], [cx0 + (cx1 - cx0) * 0.55, 0.085, 0.04], [cx1, 0.06, 0.03], [cx1 + 0.005, 0.115, 0.03], [cx0 + (cx1 - cx0) * 0.5, 0.165, 0.05], [cx0 + 0.02, 0.205, 0.03]]), fill: glow});
      if (h.L.b < 0.6) {
        // near the front the far cheek shows its own small plane by the far contour
        const fx0 = eF[0] + 0.02;
        regions.push({d: hf.R([[fx0, 0.15, 0.025], [fx0 - 0.06, 0.085, 0.03], [fx0 - 0.1, 0.07, 0.02], [fx0 - 0.095, 0.13, 0.03], [fx0 - 0.04, 0.19, 0.03]]), fill: glow});
      }
      const lx = fx - 0.012 * (1 - h.L.b);
      const lips: RV[] =
        h.L.b > 0.5
          ? [
              [fx - 0.16, 0.288, 0],
              [fx - 0.02, 0.29, 0.02],
              [fx + 0.05, 0.315, 0.02],
              [fx + 0.035, 0.345, 0.02],
              [fx - 0.02, 0.365, 0.02],
              [fx - 0.16, 0.368, 0],
            ]
          : [
              [lx - 0.07, 0.322, 0.02],
              [lx - 0.03, 0.3, 0.015],
              [lx + 0.002, 0.307, 0.008],
              [lx + 0.035, 0.299, 0.015],
              [lx + 0.08, 0.32, 0.02],
              [lx + 0.04, 0.348, 0.025],
              [lx - 0.035, 0.35, 0.025],
            ];
      regions.push({d: hf.R(lips), fill: glow});
    } else if (face === 'shades' || face === 'brim') {
      softNose();
      if (face === 'brim') {
        // the brim's crisp shadow across the brow and the eyes (the cap itself: headwear.ts)
        regions.push({d: poly(hf.PP([[-0.7, -0.6], [0.8, -0.6], [0.8, -0.03], [x0 + 0.02, -0.03], [fx + 0.05, 0.035], [fx - 0.1, 0.03], [-0.7, 0.0]])), fill: skin.shade});
      }
    }
    parts.push({name: 'head', d, fill: skin.lit, regions, z: 52});
    if (face === 'now') parts.push({name: 'mark', d: hf.R(h.mark), fill: skin.shade, z: 53});
    lm = {faceX: fx, nape: h.nape, jawAngle: h.jawAngle, view, blend: h.L.b};
  } else if (view === 'p') {
    const h = headProfile(f);
    const d = hf.R(h.skin);
    // the back of the head and the jaw's underside away from the key
    const shade = poly(hf.PP([[0.2, -0.7], [0.14, 0.2], [0.1, 0.36], [-0.3, 0.5], [-0.3, 0.7], [1.2, 0.7], [1.2, -0.7]]));
    const regions: Region[] = [{d: shade, fill: skin.shade}];
    const ff = h.ff;
    const wing = () => regions.push({d: hf.R(h.mark), fill: skin.shade});
    if (face === 'now' || face === 'lash' || face === 'shades') wing();
    if (face === 'glow') {
      regions.push({d: hf.R([[-0.36, 0.17, 0.03], [-0.27, 0.1, 0.04], [-0.17, 0.07, 0.03], [-0.16, 0.13, 0.03], [-0.26, 0.18, 0.05], [-0.34, 0.215, 0.03]]), fill: glow});
      regions.push({d: hf.R([[ff - 0.12, 0.288, 0], [ff + 0.01, 0.29, 0.02], [ff + 0.04, 0.322, 0.015], [ff + 0.02, 0.36, 0.02], [ff - 0.12, 0.37, 0]]), fill: glow});
    }
    if (face === 'brim') {
      wing();
      regions.push({d: poly(hf.PP([[-0.7, -0.6], [0.6, -0.6], [0.1, -0.03], [-0.25, 0.04], [-0.7, 0.02]])), fill: skin.shade});
    }
    parts.push({name: 'head', d, fill: skin.lit, regions, z: 52});
    if (face === 'lash') {
      // one lash line, 0.06 u behind the face front at the eye's height, the flick up and back
      parts.push({name: 'lash', d: hf.R(lashPts(ff + 0.105, 0.0, man ? 0.085 : 0.095, 0.014, man ? 0.016 : 0.021, 1, man ? 0.45 : 1, 0.012)), fill: lashC, z: 53.5});
    }
    lm = {faceX: ff, nape: h.nape, jawAngle: h.jawAngle, view, blend: 1};
  } else {
    const peek = face === 'turn' ? clamp((142 - ay) / 22, 0, 1) : 0;
    const h = headBack(f, yaw, peek);
    const d = hf.R(h.skin);
    const shade = poly(hf.PP([[0.12, -0.7], [0.06, 0.7], [1.2, 0.7], [1.2, -0.7]]));
    parts.push({name: 'head', d, fill: skin.lit, regions: [{d: shade, fill: skin.shade}], z: 52});
    if (face === 'turn' && h.turn > 0.6) {
      // the classic touch of the lost profile: one lash flick peeking past the cheek at the eye's height
      const x = -0.39 - 0.012 * h.turn - 0.01 * peek;
      parts.push({
        name: 'lashFlick',
        d: hf.R([
          [x + 0.03, -0.008, 0.004],
          [x - 0.012, -0.012, 0.004],
          [x - 0.05, -0.05, 0],
          [x - 0.022, -0.004, 0.006],
          [x + 0.028, 0.012, 0.004],
        ]),
        fill: lashC,
        z: 53.5,
      });
    }
    lm = {faceX: -0.4, nape: [0.0, 0.36], jawAngle: [-0.3, 0.3], view, blend: 1};
  }
  return {parts, hf, lm};
}

/** A screen point of the head frame for props anchored to the head (glasses, a cap, headphones). */
export const hp = (hf: HeadFrame, u: V2): V2 => hf.P(u);
export const headDepth = (sk: Skel, c: Cam) => toCam(sk.head.c as V3, c)[2];
