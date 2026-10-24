// edges/EdgeTreatment.tsx — reference 1's hand-made frame edge, applied in SCREEN SPACE around any full-bleed scene
// (a World, a CineFrame, Film's whole scene stack). The scene is rendered twice:
//   1. the INK LAYER (underneath, full frame): the same scene under <Look fills="paper"> (every Fill white, people as
//      white tombstones, cine pieces in their own paper state) on paper, with every remaining coloured fill painted
//      paper too (the sky, raw-SVG pieces that ignore the Look such as the cine banners and sun halos) EXCEPT the
//      actors' colours (the sun disc, the mascot): the drawing as line art, with the actors breaking the edge in colour
//      like reference 1's sun and cat. Optionally clipped to the variant's ink contour, so lines END in the white.
//   2. the COLOUR LAYER on top, cut by the variant's hand-cut contour. The clip is applied ONCE to the composited
//      layer (clip-path on a parent of a composited child): a plain clip-path anti-aliases every shape inside it
//      separately, which leaves a 1 px darker seam where the two layers show the same colour (an actor crossing the
//      cut). See docs/EDGES.md 4.
// Fills therefore stop dead at the contour while every line keeps going into the paper margin (style bible 4: "fills
// clipped hard to the panel, ink runs past it into the white card"). Hand-drawn overlay strokes go above both.
// Everything is fixed to the SCREEN (the camera moves the world under it) and a pure function of (variant, seed,
// amount): it never moves or flickers. Captions are not part of it: render them after (above) the treatment.
//
//   <EdgeTreatment variant="trim" seed="film" amount={1}> <MyScene/> </EdgeTreatment>
//   <EdgeTreatment variant="paint-medium" seed="scene-04"> ... </EdgeTreatment>   // white paper, colour painted on top
//   <EdgeTreatment variant="paint-loose" seed="scene-04" hints={EDGE_HINTS['scene-04']}> ... </EdgeTreatment>
//   variant 'clean' (or amount 0) renders the children untouched (no second render).
// 'paint' / 'paint-subtle' / 'paint-medium' / 'paint-loose' (edges/paint.ts): the colour clip and the ink clip are
// UNIONS of flat blocks (several same-wound subpaths, nonzero), so the colour edge steps, bites and runs off like
// colour laid on by hand; nothing else differs here.

import React, {useId, useMemo} from 'react';
import {Look} from '../exit';
import {Ink} from '../Ink';
import {palette, skies, todSky, world} from '../theme';
import {TOD, TODS} from '../cine/atmosphere';
import {MASCOT} from '../mascot/colors';
import type {Seed} from '../rng';
import type {Pt} from '../sketch';
import {edgeSpec, EdgeVariant, EdgeOpts} from './variants';
import type {EdgeHints} from './shared';

/** A faintly warm paper for night / dark scenes (pure white is the brightest thing in a night frame). */
export const PAPER_WARM = '#FAF6EE';

export type EdgeTreatmentProps = {
  /** Default 'clean' (no treatment). */
  variant?: EdgeVariant;
  /** Shape seed (default 'edge'): change it for a differently cut edge. */
  seed?: Seed;
  /** 0 = none, 1 = the designed amount, up to ~1.4 (margins, snips, overshoots and stroke reach scale with it).
   *  'paint': the LOOSENESS (0.6 subtle, 1 medium, 1.6 loose); a 'paint-*' preset multiplies its own looseness. */
  amount?: number;
  /** Screen vanishing point for perspective guides (construction). Default world.vp. */
  vp?: Pt;
  /** Margin paper: 'white' (default, reference 1's card), 'warm' (PAPER_WARM, for night scenes) or any colour. */
  paper?: 'white' | 'warm' | string;
  /** What keeps its colour in the margin:
   *  'actors' (default): only the actors (the sun disc, the mascot, plus `actorFills`); everything else is line art.
   *  'strict': nothing (pure line art; the mascot becomes a white outline).
   *  'look': whatever ignores <Look> keeps its colour (v1 behaviour: banners, sun halos and other raw-SVG fills too). */
  margin?: 'actors' | 'strict' | 'look';
  /** Extra fill colours that keep their colour in the margin (margin 'actors'). */
  actorFills?: string[];
  /** Extra flat sky values to paint paper in the margin (margin 'look' only: the other modes catch every fill). */
  skyFills?: string[];
  /** What the scene under the edge holds ('paint' only; edges/hints.ts): line-art density per region (a corner is
   *  left bare only where there is drawing) and keep rects (a hero, the mascot, a lamp: never cut by a colour edge). */
  hints?: EdgeHints;
  /** Draw the colour contour (magenta) and the ink contour (cyan) as hairlines (tuning). */
  debug?: boolean;
  children?: React.ReactNode;
};

