// timeline.tsx — LEGACY (v1, card layout). Main v2 uses lib/Film.tsx (full-bleed). Kept for card-based previews.
// Sequences scenes on the VO timeline inside the polaroid card, runs the
// transitions, renders captions inside the card (so they flip with it) and plays the VO.
//
// Data (src/data/scenes.json):  [{id, start, end, transitionIn?: Transition, transitionOut?: Transition}]
//   start = the CUT time (VO seconds) where this scene takes over. Transitions are placed around the cut c:
//   cut / match : hard switch at c (match = same, but you keep persistent objects in the same place)
//   flip        : NEW CARD. Quick 1.5 deg pre-tilt, the card turns edge-on AT c (outgoing visible before,
//                 incoming after; ~0.62 s before, ~0.45 s after). {tilt?: deg (sign alternates by default)}
//   swipe       : NEW CARD. Outgoing nudges (anticipation), the incoming card slides in over it from the right;
//                 the slide starts at c - 0.15 and takes 0.63 s. {dir?: 'left'|'right'}
//   push        : NEW CARD. Both cards slide over [c - dur/2, c + dur/2]. {dir?}
//   zoom        : same card, art zooms through `focus` (card coords) over [c - dur/2, c + dur/2]. {focus?}
//   crossfade   : same card, incoming art fades in over [c - dur/2, c + dur/2]
//   unbuild     : same card, outgoing scene un-builds (SceneExit 0->1) over [c - dur, c] while the incoming
//                 scene is already rendered UNDERNEATH (its local time is negative then: show its ink-only
//                 state there if you want the reference's "collapse reveals the next drawing" look)
//   sheet       : same card, a white sheet grows from `from` [x,y,w,h] (outgoing) to the full card, and shrinks
//                 to `to` (incoming) — the reference's match-zoom through a notice. {from?, to?}
//   transitionOut (last scene only): {type: 'unbuild', dur} un-builds the final scene before `end` (loop).
// Scenes keep rendering (holding their final state) through any overlap after their own end.
//
//   <Timeline scenes={scenes} components={sceneComponents} captions={captions} />   // Main
//   <Timeline ... only="S03" offset={scene.start} />                                  // one-scene preview

import React from 'react';
import {SceneProvider} from './stage';
import {Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Art, Card, CardXf, flipIn, flipOut, FLIP_POST, FLIP_PRE, Page, pushIn, pushOut, PushDir, sheetRect, swipeIn, swipeOut, SWIPE_SLIDE} from './Card';
import {Captions, CaptionBeat} from './Captions';
import {ExitProvider} from './exit';
import {card, palette, panel, stroke} from './theme';
import {ease as E, lerp, prog, TimeProvider} from './time';
import {rect as sketchRect} from './sketch';

/** v1 CARD transitions (legacy; the film uses Film / FilmTransition, which has no fades).
 *  'crossfade' and 'zoom' animate opacity: @deprecated, never use them in the film. */
export type TransitionType =
  | 'cut'
  | 'match'
  | 'flip'
  | 'swipe'
  | 'push'
  | /** @deprecated animates opacity (a fade) */ 'zoom'
  | /** @deprecated animates opacity (a fade) */ 'crossfade'
  | 'unbuild'
  | 'sheet';
export type Transition = {
  type: TransitionType;
  dur?: number;
  dir?: PushDir;
  focus?: [number, number];
  /** flip: pre-tilt in degrees (default +-1.5, alternating). */
  tilt?: number;
  /** sheet: start rect in the outgoing scene / end rect in the incoming scene ([x, y, w, h] card coords). */
  from?: [number, number, number, number];
  to?: [number, number, number, number];
};
export type SceneDef = {id: string; start: number; end: number; transitionIn?: Transition; transitionOut?: Transition; note?: string};

export const DEFAULT_DUR: Record<TransitionType, number> = {
  cut: 0,
  match: 0,
  flip: FLIP_PRE + FLIP_POST,
  swipe: 0.85,
  push: 0.8,
  zoom: 0.9,
  crossfade: 0.6,
  unbuild: 0.7,
  sheet: 0.46,
};
const dur = (t?: Transition) => (t ? t.dur ?? DEFAULT_DUR[t.type] : 0);
const breaksCard = (t?: Transition) => !!t && (t.type === 'flip' || t.type === 'push' || t.type === 'swipe');
const SHEET_DEFAULT: [number, number, number, number] = [panel.x + panel.w / 2 - 70, panel.y + panel.h / 2 - 90, 140, 180];

// ---------------------------------------------------------------- scene context

export {useScene} from './stage';
export type {SceneInfo} from './stage';

/** Renders one scene component with its local time, exit value and art transform. */
export const SceneLayer: React.FC<{scene: SceneDef; Comp: React.FC; exit?: number; zoom?: {s: number; x: number; y: number}; opacity?: number}> = ({scene, Comp, exit = 0, zoom, opacity = 1}) => (
  <TimeProvider offset={scene.start}>
    <SceneProvider value={{id: scene.id, start: scene.start, end: scene.end, dur: scene.end - scene.start}}>
      <ExitProvider value={exit}>
        <Art zoom={zoom} opacity={opacity}>
          <Comp />
        </Art>
      </ExitProvider>
    </SceneProvider>
  </TimeProvider>
);

