// lib/paint, the PAINT-ON reveal (owner, 2026-10-29: "If we do that would we be able to then animate its process like
// the very first few seconds or would it literally just popup?"; playbook PAINTED PIECES: a painted plate PAINTS ON in
// the opening like the rest of frame 0, "our flat design drawn first, the painted plate revealed stroke by stroke
// through brush-shaped masks", never a pop). Shown so far as stills only (docs/studies/2026-10-28_city_posters/ai_paint/
// reveal_strip.jpg); motion is the same code with the progress driven by time.
//
// How: a piece's painted PNG is drawn over its flat design through an SVG mask of SEEDED brush strokes. Each stroke is
// a broad curved path with a few bristle strokes along its sides, roughened by a small displacement (a dry-brush edge),
// and it is laid from its start to its end (a dash that grows), in painting order:
//   'wash'  long, slightly tilted rows, top to bottom, alternating direction (a sky, a cloud plane);
//   'haze'  a few broad strokes along the piece's long side (far roofs: rows; a tower: columns, from the ground up);
//   'dab'   short strokes curling round the mass, the shade side first and the lit side last (a tree's crown).
// The same seed gives the same strokes (frame-exact, nothing swims). At progress 1 the piece is drawn unmasked.
//
//   <PaintProvider on set={PAINT} reveal={{progress, windows: {sky: [0, .45], tree: [.62, 1]}, under: DESIGN}}>
//   // or time-driven, in the opening: reveal={{from: 0.6, to: 1.8, windows, under}}
import React from 'react';
import type {PaintBox, PaintPiece} from './PaintedLayer';

export type RevealKind = 'wash' | 'haze' | 'dab';

/** One mask stroke: an SVG path, its width and length, and its window inside the piece's own reveal (0..1). */
export type RevealStroke = {d: string; w: number; len: number; t0: number; t1: number};

/** The film's reveal: where the paint-on is now, each piece's window in it, and what lies under a piece meanwhile. */
export type PaintReveal = {
  /** The overall progress 0..1 (a still, an A/B). When absent, it runs from `from` to `to` scene seconds. */
  progress?: number;
  from?: number;
  to?: number;
  /** Each piece's window [start, end] inside the overall progress, by piece name, piece id or group name. Default
   *  [0, 1]. The painting order lives here: the sky washes first, then the far haze, then the tree. */
  windows?: Readonly<Record<string, readonly [number, number]>>;
  /** The set drawn UNDER a piece while it paints on (its flat design, e.g. our v4design bake); a piece missing from it
   *  has its flat children under it. */
  under?: Readonly<Record<string, PaintPiece>>;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** mulberry32: a small seeded PRNG (the same seed, the same strokes). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A piece's own stroke seed: its paint seed mixed with its id (pieces painted with one seed still get their own strokes). */
function strokeSeed(piece: PaintPiece): number {
  let h = 2166136261;
  for (let i = 0; i < piece.id.length; i++) h = Math.imul(h ^ piece.id.charCodeAt(i), 16777619);
  return ((h >>> 0) ^ Math.imul(piece.seed | 0, 2654435761)) >>> 0;
}

/** A quadratic stroke from p0 to p1 bowed by `bow` px, as a path and its length. */
function quad(x0: number, y0: number, x1: number, y1: number, bow: number): {d: string; len: number} {
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / l) * bow, cy = my + (dx / l) * bow;
  let len = 0, px = x0, py = y0;
  for (let i = 1; i <= 12; i++) {
    const s = i / 12, u = 1 - s;
    const qx = u * u * x0 + 2 * u * s * cx + s * s * x1, qy = u * u * y0 + 2 * u * s * cy + s * s * y1;
    len += Math.hypot(qx - px, qy - py);
    px = qx; py = qy;
  }
  const f = (v: number) => v.toFixed(1);
  return {d: `M${f(x0)} ${f(y0)}Q${f(cx)} ${f(cy)} ${f(x1)} ${f(y1)}`, len};
}

/** Lay `n` strokes one after another over the piece's window, each overlapping the next (a painter's rhythm). */
function timed(n: number, i: number, r: () => number): [number, number] {
  const t0 = (i / n) * 0.82;
  return [t0, Math.min(1, t0 + 0.14 + 0.12 * r())];
}

