// props/Figures.tsx — back-view figure PRESETS (P11) built on the kit <Person> (and cine tinyFigure for specks); Keeper,
// Caretaker and the Ghost are drawn by BackBody, and every cap wearer (incl. EdgeOnlooker hair="cap") gets BackHead: a cap
// with a strap notch showing hair, a smooth nape, a sand neck, a straight collar band (review 5: no face read on a phone).
// People are always seen from behind. Anchors are the FEET (x, y on the ground) and `h` = total height in world px,
// except EdgeOnlooker (head centre + head diameter; the coat always runs off the frame bottom).
//
//   <EdgeOnlooker x={80} y={1290} head={110} riseAt={0.2} raisePhoneAt={31.9} />        // tier A, cropped by the bottom
//   <Citizen x={600} y={1260} h={48} riseAt={1.06} />  <Citizen ... silhouette />        // 40-55 px, or a flat sage cut-out
//   <Investigator x={230} y={1470} h={130} riseAt={22.2} raiseAt={22.9} />               // shield badge, sparkle tablet
//   <Messenger x={905} y={1470} h={130} pullAt={25.30} walk={{at: 25.5, to: [1200, 1470]}} />
//   <Maker x={800} y={1260} h={50} bust />  <Maker ... h={200} walkHz={1.8} />           // cream apron (Y straps) over teal
//   <Keeper x={480} y={1450} h={300} reachAt={48.5} holding={<NewLockIcon/>} installAt={49.0} />
//   <Caretaker x={670} y={1380} h={225} raiseKeysAt={68.2} jingleAt={69.0} glintAt={69.3} />
//   <Attempter x={300} y={1290} h={30} mode="tap" tapAt={[37.1, 37.6]} />  <AttemptStipple spots=[...] />
//   <Ghost x={500} y={1420} h={180} at={18.2} walk={{hz: 1.4}} />                       // ink-only line art (S04)
// Common anims: riseAt (rises its own height from behind its feet line, out(exp) 0.33 s), walk (steps in place; move
// x / y yourself or pass walk.to), bob (idle px), raisePhoneAt / raiseAt (an arm swings up, 0.3 s).

import React, {useId} from 'react';
import {canvas, palette, stroke, world} from '../../../lib/theme';
import {ease as E, lerp, osc, prog, springAt, springs, useTime} from '../../../lib/time';
import {rng, rand, Seed} from '../../../lib/rng';
import {Ink} from '../../../lib/Ink';
import {Fill} from '../../../lib/Fill';
import {Look, ExitFade, ExitSync, useLook} from '../../../lib/exit';
import {MOTION} from '../../../lib/spec';
import {Acc, Hair, Person, PERSON_BODIES, PERSON_HAIR} from '../../../lib/kit';
import {tinyFigure} from '../../../lib/cine/figures';
import {PathBuf} from '../../../lib/cine/util';
import {arc, blob, circle, crown, line, polyPath, rectPath, roundRect, smooth, torso, Pt} from '../../../lib/sketch';
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

/** The kit Person's hair-style weights (mirror of makeSpec). */
const KIT_HAIR: (readonly [Hair, number])[] = [['short', 5], ['long', 2.2], ['bun', 1], ['cap', 1], ['beanie', 0.9], ['curly', 1.2]];

/** The kit Person's seeded picks for a preset figure (torsoH and acc always given, hairColor / legsColor / packColor /
 *  signColor never given): mirrors makeSpec's draw order w, hr, round, [hair], [body], hairColor (+ its coat-clash
 *  swap), legs, shoes, pack, hat, sign, phase. */
function kitPicks(seed: Seed, hair?: Hair, body?: string) {
  const r = rng(`person/${seed}`);
  const w = r.range(86, 100);
  const hr = w * r.range(0.23, 0.26);
  r.next(); // round
  const style: Hair = hair ?? r.weighted<Hair>(KIT_HAIR);
  const coat = body ?? r.pick(PERSON_BODIES);
  let hairColor: string = r.pick(PERSON_HAIR);
  if (hairColor === coat) hairColor = hairColor === palette.ink ? palette.tan : palette.ink;
  for (let i = 0; i < 5; i++) r.next(); // legs, shoes, pack, hat, sign
  return {w, hr, style, coat, hairColor, phase: r.range(0, 6.28)};
}

/** A hair colour that never reads as SKIN (S06 review: a sand head disc next to sand ears and neck reads as a bald head
 *  or a face, not the back of a head): sand -> ochre (ink-brown on an ochre coat); clay (tan) too when the hair is a
 *  plain disc (`style` 'short' / 'bun': no strands at preset sizes). Long / curly shapes read as hair in any colour.
 *  With `seed` (fix round: crowd variety), clay goes to ochre OR ink-brown by a seeded coin (ink-brown on an ochre
 *  coat), so a crowd's swapped heads are not all ochre; without it clay -> ochre as before. */
export const skinSafeHair = (c: string, coat?: string, style?: Hair, seed?: Seed) => {
  const sand = c === palette.sand;
  const clay = c === palette.tan && (style === 'short' || style === 'bun');
  if (!sand && !clay) return c;
  const dark = coat === palette.brown || (clay && seed !== undefined && rand(seed, 'hairfix') < 0.5);
  return dark ? palette.ink : palette.brown;
};

/** The kit Person's per-person hero-head threshold (head diameter in px at its lod scale; mirror of Person.tsx headT):
 *  the kit ramps hero strands + a notched nape in over headT -5 .. +5. */
const kitHeadT = (seed: Seed) => 60 * (1 + 0.1 * (rand(`person/${seed}`, 'lodN') - 0.5));
/** How far the kit's hero head (strands + notched nape) is in for a head of `headPx` (mirror of Person.tsx headA). */
const kitHeadA = (seed: Seed, headPx: number) => Math.max(0, Math.min(1, (headPx - (kitHeadT(seed) - 5)) / 10));

/** The kit Person's head and hair outline(s) for `seed` (person-local units, torso `torsoH`), for cutting a collar band
 *  around them: the head disc, plus the 'long' hair shape / the 'curly' crown, plus the hero nape notch scaled like the
 *  kit's (`headA`). Paths are filled AND stroked by the caller at the ink width (so the band stops at the outline). */
