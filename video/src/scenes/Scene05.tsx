// S05 "Found with AI" (storyboard v3, docs/storyboard_v3.md S05; cut(years) -> cut(was), 16.59-19.773 s on the take).
// VO: "before researchers using AI figured out how bad it was."
//
// The blueprint wall (shared BlueprintWall, the film's one gentle LOW ANGLE): the PHP master blueprint hangs as a tall
// banner from the cornice of a civic facade; two research teams pop up at the foot of the steps, backs to us, and a big
// back-view audience fills the bottom band (ref 2's framing layer). MATCH-CUT in: S04's dive into lock4 lands on the SAME
// lock drawn in ink on the blueprint (same screen spot and size), the L5 tag riding across as an annotation, the camera
// still creeping IN (1.08 -> 1.13, out(expo), 0.30 s; it rises 20 world px so the cornice clears the caption band), then
// locked. The landing hits the banner: it sways once on its rod. 'before': a z floats up from Pip (asleep on the banner's
// bottom rail, S04's leaf still on his ear); 'researchers': team A pops up, then team B (two depths); 'using': the facade
// calendar tears to its summer page (AUG), a pigeon hops; L5 pops off; 'AI': one tablet per team is raised high (1.4 x,
// on a stepped glow disc) with a big ink sparkle that twinkles on the highlight, then the scan beams (opaque white light
// under the plan's ink) shoot out of them and sweep the banner; 'figured': the beams converge on the lock, team A's
// back-row member points at it, two audience heads look up, and L6 pops as a clipped slip (the label follows the scan);
// 'out':
// ONE hand-circling ink ring strokes on round the lock (found) and the beams retract; 'how': it pulses, the teams lean in
// (torso + head); 'bad': ONE focal event: S02's dashed hooded hand (its hood point on the cuff) redraws over the lock and turns it, the bolt slides
// all the way back and the plan's door swings AJAR (a dark gap), Bit (posing as part of the drawing) gets an ink '!' and
// hops out onto the lock box; an audience head turns to its neighbour; 'it': Pip jolts awake, the leaf flicks off; 'was.':
// the messenger raises the envelope to his right shoulder, Bit leaps onto his collar and he breaks into a run out right,
// the camera trucking with him (0.30 s, MULTIPLANE: steps 1.0, banner / facade 0.67, wing 0.4, audience 1.12: the cut on
// action into S06); Pip leaps off the rail to follow.
//
// Camera: scene05/camera.ts (each set layer gets its own camera matrix in `wrap`). The sun is SCREEN space in its notch
// (930, 725) r110 (depth 0.05: it barely moves on the truck). Notes: docs/scenes/S05.md.

import React, {useId} from 'react';
import {World, useScene, useTime, skies, palette} from '../lib';
import {Ink} from '../lib/Ink';
import {Fill} from '../lib/Fill';
import {prog} from '../lib/time';
import {Sun} from '../lib/Sun';
import {Look} from '../lib/exit';
import {captionFontStack, useCaptionFont} from '../lib/font';
import {mat, XG} from '../lib/xf';
import {BlueprintWall, BLUEPRINT_WALL, LayerWrap} from './shared/sets';
import {Calendar, DiagramHand, LabelTag, yearPages} from './shared/props';
import {beats, S05_START, S05_END} from './scene05/beats';
import {camAt, camMat, layerCam, LAYER_F} from './scene05/camera';
import {Beams, BigZ, BitLeap, BitOnLock, LeafFall, LeafOnCrown, MessengerDash, PipHop, PipOnRail, stepGaps, Teams} from './scene05/cast';
import {CalloutKeyhole, CorniceSoffit, DoorSwing, FoundRing, handTurn, KNOB, LOCK_C, LockTurn, PlazaGround, SHEET_IN, SheetLock, SheetPanels, SheetTint, StepsOverlay} from './scene05/plan';
import {Audience, Pigeons} from './scene05/audience';
import {Flagpole} from './scene05/flag';

// ---------------------------------------------------------------- labels (final_script section 6)

const L5 = ['in the code since', 'at least 2012'];
/** Both lines centred (fix round 3: no padding spaces; fix round 4: no trailing interpunct on the 2-line layout, it
 *  dangled at the end of line 1 like a stray mark). */
