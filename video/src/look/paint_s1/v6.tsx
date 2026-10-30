// Painter v6's scene side (iteration, 2026-10-30; paint_test/NOTES.md "v6"): set 'v6' turns on (1) the look test's
// `darks` switch (real darks in many small pieces outside the caption band: CRAFT §f.8, DIRECTION rule 6) and (2) the
// refined her from src/lib/figure in her place at the door (the people recipe's next steps: V2S1_row.tsx S1HerV6).
// The film's sun disc goes quiet wherever the painted sky draws CRAFT §g.2's own (its manifest row `hides: ['sun']`).
import React, {createContext, useContext} from 'react';
import {usePaintOn, usePiece} from '../../lib/paint';
import {tintFamily, type LightRig} from '../../lib/light';
import {TINT_CANAL} from '../../v2r/world/rigs';

const V6Ctx = createContext(false);
export const V6Provider: React.FC<{on: boolean; children?: React.ReactNode}> = ({on, children}) => <V6Ctx.Provider value={on}>{children}</V6Ctx.Provider>;
/** True inside set 'v6': the refined her. */
export const useV6 = () => useContext(V6Ctx);

/** True where a painted piece in the active set draws `thing` itself (the sky recipe's disc: 'sun'). */
export function usePaintHides(pieceName: string, thing: string): boolean {
  const piece = usePiece(pieceName) as (ReturnType<typeof usePiece> & {hides?: string[]}) | undefined;
  const on = usePaintOn(pieceName);
  return on && !!piece?.hides?.includes(thing);
}

/** (v6, the phone-size fix) the rig's shadow family turned to the dusk's lilac-plum and a step deeper, so every near
 *  thing's cast and contact shadow is one of the real darks in many small pieces (CRAFT §f.8), cool on the warm ground
 *  (v5's duskRig family, deeper: cast 0.44, contact 0.62); the water keeps its own step. */
export const v6Rig = (rig: LightRig): LightRig => ({
  ...rig,
  tints: {...tintFamily('#86719F', {form: 0.24, cast: 0.44, contact: 0.62}, '#FFFFFF'), water: TINT_CANAL.water} as LightRig['tints'],
});
