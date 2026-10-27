// O1_dress (lane L1-opening, G5b): the HOOK's density and life, shared by O1 (0-5.80) and S15 (O1's set at O1 time
// 5.80 + t, held). Everything here is added AROUND the locked board (docs/v3/density_plan_g5b.md §1 O1, S15):
//   room plane   the attic wall dressed (a hanging pothos, a small print, plaster marks, warm string lights under the
//                beam, the bulbs blinking on 0.3-1.0), the shelf's trailing pothos, a print and a postcard right of the
//                window, a succulent on the sill, Pip on the sill (right third), and the desk: headphones in the lamp
//                pool, a plate of biscuits, the lamp's cable, the notebook (Nook's), glasses, sticky notes, a book stack
//                with a pen cup, a candle in a jar (lit at 0.62, the flame flickers), wood grain, the mug (steam).
//   far plane    the town behind the data center (a far hill row, cottages, a block with a neighbour at the window,
//                a snowy pine), the cooling plume sliding off the roof, the neighbours' house fronts below the horizon
//                (warm windows switching, two silhouettes, chimney smoke), a street lamp, walkers, three snow layers.
// Frame 0: the dressing's ink is mid-draw (at -0.14 .. -0.02, lighter weights than the window, phone and tag); fills
// land by ~0.2; the life pops after (bulbs 0.3-1.0, the candle 0.62). t < 0 = bare lines only (the loop underlay).
// Pip: watches the phone, follows each stick up the glass (1.88 / 2.18 / 2.40), a small hop on "pricier" (2.62),
// ears-cover when the building goes dark (4.16), then faces the dark building; in S15 (O1 time 7.56) its head turns
// from the building down to the tag. Scripted outside beats: a neighbour's light off at 4.6 (and 6.44 = S15 37.0),
// a walker reaches the lamp at 5.0, another passes under it at 7.04 (= S15 37.6).
import React from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, ellipse, line, roundRect, textLines} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {
  b,
  BookStack,
  Cable,
  DeskGrain,
  EMBER,
  fillAt,
  FramedPrint,
  Glasses,
  Headphones,
  LampPost3,
  Mug,
  NearFronts,
  PenCup,
  Pip3,
  Plant,
  Pop,
  PuffTrain,
  Show,
  SnowLayers,
  SnowTree,
  StickyNotes,
  StringLights3,
  sway,
  Tiny,
  TownHouse,
  TownRow,
  WallMarks,
  WindowSilhouette,
  windowLit,
  W,
  type LookKey,
  type PipPoseKey,
} from '../kit';

// ---------------------------------------------------------------- shared timing (O1 seconds; S15 = O1 5.80 + t)

/** Stick launches (O1_set's LAUNCH): Pip's head follows each one. */
const LAUNCH = [1.88, 2.18, 2.4, 2.6, 2.72];
const DARK_AT = 4.04;
/** S15's head turn ("ends up on your", VO 38.12) in O1 time. */
const S15_TURN = 5.8 + (38.12 - 36.36);

// ---------------------------------------------------------------- the far plane: the town and the street (behind glass)

const FAR_HILL = '#4B5884'; // one flat step between the sky and the roofs: the far hill town, fill only
const FAR_ROW = '#414D78';

/** Behind the data center (drawn before it): a far hill row, cottages, a block with a neighbour, a snowy pine. */
export const O1FarTown: React.FC = () => (
  <>
    {/* far hill row along the horizon, paler, tiny lit windows switching */}
    <TownRow x0={168} x1={920} y={946} w={36} gap={-2} color={FAR_HILL} far seed="o1/hill" at={-0.12} litFrac={0.5} />
    {/* left of the building: two cottages and a terrace stepping up, a snowy pine against its wall */}
    <TownHouse x={232} y={954} w={58} kind="terrace" color={FAR_ROW} far seed="o1/fl1" at={-0.1} litFrac={0.6} />
    <TownHouse x={284} y={956} w={50} kind="cottage" color={EMBER.roofs} far seed="o1/fl2" at={-0.09} litFrac={0.7} />
    <SnowTree x={318} y={958} h={96} kind="pine" far seed="o1/pine" at={-0.08} />
    {/* right of the building: a block of flats with balconies (a neighbour at a lit window), a cottage past the mullion */}
    <TownHouse x={762} y={956} w={66} h={150} kind="block" color={FAR_ROW} far dish seed="o1/fr1" at={-0.1} litFrac={0.7} />
    <Show at={0.1}>
      <WindowSilhouette x={772} y={846} w={20} h={24} who="cook" lit far seed="o1/blockwin" dark={EMBER.dcDark} />
      <WindowSilhouette x={800} y={892} w={18} h={22} who="read" lit={(t) => windowLit(t, 'o1/block', 0, 2, {gap: [1.2, 2.4]})} far seed="o1/blockwin2" dark={EMBER.dcDark} />
    </Show>
    <TownHouse x={838} y={956} w={58} kind="mansard" color={EMBER.roofs} far antenna seed="o1/fr2" at={-0.08} litFrac={0.6} />
  </>
);

