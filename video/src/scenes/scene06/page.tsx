// scene06/page.tsx — the printed leak sheet that blows in at the end of S06 and becomes S07's lens wipe (motion spec
// T-MATCH), plus the exported `Wiper` (Film foreground-wipe element 'scene' for S07's transitionIn).
//
// ONE paper, one SCREEN-space trajectory as a pure function of FILM time (pageAt), drawn by S06 (its own last frames,
// also in the S06-only composition) and by the Wiper (above both scenes during the wipe window):
//   21.500  'heads-up'+0.25 (lead 0.035)  a gust blows it in from just off the LEFT edge (tumbling, ~0.6 x), fast at
//                          first and still drifting toward the lens (~9 px / frame) when the zoom takes over
//   21.732  S07_LENS.at    the gust lifts it at the lens: T-MATCH zoom to x8.5 in 4 frames, the spec's accelerating
//                          steps (x1.35, x1.8, x2.0, then x2.6 to the full page), position and rotation on the same
//                          log-scale progress
//   21.865 -> 21.985       the full page, printed side to us (fix round 2: x8.5 at HOLD.focus (230, 830), +1 deg: the
//                          RINGED BIT DOODLE sits whole between x 90 and 990, under the caption band, with the right half
//                          of the lock sketch beside it and the heading bar cropped at the top left; the page still covers
//                          every frame corner by >= 23 px), creeping +4 % and -0.4 deg about the doodle; S06's own
//                          copy never leaves this hold (the Wiper drawn above both scenes does the rest)
//   21.985 -> 22.165       the Wiper draws EXACTLY S07's lens sheet (S07 NOTICE + lensWipeAt with S07's parameters,
//                          mirrored below) as it shrinks into the notice pinned on S07's board; S07's own copy is
//                          underneath and identical (same footprint), and at S07's pin (22.165) S07 takes over.
// FIX ROUND 1 (the white strobe): the zoomed page is no hairline-on-white field: from x2.2 up it is drawn here as the
// LensSheet (same layout and seeds as props LeakSheet), its ink scaling with the zoom (sqrt(s): lock strokes ~9 px at x8,
// the Bit doodle's weight), the heading a SOLID ink bar, the two text rules only below x4. Under x2.2 it is the real
// LeakSheet with the same ink scaling (k = 1 at rest), so the hand-over to S07's own sheet at its pin is pixel-identical.
// FIX ROUND 2 (paper colour flicker white -> cream -> white across the wipe): the LensSheet is on the LeakSheet's own
// WHITE paper (style bible: paper is #FFFFFF), so the sheet is one paper from the blow-in to S07's pinned notice.
// The wipe EDGE jumps across the whole frame between two 30 fps frames (Wiper.half = 6000), and the Wiper holds the
// full page until the cut (21.985), so even a 60 fps in-between frame never shows the edge or S06 strips.
// If S07 retimes its lens sheet, update S07_LENS / S07_SHEET here (they mirror src/scenes/Scene07.tsx).

import React from 'react';
import {Fill, hline, Ink, lerp, mat, MOTION, palette, poly, polyPath, Pt, rand, useGlobalTime, XG} from '../../lib';
import type {WiperComponent} from '../../lib';
import {Bit, DEPTH_INK, LeakSheet, lensWipeAt, Lock, MarkRing, misregScreen} from '../shared/props';
import {ABS, SCENE} from './beats';

/** S07's notice (src/scenes/Scene07.tsx NOTICE; S07 world = screen while its camera is at rest). */
export const S07_SHEET = {x: 295, y: 1140, w: 210, h: 270, rot: -2, seed: 's7notice'} as const;
const MZ = MOTION.matchZoom; // in 4 f, hold 3 f, out 6 f
/** S07's pin (w73 'word' 22.155 - 0.05 + 0.06) = where its lens sheet lands; its lens wipe starts in+hold+out before. */
export const S07_PIN = 22.155 - 0.05 + 0.06;
export const S07_LENS = {at: S07_PIN - (MZ.in + MZ.hold + MZ.out), from: [-260, 1250] as Pt, fromS: 1.6, peak: 8, focus: [540, 960] as Pt};
/** When the page reaches the full-frame hold. */
export const PAGE_FULL = S07_LENS.at + MZ.in;
/** S06's hold (frames 656-659): x8.5, +1 deg, centred left of the frame centre so the ringed Bit doodle is whole (the
 *  doodle's ring: local (w 0.25, h 0.22) r w 0.17) and the dog-eared top-right corner stays outside the frame (every
 *  frame corner >= 23 px inside the paper through the creep); it creeps +4 % / -0.4 deg about the doodle. */