const L6 = ['found with AI help', 'reported privately in August'];
const ZOOM = 1.13;
/** L5 continues S04's tag: where S04's dive leaves it on the cut (screen ~(426-749, 1004-1106) at zoom 1.9 around
 *  lock4), in S05 world at the 1.08 landing; hung from the lock's bottom-right corner. 36 world = 39-41 px on screen. */
const L5_BOX: [number, number, number, number] = [435.5, 1002, 735.5, 1110];
/** L6 clipped over the banner's top edge (fix round 3: the slip's top at the sheet's top edge, 679, and 126 tall, so the
 *  centred block sits low enough that the paper clip (LabelTag: at 24 % of the width, reaching 0.73 em below the top)
 *  ends > 6 px above the cap height of 'found'). Its foot (805) overlaps the door elevation's head line by 9. */
const L6_BOX: [number, number, number, number] = [205, 679, 650, 805];
/** The calendar, 1.2 x and nudged in from the frame edge (its summer page centre at screen ~105), right edge just short
 *  of the banner's frame (x 200). */
const CAL: [number, number, number, number] = [114, 748, 84, 108];

/** The banner's one sway on its rod: from rest, a damped sine (deg). */
const swayAngle = (t: number, at: number, amp = 1.1, period = 0.9, settle = 0.9) => {
  if (t < at || t > at + settle * 1.8) return 0;
  const dt = t - at;
  return amp * Math.exp((-dt * 4.6) / settle / 1.6) * Math.sin((2 * Math.PI * dt) / period);
};

/** Clip to the sheet's inner rect (world): the diagram hand is DRAWN ON the plan. */
const OnSheet: React.FC<{children: React.ReactNode}> = ({children}) => {
  const id = 'sh5' + useId().replace(/[^a-zA-Z0-9]/g, '');
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <rect x={SHEET_IN[0]} y={SHEET_IN[1]} width={SHEET_IN[2]} height={SHEET_IN[3]} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
    </>
  );
};

/** 'AUG' lettered on the calendar's summer page (pausers: L6's 'reported privately in August'), ink on peach, 21 world
 *  = 24 px on screen; it is on the page once the tear has cleared it. */
const AugMark: React.FC<{at: number}> = ({at}) => {
  const t = useTime();
  useCaptionFont();
  if (t < at) return null;
  return (
    <text x={CAL[0] + 7} y={CAL[1] + CAL[3] * 0.2 + 21} fontFamily={captionFontStack} fontSize={21} fill={palette.ink}>
      AUG
    </text>
  );
};

// ---------------------------------------------------------------- the scene

/** 'bad' (rule 5: the big read lands ON the word): the hand draws on from bad-0.10 in 0.15 s, the '!' is up by the word
 *  and Bit hops out ON it, the hand turns the knob from bad+0.10 (the bolt slides all the way back), the door swings
 *  ajar from bad+0.22. */
const HAND_AT = (b: {bad: number}) => b.bad - 0.1;
/** The pinch point and the forearm angle: -15 deg, so the teal sleeve enters the sheet's right edge below the L6 slip. */
const PINCH: [number, number] = [KNOB[0] + 3, KNOB[1] - 2];
const HAND_ANGLE = -15;
const HAND_SCALE = 0.85;
/** The drafting break across the sleeve (fix round 3: the OnSheet clip sliced the sleeve with a hard vertical at the
 *  sheet's frame): the sleeve ENDS inside the sheet at screen x ~760 (world 735 at rest, 249 along the forearm) in a
 *  dashed zig-zag break line, in the hand's own frame (it turns with it). */
