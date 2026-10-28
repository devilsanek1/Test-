# S4 art conform (2026-10-28, session_014PwCXJs9nWENkpKqVhHWMP; brief `context/workflows/v2r-l3-s4-art-brief.md`)
**State:** V2S4 "The walk home" (film 14.86-20.55) brought to the approved look per conform_L3 §2, §3, §4, §6, reusing S3's
solutions. Code: `src/v2r/scenes/V2S4*` (new: `V2S4_depth.ts`, `V2S4_light.tsx`, `V2S4_water.tsx`, `V2S4_particles.tsx`), the
S4_SKY / S4_AIR append in `world/skies.ts`, two depth sheets `scripts/qa/depth_sheets/v2_s4.json` (17.0, the truck) and
`v2_s4_hold.json` (19.9, the hold: the truck moves the planes and the plates exist only from 18.92, so one sheet per still).
Wrapped early at the coordinator's call (11:24 UTC): banding, the final light re-run and the frame-by-frame eye check are open
(below). No agent running. Stills: `/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad/s4art/`.

**What changed, per step**
1. Sky: `S4_SKY = eveningSky({band: CM.sky, horizon: S1_HORIZON, horizonY: 760, sun: {x: 250, y: 720, rx: 280, ry: 100}})` (the gold
   evening of S1/S2; SUN1's warmth low and wide, 70 px UNDER the disc, behind the far roofs: khaki crossing C* 5.94; a horizon at 780
   with the warmth at 700 crossed at 7.6), `S4_AIR = horizonColor(S4_SKY, 250)` (#FCD7B9); `<Sky>` first in the shot, the World's
   flat [mint, gold] steps gone; the disc stays the flat SunDisc, no halo, the sky does not truck.
2. Planes and air (`V2S4_depth.ts`): `S4_ATM` (air S4_AIR), `S4_CAM = groundCam({horizon 760, vpx 540, f 1400, height 3.1})` (her
   coping 14 m at 100 px/m, the wall foot 18.7 m), `planeBatch`. The towpath (the subject's plane) is pale (L* ~74), so the far
   city starts farther out (CRAFT §f.2): the backs take the +2 step (k .22), the far roofs / gasholders / viaduct +3.5 (k ~.52),
   warm stones and bricks only (cool slates and glass greyed to C* 7.6 and failed "no air"); truck factors unchanged.
3. Thread + gasholders (`V2S4_wbacks.tsx`, `V2S4_wfar.tsx`): the warehouse is now HER END HOUSE (red stock brick, stone cornice,
   slate mansard with a dormer, a stack with two pots, a narrow sash, her teal door) with her French window at map S4.herWindow
   (outer box 90 x 102 at (135, 698): teal frame band, the blind UP, a DARK pane with the unlit room tone on tone, S3's undivided
   fanlight, the stile from the transom down, the Juliet rail ONE closed comb); tier B, no outline. Enters ~14.95, half in 15.63,
   whole 16.31. G1 moved right of the sun's column (cx 520 r 90: plane-x 430-610, so >= 337 at the cut) and the drum G3 to cx 90
   (hidden behind her house from ~17.06); the sun's column keeps everything below y 736 (20 px of sky under the disc, no tangent);
   no line crosses the disc at any frame (the far plane's 93 px included). Far: no windows, aerials, pots, masts, wire or train.
4. Light (`V2S4_light.tsx`, RIG_CANAL): ONE ShadowLayer for the whole towpath (contact + cast under the lamps, bollards, planter,
   bin, lifebuoy post, bench, angler, heron, the post (POST_STANDERS), the pair, and HER: placed at her screen x minus the plane's
   offset, so it stays with her), the gate piers' casts and the walls' foot band; FormShade on the bollards, bin, planter, the post's
   right side and her far side; the RIM on her coat's left edge (clipped to the coat band); the roof's things and Pip's contact in
   one ShadowLayer riding the boat's bob; the backs' east returns and dormer cheeks one Shade step, the stacks a form step. The tag
   is unlit paper; the hand-picked stoneShade shadow quads are gone.
5. Tiers / life: A = her (INK_PX.mid), the tag, the post (fills at tier A always; its one closed outline pops on with the DEC
   plate at 18.92), the plates (one closed edge each, a closed keyline); B = Pip, her far window, the pair she passes (ink 0); C =
   the rest. Movers kept: the pair (B), the ducks, the boat's stove smoke, the birds west at 19.8, the particles. CUT: the train,
   the washing line, all pigeons, the gull, the raker, the window reader, the backs' two smokes, windows switching, the page turn,
   the nibble, the jogger, the dog walker AND the cyclist (every route crossed her at the 17.0 check frame or the plates after
   18.85); herbs, curtains, fenders, trees and the heron still.
6. Line (conform §3): every hand mark deleted (brick ticks, render patches, gate planks/straps, moss, bloom dots, hatching, mooring
   rings, leaf specks, ripple/reflection dashes, rivets, swirls); thin darks lifted to mid tones (`S4_IRON` #9A8C95 for iron,
   lamps, railings, bins, bollards; `S4_WOOD` / BOAT_WOOD mid oak; FITTING slate on the boat); the lamps redrawn in the scene
   without ink; the boat: door panels flush with their rings, porthole reflections a pale streak, pot rims brickLight, the grab
   rails drawn over the roof's shadows, fenders hung from cleats UNDER the cantrail (the cantrail and the plum stripe stay unbroken
   bands: S3's lesson), the chimney's hat a rounded cap; the post: a gilt finial assembly and gilt sockets (dark mouldings wider than
   the shaft read as two line marks each), one smooth flared foot, soft corners; the people's darks lifted.
7. Water (`V2S4_water.tsx`): ONE isolated flat placeholder, `S4_WATER` (canal + near regions, edges, standing, reflected, glitter,
   camera, air); the swap to lib/water is the body of `S4Water` ('canal' | 'near'). The towpath: flag courses laid from S4_CAM,
   every other one dL* 8.5 down, their edges re-projected per frame to the fixed VP (540, 760) (thin joint lines read as nothing
   to the eye and to the Hough check; level rows chopped them).
8. Particles (`V2S4_particles.tsx`, presets as they are): glints 26-36 px in SUN1's glitter path on the near water (screen-fixed);
   three palmate leaves 34-40 px blown across her flags right of her in the hold (born 18.05 / 18.75 / 19.45); far motes 8-10 px x 4
   by her house (ride the backs); near motes x 3 on the hull's slate; <= 15 alive; joins [14.86, 20.55]; avoid band / tag / plates / her.

**Checks** (17.0 = `on/f01020.png`, 19.9 = `on/f01194.png`, full size)
- check_light (`--sky '#BCDCCF' --exclude 0,0,1080,745`): 17.0 **OK** (her box 684,896,758,1072: brightest 5 % 0.079 H; greyed 115
  px; band dL* 0); 19.9 the brightest 5 % sits on the plates (the beat's A): **OK** 0.000 H with `--subject 100,750,758,1072`, **FAIL**
  0.177 H with her box alone. Measured before the last two tweaks (the course tone and the wall colours): re-run it.
- check_depth: **0 FAIL** at both (17.0: 3 WARN; 19.9: 4 WARN): far plane dE 7.3 / 8.0 from the air; her 24.0 / 34.0; the ground
  51 % / 72 % of its visible lines to the VP. WARN: subject -> backs dE 3.2-4.2 (>= 12), the backs 1.17x busier at 17.0, the DEC
  plate 10.2 (its top edge on the pale sky / far plane under the sun; lined 51 %), the APR plate 14.5 (a thin ring: the arm's
  under-shade), texture far 3.8 / near 3.8 at 17.0.
- skyProblems [], particleProblems [], tsc clean. check_banding NOT RUN: S4's open sky = `0,0,1080,280` (the zenith) and
  `322,604,424,730` at 19.9 (between the disc and G1; at 17.0 G1 sits at 408-588), the band `0,290,1080,600`.
- measure.py (#290-600) at 17.0: strokes **73 / Mpx** (PASS), dark-line **0.71 %** (PASS), near-miss **85 / Mpx (FAIL, <= 40)**: the
  tag's final lettering alone is 84 strokes / 115 pairs (48 / 66 per Mpx); everything else 19 / Mpx. From 501 / 2025 / 3.02 %.
- Eye: 0.4-scale sheets per step and 360 px views at 17.0 / 19.5 / 19.9 (`step6_phone.png`): glints, leaves and the near motes
  read; the far motes are specks (as S1's); the sun whole and clear at every rendered frame.

**Open**
- The eye check every 1 s + 14.86 / 15.01 / 20.35 / 20.40 at the final build, banding, the light re-run (the next agent).
- Near-miss 85 (the tag lettering, final); the depth WARNs above. Her window's frame corner (180, 647) sits 5 px from SUN1's limb
  (185, 650): forced by map S4.herWindow (x <= 180) and SUN1 r 65 (a near-tangent; the brief wants it clear, not cut).
- The plum stove chimney is the bottom third's strongest dark (kept: the boat's design, as S3); `V2S4_rig.ts`'s header comments
  still describe Pip's old leaps and the 6 % push (code is right), `KEEP.tag` (V2S4_wcore) is the old 870 px tag box.

**REQUESTS**
- REQUEST qa (measure.py / ends.py): mask or report apart in-world lettering (the tag, the plates): S4 cannot meet near-miss 40
  while the tag is up, whatever the world does.
- REQUEST qa (check_depth): sample thin A shapes at 1080 (the post's 15 px shaft is straddled by the 540 px in/out samples: left out
  of the sheets); Hough's removal of level lines chops receding joints (S4 draws its paving as tone steps for that reason).
- REQUEST orchestrator (lib/water): S4's swap is the body of `S4Water` in `V2S4_water.tsx` (spec `S4_WATER`, parts 'canal' / 'near');
  the glints' `on` is `S4_WATER.glitter.on`.
- REQUEST integrator (map.ts), optional: a clean gap between her far window and SUN1 needs the window 6+ px left or SUN1 r <= 60.

# S3 art conform (2026-10-28, session_014PwCXJs9nWENkpKqVhHWMP; brief `context/workflows/v2r-l3-s3-art-brief.md`)
**State:** V2S3 "Her window" (film 12.98-14.86) brought to the approved look per conform_L3 §1, §3, §4, §6. All code is in
`src/v2r/scenes/V2S3*` + the S3_SUNSET / S3_AIR append in `world/skies.ts` + the new sheet `scripts/qa/depth_sheets/v2_s3.json`.
No agent running. Stills: `/tmp/claude-0/-home-user-Test-/6f98c33a-2c7f-5355-893a-0f8c4c5abcb3/scratchpad/s3art/` (session-local).

**What changed, per step**
1. Sky: `S3_SUNSET = eveningSky({band: CM.sky, horizon: SUNSET_HORIZON, horizonY: 700, sun: {x: 96, y: 687, rx: 200, ry: 60}})`,
   `S3_AIR = horizonColor(S3_SUNSET, 96)` (#FCBF9B), drawn with `<Sky>` as the bottom layer (no float); SUN3 (96, 652) r 46 a flat
   disc, no halo, in the west gap.
2. Planes and air (`V2S3_depth.ts`): one atmosphere `S3_ATM` (air S3_AIR), one camera `S3_CAM` = groundCam(horizon 1150, VP x 540);
   `planeBatch` (far planes: planePalette, ink dropped; near: nearStep). +2 far city (a plain gasholder drum, far rows tone-on-tone),
   +1 roofs/chimneys in the west gap (planePalette, three gables, one stack, a slate ground-floor band), 0 the terrace, -0.6 the
   canal, -1 our boat (+ the water under it), -2 our towpath and its things.
3. Light (RIG_CANAL): her `LitWindow` (pane PANE_LIT) + `HerSpill` (a screen lift, one step, held to her window box: a spill on the
   wall failed check_light's light-shape rule); the terrace's casts and forms through `S3TerraceShades` (ShadowLayer + Shade +
   FormShade, no hand-picked shade fills; `V2S3_light.tsx`); contact + cast shadows for the bench, bollards, bin, lamp, terrace feet,
   the walker, the boat's roof things; no contact strip on water (the post's waterline is the water's own deeper step).
4. Tiers / life / foreground: A = her window + silhouette (the only full outline, INK_PX.mid; her plum the darkest); B = Pip and the
   two lit neighbours (watering, kettle steam); C = the rest (environment: flat, no lines). Movers: the watering neighbour, ONE far
   walker (128 px, profile, heading west, unlined), the boat's smoke (+ B's kettle steam, the festoon's single twinkles). Cut: the
   cyclist, extra walkers, the train, duck/heron motion, robin, pigeons, birds, the boat passer-by; herbs, curtains, fenders static.
   Foreground: bench + bag (L2's mid wood `PLANTER_WOOD`, warm-slate irons: never plum, never the darkest mass), bollard + rope
   (a deep slate bollard), flat leaves on the slabs, L2's near lamp held exactly (copied from `S2_NEAR_LAMP`:
   x 1030, w 30, foot 1990, neckY 790, collar y 1640 h 30, authored nearStep(CM.line, -2) #7E3E26, tier C #8F553F on screen; edges
   identical at 12.95 / 12.98 on every sampled row).
5. Her window (`V2S3_tHer.tsx`): S8's design at M (335, 785) 132.5 x 164.3: blind up from the first frame, the stile only from the
   transom (62 % down) to the bottom, the fanlight undivided where her head sits, the silhouette between room and front, the frame
   band straight in the brick (the architrave and hood removed: they ringed the pane in a light band; pane separation now 32.4).
6. Line marks: the hand marks deleted (brick ticks, rustication, dentils); thin darks lifted to mid tones (room wood, stack pots,
   dormers, a stone plinth under every house, S3_IRON for iron, the garden gate, a sage door for house 3, the boat pole, a blue-grey
   gas bottle, the heron's post, the festoon wire); the bench irons rounded; the roof's near rail kept out of the roof things'
   shadows; the far walker drawn with `ink={0}`: strokes 276 -> 80 / Mpx, near-miss ends 1325 -> 126 / Mpx.
7. Water: ONE isolated flat placeholder, `V2S3_water.tsx` (no styling spent; S1's water not copied): every number in the exported
   `S3_WATER` (canal + sliver regions, edges, what stands in it, what it mirrors, the glitter path, camera, air). The swap to
   lib/water is one line: the body of `S3Water` becomes the lib call with `S3_WATER`. The glints are a separate Particles field.
8. Particles (`V2S3_particles.tsx`, presets as they are): glints 26-36 px in the glitter path; two palmate leaves 34-40 px across
   her towpath and over the canal (born 12.20 / 13.30: no entrance in 12.78-13.18 or 14.66-15.06); far motes 8-10 px x 4 beside her
   window; near motes (nearSize) x 3 before our hull's shade; <= 15 alive (11 at 13.5); joins [12.98, 14.86]; clear of the
   caption band, her window and Pip.

**Checks (13.5 full size unless named)**
- check_light (A/B, --subject 259,693,411,874 --sky '#BCDCCF' --exclude 0,0,1080,700): **OK**: brightest 5 % (L* >= 85.9) centred
  (572, 965), 0.096 H from the subject (<= 0.15); shadow px 4.1 % (anchor-dark 0); caption band dL* 0.0; light shapes 0.
- check_depth (v2_s3.json): **0 FAIL, 3 WARN**: subject plane -> +1 dE 21.9 OK; her pane |dL*| 32.4 OK; her silhouette 68.3 OK; west
  end wall 19.4 / one value 5 % OK. WARN: +2 contrast 4.5 = 0.59x the subject's (<= 0.5x); our boat's roof edge on the canal |dL*|
  11.2 (>= 12); the towpath texture 1.5 crossings / 100 px far vs 2.9 near.
- check_banding: **PASS** on the open sky 0,0,1080,595 (band 290-595 dL* 1.12; visible 0, max step dL* 0.05, grain 0.21) and on the
  west gap 0,0,160,640.
- skyProblems [], particleProblems [] (joins [12.98, 14.86]), floatProblems []. tsc clean.
- measure.py (caption band 290-600 masked): strokes **80 / Mpx** (<= 80: PASS, at the limit; 140 components), dark-line **0.37 %**
  (<= 3 %: PASS), near-miss ends **126 / Mpx (FAIL, <= 40)**. The near-miss pairs by place: her window 66 (S8's Juliet rail
  crossing the transom and ending in the box planting, tier A), the gunwale 49 (the fenders cut the plum stripe: corner artefacts),
  the upper terrace 36 (B's watering neighbour, house 3's balcony), the canal 30 (the stove chimney's cap and collar, the heron),
  the boat roof 15, the ground floor 10, her towpath 8, the cabin 6.
- Eye check (0.25 contact sheet 12.95 / 12.98 / 13.00 / 13.5 / 14.2 / 14.65 / 14.71): M and Pip on the same spot across the cut, the
  squint (`final/sheet/squint_13.5.png`): her window is the middle's focal dark, framed by the hull's plum stripe and L2's lamp
  (the near bench calmed to a mid wood); <= 3 movers, no stranger's back, the particles seen at 360 px (glints and the leaf at
  once; the motes small but pointable).

**Stills** (under `.../scratchpad/s3art/`): `final/on/f00810.png` (13.5), `final/on/f00852.png` (14.2), `final/off/f00810.png`
(lights off), `final/light_map.png`, `final/sheet/s3_contact_025.png`, `final/sheet/cut_m_pip.png`, `final/phone/f00810.png`
(360 px), `final/phone/s3_13.5_360_rings.png`, `final/phone/s3_13.5_360_zoom.png`, `final/sheet/squint_13.5.png`,
`checks/line/linevis.png` (the line mask).

**Open**
- near-miss ends 126 / Mpx (FAIL vs <= 40): the rest is tier A's rail (S8's design), tier B's lines and measure.py's corner
  artefact (a convex corner of a dark fill, e.g. a fender over the stripe, counts as a stroke); not reachable without changing S8's
  window or S4's boat.
- the depth WARNs above; the S3 camera's horizon (1150) sits below the far coping (a stylised elevation; the glints take an apparent
  horizon at y 900 so the far sparkles stay >= 20 px).

**REQUESTS**
- REQUEST L6: S8Window's stile from the transom down only and its fanlight undivided (S3's window has it, per conform_L3 §1), so the
  window matches at the S8 match.
- REQUEST orchestrator (lib/water): S3's swap is the body of `S3Water` in `V2S3_water.tsx` (spec `S3_WATER`); the glints' `on`
  colour is `S3_WATER.glitter.on`: set it to the new water's colour under the glitter path when lib/water lands.
- REQUEST qa (measure.py): count a convex corner of a dark fill as no stroke (or report it apart); today a fender over a stripe or a
  foot in its contact shadow adds strokes and near-miss pairs.
- REQUEST L2: S3 holds the near lamp by importing `S2_NEAR_LAMP` and copying its path (and takes its bench wood from
  `PLANTER_WOOD`); keep both exported, and a change to the lamp's path or colour needs the same change in `V2S3_nground.tsx`
  (`nearLampBatch`).

# >>> Paused 22:40 UTC for the depth pass (third session, session_014PwCXJs9nWENkpKqVhHWMP) <<<
**State:** resumed 22:16 on the orchestrator's conform message; read DIRECTION.md, CRAFT.md §a-§d, THROUGHLINE.md, `conform_L3.md`
(wins over everything below), `src/lib/LIGHT.md`, `src/lib/tier.tsx`, the kit READMEs' "Tiers", `world/rigs.ts`, map.ts S3/S4 (the
integrator already retired the S3 ease-back and the S4 push: from = to = 1.00; S3 Pip seat (590, 1050); `S4.herWindow` (135, 698)
90 x 102; scenes.json V2S4 / V2S5 push-throughs) and watched `deliverables/v2/v2r_G4_look.mp4`. Rendered the built shots under the
global clean pen (0.4 scale). **No code changed since the resume** (last code commit d961a34; typecheck clean); no agent running.
**Next, in order (after the depth section lands in conform_L3.md):**
1. Mechanics myself: `V2S3_rig.ts` float -> one smooth out-and-back 2D leg, (1 - cos 2pi u) / 2 x (6, -3.5) px over 12.98-14.60, home
   at 12.98 and from 14.60 (add `s3FloatDy`, apply dx + dy in `V2S3.tsx`); `S3_PIP` -> seated at (590, 1050), size 100, seed
   'pipS2', no hops (`V2S3_pip.tsx`: drop the in-hop and the exit leap, keep the turn on "she" 13.90-13.98); `V2S3_tHer.tsx` WALK.to
   302 -> 330 (still from 14.56/14.60; measure her head on (330, 742) at full size: a 10 px miss is 120 px at zoom 12); `V2S4_pip.tsx`
   -> seated on the roof (470, 1218) from the first frame (drop the in-leap and the 20.25 out-leap; keep ride, gaze, the turn west
   19.55; a contact shadow); the name tag widened to x 590-1000, y 600-800 (body 30: name / "research engineer," / "Google DeepMind
   (Google's AI lab)"; build 2: "3 years · resigned Oct 2026" / a one-line credit) + map.ts S4.nameTag in the same commit (the
   orchestrator's 15:00 instruction; the builds and text stay).
2. Art conform, ONE agent at a time (S3, then S4), per conform_L3.md §1-§4 (+ the new depth section): tiers, RIG_CANAL light
   (contact / cast / form, LitWindow + WindowSpill, rim on her), hand-drawn marks out, S3 window = S8's (closed leaves, teal mullion,
   gold shade, two shelves), S3 foreground things + L2's final held lamp, Pip's railing seat at (590, 1050), S4 far house + window,
   the gasholder lattice off the sun, life <= 3 noticeable movers, water with no motion of its own.
3. One combined critic (check_light.py --sky '#BCDCCF', measure.py, the joins, the squint test) -> fixes -> report_L3.md.

# L3 handover (V2S3 + V2S4): first session, stopped at the orchestrator's request

**Done:** the direction is read (TREATMENT, map.ts S3/S4/PIP/MATCHES, BUILD.md, canal/cast/pip READMEs) and the plan below is set. No scene code is written yet:
`src/v2r/scenes/V2S3.tsx` and `V2S4.tsx` are still the engine placeholders. K3 boards (`src/v2r/kit/boards`) had not landed at handover.

**Findings for the next session:**
- Setup: `npm ci` works. Python needs `pip install opencv-python-headless fonttools brotli`. The remotion.config browser path exists. `CanalSample-S4` renders at ~0.5 s/frame (0.5 scale, angle).
- Kit: `S4Set` in `kit/canal/sets.tsx` is a usable base (far 0.3x / backs / path planes, narrowboat foreground, Pip slot). Plan: copy its structure into `V2S4_set.tsx`, because her figure must be
  screen-fixed (outside the path plane) and the fingerpost must sit ON the path plane. S3 has no set: build it from `TerraceRow`
  (samples.tsx cell 4: levels ground 1100 / first 878 / cornice 664 / mansardTop 602, `her={{index:1, french: MAP.W2_CUT, inside: <HerWindow .../>}}`)
  + `Water` + `Narrowboat` (roof y 1260-1330) + `Towpath` + NearBack heads (cap them at ~140 px wide, the owner's rule).
- Sky: samples use plain bands (`World sky={[CM.sky, CM.bandGold]}` S4, `[CM.sky, CM.bandSunset]` S3, horizon 1000), with no tod relight.
- Camera: use map.ts `zoomAt(S4.camera.push, filmT)` / `S3.camera.easeBack` via `mat.about(mat.scale(z), ax, ay)` on an `XG`.
- S4 truck plan: her stride 56 px at ~1.8 steps/s (~100 px/s, `strideFor(56,170)`). Constant speed for local 0-2.50, then speed falls linearly to 0 at 3.10.
  That is D = 280 px = 5 whole steps, so the path plane dx runs -280 -> 0 (the set is drawn at the 17.96 pose with the post at x 575). Far plane 0.3x, backs ~0.6x.
  From 3.10 her pose is `stopLook`.
- Word times (`public/v2r/voice_words_heard.json`): So 13.16 · she 13.96 · talking 14.28 · She 15.07 · AI 16.12 · BBC 17.08 · objected 17.96 ·
  military 18.92 · was 19.64 · heading 19.80 · In 20.67. Local t = film - 12.98 (S3) / - 14.86 (S4).
- Lettering widths (CaptionHand, measured with PIL): "DEC 2025" at 56 px is 196 px · "unclassified work" at 34 px is 203 px · F8 credit at 18 px is 383 px · F9 credit at 18 px is 370 px ·
  "Sofia Liguori" at 44 px is 191 px · "research engineer, Google DeepMind" at 26 px is 337 px · "3 years · resigned Oct 2026" at 26 px is 258 px.
  So each 450x100 plate fits its key line (56) plus its body line (34), but NOT its 18 px credit. Proposal: a small paper notice on the post below the plates
  (x ~150-560, y ~975-1055) carrying both credits, pen-revealed with each plate (or whatever K3's Fingerpost does). The tag (280x200) cannot hold
  every line at body 30 px: use 26 px body and/or a REQUEST to grow it to ~300x230.
- References at 216 px: extract with ffmpeg (two separate commands: reference.mp4 and deliverables/v1/php2shell_final.mp4).

**Next:** build V2S4 (set, her, tag, fingerpost, Pip ride/turn/leap per map PIP + MATCHES), then V2S3 (the W2 match, the ease-back, the HerWindow,
Pip's land / turn / leap out of the left edge at y 620-700). Then make the review files, run the critic loop (ultracode: a Workflow with art-director /
sound-off / standards / motion critics), and write report_L3.md.

## 2026-10-27, second session (ultracode), stopped at the orchestrator's request for the max-effort session
**Done:** setup checked in a fresh container (`npm ci`; `pip install opencv-python-headless fonttools brotli numpy pillow`; the remotion.config
browser path exists; `CanalSample-S4` renders at ~0.5 s/frame at 0.5 scale). Re-read the direction; still NO scene code: `V2S3.tsx` / `V2S4.tsx`
are the engine placeholders. K3 still has no Fingerpost / tag component (`src/v2r/kit/boards` = `WorldText.tsx` + `texts.ts` only: words from
`TXT_NAME_TAG` / `TXT_PLATES`), so L3 builds the post and tag itself (`V2S4_post.tsx`, `V2S4_tag.tsx`) unless L5 lands one.
**Workflow:** a build workflow (two parallel builders, one per shot, self-reviewing renders) was launched and STOPPED before it wrote any file;
its builder briefs are a good starting prompt: `~/.claude/projects/-home-user-Test-/<session>/workflows/scripts/v2r-l3-build-wf_837d1d64-aeb.js`
(not in the repo; the gist is below).
**Decisions in those briefs (keep or revise):** S4 path plane dx -280 -> 0 (constant to local 2.50, ease to 0 at 3.10 = 17.96), backs 0.6x,
far 0.3x; post on the path plane landing x 575; credits F8 / F9 on a small paper notice on the post under the plates (x ~150-560, y ~975-1055),
pen-revealed with each plate; the tag may grow down to y ~840 (x <= 880) so build 2 (more + credit) fits with body 30 px (26 minimum + a
REQUEST); Pip S4 lands (470, 1218) 14.95, rides, faces left 19.55, leaps to the sun 20.25; S3 uses `pipHopS2S3At` across the cut, leaps out of the
left edge (x 0-120, y 620-700 at 14.86); check `lib/Film.tsx` for how `matchcut` renders S3 at negative local t; S3 near head-backs <= ~140 px wide.
**Next:** build V2S4, then V2S3, the review files (COMMON.md), the critic loop, report_L3.md.

## 2026-10-27 ~15:10 UTC, third session (MAX + ultracode, session_014PwCXJs9nWENkpKqVhHWMP): CONTROLLED PAUSE (5-hour limit at 89 %)
**State (all pushed; typecheck clean; Film2R renders):** both shots are BUILT at near-finished quality by four parallel builders (two workflows),
stopped at the pause; their work is committed (last commits: S4 world e1ff69b 14:43 + WIP checkpoints to d961a34; S4 story 0f77403; S3 far
6b2e36e; S3 near+story dbb4b0c). Spec: `plan_L3.md` (builders/files table, rules §0, §1 V2S4, §2 V2S3). Style check answered:
`stylecheck_L3.md` (its last paragraph lists what STYLE.md changes in the build). Files: V2S4 = `V2S4.tsx` (integration + push camera) + rig
`V2S4_rig.ts` + world `V2S4_far/path/boat` (thin wrappers) over `V2S4_w{far,backs,path,canal,boat,cast,core}` + story `V2S4_post` (post +
`S4Plates` drawn ABOVE Pip/boat) `_tag` `_her` `_pip`; V2S3 = `V2S3.tsx` (integration + ease-back/float camera) + rig `V2S3_rig.ts` + far
`V2S3_terrace` over `V2S3_t{Houses,Her,Canal,Life,Parts,West}` + near `V2S3_near` over `V2S3_n{boat,dress,folk,ground}` + `V2S3_pip`.
**What each stopped builder was doing:** S4 WORLD: densifying the set after its big pass (backs, yard, towpath life, canal, our boat + near water;
the boat's cabin side was still being enriched). S4 STORY: polishing Pip's gaze path and the plates' build; post, plates, tag (2 builds), her
walk/stop/look and Pip in place. S3 FAR: polishing the terrace (light, ivy, lantern, steam). S3 NEAR+STORY: dressing the bottom third (boat, folk,
puddle, pigeons; S2's near lamp held across the match). None was mid-way through a structural change.
**Workflows (do NOT resume the builders; go to review):** build S4 run `wf_81fa0e37-69f` (script `context/workflows/v2r-l3-build-s4-wf_81fa0e37-69f.js`),
build S3 run `wf_8624d14c-4d1` (`context/workflows/v2r-l3-build-s3-wf_8624d14c-4d1.js`); both stopped. Review script `context/workflows/v2r-l3-review.sh`
(writes the review files to the scratchpad `review/<round>/`; edit its `S=` path in a new container), critic round `context/workflows/v2r-l3-critic-round.js`
(ONE combined critic, then the V2S4 fixer, then the V2S3 fixer, one agent at a time; args `{round, review, fix: true, mandated: {V2S4: [...], V2S3: [...]}}`).
**BUDGET (orchestrator, 15:00):** at most ONE agent at a time; ONE critic round in total, then one fixer per shot (sequential); no polling loops;
renders of my shots only at 0.5 scale; report by the new deadline the orchestrator gives at resume.
**Next steps, in order (after the resume message):**
1. Rig edits (mine, no agent): `V2S4_rig.ts` S4_TRUCK v 110.7 -> 119 px/s (0.70 body heights/s, STYLE.md §4; D = 333, the post rides in from x ~242;
   keep 5 steps) and check every S4 plane still covers the frame at the cut (plane x from -(k x 333 + 80)); `V2S3_rig.ts` float -> two eased legs
   within ±12 px of home (STYLE.md §6 float law: e.g. +7 px x by 14.05, then (+3, -6)), add `s3FloatDy` and apply dy in `V2S3.tsx`; check Pip's exit
   stays in x 0-120 / y 620-700 at 14.86.
2. `bash context/workflows/v2r-l3-review.sh r1` (fix its `S=` path if the scratchpad moved), look at the sheets yourself.
3. Launch the critic round (Workflow scriptPath `context/workflows/v2r-l3-critic-round.js`, args `{round: 'r1', review: '<scratch>/review/r1', fix: true,
   mandated: ...}`) with the MANDATED STYLE.md items: V2S4: flyers + smoke `ceil={600}`; no plum on lamps / railings / birds / the post (CM.line; birds ink
   V-strokes or CM.shadeWarm); shadows <= ~40 px; canal water no motion of its own (no drift, no glint flicker); a slow cloud bar in the top gutter
   (y 120-260); cozy-lane movers enter at edges at cruising speed; THE NAME TAG (orchestrator 15:00): card x 590-1000, y 600-~800, body 30 px, build 1 =
   "Sofia Liguori" (44) / "research engineer," / "Google DeepMind (Google's AI lab)", build 2 = "3 years · resigned Oct 2026" / one-line credit, leader to
   her head; update `map.ts` S4.nameTag to {x0 590, y0 600, x1 1000, y1 800} IN THE SAME COMMIT (the orchestrator allows it). V2S3: her window = L6's S8
   window (closed glazing with a teal central mullion, the same gold lamp shade, two shelves, plants on the sill; keep the blind rolling up, the Juliet
   rail, the planter box for Pip; L6 told to keep theirs); flyers + smoke `ceil={600}`; no plum on lamps / railings / birds (the HELD near lamp must match
   S2's lamp colour at fix time: L2 was asked to recolour theirs to CM.line; if they haven't, keep matching S2 and list a REQUEST); shadows <= ~40 px (the
   long towpath shadows); water no motion of its own; one string-light bulb twinkling at a time (<= 3 flashes / s); something in the top gutter (a static
   branch from the top-left, or a slow cloud bar); near head-backs <= ~140 px wide at the shoulders (NearBack hv <= ~150).
4. Verify the fixes (stills of my shots), commit + push, write `report_L3.md` (<= 15 lines: built, critic verdict, QA numbers, open items, REQUESTS:
   map.ts S4.nameTag already changed; any kit defect) and push it LAST.
**L2 (15:03):** agreed: S2's near lamp goes CM.line, and L2's fix round MOVES and slims it (likely x ~1030, half cut by the right edge, w ~20-22,
swan-neck only at x > 1000, variant 'near', foot below the frame, under S2's 1.06 push about W2 from 12.80); L2 will message the exact final numbers
(x, y, h, w, variant, color). The S3 fixer must copy THOSE into `V2S3_nground.tsx` (S2_NEAR_LAMP) so the held lamp matches at 12.98; until they
arrive, check `V2S2_Set.tsx` (the `s2nearlamp` Lamp) and match whatever is there.
