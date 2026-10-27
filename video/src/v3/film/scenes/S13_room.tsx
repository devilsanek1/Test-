// S13_room (lane S13, G5b): the home base's room dressing for S13's objective medium-wide (31.32-33.40, "Normally
// you'd wait for the better one."). Everything is added AROUND the locked board (you seated 3/4 back facing the window,
// the wall clock upper left, the thought bubble with the BETTER laptop above your head, the window right with the far
// data center, the lamp and its pool on the desk): docs/v3/density_plan_g5b.md S13 and docs/v3/cozy_v2_application.md
// (DENSE-CALM: a field made of things, calm only in the caption band, the subject's ring and the dusk sky in the glass).
//   top wall   (above the caption band, y < 290) the attic slope and beam (the Nook's, as in O1) with warm string lights
//              under it and the lit paper star; instant photos pegged on a cord, a hanging pothos, a small print.
//   window     a short string of warm bulbs on the reveal's top (y 600-630, under the band, never over the glass).
//   left wall  the shelf's bottom filled (books, a jar), a coat and a striped scarf on a hook rail by the shelf (below the
//              bubble's calm ring), a tote bag slumped under it.
//   under desk the radiator with a sock drying on it (sways), a wall socket, a wicker bin.
//   desk       a desk calendar on 2026 (it sets up S14's 2027), a pen cup, a book stack with headphones, a succulent on the
//              sill (right of the mullion).
//   floor      floorboards (short seams), a striped rug, slippers, Pip asleep on the rug (it waits with you: slow breath,
//              z's popping every ~0.7 s), an open book face down, a floor plant cut by the right edge, a pouf and a yarn
//              basket cut by the bottom edge.
// Everything is there from the cut (no builds). Idle life: bulbs twinkle, the star turns, photos and the pothos sway, the
// sock and the coat sway a hair, Pip breathes and its z's rise and shrink to nothing (no opacity).
// Fix pass (independent review): the desk mug is a small cup (w 50) whose steam is light puffs (vapour on the navy glass,
// never ink lines over it); the radiator is painted (reveal, shaded fins) with a towel and a valve on its pipe, so it
// no longer outshines you; the coat has a hood lining, lapels, a sleeve and cuff, buttons, pocket flaps, folds and a hem
// band, with a beanie and mittens on a string on the rail; the lower third stacks things in stepped sizes (a throw
// half on the pouf trailing onto the rug, a floor cushion, a yarn ball rolled out of the basket whose thread snakes
// across the rug to Pip's paw, a mug on a coaster and a plate with clementine peel by the open book, a dropped pencil,
// grain and knots in the floorboards).
import React, {useId} from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, ellipse, line, polyPath, smooth} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {
  BookStack,
  Calendar,
  CoatHook,
  DeskGrain,
  EMBER,
  FramedPrint,
  Glasses,
  Headphones,
  Mug,
  PenCup,
  Pip3,
  Plant,
  quadPt,
  Radiator,
  Rug,
  ShelfFill,
  Slippers,
  Steam,
  StringLights3,
  sway,
  ToteBag,
  Txt,
  W,
  WallMarks,
  type Pt,
} from '../kit';
import {PhotoLine, StarLantern} from './O1_life';

const FLOOR_Y = 1400;

// ---------------------------------------------------------------- the top wall (above the caption band)

/** A pothos in a hanging pot on three cords from a ceiling hook; it sways about the hook (slow, +-1 deg). */
const HangingPlant: React.FC<{x: number; y: number}> = ({x, y}) => {
  const t = useTime();
  const hookY = -40;
  const a = sway(t, 1, 4.6, 2.1);
  const rimY = y - 30;
  const cords = line(x, hookY, x - 20, rimY, {over: [0, 0], seed: 's13/hc1'}) + line(x, hookY, x + 2, rimY - 2, {over: [0, 0], seed: 's13/hc2'}) + line(x, hookY, x + 20, rimY, {over: [0, 0], seed: 's13/hc3'});
  return (
    <XG m={mat.about(mat.rotate(a), x, hookY)}>
      <Ink d={cords} width={W.hair} />
      <Plant x={x} y={y} kind="pothos" size={54} trail={70} amp={2} seed="s13/hang" ink={W.far} />
    </XG>
  );
};

export const S13WallTop: React.FC = () => (
  <>
    <WallMarks x={150} y={20} w={380} h={150} n={5} seed="s13/wm1" />
    <FramedPrint x={170} y={30} w={92} h={112} picture="leaf" seed="s13/print1" ink={W.far} />
    <HangingPlant x={398} y={150} />
    <PhotoLine x0={150} y0={196} x1={318} y1={204} sag={14} />
    {/* warm string lights under the attic beam (above the band) and the lit paper star hung from it */}
    <StringLights3 points={[[586, 16], [752, 102], [912, 184], [1062, 258]]} sag={16} n={10} r={8} seed="s13/beamlights" />
    <StarLantern x={724} hookY={86} cy={150} r={30} litAt={-1} />
  </>
);

