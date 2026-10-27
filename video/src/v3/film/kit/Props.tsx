// kit/Props.tsx: the small cast of S10 / S13 / S14: the chip factory (warm brick, sawtooth roof, chimney), the laptop
// delivery van, waiting dots, the speech and thought bubbles, the wall clock and the 2026 -> 2027 calendar.

import React from 'react';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {blob, circle, crown, ellipse, hline, line, poly, polyPath, rect as rectInk, roundRect, smooth, vline} from '../../../lib/sketch';
import {useTime, prog, ease} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {EMBER} from '../palette';
import {At, b, fillAt, Pt, Show, Txt, TCircle, TPath} from './util';
import {Laptop} from './Laptop';
import {tiered} from '../../../lib/tier';

// ---------------------------------------------------------------- chip factory

export type ChipFactoryProps = {
  /** Base centre (canvas px) and width (board: 300). Height ~0.62 w plus the roof teeth and the chimney. */
  x: number;
  y: number;
  w?: number;
  /** The big door is lit (warm). */
  doorLit?: boolean;
  /** Which end of the facade the big door sits at (default 'l'; 'r' mirrors the whole factory about x, so the door
   *  meets a road arriving from the right and the chimney moves to the left end). */
  doorSide?: 'l' | 'r';
  /** Chimney steam: the puffs' max rise above the chimney top (px; default 0.3 w), or false = no steam (e.g. when the
   *  chimney top sits just under the caption band). */
  steam?: number | false;
  at?: At;
  seed?: string;
  ink?: number;
};

export function chipFactoryGeo(x: number, y: number, w = 300) {
  const h = w * 0.46;
  const x0 = x - w / 2;
  const door = {x: x0 + w * 0.08, y: y - h * 0.62, w: w * 0.2, h: h * 0.62};
  return {h, x0, x1: x + w / 2, top: y - h, door, doorC: [door.x + door.w / 2, y] as Pt};
}

const ChipFactoryBody: React.FC<ChipFactoryProps> = ({doorSide = 'l', ...p}) =>
  doorSide === 'r' ? (
    <XG m={mat.about(mat.scale(-1, 1), p.x, p.y)}>
      <ChipFactoryL {...p} />
    </XG>
  ) : (
    <ChipFactoryL {...p} />
  );

