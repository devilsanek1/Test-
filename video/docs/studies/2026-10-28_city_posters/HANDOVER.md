# HANDOVER: the city-poster study (resume here after a usage-limit stop)

Written 2026-10-28 ~22:55 UTC by the orchestrating session https://claude.ai/code/session_01YGLGMqbgdpycjemYZL3aoL
(owner: "we might hit the limit on tokens like very soon ... make sure not to lose any progress"). Branch
`claude/compassionate-hopper-5iqguj`; `video-production` is kept at the same commit (owner: "merge the findings and key
points and conclusions into the main repo"). The brief is `README.md` here; the owner's words verbatim are in
`video/docs/look/poster_refs/README.md`.

## Done (files here, committed)
- `perspective.md`, `style.md` (look lenses), `pro_1_depth.md`, `pro_2_hierarchy.md` (pro practice), `layout.md`
  (part A: every earlier layout rule consolidated; part B waits for `composition.md`), `content_market.md`,
  `content_fit.md` (content track), sheets in `img/`.
- Owner decisions already integrated into the main docs (DIRECTION, CRAFT, PALETTE, LIFE_AND_DENSITY, the playbook):
  one look, one brand, still evolving; Pip stays, hidden on purpose; a VERY subtle texture to try; lit and shade faces;
  a full value range.

## Running when this was written (they write their files as they go; the checkpoint loop commits every 10 min)
| Workflow | Run ID | Script | Agents |
|---|---|---|---|
| poster-look-lenses | `wf_52e3a24a-ee1` | `/root/.claude/projects/-home-user-Test-/fe339b66-57f0-5b47-bb6a-872d2f15f4c0/workflows/scripts/poster-look-lenses-wf_52e3a24a-ee1.js` | perspective, style done; details running (`details.md`); composition not started |
| poster-pro-practice | `wf_96489d31-606` | `.../workflows/scripts/poster-pro-practice-wf_96489d31-606.js` | depth, hierarchy done; nature (`pro_3_nature.md`) and colour (`pro_4_colour.md`) running |
| poster-ab-and-layout | `wf_f404861a-2fb` | `.../workflows/scripts/poster-ab-and-layout-wf_f404861a-2fb.js` | layout done; the A vs B builder (`img/AB_outlines.jpg`) running, then its critic |

**Resume after a stop (same session):** `Workflow({scriptPath: <the script>, resumeFromRunId: <the run ID>})`: finished
agents replay from cache, the stopped ones rerun from the start of their task (their partial files stay; tell them to
continue the file rather than restart it if you edit the brief). **From a new session:** rerun only the missing reports
with one max-effort agent each (the briefs are in the scripts above, also readable in the run transcripts under
`/root/.claude/projects/-home-user-Test-/fe339b66-57f0-5b47-bb6a-872d2f15f4c0/subagents/workflows/`); each report says
in its skeleton what is still "(pending)".

## Helper threads (each has its own machine and the same branch)
- Content discussion: https://claude.ai/code/session_01YGLGMrgF1Cfg5gMAND1VNt, notes `content_discussion.md` (the
  owner widened the brief: "Don't be fixated on tech or AI, all goes").
- Journal corpus (recent stories from big publications, scored for fit, clustered):
  https://claude.ai/code/session_01YGLGMqT2EoqkuUBVwxxRZE, folder `journals/` (the news feeds load since the owner's
  network change at ~22:28 UTC).

## Next, in order
1. When the lenses are in: `layout.md` part B (reconcile with `composition.md`, `perspective.md`); the synthesis
   `STUDY.md` + `SUMMARY.md`, organised by the owner's four feelings plus what they didn't name; an adversarial check
   (`VERIFY.md`). The orchestrator may do it with single max-effort agents (the Agent tool) if no workflow is wanted.
2. Send the owner the A vs B picture once its critic has signed it off (`img/AB_outlines.md` gets "Critic:" lines).
3. Integrate the owner-approved conclusions into the main docs (DIRECTION, CRAFT, PALETTE, a `docs/look/LAYOUT.md`
   from `layout.md` §7), merge into `video-production`, tell the owner in a few lines.
4. Open owner questions: the patchwork (no answer yet), the outline-free edges (after the A vs B), Pip's hiding spots
   (every shot as a "find Pip" rewatch game, or a few spots), the shade-face depth (stronger than rule 5's "gentle").
