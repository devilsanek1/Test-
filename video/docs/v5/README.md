# Video 5: state and pick-up notes

**Produced by session https://claude.ai/code/session_01YGLGMrgF1Cfg5gMAND1VNt since 2026-10-29 ~07:55 UTC** (owner:
"Okay let's try heat story let's generate the script"), on branch `claude/compassionate-hopper-5iqguj` (not merged
into `video-production`: the owner decides). Video 4 stays with its own session (paused at its topic pick).

| Gate | Status | File |
|---|---|---|
| G0 topic + core line | topic LOCKED: the bunker under the Stockholm park (one subject, after the owner's ONE SUBJECT rule); core line: the writer proposes up to 3 | `G0_TOPIC.md` |
| Fact lock | DONE 2026-10-29 ~09:15 UTC: 45 of 56 facts VERIFIED; the story-changing find: the Stockholm bunker is there for safety (cooled by heat pumps) and has fed Stockholm's heating pipes since 2014, so Helsinki is the same idea about 100 times bigger, not "the opposite"; only the mine and the sea are there for the cold (orbit is for sunlight); Helsinki's plant isn't built and has no tenant yet ("is meant to") | `research/factlock.md` |
| Openers | running: one research agent, opener patterns scored, a top 3 for v5 | `../studies/2026-10-28_city_posters/openers/OPENERS.md` |
| G1 script | draft 1 REJECTED by the owner (~10:20 UTC: too wide, five places in 43 s); new rule ONE SUBJECT, GONE DEEP; re-scoped: the owner picked THE BUNKER (~10:25 UTC); the writer rewrites | `script/script_g1.md`, `script/script_elevenlabs.md`, `THROUGHLINE.md` |
| G2 voice | after the owner approves the script; the API key is missing here (see `G0_TOPIC.md`) | `public/v5/` |

Owner's words: `OWNER_NOTES.md`. Rules: `video/docs/OWNER_PLAYBOOK.md`, `video/docs/PIPELINE_V2.md` (lean G0-G2).

**For W1, G3 and G4 (orchestrator, 2026-10-29 ~07:58 UTC):** build on the city-poster look test's new engine pieces
(`src/lib/patchwork.ts`, `texture.tsx`, `foliage.tsx` + `wind.ts`, `clouds.tsx`, `depth.ts`, `light.tsx`, `gamut.ts`,
`persp.tsx`; the scene `src/look/poster_s1/`; notes `video/docs/studies/2026-10-28_city_posters/test/`) once the owner
has judged that test; never edit those files from here. G0-G2 never wait for it.

**Next step (2026-10-29 ~09:25 UTC):** the G1 writer is rewriting the script as ONE subject, the bunker (`script/script_g1.md`,
`script/script_elevenlabs.md`, `THROUGHLINE.md`; draft 1 archived in `script/archive/draft1_wide/`). When it lands: send the owner
the script, its 3 hook options and up to 3 core lines; then one critic (cold retell, at most 6 findings) and one fix
pass. If the 5-hour limit stops it (reset 12:40 UTC), a self check-in fires at 12:45 UTC to resume the writer.
