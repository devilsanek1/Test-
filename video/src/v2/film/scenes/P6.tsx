// P6 (lane L3-people): COZY MEDIUM CLOSE, a NEW ANGLE (3/4 front, the window behind her), 16.60-20.52 ("and told the
// BBC she objected to where its military work was heading.").
// ONE idea: worried, she tells the BBC she objected. She sits at her desk facing 3/4 front, turned to the mic, her face
// worried (brows + mouth); behind her the window onto the living dusk town, the bookcase, prints, the clock, the
// radiator, a candle on the sill (kit NookAngle: the desk runs the full width in front of her and hides her waist). Her
// bubble (speech lines only, no words) pops on "told" (16.76, the like-pop). She talks from "told" (a nod, an open
// hand), clutches her hands at her chest for ONE worried beat on "objected", then talks on. Her cat sits on the sill
// behind her, watching her, its head turning up to the bubble when it pops. Nothing military, no Google lettering.
// Camera: HOLD, breathing in 1.5 % on her face and the bubble; the room lives.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Bubble, Cat, CC, HerSeated, Mic, NOOK_ANGLE, NookAngle, herMouth, lerpPt, type Pt} from '../kit';

const START = 16.6;
const DUR = 20.52 - START;
/** The like-pop on "told" (16.76): the pop starts a beat before it, so the sound lands on its overshoot. */
const POP = 16.76 - START - 0.08;
/** The board's speech box (screen px). */
const BUB = {x: 120, y: 650, w: 400, h: 264};

const P6: React.FC = () => {
  const t = useTime();
  const H = NOOK_ANGLE.her;
  const mouth = herMouth({x: H.x, y: H.y, h: H.h, facing: 'l', view: 'front34'});
  const r = 0.09 * H.h;
  // the tail tip: just in front of (left of) and above her mouth, never across her face
  const tail: Pt = [mouth[0] - 0.75 * r, mouth[1] - 0.55 * r];
  const talking: [number, number][] = [[POP - 0.06, DUR + 1]];
  // the one worried beat: a fist clutch on "objected" (17.96-18.44)
  const clutch: [number, number][] = [[17.9 - START, 18.75 - START]];
  const react = prog(t, POP + 0.12, 0.22, ease.outCubic);
  const look = lerpPt([mouth[0], mouth[1] - 40], [BUB.x + BUB.w * 0.7, BUB.y + BUB.h * 0.6], react);
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  const her = {x: H.x, y: H.y, h: H.h, facing: 'l' as const, view: 'front34' as const, face: 'worried' as const, talking, clutch, seed: 'p6/her'};
  return (
    <World sky={CC.wall}>
      <XG m={mat.about(mat.scale(z), 470, 1050)}>
        <NookAngle behind={<HerSeated {...her} part="body" />}>
          <Cat x={905} y={NOOK_ANGLE.sill} size={120} pose="sit" facing="l" look={look} seed="p6/cat" />
          <Mic x={NOOK_ANGLE.mic.x} y={NOOK_ANGLE.mic.y} w={NOOK_ANGLE.mic.w} tilt={8} seed="p6/mic" />
          <HerSeated {...her} part="arms" />
        </NookAngle>
        <Bubble x={BUB.x} y={BUB.y} w={BUB.w} h={BUB.h} tail={tail} at={POP} seed="p6/bubble" />
      </XG>
    </World>
  );
};
export default P6;

/** Ink captions: the band is her cream wall (the window starts under it). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
