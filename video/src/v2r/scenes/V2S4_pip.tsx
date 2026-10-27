// V2S4_pip.tsx (lane L3, V2S4 STORY part): Pip (TREATMENT §3 "Pip per shot"; map.ts PIP V2S4, MATCHES; plan_L3 §1d;
// V2S4_rig S4_PIP). Everything in WORLD px inside the push camera (the push is 1.00 until 18.40).
//   14.86  the in-leap from the upper right is mid-air at the cut at (580, 1000), descending down-left, LEFT of her
//   14.95  lands on the boat roof (470, 1218): squash, the ears flop
//   15.15  rides the roof (bob + roll), the scarf streaming east in the wind of the truck; it watches her, and its head
//          lifts to read the tag as each build pens on (one smooth gaze path: the kit resets a head turn when a target
//          is swapped, so the gaze is ONE function of time)
//   17.96  the boat stops with us: the wind drops to the canal breeze
//   19.55  "heading": turns WEST (facing left) and looks up at the sun: its ONE reaction (the side look fades out as it
//          turns side-on, so nothing snaps)
//   20.25  leaps toward the sun (crouch from 20.13); mid-air at the cut (20.55) at (290, 717) world = (292, 721) on
//          screen, its body over the sun's lower right, ears below y 556, the arc at y >= 600. The plates are drawn
//          ABOVE Pip (V2S4.tsx), so the leap passes behind them and never covers their lettering; it never crosses her.
// Its idle (blink, ears, breathing, tuft, tail, scarf) never stops.
import React from 'react';
import {PipTrack} from '../kit/pip';
import {S4_BEATS, S4_HER_HEAD, S4_PIP} from './V2S4_rig';

type XY = [number, number];

const HEAD: XY = [S4_HER_HEAD.x, S4_HER_HEAD.y];
/** Where Pip reads the tag: the name line (build 1) and the new lines (build 2). */
const TAG1: XY = [700, 648];
const TAG2: XY = [700, 812];
/** The sun it turns to on "heading" (world px at the pose; the camera's anchor). */
const SUN: XY = [250, 650];

const sm = (u: number) => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};
const mix = (a: XY, b: XY, k: number): XY => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/** Pip's gaze (a screen point as a function of film t): her head, the tag as it pens on, her again, the sun. */
export function s4PipGaze(t: number): XY {
  const segs: [number, number, XY, XY][] = [
    [15.1, 0.22, HEAD, TAG1],
    [15.62, 0.3, TAG1, HEAD],
    [16.64, 0.22, HEAD, TAG2],
    [17.2, 0.3, TAG2, HEAD],
    [S4_BEATS.pipTurnWest, 0.3, HEAD, SUN],
  ];
  let p = HEAD;
  for (const [t0, d, a, b] of segs) {
    if (t < t0) break;
    p = mix(a, b, sm((t - t0) / d));
  }
  return p;
}

export const S4Pip: React.FC = () => (
  <PipTrack
    x={S4_PIP.inLeap.from[0]}
    y={S4_PIP.inLeap.from[1]}
    size={S4_PIP.size}
    facing="back"
    seed="s4pip"
    keys={[
      {t: S4_PIP.inLeap.t0, hop: {to: S4_PIP.seat, dur: S4_PIP.inLeap.dur, height: S4_PIP.inLeap.height, style: 'leap'}},
      {t: S4_BEATS.pipLand + 0.2, ride: {amp: 1.6, rate: 0.55}, target: s4PipGaze, wind: 1, dur: 0.35},
      {t: S4_BEATS.stop, wind: 0.3, dur: 0.7},
      {t: S4_BEATS.pipTurnWest, facing: 'left', dur: 0.3},
      {t: S4_PIP.outLeap.t0, ride: null, hop: {to: S4_PIP.outLeap.to, dur: S4_PIP.outLeap.dur, height: S4_PIP.outLeap.height, style: 'leap'}},
    ]}
  />
);
