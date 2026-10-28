# v2r assembly to-do (orchestrator's list; details in each lane report)
- INTEGRATOR, 2026-10-28 (the five cross-shot items; before / after stills at 0.5 in video/out/integrator/, gitignored):
  1. DONE 6c23b41 (the session's checkpoint of these edits): map.ts S2 bench + figure boxes = V2S2_Layout (bench x 600-800,
     y 1110-1290; reporter x 640 / staffer x 718 seated on it, h 170 / 186), S2.aBoard x 110-510 (V2S2_Board's BOARD_SHIFT
     folded into the map: S2's pixels identical); S4 her far window 10 px left (x 125, her house's front follows it): 13-15 px
     clear of SUN1's limb (was 3-5), SUN1 untouched (S5's far plane is pinned to its r); the dive (15.01) and the push
     (20.45) change only at the window's edge. contractProblems 0 errors.
  2. DONE 84c6474: S8Window's stile from the transom down, the fanlight undivided (= S3's window; W's frame and spot
     unchanged, the seam identical in position). DONE 09a00c5: the flat mint edge at y ~556 (2335-2342) is gone: the sky's
     un-build foot rises onto S1's frame-0 skyline instead of a flat y 560, so the sky left over stands behind S1's pale
     roofs and contracts into SUN0 (no mint-to-paper edge in 2329-2344; was 540 columns).
  3. DONE 39f85e8: K3 NewsBox headline default body 34 + its tone (the slate box: its A outline in its own shade); K3
     Plaque `panel="dark"` (bronze-dark plate, limestone letters), used in S5: check_depth @23.4 plaque median |dL*| 6.9 ->
     27.2, one value 34 -> 2 %.
  4. DONE 86105cd (checkpoint): rigs.ts TINT_APRIL.lawn (CM.sage -> its own deeper step) in RIG_APRIL; S5's Pentagon cast
     split on the valley's paving (cast tint, unchanged) and lawn (lawn tint): the lawn edge h 105 -> 126, C* 11.5 -> 17.2,
     L* 67 kept.
  5. SKIPPED, already done: what crossed SUN1 at 20.50-20.53 in L4's clip (rendered at 45d88e9) was a bird, not the
     gasholder; L3's 3e5947d moved the birds over the sun. At 1080, frames 1228-1233 show SUN1 whole (0 px inside the disc).
- S8 (L6 archived 09:58, report_L6.md): swap S8Canal (V2S8_set.tsx) to lib/water; re-check the seam after S1's water changes;
  SHOULDs for the whole-film review: board at full weight in her walk (check_light 34.0 FAIL), ghosts pop late as hairlines,
  no particle seen in her walk, door lamp pool / W spill, a flat mint edge at y ~556 in f2337-2341 (paper-edge rule!) [DONE 09a00c5], line near-miss ends;
  kit requests: S8Ghosts default `at` film vs scene time (make required); Lamp `lightAt` 3-frame flicker. SUN8 map request DONE (a5fe083).
- S2 (L2 archived 10:15, report_L2.md; clip deliverables/v2/lanes/v2r_L2_S2_0.4.mp4 checked: look consistent): swap S2WaterSurface / S2_WATER
  to lib/water; map.ts requests: S2 bench + figure boxes per V2S2_Layout (bench x 600-800, y 1110-1290), S2.aBoard x -50 (BOARD_SHIFT) [DONE 6c23b41],
  optional board 40 px lower (K3 S2_LEGS_Y1); forwarded: S3 near lamp = S2_NEAR_LAMP (to L3), board colour override (to L5).
  Banding at 11.0: one WARN step in the band rows (dE00 1.51). Paving stripes bold: whole-film review to judge.
  L2 also: line count still over budget at 10.0 (CRAFT line lint).
- S6/S7 (L5, report_L5.md; clip deliverables/v2/lanes/v2r_L5_S6S7_0.4.mp4 checked: on look): S7 near-miss ends 49/40 Mpx (K3 face
  simplification asked of L5 10:40); map.ts: L2's optional board 40 px lower (S2.aBoard + K3 S2_LEGS_Y1); for the review: the whole sun
  disc floating just above the board top in S6 and S7 (reads as a ball on the board?); S7's fountain is water too (lib/water?).
- TOOLING BACKLOG (next video, craft tooling lane): check_light takes a gradient sky; particles lint a leaf's on-screen entrance vs joins;
  cast kit lines-off option under a forced environment tier; kit S8Ghosts `at` required; Lamp lightAt 3-frame flicker.
  L5 archived 10:42 after the K3 clean face (closed keyline, no screw / handle slots): near-miss ends only S6 26->24, S7 44->43 /Mpx; S7 still over 40 (review to judge; the source is elsewhere).
- S3/S4 (L3 archived 11:48, report_L3.md; clip docs/v2/lanes/img/L3_S3S4_0.4.mp4 checked: on look; the plum dive frame at 14.86 is the push):
  water swap = the bodies of S3Water (V2S3_water.tsx, spec S3_WATER) and S4Water (V2S4_water.tsx, S4_WATER, parts 'canal'/'near', glints
  S4_WATER.glitter.on); INTEGRATOR: map.ts her far window 6+ px left or SUN1 r <= 60 (5 px tangent to SUN1's limb) [DONE 6c23b41: 10 px
  left]; S8Window's stile from the transom down + fanlight undivided to match S3 (continuity) [DONE 84c6474]; near-miss ends S3 126 / S4 85 are mostly in-world lettering (tag, plates:
  the measure counts them); check_light 19.9 her box alone FAIL (passes with the plates). SHOULDs: walker behind her shoulder at 16.0, the
  pair large at 14.92, hull's dark band heaviest in the bottom third, birds low (report l.11).
- TOOLING BACKLOG +: ends.py masks in-world lettering / dark corners; check_depth samples thin A shapes at 1080, Hough level-line removal.
- S5 (L4 archived 11:52, report_L4.md; clip deliverables/v2/lanes/v2r_L4_S5_0.4.mp4 checked: on look; the trees' cast shadows read heavy
  in the first second?): water swap = S5Water (isolated); line counts at 23.4 over (108 / 365 near-miss per Mpx); REQUESTS: K3 NewsBox
  headline default 34 + declare its tone (A outline in its own shade, not #4B2A1E), a darker panel / hedge option for Plaque (fill step 8.3)
  [DONE 39f85e8]; rigs.ts a `lawn` tint in RIG_APRIL (the Pentagon's cast reads h 105 on the lawn edge) [DONE 86105cd]; S4's gasholder
  X-brace crosses SUN1 at 20.50-20.53 (a crossed-out sun into the push-through: fix in V2S4) [SKIPPED: already done, it was a bird, 3e5947d];
  dc kit atmosphere param (backlog).
- ALL LANES DONE 11:52. Review notes across shots: the sun as a whole orange ball floating above boards/sets in S4-S7 (a motif or a tell?).
