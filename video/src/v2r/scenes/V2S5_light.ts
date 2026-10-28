// V2S5_light.ts (lane L4): S5's light (CRAFT §d; world/rigs RIG_APRIL -> RIG_APRIL_S5_END; lib/LIGHT.md). ONE sun, fixed
// in the world; the crane arcs round the pair, so on screen the sun travels from the slot at the left (SUN1 (250, 650),
// p 0) to the right edge (1058.5, 646, p 1) and the shadows SWING WITH IT: their screen direction follows the sun's screen
// x (RIG_APRIL's toward 15, right and a little toward us, while the sun is in the slot; 90, straight at us, as it passes
// the centre; RIG_APRIL_S5_END's 165, left, at the end): one direction per frame and never a pop (a switch would flip
// every cast on the deck at once). The form flag (backlit) changes at the swap, behind the lamppost wipe.
// V2S5.tsx wraps the whole set in <Lit rig={s5Rig(p)}>; every light layer reads it (useRig).
import {sunLight, withKey, type LightRig} from '../../lib/light';
import {RIG_APRIL, RIG_APRIL_S5_END} from '../world/rigs';
import {applyMat, planeMat, PLANES, SWAP_P} from './V2S5_rig';
import {FAR_END} from './V2S5_far';

/** The sun's screen spot at p (the far plane's map of the END sun). */
export const sunScreenAt = (p: number): [number, number] => {
  const q = applyMat(planeMat(PLANES.far, p), [FAR_END.sun.x, FAR_END.sun.y]);
  return [q[0], q[1]];
};

const X0 = sunScreenAt(0)[0];
const X1 = sunScreenAt(1)[0];
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** The shadows' screen direction at p (deg; 0 right, 90 toward us): 15 -> 165 with the sun's screen x. */
export const s5Toward = (p: number) => 15 + 150 * clamp01((sunScreenAt(p)[0] - X0) / (X1 - X0));

const CACHE = new Map<string, LightRig>();
/** The rig at crane progress p (cached per half degree: the light lib may key caches on the rig). */
export function s5Rig(p: number): LightRig {
  if (p <= 0) return RIG_APRIL;
  if (p >= 1) return RIG_APRIL_S5_END;
  const toward = Math.round(s5Toward(p) * 2) / 2;
  const back = p >= SWAP_P;
  const k = `${toward}|${back}`;
  let r = CACHE.get(k);
  if (!r) {
    r = withKey(back ? RIG_APRIL_S5_END : RIG_APRIL, sunLight({toward, el: 40}));
    CACHE.set(k, r);
  }
  return r;
}
