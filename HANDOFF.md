# HANDOFF: start here if you are a new agent picking up this project

Written 2026-10-25 ~20:00 UTC by the orchestrating Claude Code session (https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ),
on the owner's request: "upload all the context ... so that I can direct another agent to the repo and it will know ALL the
relevant context, including the reference videos I sent and the ones we produced. It must be as if another agent is the
same as you are here."

Everything that agent knew is in this repo. This file is the map; the details live in the files it points to.

## 0. Read in this order (about 30-45 minutes of reading; worth it)

1. **This file**, fully.
2. `CLAUDE.md` (root, auto-loaded) and **`video/docs/OWNER_PLAYBOOK.md`**: every piece of owner feedback as a rule.
   It is the memory across videos. Add to it in the same turn whenever the owner gives feedback.
3. **`video/docs/PIPELINE_V2.md`**: how we work from video 2 on (gates G0-G8, a playable video at every gate, where to
   spend tokens and where not to). Background: `video/docs/PIPELINE_RESEARCH.md`.
4. **`context/summaries/compaction_3.md`**: the most recent detailed state summary (written when the context filled up
   for the third time; everything after it is in sections 2-3 below). Then `compaction_2.md` and `compaction_1.md` for history.
5. **`context/conversation/USER_MESSAGES.md`**: every message the owner sent, verbatim, with timestamps. It's the
   fastest way to learn what they want and how they talk. The full thread with the assistant's replies is
   `context/conversation/CONVERSATION_2026-10-24.md` and `..._2026-10-25.md`; every tool call is in `ACTIONS_LOG.md`.
6. As needed: the docs index (section 6), `context/agent_reports/` (what each multi-agent run returned) and
   `context/workflows/` (the workflow scripts with their full agent prompts; reusable).

## 1. Who and what

- **The owner** runs a short-form explainer channel, **"What's All the Fuss About?"**: Instagram
  `what.the.fuss.is.about` (Creator account, Education), with TikTok and YouTube Shorts under the same name. The master
  creative brief is `video/docs/CREATIVE_BRIEF.md`; read it. The core promise: "You've heard about it. Now actually understand it."
- The owner works from a **phone** (Claude app, mobile). They write fast and informally, with typos, and send
  screenshots and screen recordings. They want:
  - short, plain updates;
  - playable video rather than stills;
  - files sent as downloads (in-app previews may play muted).
- They opted into **heavy multi-agent work** ("NO LIMITS on tokens and time", ultracode on). Their latest rule is
  quality first: brainstorms, judge panels and design explorations are worth their tokens, while waste (rework, polish
  before the story is locked, lost work) is not.
- **The assistant's role is orchestrator.** It researches, plans and runs Workflow scripts (writers, judges, builders,
  reviewers), builds the film in Remotion, mixes the sound and delivers. It keeps the playbook, pipeline and docs up to date.

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
  about 80 % of viewers gone by 3 s. The lesson is now a rule: put the payoff in words on frame 0, keep it 30-45 s, and
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

## 2b. Update 2026-10-25 20:00 UTC: two agents, split by video

- **Video 2 (Google DeepMind resignations) is produced by session https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ**
  (the original session; the owner said "continue with video 2" at 20:20 UTC). The video 3 session does not touch `video/docs/v2/`
  or the v2 queue item below.
- **Video 3 is produced by session https://claude.ai/code/session_01K4EiJphpZBfCkniV3UU3wR.** It is at G0 (topic
  scouting): workflow `context/workflows/v3-g0-topics-wf_b78a4844-2b3.js` writes `video/docs/v3/scouting/*.md` and
  `video/docs/v3/G0_TOPICS.md` (top 3 fresh topics for the owner to pick).
- **v3 status (2026-10-26 ~19:30 UTC): G3 LOCKED** (board with cinematography, commit 14bfa55; owner: "okay fine, go ahead").
  **G5 blocking RUNNING** as `context/workflows/v3-g5-blocking-wf_8387753a-5af.js`: engine (entry `src/entry-v3-film.tsx`,
  composition Film3 at 60 fps, panels in `src/v3/film/scenes/` that start as board placeholders) + Autumn Ember kit
  (`src/v3/film/kit/`, `palette.ts`), then 6 panel lanes, then one assembler (gate check, continuity fixes) writing
  `deliverables/v3/v3_g5_blocking.mp4`. Generic how-to: `video/docs/G5_BLOCKING.md`.
