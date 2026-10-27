// S7_desk (lane S7-S8, G5b): the home base's DESK set at S7's close (16.60-18.28), dressed to the approved pilot's level
// (O1's desk world: docs/look/LIFE_AND_DENSITY.md "Approved bar"; docs/v3/density_plan_g5b.md §1 S7, overridden by
// docs/v3/cozy_v2_application.md). Everything sits AROUND the locked board (the laptop at 420 in the lamp pool, the lamp
// shade cut by the left edge, the see-inside bubble upper right on "your"; no window):
//   wall top     (above the caption band, y < 290) warm string lights swagged from the top edge, instant photos pegged on
//                a cord, a pothos in a hanging pot, a small sea print, plaster ticks.
//   wall low     (y 615-1000) a cork pinboard between the lamp and the bubble (photos, notes, the sea postcard, a ticket;
//                nothing behind the bubble), a wall shelf cut by the right edge (books, a trailing pothos), the 2026 wall
//                calendar, a socket with the lamp's plug.
//   desk back    a book stack with a pen cup, a candle in a jar (the flame flickers), the mug (steam), a small speaker.
//   desk mid     headphones in the pool's rim, a plate of biscuits, glasses, sticky notes (one flutters at 16.7), the
//                charger cable running into the laptop's right port (it leads the eye in).
//   desk front   a spiral notebook and a pen cut by the left edge, letters, your phone face down cut by the bottom edge,
//                O1's open planner cut by the bottom-right corner, wood grain, crumbs.
//   Pip          on the desk right of the laptop (1.4x), watching it; turns up to the bubble a few frames before it pops,
//                then rises on its toes (a small hop) on "your" (17.24).
// Cool share (cozy v2 §4, >= 10 %): the laptop's off screen in dcSide (S7.tsx), the dusk-blue notebook cover, the sea
// print and postcard, the headphones, the pen cup, Pip's lilac. Dressing never takes the hero orange or the blue pop.
// Every piece is built from the cut (no `at`): S7 opens on a hard cut, not on a draw-on.
import React, {useId} from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, ellipse, line, poly, polyPath, roundRect, textLines} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {Letters, PhotoLine, Planner} from './O1_life';
import {
  BookStack,
  Cable,
  Calendar,
  DeskGrain,
  EMBER,
  FramedPrint,
  Glasses,
  Headphones,
  Mug,
  PenCup,
  Pinboard,
  Pip3,
  Plant,
  PullChain,
  Speaker,
  StickyNotes,
  StringLights3,
  sway,
  WallMarks,
  WallShelf,
  W,
  type LookKey,
  type Pt,
} from '../kit';

// ---------------------------------------------------------------- shared timing (S7-local seconds; VO = 16.60 + t)

/** "your" (17.24): the bubble pops 0.10 s ahead of the word (S7.tsx LENS_AT). */
export const S7_LENS_AT = 17.24 - 16.6 - 0.1;
/** A sticky note flutters (16.7): the room's air, the first event after the cut. */
const NOTE_FLUTTER = 16.7 - 16.6;

// ---------------------------------------------------------------- the wall above the caption band (y < 290)

/** A pothos in a hanging pot on three cords from a ceiling hook (above the frame); sways about the hook. */
const HangingPlant: React.FC<{x: number; y: number; seed: string}> = ({x, y, seed}) => {
  const t = useTime();
  const hookY = -60;
  const a = sway(t, 1.2, 4.1, 0.3);
  const rimY = y - 30;
  const cords = line(x, hookY, x - 22, rimY, {over: [0, 0], seed: `${seed}/c1`}) + line(x, hookY, x + 1, rimY - 2, {over: [0, 0], seed: `${seed}/c2`}) + line(x, hookY, x + 22, rimY, {over: [0, 0], seed: `${seed}/c3`});
  return (
    <XG m={mat.about(mat.rotate(a), x, hookY)}>
      <Ink d={cords} width={W.hair} />
      <Plant x={x} y={y} kind="pothos" size={60} trail={70} amp={2} seed={`${seed}/p`} ink={W.far} />
    </XG>
  );
};

