// Crowd — rows of back-view people in perspective, filling in with staggered pops (far rows simplified).
//
//   <Crowd far={{y: 560, x0: 300, x1: 660, s: 0.28}} near={{y: 1040, x0: 90, x1: 870, s: 0.95}}
//          rows={8} at={1.0} span={2.5} order="back" signs={0.08} />
//   <Crowd ... limit={prog(t, 4, 2)} />    // animate growth by revealing more of the fill order
//
// y = hip line of the row. Draw order far -> near. Each person seeded `${seed}/${row}/${i}` (stable).

import React, {useMemo} from 'react';
import {rand, Seed} from '../rng';
import {Person, PersonProps} from './Person';
import {At} from './common';

export type CrowdRow = {y: number; x0: number; x1: number; s: number};

export type CrowdProps = {
  far: CrowdRow;
  near: CrowdRow;
  rows?: number;
  at?: At;
  /** Seconds over which everyone appears. Default 2.5. */
  span?: number;
  order?: 'random' | 'front' | 'back' | 'center' | 'left' | 'right';
  seed?: Seed;
  /** Fraction of slots filled (0..1). Default 0.92. */
  density?: number;
  /** Horizontal spacing in torso widths. Default 0.8 (shoulders overlap a little). */
  spacing?: number;
  /** Fraction of (mid/near) people holding placards. */
  signs?: number;
  /** Legs on the nearest N rows. Default 2. */
  legRows?: number;
  idle?: number;
  style?: 'color' | 'line';
  build?: 'pop' | 'rise' | 'draw' | 'fade';
  /** Show only the first `limit` fraction of the fill order (0..1). Default 1. */
  limit?: number;
  /** Extra props for every person. */
  person?: Partial<PersonProps>;
};

type Slot = {key: string; x: number; y: number; s: number; row: number; rank: number; sign: boolean; legs: boolean};

export const Crowd: React.FC<CrowdProps> = ({
  far,
  near,
  rows = 7,
  at,
  span = 2.5,
  order = 'random',
  seed = 'crowd',
  density = 0.92,
  spacing = 0.8,
  signs = 0,
  legRows = 2,
  idle = 1,
  style = 'color',
  build = 'pop',
  limit = 1,
  person,
}) => {
  const slots = useMemo(() => {
    const out: Slot[] = [];
    const ratio = near.s / far.s;
    const cx = (near.x0 + near.x1) / 2;
    const width = near.x1 - near.x0;
    for (let r = 0; r < rows; r++) {
      const u = rows === 1 ? 1 : r / (rows - 1);
      const s = far.s * Math.pow(ratio, u);
      const k = (s - far.s) / (near.s - far.s || 1);
      const y = far.y + (near.y - far.y) * k;
      const x0 = far.x0 + (near.x0 - far.x0) * k;
      const x1 = far.x1 + (near.x1 - far.x1) * k;
      const step = 92 * s * spacing;
      const n = Math.max(1, Math.floor((x1 - x0) / step));
      const off = (x1 - x0 - n * step) / 2 + (r % 2 ? step * 0.5 : 0);
      for (let i = 0; i < n + (r % 2 ? 0 : 1); i++) {
        const key = `${seed}/${r}/${i}`;
        if (rand(key, 'd') > density) continue;
        const x = x0 + off + i * step + (rand(key, 'x') - 0.5) * step * 0.35;
        if (x < x0 - step * 0.2 || x > x1 + step * 0.2) continue;
        const yy = y + (rand(key, 'y') - 0.5) * 8 * s;
        const jr = rand(key, 'o');
        const rank =
          order === 'front'
            ? rows - r + jr * 1.6
            : order === 'back'
              ? r + jr * 1.6
              : order === 'center'
                ? (Math.abs(x - cx) / width) * 6 + jr * 1.2
                : order === 'left'
                  ? ((x - near.x0) / width) * 6 + jr * 1.2
                  : order === 'right'
                    ? ((near.x1 - x) / width) * 6 + jr * 1.2
                    : jr;
        out.push({key, x, y: yy, s: s * (0.94 + rand(key, 's') * 0.12), row: r, rank, sign: s > 0.35 && rand(key, 'sg') < signs, legs: r >= rows - legRows});
      }
    }
    const sorted = out.slice().sort((a, b) => a.rank - b.rank);
    const idx = new Map(sorted.map((sl, i) => [sl.key, i]));
    return out.map((sl) => ({...sl, rank: idx.get(sl.key)! / Math.max(1, out.length - 1)}));
  }, [far.y, far.x0, far.x1, far.s, near.y, near.x0, near.x1, near.s, rows, seed, density, spacing, signs, legRows, order]);

  return (
    <>
      {slots.map((sl) => {
        if (sl.rank > limit + 1e-9) return null;
        const lod = sl.s < 0.3 ? 2 : sl.s < 0.5 ? 1 : 0;
        return (
          <Person
            key={sl.key}
            seed={sl.key}
            x={sl.x}
            y={sl.y}
            s={sl.s}
            lod={lod}
            legs={sl.legs}
            style={style}
            build={build}
            at={at === undefined ? undefined : at + sl.rank * span}
            idle={idle * sl.s}
            acc={sl.sign ? ['sign'] : undefined}
            {...person}
          />
        );
      })}
    </>
  );
};
