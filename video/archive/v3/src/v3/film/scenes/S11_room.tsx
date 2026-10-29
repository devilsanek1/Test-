// S11_room (S11 lane, G5b): the drivers' room by the chip factory's loading dock, where the laptop van's driver waits
// (docs/v3/density_plan_g5b.md S11, set DOCK_room). The bar chart is no longer a card taped to an empty wall: it is
// pinned to the room's framed cork price board, straight-on and level. Around it, the room the drivers wait in:
// a tiled ceiling (a smoke alarm, a vent), the cable tray with a strip light (one stepped flicker), a hanging DRIVERS
// sign, an extractor fan and the heating pipe, all above the caption band; on the left a tall dock window cut by the
// edge (the factory hall across the yard with lit windows and a floodlight, the laptop van waiting with its hazards on,
// a forklift crossing, a worker walking, the snow falling) over a sill with a thermos and a radiator; on the right a
// coffee corner cut by the edge (a wall clock, a no-smoking plate, a shelf of mugs, the machine with its blinking button
// and a steaming cup, a cabinet); the bench along the wall, the skirting and the lino floor.
//
// LOCKED (storyboard_g3 / camera_plan_g3 S11): straight-on and level; the card and its bars as built, x 0.94 about the
// card's bottom edge (as S4's card, so the board's top rail sits under the caption band, y >= 600); the 1.5 % breathe.
// The caption band (y 290-600) is flat plaster across x 95-945 (the window and the clock live in the gutters).
// Everything that moves is a pure function of scene time.
import React, {useMemo} from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, circle, glint, line, rect as rectInk, roundRect, textLines} from '../../../lib/sketch';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {
  Bench,
  CardBoard,
  ChartCard,
  CoffeeMachine,
  EMBER,
  Floodlight,
  Forklift,
  Frost,
  LampPost3,
  NoSmoking,
  PinnedThing,
  Radiator,
  SnowLayers,
  SnowSill,
  Steam,
  StripLight,
  Txt,
  Van,
  W,
  Walker,
  WallClock,
  WallMarks,
  crossing,
  rings,
  stepped,
  sway,
  windowLit,
} from '../kit';
import type {CornerItem, Pt} from '../kit';

// ---------------------------------------------------------------- geometry (canvas px at camera rest)

/** The card's scale against G5 (about its bottom edge, x centre 540): S4's factor, so the inserts stay one family. */
export const CARD_K = 0.94;
const kx = (x: number) => 540 + (x - 540) * CARD_K;
const ky = (y: number) => 1350 + (y - 1350) * CARD_K;
/** The chart card (G5: 140, 615, 800 x 735) and the bars' axes (G5: 200, 1240, 680 x 420), both x 0.94. */
export const CARD = {x: kx(140), y: ky(615), w: 800 * CARD_K, h: 735 * CARD_K};
export const BARS = {x: kx(200), y: ky(1240), w: 680 * CARD_K, h: 420 * CARD_K};
const MARGIN = 26;
const FRAME = 16;
/** The price board's outer frame. */
export const BOARD = {x0: CARD.x - MARGIN - FRAME, y0: CARD.y - MARGIN - FRAME, x1: CARD.x + CARD.w + MARGIN + FRAME, y1: CARD.y + CARD.h + MARGIN + FRAME};
/** The tall bar's centre (the breathe's fixed point leans toward it). */
export const TALL_BAR_X = BARS.x + BARS.w * 0.75;

const CEIL = 118; // the wall meets the ceiling
const TRAY_Y = 146;
const PIPE_Y = 264;
/** The dock window's glass (cut by the left edge) and its frame width. */
const WIN = {x: -12, y: 208, w: 106, h: 1108};
const WFR = 12;
/** The wall's foot (skirting top at SKIRT, floor from FLOOR). */
const SKIRT = 1420;
export const FLOOR = 1440;
/** The coffee corner (cut by the right edge). */
const CORNER_X = 958;
const VP: Pt = [540, 960];

// ---------------------------------------------------------------- the beats a panel passes

export type RoomLife = {
  /** The strip light's stepped flickers. */
  flickerAt?: number[];
  /** The board's papers lift (a draught, a reaction). */
  flutterAt?: number[];
  /** Forklift crossings in the dock window: [t0, t1, dir] (dir 1 = left to right). */
  forklift?: [number, number, 1 | -1][];
  /** The yard worker's walk across the window: [t0, t1]. */
  worker?: [number, number];
  /** The coffee machine's ready light comes on, with a puff of steam from the spout. */
  brewAt?: number;
};