const ChipFactoryL: React.FC<Omit<ChipFactoryProps, 'doorSide'>> = ({x, y, w = 300, doorLit = true, steam, at, seed = 'fab', ink = 3.4}) => {
  const t = useTime();
  const g = chipFactoryGeo(x, y, w);
  const teeth = 3;
  const tw = w / teeth;
  const th = w * 0.17;
  const roof: Pt[] = [[g.x0, g.top]];
  for (let i = 0; i < teeth; i++) roof.push([g.x0 + i * tw, g.top - th], [g.x0 + (i + 1) * tw, g.top]);
  const roofD = polyPath([...roof, [g.x1, g.top + 2], [g.x0, g.top + 2]]);
  // snow on each tooth's long slope
  const snow = Array.from({length: teeth}, (_, i) => polyPath([[g.x0 + i * tw - 2, g.top - th - 3], [g.x0 + (i + 1) * tw + 2, g.top - 3], [g.x0 + (i + 1) * tw - 8, g.top + 4], [g.x0 + i * tw + 2, g.top - th + 7]]));
  const glass = Array.from({length: teeth}, (_, i) => polyPath([[g.x0 + i * tw + 3, g.top - th + 6], [g.x0 + i * tw + 3, g.top - 2], [g.x0 + i * tw + tw * 0.18, g.top - 2]]));
  const ch = {x: g.x1 - w * 0.17, w: w * 0.09, top: g.top - th - w * 0.32};
  // chimney steam: three flat snow-coloured puffs rising and growing on a loop
  const rise = steam === false ? 0 : steam ?? w * 0.3;
  const puffs = steam === false ? [] : [0, 1, 2].map((i) => {
    const ph = ((t * 0.45 + i / 3) % 1 + 1) % 1;
    return {cx: ch.x + ch.w / 2 + ph * w * 0.08, cy: ch.top - 10 - ph * rise, r: w * (0.035 + ph * 0.05)};
  });
  // the chip sign on the facade: a dark square with pins
  const cs = w * 0.17;
  const cx = x + w * 0.12;
  const cy = g.top + g.h * 0.42;
  let pins = '';
  for (let i = 0; i < 4; i++) {
    const o = -cs / 2 + (cs * (i + 0.5)) / 4;
    pins += `M${cx + o} ${cy - cs / 2}V${cy - cs / 2 - cs * 0.18}M${cx + o} ${cy + cs / 2}V${cy + cs / 2 + cs * 0.18}M${cx - cs / 2} ${cy + o}H${cx - cs / 2 - cs * 0.18}M${cx + cs / 2} ${cy + o}H${cx + cs / 2 + cs * 0.18}`;
  }
  const wins = [0.55, 0.72, 0.88].map((u) => [g.x0 + w * u - w * 0.05, g.top + g.h * 0.62, w * 0.09, g.h * 0.2] as [number, number, number, number]);
  return (
    <>
      {puffs.map((p, i) => (
        <TCircle key={i} cx={p.cx} cy={p.cy} r={p.r} fill={EMBER.snow} />
      ))}
      <Fill rect={[ch.x, ch.top, ch.w, g.top - ch.top]} color={EMBER.brickShade} at={fillAt(at, 0.02)} seed={`${seed}/ch`} />
      <Fill rect={[ch.x - 4, ch.top - 4, ch.w + 8, 10]} color={EMBER.anchor} at={fillAt(at, 0.04)} offset={false} />
      <Fill d={roofD} color={EMBER.brickShade} at={fillAt(at, 0.02)} seed={`${seed}/roof`} />
      {glass.map((d, i) => (
        <Fill key={`g${i}`} d={d} color={EMBER.houseLit} at={fillAt(at, 0.06)} offset={false} />
      ))}
      {snow.map((d, i) => (
        <Fill key={`s${i}`} d={d} color={EMBER.snow} at={fillAt(at, 0.06)} offset={false} />
      ))}
      <Fill rect={[g.x0, g.top, w, g.h]} color={EMBER.brick} at={fillAt(at)} seed={`${seed}/body`} />
      <Fill rect={[g.door.x, g.door.y, g.door.w, g.door.h]} color={doorLit ? EMBER.houseLit : EMBER.anchor} at={fillAt(at, 0.04)} offset={false} />
      {wins.map((r, i) => (
        <Fill key={`w${i}`} rect={r} color={EMBER.houseLit} at={fillAt(at, 0.06 + i * 0.02)} offset={false} />
      ))}
      <Fill rect={[cx - cs / 2, cy - cs / 2, cs, cs]} color={EMBER.chip} at={fillAt(at, 0.06)} offset={false} />
      <Show at={fillAt(at, 0.06)}>
        <TPath d={pins} stroke={EMBER.pin} strokeWidth={Math.max(2, w * 0.012)} fill="none" />
      </Show>
      <Ink
        d={poly(roof, {seed: `${seed}/rI`, over: [2, 5]}) + rectInk(g.x0, g.top, w, g.h, {seed: `${seed}/bI`, edges: 'lr', over: [0, 0]}) + rectInk(g.door.x, g.door.y, g.door.w, g.door.h, {seed: `${seed}/dI`, edges: 'tlr', over: [0, 3]}) + rectInk(ch.x, ch.top, ch.w, g.top - th * 0.4 - ch.top, {seed: `${seed}/cI`, edges: 'tlr', over: [0, 2]}) + hline(g.x0 - 10, g.x1 + 10, y, {seed: `${seed}/gI`, over: [4, 8]})}
        at={at}
        width={ink}
      />
      <Ink d={wins.map((r, i) => rectInk(...r, {seed: `${seed}/wI${i}`, over: [0, 1]})).join('') + rectInk(cx - cs / 2, cy - cs / 2, cs, cs, {seed: `${seed}/csI`, over: [0, 2]})} at={b(at, 0.1)} width={Math.max(1.6, ink * 0.6)} />
    </>
  );
};
export const ChipFactory = tiered('environment', {tone: EMBER.brick, bg: EMBER.sky}, ChipFactoryBody);

// ---------------------------------------------------------------- the chip maker (S14's speaker)

/** A small chip-fab worker in a white clean-room suit (hood, frost visor), standing at the factory door, one arm out
 *  (pointing / speaking). (x, y) = feet centre, h = height (board: 112). Faces left by default (toward the road). */
