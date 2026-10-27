// Pip.tsx — draws "towpath Pip" (TREATMENT section 3, K5). One component, raw SVG (place it inside any <svg> / World
// layer). Feet anchor (x, y) = the middle of its seat; `size` = px from the seat to the top of its head (44-120).
//
//   <Pip x={700} y={1235} size={96} />                                   // the watcher on a bollard, idle life on
//   <Pip x={700} y={1235} pose="earsCover" facing="back" target={[510, 1010]} />
//   <Pip x={h.x} y={h.y} pose={...} squash={h.squash} rotate={h.rotate} />   // with hopAt() (motion.ts)
//   <Pip ... draw={drawOn(t, 0.2)} />  <Pip ... exit={useExit()} />          // draw-on / un-build (no opacity)
//
// THE LINE: the silhouette (body, head, ears, trunk, legs, scarf band) is traced as ONE loose continuous stroke, a
// tapered brush ~3.4 px on screen, with 2-3 gaps: the top of the head (the tuft sprouts through it), the base (where
// it sits) and the screen-right ear root. Interior lines only where a part lies over another (an ear over the head,
// the trunk over the face, a leg over the belly); marks for the leaf midrib, the knit ribs, the tuft. Flat fills sit
// 3 px right / 2 px down of the line (2 px at 44 px). Ink stays the same width on screen at every size.

import React from 'react';
import {Seed} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {exitFillProgress, exitInkProgress, useExit, useLook} from '../../../lib/exit';
import {useInkScale} from '../../../lib/inkComp';
import {brushPath, centroid, clamp, cutGaps, dist, inPoly, lerp, nearestIndex, polyPath, resample, signedArea, smooth, traceUnion, V2} from './geom';
import {buildPip, MODEL_H, Part, PipGeom, PoseParams} from './model';
import {applyIdle, IdleOpts} from './idle';
import {FACING, FacingName, PoseName, poseParams} from './poses';
import {aimAt} from './motion';
import {PIP_INK, pipFill} from './colours';

export type PipPaint = 'colour' | 'paper' | 'look';

export type PipProps = {
  /** Feet anchor (screen px): the middle of the seat. */
  x: number;
  y: number;
  /** Px from the seat to the top of the head (the tuft adds ~10 %). 44-120; default 96. */
  size?: number;
  pose?: PoseName | Partial<PoseParams>;
  /** Raw parameter overrides on top of the pose. */
  params?: Partial<PoseParams>;
  /** Body facing: a name (FACING) or degrees. Default the pose's (the 3/4 back watcher). */
  facing?: FacingName | number;
  /** Head turn / pitch (added to the pose's). */
  look?: number;
  lookUp?: number;
  /** The head follows this screen point (overrides look / lookUp); `targetWeight` 0..1 blends it in. */
  target?: V2;
  targetWeight?: number;
  /** Wind on screen (-1 toward left .. +1 toward right) for the scarf tails and the tuft. */
  wind?: number;
  /** Seconds (default useTime()). */
  t?: number;
  seed?: Seed;
  /** Idle life: 0..1 or options. Default 1. */
  idle?: number | IdleOpts;
  /** + squash / - stretch about the feet; degrees about the feet. */
  squash?: number;
  rotate?: number;
  /** 0..1 draw-on (pen first, fills grow 20 % -> 100 %). Default 1. */
  draw?: number;
  /** 0..1 un-build (fills shrink, then the ink retracts). Default: the engine's useExit(). */
  exit?: number;
  /** 'colour' (default: Pip keeps its colour even on frame 0's bare-ink page), 'paper' (ink on paper), 'look' (follow
   *  the enclosing <Look>: paper / cascade / none). */
  paint?: PipPaint;
  /** Contour weight override (px on screen). Default 3.4 at >= 80 px, down to 2.3 at 44 px. */
  inkPx?: number;
};

/** Resolve the pose parameters of a Pip at time t (pose + facing + look + target + idle). Exported for tracks. */
export function resolveParams(p: PipProps, t: number, headScreen?: V2): PoseParams {
  let q = poseParams(p.pose ?? 'sit', p.params ?? {});
  if (p.facing !== undefined) q.yaw = typeof p.facing === 'number' ? p.facing : FACING[p.facing];
  if (p.wind !== undefined) q.wind = p.wind;
  q.look += p.look ?? 0;
  q.lookUp += p.lookUp ?? 0;
  if (p.target) {
    const size = p.size ?? 96;
    const head: V2 = headScreen ?? [p.x, p.y - size * 0.74];
    const a = aimAt(head, p.target);
    const w = clamp(p.targetWeight ?? 1);
    q.look = lerp(q.look, a.look, w);
    // turned to the camera (toCam) the target no longer lifts the head; its look still picks the side
    q.lookUp = lerp(q.lookUp, a.lookUp, w * (1 - clamp(q.toCam)));
  }
  const idle = p.idle ?? 1;
  q = applyIdle(q, t, p.seed ?? 'pip', typeof idle === 'number' ? {amount: idle} : idle);
  return q;
}

