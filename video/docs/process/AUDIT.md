# Toolbox audit: intents, tools, prescriptions, checks (2026-10-30)

Status: IN PROGRESS (written from the first step; updated as each doc is read). Resumed 2026-10-31 by the takeover
(study session) after the owner's v7 note ("A number is never a target the frame is built to"); scope extended to
ORGANIC (+ organic/), PAINT_RECIPES (+ paint_recipes/), COMPOSITION_SHOTS (+ composition/), SOUND_SYNC, PEOPLE_DESIGN,
TYPE_GUIDE, the darks rule (D3_RECONCILE), the gating checkers, and "The v7 lesson".

Brief: `video/docs/process/BRIEF.md`. Four kinds:
- **INTENT**: a feeling or goal the viewer should get ("a feel of distance", "cozy", "one place to look").
- **TOOL**: a visual means that creates an intent (layers, overlap, atmospheric perspective, a lit opening, leading
  lines, value grouping).
- **PRESCRIPTION**: a concrete placement or a fixed number that decides the picture ("the window at (598, 970)", "sky
  45-50 %").
- **CHECK**: a test that a mistake did not happen (contrast >= 4.5:1, safe zones, timing).

## Method

**The owner's two lines this audit applies** (playbook, top): "The toolbox is written as FEELINGS and the visual TOOLS
that create them, never as placements" (2026-10-30) and "A number is never a target the frame is built to" (2026-10-31:
"contrastful, to give feeling X" is the brief; how much contrast, dark, props or quiet follows each scene's own content,
mood and setup; measurements stay as diagnostics and as checks against real mistakes).

