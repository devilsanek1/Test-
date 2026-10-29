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
- Status: pending.

## Item 5: `render-media.mjs --parallel=K` (review cuts and lane clips)
- Status: pending.

## v1 couplings cut
- Status: pending.

## Doc changes needed
- (to fill)

## For the production sessions
- (to fill)
