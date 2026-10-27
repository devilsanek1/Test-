// kit/Nook.tsx: the home base (O1, S7, S8, S13, S15, S16, LOOP): the warm lamp-lit room around ONE landscape window.
// Ported from the approved style frame (src/v3/StyleNook.tsx, EMBER roles) and laid out on the G3 board:
//   variant 'pov'        O1 / S15 / LOOP: your desk-chair eye level. Shelf mass cut by the left and top edges, the attic
//                        beam top right, the window (glass x 180-900, y 630-1060, ONE vertical mullion at x 830, sill),
//                        the desk from y 1086, the lamp over the window's lower-left corner, its golden pool on the desk.
//   variant 'objective'  S13: the window on the right, cut by the right edge (glass x 470-1110, y 640-1006, mullion
//                        x 1023), a desk under it (back edge y 1060), the floor from y 1400, the lamp and its pool on the
//                        desk by the window's lower-left corner; the shelf on the left. You + chair are drawn by the lane.
// The outside is a slot: pass it as children (canvas px, clipped to the glass), or use <NookOutside variant> (the
// board's horizon, two houses and the data center for that variant). The caption band (y 290-600) stays a flat wall:
// the shelf upright's ink breaks across it and nothing else reaches into it.

import React, {useId} from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, crown, ellipse, hline, line, poly, polyPath, rect as rectInk, smooth, vline} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt} from './util';
import {DataCenter, DataCenterProps, NightSky, Snowfall, TownBand} from './Outside';
import {tiered, TierPart} from '../../../lib/tier';
import {isClean} from '../../../lib/pen';

const W_MID = 3.4;
const W_THIN = 2.2;
const W_HAIR = 1.6;

export type Rect = {x: number; y: number; w: number; h: number};
export type LampPose = {base: Pt; elbow: Pt; head: Pt; rot: number; scale?: number};
export type Pool = {cx: number; cy: number; rx: number; ry: number};

export type NookLayout = {
  glass: Rect;
  mullionX: number;
  /** Optional horizontal transom (the board uses none: it would split the sign). */
  transomY?: number;
  sill: {y: number; h: number; over: number};
  /** The desk's back edge (the sill's bottom in 'pov'). */
  deskY: number;
  /** Desk span (x0..x1); default the whole frame. */
  desk: {x0: number; x1: number; depth?: number};
  floorY?: number;
  shelf: {x1: number; boards: number[]; books: {base: number; x1: number; hMin: number; hMax: number; lean?: boolean}[]; plant?: Pt} | null;
  slope: boolean;
  lamp: LampPose;
  pool: Pool;
  mug: Pt | null;
  notebook: boolean;
};

export const NOOK_LAYOUT: Record<'pov' | 'objective', NookLayout> = {
  pov: {
    glass: {x: 180, y: 630, w: 720, h: 430},
    mullionX: 830,
    sill: {y: 1060, h: 26, over: 25},
    deskY: 1086,
    desk: {x0: -60, x1: 1140},
    shelf: {
      x1: 150,
      boards: [-8, 268, 584, 856],
      books: [
        {base: 268, x1: 122, hMin: 150, hMax: 214},
        {base: 856, x1: 60, hMin: 160, hMax: 222},
        {base: 1086, x1: 118, hMin: 150, hMax: 200, lean: true},
      ],
      plant: [98, 856],
    },
    slope: true,
    lamp: {base: [330, 1180], elbow: [376, 972], head: [214, 990], rot: 10},
    pool: {cx: 210, cy: 1206, rx: 236, ry: 74},
    mug: [790, 1124],
    notebook: false,
  },
  objective: {
    glass: {x: 470, y: 640, w: 640, h: 366},
    mullionX: 1023,
    sill: {y: 1006, h: 22, over: 22},
    deskY: 1060,
    desk: {x0: 452, x1: 1140, depth: 64},
    floorY: 1400,
    shelf: {
      x1: 112,
      boards: [-8, 268, 584, 856, 1140],
      books: [
        {base: 268, x1: 86, hMin: 150, hMax: 214},
        {base: 856, x1: 40, hMin: 160, hMax: 222},
        {base: 1140, x1: 84, hMin: 170, hMax: 230, lean: true},
      ],
      plant: [62, 856],
    },
    slope: false,
    lamp: {base: [700, 1094], elbow: [736, 934], head: [596, 968], rot: 4, scale: 0.78},
    pool: {cx: 640, cy: 1094, rx: 156, ry: 26},
    mug: [930, 1018],
    notebook: false,
  },
};

