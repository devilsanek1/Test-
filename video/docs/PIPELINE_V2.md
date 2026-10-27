# Production pipeline v2 (for video 2 onwards)

> **Proposal pending (v3 retro, 2026-10-27):** gate changes for G0.5-G6 (a through-line card, a world bible, a designed G3, a G4 look clip) in `docs/retro/2026-10-27_v3_retro.md` §5; this file runs as written until the owner approves them.

Why: on video 1 the owner first saw a playable film **18.7 h** in. Before that there were only stills, so they could not
steer. Story problems (S08's peak, S10's readability, the weak hook) surfaced during polish, where every change costs
a full scene round. Background research: `docs/PIPELINE_RESEARCH.md`.

## What video 1 actually cost (measured from the agent logs)

| | |
|---|---|
| Agents run | 442 |
| Agent input tokens | 12.5 B (98 % cache re-reads); output 66 M |
| Orchestrator input / output / turns | 0.83 B / 2.0 M / 1,922 |
| Fix agents: share of input | **40 %** (108 agents, avg 163 turns, 46 M input each) |
| Review agents: share of input | **28 %** (220 agents, 4,272 rendered images viewed, about 19 per review) |
| Scene builds | 18 % (31 agents, avg 210 turns) |
| Review/fix rounds per scene | 12-25 reviews, 5-11 fixes (S08: 25 / 9 / 985 M tokens, still shipped at 7/10) |
| Reviews that still found a blocker/major | 141 of 173: polish never converged |
| Agents lost to usage limits / kills | 66 (388 M tokens of work lost or redone) |
| Docs read into agent contexts | 5 MB (cheap; not the problem) |

**The cost driver is long, image-heavy agent sessions repeated on finished-looking scenes.** Every turn re-reads the
whole context, and every rendered frame an agent looks at stays in that context. Reading docs was a minor cost.

## The loop: gates G0-G8 (with G0.5, the core line)

