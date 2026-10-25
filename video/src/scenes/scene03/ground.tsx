// S03's plan sheet (fix round 2): S03 draws the set's 'ground' layer itself so that
//   - the hard-cut frame already reads as a drawn PLAN (finding: f0 was two flat fills): the margin, the far and mid grid
//     rows, the dimension arrows along the kerbs and the title-block frame are inked from frame 0, plus plan furniture (two
//     registration marks where the stamp will land, a dimension line under it, a north arrow, a few note lines, a small
//     dimensioned footprint detail where the set's old title block was);
//   - only the NEAR grid rows draw on, on the 'It's' lead (gridAt): three depth bands, far -> near, 0.03 s apart (fix
//     round 2b), done on 'It's': the plan completes as a wave from the press house toward the viewer (storyboard 'It's';
//     the set draws near -> far); the far rows keep every second ray only (fix round 2b: the field thins with depth);
//   - the set's old inked title block `tb` (world 190-470 x 1700-1860, a stray empty box once the v3 title-block CARD
//     exists) is NOT drawn (sets request: skip `tb` when `titleBlock` is given).
// The geometry (sheet, dog-ear, edge ink, margin, the three grid groups, the kerb dimension arrows, the title-block
// frame) is copied from sets/BlueprintStreet.tsx `G` / `TB_FRAME` with the SAME seeds and rng order, so the lines are
// identical to the set's. If that set's geometry changes, update this copy (like the side-row copy in plan.tsx).

import React from 'react';
import {palette} from '../../lib/theme';
import {springAt, springs, useTime} from '../../lib/time';
import {mat, XG} from '../../lib/xf';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {arrow, circle, line, polyPath, rect, Pt} from '../../lib/sketch';
import {rng} from '../../lib/rng';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {BLUEPRINT, popUpK, SI} from '../shared/sets';
import {STAMP} from './stamp';
import {CARD_BOX} from './card';

