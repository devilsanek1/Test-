# Video 4: state and pick-up notes (RESUMED 2026-10-27 ~22:35 UTC)

For the agent who picks this up later. Read this file first, then `HANDOFF.md` (root), `video/docs/OWNER_PLAYBOOK.md`
and `video/docs/PIPELINE_V2.md`.

## Who runs it now
- The owner, 2026-10-27 ~22:35 UTC: "okay lets continue with the video 4 production" (it was paused at ~14:40 UTC so the
  v2 and v3 sessions could finish first; they were still in flight when it resumed, and they share the weekly limit).
- Session: https://claude.ai/code/session_01XBbv5cud3NnzxxSLqPjWNt, git branch **`claude/busy-lovelace-83r39e`** (the
  earlier v4 branch `claude/tender-bardeen-j7duak` is merged into it, with `video-production` as of 22:30 UTC). Not yet
  merged into `video-production`: ask the owner before pushing there.
- The earlier session (G0, the pause): https://claude.ai/code/session_014PwCXHBSouhcawFp12X9sT.
- Checkpoints: a commit after every agent, plus `video/scripts/autocheckpoint.sh claude/busy-lovelace-83r39e video/docs/v4`
  in the background (every 10 minutes when v4's files changed; restart it after a session restart, and add v4's
  `public/`, `assets/` and `src/` paths once those exist).

## Status by gate
| Gate | Status | File |
|---|---|---|
| G0 topic | **LOCKED**: AI songs and the shared royalty pot | `G0_TOPICS.md` |
| G0.5 core line | **RUNNING** (resumed 2026-10-27 ~22:40 UTC; stages run as max-effort subagents, see "Next step") | `research/*.md`, `research/factlock.md`, `CORE_LINE.md` |
| G1+ | not started | |

## The locked topic in one paragraph
AI-generated songs are flooding streaming. Spotify pulled 50M+ likely-AI tracks from its recommendations this year (NBC,
20 Oct 2026; not deleted). On Deezer, AI is over half of daily uploads (~90,000/day) but 1-3% of streams. Streaming pays
artists from one shared pot split by share of all plays, so bot plays that slip past the fraud filters shrink every real
artist's slice even if no human listens (detected fraud is already removed; the drain is the undetected part; no
measured per-artist dollar loss exists). Pegs: NPR 27 Oct "Is 2026 the fakest year in music?"; Michael Smith sentenced
6 Oct 2026 (18 months, ~$8.09M forfeit) for bot-streaming AI songs. Voices: James Blake (NPR, verified), Morgan Hayduk
of Beatdapp (NBC, quote partly verbatim, finish it). Full beat outline, sources, uncertainties, fairness notes: `G0_TOPICS.md`.

## The owner's rules for THIS video (all in `OWNER_NOTES.md`)
- Anthropic must not be a key entity.
- Focus on tech and AI news (round 1's non-tech picks were rejected).
- Picked AI songs over the recommended Spotify-family-QR topic because "there is good amount of fuss about AI songs":
  the core line may ride the wider fuss, not only the royalty mechanism, as long as the video pays it off.

## Next step: G0.5 (facts + core line)
The workflow `context/workflows/v4-g05-facts-and-core-line-wf_cd902428-060.js` holds the stages and the briefs. The
resuming session has no Workflow tool, so it runs the same stages as subagents (Agent tool, `effort: max`), stage by
stage, committing after each: 3 research lanes (mechanism, the fuss, voices + guardrails) -> `research/factlock.md` ->
6 lever writers -> 4 judges -> 4 viewer personas + 2 sceptics (each sceptic covers every finalist, one verdict per
line) -> `CORE_LINE.md` (top 3, with a thread idea per pick for the through-line card) -> truth check.
Then: show the owner the top 3 lines on one screen; after the pick, archive the rest, draft the through-line card
from the pick (playbook "Hook and pacing"; `docs/look/CRAFT.md` §a) and go to G1 (story-first script, template
`context/workflows/v3-g1-story-*.js`, which now enforces the rhythm rule: short sentences of 5 words or fewer between
the long ones, `video/scripts/voice/check_rhythm.py` OK), then G2 voice via the ElevenLabs API
(`video/docs/voice/API_QUICKSTART.md`). **The key `ELEVENLABS_API_KEY` is not set in the resuming session** (the owner
was told on 2026-10-27): once the owner adds it as an environment secret, a new session (or a helper session in the
same environment) sees it; without it, the owner makes the take from our full paste text.
**Craft tooling lane** (`docs/PIPELINE_V2.md`, "Craft tooling lane" + tooling item 6): the session running v4 owns it
and it must land before v4's G3; G0-G2 never wait for it. Schedule it against the weekly limit (v2 and the v3 rework
share it).

## Files in this folder
- `G0_TOPICS.md`: the locked topic (only the pick).
- `OWNER_NOTES.md`: every owner note on v4, verbatim, with what we did.
- `archive/G0_TOPICS_round1.md` (gas tanks, commute to Zoom, padlock key 4) and `archive/G0_TOPICS_round2_options.md`
  (the tech/AI top 3 with score table and runner-ups). No prompt reads the archive.
- `scouting/` (round 1, all beats) and `scouting_r2/` (round 2, tech + AI): every scouted candidate with sources.
- Workflow scripts: `context/workflows/v4-g0-topics-*.js`, `v4-g0-topics-tech-*.js`, `v4-g05-facts-and-core-line-*.js`.
- Unused topics went to `video/docs/IDEAS_BANK.md`.
