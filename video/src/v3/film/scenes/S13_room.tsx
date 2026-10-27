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
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, ellipse, line, polyPath} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {
  BookStack,
  Calendar,
  CoatHook,
  EMBER,
  FramedPrint,
  Headphones,
  PenCup,
  Pip3,
  Plant,
  Radiator,
  Rug,
  ShelfFill,
  Slippers,
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
    <StarLantern x={724} hookY={86} cy={150} r={30} />
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

export const S13WallLow: React.FC = () => (
  <>
    <WallMarks x={150} y={1150} w={160} h={160} n={3} seed="s13/wm2" />
    <WallMarks x={660} y={1160} w={300} h={40} n={2} seed="s13/wm3" />
    {/* the shelf's foot: books and a jar on the floor inside the shelf (its last board is at 1140) */}
    <ShelfFill planks={[{x0: -16, x1: 72, y: FLOOR_Y - 2, room: 190}]} seed="s13/shelffoot" photo={false} plant={false} trailing={false} />
    {/* a coat and a striped scarf on a hook rail by the shelf, below the bubble's calm ring */}
    <CoatHook x={214} y={986} h={330} coat={EMBER.skyLow} seed="s13/coat" />
    {/* under the desk: the radiator with a sock drying on it (sways), a socket, a wicker bin */}
    <Radiator x={608} y={1200} w={350} h={150} seed="s13/rad" ink={W.far} />
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

export const S13Desk: React.FC = () => (
  <>
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

/** Behind you: the floorboards, the rug, the slippers, the floor plant, the open book. */
export const S13FloorBack: React.FC = () => {
  const rug: [Pt, Pt, Pt, Pt] = [[168, 1412], [962, 1412], [1076, 1694], [56, 1694]];
  return (
    <>
      <Floorboards />
      {/* a short colour shadow under the desk and the radiator (wall reveal penumbra, cozy v2 §4) */}
      <Fill rect={[500, 1384, 520, 14]} color="#E3B092" offset={false} />
      <Rug quad={rug} stripes={7} colors={[EMBER.hl, EMBER.wall, EMBER.skyLow, EMBER.wall, EMBER.books[0], EMBER.wall]} seed="s13/rug" ink={W.mid} />
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
    const zx = x + 44 + 40 * u + 7 * Math.sin(u * 5 + k);
    const zy = y - 112 - 84 * u;
    const size = 34 + (k % 3) * 6;
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
      <Fill d={blob(x + 10, y + 3, 84, 11, {seed: 's13/pipsh'})} color="#D9A58A" offset={false} />
      <Pip3 x={x} y={y} scale={1.45} pose="sleep" seed={13} />
      {zs}
    </>
  );
};