const G = (() => {
  const s = 'bps';
  const VP = BLUEPRINT.vp;
  const yF = 1238;
  const lB = (y: number) => 360 - ((360 + 140) * (y - 1180)) / (1708 - 1180);
  const rB = (y: number) => 760 + ((1226 - 760) * (y - 1180)) / (1726 - 1180);
  const inset = (y: number) => 10 + ((y - yF) / (2060 - yF)) * 34;
  const sL = (y: number) => lB(y) + inset(y);
  const sR = (y: number) => rB(y) - inset(y);
  const sheet = polyPath([[sL(yF) + 22, yF], [sR(yF), yF], [sR(2080), 2080], [sL(2080), 2080], [sL(yF + 22), yF + 22]]);
  const dogEar = polyPath([[sL(yF) + 22, yF], [sL(yF + 22), yF + 22], [sL(yF) + 26, yF + 26]]);
  const edgeInk =
    line(sL(yF) + 22, yF, sR(yF), yF, {seed: `${s}/ef`, over: [0, 6], breaks: false}) +
    line(sL(yF + 22), yF + 22, sL(2060), 2060, {seed: `${s}/el`, over: 0}) +
    line(sR(yF), yF, sR(2060), 2060, {seed: `${s}/er`, over: 0}) +
    line(sL(yF) + 22, yF, sL(yF + 22), yF + 22, {seed: `${s}/ed`, over: 0, breaks: false}) +
    line(sL(yF + 22), yF + 22, sL(yF) + 26, yF + 26, {seed: `${s}/ed2`, over: 0, breaks: false});
  const m = (y: number) => 14 + ((y - yF) / (2060 - yF)) * 26;
  const yM = yF + 12;
  let margin = line(sL(yM) + m(yM) + 18, yM, sR(yM) - m(yM), yM, {seed: `${s}/mf`, over: [0, 0]}) + line(sL(yM + 20) + m(yM + 20), yM + 20, sL(2060) + m(2060), 2060, {seed: `${s}/ml`, over: [0, 0]}) + line(sR(yM) - m(yM), yM, sR(2060) - m(2060), 2060, {seed: `${s}/mr`, over: [0, 0]});
  for (let x = sL(yM) + 50; x < sR(yM) - 20; x += 46) margin += `M${x.toFixed(1)} ${yM - 5}L${x.toFixed(1)} ${yM + 5}`;
  for (let y = yM + 60; y < 1900; y += 60 + (y - yM) * 0.12) {
    const x = sL(y) + m(y);
    margin += `M${(x - 6).toFixed(1)} ${y.toFixed(1)}L${(x + 6).toFixed(1)} ${(y - 2).toFixed(1)}`;
  }
  const r = rng(`${s}/grid`);
  // fix round 2b: the near group is split into three DEPTH BANDS (far -> near) that draw on 0.03 s apart (a wave rolling
  // toward the lens on 'It's', not every near stroke at once: f2 read as a scatter of dashes); the far group keeps only
  // every second ray (the field toward the horizon thins out: the footprints are the figure, the grid the ground)
  const NEAR_CUTS = [1560, 1690, 1830, 2060];
  const near = ['', '', ''];
  let gridMid = '';
  let gridFar = '';
  const band = (y: number) => (y < NEAR_CUTS[1] ? 0 : y < NEAR_CUTS[2] ? 1 : 2);
  const broken = (x0: number, y0: number, x1: number, y1: number, key: string) => {
    const n = r.int(2, 4);
    let d = '';
    let a = 0;
    for (let i = 0; i < n; i++) {
      const b = i === n - 1 ? 1 : a + ((1 - a) / (n - i)) * r.range(0.75, 1.2);
      const g0 = i ? r.range(0.006, 0.02) : 0;
      d += line(x0 + (x1 - x0) * (a + g0), y0 + (y1 - y0) * (a + g0), x0 + (x1 - x0) * b, y0 + (y1 - y0) * b, {seed: `${key}/${i}`, over: 0, breaks: false, drift: 0.15});
      a = b;
    }
    return d;
  };
  for (let k = 9; k >= 1; k--) {
    const y = VP[1] + (2060 - VP[1]) * Math.pow(k / 10, 1.6);
    if (y < yF + 30) continue;
    const d = broken(sL(y) - r.range(30, 60), y, sR(y) + r.range(30, 60), y, `${s}/x${k}`);
    if (y > 1560) near[band(y)] += d;
    else if (y > 1330) gridMid += d;
    else gridFar += d;
  }
  for (let i = 0; i <= 22; i++) {
    const xb = -1500 + i * 190;
    const xAt = (y: number) => VP[0] + ((xb - VP[0]) * (y - VP[1])) / (2060 - VP[1]);
    if (xAt(yF) < sL(yF) + 10 || xAt(yF) > sR(yF) - 10) continue;
    const yT = yF - r.range(30, 60) * 0.5;
    const far = broken(xAt(yT), yT, xAt(1330), 1330, `${s}/r${i}/0`);
    if (i % 2 === 0) gridFar += far;
    gridMid += broken(xAt(1330), 1330, xAt(1560), 1560, `${s}/r${i}/1`);
    for (let g = 0; g < 3; g++) near[g] += broken(xAt(NEAR_CUTS[g]), NEAR_CUTS[g], xAt(NEAR_CUTS[g + 1]), NEAR_CUTS[g + 1], `${s}/r${i}/2${g}`);
  }
  // A1 (finding: full-length 2.2 px converging rays + cross lines over the bottom third read as big plaza tiles at
  // phone size, heavier than the street; ref-2's ground carries only sparse broken ticks): the near group is rebuilt
  // (its own rng, so the far / mid lines above keep their breaks) as a light PENCIL plan at inkHair 1.6: each ray in
  // 2-3 pieces with a 30-60 px gap ACROSS every near cross line (the intersections stay open), each cross line in 3-4
  // pieces with 30-60 px gaps. Same three depth bands for the draw-on wave (a piece belongs to the band of its middle).
  void near;
  const rn = rng('s03/nearPencil');
  const nearRows: number[] = [];
  for (let k = 9; k >= 1; k--) {
    const y = VP[1] + (2060 - VP[1]) * Math.pow(k / 10, 1.6);
    if (y > 1560) nearRows.push(y);
  }
  const pencil = ['', '', ''];
  const bandOf = (y: number) => (y < NEAR_CUTS[1] ? 0 : y < NEAR_CUTS[2] ? 1 : 2);
  const piece = (x0: number, y0: number, x1: number, y1: number, key: string) =>
    (pencil[bandOf((y0 + y1) / 2)] += line(x0, y0, x1, y1, {seed: key, over: 0, breaks: false, drift: 0.15}));
  for (const [j, y] of nearRows.entries()) {
    // a cross line in 3-4 pieces with 30-60 px gaps
    const xa = sL(y) - rn.range(30, 60);
    const xb = sR(y) + rn.range(30, 60);
    const n = rn.int(3, 4);
    const len = xb - xa;
    let a = xa;
    for (let i = 0; i < n; i++) {
      const gap = i ? rn.range(30, 60) : 0;
      const b = i === n - 1 ? xb : a + gap + ((xb - a - gap) / (n - i)) * rn.range(0.8, 1.2);
      if (b - (a + gap) > 20) piece(a + gap, y, b, y, `s03/nx${j}/${i}`);
      a = b;
      void len;
    }
  }
  for (let i = 0; i <= 22; i++) {
    const xb = -1500 + i * 190;
    const xAt = (y: number) => VP[0] + ((xb - VP[0]) * (y - VP[1])) / (2060 - VP[1]);
    if (xAt(yF) < sL(yF) + 10 || xAt(yF) > sR(yF) - 10) continue;
    // the ray from the mid group's end (1560) to the sheet's foot, open across each near cross line
    let y0 = 1560;
    const cuts = nearRows.slice().sort((p, q) => p - q);
    for (const [c, yc] of cuts.entries()) {
      const g = rn.range(30, 60) / 2; // half the gap, measured along y (the rays are steep: ~ along the ray)
      if (yc - g - y0 > 18) piece(xAt(y0), y0, xAt(yc - g), yc - g, `s03/nr${i}/${c}`);
      y0 = yc + g;
    }
    if (2060 - y0 > 18) piece(xAt(y0), y0, xAt(2060), 2060, `s03/nr${i}/e`);
  }
  const gridNear = pencil;
  const dimL = arrow(sL(1250) + 34, 1250, sL(1480) + 40, 1480, {seed: `${s}/dl1`, head: 14}) + arrow(sL(1480) + 40, 1480, sL(1250) + 34, 1250, {seed: `${s}/dl2`, head: 14});
  const dimR = arrow(sR(1250) - 34, 1250, sR(1480) - 40, 1480, {seed: `${s}/dr1`, head: 14}) + arrow(sR(1480) - 40, 1480, sR(1250) - 34, 1250, {seed: `${s}/dr2`, head: 14});
  return {sheet, dogEar, edgeInk, margin, gridNear, gridMid, gridFar, dims: dimL + dimR};
})();

