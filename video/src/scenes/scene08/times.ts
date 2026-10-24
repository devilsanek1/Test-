// S08 beat clock: every time is a WORD ANCHOR on the recorded take (assets/timing.json), converted to scene-local
// seconds (0 = the S08 cut in src/data/scenes.json). Same anchors as docs/storyboard_v3.json (resolved: _resolved.json),
// so a re-recorded take or a moved cut re-times the scene without touching it.
import timing from '../../../assets/timing.json';
import scenes from '../../data/scenes.json';

const SCENE = (scenes as {id: string; start: number; end: number}[]).find((s) => s.id === 'S08')!;
export const START = SCENE.start;
export const DUR = SCENE.end - SCENE.start;
const W = (timing as {words: {s: number; e: number}[]}).words;

/** Word i's START + dt, scene-local. */
export const w = (i: number, dt = 0) => W[i].s + dt - START;
/** Word i's END + dt, scene-local. */
export const we = (i: number, dt = 0) => W[i].e + dt - START;

// fixed-length moves anchored on the cut (storyboard: the crane is a fixed 2.0 s)
const CRANE = 2.0;

export const T = {
  cut: 0,
  // camera
  craneEnd: CRANE,
  pushAt: w(89, -0.25), // 'Cloudflare' - 0.25
  pushEnd: w(106), // 'minutes'
  pullAt: w(108, -0.15), // 'millions' - 0.15
  pullEnd: w(108, 0.75),
  // beats
  hackers: w(81, 0.1), // the city opens row by row
  were: w(83, -0.1), // copies reach the city, flutter down
  already: w(84, -0.1), // four rattlers pop at row-3 doors
  already2: w(84, 0.25), // two more doors
  trying: w(85, -0.1), // eight at row-2 doors, pigeons lift
  useIt: w(87, -0.1), // ~40 specks along far streets
  settle: CRANE, // glow rings, Pip lands, last copy slides with Bit
  rattleA: we(88, 0.2), // end(it) + 0.2: two near rattlers again
  cloudflare: w(89, -0.25), // dome arc draws from both feet
  board: w(89, -0.15), // the board rises with L8
  bitHop: w(89, 0.3),
  says: w(90), // watchtower rises
  that: w(91), // searchlight on
  once: w(92), // glint sweep, far window grid winks
  itWas: w(94), // rattlers again, Pip glances at the board
  announced: w(95, 0.15), // count starts: flag + L9a + gate 1
  footer: we(95, 0.1), // L9b
  they: w(96), // rim attempters, gate 2
  tens: w(98), // 3 gates, searchlight crosses the crown
  thousands: w(100), // 20 rim attempters, 2 gates
  hacking: w(102), // searchlight sweeps back
  attempts: w(103), // rattlers hop to the next door, a gate
  in: w(104), // rim taps
  fortyFive: w(105, -0.05), // rings off, sun hops up
  fortyFiveWord: w(105), // the clock lands
  stamp1: w(106, -0.08), // L10
  stamp1Ring: w(106, 0.25),
  comma: we(106, 0.05), // clock off, sun sinks back, rings on, a gate
  millions: w(108, -0.15), // burst + pull-back
  stamp2: w(108, -0.08), // L11
  wave2: w(108, 0.35),
  millionsWord: w(108),
  within: w(109), // sunset step 1 + stepped dusk
  earsCover: w(109, 0.25),
  day: w(111), // sunset step 2
  duskIdle: DUR - 0.15,
  end: DUR,
} as const;

/** Gate stroke-on times (5 bars each, 0.12 s): 'announced', 'they', 'tens' x3, 'thousands' x2, 'attempts', comma. */
export const GATES_AT: number[] = [T.announced, T.they, T.tens, T.tens + 0.1, T.tens + 0.2, T.thousands, T.thousands + 0.1, T.attempts, T.comma];
