// V2S4_wpath.tsx (lane L3, V2S4 WORLD helpers): HER TOWPATH, the 1.0x path plane at the 17.96 pose (plane px).
//   garden walls   y 862-992 at the back: each garden its own (stock brick in three tones, a rendered one, piers
//                  with stone caps), three wooden gates, iron railings, a trellis with roses, ivy spilling over, a
//                  pot on the coping, a wall lamp (off), a few brick ticks
//   paving         y 992-1070: broken slab joints in rows that widen toward us, repaired patches, a drain, a manhole,
//                  moss in the joints, fallen leaves (and a few skittering east in the wind)
//   coping         y 1070-1082: stone blocks, a lip, mooring rings, cast-iron bollards
//   furniture      heritage lamp posts (off: low sun), planters of grasses, a litter bin, a bike against a wall, a
//                  lifebuoy on its post; short colour shadows to the EAST (STYLE.md: <= ~40 px past the object)
// Nothing post-like stands under the plates (x 110-560 at the pose) beside the fingerpost (x 575).
import React, {useMemo} from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {line, circle as circleInk} from '../../lib/sketch';
import {Batch, Paint, P, rng, ovalPath, domePath, lobes, leafPath, lerp, frac} from '../kit/canal/core';
import {Lamp, bikeInto, bollardInto, binInto, planterInto} from '../kit/canal/towpath';
import {Heron} from '../kit/canal/life';
import {ROW, PLANE_X, SHADOW, WIND} from './V2S4_wcore';
import {benchReaderInto, anglerInto} from './V2S4_wcast';

const [X0, X1] = PLANE_X(1);
const TOP = ROW.wallTop;
const FOOT = ROW.wallFoot;
const COP = ROW.copingTop;
const EDGE = ROW.edge;

// ---------------------------------------------------------------- garden walls

type Seg = {x0: number; x1: number; kind: 'brick' | 'render' | 'gate' | 'railing' | 'trellis'; c: string; ivy?: boolean; pot?: boolean; gate?: string};
const SEGS: Seg[] = [
  {x0: X0, x1: 128, kind: 'brick', c: CM.brick, ivy: true},
  {x0: 128, x1: 300, kind: 'trellis', c: CM.stucco},
  {x0: 300, x1: 352, kind: 'gate', c: CM.brickDeep, gate: CM.coatSlate},
  {x0: 352, x1: 566, kind: 'railing', c: CM.brickLight},
  {x0: 566, x1: 690, kind: 'brick', c: CM.brickDeep},
  {x0: 690, x1: 830, kind: 'brick', c: CM.brick, pot: true},
  {x0: 830, x1: 882, kind: 'gate', c: CM.brick, gate: CM.sage},
  {x0: 882, x1: 1110, kind: 'trellis', c: CM.brickLight},
  {x0: 1110, x1: 1250, kind: 'render', c: CM.limestone, ivy: true},
  {x0: 1250, x1: 1300, kind: 'gate', c: CM.brickLight, gate: CM.brickDeep},
  {x0: 1300, x1: X1, kind: 'railing', c: CM.brick},
];

