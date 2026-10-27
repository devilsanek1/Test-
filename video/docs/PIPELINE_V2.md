# Production pipeline v2 (for video 2 onwards)

> **The pipeline after v3 (owner APPROVED, 2026-10-27: "Yes"; why and evidence: `docs/retro/2026-10-27_v3_retro.md`):** a DESIGNED sketch. A through-line card with the core line and the script (G0.5/G1), a text world bible beside the script (W1), a G3 that decides the flow, the focus and the light (not just the story), a playable G4 look clip approved before the G5 lanes, G5 lanes per sequence that fill what G3 decided (no new places, movers or tier promotions), life checked by tiers at G6, `docs/look/CRAFT.md`'s thresholds as lint numbers (anti-waste rule 6) and a craft tooling lane that lands before the next video's G3 (below). The craft target, in force, is `CRAFT.md`; the look and storytelling direction is `docs/look/DIRECTION.md` (read it before any visual work).
>
> **Which doc wins:** owner's words (playbook; vN/OWNER_NOTES) > DIRECTION > CRAFT > PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > look/*.md > the film's STYLE.md (values only) > v1-era docs (API and measurements, never style); the owner's words are what the owner said, never our "-> what we did" log; in full, with the topic docs and the tie-breaks: DIRECTION's intro. A clash is a bug: fix the lower doc in the same turn.

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

## The loop: gates G0-G8 (with G0.5, the core line, and W1, the world bible)

