// kit/People3.tsx: the film's extras in Autumn Ember, built on the house Person (back view always; docs/look/
// LIFE_AND_DENSITY.md §4): winter people (earmuffs, pompom beanies, umbrellas, shopping bags, coffee, clipboards,
// hi-vis, snow on hats and shoulders), the foreground row of backs (tier A), mid walkers (C), tiny far walkers (D,
// fill-only), people in lit windows (E: WindowSilhouette, WindowLife), and the factory's workers and guard.
//
//   <WinterPerson x={300} y={1700} s={2.6} wear={['earmuffs', 'snow']} seed="a1" />      hip line at y
//   <BackRow x0={40} x1={1040} top={1460} head={128} n={5} seed="s4row" moves={[...]} /> heads' tops at y = top
//   <Walker from={[100, 1180]} to={[980, 1180]} h={180} speed={70} seed="w1" />          a mid walker that wraps
//   <TinyWalkers from={[120, 1210]} to={[960, 1150]} n={12} h={[30, 18]} seed="tw" />   tier D, with a dog / sledge
//   <WindowSilhouette x={..} y={..} w={60} h={70} who="cross" />                          a neighbour in a lit window
//   <WindowLife windows={[...]} seed="o1win" force={[{i: 3, t: 4.6, on: false}]} />      a block of switching windows
//   <Worker x={760} y={980} h={90} carry seed="wk1" walk={{a: 700, b: 820, dur: 2.2}} /> hi-vis, crate on the shoulder
//   <Guard x={880} y={990} h={96} waveAt={24.2} />                                        hi-vis and cap, waves
//
// People never wear the hero orange or the blue pop; neighbours never share both hair and coat colour (seeded picks
// from WINTER below); the protagonist (kit/You.tsx: dark hair, rust sweater) is never copied: no extra wears rust.

import React, {useId, useMemo} from 'react';
import {Person, PersonProps, Hair, Acc} from '../../../lib/kit/Person';
import {rng} from '../../../lib/rng';
import {useTime} from '../../../lib/time';
import {mat, XG} from '../../../lib/xf';
import {blob, circle, roundRect, smooth, torso} from '../../../lib/sketch';
import {EMBER} from '../palette';
import {At, Pt} from './util';
import {bob, loopPos, puffs, ring, shuttle, sway, windowLit, WindowForce} from './idle';

// ---------------------------------------------------------------- the winter wardrobe (Ember families only)

export const WINTER = {
  coats: [EMBER.dc, EMBER.reveal, EMBER.beam, EMBER.desk, EMBER.skyLow, EMBER.dcSide, '#C98A64', EMBER.shelf, EMBER.wall, '#6B4A6E'] as string[],
  hats: [EMBER.dcSide, EMBER.beam, EMBER.pot, EMBER.skyLow, EMBER.hl, EMBER.wall, '#6B4A6E', EMBER.dc] as string[],
  hair: [EMBER.anchor, EMBER.beam, '#C98A64', EMBER.ink, '#7A3A24', EMBER.anchor] as string[],
  legs: [EMBER.dcSide, EMBER.anchor, EMBER.dc, EMBER.beam] as string[],
  bags: ['#C98A64', EMBER.wall, EMBER.reveal, EMBER.dc] as string[],
  /** Hi-vis: the warm peach with snow-white reflective bands (never the gold of the sticks). */
  hivis: EMBER.hl,
  hivisBand: EMBER.snow,
  /** A hard hat. */
  hardhat: EMBER.ring,
  /** Silhouettes in lit windows (one warm step under the lit pane). */
  sil: '#C98A64',
  silFar: '#E39A55',
};

export type Wear = 'earmuffs' | 'umbrella' | 'bag' | 'coffee' | 'clipboard' | 'hivis' | 'hardhat' | 'snow' | 'badge' | 'point' | 'wave';

// ---------------------------------------------------------------- Person geometry (mirrors lib/kit/Person makeSpec)

/** The house Person's torso width, torso height and head radius for a seed (local px at s = 1). Mirrors Person's
 *  makeSpec draw order exactly: w, then h (only when torsoH is not given), then hr. */
export function personGeo(seed: string | number, o: {torsoH?: number; legs?: boolean} = {}) {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const h = o.torsoH ?? (o.legs ? w * r.range(0.95, 1.08) : w * r.range(1.02, 1.16));
  const hr = w * r.range(0.23, 0.26);
  const round = r.range(0.36, 0.45);
  const hy = -h - hr * 0.86;
  return {w, h, hr, hy, round, headTop: hy - hr, legH: h * 0.62};
}

// ---------------------------------------------------------------- WinterPerson

export type PersonMove = {
  t: number;
  /** lean: in toward the subject (up and toward `dir`); recoil: back (down, 8 px, damped); nudge: a sideways shove;
   *  hop: a small hop; turn: a quick look-around wobble. */
  kind: 'lean' | 'recoil' | 'nudge' | 'hop' | 'turn';
  amp?: number;
  dir?: number;
};

export type WinterPersonProps = Omit<PersonProps, 'acc' | 'idle' | 'x' | 'y' | 's' | 'ink'> & {
  /** Hip line (canvas px) and scale (s 1: torso ~92 px wide, head ~46 px). */
  x: number;
  y: number;
  s?: number;
  /** House accessories (backpack, headphones, strap, phone, scarf, collar, hood). */
  acc?: Acc[];
  /** Winter extras drawn over the figure. */
  wear?: Wear[];
  /** The raised phone only between these times (the phone goes up on a word, drops on another). */
  phoneWin?: [number, number];
  /** The pointing arm from this time (S6: one arm points at the hook). */
  pointAt?: number;
  /** The waving arm from this time. */
  waveAt?: number;
  /** Breathing bob amplitude (px on screen; default 2: the row breathes, staggered by seed). */
  breathe?: number;
  moves?: PersonMove[];
  /** On-screen ink px (default by size: 4.8 front for heads >= 90 px, 3.4 mid, 2.2 far). */
  ink?: number;
  /** Colours by seed from WINTER unless given. */
  coat?: string;
  hat?: string;
  bagColor?: string;
};