function wallsInto(b: Batch) {
  const r = rng('s4walls');
  let ink = '';
  let ticks = '';
  for (const s of SEGS) {
    const w = s.x1 - s.x0;
    if (s.kind === 'gate') {
      // two piers with stone caps, a plank door between, its ring handle and hinges
      const pw = 14;
      for (const px of [s.x0, s.x1 - pw]) {
        b.rect(s.c, px, TOP - 12, pw, FOOT - TOP + 12);
        b.rect(CM.limestone, px - 3, TOP - 18, pw + 6, 7);
        b.fill(CM.limestone, domePath(px + pw / 2, TOP - 18, pw / 2 + 1, 6));
      }
      const gx0 = s.x0 + pw;
      const gx1 = s.x1 - pw;
      b.rect(s.gate as string, gx0, TOP - 4, gx1 - gx0, FOOT - TOP + 4);
      b.fill(s.gate as string, `M${P(gx0, TOP - 4)}Q${P((gx0 + gx1) / 2, TOP - 14)} ${P(gx1, TOP - 4)}Z`);
      for (let x = gx0 + 6; x < gx1 - 2; x += 6) b.rect(CM.shadeWarm, x, TOP, 1, FOOT - TOP - 4);
      b.rect(CM.anchor, gx0 + 2, TOP + 18, gx1 - gx0 - 4, 3);
      b.rect(CM.anchor, gx0 + 2, FOOT - 30, gx1 - gx0 - 4, 3);
      b.fill(CM.coatMustard, ovalPath(gx1 - 7, (TOP + FOOT) / 2, 3, 3));
      ink += line(s.x0, TOP - 12, s.x0, FOOT, {seed: `s4gp${s.x0}`, over: 'small'}) + line(s.x1, TOP - 12, s.x1, FOOT, {seed: `s4gq${s.x0}`, over: 'small'});
      continue;
    }
    b.rect(s.c, s.x0, TOP, w, FOOT - TOP);
    // coping stones on the wall
    b.rect(CM.limestone, s.x0 - 2, TOP - 7, w + 4, 8);
    b.rect(CM.stoneShade, s.x0 - 2, TOP + 1, w + 4, 3);
    if (s.kind === 'render') {
      b.rect(CM.stoneShade, s.x0, FOOT - 16, w, 16);
      for (let k = 0; k < 3; k++) b.rect(CM.stoneShade, s.x0 + r.range(10, w - 40), r.range(TOP + 20, FOOT - 40), r.range(14, 30), 2);
    } else {
      for (let k = 0; k < Math.round(w / 22); k++) ticks += `M${P(r.range(s.x0 + 4, s.x1 - 12), r.range(TOP + 10, FOOT - 8))}h${r.range(6, 11).toFixed(1)}`;
      for (let k = 0; k < Math.round(w / 40); k++) b.rect(s.c === CM.brickDeep ? CM.brick : CM.brickDeep, r.range(s.x0 + 4, s.x1 - 16), r.range(TOP + 12, FOOT - 10), r.range(8, 14), 3);
    }
    if (s.kind === 'railing') {
      // iron railings on the coping: bars with spear tops, a top rail
      const ry = TOP - 62;
      b.rect(CM.anchor, s.x0, ry + 6, w, 3);
      b.rect(CM.anchor, s.x0, TOP - 16, w, 2.4);
      for (let x = s.x0 + 6; x < s.x1 - 2; x += 11) {
        b.rect(CM.anchor, x - 1.1, ry + 2, 2.2, TOP - 8 - ry);
        b.poly(CM.anchor, [[x - 2.4, ry + 4], [x, ry - 3], [x + 2.4, ry + 4]]);
      }
    }
    if (s.kind === 'trellis') {
      // a trellis on the wall with a climbing rose (sage, a few blooms), gone autumn-gold here and there
      const ty = TOP - 66;
      let tr = '';
      for (let x = s.x0 + 8; x < s.x1 - 4; x += 16) tr += `M${P(x, TOP - 6)}L${P(x + 16, ty)}M${P(x + 16, TOP - 6)}L${P(x, ty)}`;
      tr += `M${P(s.x0 + 4, ty)}L${P(s.x1 - 4, ty)}`;
      b.ink(tr, 1.3, CM.line);
      b.fill(CM.sage, lobes(s.x0 + 6, s.x1 - 6, TOP - 4, 54, `s4tr${s.x0}`, Math.round(w / 34)));
      b.fill(CM.leafGold, lobes(s.x0 + w * 0.55, s.x1 - 10, TOP - 8, 34, `s4tr2${s.x0}`, 2));
      for (let k = 0; k < Math.round(w / 26); k++) b.fill(r.pick([CM.blossom, CM.box, CM.paper]), ovalPath(r.range(s.x0 + 10, s.x1 - 10), r.range(TOP - 50, TOP - 10), 3.6, 3.3));
    }
    if (s.ivy) {
      // ivy spilling over the coping and down the face
      for (let k = 0; k < Math.round(w / 30); k++) {
        const ix = r.range(s.x0 + 4, s.x1 - 20);
        const drop = r.range(26, 90);
        b.fill(k % 3 === 2 ? CM.leafGold : CM.sage, lobes(ix - 12, ix + 22, TOP + drop * 0.35, drop * 0.55, `s4ivyw${s.x0}${k}`, 2));
        b.fill(CM.sage, lobes(ix - 6, ix + 14, TOP + drop, drop * 0.5, `s4ivyx${s.x0}${k}`, 2));
      }
    }
    if (s.pot) {
      // a geranium pot on the coping and a wall lamp (off) on the face
      const px = s.x0 + w * 0.3;
      b.poly(CM.brickDeep, [[px - 9, TOP - 22], [px + 9, TOP - 22], [px + 7, TOP - 7], [px - 7, TOP - 7]]);
      b.fill(CM.sage, lobes(px - 13, px + 13, TOP - 21, 18, 's4wpot', 3));
      for (const [dx, dy] of [[-6, -32], [3, -36], [8, -28]]) b.fill(CM.box, ovalPath(px + dx, TOP + dy, 3.2, 3));
      const lx = s.x1 - 18;
      b.rect(CM.anchor, lx - 2, TOP + 26, 4, 10);
      b.poly(CM.glass, [[lx - 7, TOP + 30], [lx + 7, TOP + 30], [lx + 5, TOP + 44], [lx - 5, TOP + 44]]);
      b.poly(CM.anchor, [[lx - 9, TOP + 30], [lx, TOP + 23], [lx + 9, TOP + 30]]);
    }
    ink += line(s.x0 - 2, TOP - 7, s.x1 + 2, TOP - 7, {seed: `s4wc${s.x0}`, over: 'small'});
  }
  b.ink(ticks, 1.1, CM.brickDeep);
  b.ink(ink, INK_PX.far, CM.ink, 0.25);
}

