// P13_nook (lane L2-nook): helpers shared by the nook panels P2 (wide), P4 (m14) and P13 (m12).
//   RodCover    a LOCAL WORKAROUND for a kit defect: in the zoomed layouts the curtain rod (world y 586) and the
//               window recess's top ink line (world y 600) land inside the caption band (screen y ~365 / 384 in P4,
//               ~512 / 529 in P13), right on the caption lines: the rod reads as a strike-through, the top line as an
//               underline cutting the descenders. The curtain itself is off-screen in both (world x >= 990), so both
//               are painted out with the wall they sit on; the recess keeps its value step (wall -> shade -> trim ->
//               blind), a calm band. Pass it as the FIRST child of <NookRoom> (nook world px). Reported to the kit
//               (REQUESTS: a `rod` / band-safe window top on NookRoom for m12 / m14).
//   BandCover14 P4's version (m14, the AD's fix round): the board has plain wall in P4's band with the glass starting
//               at its lower edge, so the rod, its finial, the recess top, the blind and its bar are painted out with
//               the wall down to the blind bar's foot (world 746 = screen ~589); a lintel line closes the recess there
//               and the clock (world 218, 676) stays whole. First child of <NookRoom layout="m14">.
//   RodClip     the loop seam (P13): while the room un-builds, RodCover's rect is clipped out of the whole room, so
//               the rod and its finial can never strike through the words when the cover's fill leaves first; with
//               `band` (from the loop roll on, when the frame-0 words land) the whole caption band is clipped out, so
//               the nook's last retracting lines never cross the frame-0 words.
//   SecondHand  a LOCAL overlay for a kit defect: WallClock's ticking second hand is a hair line that does not read
//               at phone size; this one ticks with it (same angle, 1 Hz) at ~3 screen px. NookRoom child (world px).
//   Float       the bubble's float after its pop: a slow 0.5 Hz breath about the tail tip (the tail stays at her
//               mouth), 1.5 % scale and 0.7 deg, ramped in so the pop lands clean.
//   bubbleTail  the bubble's tail tip: just above and in front of her face (it points at her mouth from above and
//               never crosses her head or face).
import React from 'react';
import {ease, prog, useTime} from '../../../lib/time';
import {useInkScale} from '../../../lib/inkComp';
import {mat, XG} from '../../../lib/xf';
import {CC, Fill, Ink, Live, NOOK, nookPt, W, type NookLayoutName, type Pt} from '../kit';

/** RodCover's rect (nook world px): from the bookcase's side to past the right edge, the rod (586) to the recess top. */
export const rodCoverRect = (): [number, number, number, number] => {
  const R = NOOK.rod;
  const x0 = NOOK.bookcase.x1 + NOOK.bookcase.side + 2;
  return [x0, R.y - 24, 1400, NOOK.window.top - (R.y - 24) + 2.2];
};

export const RodCover: React.FC = () => <Fill rect={rodCoverRect()} color={CC.wall} offset={false} />;

/** P4 (m14): plain wall in the caption band, the glass starting at its lower edge (see the header). */
export const BandCover14: React.FC = () => {
  const N = NOOK.window;
  const top = NOOK.rod.y - 24;
  const x0 = NOOK.bookcase.x1 + NOOK.bookcase.side + 2;
  // the strip between the bookcase and the window: only down to above the clock (its rim starts at world y 640)
  const stripY = 632;
  // the blind bar's foot: the glass (and the fold shadow under the bar) starts here
  const foot = 746;
  const xs = N.x0 - 3;
  const d = `M${x0} ${top}H1400V${foot}H${xs}V${stripY}H${x0}Z`;
  return (
    <>
      <Fill d={d} color={CC.wall} offset={false} />
      {/* the lintel: the recess's top edge, now at the band's lower edge */}
      <Ink d={`M${N.x0 - 2} ${foot}L${N.x1 + 2} ${foot}`} width={W.mid} />
    </>
  );
};

/** The seam clip (screen px of the layout): the whole frame minus RodCover's rect. Put the returned <defs> and the
 *  clip-path id on a <g> around the room while it un-builds. */
export const RodClip: React.FC<{layout: NookLayoutName; id: string; band?: [number, number]}> = ({layout, id, band}) => {
  const [x, y, w, h] = rodCoverRect();
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

/** The clock's second hand, readable at phone size (kit WallClock: centre (NOOK.strip.x, 676), r 36, sec = t + 17). */
export const SecondHand: React.FC<{cx?: number; cy?: number; r?: number}> = ({cx = NOOK.strip.x, cy = 676, r = 36}) => {
  const t = useTime();
  const k = useInkScale();
  const sec = Math.floor(Math.max(0, t) + 1e-6) + 17;
  const a = (((sec % 60) * 6 - 90) * Math.PI) / 180;
  const len = r * 0.72;
  return (
    <Live c={[cx, cy]}>
      <path d={`M${cx - Math.cos(a) * r * 0.16} ${cy - Math.sin(a) * r * 0.16}L${cx + Math.cos(a) * len} ${cy + Math.sin(a) * len}`} stroke={CC.trim} strokeWidth={3 * k} strokeLinecap="round" fill="none" />
      <circle cx={cx} cy={cy} r={3.4 * k} fill={CC.anchor} />
    </Live>
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