// ---------------------------------------------------------------- the ceiling and the high wall (above the band)

/** The tiled ceiling seen from below (joints run toward the vanishing point), a smoke alarm with a blinking LED, an air
 *  vent tile, the coving. */
const Ceiling: React.FC = () => {
  const t = useTime();
  const joints = useMemo(() => {
    let d = '';
    const k = (VP[1] + 40) / (VP[1] - CEIL);
    for (let x = -260; x <= 1340; x += 200) d += `M${x} ${CEIL}L${(VP[0] + (x - VP[0]) * k).toFixed(1)} -40`;
    d += `M-60 34H1140`;
    return d;
  }, []);
  // the vent tile between the joints that meet the wall at x 740 and 940, up to the cross joint (y 34)
  const vx = (x: number, y: number) => VP[0] + (x - VP[0]) * ((VP[1] - y) / (VP[1] - CEIL));
  const vent: Pt[] = [
    [748, CEIL - 8],
    [932, CEIL - 8],
    [vx(932, 42), 42],
    [vx(748, 42), 42],
  ];
  let slats = '';
  for (let i = 1; i < 6; i++) {
    const y = CEIL - 8 - ((CEIL - 50) * i) / 6;
    slats += `M${vx(752, y).toFixed(1)} ${y.toFixed(1)}L${vx(928, y).toFixed(1)} ${y.toFixed(1)}`;
  }
  const ledOn = Math.floor(t / 1.3) % 2 === 0 && t % 1.3 < 0.18;
  return (
    <>
      <Fill rect={[-60, -60, 1200, CEIL + 60]} color={EMBER.reveal} offset={false} />
      <path d={joints} stroke={EMBER.card} strokeWidth={6} fill="none" />
      <Ink d={joints} width={W.hair} color={EMBER.beam} />
      <Fill d={`M${vent.map((p) => p.join(' ')).join('L')}Z`} color={EMBER.frost} seed="s11/vent" />
      <path d={slats} stroke={EMBER.dcSide} strokeWidth={3} fill="none" />
      <Ink d={`M${vent.map((p) => p.join(' ')).join('L')}Z`} width={W.far} />
      {/* the smoke alarm (seen from below: an ellipse) with a blinking LED */}
      <ellipse cx={330} cy={70} rx={34} ry={13} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={W.far} />
      <ellipse cx={330} cy={66} rx={18} ry={6} fill={EMBER.frost} />
      <circle cx={348} cy={74} r={4} fill={ledOn ? EMBER.houseLit : EMBER.shelf} />
      {/* a sprinkler head */}
      <path d="M590 92l-12 8h24z" fill={EMBER.frost} stroke={EMBER.ink} strokeWidth={W.hair} />
      <path d="M590 82v10" stroke={EMBER.ink} strokeWidth={W.far} />
      {/* the coving */}
      <Fill rect={[-60, CEIL, 1200, 11]} color={EMBER.card} offset={false} />
      <Ink d={line(-50, CEIL, 1130, CEIL, {seed: 's11/ceilE', over: 'structural'})} width={W.mid} />
      <Ink d={line(-50, CEIL + 11, 1130, CEIL + 11, {seed: 's11/coveE', over: [0, 0]})} width={W.hair} />
    </>
  );
};

/** The extractor fan in the right gutter: a square plate, the grille, four blades spinning on drawn steps. */
const ExtractorFan: React.FC = () => {
  const t = useTime();
  const cx = 1014;
  const cy = 216;
  const r = 34;
  const ang = stepped(t, 12) * 420;
  let blades = '';
  for (let i = 0; i < 4; i++) {
    const a = ((ang + i * 90) * Math.PI) / 180;
    const a2 = a + 0.62;
    blades += `M${cx} ${cy}L${(cx + Math.cos(a) * r * 0.92).toFixed(1)} ${(cy + Math.sin(a) * r * 0.92).toFixed(1)}Q${(cx + Math.cos(a + 0.3) * r * 1.02).toFixed(1)} ${(cy + Math.sin(a + 0.3) * r * 1.02).toFixed(1)} ${(cx + Math.cos(a2) * r * 0.8).toFixed(1)} ${(cy + Math.sin(a2) * r * 0.8).toFixed(1)}Z`;
  }
  return (
    <>
      <Fill d={roundRect(cx - 50, cy - 50, 100, 100, 10)} color={EMBER.card} seed="s11/fanP" />
      <circle cx={cx} cy={cy} r={r + 4} fill={EMBER.dcSide} />
      <path d={blades} fill={EMBER.frost} />
      <circle cx={cx} cy={cy} r={7} fill={EMBER.anchor} />
      <path d={circle(cx, cy, r * 0.55, {seed: 's11/fg1'}) + circle(cx, cy, r + 4, {seed: 's11/fg2'})} fill="none" stroke={EMBER.ink} strokeWidth={W.hair} />
      <Ink d={roundRect(cx - 50, cy - 50, 100, 100, 10, {closed: false, seed: 's11/fanI'})} width={W.far} />
    </>
  );
};