// ---------------------------------------------------------------- paving + coping

function pavingInto(b: Batch) {
  const r = rng('s4pave');
  b.rect(CM.paving, X0, FOOT, X1 - X0, COP - FOOT + 1);
  // the walls' short shadow along their foot, moss in the angle
  b.rect(CM.stoneShade, X0, FOOT, X1 - X0, 7);
  for (let x = X0 + r.range(0, 40); x < X1; x += r.range(40, 110)) b.fill(CM.sage, lobes(x, x + r.range(10, 24), FOOT + 3, r.range(5, 9), `s4moss${x.toFixed(0)}`, 2));
  // repaired patches and odd slabs
  for (let k = 0; k < 16; k++) {
    const x = r.range(X0, X1 - 80);
    const y = r.range(FOOT + 10, COP - 22);
    const w = r.range(30, 76);
    const h = lerp(10, 18, (y - FOOT) / (COP - FOOT));
    b.poly(r.pick([CM.limestone, CM.stucco, CM.limestone, CM.stoneShade]), [[x, y], [x + w, y + r.jitter(1)], [x + w + 3, y + h], [x + 2, y + h]]);
  }
  // joints: rows widening toward us, broken runs + cross ticks, never a grid
  let d = '';
  const rows = [FOOT + 16, FOOT + 34, FOOT + 54, COP - 3];
  rows.forEach((yy, i) => {
    let x = X0 + r.range(0, 50);
    while (x < X1) {
      const L = r.range(50, 140);
      if (r.chance(0.7)) d += `M${P(x, yy + r.jitter(0.8))}L${P(x + L, yy + r.jitter(1))}`;
      const prev = i === 0 ? FOOT + 4 : rows[i - 1];
      if (r.chance(0.55)) d += `M${P(x + L * 0.5, prev + 2)}L${P(x + L * 0.5 + r.jitter(2) - (i * 1.5), yy - 1)}`;
      x += L + r.range(16, 60);
    }
  });
  b.ink(d, 1.2, CM.line);
  // drain grate and a manhole cover
  b.poly(CM.stoneShade, [[456, 1050], [496, 1050], [494, 1060], [458, 1060]]);
  let gr = '';
  for (let k = 1; k < 7; k++) gr += `M${P(456 + k * 5.7, 1051)}L${P(457 + k * 5.6, 1059)}`;
  b.ink(gr, 1, CM.shadeCool);
  b.poly(CM.stoneShade, [[920, 1026], [978, 1026], [982, 1044], [916, 1044]]);
  b.poly(CM.limestone, [[925, 1029], [973, 1029], [976, 1041], [922, 1041]]);
  let mh = '';
  for (let k = 0; k < 6; k++) mh += `M${P(927 + k * 8.5, 1030)}L${P(925 + k * 8.5, 1040)}`;
  b.ink(mh, 0.9, CM.shadeCool);
}

