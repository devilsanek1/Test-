# v3 rework assembly, final round: the WINDOW fix lane (outside.tsx, h2_window.tsx, SQE*, SQF*), 2026-10-28

Status: DONE (lean, after the orchestrator's stop: R1-1, R1-4 and THREAD REQUEST 1 + 2 only). Commits: 3d1af6f, b1d1e01 (the orchestrator's checkpoint of the rows), this one. "Before" = HEAD 4634564. Measures are R1's (CRAFT §e, captions masked, 540 wide) on 0.5-scale stills and short chunks. Evidence: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/window/`.

1. **R1-1 fixed (the band), the subject target not met.** Changes: the wall `WALL_BRICK` goes L* 51 -> 65 (C* 28 kept); the wall's cap becomes a 6 px lid at L* ~84.5; the calm notice's binding goes L* 48 -> ~64 (the band's main remaining source was the calm notice's dark header). Result: the wall band (y 944-972) drops from 14-24 % to 2-3 % of the top-3 % salience at the queue's beats. It still holds 14-15 % on the 5x and 2027 beats, but that is the notice's own header, i.e. the subject. The beat's subject goes from 9-36 % to 11-42 %, short of the 60 % target: the vans are small at this size, and that is R3-4's push (deferred).
2. **R1-4 fixed.** From 36.98 the payoff's four rows light one band per syllable across the facade's visible part, at the sign's lit value (37.18 / 37.36 / 37.54 / 37.72). Each step changes 1,600-1,780 -> 2,200-3,170 px (the hook's rows: 1,800-3,300 by the same measure). The longest near-still run in 36.9-38.2 goes 0.78 -> 0.33 s. The data center's salience at 37.2 / 37.55 went 52 -> 70 / 77 %, measured on the first version of the rows.
3. **THREAD REQUEST 1 + 2 done.** The overtake now runs 34.95-35.93 (BETTER is nudged at 35.38) and every outline is off by 35.95. The BETTER van's beat ends at 33.40 with a 2-step pill (`labelK`). Motion share on the jolt (35.90-36.10): the tag 25 -> 80 %, the street 72 -> 12 %. Over 36.10-36.36 the street goes 75 -> 3 %.
4. **The minors are deferred (token budget), but four were already in 3d1af6f before the stop and are kept, lightly checked:**
   - R1-5: the workers' trips run between the beats. Their motion share at 27.1 / 31.45 / 32.3 goes 20 / 19 / 23 -> 2 / 2 / 5 %.
   - R1-6: the loop's front shows $1,099. Not checked by eye.
   - R2-4: the planner sits one value toward the desk (dL* 19 -> ~10); it is out of the squint's darkest 3 %.
   - R2-5: the calm data center (`HALL_K` 0.55, one roof band) goes dE 19.5 -> 12.6 to the air, so the depth ladder WARN is gone.
   - R3-4: not done.
   - To drop any of the four, revert its hunk in 3d1af6f.
5. **Checks.** `npx tsc --noEmit -p video` is clean. The seam probe (Film3Seams, 0.5 scale) gives 0.00 % at J1, J2, J4 and J5. The phone look at 0.25 (26.25-38.80) is fine.

## REQUESTS
- flow_v2 owner (§4 SQE/SQF): overtake 34.95-35.93, nudge 35.38, BETTER beat to 33.40; payoff rows on 37.18 / 37.36 / 37.54 / 37.72; factory wall L* 65; workers load B 26.22-28.46 only.
- Next render: confirm the SQE queue's subjects at full size. They hold 11-42 % of the top salience, and a fix is R3-4's push (land J4 on the pushed framing).
