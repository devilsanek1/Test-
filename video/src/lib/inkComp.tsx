// inkComp.tsx — OPT-IN ink compensation for camera zooms. A camera that scales the world by z scales every stroke by z
// too: S01's 0.33 s dive (x3.07) lands its 3.4 px set lines at the cut as ~10 px (style ceiling 5.2 px) while S02 opens
// at 3-4 px. Inside an <InkScale>, the engine's strokes are drawn at width x factor; with factor = (z / z0)^-k a zoom
// of z keeps only z^(1-k) of its line growth (k 0.6: a 3x dive lands at ~1.55x weight instead of 3x).
//
//   <InkScale value={inkCompFactor(zoomNow, 0.6, zoomAtDiveStart)}>...layer...</InkScale>   // a scene's own camera
//   keys={[..., {t: 4.385, zoom: 1.04}, {t: 4.715, zoom: 3.19, inkComp: 0.6}]}             // engine camera keys
//   <World push={{to: 1.3, inkComp: 0.6}}>                                                  // World push
//   transitionIn: {type: 'push-through', zoom: 7, inkComp: 0.6}                             // Film transition camera
//
// DEFAULT OFF: outside any <InkScale> the factor is 1 and nothing changes. Nested InkScales MULTIPLY (a scene camera's
// compensation inside a World push's). Reading it costs one context read per stroke: no extra render pass.
// Honoured by: <Ink> (so <Drawn>, <InkGroup> and every kit / set / prop line drawn with Ink), the mascot <Elephant>
// (its brush polygons), <Sun> clock hands and the kit Bird flight stroke (kit/Nature.tsx). A raw <path strokeWidth>
// you draw yourself: multiply by useInkScale(). Geometry (dash spacing, misregistration offsets, sizes) is NOT
// compensated. A camera's factor is HELD after its flagged segment: a camera that comes back must flag the return too,
// or the lines stay thinner than nominal at rest (ENGINE.md 4b).

import React, {createContext, useContext} from 'react';

/** House exponent: a 3x zoom keeps 3^0.4 = 1.55x of its line growth. */
export const INK_COMP_K = 0.6;

const LO = 0.05;
const HI = 20;
const safe = (v: number) => (Number.isFinite(v) && v > 0 ? Math.min(HI, Math.max(LO, v)) : 1);

/** Width factor for a camera zoom: (zoom / from)^-k. 1 when k is 0 / undefined or the zoom is at `from`. Use `from`
 *  = the zoom where the compensated move starts, so the factor is exactly 1 there (no width step). */
export function inkCompFactor(zoom: number, k: number | undefined = INK_COMP_K, from = 1): number {
  if (!k || !(zoom > 0) || !(from > 0)) return 1;
  return safe(Math.pow(zoom / from, -k));
}

const InkScaleCtx = createContext<number>(1);

/** The stroke-width factor in effect here (1 = no compensation). Multiply raw strokeWidths you draw yourself by it. */
export const useInkScale = () => useContext(InkScaleCtx);

export type InkScaleProps = {
  /** Width factor for everything inside (multiplies an enclosing InkScale). Default 1. */
  value?: number;
  /** Instead of `value`: the camera zoom now; the factor is inkCompFactor(zoom, k, from). */
  zoom?: number;
  /** Zoom at which the compensation starts (factor 1 there). Default 1. */
  from?: number;
  /** Exponent for `zoom`. Default INK_COMP_K (0.6). */
  k?: number;
  /** Ignore enclosing InkScales (the factor is this one's alone): screen-space layers (<ScreenSpace>) use it. */
  reset?: boolean;
  children?: React.ReactNode;
};

/** Scales the stroke width of the engine's linework inside it (see header). Always renders one provider, so the tree
 *  keeps its shape when the factor returns to 1. */
export const InkScale: React.FC<InkScaleProps> = ({value, zoom, from = 1, k = INK_COMP_K, reset = false, children}) => {
  const parent = useContext(InkScaleCtx);
  const f = value !== undefined ? safe(value) : zoom !== undefined ? inkCompFactor(zoom, k, from) : 1;
  return <InkScaleCtx.Provider value={reset ? f : parent * f}>{children}</InkScaleCtx.Provider>;
};