/** Fix round 3 (finding: the cream card on the cream plan, with the grid and the frame band running into its border,
 *  read as text printed on the floor): the plan is KNOCKED OUT round the card (CARD_BOX + 14 px: no grid, margin,
 *  kerb dimension or frame-band line enters it) and the title block's frame is ONE hairline rect at that knock-out's
 *  edge (was two rects at 8 / 16 px round the set's box), so the white card with its tan offset sits in a clean field. */
const KO = 14;
const KNOCK = (() => {
  const [x0, y0, x1, y1] = CARD_BOX;
  return `M-3000 -3000H4000V6000H-3000Z M${x0 - KO} ${y0 - KO}V${y1 + KO}H${x1 + KO}V${y0 - KO}Z`;
})();
const TB_FRAME = (() => {
  const [x0, y0, x1, y1] = CARD_BOX;
  return rect(x0 - KO, y0 - KO, x1 - x0 + 2 * KO, y1 - y0 + 2 * KO, {seed: 'bp/tbf2', over: 'small'});
})();

// ---------------------------------------------------------------- plan furniture (S03's own, static from the cut)

/** A hand-scribbled 'text' line (a pen squiggle with a couple of word gaps) from (x, y), length w. */
function scribble(x: number, y: number, w: number, seed: string): string {
  const r = rng(seed);
  let d = '';
  let cx = x;
  while (cx < x + w - 6) {
    const ww = Math.min(x + w - cx, r.range(14, 34));
    d += `M${cx.toFixed(1)} ${(y + r.range(-1, 1)).toFixed(1)}`;
    for (let u = 4; u <= ww; u += 4) d += `L${(cx + u).toFixed(1)} ${(y + (u % 8 === 0 ? -2.2 : 1.6) + r.range(-0.6, 0.6)).toFixed(1)}`;
    cx += ww + r.range(5, 9);
  }
  return d;
}

const S = STAMP; // S03's stamp spot (stamp.tsx): (308, 1400) rx 160 ry 60
const regMark = (x: number, y: number, seed: string) => circle(x, y, 8, {seed}) + `M${x - 14} ${y}L${x + 14} ${y}M${x} ${y - 14}L${x} ${y + 14}`;