function leavesInto(b: Batch) {
  const r = rng('s4pleaves');
  for (let i = 0; i < 46; i++) {
    const y = r.range(FOOT + 6, COP - 4);
    const s = lerp(7, 12, (y - FOOT) / (COP - FOOT));
    b.fill(r.pick([CM.leafGold, CM.leafRust, CM.coatMustard, CM.leafGold]), leafPath(r.range(X0, X1), y, s, s * 0.36, r.range(-40, 40)));
  }
}

function copingInto(b: Batch) {
  const r = rng('s4cop');
  b.rect(CM.limestone, X0, COP, X1 - X0, EDGE - COP);
  b.rect(CM.stoneShade, X0, EDGE - 4, X1 - X0, 4);
  let j = '';
  for (let x = X0 + r.range(20, 60); x < X1; x += r.range(60, 110)) j += `M${P(x, COP + 1)}L${P(x + r.jitter(1), EDGE - 3)}`;
  b.ink(j, 1, CM.shadeCool);
  b.ink(line(X0, COP, X1, COP + r.jitter(1), {seed: 's4coplip', over: 'small'}), INK_PX.far, CM.ink, 0.2);
  // mooring rings on the coping face, cast-iron bollards on top
  let rings = '';
  for (const x of [262, 520, 868, 1236]) rings += circleInk(x, COP + 6, 4.6, {seed: `s4ring${x}`});
  b.ink(rings, 1.5, CM.anchor);
  for (const x of [150, 792, 1122]) {
    b.poly(CM.stoneShade, [[x - 9, COP + 1], [x + 9, COP], [x + 9 + SHADOW.len * 0.7, COP + 5], [x - 4 + SHADOW.len * 0.6, COP + 7]]);
    bollardInto(b, x, COP + 2, 26, `s4bol${x}`);
  }
}

// ---------------------------------------------------------------- furniture

const LAMPS = [{x: 40, h: 290}, {x: 905, h: 290}, {x: 1392, h: 290}];

