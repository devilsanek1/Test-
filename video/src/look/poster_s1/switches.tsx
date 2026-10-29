// The city-poster look test (docs/studies/2026-10-28_city_posters/STUDY.md §10; notes test/SCENE.md): ONE prop switch
// per decided change (owner, 2026-10-29: "Go with your suggestions"; the list: the playbook's city-poster bullet).
// Every switch OFF = v2's S1 exactly (the copy is pixel-identical to Film2R-V2S1: SCENE.md "the proof"). A switch whose
// engine piece lives in another lane (E, PT, N) is wired here to a PLACEHOLDER in `engine.tsx` until that piece lands;
// the integration swaps the placeholder for the lane's export and leaves the switch where it is.
//   switch      what it changes                                                  engine (lane)          status
//   lineOff     no outlines: the frame-0 construction line draws on, then the    the scene (S)          built
//               colour floods over it; her, the row, the door, W and Pip draw
//               no line after their colour lands (DIRECTION rules 4, 9)
//   shadeTier   the subject's shade face -20 to -25 L* (B and C keep v2's)       FormShade per tier (E) placeholder
//   darks       real darks in many small pieces, 6-10 % under L* 40 (windows,    the scene (S)          built
//               reveals, doorways, the canopy's underside, the hulls, the café
//               set's undersides, the shade under the bay), the near world in
//               mid-tones (decision 2 b)
//   patchwork   the "low poly" paving (projected by the bank's camera) and the   patchwork.ts (PT)      placeholder
//               far city's frontal blocks
//   farStage    the designed view: a pale ghost skyline with one landmark on      persp farStage (S),    built
//               its own horizon behind the far roofs (decision 4 a)              anchorTones (E)        (tones: placeholder)
//   foliage     one species tree in a calm wind for the bay tree                 foliage.tsx, wind (N)  placeholder
//   cloud       a hero cumulus for the kit's cloud                               clouds.tsx (N)         placeholder
//   texture     the VERY subtle mottle per plane; a number = on from that second texture.tsx (PT)       placeholder
//   sunToned    the sun one step off its sky (decision 6 b)                      the scene (S)          built
//   pipHidden   Pip in a quiet "find Pip" spot, not on the waterline bollard     the scene (S)          built
//   float1z     the float moves each plane by 1/z                                depth.ts 1/z (E)       placeholder (P1's table)
//   lines2px    thin lines 2.0 px on the planes that float                       the pen's widths (E?)  built (scene-level)
import React, {createContext, useContext} from 'react';

export type PosterSwitches = {
  lineOff: boolean;
  shadeTier: boolean;
  darks: boolean;
  patchwork: boolean;
  farStage: boolean;
  foliage: boolean;
  cloud: boolean;
  /** false = off; true = on from frame 0; a number = on from that second (STUDY §10 pass 1: "switched on at 3.5 s"). */
  texture: boolean | number;
  sunToned: boolean;
  pipHidden: boolean;
  float1z: boolean;
  lines2px: boolean;
  /** Part of `darks` (decision 2 b): the near world in mid-tones (near.ts). Undefined = follows `darks`; set it to
   *  split the A/B (the dark pieces alone, or the mid-tones alone). */
  nearMid?: boolean;
};

/** v2's S1 as shipped: every switch off. */
export const V2_SWITCHES: PosterSwitches = {
  lineOff: false,
  shadeTier: false,
  darks: false,
  patchwork: false,
  farStage: false,
  foliage: false,
  cloud: false,
  texture: false,
  sunToned: false,
  pipHidden: false,
  float1z: false,
  lines2px: false,
};

export type PosterPreset = 'v2' | 'pass1' | 'pass2';

/** STUDY §10's passes. pass 1 ("the owner-approved lessons" as §10 wrote them on 2026-10-28: the mottle on at 3.5 s, Pip
 *  hidden, the float by depth, rule 4's line kept) and pass 2 (everything: since 2026-10-29 every switch is decided). */
export const PRESETS: Record<PosterPreset, PosterSwitches> = {
  v2: V2_SWITCHES,
  pass1: {...V2_SWITCHES, texture: 3.5, pipHidden: true, float1z: true},
  pass2: {
    lineOff: true,
    shadeTier: true,
    darks: true,
    patchwork: true,
    farStage: true,
    foliage: true,
    cloud: true,
    texture: true,
    sunToned: true,
    pipHidden: true,
    float1z: true,
    lines2px: true,
  },
};

/** The preset, then any switch given on its own (flat props: --props='{"preset":"pass2","texture":false}'). */
export function resolveSwitches(p: Partial<PosterSwitches> & {preset?: PosterPreset}): PosterSwitches {
  const base = PRESETS[p.preset ?? 'v2'] ?? V2_SWITCHES;
  const out: PosterSwitches = {...base};
  for (const k of [...Object.keys(V2_SWITCHES), 'nearMid'] as (keyof PosterSwitches)[]) {
    const v = p[k];
    if (v !== undefined && v !== null) (out as Record<string, unknown>)[k] = v;
  }
  return out;
}

const SwitchCtx = createContext<PosterSwitches>(V2_SWITCHES);
export const PosterSwitchProvider: React.FC<{value: PosterSwitches; children?: React.ReactNode}> = ({value, children}) => <SwitchCtx.Provider value={value}>{children}</SwitchCtx.Provider>;
/** The switches in effect (outside a provider: v2's). */
export const useSwitches = (): PosterSwitches => useContext(SwitchCtx);

/** The texture switch at scene time t. */
export const textureOn = (s: PosterSwitches, t: number): boolean => (typeof s.texture === 'number' ? t >= s.texture : !!s.texture);
