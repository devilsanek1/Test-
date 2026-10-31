# PLAN: feeling first, and guides small enough to read (step by step; for the next agent)

**Start here if you are picking this up.** The owner (2026-10-31): "Yeah let's go about it step by step 170k words of
guides is absolutely bananas / But let's make sure we have this plan captured so that I can delegate it to the next agent
to continue working on". Why: "Saying 65% contrast makes the agent force a design actually sacrificing the feeling";
"we should keep all the stylistic tooling and recipes ... but we need to reevaluate snd reframe the recipes and guides to
focus on achieving feelings with our tools rather than filling checkboxes". The analysis: `EVALUATION.md` (read it
first, 10 minutes); the evidence: `AUDIT.md` §7 "The v7 lesson".

## How to work
- **One step at a time.** Finish a step, commit and push it, tell the owner in a few lines what changed (with a
  before/after when it is visible), then start the next. Weekly tokens are tight: one agent per step, at max effort
  (the repo hook enforces it), or do it yourself; no panels or fan-outs unless a step says so.
- **Keep every tool.** Recipes, code, scripts, measurements and references all stay; only their ROLE changes: numbers
  become labelled examples or diagnostics, never targets. Move, don't delete; archive what is superseded.
- **Video 4's session owns `video/docs/v4/*` and the film's production docs;** coordinate through `BRIEF.md` (a dated
  line saying who is doing which step) so two sessions never do the same step.
- **Measure the size** before and after each step:
  `wc -w CLAUDE.md video/docs/OWNER_PLAYBOOK.md video/docs/PIPELINE_V2.md video/docs/G3_ANIMATIC.md video/docs/G5_BLOCKING.md video/docs/look/*.md | tail -1`
  (2026-10-31: about 170,000 words; the look guides about 2,800 numbers against about 50 uses of "feel / mood").
  Log each step's numbers in the table at the end.

## The steps

