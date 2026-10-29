# Phase 1 (approved 2026-10-29 ~09:50 UTC, owner: "okay proceed yes"): the shared brief

The plan: `PLAN.md` Phase 1 (items 1-8). The evidence: `tokens.md`, `render.md`, `codebase.md` (this folder).

**The customer is the production** (owner, 2026-10-29): "Your main task here is to work on the engine and the production
process. You are a world class senior staff engineer who is tasked with working on the engine BUT THE PRODUCTION team is
your main customer, we cannot sacrifice the efforts and the quality and polish and attention of details that go into the
final product. If anything - any work that makes the quality and the polish better in the outcome at the expense of the
process taking longer is absolutely worth it." So: a speedup that costs any polish is rejected; no change may break a
command a production session uses; every change ships with a short note for the production sessions.

**The tree changed after the reviews** (the city-poster study: new `video/src/lib` modules, `video/src/look/`,
`video/scripts/look/posters/`, `qa/check_banding.py`). Re-verify every claim you act on (imports, line numbers, users of
a file) against the current tree first; the reviews' line numbers may have moved.

## Hard rules
- **Pixel-neutral.** No change may alter a rendered frame or a master. Prove it on the same frames before and after:
  PNG bytes equal, or 0 differing pixels; for video, an MD5-equal stream with the same settings (a re-render of the
  delivered v2r G7 master is byte-identical: `render.md`, top).
- **Backward compatible.** Every existing command keeps working with the same flags and the same output. New behaviour
  is a new flag, or a transparent speedup with identical bytes.
- **Ownership.** Edit only the files of your lane (below). Other sessions are active on this repo: videos 4 and 5 (at
  G1, on another branch) and the city-poster study's look tests in `video/src/lib/` (patchwork, foliage, wind, clouds,
  texture) and its poster engine in `video/src/look/` (still checkpointing on its own branch). Never touch
  `video/src/lib/**` (nothing in `lib/` moves, `lib/cine` and `lib/mascot` included: live code imports them),
  `video/src/look/**`, `video/scripts/look/**`, `video/public/**` or the process docs (`CLAUDE.md`, `HANDOFF.md`,
  `video/docs/PIPELINE_V2.md`, `OWNER_PLAYBOOK.md`, `G3_ANIMATIC.md`, `G5_BLOCKING.md`, `look/*`): list the doc
  changes your work needs in your report, and the orchestrator applies them.
- **Git.** Never run a git command that changes the index or history (no add, mv, rm, commit, push, checkout, stash,
  tag). Move files with plain `mv`. The orchestrator commits (a checkpoint runs every 10 minutes).
- **node_modules is installed in `video/`** (npm ci done 2026-10-29): never run `npm ci` or `npm install` there. Use
  `npm run typecheck` (the pinned TypeScript), never `npx tsc`.
- **Scratch** goes to `/tmp/phase1-<lane>/`; delete big renders when done (the disk allowance is shared). The review's
  bench harness is in `/tmp/streamline-render/video/bench/` with a Python venv in `/tmp/streamline-render/venv`:
  reuse them.
- **Checkpoint.** A usage limit can stop you at any moment: write your report's skeleton first and update it after
  each item.
- **Effort MAX. Do not start agents.** Final reply: at most 3 lines.

## Lanes
| Lane | PLAN items | Owns | Report |
|---|---|---|---|
| R, render | 2, 3, 4, 5 | `video/remotion.config.ts`; `video/scripts/{render-frames.mjs, render-media.mjs, sheet.sh, still.sh, strip.sh, film_chunks.py}`; new files in `video/scripts/render/` | `phase1_render.md` |
| C, codebase | 8 | the moves to `video/archive/` and `video/docs/v1/` (`codebase.md` §4, minus lane R's files); `video/tsconfig.json`; `video/package.json`; `video/scripts/index.py` and the `video/scripts/README.md` it writes; `video/docs/ENGINE.md` (the typecheck line); `context/workflows/archive/`, `context/workflows/INDEX.md` | `phase1_codebase.md` |
| M, meter | 1, and 7's status script | `video/docs/retro/spend.py` and new outputs beside it; `video/scripts/ops/status.py` (new) | `phase1_meter.md` |

**Report format:** per item, what changed (files), the test and its result (numbers, MD5s, diffs), and anything left;
then **"Doc changes needed"** (file, line, the new text) and **"For the production sessions"** (what changes for them,
how to use it, what stays the same), which the orchestrator compiles into `CHANGES.md`.
