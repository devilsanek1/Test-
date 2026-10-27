// K4 cast: THE GHOSTS (TREATMENT section 3; map.ts section 6 S1_ROW / s1RowAt / GHOST_POP; S8.ghosts).
// Six outline copies of her: paper fill, the same coat cut and bun, EVERY figure whole; the ONE closed outline of the
// film (2.2 px). Age reads by the whole-head value only: G1 dark plum (her, now) -> G2 mid grey -> G3 grey-silver ->
// G4 silver + a scarf -> G5-G6 white-silver + scarf + a shorter stride; from G4 a slightly softer back. Ageing stops
// there: no stoop, no stick, no bag, nothing frail. The three bare outlines (O1-O3) are ink only: no fill, no age cue.
// They walk in lockstep with her (pass HER step count); the world passes through them unaware.
//
//   <Ghost age={3} x={333} y={1077} h={151} step={step} at={3.2} />     // pops: outline 0.10 s, fill 2 f later, 4-f settle
//   <BareOutline x={138} y={1062} h={130} step={step} at={4.97} />
//   <GhostRow t={t} step={step} />                                       // S1: every member placed by map.ts s1RowAt(t)
//   <S8Ghosts dx={-240} />                                                // S8: three ghosts with G4-G6's cues (pre-truck dx)

import React from 'react';
import {useTime} from '../../../lib/time';
import {CM} from '../../palette';
import {GHOST_POP, S1_ROW, s1RowAt, S8} from '../../world/map';
import {Model, View} from './body';
import {HER} from './Her';
import {Person} from './People';

/** The ghost model at an age 1..6 (G1-G6). */
export function ghostModel(age: number): Partial<Model> {
  const a = Math.max(1, Math.min(6, Math.round(age)));
  const head = CM.ghostHead[a - 1];
  return {
    ...HER,
    paper: CM.ghostPaper,
    headFill: head,
    hairColor: head,
    closed: true,
    tote: undefined,
    plant: false,
    scarf: a >= 4 ? CM.ghostPaper : undefined,
    soft: a >= 4 ? (a - 3) / 3 : 0,
    cheek: false,
    vent: true,
  };
}

/** Stride factor by age: G5-G6 a shorter stride (same cadence: lockstep). */
export const ghostStride = (age: number) => (age >= 5 ? 0.68 : age >= 4 ? 0.84 : 1);

export type GhostProps = {
  /** Feet (canvas px). */
  x: number;
  y: number;
  h: number;
  /** 1..6 (G1-G6). */
  age: number;
  /** Her step count (lockstep). Omit = standing. */
  step?: number;
  /** Her stride factor; the ghost multiplies it by its age's factor. */
  stride?: number;
  /** Default rear34 (walking away-left down the towpath, like her). */
  view?: View;
  flip?: boolean;
  /** Pop time: the outline draws in 0.10 s, the paper fill 2 frames later, a 4-frame scale settle. */
  at?: number;
  seed?: string;
};

export const Ghost: React.FC<GhostProps> = ({x, y, h, age, step, stride = 1, view = 'rear34', flip, at, seed}) => (
  <Person
    x={x}
    y={y}
    h={h}
    exact
    seed={seed ?? `ghost${age}`}
    traits={HER}
    model={ghostModel(age)}
    pose={step !== undefined ? 'walk' : 'stand'}
    step={step}
    stride={stride * ghostStride(age)}
    view={view}
    flip={flip}
    ink={CM.ghostInkPx}
    at={at}
    fillLag={at === undefined ? undefined : GHOST_POP.outlineS + GHOST_POP.fillDelayF / 60}
    inkOrder="all"
    inkDur={GHOST_POP.outlineS}
    fillMode="snap"
    settle={at !== undefined}
    lod={0}
  />
);

export type BareOutlineProps = Omit<GhostProps, 'age'>;

