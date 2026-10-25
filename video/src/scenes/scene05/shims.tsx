// S05 LOCAL STAND-IN for a props-lane figure (src/scenes/shared/props/Figures.tsx), same name, a superset of the shared
// prop. Swap back to `import {Investigator} from '../shared/props'` once the props lane adds:
//   Investigator: `tabletSize` (world px, default 60), `tabletLift` ('overhead' | 'head': the raised hand beside the
//                 head instead of above it), `pose` (a second arm: 'point' at a world target from `poseAt`, 'shade' (a
//                 hand at the brow, elbow out: looking up), 'hips' (both hands on the hips), 'clipboard' (held at the
//                 side)), `acc` (kit accessories: backpack, headphones, strap...), `lanyard` (fix round 2: the badge is
//                 NOT drawn on the back any more: only its strap, a thin ink line round the nape) and `badge` (default
//                 false here; the shared prop always draws its back shield).
// The messenger is the SHARED props Messenger again (fix round 2: ink hair + collar band, the right hand's envelope at
// the shoulder: exactly S06's), run pose in scene05/messenger.tsx. The figure geometry, coat, sleeve and tablet are the
// shared ones (personGeo / SparkleTablet mirrored from Figures.tsx). Feet anchor (x, y), h = total height (world px).
import React from 'react';
import {palette} from '../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../lib/time';
import {rand, rng, Seed} from '../../lib/rng';
import {Ink} from '../../lib/Ink';
import {Fill} from '../../lib/Fill';
import {Acc, Hair, Person} from '../../lib/kit';
import {blob, polyPath, roundRect, Pt} from '../../lib/sketch';
import {mat, XG} from '../../lib/xf';
import {SparkleTablet, sparklePath} from '../shared/props';

export const TORSO = 95;
export const LEG = 62;
export const FIG_H = 199;

/** Mirrors Figures.tsx personGeo (the kit Person's first random draws for a seed). */
export function personGeo(seed: Seed, torsoH = TORSO) {
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
  /** 'overhead' (shared: the hand above the head) | 'head' (the hand beside the head: the tablet at head height) |
   *  'high' (fix round 4: the arm up and OUT to the side, the tablet clear above the head line). */
  tabletLift?: 'overhead' | 'head' | 'high';
  pose?: InvestigatorPose;
  walk?: number;
  /** Kit accessories (default none: no kit V collar). */
  acc?: Acc[];
  /** Hair colour (passed to the kit: pick one that never reads as skin). */
  hairColor?: string;
  /** The lanyard strap round the nape (default true unless the hair is long: it would sit on the hair). */
  lanyard?: boolean;
  /** The old back shield badge (default false: badges hang in FRONT). */
  badge?: boolean;
  /** Fix round 3: the tablet held LANDSCAPE (rotated 90 deg: it stops rhyming with the portrait lock box above). */
  landscape?: boolean;
  /** Fix round 3: white sneakers over the kit's shoe blocks and a flat sand contact sliver under the soles (the figure
   *  stands ON the tread). Default true. */
  shoes?: boolean;
  /** Fix round 3: a PONYTAIL hanging from the back of the head down the coat (hair colour, ink outline) with a hair tie
   *  of this colour at its root (ref 2 f_33): the hair separates from the coat. Use with a 'short' head. */
  ponytail?: string;
  /** Fix round 4: a stepped flat GLOW behind the raised tablet (WORLD px radii [inner white, outer mintPale], no blur, no
   *  opacity): the tablet reads as a light source at thumbnail size. Pops (spring) as the tablet comes up; `glowStepAt`
   *  steps it down to the inner disc (one frame). */
  glow?: [number, number];
  glowStepAt?: number;
  /** Fix round 4: a big four-point INK sparkle just above the raised tablet (r in WORLD px, white keyline) + two tick
   *  stars: pops (spring) at `at`, twinkles once (size) at `twinkleAt`, pops off (one shrunken frame) at `outAt`. */
  sparkle?: {at: number; twinkleAt: number; outAt: number; r?: number};
};

/** World centre of an investigator's raised tablet (for beams). */
export function tabletCentre(p: Pick<InvestigatorProps, 'x' | 'y' | 'h' | 'seed' | 'arm' | 'tabletSize' | 'tabletLift' | 'landscape'>): Pt {
  const s = p.h / FIG_H;
  const g = personGeo(p.seed);
  const side = p.arm === 'left' ? -1 : 1;
  const ts = p.tabletSize ?? 60;
  const up = liftUp(p.tabletLift, side, g);
  const hipY = p.y - LEG * s;
  return [p.x + up[0] * s, hipY + up[1] * s - ts * tabletRise(p.landscape)];
}

/** The raised hand (person-local units) for a lift. */
function liftUp(lift: InvestigatorProps['tabletLift'], side: number, g: ReturnType<typeof personGeo>): Pt {
  if (lift === 'head') return [side * g.w * 0.66, g.hy];
  if (lift === 'high') return [side * g.w * 0.78, g.hy - g.hr * 1.4];
  return [side * g.w * 0.62, g.hy - g.hr * 1.7];
}

