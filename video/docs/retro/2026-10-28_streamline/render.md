# Render and engine: wall-clock and compute (streamlining review, 2026-10-28)

Reviewer area: RENDER AND ENGINE. Analysis only; scratch copy + measurements in `/tmp/streamline-render/` (the repo's
`video/` copied there, `npm ci` there; nothing in the repo touched). Status: IN PROGRESS (measurements running).

## 1. How it works today

- **Two render scripts, both one bundle + Remotion's Node API** (`video/scripts/render-frames.mjs` PNG stills,
  `render-media.mjs` video/audio). Each CALL bundles (`bundle({enableCaching:true})`, render-frames.mjs:75,
  render-media.mjs:69), opens a browser for `selectComposition` and another for the render, then DELETES the bundle
  (render-frames.mjs:121, render-media.mjs:100). Measured here: bundle 17.9 s cold, 1.7 s warm (prod logs: 3.6-3.8 s
  under load); `selectComposition` 0.4-0.5 s.
- **Wrappers all go through render-frames.mjs, one call each**: `still.sh` (1 frame, concurrency 1), `sheet.sh` (N
  frames + a 2nd full render of the same frames with `{capcheck:'mask'}`), `strip.sh`, `qa/sheets.sh`, `qa/run_all.sh`
  (every frame at 0.5x), `review/checkin.sh` (one call per composition), `capcheck.mjs`, `camspeed.py`,
  `gate_check.py --seam-comp`. Defaults: concurrency 2, GL = Chrome default (`GL=` env overrides).
- **Masters / gate cuts**: `render-media.mjs --master` = PNG frames piped (image2pipe) into Remotion's ffmpeg while
  rendering, x264 CRF 14 slow aq-mode 3, BT.709 limited, one encode (render-media.mjs:14-24, 51, 91; PIPELINE_V2
  "Master encode"). Concurrency 3 in every master command (`docs/v2/MASTER.md:17`, `ASSEMBLY.md:14`).
  v2r G7 master: 2345 frames, **10 min 20 s** (0.26 s/frame, c3, default GL; MASTER.md:22). v3's chunked G5b render
  (CLI, swangle): 14 chunks **63.5 min + 26 min audio** (`G5_BLOCKING.md:324-333`).
- **`remotion.config.ts` still sets `swangle`** (applies only to `npx remotion render/still`): ~2.9 s/frame vs
  0.12-0.27 s with the scripts' default GL (G5_BLOCKING.md:331-333). Docs disagree on GL: the v2r entry/BUILD.md say
  "always --gl=angle" (`src/entry-v2r-film.tsx:8-11`, `docs/v2/BUILD.md:67-75`), the masters used the default.
- **Chunks**: `film_chunks.py` (ceil boundaries, `--max 360`); the join is a stream copy (G5_BLOCKING §8b).
- **Entry points**: 21 `src/entry-*.tsx` (not 25), one per film/lab; render-frames `--entry=auto` builds isolated
  dev entries in `node_modules/.cache/render-entry` (render-frames.mjs:38-63).
- **QA reads the master where it can**: `master_sheets.py`, `check_banding.py`, `density.py`, `gate_check.py`,
  `av_lag.py` decode the MP4 (no re-render). Re-renders that are legitimate (different props/comps): check_light A/B
  (`lightOff`), the seam probe (`FilmNSeams`), capcheck's mask pass. Legacy 30 fps samplers: `run_all.sh` (FPS=30, v1
  `src/data/scenes.json`), `strip.sh`, `capcheck.mjs` (fps = 30).

## 2. Findings, ranked by expected saving
(pending: measurements running)

## 3. Quick wins vs bigger changes
(pending)

## 4. Rejected ideas
(pending)