/** Ink by on-screen head size (the depth ladder). */
const inkForHead = (headPx: number) => (headPx >= 90 ? 4.8 : headPx >= 40 ? 3.4 : headPx >= 18 ? 2.2 : 0);

export const WinterPerson: React.FC<WinterPersonProps> = (props) => {
  const {x, y, s = 1, wear = [], acc: accIn, phoneWin, pointAt, waveAt, breathe = 2, moves = [], ink, coat, hat, bagColor, seed = 'wp', ...rest} = props;
  const t = useTime();
  const clipId = 'wp' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const pick = useMemo(() => {
    const rr = rng(`winter/${seed}`);
    return {
      coat: coat ?? rr.pick(WINTER.coats),
      hat: hat ?? rr.pick(WINTER.hats),
      hair: rr.pick(WINTER.hair),
      legs: rr.pick(WINTER.legs),
      bag: bagColor ?? rr.pick(WINTER.bags),
      ph: rr.range(0, 6.28),
      hz: rr.range(0.32, 0.5),
    };
  }, [seed, coat, hat, bagColor]);
  const g = personGeo(seed, {torsoH: rest.torsoH, legs: rest.legs});
  const headPx = g.hr * 2 * s;
  const inkPx = ink ?? inkForHead(headPx);
  // the phone is raised only inside its window
  let acc: Acc[] = (accIn ?? []).slice();
  if (phoneWin) {
    const up = t >= phoneWin[0] && t < phoneWin[1];
    acc = acc.filter((a) => a !== 'phone');
    if (up) acc.push('phone');
  }
  // body colour must differ from the hair (Person also guards it)
  const hairColor = rest.hairColor ?? (pick.hair === pick.coat ? EMBER.ink : pick.hair);
  // moves: offsets in screen px
  let dx = 0;
  let dy = bob(t, breathe, pick.hz, pick.ph);
  let rot = 0;
  for (const m of moves) {
    const a = m.amp ?? 1;
    if (m.kind === 'lean') {
      const k = t < m.t ? 0 : Math.min(1, (t - m.t) / 0.18);
      dy -= 6 * a * k;
      dx += 4 * a * k * (m.dir ?? 0);
      rot += 2.5 * a * k * (m.dir ?? 0);
    } else if (m.kind === 'recoil') {
      const d = t - m.t;
      if (d >= 0) dy += 8 * a * Math.exp(-d * 2.2) * (d < 0.08 ? d / 0.08 : 1);
    } else if (m.kind === 'nudge') {
      dx += ring(t, m.t, 7 * a * (m.dir ?? 1), 2.2, 4.5);
    } else if (m.kind === 'hop') {
      const d = t - m.t;
      if (d >= 0 && d < 0.26) dy -= 10 * a * Math.sin((d / 0.26) * Math.PI);
    } else if (m.kind === 'turn') {
      rot += ring(t, m.t, 4 * a, 1.6, 3);
    }
  }
  const W = inkPx / s; // local ink
  const hy = g.hy;
  const hr = g.hr;
  const hw = g.w / 2;
  const over: React.ReactNode[] = [];
  const back: React.ReactNode[] = [];
  const fx = (k: string) => `${seed}/${k}`;
  if (wear.includes('umbrella')) {
    const cx = hw * 0.15;
    const cy = hy - hr * 1.9;
    const R = g.w * 0.95;
    const canopy = `M${cx - R} ${cy + R * 0.18}Q${cx - R * 0.9} ${cy - R * 0.62} ${cx} ${cy - R * 0.66}Q${cx + R * 0.9} ${cy - R * 0.62} ${cx + R} ${cy + R * 0.18}` + scallops(cx - R, cx + R, cy + R * 0.18, 5, R * 0.1) + 'Z';
    back.push(
      <g key="umb">
        <path d={`M${cx} ${cy - R * 0.66}L${cx + hw * 0.1} ${-g.h * 0.6}`} stroke={EMBER.anchor} strokeWidth={W * 1.1} strokeLinecap="round" />
      </g>,
    );
    over.push(
      <g key="umbC">
        <path d={canopy} fill={pick.hat === EMBER.wall ? EMBER.dcSide : pick.hat} transform={`translate(${2 / s} ${1.4 / s})`} />
        <path d={canopy} fill="none" stroke={EMBER.ink} strokeWidth={W} strokeLinejoin="round" />
        <path d={`M${cx} ${cy - R * 0.66}L${cx - R * 0.45} ${cy + R * 0.16}M${cx} ${cy - R * 0.66}L${cx + R * 0.45} ${cy + R * 0.16}`} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.6} />
        {wear.includes('snow') ? <path d={blob(cx, cy - R * 0.6, R * 0.55, R * 0.1, {seed: fx('us')})} fill={EMBER.snow} /> : null}
      </g>,
    );
  }
  if (wear.includes('bag')) {
    const side = 1;
    const bx = side * (hw * 1.02);
    const bw = g.w * 0.34;
    const bh = g.h * 0.36;
    const by = -g.h * 0.12;
    over.push(
      <g key="bag">
        <path d={`M${bx - bw * 0.3} ${by}Q${bx} ${by - bh * 0.7} ${bx + bw * 0.3} ${by}`} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.7} />
        <path d={roundRect(bx - bw / 2, by, bw, bh, 4)} fill={pick.bag} transform={`translate(${1.6 / s} ${1 / s})`} />
        <path d={roundRect(bx - bw / 2, by, bw, bh, 4, {closed: false, seed: fx('bagI')})} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.9} />
        <path d={`M${bx - bw * 0.3} ${by + bh * 0.42}L${bx + bw * 0.3} ${by + bh * 0.42}`} stroke={EMBER.ink} strokeWidth={W * 0.5} />
      </g>,
    );
  }
  if (wear.includes('coffee')) {
    const cx = -hw * 1.0;
    const cy = -g.h * 0.24;
    const cw = g.w * 0.13;
    const steam = puffs(t, {n: 3, life: 1.6, rise: g.h * 0.5, drift: -6, r0: 1.5, r1: 4.5, seed: fx('st')});
    over.push(
      <g key="cof">
        {steam.map((p, i) => (
          <circle key={i} cx={cx + p.x} cy={cy - cw * 0.5 + p.y} r={p.r} fill={EMBER.snow} />
        ))}
        <path d={`M${cx - cw / 2} ${cy}L${cx - cw * 0.4} ${cy + cw * 1.3}L${cx + cw * 0.4} ${cy + cw * 1.3}L${cx + cw / 2} ${cy}Z`} fill={EMBER.wall} />
        <path d={`M${cx - cw * 0.58} ${cy - cw * 0.15}h${cw * 1.16}v${cw * 0.3}h${-cw * 1.16}Z`} fill={EMBER.beam} />
        <path d={`M${cx - cw / 2} ${cy}L${cx - cw * 0.4} ${cy + cw * 1.3}L${cx + cw * 0.4} ${cy + cw * 1.3}L${cx + cw / 2} ${cy}`} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.7} />
        <path d={blob(cx + cw * 0.1, cy + cw * 0.95, cw * 0.55, cw * 0.45, {seed: fx('ch')})} fill={EMBER.skin} />
      </g>,
    );
  }
  if (wear.includes('clipboard')) {
    const cx = hw * 0.98;
    const cy = -g.h * 0.42;
    const bw = g.w * 0.3;
    const bh = g.w * 0.4;
    over.push(
      <g key="clip" transform={`rotate(${(-12 + sway(t, 2, 2.4, 1)).toFixed(2)} ${cx} ${cy})`}>
        <path d={`M${cx - bw / 2} ${cy}h${bw}v${bh}h${-bw}Z`} fill={EMBER.beam} />
        <path d={`M${cx - bw * 0.4} ${cy + bh * 0.08}h${bw * 0.8}v${bh * 0.86}h${-bw * 0.8}Z`} fill={EMBER.card} />
        <path d={`M${cx - bw * 0.28} ${cy + bh * 0.3}h${bw * 0.56}M${cx - bw * 0.28} ${cy + bh * 0.48}h${bw * 0.5}M${cx - bw * 0.28} ${cy + bh * 0.66}h${bw * 0.4}`} stroke={EMBER.ink} strokeWidth={W * 0.4} />
        <path d={`M${cx - bw * 0.16} ${cy - bh * 0.04}h${bw * 0.32}v${bh * 0.1}h${-bw * 0.32}Z`} fill={EMBER.anchor} />
        <path d={`M${cx - bw / 2} ${cy}h${bw}v${bh}h${-bw}Z`} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.8} />
      </g>,
    );
  }
  if (wear.includes('hivis')) {
    const vest = torso(0, 0, g.w * 0.8, g.h * 0.9, 0.3, 0.06);
    over.push(
      <g key="hv">
        <defs>
          <clipPath id={clipId}>
            <path d={vest} />
          </clipPath>
        </defs>
        <path d={vest} fill={WINTER.hivis} />
        <g clipPath={`url(#${clipId})`}>
          <rect x={-g.w} y={-g.h * 0.42} width={g.w * 2} height={g.h * 0.09} fill={WINTER.hivisBand} />
          <rect x={-g.w} y={-g.h * 0.22} width={g.w * 2} height={g.h * 0.09} fill={WINTER.hivisBand} />
        </g>
        <path d={vest} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.7} />
      </g>,
    );
  }
  if (wear.includes('point') && pointAt !== undefined && t >= pointAt) {
    // the arm (lengths from the torso WIDTH: long torsos cut by the frame keep a normal arm)
    const k = Math.min(1, (t - pointAt) / 0.12);
    const sx = hw * 0.7;
    const sy = -g.h + g.w * 0.28;
    const ex = sx + g.w * (0.25 + 0.2 * k);
    const ey = sy - g.w * (0.55 + 0.6 * k);
    over.push(
      <g key="pt">
        <path d={`M${sx} ${sy}L${ex} ${ey}`} stroke={EMBER.ink} strokeWidth={g.w * 0.19 + W * 2} strokeLinecap="round" />
        <path d={`M${sx} ${sy}L${ex} ${ey}`} stroke={pick.coat} strokeWidth={g.w * 0.19} strokeLinecap="round" />
        <path d={blob(ex + g.w * 0.02, ey - g.w * 0.05, g.w * 0.075, g.w * 0.095, {seed: fx('ph')})} fill={EMBER.skin} />
        <path d={`M${ex + g.w * 0.02} ${ey - g.w * 0.1}l${g.w * 0.04} ${-g.w * 0.12}`} stroke={EMBER.skin} strokeWidth={g.w * 0.05} strokeLinecap="round" />
      </g>,
    );
  }
  if (wear.includes('wave') && waveAt !== undefined && t >= waveAt) {
    const a = -25 + 22 * Math.sin((t - waveAt) * Math.PI * 2 * 1.8);
    const sx = -hw * 0.7;
    const sy = -g.h + g.w * 0.28;
    const len = g.w * 1.05;
    const ex = sx - Math.sin((a * Math.PI) / 180) * len * 0.4 - g.w * 0.15;
    const ey = sy - Math.cos((a * Math.PI) / 180) * len;
    over.push(
      <g key="wv">
        <path d={`M${sx} ${sy}L${ex} ${ey}`} stroke={EMBER.ink} strokeWidth={g.w * 0.19 + W * 2} strokeLinecap="round" />
        <path d={`M${sx} ${sy}L${ex} ${ey}`} stroke={pick.coat} strokeWidth={g.w * 0.19} strokeLinecap="round" />
        <path d={blob(ex, ey - 4, g.w * 0.075, g.w * 0.095, {seed: fx('wh')})} fill={EMBER.skin} />
      </g>,
    );
  }
  // head-level wear (over the head)
  if (wear.includes('earmuffs')) {
    const er = hr * 0.38;
    over.push(
      <g key="em">
        <path d={`M${-hr * 1.02} ${hy}A${hr * 1.06} ${hr * 1.06} 0 0 1 ${hr * 1.02} ${hy}`} fill="none" stroke={EMBER.ink} strokeWidth={W * 2.2} strokeLinecap="round" />
        <path d={`M${-hr * 1.02} ${hy}A${hr * 1.06} ${hr * 1.06} 0 0 1 ${hr * 1.02} ${hy}`} fill="none" stroke={pick.hat} strokeWidth={W * 1.1} strokeLinecap="round" />
        {[-1, 1].map((sg) => (
          <g key={sg}>
            <path d={blob(sg * hr * 1.0 + 1.2 / s, hy + hr * 0.1 + 1 / s, er, er * 1.1, {seed: fx(`em${sg}`)})} fill={pick.hat} />
            <path d={circle(sg * hr * 1.0, hy + hr * 0.1, er, {seed: fx(`emi${sg}`)})} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.85} />
          </g>
        ))}
      </g>,
    );
  }
  if (wear.includes('hardhat')) {
    const by = hy - hr * 0.05;
    over.push(
      <g key="hh">
        <path d={`M${-hr * 1.2} ${by}A${hr * 1.06} ${hr * 1.06} 0 0 1 ${hr * 1.2} ${by}Z`} fill={WINTER.hardhat} />
        <path d={`M${-hr * 1.32} ${by}L${hr * 1.32} ${by}M${-hr * 1.2} ${by}A${hr * 1.06} ${hr * 1.06} 0 0 1 ${hr * 1.2} ${by}`} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.9} strokeLinecap="round" />
      </g>,
    );
  }
  if (wear.includes('badge')) {
    // a small laptop badge on the back of a cap / beanie (the laptop van's driver), ink on cream
    const bx = 0;
    const by = hy - hr * 0.35;
    const bw = hr * 0.62;
    over.push(
      <g key="bd">
        <path d={roundRect(bx - bw / 2, by - bw * 0.36, bw, bw * 0.72, bw * 0.12)} fill={EMBER.card} />
        <path d={`M${bx - bw * 0.26} ${by - bw * 0.16}h${bw * 0.52}v${bw * 0.28}h${-bw * 0.52}Z M${bx - bw * 0.36} ${by + bw * 0.14}h${bw * 0.72}`} fill="none" stroke={EMBER.ink} strokeWidth={W * 0.45} />
      </g>,
    );
  }
  if (wear.includes('snow')) {
    // snow on the hat / head top, and on both shoulders CLIPPED to the coat's own silhouette (so it lies on the
    // shoulder line and never floats past it; it never grows into a beard either)
    const capTop = rest.hair === 'beanie' ? hy - hr * 1.0 : hy - hr * 0.92;
    const coat = torso(0, 0, g.w, g.h, g.round, 0.07);
    const sid = `${clipId}s`;
    over.push(
      <g key="sn">
        <defs>
          <clipPath id={sid}>
            <path d={coat} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${sid})`}>
          <path d={blob(-g.w * 0.3, -g.h + g.w * 0.02, g.w * 0.2, g.w * 0.07, {seed: fx('s1')})} fill={EMBER.snow} />
          <path d={blob(g.w * 0.32, -g.h + g.w * 0.03, g.w * 0.18, g.w * 0.065, {seed: fx('s2')})} fill={EMBER.snow} />
        </g>
        <path d={blob(hr * 0.1, capTop, hr * 0.62, hr * 0.2, {seed: fx('sh')})} fill={EMBER.snow} />
      </g>,
    );
  }
  return (
    <XG m={mat.compose(mat.translate(x + dx, y + dy), mat.rotate(rot), mat.scale(s))}>
      {back}
      <Person
        {...rest}
        x={0}
        y={0}
        s={1}
        lodScale={s}
        ink={inkPx / s}
        seed={seed}
        acc={acc}
        body={rest.body ?? pick.coat}
        hairColor={hairColor}
        legsColor={rest.legsColor ?? pick.legs}
        packColor={rest.packColor ?? pick.bag}
        idle={0}
      />
      {over}
    </XG>
  );
};

/** Scalloped hem of an umbrella canopy (from right to left, appended to the canopy path). */
function scallops(x0: number, x1: number, y: number, n: number, d: number): string {
  let s = '';
  const step = (x1 - x0) / n;
  for (let i = n - 1; i >= 0; i--) {
    const a = x0 + (i + 1) * step;
    const bx = x0 + i * step;
    s += `L${a} ${y}Q${(a + bx) / 2} ${y - d} ${bx} ${y}`;
  }
  return s;
}

// ---------------------------------------------------------------- BackRow (tier A)

export type BackRowPerson = Partial<Omit<WinterPersonProps, 'x' | 'y' | 's'>> & {dx?: number; dy?: number; sMul?: number};

export type BackRowProps = {
  /** Extent of the row (canvas px; cut by the frame edges is fine) and the line of the head tops. */
  x0: number;
  x1: number;
  top: number;
  /** Head size on screen (px; 90-160 for tier A). */
  head?: number;
  n?: number;
  seed?: string;
  /** Per-person overrides (hair, wear, acc, moves, phoneWin, pointAt, ...), in row order. */
  people?: BackRowPerson[];
  /** Moves for the whole row (each person staggered by `stagger` s: 2 frames at 60 fps by default). */
  moves?: PersonMove[];
  stagger?: number;
  /** All heads look toward this x (a slight lean of the whole figure, deg). */
  lookX?: number;
  /** Snow on every hat and shoulder (outdoors). */
  snow?: boolean;
  /** A person enters from below at this time (rises 0.33 s from behind the frame bottom): index -> time. */
  riseAt?: Record<number, number>;
  at?: At;
};

const ROW_HAIR: Hair[] = ['beanie', 'short', 'long', 'cap', 'bun', 'curly'];

/** A row of 3-6 backs along the bottom of an insert, shoulders nearly touching, looking at the subject; they breathe
 *  (staggered bobs), react on the voice's words (lean, recoil, nudge, phone up / down, point) and carry the density of a
 *  wall shot. Long torsos run past the frame bottom. */
export const BackRow: React.FC<BackRowProps> = ({x0, x1, top, head = 128, n = 5, seed = 'row', people = [], moves = [], stagger = 2 / 60, lookX, snow, riseAt, at}) => {
  const t = useTime();
  if (at !== undefined && t < at) return null;
  const out: React.ReactNode[] = [];
  const step = (x1 - x0) / n;
  const r = rng(`row/${seed}`);
  for (let i = 0; i < n; i++) {
    const p = people[i] ?? {};
    const pseed = `${seed}/${i}`;
    const torsoH = 210;
    const g = personGeo(pseed, {torsoH});
    const sMul = (p.sMul ?? 1) * r.range(0.93, 1.07);
    const s = (head / (g.hr * 2)) * sMul;
    const cx = x0 + step * (i + 0.5) + (p.dx ?? r.jitter(step * 0.08));
    const headTop = top + (p.dy ?? r.jitter(head * 0.18));
    let hipY = headTop - g.headTop * s;
    const rise = riseAt?.[i];
    if (rise !== undefined) {
      if (t < rise) continue;
      const k = Math.min(1, (t - rise) / 0.33);
      hipY += (1 - (1 - Math.pow(1 - k, 3))) * (head * 3.2);
    }
    const hair = p.hair ?? ROW_HAIR[(i + r.int(0, 5)) % ROW_HAIR.length];
    const wear: Wear[] = [...(p.wear ?? []), ...(snow ? (['snow'] as Wear[]) : [])];
    const mv = [...moves.map((m) => ({...m, t: m.t + i * stagger, dir: m.dir ?? (lookX !== undefined ? Math.sign(lookX - cx) : 0)})), ...(p.moves ?? [])];
    const lean = lookX !== undefined ? Math.max(-3, Math.min(3, (lookX - cx) / 160)) : 0;
    out.push(
      <XG key={i} m={mat.about(mat.rotate(lean), cx, hipY)}>
        <WinterPerson {...p} x={cx} y={hipY} s={s} seed={pseed} torsoH={torsoH} hair={hair} wear={wear} moves={mv} />
      </XG>,
    );
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- mid walkers (tier C)

export type WalkerProps = {
  /** Path ends (feet, canvas px). The walker wraps (`pause` s off the path between passes). */
  from: Pt;
  to: Pt;
  /** Figure height at `from` (px, feet to head top) and optionally at `to` (walking into depth). */
  h: number;
  h1?: number;
  /** px / s along the path. */
  speed?: number;
  phase?: number;
  pause?: number;
  /** A one-off crossing instead of a loop: [t0, t1]. */
  window?: [number, number];
  seed?: string;
  hair?: Hair;
  acc?: Acc[];
  wear?: Wear[];
  /** A dog on a lead beside the walker. */
  dog?: boolean;
  steps?: number;
  ink?: number;
};

/** A mid-ground walker (110-260 px): a full house figure walking (stepping legs, a bob), seen from behind, crossing a
 *  street or a window view, wrapping or crossing once. */
export const Walker: React.FC<WalkerProps> = ({from, to, h, h1, speed = 60, phase = 0, pause = 1.5, window, seed = 'walker', hair, acc, wear, dog, steps = 1.7, ink}) => {
  const t = useTime();
  let pos: {x: number; y: number; u: number} | null;
  if (window) {
    if (t < window[0] || t > window[1]) return null;
    const k = (t - window[0]) / (window[1] - window[0]);
    pos = {x: from[0] + (to[0] - from[0]) * k, y: from[1] + (to[1] - from[1]) * k, u: k};
  } else {
    const p = loopPos(t, from, to, speed, phase, pause);
    if (!p.on) return null;
    pos = p;
  }
  const g = personGeo(seed, {legs: true});
  const hh = h + ((h1 ?? h) - h) * pos.u;
  const s = hh / (g.legH - g.headTop); // feet to head top = legs + torso + head
  const hipY = pos.y - g.legH * s;
  const dir = Math.sign(to[0] - from[0]) || 1;
  return (
    <>
      {dog ? <Dog x={pos.x + dir * hh * 0.42} y={pos.y} h={hh * 0.26} t={t} dir={dir} /> : null}
      <WinterPerson x={pos.x} y={hipY} s={s} seed={seed} legs walk={steps} hair={hair} acc={acc} wear={wear} breathe={0} ink={ink ?? (hh >= 200 ? 3.4 : hh >= 90 ? 2.6 : 2.2)} />
    </>
  );
};

/** A small dog trotting (side view, flat with hair ink). */
export const Dog: React.FC<{x: number; y: number; h: number; t: number; dir?: number; color?: string}> = ({x, y, h, t, dir = 1, color = EMBER.beam}) => {
  const k = h / 30;
  const leg = Math.sin(t * 9) * 3;
  return (
    <g transform={`translate(${x} ${y}) scale(${dir * k} ${k})`}>
      <path d={`M-12 -2L-12 ${-9 + leg * 0.2}M-6 -2L-6 -9M8 -2L8 -9M13 -2L13 ${-9 - leg * 0.2}`} stroke={EMBER.ink} strokeWidth={3.2} strokeLinecap="round" />
      <path d={blob(0, -14, 16, 7, {seed: 'dogb'})} fill={color} />
      <path d={blob(16, -21, 7, 6, {seed: 'dogh'})} fill={color} />
      <path d={`M21 -22l5 2`} stroke={EMBER.ink} strokeWidth={2.4} strokeLinecap="round" />
      <path d={`M-15 -17q-5 ${-5 + Math.sin(t * 12) * 2} -8 -9`} fill="none" stroke={color} strokeWidth={3.4} strokeLinecap="round" />
      <path d={`M13 -27l2 -5 3 5`} fill={color} />
    </g>
  );
};

// ---------------------------------------------------------------- tiny far walkers (tier D, fill only)

export type TinyKind = 'walker' | 'dog' | 'sledge' | 'umbrella' | 'pair';

export type TinyWalkersProps = {
  /** The street's line (feet) from near to far, or left to right; figures shrink from h[0] to h[1] along it. */
  from: Pt;
  to: Pt;
  n?: number;
  /** Heights (px) at `from` and at `to` (15-60 for tier D). */
  h?: [number, number];
  /** px / s at h[0] (scaled with size). */
  speed?: number;
  seed?: string;
  /** Mix of kinds (cycled after a seeded shuffle). */
  kinds?: TinyKind[];
  /** Both directions (half walk back the other way). */
  both?: boolean;
  /** Lateral spread across the street (px at h[0]). */
  spread?: number;
};

/** A street's far life: 10-16 tiny figures (15-60 px) walking along it, fill-only flat shapes (head, coat, stepping
 *  legs), a few with a dog, one pulling a sledge, one under an umbrella. Deterministic, wrapping. */
export const TinyWalkers: React.FC<TinyWalkersProps> = ({from, to, n = 12, h = [40, 18], speed = 22, seed = 'tiny', kinds = ['walker', 'walker', 'dog', 'walker', 'sledge', 'umbrella', 'walker', 'pair'], both = true, spread = 30}) => {
  const t = useTime();
  const r = rng(`tiny/${seed}`);
  const items: {key: number; x: number; y: number; h: number; ph: number; coat: string; hair: string; kind: TinyKind; dir: number}[] = [];
  const order = r.shuffle(kinds);
  for (let i = 0; i < n; i++) {
    const kind = order[i % order.length];
    const rev = both && i % 2 === 1;
    const ph = r.next();
    const lat = r.jitter(1);
    const sp = speed * r.range(0.75, 1.25);
    const a = rev ? to : from;
    const bb = rev ? from : to;
    const L = Math.hypot(bb[0] - a[0], bb[1] - a[1]);
    const u = (((t * sp) / L + ph) % 1 + 1) % 1;
    const uu = rev ? 1 - u : u; // 0 at `from`
    const hh = h[0] + (h[1] - h[0]) * uu;
    const x = from[0] + (to[0] - from[0]) * uu + lat * spread * (hh / h[0]);
    const y = from[1] + (to[1] - from[1]) * uu + Math.abs(lat) * spread * 0.25 * (hh / h[0]);
    const coat = r.pick(WINTER.coats);
    const hair = r.pick([EMBER.anchor, EMBER.beam, EMBER.dcSide, '#C98A64']);
    items.push({key: i, x, y, h: hh, ph, coat, hair, kind, dir: (rev ? -1 : 1) * Math.sign(to[0] - from[0] || 1)});
  }
  // far (smaller) first
  items.sort((A, B) => A.h - B.h);
  return (
    <>
      {items.map((it) => (
        <Tiny key={it.key} x={it.x} y={it.y} h={it.h} t={t + it.ph * 3} coat={it.coat} hair={it.hair} kind={it.kind} dir={it.dir} />
      ))}
    </>
  );
};

/** One tiny figure (tier D/E, 12-60 px): flat head, coat and stepping legs; above 34 px a hair ink outline. */
export const Tiny: React.FC<{x: number; y: number; h: number; t: number; coat: string; hair?: string; kind?: TinyKind; dir?: number}> = ({x, y, h, t, coat, hair = EMBER.anchor, kind = 'walker', dir = 1}) => {
  const k = h / 40;
  const ph = Math.sin(t * 2 * Math.PI * 1.6);
  const ink = h >= 34;
  const fig = (ox: number, c: string) => (
    <g transform={`translate(${ox} 0)`}>
      <path d={`M-4 -14L${-4 + ph * 2.2} 0M4 -14L${4 - ph * 2.2} 0`} stroke={EMBER.anchor} strokeWidth={4.4} strokeLinecap="round" />
      <path d={`M-8 -13Q-9 -31 0 -31Q9 -31 8 -13Z`} fill={c} />
      <circle cx={0} cy={-35.5 + Math.abs(ph) * 0.6} r={5.4} fill={hair} />
      {ink ? <path d={`M-8 -13Q-9 -31 0 -31Q9 -31 8 -13`} fill="none" stroke={EMBER.ink} strokeWidth={1.6 / k} /> : null}
    </g>
  );
  return (
    <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${k.toFixed(3)})`}>
      {kind === 'sledge' ? (
        <g transform={`scale(${dir} 1)`}>
          <path d={`M-6 -16L-24 -5`} stroke={EMBER.ink} strokeWidth={1.4} />
          <path d={`M-40 -6h18v4h-18z`} fill={EMBER.beam} />
          <path d={`M-42 -1h22`} stroke={EMBER.ink} strokeWidth={1.8} strokeLinecap="round" />
        </g>
      ) : null}
      {kind === 'dog' ? (
        <g transform={`translate(${dir * 13} 0) scale(${dir} 1)`}>
          <path d={blob(0, -6, 7, 3.4, {seed: 'td'})} fill={EMBER.beam} />
          <circle cx={7} cy={-9} r={3} fill={EMBER.beam} />
          <path d={`M-4 -3v3M4 -3v3`} stroke={EMBER.anchor} strokeWidth={2} />
        </g>
      ) : null}
      {kind === 'pair' ? fig(-8, coat) : null}
      {fig(kind === 'pair' ? 8 : 0, kind === 'pair' ? EMBER.reveal : coat)}
      {kind === 'umbrella' ? <path d={`M-15 -40Q0 -56 15 -40Z`} fill={EMBER.dcSide} /> : null}
    </g>
  );
};