const BREAK_D = (735 - PINCH[0]) / Math.cos((HAND_ANGLE * Math.PI) / 180);
/** Sleeve half-width there (DiagramHand SLEEVE: 32 at 98 -> 70 at 640 local units) + 7 world of overshoot. */
const BREAK_H = (32 + ((BREAK_D / HAND_SCALE - 98) / 542) * 38) * HAND_SCALE + 7;
const ArmBreak: React.FC<{drawAt: number; undrawAt: number; dur: number; children: React.ReactNode}> = ({drawAt, undrawAt, dur, children}) => {
  const t = useTime();
  const id = 'ab5' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const a = (HAND_ANGLE * Math.PI) / 180;
  const u: [number, number] = [Math.cos(a), Math.sin(a)];
  const n: [number, number] = [-u[1], u[0]];
  const P = (along: number, across: number) => `${(PINCH[0] + u[0] * along + n[0] * across).toFixed(1)} ${(PINCH[1] + u[1] * along + n[1] * across).toFixed(1)}`;
  const D = BREAK_D;
  const z = 7;
  const clip = `M${P(D, -900)}L${P(D, -9)}L${P(D - z, -3)}L${P(D + z, 3)}L${P(D, 9)}L${P(D, 900)}L${P(-900, 900)}L${P(-900, -900)}Z`;
  const brk = `M${P(D, -BREAK_H)}L${P(D, -9)}L${P(D - z, -3)}L${P(D + z, 3)}L${P(D, 9)}L${P(D, BREAK_H)}`;
  // the break shows with the sleeve's ink (DiagramHand: the sleeve's dashes draw over q 0.6 -> 1)
  let q = prog(t, drawAt, dur);
  if (t >= undrawAt) q = Math.min(q, 1 - prog(t, undrawAt, dur));
  return (
    <>
      <defs>
        <clipPath id={id} clipPathUnits="userSpaceOnUse">
          <path d={clip} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>{children}</g>
      {q >= 0.6 ? <Ink d={brk} width={2.4} dash="6 4.5" color={palette.ink} seed="s5brk" /> : null}
    </>
  );
};

/** S02's hood cue (Scene02.tsx 'the hood cue', the same path in DiagramHand's local units: fingertips at the origin, the
 *  forearm along +x): the Attempter's HOOD POINT, a small dashed tealDark peak standing on the cuff seam, so the sleeve
 *  reads as the SAME hooded hacker's hand from the takeover diagram (fix round 4). x 1.3 about its foot on the seam: this
 *  hand is drawn at 0.85 (S02's at 1.2), so the cue keeps ~30 px on screen. It shows with the cuff's dashes (q >= 0.6 of
 *  the draw-on) and goes with them, inside the ArmBreak group so it turns with the hand. */
const HOOD = 'M113 -33.5Q112 -46 125 -58Q139 -47 141 -35.2';
const HOOD_FILL = HOOD + 'L118 -34Z';
const HOOD_K = 1.3;
const HoodCue: React.FC<{drawAt: number; undrawAt: number; dur: number}> = ({drawAt, undrawAt, dur}) => {
  const t = useTime();
  let q = prog(t, drawAt, dur);
  if (t >= undrawAt) q = Math.min(q, 1 - prog(t, undrawAt, dur));
  if (q < 0.6) return null;
  const iw = 1 / (HAND_SCALE * HOOD_K);
  const m = mat.compose(mat.translate(PINCH[0], PINCH[1]), mat.rotate(HAND_ANGLE), mat.scale(HAND_SCALE), mat.about(mat.scale(HOOD_K), 127, -34));
  return (
    <XG m={m}>
      <Fill d={HOOD_FILL} color={palette.tealDark} offset={[1.2, 0.8]} mode="none" seed="s5hoodF" />
      <Ink d={HOOD} width={3.0 * 0.8 * iw} dash={`${(5 * iw).toFixed(2)} ${(3.6 * iw).toFixed(2)}`} taper={false} vary={0} seed="s5hood" />
    </XG>
  );
};

