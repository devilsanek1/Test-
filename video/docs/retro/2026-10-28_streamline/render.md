# Render and engine: wall-clock and compute (streamlining review, 2026-10-28)

Reviewer area: RENDER AND ENGINE. Analysis only. All measurements on a scratch copy of `video/` (`npm ci` there, same
Remotion 4.0.538, same Playwright headless shell 153) in `/tmp/streamline-render/` (harness: `video/bench/*.mjs`,
`bench/*.sh|py`); the repo was not touched. Box: the usual 4-core / 15 GB container, nothing else running. Film:
Film2R (v2r, 2345 frames, 1080x1920, 60 fps), master settings, `draftLabel:false`. **Determinism (the test bed):**
the scratch re-render of the G7 master command is **byte-identical** (file MD5 `cfe247ee...`) to the delivered
`video/deliverables/v2/v2r_G7_master_v1.mp4`, made hours earlier in another container. So every proposal below can be
proven by an MD5 against the last delivered master. Only a CHANGE of concurrency moves pixels: 1-2 frames in 120 by
0.002-0.003 % of the pixels, max 3-5 levels (one anti-aliased edge, x 650-730 / y 1116-1253): the "noise floor".

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
- **Masters and owner cuts**: `render-media.mjs --master` = lossless PNG frames piped (image2pipe) into Remotion's ffmpeg
  WHILE rendering; the exact command (captured): `-f image2pipe -vcodec png -i - -c:v libx264 ... -vf zscale=709 limited
  -pix_fmt yuv420p -preset slow -crf 14 -x264-params aq-mode=3`, then audio muxed. Masters run at concurrency 3
  (`MASTER.md:17`, `ASSEMBLY.md:14`): v2r G5 assembly 10 min 34 s, G7 master **10 min 20 s** (0.26 s/frame).
  v3's G5b chunked render (CLI, swangle): 14 chunks **63.5 min + 26 min audio** (`G5_BLOCKING.md:324-333`).
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
  the G7 master had to move TMPDIR to /dev/shm with 0.7 GB free on the root disk (`MASTER.md:15-16`).

### Where a frame's time goes (measured)
| per frame, concurrency 1 (118 frames, every 20th of the film) | ms |
|---|---|
| seek = React render of the frame (an audio-only pass pays only this) | 74 avg (V2S5 170) |
| capture = paint + raster + composite + PNG, as rendered | 251 avg (V2S1 367, V2S5 400) |
| same with JPEG q80 instead of PNG (not usable for masters, below) | 152 avg |
| **light layers off** (`{"lightOff":true}`) vs on: whole frame | **149 vs 325 (-54 %)**; V2S1 -66 %, V2S3 -65 %, V2S4 -70 % |
- Throughput at 1080x1920 is capped by ONE Chrome thread: the GPU process's **VizCompositorThread** (software
  compositor) runs at ~95-100 % while 2-4 renderer processes idle at ~20-30 % (CPU use 51-59 % of the box at c2-c4).
  V2S1, 120 frames at c2: viz 33.1 s of a 35.7 s wall; raster workers 24.4 s; the JS main thread 5.1 s (~42 ms/frame).
- Why: the light module's `mix-blend-mode` groups (`lib/light.tsx:516` Multiply, `:1061` screen). Chrome does not
  paint non-src-over blend groups into the layer; each becomes its own composited layer + render surface that viz
  blends in software. A trace of 20 frames: 123 viz draws (**~6 per output frame**: 1 for the screenshot, ~5 while the
  frame's tiles arrive), ~14.5 render passes each, `SoftwareRenderer::DoDrawQuad` 6.5 s. Ablation on V2S1 (60 frames,
  c1): as is 0.481 s/frame, viz 21.8 s; blend modes removed 0.303 s, viz **1.0 s**; masks removed 0.285 s, viz 12.7 s;
  light off 0.141 s, viz 0.9 s. (Ablations change pixels: diagnosis only.)
- Not the problem: no SVG filters/blur/turbulence in v2r (only `filter: brightness(0)`, `light.tsx:1123`); the sky's
  dither blends are confined to `ditherRects` (~5 ms, `sky.tsx:28-30`); static geometry is memoised (`ENGINE.md` §12);
  JS is ~23 % of a frame. GL modes `angle`, `egl`, `swiftshader`, `angle-egl` = default, pixel-identical and same speed
  here (no GPU); **`swangle` = 12.4 s/frame (45x) and 36 % of the pixels different (max 63 levels)**.

