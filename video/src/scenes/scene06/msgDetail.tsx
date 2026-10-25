// scene06/msgDetail.tsx — the messenger's hero detail (S06 fix round: "a featureless teal slab"): drawn OVER the props
// Messenger in its person-local units (hip line y 0, torso TORSO 95 up, legs LEG 62 down), riding the kit walk bob.
// The props Messenger draws its kit Person at s = 1 inside a scaled frame, so the kit's own hero detail (seams, cuffs,
// rim) never ramps in; this overlay adds, in the kit's geometry (lib/kit/Person makePaths):
//   - the hanging LEFT sleeve's seam + cuff and a sand hand under it (the right arm is the raised FigureArm)
//   - the coat's hem line and a short back vent
//   - a cross-body SATCHEL: a brown strap from the right shoulder to the left hip, a clay bag with a brown flap and a
//     cream buckle tick (fills misregistered, ink 3.4 px on screen): he reads as THE messenger with the sound off
//   - cream shoe soles (thicker on the lifted heel while he walks)
//   - a PEACH rim strip (3.5 px on screen) just inside the outline along both shoulders, the top of the head and the top
//     of the raised arm: the low sun is AHEAD of him at the lane's vanishing point (style_bible_ref2 rim strips)
// Exported for S05 (same seed 's5msg', so the satchel and rim carry across the cut on action): pass the same props.

import React from 'react';
import {Fill, Ink, mat, palette, polyPath, Pt, rng, roundRect, blob, XG} from '../../lib';

const TORSO = 95;
const LEG = 62;

/** The kit Person's first random draws for a seed (lib/kit/Person makeSpec: w, h (given), hr, round). */
export function kitGeo(seed: string) {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  const round = r.range(0.36, 0.45);
  return {w, h: TORSO, hr, round, legH: LEG};
}

const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt, n: number): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const a = (1 - u) ** 3;
    const b = 3 * (1 - u) ** 2 * u;
    const c = 3 * (1 - u) * u * u;
    const d = u ** 3;
    out.push([a * p0[0] + b * p1[0] + c * p2[0] + d * p3[0], a * p0[1] + b * p1[1] + c * p2[1] + d * p3[1]]);
  }
  return out;
};

/** A strip polygon just inside a polyline: from offset d0 to d1 along the normal that points toward `inside(p)`. */
export function insideStrip(pts: Pt[], d0: number, d1: number, inside: (p: Pt) => Pt): string {
  if (pts.length < 2) return '';
  const a: Pt[] = [];
  const b: Pt[] = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q0 = pts[Math.max(0, i - 1)];
    const q1 = pts[Math.min(pts.length - 1, i + 1)];
    const tx = q1[0] - q0[0];
    const ty = q1[1] - q0[1];
    const L = Math.hypot(tx, ty) || 1;
    let nx = -ty / L;
    let ny = tx / L;
    const c = inside(p);
    if (nx * (c[0] - p[0]) + ny * (c[1] - p[1]) < 0) {
      nx = -nx;
      ny = -ny;
    }
    a.push([p[0] + nx * d0, p[1] + ny * d0]);
    b.push([p[0] + nx * d1, p[1] + ny * d1]);
  }
  return polyPath([...a, ...b.reverse()]);
}

