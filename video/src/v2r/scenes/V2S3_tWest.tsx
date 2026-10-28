// V2S3_tWest.tsx (lane L3, V2S3 FAR helper): the WEST GAP beyond her end-of-terrace house (x < 165), WORLD px at the
// 12.98 match, in three depth planes (V2S3_depth; CRAFT §f, THROUGHLINE §5b), back to front:
//   S3FarCity   +2  the far city on the sunset band: a plain gasholder drum left of the sun, the far rows the low sun sets
//                   behind, ONE level roof edge across the disc (y 676: no notch or tooth; CRAFT §f "Failures"), their
//                   windows tone-on-tone; warm peach materials one flat step toward S3_AIR (planePalette: four values)
//   S3Roofs     +1  the roofs and chimneys in front of it: three gable-fronted houses (slate roofs, lavender stone
//                   walls, a slate-rendered ground floor, a rendered stack with pots), all below the disc and its stack
//                   clear of it; tone-on-tone windows; values that part from her brick end wall and her door case
//                   (CRAFT §f.3)
//   S3WestNear   0  at the terrace's depth: an autumn tree (flat clumps, the side away from the sun in shade) and the
//                   garden wall with its gate and ivy
// The sun itself is S3Sun (V2S3_terrace), drawn first in the sky plane. Every part is flat colour (no hand marks: no
// ticks, dabs or leaf specks; CRAFT §c); the clean pen's environment tier draws no lines here. Nothing moves.
import React, {useMemo} from 'react';
import {CM} from '../palette';
import {crown} from '../../lib/sketch';
import {planePalette, toneOnTone} from '../../lib/depth';
import {Paint} from '../kit/canal/core';
import {Batch, lobes, P, rng} from './V2S3_tParts';
import {S3_ATM} from './V2S3_depth';

export const SUN3 = {x: 96, y: 652, r: 46} as const;
/** The overscan's left edge and her end wall. */
const XL = -80;
const XE = 165;
/** The garden wall past her end wall (westNearBatch: brick under a stone coping, top y 1004, foot on her towpath's back
 *  line 1100): exported for the canal's reflections (V2S3_water). */
export const S3_GARDEN = {x0: XL, x1: XE, top: 1004, foot: 1100} as const;
/** The far city's level roof edge across the disc. */
const FAR_TOP = 676;

// ---------------------------------------------------------------- +2 the far city on the sunset band

/** The far city's palette: warm materials one flat step toward the air, merged to the plane's four close values. */
const FAR = planePalette([CM.brickLight, CM.box, CM.bandSunset, CM.blossom], 2, S3_ATM);

function farCityBatch(): Batch {
  const b = new Batch();
  // a gasholder drum, cut by the left edge, 22 px clear of the disc: a plain far silhouette (its frame is too fine to
  // read on +2)
  const drum = {x0: XL, x1: 28, top: 646};
  b.rect(FAR[CM.brickLight], drum.x0, drum.top, drum.x1 - drum.x0, 800 - drum.top);
  // the far rows: one level roof edge under the sun, from the drum to behind her end wall
  b.rect(FAR[CM.bandSunset], drum.x1 - 8, FAR_TOP, XE + 20 - (drum.x1 - 8), 800 - FAR_TOP);
  b.layer();
  // the far rows' windows: tone-on-tone (CRAFT §f.2: never a dark speck or the lamp colour on +2)
  const win = toneOnTone(FAR[CM.bandSunset], {dE: 3});
  for (let y = FAR_TOP + 10; y < 790; y += 18) for (let x = drum.x1 + 4; x < XE + 14; x += 16) b.rect(win, x, y, 6, 8);
  return b;
}

// ---------------------------------------------------------------- +1 the roofs and chimneys

/** The roofs' palette: slate roofs, lavender stone walls, rendered stacks, brick pots, one flat step toward the air. */
const ROOF = planePalette([CM.shadeCool, CM.stoneShade, CM.limestone, CM.brickLight], 1, S3_ATM);

/** Three gable-fronted houses (x0, x1, eaves y, apex y): every gable below the disc (its lowest point at x is 652 +
 *  sqrt(46^2 - (x - 96)^2)), the far city's level edge the only line across it; the last one stops short of her end
 *  wall (x 165), so its slate verge never sits right behind her brick (CRAFT §f.3). */
const GABLES: [number, number, number, number][] = [
  [XL, 6, 712, 690],
  [6, 86, 714, 694],
  [86, 163, 716, 700],
];

