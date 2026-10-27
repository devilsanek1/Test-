// kit/Town.tsx: the town's variety and the roof deck's clutter (docs/v3/density_plan_g5b.md S9, docs/v3/s9_scale_plan.md):
// five house types that are never one stamped shape (a gabled cottage, a terrace with a run of dormers, a flat-roof
// block with balconies, a mansard, a corner shop with a lit sign), antennas and dishes, neighbours on the roofs (a
// shoveller on a 4-drawing loop, a balcony light-hanger), a pennant, and our deck's clutter (a folding chair with a snow
// cushion, a small table with a steaming mug, a laundry line that sways, a snow shovel). The S9 lane's MidTown / FarField
// / NearRoofs / StairHut (kit/Rooftop.tsx, kit/Outside.tsx) can build their bands from TownHouse.
//
//   <TownHouse x={300} y={1180} w={70} kind="terrace" seed="m1" />          base-left on y, w = facade width
//   <RoofNeighbour x={180} y={1262} h={40} kind="shovel" />                  <Pennant x={1010} y={1060} />
//   <FoldingChair x={660} y={1700} w={110} />  <SideTable x={760} y={1720} w={90} mug />  <LaundryLine a={..} b={..} />

import React, {useMemo} from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, line, poly, polyPath, roundRect, smooth} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt, Show, Txt, W, TCircle, TPath, TRect} from './util';
import {stepped, sway, sway2, windowLit} from './idle';
import {Smoke, Steam} from './Weather';
import {tiered} from '../../../lib/tier';
import {isClean} from '../../../lib/pen';

export type HouseKind = 'cottage' | 'terrace' | 'block' | 'mansard' | 'shop';

export type TownHouseProps = {
  /** Base-left (canvas px) and facade width; height by kind (cottage 0.8 w, terrace 1.25 w, block 1.1 w, mansard 1.15 w,
   *  shop 0.9 w), or `h`. */
  x: number;
  y: number;
  w: number;
  h?: number;
  kind?: HouseKind;
  /** Body colour (default the cold roofs blue; far bands pass a paler step toward skyLow). */
  color?: string;
  /** Window light: the schedule's seed (windows switch somewhere in the town every 0.6-1.5 s); litFrac of them lit. */
  litFrac?: number;
  /** Chimney smoke (default true for cottage / terrace / mansard). */
  smoke?: boolean;
  antenna?: boolean;
  dish?: boolean;
  /** The shop's sign text (shop kind; default "CAFE"). */
  sign?: string;
  /** Fill only (far): no ink, windows as dots. */
  far?: boolean;
  seed?: string;
  at?: At;
  ink?: number;
};

const HEIGHT: Record<HouseKind, number> = {cottage: 0.8, terrace: 1.25, block: 1.1, mansard: 1.15, shop: 0.9};

/** One house of the town at blue hour: body, snowy roof, warm windows (some lit, switching), chimney with smoke,
 *  antenna and dish; five distinct types. */
