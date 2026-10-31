// v8_s1: the scene's context (paint_test/v8_card.md; built from src/look/v7_s1/context.tsx's pattern, never editing it).
// v8's world is the bake's: every static plane is a PAINTED PIECE (the painter v8, src/look/v8_s1/bake/paint_v8.py, from
// the set's design in bake/set_v8.py) with its baked LIGHT MAPS (one multiply, one screen: bake/light_v8.py, solved
// against the composite of the pieces, so the light is the rig's, never painted lit) drawn in that plane's group, so a
// later float moves each plane with its own light. The movers are the engine's, drawn live in their plane: her (the
// people overhaul, lit live: the sun's rim, the lobby's wrap, her backlit shade, the paper), the cafe's people and Pip.
//   look 'flat'   the pieces' flat design only (no paint, no light): the bake's check of the set
//   look 'v8'     the delivered still: painted pieces, light maps, the movers lit live, the paper
//   parts [...]   the bake's input: only these movers, on the `slab` colour, no Film, no captions (her silhouette for
//                 her shadow and her reflection in the wet stones)
import React, {createContext, useContext} from 'react';
import {LightMaps, type LightMapSpec} from '../../lib/light2';

export type LookName = 'flat' | 'v8';
/** The planes, far to near (bake/set_v8.py PLANES, with the sky first). */
export const PLANES = ['sky', 'farcity', 'water', 'far', 'boat', 'mid', 'street', 'building', 'near'] as const;
export type PlaneName = (typeof PLANES)[number];
/** The movers the engine draws live (the parts render can isolate each). */
export const MOVERS = ['her', 'cafe', 'pip', 'particles'] as const;
export type MoverName = (typeof MOVERS)[number];

export type Piece = {src: string; box: readonly [number, number, number, number]};
export type PieceSet = Partial<Record<PlaneName, Piece>>;
export type SlotMaps = Partial<Record<PlaneName, readonly LightMapSpec[]>>;
export type LiveInputs = {
  /** The lit lobby behind her, blurred, in its light's colour (her wrap's light: lib/light2 WrapOf). */
  wrap?: {src: string; box: readonly [number, number, number, number]};
  /** The one paper's tile (mid-grey + the grain), soft-light, locked to each mover (lib/light2 GrainOn). */
  grain?: {src: string; size: number};
};
export type MapSet = {slots: SlotMaps; live: LiveInputs};

export type V8CtxV = {
  look: LookName;
  /** null = the picture; else the parts render's movers. */
  parts: readonly MoverName[] | null;
  pieces: PieceSet;
  maps: MapSet;
};
const Ctx = createContext<V8CtxV>({look: 'v8', parts: null, pieces: {}, maps: {slots: {}, live: {}}});
export const V8CtxProvider: React.FC<{value: V8CtxV; children?: React.ReactNode}> = ({value, children}) => <Ctx.Provider value={value}>{children}</Ctx.Provider>;
export const useV8 = () => useContext(Ctx);
/** Is this mover drawn here? */
export function useMoverOn(name: MoverName): boolean {
  const c = useContext(Ctx);
  return c.parts ? c.parts.includes(name) : true;
}
/** Is the picture lit (look 'v8', not a parts render)? */
export const useLit = () => {
  const c = useContext(Ctx);
  return c.look === 'v8' && !c.parts;
};

/** A plane's baked maps (look 'v8', never in parts renders), INSIDE the plane's group. */
export const PlaneMaps: React.FC<{name: PlaneName}> = ({name}) => {
  const c = useContext(Ctx);
  if (c.parts || c.look !== 'v8') return null;
  return <LightMaps maps={c.maps.slots[name]} label={name} />;
};