export type NookProps = {
  variant?: 'pov' | 'objective';
  /** Override any layout field (merged over the variant's). */
  layout?: Partial<NookLayout>;
  /** Frost in the glass's bottom corners + the snow pile on the outside sill (default true). */
  frost?: boolean;
  /** The lamp is on (pool + lit mouth). Default true. */
  lampOn?: boolean;
  at?: At;
  seed?: string;
  /** The outside, in canvas px, clipped to the glass (default: <NookOutside variant>). */
  children?: React.ReactNode;
};

const NookBody: React.FC<NookProps> = ({variant = 'pov', layout, frost = true, lampOn = true, at, seed = 'nook', children}) => {
  const L: NookLayout = {...NOOK_LAYOUT[variant], ...(layout ?? {})};
  const t = useTime();
  return (
    <>
      <Fill rect={[-200, -200, 1480, 2320]} color={EMBER.wall} at={at} mode="snap" offset={false} />
      {L.slope ? <Slope at={b(at, 0.05)} seed={seed} /> : null}
      {L.floorY !== undefined ? <Floor y={L.floorY} at={b(at, 0.08)} seed={seed} /> : null}
      {L.shelf ? <Shelf L={L} at={b(at, 0.02)} seed={seed} /> : null}
      <WindowView L={L} frost={frost} t={t} at={b(at, 0.04)} seed={seed}>
        <TierPart bg={EMBER.sky}>{children ?? <NookOutside variant={variant} at={b(at, 0.1)} />}</TierPart>
      </WindowView>
      <Desk L={L} lampOn={lampOn} at={b(at, 0.06)} seed={seed} />
      <Lamp pose={L.lamp} lit={lampOn} at={b(at, 0.08)} seed={seed} />
      {L.mug ? <Mug x={L.mug[0]} top={L.mug[1]} t={t} at={b(at, 0.12)} seed={seed} /> : null}
      {L.notebook ? <Notebook at={b(at, 0.14)} seed={seed} /> : null}
    </>
  );
};
export const Nook = tiered('environment', {tone: EMBER.wall}, NookBody);

/** The home base's ONE window alone (reveal, frame, the glass with the outside as children, mullion, latch, frost, the
 *  inside sill), in the variant's canvas px, without the wall, desk or lamp: for the desk shots that hang the same window
 *  behind their own desk through an XG (S7, S8, S12, S16: scenes/desk_window.tsx). A `layout.glass` with a lower top
 *  crops the outside's top (the window seen closer, under the caption band). */
const NookWindowBody: React.FC<{variant?: 'pov' | 'objective'; layout?: Partial<NookLayout>; frost?: boolean; at?: At; seed?: string; children?: React.ReactNode}> = ({variant = 'pov', layout, frost = true, at, seed = 'nook', children}) => {
  const L: NookLayout = {...NOOK_LAYOUT[variant], ...(layout ?? {})};
  const t = useTime();
  return (
    <WindowView L={L} frost={frost} t={t} at={b(at, 0.04)} seed={seed}>
      <TierPart bg={EMBER.sky}>{children ?? <NookOutside variant={variant} at={b(at, 0.1)} />}</TierPart>
    </WindowView>
  );
};
export const NookWindow = tiered('environment', {tone: EMBER.trim}, NookWindowBody);

// ---------------------------------------------------------------- the outside through the window (board layouts)

export type NookOutsideProps = {
  variant?: 'pov' | 'objective';
  /** Data center overrides (sign, signAt, darkAt, signLitAt, variant, ...). */
  dc?: Partial<DataCenterProps>;
  snow?: boolean;
  at?: At;
};

/** The board's view: the dusk-blue sky, the horizon with two snow-capped houses, the data center ~4x their height on
 *  it, falling snow. pov: horizon 950, the data center x 322-758 (w 436); objective: horizon 912, a far silhouette
 *  x 591-961 (w 371) with its 3 roof units. */
