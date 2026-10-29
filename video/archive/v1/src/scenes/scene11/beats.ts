// S11 "Just turn it off": every beat as an ABSOLUTE film time on the recorded take (docs/storyboard_v3_resolved.json,
// assets/timing.json word starts), converted to scene-local seconds with the scene's real start (useScene().start).
// Word anchors (w = word index in assets/timing.json): 144 'Even' 45.850 ... 164 'everything.' 51.705 (end 51.895).

/** Recorded word starts (s) used by this scene: index -> start. */
export const W = {
  even: 45.85,
  the: 46.035,
  fbi: 46.195,
  said: 46.735,
  if: 47.095,
  you: 47.235,
  cant: 47.315,
  update: 47.575,
  yet: 47.995,
  yetEnd: 48.145,
  just: 48.365,
  turn: 48.69,
  it: 48.905,
  off: 49.065,
  offEnd: 49.4,
  which: 49.63,
  is: 49.735,
  basically: 49.99,
  tech: 50.235,
  supports: 50.55,
  answer: 51.035,
  to: 51.345,
  toEnd: 51.705,
  everything: 51.705,
  everythingEnd: 51.895,
} as const;

/** Storyboard scene window on the take (cut(anymore) -> cut(everything)). */
export const SCENE = {start: 45.618, end: 52.163};

