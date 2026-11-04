// elements.tsx: one board element at its tier and plane (src/lib/g3/board.ts), with its entrance, moves, draw-on /
// un-draw, pen tip and rig shadow. The shot's composition (set drawing + panel drawing, camera, marks on top) is
// SketchReel's ShotView.

import React from 'react';
import {getLength, getPointAtLength} from '@remotion/paths';
import {captionFontStack} from '../font';
import {arrow, boardLoop, boardPen, ellipse, line, poly, rect, scribbleMass, smooth, type Pt} from '../sketch';
import {AmbientView} from './ambient';
import {BOARD, shadowTone, stepL, type Weight} from './board';
import {POSES, SMEAR, figureLayers, smearTf, type Layer} from './figure';
import {drawProgress, easeOf, keyed, moveU, progress} from './motion';
import {SketchIcon, ICON_ASPECT, type IconName} from './SketchIcons';
import type {Box, El, Fill, Move, Rig, VP} from './types';

// ------------------------------------------------------------------ path lengths (memoised: d strings repeat per frame)
const LEN = new Map<string, number[]>();
const subpaths = (d: string) => d.split(/(?=M)/).filter((x) => x.trim());
function subLens(d: string): number[] {
  let v = LEN.get(d);
  if (!v) {
    v = subpaths(d).map((sp) => {
      try {
        return Math.max(0.01, getLength(sp));
      } catch {
        return 1;
      }
    });
    if (LEN.size > 20000) LEN.clear();
    LEN.set(d, v);
  }
  return v;
}

/** The point the pen is at when a fraction u of the path is drawn (subpaths in order, by length). */
export function frontOf(d: string, u: number): Pt | null {
  const subs = subpaths(d);
  if (!subs.length) return null;
  const lens = subLens(d);
  const total = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  for (let k = 0; k < subs.length; k++) {
    if (u * total <= acc + lens[k] || k === subs.length - 1) {
      const v = Math.max(0, Math.min(lens[k], u * total - acc));
      try {
        const p = getPointAtLength(subs[k], v);
        return p ? [p.x, p.y] : null;
      } catch {
        return null;
      }
    }
    acc += lens[k];
  }
  return null;
}

/** A pencil path whose strokes (subpaths) draw on one after another; byLength = at one speed along the whole length
 *  (a line, a pipe), else each stroke an equal share (an icon drawn stroke by stroke, as v3). */
export const Pen: React.FC<{d: string; u: number; style: React.SVGProps<SVGPathElement>; byLength?: boolean}> = ({d, u, style, byLength}) => {
  if (u >= 1) return <path d={d} {...style} />;
  if (u <= 0) return null;
  const subs = subpaths(d);
  const lens = byLength ? subLens(d) : subs.map(() => 1);
  const total = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  return (
    <>
      {subs.map((sp, k) => {
        const start = acc / total;
        const span = lens[k] / total;
        acc += lens[k];
        const v = Math.max(0, Math.min(1, (u - start) / span));
        return v <= 0 ? null : <path key={k} d={sp} {...style} pathLength={1} strokeDasharray={v >= 1 ? undefined : 1} strokeDashoffset={v >= 1 ? undefined : 1 - v} />;
      })}
    </>
  );
};

/** Figure strokes in layers (fill, then line), drawn on one subpath after another across all layers. */
export const Layers: React.FC<{layers: Layer[]; u: number; fillO: number}> = ({layers, u, fillO}) => {
  const subsOf = layers.map((l) => (l.d ? subpaths(l.d) : []));
  const total = Math.max(1, subsOf.reduce((n, x) => n + x.length, 0));
  let k = 0;
  return (
    <>
      {layers.map((l, li) => {
        const subs = subsOf[li];
        const k0 = k;
        k += subs.length;
        const paths = (c: string, w: number, tag: string) =>
          subs.map((sp, j) => {
            const v = u >= 1 ? 1 : Math.max(0, Math.min(1, u * total - (k0 + j)));
            if (v <= 0) return null;
            const st = {stroke: c, strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
            return v >= 1 ? <path key={tag + j} d={sp} {...st} /> : <path key={tag + j} d={sp} {...st} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - v} />;
          });
        return (
          <React.Fragment key={li}>
            {l.fill && l.fillD && fillO > 0 ? <path d={l.fillD} fill={l.fill} opacity={fillO} /> : null}
            {l.halo ? paths(BOARD.paper, l.w + 8, 'h') : null}
            {paths(l.c, l.w, 's')}
          </React.Fragment>
        );
      })}
    </>
  );
};

