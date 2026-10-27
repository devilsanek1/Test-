# v2 restart: toolkit inventory (what the house code gives a FINISHED film, and how v1 was built)

2026-10-27, v2 restart (voice take 2 `public/v2/voice.wav`, 39.08 s). Read with `house_digest.md`, `beat_map.md`, `teardown.md`.

**Contact sheet (phone size, 389 px per frame):** `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/v2r/toolkit/toolkit_sheet.jpg` (scratch, not
in git): the 9 v1 shared sets, the Pip pose sheet, KitDemo (eye-level crowd), the 4 cine generators (EndlessCity vista,
PerspectiveStreet, Monument, WallOfWindows) and 3 frames of the posted v1. Rebuild: section 5, last block.

**TOOL / ASSET / DROPPED.** The owner's restart rules (playbook, 2026-10-27): "Don't rely on reusable assets" (sets,
characters, props, background life and music made NEW per film, a new Pip drawing too; engine, timing, captions and QA
are tools) and "people small and simple, like reference 1". Every item below is tagged:
- **TOOL**: engine code, procedural and palette-driven; use it directly (restyled by the film's palette module).
- **ASSET**: a designed v1 / v3 thing; study it (its structure, density, motion logic), then build our own. Never ship it.
- **DROPPED**: the rejected first v2 production. Never import, copy or look to it for ideas: `src/v2/**`,
  `src/entry-v2*.tsx`, `public/v2/animatic.json`, `public/v2/v2_*.wav`, `scripts/v2/*`, `docs/v2/archive/**`,
  and the `scripts/qa/colour_meter.py` defaults (its default hero / pop are the dropped look: always pass `--hero --pop`).

## 1. How a film is wired

**v1 (the posted film, 55.37 s, 30 fps).** `src/entry-film.ts` -> `FilmRoot` registers `Main` (+ one composition per
scene id). `Main` = `<Film scenes components wipers captions/>` (`src/lib/Film.tsx`, 900 lines: the sequencer).
- `src/data/scenes.json`: `{id, start, end, transitionIn, transitionOut?, captionTone, note}` in voice seconds. v1: 12
  scenes (2.1-10.4 s); 5 `cut`, 5 `matchcut` (both scenes put the shared object at the same screen spot, each with its
  own camera keys), 2 `foreground-wipe` with `element: 'scene'` (the outgoing scene's exported `Wiper`: a printed sheet,
  a tram); the loop = the last scene's `transitionOut {type: 'cut', loop: true, captionAt}` (S12 rewinds to frame 0).
- `src/scenes/index.ts` registers `SceneNN.tsx` (default export = a React.FC with no props; optional `Wiper`). Each
  scene has a folder (`scenes/scene01/`: `camera.ts`, `timing.ts`, `cast.tsx`, `plaza.tsx`, `shims.tsx`...).
- Scene contract (`ENGINE.md` §1-§3, the template at §3): `useTime()` = scene-local seconds, deterministic `rng`,
  no opacity fades (pop / grow / wipe / draw on), flat fills, ink by depth 4.8 / 3.4 / 2.2 / 1.6, `<World sky push>`
  as root (sky keys with `tod` relight every Fill as the wipe edge passes), every camera move a scene key.
- Captions: `src/data/captions.json` (`CaptionBeat` pages `{s, e, lines: [{text, s}], highlights: [{text, s}]}`,
  word-start times). v1 used `scroll`; the owner wants `pop` (playbook).
- Sound: ONE premixed `public/mix.wav` (voice + bed + 162 cues, `audio/mix.py`), played by Film. Edges: `FilmEdges`
  (`paint-subtle`, `src/lib/edges/config.tsx`) wraps the scene stack, captions above; on for the full film, off for
  single-scene comps; since the posted reel no paper at the top or beside the caption band (`edges/paint.ts`).
  Per-scene `EDGE_HINTS` (`edges/hints.ts`) are keyed by scene id: new ids get none.

**A new 60 fps film (the shell to copy: `src/entry-v3-film.tsx` + `src/v3/film/Film3.tsx`, 60 + 70 lines).** The
entry imports the film's palette module FIRST (it rewrites `palette`, `skies`, `todSky`, `todSteps`, `captionTones`...
in place: `src/v3/film/palette.ts` is the pattern), then registers `FilmN` (ceil(39.08 x 60) = 2345 frames), `FilmNShot`
(props `{id}`) and `FilmN-<ID>` at fps 60. `FilmN` passes the optional Film props: `audioSrc` (the voice, or the final
mix), `sfx` `[{src, t, gain}]` (browser-played cues; fine for drafts), `captionMotion: 'pop'`, `frame0` (`{lines,
highlight, until}`: the core line in words on frame 0, spoken captions lowered under it), `draftLabel` (drafts only),
`edges` (false for drafts; final on). `scripts/g5_scaffold.py` needs a G3 `animatic.json`: with no board, write
`scenes.json` and `scenes/index.ts` by hand (Film3's are the format). Captions:
`python3 -I scripts/film_captions.py --words public/v2/voice_words.json --pages <film>/captions_pages.txt --out <film>/captions.json`
(hand-paged, `[brackets]` = highlight; fails on any word mismatch). Loop: `{type: 'unbuild', loop: true, dur: 0.3}`
un-builds into the first scene's t < 0 bare-line state (the owner's opening: bare ink, colour floods in ~0.3 s); the
v3 lesson: the last scene drops its sky slab while it un-builds (`useExit() > 0` -> `sky="transparent"`).

