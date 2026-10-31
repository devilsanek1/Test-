// captions2: the type guide's captions (docs/look/TYPE_GUIDE.md, picked 2026-10-30). API: ./README.md.
export {Captions2, CoverTitle, GroupView, WorldWord, CAPTIONS2_MASK, bloomAt, groupWindows, useCaptionFile} from './Captions2';
export type {Captions2Props} from './Captions2';
export {HAND_FAMILY, HAND_WEIGHTS, handStack, loadHandFonts, useHandFonts} from './fonts';
export {layoutGroup, measure, pieceShape, rowShape} from './layout';
export * from './types';
import recipesJson from './recipes.json';
/** The type guide's numbers (recipes.json): tones, styles, seats, the type frame, motion, recipes R1-R10. */
export const captionRecipes = recipesJson;
