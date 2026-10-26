// kit/Room.tsx: the home base's dressing (docs/v3/density_plan_g5b.md: O1, S7, S8, S12, S13, S15, S16): shelves of
// varied books and objects, plants (a trailing pothos that sways), warm string lights that twinkle, a pinboard whose
// notes flutter, framed prints and posters, desk clutter at two depths (pen cup, headphones, book stacks, sticky notes,
// a charger cable, glasses, a speaker), wood grain and plaster hints, and S13's radiator, rug, coat hook, tote bag
// and slippers. Every piece: canvas-px geometry, a seed, an optional build `at` (ink first, fills FILL_LAG later),
// its own idle motion by time (no opacity), ink by depth (mid 3.4 by default; hair 1.6 for details).
//
//   <ShelfFill planks={[{x0: -10, x1: 140, y: 720, room: 120}, ...]} seed="o1shelf" />
//   <Plant x={120} y={660} kind="pothos" size={110} trail={220} />      <Plant kind="succulent" x={600} y={1060} size={60} />
//   <StringLights3 from={[-20, 120]} to={[1100, 200]} sag={60} n={10} onAt={0.3} />
//   <Pinboard x={180} y={620} w={290} h={220} seed="desk" flutterAt={[16.7]} />
//   <PenCup x={840} y={1090} />  <Headphones x={170} y={1095} w={150} />  <BookStack x={780} y={1095} w={120} n={2} />
//   <Cable points={[[560, 1500], [620, 1700], [540, 1940]]} plug />    <DeskGrain x={0} y={1100} w={1080} h={800} />

import React, {useMemo} from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, crown, ellipse, line, poly, polyPath, rect as rectInk, roundRect, smooth, wallTicks} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt, Show, Txt, W} from './util';
import {rings, sway, sway2, twinkle} from './idle';
import {Steam} from './Weather';

/** The plant greens: the palette's leaf and one flat step lighter (leaves alternate). */
export const LEAF2 = '#5B7A50';
/** A desk-grain / plaster stroke colour: one flat step under the desk / the wall. */
const GRAIN = '#C47E5A';
const PLASTER = EMBER.reveal;

/** A filled box with hand ink (the house rect strokes that overshoot a little). */
const Box: React.FC<{x: number; y: number; w: number; h: number; color: string; at?: At; seed: string; ink?: number; over?: number | [number, number]; offset?: boolean}> = ({x, y, w, h, color, at, seed, ink = W.mid, over = 2, offset}) => (
  <>
    <Fill rect={[x, y, w, h]} color={color} at={fillAt(at)} seed={`${seed}/f`} offset={offset === false ? false : undefined} />
    {ink > 0 ? <Ink d={rectInk(x, y, w, h, {seed: `${seed}/i`, over})} at={at} width={ink} /> : null}
  </>
);

// ---------------------------------------------------------------- books and shelves

export type Plank = {
  /** Shelf top extent (books stand on y). */
  x0: number;
  x1: number;
  y: number;
  /** Clear height above the plank (px; default 150). */
  room?: number;
};

export type ShelfFillProps = {
  planks: Plank[];
  /** Size factor (1 = books 14-40 wide x 80-150 tall: the O1 / S13 shelf). */
  scale?: number;
  seed?: string;
  /** Objects mixed in (default all): a framed photo, a jar, a small plant, lying stacks, a trailing plant at one end. */
  photo?: boolean;
  jar?: boolean;
  plant?: boolean;
  trailing?: boolean;
  at?: At;
  ink?: number;
};

/** Varied books (5+ colours, 14-40 wide, 80-150 tall, upright, leaning and in lying stacks) with a framed photo, a jar,
 *  a small plant and a trailing pothos over one plank's lip. Never a stamped row. */
export const ShelfFill: React.FC<ShelfFillProps> = ({planks, scale = 1, seed = 'shelf', photo = true, jar = true, plant = true, trailing = true, at, ink = W.mid}) => {
  const items = useMemo(() => {
    const r = rng(`shelfF/${seed}`);
    const out: React.ReactNode[] = [];
    const used = {photo: false, jar: false, plant: false, trail: false};
    planks.forEach((pk, pi) => {
      const room = pk.room ?? 150;
      let x = pk.x0 + r.range(2, 8) * scale;
      let lastC = -1;
      let k = 0;
      while (x < pk.x1 - 10 * scale && k < 60) {
        k++;
        const roll = r.next();
        const left = pk.x1 - x;
        if (photo && !used.photo && pi === Math.min(1, planks.length - 1) && roll < 0.25 && left > 70 * scale) {
          used.photo = true;
          const fw = r.range(48, 64) * scale;
          const fh = Math.min(room * 0.7, fw * 1.25);
          out.push(<PhotoFrame key={`ph${pi}_${k}`} x={x} y={pk.y - fh} w={fw} h={fh} seed={`${seed}/ph`} at={b(at, 0.1)} ink={ink} />);
          x += fw + r.range(4, 10) * scale;
          continue;
        }
        if (jar && !used.jar && roll < 0.36 && left > 50 * scale && pi >= 1) {
          used.jar = true;
          const jw = r.range(34, 44) * scale;
          out.push(<Jar key={`j${pi}_${k}`} x={x} y={pk.y} w={jw} h={Math.min(room * 0.6, jw * 1.4)} seed={`${seed}/jar`} at={b(at, 0.14)} ink={ink} />);
          x += jw + r.range(4, 9) * scale;
          continue;
        }
        if (plant && !used.plant && roll < 0.46 && left > 54 * scale) {
          used.plant = true;
          out.push(<Plant key={`pl${pi}_${k}`} x={x + 24 * scale} y={pk.y} kind="succulent" size={46 * scale} seed={`${seed}/pl`} at={b(at, 0.16)} ink={ink} />);
          x += 52 * scale;
          continue;
        }
        if (roll < 0.62 && left > 80 * scale) {
          // a lying stack
          const n = r.int(2, 4);
          let y = pk.y;
          const sw = r.range(70, 104) * scale;
          for (let j = 0; j < n; j++) {
            const bh = r.range(13, 22) * scale;
            const bw = sw * r.range(0.86, 1);
            const c = pickBook(r, lastC);
            lastC = c;
            out.push(<Book key={`ly${pi}_${k}_${j}`} x={x + r.jitter(4) * scale} y={y - bh} w={bw} h={bh} color={EMBER.books[c]} seed={`${seed}/ly${pi}_${k}_${j}`} at={b(at, 0.06 + j * 0.02)} ink={ink} lying />);
            y -= bh;
          }
          x += sw + r.range(4, 9) * scale;
          continue;
        }
        // a group of upright books (sometimes the last one leans)
        const n = r.int(3, 7);
        for (let j = 0; j < n && x < pk.x1 - 12 * scale; j++) {
          const bw = Math.min(pk.x1 - x, r.range(14, 40) * scale);
          const bh = Math.min(room * 0.96, r.range(80, 150) * scale);
          const c = pickBook(r, lastC);
          lastC = c;
          const lean = j === n - 1 && r.chance(0.3) ? r.range(8, 16) : 0;
          out.push(<Book key={`b${pi}_${k}_${j}`} x={x} y={pk.y - bh} w={bw} h={bh} color={EMBER.books[c]} seed={`${seed}/b${pi}_${k}_${j}`} at={b(at, j * 0.015)} ink={ink} lean={lean} />);
          x += bw + (lean ? bh * Math.sin((lean * Math.PI) / 180) : r.range(0, 2) * scale);
        }
        x += r.range(6, 16) * scale;
      }
      if (trailing && !used.trail && pi === 0) {
        used.trail = true;
        out.push(<Plant key={`tr${pi}`} x={pk.x1 - 28 * scale} y={pk.y} kind="pothos" size={58 * scale} trail={180 * scale} seed={`${seed}/tr`} at={b(at, 0.18)} ink={ink} />);
      }
    });
    return out;
  }, [planks.map((p) => `${p.x0},${p.x1},${p.y},${p.room}`).join('|'), scale, seed, photo, jar, plant, trailing, at, ink]);
  return <>{items}</>;
};

const pickBook = (r: ReturnType<typeof rng>, last: number) => {
  let c = r.int(0, EMBER.books.length - 1);
  // the wall colour (books[5]) only rarely, and never twice in a row
  if (c === 5 && r.chance(0.6)) c = 3;
  if (c === last) c = (c + 2) % EMBER.books.length;
  return c;
};

