// P9_page.tsx (lane L4-pages): THE COLD INSERT SHOT shared by P7, P9, P10 and P11, so the deal pages and Google's page
// sit on the SAME set, at the same page box, ground, tone, dressing and life (fairness: equal size, ground and tone).
//
// The set is the kit's ColdSet (the official desk at dusk, straight down, edge to edge) with InsertPage (the warm white
// page, never angled). This file adds only what the four panels share:
//   - the framing: one page centre on screen (540, PAGE_CY) for every panel; P7 / P9 / P11 at INSERT_Z (the page reads
//     ~550 px wide: block 2 of the deal at ~41 px, readable at phone size), P10 = 0.85 x that (the boarded pull-back).
//     Holds are LOCKED (the CAMERA holds, never a zoom in a hold: COZY_AND_SCALE 3b.5; the world keeps living).
//   - the page words, hand-lettered with the kit's Letter, under ONE header style (PageHead: the same size, centring
//     and y on every page, so the four pages read as one form): the signed DEAL page (P7), the deal's words in two
//     quoted blocks (P9, P10: block 1 never without block 2), GOOGLE SAYS (P11, with its two read-along underlines).
//   - the page lies on a DESK PAD, never in a screen: the kit's mid-lavender pad with leather corner pockets (no dark
//     rim, no inner gutter lines; the lane's override, folded back into kit/ColdSet.tsx), no keyboard anywhere on the
//     page's axis.
//   - the official who sits at our edge of the desk, TAKING NOTES (only the back of the right hand, a pen and a wine
//     sleeve, from the frame's lower right: people near, never a face) on a ruled notepad turned 13 degrees, partly
//     off frame; the writing runs on film time, so the notes go on growing from P7 to P11.
//   - a colleague's hand (grey suit cuff, a second person: never a third arm of the official) sliding a document onto
//     the left pile where it is SEEN at this zoom (the kit ColdSet's `slide`, the lane's version folded back).
//   - a water glass whose surface ripples (and jumps on a stamp's slam and on the slid document's landing); the kit's
//     desk phone's line lights and its anglepoise lamp (both folded back from the lane), a pencil and a stapler.
//   - the stamp with the board's paper backing (NO VETO lands across the page's top edge, over the DEAL heading).
// No cat, no Google lettering on P7-P10, no hero cobalt, no pop: stamps and underlines are ink.
import React from 'react';
import {World} from '../../../lib/World';
import {InkScale} from '../../../lib/inkComp';
import {useCaptionFont} from '../../../lib/font';
import {blob, ellipse, line, polyPath, rect, roundRect, smooth} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {ease, useTime} from '../../../lib/time';
import {mat, type Mat, XG} from '../../../lib/xf';
import {CC, COLD, COLD_CENTRE, ColdSet, Fill, INSERT_PAGES, Ink, InsertPage, Letter, Live, loopT, Stamp, stepT, textW, W, type Pt} from '../kit';

/** THE page box (set px, before the shot's zoom): the board's P9 box; P7, P9, P10 and P11 all use it. */
export const PAGE = INSERT_PAGES.P9;
/** The shot zoom of P7, P9 and P11 (the page ~552 x 744 on screen); P10 = 0.85 x this. */
export const INSERT_Z = 1.2;
export const P10_Z = 0.85 * INSERT_Z;
/** The page centre on screen (y): keeps P9's page top under the caption band (603) and, in P10's pull-back, the far
 *  documents above the band (<= 297) and the NO VETO stamp under it (>= 600). */
export const PAGE_CY = 975;
const SEED = 'cold-insert';

/** Local colours (the cold set's family; L* >= 35 so they stay out of the dark budget). */
const WINE = '#8A4A66'; // the official's sleeve (a mid wine, L* 40)

/** The shot matrix: the set scaled by z about the page centre, the page centre placed at (540, PAGE_CY). */
export const insertMat = (z: number) => mat.compose(mat.translate(0, PAGE_CY - COLD_CENTRE[1]), mat.about(mat.scale(z), COLD_CENTRE[0], COLD_CENTRE[1]));
/** Set px -> screen px for a shot zoom z (for checks and screen-space placement). */
export const insertPt = (z: number, p: Pt): Pt => [COLD_CENTRE[0] + (p[0] - COLD_CENTRE[0]) * z, PAGE_CY + (p[1] - COLD_CENTRE[1]) * z];

