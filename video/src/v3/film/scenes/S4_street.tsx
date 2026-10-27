// S4_street (S4 pilot lane, G5b): THE shared set of S4 and S6 (replaces S4_wall for them; S11 / S12 keep S4_wall).
// The chart is no longer a card taped to an empty wall: it hangs in a glass noticeboard on the street wall of the
// computer shop on your street, at blue hour in the first snow (docs/v3/density_plan_g5b.md S4 + S6). Around the board:
// the upper storey (warm brick, two lit windows, a neighbour crossing, a wire with sparrows), the cornice with snow, the
// COMPUTERS fascia with icicles and a run of warm bulbs, an alarm box and the street plate; on the left the lit display
// window (a monitor cycling ads, boxes, frost) over its plinth, a drainpipe; on the right the glass shop door (the
// shopkeeper moving inside, the OPEN sign swinging: the loop, a bell) under a round wall lamp, a little snowy fir in a
// pot; at the foot a stone skirting, snow banked against it, the pavement with footprints and a bike; in front a row
// of backs looking up at the chart (one raises a phone), and Pip on the board's bottom rail, reading the line.
//
// LOCKED (storyboard_g3 / camera_plan_g3): straight-on and level; the chart is the subject; S6 = S4's exact frame plus
// the hook and "+9.7%". The card is 6 % smaller than G5 about its bottom edge (plan: at most 8 %, never moved up) so
// the board's top rail sits under the caption band (y >= 600). The caption band (290-600) is flat lit wall (snow at
// half density, the headlight sweep passes behind it); the card's plot stays clear of every head, phone and paper.
//
// Everything that moves is a pure function of scene time; each panel passes its own beats in `life` (S4.tsx, S6.tsx).
import React, {useMemo} from 'react';
import {Fill} from '../../../lib/Fill';
import {Ink} from '../../../lib/Ink';
import {blob, glint, line, rect as rectInk, roundRect, textLines} from '../../../lib/sketch';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {
  BackRow,
  CardBoard,
  Cornice,
  EMBER,
  Fascia,
  Footprints,
  Frost,
  HeadlightSweep,
  Icicles,
  LaptopBox,
  Pip3,
  PinnedThing,
  Show,
  SnowCap,
  SnowLayers,
  SnowSill,
  SnowTree,
  StringLights3,
  Txt,
  W,
  WallLamp,
  WindowSilhouette,
  Wire3,
  bob,
  ease01,
  rings,
  sway,
} from '../kit';
import type {BackRowPerson, CornerItem, Pip3Props, Pt} from '../kit';
import {Bike3} from '../kit';
import {BOARD_HOOK, BOARD_LINE, breathe} from './S4_wall';

export {BOARD_HOOK, BOARD_LINE, breathe};

// ---------------------------------------------------------------- geometry (canvas px at camera rest)

/** The card's scale against G5 (about its bottom edge, x centre 540). */
export const CARD_K = 0.94;
const kx = (x: number) => 540 + (x - 540) * CARD_K;
const ky = (y: number) => 1350 + (y - 1350) * CARD_K;
/** The chart card (G5: 140, 615, 800 x 735) and its plot box (G5: 240, 770, 600 x 430), both x 0.94. */
export const CARD = {x: kx(140), y: ky(615), w: 800 * CARD_K, h: 735 * CARD_K};
export const PLOT = {x: kx(240), y: ky(770), w: 600 * CARD_K, h: 430 * CARD_K};
/** Plot units -> canvas px. */
export const plotPt = ([u, v]: Pt): Pt => [PLOT.x + u * PLOT.w, PLOT.y + PLOT.h - v * PLOT.h];
/** The breathe's fixed point: the chart, right of centre (the turn's side). */
export const S4_ANCHOR: [number, number] = [600, 1050];

const MARGIN = 26;
const FRAME = 16;
/** The noticeboard's outer frame. */
export const BOARD = {x0: CARD.x - MARGIN - FRAME, y0: CARD.y - MARGIN - FRAME, x1: CARD.x + CARD.w + MARGIN + FRAME, y1: CARD.y + CARD.h + MARGIN + FRAME};
/** The pavement line at the wall's foot. */
export const GROUND = 1420;
/** Pip's perch: on the board's bottom rail, right corner. */
export const PIP_AT: Pt = [868, CARD.y + CARD.h + MARGIN + 2];