/** A short string of warm bulbs on the window reveal's top edge (y 600-630: under the band, above the glass). */
export const S13WindowLights: React.FC = () => <StringLights3 points={[[446, 603], [770, 606], [1100, 603]]} sag={9} n={12} r={7} seed="s13/winlights" />;

// ---------------------------------------------------------------- the left wall, the shelf's foot, under the desk

/** A wicker bin with crumpled paper (a drafted list, a receipt) on top. Base centre (x, y). */
const Bin: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 84}) => {
  const h = w * 1.05;
  const body = polyPath([[x - w / 2, y - h], [x + w / 2, y - h], [x + w * 0.4, y], [x - w * 0.4, y]]);
  let weave = '';
  for (let i = 1; i < 5; i++) {
    const k = i / 5;
    weave += line(x - w / 2 + w * 0.1 * k, y - h + h * k, x + w / 2 - w * 0.1 * k, y - h + h * k, {over: [0, 0], seed: `s13/binw${i}`});
  }
  return (
    <>
      <Fill d={blob(x - 14, y - h - 6, 18, 14, {seed: 's13/pap1'})} color={EMBER.card} offset={false} />
      <Fill d={blob(x + 14, y - h - 4, 15, 12, {seed: 's13/pap2'})} color={EMBER.paper} offset={false} />
      <Ink d={blob(x - 14, y - h - 6, 18, 14, {seed: 's13/pap1'}) + blob(x + 14, y - h - 4, 15, 12, {seed: 's13/pap2'})} width={W.hair} />
      <Fill d={body} color={EMBER.books[0]} seed="s13/bin" />
      <Ink d={body} width={W.far} />
      <Ink d={weave} width={W.hair} color={EMBER.beam} />
      <Fill rect={[x - w / 2 - 2, y - h - 2, w + 4, 8]} color={EMBER.books[6]} offset={false} />
    </>
  );
};

/** The coat on the hook (x 214, y 986, h 330: the kit CoatHook's geometry), so the detail can be clipped to it. */
const COAT = {x: 214, y: 986, h: 330};
/** The coat's own detail, drawn by CoatHook over its fill and under its ink and the scarf (inside its sway): the hood's
 *  lining in the neck, the lapels, the left sleeve with its cuff, buttons, pocket flaps, tone-on-tone folds, a hem band. */
const CoatDetail: React.FC = () => {
  const id = 's13coat' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const {x, y, h} = COAT;
  const cw = h * 0.42;
  const coatD = `M${x - cw * 0.22} ${y + 10}Q${x - cw * 0.6} ${y + h * 0.2} ${x - cw * 0.55} ${y + h}L${x + cw * 0.55} ${y + h}Q${x + cw * 0.6} ${y + h * 0.2} ${x + cw * 0.22} ${y + 10}Z`;
  const tone = EMBER.sky; // one flat step under the coat (skyLow): tone-on-tone
  const lapL = polyPath([[x - 32, y + 12], [x - 3, y + 22], [x - 3, y + 96], [x - 44, y + 56]]);
  const lapR = polyPath([[x + 32, y + 12], [x + 3, y + 22], [x + 3, y + 96], [x + 44, y + 56]]);
  const cuff = polyPath([[x - 76, y + 226], [x - 38, y + 230], [x - 40, y + 252], [x - 78, y + 248]]);
  const flapL = polyPath([[x - 66, y + 206], [x - 20, y + 202], [x - 21, y + 220], [x - 64, y + 224]]);
  const flapR = polyPath([[x + 32, y + 202], [x + 74, y + 206], [x + 72, y + 224], [x + 33, y + 220]]);
  const folds =
    `M${x - 30} ${y + 44}Q${x - 36} ${y + 140} ${x - 40} ${y + 230}` + // the sleeve's inner edge
    `M${x - 48} ${y + 252}Q${x - 52} ${y + 290} ${x - 56} ${y + h}` +
    `M${x - 16} ${y + 120}Q${x - 18} ${y + 230} ${x - 24} ${y + h}` +
    `M${x + 50} ${y + 70}Q${x + 60} ${y + 180} ${x + 64} ${y + h}` +
    `M${x + 30} ${y + 240}Q${x + 34} ${y + 280} ${x + 36} ${y + h}`;
  const buttons = [110, 160, 210, 262].map((dy) => circle(x - 10, y + dy, 5.5)).join('');
  return (
    <>
      <defs>
        <clipPath id={id}>
          <path d={coatD} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Fill d={ellipse(x, y + 16, 36, 22, {seed: 's13/hood'})} color={tone} offset={false} />
        <Fill rect={[x - 100, y + h - 18, 200, 18]} color={tone} offset={false} />
        <Fill d={cuff} color={tone} offset={false} />
        <Fill d={flapL + flapR} color={tone} offset={false} />
        <Ink d={folds} width={W.far} color={tone} />
        <Fill d={lapL + lapR} color={EMBER.skyLow} offset={false} />
        <Ink d={lapL + lapR} width={W.hair} color={EMBER.dc} />
        <Ink d={flapL + flapR + cuff} width={W.hair} color={EMBER.dc} />
        <Fill d={buttons} color={EMBER.dcSide} offset={false} />
      </g>
    </>
  );
};

