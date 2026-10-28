# v3 rework assembly, the FINAL step (G8): the master, its checks, the cover, 2026-10-28

Lean run (the owner is near the token limit): ONE full-film render (the master), spot checks only, <= ~12 images looked at.
Work folder: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/final_master/`.

## Step 1: typecheck + flow_v2 (doc only)
- `npx tsc --noEmit -p .` in `video/` (the project's TypeScript 5.9.3): 0 errors. Note: `npx tsc --noEmit -p video` run from
  the repo root picks up a global TypeScript 6.0.2 instead (the root has no node_modules) and reports 5 `lib` errors in S9
  files (padStart / flatMap / Object.entries); run it from `video/`.
- `docs/v3/flow_v2.md` now matches the build: §4 SQE/SQF (the overtake 34.95-35.93, nudge 35.38, every outline off by 35.95;
  the BETTER van's beat to 33.40; the payoff's rows 37.18 / 37.36 / 37.54 / 37.72 with the thoom; the workers load truck B
  only during 26.22-28.46), §3 the factory wall L* 65, §4 SQD + §5 SQD light (the REVEAL lane's wording, verbatim). Also the
  lanes' other open spec requests, checked against the code: §1 sway 24.95 and its window 24.95-25.25, Pip's side-pose shrug
  40.40-40.55; §3 the SQB float locked 6.45-9.30, the strip settle 6.20-6.65, the 5 scheduled skylight flakes from 9.0; §4
  SQB the 11.80 past-year band; §7 the BETTER van's Luton box.

## Step 2: the master (in progress)
- Render: `node scripts/render-media.mjs Film3Final deliverables/v3/v3_final.mp4 --entry=src/entry-v3-film.tsx --master
  --concurrency=2` (one run, code at c23bd54 = eaa8761 + docs), running.
- Loudness, done on the film's audio mix (rendered once as WAV: `render-media.mjs Film3Final ... --codec=wav`, so the AAC
  is encoded once): the mix is -17.0 LUFS integrated, LRA 4.0 LU, true peak -2.2 dBTP (at 37.24, the payoff's thoom;
  4.23 the hook's, -2.4). A linear +3.5 dB would put the peaks at +1.3 dBTP, so loudnorm's linear mode needs the peaks
  down first: a true-peak limiter at 4x oversampling (192 kHz, `alimiter` limit -5.5 dBFS, 5 ms look-ahead, 80 ms
  release, latency compensated) touches 46 short peaks (0.1 % of the samples; voice plosives and the hits) by up to
  3.3 dB, then two-pass `loudnorm` I -14 / TP -2 / LRA 20, pass 2 `linear=true` (confirmed: "normalization_type":
  "linear", one constant gain), AAC 320k 48 kHz. Result (ebur128, on the AAC): -13.9 LUFS, LRA 3.3 LU, true peak -1.9
  dBTP.
- check_light (light off/on stills, Film3Final, R2's subject boxes): 20.8 LIGHT OK (the brightest 5 % 0.016 H from the
  pile; R2's run 0.131 H), warm-lit 2.4 %; 21.4 LIGHT OK (0.149 H, as before), warm-lit 7.1 %, 3 light shapes each
  >= 4 L* over their ground. Warm-lit under CRAFT's 8-15 % is information (the reveal's dusk, the street calmed).
