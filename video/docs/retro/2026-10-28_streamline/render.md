# Render and engine: wall-clock and compute (streamlining review, 2026-10-28)

Reviewer area: RENDER AND ENGINE. Analysis only. All measurements on a scratch copy of `video/` (`npm ci` there, same
Remotion 4.0.538, same Playwright headless shell 153) in `/tmp/streamline-render/` (harness: `video/bench/*.mjs`,
`bench/*.sh|py`); the repo was not touched. Box: the usual 4-core / 15 GB container, nothing else running. Film:
Film2R (v2r, 2345 frames, 1080x1920, 60 fps), master settings, `draftLabel:false`. **Determinism (the test bed):**
the scratch re-render of the G7 master command is **byte-identical** (file MD5 `cfe247ee...`) to the delivered
`video/deliverables/v2/v2r_G7_master_v1.mp4`, made hours earlier in another container, so a proposal can be proven
by an MD5 against the last delivered master. Only a CHANGE of concurrency moves pixels: 1-2 frames in 120 by
0.002-0.003 % of the pixels, max 3-5 levels (one anti-aliased edge): the "noise floor" (two such masters: 62.7 dB).

## 1. How it works today

- **Two render scripts, Remotion's Node API, one bundle per CALL**: `scripts/render-frames.mjs` (PNG stills) and
  `scripts/render-media.mjs` (video/audio, `--master`). Each call bundles (`render-frames.mjs:75`, `render-media.mjs:69`),
  launches one browser for `selectComposition` and another for the render, then deletes the bundle
  (`render-frames.mjs:121`, `render-media.mjs:100`). Measured: bundle 17.9 s cold / 1.7-1.9 s warm (prod logs 3.6-3.8 s
  under load, `docs/v2/MASTER.md:22`); a 1-frame still = **3.5 s wall, 0.3-0.8 s of it the frame**; an 8-frame sheet
  4.6 s. Defaults: concurrency 2 (frames) / 3 (media); GL = Chrome default unless `GL=`.
- **Every preview tool wraps render-frames.mjs, one call each**: `still.sh:10`, `sheet.sh:26` + a SECOND full call for
  the caption mask (`sheet.sh:35`), `strip.sh:25`, `qa/sheets.sh:36`, `qa/run_all.sh:66` (every frame, 0.5x),
  `review/checkin.sh:14` (one per composition), `capcheck.mjs:81`, `camspeed.py:100`, `gate_check.py:472` (seam probe).
- **Masters and owner cuts**: `render-media.mjs --master` = lossless PNG screenshots piped (image2pipe) into Remotion's
  ffmpeg WHILE rendering (captured argv: `-f image2pipe -vcodec png -i - -c:v libx264 ... -vf zscale=709 limited
  -pix_fmt yuv420p -preset slow -crf 14 -x264-params aq-mode=3`), then the audio is muxed. Concurrency 3
  (`MASTER.md:17`, `ASSEMBLY.md:14`): v2r G5 assembly 10 min 34 s, G7 master **10 min 20 s** on the busy prod box
  (0.26 s/frame), **6 min 28 s** on this idle box. v3's G5b chunked CLI render (swangle): 14 chunks **63.5 min + 26 min
  audio** (`G5_BLOCKING.md:324-333`).
- **`remotion.config.ts:3` sets `swangle`** for every `npx remotion render/still` (CLI). Docs still route gate videos
  through the CLI: `G5_BLOCKING.md:209,215` (the owner's G5 cut), `PIPELINE_V2.md:241`, the v3 G3 reel workflow
  (`context/workflows/v3-g5-s9-pullback-*.js:71`); v2r docs/lanes pass `--gl=angle` (`docs/v2/BUILD.md:67-75`,
  `src/entry-v2r-film.tsx:8`), the masters used the default GL.
- **Chunks**: `film_chunks.py` (scene-aligned ceil boundaries, `--max 360`): Film2R = 11 chunks of 113-341 frames.
- **QA mostly reads the master** (no re-render): `master_sheets.py`, `check_banding.py`, `density.py`, `gate_check.py`,
  `av_lag.py` decode the MP4. Re-renders that must stay (other props / comps): check_light A/B (`lightOff`), the seam
  probe (`FilmNSeams`), capcheck's mask. v1-era 30 fps samplers remain: `run_all.sh:16` (FPS=30, v1
  `src/data/scenes.json`), `strip.sh:21`, `capcheck.mjs:31` (fps = 30): they sample a 60 fps film at every 2nd frame.