const TownHouseBody: React.FC<TownHouseProps> = ({x, y, w, h: hIn, kind = 'cottage', color = EMBER.roofs, litFrac = 0.6, smoke, antenna, dish, sign = 'CAFE', far, seed = 'house', at, ink}) => {
  const t = useTime();
  const h = hIn ?? w * HEIGHT[kind];
  const iw = far ? 0 : ink ?? (w >= 120 ? W.far : W.hair);
  const top = y - h;
  const r = rng(`th/${seed}`);
  const out: React.ReactNode[] = [];
  let roof: Pt[] = [];
  let snowD = '';
  let bodyD = '';
  // ---- body and roof by kind
  if (kind === 'cottage') {
    const peak = top - w * 0.45;
    bodyD = polyPath([[x, y], [x, top], [x + w / 2, peak], [x + w, top], [x + w, y]]);
    roof = [[x - w * 0.08, top + 4], [x + w / 2, peak - 4], [x + w * 1.08, top + 4]];
    snowD = polyPath([[x - w * 0.1, top + 5], [x + w / 2, peak - 6], [x + w * 1.1, top + 5], [x + w * 1.02, top + w * 0.1], [x + w / 2, peak + w * 0.08], [x - w * 0.02, top + w * 0.1]]);
  } else if (kind === 'terrace') {
    const rt = top - w * 0.22;
    bodyD = polyPath([[x, y], [x, top], [x + w * 0.1, rt], [x + w * 0.9, rt], [x + w, top], [x + w, y]]);
    roof = [[x - 3, top + 2], [x + w * 0.1, rt], [x + w * 0.9, rt], [x + w + 3, top + 2]];
    snowD = polyPath([[x + w * 0.06, rt - 4], [x + w * 0.94, rt - 4], [x + w * 0.98, rt + w * 0.08], [x + w * 0.02, rt + w * 0.08]]);
    // the dormer run
    const nd = Math.max(2, Math.round(w / 34));
    for (let i = 0; i < nd; i++) {
      const dx = x + w * 0.14 + (i * w * 0.72) / Math.max(1, nd - 1) - w * 0.06;
      const dw = w * 0.12;
      out.push(<TRect key={`dm${i}`} x={dx} y={rt - dw * 0.7} width={dw} height={dw * 0.9} fill={color} />);
      out.push(<TPath key={`dms${i}`} d={polyPath([[dx - 3, rt - dw * 0.7], [dx + dw / 2, rt - dw * 1.2], [dx + dw + 3, rt - dw * 0.7]])} fill={EMBER.snow} />);
    }
  } else if (kind === 'block') {
    bodyD = polyPath([[x, y], [x, top], [x + w, top], [x + w, y]]);
    roof = [[x - 4, top], [x + w + 4, top]];
    snowD = `M${x - 5} ${top - 7}h${w + 10}v9h${-w - 10}Z`;
  } else if (kind === 'mansard') {
    const mt = top - w * 0.32;
    bodyD = polyPath([[x, y], [x, top], [x + w * 0.12, mt], [x + w * 0.88, mt], [x + w, top], [x + w, y]]);
    roof = [[x, top], [x + w * 0.12, mt], [x + w * 0.88, mt], [x + w, top]];
    snowD = `M${x + w * 0.1} ${mt - 6}h${w * 0.8}v8h${-w * 0.8}Z` + polyPath([[x - 4, top + 3], [x + w * 0.05, top - w * 0.12], [x + w * 0.1, top - w * 0.08], [x + 4, top + 6]]) + polyPath([[x + w + 4, top + 3], [x + w * 0.95, top - w * 0.12], [x + w * 0.9, top - w * 0.08], [x + w - 4, top + 6]]);
  } else {
    // the corner shop: a flat roof, an awning, a lit sign, a big lit window
    bodyD = polyPath([[x, y], [x, top], [x + w, top], [x + w, y]]);
    roof = [[x - 4, top], [x + w + 4, top]];
    snowD = `M${x - 5} ${top - 7}h${w + 10}v9h${-w - 10}Z`;
  }
  // chimney (behind the body)
  const hasCh = kind !== 'block' && kind !== 'shop';
  const chX = x + w * r.range(0.62, 0.78);
  const chTop = kind === 'cottage' ? top - w * 0.42 : kind === 'terrace' ? top - w * 0.36 : top - w * 0.42;
  const chW = Math.max(5, w * 0.1);
  const pre: React.ReactNode[] = [];
  if (hasCh) {
    pre.push(<TRect key="ch" x={chX} y={chTop} width={chW} height={top - chTop + 8} fill={EMBER.dcSide} />);
    pre.push(<TPath key="chs" d={blob(chX + chW / 2, chTop - 1, chW * 0.75, 3 + w * 0.02, {seed: `${seed}/chs`})} fill={EMBER.snow} />);
    if (smoke ?? true) pre.push(<Smoke key="sm" x={chX + chW / 2} y={chTop - 3} seed={`${seed}/sm`} rise={w * 0.9} r1={Math.max(4, w * 0.12)} r0={Math.max(2, w * 0.04)} drift={w * 0.5} />);
  }
  if (antenna ?? (kind === 'block' || kind === 'terrace')) {
    const ax = x + w * (kind === 'block' ? 0.3 : 0.25);
    const ay = kind === 'block' ? top - 4 : top - w * 0.22;
    const ah = w * 0.42;
    pre.push(<TPath thing key="ant" d={`M${ax} ${ay}v${-ah}M${ax - w * 0.12} ${ay - ah * 0.7}h${w * 0.24}M${ax - w * 0.08} ${ay - ah * 0.45}h${w * 0.16}`} stroke={EMBER.dcSide} strokeWidth={Math.max(1.4, w * 0.015)} />);
  }
  // ---- windows
  const wins: {x: number; y: number; w: number; h: number}[] = [];
  const rows = kind === 'cottage' ? 1 : kind === 'shop' ? 1 : Math.max(2, Math.round(h / (w * 0.42)));
  const cols = kind === 'cottage' ? 2 : kind === 'shop' ? 2 : Math.max(2, Math.round(w / 34));
  for (let ry = 0; ry < rows; ry++)
    for (let cx = 0; cx < cols; cx++) {
      const ww = (w / cols) * 0.4;
      const wh = Math.min(ww * 1.3, (h / rows) * 0.45);
      const wx = x + (w / cols) * (cx + 0.5) - ww / 2;
      const wy = kind === 'shop' ? top + h * 0.12 : top + (h / rows) * (ry + 0.3);
      wins.push({x: wx, y: wy, w: ww, h: wh});
    }
  const nW = wins.length;
  const body = <TPath key="body" d={bodyD} fill={color} />;
  const winEls = wins.map((wd, i) => {
    const lit = windowLit(t, `town/${seed}`, i, nW, {litFrac});
    return <TRect key={`w${i}`} x={wd.x} y={wd.y} width={wd.w} height={wd.h} fill={lit ? EMBER.houseLit : EMBER.dcDark} />;
  });
  const extra: React.ReactNode[] = [];
  if (kind === 'block') {
    // balconies: a rail under every other window row
    for (let ry = 1; ry < rows; ry++) {
      const by = top + (h / rows) * (ry + 0.3) + (h / rows) * 0.5;
      extra.push(<TRect key={`bal${ry}`} x={x + w * 0.1} y={by} width={w * 0.8} height={Math.max(2, w * 0.03)} fill={EMBER.dcSide} />);
      extra.push(<TPath key={`bals${ry}`} d={`M${x + w * 0.1} ${by - 1.5}h${w * 0.8}`} stroke={EMBER.snow} strokeWidth={Math.max(1.4, w * 0.02)} />);
    }
    if (dish ?? true) extra.push(<TPath key="dish" d={`M${x + w * 0.78} ${top + h * 0.22}a${w * 0.08} ${w * 0.08} 0 0 1 ${w * 0.08} ${w * 0.1}z`} fill={EMBER.frost} />);
  }
  if (kind === 'shop') {
    const aw = polyPath([[x - 3, top + h * 0.5], [x + w + 3, top + h * 0.5], [x + w + 8, top + h * 0.62], [x - 8, top + h * 0.62]]);
    extra.push(<TPath key="aw" d={aw} fill={EMBER.beam} />);
    extra.push(<TRect key="shopwin" x={x + w * 0.08} y={top + h * 0.66} width={w * 0.6} height={h * 0.28} fill={EMBER.core} />);
    extra.push(<TRect key="door" x={x + w * 0.74} y={top + h * 0.64} width={w * 0.18} height={h * 0.36} fill={EMBER.houseLit} />);
    extra.push(
      <Show key="sg" at={fillAt(at, 0.06)}>
        <TRect x={x + w * 0.1} y={top + h * 0.36} width={w * 0.8} height={h * 0.12} fill={EMBER.core} />
        {!far && w >= 70 ? (
          <Txt x={x + w / 2} y={top + h * 0.455} size={Math.max(10, h * 0.1)} fill={EMBER.beam} fit={w * 0.74}>
            {sign}
          </Txt>
        ) : null}
      </Show>,
    );
  }
  if (dish && kind !== 'block') extra.push(<TPath key="dish2" d={`M${x + w * 0.15} ${top + h * 0.15}a${w * 0.07} ${w * 0.07} 0 0 1 ${w * 0.07} ${w * 0.09}z`} fill={EMBER.frost} />);
  const show = at === undefined || t >= fillAt(at)!;
  if (!show) return iw ? <Ink d={poly(roof, {seed: `${seed}/ri`, over: [1, 3]})} at={at} width={iw} /> : null;
  return (
    <>
      {pre}
      {body}
      <TPath d={snowD} fill={EMBER.snow} />
      {winEls}
      {extra}
      {iw ? <Ink d={poly(roof, {seed: `${seed}/ri`, over: [1, 3]}) + line(x, top, x, y, {over: [0, 0], seed: `${seed}/l`}) + line(x + w, top, x + w, y, {over: [0, 0], seed: `${seed}/r`})} at={at} width={iw} /> : null}
    </>
  );
};
export const TownHouse = tiered('environment', {bg: EMBER.sky}, TownHouseBody);