const UP_Y = 92; // the cornice's top line (the upper storey above it)
const FASCIA = {x: 170, y: 146, w: 740, h: 112};
const WIN = {x: -70, y: 640, w: 166, h: 596}; // the display window (cut by the left edge)
const DOOR = {x: 975, y: 700, w: 250, h: GROUND - 700};
const PIPE_X = 107;
const BAND: [number, number] = [290, 600];

// ---------------------------------------------------------------- the beats a panel passes

export type StreetLife = {
  /** Headlight sweeps across the wall (a car passing behind us), 0.8 s each. */
  headlights?: number[];
  /** The shopkeeper's visits behind the door glass: walks in at t0, stands, walks out at t1. */
  keeper?: [number, number][];
  /** The display monitor's slide changes. */
  slides?: number[];
  /** The neighbour crossing the lit upper window (crossing speed, panes / s). */
  upperSpeed?: number;
  /** The sparrows on the wire lift and wheel away. */
  birdsLift?: number;
  /** Snow slides off the wall lamp's cap. */
  lampSnowAt?: number;
  /** The papers on the board lift (a draught, a reaction). */
  flutterAt?: number[];
  /** The bell over the door rings (the OPEN sign jolts with it). */
  bellAt?: number[];
  /** The raised phone's camera flash: a flat star behind the phone for 2 frames at each time (S4: "Laptops"). */
  flashAt?: number[];
  /** The row of backs (row order, left to right) and a person squeezing in from below: index -> time. */
  row?: BackRowPerson[];
  rowN?: number;
  riseAt?: Record<number, number>;
  /** S6: a sixth person squeezes in at the right edge (rises from below, behind the row's last back). */
  squeezeAt?: number;
  squeeze?: BackRowPerson;
  /** Pip's pose / look / hops (x, y = its perch). */
  pip?: Omit<Pip3Props, 'x' | 'y'>;
};

// ---------------------------------------------------------------- the upper storey, cornice, fascia

/** Warm brick above the shopfront: courses and staggered joints (mortar as light strokes), two lit windows. */
const UpperStorey: React.FC<{life: StreetLife}> = ({life}) => {
  const mortar = useMemo(() => {
    let d = '';
    const r = rng('s4st/brick');
    for (let row = 0, y = UP_Y - 6; y > -24; row++, y -= 22) {
      d += `M-30 ${y}H1110`;
      for (let x = -30 + (row % 2) * 30 + r.range(-4, 4); x < 1110; x += 60 + r.range(-3, 3)) d += `M${x.toFixed(1)} ${y}V${y - 22}`;
    }
    return d;
  }, []);
  const panes = [
    {x: 90, w: 200, who: 'cross' as const, plant: false},
    {x: 700, w: 200, who: 'read' as const, plant: true},
  ];
  return (
    <>
      <Fill rect={[-40, -40, 1160, UP_Y + 40]} color={EMBER.pot} offset={false} />
      <path d={mortar} stroke={EMBER.reveal} strokeWidth={2.4} fill="none" />
      {panes.map((p, i) => (
        <React.Fragment key={i}>
          <Fill rect={[p.x - 14, -40, p.w + 28, 40 + 70]} color={EMBER.beam} offset={false} />
          <WindowSilhouette x={p.x} y={-36} w={p.w} h={98} who={p.who} lit curtains plant={p.plant} speed={life.upperSpeed ?? 0.35} seed={`s4st/up${i}`} />
          <Ink d={rectInk(p.x - 14, -40, p.w + 28, 110, {seed: `s4st/upf${i}`, over: [0, 3]}) + line(p.x + p.w / 2, -40, p.x + p.w / 2, 62, {seed: `s4st/upm${i}`, over: [0, 0]})} width={W.far} />
          <Fill rect={[p.x - 24, 66, p.w + 48, 12]} color={EMBER.reveal} offset={false} />
          <SnowSill x0={p.x - 26} x1={p.x + p.w + 26} y={67} h={12} seed={`s4st/ups${i}`} />
        </React.Fragment>
      ))}
      <Wire3 a={[-30, 10]} b={[1110, 34]} sag={30} birds={{us: [0.2, 0.245, 0.29, 0.6], size: 18, liftAt: life.birdsLift}} ink={W.far} seed="s4st/wire" />
    </>
  );
};

