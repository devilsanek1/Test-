// V2S7_board.tsx (lane L5): Google's board at B for V2S7 (TREATMENT section 5 "Texts on objects", S7; section 8 A5).
//
// STAND-IN: src/v2r/kit/boards/index.ts does not export GoogleBoard yet (K3 is being built). This draws the board's
// FRAME + FACE at the exact contract spot (face = map B x 150-630, y 700-1220; stiles 40, rails 20; legs to B_LEGS_Y1)
// with flat bars where the lines will be, on the K3 timings (header + clack 0.30; "AI principles" complete 1.98; the
// small row 2.24; "of any kind" complete 4.02). THE SWAP IS ONE LINE: when kit/boards exports GoogleBoard, set
//   export const S7Board: React.FC = () => <GoogleBoard />;      (import {GoogleBoard} from '../kit/boards')
// (GoogleBoard's defaults are already S7's shot-local times and face B.)
import React from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line} from '../../lib/sketch';
import {Batch, Paint, P} from '../kit/canal/core';
import {B, B_LEGS_Y1} from '../world/map';

/** K3's GOOGLE_T (shot-local s): the header pops with the clack, Google's words pen on as heard. */
const T = {header: 0.3, follows: [1.59, 1.72], principles: [1.72, 1.98], small: 2.24, bans: [2.68, 3.22], anyKind: [3.27, 4.02]} as const;
/** K3's GOOGLE_LAYOUT (px below the face's top). */
const L = {header: 70, rule: 92, follows: 162, principles: 222, small: 268, bans: 352, anyKind: 412, credit: 494} as const;

const clack = (t: number, at: number) => {
  const x = t - at;
  if (x < 0 || x >= 0.15) return 0;
  return x < 0.06 ? 3.2 * Math.sin((Math.PI * x) / 0.06) : -1 * Math.sin((Math.PI * (x - 0.06)) / 0.09);
};
const pen = (t: number, s: readonly [number, number]) => Math.max(0, Math.min(1, (t - s[0]) / (s[1] - s[0])));

/** STAND-IN for K3's GoogleBoard (frame + face at the contract spot, bars for the lines). */
export const S7BoardStandIn: React.FC = () => {
  const t = useTime();
  const dy = clack(t, T.header);
  const b = new Batch();
  const st = 40;
  const rl = 20;
  const X0 = B.x0 - st;
  const X1 = B.x1 + st;
  const top = B.y0 - rl;
  // frame (plum stiles to the ground, rails), a lit strip on the sun side, the face, its keyline
  b.rect(CM.anchor, X0, top + dy, st, B_LEGS_Y1 - top);
  b.rect(CM.anchor, B.x1, top + dy, st, B_LEGS_Y1 - top);
  b.rect(CM.anchor, B.x0, top + dy, B.x1 - B.x0, rl);
  b.rect(CM.anchor, B.x0, B.y1 + dy, B.x1 - B.x0, rl);
  b.rect(CM.coatPlum, X0, top + dy, 6, B_LEGS_Y1 - top);
  b.rect(CM.paper, B.x0, B.y0 + dy, B.x1 - B.x0, B.y1 - B.y0);
  b.ink(`M${P(B.x0 + 10, B.y0 + 10 + dy)}H${B.x1 - 10}V${B.y1 - 10 + dy}H${B.x0 + 10}Z`, 2, CM.anchor);
  b.layer();
  // the lines as flat bars (STAND-IN for the lettering)
  const y0 = B.y0 + dy;
  const cx = (B.x0 + B.x1) / 2;
  const x = B.x0 + 90;
  if (t >= T.header) {
    b.rect(CM.ink, cx - 150, y0 + L.header - 44, 300, 44);
    b.rect(CM.anchor, cx - 56, y0 + L.rule, 112, 3);
    b.rect(CM.stoneShade, x, y0 + L.credit - 14, 230, 12);
  }
  const bar = (yy: number, w: number, h: number, k: number, col = CM.ink) => {
    if (k > 0) b.rect(col, x, y0 + yy - h, w * k, h);
  };
  bar(L.follows, 120, 22, pen(t, T.follows));
  bar(L.principles, 290, 40, pen(t, T.principles));
  if (t >= T.small) bar(L.small, 300, 12, 1, CM.coatSlate);
  bar(L.bans, 190, 22, pen(t, T.bans));
  bar(L.anyKind, 255, 40, pen(t, T.anyKind));
  b.ink(line(X0, top + dy, X1, top + dy, {seed: 's7/sb/top', over: [8, 5]}) + line(X0, top + dy, X0, B_LEGS_Y1, {seed: 's7/sb/l', over: [4, 0]}), INK_PX.mid, CM.ink, 0.12);
  return <Paint b={b} seed="s7/boardStandIn" misreg={false} />;
};

/** The board V2S7 draws (the swap point). */
export const S7Board: React.FC = S7BoardStandIn;