- **v3 status (2026-10-26 evening):** script + voice (take 4, `assets/v3/take4_clean.wav`) and palette (Autumn Ember,
  `docs/v3/LOOK.md`) locked. G3 animatic: monochrome board style (`public/v3/animatic.json`, render
  `deliverables/v3/v3_g3_animatic_board.mp4`, panel table `docs/v3/storyboard_g3.md`); the owner can follow the story and
  asked to (1) put the cinematography back (cozy home base, scale reveal, Arcane learnings) and (2) replace the opening's
  "data center consumes the houses" with a literal view; running as `context/workflows/v3-g3-board-cine-*.js`. Rules
  learned today: playbook "Storyboard (G3)", `docs/look/STORYBOARD_STYLE.md` (sections 0 and 7), `docs/look/CINEMATIC_GUIDE.md`
  (environment shot types + "The opening"), 60 fps production, `docs/ELEVENLABS.md`. Older status below.
- **v3 status (2026-10-26 ~11:30 UTC):** script LOCKED (story-first rewrite, `docs/v3/script/script_g1.md`); the owner is
  regenerating the ElevenLabs take from `docs/v3/script/script_elevenlabs.md` (check it with `scripts/voice/check_take.py`);
  working voice `assets/v3/take2_clean.wav` -> `public/v3/voice.wav` + `voice_words.json`; G3 animatic workflow
  `context/workflows/v3-g3-animatic-*.js` writes `public/v3/animatic.json` (render: `npx remotion render src/entry-v3.tsx Animatic`).
  Look bible done (`docs/look/COZY_AND_SCALE.md`); waiting for the owner's Arcane screen recording (measure with
  `scripts/look/measure_camera.py`, keep the clip out of git). Earlier status, now superseded:
- **v3 status (2026-10-25 23:00 UTC):** topic locked (`docs/v3/G0_TOPICS.md`), core line locked at the new G0.5 step
  ("AI is making your next laptop pricier", `docs/v3/CORE_LINE.md`), G1 script `docs/v3/script/script_g1.md`, radio cuts
  `video/deliverables/v3/v3_g1_radio_h{1,2,3}.mp4` sent, waiting for the owner's hook pick and word notes. Rejected
  options live in `docs/v3/archive/` (no prompt reads it). Tooling: `src/entry-v3.tsx` (RadioH1-3, Core1-3),
  `scripts/v3/build_radio.py` (stand-in TTS Kokoro: kokoro.onnx + voices.bin from the kokoro-onnx GitHub release
  model-files-v1.0, `pip install kokoro-onnx`).
- Both push to `video-production`: pull before pushing, and keep each video's files in its own `docs/vN/` folder.

## 2c. ElevenLabs automation (owner, 2026-10-26)

The owner is connecting ElevenLabs so we can generate takes ourselves. Guided steps:
1. A restricted API key: Text to Speech + Voices read, with a credit limit.
2. Stored as the environment secret **`ELEVENLABS_API_KEY`** (cloud environment → Edit → Network secrets). A new session
   picks it up.
3. The voice ID: the owner sends it in chat. Store it in `video/docs/voice/VOICE.md` (not a secret).

`api.elevenlabs.io` is reachable from the container. The plan and settings come from the root-cause workflow
(`context/workflows/elevenlabs-clean-takes-*.js` → `video/docs/voice/PROPOSAL.md`):
- generate per line or paragraph with the owner's voice and the newest model;
- check each part with `scripts/voice/check_take.py` and auto-regenerate any mismatch;
- stitch the parts and deliver one clean take.

Never print the key, and never commit it or put it in a file.

## 3. The queue (in order) at handoff