const NookOutsideBody: React.FC<NookOutsideProps> = ({variant = 'pov', dc, snow = true, at}) => {
  const L = NOOK_LAYOUT[variant];
  const g = L.glass;
  const pov = variant === 'pov';
  const horizon = pov ? 950 : 912;
  return (
    <>
      <NightSky x={g.x - 20} y={g.y - 20} w={g.w + 40} h={g.h + 40} at={at} />
      <Fill rect={[g.x - 20, horizon, g.w + 40, g.y + g.h - horizon + 20]} color={EMBER.snow} at={fillAt(at)} offset={false} mode="snap" />
      <DataCenter x={pov ? 540 : 776} y={horizon + 2} w={pov ? 436 : 371} variant={pov ? 'normal' : 'far'} at={b(at, 0.04)} seed={`dc/${variant}`} sign={pov ? 'AI DATA CENTER' : null} {...dc} />
      <TownBand y={horizon + 2} houses={pov ? [{x: 205, w: 70, lit: true}, {x: 762, w: 60, lit: true, chimney: true}] : [{x: 491, w: 60, lit: true}, {x: 964, w: 52, lit: true, chimney: true}]} far at={b(at, 0.06)} seed={`town/${variant}`} />
      {snow ? <Snowfall x={g.x} y={g.y} w={g.w} h={g.h} n={pov ? 22 : 16} at={at} seed={`snow/${variant}`} /> : null}
    </>
  );
};
export const NookOutside = tiered('environment', {bg: EMBER.sky}, NookOutsideBody);

// ---------------------------------------------------------------- room pieces

const Slope: React.FC<{at?: At; seed: string}> = ({at, seed}) => {
  const k = 284 / 550;
  const slope: Pt[] = [[560, -40], [1120, -40], [1120, -30 + 560 * k]];
  const beam: Pt[] = [[560, -30], [1120, -30 + 560 * k], [1120, -4 + 560 * k], [510, -30]];
  return (
    <>
      <Fill d={polyPath(slope)} color={EMBER.slope} at={fillAt(at)} offset={false} />
      <Fill d={polyPath(beam)} color={EMBER.beam} at={fillAt(at, 0.03)} seed={`${seed}/beam`} />
      <Ink d={line(560, -30, 1120, -30 + 560 * k, {over: [0, 0], seed: `${seed}/eave`}) + line(510, -30, 1120, -4 + 560 * k, {over: [0, 0], seed: `${seed}/eave2`})} at={at} width={W_MID} />
      <Ink d={[64, 128, 192].map((d) => line(560 + d / k, -30, 1120, -30 - d + 560 * k, {over: [0, 0], seed: `${seed}/pl${d}`})).join('')} at={b(at, 0.06)} width={W_THIN} />
    </>
  );
};

const Floor: React.FC<{y: number; at?: At; seed: string}> = ({y, at, seed}) => (
  <>
    <Fill rect={[-200, y, 1480, 900]} color={EMBER.books[6]} at={fillAt(at)} offset={false} />
    <Fill rect={[-200, y - 18, 1480, 18]} color={EMBER.reveal} at={fillAt(at, 0.02)} offset={false} />
    <Ink d={hline(-60, 1140, y, {seed: `${seed}/floor`, over: 'structural'}) + hline(-60, 1140, y - 18, {seed: `${seed}/skirt`, over: 'medium'})} at={at} width={W_MID} />
    <Ink d={line(60, y + 120, 380, y + 126, {seed: `${seed}/fb1`, over: [0, 0]}) + line(520, y + 230, 900, y + 238, {seed: `${seed}/fb2`, over: [0, 0]})} at={b(at, 0.1)} width={W_THIN} />
  </>
);

type Book = {x: number; w: number; h: number; c: string; band: number; band2: boolean; label: boolean};

function bookRow(x0: number, x1: number, hMin: number, hMax: number, seed: string): Book[] {
  const r = rng(`books/${seed}`);
  const out: Book[] = [];
  let x = x0;
  while (x < x1 - 16) {
    const w = Math.min(r.range(19, 34), x1 - x);
    const h = r.range(hMin, hMax);
    const c = r.chance(0.13) ? EMBER.anchor : r.pick(EMBER.books);
    out.push({x, w, h, c, band: r.range(0.12, 0.26), band2: r.chance(0.45), label: r.chance(0.3)});
    x += w + (r.chance(0.18) ? r.range(2, 5) : 0);
  }
  return out;
}

