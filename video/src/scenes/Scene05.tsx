// S05 "Found with AI" (storyboard v3, docs/storyboard_v3.md S05; cut(years) -> cut(was), 16.59-19.773 s on the take).
// VO: "before researchers using AI figured out how bad it was."
//
// The blueprint wall (shared BlueprintWall, the film's one gentle LOW ANGLE): the PHP master blueprint hangs as a tall
// banner from the cornice of a civic facade; two research teams rise at the foot of the steps, backs to us. MATCH-CUT in:
// S04's dive into lock4 lands on the SAME lock drawn in ink on the blueprint (same screen spot and size), the L5 tag
// riding across as an annotation, the camera still creeping IN (1.08 -> 1.13, out(expo), 0.30 s), then locked.
// 'before': a z floats up from Pip (asleep on the banner's bottom rail) and the banner sways once; 'researchers': team A
// rises, then team B; 'using': the facade calendar tears to its summer page (August); L5 pops off; 'AI': one sparkle
// tablet per team is raised, the scan beams shoot out and sweep the banner, L6 pops as a clipped slip; 'figured': the
// beams converge on the lock; 'out': the ink target ring strokes on (found); 'how': it pulses, the teams lean in; 'bad':
// ONE focal event: S02's dashed hooded hand redraws over the lock and turns it, Bit (posing as part of the drawing) gets
// an ink '!'; 'it': Pip jolts awake; 'was.': the messenger pulls the envelope and dashes out right, the camera trucks
// with him (0.30 s, ~890 screen px/s: the cut on action into S06), Pip hops off the rail to follow.
//
// Camera: scene05/camera.ts. The sun is SCREEN space in its notch (930, 725) r110 (depth 0.05: it barely moves on the
// truck). Notes: docs/scenes/S05.md.

import React, {useId} from 'react';
import {World, useScene, useTime, skies, palette} from '../lib';
import {Sun} from '../lib/Sun';
import {mat, XG} from '../lib/xf';
import {BlueprintWall, BLUEPRINT_WALL, LayerWrap} from './shared/sets';
import {Calendar, DiagramHand, LabelTag, MarkRing, yearPages} from './shared/props';
import {beats, S05_START, S05_END} from './scene05/beats';
import {camAt, camMat} from './scene05/camera';
import {Beams, BigZ, BitOnLock, KNOB, LockTurn, MessengerDash, PipS05, Teams, LOCK_C} from './scene05/cast';

// ---------------------------------------------------------------- labels (final_script section 6)

const L5 = ['in the code since', 'at least 2012'];
const L6 = ['found with AI help ·', 'reported privately in August'];
const ZOOM = 1.13;
/** L5 continues S04's tag: where S04's dive leaves it on the cut (screen ~(426-749, 1004-1106) at zoom 1.9 around
 *  lock4), in S05 world at the 1.08 landing; hung from the lock's bottom-right corner. 36 world = 39-41 px on screen. */
const L5_BOX: [number, number, number, number] = [434, 998, 734, 1106];
/** L6 on the banner's clean top margin (storyboard (205-650, 688-760), 24 px taller so two 38 px lines fit). */
const L6_BOX: [number, number, number, number] = [205, 688, 650, 784];

/** The banner's one sway on its rod: from rest, a damped sine (deg). */
const swayAngle = (t: number, at: number, amp = 1.1, period = 0.9, settle = 0.9) => {
  if (t < at || t > at + settle * 1.8) return 0;
  const dt = t - at;
  return amp * Math.exp((-dt * 4.6) / settle / 1.6) * Math.sin((2 * Math.PI * dt) / period);
};

// the sheet's inner rect (inside the teal frame): the diagram hand is DRAWN ON the plan, so it is clipped to it
const [SX, SY, SW, SH] = BLUEPRINT_WALL.sheet;
const SHEET_IN: [number, number, number, number] = [SX + 12, SY + 12, SW - 24, SH - 24];

/** Clip to the sheet's inner rect (world). */
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

// ---------------------------------------------------------------- the scene

/** The hand turns the thumb-turn once it is drawn (the fingers are on by +0.13 s). */
const TURN_AT = (b: {bad: number}) => b.bad + 0.2;

const Scene05: React.FC = () => {
  const t = useTime();
  const scene = useScene();
  const start = scene?.start ?? S05_START;
  const end = (scene?.end ?? S05_END) - start;
  const b = beats(start);
  const cam = camAt(t, end);
  const M = camMat(cam);

  // the banner sways once on its rod on 'before' (a small damped pendulum about the rod's centre)
  const sway = swayAngle(t, b.zzz);
  const swayM = mat.about(mat.rotate(sway), BLUEPRINT_WALL.lock.x, BLUEPRINT_WALL.rodY);

  // the sun: SCREEN space in its notch (930, 725) r110, a slow 6 px/s idle drift (never perfectly still, ENGINE 9);
  // depth 0.05 on the exit truck
  const sunX = 930 - (cam.x - 540) * cam.zoom * 0.05;
  const sun = (
    <XG m={mat.inv(M)}>
      <Sun cx={sunX} cy={725} r={110} drift={[6, 0]} />
    </XG>
  );

  const calendar = (
    <Calendar x={BLUEPRINT_WALL.calendar[0]} y={BLUEPRINT_WALL.calendar[1]} w={BLUEPRINT_WALL.calendar[2]} h={BLUEPRINT_WALL.calendar[3]} pages={[...yearPages(1), {kind: 'summer'}]} tearAt={[b.calendar]} tearDur={0.12} seed="s5cal" />
  );

  const wrap: LayerWrap = (name, _n, node) => {
    if (name === 'banner')
      return (
        <XG m={swayM}>
          {node}
          {/* L5 rides across the match-cut as the lock's annotation tag; pops off on 'using' */}
          <LabelTag kind="tag" box={L5_BOX} hang={[LOCK_C[0] + 24, LOCK_C[1] + 36]} text={L5} fontSize={36} outAt={b.l5Out} seed="s5L5" />
          <LockTurn drawAt={b.bad} turnAt={TURN_AT(b)} undrawAt={b.envelope} />
          <MarkRing x={LOCK_C[0]} y={LOCK_C[1]} r={55} at={b.ring} pingAt={b.how} width={4.8} seed="s5ring" />
          <OnSheet>
            <DiagramHand x={KNOB[0] + 3} y={KNOB[1] - 2} angle={-40} scale={0.85} drawAt={b.bad} drawDur={0.22} turnAt={TURN_AT(b)} turnDeg={20} undrawAt={b.envelope} ink={3.0} handFill={palette.white} seed="s5hand" />
          </OnSheet>
          {/* Bit over the hand (he is the one being caught), his '!' balloon over everything on the sheet */}
          <BitOnLock b={b} alertAt={b.bad + 0.07} />
          {/* L6: the clipped slip on the banner's clean top margin */}
          <LabelTag kind="slip" box={L6_BOX} text={L6} fontSize={38 / ZOOM} at={b.l6} seed="s5L6" />
          <BigZ at={b.zzz} />
        </XG>
      );
    if (name === 'steps')
      return (
        <>
          {node}
          <Beams b={b} />
          <Teams b={b} />
          <MessengerDash b={b} />
          <PipS05 b={b} sway={sway} />
        </>
      );
    return node;
  };

  return (
    <World sky={[{t: 0, tod: 'day', color: skies.day}]}>
      <XG m={M}>
        <BlueprintWall sun={sun} calendar={calendar} wrap={wrap} seed="bpw" />
      </XG>
    </World>
  );
};

export default Scene05;
