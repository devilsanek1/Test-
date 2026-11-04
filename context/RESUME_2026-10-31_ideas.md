# Resume note, 2026-10-31 ~08:45 UTC: video 4's FULL ideas round (owner: "Not lean really to it properly")

Running in session https://claude.ai/code/session_01VwsUCnkJXFuq3YwEYFUg7o, branch `claude/kind-pascal-lvgsza`.
Script: `context/workflows/v4-ideas-full-wf_9965bb6c-4f7.js` (args `{"ids": [...]}`), two runs side by side:
`wf_9965bb6c-4f7` (A, B) and `wf_d61e1346-21b` (C, D). Brief: `video/docs/v4/ideas/BRIEF.md` (feeling first).

The four imaginations, each one whole sequence from one film concept (12 frames + up to 4 alternates):
- A: the city as the story. B: the machine and the mechanism. C: the heat's journey (the heat as the visible thread
  from a computer to a home). D: one home, one person (the "you" at the centre).

Files per sequence X in `video/docs/v4/ideas/`: `X.md` (concept, ideas, "Round N changes"), `X_sheet.png`, `X_src/`,
then THE FRAME LOOP: `X_EVAL_r1.md` (+ `.png` paint-over) -> adjust -> `X_EVAL_r2.md` -> adjust -> `X_EVAL_r3.md`.

**If it dies (a usage limit, a restart):** workflows cannot be resumed from another session; in this session, rerun
the script with `resumeFromRunId`. Otherwise, per sequence, continue from the first missing file: no sheet -> rerun
its build prompt; a sheet but no EVAL_r1 -> its evaluation; and so on (the script's prompts, `effort: 'max'`).

**Next when all four are done:** one fresh judge across the four (a board read of each as a viewer, sound off; which
film each makes; the base recommended, and the beats to improve inside it, never a collage); the orchestrator's own
look; the owner's board page (the four concepts first, one strip each, then the sheets and the judge's call).

## PAUSED 2026-10-31 ~10:50 UTC (owner: "We are 97% of 5h limit ... continue in 3g"): both runs stopped on purpose
State when stopped: all four first reviews ALMOST (`X_EVAL_r1.md`); A and C fixed (Round 1 changes in A.md, C.md) and
their second reviews were running (`A_EVAL_r2.md`, `C_EVAL_r2.md` may be partial); B and D were in their first fix round
(B.md / D.md and sheets may be part-fixed). Everything on disk is committed.
**Resume (same session, after the reset):** Workflow({scriptPath: "/root/.claude/projects/-home-user-Test-/67147aa0-f19a-57d7-998b-ab1f0d30daf9/workflows/scripts/v4-ideas-full-wf_9965bb6c-4f7.js",
args: {"ids": ["A","B"]}, resumeFromRunId: "wf_9965bb6c-4f7"}) and the same with {"ids": ["C","D"]} and
"wf_d61e1346-21b": finished agents replay from cache, the cut ones rerun (delete a partial X_EVAL_r2.md first so the
fresh evaluator starts clean). From another session: per sequence, rerun from the first unfinished step with the
script's prompts. Then the judge (`context/workflows/v4-ideas-judge.js`), the orchestrator's look, the owner's board.