1. **v2: core line LOCKED 2026-10-26 (A: "She quit Google, and says her contract bans criticizing it, for life.", `video/docs/v2/CORE_LINE.md`; options in `docs/v2/archive/`). G1 script DONE 2026-10-26 ~17:00 UTC** (`docs/v2/script/script_g1.md`, 113 words, ~43 s; paste file `script_elevenlabs.md`, paste-safe; hook variants H1-H3 in script_g1.md). **Take 2 (2026-10-26 17:55) is CLEAN**: `video/assets/v2/take2_clean.wav` (38.96 s, matches the script; the lean paste format worked first time), word timings `take2_clean_words.json`. Take 1 and its cleaned version stay in `assets/v2/`. **Voice LOCKED by the owner (G2, 2026-10-26 ~18:20 UTC):** `public/v2/voice.wav` (take 2 + 0.12 s lead), `public/v2/voice_words.json`. **G3 animatic RUNNING** (entry `src/entry-v2.tsx` Animatic → `public/v2/animatic.json`, shared SketchReel board style). Started 14:40 UTC (the owner: "let's start working on the second video"). Video 2 follows the v3 process: the topic is picked; the old G0 "angles" step is folded into the core line.
   - Workflow: `context/workflows/v2-g0-facts-and-core-line-wf_fad013d0-cfd.js`.
   - Steps: research (industry, guardrails; timeline already done) → `video/docs/v2/research/factlock.md` → G0.5 core line (6 lever writers, 4 judges, 4 viewer personas, 2 sceptics per finalist) → `video/docs/v2/CORE_LINE.md` (top 3) → truth check.
   - Next: the owner picks the core line; archive the rest (locked-means-dropped); then G1, the story-first script (template `v3-g1-story-*.js`).
2. **DONE 2026-10-26 (v3 session): `video/docs/look/COZY_AND_SCALE.md` + `video/docs/look/research/`. Waiting for the owner's Arcane screen recording to measure (section 8). Was: RUNNING since 2026-10-26 00:10 UTC (owner engaged again via the Arcane idea and said "continue"; don't duplicate): `context/workflows/look-cozy-scale-arcane-wf_e8c65891-2ba.js` (palette rule merged in, covers v2 and v3). It replaces the paused `look-cozy-and-scale-wf_ee30e562-0c7.js`. Research the "cozy + scale" look** (owner, 2026-10-25 17:32). Output `video/docs/look/COZY_AND_SCALE.md` plus `video/docs/look/research/*.md`. It must also follow the palette direction in `video/docs/look/PALETTE.md` (owner, after the pause).
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
   - Apply it from v2's G1 radio cut on: the hook comes with its sound.
   - Our SFX are synthesized in `video/audio/tools/make_sfx.py`, so there are no licence issues. Design a "like pop /
     notification ding / message-sent swoosh" family that evokes those sounds, rather than copying Apple's or
     Instagram's actual sounds.
6. **Optional, not yet approved:** the tooling list in PIPELINE_V2 (`npm run preview`, a draft flag, a SketchReel comp
   from JSON, a hook segment, a scripted gate check). Build it when video 2 reaches G1/G3, or earlier if the owner says so.
7. **When the owner shares more insights** for v1 (next day), add them to the playbook's Performance log.

**Reels quality research** (2026-10-25; from guides and community sources, since Instagram publishes no exact encoder specs):

- **In the app:** Instagram → Settings and activity → Data usage and media quality → **"Upload at highest quality" ON**,
  data saver off, upload on strong Wi-Fi.
- **TikTok:** on the Post screen → More options → **"Allow high-quality uploads"** ON.
- **The file:** 1080x1920, 30 fps, H.264 High, SDR BT.709, AAC 48 kHz. Ours is about 11.6 Mbps (CRF 14), which is fine;
  the consensus range is 8-15 Mbps. 4K uploads don't help on Reels (it stores 1080 wide) and add compression risk.
- **YouTube Shorts is different:** uploads above 1080p get the better VP9/AV1 encodes. Our film is vector (SVG), so a
  1440x2560 render (`--scale=1.3333`) is genuinely sharper. Render one for YouTube.
- **Getting the file to the phone:** download the original (AirDrop, Files, Drive). Not via WhatsApp/Messenger, which
  recompress it.
- **In Instagram's editor:** don't apply filters or edits.
- **After posting:** judge the quality after about 10-15 minutes, once processing finishes.
- **Design for compression:** fine full-frame grain and 1-px lines smear and band. Our flat-colour style compresses well.
- **Sources:** revid.ai/blog/ig-reels-resolution, stayabundant.com/blog/best-instagram-reels-export-settings,
  creativecow.net (4K vs 1080 thread), provideocoalition.com/uploading-to-youtube-is-4k-worth-it,
  vidiq.com/blog/post/youtube-shorts-vertical-video, clipspeed.ai/blog/high-quality-tiktok-uploads.html.

## 4. Rules of engagement (from the owner and from how this session ran)

