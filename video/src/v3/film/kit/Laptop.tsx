// kit/Laptop.tsx: THE laptop (hero burnt orange, open, seen 3/4 from slightly above), drawn like the style frame's old
// laptop (flat hero lid and deck, dark screen with a core-colour glint, dashed key rows, hairline trackpad). Variants:
// 'old' (yours: dark screen, optional tape on the hinge) and 'new' (the NEW / BETTER one: lit peach screen, sparkles,
// an optional label). Geometry is computed in canvas px from `w`, so ink weights and overshoots never scale with size
// (S8's 1400 px keyboard keeps the house line).

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {glint, line, poly, polyPath} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, lerp, Pt, quadPt, Show, Txt, W} from './util';

export type LaptopProps = {
  /** Centre of the hinge line (canvas px). */
  x: number;
  y: number;
  /** Lid width (px). The lid is `lidH` w tall (default 0.64); the deck reaches 0.24 w toward the viewer. */
  w: number;
  /** Lid height as a fraction of w (default 0.64). A close-up seen from above foreshortens it (S8: 0.36, so the
   *  board's wall strip shows above the lid and the dark screen stays near its budget). */
  lidH?: number;
  variant?: 'old' | 'new';
  /** Screen colour override (default: anchor for 'old', the lit peach for 'new'). */
  screen?: string;
  /** Tape across the left hinge (the old laptop's sign of use). */
  taped?: boolean;
  /** A label badge over the lid (e.g. "BETTER", "NEW"). */
  label?: string;
  labelAt?: At;
  rot?: number;
  at?: At;
  seed?: string;
  /** Screen ink weight (default 3.4 mid; 4.8 for a foreground close-up). */
  ink?: number;
  /** Draw only the lid (e.g. a laptop seen from behind a counter). */
  lidOnly?: boolean;
  /** Children drawn on the screen (screen-space canvas px; e.g. a see-inside view). */
  children?: React.ReactNode;
};

/** Key points of a laptop (for lanes aiming at it: the screen centre, the keyboard centre, the lid corners). */
export function laptopGeo(x: number, y: number, w: number, lidH = 0.64) {
  const H = w * lidH;
  const D = w * 0.24;
  const f = w * 0.07;
  // 3/4 from slightly right and above: the right side recedes (shorter, higher), the deck flares toward us
  const lid: [Pt, Pt, Pt, Pt] = [
    [x - w / 2 - w * 0.01, y - H],
    [x + w / 2 - w * 0.02, y - H * 0.95 - w * 0.012],
    [x + w / 2, y - w * 0.018],
    [x - w / 2, y],
  ];
  const bez = w * 0.065;
  const scr: [Pt, Pt, Pt, Pt] = [quadPt(lid, bez / w, bez / H), quadPt(lid, 1 - bez / w, bez / H), quadPt(lid, 1 - bez / w, 1 - (bez * 1.5) / H), quadPt(lid, bez / w, 1 - (bez * 1.5) / H)];
  const deck: [Pt, Pt, Pt, Pt] = [lid[3], lid[2], [x + w / 2 + f * 0.7, y + D - w * 0.012], [x - w / 2 - f, y + D]];
  const edge: [Pt, Pt, Pt, Pt] = [deck[3], deck[2], [deck[2][0], deck[2][1] + w * 0.035], [deck[3][0], deck[3][1] + w * 0.04]];
  return {H, D, lid, scr, deck, edge, screenC: quadPt(scr, 0.5, 0.5), keysC: quadPt(deck, 0.5, 0.42)};
}

