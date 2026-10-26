# Edit list: aligning the other docs with `docs/G3_ANIMATIC.md` (2026-10-26)

Exact old -> new edits for the docs the new G3 spec touches. Do them verbatim; each edit says where the new
animated-sketchbook direction (owner, 2026-10-26) supersedes an earlier rule. Every other owner rule stays intact.

## 1. `video/docs/look/STORYBOARD_STYLE.md`

**§0 The principle** — supersedes "animate only where timing is the question" (the playbook's Storyboard section already
widened this on 2026-10-26) and "the camera move as a red mark" (moves are now played, not marked).

OLD: "Draw at thumbnail level, make the intent explicit (one action, the framing, the shot type, cozy/scale, the camera
move as a red mark, all stated in the notes strip in big words), animate only where timing is the question, and stop
the moment the panel says what it must. Quality is not the goal at G3."

NEW: "Draw at thumbnail level, make the intent explicit (one action, the framing, the shot type, cozy/scale, all stated
in the notes strip in big words), PLAY every move and transition the film will have at sketch fidelity (shape and
timing real, polish absent — stage spec: `docs/G3_ANIMATIC.md`), place a grey placeholder wherever the final film is
dense or alive, and stop the moment the panel says what it must. Quality is not the goal at G3; completeness of signal is."

**§2 The look, last line** — supersedes the blanket texture ban (sketchlook lane: scribble tone is how a sketch page
promises density).

OLD: "**Texture: none** (no hatching, grain, gradients or caption glow)."

NEW: "**Texture: placeholder tone only** (flat mid-grey rects today; the scribble primitives of `G3_ANIMATIC.md` §3
when built — mid/far/dress roles, placeholder tone, never decoration). Still banned: hatching as rendering, grain,
gradients, caption glow."

