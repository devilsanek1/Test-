// HAIR v2: the still STATES (RECIPE.md (c) c.2): calm, a breeze, walking, a turn of the head. A state is a few numbers
// that the hair builder turns into each lock's d_tip through the bend rule (lock.ts): the root pinned, the bend growing
// to the tip. Every head in a shot takes the same state (the same wind); its strength scales with the cut's motion
// class and each lock's own response (wisps 1.5-2x, outer locks 1x, inner locks ~0.5x).
import type {V2} from '../graphic/geo';

export type StateName = 'calm' | 'breeze' | 'walk' | 'turn';
export type Motion = 'C0' | 'C1' | 'C2' | 'C3' | 'C4';

export type HairState = {
  name: StateName;
  /** where the air pushes the hair, on screen (unit, y down); a walk is the air of the hair's own motion */
  wind: V2;
  /** 0..1: how far into the class's range (c.2) the swing goes */
  k: number;
  /** turn: the tips lag behind the head by this (degrees, + clockwise on screen) and the outer locks fan out */
  lag?: number;
  fan?: number;
};

export const CALM: HairState = {name: 'calm', wind: [1, 0], k: 0};
/** a breeze from screen-left (ref 01): the hair streams toward screen-right and a little up */
export const BREEZE: HairState = {name: 'breeze', wind: [0.96, -0.28], k: 0.85};
/** walking toward screen-left: the hair trails behind (screen-right) */
export const WALK: HairState = {name: 'walk', wind: [1, -0.05], k: 0.85};
/** looking back over the left shoulder (seen from behind): the head turns toward screen-left; the hair on the outside
 *  of the turn (screen-right) swings out and fans, the leading side's locks press in toward the neck; lag = the sign
 *  the tips swing (-1: toward screen-right), fan = the extra outward swing on the outside (degrees) */
export const TURN: HairState = {name: 'turn', wind: [1, 0], k: 0.9, lag: -1, fan: 14};

export const STATES: Record<StateName, HairState> = {calm: CALM, breeze: BREEZE, walk: WALK, turn: TURN};

/** The class's d_tip range (degrees) per state: [inner locks, outer locks]. RECIPE c.2's ranges (long hair 20-35 in a
 *  breeze, 8-15 walking) read as calm at film size (the first stills): a subtle state counts as none, so these are
 *  ~1.6x them ("Changes from the stills" in RECIPE.md). */
export const DTIP: Record<Motion, Record<StateName, [number, number]>> = {
  C0: {calm: [0, 0], breeze: [6, 12], walk: [0, 3], turn: [0, 4]},
  C1: {calm: [0, 0], breeze: [16, 28], walk: [8, 13], turn: [10, 18]},
  C2: {calm: [0, 0], breeze: [24, 40], walk: [11, 18], turn: [14, 26]},
  C3: {calm: [0, 0], breeze: [32, 55], walk: [14, 24], turn: [18, 34]},
  C4: {calm: [0, 0], breeze: [8, 16], walk: [4, 8], turn: [6, 14]},
};

/** How light the cut is in the wind (c.2): wisps 1.5-2x, long straight 1x, wavy 0.8x, bobs 0.5x, crops 0.2x, coils
 *  0.1x. The builder multiplies the class range by this, the state's k and the lock's own response. */
export const AIR: Record<Motion, number> = {C0: 0.25, C1: 0.6, C2: 0.85, C3: 1, C4: 0.7};
