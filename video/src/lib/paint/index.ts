// lib/paint: painted pieces, opt-in (PaintedLayer.tsx's header; the API: docs/studies/2026-10-28_city_posters/
// paint_test/NOTES.md). Bake: scripts/look/paint/paint.py.
export {PaintProvider, PaintedLayer, paintSet, usePaintOn, usePainted, usePiece} from './PaintedLayer';
export type {PaintBox, PaintPiece, PaintStyle, PaintedLayerProps} from './PaintedLayer';
export {PaintBakeFrame} from './bake';
