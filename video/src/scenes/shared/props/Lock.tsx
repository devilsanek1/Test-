// props/Lock.tsx — THE PHP LOCK (P1), the film's most important prop, plus the fix (sage) and the crate of fixes.
//
//   <Lock x={400} y={1135} size={20} depth="far" />                                  // S01 govB lock box (16x20)
//   <Lock x={540} y={1090} size={100} screwsOutAt={5.2} coverOpenAt={5.4} boltTestAt={5.9} gapMarkAt={6.15} bit />
//   <Lock x={488} y={960} size={75} state="blueprint" at={0.1} />                    // S05 blueprint detail, ink on white
//   <Lock ... state="sketch" at={2} />  <Lock ... state="ghost" at={3} />  <Lock ... state="dot" />
//   <Lock x={330} y={1130} size={42} state="fixed" at={1.2} />                       // THE FIX: sage box + cream check tag
//   <Lock ... dropAt={48.6} dropDist={260} rider={<Bit .../>} />                     // falls with a clunk, Bit rides it
//   <LockCrate x={440} y={1440} size={80} n={3} at={0.5} />   <NewLockIcon grip="bottom" size={60} />
//
// Anchor: (x, y) = the BOX CENTRE. size = box height in world px (width = 0.8 x size). Local design units: the box is
// 80 x 100 (x -40..40, y -50..50); `LOCK` lists the local points (gap, strike, keyhole...) and `lockPoint()` maps them.
// The flaw: inside (cover open), a long cream BAR bolt (13 units tall, bevelled tip) aimed straight at a high-contrast
// receiving SOCKET (a tealDark notch in the strike, lined by a cream rim, on the bolt's axis). Before the test a short stub
// already points at it; on the test the bar shoots ~77 % of the way (from the guide to the socket mouth) and STOPS SHORT
// with a knock-back, a 9-unit gap from the socket ("so close"); then a dashed cream ghost of the full bolt slides into the
// socket and holds 0.3 s (the "should be"); then Bit peeks out of the socket into the gap. The dashed bracket + ring
// (`gapMarkAt`) are optional extras. Fixed variant: same silhouette in sage, the bar seated in the socket, cream check tag
// on a loop (S06 builds it body -> loop -> tag at 0.07 s steps). LOD by on-screen height: < 7 px a flat dot, < 28 px a
// simple box (no hinge ticks / screw slots), full detail above (survives the zoom-3.25 dive and the 80x100 close-up).

