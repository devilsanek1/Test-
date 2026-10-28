# Video 2 ("One Small Window"): how the film is wired (engine K1 + K8)

The direction is `docs/look/DIRECTION.md` (with `CRAFT.md`), this film's `THROUGHLINE.md` and the story in `TREATMENT.md` (they
win in that order; `STYLE.md` holds the values); this page is only the plumbing. Pattern: v3's G5 shell (`G5_BLOCKING.md` §1-7).

## 1. Wiring
| file | owner | what |
|---|---|---|
| `src/v2r/palette.ts` | engine K1 | "10 Canal Mint": role tokens `CM.*` (exact TREATMENT §2 hex), the house theme tokens rewritten IN PLACE at load, the four light states (`LIGHT`, `TOD`, `SHOT_LIGHT`, `skyBands` / `skyKey`), caption tones, `problems()`. **Every entry imports it FIRST.** |
| `src/entry-v2r-film.tsx` | engine K8 | `Film2R` (2345 f, 60 fps, props `{draftLabel}`: ON for reviews, `false` for the final), `Film2RShot {id}`, `Film2R-<ID>`, `Film2RBare` (no captions / credits / label). |
| `src/v2r/film/Film2R.tsx` | engine | `<Film>` + the data below (no frame-0 block since REVIEW_1 MUST 1); engine credits, the push-through bridge, cues. |
| `src/v2r/film/scenes.json` | engine (integrator) | V2S1-V2S8: THROUGHLINE §3's times and transitions, each with its join's `carrier` (+ `light`, `lane`, `note`). Hand-written. |
| `src/v2r/film/captions_pages.txt` -> `captions.json` | engine | pop captions on the HEARD clock (§4). |
| `public/v2r/voice_words_heard.json` | engine | `public/v2/voice_words.json` with beat_map §2's audible onsets / voiced ends; "can't" + "veto" split. |
| `src/v2r/scenes/index.ts` + `src/v2r/film/Placeholder.tsx` | engine | the registry; the palette-card placeholder every shot starts as. |
| `src/v2r/scenes/V2S<n>.tsx` + `V2S<n>_*.tsx` | its lane (L1-L6) | the shot. Replace the placeholder file whole. |
| `src/v2r/world/map.ts` K2 + `world/rigs.ts` (the light rigs) · `kit/cast` K4 · `kit/pip` K5 · `kit/canal` K6 · `kit/dc` K7 · `kit/boards` K3 (L5) | kit agents | shared spots / scale sheet and the film's own kit (each with its `src/entry-v2r-<kit>.tsx`). |
| `audio/v2r/**`, `public/v2r/**` (not the heard words) | sound K9 / L7 | `public/v2r/cues.json`: `[{src, t, gain}]` or `{"sfx": [...], "audio": "v2r/mix.wav"}` (`audio` replaces the voice: the final mix; cues whose file is not in public/ yet are skipped). |

