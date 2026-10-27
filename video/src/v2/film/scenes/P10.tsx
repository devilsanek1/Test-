// P10 (lane L4-pages): INSERT pulled back, 25.96-28.20 ("Google can't veto how it's used."). ONE idea: Google gets no
// veto. The same deal page on the same set (P9_page.tsx), the cut to 0.85x of P9 about the page centre (both blocks
// whole, more of the official desk around it), and the NO VETO stamp (the subject, ~316 px on screen) slamming on
// "veto": it lands on the stamp sound (26.70) across the page's top edge, over the DEAL heading, beside block 1 and clear
// of block 2 (fairness: NO VETO only beside block 1; block 1 never without block 2). The water glass jumps on the slam.
// HOLD (breathing 1.5 %); the official's hand slides a document in at 1.3 s, after the stamp has settled.
// No Google lettering. Credit (Film2): "Sources: BBC News, 21 Oct 2026 · The Information via Japan Times, 28 Apr 2026".
import React from 'react';
import type {ToneKey} from '../../../lib/Film';
import {ColdInsert, DealWords, InsertStamp, P10_Z, X, Y} from './P9_page';

const DUR = 28.2 - 25.96;
/** The stamp sound is at 26.70 (t 0.74): the slam starts 0.09 s earlier so it LANDS on it. */
const SLAM = 0.74 - 0.09;

const P10: React.FC = () => (
  <ColdInsert z={P10_Z} breathe={DUR} slide={1.3} kicks={[SLAM]} over={<InsertStamp x={X(233.5)} y={Y(18)} w={310} text="NO VETO" at={SLAM} backing />}>
    <DealWords />
  </ColdInsert>
);
export default P10;

/** White captions on the violet desk (4.6:1; ink only 3.6:1). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
