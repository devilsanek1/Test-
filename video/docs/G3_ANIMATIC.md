# G3 animatic: the animated sketchbook (spec + how-to, 2026-10-26)

Owner (2026-10-26): G3 is "the most important stage ... pretty much close to final version of the story, transitions,
animations, camera movements ... details ... as placeholders ... like an animated sketchbook ... the closest signal to
the final story in as little time as possible." Reference page: `docs/look/ref_animated_sketchbook.png`.
This file is the stage spec. The DRAWING spec stays `docs/look/STORYBOARD_STYLE.md` (palette, line weights, panel
rules); wherever the two conflict — §7's camera-plan rules included — this file wins (edit list: `docs/look/research/g3_spec_edits.md`).
The film's craft target is `docs/look/CRAFT.md` (2026-10-27): its transition grammar is already this file's (§4); the
other board-side changes (tiers as grey weights, the light rig, the thread) wait for the owner
(`docs/retro/2026-10-27_v3_retro.md` §5).
Why for every rule: the six research files in `docs/look/research/animatic_{reels,layout,rough,mograph,sketchlook,audit}.md`.

## 1. The principle: the film's rough pass

G3 **IS** the final film minus polish: every decision that is expensive to change later is MADE here and VISIBLE in the
MP4 — story, cuts, framing, camera moves, transitions, key actions, where the density and life go, the hook. Pros gate
exactly this way: the story reel locks the cut before layout (`animatic_reels.md` §1), rough layout locks the camera
with placeholder art (`animatic_layout.md` §1/§3), a pose test locks the motion before cleanup (`animatic_rough.md` §1).
Cleanup preserves, it never creates: what the owner cannot see at G3 does not exist for them to approve, and it ships
anyway — v3's "way too empty ... smoothness is not there" at G5 was density and motion that G3 structurally hid
(`animatic_audit.md` §3-4).

G3 **IS NOT**: colour, final line, texture, easing micro-tuning, overshoot/settle/secondary motion, faces beyond the
acting beat, real detail anywhere (windows, signage, crowds are marks, never drawings — identity-critical elements
excepted, §3). Loose in precision, dense in
suggestion: the backbone (big shapes, framing, timing, counts) is exact; the skin is scribble (`animatic_sketchlook.md` §0).

## 2. The signal contract

What the owner's G3 approval covers. After the lock, G4+ may only ADD (colour, real detail where a placeholder stands,
final line, easing polish, secondary motion) — never change a locked column. A change to a locked signal reopens G3
explicitly, as a JSON edit, never silently inside a build (`animatic_mograph.md`).

| Signal | G3 fidelity | "Near-final" concretely means | Checked by |
|---|---|---|---|
| Story, shot order, cuts | near-final (FROZEN) | one idea/panel, cuts on the locked words, in the VO's breaths | sound-off cold read; full-reel watch |
| Shot framing + staging | near-final (FROZEN) | shot type, subject size/position, 3 planes; both end frames of a move pass the STORYBOARD_STYLE §5 checklist as stills | board_lint boxes; cold read |
| Camera moves | near-final shape+timing | each move with the five values: move word, duration (s), start/end offset or scale, anchor, ease; path shape real; eases in AND out | lint: five values present; speed inside the §4 budget (WARN) |
| Transitions | near-final (FROZEN) | device named from §4 grammar, its board-time requirement met, PLAYED in the reel | lint per-device checks; pair watch |
| Key actions / animations | near-final shape+timing | every move the film will have exists here: 2-4 stepped key poses on beat words, smears for fast transits; stillness is a claim | motion check at 1x; "no G5 move without a G3 placeholder" |
| Aliveness / density | placeholder (plan FROZEN) | every surface that is dense in the final carries a grey mass at final position/size; `life:` list placed; 2-3 ambient loops per set panel | emptiness lint; density-promise check; owner question |
| Scale + cozy moments | near-final composition | home-base room tone, the one big move, the scale ladder, haze-band/shrinking-rows as grey dress | STORYBOARD_STYLE §7 checks |
| Hook / frame 0 | near-final | frame 0 = lines then tones, payoff in words, voice from frame 1, expectation-then-reality played | first-3s watch; playbook Hook rules |
| Captions / timing | final | locked VO, pop captions, word-anchored cuts; reel at full runtime, 60 fps | gate check; full-reel watch |
| Colour, texture, final line, easing feel, faces | ABSENT | — | deferred to G4/G5/G6 by design; the hand-off says so |

