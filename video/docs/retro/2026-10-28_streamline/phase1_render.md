# Phase 1, lane R (render): PLAN items 2-5, done

Lane R of `PHASE1_BRIEF.md`; evidence `render.md` (its bench harness reused). Box: the 4-core / 15 GB container; every
time below is on the IDLE box unless it says otherwise. Scratch: `/tmp/phase1-R/` (big renders deleted after).
"Today" = the scripts as of the Phase 1 start (HEAD `ce5270fd`), kept as a frozen copy for every before/after.

**In one look:** the CLI renders the scripts' pixels (no `swangle`); stills ~1.5 s instead of ~4 s and sheets 2.5x
faster, pixel-neutral; the master command is unchanged and re-renders the delivered v2r G7 master byte for byte; a
full-size review cut is one command, `render-media.mjs ... --master --parallel`: 5:03 instead of 6:11-6:24 for v2r,
frame-exact, its audio stream bit-identical to the master's, its seams within 0.06 dB of the master's fidelity.

## Item 2: no `swangle` in `remotion.config.ts`
- Status: DONE.
- Changed: `video/remotion.config.ts` (the `setChromiumOpenGlRenderer('swangle')` line removed; a comment says why). The
  browser executable stays the same.
- Test (`remotion still` = the bare CLI, vs `render-frames.mjs` as of today, same frame, PNG):
  | frame | before (swangle) | after (Chrome's default GL) |
  |---|---|---|
  | Film2R f777 (12.95 s, `draftLabel:false`) | 18.6 % of the pixels differ, max 67 levels; CLI 7.4 s | **byte-equal PNG** (md5 `ef36cf1e2a1f`); CLI 4.1 s |
  | Film2R f1500 (25.0 s) | - | **byte-equal** (`79a461e1ddd2`) |
  | Film3 f960 (v3, 16.0 s) | - | **byte-equal** (`8a2b135c308f`) |
  | G3Demo f180 at `--scale=0.5` | - | **byte-equal** (`0a530e786e5e`) |
- The CLI's VIDEO defaults are still not the master's (JPEG q80 frames, CRF 18: they band a sky), so gate videos go
  through `render-media.mjs` (doc changes below).

## Item 3: chunked renders mux the premixed audio
- Status: DONE.
- Changed: new `video/scripts/render/audio.mjs`, used by `render-media.mjs --parallel` (item 5). The audio is made ONCE
  for the whole range and encoded exactly as renderMedia encodes a one-step render's (Remotion 4.0.538's own chain,
  replayed with its own ffmpeg: preprocess `aformat`+`atrim` -> merge `apad`+`amix` -> libfdk_aac 320k ADTS -> mux with
  the 2048-sample priming shift `-itsoffset -42667us`):
  - **the premixed file** when the film's cues (`--cues`, default `public/<film>/cues.json` for
    `entry-<film>-film.tsx`) are `{"audio": <file>, "sfx": []}` AND Remotion's own asset list at the range's first and
    last frame (a 0.4-0.9 s probe, no screenshots) shows exactly that one file at volume 1 and rate 1, its media time
    advancing with the frames (this also gives a shot's trim: Film2R-V2S4 starts the mix at frame 892);
  - otherwise ONE audio-only pass (`--codec=wav`, it only seeks) over the whole range, beside the video chunks, then
    the same encode (v3 plays the voice plus sound cues: this path). `--audio=render` forces it, `--audio=none` mutes.
- Tests (each against the same command rendered in one step):
  | case | path | audio stream | A/V lag vs the reference | loudness (ebur128) |
  |---|---|---|---|---|
  | Film2R, whole film, master settings, 3 chunks (run twice) | premixed `v2r/mix.wav` (0.6 s) | **MD5 = the delivered G7 master's** (`2e15ed34...`, 1835 packets, 39.104 s) | 0.0 ms, r 1.00 in 0-12 / 12-24 / 26-38 s (= master) | I -14.0 LUFS, LRA 4.4 LU, peak -1.2 dBFS (= master) |
  | Film2R-V2S4 lane clip, 0.25 scale, 2 chunks (run twice) | premixed, trim 892 frames | **MD5 = one-step's** (`5491f2a2...`) | - | - |
  | Film3 (v3), whole film, 0.25 scale, 3 chunks | one audio pass (143 s, beside the chunks) | **MD5 = one-step's** (`e663e62a...`, 1931 packets) | 0.0 ms vs `voice.wav` (r 0.89-0.93, = one-step: the voice in its mix) | I -17.0 LUFS, LRA 4.0, peak -2.3 (= one-step) |
- Before: v3's G5b chunked render paid a separate 26-min audio render (`G5_BLOCKING.md` §8b); now 0.6 s for a premixed
  film, and for a film with cues one audio pass that runs beside the video chunks.

## Item 4: faster previews (bundle cache, one browser, one sheet call)
- Status: DONE.
- Changed: new `video/scripts/render/lib.mjs` (shared by both render scripts: flags, the entry resolver, the bundle
  cache, the browser launch); `video/scripts/render-frames.mjs` (uses it; new `--also-out`/`--also-props` second pass,
  `t0:t1[:step]` frame ranges, `--no-cache`); `video/scripts/sheet.sh` (one call for frames + caption mask);
  `video/scripts/strip.sh` (the composition's fps, flags passed through); `video/scripts/still.sh` (usage line only).
  - **Bundle cache** (both render scripts): `$TMPDIR/render-bundles/<key>`, key = sha256 of `src/` (file contents),
    `public/` and `assets/` (names, sizes, mtimes in ns: the bundle copies `public/` and lists exactly those), the
    entry, `package-lock.json`, `tsconfig.json`, the bundler version (24-34 ms to compute). Any change = a fresh
    bundle, as today. 3 bundles kept (~75 MB each); one in use by a live process is never deleted; concurrent builds
    of one key are safe (atomic rename). An entry outside `src/` is never cached. `--no-cache` /
    `RENDER_BUNDLE_CACHE=0` = today's behaviour.
  - **One browser** (`render-frames.mjs`): `openBrowser()` once, launched with the same flags renderFrames uses for
    its own (`--force-device-scale-factor` = the scale), for `selectComposition` and every pass. (`render-media.mjs`
    keeps launching its browsers exactly as before: item 5.)
- Test 1, PNG bytes (today's `render-frames.mjs` vs new; first call = cache miss, second = hit): 7 cases, 23 PNGs:
  Film2R 6 frames at 0.5 (`draftLabel:false`), Film2R 3 frames at full size, Film3-SQD 3 frames, Film3Shot
  `{"id":"SQD"}` at 0.25, G3Demo 4 frames, PosterS1 `{"preset":"pass2"}` (the city-poster entry), Film2R-V2S4 with
  `--entry=auto`: **23/23 byte-equal on both calls; stdout identical.** A 121-frame call (V2S1 f60-180 at 0.5, the
  new `1.0:3.0` range vs today's explicit list): **121/121 byte-equal**, same 92-93 ms/frame.
- Test 2, today's script is NOT deterministic on some frames (finding 1): on Film2R-V2S1 and Film3-SQD at 0.35
  (sheet.sh's scale) repeated runs of today's own script give 2-3 variants of some frames. There the test is
  membership: every image the new script makes must be one today's script makes.
  - V2S1, 8 frames x 6 runs each: **0 new variants** (today: 2-3 variants on 6 frames; new: the same ones).
  - Film3-SQD, 8 frames x 5 new runs vs 25 runs of today's: **0 new variants** (the two rare variants the new script
    made once in 5 runs come from today's script 3 and 4 times in 25).
  - The caption masks were byte-equal in every run (34/34).
- Test 3, `sheet.sh` (one call) vs today's (two calls): the sheet PNG byte-equal for Film3-SQD 0-1.9 s and for the
  `--no-capcheck` Film2R sheet; the V2S1 and Film2R-with-props sheets differ by 181 px / 14 px, inside test 2's noise.
  The caption check (`capcheck.py`, run with scipy) prints identical results on 3 frame sets (18 frames, all `ok`),
  masks 18/18 byte-equal.
- Test 4, `strip.sh`: on a 30 fps composition (v3's G3 `Animatic`) the strip PNG is byte-equal to today's logic. At
  60 fps it renders every frame: `0.5:0.7` = frames 30-42, 13/13 PNGs byte-equal to a list of the same frames, same
  printed seconds (0.5167, ...). (Today's `strip.sh` cannot pass `--entry`, so since lane C archived `src/index.ts` it
  fails on every composition.)
- Times (webpack cache warm; today = the frozen scripts):
  | call | today | new, bundle cached |
  |---|---|---|
  | `still.sh` Film2R 0.5x (3 runs) | 3.9-4.0 s | **1.5 s** (first call after a change ~3.5 s) |
  | `still.sh` Film3-SQD full size | 3.5-3.7 s | **1.5 s** |
  | `render-frames.mjs`, the 7 cases above | 3.0-6.0 s | **1.2-3.2 s** (cache miss: 1.5-4.7 s) |
  | `render-frames.mjs`, 121 frames | 13.8-14.4 s | **11.2-12.0 s** |
  | `sheet.sh` 8 frames + caption check (V2S1 / SQD / Film2R props) | 9.4 / 8.2 / 9.8 s | **4.0 / 3.2 / 3.4 s** |
  | `sheet.sh --no-capcheck` 4 frames | 4.8 s | **2.1 s** |
- Behaviour notes: the mask pass now uses your `--props` plus `{"capcheck":"mask"}` (today a `--props` made the mask
  call render plain frames, so the check silently checked nothing; G5_BLOCKING told lanes to add `--no-capcheck`). If
  the second pass fails, `render-frames.mjs` warns and still succeeds with 3-field lines (as today's ignored mask call).

## Item 5: `render-media.mjs --parallel[=K]` (review cuts)
- Status: DONE.
- Changed: `video/scripts/render-media.mjs` (cached bundle, auto entry, `--muted`, `--serve`, the `--parallel`
  dispatch; the one-step path is today's `renderMedia` call verbatim, `selectComposition` and `renderMedia` launching
  their own browsers as before); new `video/scripts/render/parallel.mjs`. K (default 3) chunks cut on
  `film_chunks.py`'s boundaries (scene starts and its `--max 360` splits: the K-1 cuts that make the longest chunk
  shortest, scene starts preferred) when the composition is the film's timeline (`--scenes`, default
  `src/<film>/film/scenes.json`), else K equal parts; each chunk = a child `render-media.mjs --frames=a-b --muted` on
  the same bundle with the same encode flags (`--master`, `--crf`, `--scale`, `--props`, `GL`), concurrency 2 each
  unless `--concurrency`; the join = concat demuxer, stream copy, each chunk's exact duration n/fps,
  `-video_track_timescale 90000`, the master's colour tags; then item 3's audio; then the script checks the joined file
  (n frames, every pts step = 1/fps) or fails and keeps the chunks. `--work=<dir>` keeps the chunks and the audio.
  Ctrl-C stops the chunk processes. Other codecs are refused; a bare `--parallel` = 3.
- **Masters are unchanged:** the master command with the final script reproduces the delivered G7 master **byte for
  byte** (file MD5 `cfe247ee...` = `deliverables/v2/v2r_G7_master_v1.mp4`; 6:11). Also byte-identical: today's
  script (idle 6:24; under two busy loops 8:23) and two runs of the first version of this change (idle 6:29; under the
  busy loops 8:13). An A/B on V2S1's lit frames 60-179 (master settings, today's script x2 and 3 variants of the new
  one): all the same video stream (`9e76a4be...`, render.md's reference).
- Test, the whole v2r film as a review cut (`Film2R --master --parallel`, `draftLabel:false` to compare with the
  master; run twice, the final code last): chunks f0-891, f892-1685, f1686-2344 (both cuts on scene starts).
  - 2345 frames; every pts step exactly 1500/90000 s (2344 steps); keyframes at the seams (f892, f1686); the decoded
    frames of the joined file = the chunks' decoded frames in order (framemd5: 0 of 2345 differ: no frame lost,
    doubled or moved); video 39.083333 s, audio 39.104 s, BT.709 / tv tags, 60/1: all as the master.
  - The picture vs the one-step master: PSNR mean 65.5 dB, min 46.9 dB (f1230), 570 frames identical. Against lossless
    renders of the seam frames the review cut is as faithful as the master: the chunk-end frames f889-890 and
    f1683-1687 are 0.01-0.06 dB lower, f1230 is 0.61 dB higher (the master itself is 37-41 dB from the lossless
    frames there). render.md's chunk-end dip (0.25-0.5 dB) did not show at these seams.
  - Audio: item 3 (MD5 = the master's).
- Time, before and after (one step = the same code path as today's):
  | render | one step | `--parallel=3` | `--parallel=2` |
  |---|---|---|---|
  | v2r whole film, full size, master settings | 6:11 (final), 6:24 (today's script) | **5:03 (-18 %)**; chunks 301 / 295 / 192 s (5:05 in an earlier idle run) | 5:38* |
  | v3 whole film, 0.25 scale (one audio pass beside) | 3:50 | **3:08 (-19 %)** | - |
  | V2S4 shot (342 frames), full size, master settings | 70.5 s | 66.9 s (-5 %) | 68.4 s |
  | V2S4, 0.5 scale | 17.8 s | 18.4 s | 18.4 s |
  | V2S4, 0.25 scale | 17.2 s | - | 17.4 s |
  \* an earlier version, while lane C was finishing. The old chunked recipe (CLI, swangle) took 63.5 min + 26 min of
  audio for v3's G5b. More browsers help where one Chrome compositor thread caps a lit shot (render.md); a shot that
  already keeps all 4 cores busy (V2S4) gains little, and a short clip pays the start-up of extra browsers. The v2r
  chunks end at 301 / 295 / 192 s: a queue of smaller chunks could gain ~5-10 % (simulated), with more seams; not done.
- First version, dropped: `render-media.mjs` also shared one browser between `selectComposition` and `renderMedia`.
  It reproduced the master in 2 of 3 runs (finding 2) and slowed the small chunk workers (V2S4 at 0.25: 26.2 s
  instead of 17.4 s). Masters must stay exactly as they were, so `render-media.mjs` launches its browsers as before;
  the shared browser stays in `render-frames.mjs` only, where tests 1-4 cover it.

## v1 couplings cut
- Status: DONE (checked against the current tree: lane C has moved `src/index.ts`, `src/entry-film.ts`, `src/dev/`
  and `scripts/engine-numbers.mjs` to `video/archive/`).
- `sheet.sh` no longer calls `engine-numbers.mjs --check` (it is archived; the check ran on every sheet).
- `render-frames.mjs --entry=auto` no longer falls back to v1 (`src/dev/registry.ts`'s generated entries,
  `src/entry-film.ts` for Main/S01.., `src/index.ts` for the rest: all three are gone, so today's script fails on any
  command without `--entry`). Auto now picks the ONE `src/entry-*.tsx` that registers the composition (a literal
  `id="X"`, else a template `id={`X-${...}`}`); none or several = exit 2 naming the candidates. A wrong pick cannot
  render the wrong film: `selectComposition` fails if the entry lacks the id. Tested: Film2R, Film2R-V2S4, Film2RShot,
  Film3, Film3-SQD, Film3Seams, G3Demo, PosterS1, PosterS1-pass2, V2S1, Cover2R, Animatic, ShotSketch resolve to
  their entry; Main, S07, KitDemo report none. `render-media.mjs` gets the same default (it defaulted to
  `src/index.ts`, now gone). `--entry=full` still means `src/index.ts` and says it is archived when it is missing.
  A side effect: `capcheck.mjs` now runs on a film's compositions (`node scripts/capcheck.mjs Film2R-V2S1 --t0=0
  --t1=2 --n=4`: 4 frames, 0 FAIL); its per-scene sampling still knows only v1's Main / S01.. at 30 fps.
- `strip.sh` reads the composition's fps (via `render-frames.mjs`'s new `t0:t1:step` range) and passes `--entry`,
  `--props` and `--concurrency` through. On a 30 fps composition the strip is byte-equal to before; a 60 fps film gets
  every frame instead of every 2nd.

## Two findings for anyone who diffs renders
1. **Some frames vary run to run in today's pipeline.** Film2R-V2S1 and Film3-SQD at 0.35 scale: the same command gives
   2-3 variants of some frames (up to 0.08 % of the pixels, max 25 levels), also at concurrency 1 and with one tab per
   frame. The differences start on pixel row 255, a 256-px raster tile seam (Chrome rasterises in tiles). Full-size
   master frames were stable (the master re-rendered byte for byte 6 times).
2. **One master run did not reproduce; cause unknown.** The first version of this change (`renderMedia` on the shared
   browser), run at 19:01 while other sessions were busy on the box (lane C finishing, a checkpoint commit), took 7:35
   instead of ~6:25 and gave a different video stream (same audio; file `04c4cd50...`; lost in a container restart
   before it could be diffed). The same code and the same cached bundle reproduced the master later, idle and under
   two busy loops, and so did today's script; plain CPU load does not move pixels. Until the cause is known, an MD5
   test against the delivered master (PLAN's test bed) should run on an otherwise idle box, and a mismatch should be
   re-run once before it counts; for finding 1's frames, two runs of the old code are the baseline.

## Files changed (all in lane R's list)
`video/remotion.config.ts`; `video/scripts/render-frames.mjs`, `render-media.mjs`, `sheet.sh`, `still.sh`,
`strip.sh`, `film_chunks.py` (docstring: `--parallel` uses its boundaries); new `video/scripts/render/lib.mjs`,
`audio.mjs`, `parallel.mjs`; this report.

## Doc changes needed (final text against the current files, 2026-10-30 04:50 UTC)
1. `video/docs/G5_BLOCKING.md` (lines 202-205 are already set by lane D):
   - line 201: `# the props form (Film3Shot {id}); sheet.sh's caption check passes its own --props, so add --no-capcheck here`
     -> `# the props form (Film3Shot {id}); sheet.sh takes --props too (its caption mask = your props + {"capcheck":"mask"})`
   - line 207 (optional): `$(python3 -c "print(','.join(f'{k/60:.4f}' for k in range(16)))")` -> `0:0.25` (frames 0-15).
   - lines 209-210: `# a playable sequence with its voice` / `npx remotion render src/entry-v3-film.tsx Film3-SQD /tmp/sqd.mp4 --scale=0.5`
     -> `# a playable sequence with its voice (one step: a single shot gains nothing from --parallel)` /
     `node scripts/render-media.mjs Film3-SQD /tmp/sqd.mp4 $E --scale=0.5`
   - lines 216-217: `` `npx remotion render src/entry-vN-film.tsx FilmN deliverables/vN/vN_g5_blocking.mp4`, or chunked per panel for a long film (§8b's recipe). `` ->
     `` `node scripts/render-media.mjs FilmN deliverables/vN/vN_g5_blocking.mp4 --entry=src/entry-vN-film.tsx --master --parallel` (the master's encode, so no JPEG-banded sky; 3 chunks on the film's scene boundaries, joined and checked frame by frame, the audio muxed once; v2r: 5 min). Never the bare CLI for a gate video: its JPEG q80 frames and CRF 18 band skies the master won't. ``
   - line 175-176 (the Chunks bullet): append "`render-media.mjs --parallel` cuts on them itself."
   - §8b lines 331-334 ("Faster since (the v3 rework): ... (`GL=swangle` matches the CLI).") -> "Since 2026-10-29 one
     command: `render-media.mjs ... --master --parallel` (chunks on film_chunks.py's boundaries, a stream-copy join
     checked frame by frame, the audio once: the premixed file, or one audio-only pass when the film has sound cues).
     The CLI no longer uses `swangle`: its frames equal the scripts', so the one-GL rule is moot (leave GL unset)."
2. `video/docs/PIPELINE_V2.md`:
   - line 266: `(gate videos are plain \`npx remotion render\`: the G3 reel at 540p60, the G4 clip and the G5+ cuts at full size)`
     -> `(gate videos render through \`scripts/render-media.mjs\`, never the bare CLI: the G3 reel at 540p60 with \`--scale=0.5\`, the G4 clip and the G5+ cuts at full size with \`--master --parallel\`)`
   - "Master encode", after line 205's "The settings live there and nowhere else.": add "The owner's gate videos (the G4
     clip, the G5-G7 cuts) use the same encode, chunked: `--master --parallel` (3 chunks on the film's scene
     boundaries, the audio muxed once and bit-identical to a one-step render's; the seams within 0.06 dB of the
     one-step fidelity). The posted master stays one step (no `--parallel`) until the owner's yes on Phase 2."
3. `HANDOFF.md` §5:
   - lines 383-385: "... and the `swangle` GL renderer. Point it at the container's headless Chromium if the path
     differs." -> "... (no GL override since 2026-10-29: the CLI renders the scripts' pixels). Point it at the
     container's headless Chromium if the path differs, here and in `video/scripts/render/lib.mjs`
     (`BROWSER_EXECUTABLE`, used by both render scripts)."
   - lines 392-393: "the owner's cut from G5 on renders at full size, chunked per panel (§8b there); the G3 reel renders
     at 540p60;" -> "the owner's cut from G5 on renders at full size in one command,
     `node scripts/render-media.mjs FilmN <out> --entry=<entry> --master --parallel` (§4 there); the G3 reel at 540p60
     (`render-media.mjs ... --scale=0.5`);"
   - lines 401-402 ("Stills, strips and dev comps ... `src/dev/registry.ts`"): **no change** (withdrawn: lane D put them
     in the v1 block, run at the v1-final commit, where they are right). For the current films, the commands line above
     covers it (G5_BLOCKING §4).
4. `video/docs/ENGINE.md` §11 (lane D already updated the still line, 438-440):
   - line 440, end of the still comment: append "; the bundle is cached until src/ or public/ change (a repeat still
     ~1.5 s; --no-cache)".
   - line 441: `scripts/sheet.sh <Comp> <t0> <t1> <n> out.png [--scale=0.35] [--cols=N] [--no-capcheck]   # contact sheet + caption check`
     -> `scripts/sheet.sh <Comp> <t0> <t1> <n> out.png --entry=src/entry-<film>.tsx [--scale=0.35] [--cols=N] [--props=JSON] [--no-capcheck]   # contact sheet + caption check (the mask renders in the same call, with your props)`
   - line 444: `scripts/strip.sh <Comp> <t0> <t1> out.png [--crop=WxH+X+Y] [--scale=0.5] [--step=1]  # EVERY frame: check motion`
     -> `scripts/strip.sh <Comp> <t0> <t1> out.png --entry=src/entry-<film>.tsx [--crop=WxH+X+Y] [--scale=0.5] [--step=1]  # EVERY frame at the composition's fps (60): check motion`
   - lines 445-446 (`capcheck.mjs Main`, `capcheck.mjs S07 ...`) -> `node scripts/capcheck.mjs FilmN-<ID> --t0=0 --t1=2 --n=24   # caption legibility on chosen frames (it finds the entry)` /
     `node scripts/capcheck.mjs FilmN-<ID> --times=1.0,1.5 --verbose --viz=/tmp/cc   # --viz paints failing background pixels magenta`
     (its per-scene sampling without --times / --t0 knows only v1's Main / S01..: move that use to the v1 block).
   - add before line 447 (the v1 block): `node scripts/render-media.mjs <Comp> out.mp4 --entry=src/entry-<film>.tsx [--scale=0.5]   # a playable clip (one step)` /
     `node scripts/render-media.mjs FilmN out.mp4 --entry=src/entry-<film>.tsx --master --parallel   # the owner's gate video (the posted master: --master, one step)`
   - line 457 (`npx remotion render src/index.ts Main ...`): stays in the v1 block (v1-final commit).
   - lines 187-188 ("Preview it: `scripts/still.sh S07 2.0 ...` / `scripts/sheet.sh Main 30 36 12 ...`"): v1's
     compositions; for a current film add `--entry=src/entry-vN-film.tsx` and its composition ids (FilmN, FilmN-<ID>).
5. `video/docs/v2/direction/toolkit.md`:
   - lines 198-199: "`scripts/strip.sh` samples 30 fps from `src/index.ts` (archived in `archive/v1/`; for 60 fps motion
     list every frame time in `render-frames.mjs`)." -> "`scripts/strip.sh` renders every frame at the composition's
     fps (pass `$E`; since 2026-10-29 it is not v1-only and no longer samples 30 fps):
     `scripts/strip.sh FilmN-S3 0.5 1.0 /tmp/s3_strip.png $E --scale=0.33`." (strip.sh is live, not archived.)
   - line 181: `npx tsc --noEmit` -> `npm run typecheck` (the pinned TypeScript; lane C's rule).
   - lines 226-245 (the `swangle` timing table, "`--gl=angle` is ~5-8x faster than the config's `swangle`", "Final:
     `npx remotion render ... --gl=angle ... --crf 14`, then the TV-range ffmpeg pass"): history; a banner line above
     §7: "History (2026-10-27): the CLI no longer uses swangle; masters render with `render-media.mjs --master`
     (PIPELINE_V2 'Master encode'), gate videos with `--master --parallel`."
6. `video/src/entry-v2r-film.tsx` lines 8-10 (header comment: renders with `npx remotion render ... --gl=angle`): the
   v2r session's file; optional: point to `render-media.mjs` (`--master` for the master, `--master --parallel` for a
   review cut).
7. `video/scripts/README.md`: STALE (`python3 -I scripts/index.py --check`); re-run `python3 -I scripts/index.py`
   (lane C's generator: the new `scripts/render/parallel.mjs` and the changed headers).

## For the production sessions
- **What changes, and how to use it:**
  - Stills, sheets and strips: the same commands, about 2x faster on every call after the first (the bundle is cached
    until something in `src/` or `public/` changes; one browser per call; `sheet.sh` renders its caption mask in the
    same call). The pixels are the same.
  - `strip.sh` works on the films again: pass `$E`; it now shows EVERY frame at 60 fps (it showed every 2nd).
  - `sheet.sh --props=...` now checks the captions too (drop the `--no-capcheck` workaround).
  - Keep passing `$E`; without `--entry` the tools find the entry that registers the composition, or say which to pass.
  - **Gate videos** (the G4 clip, the G5-G7 owner cuts):
    `node scripts/render-media.mjs FilmN deliverables/vN/<name>.mp4 --entry=src/entry-vN-film.tsx --master --parallel`
    (5:03 for v2r instead of 6:11-6:24 one step; it checks its own frames and timing and prints what it did). Never
    `npx remotion render` for a gate video (JPEG q80 frames and CRF 18 band skies).
  - Lane clips (one shot, 0.25-0.5 scale): one step,
    `node scripts/render-media.mjs FilmN-<ID> /tmp/x.mp4 $E --scale=0.5` (`--parallel` gains nothing there on 4 cores;
    on a whole film it does).
  - The CLI (`npx remotion still`) now renders exactly the scripts' pixels.
- **What stays the same:** the posted master (`--master`, one step: re-rendered byte-identical to the delivered v2r
  master), every existing command and flag, the encode settings, `GL=` when you set it, and every frame and video they
  make; the only intended differences are strip.sh's every-frame 60 fps, sheet.sh's caption check with `--props`, and
  no `engine-numbers` STALE line (archived).
- **Watch:** a frame diff can show a few pixels on a 256-px tile seam even with no change (finding 1), and one master
  run under busy conditions once failed to reproduce (finding 2): test on an idle box, against two runs of the old
  code. The bundle cache uses up to ~225 MB in `$TMPDIR/render-bundles` (`RENDER_BUNDLE_CACHE=0` turns it off).

## Left
- A work queue of smaller chunks for better balance (est. 5-10 %, more seams), and Phase 2's raw-frame Chrome (F1),
  which should make `--parallel` pay on every shot (render.md: 3 chunks 2:56 on that route).
- The docs above (orchestrator) and the scripts index regeneration.
