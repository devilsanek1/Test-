// sets/rows.tsx — PerspRow: a row of "website" houses on a receding street wall (one-point perspective), built for
// render cost: every house is a handful of batched paths computed ONCE in screen space through the wall's homography
// (fills per colour + one ink path per house), and real props (Lock, ElephantPlaque) are placed only where they are big
// enough to read; farther ones are flat dots in the batch. Ink thins with distance (2.2 -> 1.6 -> none).
//
//   const row = perspRowLayout({quad: wallQuad({vp, x: 520, top: 660, bottom: 1370, depth: 0.96}), n: 10, seed: 'L'})
//   row.houses[i].door / .lock / .plaque / .top / .h     // screen anchors, near -> far (ripples, "?" marks, tags)
//   <PerspRow layout={row} popAt={[...]} lit={night} />
//
// Local wall coordinates: x 0..n*hw along the wall, y 0 (roofline) .. H (base). Houses are laid out near -> far.

import React from 'react';
import {palette} from '../../../lib/theme';
import {useTime} from '../../../lib/time';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {line, Pt} from '../../../lib/sketch';
import {applyH, rectToQuad, Quad} from '../../../lib/persp';
import {rand, rng, Seed} from '../../../lib/rng';
import {PopUp, SI} from './common';
import {LockSlot, LockVariant, PlaqueSlot} from './propSlots';
import {shadeOf} from './SiteFacade';

export type RowHouse = {
  i: number;
  /** On-screen height of the facade (px at rest) and its LOD tier. */
  h: number;
  tier: 'full' | 'simple' | 'dots' | 'fill';
  color: string;
  /** Screen anchors. */
  base: Pt;
  top: Pt;
  door: Quad;
  /** Point just above the door (wrench tags, "?" marks, ghost locks). */
  overDoor: Pt;
  lock: {x: number; y: number; h: number};
  plaque: {x: number; y: number; size: number};
  browser: Quad;
  /** Geometry (screen-space path strings). */
  g: {facade: string; shade: string; cornice: string; glass: string; dark: string; lit: string; door: string; kick: string; frame: string; screen: string; bar: string; dots: string; stoop: string; plaqueDot: string; lockDot: string; ink: string; thin: string; awning: string; shutters: string};
};

export type PerspRowSpec = {
  quad: Quad;
  n: number;
  /** Local height of the wall (px). Default 700. Local house width = hw (default 0.62 x H / storeys x storeys...). */
  H?: number;
  hw?: number;
  storeys?: number;
  /** Facade colours cycled per house. */
  colors?: string[];
  /** Which side the wall is on (left walls run near -> far in local x; right walls far -> near). */
  side?: 'left' | 'right';
  /** Gap between houses (local px): a thin slice of the next facade's side. */
  gap?: number;
  /** Plaque variant per house index (default 'new'); false = none. */
  plaque?: (i: number) => 'new' | 'blank' | 'old' | false;
  /** Door stoop (two steps toward the street, screen px at the near house). Default true. */
  stoop?: boolean;
  /** Lit window fraction at night. */
  litFraction?: number;
  seed?: Seed;
};

export type PerspRowLayout = {spec: PerspRowSpec; houses: RowHouse[]};

const f1 = (n: number) => n.toFixed(1);
const quadPath = (q: Quad) => `M${f1(q[0][0])} ${f1(q[0][1])}L${f1(q[1][0])} ${f1(q[1][1])}L${f1(q[2][0])} ${f1(q[2][1])}L${f1(q[3][0])} ${f1(q[3][1])}Z`;


