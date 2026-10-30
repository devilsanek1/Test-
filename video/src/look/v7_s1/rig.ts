// v7_s1: the scene's LIGHT PLAN as data (organic/light.md §5; light_proof.md §3's doses, deepened for T3, the
// references' low key: composition.md §5). One key (the low October sun, in frame, half behind the far roofs), one
// story light (the lit Google doorway), one shade family. The Python bake (bake/light_v7.py) carries the same numbers
// for the baked maps; this file is what the live layers on the movers read. Screen px at camera rest.

/** The key: the sun's painted disc (the v7 sky piece draws CRAFT §g.2's calm disc) and the horizon (S1_LENS). */
export const SUN = {img: [195, 750] as [number, number], r: 20, horizonY: 965, color: '#FFC27A'} as const;

/** The story light: the lobby through the open glass doors (S1_SHEET.door 540-720 x 848-1082), its three lamps, their
 *  floor foot; the light's colour (~2900 K cream-gold: the scene's one hot accent). */
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

/** Her live light (scaled to her 153 px: light_proof.md §2.3). T3: her body in deep backlit shade (her teal kept, a
 *  silhouette against the lit opening: composition.md R4, her L* <= 28), the sun's gold rim on her front, the opening's
 *  wrap round her edge, the lamps' rim on her head and shoulders. */
export const HER_LIGHT = {
  sun: {width: 1.7, opacity: 0.66, soft: 0.4},
  wrap: {width: 1.3, opacity: 0.34},
  lamps: {width: 1.1, opacity: 0.42},
  shade: {tint: '#8E80BE', opacity: 0.94},
  shadowBlur: 1.8,
  shadowShare: 0.5,
} as const;

/** Pip on the boat's roof, tone-on-tone inside the boat's backlit shade (R12): a deeper violet shade than v6's bollard
 *  Pip, a thin sun rim (tier B, scaled to its 70). */
export const PIP_LIGHT = {
  sun: {width: 1.2, opacity: 0.45, soft: 0.3},
  shade: {tint: '#8F86B8', opacity: 0.92},
} as const;