// ---------------------------------------------------------------- window people (tier E)

export type SilWho = 'cross' | 'read' | 'wave' | 'stand' | 'cook' | 'none';

export type WindowSilhouetteProps = {
  /** The pane (canvas px). */
  x: number;
  y: number;
  w: number;
  h: number;
  who?: SilWho;
  /** Lit: a value, or a function of time (WindowLife passes its schedule). Unlit panes show the night glass. */
  lit?: boolean | ((t: number) => boolean);
  /** The unlit pane colour (default the house body: dcSide; behind glass use EMBER.roofs). */
  dark?: string;
  litColor?: string;
  /** Curtains at the sides (a lit window 40-70 % filled, style bible). */
  curtains?: boolean;
  /** A plant on the sill (silhouette). */
  plant?: boolean;
  /** Fill only (behind glass / far): no ink, simpler figure. */
  far?: boolean;
  seed?: string;
  /** Crossing speed (pane widths per second) and the pause between crossings (s). */
  speed?: number;
  pause?: number;
  ink?: number;
};

/** A neighbour's lit window with a silhouette that lives: crosses the room, sits reading (a slow head bob, a page
 *  turn), waves, stands, cooks; the light pops on / off with the schedule. */
export const WindowSilhouette: React.FC<WindowSilhouetteProps> = ({x, y, w, h, who = 'cross', lit = true, dark = EMBER.roofs, litColor = EMBER.houseLit, curtains, plant, far = true, seed = 'ws', speed = 0.35, pause = 2.5, ink = 2.2}) => {
  const t = useTime();
  const id = 'ws' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const on = typeof lit === 'function' ? lit(t) : lit;
  const r = rng(`ws/${seed}`);
  const ph = r.next();
  const sil = far ? WINTER.silFar : WINTER.sil;
  const fh = h * 0.78; // figure height (head + shoulders visible)
  const fw = fh * 0.62;
  let fig: React.ReactNode = null;
  if (on && who !== 'none') {
    if (who === 'cross') {
      const span = w + fw * 2;
      const T = span / (w * speed) + pause;
      const v = (((t / T + ph) % 1) + 1) % 1 * T;
      const fx = x - fw + v * w * speed;
      if (v * w * speed <= span) fig = <Bust x={fx} y={y + h} h={fh} color={sil} bobT={t} />;
    } else if (who === 'read') {
      const bx = x + w * (0.3 + r.next() * 0.4);
      const nod = Math.sin(t * 0.9 + ph * 6) * fh * 0.02;
      fig = (
        <>
          <Bust x={bx} y={y + h + fh * 0.18} h={fh * 0.9} color={sil} bobT={t} nod={nod} />
          <rect x={bx - fw * 0.28} y={y + h - fh * 0.24} width={fw * 0.56} height={fh * 0.2} fill={EMBER.card} transform={`rotate(-8 ${bx} ${y + h - fh * 0.14})`} />
        </>
      );
    } else if (who === 'wave') {
      const bx = x + w * 0.5;
      const a = Math.sin(t * 2 * Math.PI * 1.4) * 25;
      fig = (
        <>
          <Bust x={bx} y={y + h} h={fh} color={sil} bobT={t} />
          <path d={`M${bx + fw * 0.3} ${y + h - fh * 0.45}l${fw * 0.3 * Math.sin((a * Math.PI) / 180) + fw * 0.12} ${-fh * 0.45}`} stroke={sil} strokeWidth={fw * 0.2} strokeLinecap="round" />
        </>
      );
    } else if (who === 'cook') {
      const bx = x + w * 0.5 + Math.sin(t * 0.7 + ph * 5) * w * 0.15;
      fig = <Bust x={bx} y={y + h} h={fh} color={sil} bobT={t} />;
    } else {
      fig = <Bust x={x + w * (0.35 + ph * 0.3)} y={y + h} h={fh} color={sil} bobT={t} />;
    }
  }
  return (
    <g>
      <defs>
        <clipPath id={id}>
          <rect x={x} y={y} width={w} height={h} />
        </clipPath>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={on ? litColor : dark} />
      <g clipPath={`url(#${id})`}>
        {fig}
        {on && curtains ? (
          <>
            <path d={`M${x} ${y}h${w * 0.2}q${-w * 0.06} ${h * 0.5} ${w * 0.04} ${h}h${-w * 0.24}z`} fill={EMBER.hl} />
            <path d={`M${x + w} ${y}h${-w * 0.2}q${w * 0.06} ${h * 0.5} ${-w * 0.04} ${h}h${w * 0.24}z`} fill={EMBER.hl} />
          </>
        ) : null}
        {plant ? <path d={blob(x + w * 0.78, y + h - h * 0.12, w * 0.1, h * 0.14, {seed: `${seed}/pl`})} fill={on ? EMBER.leaf : dark} /> : null}
      </g>
      {!far ? <path d={`M${x} ${y}h${w}v${h}h${-w}Z`} fill="none" stroke={EMBER.ink} strokeWidth={ink} /> : null}
    </g>
  );
};

