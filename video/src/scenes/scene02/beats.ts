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

/** Storyboard beats (absolute s). Small elements LEAD their word by ~0.10 s with out-type starts (ENGINE rule 5,
 *  motion_spec 7: nothing visibly starts more than 70 ms after its word); fix round 1 retimed every lead. */
const ABS = {
  cut: S02_START, //                        cut(purpose): the matchcut lands, the sheet draws outward from the lock
  pipLand: 4.865, //                        w15+0.15 'because': Pip lands on the rod with a squash
  coverOpen: 4.855, //                      w16-0.10 'of': the lock cover swings open (out(cubic), diagram dashes)
  boltTest: 5.005, //                       w17-0.10 'this': the bolt shoots out, SLAMS to a stop short of the socket
  bug: 5.205, //                            w18-0.10 'bug': peach gap + bold bracket + ring draw on
  bitPeek: 5.235, //                        w18-0.07 'bug': Bit peeks out of the socket, antennae up
  site: 5.695, //                           w19 'where': site icon draws on, connector runs lock -> icon
  L1: 5.775, //                             w19+0.08 'where': label L1 (static title-block tag)
  handIn: 5.825, //                         w20-0.05 'hackers': the dashed hand slides in (0.3 s, out(cubic))
  could: 6.18, //                           w21-0.10 'could': Bit's antennae flatten; connector dashes march one step
  turn: 6.34, //                            w22-0.08 'take': the thumb-turn turns 90 deg (0.2 s out(cubic)), bolt retracts
  take: 6.42, //                            w22 'take': (lock_click SFX; the bolt is visibly moving, home ~6.5)
  L2: 6.85, //                              w25-0.05 'site' (fix round 2; storyboard w22+0.15): label L2 + its curved
  //                                        leader, AFTER the 'over' payoff (flag + ring settled), not inside it
  arrow: 6.475, //                          w23-0.16 'over': the arrow runs along the connector, lands on the word
  bitHide: 6.575, //                        w23-0.06 'over': Bit ducks into the socket (out(quad))
  taken: 6.535, //                          w23-0.10 'over': the icon's window floods dark + hatching (starts on the word)
  flag: 6.615, //                           w23-0.02 'over': the big flag pops on the roof, the icon squash-pops
  ring: 6.605, //                           w23-0.03 'over': an ink ring pops round the icon and runs out
  siteWord: 6.82, //                        w25-0.08 'site': the icon jolts, its padlock pops open
  release: 7.05, //                         (between 'site' and 'without'): the hand lets go of the turned knob, hovers
  erase: 7.175, //                          w26-0.10 'without': an eraser rubs a patch of paper clean beside the loupe
  without: 7.275, //                        w26 'without': key glyph draws in the patch, then an ink cross
  pipLean: 7.67, //                         w28 'password': Pip leans and looks down at the crossed key (0.1 s)
  pipCover: 7.77, //                        w28+0.10 'password': GAG: Pip ears-cover (x1.3, big worry marks, shiver)
  flutter: 8.03, //                         end(password)-0.15: the flag flutters; the cross ink settles
  handOut: 8.03, //                         end(password)-0.15 (fix round 2; storyboard cut-0.12): the hand pulls back out
  //                                        past the sheet edge, in(cubic) 0.34 s: visible over ~9 frames, gone by 8.36
  pipEars: 8.04, //                         end(password)-0.14: Pip lifts his ears (stand-side, wide) and crouches
  pipHop: 8.10, //                          end(password)-0.08 (fix round 2; storyboard cut-0.04): takeoff; on S02's last
  //                                        frame he is in the air one S03 frame from S03's pickup (Scene02 PIP_OUT)
  bitPop: 8.273, //                         cut(password)-0.12: Bit pops back up in the socket
} as const;

export type BeatName = keyof typeof ABS;

/** Scene-local beat times. */
export const B: Record<BeatName, number> = Object.fromEntries(Object.entries(ABS).map(([k, v]) => [k, +(v - S02_START).toFixed(4)])) as Record<BeatName, number>;

/** The last FILM frame inside S02 (30 fps): film frame 251 = 8.3667 s; S03's first frame is 8.400 s. */
export const LAST_FRAME_ABS = Math.floor(S02_END * 30 - 1e-6) / 30;

/** Scene-local time of an absolute film time. */
export const local = (abs: number) => abs - S02_START;
