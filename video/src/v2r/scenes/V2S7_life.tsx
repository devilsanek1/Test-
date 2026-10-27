// V2S7_life.tsx (lane L5): the LIFE of V2S7 (DENSE-CALM, STYLE.md section 5): 2-4 movers crossing SIDEWAYS at real
// speeds at every frame (walkers, a cyclist, a dog, staff in and out of the doors), about half the people at rest
// (the cafe, the steps), nothing coming at us, and the quiet ambient elements: the fountain's rhythmic jets, falling
// plane leaves, far chimney smoke, steam, pigeons, the wing's windows switching (kit), and on "principles" (30.04 =
// local 1.98) the lamp run: the festoons light bulb by bulb, then the trees' uplights, the basin's lights, the cafe's.
// Everything passes BEHIND the board (no life over its lettering) and nothing big starts after 32.70 (local 4.64).
// WORLD px (V2S7.tsx wraps it in the camera); times are shot-local seconds.
import React from 'react';
import {CM, INK_PX} from '../palette';
import {useTime} from '../../lib/time';
import {Batch, Paint, P, ovalPath, domePath, leafPath, lerp, rng, rand, frac, clamp01} from '../kit/canal/core';
import {StringLights, FallingLeaves, Puffs, Pigeons} from '../kit/canal/life';
import {Person, Seated, NearBack, strideFor} from '../kit/cast';
import {
  LANE, walkerH, kAt, kpAt, TREE_L, TREE_R, FESTOON_A, FESTOON_B, JETS, BASIN, basinLeftAt, CAFE, WING, BULB_STEP,
  runAt, W7, mixHex,
} from './V2S7_rig';

// ---------------------------------------------------------------- walkers (profile, sideways)

type Walk = {
  seed: string;
  /** Feet y (the lane) and, for the staff, a path in y too. */
  y: number;
  /** Start x at t0, direction (+1 = screen right), speed in body heights / s. */
  x0: number;
  t0: number;
  dir: 1 | -1;
  hps?: number;
  /** Visible window (local s). */
  from?: number;
  to?: number;
  traits?: React.ComponentProps<typeof Person>['traits'];
  h?: number;
};

/** A walker's x at t (moves every frame), steps on the 12 drawings/s clock, feet honest via strideFor. */
const WalkerFig: React.FC<{w: Walk; t: number}> = ({w, t}) => {
  const h = w.h ?? walkerH(w.y);
  const speed = (w.hps ?? 0.85) * h;
  const rate = 1.9;
  const x = w.x0 + w.dir * speed * (t - w.t0);
  if (w.from !== undefined && t < w.from) return null;
  if (w.to !== undefined && t > w.to) return null;
  if (x < -120 || x > 1200) return null;
  const step = rate * (Math.floor((t - w.t0) * 12 + 1e-6) / 12) + rand(w.seed, 'ph') * 2;
  return <Person x={x} y={w.y} h={h} seed={w.seed} pose="walk" view="profile" flip={w.dir > 0} step={step} stride={strideFor(speed / rate, h, 'profile')} traits={w.traits} exact />;
};

/** The forecourt's walkers: lanes A (behind the right plane), B and C (in front of it). The left column too. */
export const WALKERS_A: Walk[] = [
  {seed: 's7/w/a2', y: LANE.A, x0: 652, t0: 0.5, dir: 1, from: 0.5, traits: {hair: 'beanie', acc: 'backpack', coat: CM.coatSlate}},
  {seed: 's7/w/l2', y: LANE.A, x0: 118, t0: 3.7, dir: -1, from: 3.7, traits: {hair: 'long', acc: 'tote', coat: CM.brick}},
];
export const WALKERS_B: Walk[] = [
  {seed: 's7/w/b1', y: LANE.B, x0: 1062, t0: 0, dir: -1, to: 3.2, traits: {hair: 'short', acc: 'strap', coat: CM.coatOat}},
  {seed: 's7/w/l1', y: LANE.B, x0: -50, t0: 0, dir: 1, to: 1.5, traits: {hair: 'curls', acc: 'headphones', coat: CM.coatPlum}},
  {seed: 's7/w/b2', y: LANE.B + 6, x0: 640, t0: 3.1, dir: 1, from: 3.1, hps: 0.7, traits: {hair: 'cap', acc: 'none', coat: CM.sage}},
];

