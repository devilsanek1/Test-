// V2S1 helper (lane L1): the seated public on our canal-side steps (TREATMENT section 5 "the bottom third"). Small and
// simple like reference 1: backs only, round heads, one accessory each, no two neighbours alike, never teal. Four rows
// on K6's treads (S1_STEPS: landing 1234-1302, nosings 1302 / 1392 / 1508 / 1660 / 1850), far to near, plus the near
// head-backs cut by the bottom, at most ~140 px wide (the owner's people rule, 2026-10-27). Life, every few frames:
// cups lift, heads turn, a phone comes up, a page turns, a dog trots down the steps (2.80), a bag is set down.
import React from 'react';
import {useTime, clamp, ease} from '../../lib/time';
import {CM} from '../palette';
import {Seated, NearBack, FigureG, Parts, castRow, pin} from '../kit/cast';
import type {Part, TraitOverrides, HairKind} from '../kit/cast';
import {polyline} from '../kit/cast/parts';

type Spot = {x: number; y: number; h: number; side?: 1 | -1; read?: boolean; phone?: [number, number]; cup?: [number, number][]; turns?: [number, number][]; beside?: 'cup' | 'tote' | 'book' | 'pack'; traits?: TraitOverrides};

/** Rows far (by the water) to near. Pip's bollard (700, 1235) keeps x 620-780 clear on the landing. */
const LOW: Spot[] = [
  {x: 60, y: 1300, h: 58, beside: 'tote', turns: [[2.36, -0.5]]},
  {x: 168, y: 1302, h: 62},
  {x: 262, y: 1299, h: 56, read: true, beside: 'cup'},
  {x: 400, y: 1301, h: 60, turns: [[0.85, 0.5], [3.9, 0]]},
  {x: 505, y: 1300, h: 57, beside: 'pack'},
  {x: 860, y: 1301, h: 61, beside: 'tote', turns: [[5.02, 0.5]]},
  {x: 985, y: 1300, h: 59, cup: [[1.9, 2.8]]},
];
const MID1: Spot[] = [
  {x: 110, y: 1452, h: 88, cup: [[0.62, 1.55], [3.32, 4.05]], side: 1},
  {x: 300, y: 1455, h: 84, beside: 'book', turns: [[1.18, 0.6], [2.9, 0]]},
  {x: 470, y: 1450, h: 90, phone: [2.2, 4.4]},
  {x: 640, y: 1454, h: 86, beside: 'cup', turns: [[4.32, -0.55]]},
  {x: 900, y: 1452, h: 88, read: true},
];
const MID2: Spot[] = [
  {x: 190, y: 1610, h: 118, beside: 'tote', turns: [[3.6, 0.5]]},
  {x: 420, y: 1612, h: 114, cup: [[1.3, 2.1], [4.6, 5.4]]},
  {x: 800, y: 1608, h: 120, beside: 'pack', turns: [[2.05, -0.45], [5.1, 0]]},
];
/** Near head-backs cut by the bottom (hv = head top to the cut; heads ~110-135 px wide). */
const NEAR: {x: number; hv: number; turns?: [number, number][]; traits: TraitOverrides}[] = [
  {x: 70, hv: 176, traits: {hair: 'hood'}},
  {x: 250, hv: 160, traits: {hair: 'beanie'}, turns: [[3.02, 0.45], [4.7, 0]]},
  {x: 430, hv: 184, traits: {hair: 'lowBun', scarf: CM.coatMustard} as TraitOverrides},
  {x: 610, hv: 166, traits: {hair: 'curls'}, turns: [[1.6, -0.35]]},
  {x: 800, hv: 178, traits: {hair: 'cap'}},
  {x: 985, hv: 170, traits: {hair: 'short'}, turns: [[0.4, 0.4], [2.6, -0.2]]},
];

