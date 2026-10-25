// S09 Part A (Stoop Street, StoopStreet set world = canvas px at S03's rest): A1 the dusk -> dawn wide, A2 the door #4
// close. Everything here is in the StoopStreet world; Scene09 applies the camera.
//
// Staging (world): the crate of new locks (props LockCrate, size 85) on step 2's LEFT end (232, 1226); Pip leaps in from
// off-frame left onto the facade ledge beside it (125, 1230), scale 1.1; the old lock on door #4 (330, 1130) with Bit
// sitting on it; the makers' cart parked right of the stoop (760, 1432) with the shared FixSign in its sign slot; a
// back-view onlooker cropped by the bottom-left edge (A1 only); at the hard cut the keeper rises on step 1's right end
// (420, 1300) and reaches left to the lock. The lock axis (x 313-347) stays clear for the drop and the pop-on.
// The A2 actors (old lock, Bit, crate, keeper, Pip, the flying new lock) are <A2Actors/>: Part B renders the SAME
// component through the hidden-cut map (camera.ts a2ToBMat), so the hidden cut holds them in place.
//
// Light (fix round 1): the dawn is a STEPPED flat tween (Scene09 SKY: two colour snaps + the 'dawn' key, 0.12 s apart:
// no wipe edge crosses the captions); the set's night dressing pops off on the second step (nightUntil) and the ground
// relights in two more flat steps behind the sky (GROUND_A / GROUND_B), never in one big flash. The sun rises in front of
// the far towers with ONE near tower re-drawn in front of it from the first frame of the rise (its depth never changes);
// the near tree, the far towers' dawn rims (kit v3b `dawnRims={[0, 1, 4]}`: the hero's own rim only) and the walker are kept
// off the sun's column.

import React, {useId} from 'react';
import {Fill, Ink, Sun, Bird, Tod, palette, useTime, ease as E, prog, lerp, clamp, mat, XG, rectPath, line, springAt, springs, wirePoint, smooth, arc, polyPath, measureCaption} from '../../lib';
import {mix} from '../../lib/cine/util';
import {Elephant, hop, popSwitch, PoseName, Expression} from '../../lib/mascot';
import {StoopStreet, STOOP, paneFill, windowInk, SI, HALF, Foreground, LayerWrap} from '../shared/sets';
import {OnlookerSlot} from '../shared/sets/propSlots';
import type {WalkerAnchor} from '../shared/sets';
import {Bit, CheckBoxTag, EdgeOnlooker, Keeper, Lock, MakersCart, NewLockIcon, FixSign} from '../shared/props';
import {B} from './beats';
import {ClipOut, WIRE_HOLE} from './matchcut';
import {crateGeom, CrateBack, CrateFront, CrateLocks, InkRing} from './crate';
import {KeeperDetail, keeperCarryHand} from './keeper';
import type {KeeperSpec} from './keeper';

// ---------------------------------------------------------------- anchors (Part A world)

export const PA = {
  pip: {x: 125, y: 1230, scale: 1.1},
  /** Polish A1 (S08 -> S09 match cut, Pip is in its persist list): he starts EXACTLY where S08's last frame leaves him,
   *  sitting front-on, worried, at S08's size (screen (392, 1480), ~75 px = world (412, 1540) at the A1 camera, scale
   *  0.75), on the near pavement; on 'But' he hops back up onto the facade ledge, growing 0.75 -> 1.1 in the air. */
  pipStart: {x: 412, y: 1540, scale: 0.75},
  /** Polish A1: the scene's crate (crate.tsx), 1.4x the old 85 px kit crate: left end at 192 (as before, clear of Pip's
   *  ear), right end at 310 (clear of the old lock's drop column x 313-347). */
  crate: {x: 251, y: 1226, size: 118},
  lock: {x: STOOP.lock4.x, y: STOOP.lock4.y, size: STOOP.lock4.h},
  dropDist: 76,
  /** Bit sits on the old lock (lock-local units: 42 px lock = 100 units), body length 16 world: 16 px in A1, 24 px in A2
   *  (his eye gets its pupil from 24 px). */
  bitSize: 16,
  bitFrame: [349, 1080] as [number, number],
  keeper: {x: 398, y: 1300, h: 186},
  /** Keeper walks (Part B) to door #5: A2 coords of B-world (652, 1507). */
  keeperTo: [778, 1300] as [number, number],
  cart: {x: 760, y: 1432, size: 150},
  /** J5 sign (shared FixSign) in the cart's sign slot: hook = the top of a 154 px post. Polish A1 (reviewer: 'fixed!' was
   *  ~30 px at phone size, the beat's only other carrier): fs 36 -> 44 (1.22x: 'fixed!' lettering 49 px, glyphs ~37 px),
   *  the card's proportions kept (w = 6.22 fs, FixSign's own rows and line breaks), the post 22 px taller so the bigger
   *  card's bottom stays clear of the cart's crates. */
  sign: {w: 274, fs: 44, post: 154},
  /** Where Pip's hold-pose trunk tip carries the new lock (world, measured on the render). */
  trunkTip: [166, 1128] as [number, number],
};

/** The old lock lets go one frame into A2 (the first A2 frame shows it still on the door) and LANDS 0.19 s later
 *  (Lock's own gravity 4200 px/s^2) at film 36.30: the lock_click clunk belongs on the landing (sound-lane note). */
export const DROP_FALL = Math.sqrt((2 * PA.dropDist) / 4200);
export const DROP_AT = B.cutA2 + 0.03;
export const LAND_T = DROP_AT + DROP_FALL;
/** The toss: Pip flings the new lock from his trunk to door #4 (lands = the pop-on). */
export const TOSS = {at: B.still - 0.1, land: B.lockOn};

/** The set's night dressing (stars, lamp glows, lit windows, night ground) pops off on the dawn's second sky step. */
export const NIGHT_UNTIL = B.dawn + 0.12;
/** The ground relights behind the sky in two flat steps (A: haze, B: half a step under day) and STOPS there: the lower
 *  frame keeps its tone (no bleached mintPale band) until S10's tram brings the day relight. */
const GROUND_B_AT = B.dawn + 0.24;

// ---------------------------------------------------------------- the old lock + Bit, the flying new lock

