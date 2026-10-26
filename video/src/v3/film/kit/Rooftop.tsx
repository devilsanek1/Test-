// kit/Rooftop.tsx: OUR roof and the town below it, for the S5 pull-back (S9): the warm brick stack (where the landmark
// will land, then the left frame), the chimney pot that crosses the lens (the flat mass that hides the hand-over), the
// mid town (snowy roofs with chimneys and lit windows, a lit STREET running away from our parapet to the data
// center) and our roof deck (warm planks converging on you). All in canvas px at the size they are authored (end
// frame of the pull-back); draw them inside a <PullLayer> with `exact` fills when they are shown bigger.
// Cold read of the monochrome board (v3 G3): a bright wedge read as a SPOTLIGHT and a zigzag roofline as TORN PAPER,
// so the street is a mid-tone road with lamps, lamp pools and lit windows along it (no cone), and every roofline is
// houses (gables, snow caps, chimneys, lit windows).

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, ellipse, hline, line, poly, polyPath, smooth, vline} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt} from './util';
import {TownBand, type HouseSpec} from './Outside';

// ---------------------------------------------------------------- the brick stack

export type BrickStackProps = {
  /** Left x and the top of the cap (canvas px); w wide, h tall (cap included). */
  x: number;
  y: number;
  w: number;
  h: number;
  /** Cap (corbel) height (default 0.07 w). The cap overhangs 4 % each side and carries a snow line. */
  capH?: number;
  /** Chimney pots on the cap: centres as fractions of w (default none). */
  pots?: number[];
  /** Pot width (default 0.14 w). */
  potW?: number;
  /** Body and shade colours (default warm brick: ours; the town's stacks pass EMBER.roofs / EMBER.dcSide). */
  color?: string;
  shade?: string;
  /** Brick ticks (default by area). */
  bricks?: number;
  exact?: boolean;
  at?: At;
  seed?: string;
  ink?: number;
};

/** A chimney stack: brick body with a shade side, a corbelled cap with snow, optional terracotta pots. */
export const BrickStack: React.FC<BrickStackProps> = ({x, y, w, h, capH = w * 0.07, pots = [], potW = w * 0.14, color = EMBER.brick, shade = EMBER.brickShade, bricks, exact, at, seed = 'stack', ink = 3.4}) => {
  const off = exact ? false : undefined;
  const o = w * 0.04;
  const bodyTop = y + capH;
  const r = rng(`stack/${seed}`);
  // brick ticks: short marks in staggered courses (a few, not a pattern)
  const course = Math.max(8, w * 0.075);
  const n = bricks ?? Math.round(((h - capH) / course) * 1.4);
  let ticks = '';
  for (let i = 0; i < n; i++) {
    const row = Math.floor(r.range(1, (h - capH) / course));
    const by = bodyTop + row * course;
    const bx = x + r.range(0.06, 0.7) * w;
    const len = w * r.range(0.1, 0.2);
    ticks += line(bx, by, bx + len, by, {over: [0, 0], seed: `${seed}/t${i}`});
    if (r.chance(0.5)) ticks += line(bx + len * 0.5, by, bx + len * 0.5, by + course, {over: [0, 0], seed: `${seed}/v${i}`});
  }
  const ph = potW * 1.25;
  const potTop = y - capH * 0.3 - ph;
  return (
    <>
      {pots.map((u, i) => {
        const cx = x + u * w;
        const rim: [number, number, number, number] = [cx - potW * 0.6, potTop, potW * 1.2, ph * 0.22];
        const body: Pt[] = [[cx - potW * 0.46, potTop + ph * 0.2], [cx + potW * 0.46, potTop + ph * 0.2], [cx + potW * 0.5, y], [cx - potW * 0.5, y]];
        return (
          <React.Fragment key={i}>
            <Fill d={polyPath(body)} color={EMBER.pot} at={fillAt(at, 0.04)} offset={off} seed={`${seed}/p${i}`} />
            <Fill rect={rim} color={EMBER.pot} at={fillAt(at, 0.05)} offset={off} seed={`${seed}/pr${i}`} />
            <Fill rect={[cx + potW * 0.14, potTop + ph * 0.22, potW * 0.32, ph * 0.78]} color={EMBER.brick} at={fillAt(at, 0.05)} offset={false} />
            <Fill d={blob(cx, potTop - ph * 0.02, potW * 0.56, ph * 0.08, {seed: `${seed}/ps${i}`})} color={EMBER.snow} at={fillAt(at, 0.07)} offset={false} />
            <Ink d={poly(body, {seed: `${seed}/pI${i}`, over: [0, 2]}) + poly([[rim[0], rim[1] + rim[3]], [rim[0], rim[1]], [rim[0] + rim[2], rim[1]], [rim[0] + rim[2], rim[1] + rim[3]]], {seed: `${seed}/prI${i}`, over: [0, 1]})} at={b(at, 0.04)} width={ink * 0.8} />
          </React.Fragment>
        );
      })}
      <Fill rect={[x, bodyTop, w, h - capH]} color={color} at={fillAt(at)} offset={off} seed={`${seed}/body`} />
      <Fill rect={[x + w * 0.84, bodyTop, w * 0.16, h - capH]} color={shade} at={fillAt(at, 0.02)} offset={false} />
      <Fill rect={[x, bodyTop, w, Math.max(3, capH * 0.35)]} color={shade} at={fillAt(at, 0.02)} offset={false} />
      <Fill rect={[x - o, y, w + o * 2, capH]} color={shade} at={fillAt(at, 0.03)} offset={off} seed={`${seed}/cap`} />
      <Fill d={blob(x + w / 2, y - capH * 0.08, w / 2 + o + 2, capH * 0.36, {seed: `${seed}/snow`, wobble: 0.01})} color={EMBER.snow} at={fillAt(at, 0.06)} offset={false} />
      <Ink d={ticks} at={b(at, 0.12)} width={1.8} color={shade} />
      <Ink d={vline(x, bodyTop, y + h, {over: [0, 0], seed: `${seed}/l`}) + vline(x + w, bodyTop, y + h, {over: [0, 0], seed: `${seed}/r`}) + poly([[x - o, y + capH], [x - o, y], [x + w + o, y], [x + w + o, y + capH], [x - o, y + capH]], {seed: `${seed}/c`, over: [1, 3]})} at={at} width={ink} />
    </>
  );
};

