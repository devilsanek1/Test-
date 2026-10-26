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

NEW: "**Texture: scribble-mass only** (the placeholder primitives of `G3_ANIMATIC.md` §3, mid-grey, mid/far/dress roles
— placeholder tone, never decoration). Still banned: hatching as rendering, grain, gradients, caption glow."

**§3 Drawing rules, "Space" bullet** — supersedes the 40 %-paper rule (it is what approved v3's emptiness; audit lane §3).

OLD: "- **Space:** at least 40 % of the stage is plain paper."

NEW: "- **Space:** at least 40 % of the SUBJECT ZONE is low-detail (plain paper or flat scribble tone), so the subject
breathes. Outside the subject zone, bare paper is legal only where the final film stays plain, declared `negative:
true`; every surface that will be dense or alive at G5 carries a placeholder mass (`G3_ANIMATIC.md` §3). A set panel
over ~55 % bare stage, or a wide with no `role:'dress'` layer, is a lint WARN."

(The rest of the Space bullet — edge margins, caption band, UI rail — is unchanged.)

**§4 Camera and motion notation** — replace the whole first two bullets. Supersedes "held drawing by default" and
"at most one move per three panels"; "No parallax in board mode" moves from a rule to a tooling gap being closed.

OLD (bullet 1): "**By default a panel is a held drawing, cut on the voice.** Motion is used only where the motion is
the meaning ... An element moves only when its movement is the idea (the price tag climbing), in a straight line with easing."
OLD (bullet 2, the clause): "... at most one move per three panels. **A zoom of more than 2x becomes a cut to a closer
panel** ... No parallax in board mode."

NEW (bullet 1): "**Every cut, camera move, element animation and transition the final film will have is PLAYED in the
animatic** with its real path shape and real timing (retimed to the reel: the reference gives the shape, never the
speed), at sketch fidelity: drawn actions as 2-4 stepped key poses on their words, fast transits as one smear, ambient
life as 2-3 looping micro-moves per set panel, rough in/out easing only. A still panel is a claim that the G5 shot is
still. Deferred to G5/G6: overshoot, settle, secondary motion, easing feel, morph tweens. Full rules and the transition
grammar: `docs/G3_ANIMATIC.md` §4."
NEW (bullet 2, the clause): "... Both end frames have to pass the checklist as panels; the subject is never cut off at
an edge for more than 0.3 s. Every move ships its five values (move word, duration, start/end offset or scale, anchor,
ease) and eases in AND out; peak on-screen speed (camera + own move) <= ~450 px/s. **A zoom of more than 2x becomes a
cut to a closer panel.** Board-mode parallax only behind `shot.parallax: true` (rise-over planes)."

(§4's red-mark rule shrinks by itself: case (1) "a move planned but not animated yet" should now be rare — keep the
notation for the interim, note it as transitional.)

**§5 Speed: how to iterate** — two edits.

OLD: "Change that shot's JSON only, re-render its stills, then the 540p 30 fps reel."
NEW: "Change that shot's JSON only, re-render its stills, then the 540p **60 fps** reel (smoothness is judged at the
film's real rate; `G3_ANIMATIC.md` §5)."

OLD: "Nothing is polished at G3: no parallax, texture, colour or extra draw-on."
NEW: "Nothing is polished at G3: no colour, no final line, no easing feel — but density placeholders, ambient loops and
played moves are SIGNAL, not polish, and are required (`G3_ANIMATIC.md` §2). Contact sheets sample boil variant 0."

**§5 sound-off checklist** — append two items: "(10) sound on at 1x: every move readable, no strobe, every cut lands on
its word, cuts judged in pairs; (11) no panel surface both empty and undeclared (`negative: true` or a placeholder), and
each set panel answers 'does this place feel inhabited?'."

**§6 lint paragraph** — append to the per-shot checks list: "the new `G3_ANIMATIC.md` §7 checks: dress-layer exemption,
move five-values, peak speed vs ~450 px/s, per-device transition requirements, `life:` coverage, unaccounted emptiness,
ambient-loop presence, pose volume/contact drift <= 10 %."

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
first cut 2 h; rounds 30 min |"

**Frame rate section.**

OLD: "The G3 animatic may render at 30."
NEW: "The G3 animatic renders at **60 fps** too (SketchReel is time-based; 540p60 is cheap), so motion smoothness is
judged at the film's real rate — v3's 'smoothness is not there' had no 30 fps surface to show on."

**Anti-waste rule 6** (consistency touch-up).

OLD: "**Precise numbers only at G5 or later.** The G3 storyboard is data plus a video, never an 800-line prose spec with px/s values."
NEW: "**Precise numbers only at G5 or later**, except the G3 motion numbers that are the contract (move durations,
the five values, the ~450 px/s budget — they live in the board JSON and the camera plan, enforced by lint, never as a
prose spec)."

