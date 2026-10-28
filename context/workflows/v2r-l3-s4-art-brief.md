# L3 agent brief: the V2S4 art conform (2026-10-28)

You are the ONE agent of lane L3 (helper session of video 2 "One Small Window", a Remotion film in `video/`). Run at MAX
effort. Do NOT start any agent, subagent or workflow yourself. Repo root `/home/user/Test-`, project `video/`, branch
`video-production`. Your job: bring **V2S4 "The walk home"** (film 14.86-20.55 s) to the approved look, as the binding spec
`video/docs/v2/lanes/conform_L3.md` §2, §3, §4 and §6 asks, with the owner's newest notes. Quality first: the owner gave the
whole week to this film. No waste: no rework of what is listed as done, and no polish of things that will change.
V2S3 (the shot before) was conformed just before you: read its "S3 art conform" note at the top of
`video/docs/v2/lanes/handover_L3.md` and reuse its solutions (sky, air, light wiring, particles, line clean-up, the window).

## Read first, in this order (they win in this order; a clash between them is a bug: say so in your final message)
1. `video/docs/look/DIRECTION.md` (wins), `video/docs/look/CRAFT.md` §a-§g, above all §f (depth, air, separation, one
   camera, particles, and **"Failures the eye catches first"**) and §g (sky).
2. `video/docs/v2/THROUGHLINE.md` §3 (joins), §4 (tiers, life), §5 (light), §5b (depth table: S4's row).
3. `video/docs/v2/lanes/conform_L3.md` (binding for this shot) and `video/docs/v2/lanes/RESUME_2026-10-28.md`.
4. `video/docs/v2/OWNER_NOTES.md` (the last 3 entries) and the playbook's look section (`video/docs/OWNER_PLAYBOOK.md`,
   read only).
5. The libraries' how-tos: `video/src/lib/DEPTH.md`, `video/src/lib/SKY.md`, `video/src/lib/LIGHT.md`, the header of
   `video/src/lib/tier.tsx`, the header and `PRESETS` of `video/src/lib/particles.tsx`; `video/src/v2r/world/rigs.ts`,
   `video/src/v2r/world/skies.ts`.
6. The model to copy: S1, the approved look (`video/deliverables/v2/v2r_G4_look_v4.mp4`: pull frames with ffmpeg and look
   at them) and its code: `video/src/v2r/scenes/V2S1.tsx`, `V2S1_float.tsx`, `V2S1_light.tsx`, `V2S1_sky.tsx`; L1's report
   `video/docs/v2/lanes/report_L1_look.md` (what failed and how it was fixed); V2S3's conformed code.
7. The shot itself: every `video/src/v2r/scenes/V2S4*` file (`V2S4.tsx` lists the parts; `V2S4_rig.ts` the clock, the
   truck and the planes' factors; `V2S4_wcore.ts` the shared numbers).

## Already done (by the lane; keep exactly, do not redo)
- No camera move: the 6 % push is retired (`s4Zoom` = 1); the truck is the planes' own parallax (`s4PlaneDx(k, t)`: far
  0.3, backs 0.6, path and canal 1.0, near water 2.0, our boat 0 = screen-fixed); after the stop (17.96) the hold is
  locked; SUN1 is drawn at (250, 650) r 65 at zoom 1. Do not change the truck (speed, stop) or her walk, stride and stop
  (`V2S4_her.tsx`, conform §4).
- Pip (`V2S4_pip.tsx`): seated on the boat roof at (470, 1218) from the first frame, riding it, its gaze path (her, the
  tag, the post, the plates, the sun), the turn west on "heading" at 19.55; no leaps. Its roof shadow is a hand oval:
  you may swap it for the light kit's contact shadow.
- The name tag (`V2S4_tag.tsx`, map `S4.nameTag` x 590-1000, y 600-800): its builds (15.07, 16.60), text and layout
  are final (conform §4). Screen-locked paper: unlit, no shadow.

## The joins (map.ts `MATCHES`, scenes.json; the film's join code draws the transitions, not your scene)
- In, 14.86: the A push-through's incoming leg pulls back out of her head at (720, 912) (14.86-15.01). Nothing enters,
  pops or turns in 14.66-15.06 (walkers already walking at an edge are fine; the tag pops at 15.07).
- Out, 20.40-20.70: an A push-through into SUN1 (250, 650), zoom 7, no bridge, into L4's S5. Nothing enters, pops or turns
  in 20.35-20.75 (the birds fly west at 19.80: fine).

