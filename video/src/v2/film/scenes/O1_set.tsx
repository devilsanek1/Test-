// O1_set (lane L1-desk): the HOOK's set, shared by O1 (0-6.12) and P12 (O1's end frame, matched, 33.08-35.32).
// HOME BASE desk, COZY, INSERT high 3/4 (the approved style frame desk_A.png, kit/Desk), a full, living corner: the
// bookcase cut by the top left, the shelf with its trailing plant and fairy lights (raised so P12's credit tab sits on
// bare wall), a print and a clock over the caption band, the dusk town in the window cut by the right edge, the lamp
// head cut by the right edge and its golden pool, the desk's back edge, front face, right end + leg, the floor line
// past it, the knee space (a tote, slippers, magazines, a power strip). HER CAT sits at the desk's front-right corner
// and WATCHES every beat: its head turns to 3/4, dips and leans toward the badge, the box going, the highlighter and the
// run-on pouring off the edge (the kit Cat's `turn`). Steam (long thin wisps), dust motes, a moth, the clock, the town, the
// shelf's tendril, the phone and the LED: always on.
//
// Locked board (public/v2/animatic.json O1, docs/v2/storyboard_g3.md), O1-local seconds = VO seconds:
//   t < 0      the loop underlay = frame 0's drawing: bare ink lines draw on from the contract outward (ink wave from
//              -0.30 s at 3000 px/s), the town and the cat in bare lines too; no colour, no life
//   0.00-0.27  colour floods out of the lamp pool (0.03 s, 4800 px/s): every fill flips whole, life starts with it
//   -0.04-0.28 the signature draws on (the "signed!" chime 0.08)
//   0.32-0.58  her sleeve (the hero) brings her GOOGLE badge to the centre, lifting it toward the lens (1.0 -> 1.4x),
//              held by its top edge from behind (her fingertips over the edge: GOOGLE stays whole), 0.58-0.70 shown
//   0.70-0.84  ... over the box (back to 1.0x); 0.84 lets go; 0.92 it lands IN the box (badge clack, "Google."): only
//              its top third and the clip show over the front wall, its lanyard spills over the rim, the box squashes
//   0.84-1.10  her hand takes the box's corner, lifts it (1.18), 1.30-1.82 carries it out of frame left (accelerating)
//   1.84-2.14  the sleeve comes back with the highlighter (one glide), 2.14-2.52 aims over the clause
//   2.60-2.98  on "contract" the pop band sweeps under "no criticizing", hops, "Google" (marker squeak 2.60)
//   3.06-3.40  the sleeve leaves bottom-left
//   3.00-3.41  on "bans" the page ratchets out past its own end in five steps (2030; paper unroll 3.00)
//   3.50-6.04  it pours, faster and faster (kit/RunOn.tsx): over the lip 3.90, 2040 4.23, 2050 4.88, 2060 5.36, 2070
//              5.67, on the floor 5.72, 2080 5.98, out past the bottom edge 6.04; "for life" lands in near silence
//   camera     PULL OUT 1.05 -> 1.00 about the frame centre, ease-in (inQuad), the whole shot (kit o1Cam); t < 0 holds 1.05
// P12 (mode "p12", P12-local t): the same set at O1's end (no box, bands done, the run-on at its O1 end, camera 1.00),
// her cat bowed over the desk's front edge looking down at the run-on on the floor; on "can't" (t 0.64, short unroll)
// the paper slides on ~200 px (the years cross the lip) and the cat's tail flicks. HOLD.
import React from 'react';
import {ease as E, prog, useTime} from '../../../lib/time';
import {mat, Mat, XG} from '../../../lib/xf';
import {hline, line, poly, rect, roundRect, smooth} from '../../../lib/sketch';
import {useCaptionFont} from '../../../lib/font';
import {
  add,
  applyM,
  Badge,
  Box,
  BOX,
  BuildWave,
  Cat,
  catTurnHead,
  O1RunOn,
  o1RunOn,
  o1RunSpeed,
  O1_KICKS,
  O1_RUN_END,
  runOnTip,
  type CatTurn,
  type BuildWaveV,
  CC,
  clauseRow,
  ContractPage,
  DeskBack,
  DESK_SHELF_UP,
  DeskMug,
  DESK,
  dirDeg,
  DustMotes,
  Fill,
  HerArm,
  Ink,
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
  W,
} from '../kit';
import {DeskBits, FairyLights, Moth, Phone, ShelfTendril, TownLines, UnderBox, UnderDesk, WallDress} from './O1_dress';

