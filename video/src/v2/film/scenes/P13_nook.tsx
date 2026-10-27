// P13_nook (lane L2-nook): helpers shared by the seated nook panels P4 (m14) and P13 (m12).
//   RodCover    a LOCAL WORKAROUND for a kit defect: in the zoomed layouts the curtain rod (world y 586) and the
//               window recess's top ink line (world y 600) land inside the caption band (screen y ~365 / 384 in P4,
//               ~512 / 529 in P13), right on the caption lines: the rod reads as a strike-through, the top line as an
//               underline cutting the descenders. The curtain itself is off-screen in both (world x >= 990), so both
//               are painted out with the wall they sit on; the recess keeps its value step (wall -> shade -> trim ->
//               blind), a calm band. Pass it as the FIRST child of <NookRoom> (nook world px). Reported to the kit
//               (REQUESTS: a `rod` / band-safe window top on NookRoom for m12 / m14).
//   bubbleTail  the bubble's tail tip: just above and in front of her face (it points at her mouth from above and
//               never crosses her head or face).
import React from 'react';
import {CC, Fill, NOOK, nookPt, type NookLayoutName, type Pt} from '../kit';

export const RodCover: React.FC = () => {
  const N = NOOK.window;
  const R = NOOK.rod;
  return (
    <Fill rect={[NOOK.bookcase.x1 + NOOK.bookcase.side + 2, R.y - 24, 1400, N.top - (R.y - 24) + 2.2]} color={CC.wall} offset={false} />
  );
};

/** The tail tip in screen px for her seated head (kit HerSeated side view, NOOK.herSeat) in a zoomed layout. */
export const bubbleTail = (layout: NookLayoutName): Pt => {
  const H = NOOK.herSeat;
  const r = 0.09 * H.h;
  // the head centre (HerSeated: x + 0.04 h, y - 0.755 h), then above and in front of the face
  const p: Pt = [H.x + 0.04 * H.h + 0.95 * r, H.y - 0.755 * H.h - 1.25 * r];
  return nookPt(layout, p);
};