## 2. Sets and props

**TOOL generators (palette-driven; `src/lib/cine`, CINE.md; seen on the sheet).** Dense out of the box.

| piece | what it shows | density / life out of the box | serves v2 for |
|---|---|---|---|
| `EndlessCity` / `Skyline` | hand-drawn city rows to the horizon, setbacks, water towers, `landmarks` (`kind: 'colossal'` tower), `light="back"`, roof top faces when looking down | very dense; `lampsOn`, `windows` events (lit windows switch), fill-first build | the scale wide, a city at night, "Google's campus somewhere in a big city" |
| `Monument` | worm's-eye civic building (columns, steps, banners, door people), backlit | dense, people on the steps, `banners`, `doorAt`, `sideLitAt` | a government building (the Pentagon side), seen huge |
| `WallOfWindows` + `WindowCloseup` | a facade of hundreds of windows; a pull-back from one room (LOD melts room -> pane) | dense; per-cell switch events; rooms with person / desk / lamp | an office tower at night, one lit desk among hundreds |
| `PerspectiveStreet` / `GroundPlane` | one-point street, roofs, doors, fence, string lights, crowd | dense, `crowd`, `lightsOn` | a street outside her home or the campus |
| `Tower`, `Ledge`, `Balustrade`, `Plinth`, `Pole`, `Wires`, `StringLights` | towers, rooftop ledges with clutter, railings, wires, bulbs | `Ledge detail` (vents, hatch, aerial) never a dead slab | rooftop vantage points, foreground framing |
| `Sky`, `SkyCloud`, `Streaks`, `Stars`, `HazeBand`, `Hills`, `Birds`, `BigSun`, `LightShaft`, `Glow` | flat sky pieces, a V-flock crossing, stepped glows | birds flap, clouds drift, stars twinkle | ambient sky life, night |

