// rigs.ts: the film's light rigs, ONE per set (docs/v2/THROUGHLINE.md §5; docs/look/DIRECTION.md rule 5, CRAFT.md §d;
// the engine is src/lib/light.tsx, how-to src/lib/LIGHT.md). Lanes IMPORT these and never redefine them; a shot whose
// lens turns the key takes its per-shot copy below (`withKey`: the same family and pools, its own screen angle).
//
//   RIG_CANAL  the canal on one October evening (S1, S2, S3, S4, S7, S8): the low western sun
//   RIG_APRIL  Arlington on an April morning (S5, S6): the morning sun, no pools
//
// One shadow family for both sets (TINT_CANAL). The sun never moves between cuts (it keeps its screen spot through
// both sun push-throughs) and two suns never share a frame. Every shot: contact shadows under everything that touches a
// surface; casts for people, posts, boards and trees along the key; FormShade on the side away from it; `Shade` one
// step on planes turned from the sun; Rim only on her (S1, S4, S8); lit panes are `LitWindow` (L* 85-92, no glow).
// On WATER (the canal in S1, S2, S3, S4, S8) a light-layer shade takes `tint="water"` (TINT_CANAL.water, the water's
// own deeper step), never the rose family; a shade drawn as a flat fill of the water's own steps needs none.
// Check: scripts/qa/check_light.py on an A/B (`--props='{"lightOff":true}'`) with --sky '#BCDCCF' and
// --exclude 0,0,1080,<the shot's sky bottom y> (its default sky is v3's dusk blue).
import {CM} from '../palette';
import {makeRig, sunLight, tintFamily, tintFor, withKey, type LightRig, type Tints} from '../../lib/light';

/** The film's ONE shadow family: CM.shadeWarm at 0.20 / 0.28 / 0.48 (= the light demo's TINT_CANAL): on the paving
 *  form / cast / contact dL* -9 / -13 / -22, chroma kept, toward rose. Day and evening: no ambient step (#FFFFFF).
 *  ON WATER: `water`, the water's own deeper step (CM.water x it = CM.waterDeep: dL* -9, C* 15 -> 18, the hue kept).
 *  The rose family greys teal water: its cast took S1's far water to C* 4.7 (check_light "greyed", L1 v4). Lanes
 *  write `tint="water"` (lib/light's tintOf finds the key) on every light-layer shade on the canal: a cast-strength
 *  strip at a waterline at most, never a contact strip. */
export const TINT_CANAL: Tints & {water: string} = {
  ...tintFamily(CM.shadeWarm, {form: 0.2, cast: 0.28, contact: 0.48}, '#FFFFFF'),
  water: tintFor(CM.water, CM.waterDeep),
};

/** The lamp pools (two flat steps, both lighter and warmer than the paving: +4 L* at least) and the rim colour. */
export const CANAL_POOL: [string, string] = ['#FBE6C2', '#FFF2D9'];
export const CANAL_RIM = '#FFE7BE';

/** RIG_CANAL (= the light demo's CANAL_EVENING): the low western sun, el 36, casts capped at 0.8 h. On the north lenses
 *  (S1-S4, S7) the sun is at screen LEFT (in frame in S1, S3, S4 and S7; off-screen left in S2): shadows fall right and a
 *  little toward us (toward 15). The lamps' pools only when they light at sunset (S8 37.18); windows CM.lamp. */
export const RIG_CANAL: LightRig = makeRig({
  name: 'canal, October evening',
  key: sunLight({toward: 15, el: 36}),
  ground: 0.28,
  cap: 0.8,
  tints: TINT_CANAL,
  pool: CANAL_POOL,
  surface: CM.paving,
  rim: CANAL_RIM,
  window: CM.lamp,
  windowOff: CM.lamp,
  form: {frac: 0.3},
});

/** S8 looks WEST, into the low sun ahead (SUN8 (420, 625)): shadows fall toward us (toward 85), backlit form (tops lit,
 *  camera-facing sides one step down); her rim along her top and left edge only. */
export const RIG_CANAL_S8: LightRig = {...withKey(RIG_CANAL, sunLight({toward: 85, el: 36})), form: {frac: 0.3, backlit: true}};

/** RIG_APRIL: the same family; the April morning sun, el 40, no pools (no lamps by day). S5's start: the sun in the slot
 *  at the left, shadows right and toward us (toward 15); S6 looks south (a > 90 deg turn from S5's end, so the key may
 *  change side at the wipe): the sun at the left (SUN2), shadows right and toward us (toward 15). */
export const RIG_APRIL: LightRig = makeRig({
  name: 'Arlington, April morning',
  key: sunLight({toward: 15, el: 40}),
  ground: 0.28,
  cap: 0.8,
  tints: TINT_CANAL,
  pool: CANAL_POOL,
  surface: CM.paving,
  rim: CANAL_RIM,
  window: CM.lamp,
  windowOff: CM.lamp,
  form: {frac: 0.3},
});

/** S5's end, after the crane's arc: the sun upper right, shadows fall left and toward us (toward 165), 3/4 backlight
 *  (tops lit, camera-facing walls and the backs in shade). One direction per frame: each plane's casts match the sun's
 *  side in that frame (switch them behind the lamppost wipe if needed). */
export const RIG_APRIL_S5_END: LightRig = {...withKey(RIG_APRIL, sunLight({toward: 165, el: 40})), form: {frac: 0.3, backlit: true}};

/** Which rig each shot starts in (S5 hands over to RIG_APRIL_S5_END behind its lamppost wipe). */
export const SHOT_RIG: Record<'V2S1' | 'V2S2' | 'V2S3' | 'V2S4' | 'V2S5' | 'V2S6' | 'V2S7' | 'V2S8', LightRig> = {
  V2S1: RIG_CANAL,
  V2S2: RIG_CANAL,
  V2S3: RIG_CANAL,
  V2S4: RIG_CANAL,
  V2S5: RIG_APRIL,
  V2S6: RIG_APRIL,
  V2S7: RIG_CANAL,
  V2S8: RIG_CANAL_S8,
};