// ---------------------------------------------------------------- timing (O1-local seconds = VO seconds)

export const O1_END = 6.12;
/** The opening's build: ink from the contract (earlier than the G4 test so frame 0 is ~85 % drawn), colour from the
 *  lamp pool, done by ~0.27 s (the G4 test took 0.16-0.67). */
export const O1_BUILD = {inkO: [544, 954] as Pt, inkT0: -0.3, inkSpeed: 3000, colO: [575, 965] as Pt, colT0: 0.03, colSpeed: 4800};
const SIG = {at: -0.04, dur: 0.32};
const CARRY = {in: [0.32, 0.58], show: 0.7, over: [0.7, 0.84], land: 0.92, away: [0.84, 0.96], grab: [0.98, 1.16], lift: [1.18, 0.14], out: [1.3, 0.52]} as const;
const HL = {in: [1.84, 2.14], touch: [2.52, 2.6], row1: [2.6, 2.8], hop: [2.8, 2.86], row2: [2.86, 2.98], lift: [2.98, 3.06], out: [3.06, 3.4]} as const;
/** P12: on "can't" (P12 t 0.64; lead 0.04) the paper slides on ~200 px (176: 2070 lands whole on the floor at the frame's bottom; accelerates, then settles). */
const P12_SLIDE = {at: 0.6, dur: 0.72, px: 176};
/** P12: the phone buzzes on "Google." (film 34.6). O1: between 2040 and 2050. */
const PHONE_AT = {o1: 4.52, p12: 1.5};
/** The shelf + garland are raised this far (px) from the style frame so P12's credit tab sits on bare wall. */
const SHELF_UP = DESK_SHELF_UP;

// ---------------------------------------------------------------- her hand, the badge, the box

/** The hand's axis (from the "tip" toward her fist) and the forearm's direction (toward her): the style frame's arm. */
const AXIS = 112;
const FOREARM = 121;
const U = dirDeg(AXIS);
const V = dirDeg(FOREARM);
/** Her fist sits BEHIND the card's upper middle (card-local units, x scale), her fingertips curl over its top edge. */
const FIST_LOCAL: Pt = [-20, -12];
const FIST_K = 131; // the kit HerArm's fist centre along U from its tip
const CARD_IN: Pt = [-330, 1250];
const CARD_MID: Pt = [540, 772];
const CARD_DROP: Pt = [170, 820];
/** The badge at rest IN the box (box-local = canvas at rest): standing in it, its lower two thirds behind the front
 *  wall (the rim is y 930), the clip and the peach band above it. */
const REST: {c: Pt; rot: number} = {c: [158, 954], rot: -5};
/** The fist on the box's front-right top corner (canvas px, box at rest). */
const GRIP: Pt = [300, 936];
/** Where the fist pulls away to as the badge falls (up and right of the box: the sleeve clears the landing). */
const AWAY: Pt = [404, 768];

type Card = {c: Pt; rot: number; s: number};
/** The carried card: centre, rotation, scale (1 = the style frame's 168 px; 1.4 = lifted toward the lens). */
const cardAt = (t: number): Card => {
  if (t < CARRY.in[1]) {
    const p = E.outCubic(prog(t, CARRY.in[0], CARRY.in[1] - CARRY.in[0]));
    const c = lerpPt(CARD_IN, CARD_MID, p);
    return {c: [c[0], c[1] - 60 * Math.sin(Math.PI * p)], rot: 4 + 24 * (1 - p), s: 1 + 0.4 * E.inOutSine(p)};
  }
  if (t < CARRY.over[0]) {
    const s = t - CARRY.in[1];
    return {c: [CARD_MID[0] + 6 * Math.exp(-s * 12) * Math.sin(s * 30), CARD_MID[1] - 3 * Math.sin(s * 9)], rot: 4 - 6 * Math.exp(-s * 9) * Math.sin(s * 24), s: 1.4};
  }
  const p = E.inOutSine(prog(t, CARRY.over[0], CARRY.over[1] - CARRY.over[0]));
  const c = lerpPt(CARD_MID, CARD_DROP, p);
  return {c: [c[0], c[1] - 30 * Math.sin(Math.PI * p)], rot: 4 - 12 * p, s: 1.4 - 0.4 * p};
};
const cardPt = (k: Card, q: Pt): Pt => applyM(mat.compose(mat.translate(k.c[0], k.c[1]), mat.rotate(k.rot), mat.scale(k.s)), q[0], q[1]);
/** HerArm's tip for a card held from behind (the fist behind its upper middle). */
const tipFor = (k: Card): Pt => add(cardPt(k, FIST_LOCAL), U, -FIST_K);

