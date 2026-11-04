// v8_s1: the scene's LIGHT PLAN as data for the live layers (the bake, bake/light_v8.py, carries the same rig for the
// baked maps; both read scene.json). One key and story light: the low October sun at the end of the canal, ahead of her
// and to her right (screen), golden; one secondary: the lobby's warm lamps behind her (the office she leaves), a step
// under it; one shade family (the sky's rose-lilac fill). Screen px at camera rest.
import scene from './scene.json';

const {f, cx, cy, h} = scene.camera;
const az = (scene.sun.az_deg * Math.PI) / 180;
const el = (scene.sun.el_deg * Math.PI) / 180;
const dir = [Math.sin(az) * Math.cos(el), Math.sin(el), Math.cos(az) * Math.cos(el)];

/** A world point (metres) on screen. */
export function proj(X: number, Y: number, Z: number): [number, number] {
  return [cx + (f * X) / Z, cy - (f * (Y - h)) / Z];
}

/** The sun's disc on screen (a point at infinity). */
export const SUN_IMG: [number, number] = [cx + (f * dir[0]) / dir[2], cy - (f * dir[1]) / dir[2]];

/** Her feet and drawn height on screen (scene.json). */
export function herScreen(): {x: number; feetY: number; h: number} {
  const H = scene.her;
  const [x, y] = proj(H.X, 0, H.Z);
  return {x, feetY: y, h: (f * H.height_m) / H.Z};
}

/** The lobby's light as seen from her: the middle of the lit opening behind her (the door), at about her waist. */
export const LOBBY_LIGHT = {
  img: proj(scene.street.x0, 1.5, (scene.lobby.door[0] + scene.lobby.door[1]) / 2),
  color: '#FFE0B4',
} as const;

/** Her live light: backlit by the sun (her body in a soft rose-lilac shade, the sky's fill: never black), the sun's gold
 *  rim on the edges that face it (her profile, her hair, her shoulder, the coat's front), the lobby's warm wrap and a
 *  thin rim on her back, both kept low: her head sits against the bright sky everywhere, so a stronger wrap read as an
 *  even outline (DIRECTION rule 5: a rim follows the light's angle). Widths in px at her ~600 px. */
export const HER_LIGHT = {
  sun: {width: 5.2, opacity: 1.0, soft: 0.6, color: '#FFD9A2'},
  lobby: {width: 2.0, opacity: 0.32},
  wrap: {width: 1.8, opacity: 0.28},
  shade: {tint: '#BCA6CA', opacity: 0.55},
} as const;
