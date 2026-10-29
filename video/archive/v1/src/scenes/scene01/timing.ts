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
  // govB's CRT collapse: at t = 0 its screen IS the bright horizontal line, held until 'Governments' (fix round, hook
  // review: dead by f3 it was over before the first word; now line -> dot -> dead plays f6-f9 under shutdown ring 1,
  // click 1 and the punch, and the 0.34 head turn answers it) = ring[0].at
  crtB: 0.19,
  // Pip flinches at the click of the press (frame 0 is untouched: the jolt's anticipation starts after it)
  pipFlinch: 0.12,
  // Hook pass 2: the power-button sun PRESSES four more times (glyph 1 -> 0.9 -> 1, the bottom of each press = `at`, the
  // click on the sound lane) and each press emits a SHUTDOWN RING from the rim (screen px, out(quad), thinning to 40 %,
  // popping off on its last frame). Emit times are solved so each ring crosses its target ON its word (camera.ts screen
  // positions at the hit): ring 1 on 'Governments' sweeps the crowd as heads turn (0.34); ring 2's band reaches govA's
  // screen (its near edge) ON 'all' (crtA 0.63); ring 3's band crosses govC's screen centre ON 'over' (crtC 0.885);
  // ring 4, the big one, leaves on 'Europe' and sweeps out across the plaza while the far skyline steps dark.
  ring: [
    // fix round (hook review: a 6 px band read as a pencil hairline at phone size): 12 px bands (14 for the big one)
    {at: 0.19, r1: 680, dur: 0.3, w: 12}, // sweeps govB's dying screen (0.19-0.28), the far row / sB / fC heads at 0.34
    {at: 0.537, r1: 780, dur: 0.3, w: 12}, // r 483 = govA's screen, near edge, at 0.63
    {at: 0.873, r1: 720, dur: 0.3, w: 12}, // r 204 = govC's screen centre at 0.885
    {at: 1.155, r1: 1250, dur: 0.45, w: 14}, // the far skyline at once, then out across the plaza; r ~1130 at 1.455
  ],
  // 'Governments' w0+0.15
  heads: 0.34,
  // 'all' w1-0.10: govA's screen collapses; a walker slows
  crtA: 0.63,
  // 'over' w2-0.05: govC's screen collapses; three pigeons land (0.06 s stagger)
  crtC: 0.885,
  pigeonsLand: 0.885,
  // 'Europe' w3: the far civic skyline steps dark as WHOLE shapes, left to right, 0.06 s apart
  civicOff: [1.155, 1.215, 1.275],
  // the two far domes' lanterns: kit v3b PLAZA_CIVIC wave order (domeF 0, templeM 1, spireB 2, spireM 3, domeB 4,
  // templeF 5) steps domeF 1.155 ... templeF 1.455; with civicLanternsOffAt 1.215 domeF's lantern pops 1.215 (one step
  // after its dome) and domeB's WITH its dome at 1.395 (the kit never darkens a lantern before its dome)
  civicLanterns: [1.215, 1.275],
  // w3+0.25: a citizen and the left edge onlooker raise phones (lit screens)
  phonesUp: 1.405,
  // 'just' w4: the power glyph glints (fix round 5: ON the glyph, a 1 -> 1.12 -> 1 scale pop from 1.52 peaking 1.565 on
  // the word, cream sparks from 1.535; sun beats may lead their word by <= 0.05 s; the slam starts 1.55)
  glint: 1.565,
  glintPop: 1.52,
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
  // Hook pass 2 'on PURPOSE': govB's big 'back soon' tag (on the shutter slats) swings on from tags[0] and SLAPS flat
  // against the shutter ON 'PURPOSE' (camera: a x1.10 snap landing here, settling to x1.04 by 4.25, + a 14 px jolt)
  purposeSlap: 3.955,
  // the dive rushes govB's slats up through the (empty) caption band in its last frames: the big tag pops off (one
  // shrunken frame) on f138 so nothing new draws above screen y 590 (its top would cross it on f139)
  slatTagOut: 4.385, // pops at the dive's zero-velocity start (hook review: popping mid-dive read as being sucked away)
  // 'PURPOSE' w14: govB's dome lantern pops off; heads turn back to the plaza; the three padlocks glint; Pip glances back
  domeLanternOff: 3.955,
  headsBack: 3.955,
  padlockGlint: [3.955, 3.985, 4.015],
  // the left edge onlooker lowers his phone in the pause before the dive (fix round 4: down by 4.28, so his arm hangs
  // again when the dive pulls him out of frame)
  onlookerPhoneDown: 4.03,
  // cut(purpose)-0.53: an ink ring POPS around govB's lock box (fix round 4: 0.08 s earlier than the resolved 4.265
  // anchor and a pop instead of a draw-on, so it reads fully by f126 and holds ~0.2 s before the dive)
  lockRing: 4.185,
  // Pip's take-off toward the lens (fix round 4: after a 2-frame crouch from 4.275; 1 frame before the dive so the
  // screen-space leap reaches S02's pickup at ~51-65 px per frame)
  pipExit: 4.35,
  // cut(purpose)-0.33: the dive (fixed 0.33 s, in(quad)); Pip hops toward the lens
  dive: 4.385,
  cut: 4.715,
} as const;