/** The alarm box (a slow amber blink) and the street plate, either side of the fascia. */
const FasciaFlanks: React.FC = () => {
  const t = useTime();
  const on = Math.floor(t / 0.9) % 2 === 0;
  return (
    <>
      <Fill d={roundRect(36, 168, 88, 78, 8)} color={EMBER.snow} seed="s4st/alarm" />
      <Fill rect={[52, 186, 56, 10]} color={EMBER.frost} offset={false} />
      <circle cx={80} cy={222} r={8} fill={on ? EMBER.houseLit : EMBER.shelf} />
      <Ink d={roundRect(36, 168, 88, 78, 8, {closed: false, seed: 's4st/alarmI'})} width={W.mid} />
      <SnowCap x={36} y={168} w={88} h={9} seed="s4st/alarmS" />
      <Fill d={roundRect(930, 176, 130, 58, 6)} color={EMBER.card} seed="s4st/plate" />
      <rect x={936} y={182} width={118} height={46} rx={4} fill="none" stroke={EMBER.dc} strokeWidth={2.4} />
      <Txt x={995} y={217} size={28} fill={EMBER.dc} fit={104}>
        HILL ST
      </Txt>
      <Ink d={roundRect(930, 176, 130, 58, 6, {closed: false, seed: 's4st/plateI'})} width={W.far} />
    </>
  );
};

// ---------------------------------------------------------------- the display window (left) and the drainpipe

const SLIDE_BG = [EMBER.dc, EMBER.ring, EMBER.dcSide, EMBER.shelf];

/** The lit display window cut by the left edge: a monitor cycling ads, a stand-up card, stacked laptop boxes, frost,
 *  glints, snow on the sill; the plinth below. */