/** The badge once it is let go (box-local = canvas at rest until the box moves): the fall, the hop, the wobble. */
const boxCard = (t: number): Card | null => {
  if (t < CARRY.over[1]) return null;
  const rel = cardAt(CARRY.over[1]);
  if (t < CARRY.land) {
    const p = E.inQuad(prog(t, CARRY.over[1], CARRY.land - CARRY.over[1]));
    return {c: lerpPt(rel.c, REST.c, p), rot: lerp(rel.rot, REST.rot, p), s: 1};
  }
  const s = t - CARRY.land;
  const hop = s < 0.16 ? -12 * Math.sin((Math.PI * s) / 0.16) : 0;
  const wob = 5 * Math.exp(-s * 9) * Math.sin(s * 30);
  return {c: [REST.c[0], REST.c[1] + hop], rot: REST.rot + wob, s: 1};
};

/** The box's offset while she carries it out (a lift on the grip, then out to the left, accelerating). */
const boxOff = (t: number): Pt => [-760 * E.inQuad(prog(t, CARRY.out[0], CARRY.out[1])), -18 * E.outQuad(prog(t, CARRY.lift[0], CARRY.lift[1]))];

/** Her lanyard while she carries the badge: a loop hanging from behind the card's lower right, swinging with the
 *  card's motion (gravity frame: it hangs down whatever the card's tilt). */
const carriedLanyard = (t: number): string => {
  const k = cardAt(t);
  const k0 = cardAt(t - 0.05);
  const vx = (k.c[0] - k0.c[0]) / 0.05;
  const swing = Math.max(-34, Math.min(34, -vx * 0.03));
  const a = cardPt(k, [36, 50]);
  const rel: Pt[] = [
    [-24, -14],
    [-26, 26],
    [-8, 64],
    [22, 70],
    [34, 40],
    [22, -12],
  ];
  const r = (swing * Math.PI) / 180;
  const pts = rel.map(([x, y]): Pt => [a[0] + k.s * (x * Math.cos(r) - y * Math.sin(r)), a[1] + k.s * (x * Math.sin(r) + y * Math.cos(r))]);
  return smooth(pts, {closed: true});
};
/** While it falls: the loop trails above the card from its clip. */
const fallingLanyard = (k: Card): string => {
  const a = cardPt(k, [0, -54]);
  const rel: Pt[] = [
    [-10, 2],
    [-28, -36],
    [-12, -74],
    [18, -64],
    [22, -28],
    [10, 2],
  ];
  return smooth(rel.map(([x, y]): Pt => [a[0] + x, a[1] + y]), {closed: true});
};
/** In the box (box-local, the badge at REST): the loop from the clip up into the box and over the rim (behind the
 *  card: drawn before it) ... */
const BOX_LANYARD: Pt[] = [
  [152, 899],
  [142, 890],
  [156, 876],
  [200, 874],
  [234, 886],
  [250, 908],
  [254, 930],
  [224, 934],
  [216, 912],
  [190, 900],
  [162, 902],
];
/** ... and its drape over the front wall (drawn after the wall), sliding over the rim after the landing. */
const drapePath = (d: number) =>
  smooth([
    [254, 922],
    [260, 922 + 28 * d],
    [250, 922 + 56 * d],
    [232, 922 + 52 * d],
    [222, 922 + 24 * d],
    [224, 920],
  ]);


