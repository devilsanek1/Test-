// S09 Part A (Stoop Street, StoopStreet set world = canvas px at S03's rest): A1 the dusk -> dawn wide, A2 the door #4
// close. Everything here is in the StoopStreet world; Scene09 applies the camera.
//
// Staging (world): the crate of new locks on step 2's LEFT end (215, 1226); Pip on the facade ledge beside it
// (125, 1230), scale 1.1; the old lock on door #4 (330, 1130) with Bit sitting on it; the makers' cart parked right of
// the stoop (760, 1430) with the workshop's 'still fixing...' sign; at the hard cut the keeper rises on step 1's right
// end (420, 1300) and reaches left to the lock. The lock axis (x 313-347) stays clear for the drop and the pop-on.
// The A2 actors (old lock, Bit, crate, keeper, Pip, the flying new lock) are <A2Actors/>: Part B renders the SAME
// component through the hidden-cut map (camera.ts a2ToBMat), so the hidden cut holds them in place.

import React from 'react';
import {Fill, Ink, Sun, palette, useTime, ease as E, prog, lerp, clamp, mat, XG, rectPath, line, springAt, springs} from '../../lib';
import {Elephant, hop, popSwitch, walkSpeed, PoseName, Expression} from '../../lib/mascot';
import {StoopStreet, STOOP, paneFill, windowInk, SI, HALF} from '../shared/sets';
import {Bit, Keeper, Lock, MakersCart, NewLockIcon} from '../shared/props';
import {B} from './beats';
import {CartSign, LidCrate} from './shims';

// ---------------------------------------------------------------- anchors (Part A world)

export const PA = {
  pip: {x: 125, y: 1230, scale: 1.1},
  pipStart: {x: 26, y: 1434},
  crate: {x: 215, y: 1226, size: 58},
  lock: {x: STOOP.lock4.x, y: STOOP.lock4.y, size: STOOP.lock4.h},
  dropDist: 76,
  /** Bit sits on the old lock (lock-local units: 42 px lock = 100 units), size 12 world (18 px on screen in A2). */
  bitSize: 12,
  bitFrame: [349, 1080] as [number, number],
  keeper: {x: 420, y: 1300, h: 186},
  /** Keeper walks (Part B) to door #5: A2 coords of B-world (652, 1507). */
  keeperTo: [778, 1300] as [number, number],
  cart: {x: 760, y: 1432, size: 150},
  sign: {x: 800, y: 1236, w: 224, fs: 36},
  /** Where Pip's hold-pose trunk tip carries the new lock (world, measured on the render). */
  trunkTip: [166, 1128] as [number, number],
};

/** Time the old lock lands (Lock's own gravity 4200 px/s^2). */
export const LAND_T = B.drop + Math.sqrt((2 * PA.dropDist) / 4200);
/** The toss: Pip flings the new lock from his trunk to door #4 (lands = the pop-on). */
export const TOSS = {at: B.still - 0.1, land: B.lockOn};

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
      dropAt={B.drop}
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

const WALK_RATE = 1.7;

