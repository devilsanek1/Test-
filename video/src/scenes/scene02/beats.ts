// S02 beat table: ABSOLUTE film seconds on the recorded take (docs/storyboard_v3_resolved.json, assets/timing.json),
// converted to scene-local seconds by `local()` (local = absolute - the scene's start from src/data/scenes.json).
// Every beat is a word anchor; the comment names it the way the storyboard writes it.

/** The scene's start on the take (src/data/scenes.json S02.start = cut(purpose)). */
export const S02_START = 4.715;
/** The scene's end (cut(password)). */
export const S02_END = 8.393;

/** Word starts (assets/timing.json, words 15-28). */
export const W = {
  because: 4.715,
  of: 4.955,
  this: 5.105,
  bug: 5.305,
  where: 5.695,
  hackers: 5.875,
  could: 6.28,
  take: 6.42,
  over: 6.635,
  a1: 6.825,
  site: 6.9,
  without: 7.275,
  a2: 7.585,
  password: 7.67,
  passwordEnd: 8.18,
} as const;

/** Storyboard beats (absolute s). */
const ABS = {
  cut: S02_START, //                        cut(purpose): the matchcut lands, the sheet draws outward from the lock
  pipLand: 4.865, //                        w15+0.15 'because': Pip lands on the rod with a squash
  coverOpen: 4.955, //                      w16 'of': the lock cover swings open (diagram dashes)
  boltTest: 5.105, //                       w17 'this': the bolt shoots out and STOPS SHORT
  bug: 5.305, //                            w18 'bug': gap bracket + ring, Bit peeks out
  site: 5.695, //                           w19 'where': site icon draws on, connector runs lock -> icon
  L1: 5.775, //                             w19+0.08 'where': label L1 (static title-block tag)
  handIn: 5.825, //                         w20-0.05 'hackers': the dashed hand slides in (0.3 s, out(cubic))
  could: 6.28, //                           w21 'could': Bit's antennae flatten; connector dashes march one step
  take: 6.42, //                            w22 'take': the hand turns the thumb-turn 90 deg, the bolt retracts
  L2: 6.57, //                              w22+0.15 'take': label L2 + its leader
  over: 6.635, //                           w23 'over': arrow along the connector, hatching, flag; Bit ducks
  siteWord: 6.9, //                         w25 'site': the icon's padlock dot pops open
  release: 7.05, //                         (between 'site' and 'without'): the hand lets go of the turned knob, hovers
  without: 7.275, //                        w26 'without': key glyph draws beside the lock, then an ink cross
  pipCover: 7.77, //                        w28+0.10 'password': GAG: Pip ears-cover
  flutter: 8.03, //                         end(password)-0.15: the flag flutters; the cross ink settles
  handOut: 8.273, //                        cut(password)-0.12: the hand slides out; Bit pops back up
  pipHop: 8.353, //                         cut(password)-0.04: Pip lifts his ears and hops off toward the lens
} as const;

export type BeatName = keyof typeof ABS;

/** Scene-local beat times. */
export const B: Record<BeatName, number> = Object.fromEntries(Object.entries(ABS).map(([k, v]) => [k, +(v - S02_START).toFixed(4)])) as Record<BeatName, number>;

/** Scene-local time of an absolute film time. */
export const local = (abs: number) => abs - S02_START;
