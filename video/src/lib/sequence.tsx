// sequence.tsx — helpers for SEQUENCES: a scenes.json row that spans several script lines in one place and owns its
// camera end to end, joined to its neighbours by seams or engine transitions (docs/G5_BLOCKING.md §2b "The sequence
// contract"). OPT-IN: nothing here runs unless a film imports it (v1 / v2 / v2r never do), and Film.tsx is unchanged by
// it apart from the optional, behaviour-free `seam` / `carrier` fields on a transition.
//
//   useFilmTime()          film seconds of the scene being rendered. Shared pieces that two builders both draw across a
//                          join (a set, its camera, the thread plane) key on THIS, never on useTime(), so both compute
//                          the identical frame at a seam. In a normal layer it is the timeline time itself (bit-exact
//                          in both builders); in the loop underlay (the first scene drawn at t < 0 under the last one's
//                          un-build) it is start + t < 0: the frame-0 drawing state.
//   <PanelWindows panels>  plays OLD panels inside a sequence, each in its own window of film time ([its start, the next
//                          panel's start); the first one also before, the last one also after), on its own time base
//                          and SceneInfo exactly as <Film> gave it as a scene: a film restructured from panels into
//                          sequences plays end to end, frame for frame as before, until a lane builds the sequence.
//   panelTones(start, ps)  those panels' caption tone keys as ONE list of sequence-local keys (a placeholder exports it
//                          as its `captionTone`, so the captions read on the old panels as before).
//   filmSeams / seamProbeFrames / <FilmSeamProbe>
//                          the SEAM PROBE. A seam is `{"type": "matchcut", "seam": true, "carrier": X}`: Film hard-cuts
//                          at frame f = ceil(c * fps) between two builders that must draw the IDENTICAL picture there.
//                          Frame k of a probe composition draws ONE side of one seam alone (<Film only>, no captions,
//                          no audio, at the film's exact frame time), 4 frames per seam in scenes order:
//                            4j + 0: the outgoing scene at f - 1 (the film's own frame)   4j + 1: the incoming one at f - 1
//                            4j + 2: the outgoing scene at f                              4j + 3: the incoming one at f (the film's own frame)
//                          scripts/qa/gate_check.py --seam-comp <probe comp> renders it and compares the pairs
//                          (FAIL when more than 1 % of the pixels differ by more than 4 L*).

import React from 'react';
import {Sequence, useCurrentFrame, useVideoConfig} from 'remotion';
import {Film, type FilmProps, type FilmScene, type ToneKey} from './Film';
import {SceneProvider, type SceneInfo, type SceneTransitionIn, useScene} from './stage';
import {TimeProvider, useGlobalTime, useTime} from './time';

// ---------------------------------------------------------------- film time

/** The time offset of the current layer that is NOT the scene's own start: 0 in a normal layer (Film's
 *  TimeProvider offset = scene.start), seam - start in the loop underlay, `by` inside a TimeShift. */
function layerShift(): number {
  const s = useScene();
  const g = useGlobalTime();
  const t = useTime();
  return g - t - s.start;
}

/** Film seconds of the scene being rendered (see the header). Bit-exact timeline time in a normal layer; start + t in
 *  the loop underlay (negative: the frame-0 drawing state) and inside a TimeShift (shifted with it). */
export function useFilmTime(): number {
  const s = useScene();
  const g = useGlobalTime();
  const t = useTime();
  return Math.abs(g - t - s.start) < 1e-6 ? g : s.start + t;
}

// ---------------------------------------------------------------- old panels inside a sequence (placeholders)

export type PanelSpec = {
  /** The old panel's id (its SceneInfo id). */
  id: string;
  /** Its window on the film timeline (VO seconds): the old scenes.json row. */
  start: number;
  end: number;
  /** The old panel module's default export (a React.FC with no props, drawn in panel-local time). */
  C: React.FC;
  /** The film's FIRST panel (Film gave it no incoming transition). Default false: it came in on a plain cut. */
  first?: boolean;
  /** Its caption tone keys (panel-local t), for panelTones. */
  tone?: ToneKey[];
};

/** The SceneInfo.transitionIn <Film> gives a scene that comes in on a plain cut (Film.tsx transitionInfo). */
const CUT_IN: SceneTransitionIn = {type: 'cut', dur: 0, dir: undefined, settle: 0, zoomDir: 0};

/** Which panel's window holds sequence-local time t (seqStart: the sequence's start). Compared as t >= start - seqStart:
 *  both sides are exact differences of nearby doubles, so the switch lands on the same frame as Film's own T >= start. */
