# Finished films' code (archived 2026-10-29, streamlining Phase 1)

Byte for byte as moved out of `video/src` and `video/scripts`; nothing here is typechecked, bundled or run in place.
Each film runs at its own commit, where every path in it resolves:

| Film | Commit (tag) | What is there |
|---|---|---|
| v1 "php2shell" (delivered and posted 2026-10-25) | `76c166c1` (`v1-final`) | `archive/v1/`: `src/` (scenes, dev, data, Main, Root, index, entry-film) and v1-only scripts |
| v2's first production (before the v2r restart) | `56f905df` (`v2-first`) | `archive/v2-first/src/` (`v2/`, `entry-v2*.tsx`) |
| v3 "laptop prices" (posted, closed 2026-10-28) | `79e956c3` (`v3-final`) | `archive/v3/src/`: the 44 G5b panels no entry imports (the rest of v3 is live in `src/v3/`) |

To run an old film: `git worktree add --detach /tmp/v1 76c166c1 && cd /tmp/v1/video && npm ci`, then that film's own
commands (HANDOFF §5). The tags are created locally; pushing tags from a cloud session was refused (HTTP 403), so the
commit hashes above are the reference until the tags exist on GitHub. Why and how it was moved:
`video/docs/retro/2026-10-28_streamline/phase1_codebase.md`.
