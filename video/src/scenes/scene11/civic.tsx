// S11 local stand-in: the far civic skyline's lights-out as ONE haze step (A1 fix round 1).
//
// Review: the set's civic 'off' palette (CIVIC_FILL dark: near tier #84B09C -> #4E786A, two steps) left a ~250 x 340 px
// dark-teal mass right beside the J6 note for the whole joke (49.8-52.16), darker than the near govB / govC facades: far
// read nearer than near (atmospheric depth inverted) and it pulled the eye off the note. GovernmentPlaza has no option
// for a lighter off state (sets lane request), so S11 keeps the set's skyline LIT (no civicOffAt / civicLanternsOffAt)
// and draws this overlay through the set's own `wrap('far', ...)` slot, right after the far city (under the ground and
// the buildings, so every occlusion is the set's): from the first step on, every silhouette in the set's depth order with
// its CURRENT state. Off = one haze step darker (back #A2C8B6 -> #93BCAA, mid #93BCAA -> #84B09C, near #84B09C ->
// #709F8B) with its lit window dots and lanterns going dark (cream -> tealDark): the cascade still reads left to right
// on the 0.04 s cadence, the mass stays lighter than the near facades. Geometry: a verbatim copy of GovernmentPlaza's
// CIV builder (same PLAZA_CIVIC data, same rng seeds, same Fill seeds: pixel-identical while lit), clipped above the
// far city's horizon line (PLAZA.civicBase) so the set's far steps (drawn after the silhouettes) stay on top.
// Swap out when the sets lane ships a civic off palette / `civicOffStep` option.

import React from 'react';
import {palette} from '../../lib/theme';
import {useTime} from '../../lib/time';
import {Fill} from '../../lib/Fill';
import {rectPath} from '../../lib/sketch';
import {rng} from '../../lib/rng';
import {PLAZA, PLAZA_CIVIC} from '../shared/sets';

/** [lit, off] per depth (0 back, 1 mid, 2 near): lit = the set's CIVIC_FILL lit values, off = one haze step. */
const CIVIC_HAZE: [string, string][] = [
  ['#A2C8B6', '#93BCAA'],
  ['#93BCAA', '#84B09C'],
  ['#84B09C', '#709F8B'],
];