import React, {useId} from 'react';
import {palette} from '../../../lib/theme';
import {ease as E, lerp, prog, springAt, springs, useTime} from '../../../lib/time';
import {Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitFade, useLook} from '../../../lib/exit';
import {check, circle, line, rect, rectPath, roundRect, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {bt, landSquash, lodOf, PropBase, PropRoot, usePropFrame} from './common';
import {Cobweb} from './Glyphs';
import {Bit} from './Bit';

export type LockState = 'closed' | 'open' | 'blueprint' | 'sketch' | 'ghost' | 'dot' | 'fixed';

/** Local design points (box 80 x 100 centred on 0,0). */
export const LOCK = {
  w: 80,
  h: 100,
  box: [-40, -50, 80, 100] as [number, number, number, number],
  cover: [-29, -37, 58, 74] as [number, number, number, number],
  keyhole: [0, -6] as Pt,
  screws: [
    [0, -44],
    [0, 44],
  ] as Pt[],
  /** The bolt guide the bar slides out of (x, y, w, h); its right edge (x -21) is where the bar comes out. */
  housing: [-28, -12, 7, 24] as [number, number, number, number],
  /** Bolt tip x: retracted (a 5-unit stub already aimed at the socket), short (the flaw: stops ~77 % of the way from the
   *  guide to the socket mouth, a 9-unit gap left), full (the fix: seated in the socket). */
  tip: {retracted: -16, short: 9, full: 24},
  /** Bolt half-height (a bar 13 units tall, up to 30 long at the short stop: reads as a bar, not a block). */
  boltR: 6.5,
  /** Strike block; its left face (x 18) is the socket mouth. */
  strike: [18, -19, 11, 38] as [number, number, number, number],
  /** The receiving socket: a tealDark notch in the strike's left face on the bolt's axis (the hole it never reaches),
   *  darker than the teal cavity. */
  slot: [18, -8, 6.5, 16] as [number, number, number, number],
  /** The cream rim lining the socket (outer notch edge): 3 units round the socket. */
  rim: [18, -11, 9.5, 22] as [number, number, number, number],
  /** Centre of the gap between the short bolt's tip and the socket mouth (where Bit lives). */
  gap: [13.5, 0] as Pt,
  /** Where Bit peeks out of the socket (his feet on the socket floor; flip him so he faces the bolt). */
  peek: [18, 8] as Pt,
  /** Tag hang point of the fixed variant (top-right corner loop). */
  loop: [33, -50] as Pt,
};

/** A local lock point in the parent's coordinates for a lock at (x, y) of height `size`. */
export const lockPoint = (x: number, y: number, size: number, p: Pt): Pt => [x + (p[0] * size) / LOCK.h, y + (p[1] * size) / LOCK.h];

export type LockProps = PropBase & {
  /** Box height in world px (width = 0.8 x size). Default 100. Overrides scale. */
  size?: number;
  state?: LockState;
  /** Body colour override (default sand; fixed = sage). */
  color?: string;
  /** Screws spin and pop out, 0.08 s apart. */
  screwsOutAt?: number;
  /** The hinged cover swings open (0.15 s). */
  coverOpenAt?: number;
  /** The cover swings shut again. */
  coverCloseAt?: number;
  /** The bolt shoots out (0.2 s) and stops short with a knock-back (the fixed variant seats in the socket). */
  boltTestAt?: number;
  /** The "should be": a dashed cream ghost of the full bolt slides from the short tip into the socket (0.07 s) and holds
   *  `shouldBeDur` (0.3 s), then is gone (one frame). Default boltTestAt + 0.36 (right after the recoil) on a flawed
   *  lock; false = never. */
  shouldBeAt?: number | false;
  shouldBeDur?: number;
  /** Optional dashed dimension bracket + ring at the gap (0.17 s); the read works without it. */
  gapMarkAt?: number;
  /** A quick cream glint on the box. */
  glintAt?: number;
  /** A white bar sweeps across the box (lens glint). */
  lensGlintAt?: number;
  /** Cobweb over the top-left corner (inkHair, 0.3 s). */
  cobwebAt?: number;
  /** Falls with gravity and lands with a clunk `dropDist` world px lower (default 3 x size); tilts 10 deg. */
  dropAt?: number;
  dropDist?: number;
  /** Pops on with the 7% overshoot (the fix going onto a door). */
  popOnAt?: number;
  /** A check strokes on (fixed: on the tag; else across the box). */
  checkAt?: number;
  /** The fixed variant's tag swings (pendulum -16 -> 0). */
  tagSwingAt?: number;
  /** Children in LOCK-LOCAL units drawn on top; they ride every move (drop, pop): e.g. Bit at LOCK.gap. */
  rider?: React.ReactNode;
  /** Children in lock-local units drawn inside the opened cavity (under the cover). */
  inside?: React.ReactNode;
  /** Bit lives in the socket: he peeks out of it into the gap toward the short bolt (inside the cavity, under the cover).
   *  `peekAt` defaults to boltTestAt + 0.72 (the bolt stops at +0.2, recoils, the ghost "should be" flashes 0.36-0.66).
   *  size = his length in lock-local units (default 15: 30 px on a 200 px close-up, so his pupil shows); peekAmount
   *  default 0.28 (head and antennae in the gap, the rest inside the socket). */
  bit?: boolean | {peekAt?: number; hideAt?: number; size?: number; alertAt?: number; peekAmount?: number; seed?: Seed};
  /** Force a level of detail (0 dot, 1 simple, 2 full). Default by on-screen size. */
  lod?: 0 | 1 | 2;
};

const BOX = LOCK.box;
const COV = LOCK.cover;
const R = 9;

export const Lock: React.FC<LockProps> = (p) => {
  const {x = 0, y = 0, size, state = 'closed', at, outAt, outDur, rot = 0, flip, seed = 'lock'} = p;
  const t = useTime();
  const look = useLook();
  const paperLook = look.fills === 'paper';
  const clipId = 'lk' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const scale = size !== undefined ? size / LOCK.h : p.scale ?? 1;
  const F = usePropFrame({scale, depth: p.depth, ink: p.ink, at, dur: p.dur, baseDur: 0.5, seed, defDepth: 'mid'});
  const lod = p.lod ?? (state === 'dot' ? 0 : lodOf(LOCK.h * F.k, 7, 28));
  const fixed = state === 'fixed';
  const paperish = state === 'blueprint' || state === 'sketch' || state === 'ghost';
  const body = p.color ?? (fixed ? palette.sage : palette.sand);
  const shade = fixed ? palette.teal : palette.tan;
  const coverCol = fixed ? palette.mintPale : palette.cream;
  const W = F.W;
  const T = F.T;
  if (at !== undefined && t < at && !(p.popOnAt !== undefined)) return null;
  if (p.popOnAt !== undefined && t < p.popOnAt) return null;

  // ---------------------------------------------------------------- motion of the whole lock
  let dy = 0;
  let dr = 0;
  let sx = 1;
  let sy = 1;
  if (p.dropAt !== undefined && t >= p.dropAt) {
    const dist = p.dropDist ?? 3 * scale * LOCK.h;
    const g = 4200;
    const tf = Math.sqrt((2 * dist) / g);
    const dt = t - p.dropAt;
    dy = dt < tf ? 0.5 * g * dt * dt : dist;
    dr = 10 * Math.min(1, dt / tf);
    const [lsx, lsy] = landSquash(t, p.dropAt + tf, 0.84);
    sx = lsx;
    sy = lsy;
  }
  let pop = 1;
  if (p.popOnAt !== undefined) pop = springAt(t, p.popOnAt, springs.pop);

  // ---------------------------------------------------------------- LOD 0: a flat dot
  if (lod === 0) {
    return (
      <PropRoot x={x} y={y + dy} s={scale} rot={rot + dr} flip={flip} outAt={outAt} outDur={outDur}>
        {state === 'ghost' ? null : <Fill rect={[-40, -50, 80, 100]} color={body} at={at} mode="snap" offset={false} seed={`${seed}/dot`} />}
        {state !== 'ghost' && paperLook ? <Ink d={rectPath(-40, -50, 80, 100)} at={at} width={W} taper={false} vary={0} seed={`${seed}/doti`} /> : null}
        {p.rider}
      </PropRoot>
    );
  }

  // ---------------------------------------------------------------- state progress
  // the hinge reads over ~6 frames: scaleX 1 -> edge-on -> -0.3 (its back shows) in 0.2 s
  const cover = paperish ? 1 : state === 'open' && p.coverOpenAt === undefined ? 1 : p.coverOpenAt !== undefined ? prog(t, p.coverOpenAt, 0.2, E.inOutSine) : 0;
  const coverShut = p.coverCloseAt !== undefined ? prog(t, p.coverCloseAt, 0.2, E.inOutSine) : 0;
  const open = Math.max(0, cover - coverShut);
  const tipTarget = fixed ? LOCK.tip.full : LOCK.tip.short;
  let tip = tipTarget;
  if (p.boltTestAt !== undefined) {
    // shot slide (0.2 s), then it hits its stop SHORT of the socket and knocks back 3 units (0.14 s); the fixed bolt
    // seats in the socket with a 1-unit settle
    const q = prog(t, p.boltTestAt, 0.2, E.outCubic);
    const dt = t - p.boltTestAt - 0.2;
    const knock = dt > 0 && dt < 0.14 ? -Math.sin((dt / 0.14) * Math.PI) * (fixed ? 1 : 3) : 0;
    tip = lerp(LOCK.tip.retracted, tipTarget, q) + knock;
  }
  const mech = open > 0.02 || paperish;

  // ---------------------------------------------------------------- pieces
  const out: React.ReactNode[] = [];
  const ink = (key: string, d: string, a: number | undefined, wk = 1, extra: Partial<React.ComponentProps<typeof Ink>> = {}) =>
    out.push(<Ink key={key} d={d} at={a} width={W * wk} seed={`${seed}/${key}`} {...extra} />);
  const fill = (key: string, d: string, color: string, a: number | undefined, extra: Partial<React.ComponentProps<typeof Fill>> = {}) =>
    out.push(<Fill key={key} d={d} color={color} at={a} offset={F.off} seed={`${seed}/${key}`} {...extra} />);

  const boxD = roundRect(BOX[0], BOX[1], BOX[2], BOX[3], R);

  if (state === 'ghost') {
    out.push(
      <ExitFade key="ghost" x={0} y={0}>
        <path d={boxD} fill="none" stroke={palette.ink} strokeWidth={W * 0.8} strokeDasharray={`${8} ${7}`} strokeLinecap="round" />
        <circle cx={LOCK.keyhole[0]} cy={LOCK.keyhole[1]} r={7} fill="none" stroke={palette.ink} strokeWidth={W * 0.6} strokeDasharray="3 4" />
      </ExitFade>,
    );
    return (
      <PropRoot x={x} y={y + dy} s={scale * pop} rot={rot + dr} flip={flip} outAt={outAt} outDur={outDur}>
        {out}
        {p.rider}
      </PropRoot>
    );
  }

  const sketch = state === 'sketch';
  const blue = state === 'blueprint';
  const wBody = sketch ? 0.7 : 1;

  // body
  if (!sketch) fill('body', boxD, blue ? palette.white : body, T(0.12), {mode: 'pop'});
  if (!paperish && lod === 2) fill('shade', rectPath(-40, -41, 8, 82), shade, T(0.2), {offset: false, mode: 'snap'});

  // cavity + mechanism (visible when the cover is open, and always in blueprint / sketch)
  // marks drawn ON the dark cavity are cream in colour (ink on tealDark does not read), ink on paper / white
  const onPaper = paperish || paperLook;
  const markCol = onPaper ? palette.ink : palette.cream;
  if (mech) {
    const cav = rectPath(COV[0], COV[1], COV[2], COV[3]);
    // the cavity is teal (one step lighter than the socket, so the hole reads and ink Bit shows on it)
    if (!paperish) fill('cav', cav, palette.teal, undefined, {offset: false, mode: 'none'});
    const [hx, hy0, hw, hh] = LOCK.housing;
    const hb = hx + hw; // guide right edge (where the bar comes out)
    const br = LOCK.boltR;
    const st = LOCK.strike;
    const sl = LOCK.slot;
    const rm = LOCK.rim;
    const f2 = (v: number) => v.toFixed(2);
    // the bar: cream, bevelled tip (it points at the socket)
    const boltL = Math.max(0, tip - hb);
    const barD = (x0: number, x1: number) => {
      const bev = Math.min(2.4, Math.max(0, x1 - x0) * 0.4);
      return `M${f2(x0)} ${-br}H${f2(x1 - bev)}L${f2(x1)} ${f2(-br + bev)}V${f2(br - bev)}L${f2(x1 - bev)} ${br}H${f2(x0)}`;
    };
    if (!paperish) {
      fill('housing', rectPath(hx, hy0, hw, hh), body, undefined, {offset: false, mode: 'none'});
      fill('strike', rectPath(st[0], st[1], st[2], st[3]), body, undefined, {offset: false, mode: 'none'});
      fill('rim', rectPath(rm[0], rm[1], rm[2], rm[3]), coverCol, undefined, {offset: false, mode: 'none'});
      fill('slot', rectPath(sl[0], sl[1], sl[2], sl[3]), palette.tealDark, undefined, {offset: false, mode: 'none'});
      if (boltL > 0.3) fill('bolt', barD(hb, tip) + 'Z', palette.cream, undefined, {offset: false, mode: 'none'});
    }
    const mw = lod === 2 ? 0.7 : 0.9;
    if (blue || sketch || paperLook) ink('cavI', rect(COV[0], COV[1], COV[2], COV[3], {seed: `${seed}/cv`, over: 3}), T(0.2), mw);
    // guide + strike as a "C" round the socket notch (rim outer edge) + the socket's inner edge (thinner)
    const strikeI = `M${st[0]} ${st[1]}H${st[0] + st[2]}V${st[1] + st[3]}H${st[0]}V${rm[1] + rm[3]}H${rm[0] + rm[2]}V${rm[1]}H${st[0]}Z`;
    ink('mechI', `M${hx} ${hy0}H${hb}V${hy0 + hh}H${hx}Z` + strikeI, blue || sketch ? T(0.3) : undefined, mw, {taper: false, vary: 0});
    // the socket's inner edge is the cream / tealDark colour edge; ink only where there are no fills (paper states)
    if (onPaper) ink('slotI', `M${sl[0]} ${sl[1]}H${sl[0] + sl[2]}V${sl[1] + sl[3]}H${sl[0]}`, blue || sketch ? T(0.33) : undefined, mw * 0.7, {taper: false, vary: 0});
    const boltI = boltL > 0.3 ? barD(hb, tip) + (lod === 2 && boltL > 8 ? `M${hb + 2} ${f2(-br + 3.4)}H${f2(tip - 4)}` : '') : '';
    if (boltI) ink('boltI', boltI, blue || sketch ? T(0.36) : undefined, mw, {taper: false, vary: 0});
    if (sketch) ink('mechI2', rect(hx + 1.2, hy0 + 1, hw, hh, {seed: `${seed}/s2`, over: 3}) + rect(hb + 1, -br + 1.5, Math.max(1, tip - hb), br * 2 - 2, {seed: `${seed}/s3`, over: 4}) + rect(st[0] + 1, st[1] + 1.2, st[2], st[3], {seed: `${seed}/s4`, over: 3}), T(0.38), 0.55);
    if (blue) {
      // centre line through the bolt (dash-dot) and a dimension line under the box
      ink('cl', `M-48 0H-40M-36 0H-34M-30 0H-20M-16 0H-14M-10 0H0M4 0H6M10 0H20M24 0H26M30 0H40M44 0H48`, T(0.45), 0.4, {taper: false, order: 'all'});
      ink('dim', line(-40, 62, 40, 62, {over: [0, 0], seed: `${seed}/dm`}) + `M-40 56V68M40 56V68M-40 62L-33 59M-40 62L-33 65M40 62L33 59M40 62L33 65`, T(0.5), 0.45, {taper: false});
    }
    // the "should be": a dashed ghost of the full bolt slides from the short tip into the socket and holds
    const sbAt = p.shouldBeAt === false || fixed ? undefined : p.shouldBeAt ?? (p.boltTestAt !== undefined ? p.boltTestAt + 0.36 : undefined);
    if (sbAt !== undefined && t >= sbAt && t < sbAt + (p.shouldBeDur ?? 0.3)) {
      const x0 = LOCK.tip.short + 0.8;
      const x1 = lerp(x0, LOCK.tip.full, prog(t, sbAt, 0.07, E.outCubic));
      const bev = Math.min(2.4, (x1 - x0) * 0.4);
      const d = `M${f2(x0)} ${-br}H${f2(x1 - bev)}L${f2(x1)} ${f2(-br + bev)}V${f2(br - bev)}L${f2(x1 - bev)} ${br}H${f2(x0)}`;
      out.push(<Ink key="should" d={d} width={W * 0.62} color={markCol} dash="3.2 2.6" cap="butt" seed={`${seed}/sb`} />);
    }
    out.push(<g key="inside">{p.inside}</g>);
    if (p.bit) {
      const b = p.bit === true ? {} : p.bit;
      const pk = b.peekAt ?? (p.boltTestAt !== undefined ? p.boltTestAt + 0.72 : undefined);
      out.push(
        <Bit key="bit" x={LOCK.peek[0]} y={LOCK.peek[1]} size={b.size ?? 15} flip peekAt={pk} peekAmount={b.peekAmount ?? 0.28} state={pk === undefined ? 'peek' : undefined} hideAt={b.hideAt} alertAt={b.alertAt} seed={b.seed ?? `${seed}/bit`} />,
      );
    }
  }

  // gap mark (optional: dashed dimension bracket above the gap + a small ring round it)
  if (p.gapMarkAt !== undefined || blue || sketch) {
    const ga = p.gapMarkAt ?? T(0.55);
    if (ga === undefined || t >= ga) {
      const x0 = LOCK.tip.short;
      const x1 = LOCK.strike[0];
      const yb = LOCK.strike[1] - 4;
      let dash = `M${x0} ${yb - 3}V${yb + 3}M${x1} ${yb - 3}V${yb + 3}`;
      for (let xx = x0 + 1.3; xx < x1 - 1; xx += 3.4) dash += `M${xx.toFixed(1)} ${yb}H${Math.min(x1 - 1.3, xx + 1.8).toFixed(1)}`;
      ink('gapB', dash, ga, 0.55, {taper: false, dur: 0.12, color: markCol});
      ink('gapR', circle(LOCK.gap[0], LOCK.gap[1], 8, {seed: `${seed}/gr`, overlap: 20}), bt(ga, 0.05), 0.6, {taper: false, dur: 0.12, color: markCol});
    }
  }

  // screws (on the box frame, outside the cover)
  if (!paperish) {
    LOCK.screws.forEach(([sxp, syp], i) => {
      const so = p.screwsOutAt !== undefined ? p.screwsOutAt + i * 0.08 : undefined;
      const spin = so !== undefined ? prog(t, so, 0.1, E.inQuad) : 0;
      const fly = so !== undefined ? prog(t, so + 0.1, 0.12, E.outCubic) : 0;
      // the empty hole stays
      if (spin > 0 || fly > 0) fill(`hole${i}`, roundRect(sxp - 3, syp - 3, 6, 6, 3), palette.tan, undefined, {offset: false, mode: 'none'});
      if (fly >= 1) return;
      const k = 1 + 0.7 * fly;
      const ox = 0;
      const oy = (syp < 0 ? -1 : 1) * 16 * fly;
      const slotA = 30 + 540 * spin;
      const ca = Math.cos((slotA * Math.PI) / 180) * 3;
      const sa = Math.sin((slotA * Math.PI) / 180) * 3;
      out.push(
        <XG key={`screw${i}`} m={mat.compose(mat.translate(sxp + ox, syp + oy), mat.scale(k))}>
          <Fill d={roundRect(-4.2, -4.2, 8.4, 8.4, 4.2)} color={lod === 2 ? palette.cream : palette.ink} at={T(0.3 + i * 0.04)} offset={false} seed={`${seed}/sc${i}`} lookExempt={lod < 2 && paperLook} />
          {lod === 2 ? <Ink d={circle(0, 0, 4.2, {seed: `${seed}/sci${i}`, overlap: 10}) + `M${-ca} ${-sa}L${ca} ${sa}`} at={T(0.26 + i * 0.04)} width={W * 0.5} taper={false} seed={`${seed}/sci${i}`} /> : null}
        </XG>,
      );
    });
  }

  // the hinged cover (front plate with the keyhole)
  if (!paperish) {
    const coverSx = 1 - 1.3 * open;
    if (Math.abs(coverSx) > 0.02) {
      const back = coverSx < 0;
      const hinge = COV[0];
      const coverD = roundRect(COV[0], COV[1], COV[2], COV[3], 4);
      out.push(
        <XG key="cover" m={mat.about(mat.scale(coverSx, 1), hinge, 0)}>
          <Fill d={coverD} color={back ? shade : coverCol} at={T(0.2)} offset={[F.off[0] * 0.6, F.off[1] * 0.6]} seed={`${seed}/cov`} />
          {!back && coverSx > 0.3 ? (
            // the keyhole is ink: it stays ink in the paper / line-art state (frame 0, the S13 un-build)
            <Fill d={`M0 -13a7 7 0 1 0 0.01 0Z` + `M-3.4 -2L-5.5 13H5.5L3.4 -2Z`} color={palette.ink} at={T(0.34)} offset={false} mode="snap" seed={`${seed}/kh`} lookExempt={paperLook} />
          ) : null}
          {lod === 2 || paperLook ? <Ink d={roundRect(COV[0], COV[1], COV[2], COV[3], 4, {closed: false, seed: `${seed}/covi`})} at={T(0.16)} width={W * (lod === 2 ? 0.75 : 0.6)} seed={`${seed}/covi`} vary={0} /> : null}
        </XG>,
      );
      // near edge-on the plate shows its thickness: one ink line at the free edge
      if (Math.abs(coverSx) < 0.25 && open > 0 && open < 1) ink('covEdge', `M${(hinge + COV[2] * coverSx).toFixed(2)} ${COV[1] + 2}V${COV[1] + COV[3] - 2}`, undefined, 0.9, {taper: false, vary: 0});
      if (lod === 2 && !back) ink('hinge', `M${hinge - 3} -26V-17M${hinge - 3} 17V26`, T(0.4), 1.3, {taper: false, order: 'all'});
    }
  }

  // box outline (on top: the reference draws the frame last-but-visible)
  if (sketch) {
    ink('boxS', rect(BOX[0], BOX[1], BOX[2], BOX[3], {seed: `${seed}/bs1`, over: 6}), T(0), wBody);
    ink('boxS2', rect(BOX[0] + 2, BOX[1] - 1.5, BOX[2] - 1, BOX[3] + 2, {seed: `${seed}/bs2`, over: 9}), T(0.12), wBody * 0.6);
  } else {
    ink('box', roundRect(BOX[0], BOX[1], BOX[2], BOX[3], R, {closed: false, seed: `${seed}/bi`}), T(0), wBody);
  }

  // fixed: loop ("shackle") + cream check tag hanging from the top-right corner
  if (fixed && lod >= 1) {
    const [lx, ly] = LOCK.loop;
    const loopAt = T(0.07);
    const tagAt = T(0.14);
    const sw = p.tagSwingAt !== undefined ? swingAngle(t, p.tagSwingAt) : 0;
    if (loopAt === undefined || t >= loopAt) {
      ink('loop', `M${lx - 7} ${ly + 2}C${lx - 8} ${ly - 14} ${lx + 10} ${ly - 15} ${lx + 9} ${ly + 1}`, loopAt, 0.85, {taper: false});
    }
    if (tagAt === undefined || t >= tagAt) {
      const ts = tagAt === undefined ? 1 : springAt(t, tagAt, springs.pop);
      const tagPts = `M${lx + 6} ${ly + 4}L${lx + 36} ${ly + 10}L${lx + 32} ${ly + 36}L${lx + 2} ${ly + 30}Z`;
      out.push(
        <XG key="tag" m={mat.compose(mat.about(mat.rotate(sw), lx + 2, ly + 1), mat.about(mat.scale(ts), lx + 4, ly + 4))}>
          <Fill d={tagPts} color={palette.cream} offset={[F.off[0] * 0.7, F.off[1] * 0.7]} seed={`${seed}/tagf`} />
          <Ink d={tagPts} width={W * 0.75} seed={`${seed}/tagi`} taper={false} />
          {lod === 2 ? <Ink d={circle(lx + 9, ly + 9, 2.2, {seed: `${seed}/th`})} width={W * 0.5} taper={false} seed={`${seed}/th`} /> : null}
          <Ink d={check(lx + 20, ly + 21, 15, {seed: `${seed}/tc`})} at={p.checkAt} dur={0.17} width={W * 0.85} taper={false} seed={`${seed}/tc`} />
        </XG>,
      );
    }
  } else if (p.checkAt !== undefined) {
    ink('check', check(0, 2, 70, {seed: `${seed}/ck`}), p.checkAt, 1.3, {dur: 0.17, taper: false});
  }

  // glints
  if (p.glintAt !== undefined && t >= p.glintAt && t < p.glintAt + 0.28) {
    const q = (t - p.glintAt) / 0.28;
    const s = q < 0.25 ? q / 0.25 : q > 0.7 ? (1 - q) / 0.3 : 1;
    out.push(
      <ExitFade key="glint">
        <g transform={`translate(-22 -30) scale(${s.toFixed(3)})`}>
          <path d="M-6 8L8 -10M2 12L12 0" stroke={palette.white} strokeWidth={W * 0.9} strokeLinecap="round" fill="none" />
        </g>
      </ExitFade>,
    );
  }
  if (p.lensGlintAt !== undefined && t >= p.lensGlintAt && t < p.lensGlintAt + 0.32) {
    const q = E.inOutSine((t - p.lensGlintAt) / 0.32);
    const bx = lerp(-80, 80, q);
    out.push(
      <ExitFade key="lens">
        <defs>
          <clipPath id={clipId}>
            <path d={boxD} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path d={`M${bx - 10} 60L${bx + 30} -60H${bx + 44}L${bx + 4} 60Z`} fill={palette.white} />
        </g>
      </ExitFade>,
    );
  }
  if (p.cobwebAt !== undefined) out.push(<Cobweb key="web" x={-40} y={-50} r={36} corner="tl" at={p.cobwebAt} width={(1.6 / scale) * (scale < 0.5 ? 0.8 : 1)} seed={`${seed}/web`} />);

  return (
    <PropRoot x={x} y={y + dy} s={scale} rot={rot + dr} flip={flip} outAt={outAt} outDur={outDur}>
      <XG m={mat.about(mat.scale(sx * pop, sy * pop), 0, 50)}>
        {out}
        {p.rider}
      </XG>
    </PropRoot>
  );
};

/** Pendulum used by the fixed tag. */
function swingAngle(t: number, at: number): number {
  if (t < at) return 0;
  const dt = t - at;
  return -16 * Math.exp(-dt * 5.5) * Math.cos((2 * Math.PI * dt) / 0.5);
}

// ---------------------------------------------------------------- NewLockIcon / LockCrate

/** The fix as a bare icon for a mascot prop slot: grip 'bottom' = (0, 0) is the bottom centre (the trunk holds it from
 *  below, the lock points up), 'top' = hangs from (0, 0), 'center'. size = box height. */
export const NewLockIcon: React.FC<{size?: number; grip?: 'bottom' | 'top' | 'center'; at?: number; checkAt?: number; seed?: Seed; depth?: LockProps['depth']; tagSwingAt?: number}> = ({
  size = 50,
  grip = 'bottom',
  at,
  checkAt,
  seed = 'newlock',
  depth = 'mid',
  tagSwingAt,
}) => {
  const cy = grip === 'bottom' ? -size / 2 : grip === 'top' ? size / 2 : 0;
  return <Lock x={0} y={cy} size={size} state="fixed" at={at} checkAt={checkAt ?? at} seed={seed} depth={depth} tagSwingAt={tagSwingAt} />;
};

export type LockCrateProps = PropBase & {
  /** Crate width in world px (height 0.62 x). Default 80. */
  size?: number;
  /** Number of fixed locks peeking out. Default 3. */
  n?: number;
  /** Checks stroke onto the tags. */
  checkAt?: number;
};

/** A sand crate of fixed locks (S07 cart, S10 stoop, S12 steps). (x, y) = bottom centre. */
export const LockCrate: React.FC<LockCrateProps> = ({x = 0, y = 0, size = 80, n = 3, at, dur, outAt, outDur, seed = 'crate', depth, ink, rot, flip, checkAt}) => {
  const s = size / 80;
  const F = usePropFrame({scale: s, depth, ink, at, dur, baseDur: 0.5, seed, defDepth: 'mid'});
  const lod = lodOf(80 * F.k, 10, 40);
  const w = 80;
  const h = 50;
  const T = F.T;
  const locks: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const lx = -w / 2 + (w * (i + 0.5)) / n + (i % 2 ? 2 : -2);
    locks.push(<Lock key={i} x={lx} y={-h + 4 - (i % 2 ? 4 : 0)} size={34} state="fixed" at={T(0.3 + i * 0.07)} checkAt={checkAt} seed={`${seed}/l${i}`} ink={F.W} lod={lod === 0 ? 0 : undefined} rot={(i - (n - 1) / 2) * 7} />);
  }
  return (
    <PropRoot x={x} y={y} s={s} rot={rot} flip={flip} outAt={outAt} outDur={outDur}>
      {locks}
      <Fill rect={[-w / 2, -h, w, h]} color={palette.sand} at={T(0.12)} offset={F.off} seed={`${seed}/f`} />
      {lod >= 1 ? <Fill rect={[-w / 2, -h, 9, h]} color={palette.tan} at={T(0.2)} offset={false} mode="snap" seed={`${seed}/sh`} /> : null}
      {lod >= 1 ? <Ink d={rect(-w / 2, -h, w, h, {seed: `${seed}/o`, over: 4})} at={T(0)} width={F.W} seed={`${seed}/o`} /> : null}
      {lod === 2 ? <Ink d={line(-w / 2 + 4, -h * 0.5, w / 2 - 4, -h * 0.5, {over: [0, 0], seed: `${seed}/s1`}) + line(-w / 2 + 12, -h + 4, -w / 2 + 12, -4, {over: [0, 0], seed: `${seed}/s2`}) + line(w / 2 - 12, -h + 4, w / 2 - 12, -4, {over: [0, 0], seed: `${seed}/s3`})} at={T(0.18)} width={F.W * 0.65} seed={`${seed}/sl`} order="all" /> : null}
    </PropRoot>
  );
};

