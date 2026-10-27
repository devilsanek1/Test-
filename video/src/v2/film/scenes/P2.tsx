// P2 (lane L2-nook): HOME BASE, the nook WIDE at eye level, 6.12-8.36 ("You'd think that's one odd contract.").
// ONE idea: one odd contract, hers. She stands in her nook (the kit's dense room: bookcase cut left, curtain right, the
// wall cabinet and high shelf at the top, the window onto the living dusk town, the lamp's golden light on her desk,
// her chair, the coat, the clock, the rug, the floor plant) holding her contract up; it hangs to the floor and runs on
// toward us with its years (the running line only ever on HER page). The sheet in her hands is a little wider than
// the board's (150) and hand-lettered CONTRACT over its clause band, so with the sound off the long strip reads as
// O1's JOB CONTRACT running on, not a till receipt. The run-on keeps creeping toward us through the
// whole shot (it never stops: the core line, made physical). Her cat sits on the sill and watches the run-on's leading
// edge (its eye-line leads the viewer down to it). Camera: HOLD (the board), breathing in 1.5 % on her page; the world
// inside keeps living (the town, steam, the lamp's motes, the clock, the curtain, her idle life, the cat's life).
// Credit (Film2's tab): "Her account to BBC News, 21 Oct 2026".
import React from 'react';
import {World} from '../../../lib/World';
import type {ToneKey} from '../../../lib/Film';
import {ease, prog, useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {CC, CL_X, CONTRACT_PAGE, ContractPage, Fill, FloorRun, HerStanding, Letter, NOOK, NookRoom, lerp, type Pt} from '../kit';
import {SecondHand} from './P13_nook';

const START = 6.12;
const DUR = 8.36 - START;
/** Her page (the board's: held up at (640, 1170), w 120, widened to 150 for its lettered title; the run-on hangs to
 *  the floor at y ~1612). */
const PAGE = {x: 640, y: 1170, w: 150};
const PS = PAGE.w / CONTRACT_PAGE.w;
const RUN_ON = 1612 - (PAGE.y + CONTRACT_PAGE.h * PS);
const HANDS: [Pt, Pt] = [[648, 1176], [PAGE.x + PAGE.w - 8, 1180]];
/** The run-on on the floor: from where the hanging strip meets the floor toward us (the board's second page). */
const RUN = {from: {x0: PAGE.x, x1: PAGE.x + PAGE.w, y: 1612}, to: {x0: 560, x1: 960, y: 1880}};
/** The lettered title (page-local px): below her hands (they hold the top corners), over the simple face's title bar
 *  and its two text lines (y 56, 110, 156), which a paper patch paints out; the clause bands (y ~230-320) stay. */
const TITLE = {patch: [30, 170] as [number, number], y: 150, size: 31};
/** How far the floor run has crept out: it keeps running on through the shot (0.7 at the cut, all out at the end). */
const runP = (t: number) => lerp(0.7, 1, prog(t, -0.2, DUR + 0.2, ease.inOutSine));

const P2: React.FC = () => {
  const t = useTime();
  const S = NOOK.herStand;
  const p = runP(t);
  // the leading edge of the run-on: the cat watches it (nook world px = P2 canvas px)
  const lead: Pt = [lerp(RUN.from.x0, RUN.to.x0, p) + lerp(RUN.from.x1 - RUN.from.x0, RUN.to.x1 - RUN.to.x0, p) / 2, lerp(RUN.from.y, RUN.to.y, p)];
  // HOLD, breathing in 1.5 % on her page
  const z = 1 + 0.015 * prog(t, 0, DUR, ease.inOutSine);
  return (
    <World sky={CC.wall}>
      <XG m={mat.about(mat.scale(z), PAGE.x + 60, 1330)}>
        <NookRoom layout="wide" cat={{pose: 'sit', facing: 'l', size: 120, look: lead, seed: 'p2/cat/366'}}>
          <SecondHand />
          <HerStanding x={S.x} y={S.y} h={S.h} facing="r" face="calm" hands={HANDS} seed="p2/her">
            <ContractPage x={PAGE.x} y={PAGE.y} w={PAGE.w} runOn={RUN_ON} seed="p2/page" />
            {/* CONTRACT, hand-lettered over the simple face's title bar (paper over the bar, then the word) */}
            <Fill rect={[PAGE.x + 3, PAGE.y + TITLE.patch[0] * PS, PAGE.w - 6, (TITLE.patch[1] - TITLE.patch[0]) * PS]} color={CC.paper} offset={false} />
            <Letter x={PAGE.x + PAGE.w / 2} y={PAGE.y + TITLE.y * PS} size={TITLE.size} fit={PAGE.w - 2 * CL_X * PS} anchor="middle">
              CONTRACT
            </Letter>
          </HerStanding>
          <FloorRun from={RUN.from} to={RUN.to} p={p} firstYear={2080} decades={3} seed="p2/run" />
        </NookRoom>
      </XG>
    </World>
  );
};
export default P2;

/** Ink captions on the cream wall (the band holds the upper cabinet's flat doors, the wall and the curtain rod). */
export const captionTone: ToneKey[] = [{t: 0, tone: 'dark'}];