## What to do (conform_L3 §2, §3, §4, §6; every number from the docs above)
1. **Sky:** add `S4_SKY` and `S4_AIR` to `video/src/v2r/world/skies.ts` (append only, next to the others): the same golden
   evening as S1/S2 (`S1_HORIZON`, as S2 uses; THROUGHLINE §5b names S4's band the gold band), drawn with `<Sky spec>` as
   the shot's bottom layer (replacing the World's flat steps; the sky does not truck). RESUME: "your join pushes into the
   sun: the sun you push into sits in its own sky preset (no hard disc halo; the warmth is the sky's)": so S4's sky carries
   SUN1's warmth, low and wide (SKY.md: `ry` <= 0.45 `rx`), and `skyProblems` must still be `[]` (L5 found a warmth this
   high in the ramp can cross yellow-green at C* 10-13: centre it low, near the horizon behind the far roofs, and tune
   `rx` / strength until the crossing passes). The disc stays the set's flat `SunDisc`, no halo.
2. **The thread (new; conform §2):** her house and window ahead at the far left, in the BACKS plane (0.6x): the
   terrace's end house (brick, mansard, a chimney) and her first-floor French window, 90 x 102 centred (135, 698) at the
   pose (map `S4.herWindow`): teal frame, Juliet rail, blind UP, a DARK pane (she is not home yet), the same window as
   V2S3's (S8's design with V2S3's fanlight above the transom). It enters from the left edge with the backs plane (half in
   by ~15.6, whole by ~16.3); at the stop she looks west along the plates toward it. Tier B. Never over the plates, the
   tag or the band; clear of SUN1's disc (x <= 180) and 6 px above the DEC plate (y 755).
3. **Move the gasholder lattice off the sun:** no line crosses SUN1's disc (x 185-315, y 585-715) at any frame of the
   truck (the far plane moves 0.3 x 310 = 93 px).
4. **Depth** (CRAFT §f, THROUGHLINE §5b): planes -1 the boat (screen-fixed), 0 her + her towpath + the post, +1 the backs
   (0.6x), +2 the far roofs and gasholders (0.3x), each with its air step (`makeAtmosphere({name: 's4', air: S4_AIR})`,
   every far fill through `recede` / `planePalette`). Separation: her teal on the towpath off its field; the plates'
   cream on a field one shade step darker (the backs behind them: `backing`, a real thing of the set, never a slab). One
   camera (`groundCam`) for her towpath's paving and the coping, the backs and the far rows sharing its horizon; sizes by
   distance.