const ShopWindowCorner: React.FC<{slides: number[]}> = ({slides}) => {
  const t = useTime();
  const {x, y, w, h} = WIN;
  const fr = 14;
  const ix = x + fr;
  const iy = y + fr;
  const iw = w - fr * 2;
  const ih = h - fr * 2;
  const k = slides.filter((s) => t >= s).length;
  const since = k ? t - slides[k - 1] : 9;
  const slideX = since < 0.14 ? (1 - ease01(since, 0, 0.14)) * 90 : 0; // the new ad slides in from the right
  const mon = {x: -14, y: 700, w: 104, h: 70};
  const bg = SLIDE_BG[k % SLIDE_BG.length];
  const prevBg = SLIDE_BG[(k + SLIDE_BG.length - 1) % SLIDE_BG.length];
  const fg = k % 2 ? EMBER.beam : EMBER.core;
  return (
    <>
      <Fill rect={[x, y, w, h]} color={EMBER.beam} seed="s4st/win" />
      <Fill rect={[ix, iy, iw, ih]} color={EMBER.core} offset={false} />
      <Fill rect={[ix, iy, iw, 26]} color={EMBER.ring} offset={false} />
      <Fill rect={[ix, y + h * 0.5, iw, 10]} color={EMBER.shelf} offset={false} />
      <Ink d={line(ix, y + h * 0.5, ix + iw, y + h * 0.5, {seed: 's4st/winsh', over: [0, 0]})} width={W.hair} />
      {/* the monitor: an ad that changes every ~0.9 s (a stepped slide-in, no fade) */}
      <Fill rect={[mon.x - 6, mon.y - 6, mon.w + 12, mon.h + 12]} color={EMBER.anchor} offset={false} />
      <svg x={mon.x} y={mon.y} width={mon.w} height={mon.h} overflow="hidden">
        <rect x={0} y={0} width={mon.w} height={mon.h} fill={prevBg} />
        <g transform={`translate(${slideX.toFixed(1)} 0)`}>
          <rect x={0} y={0} width={mon.w} height={mon.h} fill={bg} />
          {k % 2 ? (
            <path d={textLines(14, 18, 70, {seed: `s4st/ad${k % 4}`, n: 3, gap: 16})} stroke={fg} strokeWidth={5} strokeLinecap="round" fill="none" />
          ) : (
            <>
              <rect x={22} y={14} width={50} height={32} rx={3} fill="none" stroke={fg} strokeWidth={4} />
              <path d={`M14 52H80`} stroke={fg} strokeWidth={5} strokeLinecap="round" />
            </>
          )}
        </g>
      </svg>
      <Fill rect={[30, mon.y + mon.h + 6, 12, y + h * 0.5 - mon.y - mon.h - 6]} color={EMBER.anchor} offset={false} />
      <Ink d={rectInk(mon.x - 6, mon.y - 6, mon.w + 12, mon.h + 12, {seed: 's4st/monI', over: [0, 1]})} width={W.far} />
      {/* a stand-up card and the boxes */}
      <Fill rect={[4, 980, 66, 84]} color={EMBER.card} seed="s4st/stand" />
      <path d={textLines(12, 998, 50, {seed: 's4st/standT', n: 3, gap: 18})} stroke={EMBER.beam} strokeWidth={3} strokeLinecap="round" fill="none" />
      <Ink d={rectInk(4, 980, 66, 84, {seed: 's4st/standI', over: [0, 1]})} width={W.hair} />
      <LaptopBox x={-40} y={1150} w={124} h={72} seed="s4st/bx1" />
      <LaptopBox x={-8} y={1090} w={86} h={60} seed="s4st/bx2" />
      <LaptopBox x={-30} y={1040} w={70} h={50} seed="s4st/bx3" />
      <Frost x={ix} y={iy} w={iw} h={ih} corners={['bl', 'tr']} size={70} seed="s4st/frost" />
      <Ink d={rectInk(x, y, w, h, {seed: 's4st/winI', over: [4, 8]}) + rectInk(ix, iy, iw, ih, {seed: 's4st/winII', over: [0, 2]})} width={W.mid} />
      <Show>
        <path d={glint(ix + iw * 0.55, iy + 60, 50, {seed: 's4st/wing'}) + glint(ix + iw * 0.3, iy + ih * 0.66, 40, {seed: 's4st/wing2'})} fill="none" stroke={EMBER.white} strokeWidth={W.far} strokeLinecap="round" />
      </Show>
      {/* sill and plinth */}
      <Fill rect={[x - 10, y + h, w + 18, 16]} color={EMBER.reveal} offset={false} />
      <SnowSill x0={x - 12} x1={x + w + 10} y={y + h + 1} h={14} seed="s4st/winsill" />
      <Fill rect={[x, y + h + 16, w, GROUND - (y + h + 16)]} color={EMBER.shelf} seed="s4st/plinth" />
      <Ink d={line(x, y + h + 16, x + w + 8, y + h + 16, {seed: 's4st/plT', over: [0, 4]}) + rectInk(8, y + h + 50, 70, GROUND - (y + h + 50) - 30, {seed: 's4st/plP', over: [0, 0]})} width={W.far} />
    </>
  );
};

/** The drainpipe from the cornice to the ground (fill only across the caption band: no ink there). */
const Pipe: React.FC = () => {
  const w = 18;
  const x0 = PIPE_X - w / 2;
  let br = '';
  for (const yy of [200, 700, 960, 1220]) br += line(x0 - 6, yy, x0 + w + 6, yy, {over: [0, 0], seed: `s4st/pb${yy}`});
  const seg = (a: number, b2: number, k: string) => line(x0, a, x0, b2, {over: [0, 0], seed: `s4st/pl${k}`}) + line(x0 + w, a, x0 + w, b2, {over: [0, 0], seed: `s4st/pr${k}`});
  return (
    <>
      <Fill rect={[x0, UP_Y + 44, w, GROUND - UP_Y - 44]} color={EMBER.dcSide} offset={false} />
      <Fill rect={[x0 + 3, UP_Y + 44, 4, GROUND - UP_Y - 44]} color={EMBER.skyLow} offset={false} />
      <Ink d={seg(UP_Y + 44, BAND[0], 'u') + seg(BAND[1], GROUND - 26, 'd') + br} width={W.far} />
      <Fill d={`M${x0 - 4} ${GROUND - 26}h${w + 8}l12 22h-${w + 30}z`} color={EMBER.dcSide} offset={false} />
      <Icicles x0={x0 + 2} x1={x0 + w + 8} y={GROUND - 6} n={2} len={[10, 18]} seed="s4st/pipeice" />
    </>
  );
};

