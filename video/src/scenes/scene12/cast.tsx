// S12 cast: the P-phase plans (S12's own beats placed in the S01 clock, pClock) for S01's citizens, pigeons, edge
// onlooker, padlocks and tags; the R-phase plans (S01's own, minus what S12 does not replay: the pigeons' scatter, the
// padlock glints, Pip's exit to S02); Pip's landing from S11's leap; Bit's walk home. Everything is a pure function of
// time. S01's components are reused as they are (scene01/cast.tsx, plaza.tsx, shims.tsx): the plaza at the end of S12
// IS S01's code at t = 0.
import React from 'react';
import {clamp, ease as E, lerp, osc, prog, TimeProvider, useTime} from '../../lib/time';
import {rng} from '../../lib/rng';
import {Elephant, popSwitch} from '../../lib/mascot';
import {GovEvents, PLAZA} from '../shared/sets';
import {Bit, bitPath, EdgeOnlooker, FigureArm, StickyNote} from '../shared/props';
import {matScale} from '../shared/props/common';
import {Ink} from '../../lib/Ink';
import {blob, speedLines} from '../../lib/sketch';
import {Fill} from '../../lib/Fill';
import {mat, useXf, XG} from '../../lib/xf';
import {palette} from '../../lib/theme';
import {S01_PADLOCK_SIZE} from '../scene01/shims';
import {CitizenPlan, leanAt, OnlookerPhoneArm, Pigeon, PigeonPlan} from '../scene01/cast';
import {NoteBack, NoteBreeze, NoteFlight} from '../scene11/shims';
import {useInkScale} from '../../lib/inkComp';
import {NearPlan, ONL_DX, ONLOOKERS, S01_BIT, S01_CITIZENS, S01_GOV, S01_NEAR, S01_PIGEONS, S01_PIP, S01_PIP_SEED} from '../scene01/plaza';
import {B, pClock, R0, REWIND_FPS, S12_START, stepIndex} from './timing';

const pc = pClock;

// ---------------------------------------------------------------- citizens

/** P phase (cut -> 'before'): the shutdown's audience as S12 opens on it: phones up, heads turned to govB; on
 *  'governments' the phones come down (fA, then the left onlooker), sB points at govB on 'those' and lowers it, and
 *  every head swaps back to the back view before the rewind (= S01's settled state, so the R phase picks up seamlessly). */
const P_OVERRIDES: Record<string, Partial<CitizenPlan>> = {
  's01/fA': {phone: {up: -1, down: pc(B.phonesDown[0]), side: 1}, turn: [{t: -1, d: 1}, {t: pc(B.headsBack[0]), d: 0}], lean: [{t: -1, a: 3}, {t: pc(B.headsBack[0]), a: 0}]},
  's01/fC': {turn: [{t: -1, d: -1}, {t: pc(B.headsBack[1]), d: 0}], lean: [{t: -1, a: -6}, {t: pc(B.headsBack[1]), a: 0}]},
  's01/fD': {turn: [{t: -1, d: -1}, {t: pc(B.headsBack[2]), d: 0}], lean: [{t: -1, a: -4}, {t: pc(B.headsBack[2]), a: 0}]},
  's01/sA': {turn: [{t: -1, d: 1}, {t: pc(B.headsBack[3]), d: 0}]},
  // sB (second row, x 640, under govB's right edge; brown coat): points UP at govB's shuttered window on 'those',
  // lowers it before 'did'. The arm is S12's own (SbPoint below: kit FigureArm + a cream rim), not S01's `point`.
  // Fix round 2: he straightens as he points (lean -4 -> -2, was -6), so the near-vertical arm clears the backpack
  // figure behind him
  's01/sB': {turn: [{t: -1, d: -1}, {t: pc(B.pointDown + 0.04), d: 0}], lean: [{t: -1, a: -4}, {t: pc(B.point), a: -2}, {t: pc(B.pointDown), a: 0}]},
};
export const SB_SEED = 's01/sB';

/** sB's point (fix round 2, review: the brown sleeve on govB's tan wall was a small brown tick, and its raised arm
 *  crossed the backpack figure behind him). The kit FigureArm (tapered sleeve, small elbow bend, cuff, inked sand hand)
 *  raised ~12 deg off vertical with the lean (was ~25 deg), ~58 px on screen (a ~72 px near-vertical arm read as a
 *  pole), so it rises past the neighbour's head and backpack and points at govB's shutter, with a 1.8 px CREAM RIM
 *  (BitRim / onlooker rim language) drawn behind sB (`rim`): sleeve and hand separate from the wall, the steps and the
 *  neighbour's backpack edge it grazes at the shoulder. Mirrors PlazaCitizen's figure frame (scene01/
 *  cast.tsx: TORSO 95, LEG 62, FIG_H 199, the person rng's torso width, ink by height, the point raise / lower eases).
 *  Reads the S01 clock (P phase). */
/** Fix round 3 (review: ~58 px and ~12 deg off vertical read as a raised hand, not a point at govB): ~75 px on screen
 *  (~184 person units), tilted ~23 deg toward govB's shuttered window (~25 deg on screen with his -2 lean), so the line
 *  of the arm runs on to the shutter; a MITTEN hand (`SbMitten`, longer than wide, along the forearm) at the tip with
 *  the 1.8 px cream rim. */