export function panelAt(panels: PanelSpec[], seqStart: number, t: number): number {
  let k = 0;
  for (let i = 1; i < panels.length; i++) if (t >= panels[i].start - seqStart) k = i;
  return k;
}

/** Plays old panels inside a sequence (see the header): the panel whose window holds the current time, on its own
 *  time base (useTime() = film time - its start, bit-exact) and SceneInfo, with the sequence's stage camera, clip,
 *  transition and exit passing through (a transition at the sequence's join applies to the panel on screen). */
export const PanelWindows: React.FC<{panels: PanelSpec[]}> = ({panels}) => {
  const seq = useScene();
  const t = useTime();
  const shift = layerShift();
  if (!panels.length) return null;
  const p = panels[panelAt(panels, seq.start, t)];
  const offset = Math.abs(shift) < 1e-6 ? p.start : p.start + shift;
  const info: SceneInfo = {id: p.id, start: p.start, end: p.end, dur: p.end - p.start, transitionIn: p.first ? undefined : CUT_IN};
  const C = p.C;
  return (
    <TimeProvider offset={offset}>
      <SceneProvider value={info}>
        <C />
      </SceneProvider>
    </TimeProvider>
  );
};

/** The panels' caption tone keys as one list of sequence-local keys: each panel's first key snaps in at its start (a
 *  scene change never wiped), its later keys keep their own t, wipe and dur. A panel without keys reads 'dark' (Film's
 *  default). */
export function panelTones(seqStart: number, panels: Pick<PanelSpec, 'start' | 'tone'>[]): ToneKey[] {
  const out: ToneKey[] = [];
  panels.forEach((p, i) => {
    const keys: ToneKey[] = p.tone?.length ? p.tone : [{t: 0, tone: 'dark'}];
    const at = i === 0 ? 0 : p.start - seqStart;
    keys.forEach((k, j) => out.push(j === 0 ? {t: at, tone: k.tone} : {...k, t: at + k.t}));
  });
  return out;
}

// ---------------------------------------------------------------- the seam probe

export type FilmSeam = {
  /** The outgoing and the incoming scene ids. */
  out: string;
  in: string;
  /** The join (the incoming scene's start, VO seconds) and the first frame of the incoming scene, ceil(t * fps). */
  t: number;
  frame: number;
  carrier?: string;
};

/** The film's seams in scenes order: every scene whose transitionIn is a matchcut with `seam: true`. */
export function filmSeams(scenes: FilmScene[], fps: number): FilmSeam[] {
  const sc = scenes.slice().sort((a, b) => a.start - b.start);
  const out: FilmSeam[] = [];
  for (let i = 1; i < sc.length; i++) {
    const tr = sc[i].transitionIn;
    if (tr?.type === 'matchcut' && tr.seam) out.push({out: sc[i - 1].id, in: sc[i].id, t: sc[i].start, frame: Math.ceil(sc[i].start * fps - 1e-6), carrier: tr.carrier});
  }
  return out;
}

export type SeamProbeFrame = {seam: number; side: 'out' | 'in'; id: string; frame: number};

/** The probe composition's frames (4 per seam, see the header). Its length is max(1, this.length). */
export function seamProbeFrames(scenes: FilmScene[], fps: number): SeamProbeFrame[] {
  return filmSeams(scenes, fps).flatMap((s, j): SeamProbeFrame[] => [
    {seam: j, side: 'out', id: s.out, frame: s.frame - 1},
    {seam: j, side: 'in', id: s.in, frame: s.frame - 1},
    {seam: j, side: 'out', id: s.out, frame: s.frame},
    {seam: j, side: 'in', id: s.in, frame: s.frame},
  ]);
}

export type FilmSeamProbeProps = Pick<FilmProps, 'scenes' | 'components' | 'wipers' | 'edges'>;

/** The seam probe composition's component (register it with durationInFrames = max(1, seamProbeFrames(...).length)):
 *  frame k draws seamProbeFrames(...)[k] — one scene alone at the film's exact frame time, no captions, no label, no
 *  audio. The film frame is reached with a <Sequence from={k - frame}> (integer frames, so Film's T = frame / fps is
 *  the same double as in the film; a <Freeze> would clamp it to the probe's own 4-per-seam length). */
export const FilmSeamProbe: React.FC<FilmSeamProbeProps> = ({scenes, components, wipers, edges}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = seamProbeFrames(scenes, fps)[frame];
  if (!p) return null;
  return (
    <Sequence from={frame - p.frame} layout="none">
      <Film scenes={scenes} components={components} wipers={wipers} edges={edges} captions={[]} only={p.id} audio={false} showCaptions={false} />
    </Sequence>
  );
};
