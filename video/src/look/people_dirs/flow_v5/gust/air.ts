// FLOW v5, GUST: ONE wind per shot. It drives every free edge of a person: the hair ribbons, the hem points, a coat's
// back panel, a belt's tails. The body never moves with it (a calm body, living edges).
//
// How an edge feels the wind: each free element is a damped spring driven by the wind's strength, a little LATE (the
// root first, the tip later: a gust travels down a ribbon), with its own natural frequency (a short hem is quick and
// stiff, a long ribbon slow and loose), so a gust lifts the edges, they overshoot a touch and settle (follow-through).
// On top, a flutter: two travelling waves of incommensurate periods, growing toward the tip, scaled by what is felt.
// Everything is a pure function of time (the response is integrated once per wind track and cached), so any frame
// can be rendered alone, in any order, and two renders of a frame are identical: nothing jitters, nothing pops.
export type Wind = {
  /** names this wind track (the response cache's key) */
  key: string;
  /** the direction it blows to, screen degrees (0 = to the screen right, -90 = up) */
  dir: number;
  /** its strength at time t (0 still air, 1 the designed streaming shape, above 1 a gust) */
  s: (t: number) => number;
};

/** A steady wind with a slow living swell (never a dead constant). */
export function breeze(key: string, base = 1, dir = 0, swell = 0.07): Wind {
  return {key, dir, s: (t) => base * (1 + swell * Math.sin(2 * Math.PI * (t / 3.1 + 0.2)) + swell * 0.6 * Math.sin(2 * Math.PI * (t / 1.7 + 0.55)))};
}

/** A smooth bump: 0 before t0, rising to 1 at t0 + rise, back to 0 by t0 + rise + fall. */
export function bump(t: number, t0: number, rise: number, fall: number): number {
  if (t <= t0) return 0;
  if (t < t0 + rise) {
    const u = (t - t0) / rise;
    return u * u * (3 - 2 * u);
  }
  if (t < t0 + rise + fall) {
    const u = (t - t0 - rise) / fall;
    return 1 - u * u * (3 - 2 * u);
  }
  return 0;
}

/** A base wind with one gust passing. */
export function gusty(key: string, base: number, gust: number, t0: number, rise: number, fall: number, dir = 0): Wind {
  const b = breeze(key, base, dir, 0.05);
  return {key, dir, s: (t) => b.s(t) + gust * bump(t, t0, rise, fall)};
}

const DT = 1 / 240;
const T0 = -4;
const CACHE = new Map<string, Float64Array>();

/** What an element feels at time t: the wind's strength through a damped spring (natural frequency f Hz, damping
 *  ratio z), `delay` seconds late. Starts settled at the wind's strength 4 s before t = 0. */
export function felt(w: Wind, f: number, z: number, delay: number, t: number): number {
  const key = `${w.key}|${f.toFixed(3)}|${z.toFixed(3)}`;
  const tt = t - delay;
  const want = Math.max(0, Math.ceil((tt - T0) / DT) + 1);
  let arr = CACHE.get(key);
  if (!arr || arr.length <= want) {
    const n = Math.max(want + 1, arr ? arr.length * 2 : Math.ceil((8 - T0) / DT));
    const out = new Float64Array(n);
    const om = 2 * Math.PI * f;
    let x = w.s(T0);
    let v = 0;
    for (let i = 0; i < n; i++) {
      out[i] = x;
      const u = w.s(T0 + i * DT);
      // semi-implicit Euler (stable at these rates)
      v += (om * om * (u - x) - 2 * z * om * v) * DT;
      x += v * DT;
    }
    arr = out;
    CACHE.set(key, arr);
  }
  const fi = (tt - T0) / DT;
  if (fi <= 0) return arr[0];
  const i = Math.floor(fi);
  const r = fi - i;
  return arr[i] * (1 - r) + arr[Math.min(arr.length - 1, i + 1)] * r;
}

/** The flutter at a point u (0 root .. 1 tip) of a free element: two travelling waves, incommensurate periods, a
 *  per-element phase; returns about -1..1 (scale it by the felt strength and the element's amplitude). */
export function flutter(t: number, u: number, seed: number, T1 = 0.95, T2 = 2.3, lag = 0.85): number {
  const a = Math.sin(2 * Math.PI * (t / T1 - lag * u) + seed * 1.7);
  const b = Math.sin(2 * Math.PI * (t / T2 - 0.4 * u) + seed * 2.9 + 1.3);
  const c = Math.sin(2 * Math.PI * (t / (T1 * 0.61) - lag * 1.3 * u) + seed * 0.7 + 2.1);
  return 0.62 * a + 0.26 * b + 0.12 * c;
}
