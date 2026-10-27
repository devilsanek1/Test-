// canal/steps.tsx: S1's bottom third (TREATMENT §5, map BOTTOM_THIRD.V2S1): our broad canal-side stone steps facing
// the wing, rising toward the lens, with ~14 people sitting on them, backs to us, in three rows (near head-backs cut by
// the bottom 250-330 px, a middle row ~110 px heads, a low row by the water ~60 px heads), their cups, tote bags, a
// backpack, a book, a dog lying down, and a bike leaning, cut by the bottom-right. Pip's waterline bollard stands on
// the landing at the map's S1_BOLLARD. People are PersonSlots (K4 renders them; placeholders without a provider).

import React, {useMemo} from 'react';
import {CM, INK_PX} from '../../palette';
import {line} from '../../../lib/sketch';
import {Batch, Paint, P, rng, lerp, leafPath, Pt, ovalPath} from './core';
import {bollardInto, bikeInto} from './towpath';
import {copingInto} from './water';
import {CastSlot, PersonSlot} from './slots';
import {Puffs} from './life';
import * as MAP from '../../world/map';
import {tiered} from '../tiers';

/** Nosing lines (screen y) of the S1 steps, far to near; the landing runs from the coping to the first. */
export const S1_STEPS = {
  coping: [1215, 1234] as [number, number],
  landing: [1234, 1302] as [number, number],
  nosings: [1302, 1392, 1508, 1660, 1850],
  vp: [540, 965] as Pt,
};

/** The seated public (14 backs) + the dog: slots in screen px. seat y = the tread they sit on. */
export const S1_SEATED: PersonSlot[] = [
  // low row by the water (heads ~60 px: seated height ~165), clear of Pip's bollard (x 620-780)
  {id: 'low1', x: 92, y: 1352, h: 160, pose: 'sit', seed: 'lowA', acc: 'beanie'},
  {id: 'low2', x: 214, y: 1356, h: 168, pose: 'sit', seed: 'lowB', acc: 'curls'},
  {id: 'low3', x: 352, y: 1350, h: 158, pose: 'read', seed: 'lowC', acc: 'cap'},
  {id: 'low4', x: 470, y: 1354, h: 164, pose: 'sit', seed: 'lowD', acc: 'scarf'},
  {id: 'low5', x: 540, y: 1352, h: 156, pose: 'sit', seed: 'lowE', acc: 'bun'},
  {id: 'low6', x: 860, y: 1356, h: 166, pose: 'sit', seed: 'lowF', acc: 'hood'},
  // middle row (heads ~110 px: seated height ~300)
  {id: 'mid1', x: 120, y: 1612, h: 300, pose: 'sit', seed: 'midA', acc: 'tote'},
  {id: 'mid2', x: 340, y: 1618, h: 310, pose: 'sit', seed: 'midB', acc: 'phone'},
  {id: 'mid3', x: 572, y: 1606, h: 296, pose: 'read', seed: 'midC', acc: 'beanie'},
  {id: 'mid4', x: 808, y: 1614, h: 304, pose: 'sit', seed: 'midD', acc: 'scarf'},
  {id: 'mid5', x: 1010, y: 1610, h: 300, pose: 'sit', seed: 'midE', acc: 'curls'},
  // near row: head-backs cut by the bottom (250-330 px heads)
  {id: 'near1', x: 150, y: 1920, h: 300, pose: 'bust', seed: 'nearA', acc: 'hood'},
  {id: 'near2', x: 540, y: 1920, h: 262, pose: 'bust', seed: 'nearB', acc: 'bun'},
  {id: 'near3', x: 905, y: 1920, h: 316, pose: 'bust', seed: 'nearC', acc: 'beanie'},
];
/** The dog lying down on the third step (a slot too, pose 'dog'), and one that trots down the steps at f168 (2.80). */
export const S1_DOG: PersonSlot = {id: 'dogLie', x: 690, y: 1560, h: 46, pose: 'dog', seed: 'dogLie', dir: -1};