/** Fallback for ids without a component. */
export const MissingScene: React.FC<{id?: string}> = ({id}) => (
  <text x={480} y={600} textAnchor="middle" fontSize={48} fill={palette.ink} fontFamily="sans-serif">
    missing scene {id}
  </text>
);

const SheetOverlay: React.FC<{r: [number, number, number, number]; outline: boolean}> = ({r, outline}) => (
  <svg width={card.w} height={card.h} viewBox={`0 0 ${card.w} ${card.h}`} style={{position: 'absolute', left: 0, top: 0}}>
    <rect x={r[0]} y={r[1]} width={r[2]} height={r[3]} fill={palette.white} />
    {outline ? <path d={sketchRect(r[0], r[1], r[2], r[3], {seed: 'sheet', over: 'small', breaks: false})} fill="none" stroke={palette.ink} strokeWidth={stroke.inkThin} strokeLinecap="round" /> : null}
  </svg>
);

// ---------------------------------------------------------------- timeline

type Seg = {first: number; last: number};

export type TimelineProps = {
  scenes: SceneDef[];
  components: Record<string, React.FC>;
  captions: CaptionBeat[];
  /** Timeline seconds at frame 0 (scene previews pass scene.start). */
  offset?: number;
  /** Render only this scene id: static card, captions of its range, own un-build kept. */
  only?: string;
  /** Play public/vo.mp3 aligned to the timeline. Default true. */
  audio?: boolean;
};

