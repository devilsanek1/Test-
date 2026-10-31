// The shared G3 kit (docs/G3_ANIMATIC.md): the animated sketchbook every film's G3 reel is drawn with.
// How-to: src/lib/g3/README.md. Lint: scripts/g3/board_lint.py. A film's entry imports from here, never another film.
export * from './types';
export {BOARD, PLANE_K, PLANE_NEAR_DL, boardFill, boardTone, lstar, planeTone, stepL, tierOf, weightOf, type Weight} from './board';
export {camAt, camAtKeys, camKeys, easeOf, moveU, peaked, progress, snap} from './motion';
export {POSES, SMEAR} from './figure';
export {AmbientView} from './ambient';
export {Element, elBox, frontOf} from './elements';
export {PopCaptions, pages, type CaptionLayer, type CaptionProps} from './Captions';
export {SketchReel, ShotView, camWords, joinText, NOTES_TOP, type SketchReelProps} from './SketchReel';
export {G3ReelComposition, G3ReelView, G3_FPS, type G3ReelProps} from './G3Reel';
export {SketchIcon, ICON_ASPECT, ICON_NAMES, type IconName} from './SketchIcons';
