// HAIR v4: the springs. Each bone chain is a row of joints integrated with Verlet at 240 Hz, the root pinned to the head.
// Every joint is pulled by three springs (RESEARCH.md §1): STRENGTH, the bone back to its animated ABSOLUTE direction
// (like gravity on a pendulum: a sideways load tilts the chain as a whole); SHAPE, the bone to its rest angle relative to
// its simulated parent (keeps the drawn curve; forward kinematics on the parent, so motion runs root to tip: lag, overlap,
// follow-through); ELASTICITY, a weak pull toward the animated pose. Plus the air (drag toward the wind's velocity) and
// gravity's bounded turn back toward plumb when the head tilts; damping acts on the motion relative to the parent; then
// the chain is kept inextensible and every joint inside its bend limit. A change of drawing (the yaw keyform morph) is
// felt only in part (Spine's inertia). The authored shape is the equilibrium of an upright head in still air, so a still
// frame is the drawing (Spine 4.2 physics constraints, Live2D's pendulums, Dynamic Bone's elasticity/stiffness).
// Units: figure-local (H = 1000 from crown to sole, ~1.7 m: 1 m ~ 590 units), seconds.
import {type V2, add, sub, mul, len} from './bez';
import type {Spring} from './cut';
import type {HeadFrame} from '../graphic_faces/head';

/** The head over time, as the assembler animates it, and the air. */
export type MotionState = {
  /** seconds since the motion began */
  t: number;
  /** a cache key that names this motion (the same key = the same head track and wind) */
  key: string;
  /** the head frame at a time (figure-local; its yaw drives the 3/4 <-> profile morph) */
  head: (t: number) => HeadFrame;
  /** the air's velocity at a time (figure-local units per second, screen axes); a walk adds its own headwind */
  wind?: (t: number) => V2;
};

/** Per chain: its rest joints (figure-local) for a head frame (and a morph between the drawings, default the head's
 *  own), and multipliers (an accent strand is lighter). */
export type SimSpec = {
  rest: (hf: HeadFrame, s?: number) => V2[][];
  morph: (hf: HeadFrame) => number;
  mult: {k: number; air: number; damp: number}[];
  spring: Spring;
};
/** How much of a change of DRAWING (the 3/4 -> profile keyform morph) the springs feel as motion; the rest of it the
 *  hair follows at once (Spine's "inertia"). The head's own motion (moving, tilting) is felt in full. */
const MORPH_INERTIA = 0.42;

const DT = 1 / 240;
const ang = (v: V2) => Math.atan2(v[1], v[0]);
const wrapA = (a: number) => {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
};
const rotV = (v: V2, a: number): V2 => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];

type State = {x: V2[][]; xp: V2[][]; s?: number};

