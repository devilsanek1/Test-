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
// the near tree, the far towers' dawn rims and the walker are kept off the sun's column.

import React from 'react';
import {Fill, Ink, Sun, Bird, Tod, palette, useTime, ease as E, prog, lerp, clamp, mat, XG, rectPath, line, springAt, springs, wirePoint} from '../../lib';
import {Elephant, hop, popSwitch, PoseName, Expression} from '../../lib/mascot';
import {StoopStreet, STOOP, paneFill, windowInk, SI, HALF, Foreground, EdgeFigure, LayerWrap} from '../shared/sets';
import type {WalkerAnchor} from '../shared/sets';
import {Bit, Keeper, Lock, LockCrate, MakersCart, NewLockIcon, FixSign} from '../shared/props';
import {B} from './beats';
import {ClipOut, WIRE_HOLE} from './matchcut';

// ---------------------------------------------------------------- anchors (Part A world)

export const PA = {
  pip: {x: 125, y: 1230, scale: 1.1},
  /** Off-frame left (A1 screen x = world - 20): Pip leaps in from here onto the ledge, in the air on 'But'. */
  pipStart: {x: -64, y: 1434},
  crate: {x: 232, y: 1226, size: 85},
  lock: {x: STOOP.lock4.x, y: STOOP.lock4.y, size: STOOP.lock4.h},
  dropDist: 76,
  /** Bit sits on the old lock (lock-local units: 42 px lock = 100 units), size 12 world (18 px on screen in A2). */
  bitSize: 12,
  bitFrame: [349, 1080] as [number, number],
  keeper: {x: 420, y: 1300, h: 186},
  /** Keeper walks (Part B) to door #5: A2 coords of B-world (652, 1507). */
  keeperTo: [778, 1300] as [number, number],
  cart: {x: 760, y: 1432, size: 150},
  /** J5 sign (shared FixSign) in the cart's sign slot: hook = the top of a 132 px post (world (812, 1236)). */
  sign: {w: 224, fs: 36, post: 132},
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
/** The ground relights behind the sky in two more flat steps (A: haze, B: half-step), day from GROUND_DAY. */
const GROUND_B_AT = B.dawn + 0.24;
const GROUND_DAY = B.dawn + 0.36;

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
      rider={riding ? <Bit x={-6} y={-50} size={PA.bitSize / s} state="ride" look="down" seed="s9bit" /> : undefined}
    />
  );
};

/** Bit after the landing: hops off the fallen lock and scuttles up door #4's right frame (the hidden-cut match). */
const BitRun: React.FC = () => {
  const t = useTime();
  if (t < LAND_T + 0.04) return null;
  const top = PA.lock.y + PA.dropDist - PA.lock.size / 2; // fallen lock top
  const path: [number, number][] = [
    [PA.lock.x - 2, top],
    [PA.bitFrame[0], top + 8],
    [PA.bitFrame[0], PA.bitFrame[1]],
  ];
  return <Bit crawl={{at: LAND_T + 0.06, path, speed: 430}} state="scuttle" size={PA.bitSize} seed="s9bit" look="forward" />;
};

/** The new lock in the air: flung from Pip's trunk on an arc, landing ON the door as the pop-on. */
const FlyingLock: React.FC = () => {
  const t = useTime();
  if (t < TOSS.at || t >= TOSS.land) return null;
  const q = (t - TOSS.at) / (TOSS.land - TOSS.at);
  const [x0, y0] = PA.trunkTip;
  const x = lerp(x0, PA.lock.x, q);
  const y = lerp(y0, PA.lock.y, q) - Math.sin(Math.PI * q) * 70;
  return <Lock x={x} y={y} size={PA.lock.size * (0.9 + 0.1 * q)} state="fixed" ink={SI.far} rot={-25 + 25 * q + Math.sin(q * Math.PI) * -40} checkAt={B.check} seed="s9newlock" />;
};

