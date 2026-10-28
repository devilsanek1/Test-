# v3 rework assembly, final round: the THREAD fix lane (2026-10-28)

Owns `scenes/thread_plane.tsx`, `kit/*.tsx`, `captions.json`, `scenes.json`, `Film3.tsx`. Findings: R1-7, R3-5, R3-6,
R3-7 (`assembly_review_R1.md`, `assembly_review_R3.md`). Commits a9446f8 (the fixes) and this report. Evidence (stills,
chunks, sheets, the A/B tools `tools/salab.py`, `motionab.py`, `joinab.py`):
`/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/assembly/thread/`.
"Before" = the integrator's `film_full.mp4` (be03dfa; no v3 source commit landed between it and a9446f8); "after" =
chunks rendered at a9446f8 (Film3Final, CRF 18, the same measure on both).

Status: DONE. Three findings fixed, R3-6 fixed for the sway; its jolt half needs the SQE lane (REQUEST 1).

## Findings
- **R1-7 (minor) FIXED: the payoff's thoom at 36.98.** `Film3.tsx` `PAYOFF_THOOM` = `{src: 'v3/v3_thoom.wav', t: 36.98,
  gain: 0.5}` appended to `film3Sfx` (the locked board's `public/v3/animatic.json` untouched). The thoom is a sub boom
  (100 % of its energy under 150 Hz), so the voice stays on top. Momentary loudness 37.1-37.7: -13.9..-11.6 ->
  -13.0..-11.0 LUFS (+0.5 to +0.9 LU); integrated -17.1 -> -17.0 LUFS; true peak -2.42 -> -2.23 dBTP, now at 37.24
  (the thoom under "AI"; the hook's 4.23 peak is -2.40). Everything else in the mix is unchanged (the RMS around 4.04
  and 21.72 is identical to 0.1 dB).
- **R3-5 (major) FIXED: the BETTER van reads at phone size.** `kit/Fleet.tsx` `BETTER_VAN`: the same chassis, length,
  wheels and lane position as the van (its contact shadow and exhaust stay true), with a bigger box (a Luton box: 0.74 of
  the length, 1.2x tall; its roof snow at y 1147 stays under the notice's lowest line, 1144). On the box: the chart's
  10.82 BETTER laptop, a warm-white pill with its 2 px red-brown outline and ink letters at ~h x 0.4 (27 px at rest,
  was 16), over the NEW laptop (lit peach screen, 0.55 of the box) whose lid's top quarter it covers. Off the van's beat
  (its own `line` off) the pill steps to calm with the van's outline, one event (`labelK`, default from `line`).
  Measured in the held x1.35 push: the letters 57 x 13 -> 97 x 23 px (cap height; ~8 pt on a phone); contrast 5.1:1
  (red-brown on cream) -> 16.6:1 (ink on white), calm 2.4:1; the pill's right end x ~934 (< 950, clear of the rail
  from ~32.4, before "better" at 32.60). Top-3 % salience on its beat (32.20-33.10): the van 20-26 % -> 26-33 % (the
  frame's largest region); calm (33.30-34.20) 17 % -> 17-17.5 %; at the 2027 flip (34.80-35.10) the notice keeps 54-55 %
  (was 55 %). SQE/SQF stills at phone size: the word "BETTER" reads in the 0.25 sheet; at 1:1 the pill and laptop are
  clean single shapes.
- **R3-6 (major) FIXED for the sway; the jolt half is REQUEST 1.**
  - Sway: `thread_plane.tsx` `REACT.sway` 24.44 -> 24.95 and `TAG_FULL` [24.44, 25.04] -> [24.95, 25.25]: the DC truck
    drives up the road 24.30-24.95 alone, then the tag swings at full strength in the voice's pause ("dibs." ends
    ~24.88, "Which" starts ~25.30) and steps back under the read push. Top-3 % salience (tag / gate and trucks): 24.60
    65.1 / 14.8 % -> 0 / 37.8 %; 24.75 70.7 / 8.4 -> 0 / 34.4; 24.90 69.7 / 8.7 -> 0 / 33.0; the reaction alone at
    25.00-25.20: tag 72.8-75.2 %. Motion during the drive (24.30-24.90): the tag 17-29 % -> 0.2-0.5 %, gate and trucks
    50-64 % -> 71-93 %. 2-step switches at 24.95 and 25.25 (stills checked).
  - Jolt: kept at 35.95 on purpose. Opening it at 36.25 (R3's fix) puts a 2-step switch and a 7-degree shake inside J5's
    0.4 s (36.16-36.56) and onto its release (36.36-36.98: CRAFT §a "nothing else enters, pops, turns"; §b; flow_v2 §1
    "never inside J5's 0.4 s"), and there is no gap before it: the trucks' motion PEAKS on the jolt (35.90-36.10, 4.1M
    per 0.1 s, 68-72 % of the frame's motion; 2.9M at 36.10-36.20) and truck D drives until 36.33. The cause must end
    sooner, which is the SQE lane's file: REQUEST 1.
- **R3-7 (minor) FIXED: Pip shrugs in its side pose.** `kit/Pip3.tsx` `shrugs` (a shrug in the current pose: the head
  rises and leans out a hair, the heavy-lidded "oh well" face, no key switch so no squash pop); `thread_plane.tsx`
  `PIP_SHRUGS` [{t: 40.40, dur: 0.15, face: 'meh', hold: true}] (after "tag": its last sound ~40.42; still from 40.55,
  when the loop's travel starts), the frontal 'shrug' keys (40.24 / 40.70) removed, the eyes up at you from 40.38.
  Measured: Pip's body fill 0.54-0.59 % of the frame through 40.24-40.62 (the frontal pose, its box reaching x 668 over
  the screen) -> 0.19-0.23 % (the side cling, never left of the phone's edge, x >= 743); its last move at 40.53, the
  face held through the travel and the un-build; the loop's last frames and frame 0 unchanged.

## Checks
- `npx tsc --noEmit -p video`: clean.
- Seam probe (`gate_check.py --seam-comp Film3Seams --seam-scale 1`, the current source; the BETTER van is in J5's
  frames): 0.00 % at all four seams; carriers C C A A C, 0 F; captions PASS.
- J5 (R1's join measure, 108 px): carry / eye jump / colour shift 0.99 / 0.017 / 0.8 -> 0.99 / 0.019 / 0.8.
- SQA: frames 0.50, 1.30, 2.65, 4.20, 5.50 differ from the integrator's render only by codec edge noise and the draft
  label (`diff159.png`): my changes start at 24.95.

## REQUESTS
1. **SQE lane (`outside.tsx` `H2_BEATS` / `vehiclesAt`), for R3-6's jolt:** end the overtake's visible motion before
   the tag's jolt at 35.95 (e.g. `trucks` 35.22 -> ~34.95, `trucksEnd` 36.25 -> ~35.85 with D's +0.08, `nudge` 35.62 ->
   ~35.38, the trucks' and the BETTER van's `line` off by 35.95), so the overtake plays alone and the tag answers it on
   the end of "tighter"; this also clears J5's 0.4 s, where D still drives to 36.33 and the outlines switch off at
   36.25 / 36.35. The tag cannot move to 36.25 (see R3-6).
2. **SQE lane (`outside.tsx` `vehiclesAt`, optional polish for R3-5):** the BETTER van's beat ends mid-word at 33.14
   (`betterEnd + 0.3`): keep its `line` to ~33.40 (the end of "one.") and pass FleetVan `labelK` as a 2-step, so the
   pill steps down in the pause before "But" (the pill follows `line` in one frame until then, with the outline).
3. **Whoever owns `docs/v3/flow_v2.md` (the build spec now differs from the build):** §1 "sway 24.44" -> 24.95 and the
   window "24.44-25.04" -> 24.95-25.25 (after the DC truck's drive, in the voice's pause); §1 "shrug 40.30" and §4 SQF
   "40.30 Pip shrugs" -> "40.40-40.55 Pip shrugs in its side pose (no frontal swap; still before the loop's travel)";
   §7 Kit: Van `better` = the van's chassis with a Luton box carrying the chart's BETTER pill over the NEW laptop (kit
   `BETTER_VAN`). Also the SFX: the payoff's thoom at 36.98 (`Film3.tsx` `PAYOFF_THOOM`).