function keyed(t: number, keys: [number, number][] | undefined, dur = 0.25): number {
  let v = 0;
  let from = 0;
  for (const [at, to] of keys ?? []) {
    if (t < at) break;
    v = from + (to - from) * ease.inOutCubic(clamp((t - at) / dur));
    from = to;
  }
  return v;
}
function cupAt(t: number, pairs: [number, number][] | undefined): number | undefined {
  if (!pairs) return undefined;
  let k = 0;
  for (const [up, down] of pairs) {
    if (t >= up && t < down) k = ease.inOutCubic(clamp((t - up) / 0.35));
    else if (t >= down && t < down + 0.35) k = 1 - ease.inOutCubic(clamp((t - down) / 0.35));
  }
  return k;
}

/** A small thing on the tread beside a seated back: takeaway cup, tote, book, backpack. */
function beside(kind: NonNullable<Spot['beside']>, x: number, y: number, h: number, seed: string): Part[] {
  const s = h / 100;
  if (kind === 'cup') {
    const w = 14 * s;
    const ch = 20 * s;
    const d = polyline([[x - w / 2, y - ch], [x + w / 2, y - ch], [x + w * 0.38, y], [x - w * 0.38, y]], true);
    return [
      {k: `${seed}c`, d, fill: CM.paper, ink: d, w: 0.7},
      {k: `${seed}s`, d: polyline([[x - w * 0.47, y - ch * 0.62], [x + w * 0.47, y - ch * 0.62], [x + w * 0.43, y - ch * 0.3], [x - w * 0.43, y - ch * 0.3]], true), fill: CM.brick, exact: true},
    ];
  }
  if (kind === 'book') {
    const d = polyline([[x - 18 * s, y - 4 * s], [x + 16 * s, y - 7 * s], [x + 20 * s, y], [x - 14 * s, y + 2 * s]], true);
    return [{k: `${seed}b`, d, fill: CM.coatPlum, ink: d, w: 0.6}];
  }
  if (kind === 'pack') {
    const d = polyline([[x - 16 * s, y], [x - 18 * s, y - 26 * s], [x - 8 * s, y - 34 * s], [x + 9 * s, y - 34 * s], [x + 18 * s, y - 25 * s], [x + 16 * s, y]], true);
    const flap = polyline([[x - 14 * s, y - 22 * s], [x + 14 * s, y - 22 * s]]);
    return [
      {k: `${seed}p`, d, fill: seed.length % 2 ? CM.coatSlate : CM.leafRust, ink: d, w: 0.8},
      {k: `${seed}f`, ink: flap, w: 0.6},
    ];
  }
  const w = 36 * s;
  const bh = 38 * s;
  const d = polyline([[x - w / 2, y - bh], [x + w / 2, y - bh], [x + w * 0.56, y], [x - w * 0.56, y]], true);
  const handle = `M${(x - w * 0.28).toFixed(1)} ${(y - bh).toFixed(1)}Q${x.toFixed(1)} ${(y - bh - 26 * s).toFixed(1)} ${(x + w * 0.28).toFixed(1)} ${(y - bh).toFixed(1)}`;
  return [
    {k: `${seed}t`, d, fill: seed.length % 2 ? CM.coatOat : CM.sage, ink: d, w: 0.8},
    {k: `${seed}h`, ink: handle, w: 0.8},
  ];
}

const Row: React.FC<{name: string; spots: Spot[]; ink: number}> = ({name, spots, ink}) => {
  const t = useTime();
  const traits = castRow(`v2s1/${name}`, spots.length, {over: spots.map((s) => s.traits ?? {})});
  return (
    <>
      {spots.map((s, i) => {
        const ph = s.phone ? t >= s.phone[0] && t < s.phone[1] : false;
        return (
          <React.Fragment key={i}>
            {s.beside ? (
              <FigureG x={0} y={0} seed={`v2s1/${name}/b${i}`}>
                <Parts parts={beside(s.beside, s.x + s.h * 0.62 * (s.side === -1 ? -1 : 1), s.y, s.h, `${name}${i}`)} inkPx={Math.max(1.6, ink * 0.8)} offset={[1.5, 1]} seed={`v2s1/${name}/b${i}`} />
              </FigureG>
            ) : null}
            <Seated x={s.x} y={s.y} h={s.h} seed={`v2s1/${name}/${i}`} traits={pin(traits[i])} turn={keyed(t, s.turns)} cup={cupAt(t, s.cup)} read={s.read} phone={ph} side={s.side} ink={ink} />
          </React.Fragment>
        );
      })}
    </>
  );
};