/** The hanging DRIVERS sign on two chains from the tray: a slow sway and a jolt on the flicker. */
const DriversSign: React.FC<{joltAt?: number[]}> = ({joltAt}) => {
  const t = useTime();
  const x0 = 640;
  const w = 214;
  const y0 = 196;
  const h = 50;
  const a = sway(t, 0.9, 3.4, 0.6) + rings(t, joltAt, 1.6, 1.6, 2.4);
  return (
    <XG m={mat.about(mat.rotate(a), x0 + w / 2, TRAY_Y + 22)}>
      <path d={`M${x0 + 30} ${TRAY_Y + 22}L${x0 + 30} ${y0}M${x0 + w - 30} ${TRAY_Y + 22}L${x0 + w - 30} ${y0}`} stroke={EMBER.ink} strokeWidth={W.hair} strokeDasharray="5 3" />
      <Fill d={roundRect(x0, y0, w, h, 6)} color={EMBER.dc} seed="s11/sign" />
      <rect x={x0 + 6} y={y0 + 6} width={w - 12} height={h - 12} rx={4} fill="none" stroke={EMBER.skyLow} strokeWidth={2.4} />
      <Txt x={x0 + w / 2} y={y0 + h * 0.73} size={32} fill={EMBER.core} fit={w - 40}>
        DRIVERS
      </Txt>
      <Ink d={roundRect(x0, y0, w, h, 6, {closed: false, seed: 's11/signI'})} width={W.far} />
    </XG>
  );
};

/** The cable tray in the cool dark metal (a strong line across the top, like S4's fascia): cable bundles showing over
 *  its lip and a few loops sagging out of it in the room's colours. */
const Tray: React.FC = () => {
  const x0 = -30;
  const x1 = 1110;
  const y = TRAY_Y;
  let rungs = '';
  for (let x = x0 + 40; x < x1; x += 46) rungs += `M${x} ${y + 4}V${y + 18}`;
  return (
    <>
      <path d={`M${x0} ${y + 2}Q300 ${y - 8} 560 ${y + 1}T${x1} ${y}`} fill="none" stroke={EMBER.dcSide} strokeWidth={9} />
      <path d={`M${x0} ${y + 4}Q420 ${y - 5} 780 ${y + 2}T${x1} ${y + 3}`} fill="none" stroke={EMBER.pot} strokeWidth={5} />
      <Fill rect={[x0, y, x1 - x0, 22]} color={EMBER.dc} offset={false} />
      <path d={rungs} stroke={EMBER.skyLow} strokeWidth={2.4} />
      <Ink d={rectInk(x0, y, x1 - x0, 22, {seed: 's11/trayI', over: [6, 12], edges: 'tb'})} width={W.far} />
      <path d={`M880 ${y + 22}q34 40 70 6M150 ${y + 22}q26 26 52 0M300 ${y + 22}q50 54 104 4`} fill="none" stroke={EMBER.pot} strokeWidth={5} />
      <path d={`M470 ${y + 22}q30 30 62 2M760 ${y + 22}q22 22 44 0`} fill="none" stroke={EMBER.hl} strokeWidth={5} />
      <path d={`M90 ${y + 22}q40 44 82 6`} fill="none" stroke={EMBER.dcSide} strokeWidth={6} />
    </>
  );
};

/** The tray, its hangers and an extra cable; the strip light under it (its flat halo steps down the wall to the band's
 *  top, never into it); the sign; the fan; the heating pipe with brackets and a valve. */