/** One book: spine (upright) or side (lying), with bands and a label. */
export const Book: React.FC<{x: number; y: number; w: number; h: number; color: string; seed: string; at?: At; ink?: number; lying?: boolean; lean?: number}> = ({x, y, w, h, color, seed, at, ink = W.mid, lying, lean = 0}) => {
  const r = rng(`book/${seed}`);
  let detail = '';
  if (!lying) {
    if (r.chance(0.6)) detail += line(x + 2, y + h * 0.12, x + w - 2, y + h * 0.12, {over: [0, 0], seed: `${seed}/b1`});
    if (r.chance(0.5)) detail += line(x + 2, y + h * 0.86, x + w - 2, y + h * 0.86, {over: [0, 0], seed: `${seed}/b2`});
  } else if (r.chance(0.6)) detail += line(x + w * 0.1, y + h * 0.5, x + w * 0.9, y + h * 0.5, {over: [0, 0], seed: `${seed}/b3`});
  const label = !lying && w > 22 && r.chance(0.45);
  const g = (
    <>
      <Fill rect={[x, y, w, h]} color={color} at={fillAt(at)} seed={`${seed}/f`} />
      {label ? <Fill rect={[x + w * 0.22, y + h * 0.3, w * 0.56, h * 0.18]} color={color === EMBER.wall ? EMBER.reveal : EMBER.wall} at={fillAt(at, 0.04)} offset={false} /> : null}
      <Ink d={rectInk(x, y, w, h, {seed: `${seed}/i`, over: [0, 3]})} at={at} width={ink} />
      {detail ? <Ink d={detail} at={b(at, 0.08)} width={W.hair} /> : null}
    </>
  );
  return lean ? <XG m={mat.about(mat.rotate(lean), x, y + h)}>{g}</XG> : g;
};

const PhotoFrame: React.FC<{x: number; y: number; w: number; h: number; seed: string; at?: At; ink?: number}> = ({x, y, w, h, seed, at, ink = W.mid}) => {
  const m = w * 0.12;
  return (
    <>
      <Box x={x} y={y} w={w} h={h} color={EMBER.beam} seed={`${seed}/fr`} at={at} ink={ink} />
      <Fill rect={[x + m, y + m, w - 2 * m, h - 2 * m]} color={EMBER.skyLow} at={fillAt(at, 0.04)} offset={false} />
      <Fill d={polyPath([[x + m, y + h - m], [x + w * 0.42, y + h * 0.42], [x + w * 0.62, y + h * 0.6], [x + w * 0.74, y + h * 0.5], [x + w - m, y + h - m]])} color={EMBER.snow} at={fillAt(at, 0.06)} offset={false} />
      <Ink d={rectInk(x + m, y + m, w - 2 * m, h - 2 * m, {seed: `${seed}/in`, over: [0, 0]})} at={b(at, 0.06)} width={W.hair} />
    </>
  );
};

const Jar: React.FC<{x: number; y: number; w: number; h: number; seed: string; at?: At; ink?: number}> = ({x, y, w, h, seed, at, ink = W.mid}) => {
  const top = y - h;
  return (
    <>
      <Fill d={roundRect(x, top + h * 0.14, w, h * 0.86, w * 0.18)} color={EMBER.frost} at={fillAt(at)} seed={`${seed}/g`} />
      <Fill d={blob(x + w / 2, y - h * 0.3, w * 0.36, h * 0.22, {seed: `${seed}/c`})} color={EMBER.books[0]} at={fillAt(at, 0.04)} offset={false} />
      <Fill rect={[x + w * 0.08, top, w * 0.84, h * 0.16]} color={EMBER.beam} at={fillAt(at, 0.03)} />
      <Ink d={roundRect(x, top + h * 0.14, w, h * 0.86, w * 0.18, {closed: false, seed: `${seed}/gi`}) + rectInk(x + w * 0.08, top, w * 0.84, h * 0.16, {seed: `${seed}/li`, over: [0, 1]})} at={at} width={ink} />
      <Ink d={line(x + w * 0.22, top + h * 0.3, x + w * 0.22, top + h * 0.55, {over: [0, 0], seed: `${seed}/gl`})} at={b(at, 0.08)} width={W.hair} color={EMBER.white} />
    </>
  );
};

/** A small wall shelf (plank on two brackets) with its own contents (S7's right shelf: a plant and 3 books). */
export const WallShelf: React.FC<{x: number; y: number; w: number; seed?: string; at?: At; ink?: number; contents?: boolean; room?: number}> = ({x, y, w, seed = 'wshelf', at, ink = W.mid, contents = true, room = 130}) => (
  <>
    {contents ? <ShelfFill planks={[{x0: x + 8, x1: x + w - 8, y, room}]} seed={seed} photo={false} jar={false} trailing={false} at={b(at, 0.1)} ink={ink} /> : null}
    <Box x={x} y={y} w={w} h={16} color={EMBER.beam} seed={`${seed}/pk`} at={at} ink={ink} over={[4, 4]} />
    <Ink d={poly([[x + w * 0.15, y + 16], [x + w * 0.15, y + 48], [x + w * 0.15 + 30, y + 16]], {seed: `${seed}/br1`, over: [0, 0]}) + poly([[x + w * 0.85, y + 16], [x + w * 0.85, y + 48], [x + w * 0.85 - 30, y + 16]], {seed: `${seed}/br2`, over: [0, 0]})} at={b(at, 0.06)} width={W.far} />
  </>
);

// ---------------------------------------------------------------- plants

export type PlantKind = 'pothos' | 'succulent' | 'snake' | 'floor' | 'cactus';

export type PlantProps = {
  /** Pot base centre (canvas px): the pot stands on y. */
  x: number;
  y: number;
  kind?: PlantKind;
  /** Overall size (px): the pot width x ~1.6 for the succulent, the plant height for snake / floor / cactus. */
  size?: number;
  /** Pothos: how far the vines hang below the pot (px). */
  trail?: number;
  /** Snow on the pot and the leaves (S9's deck pots under snow). */
  snow?: boolean;
  /** Sway amplitude (px at the tips; default 3, the plan's +-3 px over 3 s) and period. */
  amp?: number;
  period?: number;
  /** A cause that shakes the plant (a jolt): times. */
  shakeAt?: number[];
  seed?: string;
  at?: At;
  ink?: number;
  pot?: string;
};

/** A potted plant. pothos: vines trailing over a lip, swaying +-3 px over 3 s (heart leaves in two greens);
 *  succulent: a rosette; snake: upright sword leaves with bands; floor: big leaves on stems (cut by an edge); cactus. */
