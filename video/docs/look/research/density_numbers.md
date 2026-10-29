# Density numbers: how full and alive reference 1, v1 and v3 G5 are (measured 2026-10-26)

Meter: `scripts/qa/density.py` (method and definitions in its docstring; in the gate: `gate_check.py --density`). Owner
rule (OWNER_PLAYBOOK, Visual style): every frame FULL and ALIVE like reference 1 and v1; a warning signal, never a quota.
Runs (~25 s each): `density.py assets/ref/reference.mp4 --scenes scripts/qa/calib/ref1_scenes.json` (preset ref1: motion in the card above
its caption strip, fullness in the art panel) · `density.py deliverables/v1/php2shell_final.mp4 --scenes archive/v1/src/data/scenes.json`
· `density.py deliverables/v3/v3_g5_blocking.mp4 --scenes src/v3/film/scenes.json` (preset film: caption band 290-600 and
the draft-label strip 1820-1920 left out). Motion on a 30 fps clock at quarter canvas res, fullness every 0.25 s at half res.

## The three films

| metric | ref 1 (France) | v1 (PHP) | v3 G5 | target (film) |
|---|---|---|---|---|
| medium events / s | **6.6** (shots 3.8-9.1) | **7.7** (5.4-14.7) | **2.6** (0.0-6.4) | >= 5.0 (a shot >= 3.5) |
| longest gap without a new event | 1.00 s | 1.67 s (S08) | **3.55 s** (S4) | <= 1.0 s |
| near-static frames (< 0.1 % px) | 1 % | 3 % | **23 %** | <= 5 % |
| longest near-static run | 0.07 s | 0.40 s | **0.80 s** | <= 0.4 s |
| FLAT share (48 px tiles, no edges, one colour) | 20 % (7-38) | 32 % (26-41) | **61 %** (39-73) | <= 40 % |
| objects / canvas Mpx (edge components >= 16 px) | 192 (108-261) | 141 (94-191) | **63** (30-119) | >= 105 |
| objects / frame (raw, area differs) | 113 (panel 0.59 Mpx) | 229 | 103 | - |
| fine-detail tiles (>= 10 % edge px) | 58 % (40-83) | 45 % (34-57) | **16 %** (4-32) | >= 34 % |
| verdict | PASS | WARN (gaps in 5 shots) | **FAR** (flat, obj, detail) | |

## v3 G5 per shot (! = WARN, !! = FAR)

| shot | time | ev/s | gap s | static | flat | obj/Mpx | detail | verdict |
|---|---|---|---|---|---|---|---|---|
| O1 | 0.00-5.80 | 6.2 | 1.23! | 0 % | 39 % | 119 | 32 %! | WARN |
| S4 | 5.80-9.48 | 0.3!! | 3.55!! | 28 %!! | 73 %!! | 32!! | 4 %!! | FAR |
| S5 | 9.48-11.48 | 1.0!! | 1.38! | 12 %! | 63 %!! | 54!! | 17 %!! | FAR |
| S6 | 11.48-16.60 | 0.4!! | 1.90! | 47 %!! | 71 %!! | 33!! | 5 %!! | FAR |
| S7 | 16.60-18.28 | 0.6!! | 1.11! | 88 %!! | 71 %!! | 30!! | 11 %!! | FAR |
| S8 | 18.28-19.40 | 0.9!! | 1.07! | 28 %!! | 56 %!! | 55!! | 13 %!! | FAR |
| S9 | 19.40-22.68 | 6.4 | 1.17! | 0 % | 50 %! | 102! | 26 %! | WARN |
| S10 | 22.68-25.24 | 2.7! | 0.71 | 3 % | 69 %!! | 60!! | 15 %!! | FAR |
| S11 | 25.24-29.40 | 1.2!! | 2.87!! | 32 %!! | 72 %!! | 30!! | 5 %!! | FAR |
| S12 | 29.40-31.32 | 1.0!! | 1.05! | 49 %!! | 70 %!! | 41!! | 12 %!! | FAR |
| S13 | 31.32-33.40 | 0.0!! | 2.08!! | 0 % | 50 %! | 74! | 24 %! | FAR |
| S14 | 33.40-36.36 | 5.7 | 0.60 | 11 %! | 64 %!! | 71! | 18 %!! | FAR |
| S15 | 36.36-38.84 | 1.6!! | 1.41! | 3 % | 41 %! | 106 | 28 %! | FAR |
| S16 | 38.84-41.15 | 4.3 | 1.03! | 57 %!! | 71 %!! | 36!! | 9 %!! | FAR |

Reading: only O1 (the home-base nook) and S9 are near the bar. The insert / wall shots (S4-S8, S10-S12, S16) are
two-thirds flat with a tenth of the references' detail and almost no new motion: the "object alone on a blank wall".

## Targets and why

- **ev/s >= 5.0 per film, >= 3.5 per shot; FAR < 2.5 / 1.75.** Playbook and motion_spec 9 (>= 5/s). Calibrated: the
  tracker reads ref 1 at 6.6/s and 1.00 s longest gap (motion_spec 9 measured 5.9/s and 0.97 s by its own method);
  ref 1's emptiest shots read 3.8-4.0 (a crowd that moves all the time is a few long events), so one shot gets 3.5.
- **Longest gap <= 1.0 s; FAR > 2.0 s.** Playbook ("no gap over 1 s"); ref 1's worst shot is exactly 1.00 s. v1 misses it in 5 shots.
- **Near-static <= 5 %, run <= 0.4 s; FAR > 25 % / 1.0 s.** motion_spec 9 (ref 1: 1 %, 0.07 s here).
- **Flat <= 40 %; FAR > 55 %.** v1's film mean 32 % already includes the flat sky above the caption band (~19 % of the
  measured area) + 8 points; matches the worst reference shots (38-41 %). Ref 1 panel: 20 %.
- **Objects >= 105 / Mpx; FAR < 70.** 0.75 x v1 (141), far = 0.5 x v1; ref 1 is denser (192).
- **Fine detail >= 34 %; FAR < 22 %.** 0.75 x v1 (45 %), far = 0.5 x v1; ref 1 58 %.
- **gate_check --density** WARNs per shot; it FAILs only when a film AVERAGE (ev/s, static, flat, obj, detail) is FAR.

Caveats: events are a proxy (+-20 %); keep `--rate 30` (the targets live on a 30 fps clock: at 60 the same v3 cut
reads 45 % static). Fullness reads edges at 540 px wide: measure half-scale renders or better.

## Cozy holds (`--cozy`, added 2026-10-26)

Camera shift removed first; movers = moving blobs per frame; empty = frames with no mover; cv = std / mean of changed pixels per
frame; float = camera px/s at 1080 (method in the script header). **River ref** (cozy3, crop 61,61,1019,2004): movers 2.9 (1-5),
empty 0 %, cv 0.14, float 10.1 px/s · **street ref** (cozy2, 0-7.9 s, crop 92,92,988,1748): movers 3.2 (1-7), empty 0 %, cv 0.73
(builds to a bus-and-car peak), float 0.2 (locked) · **v3 G5**: movers 1.0, empty 56 % (11 of 14 shots >= 37 %, S13 100 %), cv
1.13 (median shot; 7 shots > 1.2), float 2.3 px/s (the invisible 1.4 % push-in; S9 crane 54). Both cozy refs PASS, v3 is FAR
everywhere except S10. Reading: the calm refs always show 2-4 figures in motion; v3's holds show none for half their frames.
