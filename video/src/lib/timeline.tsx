// timeline.tsx — scene framework. Sequences scenes on the VO timeline inside the polaroid card, runs the
// transitions, renders captions inside the card (so they flip with it) and plays the VO.
//
// Data (src/data/scenes.json):  [{id, start, end, transitionIn?: {type, dur?, dir?, focus?}, transitionOut?}]
//   start = the CUT time (VO seconds) where this scene takes over. Transitions are placed around the cut:
//   cut / match  : hard switch at start (match = same, but you keep persistent objects in place)
//   flip         : card pre-tilts and flips edge-on AT start (outgoing visible before, incoming after)
//   push         : cards slide over [start - dur/2, start + dur/2] (dir: left|right|up|down)
//   zoom         : art zooms through `focus` (card coords) over [start - dur/2, start + dur/2], same card
//   crossfade    : same card, incoming art fades in over [start - dur/2, start + dur/2]
//   unbuild      : outgoing scene un-builds (SceneExit 0->1) over [start - dur, start], then incoming builds
//   transitionOut (last scene only): {type: 'unbuild', dur} un-builds the final scene before `end` (loop).
// Scenes keep rendering (holding their final state) through any overlap after their own end.
//
//   <Timeline scenes={scenes} components={sceneComponents} captions={captions} />   // Main
//   <Timeline ... only="S03" offset={scene.start} />                                  // one-scene preview

import React, {createContext, useContext} from 'react';
import {Audio, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {Art, Card, CardXf, flipIn, flipOut, Page, pushIn, pushOut, PushDir} from './Card';
import {Captions, CaptionBeat} from './Captions';
import {ExitProvider} from './exit';
import {panel} from './theme';
import {ease as E, lerp, prog, TimeProvider} from './time';

export type TransitionType = 'cut' | 'match' | 'flip' | 'push' | 'zoom' | 'crossfade' | 'unbuild';
export type Transition = {type: TransitionType; dur?: number; dir?: PushDir; focus?: [number, number]};
export type SceneDef = {id: string; start: number; end: number; transitionIn?: Transition; transitionOut?: Transition; note?: string};

export const DEFAULT_DUR: Record<TransitionType, number> = {cut: 0, match: 0, flip: 1.1, push: 0.8, zoom: 0.9, crossfade: 0.6, unbuild: 1.3};
const dur = (t?: Transition) => (t ? t.dur ?? DEFAULT_DUR[t.type] : 0);
const breaksCard = (t?: Transition) => !!t && (t.type === 'flip' || t.type === 'push');

// ---------------------------------------------------------------- scene context

export type SceneInfo = {id: string; start: number; end: number; dur: number};
const SceneCtx = createContext<SceneInfo>({id: 'none', start: 0, end: 0, dur: 0});
/** Info about the scene being rendered (id, start, end, dur in seconds). */
export const useScene = () => useContext(SceneCtx);

/** Renders one scene component with its local time, exit value and art transform. */
export const SceneLayer: React.FC<{scene: SceneDef; Comp: React.FC; exit?: number; zoom?: {s: number; x: number; y: number}; opacity?: number}> = ({
  scene,
  Comp,
  exit = 0,
  zoom,
  opacity = 1,
}) => (
  <TimeProvider offset={scene.start}>
    <SceneCtx.Provider value={{id: scene.id, start: scene.start, end: scene.end, dur: scene.end - scene.start}}>
      <ExitProvider value={exit}>
        <Art zoom={zoom} opacity={opacity}>
          <Comp />
        </Art>
      </ExitProvider>
    </SceneCtx.Provider>
  </TimeProvider>
);

/** Fallback for ids without a component. */
export const MissingScene: React.FC<{id?: string}> = ({id}) => (
  <text x={480} y={600} textAnchor="middle" fontSize={48} fill="#302013" fontFamily="sans-serif">
    missing scene {id}
  </text>
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

  // segments = runs of scenes sharing one physical card
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
    const vStart = only || !inT ? -Infinity : inT.type === 'flip' ? cIn : cIn - dur(inT) / 2;
    const vEnd = only || !outT ? Infinity : outT.type === 'flip' ? cOut : cOut + dur(outT) / 2;
    if (T < vStart || T >= vEnd) return;

    let xf: CardXf = {};
    if (!only) {
      if (outT?.type === 'flip' && T >= cOut - dur(outT) * 0.7) xf = flipOut(prog(T, cOut - dur(outT) * 0.7, dur(outT) * 0.7));
      else if (outT?.type === 'push' && T >= cOut - dur(outT) / 2) xf = pushOut(prog(T, cOut - dur(outT) / 2, dur(outT)), outT.dir);
      else if (inT?.type === 'flip' && T < cIn + 1.2) xf = flipIn(T - cIn);
      else if (inT?.type === 'push' && T < cIn + dur(inT) / 2) xf = pushIn(prog(T, cIn - dur(inT) / 2, dur(inT)), inT.dir);
    }

    const layers: React.ReactNode[] = [];
    for (let i = g.first; i <= g.last; i++) {
      const s = scenes[i];
      if (only && s.id !== only) continue;
      const next = i < g.last ? scenes[i + 1] : undefined;
      const tIn = i > g.first ? s.transitionIn : undefined;
      const tNext = next?.transitionIn;
      const sStart = only || !tIn ? -Infinity : tIn.type === 'crossfade' || tIn.type === 'zoom' ? s.start - dur(tIn) / 2 : s.start;
      const sEnd = only || !next ? Infinity : tNext && (tNext.type === 'crossfade' || tNext.type === 'zoom') ? next.start + dur(tNext) / 2 : next.start;
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
      }
      layers.push(<SceneLayer key={s.id + i} scene={s} Comp={comp(s.id)} exit={exitFor(i)} zoom={zoom} opacity={opacity} />);
    }

    const range: [number, number] = only
      ? [scenes.find((s) => s.id === only)!.start - 0.25, (scenes[scenes.findIndex((s) => s.id === only) + 1]?.start ?? Infinity) - 0.25]
      : [gi === 0 ? -Infinity : cIn - 0.25, nextFirst ? cOut - 0.25 : Infinity];

    cards.push(
      <Card key={`card${gi}`} xf={xf}>
        {layers}
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
  const exit = unbuild ? prog(T, unbuild.at, unbuild.dur ?? 1.3, E.inOutSine) : 0;
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
