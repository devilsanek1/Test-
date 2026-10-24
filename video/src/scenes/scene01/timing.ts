// S01 beat sheet: every time is SCENE-LOCAL seconds (S01 starts at 0, so local = film time). Word starts from
// assets/timing.json (recorded take, w0..w14); beat anchors from docs/storyboard_v3_resolved.json (S01 beats);
// leads per ENGINE rule 5 are applied here (slams land on their word, small pops lead by ~0.1 s).

/** Word starts (assets/timing.json). */
export const W = {
  governments: 0.19,
  all: 0.73,
  over: 0.935,
  europe: 1.155,
  just: 1.565,
  shut: 1.71,
  down: 1.98,
  a: 2.205,
  bunch: 2.35,
  of: 2.565,
  their: 2.685,
  own: 2.885,
  websites: 3.085,
  on: 3.795,
  purpose: 3.955,
  end: 4.715, // cut(purpose): the S02 matchcut
} as const;

/** Beats (resolved storyboard anchors, with the ENGINE rule-5 leads where a motion must LAND on its word). */
export const B = {
  // START: frame 0 = the bottom of the SunPress; the press releases, govB's bright line collapses to a dot
  pressAt: -0.08, // pressScale bottom (0.88) lands exactly on t = 0
  rippleAt: 0, // the ripple ring leaves the rim at frame 0 (r155 -> r195, 0.2 s)
  crtB: -0.05, // govB's CRT collapse: at t = 0 its screen IS the bright horizontal line
  // 'Governments' w0+0.15
  heads: 0.34,
  // 'all' w1-0.10: govA's screen collapses; a walker slows
  crtA: 0.63,
  // 'over' w2-0.05: govC's screen collapses; three pigeons land (0.06 s stagger)
  crtC: 0.885,
  pigeonsLand: 0.885,
  // 'Europe' w3: the far civic skyline steps dark as WHOLE shapes, left to right, 0.06 s apart
  civicOff: [1.155, 1.215, 1.275],
  // w3+0.25: two far dome lanterns pop off; two citizens raise phones
  civicLanterns: [1.405, 1.455],
  phonesUp: 1.405,
  // 'just' w4: the power glyph glints
  glint: 1.565,
  // 'shut' w5: govB's shutter SLAMS (0.16 s drop lands just after the word onset); govB one step darker on landing
  slamB: 1.64,
  // 'down' w6: govA's shutter slams
  slamA: 1.91,
  // 'bunch' w8: govC's shutter drops only HALF way and jolts
  slamC: 2.28,
  // 'of' w9: a citizen points up at govC; a pigeon shuffles
  point: 2.565,
  shuffle: 2.565,
  // 'their' w10: the lamp lantern goes off; pigeons scatter (+0.06)
  lampOff: 2.685,
  pigeonsFly: 2.745,
  // 'own' w11: GAG Pip startles, trunk-up hop on the bollard (0.15 s air, lands on 'websites')
  pipHop: 2.885,
  pipLand: 3.035,
  pipBack: 3.24,
  phoneDown: 3.035,
  // w12+0.30: padlocks pop onto the three closed shutters (0.06 s apart): govB, govA, govC
  padlocks: [3.385, 3.445, 3.505],
  // w12+0.45: a pigeon circles back to the lamp
  pigeonBack: 3.535,
  // 'on' w13-0.10: the lettered 'back soon' tags swing on (pendulum -16 -> 0, 0.35 s, 0.05 s stagger)
  tags: [3.695, 3.745, 3.795],
  // 'PURPOSE' w14: govB's dome lantern pops off; heads turn back to the plaza
  domeLanternOff: 3.955,
  headsBack: 3.955,
  // cut(purpose)-0.45: a small ink ring pops around govB's lock box
  lockRing: 4.265,
  // cut(purpose)-0.33: the dive (fixed 0.33 s, in(quad)); Pip hops toward the lens
  dive: 4.385,
  cut: 4.715,
} as const;
