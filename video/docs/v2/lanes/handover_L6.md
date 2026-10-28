# L6 handover (V2S8 + the seam)

## HOLD 2026-10-28 ~09:30 UTC (the orchestrator's budget hold): resume state, read this first
Done and pushed (typecheck clean): the whole conform (sky S8_EVENING + its un-build into SUN0; the parallax float; the
lamp run f2237 / 2261 / 2273; the seam push retired, Pip's 30 px settle + late un-build; the readers out, the owner left
of the board with the squeegee; tiers; V2S8_light; particles on the v5 recipe), and the builder's SET + HOUSE pass
(30b409c, de069f7, 9bfcb02: tier C, depth via S8_ATM, slate iron, specks out, the short near lamp, set light, depth
sheets scripts/qa/depth_sheets/v2_s8_t34 / _t38). The ONE critic round is done: docs/v2/lanes/critic_L6.md (k1 at
71ed960): FAIL, 2 MUST; checks in scratch checks/k1/checks.txt, the 0.4 clip checks/k1/clip_s8_seam_0.4.mp4 (scratch is
lost on a container restart: re-run tools/checks.sh, or re-render).
On resume, MUST-FIXES ONLY, no second critic round, then report_L6.md (scope set by the orchestrator):
1. The sun on her board: the disc (420, 625) r 40 sits whole on pale mint 12-15 px over the board's top, its top in the
   band. Fix: draw it at y 640 (local S8_SUN; REQUEST map SUN8 -> (420, 640)) and cut it with ONE near-level far
   roofline at y ~650 in S8Far (V2S8_set), so a half-disc sets behind the far rows (S1's model); keep the sky's warmth
   centred near the disc, under y 600 (skies.ts S8_EVENING; skyProblems [] again).
2. The payoff is crowded: in V2S8_cast WALKERS, no crossing during 36.54-37.70; ONE walker after 37.90, behind the
   ghosts (entering at the right edge, nothing new after 38.72); walkers flat C: no outline (Person ink={0}), coats
   C* <= 25 (no mustard / brickDeep), the head one tone (no face-like oval: a beanie or hood).
Then: re-render the seam + 38.0 + 36.5-38.3 at 0.4 to confirm, re-run checks.sh's check_light lines, write
report_L6.md (<= 12 lines; numbers from critic_L6.md's CHECKS + the fix renders), message the orchestrator one line.
Also on resume (no styling): split S8Water's flat water field into its own component (geometry WATER) so the coming
lib/water swap is one line (orchestrator, 09:12).

## RESUMED 2026-10-28 ~08:00 UTC (RESUME_2026-10-28.md; the owner approved the G4 look clip v4) — state as of ~09:10 UTC
Pushed (typecheck clean): S8's one continuous sky (world/skies.ts `S8_EVENING` / `S8_AIR`: horizon SUNSET_HORIZON at
y 680, the sun's warmth 200 x 60 centred 35 px under SUN8, skyProblems []), drawn by V2S8_set S8Sky (lib/sky) with the
flat disc on top; at the un-build the disc goes first, the sky's foot rises to 560 (V2S8.tsx S8SkyAtExit) and the rest
contracts into SUN0. The parallax float (V2S8_clock S8_FLOAT_LEGS 35.75-38.60, S8_DEPTH planes, V2S8_depth S8Plane
groups; floatProblems [], peak 9.4 px/s, max 6.7 px). The lamp run in three switch-ons (f2237 / 2261 / 2273,
LAMP_RUN_FRAMES). The seam push retired; Pip's straight 30 px settle + late un-build (V2S8_pip). The readers out; the
cafe owner left of the board (66, 1258), 210 px, a long-handled squeegee whose blade rides L5's wipe edge (V2S8_board).
Her subject tier + form shade + rim; the ghosts A (33.78-34.75) then B with their line (V2S8_cast). V2S8_light: contact
+ cast shadows (her, ghosts, walkers, the board, the owner, the bollard, Pip), W's spill, the two visible lamp pools.
Particles (V2S8.tsx): backlit motes on her house's shaded facade, two falling leaves 26-36 px (no glints: no open
water under SUN8 in frame). A builder agent was running the SET + HOUSE pass (V2S8_set / V2S8_house: tiers, depth via
S8_ATM, slate iron, specks out, the near lamp, set light, depth sheets v2_s8_t34 / _t38). Next: its result, then the
checks (scratch tools/checks.sh: check_light A/B, line, depth, banding, flashes, seam, clip), ONE critic, report_L6.md.


## PAUSED 22:40 UTC for the depth pass (resume when the orchestrator says; read this first)
State: conform_L6 started (owner-approved DIRECTION / CRAFT / THROUGHLINE; the brief `conform_L6.md` wins over everything
below). Pushed: `V2S8_clock.ts` conformed (seam push retired: SEAM_ZOOM 1.00; the 2D float's second run home at 38.82;
the lamp run flash-safe: 4 lamps 0.34 s apart from 37.18, every other light on from the start via `lampRunAt` -> -10;
`PIP_SEAM` = a 30 px settle (700, 1205) -> (700, 1235) 38.82-38.98, no hop). Typecheck 0 errors. Nothing running.
Next, in order (one agent at a time, ONE combined critic round, 0.4 scale, commit every <= 20 min):
1. V2S8.tsx: `<Lit rig={RIG_CANAL_S8}>`; cam = floatXY only; drop S8Readers; tiers per THROUGHLINE §4 S8 (C: set +
   house + public; A: her + ghosts at the pop then B with lines, W 34.55-34.95 and the end, the board from 35.72; B: Pip,
   the cafe owner, her door); the sun in EarlyExit (it un-builds before S1's sun shows).
2. V2S8_pip.tsx: the settle (straight, no arc) + Pip un-builds LATE (LateExit, not NoExit): S1's Pip is absent at t < 0
   and draws on from t 0 (V2S1_clock S1_F0); head back to neutral by 38.70 (nothing turns in 38.72-39.08); the S1-clock
   TimeShift is no longer needed for the seam.
3. V2S8_board.tsx: readers removed; the cafe owner LEFT of the board at its depth (feet <= ~1265, ~210 px, rear 3/4 or
   profile), a long-handled squeegee riding L5's wipe edge across the half-wiped menu, staying there, never in front of
   the face; Pip's bollard slate (no plum on lamps / bollards / railings / birds).
4. New V2S8_light.tsx: contact + cast shadows (her, the ghosts, Pip + bollard, the board's legs, the cafe furniture,
   planter, the owner, lamp posts; toward 85), FormShade + Rim on her (top + left edge, see V2S1_row), W's WindowSpill at
   34.95, LightPool per lamp at its run time (CANAL_POOL colours), nothing before; then the DEPTH section the
   orchestrator adds to conform_L6.
5. V2S8_set / V2S8_house: lamps and the near lamp column off plum (slate); delete hand-drawn specks / dash rows /
   ripple dashes / dabs the clean pen cannot know (CRAFT §c); the near pool -> two flat CANAL_POOL steps.
6. Checks for report_L6.md (conform_L6 §9): 0.4 clip 32.5-39.08 + the seam into frame 0; check_light A/B at 34.0
   (--subject her), 36.0, 38.0 with --sky '#BCDCCF'; line measure at 36.0; the wipe + seam frames; a still at 38.7;
   flashes <= 3/s; movers <= 3; tsc clean; ONE combined critic, fixes, report, message the orchestrator one line.


**Done:** read COMMON, brief_L6, TREATMENT (all), BUILD.md, map.ts S8 / PIP / MATCHES, the canal / cast / Pip READMEs,
lib/Film.tsx (foreground-wipe + unbuild + loop underlay), lib/exit.tsx; rendered `CanalSample-S8` (kit sample at the
landing pose). No V2S8 code written yet; `src/v2r/scenes/V2S8.tsx` is still the placeholder. No kit/boards yet (L5).

**Findings for the next session:**
- Kit `S8Set` (src/v2r/kit/canal/sets.tsx) is a usable base but sparse: big empty paving y 1250-1550 centre, and at the
  landing pose the board B (x 150-630) hides the lane's depth (VP (600, 948)) and every receding lamp, so the 37.18
  "lamp run west down the lane" does not read. Plan: own parallax layers in `V2S8_*.tsx` (far / water / path / house /
  near, each with its truck dx: map `S8.truck` board 250, ghosts 240, house 160, sky 0; S8Set only shifts house + lamps,
  the paving does not shift); make the run legible with lamp heads + string-light catenaries in y 600-700 above the board
  and lamps on the house side (x 640-1080; heads above y 840 are outside the rail).
- Ghosts: map spots (658/696/734, feet 1084-1060, 140/135/130 px) on the 240 px plane: pre-truck x 418-494, between the
  board and her door (520-610), then the truck slides them in front of her SHUT door. Keep that (decision to note).
- Pip handoff from S7's wiper: lib wipeEdgeX(p, 'left', half); BoatWiper.half = 630 (canal kit). At 33.00 the wiper
  centre is at x ~ -12 (stern ~ x 618). Plan: Pip leaps off the stern ~33.00 to the pre-truck bollard (450, 1205),
  landing 33.20; REQUEST L5 to draw Pip on the wiper roof until 33.00 at the matching spot.
- Seam: end on a 1.00 -> 1.05 push about W (860, 700) (37.70 -> 39.08, ease-out to zero speed, so S1's ease-in pull-out
  continues it); sky `useExit() > 0 ? 'transparent' : sky`; Pip in `<NoExit>` hopping to S1's f0 bollard on screen =
  s1Screen(S1_BOLLARD, 0) = (692, 1262). REQUEST L1: no Pip drawn at t < 0 (S8's Pip arrives), or both would show.
- Local times (film - 32.93): visible from -0.23; walk 0.23; Pip lands 0.27; can't 0.85; door 1.62 / shut 1.82; W 2.02;
  truck 2.06-2.67; wipe 2.79; pen 3.61; facts 4.25; Pip looks up 4.77; un-build 5.89-6.15.

**Next:** build V2S8 at finished quality per the brief, review files + critic loop, report_L6.md.

## 2026-10-27, second session (ultracode): skeleton pushed, no builders run yet
**Done (pushed):**
- `src/v2r/scenes/V2S8_clock.ts`: the shot's ONE clock (scene s = film - 32.93; every beat in `S8T`), the camera
  contract: a 7 % linear float multiplied into the in-out truck (`camC`, continuous speed, lands exactly at 35.60 with
  zero speed), per-plane truck dx `PLANE_DX` (map's sky 0 / house 160 / ghosts 240 / board 250 + L6's far 24, south 60,
  water 110, lampsFar 140, boat 270, near 320), `planeOffset`, `groundDxAtY` (paving shear by depth), the seam push
  `seamZoom` 1.00 -> 1.05 about W 37.70-38.82 (ease in-out, then held through the un-build so W = 157.5 x 178.5 =
  S1 f0 and S1's ease-in pull-out starts from rest), `pushPt`, `S1_F0_PIP` (692, 1261.75). Ghost decision noted there:
  they pop left of her door (pre-truck 418-494), the truck slides them in front of her SHUT door (658-734).
- `src/v2r/scenes/V2S8_exit.tsx`: `LateExit` (ghosts + W leave last) / `EarlyExit` (busy life first).
- `src/v2r/scenes/V2S8.tsx`: the assembly (World sky `skyBands('sunset', true)`, `'transparent'` once useExit() > 0;
  XG seam push about W; z-order S8Back, S8Window, S8Public, S8Her, S8DoorLeaf, S8GhostsLayer, S8Board, S8Front; S8Pip in
  screen space). Part files are STUBS: `V2S8_set.tsx` (kit S8Set at the plane offsets), `V2S8_board.tsx`,
  `V2S8_cast.tsx` (kit S8Ghosts on the ghost plane), `V2S8_pip.tsx`. Typecheck clean; Film2R-V2S8 renders.
- Wipe maths (BoatWiper.half 630): stern edge 1130 @32.93, 578 @33.00, 253 @33.05, 29 @33.10: an S8-drawn Pip at
  x ~540 is under the boat for only ~1-2 frames after 33.00, so the handoff reads even if L5 draws no Pip on the roof.
- References at 216 px were extracted to scratch (regenerate: ffmpeg fps=1, scale=216:-2).

**Next (planned workflow, not started):** 3 builders on separate files (set: denser parallax lane, lamp heads +
catenaries y 600-700 above B, house-side lamps, life, W + door leaf; board: interim HerBoard face per L5's handover
decisions until `kit/boards/StatementBoard` lands, SHE SAYS pop + clack 33.16, smudged menu, cafe owner one-stroke
wipe 35.72, quote pen 36.54-37.10 / 37.20-37.70, credit at 36.54, two readers stop left of B on 37.18; cast + Pip: her
walk home + goIn, the ghosts, the public, Pip hop 33.00-33.20, earsDown 33.78, lookUp at W 37.70, NoExit hop to
`S1_F0_PIP` on the un-build), then critics (brief prompt + seam checker + standards) and fix rounds, report_L6.md.
REQUESTS still to file: L1 draw no Pip at t < 0 (S8's Pip arrives on the seam); L5 Pip on the wiper roof until 33.00.

## 2026-10-27 ~15:20 UTC, third session (MAX + ultracode): CONTROLLED PAUSE (account session limit; resume after 18:30 UTC)
**State (all pushed; typecheck 0 errors; Film2R-V2S8 renders ~0.3 s/frame at 0.5 scale):** V2S8 is fully built in parts on ONE clock:
- `V2S8_clock.ts` (contract v2): rigid ground bands (house < 1100 <= board < 1340 <= near; the coping break (333, 1100) stays behind the board),
  `HER_KEYS` / `herAt` / `doorOpenK`, `wiperX` + `PIP_ENTRY` (S7's band-safe wiper, water 2020), `PIP_BOARD_FACING` 'backLeft' (= L5's S7 pose, A5),
  `PIP_SEAM`, `S1_SHIFT`, `S1_PIP`, `LAMP_RUN_ORDER` / `lampRunAt`, and the STYLE.md 2D float `floatXY` (FLOAT_K = 0: no parallax float; home at the
  truck 34.99 and at the push 37.70). `V2S8.tsx` = the assembly (z-order in plan_L6.md section 2; cam = floatXY then the 1.05 seam push about W).
- `V2S8_set.tsx` (workflow builder A, stopped during its self-check polish), `V2S8_house.tsx` (builder B, stopped likewise; it had committed
  8064fcb), `V2S8_board.tsx`, `V2S8_cast.tsx`, `V2S8_pip.tsx` (first passes by me). Builders C (board) and D (cast + Pip) never ran.
- The workflow was stopped by me (budget rule, before the pause): runId `wf_853760e2-ac5`, script
  `/root/.claude/projects/-home-user-Test-/1d52d9ad-c98a-5515-ac2b-617580999250/workflows/scripts/v2s8-build-wf_853760e2-ac5.js`. Do NOT resume it:
  every part is built; its builders C / D are obsolete (they would rebuild what exists). Nothing is running now.
- SEAM: measured invisible: film frame 2344 vs frame 0 differ by 31 px at 0.5 scale (a normal frame step is 36). Pip runs on S1's clock and seed
  ('pipS1', TimeShift by S1_SHIFT) the whole shot and ends in S1's exact frame-0 pose; the wipe hand-off works with L5's real wiper (Pip on the
  stern deck 32.97, leaps 33.00, lands 33.20).
- STYLE.md fixes applied: flash safety (every lamp / pool / W switches on ONCE; the festoon lights bulb by bulb), the float law, the S8 sun 15 px higher
  (S8_SUN (420, 625) in V2S8_set: it touched L5's board frame; REQUEST K2 SUN8 -> (420, 625), as L5 also filed). stylecheck_L6.md answered + pushed.

**Next, in order (budget rules from the orchestrator: ONE agent at a time, ONE critic round, then one fixer, then the report):**
1. Board people to STYLE.md sizes (my next edit, not started in code): the cafe owner and the two readers are small backs ~150-165 px (they are 284 /
   270 / 254 now). Plan: owner h ~166, feet (210, 1328), a long-handled squeegee (pole ~250 px from the hands at chest height; the T-head rides L5's
   wipe edge `wipeEdgeX(B, WIPE, t, y)` across the half-wiped menu in ONE stroke 35.72; smudges rect x 194-472, y 940-1110), then lowers it and steps
   back left to x ~140 by 36.5 (clear of the credit, y 1180-1194, x 190-561). Readers h ~150 / 146: enter from the left edge already walking ~36.4,
   stop ON "facts" 37.18 in front of the board's foot at x ~230 / ~305 (feet ~1372 / 1364, heads just under the face), heads up.
2. Cast: the pre-truck neighbour must enter at an edge (start x >= 1240 house coords, walking LEFT) not pop mid-frame; check the far walker.
3. Review files: `bash /tmp/.../scratchpad/tools/review.sh r1` (stills, 216 px sheets beside ref 1 / v1, full frames, strips, seam + wipe strips,
   colour meter, the S8 clip 1944-2344 at 0.5 scale + density / deadframes). The scratch dir does not survive a container restart: the script is
   short (render-frames.mjs for stills at shot times 0.05..5.95 and film times for the seam / wipe; montage; colour_meter; density --cozy; deadframes).
4. ONE combined critic (shot + seam): the brief_L6 critic prompt + the seam / wipe / motion / rules lens (I kept the text in my scratch
   tools/critic_prompts.md; re-derive from brief_L6.md + this list). Then ONE fixer on its musts. Then `report_L6.md` (<= 15 lines) LAST.
REQUESTS so far: K2 SUN8 -> (420, 625); kit cast `S8Ghosts` default `at` is FILM time (33.78) while scenes run shot time (S8 passes S8T.cant);
kit canal `Lamp` lightAt has a 3-frame flicker (STYLE.md flash safety: S7 / S8 pass `on`); L1 keep `S1Pip`'s props (x 700, y 1235, size 100,
facing 'back', seed 'pipS1') or export them, S8 mirrors them for the seam.
Messages handled during the pause: (a) L3 will MATCH my S8Window (closed leaves + central teal mullion, gold lamp shade, two shelves, plants on the
sill): keep S8Window's design unchanged. (b) Orchestrator: L6 owns Pip from 32.70; agreed with L5 in one message: the hand-over spot is S7's own
board bollard (S7 keeps its seated Pip there, unmoved, until the wiper's bow covers it ~32.83; no hop), S8 shows Pip on the stern deck from 32.97 and
its leap (PIP_ENTRY in V2S8_clock; no map.ts change). (c) Flash safety: lamps switch on once, staggered 0.06 s; still to check after the resume: the
terrace's switching windows must not add up to > 3 on-off flashes in any 1 s.
