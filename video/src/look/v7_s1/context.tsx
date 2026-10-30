// v7_s1: the scene's context (ORGANIC.md §6; light_s1's context.tsx, the proof this folder merges, extended). v7's
// scene 1 is drawn by this folder's composers (V7Scene.tsx, V7World.tsx) over paint_s1's leaf parts, cut into SEGMENTS
// (what draws between two light slots: the bake renders each alone) and SLOTS (where a plane's baked maps sit, inside
// that plane's float group). One tree, five uses:
//   look 'cut'     ORGANIC §6 step 4 alone: v6's palette, painting and rig, the props cut (run FIRST: nothing is
//                  painted or lit and then removed)
//   look 'key'     + step 1: the ONE colour key at the source (palette_v7.ts through lib/tod's map; the v7 painted set:
//                  T3's sky, the dark cloud, the canal painted on v7's own design frame)
//   look 'v7a'     + step 2: the story light (the dusk rig, the baked per-plane maps solved against the keyed picture,
//                  her and Pip's live light): the first half's still (maps/v7a, maps.ts)
//   look 'v7'      + step 3 and step 5, the second half (NOTES.md "v7"): the painted pieces in their slots (the quay,
//                  the facade, the near leaves), her in people direction C with the LASH face, the light solved again
//                  against them (maps/v7, maps_v7.ts) with the one paper folded into each plane's maps and a grain tile
//                  locked to her and Pip
//   parts [...]    the bake's input: only these segments on a black or white slab (no Film, no captions), the movers
//                  off unless named
//   design         the canal's design frame for the painter (look 'key' with the vector water, unkeyed: the painter
//                  repaints the canal from it, v6's C10)
// Slots for step 3 and step 5 (the second half): `PieceSlot` names where each organic piece goes (the cloud planes,
// the far city, the facade, the water, the paving, the kept prop); they draw only in look 'v7' (./pieces.tsx).
import React, {createContext, useContext} from 'react';
import {LightMaps, type LightMapSpec} from '../../lib/light2';

export type LookName = 'cut' | 'key' | 'v7a' | 'v7';
/** The light slots, in drawing order (their plane in S1_PLANE; the bake writes maps per slot). */
export const SLOTS = ['sky', 'farroofs', 'fartower', 'bridge', 'water', 'subject', 'boats', 'bank', 'near'] as const;
export type SlotName = (typeof SLOTS)[number];
/** The segments, in drawing order. 'farroofs' and 'fartower' are mask-only (the bake's split of the west gap). The
 *  movers: 'her', 'pip' (on the boat's roof, with its contact strip), 'particles'. Cut by step 4 (never drawn): the
 *  leaf spray, the cloud bar, the duck, boat B, the boater, the cat, the bench, the bay tree, the planter, the crates,
 *  the potted thyme and the pier, the fern pot, the composers' fallen leaves (./V7Props draws nine in 'near'). */
export const SEGMENTS = [
  'sky', 'clouds', 'westgap', 'farroofs', 'fartower', 'farlife', 'water', 'fartowpath', 'wing', 'lobby', 'doorleaves',
  'wingshades', 'winglife', 'towpathshadows', 'pathfurniture', 'her', 'boatstrips', 'boats', 'pip', 'bank', 'near',
  'particles',
] as const;
export type SegName = (typeof SEGMENTS)[number];
const MASK_ONLY: readonly SegName[] = ['farroofs', 'fartower'];
export const MOVERS: readonly SegName[] = ['her', 'pip', 'particles'];

export type SlotMaps = Partial<Record<SlotName, readonly LightMapSpec[]>>;
export type LiveInputs = {
  /** The door's pool (screen, solved against the subject's lit towpath), cut by her live shadow. */
  pool?: LightMapSpec;
  /** The lit opening blurred, in the door light's colour (her wrap's light). */
  doorBlur?: {src: string; box: readonly [number, number, number, number]};
  /** Step 5: the paper's tile (mid-grey + the frame's grain), soft-light, locked to each mover (lib/light2 GrainOn). */
  grain?: {src: string; size: number};
};
export type MapSet = {slots: SlotMaps; live: LiveInputs};

export type V7CtxV = {
  look: LookName;
  /** null = the picture (every segment); else the parts render's segments. */
  parts: readonly SegName[] | null;
  /** The movers drawn (default true; false = the bake's static base). */
  movers: boolean;
  /** The canal's design frame (the vector water, unkeyed). */
  design: boolean;
  /** The bake's marker render: v2's lamp role (the lit panes) drawn as pure green, so the bake finds every lit pane
   *  exactly (the keyed cream sits too close to the limestone piers to pick by colour). */
  marker: boolean;
  maps: MapSet;
};
const EMPTY: MapSet = {slots: {}, live: {}};
const Ctx = createContext<V7CtxV>({look: 'v7a', parts: null, movers: true, design: false, marker: false, maps: EMPTY});
export const V7CtxProvider: React.FC<{value: V7CtxV; children?: React.ReactNode}> = ({value, children}) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useV7 = () => useContext(Ctx);
/** Step 1 (the key) in force (looks 'key', 'v7a' and 'v7'). */
export const useKeyed = () => useContext(Ctx).look !== 'cut';
/** Is a look lit (step 2 in force: 'v7a' and 'v7')? */
export const litLook = (look: LookName) => look === 'v7a' || look === 'v7';
/** Step 2 (the light) in force. */
export const useLit = () => litLook(useContext(Ctx).look);
/** Steps 3 and 5 in force (look 'v7': the painted pieces, her in direction C, the paper). */
export const useSecondHalf = () => useContext(Ctx).look === 'v7';

/** Is this segment drawn here? */
export function useSegOn(name: SegName): boolean {
  const c = useContext(Ctx);
  if (c.parts) return c.parts.includes(name);
  if (MASK_ONLY.includes(name)) return false;
  if (MOVERS.includes(name)) return c.movers;
  if (name === 'wingshades') return !litLook(c.look);
  return true;
}

export const Seg: React.FC<{name: SegName; children?: React.ReactNode}> = ({name, children}) => (useSegOn(name) ? <>{children}</> : null);

/** A slot: this plane's baked maps (the lit looks 'v7a' and 'v7', each its own map set; never in parts renders). INSIDE
 *  the plane's float group. */
export const Slot: React.FC<{name: SlotName}> = ({name}) => {
  const c = useContext(Ctx);
  if (c.parts || !litLook(c.look)) return null;
  return <LightMaps maps={c.maps.slots[name]} label={name} />;
};
