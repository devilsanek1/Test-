// lib/texture.tsx: the VERY subtle paper-and-paint MOTTLE, one per parallax plane, an ENGINE primitive (owner,
// 2026-10-28: "start playing with it, very subtly especially if its adding to the premium look"; DIRECTION rule 4:
// "a fine paper-and-paint grain with gentle mottling in the big flats, static and locked to the world"; tried in a look
// clip, kept only if it adds). The spec is docs/look/CRAFT.md §c "The paper-and-paint test, its spec" (it wins over
// this file); the how-to and the measurements: docs/studies/2026-10-28_city_posters/test/ENGINE_PT.md §3. Opt-in: a
// scene that never wraps a plane in <Mottle> renders exactly as before; <Mottle k={0}> renders its children unfiltered.
//
//   <S1Plane plane={S1_PLANE.bank}>                       // the plane's float group (its transform moves the mottle too)
//     <Mottle k={mottleK({plane: -1})} seed={3} offset={floatOffsetOfThisPlane}>
//       ...the plane's fills...
//     </Mottle>
//   </S1Plane>
//
// HOW: an SVG filter on the plane's group: feTurbulence (fractalNoise: deterministic, specified to the bit by the SVG
// reference code, no asset to load) -> a colour matrix (one luminance noise plus two faint colour noises) -> the plane's
// own pixels multiplied by (1 + s (N - 0.5)) in sRGB (feComposite arithmetic: transparent stays transparent, the mean
// colour is kept). The noise lives in the group's user space: it rides the group's transform exactly (a sub-pixel
// float moves it with the fills, a zoom scales it with the world), so it is locked to its plane and never boils; the
// caption band is cut out in SCREEN space (the band rows are mapped back through the group's float offset).
//
// What it is NOT: no grain (CRAFT §c: none in the first test; a grain at the subtlest posters' level, 0.25 L*, costs
// +48 % bitrate and shimmers), no screen-locked or re-seeded texture (6-14x the bitrate, erased by the platform), no
// texture in the caption band (DIRECTION rule 10), no opacity, blur or glow on anything.

import React, {useId} from 'react';
import {useTime} from './time';
import type {Tier} from './pen';

// ================================================================= the spec (CRAFT §c; pro_4 §3.4; pro_2 §3.1)

/** The mottle at k = 1: std 0.5 L* on a light fill (L* ~85; it is a multiplicative paint-density variation, so a
 *  darker fill shows proportionally less: ~0.7x at L* 60, ~0.4x at L* 33), blotches 30-70 px (the autocorrelation's 1/e
 *  radius ~28 px, as the study's encode test: sigma 14 px), its colour <= 0.35 in a*b*. */
export const MOTTLE = {std: 0.5, blotch: [30, 70] as [number, number], radius: 28, chroma: 0.35} as const;

/** The strength by tier and plane (CRAFT §c, pro_2 §3.1 "texture 1.0x / 1.0x / 0.7x / 0.4x"; the sky ~0.6, est.):
 *  tiers A and B 1.0, near C 0.7, far C 0.4, the sky 0.6. */
export const MOTTLE_K = {subject: 1, support: 1, nearC: 0.7, farC: 0.4, sky: 0.6} as const;

/** A plane group's k: the sky 0.6; a group holding tier A or B (the subject's plane) 1.0; tier C on plane <= +1 0.7
 *  (the near ground, the water, the near frame), on +2 and farther 0.4. */
export function mottleK(o: {plane?: number; tier?: Tier; sky?: boolean} = {}): number {
  if (o.sky) return MOTTLE_K.sky;
  if (o.tier === 'subject' || o.tier === 'support') return MOTTLE_K.subject;
  return (o.plane ?? 0) >= 2 ? MOTTLE_K.farC : MOTTLE_K.nearC;
}

/** The caption band (keep clear): LAYOUT.md y 290-600. */
export const MOTTLE_BAND: [number, number] = [290, 600];

