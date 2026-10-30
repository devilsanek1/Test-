// HAIR v4: what a cut IS, as data. A cut is drawn per view (3/4, profile, from behind) as a few AUTHORED pieces layered
// like a 2D cut-out rig (back / cap / front / 0-2 accent strands), plus ONE authored shadow shape and ONE highlight
// (each clipped by the pieces it lies on), and 0-3 thin flow lines. Hanging pieces carry a bone chain (4-6 bones,
// authored root to tip); rig.ts skins the piece's anchors and handles to it and sim.ts swings it with springs.
// The 3/4 and profile views of a piece are NODE-COMPATIBLE (the same anchors, landmark by landmark), so a head turn
// morphs the designed shapes between the two drawings (Live2D's keyforms; rig.ts lerpShape) instead of popping.
// Coordinates: head units (bez.ts). z: the head is 52, the face marks 53-53.6, the ear 52.5; behind the body < 40.
import type {N, V2} from './bez';

export type View = 'q' | 'p' | 'b';
export type PieceKind = 'back' | 'cap' | 'front' | 'accent';

/** A bone chain: its joints root first (5-7 points = 4-6 bones), in head units. `rigid` (0..1, default 0.18) = the
 *  share of the chain from the root that stays glued to the head (the hair still lying on the skull). */
export type Chain = {pts: V2[]; rigid?: number};

export type Piece = {
  name: string;
  kind: PieceKind;
  shape: N[];
  z: number;
  /** the base tone: lit (default), or the shade tone for a piece seen in the shade behind the head */
  tone?: 'lit' | 'shade' | 'deep';
  /** a hanging piece: one chain, or several side by side (a wide fall: each anchor blends the two nearest) */
  chains?: Chain[];
  /** an accent strand: the shape is an OPEN centre curve drawn as a tapered ribbon this wide (u) */
  strand?: {w: number; at?: number};
  /** how much of the rim light this piece's silhouette edge takes (0 = none: an inner piece) */
  rim?: number;
  /** pieces drawn only at or above this level of detail (0 tiny .. 3 close) */
  lod?: number;
  /** short hair thinning to the skin (a fade or a taper): from y0 (full hair) to y1 (the skin shows through), head units */
  fade?: [number, number];
};

/** An authored shape laid on some pieces (each piece clips its own copy): the cut's one shadow or one highlight. */
export type Over = {shape: N[]; on: string[]};
/** A flow line: an open centre curve inside a piece, drawn as a thin tapered dark ribbon (an accent where forms meet). */
export type Flow = {c: N[]; w: number; on: string; at?: number};

export type CutView = {
  pieces: Piece[];
  shadow?: Over[];
  light?: Over[];
  flows?: Flow[];
  /** the ears show (a short cut, hair tucked behind the ear): which sides from behind */
  ears?: boolean;
};

/** Spring numbers per cut (sim.ts): long hair heavier and slower, short hair stiff, curls springy but holding. */
export type Spring = {
  /** strength: each bone's pull back to its ANIMATED DIRECTION (1/s^2; like gravity on a pendulum: ~g / bone length,
   *  ~130 for long hair), falling to the tip by taper. Under a sideways load the chain tilts as a whole by about
   *  atan(load / (k L)) instead of curling (Spine's strength, Live2D's pendulum) */
  k: number;
  taper: number;
  /** shape stiffness: each bone's pull toward its rest angle RELATIVE to its parent (keeps the drawn curve; default
   *  0.4 k) (Dynamic Bone's stiffness) */
  shape?: number;
  /** elasticity: a weak pull of every joint toward the animated pose itself (1/s^2; falls to 40 % at the tip) */
  elastic?: number;
  /** velocity damping per second (0.. ~8): low = swings longer */
  damp: number;
  /** gravity's pull back toward world-down when the head tilts (0..1) */
  grav: number;
  /** how much the air moves it (0..1.5) */
  air: number;
  /** how far a joint may bend from its rest angle (degrees) */
  limit: number;
};

export type Cut = {
  id: string;
  name: string;
  sex: 'f' | 'm';
  spring: Spring;
  views: Partial<Record<View, CutView>>;
};
