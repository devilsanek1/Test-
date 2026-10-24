// S01 Government Plaza powers down (storyboard v3: START -> cut(purpose), 0.00-4.715 s; PEAK 1, the hook).
// "Governments all over Europe just shut down a bunch of their own websites on purpose,"
// Frame 0 = the moment of the press (the loop seam: S12's rewind stops one step before it): the sun at the bottom of
// its SunPress with the bold power glyph, govB's screen a bright line; frame 0 RELEASES the press and the power-off
// wave spreads. Ends with a fixed 0.33 s dive into govB's lock box = S02's blueprint lock (matchcut).
// Notes, shims and render cost: docs/scenes/S01.md. Local helpers: src/scenes/scene01/.
import React from 'react';
import {World} from '../lib';
import type {ToneRegion} from '../lib/Captions';
import {PlazaShutdown} from './scene01/plaza';
import {toScreen} from './scene01/camera';
import {B} from './scene01/timing';

const Scene01: React.FC & {captionRegions?: (t: number) => ToneRegion[]} = () => (
  <World sky={[{t: 0, tod: 'day'}]}>
    <PlazaShutdown />
  </World>
);

/** Caption tone regions over this scene at SCENE-LOCAL time t (screen px), for the core lane to honour like a wiper's
 *  `captionRegions` (not wired in Film yet; docs/scenes/S01.md). During the dive (4.385 -> cut) govB's shutter (a flat
 *  tealDark curtain from 4.645, see GovBDiveShutter) sweeps up into the caption band: white captions read on it, the
 *  default ink everywhere else (sky, sand facade, dome). Empty outside the dive. */
Scene01.captionRegions = (t: number): ToneRegion[] => {
  if (t < B.dive || t >= B.cut) return [];
  const a = toScreen(t, [414, 952]); // the shutter box's top-left (window x, y - box)
  const b = toScreen(t, [622, 1116]); // the bottom rail's bottom-right
  if (b[1] < 280 || a[1] > 570) return [];
  return [{tone: 'light', rect: [Math.round(a[0]), Math.round(a[1]), Math.round(b[0]), Math.round(b[1])]}];
};

export default Scene01;
