// Crowd — rows of back-view people in perspective, filling in with staggered pops / rises. Layered by depth with the
// style bible's ink ladder: front rows 4.8 px, mid 3.4, far 2.2, and the farthest rows are FILL-ONLY blobs (no ink).
//
//   <Crowd far={{y: 560, x0: 300, x1: 660, s: 0.28}} near={{y: 1040, x0: 90, x1: 870, s: 0.95}}
//          rows={8} at={1.0} span={2.5} order="back" signs={0.08} />
//   <Crowd ... limit={prog(t, 4, 2)} />    // animate growth by revealing more of the fill order
//   <Crowd ... jitter={{x: 0.3, y: 0.15, scale: [0.6, 1.1]}} rim="left" />   // an organic queue (ref 2), rim-lit
//   <Crowd eye={{horizon: 768}} far={{y: 792, x0: 566, x1: 580}} near={{y: 1250, x0: 660, x1: 950}} />
//        // EYE-LEVEL rows (ref 2: the viewer feels small): y = the FEET line, every scale comes from the camera
//        // (camera = 1.1 x person height: all heads hug the horizon); see persp.tsx eyeLevel()
//
// y = hip line of the row (eye mode: the feet line). Draw order far -> near. Each person seeded `${seed}/${row}/${i}`.
// build 'rise': a person rises from behind its feet line only when something HIDES the entry (the row in front has
// already risen, or the front row stands at the frame bottom / `occluded`); everyone else pops (motion spec #16:
// nobody sprouts out of bare pavement).

import React, {useMemo} from 'react';
import {rand, Seed} from '../rng';
import {Person, PersonProps} from './Person';
import {At} from './common';
import {depthInk, world} from '../theme';
import {MOTION} from '../spec';
import {eyeLevel, PERSON_LEG_H} from '../persp';

/** A row: y = hip line (eye mode: FEET line), x0..x1 = its extent, s = person scale (ignored in eye mode). */
export type CrowdRow = {y: number; x0: number; x1: number; s?: number};

export type CrowdProps = {
  far: CrowdRow;
  near: CrowdRow;
  rows?: number;
  at?: At;
  /** Seconds over which everyone appears. Default 2.5. */
  span?: number;
  /** Fill order. Default 'random'; 'front' for build 'rise'. 'back' + 'rise' needs an occluder: rows whose front
   *  row is not standing yet POP instead of rising (see the header). */
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
  /** 'fade' is @deprecated (a 1-frame pop: nothing fades). */
  build?: 'pop' | 'rise' | 'draw' | /** @deprecated = 'pop' without the spring */ 'fade';
  /** Show only the first `limit` fraction of the fill order (0..1). Default 1. */
  limit?: number;
  /** Extra props for every person. */
  person?: Partial<PersonProps>;
  /** 'depth' (default): on-screen ink by row scale (depthInk front/mid/far, none for the far blobs); or a fixed px. */
  ink?: 'depth' | number;
  /** Organic placement (reference 2's queue, not a marching formation): x = fraction of the slot step, y = fraction of
   *  the row gap, scale = [min, max] size multiplier skewed toward 1 (a few children, some tall adults; feet stay on the
   *  ground). Default {x: 0.175, y: 0, scale: [0.94, 1.06]}. */
  jitter?: {x?: number; y?: number; scale?: [number, number]};
  /** Rim light (Person `rim`) for people with s >= 0.6. Default false. */
  rim?: 'left' | 'right' | false;
  /** People at or above this scale get Person's hero detail (sleeves, hands, hood). Default 0.7. */
  heroFrom?: number;
  /** EYE-LEVEL camera: rows' y are FEET lines and every scale follows from the camera (persp.tsx eyeLevel: camera at
   *  `ratio` x person height, default 1.1 = reference 2), so all heads sit in a band just under the horizon. Legs on
   *  every row by default. */
  eye?: {horizon: number; ratio?: number};
  /** build 'rise': the FRONT row's entry is hidden by a foreground element, so it may rise too (default: the front
   *  row pops unless its feet are at the frame bottom). */
  occluded?: boolean;
};

/** On-screen ink weight for a figure drawn at scale s (style bible 3/6): 4.8 front, 3.4 mid, 2.2 far, 0 = fill-only. */
export const crowdInk = (s: number) => (s >= 0.75 ? depthInk.front : s >= 0.45 ? depthInk.mid : s >= 0.28 ? depthInk.far : 0);
/** Level of detail for a figure at scale s. */
export const crowdLod = (s: number): 0 | 1 | 2 => (s < 0.28 ? 2 : s < 0.45 ? 1 : 0);

type Slot = {key: string; x: number; y: number; s: number; row: number; rank: number; sign: boolean; legs: boolean};

