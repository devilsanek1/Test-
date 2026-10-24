// S05 LOCAL STAND-INS for two props-lane figures (src/scenes/shared/props/Figures.tsx), same names, a superset of the
// shared props. Swap back to `import {Investigator, Messenger} from '../shared/props'` once the props lane adds:
//   Investigator: `tabletSize` (world px, default 60), `tabletLift` ('overhead' | 'head': the raised hand beside the
//                 head instead of above it), `pose` (a second arm: 'point' at a world target from `poseAt`, 'shade' (a
//                 hand at the brow, elbow out: looking up), 'hips' (both hands on the hips), 'clipboard' (held at the
//                 side)).
//   Messenger:    `side` ('left' | 'right', default right: the hand that pulls the envelope), `lift` ('shoulder' |
//                 'high': the envelope raised above the head on that side).
// The figure geometry, coat, badge, sleeve and tablet are the shared ones (personGeo / Arm / SparkleTablet / Envelope
// mirrored from Figures.tsx), so a swap is invisible. Feet anchor (x, y), h = total height (world px).
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, osc, prog, useTime} from '../../lib/time';
import {rand, rng, Seed} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {Hair, Person} from '../../lib/kit';
import {blob, polyPath, roundRect, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {Envelope, SparkleTablet} from '../shared/props';

const TORSO = 95;
const LEG = 62;
export const FIG_H = 199;

/** Mirrors Figures.tsx personGeo (the kit Person's first random draws for a seed). */
function personGeo(seed: Seed, torsoH = TORSO) {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  const round = r.range(0.36, 0.45);
  const hy = -torsoH - hr * 0.86;
  return {w, hr, hy, h: torsoH, round};
}

const inkFor = (h: number) => (h >= 260 ? 4.8 : h >= 120 ? 3.4 : h >= 70 ? 2.2 : 1.6);

/** Mirrors Figures.tsx Arm: a sleeve from the shoulder to the hand (local person units). */
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
  const f = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  return (
    <>
      {hand2 ? <Fill d={blob(hand[0] + (dx / L) * 4, hand[1] + (dy / L) * 4, w * 0.42, w * 0.46, {seed: `${seed}/h`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/hf`} /> : null}
      <Fill d={polyPath(poly)} color={coat} offset={false} mode="none" seed={`${seed}/af`} />
      <Ink d={`M${f(poly[0])}L${f(poly[1])}M${f(poly[2])}L${f(poly[3])}M${f(poly[1])}L${f(poly[2])}`} width={W} taper={false} seed={`${seed}/ai`} />
    </>
  );
};

/** An arm with an elbow (upper arm + forearm), hand at the end. */
const BentArm: React.FC<{sh: Pt; elbow: Pt; hand: Pt; coat: string; W: number; seed: string}> = ({sh, elbow, hand, coat, W, seed}) => (
  <>
    <Arm sh={sh} hand={elbow} coat={coat} W={W} seed={`${seed}/u`} hand2={false} />
    <Arm sh={elbow} hand={hand} w={17} coat={coat} W={W} seed={`${seed}/f`} />
  </>
);

/** 0 (down) .. 1 (up), 0.3 s out-back; then back down over 0.25 s (mirrors Figures.tsx raiseQ). */
const raiseQ = (t: number, at?: number, downAt?: number) => (at === undefined ? 0 : prog(t, at, 0.3, E.outBack(1.3)) * (downAt === undefined ? 1 : 1 - prog(t, downAt, 0.25, E.inOutCubic)));

type Frame = {x: number; y: number; h: number; seed: Seed; bob?: number; flip?: boolean};

/** Feet (x, y), scale h / FIG_H; children in person-local units (hip line at 0). */
const FigFrame: React.FC<{b: Frame; children?: React.ReactNode}> = ({b, children}) => {
  const t = useTime();
  const s = b.h / FIG_H;
  const bob = b.bob ? osc(t, 0.6, rand(b.seed ?? 'f', 'bob') * 6) * b.bob : 0;
  const hipY = b.y - LEG * s + bob;
  return <XG m={mat.compose(mat.translate(b.x, hipY), mat.scale(b.flip ? -s : s, s))}>{children}</XG>;
};

/** World point -> person-local units of a figure at feet (x, y), height h (ignores the bob). */
const toLocal = (x: number, y: number, h: number, p: Pt): Pt => {
  const s = h / FIG_H;
  return [(p[0] - x) / s, (p[1] - (y - LEG * s)) / s];
};

// ---------------------------------------------------------------- Investigator

export type InvestigatorPose =
  | {kind: 'point'; at: number; target: Pt; side?: 'left' | 'right'}
  | {kind: 'shade'; side?: 'left' | 'right'}
  | {kind: 'hips'}
  | {kind: 'clipboard'; side?: 'left' | 'right'};

export type InvestigatorProps = Frame & {
  body?: string;
  hair?: Hair;
  raiseAt?: number;
  lowerAt?: number;
  twinkle?: boolean;
  arm?: 'left' | 'right';
  /** Tablet width in world px (height x 1.42). Shared default 60. */
  tabletSize?: number;
  /** 'overhead' (shared: the hand above the head) | 'head' (the hand beside the head: the tablet at head height). */
  tabletLift?: 'overhead' | 'head';
  pose?: InvestigatorPose;
  walk?: number;
};

/** World centre of an investigator's raised tablet (for beams). */
export function tabletCentre(p: Pick<InvestigatorProps, 'x' | 'y' | 'h' | 'seed' | 'arm' | 'tabletSize' | 'tabletLift'>): Pt {
  const s = p.h / FIG_H;
  const g = personGeo(p.seed);
  const side = p.arm === 'left' ? -1 : 1;
  const ts = p.tabletSize ?? 60;
  const up: Pt = p.tabletLift === 'head' ? [side * g.w * 0.66, g.hy] : [side * g.w * 0.62, g.hy - g.hr * 1.7];
  const hipY = p.y - LEG * s;
  return [p.x + up[0] * s, hipY + up[1] * s - ts * 0.6];
}

export const Investigator: React.FC<InvestigatorProps> = (p) => {
  const t = useTime();
  const seed = String(p.seed ?? 'inv');
  const s = p.h / FIG_H;
  const g = personGeo(seed);
  const W = inkFor(p.h) / s;
  const coat = p.body ?? rng(`inv/${seed}`).pick([palette.teal, palette.sage, palette.tan, palette.sand]);
  const q = raiseQ(t, p.raiseAt, p.lowerAt);
  const side = p.arm === 'left' ? -1 : 1;
  const ts = p.tabletSize ?? 60;
  const sh: Pt = [side * g.w * 0.34, -g.h * 0.8];
  const up: Pt = p.tabletLift === 'head' ? [side * g.w * 0.66, g.hy] : [side * g.w * 0.62, g.hy - g.hr * 1.7];
  const down: Pt = [side * g.w * 0.5, -g.h * 0.05];
  const hand: Pt = [lerp(down[0], up[0], q), lerp(down[1], up[1], q)];
  const by = -g.h * 0.62;
  const shield = `M${-11} ${by - 13}Q0 ${by - 17} 11 ${by - 13}L11 ${by}Q9 ${by + 11} 0 ${by + 16}Q-9 ${by + 11} -11 ${by}Z`;
  // the second arm's pose: drawn BEFORE the body when it is mostly behind it (hands on the hips, a hand at the brow:
  // only the elbow shows past the coat, the back-view read), after it when it is out in front (point, clipboard)
  const before: React.ReactNode[] = [];
  const after: React.ReactNode[] = [];
  const P = p.pose;
  if (P?.kind === 'hips') {
    for (const sd of [-1, 1]) before.push(<BentArm key={`hip${sd}`} sh={[sd * g.w * 0.36, -g.h * 0.8]} elbow={[sd * g.w * 0.74, -g.h * 0.42]} hand={[sd * g.w * 0.5, -g.h * 0.1]} coat={coat} W={W * 0.85} seed={`${seed}/hip${sd}`} />);
  } else if (P?.kind === 'shade') {
    const sd = P.side === 'left' ? -1 : 1;
    before.push(<BentArm key="shade" sh={[sd * g.w * 0.36, -g.h * 0.8]} elbow={[sd * g.w * 0.78, g.hy + g.hr * 0.9]} hand={[sd * g.hr * 0.5, g.hy - g.hr * 0.25]} coat={coat} W={W * 0.85} seed={`${seed}/shade`} />);
  } else if (P?.kind === 'point') {
    const sd = P.side === 'left' ? -1 : 1;
    const shp: Pt = [sd * g.w * 0.34, -g.h * 0.8];
    const tgt = toLocal(p.x, p.y, p.h, P.target);
    const L = Math.hypot(tgt[0] - shp[0], tgt[1] - shp[1]) || 1;
    const dir: Pt = [(tgt[0] - shp[0]) / L, (tgt[1] - shp[1]) / L];
    const k = prog(t, P.at, 0.25, E.outBack(1.4));
    const hd: Pt = [sd * g.w * 0.5, -g.h * 0.05];
    const hu: Pt = [shp[0] + dir[0] * 84, shp[1] + dir[1] * 84];
    const hp: Pt = [lerp(hd[0], hu[0], k), lerp(hd[1], hu[1], k)];
    after.push(<Arm key="point" sh={shp} hand={hp} coat={coat} W={W * 0.85} seed={`${seed}/pt`} />);
    if (k > 0.6) after.push(<Ink key="finger" d={`M${(hp[0] + dir[0] * 6).toFixed(1)} ${(hp[1] + dir[1] * 6).toFixed(1)}l${(dir[0] * 13).toFixed(1)} ${(dir[1] * 13).toFixed(1)}`} width={W * 1.4} taper={false} vary={0} seed={`${seed}/fg`} />);
  } else if (P?.kind === 'clipboard') {
    const sd = P.side === 'left' ? -1 : 1;
    const hd: Pt = [sd * g.w * 0.66, -g.h * 0.3];
    after.push(
      <g key="clip">
        <XG m={mat.compose(mat.translate(hd[0] + sd * 6, hd[1] + 4), mat.rotate(sd * 8))}>
          <Fill d={roundRect(-15, -22, 30, 40, 3)} color={palette.brown} offset={false} mode="none" seed={`${seed}/cbB`} />
          <Fill d={roundRect(-11, -16, 22, 31, 1.5)} color={palette.white} offset={false} mode="none" seed={`${seed}/cbP`} />
          <Ink d={roundRect(-15, -22, 30, 40, 3) + 'M-6 -9H6M-6 -2H7M-6 5H4'} width={W * 0.7} taper={false} vary={0} seed={`${seed}/cbI`} />
          <Fill d={roundRect(-6, -25, 12, 6, 1.5)} color={palette.ink} offset={false} mode="none" seed={`${seed}/cbC`} />
        </XG>
        <Arm sh={[sd * g.w * 0.34, -g.h * 0.8]} hand={hd} coat={coat} W={W * 0.85} seed={`${seed}/cba`} />
      </g>,
    );
  }
  return (
    <FigFrame b={p}>
      {before}
      <Person seed={seed} legs torsoH={TORSO} legH={LEG} body={coat} hair={p.hair} acc={['collar']} ink={W} walk={p.walk} />
      <Ink d={shield + `M0 ${by - 9}V${by + 9}M-6 ${by - 2}H6`} width={W * 0.75} seed={`${seed}/badge`} />
      {after}
      {q > 0.02 ? (
        <>
          <Arm sh={sh} hand={hand} coat={coat} W={W * 0.85} seed={`${seed}/arm`} />
          <SparkleTablet x={hand[0]} y={hand[1] - (ts * 0.6) / s} size={ts / s} rot={side * (1 - q) * -30} twinkle={p.twinkle ?? true} ink={W * 0.8} seed={`${seed}/tab`} />
        </>
      ) : null}
    </FigFrame>
  );
};

// ---------------------------------------------------------------- Messenger

export type MessengerProps = Frame & {
  pullAt?: number;
  holdEnvelope?: boolean;
  envelopeSize?: number;
  /** The hand that pulls the envelope (default right, the shared prop's). */
  side?: 'left' | 'right';
  /** 'shoulder' (shared) | 'high' (above the head on that side: the reveal). */
  lift?: 'shoulder' | 'high';
  walk?: number;
};

/** World centre of the messenger's envelope once it is up. */
export function messengerEnvelope(p: Pick<MessengerProps, 'x' | 'y' | 'h' | 'seed' | 'side' | 'lift'>): Pt {
  const s = p.h / FIG_H;
  const g = personGeo(p.seed ?? 'msg');
  const sd = p.side === 'left' ? -1 : 1;
  const up: Pt = p.lift === 'high' ? [sd * g.w * 0.55, g.hy - g.hr * 2.1] : [sd * g.w * 0.7, -g.h * 0.92];
  return [p.x + (up[0] + sd * 6) * s, p.y - LEG * s + (up[1] - 16) * s];
}

export const Messenger: React.FC<MessengerProps> = (p) => {
  const t = useTime();
  const seed = String(p.seed ?? 'msg');
  const s = p.h / FIG_H;
  const g = personGeo(seed);
  const W = inkFor(p.h) / s;
  const q = p.holdEnvelope ? 1 : raiseQ(t, p.pullAt);
  const sd = p.side === 'left' ? -1 : 1;
  const sh: Pt = [sd * g.w * 0.34, -g.h * 0.8];
  const lo: Pt = [sd * g.w * 0.48, -g.h * 0.2];
  const up: Pt = p.lift === 'high' ? [sd * g.w * 0.55, g.hy - g.hr * 2.1] : [sd * g.w * 0.7, -g.h * 0.92];
  const hand: Pt = [lerp(lo[0], up[0], q), lerp(lo[1], up[1], q)];
  return (
    <FigFrame b={p}>
      <Person seed={seed} legs torsoH={TORSO} legH={LEG} body={palette.teal} hair="short" acc={['collar']} ink={W} walk={p.walk} />
      {q > 0.02 ? (
        <>
          <Envelope x={hand[0] + sd * 6} y={hand[1] - 16} size={(p.envelopeSize ?? 60) / s} rot={sd * lerp(30, -8, q)} carry={p.walk ? {} : undefined} depth="mid" seed={`${seed}/env`} />
          <Arm sh={sh} hand={hand} coat={palette.teal} W={W * 0.85} seed={`${seed}/arm`} />
        </>
      ) : null}
    </FigFrame>
  );
};
