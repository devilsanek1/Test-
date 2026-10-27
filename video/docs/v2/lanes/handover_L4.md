# L4 handover (V2S5, the crane): work in progress

**Done**
- Read COMMON, brief_L4, TREATMENT (all), map.ts S5, the dc kit (README, crane.ts, CraneSet.tsx, terrace.tsx, vista.tsx), cast and Pip READMEs.
- Rendered the kit's `CraneMove` / `CraneEnd` and compared with reference 1 / v1 at 216 px.
- Started `video/src/v2r/scenes/V2S5_text.tsx`: `NewsBox` (START coords, contract face x 470-780, y 880-1230, headline 40 px + 18 px
  credit) and `Plaque` (END coords `PLAQUE` x 532-776, y 1066-1168, pops on "Pentagon" scene 1.88). Not yet wired or rendered; not typechecked.
- `V2S5.tsx` is still the engine placeholder.

**Next (the plan)**
1. `V2S5_set.tsx`: fork `kit/dc/CraneSet.tsx` (same planes, ease, wipe, swap) so own layers can be inserted; `V2S5.tsx` = `<World sky={CM.sky}>` + that set.
2. Figures: cast `Stranger` (start (300, 1225) h 150, `turnPageAt`), end tiny (h ~62) after `swapAt`; Pip `PipTrack` in START coords:
   mid-hop from about (330, 780) at 0 landing on (415, 1120) by ~0.2 s, `lookUp` + look toward SUN1 at 0.21 (20.76), size 108 so it ends
   ~44 px; end seat = DECK inverse of (415, 1120) = (365, 1195); leap up-right at 3.35 (23.90). Tell L3 / L5 the cut points (REQUESTS).
3. Kit gaps seen in the kit render (fix in own files): start frame too empty below the bench (add a start-only near foreground that
   drops out down-left: tree root bottom-left, petals, a bag; plus a blossom-branch fringe in the top gutters, y <= 260, that lifts UP and
   out as the crane tilts: "under a canopy" without crossing y 317-556); end bottom third reads as flat mauve paving (lighter paving,
   more terrace people / dog / pigeons / drifts); top sky could carry one bigger cloud (y <= 300); keep everything out of y 317-556.
4. QA: `craneSpeeds()` / camspeed <= 15 px/f detailed, density.py, band check; review files + fresh-eyes critic per brief_L4.

**Files**: `video/src/v2r/scenes/V2S5.tsx` (placeholder), `video/src/v2r/scenes/V2S5_text.tsx` (WIP).

## 2026-10-27, second helper (ultracode session): handover to the /effort max session
**Done (pushed)**
- `V2S5.tsx` is no longer the placeholder: `<World sky={CM.sky} stage="context"><S5Set/></World>`; renders in Film2R-V2S5
  (checked at 10 times: sun match, Pip hop-in, calendar, crane, wipe, plaque on "Pentagon", hold all play).
