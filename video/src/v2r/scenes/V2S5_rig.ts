// V2S5_rig.ts (lane L4): the S5 crane rig as the shot uses it: the CAMERA. ONE progress p (kit/dc/crane.ts `craneP`,
// the contract's re-fit ease cubicBezier(0.35, 0.03, 0.45, 1.0) over 21.30-23.40) drives every plane. The rig says
// where each plane is at p; the slot files own the DRAWINGS and the few shape numbers the camera needs from them:
//   V2S5_far.tsx      FAR_END (the end horizon, the end sun)  -> FAR_S5 here: its sun lands EXACTLY on SUN1 at p 0
//   V2S5_river.tsx    RIVER_PL        V2S5_mid.tsx   MID_PLANE        V2S5_nearmid.tsx   NEARMID_PLANE (start coords)
//   V2S5_deck.tsx     TREE_BOX (the left frame's slide-in), RIGHT_BOX (the right frame's)
// The deck plane (the terrace, pinned on the stranger's feet: k = 150 / 62) and the lamppost wipe across the backs
// (with `swapAt`, when the tiny drawings swap in behind it) stay the kit's (kit/dc/crane.ts).
//   END coords = the screen when the crane lands (p 1); START coords = the screen of the held start (p 0).
// Import rule (no cycles): slot files never import this file; this file imports them.
import {S5, SUN1} from '../world/map';
import {CRANE_T, craneP, DECK, WIPE, wipeAt, wipeMat, swapAt, planeMat, startMat, boxMat, applyMat, matScale, type PullPlane, type PullBox} from '../kit/dc/crane';
import type {Pt} from '../../lib/sketch';
import {FAR_END} from './V2S5_far';
import {RIVER_PL} from './V2S5_river';
import {MID_PLANE} from './V2S5_mid';
import {NEARMID_PLANE} from './V2S5_nearmid';
import {TREE_BOX, RIGHT_BOX} from './V2S5_deck';

export {CRANE_T, craneP, DECK, WIPE, wipeAt, wipeMat, swapAt, planeMat, startMat, boxMat, applyMat, matScale};
export type {PullPlane, PullBox};

/** The far plane, re-pinned on the shot's end sun: at p 0 the sun lands on SUN1 exactly (centre and radius). The
 *  scale k turns the end sun's radius into SUN1's (~1.08); the pivot sits on the end horizon; the slide makes the
 *  centre match. Everything above the sun moves UP at the start by (k - 1) x its height above the pivot. */
export const FAR_S5: PullPlane = (() => {
  const s = FAR_END.sun;
  const k = SUN1.r / s.r;
  const o: Pt = [540, FAR_END.horizon];
  return {o, k, off: [SUN1.x - o[0] - k * (s.x - o[0]), SUN1.y - o[1] - k * (s.y - o[1])]};
})();

/** Every camera plane of the shot (the QA reads these). */
export const PLANES = {far: FAR_S5, river: RIVER_PL, mid: MID_PLANE, nearmid: NEARMID_PLANE, deck: DECK, tree: TREE_BOX, right: RIGHT_BOX};

