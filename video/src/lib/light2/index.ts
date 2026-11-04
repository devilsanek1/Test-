// lib/light2: PROPER LIGHT in the engine, opt-in (docs/look/organic/light.md is the research and spec; the first proof:
// docs/look/organic/light_proof.md, scene 1 in src/look/light_s1). Two homes of light.md §4.0 as engine pieces:
//   LightMap / LightMaps   baked per-plane maps (a multiply map and a solved screen map), drawn in the plane's group
//   RimOf, WrapOf, ShadeOf, ShadowCut, GrainOn   live layers on a mover, computed from its own drawing every frame
// (home 1, the colours, needs no code: a fill is a fill). lib/light (the flat-step light of every film) is unchanged.
export {LightMap, LightMaps} from './LightMap';
export type {LightMapSpec, MapBlend, MapBox} from './LightMap';
export {RimOf, WrapOf, ShadeOf, ShadowCut, GrainOn, Preload, toward, affineFit, castHomography, homography} from './live';
export type {Affine, Pt, Region} from './live';
