// S08 LOCAL STAND-INS for shared-kit pieces requested in docs/storyboard_v3.json "requests" that have not landed yet.
// Same names / props as requested, so a later fix round can swap the import to '../shared/props' and delete this.
//
//   CounterBoard (props request, task #57): "rooftop sign board with a shield-dome emblem, header slot, start flag + note,
//   hand-drawn ink tally gates (`gatesAt[]`, 5 bars each, no digits, never a digital ticker), two stamp slots
//   (`stamps: [{at, text}]`), footer fine print; `riseAt`."
//
// The labels on it are the shared LabelTag (props lane, landed): the start-flag note is a clipped slip, the stamps are
// LabelTag stamps (slam: ring 0.13 s, print 2.6x -> 1.0x in 0.27 s); the header and footer are painted on the board.

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, springAt, springs, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {captionFontStack, measureCaption, useCaptionFont} from '../../lib/font';
import {circle, ellipse, line, polyPath, rect, rectPath, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {useLook} from '../../lib/exit';
import {LabelTag} from '../shared/props';
import {popUpK, tallyGatePath} from '../shared/sets';

type Box = [number, number, number, number];

/** Painted board lettering: lines of CaptionHand inside a box, shrunk (never grown) to fit its width. */
export const BoardLettering: React.FC<{box: Box; lines: string[]; fontSize: number; align?: 'left' | 'center'; at?: number; color?: string}> = ({box, lines, fontSize, align = 'left', at, color = palette.ink}) => {
  useCaptionFont();
  const t = useTime();
  const look = useLook();
  if (!look.ink) return null;
  if (at !== undefined && t < at) return null;
  const [x0, y0, x1, y1] = box;
  const wMax = Math.max(...lines.map((l) => measureCaption(l, 100) / 100));
  const pitch = 1.08;
  const fs = Math.min(fontSize, (x1 - x0) / wMax, (y1 - y0) / ((lines.length - 1) * pitch + 0.98));
  const blockH = ((lines.length - 1) * pitch + 0.98) * fs;
  const top = y0 + (y1 - y0 - blockH) / 2 + fs * 0.72;
  const k = at !== undefined ? springAt(t, at, springs.pop) : 1;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return (
    <g transform={k !== 1 ? `translate(${cx} ${cy}) scale(${k.toFixed(4)}) translate(${-cx} ${-cy})` : undefined}>
      {lines.map((ln, i) => (
        <text key={i} x={align === 'center' ? cx : x0} y={top + i * pitch * fs} fontFamily={captionFontStack} fontSize={fs} fill={color} textAnchor={align === 'center' ? 'middle' : 'start'}>
          {ln}
        </text>
      ))}
    </g>
  );
};

/** The shield-dome emblem: a teal shield with a cream dome arc and a little skyline under it (ink outline). */
const ShieldDome: React.FC<{x: number; y: number; s: number; seed: string}> = ({x, y, s, seed}) => {
  const w = 40 * s;
  const h = 46 * s;
  const shield = `M${x - w / 2} ${y - h / 2}L${x + w / 2} ${y - h / 2}L${x + w / 2} ${y}Q${x + w / 2} ${y + h * 0.32} ${x} ${y + h / 2}Q${x - w / 2} ${y + h * 0.32} ${x - w / 2} ${y}Z`;
  const dome = `M${x - w * 0.32} ${y + h * 0.12}A${w * 0.32} ${h * 0.36} 0 0 1 ${x + w * 0.32} ${y + h * 0.12}Z`;
  const city = rectPath(x - w * 0.3, y + h * 0.02, w * 0.12, h * 0.1) + rectPath(x - w * 0.12, y - h * 0.04, w * 0.14, h * 0.16) + rectPath(x + w * 0.08, y + h * 0.0, w * 0.18, h * 0.12);
  return (
    <>
      <Fill d={shield} color={palette.teal} seed={`${seed}/sh`} />
      <Fill d={dome} color={palette.cream} offset={false} seed={`${seed}/dm`} />
      <Fill d={city} color={palette.tealDark} offset={false} mode="snap" seed={`${seed}/ct`} />
      <Ink d={shield + `M${x - w * 0.34} ${y + h * 0.12}A${w * 0.34} ${h * 0.38} 0 0 1 ${x + w * 0.34} ${y + h * 0.12}`} width={2.2} taper={false} seed={`${seed}/i`} />
    </>
  );
};

export type CounterBoardProps = {
  /** Board rect [x0, y0, x1, y1] (world): the frame's outer edge. Its feet stand on `groundY`. */
  box: Box;
  groundY: number;
  riseAt?: number;
  header: string[];
  /** Start flag + its note (L9a) at the count's left end. */
  flag: {at: number; lines: string[]; box: Box};
  /** Tally gates: one per time (5 bars, stroked on in 0.12 s), laid out in `gateBox` as a 3 x 3 grid. */
  gatesAt: number[];
  gateBox: Box;
  stamps: {at: number; text: string; box: Box; ringOutAt?: number}[];
  footer: {at: number; lines: string[]; box: Box};
  seed?: string;
};

/** S08 rooftop counter board (LOCAL stand-in for the requested shared CounterBoard). */
export const CounterBoard: React.FC<CounterBoardProps> = ({box, groundY, riseAt, header, flag, gatesAt, gateBox, stamps, footer, seed = 'cb'}) => {
  const t = useTime();
  const [x0, y0, x1, y1] = box;
  const k = popUpK(t, riseAt, 0.06);
  if (k <= 0.001) return null;
  const fw = 12; // frame width
  const face: Box = [x0 + fw, y0 + fw, x1 - fw, y1 - fw];
  const feet = rectPath(x0 + 34, y1 - 4, 16, groundY - y1 + 6) + rectPath(x1 - 50, y1 - 4, 16, groundY - y1 + 6);
  // header divider and zone rules (hand-ruled hairlines)
  const hdrBottom = y0 + 98;
  const rules = line(face[0] + 8, hdrBottom, face[2] - 8, hdrBottom + 1, {seed: `${seed}/r1`, over: [2, 2]}) + line(face[0] + 8, footer.box[1] - 4, face[2] - 8, footer.box[1] - 5, {seed: `${seed}/r2`, over: [2, 2]});
  // gates: a 3 x 3 grid in gateBox
  const [gx0, gy0, gx1, gy1] = gateBox;
  const gs = Math.min((gy1 - gy0) / 3 - 6, ((gx1 - gx0) / 3) * 0.95);
  const gates = gatesAt.map((at, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const gx = gx0 + 6 + col * ((gx1 - gx0) / 3) + (row % 2 ? 3 : 0);
    const gy = gy0 + 3 + row * ((gy1 - gy0) / 3);
    return {at, d: tallyGatePath(gx, gy, gs * 0.92, 5), i};
  });
  // the start flag: a thin pole with a small teal pennant at the count's left end (pops with the note)
  const [fx0, fy0, , fy1] = flag.box;
  const poleX = fx0 - 12;
  const flagK = springAt(t, flag.at, springs.pop);
  const flagWave = t >= flag.at ? Math.sin((t - flag.at) * 7) * 2.2 * Math.exp(-(t - flag.at) * 1.2) + Math.sin(t * 3.1) * 0.8 : 0;
  const pennant = polyPath([
    [poleX, fy0 + 2],
    [poleX + 26, fy0 + 10 + flagWave],
    [poleX, fy0 + 20],
  ]);
  return (
    <XG m={k !== 1 ? mat.about(mat.scale(1, k), (x0 + x1) / 2, groundY) : mat.I}>
      {/* feet on the coping, then the frame and the cream face */}
      <Fill d={feet} color={palette.tealDark} seed={`${seed}/ft`} />
      <Fill d={roundRect(x0, y0, x1 - x0, y1 - y0, 6, {seed: `${seed}/fr`})} color={palette.teal} seed={`${seed}/fr`} />
      <Fill d={rectPath(face[0], face[1], face[2] - face[0], face[3] - face[1])} color={palette.cream} offset={[2, 2]} seed={`${seed}/fc`} />
      <Ink d={roundRect(x0, y0, x1 - x0, y1 - y0, 6, {seed: `${seed}/fri`, closed: false}) + rect(face[0], face[1], face[2] - face[0], face[3] - face[1], {seed: `${seed}/fci`, over: 'small'})} width={3.4} taper={false} seed={`${seed}/fri`} />
      <Ink d={rect(x0 + 34, y1, 16, groundY - y1, {seed: `${seed}/fti1`, edges: 'lr'}) + rect(x1 - 50, y1, 16, groundY - y1, {seed: `${seed}/fti2`, edges: 'lr'})} width={2.2} taper={false} seed={`${seed}/fti`} />
      <Ink d={rules} width={1.6} taper={false} seed={`${seed}/rules`} />
      {/* header: emblem + L8 (painted on the board) */}
      <ShieldDome x={face[0] + 30} y={y0 + 54} s={1.05} seed={`${seed}/emb`} />
      <BoardLettering box={[face[0] + 60, y0 + 14, face[2] - 6, hdrBottom - 4]} lines={header} fontSize={38} />
      {/* start flag + note (L9a) */}
      {t >= flag.at ? (
        <g transform={`translate(${poleX} ${fy1}) scale(${flagK.toFixed(4)}) translate(${-poleX} ${-fy1})`}>
          <Ink d={line(poleX, fy1, poleX, fy0, {seed: `${seed}/pole`, over: [0, 2]})} width={2.6} taper={false} seed={`${seed}/pole`} />
          <Fill d={pennant} color={palette.teal} offset={[1.5, 1.5]} seed={`${seed}/pen`} />
          <Ink d={pennant} width={1.8} taper={false} seed={`${seed}/peni`} />
        </g>
      ) : null}
      <LabelTag kind="slip" box={flag.box} text={flag.lines} fontSize={30} align="left" at={flag.at} paper={palette.white} seed={`${seed}/L9a`} />
      {/* tally gates: the ONE count device (no digits) */}
      {gates.map((g) => (
        <Ink key={g.i} d={g.d} at={g.at} dur={0.12} width={3.2} taper={false} seed={`${seed}/g${g.i}`} />
      ))}
      {/* stamps (L10, L11) */}
      {stamps.map((s, i) => (
        <React.Fragment key={i}>
          <LabelTag kind="stamp" box={s.box} text={s.text} fontSize={34} at={s.at} paper={palette.peach} seed={`${seed}/st${i}`} />
          <StampRing box={s.box} at={s.at + 0.4} outAt={s.ringOutAt ?? s.at + 0.73} seed={`${seed}/sr${i}`} />
        </React.Fragment>
      ))}
      {/* footer fine print (L9b) */}
      <BoardLettering box={footer.box} lines={footer.lines} fontSize={28} align="center" at={footer.at} />
    </XG>
  );
};

/** The impact ring around a landed stamp (ink, a few splat ticks); pops off at outAt. */
const StampRing: React.FC<{box: Box; at: number; outAt: number; seed: string}> = ({box, at, outAt, seed}) => {
  const t = useTime();
  if (t < at || t >= outAt) return null;
  const [x0, y0, x1, y1] = box;
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  const q = E.outCubic(prog(t, at, 0.12));
  const rx = (x1 - x0) / 2 + 10 + 8 * q;
  const ry = (y1 - y0) / 2 + 8 + 6 * q;
  let ticks = '';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    const ex = cx + Math.cos(a) * (rx + 6);
    const ey = cy + Math.sin(a) * (ry + 6);
    ticks += `M${ex.toFixed(1)} ${ey.toFixed(1)}l${(Math.cos(a) * 9).toFixed(1)} ${(Math.sin(a) * 9).toFixed(1)}`;
  }
  return <Ink d={ellipse(cx, cy, rx, ry, {seed: `${seed}/e`, overlap: 14}) + ticks} width={2.4} taper={false} seed={seed} />;
};

export {circle};
