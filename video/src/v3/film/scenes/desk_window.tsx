// desk_window (G5b fixer): THE home-base window behind the desk, for the desk shots (S7, S8, S12, S16), so the desk the
// film returns to seven times has ONE back wall: O1 / S13 / S15 face the window, and so do the closer desk shots now
// (G5b review: "the same desk has two back walls"). It is O1's own window (kit NookWindow, O1's layout) with O1's own
// outside (O1_set O1Outside: the far town, the dark data center with its lit sign, the neighbours' fronts, the street
// lamp, walkers, the car, three snow layers) at O1 time >= its end, mapped into the shot by one matrix:
//   S16  the cut-in on S15's tag: O1's window at 1.275x on S15's axis (the whole glass under the caption band; the dark
//        data center right behind the tag, so the flip shows the building that stands behind it).
//   S7 / S12  the desk close (S7's angle): the window at 0.85x right of the pinboard, its sill on the desk's back edge;
//        the glass top lowered to O1 y 745, so the building's roof and sign are cropped by the window head (dim behind
//        the laptop and the bubble, never a second subject).
//   S8   the 3.3x cut-in: only the window's lower edge shows above the lid (the town's lit fronts, the snow, the sill):
//        clipped under the caption band (`clipTop`), with the sash rail drawn along the cut.
// Pieces built from the cut (no `at`): every desk shot opens on a hard cut.
import React, {useId} from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {NoExit, useExit} from '../../../lib/exit';
import {hline} from '../../../lib/sketch';
import {ease, prog, TimeShift} from '../../../lib/time';
import {mat, type Mat, XG} from '../../../lib/xf';
import {EMBER, NOOK_LAYOUT, NookWindow, Plant, W} from '../kit';
import {O1Outside} from './O1_set';

/** O1 room px -> a shot's canvas px: O1's window scaled by k, its glass's left edge (O1 x 180) at x, its inside sill's
 *  bottom (O1 y 1086, the desk's back edge in O1) at deskY. */
export const deskWindowMat = (k: number, x: number, deskY: number): Mat => mat.compose(mat.translate(x, deskY), mat.scale(k), mat.translate(-180, -1086));

/** S7 / S12 (S7's angle): 0.85x, the glass from x 520 (right of S7's pinboard), the sill on the desk's back edge (y 1000). */
export const S7_WINDOW = {m: deskWindowMat(0.85, 520, 1000), glassTop: 745};

export type DeskWindowProps = {
  /** O1 room px -> canvas px (deskWindowMat). */
  m: Mat;
  /** O1 time at the shot's t = 0 (>= O1_END: the building dark, its sign lit; the car and the walkers mid-way). */
  o1At: number;
  /** O1 y of the glass's top edge (default O1's 630): lower = the window seen closer, its top cropped by the head. */
  glassTop?: number;
  /** Canvas y: nothing of the window above this line (S8: the caption band); the sash rail is drawn along it. */
  clipTop?: number;
  /** O1's succulent on the sill (default true). */
  succulent?: boolean;
};

/** The window (wall plane: draw it after the wall dressing behind it and before the desk). */
export const DeskWindow: React.FC<DeskWindowProps> = ({m, o1At, glassTop, clipTop, succulent = true}) => {
  const id = 'dwin' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = NOOK_LAYOUT.pov.glass;
  const layout = glassTop !== undefined ? {glass: {...g, y: glassTop, h: g.y + g.h - glassTop}} : undefined;
  const win = (
    <XG m={m}>
      <TimeShift by={-o1At}>
        <NookWindow variant="pov" layout={layout} seed="o1/nook">
          <O1Outside />
        </NookWindow>
        {succulent ? <Plant x={292} y={1060} kind="succulent" size={40} seed="o1/sillsu" ink={W.far} /> : null}
      </TimeShift>
    </XG>
  );
  if (clipTop === undefined) return win;
  // the window's left edge in canvas px (the reveal), for the sash rail along the cut
  const x0 = m[0] * 144 + m[4];
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={-400} y={clipTop} width={2000} height={3000} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{win}</g>
      {/* the lower sash's top rail along the cut (the trim), so the strip reads as the window's lower edge */}
      <Fill rect={[x0, clipTop, 1600, 14]} color={EMBER.trim} offset={false} />
      <Ink d={hline(x0, x0 + 1600, clipTop, {seed: 'dwin/rail1', over: [0, 0]}) + hline(x0, x0 + 1600, clipTop + 14, {seed: 'dwin/rail2', over: [0, 0]})} width={W.mid} />
    </>
  );
};

/** The loop un-build's ERASE for a big flat picture (the window view, the desk slab and what lies flat on it): fills AND
 *  lines leave together under one falling edge (y0 -> y1 over exit e0 -> e1, ease-in), never a flat rect shrinking to
 *  its centre without its lines (G5b review: the S16 -> O1 seam). Inside, nothing un-builds on its own. */
export const EraseDown: React.FC<{y0: number; y1: number; e0: number; e1: number; children?: React.ReactNode}> = ({y0, y1, e0, e1, children}) => {
  const id = 'erase' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const e = useExit();
  if (e <= 0) return <>{children}</>;
  const k = ease.inQuad(prog(e, e0, e1 - e0));
  if (k >= 1) return null;
  const edge = y0 + (y1 - y0) * k;
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={-400} y={edge} width={2000} height={4000} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <NoExit>{children}</NoExit>
      </g>
    </>
  );
};