| # | Step | What changes | Done when | Size |
|---|---|---|---|---|
| 1 | **The capture rule** | CLAUDE.md and the playbook's Maintenance: a note is captured as the owner's words, the feeling and the tools, never as a number or a placement; "small" replaces "no size budget" | **DONE 2026-10-31** (study session) | small |
| 2 | **The one page every agent reads first** | improved on the plan: CLAUDE.md IS that page (it is loaded into every session and subagent automatically, so no agent has to remember to open it): feeling first (the three rules + "start from the feeling, never from a number" + one film), how a film is made (THE LOOP NOW, THE FRAME LOOP, two modes), the story and the voice, the hard constraints only, the toolbox as pointers, owner feedback, working rules; no separate ESSENTIALS.md | **DONE 2026-10-31** (study session): CLAUDE.md 1,317 -> 1,001 words; every detail it dropped checked to live in a deeper doc (playbook, PIPELINE_V2, API_QUICKSTART, DIRECTION) | small |
| 3 | **The brief header + a brief check** | the standard header in PIPELINE_V2 "Agent prompt rules" (the beat's story moment and FEELING in words, where its life is; the tools by guide; only the hard constraints) and one line in CLAUDE.md; the hook `.claude/hooks/feeling_brief.py` (registered beside max_effort.py for Agent, Task, Workflow and helper-session messages) STOPS a look brief that carries a share of the frame, an L* target or a placement, unless the brief says "Numbers here are examples or checks, not targets."; `--lint <file>` for scripts | **DONE 2026-10-31** (study session): tested (a number-led brief stopped; feeling-led, acknowledged, code and non-brief calls pass; bad input fails open); on 130 past workflow scripts it flags 12 (the old number-heavy v2r build briefs), none of the recent ideas-round briefs | small (code) |
| 4 | **Checks split into mistakes and diagnostics** | look numbers report, real mistakes fail | **DONE 2026-10-31** (study session): `check_light.py` (the caption band still fails; the brightest-near-subject, shadow and light-shape numbers are report lines), `check_depth.py` ("no air", "melts", "elevation" and every WARN are NOTES; only an incomplete sheet fails), `organic/composition_study.py` (R1-R10 print as diagnostics, the darks line as examples); each run on `paint_still_v7.png`, exit 0. Unchanged because they catch real mistakes: `gate_check.py` (captions, safe zones, fps, timing), `check_banding.py` (banding on the encode, paper beside the caption band), `av_lag.py`, `deadframes.py`. Left for step 7: ORGANIC §6's step "Check:" lines (a doc) | small-medium (code) |
| 5 | **DESIGN_LANGUAGE + FRAME_CARD** | `video/docs/look/DESIGN_LANGUAGE.md` (per aspect of a frame: the intent, the tools with links to their recipes and code, examples labelled as one way among many, the checks) and `video/docs/look/FRAME_CARD.md` (the questions, led by "what should the viewer feel, and where is the life and action"); both SHORT (each <= ~2,500 words); inputs `RESEARCH.md` (done) and `AUDIT.md` (partial; its tables are enough) | an agent can plan a frame from ESSENTIALS + the card alone | medium |
| 6 | **The playbook made small** | keep the owner's words and the intent of each rule; move histories, "-> what we did" detail and retired rules to `video/docs/archive/playbook_history.md`; merge duplicates | the playbook is a few thousand words (from ~20,000) and loses no owner quote | medium |
| 7 | **Guides reframed one at a time, when a film next uses them** | each guide: feeling -> tools -> examples -> checks; its numbers into an "Examples and measurements" section at the end (or `docs/look/measurements/`), its main body short; v1-era docs (`sound_plan.md`, `motion_spec.md`, `timing.md`, `style_bible*.md`, ...) to `docs/archive/` with a pointer. Worst offenders first as they come up: ORGANIC §4-§6, COMPOSITION_SHOTS (the planning card, "the five numbers", the tiers as rules), CRAFT §d/§f, LAYOUT's fixed zones, COZY_AND_SCALE's caps, DIRECTION (stays one page) | each reframed guide is used once by a real frame and the frame's feeling holds | large, spread over real work |
| 8 | **References: take / leave** | one line per reference folder | **DONE 2026-10-31** (study session): `poster_refs`, `refs_human_scale`, `refs_paint`, `refs_composition`, `refs_sound_sync` each say what craft to take and which mood to leave unless the beat shares it (refs 02/03's lonely dusk named as v7's lesson) | small |
| 9 | **Review leads with the feeling** | THE FRAME LOOP's evaluator writes "the feeling it gives" first | **DONE 2026-10-31** (study session): PIPELINE_V2 THE FRAME LOOP step 2: the report opens with "The feeling it gives: ..." (written from the picture before reading the brief), the intended feeling beside it; measurements only explain a gap the eye found; a reference lends its craft, not its mood | small |
| 10 | **The proof** | scene 1 of the Google film again, feeling first (an ITERATION, one agent, a still): her moment in front and alive, the evening opening up around her, built with v7's tools (`video/src/look/v7_s1/`, a new `v8_s1/`); shown beside v7 | the owner feels it, not just sees it | small-medium |

Steps 2-4 are the cheap, high-leverage ones; 5 and 9 make the new way usable; 6-7 shrink the words; 10 shows the owner
the result. After step 4 and after step 10, show the owner before going on.

## What not to do
- No big-bang rewrite of all the guides at once (a week of tokens, and it invents new rules on the way).
- No new numbers as targets in any step, including this plan's own size goals (they guide, they don't gate).
- No deleting of measurements, recipes or code; no pointing at video 1 or any past film as a bar or example.

## Log (one line per step: date, who, words before -> after, what the owner said)
- Baseline 2026-10-31: ~170,000 words (playbook ~20,000; COMPOSITION_SHOTS ~19,000; ORGANIC ~16,000; CRAFT ~12,000;
  PIPELINE_V2 ~10,000; SOUND_SYNC ~9,000; LAYOUT ~8,600; COZY_AND_SCALE ~8,200; PEOPLE_DESIGN ~8,000; PAINT_RECIPES
  ~8,000; TYPE_GUIDE ~7,700; the rest under 6,000 each).
- Step 1, 2026-10-31, study session: CLAUDE.md's capture rule (feeling and tools, never a number) and "small" replacing
  "no size budget"; the playbook's header and Maintenance to match.
- Step 2, 2026-10-31, study session: CLAUDE.md rewritten as the one page (1,317 -> 1,001 words; the outdated G2.5/G3
  sketchbook lines replaced by THE LOOP NOW; "start from the feeling, never from a number" as rule 4).
- Step 3, 2026-10-31, study session: the standard brief header (PIPELINE_V2, CLAUDE.md) and the brief-check hook
  `feeling_brief.py` (it would have stopped v7a's own brief: "45 % of the frame under L* 40").
- Step 4, 2026-10-31, study session: three checkers now report look numbers instead of failing on them.
- Step 9, 2026-10-31, study session: the frame review opens with the feeling it gives (PIPELINE_V2, THE FRAME LOOP).
- Step 8, 2026-10-31, study session: a take / leave line in the five reference READMEs.
