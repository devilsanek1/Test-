// stage.tsx — contexts shared by the sequencer (Film / Timeline) and the scene roots (World / Card).
//
//   useScene()      -> {id, start, end, dur}          the scene being rendered (seconds on the VO timeline)
//   useStageCam()   -> {ox, oy, zoom, rot, ink?}      the TRANSITION camera Film applies to this scene right now
//                                                     (rest = {0, 0, 1, 0}). <World> applies it flat by default;
//                                                     a scene camera can take it over with <World stage="context">.
//   useStageKind()  -> 'world' | 'card'               which layout the primitives are inside (Sun defaults etc.)
//   useTransition() -> {phase, p, type} | null         whether this scene is entering/leaving through a transition
//
//   useWorldStage() -> 'flat' | 'context' | null      the enclosing <World>'s stage mode (null outside a World).
//                                                     A FLAT World applies (consumes) the transition camera: inside it
//                                                     useStageCam() is REST, so <CineCamera stage> can never apply it
//                                                     twice. A 'context' World passes it through untouched.
//
// The stage camera uses the same model as the cine camera (src/lib/cine/camera.tsx) with depth 0:
//   screen = C + R(rot) * zoom * (p - C - o),  C = frame centre (540, 960), o = (ox, oy)

import React, {createContext, useContext} from 'react';
import {world} from './theme';
import {MOTION} from './spec';
import {mat, Mat} from './xf';

// ---------------------------------------------------------------- scene info

/** The scene's incoming transition as far as cameras need it (Film fills it in). `settle` = scene-local time at which
 *  the incoming camera leg has come to rest; `zoomDir` = which way that leg zooms (1 = in, -1 = pulling back, 0 = no
 *  zoom). Both are optional (older callers): pushStart derives them from type / dir / dur. */
export type SceneTransitionIn = {type: string; dur: number; dir?: string; settle?: number; zoomDir?: number};
export type SceneInfo = {id: string; start: number; end: number; dur: number; transitionIn?: SceneTransitionIn};
const SceneCtx = createContext<SceneInfo>({id: 'none', start: 0, end: 0, dur: 0});
/** Info about the scene being rendered (id, start, end, dur in seconds). */
export const useScene = () => useContext(SceneCtx);
export const SceneProvider = SceneCtx.Provider;

// ---------------------------------------------------------------- stage camera (transitions)

/** `ink` (optional): the stroke-width factor of a transition flagged with `inkComp` (Film sets it; lib/inkComp.tsx).
 *  A flat <World> applies it with the camera (as an <InkScale>); <CineCamera stage> folds it into its Layers. */
export type StageCam = {ox: number; oy: number; zoom: number; rot: number; ink?: number};
export const STAGE_REST: StageCam = {ox: 0, oy: 0, zoom: 1, rot: 0};
const StageCamCtx = createContext<StageCam>(STAGE_REST);
/** The transition camera for the current scene (rest outside transitions). */
export const useStageCam = () => useContext(StageCamCtx);
export const StageCamProvider = StageCamCtx.Provider;

const C: [number, number] = [world.w / 2, world.h / 2];

/** Matrix (world -> screen) of a stage camera. */
export function stageMat(c: StageCam): Mat {
  if (c.zoom === 1 && !c.ox && !c.oy && !c.rot) return mat.I;
  return mat.compose(mat.translate(C[0], C[1]), c.rot ? mat.rotate(c.rot) : mat.I, mat.scale(c.zoom), mat.translate(-C[0] - c.ox, -C[1] - c.oy));
}

/** Stage camera that zooms by `zoom` about world point `focus`, placing it at screen point `to` (default: where it is). */
export function zoomAbout(focus: [number, number], zoom: number, to: [number, number] = focus): StageCam {
  return {ox: focus[0] - C[0] - (to[0] - C[0]) / zoom, oy: focus[1] - C[1] - (to[1] - C[1]) / zoom, zoom, rot: 0};
}

/** Zoom direction of the scene's incoming camera leg: 1 = zooming in (camera-continuous 'in'), -1 = pulling back
 *  (camera-continuous 'out', and every push-through: the incoming scene pulls back out of its point), 0 = none. */
export function incomingZoomDir(scene?: SceneInfo): number {
  const tr = scene?.transitionIn;
  if (!tr) return 0;
  if (tr.zoomDir !== undefined) return tr.zoomDir;
  if (tr.type === 'push-through') return -1;
  if (tr.type !== 'camera-continuous') return 0;
  const dir = tr.dir ?? 'in';
  return dir === 'in' ? 1 : dir === 'out' ? -1 : 0;
}