/** The dog that trots down our steps at 2.80 (f168), from the near right toward the landing. */
const TrotDog: React.FC = () => {
  const t = useTime();
  const k = clamp((t - 2.8) / 1.9);
  if (t < 2.8 || k >= 1) return null;
  const e = ease.inOutSine(k);
  const x = 1010 - 300 * e;
  const y = 1700 - 360 * e;
  const sz = 46 - 18 * e;
  const bob = Math.abs(Math.sin(t * 22)) * 3;
  const legA = Math.sin(t * 22) * sz * 0.18;
  const body = `M${x - sz * 0.55} ${y - sz * 0.5 - bob}Q${x} ${y - sz * 0.7 - bob} ${x + sz * 0.5} ${y - sz * 0.52 - bob}L${x + sz * 0.5} ${y - sz * 0.25 - bob}Q${x} ${y - sz * 0.18 - bob} ${x - sz * 0.55} ${y - sz * 0.25 - bob}Z`;
  const head = `M${x - sz * 0.5} ${y - sz * 0.5 - bob}L${x - sz * 0.82} ${y - sz * 0.62 - bob}L${x - sz * 0.9} ${y - sz * 0.42 - bob}L${x - sz * 0.6} ${y - sz * 0.3 - bob}Z`;
  const ear = `M${x - sz * 0.62} ${y - sz * 0.6 - bob}L${x - sz * 0.58} ${y - sz * 0.8 - bob}L${x - sz * 0.5} ${y - sz * 0.58 - bob}Z`;
  const legs = `M${x - sz * 0.38} ${y - sz * 0.25 - bob}L${x - sz * 0.38 + legA} ${y}M${x - sz * 0.22} ${y - sz * 0.25 - bob}L${x - sz * 0.22 - legA} ${y}M${x + sz * 0.3} ${y - sz * 0.25 - bob}L${x + sz * 0.3 - legA} ${y}M${x + sz * 0.42} ${y - sz * 0.25 - bob}L${x + sz * 0.42 + legA} ${y}`;
  const tail = `M${x + sz * 0.5} ${y - sz * 0.48 - bob}Q${x + sz * 0.75} ${y - sz * 0.75 - bob} ${x + sz * 0.7 + legA * 0.5} ${y - sz * 0.9 - bob}`;
  const parts: Part[] = [
    {k: 'dl', ink: legs, w: 1},
    {k: 'db', d: body, fill: CM.leafGold, ink: body, w: 0.8},
    {k: 'dh', d: head, fill: CM.leafGold, ink: head, w: 0.8},
    {k: 'de', d: ear, fill: CM.leafRust, exact: true},
    {k: 'dt', ink: tail, w: 0.8},
  ];
  return (
    <FigureG x={0} y={0} seed="v2s1/dog">
      <Parts parts={parts} inkPx={2.2} offset={[2, 1.2]} seed="v2s1/dog" />
    </FigureG>
  );
};

export const S1Public: React.FC = () => {
  const t = useTime();
  const nearT = castRow('v2s1/near', NEAR.length, {hair: NEAR.map((s) => s.traits.hair as HairKind | undefined), over: NEAR.map((s) => s.traits)});
  return (
    <>
      <Row name="low" spots={LOW} ink={1.6} />
      <Row name="mid1" spots={MID1} ink={2.2} />
      <TrotDog />
      <Row name="mid2" spots={MID2} ink={2.2} />
      {NEAR.map((s, i) => (
        <NearBack key={i} x={s.x} y={1920} hv={s.hv} seed={`v2s1/near/${i}`} traits={{...pin(nearT[i]), ...s.traits}} model={(s.traits as {scarf?: string}) ?? {}} turn={keyed(t, s.turns)} ink={3.4} />
      ))}
    </>
  );
};
