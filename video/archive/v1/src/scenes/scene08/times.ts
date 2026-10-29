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
  pullAt: w(108, -0.15), // 'millions' - 0.15 (the burst)
  // A1 fix round 1: 1.0 s (storyboard 0.9; fix round 2's 1.1 s landed 6 frames late, inside the sunset): the pull-back
  // drops the depth-0 plane 30 px (the board out of the flood band) and lands right after the second dusk snap
  pullEnd: w(108, 0.85),
  // beats
  hackers: w(81, 0.1), // the city opens row by row
  were: w(83, -0.1), // copies reach the city, flutter down
  already: w(84, -0.1), // four rattlers pop at row-3 doors
  already2: w(84, 0.25), // two more doors
  trying: w(85, -0.1), // eight at row-2 doors, pigeons lift
  useIt: w(87, -0.1), // ~40 specks along far streets
  settle: CRANE, // glow rings, Pip lands, last copy slides with Bit
  rattleA: we(88, 0.2), // end(it) + 0.2: two near rattlers again
  cloudflare: w(89, -0.25), // the push starts (the dome's own key is `dome`)
  // fix round 3: the dome arc draws from both feet over 0.36 s and CLOSES on 'Cloudflare' (ENGINE rule 5: a big build
  // completes on its word); the glass pops on the word
  dome: w(89, -0.36),
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
  hopOff: w(105, -0.2), // the sun's hop take-off (anticipation from -0.1 s before)
  stamp1: w(106, -0.08), // L10 (storyboard anchor: the old ink-ring hit)
  stamp1At: w(106, -0.2), // fix round 1: the print appears at a clamped 1.5x ...
  stamp1Land: w(106), // ... and LANDS on 'minutes' (impact ticks here)
  stamp1Ring: w(106, 0.25),
  comma: we(106, 0.05), // clock off, sun sinks back, rings on, a gate
  millions: w(108, -0.15), // burst + pull-back
  stamp2: w(108, -0.08), // L11 (storyboard anchor)
  // A1 fix round 1: lands 2 frames AFTER 'millions' (the caption highlight first, then the stamp)
  stamp2At: w(108, -0.13),
  stamp2Land: w(108, 0.07),
  wave2: w(108, 0.35),
  millionsWord: w(108),
  within: w(109), // stepped dusk starts (sky snaps on the word)
  sunset1: w(109, -0.13), // sunset step 1 (inCubic 0.16 s: the drop completes on 'within')
  earsCover: w(109, 0.25),
  day: w(111), // relight of the far rows
  sunset2: w(111, -0.13), // sunset step 2 (completes on 'day')
  duskIdle: DUR - 0.15,
  end: DUR,
} as const;

/** Gate stroke-on times (5 bars each, 0.12 s): 'announced', 'they', 'tens' x3, 'thousands' x2, 'attempts', comma. */
export const GATES_AT: number[] = [T.announced, T.they, T.tens, T.tens + 0.1, T.tens + 0.2, T.thousands, T.thousands + 0.1, T.attempts, T.comma];
