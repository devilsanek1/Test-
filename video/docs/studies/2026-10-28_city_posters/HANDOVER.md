# HANDOVER: the city-poster study (resume here after a usage-limit stop)

Written 2026-10-28 ~22:55 UTC by the orchestrating session https://claude.ai/code/session_01YGLGMqbgdpycjemYZL3aoL
(owner: "we might hit the limit on tokens like very soon ... make sure not to lose any progress"). Branch
`claude/compassionate-hopper-5iqguj`; `video-production` is kept at the same commit (owner: "merge the findings and key
points and conclusions into the main repo"). The brief is `README.md` here; the owner's words verbatim are in
`video/docs/look/poster_refs/README.md`.

## Status 2026-10-29 ~04:30 UTC: "Go with your suggestions"; building the 7 s look test
- The owner approved every suggestion (the playbook's city-poster bullet lists them). Running: (1) a docs agent turns
  them into rules (DIRECTION, CRAFT, LAYOUT, LIFE_AND_DENSITY, PALETTE, the playbook's other bullets, STUDY §9,
  `INTEGRATION.md` §2); (2) the engine builder, STUDY §10 items 1, 2, 3, 4, 6, 10 (`test/BEFORE.md`, `test/ENGINE.md`,
  non-breaking `src/lib` pieces: depth by 1/z, palette 10b + gamut, FormShade per tier, patchwork, texture).
- Next: the scene builder (items 5, 7, 8, 9, 11: a copy of v2's S1 in `video/src/look/`, renders, QA), then an
  independent art-director critic, one fix pass, and the clip (v2's S1, then the new look) to the owner as
  `video/deliverables/tests/poster_look_test_v1.mp4`.
- The checkpoint loop (`study_checkpoint2.sh` in the orchestrator's scratchpad) commits the study, `src/lib`,
  `src/look`, `scripts/qa`, `docs/look`, the playbook and HANDOFF to the session branch every 10 minutes; review the
  diff before merging into `video-production`.

## Status 2026-10-29 ~03:40 UTC: the study is done
- All lenses, `STUDY.md`, `SUMMARY.md`, the summary sheet (sent to the owner) and the A vs B picture (sent) are in.
- Integrated into the main docs (`INTEGRATION.md`: DIRECTION, CRAFT, PALETTE, the new `docs/look/LAYOUT.md`, G5_BLOCKING,
  COZY_AND_SCALE, CINEMATIC_GUIDE, STORYBOARD_STYLE, LIFE_AND_DENSITY, QA, HANDOFF) and merged into `video-production`.
- Waiting on the owner's calls (DIRECTION's open-call list; `STUDY.md` §9). Next: the 7 s look test (`STUDY.md` §10).
- The journal-corpus thread is done (`journals/SUMMARY.md`), merged into `video-production`; it sent the owner its
  summary and chart and stays open for their reactions.
- Code flagged, not changed: the caption clip window in theme.ts and capcheck, `safe.action`, framecheck's ad rail,
  `PARALLAX_K` (not 1/z), `planeLod`'s 0 px `minFeature` (`INTEGRATION.md`).

## Resumed 2026-10-29 02:36 UTC (after the 5-hour reset)
- The limit stopped details, composition, colour (pro_4) and the A vs B critic; nature (pro_3) had finished its file.
- Running now as single max-effort agents (the Agent tool), each continuing its partial file from its original brief
  in the workflow scripts: `details.md`, `composition.md`, `pro_4_colour.md`. The checkpoint loop restarted (2 h).
- The A vs B picture was sent to the owner (the critic skipped; checked by eye: `img/AB_outlines.md`).
- Next: when the three land, the synthesis (`STUDY.md`, `SUMMARY.md`, `layout.md` part B), then the integration into
  the main docs and the merge into `video-production`.

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

**Scheduled resume (owner: "once the 5h limit resets - make sure to continue where you left off"):** a one-shot
message wakes the orchestrating session at 2026-10-29 02:35 UTC (scheduled task `trig_01PMSVVvCXFsMWZ7vPxaX7t2`; the
5-hour window resets at 02:30 UTC); both helper threads were asked to schedule their own resume at 02:40 UTC. The
checkpoint loop (`study_checkpoint.sh` in the orchestrator's scratchpad: commit + pull + push of this folder every 10
minutes) runs until ~00:50 UTC; the resume restarts it.

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