**TOOL kit (`src/lib/kit`, ENGINE.md §10; procedural, v1-styled, recolour with the palette).** `Building` (`lightAt`
/ `lit`: windows on one by one), `Wall`, `Ground`, `Window` / `WindowGrid`, `Door`, `Tree` (sways), `Bike`, `Bird`,
`BirdsOnWire` (`flyAt`), `LampPost` (`lightAt` flicker on), `UtilityPole`, `Festoon`, `Palm`, `Fronds`, `WaterTower`,
`Car` (back view, `lightsOn`), `Noticeboard`, `Paper`, `Stamp`, `BrowserWindow` (CRT switch-off), `Padlock`, `Icons`
(`Server`, `Laptop`, `Cloud`, `Shield`, `Bug`). Placement: `Plane` + `wallQuad` / `groundQuad` (one-point perspective
for whole kit components), `eyeLevel()` (the lens at 1.1 x a person's height). Hero-type props (laptop, server, paper)
are borderline: fine as structure, but give the film's hero objects their own design.

**ASSET: v1 shared sets (`src/scenes/shared/sets/**`, SHARED_SETS.md; top two rows of the sheet).** All PHP-story
locations (website buildings with browser chrome, locks, elephant plaques), golden day, mint/clay palette. Each
renders 115-150 ms/frame and ships 2-3 walkers, 1-2 furniture props, an in-band edge figure, ground marks, multiplane
`wrap` layers, `outAt` un-build, `<Tod>` relight. Study for: GovernmentPlaza (a colossal 4-building civic wall cut by
both edges, PEAK layout; nearest to "government building"), DomeCity (a whole city under a dome, watchtower +
searchlight: "surveillance / military" grammar), StoopStreet (a home street with tower / night / dawn states:
"a person's home"), TerraceHill (a sea of doors to the horizon: "everyone"), NoticeboardCorner (readers with raised
phones round a board: "the news reaches people"), OldQuarter, MakersLane, BlueprintStreet / BlueprintWall (a document
as a world: "the contract as architecture"). Reusable PATTERNS (copy the idea, not the art): `life.tsx` (`People`:
walkers on anchors walking to the VP, `walkerAt`; `Furniture`; `EdgeFigure`), `ground.tsx` (`groundMarks`: broken
paving lines + specks, never a tile grid; `Foreground` presets in the visible band), `rows.tsx` (`perspRowLayout`:
receding rows batched in screen space, LOD tiers).

**ASSET: v1 shared props (`src/scenes/shared/props/**`, SHARED_PROPS.md).** Lock, Bit (ink beetle), BrowserChrome +
LoadingRing, ElephantPlaque / Stamp, RollerShutter + padlock + BackSoonTag, SunMorphs (PowerGlyph, SunPie, SunPress),
RailBoard, LeakSheet, Envelope, MailSlot, Calendar, Bollard, Tram, MakersCart, LabelTag (labels in the world), FixSign,
CounterBoard (tallies), StickyNote, CheckBoxTag; figure presets `Citizen` (40-55 px, legs), `EdgeOnlooker` (cropped
near figure, raises a phone), `Investigator`, `Messenger`, `Keeper`, `Caretaker`, `Attempter` (hooded), `Ghost`,
`AttemptStipple` (hundreds of specks in one path). Patterns worth keeping: labels as scene-owned world objects in
y 600-1480, never in captions; one batched path for hundreds of far things; LOD by on-screen size.

**ASSET: v3 kit (`src/v3/film/kit/**`, its README; Autumn Ember, blue hour, snow).** The richest life kit in the repo:
`Wire3` (birds sit, bob, lift off and wheel away; `rise` / `fly`), `SnowLayers`, `Smoke` / `Steam` / `PuffTrain`
(shrink to nothing, `ceil` under the band), `WindowLife` / `WindowSilhouette` (neighbours in windows on one switching
schedule), `NearFronts`, `SkyClouds`, `BirdV`, `TinyWalkers` (15-60 px fill-only walkers, dogs, pairs), `Walker`,
`BackRow`, `Car3` / `PassingCar` / `HeadlightSweep`, `LampPost3`, `StringLights3` (twinkle), `ShelfFill`, `Plant`,
`Pinboard`, `TownRow` (5 house types), `Forklift`, `GateBooth`, `DataCenter`, `Laptop`, `Phone`. **Do not import
it:** every file except `idle.ts` and `Pullback.tsx` imports `EMBER` from `../palette`, and that module rewrites the
house tokens at load, so one import repaints the whole film Autumn Ember. Port the motion logic into our own kit.
**TOOL (palette-free, import directly):** `src/v3/film/kit/idle.ts` (`sway`, `bob`, `ring` damped jolts, `hopY`,
`stepped`, `twinkle`, `windowLit` (one window switches every 0.6-1.5 s), `loopPos`, `crossing`, `shuttle`, `puffs`,
`sweep`, `floatCam`: the cozy float for holds) and `Pullback.tsx` (`planeMat`, `s5Ease`, `PullLayer`: the owner's
favourite pull-back crane rig, one progress for every plane).

## 3. People, mascot, ambient life, camera, transitions

**People (TOOL; matches "small and simple, like reference 1").** `Person` (`lib/kit`): always seen from behind (ears,
neck, back of the head), `hair` 7 styles, `acc` backpack / phone / scarf / sign / hood..., `walk={steps/s}`, LOD that
never pops; keep heroes small (hero detail starts at s 1.2: sleeves, rim strip; avoid for this film). `Crowd`: rows
from far to near on the eye-level camera (`eye={{horizon}}`, feet lines), `jitter` for an organic queue, far rows
fill-only blobs, `build="rise"`. `TinyCrowd` (cine): thousands of specks, `walk`. Place with `eyeLevel()`: every head
just under the horizon (the viewer feels small); check `measureEye` 1.0-1.2. ~5-8 ms per walker.

**Mascot Pip (`src/lib/mascot`, mascot.md; sheet tile 10).** TOOL = the rig: `<Elephant x y scale pose t seed flip look
expression amount idle draw exit squash rotate prop colorway/>`; `ElephantTimeline keys` (pose switches pop with
squash), `hop()`, `popIn`, `drawIn`, `unbuild`, `walkSpeed`; idle life built in (blinks, ears, tail, trunk, breath);
ink constant on screen, fills misregistered 3 / 2 px, never opacity. 10 poses: `sit-back` (default watcher),
`sit-front` (trunk dangle), `stand-side`, `walk-side`, `peek` (behind an edge), `trunk-up` (alarm), `hold` (a prop),
`ears-cover` (worried), `shrug`, `sleep`. Scale 0.9-1.0 in wides (~90 px), 1.8-2 in close-ups. ASSET = the periwinkle
drawing: the playbook asks for a new Pip drawing per film; v3's `Pip3.tsx` shows the lightest route (its own
`Colorway` + `lineWeight` + look keys + hops on the same rig); a new silhouette means new geometry in `poses.ts`.

