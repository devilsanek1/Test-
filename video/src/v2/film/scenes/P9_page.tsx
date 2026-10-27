// P9_page.tsx (lane L4-pages): THE COLD INSERT SHOT shared by P7, P9, P10 and P11, so the deal pages and Google's page
// sit on the SAME set, at the same page box, ground, tone, dressing and life (fairness: equal size, ground and tone).
//
// The set is the kit's ColdSet (the official desk at dusk, straight down, edge to edge) with InsertPage (the warm white
// page, never angled). This file adds only what the four panels share:
//   - the framing: one page centre on screen (540, PAGE_CY) for every panel; P7 / P9 / P11 at INSERT_Z (the page reads
//     ~550 px wide: block 2 of the deal at ~41 px, readable at phone size), P10 = 0.85 x that (the boarded pull-back).
//     Holds breathe 1.5 % about the page centre (the CAMERA holds; the world keeps living).
//   - the page words, hand-lettered with the kit's Letter: the signed DEAL page (P7), the deal's words in two quoted
//     blocks (P9, P10: block 1 never without block 2), GOOGLE SAYS (P11, with its two read-along underlines).
//   - insert life the kit set does not have at this framing: a water glass whose surface ripples (and jumps on a stamp's
//     slam), and the official's hand sliding a document onto the left pile where it is SEEN at this zoom (the kit's own
//     slide happens at x < 100, off screen at 1.2x: kit slide is off here, REQUESTS line in the lane report).
//   - the near edge of the desk (ours): a keyboard, a pencil, its cable, and the official who sits there TYPING (only
//     the hands and maroon sleeves, from the frame's bottom edge: people near, never a face), stepped at 10 drawings/s
//     in bursts, so the bottom of the frame always lives (G6 adds secondary motion).
//   - the stamp with the board's paper backing (NO VETO lands across the page's top edge, over the DEAL heading).
// No cat, no Google lettering on P7-P10, no hero cobalt, no pop: stamps and underlines are ink.
import React from 'react';
import {World} from '../../../lib/World';
import {InkScale} from '../../../lib/inkComp';
import {useCaptionFont} from '../../../lib/font';
import {blob, ellipse, line, rect, roundRect, smooth} from '../../../lib/sketch';
import {rand, rng} from '../../../lib/rng';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
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

/** The shot matrix: the set scaled by z about the page centre, the page centre placed at (540, PAGE_CY). */
export const insertMat = (z: number) => mat.compose(mat.translate(0, PAGE_CY - COLD_CENTRE[1]), mat.about(mat.scale(z), COLD_CENTRE[0], COLD_CENTRE[1]));
/** Set px -> screen px for a shot zoom z (for checks and screen-space placement). */
export const insertPt = (z: number, p: Pt): Pt => [COLD_CENTRE[0] + (p[0] - COLD_CENTRE[0]) * z, PAGE_CY + (p[1] - COLD_CENTRE[1]) * z];

export type ColdInsertProps = {
  /** The shot zoom (INSERT_Z or P10_Z). */
  z: number;
  /** The panel's length (s): the hold breathes in 1.5 % over it; 0 = no breathing. */
  breathe?: number;
  /** The official's hand slides a document onto the left pile at this scene time (s); false = not in this shot. */
  slide?: number | false;
  /** Stamp slam times (s): the water glass jumps (a burst of rings) on each. */
  kicks?: number[];
  /** The page's words (set px; draw them with PAGE). */
  children?: React.ReactNode;
  /** Drawn over the page (stamps). */
  over?: React.ReactNode;
};

