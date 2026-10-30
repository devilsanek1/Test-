// light_s1: the scene's LIGHT PLAN as data (organic/light.md §5, the doses tuned in light_proof.md §3). One key (the low
// October sun, in frame, half behind the far roofs), one story light (the lit Google doorway), one shade family. The
// Python bake (bake/bake_light_s1.py) carries the same numbers for the baked maps; this file is what the live layers
// on the movers read. Screen px at camera rest (S1's camera is locked at zoom 1.00; the float moves each plane).

/** The key: the sun's painted disc (the sky piece draws it, CRAFT §g.2's calm disc) and the horizon (S1_LENS). */
export const SUN = {img: [195, 750] as [number, number], r: 20, horizonY: 965, color: '#FFC27A'} as const;

/** The story light: the lobby seen through the glass doors (S1_SHEET.door 540-720 x 848-1082), its three ceiling lamps
 *  and their floor foot inside the lobby; the light's colour (~2900 K cream-gold: the scene's one hot accent). */
export const DOOR = {
  rect: [540, 848, 720, 1082] as [number, number, number, number],
  lamps: [
    [575, 876],
    [627, 876],
    [678, 876],
  ] as [number, number][],
  lampFootY: 1062,
  color: '#FFE2AE',
  hot: '#FFD08A',
} as const;

/** The live doses on the movers (light.md §4.3: the subject 4-6 px +12-18 L*, B 2 px +6-8; §4.7 the wrap 3-4 px). */
export const HER_LIGHT = {
  /** Her front toward the low sun: a gold band, n . l weighted. */
  sun: {width: 4.2, opacity: 0.78, soft: 0.34},
  /** The lit opening behind her: the wrap all round her edge, weighted by the blurred opening's light. */
  wrap: {width: 3.6, opacity: 0.95},
  /** The lobby's lamps from above and behind: a thin band on her top edges (head, shoulders). */
  lamps: {width: 2.0, opacity: 0.55},
  /** Her body backlit: the camera sees her shade side (a cool violet multiply, light.md §2.8). */
  shade: {tint: '#C9C0E6', opacity: 0.85},
  /** Her shadows from the three lamps cut out of the door's pool (penumbra px). */
  shadowBlur: 2.2,
} as const;

export const PIP_LIGHT = {
  sun: {width: 2.2, opacity: 0.62, soft: 0.3},
  shade: {tint: '#D6CCEA', opacity: 0.7},
} as const;