// ---------------------------------------------------------------- the chimney pot that crosses the lens

/** A chimney pot right at the lens: ONE flat soft mass (no ink, two flat values: a rolled rim one step lighter), wider
 *  than the frame, its rim at y. Screen px; the scene moves x (S5: up to ~90 px per 60 fps frame, the only layer
 *  allowed that speed). */
export const ChimneyPot: React.FC<{x: number; y: number; w: number; color?: string; rim?: string; seed?: string}> = ({x, y, w, color = EMBER.brickShade, rim = EMBER.brick, seed = 'cpot'}) => {
  const rimH = w * 0.07;
  const rimD = smooth([[x, y + rimH], [x + w * 0.01, y + rimH * 0.3], [x + w * 0.08, y], [x + w * 0.5, y - rimH * 0.12], [x + w * 0.92, y], [x + w * 0.99, y + rimH * 0.3], [x + w, y + rimH], [x + w * 0.5, y + rimH * 1.08]], {closed: true});
  const body = polyPath([[x + w * 0.05, y + rimH * 0.8], [x + w * 0.95, y + rimH * 0.8], [x + w * 0.94, y + 2600], [x + w * 0.06, y + 2600]]);
  return (
    <>
      <Fill d={body} color={color} offset={false} seed={`${seed}/b`} />
      <Fill d={rimD} color={rim} offset={false} seed={`${seed}/r`} />
    </>
  );
};

// ---------------------------------------------------------------- the mid town with the lit street

/** The street as a wedge: its curbs at the bottom (yB: xBL..xBR) and at the top (yT: xTL..xTR), running away from us. */
export type StreetSpec = {yB: number; yT: number; xBL: number; xBR: number; xTL: number; xTR: number};

/** The street's curb x at height y (left, right). */
export const streetAt = (s: StreetSpec, y: number): [number, number] => {
  const u = (s.yB - y) / (s.yB - s.yT);
  return [s.xBL + (s.xTL - s.xBL) * u, s.xBR + (s.xTR - s.xBR) * u];
};

export type MidTownProps = {
  x0: number;
  x1: number;
  /** House rows back to front: ground line y and house width (nearer rows lower and bigger). */
  rows: {y: number; w: number}[];
  street: StreetSpec;
  /** Lamps per curb (default 5). */
  lamps?: number;
  /** Tall chimney stacks (town colours) that frame one side: left x, top y, width (they run down past the rows). */
  stacks?: {x: number; y: number; w: number; pots?: number[]}[];
  /** The ground between the rows (default EMBER.dc: snow in the blue-hour shade, so the snow caps, the lit windows and
   *  the lamps carry the light). */
  ground?: string;
  exact?: boolean;
  at?: At;
  seed?: string;
};

