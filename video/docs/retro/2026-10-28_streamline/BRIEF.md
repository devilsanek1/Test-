# Streamlining review (2026-10-28): the shared brief

The owner, 2026-10-28, verbatim: "i want you to do something else - i want you to focus on the optimizing the codebase
and streamlining the process. So each video does take a while to create and takes a lot of tokens. I know we've built
the engine and the whole automation that does the creation process, i want you to analyze the whole rendering process
and figure out if there is any room we can optimize it and make the process and automation cleaner, more efficient? we
MUST not sacrifice the quality of the video, we MUST not sacrifice the details and overall look and feel, but we need to
brainstorm and find a way to streamline the process IF THERE is obvious ways"

Three reviewers, one area each: `tokens.md` (where a film's tokens go), `render.md` (render and engine wall-clock),
`codebase.md` (code, scripts and automation hygiene). The orchestrator merges them into `PLAN.md` for the owner.

## Hard rules
- **Quality is fixed.** The films' look, detail, life, the 60 fps production renders, the gates and every owner review
  stay. A proposal that could change a final film's pixels needs a way to prove it doesn't (a frame diff on the same
  frames) or it is marked "needs a test", or rejected.
- **Analysis only.** Write only your own report file in this folder; scratch output goes to
  `/tmp/streamline-<area>/`. Never edit code, scripts, docs or workflows; never run git commands that change anything
  (the orchestrator commits). Another session is building v2r (G5 assembly): never touch `video/src`, `video/public`,
  `video/out` or any doc.
- **Evidence first.** Each finding cites files (path:line), numbers or a measurement; estimates are marked as estimates.
- **Lean.** Do not start agents or workflows. Read selectively (grep, wc, head, sed -n ranges): the docs are large.
- **Checkpoint.** A usage limit can stop you at any moment: write your report's skeleton at your first step and fill it
  in as you go.
- **Final reply** to the orchestrator: at most 3 lines (the file path and the top 3 findings in a few words).

## Report format (`<area>.md`, at most about 200 lines)
1. **How it works today:** a short map of your area (files and flow), with the numbers you found.
2. **Findings, ranked by expected saving** (wall-clock or tokens). Each: what; evidence; the proposal; the saving
   (estimate); the quality risk (none / low / needs a test, and the exact test that proves no loss); the effort (S/M/L).
3. **Quick wins** (safe now, no quality risk) vs **bigger changes** (need the owner's yes and a test).
4. **Rejected ideas:** what you considered and why it would cost quality or isn't worth it.

## What we know already
- The early gates (G0-G2: topic, core line, script, voice) were just streamlined (`2026-10-28_v4_early_stage_cost.md`;
  PIPELINE_V2's lean G0-G2). Don't redo them. The target is G3-G8 (animatic, look clip, blocking, build, polish,
  render, QA) and the engine.
- An earlier production session's token forensics (`spend.py` -> `spend_out.txt`, this folder's parent): 442 agents;
  input 12.5 B tokens (98 % cache reads) plus the orchestrator's 832 M over 1,922 turns; output 66 M. By category: fix
  4,963 M input (108 agents, 18 failed), review 3,465 M (220 agents, 39 failed), build 2,280 M (31 agents), other
  1,258 M. Top workflows: scene-polish.js, scene-production-*.js, engine-v2-cinematic, shared-world-kit.
- The map: `CLAUDE.md`, `HANDOFF.md` (state; where past context lives), `video/docs/PIPELINE_V2.md` (gates, anti-waste
  rules, the studio toolkit), `video/docs/look/DIRECTION.md` (the look), `video/docs/OWNER_PLAYBOOK.md` (the owner's
  rules), `video/docs/ENGINE.md`, `video/docs/QA.md`, `video/docs/retro/` (the v3 retro, the owner summary),
  `context/README.md`, `context/workflows/` (95 workflow scripts), `context/agent_reports/` (what past workflows
  reported), `context/summaries/`. Paths are relative to the repo root `/home/user/Test-`; the Remotion project is
  `video/`.