/** Absolute beat times (storyboard S11 beats; leads per ENGINE rule 5 already applied by the storyboard). */
export const ABS = {
  cut: 45.618,
  pipLand: W.even + 0.02, // Pip touches down on the sill's left end ON 'Even' (his hop is still past the left edge at f0)
  // A1 fix round 2 (review: in Main f1369-f1370 his head and body crossed the film edge's bare left paper strip, x < 54):
  // the hop starts 0.03 s later from 30 px further left (x -300), so Main f1369 shows nothing of him and f1370 only the
  // trunk; the touch-down is 0.02 s into 'Even' (0.6 frame)
  ringHiccup1: W.the, // the loading ring hiccups; a pigeon on the cornice shuffles
  barFlicker: W.fbi, // the bar's fill edge flickers without moving
  earFlick: W.fbi + 0.25, // Pip's ear flicks toward the window
  notice: W.said - 0.16, // L14 taped up inside the window: LabelTag's grow lands the paper full ON 'said' (46.735), the 4
  // tape strips pop on the word
  lookNotice: W.if, // Pip looks up at the notice
  snailShell: W.you - 0.08, // the snail's shell is up ON 'you' (its pop lands 2-3 frames after `at`); the bar step owns "can't"
  // A1 polish (review: the % tile's 0.16 s paper flip made the new digit readable ~4 frames after the word): the bar
  // steps 0.08 s EARLY, so the jump + flash lead the word by 2 frames and the flip unfolds the new digit ON the word
  barStep: W.cant - 0.08, // bar 8 % -> 9 %, stalls
  snailCrawl: W.update, // the snail crawls onto the sill (slow)
  cornShuffle: W.update + 0.25, // the cornice pigeon's second shuffle: splits the 'update' -> 'yet' gap
  barBack: W.yet - 0.08, // bar twitches back 9 % -> 8 % (the 8 unfolds ON 'yet'); the ring hiccups; the page shakes 'no'
  alert: W.yet - 0.04, // the loader's '!' badge springs onto the ring (its 0.08 s pop lands on the word)
  glanceSun: W.yetEnd + 0.05, // Pip glances from the bar up to the sun
  glyph: W.just - 0.1, // the power glyph inks onto the sun
  press: W.turn, // the sun is PRESSED (SunPress 0.88 + ripple)
  shutter: W.it, // govB's shutter rolls down clean (0.16 s + 6 px bounce), covering the bar and the notice
  lightsOut: W.off, // govB one palette step darker
  offCut: 49.515, // cut(off): the comma pause after 'off,' (gap anchor): the lean into the joke starts here
  padlock: W.off + 0.02, // the padlock pops (ShutterPadlock's grow: first frame ~49.13, full ~49.20, ON the lock_click at 49.205) ...
  tag: W.off + 0.1, // ... and the lettered 'back soon' tag swings in on its nail right after it
  // the switch-off spreads as ONE outward ripple from govB in the comma pause after 'off,' (fix round 2: before the note
  // appears, so 'is' .. 'everything' carries only the note's own events): govA's screen + shutter (left neighbour), govC's
  // screen + half shutter (right neighbour), the far civic silhouettes (0.04 s steps, all six dark by ~49.72), then the
  // civic lanterns and the near lamp's lantern
  govAScreen: W.offEnd + 0.05, // govA's screen CRT-collapses (S12 opens with it dark) ...
  govAShutter: W.offEnd + 0.08, // ... its shutter slams ...
  govCScreen: W.offEnd + 0.12, // ... govC's screen collapses at the right edge ...
  govCShutter: W.offEnd + 0.18, // ... and its shutter drops half way (S12: govC half shut)
  civicOff: W.offEnd + 0.12, // the far civic silhouettes step dark, left to right, 0.04 s apart (6 steps: 49.52 .. 49.72)
  civicLanterns: W.offEnd + 0.32, // their lanterns pop off right after the last step (domeF 49.72, domeB 49.78)
  lampOff: W.offEnd + 0.32, // the near plaza lamp's lantern pops off (cream -> sand) at the left edge. govA does NOT step
  // darker (fix round 1: after 'off' the frame keeps its pale left third; govB's one step is the story beat)
  bitHop: W.offEnd + 0.05, // Bit hops onto the padlock's shackle
  snailHide: W.off + 0.14, // the snail SNAPS into its shell on the padlock's clunk (lock_click 49.205; fix round 3: was with
  // Bit's hop at 49.45, an eased pull-in that only showed 4-5 frames late)
  pigeonLand: W.which, // the lean-in starts; a pigeon lands on the shutter box
  tagTwirl: W.is - 0.12, // the tag twirls once in a breeze (its first narrowing lands on 'is')
  antennae: W.basically, // the snail pokes one antenna out, then the other (span 0.4)
  // A1 fix round 2 (review: it slid out from under the cornice band like paper fed out of the shutter box, then popped in
  // front of the cornice mid-fall): the tag's breeze lifts it off the TOP of the cornice ledge (0.1 s, tipping up on its
  // bottom edge at the lip, the cornice pigeon stepping off it), then it flutters down in front of the facade (0.42 s)
  noteDrop: W.is - 0.04,
  noteSlap: W.tech - 0.05, // ... flips to its lettered face and slaps flat onto the closed shutter (J6)
  noteCurl: W.supports, // the note's corner curls once; Bit looks up at it
  preen: W.supports + 0.25, // a pigeon on the cornice preens; the tag stills
  shrug: W.answer, // GAG: Pip turns toward the sun and does a tiny shrug (0.5 s), then settles facing us (no back view)
  glint: W.to, // the padlock glints; the pigeon on the shutter box hops
  // A1 polish (review: the strike started 0.05 s after the word and Pip's crouch overlapped it): the strike runs ON
  // 'everything' (51.705-51.855), Bit's tap (a 0.12 s peck) is done just before it, Pip's crouch starts when it ends
  // A1 fix round 1 (review: 51.565 sat 2.7 frames off the resolved 51.655): the peck now ENDS exactly as the strike
  // starts (51.585 + 0.12 = 51.705), 2.1 frames from the storyboard time
  bitTap: W.everything - 0.12, // Bit taps the padlock's shackle (the peck ends 51.705, ON the strike's first frame)
  strike: W.everything, // 'and on again' gets one ink strike-through (0.15 s) ON the word; the corner flutters after
  pipOut: W.everythingEnd + 0.05, // Pip hops off the sill toward the lens; the snail peeks out
  tagSway: SCENE.end - 0.1, // the tag sways
  // the box pigeon crouches (2 frames) and LAUNCHES on 52.037 (resolved 52.063: startled by Pip's leap, 2.8 frames after
  // his takeoff) with the tag sway, steeply up: Pip's leap heads for its perch, so it is ~35 px above it on f194 and
  // clear of his head from f195 (A1 fix round 2: crouch was 52.02, launch 52.087, up-left into his rising head)
  pigeonFly: 51.97,
} as const;

export type Beats = {-readonly [K in keyof typeof ABS]: number};

/** Scene-local beat times for a scene that starts at `start` (film seconds). */
export function localBeats(start: number): Beats {
  const out = {} as Beats;
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = ABS[k] - start;
  return out;
}
