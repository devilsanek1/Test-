// V2S5_deck_qa.ts (lane L4, TERRACE): the deck builder's own checks as pure functions (no drawing). Run in node:
//   npx esbuild src/v2r/scenes/V2S5_deck_qa.ts --bundle --platform=node --format=cjs --jsx=automatic \
//     --loader:.tsx=tsx --loader:.woff2=empty --outfile=<scratch>/deckqa.js --log-level=error && node <scratch>/deckqa.js
// 1. the terrace people's size ON SCREEN over the whole shot (the deck is 2.42x at the start): nobody in frame at the
//    held start, nobody over ~190 px tall at any frame of the move; 2. at the end hold, nobody over the pair, the
//    plaque or the Pentagon's left two thirds; 3. the balusters' strobe ratio (on-screen px moved per frame / their
//    on-screen period) over the move; 4. the deck's highest content point on screen at every p (never above y 600);
//    5. the wipe's basket mass over the stranger at the swap.
import '../palette';
import {craneP, planeMat, applyMat, matScale, DECK, wipeMat, swapAt, WIPE} from '../kit/dc/crane';
import {castBoxes} from './V2S5_deck_life';
import {RAIL, pxmD, SPOT, CAM} from './V2S5_deck_cam';
import type {Pt} from '../../lib/sketch';

const F = 207;
const scr = (p: number, q: Pt) => applyMat(planeMat(DECK, p), q);

function sizes(): string[] {
  const best = new Map<string, {h: number; t: number; startOn: boolean}>();
  for (let f = 0; f < F; f++) {
    const t = f / 60;
    const p = craneP(t);
    const k = matScale(planeMat(DECK, p));
    for (const b of castBoxes(t)) {
      const a = scr(p, [b.x0, b.y0]);
      const c = scr(p, [b.x1, b.y1]);
      const on = c[0] > 0 && a[0] < 1080 && c[1] > 0 && a[1] < 1920;
      const cur = best.get(b.key) ?? {h: 0, t: 0, startOn: false};
      if (on && b.h * k > cur.h) {
        cur.h = b.h * k;
        cur.t = t;
      }
      if (on && t < 0.75) cur.startOn = true;
      best.set(b.key, cur);
    }
  }
  const out = ['1. cast size on screen (max over the shot; END height in brackets):'];
  const end = castBoxes(3.2);
  best.forEach((v, key) => {
    const e = end.find((x) => x.key === key);
    out.push(`   ${v.startOn ? 'FAIL' : v.h > 195 ? 'WARN' : 'ok  '} ${key.padEnd(12)} max ${v.h.toFixed(0).padStart(4)} px at t ${v.t.toFixed(2)} (end ${e ? e.h.toFixed(0) : '-'} px)${v.startOn ? '  ON SCREEN AT THE HELD START' : ''}`);
  });
  return out;
}

function endOverlaps(): string[] {
  const out = ['2. the end hold (t 2.85-3.45): nobody over the pair / the plaque / the Pentagon left 2/3'];
  const zones: [string, number, number, number, number][] = [
    ['pair', 280, 1168, 395, 1245],
    ['plaque', SPOT.plaque.x0, SPOT.plaque.y0, SPOT.plaque.x1, SPOT.plaque.y1],
    ['Pentagon left 2/3', 322, 846, 827, 1104],
  ];
  let bad = 0;
  for (let f = Math.round(2.85 * 60); f < F; f++) {
    const t = f / 60;
    for (const b of castBoxes(t)) {
      for (const [name, x0, y0, x1, y1] of zones) {
        if (b.x1 > x0 && b.x0 < x1 && b.y1 > y0 && b.y0 < y1) {
          if (bad < 8) out.push(`   FAIL ${b.key} over the ${name} at t ${t.toFixed(2)}`);
          bad++;
        }
      }
    }
  }
  if (!bad) out.push('   ok   no overlap');
  return out;
}

