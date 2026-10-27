# Video 2 ("One Small Window"): how the film is wired (engine K1 + K8)

The direction is `TREATMENT.md` (read it in full); this page is only the plumbing. Pattern: v3's G5 shell (`G5_BLOCKING.md` §1-7).

## 1. Wiring
| file | owner | what |
|---|---|---|
| `src/v2r/palette.ts` | engine K1 | "10 Canal Mint": role tokens `CM.*` (exact TREATMENT §2 hex), the house theme tokens rewritten IN PLACE at load, the four light states (`LIGHT`, `TOD`, `SHOT_LIGHT`, `skyBands` / `skyKey`), caption tones, `problems()`. **Every entry imports it FIRST.** |
| `src/entry-v2r-film.tsx` | engine K8 | `Film2R` (2345 f, 60 fps, props `{draftLabel}`: ON for reviews, `false` for the final), `Film2RShot {id}`, `Film2R-<ID>`, `Film2RBare` (no captions / frame-0 words / credits / label). |
| `src/v2r/film/Film2R.tsx` | engine | `<Film>` + the data below; the frame-0 block (`FILM2R_FRAME0`), engine credits, the push-through bridge, cues. |
| `src/v2r/film/scenes.json` | engine | V2S1-V2S8: TREATMENT §5 times + transitions (+ `light`, `lane`, `note`). Hand-written. |
| `src/v2r/film/captions_pages.txt` -> `captions.json` | engine | pop captions on the HEARD clock (§4). |
| `public/v2r/voice_words_heard.json` | engine | `public/v2/voice_words.json` with beat_map §2's audible onsets / voiced ends; "can't" + "veto" split. |
| `src/v2r/scenes/index.ts` + `src/v2r/film/Placeholder.tsx` | engine | the registry; the palette-card placeholder every shot starts as. |
| `src/v2r/scenes/V2S<n>.tsx` + `V2S<n>_*.tsx` | its lane (L1-L6) | the shot. Replace the placeholder file whole. |
| `src/v2r/world/map.ts` K2 · `kit/cast` K4 · `kit/pip` K5 · `kit/canal` K6 · `kit/dc` K7 · `kit/boards` K3 (L5) | kit agents | shared spots / scale sheet and the film's own kit (each with its `src/entry-v2r-<kit>.tsx`). |
| `audio/v2r/**`, `public/v2r/**` (not the heard words) | sound K9 / L7 | `public/v2r/cues.json`: `[{src, t, gain}]` or `{"sfx": [...], "audio": "v2r/mix.wav"}` (`audio` replaces the voice: the final mix; cues whose file is not in public/ yet are skipped). |

