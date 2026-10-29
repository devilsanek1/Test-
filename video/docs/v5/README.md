# Video 5: state and pick-up notes

**Produced by session https://claude.ai/code/session_01YGLGMrgF1Cfg5gMAND1VNt since 2026-10-29 ~07:55 UTC** (owner:
"Okay let's try heat story let's generate the script"), on branch `claude/compassionate-hopper-5iqguj` (not merged
into `video-production`: the owner decides). Video 4 stays with its own session (paused at its topic pick).

| Gate | Status | File |
|---|---|---|
| G0 topic + core line | topic LOCKED (the heat story); core line: 3 options sent, waiting on the owner | `G0_TOPIC.md` |
| Fact lock | DONE 2026-10-29 ~09:15 UTC: 45 of 56 facts VERIFIED; the story-changing find: the Stockholm bunker is there for safety (cooled by heat pumps) and has fed Stockholm's heating pipes since 2014, so Helsinki is the same idea about 100 times bigger, not "the opposite"; only the mine and the sea are there for the cold (orbit is for sunlight); Helsinki's plant isn't built and has no tenant yet ("is meant to") | `research/factlock.md` |
| Openers | running: one research agent, opener patterns scored, a top 3 for v5 | `../studies/2026-10-28_city_posters/openers/OPENERS.md` |
| G1 script | next: one writer + one critic + one fix pass, from the fact lock, the picked line and the best openers | |
| G2 voice | after the owner approves the script; the API key is missing here (see `G0_TOPIC.md`) | `public/v5/` |

Owner's words: `OWNER_NOTES.md`. Rules: `video/docs/OWNER_PLAYBOOK.md`, `video/docs/PIPELINE_V2.md` (lean G0-G2).

**For W1, G3 and G4 (orchestrator, 2026-10-29 ~07:58 UTC):** build on the city-poster look test's new engine pieces
(`src/lib/patchwork.ts`, `texture.tsx`, `foliage.tsx` + `wind.ts`, `clouds.tsx`, `depth.ts`, `light.tsx`, `gamut.ts`,
`persp.tsx`; the scene `src/look/poster_s1/`; notes `video/docs/studies/2026-10-28_city_posters/test/`) once the owner
has judged that test; never edit those files from here. G0-G2 never wait for it.