/** On the rail beside the coat: a knitted beanie (ribbed brim, a pompom) and mittens on a string over a peg; each
 *  sways a hair about its peg. */
const RailThings: React.FC = () => {
  const t = useTime();
  const bx = 288;
  const by = 992;
  const beanieA = sway(t, 1.4, 3.9, 0.8);
  const crownD = `M${bx - 22} ${by + 16}L${bx + 22} ${by + 16}L${bx + 21} ${by + 40}Q${bx + 18} ${by + 66} ${bx} ${by + 66}Q${bx - 18} ${by + 66} ${bx - 21} ${by + 40}Z`;
  let ribs = '';
  for (let i = -3; i <= 3; i++) ribs += `M${bx + i * 6} ${by + 3}l0 12`;
  const mx = 146;
  const my = 992;
  const mitA = sway(t, 1.8, 3.4, 2.2);
  const mitten = (cx: number, top: number) =>
    `M${cx - 14} ${top}L${cx - 14} ${top + 28}Q${cx - 14} ${top + 44} ${cx} ${top + 44}Q${cx + 14} ${top + 44} ${cx + 14} ${top + 28}L${cx + 14} ${top}Z`;
  const mA = mitten(130, 1064);
  const mB = mitten(166, 1082);
  const thumbs = blob(146, 1086, 6, 9, {seed: 's13/thA'}) + blob(182, 1104, 6, 9, {seed: 's13/thB'});
  return (
    <>
      <XG m={mat.about(mat.rotate(mitA), mx, my)}>
        <Ink d={`M130 1064C128 1010 140 990 ${mx} ${my}C152 994 166 1030 166 1082`} width={W.hair} />
        <Fill d={thumbs} color={EMBER.books[4]} offset={false} />
        <Fill d={mA + mB} color={EMBER.books[4]} seed="s13/mit" />
        <Fill rect={[115, 1064, 30, 10]} color={EMBER.card} offset={false} />
        <Fill rect={[151, 1082, 30, 10]} color={EMBER.card} offset={false} />
        <Ink d={mA + mB + thumbs} width={W.far} />
        <Fill d={circle(130, 1092, 3.2) + circle(166, 1110, 3.2)} color={EMBER.card} offset={false} />
      </XG>
      <XG m={mat.about(mat.rotate(beanieA), bx, by)}>
        <Fill d={crownD} color={EMBER.books[0]} seed="s13/beanie" />
        <Ink d={`M${bx - 12} ${by + 30}Q${bx - 10} ${by + 50} ${bx - 4} ${by + 62}M${bx + 10} ${by + 28}Q${bx + 10} ${by + 48} ${bx + 6} ${by + 62}`} width={W.hair} color={EMBER.beam} />
        <Fill rect={[bx - 24, by, 48, 17]} color={EMBER.books[4]} offset={false} />
        <Ink d={ribs} width={W.hair} color={EMBER.beam} />
        <Ink d={crownD + `M${bx - 24} ${by}h48v17h-48Z`} width={W.far} />
        <Fill d={blob(bx, by + 72, 11, 10, {seed: 's13/pom'})} color={EMBER.card} />
        <Ink d={blob(bx, by + 72, 11, 10, {seed: 's13/pom'})} width={W.hair} />
      </XG>
      <circle cx={mx} cy={my - 1} r={5} fill={EMBER.anchor} />
      <circle cx={bx} cy={by - 1} r={5} fill={EMBER.anchor} />
    </>
  );
};

/** A striped tea towel folded over the radiator's top bar (left part), a hair of sway. */
const Towel: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => {
  const t = useTime();
  const a = sway(t, 0.6, 4.1, 1.7);
  const body = polyPath([[x, y + 8], [x + w, y + 8], [x + w + 3, y + h], [x - 3, y + h]]);
  const fold = polyPath([[x - 3, y - 8], [x + w + 3, y - 8], [x + w + 1, y + 12], [x - 1, y + 12]]);
  let fringe = '';
  for (let i = 0; i <= 8; i++) fringe += `M${x - 2 + (i * (w + 4)) / 8} ${y + h}l0 7`;
  return (
    <XG m={mat.about(mat.rotate(a), x + w / 2, y)}>
      <Fill d={body} color={EMBER.books[0]} seed="s13/towel" />
      <Fill rect={[x - 2, y + h - 34, w + 4, 7]} color={EMBER.beam} offset={false} />
      <Fill rect={[x - 2, y + h - 22, w + 4, 4]} color={EMBER.beam} offset={false} />
      <Fill d={fold} color={EMBER.boardDeep} offset={false} />
      <Ink d={body + fold} width={W.far} />
      <Ink d={fringe} width={W.hair} />
    </XG>
  );
};