/** Calibration (measured on flat fields, `src/look/pt` PtTextureCal, ENGINE_PT.md §3): k = 1 gives std 0.5 L* on a
 *  light fill with these values. */
const CAL: {s: number; freq: number; octaves: number; ca: number; cb: number} = {
  /** feComposite k1 per unit k: the modulation's amplitude. */
  s: 0.049,
  /** The turbulence's base frequency for MOTTLE.radius (fractalNoise, 3 octaves): 1/e radius ~30 px measured in 400 px windows (the posters 20-36, median 30). */
  freq: 0.0125,
  octaves: 3,
  /** The two colour noises' weights in the colour matrix (a*-ish: R against G; b*-ish: R+G against B): a*b* std
   *  0.25-0.35 measured (the value mottle alone leaves 0.04-0.2: the 8-bit rounding). */
  ca: 0.18,
  cb: 0.21,
};

export type MottleProps = {
  /** Strength: 1 = the spec (std 0.5 L* on a light fill); `mottleK(...)` by tier and plane; 0 = off (no filter). */
  k?: number;
  /** The plane's own noise (an integer): each plane a different seed, so two planes never read as one sliding sheet. */
  seed?: number;
  /** The blotch scale against the spec's (1 = 1/e radius ~28 px; 0.7-1.3 stays inside 30-70 px blotches). */
  scale?: number;
  /** The colour share (0-1 of the spec's a*b* <= 0.35; 0 = a pure value mottle). */
  chroma?: number;
  /** Screen rows kept free of texture (default the caption band y 290-600; null = none), with a soft edge of
   *  `soft` px outside it (a vertical Gaussian ramp, so the mottle eases out instead of stopping on a line). */
  band?: [number, number] | null;
  soft?: number;
  /** The group's current translation on screen (its float offset): keeps the band screen-locked. [0, 0] at rest. */
  offset?: [number, number];
  /** The filter region in the group's user space [x, y, w, h] (default the frame + 160 px). It CLIPS the plane: it
   *  must hold everything the plane draws (plus its float); a tighter one is cheaper (the cost is per pixel). */
  region?: [number, number, number, number];
  /** On from this scene time (s): the look clip's switch ("the mottle switched on at 3.5 s"); true / false. */
  on?: boolean | number;
  /** Calibration only (src/look/pt's PtTextureCal): override the measured constants. Films never pass it. */
  cal?: Partial<typeof CAL>;
  children?: React.ReactNode;
};

const fmt = (n: number) => (Math.abs(n) < 1e-9 ? '0' : n.toFixed(5).replace(/0+$/, '').replace(/\.$/, ''));

/** The colour matrix: R' = G' = B' = the luminance noise (turbulence R) plus two faint colour noises (G, B), A' = 1. */
function matrix(chroma: number, cal: typeof CAL): string {
  const a = cal.ca * chroma;
  const b = cal.cb * chroma;
  const rows = [
    [1, a, b / 2, 0, -(a + b / 2) / 2],
    [1, -a, b / 2, 0, (a - b / 2) / 2],
    [1, 0, -b, 0, b / 2],
    [0, 0, 0, 0, 1],
  ];
  return rows.map((r) => r.map(fmt).join(' ')).join('  ');
}

/** The band mask in the group's user space: one neutral grey flood (the noise's mean: no modulation) over the band and
 *  half the soft edge beyond it, blurred vertically (sigma soft/4), so the mottle is gone 2 sigma inside the band edge
 *  (2 %) and full from `soft` px outside it: a smooth ramp, no line. null when the region never reaches the band. */
function bandMask(b: [number, number], soft: number, dy: number, ry: number, rh: number): {y: number; h: number; sigma: number; y0: number; h0: number} | null {
  const pad = soft / 2;
  const sigma = Math.max(0.5, soft / 4);
  const y = b[0] - pad - dy;
  const h = b[1] - b[0] + 2 * pad;
  const y0 = y - 3 * sigma;
  const h0 = h + 6 * sigma;
  if (y0 > ry + rh || y0 + h0 < ry) return null;
  const r2 = (n: number) => Math.round(n * 100) / 100;
  return {y: r2(y), h: r2(h), sigma: r2(sigma), y0: r2(y0), h0: r2(h0)};
}

