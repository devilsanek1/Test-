// V2S4_wcore.ts (lane L3, V2S4 WORLD helpers): the numbers every world plane of V2S4 shares. Pure: nothing draws here.
// Every plane is drawn at the 17.96 pose (screen px at zoom 1 = world px) and slid by its own `s4PlaneDx(k, t)`:
// dx runs -310 k (the cut) -> 0 (the stop), so the planes move RIGHT on screen while the camera trucks west. A plane is
// therefore seen over plane-x [0 .. 1080 + 310 k]; each one is drawn over `PLANE_X(k)` (a margin each side).
// The 6 % push about SUN1 (250, 650) lands at 1.06: a world y maps to 650 + (y - 650) x 1.06 on screen, so a built top
// at world y >= 604 stays at screen y >= 600, and a flyer / puff kept at world y >= 590 stays at screen y >= 586.
import * as MAP from '../world/map';
import type {Pt} from '../kit/canal/core';

/** World-px rows of the shot at the pose. */
export const ROW = {
  /** Built tops (roofs, chimneys, aerials, the gasholder rings) never above this (screen >= 600 after the push). */
  top: 604,
  /** Smoke and flyers never above this. */
  ceil: 590,
  /** The far band's floor (the garden-wall coping hides everything of the far planes below it). */
  wallTop: 862,
  /** The towpath: the garden walls' foot, her line, the coping top, the water's edge. */
  wallFoot: 992,
  herFeet: MAP.S4.her.feetY, // 1070
  copingTop: 1070,
  edge: 1082,
  /** The canal strip and our boat. */
  roofFar: 1222,
  cabinTop: 1290,
  gunwale: 1640,
  waterline: 1700,
} as const;

/** The plane-x span a plane must cover (k = its speed factor). */
export const PLANE_X = (k: number): [number, number] => [-90, 1080 + 310 * k + 90];

/** The sun at the pose (V2S4.tsx draws it; fixed through the truck). Its column must stay clear of every plane but the
 *  gasholder lattice: plane-x [189 .. 311 + 310 k] is kept below y 716 on each plane. */
export const SUN = MAP.S4.sunAtPose; // (250, 650) r 61.3
export const SUN_PT: Pt = [SUN.x, SUN.y];
export const sunClear = (k: number): [number, number] => [SUN.x - SUN.r - 14, SUN.x + SUN.r + 310 * k + 14];

/** The story's keep-out boxes (screen px; life never crosses lettering, nothing covers her or Pip). */
export const KEEP = {
  her: {x0: 684, x1: 758, y0: 896, y1: 1072},
  /** The name tag (15.07-18.80): its card, built 1 then grown down. */
  tag: {x0: 594, x1: 876, y0: 600, y1: 870, t0: 15.0, t1: 18.85},
  /** The two plates (18.92 ->) and the post (always). */
  plates: {x0: 100, x1: 566, y0: 750, y1: 970, t0: 18.85},
  post: {x0: 563, x1: 588, y0: 730, y1: 1064},
  /** Pip's seat on our roof (keep the roof clear) and nothing tall on the roof under her. */
  pipRoof: {x0: 410, x1: 530},
  roofUnderHer: {x0: 640, x1: 800, yMin: 1090},
} as const;

/** The light: SUN1 low in the west. Shadows fall EAST (screen right) and a little toward us, SHORT (STYLE.md 2: a flat
 *  colour polygon <= ~40 px past the object). */
export const SHADOW = {len: 34, drop: 0.16} as const;

/** The canal wind blows toward the east (screen right): smoke, washing, leaves and the herbs lean right. */
export const WIND = 1;

/** Ease helpers (pure). */
export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth01 = (v: number) => {
  const k = clamp01(v);
  return k * k * (3 - 2 * k);
};
/** 12 drawings/s clock. */
export const q12 = (t: number) => Math.floor(t * 12 + 1e-6) / 12;