const HighWall: React.FC<{life: RoomLife}> = ({life}) => {
  let hangers = '';
  for (const x of [70, 360, 620, 900]) hangers += line(x, CEIL + 11, x, TRAY_Y, {over: [0, 0], seed: `s11/hg${x}`});
  let brackets = '';
  for (const x of [250, 560, 860]) brackets += rectInk(x - 7, PIPE_Y - 4, 14, 22, {seed: `s11/pb${x}`, over: [0, 0]});
  return (
    <>
      <Ink d={hangers} width={W.hair} />
      <Tray />
      <StripLight x={150} y={180} w={400} flickerAt={life.flickerAt} seed="s11/strip" />
      <DriversSign joltAt={life.flickerAt} />
      <ExtractorFan />
      {/* the heating pipe along the wall top, a valve wheel by the window */}
      <Fill rect={[WIN.x + WIN.w + WFR - 4, PIPE_Y, 1200, 14]} color={EMBER.pot} offset={false} />
      <Fill rect={[WIN.x + WIN.w + WFR - 4, PIPE_Y + 9, 1200, 5]} color={EMBER.beam} offset={false} />
      <Fill rect={[WIN.x + WIN.w + WFR - 4, PIPE_Y + 2, 1200, 3]} color={EMBER.books[0]} offset={false} />
      <Ink d={line(WIN.x + WIN.w + WFR, PIPE_Y, 1120, PIPE_Y, {seed: 's11/pipeT', over: [0, 0]}) + line(WIN.x + WIN.w + WFR, PIPE_Y + 14, 1120, PIPE_Y + 14, {seed: 's11/pipeB', over: [0, 0]})} width={W.far} />
      <Ink d={brackets} width={W.hair} />
      <circle cx={146} cy={PIPE_Y + 7} r={13} fill="none" stroke={EMBER.beam} strokeWidth={4} />
      <path d={`M133 ${PIPE_Y + 7}h26M146 ${PIPE_Y - 6}v26`} stroke={EMBER.beam} strokeWidth={2.4} />
    </>
  );
};

// ---------------------------------------------------------------- the dock window (left)

/** The view out: the factory hall across the yard (warm brick, a sawtooth roof with snow, lit windows switching, a
 *  floodlight), a yard lamp, the laptop van parked with its hazards blinking, a forklift crossing, a worker walking,
 *  tyre tracks in the snow, the snow falling. */
