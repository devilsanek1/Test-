# G5 blocking cut: how to build any video's film (engine shell + lanes)

G5 (`PIPELINE_V2.md` gate table): **real sets and props at draft quality, the FINAL camera, key poses, NO edges /
paper / texture, 60 fps.** The owner judges staging, readability at phone size and transitions that play. The story,
cut points, shot content and transitions are locked by the G3 board; G5 translates the monochrome board into real sets.
Video 3 is the reference implementation (`src/entry-v3-film.tsx`, `src/v3/film/`).

## 1. The shape: the whole film plays from minute one

The engine lane builds a shell where **every panel is its own file and starts as a board placeholder**, so the film
plays end to end (voice, sound cues, captions, cuts, the loop) before any set exists. Lanes then replace panel files
one by one; the film never breaks.

| file (vN = the video) | owner | what |
|---|---|---|
| `src/entry-vN-film.tsx` | engine | the film entry. **Imports `./vN/film/palette` FIRST** (the palette module restyles the theme tokens before any lib / kit module reads them), then registers `FilmN` (the whole film), `FilmNShot` (props `{id}`: one panel alone) and `FilmN-<ID>` (the same per panel, no props). 1080 x 1920, **fps 60**, `ceil(seconds * 60 - 1e-6)` frames. Template: `src/entry-v3-film.tsx`. |
| `src/vN/film/FilmN.tsx` | engine | wraps the house sequencer `<Film>` (`src/lib/Film.tsx`) with the video's data and the G5 options below. |
| `src/vN/film/scenes.json` | engine | the panels: `{id, start, end, transitionIn, captionTone, note}`; the last one carries the loop `transitionOut`. |
| `src/vN/film/captions.json` | engine | pop captions (section 5). |
| `src/vN/film/scenes/index.ts` | engine | the static registry: every panel imported by name. |
| `src/vN/film/BoardPanel.tsx` | engine | the placeholder: draws the locked board panel with SketchReel's `ShotView` at board time `start + t` (red marks dropped). |
| `src/vN/film/palette.ts`, `src/vN/film/kit/**`, `src/entry-vN-kit.tsx` | kit | the palette module, shared sets and props (`kit/README.md`). |
| `src/vN/film/scenes/<ID>.tsx` (+ helpers `<ID>_*.tsx`) | that panel's lane | the real set for one panel. |

