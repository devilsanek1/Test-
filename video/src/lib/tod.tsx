// tod.tsx — TIME OF DAY RELIGHT: one lighting model for the whole kit (core and cine).
//
// Reference 2 does not tint a night scene, it STEPS its light fields down one or two palette steps (style_bible_ref2 4:
// cream sidewalk -> sand, mintPale lawn -> sage, sand walls -> tan; whites, mid and dark tones, ink and the sun stay).
// The table is `todSteps` in theme.ts. Every <Fill> (so every kit component: Person, Crowd, Building, Tree, ...)
// passes its colour through the current <Tod>; raw SVG in the cine kit takes `tod={useTod()}`.
//
//   <World sky={[{t: 0, tod: 'day'}, {t: 6.9, tod: 'dusk', wipe: 'down'}, {t: 8.4, tod: 'night', wipe: 'down'}]}>
//     ... everything relights WITH the sky wipe (same moment, same down-wipe edge, no fade) ...
//   </World>
//   <Tod role="far"> ...hills, far skyline... </Tod>        // the far row of the table (night: sage -> #4B706B)
//   <Tod value="night"> ... </Tod>                           // a static subtree (World does this for you)
//   const tod = useTod();  <Skyline tod={tod} ... />         // feed cine components, so they relight in sync
//   relight(palette.cream, 'night')                          // -> palette.sand (pure function)

import React, {createContext, useContext} from 'react';
import {palette, PaletteKey, TodName, TodRole, todSteps} from './theme';

export type TodValue = {tod: TodName; role: TodRole; /** Custom colour map applied after the step table. */ map?: (c: string) => string};
const TodCtx = createContext<TodValue>({tod: 'day', role: 'base'});

const TABLES = new Map<string, Map<string, string>>();
function table(tod: TodName, role: TodRole): Map<string, string> {
  const key = `${tod}/${role}`;
  let m = TABLES.get(key);
  if (m) return m;
  m = new Map();
  const rows = todSteps[tod] ?? {};
  const add = (row: Partial<Record<PaletteKey, string>> | undefined) => {
    if (!row) return;
    for (const k of Object.keys(row) as PaletteKey[]) m!.set(palette[k].toUpperCase(), row[k]!);
  };
  add(rows.base);
  if (role !== 'base') add(rows[role]);
  TABLES.set(key, m);
  return m;
}

/** A colour under a time of day (pure; mapped once, never chained). Unknown colours pass through. */
export function relight(color: string, tod: TodName, role: TodRole = 'base'): string {
  if (tod === 'day' || !color || color[0] !== '#') return color;
  return table(tod, role).get(color.toUpperCase()) ?? color;
}

/** The time of day of this subtree ('day' outside any <Tod> / timed <World>). */
export const useTod = (): TodName => useContext(TodCtx).tod;
export const useTodValue = (): TodValue => useContext(TodCtx);

/** The colour mapper of this subtree (what <Fill> uses). */
export function useRelight(): (c: string) => string {
  const v = useContext(TodCtx);
  if (v.tod === 'day' && !v.map) return idColor;
  return (c: string) => {
    const r = relight(c, v.tod, v.role);
    return v.map ? v.map(r) : r;
  };
}
const idColor = (c: string) => c;

/** Set the time of day (value) and / or the relight role of a subtree. Children of a timed <World> get the value
 *  from the World; use `role` for far hills / skylines ('far'), clouds ('cloud') and foreground fronds ('framing'). */
export const Tod: React.FC<{value?: TodName; role?: TodRole; map?: (c: string) => string; children?: React.ReactNode}> = ({value, role, map, children}) => {
  const parent = useContext(TodCtx);
  return <TodCtx.Provider value={{tod: value ?? parent.tod, role: role ?? parent.role, map: map ?? parent.map}}>{children}</TodCtx.Provider>;
};