- `V2S5_rig.ts`: kit rig re-used (CRANE_T, craneP, DECK, swapAt); `FAR_S5` re-pins the far plane on `FAR_END.sun` so the
  start sun is EXACTLY SUN1 whatever horizon/sun the far file picks; `deckEndOf()`; `FIG` (end Pip seat = (365.5, 1194.6),
  i.e. the orchestrator's (366, 1195): the start seat through the deck).
- `V2S5_set.tsx`: fork of kit CraneSet with ONE-OWNER SLOT FILES so builders can work in parallel without touching it:
  `V2S5_far.tsx` (FAR_END {horizon, dy, sun} + S5Far + S5FarLife; still the kit's horizon 800), `V2S5_river.tsx`
  (RIVER_PL + S5River), `V2S5_mid.tsx` (S5Mid = MidGround + Pentagon), `V2S5_deck.tsx` (S5Deck, S5DeckOver, S5NearEnd{p}),
  `V2S5_start.tsx` (S5StartBack{p}, S5StartFore{p}: stubs), `V2S5_figs.tsx` (Stranger + PipTrack: hop in from the sun
  side, lookUp at SUN1 on "April", end leap up-right at 3.35), `V2S5_text.tsx` (NewsBox, Plaque at scene 1.88).
- Baseline kit renders compared: start bottom half is flat paving, start Pip/stranger small; end frame decent but bottom
  third = flat terrace; terrace rail people larger than the stranger.

**Next (planned, not started)**: a Workflow with parallel builders, one per slot file: (1) far+river: horizon ~740
(cloud bank / obelisk tops >= y 610 at every p; sun end stays out of y 290-600; FAR_END.dy drives RIVER_PL), huge clouds
in the top gutter y <= 300 at every p, more haze steps; (2) mid: depth layers + life between river and the Pentagon box
(322, 846)-(1080, 1104); (3) deck/end bottom third (people, dog, stroller, petal drifts, roots bottom-left, lamppost base
bottom-right); (4) start: near foreground dropping out down-left, top-gutter blossom fringe (never in y 317-556 at any p),
figure/Pip polish. Then critics (art director, sound-off, SCALE, SPEED per frame, fairness, completeness), fix rounds.
- Camera-height note: with the end stranger 62 px and feet y 1238, a level camera is (1238 - horizon) / 62 ~ 8 seated
  heights; 2-3 heights would put the figures at y ~900 (inside the Pentagon box) or make them ~170 px: conflicts with
  "tiny anchors". Decide (and report) before building the deck.
- Tool: `$SCRATCH/tools/bandcheck.py` (not committed; copy below) needs `pip install opencv-python-headless numpy`
  (cv2 missing in this container). It counts non-sky (#BCDCCF, tol 28) pixels in y 317-556 per frame of a Film2RBare
  render of `--frames=1233-1439`.

## 2026-10-27 ~14:30 UTC, third helper (MAX effort + ultracode, session_014PwCXHEmk7T2Y5xLmUSX6h): in progress
- Switched to video-production; read COMMON, brief, TREATMENT, STYLE.md, CINEMATIC_GUIDE S5 + Scale cues, the kits.
- Decisions (in `L4_spec.md`, the lane's build spec every builder reads): end horizon ~750; the camera stays ~8 seated heights
  (the contract's 62 px stranger at feet 1238 + the Pentagon box fix it; the terrace becomes a near world with its own size
  gradient so it never reads as a map); the plaque = a viewpoint plaque on a pedestal in front of the rail (x ~450-760, y
  ~1140-1246, "The Pentagon" 56 px); Pip arrives mid-air at L3's (292, 721) and drops onto the backrest seat (415, 1120).
- Restructured: the rig reads each slot file's camera numbers (no import cycles); `V2S5_nearmid.tsx` slot; `V2S5_set.tsx`
  `only` layer groups; dev entry `V2S5_entry.tsx` (S5Shot, S5At {p, t, only}); node camera check `V2S5_qa.ts`.
- Scratch tools (not committed; recreate from this note if lost): bandcheck.py (Film2RBare f1233-1439, non-sky px in y
  317-556 and in the margin 290-600 minus the sun disc / the calendar page), make_review.sh (keys at 216 px beside refs,
  full-size start/end, motion strips, 0.5 clip + density + camera check).
- Running: workflow `v2r-l4-crane-build` (sky&far -> valley, terrace -> figures&text, then start). Next: critic panel (art
  director, sound-off, SCALE, speed/motion, fairness, completeness), fix rounds until pass, report_L4.md.

## 2026-10-27 ~15:10 UTC, CONTROLLED PAUSE (orchestrator: the account's 5-hour limit; resume after 18:30 UTC on its message)
**State (everything committed and pushed; typecheck clean for V2S5, 0 errors in the tree at the pause):**
- Spec `L4_spec.md` (follows the integrated STYLE.md: nothing overhead at the start; STYLE §5 proofs) and `stylecheck_L4.md` (answered) pushed.
- Director's decisions (orchestrator, 15:01): the 62 px end stranger at feet 1238 + the terrace mitigations APPROVED (no map.ts change); the
  news box headline at BODY 34 px (3 lines; nothing between 34 and 56); nothing overhead in S5 (no top-gutter fringe).
- SKY & FAR (done to its round 2+, files `V2S5_far*.tsx`, `V2S5_river.tsx`): horizon 750, END sun (1058.5, 646) r 60.2 (the far plane sits 12
  px lower at the start, so END tops >= 610 hold at every p), flat cumulus caps in the top gutter, a warm bank, packed city rows with roof bands,
  street trees and skyline accents, the obelisk the darkest far shape, Lincoln / Jefferson / Kennedy / bridges / rowers / sails / parkway cars,
  deep parkland under the river (y 848-1290, so no gap while the mid plane rises); sky life = gulls + two V's of birds riding the far plane's map
  (y >= 610). River near edge (THE JOIN for the mid plane) = END y 848.
- TERRACE (done to its round 2, `V2S5_deck*.tsx`): the deck re-fit to the far horizon (`V2S5_deck_cam`), a 2-value static dapple (shade zone
  round the pair = the start's warm-dark floor), an OPEN-back stranger's bench (under/over parts; the whole seated back shows), 13 terrace people +
  a dog, a stroller, pigeons, tulip beds with hoop fences, benches, a fountain, a lectern, a bike; backlit frames (tree left, lamppost + corner
  crown right), the wipe lamppost's baskets; `V2S5_deck_qa.ts`; dev entry `V2S5_deck_dev.tsx` (DeckShots: many stills in one bundle).
- TEXT: `V2S5_text.tsx` = K3's NewsBox (its front page re-lettered at body 34 + the 18 px credit; NOT yet rendered: check first) + K3's Plaque at
  x 605, bottom 1246, stand false (plate 441-769 x 1119-1246; renders well at 22.44 / 23.70).
- NOT YET DONE: FIGURES (`V2S5_figs.tsx` is still the previous helper's: Pip starts at (292, 700) with a hop at -0.12 and is at ~(346, 846) at
  the cut, but L3's S4 Pip is mid-air at (292, 721) on screen at 20.55 (`V2S4_rig.ts` S4_PIP.outLeap: from (470, 1218) world to (200, 600),
  20.25 + 0.45 s, height 100, through the 1.06 push about SUN1; kit `hopAt` = lerp - height x 4k(1-k), k linear); the end Pip + leap toward S6's
  (770, 720) at 3.35 unchecked) · VALLEY (`V2S5_mid.tsx`, `V2S5_nearmid.tsx` are still the kit's: the near-mid's bare branch tips reach y ~574
  at x ~950 at the start (band margin), the mid plane's join with the river at 848 unverified) · START (`V2S5_start.tsx` empty: spec §4's
  start-only near masses: trunk + roots bottom-left, a tulip-bed rim bottom-right, twigs, pigeons, dropping out down-left by p ~0.35).
**Stopped agents:** workflow `v2r-l4-crane-build`, runId `wf_b2afaa3d-bc2`, script
`/root/.claude/projects/-home-user-Test-/77c1a0dc-af15-5a35-a3e3-e76f15ecdd7f/workflows/scripts/v2r-l4-crane-build-wf_b2afaa3d-bc2.js`
(sky-far agent ab40529b5c97d4696 and terrace agent a162b0811ab598a30 were mid round 3; valley / figures / start never started). Do NOT resume it
(budget rules: one agent at a time; the rest is done as targeted fixes below). The 16:05 hard-stop reminder was deleted.
**Next steps, in order (budget: at most ONE agent at a time, one combined critic, one fixer, then the report):**
1. (lead, no agent) Pip's arrival in `V2S5_figs.tsx`: at scene 0 exactly L3's (292, 721), a short drop onto the backrest (415, 1120) by ~0.17-0.2
   s (arc never above y 600), lookUp on "April" 0.21 kept; check the swap (S5Shot frames 92-98) and the leap (frames 199-206) toward (770, 720).
2. (lead) Render-check the news box at 34; near-mid branch tips >= y 600 at the start (fork `NearMid` into `V2S5_nearmid.tsx`, clamp the twigs);
   the mid/river join at p 0 / 0.5 / 1.
3. `bash L4_tools/make_review.sh r1` (copy the tools to the scratch dir first; re-extract the 216 px reference rows).
4. ONE combined critic agent (art director + sound-off, scale, QA: the three prompts of `critics_wf.js` in one) on `review/r1`.
5. ONE fixer agent on the musts (incl. spec §4's start-only layers if flagged), then a quick re-render of the key frames by the lead.
6. `report_L4.md` (<= 15 lines: built, the critic verdict, QA numbers, open items, REQUESTS: L5 move K3 NewsBox's headline default to 34 ·
   map.ts take a PIP_S4_S5 hop contract if L3/L4 numbers drift · L3 confirm (292, 721) at 20.55) -> commit + push LAST.