const OldLock: React.FC = () => {
  const t = useTime();
  const s = PA.lock.size / 100; // world px per lock unit
  const riding = t < LAND_T + 0.04;
  return (
    <Lock
      x={PA.lock.x}
      y={PA.lock.y}
      size={PA.lock.size}
      ink={SI.far}
      seed="stoop/lock4"
      dropAt={DROP_AT}
      dropDist={PA.dropDist}
      rider={riding ? <Bit x={-6} y={-50} size={PA.bitSize / s} state="ride" look="down" hopAt={B.even - 0.06} hopH={0.7} seed="s9bit" /> : undefined}
    />
  );
};

/** Bit leaves door #4's jamb (Part B, after the hidden cut) with a leap onto Pip's head: PartB's BitRide carries him
 *  from here (screen space) to the snail, so there is only ever ONE Bit. */
export const BIT_LEAP = B.to - 0.14;

/** Bit after the landing: hops off the fallen lock and scuttles up door #4's right frame (the hidden-cut match). */
const BitRun: React.FC = () => {
  const t = useTime();
  if (t < LAND_T + 0.04 || t >= BIT_LEAP) return null;
  const top = PA.lock.y + PA.dropDist - PA.lock.size / 2; // fallen lock top
  const path: [number, number][] = [
    [PA.lock.x - 2, top],
    [PA.bitFrame[0], top + 8],
    [PA.bitFrame[0], PA.bitFrame[1]],
  ];
  return <Bit crawl={{at: LAND_T + 0.06, path, speed: 430}} state="scuttle" size={PA.bitSize} seed="s9bit" look="forward" />;
};

/** Bit's leap (Part B, after the hidden cut, drawn through the map like every A2 actor): off door #4's jamb in one
 *  big arc onto Pip's head, where he rides; from Pip's 'install' hop on PartB's BitRide carries him (screen space). */
export const BIT_LEAP_DUR = 0.24;
const BitOnPip: React.FC = () => {
  const t = useTime();
  if (t < BIT_LEAP || t >= B.install) return null;
  const head = pipRidePoint(pipA(t), PA.pip.scale);
  const q = (t - BIT_LEAP) / BIT_LEAP_DUR;
  if (q < 1) {
    const [x0, y0] = PA.bitFrame;
    const x = lerp(x0, head[0], q);
    const y = lerp(y0, head[1], q) - Math.sin(Math.PI * q) * 90;
    return <Bit x={x} y={y} size={PA.bitSize} state="hop" flip rot={-50 * (1 - q) + 30 * q} look="forward" seed="s9bit" />;
  }
  return <Bit x={head[0]} y={head[1]} size={PA.bitSize} state="ride" hopAt={BIT_LEAP + BIT_LEAP_DUR - 0.3} hopH={0} seed="s9bit" />;
};

/** Polish A1 ('new vs old' must read at phone size): the new lock's cream check tag at 2x the kit's (hung from the same
 *  loop, over the kit's own tag), its tick stroking on with the lock's check. Lock-local loop point (props LOCK.loop). */
const NewTag: React.FC<{x: number; y: number; size: number}> = ({x, y, size}) => {
  const u = size / 100;
  // hung on a short string from the lock's loop, out beside the box (the lock's face stays clear)
  return (
    <>
      <Ink d={`M${(x + 36 * u).toFixed(1)} ${(y - 50 * u).toFixed(1)}L${(x + 64 * u).toFixed(1)} ${(y - 38 * u).toFixed(1)}`} width={SI.far * 0.8} taper={false} vary={0} seed="s9newtag/str" />
      <CheckBoxTag x={x + 64 * u} y={y - 38 * u} size={64 * u} tickAt={B.check} ink={SI.far} seed="s9newtag" />
    </>
  );
};

/** The new lock in the air: flung from Pip's trunk on an arc, landing ON the door as the pop-on. */
const FlyingLock: React.FC = () => {
  const t = useTime();
  if (t < TOSS.at || t >= TOSS.land) return null;
  const q = (t - TOSS.at) / (TOSS.land - TOSS.at);
  const [x0, y0] = PA.trunkTip;
  const x = lerp(x0, PA.lock.x, q);
  const y = lerp(y0, PA.lock.y, q) - Math.sin(Math.PI * q) * 70;
  const size = PA.lock.size * (0.9 + 0.1 * q);
  const rot = -25 + 25 * q + Math.sin(q * Math.PI) * -40;
  return (
    <>
      <Lock x={x} y={y} size={size} state="fixed" ink={SI.far} rot={rot} checkAt={B.check} seed="s9newlock" />
      <XG m={mat.about(mat.rotate(rot), x, y)}>
        <NewTag x={x} y={y} size={size} />
      </XG>
    </>
  );
};

/** The new lock ON the door: it lands from the toss with a squash and the 7 % spring (never from zero: the flying lock
 *  hands over at full size), then its check strokes on. */
const landedXf = (t: number) => {
  const k = 0.84 + 0.16 * springAt(t, TOSS.land, springs.pop);
  const sq = t < TOSS.land + 0.07 ? 1.08 : 1;
  return mat.about(mat.scale(k * sq, k / sq), PA.lock.x, PA.lock.y);
};
const LandedLock: React.FC = () => {
  const t = useTime();
  if (t < TOSS.land) return null;
  return (
    <XG m={landedXf(t)}>
      <Lock x={PA.lock.x} y={PA.lock.y} size={PA.lock.size} state="fixed" ink={SI.far} checkAt={B.check} seed="s9newlock" />
    </XG>
  );
};
/** The landed lock's big tag, drawn AFTER the keeper (his gripping hand is behind it: it must stay readable). */
const LandedTag: React.FC = () => {
  const t = useTime();
  if (t < TOSS.land) return null;
  return (
    <XG m={landedXf(t)}>
      <NewTag x={PA.lock.x} y={PA.lock.y} size={PA.lock.size} />
    </XG>
  );
};

// ---------------------------------------------------------------- the crate of new locks (polish A1: crate.tsx)

/** The crate (crate.tsx): a slatted sage crate, 1.4x the old kit crate, its left end where the old one's was (clear of
 *  Pip's ear), its right end clear of the old lock's drop column (x 313-347). */
const CRATE_G = crateGeom(PA.crate.x, PA.crate.y, PA.crate.size);
const CRATE_TOP = CRATE_G.y - CRATE_G.h;
export const LID_AT = B.fix - 0.08;
/** ONE new lock stands up above the rim at the crate's left end (the one Pip lifts on 'somebody': gone at B.lift), so
 *  'a crate of new locks' reads at phone size; it bobs up into place with the lid. Lock size = door #4's lock (42). */