/** Geometry of ONE house through a local->screen map P (local x along the facade 0..hw, y 0 roofline .. H base). */
function houseGeo(o: {i: number; P: (x: number, y: number) => Pt; left: boolean; hx: number; w: number; gap: number; H: number; storeys: number; color: string; litFraction?: number; seed: string; stoop?: boolean; plaqueK?: number}): RowHouse {
  const {i, P, left, hx, w, gap, H, storeys, color} = o;
  const Q = (x: number, y: number, ww: number, h: number): Quad => {
    const a = P(x, y);
    const b = P(x + ww, y);
    const c = P(x + ww, y + h);
    const d = P(x, y + h);
    return left ? [a, b, c, d] : [b, a, d, c];
  };
  const sh = (H * 0.95) / storeys;
  const spec = {seed: o.seed, litFraction: o.litFraction, stoop: o.stoop};

  const fq = Q(hx, 0, w, H);
  const hScreen = Math.abs(fq[3][1] - fq[0][1]);
  const tier: RowHouse['tier'] = hScreen >= 330 ? 'full' : hScreen >= 120 ? 'simple' : hScreen >= 36 ? 'dots' : 'fill';
  const cornH = H * 0.045;
  // door (ground storey)
  const dw = w * 0.24;
  const dh = sh * 0.8;
  const dx = hx + w * (left ? 0.5 : 0.26);
  const door = Q(dx, H - dh, dw, dh);
  const kick = Q(dx + dw * 0.12, H - dh * 0.32, dw * 0.76, dh * 0.24);
  const frame = Q(dx - dw * 0.12, H - dh - dw * 0.12, dw * 1.24, dh + dw * 0.12);
  // plaque left of the door (as seen), lock on the door
  const pxL = left ? dx - w * Math.max(0.1, (o.plaqueK ?? 0.09) * 0.7) : dx + dw + w * Math.max(0.1, (o.plaqueK ?? 0.09) * 0.7);
  const pk = o.plaqueK ?? 0.09;
  const pq = Q(pxL - w * pk * 0.5, H - sh * 0.55 - (pk > 0.1 ? sh * 0.1 : 0), w * pk, w * pk);
  const pc = centroid(pq);
  const pSize = Math.abs(pq[1][0] - pq[0][0]) * 0.95;
  const lc = P(dx + dw * (left ? 0.8 : 0.2), H - dh * 0.47);
  const lh = Math.abs(P(dx, H - dh * 0.47 + dw * 0.17)[1] - P(dx, H - dh * 0.47 - dw * 0.17)[1]);
  // browser window: second storey from the top, wide
  const bq = Q(hx + w * 0.16, cornH + sh * 0.9, w * 0.68, sh * 0.62);
  const barq = Q(hx + w * 0.16, cornH + sh * 0.9, w * 0.68, sh * 0.62 * 0.24);
  const scq = Q(hx + w * 0.16, cornH + sh * 0.9 + sh * 0.62 * 0.24, w * 0.68, sh * 0.62 * 0.76);
  // ordinary windows: 2 per storey on the other storeys (not the door storey's door column)
  let glass = '';
  let dark = '';
  let lit = '';
  let thin = '';
  let shutters = '';
  for (let s = 0; s < storeys; s++) {
    if (s === 1) continue; // browser storey
    for (const c of [0.14, 0.6]) {
      const wx = hx + w * c;
      const wy = cornH + s * sh + sh * 0.22;
      const ww = w * 0.24;
      const wh = sh * 0.5;
      if (s === storeys - 1 && wx + ww > dx - w * 0.16 && wx < dx + dw + 4) continue;
      const q = Q(wx, wy, ww, wh);
      if (tier === 'full' || tier === 'simple') shutters += quadPath(Q(wx - ww * 0.3, wy, ww * 0.26, wh)) + quadPath(Q(wx + ww * 1.04, wy, ww * 0.26, wh));
      const k = rand(String(spec.seed ?? 'row'), `${i}/${s}/${c}`);
      if (k < (spec.litFraction ?? 0.55)) lit += quadPath(q);
      if (tier === 'full' || tier === 'simple') {
        const pf = Q(wx, wy + (k > 0.5 ? 0 : wh * 0.45), ww, wh * 0.55);
        glass += quadPath(pf);
        if (tier === 'full') thin += line(q[0][0], q[0][1], q[1][0], q[1][1], {over: 'small', seed: `w${i}${s}${c}a`}) + line(q[0][0], q[0][1], q[3][0], q[3][1], {over: 'small', seed: `w${i}${s}${c}b`}) + line(q[3][0] - 3, q[3][1] + 3, q[2][0] + 3, q[2][1] + 3, {over: 'small', seed: `w${i}${s}${c}c`});
      } else if (tier === 'dots') dark += quadPath(q);
    }
  }
  // stoop: two steps from the door's foot toward the street
  let stoop = '';
  if (spec.stoop !== false && tier !== 'fill') {
    const bl = door[3];
    const br = door[2];
    const out = Math.max(1, Math.abs(br[0] - bl[0]) * 0.55) * (left ? 1 : -1);
    const dy = Math.abs(fq[3][1] - fq[0][1]) * 0.025;
    stoop += quadPath([bl, br, [br[0] + out * 0.5, br[1] + dy], [bl[0] + out * 0.5, bl[1] + dy]]);
    stoop += quadPath([[bl[0] + out * 0.5, bl[1] + dy], [br[0] + out * 0.5, br[1] + dy], [br[0] + out, br[1] + dy * 2.1], [bl[0] + out, bl[1] + dy * 2.1]]);
  }
  let ink = '';
  if (tier === 'full' || tier === 'simple') {
    ink += line(fq[0][0], fq[0][1] - 2, fq[1][0], fq[1][1] - 2, {over: [3, 3], seed: `rt${i}`, breaks: false});
    ink += line(fq[0][0], fq[0][1], fq[3][0], fq[3][1], {over: [2, 4], seed: `rl${i}`, breaks: false});
    const cq = Q(hx - gap / 2, cornH, w + gap, 0);
    ink += line(cq[0][0], cq[0][1], cq[1][0], cq[1][1], {over: [2, 2], seed: `rc${i}`, breaks: false});
    ink += line(frame[0][0], frame[0][1], frame[3][0], frame[3][1], {over: 'small', seed: `rd1${i}`}) + line(frame[1][0], frame[1][1], frame[2][0], frame[2][1], {over: 'small', seed: `rd2${i}`}) + line(frame[0][0], frame[0][1], frame[1][0], frame[1][1], {over: 'small', seed: `rd3${i}`});
    ink += line(bq[0][0], bq[0][1], bq[1][0], bq[1][1], {over: 'small', seed: `rb1${i}`}) + line(bq[0][0], bq[0][1], bq[3][0], bq[3][1], {over: 'small', seed: `rb2${i}`}) + line(bq[1][0], bq[1][1], bq[2][0], bq[2][1], {over: 'small', seed: `rb3${i}`}) + line(bq[3][0], bq[3][1], bq[2][0], bq[2][1], {over: 'small', seed: `rb4${i}`});
  }
  let dots = '';
  if (tier !== 'fill') {
    const bh = Math.abs(barq[3][1] - barq[0][1]);
    const rr = Math.max(0.6, bh * 0.22);
    for (let k = 0; k < 3; k++) {
      const u = 0.06 + k * 0.07;
      const c = P(left ? hx + w * 0.16 + w * 0.68 * u : hx + w * 0.84 - w * 0.68 * u, cornH + sh * 0.9 + sh * 0.62 * 0.12);
      dots += circlePath(c[0], c[1], rr);
    }
  }
  const shadeQ = Q(left ? hx : hx + w * 0.78, cornH, w * 0.22, H - cornH);
  // a flat awning over the door frame (a quad on the wall plane, a little wider than the frame)
  const awning = tier === 'fill' ? '' : quadPath(Q(dx - dw * 0.34, H - dh - dw * 0.12 - sh * 0.16, dw * 1.68, sh * 0.13));
  return ({
    i,
    h: hScreen,
    tier,
    color,
    base: P(hx + w / 2, H),
    top: P(hx + w / 2, 0),
    door,
    overDoor: P(dx + dw / 2, H - dh - sh * 0.28),
    lock: {x: lc[0], y: lc[1], h: lh},
    plaque: {x: pc[0], y: pc[1], size: pSize},
    browser: bq,
    g: {
      facade: quadPath(fq),
      shade: quadPath(shadeQ),
      cornice: quadPath(Q(hx - gap / 2, 0, w + gap, cornH)),
      glass,
      dark,
      lit,
      door: quadPath(door),
      kick: quadPath(kick),
      frame: quadPath(frame),
      screen: quadPath(scq),
      bar: quadPath(barq),
      dots,
      stoop,
      plaqueDot: quadPath(pq),
      lockDot: quadPath(Q(dx + dw * (left ? 0.7 : 0.1), H - dh * 0.55, dw * 0.2, dw * 0.25)),
      ink,
      thin,
      awning,
      shutters,
    },
  });

}