/** The default per-shot push target when the scene does not give `to`: reference 2's gentle push-in (MOTION.camera.push,
 *  1.06), EXCEPT after an incoming pull-back (push-through, camera-continuous 'out'), where it is the matching gentle
 *  pull-out (1 / 1.06): the pull-back lands INTO a slow continuing pull-back, one velocity-continuous move (no stop and
 *  reverse into a push-in a beat after the cut). An explicit `to` is always kept (see pushStart). */
export function pushTo(to: number | undefined, scene?: SceneInfo): number {
  if (to !== undefined) return to;
  return incomingZoomDir(scene) < 0 ? 1 / MOTION.camera.push.to : MOTION.camera.push.to;
}

/** When a per-shot push (World `push` / ShotCam `push`, zoom `to`) may start: a push that would REVERSE the incoming
 *  leg's zoom (camera-continuous 'out' or a push-through + a push IN, camera-continuous 'in' + a push OUT) waits until
 *  that leg has settled (`settle`, else the transition's dur), so the camera never bounces; a push in the same
 *  direction (or after any other transition) starts at `at` and blends with the leg's deceleration. */
export function pushStart(at: number, to: number, scene?: SceneInfo): number {
  const tr = scene?.transitionIn;
  const leg = incomingZoomDir(scene);
  const dir = to > 1 ? 1 : to < 1 ? -1 : 0;
  if (!tr || leg * dir >= 0) return at;
  return Math.max(at, tr.settle ?? tr.dur);
}

/** Visible world rectangle [x, y, w, h] for a stage camera (to size backgrounds). */
export function visibleRect(c: StageCam, pad = 40): [number, number, number, number] {
  return visibleRectOf(stageMat(c), pad);
}

/** Visible world rectangle [x, y, w, h] for any world -> screen matrix (always covers at least the frame). */
export function visibleRectOf(m: Mat, pad = 40): [number, number, number, number] {
  const inv = mat.inv(m);
  const pts = [
    [0, 0],
    [world.w, 0],
    [0, world.h],
    [world.w, world.h],
  ].map(([x, y]) => [inv[0] * x + inv[2] * y + inv[4], inv[1] * x + inv[3] * y + inv[5]]);
  const xs = pts.map((p) => p[0]);
  const ys = pts.map((p) => p[1]);
  const x0 = Math.min(0, ...xs) - pad;
  const y0 = Math.min(0, ...ys) - pad;
  const x1 = Math.max(world.w, ...xs) + pad;
  const y1 = Math.max(world.h, ...ys) + pad;
  return [x0, y0, x1 - x0, y1 - y0];
}

/** The world -> screen matrix a <World> has already applied (transition camera + push). <ScreenSpace> inverts it. */
const AppliedCtx = createContext<Mat>(mat.I);
export const useAppliedStageMat = () => useContext(AppliedCtx);
export const AppliedStageProvider = AppliedCtx.Provider;

export type WorldStage = 'flat' | 'context';
const WorldStageCtx = createContext<WorldStage | null>(null);
/** The enclosing <World>'s stage mode, or null outside a World. */
export const useWorldStage = () => useContext(WorldStageCtx);
export const WorldStageProvider = WorldStageCtx.Provider;

// ---------------------------------------------------------------- layout kind

export type StageKind = 'world' | 'card';
const KindCtx = createContext<StageKind>('card');
export const useStageKind = () => useContext(KindCtx);
export const StageKindProvider = KindCtx.Provider;

// ---------------------------------------------------------------- transition info + screen clip (wipes)

export type TransitionInfo = {type: string; phase: 'in' | 'out'; /** 0..1 through the transition window */ p: number};
const TransCtx = createContext<TransitionInfo | null>(null);
/** Non-null while this scene is entering ('in') or leaving ('out') through a transition. */
export const useTransition = () => useContext(TransCtx);
export const TransitionProvider = TransCtx.Provider;

/** CSS clip-path (screen space) applied to the whole scene by Film (foreground wipes). */
const ClipCtx = createContext<string | undefined>(undefined);
export const useStageClip = () => useContext(ClipCtx);
export const StageClipProvider = ClipCtx.Provider;

export const StageContexts: React.FC<{scene: SceneInfo; cam?: StageCam; clip?: string; transition?: TransitionInfo | null; children?: React.ReactNode}> = ({scene, cam = STAGE_REST, clip, transition = null, children}) => (
  <SceneCtx.Provider value={scene}>
    <StageCamCtx.Provider value={cam}>
      <ClipCtx.Provider value={clip}>
        <TransCtx.Provider value={transition}>{children}</TransCtx.Provider>
      </ClipCtx.Provider>
    </StageCamCtx.Provider>
  </SceneCtx.Provider>
);
