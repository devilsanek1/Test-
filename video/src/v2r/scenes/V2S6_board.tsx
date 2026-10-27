// V2S6_board.tsx (lane L5): S6's deal board slot. STAND-IN until K3's `DealBoard` is exported from
// src/v2r/kit/boards/index.ts: then this whole file becomes
//   export const S6Board: React.FC = () => <DealBoard />;
// (the stand-in below already sits exactly where DealBoard draws: the face S6_FACE x 160-640, y 700-1220 inside the
// contract rect S6.board0 x 120-680, y 680-1240, 40 px plum stiles, 20 px rails, legs to the kerb y 1252; its line
// bars sit on DEAL_LAYOUT's baselines, the purpose bars pop ON "any" (0.03), the F12 bar on "veto" (2.40), the board
// clacks on the cut (0)). Drawn in MID-plane coordinates (the gate's mid plane carries it: the contract drift).
import React from 'react';
import {CM} from '../palette';
import {useTime, springAt, springs} from '../../lib/time';
import {S6} from '../world/map';
import {mix} from '../kit/dc/core';

/** The face inside the contract rect (= K3 S6_FACE), the stile / rail sizes and the ground line (= K3 S6_LEGS_Y1). */
const FACE = {x0: S6.board0.x0 + 40, y0: S6.board0.y0 + 20, x1: S6.board0.x1 - 40, y1: S6.board0.y1 - 20};
const STILE = 40;
const RAIL = 20;
const LEGS_Y1 = 1252;
/** Baselines (dy from the face top) = K3 DEAL_LAYOUT. */
const L = {tag: 46, purpose: 120, purposeLead: 60, clause: 247, clauseLead: 38, rule: 420, f12: 455, credit: 494};

/** The wooden clack on the cut: a ~3 px drop in 2 frames, a small rebound, settled by 0.15 s (= K3 clackDy). */
const clackDy = (t: number, at = 0, drop = 3.2, dur = 0.15) => {
  const x = t - at;
  if (x < 0 || x >= dur) return 0;
  const k1 = dur * 0.4;
  if (x < k1) return drop * Math.sin((Math.PI * x) / k1);
  return -0.3 * drop * Math.sin((Math.PI * (x - k1)) / (dur - k1));
};

const BAR_KEY = mix(CM.ink, CM.paper, 0.18);
const BAR_BODY = mix(CM.ink, CM.paper, 0.55);
const BAR_SMALL = mix(CM.ink, CM.paper, 0.7);

/** One text bar (a stand-in for a line of lettering): x0, baseline, width, cap height. Pops about its centre. */
const Bar: React.FC<{x: number; base: number; w: number; h: number; color: string; s?: number}> = ({x, base, w, h, color, s = 1}) => {
  if (s <= 0) return null;
  const cx = x + w / 2;
  const cy = base - h / 2;
  return <rect x={cx - (w / 2) * s} y={cy - (h / 2) * s} width={w * s} height={h * s} rx={h * 0.3 * s} fill={color} />;
};

export const S6Board: React.FC = () => {
  const t = useTime();
  const dy = clackDy(t, 0);
  const popP = t < 0.03 ? 0 : Math.min(1.04, springAt(t, 0.03, springs.pop));
  const popF = t < 2.4 ? 0 : Math.min(1.04, springAt(t, 2.4, springs.pop));
  const sP = popP <= 0 ? 0 : 0.55 + 0.45 * popP;
  const sF = popF <= 0 ? 0 : 0.55 + 0.45 * popF;
  const X0 = FACE.x0 - STILE;
  const X1 = FACE.x1 + STILE;
  const col = FACE.x0 + 24;
  const y0 = FACE.y0;
  return (
    <g transform={`translate(0 ${dy.toFixed(2)})`}>
      {/* ground shadow, cast right (the sun is screen-left): a flat colour band, short */}
      <path d={`M${X0 + 10} ${LEGS_Y1}L${X1 + 6} ${LEGS_Y1}L${X1 + 40} ${LEGS_Y1 - 10}L${X0 + 44} ${LEGS_Y1 - 10}Z`} fill={mix(CM.paving, CM.shadeWarm, 0.45)} />
      {/* legs (the stiles run down to the kerb) */}
      <rect x={X0} y={FACE.y1} width={STILE * 0.7} height={LEGS_Y1 - FACE.y1} fill={CM.anchor} />
      <rect x={X1 - STILE * 0.7} y={FACE.y1} width={STILE * 0.7} height={LEGS_Y1 - FACE.y1} fill={CM.anchor} />
      {/* the frame: stiles + rails */}
      <rect x={X0} y={FACE.y0 - RAIL} width={X1 - X0} height={FACE.y1 - FACE.y0 + 2 * RAIL} rx={6} fill={CM.anchor} />
      <rect x={X0 + 4} y={FACE.y0 - RAIL + 4} width={9} height={FACE.y1 - FACE.y0 + 2 * RAIL - 8} fill={CM.coatPlum} />
      {/* the face + keyline */}
      <rect x={FACE.x0} y={FACE.y0} width={FACE.x1 - FACE.x0} height={FACE.y1 - FACE.y0} rx={5} fill={CM.paper} />
      <rect x={FACE.x0 + 10} y={FACE.y0 + 10} width={FACE.x1 - FACE.x0 - 20} height={FACE.y1 - FACE.y0 - 20} rx={8} fill="none" stroke={CM.anchor} strokeWidth={3} />
      {/* line bars (STAND-IN for the lettering) */}
      <Bar x={col} base={y0 + L.tag} w={232} h={23} color={BAR_BODY} />
      <rect x={col + 246} y={y0 + L.tag - 12} width={FACE.x1 - 34 - (col + 246)} height={2.2} fill={CM.ink} />
      <Bar x={col} base={y0 + L.purpose} w={250} h={38} color={BAR_KEY} s={sP} />
      <Bar x={col} base={y0 + L.purpose + L.purposeLead} w={408} h={38} color={BAR_KEY} s={sP} />
      {[400, 392, 330, 384, 400].map((w, i) => (
        <Bar key={i} x={col} base={y0 + L.clause + i * L.clauseLead} w={w} h={23} color={BAR_BODY} />
      ))}
      <rect x={col} y={y0 + L.rule - 1} width={FACE.x1 - 34 - col} height={2.2} fill={CM.ink} />
      <Bar x={col} base={y0 + L.f12} w={396} h={23} color={BAR_BODY} s={sF} />
      <Bar x={col} base={y0 + L.credit} w={330} h={12} color={BAR_SMALL} />
      {/* STAND-IN mark on the top rail */}
      <text x={(X0 + X1) / 2} y={FACE.y0 - 5} textAnchor="middle" fontFamily="sans-serif" fontSize={12} fill={CM.paper}>
        STAND-IN: K3 DealBoard pending
      </text>
      {/* loose ink on the frame's outer contour only */}
      <path d={`M${X0 - 2} ${FACE.y0 - RAIL + 8}V${LEGS_Y1}M${X1 + 2} ${FACE.y0 - RAIL + 8}V${LEGS_Y1}M${X0 + 8} ${FACE.y0 - RAIL - 1}H${X1 - 6}`} stroke={CM.ink} strokeWidth={3.4} fill="none" strokeLinecap="round" />
    </g>
  );
};