/** The tablet centre above the hand (x its width): the hand overlaps the bottom edge (portrait 0.71, landscape 0.5). */
const tabletRise = (landscape?: boolean) => (landscape ? 0.42 : 0.6);

/** Fix round 3: white sneakers seen from behind (heel caps over the kit's shoe blocks, a sole line) and the flat sand
 *  contact sliver under them (person-local units: hip line 0, soles at LEG). */
const legX = (w: number) => {
  const lw = w * 0.31;
  const g = w * 0.05;
  return [[-g - lw, -g], [g, g + lw]] as [number, number][];
};
const Sliver: React.FC<{w: number; seed: string}> = ({w, seed}) => (
  <Fill d={blob(0, LEG + 1.5, w * 0.52, 4.2, {seed: `${seed}/cs`})} color={palette.sand} offset={false} mode="none" seed={`${seed}/csf`} />
);
const Sneakers: React.FC<{w: number; W: number; seed: string}> = ({w, W, seed}) => {
  const d = legX(w)
    .map(([a, b]) => roundRect(a - 2.5, LEG - 13, b - a + 5, 15.5, 5))
    .join('');
  const sole = legX(w)
    .map(([a, b]) => `M${(a - 1.5).toFixed(1)} ${(LEG - 3).toFixed(1)}H${(b + 1.5).toFixed(1)}`)
    .join('');
  return (
    <>
      <Fill d={d} color={palette.white} offset={false} mode="none" seed={`${seed}/snF`} />
      <Ink d={d + sole} width={W * 0.75} taper={false} vary={0} seed={`${seed}/snI`} />
    </>
  );
};

/** Fix round 4: the stepped flat glow behind a raised tablet (person-local units: centre c, radii r = [white, mintPale]):
 *  pops with a spring at `at`, steps down to the white disc at `stepAt`. */
const TabletGlow: React.FC<{c: Pt; r: [number, number]; at: number; stepAt?: number; seed: string}> = ({c, r, at, stepAt, seed}) => {
  const t = useTime();
  const k = springAt(t, at, springs.pop);
  if (k <= 0.01) return null;
  const outer = stepAt === undefined || t < stepAt;
  return (
    <XG m={mat.about(mat.scale(k), c[0], c[1])}>
      {outer ? <Fill d={blob(c[0], c[1], r[1], r[1] * 0.94, {seed: `${seed}/go`})} color={palette.mintPale} offset={false} mode="none" seed={`${seed}/goF`} /> : null}
      <Fill d={blob(c[0], c[1], r[0], r[0] * 0.92, {seed: `${seed}/gi`})} color={palette.white} offset={false} mode="none" seed={`${seed}/giF`} />
    </XG>
  );
};

/** One four-point ink star with a white keyline (so it reads over the plan's linework), centre (x, y), radius r. */
const Star: React.FC<{x: number; y: number; r: number; k: number; seed: string}> = ({x, y, r, k, seed}) => (
  <XG m={mat.about(mat.scale(k), x, y)}>
    <Fill d={sparklePath(x, y, r + Math.max(3.2, r * 0.22), 0.34)} color={palette.white} offset={false} mode="none" seed={`${seed}/kl`} />
    <Fill d={sparklePath(x, y, r, 0.26)} color={palette.ink} offset={false} mode="none" seed={`${seed}/st`} />
  </XG>
);

/** Fix round 4: the big 'AI' sparkle just above a raised tablet (person-local units: the tablet's top centre `top`, the
 *  star radius r): pops (spring) at `at` with two tick stars (0.04 s later), twinkles once by SIZE at `twinkleAt` (the
 *  ticks 0.04 s after), and pops off (one 0.72 frame) at `outAt`. `side` puts the ticks on the tablet's outer side. */
