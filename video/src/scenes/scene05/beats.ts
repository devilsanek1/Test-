// S05 beat table: ABSOLUTE film seconds on the recorded take (docs/storyboard_v3_resolved.json S05, assets/timing.json
// words 55-64), converted to scene-local seconds by `beats(start, end)` (local = absolute - the scene's start; start and
// end come from src/data/scenes.json through useScene(), 16.59 / 19.773 today = cut(years) / cut(was)). The exit beats
// (truck, Pip's hop, the cut) are derived from the scene's END, so a re-timed cut moves them with it.
// Every beat is a word anchor; the comment names it the way the storyboard writes it. Leads follow ENGINE rule 5.

/** The scene's start / end on the take (src/data/scenes.json S05; fallbacks only). */
export const S05_START = 16.59;
export const S05_END = 19.773;
/** The exit truck: a FIXED 0.30 s ending on the cut (camera.ts TRUCK). */
export const TRUCK_DUR = 0.3;

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

/** Storyboard beats (absolute s). `truck` / `end` are filled in from the scene's end by `beats()`. */
const ABS = {
  cut: S05_START, //        cut(years): MATCH on the lock (S04's dive lands): the blueprint lock where lock4 was; L5 rides
  //                        across as a blueprint annotation; the camera keeps creeping IN (1.08 -> 1.13, 0.30 s)
  sway: S05_START + 0.02, // cut+0.02: the landing 'hits' the banner: it sways once on its rod (real motion on f1-f5)
  bitIn: 16.67, //          w55+0.06 'before': Bit (sitting on the lock box's top where S04 leaves him) hops DOWN into the
  //                        socket, posing as part of the drawing (0.2 s)
  zzz: 16.76, //            w55+0.15 'before': a z floats up from sleeping Pip
  teamA: 16.775, //         w56-0.05 'researchers': team A pops up at the foot of the steps (0.10 s stagger)
  teamB: 17.125, //         w56+0.30: team B pops up (0.08 s stagger)
  calendar: 17.435, //      w57 'using': the facade calendar tears to its summer page (AUG)
  pigeon: 17.475, //        w57+0.04 'using': a pigeon in the audience's aisle hops
  l5Out: 17.605, //         w57+0.17: the L5 annotation pops off
  tablets: 17.645, //       w58-0.06 'AI': one tablet per team is raised (0.07 s apart), sparkles twinkle
  beams: 17.955, //         w58+0.25: two scan beams shoot out and sweep the banner from opposite sides
  l6: 18.105, //            w58+0.40: L6 pops as a slip clipped to the banner's top margin
  converge: 18.115, //      w59-0.08 'figured': both beams converge on the lock detail (narrow by ~figured+0.1)
  look: 18.195, //          w59 'figured': two audience heads tilt up (1-frame pose swaps)
  ring: 18.475, //          w60-0.06 'out': the ink target ring strokes on round the lock (0.17 s, closed ~18.645): found
  how: 18.705, //           w61 'how': the ring pulses once; the teams lean in (torso + head, about the hips)
  balloon: 18.79, //        w62-0.08 'bad': Bit's ink '!' balloon pops (readable ON the word)
  bad: 18.87, //            w62 'bad': ONE focal event: the S02 dashed hand (drawn from bad-0.10) is on the lock; Bit hops
  //                        out of the socket onto the lock box
  turn: 18.97, //           w62+0.10: the hand turns the thumb-turn; the bolt slides all the way back (0.22 s)
  door: 19.09, //           w62+0.22: the blueprint door's right leaf swings ajar (0.2 s): a dark gap opens. No key.
  headTurn: 19.36, //       w64+0.035 'was.' (fix round 3: was 18.99, inside 'bad', the ONE focal event): one audience
  //                        head turns to its neighbour (1-frame pose swap, foreground band) as the messenger breaks away
  pipWake: 19.215, //       w63+0.05 'it': GAG: Pip jolts awake on the rail (trunk-up, wide); the leaf flicks off his ear
  pull: 19.25, //           w64-0.075 'was.': the messenger raises the envelope to his right shoulder (S06's carry)
  bitLeap: 19.29, //        w64-0.035: Bit leaps from the lock box onto the messenger's collar (0.24 s); the '!' pops off
  was: 19.325, //           w64 'was.': the messenger pops into his run (3/4-back stride) and starts the dash right
  envelope: 19.425, //      w64+0.10 'was.': the dashed hand retracts
  truck: 0, //              cut(was)-0.30: the camera trucks with him (0.30 s); Pip leaps off the rail to follow
  end: 0, //                cut(was): CUT ON ACTION into S06
} as const;

export type Beats = {-readonly [K in keyof typeof ABS]: number};

/** Scene-local beat times for a scene that starts at `start` and cuts at `end` (VO seconds). */
export function beats(start: number = S05_START, end: number = S05_END): Beats {
  const out = {} as Beats;
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = +(ABS[k] - start).toFixed(4);
  out.end = +(end - start).toFixed(4);
  out.truck = +(end - TRUCK_DUR - start).toFixed(4);
  return out;
}

/** Absolute -> local. */
export const local = (abs: number, start: number = S05_START) => +(abs - start).toFixed(4);