/** A1 fix round 1 (review: ~8-10 px wide with a small mitten it read as a baton, and the brown sleeve sat on govB's tan
 *  wall with little value separation): sleeve w 28 (~11.5 px on screen, was 21), the full 2.2 px ink tier on the sleeve
 *  outline (was 0.85 x), and a HAND that points: a sand fist with an extended index finger along the forearm line (on
 *  to govB's padlock), ~24 px from the fist's back to the fingertip (`SbHand`); the 1.8 px cream rim follows it. */
const SB_POINT = {at: pc(B.point), downAt: pc(B.pointDown), hand: [-105, -245] as [number, number], w: 28, bend: 12} as const;
const FIG = {TORSO: 95, LEG: 62, H: 199} as const;
export const SbPoint: React.FC<{p: CitizenPlan; rim?: boolean}> = ({p, rim}) => {
  const t = useTime();
  if (t < SB_POINT.at) return null;
  const up = E.outBack(1.5)(clamp((t - SB_POINT.at) / 0.22));
  const dn = E.inOutCubic(clamp((t - SB_POINT.downAt) / 0.2));
  const q = up * (1 - dn);
  if (q <= 0.01) return null;
  const s = p.h / FIG.H;
  const gw = rng(`person/${p.seed}`).range(86, 100);
  const sh: [number, number] = [-gw * 0.36, -FIG.TORSO * 0.8];
  const down: [number, number] = [-gw * 0.5, -FIG.TORSO * 0.1];
  const hand: [number, number] = [lerp(down[0], SB_POINT.hand[0], q), lerp(down[1], SB_POINT.hand[1], q)];
  // the elbow as FigureArm places it (bend about the chord, outward = -x), passed explicitly so rim and arm agree
  const dx = hand[0] - sh[0];
  const dy = hand[1] - sh[1];
  const d = Math.hypot(dx, dy) || 1e-6;
  const ux = dx / d;
  const uy = dy / d;
  const bend = SB_POINT.bend * Math.sin((Math.PI / 2) * clamp(q));
  const off = (d / 2) * Math.tan((bend * Math.PI) / 360);
  const el: [number, number] = [sh[0] + dx * 0.5 + uy * off, sh[1] + dy * 0.5 - ux * off];
  const bob = p.bob ? osc(t, 0.55) * p.bob : 0;
  const m = mat.compose(mat.translate(p.x, p.y + bob), mat.rotate(leanAt(t, p.lean)), mat.translate(0, -FIG.LEG * s), mat.scale(s));
  const W = (p.h >= 120 ? 3.4 : p.h >= 70 ? 2.2 : 1.6) / s;
  return (
    <XG m={m}>
      {rim ? (
        <SbRim sh={sh} el={el} hand={hand} w={SB_POINT.w} />
      ) : (
        <>
          <SbHand el={el} hand={hand} w={SB_POINT.w} W={W * 0.85} seed={`${p.seed}/pt12`} />
          <FigureArm sh={sh} hand={hand} elbow={el} w={SB_POINT.w} coat={p.body ?? palette.brown} W={W} hand2={false} seed={`${p.seed}/pt12`} />
        </>
      )}
    </XG>
  );
};
/** The pointing hand (A1 fix round 1; fix round 3 had a plain mitten): in the forearm's frame (+x = along the forearm,
 *  from the elbow out), a sand FIST just past the cuff (1.24 w x 1.0 w) with a thumb bump on its upper side and the
 *  INDEX FINGER extended along the forearm line (to 1.5 w past the fist centre, 0.34 w thick), inked; drawn before the
 *  sleeve so the cuff overlaps the fist's root. `handGeom` is shared with the rim so the two agree. */
const handGeom = (el: [number, number], hand: [number, number], w: number) => {
  const fx = hand[0] - el[0];
  const fy = hand[1] - el[1];
  const fL = Math.hypot(fx, fy) || 1;
  const c: [number, number] = [hand[0] + (fx / fL) * w * 0.5, hand[1] + (fy / fL) * w * 0.5];
  return {
    c,
    ang: (Math.atan2(fy, fx) * 180) / Math.PI,
    fist: {rx: w * 0.62, ry: w * 0.5},
    finger: {cx: w * 0.98, cy: -w * 0.12, rx: w * 0.55, ry: w * 0.17},
    thumb: {cx: w * 0.05, cy: -w * 0.46, rx: w * 0.26, ry: w * 0.17},
  };
};
const SbHand: React.FC<{el: [number, number]; hand: [number, number]; w: number; W: number; seed: string}> = ({el, hand, w, W, seed}) => {
  const {c, ang, fist, finger, thumb} = handGeom(el, hand, w);
  const fistD = blob(0, 0, fist.rx, fist.ry, {seed: `${seed}/fist`, wobble: 0.03});
  const fingerD = blob(finger.cx, finger.cy, finger.rx, finger.ry, {seed: `${seed}/idx`, wobble: 0.02});
  const thumbD = blob(thumb.cx, thumb.cy, thumb.rx, thumb.ry, {seed: `${seed}/thb`, wobble: 0.03});
  return (
    <XG m={mat.compose(mat.translate(c[0], c[1]), mat.rotate(ang))}>
      <Fill d={fingerD} color={palette.sand} offset={false} mode="none" seed={`${seed}/idf`} />
      <Ink d={fingerD} width={W} taper={false} seed={`${seed}/idi`} />
      <Fill d={thumbD} color={palette.sand} offset={false} mode="none" seed={`${seed}/thf`} />
      <Ink d={thumbD} width={W} taper={false} seed={`${seed}/thi`} />
      <Fill d={fistD} color={palette.sand} offset={false} mode="none" seed={`${seed}/mf`} />
      <Ink d={fistD} width={W} taper={false} seed={`${seed}/mi`} />
    </XG>
  );
};
/** The cream rim behind sB's point arm: the sleeve (shoulder -> elbow -> wrist), the fist, thumb and finger, `px` screen
 *  px out. */
