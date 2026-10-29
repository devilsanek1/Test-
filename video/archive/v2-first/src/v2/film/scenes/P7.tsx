// P7 (lane L4-pages): INSERT, cold, 20.52-21.32 ("In April,"). ONE idea: in April, a deal. A hard cut out of her warm
// room onto THE COLD SET (P9_page.tsx: the official desk at dusk from straight above, edge to edge; the same set, page
// box, header and framing as P9 and P11; the official at our edge of the desk takes notes): the signed DEAL page (the
// shared DEAL header, its typed body, two signatures in two different hands) and an APRIL 2026 stamp slamming on "April"
// at the top right under the header (it lands on the stamp sound, 20.76; paper-backed, so it covers the rows under it).
// HOLD (the camera locked); the world keeps living (the window light with a cloud's shadow, a passer-by's shadow and a
// branch swaying in it, the lamp's dust motes, the coffee's steam, the smartphone, the phone's line lights, the pen,
// the official's notes, the page corner in the draft, the water glass jumping on the slam). No cat, no Google
// lettering, never a face.
// Credit (Film2's tab): "Source: The Information via Japan Times, 28 Apr 2026".
import React from 'react';
import type {ToneKey} from '../../../lib/Film';
import {ColdInsert, INSERT_Z, InsertStamp, SignedDealWords, X, Y} from './P9_page';

/** The stamp sound is at 20.76 (t 0.24): the slam starts 0.09 s earlier so it LANDS on it. */
const SLAM = 0.24 - 0.09;

const P7: React.FC = () => (
  <ColdInsert z={INSERT_Z} from={20.52} kicks={[SLAM]} over={<InsertStamp x={X(318)} y={Y(124)} w={240} text="APRIL 2026" at={SLAM} backing="plain" />}>
    <SignedDealWords />
  </ColdInsert>
);
export default P7;

/** White captions on the violet desk (4.6:1; ink only 3.6:1): the band holds only the flat desk. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