/** The cooling plume: puffs slide off the roof units and drift right along the top of the glass (the units sit just
 *  above the glass top; the plan's "clipped by the glass"). Keeps going after the building goes dark (the loop). */
export const O1Plume: React.FC = () => (
  <Show at={0.1}>
    {[441, 540, 639].map((x, i) => (
      <PuffTrain key={i} x={x} y={640} n={6} life={3.2} rise={16} drift={150} r0={6} r1={19} wobble={3} stretch={1.7} color={EMBER.skyLow} seed={`o1/plume${i}`} at={0.1 - i * 0.9} />
    ))}
  </Show>
);

const LAMP_X = 796;

/** One tiny walker crossing once (feet y, x at t0 -> x1 at t1); fill only (behind glass). */
const Stroller: React.FC<{t: number; t0: number; t1: number; x0: number; x1: number; y: number; h: number; coat: string; hair?: string; kind?: 'walker' | 'dog' | 'pair' | 'umbrella' | 'sledge'}> = ({t, t0, t1, x0, x1, y, h, coat, hair, kind}) => {
  if (t < t0 || t > t1) return null;
  const x = x0 + ((x1 - x0) * (t - t0)) / (t1 - t0);
  return <Tiny x={x} y={y} h={h} t={t} coat={coat} hair={hair} kind={kind} dir={x1 >= x0 ? 1 : -1} />;
};

/** In front of the data center: the neighbours' house fronts (warm windows switching, silhouettes, smoke), the street
 *  lamp right of the phone, the walkers, three snow layers. */
export const O1NearLife: React.FC = () => {
  const t = useTime();
  // walker 1 (and a dog): appears from behind Pip at ~3.0, reaches the lamp at 5.0, goes on left (S15 too); 1 body h / s
  // walker 2: comes from behind the phone (seen once it lowers), passes under the lamp at 7.04 (S15 37.6)
  // windows (NearFronts order, left to right): 2 / 6 / 9 have neighbours; 9 goes dark at 4.6, 4 at 6.44 (S15 37.0)
  return (
    <>
      <NearFronts x0={168} x1={912} y={1036} h={[42, 64]} n={4} seed="o1/near" at={0.02} sil={{2: 'cross', 6: 'read', 9: 'wave'}} force={[{i: 9, t: -9, on: true}, {i: 9, t: 4.6, on: false}, {i: 4, t: -9, on: true}, {i: 4, t: 6.44, on: false}]} />
      <LampPost3 x={LAMP_X} y={1132} h={130} arm="top" seed="o1/lamp" at={0.04} ink={0} />
      <Stroller t={t} t0={2.9} t1={9} x0={LAMP_X + 63} x1={LAMP_X - 120} y={1040} h={30} coat={EMBER.beam} kind="dog" />
      <Stroller t={t} t0={3.2} t1={9} x0={LAMP_X - 115} x1={LAMP_X + 59} y={1042} h={28} coat={EMBER.skyLow} hair={EMBER.books[3]} />
      <SnowLayers x={180} y={630} w={720} h={430} band={null} seed="o1/snowL" at={0.1} wind={-6} />
    </>
  );
};

// ---------------------------------------------------------------- the room plane: wall, shelf, sill