export const Plant: React.FC<PlantProps> = ({x, y, kind = 'pothos', size = 80, trail = 160, snow, amp = 3, period = 3, shakeAt, seed = 'plant', at, ink = W.mid, pot = EMBER.pot}) => {
  const t = useTime();
  const r = rng(`plant/${seed}`);
  const shake = rings(t, shakeAt, 1, 2.6, 4);
  // ---- the pot (the rim's band one step lighter)
  const pw = kind === 'floor' ? size * 0.32 : kind === 'snake' || kind === 'cactus' ? size * 0.38 : size * 0.62;
  const ph = pw * 0.82;
  const potPts: Pt[] = [[x - pw / 2, y - ph], [x + pw / 2, y - ph], [x + pw * 0.38, y], [x - pw * 0.38, y]];
  const rimH = ph * 0.2;
  const potEl = (
    <>
      <Fill d={polyPath(potPts)} color={pot} at={fillAt(at)} seed={`${seed}/pot`} />
      <Fill rect={[x - pw * 0.54, y - ph - 2, pw * 1.08, rimH]} color={EMBER.books[4]} at={fillAt(at, 0.02)} offset={false} />
      <Ink d={poly([[x - pw / 2, y - ph + rimH], [x - pw * 0.38, y], [x + pw * 0.38, y], [x + pw / 2, y - ph + rimH]], {seed: `${seed}/potI`, over: [0, 0]}) + rectInk(x - pw * 0.54, y - ph - 2, pw * 1.08, rimH, {seed: `${seed}/rimI`, over: [2, 2]})} at={at} width={ink} />
      {snow ? <path d={blob(x, y - ph - 3, pw * 0.5, ph * 0.16, {seed: `${seed}/psn`})} fill={EMBER.snow} /> : null}
    </>
  );
  const leafAt = fillAt(at, 0.08);
  const leafEls: React.ReactNode[] = [];
  const vines: React.ReactNode[] = [];
  const top = y - ph;
  if (kind === 'pothos') {
    // a mound of leaves on the pot, then 3-4 vines hanging over the front lip
    for (let i = 0; i < 6; i++) {
      const lx = x + r.range(-pw * 0.55, pw * 0.55);
      const ly = top - r.range(4, pw * 0.38);
      const s = r.range(0.8, 1.1) * pw * 0.26;
      const dx = sway2(t, amp * 0.4, period, i) + shake * 2;
      leafEls.push(<Leaf key={`m${i}`} x={lx + dx} y={ly} s={s} rot={r.range(-60, 60)} color={i % 2 ? EMBER.leaf : LEAF2} seed={`${seed}/m${i}`} at={leafAt} ink={W.hair} />);
    }
    const nv = 3 + (r.chance(0.5) ? 1 : 0);
    for (let v = 0; v < nv; v++) {
      const vx0 = x + r.range(-pw * 0.42, pw * 0.42);
      const len = trail * r.range(0.55, 1);
      const bend = r.range(-0.25, 0.25) * pw;
      const ph0 = r.range(0, 6.28);
      const pts: Pt[] = [];
      const nseg = 6;
      for (let k = 0; k <= nseg; k++) {
        const u = k / nseg;
        const dx = (sway2(t, amp, period, ph0) + shake * 3) * u * u + bend * Math.sin(u * Math.PI);
        pts.push([vx0 + dx, top + 6 + u * len]);
      }
      vines.push(<path key={`v${v}`} d={smooth(pts)} fill="none" stroke={EMBER.leaf} strokeWidth={2.2} strokeLinecap="round" />);
      const nl = Math.max(3, Math.round(len / 34));
      for (let k = 1; k <= nl; k++) {
        const u = k / (nl + 0.3);
        const dx = (sway2(t, amp, period, ph0) + shake * 3) * u * u + bend * Math.sin(u * Math.PI);
        const side = k % 2 ? 1 : -1;
        const s = pw * 0.2 * (1 - u * 0.35);
        leafEls.push(<Leaf key={`v${v}_${k}`} x={vx0 + dx + side * s * 0.5} y={top + 6 + u * len} s={s} rot={side * 50 + 180} color={(k + v) % 2 ? EMBER.leaf : LEAF2} seed={`${seed}/v${v}_${k}`} at={leafAt} ink={W.hair} />);
      }
    }
  } else if (kind === 'succulent') {
    const n = 7;
    for (let i = 0; i < n; i++) {
      const a = -90 + (i - (n - 1) / 2) * 26;
      const s = pw * (0.42 - Math.abs(i - (n - 1) / 2) * 0.04);
      const dx = sway(t, 0.5, 4, i) + shake;
      leafEls.push(<Leaf key={i} x={x + dx + Math.cos((a * Math.PI) / 180) * s * 0.35} y={top + 2 + Math.sin((a * Math.PI) / 180) * s * 0.35} s={s} rot={a + 90} color={i % 2 ? LEAF2 : EMBER.leaf} seed={`${seed}/s${i}`} at={leafAt} ink={W.hair} pointed />);
    }
  } else if (kind === 'snake') {
    const n = 5;
    for (let i = 0; i < n; i++) {
      const lx = x + (i - (n - 1) / 2) * pw * 0.2;
      const lh = size * r.range(0.55, 0.85);
      const lean = (i - (n - 1) / 2) * 7 + sway(t, 0.8, 4.2, i) + shake * 2;
      const lw = pw * 0.16;
      const d = `M${lx - lw} ${top}Q${lx - lw * 1.2} ${top - lh * 0.6} ${lx} ${top - lh}Q${lx + lw * 1.2} ${top - lh * 0.6} ${lx + lw} ${top}Z`;
      leafEls.push(
        <XG key={i} m={mat.about(mat.rotate(lean), lx, top)}>
          <Fill d={d} color={i % 2 ? EMBER.leaf : LEAF2} at={leafAt} seed={`${seed}/k${i}`} />
          <Ink d={d} at={b(at, 0.06)} width={W.hair} />
          <Ink d={line(lx - lw * 0.6, top - lh * 0.3, lx + lw * 0.6, top - lh * 0.34, {over: [0, 0], seed: `${seed}/kb${i}`}) + line(lx - lw * 0.5, top - lh * 0.55, lx + lw * 0.5, top - lh * 0.58, {over: [0, 0], seed: `${seed}/kc${i}`})} at={b(at, 0.1)} width={W.hair} color={EMBER.snow} />
        </XG>,
      );
    }
  } else if (kind === 'floor') {
    // a full crown: big leaves on short stems, the biggest at the top, a few hanging lower at the sides
    const n = 10;
    for (let i = 0; i < n; i++) {
      const a = -160 + (i / (n - 1)) * 140 + r.jitter(8);
      const len = size * r.range(0.3, 0.6) * (1 - Math.abs(a + 90) / 260);
      const tip: Pt = [x + Math.cos((a * Math.PI) / 180) * len * 0.9, top + Math.sin((a * Math.PI) / 180) * len];
      const dx = sway2(t, amp * 0.8, period * 1.4, i) + shake * 3;
      vines.push(<path key={`st${i}`} d={`M${x} ${top}Q${(x + tip[0]) / 2} ${top - len * 0.25} ${tip[0] + dx} ${tip[1]}`} fill="none" stroke={EMBER.leaf} strokeWidth={3} strokeLinecap="round" />);
      leafEls.push(<Leaf key={`fl${i}`} x={tip[0] + dx} y={tip[1]} s={size * r.range(0.22, 0.3)} rot={a + 90} color={i % 2 ? EMBER.leaf : LEAF2} seed={`${seed}/fl${i}`} at={leafAt} ink={W.far} vein />);
    }
  } else {
    // cactus: a column with two arms
    const ch = size * 0.75;
    const cw = pw * 0.42;
    const body = roundRect(x - cw / 2, top - ch, cw, ch + 4, cw / 2);
    const arm1 = roundRect(x - cw * 1.25, top - ch * 0.62, cw * 0.5, ch * 0.32, cw * 0.25);
    const arm2 = roundRect(x + cw * 0.75, top - ch * 0.78, cw * 0.5, ch * 0.36, cw * 0.25);
    leafEls.push(
      <React.Fragment key="c">
        <Fill d={body + arm1 + arm2 + `M${x - cw * 1.0} ${top - ch * 0.36}h${cw * 0.5}v${cw * 0.3}h${-cw * 0.5}ZM${x + cw * 0.5} ${top - ch * 0.48}h${cw * 0.5}v${cw * 0.3}h${-cw * 0.5}Z`} color={LEAF2} at={leafAt} seed={`${seed}/cb`} />
        <Ink d={roundRect(x - cw / 2, top - ch, cw, ch + 4, cw / 2, {closed: false, seed: `${seed}/ci`}) + roundRect(x - cw * 1.25, top - ch * 0.62, cw * 0.5, ch * 0.32, cw * 0.25, {closed: false, seed: `${seed}/a1`}) + roundRect(x + cw * 0.75, top - ch * 0.78, cw * 0.5, ch * 0.36, cw * 0.25, {closed: false, seed: `${seed}/a2`})} at={b(at, 0.06)} width={ink} />
        <Ink d={line(x, top - ch * 0.85, x, top - 6, {over: [0, 0], seed: `${seed}/rib`})} at={b(at, 0.1)} width={W.hair} />
      </React.Fragment>,
    );
  }
  return (
    <>
      {kind === 'pothos' ? (
        <>
          {potEl}
          {vines}
          {leafEls}
        </>
      ) : (
        <>
          {vines}
          {leafEls}
          {potEl}
        </>
      )}
      {snow ? <path d={blob(x, top - size * 0.12, pw * 0.42, size * 0.06 + 3, {seed: `${seed}/lsn`})} fill={EMBER.snow} /> : null}
    </>
  );
};

/** One leaf: a heart / teardrop (pointed = a succulent's), centred at its base (x, y), pointing along rot (deg; 0 = up). */
export const Leaf: React.FC<{x: number; y: number; s: number; rot?: number; color?: string; seed: string; at?: At; ink?: number; pointed?: boolean; vein?: boolean}> = ({x, y, s, rot = 0, color = EMBER.leaf, seed, at, ink = W.hair, pointed, vein}) => {
  const w = pointed ? s * 0.32 : s * 0.5;
  const d = `M0 0Q${-w * 1.3} ${-s * 0.45} 0 ${-s}Q${w * 1.3} ${-s * 0.45} 0 0Z`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(rot))}>
      <Fill d={d} color={color} at={at} seed={`${seed}/lf`} />
      {ink > 0 ? <Ink d={d} at={at === undefined ? undefined : at - 0.12} width={ink} order="all" /> : null}
      {vein ? <Ink d={`M0 ${-s * 0.1}L0 ${-s * 0.85}`} at={at} width={W.hair} color={LEAF2} /> : null}
    </XG>
  );
};

// ---------------------------------------------------------------- string lights

export type StringLights3Props = {
  /** Ends of one sagging run (canvas px), or a polyline of points (a sag in every segment). */
  from?: Pt;
  to?: Pt;
  points?: Pt[];
  sag?: number;
  /** Bulbs in total (spread over the length). */
  n?: number;
  /** Bulb radius (px; 6-16). */
  r?: number;
  /** Bulbs blink on one by one over [onAt, onAt + onDur] (the opening: 0.3-1.0). Omit = lit. */
  onAt?: number;
  onDur?: number;
  /** A bulb somewhere twinkles every `every` s (default 0.5; 0 = never). */
  every?: number;
  /** Flat halo steps round the lit bulbs: the outer and inner colours, or false (default the room's lamp core). */
  halo?: [string, string] | false;
  /** Wind / breath sway at the middle (px). */
  sway?: number;
  /** A jolt (S16 settling: the string swings). */
  swingAt?: number[];
  seed?: string;
  /** The wire's ink (hair 1.6 default). */
  ink?: number;
  /** Build: the wire draws from `at`. */
  at?: At;
};

