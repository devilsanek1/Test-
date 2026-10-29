# The look test's scene lane (S): v2's S1 copied, the darks, the far stage, the switches

*Lane S of the 7 s look test (`STUDY.md` §10). Written as it goes; the integration (item 11) waits for lanes E, PT, N.*

## 1. What it is
- **The copy:** `video/src/look/poster_s1/` holds v2's S1 (`src/v2r/scenes/V2S1_*`, the 18 files of S1's tree; not
  `V2S1_public.tsx` (no longer drawn) or `V2S1_row_entry.tsx` (a dev entry)), its imports of v2r's palette, world and
  kits rewritten to `../../v2r/...` (read-only: nothing in `src/v2r` changes). File names are v2's, so
  `diff src/v2r/scenes/V2S1_set_wing.tsx src/look/poster_s1/V2S1_set_wing.tsx` shows exactly what the test changes.
- **The shell:** `PosterS1.tsx` is v2's own shot shell (lib/Film in shot mode over v2's `scenes.json` and
  `captions.json`, read-only), so every switch off is v2's picture; the voice is played by the shell, trimmed to S1.
- **The composition:** 7.0 s = 420 frames, 60 fps, 1080 x 1920: S1 0-6.1 s with v2's locked voice
  (`public/v2/voice.wav`, silent at 6.1 s: -72 dB, a clean cut) and pop captions ("for life." leaves at 5.88; S2's
  6.28 page never shows), then a 0.9 s locked hold: the camera at rest (the float is home from 5.8), no dive, no words,
  no sound, the world alive (cloud, water, motes, leaves). W stays the subject through the hold (v2 dived into it at
  5.875: `S1_TIER_A.w` now ends at 7.1).

## 2. Compositions and commands (entry `video/src/entry-look-poster.tsx`; run from `video/`)
| Composition | What |
|---|---|
| `PosterS1` | props: `preset` 'v2' (default) / 'pass1' / 'pass2', any switch (§3) on top, `label` (a burned-in review label, lib/Film's draft label), `audio` 'voice' (default) / 'mix' (v2's final mix, faded 5.80-5.95 before the retired dive's whoosh) / 'none', `captions` (default true) |
| `PosterS1-v2` | every switch off: v2's S1 plus the hold |
| `PosterS1-pass1` | STUDY §10's pass 1 as written on 2026-10-28 (the mottle from 3.5 s, Pip hidden, the float by depth, v2's line) |
| `PosterS1-pass2` | every decided change (all switches on) |

```bash
E=--entry=src/entry-look-poster.tsx
GL=angle node scripts/render-frames.mjs PosterS1 <dir> 0,1.0,3.0,5.2 $E --scale=0.5 --props='{"preset":"pass2"}'      # stills
GL=angle node scripts/render-frames.mjs PosterS1 <dir> 5.2 $E --props='{"preset":"v2","darks":true}'                    # one switch A/B
npx remotion render src/entry-look-poster.tsx PosterS1-pass2 out/poster_s1_pass2.mp4 --gl=angle --concurrency=2         # the clip
```

## 3. The switches (`src/look/poster_s1/switches.tsx`; all off = v2)
(filled in as each is built: §5)

## 4. The proof: the unchanged copy is v2
Rendered 2026-10-29 at full size (1080 x 1920), `GL=angle`, `--concurrency=2`:
`Film2R-V2S1` (`--entry=src/entry-v2r-film.tsx --props='{"draftLabel":false}'`) against `PosterS1` (preset v2, no
label) at 0, 1.0, 3.0 and 5.2 s (frames 0, 60, 180, 312): **0 px changed on all four** (max channel delta 0).
The hold (6.5, 6.99 s) renders; against 6.05 s only the life moves (water glints, motes, leaves, the cloud).
