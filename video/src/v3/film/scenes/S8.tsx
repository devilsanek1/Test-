// S8 (lane L4-desk; G5b dense pass by lane S7-S8): EXTREME CLOSE cut-in on S7's axis, 18.28-19.40 ("memory chips.").
// SCALE ladder 1/3.
// Locked board (animatic S8, camera_plan_g3, storyboard_g3): the same angle as S7, REDRAWN at close size (never a
// camera zoom, so the line weights stay the house's): YOUR laptop (the kit laptop, w 1400, front ink 4.8) with its
// keyboard cut by both side edges low in the stage and its plain dark screen behind; ONE memory stick (the kit stick,
// w 700, 65 % of the frame, the biggest thing in it) rises out of the keys over 0.4 s from the cut and stands on the
// hinge, over the bottom bezel and the top key rows: it comes up through the third key row (clipped there, so it reads
// as coming out of the laptop) with a small overshoot, and lands before "chips." (18.76). The lamp pool continues on
// the desk under the deck, cut by the edges ("the pool's edge below").
// The lid is foreshortened (kit `lidH` 0.36: seen from above at this size), so the board's wall strip shows above it
// and the caption band is flat wall again (ink captions); the dark screen drops from ~35 % of the frame to ~16 %
// (assembler fix: the dark-anchor budget; the kit's 0.64 lid filled the top of the frame).
// G5b (the approved pilot's bar, EDGES ONLY: the stick owns the frame; S8_edges.tsx): the lowest string-light bulbs and
// a trailing pothos above the band, a sticky note on the bezel, key legends, three caps springing back after the stick,
// the stick settling with a 2 deg wobble after it lands (the loop), the notebook and pen cut by the left edge, a
// biscuit, your phone's corner, a note, the charger cable; Pip bottom right with its head over the deck's front edge,
// eyes wide, reaching its trunk toward the stick on "chips".
// cozy v2: the off screen in dcSide (plain dark, matched S7 / S8 / S12).
// Camera: the FLOAT continues S7's last leg (S7.tsx `s7s8Float`, one plan over both shots), replacing the 1.5 % breathe;
// the captions and the UI stay fixed. Sets reach >= 60 px past each frame edge.
import React, {useId} from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {Fill} from '../../../lib/Fill';
import {blob, polyPath} from '../../../lib/sketch';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Laptop, laptopGeo, MemoryStick, quadPt, ring, STICK_RATIO, type Pt} from '../kit';
import {s7s8Float, S7_DUR} from './S7';
import {BezelNote, KeyLegends, KeySprings, S8_LAND, S8DeskFront, S8Pip, S8WallTop} from './S8_edges';

/** The rise (board move: from the cut, 0.4 s). */
const RISE_AT = 0;
const RISE_DUR = S8_LAND;

/** YOUR laptop at close size: hinge centre and lid width (S7's laptop x 3.3 on its axis). */
const LAP = {x: 540, y: 1080, w: 1400, lidH: 0.36};
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
  const [dx, dy] = s7s8Float(S7_DUR + t);
  const g = laptopGeo(LAP.x, LAP.y, LAP.w, LAP.lidH);
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
  // after landing it settles with a small wobble about its foot on the slot (2 deg, damped: the loop)
  const wob = ring(t, RISE_AT + RISE_DUR - 0.04, 2, 2.2, 2.6);
  const clip: Pt[] = [[-200, -200], [1280, -200], [sR[0], sR[1]], [sL[0], sL[1]]];
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.translate(dx, dy)}>
        <S8WallTop />
        <Fill rect={[-80, 700, 1240, 1400]} color={EMBER.desk} offset={false} />
        <Fill d={blob(POOL.cx, POOL.cy, POOL.rx, POOL.ry, {seed: 's8/pool1', wobble: 0.015})} color={EMBER.ring} offset={false} />
        <Fill d={blob(POOL.cx - 20, POOL.cy + 6, POOL.rx * 0.6, POOL.ry * 0.6, {seed: 's8/pool2', wobble: 0.02})} color={EMBER.core} offset={false} />
        <S8DeskFront />
        <Laptop x={LAP.x} y={LAP.y} w={LAP.w} lidH={LAP.lidH} variant="old" screen={EMBER.dcSide} ink={4.8} seed="s8/lap" />
        <BezelNote x={22} y={598} />
        <KeyLegends deck={g.deck} lid={g.lid} />
        <KeySprings deck={g.deck} />
        <defs>
          <clipPath id={clipId} clipPathUnits="userSpaceOnUse">
            <path d={polyPath(clip)} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <XG m={mat.about(mat.rotate(wob), cx, slotY(cx))}>
            <MemoryStick x={cx} y={y} w={STICK_W} rot={rot} seed="s8/stick" />
          </XG>
        </g>
        <S8Pip />
      </XG>
    </World>
  );
};
export default S8;

/** The caption band is the wall strip above the lid: ink captions. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