const Books: React.FC<{x0: number; x1: number; base: number; hMin: number; hMax: number; seed: string; lean?: boolean; at?: At}> = ({x0, x1, base, hMin, hMax, seed, lean, at}) => {
  const row = bookRow(x0, lean ? x1 - 40 : x1, hMin, hMax, seed);
  let ink = '';
  const fills: React.ReactNode[] = [];
  row.forEach((bk, i) => {
    const y = base - bk.h;
    fills.push(<Fill key={`f${i}`} rect={[bk.x, y, bk.w, bk.h]} color={bk.c} at={fillAt(at, i * 0.01)} seed={`${seed}/${i}`} />);
    ink += rectInk(bk.x, y, bk.w, bk.h, {seed: `${seed}/r${i}`, over: 'small', edges: 'tlr'});
    ink += hline(bk.x + 2, bk.x + bk.w - 2, y + bk.h * bk.band, {seed: `${seed}/b${i}`, over: [1, 1]});
    if (bk.band2) ink += hline(bk.x + 2, bk.x + bk.w - 2, y + bk.h * (1 - bk.band * 0.7), {seed: `${seed}/c${i}`, over: [1, 1]});
    if (bk.label && bk.w > 22) ink += rectInk(bk.x + 5, y + bk.h * 0.42, bk.w - 10, bk.h * 0.16, {seed: `${seed}/l${i}`, over: [1, 2]});
  });
  let leanEl: React.ReactNode = null;
  if (lean) {
    const last = row[row.length - 1];
    const lx = last ? last.x + last.w + 2 : x0;
    const h = (hMin + hMax) / 2;
    const m: Pt[] = [
      [lx + 4, base],
      [lx + 32, base],
      [lx + 32 + h * 0.26, base - h * 0.97],
      [lx + 4 + h * 0.26, base - h * 0.97],
    ];
    leanEl = (
      <>
        <Fill d={polyPath(m)} color={EMBER.books[2]} at={fillAt(at, 0.1)} seed={`${seed}/lean`} />
        <Ink d={poly(m, {closed: true, seed: `${seed}/leanI`, over: 'small'})} at={b(at, 0.1)} width={W_THIN} />
      </>
    );
  }
  return (
    <>
      {fills}
      <Ink d={ink} at={at} width={W_THIN} />
      {leanEl}
    </>
  );
};

const Shelf: React.FC<{L: NookLayout; at?: At; seed: string}> = ({L, at, seed}) => {
  const S = L.shelf!;
  const upW = 24;
  const upX = S.x1 - upW - 10;
  const bottom = L.floorY ?? L.deskY;
  // the upright's ink breaks across the caption band (y 300-584 stays a flat field)
  const up =
    vline(upX, -30, 300, {over: [0, 0], seed: `${seed}/u1`}) +
    vline(upX + upW, -30, 300, {over: [0, 0], seed: `${seed}/u2`}) +
    vline(upX, 584, bottom, {over: [0, 0], seed: `${seed}/u3`}) +
    vline(upX + upW, 584, bottom, {over: [0, 0], seed: `${seed}/u4`});
  let boards = '';
  S.boards.forEach((y, i) => {
    boards += hline(-30, upX, y, {seed: `${seed}/bt${i}`, over: [0, 3]}) + hline(-30, upX, y + 16, {seed: `${seed}/bb${i}`, over: [0, 2]});
  });
  return (
    <>
      {S.books.map((bk, i) => (
        <Books key={i} x0={-14} x1={Math.min(bk.x1, upX - 4)} base={bk.base} hMin={bk.hMin} hMax={bk.hMax} lean={bk.lean} seed={`${seed}/c${i}`} at={b(at, 0.05 + i * 0.03)} />
      ))}
      {S.plant ? <Plant x={S.plant[0] - (150 - S.x1) * 0.5} y={S.plant[1]} at={b(at, 0.12)} seed={seed} /> : null}
      {S.boards.map((y, i) => (
        <Fill key={i} rect={[-30, y, upX + 30, 16]} color={EMBER.shelf} at={fillAt(at, 0.02)} seed={`${seed}/board${i}`} />
      ))}
      <Fill rect={[upX, -30, upW, bottom + 30]} color={EMBER.shelf} at={fillAt(at)} offset={false} />
      <Ink d={boards} at={b(at, 0.02)} width={W_MID} />
      <Ink d={up} at={at} width={W_MID} />
    </>
  );
};

/** A small potted plant on a shelf board (a sign of care). (x, y) = the pot's bottom centre. */
const Plant: React.FC<{x: number; y: number; at?: At; seed: string}> = ({x, y, at, seed}) => {
  const pot: Pt[] = [[x - 22, y - 44], [x + 22, y - 44], [x + 16, y], [x - 16, y]];
  const leaf = crown(x, y - 72, 30, 30, {seed: `${seed}/leaf`, bumps: 7, round: 0.7});
  return (
    <>
      <Fill d={polyPath(pot)} color={EMBER.pot} at={fillAt(at)} seed={`${seed}/pot`} />
      <Ink d={poly(pot, {closed: true, seed: `${seed}/potI`, over: 'small'})} at={at} width={W_THIN} />
      <Fill d={leaf} color={EMBER.leaf} at={fillAt(at, 0.04)} seed={`${seed}/leafF`} />
      <Ink d={leaf} at={b(at, 0.03)} width={W_THIN} open={0.3} />
    </>
  );
};

