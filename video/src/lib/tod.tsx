// tod.tsx — TIME OF DAY RELIGHT: one lighting model for the whole kit (core and cine).
//
// Reference 2 does not tint a night scene, it STEPS its light fields down one or two palette steps (style_bible_ref2 4:
// cream sidewalk -> sand, mintPale lawn -> sage, sand walls -> tan; whites, mid and dark tones, ink and the sun stay).
// The table is `todSteps` in theme.ts. Every <Fill> (so every kit component: Person, Crowd, Building, Tree, ...)
// passes its colour through the current <Tod>; the cine kit reads the same context (useTodPal): omit its `tod` prop.
//
// HOW A TIME-OF-DAY KEY ARRIVES (motion spec #12, the measured recolour grammar): the SKY slab wipes down (the World
// draws it), and every OBJECT flips whole, in ONE frame, at the moment the sky's edge reaches its centre (or its
// <TodAnchor>). Objects at different heights therefore flip a frame or two apart: a natural stagger, never a hard
// geometric edge slicing through a figure, and the scene is drawn once (no double render).
//
//   <World sky={[{t: 0, tod: 'day'}, {t: 6.9, tod: 'dusk', wipe: 'down'}, {t: 8.4, tod: 'night', wipe: 'down'}]}>
//     ... every Fill relights when the sky edge passes it ...
//   </World>
//   <Tod role="far"> ...hills, far skyline... </Tod>        // the far row of the table (night: sage -> #4B706B)
//   <Tod value="night"> ... </Tod>                           // a static subtree (no wave)
//   <TodAnchor at={[x, y]}> ...one object... </TodAnchor>    // everything inside flips together (kit components do it)
//   <TodAnchor at={[cx, cy]}><Skyline .../></TodAnchor>      // a raw-SVG cine piece flips when the edge reaches IT
//   useTod([cx, cy])                                         // the same, as a value (only BELOW the World: in a scene
//                                                            // body, above <World>, every hook here returns 'day')
//   relight(palette.cream, 'night')                          // -> palette.sand (pure function)

import React, {createContext, useContext} from 'react';
import {palette, PaletteKey, TodName, TodRole, todSteps, world} from './theme';
import {Mat, useProj, useXf} from './xf';
import {applyH} from './persp';

/** A relight in progress (set by <World> while a sky key with a new `tod` wipes in). `p` = the sky wipe's progress
 *  0..1, `rect` = the sky slab's world rect [x, y, w, h] the edge sweeps, `inv` = screen -> world (inverse of the
 *  World's camera matrix). An object at world point (x, y) flips from `from` to `to` once p reaches its edge position. */
export type TodWave = {from: TodName; to: TodName; p: number; wipe: 'down' | 'up' | 'left' | 'right' | 'snap'; rect: [number, number, number, number]; inv: Mat};

export type TodValue = {
  /** The time of day of this subtree (during a wave: the value at its <TodAnchor>, else at the vanishing point). */
  tod: TodName;
  role: TodRole;
  /** Custom colour map applied after the step table. */
  map?: (c: string) => string;
  /** A relight wave in progress (see TodWave). */
  wave?: TodWave;
  /** SCREEN point that decides this subtree's switch moment (the outermost <TodAnchor>). */
  anchor?: [number, number];
};
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

/** Wipe progress at which the sky edge reaches world point (x, y). */
export function waveEdgeP(w: Pick<TodWave, 'wipe' | 'rect'>, x: number, y: number): number {
  const [rx, ry, rw, rh] = w.rect;
  switch (w.wipe) {
    case 'down':
      return (y - ry) / (rh || 1);
    case 'up':
      return (ry + rh - y) / (rh || 1);
    case 'right':
      return (x - rx) / (rw || 1);
    case 'left':
      return (rx + rw - x) / (rw || 1);
    default:
      return 0;
  }
}

/** Time of day at a SCREEN point under a TodValue (the subtree's anchor wins over the point). Pure. */
export function todAtScreen(v: TodValue, screen?: [number, number]): TodName {
  const w = v.wave;
  if (!w) return v.tod;
  const s = v.anchor ?? screen;
  if (!s) return v.tod;
  const i = w.inv;
  const x = i[0] * s[0] + i[2] * s[1] + i[4];
  const y = i[1] * s[0] + i[3] * s[1] + i[5];
  return w.p >= waveEdgeP(w, x, y) ? w.to : w.from;
}