- **Entry points**: 21 `src/entry-*.tsx` (not 25). Webpack cache: ~200-400 MB per config hash (`ops/disk_janitor.sh:3`);
  the G7 master had to move TMPDIR to /dev/shm with 0.7 GB free on the root disk (`MASTER.md:15`).

### Where a frame's time goes (measured)
| per frame, concurrency 1 (118 frames, every 20th of the film) | ms |
|---|---|
| seek = React render of the frame (an audio-only pass pays only this) | 74 avg (V2S5 170) |
| capture = paint + raster + composite + PNG, as rendered | 251 avg (V2S1 367, V2S5 400) |
| same with JPEG q80 instead of PNG: the PNG round trip costs ~100 ms (JPEG itself is not usable, §4) | 152 avg |
| **light layers off** (`{"lightOff":true}`) vs on: whole frame | **149 vs 325 (-54 %)**; V2S1 -66 %, V2S3 -65 %, V2S4 -70 % |
- In lit shots one Chrome thread caps throughput: the GPU process's **VizCompositorThread** (software compositor) runs
  at ~95-100 % while 2-4 renderer processes idle at ~20-30 % (box CPU 51-59 % at c2-c4). V2S1, 120 frames at c2: viz
  33.1 s of a 35.7 s wall; raster workers 24.4 s; the JS main thread 5.1 s (~42 ms/frame). Across the film the other
  big cost is the PNG round trip (encode in Chrome, base64, decode in ffmpeg): removing it is F1 (-40 %).
- Why viz: the light module's `mix-blend-mode` groups (`lib/light.tsx:516` Multiply, `:1061` screen). Chrome does not
  paint non-src-over blend groups into the layer; each becomes its own composited layer + render surface that viz
  blends in software. A trace of 20 frames: 123 viz draws (**~6 per output frame**: 1 for the screenshot, ~5 while the
  frame's tiles arrive), ~14.5 render passes each, `SoftwareRenderer::DoDrawQuad` 6.5 s. Ablation on V2S1 (60 frames,
  c1): as is 0.481 s/frame, viz 21.8 s; blend modes removed 0.303 s, viz **1.0 s**; masks removed 0.285 s, viz 12.7 s;
  light off 0.141 s, viz 0.9 s. (Ablations change pixels: diagnosis only.)
- Not the problem: no SVG filters/blur/turbulence in v2r (only `filter: brightness(0)`, `light.tsx:1123`); the sky's
  dither blends are confined to `ditherRects` (~5 ms, `sky.tsx:28-29`); path measures are cached and bounded
  (`Ink.tsx:35-46`, `Fill.tsx:44-55`); JS is ~23 % of a frame. GL `angle`, `egl`, `swiftshader`, `angle-egl` = default,
  pixel-identical and same speed (no GPU); **`swangle` = 12.4 s/frame (45x) and 36 % of the pixels different**.

## 2. Findings, ranked by expected saving
Film-level numbers are in the table in §3. "V2S1" = 120 lit, viz-bound frames (f60-179) at full size, where today's
one-step `--master` c3 takes 0.354 s/frame.

