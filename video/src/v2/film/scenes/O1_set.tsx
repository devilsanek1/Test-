// O1_set (lane L1-desk): the HOOK's set, shared by O1 (0-6.12) and P12 (O1's end frame, matched, 33.08-35.32).
// HOME BASE desk, COZY, INSERT high 3/4 (the approved style frame desk_A.png, kit/Desk), now a full, living corner: the
// bookcase cut by the top left, the shelf with its trailing plant, a print and a clock over the caption band, the
// dusk town in the window cut by the right edge, the lamp head cut by the right edge and its golden pool, the desk's
// back edge, front face, right end + leg, the floor line past it, the knee space (a tote bag, a power strip). HER CAT
// sits at the desk's front-right corner and watches every beat (its eye-line leads the viewer). Steam, dust motes, a
// moth under the lamp, the clock's second hand, the town's clouds / birds / windows: always on.
//
// Locked board (public/v2/animatic.json O1, docs/v2/storyboard_g3.md), O1-local seconds = VO seconds:
//   t < 0      the loop underlay = frame 0's drawing: bare ink lines draw on from the contract outward (ink wave from
//              -0.30 s at 3000 px/s), the town and the cat in bare lines too; no colour, no life
//   0.00-0.27  colour floods out of the lamp pool (0.03 s, 4800 px/s): every fill flips whole, life starts with it
//   -0.04-0.28 the signature draws on (the "signed!" chime 0.08)
//   0.32-0.58  her sleeve (the hero) brings her GOOGLE badge (lanyard bunched in her hand) to the centre ("quit")
//   0.70-0.84  ... over the box; 0.84 lets go; 0.92 it lands in the box (badge clack, "Google."): squash, the photo
//              frame knocks, the lanyard drapes over the rim
//   0.84-1.10  her hand takes the box's corner, lifts it (1.18), 1.30-1.82 carries it out of frame left (accelerating)
//   1.84-2.14  the sleeve comes back with the highlighter (one glide), 2.14-2.52 aims over the clause
//   2.60-2.98  on "contract" the pop band sweeps under "no criticizing", hops, "Google" (marker squeak 2.60)
//   3.06-3.40  the sleeve leaves bottom-left
//   3.00-3.42  on "bans" the page steps out past its own end (2030; paper unroll 3.00)
//   3.55-6.12  it pours, faster and faster: over the front edge ~4.0, down the desk's front 2040 / 2050 / 2060, onto
//              the floor ~5.9 coming toward us (O1_runon.tsx); "for life" lands in near silence
//   camera     PULL OUT 1.05 -> 1.00 about the frame centre, ease-in (inQuad), the whole shot (kit o1Cam); t < 0 holds 1.05
// P12 (mode "p12", P12-local t): the same set at O1's end (no box, bands done, the run-on at its O1 end, camera 1.00),
// the cat looking down at the run-on on the floor; on "can't" (t 0.64, short unroll) the paper slides on 200 px. HOLD.
import React from 'react';
import {ease as E, prog, useTime} from '../../../lib/time';
import {mat, Mat, XG} from '../../../lib/xf';
import {smooth} from '../../../lib/sketch';
import {useCaptionFont} from '../../../lib/font';
import {
  add,
  applyM,
  BADGE_REST,
  Badge,
  type BadgeState,
  Box,
  BOX,
  BuildWave,
  type BuildWaveV,
  Cat,
  CC,
  clauseRow,
  ContractPage,
  DeskBack,
  DeskMug,
  DESK,
  dirDeg,
  DustMotes,
  HerArm,
  LampHead,
  Lanyard,
  lerp,
  lerpPt,
  O1_PAGE,
  o1Cam,
  pagePoint,
  Pen,
  type Pt,
  radialWave,
} from '../kit';
import {O1RunOn, o1RunOn, O1_RUN_END, runOnTip} from './O1_runon';
import {DeskBits, FairyLights, Moth, TownLines, UnderBox, UnderDesk, WallDress} from './O1_dress';

// ---------------------------------------------------------------- timing (O1-local seconds = VO seconds)

export const O1_END = 6.12;
/** The opening's build: ink from the contract (earlier than the G4 test so frame 0 is ~85 % drawn), colour from the
 *  lamp pool, done by ~0.27 s (the G4 test took 0.16-0.67). */