**§3 Drawing rules, "Space" bullet** — supersedes the 40 %-paper rule (it is what approved v3's emptiness; audit lane §3).

OLD: "- **Space:** at least 40 % of the stage is plain paper."

NEW: "- **Space:** at least 40 % of the SUBJECT ZONE is low-detail (plain paper or flat scribble tone), so the subject
breathes. Outside the subject zone, bare paper is legal only where the final film stays plain, declared `negative:
true`; every surface that will be dense or alive at G5 carries a placeholder mass (`G3_ANIMATIC.md` §3). A set panel
over ~55 % bare stage, or a wide with no `role:'dress'` layer, is a lint WARN."

(The rest of the Space bullet — edge margins, caption band, UI rail — is unchanged.)

**§4 Camera and motion notation** — replace the whole first two bullets (full literal texts below, so nothing survives
ambiguously). Supersedes "held drawing by default", "at most one move per three panels", the 1.6x push-in cap (now 2x)
and the 3-pops-per-panel cap (both recorded in §5 notes); "No parallax in board mode" moves from a rule to a tooling
gap being closed.

OLD (bullet 1, whole, wraps across lines): "**By default a panel is a held drawing, cut on the voice.** Motion is used
only where the motion is the meaning (the Iron Giant reels tested camera moves early, crude on purpose [17], REPORTED).
An element pops in on the word that names it (at most 3 per panel). An element moves only when its movement is the idea
(the price tag climbing), in a straight line with easing."
OLD (bullet 2, whole, wraps across lines): "**Real camera moves:** a push-in that reveals or isolates (at most 1.6x),
or a rise or pan that reveals scale. Both end frames have to pass the checklist as panels; the subject is never cut off
at an edge for more than 0.3 s; at most one move per three panels. **A zoom of more than 2x becomes a cut to a closer
panel** (a cut-in reads instantly; the 4.2x zoom in S8 did not). No parallax in board mode."

NEW (bullet 1): "**Every cut, camera move, element animation and transition the final film will have is PLAYED in the
animatic** with its real path shape and real timing (retimed to the reel: the reference gives the shape, never the
speed), at sketch fidelity: drawn actions as 2-4 stepped key poses on their words, fast transits as one smear, ambient
life as 2-3 looping micro-moves per set panel, rough in/out easing only. A still panel is a claim that the G5 shot is
still. Deferred to G5/G6: overshoot, settle, secondary motion, easing feel, morph tweens. Full rules and the transition
grammar: `docs/G3_ANIMATIC.md` §4."
NEW (bullet 2, the clause): "... Both end frames have to pass the checklist as panels; the subject is never cut off at
an edge for more than 0.3 s. Every move ships its five values (move word, duration, start/end offset or scale, anchor,
ease) and eases in AND out; speed budget ~15 px/frame at the render rate (~900 px/s at 60 fps — a lint WARN resolved by
the sound-on check at 1x; derivation in `G3_ANIMATIC.md` §4). **A zoom of more than 2x becomes a cut to a closer
panel.** Board-mode parallax only behind `shot.parallax: true` (rise-over planes)."

(§4's red-mark rule shrinks: cases (1) "a move planned but not animated yet" and (3) "the subject's path is the idea
but isn't animated" are legal ONLY in internal interim drafts — on any owner-facing render they are a lint FAIL: a mark
where a played move belongs is exactly the held-drawing loophole the owner's direction retires.)

**§5 Speed: how to iterate** — two edits.

OLD: "Change that shot's JSON only, re-render its stills, then the 540p 30 fps reel."
NEW: "Change that shot's JSON only, re-render its stills, then the 540p **60 fps** reel (smoothness is judged at the
film's real rate; `G3_ANIMATIC.md` §5)."

OLD: "Nothing is polished at G3: no parallax, texture, colour or extra draw-on."
NEW: "Nothing is polished at G3: no colour, no final line, no easing feel, no line boil — but density placeholders,
ambient loops and played moves are SIGNAL, not polish, and are required (`G3_ANIMATIC.md` §2)."

**§5 sound-off checklist** — append three items: "(10) sound on at 1x: every move readable, no strobe, every cut lands on
its word, cuts judged in pairs; (11) no panel surface both empty and undeclared (`negative: true` or a placeholder), and
each set panel answers 'does this place feel inhabited?'; (12) the subject stays the same size and on its ground line
across a shot's poses unless the change is the idea."

**§6 lint paragraph** — append to the per-shot checks list: "the `G3_ANIMATIC.md` §7 tier-1 checks: dress-layer
exemption, move five-values, speed WARN (~15 px/frame at the render rate, measured only over moves >= 2 frames,
whip/carry shots exempt), the default-cut check, the camera-plan cross-check (every plan row's move / transition device
/ `life:` item exists in the board JSON), `life:` coverage, unaccounted emptiness (with the §6 exemptions: subject
breathing ring, edge margins; FAIL = >= 4 contiguous undeclared bare cells), zero-ambient FAIL on set panels, red-mark
cases (1)/(3) FAIL on owner-facing renders."

**§3 "One idea per panel" bullet** — the dress layer's cap exemption must live in the drawing rule, not only §6's lint.

OLD: "Exactly one subject; 12-25 elements, and over 30 the panel gets split."
NEW: "Exactly one subject; 12-25 elements, and over 30 the panel gets split (`role:'dress'` placeholder elements exempt
— `G3_ANIMATIC.md` §3)."

**§4 slug bullet** (last bullet, wraps across lines) — dissolves follow the stage spec's grammar.

OLD: "Cut by default; a dissolve means time passes."
NEW: "Cut by default; dissolves per `G3_ANIMATIC.md` §4: 0.2-0.4 s to soften, 1-2 s only for time passing."

**§7 camera-plan block, "Moves" bullet** — THE critical edit: §7 is the doc the cinematographer follows when writing
`camera_plan_g3.md`, and this bullet still prescribed the held-panel regime that hid v3's motion signal.

OLD: "- **Moves:** animate at most two, both timing questions: the opening's 5 % pull-out and the one big reveal. Every other
  panel holds and cuts on its word (G5 adds the 1.5-2 % breathes)."
NEW: "- **Moves:** every cut, camera move, element action and transition the final film will have is PLAYED at sketch
  fidelity (`G3_ANIMATIC.md` §4-5; speed budget ~15 px/frame at the render rate, a lint WARN). "At most two" is retired;
  a held panel is a CLAIM that the G5 shot is still (G5 adds only the 1.5-2 % breathes and polish, never new motion)."

**§7 rise-over bullet, last sentence.**

OLD: "This is the only parallax a board gets."
NEW: "Board-mode parallax plays behind `shot.parallax: true` (rise-over planes, `G3_ANIMATIC.md` §4 — tier-2 tooling);
other shots stay flat."

## 2. `video/docs/PIPELINE_V2.md`

**G3 row of the gate table.**

OLD: "| **G3 Sketch animatic** | ONE video: the whole film as line sketches timed to the voice, rough camera, **every
transition labelled** (visual concepts are explored and judged internally; owner rule: one version) — tool: `SketchReel`
(`src/v3/SketchReel.tsx`, data in `public/v3/animatic.json`) | **story in pictures**: shot per line, cuts, transitions,
peaks | scene list, cut points, shot content, transition types | first cut 2 h; rounds 30 min |"

NEW: "| **G3 Sketch animatic** | ONE video at 60 fps: the whole film as an ANIMATED SKETCHBOOK (spec:
`docs/G3_ANIMATIC.md`) — every cut, camera move, transition and key action PLAYED at sketch fidelity, density and life
as grey placeholders, timed to the locked voice (visual concepts judged internally; owner rule: one version) — tool:
`SketchReel` board mode + `board_lint` | **the film's rough pass**: story in pictures, cuts, transitions, camera moves,
key actions, the density/life plan (the hand-off states the fidelity ladder) | the signal contract (`G3_ANIMATIC.md`
§2): scene list, cut points, shot content, framing, transition devices, camera moves, motion plan, density promises |
first cut 2 h (assumes `G3_ANIMATIC.md` §7 tier-1 tooling, built once beforehand); rounds 30 min |"