const LAYOUTS = new Map<string, PerspRowLayout>();

/** Pure, memoised layout of a row (screen anchors + batched geometry). */
export function perspRowLayout(spec: PerspRowSpec): PerspRowLayout {
  const key = JSON.stringify(spec, (k, v) => (typeof v === 'function' ? String(v) : v));
  const hit = LAYOUTS.get(key);
  if (hit) return hit;
  const H = spec.H ?? 700;
  const storeys = spec.storeys ?? 4;
  const hw = spec.hw ?? H * 0.62;
  const n = spec.n;
  const W = n * hw;
  const left = (spec.side ?? (spec.quad[0][0] < spec.quad[1][0] && spec.quad[3][1] > spec.quad[2][1] ? 'left' : 'right')) === 'left';
  const Hm = rectToQuad(W, H, spec.quad);
  const P = (x: number, y: number): Pt => applyH(Hm, left ? x : W - x, y);
  const colors = spec.colors ?? [palette.cream, palette.sand, palette.tan, palette.mintPale];
  const gap = spec.gap ?? hw * 0.04;
  const houses: RowHouse[] = [];
  for (let i = 0; i < n; i++) {
    houses.push(houseGeo({i, P, left, hx: i * hw + gap / 2, w: hw - gap, gap, H, storeys, color: colors[i % colors.length], litFraction: spec.litFraction, seed: String(spec.seed ?? 'row'), stoop: spec.stoop}));
  }
  const out = {spec, houses};
  if (LAYOUTS.size > 200) LAYOUTS.clear();
  LAYOUTS.set(key, out);
  return out;
}