/** The new lock ON the door: it lands from the toss with a squash and the 7 % spring (never from zero: the flying lock
 *  hands over at full size), then its check strokes on. */
const LandedLock: React.FC = () => {
  const t = useTime();
  if (t < TOSS.land) return null;
  const k = 0.84 + 0.16 * springAt(t, TOSS.land, springs.pop);
  const sq = t < TOSS.land + 0.07 ? 1.08 : 1;
  return (
    <XG m={mat.about(mat.scale(k * sq, k / sq), PA.lock.x, PA.lock.y)}>
      <Lock x={PA.lock.x} y={PA.lock.y} size={PA.lock.size} state="fixed" ink={SI.far} checkAt={B.check} seed="s9newlock" />
    </XG>
  );
};

// ---------------------------------------------------------------- Pip (Part A world)

type PipState = {x: number; y: number; pose: PoseName; squash: number; rotate: number; amount?: number; look?: number; expression?: Expression; prop?: React.ReactNode; walkRate?: number; flip?: boolean};

/** Pip in Part A world coordinates at scene time t (also used, mapped, at the start of Part B). */
export function pipA(t: number): PipState {
  // the leap in from off-frame left: crouch off-frame, take off 0.10 s before 'But' (in the air ON the word)
  const hopT0 = B.but - 0.1;
  const air = 0.42;
  if (t < hopT0 + air + 0.32) {
    const h = hop({t, t0: hopT0, dur: air, from: PA.pipStart, to: {x: PA.pip.x, y: PA.pip.y}, height: 40});
    const pose: PoseName = h.k < 1 ? 'stand-side' : 'sit-front';
    return {x: h.x, y: h.y, pose, squash: h.squash, rotate: h.rotate, amount: h.spread, look: 0.3};
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
  return {x: PA.pip.x, y: PA.pip.y, pose, squash, rotate: 0, look, expression, prop};
}

export const PipFigure: React.FC<{st: PipState; scale: number; t: number}> = ({st, scale, t}) => (
  <Elephant x={st.x} y={st.y} scale={scale} pose={st.pose} t={t} seed={9} squash={st.squash} rotate={st.rotate} amount={st.amount} look={st.look} expression={st.expression} prop={st.prop} walkRate={st.walkRate} flip={st.flip} />
);

// ---------------------------------------------------------------- the A2 actors (shared with Part B through the map)

/** The keeper's hand: a tan cuff band + a sand mitten blob with ink (back view, no fingers), angled along the raised
 *  arm (person-local units: the Keeper's `holding` slot sits at the hand). */
const MITTEN_ANG = (Math.atan2(-0.38 * 95, 0.32 * 93) * 180) / Math.PI; // the raised arm's direction (TORSO 95, w ~93)
const Mitten: React.FC = () => (
  <XG m={mat.compose(mat.translate(0, 6), mat.rotate(MITTEN_ANG + 90))}>
    <Fill d="M-11 2h22v-8h-22Z" color={palette.tan} offset={false} mode="none" seed="s9mit/c" />
    <Fill d="M-9 -6C-12 -16 -8 -27 0 -27C8 -27 12 -16 9 -6Z" color={palette.sand} offset={false} mode="none" seed="s9mit/h" />
    <Ink d="M-11 2h22M-11 -6h22M-9 -6C-12 -16 -8 -27 0 -27C8 -27 12 -16 9 -6" width={5} taper={false} seed="s9mit/i" />
  </XG>
);

/** The keeper: rises on the hard cut, reaches left to door #4 and installs; in Part B he lowers his arm, walks to door
 *  #5 (dotted path behind him) and kneels there to install the next one. */
const KeeperA: React.FC = () => {
  const t = useTime();
  const k = PA.keeper;
  const kneel = t >= B.kneel ? E.outCubic(prog(t, B.kneel, 0.16)) : 0;
  const second = t >= B.kneel;
  return (
    <XG m={mat.about(mat.scale(1, 1 - 0.2 * kneel), PA.keeperTo[0], k.y)}>
      <Keeper
        x={k.x}
        y={k.y}
        h={k.h}
        flip
        riseAt={B.cutA2}
        reachAt={second ? B.kneel + 0.04 : B.lift - 0.05}
        lowerAt={second ? undefined : B.hidden + 0.15}
        installAt={second ? B.kneel + 0.18 : B.lockOn}
        installDur={second ? 0.8 : 0.32}
        holding={<Mitten />}
        walk={{at: B.to, hz: 2.4, to: PA.keeperTo, dur: B.kneel - B.to}}
        seed="s9keeper"
      />
    </XG>
  );
};

export const A2Actors: React.FC<{pip?: boolean}> = ({pip = true}) => {
  const t = useTime();
  const st = pipA(t);
  return (
    <>
      <LockCrate x={PA.crate.x} y={PA.crate.y} size={PA.crate.size} lid lidAt={B.fix - 0.08} tagsAt={B.out - 0.06} ink={SI.far} seed="s9crate" />
      <OldLock />
      <BitRun />
      {t >= B.cutA2 ? <KeeperA /> : null}
      {pip ? <PipFigure st={st} scale={PA.pip.scale} t={t} /> : null}
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
  } else if (t < B.cutA2) {
    // dawn (A1 only): a peach rim on step 2's sun side (the hero's own rim is the set's STOOP.dawnRims[0])
    out.push(<Fill key="rimS2" rect={[396, 1232, 13, 66]} color={palette.peach} offset={false} mode="snap" seed="s9rim2" />);
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- the cart (A1 only: the maker has left before A2)

const CartA: React.FC = () => {
  const t = useTime();
  if (t >= B.cutA2) return null;
  const c = PA.cart;
  // rolls off toward the VP: one-point perspective = a scale about the VP
  const q = E.inOutSine(clamp((t - B.out) / 1.1));
  const k = 1 - 0.22 * q;
  return (
    <XG m={mat.about(mat.scale(k, k), STOOP.vp[0], STOOP.vp[1])}>
      <MakersCart
        x={c.x}
        y={c.y}
        size={c.size}
        crates={2}
        pusher
        seed="s9cart"
        roll={{at: B.out, to: [c.x + 1, c.y], dur: 1.1}}
        signPost={PA.sign.post}
        sign={<FixSign x={0} y={0} w={PA.sign.w} fs={PA.sign.fs} strikeAt={B.fix} fixedAt={B.out - 0.1} ink={SI.far} seed="s9sign" />}
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

// ---------------------------------------------------------------- the sun + the near tower in front of it

/** The nearest far tower (STOOP.towers[3], x 818-880) re-drawn in front of the sun from the first frame of the rise:
 *  night tealDark + peach dots before NIGHT_UNTIL, the day haze (#84B09C) + day dots after (the set's own geometry and
 *  dot patterns). It only clips the disc's right rim: >= 70 % of the disc reads from 1.0 s. */
const NEAR_TOWER = (() => {
  const [tx, tw, top] = STOOP.towers[3];
  const VP = STOOP.vp;
  const setback = tw * 0.22;
  const fill = rectPath(tx, top + 22, tw, VP[1] + 4 - top - 22) + rectPath(tx + setback, top, tw - setback * 2, 24) + rectPath(tx + tw * 0.46, top - 26, 4, 28);
  let night = '';
  let day = '';
  for (let yy = top + 34; yy < VP[1] - 8; yy += 15) for (let xx = tx + 6; xx < tx + tw - 6; xx += 11) if ((xx * 7 + yy * 3) % 5 < 2) night += rectPath(xx, yy, 4, 6);
  for (let yy = top + 36; yy < VP[1] - 20; yy += 22) for (let xx = tx + 7; xx < tx + tw - 7; xx += 12) if ((xx * 5 + yy * 7) % 9 < 2) day += rectPath(xx, yy, 3.5, 4.5);
  return {fill, night, day};
})();

/** The rise: from just under the horizon at the VP to world y 915 in 0.40 s (out-cubic, ~75 % of the disc clear of the
 *  row rooflines by 1.0 s), then a slow glide to y 885 (screen ~(700, 820)) up to the hard cut. Gone in A2. */
const SunLayer: React.FC = () => {
  const t = useTime();
  if (t < B.dawn || t >= B.cutA2) return null;
  const night = t < NIGHT_UNTIL;
  return (
    <>
      <Sun
        cx={STOOP.vp[0]}
        cy={STOOP.vp[1] + 114}
        r={112}
        horizon={STOOP.vp[1]}
        drift={[0, 0]}
        moves={[
          {at: B.dawn, dur: 0.4, y: 915, ease: E.outCubic},
          {at: B.dawn + 0.4, dur: B.cutA2 - B.dawn - 0.45, y: 885, ease: E.inOutSine},
        ]}
      />
      <Fill d={NEAR_TOWER.fill} color={night ? palette.tealDark : '#84B09C'} offset={false} mode="snap" seed="stoop/towers" />
      <Fill d={night ? NEAR_TOWER.night : NEAR_TOWER.day} color={night ? palette.peach : HALF.daySky} offset={false} mode="snap" seed="stoop/tdots" />
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
/** The far towers' dawn rims (STOOP.dawnRims[1..4], x 640-824, y 760-1016) would stand in front of the sun: kept out
 *  (the hero's own rim [0] stays). Nothing else of the hero layer lives in that box. */
const RIMS_HOLE: Rect = [634, 752, 198, 270];

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
  if (t < NIGHT_UNTIL || t >= GROUND_DAY) return node;
  return <Tod map={t < GROUND_B_AT ? GROUND_A : GROUND_B}>{node}</Tod>;
};

/** A1's foreground: the set's near kerb + a back-view onlooker cropped by the bottom-left edge, head inside the visible
 *  band (screen ~(26, 1360)), facing up the street toward the dawn. A2 has none (it would be cut away by the match). */
const A1_FOREGROUND = (
  <>
    <Foreground spec="kerb" seed="stoop/fg/kerb" />
    <EdgeFigure side="L" x={40} y={1420} head={128} seed="s9edge" />
  </>
);

/** The walker kept off the sun's column: a small figure on the right pavement walking up toward the VP. */
const WALKER: WalkerAnchor = {x: 842, y: 1192, h: 104, go: 'vp', pace: 0.04, body: palette.teal, hair: 'short'};

// ---------------------------------------------------------------- Part A

export const PartA: React.FC = () => {
  const t = useTime();
  const a2 = t >= B.cutA2;
  const wrap: LayerWrap = (name, _n, node) => {
    if (name === 'far') return (
      <>
        {groundStep(t, node)}
        <SunLayer />
      </>
    );
    if (name === 'hero') return (
      <>
        <Neighbour />
        <ClipOut holes={[RIMS_HOLE]}>{node}</ClipOut>
      </>
    );
    if (name === 'ground') return groundStep(t, node);
    if (name === 'near') return <ClipOut holes={a2 ? [TREE_HOLE, WIRE_HOLE] : [TREE_HOLE]}>{groundStep(t, node)}</ClipOut>;
    return node;
  };
  return (
    <>
      <StoopStreet
        tod="night"
        nightUntil={NIGHT_UNTIL}
        glowFlickerAt={B.win1}
        wrap={wrap}
        heroLock={false}
        calendar={false}
        pigeons={false}
        foreground={a2 ? false : A1_FOREGROUND}
        furniture={[{kind: 'bike', x: 930, y: 1462, s: 0.95}]}
        people={{walkers: [WALKER], walk: 0}}
        heroSlot={
          <>
            <DuskDawn />
            <LandedLock />
            <A2Actors />
          </>
        }
      />
      <Pigeons />
      <CartA />
    </>
  );
};
