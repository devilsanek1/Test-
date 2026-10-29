// props/NoticeBoard.tsx — the public board with an ADDRESS-BAR top rail (P8, S07 / S13) and the leaked page (LeakSheet).
//
//   <RailBoard x={140} y={930} w={600} h={430} rail={{w: 440, h: 30}} riseAt={30.6} railLightAt={32.1}
//     pane1={(r) => <LeakSheet x={r.x + r.w / 2} y={r.y + r.h / 2} w={210} h={270} />} />           // S07
//   <RailBoard x={300} y={1090} w={500} h={310} rail={{w: 340, h: 28}} paneDarkAt={67.4}
//     pane1={(r) => <PowerGlyph .../>} pane2={(r) => <Caretaker .../>} pane2ScaleInAt={67.9} outAt={69.84} />  // S13
//   <LeakSheet x={295} y={1095} w={210} h={270} at={30.5} doodleAt={30.7} ringAt={31.4}
//     lensWipe={{at: 30.48, from: [620, 1500]}} />                                                   // the S07 lens wipe
//   <LeakSheet ... flutter={{at: 30.2, from: [-200, 1100]}} />  <LeakSheet ... peg />                 // S06 blow-in / wires
//   <LeakClones spots={[{x, y, at, rot}]} w={120} h={150} />                                           // 2 -> 4 -> 8
//
// RailBoard wraps the kit <Noticeboard> (teal 13 px frame, two mintPale panes with glints, legs) and puts a BrowserChrome
// 'addressRail' on its top frame. (x, y) = frame top-left. Panes are render props that get each pane's world rect.
// Un-build (outAt): linework retracts and the board shrinks; pane 2 is the LAST fill to go (its content un-builds in
// the final 45 % of the out window), so the answer is never erased mid-sentence.