function kitHeadHoles(seed: Seed, hair: Hair | undefined, body: string | undefined, torsoH: number, headA = 0): string[] {
  const kp = kitPicks(seed, hair, body);
  const hr = kp.hr;
  const sd = `person/${seed}`;
  const hy = -torsoH - hr * 0.86;
  // the kit's own head fill + ink circle (same seeds as Person.tsx / HairOver)
  const out = [blob(0, hy, hr, hr, {seed: `${sd}/head`}), circle(0, hy, hr, {seed: `${sd}/head`, overlap: 18})];
  if (kp.style === 'long') {
    const pts: Pt[] = [[-hr * 0.98, hy + hr * 1.75], [-hr * 1.08, hy + hr * 0.6], [-hr * 0.95, hy - hr * 0.55], [0, hy - hr * 1.05], [hr * 0.95, hy - hr * 0.55], [hr * 1.08, hy + hr * 0.6], [hr * 0.98, hy + hr * 1.75], [hr * 0.5, hy + hr * 1.9], [-hr * 0.5, hy + hr * 1.9]];
    out.push(smooth(pts, {closed: true}));
  }
  if (kp.style === 'curly') out.push(crown(0, hy - 2, hr * 1.1, hr * 1.06, {seed: `${sd}/curl`, bumps: 9, round: 0.7}));
  if (headA > 0.02 && (kp.style === 'short' || kp.style === 'bun' || kp.style === 'cap' || kp.style === 'curly')) {
    const top = hy + hr * 0.55;
    const Y = (k: number) => top + (hy + hr * k - top) * headA;
    out.push(polyPath([[-hr * 0.72, top], [hr * 0.72, top], [hr * 0.72, Y(0.7)], [hr * 0.36, Y(1.14)], [0, Y(1.0)], [-hr * 0.36, Y(1.14)], [-hr * 0.72, Y(0.7)]]));
  }
  return out;
}

/** The kit Person's walk bob (local units, presets' legH) at time t for a seed walking at hz (0 when not walking). */
const kitWalkBob = (seed: Seed, t: number, hz: number | undefined, hair: Hair | undefined, body: string | undefined, legs = true) =>
  hz && legs ? -Math.abs(Math.sin(t * hz * Math.PI + kitPicks(seed, hair, body).phase)) * LEG * 0.035 : 0;

/** Redraws the kit Person's hair for `seed` in `color`, right after that Person (person-local units, torso `torsoH`):
 *  the kit's own geometry and seeds, so the misregistered fill and the open ink circle land exactly on the kit's. The
 *  head disc ('short'; 'bun' + its bun and part line; 'curly' + its crown) or the 'long' hair shape; 'cap' / 'beanie' /
 *  'bald' draw nothing. It does NOT pass `hairColor` to the kit (that skips a seeded draw and re-seeds the trousers,
 *  shoes and walk phase: S05 -> S06 continuity, S06's planted stride); it rides the kit's walk bob, relights at the
 *  kit's anchor and un-builds in the kit's ExitSync group. */
const HairOver: React.FC<{seed: Seed; hair?: Hair; body?: string; color: string; W: number; torsoH?: number; lod?: 0 | 1; walkHz?: number; legs?: boolean}> = ({seed, hair, body, color, W, torsoH = TORSO, lod = 0, walkHz, legs = true}) => {
  const t = useTime();
  // `hair` / `body` exactly as given to the kit Person (undefined = its seeded pick): they set its draw order
  const kp = kitPicks(seed, hair, body);
  const style = kp.style;
  if (style === 'cap' || style === 'beanie' || style === 'bald') return null;
  const hr = kp.hr;
  const sd = `person/${seed}`;
  const k = (n: string) => `${sd}/${n}`;
  const hy = -torsoH - hr * 0.86;
  const inked = W > 0;
  const bob = kitWalkBob(seed, t, walkHz, hair, body, legs);
  const parts: React.ReactNode[] = [];
  if (style === 'long') {
    const pts: Pt[] = [[-hr * 0.98, hy + hr * 1.75], [-hr * 1.08, hy + hr * 0.6], [-hr * 0.95, hy - hr * 0.55], [0, hy - hr * 1.05], [hr * 0.95, hy - hr * 0.55], [hr * 1.08, hy + hr * 0.6], [hr * 0.98, hy + hr * 1.75]];
    parts.push(<Fill key="hairF" d={smooth(pts, {closed: true})} color={color} seed={k('hair')} />);
    if (inked) parts.push(<Ink key="hair" d={smooth([...pts, [-hr * 0.5, hy + hr * 1.9], [-hr * 0.98, hy + hr * 1.75]] as Pt[], {})} width={W} seed={k('hairI')} />);
    if (inked && lod === 0) parts.push(<Ink key="hairD" d={`M${-hr * 0.35} ${hy - hr * 0.4}L${-hr * 0.4} ${hy + hr * 1.35}M${hr * 0.3} ${hy - hr * 0.3}L${hr * 0.33} ${hy + hr * 1.25}`} width={W * 0.8} order="all" seed={k('hairD')} />);
  } else {
    const headD = blob(0, hy, hr, hr, {seed: `${sd}/head`});
    parts.push(<Fill key="headF" d={headD} color={color} seed={k('head')} />);
    // dark hair: also the exact disc, so the misregistration gap never leaves the outline floating as a separate arc
    // over the head (it read as a cowlick at 260 px); the kit's offset disc stays covered by the first fill
    if (color === palette.ink || color === palette.tealDark) parts.push(<Fill key="headF0" d={headD} color={color} offset={false} seed={k('head0')} />);
    if (inked) parts.push(<Ink key="head" d={circle(0, hy, hr, {seed: `${sd}/head`, overlap: 18})} width={W} open={0.12} seed={k('head')} />);
    if (style === 'curly') {
      const cd = crown(0, hy - 2, hr * 1.1, hr * 1.06, {seed: `${sd}/curl`, bumps: 9, round: 0.7});
      parts.push(<Fill key="hairF" d={cd} color={color} seed={k('hair')} />);
      if (inked) parts.push(<Ink key="hair" d={cd} width={W} seed={k('hairI')} />);
    }
    if (style === 'bun') {
      if (inked && lod === 0) parts.push(<Ink key="part" d={line(-hr * 0.1, hy - hr * 0.62, hr * 0.32, hy - hr * 0.1, {over: [0, 0], seed: `${sd}/part`})} width={W * 0.85} seed={k('hairI')} />);
      parts.push(<Fill key="bunF" d={blob(0, hy - hr * 1.12, hr * 0.38, hr * 0.36, {seed: `${sd}/bun`})} color={color} seed={k('bun')} />);
      if (inked) parts.push(<Ink key="bun" d={circle(0, hy - hr * 1.12, hr * 0.38, {seed: `${sd}/bun`, overlap: 10})} width={W} seed={k('bunI')} />);
    }
  }
  return (
    <XG m={mat.translate(0, bob)}>
      <TodAnchor at={[0, -torsoH * 0.5]}>
        <ExitSync seed={`${sd}/exit`}>{parts}</ExitSync>
      </TodAnchor>
    </XG>
  );
};

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

export type FigureArmProps = {
  /** Shoulder and hand (wrist end of the sleeve), person-local units. */
  sh: Pt;
  hand: Pt;
  /** Sleeve width at the shoulder (default 19); it tapers to 0.9 x at the elbow and 0.74 x at the wrist. */
  w?: number;
  coat: string;
  /** Local ink width. */
  W: number;
  seed: string;
  /** Sand hand at the wrist, behind the cuff (default true). false = the caller draws the hand (`PhoneGrip`). */
  hand2?: boolean;
  /** Elbow bend in degrees (the angle between upper arm and forearm directions). Default: FOLLOWS THE RAISE, 0 while
   *  the arm hangs, easing to 30 once the hand is level with the shoulder or above. */
  bend?: number;
  /** Which side the elbow goes to: +1 = out toward +x on a raised arm (down on a level one). Default: the shoulder's
   *  side (sign of sh[0]), i.e. always outward / down. */
  side?: 1 | -1;
  /** Explicit elbow point (overrides `bend` / `side`): for arms driven by joint angles (EdgeOnlooker's phone raise). */
  elbow?: Pt;
};

