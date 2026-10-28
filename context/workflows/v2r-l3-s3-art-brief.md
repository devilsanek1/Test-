# L3 agent brief: the V2S3 art conform (2026-10-28)

You are the ONE agent of lane L3 (helper session of video 2 "One Small Window", a Remotion film in `video/`). Run at MAX
effort. Do NOT start any agent, subagent or workflow yourself. Repo root `/home/user/Test-`, project `video/`, branch
`video-production`. Your job: bring **V2S3 "Her window"** (film 12.98-14.86 s) to the approved look, as the binding spec
`video/docs/v2/lanes/conform_L3.md` §1, §3, §4 and §6 asks, with the owner's newest notes. Quality first: the owner gave the
whole week to this film. No waste: no rework of what is listed as done, and no polish of things that will change.

## Read first, in this order (they win in this order; a clash between them is a bug: say so in your final message)
1. `video/docs/look/DIRECTION.md` (wins), `video/docs/look/CRAFT.md` §a-§g, above all §f (depth, air, separation, one
   camera, particles, and **"Failures the eye catches first"**) and §g (sky).
2. `video/docs/v2/THROUGHLINE.md` §3 (joins), §4 (tiers, life), §5 (light), §5b (depth table: S3's row).
3. `video/docs/v2/lanes/conform_L3.md` (binding for this shot) and `video/docs/v2/lanes/RESUME_2026-10-28.md`.
4. `video/docs/v2/OWNER_NOTES.md` (the last 3 entries) and the playbook's look section (`video/docs/OWNER_PLAYBOOK.md`,
   read only).
5. The libraries' how-tos: `video/src/lib/DEPTH.md`, `video/src/lib/SKY.md`, `video/src/lib/LIGHT.md`, the header of
   `video/src/lib/tier.tsx`, the header and `PRESETS` of `video/src/lib/particles.tsx`; `video/src/v2r/world/rigs.ts`,
   `video/src/v2r/world/skies.ts`.
6. The model to copy: S1, the approved look (`video/deliverables/v2/v2r_G4_look_v4.mp4`: pull frames with ffmpeg and look
   at them) and its code: `video/src/v2r/scenes/V2S1.tsx`, `V2S1_float.tsx`, `V2S1_light.tsx`, `V2S1_sky.tsx`; L1's report
   `video/docs/v2/lanes/report_L1_look.md` (what failed and how it was fixed).
7. The shot itself: every `video/src/v2r/scenes/V2S3*` file.

## Already done (by the lane; keep exactly, do not redo)
- `V2S3_rig.ts`: no zoom; the parallax float `S3_FLOAT_LEGS` (home at 12.98, legs 13.10-13.80-14.50, home from 14.50),
  rest times `S3_FLOAT_REST`, planes `S3_PLANE` {sky ∞, farCity 2, roofs 1, terrace 0, water -0.6, boat -1, towpath -2}.
- `V2S3_float.tsx`: `S3Plane` (wrap each plane's parts; shadows and particles ride the group of the plane they lie on).
  `V2S3.tsx` wires sun / terrace / canal / near / Pip into planes; `V2S3_near.tsx` splits boat (-1) and our towpath (-2).
  The far parts inside `S3Terrace` (the west gap, far city, roofs and chimneys) still ride plane 0: split them out.
- Pip (`V2S3_pip.tsx`): L2's `PIP_S2` track (seated at (590, 1050) on her terrace's front railing from the first frame,
  the same size, seed and pose as S2's last frame) plus its one reaction, the turn on "she" at 13.90. No hops.
- Her silhouette (`V2S3_tHer.tsx`): 140 px, feet y 862, walks 13.12-14.56, from 14.56 still at x 331.5 (her head measured
  at full size at 14.65: x 314-343, y 724-752, centre ~(330, 738); the push-through point (330, 742) is inside it). Her
  free hand at 14.28. Keep the walk, the timing and the still pose.
- The two head-backs on our towpath are deleted (`V2S3_nfolk.tsx` is gone).

## The joins (map.ts `MATCHES`, scenes.json; the film's join code draws the transitions, not your scene)
- In, 12.98: a B match-cut from L2's dark office window at M (335, 785) 133 x 164 to her lit home window at M (= map
  `W2_CUT`): the same spot and size, Pip at (590, 1050) in both. Nothing moves at the cut but the carrier.
- Out, 14.71-15.01: an A push-through into her head at (330, 742), zoom 12, bridge #36223A (her plum), into S4. From
  14.60 she is still and the float is home. Nothing enters, pops, turns or twinkles in 14.66-15.06, or in 12.98-13.18.