const SbRim: React.FC<{sh: [number, number]; el: [number, number]; hand: [number, number]; w: number; px?: number}> = ({sh, el, hand, w, px = 1.8}) => {
  const k = Math.max(1e-4, matScale(useXf()));
  const r = px / k;
  const {c, ang, fist, finger, thumb} = handGeom(el, hand, w);
  const e = r * 1.4;
  return (
    <>
      <path d={`M${sh[0]} ${sh[1]}L${el[0]} ${el[1]}L${hand[0]} ${hand[1]}`} fill="none" stroke={palette.cream} strokeWidth={w + 2 * r} strokeLinecap="round" strokeLinejoin="round" />
      <XG m={mat.compose(mat.translate(c[0], c[1]), mat.rotate(ang))}>
        <ellipse cx={0} cy={0} rx={fist.rx + e} ry={fist.ry + e} fill={palette.cream} />
        <ellipse cx={finger.cx} cy={finger.cy} rx={finger.rx + e} ry={finger.ry + e} fill={palette.cream} />
        <ellipse cx={thumb.cx} cy={thumb.cy} rx={thumb.rx + e} ry={thumb.ry + e} fill={palette.cream} />
      </XG>
    </>
  );
};
export const P_CITIZENS: CitizenPlan[] = S01_CITIZENS.map((c) => ({...c, ...(P_OVERRIDES[c.seed] ?? {})}));
/** R phase: S01's own plans (played backwards by the clock). */
export const R_CITIZENS: CitizenPlan[] = S01_CITIZENS;
/** Paint order: far first, then by feet y (as S01). */
export const CITIZEN_ORDER = S01_CITIZENS.map((c, i) => [c.y, i] as [number, number]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);

/** The near observer (S01_NEAR, the big back-view figure at the bottom): in the P phase he leans in toward govB on
 *  'those' (as he did on 'Governments' in S01) and straightens on 'did'; upright again before the rewind (S01's settled
 *  state). R phase: S01's own plan. */
export const P_NEAR: NearPlan[] = S01_NEAR.map((n) => ({...n, lean: [{t: pc(B.nearLean), a: -3.5}, {t: pc(B.nearBack), a: 0}]}));
export const R_NEAR: NearPlan[] = S01_NEAR;

// ---------------------------------------------------------------- pigeons

/** R phase: S01's three pigeons land at the start of S01 (0.12-1.0) and, in S12's rewind, STAY on the bar until that
 *  landing plays backwards (S01's scatter on 'their' and the circle-back are not replayed: the storyboard's rewind has
 *  them fly back off the crossbar once, a reversed landing). */
/** Fix round 1: the two 'those' landers perch further RIGHT on the crossbar (world x 124 / 154, S01's 118 / 148: on screen
 *  x >= 90, clear of the frame-edge paint strip) in both phases, so nothing jumps when the tape starts; frame 0 is
 *  unaffected (no pigeon is on the bar before S01's landing at 0.12). */
const PERCH_X = [undefined, 124, 154] as const;
export const R_PIGEONS: PigeonPlan[] = S01_PIGEONS.map(({flyAt: _f, flyTo: _ft, backAt: _b, backFrom: _bf, shuffleAt: _s, shuffleDx: _sd, ...p}, i) => ({...p, x: PERCH_X[i] ?? p.x}));
/** P phase: the pigeon that circled back in S01 sits on the dark crossbar from the cut; on 'those' the other two land
 *  (fly-ins from the left edge, S01's routes); one flutters (a hop in place) on 'governments'+0.25. */
export const P_PIGEONS: PigeonPlan[] = R_PIGEONS.map((p, i) => {
  const {landAt: _l, inDur: _d, ...rest} = p;
  if (i === 0) return rest;
  const land = B.pigeonsLand[i - 1];
  return {...rest, landAt: pc(land - B.pigeonFly), inDur: B.pigeonFly};
});
/** A1 fix round 1 (review: the 'governments' tail was near-still; the old flap was S01's 6 px shuffle hop with dx 0, a
 *  speck at phone size): the first 'those' lander FLUTTER-HOPS on 'governments' + 0.25: three frames off the bar with
 *  its wings open (up 7 px wings raised, up 13 px wings spread, up 6 px wings coming down), then a landing squash on
 *  the perch (0.15 s). The flying pose is S01's Flyer drawing (scene01/cast.tsx, not exported: copied in `FlapFlyer`),
 *  with the wing angle given per frame instead of its 7 Hz flap. */
