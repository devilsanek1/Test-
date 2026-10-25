// S04 beat table: ABSOLUTE film seconds on the recorded take (docs/storyboard_v3_resolved.json S04, assets/timing.json
// words 46-54), converted to scene-local seconds by `beats(start)` (local = absolute - the scene's start; the start comes
// from src/data/scenes.json through useScene(), 14.17 today = cut(it)).
// Every beat is a word anchor; the comment names it the way the storyboard writes it. Leads follow ENGINE rule 5.

/** The scene's start / end on the take (src/data/scenes.json S04). */
export const S04_START = 14.17;
export const S04_END = 16.59;

/** Word starts (assets/timing.json). */
export const W = {
  itEnd: 13.945, //         end of w45 'it.' (S03): the sun takes off on its glide-hop
  this: 14.395, //          w46 'This'
  bug: 14.6, //             w47
  was: 14.785, //           w48
  in: 14.935, //            w49
  there: 15.035, //         w50
  for: 15.195, //           w51
  like: 15.375, //          w52
  fourteen: 15.49, //       w53 (ends 16.225)
  years: 16.225, //         w54 (ends 16.57)
} as const;

/** Storyboard beats (absolute s). */
const ABS = {
  sunTakeOff: 13.945, //    end(it) (S03): the sun's low glide-hop starts (mid-air at (810, 680) on the cut)
  pipCrouch: 14.05, //      cut(it)-0.12 (S03): Pip crouches to hop toward the stoop (crosses the cut)
  cut: S04_START, //        cut(it): MATCH on the sun (mid-glide); door #4 at medium-close; the slow creep begins
  pipTakeOff: 14.19, //     S03 hand-off: Pip's take-off, right after the cut
  this: 14.395, //          w46 'This': the sun touches down in its slot (930, 690); Pip lands on step 2's tread
  yawn: 14.76, //           w48-0.025 'was' (fix round: was w46+0.12 = 14.515, inside 'bug'): Pip yawns once Bit has
  //                        had the 'bug' window to himself (he stands, settled, from 'This' until here)
  bug: 14.6, //             w47 'bug': Bit does a hop on the lock box (he is 'this bug'): take-off w47-0.15 so the apex
  //                        is ON the word; a peach spot + ink ring around his seat draws on w47-0.12
  ghosts1: 14.785, //       w48 'was': two ink-only ghost passers-by pop on the pavement, never looking at the door
  ivy: 14.835, //           w49-0.10 'in' (rule-5 lead): the ivy creeps up the door frame one step (green)
  lapse: 15.085, //         w50+0.05 'there': the time-lapse: 14 YEAR pages tear 0.07 s apart; the ivy steps a season
  //                        every 2 tears; ghosts pop in and out (~1 per tear)
  sleep: 15.295, //         w51+0.10 'for': Pip curls up asleep on the step (sleep pose, z's float)
  ghosts2: 15.375, //       w52 'like': a second pair of ghosts strides past; Bit yawns and blinks (he does not move)
  l5: 15.39, //             w53-0.10 'fourteen': label L5 swings in as a tag hanging from lock4 (pendulum -16 -> 0)
  cobweb: 15.59, //         w53+0.10 'fourteen': a cobweb draws over the lock box corner (0.3 s); Bit does not move
  leaf: 15.55, //           w53+0.06 'fourteen' (storyboard w53+0.20, started 0.14 s early so it lands 0.3 s before the
  //                        dive and is seen at rest): a tan leaf drifts down onto sleeping Pip's crown
  dive: 16.26, //           cut(years)-0.33 'years': the camera dives into lock4 (in(quad), fixed 0.33 s); the leaf
  //                        lands on sleeping Pip's ear
  end: S04_END, //          cut(years): match-cut into S05 on the lock (65 x 80 px at screen (483, 960))
} as const;

export type Beats = {-readonly [K in keyof typeof ABS]: number};

/** Scene-local beat times for a scene that starts at `start` (VO seconds). */
export function beats(start: number = S04_START): Beats {
  const out = {} as Beats;
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = +(ABS[k] - start).toFixed(4);
  return out;
}

/** Absolute -> local. */
export const local = (abs: number, start: number = S04_START) => +(abs - start).toFixed(4);

/** The 14 year-page tears (local s): 0.07 s apart from the time-lapse start. */
export const tearTimes = (b: Beats): number[] => Array.from({length: 14}, (_, i) => +(b.lapse + i * 0.07).toFixed(4));