const DockView: React.FC<{life: RoomLife}> = ({life}) => {
  const t = useTime();
  const {x, y, w, h} = WIN;
  const clip = 's11dockglass';
  const ground = 1192;
  const hallTop = 700;
  const lit = (i: number) => windowLit(t, 's11/hall', i, 6, {gap: [0.7, 1.4], litFrac: 0.7});
  const hazard = Math.floor(t * 1.6) % 2 === 0;
  const fl = (life.forklift ?? []).map(([t0, t1, dir], i) => {
    const c = crossing(t, t0, t1, dir === 1 ? [x - 140, 0] : [x + w + 140, 0], dir === 1 ? [x + w + 140, 0] : [x - 140, 0]);
    return c ? (
      <XG key={i} m={mat.translate(c.x, 0)}>
        <Forklift x={0} y={ground + 96} w={112} dir={dir} seed={`s11/fork${i}`} />
      </XG>
    ) : null;
  });
  const wk = life.worker ?? [0, 4.2];
  return (
    <>
      <Fill rect={[x - WFR, y - WFR, w + WFR * 2, h + WFR * 2]} color={EMBER.trim} seed="s11/winF" />
      <defs>
        <clipPath id={clip}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x={x} y={y} width={w} height={h} fill={EMBER.sky} />
        <rect x={x} y={860} width={w} height={ground - 860} fill={EMBER.skyLow} />
        {/* the hall: a sawtooth roof with snow, warm brick, lit windows */}
        <path d={`M${x - 10} ${hallTop}L${x + 40} ${hallTop - 46}L${x + 40} ${hallTop}L${x + 92} ${hallTop - 46}L${x + 92} ${hallTop}L${x + 130} ${hallTop - 30}V${ground}H${x - 10}Z`} fill={EMBER.brick} />
        <path d={`M${x - 10} ${hallTop}L${x + 40} ${hallTop - 46}L${x + 40} ${hallTop - 38}L${x - 2} ${hallTop}ZM${x + 40} ${hallTop}L${x + 92} ${hallTop - 46}L${x + 92} ${hallTop - 38}L${x + 50} ${hallTop}Z`} fill={EMBER.snow} />
        <rect x={x - 10} y={hallTop} width={w + 20} height={12} fill={EMBER.brickShade} />
        {[0, 1, 2].map((r) =>
          [0, 1].map((c) => {
            const i = r * 2 + c;
            return <rect key={i} x={x + 10 + c * 50} y={hallTop + 50 + r * 92} width={30} height={46} fill={lit(i) ? EMBER.houseLit : EMBER.brickShade} />;
          }),
        )}
        <Floodlight x={x + 70} y={hallTop + 24} s={0.8} dir={-1} seed="s11/flood" />
        {/* the yard */}
        <rect x={x} y={ground} width={w} height={h} fill={EMBER.snow} />
        <rect x={x} y={ground + 58} width={w} height={44} fill={EMBER.road} />
        <path d={`M${x} ${ground + 70}H${x + w}M${x} ${ground + 92}H${x + w}`} stroke={EMBER.frost} strokeWidth={3} />
        <LampPost3 x={x + 86} y={ground + 6} h={230} arm="left" seed="s11/ylamp" />
        <Walker from={[x - 30, ground + 34]} to={[x + w + 30, ground + 34]} h={70} window={wk} wear={['hivis', 'hardhat']} seed="s11/yw" />
        {/* the laptop van waiting (hazards on) */}
        <Van x={x + 36} y={ground + 52} w={236} lights seed="s11/van" />
        <rect x={x + 36 - 118 + 2} y={ground + 52 - 236 * 0.5 + 70} width={8} height={16} fill={hazard ? EMBER.houseLit : EMBER.beam} />
        {fl}
        <SnowLayers x={x} y={y} w={w} h={h} density={2.2} seed="s11/winsnow" />
      </g>
      {/* transoms, snow ridges outside each pane, frost, glints */}
      {[600, 958].map((ty) => (
        <React.Fragment key={ty}>
          <Fill rect={[x - WFR, ty - 6, w + WFR * 2, 12]} color={EMBER.trim} offset={false} />
          <SnowSill x0={x} x1={x + w} y={ty - 7} h={9} seed={`s11/ws${ty}`} />
        </React.Fragment>
      ))}
      <SnowSill x0={x} x1={x + w} y={y + h - 9} h={10} seed="s11/wsB" />
      <Frost x={x} y={958} w={w} h={y + h - 958} corners={['bl', 'br']} size={46} seed="s11/frostB" />
      <Frost x={x} y={600} w={w} h={358} corners={['br']} size={40} seed="s11/frostM" />
      <path d={glint(x + 64, 250, 44, {seed: 's11/wg1'}) + glint(x + 40, 650, 40, {seed: 's11/wg2'})} fill="none" stroke={EMBER.white} strokeWidth={W.far} strokeLinecap="round" />
      <Ink
        d={rectInk(x - WFR, y - WFR, w + WFR * 2, h + WFR * 2, {seed: 's11/winFI', over: [3, 8]}) + rectInk(x, y, w, h, {seed: 's11/winGI', over: [0, 2]}) + line(x - WFR, 594, x + w + WFR, 594, {seed: 's11/tr1', over: [0, 0]}) + line(x - WFR, 952, x + w + WFR, 952, {seed: 's11/tr2', over: [0, 0]})}
        width={W.mid}
      />
      {/* the inside sill: a thermos and a pair of gloves */}
      <Fill rect={[x - 30, y + h + WFR, w + 60, 18]} color={EMBER.reveal} offset={false} />
      <Ink d={line(x - 30, y + h + WFR, x + w + 30, y + h + WFR, {seed: 's11/sillI', over: [0, 4]})} width={W.far} />
      <Fill d={roundRect(x + 30, y + h + WFR - 74, 30, 74, 6)} color={EMBER.dc} seed="s11/thermos" />
      <Fill rect={[x + 27, y + h + WFR - 86, 36, 16]} color={EMBER.dcSide} offset={false} />
      <Fill rect={[x + 30, y + h + WFR - 44, 30, 8]} color={EMBER.frost} offset={false} />
      <Ink d={roundRect(x + 30, y + h + WFR - 74, 30, 74, 6, {closed: false, seed: 's11/thI'})} width={W.far} />
      <path d={blob(x + 82, y + h + WFR - 10, 18, 10, {seed: 's11/glove1'}) + blob(x + 6, y + h + WFR - 9, 16, 9, {seed: 's11/glove2'})} fill={EMBER.pot} stroke={EMBER.ink} strokeWidth={W.hair} />
      <Steam x={x + 45} y={y + h + WFR - 88} seed="s11/thsteam" rise={40} r1={6} />
    </>
  );
};

