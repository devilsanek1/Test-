// spec.ts — motion constants measured on the reference (docs/motion_spec.md section 10), in SECONDS.
// Use these instead of inventing timings. Everything is fps-independent.
//
//   import {MOTION, bez, strokeDur} from '../lib';
//   const y = lerp(140, 0, prog(t, at, MOTION.rise.dur, MOTION.rise.ease));
//   <Ink d={...} at={1.2} />            // Ink already uses strokeDur + the 1-frame stagger
//
// Sync grammar (visual onset minus word onset, apply to assets/timing.json word starts):
//   highlight -0.10 | caption page -0.04 | line 2 -0.08 | small element -0.10 | big build / burst -0.25..-0.40
//   (so it COMPLETES on the word) | check/cross marks +0.0 | answer panel -0.25 | sun beat / bounce / hop +-0.05.

import {Easing} from 'remotion';
import {ease as E} from './time';
import type {Ease} from './time';

/** CSS cubic-bezier(x1, y1, x2, y2) as an easing function (Remotion's implementation). */
export const bez = (x1: number, y1: number, x2: number, y2: number): Ease => Easing.bezier(x1, y1, x2, y2);

/** Out(exp) normalised to reach exactly 1: ~50% in the first frame of a 0.33 s move, then x0.5 per frame. */
const outExp: Ease = (x) => (x >= 1 ? 1 : (1 - Math.pow(2, -10 * x)) / (1 - Math.pow(2, -10)));

export const MOTION = {
  /** Caption page change: the whole stack scrolls up by the clip height + 20 px. */
  captionScroll: {dur: 0.45, ease: bez(0, 0.7, 0.12, 1), lead: 0.04},
  /** Caption line 2 rises ~1.15 line pitches from below. */
  captionLine2: {dur: 0.42, ease: bez(0, 0.7, 0.12, 1), lead: 0.08, pitch: 1.15},
  /** Keyword highlight wipe L->R: 0.19 s + 0.3 ms per px of box width. */
  highlight: {base: 0.19, perPx: 0.0003, ease: bez(0.3, 0.3, 0.1, 1), lead: 0.1},
  /** One pen stroke: 3-6 frames whatever its length; successive strokes start 1 frame apart. */
  stroke: {min: 0.1, max: 0.2, pxPerSec: 3000, stagger: 1 / 30},
  /** Fill lag after its outline STARTS (ink-first). */
  fillLag: {min: 0.13, max: 0.27},
  /** Fill arrival: grow from 20% about its centre over 3-4 frames (or a 1-frame pop). */
  fillGrow: {dur: 0.12, from: 0.2},
  /** Large base fill wipe (facade), linear. */
  baseWipe: {dur: 0.12},
  /** Rise-in from below (people, placards): ~own height, 50% in frame 1. */
  rise: {dur: 0.33, ease: outExp, spring: {damping: 40, stiffness: 700, mass: 1}},
  /** Stagger for "counting" builds (people, coins); 1/30 for texture builds; 0-1 frame for a burst. */
  riseStagger: 0.15,
  /** Exit by sinking. */
  sink: {dur: 0.2, stagger: 2 / 30},
  answerPanel: {dur: 0.3, from: 0.2, ease: bez(0.4, 0, 0.2, 1), lead: 0.25},
  mark: {dur: 0.17, lead: 0},
  /** Pop from a source: appear at 30%, hold 2 f, grow 10 f. */
  popFrom: {from: 0.3, hold: 2 / 30, dur: 0.33, ease: bez(0.3, 0.2, 0.05, 1)},
  stamp: {ring: 4 / 30, slam: 0.27, from: 2.6},
  sunPulse: {attack: 0.08, hold: 0.08, release: 0.27, amp: 0.08, ampRange: [0.04, 0.13] as [number, number]},
  sunBounce: {h: [26, 62] as [number, number]},
  hop: {antic: 0.1, air: 1.03, land: 0.07, recover: 0.13, height: 74, squash: [1.085, 0.88] as [number, number], antSquash: [1.07, 0.91] as [number, number], stretch: [0.97, 1.06] as [number, number]},
  arcHop: {dur: 1.25, speed: 330, apex: 127},
  sunDrift: {min: 10},
  catJump: {air: 0.35, gravity: 4000},
  pushIn: {dur: 1.15, to: 1.9, ease: bez(0.6, 0.25, 0.41, 0.87)},
  matchZoom: {in: 4 / 30, hold: 3 / 30, out: 6 / 30},
  /** Un-build recipe (all ease-in): lines loosen 3 f, fills shrink 5-6 f, ink retracts 4 f, slab collapses 5 f. */
  unbuild: {loose: 0.1, fillShrink: 0.18, inkRetract: 0.13, slabCollapse: 0.17, total: 0.5},
  /** THE camera vocabulary (one for both kits: the cine CAM presets should alias these). Long, weighty moves 2-6 s.
   *  ease: default in-out move | slow: very long moves (4-6 s) | reveal: crane / tilt reveal | settle: a move that
   *  starts in motion (continuing a transition) and lands softly | push: reference 2's per-shot gentle zoom
   *  (World `push`, ShotCam `push`: +6 % over 2 s, in-out sine; ref 2 measured +1.3...+5.9 %, 1.0-3.3 s). */
  camera: {
    min: 2,
    max: 6,
    ease: bez(0.45, 0, 0.2, 1),
    slow: E.inOutSine,
    reveal: E.inOutQuart,
    settle: E.outCubic,
    push: {to: 1.06, dur: 2, ease: E.inOutSine},
  },
} as const;

/** Duration of one pen stroke of `len` px (0.10-0.20 s). */
export const strokeDur = (len: number) => Math.min(MOTION.stroke.max, Math.max(MOTION.stroke.min, len / MOTION.stroke.pxPerSec));

/** Highlight wipe duration for a box `w` px wide. */
export const highlightDur = (w: number) => MOTION.highlight.base + MOTION.highlight.perPx * w;

/** Remotion spring configs that match the reference (use with springAt / <Pop spring>). */
export const SPRINGS = {
  /** Rise-ins: ~3% overshoot. */
  rise: {damping: 40, stiffness: 700, mass: 1},
  /** Pops: 7% overshoot peaking at ~0.2 s (sun arrival). */
  pop: {damping: 27, stiffness: 430, mass: 1},
} as const;
