// kit/Contract.tsx: HER contract (the subject of O1, P2, P12; credited "Her account to BBC News" wherever it is drawn:
// the engine / lane puts the credit line, the kit draws the page). Ported from the approved style frame
// (src/v2/StyleDesk.tsx Contract / RunOn) and generalised to any size:
//   <ContractPage>  the page: JOB CONTRACT, ruled lines, the clause in words "no criticizing / Google" with the pop
//                   highlight band that can sweep on, a signature that draws on, and the RUN-ON: the same paper running
//                   on past the page's bottom edge, a year every other row (2030, 2040, 2050 ...), shaded where it hangs
//                   past an edge (the desk's front edge), a rolled leading edge.
//   <FloorRun>      the run-on lying on the floor and coming toward us (P2): a strip widening toward the camera, its
//                   rows and years growing with it, the rolled edge leading.
//   runOnLength()   the approved timing curve: a step out (120 px) then a pour, faster and faster.
// Page-local units: the style frame's 420 x 500 page (CONTRACT_PAGE); `w` scales it, ink stays at screen weight.
// Below w 240 the page draws its SIMPLE face (title bar, ruled lines, the two pop bands, the signature): the words do
// not read at that size, the orange clause band does (it is the page's identity at phone size).
// "for life" is never written on the page or in quote marks; the running line only ever runs on HER page.

import React from 'react';
import {hline, line, polyPath, rect, roundRect, smooth, textLines, ellipse} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {ease as E, prog, useTime} from '../../../lib/time';
import {mat, Mat, XG} from '../../../lib/xf';
import {InkScale} from '../../../lib/inkComp';
import {measureCaption, useCaptionFont} from '../../../lib/font';
import {CC} from '../palette';
import {applyM, At, b, Fill, fillAt, Ink, Letter, Pt, W} from './util';

/** The style frame's page (local units) and its O1 desk placement (canvas px at camera rest). */
export const CONTRACT_PAGE = {w: 420, h: 500};
export const O1_PAGE = {x: 334, y: 704, w: 420, rot: -2.5};
export const CL_X = 34;
export const CLAUSE = {size: 50, rows: [{txt: 'no criticizing', base: 252}, {txt: 'Google', base: 310}]};
export const RUN_YEARS = [2030, 2040, 2050, 2060, 2070, 2080, 2090, 2100, 2110, 2120];
/** Page-local px of run-on per decade (two rows: ruled lines, then the year). */
export const RUN_STEP = 234;

export type PageGeo = {x: number; y: number; w: number; rot?: number};
/** Page-local -> canvas matrix (rotation about the page centre, scale w / 420). */
export const pageMat = (g: PageGeo): Mat => {
  const s = g.w / CONTRACT_PAGE.w;
  return mat.compose(
    mat.translate(g.x + g.w / 2, g.y + (CONTRACT_PAGE.h * s) / 2),
    mat.rotate(g.rot ?? 0),
    mat.scale(s),
    mat.translate(-CONTRACT_PAGE.w / 2, -CONTRACT_PAGE.h / 2),
  );
};
/** A page-local point on canvas. */
export const pagePoint = (g: PageGeo, lx: number, ly: number): Pt => applyM(pageMat(g), lx, ly);

/** The clause rows' widths (page-local px) in the hand font. */
export const clauseWidths = (ok: boolean): [number, number] =>
  CLAUSE.rows.map((r) => (ok ? measureCaption(r.txt, CLAUSE.size) : r.txt.length * CLAUSE.size * 0.42)) as [number, number];

/** The highlighter path of clause row i (page-local): start under the first letter, end where the band ends. */
export const clauseRow = (i: 0 | 1, ok = true): [Pt, Pt] => {
  const w = clauseWidths(ok)[i];
  const by = CLAUSE.rows[i].base - CLAUSE.size * 0.22;
  return [
    [CL_X - 2, by],
    [CL_X + w + 10, by],
  ];
};

