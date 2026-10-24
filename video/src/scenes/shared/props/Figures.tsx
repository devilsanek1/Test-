// props/Figures.tsx — back-view figure PRESETS (P11) built on the kit <Person> (and cine tinyFigure for specks).
// People are always seen from behind. Anchors are the FEET (x, y on the ground) and `h` = total height in world px,
// except EdgeOnlooker (head centre + head diameter; the torso runs off the frame bottom).
//
//   <EdgeOnlooker x={80} y={1290} head={110} riseAt={0.2} raisePhoneAt={31.9} />        // tier A, cropped by the bottom
//   <Citizen x={600} y={1260} h={48} riseAt={1.06} />  <Citizen ... silhouette />        // 40-55 px, or a flat sage cut-out
//   <Investigator x={230} y={1470} h={130} riseAt={22.2} raiseAt={22.9} />               // shield badge, sparkle tablet
//   <Messenger x={905} y={1470} h={130} pullAt={25.30} walk={{at: 25.5, to: [1200, 1470]}} />
//   <Maker x={800} y={1260} h={50} bust />  <Maker ... h={200} walkHz={1.8} />           // cream apron over teal
//   <Keeper x={480} y={1450} h={300} reachAt={48.5} holding={<NewLockIcon/>} installAt={49.0} />
//   <Caretaker x={670} y={1380} h={225} raiseKeysAt={68.2} jingleAt={69.0} glintAt={69.3} />
//   <Attempter x={300} y={1290} h={30} mode="tap" tapAt={[37.1, 37.6]} />  <AttemptStipple spots=[...] />
//   <Ghost x={500} y={1420} h={180} at={18.2} />                                         // ink-only (S04)
// Common anims: riseAt (rises its own height from behind its feet line, out(exp) 0.33 s), walk (steps in place; move
// x / y yourself or pass walk.to), bob (idle px), raisePhoneAt / raiseAt (an arm swings up, 0.3 s).