const BULBS = [EMBER.houseLit, EMBER.core, EMBER.hl, EMBER.ring];
const BULB_DIM = EMBER.pot;

/** Warm string lights: a sagging wire with round bulbs (four warm colours) on short stems, flat halo steps, blinking on
 *  one by one, one bulb twinkling about every 0.5 s; the string sways. */
export const StringLights3: React.FC<StringLights3Props> = ({from, to, points, sag = 40, n = 10, r = 9, onAt, onDur = 0.7, every = 0.5, halo = [EMBER.core, EMBER.ring], sway: sw = 2, swingAt, seed = 'lights', ink = W.hair, at}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const pts: Pt[] = points ?? [from ?? [0, 0], to ?? [1080, 0]];
  const segs = pts.length - 1;
  const swing = sway(t, sw, 3.6, pts[0][0] * 0.01) + rings(t, swingAt, 8, 1.1, 1.6);
  // segment lengths for spreading bulbs
  const lens = pts.slice(1).map((p, i) => Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]));
  const total = lens.reduce((a, c) => a + c, 0) || 1;
  const segPoint = (i: number, u: number): Pt => {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const sg = (sag + swing) * (lens[i] / (total / segs));
    return [x1 + (x2 - x1) * u + swing * 0.3 * Math.sin(u * Math.PI), y1 + (y2 - y1) * u + 4 * sg * u * (1 - u)];
  };
  let wire = '';
  for (let i = 0; i < segs; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[i + 1];
    const m = segPoint(i, 0.5);
    const cx = 2 * m[0] - (x1 + x2) / 2;
    const cy = 2 * m[1] - (y1 + y2) / 2;
    wire += `M${x1.toFixed(1)} ${y1.toFixed(1)}Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  const halos: React.ReactNode[] = [];
  const bulbs: React.ReactNode[] = [];
  let stems = '';
  let outl = '';
  for (let k = 0; k < n; k++) {
    const dist = ((k + 0.5) / n) * total;
    let acc = 0;
    let si = 0;
    while (si < segs - 1 && acc + lens[si] < dist) acc += lens[si++];
    const u = Math.min(1, (dist - acc) / (lens[si] || 1));
    const [bx, by] = segPoint(si, u);
    const sx = bx + Math.sin(t * 1.3 + k) * 0.8;
    const syy = by + r * 0.7;
    stems += `M${bx.toFixed(1)} ${by.toFixed(1)}L${sx.toFixed(1)} ${syy.toFixed(1)}`;
    const cy = syy + r;
    const lit = onAt === undefined ? true : t >= onAt + (k / Math.max(1, n - 1)) * onDur;
    const dim = every > 0 && twinkle(t, seed, k, n, every);
    const color = !lit ? EMBER.card : dim ? BULB_DIM : BULBS[k % BULBS.length];
    if (lit && !dim && halo) {
      halos.push(<circle key={`h2${k}`} cx={sx} cy={cy} r={r * 2.6} fill={halo[0]} />);
      halos.push(<circle key={`h1${k}`} cx={sx} cy={cy} r={r * 1.75} fill={halo[1]} />);
    }
    bulbs.push(<path key={`b${k}`} d={blob(sx + 1.2, cy + 1, r * 0.82, r, {seed: `${seed}/b${k}`})} fill={color} />);
    outl += `M${(sx - r * 0.82).toFixed(1)} ${cy.toFixed(1)}a${(r * 0.82).toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(r * 1.64).toFixed(1)} 0a${(r * 0.82).toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-r * 1.64).toFixed(1)} 0`;
    outl += `M${(sx - r * 0.35).toFixed(1)} ${(cy - r * 0.95).toFixed(1)}h${(r * 0.7).toFixed(1)}`;
  }
  return (
    <>
      {halos}
      <path d={wire + stems} fill="none" stroke={EMBER.ink} strokeWidth={ink} strokeLinecap="round" />
      {bulbs}
      <path d={outl} fill="none" stroke={EMBER.ink} strokeWidth={ink} />
    </>
  );
};

// ---------------------------------------------------------------- the pinboard

export type PinItem = 'photo' | 'note' | 'postcard' | 'ticket' | 'list';

export type PinboardProps = {
  x: number;
  y: number;
  w: number;
  h: number;
  /** Items (default 6: two photos, two notes, the sea postcard, a ticket). */
  items?: PinItem[];
  /** Times the notes flutter (a draught, the ding). */
  flutterAt?: number[];
  /** Keep this rect free of items (canvas px: e.g. a bubble's area). */
  avoid?: [number, number, number, number];
  seed?: string;
  at?: At;
  ink?: number;
};

/** A cork pinboard in a red-brown frame with 5-7 pinned things (photos, sticky notes in room colours, a sea postcard,
 *  a ticket, a list); every item sways a hair about its pin and flutters on a cause. */
export const Pinboard: React.FC<PinboardProps> = ({x, y, w, h, items = ['photo', 'note', 'postcard', 'note', 'ticket', 'photo'], flutterAt, avoid, seed = 'pin', at, ink = W.mid}) => {
  const t = useTime();
  const plan = useMemo(() => {
    const r = rng(`pinb/${seed}`);
    const n = items.length;
    const cols = Math.ceil(n / 2);
    return items.map((kind, i) => {
      const c = i % cols;
      const row = Math.floor(i / cols);
      const cw = (w - 30) / cols;
      const ch = (h - 30) / 2;
      const iw = kind === 'note' ? Math.min(cw, ch) * 0.7 : kind === 'ticket' ? cw * 0.86 : cw * 0.78;
      const ih = kind === 'note' ? iw : kind === 'ticket' ? ch * 0.42 : kind === 'list' ? ch * 0.92 : ch * 0.78;
      const ix = x + 15 + c * cw + (cw - iw) / 2 + r.jitter(cw * 0.08);
      const iy = y + 15 + row * ch + (ch - ih) / 2 + r.jitter(ch * 0.08);
      return {kind, x: ix, y: iy, w: iw, h: ih, rot: r.range(-9, 9), ph: r.range(0, 6.28), color: r.pick([EMBER.hl, EMBER.ring, EMBER.core, EMBER.newScreen])};
    });
  }, [x, y, w, h, items.join(), seed]);
  const fr = Math.max(10, w * 0.04);
  return (
    <>
      <Fill rect={[x - fr, y - fr, w + 2 * fr, h + 2 * fr]} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/fr`} />
      <Fill rect={[x, y, w, h]} color={'#C98A64'} at={fillAt(at, 0.02)} offset={false} />
      <Ink d={rectInk(x - fr, y - fr, w + 2 * fr, h + 2 * fr, {seed: `${seed}/fo`, over: [3, 6]}) + rectInk(x, y, w, h, {seed: `${seed}/fi`, over: [0, 2]})} at={at} width={ink} />
      <Show at={fillAt(at, 0.04)}>
        <path d={corkSpecks(x, y, w, h, seed)} fill={EMBER.beam} />
      </Show>
      {plan.map((it, i) => {
        if (avoid && it.x < avoid[0] + avoid[2] && it.x + it.w > avoid[0] && it.y < avoid[1] + avoid[3] && it.y + it.h > avoid[1]) return null;
        const px = it.x + it.w / 2;
        const py = it.y + 6;
        const rot = it.rot + sway(t, 0.8, 3.2, it.ph) + rings(t, flutterAt?.map((f) => f + i * 0.03), it.kind === 'note' ? 10 : 4, 3.2, 3.5);
        return (
          <XG key={i} m={mat.about(mat.rotate(rot), px, py)}>
            <PinnedThing kind={it.kind} x={it.x} y={it.y} w={it.w} h={it.h} color={it.color} seed={`${seed}/${i}`} at={b(at, 0.12 + i * 0.03)} />
            <circle cx={px} cy={py} r={4.5} fill={i % 2 ? EMBER.anchor : EMBER.dcSide} />
          </XG>
        );
      })}
    </>
  );
};

const corkSpecks = (x: number, y: number, w: number, h: number, seed: string) => {
  const r = rng(`cork/${seed}`);
  let d = '';
  const n = Math.round((w * h) / 2600);
  for (let i = 0; i < n; i++) {
    const sx = r.range(x + 4, x + w - 4);
    const sy = r.range(y + 4, y + h - 4);
    d += `M${sx.toFixed(1)} ${sy.toFixed(1)}h2.2v2.2h-2.2z`;
  }
  return d;
};

