// V2S7_board.tsx (lane L5): Google's board at B for V2S7 (TREATMENT section 5 "Texts on objects", S7; section 8 A5,
// V14): K3's GoogleBoard, TIER A for the whole shot (`tier="subject"`: its frame outline returns at 3.0 px in its own
// shade, the beat's one full outline). Face = map B (x 150-630, y 700-1220), legs to B_LEGS_Y1.
// The clock: V2S7 starts at 28.10 (S7_T0), while K3's GOOGLE_T defaults were authored from the old 28.06 start, so
// `t0={-0.04}` keeps every pen beat on its FILM time (follows its "AI principles" 29.65-30.04, complete ON
// "principles"; the small row 30.30; bans retaliation "of any kind" 30.74-32.08, complete ON "of"). The GOOGLE SAYS
// header, the credit and the clack land at local 0.23 = film 28.33 (28.32-28.34: after the join window, leading
// "Google" 28.36). The same face, frame, type, light and shadow as the deal board (S6) and hers (S8): nothing here
// overrides K3's look, so the three boards stay equal (A5).
// `shadow`: false once V2S7_light draws the rig's own contact + cast shadows (never both: no doubled shadow).
// FEW AND BIG (REVIEW_1 MUST 3): the face 480 x 420 (B since MUST 4), the header and Google's words as heard at 44 / 56
// px; no small row, no credit (the post carries them). The caption steps aside while the board writes (pages 19-21
// `@hide`). The BLANK face (28.10-29.65, before the pen) sits a half value step down (REVIEW_1 SHOULD 2: it was the
// brightest thing in the frame) and eases up to the full face as the pen starts (29.65-29.95).
import React from 'react';
import {GoogleBoard, GOOGLE_T} from '../kit/boards';

/** Local time (s from S7_T0 = 28.10) the header, the credit and the clack land: film 28.33. */
export const S7_BOARD_HEADER_AT = 0.23;
/** The board's clock offset (K3's GOOGLE_T was authored from a 28.06 start). */
const T0 = -0.04;
/** The blank face's step: half the deal / her board's step (L* ~92 vs 96), until the pen starts (local 1.55 = 29.65). */
export const S7_BOARD_DIM = {k: 0.5, until: T0 + GOOGLE_T.follows[0], dur: 0.3} as const;

export const S7Board: React.FC<{shadow?: boolean}> = ({shadow = true}) => (
  <GoogleBoard tier="subject" t0={T0} headerAt={S7_BOARD_HEADER_AT} creditAt={S7_BOARD_HEADER_AT} clackAt={S7_BOARD_HEADER_AT} shadow={shadow ? undefined : false} dim={S7_BOARD_DIM} />
);