- **Git:**
  - Branch **`video-production`** (it is the repo's default branch).
  - Commit and push after every meaningful step: `git add -A video context` plus root files, then
    `git push -u origin video-production`.
  - **Every commit message ends with these two lines**:
    ```
    Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>
    Claude-Session: https://claude.ai/code/session_01BGZ47aBhF9yKpEaeiLeCPQ
    ```
    The second line names the original session. A new session gets its own attribution lines from its harness; use those.
  - No model identifiers in files, code comments or commit text beyond those lines. No pull requests unless asked.
- **The repo is PUBLIC** (github.com/devilsanek1/Test-). The owner's email is redacted from every export; never write it
  into a file.
- **Owner feedback:** record it in `video/docs/OWNER_PLAYBOOK.md` in the same turn, as a rule with the date and reason.
- **Show playable video at every gate**, and send video files with SendUserFile as downloads. Give the owner the script
  text with any new voice take.
- **Final means final:** log new ideas for the next video instead of redoing a delivered one.
- **Progress updates:** short, about every 30 minutes, covering all threads. Between gates, one line.

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
- **Commands (from `video/`):**
  - Final render: `npx remotion render src/entry-film.ts Main out/X.mp4 --crf 14`. Then convert to TV range:
    `ffmpeg -i out/X.mp4 -vf "scale=in_range=full:out_range=tv,format=yuv420p" -c:v libx264 -crf 14 -preset slow -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -c:a copy -movflags +faststart out/X_tv.mp4`.
    Remotion's output is full-range yuvj420p, which some players show wrongly.
  - Stills, strips and dev comps: `node scripts/render-frames.mjs`, `scripts/still.sh`, `scripts/strip.sh` and
    `scripts/sheet.sh`. The dev comps are in `src/dev/registry.ts`.
  - Sound: `python3 audio/mix.py --music cinematic --out audio/mix.wav && cp audio/mix.wav public/mix.wav`
    (cues in `audio/cues.json`, SFX generator `audio/tools/make_sfx.py`, credits in `docs/sound_credits.md`).
  - QA: `bash scripts/qa/run_all.sh Main` (dead frames, frame check, caption check) and `python3 scripts/camspeed.py`.
  - Captions: `src/data/captions.json` (one page per line) plus `src/data/captions.overrides.json`.
- **Gotchas:**
  - A safety hook blocks unguarded `rm -rf $VAR`; write `rm -rf "${D:?}"/"${v:?}"`.
  - `pkill -f remotion` can kill your own shell; use `ps | grep "[r]emotion ..."` and kill by PID.
  - Workflow agents run about 2 at a time on this 4-CPU container.
  - **Usage limits (weekly/monthly) kill agents mid-task** (66 agents were lost on v1). Keep agent tasks small and
    commit after each one. The main loop kept working when agents could not.
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
    - `lib/` holds the engine, edges, mascot, captions and theme;
    - `data/` holds the captions and timing;
    - `dev/` holds the dev comps, including `ProfilePic.tsx`.
  - `assets/` has the reference videos and frames (`ref/`, `ref2/`, `ref_cinematic/`), the VO takes and the timing JSON.
  - `audio/` has the mixer, SFX, music beds, cues and tools.
  - `deliverables/` has v1's final video, cover and profile pictures.
  - `docs/` is all design and process docs, indexed below.
  - `review/` holds review and QA artifacts.
  - `scripts/` holds the render, QA, anchor and caption tools.
- **Docs index (`video/docs/`):**
  - Process: `OWNER_PLAYBOOK.md` (rules from the owner), `PIPELINE_V2.md` (gates, budgets, anti-waste),
    `PIPELINE_RESEARCH.md`, `WRAPUP.md` (v1 end state), `POSTING_KIT.md`, `retro/` (spend forensics).
  - Brief and story (v1): `CREATIVE_BRIEF.md` (the owner's master brief), `BRIEF.md` (the v1 project brief),
    `script/` (all script versions, critiques, the fact sheet and sources; `final_script.md` is the one used),
    `timing.md` (word timings), `storyboard_v3.md` / `.json` (the shot plan).
  - Look and motion (v1): `style_bible.md` (from reference 1), `style_bible_ref2.md` (reference 2: scale and
    full-bleed), `motion_spec.md` (the reference's animation language, measured; evidence in `motion_evidence/`),
    `mascot.md`, `CINE.md` (cinematic-scale kit), `EDGES.md` (hand-drawn paper edges), `SHARED_SETS.md` /
    `SHARED_PROPS.md` (world kit), `ENGINE.md` (scene engine cheat-sheet), `QA.md`.
  - Sound: `sound_plan.md`, `sound_credits.md`.
  - v2: `v2/source_bbc_2026-10-21.md`. Look research: `look/` (the enclosure reference for now).

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