export const S13WallLow: React.FC = () => (
  <>
    <WallMarks x={150} y={1150} w={160} h={160} n={3} seed="s13/wm2" />
    <WallMarks x={660} y={1160} w={300} h={40} n={2} seed="s13/wm3" />
    {/* the shelf's foot: books and a jar on the floor inside the shelf (its last board is at 1140) */}
    <ShelfFill planks={[{x0: -16, x1: 72, y: FLOOR_Y - 2, room: 190}]} seed="s13/shelffoot" photo={false} plant={false} trailing={false} />
    {/* a coat and a striped scarf on a hook rail by the shelf, below the bubble's calm ring */}
    <CoatHook x={COAT.x} y={COAT.y} h={COAT.h} coat={EMBER.skyLow} seed="s13/coat">
      <CoatDetail />
    </CoatHook>
    <RailThings />
    {/* under the desk: the radiator (painted the warm reveal tone, shaded fins: never brighter than you) with a sock
        drying on it (sways) and a towel over its bar; its pipe into the floor with a valve; a socket; a wicker bin */}
    <Radiator x={608} y={1200} w={350} h={150} seed="s13/rad" ink={W.far} color={EMBER.reveal} shade="#C4968B" />
    <Towel x={634} y={1196} w={84} h={100} />
    <Fill rect={[891, 1346, 11, 40]} color="#C4968B" offset={false} />
    <Ink d={`M891 1346L891 1386M902 1346L902 1386M884 1382h25`} width={W.hair} />
    <Fill d={circle(896.5, 1366, 9)} color={EMBER.beam} offset={false} />
    <Ink d={circle(896.5, 1366, 9) + `M887.5 1366h18M896.5 1357v18`} width={W.hair} />
    <Fill rect={[992, 1352, 30, 24]} color={EMBER.card} offset={false} />
    <Ink d={`M992 1352h30v24h-30Z` + circle(1001, 1364, 2.4) + circle(1013, 1364, 2.4)} width={W.hair} />
  </>
);

/** Under the coat: a tote bag slumped on the floor. */
export const S13ToteAndBin: React.FC = () => (
  <>
    <ToteBag x={214} y={1446} w={128} seed="s13/tote" color={EMBER.card} ink={W.far} />
    <Bin x={958} y={1440} w={80} />
  </>
);

// ---------------------------------------------------------------- the desk and the sill

/** The tea on the desk: the kit mug scaled to w 50 about its rim's left end (the old 98 px one was bigger than your
 *  head); its steam is light puffs that read as vapour on the navy glass (never ink lines over the glass). */
const DESK_MUG = {x: 936, top: 1048, k: 0.51};

export const S13Desk: React.FC = () => (
  <>
    <XG m={mat.about(mat.scale(DESK_MUG.k), DESK_MUG.x, DESK_MUG.top)}>
      <Mug x={DESK_MUG.x} top={DESK_MUG.top} seed="s13/mug" steam={false} />
    </XG>
    <Steam x={DESK_MUG.x + 25} y={DESK_MUG.top - 6} n={5} life={2.3} rise={100} drift={12} r0={4} r1={12} wobble={5} seed="s13/mugsteam" color={EMBER.card} />
    <Calendar x={772} y={1020} w={84} from="2026" seed="s13/cal" ink={W.far} />
    <PenCup x={884} y={1100} w={42} seed="s13/pens" ink={W.far} color={EMBER.books[3]} />
    <BookStack x={1038} y={1106} w={120} n={3} seed="s13/stack" ink={W.far} />
    <Headphones x={1094} y={1046} w={110} seed="s13/hp" ink={W.far} />
    <Plant x={1066} y={1008} kind="succulent" size={30} seed="s13/sillsu" ink={W.far} />
  </>
);

// ---------------------------------------------------------------- the floor

/** Floorboards: plank seams parallel to the wall, closer toward the back (perspective), short staggered butt joints;
 *  tone-on-tone (the floor's own red-brown wood ink at hair weight). */