const HOLD = {s: 8.5, focus: [230, 830] as Pt, rot: 1, creep: 0.04, creepRot: -0.4};
const DOODLE: Pt = [S07_SHEET.w * 0.25, S07_SHEET.h * 0.22];

/** The gust (screen px): from just off the left edge to the left third, still moving at the end. */
const FLUTTER = {at: ABS.sheet - 0.035, from: [-62, 1296] as Pt, to: [150, 1175] as Pt, s0: 0.5, s1: 0.66, vEnd: 285};

export type PageState = {x: number; y: number; s: number; rot: number; skew: number};

const FL_D = S07_LENS.at - FLUTTER.at;
/** The flutter's velocity at its end (px/s): toward the hold centre. */
const V_END: Pt = (() => {
  const dx = HOLD.focus[0] - FLUTTER.to[0];
  const dy = HOLD.focus[1] - FLUTTER.to[1];
  const n = Math.hypot(dx, dy);
  return [(dx / n) * FLUTTER.vEnd, (dy / n) * FLUTTER.vEnd];
})();

function flutterAt(T: number): PageState {
  const tau = Math.max(0, Math.min(FL_D, T - FLUTTER.at));
  // a quadratic per axis: from -> to over FL_D, arriving with V_END (decelerating gust, never at rest)
  const ax = (i: 0 | 1) => {
    const x0 = FLUTTER.from[i];
    const v0 = (2 * (FLUTTER.to[i] - x0)) / FL_D - V_END[i];
    const a = (V_END[i] - v0) / FL_D;
    return x0 + v0 * tau + 0.5 * a * tau * tau;
  };
  const q = tau / FL_D;
  const ph = rand('s6page', 'ph') * 6;
  const rot = 24 * Math.exp(-tau * 2.2) * Math.sin(tau * 15 + ph) + lerp(-14, 4, q);
  const skew = 11 * Math.exp(-tau * 2.2) * Math.sin(tau * 19 + ph * 0.7);
  return {x: ax(0), y: ax(1), s: lerp(FLUTTER.s0, FLUTTER.s1, q), rot, skew};
}

/** T-MATCH zoom steps (motion spec: x1.35, x1.8, x2.0 per frame, then the full page). */
const ZOOM_STEPS = [1, 1.35, 1.8, 2.0];
function zoomS(q: number, s0: number, peak: number): number {
  const keys = [s0];
  for (let i = 1; i < ZOOM_STEPS.length; i++) keys.push(keys[i - 1] * ZOOM_STEPS[i]);
  keys.push(peak);
  const L = keys.map(Math.log);
  const x = Math.max(0, Math.min(1, q)) * (keys.length - 1);
  const i = Math.min(keys.length - 2, Math.floor(x));
  return Math.exp(lerp(L[i], L[i + 1], x - i));
}

/** Where the page is at film time T (screen px), or null when it is not on screen. `own` = S06's own copy, which never
 *  leaves the full-frame hold (only the Wiper follows S07's shrink). */
