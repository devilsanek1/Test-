// edges/EdgeTreatment.tsx — reference 1's hand-made frame edge, applied in SCREEN SPACE around any full-bleed scene
// (a World, a CineFrame, Film's whole scene stack). The scene is rendered twice:
//   1. the INK LAYER (underneath, full frame): the same scene under <Look fills="paper"> (every Fill white, people as
//      white tombstones, cine pieces in their own paper state) on paper, and the sky made paper too: the drawing as
//      line art. Pieces that ignore <Look> (the core Sun, the mascot, other raw-SVG actors) keep their colour there
//      by default, like reference 1's sun and cat breaking the panel (`margin="strict"` paints them paper too).
//   2. the COLOUR LAYER on top, clipped to the variant's hand-cut contour (CSS clip-path: a hard, flat edge).
// Fills therefore stop dead at the contour while every line keeps going into the paper margin (style bible 4: "fills
// clipped hard to the panel, ink runs past it into the white card"). Hand-drawn overlay strokes go above both.
// Everything is fixed to the SCREEN (the camera moves the world under it) and a pure function of (variant, seed,
// amount): it never moves or flickers. Captions are not part of it: render them after (above) the treatment.
//
//   <EdgeTreatment variant="panel" seed="film" amount={1}> <MyScene/> </EdgeTreatment>
//   variant 'clean' (or amount 0) renders the children untouched (no second render).

import React, {useId, useMemo} from 'react';
import {Look} from '../exit';
import {Ink} from '../Ink';
import {palette, skies, todSky, world} from '../theme';
import {TOD, TODS} from '../cine/atmosphere';
import type {Seed} from '../rng';
import type {Pt} from '../sketch';
import {edgeSpec, EdgeVariant, EdgeOpts} from './variants';

export type EdgeTreatmentProps = {
  /** Default 'clean' (no treatment). */
  variant?: EdgeVariant;
  /** Shape seed (default 'edge'): change it for a differently cut edge. */
  seed?: Seed;
  /** 0 = none, 1 = the designed amount, up to ~1.6 (insets, pull-ins, overshoots and stroke reach scale with it). */
  amount?: number;
  /** Screen vanishing point for perspective guides (construction). Default world.vp. */
  vp?: Pt;
  /** Margin paper colour. Default palette.white (reference 1's card). */
  paper?: string;
  /** 'actors' (default): raw-SVG pieces that ignore <Look> keep their colour in the margin (they break the edge like
   *  reference 1's sun and cat). 'strict': every fill in the margin is paper (pure line art). */
  margin?: 'actors' | 'strict';
  /** Extra flat sky values to paint paper in the margin (a scene whose sky is not a theme / TOD token). */
  skyFills?: string[];
  /** Draw the colour contour as a magenta hairline (tuning). */
  debug?: boolean;
  children?: React.ReactNode;
};

const FULL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: world.w, height: world.h, overflow: 'hidden'};

/** Every flat sky value (core skies, time-of-day skies, the cine TOD sky bands, the legacy panel sky): in the ink
 *  layer these become paper, so the margin is a white card and not a coloured sky with lines on it. */
export const SKY_FILLS: string[] = Array.from(
  new Set([...Object.values(skies), ...Object.values(todSky), palette.sky, palette.bg, ...TODS.flatMap((n) => TOD[n].skyBands)].map((c) => c.toUpperCase())),
);

function inkCss(cls: string, paper: string, strict: boolean, extra: string[] = []): string {
  const sel = (s: string) => `.${cls} ${s}`;
  const skies = [...SKY_FILLS, ...extra.map((c) => c.toUpperCase())];
  const rules = [
    // the sky slab(s) -> paper (they are <Look>-exempt by design)
    `${skies.map((c) => sel(`[fill="${c}" i]`)).join(',')}{fill:${paper} !important}`,
    // background colours of scene roots (CineFrame bg etc.)
    `${sel('div')}{background:transparent !important}`,
  ];
  if (strict) rules.push(`${sel('[fill]:not([fill="none"]):not([fill="' + palette.ink + '" i])')}{fill:${paper} !important}`);
  if (paper.toUpperCase() !== palette.white) rules.push(`${sel('[fill="#FFFFFF" i]')},${sel('[fill="white" i]')}{fill:${paper} !important}`);
  return rules.join('\n');
}

export const EdgeTreatment: React.FC<EdgeTreatmentProps> = ({variant = 'clean', seed = 'edge', amount = 1, vp, paper = palette.white, margin = 'actors', skyFills, debug, children}) => {
  const uid = 'edge' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const opts: EdgeOpts = useMemo(() => ({vp}), [vp?.[0], vp?.[1]]);
  const spec = edgeSpec(variant, seed, amount, opts);
  const css = useMemo(() => inkCss(uid, paper, margin === 'strict', skyFills), [uid, paper, margin, skyFills?.join(',')]);
  if (!spec.colour && !spec.strokes.length && !debug) return <>{children}</>;
  return (
    <div style={FULL}>
      {spec.colour ? (
        <div className={uid} style={{...FULL, background: paper}}>
          <style>{css}</style>
          <Look fills="paper">{children}</Look>
        </div>
      ) : null}
      <div style={{...FULL, clipPath: spec.colour ? `path('${spec.colour}')` : undefined}}>{children}</div>
      {spec.strokes.length || debug ? (
        <svg width={world.w} height={world.h} viewBox={`0 0 ${world.w} ${world.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {spec.strokes.map((s, i) => (
            <Ink key={i} d={s.d} width={s.w} taper={s.taper ?? true} exit={false} seed={`${String(seed)}/${variant}/${i}`} />
          ))}
          {debug && spec.colour ? <path d={spec.colour} fill="none" stroke="#FF00FF" strokeWidth={1.5} /> : null}
        </svg>
      ) : null}
    </div>
  );
};
