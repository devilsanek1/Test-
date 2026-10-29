# Phase 1, lane R (render): PLAN items 2-5 (in progress)

Lane R of `PHASE1_BRIEF.md`; evidence `render.md`. Box: 4 cores / 15 GB, idle. Scratch: `/tmp/phase1-R/`.
Status: IN PROGRESS (this file is updated after each item; a usage limit can stop the lane at any time).

## Item 2: no `swangle` in `remotion.config.ts`
- Status: DONE.
- Changed: `video/remotion.config.ts` (the `setChromiumOpenGlRenderer('swangle')` line removed; a comment says why). The
  browser executable stays the same.
- Test (`remotion still` = the bare CLI, vs `render-frames.mjs` as of HEAD, same frame, PNG):
  | frame | before (swangle) | after (Chrome's default GL) |
  |---|---|---|
  | Film2R f777 (12.95 s, `draftLabel:false`) | 18.6 % of the pixels differ, max 67 levels; CLI 7.4 s | **byte-equal PNG** (md5 `ef36cf1e2a1f`); CLI 4.1 s |
  | Film2R f1500 (25.0 s) | - | **byte-equal** (`79a461e1ddd2`) |
  | Film3 f960 (v3, 16.0 s) | - | **byte-equal** (`8a2b135c308f`) |
  | G3Demo f180 at `--scale=0.5` | - | **byte-equal** (`0a530e786e5e`) |
- Left: the docs that still route gate videos through the bare CLI or say "`GL=swangle` matches the CLI" (below).

## Item 3: chunked renders mux the premixed audio
- Status: pending.

## Item 4: faster previews (bundle cache, one browser, one sheet call)
- Status: DONE.
- Changed: new `video/scripts/render/lib.mjs` (shared by both render scripts: flags, the entry resolver, the bundle
  cache, the one browser); `video/scripts/render-frames.mjs` (uses it; new `--also-out`/`--also-props` second pass,
  `t0:t1[:step]` frame ranges, `--no-cache`); `video/scripts/sheet.sh` (one call for frames + caption mask);
  `video/scripts/strip.sh` (the composition's fps, flags passed through); `video/scripts/still.sh` (usage line only).
  - **Bundle cache:** `$TMPDIR/render-bundles/<key>`, key = sha256 of `src/` (file contents), `public/` and `assets/`
    (names, sizes, mtimes in ns: the bundle copies `public/` and lists exactly those), the entry, `package-lock.json`,
    `tsconfig.json`, the bundler version (24-34 ms to compute). Any change = a fresh bundle, as today. 3 bundles kept
    (~75 MB each); one in use by a live process is never deleted; concurrent builds of one key are safe (atomic
    rename). An entry outside `src/` is never cached. `--no-cache` / `RENDER_BUNDLE_CACHE=0` = today's behaviour.
  - **One browser:** `openBrowser()` once, launched with the same flags renderFrames uses for its own
    (`--force-device-scale-factor` = the scale), passed to `selectComposition` and every `renderFrames` pass.
- Test 1, PNG bytes (`render-frames.mjs` at HEAD = "today" vs new; first call = cache miss, second = hit):
  7 cases, 23 PNGs: Film2R 6 frames at 0.5 (`draftLabel:false`), Film2R 3 frames at full size, Film3-SQD 3 frames,
  Film3Shot `{"id":"SQD"}` at 0.25, G3Demo 4 frames, PosterS1 `{"preset":"pass2"}` (the city-poster entry),
  Film2R-V2S4 with `--entry=auto`: **23/23 byte-equal on both calls; stdout identical.**
- Test 2, today's script is NOT deterministic on some frames (found here; it matters to anyone diffing frames):
  three runs of the unchanged script on Film2R-V2S1 at 0.35 (sheet.sh's scale) differ on 3 of 8 frames (38-213 px,
  max 25 levels), also at concurrency 1 and with one tab per frame; Film3-SQD at 0.35 on ~1 frame in 8 per run. The
  differences start on pixel row 255, a 256-px raster tile seam (Chrome's tiled raster). So for those frames the test
  is membership: every image the new script makes must be one today's script makes.
  - V2S1, 8 frames x 6 runs each: 0 new variants (today: 2-3 variants on 6 frames; new: the same ones).
  - Film3-SQD, 8 frames x 5 new runs vs 25 runs of today's: 0 new variants (the two rare row-255 variants the new
    script made 1 time in 5 come from today's script 3 and 4 times in 25).
  - The masks (captions only) were byte-equal in every run (34/34).
- Test 3, `sheet.sh` (one call) vs today's (two calls): the sheet PNG byte-equal for Film3-SQD 0-1.9 s and the
  `--no-capcheck` Film2R sheet; the V2S1 and Film2R-with-props sheets differ by 181 px / 14 px, inside test 2's noise.
  The caption check's output (`capcheck.py`, run with scipy) is identical on 3 frame sets (18 frames: same numbers,
  all `ok`), masks 18/18 byte-equal.
- Test 4, `strip.sh`: on a 30 fps composition (v3's G3 `Animatic`) the strip PNG is byte-equal to today's logic
  (today's `strip.sh` cannot pass `--entry`, so it now fails on every live composition: v1's `src/index.ts` is
  archived). At 60 fps it renders every frame: `0.5:0.7` = frames 30-42, 13/13 PNGs byte-equal to a list of the same
  frames, same printed seconds (0.5167, ...).
- Times (this idle 4-core box, webpack cache warm; today = HEAD scripts):
  | call | today | new, bundle cached |
  |---|---|---|
  | `still.sh` Film2R 0.5x (3 runs) | 3.9-4.0 s | **1.5 s** (first call after a change ~3.5 s) |
  | `still.sh` Film3-SQD full size | 3.5-3.7 s | **1.5 s** |
  | `render-frames.mjs`, the 7 cases above | 3.0-6.0 s | **1.2-3.2 s** (cache miss: 1.5-4.7 s) |
  | `sheet.sh` 8 frames + caption check (V2S1 / SQD / Film2R props) | 9.4 / 8.2 / 9.8 s | **4.0 / 3.2 / 3.4 s** |
  | `sheet.sh --no-capcheck` 4 frames | 4.8 s | **2.1 s** |
- Behaviour notes: the mask pass now uses your `--props` plus `{"capcheck":"mask"}` (today a `--props` made the mask
  call render plain frames, so the check silently checked nothing; G5_BLOCKING told lanes to add `--no-capcheck`). If
  the second pass fails, `render-frames.mjs` warns and still succeeds with 3-field lines (as today's ignored mask call).

## Item 5: `render-media.mjs --parallel=K` (review cuts and lane clips)
- Status: pending.

## v1 couplings cut
- Status: pending.

## Doc changes needed
- (to fill)

## For the production sessions
- (to fill)
