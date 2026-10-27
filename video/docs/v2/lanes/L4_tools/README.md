# L4 tools (lane L4's own QA + workflow scripts, copied out of the session scratchpad so a new container keeps them)
Paths inside point at the session scratchpad `/tmp/claude-0/-home-user-Test-/77c1a0dc-af15-5a35-a3e3-e76f15ecdd7f/scratchpad` (S);
in a new container set S to your scratch dir and copy these to `$S/tools/`. Run from `video/`.
- `bandcheck.py`: renders Film2RBare f1233-1439 (V2S5) and counts non-sky px in the caption band y 317-556 and in the margin
  y 290-600 (minus the sun disc / the calendar page); `--step 3` quick, `--no-render` re-reads `$S/bandcheck/`.
- `make_review.sh <tag>`: the brief's review files into `$S/review/<tag>/` (10 key stills at 216 px beside reference 1 / v1 /
  the G5b pilot rows from `$S/refs216/` (re-extract with ffmpeg: ref1_<t>.png 216 wide from assets/ref/reference.mp4, v1_<t>.png
  from deliverables/v1/php2shell_final.mp4, g5b_<t>.png from deliverables/v3/v3_g5b_pilot.mp4; never commit them), full-size
  start/end, motion strips, the 0.5 clip, density.py (+ --cozy), the band check, camspeed.py, colour_meter.py, deadframes.py,
  the V2S5_qa camera check).
- `critics_wf.js` (3 lenses, Workflow args {tag, dir, round, prior}) and `fix_wf.js` (owner groups): under the budget rules
  run the critic as ONE combined agent and ONE fixer instead.