// ---------------------------------------------------------------- LockSpecks (batched, for hundreds of far doors)

export type LockSpot = {x: number; y: number; size: number; at?: number; fixed?: boolean};

/** Hundreds of far locks (S02 / S03 rows, S10's ~650 doors) as TWO paths: sand (or sage) boxes + one ink outline path
 *  for spots >= `inkFrom` px tall (world). Each pops at its `at` (one frame +30 %). Use the full <Lock> for the few near
 *  ones. Ink width in world px (S10: authored in world units). */
export const LockSpecks: React.FC<{spots: LockSpot[]; ink?: number; inkFrom?: number; outAt?: number}> = ({spots, ink = 0.6, inkFrom = 6, outAt}) => {
  const t = useTime();
  if (outAt !== undefined && t >= outAt) return null;
  let sand = '';
  let sage = '';
  let line_ = '';
  for (const sp of spots) {
    if (sp.at !== undefined && t < sp.at) continue;
    const k = sp.at !== undefined && t < sp.at + 0.067 ? 1.3 : 1;
    const h = sp.size * k;
    const w = h * 0.8;
    const d = `M${(sp.x - w / 2).toFixed(2)} ${(sp.y - h / 2).toFixed(2)}h${w.toFixed(2)}v${h.toFixed(2)}h${(-w).toFixed(2)}z`;
    if (sp.fixed) sage += d;
    else sand += d;
    if (sp.size >= inkFrom) line_ += d;
  }
  return (
    <ExitFade>
      {sand ? <path d={sand} fill={palette.sand} /> : null}
      {sage ? <path d={sage} fill={palette.sage} /> : null}
      {line_ && ink > 0 ? <path d={line_} fill="none" stroke={palette.ink} strokeWidth={ink} strokeLinejoin="round" /> : null}
    </ExitFade>
  );
};