const ChipMakerBody: React.FC<{x: number; y: number; h?: number; facing?: 'l' | 'r'; point?: boolean; at?: At; seed?: string; ink?: number}> = ({x, y, h = 112, facing = 'l', point = true, at, seed = 'maker', ink = 2.6}) => {
  const t = useTime();
  const u = h / 112;
  const s = facing === 'l' ? -1 : 1;
  const headC: Pt = [x, y - h + 15 * u];
  const body = smooth([[x - 16 * u, y - 4 * u], [x - 19 * u, y - 56 * u], [x - 14 * u, y - 80 * u], [x + 14 * u, y - 80 * u], [x + 19 * u, y - 56 * u], [x + 16 * u, y - 4 * u]], {closed: true});
  const legs = polyPath([[x - 15 * u, y - 30 * u], [x + 15 * u, y - 30 * u], [x + 14 * u, y], [x + 2 * u, y], [x, y - 18 * u], [x - 2 * u, y], [x - 14 * u, y]]);
  const wave = point ? Math.sin(t * 5) * 3 * u : 0;
  const hand: Pt = [x + s * 42 * u, y - 74 * u + wave];
  const arm = `M${x + s * 12 * u} ${y - 72 * u}L${hand[0]} ${hand[1]}`;
  const visor = blob(headC[0] + s * 3 * u, headC[1] + 1 * u, 8 * u, 6 * u, {seed: `${seed}/v`});
  return (
    <>
      <Fill d={legs} color={EMBER.card} at={fillAt(at)} seed={`${seed}/l`} />
      <Fill d={body} color={EMBER.card} at={fillAt(at)} seed={`${seed}/b`} />
      <Ink d={body + legs} at={at} width={ink} />
      {point ? <Ink thing d={arm} at={b(at, 0.04)} width={9 * u} color={EMBER.card} taper={false} /> : null}
      {point ? <Ink d={arm} at={b(at, 0.04)} width={1.6} /> : null}
      <Fill d={blob(headC[0], headC[1], 14 * u, 15 * u, {seed: `${seed}/h`})} color={EMBER.card} at={fillAt(at, 0.02)} />
      <Ink d={ellipse(headC[0], headC[1], 14 * u, 15 * u, {seed: `${seed}/hI`})} at={b(at, 0.02)} width={ink} />
      <Fill d={visor} color={EMBER.frost} at={fillAt(at, 0.04)} offset={false} />
      <Ink d={visor} at={b(at, 0.04)} width={1.6} />
      <Fill d={blob(x - 5 * u, y - 2 * u, 9 * u, 3.5 * u, {seed: `${seed}/s1`})} color={EMBER.reveal} at={fillAt(at, 0.04)} offset={false} />
    </>
  );
};
export const ChipMaker = tiered('support', {tone: EMBER.card}, ChipMakerBody);

// ---------------------------------------------------------------- the laptop van

export type VanProps = {
  /** Wheels' ground line: centre x and y (canvas px). Width (board: 380). Faces right unless `flip`. */
  x: number;
  y: number;
  w?: number;
  flip?: boolean;
  /** Headlights on (warm). */
  lights?: boolean;
  /** The laptop decal's width (px; default 0.42 of the box, ~108 at w 380). */
  decalW?: number;
  /** Wheels roll (degrees per px of travel are the lane's; here a static spoke). */
  at?: At;
  seed?: string;
  ink?: number;
};