**Ambient life as TOOLS:** cine `Birds` (V flock), `SkyCloud` drift, `Stars`, `StringLights` / `Festoon`, kit `Tree`
sway, `BirdsOnWire` `flyAt`, `LampPost` / `Building` `lightAt`, `WallOfWindows` / `LitWindows` switch events, `Car`
lights, `Person` walk / `Crowd` bob, the `Sun` (drift 10 px/s, `beats`, `rise`, `hops`), `idle.ts`. Steam, smoke,
weather, window neighbours, headlight sweeps and birds lifting off exist only as v3 ASSETS: port them (section 6).

**Camera (TOOL).** `<World push={{to, at, dur, anchor}}>` (the gentle per-shot zoom); `<ShotCam keys | push>` with
`<Layer depth>` inside `<World stage="context">` = the cine `CineCamera` (multiplane parallax: depth 1 sky, 0 the
reference plane, < 0 foreground): keys `{t, x, y, pan, tilt, push, zoom, rot, anchor, anchorDepth, ease, inkComp}`,
`interp="spline"` (no stop at a key), `handheld`. Eases: `MOTION.camera.{ease, slow, reveal, settle}`; carry speed
through a cut (last key 1-2 s past the shot end, first key before its start). `inkComp: 0.6` on big zooms (a 3x dive
lands at ~1.55x line weight). `camSpeed()` / `camSpeedAt()` in code. Speed: <= 18 px/frame at 30 fps, ~7.5 px/frame
(450 px/s) at 60 for long flat-ink moves (a foreground mass crossing the lens may go faster). Perspective: `Plane`,
`wallQuad`, `groundQuad`, `frontQuad`, `rayPoint`; cine `persp1` / `quadMap` for point math. Time of day: `World sky`
keys `{t, tod, wipe, dur}` (`day / golden / dusk / night / dawn`), `<Tod role>`, `<TodAnchor>`; stepped sky tween =
consecutive `snap` keys.

