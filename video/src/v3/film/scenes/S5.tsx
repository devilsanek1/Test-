// S5 (lane L3-you; G5b dense blocking, S5 lane): MEDIUM waist-up, the one face beat, 9.48-11.48 ("Usually right after
// you buy one."). Locked board (public/v3/animatic.json S5, docs/v3/camera_plan_g3.md): You (kit YouFront, front view)
// left of centre behind a shop counter that cuts you at the waist, holding YOUR laptop with its $999 tag, happy; upper
// right an empty display shelf. On "after" (10.20, t 0.72; the pop leads it by 0.14 s) the NEW laptop, bigger and
// labelled BETTER, pops onto the shelf with the SAME $999 tag, the shelf's display light snaps on (the production
// emphasis), and your face goes worried, eyes on it. Before (yours) left, after (NEW) right; the tags stay 190 px and
// clear of the laptops. Camera: HOLD, breathing in 1.5 % (ease in-out) between your face and the new laptop. Caption
// band (y 290-600) is flat wall: the BETTER label's top sits at y ~607.
// G5b (density_plan_g5b S5; the approved pilot bar): a real computer shop round the locked beat, built in
// S5_shop.tsx (the ceiling with its sign, bulbs, clock and dome camera; the front window onto the snowy street with
// passers-by and a customer reading a box; the near wall's pegboard of accessories, the shelf's router and boxes, the
// lower shelf with a monitor cycling slides) and S5_counter.tsx (the counter seen from the till side: its top with the
// bell, card reader, receipt printer and USB jar, the staff cubbies full of bags, binders, rolls and boxes; the shop
// assistant's big back in the foreground). Pip sits on the counter watching you; its head whips to the BETTER laptop
// just before your face turns (it points the eye), and on "buy one" it turns to us and shrugs. BUSY profile (cozy v2:
// "breathe as built").
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, hline, poly, polyPath, vline} from '../../../lib/sketch';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER, Laptop, laptopGeo, Pip3, Pop, PriceTag, quadPt, Show, YouFront, type Pt} from '../kit';
import {S5Ceiling, S5Customer, S5ShelfExtras, S5Wall, S5Window, type ShopBeats} from './S5_shop';
import {S5Assistant, S5Counter, S5CounterTop} from './S5_counter';

const DUR = 11.48 - 9.48;
/** "after" (VO 10.20). */
const AFTER = 10.2 - 9.48;
/** The new laptop pops a little ahead of the word (ENGINE rule 5: lead the voice). */
const NEW_AT = AFTER - 0.14;
/** The face reacts on the word, a beat after the pop. */
const FACE_AT = AFTER;
/** Pip's head whips to the new laptop 3 frames before your face turns (it points the eye). */
const PIP_WHIP = FACE_AT - 3 / 60;
/** "buy one" (VO 10.60-10.92): Pip turns to us and shrugs. */
const BUY_ONE = 10.6 - 9.48;
/** Your receipt prints (VO 9.70-10.30: the loop). */
const FEED_AT = 9.7 - 9.48;
const FEED_DUR = 0.6;
/** The world's beats round the pop. */
const BEATS: ShopBeats = {popAt: NEW_AT, customerTurn: NEW_AT + 0.22, slides: [0.06, 1.34]};
/** Pip's perch on the counter top (feet), left of your laptop and under your arm. */
const PIP_AT: Pt = [272, 1440];

/** The display shelf (plank top y; cut by the right edge). */
const SHELF = {x0: 470, x1: 1140, y: 958, h: 20};
/** You: head centre x, head top y, head height. */
const YOU = {x: 330, y: 735, head: 240};
/** Your laptop (hinge centre, lid width) and the NEW one, 1.2x, standing on the shelf (its front edge on the plank). */
const MINE = {x: 515, y: 1175, w: 250};
const NEW = {x: 690, y: SHELF.y - 0.28 * 300, w: 300};
const TAG_W = 190;
const TAG_ROT = -6;

