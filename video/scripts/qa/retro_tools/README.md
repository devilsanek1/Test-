# Retro measurement tools (v3 retro, 2026-10-27)

Raw research scripts from the v3 retro, saved here so they survive the session (they were only in a scratchpad). They
produced the numbers in `docs/look/CRAFT.md` and `docs/retro/2026-10-27_v3_retro.md`. Paths inside them still point at
that session's scratchpad: pass your own inputs. The tooling lane (retro proposal) ports the useful ones into
`scripts/qa` as proper checks:
- `story/carry.py` (pixels carried across a join), `jumps.py` (eye jump), `diffcurve.py`, `cutsheet.py`, `carry_board.py`;
- `hierarchy/tiers.py`, `analyse.py`, `motion2.py` (salience, contrast and motion by tier), sheets;
- `line/measure.py` (strokes, wobble, overshoot, near-miss ends per Mpx), `ends.py`;
- `light/lab.py`, `value.py`, `shadepairs.py`, `blend.py`, `topcols.py` (value ladder, shadow pairs).
- `depth/` (2026-10-27, `docs/look/research/2026-10-27_depth_analysis.md`): `depth_measure.py` (per-plane colour and
  contrast against the air, silhouette separation, ground line directions with declared vanishing points), the run_*
  configs for the G4 look clip, reference 1 and v1, `run_scale.py` (px/m and the camera constant), `extract_frames.sh`.
Run Python on reference footage with `-I`, and keep footage and frames out of the repo.
