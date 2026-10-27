// S16_wall (lane S16, G5b): the home base's wall behind the tag at S16's eye-level close-up (38.84-41.15), dressed to
// the approved pilot's level (docs/look/LIFE_AND_DENSITY.md "Approved bar"; docs/v3/density_plan_g5b.md §1 S16, with
// docs/v3/cozy_v2_application.md over it). The same room as O1 / S7 (string lights, photos on a cord, the paper star,
// a hanging pothos, the attic slope, a pinboard, a calendar, a wall shelf), placed AROUND the locked frame: the tag
// (460, centred on S15's axis) hanging from the laptop's corner over the lamp pool, the lamp shade cut by the left edge.
//   wall top   (y < 290, above the caption band) the attic slope and beam cut by the top-right corner with the paper
//              star hung from it, warm string lights swagged across, instant photos pegged on a cord, a pothos in a
//              hanging pot, a small sea print, plaster ticks.
//   wall low   (y 615-1250) a wall shelf over the tag (books, a framed photo, a jar, a trailing pothos; its lip at
//              y 800 leaves the tag a ~150 px calm ring), a leaf print over the lamp's rod, the 2026 calendar, the
//              wall clock (its second hand ticks), a cork pinboard cut by the right edge, two sticky notes, plaster
//              ticks. The caption band (y 290-600) stays flat wall.
// Raw-SVG pieces sit in ExitFade so the loop's un-build (the last 0.3 s) takes them with the fills.
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {ExitFade} from '../../../lib/exit';
import {circle, line, polyPath, roundRect} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {PhotoLine, StarLantern} from './O1_life';
import {Calendar, EMBER, FramedPrint, Pinboard, Plant, StringLights3, sway, WallClock, WallMarks, WallShelf, W, type Pt} from '../kit';

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

// ---------------------------------------------------------------- the wall below the band (y 615-1250)

/** A sticky note on the wall (a line of writing), its free bottom edge lifting a hair; it flutters in the air. */
const WallNote: React.FC<{x: number; y: number; s: number; rot: number; color: string; seed: string; flutterAt?: number}> = ({x, y, s, rot, color, seed, flutterAt}) => {
  const t = useTime();
  const f = flutterAt !== undefined && t >= flutterAt ? 7 * Math.exp(-(t - flutterAt) * 3.2) * Math.sin((t - flutterAt) * 2 * Math.PI * 3) : 0;
  const a = rot + sway(t, 0.7, 3.7, x * 0.01) + f;
  return (
    <XG m={mat.about(mat.rotate(a), x + s / 2, y)}>
      <Fill rect={[x, y, s, s]} color={color} seed={`${seed}/f`} />
      <Ink d={`M${x} ${y}h${s}v${s}h${-s}Z`} width={W.hair} />
      <Ink d={line(x + s * 0.15, y + s * 0.4, x + s * 0.8, y + s * 0.38, {over: [0, 0], seed: `${seed}/l1`}) + line(x + s * 0.15, y + s * 0.62, x + s * 0.6, y + s * 0.62, {over: [0, 0], seed: `${seed}/l2`})} width={W.hair} />
    </XG>
  );
};

/** A small framed photo standing on the shelf (two figures under a dusk sky: a holiday snap). */
const StandingPhoto: React.FC<{x: number; y: number; w: number; seed: string}> = ({x, y, w, seed}) => {
  const h = w * 1.22;
  const top = y - h;
  const m = w * 0.13;
  return (
    <>
      <Fill rect={[x, top, w, h]} color={EMBER.beam} seed={`${seed}/fr`} />
      <Fill rect={[x + m, top + m, w - 2 * m, h - 2 * m]} color={EMBER.skyLow} offset={false} />
      <Fill rect={[x + m, top + h * 0.62, w - 2 * m, h * 0.38 - m]} color={EMBER.snow} offset={false} />
      <Fill d={circle(x + w * 0.4, top + h * 0.46, w * 0.08) + circle(x + w * 0.62, top + h * 0.5, w * 0.07)} color={EMBER.anchor} offset={false} />
      <Fill rect={[x + w * 0.33, top + h * 0.53, w * 0.14, h * 0.18]} color={EMBER.books[4]} offset={false} />
      <Fill rect={[x + w * 0.56, top + h * 0.56, w * 0.12, h * 0.15]} color={EMBER.books[1]} offset={false} />
      <Ink d={`M${x} ${top}h${w}v${h}h${-w}Z`} width={W.far} />
    </>
  );
};