// ---------------------------------------------------------------- the shop door (right)

/** The glass door cut by the right edge: the warm shop inside (shelves, boxes), the shopkeeper moving behind the
 *  glass, a push bar, the OPEN sign swinging on its string (the loop), the bell, a kick panel and a mat. */
const ShopDoorLive: React.FC<{keeper: [number, number][]; bellAt?: number[]}> = ({keeper, bellAt}) => {
  const t = useTime();
  const {x, y, w, h} = DOOR;
  const fr = 20;
  const gx = x + fr;
  const gy = y + fr;
  const gw = w - fr * 2;
  const gh = h * 0.74;
  // the shopkeeper: in from the right, a pause at the shelf, out to the right
  let kx: number | null = null;
  let kb = 0;
  for (const [t0, t1] of keeper) {
    if (t < t0 || t > t1) continue;
    const inK = ease01(t, t0, 0.5);
    const outK = ease01(t, t1 - 0.5, 0.5);
    kx = 1150 - (1150 - 1036) * inK + (1150 - 1036) * outK;
    kb = Math.abs(Math.sin((t - t0) * 7)) * (inK < 1 || outK > 0 ? 4 : 0) + bob(t, 1.2, 0.5);
  }
  const sw = 116;
  const sh = 52;
  const sx = 1046 - sw / 2;
  const sy = gy + 96;
  const ang = sway(t, 4, 1.6) + rings(t, bellAt, 6, 1.4, 2);
  const bellA = rings(t, bellAt, 18, 3.4, 3) + sway(t, 1.5, 2.2);
  const clip = 's4stdoorglass';
  return (
    <>
      <Fill rect={[x, y, w, h]} color={EMBER.beam} seed="s4st/door" />
      <defs>
        <clipPath id={clip}>
          <rect x={gx} y={gy} width={gw} height={gh} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <rect x={gx} y={gy} width={gw} height={gh} fill={EMBER.ring} />
        <rect x={gx} y={gy + gh * 0.34} width={gw} height={8} fill={EMBER.shelf} />
        <rect x={gx} y={gy + gh * 0.66} width={gw} height={8} fill={EMBER.shelf} />
        <rect x={gx + 70} y={gy + gh * 0.34 - 46} width={56} height={46} fill="#C98A64" />
        <rect x={gx + 10} y={gy + gh * 0.66 - 38} width={70} height={38} fill={EMBER.card} />
        <rect x={gx + 96} y={gy + gh * 0.66 - 52} width={44} height={52} fill={EMBER.reveal} />
        {kx !== null ? (
          <g transform={`translate(${kx.toFixed(1)} ${(gy + gh * 0.3 - kb).toFixed(1)})`}>
            <path d={blob(0, 0, 30, 34, {seed: 's4st/kh'})} fill="#7A3A24" />
            <path d={`M-58 ${gh}L-52 92Q-48 48 0 44Q48 48 52 92L58 ${gh}Z`} fill={EMBER.desk} />
            <path d={`M-20 50Q0 70 20 50`} stroke="#7A3A24" strokeWidth={6} fill="none" />
          </g>
        ) : null}
      </g>
      <Fill rect={[gx, gy + gh + 14, gw, h - gh - fr - 30]} color="#7A3A24" offset={false} />
      <Ink
        d={rectInk(x, y, w, h, {seed: 's4st/doorI', over: [4, 10]}) + rectInk(gx, gy, gw, gh, {seed: 's4st/doorG', over: [0, 2]}) + rectInk(gx, gy + gh + 14, gw, h - gh - fr - 30, {seed: 's4st/doorK', over: [0, 0]}) + line(gx + 14, gy + gh * 0.5, gx + 14, gy + gh * 0.72, {seed: 's4st/bar', over: [0, 0]})}
        width={W.mid}
      />
      <path d={glint(gx + 110, gy + 30, 60, {seed: 's4st/doorgl'})} fill="none" stroke={EMBER.white} strokeWidth={W.far} strokeLinecap="round" />
      {/* the OPEN sign on its string */}
      <XG m={mat.about(mat.rotate(ang), sx + sw / 2, gy + 8)}>
        <path d={`M${sx + sw / 2} ${gy + 8}L${sx + 14} ${sy}M${sx + sw / 2} ${gy + 8}L${sx + sw - 14} ${sy}`} stroke={EMBER.ink} strokeWidth={W.hair} fill="none" />
        <Fill d={roundRect(sx, sy, sw, sh, 8)} color={EMBER.card} seed="s4st/open" />
        <Txt x={sx + sw / 2} y={sy + sh * 0.72} size={32} fill={EMBER.beam} fit={sw * 0.84}>
          OPEN
        </Txt>
        <Ink d={roundRect(sx, sy, sw, sh, 8, {closed: false, seed: 's4st/openI'})} width={W.far} />
      </XG>
      {/* the bell over the door */}
      <XG m={mat.about(mat.rotate(bellA), 1010, y - 2)}>
        <path d={`M1010 ${y - 2}v16`} stroke={EMBER.ink} strokeWidth={W.hair} />
        <path d={`M996 ${y + 40}Q996 ${y + 14} 1010 ${y + 14}Q1024 ${y + 14} 1024 ${y + 40}Z`} fill={EMBER.books[0]} stroke={EMBER.ink} strokeWidth={W.far} />
      </XG>
      {/* the step and the mat */}
      <Fill rect={[x - 12, GROUND - 10, w + 30, 14]} color={EMBER.reveal} offset={false} />
      <SnowSill x0={x - 14} x1={x + w + 20} y={GROUND - 9} h={10} seed="s4st/step" />
    </>
  );
};

