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

/** The story light's heart on screen: the waking pages at the waterline under her. */
export const SRC_IMG: [number, number] = proj(scene.source.X, scene.source.Y, scene.source.Z);

/** Pip's spot: on the houseboat's roof among its pots (scene.json pip), its size in px. */
export function pipScreen(): {x: number; y: number; size: number} {
  const P = scene.pip;
  const [x, y] = proj(P.X, P.Y, P.Z);
  return {x, y, size: (f * P.size_m) / P.Z};
}

/** The story light's colours: the hot core, the gold, the warm halo. */
export const GOLD = {core: '#FFF4D8', hot: '#FFE2A0', gold: '#FFC35E', ember: '#F2A04A'} as const;

/** Her live light (widths in px at her ~135 px): the blue hour's cool shade over all of her (never black), the gold
 *  from below on the edges that face the waking pages (chin, forearms, the coat's front, the hair's ends), a pool of
 *  the phone's and the stream's gold over her hands, face and chest (radius in her heights), the low sky's thin wrap. */
export const HER_LIGHT = {
  shade: {tint: '#7C7AA6', opacity: 0.62},
  up: {width: 1.7, opacity: 0.9, soft: 0.5, color: '#FFC877'},
  pool: {r: 0.34, opacity: 0.85},
  wrap: {width: 1.4, opacity: 0.35},
} as const;
