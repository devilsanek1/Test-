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
