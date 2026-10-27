// P5 (lane L3-people): COZY CLOSE over her shoulder, 15.00-16.60 ("She worked on Google's AI.").
// ONE idea: she worked on Google's AI. From behind her (long dark hair, the cobalt sweater's shoulder, her chair's back)
// we look past her to her laptop on the lamp-lit desk: the abstract AI network on its screen (the nodes light in turn,
// the hub beats; no logo, no company name). The desk is her home's (kit NookDeskClose: the window right onto the living
// dusk town, the corkboard, a print, the high shelf, the lamp and its golden pool, papers, the mug's steam, the motes).
// Her cat loafs in the lamp pool right of the laptop, its eye-line on the screen (it leads the viewer to the subject),
// its tail flicking. She types in bursts. The engine draws her name super in the top credit tab.
// Camera: HOLD, breathing in 1.5 % on the screen; the room lives.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Cat, CC, HerBack, Laptop, NookDeskClose} from '../kit';

const START = 15.0;
const DUR = 16.6 - START;
/** The laptop (the board's hinge centre and width). */
const LAP = {x: 530, y: 953, w: 460};

const P5: React.FC = () => {
  const t = useTime();
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  return (
    <World sky={CC.wall}>
      <XG m={mat.about(mat.scale(z), LAP.x, LAP.y - 90)}>
        <NookDeskClose>
          <Laptop x={LAP.x} y={LAP.y} w={LAP.w} screen="ai" seed="p5/laptop" />
          <Cat x={905} y={1336} size={290} pose="loaf" facing="l" look={[LAP.x + 40, LAP.y - 100]} seed="p5/cat" />
          <HerBack x={60} y={1600} h={1100} facing="r" seed="p5/her" />
        </NookDeskClose>
      </XG>
    </World>
  );
};
export default P5;

/** Ink captions: the band is her cream wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
