// S9_peak (S9 lane, G5b): THE mountain of memory sticks as a PEAK, huge yet far (docs/v3/s9_scale_plan.md: summit
// (760, 626), flanks 30-35 deg, the right one leaving the frame low at y ~830, a crest of jutting stick ends; sticks 52
// px at the foot -> 26 at the crest (the plan's fallback when 40 px read as hay at phone size), so the size gradient itself
// says "far and huge"). GOLD MEMORY, never a woodpile (G5b review 1: at #78655B, L 44 / chroma 10, it read as twigs or
// dirt): each stick face is >= 60 % gold, 2-3 warm-dark chips (#5A4232, <= 30 % of the face) and a thin pin strip; no ink
// inside the pile (a hairline only on the crest's jutting sticks), so the far mass averages ~L 62 / chroma ~27, the
// warmest far shape and visibly the same thing as the flying sticks. ~1000 sticks, computed once, drawn in ~80 layered groups.
// End-frame coords.
import React from 'react';
import {rng} from '../../../lib/rng';
import {T9} from './S9_tones';

type Pt = [number, number];
const f1 = (v: number) => v.toFixed(1);

export const PEAK = {x: 760, y: 626, base: 1000, tanL: Math.tan((33 * Math.PI) / 180), tanR: Math.tan((31 * Math.PI) / 180)};
const X0 = -60;
const X1 = 1240;

const quad = (pts: Pt[]) => `M${f1(pts[0][0])} ${f1(pts[0][1])}L${f1(pts[1][0])} ${f1(pts[1][1])}L${f1(pts[2][0])} ${f1(pts[2][1])}L${f1(pts[3][0])} ${f1(pts[3][1])}Z`;

const PEAK_D = (() => {
  const r = rng('s9/peak');
  type S = {x: number; y: number; w: number; rot: number; shade: boolean; jut: boolean; chips: number};
  const rows: S[][] = [];
  const H = PEAK.base - PEAK.y;
  const wAt = (y: number) => 26 + 26 * Math.max(0, Math.min(1, (y - PEAK.y) / H));
  // rows from the foot up to the crest
  for (let y = PEAK.base - 4; y > PEAK.y - 4; ) {
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
      const rot = jut ? r.range(20, 48) * (sx < PEAK.x ? -1 : 1) * (r.chance(0.3) ? -1 : 1) : r.chance(0.05) ? r.range(40, 60) * r.sign() : r.jitter(16);
      const shade = r.chance(0.22 + 0.25 * Math.max(0, (sx - PEAK.x) / 500));
      row.push({x: sx + (jut && edge ? (i === 0 ? -w * 0.18 : w * 0.18) : 0), y: y + r.jitter(w * 0.08) - (jut ? r.range(2, 6) : 0), w: w * r.range(0.86, 1.04), rot, shade, jut, chips: r.chance(0.5) ? 3 : 2});
    }
    rows.push(row);
    y -= w * 0.31 * 0.74;
  }
  // drawn in LAYERS (each row back to front, its even sticks then its odd ones): one group's chips never print over a
  // nearer stick's face (with one path per tone, the hidden sticks' chips showed through and the mass went dark)
  type G = {board: string; deep: string; pins: string; chips: string};
  const groups: G[] = [];
  let ink = '';
  for (let ri = rows.length - 1; ri >= 0; ri--) {
    for (const parity of [0, 1]) {
      const g: G = {board: '', deep: '', pins: '', chips: ''};
      rows[ri].forEach((s, si) => {
        if (si % 2 !== parity) return;
        const h = s.w * 0.31;
        const a = (s.rot * Math.PI) / 180;
        const ca = Math.cos(a);
        const sa = Math.sin(a);
        const P = (lx: number, ly: number): Pt => [s.x + lx * ca - ly * sa, s.y + lx * sa + ly * ca];
        const hw = s.w / 2;
        const hh = h / 2;
        const body = quad([P(-hw, -hh), P(hw, -hh), P(hw, hh), P(-hw, hh)]);
        if (s.shade) g.deep += body;
        else g.board += body;
        // the hairline only on the crest's jutting sticks (inside the pile it greyed the whole mass)
        if (s.jut) ink += body;
        // a thin pin strip (13 % of the face) and 2-3 chips (17-26 %): the rest of the face stays gold
        g.pins += quad([P(-hw * 0.88, hh * 0.7), P(hw * 0.88, hh * 0.7), P(hw * 0.88, hh), P(-hw * 0.88, hh)]);
        const cw = s.w * 0.17;
        const gap = s.w * (s.chips === 3 ? 0.1 : 0.16);
        const run = s.chips * cw + (s.chips - 1) * gap;
        for (let i = 0; i < s.chips; i++) {
          const cx0 = -run / 2 + i * (cw + gap);
          g.chips += quad([P(cx0, -hh + h * 0.16), P(cx0 + cw, -hh + h * 0.16), P(cx0 + cw, -hh + h * 0.6), P(cx0, -hh + h * 0.6)]);
        }
      });
      groups.push(g);
    }
  }
  // the mound behind the sticks (no gaps), a little inside the silhouette so the jutting ends read
  const mound: Pt[] = [[X0, PEAK.base], [X0, Math.max(PEAK.y, PEAK.y + (PEAK.x - X0) * PEAK.tanL) + 6], [PEAK.x, PEAK.y + 8], [X1, PEAK.y + (X1 - PEAK.x) * PEAK.tanR + 6], [X1, PEAK.base]];
  const moundD = mound.map(([x, y], i) => `${i ? 'L' : 'M'}${f1(x)} ${f1(y)}`).join('') + 'Z';
  return {groups, ink, mound: moundD};
})();

export const PeakPile: React.FC = () => (
  <>
    <path d={PEAK_D.mound} fill={T9.pileDeep} />
    {PEAK_D.groups.map((g, i) => (
      <React.Fragment key={i}>
        <path d={g.board} fill={T9.pileGold} />
        <path d={g.deep} fill={T9.pileDeep} />
        <path d={g.pins} fill={T9.pilePin} />
        <path d={g.chips} fill={T9.pileChip} />
      </React.Fragment>
    ))}
    <path d={PEAK_D.ink} fill="none" stroke={T9.pileInk} strokeWidth={0.9} strokeLinejoin="round" />
  </>
);