/** A pothos in a hanging pot on three cords from a ceiling hook; it sways about the hook (slow, +-1.1 deg). */
const HangingPlant: React.FC<{x: number; y: number; at?: number}> = ({x, y, at}) => {
  const t = useTime();
  const hookY = -40;
  const a = sway(t, 1.1, 4.4, 0.7);
  const rimY = y - 30;
  const cords = line(x, hookY, x - 20, rimY, {over: [0, 0], seed: 'o1/hc1'}) + line(x, hookY, x + 2, rimY - 2, {over: [0, 0], seed: 'o1/hc2'}) + line(x, hookY, x + 20, rimY, {over: [0, 0], seed: 'o1/hc3'});
  return (
    <XG m={mat.about(mat.rotate(a), x, hookY)}>
      <Ink d={cords} at={at} width={W.hair} />
      <Plant x={x} y={y} kind="pothos" size={56} trail={62} amp={2} seed="o1/hang" at={b(at, 0.04)} ink={W.far} />
    </XG>
  );
};

/** The wall, the shelf and the sill (drawn after the Nook, before Pip). */
export const O1Wall: React.FC = () => (
  <>
    <WallMarks x={170} y={14} w={360} h={150} n={5} seed="o1/wm" at={-0.12} />
    <WallMarks x={952} y={940} w={110} h={120} n={2} seed="o1/wm2" at={-0.1} />
    <HangingPlant x={322} y={128} at={-0.13} />
    <FramedPrint x={430} y={36} w={86} h={104} picture="sun" seed="o1/print2" at={-0.11} ink={W.far} />
    {/* warm string lights under the attic beam (above the caption band), blinking on one by one 0.3-1.0 */}
    <StringLights3 points={[[574, 8], [744, 96], [904, 180], [1012, 234]]} sag={20} n={11} r={8} onAt={0.3} onDur={0.7} seed="o1/lights" at={-0.08} />
    {/* the shelf: a trailing pothos over the lower board's lip (the Nook's own pot plant moved off this board) */}
    <Plant x={90} y={856} kind="pothos" size={52} trail={176} seed="o1/shelfpothos" at={-0.1} ink={W.far} />
    {/* right of the window: a print and a postcard (the right rail carries dressing only) */}
    <FramedPrint x={956} y={644} w={108} h={146} picture="mountain" seed="o1/print" at={-0.12} ink={W.far} />
    <Postcard x={962} y={826} w={92} h={64} at={-0.06} />
    {/* the sill: a succulent between the lamp shade and its rod */}
    <Plant x={292} y={1060} kind="succulent" size={40} seed="o1/sillsu" at={-0.08} ink={W.far} />
  </>
);

/** A postcard taped to the wall (a sea, a stamp), its free corner lifting slightly in the room's air. */
const Postcard: React.FC<{x: number; y: number; w: number; h: number; at?: number}> = ({x, y, w, h, at}) => {
  const t = useTime();
  const a = -4 + sway(t, 0.8, 5.2, 1.3);
  const sea = `M${x + 6} ${y + h * 0.55}Q${x + w * 0.3} ${y + h * 0.45} ${x + w * 0.55} ${y + h * 0.56}T${x + w - 6} ${y + h * 0.52}L${x + w - 6} ${y + h - 6}L${x + 6} ${y + h - 6}Z`;
  return (
    <XG m={mat.about(mat.rotate(a), x + w / 2, y + 4)}>
      <Fill rect={[x, y, w, h]} color={EMBER.card} at={fillAt(at)} seed="o1/pc" />
      <Fill d={sea} color={EMBER.skyLow} at={fillAt(at, 0.04)} offset={false} />
      <Fill d={blob(x + w * 0.3, y + h * 0.32, 9, 9, {seed: 'o1/pcsun'})} color={EMBER.ring} at={fillAt(at, 0.06)} offset={false} />
      <Fill rect={[x + w - 22, y + 6, 15, 18]} color={EMBER.hl} at={fillAt(at, 0.07)} offset={false} />
      <Fill rect={[x + w * 0.38, y - 7, 24, 12]} color={EMBER.frost} at={fillAt(at, 0.08)} offset={false} />
      <Ink d={`M${x} ${y}h${w}v${h}h${-w}Z`} at={at} width={W.hair} />
    </XG>
  );
};