/** A row whose houses each have their OWN screen quad (TL, TR, BR, BL), e.g. S02's pop-up side buildings with explicit
 *  boundaries. Each house maps a local rect (hw x H) onto its quad. */
export function quadRowLayout(o: {quads: Quad[]; side: 'left' | 'right'; storeys?: number; colors?: string[]; plaque?: (i: number) => 'new' | 'blank' | 'old' | false; stoop?: boolean; seed?: Seed; litFraction?: number; plaqueK?: number}): PerspRowLayout {
  const key = 'q' + JSON.stringify(o, (k, v) => (typeof v === 'function' ? String(v) : v));
  const hit = LAYOUTS.get(key);
  if (hit) return hit;
  const H = 700;
  const hw = 420;
  const colors = o.colors ?? [palette.cream, palette.sand, palette.tan, palette.mintPale];
  const left = o.side === 'left';
  const houses = o.quads.map((q, i) => {
    // local x runs near -> far along the wall: for a left wall that is q's left -> right, for a right wall right -> left
    const src: Quad = left ? q : [q[1], q[0], q[3], q[2]];
    const Hm = rectToQuad(hw, H, src);
    const P = (x: number, y: number): Pt => applyH(Hm, x, y);
    return houseGeo({i, P, left, hx: hw * 0.02, w: hw * 0.96, gap: hw * 0.04, H, storeys: o.storeys ?? 4, color: colors[i % colors.length], litFraction: o.litFraction, seed: String(o.seed ?? 'qrow'), stoop: o.stoop, plaqueK: o.plaqueK});
  });
  const out: PerspRowLayout = {spec: {quad: o.quads[0], n: o.quads.length, side: o.side, plaque: o.plaque, seed: o.seed}, houses};
  LAYOUTS.set(key, out);
  return out;
}

