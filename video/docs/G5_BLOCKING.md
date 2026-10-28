# G5 blocking cut: how to build any video's film (engine shell + lanes)

G5 (`PIPELINE_V2.md` gate table) **fills what G3 decided: the G3 tier masks filled in colour from the G4 kit (the clean
pen, the light rigs, the tier palettes: `docs/look/CRAFT.md`, never the sketch pen) — real sets and props at draft
finish, the FINAL camera, key poses, NO edges / paper / texture, 60 fps.** Nothing appears that G3 did not show: no new
places, movers or tier promotions (owner-approved 2026-10-27; `docs/retro/2026-10-27_v3_retro.md`). The owner judges
staging, readability at phone size and transitions that play. The story, cut points, shot content, transitions and
their carriers, the thread, the tiers, the light rigs and the mover budget are locked by the G3 board, the look by the
G4 look clip; G5 translates the monochrome board into real sets, one lane per SEQUENCE, with one agent owning every
transition (§3). The look and storytelling direction is `docs/look/DIRECTION.md` (every lane brief points there and to
`CRAFT.md`). Video 3 is the reference implementation of the shell (`src/entry-v3-film.tsx`, `src/v3/film/`; its G5b
sets are not the look model: §8b).

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
| `src/vN/film/scenes/<ID>.tsx` (+ helpers `<ID>_*.tsx`) | its sequence's lane | the real set for one panel. |

Scaffold it from the locked board in one command (writes scenes.json, the registry, and a placeholder for every panel
file that does not exist yet; never overwrites a lane's file):

```bash
python3 -I scripts/g5_scaffold.py --animatic public/vN/animatic.json --film src/vN/film --drop LOOP --end <voice s> --loop-dur 0.3
```

Every `transitionIn` carries the board's `transition.type` and its `carrier` (the labels also stay in `note`;
`G3_ANIMATIC.md` §7 tier 1 — until g5_scaffold.py is updated it still flattens to `cut`, so fix scenes.json by hand
after scaffolding: a transition the board PLAYED never ships flattened); the board's LOOP panel is dropped:
the last panel ends on the voice's end with the house loop `transitionOut {type: 'unbuild', loop: true, dur: 0.3}`,
un-building into the FIRST panel's `t < 0` drawing state, so the film loops back to frame 0 (§2). Then copy
`BoardPanel.tsx`, `FilmN.tsx` and the entry from v3 and change the imports.

**Film options a G5 shell passes** (all optional props of `<Film>`, off by default so v1 / v2 render as before):
`audioSrc` (the voice, e.g. `vN/voice.wav`), `sfx` (the board's cues `[{src, t, gain}]`, played like SketchReel's),
`captionMotion: 'pop'` (owner playbook), `frame0` (the core line in words, section 5), `draftLabel: 'G5'` (burns in
"G5 · <panel id> · <m:ss.ss>" bottom-left, small, mid grey with a light halo, so the owner can name a shot), and
`edges={false}` (no edges / paper / texture before G6).

**G5 entry and exit checks** (`G3_ANIMATIC.md` §2: G4+ may only ADD, never a mover, a place or a tier promotion —
these checks are where that promise is enforced; owner-approved 2026-10-27):
- **Entry, before lanes fan out:** (1) a scripted diff of scenes.json and each built scene against the locked board
  JSON — every camera move, element move, transition device and carrier, and `life:`/promise item matches, and no
  motion exists that G3 did not play; a mismatch is a FAIL or an explicit, owner-visible G3 reopen. (2) A sound-off
  cold read of the first fully dressed set (the home set, the density key, as built for the G4 look clip): map each
  board `promise` line to what a cold reader names (v3: streams read as birds). (3) CRAFT's measures (`CRAFT.md` §e:
  carry, eye jump and colour shift per join; tiers and salience; line; light with `scripts/qa/check_light.py`; depth with
  `scripts/qa/check_depth.py` and the set's sheet) run on
  the G3 reel and on the approved G4 look clip: the baseline the exit is compared with. Lanes start only after (1) and
  (2) pass and the baseline is recorded.