/** One pinned item (shared by Pinboard and the boards round the cards). */
export const PinnedThing: React.FC<{kind: PinItem | 'flyer' | 'concert' | 'card' | 'slip'; x: number; y: number; w: number; h: number; color?: string; seed: string; at?: At; tabsT?: number}> = ({kind, x, y, w, h, color = EMBER.hl, seed, at, tabsT}) => {
  const t = useTime();
  const fA = fillAt(at);
  if (kind === 'note') {
    return (
      <>
        <Fill rect={[x, y, w, h]} color={color} at={fA} seed={`${seed}/n`} />
        <Ink d={line(x + w * 0.15, y + h * 0.4, x + w * 0.8, y + h * 0.38, {over: [0, 0], seed: `${seed}/n1`}) + line(x + w * 0.15, y + h * 0.6, x + w * 0.65, y + h * 0.6, {over: [0, 0], seed: `${seed}/n2`})} at={b(at, 0.1)} width={W.hair} />
      </>
    );
  }
  if (kind === 'photo') {
    const m = w * 0.08;
    return (
      <>
        <Box x={x} y={y} w={w} h={h} color={EMBER.card} at={at} seed={`${seed}/p`} ink={W.hair} over={[0, 1]} />
        <Fill rect={[x + m, y + m, w - 2 * m, h - m * 3.2]} color={EMBER.skyLow} at={fillAt(at, 0.03)} offset={false} />
        <Fill d={polyPath([[x + m, y + h - m * 2.2], [x + w * 0.35, y + h * 0.4], [x + w * 0.55, y + h * 0.58], [x + w * 0.7, y + h * 0.46], [x + w - m, y + h - m * 2.2]])} color={EMBER.leaf} at={fillAt(at, 0.05)} offset={false} />
        <circle cx={x + w * 0.75} cy={y + h * 0.25} r={w * 0.07} fill={EMBER.core} />
      </>
    );
  }
  if (kind === 'postcard') {
    return (
      <>
        <Box x={x} y={y} w={w} h={h} color={EMBER.card} at={at} seed={`${seed}/pc`} ink={W.hair} over={[0, 1]} />
        <Fill rect={[x + 4, y + 4, w - 8, h * 0.45]} color={EMBER.skyLow} at={fillAt(at, 0.03)} offset={false} />
        <Fill rect={[x + 4, y + 4 + h * 0.45, w - 8, h * 0.3]} color={EMBER.dc} at={fillAt(at, 0.04)} offset={false} />
        <Fill rect={[x + 4, y + h * 0.79, w - 8, h * 0.21 - 4]} color={EMBER.ring} at={fillAt(at, 0.05)} offset={false} />
        <Ink d={`M${x + w * 0.2} ${y + h * 0.62}q8 -6 16 0q8 6 16 0M${x + w * 0.55} ${y + h * 0.68}q6 -5 12 0q6 5 12 0`} at={b(at, 0.1)} width={W.hair} color={EMBER.snow} />
      </>
    );
  }
  if (kind === 'ticket') {
    return (
      <>
        <Box x={x} y={y} w={w} h={h} color={EMBER.ring} at={at} seed={`${seed}/tk`} ink={W.hair} over={[0, 1]} />
        <Ink d={`M${x + w * 0.72} ${y + 2}V${y + h - 2}`} at={b(at, 0.08)} width={W.hair} dash="3 4" />
        <Ink d={line(x + w * 0.1, y + h * 0.4, x + w * 0.6, y + h * 0.4, {over: [0, 0], seed: `${seed}/t1`}) + line(x + w * 0.1, y + h * 0.66, x + w * 0.46, y + h * 0.66, {over: [0, 0], seed: `${seed}/t2`})} at={b(at, 0.1)} width={W.hair} />
      </>
    );
  }
  if (kind === 'list') {
    let d = '';
    for (let i = 0; i < 5; i++) d += line(x + w * 0.14, y + h * (0.2 + i * 0.15), x + w * (0.6 + (i % 2) * 0.22), y + h * (0.2 + i * 0.15), {over: [0, 0], seed: `${seed}/l${i}`});
    return (
      <>
        <Box x={x} y={y} w={w} h={h} color={EMBER.card} at={at} seed={`${seed}/ls`} ink={W.hair} over={[0, 1]} />
        <Ink d={d} at={b(at, 0.1)} width={W.hair} />
      </>
    );
  }
  if (kind === 'flyer') {
    // the lost-cat flyer with tear-off tabs that flutter
    const tabs = 6;
    const tw = w / tabs;
    const th = h * 0.22;
    const tabEls: React.ReactNode[] = [];
    for (let i = 0; i < tabs; i++) {
      if (i === 2) continue; // one already taken
      const a = Math.sin(t * 3.1 + i * 1.7 + (tabsT ?? 0)) * 6;
      tabEls.push(
        <XG key={i} m={mat.about(mat.rotate(a), x + tw * (i + 0.5), y + h - th)}>
          <Fill rect={[x + tw * i + 1, y + h - th, tw - 2, th]} color={EMBER.card} at={fA} offset={false} />
          <Ink d={rectInk(x + tw * i + 1, y + h - th, tw - 2, th, {seed: `${seed}/tb${i}`, over: [0, 0], edges: 'lrb'})} at={b(at, 0.06)} width={W.hair} />
        </XG>,
      );
    }
    return (
      <>
        {tabEls}
        <Box x={x} y={y} w={w} h={h - th} color={EMBER.card} at={at} seed={`${seed}/fy`} ink={W.hair} over={[0, 1]} />
        <Show at={fillAt(at, 0.06)}>
          <Txt x={x + w / 2} y={y + h * 0.2} size={Math.max(14, w * 0.2)} fit={w * 0.8}>
            LOST CAT
          </Txt>
        </Show>
        {/* the cat: a sitting silhouette with ears */}
        <Fill d={blob(x + w / 2, y + h * 0.5, w * 0.16, h * 0.14, {seed: `${seed}/cb`}) + blob(x + w / 2, y + h * 0.33, w * 0.1, w * 0.09, {seed: `${seed}/ch`}) + `M${x + w * 0.42} ${y + h * 0.3}l${w * 0.03} ${-w * 0.1}l${w * 0.04} ${w * 0.06}zM${x + w * 0.58} ${y + h * 0.3}l${-w * 0.03} ${-w * 0.1}l${-w * 0.04} ${w * 0.06}z`} color={EMBER.anchor} at={fillAt(at, 0.06)} offset={false} />
      </>
    );
  }
  if (kind === 'concert') {
    return (
      <>
        <Box x={x} y={y} w={w} h={h} color={EMBER.dc} at={at} seed={`${seed}/co`} ink={W.hair} over={[0, 1]} />
        <Fill d={circle(x + w * 0.5, y + h * 0.36, w * 0.24)} color={EMBER.houseLit} at={fillAt(at, 0.04)} offset={false} />
        <Fill rect={[x + w * 0.12, y + h * 0.66, w * 0.76, h * 0.08]} color={EMBER.snow} at={fillAt(at, 0.05)} offset={false} />
        <Fill rect={[x + w * 0.2, y + h * 0.8, w * 0.6, h * 0.05]} color={EMBER.hl} at={fillAt(at, 0.06)} offset={false} />
      </>
    );
  }
  if (kind === 'card') {
    return (
      <>
        <Box x={x} y={y} w={w} h={h} color={EMBER.card} at={at} seed={`${seed}/bc`} ink={W.hair} over={[0, 1]} />
        <Ink d={line(x + w * 0.12, y + h * 0.35, x + w * 0.7, y + h * 0.35, {over: [0, 0], seed: `${seed}/c1`}) + line(x + w * 0.12, y + h * 0.62, x + w * 0.5, y + h * 0.62, {over: [0, 0], seed: `${seed}/c2`})} at={b(at, 0.08)} width={W.hair} />
        <Fill d={circle(x + w * 0.84, y + h * 0.3, h * 0.14)} color={EMBER.hl} at={fillAt(at, 0.05)} offset={false} />
      </>
    );
  }
  // slip (a delivery slip: lines and a barcode)
  let bars = '';
  for (let i = 0; i < 9; i++) bars += `M${x + w * (0.15 + i * 0.07)} ${y + h * 0.7}v${h * 0.18}`;
  return (
    <>
      <Box x={x} y={y} w={w} h={h} color={EMBER.card} at={at} seed={`${seed}/sl`} ink={W.hair} over={[0, 1]} />
      <Ink d={line(x + w * 0.12, y + h * 0.22, x + w * 0.82, y + h * 0.22, {over: [0, 0], seed: `${seed}/s1`}) + line(x + w * 0.12, y + h * 0.38, x + w * 0.6, y + h * 0.38, {over: [0, 0], seed: `${seed}/s2`}) + line(x + w * 0.12, y + h * 0.52, x + w * 0.7, y + h * 0.52, {over: [0, 0], seed: `${seed}/s3`})} at={b(at, 0.08)} width={W.hair} />
      <Show at={fillAt(at, 0.06)}>
        <path d={bars} stroke={EMBER.ink} strokeWidth={2} />
      </Show>
    </>
  );
};

