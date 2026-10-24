// S10 hanging elephant plaques (the near row's three signs), drawn locally so the OLD one can carry every storyboard beat:
// swing out, paper flip to old, cobweb + Bit caught in it, dust, cane + lean, the droop on "they're", the cane wobble on
// the last word, and the support tags that land on the current ones. Same geometry and look as the props-lane
// ElephantPlaque 'hanging' (bracket from the wall, hook at 0.66 arm, chain, 100-unit face) and the sets-lane
// HangingPlaqueSlot placement (face centre (x, y), bracket from wallX).

import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, prog, TimeShift, useTime} from '../../lib/time';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {blob, line, polyPath, Pt, rect, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {Bit, Cobweb, ElephantEmblem, pendulum, popK, SupportTag} from './kit';

/** Bracket root for a hanging sign whose face centre is (x, y) (= sets/propSlots bracketFor). */
export function bracketFor(x: number, y: number, size: number, wallX: number): {x: number; y: number; side: 'left' | 'right'; arm: number} {
  const side = x >= wallX ? 'right' : 'left';
  const arm = Math.max(size * 0.6, Math.abs(x - wallX) / 0.66);
  return {x: x - (side === 'right' ? 1 : -1) * arm * 0.66, y: y - (66 * size) / 100, side, arm};
}

/** Support tag width (world px; props SupportTag: body w x 0.82 w under a 0.16 w loop). */
export const TAG_W = 42;
/** Hang point -> the tag body's centre (props SupportTag geometry). */
export const tagBodyOffset = (w: number) => w * (0.16 + 0.41);

const CHIPPED: Pt[] = [[-50, -50], [26, -50], [33, -42], [38, -44], [44, -36], [50, -30], [50, 50], [-50, 50]];

export type HangPlaqueProps = {
  /** Face centre (world) + size (face side, world px) + the wall point of the bracket. */
  x: number;
  y: number;
  size: number;
  wallX: number;
  /** Swings out here: pops about the hook (0.2 s) + the pendulum -16 -> 0. */
  at?: number;
  age?: 'new' | 'old';
  flipOldAt?: number;
  cobwebAt?: number;
  dustAt?: number;
  caneAt?: number;
  /** The emblem sags further on its cane (+6 deg, outBack) and a dust speck drifts down. */
  droopAt?: number;
  /** The emblem wobbles on its cane (decaying, 0.8 s). */
  wobbleAt?: number;
  /** A support tag lands at this face-local hang point (100-unit face coords) at `at`, its check at `tickAt`. */
  tag?: {at: number; tickAt: number; hang: Pt; size?: number};
  /** Bit: pops on the hook at `at`, crawls down the chain onto the face and into the web corner (arrives at + 0.4). */
  bit?: {at: number; size: number; /** struggle bursts, s after he is caught */ bursts?: number[]};
  seed?: string;
};

/** Face-local point -> world, for a plaque at rest (no swing / flip): where a flying tag must land. */
export function plaqueFacePoint(p: {x: number; y: number; size: number}, f: Pt): Pt {
  const s = p.size / 100;
  return [p.x + f[0] * s, p.y + f[1] * s];
}

export const HangPlaque: React.FC<HangPlaqueProps> = (p) => {
  const t = useTime();
  const {x, y, size, wallX, at, seed = 'hp'} = p;
  if (at !== undefined && t < at) return null;
  const b = bracketFor(x, y, size, wallX);
  const s = size / 100;
  const dir = b.side === 'right' ? 1 : -1;
  const armL = b.arm / s;
  const hookX = dir * armL * 0.66;
  const W = 3.4 / s;
  const brW = Math.max(W * 1.3, 2.4 / s);
  const k = popK(t, at, 0.08, 0.2);
  // the swing out (motion spec #14), settled well before the next beat on the plate so each beat reads on its own
  const sw = pendulum(t, at, -16, 0.5, 0.6) * dir;

  // ---- face state
  const flipQ = p.flipOldAt !== undefined ? prog(t, p.flipOldAt, 0.2, E.inOutSine) : 0;
  const old = p.age === 'old' || flipQ >= 0.5;
  const flipSx = p.flipOldAt !== undefined && flipQ > 0 && flipQ < 1 ? Math.max(0.02, Math.abs(Math.cos(Math.PI * flipQ))) : 1;
  const plateCol = old ? palette.tan : palette.sand;
  let lean = 0;
  if (old) lean = 12 * (p.caneAt === undefined ? 1 : prog(t, p.caneAt + 0.12, 0.2, E.outBack(1.4)));
  if (old && p.droopAt !== undefined) lean += 6 * prog(t, p.droopAt, 0.28, E.outBack(1.8));
  let wob = 0;
  if (p.wobbleAt !== undefined && t >= p.wobbleAt && t < p.wobbleAt + 0.9) {
    const d = t - p.wobbleAt;
    wob = 5 * Math.exp(-d * 4.2) * Math.sin(d * 26);
  }

  const plate = old ? polyPath(CHIPPED) : roundRect(-50, -50, 100, 100, 6);
  const plateInk = old ? polyPath(CHIPPED) : rect(-50, -50, 100, 100, {seed: `${seed}/pi`, over: 5});
  const screws = (old ? [[-38, -38], [38, 38], [-38, 38], [30, -32]] : [[-38, -38], [38, 38], [-38, 38], [38, -38]]).map(([a, c]) => blob(a, c, 3.6, 3.6, {seed: `${seed}/s${a}${c}`})).join('');
  const face: React.ReactNode[] = [];
  face.push(<Fill key="plate" d={plate} color={plateCol} offset={[2.4, 1.8]} seed={`${seed}/plate`} />);
  face.push(<Fill key="bevel" d={polyPath([[-50, -44], [-43, -44], [-43, 43], [44, 43], [44, 50], [-50, 50]])} color={old ? palette.brown : palette.tan} mode="snap" offset={false} seed={`${seed}/bev`} />);
  face.push(<Ink key="plateI" d={plateInk} width={W} seed={`${seed}/pi`} />);
  face.push(<Fill key="screws" d={screws} color={palette.ink} mode="snap" offset={false} seed={`${seed}/scr`} />);
  face.push(
    <XG key="emb" m={mat.about(mat.rotate(wob * 0.5), 37.7, 29.2)}>
      <ElephantEmblem size={74} y={4} bg={plateCol} style={old ? 'old' : 'modern'} seed={`${seed}/e`} ink={W * 0.8} cane={old} caneAt={p.caneAt} lean={lean + wob} />
    </XG>,
  );
  // Bit (under the web: caught IN it)
  if (p.bit && t >= p.bit.at) {
    const bs = p.bit.size / s;
    const path: Pt[] = [
      [hookX - 18 - hookX, -66],
      [hookX - 21.5 - hookX, -50],
      [-37, -37],
    ];
    const crawlAt = p.bit.at + 0.1;
    const arrive = crawlAt + 0.3;
    if (t < arrive) {
      face.push(<Bit key="bit" x={path[0][0]} y={path[0][1]} size={bs} flip state="scuttle" crawl={{at: crawlAt, path, speed: 118}} at={p.bit.at} seed={`${seed}/bit`} />);
    } else {
      // caught: legs flail, the body jerks in short bursts
      const d = t - arrive;
      // struggle bursts: right after he is caught, on 'old', on 'not' and on 'anymore' (a beat each)
      const bursts = p.bit.bursts ?? [0, 0.7, 1.4, 2.3];
      let burst = 0;
      let last = -1;
      for (const bt of bursts) {
        if (d >= bt && d < bt + 0.32) burst = Math.max(burst, Math.sin(((d - bt) / 0.32) * Math.PI));
        if (d >= bt) last = bt;
      }
      const jerk = 12 * burst * Math.sin(d * 2 * Math.PI * 7);
      const ang = (Math.atan2(path[2][1] - path[1][1], path[2][0] - path[1][0]) * 180) / Math.PI - 180;
      // between the bursts he is stuck STILL (his clock frozen at the end of the last burst): crisp beats, no idle fidget
      const still = burst <= 0 && last >= 0 ? arrive + last + 0.32 : undefined;
      const bitNode = <Bit x={path[2][0]} y={path[2][1]} size={bs} flip state={burst > 0.2 ? 'scuttle' : 'idle'} rot={ang + jerk} look="up" blink={false} seed={`${seed}/bit`} />;
      face.push(still !== undefined ? <TimeShift key="bit" by={t - still}>{bitNode}</TimeShift> : <React.Fragment key="bit">{bitNode}</React.Fragment>);
    }
  }
  if (old && (p.cobwebAt !== undefined || p.age === 'old')) face.push(<Cobweb key="web" x={-50} y={-50} r={46} corner="tl" at={p.cobwebAt} width={1.7 / s} seed={`${seed}/web`} />);
  // the flip shakes a puff of dust off the plate (specks fly out and shrink away: no fade)
  if (p.flipOldAt !== undefined && t >= p.flipOldAt + 0.12 && t < p.flipOldAt + 0.5) {
    const q = E.outCubic(prog(t, p.flipOldAt + 0.12, 0.28));
    const shrink = 1 - prog(t, p.flipOldAt + 0.36, 0.14);
    let d = '';
    ([[-1, -0.7], [1, -0.9], [-1.1, 0.4], [1.1, 0.5], [-0.4, 1.1], [0.5, 1.15]] as Pt[]).forEach(([dx, dy], i) => {
      const r = 4.2 * shrink;
      if (r > 0.3) d += blob(dx * (52 + q * 22), dy * (52 + q * 22), r, r, {seed: `${seed}/pf${i}`});
    });
    if (d) face.push(<Fill key="puff" d={d} color={palette.sand} mode="none" offset={false} seed={`${seed}/puff`} />);
  }
  if (old && p.dustAt !== undefined) {
    const pts: Pt[] = [[-26, 60], [14, 58], [52, 30]];
    pts.forEach(([dx, dy], i) => face.push(<Fill key={`dust${i}`} d={blob(dx, dy, 2.4, 2.4, {seed: `${seed}/du${i}`})} color={palette.ink} at={p.dustAt! + i * 0.04} mode="spring" offset={false} seed={`${seed}/du${i}`} />));
  }
  if (old && p.droopAt !== undefined && t >= p.droopAt && t < p.droopAt + 0.75) {
    // one speck drifts down from the chipped corner, then pops away (shrink, no fade)
    const q = prog(t, p.droopAt, 0.75);
    const r = 3 * (q < 0.85 ? 1 : 1 - (q - 0.85) / 0.15);
    face.push(<Fill key="drift" d={blob(40 + 6 * Math.sin(q * 7), 54 + q * 46, r, r, {seed: `${seed}/dr`})} color={palette.ink} mode="none" offset={false} seed={`${seed}/dr`} />);
  }

  // ---- bracket + chain + face, swinging about the hook
  const bracket =
    line(0, 0, dir * armL, 0, {over: [0, 3], seed: `${seed}/arm`}) +
    line(0, armL * 0.55, dir * armL * 0.5, 0, {over: [0, 0], seed: `${seed}/brace`}) +
    `M${dir * armL} 0q${dir * 8} 0 ${dir * 8} -8q0 -6 ${-dir * 5} -5`;
  const chain = 16;
  const tag = p.tag && t >= p.tag.at ? (
    <SupportTag x={hookX + p.tag.hang[0]} y={chain + 50 + p.tag.hang[1]} size={(p.tag.size ?? TAG_W) / s} at={p.tag.at} checkAt={p.tag.tickAt} seed={`${seed}/tag`} />
  ) : null;
  return (
    <XG m={mat.compose(mat.translate(b.x, b.y), mat.scale(s))}>
      <Ink d={bracket} width={brW} seed={`${seed}/br`} />
      <Fill d={roundRect(-6, -10, 12, armL * 0.75, 4)} color={palette.tealDark} mode="snap" offset={false} seed={`${seed}/plate0`} />
      <XG m={mat.compose(mat.about(mat.rotate(sw), hookX, 0), mat.about(mat.scale(k), hookX, 0))}>
        <Ink d={`M${hookX - 18} 0L${hookX - 22} ${chain}M${hookX + 18} 0L${hookX + 22} ${chain}`} width={W * 0.7} seed={`${seed}/ch`} order="all" />
        <XG m={mat.compose(mat.translate(hookX, chain + 50), mat.scale(flipSx, 1))}>{face}</XG>
        {tag}
      </XG>
    </XG>
  );
};