- **Exit, before the owner sees the cut** (with the gate check, §7): the same diff and measures rerun on the G5 render
  and compared with the baseline and CRAFT's numbers (warnings with a declared exception; `CRAFT.md` §a's two FAILs, a
  carrier per join with at most 2 plain cuts and the thread >= 80 % with no gap over 3 s, and §f's three depth FAILs stay
  FAILs): every join keeps
  its carrier, nothing rises above its G3 tier, no mover or place appears that G3 did not show. Until the craft tooling
  lane ports the measures into `scripts/qa` (`PIPELINE_V2.md`), the raw versions are in `scripts/qa/retro_tools/`.

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
  gradients), **no opacity fades** (pop, grow, wipe or slide; a draw-on at frame 0 and where the drawing is the beat:
  `docs/look/DIRECTION.md` rule 8). From `ENGINE.md`: §1 rules 1-5, 7 and 10
  (rules 6, 8 and 9 are retired: `docs/look/DIRECTION.md`), §4-§6 (stage, transitions, captions) and §7 (primitives,
  with the clean pen); its §3 template and §10 kit show the API, never the look (v1's sketch pen, drifting sun,
  per-shot push).
- **Camera**: cuts add no camera. Every move is the panel's own (World `push` with explicit `to` / `at` / `dur`, or
  `<ShotCam keys>`), taken from the board's camera and `docs/vN/camera_plan_g3.md`: G5 sets the FINAL camera with the
  shape and timing G3 played (holds locked or the `COZY_AND_SCALE.md` 3b.5 float, never a zoom). The one speed budget
  is `PIPELINE_V2.md` "Frame rate" (~15 px/frame at the render rate; readable at 1x is the test).

**Joins: each carrier's engine form** (`CRAFT.md` §a; the incoming panel's `transitionIn`, `lib/Film.tsx`). The
transition agent (§3) owns every row; a dissolve is no carrier (no opacity fades), only a declared time-passing
exception from the G3 hand-off.

| carrier | Film `transitionIn` / how |
|---|---|
| A push-through | `push-through` into the sub-frame the board drew, handed over at matched scale (`bridge` only for a matched flat colour) |
| B thread match | `matchcut`: the thread in the same screen spot (±8 %) and size (±20 %) on both sides |
| C continuous camera | one panel (the move inside it), a seam between two sequences (§2b), or `camera-continuous` between two panels in one place |
| D object carry or wipe | `foreground-wipe` (its element already in the outgoing panel), or a carry across a `cut` (same direction and speed on both sides) |
| E card flip or swipe | an in-panel flip of the same paper (no Film type yet: the craft tooling lane builds one) |
| F plain cut | `cut` (at most 2 per film, on a "But" turn) |

