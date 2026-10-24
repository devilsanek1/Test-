// exit.tsx — "un-build" support. A SceneExit value e (0..1) flows down the tree; every <Ink> and <Fill> reads it and
// dismantles itself with the measured recipe (docs/motion_spec.md T6, MOTION.unbuild), all ease-in, NO fades:
//   1. e 0.00-0.20  lines go LOOSE: every stroke extends past its corners (+~25%) and skews a hair
//   2. e 0.10-0.65  fills SHRINK to their centres (small first, seeded order)
//   3. e 0.36-0.70  ink RETRACTS (strokes undraw)
//   4. e 0.60-0.92  the big background SLAB (sky, a wall: any fill covering >= 55% of the frame) COLLAPSES DOWNWARD
// The default un-build lasts MOTION.unbuild.total (0.5 s); the phases scale with the duration you give it.
//
//   Main sets it for 'unbuild' transitions. Inside a scene you can un-build any group locally:
//   <UnBuild at={6.2}> ...old props... </UnBuild>          // 0.5 s
//   <NoExit> <Elephant .../> </NoExit>                    // persistent objects survive the un-build
//   <ExitShrink x={fx} y={fy}> <Elephant .../> </ExitShrink>  // raw-SVG characters shrink to their feet (no fade)
//   <ExitProvider value={0.5}> ... </ExitProvider>        // drive it yourself
//   <ExitSync seed="p1"> ...one figure... </ExitSync>      // one window: its ink retracts WITH its fills (Person does it)
// The slab: every slab fill of a World (the sky, a bleed ground, a wall >= 55% of the frame) collapses under ONE shared
// falling edge (the World sky's), never as separate slabs with their own top edges (World provides <SlabEdge>).

import React, {createContext, useContext} from 'react';
import {clamp, ease, prog, useTime} from './time';
import {MOTION} from './spec';
import {Mat, mat, XG} from './xf';
import {rand, Seed} from './rng';

const ExitCtx = createContext(0);

/** Current exit progress 0..1 (0 = fully built). */
export const useExit = () => useContext(ExitCtx);

/** Provide an exit value; combines with the parent's (max). */
export const ExitProvider: React.FC<{value: number; children: React.ReactNode}> = ({value, children}) => {
  const parent = useContext(ExitCtx);
  return <ExitCtx.Provider value={Math.max(parent, clamp(value))}>{children}</ExitCtx.Provider>;
};

/** Un-build children over [at, at+dur] (scene seconds). Default dur = MOTION.unbuild.total (0.5 s). */
export const UnBuild: React.FC<{at: number; dur?: number; children: React.ReactNode}> = ({at, dur = MOTION.unbuild.total, children}) => {
  const t = useTime();
  return <ExitProvider value={prog(t, at, dur)}>{children}</ExitProvider>;
};

/** Children ignore any exit from above. */
export const NoExit: React.FC<{children: React.ReactNode}> = ({children}) => <ExitCtx.Provider value={0}>{children}</ExitCtx.Provider>;

/** Fills at or above this size (sqrt of area share of the frame) are the background SLAB: they collapse last. */
export const SLAB_SIZE = 0.74;

/** Fill un-build progress (LINEAR 0..1; apply an ease-in) for exit value e. jitter 0..1 (seeded per element);
 *  size 0..1 = sqrt(area / frame area). Small fills shrink first, the slab collapses last. */
export const exitFillProgress = (e: number, jitter = 0, size = 0) => {
  if (e <= 0) return 0;
  if (size >= SLAB_SIZE) return prog(e, 0.6, 0.32);
  return prog(e, 0.1 + jitter * 0.1 + Math.min(1, size) * 0.12, 0.36);
};

/** Ink retract progress (LINEAR 0..1) for exit value e. */
export const exitInkProgress = (e: number, jitter = 0) => (e <= 0 ? 0 : prog(e, 0.36 + jitter * 0.08, 0.26));

/** Ink retract progress (LINEAR 0..1) inside an <ExitSync> group: the group's FILL window (small fills' start, the
 *  same 0.36 duration), so the outline undraws while its own fills shrink and is gone with them. */
export const exitInkSyncProgress = (e: number, jitter = 0) => (e <= 0 ? 0 : prog(e, 0.1 + jitter * 0.1, 0.36));

// ---------------------------------------------------------------- ExitSync: one un-build window per figure

type ExitSyncV = {jitter: number} | null;
const ExitSyncCtx = createContext<ExitSyncV>(null);
/** The enclosing <ExitSync> group ({jitter}) or null. Fill and Ink read it. */
export const useExitSync = () => useContext(ExitSyncCtx);