export const S7WalkersA: React.FC = () => {
  const t = useTime();
  return (
    <>
      {WALKERS_A.map((w) => (
        <WalkerFig key={w.seed} w={w} t={t} />
      ))}
    </>
  );
};

/** Lane B (with the dog on a lead beside b2) and lane C (the cyclist). */
export const S7WalkersBC: React.FC = () => {
  const t = useTime();
  const b2 = WALKERS_B[2];
  const hb2 = walkerH(b2.y);
  const xb2 = b2.x0 + 0.7 * hb2 * (t - b2.t0);
  return (
    <>
      {WALKERS_B.map((w) => (
        <WalkerFig key={w.seed} w={w} t={t} />
      ))}
      {t >= b2.t0 ? <Dog x={xb2 + hb2 * 0.62} y={b2.y + 4} h={kpAt(b2.y) * 0.42} t={t} lead={[xb2 + hb2 * 0.12, b2.y - hb2 * 0.44]} /> : null}
      <Cyclist t={t} />
    </>
  );
};

/** The cyclist: lane C, left to right, ~2.2 body heights / s, 2.30-3.75 (out from behind the board). */
const Cyclist: React.FC<{t: number}> = ({t}) => {
  const t0 = 2.3;
  if (t < t0) return null;
  const h = walkerH(LANE.C) * 1.02;
  const x = 600 + 2.2 * h * (t - t0);
  if (x > 1220) return null;
  return <Person x={x} y={LANE.C} h={h} seed="s7/cyclist" pose="cycle" view="profile" flip pedal={1.3} traits={{hair: 'cap', acc: 'backpack', coat: CM.leafRust}} exact />;
};

/** A small dog trotting on a lead (a terrier in profile, facing right): body, head, ears, a raised tail, four legs. */
const Dog: React.FC<{x: number; y: number; h: number; t: number; lead?: [number, number]}> = ({x, y, h, t, lead}) => {
  const b = new Batch();
  const L = h * 1.5;
  const ph = Math.floor(t * 12) / 12;
  const trot = Math.sin(ph * 15);
  const bob = Math.abs(trot) * h * 0.04;
  const by = y - h * 0.62 - bob;
  const col = CM.coatOat;
  const dark = CM.line;
  // legs (two pairs, alternating)
  const legW = h * 0.11;
  const legs: [number, number][] = [
    [-0.32, trot],
    [-0.2, -trot],
    [0.24, -trot],
    [0.36, trot],
  ];
  legs.forEach(([u, s], i) => {
    const lx = x + u * L;
    b.poly(i % 2 ? col : mixHex(col, dark, 0.25), [[lx - legW / 2, by], [lx + legW / 2, by], [lx + legW / 2 + s * h * 0.12, y], [lx - legW / 2 + s * h * 0.12, y]]);
  });
  b.fill(col, ovalPath(x, by, L * 0.42, h * 0.27));
  b.fill(dark, ovalPath(x - L * 0.08, by - h * 0.12, L * 0.18, h * 0.1));
  // head + ear + snout, tail up
  const hx = x + L * 0.46;
  const hy = by - h * 0.32;
  b.fill(col, ovalPath(hx, hy, h * 0.21, h * 0.18));
  b.fill(col, `M${P(hx + h * 0.1, hy)}L${P(hx + h * 0.34, hy + h * 0.06)}L${P(hx + h * 0.32, hy + h * 0.15)}L${P(hx + h * 0.08, hy + h * 0.14)}Z`);
  b.fill(dark, `M${P(hx - h * 0.08, hy - h * 0.1)}L${P(hx + h * 0.04, hy - h * 0.3)}L${P(hx + h * 0.1, hy - h * 0.08)}Z`);
  b.fill(CM.ink, ovalPath(hx + h * 0.33, hy + h * 0.08, h * 0.035, h * 0.03));
  b.fill(col, `M${P(x - L * 0.4, by - h * 0.06)}Q${P(x - L * 0.56, by - h * 0.4)} ${P(x - L * 0.5, by - h * 0.62)}L${P(x - L * 0.45, by - h * 0.6)}Q${P(x - L * 0.48, by - h * 0.36)} ${P(x - L * 0.34, by - h * 0.12)}Z`);
  b.rect(CM.box, hx - h * 0.12, hy + h * 0.1, h * 0.14, h * 0.06);
  b.ink(`M${P(x - L * 0.42, by - h * 0.18)}Q${P(x, by - h * 0.32)} ${P(x + L * 0.36, by - h * 0.2)}`, INK_PX.hair, CM.ink, 0.3);
  if (lead) b.ink(`M${P(lead[0], lead[1])}Q${P((lead[0] + hx) / 2, Math.max(lead[1], hy) + h * 0.35)} ${P(hx - h * 0.04, hy + h * 0.12)}`, 1.4, CM.anchor);
  return <Paint b={b} seed="s7/dog" misreg={false} />;
};

