// S5_shop (S5 lane, G5b): the computer shop round the face beat (docs/v3/density_plan_g5b.md S5, the approved pilot bar).
// The world behind you, back to front:
//   the ceiling: a plaster ceiling with flat downlights, the bulkhead with a vent and a dome camera (its LED blinks),
//     warm string lights in shallow swags under it, the LAPTOPS sign hanging on two chains (a slow sway), the wall
//     clock (the second hand ticks), a framed ad on the near wall: all above the caption band;
//   the shop's front window (left, cut by the left edge, never behind your head): the snowy street at blue hour (the
//     house fronts opposite with lit windows switching and a neighbour, the snowy pavement, a lamp post with its halo,
//     falling snow, passers-by: one with an umbrella, one with a dog, a big one right outside the glass), a roller
//     blind, a run of bulbs on the window head, frost and glints; a customer in front of it (mid-depth, back view,
//     beanie, snow on the shoulders) holding up a laptop box to read it; heads turn after the pop;
//   the near wall (right, the shelf's wall): a pegboard of accessories on hooks (mice, cables, earbuds, headphones,
//     SD cards, chargers) that sway and jolt with the pop; on the BETTER shelf beside the slot a router (LEDs) and a
//     box stack that hop 4 px with the pop, shelf labels; under it a hook bar with packs, the lower shelf (a monitor
//     cycling slides, laptop boxes, talkers) and a bottom row (a speaker, boxes) behind the counter.
// LOCKED (storyboard_g3 / camera_plan_g3): nothing here touches your head's 40 px ring (x ~180-480, y ~695-1015),
// the BETTER slot (x 540-860 above the plank), the new tag's ring (x ~710-960, y ~980-1125) or the caption band
// (y 290-600). Every motion is a pure function of panel time (60 fps), deterministic, no opacity.
import React, {useMemo} from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, glint, line, rect as rectInk, roundRect, textLines} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {
  EMBER,
  Frost,
  LampPost3,
  LaptopBox,
  NearFronts,
  SnowLayers,
  StringLights3,
  Txt,
  W,
  WallClock,
  Walker,
  WinterPerson,
  ease01,
  personGeo,
  rings,
  sway,
  winterPersonMat,
} from '../kit';
import type {PersonMove, Pt, WinterPersonProps} from '../kit';

// ---------------------------------------------------------------- geometry (canvas px at camera rest)

/** The ceiling line and the bulkhead's underside. */
const CEIL_Y = 40;
const BULK_Y = 108;
/** The front window's glass (cut by the left edge) and its frame. */
export const WIN = {x0: -80, x1: 146, y0: 646, y1: 1400, fr: 18};
/** The street through the glass: the far pavement's line (the fronts stand on it) and the kerb. */
const FAR_GROUND = 950;
const KERB = 994;
/** The pegboard on the near wall, right of the BETTER slot (cut by the right edge). */
const PEG = {x: 884, y: 628, w: 236, h: 304};
/** The BETTER shelf's plank top (S5.tsx SHELF.y) and the lower shelf's plank top. */
const PLANK = 958;
const LOW = 1262;
/** The shop's warm wood shade (kraft boxes, cork). */
const KRAFT = '#C98A64';
/** The kraft box's lit top face and its shade side (one flat step each way). */
const KRAFT_LIGHT = '#DDA27C';
const KRAFT_DARK = '#A9694B';
/** One flat step under the near wall (shelf backs, the pegboard holes). */
const WALL_SHADE = '#E2BFA5';

export type ShopBeats = {
  /** The BETTER pop (things on the shelf hop, the pegboard packs jolt). */
  popAt: number;
  /** Heads turn toward the new laptop (customer, then the walker outside ignores it). */
  customerTurn: number;
  /** The monitor's slide changes. */
  slides: number[];
};

const jolt = (t: number, at: number) => -Math.abs(rings(t, [at], 4, 5, 8));

// ---------------------------------------------------------------- the ceiling (above the caption band)

const TV_BG = [EMBER.dc, EMBER.ring, EMBER.dcSide];

/** The demo screen on the wall under the bulkhead (top left): an ad that changes on `slides` (a stepped slide-in from
 *  the right, no fade): a laptop with sparkles, a box with lines, a laptop with a gold star. */