Transitions (scenes.json): S1 cut (film start) · S2 `push-through` from W (860,700) into her dark window (200,795), zoom 12, plum
bridge, `inkComp` 0.6, dur 0.30 (out-leg 5.96-6.05, bridge 6.05-6.15, in-leg 6.15-6.26) · S3 `matchcut` (W2) · S4 cut (Pip's leap) · S5
`matchcut` (SUN1) · S6 cut (Pip's leap) · S7 `matchcut` (SUN2) · S8 `foreground-wipe` element `scene` = V2S7's `Wiper`, dir `left`, 0.46 s
(32.70-33.16) · V2S8 `transitionOut` un-build 0.26 s (38.82-39.08), loop, captions back at `captionAt` 39.04.

## 2. The scene contract (what a lane implements)
- `export default` a `React.FC` with no props, returning one `<World>` (`lib/World`). `useTime()` = SHOT-local seconds (0 = the
  scenes.json start); a word heard at film time w lands at `t = w - start` (`voice_words_heard.json`, never the raw json). Seconds
  only, deterministic (`lib/rng`, never `Math.random`), flat fills, no opacity / blur / gradient, 60 fps (frame = round(t x 60)).
- Import from the lib modules themselves (`lib/World`, `lib/Fill`, `lib/Ink`, `lib/time`, `lib/rng`, `lib/sketch`, `lib/exit`,
  `lib/ShotCam`, `lib/persp`, `lib/inkComp`, `lib/font`, `lib/stage`), the palette (`src/v2r/palette`), `world/map.ts` and `kit/**`.
  Never the barrel `lib/index` (it pulls `lib/kit` and the cine kit), never v1 / v3 / v2 sets (TREATMENT §9), never `Film2R.tsx`
  (circular: it imports the registry).
- Optional exports: `captionTone: ToneKey[]` (always `[{t: 0, tone: 'dark'}]` here: ink on the mint); `Wiper: WiperComponent`
  (V2S7 only: the narrowboat for the wipe into S8; screen px centred on x, opaque over x +- 90 full height, static `half` = real
  half-width, static `captionRegions`). The current V2S7 placeholder exports a stand-in Wiper; L5 replaces it.
- **V2S1 at t < 0** is frame 0 AND the loop underlay: during the un-build it renders at t = T - 39.083 (-0.26 ... 0). Bare warm ink
  on paper (`<Look fills="paper">` or a `Look cascade` with `at: 0` from SUN0), the sun half-coloured and Pip in colour, first
  motions starting 3-4 frames before t 0. **V2S8's un-build**: `Ink` / `Fill` read the exit; raw SVG reads `useExit()`; drop the
  sky slab with `useExit() > 0 ? 'transparent' : sky`, her window and the ghosts last.
- **Cut hooks** (spots in K2 `map.ts`): both lanes of a cut put the shared object on the same screen spot on the cut frame: W at
  (860,700) for the push-through and the loop; W2 (335,785) 133 x 164 at 12.98; SUN1 (250,650) r 65 at 20.55; SUN2 (260,620) r 45 at
  28.06. S2 owns its 12 % ease-out 6.10-6.70 (its own camera, under the transition's in-leg).
- Screen: nothing drawn in y 317-556 (the caption block; the band margin y 290-600 stays flat sky), key reads in x 120-880, nothing
  in the right rail (x > 780 below y 840 for boards and Pip), the draft label lives bottom-left (y > 1850).

## 3. Frame 0, captions, credits (engine)
- `FILM2R_FRAME0`: SHE SAYS: NO CRITICIZING / GOOGLE. FOR LIFE. (72 px, baselines 372 / 452) + "Source: BBC News, 21 Oct 2026"
  (20 px, 550), until 5.95; box keys SAYS: 2.06 · NO 3.14 · NO CRITICIZING 3.74 · FOR LIFE. 4.77; `spoken: 'first'` = only "She
  [quit] Google." (52 px, baseline 516) under it; from the loop roll (39.04) the words return without a box.
- Captions: `python3 -I scripts/film_captions.py --words public/v2r/voice_words_heard.json --pages src/v2r/film/captions_pages.txt
  --out src/v2r/film/captions.json --spell criticizing=criticising` (her quote in British spelling). House geometry: 98 px at 387 /
  510 (the 317-556 block; boxes reach y 299). Pages 2-6 are hidden under the block but keep every word.
- Credits: the frame-0 source line (0-5.95, and from 39.04) and S8's caption-band source 33.16-36.54 (`FILM2R_CREDITS`); every other
  credit is drawn on its object by its lane (TREATMENT §8).

## 4. Previews (always GL / --gl=angle, --concurrency=2; stills at --scale=0.5 plus one 0.25 phone look)
```bash
E=--entry=src/entry-v2r-film.tsx
GL=angle node scripts/render-frames.mjs Film2R-V2S4 <dir> 0.2,1.0,2.5 $E --scale=0.5          # shot-local seconds
GL=angle node scripts/render-frames.mjs Film2R <dir> 12.95,12.98,13.0 $E --scale=0.5           # a cut in context (film s)
npx remotion render src/entry-v2r-film.tsx Film2R-V2S4 <out>.mp4 --gl=angle --concurrency=2 --scale=0.5
npx remotion render src/entry-v2r-film.tsx Film2R <out>.mp4 --gl=angle --concurrency=2 --scale=0.5     # review cut (label on)
npx remotion render src/entry-v2r-film.tsx Film2R out/v2r_final.mp4 --gl=angle --concurrency=2 --crf 14 --props='{"draftLabel":false}'
npx remotion render src/entry-v2r-film.tsx Film2RBare <out>.mp4 --gl=angle --concurrency=2 --scale=0.25 # sound-off cold read
```
Palette check: `problems()` in `src/v2r/palette.ts` (pass measured coverage for the budgets). Typecheck: `npx tsc --noEmit`.

## 5. The gate check
```bash
python3 -I scripts/qa/gate_check.py --mp4 <render.mp4> --scenes src/v2r/film/scenes.json --captions src/v2r/film/captions.json \
  --voice public/v2/voice.wav --entry src/entry-v2r-film.tsx --comp Film2R \
  --frame0 "SHE SAYS: NO CRITICIZING|GOOGLE. FOR LIFE." --frame0-until 5.95 --frame0-geom '{"size":72,"baselines":[372,452],"captionBaseline":516,"captionScale":0.5306,"spoken":"first","keys":["SAYS:","NO","NO CRITICIZING","FOR LIFE."],"source":"Source: BBC News, 21 Oct 2026","sourceSize":20,"sourceBaseline":550}'   # = FILM2R_FRAME0; cuts follow transitionIn (push-through bridge: cuts at c +- 0.05; foreground-wipe: no cut); one shot: --only V2S4 on a Film2R-V2S4 render
```
Expected (2026-10-27, quarter scale): PASS, 2 WARN (V2S2's out-of-bridge cut at f370, not f369: the dark window matches the
plum bridge; cut-like frames at the draw-on 9 / 14 / 24, f1248 and the un-build 2330 / 2336); frame 0 is checked with
FILM2R_FRAME0 via --frame0-geom (box x pad not modelled: eye-check the key boxes at full size).
Engine note: lib/Film never draws a push-through `bridge` (it culls the outgoing scene first); Film2R draws it itself.