// ---------------------------------------------------------------- the staff (small, never reacting)

/** Clip the inside-the-door figures to the doorway (+ side lights). */
const DoorClip: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <>
    <defs>
      <clipPath id="s7doorclip" clipPathUnits="userSpaceOnUse">
        <rect x={WING.door.x0 - 16} y={WING.door.y0} width={WING.door.x1 - WING.door.x0 + 32} height={WING.door.y1 - WING.door.y0 + 1} />
      </clipPath>
    </defs>
    <g clipPath="url(#s7doorclip)">{children}</g>
  </>
);

const hStaff = (feet: number) => 1.7 * kAt(Math.max(feet, 1000));

/** Staffer IN: walks up the steps to the doors (a back, walking away), through them 0.92, then left inside the lobby.
 *  Staffer OUT: from inside, out through the doors at ~2.95 and right along the top step (profile). */
function staffIn(t: number): {x: number; y: number; h: number; inside: boolean; view: 'back' | 'profile'; flip: boolean} | null {
  if (t < 0 || t > 1.9) return null;
  if (t < 0.92) {
    const u = t / 0.92;
    const y = lerp(1046, 993, u);
    return {x: lerp(846, 786, u), y, h: hStaff(y) * lerp(1, 0.98, u), inside: false, view: 'back', flip: false};
  }
  if (t < 1.3) {
    const u = (t - 0.92) / 0.38;
    return {x: lerp(786, 774, u), y: lerp(993, 984, u), h: hStaff(1000) * 0.95, inside: true, view: 'back', flip: false};
  }
  const u = (t - 1.3) / 0.6;
  return {x: lerp(772, 650, u), y: 984, h: hStaff(1000) * 0.95, inside: true, view: 'profile', flip: false};
}
function staffOut(t: number): {x: number; y: number; h: number; inside: boolean; view: 'back' | 'profile'; flip: boolean} | null {
  if (t < 2.44) return null;
  if (t < 2.96) {
    const u = (t - 2.44) / 0.52;
    return {x: lerp(724, 792, u), y: lerp(983, 991, u), h: hStaff(1000) * 0.95, inside: true, view: 'profile', flip: true};
  }
  const u = t - 2.96;
  const y = lerp(991, 1009, clamp01(u / 0.4));
  return {x: 792 + 112 * u, y, h: hStaff(y), inside: false, view: 'profile', flip: true};
}

const StaffFig: React.FC<{s: NonNullable<ReturnType<typeof staffIn>>; seed: string; traits: React.ComponentProps<typeof Person>['traits']; t: number}> = ({s, seed, traits, t}) => (
  <Person x={s.x} y={s.y} h={s.h} seed={seed} pose="walk" view={s.view} flip={s.flip} step={1.8 * (Math.floor(t * 12) / 12)} stride={strideFor(52, s.h, s.view === 'back' ? 'back' : 'profile')} traits={traits} exact />
);
const STAFF_A = {hair: 'bun', acc: 'tote', coat: CM.coatMustard} as const;
const STAFF_B = {hair: 'short', acc: 'strap', coat: CM.coatSlate} as const;

/** The staff seen through the door glass (the wing's behindDoor slot). */
export const S7StaffInside: React.FC = () => {
  const t = useTime();
  const a = staffIn(t);
  const b = staffOut(t);
  return (
    <DoorClip>
      {a && a.inside ? <StaffFig s={a} seed="s7/staffA" traits={STAFF_A} t={t} /> : null}
      {b && b.inside ? <StaffFig s={b} seed="s7/staffB" traits={STAFF_B} t={t} /> : null}
    </DoorClip>
  );
};
/** The staff outside (in front of the wing and its steps). */
export const S7StaffOutside: React.FC = () => {
  const t = useTime();
  const a = staffIn(t);
  const b = staffOut(t);
  return (
    <>
      {a && !a.inside ? <StaffFig s={a} seed="s7/staffA" traits={STAFF_A} t={t} /> : null}
      {b && !b.inside ? <StaffFig s={b} seed="s7/staffB" traits={STAFF_B} t={t} /> : null}
    </>
  );
};

