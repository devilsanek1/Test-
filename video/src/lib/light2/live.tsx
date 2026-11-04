// lib/light2/live.tsx: LIGHT ON MOVERS, live from the mover's own drawing every frame (organic/light.md §4.0 home 3:
// "light on a mover is computed from its pose at t"; §4.3 rims, §4.6 shadows, §4.7 the wrap). Each layer takes the
// mover's drawing as a node (`of`: the same element the scene draws, e.g. <S1Row />), so the light follows every
// drawing of the pose for free; nothing accumulates across frames (a frame renders the same alone or in sequence).
// Each mask and filter is cut to the mover's region (light.md §7: every live layer within the measuring noise when its
// region is small). Film-agnostic: the scene gives the light's image point, colours and doses.
//
//   <RimOf of={her} region={box} toward={SUN_IMG} c={herCentre} width={4} color="#FFC27A" />     the key's rim (n . l)
//   <WrapOf of={her} region={box} img={doorBlur} width={3.6} />                                  a backlit doorway's wrap
//   <ShadowCut of={her} region={poolBox} casts={[affine...]} share={[1/3, 1/3, 1/3]}>           her shadow cut out of
//     <LightMap {...pool} blend="normal" />                                                      the door's pool
//   </ShadowCut>
//   <GrainOn of={her} region={box} tile={grain} />                                               the paper on a mover
import React, {useEffect, useId, useState} from 'react';
import {continueRender, delayRender} from 'remotion';
import {LightMap, type MapBox} from './LightMap';

export type Pt = [number, number];
/** A region in user px: x, y, w, h. */
export type Region = readonly [number, number, number, number];
/** A 2D affine map [a, b, c, d, e, f] (SVG matrix order: x' = a x + c y + e, y' = b x + d y + f). */
export type Affine = readonly [number, number, number, number, number, number];

const uid = (raw: string) => raw.replace(/[^a-zA-Z0-9]/g, '');
const r2 = (n: number) => Math.round(n * 1000) / 1000;
const regionAttrs = (r: Region) => ({x: r[0], y: r[1], width: r[2], height: r[3]});
/** A colour matrix that keeps the alpha and sets RGB to one colour (0..1 each). */
const flatMatrix = (r: number, g: number, b: number) => `0 0 0 0 ${r2(r)}  0 0 0 0 ${r2(g)}  0 0 0 0 ${r2(b)}  0 0 0 1 0`;

/** The unit vector from c toward the light's image point (a sun in frame, a lamp). */
export function toward(c: Pt, light: Pt): Pt {
  const dx = light[0] - c[0];
  const dy = light[1] - c[1];
  const n = Math.hypot(dx, dy) || 1;
  return [dx / n, dy / n];
}

/** The affine map that best fits a projective one (a homography H, row-major 3x3) over a box: exact at the box's four
 *  corners in the least-squares sense. A figure is small against its light's distance, so its cast shadow from a point
 *  light is near-affine over the figure (light.md §4.6's homography; the error is reported by the scene's bake). */
export function affineFit(H: readonly number[], box: Region): Affine {
  const [x0, y0, w, h] = box;
  const src: Pt[] = [
    [x0, y0],
    [x0 + w, y0],
    [x0, y0 + h],
    [x0 + w, y0 + h],
    [x0 + w / 2, y0 + h / 2],
  ];
  const dst = src.map(([x, y]) => {
    const z = H[6] * x + H[7] * y + H[8];
    return [(H[0] * x + H[1] * y + H[2]) / z, (H[3] * x + H[4] * y + H[5]) / z] as Pt;
  });
  // least squares for x' = a x + c y + e and y' = b x + d y + f (normal equations, 3x3)
  const solve3 = (rows: number[][], rhs: number[]): number[] => {
    const m = rows.map((r, i) => [...r, rhs[i]]);
    for (let i = 0; i < 3; i++) {
      let p = i;
      for (let k = i + 1; k < 3; k++) if (Math.abs(m[k][i]) > Math.abs(m[p][i])) p = k;
      [m[i], m[p]] = [m[p], m[i]];
      for (let k = 0; k < 3; k++) {
        if (k === i) continue;
        const f = m[k][i] / m[i][i];
        for (let j = i; j < 4; j++) m[k][j] -= f * m[i][j];
      }
    }
    return [m[0][3] / m[0][0], m[1][3] / m[1][1], m[2][3] / m[2][2]];
  };
  const A = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  const bx = [0, 0, 0];
  const by = [0, 0, 0];
  src.forEach(([x, y], i) => {
    const v = [x, y, 1];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) A[r][c] += v[r] * v[c];
      bx[r] += v[r] * dst[i][0];
      by[r] += v[r] * dst[i][1];
    }
  });
  const [a, c, e] = solve3(A, bx);
  const [b, d, f] = solve3(A, by);
  return [a, b, c, d, e, f];
}

/** The homography of a point light's cast shadow onto a ground line (light.md §4.6): the plane of a vertical billboard
 *  standing on the ground at `groundY` sent through the light L onto the ground, fitted from four points: two on the
 *  ground (fixed) and two at height (each to where the ray L -> P meets the ray from the light's foot Lf through P's
 *  foot). Returned row-major 3x3. */
