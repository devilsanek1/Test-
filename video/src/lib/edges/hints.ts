// edges/hints.ts — what the 'paint' edge knows about the scene under it, per scene id (EdgeHints in shared.ts):
//   ink   line-art density per region, 0 (a flat sky) .. 1 (a crowd, branches): a corner / the left bite is left bare
//         only where there is drawing to show; a flat region gets colour to the edge instead (no empty white tiles)
//   keep  screen rects that stay entirely in colour (a hero figure, the mascot and the ground under it, a lamp and its
//         halo): no colour edge ever cuts them
// FilmEdges applies EDGE_HINTS[scene] for `<FilmEdges scene={id}>`; a scene without an entry still works (every
// region allowed, bare corners get their block outline ruled in). To measure a scene: render it clean at one or more
// frames of the shot (scripts/still.sh), then
//   python3 review/edges/loose/final/tools/scan_hints.py <scene-id> frame1.png [frame2.png ...]
// prints the entry (ink + the mascot's keep rect); add hero figures / key props to `keep` by hand. A shot that
// changes a lot (a long camera move) can take the minimum over several frames (the tool does).

import type {EdgeHints} from './shared';

export const EDGE_HINTS: Record<string, EdgeHints> = {
  // EdgeLab shots (src/dev/EdgeLab.tsx), measured on review/edges/loose/final/stills/clean_*.png (+ the street clip)
  'edgelab/street': {
    ink: {tl: 0.92, tr: 1, br: 0.02, bl: 0.39, left: 1, right: 1, bottom: 0.11},
    keep: [
      [319, 1467, 594, 1845], // the mascot (whole clip) + the ground under it
      [0, 980, 175, 1920], // the coat figure walking at the left frame edge
    ],
  },
  'edgelab/monument': {
    ink: {tl: 0.04, tr: 0.04, br: 1, bl: 1, left: 0.7, right: 0.91, bottom: 1},
    keep: [
      [64, 1337, 244, 1601], // the mascot on its pillar
      [0, 1335, 80, 1445], // the lamp + halo at the left frame edge
      [745, 1590, 1080, 1920], // the foreground head (bottom right)
    ],
  },
  'edgelab/vista': {
    ink: {tl: 0, tr: 0, br: 1, bl: 0.93, left: 0.7, right: 0, bottom: 1},
    keep: [
      [645, 1667, 824, 1907], // the mascot on the parapet
      [0, 1555, 360, 1920], // the foreground hero (bottom left)
    ],
  },
};
