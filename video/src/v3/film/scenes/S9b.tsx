// S9b (21.32-22.68, "By the mountain."): SCALE 3/3, the SCALE CUT to a worm's-eye view (docs/v3/camera_plan_g3.md
// row S9b; board public/v3/animatic.json "S9b"; STORYBOARD_STYLE section 7: the tiny figure stands on plain ground IN
// FRONT, >= 10:1 under the colossus).
//
// Low camera, horizon low (ground line y 1470): THE MOUNTAIN of memory sticks (the kit Pile: ram-sized sticks, more
// of them, never bigger ones) runs past both side edges and up to just under the caption band (top stick ~y 618).
// Their AI data center at its foot at half its board size (240 px; its sign lit as in S9), half sunk behind the
// snowdrift at the pile's foot (the drift is the depth cue that puts it far behind you). Tiny YOU (86 px, back view,
// holding your ONE stick) stands on the plain snow in front, against the light drift, feet at y 1518 (above the
// platform's bottom UI): pile to you ~9.5:1. The low angle sits on the quantity of chips, not on the building.
//
// Camera: HOLD, as boarded (the cut is the move; no breathing push: the pile top and your feet already sit on the
// caption band and the bottom UI). Falling snow and the server lights keep the frame alive.
import React from 'react';
import {World, ShotCam, Fill, Ink, poly, polyPath, type ToneKey} from '../../../lib';
import {Layer} from '../../../lib/cine/camera';
import {EMBER, FILM_TOD, DataCenter, Pile, Snowfall, YouTiny, type Pt} from '../kit';

const HOR = 1470; // the ground line (the drift meets the near snow)
const PILE_TOP = 652; // the mound top; its top sticks poke up to ~y 618 (measured)
const YOU = {x: 250, feet: 1518, h: 86};

/** The drift's top edge: a hump behind you, lower at the data center (it hides the building's base). */
const driftY = (x: number) => HOR - 36 - 36 * Math.exp(-(((x - YOU.x) / 150) ** 2)) - 10 * Math.exp(-(((x - 720) / 200) ** 2)) + 5 * Math.sin(x / 55 + 1);
const DRIFT_TOP: Pt[] = Array.from({length: 49}, (_, i) => {
  const x = -60 + i * 25;
  return [x, driftY(x)] as Pt;
});
const DRIFT = polyPath([[-60, HOR + 6], ...DRIFT_TOP, [1140, HOR + 6]]);

const S9b: React.FC = () => (
  <World stage="context" sky={[{t: 0, tod: FILM_TOD, color: EMBER.sky}]}>
    <ShotCam>
      <Layer depth={0}>
        {/* the mountain: past both side edges, top just under the caption band */}
        <Pile x={540} y={HOR} w={1480} h={HOR - PILE_TOP} stickW={130} seed="s9b" />
        {/* their data center at the pile's foot (half sunk behind the drift: far behind you) */}
        <DataCenter x={720} y={HOR - 6} w={240} signLitAt={0} seed="s9bdc" />
        {/* the snowdrift along the pile's foot, then the near snow with one ground line */}
        <Fill d={DRIFT} color={EMBER.snow} offset={false} seed="s9b/drift" />
        <Ink d={poly(DRIFT_TOP, {seed: 's9b/driftI', over: [0, 0]})} width={2.2} />
        <Fill rect={[-200, HOR, 1480, 700]} color={EMBER.frost} offset={false} />
        <Ink d={poly([[-60, HOR], [1140, HOR]], {seed: 's9b/ground', over: [0, 0]})} width={2.2} />
        <Snowfall x={-20} y={630} w={1120} h={HOR - 630} n={18} seed="s9bsnow" />
      </Layer>
      {/* tiny you in front, back view, holding your one stick */}
      <Layer depth={-0.2}>
        <YouTiny x={YOU.x} y={YOU.feet} h={YOU.h} seed="s9bYou" />
      </Layer>
    </ShotCam>
  </World>
);
export default S9b;

/** White captions on the dusk-blue sky (5.3:1). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