**F1. Use Remotion's own Chrome build: a raw-frame path with no PNG round trip. Saving: -40 % of the whole film
(6:28 -> 3:51). Risk: low (needs a test; done here, passes). Effort: S.**
- Evidence: with `chrome-headless-shell` 157.0.8080.0 (Remotion 4.0.538's default download, from remotion.media,
  reachable here) Remotion feeds ffmpeg raw frames over shared memory (`-f remotionshm`; no PNG encode, base64 or
  decode). Its renders are pixel-identical to Playwright 153's (118 frames across the film: 0 differing pixels), and on
  V2S1 the master stream was MD5-identical. Over the film the raw route rounds the RGB->YUV step slightly differently:
  not MD5-equal (PSNR 54.1 dB to the PNG-route master, min 47.2), but exactly as faithful to the lossless frames
  (39.138 vs 39.137 dB, same mean colour error), and `check_banding` gives the same verdicts on the master's sky regions.
- Proposal: `npx remotion browser ensure` once per container and point `remotion.config.ts:2`, `render-frames.mjs:32`
  and `render-media.mjs:61` at it (or drop the hard-coded Playwright path).
- Test (the owner's yes, once): `bench/psnr_sampled.py` against the lossless frames >= today's, `check_banding` on the
  43 sky measures of `MASTER.md` unchanged, a look at the master side by side.

**F2. Render with several browser processes (each has its own viz thread). Saving: with F1, 3 parallel chunks =
-55 % of the film (6:28 -> 2:56); without F1, 2 browsers -> PNG -> one encode = -18 % (V2S1 -33 %). Risk: low (review
cuts: none). Effort: S-M.**
- Evidence: one browser tops out at c2-c3 (V2S1 c1 0.437, c2 0.291-0.297, c3 0.310, c4 0.322 s/frame); 2 processes x c2:
  0.207, 3 x c2: 0.186. The PNGs equal one browser's (0 differing pixels); fed in order to Remotion's exact master argv
  they give an MD5-identical stream on V2S1 and, over the film, a master within the noise floor (65.4 dB to the
  one-browser master, 39.137 dB to the lossless frames). Separate chunk encodes + stream-copy concat: seamless timing
  (keyframe at the seam, 1/60 pts steps, 2345 frames, 39.104 s) but each chunk's last 2 frames lose 0.25-0.5 dB (film:
  f780 at 36.58 dB, under today's worst frame, 37.11; mean -0.016 dB); sky verdicts unchanged.
- Proposal: `render-media.mjs --parallel=K` (K = free cores / 2): masters = K renders of frame ranges, then ONE encode
  (raw frames or PNGs in order) + the audio mux; review cuts and lane clips = K `film_chunks.py` chunks + concat.
- Test: masters: within the noise floor of a one-step master (PSNR >= 60 dB to it, fidelity to the lossless frames
  equal); chunked masters only with the owner's yes (the chunk-end dip is measurable, not visible at CRF 14).

**F3. The CLI renders at `swangle`: 45x slower and different pixels. Saving: hours per CLI render (a 2345-frame
full-size CLI cut ~ 2-8 h at 2.9-12.4 s/frame vs 3-7 min). Risk: none (removes a pixel mismatch). Effort: S.**
- Evidence: V2S5 f1240-1269 at c2: default 0.277, swangle 12.4 s/frame (v3's Film3: 2.9, `G5_BLOCKING.md:331`); 36 %
  of the pixels differ, max 63 levels (masters use the default). CLI video renders also default to JPEG q80 frames and
  CRF 18, so an owner cut made that way bands the sky the master won't (PIPELINE_V2 "Master encode").
- Proposal: delete `setChromiumOpenGlRenderer('swangle')`; route every gate video through `render-media.mjs` (master
  settings, F1/F2 speed); fix `G5_BLOCKING.md:209,215`, `PIPELINE_V2.md:241`, HANDOFF §5.
- Test: a CLI-vs-script frame diff after the change = 0.

**F4. The light layers' blend groups are 54 % of the film's frame time: keep the pixels, lose the compositor work.
Saving: up to ~35 % of a lit frame (estimate, from the ablation). Risk: needs a test. Effort: M-L.**
- Evidence: §1 (V2S1: blend modes removed 0.481 -> 0.303 s/frame, viz 21.8 -> 1.0 s); every `mix-blend-mode` group is
  a render surface re-blended ~6 times per output frame. V2S1's files place 23 light groups (9 `ShadowLayer`, 8
  `FormShade`, 6 `Shade`); the trace shows ~14.5 render passes per draw.
- Proposal: an engine spike in `lib/light.tsx`, one shot first: merge multiply groups where nothing is drawn between
  them (`Multiply shared`, light.tsx:510-519), cut masks to the frame instead of REGION 2280 x 3120 px
  (light.tsx:532-540), JS-premultiplied flat colours where a shadow lies on one flat fill (`multiply()`,
  light.tsx:102-111). Ship only what is pixel-identical.
- Test: `FilmNBare` + `FilmN` stills, 3 per shot + every join, before/after, `bench/imgdiff.py`: 0 differing pixels
  (or the noise floor); `check_light.py` on the 17 master stills unchanged.

**F5. A scene-level render cache is feasible and seamless; worth it after F2. Saving: a one-shot fix re-renders only
its chunk(s): V2S4 = 341 frames, 15 % of the film. Risk: low (exact key). Effort: M (~1 day).**
- Evidence: rendering is a pure function of the frame (f60-179 in one range vs split at f120 over two browsers: 0
  differing pixels; whole-film byte-identity above); concat timing seamless (F2); `film_chunks.py` already cuts on
  Film's scene boundaries.
- Key per chunk: SHA of (a) the esbuild metafile input list of the chunk's scene module(s) (esbuild is in
  node_modules), (b) `lib/Film.tsx`, the film shell, palette, `scenes.json` rows, the `captions.json` pages overlapping
  the chunk, inputProps, public files referenced, (c) Remotion + Chrome versions, GL, scale, encode argv. A `lib/` file
  in the closure invalidates every chunk that imports it. Film draws BOTH shots in a transition window, so let
  `film_chunks.py` give each join's window (0.4-1.1 s) its own chunk: a fix inside V2S4 then re-renders V2S4's interior
  and its two join chunks, not 3 shots.