function step(spec: SimSpec, st: State, hf: HeadFrame, W: V2, tNow: number) {
  const sNow = spec.morph(hf);
  const R = spec.rest(hf, sNow);
  if (st.s !== undefined && Math.abs(sNow - st.s) > 1e-6) {
    // the drawing changed: carry most of the change straight through (positions and their history alike)
    const Rold = spec.rest(hf, st.s);
    for (let c = 0; c < R.length; c++) {
      for (let i = 0; i < R[c].length; i++) {
        const dx = (R[c][i][0] - Rold[c][i][0]) * (1 - MORPH_INERTIA);
        const dy = (R[c][i][1] - Rold[c][i][1]) * (1 - MORPH_INERTIA);
        st.x[c][i] = [st.x[c][i][0] + dx, st.x[c][i][1] + dy];
        st.xp[c][i] = [st.xp[c][i][0] + dx, st.xp[c][i][1] + dy];
      }
    }
  }
  st.s = sNow;
  const sp = spec.spring;
  const r = (hf.rot * Math.PI) / 180;
  // gravity: when the head tilts, the authored hang tilts with it; the hanging bones turn back toward plumb, a share
  // of the tilt per bone so the tip comes back by grav x the tilt (bounded: never more than the tilt itself)
  const lim = (sp.limit * Math.PI) / 180;
  for (let c = 0; c < R.length; c++) {
    const Rc = R[c];
    const x = st.x[c];
    const xp = st.xp[c];
    const m = spec.mult[c] ?? {k: 1, air: 1, damp: 1};
    const n = Rc.length - 1;
    const nx: V2[] = x.map((q) => [q[0], q[1]] as V2);
    nx[0] = Rc[0];
    // the animated pose with gravity's plumb turn (the elasticity's target)
    const Gc: V2[] = [Rc[0]];
    for (let i = 1; i <= n; i++) Gc.push(add(Gc[i - 1], rotV(sub(Rc[i], Rc[i - 1]), -(sp.grav * r * i) / n)));
    const el = (sp.elastic ?? sp.k * 0.08) * m.k;
    // a touch of turbulence per chain (a small phase offset keeps neighbours in one flow)
    const ph = 0.6 * c;
    const turb = 1 + 0.12 * Math.sin(tNow * 5.3 + ph) + 0.06 * Math.sin(tNow * 11.7 + ph * 1.7);
    for (let i = 1; i <= n; i++) {
      const v = sub(x[i], xp[i]);
      const bone = sub(Rc[i], Rc[i - 1]);
      // the shape spring: the bone at its rest angle relative to the simulated parent
      const dth = i >= 2 ? wrapA(ang(sub(x[i - 1], x[i - 2])) - ang(sub(Rc[i - 1], Rc[i - 2]))) : 0;
      const tgtS = add(x[i - 1], rotV(bone, dth - (sp.grav * r) / n));
      // the strength spring: the bone at its ANIMATED absolute direction (with gravity's plumb turn), from the parent
      const tgtA = add(x[i - 1], rotV(bone, -(sp.grav * r * i) / n));
      const tp = Math.pow(sp.taper, (i - 1) / Math.max(1, n - 1));
      const kA = sp.k * m.k * tp;
      const kS = (sp.shape ?? sp.k * 0.4) * m.k * tp;
      const vel = mul(v, 1 / DT);
      const drag = 1.2 * sp.air * m.air * (0.55 + 0.45 * (i / n));
      const e = el * (1 - 0.6 * (i / n));
      const a: V2 = [
        kA * (tgtA[0] - x[i][0]) + kS * (tgtS[0] - x[i][0]) + e * (Gc[i][0] - x[i][0]) + drag * (W[0] * turb - vel[0]),
        kA * (tgtA[1] - x[i][1]) + kS * (tgtS[1] - x[i][1]) + e * (Gc[i][1] - x[i][1]) + drag * (W[1] * turb - vel[1]),
      ];
      // damping acts on the motion RELATIVE to the parent (a steady walk is not braked; only swinging is)
      const vp = sub(x[i - 1], xp[i - 1]);
      const damp = Math.max(0, 1 - sp.damp * m.damp * DT);
      nx[i] = [x[i][0] + vp[0] + (v[0] - vp[0]) * damp + a[0] * DT * DT, x[i][1] + vp[1] + (v[1] - vp[1]) * damp + a[1] * DT * DT];
    }
    // inextensible, and inside the bend limits (relative to the parent: the head for the first bone)
    for (let i = 1; i <= n; i++) {
      const L = len(sub(Rc[i], Rc[i - 1]));
      let d = sub(nx[i], nx[i - 1]);
      const l = len(d) || 1e-6;
      d = mul(d, L / l);
      const restRel = i >= 2 ? wrapA(ang(sub(Rc[i], Rc[i - 1])) - ang(sub(Rc[i - 1], Rc[i - 2]))) : 0;
      const parentA = i >= 2 ? ang(sub(nx[i - 1], nx[i - 2])) : ang(sub(Rc[1], Rc[0]));
      const rel = i >= 2 ? wrapA(ang(d) - parentA) : wrapA(ang(d) - parentA);
      const want = (i >= 2 ? restRel : 0) - (sp.grav * r) / n;
      const dev = wrapA(rel - want);
      if (Math.abs(dev) > lim) {
        const fix = Math.sign(dev) * lim - dev;
        d = rotV(d, fix);
      }
      nx[i] = add(nx[i - 1], d);
    }
    st.xp[c] = x;
    st.x[c] = nx;
  }
}

/** Simulation results, cached per (spec key, motion key): the joints at every 1/60 s. */
const CACHE = new Map<string, {frames: V2[][][]; st: State; t: number}>();
const FPS = 60;

/** The chains' joints at time m.t for this spec (figure-local). The motion starts settled: a 1.5 s pre-roll holds the
 *  head at its first pose so gravity's hang is reached before t = 0. */
export function simulate(specKey: string, spec: SimSpec, m: MotionState): V2[][] {
  const key = `${specKey}|${m.key}`;
  let e = CACHE.get(key);
  if (!e) {
    const hf0 = m.head(0);
    const R0 = spec.rest(hf0);
    const st: State = {x: R0.map((c) => c.map((q) => [q[0], q[1]] as V2)), xp: R0.map((c) => c.map((q) => [q[0], q[1]] as V2))};
    const W0 = m.wind ? m.wind(0) : ([0, 0] as V2);
    for (let i = 0; i < 1.5 / DT; i++) step(spec, st, hf0, W0, -1.5 + i * DT);
    e = {frames: [st.x.map((c) => c.map((q) => [q[0], q[1]] as V2))], st, t: 0};
    CACHE.set(key, e);
  }
  const want = Math.max(0, Math.round(m.t * FPS));
  const sub4 = Math.round(1 / FPS / DT);
  while (e.frames.length <= want) {
    for (let s = 0; s < sub4; s++) {
      e.t += DT;
      const hf = m.head(e.t);
      step(spec, e.st, hf, m.wind ? m.wind(e.t) : [0, 0], e.t);
    }
    e.frames.push(e.st.x.map((c) => c.map((q) => [q[0], q[1]] as V2)));
  }
  return e.frames[want];
}

/** The settled hang for a still head (no motion): the drawing, with gravity's pull when the head is tilted. */
export function settle(specKey: string, spec: SimSpec, hf: HeadFrame): V2[][] {
  const k = `${specKey}|still|${hf.c[0].toFixed(1)},${hf.c[1].toFixed(1)},${hf.rot.toFixed(2)},${hf.yaw.toFixed(1)},${hf.s.toFixed(1)}`;
  return simulate(k, spec, {t: 0, key: 'still', head: () => hf});
}