**Frame rate section** — two edits.

OLD: "The G3 animatic may render at 30."
NEW: "The G3 animatic renders at **60 fps** too (SketchReel is time-based; 540p60 is cheap), so motion smoothness is
judged at the film's real rate — v3's 'smoothness is not there' had no 30 fps surface to show on."

OLD: "Camera speed limits are per second (v1's ~15 px/frame at 30 = ~450 px/s)."
NEW: "Camera speed limits are strobe limits and scale with the rate: ~15 px/frame at the render rate (= ~450 px/s at
30, ~900 px/s at 60; playbook Motion: 60 fps allows faster moves). Readability at 1x is the test, not the number."

**Anti-waste rule 6** (consistency touch-up).

OLD: "**Precise numbers only at G5 or later.** The G3 storyboard is data plus a video, never an 800-line prose spec with px/s values."
NEW: "**Precise numbers only at G5 or later**, except the G3 motion numbers that are the contract (move durations,
the five values, the ~15 px/frame speed budget — they live in the board JSON and the camera plan, enforced by lint,
never as a prose spec)."

**Toolkit table** — edit the G3 board-style row and add one row.

OLD row (plain quotes, copied verbatim from the file — no backslash escapes): "| G3 board style |
`docs/look/STORYBOARD_STYLE.md`; SketchReel `style: "board"`; `scripts/v3/board_lint.py`; `v3-g3-board-*.js` |
monochrome studio boards (4 tones, line weight by role, icons, gesture figures, one idea per panel); lint before
render; sound-off cold read; one fix round |"
NEW row: "| G3 board style | `docs/G3_ANIMATIC.md` (stage) + `docs/look/STORYBOARD_STYLE.md` (drawing); SketchReel
`style: "board"`; `scripts/v3/board_lint.py`; `v3-g3-board-*.js` | the animated sketchbook: monochrome boards, every
final move/transition played, placeholder density; tier-1 lint (motion + emptiness checks) before render; sound-off +
sound-on cold reads, ONE batched fix round |"
NEW additional row (after it): "| G3 motion + density | `G3_ANIMATIC.md` §3-4 + §7 tier 1 — **to build**, one
checkpointed lane before the next video's G3 (not yet kit) | pose-test actions (2-4 stepped keys, smears), kit ambient
loops, transition `device` field + default-cut check, density placeholders + `life:` lists, 60 fps reel |"

**"Tooling to build before video 2" section** — append one item, so the next orchestrator never plans a 2 h first cut
against missing tooling: "6. **G3 animatic tier-1 tooling** (`G3_ANIMATIC.md` §7 tier 1): dress layer, `loop` + ambient
kit, the tier-1 lints, transition `device` field, 60 fps render, g5_scaffold `transition.type` carry-through. One
checkpointed lane before the next video's G3, outside the gate budget; the G3 row's 2 h first cut assumes it exists. *(~1-2 days)*"

**G5 row of the gate table** — the G3 signal contract gets an enforcement surface at G5 entry (v3's
transition-flattening proves promises die at gate boundaries without one).

