// types.ts: the board JSON schema of the shared G3 kit (docs/G3_ANIMATIC.md; drawing spec docs/look/STORYBOARD_STYLE.md).
// One file per film: public/vN/animatic.json. A G3 revision is a data edit, never code. Every field below is read by
// SketchReel (src/lib/g3/SketchReel.tsx) and by the lint (scripts/g3/board_lint.py); keep the two in step.
//
// TIME: camera times (camera.start / end, camera.keys[].t, camera peak) are FILM seconds (the voice's clock);
// element times (in, out, draw, undraw, fillIn, moves[].at, moves[].peak, level / water keys) are seconds after the
// SHOT's start (negative is fine: a move that started in the shot before keeps its place on the clock).
// SPACE: world px of the panel's drawing (1080 x 1920 at camera z 1 centred on (540, 960)); caption band y 290-600,
// read zone y 600-1250, notes strip from y 1680.

export type Tier = 'A' | 'B' | 'C';
/** v3 weights ('subject' | 'mid' | 'far') when an element has no tier; 'dress' = the dress layer (tier C loose masses
 *  sketching the full set: exempt from the 25-element cap and the subject lint; required on home-base and wide panels) */
export type Role = 'subject' | 'mid' | 'far' | 'dress';
/** board fills: paper (opaque) / light / mid / dark (tier A only; mid elsewhere) / pop (dark, makes the element tier A);
 *  warm and cold are v3's sketch names (light) */
export type Fill = 'paper' | 'light' | 'mid' | 'dark' | 'pop' | 'warm' | 'cold';
/** inout = sine in-out (default); unveil = trapezoid(0.1, 0.6); out / in = cubic; outSine (a ledge's own move);
 *  [x1, y1, x2, y2] = a CSS cubic-bezier. A segment or move with `peak` ignores `ease`: it is still at both ends and
 *  fastest at the peak (half-sine up, half-sine down, matched there). */
export type Ease = 'inout' | 'out' | 'in' | 'linear' | 'unveil' | 'inQuad' | 'outSine' | [number, number, number, number];
/** gesture-figure poses: the pose is the verb; 'smear' = the ONE stretched drawing of a fast transit (held 2-3 frames
 *  between two key poses), drawn along `facing` */
export type Pose = 'stand' | 'walk' | 'point' | 'reach' | 'hold' | 'shrug' | 'slump' | 'lookup' | 'sit' | 'smear';
/** people carry no face marks on the board (the pose acts); a face is the mascot's only */
export type Face = 'none' | 'happy' | 'sad' | 'shock' | 'worried';
export type Hair = 'none' | 'long' | 'bun';
export type Box = [number, number, number, number];
export type Pt = [number, number];

