// BoardPanel (engine lane): the v2 G5 board placeholder. Draws one LOCKED G3 board panel (public/v2/animatic.json)
// with SketchReel's ShotView at board time = panel start + scene-local time, so Film2 plays the locked board inside the
// Film engine until a lane replaces the panel file (docs/G5_BLOCKING.md). Board notation stays out: red pencil marks
// (none on the v2 board) are dropped; the notes strip, the captions and the credit slot belong to SketchReel, not
// ShotView (Film2 draws the credits itself). Negative local time = the board's own pre-roll (O1's t < 0 lines are
// mid-draw: the loop underlay). An un-build (Film's exit value) collapses the panel downward like the house slab (the
// same falling edge Film's caption tone follows), revealing what waits underneath. Copied from src/v3/film/BoardPanel.tsx.
import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import animatic from '../../../public/v2/animatic.json';
import {ShotView, type Animatic, type Shot} from '../../v3/SketchReel';
import {useTime, ease as E} from '../../lib/time';
import {exitFillProgress, useExit} from '../../lib/exit';

const BOARD = animatic as unknown as Animatic;

/** The board panel with id `id`, its red notation marks never appearing (kept in place, so every other element keeps
 *  its index: the same seeds and moves as the board). */
export function boardShot(id: string): Shot | undefined {
  const s = BOARD.shots.find((x) => x.id === id);
  return s ? {...s, els: s.els.map((el) => (el.t === 'mark' ? {...el, in: 1e9} : el))} : undefined;
}

export const BoardPanel: React.FC<{id: string}> = ({id}) => {
  const t = useTime();
  const exit = useExit();
  const shot = useMemo(() => boardShot(id), [id]);
  if (!shot) return null;
  // the slab edge: Film's toneRegionsAt uses the same curve for the caption tone across an un-build
  const k = exit > 0 ? E.inCubic(exitFillProgress(exit, 0, 1)) : 0;
  const top = -60 + 2040 * k;
  return (
    <AbsoluteFill style={k > 0 ? {clipPath: `inset(${Math.max(0, top).toFixed(1)}px 0px 0px 0px)`} : undefined}>
      <ShotView shot={shot} t={shot.s + t} />
    </AbsoluteFill>
  );
};
