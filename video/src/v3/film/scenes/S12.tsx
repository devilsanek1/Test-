// S12 (lane L2-inserts): CLOSE on the laptop and its price tag, 29.40-31.32 ("And laptop makers pass that on.").
// Locked board (animatic S12, camera_plan_g3, storyboard_g3): slightly high, S7's angle family (the kit laptop's 3/4
// view from above); THE laptop centred on the desk (light screen: the storyboard's cold-read fix, and the same
// variant S16's tag hangs from); the 5x memory stick slides in from the upper left into its keyboard (t 0.05 -> 0.50);
// under it O1's price tag is the subject: "$999" struck on "makers" (29.96), "$1,099" pops on "pass" with the ding
// (30.28), so the change holds 1 s. The board's emphasis becomes light: the lamp's golden pool lies under the laptop
// and the tag (the burnt-orange tag reads on its core). Camera: HOLD, breathing in 1.5 % toward the tag.
//
// The tag is the kit PriceTag in two key poses: before the step, the big "$999" (value mode) with its strike drawn
// on over it; from the step, the kit's struck-old layout ("$999" small, struck, "$1,099" big) whose ticker step pops
// the new price and jolts the tag, so the swap reads as one hit with the ding.
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, hline, line, smooth} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Laptop, laptopGeo, PriceTag, quadPt, StickFlight, tagHole, textW, type Pt} from '../kit';
import {breathe} from './S4_wall';

const START = 29.4;
const DUR = 31.32 - START;
/** "makers" (29.96): the strike draws on just ahead so it lands on the word. */
const STRIKE_AT = 29.96 - START - 0.06;
/** "pass" (30.28) = the ding: the new price pops 1 frame ahead so its peak lands with the sound. */
const NEW_AT = 30.28 - START - 0.02;

/** The desk's back edge (the wall above it is the calm caption band). */
const DESK_Y = 1000;
/** THE laptop: hinge centre and lid width (board: centred, w ~400, top ~880). */
const LAP = {x: 540, y: 1110, w: 420};
/** The tag (board: centred under the laptop, w 380). */
const TAG = {x: 338, y: 1268, w: 400, rot: -4};
const POOL = {cx: 545, cy: 1250, rx: 480, ry: 178};

const Desk: React.FC = () => (
  <>
    <Fill rect={[-60, DESK_Y, 1200, 1060]} color={EMBER.desk} offset={false} />
    <Fill d={blob(POOL.cx, POOL.cy, POOL.rx, POOL.ry, {seed: 's12/pool1', wobble: 0.02})} color={EMBER.ring} offset={false} />
    <Fill d={blob(POOL.cx - 8, POOL.cy + 6, POOL.rx * 0.62, POOL.ry * 0.62, {seed: 's12/pool2', wobble: 0.025})} color={EMBER.core} offset={false} />
    <Ink d={hline(-60, 1140, DESK_Y, {seed: 's12/deskE', over: 'structural'})} width={3.4} />
    <Ink d={line(40, DESK_Y + 120, 250, DESK_Y + 124, {seed: 's12/gr1', over: [0, 0]}) + line(760, DESK_Y + 560, 1040, DESK_Y + 566, {seed: 's12/gr2', over: [0, 0]})} width={2.2} />
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
  const z = breathe(t, DUR);
  const g = laptopGeo(LAP.x, LAP.y, LAP.w);
  const [hx, hy] = tagHole(TAG.w);
  const hole: Pt = [TAG.x + hx, TAG.y + hy];
  // the tag's string ties on at the deck's front-left corner and lies in a loose curve to the eyelet
  const tie = quadPt(g.deck, 0.06, 0.96);
  const stringD = smooth([tie, [tie[0] - 34, (tie[1] + hole[1]) / 2 + 6], [hole[0] - 6, hole[1] - 4], hole]);
  const tagC: Pt = [TAG.x + TAG.w * 0.55, TAG.y + TAG.w * 0.25];
  const after = t >= NEW_AT;
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), tagC[0], tagC[1] - 60)}>
        <Desk />
        <Laptop x={LAP.x} y={LAP.y} w={LAP.w} variant="new" seed="s12/lap" />
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
        <StickFlight from={[240, 704]} to={g.keysC} t0={0.05} t1={0.5} arc={40} w0={150} w1={84} rot0={-8} rot1={0} end="shrink" seed="s12/stick" />
      </XG>
    </World>
  );
};
export default S12;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