Start every video by reading `docs/OWNER_PLAYBOOK.md` (the owner's rules), and add any new feedback to it at every gate.
A new video starts when the owner asks for it (`HANDOFF.md` §1, "Starting the next video"); films in flight share the
weekly limit and finish first.

Breadth-first: the whole film passes each gate together. At every gate from G3 on, the owner gets **one MP4 that plays
on the phone, with voice and captions**; G0-G2 are text and audio only, with no MP4s (owner, 2026-10-25), plus at most 5
lines of notes. One version: one deliverable per gate; a choice the owner makes (the topic, the core line, the hook
line) comes as up to 3 options on one screen of text (playbook Process). Nothing is built for a later gate before this
one is approved; the one exception is W1, internal text written beside G1-G2.

| Gate | Owner plays / sees | Owner approves | Frozen after | Budget |
|---|---|---|---|---|
| G0 Topic | the top 3 topics on one screen of text (from the scouting workflow: Creative exploration below), or the owner's own topic | topic, audience, takeaway, length band | topic, length band; then the **fact lock** (`docs/vN/research/factlock.md`: every fact, number and quote the film may use, each checked against its primary source; v2 and v3 have one) before G0.5 | one scouting run, skipped when the owner names the topic (a divergent stage: Creative exploration); then the fact lock |
| **G0.5 Core line** (owner, 2026-10-25) | the top 3 candidate lines on one screen of text | **the one sentence** the whole video exists to land, the one that gets the biggest emotional reaction (v3 example: "AI is making your PC more expensive") | the core line: it becomes the frame-0 text, the hook's seed, the cover and title text and the payoff's callback, and every script line must serve it; from the pick we draft its **THROUGH-LINE CARD** (thread object and home spot, home place, one "you": internal; G1 completes it and the owner approves it there) | 1 h, after the fact lock |
| G1 Script | **the ElevenLabs-ready script** (a short emotional cue per line, v1 format), with up to **3 hook-line alternatives** as text inside it (the owner picks one; G2 voices only the pick), plus the completed **THROUGH-LINE CARD** (one screen of text, `docs/look/CRAFT.md` §a; owner-approved 2026-10-27): the thread object and its home spot, the one home place (at most 3 places and 1 scale reveal), the one "you", the mascot rule, and a carrier (A-F) for every join between the script's lines, taken from the script's own joins (the carriers follow the script, never the other way round); the voice comes at G2 | every word, the hook line, the card | meaning and order of lines; the hook line; the card | 1 h, then 15 min per round |
| G2 Voice lock | **the take, generated with the owner's voice through the API** (owner, 2026-10-26; `docs/voice/API_QUICKSTART.md`: paste format v2, `check_paste.py` OK, `generate_take.py` `all_clean`, `check_take.py` MATCH), sent as take.wav with the full script text, locked into `public/vN/`, logged in `ELEVENLABS.md` section 5; word timings taken from it. Only without the key does the owner paste it (always the full `--handoff` text); we check that take the same way. No video (owner, 2026-10-25) | voice, pace | the clock (word timings) | 30 min |
| **W1 World bible** (text, beside G1-G2; owner-approved 2026-10-27) | no owner step (internal text): the set list (the home place first); the PROPOSED palette (one sister palette from `look/PALETTE.md` by the story's use case; 2-3 candidates judged internally when the topic needs a new look) and, in its terms, one light rig per set (the key and its side, the shadow tint family, the pool colours: `CRAFT.md` §d.1) and one colour-script line per beat; tiers A/B/C per shot (`CRAFT.md` §b); the recurring living character (Pip by default, `LIFE_AND_DENSITY.md` §5); its choices reach the owner as G3's grey and the G4 look clip | — (judged at G3 and G4) | — (G3 freezes the tiers and the rig's shapes; G4 approves the palette and freezes the pen, the rigs and the tier palettes; a change at G4 is written back into W1) | in parallel with G1-G2 |
| **G3 Sketch animatic** | ONE video at 60 fps: the whole film as an ANIMATED SKETCHBOOK (spec: `docs/G3_ANIMATIC.md`) — every cut, camera move, transition and key action PLAYED at sketch fidelity, every join with its carrier, the tiers at their final weights in grey and each set's light rig as shapes, density and life as grey placeholders, timed to the locked voice (visual concepts judged internally; owner rule: one version) — tool: `SketchReel` board mode + `board_lint` | **the film's rough pass**: story in pictures, cuts, transitions, camera moves, key actions, the density/life plan, and **where the eye goes and what carries each join** (2026-10-27; the hand-off states the fidelity ladder) | the signal contract (`G3_ANIMATIC.md` §2): scene list, cut points, shot content, framing, transition devices and carriers, camera moves, motion plan, density promises, thread coverage, tiers, the light rig, the mover budget | first cut ~3 h (was 2; the hour goes to tiers, carriers and the light marks; assumes `G3_ANIMATIC.md` §7 tier-1 tooling, built once beforehand: not built yet on 2026-10-27, tooling item 6); rounds 30 min |
| **G4 Look clip** (after the G3 lock: it builds G3's home set, one of its joins and its frame 0 in the final style; approved before the G5 lanes start) | a **6-8 s playable LOOK CLIP of the home set** in the final style (replaces "1-3 stills + a 3-5 s test", 2026-10-27): the clean pen, the set's light rig with contact, form and cast shadows, tiers at final weight, one real transition, tier-B life, and frame 0 being drawn in the clean pen (how the opening draws on: `docs/look/DIRECTION.md` rule 9); checked before the owner sees it (`CRAFT.md` §b-d: salience peak/median >= 2.4, environment local contrast <= 7, strokes <= 80/Mpx, near-miss ends <= 40/Mpx, dark-line pixels <= 3 %, `scripts/qa/check_light.py`; carry and movers on its transition, rule 6) | palette and tier colours, line, light and shadow, mascot, frame 0's build, edges (opt-in per film; 'paint-subtle' at most) | visual language: the pen, the light rigs and the tier palettes freeze | ~1 day before the G5 lanes (the retro's estimate) |
| G5 Blocking cut | **the G3 tier masks filled in colour from the G4 kit** (2026-10-27; the owner's cut renders at full size, 1080 x 1920: `G5_BLOCKING.md` §4): real sets and props in the film's clean pen, light rigs and tiers (`docs/look/CRAFT.md` §b-d; draft finish, never the sketch pen), every G3 placeholder made real, so the world is full and alive, calm and tiered (`LIFE_AND_DENSITY.md`; v3 G5 was "way too empty"), with **no new places, movers or tier promotions**; final camera, key poses, **no edges/paper/texture**; **one lane per SEQUENCE, and one agent owns every transition**; **entry and exit checks** (`G5_BLOCKING.md` §1): the scripted diff of scenes.json + built scenes against the locked board JSON (every camera move, element move, transition device and carrier, `life:`/promise item matches; no new motion), a sound-off cold read of the first fully dressed set (the home set, the density key), and CRAFT's measures rerun on the render and compared with the G3 render | staging, readability at phone size, transitions that play | compositions, camera, timing | 4 h of work; longer on the clock (one lane per sequence, one transition owner) |
| G6 Polish cut | life checked by tiers (`CRAFT.md` §b: at most 3-4 noticeable supporting movers at once, B <= 30 % of the motion, the subject >= 60 % in its beat; supporting life small and steady, never a still frame; events/s is information, never a target), easing and secondary motion only on movers that already exist, edges only if the G4 look clip approved them ('paint-subtle' at most; never at the top or beside the caption band), full-res 60 fps; **AI critics start here**; last, an *optional* tactical texture pass on a few elements (playbook) | feel only (no restaging) | the picture | ~6 h (an estimate): review rounds as the quality needs while each one improves the scene (anti-waste rule 2), + bug fixes |
| G7 Sound | SFX from the final beats, music, -14 LUFS mix | mix | audio | 1 h |
| G8 Final | full-res render, QA, cover, posting kit | blockers only | everything | 1.5 h |

Target: the first playable cut (the G3 reel) about 3 h after the voice lock, then the G4 look clip (~1 day after the G3
lock), then the G5 lanes and G6 (video 1: the first playable film at hour 18.7).

## Creative exploration is not waste (owner rule)

**NO LIMIT ON TOKENS for creative output (owner, 2026-10-26).** Every creative stage (ideas, script, design, sets, density,
life, animation, polish) gets as many agents, rounds and tokens as the quality needs, including workflows larger than the
default size guideline. The anti-waste rules below only cut true waste (rework, lost work, reviews of things that will change).

Quality and output value come first. Spend generously where ideas are decided, because that is cheap compared to
building, and it decides the outcome:
- **G0 topic:** when the owner names no topic, 5 beat scouts search the last 72 h, 3 judges (growth, standards,
  creative) score the candidates, one synthesis writes the top 3 and an adversarial fact-check tests them (toolkit row
  "G0 topic"); the owner picks. When the owner names the topic, research it instead and look for its biggest true
  framing (playbook: the hook). Either way the fact lock follows (G0 row). The angle and the hook are no longer G0's:
  they are folded into G0.5 (the core line) and G1 (the hook line).
- **G0.5 core line (its own step, owner rule):** once the topic is picked and the fact lock is written, distil the single key
  sentence. Brainstorm: 5-6 writers, each pulling a different emotional lever (loss, unfairness, reversal, personal,
  curiosity, headline punch), 6-8 lines each, plus the owner's own suggestion. Critique: judges score every line for gut
  reaction, truth, read-at-a-glance clarity and whether the video can pay it off; a viewer-persona panel gives gut
  rankings; sceptics try to refute the finalists as misleading. Pick: the owner picks from the top 3, and the
  through-line card is drafted from the pick (G1 completes it). Workflow: `context/workflows/v3-g05-core-line*.js`.
- **G1 script = story first (owner, 2026-10-26):** (1) 3-4 competing **story spines** (the throughline question, the
  viewer's situation, beats joined by but/so, the turn, the payoff that lands the core line), judged; (2) 2-3 writers
  draft the winning spine; (3) a cold-read panel retells each draft (a list-like retelling fails) plus a flow critic
  (every line follows from the previous) and a fact check; (4) one merged script, then the through-line card's carriers
  from its joins (G1 row). Never structure a script as a list of facts to prove. **Rhythm (owner, 2026-10-27):** short
  sentences (<= 5 words) break up the long ones, at least one after every 1-2 long sentences; the merged script must pass
  `scripts/voice/check_rhythm.py` before it goes to the owner.
- **G3 animatic:** 2-3 visual concepts for the whole film, judged internally; the owner sees one animatic (one-version rule).
- **G4 look:** 2-4 style-frame directions when the topic needs a new look, judged internally; the pick becomes the one
  look clip the owner plays.

These are divergent stages: many agents, short outputs, judged together. The rules below target the convergent
stages (building, fixing, polishing), where the measured waste happened.

## Anti-waste rules (each one fixes a measured waste)

1. **No AI critics on built scenes before G6** (reviews were 28 % of spend, mostly on scenes that changed afterwards).
   Before G6 the owner is the reviewer, plus what judges no taste: scripted checks (the gate check: duration, A/V sync,
   captions inside the safe area; from G3 on, CRAFT's lints, rule 6), cold reads that only retell what they see (G1's
   retell panel, G3's sound-off and sound-on reads, G5's first-set read) and each lane's style quiz before it builds
   (playbook Process: one STYLE.md per film). The divergent stages above keep their judges. `G5_BLOCKING.md` §9's
   art-director reviews were v2r's (an owner-ordered restart with full creative freedom), not the default.
2. **One combined reviewer per scene per round from G6 on, max 6 findings, then one fix.** Rounds go on as long as the
   quality needs (owner, 2026-10-26: polish gets as many rounds as the quality needs) while each round improves the
   scene; the loop ends when a round finds nothing under the bar, or when it stops converging (a finding comes back
   after its fix, or a round finds nothing the last one didn't): then the scene goes to the owner. That loop that no
   longer converged was v1's waste (S08 took 25 reviews and still shipped at 7).
3. **Fix agents get a turn cap and an image budget** (avg 163 turns): render contact sheets at 0.33-0.5 scale, view at
   most ~8 images per session, and end the session after the fix. A new session is cheaper than a long one.
4. **No downstream build before its gate.** On video 1, engine, kit, mascot, edge lab and QA tooling were built before
   the script was locked, and a 78 s to 55 s script change threw away voice v1/v2, timing, storyboard v1/v2 and music.
5. **Checkpoint every agent; at most about 4 at once per machine.** 66 agents died at usage limits on v1. Keep each
   agent's task small enough to restart and commit after every agent; each agent writes its output file early and keeps
   it updated, and `video/scripts/autocheckpoint.sh <branch> <the film's paths>` runs in the background (a commit and
   push every 10 minutes whenever those paths changed; owner, 2026-10-27). One machine runs at most about 4 agents at once
   (this 4-CPU container runs about 2 render-heavy ones well); more parallel work goes to helper cloud sessions, each
   its own machine (playbook Process: parallelize as much as possible), inside the weekly and 5-hour limits.
6. **Precise numbers are lint numbers, checked only where the picture shows them truly** (owner-approved 2026-10-27).
   The G3 motion numbers are the contract (move durations, the five values, the ~15 px/frame speed budget): they live
   in the board JSON and the camera plan, enforced by lint, never as a prose spec. `CRAFT.md`'s thresholds are lint
   numbers too: warnings with a declared exception (they come from two films only), never quotas. At G3 a board is
   linted only for what it shows truly: the declared ones (a carrier per join, the plain cuts, thread coverage, the
   mover budget) plus eye jump and colour shift (v3's board: 0.21 and 35, both over); carry, movers, contrast, line and
   light count from the G4 look clip on (blank paper flatters them: v3's board carried 0.41 with 0 movers). Two of
   CRAFT's checks FAIL outright (`CRAFT.md` §a): a carrier for every join with at most 2 plain cuts, and the thread on
   screen >= 80 % with no gap over 3 s (the declared scale reveal aside). The board lint's completeness checks
   (`G3_ANIMATIC.md` §7) are separate and keep their FAIL.
7. **The hook goes first at every gate:** its first 3-5 s are built and checked before the rest (a swappable hook
   segment, tooling item 4, was never built), with its sound cue from G1 on (a positive phone sound in the first second,
   per the playbook). Where it is decided: G0.5 picks the core line (the frame-0 words, the hook's seed); G1 picks the
   spoken hook line (up to 3 alternatives as text); G2 voices only the pick; G3 decides its picture (the one opening
   shot: concepts judged internally, the owner sees one). v3 picked its hook at G2 from three MP4s, one per hook ("why
   are there multiple versions"): retired with the one-version rule. It is never polished last.
8. **One deliverable per gate, no status reels.** Drop the 30-minute strips of every composition. The owner gets the gate video;
   between gates, a short text status on all active threads (playbook Process, "Progress"), never a rendered reel.
9. **Lean orchestrator.** Keep the task list short, use short check-in prompts, read agents' final summaries rather than full
   journals, and write handoff notes as a short WRAPUP-style doc instead of a growing log.

10. **Locked means dropped (owner, 2026-10-25).** When a gate locks, move the rejected options to `docs/vN/archive/`
    (no prompt reads it), trim the gate doc to the locked choice, and point later prompts only at locked docs and
    the fact files. Unused topics go to `docs/IDEAS_BANK.md`. Superseded drafts are archived at the next gate.

## Frame rate (owner, 2026-10-26)

All production renders (G5 blocking, G6 polish, G8 final) are **60 fps** (composition `fps: 60`; the final encode keeps
`-r 60`). Everything animates in seconds (`useTime`, `frame / fps`), so a scene renders at any rate. Camera speed limits
are strobe limits and scale with the rate: ~15 px/frame at the render rate (= ~450 px/s at 30, ~900 px/s at 60; playbook
Motion: 60 fps allows faster moves); readability at 1x is the test, not the number. **This is the one speed budget**
(a lint WARN): `G3_ANIMATIC.md` §4, `G5_BLOCKING.md` §2 and §6, `STORYBOARD_STYLE.md` §7 and `COZY_AND_SCALE.md` §4
point here, and G5 keeps the timing G3 played. Drawn character motion can stay stepped (hold each drawing for
`round(60 / drawingsPerSecond)` frames). The G3 animatic renders at **60 fps** too (SketchReel is time-based; 540p60 is cheap), so motion smoothness is judged at
the film's real rate — v3's "smoothness is not there" had no 30 fps surface to show on. Test file: `video/deliverables/tests/`.

## Studio toolkit (reuse per video; copy a workflow template and swap the topic, paths and locked lines)

Every lesson lands here, in the playbook or in a gate, in the same turn (owner, 2026-10-26). Workflow templates live
in `context/workflows/`. **Copy their structure, never their briefs:** v3's G3 board brief (`v3-g3-board-cine-*.js`)
still asks for scale cuts and "size and angle at every cut", and `v3-g5b-rollout-*.js` builds per-panel lanes to the
retired G5b bar (retired as a template). Rebuild the G3 and G5 templates on `docs/look/DIRECTION.md` and `CRAFT.md`
before the next video's G3. The G0-G1 templates' STRUCTURE stands, but every copied brief needs four updates: today's
date and search window (`v3-g0-topics-*.js` hard-codes 2026-10-25), the current look words from DIRECTION (its judges
still say "hand-drawn ink"), `effort: 'max'` on every `agent()` call (every script in `context/workflows/` sets it since 2026-10-27; a copied or new
one must pass `python3 .claude/hooks/max_effort.py --lint`, and the repo's hook denies a run that doesn't), and
the through-line card (G0.5 drafts it from the pick, G1 completes it from the script's joins):

| Gate | Tool / template | What it does |
|---|---|---|
| G0 topic | `v3-g0-topics-*.js`; `docs/IDEAS_BANK.md` | 5 beat scouts (last 72 h), 3 judges, synthesis, fact-check: top 3 topics |
| G0.5 core line | `v3-g05-core-line-*.js` | 6 emotional-lever writers, 4 judges, viewer personas + sceptics on finalists, top 3 |
| G1 script | `v3-g1-story-*.js` | story spines first, judges, 3 writers, cold-read retell panel, flow critic, merge, fact-check |
| any line | `v3-line2-fix-*.js` | replacement lines tested in context by viewer personas + a standards/flow judge |
| G1/G2 voice | `docs/ELEVENLABS.md`; `video/scripts/voice/` | paste-file rules + `check_paste.py`; `check_rhythm.py` (long sentences broken by short ones); `check_take.py` (transcribe + diff), `clean_take.py`, `transcribe.py` |
| G2 voice (API) | `video/scripts/voice/generate_take.py` | per-line generation with the owner's voice, ASR check (Parakeet + Whisper), auto-regenerate, stitch; needs `ELEVENLABS_API_KEY` |
| G2 sound | `video/audio/tools/make_phone_sfx.py` | our own positive phone sounds (like pop, ding, swoosh, cart add) |
| G3 animatic | `video/src/v3/SketchReel.tsx` + `v3-g3-animatic-*.js` | 3 visual concepts, judges, storyboard artist writes the animatic JSON; SketchReel draws it with voice and pop captions |
| G3 board style | `docs/G3_ANIMATIC.md` (stage) + `docs/look/STORYBOARD_STYLE.md` (drawing); SketchReel `style: "board"`; `scripts/v3/board_lint.py`; `v3-g3-board-*.js` | the animated sketchbook: monochrome boards at their tier weights, every final move/transition played with its carrier, the light rig as shapes, placeholder density; tier-1 lint (motion, emptiness, carrier, thread, tier and rig checks; eye jump and colour shift on the reel: anti-waste rule 6) before render (to build: today `board_lint.py` checks only the panel rules, `STORYBOARD_STYLE.md` §6); sound-off + sound-on cold reads, ONE batched fix round |
| G3 motion + density | `G3_ANIMATIC.md` §3-4 + §7 tier 1 — **to build**, one checkpointed lane before the next video's G3 (not yet kit) | pose-test actions (2-4 stepped keys, smears), kit ambient loops, transition `device` + `carrier` fields and the carrier check (`CRAFT.md` §a), the `tier` and `rig` fields and the thread's coverage, density placeholders + `life:` lists, 60 fps reel |
| G3 clarity | SketchReel `icon` elements; sound-off cold read (`v3-g3-clarity-*.js`) | recognisable objects instead of boxes; viewer personas say what each shot shows with the sound off; confusing shots get redrawn literally before the owner sees the animatic |
| G3-G5 camera | `docs/look/CINEMATIC_GUIDE.md` (+ `research/arcane_shots.json`, sketches in `docs/look/cine_sketches/`) | Arcane-measured shot vocabulary V1-V12, camera presets, 9:16 composition, light, transitions, sequence templates; storyboard and blocking pick from it. At G3, a per-film camera plan (`docs/vN/camera_plan_g3.md`, one row per panel, with its carrier, tier map and rig; checks in `STORYBOARD_STYLE.md` §7) comes before the re-board |
| references | `arcane-cinematic-guide-*.js`, `scripts/look/shot_sheets.py` | dissect any reference video: measure, contact sheets, per-shot analysis agents, guidebook |
| opening (every video) | `v3-opening-banger-*.js`; SketchReel `draw` / `fillIn` | 3 concepts for the one continuous opening shot (drawn live in the clean pen, expectation then reality, never still: `docs/look/DIRECTION.md` rule 9), judge, build; loop back to frame 0's drawing state |
| G4 look clip | `docs/look/CRAFT.md` (§b-d and their checks), `docs/look/COZY_AND_SCALE.md`, `docs/look/PALETTE.md`; `scripts/qa/check_light.py`; the clean pen (`lib/pen.ts`, `lib/tier.tsx`) and the light primitives (`lib/light.tsx`, ported from v3's `src/v3/film/kit/Light.tsx`: a film never imports another film's folder); `look-cozy-scale-arcane-*.js` | look rules and checks; the pen, light and tiers the clip is built with; research template |
| G5 blocking | `docs/G5_BLOCKING.md`; `src/entry-v3-film.tsx` (template); `scripts/qa/gate_check.py` | the film shell plays end to end from minute one: `scripts/g5_scaffold.py` turns the locked board into scenes.json + one placeholder file per panel (the board panel inside `<Film>`), sequence lanes replace panel files and one agent builds every join; pop captions from `scripts/film_captions.py`; frame-0 words, voice, sound cues, draft label; the scripted gate check (fps 60, duration, audio, cuts vs scene starts, captions in the band) plus the entry and exit checks (CRAFT's measures against the G3 render) |
| G5-G6 density and life | `docs/look/LIFE_AND_DENSITY.md`; `scripts/qa/density.py` (+ `gate_check.py --density`); v3's `docs/v3/density_plan_g5b.md` is history (its cut was "too busy") | every frame full and alive at the level of reference 1 and v1, calm and tiered: dressing by setting, people and life by tier (`CRAFT.md` §b), the recurring living character (Pip), information as paper in the home place, what stays calm; the meter flags flat, empty or static shots (a warning signal, never a quota; the craft tooling lane makes it count tier-C dressing only, its events/s and gap information) |
| references | `video/scripts/look/measure_camera.py` | cuts + per-shot camera curves, easing, parallax from a reference video (keep copyrighted clips out of git) |

## Agent prompt rules

- **All delegated work runs at MAX effort** (owner, 2026-10-27; playbook Process): `effort: 'max'` in every `agent()`
  call, `effort: "max"` on every Agent tool call, `/effort max` as a helper session's first prompt, and every brief says
  that anything its agent starts runs at max too. The hook in `.claude/settings.json` enforces it;
  `python3 .claude/hooks/max_effort.py --lint|--fix <workflow.js>` checks or repairs a script.
- Context: the gate's brief plus the scene's own data. **Point to sections, never "read all docs fully".**
- A report is at most 12 lines. Cross-lane requests go in one block, in an exact format.
- Lanes: one scene per agent session (G5: a lane owns a SEQUENCE and builds it panel by panel; one agent owns every
  transition); shared kit / engine changes go only through the orchestrator.
- Renders: 0.33-0.5 scale strips; full res only for a 1-2 frame measurement (an agent's working renders; the owner's
  G4 clip and G5+ cuts render at full size: `G5_BLOCKING.md` §4).

## Tooling planned before video 2 (history, except item 6)

Where each one stands (2026-10-27): 2, 3 and 5 exist (Film's `draftLabel` and `edges={false}`, `src/v3/SketchReel.tsx`,
`scripts/qa/gate_check.py`); 1 and 4 were never built (gate videos are plain `npx remotion render`: the G3 reel at
540p60, the G4 clip and the G5+ cuts at full size); 6 is part of the approved pipeline and still to build, before the
next video's G3.

1. **`npm run preview`**: the whole film at 0.33 scale with audio, CRF 28, x264 veryfast, about 3-5 min. Also
   `preview:hook` (first 10 s) and `--frames` to re-render one scene. Every gate video comes from this. *(~1 h)*
2. **Draft flag in Film**: turns off edges, paper and texture, and burns in a gate/version/scene/timecode label
   for all pre-final cuts. *(~1 h)*
3. **SketchReel composition (G3)**: draws the animatic from one JSON file (per line: the board drawing,
   `STORYBOARD_STYLE.md`; camera start/end; transition type, carrier and label). A G3 revision is then a data
   edit, not code. *(~half a day)*
4. **Hook segment**: the first 3-5 s as its own component with variants that all end on the body's first frame (and on
   S12's loop frame). *(~2 h)*
5. **Scripted gate check**: duration, A/V sync, caption safe area, cut list vs word anchors. It replaces review agents for
   mechanical checks. *(~1 h)*
6. **G3 animatic tier-1 tooling** (`G3_ANIMATIC.md` §7 tier 1): dress layer, `loop` + the shared ambient kit, the tier-1
   lints, the transition `device` and `carrier` fields, the `tier` and `rig` fields and the thread's coverage, the 60 fps
   reel render, g5_scaffold carry-through of `transition.type`, `carrier`, `tier` and `rig`. One checkpointed lane
   before the next video's G3, outside the gate budget; the G3 row's ~3 h first cut assumes it exists. *(~1-2 days)*

Defaults learned from video 1's posted reel: captions use `skyCaption.motion = 'pop'`, or a line rise that stays
inside the caption window. The 'scroll' slot reveal clipped letters mid-rise on a plain sky and looked like a glitch on
the phone. Paper edges never at the top or beside the caption band, because that looks like a screen recording under
the status bar. The G4 look check includes a phone screen recording of the look clip.

Drop or slim: per-scene QA charts in every check-in, beat-sync against the old storyboard, critic panels before G6, edge
labs before G4.

## Craft tooling lane (owner-approved 2026-10-27; lands before the next video's G3)

One checkpointed lane in small restartable tasks, outside the gate budgets (the retro's estimate: about 2-3
agent-days); the G3 side (the `carrier`, `tier` and `rig` fields and their lints) is item 6 above.
**When and who:** it must land before the next video's G3 (item 6, the measures) and G4 (the pen and the light); that
video's G0-G2 never wait for it. The session that starts the next video owns it and schedules it. Other sessions are
editing the same files on 2026-10-27 (the v3 rework: `lib/pen.ts`, `lib/tier.tsx`, `src/v3/film/kit/Light.tsx`; v2r:
porting `lib/light.tsx` and the tiered pen for its kit), so the lane starts with what nobody else touches (the
`scripts/qa` measures, the lints, item 6) and, before it edits a pen or light file, pulls, reads `git log -3 -- <file>`
and agrees the change with the session that last committed it (its PROGRESS or handover file); never two sessions on
one of these files at once:
1. **Port the measures into `scripts/qa`** as checks (`CRAFT.md` §e; the raw retro versions are in
   `scripts/qa/retro_tools/`): carry, eye jump and colour shift per join; tiers (salience, local contrast, motion share);
   line (strokes, short strokes, near-miss ends, dark-line pixels); light (`scripts/qa/check_light.py`, the first one,
   from the v3 rework).
2. **Finish the clean pen** (`lib/sketch.ts`, `lib/pen.ts`, `Ink`, `Fill`: `CRAFT.md` §c) and **finish `lib/light.tsx`**
   (`CRAFT.md` §d; v3's `src/v3/film/kit/Light.tsx` is the first version; v2r began the port on 2026-10-27), so that no
   film imports another film's light kit. **Port `lib/cine`'s drawing pieces to the
   clean pen** (city, street, tower, monument, wall, windows, figures, sky, light, props, wipers, lens draw raw paths
   with the theme's `misreg` and their own hand jitter, so `setPen('clean')` never reaches them; its camera and
   utilities, and `lib/kit` through `Ink` / `Fill`, are fine), and rebuild `ENGINE.md` §3's template on the clean pen.
3. **A film-code lint** that bans hatch, scribble, `over` and `misreg` in film code (`CRAFT.md` §c's grep) and flags
   a film's imports of `lib/cine` drawing pieces until item 2 ports them.
4. **The density meter** (`scripts/qa/density.py`) counts tier-C dressing only; its events/s and gap become
   information (no FAR, no gate FAIL). Still to add (they were `COZY_AND_SCALE.md` §7.6): the void (largest empty
   patch), thing counts, colours per patch, layers, and a profile tag per shot so film averages count STORY-LED shots
   only. Re-measure its fullness targets on the first G4 look clip (they were set on lined frames).
5. **The carriers in the engine and the gate check:** a card-flip transition type for carrier E (`CRAFT.md` §a;
   `G5_BLOCKING.md` §2 maps A-F onto Film's types), `carrier` read by `gate_check.py` per join, and an `unbuild`
   `transitionIn` modelled in its cut check.