// ---------------------------------------------------------------- the deck's own pace (camspeed, 2026-10-28)
// The deck (k 2.42: the shot's biggest zoom) is what a real-render camera estimate locks onto from 21.8 to 22.4, and its
// zoom-out about the stranger's feet carried 16.5-17.1 px/f at the frame's far corner just outside the lamppost
// allowance (22.02-22.19). So the DECK alone runs on its own progress g(p): the same start and end, a hair ahead early
// (p < 0.17, where every plane is slow), ~15 % calmer at both edges of the lamppost wipe (p 0.30-0.37 and 0.50-0.57),
// back at its pace behind the lamppost, and catching up in the landing's ease (p 0.72-0.98). |g - p| <= 0.03 (the deck
// <= ~2.5 % off its scale at any p); the beats are the other planes' and the pivot's (the stranger's feet, unchanged by
// the scale): the swap behind the lamppost, "Pentagon" clearing the tree at 22.43 and the landing stay where they were.
const DECK_DIP: [number, number][] = [
  [0.15, 0],
  [0.3, 0.155],
  [0.37, 0.155],
  [0.435, 0.075],
  [0.5, 0.145],
  [0.57, 0.145],
  [0.7, 0],
];
const sstep = (a: number, b: number, x: number) => {
  const u = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return u * u * (3 - 2 * u);
};
const dipAt = (p: number) => {
  for (let i = 0; i < DECK_DIP.length - 1; i++) {
    const [a, da] = DECK_DIP[i];
    const [b, db] = DECK_DIP[i + 1];
    if (p >= a && p <= b) return da + (db - da) * sstep(a, b, p);
  }
  return 0;
};
const hump = (p: number, a: number, b: number) => (p > a && p < b ? Math.sin((Math.PI * (p - a)) / (b - a)) ** 2 : 0);
/** g(p) on a 2000-step table: the early hump (0.28 at its peak) and a late one sized so g(1) = 1 exactly. */
const DECK_G: Float64Array = (() => {
  const N = 2000;
  const integ = (f: (p: number) => number) => {
    const out = new Float64Array(N + 1);
    for (let i = 1; i <= N; i++) {
      const a = (i - 1) / N;
      const b = i / N;
      out[i] = out[i - 1] + ((f(a) + f(b)) / 2) * (b - a);
    }
    return out;
  };
  const base = integ((p) => 1 - dipAt(p) + 0.28 * hump(p, 0, 0.17));
  const late = integ((p) => hump(p, 0.72, 0.98));
  const L = (1 - base[N]) / late[N];
  const g = new Float64Array(N + 1);
  for (let i = 0; i <= N; i++) g[i] = base[i] + L * late[i];
  return g;
})();
/** The deck's progress at crane progress p (0 -> 0, 1 -> 1, monotone). */
export const deckP = (p: number): number => {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  const N = DECK_G.length - 1;
  const x = p * N;
  const i = Math.min(N - 1, Math.floor(x));
  return DECK_G[i] + (DECK_G[i + 1] - DECK_G[i]) * (x - i);
};
/** The deck plane's map at crane progress p (END coords) and its start map (START coords: the close figures, the news
 *  box, the start's petals). */
export const deckMat = (p: number) => planeMat(DECK, deckP(p));
export const deckStartMat = (p: number) => startMat(DECK, deckP(p));

/** End coords of a START-coords point riding the deck (the inverse of the deck's p 0 map). */
export const deckEndOf = (q: Pt): Pt => {
  const off = DECK.off ?? [0, 0];
  return [DECK.o[0] + (q[0] - DECK.o[0] - off[0]) / DECK.k, DECK.o[1] + (q[1] - DECK.o[1] - off[1]) / DECK.k];
};
/** Start coords of an END-coords deck point (the deck's p 0 map). */
export const deckStartOf = (q: Pt): Pt => applyMat(planeMat(DECK, 0), q);

/** The figures. START: the contract's stranger (feet (300, 1225), 150 px feet-to-head) and Pip's seat (415, 1120: the
 *  bench backrest's top). END: the same points through the deck (stranger feet (318, 1238), Pip (366, 1195)). */
export const FIG = {
  start: {stranger: S5.start.stranger, pip: S5.start.pipSeat, pipSize: 108},
  end: {stranger: S5.end.stranger, pip: deckEndOf([S5.start.pipSeat.x, S5.start.pipSeat.y]), pipSize: 108 / DECK.k},
};

/** Scene times (0 = film 20.55). */
export const S5_T0 = 20.55;
export const T5 = {
  ...CRANE_T,
  /** "Pentagon" (heard 22.44): the plaque pops a frame before. */
  pentagon: 22.43 - S5_T0,
  swap: swapAt,
};

/** Is the crane past the swap (the tiny drawings shown)? */
export const swappedAt = (t: number) => t >= swapAt;
/** The progress at which the swap happens (for stills driven by p). */
export const SWAP_P = craneP(swapAt);

void boxMat;
void matScale;