**How a rule is classified.** A rule is counted at the size an agent reads it: a numbered rule, a bullet, a table row
or a recipe block. Every PRESCRIPTION gets its own row; a recipe with many craft parameters is one TOOL row.
- **INTENT**: names what the viewer should feel or get. It decides no pixel.
- **TOOL**: a visual means that creates an intent. Craft numbers INSIDE a tool (a rim's width, a bloom's radii, a
  brush's size ladder) stay TOOL: they say how to make the thing well, they never say how much of the frame it takes.
- **PRESCRIPTION**: decides the picture itself: a placement or zone ("the focal at x 380-700, y 860-1200"), a share of
  the frame ("up to ~45 % under L* 40"), a count ("<= 6 named objects"), a fixed size or a fixed layout for every
  frame. Two flavours: **P-place** (where things go) and **P-num** (how much of a look quality). Each row names the
  feeling it was trying to serve, so the rework can keep the feeling and drop the number.
- **CHECK**: tests that a real mistake did not happen: the words unreadable, a safe zone covered, a timing slip,
  banding, flicker, a broken file. Two flavours: a **mistake check** (pass/fail is right) and a **diagnostic** (a
  measure with no target: it explains what we see or compares with a reference, the owner's allowed use).
- **gated**: a PRESCRIPTION that code FAILs or WARNs (a look number enforced as if it were a mistake): the worst kind,
  because a WARN reads as a defect and agents fix the frame toward the number.

**What was read.** Every guide in BRIEF's toolbox list, plus ORGANIC (+ `organic/`), PAINT_RECIPES (+ `paint_recipes/`),
COMPOSITION_SHOTS (+ `composition/`: recipes, catalogue_detail, library_clashes, the judges' tiers), SOUND_SYNC,
PEOPLE_DESIGN, TYPE_GUIDE, the darks rule (`D3_RECONCILE.md`) and the checkers that gate on look numbers
(`scripts/qa/*`, `docs/look/organic/*.py`, `composition_study.py`, `check_light.py`, `check_banding.py`). Line numbers
are as of 2026-10-31 (after D3's 35 edits); the first run's notes below predate D3 and are re-checked in the tables.
Research notes under a guide (`organic/*.md`, `composition/*.md`, `paint_recipes/*.md`, `people_design/*.md`) are
audited for what they PASS UP to the guide (a target, a template, a layout); their measurements stay diagnostics.

## Working notes (raw, as read; folded into sections 1-5 at the end)

- PLAYBOOK: the three rules (24-45) are pure INTENT and say checks "never stand in for the picture" (34-36). The
  2026-10-30 change notes (652-655, 678-680) sit on top of bullets whose text still says the old thing (656-663 "visual
  script written first"; 680-688 "scribble-mass placeholders"). SCENE COMPOSITION (354-356) is the model intent+tool
  pair. Numbers that decide frames: "~130-220 px tall" (306), "near heads <= ~140 px" (452), "-20 to -25 L*" (277),
  "6-10 % under L* 40" (527).
- DIRECTION: no mention of the three rules or THE LOOP NOW; "The approved pipeline" (232-243) still runs G2.5 visual
  script -> G3 grey tiers -> G5 fills masks. Rule 3 (96-98) fixes the frame as sky-with-band at the top + near ground at
  the bottom + things in the belt; rule 7 (185-186) fixes every film's one big move to S1 or S5 (S5 2.6 s + 0.7 s).
- CRAFT: says its thresholds are WARNs (15-16) but §d.2 (271-276) and §d.10 (348-350) prescribe value structures per
  time of day; §f.8 (505-508) wants darks spread over >= 9 of 16 grid cells (vs one place to look); caption block y
  317-556 (561) vs LAYOUT y 290-585 (46).
- LAYOUT: the frame as fixed zones: read zone (48), subject axis/box x 380-700 (50), quiet fields top/bottom (53), set
  bands per cozy set (76: RIVERSIDE y bands from v2), scale coordinates (80, 83), the BALCONY C-curve placement (108-110).
  "you" head 90-140 px (58) vs the playbook's ~130-220 px tall figure (306). Self-warning at 343-344 ("a formula").
- COMPOSITION_SHOTS: the "By emotion" table (433-441) is the right shape (feeling -> frame, move, join) but the
  planning card (347-363: "One recipe per shot, picked by its beat"), the 13 "every shot" grammar rows (139-151), the
  "five numbers every shot keeps" (365-373: the focal within 130 px of x 540 at y 951-1006) and rules 2-10 (544-596)
  turn every frame into one template: words on top, focal at (540, ~980), horizon at y 690-860 or 1150-1300, near band
  top at y 1450-1650, hero cloud counterweight in the top gutter, "you" at x 130-380 facing right. SR2-SR5 are v2's
  sets as recipes (751-754). Owner ideas demoted by our judges (78-98: thirds, diagonal, balance, spiral).
- CINEMATIC_GUIDE: "Scale cues" (169-229) is the best intent -> tools list in the toolbox ("Scale is felt, not
  counted", 171) but each shot S1-S5 is a coordinate layout (S2 disc at (580, 1060), 70-72; S5 start/end, 139-149).
  Stale: rule 1 "caption style stay as in v1" (233-234); "faces only the generic LASH" (256).
- COZY_AND_SCALE: 3b opens with the intent ("A recipe for a FEELING: safe, held, unhurried, among people", 107) and
  K1-K10 have an "emotion" column (373-385), but BALCONY and RIVERSIDE are screen-y band layouts from v2 (141-142,
  147-191). "darks warm and rare (L* < 25 on <= 6 %)" (286) against the darks rules elsewhere. Stale LASH (187-188).
- LIFE_AND_DENSITY: intent first ("Feeling alive is the goal; the numbers are a warning signal", 6). §10 (268-275) still
  has G5 "fills G3's plan: every placeholder ... made real" against the three rules. "you" head 90-140 px (149). Stale
  LASH (141-147). Dressing inventory (122-136) is a menu of things, useful as a palette of ideas.
- PALETTE: colour jobs (104: hero = what the story is about, anchor = weight, pop = "look here") is a clean
  intent -> tool rule; numbers: background 50-80 % (60), hero 5-15 %, pop 1-3 % (74-77) vs COMPOSITION_SHOTS E8's
  accent 3-5 % (144, 168).
- ORGANIC: rendering method, well argued. R5 (364-367) turns the owner's "big quiet areas" into one layout (sky with
  band on top >= 30 %, near ground >= 15 % at the bottom, things in the belt) measured on two reference paintings; R7-R8
  (372-376) fix the focal and "the hero cloud, top right". R10 (379-381: a dark mass 15-40 % in one or two masses) vs
  the playbook's "many small pieces ... never one dark mass" (526-528) and CRAFT §f.8; §8 (752-757) says T3 was decided
  under the hand-over while DIRECTION (58-59) and CRAFT (24-25) still say the call is pending.
- PAINT_RECIPES: rendering recipes, concrete by design (the owner asked for them, playbook 937-943); fine as TOOL specs.
  §4 (183-290) is scene 1's values (sun (196, 779), horizon 792, boxes) inside the shared book.
- PEOPLE_DESIGN: layered states: "IN USE" open eyes (3-20), "IN USE" C + LASH (22-35), "the recommendation: A" (146),
  "§5 DRAFT: direction A" (187). §5.1 neck "slanting forward 10-15 degrees" (199) vs the playbook's upright neck
  (413-414, the "computer neck" note); §5.3 "Never: ... an open-eyed 3/4 face" (267) vs "Let's do open eyes". Pose
  library (392-420) is fashion-stance; acting (gesture by story beat) is one line.
- TYPE_GUIDE: principles (§a 6-14) are intent + tool ("Light and airy, never boxed", "Calm motion that never clips");
  the seats and baselines (58-62) are a type SYSTEM (consistency is the point: fine). The home anchor is the band, so
  words sit above the subject in nearly every shot (64-74): it reinforces the band template.
- SOUND_SYNC: the best-shaped guide: each device has "Is / Says / Timing / Build" (45-60), ranked, by beat and by
  emotion (355-381), a never list (395-407) and a checklist (409-439). Its "one shape per film" (count of three, late
  fourth, rest, one release: 12-13) is a fixed formula from two reels.
- STORYBOARD_STYLE: the board lint FAILs or WARNs a subject outside x 380-700 or 270-460 px wide (226-231): the
  centred-subject prescription is enforced by code. Placeholders "wherever the final film is dense" (19, 119-122)
  against the three rules. "Thumbnails first: 3 variants" (135-136) is the only built-in divergence tool, by size or angle.
- EDGES: v1-era API doc under a banner; edge engine presets; no frame intent.
- PIPELINE_V2: THE LOOP NOW (29-50) is intent-first ("what the viewer must understand and feel there", 34-36) but its
  toolbox paragraph (85-92) re-imports "the frame's grammar in every frame ... LAYOUT.md's bands"; the gate table
  (114-127) still runs W1 -> G2.5 -> G3 grey placeholders -> G4 -> G5 "tier masks filled". The FRAME LOOP (71-83) builds
  "from its card ... `docs/look/FRAME_CARD.md`", which does not exist.
- G3_ANIMATIC: the old loop in full: "loose never means empty" placeholders (66-99), the density key (95-99), "G4+ may
  only ADD" (41-46). Nothing on the three rules.
- G5_BLOCKING: engine and lanes spec; "fill what G3 decided" (128). No intent lines.
- CREATIVE_BRIEF: story intent at its best (the understanding shift, "So what?", the reactions: §1, §9-10); visuals get
  one line (§20-21: "animation that does some of the explaining") and editorial question 9 ("Can animation make the
  insight more obvious?"). No method for the visual idea.
- v4 WORLD_BIBLE: the worked example. The camera (79-95: horizon y 1150, VP (540, 1150), sizes by formula), the home
  view laid out by coordinates (128-152: roof y ~667, the computer x ~66-282, "The one window: (598, ~970) ... in the
  golden box ... ~415 px under the caption block: the focal"), Pip at ~(845, 905) (174-176), the density key's "sky with
  the band ~45-50 %; the near snow ~35 %" (165). The owner on its strip: "each house is so alone like the scene is empty"
  (OWNER_NOTES 343-348: "a thin belt of lone blocks").

## 1. Per-doc tables

Columns: the rule (doc §, line), its kind, and for a PRESCRIPTION the feeling it was trying to serve (what the rework
keeps when the number goes). "gated" = a checker WARNs or FAILs it (§6). Kinds per doc are counted at the foot of each
table as I / T / P / C.

### ORGANIC.md (+ `organic/`): the rendering method, and the composition template that built v7

The method (§3, §4.1-§4.3, §4.5, §5) is the best TOOL work in the toolbox; §4.4 (R1-R12) and §6's "Check:" lines are
where the frame got decided. The coherence pass of 2026-10-30 copied R1-R12's numbers up into DIRECTION and CRAFT "as
first values" (§8 intro), so this doc's prescriptions now govern from above it.
| Rule (line) | Kind | Serves / note |
|---|---|---|
| §0-§2 the measured gap (razor 22 %, straight 26.5 %, dead-flat 35 %; ten calls; 40 named things) (48-133) | C, diagnostic | the right use of numbers: explains why v6 read "too square and proper" and "very busy" |
| §3.1 techniques 1-11 and §3.2 libraries; §3.3 rejected (142-193) | T | the toolbox proper; "if you want a painterly bush, paint the bush" is a principle worth keeping |
| §4.1 natural shapes: ellipses on a size ladder, overlap or gap, value-noise outlines, clouds, streaks, trees, asymmetry (202-226) | T | craft numbers inside a recipe (aspect 0.6-0.98, octaves): fine |
| §4.1 man-made hand-cut; two faces per volume; the ground's joints in 2-5 pieces; rows never evenly spaced (228-255) | T | craft |
| §4.1 "No ruler line ... straight runs >= 60 px <= 15 % of a crop's edge length" (232) | P-num | hand-made, organic, never "too square and proper" |
| §4.1 "No template ... twins <= 5 %, mirror IoU <= 0.65" (236) | T with a P-num target | nothing mechanical or repeated |
| §4.1 "right angles <= 25 % of the corners ... which takes a hero building turned 15-30 degrees off frontal" (240-244) | P-num -> P-place | not square; it pushes a camera choice (turn the building) from a corner count |
| §4.1 "Every mass on planes 0 to +2 is broken at least once by a thing in front of it" (256) | T as a quota | depth through overlap; as a quota it adds things for the count |
| §4.1 edges lost and found (found >= 14 L*, lost <= 4 L*, alternating, made never blurred) (259-271) | T | the painter's edge hierarchy: keep |
| §4.1 "The targets" table: razor <= 8 %, straight <= 15 %, dead-flat <= 20 % whole frame; per-element shares (273-289) | P-num, gated (`check_v7.py`, step 3's check) | painted, not vector; measured on two references and made the bar for every frame |
| §4.2 one key per set, one story light per scene, on the subject (292) | I + T | the light tells the story and leads to the subject |
| §4.2 "the brightest 5 % ... within 0.07-0.15 H of the subject; every other light at least a step under it" (293-297) | P-num, gated (`check_light.py`) | one place to look |
| §4.2 falloff, rims, wrap, bloom at emitters, shafts, projective shadows, named casters, the light table, three homes (298-331) | T | craft numbers (rim 4-6 px at 300 px tall, bloom 0.1/0.4/1.2 x source): keep as recipe defaults |
| §4.2 in time: no source moves between cuts, no flicker, no light re-seeded per frame; "every layer stops >= 10 px outside the caption band" (332-336) | C | real mistakes (flicker, boil, the words covered) |
| §4.3 one family per scene; "off-family colour below the band <= 3 %" (339-340) | T + P-num, gated (`check_v7.py`) | harmony, one key |
| §4.3 out-of-family hues turn to the nearer end, C* >= 8, never olive or beige (341-344) | T + C | "warm, never sickly" (an owner rule) |
| §4.3 "One hot accent, at the focal ... the 1 % most saturated warm light 100 % at the focal; colour calls <= 3 with one rival" (345-347) | P-num, gated | one place to look |
| §4.3 the subject keeps her own colour; the key at the source, never a grade (350-353) | T | |
| §4.4 R1 the notan: three masses >= 85 %, <= 8 masses, one group 40-55 %, means >= 13 L* apart (355-357) | T (the notan study) + P-num, gated | a simple, strong read at a glance |
| §4.4 R2 <= 10 value pieces (358-359) | P-num, gated | calm, not busy; it vetoed new life in v7 (§7) |
| §4.4 R3 <= 3 calls, one at >= 70 % (360-361) | P-num, gated | one place to look (as a diagnostic it is excellent) |
| §4.4 R4 the focal: door L* >= 95, her L* <= 28, a step >= 65 L*, nothing else within 10 L* of the door (362-364) | P-num + P-place, gated | the eye lands on her; it made her a dark sliver |
| §4.4 R5 >= 65 % quiet, sky + band >= 30 % on top, near ground >= 15 % at the bottom, "the things live in the belt between" (365-368) | P-place + P-num, gated | calm, rest for the eye, room for the words; THE frame template (§2) |
| §4.4 R6 <= 6 named objects; the near frame <= 2 props cut by an edge, inside the shade mass within 8 L*; the far side within +-6 L* (369-372) | P-num + P-place, gated | simplicity after "our scene is very busy"; it emptied the near world |
| §4.4 R7 the focal's centre at y 860-1200, x 380-700, <= 0.2 W off x 520, 300-650 px under the caption block (373-375) | P-place, gated | the eye reads the words, then drops straight to the subject |
| §4.4 R8 one counterweight: the hero cloud, top right (376-377) | P-place | balance |
| §4.4 R9 edges found only at the focal (378-379) | T | edge hierarchy |
| §4.4 R10 the dark group 15-40 % at mean L* <= 45, >= 80 % in one or two masses below the band; up to ~45 % under L* 40 (380-383) | P-num + P-place, gated | depth, drama, "dark and contrast are great"; with the band light it can only be the near ground |
| §4.4 R11 the hot accent only at the focal, everything else tone-on-tone (dE <= 6-8) (384-385) | P-num | one place to look; it turns the life down to invisible |
| §4.4 R12 Pip tone-on-tone, >= 250 px from the focal, never on a leading line (386-388) | P-place + P-num | a find on a second look, never a rival |
| §4.4 "The focal moves only with the story" (389-390) | I + T | keep: the light follows the story |
| §4.5 one paper: tooth, fibre, mottle, soft-light; strengths by plane (392-401) | T | |
| §4.5 dead-flat <= 20 % (402) | P-num | one painted surface |
| §4.5 bitrate <= +30 %; the finest feature >= 2 px on a floating plane; <= 15 % in the band (402-405) | C | real mistakes (codec, twinkle, the words) |
| §5 the dose table by plane: near crisp, far painterly (406-432) | T | the owner's own balance as a tool: keep. Its near-frame row repeats R6 ("<= 2 props cut by an edge") |
| §6 the roadmap: scene 1's geometry (the sun at (195, 745), the horizon y 965, the door x 540-720), the cut list, five "Check:" blocks (434-561) | P-place (one scene) + P-num, gated (`check_v7.py`) | a plan for one iteration written in a shared guide; its checks are the v7 targets (§7) |
| §8 the clash log; the "Decided" note: T3 the key, the frontal wing, the dose ours (588-788) | log | the pass that pushed R1-R12 into DIRECTION and CRAFT |
| `organic/composition.md` §4 (R1-R12 with the references' measures), §5 the thumbnails T1-T3 | P (source) + C, diagnostic | the measures are good diagnostics; their ranges became the rules |
| `organic/shapes.md`, `techniques.md`, `light.md`, `libraries.md`, `organic_proof.md`, `light_proof.md` | T + C, diagnostic | research under the guide; they pass up the §4.1 targets and the dose table |
Count: I 3 / T 17 / P 20 (13 gated) / C 5.

### PAINT_RECIPES.md (+ `paint_recipes/`): the recipe book (asked for by the owner: "concrete detailed recipes")

Concrete by design and right to be: a recipe says how to paint a cloud well, never how much cloud a frame holds. Its
risks are the scene-1 values living inside the shared code and the references as the yardstick.
| Rule (line) | Kind | Serves / note |
|---|---|---|
| §1 items 1-10, the shared method: design first, one light and palette, passes soft to crisp, marks by intent, depth by plane, lost-and-found edges, the paper, real strokes, determinism, the never list (34-62) | T | keep as is; "calm stays calm (water >= 75 % unmarked, a shade zone <= 40 % covered)" (45) is a recipe dose |
| The depth ladder table (66-82); water's own ladder (84-88) | T | craft (aerial perspective); the near-frame row repeats R6's "<= 2 props inside the near shade mass" (74): a P-num copied in |
| §2 one line per element + "How close" to the references (90-146) | T + C, diagnostic | the references as a yardstick for the METHOD: fine; read as the bar for a frame it is the v7 trap |
| §2 "Overall": "our sky is L* 80-90 ... That halves the value drama" (139-144) | C, diagnostic | the observation that fed the low key (D3) |
| §3 C1-C18, the calls between the recipes (147-170) | T | one ladder, one function, one light table: keep |
| §3 C10 "must pass `master_check.py`'s cool share (>= 83 %)" (160) | P-num, gated | v2's cool-water look; a colour share as a gate (§6) |
| §4 painter v6: scene 1's boxes and values in the spec and in the module constants ("Scene 1's values are already theirs: sun (196, 779), horizon 792, caption band 317-556") (184-326) | P-place (one scene) | a scene's geometry left as the code's defaults: a next film starts from scene 1's sun unless it sets its own |
| §4.4 checks: determinism, the band's spread <= 1.5 L*, the canal's mark metric, the far city's dE caps, bake time (296-310) | C (+ T doses) | real checks plus recipe doses |
| `paint_recipes/*.md`: each element "at frame (x, y)" in a swatch box (e.g. built_ground 286, 354, 500) | T | swatch boxes, not placements; say so in each heading |
| `paint_recipes/people.md`: "only the one 'you' stands at a real size (~130-220 px tall)" (36-37) | P-num | the playbook's human viewpoint (§5) |
Count: I 0 / T 7 / P 3 (1 gated) / C 3.

### PEOPLE_DESIGN.md (+ `people_design/`): who they are, refined; how they act, thin

Five layers of status (IN USE overhaul, hair v4 UPDATE, IN USE direction C with LASH, "a draft until the owner
picks", §5 DRAFT direction A) say different things; the design craft is strong, the acting is one line.
| Rule (line) | Kind | Serves / note |
|---|---|---|
| The owner's brief: beautiful, pleasant, 20-30 today, generic faces, refined, clean, fluid (59-75) | I | keep at the top, alone |
| §1 the diagnosis; §2 research (76-119) | C, diagnostic + T | |
| §5.1 proportions (7.8 heads, the head <= 0.14 H, limb ratios) (192-211) | T | a drawing system: consistency is the point |
| §5.1 "visible neck ... slanting forward 10-15 degrees" (199) | T, stale | clashes with the playbook's upright neck (the "computer neck" note) |
| §5.2 shapes, finish, light; §5.4 hair; §5.5 wardrobe by setting; §5.6 palette (213-391) | T | |
| §5.3 "A face never looks at the camera" (248) | owner rule (C) | the owner's "open eyes that look away, never at us" |
| §5.3 "a front view is rare"; the >= 40 px close face "rare", "the owner's call" (249, 256) | P-num (a frequency) | people small and generic ("less of faces"); it rules out the close shot a feeling may need |
| §5.3 "Never: ... an open-eyed 3/4 face" (267) | T, stale | reversed by "Let's do open eyes" (the IN USE block) |
| §5.3 "no lip sync and no expressions: emotion lives in the pose and the head's angle" (270) | P | generic faces; it leaves the pose as the only actor, and §5.7 gives the pose one line |
| §5.7 the pose library: contrapposto in numbers, seven poses; "Never: pointing, waving, jumping, fist pumps, thumbs up, a presenter's open arms ..." (392-422) | T + C | the never list guards against the presenter cliché; "jumping" also bans joy |
| §5.7 "An acting beat (a reach, a shrug, a slump, a look up) is one clear pose, then back to calm" (400) | T, thin | the only acting rule: no gesture by beat, no acting the feeling |
| §5.8 sizes and detail by shot size (423-438) | T | a level-of-detail table: keep |
| §5.8 "Only the one 'you' (or the mascot) stands in the foreground; strangers stay small" (433) | P-place | one subject, the viewer's stake; it also keeps the near world free of people (with R6: empty) |
| Intro "Our people are mostly 130-220 px tall" (56, 73-74) | P-num | the human viewpoint (§5) |
Count: I 1 / T 9 / P 5 / C 2.

### TYPE_GUIDE.md: a type system (consistency is right) whose home seat fixes the frame's top

| Rule (line) | Kind | Serves / note |
|---|---|---|
| §a 1-8 principles: every spoken word in the voice's order, frame 0 the first words, the payoff by ~2 s; one hand; set into the picture; light and airy; pop in place, never clipped; read at a glance; never menacing; never twice or covered (6-14) | I + owner rules (C) | keep: these are the owner's duties for words |
| §b the type system: Gaegu, sizes, the lit hand, colours per tone (16-50) | T | one look, one brand |
| §c "The type frame: y 290-1250; x 96-944 ..."; the platform UI (54-56) | C | safe zones: a real mistake check |
| §c "the home anchor is the band (y 290-600) ... baselines 395 / 515 ... seats L 440, C 520, R 600 ... all ink in the band stays at y <= 585: the subject's top starts at ~590-600" (58-63) | P-place | words in one calm field, close to the subject; it fixes the top third of EVERY frame as sky and the subject under y 600 |
| §c by shot type: WIDE and MEDIUM "the subject's top stays at y >= 600"; CLOSE beside the subject only with a calm field >= 360 px; LOW only with a calm floor >= 300 px in y 950-1250 (65-75) | P-place | the words never fight the picture; it decides the picture from the words' seat |
| §c moving between groups: <= 220 px, baselines +-40 px, seats walked (77-83) | T + C | readability (an eye jump) |
| §d the motion system: the pop, the build, the bloom, the leave; the never list (85-100) | T + owner rules (C) | "captions pop in place" |
| §e R1-R10 recipes (102-246) | T | each with video 4's words as its worked example: a film-specific example inside the shared guide |
| §e quotas: R3 "1-2 per film", R6 "Once or twice per film", R7 "At most one per film" (135, 182, 197) | P-num | restraint, one system; a quota where the story should decide |
| §f checks 1-10: phone glance, type frame, >= 4.5:1, how many, how long, never clipped, frame 0 and the order, AI not Al, never twice, pleasant (248-269) | C | the model of a check list: every line is a real mistake |
Count: I 1 / T 5 / P 3 / C 4.

### COMPOSITION_SHOTS.md (+ `composition/`): a rich library of devices, wrapped in one frame template

The library itself (103 named devices, what each is for, the join chosen by what changes, the by-emotion table) is the
TOOL the owner asked for. Around it sit the every-shot grammar, the "five numbers every shot keeps", 25 coordinate
recipes, lead quotas, and a ranking whose FIT lens scored each idea against our own zones.
| Rule (line) | Kind | Serves / note |
|---|---|---|
| The library: 103 entries (67 frames, 17 moves, 19 joins), the owner's 58 first; each device's name, reference and job (1-6; `catalogue_detail.md`) | T | the toolbox proper: keep every device |
| Part 0 tiers by three blind judges; §0.2 one sum rule (100-131) | P (a ranking that decides reach) | proven tools first. The FIT judge was "grounded in DIRECTION, CRAFT a-g, LAYOUT 1-4 and 8, CINEMATIC_GUIDE, ORGANIC 4.4 (R1-R12)": "WHAT LIFTS FIT: devices our zones already encode ... WHAT LOWERS IT: anything that must cross the band y 290-600" (`judges/fit.json` notes): our prescriptions ranked the owner's ideas |
| §0.1 the override table: 14 of the owner's 41 ideas RARE or NOT FOR US (thirds, golden section, golden triangle, parallels, diagonal, double diagonal, spiral, circular, foreground, pyramid, juxtaposition, the soft near layer, the golden spiral, balance) (67-98) | P | "one place to look"; the burden is put on the owner ("To overrule one, one line is enough") |
| §0.3a "Used in every shot: the frame's grammar", 13 rows: the golden box x 413-667, y 951-1187; the near hint >= 2 things cut by the edges, <= 2 props, top at y 1450-1650; one counterweight x < 240 or > 840; the hot accent ~3-5 %; the focal near (540, 960); the words y 290-600 and the story y 600-1520; the horizon A or B; the focal 300-450 px under y 556; 4-6 planes; the notan step >= 65 L* (132-151) | P-place (part gated: CRAFT §b's WARN) | one coherent house frame; it IS the template (§2 item 1) |
| §0.3-0.5 each entry's "use it when (the condition, the dose)" in numbers: B1 "2-3 legs of >= 150 px at 40-60 degrees ending within 40 px of the focal's box"; B2 "the vanishing point on the subject (within 60 px)"; C1 "one opening 15-30 % of the frame on the axis"; D1 "the subject 130-220 px at the foot of a 60-80 % patterned field"; E2 "the aperture L* >= 95, the figure L* <= 28" (153-327) | T + P-num | how to use each device well; the numbers fix ONE execution per device ("there are million ways to build a scene with vanishing point composition") |
| Part 0b §0 the planning card: "One recipe per shot, picked by its beat ... A beat that fits no recipe is a story question before it is a picture question" (341-366) | P | coherent, buildable shots; it caps the pictures at 25 recipes and turns a new picture into a story problem |
| Part 0b §0 "The five numbers every shot keeps": the focal within 130 px of x 540 at y 951-1006; the drop 300-450 px under y 556; the band y 290-600, every top at y >= 620; the read window; one onset a beat (365-373) | P-place; the read window a C | the eye drops from the words to the subject; the read window is a real UI check |
| Part 0b §0 the join by what changes (375-389) | T | the best rule in the doc: the join from what changes |
| Part 0b §0 the dose per film: 6-9 leads, "exactly 1" big move (S5 or S1), RM4 2-4, light events 1-3, J2 1-3 ... (391-416) | P-num (quotas) | variety and restraint; the owner-set doses ("one big move a film") are his, the rest are ours |
| Part 0b §1 by story beat (420-431) | T + P-num | beat -> tools is right; its "in numbers" column fixes one execution |
| Part 0b §1 by emotion: wonder, warmth, tension, surprise, calm -> frame, move, join (433-439) | I + T | the right shape: lead with it |
| Part 0b §2 sequencing: shots >= 3.5 s average, an event every ~1.5-3 s, variety by size or device, the intensity curve, where to rest (443-481) | T | rhythm craft: keep |
| Part 0b §2 item 3: "6-9 different leads, >= 7 in 10 shots led by a CORE device, at most 2 RARE (each once), never a NOT FOR US one" (453-457) | P-num | variety over proven tools; it makes the tiers a quota |
| Rule 1 design for the window the phone shows (539-543) | C | real: the feed's interface covers it |
| Rule 2 three stacked pictures: the words' sky y 0-600 ("no tops, lines, heads, props or shadow edges across it"), the stage y 600-1520, the near band y 1250-1920 "one quiet mass" (544-549) | P-place | the words always clear, depth up the frame; THE template |
| Rule 3 the focal on x 380-700, within 130 px of x 540, at y 951-1006 (allowed 860-1200), the drop 300-450 px (550-555) | P-place, gated (CRAFT §b WARN) | the eye drops from the words to the subject |
| Rule 4 the focal = subject + story light + hardest step (>= 65 L*); the hot accent ~3-5 %; <= 3 calls (556-561) | P-num, gated | one place to look |
| Rule 5 the notan: three masses >= 85 %, <= 10 pieces, <= 6 named objects, >= 65 % quiet in two fields (562-567) | P-num + P-place, gated | simple and calm (ORGANIC R1-R6 again) |
| Rule 6 the horizon: setup A y 1150-1300 or B y 690-860, never y 900-1020 (568-572) | P-place | the horizon off the half (a classic tool) fixed to two bands |
| Rule 7 the "you": 130-220 px, from behind or in silhouette, at x 130-380 facing right or x 700-830 left; strangers >= 220 px from the subject (573-580) | P-place + P-num | the viewer's stake; scale |
| Rule 8 one device per shot, delivering the eye: lines 2-3 legs >= 150 px at 40-60 degrees; the VP within 60 px; an inner frame 15-30 % (581-587) | T + P-num | |
| Rule 9 one soft counterweight >= 300 px out (x < 240 or > 840), "by default the hero cloud in the top gutter" (588-591) | P-place | balance (the steelyard) |
| Rule 10 the near frame: ">= 2 things cut by the frame's edges in every shot"; <= 2 props, top at y 1450-1650; one framing mass <= 216 px (592-596) | P-place + P-num | depth without clutter; with rule 5 it empties the near world |
| Rule 11 sizes step 2-3x: wide 15-35 % of the height, medium 270-460 px, close >= 650 px (597-603) | T + P-num | clear size changes |
| Rules 12-20: a move is three designed frames; onsets; one signal on its word; event rate; the move from the device; every move has a story reason; the eye across a join (<= 220 px); ease and pace (604-657) | T + C | motion craft; the speed budget and the eye jump are real checks |
| Rule 21 sound: 4-5 hard syncs in the hook, then <= 1 per 10 s, one release (658-666) | P-num | SOUND_SYNC's shape (below) |
| Rule 22 check it cheaply: the flash test, an onset map, the speed check (667-672) | C | the flash test ("what is it, where did you look?") is a feeling-first check: keep |
| Part 2 §0 the frame in numbers: the feed's zones; the grid lines; the two camera setups; the horizon-cut rule; the side-on scale ceiling (682-733) | C (zones) + T (the horizon-cut rule is perspective) + P-place (the setups' bands) | |
| Part 2 §2 SR1-SR25 index: each with a horizon y, a focal box and a size (738-784) | P-place | one layout per beat |
| `composition/recipes.md` SR1-SR25: each Layout in coordinates (masses, quiet areas, the eye's path); SR2 "HOME ACROSS THE WATER": "Scene 1: as BUILT in painter v7 ... T3's values" (47-78) | P-place | each a fixed frame; SR2 now names the v7 frame (the one that lost the feeling) as its worked example, and "the far side's people ... texture in their band (within +-6 L*)" |
| `composition/catalogue_detail.md`: every entry with its reference (the reel and time), what it is, "where it sits in our 1080 x 1920 frame" | T + P-place | the description is the tool; the frame position is a placement |
| `composition/library_clashes.md`: 32 rows, 14 "open since the first library ... the owner's to settle" | log | the symptom of a numbers toolbox: three sizes of "you" (rows 4, 11, 30), three default horizons (3, 5), two push floors (10, 31) |
Count: I 1 / T 10 / P 22 (5 gated) / C 5.

### SOUND_SYNC.md (+ `sound_sync/`): the best-shaped guide, with one fixed arc

Each device has "Is / Says / Timing / Build" (a tool with its meaning), the library is ranked, there is a by-emotion
table, a never list and a check list of real mistakes. Its one box is the film-wide shape.
| Rule (line) | Kind | Serves / note |
|---|---|---|
| "Spend sync, don't sprinkle it" (10) | I + T | sync has impact only by contrast: keep |
| "One shape per film: a quiet floor; a count of three ... a fourth that comes a little late (the hook); rest ...; ONE release at the payoff ... in a written voice pause >= 0.8 s" (11) | P | a hook that hits, rest while explaining, a felt payoff; a formula from two reels, the same arc for every film whatever its feeling |
| "A hard sync is one short sound on one discrete change ... on that change's first VISIBLE frame or up to 2 f after it, never before" (12) | C + T | perception: a sound before its picture is noticed (a real mistake) |
| "Heard or cut, and sized like its gesture" (13) | C + T | an unheard cue is a real mistake; "sized like its gesture" is a tool |
| "Sync is story structure: planned at G1 ..." (14) | T (process) | |
| §1a S1-S13 and §1b O1-O8, each "Is / Says / Timing / Build" (43-271) | T | the model shape for a device: what it IS, what it SAYS (the feeling), when |
| §1c building them in Remotion (272-320) | T | |
| §2 ranked: Core / Situational / Rare / Rejected, each with a dose (321-353) | T + P-num | the doses ("3 sounded changes and a late fourth by ~2.4 s" for every film) |
| §2 Rejected X1-X9: mickey-mousing, sound on continuous motion, a whoosh on every join, the beat grid, speed ramps, sound early, a release under speech, a fourth equal hit, a sound on every caption (345-353) | C (taste guards) | each names the failure it prevents: keep |
| §3a by story beat, with hard-sync counts per beat (357-370) | T + P-num | |
| §3b by emotion: quick, calm, tension, relief, gravity, a joke's button (371-381) | I + T | the feeling-first table: lead with it |
| §3c density: "4-5 hard sync points, all inside the hook's ~2.5 s; the middle <= 1 per 10 s; the payoff 1-2; a 40 s film ~8-12" (382-394) | P-num ("EST") | spend, rest, release; an estimate from two reels written as a budget |
| §3d never sync (395-407) | C | real mistakes (masking the voice, two sounds on one change) |
| §4 the gates; the sync check list 1-8 (409-439) | C + P-num | items 2, 3, 5 are real checks; item 4 "(S) The spend: the hook holds 4-5 ... the middle <= 1 per 10 s; exactly one release" turns the arc into a scripted gate once `sync_check.py` exists |
| §4b the audit's fix-first list (441-467) | C, diagnostic | |
Count: I 3 / T 8 / P 4 / C 6.

(The remaining docs' tables follow below as they are finished.)

## 2. The worst over-prescriptions

(pending)

## 3. Gaps

(pending)

## 4. Duplicates and contradictions

(pending)

## 5. Owner rules: intents vs hard constraints

(pending)

## 6. The checkers that gate on look numbers

(pending)

## 7. The v7 lesson

Sources: `docs/studies/2026-10-28_city_posters/paint_test/NOTES.md` (v7a, "The owner on v7", v7), `v7_checks.json`,
`ORGANIC.md` §4 and §6 (the steps and their checks), `D3_RECONCILE.md`; the still `paint_still_v7.png` looked at
beside v6 and v7a at 400 px wide.

**The beat.** Scene 1 is the film's first frame and its hook: "She quit Google." (the voice tag: quiet disbelief, like
news about a friend you can't quite believe). What the frame owes the viewer: HER, a person stepping out of the
building that defined her into her own evening, a surprising, slightly defiant step, with the city going on around her
(the first 3 s "a banger", CLAUDE.md). No brief, step or check of painter v7 wrote that feeling down; ORGANIC §6 is
five steps, each ending in "Check:" (numbers) and an "Eye" line that judges against the references ("at 400 px beside
refs 03 and 02", a beach at dusk and a bus stop at night: two solitary, low-key paintings), never against the beat.

**The numbers v7 was built to** (all met but one; v7's value in brackets):
| # | Number (where it lives) | Kind | v7 | What it did to the frame |
|---|---|---|---|---|
| 1 | Up to ~45 % of the frame under L* 40, T3's "references' low key" (CRAFT §f.8, DIRECTION 6, ORGANIC R10, playbook "A full value range"; D3) | P-num | 43 % | brought the references' mood (night, solitude) with their key; the frame's median fell to L* 44 |
| 2 | R10: the dark group 15-40 % at mean L* <= 45, >= 80 % of it in one or two masses BELOW the band (ORGANIC §4.4; `composition_study.py` WARN) | P-num, gated | 28 % at 27, 92 % in two | with the band kept light, the only place a dark mass can go is the near ground: the quay became it |
| 3 | R5: >= 65 % quiet at a squint, sky + band >= 30 % on top, near ground >= 15 % at the bottom, "the things live in the belt between" (ORGANIC §4.4, gated) | P-place + P-num | 74 % (33 + 29) | wrote the empty near ground into the layout: the 40 % nearest the viewer may hold nothing |
| 4 | R6: <= 6 named objects; the near frame <= 2 props, cut by an edge, inside the shade mass within 8 L* (gated; step 4's cut list) | P-num | 1 table + 1 chair in the dark | the cut took out every near and mid thing that lived (tree, planter, crates, bench, the boater, the duck, the cat, boat B) |
| 5 | R2: <= 10 value pieces (gated) | P-num | 16 (the one WARN) | vetoed new life: "Near nature: not added ... one more value piece (R2) for no gain in depth"; "calm the far towpath's bollards into their band" |
| 6 | R3 / R11: <= 3 calls, one rival; the hot accent only at the focal; the far towpath's life tone-on-tone within +-6 L* (gated) | P-num | 2 (1) / 2 (1) | every other light and person turned down to tone-on-tone: the life is there but cannot be seen |
| 7 | R4: the door L* >= 95, her L* <= 28, a step >= 65 L* (gated) | P-num | her 25 | she became a dark sliver against the door: the subject reads as a silhouette, not a person |
| 8 | R7: the focal's centre at y 860-1200, x 380-700, 300-650 px under the caption block; her 152 px "v2's size"; v2's camera kept (gated) | P-place | 0.120 H | her moment stays a ~56 px figure (152 px at 1080) in the middle distance at 400 px wide: "the life and action is rather on the background" |
| 9 | R8: one counterweight, the hero cloud top right | P-place | kept | the same frame furniture as every other test frame |
| 10 | Razor <= 8 %, straight runs <= 15 %, dead-flat <= 20 % (ORGANIC §4.1's targets; step 3's check) | P-num | 7.3 / 11.7 / 17.2 % | the effort went into making the empty quay organic (18 puddles, 153 strokes along the perspective, broken joints): the emptiness got beautiful, nobody asked if it should be empty |
| 11 | The brightest 5 % within 0.07-0.15 H of her; the lobby >= +25 L* over the facade; the door's p95 >= 95 (step 2) | P-num | 0.120 H / +32 / 94 | the eye goes to the door (right) but the door is small and far |
| 12 | Off-family colour <= 3 %; the hottest 1 % all at the door; the band flat (spread <= 1.5), the words >= 7:1 | P-num; the band and the words a CHECK | 0.5 % / 100 % / 1.34 / 9:1 | the colour key is a good TOOL; the words' contrast is a real check and passed |

**The feeling they cost.** Each rule was written FOR a feeling the owner asked for ("our scene is very busy": one place
to look; "dark and contrast are great"; "too square and proper": painted, organic), and each became a number. Built
together, the numbers decide one picture: a light sky with the words, a lit door in the middle, and a big dark quiet
floor below; the beat's own feeling had no number, so nothing defended it. What was lost, in the owner's words: "we lost
the feeling ... the scene now is about a dark alley whete nothing happens but the life and action is rather on the
background". Rule by rule:
- **Mood**: rules 1-2 imported the references' night and solitude (a key is a mood) into a beat of surprising news and a
  bold step; nobody asked which key THIS beat's feeling wants.
- **Life**: rules 4-6 answered "too busy" with emptiness (counts and caps), where the answer to busy is ORGANISATION
  (the life arranged around her, leading to her, quiet near the words): "alive but calm" (DIRECTION) became calm only.
- **The subject**: rules 3, 7 and 8 kept her small, far and dark, because the template puts the quiet ground nearest
  the camera and the focal in the belt; the viewer stands on an empty floor looking at a speck.
- **Effort**: rule 10 sent the biggest step's effort to a surface with nothing on it.
- **Judgement**: the sheet was a numbers table plus "beside refs 03 and 02"; the references became the bar for the
  frame, the exact thing the playbook bans for past films ("it boxes the imagination in").

**What v7 proves is worth keeping** (the owner: "it does look better overall"; "keep all the stylistic tooling"): the
colour key at the source, the light solve (one story light, named casters, the door's path coming to us), the painter
by intent (MyPaint marks, lost-and-found edges), the paper, the people overhaul. Every one of them is a TOOL; what
failed is the numbers they were aimed at, and the missing first question: what should this frame make you feel?
