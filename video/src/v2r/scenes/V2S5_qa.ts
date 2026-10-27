// V2S5_qa.ts (lane L4): the S5 camera checks as pure functions (no drawing). Run in node through esbuild:
//   npx esbuild src/v2r/scenes/V2S5_qa_run.ts --bundle --platform=node --format=cjs --jsx=automatic --loader:.tsx=tsx \
//     --outfile=/tmp/s5qa.js --log-level=error && node /tmp/s5qa.js
// (or the lane's scratch runner). Speeds are on-screen px per 60 fps frame of representative END-coords points of
// every plane (only points ON SCREEN at that frame count), over the whole move; TREATMENT / map.ts CAMSPEED: detailed
// layers <= 15 px/f, long flat-ink moves <= 7.5 (the wipe is a flat mass: it may be faster).
import {CAMSPEED} from '../world/map';
import {applyMat, planeMat, startMat, boxMat, wipeMat, craneP, CRANE_T, PLANES, S5_T0, FAR_S5, swapAt, SWAP_P, FIG, DECK} from './V2S5_rig';
import {FAR_END} from './V2S5_far';
import {SUN1} from '../world/map';
import type {Mat} from '../../lib/xf';
import type {Pt} from '../../lib/sketch';

export type SpeedRow = {layer: string; max: number; at: number; limit: number; ok: boolean};

const grid = (xs: number[], ys: number[]): Pt[] => xs.flatMap((x) => ys.map((y) => [x, y] as Pt));
const onScreen = (q: Pt) => q[0] > -40 && q[0] < 1120 && q[1] > 0 && q[1] < 1920;

/** Fastest on-screen motion per plane over the move (px per 60 fps frame). */
export function s5Speeds(): SpeedRow[] {
  const t0 = CRANE_T.t0 - 0.05;
  const t1 = CRANE_T.t1 + 0.05;
  const hz = FAR_END.horizon;
  const rows: [string, (t: number) => Mat, Pt[], number][] = [
    ['far (clouds, bank, city, obelisk)', (t) => planeMat(PLANES.far, craneP(t)), grid([-600, -200, 0, 270, 540, 810, 1080, 1400, 1800], [80, 200, 290, hz - 140, hz - 60, hz, hz + 40]), CAMSPEED.detailedLayerMax],
    ['river', (t) => planeMat(PLANES.river, craneP(t)), grid([-600, -200, 0, 540, 1080, 1500], [hz + 50, hz + 80, hz + 110]), CAMSPEED.detailedLayerMax],
    ['mid (Pentagon, lawns)', (t) => planeMat(PLANES.mid, craneP(t)), grid([-400, 0, 322, 700, 1080, 1400], [846, 980, 1104, 1180]), CAMSPEED.detailedLayerMax],
    ['near-mid (slope crowns, start coords)', (t) => startMat(PLANES.nearmid, craneP(t)), grid([0, 300, 600, 900, 1080], [598, 880, 1010, 1100]), CAMSPEED.detailedLayerMax],
    ['deck (terrace, figures)', (t) => planeMat(PLANES.deck, craneP(t)), grid([-200, 0, 200, 318, 500, 700, 900, 1080, 1300], [1180, 1238, 1350, 1450, 1550, 1650, 1800, 1920]), CAMSPEED.detailedLayerMax],
    ['left frame (tree box)', (t) => boxMat(PLANES.tree, craneP(t)), grid([-170, 100, 290], [642, 1000, 1268, 1700]), CAMSPEED.detailedLayerMax],
    ['right frame (lamppost box)', (t) => boxMat(PLANES.right, craneP(t)), grid([860, 1006, 1100], [1350, 1600, 1900]), CAMSPEED.detailedLayerMax],
    ['wipe lamppost (flat mass)', (t) => wipeMat(craneP(t)), [[0, -560] as Pt, [0, -380] as Pt, [-230, -380] as Pt, [230, -380] as Pt], 120],
  ];
  return rows.map(([layer, at, pts, limit]) => {
    let best = {max: 0, at: t0};
    for (let f = Math.round(t0 * 60); f < Math.round(t1 * 60); f++) {
      const a = at(f / 60);
      const b = at((f + 1) / 60);
      for (const q of pts) {
        const pa = applyMat(a, q);
        if (!onScreen(pa)) continue;
        const pb = applyMat(b, q);
        const v = Math.hypot(pb[0] - pa[0], pb[1] - pa[1]);
        if (v > best.max) best = {max: v, at: f / 60};
      }
    }
    const max = Math.round(best.max * 10) / 10;
    return {layer, max, at: Math.round((best.at + S5_T0) * 100) / 100, limit, ok: max <= limit};
  });
}

/** Where the far plane puts its end sun at p 0 (must be SUN1 exactly) and the band clearance of the far plane's
 *  highest end-coords point at p 0 (a cloud top at end y maps to start y). */
export function s5FarCheck(): {sunStart: {x: number; y: number; r: number}; sun1: typeof SUN1; startYOf: (endY: number) => number} {
  const m = planeMat(FAR_S5, 0);
  const q = applyMat(m, [FAR_END.sun.x, FAR_END.sun.y]);
  return {sunStart: {x: q[0], y: q[1], r: FAR_END.sun.r * FAR_S5.k}, sun1: SUN1, startYOf: (endY: number) => applyMat(m, [540, endY])[1]};
}

/** A one-screen text report. */
export function s5Report(): string {
  const rows = s5Speeds();
  const far = s5FarCheck();
  const lines = [
    `S5 camera check (scene t0 film ${S5_T0}; move ${(CRANE_T.t0 + S5_T0).toFixed(2)}-${(CRANE_T.t1 + S5_T0).toFixed(2)}; swap ${(swapAt + S5_T0).toFixed(3)} at p ${SWAP_P.toFixed(3)})`,
    ...rows.map((r) => `${r.ok ? 'ok  ' : 'FAIL'} ${r.layer.padEnd(40)} ${String(r.max).padStart(6)} px/f at ${r.at.toFixed(2)} (limit ${r.limit})`),
    `far: end sun (${FAR_END.sun.x}, ${FAR_END.sun.y}) r ${FAR_END.sun.r} -> start (${far.sunStart.x.toFixed(1)}, ${far.sunStart.y.toFixed(1)}) r ${far.sunStart.r.toFixed(1)}; SUN1 (${SUN1.x}, ${SUN1.y}) r ${SUN1.r}`,
    `far: an end y of 610 / 620 / 300 / 290 sits at start y ${far.startYOf(610).toFixed(1)} / ${far.startYOf(620).toFixed(1)} / ${far.startYOf(300).toFixed(1)} / ${far.startYOf(290).toFixed(1)} (band 317-556; tops >= 610)`,
    `figures: start stranger (${FIG.start.stranger.x}, ${FIG.start.stranger.feetY}) h ${FIG.start.stranger.h}; end (${FIG.end.stranger.x}, ${FIG.end.stranger.feetY}) h ${FIG.end.stranger.h}; Pip start (${FIG.start.pip.x}, ${FIG.start.pip.y}) ${FIG.start.pipSize} px -> end (${FIG.end.pip[0].toFixed(1)}, ${FIG.end.pip[1].toFixed(1)}) ${FIG.end.pipSize.toFixed(1)} px; deck k ${DECK.k.toFixed(3)}`,
  ];
  return lines.join('\n');
}
