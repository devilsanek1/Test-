// S12 Before there was even a fix (the rewind) (storyboard v3: cut(everything) -> END, 52.163-55.36 s; the closing beat
// at PEAK-1 framing, and the loop). "And some of those governments did it before there was even a fix."
// Hard cut back to the plaza as the shutdown left it (S01's last state, framed at 1.03); S12's own beats on the line
// (Pip lands from S11's leap, the tags swing, two pigeons land on the dark crossbar, the phones come down, a point, Pip
// nods, the padlocks glint); on 'before' the sun's power glyph pops to a REWIND glyph and S01 plays BACKWARDS, stepped
// at 12 fps like a tape, to one step before the press; the glyph pops back on 'fix.'; Bit walks backwards home along
// govA's cornice as the film's last motion. ONE slow 3 % pull-back lands at rest: the last frame IS frame 0 (the loop:
// scenes.json transitionOut {type: 'cut', loop: true, captionAt}).
// Notes, the seam check and render cost: docs/scenes/S12.md. Local helpers: src/scenes/scene12/.
import React from 'react';
import {World} from '../lib';
import {PlazaRewind} from './scene12/plaza';

const Scene12: React.FC = () => (
  <World sky={[{t: 0, tod: 'day'}]}>
    <PlazaRewind />
  </World>
);

export default Scene12;