const FLAP_SEED = S01_PIGEONS[1].seed;
const FLAP_POSES = [
  {lift: 7, up: 1},
  {lift: 13, up: 0.45},
  {lift: 6, up: 0.05},
];
const FlapFlyer: React.FC<{x: number; y: number; s: number; up: number; color: string; flip?: boolean}> = ({x, y, s, up, color, flip}) => {
  const ks = useInkScale();
  const wing = color === palette.tan ? palette.sand : palette.tan;
  const belly = 'M12.6 -9.6Q8 -5.7 -2 -6.5Q-7.5 -6.6 -11 -8.6Q-1 -9.4 12.6 -9.6Z';
  const L = 33;
  const W = (2.1 / s) * ks;
  const wingD = `M4.5 0Q8 ${(-L * 0.55).toFixed(1)} 1 ${-L}Q-5 ${(-L * 0.66).toFixed(1)} -6.5 -2Q-3 1 4.5 0Z`;
  const bFar = lerp(-150, -12, up) - 10;
  const bNear = lerp(-150, -12, up) + 12;
  const body = 'M-14 -10Q-6 -17.5 6 -15.5Q13 -14.5 14.5 -10Q9 -5 -2 -6Q-10 -6 -14 -10Z';
  const tail = 'M-13 -11.5L-24 -16L-23 -5L-13 -8.5Z';
  const head = 'M8.6 -14a5.2 5.2 0 1 0 10.4 0a5.2 5.2 0 1 0 -10.4 0Z';
  const common = {stroke: palette.ink, strokeWidth: W, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(flip ? -s : s, s))}>
      <XG m={mat.compose(mat.translate(1, -13), mat.rotate(bFar))}>
        <path d={wingD} fill={wing} {...common} />
      </XG>
      <path d={tail} fill={color} {...common} />
      <path d={body} fill={color} stroke="none" />
      <path d={belly} fill={palette.cream} stroke="none" />
      <path d={body} fill="none" {...common} />
      <path d={head} fill={palette.tealDark} {...common} />
      <path d="M18.6 -15L23.5 -13.6L18.6 -12.4Z" fill={palette.sun} stroke="none" />
      <path d="M14.6 -15.4a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0Z" fill={palette.cream} stroke="none" />
      <XG m={mat.compose(mat.translate(-2, -11), mat.rotate(bNear))}>
        <path d={wingD} fill={wing} {...common} />
        <path d={`M0 ${(-L * 0.42).toFixed(1)}L-3.5 ${(-L * 0.62).toFixed(1)}`} fill="none" {...common} strokeWidth={W * 0.7} />
      </XG>
    </XG>
  );
};
/** A P-phase pigeon: S01's Pigeon, except the flutter-hop of FLAP_SEED (its own frames, then a landing squash). */
export const PigeonP: React.FC<{p: PigeonPlan}> = ({p}) => {
  const w = useTime(); // the S01 clock (P phase: pClock)
  const at = pc(B.pigeonFlap);
  if (p.seed !== FLAP_SEED || w < at) return <Pigeon p={p} />;
  const i = Math.floor((w - at) * 30 + 1e-6);
  if (i < FLAP_POSES.length) {
    const {lift, up} = FLAP_POSES[i];
    return <FlapFlyer x={p.x} y={p.y - lift} s={0.8} up={up} color={p.color} flip={p.flip} />;
  }
  const d = w - at - B.pigeonFlapDur;
  const sq = d < 0.15 ? 1 - 0.18 * Math.sin(Math.PI * clamp(d / 0.15)) : 1;
  return sq === 1 ? (
    <Pigeon p={p} />
  ) : (
    <XG m={mat.about(mat.scale(1 / Math.sqrt(sq), sq), p.x, p.y)}>
      <Pigeon p={p} />
    </XG>
  );
};

// ---------------------------------------------------------------- padlocks + tags (S01Shutter events)

type Gid = 'govA' | 'govB' | 'govC';
/** govB's padlock further left than S01's (fix round 1: 10 left, at 452 its right side touched the lower-left corner of
 *  S11's note; S12 only: S01 has no note, and S12's last frame has no padlock). A1 fix round 1: 24 left (428): S11's
 *  note moved 7 world left in S11's A1 fix round 2 (left edge ~451 px on screen at the cut), and the slot between the
 *  window's left jamb (~397 px) and the note is 53 px for a ~48 px body (S01Shutter sizes it by building, so x is the
 *  only lever): no position leaves air on both sides. So the padlock hangs off the rail's left end IN FRONT of the jamb
 *  (a clear ~9 px overlap, drawn over the frame) and keeps ~15 px of slats to the note; Bit on its shackle ~24 px. */
const GOVB_PADLOCK_X = (S01_GOV.govB?.padlockProps?.x ?? PLAZA.gov.govB.padlock[0]) - 24;
const govB = S01_GOV.govB as GovEvents;
/** R phase: S01's events without the padlock glints (their 'PURPOSE' glints would replay at the rewind's first step). */
export const R_GOV: Record<Gid, GovEvents> = {
  govA: {...(S01_GOV.govA as GovEvents), glintAt: undefined},
  govB: {...govB, padlockProps: {...govB.padlockProps, x: GOVB_PADLOCK_X}, glintAt: undefined},
  govC: {...(S01_GOV.govC as GovEvents), glintAt: undefined},
};
/** P phase: the tags swing once on 'some' (govB, then govA), govA's swings again on 'governments'+0.25, both kick
 *  together on 'did' and the three padlocks glint at once on 'did' (+ DidSparkles). */
