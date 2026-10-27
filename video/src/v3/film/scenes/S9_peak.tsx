// S9_peak (S9 lane, G5b): THE mountain of memory sticks as a PEAK, huge yet far (docs/v3/s9_scale_plan.md: summit
// (760, 626), flanks 30-35 deg, the right one leaving the frame low at y ~830, a crest of jutting stick ends; sticks 40
// px at the foot -> 20 at the crest, so the size gradient itself says "far and huge"). Far-plane tones: a muted gold
// (44 L of range, 0.65x the near stick's), chips and pins still on every stick so it never reads as hay or banknotes.
// ~1000 sticks, computed once and drawn as five raw paths (board, shade, pins, chips, hairline ink). End-frame coords.
import React from 'react';
import {rng} from '../../../lib/rng';
import {T9} from './S9_tones';

type Pt = [number, number];
const f1 = (v: number) => v.toFixed(1);

export const PEAK = {x: 760, y: 626, base: 1012, tanL: Math.tan((33 * Math.PI) / 180), tanR: Math.tan((31 * Math.PI) / 180)};
const X0 = -60;
const X1 = 1240;

const quad = (pts: Pt[]) => `M${f1(pts[0][0])} ${f1(pts[0][1])}L${f1(pts[1][0])} ${f1(pts[1][1])}L${f1(pts[2][0])} ${f1(pts[2][1])}L${f1(pts[3][0])} ${f1(pts[3][1])}Z`;

const PEAK_D = (() => {
  const r = rng('s9/peak');
  type S = {x: number; y: number; w: number; rot: number; shade: boolean};
  const rows: S[][] = [];
  const H = PEAK.base - PEAK.y;
  const wAt = (y: number) => 20 + 20 * Math.max(0, Math.min(1, (y - PEAK.y) / H));
  // rows from the foot up to the crest
  for (let y = PEAK.base + 6; y > PEAK.y - 4; ) {
    const w = wAt(y);
    const dy = Math.max(0, y - PEAK.y);
    const xl = Math.max(X0, PEAK.x - dy / PEAK.tanL);
    const xr = Math.min(X1, PEAK.x + dy / PEAK.tanR);
    const row: S[] = [];
    const step = w * 0.6;
    const n = Math.max(1, Math.round((xr - xl) / step));
    for (let i = 0; i < n; i++) {
      const u = n === 1 ? 0.5 : i / (n - 1);
      const edge = i === 0 || i === n - 1;
      const sx = xl + u * (xr - xl) + r.jitter(step * 0.3);
      // sticks mostly near level; at the silhouette (row ends, the crest) they jut out at an angle
      const jut = edge || dy < 22;
      const rot = jut ? r.range(24, 58) * (sx < PEAK.x ? -1 : 1) * (r.chance(0.3) ? -1 : 1) : r.chance(0.08) ? r.range(45, 65) * r.sign() : r.jitter(26);
      const shade = r.chance(0.22 + 0.25 * Math.max(0, (sx - PEAK.x) / 500));
      row.push({x: sx + (jut && edge ? (i === 0 ? -w * 0.18 : w * 0.18) : 0), y: y + r.jitter(w * 0.08) - (jut ? r.range(2, 6) : 0), w: w * r.range(0.86, 1.04), rot, shade});
    }
    rows.push(row);
    y -= w * 0.31 * 0.74;
  }
  let board = '';
  let deep = '';
  let pins = '';
  let chips = '';
  let ink = '';
  // back (top) rows first, so the nearer foot rows overlap them
  for (let ri = rows.length - 1; ri >= 0; ri--) {
    for (const s of rows[ri]) {
      const h = s.w * 0.31;
      const a = (s.rot * Math.PI) / 180;
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const P = (lx: number, ly: number): Pt => [s.x + lx * ca - ly * sa, s.y + lx * sa + ly * ca];
      const hw = s.w / 2;
      const hh = h / 2;
      const body = quad([P(-hw, -hh), P(hw, -hh), P(hw, hh), P(-hw, hh)]);
      if (s.shade) deep += body;
      else board += body;
      ink += body;
      pins += quad([P(-hw * 0.9, hh * 0.52), P(hw * 0.9, hh * 0.52), P(hw * 0.9, hh), P(-hw * 0.9, hh)]);
      const cw = s.w * 0.19;
      for (let i = 0; i < 4; i++) {
        const cx0 = -hw + s.w * 0.06 + i * (cw + s.w * 0.04);
        chips += quad([P(cx0, -hh + h * 0.13), P(cx0 + cw, -hh + h * 0.13), P(cx0 + cw, -hh + h * 0.63), P(cx0, -hh + h * 0.63)]);
      }
    }
  }
  // the mound behind the sticks (no gaps), a little inside the silhouette so the jutting ends read
  const mound: Pt[] = [[X0, PEAK.base + 40], [X0, Math.max(PEAK.y, PEAK.y + (PEAK.x - X0) * PEAK.tanL) + 6], [PEAK.x, PEAK.y + 8], [X1, PEAK.y + (X1 - PEAK.x) * PEAK.tanR + 6], [X1, PEAK.base + 40]];
  const moundD = mound.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';
  return {board, deep, pins, chips, ink, mound: moundD};
})();

export const PeakPile: React.FC = () => (
  <>
    <path d={PEAK_D.mound} fill={T9.pileDeep} />
    <path d={PEAK_D.board} fill={T9.pileGold} />
    <path d={PEAK_D.deep} fill={T9.pileDeep} />
    <path d={PEAK_D.pins} fill={T9.pilePin} />
    <path d={PEAK_D.chips} fill={T9.pileChip} />
    <path d={PEAK_D.ink} fill="none" stroke={T9.pileInk} strokeWidth={1.05} strokeLinejoin="round" />
  </>
);