export const Laptop: React.FC<LaptopProps> = ({x, y, w, lidH = 0.64, variant = 'old', screen, taped, label, labelAt, rot = 0, at, seed = 'laptop', ink = 3.4, lidOnly, children}) => {
  const g = laptopGeo(x, y, w, lidH);
  const isNew = variant === 'new';
  const scr = screen ?? (isNew ? EMBER.newScreen : EMBER.anchor);
  const small = w < 220;
  const thin = Math.max(1.6, ink * 0.65);
  const over: [number, number] = small ? [0, 2] : [1, 5];
  // key rows: dashed anchor strokes across the deck (as the style frame), 3 rows + a space bar
  const rows = [0.18, 0.36, 0.54].map((v, i) => {
    const a = quadPt(g.deck, 0.09 - i * 0.012, v);
    const c = quadPt(g.deck, 0.91 + i * 0.012, v);
    return `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  });
  const kw = Math.max(3, w * 0.027);
  // at close-up size (w >= 800) the dashed rows read as solid bars: draw separate key caps instead (12 per row, the
  // orange deck showing between them), on the same three rows (S8's stick comes up through the third)
  const caps =
    w >= 800
      ? [0.18, 0.36, 0.54]
          .flatMap((v, i) => {
            const u0 = 0.09 - i * 0.012;
            const u1 = 0.91 + i * 0.012;
            const n = 12;
            const step = (u1 - u0) / n;
            const hv = 0.055;
            return Array.from({length: n}, (_, j) => {
              const a = u0 + j * step + step * 0.12;
              const c = a + step * 0.76;
              return polyPath([quadPt(g.deck, a, v - hv), quadPt(g.deck, c, v - hv), quadPt(g.deck, c, v + hv), quadPt(g.deck, a, v + hv)]);
            });
          })
          .join('')
      : '';
  const tp = [quadPt(g.deck, 0.38, 0.7), quadPt(g.deck, 0.62, 0.7), quadPt(g.deck, 0.63, 0.92), quadPt(g.deck, 0.37, 0.92)] as Pt[];
  const glintAt = quadPt(g.scr, 0.2, 0.78);
  const tape = (() => {
    const c = quadPt(g.deck, 0.07, 0.04);
    const a = (-32 * Math.PI) / 180;
    const L = w * 0.17;
    const T = w * 0.045;
    const loc: Pt[] = [[-L, -T], [L * 0.92, -T], [L, -T * 0.4], [L * 0.9, 0], [L * 1.02, T * 0.5], [L * 0.92, T], [-L, T], [-L * 0.9, T * 0.45], [-L * 1.02, 0], [-L * 0.9, -T * 0.5]];
    return loc.map(([px, py]) => [c[0] + px * Math.cos(a) - py * Math.sin(a), c[1] + px * Math.sin(a) + py * Math.cos(a)] as Pt);
  })();
  const sparkle = (sx: number, sy: number, s: number) => `M${sx} ${sy - s}L${sx} ${sy + s}M${sx - s} ${sy}L${sx + s} ${sy}`;
  const body = (
    <>
      {/* lid */}
      <Fill d={polyPath(g.lid)} color={EMBER.hero} at={fillAt(at)} seed={`${seed}/lid`} />
      <Fill d={polyPath(g.scr)} color={scr} at={fillAt(at, 0.05)} offset={false} seed={`${seed}/scr`} />
      {children ? <Show at={fillAt(at, 0.05)}>{children}</Show> : null}
      <Ink d={poly(g.lid, {closed: true, seed: `${seed}/lidI`, over})} at={at} width={ink} />
      <Ink d={poly(g.scr, {closed: true, seed: `${seed}/scrI`, over: [0, 2]})} at={b(at, 0.06)} width={thin} />
      <Ink d={glint(glintAt[0], glintAt[1], w * 0.14, {seed: `${seed}/gl`})} at={b(at, 0.2)} width={thin} color={isNew ? EMBER.white : EMBER.core} />
      {lidOnly ? null : (
        <>
          {/* deck + its front edge (the hero's flat shade step) */}
          <Fill d={polyPath(g.edge)} color={EMBER.heroDeep} at={fillAt(at, 0.06)} seed={`${seed}/edge`} />
          <Fill d={polyPath(g.deck)} color={EMBER.hero} at={fillAt(at, 0.04)} seed={`${seed}/deck`} />
          <Ink d={poly(g.deck, {closed: true, seed: `${seed}/deckI`, over}) + poly([g.edge[1], g.edge[2], g.edge[3], g.edge[0]], {seed: `${seed}/edgeI`, over: [0, 2]})} at={b(at, 0.04)} width={ink} />
          {caps ? (
            <Fill d={caps} color={EMBER.anchor} at={fillAt(at, 0.14)} offset={false} seed={`${seed}/caps`} />
          ) : (
            <Ink d={rows.join('')} at={b(at, 0.14)} width={kw} color={EMBER.anchor} dash={`${(w * 0.05).toFixed(1)} ${(w * 0.018).toFixed(1)}`} taper={false} />
          )}
          <Ink d={poly(tp, {closed: true, seed: `${seed}/tp`, over: [0, 1]})} at={b(at, 0.18)} width={Math.max(1.4, ink * 0.5)} />
          {taped ? (
            <>
              <Fill d={polyPath(tape)} color={EMBER.tape} at={fillAt(at, 0.2)} offset={[1, 1]} seed={`${seed}/tape`} />
              <Ink d={poly(tape, {closed: true, joined: true, seed: `${seed}/tapeI`})} at={b(at, 0.22)} width={thin} />
            </>
          ) : null}
        </>
      )}
      {isNew ? (
        <Ink
          d={sparkle(g.lid[1][0] + w * 0.1, g.lid[1][1] - w * 0.02, w * 0.045) + sparkle(g.lid[0][0] - w * 0.06, lerp(g.lid[0][1], g.lid[3][1], 0.62), w * 0.03)}
          at={b(at, 0.3)}
          width={thin}
        />
      ) : null}
      {label ? <LaptopLabel x={(g.lid[0][0] + g.lid[1][0]) / 2} y={g.lid[0][1] - w * 0.06} w={w} text={label} at={labelAt ?? b(at, 0.3)} seed={seed} /> : null}
    </>
  );
  return rot ? <XG m={mat.about(mat.rotate(rot), x, y)}>{body}</XG> : body;
};

/** The label badge over a laptop ("BETTER"): a small warm-white card with ink lettering, sized from the laptop. */
const LaptopLabel: React.FC<{x: number; y: number; w: number; text: string; at?: At; seed: string}> = ({x, y, w, text, at, seed}) => {
  const size = Math.max(34, Math.min(72, w * 0.17));
  const bw = Math.max(text.length * size * 0.5 + size * 0.7, w * 0.42);
  const bh = size * 1.12;
  const r: Pt[] = [
    [x - bw / 2, y - bh],
    [x + bw / 2, y - bh - 3],
    [x + bw / 2 + 2, y],
    [x - bw / 2 - 1, y + 2],
  ];
  return (
    <>
      <Fill d={polyPath(r)} color={EMBER.card} at={fillAt(at)} seed={`${seed}/lab`} />
      <Ink d={poly(r, {closed: true, seed: `${seed}/labI`, over: [1, 3]})} at={at} width={2.6} />
      <Show at={fillAt(at)}>
        <Txt x={x} y={y - bh * 0.24} size={size} fit={bw * 0.88}>
          {text}
        </Txt>
      </Show>
    </>
  );
};

/** THE laptop's screen as a desktop (S16's; S12 shows the same laptop, so the same desktop) (never a landscape: it must not read as a window): a document window with a
 *  dusk-blue title bar and lines, a dock row of app squares, a cursor. Screen-space canvas px over the lid's quad. */
export const ScreenDesktop: React.FC<{scr: [Pt, Pt, Pt, Pt]}> = ({scr}) => {
  const P = (u: number, v: number) => quadPt(scr, u, v);
  const q = (u0: number, v0: number, u1: number, v1: number) => {
    const pts = [P(u0, v0), P(u1, v0), P(u1, v1), P(u0, v1)];
    return `M${pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}Z`;
  };
  const docLines = [0.3, 0.38, 0.46, 0.54, 0.62].map((v, i) => q(0.5, v, i === 4 ? 0.74 : 0.9, v + 0.025)).join('');
  const dock = [EMBER.dc, EMBER.skyLow, EMBER.books[0], EMBER.dcSide, EMBER.hl, EMBER.sky];
  const c = P(0.8, 0.7);
  return (
    <>
      <Fill d={q(0.44, 0.1, 0.96, 0.74)} color={EMBER.frost} offset={false} />
      <Fill d={q(0.44, 0.1, 0.96, 0.19)} color={EMBER.dcSide} offset={false} />
      <Fill d={docLines} color={EMBER.dc} offset={false} />
      <Fill d={q(0.36, 0.84, 0.97, 0.95)} color={EMBER.frost} offset={false} />
      {dock.map((col, i) => (
        <Fill key={i} d={q(0.39 + i * 0.097, 0.855, 0.46 + i * 0.097, 0.935)} color={col} offset={false} />
      ))}
      <Fill d={`M${c[0]} ${c[1]}l0 22l6 -6l5 10l4 -2l-5 -10l9 0Z`} color={EMBER.white} offset={false} />
      <Ink d={q(0.44, 0.1, 0.96, 0.74)} width={W.hair} />
      <Ink d={`M${c[0]} ${c[1]}l0 22l6 -6l5 10l4 -2l-5 -10l9 0Z`} width={1.6} />
    </>
  );
};