export const S7WallTop: React.FC = () => (
  <>
    <WallMarks x={30} y={18} w={430} h={120} n={5} seed="s7/wm1" />
    <WallMarks x={640} y={196} w={330} h={62} n={3} seed="s7/wm2" />
    {/* warm string lights swagged from the top edge (bulbs y 60-170; a bulb twinkles every ~0.5 s) */}
    <StringLights3 points={[[-40, 4], [330, 96], [742, 84], [1120, -6]]} sag={24} n={8} r={9} sway={1.6} seed="s7/lights" />
    {/* instant photos pegged on a cord, top left (bottoms ~258: clear of the band) */}
    <PhotoLine x0={44} y0={182} x1={298} y1={172} sag={12} />
    <HangingPlant x={566} y={150} seed="s7/hang" />
    <FramedPrint x={846} y={128} w={116} h={134} picture="sea" seed="s7/print" ink={W.far} />
  </>
);

// ---------------------------------------------------------------- the wall below the band (y 615-1000)

/** A wall socket with the lamp's plug in it; the cable droops off the left edge (to the lamp's base). */
const Socket: React.FC<{x: number; y: number}> = ({x, y}) => {
  const plate = roundRect(x - 36, y - 26, 72, 52, 8);
  const cable = `M${x - 14} ${y + 14}C${x - 20} ${y + 46} ${x - 70} ${y + 52} ${x - 120} ${y + 44}S${x - 220} ${y + 26} ${x - 300} ${y + 40}`;
  return (
    <>
      <Fill d={plate} color={EMBER.card} seed="s7/sock" />
      <Ink d={roundRect(x - 36, y - 26, 72, 52, 8, {closed: false, seed: 's7/sockI'})} width={W.far} />
      <Fill d={circle(x + 15, y, 9)} color={EMBER.reveal} offset={false} />
      <Ink d={circle(x + 15, y, 9, {seed: 's7/sockO'})} width={W.hair} />
      <path d={`M${x + 11} ${y}h1.6M${x + 17.4} ${y}h1.6`} stroke={EMBER.ink} strokeWidth={2.6} strokeLinecap="round" />
      <path d={cable} fill="none" stroke={EMBER.ink} strokeWidth={9} strokeLinecap="round" />
      <path d={cable} fill="none" stroke={EMBER.anchor} strokeWidth={5.4} strokeLinecap="round" />
      <Fill d={roundRect(x - 26, y - 14, 24, 30, 5)} color={EMBER.anchor} offset={false} />
      <Ink d={roundRect(x - 26, y - 14, 24, 30, 5, {closed: false, seed: 's7/plugI'})} width={W.hair} />
    </>
  );
};

export const S7WallLow: React.FC = () => (
  <>
    <WallMarks x={196} y={880} w={110} h={70} n={2} seed="s7/wm3" />
    <WallMarks x={470} y={640} w={80} h={160} n={2} seed="s7/wm4" />
    {/* the pinboard between the lamp and the bubble; nothing pinned behind the bubble (x >= 560) */}
    <Pinboard x={192} y={636} w={276} h={194} items={['photo', 'note', 'postcard', 'ticket', 'note', 'photo']} flutterAt={[NOTE_FLUTTER + 0.04, 0.96]} seed="s7/pin" ink={W.far} />
    {/* a wall shelf cut by the right edge: books, and a pothos trailing over its lip (the leaf sway idle) */}
    <WallShelf x={838} y={806} w={290} room={118} seed="s7/shelf" ink={W.far} />
    <Plant x={872} y={806} kind="pothos" size={50} trail={118} amp={3} period={3.4} seed="s7/shelfpothos" ink={W.far} />
    <Calendar x={952} y={866} w={100} from="2026" seed="s7/cal" ink={W.far} />
    <Socket x={268} y={948} />
  </>
);

// ---------------------------------------------------------------- the desk: back row

