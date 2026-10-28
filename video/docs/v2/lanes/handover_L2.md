# L2 handover (V2S2 "The wall")

## PAUSED 2026-10-28 ~09:25 UTC (budget hold, orchestrator). Resume scope: the critic's MUST-FIXes only, no second critic round, then report_L2.md
**Done + pushed (V2S2*.tsx, V2S2_Ground/_Near/_Water/_Light/_Wall/_Float/_Layout, depth sheets v2_s2.json + v2_s2_t7.0.json):**
conform_L2 §1-§10 + RESUME: Pip seated from frame 1, her A outline pop 6.82, the push retired, float legs home at 12.98;
lib/sky S2_EVENING + S2_AIR; ONE camera on the VP (1400, 700) (our edge + towpath joints to it), planes -1/0/+1/+2/+3/+4
via S2_ATM (air S2_AIR, steps [0, .12, .15, .6, .9]); no head-backs: kiosk foot, dog at rest, planter, bollards (no
railing), lamp + bike; K3 ToldTheBBCBoard (A from 8.44, shadow from the shove, BOARD_SHIFT -50); RIG_CANAL light layers;
one far walker, the boat entering 7.60, pigeons on the far bays out by ~9.8; motes far 4 x 9-10 px + near 3 x 13-16 px.
**Checks run:** depth 7.0 / 11.0: 0 FAIL (3 / 3 WARN: +2/+3 air ladder flat 7.5 -> 7.2, SW4 29 % one value, towpath
texture); light A/B OK (7.0: brightest 5 % 0.039 H from her window, greyed 8 px; 11.0: 0.077 H, 18 px; band 0.0); banding
open sky PASS (the flat cloud's edge reads dL* 4.1 if included); skyProblems note only; particleProblems [];
floatProblems []; tsc 0 errors; lines @10.0: dark px 1.38 %, strokes 130 / Mpx, near-miss 258 / Mpx (87 / ~150 without
the board's lettering); match 12.95 / 12.967 / 12.983 / 13.00: M = plum pane x 269-400 y 703-866 (S2) and S3's lit opening
on the same rect, Pip bottom 1051 x 544-633 (S2) / 543-633 (S3); movers @10.3: no noticeable supporting mover (boat
~0.15 % of the frame); 11.0: no stranger's back. The 0.4 clip (5.9-13.2) exists in scratch only: re-render after the fixes.
**Critic (one pass, 09:20): 7 MUST / 3 NICE. Open MUST-FIXes:**
1. Bottom 40 % a flat empty beige floor: V2S2_Near PAVE.far = un-stepped stone toward S1's ground #EED8C9, PAVE.near a
   step darker (~-5 L*) split on the NEAR_ROW joint, STONE_B a real 2nd tone (dL* 6-8); leaf specks -> 5-6 leaves 30-45 px
   at the planter / lamp feet / kerb (optional: one long 2-step cast across the near paving from the sun side).
2. Particles unseen, no leaves: V2S2_Life: a leaves field (S1 v5 preset 34-40 px), 2 leaves from the left edge across the
   open towpath / canal (x 200-1000, y 1100-1700, plane towpath), ~7.0-8.2 and ~11.0-12.1, none entering near the joins or
   8.30-8.50, 8.94-9.12, 9.48, 10.26-10.60, ~10.85, 12.20; drop the planter motes; far motes to x >= 560 or drop.
3. Near dressing outweighs the subject: PLANTER_WOOD -> mid wood L* 60-64; the drain a warm iron 1-2 steps under the
   paving; tyres a step lighter warm slate (the lamp's colour stays: S3 holds it).
4. The board owns the eye 8.94-12.98: tier subject 8.42-~9.6 only, then support; BOARD_DX0 further left (no plum stile by
   the newsagent before 8.42); REQUEST K3/L5 a calm colour override for this board (frame L* 40-45, face ~L* 91).
5. (L3's file) S3 still draws the old near lamp at x 930: REQUEST L3 to take S2_NEAR_LAMP (V2S2_Near).
6. Blinds striped: V2S2_Staff S2Blind: no slat <Ink> (or 2-3 Fill bands seamTone(shadeWarm, 6)); rail + cord as Fills.
7. The 6.82 outline invisible + grey: V2S2 HerOutline tone CM.brickLight (~L* 39 warm), with a limestone casing (reveal +
   sill 8-10 px) popping with it.
NICE (only if cheap): his turn before "But" (~7.70-7.92); SW1's mug away from her pane ({side: 1, hand: -1}); the board ~40 px
lower (map + K3 REQUEST). Full critic text: scratchpad crit/findings.md (this session only).
**Also (parent 09:12):** isolate the water: S2Water -> the water alone (poly + reflections + waterline strip) in ONE
component with its geometry exported (top = farCoping - 2, bottom = OUR_EDGE + 30; above it: the far towpath + coping, the
far lamp, the boat, ducks, our bank, Pip), the far bank its own component; no water styling (lib/water swaps in later).
**Next step on resume:** one MAX builder agent: MUST 1, 2, 3, 6, 7 + 4 (my part) + the water split; re-run depth 7.0 / 11.0,
light, particleProblems + particles_phone at 360, line @10.0, the match; render the 0.4 clip (Film2R frames 354-792) to
video/deliverables/v2/lanes/v2r_L2_S2_0.4.mp4; commit + push; then report_L2.md (<= 12 lines) + one line to the parent.
REQUESTS for the report: L3 lamp (MUST 5); K3/L5 board colours (MUST 4); map.ts S2 bench / figure boxes per V2S2_Layout
and aBoard x -50.

## Superseded: PAUSED 22:40 UTC for the depth pass (orchestrator; resume with the depth section added to conform_L2.md)
**State (pushed):** the conform has only just started. Read DIRECTION, CRAFT §a-§d, THROUGHLINE, conform_L2, LIGHT.md, the
tier header and the kit Tiers notes; studied the G4 look clip. The integrator's map.ts / scenes.json already carry S2's
conform numbers (her window at M (335, 785), SW1 at (200, 795), 'W2' (465, 776) full blind 12.20, push retired, pull-back
about M, hood 10.85, clap 12.70, Pip seat from frame 1; S2 in = A push-through to [335, 785], S3 in = B matchcut), and the
kit wall draws the swapped story windows at their exact rects. The only code change since the 15:10 pause: V2S2_Staff.tsx
STAFF_LOOK keyed by the new ids (fixed a crash from 8.96). V2S2 typechecks and renders 6.3-12.95 under the global clean pen.
**Not done yet (all of conform_L2 §1-§9, in this order):** 6.10-7.5 first (push as soon as it plays): V2S2_Pip.tsx seated at
(590, 1050) from frame 1, hop-in and the 12.85 hop deleted; the ring (V2S2.tsx RING_D) -> her window's A outline popping on
at 6.82 (`<Tier tier="subject" tone={CM.anchor}>` closed rect at M, width INK_PX.mid); the float = straight eased legs
turning every 0.6-1.5 s within +-12 px, home exactly at 12.98. Then: no head-backs (V2S2_Life S2NearLife out); the bottom
third as things (2-tone paving bands, drain, flat leaves, planter, bike at the lamp foot, the lamp in CM.line x ~1030 slim
-> send x / y / h / w / colour to L3, paper bundles + crate, the dog lying by the kiosk); delete hand marks (ripple dashes,
reflection dashes, joint lines, leaf specks, the pictograms); tiers (set in `<Tier tier="environment">`, board
`ToldTheBBCBoard tier="subject"` from 8.44, staff windows subject on their beats, Pip / bench / newsagent support);
RIG_CANAL light (`<Lit rig>`, contact + cast shadows, FormShade on round things, Shade on planes away from the sun, LitWindow
panes); life budget (<= 3 noticeable movers, the boat entering away from the beats, one far walker per towpath, steam,
parapet pigeons once); nothing new in 12.78-13.18. Then the depth section (when it lands), one combined critic, report.


**Done:** reading and planning only; no scene code written yet (`src/v2r/scenes/V2S2.tsx` is still the engine placeholder).
Setup checked: `npm ci` OK, the headless shell path in remotion.config.ts exists, `CanalSample-S2` renders
(`GL=angle node scripts/render-frames.mjs CanalSample-S2 <dir> 3.0 --entry=src/entry-v2r-canal.tsx --scale=0.5`, ~0.4 s/frame).

**Findings that shape the build:**
- Kit times are FILM seconds (map.ts `S2.*`, K4 `Staffer`/`Reporter`/`StaffWindow` defaults read `useTime()`): wrap the scene
  body in `<TimeShift by={-6.1}>` (lib/time) so every kit default and map time lands right.
- `S2Set` (kit/canal/sets.tsx) is a good base but fork it into `V2S2_Set.tsx` for layering: the A-board must be drawn
  BEFORE `Newsstand` to slide out from behind the kiosk (8.44); the kit's near busts (hv 280/304, ~260 px wide
  shoulders) break the owner's people rule (heads <= ~140 px wide): pass `people={false}` / draw 3 `NearBack`s at
  hv ~200 (x ~330 / 560 / 760); the passing boat pops in at x ~1021 (bow starts at u 13): start it at u 17, ~1.4 u/s,
  from ~7.0 film s; lower the near lamp (`h` ~1290) so its arm stays below y 600.
- Story windows: `storyOverlay(w)` -> K4 `StaffWindow` (pane={false}; the set draws 'cool' via `staffCoolAt` 8.96),
  `lightAt` 8.96 + i*0.04, `backAt`/blind half 10.26 + i*0.085, W2 full at 12.20; HER -> an ink ring drawn on at 6.82.
- Camera: own `<g>` matrix: pull 1.12 -> 1.00 about (200,795) 6.10-6.70 (InkScale `inkCompFactor(z,0.6)`), float ~10 px/s
  back to 0 by 12.80, push 1.06 about W2 8.50-12.80; so W2 = W2_CUT at 12.98.
- Pip: `PipTrack` INSIDE the camera group at S2.pipSeat (590,1050), size ~100, facing back; enter with a hop from
  bottom-left (~(-60,1250), t0 ~6.14, land by 6.70); target the bench until 8.30, then target W2 (335,785); hop 12.85
  dur 0.25 to the world-space inverse of S3.pipSeat under the 1.06 push, height 50/1.06 (hopAt is linear, = map
  `pipHopS2S3At`).
- No K3 boards kit yet (L5): draw the TOLD THE BBC A-board in `V2S2_Board.tsx` (face 160-560 x 1050-1250: heading 56 px
  baseline ~1104, body 30 px on 3 lines ~1142/1174/1206, credit 20 px ~1236; plum frame) + a newsagent (K4 Person) who
  pushes it out; swap to L5's StatementBoard when it lands (REQUEST line in the report).

**Next:** write V2S2_Set.tsx / V2S2_Board.tsx / V2S2.tsx, render review files per brief_L2.md, critic loop, report_L2.md.

## 2026-10-27, second helper (ultracode session), handed over to the /effort max session
**Done (pushed, WIP first build, typechecks, renders at ~0.25 s/frame at 0.5 scale):**
- `src/v2r/scenes/V2S2_Set.tsx`: `V2S2Set`, forked from kit `S2Set`. Layer order: A-board, kiosk, newsagent, Pip, bench people, bench.
  No kit near busts. Lamp lowered (h 1290). Passing boat props `boatAt` 7.0 / `boatU0` 17 / `boatSpeed` 1.4. Slots `farLife` / `near`.
  Falling leaves kept to x >= 600, so none cross the lettering.
- `src/v2r/scenes/V2S2_Board.tsx`: stand-in A-board (plum stiles and rails, paper face, keyline, legs, shadow).
  Uses K3 `WorldText` + `TXT_TOLD_THE_BBC`: header 56, body 30 re-wrapped to 3 lines (words unchanged), credit 20.
  `boardDx`: slides out from behind the kiosk 8.44-8.74 with a settle. `S2Newsagent` (K4 Person, plum coat) pushes it out.
- `src/v2r/scenes/V2S2_Life.tsx`: a far cyclist + a walker with a dog, a near beanie head-back gliding L->R (hv 196),
  a cap head-back standing at x 800 (head turns), a dog (sniffs, sits, trots off), two pigeons on the paving.
- `src/v2r/scenes/V2S2.tsx`: everything inside `<TimeShift by={-6.1}>` (film s). Camera `s2Cam`: push 1.06 about W2,
  then a float (-10 px/s from 6.7, back to 0 by 12.8), then the pull 1.12->1.00 about (200,795); `InkScale` on the zoom.
  The ring is a 4.8 px ink pen at 6.82. `StaffWindow` overlays (pane=false, cool via `staffCoolAt`, blinds half
  10.26+i*0.085, W2 full 12.20). Reporter x 634 h 156 and staffer x 728 h 184: moved off Pip, who sits behind them.
  PipTrack: hops in from (-70,1270) at 6.14, looks at the reporter from 6.95, at W2 on 8.30, and hops at 12.85
  to the world inverse of S3.pipSeat under 1.06 (height 50/1.06).
**First stills (6.40 ... 12.97) read well:** the wall, the ring, the five silhouettes, the blinds, the board, the hood, Pip.
**Next / open:**
1. Check the A-board body at full size (3 lines at 30 px are tight against the credit).
2. Check the newsagent's reach pose (the profile flip looks stiff).
3. Pip partly overlaps the reporter's head at the post: check it at full size.
4. Verify the W2_CUT match + `pipHopS2S3At` at 12.98 against L3.
5. Measure head-back widths (<= ~140 px) and add more near-ground life if density/deadframes ask for it.
6. Review files per brief_L2.md, the critic loop (no workflow or critic round was run yet), report_L2.md.
- REQUEST: swap to L5's ToldTheBBCBoard when it lands.

## 2026-10-27 ~15:10 UTC, third helper (/effort max session): PAUSED by the orchestrator (5-hour limit); resume after 18:30 UTC
**State on video-production (pushed, V2S2 typechecks; other lanes' WIP may show tsc errors, e.g. V2S5_deck_props.tsx):**
- Round 0 critic panel (4 lenses: art director, sound-off, standards, motion) on the inherited build: **all FAIL**. Musts: Pip read as sitting
  on the reporter's head; the bottom third was one flat paving slab; paper-white pictograms + dog read as ghosts / a sheep; the plum near lamp-post
  ate the dark budget (dark 9.6-10.5 %, cap 8 %, STYLE: no plum on lamps/railings/birds); pale blinds on pale panes; notebook and staffer turn
  invisible; life stalls 7.15-8.26 and 10.67-12.85 (density gap 1.07 s); the A-board whipped in at ~53 px/f; far movers popped behind Pip.
- Fix round 1 (stopped mid-way; workflow run `wf_851604d1-77e`, script
  `~/.claude/projects/-home-user-Test-/<session>/workflows/scripts/l2-v2s2-fix1-wf_851604d1-77e.js`; both builders were IN FLIGHT, so a
  `resumeFromRunId` re-runs them from scratch: DON'T; start a fresh single agent from the lists below).
  - **Builder B (DONE on disk, first verify pass only):** `V2S2_Layout.ts` (bench x 600-800, y 1110-1290, seat 1243.8: heads >= 40 px under
    Pip's seat), `V2S2_Bench.tsx` (staffer drawn first, reporter's visible notebook page opens 9.48 / scribbles / claps 12.85, staffer
    turn + lean 9.48, hood + hunch 10.36), `V2S2_Staff.tsx` (own staff windows: people-shaped mono silhouettes, idle, deeper step-back,
    blinds CM.shadeWarm, W2 full 12.20), `V2S2_Board.tsx` (shove 8.42, easeInOutSine slide, newsagent drawn poses, text relaid: 3 body lines,
    credit in ink), `V2S2_Pip.tsx` (low hop-in, lands facing front ~6.71, ONE swivel to the wall 8.28-8.44, hop 12.85 unchanged),
    `V2S2.tsx` (camera: outSine pull, small float; screen-space mint mask y 0-600 + one cloud y 150-270). I moved the bench FURNITURE onto
    the layout in V2S2_Set.tsx at the pause. Not yet measured: board px/f, Pip clearances, the float law (see 4 below).
  - **Builder A (NOTHING written; plan only):** V2S2_Near.tsx (York-stone flag courses, sett channel, drain, leaf drifts; DELETE the paper-white
    pictograms; planter with grass blades; newspaper bundles + crate at the kiosk foot; a café cluster x ~230-480, y ~1330-1560), the near lamp
    in CM.line moved to x ~1030 / w ~20-22 + its bike; V2S2_Wall.tsx (pane-switch overlay on cols -1, 3-6 every 0.6-1.5 s, never a story pane,
    never 8.90-9.25 / 10.20-10.70, never the same pane twice within 1 s; rooftop features tops >= 612; parapet pigeons lift 7.45 / 10.30 /
    11.60; kiosk clock tick loop; urn steam scale 1.0, ceil 600); V2S2_Far.tsx (far movers enter at the right edge and REST at x 690-780, none
    ending in open view, >= 20 px clear of Pip; far lamps in CM.line, drop the u 2.5 lamp; the passing narrowboat from the right edge ~10.65 in
    open water, bow >= x 600, steerer + puffs; ducks paddle off its wake); V2S2_Life.tsx (3-4 near head-backs hv <= 150 with sway / bob, a
    coloured inked dog on a lead nosing a leaf 8.0-9.0 then trotting 10.4, paving pigeons flutter, a cyclist head-back 7.3-8.2 L->R, a jogger
    11.0-11.9 R->L). Railing rails/bars to CM.line (STYLE §2). Kiosk awning clear of SW5 (x1 ~110).
**Next, in order (ONE agent at a time, owner budget):**
1. One builder agent: builder A's list above (V2S2_Set / Life / new Near, Wall, Far) + verify (tsc grep V2S2, stills at 0.5 / full, dark <= 7 %).
2. Swap the stand-in board for L5's `ToldTheBBCBoard` (kit/boards; FILM s, `clackAt` ~8.44 or the slide's end; frame x 134-586, back wedge 595,
   shadow to ~661: hide board + shadow behind the kiosk before 8.42; keep >= 15 px between Pip (590, 1050) and the frame: shift the slide's rest
   dx <= 12 px left if needed); the newsagent <= 260 px tall (now 262).
3. The orchestrator's style decisions: float = straight legs turning every 0.6-1.5 s, net within +-12 px, home at 12.80; flash safety (never > 3
   flashes in any 1 s); near backs <= ~140 px wide; no plum on lamps / railings / far lamps / birds.
4. L3 holds my near lamp across the 12.98 match cut: send L3 (session_014PwCXJs9nWENkpKqVhHWMP) the final lamp x / y / h / w / variant / color.
5. Review files: `review.sh r1` (scratch: renders this shot's frames only) -> ONE combined critic (the brief's prompt + motion/standards) ->
   fixes -> report_L2.md (REQUESTS: map S2 bench/figure boxes as in V2S2_Layout; K4 StaffWindow blind colour + silhouettes; K6 wall stepped tiers
   + switchCols + Movers that rest instead of vanishing; K8 bridge hold 6 frames at 60 fps; caption boxes reach y 299).