// (GovEvents types tagTapAt as one number; S01Shutter hands it straight to BackSoonTag / TagString `tapAt`, which take a
// list: two taps for govA)
const taps = (...ts: number[]) => ts as unknown as number;
export const P_GOV: Record<Gid, GovEvents> = {
  govA: {...R_GOV.govA, tagTapAt: taps(pc(B.tagSwing[1]), pc(B.tagTwirlA), pc(B.tagDid)), glintAt: pc(B.glint)},
  govB: {...R_GOV.govB, tagTapAt: taps(pc(B.tagSwing[0]), pc(B.tagDid)), glintAt: pc(B.glint)},
  govC: {...R_GOV.govC, glintAt: pc(B.glint)},
};

/** Where S01Shutter hangs a building's padlock (body centre, world): x = padlockProps.x, y = the rail - 20. */
export const padlockAt = (id: Gid, ev: GovEvents): [number, number] => {
  const [, y, , h] = PLAZA.gov[id].window;
  const stop = clamp(ev.shutterStop ?? ev.stopAt ?? 1, 0.05, 1);
  return [ev.padlockProps?.x ?? PLAZA.gov[id].padlock[0], y + stop * h - 20];
};

/** The phone-readable 'did' glint (fix round 1: S01's padlock glint rays are ~3 px ticks at phone size): a cream
 *  4-point sparkle with an ink rim (the sketch 'glint' language, as S11's lock sparkle) pops full size for one frame at
 *  the upper-right corner of each padlock body, then shrinks away by scale over 0.2 s. `t` = S12-local. */
/** Fix round 3 (review: ~20-30 px thin stars on cream padlocks were specks at phone size): `r` is in SCREEN px (26: about
 *  2x), a 2.5 px ink rim, a fuller waist; on its full-size frame a white glare slash also crosses the padlock body
 *  (`glare`: the body's local frame, S01Padlock's 40 x 30 body, scale `ps`). */
const Sparkle: React.FC<{x: number; y: number; r: number; at: number; t: number; glare?: {x: number; y: number; ps: number}}> = ({x, y, r: rPx, at, t, glare}) => {
  const k = Math.max(1e-4, matScale(useXf()));
  if (t < at || t >= at + 1 / 30 + 0.2) return null;
  const full = t < at + 1 / 30;
  const s = full ? 1 : 1 - E.inQuad(prog(t, at + 1 / 30, 0.2));
  if (s <= 0.04) return null;
  const r = rPx / k;
  const c = r * 0.13;
  const d = `M0 ${-r}Q${c} ${-c} ${r} 0Q${c} ${c} 0 ${r}Q${-c} ${c} ${-r} 0Q${-c} ${-c} 0 ${-r}Z`;
  return (
    <>
      {full && glare ? (
        <XG m={mat.compose(mat.translate(glare.x, glare.y), mat.scale(glare.ps))}>
          <path d="M-15 9L-6 -11L-1.5 -11L-10.5 9Z" fill={palette.white} />
          <path d="M-5 9L1 -4L3.4 -4L-2.6 9Z" fill={palette.white} />
        </XG>
      ) : null}
      <XG m={mat.compose(mat.translate(x, y), mat.rotate(8), mat.scale(s))}>
        <path d={d} fill={palette.cream} stroke={palette.ink} strokeWidth={2.5 / (k * Math.max(0.2, s))} strokeLinejoin="round" />
      </XG>
    </>
  );
};
/** 'did': one sparkle per padlock, LEFT TO RIGHT govA -> govB -> govC, 0.03 s apart (fix round 3: was 0.02). */
export const DidSparkles: React.FC<{t: number}> = ({t}) => {
  if (t < B.sparkle || t > B.sparkle + 0.35) return null;
  return (
    <>
      {(['govA', 'govB', 'govC'] as const).map((id, i) => {
        const [x, y] = padlockAt(id, P_GOV[id]);
        const s = S01_PADLOCK_SIZE[id] / 50;
        return <Sparkle key={id} x={x + 22 * s} y={y - 17 * s} r={26} at={B.sparkle + i * 0.03} t={t} glare={{x, y, ps: s}} />;
      })}
    </>
  );
};

// ---------------------------------------------------------------- the left edge onlooker (P phase)

/** S01's `Onlookers` with the phone timing of S12's P phase: his phone is up at the cut and comes down on
 *  'governments' (the arm is drawn by OnlookerPhoneArm, as in S01 after its raise, so the R phase's S01 Onlookers
 *  continues the same drawing). Mirrors scene01/plaza.tsx Onlookers (head size, colours, hair, acc, rim, seeds). */