// ---- verbatim copy of GovernmentPlaza's CIV builder (kit v3b)
const CIV = (() => {
  const CB = PLAZA.civicBase;
  const base = CB + 30;
  const f = (n: number) => n.toFixed(1);
  const R = (x: number, y: number, w: number, h: number) => rectPath(x, y, w, h);
  const [ex0, ex1] = PLAZA.civicExtent;
  const minX = (dp: number) => Math.min(...PLAZA_CIVIC.filter((q) => q.depth === dp).map((q) => q.band[0]));
  const maxX = (dp: number) => Math.max(...PLAZA_CIVIC.filter((q) => q.depth === dp).map((q) => q.band[1]));
  return PLAZA_CIVIC.map((c) => {
    const {x0, x1, top, cx, depth} = c;
    const near = depth === 2;
    const back = depth === 0;
    const bandTop = PLAZA.civicBands[depth];
    const r = rng(`gp/civ/${c.id}`);
    const [bx0, bx1] = c.band;
    const lx0 = bx0 === minX(depth) ? Math.min(bx0, ex0) : bx0;
    const lx1 = bx1 === maxX(depth) ? Math.max(bx1, ex1) : bx1;
    let d = R(lx0, bandTop, lx1 - lx0 + 0.5, base - bandTop);
    const bw = r.range(16, 26);
    const bxs = r.range(bx0 + 6, bx1 - bw - 6);
    d += R(bxs, bandTop - r.range(7, 12), bw, 14);
    const rr = rng(`gp/civx/${c.id}`);
    const extDots: number[] = [];
    if (lx1 > bx1) {
      for (let k = 0; k < 2; k++) {
        const w = rr.range(22, 40);
        const xs = bx1 + 16 + k * ((lx1 - bx1) / 2) + rr.range(0, (lx1 - bx1) / 2 - w - 24);
        const y = bandTop - rr.range(8, 16);
        d += R(xs, y, w, 18);
      }
      for (let x = bx1 + rr.range(10, 20); x < lx1 - 8; x += rr.range(18, 28)) if (rr.chance(0.42)) extDots.push(x);
    }
    let lantern = '';
    let dots = '';
    const dot = (x: number, y: number, w: number, h: number) => (dots += R(x, y, w, h));
    if (c.kind === 'dome') {
      const lanW = near ? 14 : 12;
      const lanH = near ? 18 : 15;
      const rx = (x1 - x0) / 2 - 3;
      const ry = near ? 26 : 20;
      const domeTop = top + 6 + lanH;
      const drumTop = domeTop + ry;
      d +=
        `M${f(x0)} ${base}L${f(x0)} ${f(drumTop + 5)}L${f(x0 - 3)} ${f(drumTop + 5)}L${f(x0 - 3)} ${f(drumTop)}` +
        `L${f(cx - rx)} ${f(drumTop)}A${f(rx)} ${ry} 0 0 1 ${f(cx + rx)} ${f(drumTop)}` +
        `L${f(x1 + 3)} ${f(drumTop)}L${f(x1 + 3)} ${f(drumTop + 5)}L${f(x1)} ${f(drumTop + 5)}L${f(x1)} ${base}Z` +
        `M${f(cx - lanW / 2)} ${f(domeTop + 3)}L${f(cx - lanW / 2)} ${f(top + 6)}L${f(cx)} ${f(top)}L${f(cx + lanW / 2)} ${f(top + 6)}L${f(cx + lanW / 2)} ${f(domeTop + 3)}Z`;
      lantern = R(cx - lanW / 2 + 2, top + 8, lanW - 4, lanH - 4);
      const n = near ? 3 : 2;
      const ww = near ? 5 : 3;
      const wh = near ? 8 : 5;
      for (let i = 0; i < n; i++) dot(cx - ((n - 1) / 2 - i) * (near ? 14 : 10) - ww / 2, drumTop + (near ? 11 : 9), ww, wh);
    } else if (c.kind === 'temple') {
      const pedH = near ? 18 : 14;
      const corn = top + pedH;
      d +=
        `M${f(x0)} ${base}L${f(x0)} ${f(corn + 6)}L${f(x0 - 4)} ${f(corn + 6)}L${f(x0 - 4)} ${f(corn)}L${f(cx)} ${f(top)}` +
        `L${f(x1 + 4)} ${f(corn)}L${f(x1 + 4)} ${f(corn + 6)}L${f(x1)} ${f(corn + 6)}L${f(x1)} ${base}Z`;
      const n = near ? 4 : 3;
      const sw = near ? 5 : 4;
      const sh = near ? 20 : 14;
      const pitch = (x1 - x0 - 12) / (n - 1);
      for (let i = 0; i < n; i++) dot(x0 + 6 + i * pitch - sw / 2, corn + 12, sw, sh);
    } else {
      const spH = back ? 30 : 34;
      const bel = top + spH;
      d +=
        `M${f(x0 + 3)} ${base}L${f(x0 + 3)} ${f(bel + 6)}L${f(x0)} ${f(bel + 6)}L${f(x0)} ${f(bel)}L${f(cx)} ${f(top)}` +
        `L${f(x1)} ${f(bel)}L${f(x1)} ${f(bel + 6)}L${f(x1 - 3)} ${f(bel + 6)}L${f(x1 - 3)} ${base}Z`;
      const fr = back ? 4.5 : 7;
      const fy = bel + 8 + fr;
      dots += `M${f(cx - fr)} ${f(fy)}a${fr} ${fr} 0 1 0 ${f(2 * fr)} 0a${fr} ${fr} 0 1 0 ${f(-2 * fr)} 0Z`;
      dot(cx - (back ? 1.5 : 2.5), fy + fr + 8, back ? 3 : 5, back ? 6 : 9);
    }
    const dw = near ? 5 : back ? 3 : 4;
    const dh = near ? 6 : back ? 4 : 5;
    for (let x = bx0 + r.range(6, 14); x < bx1 - 8; x += r.range(16, 26)) if (r.chance(0.42)) dot(x, bandTop + (near ? 10 : 8), dw, dh);
    extDots.forEach((x) => dot(x, bandTop + (near ? 10 : 8), dw, dh));
    return {...c, d, lantern, dots};
  })
})();

const CIV_DEPTHS = [0, 1, 2].map((depth) => ({depth, idx: CIV.map((c, i) => (c.depth === depth ? i : -1)).filter((i) => i >= 0)}));
const LANTERN_IDX = CIV.map((c, i) => CIV.slice(0, i).filter((q) => 'lantern' in q && q.lantern).length);

/** The far civic skyline's one-step lights-out, drawn in the set's 'far' wrap slot after the far city. `offAt[i]` =
 *  when PLAZA_CIVIC[i] steps off (the set's civicOffAt array order); `lanternsOffAt` = the civic lanterns (0.06 s
 *  stagger left to right, never before their own dome: the set's rule). Nothing before the first step. */
export const CivicHaze: React.FC<{offAt: number[]; lanternsOffAt: number; seed?: string}> = ({offAt, lanternsOffAt, seed = 'plaza'}) => {
  const t = useTime();
  if (t < Math.min(...offAt)) return null;
  const clipId = 's11-civic-haze';
  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <rect x={-1e4} y={-1e4} width={2e4} height={1e4 + PLAZA.civicBase} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        {CIV_DEPTHS.map(({depth, idx}) => (
          <React.Fragment key={depth}>
            {idx.map((i) => {
              const c = CIV[i];
              const dark = offAt[i] !== undefined && t >= offAt[i];
              const [lit, off] = CIVIC_HAZE[c.depth];
              let lanternOn = !dark;
              if ('lantern' in c && c.lantern) lanternOn = t < Math.max(lanternsOffAt + LANTERN_IDX[i] * 0.06, offAt[i] ?? -Infinity);
              return (
                <React.Fragment key={c.id}>
                  <Fill d={c.d} color={dark ? off : lit} offset={false} mode="none" seed={`${seed}/civ${i}`} />
                  <Fill d={c.dots} color={dark ? palette.tealDark : palette.cream} offset={false} mode="none" seed={`${seed}/civd${i}`} />
                  {c.lantern ? <Fill d={c.lantern} color={lanternOn ? palette.cream : palette.tealDark} offset={false} mode="none" seed={`${seed}/civl${i}`} /> : null}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        ))}
      </g>
    </>
  );
};
