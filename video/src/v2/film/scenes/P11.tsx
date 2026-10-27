// P11 (lane L4-pages): INSERT, 28.20-33.08 ('But Google says it follows its AI principles, and bans retaliation "of any
// kind".'). ONE idea: Google's side, equal weight. Google's page at the deal page's size, position, ground and tone: the
// SAME cold set, page box, framing, breathing and life as P9 (P9_page.tsx; the official's hand slides a document in at
// 1.2 s, as in P9). GOOGLE SAYS (hand-lettered, never a logo): "it follows its / AI principles"; "staff can safely /
// raise concerns" (a paraphrase: no quote marks); "bans retaliation / "of any kind"" (that quote in quote marks).
// Pencil underlines read along on "principles" (30.04) and "bans" (30.76), on the pencil sounds. HOLD.
// Credit (Film2): "Statement to the BBC, 21 Oct 2026".
import React from 'react';
import type {ToneKey} from '../../../lib/Film';
import {ColdInsert, GoogleWords, INSERT_Z} from './P9_page';

const DUR = 33.08 - 28.2;

const P11: React.FC = () => (
  <ColdInsert z={INSERT_Z} breathe={DUR} slide={1.2}>
    <GoogleWords underlines={[[30.04 - 28.2, 0.3], [30.76 - 28.2, 0.4]]} />
  </ColdInsert>
);
export default P11;

/** White captions on the violet desk (4.6:1; ink only 3.6:1). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