OLD: "| G5 Blocking cut | real sets and props at draft line quality that already **feel alive** (a dense, detailed
world, people, a living character, ambient life always on; judged against the references, `OWNER_PLAYBOOK` Visual
style; v3 G5 was "way too empty"), final camera, key poses, **no edges/paper/texture** | staging, readability at phone
size, transitions that play | compositions, camera, timing | 4 h |"
NEW: "| G5 Blocking cut | real sets and props at draft line quality that already **feel alive** (a dense, detailed
world, people, a living character, ambient life always on; judged against the references, `OWNER_PLAYBOOK` Visual
style; v3 G5 was "way too empty"), final camera, key poses, **no edges/paper/texture**; **entry check before lanes fan
out** (`G5_BLOCKING.md`): scripted diff of scenes.json + built scenes against the locked board JSON (every camera move,
element move, transition device, `life:`/promise item matches; no new motion), plus a sound-off cold read of the first
fully dressed set (the density-key build) | staging, readability at phone size, transitions that play | compositions,
camera, timing | 4 h |"

## 3. `video/docs/G5_BLOCKING.md` (the G3 contract's G5-side enforcement)

**§1, the paragraph after the scaffold command** — g5_scaffold no longer flattens transitions.

OLD: "Every `transitionIn` becomes a `cut` (the board's transition labels stay in `note`); the board's LOOP panel is dropped:"
NEW: "Every `transitionIn` carries the board's `transition.type` (g5_scaffold no longer flattens to `cut`; the labels
also stay in `note`); the board's LOOP panel is dropped:"

**§1, append at the end of the section** (new paragraph): "**G5 entry check, before lanes fan out** (`G3_ANIMATIC.md`
§2: G4+ may only ADD — these two checks are where that promise is enforced): (1) a scripted diff of scenes.json and
each built scene against the locked board JSON — every camera move, element move, transition device and `life:`/promise
item matches, and no motion exists that G3 did not play; a mismatch is a FAIL or an explicit, owner-visible G3 reopen.
(2) A sound-off cold read of the first fully dressed set (the density-key build): map each board `promise` line to what
a cold reader names (v3: streams read as birds). Lanes start only after both pass."

## 4. Root `CLAUDE.md` (the one G3 bullet)

OLD: "- The G3 animatic is a monochrome studio storyboard (`video/docs/look/STORYBOARD_STYLE.md`) built for SIGNAL per
drawing, not quality: literal and readable with the sound off, yet it carries the cinematography (framing, scale, cozy
home base)."

NEW: "- The G3 animatic is an ANIMATED SKETCHBOOK (stage spec `video/docs/G3_ANIMATIC.md`, drawing spec
`video/docs/look/STORYBOARD_STYLE.md`): the film's rough pass at 60 fps — story, cuts, framing, every camera move,
transition and key action PLAYED with real shape and timing, density and life as grey placeholders (loose never means
empty) — monochrome, readable with the sound off; G4+ only ADDS (colour, detail, polish), never changes what G3 locked."

## 5. Supersession notes (owner rules touched)

- "Animate only where timing is the question" (old STORYBOARD_STYLE §0) — already superseded by the owner's
  animated-sketchbook direction, recorded in `OWNER_PLAYBOOK.md` Storyboard section (2026-10-26). §4's "held drawing by
  default" / "<= 1 move per 3 panels" are the remnants; the edits above retire them.
- "Texture: none" and "40 % plain paper" — superseded in their old form; scribble placeholder tone is now the one legal
  texture, and bare paper must be declared. The owner's "very subtle texture" rule (playbook, Visual style) is about the
  FINAL film and is untouched.
- "G3 may stay at 30" (`OWNER_PLAYBOOK.md` Motion; also PIPELINE_V2 frame-rate section) — the new spec renders G3 at 60.
  An allowance we gave ourselves, not an owner instruction (the owner asked for 60 "from G5 to the final"), so a reword,
  never a Retired entry. Exact playbook edit, same commit — OLD: "G3 may stay at 30." NEW: "the G3 reel also renders at
  60 (`G3_ANIMATIC.md`, 2026-10-26)."
- Two more §4 rules superseded, not lost: the push-in cap "at most 1.6x" -> a push-in > 2x stays a cut-in
  (`G3_ANIMATIC.md` §4), and "An element pops in on the word that names it (at most 3 per panel)" -> the 3-pop cap is
  retired (pops are pose/element motion under the played-motion rules; the element budget is the cap).
- Line boil: researched, but NOT a G3 requirement — optional only after the pipeline is proven (`G3_ANIMATIC.md` §4);
  no doc may list it as current kit.
- Everything else (one version to the owner, no MP4s before G3, sound-off read, 4-tone monochrome, notes strip, cozy/
  scale rules, no AI critics before G6) stands unchanged.