export const O1_BUILD = {inkO: [544, 954] as Pt, inkT0: -0.3, inkSpeed: 3000, colO: [575, 965] as Pt, colT0: 0.03, colSpeed: 4800};
const SIG = {at: -0.04, dur: 0.32};
const CARRY = {in: [0.32, 0.58], over: [0.7, 0.84], land: 0.92, away: [0.84, 0.96], grab: [0.98, 1.16], lift: [1.18, 0.14], out: [1.3, 0.52]} as const;
const HL = {in: [1.84, 2.14], touch: [2.52, 2.6], row1: [2.6, 2.8], hop: [2.8, 2.86], row2: [2.86, 2.98], lift: [2.98, 3.06], out: [3.06, 3.4]} as const;
/** P12: on "can't" (P12 t 0.64; lead 0.04) the paper slides on 200 px, accelerating. */
const P12_SLIDE = {at: 0.6, dur: 0.5, px: 200};

// ---------------------------------------------------------------- her hand, the badge, the box

/** The hand's axis (from the "tip" toward her fist) and the forearm's direction (toward her): the style frame's arm. */
const AXIS = 112;
const FOREARM = 121;
const U = dirDeg(AXIS);
const V = dirDeg(FOREARM);
/** The badge card's centre sits this far along U from the tip (the fist overlaps its lower edge). */
const CARD_K = 40;
const CARD_IN: Pt = [-330, 1250];
const CARD_MID: Pt = [470, 702];
const CARD_DROP: Pt = [190, 712];
const REST_C: Pt = [170, 872];
/** The fist on the box's front-right top corner (canvas px, box at rest). */
const GRIP: Pt = [300, 936];
/** Where the fist pulls away to as the badge falls (up and right of the box: the sleeve clears the landing). */
const AWAY: Pt = [404, 768];

const cardAt = (t: number): {c: Pt; rot: number} => {
  if (t < CARRY.in[1]) {
    const p = E.outCubic(prog(t, CARRY.in[0], CARRY.in[1] - CARRY.in[0]));
    const c = lerpPt(CARD_IN, CARD_MID, p);
    return {c: [c[0], c[1] - 70 * Math.sin(Math.PI * p)], rot: 22 + 16 * (1 - p)};
  }
  if (t < CARRY.over[0]) {
    const s = t - CARRY.in[1];
    return {c: [CARD_MID[0] + 7 * Math.exp(-s * 12) * Math.sin(s * 30), CARD_MID[1]], rot: 22 - 8 * Math.exp(-s * 9) * Math.sin(s * 24)};
  }
  const p = E.inOutSine(prog(t, CARRY.over[0], CARRY.over[1] - CARRY.over[0]));
  const c = lerpPt(CARD_MID, CARD_DROP, p);
  return {c: [c[0], c[1] - 26 * Math.sin(Math.PI * p)], rot: 22 - 12 * p + 6 * Math.sin(Math.PI * p)};
};
const cardM = (c: Pt, rot: number): Mat => mat.compose(mat.translate(c[0], c[1]), mat.rotate(rot));

/** The box's lanyard loop (kit/Props Box restPts), bunched toward the clip by (1 - drape) / 2: the carried badge wears
 *  exactly the loop the box then drapes, so the hand-over at the release is seamless. */
const REST_CLIP = applyM(BADGE_REST, 0, -54);
const REST_PTS: Pt[] = [REST_CLIP, [112, 822], [74, 856], [80, 904], [104, BOX.rim], [116, 968], [158, 992], [204, 978], [224, 944], [226, BOX.rim - 6], [220, 896], [204, 858], add(REST_CLIP, [12, 2])];
const INV_REST = mat.inv(BADGE_REST);
const lanyardFor = (m: Mat, drape: number) =>
  smooth(
    REST_PTS.map((q0): Pt => {
      const q = applyM(INV_REST, q0[0], q0[1]);
      const k = 0.5 + 0.5 * drape;
      return applyM(m, q[0] * k, -54 + (q[1] + 54) * k);
    }),
    {closed: true},
  );

/** The badge once it is in the box (box-local = canvas at rest): the fall, the hop, the wobble, the drape. */
const boxBadge = (t: number): BadgeState | null => {
  if (t < CARRY.over[1]) return null;
  const rel = cardAt(CARRY.over[1]);
  if (t < CARRY.land) {
    const p = E.inQuad(prog(t, CARRY.over[1], CARRY.land - CARRY.over[1]));
    return {m: cardM(lerpPt(rel.c, REST_C, p), lerp(rel.rot, -11, p)), drape: 0};
  }
  const s = t - CARRY.land;
  const hop = s < 0.16 ? -12 * Math.sin((Math.PI * s) / 0.16) : 0;
  const wob = 5 * Math.exp(-s * 9) * Math.sin(s * 30);
  return {m: mat.compose(mat.translate(0, hop), BADGE_REST, mat.rotate(wob)), drape: E.outCubic(prog(t, CARRY.land, 0.22))};
};

/** The box's offset while she carries it out (a lift on the grip, then out to the left, accelerating). */
const boxOff = (t: number): Pt => [-760 * E.inQuad(prog(t, CARRY.out[0], CARRY.out[1])), -18 * E.outQuad(prog(t, CARRY.lift[0], CARRY.lift[1]))];