function strobe(): string[] {
  const period = 0.34 * pxmD(RAIL.d);
  let worst = {r: 0, t: 0, v: 0, per: 0};
  for (let f = Math.round(0.7 * 60); f < Math.round(2.9 * 60); f++) {
    const t0 = f / 60;
    const pa = craneP(t0);
    const pb = craneP(t0 + 1 / 60);
    const k = matScale(planeMat(DECK, pa));
    for (let x = -200; x <= 1300; x += 20) {
      for (const y of [RAIL.top, RAIL.base]) {
        const a = scr(pa, [x, y]);
        if (a[0] < 0 || a[0] > 1080) continue;
        const b = scr(pb, [x, y]);
        const v = Math.hypot(b[0] - a[0], b[1] - a[1]);
        const r = v / (period * k);
        if (r > worst.r) worst = {r, t: t0, v, per: period * k};
      }
    }
  }
  return [`3. balusters: worst ${worst.v.toFixed(1)} px/f vs an on-screen period of ${worst.per.toFixed(1)} px = ${worst.r.toFixed(2)} of a period per frame at t ${worst.t.toFixed(2)} (${worst.r > 0.5 ? 'FAIL: strobes' : worst.r > 0.4 ? 'WARN' : 'ok'})`];
}

function topLine(): string[] {
  // the deck's highest drawn points: the kid's beanie at the rail (~1.5 m above the parent's feet... + the kid) and the
  // coping (END y): their screen y at every p must stay below 600
  const kidTop = castBoxes(0).find((b) => b.key === 'railP');
  const pts: Pt[] = [[-1100, RAIL.top - 2], [2200, RAIL.top - 2], [kidTop ? kidTop.x0 : 950, kidTop ? kidTop.y0 : 1120]];
  let minY = 1e9;
  let at = 0;
  for (let f = 0; f < F; f++) {
    const p = craneP(f / 60);
    for (const q of pts) {
      const s = scr(p, q);
      if (s[0] < -40 || s[0] > 1120) continue;
      if (s[1] < minY) {
        minY = s[1];
        at = f / 60;
      }
    }
  }
  return [`4. the deck's highest on-screen point: y ${minY.toFixed(0)} at t ${at.toFixed(2)} (${minY >= 600 ? 'ok' : 'FAIL'}: never above 600)`];
}

function wipe(): string[] {
  const p = craneP(swapAt);
  const m = wipeMat(p);
  const k = WIPE.h / 560;
  // the baskets' mass: x +-230 k, y -440..-310 k (+ trailing to -300); the stranger's box through the deck
  const a = applyMat(m, [-232 * k, -432 * k]);
  const b = applyMat(m, [232 * k, -300 * k]);
  const s0 = scr(p, [SPOT.stranger.x - 14, SPOT.stranger.feetY - 64]);
  const s1 = scr(p, [SPOT.stranger.x + 14, SPOT.stranger.feetY - 20]);
  const cover = s0[0] >= a[0] && s1[0] <= b[0] && s0[1] >= a[1] && s1[1] <= b[1];
  return [`5. wipe at the swap (t ${swapAt.toFixed(3)}, p ${p.toFixed(3)}): baskets x ${a[0].toFixed(0)}-${b[0].toFixed(0)}, y ${a[1].toFixed(0)}-${b[1].toFixed(0)}; the stranger's head+torso x ${s0[0].toFixed(0)}-${s1[0].toFixed(0)}, y ${s0[1].toFixed(0)}-${s1[1].toFixed(0)}: ${cover ? 'covered' : 'NOT fully covered'}`];
}

console.log(
  [
    `V2S5 deck QA (horizon ${CAM.hz}, camera ${CAM.h.toFixed(2)} m, rail ${RAIL.d.toFixed(2)} m: top ${RAIL.top.toFixed(1)}, base ${RAIL.base})`,
    ...sizes(),
    ...endOverlaps(),
    ...strobe(),
    ...topLine(),
    ...wipe(),
  ].join('\n'),
);
