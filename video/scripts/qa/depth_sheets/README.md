# Depth sheets: what `scripts/qa/check_depth.py` measures on a still

One JSON per still (a shot at one time): the shot's planes, the air behind them, the silhouettes whose edges matter, the
grounds the camera looks down on, and things of known size. The rules and numbers are `docs/look/CRAFT.md` §f; the
engine that builds what this checks is `src/lib/depth.ts` (how-to: `src/lib/DEPTH.md`).

```bash
python3 -I scripts/qa/check_depth.py <still.png> --sheet scripts/qa/depth_sheets/<shot>.json [--json out.json] [--map debug.png] [--quiet]
```

## Format
- `units`: `"frac"` (fractions of the image's width and height: any frame size, reference 1's 1080 x 1350 card) or
  `"px"` (canvas px of the 1080-wide frame: a 0.4-scale render works, both axes scale by its width / 1080).
- `air`: boxes of the sky's lowest step right behind the farthest plane (the sun is masked by colour), or `air_hex`: the
  exact colour the code draws there (the film's atmosphere `air`, lib/depth `makeAtmosphere`). A plane may carry its
  own `air` boxes.
- `planes`: `{name, plane, boxes, exclude?, poly?, role?}`. `plane` 0 = the subject's plane, -1, -2 the foreground,
  +1 ... +4 farther (the same indices as the film's `recede(colour, plane, ATM)`); `role`: `"subject"` (the subject's
  plane: the reference for the contrast ratios; else the first plane 0), `"ground"` (a ground or water: out of the
  air ladder), `"env"` (default).
- `silhouettes`: `{name, tier: "A" | "mass", poly | rect | grab, roi?, exclude?}`. Prefer `poly` (from the code's own
  geometry, or baked once): `grab` (a GrabCut box) varies by up to ~6 L* with its start, so it runs with a fixed seed.
  `roi` = where along the outline to sample (the edge that matters: a corner against the sky, her against the wall).
- `ground`: `{name, roi, vps?}`: the ground's box and the shot's vanishing point(s) (from its camera: lib/depth
  `groundCam(...).vp`, `.vpX`); without `vps` the check finds the one most lines run to.
- `horizon` + `things`: `{name, y, px, m, level?}` (base y and on-screen height in canvas px, real height in metres):
  the size inversions and one camera's k.

## The calibration set (2026-10-27; frames come from the repo's own videos, extracted to a scratch dir, never committed)
`v2_g4_look_s1.json` (v2's G4 look clip at 5.4 s: the owner's flat frame) FAILS on all three signatures; the references
PASS where they show depth. `ffmpeg -ss <t> -i <video> -frames:v 1 <frame>.png`:

| sheet | frame | verdict | the numbers |
|---|---|---|---|
| `v2_g4_look_s1` | `deliverables/v2/v2r_G4_look.mp4` @5.4 | FAIL x3 | no air: the far back rows dE 18.3 from the air, the wing 13.1; melts: the wing's west edge median 2.9, 52 % one value, a 152 px run; elevation: our bank 84 % level, 0 % receding; + 15 WARN (the size inversion among them) |
| `v2_g4_look_s1` | `deliverables/v2/v2r_G4_look_v2.mp4` @5.4 (L1's depth pass) | FAIL x3 | 14.6 vs 13.1; 4.5 / 50 % / 160 px; 98 % level |
| `v1_25.5` | `deliverables/v1/php2shell_final.mp4` @25.5 | PASS | the far city dE 7.2 from its air, contrast 0.15x the subject plane's, 1 value, range 6 |
| `v1_38.5` | v1 @38.5 | PASS | a vista: dE to the air 24.1 -> 19.6 -> 15.6 -> 8.7, the farthest at 0.14x contrast |
| `v1_20.5` | v1 @20.5 | PASS | the walker median 31.0; the side street 27 % to its VP, 56 % level |
| `ref1_6.0` | `assets/ref/reference.mp4` @6.0 | PASS | the street 41 % to its VP, 42 % level |
| `ref1_17.5`, `ref1_1.0` | reference 1 @17.5, @1.0 | WARN | separation 35.4 / 34.2 and the street (57 % to its VP) pass; its far planes keep ink lines and detail (contrast 0.61-0.88x the subject plane's): v1, fill-only like our pen, is the model for the plane numbers |
| `v1_10.0` | v1 @10.0 | WARN | the square 34 % to its VP passes; the PHP house's walls sit near the side houses' value (median 12.7, 26 % one value): its ink outline carries it, ours (tier C) has none |
| `v1_1.0` | v1 @1.0 | WARN | the far city in front of the sun is busy (edges 1.16x) |
| `demo_canal` | `DepthDemo2R` @3 s, `{"mode":"flat"}` / `{"mode":"depth"}` | FAIL x2 / PASS | flat: melts, elevation; depth: the far city 9.9 / 5.9 from the air, the fin 15.5, the quay 58 % to the VP |