/** The mid roofs: rows of snow-capped houses with chimneys and lit windows (TownBand houses), a lit street between
 *  them (a trodden road with lamp posts, small warm lamp pools and the lit windows of the houses that line it), and
 *  optional chimney stacks. */
export const MidTown: React.FC<MidTownProps> = ({x0, x1, rows, street: st, lamps = 5, stacks = [], ground = EMBER.dc, exact, at, seed = 'mid'}) => {
  const r = rng(`midtown/${seed}`);
  const off = exact ? false : undefined;
  const top = Math.min(...rows.map((rw) => rw.y)) - 6;
  // the rows: houses left to right, leaving the street open at the row's ground line
  const rowHouses: HouseSpec[][] = rows.map((rw) => {
    const [cl, cr] = streetAt(st, rw.y);
    const list: HouseSpec[] = [];
    // left of the street, from the curb outward (so the house at the curb is flush with it)
    let x = cl - rw.w * 0.06;
    while (x > x0 - rw.w) {
      const w = rw.w * r.range(0.86, 1.14);
      list.push({x: x - w, w, h: w * r.range(0.5, 0.8), lit: list.length === 0 || r.chance(0.7), chimney: r.chance(0.55)});
      x -= w + rw.w * r.range(0.06, 0.3);
    }
    x = cr + rw.w * 0.06;
    let first = true;
    while (x < x1) {
      const w = rw.w * r.range(0.86, 1.14);
      list.push({x, w, h: w * r.range(0.5, 0.8), lit: first || r.chance(0.7), chimney: r.chance(0.55)});
      first = false;
      x += w + rw.w * r.range(0.06, 0.3);
    }
    return list;
  });
  // lamps along both curbs, closer together toward the far end
  const lampEls: React.ReactNode[] = [];
  const width = (y: number) => {
    const [l, rr] = streetAt(st, y);
    return rr - l;
  };
  const wB = st.xBR - st.xBL;
  for (let i = 0; i < lamps; i++) {
    const u = 1 - Math.pow(0.7, i + 0.6); // 0.19 .. ~0.85 along the street
    const y = st.yB - u * (st.yB - st.yT);
    const [l, rr] = streetAt(st, y);
    const k = width(y) / wB; // perspective scale
    // tall enough to stand clear of the street-front roofs, so each reads as a STREET LAMP (v3 cold read: short dark posts
    // vanished against the house fronts and the bare pools read as "a dotted path")
    const postH = 80 * k + 8;
    const headR = Math.max(3.4, 10 * k);
    const postW = Math.max(2, 4.4 * k);
    // posts stand on the snow banks just outside the curbs; the arm reaches over the road; a small warm pool under it
    for (const [side, cx] of [[-1, l - 7 * k], [1, rr + 7 * k]] as const) {
      const poolRx = Math.max(3, width(y) * 0.13);
      const hx = cx - side * 16 * k;
      const hy = y - postH + 4 * k;
      lampEls.push(
        <React.Fragment key={`${i}${side}`}>
          <Fill d={ellipse(hx - side * poolRx * 0.2, y + 3 * k, poolRx, Math.max(1.6, poolRx * 0.28), {seed: `${seed}/pool${i}${side}`})} color={EMBER.houseLit} at={fillAt(at, 0.1)} offset={false} />
          {/* a snow-lit edge on the post (a flat light line beside the dark one), so it reads against the house fronts */}
          <Ink d={vline(cx - side * postW * 0.75, y, y - postH + 2 * k, {over: [0, 0], seed: `${seed}/postL${i}${side}`})} at={b(at, 0.1)} width={Math.max(1.2, postW * 0.6)} color={EMBER.snow} taper={false} />
          <Ink d={vline(cx, y, y - postH, {over: [0, 0], seed: `${seed}/post${i}${side}`}) + line(cx, y - postH, hx, y - postH + 2 * k, {over: [0, 0], seed: `${seed}/arm${i}${side}`})} at={b(at, 0.1)} width={postW} color={EMBER.anchor} taper={false} />
          {/* the lamp: a warm halo disc around a bright core (flat steps, no gradient) */}
          <Fill d={blob(hx, hy, headR * 1.9, headR * 1.6, {seed: `${seed}/halo${i}${side}`})} color={EMBER.houseLit} at={fillAt(at, 0.12)} offset={false} />
          <Fill d={blob(hx, hy, headR, headR * 0.8, {seed: `${seed}/lamp${i}${side}`})} color={EMBER.core} at={fillAt(at, 0.12)} offset={false} />
        </React.Fragment>,
      );
    }
  }
  const road: Pt[] = [[st.xBL, st.yB], [st.xBR, st.yB], [st.xTR, st.yT], [st.xTL, st.yT]];
  // snow banks along both curbs (thin light strips), the road itself dark between them
  const bank = (side: -1 | 1): Pt[] => {
    const [bx, tx] = side < 0 ? [st.xBL, st.xTL] : [st.xBR, st.xTR];
    const bw = wB * 0.07;
    return [[bx, st.yB], [bx - side * bw, st.yB], [tx - side * 1, st.yT], [tx, st.yT]];
  };
  return (
    <>
      <Fill rect={[x0, top, x1 - x0, st.yB - top + 400]} color={ground} at={fillAt(at)} offset={false} seed={`${seed}/ground`} />
      <Fill d={polyPath(road)} color={EMBER.dcSide} at={fillAt(at, 0.02)} offset={off} seed={`${seed}/road`} />
      <Fill d={polyPath(bank(-1))} color={EMBER.snow} at={fillAt(at, 0.03)} offset={false} />
      <Fill d={polyPath(bank(1))} color={EMBER.snow} at={fillAt(at, 0.03)} offset={false} />
      <Ink d={poly([[st.xBL, st.yB], [st.xTL, st.yT]], {seed: `${seed}/cl`, over: [0, 0]}) + poly([[st.xBR, st.yB], [st.xTR, st.yT]], {seed: `${seed}/cr`, over: [0, 0]})} at={b(at, 0.05)} width={1.6} />
      {rows.map((rw, i) => (
        <TownBand key={i} y={rw.y} houses={rowHouses[i]} far={false} at={b(at, 0.04 * i)} seed={`${seed}/row${i}`} />
      ))}
      {lampEls}
      {stacks.map((s, i) => (
        <BrickStack key={i} x={s.x} y={s.y} w={s.w} h={st.yB - s.y + 200} pots={s.pots} color={EMBER.roofs} shade={EMBER.dcSide} bricks={0} exact={exact} at={b(at, 0.1)} seed={`${seed}/stack${i}`} ink={2.2} />
      ))}
    </>
  );
};

