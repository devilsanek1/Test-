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
  grid: 8.445, //               w29-0.16 'It's': the NEAR grid rows draw on (0.3 s), completing the plan FAR -> NEAR (the far +
  //                            mid rows, rays, horizon and plan furniture are inked from the cut), a big-build lead
  //                            (ENGINE rule 5) so the grid is down on 'It's'
  pipLand: 8.755, //            w30 'in': Pip lands on the blueprint (the stamp's rump, cast.tsx PIP_AT) with a squash
  stamp: 8.83, //               w31-0.13 'PHP': the stamp SLAMS: ink ring 0.06 s, the print pops 2.6x at 8.89 and drops (in-quad)
  //                            to 1.0x in 0.10 s: CONTACT at 8.99 ('PHP'+0.03), a 2-frame impact; Pip jolts + bounces
  contact: 8.99, //             the print's contact frame (stamp + 0.16): Pip's jolt + bounce, the plan's 2 px jolt
  popUp: 9.02, //               contact+0.03 'PHP' (hook pass: was w31+0.50 = 9.46, half a second after the word on ~1.07 s
  //                            of bare plan): the street is BUILT ON 'PHP': the stamp's impact (contact frame + the 2 px
  //                            plan jolt) triggers it, the press house's first frame is the jolt's second frame (film
  //                            f271, 9.033, already ~25 % up), then L1 R1 L2 R2 L3 R3 L4 R4 L5 0.035 s apart
  allUp: 9.34, //               popUp+0.32: every side building has started (L5); all settled by ~9.60
  L3: 9.55, //                  w31+0.59 'PHP' (hook pass: was w31+0.30 = 9.26, under the build): label L3 pops on the
  //                            title-block card AFTER the rows (L5 settling), its own beat in the ellipsis
  wire: 9.93, //                end(PHP)+0.115: the bird wire draws from L3's cornice to the sign pole (unchanged by the hook
  //                            pass: it was popAt.L5 + 0.15 off the old build)
  pipSettle: 9.915, //          end(PHP)+0.10: Pip settles on the stamp; the roof vent puffs two sheets
  birdHop: 10.07, //            w32-0.065 'the': a bird on the new wire hops and turns round (polish round 1: life in the
  //                            calm after the pop-up; the frame otherwise holds for the bait)
  pressScreen: 10.06, //        w32-0.075 'the' (A1: was the raw word time, its first frame landed 1 frame late; ENGINE
  //                            rule 5 small-element lead, ~2 frames): the press house's browser window lights
  doorway: 10.305, //           w33+0.10 'language': a far walker steps out of a doorway; Bit's antennae twitch
  everyone: 10.54, //           w34-0.10 'everyone': six tiny walkers pop up (0.05 s); the two near walkers slide in
  loves: 11.04, //              w35-0.065 'loves' (A1 lead, ~2 frames): Pip puffs up proudly, smug (half-lidded, closed smile, chin up -12 deg, chest
  //                            1.0 -> 1.14 -> 1.04 and held)
  proudOff: 11.695, //          w37-0.10 'about' (fix round 3; was end(loves)+0.10): the puff releases, eyes open, he looks up
  //                            at the sun as its spokes draw: the gag's button, then he watches the count
  looksUp: 11.30, //            w35+0.195 (A1: was +0.25; the bait's longest gap between event onsets was 0.73 s): a far
  //                            walker stops, leans back and lifts a hand to the brow to look up at the press house
  swing: 11.605, //             end(loves): the pen-nib sign swings, Bit riding it; the vent puffs
  spokes: 11.695, //            w37-0.10 'about': ten spokes draw across the sun (0.15 s)
  count: 11.955, //             w38 'seven': the count, CENTRE-OUT (A1), 0.06 s apart: P (its screen switches to the
  //                            elephant page), then the PHP screens R3, L4, R2, L2, R1, L1 (elephant page + a cream flash
  //                            disc + an inked orange ring): a wave travelling outward from the press house, done 12.255
  //                            (fix round 2b: the non-PHP sites are the mid-depth L3, R4, L5)
  flip: 12.30, //               count+0.35 (A1: was w39+0.10 = 12.505, on the same frames as the 7/10 sun slices at the
  //                            other corner): the title-block card paper-flips to L4 (0.2 s), settled when the slices pop
  ten: 12.55, //                w41-0.10 'ten': the non-PHP screens L3, R4, L5 blink and go dark (0.05 s apart) + 3 cream sun slices
  websites: 12.83, //           w42-0.075 'websites' (A1 lead, ~2 frames): the seven PHP pages re-pulse in a wave (0.02 s)
  heads: 13.205, //             w42+0.30: the near walkers turn their heads; a far walker waves
  run: 13.42, //                w43-0.065 'run' (A1 lead, ~2 frames): walkers bob; Pip glances down the street (open eyes, look 0.7, +5 deg lean) (no vent puff here: fix
  //                            round 1, it flew through the pie and the take-off)
  solid: 13.81, //              w45-0.045 'it.': the pie pops back to solid in ONE frame (slices + spokes gone together):
  //                            f162 (13.793) full pie, f163 (13.826) solid: 0.03 s before 'it.' (13.855, f164; ENGINE rule 5
  //                            +-0.05) and one frame before the take-off squash (sunHop - 0.1 = 13.845) (polish round 1:
  //                            was 13.78, 0.062 s early)
  sunHop: 13.945, //            end(it): the sun's low glide-hop (take-off; mid-air at (810,680) on the cut, lands on 'This')
  pipHop: 14.05, //             cut(it)-0.12: Pip hops off the stamp toward the stoop (crosses the cut)
} as const;

export type Beats = {-readonly [K in keyof typeof ABS]: number};

/** Scene-local beat times for a scene that starts at `start` (VO seconds). */
export function beats(start: number = S03_START): Beats {
  const out = {} as Beats;
  // fix round 3: 1 ms under the word time before rounding, so a beat that falls exactly on the 30 fps grid of the
  // scene's own preview (e.g. L3 0.8667 = f26) fires on its own frame, not one late (4-decimal rounding put it at 0.867)
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = +(ABS[k] - start - 1e-3).toFixed(4);
  return out;
}

/** Absolute -> local. */
export const local = (abs: number, start: number = S03_START) => +(abs - start).toFixed(4);
