// V2S4_pip.tsx (lane L3, V2S4 STORY part): Pip (conform_L3 §2; map.ts PIP V2S4; V2S4_rig S4_PIP). WORLD px = screen px
// (no camera move: the planes truck themselves; our boat glides with us, screen-fixed, and Pip rides its roof).
//   14.86  already seated on the boat roof (470, 1218) on the first frame (no in-leap), riding it (bob + roll), the scarf
//          streaming east in the wind of the truck; it watches her, and its head lifts to read the tag as each build
//          pens on (one smooth gaze path: the kit resets a head turn when a target is swapped, so the gaze is ONE
//          function of time)
//   17.96  the boat stops with us: the wind drops to the canal breeze
//   18.62  its head turns from her to the post, landing as the DEC plate knocks on "military" (18.92): the watcher
//          leads the eye BEFORE the voice names the thing, then it reads the plates (a head turn, no gesture)
//   19.55  "heading": turns WEST (facing left) and looks up at the sun: its ONE reaction (the side look fades out as it
//          turns side-on, so nothing snaps); it stays seated: the A push-through into SUN1 (20.40-20.70) sweeps it.
// Its idle (blink, ears, breathing, tuft, tail, scarf) never stops.
import React from 'react';
import {CM} from '../palette';
import {Fill} from '../../lib/Fill';
import {useTime} from '../../lib/time';
import {PipTrack, PipTrackProps, trackAt} from '../kit/pip';
import {ovalPath} from '../kit/canal/core';
import {S4_BEATS, S4_HER_HEAD, S4_PIP, S4_START} from './V2S4_rig';

type XY = [number, number];

const HEAD: XY = [S4_HER_HEAD.x, S4_HER_HEAD.y];
/** Where Pip reads the tag: the name line (build 1) and the new lines (build 2). */
const TAG1: XY = [700, 648];
const TAG2: XY = [700, 812];
/** The plates it reads (the DEC socket, then the middle of the two arms) and the sun it turns to on "heading" (world
 *  px at the pose; the sun is the camera's anchor). */
const POST: XY = [560, 805];
const PLATES: XY = [380, 860];
const SUN: XY = [250, 650];

const sm = (u: number) => {
  const c = Math.max(0, Math.min(1, u));
  return c * c * (3 - 2 * c);
};
const mix = (a: XY, b: XY, k: number): XY => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];

/** Pip's gaze (a screen point as a function of film t): her head, the tag as it pens on, her again, the post as the
 *  DEC plate knocks on, along the plates, the sun. */
export function s4PipGaze(t: number): XY {
  const segs: [number, number, XY, XY][] = [
    [15.1, 0.22, HEAD, TAG1],
    [15.62, 0.3, TAG1, HEAD],
    [16.64, 0.22, HEAD, TAG2],
    [17.2, 0.3, TAG2, HEAD],
    [S4_BEATS.decPlate - 0.3, 0.3, HEAD, POST],
    [S4_BEATS.decPlate + 0.2, 0.5, POST, PLATES],
    [S4_BEATS.pipTurnWest, 0.45, PLATES, SUN],
  ];
  let p = HEAD;
  for (const [t0, d, a, b] of segs) {
    if (t < t0) break;
    p = mix(a, b, sm((t - t0) / d));
  }
  return p;
}

/** The whole track (exported so QA / the cut checks can evaluate Pip anywhere with the kit's trackAt). */
export const S4_PIP_TRACK: PipTrackProps = {
  x: S4_PIP.seat[0],
  y: S4_PIP.seat[1],
  size: S4_PIP.size,
  facing: 'back',
  seed: 's4pip',
  keys: [
    // seated and riding before the first frame (fully in by 14.86)
    {t: S4_START - 0.6, ride: {amp: 1.6, rate: 0.55}, target: s4PipGaze, wind: 1, dur: 0.2},
    {t: S4_BEATS.stop, wind: 0.3, dur: 0.7},
    {t: S4_BEATS.pipTurnWest, facing: 'left', dur: 0.3},
  ],
};

/** Its contact shadow on the roof (colour, never grey): a flat oval a little east of its seat (the low sun is west),
 *  scaled by how high Pip is above the roof (it rides seated: always ~1). */
const RoofShadow: React.FC = () => {
  const t = useTime();
  const st = trackAt(S4_PIP_TRACK, t);
  const [sx, sy] = S4_PIP.seat;
  const lift = Math.max(0, sy - st.y);
  const k = Math.max(0, 1 - lift / 90);
  if (k <= 0.05) return null;
  const cx = sx + 14 + (st.x - sx) * 0.6;
  return <Fill d={ovalPath(cx, sy + 1, 44 * k, 6.5 * k)} color={CM.stoneShade} offset={false} seed="s4pipShadow" />;
};

export const S4Pip: React.FC = () => (
  <>
    <RoofShadow />
    <PipTrack {...S4_PIP_TRACK} />
  </>
);
