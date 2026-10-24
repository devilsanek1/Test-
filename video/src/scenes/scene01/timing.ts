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
  // Pip flinches at the click of the press (frame 0 is untouched: the jolt's anticipation starts after it)
  pipFlinch: 0.12,
  // 'Governments' w0+0.15
  heads: 0.34,
  // 'all' w1-0.10: govA's screen collapses; a walker slows
  crtA: 0.63,
  // 'over' w2-0.05: govC's screen collapses; three pigeons land (0.06 s stagger)
  crtC: 0.885,
  pigeonsLand: 0.885,
  // 'Europe' w3: the far civic skyline steps dark as WHOLE shapes, left to right, 0.06 s apart
  civicOff: [1.155, 1.215, 1.275],
  // the two far domes' lanterns pop off ON their dome's step (domeB is silhouette 2, domeF 3 of the left-to-right wave),
  // so each step is one visible light event (fix round 1; was w3+0.25)
  civicLanterns: [1.215, 1.275],
  // w3+0.25: a citizen and the left edge onlooker raise phones (lit screens)
  phonesUp: 1.405,
  // 'just' w4: the power glyph glints
  glint: 1.565,
  // 'shut' w5: govB's shutter SLAMS: the 0.16 s drop LANDS on the word (ENGINE rule 5: a big motion completes ON the
  // word; the pop_low cue sits on the word), govB one step darker on landing
  slamB: 1.55,
  // 'down' w6: govA's shutter slams, lands on the word
  slamA: 1.82,
  // 'bunch' w8: govC's shutter drops only HALF way (gravity fall 0.16 x sqrt(0.5) = 0.113 s to its stop) and its
  // 1-frame jolt lands ON the word (fix round 2: 2.35 - 0.113)
  slamC: 2.237,
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
  // w12+0.30: padlocks pop onto the three closed shutters (0.06 s apart): govB, govA, govC; led by 0.04 s so the
  // 20% -> 100% grow reads ON each lock_click
  padlocks: [3.345, 3.405, 3.465],
  // w12+0.45: a pigeon circles back to the lamp
  pigeonBack: 3.535,
  // 'on' w13-0.10: the lettered 'back soon' tags swing on (pendulum -16 -> 0, 0.35 s, 0.05 s stagger)
  tags: [3.695, 3.745, 3.795],
  // 'PURPOSE' w14: govB's dome lantern pops off; heads turn back to the plaza; the three padlocks glint; Pip glances back
  domeLanternOff: 3.955,
  headsBack: 3.955,
  padlockGlint: [3.955, 3.985, 4.015],
  // cut(purpose)-0.45: a small ink ring pops around govB's lock box
  lockRing: 4.265,
  // cut(purpose)-0.33: the dive (fixed 0.33 s, in(quad)); Pip hops toward the lens
  dive: 4.385,
  cut: 4.715,
} as const;
