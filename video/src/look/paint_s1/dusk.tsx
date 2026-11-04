// (paint v5) ONE evening light for the whole scene, in this copy only (never src/v2r): the coordinator, 2026-10-29,
// on the owner's "we are getting there": the dusk sky's light reaches the water, the paving and the facade.
//   DuskWater     the canal mirrors the dusk sky: a colour matrix on the water's own group (fitted in OKLab-free RGB
//                 least squares: its teal -> lavender, its light mint -> rose-lilac, peach and the gold glint kept)
//   DuskOverlay   a soft-light wash in screen px: warm peach toward the low sun (left), lilac away from it (right)
//   duskRig       RIG_CANAL with its shadow family turned lilac (form / cast / contact strengths kept)
// Off (every set but v5) none of it draws: v1-v4 render as before. A colour matrix and a blend never resample, so her,
// the door, the sign, Pip and the captions stay crisp (her plane and Pip are drawn after the overlays anyway).
import React, {createContext, useContext, useId} from 'react';
import {tintFamily, type LightRig} from '../../lib/light';
import {TINT_CANAL} from '../../v2r/world/rigs';

const DuskCtx = createContext(false);
export const DuskProvider: React.FC<{on: boolean; children?: React.ReactNode}> = ({on, children}) => <DuskCtx.Provider value={on}>{children}</DuskCtx.Provider>;
export const useDusk = () => useContext(DuskCtx);

/** The water's dusk matrix (rows R, G, B, A; 0-1 units). */
const WATER_MATRIX = '0.2463 1.3176 -0.552 0 0.0097 0.3718 0.554 0.0889 0 -0.038 -0.564 0.8011 0.7178 0 0.0315 0 0 0 1 0';

export const DuskWater: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const on = useDusk();
  const id = 'dw' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (!on) return <>{children}</>;
  return (
    <>
      <defs>
        <filter id={id} x="0" y="0" width="1080" height="1920" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={WATER_MATRIX} />
        </filter>
      </defs>
      <g filter={`url(#${id})`}>{children}</g>
    </>
  );
};

/** A soft-light wash over a screen rect: `stops` [offset, colour, opacity] left to right. */
export const DuskOverlay: React.FC<{x: number; y: number; w: number; h: number; stops: [number, string, number][]; opacity?: number}> = ({x, y, w, h, stops, opacity = 1}) => {
  const on = useDusk();
  const id = 'do' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (!on) return null;
  return (
    <>
      <defs>
        <linearGradient id={id} gradientUnits="userSpaceOnUse" x1={x} y1={0} x2={x + w} y2={0}>
          {stops.map(([o, c, a], i) => (
            <stop key={i} offset={o} stopColor={c} stopOpacity={a} />
          ))}
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} opacity={opacity} style={{mixBlendMode: 'soft-light'}} />
    </>
  );
};

/** RIG_CANAL's light with a LILAC shadow family (the dusk sky's shade side), the water's own step kept. */
export const duskRig = (rig: LightRig): LightRig => ({
  ...rig,
  tints: {...tintFamily('#9A88BC', {form: 0.2, cast: 0.28, contact: 0.48}, '#FFFFFF'), water: TINT_CANAL.water} as LightRig['tints'],
});
