# v3 rework assembly, final round: the THREAD fix lane (2026-10-28)

Owns `scenes/thread_plane.tsx`, `kit/*.tsx`, `captions.json`, `scenes.json`, `Film3.tsx`. Findings: R1-7, R3-5, R3-6,
R3-7 (`assembly_review_R1.md`, `assembly_review_R3.md`). Evidence:
`/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/thread/`.

Status: IN PROGRESS (skeleton; each finding's line is filled as it lands).

## Findings
- R1-7 (the payoff's thoom, 36.98): code in (`Film3.tsx` `PAYOFF_THOOM` appended to `film3Sfx`; the locked board's
  `public/v3/animatic.json` untouched); the mix check is next.
- R3-5 (the BETTER van's label, 31.32-33.40): code in (`kit/Fleet.tsx` `BETTER_VAN`: the same chassis and length, a
  taller and longer Luton box; the chart's warm-white BETTER pill with ink letters over the NEW laptop; calm off the
  van's beat). First measure: the letters 57 x 13 -> 97 x 23 px in the held push (32.90), right end x ~934 (< 950).
- R3-6 (the tag's sway 24.44 and jolt 35.95 against the trucks): the sway is moved (`REACT.sway` 24.95, `TAG_FULL`
  [24.95, 25.25]); the jolt is being measured (J5's 0.4 s starts at 36.16).
- R3-7 (Pip's shrug, 40.30): code in (`kit/Pip3.tsx` `shrugs`: a shrug in the side pose; `thread_plane.tsx`
  `PIP_SHRUGS` 40.40-40.55, the frontal 'shrug' keys removed).

## REQUESTS
(none yet)