const DemoScreen: React.FC<{slides: number[]}> = ({slides}) => {
  const t = useTime();
  const tv = {x: 178, y: 150, w: 176, h: 108};
  const k = slides.filter((s) => t >= s).length;
  const since = k ? t - slides[k - 1] : 9;
  const slideX = since < 0.16 ? (1 - ease01(since, 0, 0.16)) * tv.w : 0;
  const bg = TV_BG[k % 3];
  const prevBg = TV_BG[(k + 2) % 3];
  const fg = k % 3 === 1 ? EMBER.beam : EMBER.core;
  const sw = tv.w - 16;
  const sh = tv.h - 16;
  return (
    <>
      <path d={`M${tv.x + 50} ${BULK_Y}V${tv.y}M${tv.x + tv.w - 50} ${BULK_Y}V${tv.y}`} stroke={EMBER.anchor} strokeWidth={5} />
      <Fill rect={[tv.x, tv.y, tv.w, tv.h]} color={EMBER.anchor} seed="s5sh/tv" />
      <svg x={tv.x + 8} y={tv.y + 8} width={sw} height={sh} overflow="hidden">
        <rect x={0} y={0} width={sw} height={sh} fill={prevBg} />
        <g transform={`translate(${slideX.toFixed(1)} 0)`}>
          <rect x={0} y={0} width={sw} height={sh} fill={bg} />
          {k % 3 === 1 ? (
            <>
              <rect x={20} y={20} width={50} height={52} fill="none" stroke={fg} strokeWidth={4} />
              <path d={textLines(84, 30, 60, {seed: `s5sh/tvl${k}`, n: 3, gap: 16})} stroke={fg} strokeWidth={5} strokeLinecap="round" fill="none" />
            </>
          ) : (
            <>
              <path d={`M50 22h60v38h-60ZM40 64h80l-7 9h-66Z`} fill="none" stroke={fg} strokeWidth={4} strokeLinejoin="round" />
              {k % 3 === 0 ? (
                <path d={`M128 22v14M121 29h14M30 40v10M25 45h10`} stroke={EMBER.houseLit} strokeWidth={3} strokeLinecap="round" />
              ) : (
                <path d={`M132 18l4 9l9 1l-7 6l2 9l-8 -5l-8 5l2 -9l-7 -6l9 -1Z`} fill={EMBER.board} />
              )}
            </>
          )}
        </g>
      </svg>
      <Ink d={rectInk(tv.x, tv.y, tv.w, tv.h, {seed: 's5sh/tvI', over: [0, 2]})} width={W.mid} />
      <path d={glint(tv.x + tv.w - 34, tv.y + 18, 20, {seed: 's5sh/tvg'})} fill="none" stroke={EMBER.white} strokeWidth={2} strokeLinecap="round" />
    </>
  );
};

/** Plaster ceiling with flat downlights, the bulkhead (a vent, the dome camera), the clock and the framed ad. */
export const S5Ceiling: React.FC<{tvSlides?: number[]}> = ({tvSlides = []}) => {
  const t = useTime();
  const camOn = Math.floor(t / 0.7) % 2 === 0;
  const signA = sway(t, 0.9, 3.4, 0.6);
  const vent = Array.from({length: 6}, (_, i) => line(410, 62 + i * 7, 520, 62 + i * 7, {over: [0, 0], seed: `s5sh/vs${i}`})).join('');
  return (
    <>
      {/* ceiling plane and its downlights */}
      <Fill rect={[-60, -60, 1200, CEIL_Y + 60]} color={EMBER.reveal} offset={false} />
      {[160, 540, 920].map((x, i) => (
        <React.Fragment key={i}>
          <path d={blob(x, CEIL_Y - 14, 64, 15, {seed: `s5sh/dlh${i}`, wobble: 0.02})} fill={EMBER.ring} />
          <path d={blob(x, CEIL_Y - 14, 38, 9, {seed: `s5sh/dl${i}`, wobble: 0.02})} fill={EMBER.core} />
        </React.Fragment>
      ))}
      {/* the bulkhead face */}
      <Fill rect={[-60, CEIL_Y, 1200, BULK_Y - CEIL_Y]} color={EMBER.shelf} seed="s5sh/bulk" />
      <Fill rect={[-60, BULK_Y - 10, 1200, 10]} color={EMBER.desk} offset={false} />
      <Ink d={line(-50, CEIL_Y, 1130, CEIL_Y, {seed: 's5sh/ceil', over: [0, 0]})} width={W.far} />
      <Ink d={line(-50, BULK_Y, 1130, BULK_Y, {seed: 's5sh/bulkI', over: 'medium'})} width={W.mid} />
      {/* vent grille */}
      <Fill rect={[402, 54, 126, 48]} color={EMBER.wall} seed="s5sh/vent" />
      <Ink d={rectInk(402, 54, 126, 48, {seed: 's5sh/ventI', over: [0, 1]})} width={W.far} />
      <Ink d={vent} width={W.hair} />
      {/* the dome camera under the bulkhead (its LED blinks) */}
      <Fill rect={[786, BULK_Y, 40, 10]} color={EMBER.card} offset={false} />
      <Fill d={`M780 ${BULK_Y + 10}h52a26 26 0 0 1 -52 0Z`} color={EMBER.dcSide} seed="s5sh/dome" />
      <circle cx={814} cy={BULK_Y + 22} r={4} fill={camOn ? EMBER.houseLit : EMBER.dcDark} />
      <Ink d={`M780 ${BULK_Y + 10}h52a26 26 0 0 1 -52 0Z`} width={W.far} />
      <path d={glint(796, BULK_Y + 24, 14, {seed: 's5sh/domeg'})} fill="none" stroke={EMBER.white} strokeWidth={2} strokeLinecap="round" />
      {/* the LAPTOPS sign on two chains (a slow sway about the bulkhead) */}
      <XG m={mat.about(mat.rotate(signA), 760, BULK_Y)}>
        <path d={`M632 ${BULK_Y}V158M888 ${BULK_Y}V158`} stroke={EMBER.anchor} strokeWidth={2.6} strokeDasharray="5 4" />
        <Fill d={roundRect(600, 156, 320, 92, 10)} color={EMBER.dc} seed="s5sh/sign" />
        <path d={`M624 ${172}h272v60h-272Z`} fill="none" stroke={EMBER.skyLow} strokeWidth={2.4} />
        {/* laptop pictogram */}
        <path d={`M640 186h52v32h-52ZM632 222h68l-6 8h-56Z`} fill="none" stroke={EMBER.core} strokeWidth={3.4} strokeLinejoin="round" />
        <Txt x={800} y={218} size={44} fill={EMBER.core} fit={176}>
          LAPTOPS
        </Txt>
        <Ink d={roundRect(600, 156, 320, 92, 10, {closed: false, seed: 's5sh/signI'})} width={W.mid} />
      </XG>
      {/* warm bulbs in shallow swags under the bulkhead (lowest bulb ~y 150) */}
      <StringLights3 points={[[-30, BULK_Y + 8], [250, BULK_Y + 12], [520, BULK_Y + 10], [790, BULK_Y + 12], [1110, BULK_Y + 8]]} sag={26} n={24} r={7} sway={1} seed="s5sh/bulbs" />
      {/* the wall clock and the demo screen (left), the framed ad on the near wall (right) */}
      <WallClock cx={92} cy={226} r={42} startMin={17} seed="s5sh/clock" ink={W.mid} />
      <DemoScreen slides={tvSlides} />
      <Fill rect={[948, 162, 128, 108]} color={EMBER.beam} seed="s5sh/adF" />
      <Fill rect={[958, 172, 108, 88]} color={EMBER.sky} offset={false} />
      <path d={`M982 188h58v34h-58ZM974 226h74l-6 7h-62Z`} fill="none" stroke={EMBER.snow} strokeWidth={2.6} strokeLinejoin="round" />
      <path d={`M972 246h56M972 254h36`} stroke={EMBER.houseLit} strokeWidth={3} strokeLinecap="round" />
      <Ink d={rectInk(948, 162, 128, 108, {seed: 's5sh/adI', over: [0, 2]})} width={W.far} />
    </>
  );
};