**Transitions (TOOL; `ENGINE.md` §5).** `cut`; `matchcut` (shared object on the same screen spot, each scene its own
camera); `foreground-wipe` (`element`: built-in `figure` / `pole` / `foliage`, cine `column` / `passer`, or `'scene'`
= the outgoing scene's own `Wiper` with static `captionRegions` + `half`; captions split at the edge, tone per side);
`push-through` (zoom into a point that fills the frame, `bridge` colour, pull back out; v1-era, still works);
`camera-continuous`; `unbuild` (the scene un-builds on top of the next: lines loosen, fills shrink, ink retracts, the
sky slab collapses last). Loop: `unbuild` loop (bare-line frame 0) or `cut` loop (full-colour seam), captions roll
back to page 1 at `captionAt`. Render states: `<Look fills="paper">` (line art), `<Look cascade={{at, origin, speed}}>`
(colour floods from a point: the opening), `<UnBuild>`, `ExitShrink` (characters), `useExit()`.

## 4. Music and sound

- **SFX kit (`audio/sfx/*.wav`, 42 files, 48 kHz 24-bit, peak -6 dBFS; all synthesised or CC0).** Generic:
  `pop_low/mid/high`, `bubble_pop`, `click_light`, `switch_toggle`, `paper_flip`, `pencil_scratch_short/medium/long`,
  `whoosh_soft`, `fg_wipe` (foreground wipes), `typing_tick/burst`, `counter_ticker`, `lock_click`, `door_knock`,
  `handle_rattle`, `coin_chink`, `ding`, `alert_ping`, `power_off_thunk`, `crowd_murmur`, `light_shimmer`, `low_swell`,
  `sub_impact`, `riser_leak`, loops `air_bed` / `city_bed` (16 s, circular). Phone family (owner: a positive phone
  sound in the first second): `phone_like_pop`, `phone_notify_ding`, `phone_sent_swoosh`, `phone_cart_add`
  (`audio/tools/make_phone_sfx.py`). v3-only: `v3_*` (crane clunks, stamp, thoom, LED tick). The playbook wants
  sound made new per film too: the existing files are fine as drafts and as a palette to riff on.
- **Making new SFX:** `audio/tools/make_sfx.py` exposes the synthesis helpers (`pop`, `bubble`, `modal` resonators,
  `swish`, `metal_click`, `noise`, `lp` / `hp`, `adsr`, `place`, `stereo`, `finalize`); copy the 40-line pattern of
  `make_phone_sfx.py` / `make_v3_opening_sfx.py` into a new `audio/tools/make_v2r_sfx.py` (`finalize()` writes the wav).
- **Music beds:** `cinematic` (felt-piano pulse + motif, low strings, air; v1's), `marimba`, `near_silent` (room tone
  + 5 events). All three are composed on v1's 55-70 s story grid: ASSETS, not reusable for 39.08 s. Make a new bed with
  the same machinery: `audio/tools/bedkit.py` (`Grid`, chords, automation, `voice_carve`, `loop_wrap`,
  `circular_process`), `sampler.py` (`Track`, `render_sf2`), `instruments.py`; two stages (compose a MIDI on a grid of
  the film's beats, render from any MIDI). Samples (VSCO-2-CE, VCSL: CC0; GeneralUser GS) are already downloaded at
  `/tmp/claude-0/-home-user-Test-/59905704-1101-50eb-baa8-b5e4e9d5d2d2/scratchpad/sound/dl` (`audio/tools/common.py` default `SOUND_SAMPLES`); Python deps are installed.
- **Beat lock and mix:** `python3 scripts/qa/beatsync.py --cuts json:<cuts> --midi <bed.mid> --fit-tempo --write-midi
  <bed_retimed.mid>` (the voice decides the cuts, the music bends +-8 %), `audio/tools/beatlock.py` (half-beat lock).
  Mix: `SOUND_VIDEO_DUR=39.0833 python3 audio/mix.py --vo public/v2/voice.wav --music <bed.wav | none> --cues
  <cues.json> --out audio/v2r_mix.wav` (cue `{t, sfx, gain_db, pan, prio, why, loop, dur, reverse, stepped}`; -14
  LUFS, -1.2 dBTP limiter, side-chain duck, SFX >= 8 dB under the voice, circular tails for a clean loop seam). QC:
  `python3 audio/tools/qc.py <mix.wav> --loop --vo public/v2/voice.wav`. Then `audioSrc` = the mix, `sfx` dropped.

## 5. QA tools and exact commands (from `video/`; E=--entry=src/entry-v2r-film.tsx, or whatever the entry is named)

```bash
npx tsc --noEmit                                                        # clean before any render
node scripts/render-frames.mjs FilmN-S3 /tmp/s3 0.2,1.0,1.8 $E --scale=0.5          # stills (frame = round(t*60))
scripts/sheet.sh FilmN-S3 0 2 8 /tmp/s3.png $E --scale=0.35             # contact sheet + caption mask check (3:1)
python3 -I scripts/qa/gate_check.py --mp4 out/v2r.mp4 --scenes <film>/scenes.json --captions <film>/captions.json \
  --voice public/v2/voice.wav --entry src/entry-v2r-film.tsx --comp FilmN --frame0 "<line 1>|<line 2>" --frame0-until <s>
python3 -I scripts/qa/density.py out/v2r.mp4 --scenes <film>/scenes.json --cozy   # full + alive (warning signal)
python3 scripts/qa/deadframes.py out/v2r.mp4 --fps 60 --scenes <film>/scenes.json --out out/qa/v2r   # life 0-10 / scene
python3 scripts/qa/framecheck.py out/v2r.mp4 --fps 60 --scenes <film>/scenes.json --out out/qa/v2r  # blanks, flashes
python3 scripts/camspeed.py --frames <dir of every frame> --fps 60 --limit 7.5   # camera speed + velocity steps
python3 -I scripts/qa/colour_meter.py f*.png --hero '#....' --pop '#....' --band 290,600   # colour jobs per still
python3 scripts/qa/beatsync.py --cuts json:<cuts.json> --midi <bed.mid>  # cuts vs beats
# the toolkit sheet above:
node src/scenes/shared/sets/preview/render.mjs SetsPreview <dir> 6 --props='{"set":"plaza"}' --scale=0.36  # any set id
node scripts/render-frames.mjs MascotSheet <dir> 0.34                  # also KitDemo 4.4, CineDemo 2.6,7.5,12.5,19.0
```
`scripts/qa/run_all.sh` knows only `Main`, v1 scene ids and dev comps (call the tools on the MP4 as above);
`scripts/strip.sh` samples 30 fps from `src/index.ts` (for 60 fps motion list every frame time in `render-frames.mjs`).
Gates (QA.md §5): life >= 8/10 per scene, no dead run > 0.40 s, no framecheck ERROR; density ev/s >= 5, gap <= 1.0 s.

## 6. Gaps: what a fresh v2 film must build new

1. **A palette module** (`<film>/palette.ts`, the v3 pattern, first import, a `problems()` check): a house sister palette
   (`docs/look/PALETTE.md`, `palettes.json`: 9) or a new one; one hero, one dark anchor, at most one pop; caption tones.
2. **Every set** (none of the v1 / v3 sets fit, and the rule forbids them): e.g. a tech campus / AI lab (no logo or
   brand copy), her home or desk (enclosure, cozy), a government building for the Pentagon side (a cine `Monument` or a
   five-sided plan via `groundQuad` can carry it), a newsroom or the news reaching people, a city at night. The cine
   generators and the kit give the bulk (rows, windows, streets, crowds); the identity pieces are new.
3. **Hero props:** the contract (a paper with a readable clause, a signature, "for life"), the deal document ("any
   lawful government purpose"), Google's statement ("AI principles", "of any kind"), quotes as objects in the world.
   Text in the world: no house TOOL exists (`LabelTag` is a v1 asset, v3's `Txt` is Ember-bound); write a small
   component on `lib/font` (`captionFontStack`, `measureCaption`, `useCaptionFont`), labels in y 600-1480.
4. **The life layer, ported:** birds on wires lifting off, smoke / steam puffs, rain or weather, window neighbours on a
   switching schedule, passing cars with headlight sweeps, tiny walkers (from v3 `Weather` / `Street` / `People3`
   logic + `idle.ts`), recoloured and redrawn in the new design.
5. **Pip, new drawing:** a colourway (`Colorway` in `lib/mascot/colors.ts` style, ΔE >= 20 from every ground, never
   the hero or pop) and, if the design changes shape, pose geometry; a size check at phone scale.
6. **Music bed** for 39.08 s on the film's own cut grid, and new SFX (section 4); the cue sheet from the final picture.
7. **The film shell** (entry, FilmN, scenes.json, scenes/index.ts, captions_pages.txt -> captions.json, frame0 text)
   by hand (no board for `g5_scaffold.py`); new scene ids that do not collide with v1's `S01..S12` (edge hints).
8. **Edges at the final:** `paint-subtle` via Film `edges` (no top paper) with optional per-scene `EDGE_HINTS`.

## 7. Render times (measured 2026-10-27 on this 4-CPU box, concurrency 2, load 0.3-8 from other agents)

| what | GL | wall time | per frame |
|---|---|---|---|
| v3 O1 (dense opening, 60 fps), 120 frames = 2 s, 1080x1920 MP4, `npx remotion render` | `swangle` (remotion.config.ts default) | 130.6 s (load ~8) | ~1.0 s |
| the same 60 frames | `swangle` | 60.3 s (load ~2.4) | ~1.0 s |
| the same 60 frames | `--gl=angle` / `--gl=swiftshader` | 11.2 / 11.6 s | ~0.13 s |
| v3 O1, 120 frames full res | `--gl=angle` | **17.5 s** | ~0.11 s (incl. ~3 s bundle) |
| v3 S9 (the densest pull-back), 120 frames full res | `--gl=angle` | 18.6 s | ~0.12 s |
| v3 O1, 120 frames at `--scale=0.5` (drafts) | `--gl=angle` | 11.1 s | ~0.07 s |
| v1 Main 0-2 s (plaza + paint edges, 30 fps), 60 frames | `swangle` | 215.8 s (load ~4.4) | ~3.6 s |
| v1 Main 0-2 s, 60 frames, edges on / `--props='{"edges":"clean"}'` | `--gl=angle` | 14.1 / 12.5 s | ~0.17 / 0.14 s |
| stills via `render-frames.mjs` (no GL flag = Remotion default) | default | Film3 8 frames 1.6 s, Main 8 frames 2.2 s | 0.2-0.28 s incl. setup |
| first bundle of an entry / cached | - | 13-21 s / 2-4 s | - |

**`--gl=angle` is ~5-8x faster than the config's `swangle` and renders the same picture**: one Film3 frame differs
only in anti-aliasing (mean 0.7 / 255, 0.34 % of pixels over 15 %, visually identical in a 400 px crop). Plan for the
full film (2345 frames at 60 fps, 1080x1920, concurrency 2): **~5-8 min with `--gl=angle`** (edges add ~10-15 %;
a busy box 1.5-2x), ~40 min with `swangle`, ~2 h+ with `swangle` + edges at load. A 0.5x draft of the film: ~2-4 min.

Final: `npx remotion render <entry> FilmN out/v2r_final.mp4 --gl=angle --concurrency=2 --crf 14`, then the TV-range
ffmpeg pass of HANDOFF §5 (Remotion still writes full-range `yuvj420p`: measured again on these clips).