- Cache: for masters the chunk's frames (PNG ~620 KB/frame, ~1.5 GB per film) and ONE re-encode (~45 s); for review
  cuts the encoded chunk + concat. Test: a cached rebuild = a from-scratch render of the same commit (MD5).

**F6. Chunked renders: mux the premixed audio instead of an audio-only render. Saving: v3 paid 26 min; now seconds.
Risk: none. Effort: S.**
- Evidence: Film2R's audio is ONE file (`public/v2r/cues.json`: `audio: v2r/mix.wav`, `sfx: []`; played from 0,
  `lib/Film.tsx:882`); an audio-only render still seeks every frame (74 ms/frame here).
- Proposal: when `cues.json` has `audio` and no `sfx`, encode `mix.wav` and mux it; else one `--codec=wav` pass.
- Test: `av_lag.py` lag 0 ms / r 1.00 against `mix.wav`, ebur128 -14 LUFS / -1 dBTP (the `MASTER.md` checks).

**F7. Previews pay a bundle + two browser launches per call. Saving: 2-4 s of every 3.5 s still (60-80 %), ~2x on
every `sheet.sh`. Risk: none (same bundle, same renderer). Effort: S-M.**
- Evidence: §1 (the bundle is rebuilt and deleted on every call; `sheet.sh` makes a second full call for the mask).
- Proposal: cache the bundle by a hash of `src/` + `public/` (keep `serveUrl`, reuse with `--serve`), one
  `openBrowser()` instance for `selectComposition` and the render (`puppeteerInstance`), one `sheet.sh` call for both
  passes; optionally a preview daemon (bundle + warm browser: a still in ~0.5 s). A review pack over a cut
  (`tokens.md`'s qa_pack) decodes its sheets from the cut's MP4 (`master_sheets.py`) instead of re-rendering.
- Test: PNG bytes equal to the current script's output for the same frames.

## 3. Quick wins vs bigger changes

**Quick wins (no pixel change; each proven or checkable by an MD5 / 0-pixel diff):**
1. F3: drop `swangle` from `remotion.config.ts`; gate videos via `render-media.mjs`, never the bare CLI.
2. F6: mux `mix.wav` for chunked renders.
3. F7: bundle cache + one browser per call + one call per `sheet.sh`.
4. F2 for review cuts and lane clips: parallel chunks + concat.
5. The v1-era 30 fps samplers (`run_all.sh:16`, `strip.sh:21`, `capcheck.mjs:31`) to the composition's fps (QA
   correctness; costs frames, not time saved: flagged for `codebase.md`).