const Floorboards: React.FC = () => {
  const r = rng('s13/boards');
  const ys = [1446, 1500, 1566, 1644, 1736, 1842];
  let d = '';
  let joints = '';
  ys.forEach((y, i) => {
    d += line(-40, y, 1120, y + r.jitter(2), {over: [0, 0], seed: `s13/bd${i}`});
    const prev = i === 0 ? FLOOR_Y : ys[i - 1];
    for (let x = r.range(60, 260); x < 1080; x += r.range(300, 460)) joints += line(x, prev + 2, x + (x - 540) * 0.04, y - 2, {over: [0, 0], seed: `s13/bj${i}${x.toFixed(0)}`});
  });
  return (
    <>
      <Ink d={d} width={W.far} color={EMBER.beam} />
      <Ink d={joints} width={W.hair} color={EMBER.beam} />
      {/* grain and knots in the boards that show (the rug covers the middle) */}
      <DeskGrain x={0} y={1404} w={1080} h={38} n={5} seed="s13/fg0" color={EMBER.beam} />
      <DeskGrain x={-10} y={1452} w={190} h={230} n={4} seed="s13/fgL" color={EMBER.beam} />
      <DeskGrain x={960} y={1460} w={140} h={220} n={3} seed="s13/fgR" color={EMBER.beam} />
      <DeskGrain x={0} y={1702} w={1080} h={38} n={7} seed="s13/fg1" color={EMBER.beam} />
      <DeskGrain x={0} y={1748} w={1080} h={86} n={7} seed="s13/fg2" color={EMBER.beam} />
      <Ink d={[[612, 1724], [318, 1792], [1010, 1776], [88, 1426], [1040, 1600]].map(([kx, ky], i) => ellipse(kx, ky, 10, 4, {seed: `s13/knot${i}`}) + ellipse(kx, ky, 4, 1.6, {seed: `s13/knoti${i}`})).join('')} width={W.hair} color={EMBER.beam} />
    </>
  );
};

/** An open book lying face down on the rug (a tent of two covers, its pages' edge). */
const OpenBook: React.FC<{x: number; y: number}> = ({x, y}) => {
  const L = polyPath([[x - 64, y + 10], [x - 4, y - 16], [x, y + 6], [x - 58, y + 26]]);
  const R = polyPath([[x - 4, y - 16], [x + 62, y + 2], [x + 58, y + 22], [x, y + 6]]);
  const pages = polyPath([[x - 58, y + 26], [x, y + 6], [x + 58, y + 22], [x + 56, y + 27], [x, y + 11], [x - 56, y + 31]]);
  return (
    <>
      <Fill d={pages} color={EMBER.card} offset={false} />
      <Fill d={L} color={EMBER.dc} seed="s13/bkL" />
      <Fill d={R} color={EMBER.dcSide} seed="s13/bkR" />
      <Ink d={L + R + pages} width={W.far} />
      <Fill rect={[x - 40, y + 2, 22, 6]} color={EMBER.ring} offset={false} />
    </>
  );
};

/** A pouf cut by the bottom-left corner (a knitted top, a button). */
const Pouf: React.FC<{x: number; y: number; rx: number; ry: number}> = ({x, y, rx, ry}) => {
  const top = ellipse(x, y, rx, ry, {seed: 's13/poufT'});
  let knit = '';
  for (let i = -3; i <= 3; i++) knit += `M${x + i * rx * 0.24} ${y - ry * 0.8}Q${x + i * rx * 0.3} ${y} ${x + i * rx * 0.24} ${y + ry * 0.8}`;
  return (
    <>
      <Fill rect={[x - rx, y, rx * 2, 260]} color={EMBER.books[1]} offset={false} />
      <Fill d={top} color={EMBER.hl} seed="s13/pouf" />
      <Ink d={top + `M${x - rx} ${y}L${x - rx} ${y + 260}M${x + rx} ${y}L${x + rx} ${y + 260}`} width={W.mid} />
      <Ink d={knit} width={W.hair} color={EMBER.beam} />
      <Fill d={circle(x, y, 9)} color={EMBER.beam} offset={false} />
    </>
  );
};

