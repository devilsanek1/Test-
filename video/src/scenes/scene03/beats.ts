// S03 beat table: ABSOLUTE film seconds on the recorded take (docs/storyboard_v3_resolved.json S03, assets/timing.json
// words 29-46), converted to scene-local seconds by `beats(start)` (local = absolute - the scene's start; the start comes
// from src/data/scenes.json through useScene(), 8.393 today = cut(password)).
// Every beat is a word anchor; the comment names it the way the storyboard writes it. Leads follow ENGINE rule 5.

/** The scene's start / end on the take (src/data/scenes.json S03). */
export const S03_START = 8.393;
export const S03_END = 14.17;

/** Word starts (assets/timing.json). */
export const W = {
  its: 8.605, //            w29 'It's'
  in: 8.755, //             w30 'in'
  php: 8.96, //             w31 'PHP…'  (ends 9.815: the ellipsis)
  the: 10.135, //           w32 'the'
  language: 10.205, //      w33
  everyone: 10.64, //       w34
  loves: 11.105, //         w35 'loves,' (ends 11.605)
  and: 11.605, //           w36
  about: 11.795, //         w37
  seven: 11.955, //         w38
  out: 12.405, //           w39
  ten: 12.65, //            w41
  websites: 12.905, //      w42
  run: 13.485, //           w43
  it: 13.855, //            w45 'it.' (ends 13.945)
  this: 14.395, //          w46 'This' (S04: the sun touches down)
} as const;

/** Storyboard beats (absolute s). */
const ABS = {
  cut: S03_START, //            cut(password): HARD CUT, the bare plan with ten footprints; the 4 % breath starts
  grid: 8.605, //               w29 'It's': grid lines draw on (0.37 s)
  pipLand: 8.755, //            w30 'in': Pip lands on the blueprint at BLUEPRINT.pip with a squash
  stamp: 8.83, //               w31-0.13 'PHP': the stamp SLAMS (ring 0.13 s, print 2.6x -> 1.0x in 0.27 s); Pip bounces
  L3: 9.26, //                  w31+0.30 'PHP': label L3 pops on the title-block card
  popUp: 9.46, //               w31+0.50 'PHP': the city springs out of the plan (press first, then L1 R1 L2 R2 L3 R3 L4 R4 L5)
  allUp: 9.81, //               w31+0.85: every side building has started (0.035 s apart)
  pipSettle: 9.915, //          end(PHP)+0.10: Pip settles on the stamp; the roof vent puffs two sheets
  pressScreen: 10.135, //       w32 'the': the press house's browser window lights
  doorway: 10.305, //           w33+0.10 'language': a far walker steps out of a doorway; Bit's antennae twitch
  everyone: 10.54, //           w34-0.10 'everyone': six tiny walkers pop up (0.05 s); the two near walkers slide in
  loves: 11.105, //             w35 'loves': Pip puffs up proudly (sit-front, chest out, happy)
  looksUp: 11.355, //           w35+0.25: a far walker stops and looks up at the press house
  swing: 11.605, //             end(loves): the pen-nib sign swings, Bit riding it; the vent puffs
  spokes: 11.695, //            w37-0.10 'about': ten spokes draw across the sun (0.15 s)
  count: 11.955, //             w38 'seven': plaques tick P (re-pulse), L1, R1, L2, R2, L4, R3, 0.08 s apart
  flip: 12.505, //              w39+0.10 'out': the title-block card paper-flips to L4 (0.2 s)
  ten: 12.55, //                w41-0.10 'ten': three blank plates L3, L5, R4 (0.05 s apart) + 3 cream sun slices
  websites: 12.905, //          w42 'websites': the seven PHP screens light up in a wave (0.02 s)
  heads: 13.205, //             w42+0.30: the near walkers turn their heads; a far walker waves
  run: 13.485, //               w43 'run': walkers bob; Pip glances down the street (look 0.7); the vent puffs
  solid: 13.855, //             w45 'it.': the pie slices pop back to solid (spokes retract)
  sunHop: 13.945, //            end(it): the sun's low glide-hop (take-off; mid-air at (810,680) on the cut, lands on 'This')
  pipHop: 14.05, //             cut(it)-0.12: Pip hops off the stamp toward the stoop (crosses the cut)
} as const;

export type Beats = {-readonly [K in keyof typeof ABS]: number};

/** Scene-local beat times for a scene that starts at `start` (VO seconds). */
export function beats(start: number = S03_START): Beats {
  const out = {} as Beats;
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = +(ABS[k] - start).toFixed(4);
  return out;
}

/** Absolute -> local. */
export const local = (abs: number, start: number = S03_START) => +(abs - start).toFixed(4);