function roofsBatch(): Batch {
  const b = new Batch();
  for (const [x0, x1, eaves, apex] of GABLES) {
    const mx = (x0 + x1) / 2;
    // the gable: a slate roof band along the verges, the stone face below it
    b.poly(ROOF[CM.shadeCool], [[x0 - 2, eaves + 2], [mx, apex], [x1 + 2, eaves + 2], [x1 + 2, eaves + 8], [mx, apex + 7], [x0 - 2, eaves + 8]]);
    b.poly(ROOF[CM.stoneShade], [[x0, eaves + 8], [mx, apex + 7], [x1, eaves + 8], [x1, 1010], [x0, 1010]]);
  }
  b.layer();
  // their ground floors: a darker shopfront band (slate render) from y 896, mostly behind the tree and the garden wall;
  // where it shows, beside her end wall, it parts her pale door case from the pale stone above it (CRAFT §f.3)
  for (const [x0, x1] of GABLES) b.rect(ROOF[CM.shadeCool], x0, 896, x1 - x0, 1010 - 896);
  b.layer();
  // a rendered stack with brick pots by her end wall, clear of the disc (x > 146)
  for (const [x, top, w] of [[146, 690, 12]] as [number, number, number][]) {
    b.rect(ROOF[CM.limestone], x, top, w, 724 - top);
    for (let k = 0; k < Math.max(1, Math.round(w / 8)); k++) b.rect(ROOF[CM.brickLight], x + 2 + k * 7, top - 6, 5, 6);
  }
  // windows: tone-on-tone on the stone (two storeys)
  const win = toneOnTone(ROOF[CM.stoneShade], {dE: 5});
  for (const [x0, x1, eaves] of GABLES) {
    for (const y of [eaves + 26, eaves + 92]) for (let x = Math.max(x0, -20) + 12; x < Math.min(x1, XE) - 16; x += 30) b.rect(win, x, y, 14, 30);
  }
  return b;
}

// ---------------------------------------------------------------- 0: the tree and the garden wall (the terrace's depth)

const TREE = {x: 36, base: 1004, cx: 30, cy: 872, rx: 106, ry: 92} as const;

function westNearBatch(): Batch {
  const b = new Batch();
  const r = rng('s3wall');
  // the tree: trunk and limbs as flat shapes, a scalloped crown, autumn clumps (gold and mustard on the sun side, rust
  // on the side away from it)
  b.poly(CM.line, [[TREE.x - 10, TREE.base], [TREE.x - 6, 930], [TREE.x - 16, 900], [TREE.x - 8, 898], [TREE.x + 1, 918], [TREE.x + 9, 896], [TREE.x + 16, 900], [TREE.x + 6, 930], [TREE.x + 11, TREE.base]]);
  b.layer();
  b.fill(CM.sage, crown(TREE.cx, TREE.cy, TREE.rx, TREE.ry, {seed: 's3tree', bumps: 14, round: 0.6}));
  b.layer();
  const clumps: [number, number, number, number, string][] = [
    [TREE.cx - 48, TREE.cy - 30, 46, 36, CM.leafGold],
    [TREE.cx - 4, TREE.cy - 62, 46, 26, CM.coatMustard],
    [TREE.cx + 54, TREE.cy + 12, 40, 36, CM.leafRust],
    [TREE.cx + 18, TREE.cy + 52, 40, 26, CM.leafRust],
    [TREE.cx - 66, TREE.cy + 26, 30, 26, CM.leafGold],
    [TREE.cx + 30, TREE.cy - 22, 26, 20, CM.leafGold],
  ];
  clumps.forEach(([cx, cy, rx, ry, col], i) => b.fill(col, crown(cx, cy, rx, ry, {seed: `s3clump${i}`, bumps: 8, round: 0.6})));
  b.layer();
  // the garden wall: brick under a stone coping, a timber gate (its boards as two flat tones), ivy over the coping as
  // three lobed masses
  const g0 = S3_GARDEN.top;
  b.rect(CM.brickLight, XL, g0 + 6, XE - XL, 1100 - g0 - 6);
  b.rect(CM.limestone, XL, g0, XE - XL + 2, 8);
  b.layer();
  b.rect(CM.leafRust, 44, g0 + 10, 46, 90);
  b.rect(CM.brick, 66, g0 + 12, 22, 86);
  b.layer();
  for (const [c0, c1, drop] of [[XL + 6, 30, 30], [96, 160, 24]] as const) {
    b.fill(CM.sage, lobes(c0, c1, g0 + 4, drop * 0.7, `s3ivy${c0}`, 4));
    b.fill(CM.sage, `M${P(c0 + 8, g0 + 4)}L${P(c1 - 8, g0 + 4)}L${P(c1 - 14, g0 + 4 + drop * (0.6 + 0.3 * r.next()))}L${P(c0 + 14, g0 + 4 + drop * (0.5 + 0.3 * r.next()))}Z`);
  }
  return b;
}

// ---------------------------------------------------------------- the components

/** +2: the far city on the sunset band (in the farCity plane). */
export const S3FarCity: React.FC = () => {
  const b = useMemo(farCityBatch, []);
  return <Paint b={b} seed="s3w/far" misreg={false} />;
};

/** +1: the roofs and chimneys in front of it (in the roofs plane). */
export const S3Roofs: React.FC = () => {
  const b = useMemo(roofsBatch, []);
  return <Paint b={b} seed="s3w/roofs" misreg={false} />;
};

/** 0: the tree and the garden wall past her end wall (in the terrace plane, behind her house). */
export const S3WestNear: React.FC = () => {
  const b = useMemo(westNearBatch, []);
  return <Paint b={b} seed="s3w/near" misreg={false} />;
};

/** The tree's crown (for its form shade on the side away from the sun: V2S3 light). */
export const S3_TREE = TREE;