export const OnlookersP: React.FC = () => (
  <>
    {ONLOOKERS.map((i) => {
      const o = PLAZA.onlookers[i];
      const head = 60 * o.s * 1.05;
      const body = [palette.tan, palette.sand, palette.sage][i];
      return (
        <React.Fragment key={i}>
          <EdgeOnlooker
            x={o.head[0] + ONL_DX[i]}
            y={o.head[1]}
            head={head}
            hair={(['short', 'bun', 'cap'] as const)[i]}
            body={body}
            acc={i === 1 ? ['scarf'] : i === 2 ? ['collar'] : ['hood']}
            rim={i === 2 ? 'left' : 'right'}
            arms={i === 0 ? false : 'both'}
            seed={`plaza/onl${i}`}
          />
          {i === 0 ? <OnlookerPhoneArm x={o.head[0] + ONL_DX[i]} y={o.head[1]} head={head} seed={`plaza/onl${i}`} coat={body} up={-1} down={pc(B.phonesDown[2])} hand={[232, 1468]} /> : null}
        </React.Fragment>
      );
    })}
  </>
);

// ---------------------------------------------------------------- Pip (P phase): the landing from S11's leap + the nod

/** R phase: S01's Pip plan without the dive exit (S12 never leaves for S02). */
export const R_PIP = {...S01_PIP, exitAt: 1e9};

/** Fix round 3 (review: camspeed WARN, 23.6 px / frame for f0-f6, 27.8 at touch-down): h 92 -> 70, touch-down vy ~20.6
 *  -> ~15.7 px / frame (the 16.8 px / frame sideways drift unchanged), apex still at -0.03, landing still on 'And'. */
const PIP_FALL = {h: 70, dx: 150} as const;
/** Fix round 2 (review: 19-29 px / frame on flat ink with no smear, and a 323 px jump from S11's last Pip): 3 short ink
 *  speed lines trail UP-LEFT behind Pip on every falling frame after the cut (f1-f8, the S03 FR3 smear language), their
 *  length growing with his speed (~28 -> ~40 px), anchored just behind his back along -velocity; they also lead the eye
 *  back toward S11's exit point. (x, y) = his feet, (vx, vy) = world px / s. */
const PipFallSmear: React.FC<{x: number; y: number; vx: number; vy: number; t: number}> = ({x, y, vx, vy, t}) => {
  if (t < 1 / 30 - 1e-4) return null;
  const sp = Math.hypot(vx, vy) || 1;
  const ux = -vx / sp;
  const uy = -vy / sp; // trailing direction (up-left)
  const cx = x + ux * 46;
  const cy = y - 46 + uy * 46; // behind the body centre (stand-side Pip ~92 px tall)
  const len = clamp((sp / 30) * 1.6, 24, 44);
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI;
  return <Ink d={speedLines(cx, cy, {n: 3, len, gap: 15, angle: ang, seed: 's12/pipSpd'})} width={2.4} taper={false} seed="s12/pipSpdI" />;
};
/** Pip in the P phase. S11 sends him leaping up-right toward the lens (stand-side, profile facing RIGHT, still rising at
 *  the cut: docs/scenes/S11.md 'Pip hand-off'). The wide picks the leap up just past its apex (B.pipApex < 0: the
 *  first frame is already falling) ~150 px up-left of his bollard (fix round 1: was 40, a near-still hang 425 px from
 *  S11's last position) and drops him onto it ON 'And' in a rightward arc (ballistic, ~28 px / frame at touch-down),
 *  still in the
 *  profile with the legs closing; a landing squash, then the pose pops to sit-back facing the plaza (S01's look-back
 *  state, so the rewind continues the same drawing). On 'did' he nods (a squash pulse +0.08 -> 0 over 0.2 s). `t` =
 *  S12-local seconds; his idle clock is the S01 clock (the component reads useTime()). */
export const PipP: React.FC<{t: number}> = ({t}) => {
  const w = useTime();
  const {x: X, y: Y} = S01_PIP;
  const land = B.pipLand;
  const sitAt = land + 0.14;
  if (t < land) {
    const T = land - B.pipApex;
    const g = (2 * PIP_FALL.h) / (T * T);
    const dt = t - B.pipApex;
    const y = Y - PIP_FALL.h + 0.5 * g * dt * dt;
    const x = X - PIP_FALL.dx * (1 - (t - B.pipApex) / T);
    const k = clamp(t / land);
    const amount = lerp(0.9, 0.35, E.inQuad(k));
    const rotate = lerp(-10, 8, k);
    return (
      <>
        <PipFallSmear x={x} y={y} vx={PIP_FALL.dx / T} vy={g * dt} t={t} />
        <Elephant x={x} y={y} scale={1} t={w} seed={S01_PIP_SEED} pose="stand-side" expression="happy" amount={amount} look={0.2} squash={-0.08} rotate={rotate} />
      </>
    );
  }
  if (t < sitAt) {
    const d = t - land;
    const squash = 0.26 * Math.exp(-d * 12) * Math.cos(d * Math.PI * 2 * 3.2);
    return <Elephant x={X} y={Y} scale={1} t={w} seed={S01_PIP_SEED} pose="stand-side" amount={0.2} look={0.2} squash={squash} />;
  }
  let squash = popSwitch(t, sitAt) * 1.4;
  if (t >= B.nod && t < B.nod + 0.2) {
    const u = (t - B.nod) / 0.2;
    squash += 0.08 * (u < 0.2 ? E.outCubic(u / 0.2) : 1 - E.inOutSine((u - 0.2) / 0.8));
  }
  return <Elephant x={X} y={Y} scale={1} t={w} seed={S01_PIP_SEED} pose="sit-back" look={S01_PIP.look * 0.2} squash={squash} />;
};