import React, {useId} from 'react';
import {canvas, palette, stroke, world} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {rng, rand, Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {Look, ExitFade, useLook} from '../../../lib/exit';
import {MOTION} from '../../../lib/spec';
import {Acc, Hair, Person, PERSON_BODIES} from '../../../lib/kit';
import {tinyFigure} from '../../../lib/cine/figures';
import {PathBuf} from '../../../lib/cine/util';
import {arc, blob, circle, line, polyPath, rectPath, roundRect, torso, Pt} from '../../../lib/sketch';
import {mat, useXf, XG} from '../../../lib/xf';
import {TodAnchor} from '../../../lib/tod';
import {Depth, DEPTH_INK} from './common';
import {SparkleTablet} from './Tablet';
import {Envelope} from './Envelope';

// ---------------------------------------------------------------- geometry shared with the kit Person

/** Torso height / leg length the presets pass to Person (so the geometry below is exact). */
const TORSO = 95;
const LEG = 62;
/** Total height of a preset figure at s = 1 (feet to head top), approx. */
export const FIG_H = 199;

/** The kit Person's random torso width, head radius and shoulder rounding for a seed (mirrors makeSpec's first three
 *  draws when torsoH is given). Keeps hand-placed extras (arms, caps, belts) on the body. */
function personGeo(seed: Seed, torsoH = TORSO) {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  const round = r.range(0.36, 0.45);
  const hy = -torsoH - hr * 0.86;
  return {w, hr, hy, h: torsoH, round, shoulderL: [-w * 0.36, -torsoH * 0.8] as Pt, shoulderR: [w * 0.36, -torsoH * 0.8] as Pt};
}
type Geo = ReturnType<typeof personGeo>;

/** The coat colour the kit Person picks for a seed when `body` is not given (mirrors makeSpec: w, hr, round, [hair],
 *  body; accessories are passed explicitly so they draw nothing). */
function personCoat(seed: Seed, hairGiven: boolean): string {
  const r = rng(`person/${seed}`);
  for (let i = 0; i < (hairGiven ? 3 : 4); i++) r.next();
  return r.pick(PERSON_BODIES);
}

/** Outline of the kit torso (sketch `torso`, flare 0.07): straight sides from the shoulder curve to the hip. */
function torsoSides(g: {w: number; h: number; round: number}) {
  const hw = g.w / 2;
  const bx = hw * 1.07;
  const R = Math.min(g.w * g.round, g.h * 0.8);
  /** |x| of the side at y (valid for y >= -h + R). */
  const xAt = (y: number) => hw + ((bx - hw) * (y - (-g.h + R))) / (g.h - R);
  return {hw, bx, R, xAt};
}

/** A white rim strip (ref 2: 3 px on screen, just inside the outline) along one torso side, a FIXED length from the
 *  shoulder (so it never moves when a cropped torso is lengthened). Local person units; `px` = local units per screen px. */
function rimStripD(g: {w: number; h: number; round: number}, side: 1 | -1, W: number, px: number, len: number): string {
  const {hw, bx, R} = torsoSides(g);
  const a: Pt = [side * hw, -g.h + R];
  const b: Pt = [side * bx, 0];
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
  const dir: Pt = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
  const n: Pt = [-side * dir[1], side * dir[0]]; // inward
  const ins = W / 2 + 0.6 * px;
  const wpx = 3 * px;
  const u0 = g.w * 0.1;
  const u1 = Math.min(L * 0.92, u0 + len);
  const P = (u: number, o: number): Pt => [a[0] + dir[0] * u + n[0] * o, a[1] + dir[1] * u + n[1] * o];
  return polyPath([P(u0, ins), P(u1, ins), P(u1, ins + wpx), P(u0, ins + wpx)]);
}

/** Rise wrapper: children rise `dist` from behind the line y = clipY (in the same coords) over 0.33 s out(exp). */
const RiseClip: React.FC<{at?: number; dist: number; clipY: number; children?: React.ReactNode}> = ({at, dist, clipY, children}) => {
  const t = useTime();
  const id = 'rc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  if (at === undefined) return <>{children}</>;
  if (t < at) return null;
  const p = prog(t, at, MOTION.rise.dur, MOTION.rise.ease);
  if (p >= 1) return <>{children}</>;
  return (
    <>
      <defs>
        <clipPath id={id}>
          <rect x={-6000} y={clipY - 8000} width={12000} height={8000 + 2} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <XG m={mat.translate(0, (1 - p) * dist)}>{children}</XG>
      </g>
    </>
  );
};

/** A sleeve from the shoulder to the hand (local person units): coat-coloured polygon + ink sides + sand hand. */
const Arm: React.FC<{sh: Pt; hand: Pt; w?: number; coat: string; W: number; seed: string; hand2?: boolean}> = ({sh, hand, w = 19, coat, W, seed, hand2 = true}) => {
  const dx = hand[0] - sh[0];
  const dy = hand[1] - sh[1];
  const L = Math.hypot(dx, dy) || 1;
  const nx = (-dy / L) * (w / 2);
  const ny = (dx / L) * (w / 2);
  const tipW = 0.85;
  const poly: Pt[] = [
    [sh[0] + nx, sh[1] + ny],
    [hand[0] + nx * tipW, hand[1] + ny * tipW],
    [hand[0] - nx * tipW, hand[1] - ny * tipW],
    [sh[0] - nx, sh[1] - ny],
  ];
  return (
    <>
      {hand2 ? <Fill d={blob(hand[0] + (dx / L) * 4, hand[1] + (dy / L) * 4, w * 0.42, w * 0.46, {seed: `${seed}/h`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/hf`} /> : null}
      <Fill d={polyPath(poly)} color={coat} offset={false} mode="none" seed={`${seed}/af`} />
      <Ink d={`M${poly[0][0].toFixed(1)} ${poly[0][1].toFixed(1)}L${poly[1][0].toFixed(1)} ${poly[1][1].toFixed(1)}M${poly[2][0].toFixed(1)} ${poly[2][1].toFixed(1)}L${poly[3][0].toFixed(1)} ${poly[3][1].toFixed(1)}M${poly[1][0].toFixed(1)} ${poly[1][1].toFixed(1)}L${poly[2][0].toFixed(1)} ${poly[2][1].toFixed(1)}`} width={W} taper={false} seed={`${seed}/ai`} />
    </>
  );
};

/** Raise angle helper: 0 (down, hidden) .. 1 (up) over 0.3 s. */
const raiseQ = (t: number, at?: number, downAt?: number) => (at === undefined ? 0 : prog(t, at, 0.3, E.outBack(1.3)) * (downAt === undefined ? 1 : 1 - prog(t, downAt, 0.25, E.inOutCubic)));

type FigBase = {
  x: number;
  y: number;
  /** Total height in world px. */
  h: number;
  seed?: Seed;
  riseAt?: number;
  /** Idle bob amplitude (px). */
  bob?: number;
  /** Walk in place at hz steps/s from at; optional travel to `to` (feet point) over dur. */
  walk?: {at?: number; hz?: number; to?: Pt; dur?: number};
  /** On-screen ink: depth ladder (default by size: >= 260 front, >= 120 mid, >= 70 far, else hair). */
  depth?: Depth;
  flip?: boolean;
  outAt?: number;
};

const inkFor = (h: number, depth?: Depth) => (depth ? DEPTH_INK[depth] : h >= 260 ? 4.8 : h >= 120 ? 3.4 : h >= 70 ? 2.2 : 1.6);

/** Feet position with an optional walk. */
function walkPos(t: number, b: FigBase): {x: number; y: number; walking: boolean} {
  if (!b.walk || !b.walk.to) return {x: b.x, y: b.y, walking: !!b.walk && (b.walk.at === undefined || t >= b.walk.at)};
  const at = b.walk.at ?? 0;
  const q = prog(t, at, b.walk.dur ?? 1.5, E.linear);
  return {x: lerp(b.x, b.walk.to[0], q), y: lerp(b.y, b.walk.to[1], q), walking: t >= at && q < 1};
}

/** The figure frame: feet (x, y), scale s, rise + flip + out. Children are in Person-local units (hip line at 0). */
const FigFrame: React.FC<{b: FigBase; s: number; children?: React.ReactNode; feetBelowHip?: number}> = ({b, s, children, feetBelowHip = LEG}) => {
  const t = useTime();
  const {x, y} = walkPos(t, b);
  const bob = b.bob ? osc(t, 0.6, rand(b.seed ?? 'f', 'bob') * 6) * b.bob : 0;
  const hipY = y - feetBelowHip * s + bob;
  const outK = b.outAt !== undefined ? 1 - E.inCubic(prog(t, b.outAt, 0.2)) : 1;
  if (outK <= 0.002) return null;
  const inner = <XG m={mat.compose(mat.translate(x, hipY), mat.scale(b.flip ? -s : s, s), mat.about(mat.scale(1, outK), 0, feetBelowHip))}>{children}</XG>;
  return (
    <RiseClip at={b.riseAt} dist={b.h * 1.05} clipY={y + 2}>
      {inner}
    </RiseClip>
  );
};

// ---------------------------------------------------------------- EdgeOnlooker (tier A)

export type EdgeOnlookerProps = {
  /** Head centre. */
  x: number;
  y: number;
  /** Head diameter in world px (ref 2: 85-130 at the frame sides). */
  head?: number;
  seed?: Seed;
  hair?: Hair;
  /** Accessories of the kit Person ('backpack' is dropped: it scales with the cropped torso; 'phone' = holding it up). */
  acc?: Acc[];
  body?: string;
  riseAt?: number;
  bob?: number;
  /** The phone arm swings up from the hanging arm (0.3 s, slight overshoot) with a shoulder jolt. */
  raisePhoneAt?: number;
  /** The phone arm swings back down (0.25 s). */
  lowerPhoneAt?: number;
  /** Which arm holds the phone. Default: the side facing the frame centre. */
  phoneSide?: 'left' | 'right';
  /** Hanging arms (sleeve seam, cuff, hand): both (default), only the side facing the frame centre, or none. */
  arms?: 'both' | 'near' | false;
  depth?: Depth;
  /** White rim strip on this side of the torso (fixed length from the shoulder). Default 'left'. */
  rim?: 'left' | 'right' | false;
  /** Parent y the coat must run past. Default: the frame bottom + 40 px read from the camera transform every frame
   *  (never less than world.h + world.bleed in parent units), so the torso always runs off the bottom edge. */
  frameBottom?: number;
};

/** Big back-view head + shoulders at a frame side in a long coat that runs off the bottom of the frame (no hem, no legs:
 *  it can never end inside the frame), arms hanging at the sides (sleeve seam, cuff, sand hand), a white rim strip. */
export const EdgeOnlooker: React.FC<EdgeOnlookerProps> = ({x, y, head = 110, seed = 'onl', hair, acc, body, riseAt, bob = 1.5, raisePhoneAt, lowerPhoneAt, phoneSide, arms = 'both', depth = 'front', rim = 'left', frameBottom}) => {
  const t = useTime();
  const m = useXf();
  const g0 = personGeo(seed);
  const s = head / (g0.hr * 2);
  // where the frame bottom is in parent units (camera zoom / pull-back / sheet cell all included)
  let yb = frameBottom;
  if (yb === undefined) {
    const iv = mat.inv(m);
    const Y = canvas.height + 40;
    yb = Math.max(world.h + world.bleed, iv[3] * Y + iv[5], iv[1] * canvas.width + iv[3] * Y + iv[5]);
  }
  // torso length so the hip line (coat bottom) sits below it; quantised so the path is not rebuilt every frame
  const need = (yb + 30 - y) / s - g0.hr * 0.86;
  const torsoH = Math.min(8000, Math.max(220, Math.ceil(need / 64) * 64));
  const g = personGeo(seed, torsoH);
  const coat = body ?? personCoat(seed, hair !== undefined);
  const holdPhone = !!acc?.includes('phone');
  const q = holdPhone ? 1 : raiseQ(t, raisePhoneAt, lowerPhoneAt);
  const jolt = raisePhoneAt !== undefined && t >= raisePhoneAt && t < raisePhoneAt + 0.2 ? -Math.sin(((t - raisePhoneAt) / 0.2) * Math.PI) * 6 : 0;
  const hipY = y - g.hy * s + jolt + (bob ? osc(t, 0.5, rand(seed, 'b') * 6) * bob : 0);
  const accs: Acc[] = (acc ?? []).filter((a) => a !== 'phone' && a !== 'backpack');
  const rise = riseAt !== undefined ? (1 - MOTION.rise.ease(prog(t, riseAt, MOTION.rise.dur))) * head * 2.2 : 0;
  if (riseAt !== undefined && t < riseAt) return null;

  // ---- arms (person-local units: hip line at 0, torso top at -h)
  const W = DEPTH_INK[depth] / s;
  const px = 1 / Math.max(1e-4, s * Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2])));
  const sx = m[0] * x + m[2] * y + m[4];
  const near: 1 | -1 = sx < canvas.width / 2 ? 1 : -1;
  const pside: 1 | -1 = phoneSide ? (phoneSide === 'right' ? 1 : -1) : near;
  const {hw, R, xAt} = torsoSides(g);
  const d = g.w * 0.18;
  const yTop = -g.h + R - Math.sqrt(Math.max(0, R * R - (R - d) * (R - d))) + g.w * 0.03;
  const yCuff = -g.h + g.w * 1.05;
  const xc = xAt(yCuff);
  const parts: React.ReactNode[] = [];
  const sides: (1 | -1)[] = arms === false ? [] : arms === 'near' ? [near] : [-1, 1];
  for (const sd of sides) {
    if (sd === pside && q > 0.02) continue; // that arm is up
    const seam = `M${(sd * (hw - d)).toFixed(2)} ${yTop.toFixed(2)}Q${(sd * (hw - d + g.w * 0.012)).toFixed(2)} ${((yTop + yCuff) / 2).toFixed(2)} ${(sd * (xc - d)).toFixed(2)} ${yCuff.toFixed(2)}`;
    const cuff = `M${(sd * (xc - 0.5)).toFixed(2)} ${yCuff.toFixed(2)}L${(sd * (xc - d)).toFixed(2)} ${(yCuff + 0.6).toFixed(2)}`;
    const hand = blob(sd * (xc - d * 0.5), yCuff + g.w * 0.085, g.w * 0.075, g.w * 0.1, {seed: `${seed}/h${sd}`});
    parts.push(
      <g key={`arm${sd}`}>
        <Ink d={seam + cuff} width={W * 0.85} taper={false} seed={`${seed}/seam${sd}`} />
        <Fill d={hand} color={palette.sand} offset={false} mode="none" seed={`${seed}/hf${sd}`} />
        <Ink d={hand} width={W * 0.8} taper={false} seed={`${seed}/hi${sd}`} />
      </g>,
    );
  }
  if (q > 0.02) {
    // the phone arm swings about the shoulder from hanging to raised (mirrored for the left arm)
    const sh: Pt = [hw - d * 0.5, -g.h + R * 0.55];
    const hd: Pt = [xc - d * 0.5, yCuff + g.w * 0.06];
    const hu: Pt = [g.w * 0.62, g.hy - g.hr * 1.25];
    const a0 = Math.atan2(hd[1] - sh[1], hd[0] - sh[0]);
    const a1 = Math.atan2(hu[1] - sh[1], hu[0] - sh[0]);
    const L = lerp(Math.hypot(hd[0] - sh[0], hd[1] - sh[1]), Math.hypot(hu[0] - sh[0], hu[1] - sh[1]), Math.min(1, q));
    const a = a0 + (a1 - a0) * q;
    const hand: Pt = [pside * (sh[0] + Math.cos(a) * L), sh[1] + Math.sin(a) * L];
    const rot = (pside * (a - a1) * 180) / Math.PI;
    parts.push(
      <g key="phoneArm">
        <Arm sh={[pside * sh[0], sh[1]]} hand={hand} w={d * 1.05} coat={coat} W={W * 0.9} seed={`${seed}/parm`} />
        <XG m={mat.compose(mat.translate(hand[0], hand[1]), mat.rotate(rot))}>
          <Fill d={roundRect(-11, -42, 22, 38, 4)} color={palette.card} offset={false} mode="none" seed={`${seed}/ph`} />
          <Ink d={roundRect(-11, -42, 22, 38, 4, {seed: `${seed}/phi`}) + `M-5 -34H5`} width={W * 0.85} taper={false} seed={`${seed}/phi`} />
        </XG>
      </g>,
    );
  }
  const rimD = rim ? rimStripD(g, rim === 'left' ? -1 : 1, W, px, g.w * 2.2) : '';
  return (
    <XG m={mat.translate(0, rise)}>
      <Person x={x} y={hipY} s={s} seed={seed} hair={hair} acc={accs} body={coat} torsoH={torsoH} ink={DEPTH_INK[depth]} hero={false} rim={false} />
      <XG m={mat.compose(mat.translate(x, hipY), mat.scale(s))}>
        {rimD ? <Fill d={rimD} color={palette.white} offset={false} mode="none" seed={`${seed}/rim`} /> : null}
        {parts}
      </XG>
    </XG>
  );
};

// ---------------------------------------------------------------- Citizen

export type CitizenProps = FigBase & {silhouette?: boolean; color?: string; body?: string; hair?: Hair; acc?: Acc[]};

/** 40-55 px back-view citizen with legs (kit Person); `silhouette` = a flat sage cut-out (fill only). */
export const Citizen: React.FC<CitizenProps> = (p) => {
  const t = useTime();
  const look = useLook();
  const s = p.h / FIG_H;
  if (p.silhouette || p.h < 26) {
    const {x, y} = walkPos(t, p);
    const a = new PathBuf();
    tinyFigure(a, a, a, x, y, p.h);
    const outK = p.outAt !== undefined ? 1 - E.inCubic(prog(t, p.outAt, 0.2)) : 1;
    if (outK <= 0.002) return null;
    return (
      <RiseClip at={p.riseAt} dist={p.h * 1.05} clipY={y + 1}>
        <ExitFade x={x} y={y}>
          <path d={a.d} fill={look.fills === 'paper' ? palette.white : look.fills === 'none' ? 'none' : p.color ?? palette.sage} stroke={look.fills === 'paper' ? palette.ink : undefined} strokeWidth={look.fills === 'paper' ? 1 : undefined} transform={outK < 1 ? `translate(${x} ${y}) scale(1 ${outK}) translate(${-x} ${-y})` : undefined} />
        </ExitFade>
      </RiseClip>
    );
  }
  const walking = walkPos(t, p).walking;
  return (
    <FigFrame b={p} s={s}>
      <Person seed={p.seed ?? 'cit'} legs torsoH={TORSO} legH={LEG} body={p.body} hair={p.hair} acc={p.acc ?? []} ink={inkFor(p.h, p.depth) / s} walk={walking ? p.walk?.hz ?? 1.8 : undefined} hero={false} lod={p.h < 34 ? 1 : 0} />
    </FigFrame>
  );
};

// ---------------------------------------------------------------- Investigator (S05)

export type InvestigatorProps = FigBase & {body?: string; hair?: Hair; raiseAt?: number; lowerAt?: number; twinkle?: boolean; arm?: 'left' | 'right'};

/** Full-body investigator: an ink shield badge on the back, a raised sparkle tablet (raiseAt). */
export const Investigator: React.FC<InvestigatorProps> = (p) => {
  const t = useTime();
  const seed = p.seed ?? 'inv';
  const s = p.h / FIG_H;
  const g = personGeo(seed);
  const W = inkFor(p.h, p.depth) / s;
  const coat = p.body ?? rng(`inv/${seed}`).pick([palette.teal, palette.sage, palette.tan, palette.sand]);
  const q = raiseQ(t, p.raiseAt, p.lowerAt);
  const side = p.arm === 'left' ? -1 : 1;
  const sh: Pt = [side * g.w * 0.34, -g.h * 0.8];
  const up: Pt = [side * g.w * 0.62, g.hy - g.hr * 1.7];
  const down: Pt = [side * g.w * 0.5, -g.h * 0.05];
  const hand: Pt = [lerp(down[0], up[0], q), lerp(down[1], up[1], q)];
  const walking = walkPos(t, p).walking;
  const by = -g.h * 0.62;
  const shield = `M${-11} ${by - 13}Q0 ${by - 17} 11 ${by - 13}L11 ${by}Q9 ${by + 11} 0 ${by + 16}Q-9 ${by + 11} -11 ${by}Z`;
  return (
    <FigFrame b={p} s={s}>
      <Person seed={seed} legs torsoH={TORSO} legH={LEG} body={coat} hair={p.hair} acc={['collar']} ink={W} walk={walking ? p.walk?.hz ?? 1.8 : undefined} />
      <Ink d={shield + `M0 ${by - 9}V${by + 9}M-6 ${by - 2}H6`} width={W * 0.75} seed={`${seed}/badge`} />
      {q > 0.02 ? (
        <>
          <Arm sh={sh} hand={hand} coat={coat} W={W * 0.85} seed={`${seed}/arm`} />
          <SparkleTablet x={hand[0]} y={hand[1] - 34 / s} size={60 / s} rot={side * (1 - q) * -30} twinkle={p.twinkle ?? true} ink={W * 0.8} seed={`${seed}/tab`} />
        </>
      ) : null}
    </FigFrame>
  );
};

// ---------------------------------------------------------------- Messenger (S05 -> S06)

export type MessengerProps = FigBase & {pullAt?: number; holdEnvelope?: boolean; envelopeSize?: number};

/** Teal-coated messenger; pulls an envelope from his coat (pullAt) and carries it at shoulder height. */
export const Messenger: React.FC<MessengerProps> = (p) => {
  const t = useTime();
  const seed = p.seed ?? 'msg';
  const s = p.h / FIG_H;
  const g = personGeo(seed);
  const W = inkFor(p.h, p.depth) / s;
  const q = p.holdEnvelope ? 1 : raiseQ(t, p.pullAt);
  const sh: Pt = [g.w * 0.34, -g.h * 0.8];
  const hand: Pt = [lerp(g.w * 0.48, g.w * 0.7, q), lerp(-g.h * 0.2, -g.h * 0.92, q)];
  const walking = walkPos(t, p).walking;
  return (
    <FigFrame b={p} s={s}>
      <Person seed={seed} legs torsoH={TORSO} legH={LEG} body={palette.teal} hair="short" acc={['collar']} ink={W} walk={walking ? p.walk?.hz ?? 1.8 : undefined} />
      {q > 0.02 ? (
        <>
          <Envelope x={hand[0] + 6} y={hand[1] - 16} size={(p.envelopeSize ?? 60) / s} rot={lerp(30, -8, q)} carry={walking ? {} : undefined} depth="mid" seed={`${seed}/env`} />
          <Arm sh={sh} hand={hand} coat={palette.teal} W={W * 0.85} seed={`${seed}/arm`} />
        </>
      ) : null}
    </FigFrame>
  );
};

/** Hand point (world) of a Messenger at (x, y, h) with the envelope up: where to aim the WaxSeal / slot. */
export function messengerHand(x: number, y: number, h: number, seed: Seed = 'msg'): Pt {
  const s = h / FIG_H;
  const g = personGeo(seed);
  return [x + (g.w * 0.7 + 6) * s, y - LEG * s + (-g.h * 0.92 - 16) * s];
}

// ---------------------------------------------------------------- Maker

export type MakerProps = FigBase & {
  /** Waist-up at the bench (no legs; the bench hides the rest). */
  bust?: boolean;
  /** Working at the bench: head + shoulders nod and the elbows move (hz). */
  work?: number;
};

/** Maker in a teal shirt with a cream apron (back view: cream Y straps, a bow at the waist, apron edges). No caps (the
 *  kit cap from behind can read as a face at small sizes). */
export const Maker: React.FC<MakerProps> = (p) => {
  const t = useTime();
  const seed = p.seed ?? 'maker';
  const s = p.h / (p.bust ? FIG_H * 0.62 : FIG_H);
  const g = personGeo(seed);
  const W = inkFor(p.h, p.depth) / s;
  const walking = walkPos(t, p).walking;
  const nod = p.work ? osc(t, p.work, rand(seed, 'w') * 6) * 2.5 : 0;
  const hw = g.w / 2;
  const wy = -g.h * 0.12;
  // Y straps (two from the shoulders meet mid-back, one runs down to the bow): crossed X straps read as a figure
  // being crossed out at small sizes (review 4)
  const yj = -g.h * 0.52;
  const straps = `M${-hw * 0.46} ${-g.h * 0.98}L0 ${yj}M${hw * 0.46} ${-g.h * 0.98}L0 ${yj}L0 ${wy - 4}`;
  const bow = `M0 ${wy}q-12 -10 -14 0q2 9 14 0q12 -10 14 0q-2 9 -14 0M-3 ${wy + 2}l-6 14M3 ${wy + 2}l6 14`;
  return (
    <FigFrame b={p} s={s} feetBelowHip={p.bust ? 0 : LEG}>
      <XG m={mat.translate(0, nod)}>
        <Person seed={seed} legs={!p.bust} torsoH={TORSO} legH={LEG} body={palette.teal} hair={rng(`mk/${seed}`).pick<Hair>(['short', 'bun', 'curly', 'short'])} acc={[]} ink={W} walk={walking ? p.walk?.hz ?? 1.8 : undefined} />
        <Fill d={polyPath([[-hw * 1.02, wy - 6], [-hw * 0.82, wy - 6], [-hw * 0.84, 0], [-hw * 1.07, 0]]) + polyPath([[hw * 1.02, wy - 6], [hw * 0.82, wy - 6], [hw * 0.84, 0], [hw * 1.07, 0]])} color={palette.cream} offset={false} mode="none" seed={`${seed}/ap`} />
        <Ink d={straps} width={W * 1.7} color={palette.ink} taper={false} seed={`${seed}/st0`} />
        <Ink d={straps} width={W * 0.9} color={palette.cream} taper={false} seed={`${seed}/st1`} />
        <Fill d={`M0 ${wy}q-12 -10 -14 0q2 9 14 0q12 -10 14 0q-2 9 -14 0Z`} color={palette.cream} offset={false} mode="none" seed={`${seed}/bowf`} />
        <Ink d={bow} width={W * 0.7} seed={`${seed}/bow`} />
      </XG>
    </FigFrame>
  );
};

// ---------------------------------------------------------------- BackBody (Keeper, Caretaker)

/** Head centre of a BackBody: higher than the kit Person's, so a neck block shows between the head and the collar. */
const backHeadY = (g: Geo) => -g.h - g.hr * 1.5;
/** Feet to cap top of a BackBody at s = 1 (the presets scale `h` by this, so `h` is the true height). */
const backFigH = (g: Geo) => LEG + g.h + g.hr * 2.6;
/** One palette step darker (collar bands). */
const darker = (c: string) =>
  c === palette.sand ? palette.tan : c === palette.teal ? palette.tealDark : c === palette.cream ? palette.sand : c === palette.sage ? palette.teal : c === palette.tan ? palette.brown : palette.tealDark;

type BackBodyProps = {g: Geo; seed: string; coat: string; legs: string; shoes?: string; hair?: string; cap?: string | false; W: number; walk?: number; detail?: boolean};

/** A back-view figure built here instead of the kit Person when it wears a cap (style bible 6, closeup_board_people):
 *  the head circle IS the hair colour with sand ears at mid-height, the cap sits ON TOP (crown over the top ~45 %, the
 *  band line just above the middle with the small strap arch on it, a button), a sand neck block shows under the head,
 *  a coat collar band with its collar line sits on the shoulders. No skin-coloured crown and no dark crescent low on the head, so it never reads as
 *  a face (review 4). Person-local units: hip line at 0, the same w / h / hr / round as personGeo (arms, belts fit). */
const BackBody: React.FC<BackBodyProps> = ({g, seed, coat, legs, shoes = palette.tealDark, hair = palette.brown, cap, W, walk, detail = true}) => {
  const t = useTime();
  const {w, h, hr} = g;
  const hy = backHeadY(g);
  const lw = w * 0.31;
  const gp = w * 0.05;
  let lL = 0;
  let lR = 0;
  let bob = 0;
  if (walk) {
    const ph = t * walk * Math.PI + rand(seed, 'wph') * 6.28;
    lL = Math.max(0, Math.sin(ph)) * LEG * 0.16;
    lR = Math.max(0, -Math.sin(ph)) * LEG * 0.16;
    bob = -Math.abs(Math.sin(ph)) * LEG * 0.035;
  }
  const f = (v: number) => v.toFixed(2);
  const legsD = rectPath(-gp - lw, -2, lw, LEG - lL) + rectPath(gp, -2, lw, LEG - lR);
  const shoesD = rectPath(-gp - lw - 1, LEG - lL - 12, lw + 3, 14) + rectPath(gp - 2, LEG - lR - 12, lw + 3, 14);
  const legInk = `M${f(-gp - lw)} 0V${f(LEG - lL)}M${f(-gp)} 0V${f(LEG - 2 - lL)}M${f(gp)} 0V${f(LEG - 2 - lR)}M${f(gp + lw)} 0V${f(LEG - lR)}`;
  const torsoD = torso(0, 0, w, h, g.round, 0.07);
  // neck block (sand) from inside the head down into the collar; ink on its two sides
  const neckD = rectPath(-hr * 0.45, hy + hr * 0.55, hr * 0.9, -h + hr * 0.3 - (hy + hr * 0.55));
  const neckInk = `M${f(-hr * 0.45)} ${f(hy + hr * 0.9)}V${f(-h - hr * 0.12)}M${f(hr * 0.45)} ${f(hy + hr * 0.9)}V${f(-h - hr * 0.12)}`;
  // collar band on the shoulders: top edge round the neck, the collar line below
  const ct = -h - hr * 0.16;
  const collarTop = `M${f(-hr * 0.68)} ${f(ct)}Q0 ${f(-h + hr * 0.06)} ${f(hr * 0.68)} ${f(ct)}`;
  const collarD = collarTop + `L${f(hr * 1.14)} ${f(-h + hr * 0.38)}Q0 ${f(-h + hr * 0.8)} ${f(-hr * 1.14)} ${f(-h + hr * 0.38)}Z`;
  const collarInk = collarTop + `M${f(-hr * 0.68)} ${f(ct)}L${f(-hr * 1.14)} ${f(-h + hr * 0.38)}Q0 ${f(-h + hr * 0.8)} ${f(hr * 1.14)} ${f(-h + hr * 0.38)}L${f(hr * 0.68)} ${f(ct)}`;
  // head (hair colour) + ears at mid-height
  const ey = hy + hr * 0.12;
  const ears = blob(-hr * 0.98, ey, hr * 0.2, hr * 0.3, {seed: `${seed}/e1`}) + blob(hr * 0.98, ey, hr * 0.2, hr * 0.3, {seed: `${seed}/e2`});
  const earInk = arc(-hr * 0.98, ey, hr * 0.2, hr * 0.3, 95, 265, {seed: `${seed}/ei1`}) + arc(hr * 0.98, ey, hr * 0.2, hr * 0.3, -85, 85, {seed: `${seed}/ei2`});
  const headD = blob(0, hy, hr, hr, {seed: `${seed}/head`});
  const headInk = circle(0, hy, hr, {seed: `${seed}/head`, overlap: 18});
  // cap (ref 1 line-art row): crown over the top ~45 % of the head, its band line just above the middle with the small
  // strap arch sitting ON the band (hair colour inside), a button on top; the head below the band stays hair colour
  const by = hy - hr * 0.1;
  const R2 = hr * 1.04;
  const cw = Math.sqrt(Math.max(0, R2 * R2 - (by - hy) * (by - hy)));
  const crownD = `M${f(-cw)} ${f(by)}A${f(R2)} ${f(R2)} 0 1 1 ${f(cw)} ${f(by)}Q0 ${f(by + hr * 0.06)} ${f(-cw)} ${f(by)}Z`;
  const crownInk = `M${f(-cw)} ${f(by)}A${f(R2)} ${f(R2)} 0 1 1 ${f(cw)} ${f(by)}Q0 ${f(by + hr * 0.06)} ${f(-cw)} ${f(by)}`;
  const archD = `M${f(-hr * 0.28)} ${f(by + hr * 0.02)}A${f(hr * 0.28)} ${f(hr * 0.24)} 0 0 1 ${f(hr * 0.28)} ${f(by + hr * 0.02)}Z`;
  const archInk = arc(0, by + hr * 0.02, hr * 0.28, hr * 0.24, 180, 360, {seed: `${seed}/arch`});
  const strands = `M${f(-hr * 0.42)} ${f(hy - hr * 0.55)}Q${f(-hr * 0.5)} ${f(hy + hr * 0.1)} ${f(-hr * 0.36)} ${f(hy + hr * 0.72)}M${f(hr * 0.06)} ${f(hy - hr * 0.7)}Q${f(-hr * 0.02)} ${f(hy)} ${f(hr * 0.08)} ${f(hy + hr * 0.8)}M${f(hr * 0.46)} ${f(hy - hr * 0.5)}Q${f(hr * 0.56)} ${f(hy + hr * 0.1)} ${f(hr * 0.42)} ${f(hy + hr * 0.66)}`;
  return (
    <TodAnchor at={[0, -h * 0.5]}>
      <XG m={mat.translate(0, bob)}>
        <Fill d={legsD} color={legs} offset={false} mode="none" seed={`${seed}/legs`} />
        <Fill d={shoesD} color={shoes} offset={false} mode="none" seed={`${seed}/shoes`} />
        <Ink d={legInk} width={W * 0.9} seed={`${seed}/legI`} />
        <Fill d={neckD} color={palette.sand} offset={false} mode="none" seed={`${seed}/neck`} />
        {detail ? <Ink d={neckInk} width={W * 0.7} taper={false} seed={`${seed}/neckI`} /> : null}
        <Fill d={ears} color={palette.sand} offset={false} mode="none" seed={`${seed}/ear`} />
        <Ink d={earInk} width={W * 0.85} order="all" seed={`${seed}/earI`} />
        <Fill d={torsoD} color={coat} seed={`${seed}/torso`} />
        <Ink d={torsoD} width={W} seed={`${seed}/torsoI`} />
        <Fill d={collarD} color={darker(coat)} offset={false} mode="none" seed={`${seed}/collar`} />
        <Ink d={collarInk} width={W * 0.8} taper={false} seed={`${seed}/collarI`} />
        <Fill d={headD} color={hair} seed={`${seed}/headF`} />
        <Ink d={headInk} width={W} open={0.1} seed={`${seed}/headI`} />
        {cap ? (
          <>
            <Fill d={crownD} color={cap} offset={false} mode="none" seed={`${seed}/crown`} />
            {detail ? <Fill d={archD} color={hair} offset={false} mode="none" seed={`${seed}/arch`} /> : null}
            <Ink d={crownInk} width={W * 0.85} seed={`${seed}/capI`} />
            {detail ? <Ink d={archInk} width={W * 0.7} taper={false} seed={`${seed}/archI`} /> : null}
            {detail ? <Ink d={circle(0, hy - R2 + hr * 0.04, hr * 0.12, {seed: `${seed}/btn`})} width={W * 0.7} seed={`${seed}/btn`} /> : null}
          </>
        ) : detail ? (
          <Ink d={strands} width={W * 0.7} order="all" seed={`${seed}/strands`} />
        ) : null}
      </XG>
    </TodAnchor>
  );
};

// ---------------------------------------------------------------- Keeper (S10)

export type KeeperProps = FigBase & {
  /** Arm reaches forward/up to receive or hold something (0.3 s); `holding` renders at the hand (person-local units). */
  reachAt?: number;
  lowerAt?: number;
  holding?: React.ReactNode;
  /** Installing: the raised hand works in small quick strokes from installAt for installDur. */
  installAt?: number;
  installDur?: number;
  /** Climb a zig-zag stair: steps of (run, rise) world px, one per stepDur, starting at climb.at. */
  climb?: {at: number; steps: number; run: number; rise: number; stepDur?: number};
  /** Cap colour (default teal) or false for bare hair; hair colour (default ochre). */
  cap?: string | false;
  hair?: string;
};

/** Site keeper (NOT a maker): sand coat with a tan collar, teal cap, teal trousers, ochre tool belt (hammer, pouch). */
export const Keeper: React.FC<KeeperProps> = (p) => {
  const t = useTime();
  const seed = p.seed ?? 'keeper';
  // climbing moves the feet point in steps
  let b: FigBase = p;
  if (p.climb && t >= p.climb.at) {
    const sd = p.climb.stepDur ?? 0.35;
    const k = Math.min(p.climb.steps, (t - p.climb.at) / sd);
    const whole = Math.floor(k);
    const frac = E.inOutSine(k - whole);
    const n = Math.min(p.climb.steps, whole + frac);
    const hop = k < p.climb.steps ? Math.sin(frac * Math.PI) * p.climb.rise * 0.4 : 0;
    b = {...p, x: p.x + n * p.climb.run, y: p.y - n * p.climb.rise - hop};
  }
  if (p.h < 30) return <Citizen {...b} silhouette color={palette.sand} />;
  const g = personGeo(seed);
  const s = p.h / backFigH(g);
  const W = inkFor(p.h, p.depth) / s;
  const q = raiseQ(t, p.reachAt, p.lowerAt);
  const work = p.installAt !== undefined && t >= p.installAt && t < p.installAt + (p.installDur ?? 0.6) ? Math.sin((t - p.installAt) * 40) * 4 : 0;
  const sh: Pt = [g.w * 0.34, -g.h * 0.8];
  const hand: Pt = [lerp(g.w * 0.5, g.w * 0.66, q) + work, lerp(-g.h * 0.05, -g.h * 1.18, q)];
  const hw = g.w / 2;
  const by = -g.h * 0.2;
  const walking = walkPos(t, b).walking || (!!p.climb && t >= p.climb.at && t < p.climb.at + p.climb.steps * (p.climb.stepDur ?? 0.35));
  return (
    <FigFrame b={b} s={s}>
      <BackBody g={g} seed={String(seed)} coat={palette.sand} legs={palette.teal} cap={p.cap ?? palette.teal} hair={p.hair} W={W} walk={walking ? p.walk?.hz ?? 2.2 : undefined} detail={p.h >= 60} />
      <Fill d={rectPath(-hw * 1.04, by, hw * 2.08, 12)} color={palette.brown} offset={false} mode="none" seed={`${seed}/belt`} />
      <Fill d={roundRect(-hw * 0.7, by + 8, 20, 22, 4)} color={palette.tan} offset={false} mode="none" seed={`${seed}/pouch`} />
      <Ink d={`M${-hw * 1.04} ${by}H${hw * 1.04}M${-hw * 1.04} ${by + 12}H${hw * 1.04}` + `M${-hw * 0.7} ${by + 8}h20v22h-20Z` + `M${hw * 0.55} ${by + 6}l6 34M${hw * 0.45} ${by + 38}h22`} width={W * 0.8} taper={false} seed={`${seed}/beltI`} />
      {q > 0.02 ? (
        <>
          <Arm sh={sh} hand={hand} coat={palette.sand} W={W * 0.85} seed={`${seed}/arm`} />
          {p.holding ? <XG m={mat.translate(hand[0], hand[1] - 6)}>{p.holding}</XG> : null}
        </>
      ) : null}
    </FigFrame>
  );
};

// ---------------------------------------------------------------- Caretaker (S13)

export type CaretakerProps = FigBase & {
  raiseKeysAt?: number;
  lowerAt?: number;
  jingleAt?: number | number[];
  glintAt?: number;
  ring?: number;
  /** Cap colour (default sage) or false; hair colour (default ochre). */
  cap?: string | false;
  hair?: string;
};

/** The hosting company's caretaker: teal coat with a dark collar, sage cap, a big key ring (r 22) with sand keys. */
export const Caretaker: React.FC<CaretakerProps> = (p) => {
  const t = useTime();
  const seed = p.seed ?? 'care';
  const g = personGeo(seed);
  const s = p.h / backFigH(g);
  const W = inkFor(p.h, p.depth) / s;
  const q = raiseQ(t, p.raiseKeysAt, p.lowerAt);
  const sh: Pt = [g.w * 0.34, -g.h * 0.8];
  const hand: Pt = [lerp(g.w * 0.5, g.w * 0.68, q), lerp(-g.h * 0.05, backHeadY(g) - g.hr * 1.2, q)];
  const R = (p.ring ?? 22) / s;
  const jingles = p.jingleAt === undefined ? [] : Array.isArray(p.jingleAt) ? p.jingleAt : [p.jingleAt];
  let jig = osc(t, 1.1, 1) * 4;
  for (const j of jingles) if (t >= j && t < j + 0.6) jig += 16 * Math.exp(-(t - j) * 6) * Math.sin((t - j) * 34);
  const glint = p.glintAt !== undefined && t >= p.glintAt && t < p.glintAt + 0.22;
  const walking = walkPos(t, p).walking;
  const keys = [-35, 10, 55].map((a, i) => {
    const ang = ((90 + a + jig * (i % 2 ? -0.6 : 1)) * Math.PI) / 180;
    const kx = Math.cos(ang) * R;
    const ky = Math.sin(ang) * R;
    const L = R * 1.15;
    const dx = Math.cos(ang) * L;
    const dy = Math.sin(ang) * L;
    return {kx, ky, dx, dy, ang};
  });
  return (
    <FigFrame b={p} s={s}>
      <BackBody g={g} seed={String(seed)} coat={palette.teal} legs={palette.brown} cap={p.cap ?? palette.sage} hair={p.hair} W={W} walk={walking ? p.walk?.hz ?? 1.8 : undefined} detail={p.h >= 60} />
      {q > 0.02 ? (
        <>
          <Arm sh={sh} hand={hand} coat={palette.teal} W={W * 0.85} seed={`${seed}/arm`} />
          <XG m={mat.translate(hand[0], hand[1] - R * 0.9)}>
            {keys.map((k, i) => (
              <g key={i}>
                <Fill d={polyPath([[k.kx - 3, k.ky], [k.kx + 3, k.ky], [k.kx + k.dx * 0.9 + 3, k.ky + k.dy * 0.9], [k.kx + k.dx * 0.9 - 3, k.ky + k.dy * 0.9]]) + blob(k.kx + k.dx * 0.18, k.ky + k.dy * 0.18, 7, 7, {seed: `${seed}/kb${i}`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/k${i}`} />
                <Ink d={`M${k.kx} ${k.ky}l${(k.dx * 0.95).toFixed(1)} ${(k.dy * 0.95).toFixed(1)}` + circle(k.kx + k.dx * 0.18, k.ky + k.dy * 0.18, 7, {seed: `${seed}/kc${i}`})} width={W * 0.6} seed={`${seed}/ki${i}`} />
              </g>
            ))}
            <Ink d={circle(0, 0, R, {seed: `${seed}/ring`, overlap: 20})} width={W * 1.1} seed={`${seed}/ring`} />
            {glint ? <Ink d={`M${-R * 0.5} ${R * 0.9}l${R * 0.5} ${-R * 0.7}M${-R * 0.2} ${R * 1.2}l${R * 0.4} ${-R * 0.55}`} width={W * 0.9} color={palette.white} taper={false} seed={`${seed}/gl`} /> : null}
          </XG>
        </>
      ) : null}
    </FigFrame>
  );
};