// ---------------------------------------------------------------- Pip on the sill

const PIP_X = 866;
const PIP_Y = 1060;
const PIP_KEYS: PipPoseKey[] = [
  {t: -9, pose: 'sit-back'},
  {t: 4.16, pose: 'ears-cover'},
  {t: 4.96, pose: 'sit-back'},
];
const PIP_LOOK: LookKey[] = [
  {t: -9, v: -0.5}, // down-left at the phone and its $999
  {t: 0.98, v: -0.05}, // a glance at the building as its sign pops... (after the colour, a beat late)
  {t: 1.44, v: -0.55}, // ...and back to the tag
  {t: LAUNCH[0] + 0.06, v: -0.95}, // follows the first stick up the glass
  {t: LAUNCH[1] + 0.04, v: -0.4},
  {t: LAUNCH[1] + 0.12, v: -0.95},
  {t: LAUNCH[2] + 0.1, v: -0.6},
  {t: 3.14, v: -0.45},
  {t: 3.72, v: -0.05}, // the phone lowers: it looks at the building
  {t: 4.96, v: 0.08}, // faces the dark building (O1's end = S15's start)
  {t: S15_TURN, v: -0.62}, // S15: from the building down to the tag
];

export const O1Pip: React.FC = () => (
  <Pip3 x={PIP_X} y={PIP_Y} seed={7} keys={PIP_KEYS} look={PIP_LOOK} lookDur={0.22} hops={[{t: 2.62, height: 14}]} jolts={[LAUNCH[1] + 0.02, LAUNCH[2] + 0.02]} at={-0.13} drawDur={0.9} />
);

// ---------------------------------------------------------------- the desk

/** A plate of biscuits (one bitten) and crumbs, lying in the lamp's light. */
const Biscuits: React.FC<{x: number; y: number; at?: number}> = ({x, y, at}) => {
  const r = rng('o1/biscuit');
  const plate = ellipse(x, y, 84, 25, {seed: 'o1/plate'});
  const rim = ellipse(x, y - 2, 62, 17, {seed: 'o1/rim'});
  const cookies: [number, number, number][] = [[x - 26, y - 8, 27], [x + 22, y - 2, 25], [x + 2, y - 18, 23]];
  const chips: React.ReactNode[] = [];
  cookies.forEach(([cx, cy, cr], i) => {
    for (let k = 0; k < 4; k++) chips.push(<Fill key={`c${i}_${k}`} d={blob(cx + r.jitter(cr * 0.55), cy + r.jitter(cr * 0.3), 3.2, 2.4, {seed: `o1/chip${i}${k}`})} color={EMBER.anchor} at={fillAt(at, 0.12 + i * 0.02)} offset={false} />);
  });
  return (
    <>
      <Fill d={plate} color={EMBER.card} at={fillAt(at)} seed="o1/plateF" />
      <Ink d={plate + rim} at={at} width={W.far} />
      {cookies.map(([cx, cy, cr], i) => {
        const bite = i === 2;
        const d = bite ? `M${cx - cr} ${cy}A${cr} ${cr * 0.62} 0 1 0 ${cx + cr * 0.62} ${cy - cr * 0.5}Q${cx + cr * 0.3} ${cy - cr * 0.12} ${cx + cr * 0.55} ${cy + cr * 0.1}Q${cx + cr * 0.1} ${cy - cr * 0.3} ${cx - cr} ${cy}Z` : ellipse(cx, cy, cr, cr * 0.62, {seed: `o1/ck${i}`});
        return (
          <React.Fragment key={i}>
            <Fill d={d} color={EMBER.books[6]} at={fillAt(at, 0.06 + i * 0.03)} seed={`o1/ckF${i}`} />
            <Ink d={d} at={b(at, 0.04 + i * 0.03)} width={W.hair} />
          </React.Fragment>
        );
      })}
      {chips}
      {[[x + 70, y + 30, 3], [x + 92, y + 22, 2.4], [x + 58, y + 40, 2]].map(([cx, cy, cr], i) => (
        <Fill key={`cr${i}`} d={circle(cx, cy, cr)} color={EMBER.books[6]} at={fillAt(at, 0.16)} offset={false} />
      ))}
    </>
  );
};