**Bigger changes (owner's yes + the named test):** F1 (the test is above and already passes here), F2 for masters,
F5, F4 (one shot first).

**The whole film, measured** (Film2R, 2345 frames, 1080x1920, master settings, this box, one run each):

| variant | wall | vs today | output vs today (= the delivered G7 master) |
|---|---|---|---|
| today: one-step `--master`, c3 | 6:28 (387.5 s) | - | byte-identical to the delivered file |
| one-step, c2 | 7:02 (422.3 s) | +9 % | noise floor: 62.7 dB to today; 39.137 dB to lossless = today |
| **F1**: Remotion's Chrome (raw frames), one-step, c2 | **3:51 (230.8 s)** | **-40 %** | same rendered pixels; 54.1 dB to the c2 master; 39.138 dB; sky verdicts equal |
| F2: 2 browsers x c2 -> PNG -> one exact encode | 5:20 (319.6 s) | -18 % | noise floor: 65.4 dB to the c2 master; 39.137 dB |
| **F1+F2**: 3 parallel chunks (Remotion's Chrome, c1) + concat | **2:56 (176.2 s)** | **-55 %** | 53.1 dB; 39.121 dB, chunk-end dip; sky verdicts equal |

dB = PSNR over all frames (to today) or over 118 sampled frames (to the lossless PNG renders); "sky verdicts" =
`check_banding` on `MASTER.md`'s regions (S2 7.0/11.0 s, S8 34.0 s WARN at caption boxes, S6 25.0 s PASS) in every
file. On the prod box today's master took 10:20: expect ~6:10 with F1 and ~4:40 with F1+F2 (same ratios; estimate).

## 4. Rejected ideas
- **Concurrency 2 instead of 3 for one-browser masters**: wins on viz-bound V2S1 (0.304 vs 0.354 s/frame, -14 %) but
  loses on the whole film (+9 %, table): lighter shots are raster-bound and use the third tab. Keep c3.
- **JPEG intermediates.** q80 saves ~100 ms/frame of capture but halves the sky's dither and bands it (PIPELINE_V2
  "Master encode", sky research §5); q100 is still a lossy DCT on a +-1-2 code dither. F1's raw path is faster and
  lossless.
- **More concurrency in one browser** (c4): no faster than c3 (0.351 vs 0.354 s/frame on V2S1; viz-bound).
- **Other GL backends** (`angle`, `egl`, `swiftshader`, `angle-egl`): pixel-identical to default and the same speed in
  this GPU-less box. `vulkan` not tested (no GPU).
- **Chrome/Remotion knobs with no gain** (measured): `captureBeyondViewport:false` (0.286 vs 0.291 s/frame),
  `DISABLE_FROM_SURFACE` (0.340, 1 frame different), `--run-all-compositor-stages-before-draw` (0.319).
- **A faster x264 preset / higher CRF for masters**: changes the encode, and the encode is ~12 % of a one-step master
  (standalone 30-37 ms/frame). Rejected: quality is fixed.
- **Lower scale or 30 fps for owner cuts**: owner cuts are full size at 60 fps (`G5_BLOCKING.md:212-215`; 0.5x
  flickers the float camera). Lane-level 0.4-0.5x previews stay as they are.
- **Memoising static layers**: JS is ~74 ms of a ~325 ms frame and the expensive geometry is already cached; the cost
  is compositing and the PNG round trip, not JS.
- **QA frames from the master instead of re-rendering**: already done where exact (`master_sheets.py`); check_light's
  A/B, the seam probe and capcheck's mask need their own props/compositions, so they stay.