export function castHomography(L: Pt, Lf: Pt, groundY: number, box: Region): number[] {
  const [x0, , w] = box;
  const top = box[1];
  const cast = (P: Pt): Pt => {
    const G: Pt = [P[0], groundY];
    const d1x = P[0] - L[0];
    const d1y = P[1] - L[1];
    const d2x = G[0] - Lf[0];
    const d2y = G[1] - Lf[1];
    const det = d1x * -d2y - -d2x * d1y;
    if (Math.abs(det) < 1e-9) return P;
    const rx = Lf[0] - L[0];
    const ry = Lf[1] - L[1];
    const a = (rx * -d2y - -d2x * ry) / det;
    return [L[0] + a * d1x, L[1] + a * d1y];
  };
  const src: Pt[] = [
    [x0, groundY],
    [x0 + w, groundY],
    [x0 + w, top],
    [x0, top],
  ];
  const dst = src.map((p, i) => (i < 2 ? p : cast(p)));
  return homography(src, dst);
}

/** The homography sending four points to four points (DLT, h33 = 1), row-major 3x3. */
export function homography(src: Pt[], dst: Pt[]): number[] {
  const M: number[][] = [];
  src.forEach(([x, y], i) => {
    const [u, v] = dst[i];
    M.push([x, y, 1, 0, 0, 0, -u * x, -u * y, u]);
    M.push([0, 0, 0, x, y, 1, -v * x, -v * y, v]);
  });
  // Gauss-Jordan on the 8x9 system
  for (let i = 0; i < 8; i++) {
    let p = i;
    for (let k = i + 1; k < 8; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
    [M[i], M[p]] = [M[p], M[i]];
    const piv = M[i][i];
    for (let j = i; j < 9; j++) M[i][j] /= piv;
    for (let k = 0; k < 8; k++) {
      if (k === i) continue;
      const f = M[k][i];
      for (let j = i; j < 9; j++) M[k][j] -= f * M[i][j];
    }
  }
  return [...M.map((r) => r[8]), 1];
}

const hexToRgb01 = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '');
  return [parseInt(h.slice(0, 2), 16) / 255, parseInt(h.slice(2, 4), 16) / 255, parseInt(h.slice(4, 6), 16) / 255];
};

/** A RIM from a key the mover faces (light.md §4.3): the silhouette minus a copy moved `width` px AWAY from the light,
 *  i.e. a band width x max(0, n . l) thick, in the light's colour, screened. `steps` 2 adds a softer band twice as wide
 *  at `soft` (a crisp edge and its falloff); `blur` softens the band's inner edge (px). The band follows the drawing
 *  exactly, so it is uneven by construction (thicker where the edge faces the light), never an even outline. */
export const RimOf: React.FC<{
  of: React.ReactNode;
  region: Region;
  /** The unit vector toward the light (`toward(c, lightImage)`). */
  l: Pt;
  width: number;
  color: string;
  opacity?: number;
  steps?: 1 | 2;
  soft?: number;
  blur?: number;
}> = ({of, region, l, width, color, opacity = 1, steps = 2, soft = 0.38, blur = 0.6}) => {
  const id = 'rim' + uid(useId());
  const R = regionAttrs(region);
  const band = (w: number, k: number, op: number) => (
    <g key={k}>
      <defs>
        <mask id={`${id}m${k}`} maskUnits="userSpaceOnUse" {...R}>
          <g filter={`url(#${id}w)`}>{of}</g>
          <g transform={`translate(${r2(-l[0] * w)} ${r2(-l[1] * w)})`}>
            <g filter={`url(#${id}k)`}>{of}</g>
          </g>
        </mask>
      </defs>
      <g style={{mixBlendMode: 'screen'}} opacity={op}>
        <rect {...R} fill={color} mask={`url(#${id}m${k})`} filter={blur > 0 ? `url(#${id}b)` : undefined} />
      </g>
    </g>
  );
  return (
    <>
      <defs>
        <filter id={`${id}w`} filterUnits="userSpaceOnUse" {...R} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={flatMatrix(1, 1, 1)} />
        </filter>
        <filter id={`${id}k`} filterUnits="userSpaceOnUse" {...R} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={flatMatrix(0, 0, 0)} />
        </filter>
        <filter id={`${id}b`} filterUnits="userSpaceOnUse" {...R} colorInterpolationFilters="sRGB">
          <feGaussianBlur stdDeviation={blur} />
        </filter>
      </defs>
      {band(width, 0, opacity)}
      {steps === 2 ? band(width * 2, 1, opacity * soft) : null}
    </>
  );
};

/** LIGHT WRAP (light.md §4.7): the mover's inner edge band, all round (`width` px), times a baked image of the light
 *  behind it (the lit opening blurred), screened. It fades by itself as the mover leaves the light, because it is
 *  weighted by the light at its edge: no keyframes. */