/** A candle in a glass jar: lit at `litAt` (the flame pops with a small warm halo); the flame flickers on drawn
 *  poses (12 / s) and leans with the room's air. */
const Candle: React.FC<{x: number; y: number; w?: number; at?: number; litAt: number}> = ({x, y, w = 56, at, litAt}) => {
  const t = useTime();
  const h = w * 1.12;
  const jar = `M${x - w / 2} ${y - h}L${x - w / 2} ${y - 8}Q${x - w / 2} ${y} ${x - w / 2 + 8} ${y}L${x + w / 2 - 8} ${y}Q${x + w / 2} ${y} ${x + w / 2} ${y - 8}L${x + w / 2} ${y - h}`;
  const waxTop = y - h * 0.56;
  const lit = t >= litAt;
  const k = Math.floor(t * 12);
  const fr = rng(`o1/flame${k}`);
  const fh = 22 * (0.86 + 0.28 * fr.next());
  const lean = 3 * Math.sin(t * 2.3) + fr.jitter(1.6);
  const fx = x;
  const fy = waxTop - 6;
  const flame = `M${fx - 7} ${fy}Q${fx - 8} ${fy - fh * 0.5} ${fx + lean} ${fy - fh}Q${fx + 8} ${fy - fh * 0.5} ${fx + 7} ${fy}Q${fx} ${fy + 5} ${fx - 7} ${fy}Z`;
  const core = `M${fx - 3.5} ${fy}Q${fx - 4} ${fy - fh * 0.3} ${fx + lean * 0.5} ${fy - fh * 0.55}Q${fx + 4} ${fy - fh * 0.3} ${fx + 3.5} ${fy}Z`;
  const haloR = 40 + (k % 3) * 1.5;
  return (
    <>
      {lit ? (
        <Pop at={litAt} x={fx} y={fy - 10} dur={0.14} from={0.3}>
          <path d={blob(fx, fy - 12, haloR, haloR * 0.92, {seed: 'o1/ch1'})} fill={EMBER.ring} />
          <path d={blob(fx, fy - 12, haloR * 0.6, haloR * 0.56, {seed: 'o1/ch2'})} fill={EMBER.core} />
        </Pop>
      ) : null}
      <Fill d={`${jar}Z`} color={EMBER.frost} at={fillAt(at)} seed="o1/jar" />
      <Fill rect={[x - w / 2 + 5, waxTop, w - 10, y - waxTop - 5]} color={EMBER.card} at={fillAt(at, 0.04)} offset={false} />
      <Fill rect={[x - w / 2 + 5, y - h * 0.3, w - 10, 9]} color={EMBER.pot} at={fillAt(at, 0.06)} offset={false} />
      <Ink d={jar + ellipse(x, y - h, w / 2, 6, {seed: 'o1/jarrim'})} at={at} width={W.far} />
      <Ink d={line(x, waxTop, x, waxTop - 7, {over: [0, 0], seed: 'o1/wick'})} at={b(at, 0.1)} width={W.hair} />
      <Ink d={line(x - w * 0.3, y - h * 0.85, x - w * 0.3, y - h * 0.55, {over: [0, 0], seed: 'o1/jarg'})} at={b(at, 0.12)} width={W.hair} color={EMBER.white} />
      {lit ? (
        <Pop at={litAt} x={fx} y={fy} dur={0.1} from={0.2}>
          <path d={flame} fill={EMBER.houseLit} stroke={EMBER.ink} strokeWidth={1.4} />
          <path d={core} fill={EMBER.core} />
        </Pop>
      ) : null}
    </>
  );
};

