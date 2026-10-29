// S06 "A heads-up": every beat as an ABSOLUTE film time on the recorded take (docs/storyboard_v3_resolved.json S06,
// assets/timing.json word starts), converted to scene-local seconds with the scene's real start (useScene().start,
// falling back to the storyboard start). Words 65 'They' 19.980 ... 71 'heads-up,' 21.285 (end 21.920).

import {useScene} from '../../lib';

/** Recorded word starts (assets/timing.json, words 65-71). */
export const W = {
  they: 19.98,
  gave: 20.085,
  the: 20.205,
  php: 20.385,
  people: 20.92,
  a: 21.165,
  headsUp: 21.285,
} as const;

/** Storyboard scene window on the take: cut(was) -> cut(heads-up). */
export const SCENE = {start: 19.773, end: 21.985} as const;

/** Absolute beat times (storyboard S06 beats; the leads of ENGINE rule 5 are already in the storyboard anchors). */
export const ABS = {
  cut: SCENE.start, // 19.773 cut on action: the messenger enters left mid-stride, the camera trucks right
  pipLand: SCENE.start + 0.1, // 19.873 Pip lands behind the messenger and tiptoes
  they: W.they, // 19.980 'They': the sun's press squash + the wax seal pops out along a dotted arc
  gave: W.gave, // 20.085 'gave': Bit peeks out of the messenger's collar
  php: W.php - 0.1, // 20.285 'PHP': the elephant sign swings; the peach glow pops in the slit under the blind
  shh: W.the + 0.15, // 20.355 GAG: Pip stops and goes 'shh'
  truckEnd: SCENE.start + 0.63, // 20.403 the truck lands (fixed 0.63 s), the 2 % breath starts
  door: W.php + 0.28, // 20.665 a neighbour's curtain is drawn; the messenger reaches the workshop door
  people: W.people - 0.1, // 20.820 'people': the upstairs browser window's screen lights
  a: W.a, // 21.165 'a': the envelope slides through the mail slot; Bit hops onto the sill
  headsUp: W.headsUp, // 21.285 'heads-up': three makers' heads pop UP into the upstairs window; the blind jolts
  click: W.a + 0.2, // 21.365 the mail-slot flap clicks
  sheet: W.headsUp + 0.25, // 21.535 the leak sheet flutters in at the left edge on a gust; Pip's ear twitches
  lift: SCENE.end - 0.21, // 21.775 the gust lifts the sheet toward the lens: the S07 lens wipe begins
  end: SCENE.end, // 21.985
} as const;

export type Beats = {-readonly [K in keyof typeof ABS]: number};

/** Scene-local beat times (s). */
export function useBeats(): Beats {
  const sc = useScene();
  const start = sc.id === 'S06' && sc.start > 0 ? sc.start : SCENE.start;
  const out = {} as Beats;
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = ABS[k] - start;
  return out;
}

/** Local -> absolute with the storyboard start (for pure functions that run outside the scene context). */
export const toAbs = (local: number) => local + SCENE.start;