const apply = (m: Mat, p: Pt): Pt => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]];

export type ColdInsertProps = {
  /** The shot zoom (INSERT_Z or P10_Z). */
  z: number;
  /** The panel's start on the film clock (s): the official's notes run on film time, so they keep growing across the
   *  four inserts. */
  from: number;
  /** A colleague's hand slides a document onto the left pile at this scene time (s); false = not in this shot. */
  slide?: number | false;
  /** Stamp slam times (s): the water glass jumps (a burst of rings) on each. */
  kicks?: number[];
  /** The page's words (set px; draw them with PAGE). */
  children?: React.ReactNode;
  /** Drawn over the page (stamps). */
  over?: React.ReactNode;
};

/** The cold insert: the kit's cold set, the shared insert life, the page and its words. */
export const ColdInsert: React.FC<ColdInsertProps> = ({z, from, slide = false, kicks = [], children, over}) => {
  const t = useTime();
  const zz = z;
  // the glass also jumps when the slid document lands on the pile (the same beat on both pages)
  const allKicks = slide === false ? kicks : [...kicks, slide + 0.41];
  return (
    <World sky={COLD.table}>
      <XG m={insertMat(zz)}>
        <InkScale zoom={zz}>
          <ColdSet zoom={1} slide={slide} seed="cold" />
          <DeskFront />
          <WaterGlass x={182} y={985} r={52} kicks={allKicks} />
          <NotesOfficial T={from + t} />
          <InsertPage {...PAGE} seed={`${SEED}/page`}>
            {children}
          </InsertPage>
          {over}
        </InkScale>
      </XG>
    </World>
  );
};

// ---------------------------------------------------------------- the page words (set px, from the page box)

/** Page-local px -> set px. */
export const X = (u: number) => PAGE.x + u;
export const Y = (v: number) => PAGE.y + v;
const INK = CC.ink;

/** One size for a block of lines: the largest <= size that keeps every line within width w. */
const blockSize = (lines: string[], size: number, w: number) => Math.min(size, ...lines.map((l) => Math.floor((size * w) / Math.max(1, textW(l, size)))));

/** THE header style of every insert page (DEAL, GOOGLE SAYS): one size (the size GOOGLE SAYS fits the page at), centred,
 *  on one baseline, one letter spacing. The deal's header never outweighs Google's, nor the other way round. */
const HEAD = {y: 54, size: 44, spacing: 2, margin: 34} as const;
const headSize = () => blockSize(['GOOGLE SAYS'], HEAD.size, PAGE.w - 2 * HEAD.margin - 10 * HEAD.spacing);
export const PageHead: React.FC<{text: string}> = ({text}) => (
  <Letter x={X(PAGE.w / 2)} y={Y(HEAD.y)} size={headSize()} anchor="middle" fill={INK} spacing={HEAD.spacing}>
    {text}
  </Letter>
);

/** The deal's words, in two quoted blocks (P9, P10): DEAL; block 1 "any lawful government purpose" (big); a rule; block 2,
 *  the oversight clause in full (smaller, never cut). Fairness: block 1 is never drawn without block 2. */
export const BLOCK1 = ['"any lawful', 'government', 'purpose"'];
export const BLOCK2 = ['"should not be used', 'for domestic mass', 'surveillance or', 'autonomous weapons', '(including target', 'selection) without', 'appropriate human', 'oversight and control"'];
const DEAL_M = 28;
/** Page-local layout (px in the 460 x 620 page): baselines. Block 2 ends at x <= 432 and y <= 592, clear of the lifting
 *  corner (lower right); NO VETO's lower edge stays above block 1's first line. */
export const DEAL_LAYOUT = {b1: [146, 208, 270], rule: 298, b2: 338, b2Lead: 35} as const;

export const DealWords: React.FC = () => {
  useCaptionFont();
  const w = PAGE.w - 2 * DEAL_M;
  const s1 = blockSize(BLOCK1, 58, w);
  const s2 = blockSize(BLOCK2, 34, w - 4);
  const L = DEAL_LAYOUT;
  return (
    <>
      <PageHead text="DEAL" />
      {BLOCK1.map((s, i) => (
        <Letter key={`b1${i}`} x={X(DEAL_M)} y={Y(L.b1[i])} size={s1} fill={INK}>
          {s}
        </Letter>
      ))}
      <Ink d={line(X(DEAL_M), Y(L.rule), X(PAGE.w - DEAL_M), Y(L.rule) + 2, {over: [0, 0], seed: `${SEED}/rule`})} width={W.mid} color={INK} />
      {BLOCK2.map((s, i) => (
        <Letter key={`b2${i}`} x={X(DEAL_M)} y={Y(L.b2 + i * L.b2Lead)} size={s2} fill={INK}>
          {s}
        </Letter>
      ))}
    </>
  );
};

