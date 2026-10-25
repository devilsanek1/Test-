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
import {blob, line, Pt, roundRect} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {Bit, Cobweb, pendulum, popK, SupportTag} from './kit';
import {plateFace} from './plate';

/** Bracket root for a hanging sign whose face centre is (x, y) (= sets/propSlots bracketFor). */
export function bracketFor(x: number, y: number, size: number, wallX: number): {x: number; y: number; side: 'left' | 'right'; arm: number} {
  const side = x >= wallX ? 'right' : 'left';
  const arm = Math.max(size * 0.6, Math.abs(x - wallX) / 0.66);
  return {x: x - (side === 'right' ? 1 : -1) * arm * 0.66, y: y - (66 * size) / 100, side, arm};
}

/** Support tag width (world px; props SupportTag: body w x 0.82 w under a 0.16 w loop). Fix round 3: 58 (was 42) for the
 *  near plaques and the two lobs, so 'tick / no tick / tick' reads at thumbnail size (the far wave keeps 30). */
export const TAG_W = 58;
/** The flat peach backing disc behind a landed tag: radius (x tag width), pop, hold, shrink (s). */
export const TAG_DISC = {r: 0.74, pop: 0.12, hold: 0.3, out: 0.1};
/** Hang point -> the tag body's centre (props SupportTag geometry). */
export const tagBodyOffset = (w: number) => w * (0.16 + 0.41);

/** The cobweb tuft radius (face units) and where Bit's strand ties into its outer ring; Bit's spot on the top edge. */
const TUFT_R = 32;
const TUFT_TIE: Pt = [-50 + Math.cos((45 * Math.PI) / 180) * TUFT_R * 0.38, -50 + Math.sin((45 * Math.PI) / 180) * TUFT_R * 0.38];
/** Bit's spot (face units): fix round 2b, he DANGLES head-down from the tuft's strand 3 px off the plate's left edge
 *  (x -53), his shell on siteM's cream wall with a clear gap from the ochre plate, his head clear of the door's dark
 *  cornice line (y -41 keeps the head >= 4 px above it). */
const BIT_EDGE_Y = -41;
const BIT_EDGE_X = -53;
/** Where he hangs, stuck (fix round 3, face units): his feet 14 units left of the plate's left edge, so his idle body
 *  (22 px, facing left, tipped 16 deg) sits on siteM's cream wall clear of the ochre plate. */