const VanBody: React.FC<VanProps> = ({x, y, w = 380, flip, lights = true, decalW, at, seed = 'van', ink = 3.4}) => {
  const h = w * 0.5;
  const x0 = x - w / 2;
  const wheelR = w * 0.085;
  const boxW = w * 0.68;
  const top = y - h;
  const body: Pt[] = [
    [x0, y - wheelR * 0.6],
    [x0, top],
    [x0 + boxW, top],
    [x0 + boxW, top + h * 0.18],
    [x0 + w * 0.86, top + h * 0.22],
    [x0 + w * 0.98, top + h * 0.52],
    [x0 + w, y - wheelR * 0.6],
  ];
  const cabWin: Pt[] = [[x0 + boxW + w * 0.02, top + h * 0.26], [x0 + w * 0.84, top + h * 0.29], [x0 + w * 0.93, top + h * 0.5], [x0 + boxW + w * 0.02, top + h * 0.5]];
  const wheels = [x0 + w * 0.2, x0 + w * 0.8];
  const content = (
    <>
      <Fill d={polyPath(body)} color={EMBER.wall} at={fillAt(at)} seed={`${seed}/body`} />
      <Fill rect={[x0 - 2, top - 6, boxW + 4, 8]} color={EMBER.snow} at={fillAt(at, 0.06)} offset={false} />
      <Fill rect={[x0, y - wheelR * 1.25, w, wheelR * 0.65]} color={EMBER.reveal} at={fillAt(at, 0.03)} offset={false} />
      <Fill d={polyPath(cabWin)} color={EMBER.sky} at={fillAt(at, 0.04)} offset={false} />
      {lights ? <Fill d={blob(x0 + w * 0.975, top + h * 0.66, w * 0.022, w * 0.03, {seed: `${seed}/hl`})} color={EMBER.houseLit} at={fillAt(at, 0.08)} offset={false} /> : null}
      <Ink d={poly(body, {seed: `${seed}/bI`, over: [2, 6]}) + vline(x0 + boxW, top, y - wheelR, {seed: `${seed}/cab`, over: [0, 0]}) + poly(cabWin, {closed: true, seed: `${seed}/wI`, over: [0, 2]})} at={at} width={ink} />
      {/* the decal: THE laptop on its side of the box */}
      <Laptop x={x0 + boxW * 0.5} y={top + h * (decalW ? 0.547 : 0.56)} w={decalW ?? boxW * 0.42} variant="old" at={b(at, 0.12)} seed={`${seed}/decal`} ink={decalW ? 2.8 : 2.6} />
      {wheels.map((wx, i) => (
        <React.Fragment key={i}>
          <Fill d={blob(wx, y - wheelR, wheelR, wheelR, {seed: `${seed}/w${i}`})} color={EMBER.anchor} at={fillAt(at, 0.05)} />
          <Fill d={blob(wx, y - wheelR, wheelR * 0.42, wheelR * 0.42, {seed: `${seed}/h${i}`})} color={EMBER.reveal} at={fillAt(at, 0.08)} offset={false} />
          <Ink d={circle(wx, y - wheelR, wheelR, {seed: `${seed}/wI${i}`})} at={b(at, 0.05)} width={ink} />
        </React.Fragment>
      ))}
    </>
  );
  return flip ? <XG m={mat.about(mat.scale(-1, 1), x, y)}>{content}</XG> : content;
};
export const Van = tiered('environment', {tone: EMBER.reveal, bg: EMBER.sky}, VanBody);

// ---------------------------------------------------------------- waiting dots

/** Three dots that bob one after another (waiting). (x, y) = the first dot; they step along `dir` (default up-right,
 *  as over the van's cab on the board). */
const WaitingDotsBody: React.FC<{x: number; y: number; r?: number; gap?: Pt; n?: number; at?: At; color?: string}> = ({x, y, r = 11, gap = [36, -16], n = 3, at, color = EMBER.anchor}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const ph = ((t * 1.2 - i * 0.18) % 1 + 1) % 1;
        const lift = ph < 0.3 ? Math.sin((ph / 0.3) * Math.PI) * r * 0.7 : 0;
        const pop = at === undefined ? 1 : prog(t, at + i * 0.08, 0.12, ease.outCubic);
        if (pop <= 0) return null;
        return <TCircle key={i} cx={x + gap[0] * i} cy={y + gap[1] * i - lift} r={r * (0.2 + 0.8 * pop)} fill={color} stroke={EMBER.ink} strokeWidth={1.6} />;
      })}
    </>
  );
};
export const WaitingDots = tiered('support', {}, WaitingDotsBody);

// ---------------------------------------------------------------- bubbles

export type BubbleProps = {
  /** Bubble centre and radii (canvas px). */
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  /** Where the tail points (a speaker's head). */
  to: Pt;
  at?: At;
  seed?: string;
  ink?: number;
  children?: React.ReactNode;
};