/** A row of varied town houses (never one stamped shape): kinds cycle through a seeded shuffle of all five, widths
 *  +-15 %, heights stepped, 30 % overlap allowed by `gap` < 0. */
const TownRowBody: React.FC<{x0: number; x1: number; y: number; w?: number; gap?: number; kinds?: HouseKind[]; color?: string; far?: boolean; seed?: string; at?: At; litFrac?: number}> = ({x0, x1, y, w = 70, gap = -4, kinds = ['cottage', 'terrace', 'block', 'mansard', 'shop'], color, far, seed = 'row', at, litFrac}) => {
  const list = useMemo(() => {
    const r = rng(`trow/${seed}`);
    const order = r.shuffle(kinds);
    const out: {x: number; w: number; kind: HouseKind; dy: number}[] = [];
    let x = x0 - r.range(0, w * 0.5);
    let i = 0;
    while (x < x1 && i < 80) {
      const ww = w * r.range(0.85, 1.15);
      out.push({x, w: ww, kind: order[i % order.length], dy: r.int(-1, 1) * w * 0.04});
      x += ww + gap;
      i++;
    }
    return out;
  }, [x0, x1, y, w, gap, kinds.join(), seed]);
  return (
    <>
      {list.map((hs, i) => (
        <TownHouse key={i} x={hs.x} y={y + hs.dy} w={hs.w} kind={hs.kind} color={color} far={far} seed={`${seed}/${i}`} at={b(at, i * 0.02)} litFrac={litFrac} smoke={i % 3 === 0} />
      ))}
    </>
  );
};
export const TownRow = tiered('environment', {bg: EMBER.sky}, TownRowBody);