/** The round wall lamp over the door, its snow cap (slides off at `snowAt`, falls behind the row). */
const LampWithSnow: React.FC<{snowAt?: number}> = ({snowAt}) => {
  const t = useTime();
  const lx = 1034;
  const ly = 650;
  const d = snowAt === undefined ? -1 : t - snowAt;
  const capOn = d < 0;
  const fall = d >= 0 && d < 1.1 ? d : null;
  return (
    <>
      <WallLamp x={lx} y={ly} r={24} seed="s4st/lamp" />
      {capOn ? <SnowCap x={lx - 24} y={ly - 38} w={48} h={11} seed="s4st/lampcap" /> : null}
      {fall !== null ? (
        <>
          <path d={blob(lx - 10 - fall * 30, ly - 40 + 900 * fall * fall, 16 * (1 - fall * 0.5), 9 * (1 - fall * 0.5), {seed: 's4st/clump'})} fill={EMBER.snow} />
          <path d={blob(lx + 14 - fall * 18, ly - 30 + 820 * fall * fall, 9 * (1 - fall * 0.6), 6 * (1 - fall * 0.6), {seed: 's4st/clump2'})} fill={EMBER.snow} />
        </>
      ) : null}
    </>
  );
};

// ---------------------------------------------------------------- the board, its papers, the foot of the wall

const CORNERS: CornerItem[] = [
  {corner: 'tl', kind: 'flyer', w: 140, h: 196, out: 0.3, rot: -5},
  {corner: 'tr', kind: 'concert', w: 132, h: 176, out: 0.3, rot: 6},
  {corner: 'bl', kind: 'photo', w: 110, h: 128, out: 0.4, rot: -8},
  {corner: 'bl', kind: 'note', w: 86, h: 86, out: 0.7, rot: 9},
  {corner: 'br', kind: 'card', w: 116, h: 66, out: 0.5, rot: 5},
];

/** Papers peeking out from behind the card along its sides (drawn before the card). */
const SidePapers: React.FC = () => (
  <>
    <XG m={mat.about(mat.rotate(-4), CARD.x - 20, 905)}>
      <PinnedThing kind="slip" x={CARD.x - 52} y={880} w={96} h={150} seed="s4st/sp1" color={EMBER.card} />
    </XG>
    <XG m={mat.about(mat.rotate(5), CARD.x + CARD.w + 20, 1015)}>
      <PinnedThing kind="ticket" x={CARD.x + CARD.w - 50} y={1000} w={100} h={70} seed="s4st/sp2" color={EMBER.ring} />
    </XG>
    <XG m={mat.about(mat.rotate(-3), CARD.x + CARD.w + 10, 760)}>
      <PinnedThing kind="note" x={CARD.x + CARD.w - 40} y={742} w={72} h={72} seed="s4st/sp3" color={EMBER.hl} />
    </XG>
  </>
);