/** A speech bubble: a warm-white oval with a tail to the speaker; content as children (canvas px). Pops in. */
const SpeechBubbleBody: React.FC<BubbleProps> = ({cx, cy, rx, ry, to, at, seed = 'speech', ink = 3.4, children}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const s = at === undefined ? 1 : 0.2 + 0.8 * prog(t, at, 0.14, ease.outBack(1.3));
  const ang = Math.atan2(to[1] - cy, to[0] - cx);
  const base1: Pt = [cx + Math.cos(ang - 0.22) * rx * 0.86, cy + Math.sin(ang - 0.22) * ry * 0.86];
  const base2: Pt = [cx + Math.cos(ang + 0.22) * rx * 0.86, cy + Math.sin(ang + 0.22) * ry * 0.86];
  const tail = polyPath([base1, to, base2]);
  const oval = blob(cx, cy, rx, ry, {seed: `${seed}/o`, wobble: 0.02});
  return (
    <XG m={mat.about(mat.scale(s), to[0], to[1])}>
      <Fill d={tail} color={EMBER.card} offset={false} />
      <Fill d={oval} color={EMBER.card} offset={false} />
      <Ink d={ellipse(cx, cy, rx, ry, {seed: `${seed}/oI`, overlap: -10})} width={ink} />
      <Ink d={`M${base1[0]} ${base1[1]}L${to[0]} ${to[1]}L${base2[0]} ${base2[1]}`} width={ink} />
      <Fill d={blob(cx, cy, rx * 0.9, ry * 0.9, {seed: `${seed}/in`})} color={EMBER.card} offset={false} />
      {children}
    </XG>
  );
};
export const SpeechBubble = tiered('support', {tone: EMBER.card, lines: true}, SpeechBubbleBody);

/** A thought bubble: a cloud with two small circles trailing to the thinker's head; content as children. */
const ThoughtBubbleBody: React.FC<BubbleProps> = ({cx, cy, rx, ry, to, at, seed = 'thought', ink = 3.4, children}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const s = at === undefined ? 1 : 0.2 + 0.8 * prog(t, at, 0.16, ease.outBack(1.3));
  // crown takes the ellipse's centre and radii: the cloud is centred on (cx, cy); the two dots step from the rim
  // point facing the head down to it (S13's fix)
  const cloud = crown(cx, cy, rx, ry, {seed: `${seed}/c`, bumps: 9, round: 0.75});
  const th = Math.atan2((to[1] - cy) / ry, (to[0] - cx) / rx);
  const rim: Pt = [cx + Math.cos(th) * rx, cy + Math.sin(th) * ry];
  const along = (k: number): Pt => [rim[0] + (to[0] - rim[0]) * k, rim[1] + (to[1] - rim[1]) * k];
  const d1 = along(0.38);
  const d2 = along(0.76);
  const r1 = Math.max(10, rx * 0.105);
  const r2 = Math.max(7, rx * 0.066);
  return (
    <XG m={mat.about(mat.scale(s), to[0], to[1])}>
      <Fill d={blob(d2[0], d2[1], r2, r2, {seed: `${seed}/d2`})} color={EMBER.card} offset={false} />
      <Ink d={circle(d2[0], d2[1], r2, {seed: `${seed}/d2I`})} width={ink * 0.8} />
      <Fill d={blob(d1[0], d1[1], r1, r1, {seed: `${seed}/d1`})} color={EMBER.card} offset={false} />
      <Ink d={circle(d1[0], d1[1], r1, {seed: `${seed}/d1I`})} width={ink * 0.8} />
      <Fill d={cloud} color={EMBER.card} offset={false} />
      <Ink d={cloud} width={ink} />
      {children}
    </XG>
  );
};
export const ThoughtBubble = tiered('support', {tone: EMBER.card, lines: true}, ThoughtBubbleBody);

// ---------------------------------------------------------------- wall clock

/** A round wall clock: wood rim, warm-white face, 12 ticks; the second hand ticks once a second, the minute hand
 *  creeps (waiting). */