/** The FigureArm's elbow and its two sleeve sides (mirrors props Figures FigureArm with the default bend). */
export function armSides(sh: Pt, hand: Pt, w = 19): {upper: Pt[]; El: Pt} {
  const dx = hand[0] - sh[0];
  const dy = hand[1] - sh[1];
  const d = Math.hypot(dx, dy) || 1e-6;
  const ux = dx / d;
  const uy = dy / d;
  const sd = sh[0] < 0 ? -1 : 1;
  const elev = Math.acos(Math.max(-1, Math.min(1, uy)));
  const q = Math.max(0, Math.min(1, (elev - 0.35) / 1.45));
  const bendDeg = Math.max(0, Math.min(80, 30 * (0.5 - 0.5 * Math.cos(Math.PI * q))));
  const off = (d / 2) * Math.tan((bendDeg * Math.PI) / 360);
  const pv: Pt = [sd * -uy, sd * ux];
  const El: Pt = [sh[0] + dx * 0.5 + pv[0] * off, sh[1] + dy * 0.5 + pv[1] * off];
  const nrm = (a0: Pt, b0: Pt): Pt => {
    const L = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]) || 1;
    return [-(b0[1] - a0[1]) / L, (b0[0] - a0[0]) / L];
  };
  const n1 = nrm(sh, El);
  const n2 = nrm(El, hand);
  let mx = n1[0] + n2[0];
  let my = n1[1] + n2[1];
  const mL = Math.hypot(mx, my) || 1;
  mx /= mL;
  my /= mL;
  const ml = Math.min(2.2, 1 / Math.max(0.45, mx * n1[0] + my * n1[1]));
  const h0 = w / 2;
  const h1 = h0 * 0.9;
  const h2 = h0 * 0.74;
  const A: Pt[] = [[sh[0] + n1[0] * h0, sh[1] + n1[1] * h0], [El[0] + mx * h1 * ml, El[1] + my * h1 * ml], [hand[0] + n2[0] * h2, hand[1] + n2[1] * h2]];
  const B: Pt[] = [[sh[0] - n1[0] * h0, sh[1] - n1[1] * h0], [El[0] - mx * h1 * ml, El[1] - my * h1 * ml], [hand[0] - n2[0] * h2, hand[1] - n2[1] * h2]];
  const ya = A[0][1] + A[1][1] + A[2][1];
  const yb = B[0][1] + B[1][1] + B[2][1];
  return {upper: ya < yb ? A : B, El};
}

const lerpPts = (P: Pt[], n: number): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < n; k++) out.push([P[i][0] + ((P[i + 1][0] - P[i][0]) * k) / n, P[i][1] + ((P[i + 1][1] - P[i][1]) * k) / n]);
  out.push(P[P.length - 1]);
  return out;
};

export type MessengerDetailProps = {
  seed: string;
  /** Screen px per person unit (figure scale x camera zoom): sets the rim / fine-ink widths on screen. */
  k: number;
  /** Walk phase input (the kit Person's own: ph = tau * hz * PI + phase); omit = standing. */
  ph?: number;
  /** The raised arm (person units): its top edge gets the rim. Omit = no arm rim. */
  arm?: {sh: Pt; hand: Pt};
  /** Rim colour (default peach). false = no rim. */
  rim?: string | false;
  /** Fix round 3 (S06's own walking legs, parts.tsx): each foot's x shift and bottom width (person units, [left, right])
   *  and how far the feet sit below the kit's foot line (the body bob with the planted foot on the ground). */
  feet?: {dx: [number, number]; bw: [number, number]; drop: number};
  /** Fix round 3: the satchel lags the body by a frame: a swing (deg, about the strap's foot) and a y lag (person units). */
  bag?: {rot: number; dy: number};
};