Transitions (scenes.json = `docs/v2/THROUGHLINE.md` §3; every `transitionIn` names its `carrier`, so `gate_check.py` runs
CRAFT §a's carrier check): S1 cut (film start) · S2 A `push-through` from W (860,700) into her dark office window at M
(335,785), zoom 12, plum bridge, `inkComp` 0.6, dur 0.30 (out-leg 5.96-6.05, bridge 6.05-6.15, in-leg 6.15-6.26) · S3 B
`matchcut` at M · S4 A `push-through` from her silhouette's head (330,742) to her head (720,912), zoom 12, plum bridge, 0.30
(14.71-15.01) · S5 A `push-through` into SUN1 (250,650), zoom 7, no bridge, 0.30 (20.40-20.70) · S6 (start 23.80) D
`foreground-wipe` element `scene` = V2S5's `Wiper` (one blossom tree), dir `left`, 0.36 s (23.62-23.98) · S7 (start 28.10) A
`push-through` into SUN2 (260,620), zoom 7, no bridge, 0.30 (27.95-28.25) · S8 D `foreground-wipe` element `scene` = V2S7's
`Wiper`, dir `left`, 0.46 s (32.70-33.16) · V2S8 `transitionOut` un-build 0.26 s (38.82-39.08), the loop's B, captions back at
`captionAt` 39.04. No plain cut; Pip never hops across a join. Until V2S5 exports its `Wiper`, lib/Film falls back to its
figure wiper there (a stand-in only).

## 2. The scene contract (what a lane implements)
- `export default` a `React.FC` with no props, returning one `<World>` (`lib/World`). `useTime()` = SHOT-local seconds (0 = the
  scenes.json start); a word heard at film time w lands at `t = w - start` (`voice_words_heard.json`, never the raw json). Seconds
  only, deterministic (`lib/rng`, never `Math.random`), flat fills, no opacity / blur / gradient, 60 fps (frame = round(t x 60)).
- Import from the lib modules themselves (`lib/World`, `lib/Fill`, `lib/Ink`, `lib/time`, `lib/rng`, `lib/sketch`, `lib/exit`,
  `lib/ShotCam`, `lib/persp`, `lib/inkComp`, `lib/font`, `lib/stage`, `lib/tier`, `lib/light`, `lib/idle`, `lib/pullback`), the palette
  (`src/v2r/palette`), `world/map.ts`, `world/rigs.ts` and `kit/**`. Never the barrel `lib/index` (it pulls `lib/kit` and the cine kit),
  never another film's folder (v1's `src/scenes`, `src/v2/**`, `src/v3/**`: v3's `idle.ts` and `Pullback.tsx` were ported to `lib/idle.ts`
  and `lib/pullback.tsx`), never `Film2R.tsx` (circular: it imports the registry).
- Optional exports: `captionTone: ToneKey[]` (always `[{t: 0, tone: 'dark'}]` here: ink on the mint); `Wiper: WiperComponent`
  (V2S5: one blossom tree for the wipe into S6, clipped at y >= 560; V2S7: the narrowboat for the wipe into S8; screen px
  centred on x, opaque over its body full height, static `half` = real half-width, static `captionRegions`).
