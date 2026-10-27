// P4 (lane L2-nook): HOME BASE, the nook at 1.4x (MEDIUM), 13.24-15.00 ("So why is SHE talking?").
// ONE idea: yet she IS talking. She sits at her mic (the same room as P2, closer: the bookcase column runs to the top
// edge left, the window behind her is cut by the caption band's lower edge and the right side, its town alive), the
// lamp's golden light on the desk; her cat loafs on the sill, drowsy, until her bubble pops on "SHE" (13.96, the
// like-pop): then its eyes open and it looks at the bubble. Her mouth starts moving just before the pop (lead), her
// head nods and her near hand rises open while she talks. The bubble (speech lines, no words) is the board's 400 x 264
// box at (250, 650). Camera: HOLD, breathing in 1.5 % on her and the bubble; the room keeps living.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Bubble, CC, HerSeated, NOOK, NookRoom, herMouth, lerpPt, nookWorld, type Pt} from '../kit';
import {bubbleTail, RodCover} from './P13_nook';

const START = 13.24;
const DUR = 15.0 - START;
/** The like-pop at 13.96: the bubble's pop starts a beat before it, so the sound lands on its overshoot. */
const POP = 13.96 - START - 0.08;
/** The board's speech box (screen px). */
const BUB = {x: 250, y: 650, w: 400, h: 264};
/** The cat on the sill (nook world px; P4 shows world x 72-844, so it sits left of the cut). */
const CAT: Pt = [680, NOOK.window.sillY];

const P4: React.FC = () => {
  const t = useTime();
  const H = NOOK.herSeat;
  const mouthW = herMouth({x: H.x, y: H.y, h: H.h, facing: 'r', view: 'side'});
  // the tail points at her mouth from just above and in front of her face (never across her head)
  const tail: Pt = bubbleTail('m14');
  // the cat: drowsy, watching her; on the pop its eyes open and its head turns up to the bubble
  const react = prog(t, POP + 0.12, 0.2, ease.outCubic);
  const bubbleW = nookWorld('m14', [BUB.x + BUB.w * 0.62, BUB.y + BUB.h * 0.55]);
  const look = lerpPt([mouthW[0] + 30, mouthW[1]], bubbleW, react);
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  return (
    <World sky={CC.wall}>
      <XG m={mat.about(mat.scale(z), 520, 1000)}>
        <NookRoom layout="m14" cat={{x: CAT[0], y: CAT[1], pose: 'loaf', facing: 'l', size: 120, look, eyes: t < POP + 0.12 ? 'half' : 'open', seed: 'p4/cat'}}>
          <RodCover />
          <HerSeated x={H.x} y={H.y} h={H.h} facing="r" view="side" face="calm" talking={[[POP - 0.1, DUR + 1]]} seed="p4/her" />
        </NookRoom>
        <Bubble x={BUB.x} y={BUB.y} w={BUB.w} h={BUB.h} tail={tail} at={POP} seed="p4/bubble" />
      </XG>
    </World>
  );
};
export default P4;

/** Ink captions (the band holds the bookcase's upper cabinet, the wall, the window recess and the blind). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
