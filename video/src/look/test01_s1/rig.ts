// test01_s1: the scene's LIGHT PLAN as data for the live layers (the bake, bake/light_t01.py, carries the same rig for
// the baked maps; both read scene.json). ONE story light: the waking pages under her, the stream of light climbing the
// bridge's face and her phone at its end: candle gold, from BELOW her. The blue hour fills everything else from above
// (a cool violet shade); the afterglow down the canal sits low behind her (her silhouette's ground). Screen px at rest.
import scene from './scene.json';

const {f, cx, cy, h} = scene.camera;

/** A world point (metres) on screen. */
export function proj(X: number, Y: number, Z: number): [number, number] {
  return [cx + (f * X) / Z, cy - (f * (Y - h)) / Z];
}

/** The bridge's deck height at X (bake/t01cam.py deck_y). */
export function deckY(x: number): number {
  const b = scene.bridge;
  const t = Math.min(1, Math.abs(x) / b.deck_half);
  return scene.canal.quay_y + (b.crown - scene.canal.quay_y) * Math.pow(Math.cos((t * Math.PI) / 2), 1.6);
}

/** Her feet and drawn height on screen (scene.json): she stands on the crown, behind the near railing. */
export function herScreen(): {x: number; feetY: number; h: number} {
  const H = scene.her;
  const [x, y] = proj(H.X, deckY(H.X), H.Z);
  return {x, feetY: y, h: (f * H.height_m) / H.Z};
}

/** The railing's top on screen at X (the near railing, scene.bridge.zf - 0.08). */
export function railTopY(X: number): number {
  return proj(X, deckY(X) + scene.bridge.rail + 0.04, scene.bridge.zf - 0.08)[1];
}

/** The stream of light (scene.json stream): its points on screen, from the water to her phone. */
export function streamScreen(): [number, number][] {
  return (scene.stream as number[][]).map(([X, Y, Z]) => proj(X, Y, Z));
}

/** The story light's colours: the hot core, the gold, the warm halo. */
export const GOLD = {core: '#FFF4D8', hot: '#FFE2A0', gold: '#FFC35E', ember: '#F2A04A'} as const;

/** Her live light (widths in px at her ~130 px): the gold from below (the stream and the pages) on the edges that face
 *  down (chin, forearms, the coat's front, the hair's ends), a soft uplight over her front, the blue hour's cool shade
 *  over all of her (never black), and the low sky's thin wrap on the edges against it. */
export const HER_LIGHT = {
  shade: {tint: '#7C7AA6', opacity: 0.62},
  up: {width: 2.6, opacity: 1.0, soft: 0.55, color: '#FFC877'},
  wrap: {width: 1.4, opacity: 0.35},
} as const;