Start every video by reading `docs/OWNER_PLAYBOOK.md` (the owner's rules), and add any new feedback to it at every gate.

Breadth-first: the whole film passes each gate together. At every gate from G3 on, the owner gets **one MP4 that plays
on the phone, with voice and captions**; G0-G2 are text and audio only, with no MP4s (owner, 2026-10-25), plus at most 5 lines of notes. Nothing is built for a later gate before this
one is approved.

| Gate | Owner plays / sees | Owner approves | Frozen after | Budget |
|---|---|---|---|---|
| G0 Angle | 1 screen of text | topic, audience, takeaway, length | topic, length band | 15 min, orchestrator only |
| **G0.5 Core line** (owner, 2026-10-25) | the top 3 candidate lines on one screen | **the one sentence** the whole video exists to land, the one that gets the biggest emotional reaction (v3 example: "AI is making your PC more expensive") | the core line: it becomes the frame-0 text, the hook's seed, the cover and title text and the payoff's callback, and every script line must serve it | 1 h, after the facts are locked |
| G1 Script | **the ElevenLabs-ready script** (a short emotional cue per line, v1 format), plus **3 hook-line variants**; no voice from us (owner rule, 2026-10-25) | every word, hook line | meaning and order of lines | 1 h, then 15 min per round |
| G2 Voice lock | the owner records the take in ElevenLabs; we clean it (cut anything misread) and take word timings; no video (owner, 2026-10-25) | voice, pace | the clock (word timings) | 30 min |
| **G3 Sketch animatic** | ONE video at 60 fps: the whole film as an ANIMATED SKETCHBOOK (spec: `docs/G3_ANIMATIC.md`) — every cut, camera move, transition and key action PLAYED at sketch fidelity, density and life as grey placeholders, timed to the locked voice (visual concepts judged internally; owner rule: one version) — tool: `SketchReel` board mode + `board_lint` | **the film's rough pass**: story in pictures, cuts, transitions, camera moves, key actions, the density/life plan (the hand-off states the fidelity ladder) | the signal contract (`G3_ANIMATIC.md` §2): scene list, cut points, shot content, framing, transition devices, camera moves, motion plan, density promises | first cut 2 h (assumes `G3_ANIMATIC.md` §7 tier-1 tooling, built once beforehand); rounds 30 min |
| G4 Look (parallel to G3) | 1-3 finished stills plus a 3-5 s motion test | palette, line, mascot, edges | visual language | house style: 15-min check |
| G5 Blocking cut | real sets and props at draft line quality that already **feel alive** (a dense, detailed world, people, a living character, ambient life always on; judged against the references, `OWNER_PLAYBOOK` Visual style; v3 G5 was "way too empty"), final camera, key poses, **no edges/paper/texture**; **entry check before lanes fan out** (`G5_BLOCKING.md`): scripted diff of scenes.json + built scenes against the locked board JSON (every camera move, element move, transition device, `life:`/promise item matches; no new motion), plus a sound-off cold read of the first fully dressed set (the density-key build) | staging, readability at phone size, transitions that play | compositions, camera, timing | 4 h |
| G6 Polish cut | life (>= 5 medium events/s, no gap > 1 s, measured), easing, secondary motion, edges, paper, full-res 60 fps; **AI critics start here**; last, an *optional* tactical texture pass on a few elements (playbook) | feel only (no restaging) | the picture | 6 h, 1 round + bug fixes |
| G7 Sound | SFX from the final beats, music, -14 LUFS mix | mix | audio | 1 h |
| G8 Final | full-res render, QA, cover, posting kit | blockers only | everything | 1.5 h |

Target: playable cuts at about hours 1, 3, 8 and 14 (video 1: hour 18.7).

## Creative exploration is not waste (owner rule)

**NO LIMIT ON TOKENS for creative output (owner, 2026-10-26).** Every creative stage (ideas, script, design, sets, density,
life, animation, polish) gets as many agents, rounds and tokens as the quality needs, including workflows larger than the
default size guideline. The anti-waste rules below only cut true waste (rework, lost work, reviews of things that will change).

Quality and output value come first. Spend generously where ideas are decided, because that is cheap compared to
building, and it decides the outcome:
- **G0 angle and hook:** 4-6 independent writers with different lenses (retention editor, storyteller, sceptical
  expert, comedian, viewer), each proposing angles and hook lines. A judge panel of 3 scores them, and one synthesis
  agent merges the winner with the best grafts. The owner picks from the top 3.
- **G0.5 core line (its own step, owner rule):** once the topic is picked and the facts are locked, distil the single key
  sentence. Brainstorm: 5-6 writers, each pulling a different emotional lever (loss, unfairness, reversal, personal,
  curiosity, headline punch), 6-8 lines each, plus the owner's own suggestion. Critique: judges score every line for gut
  reaction, truth, read-at-a-glance clarity and whether the video can pay it off; a viewer-persona panel gives gut
  rankings; sceptics try to refute the finalists as misleading. Pick: the owner picks from the top 3. Workflow:
  `context/workflows/v3-g05-core-line*.js`.
- **G1 script = story first (owner, 2026-10-26):** (1) 3-4 competing **story spines** (the throughline question, the
  viewer's situation, beats joined by but/so, the turn, the payoff that lands the core line), judged; (2) 2-3 writers
  draft the winning spine; (3) a cold-read panel retells each draft (a list-like retelling fails) plus a flow critic
  (every line follows from the previous) and a fact check; (4) one merged script. Never structure a script as a list of
  facts to prove.
- **G3 animatic:** 2-3 visual concepts for the whole film, judged internally; the owner sees one animatic (one-version rule).
- **G4 look:** 2-4 style-frame directions when the topic needs a new look.

These are divergent stages: many agents, short outputs, judged together. The rules below target the convergent
stages (building, fixing, polishing), where the measured waste happened.

## Anti-waste rules (each one fixes a measured waste)

1. **No AI critics before G6** (reviews were 28 % of spend, mostly on scenes that changed afterwards). Before G6 the
   owner is the reviewer, plus one scripted check (duration, A/V sync, captions inside the safe area).
2. **One combined reviewer per scene, one round at G6, max 6 findings**, then fix and stop. No re-review loops: a
   scene that is still under the bar after one fix goes to the owner (S08 took 25 reviews and still shipped at 7).
3. **Fix agents get a turn cap and an image budget** (avg 163 turns): render contact sheets at 0.33-0.5 scale, view at
   most ~8 images per session, and end the session after the fix. A new session is cheaper than a long one.
4. **No downstream build before its gate.** On video 1, engine, kit, mascot, edge lab and QA tooling were built before
   the script was locked, and a 78 s to 55 s script change threw away voice v1/v2, timing, storyboard v1/v2 and music.
5. **Lower concurrency, checkpoint every agent.** 66 agents died at usage limits. Run at most about 4 agents at once, commit
   after every agent, and keep each agent's task small enough to restart.
6. **Precise numbers only at G5 or later**, except the G3 motion numbers that are the contract (move durations, the
   five values, the ~15 px/frame speed budget): they live in the board JSON and the camera plan, enforced by lint,
   never as a prose spec.
7. **The hook goes first at every gate**, as a swappable segment (the first 3-5 s), with its sound cue from G1 on (a
   positive phone sound in the first second, per the playbook), and with variants at G1 (line) and G3 (visual). It is never polished last.
8. **One deliverable per gate, no status reels.** Drop the 30-minute strips of every composition. The owner gets the gate video;
   between gates, one line, and only when something is blocked.
9. **Lean orchestrator.** Keep the task list short, use short check-in prompts, read agents' final summaries rather than full
   journals, and write handoff notes as a short WRAPUP-style doc instead of a growing log.

10. **Locked means dropped (owner, 2026-10-25).** When a gate locks, move the rejected options to `docs/vN/archive/`
    (no prompt reads it), trim the gate doc to the locked choice, and point later prompts only at locked docs and
    the fact files. Unused topics go to `docs/IDEAS_BANK.md`. Superseded drafts are archived at the next gate.

## Frame rate (owner, 2026-10-26)

All production renders (G5 blocking, G6 polish, G8 final) are **60 fps** (composition `fps: 60`; the final encode keeps
`-r 60`). Everything animates in seconds (`useTime`, `frame / fps`), so a scene renders at any rate. Camera speed limits
are strobe limits and scale with the rate: ~15 px/frame at the render rate (= ~450 px/s at 30, ~900 px/s at 60; playbook
Motion: 60 fps allows faster moves); readability at 1x is the test, not the number. Drawn character motion can stay stepped (hold each drawing for
`round(60 / drawingsPerSecond)` frames). The G3 animatic renders at **60 fps** too (SketchReel is time-based; 540p60 is cheap), so motion smoothness is judged at
the film's real rate — v3's "smoothness is not there" had no 30 fps surface to show on. Test file: `video/deliverables/tests/`.

## Studio toolkit (reuse per video; copy a workflow template and swap the topic, paths and locked lines)

Every lesson lands here, in the playbook or in a gate, in the same turn (owner, 2026-10-26). Workflow templates live
in `context/workflows/` (the v3 ones are the current best versions):

| Gate | Tool / template | What it does |
|---|---|---|
| G0 topic | `v3-g0-topics-*.js`; `docs/IDEAS_BANK.md` | 5 beat scouts (last 72 h), 3 judges, synthesis, fact-check: top 3 topics |
| G0.5 core line | `v3-g05-core-line-*.js` | 6 emotional-lever writers, 4 judges, viewer personas + sceptics on finalists, top 3 |
| G1 script | `v3-g1-story-*.js` | story spines first, judges, 3 writers, cold-read retell panel, flow critic, merge, fact-check |
| any line | `v3-line2-fix-*.js` | replacement lines tested in context by viewer personas + a standards/flow judge |
| G1/G2 voice | `docs/ELEVENLABS.md`; `video/scripts/voice/` | paste-file rules + `check_paste.py`; `check_take.py` (transcribe + diff), `clean_take.py`, `transcribe.py` |
| G2 voice (API) | `video/scripts/voice/generate_take.py` | per-line generation with the owner's voice, ASR check (Parakeet + Whisper), auto-regenerate, stitch; needs `ELEVENLABS_API_KEY` |
| G2 sound | `video/audio/tools/make_phone_sfx.py` | our own positive phone sounds (like pop, ding, swoosh, cart add) |
| G3 animatic | `video/src/v3/SketchReel.tsx` + `v3-g3-animatic-*.js` | 3 visual concepts, judges, storyboard artist writes the animatic JSON; SketchReel draws it with voice and pop captions |
| G3 board style | `docs/G3_ANIMATIC.md` (stage) + `docs/look/STORYBOARD_STYLE.md` (drawing); SketchReel `style: "board"`; `scripts/v3/board_lint.py`; `v3-g3-board-*.js` | the animated sketchbook: monochrome boards, every final move/transition played, placeholder density; tier-1 lint (motion + emptiness checks) before render; sound-off + sound-on cold reads, ONE batched fix round |
| G3 motion + density | `G3_ANIMATIC.md` §3-4 + §7 tier 1 — **to build**, one checkpointed lane before the next video's G3 (not yet kit) | pose-test actions (2-4 stepped keys, smears), kit ambient loops, transition `device` field + default-cut check, density placeholders + `life:` lists, 60 fps reel |
| G3 clarity | SketchReel `icon` elements; sound-off cold read (`v3-g3-clarity-*.js`) | recognisable objects instead of boxes; viewer personas say what each shot shows with the sound off; confusing shots get redrawn literally before the owner sees the animatic |
| G3-G5 camera | `docs/look/CINEMATIC_GUIDE.md` (+ `research/arcane_shots.json`, sketches in `docs/look/cine_sketches/`) | Arcane-measured shot vocabulary V1-V12, camera presets, 9:16 composition, light, transitions, sequence templates; storyboard and blocking pick from it. At G3, a per-film camera plan (`docs/vN/camera_plan_g3.md`, one row per panel; checks in `STORYBOARD_STYLE.md` §7) comes before the re-board |
| references | `arcane-cinematic-guide-*.js`, `scripts/look/shot_sheets.py` | dissect any reference video: measure, contact sheets, per-shot analysis agents, guidebook |
| opening (every video) | `v3-opening-banger-*.js`; SketchReel `draw` / `fillIn` | 3 concepts for the one continuous opening shot (drawn live, expectation then reality, never still), judge, build; loop to the bare-line frame 0 |
| G4 look | `docs/look/COZY_AND_SCALE.md`, `docs/look/PALETTE.md`, `look-cozy-scale-arcane-*.js` | look rules; research template |
| G5 blocking | `docs/G5_BLOCKING.md`; `src/entry-v3-film.tsx` (template); `scripts/qa/gate_check.py` | the film shell plays end to end from minute one: `scripts/g5_scaffold.py` turns the locked board into scenes.json + one placeholder file per panel (the board panel inside `<Film>`), lanes replace panel files; pop captions from `scripts/film_captions.py`; frame-0 words, voice, sound cues, draft label; the scripted gate check (fps 60, duration, audio, cuts vs scene starts, captions in the band) |
| G5-G6 density and life | `docs/look/LIFE_AND_DENSITY.md`; `scripts/qa/density.py` (+ `gate_check.py --density`); v3 example `docs/v3/density_plan_g5b.md` | every frame full and alive at the level of reference 1 and v1: targets, dressing by setting, people by depth, the recurring living character (Pip), the idle layer, information in the world, what stays calm; the meter flags flat, empty or static shots (a warning signal, never a quota) |
| references | `video/scripts/look/measure_camera.py` | cuts + per-shot camera curves, easing, parallax from a reference video (keep copyrighted clips out of git) |

## Agent prompt rules

- Context: the gate's brief plus the scene's own data. **Point to sections, never "read all docs fully".**
- A report is at most 12 lines. Cross-lane requests go in one block, in an exact format.
- Lanes: one scene per agent; shared kit / engine changes go only through the orchestrator.
- Renders: 0.33-0.5 scale strips; full res only for a 1-2 frame measurement.

## Tooling to build before video 2 (in this order)

1. **`npm run preview`**: the whole film at 0.33 scale with audio, CRF 28, x264 veryfast, about 3-5 min. Also
   `preview:hook` (first 10 s) and `--frames` to re-render one scene. Every gate video comes from this. *(~1 h)*
2. **Draft flag in Film**: turns off edges, paper, noise and ink boil, and burns in a gate/version/scene/timecode label
   for all pre-final cuts. *(~1 h)*
3. **SketchReel composition (G3)**: draws the animatic from one JSON file (per line: shot sketch made of boxes,
   silhouettes from the mascot poses and labels; camera start/end; transition type and label). A G3 revision is then a data
   edit, not code. *(~half a day)*
4. **Hook segment**: the first 3-5 s as its own component with variants that all end on the body's first frame (and on
   S12's loop frame). *(~2 h)*
5. **Scripted gate check**: duration, A/V sync, caption safe area, cut list vs word anchors. It replaces review agents for
   mechanical checks. *(~1 h)*
6. **G3 animatic tier-1 tooling** (`G3_ANIMATIC.md` §7 tier 1): dress layer, `loop` + the shared ambient kit, the tier-1
   lints, the transition `device` field, the 60 fps reel render, g5_scaffold `transition.type` carry-through. One
   checkpointed lane before the next video's G3, outside the gate budget; the G3 row's 2 h first cut assumes it exists. *(~1-2 days)*

Defaults learned from video 1's posted reel: captions use `skyCaption.motion = 'pop'`, or a line rise that stays
inside the caption window. The 'scroll' slot reveal clipped letters mid-rise on a plain sky and looked like a glitch on
the phone. Paper edges never at the top or beside the caption band, because that looks like a screen recording under
the status bar. The G4 look check includes a phone screen recording of a 5 s clip.

Drop or slim: per-scene QA charts in every check-in, beat-sync against the old storyboard, critic panels before G6, edge
labs before G4.
