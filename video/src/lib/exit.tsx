// exit.tsx — "un-build" support. A SceneExit value (0..1) flows down the tree; every <Ink> and <Fill>
// reads it and dismantles itself automatically: fills drain/collapse first (exit 0 -> ~0.6), then
// lines retract (exit ~0.35 -> 1). Each element gets a small seeded offset so the un-build ripples.
//
//   Main sets it for 'unbuild' transitions. Inside a scene you can un-build any group locally:
//   <UnBuild at={6.2} dur={1.2}> ...old props... </UnBuild>
//   <NoExit> <Cat/> </NoExit>                    // persistent objects survive the un-build
//   <ExitProvider value={0.5}> ... </ExitProvider> // drive it yourself

import React, {createContext, useContext} from 'react';
import {clamp, ease, prog, useTime} from './time';

const ExitCtx = createContext(0);

/** Current exit progress 0..1 (0 = fully built). */
export const useExit = () => useContext(ExitCtx);

/** Provide an exit value; combines with the parent's (max). */
export const ExitProvider: React.FC<{value: number; children: React.ReactNode}> = ({value, children}) => {
  const parent = useContext(ExitCtx);
  return <ExitCtx.Provider value={Math.max(parent, clamp(value))}>{children}</ExitCtx.Provider>;
};

/** Un-build children over [at, at+dur] (scene seconds). */
export const UnBuild: React.FC<{at: number; dur?: number; children: React.ReactNode}> = ({at, dur = 1.2, children}) => {
  const t = useTime();
  return <ExitProvider value={prog(t, at, dur, ease.inOutSine)}>{children}</ExitProvider>;
};

/** Children ignore any exit from above. */
export const NoExit: React.FC<{children: React.ReactNode}> = ({children}) => <ExitCtx.Provider value={0}>{children}</ExitCtx.Provider>;

/** Fill drain progress for exit value e. jitter in 0..1 (seeded per element). */
export const exitFillProgress = (e: number, jitter = 0) => (e <= 0 ? 0 : prog(e, 0.02 + jitter * 0.18, 0.42, ease.inOutCubic));

/** Ink retract progress for exit value e. */
export const exitInkProgress = (e: number, jitter = 0) => (e <= 0 ? 0 : prog(e, 0.36 + jitter * 0.22, 0.42, ease.inOutCubic));

/** Fades raw SVG children (circles, text...) out together with the fills during an un-build. */
export const ExitFade: React.FC<{children?: React.ReactNode; jitter?: number}> = ({children, jitter = 0.5}) => {
  const e = useExit();
  const o = 1 - exitFillProgress(e, jitter);
  if (o <= 0.001) return null;
  return o < 1 ? <g opacity={o}>{children}</g> : <>{children}</>;
};
