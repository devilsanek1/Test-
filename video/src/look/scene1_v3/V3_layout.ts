// Scene 1, still v3 (docs/studies/2026-10-28_city_posters/scene_rethink/NOTES.md "still_v3"): v2's S1 view, the camera
// at human height on OUR steps, close to her. Pure numbers, nothing draws here.
//   - v2's world (the west gap, the bridge, Google's canal wing, the water, our steps) is drawn V3_SHIFT px LOWER than
//     in v2: the sky gets the room for the evening cloud bank above and below the caption band, and our bank's big pale
//     floor drops mostly out of the frame (what is left is the near frame: the landing and three treads, in mid-tones).
//   - she is alone on OUR landing by the water (no row, nobody behind the glass), ~1.3x v2's 153-170 px: nearer than the
//     far towpath's people (~120-140 px), her head and coat against the water's lit glitter column, walking west.
//   - the scene clock is frozen at V3_T (after the doors shut at 1.10, inside "She quit Google." 0.12-2.00).
export const V3_SHIFT = 220;
/** The still's scene time (s). */
export const V3_T = 1.6;
/** Her on our landing, in WORLD px (the shifted group's coordinates: screen y = world y + V3_SHIFT). */
export const V3_HER = {x: 300, feet: 1238, h: 210, step: 2.5, turn: 0} as const;
/** Pip, hidden on the near moored boat's roof between its pots (world px, the paw point) and its size (tier B). */
export const V3_PIP = {x: 958, y: 1121, size: 54} as const;
/** World y -> screen y. */
export const screenY = (y: number) => y + V3_SHIFT;
