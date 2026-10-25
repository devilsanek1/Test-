// S03's plan sheet (fix round 2): S03 draws the set's 'ground' layer itself so that
//   - the hard-cut frame already reads as a drawn PLAN (finding: f0 was two flat fills): the margin, the far and mid grid
//     rows, the dimension arrows along the kerbs and the title-block frame are inked from frame 0, plus plan furniture (two
//     registration marks where the stamp will land, a dimension line under it, a north arrow, a few note lines, a small
//     dimensioned footprint detail where the set's old title block was);
//   - only the NEAR grid rows draw on, on the 'It's' lead (gridAt, 0.3 s): the plan completes far -> near, from the press
//     house toward the viewer (storyboard 'It's'; the set draws near -> far);
//   - the set's old inked title block `tb` (world 190-470 x 1700-1860, a stray empty box once the v3 title-block CARD
//     exists) is NOT drawn (sets request: skip `tb` when `titleBlock` is given).
// The geometry (sheet, dog-ear, edge ink, margin, the three grid groups, the kerb dimension arrows, the title-block
// frame) is copied from sets/BlueprintStreet.tsx `G` / `TB_FRAME` with the SAME seeds and rng order, so the lines are
// identical to the set's. If that set's geometry changes, update this copy (like the side-row copy in plan.tsx).

import React from 'react';
import {palette} from '../../lib/theme';
import {useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {arrow, circle, line, polyPath, rect, Pt} from '../../lib/sketch';
import {rng} from '../../lib/rng';
import {captionFontStack, useCaptionFont} from '../../lib/font';
import {BLUEPRINT, SI} from '../shared/sets';

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
  const groups = ['', '', ''];
  const grp = (y: number) => (y > 1560 ? 0 : y > 1330 ? 1 : 2);
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
    groups[grp(y)] += broken(sL(y) - r.range(30, 60), y, sR(y) + r.range(30, 60), y, `${s}/x${k}`);
  }
  for (let i = 0; i <= 22; i++) {
    const xb = -1500 + i * 190;
    const xAt = (y: number) => VP[0] + ((xb - VP[0]) * (y - VP[1])) / (2060 - VP[1]);
    if (xAt(yF) < sL(yF) + 10 || xAt(yF) > sR(yF) - 10) continue;
    const yT = yF - r.range(30, 60) * 0.5;
    const cuts = [yT, 1330, 1560, 2060];
    for (let g = 0; g < 3; g++) groups[2 - g] += broken(xAt(cuts[g]), cuts[g], xAt(cuts[g + 1]), cuts[g + 1], `${s}/r${i}/${g}`);
  }
  const [gridNear, gridMid, gridFar] = groups;
  const dimL = arrow(sL(1250) + 34, 1250, sL(1480) + 40, 1480, {seed: `${s}/dl1`, head: 14}) + arrow(sL(1480) + 40, 1480, sL(1250) + 34, 1250, {seed: `${s}/dl2`, head: 14});
  const dimR = arrow(sR(1250) - 34, 1250, sR(1480) - 40, 1480, {seed: `${s}/dr1`, head: 14}) + arrow(sR(1480) - 40, 1480, sR(1250) - 34, 1250, {seed: `${s}/dr2`, head: 14});
  return {sheet, dogEar, edgeInk, margin, gridNear, gridMid, gridFar, dims: dimL + dimR};
})();

const TB_FRAME = (() => {
  const [x0, y0, x1, y1] = BLUEPRINT.titleBlock;
  return rect(x0 - 8, y0 - 8, x1 - x0 + 16, y1 - y0 + 16, {seed: 'bp/tbf1', over: 'small'}) + rect(x0 - 16, y0 - 16, x1 - x0 + 32, y1 - y0 + 32, {seed: 'bp/tbf2', over: 'small'});
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

const S = BLUEPRINT.stamp; // (330, 1400) rx 160 ry 60
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

/** S03's plan (replaces the set's 'ground' node): street, sheet, edges, margin, far + mid grid, kerb dimensions, the
 *  title-block frame and the furniture from the cut; the near grid rows draw on from `gridAt` (far -> near). */
export const GroundS03: React.FC<{gridAt: number; seed?: string}> = ({gridAt, seed = 'bp'}) => {
  useCaptionFont();
  const t = useTime();
  const F = FURNITURE;
  const nearOn = t >= gridAt;
  return (
    <>
      <Fill rect={[-160, 1180, 1400, 900]} color={palette.sand} offset={false} mode="snap" seed={`${seed}/street`} />
      <Fill d={G.sheet} color={palette.cream} offset={false} mode="snap" seed={`${seed}/sheet`} />
      <Fill d={G.dogEar} color={palette.white} offset={false} mode="snap" seed={`${seed}/ear`} />
      <Ink d={G.edgeInk} width={SI.far} taper={false} seed={`${seed}/edge`} />
      <Ink d={G.margin} width={SI.hair * 0.8} taper={false} seed={`${seed}/margin`} />
      <Ink d={G.gridFar} width={SI.hair * 0.6} taper={false} seed={`${seed}/gF`} />
      <Ink d={G.gridMid} width={SI.hair * 0.9} taper={false} seed={`${seed}/gM`} />
      {nearOn ? <Ink d={G.gridNear} width={SI.hair * 1.25} at={gridAt} dur={0.3} order="all" taper={false} seed={`${seed}/gN`} /> : null}
      <Ink d={G.dims} width={SI.far} taper={false} seed={`${seed}/dim`} />
      <Ink d={TB_FRAME} width={SI.hair} taper={false} seed={`${seed}/tb3`} />
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