/** A bare ink outline of her (no fill, no age cues, whole): the row goes on. */
export const BareOutline: React.FC<BareOutlineProps> = ({x, y, h, step, stride = 1, view = 'rear34', flip, at, seed = 'outline'}) => (
  <Person
    x={x}
    y={y}
    h={h}
    exact
    seed={seed}
    traits={HER}
    model={{...HER, paper: CM.ghostPaper, headFill: CM.ghostPaper, closed: true, tote: undefined, plant: false, cheek: false}}
    knockout
    pose={step !== undefined ? 'walk' : 'stand'}
    step={step}
    stride={stride}
    view={view}
    flip={flip}
    ink={CM.ghostInkPx}
    at={at}
    inkOrder="all"
    inkDur={GHOST_POP.outlineS}
    settle={at !== undefined}
    lod={0}
  />
);

export type GhostRowProps = {
  /** Film time (S1 starts at 0, so scene time = film time). Default: the scene clock. */
  t?: number;
  /** Her step count (the row walks in lockstep). */
  step?: number;
  /** Her stride factor (pass the same one you give <Her>). */
  stride?: number;
  /** Map a zoom-1.00 screen point to the shot's screen (the S1 pull-out: map.ts s1Screen); default identity. */
  toScreen?: (p: {x: number; y: number}, t: number) => {x: number; y: number};
  /** Draw only these members (default the six ghosts and the three outlines; her is the lane's <Her>). */
  ids?: string[];
};

/** S1's row: G1-G6 and O1-O3 placed, sized and popped by map.ts (s1RowAt, S1_ROW pop times). Every figure whole. */
export const GhostRow: React.FC<GhostRowProps> = ({t: tIn, step, stride = 1, toScreen, ids}) => {
  const tScene = useTime();
  const t = tIn ?? tScene;
  const poses = s1RowAt(t);
  const out: React.ReactNode[] = [];
  S1_ROW.forEach((m, i) => {
    if (m.kind === 'her') return;
    if (ids && !ids.includes(m.id)) return;
    const p = poses[i];
    if (!p.visible) return;
    const s = toScreen ? toScreen({x: p.x, y: p.feetY}, t) : {x: p.x, y: p.feetY};
    const zoomK = toScreen ? toScreen({x: p.x, y: p.feetY - p.h}, t) : null;
    const h = zoomK ? s.y - zoomK.y : p.h;
    if (m.kind === 'ghost') {
      const age = Number(m.id.slice(1));
      out.push(<Ghost key={m.id} seed={`s1/${m.id}`} x={s.x} y={s.y} h={h} age={age} step={step} stride={stride} at={m.popT ?? undefined} />);
    } else {
      out.push(<BareOutline key={m.id} seed={`s1/${m.id}`} x={s.x} y={s.y} h={h} step={step} stride={stride} at={m.popT ?? undefined} />);
    }
  });
  // far members first (smaller, behind), her side last
  return <>{out.reverse()}</>;
};

export type S8GhostsProps = {
  /** Pop time (default 33.78, "can't"; three ticks, one pitch). */
  at?: number;
  /** Plane shift (px) before / during the S8 truck (the lane passes its plane's dx; 0 at the landing pose). */
  dx?: number;
  /** Default 'back' (they stand ahead of her down the lane, facing away, as she does). */
  view?: View;
  /** Stagger between the three pops (s). */
  stagger?: number;
};

/** S8's callback: three ghosts with G4-G6's cues, 140 -> 130 px, at map.ts S8.ghosts (L6 owns the final staging). */
export const S8Ghosts: React.FC<S8GhostsProps> = ({at = S8.ghostsPopAt, dx = 0, view = 'back', stagger = 0.04}) => (
  <>
    {[...S8.ghosts].reverse().map((g, j) => {
      const i = S8.ghosts.length - 1 - j;
      return <Ghost key={g.id} seed={`s8/${g.id}`} x={g.x + dx} y={g.feetY} h={g.h} age={4 + i} view={view} at={at + i * stagger} />;
    })}
  </>
);
