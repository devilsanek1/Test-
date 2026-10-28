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

## Step 2: the master
- Render: `node scripts/render-media.mjs Film3Final deliverables/v3/v3_final.mp4 --entry=src/entry-v3-film.tsx --master
  --concurrency=2`, ONE run, no chunking needed (code at c23bd54 = eaa8761 + docs): 2469 frames in 1224 s, PNG frames,
  BT.709, x264 CRF 14 slow aq-mode 3. Raw file 18.3 MB, its audio -17.0 LUFS / -2.3 dBTP (kept in the work folder as
  `v3_final_raw.mp4`).
- The posted file `deliverables/v3/v3_final.mp4` = that video stream COPIED (stream MD5 identical before and after) + the
  normalised audio below, `-movflags +faststart`: **18.0 MB (17,991,827 B)**; ffprobe: H.264 High, yuv420p, 1080x1920,
  60/1 fps, 2469 frames, 41.150 s, colour primaries / transfer / matrix BT.709, range tv (limited), `colr nclx 1/1/1` in
  the container, atoms `ftyp moov free mdat` (faststart); AAC LC 48 kHz ~260 kb/s, starts 0.000, 41.150 s.
- Loudness, done on the film's audio mix (rendered once as WAV: `render-media.mjs Film3Final ... --codec=wav`, so the AAC
  is encoded once): the mix is -17.0 LUFS integrated, LRA 4.0 LU, true peak -2.2 dBTP (at 37.24, the payoff's thoom;
  4.23 the hook's, -2.4). A linear +3.0 dB would put the peaks at +0.8 dBTP, so loudnorm's linear mode needs the peaks
  down first: a true-peak limiter at 4x oversampling (192 kHz, `alimiter` limit -5.5 dBFS, 5 ms look-ahead, 80 ms
  release, latency compensated) touches 46 short peaks (0.1 % of the samples; voice plosives and the hits) by up to
  3.3 dB, then two-pass `loudnorm` I -14 / TP -2 / LRA 20, pass 2 `linear=true` (confirmed: "normalization_type":
  "linear", one constant gain), AAC 320k 48 kHz. Result (ebur128, on the AAC): -13.9 LUFS, LRA 3.3 LU, true peak -1.9
  dBTP.
- check_light (light off/on stills, Film3Final, R2's subject boxes): 20.8 LIGHT OK (the brightest 5 % 0.016 H from the
  pile; R2's run 0.131 H), warm-lit 2.4 %; 21.4 LIGHT OK (0.149 H, as before), warm-lit 7.1 %, 3 light shapes each
  >= 4 L* over their ground. Warm-lit under CRAFT's 8-15 % is information (the reveal's dusk, the street calmed).
- Banding (`check_banding.py` on the master, open-sky regions found by colour, the caption band left out): SQA's window sky
  (200,648,312,740) at 1.0 / 2.0 / 3.2 PASS; SQD's summit sky (8,8,1064,280) at 19.6 / 20.0 / 20.2 PASS; SQD's wide
  (8,8,520,280) at 21.9 / 22.4 PASS; H2's sky (24,8,560,280) at 27.1 / 33.0 / 37.55 / 40.0 PASS. No FAIL. (A first SQA
  region down to y 856 took in a flat cloud and FAILed on its edge, dL* 4.2: a shape, not a band; v3's skies are flat
  fills, so there is no gradient to band.)
- `gate_check.py` (Film3Final, `--seam-comp Film3Seams --density`): fps, duration (2469 = ceil(41.150 x 60)), audio in
  sync, the 4 seams (<= 0.02 % of the pixels > 4 L*, no cut), cuts (J3's push turns at frame 1164), carriers C C A A C (0 plain cuts),
  captions (23 pages in the band): PASS. WARN: 17 cut-like in-shot events; caption page 2 has 23 characters (accepted in
  the pilot). FAIL, information only (DIRECTION: never a quota): density film average 6.4 events/s, gap 2.67 s, static
  38 %, flat 35 %, detail 23 % (SQB static 64 %: the locked draw; integrator 35 %).

## Step 3: spot checks (frames only, no re-review)
Sheet: `/tmp/claude-0/-home-user-Test-/e0b06496-a313-5ced-bf0f-bc634eb12744/scratchpad/rework/final_master/spot/sheet_full.jpg`
(16 frames of the master, 0.355 scale; viewed as its 4 row tiles `sheet_full_r1-4.jpg`) and the phone-size copy
`.../spot/sheet_phone.jpg` (0.18); the 1:1 summit crop `.../spot/crop_summit_1970_1to1.png`. 40.8 added: at 40.5 the
tag still shows its back ("AI"; the turn back starts 40.55).
- Window strip vs the card (6.6 / 9.0 / 12.5): ok. The strip is a calm dusk band; the card, the line, the doodles and the
  past-year band read first.
- Summit (19.7 / 20.4): ok. Memory sticks: THE stick crisp on top, the crest sticks with chips and pin combs, clean flat
  shapes, no pallets or bricks at 1:1. At phone size the crest's dark chips (the darkest marks in the frame, the reveal's
  declared exception) still make a blocky dark band under THE stick: a note, not a break.
- Pile at rest (22.4 / 27.1 / 33.0 / 35.95 / 37.x / 40.x): ok. A calm gold mountain in three flat values. At 20.8 the
  boards are still converging (inside the fast pull-back).
- Payoff rows (37.2 / 37.55): ok. Frame-to-frame change shows the four steps at frames 2231 / 2242 / 2253 / 2264 (37.18 /
  37.37 / 37.55 / 37.73), 1.9-2.8 k px each; one row lit at 37.2, three at 37.55; the sign's one event at 36.98 (2-step).
- The loop's front (R1-6): ok. $1,099 under the struck $999, in full colour at 40.8 (from ~40.7 to the erase).
- The loop onto frame 0: ok. 41.1 and frame 0 are the same drawing state; the seam step f2468 -> f0 changes 0.41 % of
  the pixels, like its neighbours (0.29-0.35 %): no pop.
- Also seen: 33.0 the BETTER pill reads; 35.95 the tag jolts after the overtake has ended; 27.1 the "~5x" notice.
- No clear break, so no fix and no re-render: the master stands.

## Step 4: the cover
- `deliverables/v3/cover.png` re-rendered from Cover3 at **frame 192 (3.2 s)**, full size (1080 x 1920; render-frames.mjs,
  the master's GL), the same moment as before, now the reworked hook: the phone's listing with its tag at full strength,
  $999 struck and $1,079, under the window's lit AI DATA CENTER sign (the sticks have landed, the phone not yet lowered:
  a still, clean frame); the title on the wall above the window, clear of the sign and the tag; title, sign and tag
  inside the 3:4 profile-grid crop (y 240-1680). Looked at once at full size and once at 270 x 480: the title, "AI DATA
  CENTER" and "$1,079" all read at phone size.
