# Video 4: the owner's notes on THIS video

Concrete notes on this one video: picks, lines, takes, shots. Approach-level lessons drawn from them live in
`docs/OWNER_PLAYBOOK.md` (linked as "-> rule"). Newest at the bottom. Format: date, gate: what the owner said -> what we did.

## Topic, core line, script, voice
- 2026-10-27, G0: "research another video topic starting with step 1; the topic must not include Anthropic as the key
  entity" -> hard exclusion in the G0 scouting workflow (`context/workflows/v4-g0-topics-*.js`).
- 2026-10-27, G0: on round 1's top 3 (gas tanks, commute to Zoom, padlock key 4): "lets focus on tech and AI related
  news" -> round 1 archived (`archive/G0_TOPICS_round1.md`), round 2 scouts tech and AI beats only; round 1's tech
  candidates carried into round 2's judging. -> rule: Taste signals (topics).
- 2026-10-27, G0: picked round 2's B, AI songs and the shared royalty pot, over the recommended A (Spotify family QR):
  "i like B actually - i think there is good amount of fuss about AI songs". -> rule: Taste signals (topics).
- 2026-10-27, G0.5: "lets pause for now. lets make sure the other session finishes its work" -> the G0.5 run (facts +
  core line) stopped before any agent finished; relaunch it unchanged when the owner says go.
- 2026-10-27 ~22:35 UTC, G0.5: "okay lets continue with the video 4 production" -> resumed in session
  https://claude.ai/code/session_01XBbv5cud3NnzxxSLqPjWNt (branch `claude/busy-lovelace-83r39e`, the v4 branch merged
  into it); G0.5 relaunched with the same stages and briefs, run as max-effort subagents (that session has no Workflow
  tool). The voice key `ELEVENLABS_API_KEY` is not set in that session: the owner was told before G2.
- 2026-10-27 ~22:45 UTC, G0.5: "remember to use max effort in the subworkflows and agents work" -> confirmed: this
  session runs at effort_level max (get_session) and every G0.5 agent is launched with effort max; the reusable workflow
  templates had no effort setting, so they now pass `effort: 'max'` on every agent() call. -> rule: Process (effort).
- 2026-10-27 ~22:50 UTC: "make sure to persist this rule in general in our repo - like all delegated work should be max
  effort" -> the repo enforces it: a PreToolUse hook (`.claude/settings.json`, `.claude/hooks/max_effort.py`) denies an
  Agent call, a Workflow run or a helper session that isn't at max; the same tool lints and fixes workflow scripts
  (all 82 in `context/workflows/` fixed: 199 calls); CLAUDE.md, playbook, PIPELINE_V2 and HANDOFF updated.
  -> rule: Process (effort).
- 2026-10-27 ~22:50 UTC: "i don't remember us setting the explicit secret key in the other chats - i think it just
  worked somehow - can you dig up the repo" -> found in HANDOFF's 26 Oct log (2c update, ~19:30 UTC): the owner pasted
  the key into the video 2 chat; that session used it inline only (never stored), so every later session lacked it.
  Owner: "let me know how to setup the elevenlabs key - lets actually do it here" -> steps given: a new restricted key
  (Text to Speech + Voices read, credit limit), delete the pasted one, store it as the environment's network secret
  `ELEVENLABS_API_KEY`; a new session (a helper in the same environment) sees it.
- 2026-10-27 ~22:50 UTC: the owner pasted the ElevenLabs key they had created before ("this is the key i already
  created before ...") -> not repeated, filed or put in any prompt; the chat export's redaction
  (`context/scratchpad_tools/export_context.py`) missed a bare 64-hex string, so it now redacts hex runs of 48+
  characters. The API showed it was the key's ID, not the key (`api_key_id_used_as_api_key`: keys start with `sk_` and
  are shown only when created or rotated), so it is not a secret and can't authenticate. -> `docs/voice/API_QUICKSTART.md`
  setup note. Owner: "its fine if it works only in this chat" -> the voice step may use a key in this session only; the
  owner rotates the key (or makes a new one) to get the `sk_...` value; the recommended home is the environment's
  network secret `ELEVENLABS_API_KEY` (a helper session in the same environment sees it).
- 2026-10-27 ~22:55 UTC: "make sure to commit the progress periodically if we get stopped on the usage limits" ->
  `video/scripts/autocheckpoint.sh` runs in the background on v4's paths (a commit and push every 10 minutes when they
  changed), on top of a commit after every agent; agents write their output file early. -> rule: Process (limits).
- 2026-10-27 ~23:05 UTC: "yes merge it into video-production" -> v4's branch (with the max-effort hook, the
  auto-checkpoint and the earlier v4 branch's rhythm rule) merged into `video-production`; v4 keeps syncing there.
