// V2S8 (lane L6): the un-build order. The engine's un-build hands every part one exit e (0..1, 38.82-39.08);
// `LateExit` re-times it for the things that must leave LAST (TREATMENT section 4: "the ghosts and her window last"),
// so they hold while the rest dismantles and go in the final ~45 % of the un-build. `EarlyExit` for the busy life that
// should clear first (walkers, smoke, string lights). No opacity anywhere: Ink / Fill read the re-timed value.
import React from 'react';
import {ExitProvider, NoExit, useExit} from '../../lib/exit';
import {clamp} from '../../lib/time';

/** e -> the late window [from, 1]. */
export const lateExit = (e: number, from = 0.55) => clamp((e - from) / (1 - from));
/** e -> the early window [0, to]. */
export const earlyExit = (e: number, to = 0.6) => clamp(e / to);

export const LateExit: React.FC<{from?: number; children?: React.ReactNode}> = ({from = 0.55, children}) => {
  const e = useExit();
  return (
    <NoExit>
      <ExitProvider value={lateExit(e, from)}>{children}</ExitProvider>
    </NoExit>
  );
};

export const EarlyExit: React.FC<{to?: number; children?: React.ReactNode}> = ({to = 0.6, children}) => {
  const e = useExit();
  return (
    <NoExit>
      <ExitProvider value={earlyExit(e, to)}>{children}</ExitProvider>
    </NoExit>
  );
};
