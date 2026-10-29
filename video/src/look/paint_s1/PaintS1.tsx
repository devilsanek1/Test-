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

export {POSTER_S1_FPS as PAINT_S1_FPS, POSTER_S1_FRAMES as PAINT_S1_FRAMES} from './PosterS1';

export type PaintS1Props = Omit<PosterS1Props, 'preset'> & {
  /** The paint pass on (default) or off (v2's flat S1). */
  paint?: boolean;
  /** Which painted pieces (default all): a subset for A/Bs. */
  pieces?: string[];
  /** Which bake (paint_set.ts): 'v1' (default), 'v2' (the bolder dose), 'v3' (the broad brush, a layered sky). */
  set?: PaintSetName;
};

export const PaintS1: React.FC<PaintS1Props> = ({paint = true, pieces, set = 'v1', ...rest}) => (
  <PaintProvider on={paint} only={pieces} set={PAINT_SETS[set]}>
    <PosterS1 preset="v2" audio="none" {...rest} />
  </PaintProvider>
);