const TabletSparkle: React.FC<{top: Pt; r: number; at: number; twinkleAt: number; outAt: number; side: number; seed: string}> = ({top, r, at, twinkleAt, outAt, side, seed}) => {
  const t = useTime();
  if (t < at || t >= outAt + 1 / 30) return null;
  const off = t >= outAt ? 0.72 : 1;
  const tw = (t0: number, a: number) => 1 + a * Math.sin(Math.PI * prog(t, t0, 0.16));
  const k = springAt(t, at, springs.pop) * tw(twinkleAt, 0.42) * off;
  const k2 = springAt(t, at + 0.04, springs.pop) * tw(twinkleAt + 0.04, 0.7) * off;
  const c: Pt = [top[0], top[1] - r * 1.15];
  return (
    <>
      <Star x={c[0] + side * r * 1.55} y={c[1] - r * 0.55} r={r * 0.3} k={k2} seed={`${seed}/t1`} />
      <Star x={c[0] + side * r * 1.1} y={c[1] + r * 0.72} r={r * 0.22} k={k2} seed={`${seed}/t2`} />
      <Star x={c[0]} y={c[1]} r={r} k={k} seed={`${seed}/s`} />
    </>
  );
};

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
  const up = liftUp(p.tabletLift, side, g);
  const down: Pt = [side * g.w * 0.5, -g.h * 0.05];
  const hand: Pt = [lerp(down[0], up[0], q), lerp(down[1], up[1], q)];
  const by = -g.h * 0.62;
  const shield = `M${-11} ${by - 13}Q0 ${by - 17} 11 ${by - 13}L11 ${by}Q9 ${by + 11} 0 ${by + 16}Q-9 ${by + 11} -11 ${by}Z`;
  // the lanyard: its strap seen from behind, a shallow U round the nape from shoulder-neck to shoulder-neck (~2 px)
  const ny = -g.h;
  const lan = `M${(-g.hr * 0.95).toFixed(1)} ${(ny + g.hr * 0.12).toFixed(1)}Q0 ${(ny + g.hr * 0.62).toFixed(1)} ${(g.hr * 0.95).toFixed(1)} ${(ny + g.hr * 0.12).toFixed(1)}`;
  const lanOn = p.lanyard ?? (p.hair !== 'long' && !p.ponytail);
  const shoesOn = p.shoes ?? true;
  // the ponytail: a tapered tail from the back of the head down over the collar, its tie at the root
  const pt = p.ponytail
    ? (() => {
        const r = g.hr;
        const y0 = g.hy + r * 0.45;
        const y1 = g.hy + r * 2.75;
        const tail = `M${-r * 0.3} ${y0}C${-r * 0.42} ${y0 + r * 0.9} ${-r * 0.3} ${y1 - r * 0.6} ${r * 0.06} ${y1}C${r * 0.22} ${y1 - r * 0.7} ${r * 0.4} ${y0 + r * 0.9} ${r * 0.3} ${y0}Z`;
        const tie = roundRect(-r * 0.33, y0 + r * 0.02, r * 0.66, r * 0.24, r * 0.1);
        return {tail, tie, strand: `M${-r * 0.02} ${y0 + r * 0.45}C${-r * 0.08} ${y0 + r * 1.1} ${0} ${y1 - r * 0.7} ${r * 0.05} ${y1 - r * 0.35}`};
      })()
    : null;
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
  // the tablet's centre and top (person-local), for the glow and the sparkle
  const tabC: Pt = [hand[0], hand[1] - (ts * tabletRise(p.landscape)) / s];
  const tabTop: Pt = [tabC[0], tabC[1] - (p.landscape ? ts : ts * 1.42) / 2 / s];
  return (
    <FigFrame b={p}>
      {shoesOn ? <Sliver w={g.w} seed={seed} /> : null}
      {p.glow && p.raiseAt !== undefined && q > 0.02 ? <TabletGlow c={tabC} r={[p.glow[0] / s, p.glow[1] / s]} at={p.raiseAt + 0.08} stepAt={p.glowStepAt} seed={`${seed}/glow`} /> : null}
      {before}
      <Person seed={seed} legs torsoH={TORSO} legH={LEG} body={coat} hair={p.hair} hairColor={p.hairColor} acc={p.acc ?? []} ink={W} walk={p.walk} />
      {shoesOn ? <Sneakers w={g.w} W={W} seed={seed} /> : null}
      {pt ? (
        <>
          <Fill d={pt.tail} color={p.hairColor ?? palette.brown} offset={false} mode="none" seed={`${seed}/ptF`} />
          <Ink d={pt.tail + pt.strand} width={W * 0.8} taper={false} seed={`${seed}/ptI`} />
          <Fill d={pt.tie} color={p.ponytail ?? palette.peach} offset={false} mode="none" seed={`${seed}/tieF`} />
          <Ink d={pt.tie} width={W * 0.6} taper={false} vary={0} seed={`${seed}/tieI`} />
        </>
      ) : null}
      {lanOn ? <Ink d={lan} width={W * 0.62} taper={false} seed={`${seed}/lan`} /> : null}
      {p.badge ? <Ink d={shield + `M0 ${by - 9}V${by + 9}M-6 ${by - 2}H6`} width={W * 0.75} seed={`${seed}/badge`} /> : null}
      {after}
      {q > 0.02 ? (
        <>
          <Arm sh={sh} hand={hand} coat={coat} W={W * 0.85} seed={`${seed}/arm`} />
          <SparkleTablet x={tabC[0]} y={tabC[1]} size={ts / s} rot={(p.landscape ? 90 : 0) + side * (1 - q) * -30} twinkle={p.twinkle ?? true} ink={W * 0.8} seed={`${seed}/tab`} />
          {p.sparkle ? <TabletSparkle top={tabTop} r={(p.sparkle.r ?? 22) / s} at={p.sparkle.at} twinkleAt={p.sparkle.twinkleAt} outAt={p.sparkle.outAt} side={side} seed={`${seed}/spk`} /> : null}
        </>
      ) : null}
    </FigFrame>
  );
};
