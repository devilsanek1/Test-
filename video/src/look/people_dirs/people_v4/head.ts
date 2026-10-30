// PEOPLE v4 (docs/look/people_design/faces_v2/V4.md): THE HEAD API. head(sex, view, o) returns the head's frame (the
// head units the hair round's shapes are made in: crown -0.5, chin 0.5, the face toward screen-left; the kept cranium;
// the landmarks the hair needs) and the face parts in those units; placeHead() maps them onto a figure with the same
// similarity a HeadFrame uses (graphic_faces/head.ts headFrame: the head's centre, the skull's size, the roll).
// The face is drawn the illustrator's way (faces.ts: authored pen curves), lit softly: the lit plane a gentle
// gradient (warmer toward the key and the front), ONE crisp terminator to the shade plane, a warm tone on the cheek,
// the lips a tone (never a line), the nose's one crease, the ear one shape with one notch, the closed lash.
import type {V2} from '../graphic/geo';
import {lch, fromLch, mixLab, type Tone} from '../graphic/color';
import {segs, taper, mapSegs, reverseSegs, type PNode, type Seg} from './pen';
import {mapPart, polySegs, type PartV4, type Region, type Sim, type Paint} from './paint';
import {DESIGNS, EAR_IN, EAR_OUT, type FaceView, type Sex, type Stroke, type ViewDesign} from './faces';

export type Eyes = 'lash' | 'open';
export type HeadOptsV4 = {
  skin: Tone;
  hair: Tone;
  /** the closed-eye LASH (default) or the variant: open eyes looking away, never at us */
  eyes?: Eyes;
  /** a soft brow over the eye (default: on with open eyes and on men, off on her lash face) */
  brow?: boolean;
  /** the skull's size on screen (px): < 12 the facing only (no marks), < 18 the contour, < 40 + the lash and the
   *  ear as one shape, else everything (PEOPLE_DESIGN 5.3's ladder) */
  px?: number;
  /** the soft modelling (gradients, the cheek's tone): on by default; off = two flat tones */
  soft?: boolean;
};
export type HeadFrameV4 = {
  units: 'head';
  crown: -0.5;
  chin: 0.5;
  view: FaceView;
  /** the yaw the view is drawn at (-90 profile facing screen-left, -36 the 3/4, -138 the lost profile) */
  yaw: number;
  /** the kept cranium (crown and back): the hair's fit */
  cranium: Seg[];
  /** the whole skin outline */
  outline: Seg[];
  lm: ViewDesign['lm'];
};
export type HeadV4 = {headFrame: HeadFrameV4; faceParts: PartV4[]};

// ---------------------------------------------------------------- the tones
export type FaceTones = {
  lit: string;
  litFront: string;
  litBack: string;
  shade: string;
  deep: string;
  glow: string;
  lips: string;
  earIn: string;
  lash: string;
  brow: string;
  white: string;
  iris: string;
};
export function faceTones(skin: Tone, hair: Tone): FaceTones {
  const q = lch(skin.lit);
  return {
    lit: skin.lit,
    litFront: fromLch(q.L + 2.2, q.C + 1.5, q.h + 2),
    litBack: fromLch(q.L - 3.2, q.C + 1, q.h - 2),
    shade: skin.shade,
    deep: skin.deep,
    glow: fromLch(q.L - 4, q.C + 10, q.h - 16),
    lips: fromLch(q.L - 8, q.C + 9, q.h - 16),
    earIn: mixLab(skin.shade, fromLch(q.L - 4, q.C + 8, q.h - 12), 0.4),
    lash: mixLab(hair.deep, skin.shade, 0.18),
    brow: mixLab(hair.shade, skin.shade, 0.3),
    white: fromLch(Math.min(95, q.L + 15), 6, q.h),
    iris: mixLab(hair.deep, '#2A2124', 0.45),
  };
}

