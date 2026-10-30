// lib/light2/LightMap.tsx: a BAKED LIGHT MAP drawn in its plane's own group (organic/light.md §4.2 and §4.11; the proof:
// docs/look/organic/light_proof.md). A map is one 8-bit PNG cropped to the box where it changes anything, blended onto
// what is already drawn under it:
//   multiply      the shade (and any darkening): out = under x map (sRGB values, as the browser blends)
//   screen        the light SOLVED per pixel against the plane's own render: out = 1 - (1 - under)(1 - map), so the
//                 browser's sRGB blend lands on the bake's linear-light result (light.md §4.11: a naive light map is
//                 2-4x too bright on dark ground)
//   plus-lighter  the same, additive (m = target - under)
// Placed INSIDE the plane's float group, a map rides its plane exactly like the shapes it lights (light.md §4.10: static
// light is baked once per state and never slides). Opt-in and film-agnostic: nothing here knows a scene.
//
//   <g transform={planeFloat}>  ...the plane's shapes...  <LightMaps maps={[{src, box, blend: 'multiply'}, ...]} />  </g>
//
// The image holds the frame until it has loaded (an SVG <image> loads asynchronously; Remotion must never capture a
// frame before its light is drawn), like lib/paint's PaintImage.
import React, {useEffect, useState} from 'react';
import {continueRender, delayRender} from 'remotion';

/** Where a map sits, in its plane's own px (world px at rest): x, y, width, height. */
export type MapBox = readonly [number, number, number, number];
export type MapBlend = 'multiply' | 'screen' | 'plus-lighter' | 'normal' | 'soft-light';

/** One baked map: its URL (a bundled PNG import or a staticFile path), its box and how it blends. */
export type LightMapSpec = {src: string; box: MapBox; blend: MapBlend; opacity?: number};

/** One map as an SVG image with its blend mode, holding the frame until it is drawn. */
export const LightMap: React.FC<LightMapSpec & {label?: string}> = ({src, box, blend, opacity, label}) => {
  const [handle] = useState(() => delayRender(`light2 map ${label ?? src.slice(-48)}`));
  useEffect(() => () => continueRender(handle), [handle]);
  const [x, y, w, h] = box;
  return (
    <image
      href={src}
      x={x}
      y={y}
      width={w}
      height={h}
      preserveAspectRatio="none"
      opacity={opacity}
      style={blend === 'normal' ? undefined : {mixBlendMode: blend}}
      onLoad={() => continueRender(handle)}
      onError={() => continueRender(handle)}
    />
  );
};

/** A plane's maps in order (multiply first, then the solved screen map: the order the bake solved them in). */
export const LightMaps: React.FC<{maps?: readonly LightMapSpec[]; label?: string}> = ({maps, label}) =>
  maps && maps.length ? (
    <>
      {maps.map((m, i) => (
        <LightMap key={i} {...m} label={`${label ?? ''}#${i}`} />
      ))}
    </>
  ) : null;