## What to do (conform_L3 §1, §3, §4, §6; every number from the docs above)
1. **Her window = S8's design** (conform §4: closed leaves, a central teal mullion, the gold lamp shade, two shelves,
   plants; L6's `S8Window` in `video/src/v2r/scenes/V2S8_house.tsx`, `roomInto` / `wFrontInto`, scaled to M's 133 x 164),
   blind UP from the first frame (THROUGHLINE: "lit, blind up"; no blind moving at the cut). **One deliberate change:** in
   S8's design the meeting stile (the central mullion, 48-52 % of the width = x 332-338 here) runs the full height and
   would cross her head at the push-through point (330, 742): the dive into her would land on a teal bar. So in S3 the
   stile runs from the transom (62 % down) to the bottom only, and the glazing above the transom is one undivided
   fanlight, where her head sits. (The lane asks L6 to make S8's window the same.) Her silhouette stays between the
   room and the front (the transom, the stile and the Juliet rail in front of her body). Tier A: the window and her
   silhouette carry the shot's only full outline (`INK_PX.mid` or wider, in their own deep shade), the brightest 5 % of
   the frame is her lit pane (`LitWindow`, L* 85-92) and her plum silhouette is the darkest, clearest shape in it.
2. **Sky:** add `S3_SUNSET` and `S3_AIR` to `video/src/v2r/world/skies.ts` (append only, next to the others; S3 is a
   flash-forward in S8's sunset light, so the horizon is `SUNSET_HORIZON` (#F3C6A6) like S7's), drawn with `<Sky spec>` as
   the shot's bottom layer (replacing the World's flat steps; see how S1 does it), no float (sky plane). The sun disc SUN3
   (96, 652) r 46 stays the set's flat shape, no halo. L5 found that a sun warmth this high in the ramp crosses
   yellow-green (khaki) at C* 10-13: use `sun: null` or a low, wide warmth that never reaches the mint; `skyProblems` must
   be `[]`.
3. **Depth** (CRAFT §f, THROUGHLINE §5b): planes -2 our towpath, -1 the boat and the water under it, 0 her terrace (her
   window M; her towpath under it), +1 roofs and chimneys, +2 the far city on the sunset band (the west gap). One
   atmosphere `makeAtmosphere({name: 's3', air: S3_AIR})`; every far fill through `recede` / `planePalette`. Separation:
   her lit pane in the darker wall, her plum silhouette in it, the terrace's front off the roofs behind it, the boat off
   the water; `backing` only as a real thing of the set. One camera (`groundCam`) with the towpath's VP (540, 1150): our
   towpath's slab joints run to it at |dL*| >= 6; the frontal terrace shares its horizon; sizes by distance (nothing
   nearer smaller per metre). Wire every part into its `S3Plane`.
4. **Light** (`lib/light.tsx`, `RIG_CANAL` at sunset, the S1 pattern `V2S1_light.tsx`): the low sun at the left, shadows
   right and toward us. Her window `LitWindow` + a `WindowSpill` on the Juliet rail and the wall below (+4 L*, warm);
   planes turned from the sun one `Shade` step; `FormShade` on chimneys and bays; contact and cast shadows under
   everything that touches a surface (the boat roof's pots, the bike, the rope, the bollards, the bench and its bag, Pip
   on its railing); water shades take `tint="water"`; never a contact strip on water.