// ---------------------------------------------------------------- Bit: home along govA's cornice

/** Where Bit waits during S12 (on govA's cornice ledge, 2 body lengths toward govB) and his frame-0 spot (S01_BIT). */
export const BIT_AWAY: [number, number] = [S01_BIT[0] + 46, S01_BIT[1]];
/** Bit's own clock: it runs BACKWARDS to 0 at his arrival (his antennae, blinks and legs play in reverse, like the tape)
 *  and holds 0: his last-frame pose is S01's frame-0 Bit (idle, clock 0) to the pixel. */
export const bitClock = (t: number) => Math.max(0, B.bitWalk[1] - t);
/** Fix round 1 (continuity + gag): S11 leaves Bit on govB's padlock shackle, so the wide opens with him there (cream
 *  rim as in S11: an ink beetle on the dark shutter); the tape's padlock step (k 3) pops him back to govA's cornice
 *  (BIT_AWAY: S11's hop onto the shackle, undone), then he walks home backwards as the film's last motion. */
const BIT_SHACKLE_STEP = 3;
/** His feet on the shackle's top (S01Padlock: shackle arc top 34 units above the body centre, size / 50 per unit). */
const bitOnShackle = (): [number, number] => {
  const [x, y] = padlockAt('govB', P_GOV.govB);
  return [x, y - 34 * (S01_PADLOCK_SIZE.govB / 50) - 1.5];
};
/** A cream rim under Bit (as S11's BitRim): his shell + head silhouette, `px` screen px outside. */
const BitRim: React.FC<{x: number; y: number; size: number; px?: number}> = ({x, y, size, px = 1.8}) => {
  const k = Math.max(1e-4, matScale(useXf()));
  const s = size / 20;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.scale(s, s))}>
      <path d={bitPath(0, 0, 20, false)} fill={palette.cream} stroke={palette.cream} strokeWidth={(2 * px) / (k * s)} strokeLinejoin="round" />
    </XG>
  );
};
/** A1 fix round 1 (review: on the padlocks' tape step Bit jumped ~340 px from govB's shackle to govA's cornice in one
 *  frame, so a rewatcher following him lost him): S11's hop onto the shackle plays BACKWARDS in its own poses: on the
 *  first two frames of tape step 3 (f54-f55) he is mid-arc between the shackle and the cornice (u 0.55 of the way, 46
 *  world above the chord), nose DOWN as in S11's forward hop (the tape's backwards physics), stretched along the arc,
 *  with his cream rim; from f56 he sits on govA's cornice (BIT_AWAY). */
const BIT_HOP = {frames: 2, u: 0.55, lift: 46, rot: 24, stretch: 1.12} as const;
/** Bit walks BACKWARDS home (facing right, moving left) over B.bitWalk: the film's last motion, done 0.04 s before END. */
export const BitHome: React.FC<{t: number}> = ({t}) => {
  const [t0, t1] = B.bitWalk;
  if (t < R0 || stepIndex(t) < BIT_SHACKLE_STEP) {
    const [x, y] = bitOnShackle();
    return (
      <TimeProvider global={bitClock(t)} offset={0}>
        <BitRim x={x} y={y} size={PLAZA.bitSize} />
        <Bit x={x} y={y} size={PLAZA.bitSize} seed="plaza/bit" state="idle" look="up" />
      </TimeProvider>
    );
  }
  const hop0 = R0 + BIT_SHACKLE_STEP / REWIND_FPS;
  if (t < hop0 + BIT_HOP.frames / 30 - 1e-6) {
    const [sx, sy] = bitOnShackle();
    const x = lerp(sx, BIT_AWAY[0], BIT_HOP.u);
    const y = lerp(sy, BIT_AWAY[1], BIT_HOP.u) - BIT_HOP.lift;
    const c = PLAZA.bitSize * 0.25; // about his shell's middle
    return (
      <TimeProvider global={bitClock(t)} offset={0}>
        <XG m={mat.about(mat.compose(mat.rotate(BIT_HOP.rot), mat.scale(1 / Math.sqrt(BIT_HOP.stretch), BIT_HOP.stretch)), x, y - c)}>
          <BitRim x={x} y={y} size={PLAZA.bitSize} />
          <Bit x={x} y={y} size={PLAZA.bitSize} seed="plaza/bit" state="idle" look="down" />
        </XG>
      </TimeProvider>
    );
  }
  const u = clamp((t - t0) / (t1 - t0));
  const x = lerp(BIT_AWAY[0], S01_BIT[0], E.inOutSine(u));
  const walking = t >= t0 && t < t1;
  return (
    <TimeProvider global={bitClock(t)} offset={0}>
      <Bit x={x} y={S01_BIT[1]} size={PLAZA.bitSize} seed="plaza/bit" state={walking ? 'crawl' : 'idle'} />
    </TimeProvider>
  );
};

// ---------------------------------------------------------------- S11's sticky note (J6), carried into the wide