// ---------------------------------------------------------------- people at rest: the steps, the cafe

/** Small seated figures on the wing's front steps (right of the doors), at rest: a cup, a phone, a book. */
export const S7StepSitters: React.FC = () => {
  const t = useTime();
  const h = 0.95 * kpAt(1030);
  const cup = clamp01((t - 3.3) / 0.5) * (1 - clamp01((t - 4.4) / 0.5));
  return (
    <>
      <Seated x={918} y={1022} h={h} seed="s7/step/a" phone side={-1} traits={{hair: 'lowBun', acc: 'scarf', coat: CM.box}} />
      <Seated x={966} y={1023} h={h * 0.96} seed="s7/step/b" cup={cup} traits={{hair: 'crop', acc: 'none', coat: CM.coatPlum}} />
      <Seated x={1076} y={1022} h={h * 1.02} seed="s7/step/c" read traits={{hair: 'beanie', acc: 'none', coat: CM.coatSlate}} />
    </>
  );
};

/** T1's two seated backs (in front of the far table, behind their chair hoops): a cup lifts and goes down. */
export const S7CafeT1People: React.FC = () => {
  const t = useTime();
  const [a, b] = CAFE.s1;
  const cupA = clamp01((t - 0.9) / 0.55) * (1 - clamp01((t - 2.95) / 0.55));
  return (
    <>
      <Seated x={a.x} y={a.seat} h={a.h} seed={a.seed} cup={cupA} side={1} traits={{hair: 'curls', acc: 'scarf', coat: CM.brickLight, broad: 0.98}} />
      <Seated x={b.x} y={b.seat} h={b.h} seed={b.seed} turn={Math.sin(Math.max(0, t - 3.6) * 1.4) * 0.5 * clamp01((t - 3.6) / 0.4)} traits={{hair: 'short', acc: 'backpack', coat: CM.coatMustard, broad: 0.96}} />
    </>
  );
};

/** T2's near head-backs, cut by the frame bottom (hv <= 150: the widest is <= ~140 px at the shoulders). */
export const S7CafeNearPeople: React.FC = () => {
  const t = useTime();
  const [a, b] = CAFE.near;
  const turnA = 0.55 * clamp01((t - 2.9) / 0.35) * (1 - clamp01((t - 4.1) / 0.35));
  return (
    <>
      <NearBack x={a.x} y={1920} hv={a.hv} seed={a.seed} turn={turnA} traits={{hair: 'lowBun', acc: 'scarf', coat: CM.sage, hairColor: CM.hair[1], broad: 0.98}} />
      <NearBack x={b.x} y={1920} hv={b.hv} seed={b.seed} traits={{hair: 'beanie', acc: 'none', coat: CM.coatPlum, hatColor: CM.coatMustard, broad: 0.95}} />
    </>
  );
};

/** Far tiny walkers beyond the west railing (fill only), in the column left of the board. */
export const S7FarWalkers: React.FC = () => {
  const t = useTime();
  const out: React.ReactNode[] = [];
  const far = [
    {x0: -30, v: 34, y: 996, h: 52, seed: 's7/far/w1'},
    {x0: 120, v: -28, y: 992, h: 48, seed: 's7/far/w2'},
  ];
  far.forEach((f) => {
    const span = 260;
    const x = -60 + frac((f.x0 + 60 + f.v * t) / span) * span;
    if (x > 92) return;
    out.push(<Person key={f.seed} x={x} y={f.y} h={f.h} seed={f.seed} pose="walk" view="profile" flip={f.v > 0} walk={{rate: 1.8}} exact />);
  });
  return <>{out}</>;
};

// ---------------------------------------------------------------- the fountain

/** Jet i's height (px) at t: a slow wave travelling right -> left along the row (rhythmic, calm). */
export const jetH = (i: number, t: number) => {
  const w = 0.5 + 0.5 * Math.sin((2 * Math.PI * t) / 2.6 - i * 0.78 + 0.6);
  return JETS.hMin + (JETS.hMax - JETS.hMin) * (0.25 + 0.75 * w * w);
};