- 2026-10-28 ~03:30 UTC: the 5-hour limit hit during the line writers; owner: "I hit my usage limit while you were
  working, but it has reset now. Please continue from where you left off." -> the three finished writers' lines saved
  from their transcripts and committed; the three stopped writers resumed from their transcripts (SendMessage), each now
  writing its result into `core_line/writers/`; the auto-checkpoint loop had ended at its 2-hour cap, so the rule now
  leans on agents writing files plus a commit at every step. -> rule: Process (limits).
- 2026-10-28 ~11:05 UTC, after the G0.5 top 3 (AI songs): "thinking more about the topics we research and pick. I think
  we should alternate between positive and more negative topics. I think so far we mainly had negative topics like
  prices of laptops going up, google scandal. I am thinking if we should focus on something very recent, extremely
  relevant yet very positive around AI. like AI is helping to find medication or solve some disease, i think having a
  nice positive outlook would be the right direction for a story" -> rule: Taste signals (alternate the mood); G0
  round 3 scouts very recent POSITIVE AI stories (`scouting_r3/`, top 3 in `G0_TOPICS_r3.md`); asked whether it
  replaces AI songs as video 4 (AI songs parked with its research and core line) or becomes video 5.
- 2026-10-28 ~13:25 UTC: asked whether the positive AI story replaces AI songs as video 4 or becomes video 5; owner:
  "Switch video 4 (Recommended)" -> AI songs parked whole in `archive/ai_songs/` (README says how to resume; listed in
  `docs/IDEAS_BANK.md`); video 4 restarts at G0 round 3 (positive AI), whose five scouts had died at the usage limit
  before writing anything.
- 2026-10-28 ~14:25 UTC: "no we only use the budget in this session for the video 4 ... so lets do a few stages only -
  lets scout for the most relevant story, then write a script and generate the sound. That is our goal here"; "no i mean
  we are spending all tokens here only on the video 4. these tokens we have here are not shared with other videos";
  and asked to find the waste in the early stages ("30% of the weekly budget" spent) -> cost review
  `docs/retro/2026-10-28_v4_early_stage_cost.md`; v4 now runs the lean G0-G2: 2 scouts + 1 editor (topic and core line
  picked together), one fact lock, writer + critic for the script, the voice through the API. -> rule: Process (lean).
- 2026-10-28 ~14:40 UTC: "i mean if you identify any real inefficincies and redundancies and waste on tokens - update
  the process / clean up - so that the next videos are not encountering the same issues" -> applied: PIPELINE_V2 (lean
  G0-G1 defaults, agents report in files, one fact file), playbook, CLAUDE.md, HANDOFF, heavy templates marked; list in
  the review's "Applied" section. -> rule: Process (spend on the film, never on overhead).
- 2026-10-28 ~15:00 UTC, on round 3's top 3 (the AI hurricane forecast, the AI-designed phage, cancer in "normal"
  scans): "no too narrow, lets research some more - expand it to AI adjacent news" -> round 4 (lean): two scouts on
  positive AI-adjacent news (science, health and space; machines and everyday tech), round 3's candidates kept in the
  pool, one editor over both rounds -> `G0_TOPICS_r4.md`. -> rule: Taste signals (topics: AI-adjacent counts).
- 2026-10-28 ~16:10 UTC, on round 4's top 3: "one important condition for the story pick is we should find a story that
  is going to be possible to make visually appealing. Like evaluate each one from that point on. And give me the list
  of criteria you are choosing the story based on" -> `docs/TOPIC_CRITERIA.md` (visual appeal and truth are musts);
  visual scores in `G0_TOPICS_r4.md`: glasses 9, hurricane 8, vaccine 6; recommendation moved to the glasses.
  -> rule: Taste signals (visual appeal is a pick condition).
- 2026-10-28 ~16:25 UTC: "lets make it relevant first but include buzz here too and surprise, then true and solid, then
  fresh, then visually appealing, then mood. Then shareabliity potential" -> `docs/TOPIC_CRITERIA.md` rewritten in that
  order (weights 6-5-4-3-2-1); re-ranked: vaccine 8.2, glasses 7.7, hurricane 7.2 (`G0_TOPICS_r4.md`).
  -> rule: Taste signals (the owner's order).
- 2026-10-28 ~16:35 UTC: "reevaluate the stories based on that - all N stories you researched" -> all 23 candidates of
  rounds 3-4 re-ranked from the editors' scores in the owner's order (`G0_TOPICS_r4.md`, last table).
- 2026-10-28 ~15:50 UTC: "can you show me the visual next time we do research - like the story and some bar chart or
  something showing the score on each category" -> `video/scripts/topic_chart.py` (one block per story, a bar per
  criterion, the weighted total); a sample from this round: `topic_chart.png` (data `topic_scores.json`). -> rule:
  Taste signals (the shortlist comes with its chart); PIPELINE_V2 G0.