/** The highlighter tip on canvas while the band sweeps (bands = [row1 0..1, row2 0..1]). */
export const clauseTip = (g: PageGeo, bands: [number, number], ok = true): Pt => {
  const i = bands[1] > 0 ? 1 : 0;
  const [a, z] = clauseRow(i as 0 | 1, ok);
  const p = bands[i];
  return pagePoint(g, a[0] + (z[0] - a[0]) * p, a[1]);
};

/** The approved sweep timing (StyleDeskOpen): row 1 over 0.24 s, a 0.08 s hop, row 2 over 0.14 s. */
export const sweepBands = (t: number, at: number): [number, number] => [
  prog(t, at, 0.24, E.inOutSine),
  prog(t, at + 0.32, 0.14, E.inOutSine),
];

/** How far (canvas px) the run-on has run past the page's edge: a step out (`step` px over 0.42 s from `stepAt`),
 *  then a pour from `pourAt`, faster and faster (`accel` px/s^2 x t^2). The approved opening: 3.08 / 3.55 / 120 / 900. */
export const runOnLength = (t: number, o: {stepAt: number; pourAt: number; step?: number; accel?: number; stepDur?: number}): number => {
  if (t < o.stepAt) return 0;
  const step = (o.step ?? 120) * prog(t, o.stepAt, o.stepDur ?? 0.42, E.outCubic);
  const s = Math.max(0, t - o.pourAt);
  return step + (o.accel ?? 900) * s * s;
};

const bandPts = (x0: number, x1: number, by: number, s: number, seed: string, minH: number): Pt[] => {
  const r = rng(seed);
  const top = by - Math.max(s * 0.58, minH * 0.8);
  const bot = by + Math.max(s * 0.14, minH * 0.2);
  return [
    [x0 + 6, top + r.jitter(1.5)],
    [x1 + r.jitter(2), top + 2],
    [x1 - 8, bot + r.jitter(1.5)],
    [x0 - 2, bot - 1],
  ];
};