## 2. Findings, ranked by expected saving
All s/frame figures: 120 frames of V2S1 (f60-179, a lit, viz-bound shot) at full size, unless marked "film".
Production today = one-step `--master`, concurrency 3: **0.354 s/frame** (frames only, no encode: 0.310).

**F1. Render with 2-3 browser processes, not one (the viz thread is per browser). Saving: -33 % (bit-identical
master) to -53 % (chunked) of every full-size render. Risk: none / low. Effort: S-M.**
- Evidence: one browser tops out at c2 (c1 0.437, c2 0.291-0.297, c3 0.310, c4 0.322 s/frame, frames only); two
  processes x c2 on the two halves: **0.207**; 3 x c2: 0.186; 3 x c1: 0.200 (`par.sh`). The PNGs are pixel-identical
  to the one-browser render (0 differing frames of 120). Fed in order to Remotion's own master ffmpeg command, they give
  a video stream **MD5-identical** to `render-media.mjs --master` (encode alone: 30-37 ms/frame, 3.6 s per 120 frames).
  So: 2 x c2 to PNG on /dev/shm + one identical encode = 0.237 s/frame, same file. Parallel `renderMedia` chunks
  (each its own encoder) + stream-copy concat: 0.212 (2 x c2), 0.177 / 0.166 with Remotion's Chrome (F3).
- Proposal: (a) masters: `render-media.mjs --master --parallel=2` = K child renders of frame ranges to PNG on /dev/shm,
  then ONE encode with the exact argv Remotion builds (or pipe in order as ranges finish), then mux audio; (b) gate
  cuts and lane clips: K parallel chunk renders (`film_chunks.py` ranges) + stream-copy concat (timestamps checked:
  120 frames, 2.000 s, a keyframe at the seam, pts steps of 1/60).
- Test (a): MD5 of the video stream (`ffmpeg -i X -map 0:v -c copy -f md5 -`) against today's one-step master of the
  same commit, or, given the noise floor, decoded frames equal except <= 0.01 % px at <= 5 levels. Test (b): per-frame
  PSNR against the PNG frames (`bench/psnr.py`): chunked encodes measured -0.03 dB mean, -0.25..-0.45 dB only on a
  chunk's last 2 frames (CRF 14 encoder restart, invisible) -> fine for review cuts, not for the master unless the
  owner accepts it.

**F2. The light layers' blend groups are 54 % of the film's frame time; keep the pixels, lose the compositor work.
Saving: up to ~35 % of a lit frame on top of F1 (estimate). Risk: needs a test. Effort: M-L.**
- Evidence: §1 table and ablation (V2S1: blend modes removed 0.481 -> 0.303 s/frame at c1, viz 21.8 -> 1.0 s); each
  `mix-blend-mode` group becomes a render surface that viz re-blends ~6 times per output frame.
- Proposal: an engine spike in `lib/light.tsx` (one shot first) for forms Chrome paints into the layer instead of
  compositing: e.g. fewer, merged multiply groups per set (`Multiply shared`, light.tsx:512-519), masks cut to the frame
  instead of REGION 2280 x 3120 px (`light.tsx:532-540`), or JS-premultiplied flat colours where the surface under a
  shadow is one flat fill (`multiply()` exists, light.tsx:102-111). Ship only what is pixel-identical.
- Test: `FilmNBare` + `Film2R` stills, 3 per shot + every join, before/after, `bench/imgdiff.py`: 0 differing pixels
  (or within the noise floor); then `check_light.py` on the 17 master stills unchanged.

**F3. Remotion's own Chrome build gives a lossless raw-frame path. Saving: -13 % per browser (c2 0.304 -> 0.264
s/frame), compounding with F1. Risk: none measured (bit-identical). Effort: S.**
- Evidence: with `chrome-headless-shell` 157.0.8080.0 (what Remotion 4.0.538 downloads by default from remotion.media,
  reachable here) Remotion switches to shared-memory raw frames (`-f remotionshm`: no PNG encode, base64 or decode).
  Output video stream MD5-identical to the Playwright 153 + PNG master; PNG frames of the two builds pixel-identical.
- Proposal: `npx remotion browser ensure` once per container and drop the hard-coded Playwright path
  (`remotion.config.ts:2`, `render-frames.mjs:32`, `render-media.mjs:61`), or point them at Remotion's binary.