**Toolkit table** — edit the G3 board-style row and add one row.

OLD row: "| G3 board style | `docs/look/STORYBOARD_STYLE.md`; SketchReel `style: \"board\"`; `scripts/v3/board_lint.py`;
`v3-g3-board-*.js` | monochrome studio boards (4 tones, line weight by role, icons, gesture figures, one idea per
panel); lint before render; sound-off cold read; one fix round |"
NEW row: "| G3 board style | `docs/G3_ANIMATIC.md` (stage) + `docs/look/STORYBOARD_STYLE.md` (drawing); SketchReel
`style: \"board\"`; `scripts/v3/board_lint.py`; `v3-g3-board-*.js` | the animated sketchbook: monochrome boards, every
final move/transition played, placeholder density, boil; lint (incl. motion + emptiness checks) before render;
sound-off + sound-on cold reads; one fix round |"
NEW additional row (after it): "| G3 motion + density | `G3_ANIMATIC.md` §3-4; SketchReel dress layer, placeholder
primitives, `loop`, `camera.keys`, boil | pose-test actions (2-4 stepped keys, smears), ambient loops, transition
grammar with per-device lint, density placeholders + `life:` lists, 60 fps reel |"

## 3. Root `CLAUDE.md` (the one G3 bullet)

OLD: "- The G3 animatic is a monochrome studio storyboard (`video/docs/look/STORYBOARD_STYLE.md`) built for SIGNAL per
drawing, not quality: literal and readable with the sound off, yet it carries the cinematography (framing, scale, cozy
home base)."

NEW: "- The G3 animatic is an ANIMATED SKETCHBOOK (stage spec `video/docs/G3_ANIMATIC.md`, drawing spec
`video/docs/look/STORYBOARD_STYLE.md`): the film's rough pass at 60 fps — story, cuts, framing, every camera move,
transition and key action PLAYED with real shape and timing, density and life as grey placeholders (loose never means
empty) — monochrome, readable with the sound off; G4+ only ADDS (colour, detail, polish), never changes what G3 locked."

## 4. Supersession notes (owner rules touched)

- "Animate only where timing is the question" (old STORYBOARD_STYLE §0) — already superseded by the owner's
  animated-sketchbook direction, recorded in `OWNER_PLAYBOOK.md` Storyboard section (2026-10-26). §4's "held drawing by
  default" / "<= 1 move per 3 panels" are the remnants; the edits above retire them.
- "Texture: none" and "40 % plain paper" — superseded in their old form; scribble placeholder tone is now the one legal
  texture, and bare paper must be declared. The owner's "very subtle texture" rule (playbook, Visual style) is about the
  FINAL film and is untouched.
- "G3 may stay at 30" (`OWNER_PLAYBOOK.md` Motion; also PIPELINE_V2 frame-rate section) — the new spec renders G3 at 60.
  This changes an allowance we gave ourselves, not an owner instruction (the owner asked for 60 "from G5 to the final"),
  but the playbook line should be updated to "...the G3 reel also renders at 60 (G3_ANIMATIC.md)" in the same commit.
- Everything else (one version to the owner, no MP4s before G3, sound-off read, 4-tone monochrome, notes strip, cozy/
  scale rules, no AI critics before G6) stands unchanged.
