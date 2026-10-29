# Video 4: TOPIC PICKED 2026-10-29: Helsinki heats its homes with AI chips

**Owner, 2026-10-29 ~09:30 UTC: "Helsinki is actually pretty good too / Let's do both as story 4 and 5".** Video 4 is now Helsinki's AI-heated homes (one subject, the playbook's ONE
SUBJECT rule) and is **produced by session https://claude.ai/code/session_01YGLGMrgF1Cfg5gMAND1VNt** (branch `claude/compassionate-hopper-5iqguj`); video 5 is the
bunker under the Stockholm park (`video/docs/v5/`). The earlier session's G0 rounds below (r1-r4 shortlists, scouting,
the glasses and the vaccine) stay here unchanged as history; nothing in them was rejected (their topics go to
`docs/IDEAS_BANK.md` when this film is done).

| Gate | Status | File |
|---|---|---|
| G0 topic + core line | topic LOCKED: Helsinki (one city); core line proposed by the writer (default: "Your chatbot could heat a flat in Helsinki.") | `G0_TOPIC.md` |
| Fact lock | shared with video 5 (one fact file): `video/docs/v5/research/factlock.md` sections 2, 6, 7.1-7.4, 8 | |
| G1 script | writer running (2026-10-29 ~09:35 UTC); then one critic and one fix pass | `script/script_g1.md`, `script/script_elevenlabs.md`, `THROUGHLINE.md` |
| G2 voice | after the owner approves the script; the API key is missing in this container | `public/v4/` |

**Next step:** when the writer lands, send the owner the script with its 3 hook options and core lines; then a critic and
a fix pass. A self check-in at 12:45 UTC resumes it if the 5-hour limit (reset 12:40 UTC) stops it.

---

# Video 4: state and pick-up notes (TOPIC SWITCHED 2026-10-28: a positive AI story)

For the agent who picks this up later. Read this file first, then `HANDOFF.md` (root), `video/docs/OWNER_PLAYBOOK.md`
and `video/docs/PIPELINE_V2.md`.

## Who runs it now
- The owner, 2026-10-27 ~22:35 UTC: "okay lets continue with the video 4 production" (it was paused at ~14:40 UTC so the
  v2 and v3 sessions could finish first; they were still in flight when it resumed, and they share the weekly limit).
- Session: https://claude.ai/code/session_01XBbv5cud3NnzxxSLqPjWNt, git branch **`claude/busy-lovelace-83r39e`** (the
  earlier v4 branch `claude/tender-bardeen-j7duak` is merged into it, with `video-production` as of 22:30 UTC). Merged into
  `video-production` on 2026-10-27 ~23:05 UTC (owner: "yes merge it into video-production"): v4 work is committed on the
  session branch, then pulled and pushed to `video-production` at each step, like the other films.
- The earlier session (G0, the pause): https://claude.ai/code/session_014PwCXHBSouhcawFp12X9sT.
- Checkpoints: agents write their results into `video/docs/v4/...` files; a commit after every agent and at every
  turn's end; `video/scripts/autocheckpoint.sh claude/busy-lovelace-83r39e video/docs/v4` for a long unattended build
  (a background job lives at most 2 hours). The 5-hour limit hit on 2026-10-28 ~01:30 UTC (reset 03:30): three writers
  were resumed from their transcripts; three finished writers' lines were saved from their transcripts.

