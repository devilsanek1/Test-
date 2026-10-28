# v3 rework assembly, REVEAL fix lane (SQD 19.40-22.68 + the far pile in SQE / SQF), 2026-10-28

Files owned: `src/v3/film/scenes/SQD*.tsx` only. Findings: R1-3 (major), R2-1 (blocker), R2-2 (major), R3-1 (blocker).
Evidence: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/reveal/`.

## Status
- [x] read the findings, the rules (DIRECTION, CRAFT §b-§f, flow_v2 §4-§7, kit README `Pile`) and `SQD_peak.tsx`
- [x] reproduced R2's pile count on R2's frames (`R2/pilecount.py`, box 0,620,1080,1800): 231 / 358 / 730 / 596 at
      19.7 / 20.0 / 20.4 / 20.8
- [ ] before stills at HEAD (PNG, the same renderer as the after stills)
- [ ] the crest (R1-3, R3-1), the rows (R2-1, R3-1), the far pile at rest (R2-2)
- [ ] re-checks: marks, specks, check_depth, check_light, phone look, joins / seams, tsc

## Plan
1. The crest's 8 hand-placed sticks (the bed's 2 + the second layer's 6) are the only sticks with chips and pins, in
   THE stick's own values one step under it (not #966E59), and they lie mostly level.
2. Every row stick is a flat gold board (no chips, no pins).
3. The far pile at rest: no per-stick detail outside THE stick, 2-3 flat values, one +3 plane step toward FAR_AIR.