Scaffold it from the locked board in one command (writes scenes.json, the registry, and a placeholder for every panel
file that does not exist yet; never overwrites a lane's file):

```bash
python3 -I scripts/g5_scaffold.py --animatic public/vN/animatic.json --film src/vN/film --drop LOOP --end <voice s> --loop-dur 0.3
```

Every `transitionIn` becomes a `cut` (the board's transition labels stay in `note`); the board's LOOP panel is dropped:
the last panel ends on the voice's end with the house loop `transitionOut {type: 'unbuild', loop: true, dur: 0.3}`,
un-building into the FIRST panel's `t < 0` bare-line state, so the film loops to the bare-line frame 0. Then copy
`BoardPanel.tsx`, `FilmN.tsx` and the entry from v3 and change the imports.

**Film options a G5 shell passes** (all optional props of `<Film>`, off by default so v1 / v2 render as before):
`audioSrc` (the voice, e.g. `vN/voice.wav`), `sfx` (the board's cues `[{src, t, gain}]`, played like SketchReel's),
`captionMotion: 'pop'` (owner playbook), `frame0` (the core line in words, section 5), `draftLabel: 'G5'` (burns in
"G5 · <panel id> · <m:ss.ss>" bottom-left, small, mid grey with a light halo, so the owner can name a shot), and
`edges={false}` (no edges / paper / texture before G6).

## 2. The scene contract (what a lane implements)

```tsx
// src/vN/film/scenes/S9.tsx
import React from 'react';
import {World, Fill, Ink, ShotCam, useTime, palette, type ToneKey} from '../../../lib';
const S9: React.FC = () => {
  const t = useTime();               // scene-local seconds: 0 = this panel's cut (scenes.json start)
  return <World sky={...}>...</World>;
};
export default S9;                    // REQUIRED: a React.FC with no props
export const captionTone: ToneKey[] = [{t: 0, tone: 'light'}];   // optional: overrides scenes.json for this panel
// export const Wiper: WiperComponent = ...;                     // optional: only for a foreground-wipe OUT of it
```

- **Time**: `useTime()` = panel-local seconds; a voice word at VO time w lands at `t = w - start`. Lead the voice
  (ENGINE §1 rule 5). Everything in seconds, deterministic (`rng`, never `Math.random`), flat (no blur, filters,
  gradients), **no opacity fades** (pop, grow, wipe, slide, draw on). ENGINE.md §1 (the ten rules), §3 (the template),
  §7 (primitives), §10 (kit).
- **Camera**: cuts add no camera. Every move is the panel's own (World `push` with explicit `to` / `at` / `dur`, or
  `<ShotCam keys>`), taken from the board's camera and `docs/vN/camera_plan_g3.md`. G5 sets the FINAL camera; peak
  speed per second (60 fps: ~450 px/s, i.e. ~7.5 px/frame for flat ink).
- **The first panel at t < 0** is the loop underlay and the frame-0 state: bare ink lines at `t < 0` with the first
  motions already running (start times slightly negative), colour floods in within ~0.3 s from t 0, voice from frame
  1, one continuous shot (playbook "The opening"). The last panel un-builds over its last `dur` s on top of it: build
  with `Ink` / `Fill` / kit (they read the exit value) or read `useExit()` for raw SVG (`<ExitShrink>` for characters).
- **Caption tone**: `captionTone` keys are scene-local `{t, tone}`: `'dark'` (ink) on light walls and skies, `'light'`
  (white) on dark skies; check the contrast (`contrast(a, b)` in `lib/Captions`: v3's dusk blue #5B6A94 takes white
  5.3:1, ink only 3.1:1). Export it from the panel file (the engine merges it over scenes.json); a `wipe` key follows a
  sky wipe edge (ENGINE §6).
- **Screen zones**: the caption band (y ~290-600, screen space) belongs to the captions: no busy detail there. Platform
  UI covers the top (y < 180), the bottom (y > 1520) and a right rail (x > 950, y 900-1500); the draft label sits at
  the bottom-left (y > 1850). Key action inside x 90-990, y 600-1480.
- **Board notation is not film**: the red pencil marks and the notes strip never appear. A red focus circle becomes a
  production emphasis that fits the look (light, the hero colour, a pop), never a drawn circle.
- **Look**: the video's LOOK.md, its approved style frame and palette roles (one hero colour, one dark anchor, at most
  one pop), `docs/look/COZY_AND_SCALE.md`, `docs/look/CINEMATIC_GUIDE.md`.

## 3. Lane rules

- Edit only your own files: `scenes/<ID>.tsx` and new helpers named `<ID>_*.tsx`. Never touch scenes.json,
  captions.json, the registry, the entry, the palette or the kit: put a change you need in your report under
  `REQUESTS:`, one exact line each (e.g. `REQUESTS: engine: scenes.json S9 captionTone -> [{"t":0,"tone":"light"}]`;
  prefer exporting `captionTone` yourself).
- Commit only your own paths (`git add <paths>`, never `-A` or `.`); never pull, merge, rebase, reset, stash or checkout.
- Keep a session small (one panel), check stills at 0.5 scale plus one 0.25 phone-size look, at most ~10 images.

## 4. Fastest previews of one panel (composition time = panel-local seconds; the label shows film time)