/** Draw INSIDE the Messenger's person frame (translate(feet x, hip y + walk bob) scale(h / 199)). */
export const MessengerDetail: React.FC<MessengerDetailProps> = ({seed, k, ph, arm, rim = palette.peach, feet, bag: bagFx}) => {
  const g = kitGeo(seed);
  const {w, h, hr, round, legH} = g;
  const hw = w / 2;
  const bx = hw * 1.07;
  const R = Math.min(w * round, h * 0.8);
  const top = -h;
  const d = w * 0.18;
  const xAt = (y: number) => -hw - ((bx - hw) * (y - (-h + R))) / (h - R);
  const yTop = -h + R - Math.sqrt(Math.max(0, R * R - (R - d) * (R - d))) + w * 0.03;
  const yCuff = -h * 0.075;
  const fine = 2.2 / k; // 2.2 px on screen
  const mid = 3.4 / k; // 3.4 px on screen
  // ---- the hanging left sleeve: seam, cuff, hand
  const seamL = `M${(-hw + d).toFixed(2)} ${yTop.toFixed(2)}Q${(-hw + d - w * 0.012).toFixed(2)} ${((yTop + yCuff) / 2).toFixed(2)} ${(xAt(yCuff) + d).toFixed(2)} ${yCuff.toFixed(2)}`;
  const cuffL = `M${(xAt(yCuff) + 1).toFixed(2)} ${yCuff.toFixed(2)}L${(xAt(yCuff) + d).toFixed(2)} ${yCuff.toFixed(2)}`;
  const hx = xAt(0) + d / 2;
  const handL = blob(hx, h * 0.04, w * 0.072, w * 0.095, {seed: `${seed}/dhl`});
  // ---- hem + vent
  const hem = `M${(-bx + 2).toFixed(2)} -0.6Q0 0.9 ${(bx - 2).toFixed(2)} -0.6`;
  const vent = `M0.6 ${(-h * 0.2).toFixed(2)}L0 -0.2`;
  // ---- satchel: strap from the right shoulder to the left hip, the bag at the left hip
  const bag = {x0: -w * 0.37, x1: -w * 0.02, y0: -h * 0.3, y1: h * 0.07};
  const sw = 10.5 / k / 1.0; // ~10.5 px on screen at the reference k
  const s0: Pt = [w * 0.3, top - 0.5];
  const s1o: Pt = [bag.x0 + (bag.x1 - bag.x0) * 0.42, bag.y0 + 1];
  // the bag's swing / lag about the strap's foot; the strap's foot rides it
  const bagM = bagFx && (bagFx.rot !== 0 || bagFx.dy !== 0) ? mat.compose(mat.translate(0, bagFx.dy), mat.about(mat.rotate(bagFx.rot), s1o[0], s1o[1])) : mat.I;
  const s1: Pt = [bagM[0] * s1o[0] + bagM[2] * s1o[1] + bagM[4], bagM[1] * s1o[0] + bagM[3] * s1o[1] + bagM[5]];
  const sl = Math.hypot(s1[0] - s0[0], s1[1] - s0[1]) || 1;
  const snx = (-(s1[1] - s0[1]) / sl) * (sw / 2);
  const sny = ((s1[0] - s0[0]) / sl) * (sw / 2);
  const strapPts: Pt[] = [[s0[0] + snx, s0[1] + sny], [s1[0] + snx, s1[1] + sny], [s1[0] - snx, s1[1] - sny], [s0[0] - snx, s0[1] - sny]];
  // the strap tucks over the shoulder: its top end follows the shoulder line (a short wrap past the top edge)
  const strap = polyPath(strapPts);
  const strapInk = `M${strapPts[0][0].toFixed(2)} ${strapPts[0][1].toFixed(2)}L${strapPts[1][0].toFixed(2)} ${strapPts[1][1].toFixed(2)}M${strapPts[3][0].toFixed(2)} ${strapPts[3][1].toFixed(2)}L${strapPts[2][0].toFixed(2)} ${strapPts[2][1].toFixed(2)}`;
  const bagD = roundRect(bag.x0, bag.y0, bag.x1 - bag.x0, bag.y1 - bag.y0, 3.5);
  const flapH = (bag.y1 - bag.y0) * 0.46;
  const flap = `M${bag.x0} ${bag.y0 + 2}Q${bag.x0} ${bag.y0} ${bag.x0 + 3} ${bag.y0}L${bag.x1 - 3} ${bag.y0}Q${bag.x1} ${bag.y0} ${bag.x1} ${bag.y0 + 2}L${bag.x1 - 1} ${bag.y0 + flapH}Q${(bag.x0 + bag.x1) / 2} ${bag.y0 + flapH + 3.5} ${bag.x0 + 1} ${bag.y0 + flapH}Z`;
  const flapInk = `M${bag.x0 + 0.5} ${bag.y0 + flapH - 0.3}Q${(bag.x0 + bag.x1) / 2} ${bag.y0 + flapH + 3.5} ${bag.x1 - 1} ${bag.y0 + flapH - 0.3}`;
  const bc = (bag.x0 + bag.x1) / 2;
  const buckle = roundRect(bc - 2.6, bag.y0 + flapH - 1.2, 5.2, 5.6, 1.2);
  // ---- soles (the kit legs: lw = 0.31 w, gap 0.05 w; the walking leg lifts by up to 0.16 legH)
  const lw = w * 0.31;
  const gg = w * 0.05;
  const sn = ph === undefined ? 0 : Math.sin(ph);
  const lL = Math.max(0, sn) * legH * 0.16;
  const lR = Math.max(0, -sn) * legH * 0.16;
  const sole = (i: 0 | 1, x0k: number, lift: number) => {
    const th = (3.6 + 3.2 * (lift / (legH * 0.16))) / (k / 1.37);
    const bw = feet ? feet.bw[i] : lw;
    const x0 = x0k + (feet ? feet.dx[i] + (lw - bw) / 2 : 0);
    const yb = legH - lift + 2 + (feet ? feet.drop : 0);
    return polyPath([[x0, yb - th], [x0 + bw + 3, yb - th], [x0 + bw + 3, yb], [x0, yb]]);
  };
  const soles = sole(0, -gg - lw - 1, lL) + sole(1, gg - 2, lR);
  // ---- rims: shoulders (outline top, both sides, stopping at the collar), head top, raised arm top
  let rimD = '';
  if (rim) {
    const k42 = 0.42;
    const leftCurve = cubic([-hw, top + R], [-hw, top + R * k42], [-hw + R * k42, top], [-hw + R, top], 10);
    const rightCurve = cubic([hw - R, top], [hw - R * k42, top], [hw, top + R * k42], [hw, top + R], 10);
    const neck = hr * 1.12;
    const lPts: Pt[] = [[-bx + (bx - hw) * 0.45, top + R + (h - R) * 0.55], ...leftCurve, [-neck, top]];
    const rPts: Pt[] = [[neck, top], ...rightCurve.slice(0, 6)];
    const inset = 1.15 * (4.8 / k) * 0.5 + 0.5 / k;
    const rw = 3.5 / k;
    const ctr = (): Pt => [0, -h * 0.45];
    rimD += insideStrip(lerpPts(lPts.slice(0, 2), 4).concat(lPts.slice(2)), inset, inset + rw, ctr) + insideStrip(rPts, inset, inset + rw, ctr);
    // head: a SHORT arc on the sun side only (the sun is up-left of him: ~-120 deg), thinner: a symmetric arc over the
    // dark hair read as a headphone band
    const hy = -h - hr * 0.86;
    const arcPts: Pt[] = [];
    for (let i = 0; i <= 8; i++) {
      const a = ((-162 + (62 * i) / 8) * Math.PI) / 180;
      arcPts.push([Math.cos(a) * hr, hy + Math.sin(a) * hr]);
    }
    rimD += insideStrip(arcPts, inset * 0.9, inset * 0.9 + rw * 0.8, () => [0, hy]);
    if (arm) {
      const {upper} = armSides(arm.sh, arm.hand);
      // from just past the shoulder joint to the cuff (80 % of the forearm)
      const P = lerpPts(upper, 6);
      const n = P.length;
      const from = Math.round(n * 0.12);
      const to = Math.round(n * 0.86);
      const mid2: Pt = [(arm.sh[0] + arm.hand[0]) / 2, (arm.sh[1] + arm.hand[1]) / 2];
      rimD += insideStrip(P.slice(from, to), inset * 0.85, inset * 0.85 + rw, () => mid2);
    }
  }
  return (
    <>
      {/* soles + the left hand (under the sleeve's cuff) */}
      <Fill d={soles} color={palette.cream} offset={false} mode="none" seed={`${seed}/dsole`} />
      <Fill d={handL} color={palette.sand} offset={false} mode="none" seed={`${seed}/dhlF`} />
      <Ink d={handL} width={mid * 0.85} taper={false} seed={`${seed}/dhlI`} />
      {/* coat detail */}
      <Ink d={seamL + cuffL + hem + vent} width={fine} taper={false} order="all" seed={`${seed}/dseam`} />
      {/* the satchel and its strap */}
      <XG m={bagM}>
        <Fill d={bagD} color={palette.tan} seed={`${seed}/dbag`} />
        <Fill d={flap} color={palette.brown} offset={false} mode="none" seed={`${seed}/dflap`} />
        <Ink d={bagD + flapInk} width={mid} taper={false} seed={`${seed}/dbagI`} />
        <Fill d={buckle} color={palette.cream} offset={false} mode="none" seed={`${seed}/dbk`} />
        <Ink d={buckle} width={fine * 0.8} taper={false} seed={`${seed}/dbkI`} />
      </XG>
      <Fill d={strap} color={palette.brown} seed={`${seed}/dstrap`} />
      <Ink d={strapInk} width={mid} taper={false} order="all" seed={`${seed}/dstrapI`} />
      {rimD ? <Fill d={rimD} color={rim as string} offset={false} mode="none" seed={`${seed}/drim`} /> : null}
    </>
  );
};
