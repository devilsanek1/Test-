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
  bug: 5.205, //                            w18-0.10 'bug': peach gap + bold bracket + ring draw on; the camera PUNCH
  //                                        starts (camera.ts: +6 % in 0.10 s, lands ON 'bug' 5.305 with a jolt)
  bitPeek: 5.235, //                        w18-0.07 'bug': Bit peeks out of the socket, antennae up, popping x1.35
  bitHit: 5.305, //                         w18 'bug': ... ON the word (scale peak + antenna flick), settles to x1.15
  site: 5.695, //                           w19 'where': site icon draws on, connector runs lock -> icon
  L1: 5.775, //                             w19+0.08 'where': label L1 (static title-block tag)
  handIn: 5.775, //                         w20-0.10 'hackers' (polish: was w20-0.05 in 0.3 s out(cubic), a 3-frame pop):
  //                                        the dashed hand slides in from the sheet's edge, 0.40 s out(quad), ~70 -> 0 px
  //                                        per frame, settled at 6.175, before 'could'
  could: 6.18, //                           w21-0.10 'could': Bit's antennae flatten; connector dashes march one step
  turn: 6.34, //                            w22-0.08 'take': the thumb-turn turns 90 deg (0.2 s out(cubic)), bolt retracts
  take: 6.42, //                            w22 'take': (lock_click SFX; the bolt is visibly moving, home ~6.5)
  L2: 7.45, //                              w27-0.135 'a' (hook pass 2; was 6.70 on 'over', polish; storyboard w22+0.15):
  //                                        label L2 pops after the takeover push has pulled back (7.24), so the push never
  //                                        crops it; its leader draws at +0.12 (7.57) and its dot lands ON 'password'
  //                                        (7.67). Sound lane: pop_mid 'L2 tag' -> 7.45
  arrow: 6.475, //                          w23-0.16 'over': the arrow runs along the connector, lands on the word
  bitHide: 6.575, //                        w23-0.06 'over': Bit ducks into the socket (out(quad))
  taken: 6.535, //                          w23-0.10 'over': the icon's window floods dark + hatching (starts on the word)
  flag: 6.585, //                           w23-0.05 'over': the big flag pops on the roof (0.1 s outBack from 0.3: full
  //                                        size on the word), the icon squash-pops
  ring: 6.605, //                           w23-0.03 'over': an ink ring pops round the icon and runs out
  siteWord: 6.82, //                        w25-0.08 'site': the icon jolts, its padlock pops open
  release: 7.05, //                         (between 'site' and 'without'): the hand lets go of the turned knob, hovers
  erase: 7.03, //                           w26-0.245 'without': an eraser rubs a patch of paper clean beside the loupe
  keyDraw: 7.10, //                         w26-0.175 'without': the key glyph draws in the patch (0.1 s), led in
  without: 7.275, //                        w26 'without': the ink cross strikes the key ON the word (ENGINE rule 5)
  pipLean: 7.67, //                         w28 'password': Pip leans and looks down at the crossed key (0.1 s)
  pipCover: 7.77, //                        w28+0.10 'password': GAG: Pip ears-cover (x1.3, big worry marks, shiver)
  flutter: 8.03, //                         end(password)-0.15: the flag flutters; the cross ink settles
  handOut: 8.03, //                         end(password)-0.15 (fix round 2; storyboard cut-0.12): the hand pulls back out
  //                                        past the sheet edge, in(cubic) 0.34 s: visible over ~9 frames, gone by 8.36
  pipEars: 8.20, //                         end(password)+0.02 (polish: the ears-cover gag now holds 0.43 s): Pip lifts his
  //                                        ears (stand-side, wide) and crouches 0.04 s
  pipHop: 8.24, //                          end(password)+0.06 (storyboard cut-0.04 = 8.353): takeoff; on S02's last frame
  //                                        he is ON S03's ballistic drop, at its position and velocity (Scene02 PIP_OUT)
  bitPop: 8.273, //                         cut(password)-0.12: Bit pops back up in the socket
} as const;

export type BeatName = keyof typeof ABS;

/** Scene-local beat times. */
export const B: Record<BeatName, number> = Object.fromEntries(Object.entries(ABS).map(([k, v]) => [k, +(v - S02_START).toFixed(4)])) as Record<BeatName, number>;

/** The last FILM frame inside S02 (30 fps): film frame 251 = 8.3667 s; S03's first frame is 8.400 s. */
export const LAST_FRAME_ABS = Math.floor(S02_END * 30 - 1e-6) / 30;

/** Scene-local time of an absolute film time. */
export const local = (abs: number) => abs - S02_START;
