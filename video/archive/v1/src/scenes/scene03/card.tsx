// S03's title-block card (labels L3 -> L4), fix round 3 (finding: the card was cream on the cream plan with the grid and
// the frame band running into its border, so it read as text printed on the floor, and its left edge sat ~7 px from the
// stamp print's tip and Pip's rump):
//   - the label spec's look: WHITE paper (palette.white, not the plan's cream) over a TAN copy of the same card offset
//     3 px down-right (the misregistered offset fill), so it reads as a card lying ON the plan;
//   - the plan is knocked out round it (ground.tsx KNOCK: no grid / frame band line enters a 14 px margin);
//   - 8 px right of the set's BLUEPRINT.titleBlock (screen x 491-928 at the 1.04 lock; the tan offset ends at ~931) while
//     the stamp and Pip moved 22 px left (stamp.tsx STAMP, cast.tsx PIP_AT): >= 30 px clear of both.
// The tan backing is a second LabelTag with the SAME seed (same tilt, same pop and paper flip, so it moves as one card),
// tan paper, tan text and a hair outline, translated (3, 3) under the white card.

import React from 'react';
import {palette} from '../../lib/theme';
import {mat, XG} from '../../lib/xf';
import {BLUEPRINT} from '../shared/sets';
import {LabelTag} from '../shared/props';

const [bx0, by0, bx1, by1] = BLUEPRINT.titleBlock;
/** The card's paper in world px: BLUEPRINT.titleBlock moved 8 px right ([498, 1320, 918, 1440]). */
export const CARD_BOX: [number, number, number, number] = [bx0 + 8, by0, bx1 + 8, by1];

type Lines = string[];

/** L3 popping on the card at `at`, paper-flipping to L4 at `flipAt` (font sizes in WORLD px: on screen x 1.04). */
export const TitleCard: React.FC<{text: Lines; fontSize: number; at: number; flipTo: {at: number; text: Lines; fontSize: number}; seed?: string}> = ({text, fontSize, at, flipTo, seed = 's03/card'}) => (
  <>
    <XG m={mat.translate(3, 3)}>
      <LabelTag kind="card" box={CARD_BOX} text={text} fontSize={fontSize} at={at} flipTo={flipTo} paper={palette.tan} textColor={palette.tan} ink={0.01} seed={seed} />
    </XG>
    <LabelTag kind="card" box={CARD_BOX} text={text} fontSize={fontSize} at={at} flipTo={flipTo} paper={palette.white} seed={seed} />
  </>
);
