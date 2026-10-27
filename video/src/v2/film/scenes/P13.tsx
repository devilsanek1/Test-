// P13 (lane L2-nook): HOME BASE, the nook at 1.2x (MEDIUM-WIDE), 35.32-39.08 ("But in her words, 'talking about
// facts is not criticising'."). The film's last panel.
// ONE idea: her own words: talking about FACTS. She sits at her mic in her lamp-lit nook (the same room as P2 / P4, a
// third size: the window with the living dusk town behind her, the bookcase left, the curtain right, the desk, the
// rug); her bubble, the SUBJECT (the board's 400 x 264 at (270, 640)), pops on "talking" (36.44, the like-pop) with
// FACTS hand-lettered in it (her own word, nothing else, no document). Her cat sits on the sill watching her, and when
// the bubble pops it looks up at it (its eye-line lifts the viewer to the word). She talks from "her words" on (the
// mouth, a nod, an open-hand gesture). Camera: HOLD, breathing in 1.5 % on the bubble; the room keeps living.
// THE LOOP SEAM: the engine un-builds this panel over its last 0.3 s on top of O1's t < 0 bare-line state. While it
// un-builds (useExit() > 0) the panel drops its wall slab and the World sky (G5_BLOCKING section 8), so O1's lines
// draw on in place as the nook's pieces leave, instead of a near-empty page.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ExitProvider, ExitShrink, useExit} from '../../../lib/exit';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Bubble, CC, HerSeated, NOOK, NookRoom, herMouth, lerpPt, nookWorld, type Pt} from '../kit';
import {bubbleTail, RodCover} from './P13_nook';

const START = 35.32;
const DUR = 39.08 - START;
/** The like-pop on "talking" (36.44): the pop starts a beat before it, so the sound lands on its overshoot. */
const POP = 36.44 - START - 0.08;
/** The board's bubble box (screen px): the subject. */
const BUB = {x: 270, y: 640, w: 400, h: 264};
/** The cat on the sill (nook world px), right of her, under the bubble's eye-line. */
const CAT: Pt = [700, NOOK.window.sillY];

const P13: React.FC = () => {
  const t = useTime();
  const exit = useExit();
  const unbuilding = exit > 0;
  const H = NOOK.herSeat;
  const mouthW = herMouth({x: H.x, y: H.y, h: H.h, facing: 'r', view: 'side'});
  // the tail points at her mouth from just above and in front of her face (never across her head)
  const tail: Pt = bubbleTail('m12');
  const react = prog(t, POP + 0.14, 0.22, ease.outCubic);
  const bubbleW = nookWorld('m12', [BUB.x + BUB.w * 0.55, BUB.y + BUB.h * 0.5]);
  const look = lerpPt([mouthW[0] + 20, mouthW[1] + 10], bubbleW, react);
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  return (
    <World sky={unbuilding ? 'transparent' : CC.wall}>
      {/* the room leaves 20 % faster than the engine's 0.3 s: at 1.2x the floor counts as a slab-sized fill (it would
          collapse last, a floor-coloured band hiding O1's lower lines until the final frame), so it is gone ~3 frames
          before the seam and O1's bare lines finish drawing on in place */}
      <ExitProvider value={Math.min(1, exit * 1.2)}>
        <XG m={mat.about(mat.scale(z), BUB.x + BUB.w / 2, BUB.y + BUB.h)}>
          <NookRoom layout="m12" slab={!unbuilding} cat={{x: CAT[0], y: CAT[1], pose: 'sit', facing: 'l', size: 120, look, seed: 'p13/cat'}}>
            <RodCover />
            <HerSeated x={H.x} y={H.y} h={H.h} facing="r" view="side" face="calm" talking={[[0.3, POP - 0.25], [POP - 0.1, DUR + 1]]} seed="p13/her" />
          </NookRoom>
          {/* the bubble leaves as one group, shrinking back into her mouth (a reversed pop): the kit's lettering is raw
              text that ignores the un-build, so FACTS would otherwise stay on the loop's last frame */}
          <ExitShrink x={tail[0]} y={tail[1]}>
            <Bubble x={BUB.x} y={BUB.y} w={BUB.w} h={BUB.h} tail={tail} at={POP} text="FACTS" seed="p13/bubble" />
          </ExitShrink>
        </XG>
      </ExitProvider>
    </World>
  );
};
export default P13;

/** Ink captions (the band holds the upper cabinet, the wall, the window recess and the blind: calm, light values). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
