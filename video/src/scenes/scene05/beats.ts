// S05 beat table: ABSOLUTE film seconds on the recorded take (docs/storyboard_v3_resolved.json S05, assets/timing.json
// words 55-64), converted to scene-local seconds by `beats(start)` (local = absolute - the scene's start; the start comes
// from src/data/scenes.json through useScene(), 16.59 today = cut(years)).
// Every beat is a word anchor; the comment names it the way the storyboard writes it. Leads follow ENGINE rule 5.

/** The scene's start / end on the take (src/data/scenes.json S05). */
export const S05_START = 16.59;
export const S05_END = 19.773;

/** Word starts (assets/timing.json). */
export const W = {
  before: 16.61, //         w55
  researchers: 16.825, //   w56
  using: 17.435, //         w57
  ai: 17.705, //            w58 'AI'
  figured: 18.195, //       w59
  out: 18.535, //           w60
  how: 18.705, //           w61
  bad: 18.87, //            w62
  it: 19.165, //            w63
  was: 19.325, //           w64 'was.' (ends 19.565)
} as const;

/** Storyboard beats (absolute s). */
const ABS = {
  cut: S05_START, //        cut(years): MATCH on the lock (S04's dive lands): the blueprint lock where lock4 was; L5 rides
  //                        across as a blueprint annotation; the camera keeps creeping IN (1.08 -> 1.13, 0.30 s)
  zzz: 16.76, //            w55+0.15 'before': a z floats up from sleeping Pip; the banner sways once on its rod
  teamA: 16.775, //         w56-0.05 'researchers': team A rises at the foot of the steps (0.10 s stagger, 0.33 s)
  teamB: 17.125, //         w56+0.30: team B rises (0.10 s stagger)
  calendar: 17.435, //      w57 'using': the facade calendar tears to its summer page (August)
  l5Out: 17.605, //         w57+0.17: the L5 annotation pops off
  tablets: 17.645, //       w58-0.06 'AI': one tablet per team is raised (0.07 s apart), sparkles twinkle
  beams: 17.955, //         w58+0.25: two scan beams shoot out and sweep the banner from opposite sides
  l6: 18.105, //            w58+0.40: L6 pops as a slip clipped to the banner's top margin
  converge: 18.195, //      w59 'figured': both beams converge on the lock detail
  ring: 18.535, //          w60 'out': the ink target ring strokes on around the lock ON the word (0.17 s): found
  how: 18.705, //           w61 'how': the ring pulses once; the teams lean in
  bad: 18.87, //            w62 'bad': ONE focal event: the S02 dashed hand redraws and turns the lock; Bit's ink '!'
  pipWake: 19.215, //       w63+0.05 'it': GAG: Pip jolts awake on the rail (trunk-up, wide)
  envelope: 19.425, //      w64+0.10 'was.': the messenger pulls the envelope and turns right; the hand retracts
  truck: 19.473, //         cut(was)-0.30: he walks out right, the camera trucks with him (0.30 s); Pip hops to follow
  end: S05_END, //          cut(was): CUT ON ACTION into S06
} as const;

export type Beats = {-readonly [K in keyof typeof ABS]: number};

/** Scene-local beat times for a scene that starts at `start` (VO seconds). */
export function beats(start: number = S05_START): Beats {
  const out = {} as Beats;
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = +(ABS[k] - start).toFixed(4);
  return out;
}

/** Absolute -> local. */
export const local = (abs: number, start: number = S05_START) => +(abs - start).toFixed(4);