/** Pip in Part A world coordinates at scene time t (also used, mapped, at the start of Part B). */
export function pipA(t: number): PipState {
  const sc = PA.pip.scale;
  const v = walkSpeed(WALK_RATE) * sc;
  const hopT0 = B.but;
  const air = 0.36;
  if (t < hopT0 - 0.14) {
    return {x: PA.pipStart.x + v * t, y: PA.pipStart.y, pose: 'walk-side', squash: 0, rotate: 0, walkRate: WALK_RATE};
  }
  if (t < hopT0 + air + 0.32) {
    const from = {x: PA.pipStart.x + v * (hopT0 - 0.14), y: PA.pipStart.y};
    const h = hop({t, t0: hopT0, dur: air, from, to: {x: PA.pip.x, y: PA.pip.y}, height: 34});
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
    prop = <NewLockIcon size={PA.lock.size * 0.9 / PA.pip.scale} grip="bottom" checkAt={B.check} seed="s9newlock" />;
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
      <LidCrate x={PA.crate.x} y={PA.crate.y} size={PA.crate.size} lidAt={B.fix - 0.08} tagsAt={B.out - 0.06} ink={SI.far} seed="s9crate" />
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

const DuskDawn: React.FC<{nightUntil: number}> = ({nightUntil}) => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  if (t < nightUntil) {
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
  } else {
    // dawn: peach rim strips on the facades' sun side (the sun is at the VP, right of the hero house)
    out.push(<Fill key="rimR" rect={[506, 684, 13, 545]} color={palette.peach} offset={false} mode="snap" seed="s9rim1" />);
    out.push(<Fill key="rimS2" rect={[396, 1232, 13, 66]} color={palette.peach} offset={false} mode="snap" seed="s9rim2" />);
  }
  return <>{out}</>;
};

// ---------------------------------------------------------------- the cart (A1)

const CartA: React.FC = () => {
  const t = useTime();
  const c = PA.cart;
  // rolls off toward the VP: one-point perspective = a scale about the VP
  const q = E.inOutSine(clamp((t - B.out) / 1.1));
  const k = 1 - 0.22 * q;
  return (
    <XG m={mat.about(mat.scale(k, k), STOOP.vp[0], STOOP.vp[1])}>
      <MakersCart x={c.x} y={c.y} size={c.size} crates={2} pusher seed="s9cart" roll={{at: B.out, to: [c.x + 1, c.y], dur: 1.1}} />
      <Ink d={`M${c.x + 30} ${c.y - 62}L${PA.sign.x} ${PA.sign.y - 4}`} width={SI.mid} taper={false} seed="s9post" />
      <CartSign x={PA.sign.x} y={PA.sign.y} w={PA.sign.w} fs={PA.sign.fs} strikeAt={B.out} fixedAt={B.out + 0.1} ink={SI.far} seed="s9sign" />
    </XG>
  );
};

// ---------------------------------------------------------------- the sun's depth + the left neighbour

/** The NEARER pair of far towers (STOOP.towers 1 and 3), re-drawn in front of the rising sun so the sun sits between
 *  the far pair and the near pair (day haze ladder, the set's own silhouettes and window dots). */
const NEAR_TOWERS = (() => {
  let fill = '';
  let dots = '';
  STOOP.towers.forEach(([tx, tw, top], i) => {
    if (i !== 1 && i !== 3) return;
    const setback = tw * 0.22;
    fill += rectPath(tx, top + 22, tw, STOOP.vp[1] + 4 - top - 22) + rectPath(tx + setback, top, tw - setback * 2, 24) + (i % 2 ? rectPath(tx + tw * 0.46, top - 26, 4, 28) : rectPath(tx + tw * 0.2, top - 12, tw * 0.28, 14));
    for (let yy = top + 36; yy < STOOP.vp[1] - 20; yy += 22) for (let xx = tx + 7; xx < tx + tw - 7; xx += 12) if ((xx * 5 + yy * 7) % 9 < 2) dots += rectPath(xx, yy, 3.5, 4.5);
  });
  return {fill, dots};
})();

const SunLayer: React.FC<{nightUntil: number}> = ({nightUntil}) => {
  const t = useTime();
  if (t < B.dawn) return null;
  return (
    <>
      <Sun
        cx={STOOP.vp[0]}
        cy={STOOP.vp[1] + 125}
        r={112}
        horizon={STOOP.vp[1]}
        drift={[0, 0]}
        moves={[
          {at: B.dawn, dur: 0.45, y: 978, ease: E.outCubic},
          {at: B.dawn + 0.45, dur: 1.4, y: 934, ease: E.inOutSine},
        ]}
      />
      {t >= nightUntil ? (
        <>
          <Fill d={NEAR_TOWERS.fill} color="#84B09C" offset={false} mode="snap" seed="s9towers" />
          <Fill d={NEAR_TOWERS.dots} color={HALF.daySky} offset={false} mode="snap" seed="s9tdots" />
        </>
      ) : null}
    </>
  );
};

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

// ---------------------------------------------------------------- Part A

export const PartA: React.FC = () => {
  const t = useTime();
  const nightUntil = B.dawn + 0.19;
  return (
    <>
      <StoopStreet
        tod="night"
        nightUntil={nightUntil}
        wrap={(name, _n, node) => (name === 'far' ? (<>{node}<SunLayer nightUntil={nightUntil} /></>) : name === 'hero' ? (<><Neighbour />{node}</>) : node)}
        heroLock={false}
        calendar={false}
        foreground="kerb"
        furniture={[{kind: 'bike', x: 930, y: 1462, s: 0.95}]}
        people={{walkers: [STOOP.walkers[2]], walk: 0}}
        heroSlot={
          <>
            <DuskDawn nightUntil={nightUntil} />
            <LandedLock />
            <A2Actors />
          </>
        }
      />
      <CartA />
    </>
  );
};