export const WrapOf: React.FC<{of: React.ReactNode; region: Region; img: {src: string; box: MapBox}; width: number; opacity?: number; blur?: number}> = ({of, region, img, width, opacity = 1, blur = 0.7}) => {
  const id = 'wrap' + uid(useId());
  const R = regionAttrs(region);
  const [ix, iy, iw, ih] = img.box;
  return (
    <>
      <defs>
        <filter id={id} filterUnits="userSpaceOnUse" {...R} colorInterpolationFilters="sRGB">
          <feMorphology in="SourceAlpha" operator="erode" radius={width} result="er" />
          <feComposite in="SourceAlpha" in2="er" operator="out" result="band" />
          <feGaussianBlur in="band" stdDeviation={blur} result="soft" />
          <feImage href={img.src} x={ix} y={iy} width={iw} height={ih} preserveAspectRatio="none" result="img" />
          <feComposite in="img" in2="soft" operator="in" />
        </filter>
      </defs>
      <Preload src={img.src} label="wrap" />
      <g style={{mixBlendMode: 'screen'}} opacity={opacity} filter={`url(#${id})`}>
        {of}
      </g>
    </>
  );
};

/** A mover's SHADE (a backlit figure's front in its own shade): its silhouette filled with one tint, multiplied. */
export const ShadeOf: React.FC<{of: React.ReactNode; region: Region; tint: string; opacity?: number}> = ({of, region, tint, opacity = 1}) => {
  const id = 'shd' + uid(useId());
  const R = regionAttrs(region);
  const [r, g, b] = hexToRgb01(tint);
  return (
    <>
      <defs>
        <filter id={id} filterUnits="userSpaceOnUse" {...R} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={flatMatrix(r, g, b)} />
        </filter>
      </defs>
      <g style={{mixBlendMode: 'multiply'}} opacity={opacity} filter={`url(#${id})`}>
        {of}
      </g>
    </>
  );
};

/** A light layer with the mover's CAST SHADOWS cut out of it (light.md §4.6: every caster in a pool cuts its own
 *  shadow out of it; a shadow is the light removed, never a dark stamp). `casts` are the affine maps of the mover's
 *  drawing onto the ground, one per lamp, each removing its `share` of the light; `blur` is the penumbra (px). The
 *  children (the pool's map, drawn `normal` inside) are composited with `blend` onto what is under them. */
export const ShadowCut: React.FC<{of: React.ReactNode; region: Region; casts: readonly Affine[]; share?: readonly number[]; blur?: number; blend?: 'screen' | 'multiply' | 'plus-lighter'; children?: React.ReactNode}> = ({of, region, casts, share, blur = 2.5, blend = 'screen', children}) => {
  const id = 'cut' + uid(useId());
  const R = regionAttrs(region);
  return (
    <>
      <defs>
        <filter id={`${id}k`} filterUnits="userSpaceOnUse" {...R} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={flatMatrix(0, 0, 0)} result="k" />
          <feGaussianBlur in="k" stdDeviation={blur} />
        </filter>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" {...R}>
          <rect {...R} fill="#FFFFFF" />
          {casts.map((A, i) => (
            <g key={i} opacity={share ? share[i] : 1 / casts.length} filter={`url(#${id}k)`}>
              <g transform={`matrix(${A.map(r2).join(' ')})`}>{of}</g>
            </g>
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id}m)`} style={{mixBlendMode: blend}}>
        {children}
      </g>
    </>
  );
};

/** Holds the frame until an image used inside a filter (feImage) or a mask has loaded: an invisible image of the same
 *  URL (the browser shares the load), released on its load like lib/paint's PaintImage. */
export const Preload: React.FC<{src: string; label?: string}> = ({src, label}) => {
  const [handle] = useState(() => delayRender(`light2 preload ${label ?? src.slice(-40)}`));
  useEffect(() => () => continueRender(handle), [handle]);
  return <image href={src} x={0} y={0} width={1} height={1} opacity={0} onLoad={() => continueRender(handle)} onError={() => continueRender(handle)} />;
};

/** The PAPER on a mover (the frame's one texture, light_proof.md): the baked grain tile (mid-grey + the grain: neutral
 *  at 50 %) as one image over the mover's region, its origin `at` locked to the mover (so the grain walks with her and
 *  never slides over her), masked by the silhouette, soft-light blended. The tile must cover the region. */
export const GrainOn: React.FC<{of: React.ReactNode; region: Region; tile: {src: string; size: number}; at: Pt; opacity?: number}> = ({of, region, tile, at, opacity = 1}) => {
  const id = 'grn' + uid(useId());
  const R = regionAttrs(region);
  return (
    <>
      <defs>
        <filter id={`${id}w`} filterUnits="userSpaceOnUse" {...R} colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={flatMatrix(1, 1, 1)} />
        </filter>
        <mask id={`${id}m`} maskUnits="userSpaceOnUse" {...R}>
          <g filter={`url(#${id}w)`}>{of}</g>
        </mask>
      </defs>
      <g style={{mixBlendMode: 'soft-light'}} opacity={opacity} mask={`url(#${id}m)`}>
        <LightMap src={tile.src} box={[at[0], at[1], tile.size, tile.size]} blend="normal" label="grain" />
      </g>
    </>
  );
};