- Test: full-film video-stream MD5 vs the current pipeline on one commit (plus the noise-floor rule).

**F4. Masters at concurrency 2, not 3. Saving: -14 % (0.354 -> 0.304 s/frame; c4 0.351). Risk: none. Effort: S.**
- Evidence: §1; the one-step c2 and c3 encodes differ only through the noise-floor frame (f75: 0.002 % px, max 5).
- Proposal: `render-media.mjs` default 2 and the master commands in `MASTER.md`/`ASSEMBLY.md`/`BUILD.md` (superseded
  by F1 where F1 lands).

**F5. The CLI renders at `swangle`: 45x slower and different pixels. Saving: hours per CLI render (a full-size
2345-frame CLI cut at c2 = ~4 h vs ~10 min). Risk: none (removes a pixel mismatch). Effort: S.**
- Evidence: V2S5 f1240-1269 at c2: default 0.277, swangle 12.4 s/frame; swangle vs default: 36 % of the pixels
  differ, max 63 levels (the masters use default). CLI gate renders are still in the docs (§1); CLI video renders also
  default to JPEG q80 frames and CRF 18 (Remotion defaults), so an owner cut made that way bands the sky the master
  won't (PIPELINE_V2 "Master encode").
- Proposal: delete `setChromiumOpenGlRenderer('swangle')` (default = identical pixels to every master) and route every
  gate video through `render-media.mjs` (`--master` look, F1 speed); fix `G5_BLOCKING.md:209,215`, `PIPELINE_V2.md:241`,
  HANDOFF §5.
- Test: none needed for speed; a frame diff CLI-vs-script after the change should be 0.

**F6. Chunked renders: mux the premixed audio instead of an audio-only render. Saving: v3 paid 26 min; now seconds.
Risk: none (test below). Effort: S.**
- Evidence: Film2R's audio is ONE file (`public/v2r/cues.json`: `audio: v2r/mix.wav`, `sfx: []`; Film plays it from 0,
  `lib/Film.tsx:882`). An audio-only render still seeks every frame (74 ms/frame here, more for heavy shots).
- Proposal: when `cues.json` has `audio` and no `sfx`, encode `mix.wav` to AAC and mux it; else one `--codec=wav` pass.
- Test: `av_lag.py` lag 0 ms / r 1.00 against `mix.wav` and ebur128 -14 LUFS / -1 dBTP, as `MASTER.md` checks now.

**F7. Previews pay a bundle + two browser launches per call. Saving: 2-4 s of every 3.5 s still (60-80 %), ~2x on
every `sheet.sh`. Risk: none (same bundle bytes, same renderer). Effort: S-M.**
- Evidence: §1 (1-frame still 3.5 s wall, 0.3-0.8 s of frame; bundle 1.9 s idle / 3.6-3.8 s under load; the bundle is
  deleted after each call; `sheet.sh` makes a second full call for the caption mask).
- Proposal: cache the bundle by a hash of `src/` + `public/` (keep `serveUrl` under `node_modules/.cache`, reuse with
  `--serve`), pass one `openBrowser()` instance to `selectComposition` and the render (`puppeteerInstance`), and give
  `sheet.sh` one call that renders both passes (picture + `{capcheck:'mask'}`) with the same bundle and browser.
  Optional: a small preview daemon (bundle + warm browser) for lanes: a still in ~0.5 s. A review pack over a cut
  (`tokens.md`'s qa_pack) should decode its sheets from the cut's MP4 (`master_sheets.py`) instead of re-rendering.
- Test: PNG bytes equal to the current script's output for the same frames.

**F8. A scene-level render cache is feasible and seamless; worth it after F1. Saving: a one-shot fix re-renders only
its chunk(s): V2S4 341 frames = 15 % of the film. Risk: low (exact key, below). Effort: M (~1 day).**
- Evidence: rendering is a pure function of the frame: f60-179 as one range vs split at f120 across two browsers =
  0 differing pixels; chunk timing seamless (above); `film_chunks.py` already cuts on Film's scene boundaries.
- Key per chunk: SHA of (a) the esbuild metafile input list of the chunk's scene module(s) (+ the neighbour's for a
  transition window; esbuild is in node_modules), (b) `lib/Film.tsx`, the film shell, palette, `scenes.json` rows,
  the `captions.json` pages overlapping the chunk, inputProps, public files referenced, (c) Remotion + Chrome versions,
  GL, scale, encode argv. Any `lib/` file in the closure invalidates the chunks that import it (most of them).
  Film draws BOTH shots inside a transition window, so let `film_chunks.py` cut each join's window (0.4-1.1 s) into
  its own small chunk: a fix inside V2S4 then re-renders V2S4's interior + its two join chunks, not 3 whole shots.
