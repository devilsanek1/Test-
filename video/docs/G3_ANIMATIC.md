# G3 animatic: the animated sketchbook (spec + how-to, 2026-10-26)

Owner (2026-10-26): G3 is "the most important stage ... pretty much close to final version of the story, transitions,
animations, camera movements ... details ... as placeholders ... like an animated sketchbook ... the closest signal to
the final story in as little time as possible." Reference page: `docs/look/ref_animated_sketchbook.png`.
This file is the stage spec. The DRAWING spec stays `docs/look/STORYBOARD_STYLE.md` (palette, line weights, panel
rules); where this file widens §2/§4/§5 of that spec, this file wins (edit list: `docs/look/research/g3_spec_edits.md`).
Why for every rule: the six research files in `docs/look/research/animatic_{reels,layout,rough,mograph,sketchlook,audit}.md`.

## 1. The principle: the film's rough pass

G3 **IS** the final film minus polish: every decision that is expensive to change later is MADE here and VISIBLE in the
MP4 — story, cuts, framing, camera moves, transitions, key actions, where the density and life go, the hook. Pros gate
exactly this way: the story reel locks the cut before layout (`animatic_reels.md` §1), rough layout locks the camera
with placeholder art (`animatic_layout.md` §1/§3), a pose test locks the motion before cleanup (`animatic_rough.md` §1).
Cleanup preserves, it never creates: what the owner cannot see at G3 does not exist for them to approve, and it ships
anyway — v3's "way too empty ... smoothness is not there" at G5 was density and motion that G3 structurally hid
(`animatic_audit.md` §3-4).

G3 **IS NOT**: colour, final line, texture, easing micro-tuning, overshoot/settle/secondary motion, faces beyond the
acting beat, real detail anywhere (windows, signage, crowds are marks, never drawings). Loose in precision, dense in
suggestion: the backbone (big shapes, framing, timing, counts) is exact; the skin is scribble (`animatic_sketchlook.md` §0).

## 2. The signal contract

What the owner's G3 approval covers. After the lock, G4+ may only ADD (colour, real detail where a placeholder stands,
final line, easing polish, secondary motion) — never change a locked column. A change to a locked signal reopens G3
explicitly, as a JSON edit, never silently inside a build (`animatic_mograph.md`).

| Signal | G3 fidelity | "Near-final" concretely means | Checked by |
|---|---|---|---|
| Story, shot order, cuts | near-final (FROZEN) | one idea/panel, cuts on the locked words, in the VO's breaths | sound-off cold read; full-reel watch |
| Shot framing + staging | near-final (FROZEN) | shot type, subject size/position, 3 planes; both end frames of a move pass the §5 checklist as stills | board_lint boxes; cold read |
| Camera moves | near-final shape+timing | each move with the five values: move word, duration (s), start/end offset or scale, anchor, ease; path shape real; eases in AND out | lint: five values present; speed <= ~450 px/s peak |
| Transitions | near-final (FROZEN) | device named from §4 grammar, its board-time requirement met, PLAYED in the reel | lint per-device checks; pair watch |
| Key actions / animations | near-final shape+timing | every move the film will have exists here: 2-4 stepped key poses on beat words, smears for fast transits; stillness is a claim | motion check at 1x; "no G5 move without a G3 placeholder" |
| Aliveness / density | placeholder (plan FROZEN) | every surface that is dense in the final carries a grey mass at final position/size; `life:` list placed; 2-3 ambient loops per set panel | emptiness lint; density-promise check; owner question |
| Scale + cozy moments | near-final composition | home-base room tone, the one big move, the scale ladder, haze-band/shrinking-rows as grey dress | STORYBOARD_STYLE §7 checks |
| Hook / frame 0 | near-final | frame 0 = lines then tones, payoff in words, voice from frame 1, expectation-then-reality played | first-3s watch; playbook Hook rules |
| Captions / timing | final | locked VO, pop captions, word-anchored cuts; reel at full runtime, 60 fps | gate check; full-reel watch |
| Colour, texture, final line, easing feel, faces | ABSENT | — | deferred to G4/G5/G6 by design; the hand-off says so |

## 3. Placeholder vocabulary: loose never means empty

The v3 failure was reading "loose" as "leave it out" (`animatic_sketchlook.md` §4). Rule: **every surface that will
hold detail or life at G5 carries a placeholder mass at G3.** Plain paper is legal only where the final stays plain,
declared with `negative: true`. Palette stays the 4 tones of STORYBOARD_STYLE §2; scribble-mass tone is the ONE legal
texture (mid/far roles only).

- **Five primitives** (1-2 SVG paths each, each ONE lint element; specs in `animatic_sketchlook.md` §3): `scribble-mass`
  (zigzag hachure of a region, 3 px mid-grey, gap 10-20 px, seeded jitter ±4-8 px — reads as flat tone at thumbnail),
  `crowd-row` (head bumps + leg ticks on a shared baseline), `facade-row` (crooked roofline + dropped verticals every
  60-120 px), `window-ticks` (rows of paired short dashes — "mark windows, don't draw them"), `foliage-blob` (one canopy
  contour + interior scribble).
