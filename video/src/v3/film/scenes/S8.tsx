// S8 (lane L4-desk): EXTREME CLOSE cut-in on S7's axis, 18.28-19.40 ("memory chips."). SCALE ladder 1/3.
// Locked board (animatic S8, camera_plan_g3, storyboard_g3): the same angle as S7, REDRAWN at close size (never a
// camera zoom, so the line weights stay the house's): YOUR laptop (the kit laptop, w 1400, front ink 4.8) with its
// keyboard cut by both side edges low in the stage and its plain dark screen behind; ONE memory stick (the kit stick,
// w 700, 65 % of the frame, the biggest thing in it) rises out of the keys over 0.4 s from the cut and stands on the
// hinge, over the bottom bezel and the top key rows: it comes up through the third key row (clipped there, so it reads
// as coming out of the laptop) with a small overshoot, and lands before "chips." (18.76). The lamp pool continues on
// the desk under the deck, cut by the edges ("the pool's edge below").
// The kit lid is 0.64 w tall, so at this size the lid fills the top of the frame (the board's notation icon had a
// short lid with a wall strip above it): the caption band is the flat dark screen, the caption ("memory chips.",
// all highlighted) sits on its own box there.
// Camera: HOLD (the rise is an element move), breathing in 1.5 % (ease in-out) on the stick.
import React, {useId} from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {Fill} from '../../../lib/Fill';
import {blob, polyPath} from '../../../lib/sketch';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Laptop, laptopGeo, MemoryStick, quadPt, STICK_RATIO, type Pt} from '../kit';

const DUR = 19.4 - 18.28;
/** The rise (board move: from the cut, 0.4 s). */
const RISE_AT = 0;
const RISE_DUR = 0.4;

/** YOUR laptop at close size: hinge centre and lid width (S7's laptop x 3.3 on its axis). */
const LAP = {x: 540, y: 1080, w: 1400};
/** The stick (board: w 700, centred, landing on the hinge over the bezel and the keys). */
const STICK_W = 700;
const STICK_H = STICK_W * STICK_RATIO;
/** The key row the stick comes up through (the kit's third dashed row, v 0.54 of the deck). */
const SLOT_V = 0.54;
/** The pool on the desk under the deck (S7's pool on the same axis, cut by both edges). */
const POOL = {cx: 540, cy: 1372, rx: 1150, ry: 392};

const S8: React.FC = () => {
  const t = useTime();
  const clipId = 's8slot' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  const g = laptopGeo(LAP.x, LAP.y, LAP.w);
  // the slot line: the third key row across the deck (it tilts with the deck's 3/4 view)
  const sL = quadPt(g.deck, -0.4, SLOT_V);
  const sR = quadPt(g.deck, 1.4, SLOT_V);
  const slotY = (x: number) => sL[1] + ((x - sL[0]) / (sR[0] - sL[0])) * (sR[1] - sL[1]);
  const rot = (Math.atan2(sR[1] - sL[1], sR[0] - sL[0]) * 180) / Math.PI;
  // the stick stands IN the slot at the end (its pin edge on the row); it starts fully below it
  const cx = LAP.x;
  const endY = slotY(cx) - STICK_H / 2;
  const startY = slotY(cx) + STICK_H / 2 + 6;
  const p = prog(t, RISE_AT, RISE_DUR, ease.outBack(1.25));
  const y = startY + (endY - startY) * p;
  const clip: Pt[] = [[-200, -200], [1280, -200], [sR[0], sR[1]], [sL[0], sL[1]]];
  const focus: Pt = [cx, endY];
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), focus[0], focus[1])}>
        <Fill rect={[-60, 700, 1200, 1400]} color={EMBER.desk} offset={false} />
        <Fill d={blob(POOL.cx, POOL.cy, POOL.rx, POOL.ry, {seed: 's8/pool1', wobble: 0.015})} color={EMBER.ring} offset={false} />
        <Fill d={blob(POOL.cx - 20, POOL.cy + 6, POOL.rx * 0.6, POOL.ry * 0.6, {seed: 's8/pool2', wobble: 0.02})} color={EMBER.core} offset={false} />
        <Laptop x={LAP.x} y={LAP.y} w={LAP.w} variant="old" ink={4.8} seed="s8/lap" />
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={polyPath(clip)} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <MemoryStick x={cx} y={y} w={STICK_W} rot={rot} seed="s8/stick" />
        </g>
      </XG>
    </World>
  );
};
export default S8;

/** The caption band is the laptop's dark screen: white text (the page is all highlight box anyway). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];
