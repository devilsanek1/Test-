# v3 rework assembly, the FINAL step (G8): the master, its checks, the cover, 2026-10-28

Lean run (the owner is near the token limit): ONE full-film render (the master), spot checks only, <= ~12 images looked at.
Work folder: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/final_master/`.

## Step 1: typecheck + flow_v2 (doc only)
- `npx tsc --noEmit -p .` in `video/` (the project's TypeScript 5.9.3): 0 errors. Note: `npx tsc --noEmit -p video` run from
  the repo root picks up a global TypeScript 6.0.2 instead (the root has no node_modules) and reports 5 `lib` errors in S9
  files (padStart / flatMap / Object.entries); run it from `video/`.
- `docs/v3/flow_v2.md` now matches the build: §4 SQE/SQF (the overtake 34.95-35.93, nudge 35.38, every outline off by 35.95;
  the BETTER van's beat to 33.40; the payoff's rows 37.18 / 37.36 / 37.54 / 37.72 with the thoom; the workers load truck B
  only during 26.22-28.46), §3 the factory wall L* 65, §4 SQD + §5 SQD light (the REVEAL lane's wording, verbatim). Also the
  lanes' other open spec requests, checked against the code: §1 sway 24.95 and its window 24.95-25.25, Pip's side-pose shrug
  40.40-40.55; §3 the SQB float locked 6.45-9.30, the strip settle 6.20-6.65, the 5 scheduled skylight flakes from 9.0; §4
  SQB the 11.80 past-year band; §7 the BETTER van's Luton box.