/** Head and shoulders (a window silhouette), bottom-centre at (x, y). */
const Bust: React.FC<{x: number; y: number; h: number; color: string; bobT: number; nod?: number}> = ({x, y, h, color, bobT, nod = 0}) => {
  const b2 = Math.sin(bobT * 2.1 + x * 0.01) * h * 0.012;
  const sw = h * 0.62;
  const hr = h * 0.17;
  return (
    <g transform={`translate(${x.toFixed(1)} ${(y + b2).toFixed(1)})`}>
      <path d={`M${-sw / 2} 0Q${-sw / 2} ${-h * 0.5} 0 ${-h * 0.52}Q${sw / 2} ${-h * 0.5} ${sw / 2} 0Z`} fill={color} />
      <circle cx={0} cy={-h * 0.52 - hr * 0.9 + nod} r={hr} fill={color} />
    </g>
  );
};

export type LifeWindow = {x: number; y: number; w: number; h: number; who?: SilWho; curtains?: boolean; plant?: boolean};

/** A block of neighbours' windows on one switching schedule (one window somewhere every 0.6-1.5 s), some with
 *  silhouettes. `force` pins scripted switches (O1: a neighbour's window goes off at 4.6). */
export const WindowLife: React.FC<{windows: LifeWindow[]; seed?: string; gap?: [number, number]; litFrac?: number; force?: WindowForce[]; far?: boolean; dark?: string; ink?: number}> = ({windows, seed = 'life', gap, litFrac = 0.72, force, far = true, dark, ink}) => (
  <>
    {windows.map((wd, i) => (
      <WindowSilhouette key={i} {...wd} who={wd.who ?? 'none'} far={far} dark={dark} ink={ink} seed={`${seed}/${i}`} lit={(tt) => windowLit(tt, seed, i, windows.length, {gap, litFrac, force})} />
    ))}
  </>
);

