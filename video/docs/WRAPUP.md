# Wrap-up (replaces INTEGRATION_PLAN.md + INTEGRATION_TODO.md, 2026-10-25)

Goal: finish. A 55.37 s film (Main, 1661 f @ 30 fps) where every scene is >= 8/10, the cuts read as one motion, the QA
gate passes on Main, the sound is re-locked, and the final render is delivered. Keep passes short: one round unless a
blocker remains. Git history has the full logs (INTEGRATION_TODO.md before this commit).

## Scene state (art / motion, last review)

| Scene | Score | Open |
|---|---|---|
| S01-S06, S11, S12 | >= 8 / >= 8 | done; edge hints done (EDGES.md 5.1) |
| S07 | 8 / 8.5 | edge hints: keep the bottom-left foreground readers in colour (film 22.07-24.10) |
| S08 | 7 / 8.5 | PEAK-2 not landing: dome must read colossal over ONE far district (foot behind row 2, apex ~y 820, far-plane value); 'millions' flood must follow the haze ladder (lighter/simpler with distance, no ink hoods at the horizon); the counted heap = hooded figures pressing the glass from outside (3/4 view, coat colours, hands), not black teardrops; the count must visibly escalate with sound off. Edge keep for the heap [0,900,470,1110]. |
| S09 | 8 / 8 | its fix r2 died mid-round (edits committed, renders). Majors: Pip's tram-boarding leap starts 9 f before any tram is on screen (39.17-39.47); the left paper edge hides the TramCue headlamp at x=-2 (39.00-39.38): move the cue inward or add a keep rect. |
| S10 | 7.5 / 8.5 | fix r2 ran, never re-reviewed. Majors were: old vs current sites don't read at thumbnail size; Pip's 'hey!' reads happy, not skipped. |

## Cuts (owner fixes both sides, then a check)

- Verified: S01|S02 (8.5), S03|S04 (9), S11|S12 (8). S05|S06 fixed + checked by eye (Pip's leap carries over).
- Loop seam S12|S01: Main f1660 vs f0 = 0 px below y 600 (checked after every edge change).
- To do: S02|S03, S04|S05, S06|S07, S07|S08, S08|S09, S09|S10, S10|S11. FixSign must match across S06/S07/S09/S10.
- Optional minors: S04 sun disc clips the right frame edge f431-436 (GLIDE.touch -> ~(965,672)); S01 f141 Pip's tail in
  the right UI rail.

## Captions

Page `out` times live in BOTH src/data/captions.overrides.json and src/data/captions.json (one page per line):
pages 1 (4.285), 6 (14.04), 9 (19.77), 22 (45.48), 25 (51.965). SkyCaptions drops an outgoing page once only
descenders remain. Open: S03.md asks for page 3 `out` ~8.393 (check 'password.' end first).

## Sound (phase D)

- Re-derive every SFX cue from each scene's FINAL beats (scene beats.ts), not the storyboard
  (audio/tools/cues_from_storyboard.py as a base; audio/cues.json).
- Known: S03 count ticks `pop_high` 11.955 + i*0.06 with pans (docs/scenes/S03.md ~l.139); `card_flip` 12.505 -> 12.30;
  S12 `typing_tick` 55.01 -> 55.063; one sun hop has two `whoosh_soft` (13.945, 14.17): keep 13.945, drop 14.17.
- Mix (audio/mix.py): treated voice vo_v3_final, cinematic bed (subtle at the start), SFX >= 8 dB under the voice,
  -14 LUFS integrated, -1 dBTP; click-free loop seam.

## Final checks + render (phases C, E)

- `bash scripts/qa/run_all.sh Main` (life >= 8, no dead run > 0.40 s, framecheck, capcheck); `python3 scripts/camspeed.py`
  on S09's pull-back.
- Render: `npx remotion render src/entry-film.ts Main out/php2shell_final.mp4` at 1080x1920, H.264 CRF ~14, yuv420p,
  AAC 320 k, faststart. Check duration 55.367 s, A/V sync, loop replay.
- One review pass on the final render (viewer / art / QA lenses), one fix round, re-render.
- Deliverables: out/php2shell_final.mp4, cover frame (the hook frame), posting kit (caption, pinned comment, hashtags,
  hook variants).