/** The jets: flat columns of water (glass, a paper stripe on the lit side, water on the shade side), breaking at the
 *  top into falling drops; a splash ring at each nozzle. No ink on water. */
export const S7Jets: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  const y0 = JETS.y;
  JETS.xs.forEach((x, i) => {
    const H = jetH(i, t);
    const top = y0 - H;
    const lean = -5;
    const w0 = 7.5;
    const w1 = 4.2;
    b.poly(CM.glass, [[x - w0, y0], [x + w0, y0], [x + w1 + lean, top], [x - w1 + lean, top]]);
    b.poly(CM.paper, [[x - w0, y0], [x - w0 * 0.35, y0], [x - w1 * 0.3 + lean, top], [x - w1 + lean, top]]);
    b.poly(CM.water, [[x + w0 * 0.45, y0], [x + w0, y0], [x + w1 + lean, top + 6], [x + w1 * 0.4 + lean, top + 8]]);
    // the break at the top: a rounded cap and drops falling outward (a short loop per drop)
    b.fill(CM.paper, ovalPath(x + lean, top, w1 * 1.7, w1 * 1.2));
    for (let k = 0; k < 6; k++) {
      const per = 0.62 + 0.08 * k;
      const u = frac(t / per + k * 0.17 + i * 0.31);
      const side = k % 2 ? 1 : -1;
      const vx = side * (14 + 6 * (k % 3));
      const dx = vx * u * 2.2;
      const dy = -18 * u + 120 * u * u;
      const r = 3.2 - 1.4 * u;
      b.fill(k % 3 === 0 ? CM.paper : CM.glass, ovalPath(x + lean + dx, top + dy, r, r * 1.15));
    }
    // splash ring at the nozzle: a flat paper ellipse that breathes with the jet
    const sr = 13 + 6 * ((H - JETS.hMin) / (JETS.hMax - JETS.hMin));
    b.fill(CM.glass, ovalPath(x, y0 + 1, sr * 1.25, 4.4));
    b.fill(CM.paper, ovalPath(x - 2, y0, sr * 0.75, 2.6));
  });
  return <Paint b={b} seed="s7/jets" misreg={false} />;
};

/** The basin's moving water: ripple rings drifting from the nozzles, a few glints switching (low contrast). */
export const S7Water: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  JETS.xs.forEach((x, i) => {
    for (let k = 0; k < 2; k++) {
      const u = frac(t / 1.6 + k * 0.5 + i * 0.23);
      const R = 18 + 70 * u;
      b.fill(k ? CM.glass : CM.waterDeep, ovalPath(x + (k ? 6 : -4), JETS.y + 22 + 30 * u, R * 0.5, 2 + 2.5 * (1 - u)));
    }
  });
  // glints: short paper dashes that switch on a slow clock (one or two at a time)
  const r = rng('s7/glints');
  for (let i = 0; i < 9; i++) {
    const y = lerp(BASIN.farY + 60, BASIN.nearY - 20, r.next());
    const x = basinLeftAt(y) + 30 + r.next() * 380;
    const on = frac(t / r.range(1.1, 1.9) + r.next()) < 0.45;
    if (on) b.rect(CM.paper, x, y, r.range(14, 30), 2.4);
  }
  return <Paint b={b} seed="s7/water" misreg={false} />;
};

// ---------------------------------------------------------------- the festoons and the lamp run

/** Festoon A (the wing's west corner -> the right plane) and B (right plane -> off the right edge): off until the
 *  run on "principles", then bulb by bulb (BULB_STEP), then one twinkle at a time. */
export const S7Festoons: React.FC = () => (
  <>
    <StringLights from={FESTOON_A.from} to={FESTOON_A.to} sag={FESTOON_A.sag} n={FESTOON_A.n} seed="s7/festA" onAt={runAt('festoonA')} step={BULB_STEP} r={5.5} w={INK_PX.hair} />
    <StringLights from={FESTOON_B.from} to={FESTOON_B.to} sag={FESTOON_B.sag} n={FESTOON_B.n} seed="s7/festB" onAt={runAt('festoonB')} step={BULB_STEP} r={5.5} w={INK_PX.hair} />
  </>
);