/** A candle in a glass jar, lit: the flame flickers on drawn poses (12 / s) and leans with the room's air. */
const Candle: React.FC<{x: number; y: number; w?: number; seed: string}> = ({x, y, w = 52, seed}) => {
  const t = useTime();
  const h = w * 1.12;
  const jar = `M${x - w / 2} ${y - h}L${x - w / 2} ${y - 8}Q${x - w / 2} ${y} ${x - w / 2 + 8} ${y}L${x + w / 2 - 8} ${y}Q${x + w / 2} ${y} ${x + w / 2} ${y - 8}L${x + w / 2} ${y - h}`;
  const waxTop = y - h * 0.56;
  const k = Math.floor(t * 12);
  const fr = rng(`${seed}/flame${k}`);
  const fh = 21 * (0.86 + 0.28 * fr.next());
  const lean = 3 * Math.sin(t * 2.3) + fr.jitter(1.6);
  const fy = waxTop - 6;
  const flame = `M${x - 7} ${fy}Q${x - 8} ${fy - fh * 0.5} ${x + lean} ${fy - fh}Q${x + 8} ${fy - fh * 0.5} ${x + 7} ${fy}Q${x} ${fy + 5} ${x - 7} ${fy}Z`;
  const core = `M${x - 3.5} ${fy}Q${x - 4} ${fy - fh * 0.3} ${x + lean * 0.5} ${fy - fh * 0.55}Q${x + 4} ${fy - fh * 0.3} ${x + 3.5} ${fy}Z`;
  const haloR = 38 + (k % 3) * 1.5;
  return (
    <>
      <path d={blob(x, fy - 12, haloR, haloR * 0.92, {seed: `${seed}/h1`})} fill={EMBER.ring} />
      <path d={blob(x, fy - 12, haloR * 0.6, haloR * 0.56, {seed: `${seed}/h2`})} fill={EMBER.core} />
      <Fill d={`${jar}Z`} color={EMBER.frost} seed={`${seed}/jar`} />
      <Fill rect={[x - w / 2 + 5, waxTop, w - 10, y - waxTop - 5]} color={EMBER.card} offset={false} />
      <Fill rect={[x - w / 2 + 5, y - h * 0.3, w - 10, 9]} color={EMBER.pot} offset={false} />
      <Ink d={jar + ellipse(x, y - h, w / 2, 6, {seed: `${seed}/rim`})} width={W.far} />
      <Ink d={line(x, waxTop, x, waxTop - 7, {over: [0, 0], seed: `${seed}/wick`})} width={W.hair} />
      <Ink d={line(x - w * 0.3, y - h * 0.85, x - w * 0.3, y - h * 0.55, {over: [0, 0], seed: `${seed}/gl`})} width={W.hair} color={EMBER.white} />
      <path d={flame} fill={EMBER.houseLit} stroke={EMBER.ink} strokeWidth={1.4} />
      <path d={core} fill={EMBER.core} />
    </>
  );
};

/** Behind the laptop: books + pen cup + candle left, the mug and a speaker right (the mug stays behind Pip). */
export const S7DeskBack: React.FC = () => (
  <>
    <BookStack x={40} y={1086} w={156} n={3} seed="s7/stack" ink={W.far} />
    <PenCup x={150} y={1028} w={50} seed="s7/pens" ink={W.far} />
    <Plant x={84} y={1030} kind="succulent" size={40} seed="s7/succ" ink={W.far} />
    <Candle x={258} y={1104} seed="s7/candle" />
    <Speaker x={1046} y={1098} w={64} h={92} seed="s7/spk" ink={W.far} />
  </>
);

/** The mug (as G5 built it, moved right of Pip: it keeps steaming at the pool's right rim). */
export const S7Mug: React.FC = () => <Mug x={912} top={1058} w={84} seed="s7/mug" />;

// ---------------------------------------------------------------- the desk: mid