// ---------------------------------------------------------------- factory people

export type WorkerProps = {
  /** Feet (canvas px) and height (50-110 px). */
  x: number;
  y: number;
  h?: number;
  /** A crate on the shoulder (gold sticks showing). */
  carry?: boolean;
  /** Pace back and forth between a and b (dur s each way, a short hold at each end). */
  walk?: {a: number; b: number; dur?: number; hold?: number; phase?: number};
  /** Stop and turn at this time (S14: the workers stop and turn to the chip maker). */
  stopAt?: number;
  seed?: string;
  hardhat?: boolean;
};

/** A worker in hi-vis and a hard hat (back view), optionally pacing with a crate of sticks on the shoulder. */
export const Worker: React.FC<WorkerProps> = ({x, y, h = 90, carry, walk, stopAt, seed = 'worker', hardhat = true}) => {
  const t = useTime();
  const tt = stopAt !== undefined && t > stopAt ? stopAt : t;
  let fx = x;
  let moving = false;
  if (walk) {
    const sh = shuttle(tt, walk.a, walk.b, walk.dur ?? 2.2, walk.hold ?? 0.6, walk.phase ?? 0);
    fx = sh.x;
    moving = !sh.holding;
  }
  const g = personGeo(seed, {legs: true});
  const s = h / (g.legH - g.headTop);
  const hipY = y - g.legH * s;
  const turned = stopAt !== undefined && t > stopAt;
  const crateW = g.w * 0.62 * s;
  return (
    <g>
      <WinterPerson x={fx} y={hipY} s={s} seed={seed} legs walk={moving ? 1.8 : undefined} hair="short" wear={['hivis', ...(hardhat ? (['hardhat'] as Wear[]) : [])]} breathe={0.8} ink={h >= 90 ? 2.6 : 2.2} moves={turned ? [{t: stopAt!, kind: 'turn', amp: 1.2}] : []} />
      {carry ? <MiniCrate x={fx + g.w * 0.28 * s} y={hipY - g.h * s * 0.98} w={crateW} /> : null}
    </g>
  );
};