export const Pip: React.FC<PipProps> = (props) => {
  const tNow = useTime();
  const ctxExit = useExit();
  const look = useLook();
  const inkScale = useInkScale();
  const t = props.t ?? tNow;
  const params = resolveParams(props, t);
  let paint: 'colour' | 'paper' | 'none' = 'colour';
  if (props.paint === 'paper') paint = 'paper';
  else if (props.paint === 'look') {
    if (look.fills === 'paper') paint = 'paper';
    else if (look.fills === 'none') paint = 'none';
    else if (look.cascade) {
      const c = look.cascade;
      if (t < c.at + Math.hypot(props.x - c.origin[0], props.y - c.origin[1]) / (c.speed ?? 2600)) paint = 'paper';
    }
  }
  return (
    <PipDrawing
      x={props.x}
      y={props.y}
      size={props.size ?? 96}
      params={params}
      squash={props.squash ?? 0}
      rotate={props.rotate ?? 0}
      draw={props.draw ?? 1}
      exit={props.exit ?? ctxExit}
      paint={paint}
      inkPx={(props.inkPx ?? defaultInk(props.size ?? 96)) * inkScale}
      seed={props.seed ?? 'pip'}
      drawInk={look.ink}
    />
  );
};

export const defaultInk = (size: number) => lerp(2.3, 3.4, clamp((size - 44) / 40));

// ---------------------------------------------------------------- the drawing (pure: params in, SVG out)

export type PipDrawingProps = {
  x: number;
  y: number;
  size: number;
  params: PoseParams;
  squash?: number;
  rotate?: number;
  draw?: number;
  exit?: number;
  paint?: 'colour' | 'paper' | 'none';
  inkPx?: number;
  seed?: Seed;
  drawInk?: boolean;
  /** Design studies only: force the body / head yaw (degrees). */
  yaws?: {body: number; head: number};
};

const OPAQUE = new Set(['body', 'shade', 'scarf']);

export const PipDrawing: React.FC<PipDrawingProps> = ({x, y, size, params, squash = 0, rotate = 0, draw = 1, exit = 0, paint = 'colour', inkPx, seed = 'pip', drawInk = true, yaws}) => {
  if (draw <= 0 || exit >= 1) return null;
  const out = drawPip({x, y, size, params, squash, rotate, draw, exit, paint, inkPx: inkPx ?? defaultInk(size), seed: String(seed), drawInk, yaws});
  return <g>{out}</g>;
};

type DrawArgs = Required<Omit<PipDrawingProps, 'seed' | 'yaws'>> & {seed: string; yaws?: {body: number; head: number}};

function hashSeed(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return ((h >>> 0) % 10000) / 10000;
}

