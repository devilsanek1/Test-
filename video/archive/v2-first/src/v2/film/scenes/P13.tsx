// P13 (lane L2-nook): HOME BASE, the nook at 1.2x (MEDIUM-WIDE), 35.32-39.08 ("But in her words, 'talking about
// facts is not criticising'."). The film's last panel.
// ONE idea: her own words: talking about FACTS. She sits at her mic in her lamp-lit nook (the same room as P2 / P4, a
// third size: the window with the living dusk town behind her, the bookcase left, the curtain right, the desk, the
// rug); her bubble, the SUBJECT (the board's 400 x 264 at (270, 640)), pops on "talking" (36.44, the like-pop) with
// FACTS hand-lettered in it (her own word, nothing else, no document), then floats (a slow breath about her mouth).
// Her cat sits on the sill watching her, and when the bubble pops it looks up at it (its eye-line lifts the viewer to
// the word); its idle clock (seed picked for this hold) puts an ear twitch at ~37.65 s, a big tail flick at ~38.15 s
// and a curious head tilt at ~38.5 s into the long hold. She talks from "her words" on (the mouth, a nod, an
// open-hand gesture). Camera: HOLD, locked (never a zoom in a hold); the room keeps living (the town at 1.3x its draft
// rate in this longest hold: a neighbour's window lights at ~38.27 s above her head; the clock's readable second hand).
// THE LOOP SEAM: the engine un-builds this panel over its last 0.3 s (18 frames, f2327-2344) on top of O1's t < 0
// bare-line state. The AD's fix round, on the house recipe (lines loose, fills shrink small first, ink retracts):
//   f2327-2330  the bubble shrinks into her mouth as ONE shape (outline, fill and FACTS together); the room's colour
//               un-builds fast (e 0 -> 0.55 over the first 4 frames);
//   f2331       the colour still left (the big trim / recess / blind / floor fills, which shrink last) goes in one
//               frame: no solid block outlives its lines' start by more than a frame;
//   f2331-2336  the nook's LINES retract slowly (e 0.55 -> 0.77) while O1's bare lines draw on in place under them (a
//               line drawing turning into the next, never near-empty frames); from the loop roll (~f2332, the
//               frame-0 words) the caption band is clipped out of the room, so no nook stroke crosses the words.
// The World sky and the wall slab drop from the first exit frame; the rod cover's rect (kit NookRoom rod={false}) is
// clipped out of the room from the first exit frame (the rod never strikes through the caption).
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ExitProvider, Look, NoExit, useExit} from '../../../lib/exit';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Bubble, CC, HerSeated, NOOK, NookRoom, herMouth, lerpPt, nookWorld, type Pt} from '../kit';
import {bubbleTail, Float, RodClip} from './P13_nook';

const START = 35.32;
const DUR = 39.08 - START;
/** The like-pop on "talking" (36.44): the pop starts a beat before it, so the sound lands on its overshoot. */
const POP = 36.44 - START - 0.08;
/** The board's bubble box (screen px): the subject. */
const BUB = {x: 270, y: 640, w: 400, h: 264};
/** The cat on the sill (nook world px), right of her, under the bubble's eye-line. */
const CAT: Pt = [700, NOOK.window.sillY];
/** The seam: the room's un-build value e from the engine's exit (0..1 over the last 0.3 s): the colour fast (0 ->
 *  COLOUR_OUT by exit COLOUR_AT), then the lines slowly (-> INK_OUT by exit INK_AT); both cut what is left. */
const COLOUR_AT = 0.2;
const COLOUR_OUT = 0.55;
const INK_AT = 0.52;
const INK_OUT = 0.77;
const roomExit = (x: number) => (x <= 0 ? 0 : x < COLOUR_AT ? (x / COLOUR_AT) * COLOUR_OUT : Math.min(1, COLOUR_OUT + ((x - COLOUR_AT) / (INK_AT - COLOUR_AT)) * (INK_OUT - COLOUR_OUT)));
/** From the loop roll (Film: the captions roll back to page 1 at end - 0.22 s, the frame-0 words land): the band
 *  (pre-zoom screen y) is clipped out of the room. */
const ROLL = DUR - 0.22;
const BAND: [number, number] = [262, 612];
const CLIP_ID = 'p13-seam-clip';

const P13: React.FC = () => {
  const t = useTime();
  const exit = useExit();
  const unbuilding = exit > 0;
  const e = roomExit(exit);
  const H = NOOK.herSeat;
  const mouthW = herMouth({x: H.x, y: H.y, h: H.h, facing: 'r', view: 'side'});
  // the tail points at her mouth from just above and in front of her face (never across her head)
  const tail: Pt = bubbleTail('m12');
  const react = prog(t, POP + 0.14, 0.22, ease.outCubic);
  const bubbleW = nookWorld('m12', [BUB.x + BUB.w * 0.55, BUB.y + BUB.h * 0.5]);
  const look = lerpPt([mouthW[0] + 20, mouthW[1] + 10], bubbleW, react);
  const z = 1; // HOLD: the camera locked (the board's; COZY_AND_SCALE 3b.5: never a zoom in a hold)
  // the bubble leaves first, as one shape, into her mouth (a reversed pop): ~4 frames
  const bubbleK = 1 - ease.inQuad(prog(exit, 0, 0.2));
  return (
    <World sky={unbuilding ? 'transparent' : CC.wall}>
      <XG m={mat.about(mat.scale(z), BUB.x + BUB.w / 2, BUB.y + BUB.h)}>
        <ExitProvider value={e}>
          <Look fills={e >= COLOUR_OUT ? 'none' : undefined} ink={e >= INK_OUT ? false : undefined}>
            {unbuilding ? <RodClip layout="m12" id={CLIP_ID} band={t >= ROLL - 1e-6 ? BAND : undefined} /> : null}
            <g clipPath={unbuilding ? `url(#${CLIP_ID})` : undefined}>
              <NookRoom
                layout="m12"
                slab={!unbuilding}
                rod={false}
                town={{life: 1.3}}
                cat={{x: CAT[0], y: CAT[1], pose: 'sit', facing: 'l', size: 120, look, seed: 'p13/cat/876'}}
              >
                <HerSeated x={H.x} y={H.y} h={H.h} facing="r" view="side" face="calm" talking={[[0.3, POP - 0.25], [POP - 0.1, DUR + 1]]} seed="p13/her" />
              </NookRoom>
            </g>
          </Look>
        </ExitProvider>
        {bubbleK > 0.001 ? (
          <XG m={mat.about(mat.scale(bubbleK), tail[0], tail[1])}>
            <NoExit>
              <Float from={POP + 0.24} tail={tail}>
                <Bubble x={BUB.x} y={BUB.y} w={BUB.w} h={BUB.h} tail={tail} at={POP} text="FACTS" seed="p13/bubble" />
              </Float>
            </NoExit>
          </XG>
        ) : null}
      </XG>
    </World>
  );
};
export default P13;

/** Ink captions (the band holds the upper cabinet, the wall, the window recess and the blind: calm, light values). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
