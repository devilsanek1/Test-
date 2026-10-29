// props/CounterBoard.tsx — the S08 rooftop counter board (storyboard v3): the ONE count device. A teal-framed cream sign
// board on two posts behind our parapet, a small shield-dome emblem top-left, a painted header (L8), a start flag + note
// (L9a with its unit line), HAND-DRAWN ink tally gates (5 bars each: never digits, never a ticker), two stamp slots (L10,
// L11) and a footer fine print (L9b).
//
//   <CounterBoard box={[430, 1080, 890, 1440]} riseAt={26.64}
//     header={['Cloudflare · sits in front', 'of about 1 in 5 websites']}
//     flagAt={28.34} note={['counted from the', 'public announcement', 'attempts, not break-ins']}
//     footer={['Matthew Prince, Cloudflare CEO, on X', "Cloudflare's own count"]} footerAt={28.74}
//     gatesAt={[28.40, 28.86, 29.23, 29.33, 29.43, 29.82, 29.92, 30.86, 32.59]}
//     stamps={[{at: 32.02, text: 'first 45 min: tens of thousands'}, {at: 32.85, text: 'millions · within a day'}]} />
//
// Anchor: `box` [x0, y0, x1, y1] = the board FACE incl. its frame (storyboard: world 430-890 x 1080-1440), or x, y (top
// left) + w, h (default 460 x 360). The zones follow the storyboard layout scaled to the box (`counterBoardZones`).
// Text sizes are WORLD px (defaults: header 33, note 26, footer 28, stamps 29 = 38 / 30 / 32 / 34 px on screen at the
// 1.15 push; the footer zone holds two lines at >= 28 px from zoom 1.0). riseAt: the board rises its own height + posts from behind its base line (0.33 s out(expo), clipped at the
// base: put the parapet in front). gatesAt[i]: gate i strokes on (4 bars + the strike, 0.12 s), laid out in rows of
// `gateCols` in the gates zone. stamps[i] slam (ink ring 0.13 s, print 2.6 x -> 1.0 x in 0.27 s). outAt: un-build.