function drawPip(a: DrawArgs): React.ReactNode[] {
  const {x, y, size, params, draw, exit, paint, inkPx, seed, drawInk} = a;
  const lod: 0 | 1 = size < 58 ? 0 : 1;
  const g: PipGeom = buildPip(params, {lod, px: size, yaws: a.yaws});
  const s = size / MODEL_H;
  const sq = clamp(a.squash, -0.5, 0.6);
  const sx = 1 + sq * 0.55;
  const sy = 1 - sq;
  const rr = (a.rotate * Math.PI) / 180;
  const cr = Math.cos(rr);
  const sr = Math.sin(rr);
  const M = (p: V2): V2 => {
    const px = p[0] * s * sx;
    const py = p[1] * s * sy;
    return [x + px * cr - py * sr, y + px * sr + py * cr];
  };
  const Minv = (q: V2): V2 => {
    const dx = q[0] - x;
    const dy = q[1] - y;
    const px = dx * cr + dy * sr;
    const py = -dx * sr + dy * cr;
    return [px / (s * sx), py / (s * sy)];
  };
  const parts = g.parts;
  const unionParts = parts.filter((p) => p.union);
  const opaque = parts.filter((p) => p.fill && OPAQUE.has(p.fill));
  const insideUnion = (px: number, py: number) => {
    for (const p of unionParts) if (p.shape.inside(px, py)) return true;
    return false;
  };
  /** Is model point q hidden for a line on `layer` of `group`? (an opaque part above it, of another group) */
  const hiddenAt = (q: V2, layer: number, group: string, self?: Part) => {
    for (const p of opaque) {
      if (p === self || p.layer <= layer) continue;
      if (p.group === group && self === undefined) continue;
      if (p.shape.inside(q[0], q[1])) return true;
    }
    return false;
  };

  // ---------------- the ONE stroke: the union silhouette
  const stepPx = size < 60 ? 0.8 : 1.05;
  const stepModel = stepPx / (s * Math.min(sx, sy));
  const loopsM = traceUnion(insideUnion, g.box, stepModel);
  const loopM = loopsM[0] || [];
  const nodes: React.ReactNode[] = [];
  const ink = PIP_INK;
  const wC = inkPx;
  const sd = hashSeed(seed);

  // owner layer of each silhouette point (the topmost union part just inside it) -> hidden by tails in front
  const loopS: V2[] = loopM.map(M);
  // hand wobble: a slow seeded offset along the normal, keyed to the angle round the centre (static per seed)
  const cM = M([(g.box[0] + g.box[2]) / 2, (g.box[1] + g.box[3]) / 2]);
  const wob = 0.45 * (size / 96);
  const n = loopS.length;
  const wobbled: V2[] = loopS.map((p, i) => {
    const a0 = loopS[(i - 1 + n) % n];
    const a1 = loopS[(i + 1) % n];
    let tx = a1[0] - a0[0];
    let ty = a1[1] - a0[1];
    const l = Math.hypot(tx, ty) || 1;
    tx /= l;
    ty /= l;
    const ang = Math.atan2(p[1] - cM[1], p[0] - cM[0]);
    const o = wob * (0.6 * Math.sin(3 * ang + sd * 6.28) + 0.4 * Math.sin(5 * ang + sd * 17));
    return [p[0] - ty * o, p[1] + tx * o];
  });
  // the gaps
  const headTopS = M(g.headTop);
  const baseS = M(g.base);
  const gaps: [number, number][] = [];
  const headW = 54 * s;
  if (n > 8) {
    gaps.push([nearestIndex(wobbled, headTopS), Math.max(2.4, headW * 0.07)]);
    const bi = nearestIndex(wobbled, baseS);
    const seated = dist(wobbled[bi], baseS) < 6 * s;
    const bodyW = 70 * s;
    gaps.push([bi, seated ? bodyW * 0.16 : bodyW * 0.07]);
    if (lod) gaps.push([nearestIndex(wobbled, M(g.earRootRight)), Math.max(1.6, headW * 0.035)]);
  }
  const contourPieces = n > 8 ? cutGaps(wobbled, gaps) : [];
  // split further where a part in front (a scarf tail, the tail) covers the silhouette
  const nonUnionFront = parts.filter((p) => !p.union && p.fill && OPAQUE.has(p.fill));
  const ownerLayer = (qS: V2, tS: V2): number => {
    const l = Math.hypot(tS[0], tS[1]) || 1;
    const nx = -tS[1] / l;
    const ny = tS[0] / l;
    let best = -Infinity;
    for (const sgn of [1, -1]) {
      const q = Minv([qS[0] + nx * 1.2 * sgn, qS[1] + ny * 1.2 * sgn]);
      for (const p of unionParts) if (p.layer > best && p.shape.inside(q[0], q[1])) best = p.layer;
    }
    return best;
  };
  const splitHidden = (pts: V2[], hidden: (p: V2, i: number) => boolean, minLen: number): V2[][] => {
    const runs: V2[][] = [];
    let cur: V2[] = [];
    pts.forEach((p, i) => {
      if (hidden(p, i)) {
        if (cur.length > 1) runs.push(cur);
        cur = [];
      } else cur.push(p);
    });
    if (cur.length > 1) runs.push(cur);
    return runs.filter((r) => polyLen(r) >= minLen);
  };
  const strokes: {pts: V2[]; w: number; phase: number; order: number}[] = [];
  contourPieces.forEach((piece, k) => {
    const runs = nonUnionFront.length
      ? splitHidden(piece, (p, i) => {
          const q = Minv(p);
          const tS: V2 = [piece[Math.min(piece.length - 1, i + 1)][0] - piece[Math.max(0, i - 1)][0], piece[Math.min(piece.length - 1, i + 1)][1] - piece[Math.max(0, i - 1)][1]];
          const own = ownerLayer(p, tS);
          for (const f of nonUnionFront) if (f.layer > own && f.shape.inside(q[0], q[1])) return true;
          return false;
        }, 2)
      : [piece];
    for (const r of runs) strokes.push({pts: r, w: wC, phase: sd * 6 + k, order: 0});
  });

  // islands (a raised trunk tip beyond the head) and holes (inside the trunk's curl): their own closed lines
  for (let i = 1; i < loopsM.length; i++) {
    const L = loopsM[i];
    if (Math.abs(signedArea(L)) * s * s < 10) continue;
    const pts = L.map(M);
    const c = centroid(L);
    const hole = inPoly(c[0], c[1], loopM);
    if (hole) strokes.push({pts: [...pts, pts[0]], w: wC * 0.74, phase: sd * 7 + i, order: 1});
    else {
      let top = 0;
      for (let k = 1; k < pts.length; k++) if (pts[k][1] < pts[top][1]) top = k;
      for (const piece of cutGaps(pts, [[top, Math.max(1.5, 3 * s)]])) strokes.push({pts: piece, w: wC, phase: sd * 7 + i, order: 0});
    }
  }

  // ---------------- interior lines: a part's outline where it lies over a lower part (and nothing covers it)
  for (const p of parts) {
    if (!p.lines || !p.union) continue;
    const ol = resample([...p.shape.outline, p.shape.outline[0]], Math.max(0.5, 0.9 / s));
    const lower = unionParts.filter((q) => q.group !== p.group && q.layer < p.layer);
    const runs = splitHidden(
      ol,
      (q) => {
        let over = false;
        for (const lo of lower) if (lo.shape.inside(q[0], q[1])) {
          over = true;
          break;
        }
        if (!over) return true;
        return hiddenAt(q, p.layer, p.group);
      },
      3 / s,
    );
    for (const r of runs) {
      const rs = trimEnds(r.map(M), 0.9);
      if (rs.length > 1) strokes.push({pts: rs, w: wC * 0.74, phase: sd * 9 + p.layer, order: 1});
    }
  }
  // ---------------- own outlines (scarf tails, knot, tail): thin, hidden under what is in front
  for (const p of parts) {
    if (!p.ownOutline) continue;
    const ol = resample([...p.shape.outline, p.shape.outline[0]], Math.max(0.5, 0.9 / s));
    const runs = splitHidden(ol, (q) => hiddenAt(q, p.layer, p.group, p), 2.5 / s);
    for (const r of runs) strokes.push({pts: r.map(M), w: wC * 0.62, phase: sd * 3 + p.layer, order: 1});
  }
  // ---------------- marks: midribs, ribs, tuft, fringe, the tail tip
  for (const m of g.marks) {
    if (lod === 0 && (m.kind === 'rib' || m.kind === 'fringe')) continue;
    const pts = resample(m.pts, Math.max(0.4, 0.8 / s));
    const runs = splitHidden(pts, (q) => hiddenAt(q, m.layer, m.group), 1.6 / s);
    for (const r of runs) strokes.push({pts: r.map(M), w: wC * m.w, phase: sd * 5 + m.layer, order: m.kind === 'tuft' ? 2 : 1});
  }

  // ---------------- fills (layer order), misregistered
  const off: V2 = size >= 80 ? [3, 2] : [lerp(2, 3, clamp((size - 44) / 36)), lerp(1.5, 2, clamp((size - 44) / 36))];
  const fills = parts.filter((p) => p.fill).sort((p, q) => p.layer - q.layer);
  // build / un-build scales per fill class
  const easeOut = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
  const grow = (from: number, span: number) => (draw >= 1 ? 1 : draw < from ? 0 : 0.2 + 0.8 * easeOut((draw - from) / span));
  const shrink = (jit: number, sz: number) => (exit <= 0 ? 1 : 1 - Math.pow(exitFillProgress(exit, jit, sz), 3));
  // the pen goes round first; the body fill lands once ~60 % of the contour is down, the scarf and the decals after
  const kCore = Math.min(grow(0.33, 0.22), shrink(0.55, 0.14));
  const kScarf = Math.min(grow(0.56, 0.2), shrink(0.25, 0.06));
  const kDecal = Math.min(grow(0.7, 0.18), shrink(0.05, 0.02));
  const classOf = (p: Part) => (p.fill === 'scarf' ? 'scarf' : p.fill === 'body' || p.fill === 'shade' ? 'core' : 'decal');
  const centreOf = (cls: string): V2 => {
    if (cls === 'scarf') {
      const sc = parts.find((p) => p.id === 'scarf');
      if (sc) return M([(sc.shape.box[0] + sc.shape.box[2]) / 2, (sc.shape.box[1] + sc.shape.box[3]) / 2]);
    }
    return cM;
  };
  if (paint !== 'none') {
    const groups: Record<string, React.ReactNode[]> = {core: [], scarf: [], decal: []};
    const order: string[] = [];
    fills.forEach((p, i) => {
      const cls = classOf(p);
      const k = cls === 'core' ? kCore : cls === 'scarf' ? kScarf : kDecal;
      if (k <= 0.001) return;
      const colour = paint === 'paper' ? (p.fill === 'eye' ? ink : pipFill('paper')) : p.fillMix ? mixHex(pipFill(p.fill!), pipFill('shade'), p.fillMix) : pipFill(p.fill!);
      if (paint === 'paper' && (p.fill === 'inner' || p.fill === 'sole' || p.fill === 'cheek' || p.fill === 'glint')) return;
      const d = polyPath(p.shape.outline.map((q) => {
        const m = M(q);
        return [m[0] + off[0], m[1] + off[1]] as V2;
      }));
      const node = <path key={`f${i}`} d={d} fill={colour} />;
      // keep strict layer order: consecutive fills of a class share one transform group
      const last = order[order.length - 1];
      if (last !== cls) order.push(cls);
      const key = `${cls}#${order.length}`;
      (groups[key] = groups[key] || []).push(node);
      void groups;
    });
    order.forEach((cls, i) => {
      const key = `${cls}#${i + 1}`;
      const kids = groups[key];
      if (!kids || !kids.length) return;
      const k = cls === 'core' ? kCore : cls === 'scarf' ? kScarf : kDecal;
      if (k >= 0.999) nodes.push(<g key={`g${i}`}>{kids}</g>);
      else {
        const c = centreOf(cls);
        nodes.push(
          <g key={`g${i}`} transform={`translate(${c[0].toFixed(2)} ${c[1].toFixed(2)}) scale(${k.toFixed(4)}) translate(${(-c[0]).toFixed(2)} ${(-c[1]).toFixed(2)})`}>
            {kids}
          </g>,
        );
      }
    });
  }

  // ---------------- ink: draw-on (the contour first, then the rest), retract on exit
  if (drawInk) {
    const retract = exit > 0 ? exitInkProgress(exit, 0.5) : 0;
    const ord0 = strokes.filter((st) => st.order === 0);
    const Ltot = ord0.reduce((acc, st) => acc + polyLen(st.pts), 0) || 1;
    const pC = draw >= 1 ? 1 : clamp(draw / 0.55);
    const pL = draw >= 1 ? 1 : clamp((draw - 0.4) / 0.4);
    let before = 0;
    let dInk = '';
    strokes.forEach((st) => {
      const L = polyLen(st.pts);
      let upto = L;
      if (st.order === 0) {
        upto = pC * Ltot - before;
        before += L;
      } else upto = pL * L;
      if (upto <= 0.3) return;
      const from = retract > 0 ? smooth(retract) * L : 0;
      const dd = brushPath(st.pts, {w: st.w, phase: st.phase, swell: 0.1, pressIn: Math.min(5, L * 0.2), release: Math.min(12, L * 0.3)}, from, upto);
      if (dd) dInk += dd;
    });
    if (dInk) nodes.push(<path key="ink" d={dInk} fill={ink} />);
  }
  return nodes;
}

/** Linear mix of two hex colours (a colour value, never a transparency). */
function mixHex(a: string, b: string, k: number): string {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(v + (pb[i] - v) * clamp(k)));
  return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
}

function polyLen(p: V2[]): number {
  let L = 0;
  for (let i = 1; i < p.length; i++) L += dist(p[i - 1], p[i]);
  return L;
}

/** Trim `px` off both ends of an open polyline (interior lines stop short of the contour: the loose hand). */
function trimEnds(p: V2[], px: number): V2[] {
  const L = polyLen(p);
  if (L <= px * 2 + 0.5) return [];
  const out: V2[] = [];
  let acc = 0;
  for (let i = 0; i < p.length; i++) {
    if (i > 0) acc += dist(p[i - 1], p[i]);
    if (acc >= px && acc <= L - px) out.push(p[i]);
  }
  return out;
}
