// S16_wall (lane S16, G5b; fixer pass): the home base's wall behind the tag at S16's eye-level close-up (38.84-41.15),
// dressed to the approved pilot's level (docs/look/LIFE_AND_DENSITY.md "Approved bar"; docs/v3/density_plan_g5b.md §1
// S16, with docs/v3/cozy_v2_application.md over it).
//   wall top   (y < 290, above the caption band) the attic slope and beam cut by the top-right corner with the paper
//              star hung from it, warm string lights swagged across, instant photos pegged on a cord, a pothos in a
//              hanging pot, a small sea print, plaster ticks.
//   wall low   (y 615-1250) O1'S WINDOW (fixer pass, G5b review: S16 is a cut-in on S15's tag, so it shows what stands
//              behind the tag in S15, not a second room): O1's window at 1.275x on S15's axis (scenes/desk_window.tsx),
//              the glass x 81-999, y 669-1217 under the caption band, its sill on the desk's back edge (y 1250), the
//              frosted corners, the lit town and the dark data center with its lit sign right behind the tag (the flip
//              shows the building that stands behind it); Pip sits on that sill as in S15 (S16.tsx).
// Raw-SVG pieces sit in ExitFade so the loop's un-build (the last 0.3 s) takes them with the fills; the window leaves
// under S16's falling erase edge (desk_window.tsx EraseDown) with the desk, never as a flat rect.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {ExitFade} from '../../../lib/exit';
import {line, polyPath} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {PhotoLine, StarLantern} from './O1_life';
import {DeskWindow, deskWindowMat} from './desk_window';
import {EMBER, FramedPrint, Plant, StringLights3, sway, WallMarks, W, type Pt} from '../kit';

// ---------------------------------------------------------------- timing (S16-local seconds; VO = 38.84 + t)

/** The tag turns over (39.70): its flip moves the room's air a beat later (notes flutter, the lights swing). */
export const S16_TURN = 39.7 - 38.84;
const AIR = S16_TURN + 0.12;

// ---------------------------------------------------------------- the wall above the caption band (y < 290)

/** A pothos in a hanging pot on three cords from a ceiling hook above the frame; sways about the hook. */
const HangingPlant: React.FC<{x: number; y: number; seed: string}> = ({x, y, seed}) => {
  const t = useTime();
  const hookY = -60;
  const a = sway(t, 1.1, 4.3, 0.7);
  const rimY = y - 30;
  const cords = line(x, hookY, x - 24, rimY, {over: [0, 0], seed: `${seed}/c1`}) + line(x, hookY, x + 1, rimY - 2, {over: [0, 0], seed: `${seed}/c2`}) + line(x, hookY, x + 24, rimY, {over: [0, 0], seed: `${seed}/c3`});
  return (
    <XG m={mat.about(mat.rotate(a), x, hookY)}>
      <Ink d={cords} width={W.hair} />
      <Plant x={x} y={y} kind="pothos" size={64} trail={64} amp={2} shakeAt={[AIR + 0.1]} seed={`${seed}/p`} ink={W.far} />
    </XG>
  );
};

/** The attic slope cut by the top-right corner (the ceiling comes down over the desk), its beam and planks. */
const Slope: React.FC = () => {
  const k = 0.6;
  const x0 = 760;
  const yAt = (x: number) => -50 + (x - x0) * k;
  const slope: Pt[] = [[x0, -90], [1180, -90], [1180, yAt(1180)]];
  const beam: Pt[] = [[x0, -50], [1180, yAt(1180)], [1180, yAt(1180) + 28], [x0 - 46, -50]];
  const planks = [52, 104, 156].map((d) => line(x0 + d / k, -50, 1180, yAt(1180) - d, {over: [0, 0], seed: `s16/pl${d}`})).join('');
  return (
    <>
      <Fill d={polyPath(slope)} color={EMBER.slope} offset={false} />
      <Fill d={polyPath(beam)} color={EMBER.beam} seed="s16/beam" />
      <Ink d={line(x0, -50, 1180, yAt(1180), {over: [0, 0], seed: 's16/eave'}) + line(x0 - 46, -50, 1180, yAt(1180) + 28, {over: [0, 0], seed: 's16/eave2'})} width={W.mid} />
      <Ink d={planks} width={W.far} />
    </>
  );
};

export const S16WallTop: React.FC = () => (
  <>
    <WallMarks x={40} y={20} w={420} h={110} n={5} seed="s16/wm1" />
    <WallMarks x={500} y={214} w={240} h={50} n={2} seed="s16/wm2" />
    <Slope />
    {/* the paper star hung from the beam (lit, swaying and turning slowly) */}
    <ExitFade x={1004} y={190}>
      <StarLantern x={1004} hookY={96} cy={190} r={32} litAt={-1} />
    </ExitFade>
    {/* warm string lights swagged from the left edge to the beam (bulbs y 50-200; a bulb twinkles every ~0.5 s); they
        swing when the tag's flip moves the air */}
    <ExitFade x={500} y={120}>
      <StringLights3 points={[[-50, 6], [330, 112], [720, 96], [930, 54]]} sag={26} n={9} r={10} sway={1.6} swingAt={[AIR + 0.04]} seed="s16/lights" />
    </ExitFade>
    {/* instant photos pegged on a cord, top left (bottoms ~262: clear of the band) */}
    <PhotoLine x0={46} y0={186} x1={334} y1={174} sag={13} />
    <ExitFade x={482} y={150}>
      <HangingPlant x={482} y={156} seed="s16/hang" />
    </ExitFade>
    <FramedPrint x={612} y={150} w={108} h={118} picture="sea" seed="s16/print" ink={W.far} />
  </>
);

// ---------------------------------------------------------------- the wall below the band (y 615-1250): O1's window

/** O1's window at S16's cut-in: 1.275x (the tag's own cut-in scale) on S15's axis, the glass's left edge at x 81, the
 *  sill's bottom on the desk's back edge (y 1250). O1 time = S15's end + t (S15 = O1 5.80 + its 2.48 s). */
export const S16_WINDOW = {m: deskWindowMat(1.275, 81, 1250), o1At: 5.8 + (38.84 - 36.36)};
/** The sill's top in S16 (O1 y 1060), where Pip sits. */
export const S16_SILL_Y = 1250 - 26 * 1.275;

export const S16WallLow: React.FC = () => <DeskWindow m={S16_WINDOW.m} o1At={S16_WINDOW.o1At} />;