```bash
E=--entry=src/entry-v3-film.tsx
# one or more stills (one bundle, one browser); frame = round(t * 60)
node scripts/render-frames.mjs Film3-S9 /tmp/s9 0.2,1.0,1.8 $E --scale=0.5
# contact sheet + the caption legibility check (scripts/capcheck.py) on the same frames
scripts/sheet.sh Film3-S9 0 1.9 8 /tmp/s9_sheet.png $E --scale=0.35
# the props form (Film3Shot {id}); sheet.sh's caption check passes its own --props, so add --no-capcheck here
node scripts/render-frames.mjs Film3Shot /tmp/s9 0.5 $E --props='{"id":"S9"}' --scale=0.25
# every frame of a motion at 60 fps (scripts/strip.sh samples at 30 fps and bundles src/index.ts: use this instead)
node scripts/render-frames.mjs Film3-S9 /tmp/s9f $(python3 -c "print(','.join(f'{f/60:.4f}' for f in range(30, 60)))") $E --scale=0.33
# the cut in context (the film around a scene start: VO seconds)
node scripts/render-frames.mjs Film3 /tmp/cut 19.383,19.4,19.417 $E --scale=0.5
# a playable panel with its voice
npx remotion render src/entry-v3-film.tsx Film3-S9 /tmp/s9.mp4 --scale=0.5
```

Tile stills with `montage` (scripts/sheet.sh does it for you). Never render the whole film at full size in a lane
session; the owner's gate video is the orchestrator's render (`npx remotion render src/entry-v3-film.tsx Film3
deliverables/vN/vN_g5_blocking.mp4 --scale=0.5`).

## 5. Captions and frame 0

- `captions.json` = the house `CaptionBeat` format (`src/lib/Captions.tsx`), word-start times from the voice:
  `python3 -I scripts/film_captions.py --words public/vN/voice_words.json --pages src/vN/film/captions_pages.txt --out src/vN/film/captions.json`.
  The pages file is hand-paged: one page per paragraph, 1-2 lines of at most ~20 characters, split on phrase and
  sentence boundaries (never the board's fixed-width fragments), `[brackets]` = the highlight box on the key words.
  The script aligns it to the transcript by characters and fails if a word is missing or out of order.
- Pop captions (`captionMotion: 'pop'`): pages, lines and highlight boxes pop in place (owner playbook).
- **Frame 0 states the payoff in words** (`frame0`): the core line in the caption band from frame 0 until the board's
  `frame0Until`, in the style frame's caption look (caption tone colours, the highlight box), with the spoken captions
  lowered and scaled under it (one line, inside the band); they move back up on the first page change after `until`.
  From the loop roll (the last page rolls back to page 1 at `captionAt`, default end - 0.22 s) the words return, so
  the last frame lands on frame 0.

## 6. 60 fps notes

- Compositions are 60 fps; frame = `round(t * 60)`; lengths `ceil(seconds * 60 - 1e-6)` (Film's loop seam uses the
  same rounding). Animate in seconds only, so nothing depends on the rate.
- Speed limits are per second (~450 px/s for long flat-ink moves); drawn character motion may stay stepped (hold each
  drawing `round(60 / drawingsPerSecond)` frames) while the camera glides.
- The board placeholders run at 60 too (SketchReel is time-based).

## 7. The gate check (scripted, before the owner sees a cut)

```bash
python3 -I scripts/qa/gate_check.py --mp4 <render.mp4> --scenes src/v3/film/scenes.json --captions src/v3/film/captions.json \
  --voice public/v3/voice.wav --entry src/entry-v3-film.tsx --comp Film3 \
  --frame0 "AI is making your|next laptop pricier." --frame0-until 3.37
# one panel: add --only S9 (its length, no cuts) and point --mp4 at the Film3-S9 render
```

It checks: fps 60 (the MP4 and the composition), duration = the voice (+-1 frame), an audio stream in sync, every
scene start has a detected hard cut within 1 frame (caption band and label strip masked), and every caption page (and
the frame-0 words) inside the caption band and the caption clip, within the safe width. FAIL exits 1; WARN lines (long
lines, cut-like events inside a shot) are for a human look.
