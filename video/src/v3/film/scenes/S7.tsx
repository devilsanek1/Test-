// S7 (lane L4-desk): CLOSE at your desk in the home base, 16.60-18.28 ("Mostly because your laptop runs on").
// Locked board (animatic S7, camera_plan_g3, storyboard_g3): slightly high (the kit laptop's 3/4 view from above);
// O1's room tone: the peach wall (the calm caption band) over the terracotta desk (back edge y 1000); O1's lamp, its
// shade cut by the left edge, lit; YOUR laptop (the old one: dark screen) centred on the desk, w 420, in the golden
// lamp pool (690 px wide, wider than the laptop, so it reads as light, not a mat); a mug at the pool's right rim (the
// home base's desk, as in O1 and S16). On "your" (17.24) the see-inside bubble pops upper right (board: centre
// 680, 728, r 112, above y 840; small element, so 0.10 s ahead of the word) and grows out of a spot on the keyboard;
// the memory stick (the kit stick, w 170) pops inside it a beat later. No window (saved for O1, S13 and S15).
// Camera: HOLD, breathing in 1.5 % (ease in-out) toward the laptop and the bubble.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, hline, line} from '../../../lib/sketch';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Lamp, Laptop, laptopGeo, MemoryStick, Mug, quadPt} from '../kit';
import {S7Lens} from './S7_lens';

const START = 16.6;
const DUR = 18.28 - START;
/** "your" (17.24): the bubble, a small element, leads the word by 0.10 s. */
const LENS_AT = 17.24 - START - 0.1;

/** The desk's back edge (board y 1000); the wall above it is the calm caption band. */
const DESK_Y = 1000;
/** YOUR laptop: hinge centre and lid width (board icon x 330-750, lid top ~860; here ~876, so the lid's top edge
 *  stays clear of the bubble's rim instead of grazing it). */
const S7_LAP = {x: 540, y: 1145, w: 420};
/** The golden pool under it (board: centre 540, 640 px wide; camera plan 540-760). */
const POOL = {cx: 540, cy: 1232, rx: 345, ry: 122};
/** The see-inside bubble (board: centre 680, 728, r 112) and the stick inside it (board: w 170; 180 for the phone-size read). */
const LENS = {cx: 680, cy: 728, r: 112};
const STICK_W = 180;

const Desk: React.FC = () => (
  <>
    <Fill rect={[-60, DESK_Y, 1200, 1060]} color={EMBER.desk} offset={false} />
    <Fill d={blob(POOL.cx, POOL.cy, POOL.rx, POOL.ry, {seed: 's7/pool1', wobble: 0.02})} color={EMBER.ring} offset={false} />
    <Fill d={blob(POOL.cx - 10, POOL.cy + 4, POOL.rx * 0.6, POOL.ry * 0.6, {seed: 's7/pool2', wobble: 0.025})} color={EMBER.core} offset={false} />
    <Ink d={hline(-60, 1140, DESK_Y, {seed: 's7/deskE', over: 'structural'})} width={3.4} />
    <Ink d={line(60, DESK_Y + 470, 330, DESK_Y + 476, {seed: 's7/gr1', over: [0, 0]}) + line(690, DESK_Y + 560, 1010, DESK_Y + 567, {seed: 's7/gr2', over: [0, 0]})} width={2.2} />
  </>
);

const S7: React.FC = () => {
  const t = useTime();
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  const g = laptopGeo(S7_LAP.x, S7_LAP.y, S7_LAP.w);
  // the spot the bubble looks into: right of centre on the keyboard (board: the line's foot at 650, 1100)
  const tip = quadPt(g.deck, 0.7, 0.42);
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), 600, 960)}>
        <Desk />
        <Lamp pose={{base: [-300, 1090], elbow: [-90, 640], head: [8, 792], rot: -24, scale: 1.55}} seed="s7/lamp" />
        <Mug x={806} top={1082} w={92} seed="s7/mug" />
        <Laptop x={S7_LAP.x} y={S7_LAP.y} w={S7_LAP.w} variant="old" seed="s7/lap" />
        <S7Lens cx={LENS.cx} cy={LENS.cy} r={LENS.r} tip={tip} at={LENS_AT} seed="s7/lens">
          <MemoryStick x={LENS.cx} y={LENS.cy + 2} w={STICK_W} rot={-4} seed="s7/stick" />
        </S7Lens>
      </XG>
    </World>
  );
};
export default S7;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