const BIT_HANG: Pt = [-62, -35];  // A1 FR1: -62 (was -64): 17 px off the 1.2x plate's edge, as at 1x

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
  /** A support tag lands at this face-local hang point (100-unit face coords) at `at`, its check at `tickAt`; `ringAt`
   *  = one stepped ink ring pulse around it (two rings, 0.08 s apart, thinning as they grow: no fade). */
  tag?: {at: number; tickAt: number; hang: Pt; size?: number; ringAt?: number; /** A1 FR1: the corner screw its twine is tied to (face units) */ screw?: Pt};
  /** Small nudges of the whole plate (pendulum 4 deg, 0.3 s): the 'skip' as a tag sails over it. */
  nudgeAt?: number[];
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
  // the swing out (motion spec #14), settled (0.72 s) well before the next beat on the plate so each beat reads on its own
  // + a small nudge when the cane pops on 'old' (the whole 120 px plate answers the beat, not just a thin cane line)
  let sw = pendulum(t, at, -16, 0.5, 0.45) + (p.caneAt !== undefined ? pendulum(t, p.caneAt, 5, 0.3, 0.25) : 0);
  for (const n of p.nudgeAt ?? []) sw += pendulum(t, n, 4, 0.3, 0.25);
  sw *= dir;

  // ---- face state
  const flipQ = p.flipOldAt !== undefined ? prog(t, p.flipOldAt, 0.2, E.inOutSine) : 0;
  const old = p.age === 'old' || flipQ >= 0.5;
  const flipSx = p.flipOldAt !== undefined && flipQ > 0 && flipQ < 1 ? Math.max(0.02, Math.abs(Math.cos(Math.PI * flipQ))) : 1;
  let lean = 0;
  if (old) lean = 12 * (p.caneAt === undefined ? 1 : prog(t, p.caneAt + 0.12, 0.2, E.outBack(1.4)));
  if (old && p.droopAt !== undefined) lean += 6 * prog(t, p.droopAt, 0.28, E.outBack(1.8));
  let wob = 0;
  if (p.wobbleAt !== undefined && t >= p.wobbleAt && t < p.wobbleAt + 0.9) {
    const d = t - p.wobbleAt;
    wob = 5 * Math.exp(-d * 4.2) * Math.sin(d * 26);
  }

  const face: React.ReactNode[] = plateFace({old, W, seed, emblem: old ? 74 : 62, lean, cane: old, caneAt: p.caneAt, wob});
  // the cobweb: a cream corner TUFT on the dark old plate (under Bit's strand, which ties into its outer ring)
  if (old && (p.cobwebAt !== undefined || p.age === 'old')) face.push(<Cobweb key="web" x={-50} y={-50} r={TUFT_R} corner="tl" at={p.cobwebAt} width={1.9 / s} color={palette.cream} seed={`${seed}/web`} />);
  // Bit (fix round 2: at the web's EDGE, not in its centre): he drops onto the left chain, crawls down it, along the
  // plate's top edge into the corner tuft and over the corner onto the plate's LEFT edge, where ONE cream strand from the
  // tuft holds his back leg: side-on, head down (trying to get away), his feet on the edge and his body against siteM's
  // cream wall above the door, so his beetle silhouette (split shell, two antennae, eye) has clear ground around it.
  // He lunges down against the strand in short bursts.
  if (p.bit && t >= p.bit.at) {
    const bs = p.bit.size / s;
    const stuck: Pt = BIT_HANG;
    const path: Pt[] = [
      [-19, -66],
      [-21.5, -51],
      [-50.5, -51],
      [-50.5, BIT_EDGE_Y],
      stuck,
    ];
    const crawlAt = p.bit.at + 0.1;
    const arrive = crawlAt + 0.32;
    if (t < arrive) {
      face.push(<Bit key="bit" x={path[0][0]} y={path[0][1]} size={bs} state="scuttle" crawl={{at: crawlAt, path, speed: 240}} at={p.bit.at} seed={`${seed}/bit`} />);
    } else {
      const d = t - arrive;
      // struggle bursts: right after he is caught, on 'old', on 'not' and on 'anymore' (a beat each)
      const bursts = p.bit.bursts ?? [0, 0.7, 1.4, 2.3];
      let burst = 0;
      let last = -1;
      for (const bt of bursts) {
        if (d >= bt && d < bt + 0.32) burst = Math.max(burst, Math.sin(((d - bt) / 0.32) * Math.PI));
        if (d >= bt) last = bt;
      }
      // fix round 3: between the bursts he is BIT as in every other scene (idle, legs tucked, shell highlight, eye
      // looking forward), facing away from the web, tipped 16 deg head-down on the strand that holds him by his back,
      // with one cream strand wrapped across his shell: visibly stuck, not the web's spider. In a burst he lunges down
      // against the strand, wiggles, rocks, and only then SPLAYS four flailing legs.
      const lunge = 3.4 * burst * (0.5 + 0.5 * Math.sin(d * 2 * Math.PI * 6));
      const wig = (3 / s) * burst * Math.sin(d * 2 * Math.PI * 8);
      const rock = 12 * burst * Math.sin(d * 2 * Math.PI * 7);
      // between the bursts he is stuck STILL (his clock frozen at the end of the last burst): crisp beats, no idle fidget
      const still = burst <= 0 && last >= 0 ? arrive + last + 0.32 : undefined;
      const bx = BIT_HANG[0] + wig;
      const by = BIT_HANG[1] + lunge;
      const rot = -16 + rock;
      const k = bs / 20;
      const m = mat.compose(mat.translate(bx, by), mat.rotate(rot), mat.scale(-1, 1));
      // Bit-local (facing right, feet at y 0) -> face coords
      const ra = (rot * Math.PI) / 180;
      const toFace = (q: Pt): Pt => {
        const qx = -q[0];
        return [bx + qx * Math.cos(ra) - q[1] * Math.sin(ra), by + qx * Math.sin(ra) + q[1] * Math.cos(ra)];
      };
      // the strand from his back (rear top of the shell) into the tuft's outer ring: a thin INK thread over siteM's cream
      // wall (a cream one vanished there and he seemed to float), cream where it crosses onto the dark plate
      const rear = toFace([-8 * k, -9 * k]);
      const qx = (-50 - rear[0]) / (TUFT_TIE[0] - rear[0]);
      const edge: Pt = [-50, rear[1] + (TUFT_TIE[1] - rear[1]) * qx];
      face.push(<Ink key="strand0" d={`M${rear[0].toFixed(1)} ${rear[1].toFixed(1)}L${edge[0].toFixed(1)} ${edge[1].toFixed(1)}`} width={1.2 / s} taper={false} vary={0} seed={`${seed}/strand0`} />);
      face.push(<Ink key="strand" d={`M${edge[0].toFixed(1)} ${edge[1].toFixed(1)}L${TUFT_TIE[0].toFixed(1)} ${TUFT_TIE[1].toFixed(1)}`} width={1.5 / s} color={palette.cream} taper={false} vary={0} seed={`${seed}/strand`} />);
      const bitNode = <Bit x={0} y={0} size={bs} state={burst > 0.2 ? 'scuttle' : 'idle'} look="forward" blink={false} seed={`${seed}/bit`} />;
      let legsD = '';
      if (burst > 0.05) {
        [[-5, -38], [-1.5, -12], [2, 14], [5.5, 40]].forEach(([along, ang], i) => {
          const a = ((90 + ang + 18 * Math.sin(d * 2 * Math.PI * 9 + i * 1.7)) * Math.PI) / 180;
          const r0: Pt = [along * k, -0.8 * k];
          const len = 6.5 * k * Math.min(1, burst * 1.6);
          const bend = ang < 0 ? -0.5 : 0.5;
          const mid: Pt = [r0[0] + Math.cos(a) * len * 0.55, r0[1] + Math.sin(a) * len * 0.55];
          const tip: Pt = [mid[0] + Math.cos(a + bend) * len * 0.55, mid[1] + Math.sin(a + bend) * len * 0.55];
          legsD += `M${r0[0].toFixed(2)} ${r0[1].toFixed(2)}L${mid[0].toFixed(2)} ${mid[1].toFixed(2)}L${tip[0].toFixed(2)} ${tip[1].toFixed(2)}`;
        });
      }
      face.push(
        <XG key="bit" m={m}>
          {legsD ? <Ink d={legsD} width={1.3 / s} taper={false} vary={0} seed={`${seed}/bitlegs`} /> : null}
          {still !== undefined ? <TimeShift by={t - still}>{bitNode}</TimeShift> : bitNode}
          {/* one cream strand wrapped across his shell */}
          <Ink d={`M${(-8.6 * k).toFixed(2)} ${(-1.6 * k).toFixed(2)}Q${(-1.2 * k).toFixed(2)} ${(-4.6 * k).toFixed(2)} ${(5.4 * k).toFixed(2)} ${(-11.2 * k).toFixed(2)}`} width={1.8 / s} color={palette.cream} taper={false} vary={0} seed={`${seed}/wrap`} />
        </XG>,
      );
    }
  }
  // the flip shakes a puff of dust off the plate (specks fly out and shrink away: no fade)
  if (p.flipOldAt !== undefined && t >= p.flipOldAt + 0.12 && t < p.flipOldAt + 0.5) {
    const q = E.outCubic(prog(t, p.flipOldAt + 0.12, 0.28));
    const shrink = 1 - prog(t, p.flipOldAt + 0.36, 0.14);
    let d = '';
    // (the specks stay within ~14 units of the plate on the right: the gap walker stands just right of it)
    ([[-1, -0.7], [0.9, -0.9], [-1.1, 0.4], [0.95, 0.4], [-0.4, 1.1], [0.5, 1.1]] as Pt[]).forEach(([dx, dy], i) => {
      const r = 4.2 * shrink;
      const sp = dx > 0 ? 50 + q * 12 : 52 + q * 22;
      if (r > 0.3) d += blob(dx * sp, dy * (52 + q * 18), r, r, {seed: `${seed}/pf${i}`});
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
  let tag: React.ReactNode = null;
  if (p.tag && t >= p.tag.at) {
    const tw = (p.tag.size ?? TAG_W) / s;
    const hx = hookX + p.tag.hang[0];
    const hy = chain + 50 + p.tag.hang[1];
    const rings: React.ReactNode[] = [];
    if (p.tag.ringAt !== undefined) {
      for (let i = 0; i < 2; i++) {
        const q = (t - p.tag.ringAt - i * 0.08) / 0.2;
        // stepped: the ring jumps in 3 sizes (12 Hz), its stroke thinning to nothing
        const qs = Math.floor(q * 3) / 3;
        if (q >= 0 && q < 1) rings.push(<circle key={`rg${i}`} cx={hx} cy={hy + tagBodyOffset(tw)} r={tw * (0.62 + 0.5 * qs)} fill="none" stroke={palette.ink} strokeWidth={(3.2 / s) * (1 - qs)} />);
      }
    }
    // the flat peach backing disc (fix round 3): pops with a 7 % overshoot on the landing, holds 0.3 s behind the tick,
    // then shrinks away (no fade)
    const da = p.tag.at;
    let dk = 0;
    if (t < da + TAG_DISC.pop) dk = popK(t, da, 0.07, TAG_DISC.pop);
    else if (t < da + TAG_DISC.pop + TAG_DISC.hold) dk = 1;
    else dk = 1 - E.inCubic(prog(t, da + TAG_DISC.pop + TAG_DISC.hold, TAG_DISC.out));
    const disc = dk > 0.01 ? <circle cx={hx} cy={hy + tagBodyOffset(tw)} r={tw * TAG_DISC.r * dk} fill={palette.peach} /> : null;
    // A1 FR1: the twine from the plate's outer corner screw to the tag's eyelet (a slight sag), so the tag hangs BESIDE
    // the plate, not over its emblem
    const sc: Pt | undefined = p.tag.screw ? [hookX + p.tag.screw[0], chain + 50 + p.tag.screw[1]] : undefined;
    const twine = sc ? `M${sc[0].toFixed(1)} ${sc[1].toFixed(1)}Q${((sc[0] + hx) / 2).toFixed(1)} ${(Math.max(sc[1], hy) + 7).toFixed(1)} ${hx.toFixed(1)} ${hy.toFixed(1)}` : '';
    tag = (
      <>
        {disc}
        {twine ? <Ink d={twine} width={1.9 / s} color={palette.brown} taper={false} vary={0} seed={`${seed}/twine`} /> : null}
        {sc ? <Fill d={blob(sc[0], sc[1], 4.2, 4.2, {seed: `${seed}/knot`})} color={palette.ink} mode="none" offset={false} seed={`${seed}/knot`} /> : null}
        {rings}
        {/* landed at FULL size (the flying tag hands over to it: a pop from 0 left 1-2 frames with no tag), swinging
            -16 -> 0 about its hang point like the kit tag's entry */}
        <XG m={mat.about(mat.rotate(pendulum(t, p.tag.at, -16, 0.5, 0.8)), hx, hy)}>
          <SupportTag x={hx} y={hy} size={tw} checkAt={p.tag.tickAt} seed={`${seed}/tag`} />
        </XG>
      </>
    );
  }
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