/** Google's page (P11), at the deal page's size, place, ground and tone: GOOGLE SAYS; its principles; the safe-channels
 *  line (a paraphrase: no quote marks); no retaliation "of any kind" (that quote in quote marks). Two pencil underlines
 *  read along on "principles" (1.84) and "bans" (2.56). */
export const GOOGLE_ROWS = ['it follows its', 'AI principles', 'staff can safely', 'raise concerns', 'bans retaliation', '"of any kind"'];
const G_M = 32;
export const GOOGLE_LAYOUT = {rows: [163, 225, 318, 380, 479, 535], under: [238, 492]} as const;

export const GoogleWords: React.FC<{underlines?: [number, number][]}> = ({underlines = [[1.84, 0.3], [2.56, 0.4]]}) => {
  useCaptionFont();
  const s = blockSize(GOOGLE_ROWS, 46, PAGE.w - 2 * G_M);
  const L = GOOGLE_LAYOUT;
  const ul = (row: number, y: number, k: number) => {
    const x0 = X(G_M - 6);
    const x1 = X(G_M) + textW(GOOGLE_ROWS[row], s) + 8;
    return smooth([[x0, Y(y) + 2], [(x0 + x1) / 2, Y(y) - 1], [x1, Y(y) + 3]].map(([x, yy]) => [x, yy + k] as Pt));
  };
  return (
    <>
      <PageHead text="GOOGLE SAYS" />
      {GOOGLE_ROWS.map((r, i) => (
        <Letter key={`g${i}`} x={X(G_M)} y={Y(L.rows[i])} size={s} fill={INK}>
          {r}
        </Letter>
      ))}
      {underlines.map(([at, dur], i) => (
        <Ink key={`u${i}`} d={ul(i === 0 ? 1 : 4, L.under[i], 0)} at={at} dur={dur} pace="free" width={5} color={INK} taper={false} seed={`${SEED}/u${i}`} />
      ))}
    </>
  );
};

/** The signed DEAL page (P7): DEAL (the shared header), its typed body (word dashes), two signatures side by side in
 *  two clearly different hands (two parties, never one person signing twice). The APRIL 2026 stamp lands at the top
 *  right, under the header (P7.tsx). No words but DEAL. */
