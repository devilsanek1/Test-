// S07 "Word got out": every beat as an ABSOLUTE film time on the recorded take (docs/storyboard_v3_resolved.json,
// assets/timing.json word starts), converted to scene-local seconds with the scene's real start (useScene().start,
// falling back to the storyboard start). Word anchors: 72 'but' 22.050 ... 80 'ready,' 23.705 (end 24.095).

import {useScene} from '../../lib';

/** Recorded word starts (assets/timing.json, words 71-80). */
export const W = {
  headsUp: 21.285,
  but: 22.05,
  word: 22.155,
  got: 22.505,
  out: 22.665,
  before: 22.875,
  the: 23.055,
  fix: 23.205,
  was: 23.545,
  ready: 23.705,
} as const;

/** Storyboard scene window on the take: cut(heads-up) -> cut(ready). */
export const SCENE = {start: 21.985, end: 24.095};

/** Absolute beat times (storyboard S07 beats; leads per ENGINE rule 5 already applied by the storyboard). */
export const ABS = {
  cut: 21.985, // lens wipe centre (foreground-wipe window cut -0.21 .. +0.21)
  pinPip: W.word - 0.05, // 22.105: the pin dot pops on the notice; Pip lands on the board top
  label: W.word + 0.23, // 22.385: L7 tag pops on the board's bottom rail (fix round 2: storyboard w73+0.10 -> +0.23, after
  // the pen has inked the board frame and legs around it, before the 'got' clones at 22.425; un-stacked from the pin pop)
  got: W.got, // 22.505: the address-bar rail lights; two clones pop
  out: W.out - 0.1, // 22.565: clones x4 (x8 0.16 s later); the first two readers rise
  slap: W.out, // 22.665: GAG: a copy slaps onto Pip's face (sfx 'flyer slap')
  before: W.before, // 22.875: copies peg onto the wires and travel left (Bit rides one); pigeons hop; the sun lands
  the: W.the, // 23.055: two more readers rise at the right; four phones raise
  fix: W.fix - 0.04, // 23.165: the sun becomes an hours clock; the workshop's elephant sign swings (J4 in view)
  was: W.was, // 23.545: Pip peels the flyer off and shakes his head; a phone shows a copy; a pigeon flaps up
  tilt: SCENE.end - 0.4, // 23.695: the clock pops off the sun; the camera tilts up (fixed 0.40 s); Pip hops off
  end: SCENE.end,
} as const;

export type Beats = {-readonly [K in keyof typeof ABS]: number};

/** Scene-local beat times (s). */
export function useBeats(): Beats {
  const sc = useScene();
  const start = sc.id === 'S07' && sc.start > 0 ? sc.start : SCENE.start;
  const out = {} as Beats;
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = ABS[k] - start;
  return out;
}