export function pageAt(T: number, own = false): PageState | null {
  if (T < FLUTTER.at) return null;
  if (T < S07_LENS.at) return flutterAt(T);
  if (T < PAGE_FULL) {
    const a = flutterAt(S07_LENS.at);
    const dt = T - S07_LENS.at;
    const s = zoomS(dt / MZ.in, a.s, HOLD.s);
    const ql = Math.log(s / a.s) / Math.log(HOLD.s / a.s);
    // the gust's own drift carries on and fades as the lens pull takes over
    const carry = (i: 0 | 1) => V_END[i] * dt * (1 - ql);
    // the centre trails the growth (ql^3): the page's top edge stays under the caption band until the page fills the frame
    const qp = ql * ql * ql;
    return {
      x: lerp(a.x, HOLD.focus[0], qp) + carry(0),
      // ... and never above the band while it is still smaller than the frame (it fills the frame on the next frame)
      y: Math.max(lerp(a.y, HOLD.focus[1], qp) + carry(1), 596 + (S07_SHEET.h / 2) * s),
      s,
      rot: lerp(a.rot, HOLD.rot, ql),
      skew: lerp(a.skew, 0, ql),
    };
  }
  if (own || T < SCENE.end) {
    // the hold still creeps toward the lens (+4 % over its 4 frames, a hair of turn) about the doodle: never a dead frame
    const k = Math.min(1, (T - PAGE_FULL) / 0.12);
    const r0 = (HOLD.rot * Math.PI) / 180;
    const rc: Pt = [HOLD.focus[0] + (DOODLE[0] * Math.cos(r0) - DOODLE[1] * Math.sin(r0)) * HOLD.s, HOLD.focus[1] + (DOODLE[0] * Math.sin(r0) + DOODLE[1] * Math.cos(r0)) * HOLD.s];
    const ks = 1 + HOLD.creep * k;
    const dr = (HOLD.creepRot * k * Math.PI) / 180;
    const dx = HOLD.focus[0] - rc[0];
    const dy = HOLD.focus[1] - rc[1];
    return {x: rc[0] + ks * (dx * Math.cos(dr) - dy * Math.sin(dr)), y: rc[1] + ks * (dx * Math.sin(dr) + dy * Math.cos(dr)), s: HOLD.s * ks, rot: HOLD.rot + HOLD.creepRot * k, skew: 0};
  }
  if (T >= S07_PIN) return null; // landed: S07's own pinned notice takes over
  const L = lensWipeAt(T, S07_LENS, [S07_SHEET.x, S07_SHEET.y], 1);
  return {x: L.x, y: L.y, s: L.s, rot: S07_SHEET.rot, skew: 0};
}

/** Above this zoom the page is the local LensSheet (cream, solid heading); below it the real LeakSheet. */
const LENS_FROM = 2.2;
/** On-screen ink grows with the zoom (k = 1 at rest and below). */
const inkK = (s: number) => Math.max(1, Math.sqrt(s));

/** The zoomed printed page: props LeakSheet's layout and seeds (outline, dog-ear, heading, rules, the lock sketch with
 *  its short bolt, the ringed Bit doodle), on the LeakSheet's white paper, ink scaled with the zoom, the heading a solid
 *  bar. Local sheet units; the caller applies translate / skew / rotate / scale(s). */