/** A plate of biscuits (one bitten) and crumbs, at the pool's left rim. */
const Biscuits: React.FC<{x: number; y: number; k?: number; seed: string}> = ({x, y, k = 1, seed}) => {
  const r = rng(`${seed}/r`);
  const plate = ellipse(x, y, 84 * k, 25 * k, {seed: `${seed}/plate`});
  const rim = ellipse(x, y - 2 * k, 62 * k, 17 * k, {seed: `${seed}/rim`});
  const cookies: [number, number, number][] = [[x - 26 * k, y - 8 * k, 27 * k], [x + 22 * k, y - 2 * k, 25 * k], [x + 2 * k, y - 18 * k, 23 * k]];
  return (
    <>
      <Fill d={plate} color={EMBER.card} seed={`${seed}/plateF`} />
      <Ink d={plate + rim} width={W.far} />
      {cookies.map(([cx, cy, cr], i) => {
        const bite = i === 2;
        const d = bite ? `M${cx - cr} ${cy}A${cr} ${cr * 0.62} 0 1 0 ${cx + cr * 0.62} ${cy - cr * 0.5}Q${cx + cr * 0.3} ${cy - cr * 0.12} ${cx + cr * 0.55} ${cy + cr * 0.1}Q${cx + cr * 0.1} ${cy - cr * 0.3} ${cx - cr} ${cy}Z` : ellipse(cx, cy, cr, cr * 0.62, {seed: `${seed}/ck${i}`});
        const chips = [0, 1, 2, 3].map((j) => blob(cx + r.jitter(cr * 0.55), cy + r.jitter(cr * 0.3), 3.2 * k, 2.4 * k, {seed: `${seed}/chip${i}${j}`})).join('');
        return (
          <React.Fragment key={i}>
            <Fill d={d} color={EMBER.books[6]} seed={`${seed}/ckF${i}`} />
            <Ink d={d} width={W.hair} />
            <Fill d={chips} color={EMBER.anchor} offset={false} />
          </React.Fragment>
        );
      })}
      {[[x + 70 * k, y + 30 * k, 3], [x + 92 * k, y + 22 * k, 2.4], [x + 58 * k, y + 40 * k, 2]].map(([cx, cy, cr], i) => (
        <Fill key={`cr${i}`} d={circle(cx, cy, cr * k)} color={EMBER.books[6]} offset={false} />
      ))}
    </>
  );
};

/** The laptop's right side port (the kit laptop's right deck side, S7.tsx's geometry): the charger plug sits in it. */
export const S7_PORT: Pt = [768, 1198];

export const S7DeskMid: React.FC = () => (
  <>
    <Headphones x={108} y={1252} w={172} seed="s7/hp" ink={W.far} />
    <Biscuits x={150} y={1398} seed="s7/biscuits" />
    {/* the charger: from the right edge across the desk, under Pip, into the laptop's right port */}
    <Cable points={[S7_PORT, [812, 1226], [900, 1258], [1004, 1246], [1130, 1292]]} plug width={7} color={EMBER.dcSide} />
    <Glasses x={962} y={1352} w={122} rot={-14} seed="s7/glasses" ink={W.far} />
    <StickyNotes x={842} y={1402} n={2} size={68} flutterAt={[NOTE_FLUTTER]} seed="s7/sticky" />
  </>
);

// ---------------------------------------------------------------- the desk: front (y > 1400)

/** A spiral notebook (dusk-blue cover, ruled pages, the wire spiral along its top) lying in perspective, cut by the
 *  frame edge; `quad` = the cover's back-left, back-right, front-right, front-left. A pen lies across it. Shared with S8
 *  (its spiral and pen cut by the left edge). */
export const SpiralNotebook: React.FC<{quad: [Pt, Pt, Pt, Pt]; rings?: number; pen?: [Pt, Pt]; ink?: number; seed: string}> = ({quad, rings = 9, pen, ink = W.mid, seed}) => {
  const [bl, br, fr, fl] = quad;
  const P = (u: number, v: number): Pt => {
    const top: Pt = [bl[0] + (br[0] - bl[0]) * u, bl[1] + (br[1] - bl[1]) * u];
    const bot: Pt = [fl[0] + (fr[0] - fl[0]) * u, fl[1] + (fr[1] - fl[1]) * u];
    return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
  };
  const page: Pt[] = [P(0.03, 0.06), P(0.97, 0.06), P(0.97, 0.97), P(0.03, 0.97)];
  let ruled = '';
  for (let i = 1; i <= 7; i++) {
    const v = 0.12 + i * 0.105;
    const a = P(0.08, v);
    const c = P(0.92, v);
    ruled += `M${a[0].toFixed(1)} ${a[1].toFixed(1)}L${c[0].toFixed(1)} ${c[1].toFixed(1)}`;
  }
  const margin = [P(0.18, 0.1), P(0.18, 0.95)];
  // a few lines of handwriting on the first ruled lines
  let writing = '';
  for (let i = 1; i <= 3; i++) {
    const v = 0.12 + i * 0.105 - 0.03;
    const a = P(0.22, v);
    const c = P(0.22 + (i === 2 ? 0.5 : 0.66), v);
    writing += textLines(a[0], a[1], c[0] - a[0], {n: 1, gap: 10, seed: `${seed}/w${i}`, heading: false});
  }
  let spiral = '';
  for (let i = 0; i < rings; i++) {
    const [sx, sy] = P(0.06 + (0.88 * (i + 0.5)) / rings, 0.03);
    spiral += ellipse(sx, sy - 6, 7, 13, {seed: `${seed}/s${i}`});
  }
  return (
    <>
      <Fill d={polyPath(quad)} color={EMBER.skyLow} seed={`${seed}/cov`} />
      <Fill d={polyPath(page)} color={EMBER.card} seed={`${seed}/pg`} />
      <Ink d={poly(quad, {closed: true, seed: `${seed}/covI`, over: [1, 3]})} width={ink} />
      <Ink d={poly(page, {closed: true, seed: `${seed}/pgI`, over: [0, 1]})} width={W.hair} />
      <path d={ruled} stroke={EMBER.skyLow} strokeWidth={1.6} fill="none" />
      <path d={`M${margin[0][0]} ${margin[0][1]}L${margin[1][0]} ${margin[1][1]}`} stroke={EMBER.hl} strokeWidth={1.6} fill="none" />
      <Ink d={writing} width={1.6} />
      <Ink d={spiral} width={W.hair * 1.4} order="all" />
      {pen ? <Pen from={pen[0]} to={pen[1]} seed={`${seed}/pen`} /> : null}
    </>
  );
};