export const Crowd: React.FC<CrowdProps> = ({
  far: farIn,
  near: nearIn,
  rows = 7,
  at,
  span = 2.5,
  order: orderIn,
  seed = 'crowd',
  density = 0.92,
  spacing = 0.8,
  signs = 0,
  legRows,
  idle = 1,
  style = 'color',
  build = 'pop',
  limit = 1,
  person,
  ink = 'depth',
  jitter,
  rim = false,
  heroFrom = 0.7,
  eye,
  occluded = false,
}) => {
  // rise builds fill FRONT -> back by default: each row rises behind the row already standing in front of it
  const order = orderIn ?? (build === 'rise' ? 'front' : 'random');
  const jx = jitter?.x ?? 0.175;
  const jy = jitter?.y ?? 0;
  const [sm0, sm1] = jitter?.scale ?? [0.94, 1.06];
  // eye mode: rows' y are feet lines; derive (hip y, s) from the camera
  const cam = eye ? eyeLevel({horizon: eye.horizon, ratio: eye.ratio}) : null;
  const rowOf = (r: CrowdRow): Required<CrowdRow> => (cam ? {x0: r.x0, x1: r.x1, s: cam.s(r.y), y: cam.hip(r.y)} : {...r, s: r.s ?? 1});
  const farR = rowOf(farIn);
  const nearR = rowOf(nearIn);
  const far = farR;
  const near = nearR;
  const legRowsN = legRows ?? (eye ? rows : 2);
  const slots = useMemo(() => {
    const out: Slot[] = [];
    const ratio = near.s / far.s;
    const cx = (near.x0 + near.x1) / 2;
    const width = near.x1 - near.x0;
    const rowY = (r: number) => {
      const s = far.s * Math.pow(ratio, rows === 1 ? 1 : r / (rows - 1));
      return far.y + (near.y - far.y) * ((s - far.s) / (near.s - far.s || 1));
    };
    for (let r = 0; r < rows; r++) {
      const u = rows === 1 ? 1 : r / (rows - 1);
      const s = far.s * Math.pow(ratio, u);
      const k = (s - far.s) / (near.s - far.s || 1);
      const y = far.y + (near.y - far.y) * k;
      const gap = rows === 1 ? 0 : r > 0 ? y - rowY(r - 1) : rowY(1) - y;
      const x0 = far.x0 + (near.x0 - far.x0) * k;
      const x1 = far.x1 + (near.x1 - far.x1) * k;
      const step = 92 * s * spacing;
      const n = Math.max(1, Math.floor((x1 - x0) / step));
      const off = (x1 - x0 - n * step) / 2 + (r % 2 ? step * 0.5 : 0);
      for (let i = 0; i < n + (r % 2 ? 0 : 1); i++) {
        const key = `${seed}/${r}/${i}`;
        if (rand(key, 'd') > density) continue;
        const x = x0 + off + i * step + (rand(key, 'x') - 0.5) * step * 2 * jx;
        if (x < x0 - step * 0.2 || x > x1 + step * 0.2) continue;
        const m = sm0 + (sm1 - sm0) * Math.pow(rand(key, 's'), jitter?.scale ? 0.35 : 1);
        // feet stay on the ground: a smaller person's hip line sits lower
        const yy = y + (rand(key, 'y') - 0.5) * (jy ? 2 * jy * gap : 8 * s) + 62 * s * (1 - m);
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
        out.push({key, x, y: yy, s: s * m, row: r, rank, sign: s > 0.35 && rand(key, 'sg') < signs, legs: r >= rows - legRowsN});
      }
    }
    const sorted = out.slice().sort((a, b) => a.rank - b.rank);
    const idx = new Map(sorted.map((sl, i) => [sl.key, i]));
    // draw far -> near by the feet line (jittered rows interleave)
    return out.map((sl) => ({...sl, rank: idx.get(sl.key)! / Math.max(1, out.length - 1)})).sort((a, b) => a.y - b.y);
  }, [far.y, far.x0, far.x1, far.s, near.y, near.x0, near.x1, near.s, rows, seed, density, spacing, signs, legRowsN, order, jx, jy, sm0, sm1]);

  // rise only where the entry is hidden: the row in front has (mostly) risen already, or the front row stands at the
  // frame bottom / behind a foreground element (`occluded`). Everyone else pops (no people sprouting from pavement).
  const riseOk = useMemo(() => {
    const ok = new Map<string, boolean>();
    if (build !== 'rise' || at === undefined) return ok;
    const rowStart = new Map<number, number>();
    for (const sl of slots) rowStart.set(sl.row, Math.min(rowStart.get(sl.row) ?? Infinity, sl.rank * span));
    const frontRow = Math.max(...slots.map((sl) => sl.row));
    const frontFeet = near.y + (eye ? PERSON_LEG_H * near.s : 0);
    for (const sl of slots) {
      const mine = sl.rank * span;
      if (sl.row === frontRow) ok.set(sl.key, occluded || frontFeet >= world.h - 8);
      else {
        // the nearest row in front that has people
        let r = sl.row + 1;
        while (r <= frontRow && !rowStart.has(r)) r++;
        const front = rowStart.get(r);
        ok.set(sl.key, front !== undefined && front + MOTION.rise.dur * 0.6 <= mine);
      }
    }
    return ok;
  }, [slots, build, at, span, occluded, near.y, near.s, eye]);

  return (
    <>
      {slots.map((sl) => {
        if (sl.rank > limit + 1e-9) return null;
        const lod = crowdLod(sl.s);
        const w = ink === 'depth' ? crowdInk(sl.s) : ink;
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
            build={build === 'rise' && !riseOk.get(sl.key) ? 'pop' : build}
            at={at === undefined ? undefined : at + sl.rank * span}
            idle={idle * sl.s}
            acc={sl.sign ? ['sign'] : undefined}
            ink={w}
            hero={lod === 0 && sl.s >= heroFrom}
            rim={rim && sl.s >= 0.6 ? rim : false}
            {...person}
          />
        );
      })}
    </>
  );
};