// ---------------------------------------------------------------- framed print, poster

/** A framed print on the wall: mountain, sea, a leaf or an abstract sun. */
export const FramedPrint: React.FC<{x: number; y: number; w: number; h: number; picture?: 'mountain' | 'sea' | 'leaf' | 'sun'; seed?: string; at?: At; ink?: number; frame?: string}> = ({x, y, w, h, picture = 'mountain', seed = 'print', at, ink = W.mid, frame = EMBER.beam}) => {
  const m = Math.max(8, w * 0.08);
  const ix = x + m;
  const iy = y + m;
  const iw = w - 2 * m;
  const ih = h - 2 * m;
  const pa = fillAt(at, 0.05);
  let pic: React.ReactNode;
  if (picture === 'mountain') {
    pic = (
      <>
        <Fill rect={[ix, iy, iw, ih]} color={EMBER.ring} at={pa} offset={false} />
        <Fill d={polyPath([[ix, iy + ih], [ix + iw * 0.38, iy + ih * 0.3], [ix + iw * 0.6, iy + ih * 0.55], [ix + iw * 0.76, iy + ih * 0.42], [ix + iw, iy + ih]])} color={EMBER.beam} at={pa} offset={false} />
        <Fill d={polyPath([[ix + iw * 0.3, iy + ih * 0.42], [ix + iw * 0.38, iy + ih * 0.3], [ix + iw * 0.46, iy + ih * 0.42]])} color={EMBER.card} at={pa} offset={false} />
        <Fill d={circle(ix + iw * 0.76, iy + ih * 0.22, iw * 0.08)} color={EMBER.hl} at={pa} offset={false} />
      </>
    );
  } else if (picture === 'sea') {
    pic = (
      <>
        <Fill rect={[ix, iy, iw, ih * 0.5]} color={EMBER.skyLow} at={pa} offset={false} />
        <Fill rect={[ix, iy + ih * 0.5, iw, ih * 0.5]} color={EMBER.dc} at={pa} offset={false} />
        <Fill d={circle(ix + iw * 0.3, iy + ih * 0.32, iw * 0.1)} color={EMBER.ring} at={pa} offset={false} />
      </>
    );
  } else if (picture === 'leaf') {
    pic = (
      <>
        <Fill rect={[ix, iy, iw, ih]} color={EMBER.wall} at={pa} offset={false} />
        <Leaf x={ix + iw / 2} y={iy + ih * 0.9} s={ih * 0.75} color={EMBER.leaf} seed={`${seed}/lf`} at={pa} vein />
      </>
    );
  } else {
    pic = (
      <>
        <Fill rect={[ix, iy, iw, ih]} color={EMBER.reveal} at={pa} offset={false} />
        <Fill d={`M${ix} ${iy + ih}A${iw * 0.5} ${iw * 0.5} 0 0 1 ${ix + iw} ${iy + ih}Z`} color={EMBER.pot} at={pa} offset={false} />
      </>
    );
  }
  return (
    <>
      <Box x={x} y={y} w={w} h={h} color={frame} at={at} seed={`${seed}/fr`} ink={ink} />
      {pic}
      <Ink d={rectInk(ix, iy, iw, ih, {seed: `${seed}/in`, over: [0, 0]})} at={b(at, 0.06)} width={W.hair} />
    </>
  );
};

/** A poster taped / pinned on a wall: 'concert' or the 'flyer' (lost cat with tabs). */
export const Poster: React.FC<{x: number; y: number; w: number; h: number; kind?: 'concert' | 'flyer'; rot?: number; seed?: string; at?: At}> = ({x, y, w, h, kind = 'concert', rot = 0, seed = 'poster', at}) => (
  <XG m={mat.about(mat.rotate(rot), x + w / 2, y)}>
    <PinnedThing kind={kind} x={x} y={y} w={w} h={h} seed={seed} at={at} />
    <Fill rect={[x + w * 0.38, y - 8, w * 0.24, 16]} color={EMBER.tape} at={fillAt(at, 0.08)} offset={false} />
  </XG>
);

// ---------------------------------------------------------------- desk clutter

/** A pen cup with pens and pencils (base centre on y). */
export const PenCup: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number; color?: string}> = ({x, y, w = 60, seed = 'pens', at, ink = W.mid, color = EMBER.dc}) => {
  const h = w * 1.15;
  const r = rng(`pens/${seed}`);
  const pens: React.ReactNode[] = [];
  for (let i = 0; i < 4; i++) {
    const px = x + (i - 1.5) * w * 0.2;
    const ph = h * r.range(0.45, 0.85);
    const a = (i - 1.5) * 8 + r.jitter(3);
    const c = [EMBER.books[0], EMBER.anchor, EMBER.hl, EMBER.dcSide][i];
    pens.push(
      <XG key={i} m={mat.about(mat.rotate(a), px, y - h * 0.6)}>
        <Fill rect={[px - w * 0.05, y - h - ph * 0.6, w * 0.1, ph + h * 0.2]} color={c} at={fillAt(at, 0.04)} offset={false} />
        <Ink d={rectInk(px - w * 0.05, y - h - ph * 0.6, w * 0.1, ph + h * 0.2, {seed: `${seed}/p${i}`, over: [0, 0], edges: 'tlr'})} at={b(at, 0.06)} width={W.hair} />
      </XG>,
    );
  }
  return (
    <>
      {pens}
      <Fill d={roundRect(x - w / 2, y - h, w, h, w * 0.12)} color={color} at={fillAt(at)} seed={`${seed}/c`} />
      <Ink d={roundRect(x - w / 2, y - h, w, h, w * 0.12, {closed: false, seed: `${seed}/ci`})} at={at} width={ink} />
      <Ink d={line(x - w * 0.3, y - h * 0.7, x - w * 0.3, y - h * 0.3, {over: [0, 0], seed: `${seed}/gl`})} at={b(at, 0.1)} width={W.hair} color={EMBER.skyLow} />
    </>
  );
};

/** Headphones lying on the desk (band arc and two cups), base on y. */
export const Headphones: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number; color?: string}> = ({x, y, w = 150, seed = 'hp', at, ink = W.mid, color = EMBER.dcSide}) => {
  const cw = w * 0.26;
  const ch = w * 0.22;
  const band = `M${x - w * 0.38} ${y - ch * 0.6}C${x - w * 0.4} ${y - w * 0.55} ${x + w * 0.4} ${y - w * 0.55} ${x + w * 0.38} ${y - ch * 0.6}`;
  return (
    <>
      <Ink d={band} at={at} width={w * 0.07} color={color} taper={false} />
      <Ink d={band} at={at} width={ink * 0.6} />
      {[-1, 1].map((s) => (
        <React.Fragment key={s}>
          <Fill d={roundRect(x + s * w * 0.38 - cw / 2, y - ch, cw, ch, cw * 0.3)} color={color} at={fillAt(at, 0.04)} seed={`${seed}/c${s}`} />
          <Fill d={roundRect(x + s * w * 0.38 - cw * 0.3, y - ch * 0.84, cw * 0.6, ch * 0.5, cw * 0.2)} color={EMBER.hl} at={fillAt(at, 0.06)} offset={false} />
          <Ink d={roundRect(x + s * w * 0.38 - cw / 2, y - ch, cw, ch, cw * 0.3, {closed: false, seed: `${seed}/ci${s}`})} at={b(at, 0.04)} width={ink} />
        </React.Fragment>
      ))}
    </>
  );
};

/** A stack of n lying books (base on y, left x). */
export const BookStack: React.FC<{x: number; y: number; w?: number; n?: number; seed?: string; at?: At; ink?: number; scale?: number}> = ({x, y, w = 120, n = 3, seed = 'stack', at, ink = W.mid, scale = 1}) => {
  const r = rng(`stack/${seed}`);
  const out: React.ReactNode[] = [];
  let yy = y;
  let last = -1;
  for (let i = 0; i < n; i++) {
    const bh = r.range(16, 26) * scale;
    const bw = w * r.range(0.84, 1);
    const c = pickBook(r, last);
    last = c;
    out.push(<Book key={i} x={x + r.jitter(w * 0.06)} y={yy - bh} w={bw} h={bh} color={EMBER.books[c]} seed={`${seed}/${i}`} at={b(at, i * 0.03)} ink={ink} lying />);
    yy -= bh;
  }
  return <>{out}</>;
};

