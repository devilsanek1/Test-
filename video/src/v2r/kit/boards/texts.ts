// boards/texts.ts: every word the film writes on an object (TREATMENT.md section 5 "Texts on objects", section 8),
// in ONE place, exactly as the treatment words them, with the line breaks checked against the caption font (Patrick
// Hand) at the type scale's sizes (type.ts). Quote marks only on exact words (V6); US spelling everywhere except inside
// her quote ("criticising", A7). Lanes import these; nobody retypes a board line.

/** S2: the newsstand A-board (lane L2; face x 160-560, y 1050-1250; slid out at 8.44). */
export const TXT_TOLD_THE_BBC = {
  header: 'TOLD THE BBC',
  body: ['One current staffer stayed unnamed,', '“for fear of retaliation”'],
  credit: 'Source: BBC News, 21 Oct 2026',
} as const;

/** S4: her name tag (lane L3; two builds 15.07 / 16.60, pops off 18.80). */
export const TXT_NAME_TAG = {
  name: 'Sofia Liguori',
  role: ['research engineer,', 'Google DeepMind', '(Google’s AI lab)'],
  more: ['3 years ·', 'resigned Oct 2026'],
  credit: 'Source: BBC News, 21 Oct 2026',
} as const;

/** S4: the fingerpost's two plates (lane L3), top-to-bottom = time order, both pointing WEST. */
export const TXT_PLATES = {
  dec: {key: 'DEC 2025', body: 'unclassified work', credit: 'Gemini on the Pentagon’s GenAI.mil · Fox Business; Decrypt'},
  apr: {key: 'APR 2026', body: 'classified work', credit: 'reported by The Information via Japan Times; 9to5Google'},
} as const;

/** S5: the newspaper box (lane L4; no masthead) and the plaque at 22.43. */
export const TXT_NEWS_BOX = {
  headline: ['Google–Pentagon', 'deal for', 'classified work'],
  credit: ['Reported Apr 2026 · The Information', 'via Japan Times; 9to5Google'],
} as const;
export const TXT_PLAQUE = {key: 'The Pentagon', body: 'US Department of Defense'} as const;

/** S6: the deal board (lane L5). The FULL F11 clause is always with the purpose line (V9). No party named in a header,
 *  no "Google" anywhere in the frame (V2). */
export const TXT_DEAL = {
  tag: 'APRIL 2026 DEAL',
  purpose: ['“any lawful', 'government purpose”'],
  clause: ['“should not be used for domestic', 'mass surveillance or autonomous', 'weapons (including target', 'selection) without appropriate', 'human oversight and control”'],
  f12: 'Lawful use: decided by the Pentagon',
  credit: 'Reported Apr 2026 · BBC; Japan Times; Android Authority',
} as const;

/** S7: Google's board (lane L5; 22 words). */
export const TXT_GOOGLE = {
  header: 'GOOGLE SAYS',
  follows: 'follows its',
  principles: '“AI principles”',
  small: 'Google’s AI Principles: “human oversight”',
  bans: 'bans retaliation',
  anyKind: '“of any kind”',
  credit: 'Statement to the BBC, 21 Oct 2026',
} as const;

/** S8: her board (lane L6; the cafe boat's quote-of-the-day A-board, the same face as Google's). British spelling
 *  only inside her quote (A7). */
export const TXT_HER = {
  header: 'SHE SAYS',
  quote: ['“talking about facts', 'is not criticising”'],
  credit: ['Sofia Liguori to the BBC', 'Source: BBC News, 21 Oct 2026'],
} as const;

/** S6: the service door's plate (the dc kit draws its own; DoorSign is here for any other door). "classified", never
 *  "secret" (V10); US spelling (A7). */
export const TXT_SERVICE_DOOR = ['CLASSIFIED', 'AUTHORIZED', 'PERSONNEL ONLY'] as const;
