# Audit of our own G3 practice: where the board carries final-film signal, and where it goes silent (2026-10-26)

Lane: repo-only audit for the "animated sketchbook" direction (owner, 2026-10-26: "pretty much close to final version of the
story, transitions, animations, camera movements ... details ... as placeholders"). Evidence tag **OUR-REPO** = read in this
repo, path quoted; frames pulled with ffmpeg from the two v3 deliverables. Source list at the end.

## 1. What the current G3 already nails (keep, don't re-litigate)
- **Story signal is proven.** One idea per panel, cuts on locked words, sound-off cold read, matched frames, camera plan one
  row per panel. The owner followed the story at G3 ("this is great, I can follow the story better now") and NO story, cut
  or panel idea changed after the v3 G3 lock except the owner-initiated S9 swap. OUR-REPO [1][4][5].
- **Transitions are played, not only marked.** SketchReel plays 7 types (cut, dissolve, push-through, match-cut, wipe, dip,
  flash) and every slug names them. OUR-REPO [6] (Shot.transition), [2] §4.
- **The two animated moves carried.** v3's O1 pull-out and the S9 pull-back crane read correctly on the board; the owner
  approved the pull-back proposal from a board-mode render ("pretty good, yeah, continue, swap"). OUR-REPO [4][5].

## 2. Tooling inventory: what SketchReel board mode can and cannot animate today
CAN (OUR-REPO [6], props header; [7] lint; [8][9] builders):
- Element **in** (0.07 s pop), **out**, **draw-on** `draw:[start,dur]`, **fill flood** `fillIn`, timed text **strike**; a chart line drawn with the voice.
- Element **moves**: straight-line dx/dy, stackable, eases (named + cubic-bezier), optional scale `s` about a pivot, `lin` box-to-box; pre-done moves; element reuse via 0.008 s `snap()` teleports.
- **Camera**: ONE from→to segment per shot (x, y, z, roll), ease incl. bezier, start/end window; zoom lint <= 2x.
- **Figures**: 9 static poses, facing, 5 faces, hair; **red mark layer**; notes strip; frame-0 draw-on; loop to frame 0.
CANNOT:
- **No parallax in board mode** (`f` only sets default role) — S9's crane arc was faked by hand-computed per-element plane moves in `scripts/v3/build_proposal_pullback.py`. OUR-REPO [6] line 33-34.
- **No multi-keyframe camera** (one segment only), no camera path/arc primitive.
- **No looping/ambient motion**: a loop must be hand-stacked finite moves; nothing in the schema repeats.
- **No pose tween** (a figure can't reach, turn or walk within a shot) and **no element rotation** (a flip = swap one element out, another in).
- **No motion-speed check in the lint**: the 15 px/frame budget lives as a comment + hand loop in `build_board_cine.py`; `board_lint.py` checks boxes, bands, counts, zoom — never velocity. OUR-REPO [7][8].
- **Everything counts toward the caps**: 25-element warn / 30 split, 40 % plain paper, band rules — there is no exempt "set dressing" layer, so density literally cannot be placed on a passing board. OUR-REPO [7][2] §3.
- The G5 scaffold **flattens every board transition to a cut** ("Every transitionIn becomes a cut"), so an approved dissolve/dip must be re-decided at G5. OUR-REPO [10] §1.
- Deliverable facts: the G3 board renders at **30 fps** (ffprobe: 540x960, 30/1), the G5 cut at 60 — smoothness is judged at a rate the film never uses. OUR-REPO (ffprobe on [11][12]); [3] G3 row allows 30.

## 3. Visual gap check: matched frames, G3 board vs G5 blocking (contact sheets in scratchpad, 6+6 frames x2 sets)
What the G5 cut shows that the G3 board gave NO signal of (colour aside — G4+ by design):
- **Set emptiness transfers 1:1.** The board's "40 % plain paper" convention maps directly to bare walls and floors at G5: S12/S15/S16 at 30.0/37.0/39.9 s are one object + lamp pool on a large empty wall and floor — exactly the board's layout, now readable as "way too empty" because colour removes the storyboard alibi. The board APPROVED the emptiness without showing it.
- **Frame fill never stated.** S10's board "road as one light band" became a big flat snow field with one repeated house row (23.5 s); the board never says what occupies the other ~60 % of a wide's frame.
- **Zero ambient life, invisible by construction.** Spec bans texture, caps pops at 3, defaults every panel to HOLD — so a film with no clouds/steam/birds/flicker passes G3 silently; the owner's aliveness rule names exactly these. OUR-REPO [2] §2/§4 vs [13] Visual style.
- **Motion feel unjudgeable.** 12 of 14 v3 panels are HOLD + pops; the only proxies for "quality and smoothness" were two moves at 30 fps. "Smoothness is not there" had no G3 surface to show up on.
- **Final-art readability not predicted.** Board abstractions passed cold reads that the real art then failed: S9's stick streams read as "birds or drones", the lit street as "a dotted path", the pile as "hay"; kit props failed only at real panel size (tag-back sign, S8 lid, 1400 px keys). OUR-REPO [10] §8.
- What DID carry: story order, staging/composition of the subject, cuts-on-words, matched frames, captions, S9's scale composition.

## 4. G5-or-later surprises on v3 that a higher-signal G3 would have caught (owner quotes, OUR-REPO [4][10])
- 2026-10-26, G5 cut: "getting there, but the scenes are way too empty ... those feel a lot more alive ... if those are the final versions it's not good enough; the quality and smoothness is not there" → density/aliveness AND motion feel, both structurally invisible at G3 (§3).
- 2026-10-26, G5 cut: "let me know if this is just an initial intermediate step" → the G3→final fidelity ladder was never stated on the deliverable.
- 2026-10-26, during G5: the Arcane rooftop recording + "distill this scene ... find the best scene to replicate" → S9+S9b re-staged AFTER assembly (new kit, scenes.json row, re-render, docs lane; [10] §8 re-staging). A G3 whose big move played with near-final camera feel invites this swap one gate earlier.
- 2026-10-26: "the speed of transition should not be the reference point ... in a short reel we would speed it up" → retiming taste arrived at G5 on a proposal; a move played at intended speed at G3 surfaces it there.
- 2026-10-26: "another point in the Arcane shot is how great the scale feels" → the scale-FEEL cues (world keeps going, haze, tiny anchors) had no monochrome placeholder in the G3 end frame.
- Internal, same class: G5 cold-read misreads and kit-at-size defects ([10] §8) — each cost a render round that a final-size, final-shape placeholder at G3 would have pre-paid.

## 5. Gap list per signal the owner now wants near-final at G3
| Signal | Today (spec/tool) | Missing | Smallest closing change |
|---|---|---|---|
| Story | Cold read, one idea/panel, camera plan, lint [2][7] | nothing material | keep frozen; this layer already converges in 1 fix round |
| Transitions | 7 types played + labelled [6] | G5 scaffold drops them to cuts [10] | scaffold carries `transition.type` into scenes.json |
| Animations | pops, draw-on, straight moves; §4 caps motion ("held drawing", <= 1 move per 3 panels) [2] | §4 contradicts the playbook's widened rule [13]; no loops, no pose tween, no rotation | rewrite §4: "every final move/animation is PLAYED at sketch fidelity, polish deferred"; add `loop: true` on moves; pose swap via snap() documented as the pose-change idiom |
| Camera moves | one from→to + ease; parallax hand-faked [6][8] | multi-key paths; native board parallax; no speed lint | `camera.keys?: Cam[]`; honour `f` parallax behind `shot.parallax: true`; lint computes peak on-screen px/frame vs budget |
| Aliveness placeholder | banned by the caps and paper rule [2][7] | the entire signal | a `role:'dress'` scribble layer (3 px light-grey loose masses sketching the full set) exempt from the 25-cap and subject lint; 2-3 looping ambient micro-moves per set panel; lint WARNs a set panel over ~55 % bare paper or with zero ambient elements |
| Motion smoothness | G3 at 30 fps [3], judged vs a 60 fps film | the judgment surface | render the G3 reel at 60 fps (SketchReel is time-based; 540p60 is cheap) |
| Scale feel | composition rules [2] §7 | the "world keeps going" cues | dress layer gives the haze-band / shrinking-rows placeholder in grey |
Also: the playbook points to `docs/G3_ANIMATIC.md` as the animated-sketchbook spec — **that file does not exist yet** (checked); the new spec must be written or the pointer fixed. OUR-REPO [13].

## Sources (this repo)
[1] video/docs/look/STORYBOARD_STYLE.md §0, §5 · [2] same, §3-§7 · [3] video/docs/PIPELINE_V2.md (G3/G5 rows, frame rate, toolkit)
[4] video/docs/v3/OWNER_NOTES.md · [5] video/docs/v3/camera_plan_g3.md + video/docs/v3/storyboard_g3.md · [6] video/src/v3/SketchReel.tsx (lines 1-113)
[7] video/scripts/v3/board_lint.py · [8] video/scripts/v3/build_board_cine.py · [9] video/scripts/v2/build_board.py + video/docs/v2/storyboard_g3.md
[10] video/docs/G5_BLOCKING.md (§1, §8) · [11] video/deliverables/v3/v3_g3_animatic_board.mp4 · [12] video/deliverables/v3/v3_g5_blocking.mp4
[13] video/docs/OWNER_PLAYBOOK.md (Storyboard, Visual style, Motion, Hook)

## What this means for our G3
1. Freeze the story layer as-is (one idea/panel, cuts on words, cold read): zero post-lock story changes on v3 prove it; spend all new effort on the silent layers.
2. Add a third drawing layer `role:'dress'`: 3 px light-grey loose scribble masses that sketch the FULL set (shelf clutter, wall, street fill), exempt from the 25-element cap and subject lint; required on every home-base/wide panel.
3. Lint the blankness: a set panel whose stage is > ~55 % bare paper, or a wide with no dress layer, is a WARN — today's 40 %-paper rule becomes subject-zone-only.
4. Add ambient-life placeholders: `loop: true` on element moves; every set panel carries 2-3 looping micro-moves (cloud drift, steam, a window light); zero ambient elements on a set panel = lint WARN.
5. Rewrite STORYBOARD_STYLE §4 to match the playbook's widened rule: EVERY move and element animation the film will have is played at sketch fidelity ("held drawing by default" and "<= 1 move per 3 panels" are retired); only polish (easing micro-tuning, secondary motion, boil) is deferred.
6. Give the camera keyframes (`camera.keys?: Cam[]`) and board-mode parallax behind `shot.parallax: true`, so an S5 pull-back is authored as camera, not 500 lines of hand-computed plane moves.
7. Move the speed budget into board_lint: compute each move's peak on-screen px/frame (camera + own move) against ~450 px/s; delete the hand loop in build_board_cine.py.
8. Render the G3 reel at 60 fps so smoothness is judged at the film's real rate (SketchReel is time-based; the 540p cost is trivial).
9. Fix g5_scaffold to carry the board's transition types into scenes.json instead of flattening to cut, so an approved dissolve/dip survives the gate.
10. Per recurring set, approve ONE "density key" still at G3 — the set fully dressed in sketch scribble (ref docs/look/ref_animated_sketchbook.png) — and G5 lanes build to it; kit props are shown at every board size (incl. extremes) before lanes start (G5_BLOCKING §8 already demands this).
11. Add one cold-read question: "does this place feel inhabited — what's missing from the room?"; today's read only asks what the shot shows.
12. The G3 hand-off message states the fidelity ladder explicitly ("this IS the final motion/density plan; G4+ adds colour, final line, texture"), so the owner's approval knowingly covers aliveness and motion, and write the missing docs/G3_ANIMATIC.md (or repoint the playbook) as the home of rules 1-11.