const FURNITURE = (() => {
  // registration marks where the stamp will land (its top and bottom)
  const reg = regMark(S.x, S.y - S.ry - 14, 's03/reg1') + regMark(S.x, S.y + S.ry + 14, 's03/reg2');
  // a dimension line under the stamp: arrows out to end ticks, a gap for its figure
  const yd = S.y + S.ry + 34;
  const dim =
    arrow(S.x - 34, yd, S.x - S.rx, yd, {seed: 's03/dmA', head: 10}) +
    arrow(S.x + 34, yd, S.x + S.rx, yd, {seed: 's03/dmB', head: 10}) +
    `M${S.x - S.rx} ${yd - 9}L${S.x - S.rx} ${yd + 9}M${S.x + S.rx} ${yd - 9}L${S.x + S.rx} ${yd + 9}`;
  // the north arrow (needle toward the vanishing point = up the street)
  const NA: Pt = [772, 1298];
  const north = circle(NA[0], NA[1], 18, {seed: 's03/na'}) + `M${NA[0]} ${NA[1] + 14}L${NA[0]} ${NA[1] - 15}M${NA[0] - 6} ${NA[1] - 6}L${NA[0]} ${NA[1] - 16}L${NA[0] + 6} ${NA[1] - 6}`;
  const needle = `M${NA[0]} ${NA[1] - 16}L${NA[0] + 6} ${NA[1] - 6}L${NA[0]} ${NA[1] - 9}Z`;
  // note lines: on the far plan (left), on the near grid (two blocks)
  const notes =
    scribble(300, 1266, 84, 's03/n1') + scribble(300, 1280, 58, 's03/n2') +
    scribble(604, 1566, 130, 's03/n3') + scribble(604, 1584, 104, 's03/n4') + scribble(604, 1602, 118, 's03/n5') +
    scribble(560, 1270, 64, 's03/n6');
  // a small dimensioned footprint detail where the set's old title block was (a pauser detail under the bottom UI)
  const fx = 236;
  const fy = 1726;
  const fw = 150;
  const fh = 86;
  const foot =
    rect(fx, fy, fw, fh, {seed: 's03/fd', over: 'small'}) +
    rect(fx + 6, fy + 6, fw - 12, fh - 12, {seed: 's03/fdi', over: 0}) +
    `M${fx + 40} ${fy + fh}L${fx + 40} ${fy + fh - 26}A26 26 0 0 1 ${fx + 66} ${fy + fh}` +
    arrow(fx + fw / 2 - 20, fy + fh + 22, fx, fy + fh + 22, {seed: 's03/fdA', head: 9}) +
    arrow(fx + fw / 2 + 20, fy + fh + 22, fx + fw, fy + fh + 22, {seed: 's03/fdB', head: 9}) +
    arrow(fx + fw + 22, fy + fh / 2 - 14, fx + fw + 22, fy, {seed: 's03/fdC', head: 9}) +
    arrow(fx + fw + 22, fy + fh / 2 + 14, fx + fw + 22, fy + fh, {seed: 's03/fdD', head: 9}) +
    scribble(fx + 14, fy + 30, 70, 's03/fdn');
  return {reg, dim, yd, north, needle, NA, notes, foot, fx, fy, fw, fh};
})();

/** The card's pop pivot (LabelTag 'card': the paper's top centre + 0.22 x the font size; the card's paper box is
 *  CARD_BOX, L3 at 38 px on screen = 36.5 world px). */
const KNOCK_PIVOT: Pt = [(CARD_BOX[0] + CARD_BOX[2]) / 2, CARD_BOX[1] + (38 / 1.04) * 0.22];
/** The knock-out's scale at t: A1 (finding: before L3 popped the knock-out showed for 0.87 s as an empty, screen-aligned
 *  hairline box on the perspective plan, a blank placeholder): it arrives WITH the card, on the card's own pop spring
 *  about the card's pivot, so the hole grows with the paper. */
const knockXf = (t: number, at: number | undefined) => {
  if (at === undefined || t >= at + 0.6) return mat.identity();
  const k = Math.max(0.001, springAt(t, at, springs.pop));
  return mat.about(mat.scale(k), KNOCK_PIVOT[0], KNOCK_PIVOT[1]);
};

/** Clips its children OUT of the card's knock-out (CARD_BOX + 14 px): the plan's lines stop short of the card. Use it
 *  for every plan line that crosses the card's spot (the grid, margin, kerb dimensions, sheet edge, the frame band).
 *  `at`: the card's pop (L3): before it nothing is knocked out, from it the hole grows with the card. */