// ---------------------------------------------------------------- the coffee corner (right)

const MUGS = [EMBER.hl, EMBER.dc, EMBER.card];

/** A wall clock and a no-smoking plate in the right gutter (beside the band, never in it); a shelf of mugs and a jar;
 *  the coffee machine (its button blinks, the cup steams) with paper cups on top; a cabinet under it. */
const CoffeeCorner: React.FC<{brewAt?: number}> = ({brewAt}) => {
  const t = useTime();
  const ready = brewAt !== undefined && t >= brewAt;
  const shelfY = 742;
  const base = 1194;
  return (
    <>
      <WallClock cx={1014} cy={392} r={40} startMin={13} seed="s11/clock" />
      <NoSmoking x={1014} y={540} r={22} seed="s11/nosmoke" />
      {/* the shelf of mugs */}
      {MUGS.map((c, i) => {
        const mx = 976 + i * 40;
        return (
          <React.Fragment key={i}>
            <Fill d={roundRect(mx, shelfY - 40, 30, 40, 5)} color={c} seed={`s11/mug${i}`} />
            {i === 2 ? <Fill rect={[mx, shelfY - 26, 30, 7]} color={EMBER.beam} offset={false} /> : null}
            <path d={`M${mx + 30} ${shelfY - 32}q12 2 10 12q-2 8 -10 8`} fill="none" stroke={EMBER.ink} strokeWidth={W.hair} />
            <Ink d={roundRect(mx, shelfY - 40, 30, 40, 5, {closed: false, seed: `s11/mugI${i}`})} width={W.far} />
          </React.Fragment>
        );
      })}
      <Fill rect={[CORNER_X, shelfY, 160, 12]} color={EMBER.beam} offset={false} />
      <path d={`M${CORNER_X + 20} ${shelfY + 12}l14 26M${CORNER_X + 100} ${shelfY + 12}l14 26`} stroke={EMBER.beam} strokeWidth={5} />
      <Ink d={rectInk(CORNER_X, shelfY, 160, 12, {seed: 's11/shelfI', over: [3, 0]})} width={W.far} />
      {/* paper cups on the machine */}
      <Fill d={`M982 ${base - 360}h34l-4 -54h-26z`} color={EMBER.card} seed="s11/cups" />
      <path d={`M983 ${base - 380}h32M984 ${base - 396}h30`} stroke={EMBER.reveal} strokeWidth={3} />
      <Ink d={`M982 ${base - 360}h34l-4 -54h-26z`} width={W.hair} />
      {/* a mid-tone casing: the darkest upright at bar height stays the 5x bar */}
      <CoffeeMachine x={966} y={base} w={190} h={360} body={EMBER.beam} seed="s11/coffee" />
      {/* the ready light (steps on at brewAt) and a puff from the spout */}
      <circle cx={1012} cy={base - 248} r={9} fill={ready ? EMBER.houseLit : EMBER.shelf} stroke={EMBER.ink} strokeWidth={W.hair} />
      {ready
        ? [0, 1, 2].map((i) => {
            const u = (t - brewAt! - i * 0.08) / 0.7;
            if (u < 0 || u > 1) return null;
            const r = (8 + i * 3) * (1 - u * 0.6) + u * 10;
            return <circle key={i} cx={1046 - i * 10 + u * (8 - i * 10)} cy={base - 92 - u * (90 + i * 20)} r={r} fill={EMBER.snow} />;
          })
        : null}
      {/* the cabinet */}
      <Fill rect={[CORNER_X - 4, base, 170, SKIRT - base + 20]} color={EMBER.shelf} seed="s11/cab" />
      <Fill rect={[CORNER_X - 10, base - 6, 180, 14]} color={EMBER.beam} offset={false} />
      <Ink d={rectInk(CORNER_X - 4, base + 8, 170, SKIRT - base + 12, {seed: 's11/cabI', over: [0, 0]}) + line(CORNER_X + 66, base + 30, CORNER_X + 66, SKIRT - 10, {seed: 's11/cabD', over: [0, 0]})} width={W.far} />
      <path d={`M${CORNER_X + 54} ${base + 90}v40M${CORNER_X + 78} ${base + 90}v40`} stroke={EMBER.anchor} strokeWidth={5} strokeLinecap="round" />
    </>
  );
};