const centroid = (q: Quad): Pt => [(q[0][0] + q[1][0] + q[2][0] + q[3][0]) / 4, (q[0][1] + q[1][1] + q[2][1] + q[3][1]) / 4];
const circlePath = (cx: number, cy: number, r: number) => `M${f1(cx - r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0z`;

export type PerspRowProps = {
  layout: PerspRowLayout;
  /** Per-house pop-up times (pop-up book, S02); omit = standing. */
  popAt?: (i: number) => number | undefined;
  /** Fill-first draw-on: fills snap at `drawAt + i * stagger`, ink follows 0.12 s later. */
  drawAt?: number;
  stagger?: number;
  /** Night: lit windows (peach) from this time (true = lit). */
  lit?: boolean | number;
  /** Colour of the lit windows (default peach; sand = drawn curtains). */
  litColor?: string;
  /** Lights out (one step darker) at this time. */
  offAt?: number;
  /** Real props down to this on-screen lock height (px); below it, flat dots. Default 7. */
  propMin?: number;
  /** Lock variant on every door (default 'closed'); per index override. */
  lock?: (i: number) => LockVariant | false;
  /** Screen state of the browser windows: glow (cream) by default; 'dark' = tealDark. */
  screens?: 'on' | 'dark';
  /** Ink widths [near, far] (screen px). Default [2.2, 1.6]. */
  ink?: [number, number];
  /** Pane colour of the ordinary windows (default sage). */
  glass?: string;
  /** Flat awning over every door in this colour (full / simple / dots tiers); default none. */
  awning?: string;
  /** Flat shutters beside every ordinary window in this colour (full / simple tiers); default none. */
  shutters?: string;
  /** Per-house plaque tick-on time (pop with overshoot); omit = there. */
  plaqueAt?: (i: number) => number | undefined;
  /** Render only houses in [from, to). */
  from?: number;
  to?: number;
  seed?: Seed;
};

