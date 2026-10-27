// S12 (lane L2-inserts; G5b dense pass by lane S12): CLOSE on the laptop and its price tag, 29.40-31.32 ("And laptop
// makers pass that on.").
// Locked board (animatic S12, camera_plan_g3, storyboard_g3): slightly high, S7's angle family (the kit laptop's 3/4
// view from above); THE laptop centred on the desk (light screen: the storyboard's cold-read fix, and the same
// variant S16's tag hangs from); the 5x memory stick slides in from the upper left into its keyboard (t 0.05 -> 0.50);
// under it O1's price tag is the subject: "$999" struck on "makers" (29.96), "$1,099" pops on "pass" with the ding
// (30.28), so the change holds 1 s. The board's emphasis becomes light: the lamp's golden pool lies under the laptop
// and the tag (the burnt-orange tag reads on its core).
//
// The tag is the kit PriceTag in two key poses: before the step, the big "$999" (value mode) with its strike drawn
// on over it; from the step, the kit's struck-old layout ("$999" small, struck, "$1,099" big) whose ticker step pops
// the new price and jolts the tag, so the swap reads as one hit with the ding.
//
// G5b (owner: "way too empty"; the approved pilot's bar, docs/look/LIFE_AND_DENSITY.md): the same desk world as S7
// round the locked board. Above the band S7's wall top as built (string lights, photos on a cord, the hanging pothos,
// the sea print, O1's paper star, the attic slope); below it S12_wall.tsx (fixer pass: S7's wall, its leaf print and
// pinboard at S7's positions, the socket, O1's window behind the laptop with a list taped to the glass and two sticky
// reminders; the laptop shows S16's desktop); O1's lamp with its shade cut by the left edge and its pull chain (the loop); S7's back
// row (books, pen cup, succulent, the candle, the speaker, the mug); S12_desk.tsx (headphones, mittens, the charger
// into the laptop, sticky notes, glasses, clementines; the notebook, biscuits, letters, a clip dish, your phone face
// down, the planner, the radio). Pip on the desk left of the tag: follows the stick in, leans in to read the tag as
// $999 is struck, recoils with its ears down on "pass", turns to us worried on "on". The world answers the beats: the
// laptop dips a hair as the stick goes in; on the ding the pinned notes, the sticky notes, the hoop, the postcard and
// the pull chain all jolt, the mug puffs steam; at 30.70 a wall note drops to hang from one corner and swings.
// Fix pass: the stick flies bigger (190 -> 120 px, front ink) over a dusk night print; cool dressing (a closed
// dusk planner, a dusk radio, airmail letters, a frost plate); the phone pushed down; Pip ends wide-eyed at us.
// Camera: the FLOAT (cozy v2 §3, OVERRIDES the 1.5 % breathe): translation only, 8-12 px/s legs that turn back within
// +-12 / +-10 px of home; the captions and the UI stay fixed. Every set reaches >= 40 px past each frame edge.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, hline, line, smooth} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, floatCam, Lamp, Laptop, laptopGeo, PriceTag, PullChain, quadPt, ring, ScreenDesktop, StickFlight, tagHole, textW, type Pt} from '../kit';
import {S7DeskBack, S7Mug, S7WallTop} from './S7_desk';
import {S12WallLow} from './S12_wall';
import {S12DeskFront, S12DeskMid, S12Grain, S12Pip, S12Thermos, SteamPuff} from './S12_desk';

const START = 29.4;
const DUR = 31.32 - START;
/** "makers" (29.96): the strike draws on just ahead so it lands on the word. */
const STRIKE_AT = 29.96 - START - 0.06;
/** "pass" (30.28) = the ding: the new price pops 1 frame ahead so its peak lands with the sound. */
const NEW_AT = 30.28 - START - 0.02;
/** "on" (30.84): Pip turns to us. */
const ON_AT = 30.84 - START;
/** "on" + ~0.45 s: one settle beat after the ding (a wall note drops to hang from one corner and swings). */
const SETTLE_AT = 30.7 - START;
/** The stick's flight (board move: 0.05 -> 0.50, gone by 0.55). */
const STICK_T: [number, number] = [0.05, 0.5];

/** The S12 float (its own plan: hard cuts on both sides). */
export const S12_FLOAT = {dur: DUR, seed: 's12/float'};

/** The desk's back edge (the wall above it is the calm caption band). */
const DESK_Y = 1000;
/** THE laptop: hinge centre and lid width (board: centred, w ~400, top ~880). */
const LAP = {x: 540, y: 1110, w: 420};
/** Its right side port (S7's port, 35 px higher with the laptop): the charger plugs in here. */
const PORT: Pt = [768, 1163];
/** The tag (board: centred under the laptop, w 380). */
const TAG = {x: 338, y: 1268, w: 400, rot: -4};
const POOL = {cx: 545, cy: 1250, rx: 480, ry: 178};
/** O1's lamp as S7 shows it: the shade cut by the left edge, lit. */
const LAMP_POSE = {base: [-300, 1090] as Pt, elbow: [-90, 640] as Pt, head: [8, 792] as Pt, rot: -24, scale: 1.55};

