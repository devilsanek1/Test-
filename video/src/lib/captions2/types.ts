// types.ts: the caption file (public/vN/captions2.json, written by scripts/captions2/build_captions.py) and the layout.
// Format 'captions2/1'. Times are SECONDS of the voice (the take's word times); px at 1080 x 1920, y down.

/** The SKY's tone behind a group (TYPE_GUIDE.md §b): 'dark' = dusk and night (warm white words, the honey lit hand with
 *  the golden glow), 'light' = day and light dusk (deep plum ink, the gentle warm halo). NOTE: theme.ts `CaptionTone`
 *  names the TEXT colour the other way round ('light' = white text); this one names the sky, as the guide does. */
export type SkyTone = 'dark' | 'light';
export type Anchor = 'start' | 'middle' | 'end';
export type Seat = 'L' | 'C' | 'R';
/** landing = R4 / R9 (the lit hand, 1.35-1.4x), lift = R5 (the lit hand at the running size), number = R3. */
export type StressKind = 'landing' | 'lift' | 'number';

/** One drawn run: a word (or a number for several spoken words, "70,000" = "seventy thousand"). */
export type Piece = {
  /** The text drawn (the picture's spelling: "70,000", "40", "wants"). */
  t: string;
  /** Indices into the voice's words (voice_words.json `words`) this piece says. */
  words: number[];
  /** Voice times: its first word's start and its last word's end. */
  s: number;
  e: number;
  /** The voice time its pop is timed to: its build chunk's first word start (0 = on screen at frame 0). The piece pops
   *  `lead` frames before it (TYPE_GUIDE header: 2 frames at 60 fps). */
  at: number;
  /** The style's name in recipes.json `styles` and its resolved values. */
  style: string;
  size: number;
  weight: number;
  track: number;
  /** The lit hand: the tone's accent with its glow, blooming in 8 frames from its pop. */
  lit: boolean;
  /** A number's comma tucked in: [ink gap after the figures, ink gap after the comma], em of `size`. */
  tuck?: [number, number];
  /** Ink-to-ink gap (px) from the previous piece in its row; absent = a word space in the previous piece's font. */
  gap?: number;
};

export type Row = {
  baseline: number;
  /** Anchored placement (no group seat): the row's INK start / centre / end sits at x. */
  x?: number;
  anchor?: Anchor;
  /** Seat placement: this row's ink starts dx px right of the group's left edge (default: index x step). */
  dx?: number;
  pieces: Piece[];
  /** Optional: the row leaves early at this time (s; R6 "the first line first"). */
  out?: number;
};

export type Group = {
  id: string;
  /** R1-R9 (TYPE_GUIDE.md §e); R9 has two groups (the lockup, then the last group: `part` 'last'). */
  recipe: string;
  part?: string;
  shot?: string;
  tone: SkyTone;
  /** The group's words for reading (rows split by " / "). */
  text: string;
  /** Seat placement: the rows' ink box centred on the seat's x (recipes.json `seats`), row i stepped `step` px right. */
  seat?: Seat | null;
  step?: number;
  stress?: {piece: [number, number]; t: string; kind: StressKind} | null;
  rows: Row[];
  /** The first pop (s, at the file's fps) and the first frame it is gone (s); the component recomputes the pops from
   *  `at` at its own fps and keeps `end` (never past the next group's first pop). */
  start: number;
  end: number;
  enter: 'pop' | 'soft';
  leave: 'cut' | 'soft';
  /** The builder's layout (Chromium-measured), for the record and the checks: the group's ink box. */
  est?: {x0: number; x1: number; y0: number; y1: number; cx: number};
};

/** R7: a word that lives on a thing in the world (on the camera layer, at its object's depth). */
export type WorldItem = {
  id: string;
  recipe: 'R7';
  t: string;
  words?: number[];
  /** Enters with its object at this voice time; leaves with the camera by `until`. */
  at: number;
  until: number;
  /** The object it sits on, and the ink width the figures are fitted to (the object's width - fitPad). */
  object: string;
  objectWidth: number;
  fitPad: number;
  ink: string;
  weight: number;
  track: number;
};

/** R10: the cover title (no times). */
export type Cover = {recipe: 'R10'; tone: SkyTone; text: string; rows: Row[]};

export type CaptionFile = {
  format: 'captions2/1';
  film: string;
  /** The rate `start` / `end` were rounded at, and the lead (frames at that rate). */
  fps: number;
  lead: number;
  durationSec: number;
  /** The voice's words file this was built from. */
  words: string;
  groups: Group[];
  world?: WorldItem[];
  cover?: Cover;
  checks?: {errors: string[]; warnings: string[]};
};

/** Ink metrics of one string in one face (the type.js measure: canvas, letter-spacing included in the advance, the
 *  trailing spacing taken off the ink's right). left / right are the ink's edges relative to the origin. */
export type Metrics = {adv: number; left: number; right: number; asc: number; desc: number};

export type PlacedPart = {t: string; x: number};
export type PlacedPiece = {
  piece: Piece;
  row: number;
  index: number;
  /** The SVG text origin(s): one part, or the number's parts (the comma tucked). */
  parts: PlacedPart[];
  y: number;
  /** The ink box. */
  x0: number;
  x1: number;
  top: number;
  bottom: number;
};
export type GroupLayout = {pieces: PlacedPiece[]; x0: number; x1: number; top: number; bottom: number};
