// S08 fix round 3b: the DomeCity v3 city rows' BUILDINGS (x, w, roof top), so the 'millions' flood can stand ON the
// rooftops of rows 0-3 (the reviewers: 'pack it on rooftops AND streets'). The set does not export its row geometry, so
// this replays its generator (shared/sets/DomeCity.tsx `ROWS`) draw for draw: the SAME rng stream (`dome/row<ri>`) and
// the same number of draws per building (window dots, chrome, tiny browser windows, row-3 chimneys), keeping only the
// building rects. Checked against a render (roof lines overlaid on the set: docs/scenes/S08.md). If the set's generator
// changes, re-check this file.
import {rng} from '../../lib/rng';
import {DOME} from '../shared/sets';

export type Roof = {x: number; w: number; top: number; low: boolean; peak: boolean; box: boolean};

export const ROOFS: Roof[][] = (() => {
  const out: Roof[][] = [];
  const nCols = [3, 3, 4, 5];
  DOME.rows.forEach((row, ri) => {
    const r = rng(`dome/row${ri}`);
    const s = [0.22, 0.38, 0.62, 1][ri];
    const chromeQ = new Set<number>();
    const list: Roof[] = [];
    let x = -260;
    while (x < 1340) {
      const w = r.range(60, 150) * s;
      const top0 = r.range(row.top[0], row.top[1]);
      const low = ri === 3 && DOME.rattlers.row2.some((q) => q.x + 18 > x && q.x - 18 < x + w);
      const top = low ? 1338 : top0;
      r.int(0, nCols[ri] - 1); // colour
      const roof = r.next();
      list.push({x, w, top, low, peak: ri >= 2 && !low && roof < 0.22, box: ri >= 2 && !low && roof > 0.82});
      const q4 = Math.floor(((x + w / 2) / 1080) * 4);
      const cw = Math.min(w * 0.74, ri === 2 ? 74 : 112);
      const wantChrome = ri >= 2 && cw >= 60 && x + w / 2 > 60 && x + w / 2 < 1020 && q4 >= 0 && q4 <= 3 && !chromeQ.has(q4) && r.chance(0.7);
      let cr: [number, number, number, number] | null = null;
      if (wantChrome) {
        chromeQ.add(q4);
        cr = [x + (w - cw) / 2, top + (row.base - top) * 0.14, cw, cw * 0.62];
      }
      if (ri >= 1) {
        const ws = ri === 1 ? 4 : ri === 2 ? 6 : 9;
        const step = ws * 2.2;
        const deadCol = r.int(0, 5);
        let col = 0;
        for (let xx = x + ws; xx < x + w - ws * 1.2; xx += step, col++) {
          if (col === deadCol && w > step * 3) continue;
          for (let yy = top + ws * 1.4; yy < row.base - ws * 1.6; yy += step * 1.15) {
            if (cr && xx + ws > cr[0] - 3 && xx < cr[0] + cr[2] + 3 && yy + ws * 1.25 > cr[1] - 3 && yy < cr[1] + cr[3] + 3) continue;
            if (!r.chance(0.55)) continue;
            r.range(0.8, 1.15);
            r.range(0.85, 1.15);
            r.jitter(ws * 0.12);
            if (ri >= 2 && r.chance(0.3)) {
              r.range(0.4, 0.7);
              r.chance(0.5);
            }
          }
        }
      }
      if (ri >= 2 && !cr && w > 40 * s) r.chance(0.5);
      if (ri === 3 && roof > 0.55 && roof < 0.82) {
        r.range(0.2, 0.7);
        r.chance(0.5);
      }
      x += w + r.range(-4, 3) * s;
    }
    out.push(list);
  });
  return out;
})();

/** The roof top y of row `ri` at x (the building under x; the row's lowest top if none). */
export const roofAt = (ri: number, x: number): number => {
  for (const b of ROOFS[ri]) if (x >= b.x && x < b.x + b.w) return b.top;
  return DOME.rows[ri].top[1];
};
