// S01 Government Plaza powers down (storyboard v3: START -> cut(purpose), 0.00-4.715 s; PEAK 1, the hook).
// "Governments all over Europe just shut down a bunch of their own websites on purpose,"
// Frame 0 = the moment of the press (the loop seam: S12's rewind stops one step before it): the sun at the bottom of
// its SunPress with the bold power glyph, govB's screen a bright line; frame 0 RELEASES the press and the power-off
// wave spreads. Ends with a fixed 0.33 s dive into govB's lock box = S02's blueprint lock (matchcut).
// Notes, shims and render cost: docs/scenes/S01.md. Local helpers: src/scenes/scene01/.
import React from 'react';
import {World} from '../lib';
import {PlazaShutdown} from './scene01/plaza';

const Scene01: React.FC = () => (
  <World sky={[{t: 0, tod: 'day'}]}>
    <PlazaShutdown />
  </World>
);
export default Scene01;