// ---------------------------------------------------------------- neighbours on the roofs

/** A neighbour on a roof (30-60 px): 'shovel' (a 4-drawing loop: dig, lift, throw with a snow puff, return) or
 *  'lights' (on a balcony, reaching up to hang a string of bulbs). Feet on (x, y). */
const RoofNeighbourBody: React.FC<{x: number; y: number; h?: number; kind?: 'shovel' | 'lights'; flip?: boolean; seed?: string; coat?: string}> = ({x, y, h = 44, kind = 'shovel', flip, seed = 'nb', coat = EMBER.reveal}) => {
  const t = useTime();
  const k = h / 44;
  const f = flip ? -1 : 1;
  const frame = Math.floor(stepped(t + rng(`nb/${seed}`).range(0, 2), 4) * 4) % 4;
  // body: legs, coat, head (side-ish silhouette, no face)
  const lean = kind === 'shovel' ? [10, 2, -8, 4][frame] : 0;
  const head = <TCircle cx={2 * f} cy={-38} r={6} fill={EMBER.anchor} />;
  const bodyEl = (
    <>
      <TPath thing d={`M-4 -16L-6 0M4 -16L6 0`} stroke={EMBER.anchor} strokeWidth={4} strokeLinecap="round" />
      <TPath d={roundRect(-8, -33, 16, 19, 6)} fill={coat} />
      <TPath d={blob(2 * f, -44, 6.5, 3, {seed: `${seed}/hat`})} fill={EMBER.hl} />
      {head}
    </>
  );
  let tool: React.ReactNode = null;
  if (kind === 'shovel') {
    const ang = [55, 20, -30, 30][frame] * f;
    const puff = frame === 2;
    tool = (
      <>
        <g transform={`rotate(${ang} 0 -24)`}>
          <TPath thing d={`M0 -24L${16 * f} -2`} stroke={EMBER.beam} strokeWidth={2.4} strokeLinecap="round" />
          <TPath d={`M${13 * f} -4l${8 * f} 6l${-4 * f} 5l${-8 * f} -6z`} fill={EMBER.dcSide} />
        </g>
        {puff ? <TPath d={blob(24 * f, -40, 9, 6, {seed: `${seed}/puff`}) + blob(32 * f, -48, 6, 4, {seed: `${seed}/puff2`})} fill={EMBER.snow} /> : null}
      </>
    );
  } else {
    const reach = Math.sin(t * 1.4) * 6;
    tool = (
      <>
        <TPath thing d={`M3 -30L${10 * f} ${-52 - reach}`} stroke={coat} strokeWidth={4} strokeLinecap="round" />
        <TPath thing d={`M${10 * f} ${-54 - reach}Q${40 * f} -40 ${70 * f} -50`} fill="none" stroke={EMBER.ink} strokeWidth={1.2} />
        {[0.3, 0.55, 0.8].map((u, i) => (
          <TCircle key={i} cx={(10 + 60 * u) * f} cy={-54 - reach * (1 - u) + 10 * Math.sin(u * Math.PI)} r={2.4} fill={Math.floor(t * 2 + i) % 3 ? EMBER.houseLit : EMBER.core} />
        ))}
      </>
    );
  }
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`}>
      <g transform={`rotate(${lean * f} 0 0)`}>
        {tool}
        {bodyEl}
      </g>
    </g>
  );
};
export const RoofNeighbour = tiered('environment', {bg: EMBER.sky}, RoofNeighbourBody);

/** A pennant on a short mast flapping at 1.5-2 Hz (the stair hut's antenna). Base of the mast on (x, y). */
const PennantBody: React.FC<{x: number; y: number; h?: number; w?: number; color?: string; seed?: string}> = ({x, y, h = 70, w = 40, color = EMBER.hl, seed = 'pen'}) => {
  const t = useTime();
  const pts: Pt[] = [];
  for (let i = 0; i <= 4; i++) {
    const u = i / 4;
    pts.push([x + u * w, y - h + 4 + Math.sin(t * 2 * Math.PI * 1.7 - u * 3) * 4 * u]);
  }
  const tip = pts[4];
  return (
    <>
      <TPath thing d={`M${x} ${y}V${y - h}`} stroke={EMBER.anchor} strokeWidth={2.4} />
      <TPath d={`M${x} ${y - h + 2}` + pts.slice(1).map(([px, py]) => `L${px.toFixed(1)} ${py.toFixed(1)}`).join('') + `L${x} ${y - h + 18}Z`} fill={color} />
      <TPath d={`M${x} ${y - h + 2}L${tip[0].toFixed(1)} ${tip[1].toFixed(1)}L${x} ${y - h + 18}`} fill="none" stroke={EMBER.ink} strokeWidth={1.6} strokeLinejoin="round" />
      <TPath d={blob(x, y - h - 2, 4, 2, {seed: `${seed}/s`})} fill={EMBER.snow} />
    </>
  );
};
export const Pennant = tiered('environment', {bg: EMBER.sky}, PennantBody);

// ---------------------------------------------------------------- our deck's clutter

/** A folding chair (side view) with a snow cushion on the seat. Feet on y. */
const FoldingChairBody: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w = 110, seed = 'chair', at, ink}) => {
  const iw = ink ?? (w >= 100 ? W.mid : W.far);
  const h = w * 1.3;
  const d = `M${x - w * 0.35} ${y}L${x + w * 0.3} ${y - h * 0.48}M${x + w * 0.3} ${y}L${x - w * 0.3} ${y - h * 0.48}M${x - w * 0.36} ${y - h * 0.48}L${x + w * 0.36} ${y - h * 0.48}M${x + w * 0.3} ${y - h * 0.48}L${x + w * 0.38} ${y - h}`;
  return (
    <>
      <Ink thing d={d} at={at} width={iw} color={EMBER.beam} />
      <Ink d={line(x + w * 0.33, y - h * 0.85, x + w * 0.37, y - h * 0.6, {over: [0, 0], seed: `${seed}/b`})} at={at} width={w * 0.12} color={EMBER.beam} taper={false} />
      <TPath d={blob(x, y - h * 0.5 - w * 0.06, w * 0.38, w * 0.08, {seed: `${seed}/cush`})} fill={EMBER.snow} />
      <TPath d={blob(x + w * 0.36, y - h - w * 0.03, w * 0.07, w * 0.04, {seed: `${seed}/top`})} fill={EMBER.snow} />
      <Ink d={`M${x - w * 0.38} ${y - h * 0.5 - w * 0.06}Q${x} ${y - h * 0.5 - w * 0.2} ${x + w * 0.38} ${y - h * 0.5 - w * 0.06}`} at={b(at, 0.06)} width={W.hair} />
    </>
  );
};
export const FoldingChair = tiered('environment', {bg: EMBER.sky}, FoldingChairBody);

/** A small round table with a steaming mug (the deck). Feet on y. */
const SideTableBody: React.FC<{x: number; y: number; w?: number; mug?: boolean; seed?: string; at?: At; ink?: number}> = ({x, y, w = 90, mug = true, seed = 'table', at, ink}) => {
  const iw = ink ?? (w >= 90 ? W.mid : W.far);
  const h = w * 0.9;
  const mw = w * 0.26;
  return (
    <>
      <Ink thing d={`M${x} ${y - h}L${x} ${y}M${x - w * 0.3} ${y}L${x + w * 0.3} ${y}`} at={at} width={iw} color={EMBER.anchor} />
      <Fill d={roundRect(x - w / 2, y - h - 10, w, 12, 5)} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/t`} />
      <Ink d={roundRect(x - w / 2, y - h - 10, w, 12, 5, {closed: false, seed: `${seed}/ti`})} at={at} width={iw} />
      <TPath d={blob(x - w * 0.28, y - h - 13, w * 0.18, 4, {seed: `${seed}/sn`})} fill={EMBER.snow} />
      {mug ? (
        <>
          <Fill d={roundRect(x + w * 0.05, y - h - 10 - mw * 1.1, mw, mw * 1.1, mw * 0.18)} color={EMBER.mug} at={fillAt(at, 0.04)} seed={`${seed}/m`} />
          <Fill rect={[x + w * 0.05, y - h - 10 - mw * 0.75, mw, mw * 0.18]} color={EMBER.mugBand} at={fillAt(at, 0.05)} offset={false} />
          <Ink d={roundRect(x + w * 0.05, y - h - 10 - mw * 1.1, mw, mw * 1.1, mw * 0.18, {closed: false, seed: `${seed}/mi`}) + `M${x + w * 0.05 + mw} ${y - h - 10 - mw * 0.85}q${mw * 0.5} ${mw * 0.25} 0 ${mw * 0.55}`} at={b(at, 0.04)} width={W.far} />
          <Steam x={x + w * 0.05 + mw / 2} y={y - h - 14 - mw * 1.1} seed={`${seed}/st`} rise={w * 0.7} r1={w * 0.06 + 2} />
        </>
      ) : null}
    </>
  );
};
export const SideTable = tiered('environment', {bg: EMBER.sky}, SideTableBody);

