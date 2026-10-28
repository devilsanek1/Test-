# v3 rework assembly: independent review R2, THE LOOK (clean, premium, light), 2026-10-28

Lens: the line (CRAFT §c), the light and shadow (§d), the depth (§f), full but calm (§b, `density.py --cozy`), every
sequence against the approved hook pilot SQA (`deliverables/v3/v3_rework_pilot.mp4`). The film under review:
the integrator's `film_full.mp4` (2469 frames, 1080 x 1920, 60 fps, code at be03dfa). Judged only against the owner's
words and the rules. Work in progress: this file is written as the review goes.

## Status
- [x] read the rules and the integrator's report
- [x] sheets at full and phone size
- [x] line budgets per sequence (`retro_tools/line/measure.py`, 39 film frames + 5 pilot frames, caption band out)
- [x] light per set (`check_light.py`, 21 light-off/on pairs rendered from the code at HEAD; v3 code unchanged since be03dfa)
- [x] fullness and calm (`density.py --cozy` on the film, per sequence)
- [ ] depth (far planes), 1:1 crops of the worst areas
- [ ] findings

## Numbers so far (evidence: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/R2/`)
- **Line** (per Mpx, band out; budget strokes 80 / short 25 / ends 40 / dark px 3 %): the pilot itself runs 98-194 strokes,
  74-172 short, 207-391 ends, 0.76-1.16 % dark (text and flat dark shapes count: the integrator's "accepted as in the
  pilot"). The film sits inside the pilot's own range everywhere: SQB 101-146 / 81-112 / 192-273; SQC 100-167 / 83-149 /
  192-333; SQD 53-120 / 48-116 / 90-240; SQE 124-156 / 116-144 / 232-308; SQF 123-136 / 108-119 / 251-296; dark px
  0.17-1.17 %. SQA in the film = the pilot (to +-5 strokes). No sequence is rougher than the pilot by this measure; the
  defects below are shapes and texture the line mask does not count.
- **Light** (`check_light.py`): SQB 8.5 / 12.5 / 14.9 OK (brightest 5 % on the card, 0.00-0.04 H; shadow shapes 11.5-12 %;
  no light shape in the frame: the lamp's pool is off-frame left); SQC 17.7 brightest 5 % 0.151 H off the listing laptop
  (the white listing page below it; marginal), 18.5 / 18.88 on the stick (0.00 H); the caption-band FAILs at 2.0 / 4.5
  (the pilot) and 18.5 / 18.88 are the known highlight-box false positive. SQD 19.7: the light layer touches 2.4 % of the
  frame (rim + contact under THE stick only); 20.8: brightest 5 % on the town's caps below the pile (0.13 H off a pile box
  reaching y 1400); 21.4 / 22.0 OK. SQE warm-lit 7.9-12.7 % (CRAFT 8-15: E11's 4.9-7.0 % fixed), brightest 5 % on each
  beat (0.00-0.02 H). SQF 37.2 0.065 H, 38.9 / 40.1 0.00 H, warm-lit 5.5 %.
- **Fullness and calm** (`density.py --cozy`): movers / empty frames / cv: SQA (the pilot) 3.6 / 9 % / 2.10; SQB 1.7 / 55 %
  / 2.50; SQC 4.1 / 39 % / 1.05; SQD 1.6 / 59 % / 1.77 (76 track jumps: a crane, not a hold); SQE 2.4 / 5 % / 1.76; SQF
  2.0 / 21 % / 1.41. Fullness: flat 30-40 %, detail 20-29 % (the pilot 25 %); SQB the emptiest (detail 20 %, static 58 %).
- **The pile** (dark chip marks in y 620-1800): 19.7 231, 20.0 358, 20.4 730, 20.8 596 (573 / Mpx at 20.4) against the
  pilot's room 152-198 (119-155 / Mpx); detail tiles 30 % at 20.8 (pilot 10-15 %); its fills tan-brown (#966D58 L* 50 C*
  23, #B08361 L* 58 C* 28, #D4AC7C L* 73 C* 31) under THE stick's gold (#EFB063, L* 76, C* 50).

## Verdict
(pending)

## Scores
(pending)

## Findings
(pending)