const mixHex = (a: string, c: string, k: number): string => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  return '#' + pa.map((v, i) => Math.round(v + (pb[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
/** The hanging (shaded) paper colour. */
export const PAPER_HANG = mixHex(CC.paper, CC.paperEdge, 0.55);

export type ContractPageProps = PageGeo & {
  /** The title (style frame: JOB CONTRACT). */
  title?: string;
  /** The clause in words (default true). */
  clause?: boolean;
  /** Highlight band progress per clause row (0..1; default done). Or `sweepAt` (the approved sweep timing). */
  bands?: [number, number];
  sweepAt?: number;
  /** Signature: draw-on start (s) and duration (default 0.3); omit = already signed; null = unsigned. */
  sigAt?: number | null;
  sigDur?: number;
  /** Run-on past the page's bottom edge (CANVAS px along the page). */
  runOn?: number;
  /** Canvas y of an edge (the desk's front edge) past which the run-on hangs (shaded, a crease line). */
  edgeY?: number;
  /** 'auto' (simple below w 240) | 'full' | 'simple'. */
  detail?: 'auto' | 'full' | 'simple';
  /** Draw the drop shadow under the page (default true). */
  shadow?: boolean;
  at?: At;
  seed?: string;
};

export const ContractPage: React.FC<ContractPageProps> = (p) => {
  const {title = 'JOB CONTRACT', clause = true, sigDur = 0.3, runOn = 0, edgeY, detail = 'auto', shadow = true, at, seed = 'ct'} = p;
  const t = useTime();
  const ok = useCaptionFont();
  const s = p.w / CONTRACT_PAGE.w;
  const simple = detail === 'simple' || (detail === 'auto' && p.w < 240);
  const M = pageMat(p);
  const {w, h} = CONTRACT_PAGE;
  const widths = clauseWidths(ok);
  const bands: [number, number] = p.bands ?? (p.sweepAt !== undefined ? sweepBands(t, p.sweepAt) : [1, 1]);
  const SX = 18;
  const sig = smooth(
    (
      [
        [214, 438],
        [226, 410],
        [236, 438],
        [244, 418],
        [258, 430],
        [270, 404],
        [278, 436],
        [292, 420],
        [310, 432],
        [324, 414],
        [336, 430],
        [352, 424],
        [380, 428],
      ] as Pt[]
    ).map(([x, y]): Pt => [x + SX, y]),
  );
  // simple face: a band must stay >= ~11 screen px tall to read at phone size
  const minBand = simple ? 13 / s : 0;
  const L = runOn / s;
  return (
    <XG m={M}>
      <InkScale value={1 / s}>
        {shadow ? <Fill rect={[5, 7, w, h]} color={CC.paperEdge} offset={false} at={fillAt(at)} /> : null}
        <Fill rect={[0, 0, w, h]} color={CC.paper} offset={false} at={fillAt(at)} />
        <Ink d={rect(0, 0, w, h, {seed: `${seed}/page`, over: 'small'})} width={W.mid} at={at} />
        {simple ? (
          <Ink d={hline(CL_X, CL_X + 260, 56, {seed: `${seed}/tb`, over: [0, 0]})} width={7} at={b(at, 0.08)} taper={false} />
        ) : ok ? (
          <Letter x={CL_X} y={66} size={46} at={b(at, 0.08)}>
            {title}
          </Letter>
        ) : null}
        <Ink d={textLines(CL_X, 110, 352, {n: 4, gap: 26, seed: `${seed}/l1`, heading: false})} width={simple ? W.mid : W.far} at={b(at, 0.1)} />
        {/* the highlighter band (the pop) under the clause's words, then the words */}
        {clause
          ? CLAUSE.rows.map((r, i) =>
              bands[i] > 0 ? (
                <Fill
                  key={i}
                  d={polyPath(bandPts(CL_X - 6, CL_X - 6 + Math.max(14, (widths[i] + 16) * bands[i]), r.base, CLAUSE.size, `${seed}/band${i}`, minBand))}
                  color={CC.pop}
                  offset={false}
                  at={fillAt(at, 0.1)}
                />
              ) : null,
            )
          : null}
        {clause && !simple && ok
          ? CLAUSE.rows.map((r, i) => (
              <Letter key={i} x={CL_X} y={r.base} size={CLAUSE.size} at={b(at, 0.12 + i * 0.04)}>
                {r.txt}
              </Letter>
            ))
          : null}
        {clause && simple ? <Ink d={hline(CL_X + 4, CL_X + widths[0] - 10, 238, {seed: `${seed}/cw1`, over: [0, 0]}) + hline(CL_X + 4, CL_X + widths[1] - 6, 296, {seed: `${seed}/cw2`, over: [0, 0]})} width={W.mid} at={b(at, 0.14)} /> : null}
        <Ink d={textLines(CL_X, 352, 352, {n: 2, gap: 26, seed: `${seed}/l2`, heading: false})} width={simple ? W.mid : W.far} at={b(at, 0.14)} />
        {/* signed */}
        <Ink d={textLines(CL_X, 446, 118, {n: 1, seed: `${seed}/ld`, heading: false})} width={W.far} at={b(at, 0.16)} />
        {!simple ? <Ink d={line(196 + SX, 432, 206 + SX, 444, {over: [0, 0], seed: `${seed}/x1`}) + line(206 + SX, 432, 196 + SX, 444, {over: [0, 0], seed: `${seed}/x2`})} width={W.far} at={b(at, 0.16)} /> : null}
        <Ink d={hline(214 + SX, 392 + SX / 2, 450, {seed: `${seed}/sigl`, over: [0, 4]})} width={W.far} at={b(at, 0.16)} />
        {p.sigAt === null ? null : p.sigAt !== undefined ? <Ink d={sig} width={W.mid} at={p.sigAt} dur={sigDur} pace="free" /> : <Ink d={sig} width={W.mid} at={b(at, 0.2)} />}
        {L > 0 ? <RunOnLocal M={M} L={L} edgeY={edgeY} seed={seed} simple={simple} /> : null}
      </InkScale>
    </XG>
  );
};

/** The page running on past its bottom edge (page-local coords, inside the page matrix M). */
const RunOnLocal: React.FC<{M: Mat; L: number; edgeY?: number; seed: string; simple: boolean}> = ({M, L, edgeY, seed, simple}) => {
  const {w, h} = CONTRACT_PAGE;
  const y1 = h + L;
  // the edge (canvas y = edgeY) in page-local coords: y = (Y - b x - f) / d
  const edgeAt = (x: number) => (edgeY === undefined ? Infinity : (edgeY - M[1] * x - M[5]) / M[3]);
  const e0 = edgeAt(0);
  const ew = edgeAt(w);
  const over = y1 > Math.min(e0, ew);
  const r = rng(`${seed}/runon`);
  const rows: string[] = [];
  const years: {y: number; label: number}[] = [];
  for (let k = 0; k < RUN_YEARS.length; k++) {
    const yy = h + 74 + k * RUN_STEP;
    if (yy < y1 - 26) years.push({y: yy, label: RUN_YEARS[k]});
  }
  for (let i = 0, y = h + 30; y < y1 - 20; i++, y += 26) {
    const lw = r.range(250, 352);
    if (years.some((yr) => Math.abs(yr.y - 14 - y) < 24)) continue;
    rows.push(hline(CL_X, CL_X + lw, y, {seed: `${seed}/ro${i}`, over: [0, 0]}));
  }
  return (
    <>
      <Fill rect={[5, h, w, L]} color={CC.paperEdge} offset={false} />
      <Fill rect={[0, h - 1, w, L + 1]} color={CC.paper} offset={false} />
      {over ? <Fill d={polyPath([[0, Math.max(h, e0)], [w, Math.max(h, ew)], [w, y1], [0, y1]])} color={PAPER_HANG} offset={false} /> : null}
      <Ink d={rows.join('')} width={simple ? W.mid : W.far} />
      {years.map((yr, i) => (
        <React.Fragment key={i}>
          <Ink d={hline(CL_X, 218, yr.y - 14, {seed: `${seed}/ry${i}`, over: [0, 0]})} width={W.far} />
          <Letter x={232} y={yr.y} size={simple ? 64 : 42}>
            {String(yr.label)}
          </Letter>
        </React.Fragment>
      ))}
      <Ink d={line(0, h, 0, y1, {seed: `${seed}/roL`, over: [0, 0]}) + line(w, h, w, y1, {seed: `${seed}/roR`, over: [0, 0]})} width={W.mid} taper={false} />
      {over ? <Ink d={line(0, e0, w, ew, {seed: `${seed}/roE`, over: [0, 0]})} width={W.far} taper={false} /> : null}
      {/* the rolled leading edge */}
      <XG m={mat.translate(0, y1)}>
        <Fill d={roundRect(-8, -15, w + 16, 30, 14)} color={CC.paper} offset={false} />
        <Fill d={roundRect(-8, 1, w + 16, 14, 7)} color={CC.paperEdge} offset={false} />
        <Ink d={roundRect(-8, -15, w + 16, 30, 14, {seed: `${seed}/roll`})} width={W.mid} taper={false} />
        <Ink d={ellipse(8, 0, 5, 9, {seed: `${seed}/rollA`}) + ellipse(w - 8, 0, 5, 9, {seed: `${seed}/rollB`})} width={W.hair} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- the run-on on the floor, coming toward us (P2)

export type FloorRunProps = {
  /** The far end (where the hanging strip meets the floor): left x, right x, y (canvas px). */
  from: {x0: number; x1: number; y: number};
  /** The near end at full length (wider, lower: toward us). */
  to: {x0: number; x1: number; y: number};
  /** How much of it has run out (0..1). */
  p?: number;
  /** The first year on the floor (P2: 2040) and how many decades the full strip holds. */
  firstYear?: number;
  decades?: number;
  at?: At;
  seed?: string;
};

/** The run-on on the floor: rows and years in perspective (each decade longer and bigger than the last), shaded like
 *  the hanging paper, the rolled leading edge. */
export const FloorRun: React.FC<FloorRunProps> = ({from, to, p = 1, firstYear = 2040, decades = 3, at, seed = 'floorrun'}) => {
  const ok = useCaptionFont();
  if (p <= 0) return null;
  const n = decades * 2; // rows: lines, year, lines, year ...
  const w0 = from.x1 - from.x0;
  const w1 = to.x1 - to.x0;
  const ratio = Math.pow(w1 / w0, 1 / n);
  // row boundaries v_i in 0..1 with gaps growing geometrically (perspective)
  const gaps: number[] = [];
  for (let i = 0; i < n; i++) gaps.push(Math.pow(ratio, i));
  const tot = gaps.reduce((a, c) => a + c, 0);
  const vs: number[] = [0];
  gaps.forEach((g) => vs.push(vs[vs.length - 1] + g / tot));
  const at01 = (v: number) => ({x0: from.x0 + (to.x0 - from.x0) * v, x1: from.x1 + (to.x1 - from.x1) * v, y: from.y + (to.y - from.y) * v});
  const end = at01(p);
  const body = polyPath([[from.x0, from.y], [from.x1, from.y], [end.x1, end.y], [end.x0, end.y]]);
  let rows = '';
  const labels: {x: number; y: number; size: number; text: string}[] = [];
  for (let i = 0; i < n; i++) {
    const va = vs[i];
    const vb = vs[i + 1];
    if (vb > p) break;
    const A = at01(va);
    const B = at01(vb);
    const lw = B.x1 - B.x0;
    if (i % 2 === 0) {
      // a row block: three ruled lines
      for (let k = 1; k <= 3; k++) {
        const q = at01(va + ((vb - va) * k) / 4);
        const ww = q.x1 - q.x0;
        rows += hline(q.x0 + ww * 0.1, q.x0 + ww * (0.62 + 0.1 * ((i + k) % 3)), q.y, {seed: `${seed}/r${i}${k}`, over: [0, 0]});
      }
    } else {
      const q = at01(va + (vb - va) * 0.7);
      const ww = q.x1 - q.x0;
      rows += hline(q.x0 + ww * 0.1, q.x0 + ww * 0.45, q.y - (B.y - A.y) * 0.2, {seed: `${seed}/y${i}`, over: [0, 0]});
      labels.push({x: q.x0 + ww * 0.5, y: q.y, size: Math.min((B.y - A.y) * 0.9, lw * 0.22), text: String(firstYear + 10 * ((i - 1) / 2))});
    }
  }
  const rollH = Math.max(10, (end.x1 - end.x0) * 0.07);
  return (
    <>
      <Fill d={body} color={CC.paper} offset={false} at={fillAt(at)} />
      <Ink d={line(from.x0, from.y, end.x0, end.y, {seed: `${seed}/L`, over: [0, 0]}) + line(from.x1, from.y, end.x1, end.y, {seed: `${seed}/R`, over: [0, 0]})} width={W.mid} at={at} taper={false} />
      <Ink d={rows} width={W.far} at={b(at, 0.05)} />
      {ok
        ? labels.map((l, i) => (
            <Letter key={i} x={l.x} y={l.y} size={l.size} at={b(at, 0.1)}>
              {l.text}
            </Letter>
          ))
        : null}
      <Fill d={roundRect(end.x0 - 6, end.y - rollH / 2, end.x1 - end.x0 + 12, rollH, rollH / 2)} color={CC.paper} offset={false} at={fillAt(at)} />
      <Fill d={roundRect(end.x0 - 6, end.y, end.x1 - end.x0 + 12, rollH / 2, rollH / 4)} color={CC.paperEdge} offset={false} at={fillAt(at)} />
      <Ink d={roundRect(end.x0 - 6, end.y - rollH / 2, end.x1 - end.x0 + 12, rollH, rollH / 2, {seed: `${seed}/roll`})} width={W.mid} at={at} taper={false} />
    </>
  );
};