/** A few sticky notes (room colours only), lying or stuck, slightly rotated; one lifts on `flutterAt`. */
export const StickyNotes: React.FC<{x: number; y: number; n?: number; size?: number; seed?: string; at?: At; flutterAt?: number[]; spread?: number}> = ({x, y, n = 3, size = 70, seed = 'sticky', at, flutterAt, spread = 1}) => {
  const t = useTime();
  const r = rng(`sticky/${seed}`);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const nx = x + i * size * 0.7 * spread + r.jitter(size * 0.2);
    const ny = y + r.jitter(size * 0.2);
    const rot = r.range(-14, 14) + (i === 0 ? rings(t, flutterAt, 12, 3, 3.5) : 0);
    const c = [EMBER.hl, EMBER.ring, EMBER.core, EMBER.newScreen][i % 4];
    out.push(
      <XG key={i} m={mat.about(mat.rotate(rot), nx + size / 2, ny)}>
        <PinnedThing kind="note" x={nx} y={ny} w={size} h={size} color={c} seed={`${seed}/${i}`} at={b(at, i * 0.04)} />
        <Ink d={rectInk(nx, ny, size, size, {seed: `${seed}/ni${i}`, over: [0, 1]})} at={b(at, i * 0.04)} width={W.hair} />
      </XG>,
    );
  }
  return <>{out}</>;
};

/** A charger / laptop cable: a smooth dark path through `points` (the lane moves the points with the phone), an
 *  optional plug at the start (lying on the desk or in a port). */
export const Cable: React.FC<{points: Pt[]; plug?: boolean; width?: number; color?: string; ink?: number; at?: At}> = ({points, plug, width = 7, color = EMBER.dcSide, ink = W.hair, at}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const d = smooth(points);
  const p0 = points[0];
  const p1 = points[1] ?? [p0[0] + 1, p0[1]];
  const ang = (Math.atan2(p1[1] - p0[1], p1[0] - p0[0]) * 180) / Math.PI;
  return (
    <>
      <path d={d} fill="none" stroke={EMBER.ink} strokeWidth={width + ink * 2} strokeLinecap="round" />
      <path d={d} fill="none" stroke={color} strokeWidth={width} strokeLinecap="round" />
      {plug ? (
        <g transform={`translate(${p0[0]} ${p0[1]}) rotate(${ang.toFixed(1)})`}>
          <rect x={-width * 3.2} y={-width * 0.9} width={width * 3.4} height={width * 1.8} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={ink} />
          <path d={`M${-width * 3.2} ${-width * 0.4}h${-width}M${-width * 3.2} ${width * 0.4}h${-width}`} stroke={EMBER.ink} strokeWidth={ink * 1.3} />
        </g>
      ) : null}
    </>
  );
};

/** Reading glasses lying on the desk (two round lenses, a bridge, folded temples). */
export const Glasses: React.FC<{x: number; y: number; w?: number; rot?: number; seed?: string; at?: At; ink?: number}> = ({x, y, w = 110, rot = -8, seed = 'glasses', at, ink = W.mid}) => {
  const r = w * 0.22;
  return (
    <XG m={mat.about(mat.rotate(rot), x, y)}>
      <Fill d={ellipse(x - w * 0.27, y, r, r * 0.8, {seed: `${seed}/l1`}) + ellipse(x + w * 0.27, y, r, r * 0.8, {seed: `${seed}/l2`})} color={EMBER.frost} at={fillAt(at)} offset={false} />
      <Ink d={ellipse(x - w * 0.27, y, r, r * 0.8, {seed: `${seed}/i1`}) + ellipse(x + w * 0.27, y, r, r * 0.8, {seed: `${seed}/i2`}) + `M${x - w * 0.06} ${y - r * 0.2}Q${x} ${y - r * 0.5} ${x + w * 0.06} ${y - r * 0.2}` + `M${x - w * 0.48} ${y - r * 0.3}L${x - w * 0.3} ${y - r * 1.1}M${x + w * 0.48} ${y - r * 0.3}L${x + w * 0.3} ${y - r * 1.1}`} at={at} width={ink} />
      <Ink d={line(x - w * 0.34, y - r * 0.2, x - w * 0.26, y - r * 0.5, {over: [0, 0], seed: `${seed}/g`})} at={b(at, 0.1)} width={W.hair} color={EMBER.white} />
    </XG>
  );
};

/** A small speaker (box with a round grille), base on y. */
export const Speaker: React.FC<{x: number; y: number; w?: number; h?: number; seed?: string; at?: At; ink?: number; color?: string}> = ({x, y, w = 70, h = 100, seed = 'spk', at, ink = W.mid, color = EMBER.anchor}) => (
  <>
    <Fill d={roundRect(x - w / 2, y - h, w, h, w * 0.12)} color={color} at={fillAt(at)} seed={`${seed}/b`} />
    <Fill d={circle(x, y - h * 0.38, w * 0.3)} color={EMBER.dcSide} at={fillAt(at, 0.04)} offset={false} />
    <Fill d={circle(x, y - h * 0.78, w * 0.12)} color={EMBER.dcSide} at={fillAt(at, 0.05)} offset={false} />
    <Ink d={roundRect(x - w / 2, y - h, w, h, w * 0.12, {closed: false, seed: `${seed}/i`}) + circle(x, y - h * 0.38, w * 0.3, {seed: `${seed}/g`})} at={at} width={ink} />
  </>
);

/** Wood-grain strokes on the desk (4-8 long thin arcs, one flat step under the desk colour). */
export const DeskGrain: React.FC<{x: number; y: number; w: number; h: number; n?: number; seed?: string; at?: At; color?: string}> = ({x, y, w, h, n = 6, seed = 'grain', at, color = GRAIN}) => {
  const r = rng(`grain/${seed}`);
  let d = '';
  for (let i = 0; i < n; i++) {
    const gy = y + r.range(0.05, 0.95) * h;
    const gx = x + r.range(-0.1, 0.5) * w;
    const len = w * r.range(0.25, 0.55);
    const bow = r.range(-10, 10);
    d += `M${gx.toFixed(1)} ${gy.toFixed(1)}Q${(gx + len / 2).toFixed(1)} ${(gy + bow).toFixed(1)} ${(gx + len).toFixed(1)} ${(gy + r.range(-4, 4)).toFixed(1)}`;
    if (r.chance(0.35)) {
      const kx = gx + len * r.range(0.3, 0.7);
      d += ellipse(kx, gy + bow * 0.5, r.range(10, 18), r.range(4, 7), {seed: `${seed}/k${i}`});
    }
  }
  return <Ink d={d} at={at} width={W.hair} color={color} />;
};

/** Plaster hints on a wall (scattered little ticks, one step under the wall). */
export const WallMarks: React.FC<{x: number; y: number; w: number; h: number; n?: number; seed?: string; at?: At; color?: string}> = ({x, y, w, h, n = 8, seed = 'wall', at, color = PLASTER}) => <Ink d={wallTicks(x, y, w, h, {seed: `wm/${seed}`, n, size: 16})} at={at} width={W.far} color={color} />;

/** The lamp's pull chain swinging (S7's loop): beads from (x, y) down `len`, a pendulum with a jolt option. */
export const PullChain: React.FC<{x: number; y: number; len?: number; amp?: number; jolt?: number[]}> = ({x, y, len = 110, amp = 6, jolt}) => {
  const t = useTime();
  const a = sway(t, amp, 1.9) + rings(t, jolt, 14, 0.9, 1.2);
  const rad = (a * Math.PI) / 180;
  const ex = x + Math.sin(rad) * len;
  const ey = y + Math.cos(rad) * len;
  let beads = '';
  for (let i = 1; i <= 9; i++) {
    const u = i / 9;
    const bx = x + (ex - x) * u;
    const by = y + (ey - y) * u;
    beads += `M${(bx - 2.2).toFixed(1)} ${by.toFixed(1)}a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0`;
  }
  return (
    <>
      <path d={beads} fill={EMBER.ink} />
      <path d={blob(ex, ey + 9, 5, 8, {seed: 'pullk'})} fill={EMBER.beam} stroke={EMBER.ink} strokeWidth={1.6} />
    </>
  );
};

// ---------------------------------------------------------------- S13: radiator, rug, coat hook, tote, slippers

/** A radiator under the window (cream fins), a sock drying on it that sways. */
export const Radiator: React.FC<{x: number; y: number; w?: number; h?: number; sock?: boolean; seed?: string; at?: At; ink?: number}> = ({x, y, w = 420, h = 180, sock = true, seed = 'rad', at, ink = W.mid}) => {
  const t = useTime();
  const fins = Math.round(w / 34);
  let finD = '';
  for (let i = 1; i < fins; i++) finD += line(x + (w * i) / fins, y + 12, x + (w * i) / fins, y + h - 10, {over: [0, 0], seed: `${seed}/f${i}`});
  const sx = x + w * 0.62;
  const sa = sway(t, 2.5, 3.4, 1);
  return (
    <>
      <Fill d={roundRect(x, y, w, h, 14)} color={EMBER.card} at={fillAt(at)} seed={`${seed}/b`} />
      <Ink d={roundRect(x, y, w, h, 14, {closed: false, seed: `${seed}/i`})} at={at} width={ink} />
      <Ink d={finD} at={b(at, 0.08)} width={W.far} />
      <Ink d={line(x - 30, y + h - 20, x, y + h - 20, {over: [0, 0], seed: `${seed}/pipe`}) + circle(x - 14, y + h - 32, 9, {seed: `${seed}/valve`})} at={b(at, 0.1)} width={W.far} />
      {sock ? (
        <XG m={mat.about(mat.rotate(sa), sx, y)}>
          <Fill d={`M${sx} ${y - 4}h40v${h * 0.5}q0 26 -26 26h-30v-26h16z`} color={EMBER.hl} at={fillAt(at, 0.1)} seed={`${seed}/sock`} />
          <Fill rect={[sx, y + 12, 40, 12]} color={EMBER.dc} at={fillAt(at, 0.12)} offset={false} />
          <Ink d={`M${sx} ${y - 4}h40v${h * 0.5}q0 26 -26 26h-30v-26h16z`} at={b(at, 0.08)} width={W.far} />
        </XG>
      ) : null}
    </>
  );
};