const Scene05: React.FC = () => {
  const t = useTime();
  const scene = useScene();
  const start = scene?.start ?? S05_START;
  const b = beats(start, scene?.end ?? S05_END);
  const cam = camAt(t, b.end);

  // the landing hits the banner: it sways once on its rod from the cut (a small damped pendulum about the rod's centre)
  const sway = swayAngle(t, b.sway);
  const swayM = mat.about(mat.rotate(sway), BLUEPRINT_WALL.lock.x, BLUEPRINT_WALL.rodY);

  // the sun: SCREEN space in its notch (930, 725) r110, a 10 px/s idle drift right (ENGINE 6), depth 0.05 on the truck
  const sunX = 930 - (cam.x - 540) * cam.zoom * 0.05;
  const sun = <Sun cx={sunX} cy={725} r={110} drift={[10, 0]} />;

  const calendar = (
    <>
      <Calendar x={CAL[0]} y={CAL[1]} w={CAL[2]} h={CAL[3]} pages={[...yearPages(1), {kind: 'summer'}]} tearAt={[b.calendar]} tearDur={0.12} seed="s5cal" />
      <AugMark at={b.calendar + 0.12} />
    </>
  );

  const turn = handTurn(t, b.turn);

  const inner = (name: string, node: React.ReactNode): React.ReactNode => {
    if (name === 'banner')
      return (
        <XG m={swayM}>
          {node}
          {/* the paper tone, the scan beams' light, the cream accents, then the set's ink again on top */}
          <SheetTint />
          <SheetPanels />
          <Beams b={b} />
          <Look fills="none">{node}</Look>
          {/* 'bad': the right leaf swings ajar behind the callout */}
          <DoorSwing at={b.door} />
          <SheetLock />
          <CalloutKeyhole />
          {/* L5 rides across the match-cut as the lock's annotation tag; pops off on 'using' */}
          <LabelTag kind="tag" box={L5_BOX} hang={[LOCK_C[0] + 24, LOCK_C[1] + 36]} text={L5} fontSize={36} outAt={b.l5Out} seed="s5L5" />
          <LockTurn drawAt={HAND_AT(b)} turnAt={b.turn} undrawAt={b.envelope} />
          <FoundRing x={LOCK_C[0]} y={LOCK_C[1]} r={92} at={b.ring} pulseAt={b.how} width={4.8} />
          <OnSheet>
            <XG m={mat.about(mat.rotate(turn), PINCH[0], PINCH[1])}>
              <ArmBreak drawAt={HAND_AT(b)} undrawAt={b.envelope} dur={0.15}>
                <DiagramHand x={PINCH[0]} y={PINCH[1]} angle={HAND_ANGLE} scale={HAND_SCALE} drawAt={HAND_AT(b)} drawDur={0.15} undrawAt={b.envelope} ink={3.0} handFill={palette.white} seed="s5hand" />
                <HoodCue drawAt={HAND_AT(b)} undrawAt={b.envelope} dur={0.15} />
              </ArmBreak>
            </XG>
          </OnSheet>
          {/* Bit over the hand (he is the one being caught), his '!' balloon over everything on the sheet */}
          <BitOnLock inAt={b.bitIn} alertAt={b.bad} balloonAt={b.balloon} leapAt={b.bitLeap} />
          {/* L6: the clipped slip on the banner's clean top edge (fix round 4: pops right after the beams converge on the
              lock, before the ring: the label follows the scan) */}
          <LabelTag kind="slip" box={L6_BOX} text={L6} fontSize={38 / ZOOM} at={b.l6} seed="s5L6" />
          <PipOnRail b={b} />
          <LeafOnCrown b={b} />
          <BigZ at={b.zzz} />
        </XG>
      );
    if (name === 'steps')
      return (
        <>
          {node}
          <StepsOverlay gaps={stepGaps(b)} />
          <PlazaGround />
          <Teams b={b} />
          <MessengerDash b={b} />
          <Pigeons b={b} />
          <LeafFall b={b} />
          <PipHop b={b} />
          <BitLeap b={b} leapAt={b.bitLeap} />
        </>
      );
    if (name === 'facade')
      return (
        <>
          {node}
          <CorniceSoffit />
        </>
      );
    if (name === 'wing')
      return (
        <>
          <Flagpole snaps={[b.teamA, b.calendar]} slack={[b.balloon, b.door + 0.2]} />
          {node}
        </>
      );
    return node;
  };

  // MULTIPLANE: every layer gets its own camera (zoom shared, x by parallax factor); the sun stays in screen space
  const wrap: LayerWrap = (name, _n, node) => {
    if (name === 'sun') return node;
    const f = LAYER_F[name] ?? 1;
    return <XG m={camMat(layerCam(cam, f))}>{inner(name, node)}</XG>;
  };

  return (
    <World sky={[{t: 0, tod: 'day', color: skies.day}]}>
      <BlueprintWall sun={sun} calendar={calendar} foreground={<Audience b={b} />} wrap={wrap} seed="bpw" />
    </World>
  );
};

export default Scene05;
