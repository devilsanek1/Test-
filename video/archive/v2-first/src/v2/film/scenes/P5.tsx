// P5 (lane L3-people): COZY CLOSE over her shoulder, 15.00-16.60 ("She worked on Google's AI.").
// ONE idea: she worked on Google's AI. From behind her (long dark hair, the cobalt sweater's shoulder, her chair's back)
// we look past her to her laptop on the lamp-lit desk: the abstract AI network on its screen (the nodes light in turn,
// the hub beats; no logo, no company name), the brightest, busiest point of the frame. The desk is her home's (the kit's
// NookDeskClose, with the lane's fixes folded back: the mug off the lamp's line with thin warm steam, the near desk
// dressed with overlapping things, her phone face up): the window right onto the living dusk town, the corkboard, a print, the
// high shelf, the lamp and its golden pool, papers, the motes. Her cat SITS in the lamp pool right of the laptop
// (secondary: smaller than the screen, left of the right rail), its head turned up-left to the screen with its eyes
// open, so its eye-line leads to the AI network; its tail flicks. She types in bursts; her phone lights once. The engine
// draws her name super in the top credit tab.
// Camera: HOLD, locked (never a zoom in a hold); the room lives.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {mat, XG} from '../../../lib/xf';
import {Cat, CC, HerBack, Laptop, NookDeskClose} from '../kit';

const START = 15.0;
/** The laptop (the board's hinge centre and width). */
const LAP = {x: 530, y: 953, w: 460};
/** The AI network's hub on the screen (the cat's eye-line). */
const HUB: [number, number] = [530, 856];
/** Her cat sitting in the pool (the ground point, size): the same sitting cat P6 shows on the desk's right end. */
const CAT = {x: 792, y: 1246, size: 168};
/** Her (HerBack x): 120, near the board's 110 (finisher: at 60 her head sat cut on the frame's edge and her back read as
 *  "a blue blob or curtain" in the cold read; here her head, its lost profile and both shoulders read; hero ~10 %). */
const P5_HER_X = 120;

const P5: React.FC = () => {
  const z = 1; // HOLD: the camera locked (the board's; COZY_AND_SCALE 3b.5: never a zoom in a hold)
  return (
    <World sky={CC.wall}>
      <XG m={mat.about(mat.scale(z), LAP.x, LAP.y - 90)}>
        <NookDeskClose>
          <Laptop x={LAP.x} y={LAP.y} w={LAP.w} screen="ai" seed="p5/laptop" />
          <Cat x={CAT.x} y={CAT.y} size={CAT.size} pose="sit" facing="l" look={HUB} seed="p5/cat" />
          <HerBack x={P5_HER_X} y={1600} h={1100} facing="r" seed="p5/her" />
        </NookDeskClose>
      </XG>
    </World>
  );
};
export default P5;

/** Ink captions: the band is her cream wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