/** A yarn basket cut by the bottom edge: three balls of wool, two needles. */
const YarnBasket: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 230}) => {
  const rim = ellipse(x, y, w / 2, 22, {seed: 's13/ybR'});
  const balls: [number, number, number, string][] = [[x - 54, y - 18, 34, EMBER.dc], [x + 10, y - 26, 38, EMBER.books[4]], [x + 66, y - 12, 30, EMBER.reveal]];
  let weave = '';
  for (let i = 0; i < 4; i++) weave += line(x - w / 2 + 6, y + 30 + i * 26, x + w / 2 - 6, y + 30 + i * 26, {over: [0, 0], seed: `s13/ybw${i}`});
  return (
    <>
      <Ink d={line(x - 10, y - 30, x + 70, y - 120, {over: [0, 0], seed: 's13/ndl1'}) + line(x + 18, y - 30, x + 112, y - 104, {over: [0, 0], seed: 's13/ndl2'})} width={4} color={EMBER.beam} />
      {balls.map(([bx, by, br, c], i) => (
        <React.Fragment key={i}>
          <Fill d={blob(bx, by, br, br * 0.92, {seed: `s13/yb${i}`})} color={c} seed={`s13/ybF${i}`} />
          <Ink d={blob(bx, by, br, br * 0.92, {seed: `s13/yb${i}`}) + `M${bx - br * 0.6} ${by - br * 0.3}Q${bx} ${by + br * 0.2} ${bx + br * 0.7} ${by - br * 0.1}M${bx - br * 0.5} ${by + br * 0.3}Q${bx + br * 0.1} ${by + br * 0.6} ${bx + br * 0.6} ${by + br * 0.3}`} width={W.hair} />
        </React.Fragment>
      ))}
      <Fill rect={[x - w / 2, y, w, 300]} color={EMBER.books[0]} offset={false} />
      <Fill d={rim} color={EMBER.books[6]} offset={false} />
      <Ink d={rim + `M${x - w / 2} ${y}L${x - w / 2 + 6} ${y + 300}M${x + w / 2} ${y}L${x + w / 2 - 6} ${y + 300}`} width={W.mid} />
      <Ink d={weave} width={W.hair} color={EMBER.beam} />
    </>
  );
};

/** The rug's woven pattern: a zigzag along the blue and the gold stripes, a dotted line along the peach ones
 *  (tone-on-tone, hair weight: texture on a small thing, never a flat slab). */