/** Screen point of a local point (follows XG transforms and <Plane> projections). */
function useScreenPoint(pt?: [number, number]): [number, number] | undefined {
  const m = useXf();
  const proj = useProj();
  if (!pt) return undefined;
  const [x, y] = proj ? applyH(proj.H, pt[0], pt[1]) : pt;
  return [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
}

/** The time of day of this subtree ('day' outside any <Tod> / timed <World>). Pass the piece's own centre (local
 *  coordinates) so a raw-SVG piece flips when the sky edge reaches IT (per-piece switch time); without it the switch
 *  happens at the subtree's <TodAnchor>, else at the vanishing point. */
export function useTod(at?: [number, number]): TodName {
  const v = useContext(TodCtx);
  const s = useScreenPoint(at);
  if (!v.wave) return v.tod;
  return s || v.anchor ? todAtScreen(v, s) : v.tod;
}
export const useTodValue = (): TodValue => useContext(TodCtx);

/** The colour mapper of this subtree at its anchor / the vanishing point (<Fill> resolves its own centre instead). */
export function useRelight(): (c: string) => string {
  const v = useContext(TodCtx);
  if (v.tod === 'day' && !v.map && !v.wave) return idColor;
  const tod = v.anchor ? todAtScreen(v) : v.tod;
  return (c: string) => {
    const r = relight(c, tod, v.role);
    return v.map ? v.map(r) : r;
  };
}
const idColor = (c: string) => c;

/** Colour of a fill whose centre is at `screen` (what <Fill> uses). */
export function relightAt(v: TodValue, color: string, screen?: [number, number]): string {
  const r = relight(color, v.wave ? todAtScreen(v, screen) : v.tod, v.role);
  return v.map ? v.map(r) : r;
}

/** Set the time of day (value) and / or the relight role of a subtree. Children of a timed <World> get the value
 *  (and any relight wave) from the World; use `role` for far hills / skylines ('far'), clouds ('cloud') and foreground
 *  fronds ('framing'). A `value` makes the subtree static (no wave). `wave` is set by <World>. */
export const Tod: React.FC<{value?: TodName; role?: TodRole; map?: (c: string) => string; wave?: TodWave; children?: React.ReactNode}> = ({value, role, map, wave, children}) => {
  const parent = useContext(TodCtx);
  const v: TodValue =
    value !== undefined
      ? {tod: value, role: role ?? parent.role, map: map ?? parent.map, wave}
      : {tod: parent.tod, role: role ?? parent.role, map: map ?? parent.map, wave: wave ?? parent.wave, anchor: wave ? undefined : parent.anchor};
  return <TodCtx.Provider value={v}>{children}</TodCtx.Provider>;
};

/** Everything inside flips TOGETHER during a relight wave, when the sky edge reaches `at` (local coordinates; the
 *  outermost anchor wins). Kit components (Person, Building, Tree, Palm, Car, ...) anchor themselves.
 *  The anchored time of day is also the context's `tod`, so ANY consumer flips at the anchor: core <Fill>, useTod(),
 *  and the cine pieces (useTodPal reads the context): wrap a raw-SVG cine piece / row in <TodAnchor at={its centre}>
 *  (world coordinates of the scene, inside the <World>) and it relights when the sky edge reaches it. */
export const TodAnchor: React.FC<{at: [number, number]; children?: React.ReactNode}> = ({at, children}) => {
  const v = useContext(TodCtx);
  const s = useScreenPoint(at);
  if (!v.wave || v.anchor) return <>{children}</>;
  const anchored: TodValue = {...v, anchor: s};
  return <TodCtx.Provider value={{...anchored, tod: todAtScreen(anchored)}}>{children}</TodCtx.Provider>;
};

/** Default switch point of a wave without an anchor: the vanishing point. */
export const WAVE_DEFAULT_POINT: [number, number] = world.vp;