// ---------------------------------------------------------------- our roof deck

export type RoofDeckProps = {
  /** The deck's far edge (the parapet's foot) and its extent. */
  y: number;
  x0: number;
  x1: number;
  h: number;
  /** Where the plank lines converge (you, at the parapet). */
  vp: Pt;
  /** Plank lines (default 9). */
  planks?: number;
  exact?: boolean;
  at?: At;
  seed?: string;
};

/** OUR roof deck: warm terracotta planks whose seams converge toward a point beyond the parapet (they lead to you), a snow drift along the parapet's foot, a few snow patches. */
export const RoofDeck: React.FC<RoofDeckProps> = ({y, x0, x1, h, vp, planks = 9, exact, at, seed = 'deck'}) => {
  const off = exact ? false : undefined;
  const r = rng(`deck/${seed}`);
  let d = '';
  for (let i = 0; i < planks; i++) {
    const xb = x0 + ((i + 0.5) / planks) * (x1 - x0);
    const yb = y + h;
    // from the bottom edge to vp (on the deck: your feet), or to the deck's far edge when vp lies beyond it
    const u = vp[1] >= y ? 1 : (yb - y) / (yb - vp[1]);
    d += line(xb, yb, xb + (vp[0] - xb) * u, yb + (vp[1] - yb) * u, {over: [0, 0], seed: `${seed}/p${i}`});
  }
  const drift = smooth([[x0, y - 2], [x1, y - 2], [x1, y + 10], [(x0 + x1) * 0.62, y + 14], [(x0 + x1) * 0.4, y + 9], [x0, y + 13]], {closed: true});
  const patches: React.ReactNode[] = [];
  for (let i = 0; i < 5; i++) {
    const px = r.range(x0 + 60, x1 - 60);
    const py = y + r.range(0.25, 0.9) * h;
    patches.push(<Fill key={i} d={blob(px, py, r.range(24, 50), r.range(5, 9), {seed: `${seed}/sp${i}`})} color={EMBER.snow} at={fillAt(at, 0.08)} offset={false} />);
  }
  return (
    <>
      <Fill rect={[x0, y, x1 - x0, h]} color={EMBER.desk} at={fillAt(at)} offset={off} seed={`${seed}/floor`} />
      <Ink d={d} at={b(at, 0.06)} width={1.6} color={EMBER.beam} />
      {patches}
      <Fill d={drift} color={EMBER.snow} at={fillAt(at, 0.06)} offset={false} />
      <Ink d={hline(x0, x1, y + 12, {over: [0, 0], seed: `${seed}/dI`})} at={b(at, 0.06)} width={1.4} color={EMBER.frost} />
    </>
  );
};
