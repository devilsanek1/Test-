// K4 cast: S1's seated public on our canal-side steps (TREATMENT section 5 "the bottom third"; map.ts S1_SHEET
// seatedHeadPx): ~14 backs in three rows, all at rest, no two neighbours alike:
//   near row  5 head-and-shoulder backs cut by the frame bottom, 250-330 px (a hood, a beanie, a low bun with a mustard
//             scarf, curls, a cap), across the full width;
//   middle    4 seated backs ~110 px (one lifts a takeaway cup, one turns her head);
//   low row   5 seated backs ~60 px by the water (clear of Pip's bollard x 640-760).
// Plus small things beside them (takeaway cups and tote bags on the treads). The steps themselves (stone treads, edges
// 3.4-4.8 px), the dog lying down and the bike cut by the bottom-right are the canal kit's (K6) / the lane's.
// Coordinates are S1 screen px at zoom 1.00 (wrap it in the shot's camera like the rest of the set).
//
//   <S1Seated />                                   the default layout and life
//   <S1Seated rows={S1_SEATED} life={{...}} at={-1} />   (at: build time if the lane builds it on screen)

import React from 'react';
import {useTime, clamp, ease} from '../../../lib/time';
import {CM} from '../../palette';
import {castRow, HairKind, TraitOverrides} from './traits';
import {NearBack, pin, Seated} from './People';
import {FigureG, Parts, Part, polyline} from './parts';

export type SeatSpot = {x: number; y: number; h: number; traits?: TraitOverrides; side?: 1 | -1; beside?: 'cup' | 'tote' | null};
export type NearSpot = {x: number; y: number; hv: number; traits?: TraitOverrides};

/** The default S1 layout (screen px at zoom 1.00). Treads (K6 may move them; keep the seat lines on its treads):
 *  low row seat y 1312, middle row seat y 1560, near row cut at the frame bottom (y 1920). */
export const S1_SEATED = {
  low: [
    {x: 82, y: 1312, h: 60, beside: 'tote'},
    {x: 214, y: 1314, h: 58, side: 1},
    {x: 360, y: 1310, h: 62, beside: 'cup'},
    {x: 500, y: 1313, h: 57},
    {x: 880, y: 1311, h: 61, beside: 'tote'},
  ] as SeatSpot[],
  middle: [
    {x: 150, y: 1560, h: 112, beside: 'cup'},
    {x: 400, y: 1562, h: 108, side: 1},
    {x: 652, y: 1558, h: 114, beside: 'tote'},
    {x: 905, y: 1561, h: 106},
  ] as SeatSpot[],
  near: [
    {x: 104, y: 1920, hv: 300, traits: {hair: 'hood'}},
    {x: 322, y: 1920, hv: 262, traits: {hair: 'beanie'}},
    {x: 540, y: 1920, hv: 318, traits: {hair: 'lowBun', acc: 'none', scarf: CM.coatMustard} as TraitOverrides},
    {x: 768, y: 1920, hv: 276, traits: {hair: 'curls'}},
    {x: 990, y: 1920, hv: 326, traits: {hair: 'cap'}},
  ] as NearSpot[],
} as const;

export type S1SeatedLife = {
  /** Middle row index 0 lifts its cup at these times (lift 0.35 s, sip, lower 0.35 s): [up, down] pairs. */
  cup?: [number, number][];
  /** [row, index, time, turn] head turns (turn -1..1, eased 0.25 s). */
  turns?: ['low' | 'middle' | 'near', number, number, number][];
};

const DEFAULT_LIFE: Required<S1SeatedLife> = {
  cup: [
    [0.62, 1.55],
    [3.32, 4.05],
  ],
  turns: [
    ['middle', 1, 1.18, 0.6],
    ['low', 3, 2.36, -0.5],
    ['near', 3, 3.02, 0.45],
    ['middle', 3, 4.32, -0.55],
    ['low', 1, 5.02, 0.5],
  ],
};

function turnAt(t: number, list: S1SeatedLife['turns'], row: string, i: number): number {
  let v = 0;
  for (const [r, j, at, to] of list ?? []) {
    if (r !== row || j !== i || t < at) continue;
    v = to * ease.inOutCubic(clamp((t - at) / 0.25));
  }
  return v;
}

function cupAt(t: number, pairs: [number, number][]): number {
  let k = 0;
  for (const [up, down] of pairs) {
    if (t >= up && t < down) k = ease.inOutCubic(clamp((t - up) / 0.35));
    else if (t >= down && t < down + 0.35) k = 1 - ease.inOutCubic(clamp((t - down) / 0.35));
  }
  return k;
}

