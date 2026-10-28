// V2S3_ndress.tsx (lane L3, V2S3 NEAR helper; WORLD px at the 12.98 match, inside V2S3's camera): the THINGS on our
// towpath (conform_L3 §1: things, never people's backs): a towpath bench seen from behind with a bag left on it, a
// cast-iron mooring bollard on our coping with the boat's rope round its neck (V2S3_nground draws the rope), the fallen
// leaves (V2S3_nground) and the near lamp foot held from S2 (V2S3_nground). The old dressing (logs, a coal sack,
// wellies, a bay tree, a robin, pigeons) is thinned out: the near plane gets value range, not prop count (CRAFT §f
// "Failures"). Laid out in metres from the shot's one camera (V2S3_depth S3_CAM), so each thing has its size at its
// distance (nothing nearer smaller per metre: the bench ~225 px/m, the bollard ~160 px/m, the boat ~150, the terrace
// ~85). Flat shapes, tier C; their contact and cast shadows (RIG_CANAL: right and a little toward us) and form shades
// (the side away from the low western sun) are drawn here as the rig's tint family. Our plane (-2): one value step
// darker (V2S3_depth planeBatch).
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {seamTone} from '../../lib/depth';
import {CastShadow, ContactShadow, FormShade, ShadowLayer} from '../../lib/light';
import {Batch, Paint, P, ovalPath} from '../kit/canal/core';
import type {Pt} from '../kit/canal/core';
import {S3_CAM, onPlane, planeBatch} from './V2S3_depth';

const cam = S3_CAM;
/** The near iron (the bench's end frames, the bollard): a mid plum, dark but never near-black (her plum silhouette is
 *  the darkest, clearest shape in the frame). */
const IRON = CM.coatPlum;
const PLANE = -2;

/** The bench (metres): its long axis along the canal, its back toward us; x from -2.0 to -0.2 m, the back legs at
 *  z 6.2 m, the front legs at 6.75 m; the backrest 0.48-0.86 m, the seat at 0.45 m. */
export const BENCH = {x0: -2.0, x1: -0.2, zBack: 6.2, zFront: 6.75, seat: 0.45, back0: 0.5, back1: 0.86} as const;
/** The bag left on the seat near its right end (a tote whose handles show over the backrest). */
const BAG = {x: -0.62, z: 6.45, w: 0.36, h: 0.5} as const;
/** The mooring bollard on our coping (metres): the boat's rope is tied round its neck. */
export const BOLLARD = {x: -2.15, z: 8.78, h: 0.55, w: 0.32} as const;

/** Screen point of a world point (metres). */
const pt = (x: number, z: number, level = 0): Pt => cam.pt(x, z, level);

/** The bench seen from behind: the iron end frames (rear legs, arms), the three back slats, the seat's front edge seen
 *  through the slats' gaps, the bag on the seat. */
/** A polygon with its corners rounded (each cut back `d` px along both edges, at most a third of the edge): cast iron
 *  is cast round, and a sharp dark corner reads as a tick. */
