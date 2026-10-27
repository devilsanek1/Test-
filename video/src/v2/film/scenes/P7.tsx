// P7 (lane L4-pages): INSERT, cold, 20.52-21.32 ("In April,"). ONE idea: in April, a deal. A hard cut out of her warm
// room onto THE COLD SET (P9_page.tsx: the official desk at dusk from straight above, edge to edge; the same set, page
// box and framing as P9 and P11; the official at our edge of the desk types): the signed DEAL page (its typed body, two signatures) and an APRIL 2026 stamp slamming
// on "April" (it lands on the stamp sound, 20.76). HOLD (breathing 1.5 %); the world keeps living (the window light with a cloud's shadow,
// a passer-by's shadow and a branch swaying in it, the lamp's dust motes, the coffee's steam, the smartphone, the pen,
// the page corner in the draft, the water glass jumping on the slam). No cat, no Google lettering, no figures.
// Credit (Film2's tab): "Source: The Information via Japan Times, 28 Apr 2026".
import React from 'react';
import type {ToneKey} from '../../../lib/Film';
import {ColdInsert, INSERT_Z, InsertStamp, SignedDealWords, X, Y} from './P9_page';

/** The stamp sound is at 20.76 (t 0.24): the slam starts 0.09 s earlier so it LANDS on it. */
const SLAM = 0.24 - 0.09;
const DUR = 21.32 - 20.52;

const P7: React.FC = () => (
  <ColdInsert z={INSERT_Z} breathe={DUR} kicks={[SLAM]} over={<InsertStamp x={X(318)} y={Y(58)} w={250} text="APRIL 2026" at={SLAM} />}>
    <SignedDealWords />
  </ColdInsert>
);
export default P7;

/** White captions on the violet desk (4.6:1; ink only 3.6:1): the band holds only the flat desk. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