- **The first panel at t < 0** is the loop underlay and the frame-0 state, the scene being drawn in the clean pen: at
  `t < 0` the subject's outline (with tier B's tinted lines) draws on and the first motions already run (start times
  slightly negative), tier C lands as flat pale shapes, and colour floods in within ~0.3 s from t 0; voice from the
  first frames (the first word at ~0.12 s, the voice file's lead), one continuous shot (`docs/look/DIRECTION.md` rule 9; the owner approves this build with the G4 look clip). The
  last panel un-builds over its last `dur` s on top of it: build
  with `Ink` / `Fill` / kit (they read the exit value) or read `useExit()` for raw SVG (`<ExitShrink>` for characters).
- **Caption tone**: `captionTone` keys are scene-local `{t, tone}`: `'dark'` (ink) on light walls and skies, `'light'`
  (white) on dark skies; check the contrast (`contrast(a, b)` in `lib/Captions`: v3's dusk blue #5B6A94 takes white
  5.3:1, ink only 3.1:1). Export it from the panel file (the engine merges it over scenes.json); a `wipe` key follows a
  sky wipe edge (ENGINE §6).
- **Screen zones** (the one definition; the board, `LIFE_AND_DENSITY.md` §8 and `COZY_AND_SCALE.md` §5 point here):
  the caption band (y ~290-600, screen space) belongs to the captions: no busy detail there. Platform UI covers the top
  (y < 180), the bottom (y > 1520) and a right rail (x > 950, y 900-1500), as `scripts/qa/framecheck.py` checks them:
  dressing may run under them, key information never. Key action (the subject's action, a label, a number, a contact
  point) inside x 120-950, y 600-1480 (the board stages its subject in the read zone, y 600-1250:
  `docs/look/STORYBOARD_STYLE.md` §3); the draft label sits at the bottom-left (y > 1850). Ad templates cover more (the
  bottom 35 %, and x > 780 from y 840): a cut made for ads keeps its key reads above y 1250 and, below y 840, left of
  x 780.
- **Board notation is not film**: the red pencil marks and the notes strip never appear. A red focus circle becomes a
  production emphasis that fits the look (light, the hero colour, a pop), never a drawn circle.
- **Density and life: fill what G3 decided.** Every G3 placeholder and `life:` item becomes its real dressing and life
  at its G3 tier, so every panel is full and alive, calm and tiered (a world around the subject, people, the living
  character, slow life that never stops): `docs/look/CRAFT.md` §b, `docs/look/LIFE_AND_DENSITY.md`. Nothing the board
  did not show: no new places, movers or tier promotions (a particle field is a mover: only the fields G3 named, from
  `lib/particles.tsx`, inside the mover budget). `scripts/qa/density.py` is information before the owner sees
  a cut (its events/s and gap are never a reason to add movers).
- **Look**: the approved G4 look clip and its kit (the clean pen, the set's light rig, the tier palettes), the video's
  STYLE.md (v3: LOOK.md) and palette roles (one hero colour, one dark anchor, at most one pop), inside
  `docs/look/DIRECTION.md` and `CRAFT.md`; then `docs/look/COZY_AND_SCALE.md`, `docs/look/CINEMATIC_GUIDE.md`. Every
  set, person, prop and Pip is the film's own kit (playbook: no reusable assets; people have no faces); `lib/cine`'s
  drawing pieces are references, never film code, until the craft tooling lane ports them to the clean pen
  (`CRAFT.md` §c; its camera and utilities are fine). The light and shadow layers come from `lib/light.tsx`, depth from
  `lib/depth.ts` (the set's atmosphere, planes and ONE camera from W1: `CRAFT.md` §f; how-to `lib/DEPTH.md`), particles
  from `lib/particles.tsx`; a film never imports another film's folder (`src/vN/`).

## 2b. The sequence contract (one scenes.json row = one SEQUENCE; the v3 rework on)

A sequence spans several script lines in ONE place and owns its camera end to end; scenes.json then holds sequences,
not board panels (v3: `docs/v3/flow_v2.md` §2, SQA-SQF). §2 holds for it, plus:
- **One file per sequence** (`scenes/<SQ>.tsx` + helpers `<SQ>_*.tsx`), one lane each. It starts as a PLACEHOLDER that
  plays the old panels it replaces, each in its own window of film time with its own time base and caption tone, as
  before (`lib/sequence.tsx` `PanelWindows` + `panelTones`; v3: `scenes/g5b_panels.tsx`), so the film plays end to end
  from the first commit (v3: pixel-identical to G5b except J3's new push-through). The lane replaces the file whole;
  the old panel files stay as set libraries, no longer scenes.
- **The camera is the sequence's own:** every move inside it is a function of FILM time on its place's shared camera
  (v3: `homeCam(T)`, `entryCam(T)`), so the framing never jumps where one builder hands over to the next; the engine
  moves a camera only in its own transitions (`push-through`, `camera-continuous`).
- **Film time:** `useTime()` is sequence-local; `useFilmTime()` (`lib/sequence.tsx`) is film seconds, bit-exact in a
  normal layer and negative in the loop underlay (the first sequence's t < 0 drawing state). Whatever is drawn on both
  sides of a join (a set, its camera, the thread plane, a held prop) keys on film time.
- **Shared pieces have ONE owner each** (a file per piece; v3, flow_v2 §3: `home_set` + `homeCam` the SQA pilot,
  `thread_plane` and `h2_window` + `entryCam` the transition agent, `outside` the SQE lane). Every other builder
  imports it read-only, never a copy or a hand-drawn twin; a change goes to its owner under `REQUESTS:`.
- **Joins** (the incoming row's `transitionIn`, always with its `carrier`):
  - a **seam**, `{"type": "matchcut", "seam": true, "carrier": "C"}` ("A" for a pull-back through a window both
    builders draw): the carrier's motion runs ACROSS the boundary and both builders draw the IDENTICAL picture there,
    so Film's hard cut at frame f = ceil(c x 60) shows nothing. Put c mid-move or on a held frame, never on an event;
    each builder must also render correctly just past its window (the outgoing at f, the incoming at f - 1).
  - an **engine transition** (A `push-through`, D `foreground-wipe`, `camera-continuous`): the engine moves or clips
    both sides; each builder draws its side to the join's numbers (v3 J3: the same stick at (540, 870), w 700, rot -4
    on both sides, so at x7 only the bands around it change).
  - the **loop**: the last sequence's `transitionOut` un-build onto the first one's t < 0 state (§2).
- **How two builders meet:** the transition agent writes each join's frame-exact state at c (positions, camera, light,
  who moves) into the shared pieces and both builders import it. Checks: `gate_check.py --seam-comp FilmNSeams` (§7:
  a cut at a seam is a FAIL; the seam probe, `FilmSeamProbe` registered as `FilmNSeams`, renders each side ALONE at
  f - 1 and f, and over 1 % of the pixels differing by > 4 L* is a FAIL) and a 60 fps strip of c ± 0.4 s.
- **Chunks** for the full-size render: `python3 -I scripts/film_chunks.py src/vN/film/scenes.json --max 360` (one per
  sequence on Film's own ceil boundaries, the long ones split; §8b).

## 3. Lane rules

- **One lane per SEQUENCE** (owner-approved 2026-10-27): a lane owns the consecutive panels in one place (with their
  shared set files) and builds them panel by panel, to the G3 tier masks, from the G4 kit. **One transition agent owns
  every join** of the film, in film order: the carrier's motion across each cut on both sides, and the `transitionIn` /
  `carrier` rows (through the engine lane) and any `Wiper`; a lane builds its panels to each join's in and out frames
  and sends a change at a join to it under `REQUESTS:`. (v3 G5b: per-panel lanes re-made the recurring places
  differently, and nobody owned what crossed a lane border, §8b.)
- Edit only your own files: your sequence's `scenes/<ID>.tsx` and new helpers named `<ID>_*.tsx` (the transition agent
  edits a join's in and out frames there, in turn). Never touch scenes.json, captions.json, the registry, the entry, the
  palette or the kit: put a change you need in your report under `REQUESTS:`, one exact line each (e.g.
  `REQUESTS: engine: scenes.json S9 captionTone -> [{"t":0,"tone":"light"}]`; prefer exporting `captionTone` yourself).
- Commit only your own paths (`git add <paths>`, never `-A` or `.`); never pull, merge, rebase, reset, stash or checkout.
- Keep a session small (one panel), check stills at 0.5 scale plus one 0.25 phone-size look, at most ~10 images.

## 4. Fastest previews of one scene (a sequence; composition time = scene-local seconds; the label shows film time)

```bash
E=--entry=src/entry-v3-film.tsx
# one or more stills (one bundle, one browser); frame = round(t * 60)
node scripts/render-frames.mjs Film3-SQD /tmp/sqd 0.2,1.0,1.8 $E --scale=0.5
# contact sheet + the caption legibility check (scripts/capcheck.py) on the same frames
scripts/sheet.sh Film3-SQD 0 1.9 8 /tmp/sqd_sheet.png $E --scale=0.35
# the props form (Film3Shot {id}); sheet.sh's caption check passes its own --props, so add --no-capcheck here
node scripts/render-frames.mjs Film3Shot /tmp/sqd 0.5 $E --props='{"id":"SQD"}' --scale=0.25
# every frame of a motion at 60 fps (scripts/strip.sh samples at 30 fps and bundles src/index.ts: use this instead)
node scripts/render-frames.mjs Film3-SQD /tmp/sqdf $(python3 -c "print(','.join(f'{f/60:.4f}' for f in range(30, 60)))") $E --scale=0.33
# a join in context (the film around a scene start: VO seconds), and a seam's two builders alone (§2b)
node scripts/render-frames.mjs Film3 /tmp/cut 19.383,19.4,19.417 $E --scale=0.5
node scripts/render-frames.mjs Film3Seams /tmp/seams $(python3 -c "print(','.join(f'{k/60:.4f}' for k in range(16)))") $E --scale=0.25
# a playable sequence with its voice
npx remotion render src/entry-v3-film.tsx Film3-SQD /tmp/sqd.mp4 --scale=0.5
```

Tile stills with `montage` (scripts/sheet.sh does it for you). Never render the whole film at full size in a lane
session; the owner's gate video is the orchestrator's render, at FULL size (1080 x 1920: at 0.5 scale the fine lines
blur and the float camera's sub-pixel drift flickers, `LIFE_AND_DENSITY.md` §9, §8b below):
`npx remotion render src/entry-vN-film.tsx FilmN deliverables/vN/vN_g5_blocking.mp4`, or chunked per panel for a long
film (§8b's recipe).

## 5. Captions and frame 0

- `captions.json` = the house `CaptionBeat` format (`src/lib/Captions.tsx`), word-start times from the voice:
  `python3 -I scripts/film_captions.py --words public/vN/voice_words.json --pages src/vN/film/captions_pages.txt --out src/vN/film/captions.json`.
  The pages file is hand-paged: one page per paragraph, 1-2 lines of at most ~20 characters, split on phrase and
  sentence boundaries (never the board's fixed-width fragments), `[brackets]` = the highlight box on the key words.
  The script aligns it to the transcript by characters and fails if a word is missing or out of order.
- Pop captions (`captionMotion: 'pop'`): pages, lines and highlight boxes pop in place (owner playbook).
- **Frame 0 states the payoff in words** (`frame0`): the core line in the caption band from frame 0 until the board's
  `frame0Until`, in the G4 look's caption style (caption tone colours, the highlight box), with the spoken captions
  lowered and scaled under it (one line, inside the band); they move back up on the first page change after `until`.
  From the loop roll (the last page rolls back to page 1 at `captionAt`, default end - 0.22 s) the words return, so
  the last frame lands on frame 0.
- (v2) Pages before `until` AND the page starting ON `until` stay lowered: make them one line. Credits = FilmN's own overlay keyed by the panel on screen (scenes.json `credit`), one ink-on-cream tab at y ~185-288 (under the top UI, above the band), hidden while the frame-0 words show (seam = frame 0).
- (v2) A frame-0 credit needs a custom `Frame0Text` layout (words 70 on 340 / 424, credit 34 on 472, captions 556 at 0.68); gate_check reads Film.tsx's default F0, so re-check custom numbers. `FilmNBare` = `<Film showCaptions={false}>`, no frame0 / label / overlay: sound-off cold reads.

## 6. 60 fps notes

- Compositions are 60 fps; frame = `round(t * 60)`; lengths `ceil(seconds * 60 - 1e-6)` (Film's loop seam uses the
  same rounding). Animate in seconds only, so nothing depends on the rate.
- Speed: the one budget in `PIPELINE_V2.md` "Frame rate" (~15 px/frame at the render rate, a WARN; readable at 1x is
  the test), with the timing G3 played; drawn character motion may stay stepped (hold each
  drawing `round(60 / drawingsPerSecond)` frames) while the camera glides.
- The board placeholders run at 60 too (SketchReel is time-based).

## 7. The gate check (scripted, before the owner sees a cut)

```bash
python3 -I scripts/qa/gate_check.py --mp4 <render.mp4> --scenes src/v3/film/scenes.json --captions src/v3/film/captions.json \
  --voice public/v3/voice.wav --entry src/entry-v3-film.tsx --comp Film3 --seam-comp Film3Seams \
  --frame0 "AI is making your|next laptop pricier." --frame0-until 3.37
# one sequence: add --only SQD (its length, no cuts) and point --mp4 at the Film3-SQD render
```

It checks: fps 60 (the MP4 and the composition), duration = the voice (+-1 frame), an audio stream in sync, the cuts
each scene's `transitionIn.type` should produce, within 1 frame (caption band and label strip masked): `cut`,
`matchcut` and `camera-continuous` one hard cut at the start; `push-through` one (two with a `bridge`: into and out of
it; a long dive's cut also counts as a spike over its zoom legs, x1.5 both neighbours); `foreground-wipe` none (the element covers the change; a hard cut there is a WARN); a seam (`matchcut` +
`seam: true`, §2b) none (a cut there is a FAIL), and with `--seam-comp` the seam probe compares its two builders'
frames (over 1 % of the pixels differing by > 4 L* is a FAIL; without it, a WARN); an `unbuild` transitionIn is not
modelled yet (expected as a cut); a join that stays inside one scene (carrier C) has no scene start at all. And every
caption page (and the frame-0 words) inside the caption band and the caption clip, within the safe width. With
`carrier`s in scenes.json it also checks CRAFT §a's first FAIL: every join names one (A-F), at most 2 are F. FAIL
exits 1; WARN lines (long lines, cut-like events inside a shot) are for a human look. The thread's coverage is not
scripted yet (the craft tooling lane, `PIPELINE_V2.md`).

## 8. Lessons from v3 (the assembler's round)

Six panel lanes, an engine lane and a kit lane built v3's G5 in parallel; one assembler folded their requests in,
rendered the film and fixed what only shows across panels.

- **What kept the lanes consistent:** one kit with a written consistency contract (THE laptop, tag, phone, data center,
  You, stick: never redrawn by hand), the palette module rewriting the house tokens (no lane could drift a colour),
  shared-set files for repeated frames (`O1_set` for O1 + S15, `S10_set` for S10 + S14, `S4_wall` / `S4_chart` for
  S4 / S6 / S11), and panels exporting their own `captionTone` (no shared-file edits). At phone size every object
  matched across panels on the first assembly.
- **What did not:** kit defects surfaced only when a lane used a prop at its real panel size (the thought cloud's
  geometry, a hero-coloured clock hand, the struck old price and the tag back's sign too small to read, a fixed lid
  height that filled S8's frame with dark screen, dashed keys reading as bars at 1400 px, the factory's door side
  and steam, the van decal size). Each lane worked around it locally (a private bubble, a mirrored + clipped factory,
  a laptop drawn over the decal), so the assembler had to fold eight requests back into the kit and undo the
  workarounds.
- **The loop seam had three owners and no viewer:** the engine's un-build collapses the last panel's sky slab last,
  O1's bare-line underlay waits beneath it, and S16's wall is the same colour, so the slab hid O1's lines until the
  final two frames (four near-empty frames, then a wipe). Fix: the last panel drops its sky slab while it un-builds
  (`useExit() > 0` -> `sky="transparent"`, S16) so the first panel's lines draw on in place.
- **Set up first next time:** (1) the kit sheet shows every prop at EVERY size the board uses it (the extremes too:
  the 1400 px laptop, the 460 px tag's back, the 190 px tags) at 0.25 scale, and the kit lane fixes what does not
  read before any lane starts; (2) the last panel's lane owns the seam and checks a strip of the last 0.3 s plus
  frames 0-6; (3) a hero % / dark % meter per panel on the lane sheets (the S8 dark budget was a measured number
  nobody had); (4) lanes commit only and the assembler pushes once (every lane push was rejected as non-fast-forward).
- **Re-staging one panel after the assembly** (v3 S9 + S9b -> one S5 pull-back): keep the panel's outer contract fixed
  (its start and end, the cut words, the sound-cue times), so only one scenes.json row, its scene file and new kit
  pieces change; a docs lane updates the board, camera plan and storyboard in parallel, and one finisher re-renders the
  film, gate-checks it and rebuilds the whole-film sheet with new sample times (the move's start, reveal and hold).
- **Cold-read the new panel at phone size before the full render:** the builder's own checks passed, but a sound-off
  reader still took S9's streams for birds or drones (dark trail ticks), the lit street for "a dotted path" (posts lost
  against the house fronts) and the pile for hay (pale stick backs); fixing those in the kit first cost one render, not two.

## 8b. v3 G5b lessons (the dense rollout: 8 lanes, 3 helper sessions, a chunked full-res render, 2026-10-27)

**Process lessons only:** the owner judged this cut "too busy, too incoherent ... too rough" (2026-10-27), so its
density bar, its per-panel plan and its sets are not a model (the look: `docs/look/DIRECTION.md`; the bar: the film's
own G3 density key, `LIFE_AND_DENSITY.md`); its per-panel lanes are replaced by sequence lanes (§3).

- **What made the rollout consistent:** a RENDERED bar (the approved pilot MP4 and its source files named in every
  brief), one per-panel plan (`docs/v3/density_plan_g5b.md`) with an override doc that wins (`cozy_v2_application.md`),
  life added only through the kit (Pip3, WinterPerson, weather, room dressing, `floatCam`; shared props only as new kit
  files or additive optional props), the G5 shared-set files (`O1_set`, `S10_set`), one meter for all (`density.py
  --cozy`). Tag, sky, snow, You and the matched frames held across all 13 cuts on the first full assembly.
- **What it missed: PLACES, not things.** Each lane dressed its own panel and was right alone, but the desk the film
  returns to seven times got two back walls (the plan's "S7: no window"), S16 (a cut-in on S15's tag) became another
  room with the props on the other side, S12 (S7's angle) re-hung S7's wall and showed another screen, and Pip jumped
  across the S7 -> S8 cut-in. Fix pattern: ONE set file per recurring place mapped into each shot by one matrix
  (`scenes/desk_window.tsx`: O1's own window + outside, `deskWindowMat(k, x, deskY)`: S16 1.275x on S15's axis, S7 /
  S12 0.85x, S8 a strip under the band), and positions across a cut-in mapped back through its scale (S8's Pip -> S7).
  Also read at panel size: a shared expression ('worried' read cross: override per panel), a mascot on a vehicle
  against the people at its depth (Pip 0.94 -> 0.48 on the van), a building's state in every shot (gone dark = dark).
- **A dense last panel's loop seam:** big flat fills (desk slab, window view, notebook cover) shrink as bare rects after
  their lines retract. Let them leave with their lines under ONE falling erase edge (`EraseDown`), let the subject
  travel onto frame 0's own copy (S16's tag turns back and lands on O1's frame-0 tag), and hold the caption roll until
  the lines take over (`transitionOut.captionAt`, set in `Film3.tsx`: 41.00 s).
- **The split across helper sessions** (owner: "split it yes"; briefs `docs/v3/g5b_split/brief_{A,B,C}.md`, reports
  `docs/v3/g5b_reports/fix_*.md`; the orchestrator ran S9 + the assembly): parallel fix rounds with no conflicts
  (each commits only its own paths), but nobody owned what crosses a session border (S12 vs S16's screen, the S15 ->
  S16 cut-in, the S16 -> O1 seam that only the full Film3 shows). Next time: neighbours' panels as read-only references
  in each brief, and a named owner for every cut on its border (now the rule: sequence lanes and one transition agent,
  §3).
- **The chunked render** (~1 h for the film at 1080x1920): bundle ONCE, one chunk per panel (`--frames=a-b
  --concurrency=3 --timeout=120000`, to a .tmp file moved on success), stream-copy join with each chunk's exact
  duration n/60, audio from ONE direct audio-only render (a chunk starting inside a sound cue ticks), every seam frame
  checked against a direct still. v3: 14 chunks 63.5 min + 26 min audio; this fixer round re-rendered only the 9
  touched chunks (34.5 min) and reused the audio. Trap: Film cuts at ceil(start * 60), chunks cut at round() start one
  frame early, so a fix to a panel re-renders the next chunk too (fixed: `scripts/film_chunks.py` builds the list with
  ceil, §2b). Faster since (the v3 rework): `scripts/render-media.mjs` (one bundle, renderMedia, `--frames=a-b` per
  chunk, `--codec=wav` for the audio) with Chrome's default GL renders a full-size Film3 frame in ~0.12-0.27 s against
  the CLI's ~2.9 s (remotion.config.ts: 'swangle'); the two differ only in anti-aliasing (4-9 % of the pixels by a few
  levels, invisible at 1:1), so render every chunk and its seam stills with ONE GL (`GL=swangle` matches the CLI).
- **Meter floating holds at full res:** S7 / S8 / S12 read 5.3 / 7.8 / 15.5 ev/s in the lanes but 1.8 / 3.6 / 3.1 in
  the film. A `--scale=0.5` render rasterises the float camera's sub-pixel drift as 1-3 % of a static wall flipping
  every frame (0-0.8 % at full res), and the density pass counts it as motion (static 0 %; `--cozy` removes the shift,
  the density pass does not). The full-res number is the honest one.
- **Set up first next time:** (1) a location sheet before the lanes fan out (per recurring place: which wall each shot
  faces, which props on which side, the shared set file + matrix per shot); (2) each cut-in pair owned by one lane and
  checked with the outer frame mapped onto the inner; (3) the chunk list (with ceil) and the render / join / seam /
  audio scripts ready before the last fix lands; (4) one meter recipe (full res) for lanes and assembler; (5) the seam
  strip (last 0.3 s + frames 0-6) on the last panel's lane sheet.

## 9. Lessons from v2 (the assembler's round, 2026-10-27)

Five panel lanes, a kit lane and an engine lane, each with an art-director review and a fix round; the assembler folded
~20 kit workarounds back in one session. (v2r was an owner-ordered restart with full creative freedom and no sketch;
its art-director reviews are not the default: `PIPELINE_V2.md` anti-waste rule 1.)

- **Fold back by pixel diff, never by eye:** render `FilmNBare` stills of every panel (3 per panel + the seam) BEFORE
  the first edit, then after each fold re-render only the touched panels and diff (`changed %` + bbox per frame,
  ~2 s a round at 0.5 scale). A fold is right when the diff is zero or only the intended change. It made 20 folds safe
  (moved code, not rewritten) and caught what a sheet hides: P3's local passer redrew the frosted band in the OLD
  colour, so the band flickered for the 2 s he crossed; inside the kit room he sits behind the glass as he should.
- **A lane that is the ONLY user of a kit set forks it whole** (v2: P3's room + table, P5's desk, P6's angle, the cold
  set's pad + lamp, O1's cat, run-on and box): every fix the art director asks for then lands in a private copy. Next
  time let a panel lane edit the kit pieces only its panels use (named in its brief), or keep the kit lane open to take
  the art director's fixes; the shared pieces (her, the cat model, the palette, lettering) stay kit-lane only.
- **Holds: check the camera against the board before lanes fan out.** Every v2 lane added a 1.5 % zoom "breathe" to
  its HOLD by habit (v3 did it); the owner's cozy v2 rule is "never a zoom in a hold" (`look/COZY_AND_SCALE.md` 3b.5:
  locked, or a slow 2D float), and a move the board did not play fails the G5 entry check. Put "camera = the board's,
  holds locked" in every lane brief.
- **The burned-in label is short:** "G5 blocking · <panel> · <time>" (ends at x ~520). A longer label (with "next:
  ...") ran over the run-on's years at the bottom of O1 / P12. What the next stages add goes in the message that sends
  the cut.
- **The loop seam, a zoomed window set:** in an un-build the far plane (the town) shrinks early, so whatever sits
  behind it (the window's trim and recess fills) shows as a solid block for a few frames; let those fills leave with
  the far plane (the same shrink about the glass centre). Check the seam strip for any solid block of one colour.
- **The finisher's round (bare cold read -> small kit fixes, one render):** the kit sheet at every size and the kit
  critic paid off: one model each (her, the cat, the contract, the nook, the town) plus the palette module, and the cold
  reader saw the same her / cat / nook / town in every panel; cobalt and the pop never drifted. The per-lane aliveness
  critics made every panel full (the meter passed all but P11's detail), but they judged frames; the BARE cold read at
  phone size found the rest, each a kit-sized fix: life crossing lettering (a white mote on the clause's "e" read
  "Googlz": `DustMotes avoid`), a cropped figure losing its shape (P5's back cut by the edge read "a blue blob": in
  frame + a lost profile), speech lines read as an empty form (scribbles that keep rewriting), people with no "who"
  (GOOGLE STAFF on the tent). Life the eye cannot see is not life (a paper-white moth on the lit wall: P2 / P6 had
  0-mover stretches; read per-frame movers, not the mean). Play the shot before acting on a still-sheet artefact (pop
  pages as fragments, a rise as duplicates). Next time: the bare cold read on the FIRST assembly, routed to the lanes.