/** One un-build window for a group (a figure): every <Fill> inside uses the group's jitter instead of its own seeded
 *  one, and every <Ink> retracts WITH those fills (exitInkSyncProgress) instead of after them. For things whose
 *  outlines overlap other things (a crowd): while a front figure shrinks, the figures behind it are either still whole
 *  (fills + outline) or already gone, never bare outlines tangled together (the "hairball"). Person wraps itself in
 *  it (seeded per person, so a crowd still leaves staggered). `jitter` 0..1 or a `seed`. */
export const ExitSync: React.FC<{jitter?: number; seed?: Seed; children?: React.ReactNode}> = ({jitter, seed, children}) => (
  <ExitSyncCtx.Provider value={{jitter: jitter ?? rand(seed ?? 'exitsync', 'exitsync')}}>{children}</ExitSyncCtx.Provider>
);

// ---------------------------------------------------------------- the slab's shared edge

/** The World's slab: its sky rect [x, y, w, h] in WORLD coordinates and the world -> screen matrix. Slab fills clip to
 *  the same falling edge as the sky (top edge at y + h * k), so sky, ground and walls collapse as ONE slab. */
export type SlabV = {rect: [number, number, number, number]; m: Mat} | null;
const SlabCtx = createContext<SlabV>(null);
export const useSlab = () => useContext(SlabCtx);
export const SlabEdge = SlabCtx.Provider;

/** How loose the lines are (0..1): ramps up at the start of an un-build and holds until the ink retracts. */
export const exitLoose = (e: number) => (e <= 0 ? 0 : prog(e, 0, 0.2, ease.outCubic));

/** Raw SVG children (circles, text...) leave with the fills: they shrink about (x, y) if given, else pop out
 *  (1 frame) halfway through their drain. Never an opacity fade. */
export const ExitFade: React.FC<{children?: React.ReactNode; jitter?: number; x?: number; y?: number}> = ({children, jitter = 0.5, x, y}) => {
  const e = useExit();
  const d = exitFillProgress(e, jitter);
  if (d <= 0) return <>{children}</>;
  if (x === undefined || y === undefined) return d >= 0.5 ? null : <>{children}</>;
  const k = 1 - ease.inCubic(d);
  if (k <= 0.001) return null;
  return <XG m={mat.about(mat.scale(k), x, y)}>{children}</XG>;
};

/** Alias of ExitFade (the name is historical: nothing fades). */
export const ExitPop = ExitFade;

/** Un-build for raw-SVG CHARACTERS (the mascot): the whole group shrinks to its FEET anchor (x, y) with the fills'
 *  ease-in window (~0.18 s of a 0.5 s un-build), like a reversed pop. Never an opacity ramp: use this instead of
 *  driving the Elephant's `draw` (whose fills ramp opacity).
 *    <ExitShrink x={556} y={1660}> <ElephantTimeline x={556} y={1660} ... /> </ExitShrink> */
export const ExitShrink: React.FC<{x: number; y: number; jitter?: number; children?: React.ReactNode}> = ({x, y, jitter = 0.5, children}) => (
  <ExitFade x={x} y={y} jitter={jitter}>
    {children}
  </ExitFade>
);

// ---------------------------------------------------------------- Look: ink-only / fills-only / paper states

export type LookV = {
  /** false = no linework at all (the "fills only" state). */
  ink: boolean;
  /** 'color' (normal) | 'paper' (every fill white: the ink-only / loop frame look) | 'none' (no fills). */
  fills: 'color' | 'paper' | 'none';
  /** Paper until a radiating wave reaches the fill's centre: colour floods out from `origin` at `speed` px/s from `at`
   *  (the reference's opening fill cascade: ~2-3 regions per frame from the vanishing point). */
  cascade?: {at: number; origin: [number, number]; speed?: number};
};
const LookCtx = createContext<LookV>({ink: true, fills: 'color'});
export const useLook = () => useContext(LookCtx);

/** Render states the style bible requires (section 3): <Look fills="paper"> = ink on white fills (frame 0 / loop),
 *  <Look ink={false}> = flat fills only, <Look cascade={{at: 0.03, origin: [540, 880]}}> = paper, then colour
 *  floods out from the vanishing point. The sky (<World sky>) keeps its colour. */
export const Look: React.FC<Partial<LookV> & {children?: React.ReactNode}> = ({ink, fills, cascade, children}) => {
  const parent = useContext(LookCtx);
  const v: LookV = {ink: ink ?? parent.ink, fills: fills ?? parent.fills, cascade: cascade ?? parent.cascade};
  return <LookCtx.Provider value={v}>{children}</LookCtx.Provider>;
};
