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
  pipLand: W.even - 0.01, // Pip touches down on the sill's left end ON 'Even' (his hop enters past the left edge at f0)
  ringHiccup1: W.the, // the loading ring hiccups; a pigeon on the cornice shuffles
  barFlicker: W.fbi, // the bar's fill edge flickers without moving
  earFlick: W.fbi + 0.25, // Pip's ear flicks toward the window
  notice: W.said - 0.1, // L14 taped up inside the window (4 tape strips 0.04 s apart): fully up as 'said' is heard
  lookNotice: W.if, // Pip looks up at the notice
  snailShell: W.you, // the snail's shell appears at the sill's right edge
  barStep: W.cant, // bar 8 % -> 9 %, stalls
  snailCrawl: W.update, // the snail crawls onto the sill (slow)
  cornShuffle: W.update + 0.25, // the cornice pigeon's second shuffle: splits the 'update' -> 'yet' gap
  barBack: W.yet, // bar twitches back 9 % -> 8 %; the ring hiccups
  glanceSun: W.yetEnd + 0.05, // Pip glances from the bar up to the sun
  glyph: W.just - 0.1, // the power glyph inks onto the sun
  press: W.turn, // the sun is PRESSED (SunPress 0.88 + ripple)
  shutter: W.it, // govB's shutter rolls down clean (0.16 s + 6 px bounce), covering the bar and the notice
  lightsOut: W.off, // govB one palette step darker
  offCut: 49.515, // cut(off): the comma pause after 'off,' (gap anchor): the lean into the joke starts here
  padlock: W.off + 0.14, // padlock pops + the lettered 'back soon' tag swings in
  // the switch-off spreads, AFTER the padlock beat (the padlock + tag are the only focal event on 'off'):
  govAScreen: W.is + 0.02, // govA's screen CRT-collapses on 'is', with its shutter (S12 opens with it dark) ...
  govAShutter: W.is + 0.06, // ... its shutter slams on 'is' ...
  govAOff: W.is + 0.2, // ... and govA steps one palette step darker
  govCScreen: W.basically, // govC's screen collapses at the right edge on 'basically' ...
  govCShutter: W.basically + 0.14, // ... and its shutter drops half way (S12: govC half shut)
  civicOff: W.supports + 0.03, // the far civic silhouettes step dark left to right (0.1 s apart) from "support's" ...
  civicLanterns: W.answer + 0.15, // ... and their lanterns pop off after them ('answer' -> 'to')
  bitHop: W.offEnd + 0.05, // Bit hops onto the padlock's shackle; the snail pulls into its shell
  pigeonLand: W.which, // the lean-in starts; a pigeon lands on the shutter box
  tagTwirl: W.is - 0.12, // the tag twirls once in a breeze (its first narrowing lands on 'is')
  antennae: W.basically, // the snail pokes one antenna out, then the other (span 0.4)
  noteDrop: W.basically - 0.08, // the note drops from behind govB's cornice (blank back, tumbling; visible from ~'basically')
  noteSlap: W.tech - 0.05, // ... flips to its lettered face and slaps flat onto the closed shutter (J6)
  noteCurl: W.supports, // the note's corner curls once; Bit looks up at it
  preen: W.supports + 0.25, // a pigeon on the cornice preens; the tag stills
  shrug: W.answer, // GAG: Pip turns toward the sun and does a tiny shrug (0.5 s)
  glint: W.to, // the padlock glints; the pigeon on the shutter box hops
  bitTap: W.toEnd - 0.05, // Bit taps the padlock's shackle
  strike: W.everything + 0.01, // 'and on again' gets one ink strike-through (0.15 s) ON the word; the corner flutters after
  pipOut: W.everythingEnd + 0.05, // Pip hops off the sill toward the lens; the snail peeks out
  tagSway: SCENE.end - 0.1, // the tag sways
  pigeonFly: SCENE.end - 0.3, // the box pigeon crouches and takes off up-left (whole bird, flapping): clear of the box by the cut
} as const;

export type Beats = {-readonly [K in keyof typeof ABS]: number};

/** Scene-local beat times for a scene that starts at `start` (film seconds). */
export function localBeats(start: number): Beats {
  const out = {} as Beats;
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = ABS[k] - start;
  return out;
}