/** Fields every element may carry. */
export type Common = {
  /** a name for moves (moves[].el), the panel's hide / tiers overrides and lint messages; unique in its list */
  id?: string;
  /** the attention tier by STORY ROLE, never by depth (G3_ANIMATIC §3): A the beat's 1-3 subjects (9 px ink outline,
   *  5 px inner details, the only dark mass); B supporting life near the story (3 px mid-grey lines, never a dark mass);
   *  C the environment (a light tone with no contour; open lines that ARE lines at 3 px light; the scribble at light
   *  grey). Lint: required on every element (a dress element is C by its role). */
  tier?: Tier;
  role?: Role;
  /** the set's plane (CRAFT §f.1): 0 = the subject's, -1 / -2 nearer (a darker step each), +1 ... +4 farther (each a
   *  paler grey step, converging on the paper's air). Default 0. */
  plane?: number;
  /** v3 parallax depth factor (board: only with shot.parallax) */
  f?: number;
  /** stroke width override in px (rare) */
  sw?: number;
  /** stroke draw-on [start, dur(, ease)] s after the shot start (frame 0's build; later only where the drawing IS the beat) */
  draw?: [number, number] | [number, number, Ease];
  /** the pen lifts the strokes off, the last drawn first: [start, dur(, ease)] (the un-draw; the loop's un-build) */
  undraw?: [number, number] | [number, number, Ease];
  /** a pen tip rides the draw / undraw front (line and pipe elements: the front point along pts) */
  tip?: boolean;
  /** the fill floods in at this many s after the shot start (0.12 s); before it, lines only */
  fillIn?: number;
  /** appears at this time (s after the shot start), whole on its first frame unless `enter` says otherwise */
  in?: number;
  /** leaves at this time, whole (a pop out) */
  out?: number;
  /** how it enters at `in`: pop (default: whole on the first frame), grow (from 30 % about its base, ~0.12 s, no
   *  overshoot), wipe (revealed left to right), rise (slides up 40 px, out-cubic) */
  enter?: 'pop' | 'grow' | 'wipe' | 'rise';
  /** the entrance's length in s (grow 0.12, wipe 0.25, rise 0.15) */
  enterDur?: number;
  /** a cast and contact shadow on the ground under the element's foot, away from the set rig's key, in its one shadow
   *  value; len / w in px (default from the box) */
  shadow?: boolean | {len?: number; w?: number};
  /** ambient life (G3_ANIMATIC §4): every {t: 'ambient'} preset is one; an element with a looping move is one */
  loop?: boolean;
  /** this element IS the thread (the through-line card's object): the lint sums its screen time */
  thread?: boolean;
  /** this element carries a join: exempt from "nothing enters, pops or turns in the 0.4 s round a join" */
  carrier?: boolean;
  /** the panel's life item (one of shot.life) this placeholder stands for */
  life?: string;
  /** what this grey mass becomes at G5 ("grey row = 6 pedestrians, walking") */
  promise?: string;
  /** declared plain paper (the final stays plain here): exempt from the emptiness check */
  negative?: boolean;
  /** a human name, shown in lint messages */
  name?: string;
};

export type El = Common & (
  | {t: 'rect'; x: number; y: number; w: number; h: number; fill?: Fill; label?: string}
  | {t: 'ellipse'; cx: number; cy: number; rx: number; ry: number; fill?: Fill; label?: string}
  /** curve: poly (default: one board stroke per segment), joined (one stroke through the points), smooth (one
   *  Catmull-Rom curve). A draw-on of a joined or smooth line runs at one speed along its length. */
  | {t: 'line'; pts: Pt[]; closed?: boolean; fill?: Fill; curve?: 'poly' | 'joined' | 'smooth'}
  | {t: 'arrow'; x1: number; y1: number; x2: number; y2: number}
  /** board: a flat mid-grey rect (v3) */
  | {t: 'hatch'; x: number; y: number; w: number; h: number}
  /** the scribble mass (the owner's sketchbook texture): ONE wandering 3 px stroke filling the box, flat tone at 25 %;
   *  tier C draws it light grey, B mid grey */
  | {t: 'scribble'; x: number; y: number; w: number; h: number; gap?: number; jitter?: number}
  /** x = between the feet, y = the ground, h = standing height; fill = torso tone; facing default 'r' */
  | {t: 'figure'; x: number; y: number; h: number; pose?: Pose; facing?: 'l' | 'r'; face?: Face; hair?: Hair; fill?: Fill}
  /** size default 64; strike = struck through (true, or the s it is struck) */
  | {t: 'text'; x: number; y: number; text: string; size?: number; strike?: boolean | number}
  /** an icon-kit object fitted into the box (src/lib/g3/SketchIcons.tsx) */
  | {t: 'icon'; name: string; x: number; y: number; w: number; h?: number; fill?: Fill | 'none' | `#${string}`; label?: string;
      text?: string; pts?: Pt[]}
  /** the red annotation layer, at most one per panel. case 1 (a planned move not animated yet) and 3 (an un-animated
   *  path arrow) FAIL on an owner-facing board; case 2 = a push-in's end-frame box held for its first 0.4 s */
  | {t: 'mark'; kind: 'circle' | 'underline' | 'frame'; x: number; y: number; w: number; h: number; word?: string; dir?: 'in' | 'out'; case?: 1 | 2 | 3}
  | {t: 'mark'; kind: 'arrow'; x1: number; y1: number; x2: number; y2: number; word?: string; case?: 1 | 2 | 3}
  /** one of the rig's light pools: a paper ellipse on the room or ground tone (the lamp pool, a lit window's spill) */
  | {t: 'pool'; cx: number; cy: number; rx: number; ry: number}
  /** an explicit cast or ground shadow in the rig's one shadow value: an ellipse or a closed polygon */
  | {t: 'shade'; cx?: number; cy?: number; rx?: number; ry?: number; pts?: Pt[]}
  /** the ground's lines running to the vanishing point (CRAFT §f.4): n lines from the near edge (y1, spread x0-x1)
   *  toward (vx, vy) (default: the panel's vp), stopping at the far edge y0; horizon: true also draws the horizon */
  | {t: 'ground'; x0: number; x1: number; y0: number; y1: number; n?: number; vx?: number; vy?: number; horizon?: boolean}
  /** a pipe (double wall, an empty bore), with water in it: water = front keys [[s, u 0..1], ...] (linear between),
   *  drain = tail keys (the water leaving from the start end), flow = moving marks in the water (ambient), pulse =
   *  [start, dur, length 0..1] a slug of water travelling the whole run */
  | {t: 'pipe'; pts: Pt[]; bore?: number; water?: [number, number][]; drain?: [number, number][]; flow?: boolean | number;
      pulse?: [number, number, number]; curve?: 'joined' | 'smooth'}
  /** the shared ambient kit (G3_ANIMATIC §4: never authored fresh per panel), at final size and speed */
  | Ambient
);

