# v3 rework assembly, final round: the HOME fix lane (SQA, SQB*, SQC*, home_set.tsx), 2026-10-28

Status: IN PROGRESS (written as it goes).

Findings owned (from `assembly_review_R1.md`, `_R2.md`, `_R3.md`): R1-2 = R3-2 (SQB's window strip and mullion vs the
card, 6.45-10.3), R2-3 (SQB's invisible life: the skylight snow), R3-3 (SQB's turn 10.90-13.85 has no picture).
"Before" = the reviewed render `film_full.mp4` (code be03dfa; v3 source unchanged at 381e3c0).
Work folder: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/home/`.

## Plan
1. Re-measure the "before" on `film_full.mp4` with R1's tools (salience share card / strip / skylight, motion share of
   the line's draw), so each fix has its own number before -> after.
2. R1-2 / R3-2: `home_set.tsx` inside `windowCalm` (6.35-6.95; SQA untouched): the mullion and latch, then the strip's
   houses, caps and lit panes, one more calm step toward the glass's dusk.
3. R2-3: `home_set.tsx` `SkylightSnow`: flakes at SQA's near-window size, a few more, a touch quicker.
4. R3-3: `SQB_chart.tsx` `OldDealChart`: "this past year" as one visible event on the card (a soft band over the plot's
   last year, popping in at 11.80 and staying as the hook's stage).
5. Re-check each fix (stills at 0.5 and a 0.25 phone look, the finding's own measure), `npx tsc --noEmit -p video`,
   the seam probe if a join's frames changed, commit and push.

## Results
(filled in as each step lands)

## REQUESTS
(none yet)
