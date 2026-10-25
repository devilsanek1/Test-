// S12 cast: the P-phase plans (S12's own beats placed in the S01 clock, pClock) for S01's citizens, pigeons, edge
// onlooker, padlocks and tags; the R-phase plans (S01's own, minus what S12 does not replay: the pigeons' scatter, the
// padlock glints, Pip's exit to S02); Pip's landing from S11's leap; Bit's walk home. Everything is a pure function of
// time. S01's components are reused as they are (scene01/cast.tsx, plaza.tsx, shims.tsx): the plaza at the end of S12
// IS S01's code at t = 0.
import React from 'react';
import {clamp, ease as E, lerp, prog, TimeProvider, useTime} from '../../lib/time';
import {Elephant, popSwitch} from '../../lib/mascot';
import {GovEvents, PLAZA} from '../shared/sets';
import {Bit, bitPath, EdgeOnlooker, StickyNote} from '../shared/props';
import {matScale} from '../shared/props/common';
import {mat, useXf, XG} from '../../lib/xf';
import {palette} from '../../lib/theme';
import {S01_PADLOCK_SIZE} from '../scene01/shims';
import {CitizenPlan, OnlookerPhoneArm, PigeonPlan} from '../scene01/cast';
import {NearPlan, ONL_DX, ONLOOKERS, S01_BIT, S01_CITIZENS, S01_GOV, S01_NEAR, S01_PIGEONS, S01_PIP, S01_PIP_SEED} from '../scene01/plaza';
import {B, pClock, R0, stepIndex} from './timing';

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
  // sB (second row, x 640, under govB's right edge; brown coat, so the sleeve reads on the cream steps): points UP-LEFT
  // at govB's shuttered window on 'those', lowers it before 'did'. Fix round 1: a LONG straight arm (~78 px on screen,
  // was ~45) raised steeply, so the hand clears the far-row heads behind him and the line runs on to govB's padlock
  's01/sB': {turn: [{t: -1, d: -1}, {t: pc(B.pointDown + 0.04), d: 0}], point: {at: pc(B.point), side: -1, hand: [-90, -240], downAt: pc(B.pointDown)}, lean: [{t: -1, a: -4}, {t: pc(B.point), a: -6}, {t: pc(B.pointDown), a: 0}]},
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
  return {...rest, landAt: pc(land - B.pigeonFly), inDur: B.pigeonFly, ...(i === 1 ? {shuffleAt: pc(B.pigeonFlap), shuffleDx: 0} : {})};
});

// ---------------------------------------------------------------- padlocks + tags (S01Shutter events)

type Gid = 'govA' | 'govB' | 'govC';
/** govB's padlock 10 px further left than S01's (fix round 1: at 452 its right side touched the lower-left corner of
 *  S11's note; S12 only: S01 has no note, and S12's last frame has no padlock). */
const GOVB_PADLOCK_X = (S01_GOV.govB?.padlockProps?.x ?? PLAZA.gov.govB.padlock[0]) - 10;
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
const Sparkle: React.FC<{x: number; y: number; r: number; at: number; t: number}> = ({x, y, r, at, t}) => {
  const k = Math.max(1e-4, matScale(useXf()));
  if (t < at || t >= at + 1 / 30 + 0.2) return null;
  const s = t < at + 1 / 30 ? 1 : 1 - E.inQuad(prog(t, at + 1 / 30, 0.2));
  if (s <= 0.04) return null;
  const w = r * 0.26;
  const d = `M0 ${-r}Q${w * 0.35} ${-w * 0.35} ${r} 0Q${w * 0.35} ${w * 0.35} 0 ${r}Q${-w * 0.35} ${w * 0.35} ${-r} 0Q${-w * 0.35} ${-w * 0.35} 0 ${-r}Z`;
  return (
    <XG m={mat.compose(mat.translate(x, y), mat.rotate(8), mat.scale(s))}>
      <path d={d} fill={palette.cream} stroke={palette.ink} strokeWidth={1.8 / (k * Math.max(0.2, s))} strokeLinejoin="round" />
    </XG>
  );
};
export const DidSparkles: React.FC<{t: number}> = ({t}) => {
  if (t < B.sparkle || t > B.sparkle + 0.3) return null;
  return (
    <>
      {(['govA', 'govB', 'govC'] as const).map((id, i) => {
        const [x, y] = padlockAt(id, P_GOV[id]);
        const s = S01_PADLOCK_SIZE[id] / 50;
        return <Sparkle key={id} x={x + 22 * s} y={y - 17 * s} r={15} at={B.sparkle + i * 0.02} t={t} />;
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

const PIP_FALL = {h: 92, dx: 150} as const;
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
    return <Elephant x={x} y={y} scale={1} t={w} seed={S01_PIP_SEED} pose="stand-side" expression="happy" amount={amount} look={0.2} squash={-0.08} rotate={rotate} />;
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
export const S11_NOTE = {x: 545, y: 1028, w: 146, h: 112, rot: -4, fs: 24.5, lines: ['Turn it off', 'and on again']} as const;
const NOTE_SLAP = 100; // the note's own clock: stuck on from 100
const NOTE_FLUTTER = 0.36;
/** Its clock per tape step from 'before': the un-slap squash, mid-flight, nearly back at the flutter start, gone. */
const NOTE_STEPS = [NOTE_SLAP + 0.03, NOTE_SLAP - 0.14, NOTE_SLAP - 0.3];
/** The note's corner curls in the breeze on 'of' and after 'governments' (its clock runs NOTE_SLAP + 1 + t in P). */
const NOTE_CURLS = [NOTE_SLAP + 1 + B.noteCurl[0], NOTE_SLAP + 1 + B.noteCurl[1]];
const noteClock = (t: number) => (t < R0 ? NOTE_SLAP + 1 + t : NOTE_STEPS[stepIndex(t)] ?? -1);
export const S11Note: React.FC<{t: number}> = ({t}) => {
  const c = noteClock(t);
  if (c < NOTE_SLAP - NOTE_FLUTTER) return null;
  const N = S11_NOTE;
  return (
    <TimeProvider global={c} offset={0}>
      <StickyNote x={N.x} y={N.y} w={N.w} h={N.h} lines={[...N.lines]} size={N.fs} slapAt={NOTE_SLAP} flutter={{from: [N.x - 200, N.y - 230], dur: NOTE_FLUTTER}} strike="and on again" strikeAt={NOTE_SLAP - 50} curlAt={NOTE_CURLS} rot={N.rot} inkPx={3} seed="s11/J6" />
    </TimeProvider>
  );
};