/** The pins that hold the card (over it, at its corners: outside the plot). */
const CardPins: React.FC = () => (
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
        <circle cx={px} cy={py} r={7.5} fill={i % 2 ? EMBER.dc : EMBER.beam} stroke={EMBER.ink} strokeWidth={1.6} />
        <circle cx={px - 2.4} cy={py - 2.4} r={2} fill={EMBER.white} />
      </React.Fragment>
    ))}
  </>
);

/** The stone skirting under the board, snow banked against the wall, the pavement with footprints, a bike. */
const WallFoot: React.FC = () => {
  const fp: Pt[] = useMemo(() => Array.from({length: 14}, (_, i) => [60 + i * 72, GROUND + 44 + Math.sin(i * 0.9) * 10] as Pt), []);
  const fp2: Pt[] = useMemo(() => Array.from({length: 10}, (_, i) => [1040 - i * 88, GROUND + 92 + Math.cos(i * 0.7) * 8] as Pt), []);
  return (
    <>
      <Fill rect={[WIN.x + WIN.w, BOARD.y1 + 4, DOOR.x - WIN.x - WIN.w, GROUND - BOARD.y1 - 4]} color={EMBER.reveal} offset={false} />
      <Ink d={line(WIN.x + WIN.w, BOARD.y1 + 4, DOOR.x, BOARD.y1 + 4, {seed: 's4st/skirt', over: [0, 0]})} width={W.far} />
      <Fill rect={[-60, GROUND, 1200, 640]} color={EMBER.snow} offset={false} />
      <path d={blob(300, GROUND + 2, 330, 14, {seed: 's4st/bank1'}) + blob(760, GROUND + 4, 280, 12, {seed: 's4st/bank2'})} fill={EMBER.snow} />
      <Ink d={line(-40, GROUND, 1120, GROUND, {seed: 's4st/ground', over: 'structural'})} width={W.far} />
      <Fill rect={[-60, GROUND + 140, 1200, 18]} color={EMBER.frost} offset={false} />
      <Ink d={line(-40, GROUND + 140, 1120, GROUND + 142, {seed: 's4st/kerb', over: [0, 0]})} width={W.far} />
      <Footprints points={fp} size={11} seed="s4st/fp1" />
      <Footprints points={fp2} size={10} seed="s4st/fp2" />
      <Bike3 x={150} y={GROUND + 54} w={230} seed="s4st/bike" />
    </>
  );
};

/** The door planter: a little snowy fir in a pot with a few warm bulbs. */
const Planter: React.FC = () => (
  <>
    <SnowTree x={1040} y={GROUND - 66} h={210} kind="pine" seed="s4st/fir" />
    <StringLights3 points={[[984, GROUND - 160], [1060, GROUND - 130], [990, GROUND - 100], [1080, GROUND - 82]]} sag={6} n={7} r={6} halo={false} sway={0.6} seed="s4st/firlights" />
    <Fill d={`M988 ${GROUND - 70}h104l-12 70h-80z`} color={EMBER.pot} seed="s4st/pot" />
    <Ink d={`M988 ${GROUND - 70}h104l-12 70h-80z`} width={W.mid} />
    <SnowCap x={990} y={GROUND - 70} w={100} h={10} seed="s4st/potsnow" />
  </>
);

/** The raised phone's camera end (row back 2, after its lean): where its flash bursts. */
const PHONE_AT: Pt = [694, 1346];

/** A camera flash over the raised phone's top: a flat warm 8-point star with a white core, shown for 2 frames (no
 *  fade; warm, so it reads against the white card behind it). */
