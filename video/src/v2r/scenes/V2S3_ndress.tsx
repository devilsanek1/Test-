// V2S3_ndress.tsx (lane L3, V2S3 NEAR helper; WORLD px at the 12.98 match, inside V2S3's camera): the boaters' things
// on OUR towpath beside the moored boat, so the near ground is a field MADE of things (LIFE_AND_DENSITY §0), never
// flat paving: a stack of split logs and a coal sack for the stove (the chimney's smoke has a reason), a pair of
// wellies on the coping by the side doors, a bay tree in a terracotta pot (a mass in the right rail), and a robin that
// hops along the log stack and pecks (life). Cast shadows run right, away from the low sun at left, as colour.
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line, arc as arcInk} from '../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, leafPath} from '../kit/canal/core';
import type {Pt} from '../kit/canal/core';
import {Levels} from './V2S3_nboat';

/** A long low-sun shadow lying on the towpath: from an object's foot (x0..x1 at y) it runs RIGHT and a little toward
 *  us (the sun is low at left), as a flat stone-shade shape attached to the foot. */
export const groundShadow = (b: Batch, x0: number, x1: number, y: number, len: number, h = 10) => {
  b.poly(CM.stoneShade, [[x0 + 4, y - 2], [x1, y - 2], [x1 + len, y + h * 0.6], [x1 + len - 6, y + h], [x0 + len * 0.55, y + h]]);
};

/** The log stack's base (its right end) and footprint; the coal sack beside it; the wellies; the bay tree. */
export const ND = {
  logs: {x0: 452, x1: 590, y: 1716},
  sack: [628, 1714] as Pt,
  wellies: [366, 1647] as Pt,
  bay: [1036, 1734] as Pt,
} as const;

// ---------------------------------------------------------------- the static dressing

function logsInto(L: Levels) {
  const {x0, x1, y} = ND.logs;
  const r = rng('s3nd/logs');
  groundShadow(L.at(0), x0, x1, y, 96, 16);
  // rows of split-log ends (wedges and rounds), bottom row widest; bark behind them
  const rows = [
    {n: 6, y: y - 12, r: 13},
    {n: 5, y: y - 35, r: 12.5},
    {n: 4, y: y - 57, r: 12},
  ];
  const bark = L.at(1);
  bark.poly(CM.line, [[x0 - 4, y], [x1 + 4, y], [x1 - 14, y - 72], [x0 + 16, y - 72]]);
  const end = L.at(2);
  const ring = L.at(3);
  let rings = '';
  for (const [k, row] of rows.entries()) {
    const span = (x1 - x0) * (1 - k * 0.16);
    const cx0 = (x0 + x1) / 2 - span / 2 + row.r;
    for (let i = 0; i < row.n; i++) {
      const cx = cx0 + ((span - row.r * 2) * i) / Math.max(1, row.n - 1) + r.jitter(2);
      const cy = row.y + r.jitter(1.5);
      const rr = row.r * r.range(0.86, 1.08);
      const wedge = r.chance(0.5);
      if (wedge) {
        const a = r.range(0, Math.PI * 2);
        const pts: Pt[] = [];
        for (let q = 0; q < 3; q++) {
          const ang = a + (q * Math.PI * 2) / 3;
          pts.push([cx + Math.cos(ang) * rr * 1.15, cy + Math.sin(ang) * rr * 1.05]);
        }
        end.poly(CM.coatOat, pts);
      } else end.fill(CM.coatOat, ovalPath(cx, cy, rr, rr * 0.94));
      ring.fill(CM.leafGold, ovalPath(cx + 1, cy + 1, rr * 0.42, rr * 0.38));
      rings += arcInk(cx, cy, rr * 0.7, rr * 0.66, 30, 250, {seed: `s3nd/r${k}${i}`});
    }
  }
  ring.ink(rings, 1.1, CM.line);
  ring.ink(line(x0 - 4, y, x1 + 4, y, {seed: 's3nd/logBase', over: 'small', drift: 0.1}), INK_PX.far, CM.ink, 0.3);
}

function sackInto(L: Levels) {
  const [x, y] = ND.sack;
  groundShadow(L.at(0), x - 24, x + 24, y, 64, 12);
  const d = `M${P(x - 26, y)}Q${P(x - 30, y - 30)} ${P(x - 14, y - 44)}L${P(x - 8, y - 52)}L${P(x + 4, y - 50)}L${P(x + 10, y - 42)}Q${P(x + 30, y - 30)} ${P(x + 26, y)}Z`;
  L.at(1).fill(CM.coatSlate, d);
  const c = L.at(2);
  c.fill(CM.shadeCool, `M${P(x + 6, y - 38)}Q${P(x + 26, y - 26)} ${P(x + 24, y - 2)}L${P(x + 10, y - 2)}Q${P(x + 14, y - 24)} ${P(x + 6, y - 38)}Z`);
  c.rect(CM.line, x - 9, y - 47, 18, 4);
  c.ink(`M${P(x - 26, y)}Q${P(x - 30, y - 30)} ${P(x - 14, y - 44)}M${P(x - 18, y - 20)}Q${P(x - 4, y - 24)} ${P(x + 8, y - 16)}`, INK_PX.far, CM.ink, 0.15);
}

function welliesInto(L: Levels) {
  const [x, y] = ND.wellies;
  const a = L.at(1);
  const c = L.at(2);
  for (const [k, dx] of [0, 26].entries()) {
    const bx = x + dx;
    const by = y + k * 3;
    const d = `M${P(bx - 9, by - 40)}L${P(bx + 8, by - 40)}L${P(bx + 8, by - 10)}Q${P(bx + 20, by - 8)} ${P(bx + 20, by)}L${P(bx - 10, by)}Z`;
    a.fill(k ? CM.coatPlum : CM.coatSlate, d);
    c.rect(CM.paper, bx - 9, by - 40, 17, 3.4);
    c.ink(`M${P(bx - 9, by - 40)}L${P(bx - 10, by)}L${P(bx + 20, by)}`, INK_PX.hair, CM.ink, 0.2);
  }
}

