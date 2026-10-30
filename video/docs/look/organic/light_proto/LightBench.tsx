// LightBench: the PROPER LIGHT cost bench (docs/look/organic/light.md §7). v6's scene 1 (PaintS1 set 'v6') with ONE
// kind of light layer drawn over it, `n` copies, so render-frames.mjs's ms/frame gives each technique's cost in the
// real render path (the same bundle, headless shell and GL as the film). Overlay only: in production every layer sits
// INSIDE its plane's group (light.md §5); the blend costs the same. Her silhouette is her rowHidden mask's contour at
// 1.6 s, walked west at her pace (40 px/s), so the live layers follow a moving shape as they would follow her.
// The inputs are generated OUTSIDE the repo (light_proto/make_assets.py -> /tmp/organic/light/proto_gen/assets.ts).
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {PaintS1} from '../../../../src/look/paint_s1/PaintS1';
// @ts-ignore: generated at bench time (make_assets.py), never committed
import * as A from '/tmp/organic/light/proto_gen/assets';

export type LightBenchProps = {kind: string; n?: number; captions?: boolean};

const SUN: [number, number] = [195, 745];
const LAMP: [number, number] = [630, 874];       // the lobby's lamps through the opening
const LAMP_FOOT: [number, number] = [630, 1076]; // the floor under them
const FEET = 1095;
const SUN_C = '#FFC27A';
const DOOR_C = '#FFE2AE';

/** Her path's points (parsed once). */
const HER_PTS: [number, number][] = (A.HER as string)
  .replace(/^M|Z$/g, '')
  .split('L')
  .map((s: string) => s.trim().split(/\s+/).map(Number) as [number, number]);
const ptsD = (pts: [number, number][]) => 'M' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join('L') + 'Z';

/** The cast shadow of a vertical billboard point on the ground (light.md §4.6): the crossing of light -> P with
 *  foot -> G (G = P dropped to the ground). The same map as light_demo.py's homography, point by point. */
function castPt(P: [number, number], L: [number, number], Lf: [number, number], ground: number): [number, number] {
  const d1x = P[0] - L[0];
  const d1y = P[1] - L[1];
  const d2x = P[0] - Lf[0];
  const d2y = ground - Lf[1];
  const det = d1x * -d2y - -d2x * d1y;
  if (Math.abs(det) < 1e-9) return P;
  const rx = Lf[0] - L[0];
  const ry = Lf[1] - L[1];
  const a = (rx * -d2y - -d2x * ry) / det;
  return [L[0] + a * d1x, L[1] + a * d1y];
}