export const SignedDealWords: React.FC = () => {
  useCaptionFont();
  const body = wordRows(X(38), Y(148), PAGE.w - 76, 8, 33, `${SEED}/p7body`, [3]);
  const sigs = [loopySignature(X(46), Y(522), 156, `${SEED}/sigA`), angularSignature(X(262), Y(514), 118, `${SEED}/sigB`)];
  return (
    <>
      <PageHead text="DEAL" />
      <Ink d={body} width={3.4} color={INK} taper={false} />
      {[0, 1].map((k) => {
        const x0 = X(38 + k * 214);
        const y0 = Y(536);
        return (
          <React.Fragment key={`sig${k}`}>
            <Ink d={line(x0, y0, x0 + 172, y0 + 1, {over: [0, 0], seed: `${SEED}/sl${k}`})} width={W.far} color={INK} />
            <Ink d={sigs[k]} width={k ? 3.2 : 3.8} color={INK} taper={false} />
            <Ink d={wordRows(x0, y0 + 26, 110, 1, 0, `${SEED}/sn${k}`, [], 2)} width={2.2} color={INK} taper={false} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** Rows of typed words as dashes (a document's body at a glance): n rows from (x, y), `gap` apart; a paragraph break
 *  after the rows in `breaks`; the last row of a paragraph is short. */
const wordRows = (x: number, y: number, w: number, n: number, gap: number, seed: string, breaks: number[] = [], words = 0): string => {
  const r = rng(seed);
  let d = '';
  let yy = y;
  for (let i = 0; i < n; i++) {
    const end = breaks.includes(i) || i === n - 1;
    const span = words ? w : end ? w * r.range(0.4, 0.62) : w * r.range(0.9, 1);
    let cx = x;
    let k = 0;
    while (cx < x + span - 14 && (!words || k < words)) {
      const len = Math.min(r.range(16, 64), x + span - cx);
      d += `M${cx.toFixed(1)} ${(yy + r.jitter(0.8)).toFixed(1)}L${(cx + len).toFixed(1)} ${(yy + r.jitter(0.8)).toFixed(1)}`;
      cx += len + 13;
      k++;
    }
    yy += gap + (breaks.includes(i) ? gap * 0.6 : 0);
  }
  return d;
};

/** Signature 1: a wide, loopy, right-slanted hand (a prolate cycloid: tall loops on top) with a big opening loop and
 *  an underline swept back to the left. (x, y) = the start on the baseline; w = its width. */
const loopySignature = (x: number, y: number, w: number, seed: string): string => {
  const r = rng(seed);
  const pts: Pt[] = [];
  const turns = 4.5;
  const a = w / (turns * 2 * Math.PI);
  for (let th = 0; th <= turns * 2 * Math.PI; th += 0.32) {
    const b = a * 2.6 * (1 + 0.25 * Math.sin(th * 0.7 + r.range(0, 3)));
    const yy = y - b * (1 - Math.cos(th)) * 0.9 - 2;
    const xx = x + a * th - b * Math.sin(th) * 0.5;
    pts.push([xx - (yy - y) * 0.38, yy]);
  }
  const first = smooth([[x - 4, y], [x - 18, y - 30], [x - 2, y - 58], [x + 14, y - 34], [x - 6, y - 4], [x + 6, y + 2]]);
  const tail = smooth([[x + w * 0.92, y - 6], [x + w * 1.02, y + 8], [x + w * 0.6, y + 14], [x + w * 0.1, y + 10]]);
  return first + smooth(pts) + tail;
};

/** Signature 2: a short, angular, back-slanted hand (sharp zigzags, a higher baseline), a crossing bar and a dot. */
const angularSignature = (x: number, y: number, w: number, seed: string): string => {
  const r = rng(seed);
  const pts: Pt[] = [[x, y], [x + 4, y - 40], [x + 12, y]];
  let cx = x + 12;
  let up = true;
  while (cx < x + w - 10) {
    cx += r.range(9, 15);
    const h = up ? r.range(10, 24) : r.range(0, 4);
    pts.push([cx + h * 0.25, y - h]);
    up = !up;
  }
  pts.push([x + w, y - 2]);
  const d = pts.map(([px, py], i) => `${i ? 'L' : 'M'}${px.toFixed(1)} ${py.toFixed(1)}`).join('');
  const bar = `M${(x - 6).toFixed(1)} ${(y - 26).toFixed(1)}L${(x + 30).toFixed(1)} ${(y - 30).toFixed(1)}`;
  const dot = `M${(x + w + 12).toFixed(1)} ${(y - 6).toFixed(1)}L${(x + w + 14).toFixed(1)} ${(y - 7).toFixed(1)}`;
  return d + bar + dot;
};

// ---------------------------------------------------------------- stamps (the kit's Stamp, on the board's paper backing)

/** NO VETO / APRIL 2026: the kit Stamp with the board's paper backing (`backing`: lane L4's InsertStamp, folded back into
 *  kit/Props.tsx Stamp by the assembler). */
export const InsertStamp = Stamp;

// ---------------------------------------------------------------- insert life

/** A glass of water from above (centre x, y; rim radius r) in the lamp's pool: the surface ripples, rings growing from
 *  the middle every ~1.5 s (filled near-white bands, 5-9 px: they read at phone size), a burst of three on each kick
 *  (a stamp's slam, the slid document landing). */
const WaterGlass: React.FC<{x: number; y: number; r: number; kicks: number[]}> = ({x, y, r, kicks}) => {
  const t = useTime();
  const wr = r * 0.8;
  const rings: number[] = [];
  // ambient: two rings in flight, a new one every 1.5 s, each growing over 1.1 s
  for (let k = 0; k < 2; k++) {
    const u = loopT(t, 1.5, k * 0.75) / 1.1;
    if (u < 1) rings.push(u);
  }
  for (const at of kicks) {
    for (let k = 0; k < 3; k++) {
      const u = (t - at - 0.09 - k * 0.12) / 0.6;
      if (u >= 0 && u < 1) rings.push(u);
    }
  }
  const ann = (rad: number, th: number) => {
    const ro = Math.min(wr - 1, rad + th / 2);
    const ri = Math.max(0.5, rad - th / 2);
    return `M${x + ro} ${y}A${ro} ${ro} 0 1 0 ${x - ro} ${y}A${ro} ${ro} 0 1 0 ${x + ro} ${y}ZM${x + ri} ${y}A${ri} ${ri} 0 1 1 ${x - ri} ${y}A${ri} ${ri} 0 1 1 ${x + ri} ${y}Z`;
  };
  return (
    <>
      <Fill d={blob(x + 9, y + 12, r, r, {seed: `${SEED}/wgs`, wobble: 0.01})} color={COLD.shade} offset={false} />
      <Fill d={blob(x, y, r, r, {seed: `${SEED}/wg`, wobble: 0.01})} color={COLD.glass} offset={false} />
      <Fill d={blob(x, y, wr, wr, {seed: `${SEED}/ww`, wobble: 0.01})} color={COLD.water} offset={false} />
      <Live c={[x, y]}>
        {rings.map((u, i) => (
          <path key={i} d={ann(5 + u * (wr - 9), 9 - 4 * u)} fill={COLD.shirt} fillRule="evenodd" />
        ))}
        <path d={`M${x - r * 0.72} ${y - r * 0.2}A${r * 0.76} ${r * 0.76} 0 0 1 ${x - r * 0.12} ${y - r * 0.74}L${x - r * 0.08} ${y - r * 0.62}A${r * 0.64} ${r * 0.64} 0 0 0 ${x - r * 0.6} ${y - r * 0.14}Z`} fill={COLD.shirt} />
      </Live>
      <Ink d={ellipse(x, y, r, r, {seed: `${SEED}/wgI`}) + ellipse(x, y, wr, wr, {seed: `${SEED}/wwI`})} width={W.mid} color={COLD.ink} />
    </>
  );
};


// ---------------------------------------------------------------- the near edge of the desk (ours)

/** A pencil and a stapler in the bottom centre, under the pad (set px; at the insert framing they sit at the frame's
 *  bottom, beside the kit's stamp pad and rubber stamp). Nothing on the page's axis reads as a keyboard. */
const DeskFront: React.FC = () => {
  const pencil = {x: 290, y: 1372, l: 230};
  const st = {x: 300, y: 1450, l: 200, w: 46};
  return (
    <>
      <XG m={mat.about(mat.rotate(-4), pencil.x + pencil.l / 2, pencil.y)}>
        <Fill d={roundRect(pencil.x, pencil.y - 10, pencil.l, 20, 4)} color={COLD.folder} offset={false} />
        <Fill rect={[pencil.x + pencil.l - 26, pencil.y - 10, 26, 20]} color={COLD.folderTab} offset={false} />
        <Fill d={`M${pencil.x} ${pencil.y - 10}L${pencil.x - 34} ${pencil.y}L${pencil.x} ${pencil.y + 10}Z`} color={CC.paperEdge} offset={false} />
        <Fill d={`M${pencil.x - 24} ${pencil.y - 3}L${pencil.x - 34} ${pencil.y}L${pencil.x - 24} ${pencil.y + 3}Z`} color={COLD.ink} offset={false} />
        <Ink d={roundRect(pencil.x, pencil.y - 10, pencil.l, 20, 4, {seed: `${SEED}/pcI`}) + `M${pencil.x} ${pencil.y - 10}L${pencil.x - 34} ${pencil.y}L${pencil.x} ${pencil.y + 10}`} width={W.far} color={COLD.ink} />
      </XG>
      {/* a stapler from above: its base, the top arm, the metal strike plate at the front */}
      <XG m={mat.about(mat.rotate(9), st.x + st.l / 2, st.y)}>
        <Fill d={roundRect(st.x + 10, st.y - st.w / 2 + 12, st.l, st.w, st.w / 2)} color={COLD.shade} offset={false} />
        <Fill d={roundRect(st.x, st.y - st.w / 2, st.l, st.w, st.w / 2)} color={COLD.folderTab} seed={`${SEED}/stb`} />
        <Fill d={roundRect(st.x + 8, st.y - st.w / 2 + 8, st.l - 50, st.w - 16, (st.w - 16) / 2)} color={COLD.folder} offset={false} />
        <Fill d={roundRect(st.x + st.l - 40, st.y - st.w / 2 + 6, 32, st.w - 12, 8)} color={COLD.metal} offset={false} />
        <Ink d={roundRect(st.x, st.y - st.w / 2, st.l, st.w, st.w / 2, {seed: `${SEED}/stI`}) + roundRect(st.x + 8, st.y - st.w / 2 + 8, st.l - 50, st.w - 16, (st.w - 16) / 2, {seed: `${SEED}/stI2`})} width={W.far} color={COLD.ink} />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- the official at our edge, taking notes

/** The memo pad (set px, before its turn): top-bound, ruled, turned 13 degrees (a right-hander's slant), at the
 *  frame's lower right over the desk pad's corner, so the writing hand stays IN the frame (screen y ~1500-1830). */
const NOTE = {x: 580, y: 1355, w: 240, h: 250, rot: -13} as const;
const noteM = mat.about(mat.rotate(NOTE.rot), NOTE.x + NOTE.w / 2, NOTE.y + NOTE.h / 2);
/** Rows per sheet (then the official flips the sheet over the binding) and the ruled lines. */
const ROWS = 5;
const RULES = 6;
const rowY = (i: number) => NOTE.y + 70 + i * 34;
const ROW_X = NOTE.x + 26;
const rowLen = (key: number) => 140 + rand(`${SEED}/rowlen`, key) * 56;
/** The writing clock (film s): a row every ROW_S; a sheet holds ROWS rows, so a sheet flips every 10 s, at 21.7 (in
 *  P8, unseen) and at 31.7 (P11 t 3.5: the second half of Google's page gets its beat). */
const ROW_S = 2.0;
const W0 = 21.7;
const WRITE = 0.8; // the share of a row's time spent writing; the rest is the hand's return to the next row
const FLIP = 0.4; // the sheet's flip over the binding (s), at the start of each sheet's first row

/** A handwritten row (a cursive scribble, words with gaps) from ROW_X to x1, on row i; `key` seeds the words. */
const scribble = (i: number, key: number, x1: number): string => {
  const r = rng(`${SEED}/scr${key}`);
  const y = rowY(i) - 4;
  let d = '';
  let x = ROW_X;
  while (x < x1 - 4) {
    const wl = r.range(16, 46);
    const end = Math.min(x + wl, x1);
    const amp = r.range(3, 6);
    const ph = r.range(0, 6.28);
    const pts: string[] = [];
    for (let xx = x; xx <= end; xx += 3.2) pts.push(`${pts.length ? 'L' : 'M'}${xx.toFixed(1)} ${(y - amp * (0.5 + 0.5 * Math.sin((xx - x) * 0.62 + ph)) - (r.chance(0.08) ? 6 : 0)).toFixed(1)}`);
    d += pts.join('');
    x = end + r.range(8, 13);
  }
  return d;
};
/** A whole sheet's notes up to row `upto` (exclusive), plus row `upto` written to x1 (if given). */
const sheetNotes = (sheet: number, upto: number, x1?: number) => {
  let d = '';
  for (let i = 0; i < upto; i++) d += scribble(i, sheet * 10 + i, ROW_X + rowLen(sheet * 10 + i));
  if (x1 !== undefined && upto < ROWS) d += scribble(upto, sheet * 10 + upto, x1);
  return d;
};

/** The official's notes and right hand: the hand moves along the row as it writes (stepped jitter at 12 drawings/s),
 *  lifts back to the next row, and after the last row flips the sheet over the binding; the sleeve runs to the lower
 *  right, off frame (the official sits at our edge). */
const NotesOfficial: React.FC<{T: number}> = ({T}) => {
  const C = COLD;
  const kk = (T - W0) / ROW_S;
  const n = Math.floor(kk);
  const u = kk - n;
  const row = ((n % ROWS) + ROWS) % ROWS;
  const sheet = Math.floor(n / ROWS);
  const key = sheet * 10 + row;
  const len = rowLen(key);
  const tu = u * ROW_S; // s into this row
  const flipping = row === 0 && tu < FLIP;
  const wStart = row === 0 ? FLIP : 0;
  const writing = !flipping && u < WRITE;
  const uw = Math.min(1, Math.max(0, (tu - wStart) / (WRITE * ROW_S - wStart)));
  // the pen tip, notepad-local (unturned set px)
  const st = Math.round(stepT(T, 12) * 12);
  const jx = writing ? (rand(`${SEED}/jx`, st) - 0.5) * 4 : 0;
  const jy = writing ? (rand(`${SEED}/jy`, st) - 0.5) * 6 : 0;
  let tip: Pt;
  let lift = 0;
  if (flipping) {
    tip = [ROW_X - 6, rowY(0) - 14];
    lift = 1;
  } else if (writing) tip = [ROW_X + uw * len + jx, rowY(row) - 6 + jy];
  else {
    const v = ease.inOutSine((u - WRITE) / (1 - WRITE));
    const nr = (row + 1) % ROWS;
    const to: Pt = nr === 0 ? [ROW_X - 6, rowY(0) - 14] : [ROW_X, rowY(nr) - 6];
    tip = [ROW_X + len + (to[0] - (ROW_X + len)) * v, rowY(row) - 6 + (to[1] - (rowY(row) - 6)) * v];
    lift = Math.sin(v * Math.PI * (nr === 0 ? 0.5 : 1));
  }
  const P = apply(noteM, tip);
  // the hand: its forward direction from the (off-frame) shoulder toward the tip, turned 12 degrees to the left
  const S: Pt = [1060, 2060];
  const dl = Math.hypot(P[0] - S[0], P[1] - S[1]);
  const f0: Pt = [(P[0] - S[0]) / dl, (P[1] - S[1]) / dl];
  const a = (-12 * Math.PI) / 180;
  const f: Pt = [f0[0] * Math.cos(a) - f0[1] * Math.sin(a), f0[0] * Math.sin(a) + f0[1] * Math.cos(a)];
  const rr: Pt = [-f[1], f[0]];
  const bk: Pt = [-f[0], -f[1]];
  // the knuckle centre K: the pen's tip sits at hand-local (-42, -92)
  const K: Pt = [P[0] + 42 * rr[0] + 92 * bk[0], P[1] + 42 * rr[1] + 92 * bk[1]];
  const s = 1 + 0.035 * lift;
  const handM: Mat = mat.compose([rr[0], rr[1], bk[0], bk[1], K[0], K[1]] as Mat, mat.scale(s));
  const wrist = apply(handM, [0, 84]);
  // the sleeve: a tube from the cuff to the shoulder, off frame
  const ax = S[0] - wrist[0];
  const ay = S[1] - wrist[1];
  const al = Math.hypot(ax, ay);
  const nx = -ay / al;
  const ny = ax / al;
  const sleeve = `M${wrist[0] + nx * 40} ${wrist[1] + ny * 40}L${S[0] + nx * 70} ${S[1] + ny * 70}L${S[0] - nx * 70} ${S[1] - ny * 70}L${wrist[0] - nx * 40} ${wrist[1] - ny * 40}Z`;
  // the current sheet's notes; while it flips, the old sheet (full) folds over the binding: its front shrinks to the
  // binding line, then its back rises a little past it and is gone (folded under)
  const written = flipping ? '' : sheetNotes(sheet, row, writing ? ROW_X + uw * len : ROW_X + len);
  const fp = flipping ? tu / FLIP : 1;
  const fs = Math.cos(Math.PI * Math.min(1, fp) * 0.6); // 1 -> -0.31
  const bindY = NOTE.y + 2;
  const flipM = mat.about(mat.scale(1, fs), NOTE.x, bindY);
  let rules = '';
  for (let i = 0; i < RULES; i++) rules += `M${NOTE.x + 10} ${rowY(i)}L${NOTE.x + NOTE.w - 10} ${rowY(i)}`;
  const rings: string[] = [];
  for (let i = 0; i < 8; i++) rings.push(roundRect(NOTE.x + 18 + i * 29, NOTE.y - 12, 10, 30, 5));
  // hand-local shapes (x to the hand's right, y back toward the wrist; knuckles at y ~ 0)
  const back = smooth([[-36, -4], [-14, -12], [10, -11], [32, -4], [41, 22], [35, 58], [24, 80], [-22, 80], [-36, 60], [-43, 24]], {closed: true, tension: 0.35});
  const ridge = smooth([[-30, 6], [-21, 1], [-13, 6], [-4, 1], [5, 6], [14, 2], [24, 7]]);
  const fingers = [
    roundRect(-39, -50, 18, 54, 9),
    roundRect(-19, -34, 18, 38, 9),
    roundRect(1, -25, 17, 29, 8.5),
    roundRect(19, -14, 15, 20, 7.5),
  ].join('');
  const thumbM: Mat = mat.about(mat.rotate(22), -44, 6);
  const thumb = roundRect(-54, -30, 19, 46, 9.5);
  const pen = polyPath([[-46, -80], [-38, -80], [-15, 50], [-25, 52]]);
  const nib = polyPath([[-46, -80], [-42, -92], [-38, -80]]);
  return (
    <>
      {/* the memo pad: its shadow, the sheets under, the top sheet, rules, a margin, the notes, the binding */}
      <XG m={noteM}>
        <Fill rect={[NOTE.x + 12, NOTE.y + 14, NOTE.w, NOTE.h]} color={C.shade} offset={false} />
        <Fill rect={[NOTE.x + 5, NOTE.y + 6, NOTE.w, NOTE.h]} color={CC.paperEdge} offset={false} />
        <Fill rect={[NOTE.x, NOTE.y, NOTE.w, NOTE.h]} color={CC.paper} seed={`${SEED}/note`} />
        <Ink d={rules} width={W.hair} color={C.water} taper={false} />
        <Ink d={`M${NOTE.x + 18} ${NOTE.y + 22}L${NOTE.x + 18} ${NOTE.y + NOTE.h - 8}`} width={W.hair} color={C.folder} taper={false} />
        {written ? <Ink d={written} width={W.far} color={CC.stamp} taper={false} /> : null}
        <Ink d={rect(NOTE.x, NOTE.y, NOTE.w, NOTE.h, {seed: `${SEED}/noteI`, over: 'small'})} width={W.mid} color={C.ink} />
        {flipping ? (
          <XG m={flipM}>
            <Fill rect={[NOTE.x, NOTE.y, NOTE.w, NOTE.h]} color={fs >= 0 ? CC.paper : CC.paperEdge} offset={false} />
            {fs >= 0 ? <Ink d={rules} width={W.hair} color={C.water} taper={false} /> : null}
            {fs >= 0 ? <Ink d={sheetNotes(sheet - 1, ROWS)} width={W.far} color={CC.stamp} taper={false} /> : null}
            <Ink d={rect(NOTE.x, NOTE.y, NOTE.w, NOTE.h, {seed: `${SEED}/flipI`, over: [0, 0]})} width={W.mid} color={C.ink} />
          </XG>
        ) : null}
        <Fill rect={[NOTE.x - 4, NOTE.y - 22, NOTE.w + 8, 40]} color={C.folderTab} seed={`${SEED}/noteb`} />
        <Ink d={rect(NOTE.x - 4, NOTE.y - 22, NOTE.w + 8, 40, {seed: `${SEED}/notebI`, over: [0, 0]})} width={W.mid} color={C.ink} />
        <Fill d={rings.join('')} color={C.metal} offset={false} />
        <Ink d={rings.join('')} width={W.hair} color={C.ink} taper={false} />
      </XG>
      {/* the sleeve (a mid wine: the official), the cuff, the back of the right hand holding the pen */}
      <Fill d={sleeve} color={WINE} offset={false} />
      <Ink d={sleeve} width={W.mid} color={C.ink} />
      <XG m={handM}>
        <Fill d={roundRect(-36, 70, 76, 30, 10)} color={C.shirt} offset={false} />
        <Ink d={roundRect(-36, 70, 76, 30, 10, {seed: `${SEED}/hcuff`})} width={W.far} color={C.ink} />
        <Fill d={back} color={CC.skin2} offset={false} />
        <Ink d={back} width={W.mid} color={C.ink} />
        <Ink d={ridge} width={W.hair} color={C.ink} taper={false} />
        <Fill d={pen} color={C.pen} offset={false} />
        <Fill d={nib} color={C.metal} offset={false} />
        <Ink d={nib} width={W.hair} color={C.ink} taper={false} />
        <XG m={thumbM}>
          <Fill d={thumb} color={CC.skin2} offset={false} />
          <Ink d={thumb} width={W.far} color={C.ink} />
        </XG>
        <Fill d={fingers} color={CC.skin2} offset={false} />
        <Ink d={fingers} width={W.far} color={C.ink} />
      </XG>
    </>
  );
};
