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
| Gate | Status | File |
|---|---|---|
| G0 topic | **ROUND 3, a very recent POSITIVE AI story** (owner, 2026-10-28: "alternate between positive and more negative topics ... something very recent, extremely relevant yet very positive around AI. like AI is helping to find medication or solve some disease"; asked to switch video 4: "Switch video 4 (Recommended)"). The first five scouts died at the usage limit before writing anything (11:10-13:30 UTC); the weekly limit is at its warning level (resets ~4 Nov 03:00 UTC), so the owner is asked before the relaunch | `scouting_r3/`, then `G0_TOPICS_r3.md` (top 3) |
| G0.5 core line | not started for the new topic | |
| G1+ | not started | |

**Parked, not rejected: AI songs and the shared royalty pot** (G0 + G0.5 complete, top 3 core lines truth-checked, no
pick made): `archive/ai_songs/` (its README says how to resume), listed in `docs/IDEAS_BANK.md`.

## The owner's rules for THIS video (all in `OWNER_NOTES.md`)
- Anthropic must not be a key entity.
- Focus on tech and AI news; this round a genuinely POSITIVE AI story (a medicine, a disease, earlier diagnosis, a
  public good), with a hopeful outlook and the same standards as any story: what AI did and didn't do, trial stage,
  peer review, who benefits and when (playbook "Taste signals": alternate the mood).

## Next step: G0 round 3, then G0.5 for the pick
Round 3 runs as subagents (Agent tool, `effort: max`), each writing its results into `scouting_r3/` as it goes: five
scouts (medicine, diagnosis, science, everyday good, viral good news; briefs in this session's history, the round-2
template `context/workflows/v4-g0-topics-tech-*.js` for the structure), three judges (growth, standards, creative; an
"uplift" score added), a synthesis into `G0_TOPICS_r3.md` (top 3 on one screen) and an adversarial fact-check. After
the owner's pick: lock it as `G0_TOPICS.md`, then G0.5 the same way as the parked AI-songs run (research -> fact lock ->
lever writers -> judges -> viewer panel + sceptics -> editor -> truth check; bookkeeping `video/scripts/coreline.py`),
then G1 (story-first script, template `context/workflows/v3-g1-story-*.js`, rhythm rule `check_rhythm.py` OK), then
G2 voice. **The voice key:** this session has no `ELEVENLABS_API_KEY`; the owner is making a new restricted key (the
pasted string was the key's ID, not the key) to store as the environment's network secret; a helper session in the
same environment then runs G2. **Craft tooling lane** (`docs/PIPELINE_V2.md`): owned by the session running v4, must
land before v4's G3; G0-G2 never wait for it; schedule it against the weekly limit.

## Files in this folder
- `archive/ai_songs/`: the parked first topic, complete through G0.5.
- `scouting_r3/` (round 3, positive AI) and `G0_TOPICS_r3.md` once written.
- `OWNER_NOTES.md`: every owner note on v4, verbatim, with what we did.
- `archive/G0_TOPICS_round1.md` (gas tanks, commute to Zoom, padlock key 4) and `archive/G0_TOPICS_round2_options.md`
  (the tech/AI top 3 with score table and runner-ups). No prompt reads the archive.
- `scouting/` (round 1, all beats) and `scouting_r2/` (round 2, tech + AI): every scouted candidate with sources.
- Workflow scripts: `context/workflows/v4-g0-topics-*.js`, `v4-g0-topics-tech-*.js`, `v4-g05-facts-and-core-line-*.js`.
- Unused topics went to `video/docs/IDEAS_BANK.md`.