const Shelf: React.FC = () => {
  const {x0, x1, y, h} = SHELF;
  const bracket = (bx: number): Pt[] => [[bx - 10, y + h], [bx + 10, y + h], [bx + 10, y + h + 70], [bx - 10, y + h + 18]];
  return (
    <>
      {[560, 960].map((bx) => (
        <React.Fragment key={bx}>
          <Fill d={polyPath(bracket(bx))} color={EMBER.beam} seed={`s5/br${bx}`} />
          <Ink d={poly(bracket(bx), {closed: true, seed: `s5/brI${bx}`, over: [0, 2]})} width={2.2} />
        </React.Fragment>
      ))}
      <Fill rect={[x0, y, x1 - x0, h]} color={EMBER.shelf} seed="s5/plank" />
      <Fill rect={[x0, y + h - 6, x1 - x0, 6]} color={EMBER.desk} offset={false} />
      <Ink d={hline(x0, x1, y, {seed: 's5/pl1', over: [0, 3]}) + hline(x0, x1, y + h, {seed: 's5/pl2', over: [0, 2]}) + vline(x0, y, y + h, {seed: 's5/pl3', over: [0, 0]})} width={3.4} />
    </>
  );
};

const S5: React.FC = () => {
  const t = useTime();
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  const worried = t >= FACE_AT;
  const gm = laptopGeo(MINE.x, MINE.y, MINE.w);
  const gn = laptopGeo(NEW.x, NEW.y, NEW.w);
  // your hands hold the deck's sides; your tag hangs from its front edge (left third), the new one's from the right
  const handL = quadPt(gm.deck, -0.02, 0.62);
  const handR = quadPt(gm.deck, 1.02, 0.62);
  const mineTie = quadPt(gm.deck, 0.3, 1);
  const newTie = quadPt(gn.deck, 0.82, 1);
  const mineTag = {x: 452, y: 1278};
  const newTag = {x: 738, y: 1000};
  return (
    <World sky={EMBER.wall}>
      <XG m={mat.about(mat.scale(z), 520, 960)}>
        <S5Ceiling />
        <S5Window />
        <S5Customer turnAt={BEATS.customerTurn} />
        {/* the display light behind the shelf: snaps on with the new laptop */}
        <Show at={NEW_AT}>
          <Fill d={blob(NEW.x, 800, 240, 188, {seed: 's5/spot1', wobble: 0.02})} color={EMBER.core} offset={false} />
        </Show>
        <S5Wall beats={BEATS} />
        <Shelf />
        <S5ShelfExtras beats={BEATS} />
        <Pop at={NEW_AT} x={NEW.x} y={SHELF.y} dur={0.16} overshoot>
          <PriceTag x={newTag.x} y={newTag.y} w={TAG_W} value="$999" stringFrom={newTie} rot={TAG_ROT} seed="s5/tagNew" />
          <Laptop x={NEW.x} y={NEW.y} w={NEW.w} variant="new" label="BETTER" seed="s5/new" />
        </Pop>
        <YouFront
          x={YOU.x}
          y={YOU.y}
          head={YOU.head}
          face={[{t: -1, face: 'happy'}, {t: FACE_AT, face: 'worried'}]}
          look={worried ? 0.9 : 0}
          hands={[handL, handR]}
          seed="s5/you"
        >
          <Laptop x={MINE.x} y={MINE.y} w={MINE.w} variant="old" seed="s5/mine" />
          <PriceTag x={mineTag.x} y={mineTag.y} w={TAG_W} value="$999" stringFrom={mineTie} rot={TAG_ROT} seed="s5/tagMine" />
        </YouFront>
        <S5Counter />
        <S5CounterTop feedAt={FEED_AT} feedDur={FEED_DUR} />
        <Pip3
          x={PIP_AT[0]}
          y={PIP_AT[1]}
          keys={[
            {t: 0, pose: 'sit-back'},
            {t: BUY_ONE, pose: 'shrug'},
          ]}
          look={[
            {t: 0, v: 0.35},
            {t: PIP_WHIP, v: 1},
            {t: BUY_ONE, v: 0},
          ]}
          lookDur={0.1}
          seed={5}
        />
        <S5Assistant turnAt={NEW_AT + 0.3} />
      </XG>
    </World>
  );
};
export default S5;

/** Ink captions on the wall. */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