/** the pen tip riding a draw / undraw front: a nib with the pencil's body behind it */
export const PenTip: React.FC<{p: Pt}> = ({p}) => (
  <g>
    <path d={`M${p[0] + 8} ${p[1] - 12}L${p[0] + 52} ${p[1] - 74}`} stroke={BOARD.dark} strokeWidth={16} strokeLinecap="round" />
    <path d={`M${p[0]} ${p[1]}L${p[0] + 10} ${p[1] - 15}`} stroke={BOARD.ink} strokeWidth={9} strokeLinecap="round" />
    <circle cx={p[0]} cy={p[1]} r={6} fill={BOARD.ink} />
  </g>
);

/** text width in px in the caption hand (exact once the font is loaded; an estimate outside a browser) */
let measureCtx: CanvasRenderingContext2D | null | undefined;
function textWidth(s: string, size: number) {
  if (measureCtx === undefined) measureCtx = typeof document === 'undefined' ? null : document.createElement('canvas').getContext('2d');
  if (!measureCtx) return s.length * size * 0.5;
  measureCtx.font = `${size}px ${captionFontStack}`;
  return measureCtx.measureText(s).width;
}

type MarkEl = Extract<El, {t: 'mark'}>;
const MarkView: React.FC<{el: MarkEl; seed: string; u: number}> = ({el, seed, u}) => {
  const w = el.sw ?? 5;
  const st = {stroke: BOARD.red, strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const pen = {breaks: false, jitter: 0.5, drift: 0.2};
  const word = (x: number, y: number, anchor: 'start' | 'middle' | 'end') =>
    el.word ? <text x={x} y={y} fontSize={48} fill={BOARD.red} textAnchor={anchor} fontFamily={captionFontStack}>{el.word}</text> : null;
  if (el.kind === 'arrow') {
    const {x1, y1, x2, y2} = el;
    const l = Math.hypot(x2 - x1, y2 - y1) || 1;
    return (
      <>
        <Pen d={arrow(x1, y1, x2, y2, {seed, head: 34, ...pen})} u={u} style={st} />
        {word(x1 - ((x2 - x1) / l) * 24, y1 - ((y2 - y1) / l) * 24 + 16, x2 >= x1 ? 'end' : 'start')}
      </>
    );
  }
  const {x, y, w: bw, h: bh} = el;
  if (el.kind === 'circle') {
    const rx = bw / 2 + 22;
    const ry = bh / 2 + 22;
    const cx = x + bw / 2;
    const cy = y + bh / 2;
    return (
      <>
        <Pen d={ellipse(cx, cy, rx, ry, {seed, wobble: 0.03, overlap: 18})} u={u} style={st} />
        {word(cx + rx * 0.72, cy - ry * 0.72 - 14, 'start')}
      </>
    );
  }
  if (el.kind === 'underline') {
    const ly = y + bh + 14;
    return (
      <>
        <Pen d={line(x - 8, ly, x + bw + 8, ly, {seed, over: [0, 0], bow: 4, ...pen})} u={u} style={st} />
        {word(x + bw / 2, ly + 56, 'middle')}
      </>
    );
  }
  const out = el.dir ? el.dir === 'out' : /OUT/i.test(el.word ?? '');
  const L = Math.max(50, Math.min(120, 0.18 * Math.min(bw, bh)));
  const corners: [number, number, number, number][] = [[x, y, -1, -1], [x + bw, y, 1, -1], [x + bw, y + bh, 1, 1], [x, y + bh, -1, 1]];
  const arrows = corners
    .map(([cx, cy, sx, sy], k) => {
      const ox = sx * Math.SQRT1_2;
      const oy = sy * Math.SQRT1_2;
      const [a, b] = out ? [12, 12 + L] : [12 + L, 12];
      return arrow(cx + ox * a, cy + oy * a, cx + ox * b, cy + oy * b, {seed: `${seed}/c${k}`, head: 22, ...pen});
    })
    .join('');
  return (
    <>
      <path d={`M${x} ${y}H${x + bw}V${y + bh}H${x}Z`} {...st} strokeDasharray="30 18" opacity={u > 0 ? 1 : 0} />
      <Pen d={arrows} u={u} style={st} />
      {y > 80 ? word(x + 4, y - 18, 'start') : word(x + 16, y + 60, 'start')}
    </>
  );
};

// ------------------------------------------------------------------ boxes (the lint's box() mirrors this)
/** the element's world box (x0, y0, x1, y1), before its moves */
export function elBox(el: El): Box | null {
  switch (el.t) {
    case 'rect':
    case 'hatch':
    case 'scribble':
      return [el.x, el.y, el.x + el.w, el.y + el.h];
    case 'ellipse':
    case 'pool':
      return [el.cx - el.rx, el.cy - el.ry, el.cx + el.rx, el.cy + el.ry];
    case 'shade':
      if (el.pts && el.pts.length) return ptsBox(el.pts);
      return [(el.cx ?? 0) - (el.rx ?? 0), (el.cy ?? 0) - (el.ry ?? 0), (el.cx ?? 0) + (el.rx ?? 0), (el.cy ?? 0) + (el.ry ?? 0)];
    case 'line':
      return ptsBox(el.pts);
    case 'pipe': {
      const b = ptsBox(el.pts);
      const r = (el.bore ?? 26) / 2 + 9;
      return [b[0] - r, b[1] - r, b[2] + r, b[3] + r];
    }
    case 'arrow':
      return [Math.min(el.x1, el.x2), Math.min(el.y1, el.y2), Math.max(el.x1, el.x2), Math.max(el.y1, el.y2)];
    case 'figure':
      return figureBox(el);
    case 'text': {
      const size = el.size ?? 64;
      const w = 0.5 * size * el.text.length;
      return [el.x - w / 2, el.y - 0.75 * size, el.x + w / 2, el.y + 0.2 * size];
    }
    case 'icon': {
      const h = el.h ?? el.w * (ICON_ASPECT[el.name as IconName] ?? 1);
      return [el.x, el.y, el.x + el.w, el.y + h];
    }
    case 'mark':
      if (el.kind === 'arrow') return [Math.min(el.x1, el.x2), Math.min(el.y1, el.y2), Math.max(el.x1, el.x2), Math.max(el.y1, el.y2)];
      return [el.x, el.y, el.x + el.w, el.y + el.h];
    case 'ground':
      return [Math.min(el.x0, el.x1), el.y0, Math.max(el.x0, el.x1), el.y1];
    case 'ambient':
      if (el.kit === 'water') return ptsBox(el.pts);
      if (el.kit === 'steam') {
        const w = el.w ?? 160;
        return [el.x - w / 2, el.y - (el.h ?? 260), el.x + w / 2, el.y];
      }
      return [el.x, el.y, el.x + el.w, el.y + el.h];
  }
  return null;
}
function ptsBox(pts: Pt[]): Box {
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
}
function figureBox(el: Extract<El, {t: 'figure'}>): Box {
  const pose = POSES[el.pose ?? 'stand'] ?? POSES.stand;
  const {x, y, h} = el;
  const s = el.facing === 'l' ? -1 : 1;
  const us: number[] = [pose.H[0] - 0.09, pose.H[0] + 0.09, pose.S[0] - 0.085, pose.S[0] + 0.085];
  let top = pose.H[1] + 0.09;
  for (const [e, hand] of pose.arms) {
    us.push(e[0], hand[0] - 0.032, hand[0] + 0.032);
    top = Math.max(top, e[1], hand[1] + 0.032);
  }
  for (const [k, foot] of pose.legs) us.push(k[0], foot[0], foot[0] + 0.055);
  let xs = us.map((u) => x + s * u * h);
  if (el.pose === 'smear') {
    const fx = x + s * SMEAR.lead * h;
    xs = xs.map((v) => fx + (v - fx) * SMEAR.sx);
    xs.push(x - s * (0.12 + SMEAR.trail) * h * SMEAR.sx, x + s * top * h * Math.tan((SMEAR.skew * Math.PI) / 180));
    top *= SMEAR.sy;
  }
  return [Math.min(...xs), y - top * h, Math.max(...xs), y];
}

// ------------------------------------------------------------------ the rig's auto shadow
/** a cast + contact shadow under the element's foot, away from the key, in the rig's one shadow value */
function autoShadow(b: Box, rig: Rig, opt: {len?: number; w?: number} | true): React.ReactNode {
  const o = opt === true ? {} : opt;
  const [x0, y0, x1, y1] = b;
  const h = y1 - y0;
  const w0 = o.w ?? (x1 - x0) * 0.9;
  const fx = (x0 + x1) / 2;
  const fy = y1;
  const side = rig.key.includes('left') ? 1 : rig.key.includes('right') ? -1 : 0;
  const high = rig.key.startsWith('top');
  const len = o.len ?? (rig.key === 'top' ? 0 : high ? 0.28 * h : 0.6 * h);
  const ry = Math.max(8, 0.05 * h);
  const c = shadowTone(rig.shadow);
  if (rig.key === 'back' || rig.key === 'front') {
    const dy = rig.key === 'back' ? ry * 0.9 : -ry * 0.6;
    return <ellipse cx={fx} cy={fy + dy} rx={w0 / 2 + 6} ry={ry * (rig.key === 'back' ? 2.2 : 1.4)} fill={c} />;
  }
  const cx = fx + side * len / 2;
  return <ellipse cx={cx} cy={fy + 2} rx={w0 / 2 + len / 2} ry={ry} fill={c} />;
}

// ------------------------------------------------------------------ the pipe
type PipeEl = Extract<El, {t: 'pipe'}>;
const PipeView: React.FC<{el: PipeEl; wt: Weight; clock: number; T: number; drawU: number; seed: string}> = ({el, wt, clock, T, drawU, seed}) => {
  const d = el.curve === 'smooth' ? smooth(el.pts) : poly(el.pts, {seed: `${seed}/p`, joined: true, jitter: 0.4});
  const bore = el.bore ?? 26;
  const lw = wt.tier === 'A' ? wt.w : 3;
  const wall = wt.tier === 'A' ? wt.tone(BOARD.ink) : wt.tier === 'C' ? wt.tone(stepL(BOARD.light, -10)) : wt.tier === 'B' ? wt.tone(BOARD.mid) : wt.line ?? BOARD.mid;
  const waterC = wt.tier === 'A' ? wt.tone(BOARD.dark) : wt.tier === 'C' ? wt.tone(BOARD.light) : wt.tone(BOARD.mid);
  const dash = (u: number) => (u >= 1 ? {} : {pathLength: 1, strokeDasharray: `${Math.max(0, u)} 2`, strokeDashoffset: 0});
  // the water: [tail, front] along the run, never ahead of the drawn pipe
  let front = Math.min(drawU, keyed(el.water, clock, 0));
  let tail = keyed(el.drain, clock, 0);
  if (el.pulse) {
    const [p0, pd, plen] = el.pulse;
    if (clock >= p0 && clock <= p0 + pd) {
      const pu = progress(clock, p0, p0 + pd, 'linear') * (1 + plen) - plen;
      // a pulse shows as a slug over whatever water is there
      tail = Math.min(tail, Math.max(0, pu));
      front = Math.max(front, Math.min(1, pu + plen));
      if (keyed(el.water, clock, 0) <= 0) tail = Math.max(0, pu);
    }
  }
  const seg = front - tail;
  const mid = `${seed}-m`.replace(/[^a-zA-Z0-9_-]/g, '_');
  const flowV = el.flow === true ? 80 : typeof el.flow === 'number' ? el.flow : 0;
  const tip = el.tip && drawU > 0 && drawU < 1 ? frontOf(d, drawU) : null;
  return (
    <>
      <path d={d} fill="none" stroke={wall} strokeWidth={bore + 2 * lw} strokeLinecap="round" strokeLinejoin="round" {...dash(drawU)} />
      <path d={d} fill="none" stroke={wt.tone(BOARD.paper)} strokeWidth={bore} strokeLinecap="round" strokeLinejoin="round" {...dash(drawU)} />
      {seg > 0.0005 ? (
        <path d={d} fill="none" stroke={waterC} strokeWidth={Math.max(4, bore - 6)} strokeLinecap="round" strokeLinejoin="round"
          pathLength={1} strokeDasharray={`${seg} 2`} strokeDashoffset={-tail} />
      ) : null}
      {seg > 0.0005 && flowV > 0 ? (
        <>
          <defs>
            <mask id={mid} maskUnits="userSpaceOnUse">
              <path d={d} fill="none" stroke="#fff" strokeWidth={bore} pathLength={1} strokeDasharray={`${seg} 2`} strokeDashoffset={-tail} />
            </mask>
          </defs>
          <path d={d} fill="none" stroke={wt.tone(BOARD.paper)} strokeWidth={Math.max(3, bore * 0.22)} strokeLinecap="round"
            strokeDasharray="16 46" strokeDashoffset={-((flowV * T) % 62)} mask={`url(#${mid})`} />
        </>
      ) : null}
      {tip ? <PenTip p={tip} /> : null}
    </>
  );
};

// ------------------------------------------------------------------ the element
export type ElementProps = {
  el: El;
  /** the element's own clock: s after its shot's start (a panel element), film s (a set element) */
  clock: number;
  /** film s (ambient phases, flow) */
  T: number;
  /** the moves on this element, each with the time on its own clock */
  moves: {m: Move; time: number}[];
  wt: Weight;
  rig?: Rig;
  vp?: VP;
  seed: string;
};

const ENTER_DUR = {grow: 0.12, wipe: 0.25, rise: 0.15, pop: 0} as const;
const outCubic = easeOf('out');

export const Element: React.FC<ElementProps> = ({el, clock, T, moves, wt, rig, vp, seed}) => {
  if (el.in !== undefined && clock < el.in) return null;
  if (el.out !== undefined && clock >= el.out) return null;
  // the entrance (never an opacity fade: DIRECTION rule 8)
  let enterTf: string | undefined;
  let wipeU = 1;
  const b = elBox(el);
  if (el.in !== undefined && el.enter && el.enter !== 'pop' && b) {
    const dur = el.enterDur ?? ENTER_DUR[el.enter];
    const u = outCubic(Math.max(0, Math.min(1, (clock - el.in) / Math.max(0.01, dur))));
    if (el.enter === 'grow' && u < 1) {
      const px = (b[0] + b[2]) / 2;
      const py = b[3];
      const s = 0.3 + 0.7 * u;
      enterTf = `translate(${px} ${py}) scale(${s}) translate(${-px} ${-py})`;
    } else if (el.enter === 'rise' && u < 1) enterTf = `translate(0 ${40 * (1 - u)})`;
    else if (el.enter === 'wipe') wipeU = u;
  }
  // moves
  let dx = 0;
  let dy = 0;
  const tfs: string[] = [];
  let scaled = false;
  for (const {m, time} of moves) {
    const u = moveU(m, time);
    if (m.s !== undefined && m.s !== 1) {
      const S = m.lin ? 1 + (m.s - 1) * u : Math.pow(m.s, u);
      const [ox, oy] = m.o ?? [0, 0];
      tfs.unshift(`translate(${ox + m.dx * u} ${oy + m.dy * u}) scale(${S}) translate(${-ox} ${-oy})`);
      scaled = true;
    } else if (scaled) tfs.unshift(`translate(${m.dx * u} ${m.dy * u})`);
    else {
      dx += m.dx * u;
      dy += m.dy * u;
    }
  }
  const moveTf = [...tfs, `translate(${dx} ${dy})`].join(' ');
  const drawU = drawProgress(el.draw, el.undraw, clock);
  let fillO = el.fillIn === undefined ? 1 : Math.max(0, Math.min(1, (clock - el.fillIn) / 0.12));
  // a tier-C shape drawn on (no line to draw) lands its tone when its draw ends
  if (wt.tier === 'C' && el.draw && el.fillIn === undefined) fillO = clock >= el.draw[0] + el.draw[1] ? 1 : 0;
  if (el.undraw) fillO *= 1 - Math.max(0, Math.min(1, (clock - el.undraw[0]) / 0.12));
  const C = wt.tier === 'C';
  const lineC = wt.line;
  const stroke = (c: string | null, w: number) => ({stroke: c ?? 'none', strokeWidth: w, fill: 'none', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const});
  const pen = boardPen(wt.role === 'subject');
  // a v3-role far shape with a (non-paper) fill is a flat tone with no line unless sw asks for one
  const v3flat = (fc?: string) => wt.tier === null && wt.role === 'far' && el.sw === undefined && !!fc && fc !== BOARD.paper;
  const label = (x: number, bottom: number, s?: string) =>
    !s ? null : <text x={x} y={bottom + 62} fontSize={60} fill={wt.tone(BOARD.ink)} textAnchor="middle" fontFamily={captionFontStack}>{s}</text>;
  let body: React.ReactNode = null;
  let tip: Pt | null = null;
  switch (el.t) {
    case 'rect': {
      const fc = C ? wt.fill(el.fill ?? 'light') : wt.fill(el.fill);
      body = (
        <>
          {fc && fillO > 0 ? <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={fc} opacity={fillO} /> : null}
          {lineC && !v3flat(fc) ? <Pen d={rect(el.x, el.y, el.w, el.h, {seed, ...pen})} u={drawU} style={stroke(lineC, wt.w)} /> : null}
          {label(el.x + el.w / 2, el.y + el.h, el.label)}
        </>
      );
      break;
    }
    case 'ellipse': {
      const fc = C ? wt.fill(el.fill ?? 'light') : wt.fill(el.fill);
      body = (
        <>
          {fc && fillO > 0 ? <ellipse cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} fill={fc} opacity={fillO} /> : null}
          {lineC && !v3flat(fc) ? <Pen d={ellipse(el.cx, el.cy, el.rx, el.ry, {seed, ...boardLoop(Math.max(el.rx, el.ry), wt.role === 'subject')})} u={drawU} style={stroke(lineC, wt.w)} /> : null}
          {label(el.cx, el.cy + el.ry, el.label)}
        </>
      );
      break;
    }
    case 'line': {
      const pts = el.pts;
      const closedFill = el.closed && (el.fill !== undefined || C);
      const fc = closedFill ? (C ? wt.fill(el.fill ?? 'light') : wt.fill(el.fill)) : undefined;
      const d = el.curve === 'smooth' ? smooth(pts, {closed: el.closed}) : el.curve === 'joined'
        ? poly(pts, {seed, closed: el.closed, joined: true, jitter: 0.5}) : poly(pts, {seed, closed: el.closed, ...pen});
      // an open line is a thing that IS a line: tier C draws it light, 3 px
      const lc = el.closed ? (C ? null : lineC) : C ? wt.openLine : lineC;
      const lw = C ? (el.sw ?? 3) : wt.w;
      body = (
        <>
          {fc && fillO > 0 ? <polygon points={pts.map((p) => p.join(',')).join(' ')} fill={fc} opacity={fillO} /> : null}
          {lc && !v3flat(fc) ? <Pen d={d} u={drawU} style={stroke(lc, lw)} byLength /> : null}
        </>
      );
      if (el.tip && drawU > 0 && drawU < 1) tip = frontOf(d, drawU);
      break;
    }
    case 'arrow':
      body = <Pen d={arrow(el.x1, el.y1, el.x2, el.y2, {seed, head: 12 + 2 * wt.w, breaks: false, jitter: pen.jitter, drift: pen.drift})} u={drawU}
        style={stroke(C ? wt.openLine : lineC, C ? 3 : wt.w)} />;
      break;
    case 'hatch':
      body = <rect x={el.x} y={el.y} width={el.w} height={el.h} fill={C ? wt.tone(BOARD.light) : wt.tone(BOARD.mid)} opacity={el.fillIn !== undefined ? fillO : drawU} />;
      break;
    case 'scribble': {
      const c = wt.tier === 'A' ? wt.tone(BOARD.dark) : C ? wt.tone(BOARD.light) : wt.tier === 'B' ? wt.tone(BOARD.mid)
        : wt.role === 'subject' ? BOARD.dark : wt.tone(BOARD.mid);
      body = <Pen d={scribbleMass(el.x, el.y, el.w, el.h, {seed, gap: el.gap, jitter: el.jitter})} u={drawU} style={stroke(c, el.sw ?? 3)} />;
      break;
    }
    case 'figure': {
      const layers = <Layers layers={figureLayers(el, wt, seed)} u={drawU} fillO={fillO} />;
      body = el.pose === 'smear' ? <g transform={smearTf(el)}>{layers}</g> : layers;
      break;
    }
    case 'text': {
      const size = el.size ?? 64;
      const col = C ? wt.tone(BOARD.light) : wt.tier === 'B' ? wt.tone(BOARD.mid) : wt.tone(wt.tier === null ? (wt.line ?? BOARD.ink) : BOARD.ink);
      let strike: React.ReactNode = null;
      if (el.strike !== undefined && el.strike !== false) {
        const su = typeof el.strike === 'number' ? Math.max(0, Math.min(1, (clock - el.strike) / 0.25)) : drawU;
        const tw = textWidth(el.text, size);
        const sy = el.y - size * 0.3;
        const sw = el.sw ?? Math.max(wt.w, Math.round(size * 0.07));
        strike = su > 0 ? (
          <Pen d={line(el.x - tw / 2 - 10, sy + size * 0.06, el.x + tw / 2 + 10, sy - size * 0.06, {seed: `${seed}/x`, over: [0, 0], breaks: false, jitter: 0.5, drift: 0})}
            u={su} style={stroke(col, sw)} />
        ) : null;
      }
      body = (
        <>
          <text x={el.x} y={el.y} fontSize={size} fill={col} textAnchor="middle" fontFamily={captionFontStack}>{el.text}</text>
          {strike}
        </>
      );
      break;
    }
    case 'icon': {
      const raw = el.fill;
      const fill = raw === undefined ? undefined : raw === 'none' ? null
        : /^#/.test(raw) ? raw : wt.fill(raw as Fill) ?? null;
      body = <SketchIcon name={el.name} x={el.x} y={el.y} w={el.w} h={el.h} fill={fill} text={el.text} label={el.label} pts={el.pts}
        seed={seed} drawU={drawU} fillO={fillO} t={clock} board={{role: wt.role, sw: el.sw, tone: wt.tone}} />;
      break;
    }
    case 'mark':
      body = <MarkView el={el} seed={seed} u={drawU} />;
      break;
    case 'pool':
      body = <ellipse cx={el.cx} cy={el.cy} rx={el.rx} ry={el.ry} fill={wt.tone(BOARD.paper)} opacity={fillO} />;
      break;
    case 'shade': {
      const c = shadowTone(rig?.shadow);
      body = el.pts && el.pts.length
        ? <polygon points={el.pts.map((p) => p.join(',')).join(' ')} fill={c} opacity={fillO} />
        : <ellipse cx={el.cx ?? 0} cy={el.cy ?? 0} rx={el.rx ?? 0} ry={el.ry ?? 0} fill={c} opacity={fillO} />;
      break;
    }
    case 'ground': {
      const n = Math.max(2, el.n ?? 5);
      const vx = el.vx ?? (Array.isArray(vp?.x) ? vp?.x[0] : vp?.x) ?? 540;
      const vy = el.vy ?? vp?.y ?? el.y0 - 400;
      const c = C || wt.tier === null ? wt.openLine : wt.line ?? wt.openLine;
      const lw = C ? 3 : wt.w;
      let d = '';
      for (let i = 0; i < n; i++) {
        const nx = el.x0 + ((el.x1 - el.x0) * i) / (n - 1);
        // from the near edge toward the VP, stopping at the far edge y0
        const f = vy === el.y1 ? 0 : (el.y1 - el.y0) / (el.y1 - vy);
        const fx = nx + (vx - nx) * Math.max(0, Math.min(1, f));
        d += `M${nx} ${el.y1}L${fx} ${el.y0}`;
      }
      if (el.horizon) d += `M-200 ${vy}L1280 ${vy}`;
      body = <Pen d={d} u={drawU} style={stroke(c, lw)} />;
      break;
    }
    case 'pipe':
      body = <PipeView el={el} wt={wt} clock={clock} T={T} drawU={drawU} seed={seed} />;
      break;
    case 'ambient':
      body = <AmbientView el={el} T={T} local={clock} wt={wt} seed={seed} />;
      break;
  }
  const shadow = el.shadow && rig && b ? autoShadow(b, rig, el.shadow) : null;
  let inner = (
    <g transform={moveTf} className={scaled ? 'nss' : undefined}>
      {shadow}
      {body}
      {tip ? <PenTip p={tip} /> : null}
    </g>
  );
  if (wipeU < 1 && b) {
    const cid = `w${seed}`.replace(/[^a-zA-Z0-9_-]/g, '_');
    inner = (
      <>
        <defs>
          <clipPath id={cid} clipPathUnits="userSpaceOnUse">
            <rect x={b[0] - 20} y={b[1] - 20} width={(b[2] - b[0] + 40) * wipeU} height={b[3] - b[1] + 40} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${cid})`}>{inner}</g>
      </>
    );
  }
  return enterTf ? <g transform={enterTf}>{inner}</g> : inner;
};