5. **Tiers and life:** A = her window + silhouette. B = Pip, the two lit neighbours (watering, kettle steam). C = the
   terrace, canal, heron, boat smoke, string lights (one twinkle at a time), far walkers. **Life: <= 3 noticeable movers
   at once in the whole shot: the watering neighbour, one far walker, smoke; nothing else starts.** So cut the rest of the
   current movers (the cyclist, the extra walkers, the train, the ducks' and heron's motion, the robin, the pigeons, the
   birds, the boat's passer-by): what stays is still and calm. "The heaviest area at a squint must be the subject's,
   never the near dressing: near planes get value range, not prop count."
6. **Foreground (conform §1):** things, never people's backs: a bench with a bag left on it, a mooring bollard and its
   rope, a few fallen leaves as flat shapes, and the near lamp foot held from S2 (copy L2's lamp exactly as
   `video/src/v2r/scenes/V2S2_Set.tsx` draws `seed="s2nearlamp"` when you finish; today `<Lamp x={930} y={1990} h={1290}
   w={30} variant="near" />`; say in your final message which values you copied). Thin the existing near dressing (logs,
   wellies, bay tree, robin, pigeons) to what reads calm. The boat stays as designed (conform §4: the same boat as S4's).
7. **Line (conform §3):** delete the hand-drawn marks (ripple dashes, brick and stone dabs, leaf specks) in
   `V2S3_nground`, `V2S3_tParts` first, then in every `V2S3_*`; do not strip `INK_PX` or sketch options by hand otherwise
   (the global clean pen cleans every stroke); tier every piece.
8. **Particles, SEEN at phone size** (the owner on v4, 2026-10-28: "I don't see any changes in the particles anywhere";
   CRAFT §f.6 has the new numbers; `lib/particles` PRESETS still hold the old, too-small sizes, so pass `size` / `count`
   yourself): `glints` in the low sun's glitter path on the water (20-36 px sparkles or level dashes, L* +15..+25, 4-6
   twinkling at once, 0.3-0.8 s each), `motes` in her window's spill on the wall's shade (6-10 px, L* +12..+20). Particles
   read `useTime()`, which inside S3's `TimeShift` is FILM seconds: pass `joins={[12.98, 14.86]}` (the conform's [0,
   1.88] is scene-local) and keep entrances out of the 0.4 s round each join; `avoid` the caption band and her window.
   `particleProblems` clean.

## Checks (each a FAIL if it fails; put every number in your final message)
Renders (from `video/`): stills `env GL=angle node scripts/render-frames.mjs Film2R <dir> 13.5,14.2 --entry=src/entry-v2r-film.tsx
--scale=0.4` (film seconds; full size `--scale=1` for measuring); the lights-off A side adds `--props='{"lightOff":true}'`.
- `python3 scripts/qa/check_light.py <A.png> <B.png> --subject <her window box> --sky '#BCDCCF' --exclude 0,0,1080,<sky bottom y>`
  at 13.5: OK (the brightest 5 % on her window).
- `python3 scripts/qa/check_depth.py <13.5 still> --sheet scripts/qa/depth_sheets/v2_s3.json`: no FAIL. Write that sheet
  (copy the form of `v2_g4_look_s1.json`: planes, the air, the A silhouettes, the ground and its VP).
- `python3 -I scripts/qa/check_banding.py <still> --region <S3's open-sky boxes>`: PASS or WARN.
- `skyProblems(S3_SUNSET, {ink: CM.ink})`, `particleProblems(<S3's fields>, {joins: [12.98, 14.86]})`,
  `floatProblems(S3_FLOAT_LEGS, {rest: S3_FLOAT_REST})`: all `[]` (run them in a small tsx/node script or a test entry).
- `python3 scripts/qa/retro_tools/line/measure.py` on the 13.5 still: strokes <= 80 / Mpx, near-miss ends <= 40,
  dark-line <= 3 %.
- `npx tsc --noEmit -p .` clean.
- Look at the frames yourself at phone size (a 0.25-scale contact sheet of 12.95 / 12.98 / 13.00 / 13.5 / 14.2 / 14.65 /
  14.71): M and Pip on the same spot across the cut (S2's 12.95 is L2's: compare only), the squint test, CRAFT §f's
  failure list, <= 3 movers, no stranger's back, the particles visible.

## Paths, commits, rules
- Edit ONLY `video/src/v2r/scenes/V2S3*`, your append in `video/src/v2r/world/skies.ts`, the new sheet
  `video/scripts/qa/depth_sheets/v2_s3.json`, and a short "S3 art conform" section at the top of
  `video/docs/v2/lanes/handover_L3.md`. Never touch map.ts, lib/, kit/, other lanes' scenes, `OWNER_PLAYBOOK.md`,
  `CLAUDE.md`, `HANDOFF.md`, `TREATMENT.md`. A change needed elsewhere goes in your final message as a REQUEST line.
- Commit and push at least every 20 minutes and at the end with `bash /home/user/Test-/context/workflows/v2r-l3-ckpt.sh
  "v2r L3: S3 art conform: <what>"` (it typechecks, renders, adds only L3's paths, merges origin and pushes). Never
  `git add -A`, never a pull request, never rewrite history.
- Public repo: never write an email address or a secret into a file; never commit reference frames.
- Work in small, checkpointed steps (sky, then planes and air, then light, then tiers/life/foreground, then the window,
  then line marks, then particles), rendering a still after each to see it.
- Your final message (it is read by the lane, not shown to the owner): what changed per step, every check's numbers,
  the still paths (under `/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad/s3art/`),
  open issues, and REQUEST lines.
