# L3 agent brief: fix the critic's MUSTs, then the checks, the clip and the report (2026-10-28)

You are the last agent of lane L3 (video 2 "One Small Window", Remotion, `/home/user/Test-/video`, branch
`video-production`). Run at MAX effort. Do NOT start any agent, subagent or workflow.

1. **Fix the MUSTs** in `video/docs/v2/lanes/critic_L3.md` (the SHOULDs are not done), with the smallest change each,
   inside L3's paths only: `video/src/v2r/scenes/V2S3*`, `V2S4*`, L3's presets in `video/src/v2r/world/skies.ts`, the
   sheets `video/scripts/qa/depth_sheets/v2_s3.json` / `v2_s4.json`. Context: the "S3 art conform" and "S4 art conform"
   sections at the top of `video/docs/v2/lanes/handover_L3.md`; the binding spec `video/docs/v2/lanes/conform_L3.md`;
   the rules `video/docs/look/DIRECTION.md`, `video/docs/look/CRAFT.md` §f/§g. The water stays isolated and unstyled (a
   shared redesign lands later). Never touch map.ts, lib/, kit/, other lanes' files. Commit with
   `bash /home/user/Test-/context/workflows/v2r-l3-ckpt.sh "v2r L3: critic MUSTs: <what>"`.
2. **The checks, the clip, the stills:** run `bash /home/user/Test-/context/workflows/v2r-l3-report-assets.sh final`
   (read it first: it renders the 0.4 clip of Film2R 12.80-20.80 s into `video/docs/v2/lanes/img/L3_S3S4_0.4.mp4`, the
   join sheet `L3_joins_0.4.jpg` and the stills sheet `L3_stills_0.4.jpg`, and runs check_light at 13.5 / 17.0 / 19.9,
   check_depth at 13.5 (v2_s3.json) / 17.0 / 19.9 (v2_s4.json), the line metrics (measure.py + ends.py, full size, the
   caption zone masked) at 13.5 / 17.0, check_banding). Fix its subject boxes or sky regions first if the handover gives
   better ones (S3's open sky, S4's open sky). Also run `skyProblems` for S3_SUNSET and S4_SKY, `particleProblems` for
   both shots' fields, `floatProblems` for S3, and `npx tsc --noEmit -p .`.
3. **The report** `video/docs/v2/lanes/report_L3.md` (conform_L3 §5: at most 12 lines, then a REQUESTS list): the clip
   path; check_light at 13.5 / 17.0 / 19.9; check_depth; measure.py / ends.py at 13.5 and 17.0 (strokes <= 80 / Mpx,
   near-miss ends <= 40, dark-line <= 3 %: give the numbers; a FAIL is stated as FAIL with its cause); banding; sky /
   particle / float problems; the join sheet (12.95 / 12.98 / 13.00, 14.71 / 14.86 / 15.01, 20.40 / 20.55 / 20.70) and
   the stills at 16.0 and 19.9 showing her far window; movers <= 3; no stranger's back; tsc clean; the critic's MUSTs and
   what was done. REQUESTS: collect them from the handover sections and the critic file (L6: S8Window's stile from the
   transom down, the fanlight undivided, to match S3; QA: measure.py counting dark-fill corners as strokes /
   near-miss ends; the orchestrator: the lib/water swap is one line in V2S3_water.tsx and S4's water component; L2: keep
   S2_NEAR_LAMP / PLANTER_WOOD exported; any others). Plain, short sentences; no email addresses or secrets.
4. Commit everything with the checkpoint script (`"v2r L3: report (S3 + S4 conform)"`; it adds the report, the img
   files and L3's paths, merges origin and pushes). Your final message: at most 6 lines (the report's verdicts in one
   line each, the commit hash).
