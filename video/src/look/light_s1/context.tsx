// light_s1: the scene's LIGHT context (docs/look/organic/light_proof.md §2). v6's scene 1 is drawn by this folder's
// copies of the three top-level composers (LightV2S1, LightS1World, LightS1Steps; every leaf part is imported unchanged
// from src/look/paint_s1), cut into SEGMENTS (what draws between two light slots) and SLOTS (where a plane's baked maps
// sit, inside that plane's float group, so they ride its float). Three uses of one tree:
//   look 'v6'      no slot draws, v6's rig: pixel-identical to PaintS1 set 'v6' (checked by the bake: max difference 0)
//   look 'light'   the dusk rig (no day casts), each slot's light maps, her and Pip's live light
//   look 'full'    the same with the colour key and the paper grain folded into the maps, and the grain on the movers
//   parts [...]    the bake's input: only these segments, on a transparent frame (no Film, no captions), the movers
//                  off unless named: their alpha says which slot carries each pixel's light (light_proof.md §2.2)
import React, {createContext, useContext} from 'react';
import {LightMaps, type LightMapSpec} from '../../lib/light2';

export type LookName = 'v6' | 'light' | 'full';
/** The light slots, in drawing order (their plane in S1_PLANE; the bake writes maps per slot). */
export const SLOTS = ['sky', 'spray', 'farroofs', 'fartower', 'bridge', 'water', 'subject', 'boats', 'bank', 'near'] as const;
export type SlotName = (typeof SLOTS)[number];
/** The segments, in drawing order: what each slot's maps sit on. 'farroofs' and 'fartower' are mask-only (the bake's
 *  split of the west gap: they draw the two far planes' pieces alone); the movers are 'her', 'pip' (+ 'pipshadows'), 'particles'. */
export const SEGMENTS = [
  'sky', 'clouds', 'spray', 'westgap', 'farroofs', 'fartower', 'farlife', 'water', 'fartowpath', 'wing', 'doorleaves',
  'wingshades', 'winglife', 'towpathshadows', 'pathfurniture', 'her', 'boatstrips', 'boats', 'duck', 'bank', 'nearunder',
  'near', 'nearover', 'pipshadows', 'pip', 'particles',
] as const;
export type SegName = (typeof SEGMENTS)[number];
/** Mask-only segments: drawn only when a parts render names them (never in a picture). */
const MASK_ONLY: readonly SegName[] = ['farroofs', 'fartower'];
/** The movers: drawn over the maps with their own live light (Pip's bollard and its shadows go with Pip: one group). */
export const MOVERS: readonly SegName[] = ['her', 'pip', 'pipshadows', 'particles'];

/** One slot's maps (multiply first, then the solved screen map) and the movers' live inputs. */
export type SlotMaps = Partial<Record<SlotName, readonly LightMapSpec[]>>;
export type LiveInputs = {
  /** The door's pool (screen, solved against the subject's lit towpath), cut by her live shadow. */
  pool?: LightMapSpec;
  /** The lit opening blurred, in the door light's colour (her wrap's light). */
  doorBlur?: {src: string; box: readonly [number, number, number, number]};
  /** The paper grain tile (mid-grey + grain, soft-light), for the movers in look 'full'. */
  grain?: {src: string; size: number};
};
export type MapSet = {slots: SlotMaps; live: LiveInputs};

export type LightCtxV = {
  look: LookName;
  /** null = the picture (every segment); else the parts render's segments. */
  parts: readonly SegName[] | null;
  /** The movers (her, Pip, the particles) drawn (default true; false = the bake's static base). */
  movers: boolean;
  maps: MapSet;
};
const EMPTY: MapSet = {slots: {}, live: {}};
const Ctx = createContext<LightCtxV>({look: 'v6', parts: null, movers: true, maps: EMPTY});
export const LightCtxProvider: React.FC<{value: LightCtxV; children?: React.ReactNode}> = ({value, children}) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useLightS1 = () => useContext(Ctx);

/** Is this segment drawn here? */
export function useSegOn(name: SegName): boolean {
  const c = useContext(Ctx);
  if (c.parts) return c.parts.includes(name);
  if (MASK_ONLY.includes(name)) return false;
  if (MOVERS.includes(name)) return c.movers;
  if (name === 'wingshades') return c.look === 'v6';
  return true;
}

/** A segment: its children when it is drawn. */
export const Seg: React.FC<{name: SegName; children?: React.ReactNode}> = ({name, children}) => (useSegOn(name) ? <>{children}</> : null);

/** A slot: this plane's baked maps (none in look 'v6' and in parts renders). Put it INSIDE the plane's float group, after
 *  the segment it lights. */
export const Slot: React.FC<{name: SlotName}> = ({name}) => {
  const c = useContext(Ctx);
  if (c.parts || c.look === 'v6') return null;
  return <LightMaps maps={c.maps.slots[name]} label={name} />;
};