- What to cache: for the master, the chunk's PNG frames (~620 KB/frame, ~1.5 GB per film) and re-run the ONE encode
  (~1.5 min) -> stays bit-identical to a full render; for review cuts, the encoded chunk + stream-copy concat.
- Test: after a cached rebuild, MD5 of the video stream = a from-scratch render of the same commit (noise-floor rule).

## 3. Quick wins vs bigger changes

**Quick wins (no pixel change; each proven or checkable by an MD5 / 0-pixel diff):**
1. F5: drop `swangle` from `remotion.config.ts`; gate videos via `render-media.mjs` (master settings), not the CLI.
2. F4: concurrency 2 for one-browser renders (default in `render-media.mjs`, the master commands in the docs).
3. F6: mux `mix.wav` for chunked renders; no audio-only render when the film has a premix and no live cues.
4. F7: bundle cache + one browser per call + one call per `sheet.sh`.
5. F3: Remotion's own headless shell (once per container) for the raw-frame path.
6. Fix the v1-era 30 fps samplers (`run_all.sh:16`, `strip.sh:21`, `capcheck.mjs:31`) to the composition's fps
   (correctness of QA on 60 fps films; costs more frames, not less: flagged for `codebase.md`).

**Bigger changes (owner's yes + the named test):**
1. F1 for masters: K browsers + one identical encode (test: video-stream MD5 vs today's one-step master on one commit).
   For gate cuts: parallel chunks + concat (test: per-frame PSNR vs PNG frames; seams invisible).
2. F8: scene-level cache keyed by the esbuild closure + inputs (test: cached rebuild MD5 = from-scratch render).
3. F2: light-layer engine spike, one shot first (test: 0-pixel diff on 3 stills per shot + joins; `check_light`).

**The whole film, measured** (Film2R, 2345 frames, full size, master settings, this box, one run each; prod's G7
master took 10 min 20 s on a busier box):

| variant | wall | vs today | output vs today's one-step c3 |
|---|---|---|---|
| today: one-step `--master`, c3 | (running) | - | - |
| F4: one-step, c2 | (running) | | |
| F3: Remotion's Chrome, one-step, c2 | (running) | | |
| F1: 2 browsers x c2 -> PNG -> one identical encode | (running) | | |
| F1+F3: 3 parallel chunks (Remotion's Chrome) + concat | (running) | | |

## 4. Rejected ideas
- **JPEG intermediates.** q80 saves ~100 ms/frame of capture (-30 %) but halves the sky's dither and bands it
  (`PIPELINE_V2.md` "Master encode", sky research §5): rejected. q100 is still a lossy DCT on a +-1-2 code dither:
  rejected, the raw path (F3) is faster AND lossless.
- **More concurrency in one browser** (c3, c4): slower than c2 (viz-bound, §1).
- **Other GL backends** (`angle`, `egl`, `swiftshader`, `angle-egl`): pixel-identical to default and the same speed in
  this GPU-less box; nothing to gain. `vulkan` not tested (no GPU).
- **Chrome/Remotion knobs measured with no gain**: `captureBeyondViewport:false` (0.286 vs 0.291 s/frame),
  `DISABLE_FROM_SURFACE` (slower, 0.340, and 1 frame different), `--run-all-compositor-stages-before-draw` (0.319).
- **A faster x264 preset / higher CRF / 8-bit shortcuts for masters**: changes the encode; the encode is only ~12 % of
  a one-step master's wall-clock anyway. Rejected (quality is fixed).
- **Lower scale or 30 fps for owner cuts**: the owner's cuts are full size at 60 fps (`G5_BLOCKING.md:212-215`; 0.5x
  flickers the float camera). Rejected. Lane-level 0.4-0.5x previews stay as they are.
- **Memoising static layers for speed**: JS (React) is ~74 ms of a ~325 ms frame and the static geometry is already
  cached (`ENGINE.md` §12, sky stops/dither cached by value, `sky.tsx:28-36`); the cost is compositing, not JS.
- **Taking QA frames from the master instead of re-rendering**: already done where it is exact (`master_sheets.py`);
  check_light's A/B, the seam probe and capcheck's mask need their own props/compositions, so they stay.