- **V2S1 at t < 0** is frame 0 AND the loop underlay: during the un-build it renders at t = T - 39.083 (-0.26 ... 0). Frame 0
  in the clean pen (DIRECTION rule 9, THROUGHLINE §4.1): paper; the C world as flat PALE shapes; the A subjects' outlines (her,
  the door, W) drawing on with Pip's tinted line; the sun half-coloured; no colour before the flood from SUN0 (a `Look
  cascade` with `at: 0`; the pale pre-state is the opt-in `cascade.pale`); first motions starting 3-4 frames before t 0. **V2S8's un-build**: `Ink` / `Fill` read the exit; raw SVG reads `useExit()`; drop the
  sky slab with `useExit() > 0 ? 'transparent' : sky`, her window and the ghosts last.
- **Join hooks** (spots in K2 `map.ts` `MATCHES`): both lanes of a join put the shared object on the same screen spot: W at
  (860,700) for the push-through and the loop (zoom 1.00 on both sides); M (335,785) 132.5 x 164.3 at 12.98; her head at
  (330,742) / (720,912) at 14.86; SUN1 (250,650) r 65 at 20.55; SUN2 (260,620) r 45 at 28.10; Pip on both sides of every
  join (swept, riding the carrier, or in the same spot). S2 owns its 12 % ease-out 6.10-6.70 (its own camera, under the
  transition's in-leg).
- Screen: nothing drawn in y 317-556 (the caption block; the band margin y 290-600 stays flat sky), key reads in x 120-880, nothing
  in the right rail (x > 780 below y 840 for boards and Pip), the draft label lives bottom-left (y > 1850).

## 3. Frame 0, captions, credits (engine)
- Frame 0 (REVIEW_1 MUST 1; playbook "Hook and pacing": no title over the captions, as Film3): page 1 "She [quit] Google."
  at the house size from f0; "And she says her contract / bans her from [criticizing] it…" 2.00 (its long lines set it at
  ~81 px), "[for life]." 4.79, out at 5.88 as the dive starts; from the loop roll (39.04) page 1 returns, as at f0. The core
  line is the cover's text and the source the post's (`docs/v2/POSTING_KIT.md`).
- Captions: `python3 -I scripts/film_captions.py --words public/v2r/voice_words_heard.json --pages src/v2r/film/captions_pages.txt
  --out src/v2r/film/captions.json --spell criticizing=criticising` (her quote in British spelling). House geometry: 98 px at 387 /
  510 (the 317-556 block; boxes reach y 299). `@out` empties the band through the two plum dives (5.88, 14.64).
- Credits: S8's caption-band source 33.16-36.54 (`FILM2R_CREDITS`; S1's source line is gone: REVIEW_1 MUST 1); every other
  credit is drawn on its object by its lane (TREATMENT §8).

## 4. Previews (always GL / --gl=angle, --concurrency=2; the conform: stills and short clips at --scale 0.25-0.4 only, no full-film renders but the orchestrator's assembly)
```bash
E=--entry=src/entry-v2r-film.tsx
GL=angle node scripts/render-frames.mjs Film2R-V2S4 <dir> 0.2,1.0,2.5 $E --scale=0.4          # shot-local seconds
GL=angle node scripts/render-frames.mjs Film2R <dir> 12.95,12.98,13.0 $E --scale=0.4           # a join in context (film s)
npx remotion render src/entry-v2r-film.tsx Film2R-V2S4 <out>.mp4 --gl=angle --concurrency=2 --scale=0.4
npx remotion render src/entry-v2r-film.tsx Film2R <out>.mp4 --gl=angle --concurrency=2 --scale=0.4     # the assembly's review cut (label on)
GL=angle node scripts/render-media.mjs Film2R out/v2r_final.mp4 --entry=src/entry-v2r-film.tsx --master --concurrency=2 --props='{"draftLabel":false}'   # the master (PIPELINE_V2 "Master encode")
npx remotion render src/entry-v2r-film.tsx Film2RBare <out>.mp4 --gl=angle --concurrency=2 --scale=0.25 # sound-off cold read
```
Palette check: `problems()` in `src/v2r/palette.ts` (pass measured coverage for the budgets). Typecheck: `npx tsc --noEmit`.

## 5. The gate check
```bash
python3 -I scripts/qa/gate_check.py --mp4 <render.mp4> --scenes src/v2r/film/scenes.json --captions src/v2r/film/captions.json \
  --voice public/v2/voice.wav --entry src/entry-v2r-film.tsx --comp Film2R   # no --frame0 since REVIEW_1 MUST 1; cuts follow transitionIn (push-through bridge: cuts at c +- hold/2, the join's own `hold` 0.05 for V2S2 / V2S4; foreground-wipe: no cut); one shot: --only V2S4 on a Film2R-V2S4 render
```
Expected (the G5 assembly master, 2026-10-28, full size: `docs/v2/ASSEMBLY.md`): PASS, 4 WARN (V2S2's out-of-bridge cut at
f370, not f369: the dark window matches the plum bridge; V2S7's cut at f1685, not f1686; a cut-like f1429 inside the S5 -> S6
wipe, the wiper's own motion, no pop; extra cut-like f24 (the draw-on) and f2336 (the un-build)). Fix pass A's numbers:
`docs/v2/REVIEW_1.md` "Fix pass A". The master's other checks
(av_lag, the lints, light, depth, banding and their regions): ASSEMBLY.md.
The G7 master (2026-10-28, `docs/v2/MASTER.md`): FAIL 1, 6 WARN. The FAIL: V2S7's cut is found at f1684, not f1686.
f1684 is the S6 -> S7 zoom's own motion peak: since pass B lowered the boards, the 7x frame f1686 holds only sun and
sky, and no frame pops. Its other checks, with the light boxes: MASTER.md.
Engine note: lib/Film never draws a push-through `bridge` (it culls the outgoing scene first); Film2R draws it itself.
