# Resume note, 2026-10-31: the FLOW people rework (owner: "rework our people design to get close to it")

Session https://claude.ai/code/session_01YGLGMrSsMAtzb7oWP7yDAB, branch `video-production`. An ITERATION (a look
question, not a film).

**Done and committed:** the owner's twelve references and his words (`video/docs/look/refs_people_flow/`, README); his
note captured (playbook people and hair bullets; `PEOPLE_DESIGN.md` status: FLOW in study, v4 in use until he picks);
the art breakdown of 01-05 (`refs_people_flow/BREAKDOWN.md` + `breakdown_sheet.png`); the v4 code map for the rebuild
(`video/docs/look/people_design/flow_v5/TECH.md`).

**Stopped, then rerun and DONE (2026-10-31, after the owner raised the limit; run `wf_99720470-84e`, 8 agents):** GUST and BREEZE built, both ALMOST, each adjusted once; the breakdown gained 06-12 (`breakdown_sheet_2.png`); `flow_v5/compare.png`, `compare_phone.png`, `COMPARE.md`. First attempt: the build run (`context/workflows/people-flow-build-wf_7c2294ea-d1c.js`) died on the account's monthly
spend limit (the weekly limit resets 2026-11-05 06:00 UTC) before any agent wrote a file. Nothing is half-written.

**To resume:** rerun that script unchanged with the Workflow tool (`scriptPath` to the file above; it passes both
hooks). It does, per variant (GUST: closest to the references; BREEZE: the same grammar, calmer, our NY/LA cast):
build (her first, then motion, cast, scene) -> a fresh evaluator (`EVAL.md`) -> one adjust or rework; in parallel the
breakdown gains refs 06-12; then `flow_v5/compare.png`, `compare_phone.png`, `COMPARE.md`. Outputs under
`video/src/look/people_dirs/flow_v5/{gust,breeze}/`, `video/docs/look/people_design/flow_v5/{gust,breeze}/`.
If it dies again part-way: per variant, continue from the first missing file (no `01_her.png` -> its build prompt; no
`EVAL.md` -> its evaluation; and so on).

**Next (now):** the orchestrator's look beside the references (playbook: not clearly at their level ->
iterate first); then the comparison to the owner; on his pick, rewrite `PEOPLE_DESIGN.md` around it (never append).