## Status by gate
**PAUSED at the topic pick (2026-10-28 ~21:25 UTC):** the owner switched this session to the streamlining review ("i want
you to do something else"; `docs/retro/2026-10-28_streamline/`). The pick waits: `G0_TOPICS_r4.md` (the glasses and the
vaccine tied at 8.3; the glasses' line reworded as news; SynthID 7.5 and Gemini 4 Carbon 5.9 added), `topic_chart.png`.

| Gate | Status | File |
|---|---|---|
| G0 topic + core line | **Shortlist and chart sent; waiting on the owner's pick** (2026-10-28 ~17:00 UTC). Rounds 3 (positive AI) and 4 (AI-adjacent, owner: "expand it to AI adjacent news") ran lean (2 scouts + 1 editor each). All 23 stories re-ranked in the owner's order (`docs/TOPIC_CRITERIA.md`: relevant with buzz and surprise, true, visual, mood, fresh = about the last month, shareable). Top: the glasses 8.34 and the vaccine 8.32 (tied; the tie-break, a real person in his own words, favours the glasses), quake alerts 7.81, the hurricane 7.76, "could they hear you?" 7.68 | `G0_TOPICS_r4.md` (top 3 with core lines, every table), `topic_scores.json`, `topic_chart.png` |
| Fact lock | after the pick: one agent, the only web check | `research/factlock.md` |
| G1 script | after the fact lock: writer + critic + one fix pass | |
| G2 voice | after the owner approves the script: the API (`docs/voice/API_QUICKSTART.md`) | `public/v4/` |

**Parked, not rejected: AI songs and the shared royalty pot** (G0 + G0.5 complete, top 3 core lines truth-checked, no
pick made): `archive/ai_songs/` (its README says how to resume), listed in `docs/IDEAS_BANK.md`.

## The owner's rules for THIS video (all in `OWNER_NOTES.md`)
- Anthropic must not be a key entity.
- Focus on tech and AI news; this round a genuinely POSITIVE AI story (a medicine, a disease, earlier diagnosis, a
  public good), with a hopeful outlook and the same standards as any story: what AI did and didn't do, trial stage,
  peer review, who benefits and when (playbook "Taste signals": alternate the mood).
- AI-adjacent news is in scope (2026-10-28); stories are picked in the owner's order (`docs/TOPIC_CRITERIA.md`).

## Next step: the owner's pick, then the lean G0-G2 (`docs/PIPELINE_V2.md`)
The owner's goal for this session: "lets scout for the most relevant story, then write a script and generate the sound."
1. Lock the pick as `G0_TOPICS.md` (the topic, its core line, a through-line card draft); update this file.
2. Fact lock: one agent (Agent tool, `effort: max`), from the editor's sources in `G0_TOPICS_r4.md` and the scouting
   files, into `research/factlock.md`. Every later check reads it and searches only for a fact it lacks.
3. G1: one writer (two spines, picks one, the script with cues; `check_rhythm.py` and `check_paste.py` OK), one critic
   (a cold retell, flow, facts against the fact file, at most 6 findings), one fix pass. The owner approves the script
   and the through-line card.
4. G2: the voice through the API. **The key:** this container has no `ELEVENLABS_API_KEY`. The owner stores the real
   secret (it starts with `sk_`; the 64-hex string pasted on 2026-10-27 was the key's ID) as the environment's secret; a
   new session in the same environment sees it (a helper session's first prompt is exactly `/effort max`). Lock the take
   into `public/v4/` and log it in `ELEVENLABS.md` section 5.

**Craft tooling lane** (`docs/PIPELINE_V2.md`): owned by the session running v4, must land before v4's G3; G0-G2 never
wait for it; schedule it against the weekly limit.

## Files in this folder
- `archive/ai_songs/`: the parked first topic, complete through G0.5.
- `scouting_r3/` + `G0_TOPICS_r3.md` (round 3, positive AI) and `scouting_r4/` + `G0_TOPICS_r4.md` (round 4,
  AI-adjacent; the full re-rank). `topic_scores.json` and `topic_chart.png` (drawn by `video/scripts/topic_chart.py`).
- `OWNER_NOTES.md`: every owner note on v4, verbatim, with what we did.
- `archive/G0_TOPICS_round1.md` (gas tanks, commute to Zoom, padlock key 4) and `archive/G0_TOPICS_round2_options.md`
  (the tech/AI top 3 with score table and runner-ups). No prompt reads the archive.
- `scouting/` (round 1, all beats) and `scouting_r2/` (round 2, tech + AI): every scouted candidate with sources.
- Workflow scripts: `context/workflows/v4-g0-topics-*.js`, `v4-g0-topics-tech-*.js`, `v4-g05-facts-and-core-line-*.js`.
- Unused topics went to `video/docs/IDEAS_BANK.md`.