export const Timeline: React.FC<TimelineProps> = ({scenes: scenesIn, components, captions, offset = 0, only, audio = true}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = frame / fps + offset;
  const scenes = scenesIn.slice().sort((a, b) => a.start - b.start);
  const comp = (id: string): React.FC => components[id] ?? (() => <MissingScene id={id} />);

  const segs: Seg[] = [];
  scenes.forEach((s, i) => {
    if (i === 0 || breaksCard(s.transitionIn)) segs.push({first: i, last: i});
    else segs[segs.length - 1].last = i;
  });

  const exitFor = (i: number): number => {
    const next = scenes[i + 1];
    if (next && next.transitionIn?.type === 'unbuild') return prog(T, next.start - dur(next.transitionIn), dur(next.transitionIn), E.inOutSine);
    const out = scenes[i].transitionOut;
    if (!next && out?.type === 'unbuild') return prog(T, scenes[i].end - dur(out), dur(out), E.inOutSine);
    return 0;
  };

  const cards: React.ReactNode[] = [];
  segs.forEach((g, gi) => {
    const first = scenes[g.first];
    const nextSeg = segs[gi + 1];
    const nextFirst = nextSeg ? scenes[nextSeg.first] : undefined;
    if (only && !scenes.slice(g.first, g.last + 1).some((s) => s.id === only)) return;

    const inT = gi > 0 ? first.transitionIn : undefined;
    const outT = nextFirst?.transitionIn;
    const cIn = first.start;
    const cOut = nextFirst?.start ?? Infinity;
    const kIn = inT ? dur(inT) / DEFAULT_DUR[inT.type] || 1 : 1;
    const kOut = outT ? dur(outT) / DEFAULT_DUR[outT.type] || 1 : 1;
    const tiltIn = inT?.tilt ?? (gi % 2 ? 1.5 : -1.5);
    const tiltOut = outT?.tilt ?? ((gi + 1) % 2 ? 1.5 : -1.5);
    const vStart = only || !inT ? -Infinity : inT.type === 'flip' ? cIn : inT.type === 'swipe' ? cIn - 0.15 * kIn : cIn - dur(inT) / 2;
    const vEnd = only || !outT ? Infinity : outT.type === 'flip' ? cOut : outT.type === 'swipe' ? cOut - 0.15 * kOut + SWIPE_SLIDE * kOut : cOut + dur(outT) / 2;
    if (T < vStart || T >= vEnd) return;

    let xf: CardXf = {};
    if (!only) {
      if (outT?.type === 'flip' && T >= cOut - FLIP_PRE * kOut) xf = flipOut((T - cOut) / kOut, tiltOut);
      else if (outT?.type === 'push' && T >= cOut - dur(outT) / 2) xf = pushOut(prog(T, cOut - dur(outT) / 2, dur(outT)), outT.dir);
      else if (outT?.type === 'swipe' && T >= cOut - (0.15 + 0.2) * kOut) xf = swipeOut((T - (cOut - 0.15 * kOut)) / kOut, outT.dir);
      else if (inT?.type === 'flip' && T < cIn + 1.5) xf = flipIn((T - cIn) / kIn, tiltIn);
      else if (inT?.type === 'push' && T < cIn + dur(inT) / 2) xf = pushIn(prog(T, cIn - dur(inT) / 2, dur(inT)), inT.dir);
      else if (inT?.type === 'swipe' && T < cIn + 1) xf = swipeIn((T - (cIn - 0.15 * kIn)) / kIn, inT.dir);
    }

    const layers: React.ReactNode[] = [];
    let sheet: React.ReactNode = null;
    for (let i = g.first; i <= g.last; i++) {
      const s = scenes[i];
      if (only && s.id !== only) continue;
      const next = i < g.last ? scenes[i + 1] : undefined;
      const tIn = i > g.first ? s.transitionIn : undefined;
      const tNext = next?.transitionIn;
      let sStart = -Infinity;
      if (!only && tIn) {
        if (tIn.type === 'crossfade' || tIn.type === 'zoom') sStart = s.start - dur(tIn) / 2;
        else if (tIn.type === 'unbuild') sStart = s.start - dur(tIn);
        else sStart = s.start;
      }
      let sEnd = Infinity;
      if (!only && next) sEnd = tNext && (tNext.type === 'crossfade' || tNext.type === 'zoom') ? next.start + dur(tNext) / 2 : next.start;
      if (T < sStart || T >= sEnd) continue;
      let opacity = 1;
      let zoom: {s: number; x: number; y: number} | undefined;
      if (!only) {
        if (tIn?.type === 'crossfade') opacity = prog(T, s.start - dur(tIn) / 2, dur(tIn), E.inOutSine);
        if (tIn?.type === 'zoom') {
          const d = dur(tIn);
          const [fx, fy] = tIn.focus ?? [panel.x + panel.w / 2, panel.y + panel.h / 2];
          zoom = {s: lerp(0.62, 1, prog(T, s.start - d * 0.2, d * 0.7, E.outCubic)), x: fx, y: fy};
          opacity = prog(T, s.start - d * 0.2, d * 0.35, E.inOutSine);
        }
        if (tNext?.type === 'zoom') {
          const d = dur(tNext);
          const [fx, fy] = tNext.focus ?? [panel.x + panel.w / 2, panel.y + panel.h / 2];
          zoom = {s: lerp(1, 3.2, prog(T, next!.start - d / 2, d * 0.7, E.inCubic)), x: fx, y: fy};
          opacity *= 1 - prog(T, next!.start - d * 0.05, d * 0.25, E.inOutSine);
        }
        if (tIn?.type === 'sheet') {
          const r = sheetRect((T - s.start) / (dur(tIn) / DEFAULT_DUR.sheet), tIn.from ?? SHEET_DEFAULT, tIn.to ?? SHEET_DEFAULT);
          if (r) sheet = <SheetOverlay key="sheet" r={r} outline={T > s.start + 0.05} />;
        }
        if (tNext?.type === 'sheet') {
          const r = sheetRect((T - next!.start) / (dur(tNext) / DEFAULT_DUR.sheet), tNext.from ?? SHEET_DEFAULT, tNext.to ?? SHEET_DEFAULT);
          if (r) sheet = <SheetOverlay key="sheet" r={r} outline={false} />;
        }
      }
      const layer = <SceneLayer key={s.id + i} scene={s} Comp={comp(s.id)} exit={exitFor(i)} zoom={zoom} opacity={opacity} />;
      // an un-building scene is drawn ABOVE the incoming one (which waits underneath)
      if (!only && tIn?.type === 'unbuild' && T < s.start) layers.unshift(layer);
      else layers.push(layer);
    }

    const onlyIdx = only ? scenes.findIndex((s) => s.id === only) : -1;
    const range: [number, number] = only
      ? [scenes[onlyIdx].start - 0.25, (scenes[onlyIdx + 1]?.start ?? Infinity) - 0.25]
      : [gi === 0 ? -Infinity : cIn - 0.25, nextFirst ? cOut - 0.25 : Infinity];

    cards.push(
      <Card key={`card${gi}`} xf={xf}>
        {layers}
        {sheet}
        <Captions beats={captions} range={range} />
      </Card>,
    );
  });

  return (
    <TimeProvider global={T} offset={0}>
      <Page>{cards}</Page>
      {audio ? <Audio src={staticFile('vo.mp3')} trimBefore={offset > 0 ? Math.round(offset * fps) : undefined} /> : null}
    </TimeProvider>
  );
};

/** Total timeline length in seconds (last scene end). */
export const timelineDuration = (scenes: SceneDef[]) => Math.max(...scenes.map((s) => s.end));

// ---------------------------------------------------------------- Stage (dev / standalone compositions)

/** Page + card + art + captions for standalone compositions (KitDemo, sheets). Time = frame/fps. */
export const Stage: React.FC<{
  children?: React.ReactNode;
  captions?: CaptionBeat[];
  /** Un-build everything over [at, at+dur]. */
  unbuild?: {at: number; dur?: number};
  xf?: CardXf;
}> = ({children, captions, unbuild, xf}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const T = frame / fps;
  const exit = unbuild ? prog(T, unbuild.at, unbuild.dur ?? DEFAULT_DUR.unbuild, E.inOutSine) : 0;
  return (
    <TimeProvider global={T} offset={0}>
      <Page>
        <Card xf={xf}>
          <ExitProvider value={exit}>
            <Art>{children}</Art>
          </ExitProvider>
          {captions ? <Captions beats={captions} /> : null}
        </Card>
      </Page>
    </TimeProvider>
  );
};