/** S11 leaves the tech-support note slapped on govB's closed shutter, 'and on again' struck (Scene11.tsx NOTE: the same
 *  plaza world coords, size, tilt, lettering and seed). The wide opens with it there (continuity across the hard cut);
 *  the rewind takes it off FIRST, the S11 event being the latest one: on 'before' it un-slaps and flutters back up-left
 *  in two tape steps (StickyNote's own flutter, played backwards), then it is gone; S01's tags and padlocks follow. */
/** A1 fix round 1: S11's A1 fix round 2 numbers (Scene11.tsx NOTE / NOTE_FS / NOTE_ROT; was {545, 1028, 146, 112, -4,
 *  24.5}). */
export const S11_NOTE = {x: 538, y: 1031, w: 144, h: 100, rot: -2, fs: 25, lines: ['Turn it off', 'and on again']} as const;
/** S11's drop (Scene11.tsx NoteFlight): the breeze tips the sheet up over govB's cornice-ledge lip (NOTE_LIP) and it
 *  flutters down (back showing, paper-flip to the face at the end) onto the shutter: 0.52 s (lift 0.1, flip 0.15),
 *  slapping on at 50.215; its back is NOTE_BACK. */
const NOTE_LIP: [number, number] = [578, 904];
const NOTE_BACK = {w: 120, h: 100, fs: 19} as const;
const NOTE_FLIGHT = {dur: 0.52, lift: 0.1, flip: 0.15} as const;
/** S11's film times for the note: the slap, the last breeze flutter and corner curl (both still running at S11's last
 *  frame: S12 picks them up mid-way, so the note sways and curls on across the cut). */
const S11_T = {slap: 50.215, breeze: 51.955, curl: 51.975} as const;
const NOTE_SLAP = 100; // the note's own clock: it slaps on at 100 (= film 50.215)
/** P phase: the note's clock runs with the film (S12-local t -> note clock). */
const noteP = (t: number) => NOTE_SLAP + (S12_START + t - S11_T.slap);
const noteAbs = (abs: number) => NOTE_SLAP + (abs - S11_T.slap);
/** Corner curls: S11's last one (in progress at the cut), then on 'of' and after 'governments'; each curl with a breeze
 *  flutter 0.02 s before it (S11's pairing; the 'governments' one also feeds the f30-f40 lull). */
const NOTE_CURLS = [noteAbs(S11_T.curl), noteP(B.noteCurl[0]), noteP(B.noteCurl[1])];
const NOTE_BREEZE = [noteAbs(S11_T.breeze), noteP(B.noteCurl[0] - 0.02), noteP(B.noteCurl[1] - 0.02)];
/** The rewind (A1 fix round 1, review: the note un-slapped, fluttered up-left and blinked out in mid-air over govB's
 *  drum): S11's own drop plays BACKWARDS, one pose per tape step from 'before', and the note goes back where it came
 *  from: k0 the un-slap squash (+ slap ticks), k1 lifting off the shutter with its back turning toward us (mid-flip,
 *  ~0.8 wide, ~50 world up), k2 tipped back over govB's cornice-ledge lip (half height, 9 deg), k3 a thin sheet lying
 *  down onto the ledge (~0.2 height) -> gone from k4 ('there', f57): it lies flat on the ledge, out of sight from the
 *  street, as before S11's breeze lifted it. */
const NOTE_STEPS = [NOTE_SLAP + 0.03, NOTE_SLAP - 0.12, NOTE_SLAP - 0.43, NOTE_SLAP - 0.512];
const noteClock = (t: number) => (t < R0 ? noteP(t) : NOTE_STEPS[stepIndex(t)] ?? -1);
export const S11Note: React.FC<{t: number}> = ({t}) => {
  const c = noteClock(t);
  if (c < NOTE_SLAP - NOTE_FLIGHT.dur) return null;
  const N = S11_NOTE;
  const face = (stuck: boolean) => (
    <StickyNote
      x={N.x}
      y={N.y}
      w={N.w}
      h={N.h}
      lines={[...N.lines]}
      size={N.fs}
      slapAt={stuck ? NOTE_SLAP : undefined}
      flutter={false}
      strike={stuck ? 'and on again' : undefined}
      strikeAt={stuck ? NOTE_SLAP - 50 : undefined}
      curlAt={NOTE_CURLS}
      rot={N.rot}
      inkPx={3}
      seed="s11/J6"
    />
  );
  return (
    <TimeProvider global={c} offset={0}>
      {c < NOTE_SLAP ? (
        <NoteFlight
          x={N.x}
          y={N.y}
          h={N.h}
          lip={NOTE_LIP}
          arriveAt={NOTE_SLAP}
          dur={NOTE_FLIGHT.dur}
          liftDur={NOTE_FLIGHT.lift}
          flipDur={NOTE_FLIGHT.flip}
          back={<NoteBack x={N.x} y={N.y} w={NOTE_BACK.w} h={NOTE_BACK.h} rot={N.rot} lines={[...N.lines]} fontSize={NOTE_BACK.fs} inkPx={3} />}
          face={face(false)}
        />
      ) : (
        <NoteBreeze x={N.x} y={N.y} h={N.h} flutterAt={NOTE_BREEZE}>
          {face(true)}
        </NoteBreeze>
      )}
    </TimeProvider>
  );
};