## 3. Placeholder vocabulary: loose never means empty

The v3 failure was reading "loose" as "leave it out" (`animatic_sketchlook.md` §4). Rule: **every surface that will
hold detail or life at G5 carries a placeholder mass at G3.** Plain paper is legal only where the final stays plain,
declared with `negative: true`. Palette stays the 4 tones of STORYBOARD_STYLE §2; scribble-mass tone is the ONE legal
texture (mid/far roles only).

- **Placeholder marks**: the **scribble mass is the default** — the owner asked for the sketchbook texture (2026-10-27),
  so it is BUILT: SketchReel `{t: 'scribble', x, y, w, h, gap?, jitter?}`, one wandering 3 px mid-grey stroke that reads
  as flat tone at 25 % (ONE lint element; demo `public/g3demo/`). Flat mid-grey rects (STORYBOARD_STYLE §6 maps `hatch`
  there) and gesture-figure rows for crowds remain legal. The other four primitives (specs in `animatic_sketchlook.md`
  §3: `crowd-row`, `facade-row`, `window-ticks`, `foliage-blob`) land the first time a reel's density key demands them
  (§7 tier 2).
- **Dress layer** (`animatic_audit.md` #2): elements with `role:'dress'` — 3 px light-grey loose masses sketching the
  FULL set (shelf clutter, wall fill, street fill) — exempt from the 25-element cap and subject lint. Required on every
  home-base and wide panel.
- **Detail gradient**: the subject is the only sharp thing — continuous 9 px contour and the only dark mass; adjacent
  surfaces a few real details; everything further ticks and masses. More than one fully detailed region is a smell.
  Windows, signage and crowds in dress/mid/far roles are never drawn at G3. An **identity-critical** element — named in
  the panel's one-sentence idea, a cozy opening per STORYBOARD_STYLE §7 (the home-base window with sill, mullion, lamp
  shade: the drawing that fixed v3's "screen or window?"), or a promise whose misread changes the story — keeps its
  literal §7 drawing and must be nameable in the cold read; any other peripheral that needs real drawing to be read is
  the subject of its own panel.
- **The promise**: a placeholder's region and tone ARE the contract — "final art goes here, this dense." Per shot, the
  JSON field `life: [...]` names every G5 life item (crowd, traffic, clutter, steam, window lights); lint requires one
  placeholder element per item. The notes strip (or JSON `promise`) says what each mass becomes: "grey row = 6
  pedestrians, walking."
- **Density key**: per recurring set, ONE still of the set fully dressed in sketch scribble is approved at G3; G5 lanes
  build to it (`animatic_audit.md` #10). Kit props are shown at every board size before lanes start.

## 4. Motion at G3 (supersedes STORYBOARD_STYLE §4 "held drawing by default")

**Every cut, camera move, element animation and transition the final film will have is PLAYED in the animatic**, with
its real path shape and real timing (a reference gives the shape, never the speed — retime to the reel, playbook Motion
rule), at sketch fidelity. "<= 1 move per 3 panels" is retired. A still panel is a CLAIM that the G5 shot is still;
G5 adds no new motion — only colour, line, easing polish, secondary motion (`animatic_rough.md` #2, `animatic_layout.md` #7).

- **Camera**: authored as camera transforms (never baked into element moves — a baked move is a picture of a move).
  Each move ships the anime five: move word, duration, start/end offset or scale %, anchor ("fix on sign"), ease. Every
  move eases in AND out; a subject-follow starts 2-4 frames after the subject; pans/rises are ONE oversized drawing
  (panel drawn 120-140 % of frame) the camera travels across; a push-in > 2x stays a cut-in. Speed budget: ~15 px/frame
  at the render rate = ~900 px/s at 60 fps (derivation: v1's ~450 px/s was the same 15 px/frame at 30; strobe scales
  with px/frame, and the playbook Motion rule says 60 fps allows faster moves — readability at 1x is the test, not the
  number). Over budget is a lint WARN, resolved by the sound-on check at 1x; measured only over moves lasting >= 2
  frames (snap()/pops exempt). Both end frames pass the STORYBOARD_STYLE §5 checklist as stills.
- **Drawn actions are a pose test, not tweens**: 2-4 held key poses per shot, popping on their words (held 0.3-1.5 s),
  stepped — never an eased body slide. A fast transit is ONE smear drawing (silhouette stretched along the path) held
  2-3 frames between the keys. Faces and hands drop in motion poses; an emotion face appears only on the held acting
  beat; mitten hands always. No volume lint (precision the owner waived): the cold read checks that the subject stays
  the same size and on its ground line across a shot's poses unless the change is the idea.
- **Ambient life**: every set panel carries 2-3 looping micro-moves (`loop: true`), placed and scaled from a **shared
  kit of 3-5 presets** (cloud drift, steam, window-light switch, bird tick) — never authored fresh per panel (building
  the kit is the `loop: true` item in §7). Zero ambient elements on a set panel is a lint FAIL (§2 freezes 2-3 as contract).
- **Line boil is NOT a G3 requirement** — pure look, zero story signal (the owner approves nothing via boil; aliveness
  signal is already carried by placeholders + ambient loops, which ARE the contract). Optional after the pipeline is
  proven: the seeded-variant scheme in `animatic_sketchlook.md`, never on captions/numbers/labels/marks. The next
  animatic ships boil-off.
- **Unanimated, on purpose**: overshoot, settle, secondary action, breathes, true morph tweens, easing feel beyond
  in/out — all G5/G6. Blocking is the kill test: a shot that only reads with polish gets redrawn, never polished.
- **Drawing budget** for a 40 s / ~15-shot reel: ~60-120 distinct drawings (2-4 poses x shots, + smears),
  spent unevenly — 2-3 poses on held dialogue shots, 6-12 drawings on the 1-3 shots whose meaning IS motion.

**Transition grammar: carry something, don't cut** (`docs/look/CRAFT.md` §a; owner, v3 G5b, 2026-10-27: "no clean
transitions, just a bunch of shots put together"). Every join names its device and its carrier letter in the board JSON
(`animatic_mograph.md` §3): A push-through, B thread match or match cut, C continuous camera, D object carry or wipe, E card
flip or swipe, F plain cut (at most 2 per film). Lint ships the `device` field and the carrier check first (§7 tier 1);
each device's specific check is built the first time a reel's camera plan uses that device. Dissolves: 0.2-0.4 s to
soften, up to 1-2 s only for time passing.

| Device | Must be decided at G3 (lintable) |
|---|---|
| plain cut (F, never the default) | at most 2 per film, only on a "But" turn, the thread on screen on both sides; >= 20 % size or >= 30° angle change (else it reads as a jump cut) |
| cut-on-action | same action split across the cut, same screen direction |
| match-cut | anchor element at same position + scale in both panels; built from the first panel's element list; checked at the boundary frames |
| morph | start shape, end shape, shared centre; PLAYED as 2-3 stepped drawings (start, one smear, end, popped on the cut word) so the morph's duration and feel are locked; a G5 tween keeps that duration or explicitly reopens G3 |
| push-through (scale-through) | panel A contains a 15-30 %-of-frame sub-frame that IS panel B |
| whip / carry | both shots name the same direction at matched speed; exempt from the speed budget (matched HIGH speed is the device) — lint checks direction + speed match across the cut instead |
| wipe (object-wipe) | the wiping element already exists in panel A, with its travel direction |
| dissolve / dip / flash | the relationship named ("time passes"); duration per the rule above |

## 5. Build order and time budget (first full animatic ~2 h, ASSUMING §7 tier-1 tooling is built; rounds 30 min)

With script + voice locked (word timings = the clock); per-step budgets sum to the 2 h:
1. **Story/beat pass** (~10 min, orchestrator): one sentence per panel, cut words chosen in the VO's breaths, metaphor
   per scene locked in text BEFORE drawing (a dozen script drafts is normal, a dozen re-boards is not). Vary cut rhythm:
   fast around the conflict, one breathing shot after the payoff; three near-equal durations in a row is a pacing smell.
2. **Camera plan** (~15 min; `docs/vN/camera_plan_g3.md`, one row per panel): shot type, framing, cozy/scale, move with
   its five values, transition device, `life:` list, promise line. This is the contract draft.
3. **Thumbnails** (~20 min): 3 variants per beat at 270x480 on one contact sheet, picked by checklist (two-pass:
   scribble for energy, volume pass only on survivors — discard at pass 1).
4. **Board JSON** (~30 min wall clock: one agent per 3-5 panels, ~4 lanes in parallel, once the camera plan is locked;
   the dress/density pass and the G4 style frames run in parallel lanes).
5. **Motion pass** (~20 min): camera keys, pose pops, smears, kit loops, transitions played.
6. **Lint** (~5 min, `board_lint.py`) — boxes, bands, counts, PLUS the tier-1 checks (§7): five-values per move, speed
   WARN, carrier check, camera-plan cross-check, life-list coverage, unaccounted emptiness, dress layer on wides,
   ambient on set panels.
7. **Cold reads + ONE fix round** (~15 min): the sound-off read, then the sound-on pass, each run ONCE; batch every
   finding into one fix round, re-lint once. Anything still amber after that round ships to the owner with the amber
   items named in the hand-off (the owner is the pre-G6 reviewer, PIPELINE anti-waste rule 1); no further internal loops.
8. **Owner** (~5 min): ONE 540p **60 fps** MP4 of the whole reel (always end-to-end; the reel is the living master —
   every approved change lands in the board JSON first), plus the density-key still(s) and the parallel G4 style frames.

**Over budget?** Cut pose counts toward 2 per shot and ambient loops toward the kit minimum first; never cut a §2
contract column (cuts, framing, moves, transitions, density placeholders).

## 6. Review and lock

- **Sound-off cold read** (STORYBOARD_STYLE §5 checklist) stays the gate, plus one new question per set panel: "does
  this place feel inhabited — what's missing from the room?"
- **Motion check, sound on, at 1x**: every move readable (no strobe; this pass resolves the §4 speed WARNs), every cut
  lands on its word, cuts judged in PAIRS with their neighbours, pacing varies. Each pass runs ONCE, then one batched
  fix round (§5 step 7); remaining ambers ship named in the hand-off, never a second internal loop.
- **Density-promise check**: no panel surface both empty AND undeclared. The emptiness lint, mechanically: at 270x480,
  6x10 grid, auto-exempting the caption band, notes strip, `negative` zones, the subject's 80 px breathing ring and the
  120 px edge margins (STORYBOARD_STYLE §3 mandates that air — it is never declared `negative`); a FAIL is a contiguous
  undeclared region of >= 4 adjacent cells each >= 97 % paper (single bare cells are composition air); the ~55 %
  bare-stage WARN stays.
- **The hand-off message states the fidelity ladder**: "This IS the final story, cuts, camera, motion and density plan;
  every grey mass becomes real detail at G5, every bare area stays bare; G4+ adds colour, final line, texture, polish —
  OK?" The owner's approval knowingly covers motion, timing and aliveness, not just story.
- **The lock** = the §2 contract frozen. A G3 revision costs a JSON data edit + a re-render of the failing shots only
  (approved shots stay frozen; each note maps to shot ids). Later timing feedback may move a cut by < 1 s; anything
  bigger, or any change to a locked column, reopens G3 explicitly. Expect "page-one" verdicts here — that is the point:
  a story note at G3 costs drawings, a story note at G5 costs a finished shot.

## 7. Tooling deltas (from `animatic_audit.md` §2/§5; S ~ <=2 h, M ~ half a day)

**Already exists**: 7 transition types played; element moves + eases; one camera segment; 9 poses; draw-on/fillIn; notes
strip; red marks; box/band/count/zoom lint; contact sheets; g5 scaffold; **`{t:'scribble'}` masses (built 2026-10-27,
owner-approved texture)**. Scribble masses, flat mid-grey rects + figure rows cover the first reel's placeholders (§3). **Tier 1 is a ONE-TIME checkpointed tooling lane, landed before the next video's G3
and outside the gate budget; the §5 2 h first cut assumes only tier 1 exists. Tier 2 is built lazily, the first time a
reel needs it — never ahead of a reel.** Nobody builds tooling before drawing panels the existing kit can draw.

| Tier 1 — required before the next G3 (all fix the v3 failure directly) | Where | Effort |
|---|---|---|
| `role:'dress'` layer, exempt from 25-cap and subject lint | SketchReel + board_lint | S |
| `loop: true` + the shared ambient kit (3-5 presets: cloud drift, steam, window-light switch, bird tick) | SketchReel | S |
| `life: [...]` + one-placeholder-per-item lint; `negative: true`; emptiness grid check with the §6 exemptions (FAIL = >= 4 contiguous undeclared bare cells); >55 % bare-stage WARN; zero-ambient FAIL on set panels | board_lint | S-M |
| Move spec completeness lint (the five values per camera move) | board_lint | S |
| Speed lint as WARN: peak px/frame (camera + own move) vs ~15 px/frame at the render rate (~900 px/s at 60), measured only over moves >= 2 frames (snap()/pops exempt); whip/carry shots exempt, linted for direction + speed match across the cut; delete the hand loop in build_board_cine.py | board_lint | S |
| Transition `device` field + the carrier check (a carrier letter per join, at most 2 plain cuts, each plain cut >= 20 % size or >= 30° change: `CRAFT.md` §a) | JSON schema + board_lint | S |
| Camera-plan cross-check: every plan row's move, transition device and `life:` item exists in the board JSON, or the plan row is edited | board_lint | S |
| Red marks: STORYBOARD_STYLE §4 cases (1) and (3) FAIL on any owner-facing render (legal only in internal interim drafts) | board_lint | S |
| `pose:'smear'` figure variant; snap() documented as the pose-change idiom | SketchReel (snap exists) | S |
| Render the G3 reel at 60 fps (SketchReel is time-based; 540p60) | render command | S |
| g5_scaffold carries `transition.type` into scenes.json instead of flattening to cut | g5_scaffold.py | S |

| Tier 2 — build when a reel first needs it | Where | Effort |
|---|---|---|
| `crowd-row` / `facade-row` / `window-ticks` / `foliage-blob` when a reel's density key demands them (`scribble-mass`: BUILT 2026-10-27, owner yes) | SketchReel | M |
| `camera.keys?: Cam[]` (multi-key camera) + board-mode parallax behind `shot.parallax: true` | SketchReel | M |
| Per-device transition checks (§4 table), one device at a time, when a camera plan first uses it (a 15-shot reel uses 2-4 of the 8) | board_lint | S each |

**Dropped**: the volume/contact lint (polices precision the owner waived; the cold read covers it, §4). **Line boil**:
optional, only after the pipeline is proven (§4) — not scheduled.