import React from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, prog, springAt, springs, useTime} from '../../../lib/time';
import {rand, Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {useCaptionFont} from '../../../lib/font';
import {arc, line, poly, Pt, rect, rectPath, roundRect, smooth} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {Depth, PropRoot, usePropFrame} from './common';
import {InkTextBlock, LabelTag, labelLines, layoutText, LabelText} from './Labels';

export type Rect4 = [number, number, number, number];

export type CounterBoardZones = {
  face: Rect4;
  emblem: Rect4;
  header: Rect4;
  flag: Rect4;
  note: Rect4;
  gates: Rect4;
  stamps: [Rect4, Rect4];
  footer: Rect4;
  /** Where Bit can stand on the top edge (right end). */
  top: Pt;
};

/** Default footer zone height in board units (storyboard px of the 460 x 360 layout): two lines of fine print at
 *  >= 28 px (2.04 em each block). */
export const COUNTER_FOOTER_H = 58;

/** The board's zones (world rects [x0, y0, x1, y1]) for a board box, from the storyboard layout (430-890 x 1080-1440).
 *  v3 fix: the footer (L9b) is 58 board px tall (was 47) so its two lines hold >= 28 px fine print; the room comes from
 *  the note / gates band (3 note lines still fit at 27). `footerH` (WORLD px) overrides the footer height: the stamps and
 *  the note / gates band move up / down with it. Pass the SAME `footerH` to the board and to this function. */
export function counterBoardZones(box: Rect4, opts: {footerH?: number} = {}): CounterBoardZones {
  const [x0, y0, x1, y1] = box;
  const sx = (x1 - x0) / 460;
  const sy = (y1 - y0) / 360;
  const R = (a: number, b: number, c: number, d: number): Rect4 => [x0 + (a - 430) * sx, y0 + (b - 1080) * sy, x0 + (c - 430) * sx, y0 + (d - 1080) * sy];
  // footer height in board units; whatever it takes / gives back shifts the stamps and the bottom of the note band
  const fh = Math.max(30, Math.min(110, opts.footerH !== undefined ? opts.footerH / sy : COUNTER_FOOTER_H));
  const d = fh - COUNTER_FOOTER_H;
  const bandB = 1276 - d;
  return {
    face: box,
    emblem: R(442, 1094, 486, 1146),
    header: R(490, 1092, 870, 1172),
    flag: R(450, 1186, 474, bandB),
    note: R(476, 1180, 720, bandB),
    gates: R(730, 1188, 878, bandB),
    stamps: [R(450, 1280 - d, 870, 1324 - d), R(450, 1326 - d, 760, 1370 - d)],
    footer: R(446, 1374 - d, 874, 1432),
    top: [x0 + (860 - 430) * sx, y0],
  };
}

export type CounterBoardStamp = {at?: number; text: LabelText; fontSize?: number; rot?: number};

export type CounterBoardProps = {
  box?: Rect4;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  /** Rises from behind its base line (0.33 s out(expo)); omit = already standing. */
  riseAt?: number;
  /** Post length below the board (world px, default 80: they disappear behind the parapet). */
  post?: number;
  header?: LabelText;
  /** Header pops (7 % spring) at headerAt (default: with the board). */
  headerAt?: number;
  headerSize?: number;
  /** Start flag pops (and the note with it, + 0.08 s). */
  flagAt?: number;
  note?: LabelText;
  noteAt?: number;
  noteSize?: number;
  /** One time per tally gate (5 bars). No digits anywhere. */
  gatesAt?: number[];
  /** Gates per row (default 3). */
  gateCols?: number;
  stamps?: CounterBoardStamp[];
  stampSize?: number;
  footer?: LabelText;
  footerAt?: number;
  /** Footer fine print (world px). Default 28 (the labelStyle fine-print floor at zoom 1). */
  footerSize?: number;
  /** Footer zone height in WORLD px (default 58 board px x the box's y scale); see counterBoardZones. */
  footerH?: number;
  /** false = no emblem. */
  emblem?: boolean;
  depth?: Depth;
  ink?: number;
  outAt?: number;
  outDur?: number;
  seed?: Seed;
};

/** A small shield with a glass dome on it (the Cloudflare-ish emblem without any logo): local box 44 x 52. */
const ShieldDome: React.FC<{x: number; y: number; w: number; h: number; W: number; off: [number, number]; at?: number; seed: Seed}> = ({x, y, w, h, W, off, at, seed}) => {
  const t = useTime();
  const k = at === undefined ? 1 : t < at ? 0 : springAt(t, at, springs.pop);
  if (k <= 0.001) return null;
  const s = Math.min(w / 44, h / 52);
  const shield = smooth(
    [
      [0, 0],
      [22, -3],
      [44, 0],
      [43, 22],
      [34, 40],
      [22, 50],
      [10, 40],
      [1, 22],
    ],
    {closed: true, tension: 0.35},
  );
  const dome = `M9 34A13 13 0 0 1 35 34Z`;
  return (
    <XG m={mat.compose(mat.translate(x + (w - 44 * s) / 2, y + (h - 52 * s) / 2), mat.scale(s), mat.about(mat.scale(k), 22, 26))}>
      <Fill d={shield} color={palette.sage} offset={[off[0] / s, off[1] / s]} seed={`${seed}/sf`} />
      <Ink d={shield} width={W / s} taper={false} seed={`${seed}/si`} />
      <Fill d={dome} color={palette.cream} offset={false} mode="none" seed={`${seed}/df`} />
      <Ink d={arc(22, 34, 13, 13, 180, 360, {seed: `${seed}/da`}) + 'M7 34.5H37M22 21V34M15 23.5Q17 29 16.5 34M29 23.5Q27 29 27.5 34'} width={(W * 0.7) / s} taper={false} seed={`${seed}/di`} />
    </XG>
  );
};

/** One tally gate: 4 bars + the diagonal strike, hand-drawn (seeded), stroked on over 0.12 s. Local box w x h. */
function gatePath(x: number, y: number, w: number, h: number, seed: Seed): string {
  let d = '';
  for (let i = 0; i < 4; i++) {
    const bx = x + w * (0.12 + i * 0.24) + (rand(seed, `gx${i}`) - 0.5) * w * 0.04;
    d += line(bx, y + h * 0.06 + (rand(seed, `gt${i}`) - 0.5) * h * 0.08, bx + (rand(seed, `gb${i}`) - 0.5) * w * 0.05, y + h * 0.94, {over: [0, 0], seed: `${seed}/b${i}`, drift: 0.6});
  }
  d += line(x - w * 0.02, y + h * 0.78, x + w * 1.0, y + h * 0.18, {over: [0, 0], seed: `${seed}/x`, drift: 0.4});
  return d;
}

export const CounterBoard: React.FC<CounterBoardProps> = (p) => {
  useCaptionFont();
  const t = useTime();
  const seed = p.seed ?? 'counter';
  const box: Rect4 = p.box ?? [p.x ?? 0, p.y ?? 0, (p.x ?? 0) + (p.w ?? 460), (p.y ?? 0) + (p.h ?? 360)];
  const [x0, y0, x1, y1] = box;
  const bw = x1 - x0;
  const bh = y1 - y0;
  const F = usePropFrame({depth: p.depth, ink: p.ink, seed, defDepth: 'mid'});
  if (p.riseAt !== undefined && t < p.riseAt) return null;
  const W = F.W;
  const off = F.off;
  const Z = counterBoardZones(box, {footerH: p.footerH});
  const post = p.post ?? 80;
  const rise = p.riseAt === undefined ? 1 : E.outExpo(prog(t, p.riseAt, 0.33));
  const dy = (1 - rise) * (bh + post + 10);
  const fw = Math.max(7, bw * 0.018);
  const parts: React.ReactNode[] = [];

  // posts (behind the board), frame, face
  for (const fx of [0.16, 0.84]) {
    const px = x0 + bw * fx;
    parts.push(<Fill key={`po${fx}`} d={rectPath(px - fw * 0.55, y1 - 4, fw * 1.1, post + 4)} color={palette.tealDark} offset={off} mode="none" seed={`${seed}/po${fx}`} />);
    parts.push(<Ink key={`poi${fx}`} d={line(px - fw * 0.55, y1, px - fw * 0.55, y1 + post, {over: [0, 0], seed: `${seed}/pa${fx}`}) + line(px + fw * 0.55, y1, px + fw * 0.55, y1 + post, {over: [0, 0], seed: `${seed}/pb${fx}`})} width={W} taper={false} seed={`${seed}/poi${fx}`} />);
  }
  parts.push(<Fill key="fr" d={roundRect(x0, y0, bw, bh, fw * 0.6, {seed: `${seed}/frf`})} color={palette.teal} offset={off} mode="none" seed={`${seed}/frf`} />);
  parts.push(<Fill key="face" d={rectPath(x0 + fw, y0 + fw, bw - 2 * fw, bh - 2 * fw)} color={palette.cream} offset={[off[0] * 0.5, off[1] * 0.5]} mode="none" seed={`${seed}/face`} />);
  parts.push(<Ink key="fri" d={rect(x0, y0, bw, bh, {seed: `${seed}/fri`, over: 6})} width={W} seed={`${seed}/fri`} />);
  parts.push(<Ink key="fii" d={rect(x0 + fw, y0 + fw, bw - 2 * fw, bh - 2 * fw, {seed: `${seed}/fii`, over: 2, open: 0.5})} width={W * 0.55} taper={false} seed={`${seed}/fii`} />);
  // the header rule + the zone rules (painted dividers)
  const ruleY = Z.header[3] + 4;
  parts.push(<Ink key="rules" d={line(x0 + fw + 8, ruleY, x1 - fw - 8, ruleY, {over: [0, 0], seed: `${seed}/r1`}) + line(Z.stamps[0][0], Z.footer[1] - 2, Z.footer[2], Z.footer[1] - 2, {over: [0, 0], seed: `${seed}/r2`})} width={W * 0.45} taper={false} seed={`${seed}/rules`} />);

  // emblem
  if (p.emblem !== false) {
    const [ex0, ey0, ex1, ey1] = Z.emblem;
    parts.push(<ShieldDome key="em" x={ex0} y={ey0} w={ex1 - ex0} h={ey1 - ey0} W={W * 0.8} off={off} at={p.headerAt} seed={`${seed}/em`} />);
  }

  // painted text blocks (pop in place with the 7 % spring)
  const block = (key: string, text: LabelText | undefined, zone: Rect4, size: number, at: number | undefined, align: 'center' | 'left', pitch = 1.08) => {
    const pad = {x: 0.1, top: 0.05, bot: 0.05, pitch};
    const lines = labelLines(text);
    if (!lines.length) return;
    const k = at === undefined ? 1 : t < at ? 0 : springAt(t, at, springs.pop);
    if (k <= 0.001) return;
    const L = layoutText(lines, size, pad, [zone[2] - zone[0], zone[3] - zone[1]]);
    const cx = (zone[2] - zone[0]) / 2;
    const cy = (zone[3] - zone[1]) / 2;
    parts.push(
      <XG key={key} m={mat.compose(mat.translate(zone[0], zone[1]), mat.about(mat.scale(k), align === 'center' ? cx : 0, cy))}>
        <InkTextBlock L={L} align={align} color={palette.ink} k={F.k * k} seed={`${seed}/${key}`} />
      </XG>,
    );
  };
  block('hd', p.header, Z.header, p.headerSize ?? 33, p.headerAt, 'center');
  block('nt', p.note, Z.note, p.noteSize ?? 26, p.noteAt ?? (p.flagAt !== undefined ? p.flagAt + 0.08 : undefined), 'left', 1.05);
  block('ft', p.footer, Z.footer, p.footerSize ?? 28, p.footerAt, 'center', 0.98);

  // start flag: a short pole with a sage pennant at the count's left end
  if (p.flagAt === undefined || t >= p.flagAt) {
    const [fx0, fy0, fx1, fy1] = Z.flag;
    const k = p.flagAt === undefined ? 1 : springAt(t, p.flagAt, springs.pop);
    const pw = fx1 - fx0;
    const ph = fy1 - fy0;
    const px = fx0 + pw * 0.3;
    const flag: Pt[] = [
      [px, fy0 + ph * 0.06],
      [px + pw * 0.62, fy0 + ph * 0.17 + Math.sin(t * 6 + 1) * ph * 0.012],
      [px, fy0 + ph * 0.3],
    ];
    parts.push(
      <XG key="flag" m={mat.about(mat.scale(k), px, fy1)}>
        <Fill d={poly(flag, {closed: true, joined: true, seed: `${seed}/flf`}) + 'Z'} color={palette.sage} offset={off} seed={`${seed}/flf`} />
        <Ink d={poly(flag, {closed: true, over: 1.5, seed: `${seed}/fli`})} width={W * 0.6} taper={false} seed={`${seed}/fli`} />
        <Ink d={line(px, fy0, px, fy1, {over: [0, 0], seed: `${seed}/flp`})} width={W * 0.8} taper={false} seed={`${seed}/flp`} />
        <Ink d={line(px - pw * 0.25, fy1, px + pw * 0.35, fy1, {over: [0, 0], seed: `${seed}/flb`})} width={W * 0.8} taper={false} seed={`${seed}/flb`} />
      </XG>,
    );
  }

  // tally gates
  const gates = p.gatesAt ?? [];
  if (gates.length) {
    const cols = p.gateCols ?? 3;
    const rows = Math.max(1, Math.ceil(gates.length / cols));
    const [gx0, gy0, gx1, gy1] = Z.gates;
    const cw = (gx1 - gx0) / cols;
    const ch = Math.min((gy1 - gy0) / rows, cw * 0.9);
    let d = '';
    const live: React.ReactNode[] = [];
    gates.forEach((ga, i) => {
      if (t < ga) return;
      const c = i % cols;
      const r = Math.floor(i / cols);
      const gp = gatePath(gx0 + c * cw + cw * 0.1, gy0 + r * ch + ch * 0.12, cw * 0.78, ch * 0.76, `${seed}/g${i}`);
      if (t >= ga + 0.3) d += gp;
      else live.push(<Ink key={`g${i}`} d={gp} at={ga} dur={0.12} width={W * 0.75} taper={false} seed={`${seed}/g${i}`} />);
    });
    if (d) parts.push(<Ink key="gates" d={d} width={W * 0.75} taper={false} seed={`${seed}/gates`} />);
    parts.push(...live);
  }

  // stamps
  (p.stamps ?? []).forEach((st, i) => {
    const zone = Z.stamps[Math.min(i, 1)];
    parts.push(<LabelTag key={`st${i}`} kind="stamp" box={zone} text={st.text} fontSize={st.fontSize ?? p.stampSize ?? 29} at={st.at} rot={st.rot ?? (i ? -2.4 : 1.6)} ink={W * 0.62} seed={`${seed}/st${i}`} />);
  });

  // the rise: translate up from below its base line, clipped at the base (+ posts) so it never shows under it
  const clipId = `cb-${String(seed).replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  const body = <XG m={mat.translate(0, dy)}>{parts}</XG>;
  return (
    <PropRoot outAt={p.outAt} outDur={p.outDur}>
      {rise < 1 ? (
        <>
          <defs>
            <clipPath id={clipId}>
              <rect x={x0 - 60} y={y0 - 400} width={bw + 120} height={bh + post + 400} />
            </clipPath>
          </defs>
          <g clipPath={`url(#${clipId})`}>{body}</g>
        </>
      ) : (
        body
      )}
    </PropRoot>
  );
};