// ---------------------------------------------------------------- helpers
const closedOf = (nodes: PNode[]) => segs(nodes, true);
/** A region bounded by a pen line on one side and pushed far toward `away` (only ever seen through a clip). */
function sideRegion(line: PNode[], away: V2, far = 3): Seg[] {
  const ss = segs(line, false);
  const a = ss[0][0];
  const b = ss[ss.length - 1][3];
  const B2: V2 = [b[0] + away[0] * far, b[1] + away[1] * far];
  const A2: V2 = [a[0] + away[0] * far, a[1] + away[1] * far];
  return [...ss, ...polySegs([b, B2, A2, a]).slice(0, 3)];
}
/** An ellipse as four cubics (a pen shape). */
function ellipseSegs(c: V2, rx: number, ry: number, a = 0): Seg[] {
  const k = 0.5523;
  const r = (a * Math.PI) / 180;
  const R = (p: V2): V2 => [c[0] + p[0] * Math.cos(r) - p[1] * Math.sin(r), c[1] + p[0] * Math.sin(r) + p[1] * Math.cos(r)];
  const P: V2[] = [[rx, 0], [0, ry], [-rx, 0], [0, -ry]];
  const H: [V2, V2][] = [
    [[rx, ry * k], [rx * k, ry]],
    [[-rx * k, ry], [-rx, ry * k]],
    [[-rx, -ry * k], [-rx * k, -ry]],
    [[rx * k, -ry], [rx, -ry * k]],
  ];
  return P.map((p, i) => [R(p), R(H[i][0]), R(H[i][1]), R(P[(i + 1) % 4])] as Seg);
}
/** The ear's frame: its own units -> head units (mirrored when seen from behind). */
function earMap(e: NonNullable<ViewDesign['ear']>): (p: V2) => V2 {
  const r = (e.tilt * Math.PI) / 180;
  const m = e.back ? -1 : 1;
  return (p) => {
    const x = p[0] * e.w * m;
    const y = p[1] * e.h;
    return [e.c[0] + x * Math.cos(r) - y * Math.sin(r), e.c[1] + x * Math.sin(r) + y * Math.cos(r)];
  };
}
/** The width profiles: the lash widest past its middle, thinning through the outer flick to a point; the brow full at
 *  its head and tapering out; the nose's comma thin at the front. */
const PROF = {
  lash: (t: number) => (t < 0.06 ? t / 0.06 : 1) * (t < 0.58 ? Math.pow(Math.sin((Math.PI * t) / 1.16), 0.6) : Math.pow(1 - (t - 0.58) / 0.42, 1.05)),
  brow: (t: number) => (t < 0.15 ? 0.35 + (t / 0.15) * 0.65 : Math.pow(1 - (t - 0.15) / 0.85, 0.85)),
  comma: (t: number) => Math.pow(Math.max(0, Math.sin(Math.PI * (0.12 + 0.88 * t))), 0.6) * (1 - 0.75 * t),
};
const stroke = (s: Stroke): Seg[] => {
  const f = PROF[s.prof ?? 'lash'];
  return taper(segs(s.line, false), (t) => s.w * f(t));
};