const Desk: React.FC = () => (
  <>
    <Fill rect={[-60, DESK_Y, 1200, 1060]} color={EMBER.desk} offset={false} />
    <Fill d={blob(POOL.cx, POOL.cy, POOL.rx, POOL.ry, {seed: 's12/pool1', wobble: 0.02})} color={EMBER.ring} offset={false} />
    <Fill d={blob(POOL.cx - 8, POOL.cy + 6, POOL.rx * 0.62, POOL.ry * 0.62, {seed: 's12/pool2', wobble: 0.025})} color={EMBER.core} offset={false} />
    <Ink d={hline(-60, 1140, DESK_Y, {seed: 's12/deskE', over: 'structural'})} width={3.4} />
  </>
);

/** The strike over the big "$999" (tag-local, the kit's value-mode layout: price w*0.25 at (0.6 w, 0.34 w)),
 *  through the tag's own hang transform (rotation about the hole; no sway, no jolt before the step). */
const BigStrike: React.FC = () => {
  const {x, y, w, rot} = TAG;
  const [hx, hy] = tagHole(w);
  const size = w * 0.25;
  const cx = w * 0.6;
  const base = w * 0.5 * 0.68;
  const half = Math.min(w * 0.33, textW('$999', size) / 2) + 12;
  const m = mat.compose(mat.translate(x + hx, y + hy), mat.rotate(rot), mat.translate(-hx, -hy));
  return (
    <XG m={m}>
      <Ink d={line(cx - half, base - size * 0.3, cx + half, base - size * 0.36, {over: [2, 4], seed: 's12/strike'})} at={STRIKE_AT} width={7} color={EMBER.ink} taper={false} />
    </XG>
  );
};

const S12: React.FC = () => {
  const t = useTime();
  const [dx, dy] = floatCam(t, S12_FLOAT);
  const g = laptopGeo(LAP.x, LAP.y, LAP.w);
  const [hx, hy] = tagHole(TAG.w);
  const hole: Pt = [TAG.x + hx, TAG.y + hy];
  // the laptop dips a hair as the stick goes into its keyboard (a damped 2.5 px bob)
  const dip = ring(t, STICK_T[1] - 0.04, 2.5, 3.2, 7);
  // the tag's string ties on at the deck's front-left corner and lies in a loose curve to the eyelet
  const tie0 = quadPt(g.deck, 0.06, 0.96);
  const tie: Pt = [tie0[0], tie0[1] + dip];
  const stringD = smooth([tie, [tie[0] - 34, (tie[1] + hole[1]) / 2 + 6], [hole[0] - 6, hole[1] - 4], hole]);
  const after = t >= NEW_AT;
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.translate(dx, dy)}>
        <S7WallTop />
        <S12WallLow ding={NEW_AT} settle={SETTLE_AT} />
        <Desk />
        <S12Grain />
        <S7DeskBack />
        <S12Thermos x={818} y={1104} />
        <Lamp pose={LAMP_POSE} seed="s12/lamp" />
        <PullChain x={156} y={904} len={92} amp={6} jolt={[NEW_AT + 0.05]} />
        <SteamPuff x={912} y={1046} at={NEW_AT + 0.1} />
        <S7Mug />
        <XG m={mat.translate(0, dip)}>
          {/* THE laptop shows S16's desktop (the same laptop the tag hangs from there; fixer pass, G5b review) */}
          <Laptop x={LAP.x} y={LAP.y} w={LAP.w} variant="new" seed="s12/lap">
            <ScreenDesktop scr={g.scr} />
          </Laptop>
        </XG>
        <S12DeskMid port={[PORT[0], PORT[1] + dip]} ding={NEW_AT} />
        <S12Pip beats={{stick: STICK_T, strike: STRIKE_AT, ding: NEW_AT, on: ON_AT}} />
        <S12DeskFront />
        <Ink d={stringD} width={2.2} />
        {after ? (
          <PriceTag x={TAG.x} y={TAG.y} w={TAG.w} old="$999" ticker={[{t: NEW_AT, v: '$1,099'}]} rot={TAG.rot} seed="s12/tag" />
        ) : (
          <>
            <PriceTag x={TAG.x} y={TAG.y} w={TAG.w} value="$999" rot={TAG.rot} seed="s12/tag" />
            <BigStrike />
          </>
        )}
        {/* the 5x stick from S11 slides into the laptop's keyboard (board move: 0.05 -> 0.50, gone by 0.55) */}
        <StickFlight from={[240, 704]} to={[g.keysC[0], g.keysC[1] + dip]} t0={STICK_T[0]} t1={STICK_T[1]} arc={40} w0={190} w1={120} rot0={-8} rot1={0} end="shrink" ink={4.8} seed="s12/stick" />
      </XG>
    </World>
  );
};
export default S12;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
