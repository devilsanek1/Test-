// v7's painted set (scripts/look/paint/v2s1_v7.json -> paint.py -> public/paint/v2s1_v7/manifest.json): v6's recipe-book
// pieces re-keyed at the source for T3 (the sky deepening to its top, the dark cloud lit on the sun's side, the calm far
// planes, the canal painted on v7's own design frame). The tree is not in it (cut: R6).
import {paintSet} from '../../lib/paint';
import m7 from '../../../public/paint/v2s1_v7/manifest.json';
import {PAINT_SETS} from '../paint_s1/paint_set';

type Manifest = Parameters<typeof paintSet>[0];
export const PAINT_V7 = paintSet(m7 as unknown as Manifest);
/** v6's set (look 'cut': step 4 alone, on v6's painting), without its tree (cut). */
export const PAINT_V6_CUT = Object.fromEntries(Object.entries(PAINT_SETS.v6).filter(([k]) => k !== 'tree')) as typeof PAINT_SETS.v6;