/** A glass jar of buttons and a spool (warm confetti) on the shelf. */
const Jar: React.FC<{x: number; y: number; w: number; seed: string}> = ({x, y, w, seed}) => {
  const h = w * 1.3;
  const top = y - h;
  const body = roundRect(x, top + 8, w, h - 8, 10);
  const dots: [number, number, string][] = [
    [0.3, 0.72, EMBER.books[0]],
    [0.62, 0.8, EMBER.books[4]],
    [0.46, 0.58, EMBER.dc],
    [0.72, 0.6, EMBER.books[6]],
    [0.26, 0.48, EMBER.hl],
  ];
  return (
    <>
      <Fill d={body} color={EMBER.frost} seed={`${seed}/g`} />
      {dots.map(([u, v, c], i) => (
        <Fill key={i} d={circle(x + w * u, top + h * v, w * 0.11)} color={c} offset={false} />
      ))}
      <Fill rect={[x + w * 0.12, top, w * 0.76, 12]} color={EMBER.beam} seed={`${seed}/lid`} />
      <Ink d={body + `M${x + w * 0.12} ${top}h${w * 0.76}v12h${-w * 0.76}Z`} width={W.far} />
      <Ink d={line(x + w * 0.2, top + h * 0.3, x + w * 0.2, top + h * 0.62, {over: [0, 0], seed: `${seed}/gl`})} width={W.hair} color={EMBER.white} />
    </>
  );
};

/** The wall shelf over the tag: a plank on brackets with books (kit ShelfFill), a framed photo, a jar, and a pothos
 *  trailing over its left end. */
const Shelf: React.FC = () => (
  <>
    <WallShelf x={236} y={800} w={492} room={128} seed="s16/shelf" ink={W.far} />
    <StandingPhoto x={604} y={800} w={70} seed="s16/sphoto" />
    <Jar x={676} y={800} w={44} seed="s16/jar" />
    <ExitFade x={282} y={820}>
      <Plant x={282} y={800} kind="pothos" size={54} trail={104} amp={3} period={3.3} shakeAt={[AIR + 0.2]} seed="s16/shelfpothos" ink={W.far} />
    </ExitFade>
  </>
);

export const S16WallLow: React.FC = () => (
  <>
    <WallMarks x={170} y={880} w={100} h={80} n={2} seed="s16/wm3" />
    <WallMarks x={760} y={1010} w={90} h={90} n={2} seed="s16/wm4" />
    <WallMarks x={330} y={860} w={360} h={60} n={2} seed="s16/wm5" />
    {/* over the lamp's rod, left: a small leaf print */}
    <FramedPrint x={24} y={622} w={100} h={112} picture="leaf" seed="s16/print2" ink={W.far} />
    <Shelf />
    {/* right column: the 2026 calendar, the clock (its second hand ticks), the pinboard cut by the right edge */}
    <ExitFade x={844} y={672}>
      <Calendar x={792} y={624} w={104} from="2026" seed="s16/cal" ink={W.far} />
    </ExitFade>
    <ExitFade x={1006} y={676}>
      <WallClock cx={1006} cy={676} r={50} seed="s16/clock" ink={W.far} startMin={12} />
    </ExitFade>
    <ExitFade x={960} y={860}>
      <Pinboard x={806} y={772} w={330} h={196} items={['photo', 'note', 'postcard', 'ticket', 'note', 'photo']} flutterAt={[0.14, AIR, 1.62]} seed="s16/pin" ink={W.far} />
    </ExitFade>
    {/* two sticky notes on the wall over Pip (reminders) */}
    <WallNote x={848} y={1010} s={54} rot={-6} color={EMBER.core} seed="s16/wn1" flutterAt={AIR + 0.08} />
    <WallNote x={912} y={1034} s={50} rot={7} color={EMBER.hl} seed="s16/wn2" flutterAt={1.54} />
  </>
);