/** A striped rug on the floor in perspective (quad: back-left, back-right, front-right, front-left), fringe ticks. */
export const Rug: React.FC<{quad: [Pt, Pt, Pt, Pt]; stripes?: number; colors?: string[]; seed?: string; at?: At; ink?: number}> = ({quad, stripes = 7, colors = [EMBER.hl, EMBER.wall, EMBER.dc, EMBER.wall], seed = 'rug', at, ink = W.mid}) => {
  const [bl, br, fr, fl] = quad;
  const P = (u: number, v: number): Pt => {
    const top: Pt = [bl[0] + (br[0] - bl[0]) * u, bl[1] + (br[1] - bl[1]) * u];
    const bot: Pt = [fl[0] + (fr[0] - fl[0]) * u, fl[1] + (fr[1] - fl[1]) * u];
    return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
  };
  const out: React.ReactNode[] = [];
  out.push(<Fill key="base" d={polyPath(quad)} color={EMBER.reveal} at={fillAt(at)} seed={`${seed}/b`} />);
  for (let i = 0; i < stripes; i++) {
    const v0 = (i + 0.2) / stripes;
    const v1 = (i + 0.7) / stripes;
    out.push(<Fill key={i} d={polyPath([P(0.02, v0), P(0.98, v0), P(0.98, v1), P(0.02, v1)])} color={colors[i % colors.length]} at={fillAt(at, 0.02 + i * 0.01)} offset={false} />);
  }
  let fringe = '';
  for (let k = 0; k <= 14; k++) {
    const u = k / 14;
    const a = P(u, 0);
    const c = P(u, 1);
    fringe += `M${a[0]} ${a[1]}l0 -8M${c[0]} ${c[1]}l0 10`;
  }
  out.push(<Ink key="i" d={poly(quad, {closed: true, seed: `${seed}/o`, over: [2, 4]})} at={at} width={ink} />);
  out.push(<Ink key="fr" d={fringe} at={b(at, 0.1)} width={W.hair} order="all" />);
  return <>{out}</>;
};

/** A coat hook rail with a coat and a striped scarf hanging (they sway a hair). */
export const CoatHook: React.FC<{x: number; y: number; h?: number; coat?: string; seed?: string; at?: At; ink?: number}> = ({x, y, h = 380, coat = EMBER.dc, seed = 'coat', at, ink = W.mid}) => {
  const t = useTime();
  const a = sway(t, 0.8, 4.4);
  const cw = h * 0.42;
  const coatD = `M${x - cw * 0.22} ${y + 10}Q${x - cw * 0.6} ${y + h * 0.2} ${x - cw * 0.55} ${y + h}L${x + cw * 0.55} ${y + h}Q${x + cw * 0.6} ${y + h * 0.2} ${x + cw * 0.22} ${y + 10}Z`;
  const scarfD = `M${x + cw * 0.05} ${y + 8}l${cw * 0.16} 0l${cw * 0.04} ${h * 0.72}l${-cw * 0.2} 0z`;
  return (
    <>
      <Fill rect={[x - 90, y - 16, 180, 22]} color={EMBER.beam} at={fillAt(at)} seed={`${seed}/rail`} />
      <Ink d={rectInk(x - 90, y - 16, 180, 22, {seed: `${seed}/ri`, over: [4, 4]})} at={at} width={ink} />
      <XG m={mat.about(mat.rotate(a), x, y)}>
        <Fill d={coatD} color={coat} at={fillAt(at, 0.06)} seed={`${seed}/c`} />
        <Ink d={coatD + `M${x} ${y + 20}L${x} ${y + h * 0.95}`} at={b(at, 0.04)} width={ink} />
        <Fill d={scarfD} color={EMBER.hl} at={fillAt(at, 0.1)} seed={`${seed}/s`} />
        <Fill d={`M${x + cw * 0.06} ${y + h * 0.3}h${cw * 0.18}v${h * 0.06}h${-cw * 0.18}zM${x + cw * 0.07} ${y + h * 0.5}h${cw * 0.18}v${h * 0.06}h${-cw * 0.18}z`} color={EMBER.beam} at={fillAt(at, 0.12)} offset={false} />
        <Ink d={scarfD} at={b(at, 0.08)} width={W.far} />
        <circle cx={x} cy={y + 4} r={6} fill={EMBER.anchor} />
      </XG>
    </>
  );
};

/** A slouched tote bag (base on y), a simple print. */
export const ToteBag: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number; color?: string}> = ({x, y, w = 150, seed = 'tote', at, ink = W.mid, color = EMBER.card}) => {
  const h = w * 1.05;
  const d = `M${x - w / 2} ${y - h}L${x + w / 2} ${y - h * 0.94}L${x + w * 0.56} ${y}L${x - w * 0.56} ${y}Z`;
  return (
    <>
      <Ink d={`M${x - w * 0.3} ${y - h}Q${x - w * 0.1} ${y - h * 1.6} ${x + w * 0.05} ${y - h * 0.98}M${x + w * 0.1} ${y - h * 0.98}Q${x + w * 0.3} ${y - h * 1.5} ${x + w * 0.32} ${y - h * 0.95}`} at={at} width={ink * 0.8} />
      <Fill d={d} color={color} at={fillAt(at)} seed={`${seed}/b`} />
      <Fill d={crown(x, y - h * 0.48, w * 0.18, w * 0.16, {seed: `${seed}/pr`, bumps: 5})} color={EMBER.leaf} at={fillAt(at, 0.05)} offset={false} />
      <Ink d={poly([[x - w / 2, y - h], [x + w / 2, y - h * 0.94], [x + w * 0.56, y], [x - w * 0.56, y]], {closed: true, seed: `${seed}/i`, over: [1, 3]})} at={at} width={ink} />
    </>
  );
};

/** A pair of slippers on the floor. */
export const Slippers: React.FC<{x: number; y: number; w?: number; seed?: string; at?: At; ink?: number; color?: string}> = ({x, y, w = 160, seed = 'slip', at, ink = W.mid, color = EMBER.hl}) => (
  <>
    {[0, 1].map((i) => {
      const sx = x + i * w * 0.55;
      const sy = y + i * 6;
      const d = roundRect(sx, sy - w * 0.16, w * 0.45, w * 0.2, w * 0.1);
      return (
        <React.Fragment key={i}>
          <Fill d={d} color={color} at={fillAt(at, i * 0.03)} seed={`${seed}/${i}`} />
          <Fill d={roundRect(sx + w * 0.2, sy - w * 0.19, w * 0.24, w * 0.15, w * 0.07)} color={EMBER.card} at={fillAt(at, 0.04 + i * 0.03)} offset={false} />
          <Ink d={roundRect(sx, sy - w * 0.16, w * 0.45, w * 0.2, w * 0.1, {closed: false, seed: `${seed}/i${i}`})} at={b(at, i * 0.03)} width={ink} />
        </React.Fragment>
      );
    })}
  </>
);

/** Steam above a cup or a mug top (re-export for the desk sets). */
export const CupSteam: React.FC<{x: number; y: number; seed?: string}> = ({x, y, seed = 'cup'}) => <Steam x={x} y={y} seed={seed} rise={60} r1={7} />;

/** A cosy glow ring: a flat lighter disc under a light source on a wall (the halo step, no gradient). */
export const HaloStep: React.FC<{cx: number; cy: number; r: number; colors?: [string, string]}> = ({cx, cy, r, colors = [EMBER.core, EMBER.ring]}) => (
  <>
    <circle cx={cx} cy={cy} r={r} fill={colors[0]} />
    <circle cx={cx} cy={cy} r={r * 0.62} fill={colors[1]} />
  </>
);

/** A jolt helper for the desk sets: the y offset of things that hop on a cause (S5: the shelf jolts 4 px). */
export const useJolt = (ats: number[] | undefined, amp = 4) => {
  const t = useTime();
  return rings(t, ats, amp, 4, 6);
};