/** The cold insert: the kit's cold set, the shared insert life, the page and its words. */
export const ColdInsert: React.FC<ColdInsertProps> = ({z, breathe = 0, slide = false, kicks = [], children, over}) => {
  const t = useTime();
  const zz = z * (1 + (breathe > 0 ? 0.015 * prog(t, 0, breathe, ease.inOutSine) : 0));
  return (
    <World sky={COLD.table}>
      <XG m={insertMat(zz)}>
        <InkScale zoom={zz}>
          <ColdSet zoom={1} slide={false} seed="cold" />
          <DeskFront />
          <TypingOfficial />
          <WaterGlass x={182} y={985} r={52} kicks={kicks} />
          {slide !== false ? <OfficialSlide at={slide} /> : null}
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

/** The deal's words, in two quoted blocks (P9, P10): DEAL; block 1 "any lawful government purpose" (big); a rule; block 2,
 *  the oversight clause in full (smaller, never cut). Fairness: block 1 is never drawn without block 2. */
export const BLOCK1 = ['"any lawful', 'government', 'purpose"'];
export const BLOCK2 = ['"should not be used', 'for domestic mass', 'surveillance or', 'autonomous weapons', '(including target', 'selection) without', 'appropriate human', 'oversight and control"'];
const DEAL_M = 28;
/** Page-local layout (px in the 460 x 620 page): baselines. Block 2 ends at x <= 432 and y <= 592, clear of the lifting
 *  corner (lower right); NO VETO's lower edge stays above block 1's first line. */
export const DEAL_LAYOUT = {head: 52, b1: [146, 208, 270], rule: 298, b2: 338, b2Lead: 35} as const;

export const DealWords: React.FC = () => {
  useCaptionFont();
  const w = PAGE.w - 2 * DEAL_M;
  const s1 = blockSize(BLOCK1, 58, w);
  const s2 = blockSize(BLOCK2, 34, w - 4);
  const L = DEAL_LAYOUT;
  return (
    <>
      <Letter x={X(PAGE.w / 2)} y={Y(L.head)} size={40} anchor="middle" fill={INK} spacing={3}>
        DEAL
      </Letter>
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
export const GOOGLE_LAYOUT = {head: 52, rows: [163, 225, 318, 380, 479, 535], under: [238, 492]} as const;

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
      <Letter x={X(PAGE.w / 2)} y={Y(L.head)} size={44} fit={PAGE.w - 2 * G_M} anchor="middle" fill={INK} spacing={2}>
        GOOGLE SAYS
      </Letter>
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

/** The signed DEAL page (P7): DEAL, its typed body (word dashes), two signatures side by side. No words but DEAL. */
export const SignedDealWords: React.FC = () => {
  useCaptionFont();
  const body = wordRows(X(38), Y(132), PAGE.w - 76, 9, 33, `${SEED}/p7body`, [4]);
  return (
    <>
      <Letter x={X(38)} y={Y(72)} size={60} fill={INK} spacing={3}>
        DEAL
      </Letter>
      <Ink d={body} width={3.4} color={INK} taper={false} />
      {[0, 1].map((k) => {
        const x0 = X(38 + k * 214);
        const y0 = Y(536);
        return (
          <React.Fragment key={`sig${k}`}>
            <Ink d={line(x0, y0, x0 + 172, y0 + 1, {over: [0, 0], seed: `${SEED}/sl${k}`})} width={W.far} color={INK} />
            <Ink d={signature(x0 + 8, y0 - 14, 150, `${SEED}/sig${k}`)} width={3.6} color={INK} taper={false} />
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

/** A hand signature (loops and a long tail) on a line from (x, y), w wide. */
const signature = (x: number, y: number, w: number, seed: string): string => {
  const r = rng(seed);
  const pts: Pt[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const up = i % 2 ? -r.range(18, 34) : r.range(0, 8);
    pts.push([x + u * w * 0.78 + r.jitter(4), y + up]);
  }
  pts.push([x + w * 0.86, y - 6], [x + w, y - 12]);
  const loopX = x + w * r.range(0.15, 0.3);
  return smooth(pts) + smooth([[loopX, y], [loopX - 12, y - 30], [loopX + 6, y - 44], [loopX + 14, y - 18], [loopX - 4, y + 10]]);
};

// ---------------------------------------------------------------- stamps (the kit's Stamp, on the board's paper backing)

/** The kit's slam (Props.tsx Stamp): from 1.6x in 0.09 s, a small jolt after; the backing follows the same scale. */
const slamScale = (t: number, at: number) => {
  const p = prog(t, at, 0.09, ease.inQuad);
  const settle = Math.max(0, t - at - 0.09);
  const jolt = settle > 0 && settle < 0.12 ? 0.035 * Math.sin((Math.PI * settle) / 0.12) : 0;
  return (1.6 - 0.6 * p) * (1 - jolt);
};

/** A stamp (set px centre x, y; width w) slamming at `at` (it LANDS at at + 0.09: put that on the sound). `backing`:
 *  the board's paper fill under it (NO VETO across the page's top edge, over DEAL). Anchor ink, never the pop. */
export const InsertStamp: React.FC<{x: number; y: number; w: number; text: string; at: number; rot?: number; backing?: boolean}> = ({x, y, w, text, at, rot = -6, backing}) => {
  const t = useTime();
  if (t < at) return null;
  const h = w * 0.38;
  return (
    <>
      {backing ? (
        <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot), mat.scale(slamScale(t, at)))}>
          <Fill d={roundRect(-w / 2 + 8, -h / 2 + 10, w, h, h * 0.16)} color={COLD.shade} offset={false} />
          <Fill d={roundRect(-w / 2, -h / 2, w, h, h * 0.16)} color={CC.paper} offset={false} />
        </XG>
      ) : null}
      <Stamp x={x} y={y} w={w} text={text} rot={rot} at={at} />
    </>
  );
};

// ---------------------------------------------------------------- insert life

/** A glass of water from above (centre x, y; rim radius r) in the lamp's pool: the surface ripples, rings growing from
 *  the middle every ~1.5 s (filled near-white bands, 5-9 px: they read at phone size), a burst of three on each stamp's
 *  slam. */
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

/** The official's hand (maroon cuff) slides a document onto the left pile at `at` (0.5 s in, holds 0.35 s, withdraws in
 *  0.4 s; the document stays): the kit's slide, placed where this framing SEES it (hand ~ screen x 50-170, y 1380). */
const OfficialSlide: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  if (t < at) return null;
  const C = COLD;
  const p = prog(t, at, 0.5, ease.outCubic);
  const out = prog(t, at + 0.85, 0.4, ease.inCubic);
  const dx = -420 * (1 - p);
  const doc = {x: -60 + dx, y: 1206, w: 290, h: 350};
  const hx = doc.x + 196 - 520 * out;
  const hy = doc.y + 128;
  const M = mat.about(mat.rotate(-7), doc.x + doc.w / 2, doc.y + doc.h / 2);
  const sleeve = roundRect(hx - 560, hy - 56, 500, 112, 30);
  const cuff = roundRect(hx - 70, hy - 50, 32, 100, 8);
  const hand = smooth([[hx - 40, hy - 46], [hx + 30, hy - 52], [hx + 70, hy - 30], [hx + 76, hy + 6], [hx + 50, hy + 40], [hx - 40, hy + 46]], {closed: true, tension: 0.35});
  const thumb = smooth([[hx + 6, hy - 48], [hx + 34, hy - 70], [hx + 56, hy - 62], [hx + 40, hy - 40]], {closed: true, tension: 0.35});
  const fingers = [-26, -6, 14].map((fy, i) => line(hx + 24, hy + fy, hx + 66, hy + fy + 4, {over: [0, 0], seed: `${SEED}/f${i}`})).join('');
  return (
    <>
      <XG m={M}>
        <Fill rect={[doc.x + 10, doc.y + 12, doc.w, doc.h]} color={C.shade} offset={false} />
        <Fill rect={[doc.x, doc.y, doc.w, doc.h]} color={CC.paper} offset={false} />
        <Ink d={rect(doc.x, doc.y, doc.w, doc.h, {seed: `${SEED}/sdI`, over: 'small'})} width={W.mid} color={C.ink} />
        <Ink d={wordRows(doc.x + 30, doc.y + 52, 220, 7, 32, `${SEED}/sdt`, [2])} width={W.far} color={C.ink} taper={false} />
      </XG>
      {out < 1 ? (
        <>
          <Fill d={sleeve} color={C.cuff} offset={false} />
          <Fill d={cuff} color={C.shirt} offset={false} />
          <Fill d={thumb + hand} color={CC.skin2} offset={false} />
          <Ink d={sleeve + cuff + thumb + hand} width={W.mid} color={C.ink} />
          <Ink d={fingers} width={W.far} color={C.ink} />
        </>
      ) : null}
    </>
  );
};


// ---------------------------------------------------------------- the near edge of the desk (ours): keyboard + typist

const KB = {x: 300, y: 1412, w: 500, h: 160};

/** A keyboard (keys as flat fills: fine detail without ink weight), its cable to the right, a pencil beside the
 *  blotter. Set px, under the blotter's lower edge (1330): at the insert framing it sits at the frame's bottom. */
const DeskFront: React.FC = () => {
  const keys: string[] = [];
  const pad = 14;
  const gx = 6;
  const kw = (KB.w - 2 * pad - 12 * gx) / 13;
  const kh = (KB.h - 2 * pad - 4 * gx) / 5;
  for (let j = 0; j < 4; j++)
    for (let i = 0; i < 13 - (j === 3 ? 1 : 0); i++) keys.push(roundRect(KB.x + pad + i * (kw + gx) + (j % 2) * kw * 0.3, KB.y + pad + j * (kh + gx), kw, kh, 5));
  keys.push(roundRect(KB.x + pad + 3 * (kw + gx), KB.y + pad + 4 * (kh + gx), 6 * kw + 5 * gx, kh, 5));
  keys.push(roundRect(KB.x + pad, KB.y + pad + 4 * (kh + gx), 2.6 * kw, kh, 5));
  keys.push(roundRect(KB.x + KB.w - pad - 2.6 * kw, KB.y + pad + 4 * (kh + gx), 2.6 * kw, kh, 5));
  const cable = smooth([[KB.x + KB.w - 40, KB.y], [KB.x + KB.w + 10, KB.y - 50], [KB.x + KB.w + 120, KB.y - 40], [KB.x + KB.w + 260, KB.y - 90], [1300, KB.y - 70]]);
  const pencil = {x: 330, y: 1366, l: 230};
  return (
    <>
      <Ink d={cable} width={7} color={COLD.lamp} taper={false} />
      <Fill d={roundRect(KB.x + 10, KB.y + 12, KB.w, KB.h, 18)} color={COLD.shade} offset={false} />
      <Fill d={roundRect(KB.x, KB.y, KB.w, KB.h, 18)} color={COLD.blotterEdge} seed={`${SEED}/kb`} />
      <Fill d={keys.join('')} color={COLD.metal} offset={false} />
      <Ink d={roundRect(KB.x, KB.y, KB.w, KB.h, 18, {seed: `${SEED}/kbI`})} width={W.mid} color={COLD.ink} />
      <XG m={mat.about(mat.rotate(-4), pencil.x + pencil.l / 2, pencil.y)}>
        <Fill d={roundRect(pencil.x, pencil.y - 10, pencil.l, 20, 4)} color={COLD.folder} offset={false} />
        <Fill rect={[pencil.x + pencil.l - 26, pencil.y - 10, 26, 20]} color={COLD.folderTab} offset={false} />
        <Fill d={`M${pencil.x} ${pencil.y - 10}L${pencil.x - 34} ${pencil.y}L${pencil.x} ${pencil.y + 10}Z`} color={CC.paperEdge} offset={false} />
        <Fill d={`M${pencil.x - 24} ${pencil.y - 3}L${pencil.x - 34} ${pencil.y}L${pencil.x - 24} ${pencil.y + 3}Z`} color={COLD.ink} offset={false} />
        <Ink d={roundRect(pencil.x, pencil.y - 10, pencil.l, 20, 4, {seed: `${SEED}/pcI`}) + `M${pencil.x} ${pencil.y - 10}L${pencil.x - 34} ${pencil.y}L${pencil.x} ${pencil.y + 10}`} width={W.far} color={COLD.ink} />
      </XG>
    </>
  );
};

/** One typing hand from above, fingers pointing away from us (set px: the knuckles' centre hx, hy), its sleeve from
 *  (bx, by) below the frame. `press` = the finger pressing a key now (-1 none; it reads shorter from above), `lift` px. */
const TypingHand: React.FC<{hx: number; hy: number; bx: number; by: number; side: 1 | -1; press: number; lift: number; seed: string}> = ({hx, hy, bx, by, side, press, lift, seed}) => {
  const C = COLD;
  const y = hy - lift;
  const wx = hx - side * 6;
  const wy = y + 58;
  // the sleeve: a tube from the wrist down to off-frame
  const ax = bx - wx;
  const ay = by - wy;
  const al = Math.hypot(ax, ay);
  const nx = -ay / al;
  const ny = ax / al;
  const tube = (w0: number, w1: number, x0: number, y0: number, x1: number, y1: number) =>
    `M${x0 + nx * w0} ${y0 + ny * w0}L${x1 + nx * w1} ${y1 + ny * w1}L${x1 - nx * w1} ${y1 - ny * w1}L${x0 - nx * w0} ${y0 - ny * w0}Z`;
  const cuffEnd: Pt = [wx + (ax / al) * 26, wy + (ay / al) * 26];
  const sleeve = tube(44, 62, cuffEnd[0], cuffEnd[1], bx, by);
  const cuff = tube(36, 42, wx + (ax / al) * 4, wy + (ay / al) * 4, cuffEnd[0], cuffEnd[1]);
  const palm = blob(hx, y + 22, 37, 38, {seed: `${seed}/palm`, wobble: 0.02});
  const fingers = [-25, -8.5, 8.5, 25]
    .map((dx, i) => {
      const len = (i === 0 || i === 3 ? 40 : 52) - (i === press ? 16 : 0);
      const fx = hx + dx * side;
      return roundRect(fx - 7, y - len, 14, len + 14, 7);
    })
    .join('');
  const thumb = roundRect(hx - side * 50 - 9, y + 4, 18, 40, 9);
  const thumbM = mat.about(mat.rotate(side * 32), hx - side * 41, y + 24);
  return (
    <>
      <Fill d={sleeve} color={C.cuff} offset={false} />
      <Fill d={cuff} color={C.shirt} offset={false} />
      <XG m={thumbM}>
        <Fill d={thumb} color={CC.skin2} offset={false} />
        <Ink d={thumb} width={W.far} color={C.ink} />
      </XG>
      <Fill d={fingers + palm} color={CC.skin2} offset={false} />
      <Ink d={fingers} width={W.far} color={C.ink} />
      <Ink d={palm} width={W.mid} color={C.ink} />
      <Ink d={sleeve + cuff} width={W.mid} color={C.ink} />
    </>
  );
};

/** The official at our edge of the desk, typing: two hands on the keyboard, stepped at 10 drawings / s, in bursts
 *  (typing ~1.8 s, a pause ~0.8 s when the right hand lifts toward the page); always some motion. */
const TypingOfficial: React.FC = () => {
  const t = useTime();
  const s = stepT(t, 10);
  const k = Math.round(s * 10);
  const burst = loopT(t, 2.6, 0.4) < 1.8;
  const hand = (side: 1 | -1, key: string) => {
    const on = burst && rand(`${SEED}/type/${key}`, k) > 0.25;
    const press = on ? Math.floor(rand(`${SEED}/press/${key}`, k) * 4) : -1;
    const lift = on ? (k % 2 === (side === 1 ? 0 : 1) ? 5 : 0) : side === 1 && !burst ? 16 : 2;
    return press === -1 && !on ? {press: -1, lift} : {press, lift};
  };
  const L = hand(-1, 'l');
  const R = hand(1, 'r');
  const rx = burst ? 0 : 18;
  return (
    <>
      <TypingHand hx={KB.x + 168} hy={KB.y + 112} bx={KB.x + 70} by={2060} side={-1} press={L.press} lift={L.lift} seed={`${SEED}/hl`} />
      <TypingHand hx={KB.x + 348 + rx} hy={KB.y + 112} bx={KB.x + 450} by={2060} side={1} press={R.press} lift={R.lift} seed={`${SEED}/hr`} />
    </>
  );
};
