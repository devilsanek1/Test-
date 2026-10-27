# Video 4: state and pick-up notes (PAUSED 2026-10-27)

For the agent who picks this up later. Read this file first, then `HANDOFF.md` (root), `video/docs/OWNER_PLAYBOOK.md`
and `video/docs/PIPELINE_V2.md`.

## Why it is paused
The owner, 2026-10-27 ~14:40 UTC: "lets pause for now. lets make sure the other session finishes its work. only then we
can proceed with this one". **Don't resume until the owner says go** (the other sessions are v2 and v3; see `HANDOFF.md` 2b).

## Where the work lives
- Git branch: **`claude/tender-bardeen-j7duak`** (pushed). Not yet merged into `video-production`; merge it when the owner
  resumes v4 (or ask first).
- Session that did this: https://claude.ai/code/session_014PwCXHBSouhcawFp12X9sT

## Status by gate
| Gate | Status | File |
|---|---|---|
| G0 topic | **LOCKED**: AI songs and the shared royalty pot | `G0_TOPICS.md` |
| G0.5 core line | **NOT STARTED** (the run was stopped before any agent finished; nothing produced) | to write: `research/*.md`, `research/factlock.md`, `CORE_LINE.md` |
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
Relaunch **unchanged** with the Workflow tool:
`scriptPath: <repo>/context/workflows/v4-g05-facts-and-core-line-wf_cd902428-060.js`
(paths inside are absolute `/home/user/Test-/video/...`; adjust if the repo lives elsewhere). It runs:
3 research lanes (mechanism, the fuss, voices + guardrails) -> `research/factlock.md` -> 6 lever writers -> 4 judges ->
4 viewer personas + 2 sceptics per finalist -> `CORE_LINE.md` (top 3) -> truth check. About 35 agents.
Then: show the owner the top 3 lines on one screen; after the pick, archive the rest and go to G1 (story-first script,
template `context/workflows/v3-g1-story-*.js`), then G2 voice via the ElevenLabs API (`video/docs/voice/API_QUICKSTART.md`).

## Files in this folder
- `G0_TOPICS.md`: the locked topic (only the pick).
- `OWNER_NOTES.md`: every owner note on v4, verbatim, with what we did.
- `archive/G0_TOPICS_round1.md` (gas tanks, commute to Zoom, padlock key 4) and `archive/G0_TOPICS_round2_options.md`
  (the tech/AI top 3 with score table and runner-ups). No prompt reads the archive.
- `scouting/` (round 1, all beats) and `scouting_r2/` (round 2, tech + AI): every scouted candidate with sources.
- Workflow scripts: `context/workflows/v4-g0-topics-*.js`, `v4-g0-topics-tech-*.js`, `v4-g05-facts-and-core-line-*.js`.
- Unused topics went to `video/docs/IDEAS_BANK.md`.