const Layer: React.FC<{kind: string; i: number; t: number}> = ({kind, i, t}) => {
  const id = `${kind}${i}`;
  const dx = -40.06 * (t - 1.6) - i * 0.0; // her walk (copies overlap: the cost, not the look, is measured)
  const herT = `translate(${dx.toFixed(2)} 0)`;
  const [bx, by, bw, bh] = A.HER_BOX as number[];
  const region = {x: bx + dx - 20, y: by - 20, width: bw + 40, height: bh + 40};
  // the light's direction at her centre (toward the sun), for the vector rim
  const cx = bx + bw / 2 + dx;
  const cy = by + bh / 2;
  const lx0 = SUN[0] - cx;
  const ly0 = SUN[1] - cy;
  const ln = Math.hypot(lx0, ly0);
  const lx = lx0 / ln;
  const ly = ly0 / ln;
  switch (kind) {
    case 'mapImg':
      // the baked light maps: shade (1/4 res, multiply), light (full res, screen), glow (1/4 res, screen)
      return (
        <>
          <image href={A.SHADE} x={0} y={0} width={1080} height={1920} preserveAspectRatio="none" style={{mixBlendMode: 'multiply'}} />
          <image href={A.LIGHT} x={0} y={0} width={1080} height={1920} preserveAspectRatio="none" style={{mixBlendMode: 'screen'}} />
          <image href={A.GLOW} x={0} y={0} width={1080} height={1920} preserveAspectRatio="none" style={{mixBlendMode: 'screen'}} />
        </>
      );
    case 'shadeOnly':
      // one full-frame multiply image (the shade map, 1/4 res, upscaled by the browser)
      return <image href={A.SHADE} x={0} y={0} width={1080} height={1920} preserveAspectRatio="none" style={{mixBlendMode: 'multiply'}} />;
    case 'mapCrop': {
      // the three maps, each cropped to the box where it does anything
      const im = (href: string, b: number[], blend: 'multiply' | 'screen') => (
        <image href={href} x={b[0]} y={b[1]} width={b[2]} height={b[3]} preserveAspectRatio="none" style={{mixBlendMode: blend}} />
      );
      return (
        <>
          {im(A.SHADE_C, A.SHADE_C_BOX, 'multiply')}
          {im(A.LIGHT_C, A.LIGHT_C_BOX, 'screen')}
          {im(A.GLOW_C, A.GLOW_C_BOX, 'screen')}
        </>
      );
    }
    case 'mapMerged': {
      // two layers per frame: the shade (multiply, cropped) and ONE screen map (light + glow merged, cropped)
      const im = (href: string, b: number[], blend: 'multiply' | 'screen') => (
        <image href={href} x={b[0]} y={b[1]} width={b[2]} height={b[3]} preserveAspectRatio="none" style={{mixBlendMode: blend}} />
      );
      return (
        <>
          {im(A.SHADE_C, A.SHADE_C_BOX, 'multiply')}
          {im(A.LG_C, A.LG_C_BOX, 'screen')}
        </>
      );
    }
    case 'proposal': {
      // the production proposal (light.md §4.0, §7): v6 with lib/light's live layers OFF (input prop lightOff), ONE
      // multiply map per frame (the new shade x v6's static shadows, cropped) + ONE screen map (light + glow, cropped),
      // and the live layers for her only: the two-step rim, the wrap, her shadow from the lobby's lamps
      const im = (href: string, b: number[], blend: 'multiply' | 'screen') => (
        <image href={href} x={b[0]} y={b[1]} width={b[2]} height={b[3]} preserveAspectRatio="none" style={{mixBlendMode: blend}} />
      );
      return (
        <>
          {im(A.SHADE_ALL, A.SHADE_ALL_BOX, 'multiply')}
          {im(A.LG_C, A.LG_C_BOX, 'screen')}
          <Layer kind="rimMask" i={i} t={t} />
          <Layer kind="wrap" i={i} t={t} />
          <Layer kind="shadowProj" i={i} t={t} />
        </>
      );
    }
    case 'solved': {
      // light.md §4.11 end to end: v6 with lib/light's layers off (input prop lightOff), the multiply map (the new
      // shade x v6's static shadows) and the screen map SOLVED against what lies under it, so the browser's own blends
      // give the proof's linear result (checked against make_assets.py's solved_target.npy outside her and the band)
      const im = (href: string, b: number[], blend: 'multiply' | 'screen') => (
        <image href={href} x={b[0]} y={b[1]} width={b[2]} height={b[3]} preserveAspectRatio="none" style={{mixBlendMode: blend}} />
      );
      return (
        <>
          {im(A.SHADE_ALL, A.SHADE_ALL_BOX, 'multiply')}
          {im(A.LG_SOLVED, A.LG_SOLVED_BOX, 'screen')}
        </>
      );
    }
    case 'screenOnly': {
      const b = A.LG_C_BOX as number[];
      return <image href={A.LG_C} x={b[0]} y={b[1]} width={b[2]} height={b[3]} preserveAspectRatio="none" style={{mixBlendMode: 'screen'}} />;
    }
    case 'gradPool':
      // vector falloff: the door's pool (a trapezoid, a vertical gradient), the sun's glow and the door's bloom
      return (
        <>
          <defs>
            <linearGradient id={`${id}p`} x1="0" y1="1080" x2="0" y2="1122" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={DOOR_C} stopOpacity="0.85" />
              <stop offset="0.25" stopColor={DOOR_C} stopOpacity="0.62" />
              <stop offset="0.5" stopColor={DOOR_C} stopOpacity="0.44" />
              <stop offset="0.75" stopColor={DOOR_C} stopOpacity="0.31" />
              <stop offset="1" stopColor={DOOR_C} stopOpacity="0" />
            </linearGradient>
            <radialGradient id={`${id}s`} cx={SUN[0]} cy={SUN[1]} r={260} gradientUnits="userSpaceOnUse" gradientTransform={`translate(${SUN[0]} ${SUN[1]}) scale(1.8 1) translate(${-SUN[0]} ${-SUN[1]})`}>
              {[0, 0.06, 0.14, 0.26, 0.42, 0.62, 0.82, 1].map((o, k) => (
                <stop key={k} offset={o} stopColor={SUN_C} stopOpacity={0.55 * Math.exp(-4.2 * o)} />
              ))}
            </radialGradient>
            <radialGradient id={`${id}d`} cx={630} cy={965} r={150} gradientUnits="userSpaceOnUse">
              {[0, 0.5, 0.65, 0.8, 1].map((o, k) => (
                <stop key={k} offset={o} stopColor={DOOR_C} stopOpacity={o < 0.5 ? 0.25 : 0.25 * (1 - (o - 0.5) / 0.5)} />
              ))}
            </radialGradient>
          </defs>
          <g style={{mixBlendMode: 'screen'}}>
            <path d="M548 1080L712 1080L748 1122L512 1122Z" fill={`url(#${id}p)`} />
            <ellipse cx={SUN[0]} cy={SUN[1]} rx={470} ry={260} fill={`url(#${id}s)`} />
            <rect x={480} y={815} width={300} height={300} fill={`url(#${id}d)`} />
          </g>
        </>
      );
    case 'bloomLive':
    case 'bloomLiveFull': {
      // a live bloom AT the source: the door's source shape blurred at three sigmas, merged, screened
      const full = kind === 'bloomLiveFull';
      return (
        <>
          <defs>
            <filter id={`${id}f`} filterUnits="userSpaceOnUse" x={full ? 0 : 470} y={full ? 0 : 780} width={full ? 1080 : 320} height={full ? 1920 : 380} colorInterpolationFilters="sRGB">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="b1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="8" result="b2" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b3" />
              <feMerge>
                <feMergeNode in="b1" />
                <feMergeNode in="b2" />
                <feMergeNode in="b3" />
              </feMerge>
            </filter>
          </defs>
          <g style={{mixBlendMode: 'screen'}} opacity={0.35} filter={`url(#${id}f)`}>
            <rect x={548} y={856} width={164} height={222} fill={DOOR_C} />
          </g>
        </>
      );
    }
    case 'rimMask': {
      // lib/light's Rim, two steps: the silhouette minus a copy moved AWAY from the light (a band w * max(0, n.l) wide)
      const step = (w: number, k: number, col: string, op: number) => (
        <g key={k}>
          <defs>
            <mask id={`${id}m${k}`} maskUnits="userSpaceOnUse" {...region}>
              <path d={A.HER} fill="#FFFFFF" transform={herT} />
              <path d={A.HER} fill="#000000" transform={`translate(${(dx - lx * w).toFixed(2)} ${(-ly * w).toFixed(2)})`} />
            </mask>
          </defs>
          <g style={{mixBlendMode: 'screen'}} opacity={op}>
            <rect {...region} fill={col} mask={`url(#${id}m${k})`} />
          </g>
        </g>
      );
      return <>{[step(4.2, 0, SUN_C, 0.9), step(8.4, 1, SUN_C, 0.35)]}</>;
    }
    case 'rimFilter':
      // the same rim as one SVG filter on her shape: the inner band (erode, out), its key side (offset, out), softened
      return (
        <>
          <defs>
            <filter id={`${id}f`} filterUnits="userSpaceOnUse" {...region} colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="erode" radius="4" result="er" />
              <feComposite in="SourceAlpha" in2="er" operator="out" result="band" />
              <feOffset in="SourceAlpha" dx={(-lx * 4).toFixed(2)} dy={(-ly * 4).toFixed(2)} result="sh" />
              <feComposite in="band" in2="sh" operator="out" result="key" />
              <feGaussianBlur in="key" stdDeviation="0.8" result="soft" />
              <feFlood floodColor={SUN_C} result="col" />
              <feComposite in="col" in2="soft" operator="in" />
            </filter>
          </defs>
          <g style={{mixBlendMode: 'screen'}} filter={`url(#${id}f)`}>
            <path d={A.HER} fill="#000" transform={herT} />
          </g>
        </>
      );
    case 'wrap': {
      // light wrap: her inner band (all round) times the door's light, blurred (a baked image), screened
      const [ix, iy, iw, ih] = A.DOORBLUR_BOX as number[];
      return (
        <>
          <defs>
            <filter id={`${id}f`} filterUnits="userSpaceOnUse" {...region} colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="erode" radius="3.6" result="er" />
              <feComposite in="SourceAlpha" in2="er" operator="out" result="band" />
              <feGaussianBlur in="band" stdDeviation="0.7" result="soft" />
              <feImage href={A.DOORBLUR} x={ix} y={iy} width={iw} height={ih} preserveAspectRatio="none" result="img" />
              <feComposite in="img" in2="soft" operator="in" />
            </filter>
          </defs>
          <g style={{mixBlendMode: 'screen'}} filter={`url(#${id}f)`}>
            <path d={A.HER} fill="#000" transform={herT} />
          </g>
        </>
      );
    }
    case 'shadowProj': {
      // her shadow from the door's lamps, projected point by point every frame, in one multiply group
      const pts = HER_PTS.map(([x, y]) => castPt([x + dx, y], LAMP, LAMP_FOOT, FEET));
      const keep = pts.map(([x, y]) => [x, Math.min(Math.max(y, FEET - 1), 1113)] as [number, number]);
      return (
        <g style={{mixBlendMode: 'multiply'}}>
          <path d={ptsD(keep)} fill="#9C8BB8" opacity={0.9} />
        </g>
      );
    }
    case 'shafts':
      // two soft shafts from the sun's image: wedges with a radial falloff, screened
      return (
        <>
          <defs>
            <radialGradient id={`${id}g`} cx={SUN[0]} cy={SUN[1]} r={900} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={SUN_C} stopOpacity="0" />
              <stop offset="0.29" stopColor={SUN_C} stopOpacity="0" />
              <stop offset="0.47" stopColor={SUN_C} stopOpacity="0.16" />
              <stop offset="0.75" stopColor={SUN_C} stopOpacity="0.06" />
              <stop offset="1" stopColor={SUN_C} stopOpacity="0" />
            </radialGradient>
          </defs>
          <g style={{mixBlendMode: 'screen'}}>
            {[
              [47, 1.6],
              [55.5, 2.4],
            ].map(([a, h], k) => {
              const r = 900;
              const p = (deg: number): string => `${(SUN[0] + r * Math.cos((deg * Math.PI) / 180)).toFixed(1)} ${(SUN[1] + r * Math.sin((deg * Math.PI) / 180)).toFixed(1)}`;
              return <path key={k} d={`M${SUN[0]} ${SUN[1]}L${p(a - h)}L${p(a + h)}Z`} fill={`url(#${id}g)`} />;
            })}
          </g>
        </>
      );
    case 'dither':
      // a static dither over the gradients: a 128 px noise tile, soft-light at a low opacity
      return (
        <>
          <defs>
            <filter id={`${id}n`} x="0" y="0" width="128" height="128" filterUnits="userSpaceOnUse">
              <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="7" />
              <feColorMatrix type="saturate" values="0" />
            </filter>
            <pattern id={`${id}p`} width="128" height="128" patternUnits="userSpaceOnUse">
              <rect width="128" height="128" filter={`url(#${id}n)`} />
            </pattern>
          </defs>
          <rect x={0} y={620} width={1080} height={1300} fill={`url(#${id}p)`} opacity={0.035} style={{mixBlendMode: 'soft-light'}} />
        </>
      );
    default:
      return null;
  }
};

const KINDS_ALL = ['mapImg', 'gradPool', 'bloomLive', 'rimMask', 'wrap', 'shadowProj', 'shafts'];

export const LightBench: React.FC<LightBenchProps> = ({kind, n = 1, captions = true}) => {
  const t = useCurrentFrame() / 60;
  const kinds = kind === 'all' ? KINDS_ALL : kind === 'none' || kind === 'svgEmpty' ? [] : [kind];
  return (
    <AbsoluteFill>
      <PaintS1 set="v6" captions={captions} />
      {kind === 'none' ? null : (
        <AbsoluteFill>
          <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
            {kinds.flatMap((k) => Array.from({length: n}, (_, i) => <Layer key={`${k}${i}`} kind={k} i={i} t={t} />))}
          </svg>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
