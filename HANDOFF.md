# HANDOFF: start here if you are a new agent picking up this project

Written 2026-10-25 ~20:00 UTC by the orchestrating Claude Code session (https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ),
on the owner's request: "upload all the context ... so that I can direct another agent to the repo and it will know ALL the
relevant context, including the reference videos I sent and the ones we produced. It must be as if another agent is the
same as you are here."

Everything that agent knew is in this repo. This file is the map; the details live in the files it points to.

## 0. Read in this order (about 30-45 minutes of reading; worth it)

1. **This file**, fully.
2. `CLAUDE.md` (root, auto-loaded; re-read it from disk at a session start or restart: a long-running session's
   auto-loaded copy can be older than the file) and **`video/docs/OWNER_PLAYBOOK.md`**: every piece of owner feedback
   as a rule. It is the memory across videos. Capture new feedback in the same turn, split by scope (CLAUDE.md), and
   integrate it (rewrite or retire whatever it contradicts).
3. **`video/docs/look/DIRECTION.md`**: the one page of the current look and storytelling direction; read it before
   any visual work. Its numbers, code and checks: `video/docs/look/CRAFT.md`; why it changed after v3 (owner-approved):
   `video/docs/retro/2026-10-27_v3_retro.md`. **Which doc wins:** owner's words (playbook; vN/OWNER_NOTES) > DIRECTION >
   CRAFT > PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > look/*.md > the film's STYLE.md (values only) > v1-era docs (API and
   measurements, never style). The owner's words are what the owner said (quoted), never the "-> what we did" half of
   an OWNER_NOTES line; the full order, with the topic docs and the tie-breaks, is DIRECTION's intro.
4. **`video/docs/PIPELINE_V2.md`**: how we work (gates G0-G8, a playable video at every gate from G3, where to spend
   tokens and where not to). The gate specs: `video/docs/G3_ANIMATIC.md` (the sketch animatic) and
   `video/docs/G5_BLOCKING.md` (building the film); the look by topic: `video/docs/look/*.md` (section 6). Background:
   `video/docs/PIPELINE_RESEARCH.md`.
5. **`context/summaries/compaction_3.md`**: the most recent detailed state summary (written when the context filled up
   for the third time; everything after it is in sections 2-2b below and in each video's own files). Then
   `compaction_2.md` and `compaction_1.md` for history. Their git advice (`git add -A video`) is retired: commit only
   your own paths (section 4).
6. **`context/conversation/USER_MESSAGES.md`**: every message the owner sent up to 2026-10-25 19:36 UTC, verbatim, with
   timestamps. It's the fastest way to learn what they want and how they talk. Later messages are quoted where they
   were captured: the playbook (rules) and each `video/docs/vN/OWNER_NOTES.md` (per video, newest at the bottom). The
   full thread with the assistant's replies is `context/conversation/CONVERSATION_2026-10-24.md` and `..._2026-10-25.md`;
   every tool call is in `ACTIONS_LOG.md`.
7. **Where each video stands now.** Sections 2 and 2b are dated logs that each video's session appends to: section 2
   is the state at the 2026-10-25 handoff; in 2b the v3 bullets run newest first, and the long "RESTARTED FROM
   SCRATCH" text inside v3's "G3 LOCKED" bullet (with the sub-bullets after it) is video 2's. The live state: video 2,
   the top snapshot of `video/docs/v2/PROGRESS.md`; video 3, the bottom of `video/docs/v3/OWNER_NOTES.md` (after G5b:
   the owner's verdict, then the rework, `video/docs/v3/flow_v2.md`); a new video, section 1 ("Starting the next
   video"). Where a status line and the current direction disagree (an old plan such as "G1 is a radio cut", or "the
   pilot is the bar"), DIRECTION and PIPELINE_V2 win.
8. As needed: the docs index (section 6), `context/agent_reports/` (what each multi-agent run returned) and
   `context/workflows/` (the workflow scripts with their full agent prompts: copy their structure, never their briefs;
   PIPELINE_V2 "Studio toolkit").

## 1. Who and what

- **The owner** runs a short-form explainer channel, **"What's All the Fuss About?"**: Instagram
  `what.the.fuss.is.about` (Creator account, Education), with TikTok and YouTube Shorts under the same name. The master
  creative brief is `video/docs/CREATIVE_BRIEF.md`; read it. The core promise: "You've heard about it. Now actually understand it."
- The owner works from a **phone** (Claude app, mobile). They write fast and informally, with typos, and send
  screenshots and screen recordings. They want:
  - short, plain updates;
  - playable video rather than stills;
  - files sent as downloads (in-app previews may play muted).
- They opted into **heavy multi-agent work** ("NO LIMITS on tokens and time", ultracode on). Their rule is quality first, without waste: since 2026-10-28 the early stages run lean (2 scouts + 1 editor for the topic and its core line, one fact lock, a writer + a critic for the script, agents reporting in files, small orchestrator contexts: `video/docs/retro/2026-10-28_v4_early_stage_cost.md`), while design explorations at G3-G4 still get their judged concepts. Every agent and helper runs at MAX effort; the weekly limit is the
  real budget (playbook, Process).
- **The assistant's role is orchestrator.** It researches, plans and runs Workflow scripts (writers, judges, builders,
  reviewers), builds the film in Remotion, mixes the sound and delivers. It keeps the playbook, pipeline and docs up to date.
- **Open owner decisions (2026-10-27):** when video 4 starts and on what topic; whether posts cite their source by
  default (`video/docs/v2/OWNER_NOTES.md`, Posting); the 1440x2560 YouTube master of v1 (queue item 3); and the clean
  pen's look, which the owner first judges in the v3 rework's pilot and the next G4 look clip (if it still looks cheap,
  ask about building the world first: retro §6).
- **Starting the next video** (video 4 had not started on 2026-10-27). It starts when the owner asks: they name the
  topic, or ask us to scout one. The session the owner asks owns it and adds a "Video N is produced by session ..."
  line to section 2b. Films in flight share the weekly limit and finishing them comes first, so before the new video's
  first big fan-out (G0's scouts and judges) check the week's usage against what the films in flight still need, and
  ask the owner if it is tight. First steps: create `video/docs/vN/OWNER_NOTES.md`; check the voice key
  (`[ -n "$ELEVENLABS_API_KEY" ] && echo set`; without it, tell the owner before G2: they add the secret, or they make
  the take in ElevenLabs from our full paste text); then `video/docs/PIPELINE_V2.md` from G0, in its lean form (its G0-G1 bullets; the heavy templates only when the owner asks for a wider search). The craft tooling lane (PIPELINE_V2) must land
  before the new video's G3; G0-G2 never wait for it.

## 2. Status at handoff

### Video 1, "php2shell": DELIVERED and POSTED (final means final; don't redo it)

- **Story:** a PHP bug that sat for about 14 years let attackers take over servers, and governments in Europe switched
  off their own websites on purpose. The script is `video/docs/script/final_script.md`, the facts and sources are in
  `video/docs/script/sources.md` / `fact_sheet.md`, and the timing is in `video/docs/timing.md`.
- **The film:** **`video/deliverables/v1/php2shell_final.mp4`** (1080x1920, 30 fps, 55.37 s, loops seamlessly, -14 LUFS).
  The cover is `video/deliverables/cover.png`, the posting texts are in `video/docs/POSTING_KIT.md`, and the profile
  pictures (mascot Pip) are in `video/deliverables/profile/` (the avatar in use is `pip_power_button.png`).
- **Built from:**
  - Remotion composition `Main`, entry `video/src/entry-film.ts`, scenes S01-S12 in `video/src/scenes/` (notes per
    scene in `video/docs/scenes/`).
  - Style: hand-drawn ink, flat colour, with the elephant mascot "Pip".
  - Voice: `video/audio/vo_clean.wav`, the treated ElevenLabs take `video/assets/vo_v3_final.wav`.
  - Sound: synthesized SFX (`video/audio/sfx`), cues in `video/audio/cues.json`, and a cinematic bed.
- **Posted to Instagram on 2026-10-25.** After 45 minutes: 155 views, 70 viewers, average watch 21 s of 55 s, and
  about 80 % of viewers gone by 3 s. The lesson is now a rule: put the payoff in words in the first ~2 s (in the voice's order, since 2026-10-28), keep it 30-45 s, and
  polish the hook most. The numbers are in the playbook's Performance log.
- **Owner feedback after posting** (all in the playbook):
  - The paper edge at the top looked like a screen recording, so it was removed in the final.
  - Captions that roll in clip letters; pop captions are the default from v2.
- **Accepted quirks** are listed in `video/docs/WRAPUP.md`. Its status line is from 13:58 UTC; the final was re-rendered
  at 15:50 UTC without the top paper strip.

### Video 2: Google DeepMind staff resigning over military AI contracts (at gate G0, the angle)

- **Topic:** the BBC article of 21 Oct 2026, "Google staff resign in backlash over its AI contracts with military"
  (Christopher Giles, BBC Eye). The owner pasted the full text, saved at `video/docs/v2/source_bbc_2026-10-21.md`.
  bbc.co.uk is blocked from the container, so never fetch it.
- **The owner's direction:**
  - "Research more this topic maybe we can make it into something bigger: ENGINEERS ARE RESIGNING AND AFRAID kind of
    vibe", with a hook more powerful than "Engineers are leaving Google!".
  - It must stay true: the BBC says "several" staff, the lifetime non-criticism clause is Sofia Liguori's own words,
    and Google's response has to be represented.
- **The G0 workflow** is written in `context/workflows/v2-g0-angles-wf_b7b190a7-4fe.js`. It runs:
  - 3 research agents: the 2018-2026 timeline, the industry pattern, and fairness/legal/platform-reach guardrails;
  - 5 writers with different lenses, 2 angles each;
  - 3 judges (growth, standards+legal, creative);
  - a synthesis into `video/docs/v2/G0_ANGLES.md`, then an adversarial fact-check.
- **The run on 2026-10-25 failed:** all 13 agents hit the account's weekly usage limit, which resets at 10:00 UTC
  (Mon 26 Oct). Nothing was produced. **Relaunch it unchanged** with the Workflow tool,
  `scriptPath: <repo>/context/workflows/v2-g0-angles-wf_b7b190a7-4fe.js`. The paths inside are absolute
  (`/home/user/Test-/video/...`), so adjust them if the repo lives elsewhere.
- **Next:** show the owner the top 3 angles on one screen. After their pick, G1 is a radio cut (TTS voice over plain
  paper with big captions) with 3 hook variants.

## 2c. Video 4 (2026-10-27): G0 topic scouting started
- **2026-10-28 ~21:25 UTC: paused at the topic pick** (shortlist and column chart sent; `video/docs/v4/README.md`); the
  session runs the owner's streamlining review: `video/docs/retro/2026-10-28_streamline/`.

- **Video 4 is produced by session https://claude.ai/code/session_01XBbv5cud3NnzxxSLqPjWNt since 2026-10-27 ~22:35 UTC**
  (owner: "okay lets continue with the video 4 production"), on branch `claude/busy-lovelace-83r39e` (the earlier v4
  branch below merged in), merged into `video-production` on 2026-10-27 ~23:05 UTC at the owner's yes. 2026-10-28: G0.5 for AI songs finished (top 3 lines), then the owner switched video 4 to a positive AI story (alternate the mood); AI songs is parked whole in `video/docs/v4/archive/ai_songs/`. Live state in `video/docs/v4/README.md`.
- Session https://claude.ai/code/session_014PwCXHBSouhcawFp12X9sT, branch `claude/tender-bardeen-j7duak`.
- Owner: "research another video topic starting with step 1; the topic must not include Anthropic as the key entity."
- Workflow `context/workflows/v4-g0-topics-wf_4d4df1c1-d0b.js` writes `video/docs/v4/scouting/*.md` and
  `video/docs/v4/G0_TOPICS.md` (top 3 for the owner). DONE 2026-10-27: A gas tanks (recommended), B commute to Zoom,
  C padlock key was 4. Owner: "lets focus on tech and AI related news" -> round 1 archived; round 2 (tech + AI only)
  `context/workflows/v4-g0-topics-tech-*.js` -> `video/docs/v4/scouting_r2/`, `G0_TOPICS.md`. **LOCKED: B, AI songs and the shared royalty pot** (owner: "good amount of fuss about AI songs").
- **Pick-up notes: `video/docs/v4/README.md`.** **PAUSED 2026-10-27 ~14:40 UTC (owner: "lets pause for now. lets make sure the other session finishes its work")**: the G0.5 run was stopped before any agent finished (nothing produced). To resume, relaunch `context/workflows/v4-g05-facts-and-core-line-*.js` unchanged once the owner says go.
- G0.5 (paused): `context/workflows/v4-g05-facts-and-core-line-*.js` -> `video/docs/v4/research/`, `CORE_LINE.md`. Next: owner picks the core line; then G1 story-first script.

## 2b. Update 2026-10-25 20:00 UTC: two agents, split by video

- **Video 2 (Google DeepMind resignations) is produced by session https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ**
  (the original session; the owner said "continue with video 2" at 20:20 UTC). The video 3 session does not touch `video/docs/v2/`
  or the v2 queue item below.
- **Video 3 is produced by session https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR.** It is at G0 (topic
  scouting): workflow `context/workflows/v3-g0-topics-wf_b78a4844-2b3.js` writes `video/docs/v3/scouting/*.md` and
  `video/docs/v3/G0_TOPICS.md` (top 3 fresh topics for the owner to pick).
- **v3 status (2026-10-28): DONE.** The owner posted the reworked reel and closed it ("It's done"). Their notes on the
  posted reel are rules for the next videos (playbook): words follow the voice (no title over the captions), words in
  the picture few and big, every opening effect big enough to stop a thumb. `deliverables/v3/v3_final.mp4` is the
  latest master, with the text fixes. Earlier status: rework master delivered, awaiting the owner's review. The
  final step's report (master facts, checks, cover frame 192, what is deferred): `video/docs/v3/rework_reports/assembly_final.md`.
  - The hook pilot (SQA 0-5.80) was sent to the owner: `deliverables/v3/v3_rework_pilot.mp4`.
  - Five max-effort fix lanes are done and pushed. Their reports are in `video/docs/v3/rework_reports/`:
    - `final_lanes.md`: WINDOW, REVEAL, HOME;
    - `shared_layer.md`: thread_plane, home_set, PriceTag, captions;
    - `cross_prepass.md`: what crossed the lane borders;
    - `OPEN.md`: the work list, E1-E15 and items 1-12.
  - The final assembly is workflow `context/workflows/v3-assembly.js` (the 5-hour limit stopped run wf_abe46864-482 at 02:49 UTC; its integrator was resumed from its transcript and finished: `rework_reports/assembly_integrate.md`; the rest runs as wf_c4276cf6-c2a with `args.integReport`; resume with `resumeFromRunId`; each agent writes `rework_reports/assembly_*.md` as it goes). Its steps:
    1. integrate (the lanes' open REQUESTS, every join and the loop seam);
    2. full-size render;
    3. three independent reviews (story/attention, look/light, a cold owner's eye at phone size);
    4. a fix round by file lane;
    5. an independent verify on a fresh render, and a second fix round if blockers or majors remain;
    6. the master (`render-media.mjs --master`, -14 LUFS / -1 dBTP) to `deliverables/v3/v3_final.mp4`, the cover, `POSTING.md`.
  - Then the orchestrator looks at the master and sends it to the owner, labelled as the rework cut for review.
  - The helper sessions W, R and H2 are archived.
- **v3 status (2026-10-27 evening): REWORK before publishing** (owner: "apply the feedback ... make it better before we
  publish"). The G5b cut was NOT posted. Retro: `docs/retro/2026-10-27_v3_retro.md` (pipeline APPROVED), craft spec
  `docs/look/CRAFT.md`, direction `docs/look/DIRECTION.md`. Rework: new flow `docs/v3/flow_v2.md` (sequences SQA-SQD, the
  price tag as the thread, carriers at every join), clean pen + tiers + light kit; workflow
  `context/workflows/v3-rework-design-and-pilot-*.js` builds SQA as the pilot; SQB-SQD then go to helper sessions; then
  assembly, full-res render, posting master (Film3Final, -14 LUFS, TV range), cover re-check, `docs/v3/POSTING.md`.
  Helpers (briefs `video/docs/v3/rework_split/brief_{W,R,H}.md`, done-signal `video/docs/v3/rework_reports/*.md`; archive each
  when done): W = WINDOW (SQE+SQF, outside, h2_window) session_01VwsUCns4ZcZEphRgqiBXGe; R = REVEAL (SQD)
  session_01VwsUCpJ3WKXeJ8yoN5qWX8; H = HOME (SQB+SQC): the first helper ran at default effort and was stopped before building; H2
  session_01VwsUCniUe5x2gPimLDBXNW runs it at max effort (booted with /effort max, verified effort_level max). W and R ran at
  default effort; their sequences get a max-effort review in the transition/assembly pass. Then the
  transition agent (J1-J5 + loop) and the assembly run in the orchestrator session.
- **v3 status (2026-10-27 ~14:40 UTC): G5b DELIVERED** (`deliverables/v3/v3_g5b.mp4`, 1080x1920, 60 fps, gate PASS,
  film density 6.8 ev/s, flat 19 %, detail 52 %; sheet `review/v3_g5b/sheet.jpg`; render recipe in G5_BLOCKING.md 8b,
  chunked per panel). Waiting for the owner's notes; next G6 polish (easing, secondary motion, subtle edges) + G7 sound.
- **v3 status (2026-10-27): G5b density + life.** The owner judged G5 "way too empty"; new rules: feel alive (not a
  quota), great scale, coziness v2 (two measured references, `docs/look/COZY_AND_SCALE.md` 3b), `docs/look/LIFE_AND_DENSITY.md`
  + `scripts/qa/density.py` (--cozy). The density pilot (`deliverables/v3/v3_g5b_pilot.mp4`, O1 + S4/S6) was APPROVED ("go
  ahead yes") and is the bar. RUNNING: `context/workflows/v3-g5b-rollout-*.js` (8 lanes build/review/fix, then a full-res
  assembly -> `deliverables/v3/v3_g5b.mp4`). Plans: `docs/v3/density_plan_g5b.md`, `cozy_v2_application.md` (overrides),
  `s9_scale_plan.md`. Next: owner notes on G5b, then G6 polish.
  **2026-10-27 ~11:10 UTC, split (owner: "split it yes"):** all 8 builds + reviews done, fixes done for S13 and S5. The
  remaining fixes run in three helper cloud sessions (briefs `video/docs/v3/g5b_split/brief_{A,B,C}.md`: A = S10-S14,
  B = S7-S8 + S12, C = S11 + S16); each writes `video/docs/v3/g5b_reports/fix_*.md` when done. The S9 fix runs in the
  orchestrator session; then the full-res assembly (`deliverables/v3/v3_g5b.mp4`).
- **v3 status (2026-10-26 ~22:00 UTC): G5 blocking cut DELIVERED** (`deliverables/v3/v3_g5_blocking.mp4`, 60 fps, 540x960,
  gate check PASS; sheet `review/v3_g5/sheet.jpg`), waiting for the owner's notes. S9 + S9b were merged into one S5
  pull-back crane panel (owner: "swap"; library entry S5 in `docs/look/CINEMATIC_GUIDE.md`, from Arcane compilation shot #55).
  Next: owner notes on G5, then G6 polish.
- **v3 status (2026-10-26 ~19:30 UTC): G3 LOCKED** (board with cinematography, commit 14bfa55; owner: "okay fine, go ahead").
  **RESTARTED FROM SCRATCH 2026-10-27 (owner: "No I don't like it, let's start from scratch ... let's not do the sketch. Do the video right away, full creative freedom ... NO LIMIT ON TOKENS").** The first visual pass (board, look, G5) is dropped to `video/docs/v2/archive/restart_2026-10-27/` (+ `deliverables/v2/archive/`); never build on it. Kept: topic, research, core line, the approved script and voice take 2 (no ElevenLabs key in the session env, so no new narration). New production straight to the finished film, guided by the repo's direction (v1 = the house model; Pip in every scene): understanding docs in `video/docs/v2/direction/` (house digest, beat map, teardown, toolkit) DONE; six treatments judged -> **`video/docs/v2/TREATMENT.md` LOCKED ("One Small Window": a London canal evening, ageing outline copies of her on "for life", a wall of windows, the Arlington crane, equal boards; palette "10 Canal Mint"; shots V2S1-V2S8; kit K1-K9; lanes L1-L7)**. Owner rules added during the restart: no reusable assets (everything drawn new, incl. a new Pip and new music); people small and simple like reference 1. **Progress reporting (owner asked):** scheduled task `trig_01HUebJeJqxrK67qTURHNW4V` ("v2r hourly progress report", :18 every hour) fires into the orchestrator session: collect helper status, commits, reports, workflow journals; update `video/docs/v2/PROGRESS.md`; report 6-10 lines; delete it when the film is delivered. **PAUSED 15:05 UTC 27 Oct (5-hour session limit at 89 %, resets 18:30 UTC): every lane and local workflow stopped at a safe point, all pushed; resume steps + state in `video/docs/v2/PROGRESS.md` (top snapshot) and `lanes/handover_*.md`; a scheduled message resumes the orchestrator at 18:33 UTC.** **BUDGET (owner, 2026-10-27): the weekly token limit is the real budget; finish the film first (up to 100 % of the week is fine if it gets finished); lanes on finish-first budgets (<= 2 critic rounds, <= 2 agents, no full-film renders, reports ~16:30 UTC); spend ledger in the orchestrator's scratchpad, spend line in each hourly report.** **EFFORT IS MAX, ALWAYS (owner, 2026-10-27: "the key rule is we need to ensure the effort is MAX!"):** every Workflow `agent()` call passes `effort: 'max'`; every helper session runs at /effort max (see below). **Helper cloud sessions (owner: parallelize; MAX effort + ultracode: create from branch `v2r-helper-boot` (its `.claude/settings.json` = `{"ultracode": true}`) with the first prompt exactly `/effort max`, then send the task as a message (first step: checkout video-production); verify `effort_level: max` and `is_ultracode_active: true` with get_session; archive each once its report is merged and checked; briefs, handovers, reports in `video/docs/v2/lanes/`):** current helpers (QA done + archived 14:42 UTC 27 Oct, report_QA.md): L1 hook `session_014PwCXJtHzuLkUMsNQTU4LD`, L2 wall `session_014PwCXHaMDZbQskHTPPEQYk`, L3 her bank `session_014PwCXJs9nWENkpKqVhHWMP`, L4 crane `session_014PwCXHEmk7T2Y5xLmUSX6h`, L5 boards+S6+S7 `session_014PwCXJBpuhBWJAJtA6vrSe`, L6 her words + seam `session_014PwCXKi95W1ntg73DuH1F5` (tag `v2r-helper`; three earlier rounds archived after handover). Build running locally (workflows in `context/workflows/v2r-*`): W0 shell/palette/map, sound draft, W1 kits (cast, Pip, canal, Arlington); next the kit contract sheet + critic, the pilot (S1 hook + S5 crane, sound-off cold-read pass test), the remaining lanes, assembly, mix, final render. Still open: a voice pick between take 2 and the API deliveries in `assets/v2/voice_{secret,news,story,punch}` (paste files `docs/v2/voice/`). A new voice means a retime of the shot times to its word timings. Started 14:40 UTC (the owner: "let's start working on the second video"). Video 2 follows the v3 process: the topic is picked; the old G0 "angles" step is folded into the core line.
   - Workflow: `context/workflows/v2-g0-facts-and-core-line-wf_fad013d0-cfd.js`.
   - Steps: research (industry, guardrails; timeline already done) → `video/docs/v2/research/factlock.md` → G0.5 core line (6 lever writers, 4 judges, 4 viewer personas, 2 sceptics per finalist) → `video/docs/v2/CORE_LINE.md` (top 3) → truth check.
   - Next: the owner picks the core line; archive the rest (locked-means-dropped); then G1, the story-first script (template `v3-g1-story-*.js`).
**The cross-video queue** (item 1, video 2's G0, became its status bullets above):

2. **DONE 2026-10-26 (v3 session): `video/docs/look/COZY_AND_SCALE.md` + `video/docs/look/research/`. The owner's Arcane screen recording arrived 2026-10-26 (black from DRM; identified as compilation shot #55 and measured into `video/docs/look/CINEMATIC_GUIDE.md` S5); the rest of its section 8 is optional. Was: RUNNING since 2026-10-26 00:10 UTC (owner engaged again via the Arcane idea and said "continue"; don't duplicate): `context/workflows/look-cozy-scale-arcane-wf_e8c65891-2ba.js` (palette rule merged in, covers v2 and v3). It replaces the paused `look-cozy-and-scale-wf_ee30e562-0c7.js`. Research the "cozy + scale" look** (owner, 2026-10-25 17:32). Output `video/docs/look/COZY_AND_SCALE.md` plus `video/docs/look/research/*.md`. It must also follow the palette direction in `video/docs/look/PALETTE.md` (owner, after the pause).
   - **Owner idea, 2026-10-25 23:30 UTC (v3 session):** reverse-engineer Arcane's camera moves and cinematic shots into
     references. When relaunched, add an Arcane lane that lists 8-12 specific moments for the owner to screen-record
     (we can't download the show), then measure each clip frame by frame (OpenCV feature tracking: pan/tilt/zoom/roll
     curves, easing, shot length, parallax layers, framing) and turn each move into a reusable 2D camera preset with a
     short demo. A draft of that combined workflow is `context/workflows/look-cozy-scale-arcane-wf_e8c65891-2ba.js`
     (stopped at once because of the pause; nothing produced).
   - **What the owner said:**
     - "I do like the bigger scale scenes occasionally, we did it great here, keep going, taking inspiration from
       scenes in Arcane: not the footage but camera work, to feel small and scale."
     - "Another visual twist we should rely on is a feeling of coziness. Via 1. Enclosure view, research this topic maybe."
   - **References:** `video/docs/look/ref_sense_of_enclosure.jpg` (an urban-design reel, "Sense of Enclosure" of the
     street) and the Arcane collage `video/assets/ref_cinematic/arcane_collage.jpg`.
   - **Planned workflow** (not yet written or run). Five research lanes:
     - urban design (enclosure height:width ratios, Cullen, Sitte, Alexander's Pattern Language, Ewing & Handy,
       Maertens' 45°/27°/18° viewing angles, prospect-refuge);
     - the psychology and design of coziness (hygge, Project Horseshoe's 2017 "Coziness in games", Ghibli interiors,
       warm light pools against a cold outside);
     - Arcane's camera grammar of scale, with 2D recipes (multiplane parallax, crane reveals, tiny figures, haze);
     - cozy and scale in 9:16 short-form (the vertical frame suits tall walls), applied respectfully to a serious topic;
     - an audit of v1's scale scenes and our kit (what exists or is missing for enclosure framing, light pools and scale).
   - **Then:** a synthesis into `video/docs/look/COZY_AND_SCALE.md` (rules with numbers, a shot grammar, the cozy-to-scale
     rhythm, how it applies to v2, and what to build at G3/G4/G5), followed by a critic pass.
   - The playbook already records both rules (Visual style).
3. **DONE 2026-10-25 (checklist in `video/docs/POSTING_KIT.md`; a 1440x2560 YouTube master of v1 was offered, awaiting a yes). Answer the owner on Reels upload quality.** They asked: "Is there anything we can do to ensure the quality of a video
   we upload to reels is the highest possible." The research is done (findings below). Next, write an "Upload
   checklist" into `video/docs/POSTING_KIT.md` and a playbook line, then offer a 1440x2560 YouTube master of v1.
4. **DONE 2026-10-25 (answered; notes in POSTING_KIT, "Linking the accounts"). Answer the owner on linking TikTok and Instagram.** They asked: "am I able to link my TikTok account and my
   Instagram account somehow?" (asked during the handoff).
   - TikTok: Edit profile has a field to add an Instagram account, which shows an icon on the TikTok profile.
   - Instagram: add the TikTok URL under Edit profile → Links.
   - Post natively to each platform with the clean file. Don't share TikTok exports with the watermark to Reels.
   - Verify these menus before answering.
5. **Sound effects (owner, 2026-10-25):** "I really like the sound effects we are using! We should use more effects of
   what people associate with something positive on their phone, like a like-notification sound, and have it in the
   video as early as possible."
   - Recorded in the playbook (Music and sound).
   - Apply it in every film: the hook's sound is named in the G1 script and plays from the G3 reel on
     (PIPELINE_V2 anti-waste rule 7; there is no G1 "radio cut": G0-G2 are text and audio only).
   - Our SFX are synthesized in `video/audio/tools/make_sfx.py`, so there are no licence issues. Design a "like pop /
     notification ding / message-sent swoosh" family that evokes those sounds, rather than copying Apple's or
     Instagram's actual sounds.
6. **Tooling (PIPELINE_V2, "Tooling planned before video 2" and "Craft tooling lane"):** the draft flag, the SketchReel
   comp and the scripted gate check exist; `npm run preview` and the hook segment were never built. The G3 tier-1
   tooling (item 6 there) and the craft tooling lane are part of the pipeline the owner approved on 2026-10-27 ("Yes"):
   they must land before the next video's G3 (not built yet on 2026-10-27).
7. **When the owner shares more insights** for v1 (next day), add them to the playbook's Performance log.

**Reels quality research** (2026-10-25; from guides and community sources, since Instagram publishes no exact encoder specs):

- **In the app:** Instagram → Settings and activity → Data usage and media quality → **"Upload at highest quality" ON**,
  data saver off, upload on strong Wi-Fi.
- **TikTok:** on the Post screen → More options → **"Allow high-quality uploads"** ON.
- **The file:** 1080x1920, 30 fps (we render 60 fps since v3: `video/docs/POSTING_KIT.md`), H.264 High, SDR BT.709, AAC 48 kHz. Ours is about 11.6 Mbps (CRF 14), which is fine;
  the consensus range is 8-15 Mbps. 4K uploads don't help on Reels (it stores 1080 wide) and add compression risk.
- **YouTube Shorts is different:** uploads above 1080p get the better VP9/AV1 encodes. Our film is vector (SVG), so a
  1440x2560 render (`scripts/render-media.mjs ... --master --scale=4/3`; a plain 1.3333 misses whole pixels and
  Remotion refuses it) is genuinely sharper. Render one for YouTube.
- **Getting the file to the phone:** download the original (AirDrop, Files, Drive). Not via WhatsApp/Messenger, which
  recompress it.
- **In Instagram's editor:** don't apply filters or edits.
- **After posting:** judge the quality after about 10-15 minutes, once processing finishes.
- **Design for compression:** fine full-frame grain and 1-px lines smear and band. Our flat-colour style compresses well.
- **Sources:** revid.ai/blog/ig-reels-resolution, stayabundant.com/blog/best-instagram-reels-export-settings,
  creativecow.net (4K vs 1080 thread), provideocoalition.com/uploading-to-youtube-is-4k-worth-it,
  vidiq.com/blog/post/youtube-shorts-vertical-video, clipspeed.ai/blog/high-quality-tiktok-uploads.html.

## 4. Rules of engagement (from the owner and from how this session ran)

- **All delegated work runs at MAX effort** (owner, 2026-10-27): workflows, sub-workflows, subagents, the agents they
  start and helper sessions. The PreToolUse hook in `.claude/settings.json` (`.claude/hooks/max_effort.py`) denies an
  Agent call without `effort: "max"`, a Workflow whose script has an `agent()` call without `effort: 'max'`, and a
  helper session whose first prompt isn't exactly `/effort max`; `python3 .claude/hooks/max_effort.py --lint|--fix
  <workflow.js>` checks or repairs a script (playbook, Process). A session only loads the hook if `.claude/settings.json`
  existed when it started.
- **Git:**
  - Branch **`video-production`** (it is the repo's default branch).
  - Commit and push after every meaningful step, only the files you changed: `git add <paths>` (never `-A` or `.`:
    other sessions edit the repo too), `git pull --no-rebase origin video-production`, then
    `git push origin HEAD:video-production`. If `.git/index.lock` exists, wait and retry; never discard another
    session's work.
  - **Every commit message ends with these two lines**:
    ```
    Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
    ```
    The second line names the original session. A new session gets its own attribution lines from its harness; use those.
  - No model identifiers in files, code comments or commit text beyond those lines. No pull requests unless asked.
- **The repo is PUBLIC** (github.com/devilsanek1/Test-). The owner's email is redacted from every export; never write it
  into a file.
- **Owner feedback:** capture it in the same turn, split by scope (CLAUDE.md): approach-level rules in
  `video/docs/OWNER_PLAYBOOK.md` with the date and reason, integrated (rewrite or retire every rule and doc it
  contradicts, `video/docs/look/DIRECTION.md` included); notes on one video in `video/docs/vN/OWNER_NOTES.md`.
- **Show playable video from G3 on** (text and audio before), and send video files with SendUserFile as downloads. Give
  the owner the script text with any new voice take.
- **Final means final:** log new ideas for the next video instead of redoing a delivered one.
- **Progress updates:** the gate deliverable is the update; between gates, a short text status on all active threads
  (the owner asked for about every 30 minutes in a long build), never a rendered status reel (PIPELINE_V2 rule 8).

## 5. Environment, setup and gotchas

- **Setup in a fresh container:**
  - Node 22: `cd video && npm ci` (Remotion 4.0.538, React 18).
  - `video/remotion.config.ts` hard-codes
    `Config.setBrowserExecutable('/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell')`
    and the `swangle` GL renderer. Point it at the container's headless Chromium if the path differs.
  - Python 3.13 with numpy, scipy, librosa, soundfile, pyloudnorm, pedalboard, soxr, pretty_midi, mido,
    opencv-python-headless, pillow and matplotlib. Word timings used sherpa-onnx with the NVIDIA Parakeet model;
    `video/scripts/voice/transcribe.py` shows how (setup in its header; `check_take.py` wraps it).
  - ffmpeg 6, ImageMagick, and the Inter fonts (the project also ships fonts in `video/public/fonts`).
- **Commands for a current film (vN, 60 fps; from `video/`):** the scaffold, one-panel previews, the owner's gate render
  and the scripted gate check are in `video/docs/G5_BLOCKING.md` §1, §4 and §7 (template: v3's `src/entry-v3-film.tsx`,
  compositions `FilmN`, `FilmN-<ID>`); the owner's cut from G5 on renders at full size, chunked per panel (§8b there);
  the G3 reel renders at 540p60; finals render in one step with `scripts/render-media.mjs --master` (`video/docs/PIPELINE_V2.md`
  "Master encode": lossless frames, one BT.709 encode; the TV-range pass below is v1's only, it relabelled BT.601 as BT.709).
- **v1's commands (30 fps `Main`, kept for v1; from `video/`):**
  - Final render: `npx remotion render src/entry-film.ts Main out/X.mp4 --crf 14`. Then convert to TV range:
    `ffmpeg -i out/X.mp4 -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -crf 14 -preset slow -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a copy -movflags +faststart out/X_tv.mp4`.
    Remotion's output is full-range yuvj420p, which some players show wrongly. (2026-10-28: this pass keeps BT.601
    coefficients under a BT.709 tag, 1-2.5 dE off, and re-encodes; new films use `--master` instead.)
  - Stills, strips and dev comps: `node scripts/render-frames.mjs`, `scripts/still.sh`, `scripts/strip.sh` and
    `scripts/sheet.sh`. The dev comps are in `src/dev/registry.ts`.
  - Sound: `python3 audio/mix.py --music cinematic --out audio/mix.wav && cp audio/mix.wav public/mix.wav`
    (cues in `audio/cues.json`, SFX generator `audio/tools/make_sfx.py`, credits in `docs/sound_credits.md`).
  - QA: `bash scripts/qa/run_all.sh Main` (dead frames, frame check, caption check) and `python3 scripts/camspeed.py`.
  - Captions: `src/data/captions.json` (one page per line) plus `src/data/captions.overrides.json`.
- **Gotchas:**
  - A safety hook blocks unguarded `rm -rf $VAR`; write `rm -rf "${D:?}"/"${v:?}"`.
  - `pkill -f remotion` can kill your own shell; use `ps | grep "[r]emotion ..."` and kill by PID.
  - Workflow agents ran about 2 at a time on this 4-CPU container (render-heavy work is CPU-bound); more parallel work
    goes to helper cloud sessions, each its own machine (PIPELINE_V2 anti-waste rule 5; playbook Process).
  - **Usage limits (weekly/monthly) kill agents mid-task** (66 agents were lost on v1). Keep agent tasks small and
    commit after each one and at every turn's end; agents write their results into repo files, never only as messages
    (a 5-hour limit on 2026-10-28 stopped three writers, and three finished ones existed only as messages); a long
    unattended build runs `video/scripts/autocheckpoint.sh <branch> <your film's paths>` (every 10 minutes when those
    paths changed, at most 2 hours per background job; `--once` for a single checkpoint); after the reset, resume a
    stopped agent with SendMessage instead of starting a new one. The main loop kept working when agents could not.
  - ImageMagick circle avatar mask:
    `-alpha set ( +clone -alpha transparent -fill white -draw "circle ..." ) -compose DstIn -composite -background white -alpha remove`.
  - The scratchpad and `video/out/` are not in git (`video/out` is gitignored); deliverables go to `video/deliverables/`.
- **What v1 cost and why:** `video/docs/PIPELINE_V2.md` has the table (442 agents; fix 40 %, review 28 %; polish
  never converged). The script is `video/docs/retro/spend.py`.

## 6. Map of the repo

- `CLAUDE.md` is the auto-loaded project rules, and `HANDOFF.md` is this file.
- **`context/`** holds the session export; see `context/README.md`:
  - `conversation/`: the thread, the owner's messages verbatim, and the actions log;
  - `summaries/`: the 3 context-compaction summaries;
  - `uploads/`: the owner's screenshots and screen recordings (indexed in `uploads/README.md`);
  - `workflows/`: every workflow script, with `INDEX.md`;
  - `agent_reports/`: each workflow's agent results;
  - `scratchpad_tools/`: throwaway working scripts from the session.
- **`video/`** is the Remotion project:
  - `src/`:
    - `Main.tsx`, `FilmRoot.tsx` and `entry-film.ts` are the film;
    - `scenes/sceneNN/` holds each scene's camera, timing, beats and sets;
    - `lib/` holds the engine, edges, mascot, captions, theme and the clean pen with its tiers (`pen.ts`, `tier.tsx`);
    - `data/` holds the captions and timing;
    - `dev/` holds the dev comps, including `ProfilePic.tsx`.
  - `assets/` has the reference videos and frames (`ref/`, `ref2/`, `ref_cinematic/`), the VO takes and the timing JSON.
  - `audio/` has the mixer, SFX, music beds, cues and tools.
  - `deliverables/` has v1's final video, cover and profile pictures.
  - `docs/` is all design and process docs, indexed below.
  - `review/` holds review and QA artifacts.
  - `scripts/` holds the render, QA, anchor and caption tools.
- **Docs index (`video/docs/`):**
  - Process: `OWNER_PLAYBOOK.md` (rules from the owner), `PIPELINE_V2.md` (gates, budgets, anti-waste, the craft
    tooling lane), `G3_ANIMATIC.md` (the sketch animatic), `G5_BLOCKING.md` (building the film), `ELEVENLABS.md` +
    `voice/` (the API voice), `POSTING_KIT.md`, `retro/` (spend forensics; `2026-10-27_v3_retro.md`: the approved
    pipeline change), `PIPELINE_RESEARCH.md`, `WRAPUP.md` (v1 end state).
  - **Look (current): `look/DIRECTION.md` (the one page; read it first), `look/CRAFT.md` (numbers, code, checks),
    `look/STORYBOARD_STYLE.md` (the G3 board), `look/CINEMATIC_GUIDE.md` (shot types, scale cues, the opening),
    `look/COZY_AND_SCALE.md`, `look/LIFE_AND_DENSITY.md`, `look/PALETTE.md` (+ `palettes.json`), `look/research/`.**
  - Per video: `vN/` (`OWNER_NOTES.md`, the core line, the script, the style page, plans; rejected options in
    `vN/archive/`).
  - The channel's brief (every video): `CREATIVE_BRIEF.md` (the owner's master brief; its banner lists the later
    owner rules that update it).
  - Brief and story (v1): `BRIEF.md` (the v1 project brief; history), `script/` (all script versions, critiques, the
    fact sheet and sources; `final_script.md` is the one used), `timing.md` (word timings), `storyboard_v3.md` /
    `.json` (v1's shot plan).
  - Look and motion (v1-era, HISTORY: the engine API and the reference measurements, each with a banner; never brief a
    lane from their look): `style_bible.md` (from reference 1), `style_bible_ref2.md` (reference 2: scale and
    full-bleed), `motion_spec.md` (the reference's animation language, measured; evidence in `motion_evidence/`),
    `ENGINE.md` (scene engine cheat-sheet: the API), `CINE.md` (cinematic-scale kit; not clean-pen-aware), `EDGES.md`
    (paper edges), `mascot.md`, `SHARED_SETS.md` / `SHARED_PROPS.md` (v1's world kit), `QA.md`.
  - Sound: `sound_plan.md`, `sound_credits.md` (v1's; each film makes its own music and sound: playbook).
  - v2: `v2/` (the v2 session's; `v2/source_bbc_2026-10-21.md` is the source text).

## 7. The reference material the owner sent

| When (UTC) | File | What the owner said | Where we used it |
|---|---|---|---|
| 10-24 13:20 | `video/assets/ref/reference.mp4` (reference video 1) | "look at this video reference extract the style, animation, fluidity, motion design" | the core style; `docs/style_bible.md`, `docs/motion_spec.md`, frames in `assets/ref/` |
| 10-24 13:20 | `video/assets/vo.mp3` | the first voice-over ("take the audio and come up with a video") | v1's first script; later rewritten |
| 10-24 14:30 | `video/assets/ref2/reference2.mp4` (reference video 2) + Arcane collage (`context/uploads/inline/2026-10-24_143047_1.jpg` = `assets/ref_cinematic/arcane_collage.jpg`) | "some videos make it feel big and some make it feel small ... this video makes me feel small. My reference is Arcane: cinematic shots always made me feel scale" | `docs/style_bible_ref2.md`, `docs/CINE.md`, the scale scenes (S01, S08, ...) |
| 10-24 15:45 | `video/assets/vo_v2_eleven.wav` + ElevenLabs export options (`inline/2026-10-24_154553_2.jpg`) | "which quality option to pick" | voice v2 |
| 10-24 16:48 | `context/uploads/561bcd7a-ScreenRecording_10-24-2026_17-44-07_1.mov` | another creator's reel on building a motion-design studio with Claude: "would any advice make a noticeable quality difference? syncing cuts to the beat, tracing every frame" | beat-locked cuts, closed-form springs, frame-by-frame critique (QA lane) |
| 10-24 19:04 / 19:13 | `video/assets/vo_v3_draft_take.wav`, `video/assets/vo_v3_final.wav` | the final voice takes | v1 final voice (treated: `audio/vo_clean.wav`) |
| 10-25 14:22-14:26 | `context/uploads/inline/2026-10-25_142243_3.png`, `_142529_4.png`, `_142624_5.png` | Instagram Edit profile, Professional account setup, New reel screen: "what do I put in here" | the posting guidance |
| 10-25 14:33 | `context/uploads/inline/2026-10-25_143321_6.jpg` | "I don't like this white part at the top of the reel; looks like it was screen recorded" | removed the top paper edge; playbook rule |
| 10-25 16:19 | `context/uploads/5c49279a-ScreenRecording_10-25-2026_16-18-22_1.mp4` | "check out the text capture. Is it intentional effect?" (captions clipping as they roll in) | playbook: pop captions |
| 10-25 16:46 | `context/uploads/inline/2026-10-25_164635_7.png`, `_8.png` | Instagram insights after about 30-45 min | Performance log, hook rules |
| 10-25 19:55 | `video/docs/look/palette_refs/1-5.webp` (editorial flat illustrations: WSJ giant, croissant + dog, couple with lights, autumn walk, confetti) | "let's play with the colour palettes ... I love our soft, warm, no screaming colours ... the background is very similar to ours, but some details have a bit more contrast" | `video/docs/look/PALETTE.md` + `palette_family.png` (a family of 8 house palettes: v1, v1.1 polish, 6 sisters; DNA rules; pick per video, expand when needed), playbook Visual style |
| 10-25 ~20:10 | `video/docs/look/texture_refs/autumn_walk_detail.png` (crop of palette ref 4) | "I only really like these very subtle texture pieces and the black outlines, VERY subtle but in key places; test it in production" | `video/docs/look/PALETTE.md` "Texture and lines" (spec and test plan), playbook Visual style; test at G4 |
| 10-25 17:32 | `context/uploads/inline/2026-10-25_173226_9.jpg` (= `video/docs/look/ref_sense_of_enclosure.jpg`) | "Sense of Enclosure": coziness as a visual twist; keep Arcane-like scale | queue item 2 |
| 10-26 ~22:50 | `video/docs/look/ref_animated_sketchbook.png` (an urban sketcher's notebook: loose ink street scenes, dense with scribbled suggestion) | "the sketch stage ... frankly the most important stage ... close to final version of the story, transitions, animations, camera movements ... details ... as placeholders ... like an animated sketchbook ... the closest signal to the final story in as little time as possible" | `video/docs/G3_ANIMATIC.md` (the new G3 stage spec), playbook Storyboard rules, STORYBOARD_STYLE / PIPELINE_V2 / G5_BLOCKING / CLAUDE.md updates |

Other screenshots in `context/uploads/` (`*-image.png`) are the same Instagram screens as uploaded files.

## 8. What we produced

| File | What |
|---|---|
| `video/deliverables/v1/php2shell_final.mp4` | **v1 final**, as posted (80 MB master, CRF 14) |
| `video/deliverables/v1/php2shell_final_soundtrack.mp3` | its soundtrack, sent separately when the owner thought the video had no sound (it was a muted preview) |
| `video/deliverables/v1/hook_v1.mp4`, `hook_v2.mp4` | the first-10-s hook passes shown to the owner during hook polish |
| `video/deliverables/v1/preview_v1.mp4` | the first full low-res preview (2026-10-25 08:20) |
| `video/deliverables/cover.png` | the cover frame (1.8 s, "shut down") |
| `video/deliverables/profile/*.png` | profile pictures: Pip with the power-button sun (in use), sun, trumpet, peek; `preview_round.jpg` shows them cropped round |
| `video/review/`, `video/docs/*.png` | review sheets, the mascot sheets, shared-sets sheet, cinematic demo |