// ---------------------------------------------------------------- the front window and the street

/** The street seen through the shop window: sky, the fronts opposite (lit windows on a switching schedule, a
 *  neighbour), the far pavement, the kerb and road, a lamp post with its halo, passers-by, snow. */
const Street: React.FC = () => {
  const {x0, x1, y0, y1} = WIN;
  const w = x1 - x0;
  const fp: Pt[] = useMemo(() => Array.from({length: 6}, (_, i) => [x0 + 30 + i * 40, FAR_GROUND + 16 + (i % 2) * 10] as Pt), [x0]);
  return (
    <>
      <rect x={x0} y={y0} width={w} height={y1 - y0} fill={EMBER.sky} />
      <rect x={x0} y={y0 + 70} width={w} height={60} fill={EMBER.skyLow} />
      <NearFronts x0={x0 - 20} x1={x1 + 70} y={FAR_GROUND} h={[196, 236]} n={2} seed="s5sh/fronts" sil={{1: 'cross', 2: 'read'}} gap={[0.5, 1.1]} />
      {/* a lit shopfront opposite (awning stripes, a warm window) */}
      <rect x={x0 + 108} y={FAR_GROUND - 74} width={96} height={74} fill={EMBER.houseLit} />
      <path d={`M${x0 + 100} ${FAR_GROUND - 90}h112l-8 18h-96Z`} fill={EMBER.card} />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x0 + 104 + i * 22} y={FAR_GROUND - 90} width={11} height={18} fill={EMBER.dc} />
      ))}
      <rect x={x0 + 140} y={FAR_GROUND - 56} width={30} height={56} fill={EMBER.beam} />
      {/* the far pavement, the kerb, the road */}
      <rect x={x0} y={FAR_GROUND} width={w} height={KERB - FAR_GROUND} fill={EMBER.snow} />
      <rect x={x0} y={KERB} width={w} height={10} fill={EMBER.frost} />
      <rect x={x0} y={KERB + 10} width={w} height={y1 - KERB} fill={EMBER.road} />
      <path d={`M${x0} ${KERB + 44}H${x1}M${x0} ${KERB + 70}H${x1}`} stroke={EMBER.frost} strokeWidth={6} strokeDasharray="40 26" />
      {fp.map(([fx, fy], i) => (
        <ellipse key={i} cx={fx} cy={fy} rx={5} ry={2.4} fill={EMBER.frost} />
      ))}
      <LampPost3 x={92} y={KERB + 4} h={276} arm="left" seed="s5sh/lamp" ink={W.far} />
      {/* passers-by on the far pavement: an umbrella (already crossing at the cut), a dog walker */}
      <Walker from={[x0 - 60, FAR_GROUND + 28]} to={[x1 + 80, FAR_GROUND + 28]} h={150} window={[-0.9, 1.25]} seed="s5sh/wk1" wear={['umbrella', 'snow']} ink={W.far} />
      <Walker from={[x1 + 80, FAR_GROUND + 36]} to={[x0 - 60, FAR_GROUND + 36]} h={158} window={[0.35, 2.6]} seed="s5sh/wk2" dog ink={W.far} />
      {/* right outside the glass, big: a passer-by with a bag hurrying past (1.20-2.10) */}
      <Walker from={[x1 + 160, 1250]} to={[x0 - 160, 1250]} h={470} window={[1.2, 2.1]} seed="s5sh/wk3" wear={['bag', 'snow']} acc={['scarf']} steps={2.6} ink={W.mid} />
      <SnowLayers x={x0} y={y0} w={w} h={y1 - y0} band={null} density={1.7} seed="s5sh/snow" />
    </>
  );
};