/** The clause rows on canvas (row start / end) and the hover point above row 1. */
const useClause = () => {
  const ok = useCaptionFont();
  const r0 = clauseRow(0, ok);
  const r1 = clauseRow(1, ok);
  const P = (q: Pt) => pagePoint(O1_PAGE, q[0], q[1]);
  return {A0: P(r0[0]), Z0: P(r0[1]), A1: P(r1[0]), Z1: P(r1[1]), H: P([r0[0][0] - 12, r0[0][1] - 18])};
};
type Clause = ReturnType<typeof useClause>;

type ArmState = {tip: Pt; holding: 'none' | 'highlighter'} | null;

/** Her sleeve: the badge carry and the box (phase A), the highlighter (phase B). */
const armAt = (t: number, cl: Clause): ArmState => {
  if (t < CARRY.in[0]) return null;
  if (t < CARRY.over[1]) {
    const {c} = cardAt(t);
    return {tip: add(c, U, -CARD_K), holding: 'none'};
  }
  if (t < CARRY.out[0] + CARRY.out[1]) {
    // let go, pull up and right (the sleeve clears the box as the badge lands), then take the box's corner
    const rel = add(cardAt(CARRY.over[1]).c, U, -CARD_K);
    const away = add(AWAY, U, -131);
    const grip = add(GRIP, U, -131);
    const o = boxOff(t);
    const tip = t < CARRY.grab[0] ? lerpPt(rel, away, E.outCubic(prog(t, CARRY.away[0], CARRY.away[1] - CARRY.away[0]))) : lerpPt(away, grip, E.inOutSine(prog(t, CARRY.grab[0], CARRY.grab[1] - CARRY.grab[0])));
    return {tip: [tip[0] + o[0], tip[1] + o[1]], holding: 'none'};
  }
  if (t < HL.in[0]) return null;
  const H0: Pt = [cl.H[0] - 22, cl.H[1] - 26];
  if (t < HL.in[1]) {
    const p = E.outCubic(prog(t, HL.in[0], HL.in[1] - HL.in[0]));
    return {tip: add(H0, V, 900 * (1 - p)), holding: 'highlighter'};
  }
  if (t < HL.touch[0]) {
    const p = E.inOutSine(prog(t, HL.in[1], HL.touch[0] - HL.in[1]));
    const drift: Pt = [3 * Math.sin(t * 5.1), 2.5 * Math.sin(t * 3.7 + 1)];
    const q = lerpPt(H0, cl.H, p);
    return {tip: [q[0] + drift[0], q[1] + drift[1]], holding: 'highlighter'};
  }
  if (t < HL.row1[0]) return {tip: lerpPt(cl.H, cl.A0, E.inOutSine(prog(t, HL.touch[0], HL.touch[1] - HL.touch[0]))), holding: 'highlighter'};
  if (t < HL.row1[1]) return {tip: lerpPt(cl.A0, cl.Z0, E.inOutSine(prog(t, HL.row1[0], HL.row1[1] - HL.row1[0]))), holding: 'highlighter'};
  if (t < HL.row2[0]) {
    const p = E.inOutSine(prog(t, HL.hop[0], HL.hop[1] - HL.hop[0]));
    const q = lerpPt(cl.Z0, cl.A1, p);
    return {tip: [q[0], q[1] - 16 * Math.sin(Math.PI * p)], holding: 'highlighter'};
  }
  if (t < HL.row2[1]) return {tip: lerpPt(cl.A1, cl.Z1, E.inOutSine(prog(t, HL.row2[0], HL.row2[1] - HL.row2[0]))), holding: 'highlighter'};
  const up: Pt = [cl.Z1[0] + 8, cl.Z1[1] - 18];
  if (t < HL.out[0]) return {tip: lerpPt(cl.Z1, up, E.outQuad(prog(t, HL.lift[0], HL.lift[1] - HL.lift[0]))), holding: 'highlighter'};
  if (t < HL.out[1]) return {tip: add(up, V, 1150 * E.inCubic(prog(t, HL.out[0], HL.out[1] - HL.out[0]))), holding: 'highlighter'};
  return null;
};

const bandsAt = (t: number): [number, number] => [prog(t, HL.row1[0], HL.row1[1] - HL.row1[0], E.inOutSine), prog(t, HL.row2[0], HL.row2[1] - HL.row2[0], E.inOutSine)];

// ---------------------------------------------------------------- the cat (her home's living character)

/** The cat sits at the desk's front-right corner (in front of the mug, clear of the clause, the run-on and the right
 *  rail's buttons) and watches: the signature, the badge, the box going, the highlighter, the run-on pouring off. */