/** A laundry line between two points with 3-5 pieces (sock, shirt, towel) swaying, a little snow on the line. */
const LaundryLineBody: React.FC<{a: Pt; b: Pt; sag?: number; n?: number; size?: number; seed?: string; ink?: number}> = ({a, b: bb, sag = 24, n = 4, size = 50, seed = 'laundry', ink = W.far}) => {
  const t = useTime();
  const swayL = sway2(t, 3, 2.8);
  const P = (u: number): Pt => [a[0] + (bb[0] - a[0]) * u + swayL * Math.sin(u * Math.PI) * 0.4, a[1] + (bb[1] - a[1]) * u + 4 * (sag + swayL) * u * (1 - u)];
  const pts: Pt[] = Array.from({length: 9}, (_, i) => P(i / 8));
  const colors = [EMBER.hl, EMBER.card, EMBER.dc, EMBER.ring, EMBER.reveal];
  const items: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const u = 0.15 + (i / Math.max(1, n - 1)) * 0.7;
    const [px, py] = P(u);
    const kind = i % 3;
    const s = size * (kind === 0 ? 0.6 : 1);
    const a2 = sway(t, 6, 2.2, i * 1.3);
    let d = '';
    if (kind === 0) d = `M${px - s * 0.2} ${py}h${s * 0.4}v${s * 0.7}q0 ${s * 0.3} ${-s * 0.4} ${s * 0.3}h${-s * 0.3}v${-s * 0.3}h${s * 0.3}z`;
    else if (kind === 1) d = `M${px - s * 0.5} ${py}h${s}l${s * 0.2} ${s * 0.3}l${-s * 0.2} ${s * 0.1}v${s * 0.6}h${-s}v${-s * 0.6}l${-s * 0.2} ${-s * 0.1}z`;
    else d = `M${px - s * 0.45} ${py}h${s * 0.9}v${s * 1.1}h${-s * 0.9}z`;
    items.push(
      <g key={i} transform={`rotate(${a2.toFixed(2)} ${px} ${py})`}>
        <TPath d={d} fill={colors[i % colors.length]} transform={isClean() ? undefined : 'translate(2 1.5)'} />
        <TPath d={d} fill="none" stroke={EMBER.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
        <TPath thing d={`M${px - 3} ${py - 3}v6M${px + 3} ${py - 3}v6`} stroke={EMBER.beam} strokeWidth={2} />
      </g>,
    );
  }
  return (
    <>
      <TPath thing d={smooth(pts)} fill="none" stroke={EMBER.ink} strokeWidth={ink * 0.7} />
      <TPath d={smooth(pts.slice(1, 4).map(([x, y]) => [x, y - 2] as Pt))} fill="none" stroke={EMBER.snow} strokeWidth={3} strokeLinecap="round" />
      {items}
    </>
  );
};
export const LaundryLine = tiered('environment', {bg: EMBER.sky}, LaundryLineBody);