/** A jointed sleeve from the shoulder to the hand (local person units; S07 review: no more straight tubes swung as
 *  rigid sticks). Upper arm and forearm are straight and meet at an ELBOW pushed off the shoulder-hand chord by the
 *  bend (outward / down, so it never cuts into the body), its outer corner rounded, its inner corner tighter with a
 *  small crease; the sleeve TAPERS 1 -> 0.9 -> 0.74 toward the wrist, a CUFF line crosses it near the end and a sand
 *  hand (inked) sits behind the cuff. The hand point is where the sleeve ends, as before, so held things (tablet, keys,
 *  envelope, phone) keep their positions. */
export const FigureArm: React.FC<FigureArmProps> = ({sh, hand, w = 19, coat, W, seed, hand2 = true, bend, side, elbow}) => {
  const dx = hand[0] - sh[0];
  const dy = hand[1] - sh[1];
  const d = Math.hypot(dx, dy) || 1e-6;
  const ux = dx / d;
  const uy = dy / d;
  const sd = side ?? (sh[0] < 0 ? -1 : 1);
  // the raise: 0 hanging .. PI straight up; the bend eases in from ~20 deg to ~100 deg of elevation
  const elev = Math.acos(Math.max(-1, Math.min(1, uy)));
  const bendDeg = Math.max(0, Math.min(80, bend ?? 30 * E.inOutSine(Math.max(0, Math.min(1, (elev - 0.35) / 1.45)))));
  const off = (d / 2) * Math.tan((bendDeg * Math.PI) / 360);
  const pv: Pt = [sd * -uy, sd * ux];
  const El: Pt = elbow ?? [sh[0] + dx * 0.5 + pv[0] * off, sh[1] + dy * 0.5 + pv[1] * off];
  const nrm = (a0: Pt, b0: Pt): Pt => {
    const L = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]) || 1;
    return [-(b0[1] - a0[1]) / L, (b0[0] - a0[0]) / L];
  };
  const n1 = nrm(sh, El);
  const n2 = nrm(El, hand);
  let mx = n1[0] + n2[0];
  let my = n1[1] + n2[1];
  const mL = Math.hypot(mx, my) || 1;
  mx /= mL;
  my /= mL;
  const ml = Math.min(2.2, 1 / Math.max(0.45, mx * n1[0] + my * n1[1]));
  const h0 = w / 2;
  const h1 = h0 * 0.9;
  const h2 = h0 * 0.74;
  const A: Pt[] = [[sh[0] + n1[0] * h0, sh[1] + n1[1] * h0], [El[0] + mx * h1 * ml, El[1] + my * h1 * ml], [hand[0] + n2[0] * h2, hand[1] + n2[1] * h2]];
  const B: Pt[] = [[sh[0] - n1[0] * h0, sh[1] - n1[1] * h0], [El[0] - mx * h1 * ml, El[1] - my * h1 * ml], [hand[0] - n2[0] * h2, hand[1] - n2[1] * h2]];
  // which side is the outer (convex) one: the forearm turns away from it
  const cr = (El[0] - sh[0]) * (hand[1] - El[1]) - (El[1] - sh[1]) * (hand[0] - El[0]);
  const outerA = mx * n1[0] + my * n1[1] > 0 ? cr < 0 : cr > 0;
  const f = (p: Pt) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const toward = (a: Pt, b: Pt, r: number): Pt => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const k = Math.min(0.45, r / L);
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  };
  /** one sleeve side: straight, a rounded corner at the elbow (radius r), straight */
  const sideD = (P: Pt[], r: number, rev = false) => {
    const pa = toward(P[1], P[0], r);
    const pb = toward(P[1], P[2], r);
    return rev ? `L${f(P[2])}L${f(pb)}Q${f(P[1])} ${f(pa)}L${f(P[0])}` : `M${f(P[0])}L${f(pa)}Q${f(P[1])} ${f(pb)}L${f(P[2])}`;
  };
  const rA = outerA ? w * 0.7 : w * 0.22;
  const rB = outerA ? w * 0.22 : w * 0.7;
  const fillD = sideD(A, rA) + sideD(B, rB, true) + 'Z';
  const at = (P: Pt[], u: number): Pt => [P[1][0] + (P[2][0] - P[1][0]) * u, P[1][1] + (P[2][1] - P[1][1]) * u];
  const cuff = `M${f(at(A, 0.8))}L${f(at(B, 0.8))}`;
  const inner = outerA ? B : A;
  const outer = outerA ? A : B;
  const crease = bendDeg > 12 || elbow ? `M${f(inner[1])}L${f([inner[1][0] + (outer[1][0] - inner[1][0]) * 0.3, inner[1][1] + (outer[1][1] - inner[1][1]) * 0.3])}` : '';
  const fx = hand[0] - El[0];
  const fy = hand[1] - El[1];
  const fL = Math.hypot(fx, fy) || 1;
  const handD = hand2 ? blob(hand[0] + (fx / fL) * w * 0.28, hand[1] + (fy / fL) * w * 0.28, w * 0.4, w * 0.44, {seed: `${seed}/h`}) : '';
  return (
    <>
      {hand2 ? <Fill d={handD} color={palette.sand} offset={false} mode="none" seed={`${seed}/hf`} /> : null}
      {hand2 ? <Ink d={handD} width={W * 0.8} taper={false} seed={`${seed}/hi`} /> : null}
      <Fill d={fillD} color={coat} offset={false} mode="none" seed={`${seed}/af`} />
      <Ink d={`${sideD(A, rA)}${sideD(B, rB)}M${f(A[2])}L${f(B[2])}`} width={W} taper={false} seed={`${seed}/ai`} />
      <Ink d={cuff + crease} width={W * 0.75} taper={false} seed={`${seed}/ac`} />
    </>
  );
};
const Arm = FigureArm;

/** The hand around a held phone, in the phone's frame (phone x -11..11, y -42..-4, the wrist at 0, 0): `back` = the
 *  palm behind the phone, cupping its lower edge (draw before the phone); front = the thumb and two finger tips
 *  wrapping its sides near the bottom (draw after). `thumb` = the side the thumb is on (toward the body's midline). */