// ---------------------------------------------------------------- the window

const WindowView: React.FC<{L: NookLayout; frost: boolean; t: number; at?: At; seed: string; children?: React.ReactNode}> = ({L, frost, t, at, seed, children}) => {
  const id = 'nookglass' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = L.glass;
  const fb = 14;
  const fx0 = g.x - fb;
  const fy0 = g.y - fb;
  const fx1 = g.x + g.w + fb;
  const ox0 = fx0 - 22;
  const oy0 = fy0 - 26;
  const ox1 = fx1 + 30;
  const sill0 = L.sill.y;
  const sillBot = sill0 + L.sill.h;
  const reveal = [polyPath([[ox0, oy0], [ox1, oy0], [fx1, fy0], [fx0, fy0]]), polyPath([[ox0, oy0], [fx0, fy0], [fx0, sill0], [ox0, sill0]]), polyPath([[ox1, oy0], [ox1, sill0], [fx1, sill0], [fx1, fy0]])];
  const revealInk = rectInk(ox0, oy0, ox1 - ox0, sill0 - oy0, {seed: `${seed}/open`, edges: 'tlr', over: 'medium'}) + line(ox0, oy0, fx0, fy0, {over: [0, 2], seed: `${seed}/m1`}) + line(ox1, oy0, fx1, fy0, {over: [0, 2], seed: `${seed}/m2`});
  const frameD = rectInk(fx0, fy0, fx1 - fx0, sill0 - fy0, {seed: `${seed}/frame`, over: [0, 3], edges: 'tlr'}) + rectInk(g.x, g.y, g.w, g.h, {seed: `${seed}/glass`, over: [0, 2]});
  const mullD = rectInk(L.mullionX - 7, g.y, 14, g.h, {seed: `${seed}/mv`, over: [0, 0], edges: 'lr'}) + (L.transomY !== undefined ? rectInk(g.x, L.transomY - 7, g.w, 14, {seed: `${seed}/mh`, over: [0, 0], edges: 'tb'}) : '');
  // snow pile on the outside sill + frost in the bottom corners (the style frame's cold glass)
  const r = rng(`${seed}/sillsnow`);
  let snowPile = `M${g.x - 4} ${g.y + g.h + 4}L${g.x - 4} ${g.y + g.h - 12}`;
  for (let x = g.x - 4; x < g.x + g.w + 4; ) {
    const w = r.range(34, 70);
    const nx = Math.min(g.x + g.w + 4, x + w);
    snowPile += `Q${(x + nx) / 2} ${g.y + g.h - 12 - r.range(8, 16)} ${nx} ${g.y + g.h - 12 + r.jitter(2)}`;
    x = nx;
  }
  snowPile += `L${g.x + g.w + 4} ${g.y + g.h + 4}Z`;
  const frostD = [crown(g.x + 4, g.y + g.h - 4, 96, 58, {seed: `${seed}/fr1`, bumps: 8, round: 0.7}), crown(g.x + g.w - 4, g.y + g.h - 6, 84, 52, {seed: `${seed}/fr2`, bumps: 7, round: 0.7})];
  const star = (x: number, y: number, s: number) => line(x - s, y, x + s, y, {over: [0, 0], seed: `${seed}/s${x}a`}) + line(x - s * 0.5, y - s * 0.86, x + s * 0.5, y + s * 0.86, {over: [0, 0], seed: `${seed}/s${x}b`}) + line(x + s * 0.5, y - s * 0.86, x - s * 0.5, y + s * 0.86, {over: [0, 0], seed: `${seed}/s${x}c`});
  void t;
  return (
    <>
      {reveal.map((d, i) => (
        <Fill key={i} d={d} color={EMBER.reveal} at={fillAt(at)} offset={false} />
      ))}
      <Ink d={revealInk} at={at} width={W_MID} />
      <Fill rect={[fx0, fy0, fx1 - fx0, sill0 - fy0]} color={EMBER.trim} at={fillAt(at, 0.02)} offset={false} seed={`${seed}/frameF`} />
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={g.x} y={g.y} width={g.w} height={g.h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Fill rect={[g.x, g.y, g.w, g.h]} color={EMBER.sky} at={fillAt(at, 0.03)} offset={false} mode="snap" />
        {children}
        {frost ? (
          <>
            {frostD.map((d, i) => (
              <Fill key={i} d={d} color={EMBER.frost} at={fillAt(at, 0.08)} offset={false} />
            ))}
            <Fill d={snowPile} color={EMBER.snow} at={fillAt(at, 0.08)} offset={false} />
            {isClean() ? null : <Ink d={star(g.x + 40, g.y + g.h - 34, 8) + star(g.x + 88, g.y + g.h - 18, 5) + star(g.x + g.w - 36, g.y + g.h - 32, 7)} at={b(at, 0.2)} width={W_HAIR} />}
          </>
        ) : null}
      </g>
      <Fill rect={[L.mullionX - 7, g.y, 14, g.h]} color={EMBER.trim} at={fillAt(at, 0.04)} offset={false} />
      {L.transomY !== undefined ? <Fill rect={[g.x, L.transomY - 7, g.w, 14]} color={EMBER.trim} at={fillAt(at, 0.04)} offset={false} /> : null}
      <Ink d={frameD} at={b(at, 0.02)} width={W_MID} />
      <Ink d={mullD} at={b(at, 0.06)} width={W_THIN} />
      <Fill d={blob(L.mullionX, g.y + g.h * 0.46, 7, 9, {seed: `${seed}/latch`})} color={EMBER.anchor} at={fillAt(at, 0.1)} offset={false} />
      {/* the inside sill */}
      <Fill rect={[ox0 - L.sill.over + 22, sill0, ox1 - ox0 + (L.sill.over - 22) * 2, 12]} color={EMBER.sillTop} at={fillAt(at, 0.04)} seed={`${seed}/sillT`} />
      <Fill rect={[ox0 - L.sill.over + 22, sill0 + 12, ox1 - ox0 + (L.sill.over - 22) * 2, sillBot - sill0 - 12]} color={EMBER.sillFront} at={fillAt(at, 0.05)} seed={`${seed}/sillF`} />
      <Ink
        d={hline(ox0 - L.sill.over + 22, ox1 + L.sill.over - 22, sill0, {seed: `${seed}/sl1`, over: 'medium'}) + hline(ox0 - L.sill.over + 22, ox1 + L.sill.over - 22, sill0 + 12, {seed: `${seed}/sl2`, over: 'small'}) + hline(ox0 - L.sill.over + 22, ox1 + L.sill.over - 22, sillBot, {seed: `${seed}/sl3`, over: 'small'})}
        at={b(at, 0.04)}
        width={W_MID}
      />
    </>
  );
};

// ---------------------------------------------------------------- desk, pool, lamp, mug, notebook

const Desk: React.FC<{L: NookLayout; lampOn: boolean; at?: At; seed: string}> = ({L, lampOn, at, seed}) => {
  const {x0, x1, depth} = L.desk;
  const P = L.pool;
  const top = L.deskY;
  const isTable = depth !== undefined;
  const bottom = isTable ? top + depth : 2200;
  return (
    <>
      <Fill rect={[x0, top, x1 - x0, bottom - top]} color={EMBER.desk} at={fillAt(at)} offset={false} />
      {isTable ? (
        <>
          <Fill rect={[x0, bottom, x1 - x0, 24]} color={EMBER.beam} at={fillAt(at, 0.03)} seed={`${seed}/apron`} />
          <Fill rect={[x0 + 26, bottom + 24, 22, (L.floorY ?? bottom + 300) - bottom - 24]} color={EMBER.beam} at={fillAt(at, 0.05)} seed={`${seed}/leg`} />
          <Ink d={rectInk(x0, top, x1 - x0, depth + 24, {seed: `${seed}/tbl`, over: 'medium', edges: 'tlb'}) + hline(x0, x1, bottom, {seed: `${seed}/tblE`, over: [0, 0]}) + vline(x0 + 26, bottom + 24, L.floorY ?? bottom + 300, {seed: `${seed}/l1`, over: [0, 0]}) + vline(x0 + 48, bottom + 24, L.floorY ?? bottom + 300, {seed: `${seed}/l2`, over: [0, 0]})} at={at} width={W_MID} />
        </>
      ) : (
        <>
          <Ink d={hline(-60, 1140, top, {seed: `${seed}/deskE`, over: 'structural'})} at={at} width={W_MID} />
          <Ink d={line(40, top + 380, 300, top + 386, {seed: `${seed}/gr1`, over: [0, 0]}) + line(120, top + 510, 420, top + 517, {seed: `${seed}/gr2`, over: [0, 0]}) + line(30, top + 650, 210, top + 654, {seed: `${seed}/gr3`, over: [0, 0]})} at={b(at, 0.1)} width={W_THIN} />
        </>
      )}
      {lampOn ? (
        <>
          <Fill d={blob(P.cx, P.cy, P.rx, P.ry, {seed: `${seed}/pool1`, wobble: 0.02})} color={EMBER.ring} at={fillAt(at, 0.1)} offset={false} />
          <Fill d={blob(P.cx - 6, P.cy - 4, P.rx * 0.6, P.ry * 0.6, {seed: `${seed}/pool2`, wobble: 0.025})} color={EMBER.core} at={fillAt(at, 0.13)} offset={false} />
        </>
      ) : null}
    </>
  );
};

/** The anglepoise lamp: anchor-dark rod and shade, the lit mouth in the pool's core colour. Exported for S7/S16
 *  (the shade cut by the left edge). */
const LampBody: React.FC<{pose: LampPose; lit?: boolean; at?: At; seed?: string}> = ({pose, lit = true, at, seed = 'lamp'}) => {
  const {base, elbow, head, rot, scale = 1} = pose;
  const s = scale;
  const rodD = `M${base[0]} ${base[1] - 10}L${elbow[0]} ${elbow[1]}L${head[0]} ${head[1]}`;
  const shadeD = `M${-24 * s} 0Q0 ${-16 * s} ${24 * s} 0L${72 * s} ${100 * s}L${-72 * s} ${100 * s}Z`;
  return (
    <>
      <Fill d={blob(base[0], base[1], 56 * s, 15 * s, {seed: `${seed}/lb`})} color={EMBER.anchor} at={fillAt(at)} />
      <Ink d={ellipse(base[0], base[1], 56 * s, 15 * s, {seed: `${seed}/lbI`})} at={at} width={W_MID} />
      <Ink d={rodD} at={b(at, 0.03)} width={11 * s} color={EMBER.anchor} taper={false} />
      <Ink d={line(base[0] + 12 * s, base[1] - 30 * s, elbow[0] + 12 * s, elbow[1] + 22 * s, {over: [0, 0], seed: `${seed}/spring`})} at={b(at, 0.08)} width={W_HAIR} />
      <Fill d={blob(elbow[0], elbow[1], 11 * s, 11 * s, {seed: `${seed}/el`})} color={EMBER.anchor} at={fillAt(at, 0.03)} />
      <Ink d={circle(elbow[0], elbow[1], 11 * s, {seed: `${seed}/elI`})} at={b(at, 0.05)} width={W_THIN} />
      <XG m={mat.compose(mat.translate(head[0], head[1]), mat.rotate(rot))}>
        <Fill d={shadeD} color={EMBER.anchor} at={fillAt(at, 0.04)} offset={[1.5, 1]} />
        <Ink d={poly([[-24 * s, 0], [-72 * s, 100 * s]], {seed: `${seed}/sh1`}) + poly([[24 * s, 0], [72 * s, 100 * s]], {seed: `${seed}/sh2`}) + `M${-24 * s} 0Q0 ${-16 * s} ${24 * s} 0`} at={b(at, 0.04)} width={W_MID} />
        <Fill d={blob(0, 100 * s, 72 * s, 16 * s, {seed: `${seed}/mouth`})} color={lit ? EMBER.core : EMBER.anchor} at={fillAt(at, 0.08)} offset={false} />
        <Ink d={ellipse(0, 100 * s, 72 * s, 16 * s, {seed: `${seed}/mouthI`})} at={b(at, 0.06)} width={W_MID} />
        <Fill d={blob(0, -10 * s, 9 * s, 8 * s, {seed: `${seed}/knob`})} color={EMBER.anchor} at={fillAt(at, 0.06)} offset={false} />
      </XG>
    </>
  );
};
export const Lamp = tiered('environment', {tone: EMBER.anchor}, LampBody);

/** The steaming mug (a sign of care; steam = a small slow loop). (x, top) = its left side and rim. `steam={false}` drops
 *  the ink steam lines (S13: ink lines over the navy glass read as wires; the lane draws light puffs instead). */
const MugBody: React.FC<{x: number; top: number; t?: number; at?: At; seed?: string; w?: number; steam?: boolean}> = ({x, top, t: tIn, at, seed = 'mug', w = 98, steam: steamOn = true}) => {
  const tNow = useTime();
  const t = tIn ?? tNow;
  const x0 = x;
  const x1 = x + w;
  const bot = top + w * 1.14;
  const body = `M${x0} ${top}L${x0} ${bot - 18}Q${x0} ${bot} ${x0 + 18} ${bot}L${x1 - 18} ${bot}Q${x1} ${bot} ${x1} ${bot - 18}L${x1} ${top}Z`;
  const steam = (sx: number, ph: number) => {
    const pts: Pt[] = [];
    for (let i = 0; i <= 5; i++) pts.push([sx + Math.sin(i * 1.3 + ph + t * 1.6) * 8, top - 18 - i * 22]);
    return smooth(pts);
  };
  return (
    <>
      <Ink d={`M${x1 - 2} ${top + 22}C${x1 + 44} ${top + 18} ${x1 + 44} ${top + 84} ${x1 - 2} ${top + 80}`} at={b(at, 0.1)} width={15} color={EMBER.mug} taper={false} />
      <Ink d={`M${x1 - 2} ${top + 14}C${x1 + 54} ${top + 10} ${x1 + 54} ${top + 92} ${x1 - 2} ${top + 88}`} at={b(at, 0.08)} width={W_THIN} />
      <Fill d={body} color={EMBER.mug} at={fillAt(at)} seed={`${seed}/m`} />
      <Fill rect={[x0, top + 40, x1 - x0, 18]} color={EMBER.mugBand} at={fillAt(at, 0.03)} offset={false} />
      <Ink d={line(x0, top, x0, bot - 14, {over: [0, 0], seed: `${seed}/mg1`}) + line(x1, top, x1, bot - 14, {over: [0, 0], seed: `${seed}/mg2`}) + `M${x0} ${bot - 18}Q${x0} ${bot} ${x0 + 18} ${bot}L${x1 - 18} ${bot}Q${x1} ${bot} ${x1} ${bot - 18}`} at={at} width={W_MID} />
      <Fill d={blob((x0 + x1) / 2, top, (x1 - x0) / 2, 11, {seed: `${seed}/rim`})} color={EMBER.anchor} at={fillAt(at, 0.04)} offset={false} />
      <Ink d={ellipse((x0 + x1) / 2, top, (x1 - x0) / 2, 11, {seed: `${seed}/rimI`})} at={b(at, 0.04)} width={W_MID} />
      {steamOn && !isClean() && (at === undefined || tNow >= at + 0.3) ? <Ink d={steam(x0 + w * 0.33, 0) + steam(x0 + w * 0.67, 2.1)} width={W_THIN} /> : null}
    </>
  );
};
export const Mug = tiered('environment', {tone: EMBER.mug}, MugBody);

/** An open notebook + pencil in the foreground, cut by the left edge (POV, bottom left). */
const NotebookBody: React.FC<{at?: At; seed?: string; dy?: number}> = ({at, seed = 'nb', dy = 0}) => {
  const o = (p: Pt[]): Pt[] => p.map(([x, y]) => [x, y + dy]);
  const L = o([[-60, 1600], [150, 1580], [160, 1830], [-50, 1850]]);
  const R = o([[150, 1580], [352, 1606], [348, 1852], [160, 1830]]);
  const pencil = o([[60, 1906], [330, 1722], [344, 1740], [76, 1924]]);
  const tip = o([[330, 1722], [372, 1704], [344, 1740]]);
  return (
    <>
      <Fill d={polyPath(o([[-64, 1594], [356, 1600], [352, 1860], [-54, 1858]]))} color={EMBER.books[4]} at={fillAt(at)} seed={`${seed}/c`} />
      <Fill d={polyPath(L)} color={EMBER.paper} at={fillAt(at, 0.02)} seed={`${seed}/l`} />
      <Fill d={polyPath(R)} color={EMBER.paper} at={fillAt(at, 0.03)} seed={`${seed}/r`} />
      <Ink d={poly(L, {closed: true, seed: `${seed}/lI`, over: 'small'}) + poly(R, {closed: true, seed: `${seed}/rI`, over: 'small'})} at={at} width={W_MID} />
      <Fill d={polyPath(pencil)} color={EMBER.books[0]} at={fillAt(at, 0.06)} seed={`${seed}/pen`} />
      <Fill d={polyPath(tip)} color={EMBER.paper} at={fillAt(at, 0.07)} offset={false} />
      <Ink d={poly(pencil, {closed: true, seed: `${seed}/penI`, over: 'small'}) + poly(tip, {closed: true, seed: `${seed}/tipI`, over: [0, 0]})} at={b(at, 0.06)} width={W_MID} />
    </>
  );
};
export const Notebook = tiered('environment', {tone: EMBER.paper}, NotebookBody);