export const PerspRow: React.FC<PerspRowProps> = ({layout, popAt, drawAt, stagger = 0.05, lit, litColor = palette.peach, offAt, propMin = 7, lock, screens = 'on', ink = [SI.far, SI.hair], glass = palette.sage, awning, shutters, plaqueAt, from = 0, to, seed = 'pr'}) => {
  const t = useTime();
  const litOn = lit === true || (typeof lit === 'number' && t >= lit);
  const dark = offAt !== undefined && t >= offAt;
  const houses = layout.houses.slice(from, to);
  // far -> near so nearer houses overlap farther ones
  const order = houses.slice().sort((a, b) => a.h - b.h);
  return (
    <>
      {order.map((h) => {
        const at = drawAt !== undefined ? drawAt + h.i * stagger : undefined;
        const inkAt = at !== undefined ? at + 0.12 : undefined;
        const g = h.g;
        const iw = h.tier === 'full' ? ink[0] : ink[1];
        const lk = lock ? lock(h.i) : 'closed';
        const pv = layout.spec.plaque ? layout.spec.plaque(h.i) : 'new';
        const facadeColor = dark ? shadeOf(h.color) : h.color;
        const node = (
          <>
            <Fill d={g.facade} color={facadeColor} at={at} mode="snap" seed={`${seed}/f${h.i}`} />
            {h.tier !== 'fill' ? <Fill d={g.shade} color={shadeOf(facadeColor)} at={at} mode="snap" offset={false} seed={`${seed}/s${h.i}`} /> : null}
            {h.tier !== 'fill' ? <Fill d={g.cornice} color={palette.tan} at={at} mode="snap" offset={false} seed={`${seed}/c${h.i}`} /> : null}
            {shutters && g.shutters ? <Fill d={g.shutters} color={shutters} at={at} mode="snap" offset={false} seed={`${seed}/sh${h.i}`} /> : null}
            {g.glass ? <Fill d={g.glass} color={glass} at={at} mode="snap" seed={`${seed}/g${h.i}`} /> : null}
            {g.dark && !litOn ? <Fill d={g.dark} color={palette.tealDark} at={at} mode="snap" offset={false} seed={`${seed}/k${h.i}`} /> : null}
            {litOn && g.lit ? <Fill d={g.lit} color={litColor} mode="snap" offset={false} seed={`${seed}/l${h.i}`} /> : null}
            {h.tier !== 'fill' ? (
              <>
                <Fill d={g.screen} color={screens === 'dark' || dark ? palette.tealDark : palette.cream} at={at} mode="snap" offset={false} seed={`${seed}/sc${h.i}`} />
                <Fill d={g.bar} color={palette.tealDark} at={at} mode="snap" offset={false} seed={`${seed}/b${h.i}`} />
                {g.dots ? <Fill d={g.dots} color={palette.peach} at={at} mode="snap" offset={false} seed={`${seed}/d${h.i}`} /> : null}
                <Fill d={g.frame} color={palette.tan} at={at} mode="snap" offset={false} seed={`${seed}/fr${h.i}`} />
                <Fill d={g.door} color={palette.teal} at={at} mode="snap" seed={`${seed}/dr${h.i}`} />
                {h.tier !== 'dots' ? <Fill d={g.kick} color={palette.tealDark} at={at} mode="snap" offset={false} seed={`${seed}/kk${h.i}`} /> : null}
                {g.stoop ? <Fill d={g.stoop} color={palette.sand} at={at} mode="snap" seed={`${seed}/st${h.i}`} /> : null}
                {awning && g.awning ? <Fill d={g.awning} color={awning} at={at} mode="snap" seed={`${seed}/aw${h.i}`} /> : null}
              </>
            ) : (
              <Fill d={g.door} color={palette.teal} at={at} mode="snap" offset={false} seed={`${seed}/dr${h.i}`} />
            )}
            {g.ink ? <Ink d={g.ink} width={iw} at={inkAt} taper={false} seed={`${seed}/i${h.i}`} /> : null}
            {g.thin ? <Ink d={g.thin} width={ink[1] * 0.8} at={inkAt} taper={false} seed={`${seed}/t${h.i}`} /> : null}
            {/* plaque + lock: real props when big enough, flat dots otherwise */}
            {pv !== false && h.tier !== 'fill' ? (
              h.plaque.size >= propMin * 1.2 ? (
                <PlaqueSlot x={h.plaque.x} y={h.plaque.y} size={h.plaque.size} variant={pv} seed={`${seed}/pq${h.i}`} width={ink[1] * 0.8} at={plaqueAt ? plaqueAt(h.i) : at} />
              ) : (
                <Fill d={g.plaqueDot} color={pv === 'blank' ? palette.cream : pv === 'old' ? palette.tan : palette.sand} at={plaqueAt ? plaqueAt(h.i) : at} mode="snap" offset={false} seed={`${seed}/pd${h.i}`} />
              )
            ) : null}
            {lk !== false && h.tier !== 'fill' ? (
              h.lock.h >= propMin ? (
                <LockSlot x={h.lock.x} y={h.lock.y} w={h.lock.h * 0.8} h={h.lock.h} variant={lk} seed={`${seed}/lk${h.i}`} width={ink[1] * 0.7} at={at} />
              ) : lk !== 'ghost' ? (
                <Fill d={g.lockDot} color={lk === 'fixed' ? palette.sage : palette.sand} at={at} mode="snap" offset={false} seed={`${seed}/ld${h.i}`} />
              ) : null
            ) : null}
          </>
        );
        const pa = popAt ? popAt(h.i) : undefined;
        return (
          <React.Fragment key={h.i}>
            {pa !== undefined ? (
              <PopUp at={pa} x={h.base[0]} y={h.base[1]}>
                {node}
              </PopUp>
            ) : (
              node
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
