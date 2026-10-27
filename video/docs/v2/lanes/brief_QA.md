# Helper brief QA: teach the gate check the v2r film's transitions and frame-0 layout

Read `COMMON.md` (this folder) first (setup and git rules; the film itself is not your job). You own `video/scripts/qa/gate_check.py` for this
change. The v2r engine reported: gate_check should model **push-through** (cuts at c +- 0.05 s) and **foreground-wipe** (no hard cut) from
each scene's `transitionIn` type in `scenes.json`, and accept a **custom frame-0 layout**, e.g.
`--frame0-geom '{"size":72,"baselines":[372,452],"captionBaseline":516,"captionScale":0.531}'` (read `video/src/v2r/film/Film2R.tsx` for the
real numbers). Implement both as backward-compatible options: v3's gate check must give the same result as before (run it on the newest
v3 render you can make or find, e.g. `npx remotion render src/entry-v3-film.tsx Film3 out/v3_check.mp4 --scale=0.25 --gl=angle`, before and
after your change). Then render Film2R at `--scale=0.25 --gl=angle` and run the new gate check on it with the v2r frame-0 words and geometry;
document the new options in the script's header and in `video/docs/v2/BUILD.md`'s gate-check line (you may edit that one line). Done signal:
`video/docs/v2/lanes/report_QA.md` (the before/after v3 results, the v2r result).
