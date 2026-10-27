// kit/S8_stick.tsx: close-size detail for the memory stick (S8's 700 px hero; S9 can reuse it for "S8's stick, chips
// readable"). An OVERLAY drawn over the kit MemoryStick with the same x / y / w / rot (kit/Memory.tsx is untouched):
// per chip a pin-1 dot and two hairline print lines; on the board thin copper traces, a row of tiny parts above the
// pins, a column of decoupling caps at the ends, the key-notch traces and a small white label on the right chip.
// Geometry mirrors Memory.tsx's stickGeo (4 chips, margin 0.06 w, gap 0.04 w, chips at 0.13-0.63 h, pins from 0.76 h).
//
//   <MemoryStick x={540} y={970} w={700} />
//   <StickDetail x={540} y={970} w={700} />
import React from 'react';
import {Ink} from '../../../lib/Ink';
import {line} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {STICK_RATIO} from './Memory';
import {tiered} from '../../../lib/tier';
import {TCircle, TPath, TRect} from './util';

export type StickDetailProps = {x: number; y: number; w: number; rot?: number; chips?: number; seed?: string};

const StickDetailBody: React.FC<StickDetailProps> = ({x, y, w, rot = 0, chips = 4, seed = 'stickD'}) => {
  const h = w * STICK_RATIO;
  const x0 = -w / 2;
  const y0 = -h / 2;
  const margin = w * 0.06;
  const gap = w * 0.04;
  const cw = (w - margin * 2 - gap * (chips - 1)) / chips;
  const cy = y0 + h * 0.13;
  const ch = h * 0.5;
  const hair = Math.max(1, w / 420);
  // copper traces: from under each chip down to the pins (short vertical runs with a jog), and along the top strip
  let traces = '';
  for (let i = 0; i < chips; i++) {
    const cx = x0 + margin + i * (cw + gap);
    for (let k = 0; k < 6; k++) {
      const tx = cx + cw * (0.12 + k * 0.15);
      const jy = cy + ch + h * 0.035;
      traces += `M${tx.toFixed(1)} ${(cy + ch).toFixed(1)}V${jy.toFixed(1)}L${(tx + h * 0.03).toFixed(1)} ${(jy + h * 0.03).toFixed(1)}V${(y0 + h * 0.76).toFixed(1)}`;
    }
    if (i < chips - 1) {
      // between chips: two traces down the gap
      const gx = cx + cw + gap * 0.35;
      traces += `M${gx.toFixed(1)} ${(y0 + h * 0.06).toFixed(1)}V${(y0 + h * 0.74).toFixed(1)}M${(gx + gap * 0.3).toFixed(1)} ${(y0 + h * 0.1).toFixed(1)}V${(y0 + h * 0.7).toFixed(1)}`;
    }
  }
  traces += `M${(x0 + w * 0.04).toFixed(1)} ${(y0 + h * 0.07).toFixed(1)}H${(x0 + w * 0.96).toFixed(1)}`;
  // tiny SMD parts: a row above the pins (between the trace jogs) and a cap column at each end
  let parts = '';
  const pw = w * 0.016;
  const ph = h * 0.035;
  for (let k = 0; k < 22; k++) {
    const px = x0 + w * 0.07 + k * w * 0.041;
    if (px > x0 + w * 0.4 && px < x0 + w * 0.47) continue; // the key notch
    parts += `M${px.toFixed(1)} ${(y0 + h * 0.665).toFixed(1)}h${pw.toFixed(1)}v${ph.toFixed(1)}h${(-pw).toFixed(1)}Z`;
  }
  for (const ex of [x0 + w * 0.012, x0 + w * 0.97]) {
    for (let k = 0; k < 3; k++) parts += `M${ex.toFixed(1)} ${(y0 + h * (0.18 + k * 0.1)).toFixed(1)}h${(w * 0.018).toFixed(1)}v${(h * 0.05).toFixed(1)}h${(-w * 0.018).toFixed(1)}Z`;
  }
  // per chip: the pin-1 dot and two print lines (light on the near-black chip)
  const print: React.ReactNode[] = [];
  let lines = '';
  for (let i = 0; i < chips; i++) {
    const cx = x0 + margin + i * (cw + gap);
    print.push(<TCircle key={`d${i}`} cx={cx + cw * 0.12} cy={cy + ch * 0.16} r={Math.max(1.6, w / 180)} fill={EMBER.boardDeep} />);
    lines += line(cx + cw * 0.18, cy + ch * 0.55, cx + cw * 0.78, cy + ch * 0.55, {over: [0, 0], seed: `${seed}/p1${i}`});
    lines += line(cx + cw * 0.18, cy + ch * 0.72, cx + cw * 0.56, cy + ch * 0.72, {over: [0, 0], seed: `${seed}/p2${i}`});
  }
  // the label: a small white sticker over the right chip's top half, with a barcode and a line
  const lx = x0 + margin + (chips - 1) * (cw + gap) + cw * 0.08;
  const ly = cy - h * 0.06;
  const lw = cw * 0.84;
  const lh = h * 0.2;
  let bars = '';
  for (let k = 0; k < 14; k++) {
    const bx = lx + lw * 0.08 + k * lw * 0.045;
    bars += `M${bx.toFixed(1)} ${(ly + lh * 0.5).toFixed(1)}v${(lh * 0.36).toFixed(1)}`;
  }
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot))}>
      <TPath d={traces} stroke={EMBER.boardDeep} strokeWidth={hair * 1.3} fill="none" strokeLinejoin="round" />
      <TPath d={parts} fill={EMBER.chip} />
      {print}
      <TPath d={lines} stroke={EMBER.reveal} strokeWidth={hair * 1.4} fill="none" strokeLinecap="round" />
      <TRect x={lx} y={ly} width={lw} height={lh} rx={2} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={hair * 1.2} />
      <TPath d={bars} stroke={EMBER.ink} strokeWidth={hair * 1.1} fill="none" />
      <Ink d={line(lx + lw * 0.08, ly + lh * 0.28, lx + lw * 0.7, ly + lh * 0.28, {over: [0, 0], seed: `${seed}/lab`})} width={hair * 1.2} />
    </XG>
  );
};
export const StickDetail = tiered('subject', {tone: EMBER.board}, StickDetailBody);
