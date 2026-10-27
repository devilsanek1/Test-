// P9 (lane L4-pages): INSERT close, straight-on, 23.80-25.96 ('for "any lawful government purpose".'): the scale cut
// back in from P8's wide. ONE idea: the deal's words, and its oversight clause in full. THE COLD SET (P9_page.tsx) at
// the insert framing: the deal page, DEAL; block 1 "any lawful government purpose" (big, in quote marks); a rule;
// block 2 "should not be used for domestic mass surveillance or autonomous weapons (including target selection) without
// appropriate human oversight and control" (smaller, in quote marks, never cut). HOLD (breathing 1.5 %); the desk keeps
// living around the page, never on its words; the official's hand slides a document onto the left pile (1.2 s, the same
// as P11: both pages get the same set and life). No Google lettering. Credit (Film2): "Source: BBC News, 21 Oct 2026".
import React from 'react';
import type {ToneKey} from '../../../lib/Film';
import {ColdInsert, DealWords, INSERT_Z} from './P9_page';

const DUR = 25.96 - 23.8;

const P9: React.FC = () => (
  <ColdInsert z={INSERT_Z} breathe={DUR} slide={1.2}>
    <DealWords />
  </ColdInsert>
);
export default P9;

/** White captions on the violet desk (4.6:1; ink only 3.6:1). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
