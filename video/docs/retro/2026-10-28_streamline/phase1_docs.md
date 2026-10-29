# Phase 1, lane D (docs): lane C's "Doc changes needed"

Lane D of `PHASE1_BRIEF.md`, set by the orchestrator on 2026-10-29: apply `phase1_codebase.md`'s "Doc changes needed"
(309 references to moved paths in 84 live files), re-run the link check, and make the checker permanent
(`video/scripts/ops/linkcheck.py`). Status: **IN PROGRESS** (skeleton written first; updated after each item). A usage
limit stopped the lane at 19:35 UTC before any edit; resumed at 23:46 UTC on a clean tree (scratch `/tmp/phase1-D/` kept).

## 1. The list, applied
- **Docs (done 23:55 UTC):** 80 edits in 23 files (exact-match script `/tmp/phase1-D/edits_docs.py`, every old text
  found exactly once).
- **Code comments (done 00:05 UTC):** 30 edits in 14 files (`/tmp/phase1-D/edits_code.py`). Proof: for the 10 Python
  files the AST with docstrings blanked is identical to HEAD's except the two strings the list rewrites
  (`calibrate.py`'s measurement sources, `cues_from_storyboard.py`'s default storyboard, now `docs/v1/...`: the moved
  file is byte-identical, MD5 `10d7e361` before and after the move); the 3 `.mjs` and `sheets.sh` are identical with
  full-line comments removed; `node --check` and `bash -n` pass.

## 2. The link check, before and after
(pending)

## 3. The permanent checker
(pending)

## Not applied, and why
(pending)

## For the production sessions
(pending)