/** Ambient presets. Boxes are world px; speeds px/s (at camera z 1); level keys [[s, 0..1], ...] (linear between). */
export type Ambient =
  /** snowfall: n flakes falling through the box, swaying; r = flake radius */
  | {t: 'ambient'; kit: 'snow'; x: number; y: number; w: number; h: number; n?: number; r?: number; speed?: number; sway?: number; seed?: string}
  /** steam: puffs rising from (x, y) up h px, widening to w; rate puffs/s; level keys thicken, thin or stop it */
  | {t: 'ambient'; kit: 'steam'; x: number; y: number; w?: number; h?: number; r?: number; rate?: number; rise?: number;
      level?: [number, number][]; seed?: string}
  /** window lights in a cols x rows grid in the box: wave = [from, to] each switches on once, staggered (a story
   *  action); cycle = s: one window toggles every cycle s (ambient); lit = the lit tone (paper), dark = the unlit (mid) */
  | {t: 'ambient'; kit: 'window'; x: number; y: number; w: number; h: number; cols?: number; rows?: number; pane?: [number, number];
      wave?: [number, number]; cycle?: number; startLit?: boolean; lit?: Fill; dark?: Fill; seed?: string}
  /** a cloud drifting across the box at speed px/s, wrapping round (rw x rh = the cloud's size) */
  | {t: 'ambient'; kit: 'cloud'; x: number; y: number; w: number; h: number; rw?: number; rh?: number; speed?: number; phase?: number; seed?: string}
  /** water moving in a pipe or a channel: marks travelling along pts at speed px/s */
  | {t: 'ambient'; kit: 'water'; pts: Pt[]; speed?: number; gap?: number; dash?: number; width?: number; seed?: string}
  /** birds: n small Vs crossing the box at speed px/s, wings ticking (two drawings) */
  | {t: 'ambient'; kit: 'bird'; x: number; y: number; w: number; h: number; n?: number; speed?: number; size?: number; seed?: string};

export type AmbientKit = Ambient['kit'];

