# Retro measurement tools (v3 retro, 2026-10-27)

Raw research scripts from the v3 retro, saved here so they survive the session (they were only in a scratchpad). They
produced the numbers in `docs/look/CRAFT.md` and `docs/retro/2026-10-27_v3_retro.md`. Paths inside them still point at
that session's scratchpad: pass your own inputs. The tooling lane (retro proposal) ports the useful ones into
`scripts/qa` as proper checks:
- `story/carry.py` (pixels carried across a join), `jumps.py` (eye jump), `diffcurve.py`, `cutsheet.py`, `carry_board.py`;
- `hierarchy/tiers.py`, `analyse.py`, `motion2.py` (salience, contrast and motion by tier), sheets;
- `line/measure.py` (strokes, wobble, overshoot, near-miss ends per Mpx), `ends.py`;
- `light/lab.py`, `value.py`, `shadepairs.py`, `blend.py`, `topcols.py` (value ladder, shadow pairs).
Run Python on reference footage with `-I`, and keep footage and frames out of the repo.
