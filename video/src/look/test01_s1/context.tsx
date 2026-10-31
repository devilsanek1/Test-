// test01_s1: the scene's context (after src/look/v8_s1/context.tsx's pattern, never editing it). Every static plane is
// a PAINTED PIECE (bake/paint_t01.py, from the set's design in bake/set_t01.py) with its baked LIGHT MAPS (one multiply,
// one screen: bake/light_t01.py, solved against the composite of the pieces, so the light is the rig's, never painted
// lit) drawn in that plane's group, so a later float moves each plane with its own light. The movers are the engine's,
// drawn live: her (the people in use, lit live by the story light below her), the stream of light to her phone, Pip.
//   look 'flat'   the pieces' flat design only (no paint, no light): the bake's check of the set
//   look 't01'    the delivered still: painted pieces, light maps, the movers lit live, the paper
//   parts [...]   the bake's input: only these movers, on the `slab` colour, no captions
import React, {createContext, useContext} from 'react';
import {LightMaps, type LightMapSpec} from '../../lib/light2';

export type LookName = 'flat' | 't01';
/** The planes, far to near (bake/set_t01.py PLANES, the sky first). The twin is seen THROUGH the water. */
export const PLANES = ['sky', 'twin', 'water', 'far', 'bridge', 'boat', 'rail', 'glow', 'trees', 'near'] as const;
export type PlaneName = (typeof PLANES)[number];
/** The movers the engine draws live (the parts render can isolate each). */
export const MOVERS = ['her', 'stream', 'pip'] as const;
export type MoverName = (typeof MOVERS)[number];

export type Piece = {src: string; box: readonly [number, number, number, number]};
export type PieceSet = Partial<Record<PlaneName, Piece>>;
export type SlotMaps = Partial<Record<PlaneName, readonly LightMapSpec[]>>;
export type LiveInputs = {
  /** The light around her (the low sky behind her and the gold below), blurred: her wrap's light (lib/light2 WrapOf). */
  wrap?: {src: string; box: readonly [number, number, number, number]};
  /** The one paper's tile (mid-grey + the grain), soft-light, locked to each mover (lib/light2 GrainOn). */
  grain?: {src: string; size: number};
};
export type MapSet = {slots: SlotMaps; live: LiveInputs};

export type T01CtxV = {
  look: LookName;
  /** null = the picture; else the parts render's movers. */
  parts: readonly MoverName[] | null;
  pieces: PieceSet;
  maps: MapSet;
};
const Ctx = createContext<T01CtxV>({look: 't01', parts: null, pieces: {}, maps: {slots: {}, live: {}}});
export const T01CtxProvider: React.FC<{value: T01CtxV; children?: React.ReactNode}> = ({value, children}) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useT01 = () => useContext(Ctx);
/** Is this mover drawn here? */
export function useMoverOn(name: MoverName): boolean {
  const c = useContext(Ctx);
  return c.parts ? c.parts.includes(name) : true;
}
/** Is the picture lit (look 't01', not a parts render)? */
export const useLit = () => {
  const c = useContext(Ctx);
  return c.look === 't01' && !c.parts;
};

/** A plane's baked maps (look 't01', never in parts renders), INSIDE the plane's group. */
export const PlaneMaps: React.FC<{name: PlaneName}> = ({name}) => {
  const c = useContext(Ctx);
  if (c.parts || c.look !== 't01') return null;
  return <LightMaps maps={c.maps.slots[name]} label={name} />;
};