/** A pen lying on the desk (barrel, clip, a cap band, the nib). */
export const Pen: React.FC<{from: Pt; to: Pt; wPx?: number; color?: string; seed: string}> = ({from, to, wPx = 16, color = EMBER.beam, seed}) => {
  const ang = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]);
  const deg = (ang * 180) / Math.PI;
  const h = wPx / 2;
  const body = `M0 ${-h}L${L - wPx * 1.6} ${-h}L${L} 0L${L - wPx * 1.6} ${h}L0 ${h}Q${-h} ${h} ${-h} 0Q${-h} ${-h} 0 ${-h}Z`;
  return (
    <XG m={mat.compose(mat.translate(from[0], from[1]), mat.rotate(deg))}>
      <Fill d={body} color={color} seed={`${seed}/b`} />
      <Fill d={`M${L - wPx * 1.6} ${-h}L${L} 0L${L - wPx * 1.6} ${h}Z`} color={EMBER.core} offset={false} />
      <Fill rect={[L * 0.3, -h, wPx * 0.7, wPx]} color={EMBER.ring} offset={false} />
      <Ink d={body} width={W.far} />
      <Ink d={`M${wPx * 0.6} ${-h - 1}L${L * 0.3} ${-h - 1}`} width={W.hair * 1.5} />
    </XG>
  );
};

/** Your phone lying face down (the anchor-dark back, the camera bump, a sticker), cut by the frame edge. */
export const PhoneDown: React.FC<{x: number; y: number; w?: number; rot?: number; seed: string}> = ({x, y, w = 236, rot = 8, seed}) => {
  const h = w * 2.05;
  return (
    <XG m={mat.about(mat.rotate(rot), x + w / 2, y)}>
      <Fill d={roundRect(x, y, w, h, w * 0.16)} color={EMBER.anchor} seed={`${seed}/b`} />
      <Ink d={roundRect(x, y, w, h, w * 0.16, {closed: false, seed: `${seed}/bI`})} width={W.mid} />
      <Fill d={roundRect(x + w * 0.1, y + w * 0.1, w * 0.36, w * 0.4, w * 0.1)} color={EMBER.dcSide} offset={false} />
      <Ink d={roundRect(x + w * 0.1, y + w * 0.1, w * 0.36, w * 0.4, w * 0.1, {closed: false, seed: `${seed}/cbI`})} width={W.hair} />
      <Fill d={circle(x + w * 0.2, y + w * 0.2, w * 0.06) + circle(x + w * 0.2, y + w * 0.38, w * 0.06)} color={EMBER.dcDark} offset={false} />
      <Ink d={circle(x + w * 0.2, y + w * 0.2, w * 0.06, {seed: `${seed}/l1`}) + circle(x + w * 0.2, y + w * 0.38, w * 0.06, {seed: `${seed}/l2`})} width={W.hair} color={EMBER.skyLow} />
      {/* a sticker: a little sun */}
      <Fill d={circle(x + w * 0.62, y + w * 0.9, w * 0.13)} color={EMBER.books[0]} offset={false} />
      <Fill d={circle(x + w * 0.62, y + w * 0.9, w * 0.07)} color={EMBER.core} offset={false} />
      <Ink d={line(x + w * 0.82, y + w * 0.3, x + w * 0.82, y + w * 0.72, {over: [0, 0], seed: `${seed}/gl`})} width={W.hair} color={EMBER.reveal} />
    </XG>
  );
};