const PhoneGrip: React.FC<{W: number; seed: string; thumb: 1 | -1; back?: boolean}> = ({W, seed, thumb, back}) => {
  if (back) {
    const palm = blob(0, -5, 12.5, 9, {seed: `${seed}/palm`});
    return (
      <>
        <Fill d={palm} color={palette.sand} offset={false} mode="none" seed={`${seed}/palmF`} />
        <Ink d={palm} width={W * 0.75} taper={false} seed={`${seed}/palmI`} />
      </>
    );
  }
  const th = blob(thumb * 11.5, -10, 3.6, 5.8, {seed: `${seed}/th`});
  const fg = blob(-thumb * 11.8, -15.5, 3.3, 3.9, {seed: `${seed}/f1`}) + blob(-thumb * 11.8, -8.5, 3.3, 3.7, {seed: `${seed}/f2`});
  return (
    <>
      <Fill d={th + fg} color={palette.sand} offset={false} mode="none" seed={`${seed}/gf`} />
      <Ink d={th + fg} width={W * 0.6} taper={false} seed={`${seed}/gi`} />
    </>
  );
};

/** The quadratic p0 -> p2 (control p1) cut at u (de Casteljau), as a path. */
const quadTo = (p0: Pt, p1: Pt, p2: Pt, u: number): string => {
  const a: Pt = [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u)];
  const b: Pt = [lerp(p1[0], p2[0], u), lerp(p1[1], p2[1], u)];
  const c: Pt = [lerp(a[0], b[0], u), lerp(a[1], b[1], u)];
  return `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}Q${a[0].toFixed(2)} ${a[1].toFixed(2)} ${c[0].toFixed(2)} ${c[1].toFixed(2)}`;
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
  /** Hair colour. Default: the kit's seeded pick, except a sand (skin-coloured) pick, which becomes ochre / ink-brown,
   *  and a clay pick on a 'short' / 'bun' head below the kit's hero-head size (~60-66 px), which becomes ochre or
   *  ink-brown by a seeded coin. */
  hairColor?: string;
  /** Accessories of the kit Person ('backpack' is dropped: it scales with the cropped torso; 'phone' = holding it up;
   *  'collar' = a straight collar band one step darker than the coat, not the kit's V). */
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
export const EdgeOnlooker: React.FC<EdgeOnlookerProps> = ({x, y, head = 110, seed = 'onl', hair, hairColor, acc, body, riseAt, bob = 1.5, raisePhoneAt, lowerPhoneAt, phoneSide, arms = 'both', depth = 'front', rim = 'left', frameBottom}) => {
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
  // hair: never the kit cap (from behind its dark nape band under a dome reads as a bearded face, review 4) and no kit
  // head under a cap at all (its zig-zag hero nape did the same, review 5): 'cap' = our BackHead (cap with a strap
  // notch, smooth nape, sand neck) over a straight collar band, the head raised so the neck shows; the kit Person is
  // drawn bald and clipped to the torso. Hoods are drawn here (the kit draws them only on heroes).
  const capOn = hair === 'cap';
  const lift = capOn ? 1.32 : 0.86; // head centre above the torso top, in head radii
  // torso length so the hip line (coat bottom) sits below it; quantised so the path is not rebuilt every frame
  const need = (yb + 30 - y) / s - g0.hr * lift;
  const torsoH = Math.min(8000, Math.max(220, Math.ceil(need / 64) * 64));
  const g = personGeo(seed, torsoH);
  const hyUse = capOn ? -torsoH - g.hr * lift : g.hy;
  const hairUse: Hair = capOn ? 'bald' : hair ?? rng(`onl/${seed}`).pick<Hair>(['short', 'short', 'long', 'bun', 'curly', 'beanie']);
  const coat = body ?? personCoat(seed, true);
  // a seeded sand (skin) hair pick becomes ochre / ink-brown; so does clay on a plain disc ('short' / 'bun') while the
  // head is below the kit's hero-head size (fix round, S02 's2on/a' at 53 px: no strands, no nape, a clay disc read as a
  // bald head): only at >= the kit's per-person threshold + 3 px (~60-66 px, hero head >= 80 % in) do the hero strands +
  // notched nape make clay read as hair. Passed to the kit only then (it re-seeds the kit's later draws, which for an
  // onlooker only moves the hat / scarf colour), so every other onlooker is unchanged
  const kitHair = kitPicks(seed, hairUse, coat).hairColor;
  const headA = kitHeadA(seed, head);
  const safeHair = skinSafeHair(kitHair, coat, headA < 0.8 ? hairUse : undefined, seed);
  const hairFix = capOn ? undefined : hairColor ?? (safeHair !== kitHair ? safeHair : undefined);
  const capHair = coat === palette.brown ? palette.tan : palette.brown;
  const capColor = coat === palette.teal || coat === palette.sage ? palette.tealDark : palette.teal;
  const hoodOn = !!acc?.includes('hood') && hairUse !== 'long' && !capOn;
  const clipId = 'eo' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const holdPhone = !!acc?.includes('phone');
  const q = holdPhone ? 1 : raiseQ(t, raisePhoneAt, lowerPhoneAt);
  const jolt = raisePhoneAt !== undefined && t >= raisePhoneAt && t < raisePhoneAt + 0.2 ? -Math.sin(((t - raisePhoneAt) / 0.2) * Math.PI) * 6 : 0;
  const hipY = y - hyUse * s + jolt + (bob ? osc(t, 0.5, rand(seed, 'b') * 6) * bob : 0);
  // 'collar' = our straight CollarBand (the kit's V reads as a shirt front; under a cap BackHead already draws it)
  const collarOn = !!acc?.includes('collar') && !capOn;
  const accs: Acc[] = (acc ?? []).filter((a) => a !== 'phone' && a !== 'backpack' && a !== 'hood' && a !== 'collar');
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
    // the phone arm is driven by JOINT ANGLES (right-hand frame, mirrored for the left arm): the upper arm swings up
    // about the shoulder while the elbow folds the forearm up ahead of it (bend 30 deg at rest up, +30 deg mid-swing),
    // then the arm extends: hanging and raised poses (and so every phone's resting place) are exactly the old ones;
    // the palm cups the phone's lower edge, thumb + fingers wrap its sides, the phone follows the forearm
    const sh: Pt = [hw - d * 0.5, -g.h + R * 0.55];
    const hd: Pt = [xc - d * 0.5, yCuff + g.w * 0.06];
    const hu: Pt = [g.w * 0.62, hyUse - g.hr * 1.25];
    const a0 = Math.atan2(hd[1] - sh[1], hd[0] - sh[0]);
    const a1 = Math.atan2(hu[1] - sh[1], hu[0] - sh[0]);
    const qc = Math.max(0, Math.min(1, q));
    const B1 = Math.PI / 6;
    const beta = B1 * q + (Math.PI / 6) * Math.sin(Math.PI * qc);
    const lseg = lerp(Math.hypot(hd[0] - sh[0], hd[1] - sh[1]) / 2, Math.hypot(hu[0] - sh[0], hu[1] - sh[1]) / (2 * Math.cos(B1 / 2)), qc);
    const au = a0 + (a1 + B1 / 2 - a0) * q;
    const af = au - beta;
    const elR: Pt = [sh[0] + Math.cos(au) * lseg, sh[1] + Math.sin(au) * lseg];
    const handR: Pt = [elR[0] + Math.cos(af) * lseg, elR[1] + Math.sin(af) * lseg];
    const hand: Pt = [pside * handR[0], handR[1]];
    const elbowP: Pt = [pside * elR[0], elR[1]];
    const rot = (pside * (af - (a1 - B1 / 2)) * 180) / Math.PI;
    const phoneM = mat.compose(mat.translate(hand[0], hand[1]), mat.rotate(rot));
    // the coat's tension fold from the raised arm's armpit toward the spine: it draws on with the raise
    const fold = quadTo([pside * (hw - d * 1.1), -g.h + R * 1.0], [pside * hw * 0.5, -g.h + R + g.w * 0.26], [pside * hw * 0.16, -g.h + R + g.w * 0.56], qc);
    parts.push(
      <g key="phoneArm">
        {qc > 0.05 ? <Ink d={fold} width={W * 0.7} seed={`${seed}/fold`} /> : null}
        <XG m={phoneM}>
          <PhoneGrip W={W} thumb={-pside as 1 | -1} back seed={`${seed}/grip`} />
        </XG>
        <Arm sh={[pside * sh[0], sh[1]]} hand={hand} elbow={elbowP} w={d * 1.05} coat={coat} W={W * 0.9} hand2={false} seed={`${seed}/parm`} />
        <XG m={phoneM}>
          <Fill d={roundRect(-11, -42, 22, 38, 4)} color={palette.card} offset={false} mode="none" seed={`${seed}/ph`} />
          <Ink d={roundRect(-11, -42, 22, 38, 4, {seed: `${seed}/phi`}) + `M-5 -34H5`} width={W * 0.85} taper={false} seed={`${seed}/phi`} />
          <PhoneGrip W={W} thumb={-pside as 1 | -1} seed={`${seed}/grip`} />
        </XG>
      </g>,
    );
  }
  const rimD = rim ? rimStripD(g, rim === 'left' ? -1 : 1, W, px, g.w * 2.2) : '';
  let person: React.ReactNode = <Person x={x} y={hipY} s={s} seed={seed} hair={hairUse} hairColor={hairFix} acc={accs} body={coat} torsoH={torsoH} ink={DEPTH_INK[depth]} hero={false} rim={false} />;
  if (capOn) {
    // only the coat of the kit Person (its head is replaced by the BackHead + collar band below)
    const cid = clipId + 'c';
    person = (
      <>
        <defs>
          <clipPath id={cid}>
            <rect x={x - head * 8} y={hipY - torsoH * s} width={head * 16} height={torsoH * s + 4000} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${cid})`}>{person}</g>
      </>
    );
  }
  const local = mat.compose(mat.translate(x, hipY), mat.scale(s));
  // a swapped DARK hair disc gets the exact disc under the kit's misregistered one (as HairOver does): the gap between
  // the offset fill and the outline otherwise reads as a light highlight / cowlick on an ink-brown head
  const darkUnder = hairFix !== undefined && (hairFix === palette.ink || hairFix === palette.tealDark) && (hairUse === 'short' || hairUse === 'bun' || hairUse === 'curly') ? (
    <XG m={local}>
      <TodAnchor at={[0, -torsoH * 0.5]}>
        <ExitSync seed={`person/${seed}/exit`}>
          <Fill d={blob(0, g.hy, g.hr, g.hr, {seed: `person/${seed}/head`})} color={hairFix} offset={false} seed={`person/${seed}/head0`} />
        </ExitSync>
      </TodAnchor>
    </XG>
  ) : null;
  let hood: React.ReactNode = null;
  if (hoodOn) {
    // the hood lies over the coat and under the head: draw it, then the head again (the same Person clipped to the head)
    const hr = g.hr;
    const top = -g.h;
    const hd = `M${-hr * 1.32} ${top + hr * 0.25}Q${-hr * 1.4} ${top - hr * 0.55} 0 ${top - hr * 0.62}Q${hr * 1.4} ${top - hr * 0.55} ${hr * 1.32} ${top + hr * 0.25}Q${hr * 0.9} ${top + hr * 1.3} 0 ${top + hr * 1.32}Q${-hr * 0.9} ${top + hr * 1.3} ${-hr * 1.32} ${top + hr * 0.25}Z`;
    const hcy = hipY + g.hy * s;
    hood = (
      <>
        <XG m={local}>
          <Fill d={hd} color={coat} offset={false} mode="none" seed={`${seed}/hood`} />
          <Ink d={hd + `M0 ${top + hr * 1.32}L0 ${top + hr * 0.75}`} width={W * 0.9} seed={`${seed}/hoodI`} />
        </XG>
        <defs>
          <clipPath id={clipId}>
            <circle cx={x} cy={hcy} r={hr * 1.1 * s} />
            <circle cx={x - hr * 0.98 * s} cy={hcy + hr * 0.12 * s} r={hr * 0.36 * s} />
            <circle cx={x + hr * 0.98 * s} cy={hcy + hr * 0.12 * s} r={hr * 0.36 * s} />
            <circle cx={x} cy={hcy - hr * 1.12 * s} r={hr * 0.46 * s} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>{person}</g>
      </>
    );
  }
  return (
    <XG m={mat.translate(0, rise)}>
      {darkUnder}
      {person}
      {hood}
      <XG m={local}>
        {rimD ? <Fill d={rimD} color={palette.white} offset={false} mode="none" seed={`${seed}/rim`} /> : null}
        {collarOn ? <CollarBand top={-torsoH} hr={g.hr} coat={coat} W={W} hair={hairFix ?? kitHair} holes={kitHeadHoles(seed, hairUse, coat, torsoH, headA)} seed={`${seed}/cb`} /> : null}
        {capOn ? (
          <BackHead hy={hyUse} hr={g.hr} hair={capHair} cap={capColor} W={W} neckTo={-torsoH + g.hr * 0.2} seed={String(seed)} under={<CollarBand top={-torsoH} hr={g.hr} coat={coat} W={W} hair={capHair} seed={String(seed)} />} />
        ) : null}
        {parts}
      </XG>
    </XG>
  );
};

// ---------------------------------------------------------------- Citizen

export type CitizenProps = FigBase & {
  silhouette?: boolean;
  color?: string;
  body?: string;
  hair?: Hair;
  /** Hair colour (default: the kit's seeded pick, a sand = skin-coloured pick becomes ochre / ink-brown). Redrawn over
   *  the kit head, so the figure's other seeded picks (trousers, shoes, walk phase) never change. */
  hairColor?: string;
  acc?: Acc[];
};

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
  const seed = p.seed ?? 'cit';
  const kp = kitPicks(seed, p.hair, p.body);
  const hc = p.hairColor ?? skinSafeHair(kp.hairColor, kp.coat, kp.style, seed);
  const hz = walking ? p.walk?.hz ?? 1.8 : undefined;
  const W = inkFor(p.h, p.depth) / s;
  return (
    <FigFrame b={p} s={s}>
      <Person seed={seed} legs torsoH={TORSO} legH={LEG} body={p.body} hair={p.hair} acc={p.acc ?? []} ink={W} walk={hz} hero={false} lod={p.h < 34 ? 1 : 0} />
      {hc !== kp.hairColor ? <HairOver seed={seed} hair={p.hair} body={p.body} color={hc} W={W} lod={p.h < 34 ? 1 : 0} walkHz={hz} /> : null}
    </FigFrame>
  );
};

// ---------------------------------------------------------------- Investigator (S05)

export type InvestigatorProps = FigBase & {
  body?: string;
  hair?: Hair;
  /** Hair colour (default: the kit's seeded pick, a sand = skin-coloured pick becomes ochre / ink-brown). */
  hairColor?: string;
  /** Collar: a straight band one step darker than the coat (default), the kit's V chevron ('v', the old look), none. */
  collar?: 'band' | 'v' | false;
  raiseAt?: number;
  lowerAt?: number;
  twinkle?: boolean;
  arm?: 'left' | 'right';
};

/** Full-body investigator: an ink shield badge on the back, a straight collar band, a raised sparkle tablet (raiseAt). */
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
  const collar = p.collar ?? 'band';
  const kp = kitPicks(seed, p.hair, coat);
  const hc = p.hairColor ?? skinSafeHair(kp.hairColor, coat, kp.style, seed);
  const hz = walking ? p.walk?.hz ?? 1.8 : undefined;
  return (
    <FigFrame b={p} s={s}>
      <Person seed={seed} legs torsoH={TORSO} legH={LEG} body={coat} hair={p.hair} acc={collar === 'v' ? ['collar'] : []} ink={W} walk={hz} />
      {collar === 'band' ? (
        <XG m={mat.translate(0, kitWalkBob(seed, t, hz, p.hair, coat))}>
          <CollarBand top={-TORSO} hr={g.hr} coat={coat} W={W} hair={hc} holes={kitHeadHoles(seed, p.hair, coat, TORSO)} seed={`${seed}/cb`} />
        </XG>
      ) : null}
      {hc !== kp.hairColor ? <HairOver seed={seed} hair={p.hair} body={coat} color={hc} W={W} walkHz={hz} /> : null}
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

export type MessengerProps = FigBase & {
  pullAt?: number;
  holdEnvelope?: boolean;
  envelopeSize?: number;
  /** Kit hair style (default 'short'). */
  hair?: Hair;
  /** Hair colour, default ink-brown (palette.ink): from behind the head is a FULL hair-colour disc (S06 review: the
   *  seeded sand pick read as a bald / skin disc). Redrawn over the kit head, so his trousers, shoes and walk phase stay
   *  the kit's seeded ones (S05 -> S06 continuity, S06's planted stride). */
  hairColor?: string;
  /** Collar: a straight tealDark band (default), the kit's V chevron ('v', the old look), none. */
  collar?: 'band' | 'v' | false;
};

/** Teal-coated messenger (ink-brown hair disc, straight tealDark collar band); pulls an envelope from his coat (pullAt)
 *  and carries it at shoulder height. */
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
  const hair = p.hair ?? 'short';
  const collar = p.collar ?? 'band';
  const hz = walking ? p.walk?.hz ?? 1.8 : undefined;
  return (
    <FigFrame b={p} s={s}>
      <Person seed={seed} legs torsoH={TORSO} legH={LEG} body={palette.teal} hair={hair} acc={collar === 'v' ? ['collar'] : []} ink={W} walk={hz} />
      {collar === 'band' ? (
        <XG m={mat.translate(0, kitWalkBob(seed, t, hz, hair, palette.teal))}>
          <CollarBand top={-TORSO} hr={g.hr} coat={palette.teal} W={W} hair={p.hairColor ?? palette.ink} holes={kitHeadHoles(seed, hair, palette.teal, TORSO)} seed={`${seed}/cb`} />
        </XG>
      ) : null}
      <HairOver seed={seed} hair={hair} body={palette.teal} color={p.hairColor ?? palette.ink} W={W} walkHz={hz} />
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
  /** Hair colour (default: the kit's seeded pick, a sand = skin-coloured pick becomes ochre / ink-brown). */
  hairColor?: string;
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
  const hair = rng(`mk/${seed}`).pick<Hair>(['short', 'bun', 'curly', 'short']);
  const kp = kitPicks(seed, hair, palette.teal);
  const hc = p.hairColor ?? skinSafeHair(kp.hairColor, palette.teal, hair, seed);
  const hz = walking ? p.walk?.hz ?? 1.8 : undefined;
  return (
    <FigFrame b={p} s={s} feetBelowHip={p.bust ? 0 : LEG}>
      <XG m={mat.translate(0, nod)}>
        <Person seed={seed} legs={!p.bust} torsoH={TORSO} legH={LEG} body={palette.teal} hair={hair} acc={[]} ink={W} walk={hz} />
        {hc !== kp.hairColor ? <HairOver seed={seed} hair={hair} body={palette.teal} color={hc} W={W} walkHz={hz} legs={!p.bust} /> : null}
        <Fill d={polyPath([[-hw * 1.02, wy - 6], [-hw * 0.82, wy - 6], [-hw * 0.84, 0], [-hw * 1.07, 0]]) + polyPath([[hw * 1.02, wy - 6], [hw * 0.82, wy - 6], [hw * 0.84, 0], [hw * 1.07, 0]])} color={palette.cream} offset={false} mode="none" seed={`${seed}/ap`} />
        <Ink d={straps} width={W * 1.7} color={palette.ink} taper={false} seed={`${seed}/st0`} />
        <Ink d={straps} width={W * 0.9} color={palette.cream} taper={false} seed={`${seed}/st1`} />
        <Fill d={`M0 ${wy}q-12 -10 -14 0q2 9 14 0q12 -10 14 0q-2 9 -14 0Z`} color={palette.cream} offset={false} mode="none" seed={`${seed}/bowf`} />
        <Ink d={bow} width={W * 0.7} seed={`${seed}/bow`} />
      </XG>
    </FigFrame>
  );
};

// ---------------------------------------------------------------- BackHead + CollarBand + BackBody (cap wearers)

/** A back-view head for cap wearers (review 5: at phone size a cap over a full hair-colour disc, a zig-zag nape and a V
 *  collar read as a bearded face looking at us). Person-local units, head centre (0, hy), radius hr:
 *  - a sand NECK block (0.45 x head wide) from inside the head down to `neckTo` (hidden by the collar there);
 *  - the hair ends in a SMOOTH NAPE: the sides taper into the neck and a shallow curve crosses it (no zig-zag, no round
 *    hair "chin"; no strands under a cap: in line art they read as a grille), sand ears just under the cap band;
 *  - the cap (`cap` colour) covers the top ~65 % down to a gently sagging band; its back STRAP is a clear notch: an arch
 *    cut up into the cap with HAIR showing through it, over a thin strap with a buckle tick; a button on top.
 *  `under` renders after the neck and before the ears / head (the collar band goes there). */
const BackHead: React.FC<{
  hy: number;
  hr: number;
  hair: string;
  cap: string | false;
  W: number;
  neckTo: number;
  detail?: boolean;
  seed: string;
  under?: React.ReactNode;
  /** Bare-hair strands (default true). */
  strands?: boolean;
  /** A bun on top (bare hair). */
  bun?: boolean;
  /** Draw-on start (the Ghost); omit = drawn. */
  at?: number;
}> = ({hy, hr, hair, cap, W, neckTo, detail = true, seed, under, strands = true, bun = false, at}) => {
  const f = (v: number) => v.toFixed(2);
  const T = (dt: number) => (at === undefined ? undefined : at + dt);
  const X = (k: number) => f(k * hr);
  const Y = (k: number) => f(hy + k * hr);
  // neck
  const nw = hr * 0.45;
  const neckD = rectPath(-nw, hy + hr * 0.5, nw * 2, neckTo - (hy + hr * 0.5));
  const neckInk = `M${f(-nw)} ${Y(0.84)}V${f(neckTo)}M${f(nw)} ${Y(0.84)}V${f(neckTo)}`;
  // hair: the head circle down to (+-0.8, 0.6), tapering into the neck sides, a shallow nape curve across the neck
  const sideY = 0.6;
  const sideX = Math.sqrt(1 - sideY * sideY);
  const taperR = `C${X(sideX - 0.07)} ${Y(0.8)} ${X(0.56)} ${Y(0.86)} ${X(0.45)} ${Y(0.86)}`;
  const nape = `Q0 ${Y(0.97)} ${X(-0.45)} ${Y(0.86)}`;
  const taperL = `C${X(-0.56)} ${Y(0.86)} ${X(-(sideX - 0.07))} ${Y(0.8)} ${X(-sideX)} ${Y(sideY)}`;
  const dome = `M${X(-sideX)} ${Y(sideY)}A${f(hr)} ${f(hr)} 0 1 1 ${X(sideX)} ${Y(sideY)}`;
  const hairD = dome + taperR + nape + taperL + 'Z';
  const headInk = dome + taperR + `M${X(-0.45)} ${Y(0.86)}` + taperL;
  // ears just under the cap band
  const ey = hy + hr * 0.36;
  const ears = blob(-hr * 0.98, ey, hr * 0.2, hr * 0.28, {seed: `${seed}/e1`}) + blob(hr * 0.98, ey, hr * 0.2, hr * 0.28, {seed: `${seed}/e2`});
  const earInk = arc(-hr * 0.98, ey, hr * 0.2, hr * 0.28, 95, 265, {seed: `${seed}/ei1`}) + arc(hr * 0.98, ey, hr * 0.2, hr * 0.28, -85, 85, {seed: `${seed}/ei2`});
  const parts: React.ReactNode[] = [
    <Fill key="neck" d={neckD} color={palette.sand} offset={false} mode="none" seed={`${seed}/neck`} />,
    detail ? <Ink key="neckI" d={neckInk} at={T(0.14)} width={W * 0.7} taper={false} seed={`${seed}/neckI`} /> : null,
    <React.Fragment key="under">{under}</React.Fragment>,
    <Fill key="ear" d={ears} color={palette.sand} offset={false} mode="none" seed={`${seed}/ear`} />,
    <Ink key="earI" d={earInk} at={T(0.12)} width={W * 0.85} order="all" seed={`${seed}/earI`} />,
    <Fill key="hair" d={hairD} color={hair} seed={`${seed}/headF`} />,
    <Ink key="headI" d={headInk} at={T(0.04)} width={W} seed={`${seed}/headI`} />,
    detail ? <Ink key="napeI" d={`M${X(0.45)} ${Y(0.86)}` + nape} at={T(0.16)} width={W * 0.55} taper={false} seed={`${seed}/napeI`} /> : null,
  ];
  if (!cap && bun) {
    parts.push(<Fill key="bunF" d={blob(0, hy - hr * 1.1, hr * 0.36, hr * 0.34, {seed: `${seed}/bun`})} color={hair} offset={false} mode="none" seed={`${seed}/bunF`} />);
    parts.push(<Ink key="bunI" d={circle(0, hy - hr * 1.1, hr * 0.36, {seed: `${seed}/bun`, overlap: 10})} at={T(0.1)} width={W * 0.85} seed={`${seed}/bunI`} />);
  }
  if (!cap && detail && strands) {
    // bare hair: three strands
    const sd = `M${X(-0.42)} ${Y(-0.55)}Q${X(-0.5)} ${Y(0.1)} ${X(-0.36)} ${Y(0.7)}M${X(0.06)} ${Y(-0.7)}Q${X(-0.02)} ${Y(0)} ${X(0.08)} ${Y(0.78)}M${X(0.46)} ${Y(-0.5)}Q${X(0.56)} ${Y(0.1)} ${X(0.42)} ${Y(0.66)}`;
    parts.push(<Ink key="strands" d={sd} at={T(0.2)} width={W * 0.7} order="all" seed={`${seed}/strands`} />);
  }
  if (cap) {
    const by = hy + hr * 0.3;
    const R2 = hr * 1.04;
    const cw = Math.sqrt(Math.max(0, R2 * R2 - (by - hy) * (by - hy)));
    const crown = `M${f(-cw)} ${f(by)}A${f(R2)} ${f(R2)} 0 1 1 ${f(cw)} ${f(by)}Q0 ${f(by + hr * 0.12)} ${f(-cw)} ${f(by)}`;
    // the strap notch: an arch cut up into the cap (hair shows through), over a thin strap along the band
    const sy = by + hr * 0.04; // strap bottom (on the band)
    const st = by - hr * 0.1; // strap top = arch base
    const aw = hr * 0.34;
    const ah = hr * 0.36;
    const archD = `M${f(-aw)} ${f(st)}A${f(aw)} ${f(ah)} 0 0 1 ${f(aw)} ${f(st)}Z`;
    parts.push(<Fill key="crown" d={crown + 'Z'} color={cap} offset={false} mode="none" seed={`${seed}/crown`} />);
    if (detail) {
      parts.push(<Fill key="arch" d={archD} color={hair} offset={false} mode="none" seed={`${seed}/arch`} />);
      parts.push(<Ink key="archI" d={`M${f(-aw)} ${f(sy)}V${f(st)}A${f(aw)} ${f(ah)} 0 0 1 ${f(aw)} ${f(st)}V${f(sy)}M${f(-aw - hr * 0.06)} ${f(st)}H${f(aw + hr * 0.06)}M${f(aw * 0.35)} ${f(st + hr * 0.02)}V${f(sy - hr * 0.01)}`} width={W * 0.7} taper={false} seed={`${seed}/archI`} />);
      parts.push(<Ink key="btn" d={circle(0, hy - R2 + hr * 0.05, hr * 0.12, {seed: `${seed}/btn`})} width={W * 0.7} seed={`${seed}/btn`} />);
    }
    parts.push(<Ink key="capI" d={crown} width={W * 0.85} seed={`${seed}/capI`} />);
  }
  return <>{parts}</>;
};

/** The collar band colour: one palette step darker than the coat, unless that is the HAIR colour (fix round, S03
 *  'nearR': a tan coat's ochre band under an ochre bun merged into one ochre mass) or the coat itself: then tealDark
 *  (ink-brown when the hair or coat is tealDark). */
const bandColor = (coat: string, hair?: string) => {
  const c = darker(coat);
  if (c !== hair && c !== coat) return c;
  return hair === palette.tealDark || coat === palette.tealDark ? palette.ink : palette.tealDark;
};

/** A straight coat collar band on the shoulders (person-local: torso top at y = top), a step darker than the coat (never
 *  the hair colour: `hair`); the neck goes in behind it. Replaces the V chevron on cap wearers (a V reads as a shirt
 *  front). `holes` (person-local paths, filled + stroked at the ink width) are cut out of it, so a band drawn AFTER the
 *  kit Person still goes BEHIND its head, hero nape and long hair (fix round: it painted across long hair like a strap
 *  and hid the notched nape). */
const CollarBand: React.FC<{top: number; hr: number; coat: string; W: number; seed: string; at?: number; hair?: string; holes?: string[]}> = ({top, hr, coat, W, seed, at, hair, holes}) => {
  const id = 'cb' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const f = (v: number) => v.toFixed(2);
  const hw = hr * 1.05;
  const y0 = top - hr * 0.04;
  const y1 = top + hr * 0.34;
  const sag = hr * 0.07;
  const d = `M${f(-hw)} ${f(y0 + sag)}Q0 ${f(y0 - sag)} ${f(hw)} ${f(y0 + sag)}L${f(hw)} ${f(y1 + sag)}Q0 ${f(y1 - sag)} ${f(-hw)} ${f(y1 + sag)}Z`;
  const ink = `M${f(-hw)} ${f(y0 + sag)}Q0 ${f(y0 - sag)} ${f(hw)} ${f(y0 + sag)}M${f(-hw)} ${f(y1 + sag)}Q0 ${f(y1 - sag)} ${f(hw)} ${f(y1 + sag)}`;
  const band = (
    <>
      <Fill d={d} color={bandColor(coat, hair)} offset={false} mode="none" seed={`${seed}/collar`} />
      <Ink d={ink} at={at} width={W * 0.8} taper={false} seed={`${seed}/collarI`} />
    </>
  );
  if (!holes || !holes.length) return band;
  // a luminance mask (white = band, black = the head shapes) in the band's own user space
  const m = hw + W * 2;
  return (
    <>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x={-m} y={y0 - sag - hr - W * 2} width={m * 2} height={y1 - y0 + hr * 2 + sag * 2 + W * 4}>
          <rect x={-m} y={y0 - sag - hr - W * 2} width={m * 2} height={y1 - y0 + hr * 2 + sag * 2 + W * 4} fill="#fff" />
          {holes.map((h, i) => (
            <path key={i} d={h} fill="#000" stroke="#000" strokeWidth={W} strokeLinejoin="round" />
          ))}
        </mask>
      </defs>
      <g mask={`url(#${id})`}>{band}</g>
    </>
  );
};

