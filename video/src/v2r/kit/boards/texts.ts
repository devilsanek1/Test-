// boards/texts.ts: every word the film writes on an object (TREATMENT.md section 5 "Texts on objects", section 8),
// in ONE place, exactly as the treatment words them, with the line breaks checked against the caption font (Patrick
// Hand) at the type scale's sizes (type.ts). Quote marks only on exact words (V6); US spelling everywhere except inside
// her quote ("criticising", A7). Lanes import these; nobody retypes a board line.
// FEW AND BIG (REVIEW_1 MUST 3, 2026-10-28; owner playbook: "Words in the world are few and big ... No small source
// lines, quotes or fine print in the picture"): the film draws ONLY the lines marked DRAWN below, each >= 44 px on
// screen. The rest (sources, the S6 clause, the tag's role rows, Google's small row) is kept here as the record and
// lives in the post caption and the pinned comment (docs/v2/POSTING_KIT.md); it is never drawn in the film.

/** S2: the newsstand A-board (lane L2; face S2.aBoard x 110-510, y 1050-1250; slid out at 8.44). DRAWN: `quote` alone
 *  (the BBC's words for the unnamed staffer), two rows at 56 px; the caption says "told the BBC" itself, so the old
 *  header is not drawn (never the same words twice). Not drawn: header, body, credit. */
export const TXT_TOLD_THE_BBC = {
  quote: ['“for fear of', 'retaliation”'],
  header: 'TOLD THE BBC',
  body: ['One current staffer stayed unnamed,', '“for fear of retaliation”'],
  credit: 'Source: BBC News, 21 Oct 2026',
} as const;

/** S4: her name tag (lane L3; two builds 15.07 / 16.60, pops off 18.80). DRAWN: `name` (build 1, 48 px) and `lab`
 *  (build 2, 44 px). Not drawn: role, more, credit (the post carries them). */
export const TXT_NAME_TAG = {
  name: 'Sofia Liguori',
  lab: 'Google DeepMind',
  role: ['research engineer,', 'Google DeepMind', '(Google’s AI lab)'],
  more: ['3 years ·', 'resigned Oct 2026'],
  credit: 'Source: BBC News, 21 Oct 2026',
} as const;

/** S4: the fingerpost's two plates (lane L3), top-to-bottom = time order, both pointing WEST. DRAWN: `key` + `short`
 *  on one row ("DEC 2025 · unclassified", key 52 / short 44 px). Not drawn: body, credit (the post carries them). */
export const TXT_PLATES = {
  dec: {key: 'DEC 2025', short: '· unclassified', body: 'unclassified work', credit: 'Gemini on the Pentagon’s GenAI.mil · Fox Business; Decrypt'},
  apr: {key: 'APR 2026', short: '· classified', body: 'classified work', credit: 'reported by The Information via Japan Times; 9to5Google'},
} as const;

/** S5: the newspaper box (lane L4; no masthead) and the plaque at 22.43. DRAWN: the news box's `headline44` (four rows
 *  at 44 px: the 276-unit page holds "Google–Pentagon" only under 44) and the plaque's `key` (56 px). Not drawn: the
 *  box's credit, the 3-row `headline`, the plaque's 30 px `body`. */
export const TXT_NEWS_BOX = {
  headline44: ['Google–', 'Pentagon', 'deal for', 'classified work'],
  headline: ['Google–Pentagon', 'deal for', 'classified work'],
  credit: ['Reported Apr 2026 · The Information', 'via Japan Times; 9to5Google'],
} as const;
export const TXT_PLAQUE = {key: 'The Pentagon', body: 'US Department of Defense'} as const;

/** S6: the deal board (lane L5). No party named in a header, no "Google" anywhere in the frame (V2). DRAWN: `tag` (44),
 *  `purpose` (56) and `f12` (44, as `f12Rows`). Not drawn: the F11 clause and the credit: the clause's point (the deal's
 *  own stated limits) goes to the post caption and the pinned comment with the source (REVIEW_1 MUST 3: it stopped the
 *  cold read and half-contradicted the voice); V9's "the full clause with the purpose line" is retired with it. */
export const TXT_DEAL = {
  tag: 'APRIL 2026 DEAL',
  purpose: ['“any lawful', 'government purpose”'],
  clause: ['“should not be used for domestic', 'mass surveillance or autonomous', 'weapons (including target', 'selection) without appropriate', 'human oversight and control”'],
  f12: 'Lawful use: decided by the Pentagon',
  f12Rows: ['Lawful use: decided', 'by the Pentagon'],
  credit: 'Reported Apr 2026 · BBC; Japan Times; Android Authority',
} as const;

/** S7: Google's board (lane L5). DRAWN: header (60), follows / bans (44), principles / anyKind (56). Not drawn: the small
 *  row and the credit (the post carries them). */
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
 *  only inside her quote (A7). DRAWN: header (60) and her quote (60: the board's width, the payoff). Not drawn: the
 *  credit (the post carries it). */
export const TXT_HER = {
  header: 'SHE SAYS',
  quote: ['“talking about facts', 'is not criticising”'],
  credit: ['Sofia Liguori to the BBC', 'Source: BBC News, 21 Oct 2026'],
} as const;

/** S6: the service door's plate (DoorSign is here for any other door; the dc kit's own plate draws NO letters since
 *  REVIEW_1 MUST 3: 20 / 11 px). "classified", never "secret" (V10); US spelling (A7). */
export const TXT_SERVICE_DOOR = ['CLASSIFIED', 'AUTHORIZED', 'PERSONNEL ONLY'] as const;