const RAISED = {x: PA.crate.x - PA.crate.size * 0.3, y: CRATE_TOP - 16, size: PA.lock.size, rot: -9};
/** Three EMPTY check tags (30 px) on sticks from the rim, hung over the open lid's peach face, right of the raised
 *  lock: [x, hang y, lean]. */
const CRATE_TAGS: [number, number, number][] = [
  [PA.crate.x - 14, CRATE_TOP - 62, -4],
  [PA.crate.x + 15, CRATE_TOP - 74, 2],
  [PA.crate.x + 42, CRATE_TOP - 56, 5],
];
const CRATE_TAG_SIZE = 30;

const CrateExtras: React.FC = () => {
  const t = useTime();
  const uid = 's9cr' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const out: React.ReactNode[] = [];
  // the three tags: sticks from the rim, the cards springing up 0.04 s apart (settled on 'out'), behind the locks
  const tagsAt = B.out - 0.14;
  CRATE_TAGS.forEach(([hx0, hy, lean], i) => {
    const at = tagsAt + i * 0.04;
    if (t < at) return;
    const k = springAt(t, at, springs.pop);
    const by = CRATE_TOP + 2;
    const hx = hx0 + lean * k;
    const hyw = by + (hy - by) * k;
    out.push(
      <React.Fragment key={i}>
        <Ink d={`M${hx0.toFixed(1)} ${by.toFixed(1)}L${hx.toFixed(1)} ${(hyw + 3).toFixed(1)}`} width={SI.far} taper={false} vary={0} seed={`s9crate/ts${i}`} />
        <CheckBoxTag x={hx} y={hyw} size={CRATE_TAG_SIZE} at={at} ink={SI.far} seed={`s9crate/tg${i}`} />
      </React.Fragment>,
    );
  });
  // the raised lock: rises out of the crate (clipped at the rim) 0.06 s after the lid flips
  if (t >= LID_AT + 0.06 && t < B.lift) {
    const k = springAt(t, LID_AT + 0.06, springs.pop);
    const x = RAISED.x;
    const y = RAISED.y + (1 - k) * 40;
    out.push(
      <React.Fragment key="raised">
        <defs>
          <clipPath id={uid} clipPathUnits="userSpaceOnUse">
            <rect x={x - 80} y={CRATE_TOP + 3 - 200} width={160} height={200} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${uid})`}>
          <Lock x={x} y={y} size={RAISED.size} state="fixed" ink={SI.far} rot={RAISED.rot} seed="s9crate/raised" />
        </g>
      </React.Fragment>,
    );
  }
  return <>{out}</>;
};

/** The whole crate in draw order: the open lid's peach face, the tags, the raised lock, the two locks in the opening, the
 *  sage body (+ the shut lid until LID_AT), then ONE ink ring pulse on the lid pop. */
const Crate: React.FC = () => (
  <>
    <CrateBack g={CRATE_G} lidAt={LID_AT} ink={SI.far} seed="s9crate" />
    <CrateExtras />
    <CrateLocks g={CRATE_G} lidAt={LID_AT} ink={SI.far} seed="s9crate" />
    <CrateFront g={CRATE_G} lidAt={LID_AT} ink={SI.far} seed="s9crate" />
    <InkRing x={PA.crate.x} y={CRATE_TOP - 18} r={72} at={LID_AT} w={SI.mid} />
  </>
);

// ---------------------------------------------------------------- Pip (Part A world)

export type PipState = {x: number; y: number; pose: PoseName; squash: number; rotate: number; amount?: number; look?: number; expression?: Expression; prop?: React.ReactNode; walkRate?: number; flip?: boolean; scale?: number};

/** Pip in Part A world coordinates at scene time t (also used, mapped, at the start of Part B). */
export function pipA(t: number): PipState {
  // polish A1: from S08's last spot (sitting, worried, scale 0.75): a short crouch, take off 0.10 s before 'But' (in the
  // air ON the word), a hop back-left and up onto the ledge, the scale easing 0.75 -> 1.1 in the air
  const hopT0 = B.but - 0.1;
  const air = 0.42;
  if (t < hopT0) {
    const c = clamp((t - (hopT0 - 0.1)) / 0.1);
    return {x: PA.pipStart.x, y: PA.pipStart.y, scale: PA.pipStart.scale, pose: 'sit-front', squash: 0.16 * Math.sin((c * Math.PI) / 2), rotate: 0, look: -0.2, expression: 'worried'};
  }
  if (t < hopT0 + air + 0.32) {
    const h = hop({t, t0: hopT0, dur: air, from: PA.pipStart, to: {x: PA.pip.x, y: PA.pip.y}, height: 70});
    const pose: PoseName = h.k < 1 ? 'stand-side' : 'sit-front';
    const scale = lerp(PA.pipStart.scale, PA.pip.scale, E.inOutSine(clamp((t - hopT0) / air)));
    return {x: h.x, y: h.y, scale, pose, squash: h.squash, rotate: h.rotate, amount: h.spread, look: 0.3, flip: h.k < 1};
  }
  // settled on the ledge: stretch at dawn ('the'), look at the crate on 'fix', lift a new lock, toss it on 'STILL'
  let squash = 0;
  // the stretch: a long squash-and-stretch shake on 'the'
  if (t >= B.the && t < B.the + 0.5) {
    const d = t - B.the;
    squash += -0.16 * Math.sin((d / 0.5) * Math.PI) * Math.cos(d * 26) - 0.05 * Math.sin((d / 0.5) * Math.PI);
  }
  let pose: PoseName = 'sit-front';
  let look = 0.25;
  let expression: Expression | undefined;
  let prop: React.ReactNode;
  if (t >= B.fix) {
    look = 0.85;
    expression = 'happy';
  }
  if (t >= B.cutA2) {
    look = 0.7;
    expression = 'neutral';
  }
  if (t >= B.lift && t < TOSS.at) {
    pose = 'hold';
    expression = 'happy';
    prop = <NewLockIcon size={(PA.lock.size * 0.9) / PA.pip.scale} grip="bottom" checkAt={B.check} seed="s9newlock" />;
  }
  if (t >= TOSS.at) {
    pose = 'trunk-up';
    expression = 'happy';
  }
  squash += popSwitch(t, B.lift) + popSwitch(t, TOSS.at);
  // Part B: the crouch before his 'install' hop off the map (PartB PipB takes him over at B.install)
  if (t >= B.install - 0.14) squash += 0.18 * Math.sin(Math.min(1, (t - (B.install - 0.14)) / 0.14) * (Math.PI / 2));
  return {x: PA.pip.x, y: PA.pip.y, pose, squash, rotate: 0, look, expression, prop};
}

/** Where a rider (Bit) sits on Pip at state `st` and `scale`, in Pip's parent coordinates: on top of his left ear in the
 *  sitting / trunk-up poses, on his back in the side poses (Pip-local units, through the Elephant's own transform:
 *  translate, rotate, scale(flip x scale), squash). */
export function pipRidePoint(st: PipState, scale: number): [number, number] {
  const side = st.pose === 'stand-side' || st.pose === 'walk-side';
  // sitting / trunk-up: on top of his left ear (the head top is under the raised trunk's curl); side poses: his back
  const lx0 = side ? -12 : -34;
  const ly0 = side ? -62 : -84;
  const lx = lx0 * (st.flip ? -1 : 1) * scale * (1 + st.squash * 0.55);
  const ly = ly0 * scale * (1 - st.squash);
  const a = (st.rotate * Math.PI) / 180;
  return [st.x + lx * Math.cos(a) - ly * Math.sin(a), st.y + lx * Math.sin(a) + ly * Math.cos(a)];
}

export const PipFigure: React.FC<{st: PipState; scale: number; t: number}> = ({st, scale, t}) => (
  <Elephant x={st.x} y={st.y} scale={st.scale ?? scale} pose={st.pose} t={t} seed={9} squash={st.squash} rotate={st.rotate} amount={st.amount} look={st.look} expression={st.expression} prop={st.prop} walkRate={st.walkRate} flip={st.flip} />
);

// ---------------------------------------------------------------- the A2 actors (shared with Part B through the map)

/** The keeper: rises on the hard cut, reaches left to door #4 and installs; in Part B he lowers his arm, walks to door
 *  #5 (dotted path behind him) and kneels there to install the next one. Fix round 2b ('one at a time' must read at
 *  rest): he grows about his feet while the pull-back zooms out (2.9 -> 3.8 s, invisible inside a 3x zoom) and carries a
 *  small toolbox. Polish A1: the kit Keeper + the scene's detail overlay (keeper.tsx: yoke, sleeves, skirt + vent, a
 *  proper raised sleeve and a hand with a thumb that grips the new lock), 22 px nearer the door so that hand closes on
 *  the lock's edge; the toolbox hangs from his other hand; a shoulder-set bounce ON 'somebody'; 1.6x larger at rest
 *  (reviewer: ~35 px kneeling at door #5 was invisible at phone size). */
const KEEPER_GROW = {from: 2.9, to: 3.8, k: 2.05};
const keeperFeetX = (t: number) => lerp(PA.keeper.x, PA.keeperTo[0], clamp((t - B.to) / (B.kneel - B.to)));
const TOOLBOX = {w: 38, h: 24};
const toolboxPath = (x: number, y: number) => {
  const {w, h} = TOOLBOX;
  return {box: rectPath(x - w / 2, y - h, w, h), lid: rectPath(x - w / 2 - 2, y - h - 5, w + 4, 6), handle: `M${x - 9} ${y - h - 5}V${y - h - 13}H${x + 9}V${y - h - 5}`};
};
/** The kit Keeper's spec (one object for the kit figure and the overlay). */
const KEEPER_SPEC: KeeperSpec = {
  x: PA.keeper.x,
  y: PA.keeper.y,
  h: PA.keeper.h,
  seed: 's9keeper',
  riseAt: B.cutA2 - 0.24,
  reachAt: B.lift - 0.05,
  lowerAt: B.hidden + 0.15,
  installAt: B.lockOn,
  installDur: 0.32,
  walk: {at: B.to, hz: 2.4, to: PA.keeperTo, dur: B.kneel - B.to},
  gripAt: B.lockOn,
};
const KEEPER_SPEC2: KeeperSpec = {...KEEPER_SPEC, reachAt: B.kneel + 0.04, lowerAt: undefined, installAt: B.kneel + 0.18, installDur: 0.8, gripAt: B.kneel + 0.2};
const Toolbox: React.FC = () => {
  const t = useTime();
  const k = PA.keeper;
  // carried in his hanging hand (by the handle), swinging a little with the walk; set down beside him as he kneels
  const [hx, hy] = keeperCarryHand(t, KEEPER_SPEC);
  const walking = t >= B.to && t < B.kneel;
  let x = hx;
  let y = hy + 13 + 5 + TOOLBOX.h + (walking ? Math.abs(Math.sin((t - B.to) * 2.4 * Math.PI)) * 3 : 0);
  if (t >= B.kneel) {
    const q = E.inOutSine(clamp((t - B.kneel) / 0.12));
    x = lerp(x, PA.keeperTo[0] + 60, q);
    y = lerp(y, k.y, q);
  }
  const g = toolboxPath(x, y);
  return (
    <>
      <Fill d={g.box} color={palette.tan} offset={false} mode="none" seed="s9tool/b" />
      <Fill d={g.lid} color={palette.brown} offset={false} mode="none" seed="s9tool/l" />
      <Ink d={g.box + g.lid + g.handle} width={5} taper={false} vary={0} seed="s9tool/i" />
    </>
  );
};

/** The shoulder-set beat ON 'somebody' (cutA2 + 0.08): a 7 % vertical spring bounce about his feet. */
const SET_AT = B.cutA2 + 0.08;
const setBounce = (t: number) => {
  const d = t - SET_AT;
  return d < 0 || d > 0.45 ? 0 : 0.07 * Math.exp(-d * 9) * Math.sin(d * Math.PI * 2 * 3);
};

const KeeperA: React.FC = () => {
  const t = useTime();
  const k = PA.keeper;
  const kneel = t >= B.kneel ? E.outCubic(prog(t, B.kneel, 0.16)) : 0;
  const second = t >= B.kneel;
  const grow = 1 + (KEEPER_GROW.k - 1) * E.inOutSine(clamp((t - KEEPER_GROW.from) / (KEEPER_GROW.to - KEEPER_GROW.from)));
  const fx = keeperFeetX(t);
  const sp = second ? KEEPER_SPEC2 : KEEPER_SPEC;
  const b = setBounce(t);
  return (
    <XG m={mat.compose(mat.about(mat.scale(grow), fx, k.y), mat.about(mat.scale(1 - b * 0.5, 1 + b), fx, k.y))}>
      <Toolbox />
      <XG m={mat.about(mat.scale(1, 1 - 0.2 * kneel), PA.keeperTo[0], k.y)}>
        <Keeper x={sp.x} y={sp.y} h={sp.h} flip riseAt={sp.riseAt} reachAt={sp.reachAt} lowerAt={sp.lowerAt} installAt={sp.installAt} installDur={sp.installDur} walk={sp.walk} seed={sp.seed} />
        <KeeperDetail {...sp} />
      </XG>
    </XG>
  );
};

/** Part A draws them in StoopStreet's hero slot; Part B (`partB`) draws the SAME component through the hidden-cut map:
 *  there Pip leaves the map on 'install' (PartB PipB carries him on in screen space), and the quarter-size crate, the
 *  fallen old lock and the new lock pop off in door #4's 'single' pop (only the flag, the glow arch and the ticked tag
 *  mark the fixed door at rest; the set's own fixed lock is under them). */
export const A2Actors: React.FC<{partB?: boolean}> = ({partB = false}) => {
  const t = useTime();
  const st = pipA(t);
  const props = !partB || t < B.single;
  const pip = !partB || t < B.install;
  return (
    <>
      {props ? <Crate /> : null}
      {props ? <OldLock /> : null}
      {props ? <LandedLock /> : null}
      <BitRun />
      {t >= B.cutA2 ? <KeeperA /> : null}
      {props ? <LandedTag /> : null}
      {pip ? <PipFigure st={st} scale={PA.pip.scale} t={t} /> : null}
      <BitOnPip />
      <FlyingLock />
    </>
  );
};

// ---------------------------------------------------------------- dusk / dawn dressing on the hero house

/** Hero windows lit at dusk (the set's night mode); these pop OFF one by one before the dawn (right to left). */
const WINDOW_OFF: [number, number][] = [
  [5, 0.1], //      [466, 1132]: the small stair window goes dark first
  [4, B.win1], //   [428, 862]: the last lit window in the row
  [3, B.even], //   [428, 712]
  [0, B.even + 0.07], // [70, 712]
];
const HERO_WINS: [number, number, number, number][] = [
  [70, 712, 62, 92],
  [70, 862, 62, 92],
  [70, 1012, 62, 92],
  [428, 712, 62, 92],
  [428, 862, 62, 92],
  [466, 1132, 36, 70],
];

const DuskDawn: React.FC = () => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  if (t < NIGHT_UNTIL) {
    for (const [i, at] of WINDOW_OFF) {
      if (t < at) continue;
      const q = HERO_WINS[i];
      out.push(
        <React.Fragment key={i}>
          <Fill rect={q} color={palette.sage} mode="snap" seed={`stoop/wg${i}`} />
          <Fill d={paneFill(q[0], q[1], q[2], q[3], `stp/g${i}`)} color={palette.mintPale} offset={false} mode="snap" seed={`s9pane${i}`} />
          <Ink d={windowInk(q[0], q[1], q[2], q[3], `stp/w${i}`, {mullion: q[2] > 40})} width={SI.far} taper={false} seed={`s9wi${i}`} />
        </React.Fragment>,
      );
    }
  }
  return <>{out}</>;
};

/** Polish A1 (the 10 px peach strip down the hero's whole right edge read as a drainpipe, the riser bar as a stray
 *  stick): the hero's dawn rim per the playbook, 4 px, only on the cornice's sun-side end and the top third of the
 *  sun-side edge (the set's STOOP.dawnRims[0] is off), from the dawn's second step. Drawn in the 'hero' wrap, so the
 *  Part B ghost (frozen on A2's last frame) shows it too. */
const HERO_RIMS = rectPath(STOOP.hero.x + STOOP.hero.w - 4.5, STOOP.hero.y + 14, 4.5, 196) + rectPath(STOOP.hero.x + STOOP.hero.w - 120, STOOP.hero.y - 3, 124, 4);
const HeroRims: React.FC = () => {
  const t = useTime();
  return t >= NIGHT_UNTIL ? <Fill d={HERO_RIMS} color={palette.peach} offset={false} mode="snap" seed="s9herorim" /> : null;
};

// ---------------------------------------------------------------- the cart (A1 only: the maker has left before A2)

/** J5 'fixed!' WRITES ON (fix round 2b): the kit FixSign wipes its clip across the whole card (0.16 s, out-cubic), so the
 *  word (the card's middle third) appeared in one frame. Here the sign is drawn twice with the same props and seeds: the
 *  struck card without the word, and over it the card WITH the word (finished before this wipe starts) clipped to a
 *  LINEAR wipe over the glyph's own span, 0.16 s (5 frames) right after the strike; pixel-identical outside the
 *  word. (Props-lane request: wipe over the glyph span, linear, ~0.2 s.) */
/** Fix round 3 (on 'out' as the storyboard writes J5, and on the take's pencil_scratch_short at 35.795): 'still
 *  fixing...' is struck at out - 0.26 and 'fixed!' writes on out - 0.16 .. out (film 35.54-35.80). */
const STRIKE_AT = B.out - 0.26;
const SCRIBBLE = {at: B.out - 0.16, dur: 0.16};
const SIGN_TAP = B.out;
const ScribbleSign: React.FC = () => {
  const t = useTime();
  const uid = 's9sc' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const {w, fs} = PA.sign;
  // polish A1: the maker taps the card as 'fixed!' finishes ON 'out' (one pendulum swing, both copies identical)
  const base = <FixSign x={0} y={0} w={w} fs={fs} strikeAt={STRIKE_AT} swingAt={[SIGN_TAP]} ink={SI.far} seed="s9sign" />;
  if (t < SCRIBBLE.at) return base;
  const done = <FixSign x={0} y={0} w={w} fs={fs} strikeAt={STRIKE_AT} swingAt={[SIGN_TAP]} fixedAt={SCRIBBLE.at - 0.2} ink={SI.far} seed="s9sign" />;
  const q = (t - SCRIBBLE.at) / SCRIBBLE.dur;
  if (q >= 1) return done;
  // the glyph's span (FixSign: centred at x + 0.04 w, 1.12 fs lettering, -4 deg), with a little slack for the slant
  const ffs = fs * 1.12;
  const fw = (measureCaption('fixed!', 100) / 100) * ffs;
  const x0 = w * 0.04 - fw / 2 - 4;
  return (
    <>
      {base}
      <defs>
        <clipPath id={uid} clipPathUnits="userSpaceOnUse">
          <rect x={x0} y={-200} width={(fw + 8) * q} height={600} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${uid})`}>{done}</g>
    </>
  );
};

