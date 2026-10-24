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
  pipHop: W.plus + 0.1, // Pip leaps off the tram's tail onto the bollard
  siteL: W.something - 0.1, // siteL pops up (scaleY 0 -> 1.06 -> 1), siteM +0.10, siteR +0.20
  sunLand: W.something, // the sun lands over siteM ON the word
  second: W.like, // the nine second-row buildings pop up behind (0.04 s stagger); the caretaker tag is already there
  pieSpoke: W.half - 0.06, // the sun draws its one ink spoke
  pieCream: W.half, // HALF its disc pops cream (1/2 pie) on the word
  pipPerk: W.half + 0.2, // Pip's ears perk at the half-cream sun
  plaques: W.php - 0.1, // the hanging plaque signs swing out on every site (L, M, R 0.06 s apart)
  label: W.php + 0.15, // L13 rises on the A-frame sign
  pieSolid: W.sites - 0.3, // the pie settles (cream shrinks, spoke retracts); a second-row window lights
  walker: W.sites, // the walker heads up the street gap; Pip looks up at siteM's plaque
  flipM: W.run - 0.05, // siteM's plaque paper-flips to the OLD version
  bitIn: W.run + 0.22, // Bit drops onto the old plaque's chain and crawls to its corner
  flip2: W.versions, // five second-row plaques flip old (alternating, 0.04 s apart) + dust puffs
  cobweb: W.so, // a cobweb draws across the old plaque's corner: Bit is caught in it
  dust: W.so + 0.12, // dust specks pop under the old plaque
  cane: W.old, // the old emblem leans on a tiny cane
  cartIn: W.old + 0.15, // the makers' cart rolls in from the left (sign 'still fixed!', satchel of tags)
  droop: W.theyre, // the old emblem's ear droops (it sags further on its cane); a dust speck drifts down
  not: W.not, // Bit struggles in the web; the maker reaches into the satchel
  pullTag1: W.not - 0.15, // the maker pulls a tag from the satchel (gone 2 frames before the flick)
  toss1: W.not + 0.02, // ... and flicks it at siteL's plaque
  tick1: W.officially, // it lands on siteL's plaque: tick
  pullTag2: W.officially - 0.14, // the second tag comes out of the satchel
  toss2: W.officially + 0.03, // the toss that arcs OVER siteM's old plaque (0.36 s flight, over siteM ~0.2 s in)
  tick2: W.supported + 0.01, // lands on siteR's plaque: tick
  wave: W.supported + 0.06, // tiny tags pop onto the CURRENT second-row plaques, skipping the old ones
  hey: W.supported + 0.1, // GAG: Pip trunk-up 'hey!' at siteM's plaque (it was skipped)
  heyEnd: W.anymore + 0.2, // Pip settles back to sit-back
  update: W.anymore, // siteM's browser starts an update: the bar stalls at ~10 %, ring spinning; the cart rolls out right
  wobble: W.anymoreEnd - 0.1, // the old emblem's cane wobbles; the ring keeps spinning
  pipOut: W.anymoreEnd + 0.04, // Pip hops toward the right edge (mid-air at the cut, into S11)
} as const;

export type Beats = Record<keyof typeof ABS, number>;

/** Scene-local beat times for a scene that starts at `start` (film seconds). */
export function localBeats(start: number): Beats {
  const out: Partial<Record<keyof typeof ABS, number>> = {};
  for (const k of Object.keys(ABS) as (keyof typeof ABS)[]) out[k] = ABS[k] - start;
  return out as Beats;
}