/** The seeded brush strokes that reveal one piece (in its box's px), in painting order. */
export function revealStrokes(box: PaintBox, kind: RevealKind, seed: number): RevealStroke[] {
  const [x, y, w, h] = box;
  const r = rng(seed * 7919 + 17);
  const out: Omit<RevealStroke, 't0' | 't1'>[] = [];
  if (kind === 'dab') {
    const m = Math.min(w, h), cx = x + w / 2, cy = y + h / 2;
    const n = 26 + Math.round((w * h) / 4000);
    const dabs: {k: number; s: Omit<RevealStroke, 't0' | 't1'>}[] = [];
    for (let i = 0; i < n; i++) {
      const px = x + w * (0.06 + 0.88 * r()), py = y + h * (0.06 + 0.88 * r());
      const a = Math.atan2(py - cy, px - cx) + Math.PI / 2 + (r() - 0.5) * 0.9;   // curl round the mass
      const L = m * (0.22 + 0.2 * r()), sw = m * (0.16 + 0.1 * r());
      const q = quad(px - (Math.cos(a) * L) / 2, py - (Math.sin(a) * L) / 2, px + (Math.cos(a) * L) / 2, py + (Math.sin(a) * L) / 2, L * (r() - 0.5) * 0.5);
      dabs.push({k: px - x - 0.35 * (py - y), s: {...q, w: sw}});   // the shade side (right) first, the lit side last
    }
    dabs.sort((p, q) => q.k - p.k);
    for (const d of dabs) out.push(d.s);
  } else {
    const vertical = kind === 'haze' && h > w * 1.3;
    const across = vertical ? w : h, along = vertical ? h : w;
    const rowH = kind === 'haze' ? 46 : 68;
    const rows = Math.max(2, Math.round(across / rowH));
    const band = across / rows;
    for (let i = 0; i < rows; i++) {
      const segs = along > 520 ? 2 : 1;
      for (let s = 0; s < segs; s++) {
        const c = (i + 0.5 + (r() - 0.5) * 0.3) * band;                        // across: this row's centre
        const a0 = segs === 1 ? -0.08 * along : s === 0 ? -0.08 * along : along * (0.38 + 0.1 * r());
        const a1 = segs === 1 ? 1.08 * along : s === 0 ? along * (0.58 + 0.12 * r()) : 1.08 * along;
        const flip = (i + s) % 2 === 1;                                         // alternate the direction
        const tilt = (r() - 0.5) * 0.06 * along;
        const [b0, b1] = flip ? [a1, a0] : [a0, a1];
        const [c0, c1] = flip ? [c + tilt, c - tilt] : [c - tilt, c + tilt];
        const q = vertical
          ? quad(x + c0, y + h - b0, x + c1, y + h - b1, (r() - 0.5) * band * 0.5)    // a tower: from the ground up
          : quad(x + b0, y + c0, x + b1, y + c1, (r() - 0.5) * band * 0.6);
        out.push({...q, w: band * (1.55 + 0.3 * r())});
      }
    }
  }
  return out.map((s, i) => {
    const [t0, t1] = timed(out.length, i, r);
    return {...s, t0, t1};
  });
}

/** The piece's own progress 0..1 inside the film's reveal (its window), or 1 when there is no reveal. */
export function revealProgress(reveal: PaintReveal | undefined, piece: PaintPiece, t: number): number {
  if (!reveal) return 1;
  const all = reveal.progress ?? (reveal.from !== undefined && reveal.to !== undefined ? (t - reveal.from) / Math.max(1e-6, reveal.to - reveal.from) : 1);
  const name = piece.id.split('/').pop() as string;
  const win = reveal.windows?.[piece.id] ?? reveal.windows?.[name] ?? (piece.group ? reveal.windows?.[piece.group] : undefined) ?? [0, 1];
  return clamp01((all - win[0]) / Math.max(1e-6, win[1] - win[0]));
}

/** A piece's reveal kind: its manifest's `reveal`, else from its group or style. */
export function revealKind(piece: PaintPiece & {reveal?: RevealKind}): RevealKind {
  if (piece.reveal) return piece.reveal;
  if (piece.group || piece.style === 'sky' || piece.style === 'cloud') return 'wash';
  return piece.style === 'foliage' ? 'dab' : 'haze';
}

/** The brush-stroke mask for one piece at its own progress p (0..1): draw `children` (the painted image) inside it. */
export const RevealMask: React.FC<{piece: PaintPiece & {reveal?: RevealKind}; p: number; children: React.ReactNode}> = ({piece, p, children}) => {
  const seed = strokeSeed(piece);
  const strokes = React.useMemo(() => revealStrokes(piece.box, revealKind(piece), seed), [piece, seed]);
  const [x, y, w, h] = piece.box;
  const key = piece.id.replace(/[^a-zA-Z0-9]/g, '-');
  const pad = 120;
  const rect = {x: x - pad, y: y - pad, width: w + 2 * pad, height: h + 2 * pad};
  const rb = rng(seed + 101);
  return (
    <>
      <defs>
        <filter id={`pr-f-${key}`} filterUnits="userSpaceOnUse" {...rect}>
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={seed % 997} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={16} xChannelSelector="R" yChannelSelector="G" />
          <feGaussianBlur stdDeviation={0.8} />
        </filter>
        <mask id={`pr-m-${key}`} maskUnits="userSpaceOnUse" {...rect}>
          <g filter={`url(#pr-f-${key})`} fill="none" stroke="#fff" strokeLinecap="round">
            {strokes.map((s, i) => {
              const q = clamp01((p - s.t0) / (s.t1 - s.t0));
              if (q <= 0) return null;
              const bristles = [-0.46, -0.3, 0.32, 0.48].map((o) => ({o, k: 0.72 + 0.3 * rb(), sw: 0.1 + 0.08 * rb()}));
              return (
                <g key={i}>
                  <path d={s.d} strokeWidth={s.w * 0.78} strokeDasharray={`${s.len} ${s.len + s.w * 2}`} strokeDashoffset={s.len * (1 - q)} />
                  {bristles.map((b, j) => (
                    <path key={j} d={s.d} transform={`translate(0 ${(b.o * s.w).toFixed(1)})`} strokeWidth={s.w * b.sw} strokeDasharray={`${s.len * b.k} ${s.len * 2 + s.w * 2}`} strokeDashoffset={s.len * b.k * (1 - q)} />
                  ))}
                </g>
              );
            })}
          </g>
        </mask>
      </defs>
      <g mask={`url(#pr-m-${key})`}>{children}</g>
    </>
  );
};