const CART_GO = B.out - 0.05;
const CART_DUR = 0.45;

const CartA: React.FC = () => {
  const t = useTime();
  if (t >= B.cutA2) return null;
  const c = PA.cart;
  // rolls off toward the VP on 'out' (makers ship, they don't install): one-point perspective = a scale about the VP,
  // out-cubic over 0.45 s from out-0.05, so ~90 % of the trip happens before the hard cut (the 'fixed!' card has been
  // complete since 1.37 and rides along, shrinking)
  const q = E.outCubic(clamp((t - CART_GO) / CART_DUR));
  const k = 1 - 0.32 * q;
  return (
    <XG m={mat.about(mat.scale(k, k), STOOP.vp[0], STOOP.vp[1])}>
      <MakersCart
        x={c.x}
        y={c.y}
        size={c.size}
        crates={2}
        pusher
        seed="s9cart"
        roll={{at: CART_GO, to: [c.x + 26, c.y], dur: CART_DUR, ease: E.outCubic}}
        signPost={PA.sign.post}
        sign={<ScribbleSign />}
      />
    </XG>
  );
};

// ---------------------------------------------------------------- the pigeons on the wire (A1 only)

/** STOOP.pigeons on the set's wire (the set's own pair is off: `pigeons={false}`): they shuffle in their sleep on
 *  'even' and wake with a hop on 'the' (no fly-off: the caption band stays clear). */
