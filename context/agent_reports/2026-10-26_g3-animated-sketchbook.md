# Workflow report: g3-animated-sketchbook (wf_6ef4f230-229, 2026-10-26)

Owner direction (same day): G3 = "an animated sketchbook ... close to final version of the story, transitions,
animations, camera movements ... details ... as placeholders ... the closest signal to the final story in as little
time as possible." 11 agents, all completed; ~1.32 M subagent tokens, 218 tool calls, ~37 min.

## Phases and outputs
1. **Research, 6 lanes** → `video/docs/look/research/animatic_*.md`:
   - `reels`: feature story-reel practice (what a reel locks; full-runtime coverage; transitions performed, not noted).
   - `layout`: layout/previs — camera FINAL, art rough; the "anime five" values per move (word, duration, start/end,
     anchor, ease); judging a move from grey material.
   - `rough`: the 2D rough pass — 2-4 stepped key poses on words, smears, stepped > tweened for judging timing.
   - `mograph`: explainer-studio animatics as a timing contract; the 8-device transition grammar; blocking vs polish.
   - `sketchlook`: the owner's reference page decoded (loose NEVER means empty — dense scribbled suggestion);
     5 placeholder primitives specced; line boil researched (verdict: not required, optional later).
   - `audit`: our v2/v3 G3 vs G5 gap with frame evidence; SketchReel/board_lint capability inventory; the dress-layer
     and `life:`/promise ideas; g5_scaffold flattens transitions to `cut` (found and now flagged in G5_BLOCKING).
2. **Synthesis** → `video/docs/G3_ANIMATIC.md` (the stage spec) + `video/docs/look/research/g3_spec_edits.md`
   (verbatim edits for STORYBOARD_STYLE, PIPELINE_V2, G5_BLOCKING, CLAUDE.md, playbook).
3. **Critique**: 3 critics (time, signal-fidelity, consistency), 23 findings — among them: tooling not tiered vs the
   2 h budget; unbounded internal review loops; boil smuggled in as a requirement; STORYBOARD_STYLE §7's "animate at
   most two" left alive (the exact clause that hid v3's motion signal); the emptiness lint failing compliant boards.
4. **Revision**: all 23 applied, none rejected (tier-1/tier-2 tooling split, ONE batched fix round, boil made optional,
   §7 Moves rewritten, emptiness lint exemptions for mandated composition air, speed budget rate-aware).

## Where it landed (all committed)
- Spec: `video/docs/G3_ANIMATIC.md`. Cross-doc edits applied from `g3_spec_edits.md` by the orchestrator.
- Playbook: new top Storyboard rule (animated sketchbook) + motion clause widened + G3 reel at 60 fps.
- Next build task: `G3_ANIMATIC.md` §7 tier 1 (see HANDOFF §2b and PIPELINE_V2 "Tooling to build" item 6).