/** Her fingertips curling over the card's top edge (the hand is behind the card): card-local, scaled with it. */
const Fingertips: React.FC<{k: Card}> = ({k}) => (
  <XG m={mat.compose(mat.translate(k.c[0], k.c[1]), mat.rotate(k.rot), mat.scale(k.s))}>
    {[-58, -38, -18].map((x, i) => (
      <React.Fragment key={i}>
        <Fill d={roundRect(x, -66 + (i === 1 ? -3 : 0), 19, 25, 9)} color={CC.skin} offset={false} />
        <Ink d={roundRect(x, -66 + (i === 1 ? -3 : 0), 19, 25, 9, {seed: `o1/ftip${i}`})} width={W.mid / k.s} />
        <Fill d={roundRect(x + 4, -48 + (i === 1 ? -3 : 0), 11, 6, 3)} color={CC.nail} offset={false} />
      </React.Fragment>
    ))}
  </XG>
);

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
  if (t < CARRY.over[1]) return {tip: tipFor(cardAt(t)), holding: 'none'};
  if (t < CARRY.out[0] + CARRY.out[1]) {
    // let go, pull up and right (the sleeve clears the box as the badge lands), then take the box's corner
    const rel = tipFor(cardAt(CARRY.over[1]));
    const away = add(AWAY, U, -FIST_K);
    const grip = add(GRIP, U, -FIST_K);
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

/** The cat sits at the desk's front-right corner (right of the run-on with a clear gap, out of the right rail's
 *  buttons with its face, clear of the clause and the caption band) and watches. */
export const O1_CAT = {x: 925, y: DESK.front - 6, size: 240};

/** What it watches (canvas): the signature, the badge, the box going, the highlighter, the run-on's leading roll. */
const lookRaw = (t: number, cl: Clause): Pt => {
  if (t < CARRY.in[0] - 0.02) return pagePoint(O1_PAGE, 300, 440);
  if (t < CARRY.over[1]) return cardAt(t).c;
  const bc = boxCard(t);
  if (t < CARRY.out[0] && bc) return bc.c;
  if (t < HL.in[0]) return [Math.max(-260, REST.c[0] + boxOff(t)[0]), 880];
  if (t < 3.06) {
    const a = armAt(t, cl);
    return a ? a.tip : cl.Z1;
  }
  return runOnTip(o1RunOn(t));
};
/** The eye-line, smoothed over ~0.15 s (a head that turns, not a head that jumps) and lagging 0.06 s. */
const lookAt = (t: number, cl: Clause): Pt => {
  let x = 0;
  let y = 0;
  for (let k = 0; k < 6; k++) {
    const q = lookRaw(t - 0.06 - 0.025 * k, cl);
    x += q[0];
    y += q[1];
  }
  return [x / 6, y / 6];
};
/** Its pose for a look point: yaw to 3/4-profile toward the target, chin dip by the target's angle below, a forward
 *  lean when it looks down, the head moved a little toward the target. `bow` adds P12's bow over the edge. */
const catPose = (look: Pt, bow = 0, flick = 0): CatTurn => {
  const {x, y, size} = O1_CAT;
  const h0 = catTurnHead(x, y, size, {lean: 0, head: [0, 0]});
  const ldx = -(look[0] - h0[0]);
  const ldy = look[1] - h0[1];
  const l = Math.hypot(ldx, ldy) || 1;
  const yaw = 30 + 40 * Math.max(0, Math.min(1, ldx / 300));
  const ang = (Math.atan2(ldy, Math.max(40, Math.abs(ldx))) * 180) / Math.PI;
  const pitch = Math.max(-24, Math.min(40, ang * 0.62)) + 12 * bow;
  const lean = 0.14 * Math.max(0, Math.min(1, (pitch - 10) / 28)) + 0.06 * bow;
  return {
    yaw,
    pitch,
    lean,
    head: [3.5 * (ldx / l), 3 * (ldy / l) + Math.max(0, pitch) * 0.1],
    eye: [Math.max(0.3, ldx / l), ldy / l],
    flick,
  };
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
  const cam: Mat = p12 ? mat.I : o1Cam(t, O1_END);
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
  const inBox = boxCard(t);
  const land = t - CARRY.land;
  const jolt = land > 0 && land < 0.14 ? Math.sin((Math.PI * land) / 0.14) : 0;
  const knock = land > 0.02 ? 6 * Math.exp(-(land - 0.02) * 6) * Math.sin((land - 0.02) * 22) : 0;
  const off = boxOff(t);
  const boxGone = t >= CARRY.out[0] + CARRY.out[1];
  const landed = t >= CARRY.land;
  const drape = E.outCubic(prog(t, CARRY.land, 0.22));
  // the clause, the signature, the run-on
  const bands = bandsAt(t);
  const slideP = p12 ? prog(tScene, P12_SLIDE.at, P12_SLIDE.dur, E.inOutCubic) : 0;
  const slide = P12_SLIDE.px * slideP;
  const L = p12 ? O1_RUN_END : o1RunOn(t);
  const motion = p12
    ? {speed: 260 * Math.sin(Math.PI * slideP) + 60, kicks: [P12_SLIDE.at + 0.12, P12_SLIDE.at + 0.42]}
    : {speed: t > 3.4 ? o1RunSpeed(t) : 0, kicks: O1_KICKS};
  const arm = p12 ? null : armAt(t, cl);
  // the cat: O1 follows the action; P12 bows over the edge to the run-on on the floor, the tail flicks on "can't"
  const flick = p12 ? Math.max(0, Math.sin(Math.PI * prog(tScene, 0.62, 0.42))) : 0;
  const pose = p12 ? catPose([600 - 40 * slideP, 1880 + 30 * slideP], 1, flick) : catPose(lookAt(t, cl));
  return (
    <XG m={cam}>
      {built(
        <>
          <DeskBack />
          <WallDress />
          <XG m={mat.translate(0, -SHELF_UP)}>
            <FairyLights />
            <ShelfTendril />
          </XG>
          <TownLines />
          <UnderDesk />
          <UnderBox />
          <DeskBits />
          <Phone buzzAt={p12 ? PHONE_AT.p12 : PHONE_AT.o1} />
          {boxGone ? null : (
            <>
              <Box
                x={BOX.bl + off[0]}
                y={BOX.back + off[1]}
                badge={null}
                jolt={jolt}
                knock={knock}
                inside={
                  inBox ? (
                    <>
                      {landed ? <Lanyard d={smooth(BOX_LANYARD, {closed: true})} /> : <Lanyard d={fallingLanyard(inBox)} />}
                      <Badge x={inBox.c[0]} y={inBox.c[1]} w={168} rot={inBox.rot} seed="o1/badgeB" />
                    </>
                  ) : undefined
                }
                over={inBox && landed ? <Lanyard d={drapePath(drape)} /> : undefined}
                seed="o1/box"
              />
            </>
          )}
          <ContractPage {...O1_PAGE} bands={bands} sigAt={p12 ? undefined : SIG.at} sigDur={SIG.dur} runOn={0} seed="o1/page" />
        </>,
      )}
      <O1RunOn L={L} slide={slide} motion={motion} />
      {built(
        <>
          <DustMotes cx={DESK.pool.cx + 40} cy={DESK.pool.cy - 60} rx={DESK.pool.rx * 0.9} ry={DESK.pool.ry * 0.8} n={12} r={3.6} seed="o1/motes" />
          <Pen dx={-600} dy={30} />
          <DeskMug />
          <LampHead />
          <Cat x={O1_CAT.x} y={O1_CAT.y} size={O1_CAT.size} pose="sit" facing="l" turn={pose} seed="o1/cat" />
          <Moth />
        </>,
      )}
      {carried ? <Lanyard d={carriedLanyard(t)} width={12.5 * carried.s} /> : null}
      {arm ? <HerArm tip={arm.tip} holding={arm.holding} reach={1040} axis={AXIS} forearm={FOREARM} seed="o1/arm" /> : null}
      {carried ? (
        <>
          <Badge x={carried.c[0]} y={carried.c[1]} w={168 * carried.s} rot={carried.rot} seed="o1/badgeC" />
          <Fingertips k={carried} />
        </>
      ) : null}
    </XG>
  );
};