/** A camera: (x, y) = the world point at the frame's centre, z = zoom, r = roll in degrees. */
export type Cam = {x: number; y: number; z: number; r?: number};
/** One camera key (film seconds). The segment from the key before INTO this one carries the move's values. */
export type CamKey = Cam & {
  t: number;
  /** the segment's ease (default inout); ignored when peak is set */
  ease?: Ease;
  /** film s: the segment's fastest moment (still at both keys) */
  peak?: number;
  /** the segment's move word: PUSH IN, PULL BACK, PULL OUT, PAN L/R, RISE, TILT UP/DOWN, FOLLOW, DIVE, CRANE, HOLD */
  word?: string;
  /** what the move fixes on ("fix on the computer"): the fourth of the five values */
  anchor?: string;
  /** a world point held on its screen path through the segment (a zoom about it); default: the centre's straight path */
  pivot?: Pt;
};
/** The camera: the v3 one-segment form (from, to, start, end, ease) or keys (2+). */
export type Camera = {
  from?: Cam;
  to?: Cam;
  ease?: Ease;
  start?: number;
  end?: number;
  peak?: number;
  word?: string;
  anchor?: string;
  pivot?: Pt;
  keys?: CamKey[];
};

/** Transition devices (G3_ANIMATIC §4) and their carriers (CRAFT §a): A push-through / pull-back; B thread-match,
 *  match-cut, match-zoom, morph; C continuous; D object-carry, wipe, whip, carry; E card-flip, swipe; F plain-cut,
 *  cut-on-action. dissolve / dip / flash are never carriers: only a declared time-passing exception. */
export type Device =
  | 'continuous' | 'push-through' | 'pull-back' | 'thread-match' | 'match-cut' | 'match-zoom' | 'morph'
  | 'object-carry' | 'wipe' | 'whip' | 'carry' | 'card-flip' | 'swipe' | 'plain-cut' | 'cut-on-action'
  | 'dissolve' | 'dip' | 'flash';
export type Carrier = 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
/** The join INTO a shot. `type` is how the reel plays the switch (cut = the next panel on the next frame, which is
 *  what a continuous camera or a matched hand-over is); device + carrier say what carries the eye across. */
export type Transition = {
  type: 'cut' | 'dissolve' | 'push-through' | 'match-cut' | 'wipe' | 'dip' | 'flash';
  device?: Device;
  carrier?: Carrier;
  /** the carrier object ("the pen tip", "the steam column") */
  what?: string;
  label?: string;
  /** film s: the join's midpoint, on the first word of the new sentence (default: the shot's start) */
  mid?: number;
  dur?: number;
  /** the carried thing's world box in the panel before and in this one (B's +-8 % spot / +-20 % size check; any hand-over) */
  match?: {prev: Box; next: Box};
  /** push-through: the sub-frame in the previous panel's world that IS this panel (15-30 % of the frame) */
  subframe?: Box;
  /** whip / carry: the direction and the screen speed (px/frame) matched across the join */
  dir?: 'l' | 'r' | 'u' | 'd';
  speed?: number;
  /** a dissolve / dip / flash only as the declared time-passing exception */
  exception?: 'time';
  /** a plain cut's declared angle change in degrees (>= 30, or a >= 20 % size change) */
  angle?: number;
};

export type Move = {
  /** the element: its index in shot.els, or its id (shot els first, then the set's) */
  el: number | string;
  dx: number;
  dy: number;
  /** s after the shot start */
  at: number;
  dur: number;
  ease?: Ease;
  /** s after the shot start: the fastest moment (still at both ends) */
  peak?: number;
  /** the scale reached, about the pivot o (geometric in u; lin: true = straight lines from box to box) */
  s?: number;
  o?: Pt;
  lin?: boolean;
  /** repeat forever with period dur + gap (ambient life: a ferry crossing, a tram) */
  loop?: boolean;
  gap?: number;
};

/** The set's light rig as shapes (W1; the same in every shot of the set): the key's side (sets every auto shadow's
 *  direction), what the key is, the one grey shadow value, the pools by name (drawn as {t: 'pool'} elements). */