export const O1_CAT = {x: 868, y: DESK.front - 6, size: 250};
const catLook = (t: number, cl: Clause): Pt => {
  const lag = t - 0.06;
  if (lag < 0.3) return [520, 1130];
  if (lag < CARRY.over[1]) return cardAt(lag).c;
  if (lag < CARRY.out[0]) return [REST_C[0], REST_C[1] - 10];
  if (lag < HL.in[0]) return [Math.max(-300, 170 + boxOff(lag)[0]), 900];
  if (lag < 3.2) {
    const a = armAt(lag, cl);
    return a ? a.tip : cl.Z1;
  }
  return runOnTip(o1RunOn(lag));
};

// ---------------------------------------------------------------- the set

export type O1SetProps = {
  /** 'o1' (default): O1-local time, the whole opening. 'p12': P12-local time, O1's end frame held (the slide on "can't"). */
  mode?: 'o1' | 'p12';
};

/** O1's whole set (no World: O1 and P12 wrap it). Reads scene time from useTime(). */
export const O1Set: React.FC<O1SetProps> = ({mode = 'o1'}) => {
  const tScene = useTime();
  const p12 = mode === 'p12';
  // the action clock: O1 = scene time; P12 = O1's end, held
  const t = p12 ? O1_END : tScene;
  const cl = useClause();
  const cam = p12 ? mat.I : o1Cam(t, O1_END);
  const wave: BuildWaveV | null = p12
    ? null
    : {
        inkAt: radialWave(O1_BUILD.inkO, O1_BUILD.inkT0, O1_BUILD.inkSpeed),
        colourAt: radialWave(O1_BUILD.colO, O1_BUILD.colT0, O1_BUILD.colSpeed),
        paper: CC.wall,
        uncam: mat.inv(cam),
      };
  const built = (children: React.ReactNode) => (wave ? <BuildWave value={wave}>{children}</BuildWave> : <>{children}</>);

  // her badge, the box
  const carried = !p12 && t >= CARRY.in[0] && t < CARRY.over[1] ? cardAt(t) : null;
  const inBox = boxBadge(t);
  const land = t - CARRY.land;
  const jolt = land > 0 && land < 0.14 ? Math.sin((Math.PI * land) / 0.14) : 0;
  const knock = land > 0.02 ? 6 * Math.exp(-(land - 0.02) * 6) * Math.sin((land - 0.02) * 22) : 0;
  const off = boxOff(t);
  const boxGone = t >= CARRY.out[0] + CARRY.out[1];
  // the clause, the signature, the run-on
  const bands = bandsAt(t);
  const slide = p12 ? P12_SLIDE.px * prog(tScene, P12_SLIDE.at, P12_SLIDE.dur, E.inQuad) : 0;
  const L = p12 ? O1_RUN_END : o1RunOn(t);
  const arm = p12 ? null : armAt(t, cl);
  const look: Pt = p12 ? (tScene < P12_SLIDE.at ? [600, 1840] : [560, 1900]) : catLook(t, cl);
  return (
    <XG m={cam}>
      {built(
        <>
          <DeskBack />
          <WallDress />
          <FairyLights />
          <TownLines />
          <UnderDesk />
          <UnderBox />
          <DeskBits />
          {boxGone ? null : <Box x={BOX.bl + off[0]} y={BOX.back + off[1]} badge={inBox} jolt={jolt} knock={knock} seed="o1/box" />}
          <ContractPage {...O1_PAGE} bands={bands} sigAt={p12 ? undefined : SIG.at} sigDur={SIG.dur} runOn={0} seed="o1/page" />
        </>,
      )}
      <O1RunOn L={L} slide={slide} />
      {built(
        <>
          <DustMotes cx={DESK.pool.cx + 40} cy={DESK.pool.cy - 60} rx={DESK.pool.rx * 0.9} ry={DESK.pool.ry * 0.8} n={12} r={3.6} seed="o1/motes" />
          <XG m={mat.translate(-600, 30)}>
            <Pen />
          </XG>
          <DeskMug />
          <LampHead />
          <Cat x={O1_CAT.x} y={O1_CAT.y} size={O1_CAT.size} pose="sit" facing="l" look={look} seed="o1/cat" />
          <Moth />
        </>,
      )}
      {carried ? (
        <>
          <Lanyard d={lanyardFor(cardM(carried.c, carried.rot), 0)} />
          <Badge x={carried.c[0]} y={carried.c[1]} w={168} rot={carried.rot} seed="o1/badgeC" />
        </>
      ) : null}
      {arm ? <HerArm tip={arm.tip} holding={arm.holding} reach={1040} axis={AXIS} forearm={FOREARM} seed="o1/arm" /> : null}
    </XG>
  );
};
