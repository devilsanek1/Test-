// P13_nook (lane L2-nook): helpers shared by the nook panels P4 (m14) and P13 (m12). (RodCover, BandCover14 and
// SecondHand were folded back into the kit by the assembler: NookRoom `rod={false}` / `bandTop`, WallClock.)
//   RodClip     the loop seam (P13): while the room un-builds, the kit's rod-cover rect (nookRodCoverRect) is clipped
//               out of the whole room, so the rod and its finial can never strike through the words when the cover's
//               fill leaves first; with `band` (from the loop roll on, when the frame-0 words land) the whole caption
//               band is clipped out, so the nook's last retracting lines never cross the frame-0 words.
//   Float       the bubble's float after its pop: a slow 0.5 Hz breath about the tail tip (the tail stays at her
//               mouth), 1.5 % scale and 0.7 deg, ramped in so the pop lands clean.
//   bubbleTail  the bubble's tail tip: just above and in front of her face (it points at her mouth from above and
//               never crosses her head or face).
import React from 'react';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {NOOK, nookPt, nookRodCoverRect, type NookLayoutName, type Pt} from '../kit';

/** The seam clip (screen px of the layout): the whole frame minus RodCover's rect. Put the returned <defs> and the
 *  clip-path id on a <g> around the room while it un-builds. */
export const RodClip: React.FC<{layout: NookLayoutName; id: string; band?: [number, number]}> = ({layout, id, band}) => {
  const [x, y, w, h] = nookRodCoverRect();
  const a = nookPt(layout, [x, y]);
  const z = nookPt(layout, [x + w, y + h]);
  // the rod's ends go loose (+~30 %) in an un-build: the hole reaches left over the bookcase's niche line too
  const x0 = Math.min(a[0], 96);
  const hole = band ? `M-600 ${band[0]}H1700V${band[1]}H-600Z` : `M${x0} ${a[1] - 2}H${z[0]}V${z[1] + 2}H${x0}Z`;
  const d = `M-600 -600H1700V2600H-600Z ${hole}`;
  return (
    <defs>
      <clipPath id={id} clipPathUnits="userSpaceOnUse">
        <path d={d} clipRule="evenodd" />
      </clipPath>
    </defs>
  );
};

/** The bubble's float after its pop (scene s `from`): 0.5 Hz about the tail tip, 1.5 % scale, 0.7 deg. */
export const Float: React.FC<{from: number; tail: Pt; children?: React.ReactNode}> = ({from, tail, children}) => {
  const t = useTime();
  if (t <= from) return <>{children}</>;
  const ramp = prog(t, from, 0.5, ease.inOutSine);
  const ph = 2 * Math.PI * 0.5 * (t - from);
  const s = 1 + 0.015 * ramp * Math.sin(ph);
  const rot = 0.7 * ramp * Math.sin(ph + Math.PI / 2);
  return <XG m={mat.about(mat.mul(mat.rotate(rot), mat.scale(s)), tail[0], tail[1])}>{children}</XG>;
};

/** The tail tip in screen px for her seated head (kit HerSeated side view, NOOK.herSeat) in a zoomed layout. */
export const bubbleTail = (layout: NookLayoutName): Pt => {
  const H = NOOK.herSeat;
  const r = 0.09 * H.h;
  // the head centre (HerSeated: x + 0.04 h, y - 0.755 h), then above and in front of the face
  const p: Pt = [H.x + 0.04 * H.h + 0.95 * r, H.y - 0.755 * H.h - 1.25 * r];
  return nookPt(layout, p);
};