// ---------------------------------------------------------------- Attempter (S08)

export type AttempterProps = FigBase & {
  /** 'tap' at the glass (counted) or 'rattle' a door handle (not counted). */
  mode?: 'tap' | 'rattle' | 'stand';
  tapAt?: number | number[];
  /** Where the tap ripples appear (world). Default in front of the raised hand. */
  tapPoint?: Pt;
  rattleAt?: number;
  rattleDur?: number;
};

/** Hooded back-view figure: tealDark fill, an ink hood point. 18-80 px. Taps ripple ink arcs; rattles shake a handle. */
export const Attempter: React.FC<AttempterProps> = (p) => {
  const t = useTime();
  const look = useLook();
  const paint = look.fills === 'paper' ? palette.white : look.fills === 'none' ? 'none' : palette.tealDark;
  const seed = p.seed ?? 'att';
  const {x, y} = walkPos(t, p);
  const h = p.h;
  if (p.riseAt !== undefined && t < p.riseAt) return null;
  const pop = p.riseAt !== undefined ? springAt(t, p.riseAt, springs.pop) : 1;
  const taps = p.tapAt === undefined ? [] : Array.isArray(p.tapAt) ? p.tapAt : [p.tapAt];
  const tapping = taps.find((a) => t >= a && t < a + 0.35);
  const rattling = p.rattleAt !== undefined && t >= p.rattleAt && t < p.rattleAt + (p.rattleDur ?? 0.8);
  const jig = tapping !== undefined ? Math.sin((t - tapping) * 50) * h * 0.02 : rattling ? Math.sin(t * 60) * h * 0.03 : 0;
  const iw = inkFor(h, p.depth);
  const tw = h * 0.36;
  const th = h * 0.5;
  const top = y - h * 0.38 - th;
  const hr = h * 0.12;
  const hcx = x + jig;
  const hcy = top - hr * 0.7;
  const body = `M${hcx - tw / 2} ${y - h * 0.36}L${hcx - tw / 2} ${top + tw * 0.4}Q${hcx - tw / 2} ${top} ${hcx} ${top}Q${hcx + tw / 2} ${top} ${hcx + tw / 2} ${top + tw * 0.4}L${hcx + tw / 2} ${y - h * 0.36}Z`;
  const hood = `M${hcx - hr * 1.05} ${hcy + hr * 0.4}Q${hcx - hr * 1.15} ${hcy - hr * 0.7} ${hcx} ${hcy - hr * 1.75}Q${hcx + hr * 1.15} ${hcy - hr * 0.7} ${hcx + hr * 1.05} ${hcy + hr * 0.4}Q${hcx} ${hcy + hr * 1.1} ${hcx - hr * 1.05} ${hcy + hr * 0.4}Z`;
  const legs = rectPath(x - h * 0.13, y - h * 0.37, h * 0.11, h * 0.37) + rectPath(x + h * 0.02, y - h * 0.37, h * 0.11, h * 0.37);
  const arm = p.mode === 'tap' || p.mode === 'rattle' ? `M${hcx + tw * 0.36} ${top + th * 0.2}L${hcx + tw * 0.62} ${top - (p.mode === 'tap' ? hr * 1.2 : -th * 0.25)}` : '';
  const marks: React.ReactNode[] = [];
  if (tapping !== undefined) {
    const q = (t - tapping) / 0.35;
    const tp = p.tapPoint ?? [hcx + tw * 0.7, top - hr * 1.4];
    for (let i = 0; i < 2; i++) {
      const rr = h * (0.12 + 0.12 * i + 0.25 * q);
      marks.push(<path key={i} d={arc(tp[0], tp[1], rr, rr, -60, 60, {seed: `${seed}/rp${i}`}) + arc(tp[0], tp[1], rr, rr, 120, 240, {seed: `${seed}/rq${i}`})} fill="none" stroke={palette.ink} strokeWidth={Math.max(1, DEPTH_INK.hair * (1 - q))} strokeLinecap="round" />);
    }
  }
  if (p.mode === 'rattle') {
    const hx = hcx + tw * 0.66;
    const hy = top + th * 0.45;
    marks.push(<path key="h" d={`M${hx} ${hy - h * 0.06}v${h * 0.12}`} stroke={palette.ink} strokeWidth={Math.max(1.6, h * 0.035)} strokeLinecap="round" />);
    if (rattling && Math.floor(t * 15) % 2 === 0) marks.push(<path key="rm" d={`M${hx + h * 0.08} ${hy - h * 0.1}l${h * 0.05} ${-h * 0.03}M${hx + h * 0.09} ${hy}l${h * 0.06} 0M${hx + h * 0.08} ${hy + h * 0.1}l${h * 0.05} ${h * 0.03}`} stroke={palette.ink} strokeWidth={DEPTH_INK.far} strokeLinecap="round" />);
  }
  return (
    <ExitFade x={x} y={y}>
      <g transform={pop < 1 ? `translate(${x} ${y}) scale(${pop.toFixed(3)}) translate(${-x} ${-y})` : undefined}>
        <path d={legs + body + hood} fill={paint} stroke={look.fills === 'paper' && h < 36 ? palette.ink : undefined} strokeWidth={1} />
        {arm ? <path d={arm} stroke={paint === 'none' ? palette.ink : paint} strokeWidth={h * 0.09} strokeLinecap="round" fill="none" /> : null}
        {h >= 36 && look.ink ? <path d={body + hood} fill="none" stroke={palette.ink} strokeWidth={iw} strokeLinejoin="round" /> : null}
        <path d={`M${hcx} ${hcy - hr * 1.75}l${-hr * 0.15} ${hr * 0.6}`} stroke={palette.ink} strokeWidth={Math.max(1, iw * 0.9)} strokeLinecap="round" />
        {marks}
      </g>
    </ExitFade>
  );
};