function bayInto(L: Levels) {
  const [x, y] = ND.bay;
  groundShadow(L.at(0), x - 26, x + 26, y, 120, 18);
  const a = L.at(1);
  // the terracotta pot with a rolled rim
  a.fill(CM.brick, `M${P(x - 34, y - 56)}L${P(x + 34, y - 56)}L${P(x + 26, y)}L${P(x - 26, y)}Z`);
  const c = L.at(2);
  c.fill(CM.brickDeep, `M${P(x - 38, y - 60)}L${P(x + 38, y - 60)}L${P(x + 36, y - 48)}L${P(x - 36, y - 48)}Z`);
  c.fill(CM.shadeWarm, `M${P(x + 10, y - 48)}L${P(x + 33, y - 48)}L${P(x + 26, y)}L${P(x + 8, y)}Z`);
  // the trunk and the clipped crown (two lobed masses)
  c.rect(CM.line, x - 3, y - 120, 6, 62);
  // the clipped crown: a lumpy ball (a few overlapping rounds), the low sun catching its left side, cool shade right
  const cy = y - 158;
  const lumps: [number, number, number][] = [[0, 0, 44], [-30, -14, 24], [26, -20, 26], [-6, -36, 24], [32, 12, 22], [-34, 14, 22]];
  const d = L.at(3);
  for (const [dx, dy, R] of lumps) d.fill(CM.waterDeep, ovalPath(x + dx, cy + dy, R, R * 0.96));
  const e = L.at(4);
  e.fill(CM.shadeCool, `M${P(x + 14, cy + 40)}Q${P(x + 52, cy + 30)} ${P(x + 52, cy - 4)}Q${P(x + 40, cy + 22)} ${P(x + 14, cy + 30)}Z`);
  e.fill(CM.sage, ovalPath(x - 22, cy - 16, 20, 15));
  e.fill(CM.sage, ovalPath(x - 4, cy - 38, 16, 10));
  e.fill(CM.sage, ovalPath(x - 36, cy + 8, 12, 9));
  const f = L.at(5);
  f.fill(CM.glass, ovalPath(x - 28, cy - 20, 7, 5));
  f.fill(CM.glass, ovalPath(x - 8, cy - 41, 6, 4));
  f.fill(CM.leafGold, ovalPath(x + 22, cy - 24, 5, 4));
  f.ink(arcInk(x, cy - 2, 50, 50, 150, 300, {seed: 's3nd/bayInk'}) + `M${P(x - 34, y - 56)}L${P(x - 26, y)}L${P(x + 26, y)}`, INK_PX.far, CM.ink, 0.2);
  // a few leaves the tree has dropped
  for (const [k, [lx, ly, ang]] of ([[x - 52, y + 6, 20], [x + 44, y + 12, 140], [x - 10, y + 16, 70]] as [number, number, number][]).entries()) e.fill(k % 2 ? CM.leafGold : CM.sage, leafPath(lx, ly, 14, 5, ang));
}

// ---------------------------------------------------------------- life: the robin

/** A robin on the log stack: hops along it at 13.36 and 14.22, pecks in between (drawn poses at 12/s). */
function robinInto(b: Batch, t: number) {
  const tq = Math.floor(t * 12 + 1e-6) / 12;
  const hops: [number, number, number][] = [
    [13.36, 486, 546],
    [14.22, 546, 512],
  ];
  let x = hops[0][1];
  let lift = 0;
  let face = 1;
  for (const [h0, xa, xb] of hops) {
    if (tq < h0) break;
    const k = Math.min(1, (tq - h0) / 0.25);
    x = xa + (xb - xa) * k;
    lift = Math.sin(k * Math.PI) * 14;
    face = xb > xa ? 1 : -1;
  }
  const y = ND.logs.y - 72 - lift;
  const peck = lift === 0 && Math.sin(tq * 7.3) > 0.55 ? 3 : 0;
  b.fill(CM.line, ovalPath(x, y - 9, 10, 8));
  b.fill(CM.line, `M${P(x - face * 8, y - 11)}L${P(x - face * 18, y - 16)}L${P(x - face * 16, y - 8)}Z`);
  b.fill(CM.line, ovalPath(x + face * 7, y - 16 + peck, 5.6, 5.4));
  b.layer();
  b.fill(CM.leafRust, ovalPath(x + face * 6, y - 9 + peck * 0.4, 5.4, 5.6));
  b.fill(CM.ink, ovalPath(x + face * 9, y - 17 + peck, 1.1, 1.1));
  b.fill(CM.ink, `M${P(x + face * 11, y - 16 + peck)}L${P(x + face * 16, y - 14 + peck * 1.4)}L${P(x + face * 11, y - 14 + peck)}Z`);
  b.rect(CM.ink, x - 1.5, y - 2, 1.4, 3);
  b.rect(CM.ink, x + 1.5, y - 2, 1.4, 3);
}

// ---------------------------------------------------------------- the component

export const S3Dress: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const L = new Levels();
    welliesInto(L);
    logsInto(L);
    sackInto(L);
    bayInto(L);
    return L.merge();
  }, []);
  const life = new Batch();
  robinInto(life, t);
  return (
    <>
      <Paint b={stat} seed="s3nDress" />
      <Paint b={life} seed="s3nRobin" misreg={false} />
    </>
  );
};