import React from 'react';
import {palette, stroke} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {rand, Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {ExitProvider, NoExit, UnBuild} from '../../../lib/exit';
import {MOTION} from '../../../lib/spec';
import {blob, hline, poly, polyPath, Pt} from '../../../lib/sketch';
import {mat, XG} from '../../../lib/xf';
import {Noticeboard} from '../../../lib/kit';
import {bt, Depth, DEPTH_INK, misregScreen} from './common';
import {BrowserChrome} from './BrowserChrome';
import {Lock} from './Lock';
import {Bit} from './Bit';
import {MarkRing} from './Glyphs';

export type PaneRect = {x: number; y: number; w: number; h: number};

/** World rects of the two panes of a board at (x, y, w, h) (kit Noticeboard geometry: 13 px frame, 7 px gap). */
export function boardPanes(x: number, y: number, w: number, h: number): [PaneRect, PaneRect] {
  const fb = 13;
  const gap = 7;
  const gw = (w - fb * 2 - gap) / 2;
  const gh = h - fb * 2;
  return [
    {x: x + fb, y: y + fb, w: gw, h: gh},
    {x: x + fb + gw + gap, y: y + fb, w: gw, h: gh},
  ];
}

export type RailBoardProps = {
  x: number;
  y: number;
  w?: number;
  h?: number;
  /** Leg length (world px). Default 0.45 h. */
  legs?: number;
  /** Address-bar rail size. Default {w: 0.73 w, h: 30}. */
  rail?: {w?: number; h?: number};
  /** Kit build (ink draws, fills land). Omit = built. */
  at?: number;
  /** Rises from below by its own height + legs (out(exp), 0.33 s). */
  riseAt?: number;
  /** The rail's pill and dots light up. */
  railLightAt?: number;
  pane1?: (r: PaneRect) => React.ReactNode;
  pane2?: (r: PaneRect) => React.ReactNode;
  /** Pane 1 (or `darkPane`) goes tealDark (wipe down, 0.1 s). */
  paneDarkAt?: number;
  darkPane?: 1 | 2;
  /** Pane 2 content scales in from 0.2 (answer-panel curve, 0.3 s). */
  pane2ScaleInAt?: number;
  outAt?: number;
  outDur?: number;
  depth?: Depth;
  seed?: Seed;
};

export const RailBoard: React.FC<RailBoardProps> = ({x, y, w = 600, h = 430, legs, rail, at, riseAt, railLightAt, pane1, pane2, paneDarkAt, darkPane = 1, pane2ScaleInAt, outAt, outDur = MOTION.unbuild.total, depth = 'mid', seed = 'board'}) => {
  const t = useTime();
  if (riseAt !== undefined && t < riseAt) return null;
  const L = legs ?? h * 0.45;
  const rw = rail?.w ?? w * 0.73;
  const rh = rail?.h ?? 30;
  const [p1, p2] = boardPanes(x, y, w, h);
  const width = DEPTH_INK[depth];
  const rise = riseAt !== undefined ? (1 - MOTION.rise.ease(prog(t, riseAt, MOTION.rise.dur))) * (h + L + rh) : 0;
  // pane 2 un-builds last
  const e2 = outAt !== undefined ? prog(t, outAt + outDur * 0.55, outDur * 0.45) : 0;
  const darkRect = darkPane === 1 ? p1 : p2;
  const s2 = pane2ScaleInAt !== undefined ? MOTION.answerPanel.from + (1 - MOTION.answerPanel.from) * MOTION.answerPanel.ease(prog(t, pane2ScaleInAt, MOTION.answerPanel.dur)) : 1;
  const pane2Node =
    pane2 && (pane2ScaleInAt === undefined || t >= pane2ScaleInAt) ? (
      <XG m={s2 < 1 ? mat.about(mat.scale(s2), p2.x + p2.w / 2, p2.y + p2.h / 2) : mat.I}>{pane2(p2)}</XG>
    ) : null;
  const boardBody = (
    <Noticeboard x={x} y={y} w={w} h={h} legs={L} at={at} seed={seed} width={width}>
      {paneDarkAt !== undefined && t >= paneDarkAt ? <Fill rect={[darkRect.x, darkRect.y, darkRect.w, darkRect.h]} color={palette.tealDark} at={paneDarkAt} mode="wipe" dir="down" dur={0.1} offset={false} seed={`${seed}/dark`} /> : null}
      {pane1 ? pane1(p1) : null}
      {pane2Node ? (
        <NoExit>
          <ExitProvider value={e2}>{pane2Node}</ExitProvider>
        </NoExit>
      ) : null}
    </Noticeboard>
  );
  const railNode = <BrowserChrome x={x + (w - rw) / 2} y={y - 9 - rh + 3} w={rw} h={rh} mode="addressRail" railLightAt={railLightAt} at={bt(at, 0.3)} depth={depth} seed={`${seed}/rail`} />;
  const inner = (
    <>
      {boardBody}
      {railNode}
    </>
  );
  return <XG m={mat.translate(0, rise)}>{outAt !== undefined ? <UnBuild at={outAt} dur={outDur * 0.6}>{inner}</UnBuild> : inner}</XG>;
};

// ---------------------------------------------------------------- LeakSheet

export type LeakSheetProps = {
  /** Centre of the sheet at rest. */
  x: number;
  y: number;
  w?: number;
  h?: number;
  rot?: number;
  /** Outline / heading draw on (omit = drawn). */
  at?: number;
  /** The lock sketch and the Bit doodle draw on (default with `at`). */
  doodleAt?: number;
  /** Ink ring around the Bit doodle. */
  ringAt?: number;
  /** Pin dot at the top (default true). */
  pin?: boolean;
  /** Two clothes pegs on the top edge instead of the pin (riding a wire). */
  peg?: boolean;
  /** Blow in from off-frame: travels from `from` to (x, y) with a flutter (rotation + skew wobble). */
  flutter?: {at: number; from: Pt; dur?: number};
  /** Lens wipe: from (from, fromS) it grows to `peak` x about `focus` (4 f), holds 3 f (full white), then shrinks into
   *  its rest place (6 f). */
  lensWipe?: {at: number; from?: Pt; fromS?: number; peak?: number; focus?: Pt};
  /** Overall scale (clones, wire copies). */
  scale?: number;
  outAt?: number;
  depth?: Depth;
  seed?: Seed;
};

/** Where a lens wipe is at time t: {x, y, s, full} (full = the 3 full-white frames). */
export function lensWipeAt(t: number, lw: NonNullable<LeakSheetProps['lensWipe']>, rest: Pt, restS = 1): {x: number; y: number; s: number; full: boolean} {
  const {in: tin, hold, out} = MOTION.matchZoom;
  const from = lw.from ?? rest;
  const fromS = lw.fromS ?? restS;
  const peak = lw.peak ?? 8;
  const focus = lw.focus ?? [540, 960];
  const dt = t - lw.at;
  if (dt < 0) return {x: from[0], y: from[1], s: fromS, full: false};
  if (dt < tin) {
    const q = E.inCubic(dt / tin);
    return {x: lerp(from[0], focus[0], q), y: lerp(from[1], focus[1], q), s: fromS * Math.pow(peak / fromS, q), full: false};
  }
  if (dt < tin + hold) return {x: focus[0], y: focus[1], s: peak, full: true};
  const q = E.outCubic(Math.min(1, (dt - tin - hold) / out));
  return {x: lerp(focus[0], rest[0], q), y: lerp(focus[1], rest[1], q), s: peak * Math.pow(restS / peak, q), full: false};
}

export const LeakSheet: React.FC<LeakSheetProps> = ({x, y, w = 210, h = 270, rot = 0, at, doodleAt, ringAt, pin = true, peg = false, flutter, lensWipe, scale = 1, outAt, depth = 'far', seed = 'leak'}) => {
  const t = useTime();
  const start = Math.min(at ?? Infinity, flutter?.at ?? Infinity, lensWipe?.at ?? Infinity);
  if (Number.isFinite(start) && t < start) return null;
  if (outAt !== undefined && t >= outAt + 0.18) return null;
  let cx = x;
  let cy = y;
  let s = scale;
  let r = rot;
  let skew = 0;
  if (flutter && t < flutter.at + (flutter.dur ?? 0.7) + 0.4) {
    const dur = flutter.dur ?? 0.7;
    const q = prog(t, flutter.at, dur, E.outCubic);
    cx = lerp(flutter.from[0], x, q) + Math.sin(q * Math.PI * 2) * 30 * (1 - q);
    cy = lerp(flutter.from[1], y, q) - Math.sin(q * Math.PI) * 80;
    const dt = t - flutter.at;
    r = rot + 24 * Math.exp(-dt * 3.2) * Math.sin(dt * 13 + rand(seed, 'fl') * 6);
    skew = 10 * Math.exp(-dt * 3.2) * Math.sin(dt * 17);
  }
  if (lensWipe && t >= lensWipe.at) {
    const L = lensWipeAt(t, lensWipe, [x, y], scale);
    cx = L.x;
    cy = L.y;
    s = L.s;
  }
  const outK = outAt !== undefined ? 1 - E.inCubic(prog(t, outAt, 0.18)) : 1;
  const iw = DEPTH_INK[depth] / s;
  const f = Math.min(w, h) * 0.15;
  const pts: Pt[] = [
    [-w / 2, -h / 2],
    [w / 2 - f, -h / 2],
    [w / 2, -h / 2 + f],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
  const off = misregScreen(seed);
  const da = doodleAt ?? bt(at, 0.3);
  const small = w * s < 70;
  return (
    <XG m={mat.compose(mat.translate(cx, cy), mat.rotate(r), mat.skewX(skew), mat.scale(s * outK))}>
      <Fill d={polyPath(pts)} color={palette.white} offset={[off[0] / s, off[1] / s]} seed={`${seed}/f`} />
      <Fill d={polyPath([[w / 2 - f, -h / 2], [w / 2 - f, -h / 2 + f], [w / 2, -h / 2 + f]])} color={palette.sand} offset={false} seed={`${seed}/ear`} />
      <Ink d={poly(pts, {closed: true, seed: `${seed}/o`, over: 2.5})} at={at} dur={0.4} width={iw} seed={`${seed}/o`} />
      <Ink d={`M${w / 2 - f} ${-h / 2}L${w / 2 - f + 1} ${-h / 2 + f}L${w / 2} ${-h / 2 + f}`} at={bt(at, 0.3)} width={iw * 0.8} seed={`${seed}/eo`} />
      <Ink d={hline(-w * 0.36, -w * 0.02, -h * 0.33, {over: 0, seed: `${seed}/hd`})} at={bt(at, 0.35)} width={iw * 1.8} seed={`${seed}/hd`} />
      {!small ? <Ink d={hline(-w * 0.36, w * 0.22, -h * 0.26, {over: 0, seed: `${seed}/l1`}) + hline(-w * 0.36, w * 0.1, -h * 0.205, {over: 0, seed: `${seed}/l2`})} at={bt(at, 0.4)} width={iw * 0.7} seed={`${seed}/tl`} /> : null}
      {/* the lock sketch with the short bolt, and the Bit doodle in its gap, ringed */}
      <Lock x={-w * 0.12} y={h * 0.12} size={h * 0.4} state="sketch" at={da} ink={iw * 0.9} seed={`${seed}/lk`} />
      <Bit x={w * 0.25} y={h * 0.27} size={w * 0.2} state="doodle" at={bt(da, 0.25)} seed={`${seed}/bit`} />
      {ringAt !== undefined || at === undefined ? <MarkRing x={w * 0.25} y={h * 0.22} r={w * 0.17} at={ringAt} width={iw * 1.2} seed={`${seed}/ring`} /> : null}
      {pin && !peg ? <Fill d={blob(0, -h / 2 + h * 0.06, Math.max(2.5, 5 / s / 2) * 1.2, Math.max(2.5, 5 / s / 2) * 1.2, {seed: `${seed}/pin`})} color={palette.ink} at={bt(at, 0.2)} mode="snap" offset={false} seed={`${seed}/pin`} /> : null}
      {peg
        ? [-0.3, 0.3].map((px, i) => (
            <g key={i}>
              <Fill d={polyPath([[w * px - 4, -h / 2 - 10], [w * px + 4, -h / 2 - 10], [w * px + 3, -h / 2 + 14], [w * px - 3, -h / 2 + 14]])} color={palette.brown} offset={false} seed={`${seed}/pg${i}`} />
              <Ink d={`M${w * px - 4} ${-h / 2 - 10}L${w * px - 3} ${-h / 2 + 14}M${w * px + 4} ${-h / 2 - 10}L${w * px + 3} ${-h / 2 + 14}`} width={iw * 0.8} seed={`${seed}/pgi${i}`} order="all" />
            </g>
          ))
        : null}
    </XG>
  );
};

/** Copies of the leaked page popping in (2 -> 4 -> 8). Each spot: centre, time, rotation, optional scale. */
export const LeakClones: React.FC<{spots: {x: number; y: number; at: number; rot?: number; s?: number}[]; w?: number; h?: number; outAt?: number; seed?: Seed}> = ({spots, w = 120, h = 150, outAt, seed = 'clone'}) => {
  const t = useTime();
  return (
    <>
      {spots.map((sp, i) => {
        if (t < sp.at) return null;
        const k = springAt(t, sp.at, springs.pop);
        return (
          <XG key={i} m={mat.about(mat.scale(k), sp.x, sp.y)}>
            <LeakSheet x={sp.x} y={sp.y} w={w} h={h} rot={sp.rot ?? (rand(seed, i) - 0.5) * 10} scale={sp.s ?? 1} outAt={outAt} seed={`${seed}/${i}`} />
          </XG>
        );
      })}
    </>
  );
};