const WallClockBody: React.FC<{cx: number; cy: number; r?: number; at?: At; seed?: string; ink?: number; startMin?: number}> = ({cx, cy, r = 46, at, seed = 'clock', ink = 3.4, startMin = 41}) => {
  const t = useTime();
  const sec = Math.floor(t);
  const handD = (deg: number, len: number) => `M${cx} ${cy}L${cx + Math.sin((deg * Math.PI) / 180) * len} ${cy - Math.cos((deg * Math.PI) / 180) * len}`;
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const a = (i * 30 * Math.PI) / 180;
    const r0 = r * (i % 3 === 0 ? 0.68 : 0.76);
    ticks += `M${cx + Math.sin(a) * r0} ${cy - Math.cos(a) * r0}L${cx + Math.sin(a) * r * 0.84} ${cy - Math.cos(a) * r * 0.84}`;
  }
  const minDeg = (startMin + t / 6) * 6;
  const hourDeg = 7 * 30 + minDeg / 12;
  return (
    <>
      <Fill d={blob(cx, cy, r * 1.14, r * 1.14, {seed: `${seed}/rim`})} color={EMBER.beam} at={fillAt(at)} />
      <Fill d={blob(cx, cy, r, r, {seed: `${seed}/face`})} color={EMBER.card} at={fillAt(at, 0.02)} offset={false} />
      <Ink d={circle(cx, cy, r * 1.14, {seed: `${seed}/rI`}) + circle(cx, cy, r, {seed: `${seed}/fI`})} at={at} width={ink} />
      <Show at={fillAt(at, 0.04)}>
        <TPath d={ticks} stroke={EMBER.ink} strokeWidth={Math.max(1.6, r * 0.04)} strokeLinecap="round" />
        <TPath thing d={handD(hourDeg, r * 0.45) + handD(minDeg, r * 0.68)} stroke={EMBER.ink} strokeWidth={Math.max(2.4, r * 0.075)} strokeLinecap="round" />
        <TPath thing d={handD(sec * 6, r * 0.74)} stroke={EMBER.beam} strokeWidth={Math.max(1.4, r * 0.035)} strokeLinecap="round" />
        <TCircle cx={cx} cy={cy} r={Math.max(2.5, r * 0.07)} fill={EMBER.ink} />
      </Show>
    </>
  );
};
export const WallClock = tiered('environment', {tone: EMBER.card}, WallClockBody);

// ---------------------------------------------------------------- calendar (2026 -> 2027)

/** A wall calendar: anchor header with two rings, a warm-white page with the year; at `flipAt` the page flips up over
 *  the binding (0.18 s squash, no fade) and the next year is underneath. (x, y) = top-left, w = width (board: 170). */
const CalendarBody: React.FC<{x: number; y: number; w?: number; from?: string; to?: string; flipAt?: number; at?: At; seed?: string; ink?: number}> = ({x, y, w = 170, from = '2026', to = '2027', flipAt, at, seed = 'cal', ink = 3.4}) => {
  const t = useTime();
  const h = w * 0.92;
  const headH = h * 0.26;
  const flipped = flipAt !== undefined && t >= flipAt;
  const p = flipAt === undefined ? 0 : prog(t, flipAt, 0.18, ease.inCubic);
  const page = (yr: string, key: string, sy = 1) => (
    <XG m={mat.about(mat.scale(1, sy), x, y + headH)}>
      <Fill rect={[x, y + headH, w, h - headH]} color={EMBER.card} offset={false} seed={`${seed}/${key}`} />
      <Ink d={rectInk(x, y + headH, w, h - headH, {seed: `${seed}/${key}I`, over: [0, 3], edges: 'lrb'})} width={ink} />
      <Txt x={x + w / 2} y={y + headH + (h - headH) * 0.7} size={w * 0.36} fit={w * 0.86}>
        {yr}
      </Txt>
    </XG>
  );
  return (
    <>
      <Show at={fillAt(at)}>
        {page(to, 'next')}
        {!flipped || p < 1 ? page(from, 'cur', flipped ? Math.max(0.02, 1 - p) : 1) : null}
      </Show>
      <Fill rect={[x, y, w, headH]} color={EMBER.anchor} at={fillAt(at)} seed={`${seed}/head`} />
      <Ink d={rectInk(x, y, w, headH, {seed: `${seed}/hI`, over: [1, 4]})} at={at} width={ink} />
      {[0.3, 0.7].map((u, i) => (
        <React.Fragment key={i}>
          <Fill d={roundRect(x + w * u - 5, y - headH * 0.3, 10, headH * 0.6, 5)} color={EMBER.reveal} at={fillAt(at, 0.04)} offset={false} />
          <Ink d={roundRect(x + w * u - 5, y - headH * 0.3, 10, headH * 0.6, 5, {seed: `${seed}/ring${i}`})} at={b(at, 0.04)} width={2.2} />
        </React.Fragment>
      ))}
    </>
  );
};
export const Calendar = tiered((p) => (p.flipAt !== undefined ? 'support' : 'environment'), {tone: EMBER.card}, CalendarBody);
void line;
void smooth;