const LensSheet: React.FC<{s: number; w: number; h: number; seed: string}> = ({s, w, h, seed}) => {
  const iw = (DEPTH_INK.mid * inkK(s)) / s;
  const f = Math.min(w, h) * 0.15;
  const pts: Pt[] = [
    [-w / 2, -h / 2],
    [w / 2 - f, -h / 2],
    [w / 2, -h / 2 + f],
    [w / 2, h / 2],
    [-w / 2, h / 2],
  ];
  const off = misregScreen(seed);
  const bar = Math.max(iw * 1.8, 6.4);
  const rules = s < 4;
  // the lock sketch's own strokes run at ~0.55 of its ink: lift them to the Bit doodle's weight as the zoom grows
  const lockK = 1 + 0.9 * Math.min(1, (s - LENS_FROM) / (8 - LENS_FROM));
  return (
    <>
      <Fill d={polyPath(pts)} color={palette.white} offset={[off[0] / s, off[1] / s]} mode="none" seed={`${seed}/f`} />
      <Fill d={polyPath([[w / 2 - f, -h / 2], [w / 2 - f, -h / 2 + f], [w / 2, -h / 2 + f]])} color={palette.sand} offset={false} mode="none" seed={`${seed}/ear`} />
      <Ink d={poly(pts, {closed: true, seed: `${seed}/o`, over: 2.5})} width={iw} seed={`${seed}/o`} />
      <Ink d={`M${w / 2 - f} ${-h / 2}L${w / 2 - f + 1} ${-h / 2 + f}L${w / 2} ${-h / 2 + f}`} width={iw * 0.8} seed={`${seed}/eo`} />
      <Fill d={polyPath([[-w * 0.36, -h * 0.33 - bar / 2], [-w * 0.02, -h * 0.33 - bar / 2 - 0.4], [-w * 0.02 + 0.6, -h * 0.33 + bar / 2], [-w * 0.36 - 0.4, -h * 0.33 + bar / 2 + 0.3]])} color={palette.ink} offset={false} mode="none" seed={`${seed}/hdB`} />
      {rules ? <Ink d={hline(-w * 0.36, w * 0.22, -h * 0.26, {over: 0, seed: `${seed}/l1`}) + hline(-w * 0.36, w * 0.1, -h * 0.205, {over: 0, seed: `${seed}/l2`})} width={iw * 0.7} seed={`${seed}/tl`} /> : null}
      {!rules ? <Ink d={hline(-w * 0.36, w * 0.06, h * 0.385, {over: 0, seed: `${seed}/b1`}) + hline(-w * 0.36, -w * 0.08, h * 0.43, {over: 0, seed: `${seed}/b2`})} width={iw * 0.7} seed={`${seed}/bl`} /> : null}
      <Lock x={-w * 0.12} y={h * 0.12} size={h * 0.4} state="sketch" ink={iw * 0.9 * lockK} seed={`${seed}/lk`} />
      <Bit x={w * 0.25} y={h * 0.27} size={w * 0.2} state="doodle" seed={`${seed}/bit`} />
      <MarkRing x={w * 0.25} y={h * 0.22} r={w * 0.17} width={iw * 1.2} seed={`${seed}/ring`} />
    </>
  );
};

/** The page at film time T, in screen space (draw it with no camera above it). */
export const LeakPage: React.FC<{T: number; own?: boolean}> = ({T, own = false}) => {
  const st = pageAt(T, own);
  if (!st) return null;
  const {x: X, y: Y, w, h, seed} = S07_SHEET;
  if (st.s >= LENS_FROM) {
    return (
      <XG m={mat.compose(mat.translate(st.x, st.y), mat.skewX(st.skew), mat.rotate(st.rot), mat.scale(st.s))}>
        <LensSheet s={st.s} w={w} h={h} seed={seed} />
      </XG>
    );
  }
  // S07 draws LeakSheet at (X, Y) with `scale`; lensWipeAt moves its centre. Same here: translate to the sheet's rest
  // centre inverse, so LeakSheet's own transform (translate rotate scale) lands exactly where S07's does; the ink grows
  // with the zoom by drawing it at s / k inside a k x scale (k = 1 at rest).
  const k = inkK(st.s);
  const m = mat.compose(mat.translate(st.x - X, st.y - Y), mat.about(mat.skewX(st.skew), X, Y), k === 1 ? mat.I : mat.about(mat.scale(k), X, Y));
  return (
    <XG m={m}>
      <LeakSheet x={X} y={Y} w={w} h={h} rot={st.rot} scale={st.s / k} pin={false} depth="mid" seed={seed} />
    </XG>
  );
};

/** S06's foreground element for S07's {type: 'foreground-wipe', element: 'scene'}: the page at the lens. It ignores the
 *  edge x (the page has its own T-MATCH path); `half` puts the edge's whole crossing between two 30 fps frames, under
 *  the full page. Captions stay ink (the page is white). */
export const Wiper: WiperComponent = () => {
  const T = useGlobalTime();
  return <LeakPage T={T} />;
};
Wiper.half = 6000;
Wiper.captionRegions = () => [{tone: 'dark', rect: [-200, -200, 1300, 2200]}];
