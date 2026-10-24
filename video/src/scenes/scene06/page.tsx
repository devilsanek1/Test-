// scene06/page.tsx — the printed leak sheet that blows in at the end of S06 and becomes S07's lens wipe (motion spec
// T-MATCH), plus the exported `Wiper` (Film foreground-wipe element 'scene' for S07's transitionIn).
//
// ONE paper, one SCREEN-space trajectory as a pure function of FILM time (pageAt), drawn identically by S06 (its own
// last frames, also in the S06-only composition) and by the Wiper (above both scenes during the wipe window):
//   21.535  'heads-up'+0.25  it flutters in from off-frame LEFT on a gust (tumbling, ~0.6 x), never from the workshop
//   21.732  S07_LENS.at      the gust lifts it at the lens: it zooms to x8 about (540, 960) in 4 frames (inCubic, the
//                            spec's accelerating x1.35 / x1.8 / x2.0 per frame), its PRINTED side facing us
//   21.865 ->                it IS S07's own lens sheet (S07 NOTICE + lensWipe, mirrored below): 3 frames of full page,
//                            then it shrinks in 6 frames into the notice pinned on S07's board (22.165)
// Because the Wiper draws exactly S07's sheet (same component, size, rotation, seed, screen transform; S07's camera is
// at rest until 22.195), the two copies coincide pixel for pixel and the hand-over is invisible. The wipe EDGE is made
// to jump across the whole frame between two 30 fps frames (Wiper.half = 6000: frame 21.967 has it at x -360, frame
// 22.000 at x 1277), so no frame ever shows the clip edge: frame 21.967 is S06 under the full page, frame 22.000 is S07
// with its sheet shrinking. (At 60 fps one in-between frame shows the edge inside the page, i.e. hidden, except in the
// flat sky band and under the bottom UI band.)
// If S07 retimes its lens sheet, update S07_LENS / S07_SHEET here (they mirror src/scenes/Scene07.tsx).

import React from 'react';
import {ease as E, lerp, mat, MOTION, prog, Pt, rand, useGlobalTime, XG} from '../../lib';
import type {WiperComponent} from '../../lib';
import {LeakSheet, lensWipeAt} from '../shared/props';
import {ABS} from './beats';

/** S07's notice (src/scenes/Scene07.tsx NOTICE; S07 world = screen while its camera is at rest). */
export const S07_SHEET = {x: 295, y: 1140, w: 210, h: 270, rot: -2, seed: 's7notice'} as const;
const MZ = MOTION.matchZoom; // in 4 f, hold 3 f, out 6 f
/** S07's pin (w73 'word' 22.155 - 0.05 + 0.06) = where its lens sheet lands; its lens wipe starts in+hold+out before. */
export const S07_PIN = 22.155 - 0.05 + 0.06;
export const S07_LENS = {at: S07_PIN - (MZ.in + MZ.hold + MZ.out), from: [-260, 1250] as Pt, fromS: 1.6, peak: 8, focus: [540, 960] as Pt};
/** When the page reaches S07's full-frame hold (and from then on is S07's sheet). */
export const PAGE_FULL = S07_LENS.at + MZ.in;

/** The sheet's own flutter (screen px): off-frame left -> the left frame edge, tumbling. */
const FLUTTER = {at: ABS.sheet, from: [-190, 1310] as Pt, to: [150, 1175] as Pt, s0: 0.5, s1: 0.66};

export type PageState = {x: number; y: number; s: number; rot: number; skew: number};

function flutterAt(T: number): PageState {
  const dur = S07_LENS.at - FLUTTER.at;
  const dt = Math.max(0, T - FLUTTER.at);
  const q = prog(T, FLUTTER.at, dur, E.outCubic);
  const x = lerp(FLUTTER.from[0], FLUTTER.to[0], q);
  // a gust: it rides up in a little arc while it tumbles
  const y = lerp(FLUTTER.from[1], FLUTTER.to[1], q) - Math.sin(q * Math.PI) * 70;
  const ph = rand('s6page', 'ph') * 6;
  const rot = 26 * Math.exp(-dt * 2.4) * Math.sin(dt * 15 + ph) + lerp(-14, 6, q);
  const skew = 12 * Math.exp(-dt * 2.4) * Math.sin(dt * 19 + ph * 0.7);
  return {x, y, s: lerp(FLUTTER.s0, FLUTTER.s1, q), rot, skew};
}

/** Where the page is at film time T (screen px), or null when it is not on screen. */
export function pageAt(T: number): PageState | null {
  if (T < FLUTTER.at) return null;
  if (T < S07_LENS.at) return flutterAt(T);
  if (T < PAGE_FULL) {
    // T-MATCH zoom: accelerating, log scale, about the focus; rotation settles to S07's -2, skew to 0
    const a = flutterAt(S07_LENS.at);
    const q = E.inCubic(prog(T, S07_LENS.at, MZ.in));
    return {
      x: lerp(a.x, S07_LENS.focus[0], q),
      y: lerp(a.y, S07_LENS.focus[1], q),
      s: a.s * Math.pow(S07_LENS.peak / a.s, q),
      rot: lerp(a.rot, S07_SHEET.rot, q),
      skew: lerp(a.skew, 0, q),
    };
  }
  if (T >= S07_PIN) return null; // landed: S07's own pinned notice takes over
  const L = lensWipeAt(T, S07_LENS, [S07_SHEET.x, S07_SHEET.y], 1);
  return {x: L.x, y: L.y, s: L.s, rot: S07_SHEET.rot, skew: 0};
}

/** The page at film time T, in screen space (draw it with no camera above it). */
export const LeakPage: React.FC<{T: number}> = ({T}) => {
  const st = pageAt(T);
  if (!st) return null;
  // S07 draws LeakSheet at (x, y) with `scale`; lensWipeAt moves its centre. Same here: translate to the sheet's rest
  // centre inverse, so LeakSheet's own transform (translate(x, y) rotate scale) lands exactly where S07's does.
  const m = mat.compose(mat.translate(st.x - S07_SHEET.x, st.y - S07_SHEET.y), mat.about(mat.skewX(st.skew), S07_SHEET.x, S07_SHEET.y));
  return (
    <XG m={m}>
      <LeakSheet x={S07_SHEET.x} y={S07_SHEET.y} w={S07_SHEET.w} h={S07_SHEET.h} rot={st.rot} scale={st.s} pin={false} depth="mid" seed={S07_SHEET.seed} />
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