/** The cafe tables' little lanterns (in the run). */
export const S7CafeLights: React.FC = () => {
  const t = useTime();
  const lit = t >= runAt('cafeLights');
  const b = new Batch();
  const lamp = (x: number, y: number, s: number) => {
    b.rect(CM.anchor, x - s * 0.5, y - s * 1.6, s, s * 0.25);
    b.rect(lit ? CM.lamp : CM.glass, x - s * 0.42, y - s * 1.35, s * 0.84, s * 1.2);
    if (lit) b.rect(CM.lampCore, x - s * 0.2, y - s * 1.1, s * 0.4, s * 0.7);
    b.rect(CM.anchor, x - s * 0.5, y - s * 0.16, s, s * 0.2);
  };
  lamp(CAFE.t1.x - 22, CAFE.t1.top + 4, 13);
  lamp(CAFE.t2.x - 44, CAFE.t2.top + 6, 19);
  return <Paint b={b} seed="s7/cafeLights" misreg={false} />;
};

// ---------------------------------------------------------------- leaves, smoke, steam, pigeons

/** Plane leaves falling from both crowns (born inside the crowns: draw before the crowns), drifting west a little,
 *  boxes kept clear of the board's face and the canopy's letters. */
export const S7FallingLeaves: React.FC = () => (
  <>
    <FallingLeaves box={[952, 846, 1090, 1078]} n={5} size={13} seed="s7/fallR" wind={-12} />
    <FallingLeaves box={[-20, 860, 92, 1090]} n={4} size={13} seed="s7/fallL" wind={-12} />
  </>
);

/** A leaf blowing across the near paving now and then (low, small). */
export const S7GroundLeaves: React.FC = () => {
  const t = useTime();
  const b = new Batch();
  const cols = [CM.leafGold, CM.leafRust, CM.coatMustard];
  for (let i = 0; i < 3; i++) {
    const per = 3.4 + i * 0.9;
    const u = frac(t / per + i * 0.37);
    const y0 = 1300 + i * 190;
    const x = 1120 - u * 1260;
    const hop = Math.abs(Math.sin(u * 14 + i)) * 10;
    const s = 0.1 * kAt(y0);
    b.fill(cols[i], leafPath(x, y0 - hop, s, s * 0.34, u * 900 + i * 40));
  }
  return <Paint b={b} seed="s7/groundLeaves" misreg={false} />;
};

/** Far chimney smoke in the west gap (left of the sun, never over it) and steam off the cafe's teapot and a cup. */
export const S7Smoke: React.FC = () => (
  <>
    <Puffs x={150} y={662} seed="s7/chim1" kind="smoke" scale={0.42} drift={-22} ceil={612} />
    <Puffs x={24} y={680} seed="s7/chim2" kind="smoke" scale={0.36} drift={-18} ceil={612} />
  </>
);
export const S7Steam: React.FC = () => (
  <>
    <Puffs x={CAFE.t2.x + 6} y={CAFE.t2.top - 24} seed="s7/teapot" kind="steam" scale={0.42} drift={-8} ceil={1520} />
    <Puffs x={CAFE.t1.x + 24} y={CAFE.t1.top - 16} seed="s7/cupT1" kind="steam" scale={0.26} drift={-6} ceil={1250} />
  </>
);

/** Pigeons: on the canopy's top (above the letters, never over them), on a sill, and two pecking near the basin. */
export const S7Pigeons: React.FC = () => (
  <>
    <Pigeons ledge={[700, 896, 754]} n={4} size={19} seed="s7/pg/canopy" shuffleAt={[0.1]} />
    <Pigeons ledge={[792, 872, 740]} n={2} size={15} seed="s7/pg/sill" />
  </>
);
export const S7GroundPigeons: React.FC = () => <Pigeons ledge={[790, 1010, 1868]} n={3} size={30} seed="s7/pg/ground" shuffleAt={[1.4, 3.6]} />;

// ---------------------------------------------------------------- the lit flags of the run

export const useRunLit = () => {
  const t = useTime();
  return {trees: t >= runAt('treeLights'), basin: t >= runAt('basinLights'), cafe: t >= runAt('cafeLights'), principles: t >= W7.principles};
};

export {TREE_L, TREE_R, domePath};