const PIGEONS = STOOP.pigeons.map((p) => {
  const a = STOOP.wire.a;
  const bx = STOOP.wire.b[0] + 160;
  const q = wirePoint(a[0], a[1], bx, STOOP.wire.b[1] + 6, STOOP.wire.sag * 1.15, (p[0] - a[0]) / (bx - a[0]));
  return [q[0], q[1] + 1] as [number, number];
});

const Pigeons: React.FC = () => {
  const t = useTime();
  if (t >= B.cutA2) return null;
  return (
    <>
      {PIGEONS.map(([x, y], i) => {
        // shuffle: a 6 px side-step over 2 frames, turning round (i = 1 first)
        const sAt = B.even + (i ? 0 : 0.08);
        const dx = (i ? -1 : 1) * 6 * E.inOutSine(prog(t, sAt, 0.07));
        // hop: 10 px up and back (0.14 s), 0.05 s apart
        const hAt = B.the + i * 0.05;
        const dy = t >= hAt && t < hAt + 0.14 ? -10 * Math.sin(((t - hAt) / 0.14) * Math.PI) : 0;
        const flip = (i === 1) !== t >= sAt + 0.035;
        return (
          <XG key={i} m={mat.translate(dx, dy)}>
            <Bird x={x} y={y} s={0.85} seed={`stoop/pg${i}`} color={i ? palette.sand : palette.white} flip={flip} />
          </XG>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- the sun, the tower gap, the horizon glow

/** The rise (fix round 2b: ONE move, so the film's one sunrise never stalls and restarts): from just under the horizon
 *  at the VP to world y 822 (screen ~(700, 756), top ~641: under the caption floor) in 0.85 s, out-cubic, so its speed
 *  falls steadily to rest. Fix round 3: the sun is the FARTHEST layer from the first frame of the rise to the hard cut:
 *  drawn BEHIND the far skyline (no z-swap at the night -> day step), rising in the cleared VP slot (SKY_SLOT) between
 *  the two flanking towers, whose VP-facing edges bite its lower sides as clean silhouette edges (with their peach dawn
 *  rims); the rows' rooflines crop its bottom to the street's V. Gone in A2. */
const SUN_RISE = 0.85;
const SunLayer: React.FC = () => {
  const t = useTime();
  if (t < B.dawn || t >= B.cutA2) return null;
  return <Sun cx={STOOP.vp[0]} cy={STOOP.vp[1] + 114} r={112} horizon={STOOP.vp[1]} drift={[0, 0]} moves={[{at: B.dawn, dur: SUN_RISE, y: 822, ease: E.outCubic}]} />;
};

/** The VP slot (fix round 3): the two far towers right behind the rise point ([664, 58] and [748, 46], and the slit
 *  between them) are clipped out of the set's far layer from the first frame, so the sky at the street's end is open
 *  where S08's sun set and this sun rises; the flanking towers [604, 44] (right edge 648) and [818, 62] stay. Ends above
 *  the set's horizon strip (y 1058). */
const SKY_SLOT: [number, number, number, number] = [649, 640, 168, 417];
/** The horizon glow at the street's end, BEHIND the sun (the rows in front crop it to the V at the VP): the DAWN glow
 *  from the dawn's second step, a horizontal strip. */
const HORIZON_GLOW: [number, number, number, number] = [600, 1043, 260, 19];
const HorizonGlow: React.FC = () => {
  const t = useTime();
  if (t >= NIGHT_UNTIL) return <Fill rect={HORIZON_GLOW} color={palette.peach} offset={false} mode="snap" seed="s9hglow" />;
  return null;
};
/** Polish A1: the AFTERGLOW of S08's sunset (the match cut's warm accent at the set point) is LIGHT, not a bar: a 2-step
 *  flat half-disc in the sky layer, BEHIND the far skyline, in S08's own two tones (HALF.peach outer r 140, peach inner
 *  r 92), its base on the VP's horizon (screen y ~1002, x 700): the far towers' edges and the two rows' rooflines clip it
 *  to the V at the street's end (the cleared VP slot shows its dome). It steps down once on 'But' (outer off) and is gone
 *  at But + 0.12 (the first window pops off). */
const AFTERGLOW = {cx: STOOP.vp[0], base: STOOP.vp[1] + 2, r1: 140, r2: 92};
const halfDisc = (cx: number, base: number, r: number) => `M${cx - r} ${base}A${r} ${r} 0 0 1 ${cx + r} ${base}Z`;
const Afterglow: React.FC = () => {
  const t = useTime();
  if (t >= B.win1) return null;
  const {cx, base, r1, r2} = AFTERGLOW;
  return (
    <>
      {t < B.but ? <Fill d={halfDisc(cx, base, r1)} color={HALF.peach} offset={false} mode="snap" seed="s9aglow1" /> : null}
      <Fill d={halfDisc(cx, base, t < B.but ? r2 : r2 * 0.82)} color={palette.peach} offset={false} mode="snap" seed="s9aglow2" />
    </>
  );
};

/** Night (before NIGHT_UNTIL): the set keeps the road wedge at its day sand while every other ground goes night sage, and
 *  under the dark towers it read as a pale tent rising to the VP: the road steps one tone down (tan / sage) and two
 *  stepped lamp pools from the far lamps lie on it, so it reads as a lit road. (Inset 3 px from the kerb edge: the set's
 *  kerb ink stays on top.) */
const NIGHT_ROAD = (() => {
  const VP = STOOP.vp;
  const y1 = STOOP.pavementY - 2;
  const kx = (yy: number) => VP[0] + ((980 - VP[0]) * (yy - VP[1])) / (STOOP.pavementY - VP[1]);
  return polyPath([
    [VP[0] - 1, VP[1] + 1],
    [VP[0] + 1, VP[1] + 1],
    [kx(y1) - 4, y1],
    [520, y1],
  ]);
})();
const NIGHT_ROAD_C = mix(palette.tan, palette.sage, 0.45);
const ell = (cx: number, cy: number, rx: number, ry: number) => `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const NightRoad: React.FC = () => {
  const t = useTime();
  if (t >= NIGHT_UNTIL) return null;
  return (
    <>
      <Fill d={NIGHT_ROAD} color={NIGHT_ROAD_C} offset={false} mode="snap" seed="s9nroad" />
      <Fill d={ell(782, 1186, 40, 7) + ell(712, 1098, 15, 3)} color={palette.peach} offset={false} mode="snap" seed="s9npool" />
      <Fill d={ell(786, 1186, 20, 3.6) + ell(713, 1098, 7, 1.6)} color={HALF.peach} offset={false} mode="snap" seed="s9npool2" />
    </>
  );
};

// ---------------------------------------------------------------- the left neighbour

/** The left neighbour (cream, cropped by the frame edge): frames A2's left edge like house #3 frames the hidden cut. */
const NEIGHBOUR = (() => {
  const x1 = 37;
  const wins: [number, number, number, number][] = [
    [-70, 712, 58, 92],
    [-70, 862, 58, 92],
    [-70, 1012, 58, 92],
  ];
  let ink = line(-260, 655, x1 + 2, 655, {seed: 's9nb/c', over: [4, 2]}) + line(-260, 692, x1, 692, {seed: 's9nb/c2', over: [2, 2]}) + line(x1, 655, x1, 1372, {seed: 's9nb/r', over: [0, 4]});
  let glass = '';
  wins.forEach((q, i) => {
    ink += windowInk(q[0], q[1], q[2], q[3], `s9nb/w${i}`, {mullion: true});
    glass += rectPath(q[0], q[1], q[2], q[3]);
  });
  return {x1, ink, glass, pipe: rectPath(x1 - 22, 700, 9, 672)};
})();

const Neighbour: React.FC = () => (
  <>
    <Fill rect={[-260, 655, NEIGHBOUR.x1 + 260, 717]} color={palette.cream} seed="s9nb/f" />
    <Fill rect={[-260, 655, NEIGHBOUR.x1 + 260, 37]} color={palette.tan} offset={false} mode="snap" seed="s9nb/cb" />
    <Fill d={NEIGHBOUR.glass} color={palette.sage} offset={false} mode="snap" seed="s9nb/g" />
    <Fill d={NEIGHBOUR.pipe} color={palette.teal} offset={false} mode="snap" seed="s9nb/p" />
    <Ink d={NEIGHBOUR.ink} width={SI.mid} taper={false} seed="s9nb/i" />
  </>
);

// ---------------------------------------------------------------- layer surgery (clips + the ground relight steps)

type Rect = [number, number, number, number];

/** The near tree (STOOP.nearTree: crown + trunk, x 585-725) stands exactly in the sunrise's column: kept out. */
const TREE_HOLE: Rect = [574, 944, 162, 442];

const mapOf = (m: Record<string, string>) => {
  const u: Record<string, string> = {};
  for (const k of Object.keys(m)) u[k.toUpperCase()] = m[k];
  return (c: string) => (c && c[0] === '#' ? u[c.toUpperCase()] ?? c : c);
};
/** Ground step A (NIGHT_UNTIL..): the pavements one haze step up from the night sage; road / kerb keep the night step. */
const GROUND_A = mapOf({[palette.mintPale]: '#98C0AE', [palette.sky]: '#98C0AE', [palette.cream]: palette.sand, [palette.sand]: palette.tan});
/** Ground step B: half a step under the day fills. */
const GROUND_B = mapOf({[palette.mintPale]: HALF.daySky, [palette.sky]: HALF.daySky, [palette.cream]: HALF.sand});

const groundStep = (t: number, node: React.ReactNode): React.ReactNode => {
  if (t < NIGHT_UNTIL) return node;
  return <Tod map={t < GROUND_B_AT ? GROUND_A : GROUND_B}>{node}</Tod>;
};

/** A1's foreground: the set's near kerb + two back-view onlookers cropped by the bottom edges, heads in the visible band
 *  (left ~(26, 1360), right ~(1014, 1380): the relit bottom band has weight), watching the dawn up the street. Polish A1
 *  (reviewer: the bare peach hands beside the coats read as eggs): hands in their pockets (no hanging arms). */
const A1_FOREGROUND = (
  <>
    <Foreground spec="kerb" seed="stoop/fg/kerb" />
    <OnlookerSlot x={40} y={1420} head={128} hair="short" body={palette.teal} acc={['hood']} rim="right" arms={false} seed="s9edge" />
    <OnlookerSlot x={1046} y={1446} head={122} hair="bun" body={palette.brown} acc={['scarf']} rim="left" arms={false} seed="s9edgeR" />
  </>
);
/** A2's foreground (fix round 3, the reviewer's head-and-shoulders pair): the SAME left onlooker (world-consistent: A2
 *  screen ~(105, 1740), head ~190 px) and a second one near the stoop's right end (screen ~(945, 1770)), both cropped by
 *  the bottom edge, left and right of the action column. Polish A1: the right one's head is a flat hair mass (the
 *  'short' hero strands read as meridians on a coconut at 186 px): long ochre hair in a low ponytail mass. In the Part B
 *  ghost they leave with the near layer on the build's first step. */
const A2_FOREGROUND = (
  <>
    <OnlookerSlot x={40} y={1420} head={128} hair="short" body={palette.teal} acc={['hood']} rim="right" arms={false} seed="s9edge" />
    <EdgeOnlooker x={604} y={1444} head={124} hair="long" hairColor={palette.brown} body={palette.sand} acc={['scarf']} rim="left" arms={false} seed="s9edgeA2" />
  </>
);

/** The people layer, all walking up the RIGHT pavement toward the dawn (kept off the sun's column, out of the A2 close):
 *  a far figure, and (fix round 3, scale by depth) the two pedestrians moved up-street behind the cart line, at adult
 *  height for their depth (0.68 x the feet's depth under the eye line at screen 1000: 138 / 156 px at feet screen ~1202 /
 *  ~1230; the far figure 104 px at 1132). They stop just before the hidden cut. */
const WALKERS: WalkerAnchor[] = [
  {x: 842, y: 1192, h: 104, go: 'vp', pace: 0.04, body: palette.teal, hair: 'short'},
  {x: 884, y: 1262, h: 138, go: 'vp', pace: 0.05, body: palette.brown, hair: 'bun'},
  {x: 972, y: 1290, h: 156, go: 'vp', pace: 0.05, body: palette.sage, hair: 'short', acc: ['backpack']},
];
export const GHOST_AT = B.hidden - 1 / 30;

/** A puddle on the near pavement under the sunrise column: a sage pool with a broken ink lip; from the dawn's second
 *  step it holds the sun's stepped reflection (a peach ellipse, a cream core 0.12 s later). Night: tealDark. */
const PUDDLE = {cx: 704, cy: 1506, rx: 96, ry: 15};
const PUDDLE_D = (() => {
  const {cx, cy, rx, ry} = PUDDLE;
  const pts: [number, number][] = [];
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    const w = 1 + 0.08 * Math.sin(a * 3 + 1.1) + 0.05 * Math.cos(a * 5);
    pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
  }
  return {
    body: smooth(pts, {closed: true}) + 'Z',
    lip: arc(cx, cy, rx * 1.03, ry * 1.12, 22, 108, {seed: 's9pud/a'}) + arc(cx, cy, rx * 1.03, ry * 1.12, 124, 168, {seed: 's9pud/b'}),
  };
})();
const Puddle: React.FC = () => {
  const t = useTime();
  const night = t < NIGHT_UNTIL;
  const sunny = !night && t < B.cutA2;
  const rx = PUDDLE.cx + 14;
  return (
    <>
      <Fill d={PUDDLE_D.body} color={night ? palette.tealDark : palette.sage} offset={[3, 2]} mode="snap" seed="s9pud/f" />
      {sunny ? <Fill d={`M${rx - 40} ${PUDDLE.cy}a40 7 0 1 0 80 0a40 7 0 1 0 -80 0Z`} color={palette.peach} offset={false} mode="snap" seed="s9pud/r1" /> : null}
      {sunny && t >= NIGHT_UNTIL + 0.12 ? <Fill d={`M${rx - 17} ${PUDDLE.cy}a17 3.4 0 1 0 34 0a17 3.4 0 1 0 -34 0Z`} color={palette.cream} offset={false} mode="snap" seed="s9pud/r2" /> : null}
      <Ink d={PUDDLE_D.lip} width={SI.mid * 0.8} taper={false} seed="s9pud/i" />
    </>
  );
};

// ---------------------------------------------------------------- Part A

/** `ghost` = the Part B hidden-cut ghost (ghost.tsx): the set alone (no actors, no lock, no dusk dressing), drawn under a
 *  frozen time through the hidden-cut map. `ghostStep` (fix round 2b, the 'to' build): from 1 the lamp post (the near
 *  layer), the puddle and the walkers (+ the bike) pop off; ghost.tsx clips the rest away block by block. */
export const PartA: React.FC<{ghost?: boolean; ghostStep?: number}> = ({ghost = false, ghostStep = 0}) => {
  const t = useTime();
  const a2 = t >= B.cutA2;
  const wrap: LayerWrap = (name, _n, node) => {
    // the set's peach dawn band only ever showed through tower gaps (as vertical sticks under the sun): FarDress's
    // horizontal glow at the VP replaces it
    if (name === 'dawn') return null;
    if (name === 'far') return (
      <>
        <HorizonGlow />
        {ghost ? null : <Afterglow />}
        {ghost ? null : <SunLayer />}
        <ClipOut holes={[SKY_SLOT]}>{groundStep(t, node)}</ClipOut>
      </>
    );
    if (name === 'hero') return (
      <>
        <Neighbour />
        {node}
        <HeroRims />
      </>
    );
    if (name === 'ground') return (
      <>
        {groundStep(t, node)}
        <NightRoad />
        {ghostStep >= 1 ? null : <Puddle />}
      </>
    );
    if (name === 'people' && ghostStep >= 1) return null;
    if (name === 'near') return ghostStep >= 1 ? null : <ClipOut holes={a2 ? [TREE_HOLE, WIRE_HOLE] : [TREE_HOLE]}>{groundStep(t, node)}</ClipOut>;
    return node;
  };
  return (
    <>
      <StoopStreet
        tod="night"
        nightUntil={NIGHT_UNTIL}
        glowFlickerAt={B.win1}
        dawnRims={[1, 4]}
        wrap={wrap}
        heroLock={false}
        calendar={false}
        pigeons={false}
        foreground={a2 ? A2_FOREGROUND : A1_FOREGROUND}
        furniture={[{kind: 'bike', x: 930, y: 1462, s: 0.95}]}
        people={{walkers: WALKERS, walk: 0, stop: GHOST_AT}}
        heroSlot={
          ghost ? null : (
            <>
              <DuskDawn />
              <A2Actors />
            </>
          )
        }
      />
      {ghost ? null : (
        <>
          <Pigeons />
          <CartA />
        </>
      )}
    </>
  );
};