export type StepsProps = {
  /** Draw the seated people (default true). */
  people?: boolean;
  /** Head turns / a cup lifting: [slot id, t] (passed to the slot as actAt). */
  acts?: [string, number][];
  seed?: string;
};

/** The S1 steps: coping, landing, five treads with nosings and joints converging on the far bank, the bollard, the
 *  props, and the seated public. */
const StepsBody: React.FC<StepsProps> = ({people = true, acts = [], seed = 'steps'}) => {
  const S = S1_STEPS;
  const stone = useMemo(() => {
    const b = new Batch();
    const r = rng(seed);
    copingInto(b, -40, 1120, S.coping[0], S.coping[1] - S.coping[0], `${seed}/cop`, INK_PX.mid);
    b.layer();
    b.rect(CM.paving, -40, S.landing[0], 1160, S.landing[1] - S.landing[0]);
    const treads = [CM.limestone, CM.stucco, CM.limestone, CM.paving, CM.limestone];
    S.nosings.forEach((y, i) => {
      const y1 = S.nosings[i + 1] ?? 1940;
      b.rect(treads[i], -40, y, 1160, y1 - y);
    });
    b.layer();
    // the nosing lips and the shade strip on the tread beyond each nosing (the drop)
    let joints = '';
    let edges = '';
    [S.landing[0], ...S.nosings].forEach((y, i) => {
      const k = i / S.nosings.length;
      const lip = lerp(5, 16, k);
      if (i > 0) {
        b.rect(CM.stoneShade, -40, y - lip * 0.9, 1160, lip * 0.9);
        b.rect(CM.paper, -40, y, 1160, lip * 0.45);
        edges += line(-30, y, 1110, y + r.jitter(2), {seed: `${seed}/n${i}`, over: 'structural'});
      }
      // slab joints on this tread, converging on the VP (one-point, the lens looks level at the far bank)
      const ya = i === 0 ? S.landing[0] : S.nosings[i - 1];
      const yb = i === 0 ? S.nosings[0] : S.nosings[i] ?? 1920;
      const span = 1400 * (1 + k * 0.9);
      for (let x = -span / 2 + r.range(0, 80); x < 1080 + span / 2; x += r.range(150, 260) * (1 + k)) {
        const pa = [lerp(S.vp[0], x, (ya - S.vp[1]) / (1920 - S.vp[1])), ya] as Pt;
        const pb = [lerp(S.vp[0], x, (yb - S.vp[1]) / (1920 - S.vp[1])), yb - lip] as Pt;
        if (r.chance(0.8)) joints += `M${P(pa[0], pa[1] + 4)}L${P(pb[0], pb[1])}`;
      }
      // a few cracks and dropped leaves
      for (let j = 0; j < 3; j++) {
        const lx = r.range(0, 1080);
        const ly = r.range(ya + 8, yb - 8);
        b.fill(r.pick([CM.leafGold, CM.leafRust, CM.coatMustard]), leafPath(lx, ly, lerp(9, 22, k), lerp(3, 7, k), r.range(-40, 40)));
      }
    });
    b.ink(joints, INK_PX.hair, CM.line);
    b.ink(edges, INK_PX.mid);
    b.layer();
    // the waterline bollard (Pip's seat on its top)
    const seat = MAP.S1_BOLLARD;
    bollardInto(b, seat.x, seat.y + 44, 46, `${seed}/bollard`);
    // a mooring ring set in the coping
    b.ink(`M${P(300, 1226)}A9 6 0 1 0 ${P(318, 1226)}A9 6 0 1 0 ${P(300, 1226)}`, INK_PX.far, CM.ink, 0, {thing: true});
    b.layer();
    // props on the treads: cups, a tote, a backpack, a book, a bike leaning (cut by the bottom-right)
    const cup = (x: number, y: number, s: number, col = CM.paper) => {
      b.fill(col, `M${P(x - s * 0.36, y - s)}L${P(x + s * 0.36, y - s)}L${P(x + s * 0.28, y)}L${P(x - s * 0.28, y)}Z`);
      b.rect(CM.line, x - s * 0.37, y - s * 0.62, s * 0.74, s * 0.22);
      b.rect(CM.anchor, x - s * 0.38, y - s * 1.08, s * 0.76, s * 0.12);
    };
    cup(150, 1356, 18);
    cup(290, 1360, 18, CM.coatOat);
    cup(905, 1360, 18);
    cup(210, 1616, 34);
    cup(448, 1622, 34, CM.coatOat);
    cup(900, 1618, 34);
    // a tote bag and a backpack
    b.fill(CM.coatOat, `M${P(395, 1360)}L${P(430, 1360)}L${P(433, 1324)}L${P(392, 1324)}Z`);
    b.ink(`M${P(400, 1326)}Q${P(412, 1306)} ${P(424, 1326)}`, INK_PX.far, CM.line, 0, {thing: true});
    b.fill(CM.coatSlate, `M${P(660, 1622)}L${P(724, 1622)}L${P(728, 1560)}Q${P(694, 1532)} ${P(658, 1560)}Z`);
    b.rect(CM.coatMustard, 670, 1582, 46, 8);
    // a book lying open
    b.poly(CM.paper, [[248, 1640], [300, 1630], [306, 1648], [252, 1656]]);
    b.poly(CM.box, [[244, 1642], [250, 1658], [256, 1656]]);
    // more life left on the treads: a striped picnic blanket, a folded coat, a skateboard, a guitar case, a bottle,
    // a dog bowl, a newspaper (no legible print)
    const blanket = (x: number, y: number, w: number, h: number) => {
      b.poly(CM.paper, [[x, y], [x + w, y - 4], [x + w + 10, y + h], [x - 8, y + h + 4]]);
      for (let k = 0; k < 5; k++) b.poly(k % 2 ? CM.box : CM.sage, [[x + (w * k) / 5, y - (4 * k) / 5], [x + (w * (k + 0.5)) / 5, y - (4 * (k + 0.5)) / 5], [x + ((w + 18) * (k + 0.5)) / 5 - 8, y + h + 4], [x + ((w + 18) * k) / 5 - 8, y + h + 4]]);
    };
    blanket(560, 1420, 150, 40);
    b.poly(CM.coatPlum, [[260, 1468], [330, 1460], [338, 1486], [262, 1492]]);
    b.poly(CM.coatMustard, [[770, 1652], [890, 1648], [886, 1664], [772, 1668]]);
    b.fill(CM.anchor, ovalPath(786, 1672, 8, 8));
    b.fill(CM.anchor, ovalPath(872, 1670, 8, 8));
    b.poly(CM.anchor, [[1010, 1450], [1070, 1300], [1094, 1306], [1036, 1458]]);
    b.rect(CM.sage, 470, 1452, 14, 40);
    b.rect(CM.paper, 472, 1446, 10, 8);
    b.fill(CM.brickDeep, ovalPath(720, 1600, 22, 8));
    b.poly(CM.paper, [[60, 1700], [150, 1690], [156, 1720], [64, 1730]]);
    b.ink(`M${P(70, 1704)}L${P(140, 1696)}M${P(72, 1712)}L${P(128, 1706)}`, INK_PX.hair, CM.paneUnlit);
    // the bike leaning, cut by the bottom-right edge
    bikeInto(b, 1040, 1890, 120, `${seed}/bike`, CM.brickDeep, -1);
    return b;
  }, [seed]);
  const actMap = new Map(acts);
  return (
    <>
      <Paint b={stone} seed={`steps/${seed}`} />
      <Puffs x={905} y={1340} seed={`${seed}/cupsteam`} kind="steam" scale={0.32} drift={-10} />
      <Puffs x={210} y={1580} seed={`${seed}/cupsteam2`} kind="steam" scale={0.45} drift={-12} />
      {people ? (
        <>
          <CastSlot s={{...S1_DOG, gait: undefined}} />
          {S1_SEATED.map((s) => (
            <CastSlot key={s.id} s={{...s, actAt: actMap.get(s.id)}} />
          ))}
        </>
      ) : null}
    </>
  );
};
export const Steps = tiered('environment', {}, StepsBody);