- **Dress layer** (`animatic_audit.md` #2): elements with `role:'dress'` — 3 px light-grey loose masses sketching the
  FULL set (shelf clutter, wall fill, street fill) — exempt from the 25-element cap and subject lint. Required on every
  home-base and wide panel.
- **Detail gradient**: the subject is the only sharp thing — continuous 9 px contour and the only dark mass; adjacent
  surfaces a few real details; everything further ticks and masses. More than one fully detailed region is a smell.
  Windows, signage and crowds are NEVER drawn at G3; if a peripheral element needs real drawing to be read, it is the
  subject of its own panel.
- **The promise**: a placeholder's region and tone ARE the contract — "final art goes here, this dense." Per shot, the
  JSON field `life: [...]` names every G5 life item (crowd, traffic, clutter, steam, window lights); lint requires one
  placeholder element per item. The notes strip (or JSON `promise`) says what each mass becomes: "grey row = 6
  pedestrians, walking."
- **Density key**: per recurring set, ONE still of the set fully dressed in sketch scribble is approved at G3; G5 lanes
  build to it (`animatic_audit.md` #10). Kit props are shown at every board size before lanes start.

## 4. Motion at G3 (supersedes STORYBOARD_STYLE §4 "held drawing by default")

**Every cut, camera move, element animation and transition the final film will have is PLAYED in the animatic**, with
its real path shape and real timing (a reference gives the shape, never the speed — retime to the reel, playbook Motion
rule), at sketch fidelity. "<= 1 move per 3 panels" is retired. A still panel is a CLAIM that the G5 shot is still;
G5 adds no new motion — only colour, line, easing polish, secondary motion (`animatic_rough.md` #2, `animatic_layout.md` #7).

- **Camera**: authored as camera transforms (never baked into element moves — a baked move is a picture of a move).
  Each move ships the anime five: move word, duration, start/end offset or scale %, anchor ("fix on sign"), ease. Every
  move eases in AND out; a subject-follow starts 2-4 frames after the subject; pans/rises are ONE oversized drawing
  (panel drawn 120-140 % of frame) the camera travels across; a push-in > 2x stays a cut-in. Peak on-screen speed
  (camera + own move) <= ~450 px/s. Both end frames pass the panel checklist as stills.
- **Drawn actions are a pose test, not tweens**: 2-4 held key poses per shot, popping on their words (held 0.3-1.5 s),
  stepped — never an eased body slide. A fast transit is ONE smear drawing (silhouette stretched along the path) held
  2-3 frames between the keys. Faces and hands drop in motion poses; an emotion face appears only on the held acting
  beat; mitten hands always. Volume lint: a subject's bbox and ground-contact y stay within 10 % across a shot's poses
  unless the change is the idea.
- **Ambient life**: every set panel carries 2-3 looping micro-moves (`loop: true`: cloud drift, steam, a window light
  switching) — crude, finite shapes that repeat. Zero ambient elements on a set panel is a lint WARN.
- **Line boil** (aliveness, surface only): 3 pre-seeded jitter variants per path on one shared clock, swapped every 5-8
  frames at 60 fps (8-12 Hz, ping-pong), amplitude ~0.3x stroke width capped at 3 px; subject contour at half amplitude,
  dress masses at full. NEVER boil captions, numbers, labels, the notes strip, chart lines or red marks; never swap
  per-frame. Framing, cuts, silhouettes, poses stay locked while lines boil; a panel whose read depends on boil fails
  the cold read. Contact sheets sample variant 0.
- **Unanimated, on purpose**: overshoot, settle, secondary action, breathes, true morph tweens, easing feel beyond
  in/out — all G5/G6. Blocking is the kill test: a shot that only reads with polish gets redrawn, never polished.
- **Drawing budget** for a 40 s / ~15-shot reel: ~60-120 distinct drawings (2-4 poses x shots, + smears + boil seeds),
  spent unevenly — 2-3 poses on held dialogue shots, 6-12 drawings on the 1-3 shots whose meaning IS motion.

**Transition grammar.** Every cut names its device in the board JSON; lint knows each device's board-time requirement
(`animatic_mograph.md` §3). Dissolves: 0.2-0.4 s to soften, up to 1-2 s only for time passing.

| Device | Must be decided at G3 (lintable) |
|---|---|
| cut (default) | nothing but the composition change; >= 20 % size or >= 30° angle change unless a declared match |
| cut-on-action | same action split across the cut, same screen direction |
| match-cut | anchor element at same position + scale in both panels; built from the first panel's element list; checked at the boundary frames |
| morph | start shape, end shape, shared centre; planned as a peak-speed cut — the tween (if any) is G5 work |
| push-through (scale-through) | panel A contains a 15-30 %-of-frame sub-frame that IS panel B |
| whip / carry | both shots name the same direction at matched speed |
| wipe (object-wipe) | the wiping element already exists in panel A, with its travel direction |
| dissolve / dip / flash | the relationship named ("time passes"); duration per the rule above |

## 5. Build order and time budget (first full animatic ~2 h; rounds 30 min)

With script + voice locked (word timings = the clock):
1. **Story/beat pass** (orchestrator): one sentence per panel, cut words chosen in the VO's breaths, metaphor per scene
   locked in text BEFORE drawing (a dozen script drafts is normal, a dozen re-boards is not). Vary cut rhythm: fast
   around the conflict, one breathing shot after the payoff; three near-equal durations in a row is a pacing smell.
2. **Camera plan** (`docs/vN/camera_plan_g3.md`, one row per panel): shot type, framing, cozy/scale, move with its five
   values, transition device, `life:` list, promise line. This is the contract draft.
3. **Thumbnails**: 3 variants per beat at 270x480 on one contact sheet, picked by checklist (two-pass: scribble for
   energy, volume pass only on survivors — discard at pass 1).
4. **Board JSON** — parallelisable: one agent per 3-5 panels once the camera plan is locked; the dress/density pass and
   the G4 style frames run in parallel lanes.
5. **Motion pass**: camera keys, pose pops, smears, loops, transitions played; boil on.
6. **Lint** (`board_lint.py`) — boxes, bands, counts, PLUS the new checks: five-values per move, peak speed, per-device
   transition requirements, life-list coverage, unaccounted emptiness, dress layer on wides, ambient on set panels.
7. **Cold read** (sound off, 270x480), then the sound-on pass; fix, re-lint.
8. **Owner**: ONE 540p **60 fps** MP4 of the whole reel (always end-to-end; the reel is the living master — every
   approved change lands in the board JSON first), plus the density-key still(s) and the parallel G4 style frames.

## 6. Review and lock

- **Sound-off cold read** (STORYBOARD_STYLE §5 checklist) stays the gate, plus one new question per set panel: "does
  this place feel inhabited — what's missing from the room?"
- **Motion check, sound on, at 1x**: every move readable (no strobe, peak speed in budget), every cut lands on its word,
  cuts judged in PAIRS with their neighbours, pacing varies. Both passes green before the owner sees it.
- **Density-promise check**: no panel surface both empty AND undeclared (the emptiness lint, mechanically: at 270x480,
  6x10 grid, any cell outside caption band / notes strip / `negative` zones >= 97 % paper fails).
- **The hand-off message states the fidelity ladder**: "This IS the final story, cuts, camera, motion and density plan;
  every grey mass becomes real detail at G5, every bare area stays bare; G4+ adds colour, final line, texture, polish —
  OK?" The owner's approval knowingly covers motion, timing and aliveness, not just story.
- **The lock** = the §2 contract frozen. A G3 revision costs a JSON data edit + a re-render of the failing shots only
  (approved shots stay frozen; each note maps to shot ids). Later timing feedback may move a cut by < 1 s; anything
  bigger, or any change to a locked column, reopens G3 explicitly. Expect "page-one" verdicts here — that is the point:
  a story note at G3 costs drawings, a story note at G5 costs a finished shot.

## 7. Tooling deltas (from `animatic_audit.md` §2/§5; E = exists, S ~ <=2 h, M ~ half a day)

| Change | Where | Effort |
|---|---|---|
| 7 transition types played; element moves + eases; one camera segment; 9 poses; draw-on/fillIn; notes strip; red marks | SketchReel | E |
| Box/band/count/zoom lint; contact sheets; g5 scaffold | board_lint.py, build scripts | E |
| `role:'dress'` layer, exempt from 25-cap and subject lint | SketchReel + board_lint | S |
| `loop: true` on element moves (ambient micro-loops) | SketchReel | S |
| 5 placeholder primitives (scribble-mass, crowd-row, facade-row, window-ticks, foliage-blob) | SketchReel | M |
| Line boil: 3 seeded variants per path, shared 8-12 Hz clock, role amplitudes; off for text/marks; sheets sample variant 0 | SketchReel | M |
| `camera.keys?: Cam[]` (multi-key camera) + board-mode parallax behind `shot.parallax: true` | SketchReel | M |
| Speed lint: peak on-screen px/frame (camera + own move) vs ~450 px/s; delete the hand loop in build_board_cine.py | board_lint | S |
| Transition `device` field + per-device requirement checks (§4 table) | JSON schema + board_lint | M |
| `life: [...]` + one-placeholder-per-item lint; `negative: true`; unaccounted-emptiness grid check; >55 % bare-stage WARN; zero-ambient WARN | board_lint | S-M |
| Move spec completeness lint (the five values per camera move) | board_lint | S |
| `pose:'smear'` figure variant; snap() documented as the pose-change idiom | SketchReel (snap exists) | S |
| Render the G3 reel at 60 fps (SketchReel is time-based; 540p60) | render command | S |
| g5_scaffold carries `transition.type` into scenes.json instead of flattening to cut | g5_scaffold.py | S |
| Volume/contact lint (bbox + ground y within 10 % across a shot's poses) | board_lint | M |