/** The window: frame, roller blind, bulbs on the head, frost, glints; the street inside the glass. */
export const S5Window: React.FC = () => {
  const {x0, x1, y0, y1, fr} = WIN;
  const w = x1 - x0;
  const clip = 's5shwin';
  return (
    <>
      <Fill rect={[x0 - fr, y0 - fr, w + fr * 2, y1 - y0 + fr]} color={EMBER.beam} seed="s5sh/winF" />
      <defs>
        <clipPath id={clip}>
          <rect x={x0} y={y0} width={w} height={y1 - y0} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <Street />
        {/* the roller blind, a third down: cream with a pull cord */}
        <rect x={x0} y={y0} width={w} height={46} fill={EMBER.reveal} />
        <path d={`M${x0} ${y0 + 46}H${x1}`} stroke={EMBER.beam} strokeWidth={6} />
        <path d={`M${x1 - 34} ${y0 + 46}v26`} stroke={EMBER.ink} strokeWidth={1.6} />
        <circle cx={x1 - 34} cy={y0 + 76} r={5} fill={EMBER.beam} />
      </g>
      <Frost x={x0} y={y0 + 46} w={w} h={y1 - y0 - 46} corners={['tr']} size={64} seed="s5sh/frost" />
      <Ink d={rectInk(x0 - fr, y0 - fr, w + fr * 2, y1 - y0 + fr, {seed: 's5sh/winFI', over: [4, 0], edges: 'trb'}) + rectInk(x0, y0, w, y1 - y0, {seed: 's5sh/winGI', over: [0, 2], edges: 'trb'})} width={W.mid} />
      <Ink d={line(x0, y0 + 46, x1, y0 + 46, {seed: 's5sh/blindI', over: [0, 0]})} width={W.hair} />
      <path d={glint(x1 - 70, y0 + 120, 54, {seed: 's5sh/wg1'}) + glint(x1 - 40, y0 + 250, 30, {seed: 's5sh/wg2'})} fill="none" stroke={EMBER.white} strokeWidth={W.far} strokeLinecap="round" />
      {/* a run of bulbs along the window head */}
      <StringLights3 from={[x0 - 10, y0 - 14]} to={[x1 + 22, y0 - 12]} sag={10} n={6} r={6} halo={false} sway={0.6} seed="s5sh/winbulbs" />
    </>
  );
};

/** The customer by the window: mid-depth, back view, beanie and snowy shoulders, reading a laptop box held up at the
 *  right shoulder (between their head and your shoulder, clear of your head's ring): a real box (tilted 13 deg, its
 *  top and side faces showing, the ink laptop icon on the face toward us, kraft so it is never the brightest shape on
 *  the left), mittened fingers at its edges. The head is turned a quarter toward it (an ear under the beanie, a sliver of
 *  cheek); on the pop it swings round to three-quarters, up at the new laptop (the whole cheek, the nose tip, a lash),
 *  the body wobbles and the box dips. Box and head ride the figure's own matrix (breath, turn, lean). */