// ---------------------------------------------------------------- the board, its papers, the foot of the wall

const CORNERS: CornerItem[] = [
  {corner: 'tl', kind: 'clipboard', w: 116, h: 156, out: 0.3, rot: -6},
  {corner: 'tr', kind: 'slip', w: 104, h: 150, out: 0.32, rot: 7},
  {corner: 'bl', kind: 'note', w: 84, h: 84, out: 0.62, rot: -9},
  {corner: 'br', kind: 'slip', w: 98, h: 128, out: 0.4, rot: 6},
  {corner: 'br', kind: 'card', w: 112, h: 64, out: 0.62, rot: -5},
];

/** Papers peeking out along the card's sides (drawn before the card): a delivery ticket, a shift rota, a note. */
const SidePapers: React.FC<{flutterAt?: number[]}> = ({flutterAt}) => {
  const t = useTime();
  const f = (i: number) => rings(t, flutterAt?.map((a) => a + i * 0.05), 4, 3, 3.5) + sway(t, 0.5, 3.2, i);
  return (
    <>
      <XG m={mat.about(mat.rotate(-5 + f(0)), CARD.x - 10, 930)}>
        <PinnedThing kind="ticket" x={CARD.x - 56} y={916} w={98} h={66} seed="s11/sp1" color={EMBER.ring} />
      </XG>
      <XG m={mat.about(mat.rotate(4 + f(1)), CARD.x + CARD.w + 12, 1030)}>
        <PinnedThing kind="slip" x={CARD.x + CARD.w - 46} y={1016} w={92} h={150} seed="s11/sp2" color={EMBER.card} />
      </XG>
      <XG m={mat.about(mat.rotate(-3 + f(2)), CARD.x + CARD.w + 8, 790)}>
        <PinnedThing kind="note" x={CARD.x + CARD.w - 36} y={772} w={70} h={70} seed="s11/sp3" color={EMBER.hl} />
      </XG>
    </>
  );
};

/** The pins that hold the card (over it, at its corners: outside the plot). */
export const CardPins: React.FC = () => (
  <>
    {(
      [
        [CARD.x + 18, CARD.y + 16],
        [CARD.x + CARD.w - 18, CARD.y + 16],
        [CARD.x + 18, CARD.y + CARD.h - 16],
        [CARD.x + CARD.w - 18, CARD.y + CARD.h - 16],
      ] as Pt[]
    ).map(([px, py], i) => (
      <React.Fragment key={i}>
        <circle cx={px + 1.5} cy={py + 2} r={8} fill={EMBER.reveal} />
        <circle cx={px} cy={py} r={7.5} fill={i % 2 ? EMBER.pot : EMBER.dc} stroke={EMBER.ink} strokeWidth={1.6} />
        <circle cx={px - 2.4} cy={py - 2.4} r={2} fill={EMBER.white} />
      </React.Fragment>
    ))}
  </>
);

/** A pen on a string from the board's bottom rail (it swings: the panel's small loop). */
const PenOnString: React.FC<{jolt?: number[]}> = ({jolt}) => {
  const t = useTime();
  const px = BOARD.x0 + 64;
  const py = BOARD.y1;
  const a = sway(t, 5, 2.2, 0.4) + rings(t, jolt, 9, 1.4, 2);
  return (
    <XG m={mat.about(mat.rotate(a), px, py)}>
      <path d={`M${px} ${py}q6 26 0 52`} fill="none" stroke={EMBER.ink} strokeWidth={W.hair} />
      <Fill d={roundRect(px - 5, py + 52, 10, 56, 4)} color={EMBER.dc} offset={false} />
      <path d={`M${px - 5} ${py + 100}l5 14l5 -14z`} fill={EMBER.card} stroke={EMBER.ink} strokeWidth={W.hair} />
      <Ink d={roundRect(px - 5, py + 52, 10, 56, 4, {closed: false, seed: 's11/penI'})} width={W.far} />
    </XG>
  );
};

