// The film only (Main + per-scene compositions), without the dev previews: scripts/render-frames.mjs uses it for Main
// and S01..S13 so another lane's half-written dev file can't break film previews. Studio / full renders: src/index.ts.
import {registerRoot} from 'remotion';
import {FilmRoot} from './FilmRoot';

registerRoot(FilmRoot);