export const S5Customer: React.FC<{turnAt: number}> = ({turnAt}) => {
  const t = useTime();
  const seed = 's5sh/cust';
  const s = 1.95;
  const torsoH = 150;
  const g = personGeo(seed, {torsoH});
  const hip = 905 - g.headTop * s;
  const X = 74;
  const moves: PersonMove[] = [
    {t: turnAt, kind: 'turn', amp: 2.2},
    {t: 1.62, kind: 'lean', amp: 1.2},
  ];
  const props: WinterPersonProps = {x: X, y: hip, s, seed, torsoH, hair: 'beanie', acc: ['scarf'], wear: ['snow'], coat: EMBER.skyLow, hat: EMBER.beam, coatDetail: ['quilt'], moves, breathe: 1.6, ink: W.mid};
  const m = winterPersonMat(props, t);
  const k = 1 / s;
  const ink = W.mid * k;
  // the box (figure-local px): centre right of the head at shoulder height; it rises a little as they read, dips and
  // flattens on the turn
  const turnK = ease01(t, turnAt, 0.2);
  const bcx = (144 - X) * k;
  const bcy = (966 - hip) * k - ease01(t, 0.1, 0.5) * 3 * k + turnK * 9 * k;
  const ang = 13 - turnK * 5;
  const bw = 80 * k;
  const bh = 52 * k;
  const dz = 8 * k; // top / side face depth
  const box = (
    <XG m={mat.about(mat.rotate(ang), bcx, bcy)}>
      {/* top face, side face, the face toward us */}
      <path d={`M${bcx - bw / 2} ${bcy - bh / 2}l${dz} ${-dz}h${bw}l${-dz} ${dz}Z`} fill={KRAFT_LIGHT} />
      <path d={`M${bcx + bw / 2} ${bcy - bh / 2}l${dz} ${-dz}v${bh}l${-dz} ${dz}Z`} fill={KRAFT_DARK} />
      <rect x={bcx - bw / 2} y={bcy - bh / 2} width={bw} height={bh} fill={KRAFT} />
      <path d={`M${bcx - bw / 2} ${bcy - bh / 2}l${dz} ${-dz}h${bw}l${-dz} ${dz}M${bcx + bw / 2 + dz} ${bcy - bh / 2 - dz}v${bh}l${-dz} ${dz}`} fill="none" stroke={EMBER.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" />
      <rect x={bcx - bw / 2} y={bcy - bh / 2} width={bw} height={bh} fill="none" stroke={EMBER.ink} strokeWidth={ink} />
      {/* the ink laptop icon and a spec sticker */}
      <path d={`M${bcx - 15 * k} ${bcy - 14 * k}h${28 * k}v${18 * k}h${-28 * k}ZM${bcx - 21 * k} ${bcy + 9 * k}h${40 * k}`} fill="none" stroke={EMBER.ink} strokeWidth={2.2 * k} strokeLinejoin="round" strokeLinecap="round" />
      <rect x={bcx + 20 * k} y={bcy + 12 * k} width={14 * k} height={9 * k} fill={EMBER.card} />
      {/* mittened fingers over the edges */}
      <path d={blob(bcx - bw / 2 + 2 * k, bcy + 8 * k, 8 * k, 12 * k, {seed: `${seed}/mL`})} fill={EMBER.beam} stroke={EMBER.ink} strokeWidth={ink * 0.8} />
      <path d={blob(bcx + bw / 2 + 4 * k, bcy + 6 * k, 8 * k, 12 * k, {seed: `${seed}/mR`})} fill={EMBER.beam} stroke={EMBER.ink} strokeWidth={ink * 0.8} />
      <path d={`M${bcx + bw / 2 - 3 * k} ${bcy - 4 * k}q${5 * k} ${-6 * k} ${10 * k} 0`} fill="none" stroke={EMBER.ink} strokeWidth={ink * 0.7} strokeLinecap="round" />
    </XG>
  );
  // the head's turn: u 0.35 (a quarter, down at the box) -> 1 (three-quarters, up at the shelf), a 0.12 s swing
  const u = 0.3 + 0.7 * ease01(t, turnAt, 0.12);
  const hr = g.hr;
  const hy = g.hy;
  const nose = ease01(u, 0.6, 0.4);
  const A: Pt = [hr * 0.9, hy + hr * 0.4];
  const B: Pt = [hr * (0.98 + 0.36 * u), hy + hr * 0.66];
  const C: Pt = [hr * (0.56 + 0.22 * u), hy + hr * 1.02];
  const cheek = `M${A[0]} ${A[1]}Q${hr * (1.0 + 0.42 * u)} ${hy + hr * 0.42} ${B[0]} ${B[1]}Q${hr * (0.98 + 0.26 * u)} ${hy + hr * 0.96} ${C[0]} ${C[1]}Q${hr * 0.9} ${hy + hr * 0.8} ${A[0]} ${A[1]}Z`;
  const cheekInk = `M${A[0]} ${A[1]}Q${hr * (1.0 + 0.42 * u)} ${hy + hr * 0.42} ${B[0]} ${B[1]}Q${hr * (0.98 + 0.26 * u)} ${hy + hr * 0.96} ${C[0]} ${C[1]}`;
  const ear: Pt = [hr * (0.84 - 0.4 * u), hy + hr * 0.6];
  const nx = hr * (1.04 + 0.36 * u);
  const ny = hy + hr * 0.52;
  return (
    <>
      <XG m={m}>{box}</XG>
      <WinterPerson {...props} />
      <XG m={m}>
        <path d={cheek} fill={EMBER.reveal} />
        <path d={cheekInk} fill="none" stroke={EMBER.ink} strokeWidth={ink} strokeLinecap="round" />
        {nose > 0.02 ? (
          <>
            <path d={`M${nx - hr * 0.06} ${ny - hr * 0.08}l${hr * 0.2 * nose} ${hr * 0.13}l${-hr * 0.17 * nose} ${hr * 0.08}Z`} fill={EMBER.reveal} />
            <path d={`M${nx - hr * 0.06} ${ny - hr * 0.08}l${hr * 0.2 * nose} ${hr * 0.13}l${-hr * 0.17 * nose} ${hr * 0.08}`} fill="none" stroke={EMBER.ink} strokeWidth={ink * 0.8} strokeLinejoin="round" strokeLinecap="round" />
            <path d={`M${hr * (0.92 + 0.2 * u)} ${hy + hr * 0.46}l${hr * 0.16 * nose} ${-hr * 0.05}`} stroke={EMBER.ink} strokeWidth={ink * 0.8} strokeLinecap="round" />
          </>
        ) : null}
        <path d={blob(ear[0], ear[1], hr * 0.15, hr * 0.21, {seed: `${seed}/ear`})} fill={EMBER.reveal} stroke={EMBER.ink} strokeWidth={ink * 0.8} />
        <path d={`M${ear[0] + hr * 0.04} ${ear[1] - hr * 0.1}q${-hr * 0.08} ${hr * 0.1} 0 ${hr * 0.2}`} fill="none" stroke={EMBER.ink} strokeWidth={ink * 0.5} strokeLinecap="round" />
      </XG>
    </>
  );
};

// ---------------------------------------------------------------- the near wall (right of the slot)

type PackKind = 'mouse' | 'cable' | 'buds' | 'phones' | 'sd' | 'plug' | 'case';
const PACKS: {kind: PackKind; color: string}[][] = [
  [{kind: 'mouse', color: EMBER.card}, {kind: 'cable', color: EMBER.ring}, {kind: 'buds', color: EMBER.frost}],
  [{kind: 'phones', color: EMBER.dcSide}, {kind: 'sd', color: EMBER.card}, {kind: 'plug', color: EMBER.books[1]}],
  [{kind: 'mouse', color: EMBER.skyLow}, {kind: 'case', color: EMBER.books[4]}, {kind: 'cable', color: EMBER.card}],
];

/** One blister pack on a hook (hook top at y): a card with a hang hole, the product drawn in it, a price sticker. */
const Pack: React.FC<{x: number; y: number; kind: PackKind; color: string; seed: string; a: number}> = ({x, y, kind, color, seed, a}) => {
  const w = 54;
  const h = 76;
  const px = x - w / 2;
  const py = y + 8;
  const cx = x;
  const cy = py + h * 0.56;
  let product: React.ReactNode = null;
  if (kind === 'mouse')
    product = (
      <>
        <path d={blob(cx, cy, 13, 19, {seed: `${seed}/m`})} fill={color === EMBER.card ? EMBER.dcSide : EMBER.card} />
        <path d={`M${cx} ${cy - 18}v12`} stroke={EMBER.ink} strokeWidth={1.4} />
      </>
    );
  else if (kind === 'cable')
    product = (
      <>
        <circle cx={cx} cy={cy} r={15} fill="none" stroke={color === EMBER.card ? EMBER.dc : EMBER.beam} strokeWidth={4} />
        <circle cx={cx} cy={cy} r={8} fill="none" stroke={color === EMBER.card ? EMBER.dc : EMBER.beam} strokeWidth={3} />
      </>
    );
  else if (kind === 'buds')
    product = (
      <>
        <path d={roundRect(cx - 15, cy - 10, 30, 22, 9)} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={1.2} />
        <path d={`M${cx - 15} ${cy}h30`} stroke={EMBER.ink} strokeWidth={1.2} />
      </>
    );
  else if (kind === 'sd')
    product = <path d={`M${cx - 11} ${cy - 15}h16l6 6v24h-22Z`} fill={EMBER.skyLow} stroke={EMBER.ink} strokeWidth={1.2} />;
  else if (kind === 'plug')
    product = (
      <>
        <path d={roundRect(cx - 12, cy - 8, 24, 22, 4)} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={1.2} />
        <path d={`M${cx - 5} ${cy - 8}v-8M${cx + 5} ${cy - 8}v-8`} stroke={EMBER.ink} strokeWidth={2.4} />
      </>
    );
  else if (kind === 'case') product = <path d={roundRect(cx - 12, cy - 20, 24, 40, 6)} fill={EMBER.dc} stroke={EMBER.ink} strokeWidth={1.2} />;
  if (kind === 'phones') {
    // headphones straight on the hook, no card
    return (
      <XG m={mat.about(mat.rotate(a), x, y)}>
        <path d={`M${x - 24} ${y + 50}C${x - 28} ${y - 2} ${x + 28} ${y - 2} ${x + 24} ${y + 50}`} fill="none" stroke={EMBER.ink} strokeWidth={10} strokeLinecap="round" />
        <path d={`M${x - 24} ${y + 50}C${x - 28} ${y - 2} ${x + 28} ${y - 2} ${x + 24} ${y + 50}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
        <path d={roundRect(x - 36, y + 42, 20, 32, 7)} fill={color} stroke={EMBER.ink} strokeWidth={2} />
        <path d={roundRect(x + 16, y + 42, 20, 32, 7)} fill={color} stroke={EMBER.ink} strokeWidth={2} />
      </XG>
    );
  }
  return (
    <XG m={mat.about(mat.rotate(a), x, y)}>
      <path d={roundRect(px + 2, py + 3, w, h, 5)} fill={WALL_SHADE} />
      <path d={roundRect(px, py, w, h, 5)} fill={color} />
      <circle cx={x} cy={py + 9} r={4.2} fill={EMBER.reveal} />
      <path d={roundRect(px + 7, py + 20, w - 14, h - 28, 6)} fill={EMBER.card} stroke={EMBER.frost} strokeWidth={2} />
      {product}
      <rect x={px + w - 22} y={py + h - 14} width={18} height={10} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={1} />
      <path d={roundRect(px, py, w, h, 5, {closed: false, seed: `${seed}/i`})} fill="none" stroke={EMBER.ink} strokeWidth={W.far} />
    </XG>
  );
};

/** The pegboard of accessories (right of the slot, cut by the right edge): holes, hooks, packs that sway and jolt. */
const Pegboard: React.FC<{popAt: number}> = ({popAt}) => {
  const t = useTime();
  const {x, y, w, h} = PEG;
  const holes = useMemo(() => {
    let d = '';
    for (let yy = y + 14; yy < y + h - 8; yy += 22) for (let xx = x + 14; xx < x + w; xx += 22) d += `M${xx - 2.2} ${yy}a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0`;
    return d;
  }, [x, y, w, h]);
  const cols = [932, 1000, 1066];
  const rows = [646, 744, 842];
  return (
    <>
      <Fill rect={[x - 10, y - 10, w + 20, h + 20]} color={EMBER.beam} seed="s5sh/pegF" />
      <Fill rect={[x, y, w, h]} color={EMBER.shelf} offset={false} />
      <path d={holes} fill={KRAFT} />
      <Ink d={rectInk(x - 10, y - 10, w + 20, h + 20, {seed: 's5sh/pegI', over: [2, 0], edges: 'tlb'})} width={W.mid} />
      {rows.map((ry, r) =>
        cols.map((cx, c) => {
          const p = PACKS[r][c];
          const a = sway(t, 1.6, 2.6 + c * 0.3, r * 1.7 + c) + rings(t, [popAt + 0.02 * (c + r)], 5, 2.6, 3.5);
          return (
            <React.Fragment key={`${r}${c}`}>
              <path d={`M${cx} ${ry - 4}l0 10`} stroke={EMBER.anchor} strokeWidth={3} strokeLinecap="round" />
              <Pack x={cx} y={ry} kind={p.kind} color={p.color} seed={`s5sh/pk${r}${c}`} a={a} />
            </React.Fragment>
          );
        }),
      )}
    </>
  );
};

/** On the BETTER shelf right of the slot: a router (its LEDs blink) and a box stack, both hop with the pop; shelf
 *  labels on the plank front; a talker hanging under it. */
const ShelfExtras: React.FC<{popAt: number}> = ({popAt}) => {
  const t = useTime();
  const dy = jolt(t, popAt);
  const leds = [0, 1, 2, 3].map((j) => (Math.sin(t * (3.1 + j * 1.9) + j * 2.2) > 0.15 ? EMBER.led : EMBER.dcSide));
  const ta = sway(t, 3, 2.4, 0.5) + rings(t, [popAt], 7, 2.2, 3);
  return (
    <>
      <XG m={mat.translate(0, dy)}>
        {/* router */}
        <path d={`M884 ${PLANK - 34}l-8 -40M956 ${PLANK - 34}l8 -40`} stroke={EMBER.anchor} strokeWidth={5} strokeLinecap="round" />
        <Fill d={roundRect(870, PLANK - 34, 100, 34, 8)} color={EMBER.anchor} seed="s5sh/rt" />
        {leds.map((c, j) => (
          <rect key={j} x={886 + j * 18} y={PLANK - 21} width={9} height={7} fill={c} />
        ))}
        <Ink d={roundRect(870, PLANK - 34, 100, 34, 8, {closed: false, seed: 's5sh/rtI'})} width={W.far} />
        {/* box stack */}
        <LaptopBox x={982} y={PLANK - 56} w={98} h={56} color={KRAFT} seed="s5sh/sb1" ink={W.far} />
        <LaptopBox x={994} y={PLANK - 98} w={78} h={42} color={EMBER.card} seed="s5sh/sb2" ink={W.far} />
      </XG>
      {/* labels on the plank front */}
      {[892, 1012].map((lx, i) => (
        <React.Fragment key={i}>
          <rect x={lx} y={PLANK + 4} width={40} height={12} fill={EMBER.card} />
          <path d={`M${lx + 6} ${PLANK + 10}h22`} stroke={EMBER.ink} strokeWidth={1.4} />
        </React.Fragment>
      ))}
      {/* a talker under the plank */}
      <XG m={mat.about(mat.rotate(ta), 1040, PLANK + 20)}>
        <path d={roundRect(1010, PLANK + 22, 64, 38, 5)} fill={EMBER.hl} />
        <path d={textLines(1018, PLANK + 34, 46, {seed: 's5sh/tk', n: 2, gap: 12})} stroke={EMBER.ink} strokeWidth={2.2} strokeLinecap="round" fill="none" />
        <path d={roundRect(1010, PLANK + 22, 64, 38, 5, {closed: false, seed: 's5sh/tkI'})} fill="none" stroke={EMBER.ink} strokeWidth={W.hair} />
      </XG>
    </>
  );
};

const SLIDE_BG = [EMBER.dc, EMBER.ring, EMBER.sky];

/** The lower shelf under the tag's ring: a monitor cycling slides (a stepped slide-in), laptop boxes, talkers; the
 *  bottom row behind the counter (a speaker, boxes). */
const LowerShelf: React.FC<{slides: number[]; popAt: number}> = ({slides, popAt}) => {
  const t = useTime();
  const k = slides.filter((s) => t >= s).length;
  const since = k ? t - slides[k - 1] : 9;
  const slideX = since < 0.16 ? (1 - ease01(since, 0, 0.16)) * 136 : 0;
  const mon = {x: 672, y: LOW - 128, w: 144, h: 96};
  const bg = SLIDE_BG[k % SLIDE_BG.length];
  const prevBg = SLIDE_BG[(k + SLIDE_BG.length - 1) % SLIDE_BG.length];
  const fg = k % 3 === 1 ? EMBER.beam : EMBER.card;
  const ta = (i: number) => sway(t, 2.6, 2.8, i * 1.3) + rings(t, [popAt + 0.05], 3, 2.4, 3);
  return (
    <>
      {/* the bottom row (behind the counter top) */}
      <Fill rect={[650, LOW + 16, 500, 140]} color={WALL_SHADE} offset={false} />
      <Fill d={roundRect(664, 1296, 112, 112, 8)} color={EMBER.dcSide} seed="s5sh/spk" />
      <circle cx={720} cy={1330} r={16} fill={EMBER.dc} stroke={EMBER.ink} strokeWidth={1.6} />
      <circle cx={720} cy={1376} r={24} fill={EMBER.dc} stroke={EMBER.ink} strokeWidth={1.6} />
      <circle cx={720} cy={1376} r={8} fill={EMBER.anchor} />
      <Ink d={roundRect(664, 1296, 112, 112, 8, {closed: false, seed: 's5sh/spkI'})} width={W.far} />
      <LaptopBox x={790} y={1318} w={140} h={90} color={KRAFT} seed="s5sh/bb1" ink={W.far} />
      <LaptopBox x={944} y={1350} w={70} h={56} color={EMBER.card} seed="s5sh/bb2" ink={W.far} />
      <LaptopBox x={950} y={1306} w={60} h={44} color={EMBER.skyLow} seed="s5sh/bb3" ink={W.far} />
      <LaptopBox x={1022} y={1330} w={90} h={76} color={EMBER.reveal} seed="s5sh/bb4" ink={W.far} />
      {/* the lower plank and its brackets */}
      <Fill rect={[650, LOW, 500, 16]} color={EMBER.shelf} seed="s5sh/low" />
      <Fill rect={[650, LOW + 11, 500, 5]} color={EMBER.desk} offset={false} />
      {[712, 1044].map((bx) => (
        <path key={bx} d={`M${bx - 8} ${LOW + 16}h16v30l-16 -22Z`} fill={EMBER.beam} stroke={EMBER.ink} strokeWidth={1.8} />
      ))}
      <Ink d={rectInk(650, LOW, 500, 16, {seed: 's5sh/lowI', over: [2, 0], edges: 'tlb'})} width={W.mid} />
      {/* the monitor */}
      <Fill rect={[mon.x - 7, mon.y - 7, mon.w + 14, mon.h + 14]} color={EMBER.anchor} seed="s5sh/mon" />
      <svg x={mon.x} y={mon.y} width={mon.w} height={mon.h} overflow="hidden">
        <rect x={0} y={0} width={mon.w} height={mon.h} fill={prevBg} />
        <g transform={`translate(${slideX.toFixed(1)} 0)`}>
          <rect x={0} y={0} width={mon.w} height={mon.h} fill={bg} />
          {k % 3 === 1 ? (
            <path d={textLines(18, 26, 104, {seed: `s5sh/ad${k}`, n: 3, gap: 20})} stroke={fg} strokeWidth={6} strokeLinecap="round" fill="none" />
          ) : (
            <>
              <rect x={40} y={18} width={64} height={40} rx={3} fill="none" stroke={fg} strokeWidth={4} />
              <path d={`M30 66H114`} stroke={fg} strokeWidth={6} strokeLinecap="round" />
              <path d={`M48 80H96`} stroke={k % 3 === 2 ? EMBER.houseLit : EMBER.skyLow} strokeWidth={5} strokeLinecap="round" />
            </>
          )}
        </g>
      </svg>
      <Fill rect={[mon.x + mon.w / 2 - 9, mon.y + mon.h + 7, 18, LOW - mon.y - mon.h - 13]} color={EMBER.anchor} offset={false} />
      <Fill rect={[mon.x + mon.w / 2 - 34, LOW - 8, 68, 8]} color={EMBER.anchor} offset={false} />
      <Ink d={rectInk(mon.x - 7, mon.y - 7, mon.w + 14, mon.h + 14, {seed: 's5sh/monI', over: [0, 1]})} width={W.far} />
      <path d={glint(mon.x + mon.w - 30, mon.y + 14, 22, {seed: 's5sh/mong'})} fill="none" stroke={EMBER.white} strokeWidth={2} strokeLinecap="round" />
      {/* boxes on the lower plank */}
      <LaptopBox x={832} y={LOW - 62} w={122} h={62} color={EMBER.card} seed="s5sh/lb1" ink={W.far} />
      <LaptopBox x={842} y={LOW - 108} w={100} h={46} color={KRAFT} seed="s5sh/lb2" ink={W.far} />
      <LaptopBox x={966} y={LOW - 116} w={94} h={116} color={EMBER.reveal} seed="s5sh/lb3" ink={W.far} />
      <rect x={1004} y={LOW - 104} width={42} height={22} fill={EMBER.hl} transform={`rotate(-8 1025 ${LOW - 93})`} />
      {/* talkers under the lower plank */}
      {[760, 900].map((tx, i) => (
        <XG key={tx} m={mat.about(mat.rotate(ta(i)), tx + 28, LOW + 16)}>
          <path d={roundRect(tx, LOW + 18, 56, 32, 4)} fill={EMBER.card} />
          <path d={`M${tx + 8} ${LOW + 30}h36M${tx + 8} ${LOW + 40}h24`} stroke={EMBER.ink} strokeWidth={1.6} />
          <path d={roundRect(tx, LOW + 18, 56, 32, 4, {closed: false, seed: `s5sh/ltk${i}`})} fill="none" stroke={EMBER.ink} strokeWidth={W.hair} />
        </XG>
      ))}
    </>
  );
};

/** The hook bar under the BETTER shelf's right bracket (right of the tag's ring): two packs. */
const HookBar: React.FC<{popAt: number}> = ({popAt}) => {
  const t = useTime();
  return (
    <>
      <path d={`M972 1004H1100`} stroke={EMBER.anchor} strokeWidth={5} strokeLinecap="round" />
      {[1002, 1062].map((hx, i) => (
        <Pack key={hx} x={hx} y={1004} kind={i ? 'cable' : 'buds'} color={i ? EMBER.skyLow : EMBER.card} seed={`s5sh/hb${i}`} a={sway(t, 1.8, 2.9, i * 2) + rings(t, [popAt + 0.04], 4, 2.6, 3.5)} />
      ))}
    </>
  );
};

/** The near wall is a slatwall display panel one step darker than the back wall (from just under the caption band,
 *  starting beside your head's ring): its grooves make the empty slot read as an empty display space, and the
 *  display light lands on it (the light is drawn over the panel). */
export const PANEL = {x: 490, y: 616};
const GROOVE = '#DDAF8F';
export const S5Panel: React.FC = () => {
  const grooves = useMemo(() => {
    let d = '';
    for (let y = PANEL.y + 30; y < 1400; y += 30) d += `M${PANEL.x + 4} ${y}H1140`;
    return d;
  }, []);
  return (
    <>
      <Fill rect={[PANEL.x, PANEL.y, 700, 800]} color={EMBER.reveal} offset={false} />
      <path d={grooves} stroke={GROOVE} strokeWidth={2.6} />
      <Ink d={line(PANEL.x, PANEL.y, 1140, PANEL.y, {seed: 's5sh/panT', over: [0, 0]}) + line(PANEL.x, PANEL.y, PANEL.x, 1400, {seed: 's5sh/panL', over: [0, 0]})} width={W.far} />
    </>
  );
};

/** The near wall's dressing: the pegboard, the shelf extras, the hook bar, the lower shelf. Drawn after the display
 *  light (the light sits behind the pegboard) and before the BETTER laptop (its tag hangs over the lower things). */
export const S5Wall: React.FC<{beats: ShopBeats}> = ({beats}) => (
  <>
    <Pegboard popAt={beats.popAt} />
    <LowerShelf slides={beats.slides} popAt={beats.popAt} />
    <HookBar popAt={beats.popAt} />
  </>
);

/** On the plank (drawn after S5.tsx's shelf). */
export const S5ShelfExtras: React.FC<{beats: ShopBeats}> = ({beats}) => <ShelfExtras popAt={beats.popAt} />;

export {KRAFT, WALL_SHADE};