/** Head centre of a BackBody: higher than the kit Person's, so a neck block shows between the head and the collar. */
const backHeadY = (g: Geo) => -g.h - g.hr * 1.5;
/** Feet to cap top of a BackBody at s = 1 (the presets scale `h` by this, so `h` is the true height). */
const backFigH = (g: Geo) => LEG + g.h + g.hr * 2.6;
/** One palette step darker (collar bands). */
const darker = (c: string) =>
  c === palette.sand ? palette.tan : c === palette.teal ? palette.tealDark : c === palette.cream ? palette.sand : c === palette.sage ? palette.teal : c === palette.tan ? palette.brown : palette.tealDark;

type BackBodyProps = {
  g: Geo;
  seed: string;
  coat: string;
  legs: string;
  shoes?: string;
  hair?: string;
  cap?: string | false;
  W: number;
  walk?: number;
  detail?: boolean;
  /** Draw-on start for every stroke (the Ghost); omit = drawn. */
  at?: number;
  strands?: boolean;
  bun?: boolean;
};

/** A back-view figure built here instead of the kit Person (style bible 6, closeup_board_people): legs, a tombstone
 *  torso, a straight CollarBand and a BackHead (cap or bare hair, smooth nape, visible sand neck), so a cap wearer never
 *  reads as a face (reviews 4 + 5). Under <Look fills="none"> with `at` it is the Ghost's line art. Person-local units:
 *  hip line at 0, the same w / h / hr / round as personGeo (arms, belts fit). */
