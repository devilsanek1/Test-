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