export const CardKnock: React.FC<{at?: number; children: React.ReactNode}> = ({at, children}) => {
  const t = useTime();
  if (at !== undefined && t < at) return <>{children}</>;
  const m = knockXf(t, at);
  const id = at === undefined ? 's03knock' : `s03knock${Math.round(at * 1000)}`;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={KNOCK} clipRule="evenodd" transform={`matrix(${m.a} ${m.b} ${m.c} ${m.d} ${m.e} ${m.f})`} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
};

/** The near grid's draw-on: three depth bands, far -> near, 0.03 s apart, each drawing in 0.09 s (all its strokes
 *  together): gridAt 8.445 -> done at 8.595, on 'It's' (8.605). */
const NEAR_STAGGER = 0.03;
const NEAR_DUR = 0.09;

/** S03's plan (replaces the set's 'ground' node): street, sheet, edges, margin, far + mid grid, kerb dimensions, the
 *  title-block frame and the furniture from the cut; the near grid rows draw on from `gridAt` (far -> near).
 *  Polish round 1: the sand street exists only from `streetAt` (the pop-up: the pavement springs up with the city);
 *  before it the bare plan is all paper (FarPlain's cream + grid show round the sheet, to the horizon). The grid weights
 *  thin with depth from 2.2 (near) through 1.9 (mid) to inkHair 1.6 (far), continuing into the far plain's 1.6. */
export const GroundS03: React.FC<{gridAt: number; streetAt?: number; knockAt?: number; seed?: string}> = ({gridAt, streetAt, knockAt, seed = 'bp'}) => {
  useCaptionFont();
  const t = useTime();
  const F = FURNITURE;
  const nearOn = t >= gridAt;
  // A1 (finding: the paving popped in as a flat full-width slab one frame BEFORE the press house showed): the street
  // grows DOWN from the press house's base (y 1180) with the house's own pop-up curve, so it is one gesture with it
  const streetK = streetAt === undefined ? 1 : Math.min(1, popUpK(t, streetAt));
  return (
    <>
      {streetK > 0.001 ? (
        <XG m={streetK === 1 ? mat.identity() : mat.about(mat.scale(1, streetK), 0, 1180)}>
          <Fill rect={[-160, 1180, 1400, 900]} color={palette.sand} offset={false} mode="snap" seed={`${seed}/street`} />
        </XG>
      ) : null}
      <Fill d={G.sheet} color={palette.cream} offset={false} mode="snap" seed={`${seed}/sheet`} />
      <Fill d={G.dogEar} color={palette.white} offset={false} mode="snap" seed={`${seed}/ear`} />
      <CardKnock at={knockAt}>
        <Ink d={G.edgeInk} width={SI.far} taper={false} seed={`${seed}/edge`} />
        <Ink d={G.margin} width={SI.hair * 0.8} taper={false} seed={`${seed}/margin`} />
        <Ink d={G.gridFar} width={SI.hair} taper={false} seed={`${seed}/gF`} />
        <Ink d={G.gridMid} width={SI.hair} taper={false} seed={`${seed}/gM`} />
        {nearOn
          ? G.gridNear.map((d, i) => <Ink key={i} d={d} width={SI.hair} at={gridAt + i * NEAR_STAGGER} dur={NEAR_DUR} pace="free" order="all" taper={false} seed={`${seed}/gN${i}`} />)
          : null}
        <Ink d={G.dims} width={SI.far} taper={false} seed={`${seed}/dim`} />
      </CardKnock>
      {knockAt === undefined || t >= knockAt ? (
        <XG m={knockXf(t, knockAt)}>
          <Ink d={TB_FRAME} width={SI.hair} taper={false} seed={`${seed}/tb3`} />
        </XG>
      ) : null}
      {/* plan furniture */}
      <Ink d={F.reg + F.dim + F.north + F.foot} width={1.6} taper={false} seed="s03/furn" />
      <Fill d={F.needle} color={palette.ink} offset={false} mode="none" seed="s03/needle" />
      <Ink d={F.notes} width={1.3} taper={false} seed="s03/notes" />
      <text x={S.x} y={F.yd + 6} fontFamily={captionFontStack} fontSize={19} fill={palette.ink} textAnchor="middle">
        3.2 m
      </text>
      <text x={F.NA[0]} y={F.NA[1] - 24} fontFamily={captionFontStack} fontSize={20} fill={palette.ink} textAnchor="middle">
        N
      </text>
      <text x={F.fx + F.fw / 2} y={F.fy + F.fh + 28} fontFamily={captionFontStack} fontSize={17} fill={palette.ink} textAnchor="middle">
        lot 3
      </text>
    </>
  );
};