/** A takeaway cup or a tote bag standing on the tread beside a seated back. */
function besideParts(kind: 'cup' | 'tote', x: number, y: number, h: number, seed: string): Part[] {
  const s = h / 110;
  if (kind === 'cup') {
    const w = 15 * s;
    const ch = 22 * s;
    const d = polyline([[x - w / 2, y - ch], [x + w / 2, y - ch], [x + w * 0.38, y], [x - w * 0.38, y]], true);
    const lid = polyline([[x - w * 0.58, y - ch - 4 * s], [x + w * 0.58, y - ch - 4 * s], [x + w * 0.55, y - ch + 1], [x - w * 0.55, y - ch + 1]], true);
    return [
      {k: `${seed}cup`, d, fill: CM.paper, ink: d, w: 0.7},
      {k: `${seed}sl`, d: polyline([[x - w * 0.47, y - ch * 0.62], [x + w * 0.47, y - ch * 0.62], [x + w * 0.43, y - ch * 0.3], [x - w * 0.43, y - ch * 0.3]], true), fill: CM.brick, exact: true},
      {k: `${seed}lid`, d: lid, fill: CM.coatOat, ink: lid, w: 0.6},
    ];
  }
  const w = 40 * s;
  const bh = 42 * s;
  const d = polyline([[x - w / 2, y - bh], [x + w / 2, y - bh], [x + w * 0.56, y], [x - w * 0.56, y]], true);
  const handle = `M${(x - w * 0.28).toFixed(1)} ${(y - bh).toFixed(1)}Q${x.toFixed(1)} ${(y - bh - 30 * s).toFixed(1)} ${(x + w * 0.28).toFixed(1)} ${(y - bh).toFixed(1)}`;
  return [
    {k: `${seed}tote`, d, fill: seed.length % 2 ? CM.coatOat : CM.sage, ink: d, w: 0.8},
    {k: `${seed}h`, ink: handle, w: 0.8},
  ];
}

export type S1SeatedProps = {
  rows?: typeof S1_SEATED;
  life?: S1SeatedLife;
  /** Build start (s): the rows build back to front, 0.05 s apart. Omit = built (S1 builds by the Look cascade). */
  at?: number;
  /** Ink px per row (the depth ladder): low 1.6, middle 2.2, near 4.8. */
  ink?: {low?: number; middle?: number; near?: number};
  /** Draw only these rows (lanes may layer the steps' treads between them). */
  only?: ('low' | 'middle' | 'near')[];
};

export const S1Seated: React.FC<S1SeatedProps> = ({rows = S1_SEATED, life, at, ink, only}) => {
  const t = useTime();
  const L = {...DEFAULT_LIFE, ...(life ?? {})};
  const lowT = castRow('s1/low', rows.low.length, {over: rows.low.map((s) => s.traits ?? {})});
  const midT = castRow('s1/mid', rows.middle.length, {over: rows.middle.map((s) => s.traits ?? {})});
  const nearT = castRow('s1/near', rows.near.length, {
    hair: rows.near.map((s) => s.traits?.hair as HairKind | undefined),
    over: rows.near.map((s) => s.traits ?? {}),
  });
  const show = (r: 'low' | 'middle' | 'near') => !only || only.includes(r);
  const out: React.ReactNode[] = [];
  let k = 0;
  const bAt = () => (at === undefined ? undefined : at + k++ * 0.05);
  if (show('low')) {
    rows.low.forEach((s, i) => {
      if (s.beside) {
        const bx = s.x + s.h * 0.62;
        out.push(
          <FigureG key={`lb${i}`} x={0} y={0} seed={`s1/low/b${i}`}>
            <Parts parts={besideParts(s.beside, bx, s.y, s.h, `l${i}`)} inkPx={1.6} offset={[1.2, 0.8]} at={bAt()} seed={`s1/low/b${i}`} />
          </FigureG>,
        );
      }
      out.push(<Seated key={`l${i}`} x={s.x} y={s.y} h={s.h} seed={`s1/low/${i}`} traits={pin(lowT[i])} turn={turnAt(t, L.turns, 'low', i)} side={s.side} ink={ink?.low ?? 1.6} at={bAt()} />);
    });
  }
  if (show('middle')) {
    rows.middle.forEach((s, i) => {
      if (s.beside === 'tote') {
        out.push(
          <FigureG key={`mb${i}`} x={0} y={0} seed={`s1/mid/b${i}`}>
            <Parts parts={besideParts('tote', s.x + s.h * 0.6, s.y, s.h, `m${i}`)} inkPx={2.2} offset={[2, 1.3]} at={bAt()} seed={`s1/mid/b${i}`} />
          </FigureG>,
        );
      }
      const cup = s.beside === 'cup' ? cupAt(t, L.cup) : undefined;
      out.push(<Seated key={`m${i}`} x={s.x} y={s.y} h={s.h} seed={`s1/mid/${i}`} traits={pin(midT[i])} turn={turnAt(t, L.turns, 'middle', i)} cup={cup} side={s.side ?? 1} ink={ink?.middle ?? 2.2} at={bAt()} />);
    });
  }
  if (show('near')) {
    rows.near.forEach((s, i) => {
      out.push(<NearBack key={`n${i}`} x={s.x} y={s.y} hv={s.hv} seed={`s1/near/${i}`} traits={{...pin(nearT[i]), ...(s.traits ?? {})}} model={(s.traits as {scarf?: string}) ?? {}} turn={turnAt(t, L.turns, 'near', i)} ink={ink?.near ?? 4.8} at={bAt()} />);
    });
  }
  return <>{out}</>;
};