// ---------------------------------------------------------------- one view's parts
function viewParts(sex: Sex, V: ViewDesign, T: FaceTones, o: HeadOptsV4): PartV4[] {
  const parts: PartV4[] = [];
  const px = o.px ?? 200;
  const soft = o.soft ?? true;
  const eyes = o.eyes ?? 'lash';
  const brow = o.brow ?? (eyes === 'open' || sex === 'm');
  const man = sex === 'm';
  const marks = px >= 12;
  const detail = px >= 40;

  // ---- the neck: one shade plane, lighter toward the collar, the jaw's cast shadow a crescent right under the jaw
  const front = segs(V.neck.front, false);
  const back = segs(V.neck.back, false);
  const fB = front[front.length - 1][3];
  const bB = back[back.length - 1][3];
  const bT = back[0][0];
  const fT = front[0][0];
  const neckSegs: Seg[] = [...front, polySegs([fB, bB])[0], ...reverseSegs(back), polySegs([bT, fT])[0]];
  const nTop = Math.min(fT[1], bT[1]);
  const neckFill: Paint = soft ? {lin: [[0, nTop + 0.2], [0, nTop + 0.85]], stops: [[0, T.shade], [1, mixLab(T.shade, T.litBack, 0.26)]]} : T.shade;
  const neckRegs: Region[] = [];
  if (V.jawShadow && marks) neckRegs.push({segs: taper(segs(V.jawShadow, false), (t) => (man ? 0.07 : 0.055) * Math.pow(Math.sin(Math.PI * t), 0.8)), fill: T.deep, opacity: 0.5});
  parts.push({name: 'neck', segs: neckSegs, fill: neckFill, z: 50, regions: neckRegs});

  // ---- the head: the lit plane's gentle gradient, the terminator, the cheeks, the lips, the nose
  const outline = [...V.cranium, ...segs(V.face, false)];
  const lit: Paint = soft ? {lin: [[V.lm.faceX - 0.08, -0.1], [V.lm.faceX + 0.65, 0.15]], stops: [[0, T.litFront], [1, T.litBack]]} : T.lit;
  const regions: Region[] = [{segs: sideRegion(V.term, V.away), fill: T.shade}];
  if (marks) {
    if (soft && px >= 18)
      for (const c of V.cheeks) {
        regions.push({segs: ellipseSegs(c.c, c.rx * 1.25, c.ry * 1.25, c.a), fill: {rad: {c: c.c, rx: c.rx, ry: c.ry, a: c.a}, stops: [[0, T.glow, 0.46 * c.k], [0.55, T.glow, 0.2 * c.k], [1, T.glow, 0]]}});
      }
    if (px >= 18)
      for (const l of V.lips) {
        const lipC = man ? mixLab(T.lips, T.litFront, 0.62) : mixLab(T.lips, T.litFront, 0.3);
        regions.push({segs: closedOf(l.nodes), fill: soft ? {lin: l.fade, stops: [[0, lipC, 0.95], [0.55, lipC, 0.7], [1, lipC, 0]]} : lipC});
      }
    if (V.noseShade) {
      // the nose's near side, soft at the bridge and full under the tip (never a line up the nose)
      const ys = V.noseShade.map((q) => q.p[1]);
      const y0 = Math.min(...ys);
      const y1 = Math.max(...ys);
      regions.push({segs: closedOf(V.noseShade), fill: soft ? {lin: [[0, y0], [0, y1]], stops: [[0, T.shade, 0], [0.45, T.shade, 0.55], [0.75, T.shade, 1], [1, T.shade, 1]]} : T.shade});
    }
    if (V.under) regions.push({segs: sideRegion(V.under, [0, 1]), fill: T.shade});
    if (V.wing && px >= 18) regions.push({segs: stroke(V.wing), fill: T.shade, opacity: 0.85});
  }
  parts.push({name: 'head', segs: outline, fill: lit, z: 52, regions});

  // ---- the ear: one soft shape, lit, its bowl one deeper notch (from behind: one shape, its attached side shaded)
  if (V.ear && px >= 18) {
    const E = earMap(V.ear);
    const earOut = mapSegs(closedOf(EAR_OUT), E);
    const earRegs: Region[] = [];
    if (V.ear.back) {
      earRegs.push({segs: sideRegion([{p: E([-0.2, -0.6]), a: 90}, {p: E([-0.12, 0.0]), a: 92}, {p: E([-0.2, 0.62]), a: 95}], [1, 0]), fill: T.shade});
    } else {
      earRegs.push({segs: sideRegion([{p: E([0.36, -0.6]), a: 95}, {p: E([0.3, 0.0]), a: 100}, {p: E([0.1, 0.62]), a: 120}], [1, 0.2]), fill: mixLab(T.shade, T.glow, 0.15), opacity: 0.9});
      if (detail) earRegs.push({segs: mapSegs(closedOf(EAR_IN), E), fill: T.earIn});
    }
    parts.push({
      name: 'ear',
      segs: earOut,
      fill: soft ? {lin: [E([-0.5, 0]), E([0.5, 0])], stops: [[0, mixLab(T.litFront, T.glow, 0.12)], [1, mixLab(T.litBack, T.glow, 0.16)]]} : T.lit,
      z: 53.2,
      regions: earRegs,
    });
  }

  // ---- the eyes: the closed lash (default) or the open eye looking away; the brow
  if (px >= 18) {
    if (eyes === 'lash') {
      V.lashes.forEach((s, i) => parts.push({name: `lash${i}`, segs: stroke(s), fill: T.lash, z: 53.5, free: true}));
    } else {
      V.open.forEach((e, i) => {
        if (e.white.length) {
          parts.push({
            name: `eye${i}`,
            segs: closedOf(e.white),
            fill: T.white,
            z: 53.3,
            regions: [
              {segs: ellipseSegs(e.iris.c, e.iris.rx, e.iris.ry), fill: T.iris},
              {segs: ellipseSegs([e.iris.c[0] - e.iris.rx * 0.32, e.iris.c[1] - e.iris.ry * 0.38], e.iris.rx * 0.3, e.iris.rx * 0.3), fill: T.white, opacity: 0.85},
            ],
          });
        }
        parts.push({name: `lid${i}`, segs: stroke(e.lid), fill: T.lash, z: 53.5, free: true});
      });
    }
    if (brow) V.brows.forEach((s, i) => parts.push({name: `brow${i}`, segs: stroke(s), fill: T.brow, z: 53.4, free: true}));
  }
  return parts;
}

// ---------------------------------------------------------------- the API
/** One head: its frame (head units, the kept cranium, the landmarks) and its face parts (head units). */
export function head(sex: Sex, view: FaceView, o: HeadOptsV4): HeadV4 {
  const V = DESIGNS[sex][view];
  const T = faceTones(o.skin, o.hair);
  return {
    headFrame: {units: 'head', crown: -0.5, chin: 0.5, view, yaw: V.yaw, cranium: V.cranium, outline: [...V.cranium, ...segs(V.face, false)], lm: V.lm},
    faceParts: viewParts(sex, V, T, o),
  };
}

/** The head's parts on a figure: m = the head's similarity (centre, the skull's size in px or figure units, roll;
 *  mirror for a figure facing screen-right). */
export const placeHead = (h: HeadV4, m: Sim): PartV4[] => h.faceParts.map((p) => mapPart(p, m));

/** Which drawn view a yaw uses (the turnaround's switch points; each held >= 0.3 s in motion: PEOPLE_DESIGN 5.3). */
export function viewOfYaw(yaw: number): {view: FaceView; mirror: boolean} {
  const a = ((((yaw + 180) % 360) + 360) % 360) - 180;
  const mirror = a > 0;
  const m = Math.abs(a);
  return {view: m < 63 ? 'q' : m < 114 ? 'p' : 'l', mirror};
}