/** The desk dressing behind and beside the phone (room plane). */
export const O1Desk: React.FC = () => (
  <>
    <DeskGrain x={-20} y={1250} w={1120} h={640} n={7} seed="o1/grain" at={-0.06} />
    {/* the lamp's cable runs off the left edge under the biscuits */}
    <Cable points={[[332, 1190], [300, 1300], [190, 1326], [70, 1298], [-40, 1334]]} width={6} color={EMBER.anchor} at={-0.04} />
    <Headphones x={128} y={1238} w={150} seed="o1/hp" at={-0.1} ink={W.far} />
    <Biscuits x={150} y={1404} at={-0.08} />
    <Plant x={58} y={1540} kind="cactus" size={78} seed="o1/cactus" at={-0.07} ink={W.far} />
    {/* back right: two lying books with a pen cup, a candle in a jar in front of them */}
    <BookStack x={902} y={1194} w={134} n={2} seed="o1/stack" at={-0.1} ink={W.far} />
    <PenCup x={1048} y={1196} w={54} seed="o1/pens" at={-0.08} ink={W.far} />
    <Candle x={986} y={1336} at={-0.04} litAt={0.62} />
    {/* front right, beside the thumb: glasses and two sticky notes */}
    <Glasses x={890} y={1450} w={116} rot={-12} seed="o1/glasses" at={-0.06} ink={W.far} />
    <StickyNotes x={872} y={1558} n={2} size={74} seed="o1/sticky" at={-0.04} />
  </>
);

/** The listing's lower half (phone-local px, under the description; children of <Phone>): a star rating, a delivery
 *  row with a van icon, and three "you may also like" cards (neutral boxes, never another hero laptop). */
export const O1Listing: React.FC<{w: number; at?: number}> = ({w, at}) => {
  const k = w / 400;
  const y0 = 722 * k;
  const star = (cx: number, cy: number, r: number) => {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      d += `${i ? 'L' : 'M'}${(cx + rr * Math.cos(a)).toFixed(1)} ${(cy + rr * Math.sin(a)).toFixed(1)}`;
    }
    return d + 'Z';
  };
  const stars = [0, 1, 2, 3, 4].map((i) => star((50 + i * 24) * k, y0, 9 * k)).join('');
  const cards = [0, 1, 2].map((i) => roundRect((40 + i * 110) * k, y0 + 96 * k, 96 * k, 112 * k, 10 * k)).join('');
  const thumbs = [0, 1, 2].map((i) => roundRect((52 + i * 110) * k, y0 + 108 * k, 72 * k, 48 * k, 6 * k)).join('');
  return (
    <>
      <Fill d={stars} color={EMBER.ring} at={fillAt(at, 0.04)} offset={false} />
      <Ink d={stars} at={at} width={1.4} />
      <Ink d={textLines(176 * k, y0 + 6 * k, 90 * k, {n: 1, gap: 18 * k, seed: 'o1/rate', heading: false})} at={b(at, 0.04)} width={1.6} />
      {/* delivery: a tiny van and its line */}
      <Fill d={roundRect(40 * k, y0 + 34 * k, 34 * k, 20 * k, 3 * k) + roundRect(72 * k, y0 + 40 * k, 14 * k, 14 * k, 3 * k)} color={EMBER.skyLow} at={fillAt(at, 0.06)} offset={false} />
      <Ink d={circle(50 * k, y0 + 56 * k, 4 * k) + circle(78 * k, y0 + 56 * k, 4 * k)} at={b(at, 0.06)} width={1.4} />
      <Ink d={textLines(100 * k, y0 + 46 * k, 220 * k, {n: 1, gap: 18 * k, seed: 'o1/deliv', heading: false})} at={b(at, 0.08)} width={1.6} />
      {/* you may also like */}
      <Fill d={cards} color={EMBER.paper} at={fillAt(at, 0.1)} offset={false} />
      <Fill d={thumbs} color={EMBER.reveal} at={fillAt(at, 0.12)} offset={false} />
      <Ink d={cards} at={b(at, 0.1)} width={1.6} />
      <Ink d={[0, 1, 2].map((i) => textLines((52 + i * 110) * k, y0 + 176 * k, 70 * k, {n: 2, gap: 14 * k, seed: `o1/card${i}`, heading: false})).join('')} at={b(at, 0.14)} width={1.4} />
    </>
  );
};

/** The mug (as the Nook built it: same seed, place and build time), drawn after Pip so its steam stays in front. */
export const O1Mug: React.FC<{nookAt: number}> = ({nookAt}) => <Mug x={790} top={1124} at={nookAt + 0.12} seed="o1/nook" />;

export const O1_PIP = {x: PIP_X, y: PIP_Y};
