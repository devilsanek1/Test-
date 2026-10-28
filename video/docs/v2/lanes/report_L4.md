# Report L4: V2S5 "The far side" (the Arlington crane, film 20.55-23.80), conformed 2026-10-28
**Clip:** `video/deliverables/v2/lanes/v2r_L4_S5_0.4.mp4`: Film2R 20.30-24.30 at 0.4 (432x768, 60 fps, voice), so S4's push into the sun, all of S5 and the blossom-tree wipe into S6 (both joins with >= 0.25 s either side).
**Built:**
- **Push-through in:** it plays now (World stage flat: S5 opens zoomed on its April sun at SUN1 and rests by 20.72). Before, the rig never applied the transition camera.
- **One crane on one p:** the deck plane runs on its own pace `deckP` with the same beats: swap 22.117, "Pentagon" 22.43, landing 23.40.
- **Sky:** one screen-space gradient, `world/skies` `S5_SKY`. It has no sun warmth (that read khaki at C* 11.5).
- **One atmosphere:** `S5_ATM` (V2S5_depth), air `S5_AIR` #F6D9BC, steps .12 / .22 / .66 / .90, hueTurn 30.
  - Far city: a calm peach-gold band; its shade is a warm step of the lit stone, one value per role.
  - River at +2.6.
  - The dc kit's valley and Pentagon are forked onto this air (V2S5_valley, V2S5_pentagon).
- **Tiers:** every plane is C.
  - The news box is A 20.90-21.75; its page calms one step behind the lamppost at 22.03.
  - The Pentagon is A from 22.43: grey roof, tone-on-tone wells, one closed outline in its own shade.
  - The plaque is A from its pop.
- **Light:** `s5Rig(p)` (V2S5_light): RIG_APRIL's family, with the shadows swinging 15 -> 165 deg with the sun's screen spot (no pop at the swap). One ShadowLayer per plane holds:
  - contacts under every prop and person, and casts;
  - the canopy dapple;
  - the Pentagon's cast in the rig's tint.
- **Deck:** one calm lit paving; joints to the VP drawn as tone bands; the start's root foot plus petal drifts (conform §4).
- **Particles, seen at phone size:**
  - 2 + 2 petals, 30-36 px;
  - motes, 7-10 px far and 2 near at 12-16 px;
  - pale V's of birds, never over the obelisk.
- **Wipe:** the S5 -> S6 `Wiper` is one calm blossom tree passing right to left.
  - Two suns never share a frame: S5's sun is covered by 23.717, S6's emerges ~23.84.
  - No clouds above the clip, matching S6.
- **Water:** isolated and unstyled (`S5Water` / `S5_WATER`: a one-line swap for lib/water).
**Checks (all on the final state, HEAD 45d88e9):**
- **check_depth 21.0 / 23.4:** 0 FAIL.
  - Far city dE 5.4 / 5.7 from the air.
  - Silhouettes: news box median 23.5, Pentagon 16.4.
  - Ground: 48 % / 36 % of the lines run to the VP.
  - WARNs kept: the river vs the lawns ladder (14.9 vs 14.4); far edges 0.81x; the plaque at 8.3 (a K3 limit).
- **check_light A/B:** OK at both.
  - 21.0: brightest 5 % 0.000 H from the news box, greyed 490 px.
  - 23.4: 0.128 H from the Pentagon, greyed 512 px.
  - Band spread 0.0 at both.
- **Banding:** PASS on 4 open-sky regions plus the band (dL* 0.02, dE00 0.07).
- **Caption band, every frame:** clean except f1233 (20.550: the push-through's zoomed sun cap, the Film's design).
- **Lints:** skyProblems [], particleProblems [] (6 fields). floatProblems n/a: no float, since the holds are 0.6 s and 0.2 s between the joins and the crane.
- **Typecheck:** tsc 0 errors.
- **Line (measure.py), over the 80 / 40 targets, not met:** 21.0: 63 strokes/Mpx, 135 near-miss, 0.77 % dark-line px. 23.4: 108 / 365 / 0.98 %, driven by the Pentagon's ring identity, the plaque's letters and the deck figures' kit lines.
- **camspeed:** crane max 14.3 px/f (15.8 inside the lamppost allowance 1.47-1.64). The push-through 0.07-0.15 is the Film's transition.
- **End-hold movers:** 4 (two walkers, the V's, a petal).
**Critic (one pass):** 6 must-fixes, all done: the bank biting the sun; the empty start floor; dark birds crossing the obelisk; the wipe's cloud seam; the grey-olive Pentagon cast; the news page out-shouting the reveal. Plus its scale note (wells tone-on-tone).
**Notes vs conform:**
- The slot blossom's A (20.70-20.90) is carried by the burst, with no outline (a 12-frame outline would flicker).
- The V's ride in with the pan at ~21.83 (not 70-80 % of the move) so they never cross the obelisk.
- The light swings continuously rather than switching at the swap.
**REQUESTS:**
- L5 (K3):
  - NewsBox headline default 34 (S5 re-letters it).
  - Declare NewsBox's tone, so its A outline draws in its own shade, not the pen's default #4B2A1E (L* 21).
  - A darker panel or hedge option for Plaque (fill step 8.3 on light paving).
- rigs.ts owner: a `lawn` tint in RIG_APRIL (the Pentagon's cast reads h 105 on the lawn edge; paving is fine).
- L3: S4's gasholder X-brace crosses its sun at 20.50-20.53, a "crossed-out" sun into the push-through.
- dc kit owner: an atmosphere param on valley/pentagon would let S5 drop its forks.