/** A small crate of gold sticks (on a shoulder, a forklift, a pallet): kit/Street.tsx has the full StickCrate. */
export const MiniCrate: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => {
  const h = w * 0.55;
  return (
    <g>
      <path d={`M${x - w * 0.36} ${y - h * 1.12}h${w * 0.2}v${h * 0.3}h${-w * 0.2}zM${x - w * 0.08} ${y - h * 1.18}h${w * 0.2}v${h * 0.34}h${-w * 0.2}zM${x + w * 0.18} ${y - h * 1.1}h${w * 0.18}v${h * 0.28}h${-w * 0.18}z`} fill={EMBER.board} />
      <rect x={x - w / 2} y={y - h} width={w} height={h} fill={EMBER.beam} />
      <path d={`M${x - w / 2} ${y - h}h${w}v${h}h${-w}ZM${x - w / 2} ${y - h * 0.5}h${w}`} fill="none" stroke={EMBER.ink} strokeWidth={1.8} />
    </g>
  );
};

/** The gate guard (back view, cap and hi-vis): stands by the booth, steps out at `stepAt` (toward stepTo), waves from
 *  `waveAt`. */
export const Guard: React.FC<{x: number; y: number; h?: number; stepAt?: number; stepTo?: number; waveAt?: number; seed?: string}> = ({x, y, h = 96, stepAt, stepTo, waveAt, seed = 'guard'}) => {
  const t = useTime();
  const g = personGeo(seed, {legs: true});
  const s = h / (g.legH - g.headTop);
  let fx = x;
  let moving = false;
  if (stepAt !== undefined && stepTo !== undefined && t >= stepAt) {
    const k = Math.min(1, (t - stepAt) / 0.5);
    fx = x + (stepTo - x) * (1 - Math.pow(1 - k, 2));
    moving = k < 1;
  }
  return <WinterPerson x={fx} y={y - g.legH * s} s={s} seed={seed} legs walk={moving ? 2.2 : undefined} hair="cap" wear={['hivis', 'wave']} waveAt={waveAt} breathe={0.8} ink={2.6} />;
};