/** A snow shovel leaning (on a vent or a wall): handle, blade with snow. Blade foot on (x, y). */
const ShovelBody: React.FC<{x: number; y: number; h?: number; lean?: number; seed?: string; at?: At; ink?: number}> = ({x, y, h = 160, lean = 12, seed = 'shovel', at, ink = W.far}) => (
  <XG m={mat.about(mat.rotate(lean), x, y)}>
    <Ink d={line(x, y - h * 0.22, x, y - h, {over: [0, 0], seed: `${seed}/h`})} at={at} width={h * 0.04} color={EMBER.beam} taper={false} />
    <Ink thing d={line(x - h * 0.06, y - h, x + h * 0.06, y - h, {over: [0, 0], seed: `${seed}/g`})} at={at} width={h * 0.03} color={EMBER.anchor} taper={false} />
    <Fill d={polyPath([[x - h * 0.15, y - h * 0.24], [x + h * 0.15, y - h * 0.24], [x + h * 0.17, y], [x - h * 0.17, y]])} color={EMBER.dcSide} at={fillAt(at)} seed={`${seed}/b`} />
    <TPath d={blob(x, y - h * 0.24, h * 0.13, h * 0.03 + 1, {seed: `${seed}/sn`})} fill={EMBER.snow} />
    <Ink d={poly([[x - h * 0.15, y - h * 0.24], [x + h * 0.15, y - h * 0.24], [x + h * 0.17, y], [x - h * 0.17, y]], {closed: true, seed: `${seed}/bi`, over: [0, 1]})} at={at} width={ink} />
  </XG>
);
export const Shovel = tiered('environment', {bg: EMBER.sky}, ShovelBody);

/** A satellite dish and an antenna for any roof (base on (x, y)). */
const RoofAerialsBody: React.FC<{x: number; y: number; s?: number; dish?: boolean; antenna?: boolean}> = ({x, y, s = 1, dish = true, antenna = true}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {antenna ? <TPath thing d={`M0 0v-60M-18 -44h36M-12 -30h24M-8 -18h16`} stroke={EMBER.dcSide} strokeWidth={2.4} /> : null}
    {dish ? (
      <>
        <TPath thing d={`M30 0v-16`} stroke={EMBER.dcSide} strokeWidth={2.4} />
        <TPath d={`M18 -16a14 14 0 0 1 26 -10z`} fill={EMBER.frost} stroke={EMBER.ink} strokeWidth={1.4} />
      </>
    ) : null}
    <TPath d={blob(0, -61, 4, 2, {seed: 'aer'})} fill={EMBER.snow} />
  </g>
);
export const RoofAerials = tiered('environment', {bg: EMBER.sky}, RoofAerialsBody);
