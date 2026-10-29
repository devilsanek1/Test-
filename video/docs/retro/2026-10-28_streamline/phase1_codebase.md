# Phase 1, lane C (codebase): PLAN.md item 8

Lane C of `PHASE1_BRIEF.md`. Status: IN PROGRESS (checkpoint 10:30 UTC: (b), (c) and the pixel tests done; tags,
index, docs link check, workflows, ENGINE.md still running).

## (b) Code moves to `video/archive/` (done 10:21 UTC)
- 107 plain `mv`s, 365 files, relative layout kept: v1 code (179 files) to `video/archive/v1/src/`, v2's first
  production (51) to `video/archive/v2-first/src/`, v3's 44 dead panels to `video/archive/v3/src/v3/film/scenes/`, v1's
  scripts (22 files) to `video/archive/v1/scripts/`.
- Kept: `src/v3/film/BoardPanel.tsx` (the G5 template, G5_BLOCKING.md:27, 42-43), `scripts/qa/calibrate.py` + `calib/`.

## (c) tsconfig / package.json (done)
- `include: ["src"]`; `still` / `render` removed; `typecheck` kept.

## Tests so far
- typecheck: before 18.6 / 17.2 / 16.6 s (tsc total 16.3 s, 1181 files, 175k TS lines); after 11.6 / 11.0 / 10.4 s
  (tsc total 10.1 s, 906 files, 108k lines); 0 errors both.
- 26/26 live entries bundle byte-identical before and after; stills Film2R 0/1170/2280 and Film3 0/1230/2440: identical PNG bytes.
