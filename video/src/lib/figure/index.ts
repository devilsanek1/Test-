// lib/figure: the refined "you" (the recipe: docs/look/paint_recipes/people.md). A reusable engine piece: a film draws
// its own people with it (its colours, poses, light), never another film's figure.
export {Figure, HER_LOOK, type FigureLook, type FigureLight, type FigureProps} from './Figure';
export {buildFigure, PROP, H, type FigurePose, type View, type Carry, type Part} from './model';
export {WIND, endChain, type Wind} from './wind';
export {tone, litBy, type Tone} from './tones';
