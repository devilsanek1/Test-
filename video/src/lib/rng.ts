// rng.ts — deterministic randomness (never use Math.random in this project).
//
//   const r = rng('facade-3');
//   r.range(4, 12); r.int(0, 3); r.pick(['a', 'b']); r.chance(0.2); r.jitter(2);
//   const sub = r.fork('windows');   // independent stream, stable when other draws change

import {random} from 'remotion';

export type Seed = string | number;

export class Rng {
  private i = 0;
  constructor(public readonly seed: Seed) {}
  /** [0, 1) */
  next(): number {
    return random(`${this.seed}#${this.i++}`);
  }
  range(a: number, b: number): number {
    return a + (b - a) * this.next();
  }
  /** Integer in [a, b] inclusive. */
  int(a: number, b: number): number {
    return Math.floor(this.range(a, b + 1 - 1e-9));
  }
  /** Uniform in [-amount, amount]. */
  jitter(amount: number): number {
    return (this.next() * 2 - 1) * amount;
  }
  sign(): 1 | -1 {
    return this.next() < 0.5 ? -1 : 1;
  }
  chance(p: number): boolean {
    return this.next() < p;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(this.next() * arr.length) % arr.length];
  }
  /** Weighted pick: items [[value, weight], ...]. */
  weighted<T>(items: readonly (readonly [T, number])[]): T {
    const total = items.reduce((s, [, w]) => s + w, 0);
    let x = this.next() * total;
    for (const [v, w] of items) {
      if ((x -= w) <= 0) return v;
    }
    return items[items.length - 1][0];
  }
  /** Deterministic shuffle (returns a new array). */
  shuffle<T>(arr: readonly T[]): T[] {
    const out = arr.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }
  fork(sub: Seed): Rng {
    return new Rng(`${this.seed}/${sub}`);
  }
}

export const rng = (seed: Seed) => new Rng(seed);

/** One-off deterministic value in [0,1) for (seed, key). */
export const rand = (seed: Seed, key: Seed = 0) => random(`${seed}#k${key}`);