const BackBody: React.FC<BackBodyProps> = ({g, seed, coat, legs, shoes = palette.tealDark, hair = palette.brown, cap, W, walk, detail = true, at, strands, bun}) => {
  const T = (dt: number) => (at === undefined ? undefined : at + dt);
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
  return (
    <TodAnchor at={[0, -h * 0.5]}>
      <XG m={mat.translate(0, bob)}>
        <Fill d={legsD} color={legs} offset={false} mode="none" seed={`${seed}/legs`} />
        <Fill d={shoesD} color={shoes} offset={false} mode="none" seed={`${seed}/shoes`} />
        <Ink d={legInk} at={T(0.14)} width={W * 0.9} seed={`${seed}/legI`} />
        <Fill d={torsoD} color={coat} seed={`${seed}/torso`} />
        <Ink d={torsoD} at={T(0)} width={W} seed={`${seed}/torsoI`} />
        <BackHead hy={hy} hr={hr} hair={hair} cap={cap ?? false} W={W} neckTo={-h + hr * 0.2} detail={detail} seed={seed} at={T(0.1)} strands={strands} bun={bun} under={<CollarBand top={-h} hr={hr} coat={coat} W={W} hair={hair} seed={seed} at={T(0.18)} />} />
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

/** An ink-only back-view figure (no fills at all): the years of passers-by who never look at the door. Built on BackBody
 *  in line art (review 5: the kit line head's seeded side gap + hair tick read as a broken scribble): a clean head dome
 *  that flows into the neck lines (the only opening is the nape), ears, a collar band, torso, legs. `hair` 'bun' adds a
 *  bun; other hair styles and `acc` are not drawn. `at` draws it on. */
export const Ghost: React.FC<FigBase & {at?: number; hair?: Hair; acc?: Acc[]}> = (p) => {
  const t = useTime();
  if (p.at !== undefined && t < p.at) return null;
  const seed = String(p.seed ?? 'ghost');
  const g = personGeo(seed);
  const s = p.h / backFigH(g);
  const W = (p.depth ? DEPTH_INK[p.depth] : stroke.ink) / s;
  const walking = walkPos(t, p).walking;
  return (
    <Look fills="none">
      <FigFrame b={p} s={s}>
        <BackBody g={g} seed={seed} coat={palette.white} legs={palette.white} cap={false} W={W} walk={walking ? p.walk?.hz ?? 1.6 : undefined} at={p.at} strands={false} bun={p.hair === 'bun'} />
      </FigFrame>
    </Look>
  );
};