- 2026-10-28 ~15:51 UTC: "lets move the freshness lower and make it last month or so" -> order now relevant, true,
  visual, mood, fresh (about the last month), shareable; re-ranked: the glasses 8.34, the vaccine 8.32 (tied), quake
  alerts 7.81, the hurricane 7.76, "could they hear you?" 7.68. -> rule: Taste signals; CREATIVE_BRIEF banner.
- 2026-10-28 ~16:52 UTC (with the two notes above re-sent): "make the visual into column chart and read the latest
  update in our repo - we committed an updated learnings from the video 3" -> `topic_chart.py` draws one column per
  criterion (the most important on the left, the value above, the short label below); v3's lesson read (playbook,
  Audience and goal: never baity; v3's ad-like opening, 64.5 % skipped) and applied to the shortlist (`G0_TOPICS_r4.md`,
  "Ad or news?"): the glasses' line read like an ad (a testimonial plus a feature demo) and is reworded as news; the
  vaccine, hurricane and ICU lines pass; quake alerts are a phone-feature launch. -> rule: playbook Taste signals (the
  column chart); TOPIC_CRITERIA (the ad-or-news check).
- 2026-10-28 ~17:21 UTC: "maybe one thing we can do is something about the new model released?
  [blog.google/innovation-and-ai/models-and-research/gemini-models/introducing-gemini-4-carbon/] like if there is
  something geniunely interesting and easy to get for people? also what about this news?
  [blog.google/innovation-and-ai/models-and-research/google-deepmind/synthid-time-best-inventions/]" -> both read and
  scored (`G0_TOPICS_r4.md`, "Two owner-suggested candidates"): SynthID 7.48 (anyone can check a picture; very
  drawable; but it finds only Google's own marks, the peg is an award, the counts are Google's); Gemini 4 Carbon 5.90
  (not for people yet: cyber defenders first; Google's own benchmarks; a launch reads as an ad).
- 2026-10-28 ~21:25 UTC (the topic question unanswered): "i want you to do something else - i want you to focus on the optimizing the codebase and streamlining the process. So each video does take a while to create and takes a lot of tokens. ... we MUST not sacrifice the quality of the video, we MUST not sacrifice the details and overall look and feel, but we need to brainstorm and find a way to streamline the process IF THERE is obvious ways" -> v4 paused at the topic pick (the shortlist, its
  column chart and the reworded lines wait in `G0_TOPICS_r4.md`); this session runs the streamlining review
  (`docs/retro/2026-10-28_streamline/`: three reviewers, tokens / render / codebase, then one plan for the owner). ->
  rule: playbook Process ("Spend on the film, never on overhead": streamline the process, never the film).

## 2026-10-29: the topic picked (in the city-poster content discussion, session https://claude.ai/code/session_01YGLGMrgF1Cfg5gMAND1VNt)
- 2026-10-29 ~07:45 UTC: "Oh I actually like the story of Helsinki hitting homes with ai chips" (the heat story; then video
  5, rejected as too wide, re-scoped to the bunker).
- 2026-10-29 ~09:30 UTC: "Helsinki is actually pretty good too / Let's do both as story 4 and 5" -> video 4 = Helsinki's AI-heated homes, produced by session
  https://claude.ai/code/session_01YGLGMrgF1Cfg5gMAND1VNt; the writer started.
- 2026-10-29 ~10:00 UTC, G1: "alright pull the latest state of the repo, get familiar with the latest context and lets
  work on the video 4 - pick up where its been left off" -> session https://claude.ai/code/session_01VwsUCnkJXFuq3YwEYFUg7o
  (branch `claude/kind-pascal-lvgsza`) runs G1 from `script/WRITER_BRIEF.md`: writer, critic (`script/CRITIC_BRIEF.md`),
  fix pass; the owner was asked to add `ELEVENLABS_API_KEY` as the environment's network secret before G2.
- 2026-10-29 ~10:20 UTC, G2 prep: the owner sent "eleven labs key" with a 64-character hex string -> one test call:
  the API answered `api_key_id_used_as_api_key` (it is the key's ID, not the key, as on 2026-10-27; not filed
  anywhere); the owner was asked for the value that starts with `sk_`, stored as the network secret
  `ELEVENLABS_API_KEY` (`docs/voice/API_QUICKSTART.md` now names both).
- 2026-10-29 ~10:20 UTC, G2: "lets try another voice - with this id MQnUCZUAQLYMCY1Ztz6d" -> v4's take uses voice
  `MQnUCZUAQLYMCY1Ztz6d` (`docs/voice/VOICE.md`; checked with `GET /v1/voices/<id>` once a valid key exists).
  -> rule: playbook, Script and voice (the voice is the owner's pick per film; their cloned narrator by default).