function furnitureInto(b: Batch) {
  const sh = (x: number, y: number, w: number, len = SHADOW.len) => b.poly(CM.stoneShade, [[x - w / 2, y - 1], [x + w / 2, y - 2], [x + w / 2 + len, y + 4], [x - w / 2 + len * 0.85, y + 6]]);
  for (const l of LAMPS) sh(l.x, 1062, 16, 30);
  // planters of grasses at the wall foot (one under the plates, one by the far gate)
  sh(190, 1006, 90);
  sh(1340, 1006, 110);
  // the litter bin (short: it never reaches the plates)
  sh(482, 1012, 26);
  // the lifebuoy post near the coping
  sh(1012, 1068, 10, 22);
  b.layer();
  planterInto(b, 146, 236, 1006, 40, 's4pl1');
  planterInto(b, 1286, 1396, 1006, 40, 's4pl2');
  binInto(b, 482, 1012, 48, 's4bin');
  // a bike leaning on the rendered wall, another locked to the railings by the far gate
  bikeInto(b, 1186, 1004, 22, 's4bk1', CM.coatMustard, -1);
  bikeInto(b, 1440, 1000, 21, 's4bk2', CM.brick, 1);
  // the lifebuoy: a short post with a ring (peach and paper quarters, never the sun's orange)
  const lx = 1012;
  b.rect(CM.line, lx - 3, 1000, 6, 68);
  b.rect(CM.line, lx - 10, 1000, 20, 4);
  const cy = 1030;
  for (let q = 0; q < 4; q++) {
    const a0 = (q * Math.PI) / 2;
    const a1 = a0 + Math.PI / 2;
    const R = 17;
    const ri = 9;
    b.fill(q % 2 ? CM.paper : CM.box, `M${P(lx + Math.cos(a0) * R, cy + Math.sin(a0) * R)}A${R} ${R} 0 0 1 ${P(lx + Math.cos(a1) * R, cy + Math.sin(a1) * R)}L${P(lx + Math.cos(a1) * ri, cy + Math.sin(a1) * ri)}A${ri} ${ri} 0 0 0 ${P(lx + Math.cos(a0) * ri, cy + Math.sin(a0) * ri)}Z`);
  }
  b.ink(circleInk(lx, cy, 17, {seed: 's4buoy'}), 1.4, CM.ink);
}

/** Leaves skittering east along the paving in the wind (life on the ground), and a few falling from the gardens. */
function blowingInto(b: Batch, t: number) {
  const r = rng('s4blow');
  for (let i = 0; i < 6; i++) {
    const per = r.range(3.2, 5.0);
    const u = frac(t / per + r.next());
    const y = r.range(FOOT + 12, COP - 6);
    const x = lerp(r.range(X0, X1 - 300), r.range(X0, X1 - 300) + 260, u);
    const hop = Math.abs(Math.sin(u * 14 + i)) * 4;
    b.fill(i % 2 ? CM.leafRust : CM.leafGold, leafPath(x + 300 * WIND * u * 0.2, y - hop, 9, 3.4 * Math.abs(Math.cos(t * 6 + i)) + 0.8, t * 160 + i * 40));
  }
  for (let i = 0; i < 7; i++) {
    const per = r.range(3.6, 5.6);
    const u = frac(t / per + r.next());
    const sx = r.pick([920, 960, 1010, 1240, 1280, 760, 1180]);
    const x = sx + WIND * u * 70 + Math.sin(u * 8 + i) * 12;
    const y = lerp(TOP - 70, COP - 6, u);
    b.fill(i % 2 ? CM.leafGold : CM.coatMustard, leafPath(x, y, 9, 3.2 * Math.abs(Math.cos(t * 5 + i)) + 0.8, t * 120 + i * 50));
  }
}

// ---------------------------------------------------------------- the plane

export const PathPlane: React.FC = () => {
  const t = useTime();
  const stat = useMemo(() => {
    const b = new Batch();
    wallsInto(b);
    b.layer();
    pavingInto(b);
    b.layer();
    leavesInto(b);
    copingInto(b);
    b.layer();
    furnitureInto(b);
    return b;
  }, []);
  const dyn = new Batch();
  benchReaderInto(dyn, t);
  dyn.layer();
  anglerInto(dyn, t);
  dyn.layer();
  blowingInto(dyn, t);
  return (
    <>
      <Paint b={stat} seed="s4pathSt" />
      {LAMPS.map((l) => (
        <Lamp key={l.x} x={l.x} y={1064} h={l.h} seed={`s4lamp${l.x}`} />
      ))}
      <Paint b={dyn} seed="s4pathDyn" />
      <Heron x={236} y={COP + 4} h={96} face={1} turnAt={16.3} seed="s4heron" />
    </>
  );
};
