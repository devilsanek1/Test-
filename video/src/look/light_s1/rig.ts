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

/** The live doses on the movers (light.md §4.3's 4-6 px for the subject is for a ~300 px figure; she is 153 px with limbs ~6 px wide, so her
 *  bands are scaled to her: a 1.5-1.7 px edge, +10-15 L* measured on her edge). */
export const HER_LIGHT = {
  /** Her front toward the low sun: a gold band, n . l weighted. */
  sun: {width: 1.7, opacity: 0.62, soft: 0.4},
  /** The lit opening behind her: the wrap all round her edge, weighted by the blurred opening's light. */
  wrap: {width: 1.3, opacity: 0.3},
  /** The lobby's lamps from above and behind: a thin band on her top edges (head, shoulders). */
  lamps: {width: 1.1, opacity: 0.4},
  /** Her body backlit: the camera sees her shade side (a cool violet multiply, light.md §2.8). */
  shade: {tint: '#A99DD2', opacity: 0.92},
  /** Her shadows from the three lamps cut out of the door's pool (penumbra px), each lamp's share of the pool's light. */
  shadowBlur: 1.8,
  shadowShare: 0.5,
} as const;

export const PIP_LIGHT = {
  sun: {width: 1.6, opacity: 0.6, soft: 0.35},
  shade: {tint: '#CFC4E8', opacity: 0.75},
} as const;