export const S7DeskFront: React.FC = () => (
  <>
    <SpiralNotebook quad={[[-70, 1500], [326, 1476], [356, 1802], [-60, 1840]]} pen={[[60, 1876], [372, 1640]]} seed="s7/nb" />
    <Letters x={500} y={1466} />
    <Pen from={[598, 1606]} to={[752, 1548]} wPx={14} color={EMBER.dc} seed="s7/pen2" />
    <PhoneDown x={430} y={1690} seed="s7/phone" />
    <Planner x={770} y={1650} />
    {/* crumbs strayed off the plate */}
    {[[262, 1452, 3], [286, 1440, 2.4], [240, 1470, 2]].map(([cx, cy, cr], i) => (
      <Fill key={i} d={circle(cx, cy, cr)} color={EMBER.books[6]} offset={false} />
    ))}
  </>
);

/** Wood grain on the desk, outside the pool and the clutter. */
export const S7Grain: React.FC = () => (
  <>
    <DeskGrain x={-20} y={1040} w={300} h={120} n={2} seed="s7/grain1" />
    <DeskGrain x={380} y={1360} w={420} h={90} n={2} seed="s7/grain2" />
    <DeskGrain x={-20} y={1840} w={1120} h={60} n={2} seed="s7/grain3" />
    <DeskGrain x={760} y={1480} w={320} h={120} n={2} seed="s7/grain4" />
  </>
);

/** The lamp's pull chain from the shade's lip (the loop). */
export const S7PullChain: React.FC = () => <PullChain x={156} y={904} len={92} amp={6} />;

// ---------------------------------------------------------------- the laptop's screen glint (17.6)

/** The screen's glint slides across once (a short pair of light strokes, clipped to the screen; never a reflection). */
export const ScreenGlint: React.FC<{scr: [Pt, Pt, Pt, Pt]; at: number; dur?: number}> = ({scr, at, dur = 0.34}) => {
  const t = useTime();
  const id = 's7gl' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const u = (t - at) / dur;
  if (u < 0 || u > 1) return null;
  const P = (a: number, v: number): Pt => {
    const top: Pt = [scr[0][0] + (scr[1][0] - scr[0][0]) * a, scr[0][1] + (scr[1][1] - scr[0][1]) * a];
    const bot: Pt = [scr[3][0] + (scr[2][0] - scr[3][0]) * a, scr[3][1] + (scr[2][1] - scr[3][1]) * a];
    return [top[0] + (bot[0] - top[0]) * v, top[1] + (bot[1] - top[1]) * v];
  };
  const c = -0.2 + 1.4 * u;
  const s1a = P(c + 0.12, 0.05);
  const s1b = P(c - 0.12, 0.95);
  const s2a = P(c + 0.22, 0.05);
  const s2b = P(c + 0.04, 0.95);
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={polyPath(scr)} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <path d={`M${s1a[0]} ${s1a[1]}L${s1b[0]} ${s1b[1]}`} stroke={EMBER.skyLow} strokeWidth={14} strokeLinecap="round" />
        <path d={`M${s2a[0]} ${s2a[1]}L${s2b[0]} ${s2b[1]}`} stroke={EMBER.skyLow} strokeWidth={5} strokeLinecap="round" />
      </g>
    </>
  );
};

// ---------------------------------------------------------------- Pip

const PIP = {x: 846, y: 1194, scale: 1.4};
/** Pip watches the laptop (head turned left), turns up to the bubble's spot a few frames before it pops (it points the
 *  eye), rises on its toes on "your" (a small hop), and keeps watching the stick in the bubble to the cut. */
const PIP_LOOK: LookKey[] = [
  {t: -9, v: -0.55},
  {t: S7_LENS_AT - 0.07, v: -0.95},
  {t: 1.3, v: -0.8},
];

export const S7Pip: React.FC = () => (
  <Pip3 x={PIP.x} y={PIP.y} scale={PIP.scale} lineWeight={1.12} seed={7} pose="sit-back" look={PIP_LOOK} lookDur={0.18} hops={[{t: S7_LENS_AT + 0.06, height: 14, dur: 0.26}]} />
);
