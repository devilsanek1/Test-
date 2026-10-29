// P6 (lane L3-people): COZY MEDIUM CLOSE, a NEW ANGLE (3/4 front, the window behind her), 16.60-20.52 ("and told the
// BBC she objected to where its military work was heading.").
// ONE idea: worried, she tells the BBC she objected. She sits at her desk facing 3/4 front, turned to the mic, her face
// WORRIED in every frame (the kit's worried face, the lane's P6 fix folded back: the brows up in the middle at full
// ink, a downturned talking mouth, never a round 'o'); behind her the window onto the living dusk town, the bookcase, prints, the clock, the radiator, a candle on the
// sill (the kit's NookAngle, the lane's fixes folded back: the lamp beside the mic, so a band of lamp-lit wall separates its
// shade from her hair; the desk runs the full width in front of her and hides her waist). Her bubble (speech lines only,
// no words) pops on "told" (16.76, the like-pop). She talks from "told" (a nod, an open hand), clutches her hands at her
// chest for ONE worried beat on "objected", then talks on. Her cat sits on the desk's right end (the same desk and the
// same sitting cat as P5, partly behind the floor plant, left of the right rail), watching her; its head turns up to
// the bubble when it pops. A notification lights her phone once, late. Nothing military, no Google lettering.
// Camera: HOLD, locked (never a zoom in a hold); the room lives.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Bubble, Cat, CC, HerSeated, Mic, NOOK_ANGLE, NookAngle, herMouth, lerpPt, type Pt} from '../kit';

const START = 16.6;
/** The like-pop on "told" (16.76): the pop starts a beat before it, so the sound lands on its overshoot. */
const POP = 16.76 - START - 0.08;
/** The board's speech box (screen px). */
const BUB = {x: 120, y: 650, w: 400, h: 264};
/** Her cat on the desk's right end (the ground point, size: P5's sitting cat seen from the new angle). */
const CAT = {x: 878, y: 1486, size: 158};

const P6: React.FC = () => {
  const t = useTime();
  const H = NOOK_ANGLE.her;
  const mouth = herMouth({x: H.x, y: H.y, h: H.h, facing: 'l', view: 'front34'});
  const r = 0.09 * H.h;
  // the tail tip: just in front of (left of) and above her mouth, never across her face
  const tail: Pt = [mouth[0] - 0.75 * r, mouth[1] - 0.55 * r];
  // she talks from "told" to the end of "heading" (the word's tail is breath)
  const talking: [number, number][] = [[POP - 0.06, 20.28 - START]];
  // the one worried beat: a fist clutch on "objected" (17.96-18.44)
  const clutch: [number, number][] = [[17.9 - START, 18.75 - START]];
  // the cat watches her mouth, then turns up to the bubble as it pops
  const react = prog(t, POP + 0.12, 0.22, ease.outCubic);
  const look = lerpPt([mouth[0], mouth[1] - 40], [BUB.x + BUB.w * 0.7, BUB.y + BUB.h * 0.6], react);
  const z = 1; // HOLD: the camera locked (the board's; COZY_AND_SCALE 3b.5: never a zoom in a hold)
  const seed = 'p6/her';
  const her = {x: H.x, y: H.y, h: H.h, facing: 'l' as const, view: 'front34' as const, face: 'worried' as const, talking, clutch, seed};
  return (
    <World sky={CC.wall}>
      <XG m={mat.about(mat.scale(z), 470, 1050)}>
        <NookAngle
          behind={<HerSeated {...her} part="body" />}
          cat={<Cat x={CAT.x} y={CAT.y} size={CAT.size} pose="sit" facing="l" look={look} seed="p6/cat" />}
        >
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
