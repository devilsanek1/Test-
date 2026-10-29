// The painted-pieces look test (owner, 2026-10-29: "I really like the “painted” pieces like the sky and the clouds ...
// Is it possible to modify our engine to match the [style]"; playbook PAINTED PIECES; notes and the API:
// docs/studies/2026-10-28_city_posters/paint_test/NOTES.md). v2's shipped S1 exactly (this folder is a copy of
// src/look/poster_s1 with every switch off: the 'v2' preset), with the engine's paint pass (src/lib/paint) on three
// chosen pieces: the sky and its clouds, the bay tree, the stone pier. Each painted piece replaces its flat shapes IN
// ITS OWN SLOT (its plane's group), so it rides that plane's float; the subject, the people, the captions and Pip are
// never painted. `paint: false` = v2's S1 (the film works with the paint off).
import React from 'react';
import {PaintProvider} from '../../lib/paint';
import {PosterS1, type PosterS1Props} from './PosterS1';
import {PAINT_SETS, type PaintSetName} from './paint_set';
import {DuskProvider} from './dusk';

export {POSTER_S1_FPS as PAINT_S1_FPS, POSTER_S1_FRAMES as PAINT_S1_FRAMES} from './PosterS1';

export type PaintS1Props = Omit<PosterS1Props, 'preset'> & {
  /** The paint pass on (default) or off (v2's flat S1). */
  paint?: boolean;
  /** Which painted pieces (default all): a subset for A/Bs. */
  pieces?: string[];
  /** Which bake (paint_set.ts): 'v1' (default), 'v2' (the bolder dose), 'v3' (the broad brush, a layered sky), 'v4design' (v4's flat designed shapes), 'v4' (them painted), 'v5' (v4 redesigned, one evening light for the whole scene). */
  set?: PaintSetName;
  /** The opening's PAINT-ON as a still (lib/paint reveal.tsx; owner: "would it literally just popup?"): the overall
   *  progress 0..1, 0 = our flat design, 1 = painted, each piece in S1_REVEAL_WINDOWS's order ('ai1': ai_paint/NOTES.md).
   *  Absent = no reveal. */
  reveal?: number;
  /** What lies under a piece while it paints on (default 'v4design': our flat design). */
  revealUnder?: PaintSetName;
};

/** S1's painting order for the reveal: the sky washes first (the sky, then the cloud planes far to near), then the far
 *  haze, then the tree; each piece's window inside the overall progress 0..1. */
export const S1_REVEAL_WINDOWS = {
  sky: [0, 0.42], clouds_p0: [0.08, 0.3], clouds_p1: [0.14, 0.36], clouds_p2: [0.22, 0.46], clouds_p3: [0.3, 0.56],
  farroofs: [0.5, 0.74], fartower: [0.54, 0.78], tree: [0.58, 1],
} as const;

export const PaintS1: React.FC<PaintS1Props> = ({paint = true, pieces, set = 'v1', reveal, revealUnder = 'v4design', ...rest}) => (
  <PaintProvider
    on={paint}
    only={pieces}
    set={PAINT_SETS[set]}
    reveal={reveal === undefined ? undefined : {progress: reveal, windows: S1_REVEAL_WINDOWS, under: PAINT_SETS[revealUnder]}}
  >
    {/* (v5) one evening light for the whole scene: water, paving, facade (dusk.tsx) */}
    <DuskProvider on={paint && set === 'v5'}>
      <PosterS1 preset="v2" audio="none" {...rest} />
    </DuskProvider>
  </PaintProvider>
);