/** Hundreds of 4-8 px hooded tombstones in one path (the S08 flood). Each pops at its `at`. */
export const AttemptStipple: React.FC<{spots: {x: number; y: number; h: number; at?: number}[]; color?: string}> = ({spots, color = palette.tealDark}) => {
  const t = useTime();
  const look = useLook();
  if (look.fills !== 'color') return null;
  const pb = new PathBuf();
  for (const sp of spots) {
    if (sp.at !== undefined && t < sp.at) continue;
    const k = sp.at !== undefined && t < sp.at + 0.067 ? 1.25 : 1;
    const h = sp.h * k;
    const w = h * 0.5;
    pb.raw(`M${(sp.x - w / 2).toFixed(1)} ${sp.y.toFixed(1)}V${(sp.y - h * 0.62).toFixed(1)}Q${(sp.x - w / 2).toFixed(1)} ${(sp.y - h * 0.82).toFixed(1)} ${sp.x.toFixed(1)} ${(sp.y - h).toFixed(1)}Q${(sp.x + w / 2).toFixed(1)} ${(sp.y - h * 0.82).toFixed(1)} ${(sp.x + w / 2).toFixed(1)} ${(sp.y - h * 0.62).toFixed(1)}V${sp.y.toFixed(1)}Z`);
  }
  if (pb.empty) return null;
  return (
    <ExitFade>
      <path d={pb.d} fill={color} />
    </ExitFade>
  );
};

// ---------------------------------------------------------------- Ghost (S04)

/** An ink-only back-view figure (no fills at all): the years of passers-by who never look at the door. */
export const Ghost: React.FC<FigBase & {at?: number; hair?: Hair; acc?: Acc[]}> = (p) => {
  const t = useTime();
  if (p.at !== undefined && t < p.at) return null;
  const s = p.h / FIG_H;
  const walking = walkPos(t, p).walking;
  return (
    <Look fills="none">
      <FigFrame b={p} s={s}>
        <Person seed={p.seed ?? 'ghost'} legs torsoH={TORSO} legH={LEG} style="line" hair={p.hair} acc={p.acc ?? []} ink={(p.depth ? DEPTH_INK[p.depth] : stroke.ink) / s} at={p.at} build="draw" walk={walking ? p.walk?.hz ?? 1.6 : undefined} hero={false} />
      </FigFrame>
    </Look>
  );
};
