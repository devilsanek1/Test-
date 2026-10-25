// S10 "Half on versions too old": every beat as an ABSOLUTE film time on the recorded take (docs/storyboard_v3_resolved.json,
// assets/timing.json word starts), converted to scene-local seconds with the scene's real start (useScene().start).
// Word anchors (w = word index in assets/timing.json): 128 'Plus' 39.705 ... 143 'anymore.' 44.985 (end 45.385).

/** Recorded word starts (s) used by this scene. */
export const W = {
  plus: 39.705, // w128
  something: 40.195, // w129
  like: 40.505, // w130
  half: 40.755, // w131
  of: 41.145, // w132
  php: 41.405, // w133
  sites: 41.905, // w134
  run: 42.295, // w135
  versions: 42.495, // w136
  so: 42.88, // w137
  old: 43.205, // w138
  theyre: 43.605, // w139
  not: 43.855, // w140
  officially: 44.025, // w141
  supported: 44.39, // w142
  anymore: 44.985, // w143
  anymoreEnd: 45.385,
} as const;

/** Storyboard scene window on the take: cut(server @0.8) -> cut(anymore). The tram wipe is centred on the start. */
export const SCENE = {start: 39.634, end: 45.618};

/** Absolute beat times (storyboard S10 beats; leads per ENGINE rule 5 are applied here). */
export const ABS = {
  cut: SCENE.start, // tram wipe centre (S09's Wiper); behind it the empty street in full day
  sketch: W.plus, // under the wipe the near row draws on as line art (siteL, siteM, siteR 0.06 s apart)
  pipHop: W.plus + 0.1, // Pip leaps off the tram's tail onto the bollard
  siteL: W.something - 0.1, // siteL pops up (scaleY 0 -> 1.06 -> 1), siteM +0.10, siteR +0.20 (with the gap wedge + walker)
  sunLand: W.something, // the sun lands over siteM ON the word
  second: W.like - 0.3, // the nine second-row buildings pop up behind (0.03 s stagger), settled by ~1.01 local: after the gap
  //   wedge, before the sun's spoke and HALF its disc (fix round 2b: was ON 'like' and landed on 'HALF'); the caretaker tag is there
  pieSpoke: W.half - 0.14, // the sun draws its one ink spoke
  pieCream: W.half - 0.08, // HALF its disc pops cream (1/2 pie): half grown ON the word, complete by +0.07 (rule 5)
  pipPerk: W.half + 0.2, // Pip's ears perk at the half-cream sun
  plaques: W.php - 0.1, // the hanging plaque signs swing out on every site (L, M, R 0.06 s apart)
  label: W.php + 0.15, // L13 rises on the A-frame sign
  pieSolid: W.sites - 0.3, // the pie settles (cream shrinks, spoke retracts); a second-row window lights
  walker: W.sites, // the walker heads up the street gap; Pip looks up at siteM's plaque
  walkerOut: W.old, // ... and has turned off behind siteR's wall (the gap is clear before the cart steps out)
  flipM: W.run - 0.15, // siteM's plaque paper-flips to the OLD version (fix round 3: the 0.2 s flip swaps its face at
  //   -0.05 and settles at +0.05: complete ON 'run', rule 5; was -0.05, settling 0.135 s after the word)
  bitIn: W.run + 0.12, // Bit drops onto the old plaque's chain and crawls to its corner (= flipM + 0.27, as before)
  flip2: W.versions - 0.1, // five second-row plaques flip old (alternating, 0.04 s apart) + dust puffs (fix round 3: -0.10,
  //   the wave's faces swap from -0.05 and land inside 'versions')
  cobweb: W.so - 0.1, // a cobweb draws across the old plaque's corner (rule-5 lead: it reads ON 'so'): Bit is caught in it
  dust: W.so + 0.02, // dust specks pop under the old plaque
  cane: W.old - 0.1, // the old emblem leans on a tiny cane (A1 FR1: rule-5 lead for a small element, was ON 'old')
  cartPark: W.not - 0.27, // the maker + cart walk out from behind the A-frame (fix round 3: hidden until the cobweb / Bit
  //   beat is over: the bed's nose shows from ~43.09, the maker from ~43.3; 16.5 px / frame on screen) and brake into the
  //   park spot on the open pavement 0.11 s before his first arm rises: the park and the throw are separate beats
  droop: W.theyre, // the old emblem's ear droops (it sags further on its cane); a dust speck drifts down
  not: W.not, // Bit struggles in the web; the maker reaches into the satchel
  lookCart: W.theyre + 0.1, // Pip turns to the parked cart
  // A1 FR1 (rule 5: check marks land ON the word): every hand-out beat moved earlier by the tick's delta, so the flight
  // durations (0.23 s / 0.5 s) are unchanged and the check (tickAt = landing + 0.03, 0.17 s draw) completes on the word
  toss1: W.not - 0.1, // his LEFT arm (raised 0.1 s before) lobs a tag back-left at siteL's plaque (0.23 s flight)
  tick1: W.officially - 0.04, // it lands beside siteL's plaque: tick (was ON the word: the check showed +0.075 s late)
  toss2: W.supported - 0.59, // his RIGHT arm (raised up over his head) lobs the second tag high OVER siteM's old plaque
  //   (A1 FR1: 0.53 s, was 0.5: the tag now lands BESIDE siteR's plate, 100 px further right, ~48 px / frame + the trail;
  //   released 0.045 s after the left toss, so the two tags are never in his hands together for more than a frame)
  skipNudge: W.officially + 0.02, // siteM's old plaque nudges as the tag sails over it (the lob crosses x 590 at 48 %)
  tick2: W.supported - 0.06, // lands beside siteR's plaque: tick + one stepped ink ring pulse (was +0.01: +0.11 s late)
  wave: W.supported + 0.06, // tiny tags pop onto the CURRENT second-row plaques, skipping the old ones
  hey: W.supported + 0.1, // GAG: Pip trunk-up 'hey!' at siteM's plaque (it was skipped)
  heyEnd: W.anymoreEnd - 0.21, // = pipOut - 0.12: Pip turns side-on (facing right) into the crouch of his hop out
  update: W.anymore, // siteM's browser starts an update: the bar stalls at ~10 %, ring spinning
  rollOut: W.supported + 0.33, // the cart rolls out right (sine ramp, <= 18 px / frame). A1 FR1: once the lob's trail has
  //   retracted and the arm is down (was 'anymore' + 0.05: by the cut it had moved only ~130 px and sat mid-frame); it
  //   is ~x 890 at the cut, leaving on 'anymore'
  wobble: W.anymoreEnd - 0.1, // the old emblem's cane wobbles; the ring keeps spinning
  pipOut: W.anymoreEnd - 0.09, // Pip hops out past the right edge (0.30 s: gone one frame before the cut, into S11)
} as const;

export type Beats = Record<keyof typeof ABS, number>;

/** Scene-local beat times for a scene that starts at `start` (film seconds). */
export function localBeats(start: number): Beats {
  const out: Partial<Record<keyof typeof ABS, number>> = {};
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = ABS[k] - start;
  return out as Beats;
}