const FULL: React.CSSProperties = {position: 'absolute', left: 0, top: 0, width: world.w, height: world.h, overflow: 'hidden'};

const up = (c: string) => c.toUpperCase();
const uniq = (a: string[]) => Array.from(new Set(a.map(up)));

/** Every flat sky value (core skies, time-of-day skies, the cine TOD sky bands, the legacy panel sky): in the ink
 *  layer these become paper, so the margin is a white card and not a coloured sky with lines on it. */
export const SKY_FILLS: string[] = uniq([...Object.values(skies), ...Object.values(todSky), palette.sky, palette.bg, ...TODS.flatMap((n) => TOD[n].skyBands)]);

/** The actors that break the edge in colour (margin 'actors'): the sun disc (core Sun + every cine TOD sun) and the
 *  mascot's own body + shade (its inner ears / cheeks are peach, shared with banners and placards, so they go paper). */
export const ACTOR_FILLS: string[] = uniq([palette.sun, ...TODS.map((n) => TOD[n].sunColor), MASCOT.body, MASCOT.shade]);

export const paperColor = (p: EdgeTreatmentProps['paper']) => (p === undefined || p === 'white' ? palette.white : p === 'warm' ? PAPER_WARM : p);

function inkCss(cls: string, paper: string, margin: 'actors' | 'strict' | 'look', actors: string[], extraSky: string[]): string {
  const sel = (s: string) => `.${cls} ${s}`;
  const rules = [
    // background colours of scene roots (CineFrame bg, bridges): transparent, the layer's own paper shows
    `${sel('div')}{background:transparent !important}`,
  ];
  if (margin === 'look') {
    // only the sky slab(s) -> paper (they are <Look>-exempt by design); other raw-SVG fills keep their colour
    const sky = uniq([...SKY_FILLS, ...extraSky]);
    rules.push(`${sky.map((c) => sel(`[fill="${c}" i]`)).join(',')}{fill:${paper} !important}`);
  } else {
    // every fill attribute that is not ink, none or an actor colour -> paper
    const keep = ['none', palette.ink, ...(margin === 'actors' ? actors : [])].map((c) => `:not([fill="${c}" i])`).join('');
    rules.push(`${sel(`[fill]${keep}`)}{fill:${paper} !important}`);
  }
  if (up(paper) !== up(palette.white)) rules.push(`${sel('[fill="#FFFFFF" i]')},${sel('[fill="white" i]')}{fill:${paper} !important}`);
  return rules.join('\n');
}

export const EdgeTreatment: React.FC<EdgeTreatmentProps> = ({variant = 'clean', seed = 'edge', amount = 1, vp, paper: paperIn, margin = 'actors', actorFills, skyFills, hints, debug, children}) => {
  const uid = 'edge' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const paper = paperColor(paperIn);
  const hintKey = hints ? JSON.stringify(hints) : '';
  const opts: EdgeOpts = useMemo(() => ({vp, hints}), [vp?.[0], vp?.[1], hintKey]);
  const spec = edgeSpec(variant, seed, amount, opts);
  const actors = useMemo(() => uniq([...ACTOR_FILLS, ...(actorFills ?? [])]), [actorFills?.join(',')]);
  const css = useMemo(() => inkCss(uid, paper, margin, actors, skyFills ?? []), [uid, paper, margin, actors, skyFills?.join(',')]);
  if (!spec.colour && !spec.strokes.length && !debug) return <>{children}</>;
  return (
    <div style={FULL}>
      {spec.colour ? (
        <div style={{...FULL, background: paper}}>
          <div className={uid} style={{...FULL, clipPath: spec.ink ? `path('${spec.ink}')` : undefined}}>
            <style>{css}</style>
            <Look fills="paper">{children}</Look>
          </div>
        </div>
      ) : null}
      {spec.colour ? (
        // clip-path on the parent, a composited child: the clip is applied once to the finished layer (no seam)
        <div style={{...FULL, clipPath: `path('${spec.colour}')`}}>
          <div style={{...FULL, willChange: 'transform'}}>{children}</div>
        </div>
      ) : (
        children
      )}
      {spec.strokes.length || debug ? (
        <svg width={world.w} height={world.h} viewBox={`0 0 ${world.w} ${world.h}`} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
          {spec.strokes.map((s, i) => (
            <Ink key={i} d={s.d} width={s.w} taper={s.taper ?? true} exit={false} seed={`${String(seed)}/${variant}/${i}`} />
          ))}
          {debug && spec.colour ? <path d={spec.colour} fill="none" stroke="#FF00FF" strokeWidth={1.5} /> : null}
          {debug && spec.ink ? <path d={spec.ink} fill="none" stroke="#00C8FF" strokeWidth={1.5} /> : null}
        </svg>
      ) : null}
    </div>
  );
};