export type Rig = {
  key: 'left' | 'right' | 'top-left' | 'top-right' | 'top' | 'back' | 'back-left' | 'back-right' | 'front';
  source?: string;
  shadow?: 'mid' | 'light' | `#${string}`;
  pools?: string[];
  note?: string;
};
export type PlaneDef = {n: number; name: string};
/** the horizon (y) and the vanishing point(s) x, in the panel's world px */
export type VP = {y: number; x?: number | number[]};
export type SetDef = {
  name?: string;
  rig?: Rig;
  planes?: PlaneDef[];
  vp?: VP;
  /** the set's shared drawing (world px of the set), drawn under the panel's own els in every panel of the set (unless
   *  the panel says ownWorld) */
  els?: El[];
  /** what the density key says about this set */
  density?: string;
};

export type Shot = {
  id: string;
  s: number;
  e: number;
  /** "line 1\nline 2" for the notes strip: line 1 = shot type, COZY / SCALE, the move; line 2 = the one idea */
  note: string;
  /** a short name (the visual script's at-a-glance line) */
  name?: string;
  /** the set this panel is staged in: a SET PANEL (the lint wants its rig, planes, vp and 2-3 ambient moves) */
  set?: string;
  /** the shot type word: WIDE, MEDIUM, CLOSE, EXTREME WIDE, INSERT, POV ... (a wide wants a dress layer) */
  type?: string;
  /** a home-base panel (wants a dress layer and the same room tone) */
  home?: boolean;
  /** a scale panel: its subject BIG (>= 60 % of the frame or cut by both side edges) */
  scale?: boolean;
  /** the declared scale reveal (CRAFT §a.1): the thread may leave the screen */
  reveal?: boolean;
  parallax?: boolean;
  /** the panel is drawn at its own size: the set's shared drawing is not drawn */
  ownWorld?: boolean;
  planes?: PlaneDef[];
  vp?: VP;
  /** every G5 life item (crowd, traffic, clutter, steam, window lights): one placeholder element each (el.life) */
  life?: string[];
  promise?: string;
  /** the declared count of noticeable supporting movers at once (3-4) */
  movers?: number;
  /** the COMPOSITION_SHOTS codes from the film's composition pass */
  comp?: {frame?: string; move?: string; join?: string};
  transition: Transition;
  camera: Camera;
  els: El[];
  moves?: Move[];
  /** set elements (by id) not drawn in this panel */
  hide?: string[];
  /** tier overrides for set elements in this panel, by id (the tier is the beat's story role) */
  tiers?: Record<string, Tier>;
  credit?: string;
  /** a skeleton panel not drawn yet (allowed only in a draft board) */
  placeholder?: boolean;
};

export type Word = {w: string; s: number; e: number};
/** a placeholder sound: type = SOUND_SYNC's code, event = the story event it lands on (the sync check list, item 1) */
export type Sfx = {src: string; t: number; gain?: number; type?: string; event?: string};

export type Animatic = {
  /** the film's id ('v4'): the lint finds docs/<film>/camera_plan_g3.md with it */
  film?: string;
  /** default 'board' */
  style?: 'board' | 'sketch';
  label: string;
  /** the voice, a public/ path (the G3Reel `voice` prop overrides it) */
  audio: string;
  durationSec: number;
  /** the render rate the lint measures speed at (default 60) */
  fps?: number;
  /** legacy (v3): a title over the frame until frame0Until. The playbook: no title over the captions; frame 0 shows
   *  the first spoken line as a caption. Leave empty. */
  frame0?: string;
  frame0Until?: number;
  frame0Credit?: string;
  words: Word[];
  sfx: Sfx[];
  sets?: Record<string, SetDef>;
  /** the through-line card: the thread, its home spot, the declared scale reveal and fairness stretch (film s) */
  throughline?: {thread: string; home: string; reveal?: [number, number]; fairness?: [number, number]};
  /** the join from the last shot back into frame 0 (the loop) */
  loopJoin?: Transition;
  /** an internal interim draft: placeholder panels and red marks (1), (3) are allowed (the lint warns) */
  draft?: boolean;
  shots: Shot[];
};