/** The board and everything pinned round the card (the card itself is the panel's child, drawn over the papers). */
const PriceBoard: React.FC<{life: RoomLife; children?: React.ReactNode}> = ({life, children}) => (
  <>
    <CardBoard card={CARD} margin={MARGIN} kind="cork" corners={CORNERS} flutterAt={life.flutterAt} seed="s11/board" />
    <SidePapers flutterAt={life.flutterAt} />
    <ChartCard x={CARD.x} y={CARD.y} w={CARD.w} h={CARD.h} seed="s11/card">
      {children}
    </ChartCard>
    <CardPins />
    <PenOnString jolt={life.flutterAt} />
  </>
);

/** Plaster marks, the skirting, the lino floor (joints toward the vanishing point), the radiator under the window with
 *  a sock drying on it, the bench along the wall with a hard hat, a lunch box and a folded paper on it. */
const WallFoot: React.FC = () => {
  const floorJoints = useMemo(() => {
    let d = '';
    const k = (2000 - VP[1]) / (FLOOR - VP[1]);
    for (let x = -300; x <= 1400; x += 150) d += `M${x} ${FLOOR}L${(VP[0] + (x - VP[0]) * k).toFixed(1)} 2000`;
    for (const y of [1500, 1600, 1760]) d += `M-60 ${y}H1140`;
    return d;
  }, []);
  return (
    <>
      <WallMarks x={BOARD.x0} y={BOARD.y1 + 4} w={BOARD.x1 - BOARD.x0} h={SKIRT - BOARD.y1 - 8} n={6} seed="s11/wm" />
      <Fill rect={[-60, FLOOR, 1200, 600]} color={EMBER.desk} offset={false} />
      <path d={floorJoints} stroke={EMBER.pot} strokeWidth={2.4} fill="none" />
      <Fill rect={[-60, SKIRT, 1200, FLOOR - SKIRT]} color={EMBER.beam} offset={false} />
      <Ink d={line(-50, SKIRT, 1130, SKIRT, {seed: 's11/skirtT', over: [0, 0]}) + line(-50, FLOOR, 1130, FLOOR, {seed: 's11/skirtB', over: 'structural'})} width={W.mid} />
      <Radiator x={-40} y={WIN.y + WIN.h + WFR + 26} w={140} h={SKIRT - (WIN.y + WIN.h + WFR + 26) - 6} seed="s11/rad" />
      {/* the bench along the wall, things on its seat */}
      <Bench x={150} y={1506} w={640} seed="s11/bench" />
      <path d={`M352 1416a30 26 0 0 1 60 0z`} fill={EMBER.ring} stroke={EMBER.ink} strokeWidth={W.far} />
      <path d={`M344 1416h76`} stroke={EMBER.ink} strokeWidth={W.far} strokeLinecap="round" />
      <Fill d={roundRect(176, 1384, 70, 32, 6)} color={EMBER.dc} seed="s11/lunch" />
      <path d="M196 1384q15 -16 30 0" fill="none" stroke={EMBER.ink} strokeWidth={W.far} />
      <Ink d={roundRect(176, 1384, 70, 32, 6, {closed: false, seed: 's11/lunchI'})} width={W.far} />
      <Fill d={`M566 1416l8 -20h86l-6 20z`} color={EMBER.card} seed="s11/paper" />
      <path d={textLines(584, 1404, 56, {seed: 's11/paperT', n: 2, gap: 7})} stroke={EMBER.reveal} strokeWidth={2.4} fill="none" />
      <Ink d={`M566 1416l8 -20h86l-6 20z`} width={W.hair} />
    </>
  );
};

// ---------------------------------------------------------------- the set

export type S11RoomProps = {
  life: RoomLife;
  /** The chart (drawn on the card). */
  children?: React.ReactNode;
};

/** S11's room round the chart. Behind: the wall (the World's sky), the ceiling and the high wall, the dock window, the
 *  coffee corner, the foot of the wall; then the price board with the card (children) and its pins. The drivers and
 *  Pip (S11_people.tsx) stand in front. */
export const S11Room: React.FC<S11RoomProps> = ({life, children}) => (
  <>
    <Ceiling />
    <HighWall life={life} />
    <DockView life={life} />
    <CoffeeCorner brewAt={life.brewAt} />
    <WallFoot />
    <PriceBoard life={life}>{children}</PriceBoard>
  </>
);