5. **Light** (`lib/light.tsx`, `RIG_CANAL`: the low sun at the left, `toward` 15, `el` 36, cap 0.8 h; the pattern
   `V2S1_light.tsx` and V2S3's wiring): her cast shadow right and toward us and her contact; contact under the post, the
   benches, the lamp posts, the boat roof's things, Pip; `FormShade` on the post's right side and round things; `Rim` on
   her coat's left edge; planes turned from the sun one `Shade` step; water shades take `tint="water"`, never a contact
   strip on water. Shadows ride the plane they lie on (hers is screen-fixed with her).
6. **Tiers and life:** A = her (the walk, the stop on "objected" 17.96, the look west), the name tag (15.07-18.80), the
   fingerpost (DEC 2025 on 18.92, APR 2026 19.45-19.80). B = Pip, her far window, the walkers she passes. C = towpath,
   lamps, benches, backs, gasholders, viaduct, the boat, the water (no motion of its own), ducks, heron, smoke, leaves; the
   birds west (small). **Life: <= 3 noticeable at once: one cyclist, smoke, ducks, taking turns; walkers enter at an edge
   already walking.** So cut or still the rest of today's movers (the train, the washing line, pigeons, the reader's page
   turn, the angler's float dip, windows switching on, the jogger if it reads as a fourth mover): what stays is calm.
7. **Line (conform §3):** delete the hand-drawn marks (ripple dashes, brick and stone dabs or ticks, leaf specks) in
   `V2S4_post` first, then in every `V2S4_*` (`V2S4_wpath`'s brick ticks, `V2S4_wcanal`'s ripple dashes, ...); author A
   outlines at `INK_PX.mid` or wider; do not strip `INK_PX` or sketch options by hand otherwise; tier every piece.
8. **Particles, SEEN at phone size** (the owner on v4, 2026-10-28: "I don't see any changes in the particles anywhere";
   CRAFT §f.6; L1 raised `lib/particles`' PRESETS to these numbers: merge origin first, then use the presets and never
   pass a smaller size; pass `size` only if the presets still hold the old ones; check at 360 px wide that a viewer can
   point at them): `motes` near SUN1
   (6-10 px, against shade where they can read), a `leaves` field across the towpath (26-40 px, a visible flutter and
   turn, 2-3 across the hold, crossing the mid ground, their fall clear of the band and of her), `glints` under SUN1 on the
   bottom water (20-36 px, L* +15..+25, 4-6 twinkling at once, 0.3-0.8 s). Particles read `useTime()`, which inside S4's
   `TimeShift` is FILM seconds: `joins={[14.86, 20.55]}`, and no entrance in 14.66-15.06 or 20.35-20.75; `avoid` the caption
   band, the tag, the plates and her. A field on a trucking plane rides that plane's offset. `particleProblems` clean.

## Checks (each a FAIL if it fails; put every number in your final message)
Renders (from `video/`): stills `env GL=angle node scripts/render-frames.mjs Film2R <dir> 16.0,17.0,19.9 --entry=src/entry-v2r-film.tsx
--scale=0.4` (film seconds; full size `--scale=1` for the checks); the lights-off A side adds `--props='{"lightOff":true}'`.
- `python3 scripts/qa/check_light.py <A.png> <B.png> --subject <her box> --sky '#BCDCCF' --exclude 0,0,1080,<sky bottom y>`
  at 17.0 and 19.9: OK (the brightest 5 % on the beat's A).
- `python3 scripts/qa/check_depth.py <still> --sheet scripts/qa/depth_sheets/v2_s4.json` at 17.0 and 19.9: no FAIL. Write
  that sheet (the form of `v2_g4_look_s1.json` and V2S3's `v2_s3.json`).
- `python3 -I scripts/qa/check_banding.py <still> --region <S4's open-sky boxes>`: PASS or WARN.
- `skyProblems(S4_SKY, {ink: CM.ink})`, `particleProblems(<S4's fields>, {joins: [14.86, 20.55]})`: `[]`.
- Line metrics at 17.0, full size, the caption zone masked: `python3 -I scripts/qa/retro_tools/line/measure.py out.json
  s4=<png>#290-600` (strokes_per_mpx <= 80, line_px_pct <= 3) and, from `scripts/qa/retro_tools/line/`, `python3 ends.py
  s4=<png>#290-600` (near-miss ends <= 40 per Mpx).
- `npx tsc --noEmit -p .` clean.
- Look at the frames yourself at phone size, every 1 s of the shot plus 14.86 / 15.01 / 20.35 / 20.40: her far window at
  16.0 and 19.9, the squint test, CRAFT §f's failure list, <= 3 movers, no stranger's back, the particles visible, nothing
  crossing the sun.

## Paths, commits, rules
- Edit ONLY `video/src/v2r/scenes/V2S4*`, your append in `video/src/v2r/world/skies.ts`, the new sheet
  `video/scripts/qa/depth_sheets/v2_s4.json`, and a short "S4 art conform" section at the top of
  `video/docs/v2/lanes/handover_L3.md`. Never touch map.ts, lib/, kit/, other lanes' scenes (V2S3 is the lane's: do not
  change it either), `OWNER_PLAYBOOK.md`, `CLAUDE.md`, `HANDOFF.md`, `TREATMENT.md`. A change needed elsewhere goes in your
  final message as a REQUEST line.
- Commit and push at least every 20 minutes and at the end with `bash /home/user/Test-/context/workflows/v2r-l3-ckpt.sh
  "v2r L3: S4 art conform: <what>"` (it typechecks, renders, adds only L3's paths, merges origin and pushes). Never
  `git add -A`, never a pull request, never rewrite history.
- Public repo: never write an email address or a secret into a file; never commit reference frames.
- Work in small, checkpointed steps (sky, then planes and air, then the thread and the gasholders, then light, then
  tiers/life, then line marks, then particles), rendering a still after each to see it.
- Write all the details (what changed per step, every check's numbers, the still paths under
  `/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad/s4art/`, open issues, REQUEST lines)
  into the "S4 art conform" section of `handover_L3.md` and commit it. Your final message (read by the lane, whose
  context is expensive) is at most 10 lines: each check's verdict with its key number, the commit hash, any must-fix
  left open. No logs or long tables in it.