function roundPoly(pts: Pt[], d = 6): string {
  const n = pts.length;
  const cut = (a: Pt, b: Pt): Pt => {
    const l = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const k = Math.min(d, l / 3) / l;
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  let s = '';
  for (let i = 0; i < n; i++) {
    const v = pts[i];
    const a = cut(v, pts[(i + n - 1) % n]);
    const c = cut(v, pts[(i + 1) % n]);
    s += `${i ? 'L' : 'M'}${P(a[0], a[1])}Q${P(v[0], v[1])} ${P(c[0], c[1])}`;
  }
  return s + 'Z';
}

function benchBatch(): Batch {
  const b = new Batch();
  const {x0, x1, zBack, zFront, seat, back0, back1} = BENCH;
  const wood = CM.line;
  const woodLit = seamTone(CM.line, -8);
  // the seat (its planks, seen in the gaps between the back slats: the far edge one step lighter, it faces the sky)
  b.poly(woodLit, [pt(x0 + 0.04, zFront, seat), pt(x1 - 0.04, zFront, seat), pt(x1 - 0.04, zBack, seat), pt(x0 + 0.04, zBack, seat)]);
  b.layer();
  // the bag on the seat (a canvas tote: body, a darker band, the handles' loop over the top)
  const [bx, by] = pt(BAG.x, BAG.z, seat);
  const s = cam.pxPerM(pt(BAG.x, BAG.z, 0)[1]);
  const bw = BAG.w * s;
  const bh = BAG.h * s;
  b.poly(CM.coatMustard, [[bx - bw * 0.5, by], [bx + bw * 0.5, by], [bx + bw * 0.44, by - bh * 0.72], [bx - bw * 0.44, by - bh * 0.72]]);
  b.rect(seamTone(CM.coatMustard, 10), bx - bw * 0.47, by - bh * 0.28, bw * 0.94, bh * 0.08);
  const hy = by - bh * 0.72;
  b.fill(seamTone(CM.coatMustard, 7), `M${P(bx - bw * 0.3, hy)}Q${P(bx - bw * 0.26, hy - bh * 0.34)} ${P(bx, hy - bh * 0.34)}Q${P(bx + bw * 0.26, hy - bh * 0.34)} ${P(bx + bw * 0.3, hy)}L${P(bx + bw * 0.2, hy)}Q${P(bx + bw * 0.18, hy - bh * 0.24)} ${P(bx, hy - bh * 0.24)}Q${P(bx - bw * 0.18, hy - bh * 0.24)} ${P(bx - bw * 0.2, hy)}Z`);
  b.layer();
  // the back slats (three planks across, a gap between each), on the rear frame
  for (let k = 0; k < 3; k++) {
    const l0 = back0 + ((back1 - back0) * k) / 3 + 0.015;
    const l1 = back0 + ((back1 - back0) * (k + 1)) / 3 - 0.015;
    b.poly(wood, [pt(x0, zBack, l1), pt(x1, zBack, l1), pt(x1, zBack, l0), pt(x0, zBack, l0)]);
  }
  // the iron end frames: a rear leg up to the back's top, an arm forward at seat height, a front leg
  for (const ex of [x0 + 0.03, x1 - 0.03]) {
    const w = 0.05;
    b.fill(IRON, roundPoly([pt(ex - w, zBack, back1 + 0.02), pt(ex + w, zBack, back1 + 0.02), pt(ex + w, zBack, 0), pt(ex - w, zBack, 0)]));
    b.fill(IRON, roundPoly([pt(ex - w, zBack, seat + 0.2), pt(ex - w, zFront, seat + 0.2), pt(ex - w, zFront, seat + 0.15), pt(ex - w, zBack, seat + 0.15)]));
    b.fill(IRON, roundPoly([pt(ex - w * 0.8, zFront, seat + 0.18), pt(ex + w * 0.8, zFront, seat + 0.18), pt(ex + w * 0.8, zFront, 0), pt(ex - w * 0.8, zFront, 0)]));
  }
  return planeBatch(b, PLANE);
}

/** The bollard (a cast-iron mooring post on the coping): its silhouette path. */
function bollardD(): string {
  const {x, z, h, w} = BOLLARD;
  const [cx, base] = pt(x, z, 0);
  const s = cam.pxPerM(base);
  const W = w * s;
  const H = h * s;
  return `M${P(cx - W * 0.46, base)}L${P(cx - W * 0.33, base - H * 0.55)}L${P(cx - W * 0.46, base - H * 0.8)}Q${P(cx, base - H * 1.04)} ${P(cx + W * 0.46, base - H * 0.8)}L${P(cx + W * 0.33, base - H * 0.55)}L${P(cx + W * 0.46, base)}Z`;
}
/** Where the rope sits round the bollard's neck (screen px). */
export const bollardNeck = (): Pt => {
  const [cx, base] = pt(BOLLARD.x, BOLLARD.z, 0);
  return [cx, base - BOLLARD.h * cam.pxPerM(base) * 0.6];
};

function bollardBatch(): Batch {
  const b = new Batch();
  b.fill(IRON, bollardD());
  return planeBatch(b, PLANE);
}

/** The bench's footprints (screen, at the feet) for its contact shadows. */
const benchFeet = (): {x: number; y: number; w: number}[] => {
  const out: {x: number; y: number; w: number}[] = [];
  for (const ex of [BENCH.x0 + 0.03, BENCH.x1 - 0.03]) {
    for (const z of [BENCH.zBack, BENCH.zFront]) {
      const [x, y] = pt(ex, z, 0);
      out.push({x, y, w: 0.14 * cam.pxPerM(y)});
    }
  }
  return out;
};

export const S3Dress: React.FC = () => {
  const bench = useMemo(benchBatch, []);
  const bollard = useMemo(bollardBatch, []);
  const feet = useMemo(benchFeet, []);
  const [bcx, bcy] = pt((BENCH.x0 + BENCH.x1) / 2, BENCH.zBack, 0);
  const benchH = BENCH.back1 * cam.pxPerM(bcy);
  const benchW = (BENCH.x1 - BENCH.x0) * cam.pxPerM(bcy);
  const [ox, oy] = pt(BOLLARD.x, BOLLARD.z, 0);
  const oS = cam.pxPerM(oy);
  void onPlane;
  void ovalPath;
  return (
    <>
      {/* shadows on our paving and coping first (under the things): the bench's long cast to the right, its feet; the
          bollard's (CRAFT §d.5-§d.6) */}
      <ShadowLayer>
        <CastShadow x={bcx} y={bcy} w={benchW} depth={10} h={benchH} />
        {feet.map((f, i) => (
          <ContactShadow key={i} x={f.x} y={f.y} w={f.w} h={7} />
        ))}
        <ContactShadow x={ox} y={oy} w={BOLLARD.w * oS} h={7} />
        <CastShadow x={ox} y={oy} w={BOLLARD.w * oS * 0.9} depth={6} h={BOLLARD.h * oS} />
      </ShadowLayer>
      <Paint b={bench} seed="s3nBench" misreg={false} />
      <Paint b={bollard} seed="s3nBollard" misreg={false} />
      <FormShade d={bollardD()} kind="crescent" />
    </>
  );
};