const PhoneFlash: React.FC<{at?: number[]}> = ({at = []}) => {
  const t = useTime();
  const hit = at.find((a) => t >= a && t < a + 2 / 60 + 1e-6);
  if (hit === undefined) return null;
  const [cx, cy] = PHONE_AT;
  const big = t - hit < 1 / 60 ? 1 : 0.78;
  const star = (rLong: number, rShort: number, r0: number, half: number) => {
    let d = '';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
      const r1 = (i % 2 ? rShort : rLong) * big;
      const p = (aa: number, rr: number) => `${(cx + Math.cos(aa) * rr).toFixed(1)} ${(cy + Math.sin(aa) * rr).toFixed(1)}`;
      d += `M${p(a - half, r0 * big)}L${p(a, r1)}L${p(a + half, r0 * big)}Z`;
    }
    return d;
  };
  return (
    <>
      <path d={star(78, 44, 18, 0.2)} fill={EMBER.houseLit} />
      <circle cx={cx} cy={cy} r={20 * big} fill={EMBER.houseLit} />
      <circle cx={cx} cy={cy} r={12 * big} fill={EMBER.white} />
    </>
  );
};

// ---------------------------------------------------------------- the set

export type S4StreetProps = {
  life: StreetLife;
  /** The chart card and its chart (drawn in the board, over the papers). */
  children?: React.ReactNode;
};

/** S4 / S6's world round the chart. Behind: the wall, the shopfront, the board and its papers; then the card
 *  (children); in front: Pip on the rail, the row of backs, the snow. */
export const S4Street: React.FC<S4StreetProps> = ({life, children}) => {
  const pip = life.pip ?? {};
  return (
    <>
      {/* the wall is the World's sky (EMBER.wall); a car's headlights sweep across it */}
      <HeadlightSweep rect={[-20, UP_Y + 40, 1120, GROUND - UP_Y - 40]} at={life.headlights ?? []} dur={0.8} width={120} id="s4sthl" />
      <LampWithSnow snowAt={life.lampSnowAt} />
      <UpperStorey life={life} />
      <Cornice x0={-60} x1={1140} y={UP_Y} h={44} icicles={0} seed="s4st/cornice" />
      <Fascia x={FASCIA.x} y={FASCIA.y} w={FASCIA.w} h={FASCIA.h} text="COMPUTERS" seed="s4st/fascia" />
      <Icicles x0={FASCIA.x + 30} x1={FASCIA.x + FASCIA.w - 30} y={FASCIA.y + FASCIA.h} n={5} len={[12, 26]} seed="s4st/fice" />
      <FasciaFlanks />
      <StringLights3 points={[[-20, 264], [360, 268], [720, 268], [1100, 264]]} sag={9} n={19} r={6} halo={false} sway={1} seed="s4st/bulbs" />
      <ShopWindowCorner slides={life.slides ?? []} />
      <Pipe />
      <ShopDoorLive keeper={life.keeper ?? []} bellAt={life.bellAt} />
      <WallFoot />
      <Planter />
      {/* the noticeboard behind glass, papers at its corners and sides, snow on its top rail */}
      <CardBoard card={CARD} margin={MARGIN} kind="notice" corners={CORNERS} flutterAt={life.flutterAt} seed="s4st/board" />
      <SnowSill x0={BOARD.x0 - 4} x1={BOARD.x1 + 4} y={BOARD.y0 + 1} h={13} seed="s4st/boardsnow" />
      <SidePapers />
      {children}
      <CardPins />
      <Pip3 x={PIP_AT[0]} y={PIP_AT[1]} pose="sit-back" outdoor snowCap={0.4} seed={6} {...pip} />
      {life.squeezeAt !== undefined ? (
        <BackRow x0={920} x1={1240} top={1440} head={112} n={1} seed="s4st/sq" snow lookX={560} people={life.squeeze ? [life.squeeze] : undefined} riseAt={{0: life.squeezeAt}} />
      ) : null}
      <BackRow x0={-50} x1={1130} top={1462} head={116} n={life.rowN ?? 5} seed="s4st/row" snow lookX={560} people={life.row} riseAt={life.riseAt} />
      <PhoneFlash at={life.flashAt} />
      <SnowLayers band={BAND} seed="s4st/snow" layers={['far', 'mid', 'near']} density={0.9} />
    </>
  );
};