/** THE MOTTLE: wraps one plane's fills (inside the plane's float group). Static: a pure function of its props and the
 *  group's transform; never re-seeded, never screen-locked. */
export const Mottle: React.FC<MottleProps> = ({k = 1, seed = 1, scale = 1, chroma = 1, band = MOTTLE_BAND, soft = 48, offset = [0, 0], region, on = true, cal: calIn, children}) => {
  const t = useTime();
  const id = 'mottle' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const live = k > 0 && (on === true || (typeof on === 'number' && t >= on));
  if (!live) return <g>{children}</g>;
  const cal = calIn ? {...CAL, ...calIn} : CAL;
  const [rx, ry, rw, rh] = region ?? [-160, -160, 1400, 2240];
  const s = cal.s * k;
  const freq = cal.freq / Math.max(0.2, scale);
  const mask = band ? bandMask(band, soft, offset[1], ry, rh) : null;
  return (
    <g filter={`url(#${id})`}>
      <defs>
        <filter id={id} x={rx} y={ry} width={rw} height={rh} filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency={fmt(freq)} numOctaves={cal.octaves} seed={Math.round(seed)} stitchTiles="noStitch" result="turb" />
          <feColorMatrix in="turb" type="matrix" values={matrix(Math.max(0, Math.min(1, chroma)), cal)} result="noise" />
          {mask ? (
            <>
              <feFlood floodColor="rgb(50%,50%,50%)" x={rx} y={mask.y} width={rw} height={mask.h} result="bandHard" />
              <feGaussianBlur in="bandHard" stdDeviation={`0 ${mask.sigma}`} x={rx} y={mask.y0} width={rw} height={mask.h0} result="bandSoft" />
              <feMerge result="masked">
                <feMergeNode in="noise" />
                <feMergeNode in="bandSoft" />
              </feMerge>
            </>
          ) : null}
          {/* the plane x (1 + s (N - 0.5)): mean-exact (+-0.01 L* on every plane, measured). Its one cost: the alpha of
              a plane's outer anti-aliased pixel rises by s/2, so while the plane floats at a fractional offset that row
              reads <= ~0.8 L* darker (0 at rest): a 0.02 px dilation of its silhouette, inside CRAFT §c's float budget
              (<= ~2 L*). The alpha-exact variant (divide by 1 + s/2, multiply back with a transfer) is NOT used: its
              extra 8-bit step truncates, shifting whole planes by 0.05-0.18 L* (ENGINE_PT.md §3). */}
          <feComposite in="SourceGraphic" in2={mask ? 'masked' : 'noise'} operator="arithmetic" k1={fmt(s)} k2={fmt(1 - s * 0.5)} k3="0" k4="0" />
        </filter>
      </defs>
      {children}
    </g>
  );
};

/** The scene's lint for its mottled planes: k over the plane's spec (A/B 1.0, near C 0.7, far C 0.4, the sky 0.6),
 *  a plane drawn over the caption band without the band kept clear. [] = OK. */
export function mottleProblems(planes: {name: string; k: number; plane?: number; tier?: Tier; sky?: boolean; band?: [number, number] | null; reachesBand?: boolean}[]): string[] {
  const out: string[] = [];
  for (const p of planes) {
    const max = mottleK(p);
    if (p.k > max + 1e-6) out.push(`${p.name}: mottle k ${p.k} over its plane's ${max} (CRAFT §c: 1.0 / 0.7 / 0.4, the sky 0.6)`);
    if (p.reachesBand && p.band === null) out.push(`${p.name}: reaches the caption band with no band kept clear (DIRECTION rule 10)`);
  }
  return out;
}