const RugPattern: React.FC<{quad: [Pt, Pt, Pt, Pt]}> = ({quad}) => {
  const zig = (v: number, amp: number, n: number) => {
    let d = '';
    for (let i = 0; i <= n; i++) {
      const p = quadPt(quad, 0.03 + (0.94 * i) / n, v + (i % 2 ? amp : -amp));
      d += `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
    }
    return d;
  };
  const dots = (v: number, n: number) =>
    Array.from({length: n}, (_, i) => {
      const p = quadPt(quad, 0.05 + (0.9 * i) / (n - 1), v);
      return circle(p[0], p[1], 3);
    }).join('');
  return (
    <>
      <Ink d={zig(2.45 / 7, 0.022, 34)} width={W.hair} color={EMBER.card} order="all" />
      <Ink d={zig(4.45 / 7, 0.022, 34)} width={W.hair} color={EMBER.beam} order="all" />
      <Fill d={dots(0.45 / 7, 24) + dots(6.45 / 7, 26)} color={EMBER.books[4]} offset={false} />
    </>
  );
};

// ---------------------------------------------------------------- the lower third: things in stepped sizes on the rug

/** The rolled-out yarn ball and its thread: out of the basket (behind its rim), snaking across the boards and the rug,
 *  through the ball and on to Pip's front paw (Pip played, then fell asleep: a small story link). */
const YARN = {x: 872, y: 1668, r: 21};
const THREAD: Pt[] = [[806, 1814], [784, 1782], [836, 1752], [806, 1722], [846, 1694], [YARN.x - 6, YARN.y + 8]];
const THREAD2: Pt[] = [[YARN.x - 16, YARN.y - 10], [826, 1640], [800, 1614], [822, 1588], [794, 1566], [778, 1552]];

/** A plaid throw: its tail on the boards and the rug's front edge (behind the pouf); the drape over the pouf is in
 *  S13FloorFront. Terracotta with cream checks. */
const THROW_TAIL = polyPath([[150, 1772], [232, 1704], [318, 1684], [366, 1712], [306, 1764], [250, 1806]]);
const THROW_DRAPE = polyPath([[64, 1760], [150, 1748], [224, 1760], [260, 1788], [264, 1858], [256, 1940], [214, 1928], [186, 1950], [146, 1932], [118, 1880], [96, 1832], [56, 1800]]);
const Plaid: React.FC<{d: string; box: [number, number, number, number]; seed: string}> = ({d, box, seed}) => {
  const id = 's13plaid' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const [x0, y0, x1, y1] = box;
  let checks = '';
  for (let x = x0 + 12; x < x1; x += 34) checks += `M${x} ${y0}L${x + 10} ${y1}`;
  for (let y = y0 + 10; y < y1; y += 30) checks += `M${x0} ${y}L${x1} ${y + 8}`;
  return (
    <>
      <Fill d={d} color={EMBER.pot} seed={seed} />
      <defs>
        <clipPath id={id}>
          <path d={d} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <Ink d={checks} width={5} color={EMBER.wall} taper={false} />
        <Ink d={checks} width={W.hair} color={EMBER.beam} taper={false} />
      </g>
      <Ink d={d} width={W.mid} />
    </>
  );
};

/** A floor cushion on the rug's right (a tufted square seen from above, piping, a button). */
const Cushion: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => {
  const d = `M${x - w / 2 + 10} ${y - h / 2}Q${x} ${y - h / 2 + 8} ${x + w / 2 - 10} ${y - h / 2}Q${x + w / 2 + 6} ${y} ${x + w / 2 - 6} ${y + h / 2}Q${x} ${y + h / 2 - 8} ${x - w / 2 + 6} ${y + h / 2}Q${x - w / 2 - 6} ${y} ${x - w / 2 + 10} ${y - h / 2}Z`;
  const tufts = `M${x - w * 0.36} ${y - h * 0.3}Q${x - w * 0.1} ${y - h * 0.08} ${x} ${y}M${x + w * 0.36} ${y - h * 0.3}Q${x + w * 0.1} ${y - h * 0.08} ${x} ${y}M${x - w * 0.36} ${y + h * 0.32}Q${x - w * 0.1} ${y + h * 0.1} ${x} ${y}M${x + w * 0.36} ${y + h * 0.32}Q${x + w * 0.1} ${y + h * 0.1} ${x} ${y}`;
  return (
    <>
      <Fill d={blob(x + 6, y + h / 2 + 2, w * 0.5, 9, {seed: 's13/cushsh'})} color="#D9A58A" offset={false} />
      <Fill d={d} color={EMBER.skyLow} seed="s13/cush" />
      <Ink d={tufts} width={W.far} color={EMBER.sky} />
      <Ink d={d} width={W.mid} />
      <Fill d={circle(x, y, 6)} color={EMBER.card} offset={false} />
      <Ink d={circle(x, y, 6)} width={W.hair} />
    </>
  );
};

/** A plate with a half-peeled clementine and curls of peel. */
const PeelPlate: React.FC<{x: number; y: number}> = ({x, y}) => {
  const plate = ellipse(x, y, 48, 16, {seed: 's13/plate'});
  const peel = (px: number, py: number, k: number) => `M${px} ${py}q${12 * k} ${-9 * k} ${24 * k} ${1 * k}q${8 * k} ${8 * k} ${-3 * k} ${14 * k}q${-12 * k} ${3 * k} ${-21 * k} ${-5 * k}z`;
  const peels = peel(x + 6, y - 2, 0.9) + peel(x - 40, y - 4, 0.75) + peel(x + 24, y + 4, 0.6);
  return (
    <>
      <Fill d={plate} color={EMBER.card} seed="s13/plateF" />
      <Ink d={plate + ellipse(x, y - 1, 34, 10, {seed: 's13/plate2'})} width={W.far} />
      <Fill d={peels} color={EMBER.pot} offset={false} />
      <Ink d={peels} width={W.hair} />
      <Fill d={blob(x - 14, y - 8, 15, 13, {seed: 's13/clem'})} color={EMBER.books[0]} seed="s13/clemF" />
      <Fill d={`M${x - 29} ${y - 9}Q${x - 14} ${y - 2} ${x + 1} ${y - 9}L${x - 2} ${y}Q${x - 14} ${y + 6} ${x - 26} ${y}Z`} color={EMBER.pot} offset={false} />
      <Ink d={ellipse(x - 14, y - 8, 15, 13, {seed: 's13/clemI'}) + `M${x - 14} ${y - 20}L${x - 14} ${y - 8}M${x - 22} ${y - 17}L${x - 19} ${y - 8}`} width={W.hair} />
    </>
  );
};

/** A small mug on a cork coaster (the kit mug scaled about its rim's left end), cooled: no steam. */
const RugMug: React.FC<{x: number; top: number; k: number}> = ({x, top, k}) => {
  const w = 98 * k;
  const base = top + 112 * k;
  return (
    <>
      <Fill d={ellipse(x + w / 2 + 4, base, w * 0.82, 10, {seed: 's13/coaster'})} color={EMBER.desk} seed="s13/coasterF" />
      <Ink d={ellipse(x + w / 2 + 4, base, w * 0.82, 10, {seed: 's13/coasterI'})} width={W.hair} />
      <XG m={mat.about(mat.scale(k), x, top)}>
        <Mug x={x} top={top} seed="s13/rugmug" steam={false} />
      </XG>
    </>
  );
};

/** On the rug and the boards in front of it, all there from the cut. */
export const S13RugThings: React.FC = () => (
  <>
    <Plaid d={THROW_TAIL} box={[140, 1680, 370, 1810]} seed="s13/throwT" />
    <Cushion x={978} y={1640} w={136} h={80} />
    <Ink d={smooth(THREAD) + smooth(THREAD2)} width={3} color={EMBER.books[4]} taper={false} />
    <Fill d={blob(YARN.x, YARN.y, YARN.r, YARN.r * 0.92, {seed: 's13/yarn'})} color={EMBER.books[4]} seed="s13/yarnF" />
    <Ink d={blob(YARN.x, YARN.y, YARN.r, YARN.r * 0.92, {seed: 's13/yarn'}) + `M${YARN.x - 14} ${YARN.y - 8}Q${YARN.x} ${YARN.y + 4} ${YARN.x + 15} ${YARN.y - 4}M${YARN.x - 12} ${YARN.y + 7}Q${YARN.x + 2} ${YARN.y + 14} ${YARN.x + 13} ${YARN.y + 6}`} width={W.hair} />
    <RugMug x={330} top={1580} k={0.42} />
    <PeelPlate x={606} y={1652} />
    {/* a pencil dropped on the boards */}
    <Fill d={polyPath([[600, 1744], [700, 1724], [702, 1732], [602, 1752]])} color={EMBER.books[0]} offset={false} />
    <Fill d={polyPath([[700, 1724], [716, 1726], [702, 1732]])} color={EMBER.paper} offset={false} />
    <Ink d={polyPath([[600, 1744], [700, 1724], [716, 1726], [702, 1732], [602, 1752]])} width={W.hair} />
  </>
);

/** Behind you: the floorboards, the rug, the slippers, the floor plant, the open book. */
export const S13FloorBack: React.FC = () => {
  const rug: [Pt, Pt, Pt, Pt] = [[168, 1412], [962, 1412], [1076, 1694], [56, 1694]];
  return (
    <>
      <Floorboards />
      {/* a short colour shadow under the desk and the radiator (wall reveal penumbra, cozy v2 §4) */}
      <Fill rect={[500, 1384, 520, 14]} color="#E3B092" offset={false} />
      <Rug quad={rug} stripes={7} colors={[EMBER.hl, EMBER.wall, EMBER.skyLow, EMBER.wall, EMBER.books[0], EMBER.wall]} seed="s13/rug" ink={W.mid} />
      <RugPattern quad={rug} />
      <Slippers x={196} y={1508} w={150} seed="s13/slip" ink={W.far} color={EMBER.books[4]} />
      <OpenBook x={470} y={1606} />
      <Plant x={1046} y={1470} kind="floor" size={230} seed="s13/floorplant" ink={W.far} />
    </>
  );
};

/** In front of everything: the pouf and the yarn basket cut by the bottom edge. */
export const S13FloorFront: React.FC = () => (
  <>
    <Pouf x={96} y={1800} rx={150} ry={46} />
    <Plaid d={THROW_DRAPE} box={[50, 1740, 270, 1960]} seed="s13/throwD" />
    {/* a stack of books on the floorboards (cut by the bottom edge) with your glasses on it */}
    <BookStack x={470} y={1880} w={170} n={4} seed="s13/floorstack" ink={W.far} scale={1.3} />
    <Glasses x={560} y={1762} w={100} rot={-8} seed="s13/glasses" ink={W.far} />
    <YarnBasket x={846} y={1830} />
  </>
);

// ---------------------------------------------------------------- Pip asleep on the rug

/** Pip curled asleep on the rug in front of your chair: it waits with you (slow breathing, the lib idle), z's pop from
 *  its head every ~0.7 s, drift up and right and shrink to nothing (no opacity). */
export const S13Pip: React.FC<{x: number; y: number}> = ({x, y}) => {
  const t = useTime();
  const P = 0.7;
  const LIFE = 1.9;
  const zs: React.ReactNode[] = [];
  const k0 = Math.floor((t - LIFE) / P);
  for (let k = k0; k <= Math.floor(t / P); k++) {
    const t0 = k * P;
    const u = (t - t0) / LIFE;
    if (u < 0 || u >= 1) continue;
    const grow = Math.min(1, u / 0.12);
    const shrink = u > 0.72 ? 1 - (u - 0.72) / 0.28 : 1;
    const s = (0.4 + 0.6 * grow) * shrink;
    if (s < 0.05) continue;
    const zx = x + 50 + 46 * u + 8 * Math.sin(u * 5 + k);
    const zy = y - 118 - 96 * u;
    const size = 50 + (k % 3) * 8;
    zs.push(
      <XG key={k} m={mat.about(mat.scale(s), zx, zy)}>
        <Txt x={zx} y={zy} size={size} fill={EMBER.beam} rot={-12 + (k % 2) * 8}>
          z
        </Txt>
      </XG>,
    );
  }
  return (
    <>
      {/* a short colour shadow under Pip on the rug */}
      <Fill d={blob(x + 10, y + 3, 90, 12, {seed: 's13/pipsh'})} color="#D9A58A" offset={false} />
      <Pip3 x={x} y={y} scale={1.55} pose="sleep" seed={13} />
      {zs}
    </>
  );
};
