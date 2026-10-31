# Toolbox audit: intents, tools, prescriptions, checks (2026-10-30)

**Status: DONE** (2026-10-30, ~22:50 UTC). Brief: `video/docs/process/BRIEF.md`. Line numbers are the files' as of
~22:30 UTC: the playbook, PIPELINE_V2, DIRECTION, CINEMATIC_GUIDE and LIFE_AND_DENSITY were being edited by other
sessions while this ran, so every citation also names its rule, row or words. Paths are from `video/docs/` (look docs by
name; `composition/`, `organic/`, `people_design/` are under `look/`). Nothing here points at a film of ours as a bar or
an example; video 4's own docs appear only as the brief's worked example of what goes wrong.

**The four kinds** (the brief's): **INTENT**, a feeling or goal the viewer should get; **TOOL**, a visual means that
creates an intent; **PRESCRIPTION**, a concrete placement or a fixed number that decides the picture; **CHECK**, a test
that a mistake did not happen. Two more for counting: **OTHER** (status lines, logs, the owner's quotes kept as
evidence, file lists, sources, code) and **PAIRED** (a tool line that also names the feeling it makes: the shape the
owner asks for, "a feel of distance" made with "layers").

## In one screen
1. **The guides are tools and numbers, rarely feelings.** Of 5,066 rule lines in the 20 guides, 9 % state a feeling, 42 %
   a tool, 24 % a prescription, 25 % a check; only 9 % pair a tool with the feeling it makes. Video 4's four docs: 3 %
   feeling, 42 % prescription. The feelings live at the top (the owner's words, the rule titles) and at the bottom (the
   research notes say what a device does: a foreground "gives depth and a place to stand", composition/reels.md 169); in
   between, the library, the layout and the film docs turn them into coordinates.
2. **The worst prescriptions add up to ONE frame, enforced by numbers and lint:** the focal in a 254 x 236 px "golden
   box" at the frame's centre in every shot; the frame as three stacked bands (the sky with the caption band >= 30 % on
   top, a belt of things, a quiet near ground >= 15 % at the bottom, >= 65 % quiet, <= 6 named objects); one of two
   horizon heights per set; the "you" at x 130-380 facing in; the hero cloud in a top corner as the counterweight; one
   of two named big moves. Video 4 applied them faithfully: 10 of its 12 focals sit at x 540-600, y 930-1150
   (camera_plan_g3 415-418), and its "~45-50 % sky, ~35 % open snow" (WORLD_BIBLE 165) became "each house is so alone".
3. **Gaps:** nothing teaches the IDEA (how to invent a readable picture for a beat); no shared vocabulary of FEELINGS
   (three partial lists in three docs); nothing on people ACTING (the pose as the beat), SHAPE LANGUAGE as meaning, a
   COLOUR AND VALUE SCRIPT as emotion (only video 4's world bible has one), or RICHNESS (three scales of detail, new in
   the playbook today). The card the frame loop builds from (`look/FRAME_CARD.md`, PIPELINE_V2 93) does not exist, so
   every brief picks its own subset of ~10,000 lines.
4. **Contradictions:** the old loop (visual script first, grey placeholders, G5 fills the masks) still runs in CLAUDE.md,
   DIRECTION, PIPELINE_V2's gate table, G3_ANIMATIC, STORYBOARD_STYLE and LIFE_AND_DENSITY; the darks carry five numbers;
   the "you" has two sizes; faces, the neck and the people direction differ between the playbook and PEOPLE_DESIGN's
   body; the caption block has two y ranges; "never stacked flat bands" sits beside rules that stack the frame in bands.
5. **Owner rules:** almost all are intents with one hard constraint inside (§5). Many of OUR numbers ride on them as if
   they were the owner's ("~130-220 px", ">= 65 % quiet", "6-10 % darks", "S1 or S5"): keep the owner's words as the
   intent, our numbers as labelled examples or checks.

## Method
- **Read in full:** the playbook, DIRECTION, CRAFT, LAYOUT, COMPOSITION_SHOTS, CINEMATIC_GUIDE, COZY_AND_SCALE,
  LIFE_AND_DENSITY, PALETTE, ORGANIC, PAINT_RECIPES, PEOPLE_DESIGN (§5.5-5.10 by search), TYPE_GUIDE, PIPELINE_V2,
  CREATIVE_BRIEF, video 4's WORLD_BIBLE §0-1.8, VISUAL_SCRIPT's overview, camera_plan_g3's §1 and §4, THROUGHLINE's head.
  **By sections and search:** SOUND_SYNC, STORYBOARD_STYLE, EDGES, G3_ANIMATIC, G5_BLOCKING, the 26 notes in
  `composition/`, `organic/` and `people_design/` (openings, rule sections, tables), video 4's OWNER_NOTES and its ideas
  BRIEF.
- **Counts:** every content line classified by a small script (kept in this session's scratchpad, not the repo). A
  placement (screen coordinates, an x or y position, a share of the frame) is a PRESCRIPTION, and so is a fixed value
  with a unit (px, %, L*, s, frames, a hex) unless it is a threshold; a threshold, test, lint or ban is a CHECK; a named
  visual means is a TOOL; a feeling or goal with no means is an INTENT; quotes, logs, sources and code are OTHER. The unit
  is the line, so every count keeps its line number.
- **How far to trust the counts:** two hand checks of 50 random lines each: 56 % right on the first rules, 70 % after
  one refinement. Most misses are quotes and logs counted as rules, and the edge between a prescription and a check. Read
  the SHARES and the ranking, not the units. The typical lines in §1 are picked by hand.

## 1. Per-doc tables

### 1.0 All docs at a glance (machine count; "share" = of the doc's rule lines, OTHER left out)
| doc | lines | INTENT | TOOL | PRESCR. | CHECK | OTHER | PAIRED | prescr. share | lines naming a feeling |
|---|---|---|---|---|---|---|---|---|---|
| OWNER_PLAYBOOK | 1050 | 153 | 287 | 29 | 94 | 487 | 99 | 5 % | 25 % |
| look/DIRECTION | 289 | 20 | 146 | 9 | 27 | 87 | 45 | 4 % | 24 % |
| look/CRAFT | 569 | 16 | 206 | 104 | 127 | 116 | 27 | 23 % | 13 % |
| look/LAYOUT | 304 | 6 | 67 | 47 | 71 | 113 | 13 | 25 % | 14 % |
| look/COMPOSITION_SHOTS | 691 | 14 | 188 | 162 | 154 | 173 | 46 | 31 % | 18 % |
| look/CINEMATIC_GUIDE | 255 | 11 | 72 | 83 | 33 | 56 | 11 | 42 % | 14 % |
| look/COZY_AND_SCALE | 376 | 15 | 89 | 97 | 82 | 93 | 26 | 34 % | 23 % |
| look/LIFE_AND_DENSITY | 243 | 21 | 64 | 33 | 48 | 77 | 20 | 20 % | 27 % |
| look/PALETTE | 164 | 11 | 63 | 16 | 15 | 59 | 14 | 15 % | 19 % |
| look/ORGANIC | 693 | 6 | 175 | 134 | 119 | 259 | 25 | 31 % | 9 % |
| look/PAINT_RECIPES | 277 | 0 | 76 | 55 | 31 | 115 | 4 | 34 % | 8 % |
| look/PEOPLE_DESIGN | 425 | 28 | 112 | 84 | 44 | 157 | 23 | 31 % | 15 % |
| look/TYPE_GUIDE | 340 | 15 | 60 | 120 | 56 | 89 | 21 | 48 % | 15 % |
| look/SOUND_SYNC | 440 | 12 | 106 | 127 | 60 | 135 | 26 | 42 % | 15 % |
| look/STORYBOARD_STYLE | 268 | 14 | 101 | 44 | 50 | 59 | 22 | 21 % | 19 % |
| EDGES | 345 | 9 | 87 | 48 | 55 | 146 | 15 | 24 % | 12 % |
| PIPELINE_V2 | 388 | 31 | 64 | 10 | 74 | 209 | 24 | 6 % | 18 % |
| G3_ANIMATIC | 226 | 12 | 77 | 6 | 68 | 63 | 14 | 4 % | 16 % |
| G5_BLOCKING | 314 | 12 | 57 | 14 | 71 | 160 | 5 | 9 % | 8 % |
| CREATIVE_BRIEF | 162 | 38 | 8 | 5 | 11 | 100 | 1 | 8 % | 25 % |
| **the 20 guides** | **6,819** | **444 (9 %)** | **2,105 (42 %)** | **1,227 (24 %)** | **1,290 (25 %)** | 2,753 | **481 (9 %)** | | |
| v4/WORLD_BIBLE | 515 | 8 | 166 | 182 | 38 | 121 | 19 | 46 % | 8 % |
| v4/visual/VISUAL_SCRIPT | 248 | 8 | 116 | 43 | 16 | 65 | 40 | 23 % | 26 % |
| v4/camera_plan_g3 | 400 | 5 | 98 | 155 | 23 | 119 | 12 | 55 % | 11 % |
| v4/THROUGHLINE | 179 | 5 | 47 | 26 | 20 | 81 | 3 | 27 % | 6 % |
| `composition/` (11 notes) | 5,322 | 276 (8 %) | 1,353 (42 %) | 1,097 (34 %) | 526 (16 %) | 2,070 | 279 | | |
| `organic/` (7 notes) | 2,381 | 31 (2 %) | 793 (48 %) | 558 (34 %) | 279 (17 %) | 720 | 120 | | |
| `people_design/` (8 notes) | 2,121 | 102 (10 %) | 442 (41 %) | 421 (39 %) | 106 (10 %) | 1,050 | 65 | | |

The pattern: the docs that decide a frame (TYPE_GUIDE, CINEMATIC_GUIDE, SOUND_SYNC, COZY_AND_SCALE, COMPOSITION_SHOTS,
LAYOUT, the research notes, video 4's world bible and camera plan) run at 25-55 % prescriptions; the docs that name
feelings (the playbook, DIRECTION, CREATIVE_BRIEF) decide almost nothing about where things go. No doc above 30 %
prescriptions names a feeling on more than a quarter of its lines.

### 1.1 OWNER_PLAYBOOK
| kind (count) | typical lines |
|---|---|
| INTENT (153) | 25 "Every frame is worth pausing on ... would a viewer stop scrolling to look at it longer?"; 411 "Every scene must FEEL ALIVE, calm and tiered: that is the key, not an object count"; 545 "The words are PLEASANT to look at: soft, warm and calm, never menacing" |
| TOOL (287) | 75-79 "a feel of distance" is the intent, "layers (near, mid, far), overlap and atmosphere are the tools"; 398-399 "values grouped into a few big masses, one focal point with the most contrast and the story light, negative space"; 366-367 the float: "its planes move by depth" |
| PRESCRIPTION (29) | 349 "~130-220 px tall in our 1080 x 1920 frame"; 560 "6-10 % of the frame under L* 40"; 494 "near heads <= ~140 px" |
| CHECK (94) | 727 "check every on-screen word at 0.25 scale"; 680 "Every frame at least 8/10, no dead frames"; 253 "Mix to -14 LUFS / -1 dBTP, voice always on top" |

### 1.2 look/DIRECTION
| kind (count) | typical lines |
|---|---|
| INTENT (20) | 7 "one flowing story about one thing, in a full, calm, cozy world"; 96 "Alive but calm: full, never empty, never busy" |
| TOOL (146) | 84-86 "values grouped into a few big masses (a 2- and 3-value notan first); ONE focal, where the subject, the story light and the hardest value step meet"; 147 "ONE story light per scene, on the subject" |
| PRESCRIPTION (9) | 100-101 "the sky with the caption band at the top and the near ground at the bottom"; 188-189 "the film's ONE big move (S1 rise-over or ... S5 ... a 2.6 s move + a 0.7 s hold)"; 174 "Money and everyday life: #9 Autumn Ember" |
| CHECK (27) | 66 the thread "on screen >= 80 %, no gap over 3 s"; 87 "<= 6 named objects at phone size" |

### 1.3 look/CRAFT
| kind (count) | typical lines |
|---|---|
| INTENT (16) | 87 "Alive but subtle: supporting life ... never stops ... but stays small, slow and low in contrast"; 394 "every shot reads in distance, never a flat elevation" |
| TOOL (206) | 424 "Separation: the subject never shares a value with what is right behind it ... overlap, never a tangent"; 262 "One light rig per set, decided with the story (the key is where the eye goes)" |
| PRESCRIPTION (104) | 271-273 "Night interior (L*): bulb or screen 95-98 ... ambient wall 80-84 ... desk 58-62"; 348 "night interior 20-30 % lit (pool and wash), 45-60 % ambient, 10-20 % shadow shapes"; 405 "k = 0 / .12 / .22 / .40 / .65 on every fill of the plane" |
| CHECK (127) | 66-67 "at most 2 are F; the thread's screen time ... >= 80 % ... These two are the FAILs"; 128 "<= 3 regions pull at >= 50 % of the strongest"; 523 "Three FAILs": no air, melts, elevation |

### 1.4 look/LAYOUT
| kind (count) | typical lines |
|---|---|
| INTENT (6) | 94 "Enclosure: held, not shut"; 122 "Where the calm goes" |
| TOOL (67) | 107 "Leading lines ... the ground's joints and kerbs run to the VP; one long sight line, ended by one object"; 92-93 "before left, after right; more goes up or taller; time runs left to right" |
| PRESCRIPTION (47) | 50 "subject axis and box | x 380-700; the subject 270-460 px wide"; 76 "RIVERSIDE sky and skyline 0-290, one flat far row 290-600, facades 600-1000, dark belt to 1115"; 83 "a ~650 px disc at (580, 1060)" |
| CHECK (71) | 42 "platform UI (organic) | top y < 180; bottom y > 1520; right rail x > 950"; 46 "every word >= 4.5:1 on its field" |

### 1.5 look/COMPOSITION_SHOTS
| kind (count) | typical lines |
|---|---|
| INTENT (14) | 433-441 "By emotion": wonder ("bigger than you thought"), warmth, tension, surprise, calm; 348 "A beat that fits no recipe is a story question before it is a picture question" |
| TOOL (188) | 484-486 "a frame's device already holds its motion. Lines are a path, an opening is a portal ... a quiet field is a hold"; 166 "E2 The lit opening | the subject's moment, home, a destination" |
| PRESCRIPTION (162) | 369 "the focal's home | within 130 px of x 540, at y 951-1006 ... inside the golden box"; 141 "the near frame <= 2 props with its top at y 1450-1650"; 573-575 the "you" "at x 130-380 facing right or x 700-830 facing left" |
| CHECK (154) | 562-564 "the three largest masses hold >= 85 % ... <= 10 value pieces; <= 6 named objects"; 622 "every change leaves its new state on screen >= 0.5 s" |

### 1.6 look/CINEMATIC_GUIDE
| kind (count) | typical lines |
|---|---|
| INTENT (11) | 173 "Scale is felt, not counted"; 118 "the film's ONE big reveal, from the viewer's small world to the vast system" |
| TOOL (72) | 175 "The world keeps going: nothing ENDS inside the frame"; 210 "Tiny anchors, lines up" |
| PRESCRIPTION (83) | 72 "Disc ~650 px wide, centred at (580, 1060), top at y ~735"; 141 "Start (u = 0): sky y 0-840; horizon 0.44 H, seen only through a slot at x 240-600" |
| CHECK (33) | 164 the speed budget "~15 px/frame, a WARN"; 229 the scale checklist ("nothing ends inside the frame | 5-7 planes 2.2-3x apart") |

### 1.7 look/COZY_AND_SCALE
| kind (count) | typical lines |
|---|---|
| INTENT (15) | 107 "A recipe for a FEELING: safe, held, unhurried, among people"; 15 "Cozy = held, not shut" |
| TOOL (89) | 15-16 "walls on 2-3 sides, ONE opening the subject faces, the threat visible but outside it (prospect-refuge)"; 96-97 "inside rounded ..., outside rectilinear and hard ... The threat is never cute"; 376 "K2 Tilt-up reveal | 'it keeps going'" |
| PRESCRIPTION (97) | 142 "RIVERSIDE | ... sky + skyline 0-290, flat far row 290-600, facade belt 600-1000, dark belt to 1115, lane to 1230, bank to 1420"; 190 "Seated ~85 px (0.045 H), standing ~140 px" |
| CHECK (82) | 40 "canyon | >= 2:1 | sky <= 10 %"; 315 "Check a cozy shot (phone size, sound off)" |

### 1.8 look/LIFE_AND_DENSITY
| kind (count) | typical lines |
|---|---|
| INTENT (21) | 5 "Feeling alive is the goal; the numbers are a warning signal, never a quota" |
| TOOL (64) | 41 "A field MADE of things, never things ON a field"; 49 "stacked, not spread: depth by overlap" |
| PRESCRIPTION (33) | 148 the one "you" "(head 90-140 px ...)"; 150 "Mid walkers: 110-260 px tall"; 121 a dressing inventory by setting (a menu of things) |
| CHECK (48) | 36 "No hole bigger than the caption band"; 63 DENSE-CALM "flat <= 30 %, detail >= 33 %, obj >= 120" |

### 1.9 look/PALETTE
| kind (count) | typical lines |
|---|---|
| INTENT (11) | 4 the owner: "very soft, nice, warm, no screaming colours" |
| TOOL (63) | 104 "colours keep their jobs: hero = what the story is about, anchor = weight, pop = 'look here'"; 106 "add a colour when the story needs one ... and give it a role" |
| PRESCRIPTION (16) | 60 the background "fills 50-80 % of the frame"; 95 "#9 Autumn Ember ... money, everyday life" |
| CHECK (15) | 77 "at most one hot pop (C >= 50): 1-3 %"; 71-72 the ink "At least 7:1 contrast on the background" |

### 1.10 look/ORGANIC
| kind (count) | typical lines |
|---|---|
| INTENT (6) | 406-409 near "found edges, the finest marks"; far "more like brushes and painting"; 136-138 "a filter run over our flat design reads as a filter ... 'paint the bush'" |
| TOOL (175) | 145 "Lost-and-found edges by intent: hardness from the value step, the light, the tier and the plane"; 202 "Natural shapes ... are free curves, never compass arcs" |
| PRESCRIPTION (134) | 364-367 R5 ">= 65 % ... the sky with the caption band (>= 30 %) at the top and the near ground (>= 15 %) at the bottom"; 375 R8 "the hero cloud, top right"; 470 "the sun in frame at (195, 745), r 20, the horizon at y 965" |
| CHECK (119) | 276-278 razor edges <= 8 %, straight runs <= 15 %, dead-flat <= 20 %; 359 R3 "<= 3 regions pull at >= 50 %" |

### 1.11 look/PAINT_RECIPES
| kind (count) | typical lines |
|---|---|
| INTENT (0) | none by the count; its feeling is the owner's quoted method (5-8: "brush it and perhaps draw them in layers a bit more blurry each time") |
| TOOL (76) | 40-43 "Passes, soft to crisp, each blurred less than the last"; 44 "Marks by intent ... where the form turns, along the light edge, where weather runs" |
| PRESCRIPTION (55) | 100 the sky "zenith L* 80.9, field 82.0 (flat over y 317-556)"; 232 "sun (196, 779), horizon 792" |
| CHECK (31) | 306 "The canal: calm >= 75 %, marks 3-9 %"; 307 "+4 within dE 10 of its air" |

### 1.12 look/PEOPLE_DESIGN
| kind (count) | typical lines |
|---|---|
| INTENT (28) | 71-72 "people must be beautiful and pleasant, dressed and styled like cool 20-30-year-olds"; 471 "Beauty is in the restraint" |
| TOOL (112) | 104-106 "dark at the feet, light at the chest and face ... one big value shape per person"; 107 "Hair is the face from behind" |
| PRESCRIPTION (84) | 196 "skull ... 0.125-0.128 H (7.8-8.0 heads)"; 199 "visible neck ... slanting forward 10-15 degrees" |
| CHECK (44) | 222 "The silhouette test: filled black at its real size"; 211 "a crowd of six has at least four silhouettes" |

### 1.13 look/TYPE_GUIDE
| kind (count) | typical lines |
|---|---|
| INTENT (15) | 13 "Never the template, never menacing ... every word calm and friendly at a glance"; 327 "big enough to stop a thumb, still calm" |
| TOOL (60) | 10 "Light and airy, never boxed ... the stressed word is LIT by the film's warm light"; 36 "The accent is light, not paint" |
| PRESCRIPTION (120) | 59 "baselines 395 / 515 ... seats L x 440 · C x 520 · R x 600"; 105 "Each example uses video 4's real words and times" |
| CHECK (56) | 12 "every word at 0.25 scale, >= 4.5:1, >= 0.8 s a group, <= 20 characters a second"; 120 R1's checks |

### 1.14 look/SOUND_SYNC
| kind (count) | typical lines |
|---|---|
| INTENT (12) | 53 "Says: 'listen': small sounds read big, and the release reads huge"; 92 "Says: a held breath, then the payoff: an expectation bent, then paid" |
| TOOL (106) | 411 "Sync in the reels is STRUCTURE (a count, a hold, a release): story timing"; 376 "calm, wonder, awe | soft low hits ..., a slow count" |
| PRESCRIPTION (127) | 11-12 "One shape per film: a quiet floor; a count of three sounded changes and a fourth that comes a little late"; 79 "steps 30-76 f (0.5-1.27 s)" |
| CHECK (60) | 425-431 the sync check list ("hits >= 30 f apart"); 395 "Never sync" |

### 1.15 look/STORYBOARD_STYLE
| kind (count) | typical lines |
|---|---|
| INTENT (14) | 154 "'does this place feel inhabited?' and 'is your eye still on the subject'"; 15 "signal per drawing" |
| TOOL (101) | 75 "The pose is the verb (reach, point, shrug, slump, look up) and carries the emotion"; 135 "Thumbnails first: ... render 3 variants (a different subject size or angle)" |
| PRESCRIPTION (44) | 66 "the subject sits on the centre axis (x 380-700) of the read zone (y 600-1250). It spans 35-60 %"; 199 "Home base = cozy enclosure" |
| CHECK (50) | 183-184 the board lint: "the subject's box centred in x 380-700 and 270-460 px wide"; 147-155 the sound-off checklist |

### 1.16 EDGES (v1-era API doc under a banner)
| kind (count) | typical lines |
|---|---|
| INTENT (9) | 10-11 "see what looks cleaner, more polished and premium" |
| TOOL (87) | 35 "The frame is a sheet of white paper ... the colour is laid on top"; 101 "The colour contains the caption block" |
| PRESCRIPTION (48) | 263 the corner regions "180-260 x 300-400 px" |
| CHECK (55) | 102 "Beside the caption block the paper is <= 38 px on the left"; 3-8 "never at the top or beside the caption band" |

### 1.17 PIPELINE_V2
| kind (count) | typical lines |
|---|---|
| INTENT (31) | 34-35 "what the viewer must understand and feel there"; 82-84 "Rich means specific, layered and alive, never 'more stuff'" |
| TOOL (64) | 37-39 "a few imaginative, readable picture ideas drawn as whole-frame thumbnails"; 85-88 "the values first (squint: big quiet masses, one light, one focus), a few colours in harmony around the one accent, a rhythm of big, medium and small shapes" |
| PRESCRIPTION (10) | 109 "the frame's grammar in every frame, one lead device per frame named by its code"; 144 G3 "density and life as grey placeholders" |
| CHECK (74) | 278 "CRAFT's checks FAIL outright"; 94-97 the frame loop's first question: "does it give the viewer the beat's FEELING and idea in a second" |

### 1.18 G3_ANIMATIC
| kind (count) | typical lines |
|---|---|
| INTENT (12) | 222 "approval knowingly covers motion, timing, aliveness, focus and flow" |
| TOOL (77) | 119 "Drawn actions are a pose test, not tweens"; 30 "pushes and cranes are camera moves, not cuts" |
| PRESCRIPTION (6) | 68 "every surface that will hold detail or life at G5 carries a placeholder mass at G3"; 96 "Density key = the home set" |
| CHECK (68) | 57 "Mover budget ... at most 3-4 noticeable supporting movers at once"; 117 "Over budget is a lint WARN" |

### 1.19 G5_BLOCKING
| kind (count) | typical lines |
|---|---|
| INTENT (12) | 129 "every panel is full and alive, calm and tiered" |
| TOOL (57) | 98 "Joins: each carrier's engine form" |
| PRESCRIPTION (14) | 128 "Density and life: fill what G3 decided"; 171 a join drawn to fixed numbers ("the same stick at (540, 870)") |
| CHECK (71) | 65 "a carrier per join with at most 2 plain cuts and the thread >= 80 %" |

### 1.20 CREATIVE_BRIEF
| kind (count) | typical lines |
|---|---|
| INTENT (38) | 51 "the satisfying feeling of finally understanding something important"; 78-81 "The Understanding Shift ... 'Oh, now I get it.'" |
| TOOL (8) | 87 "Connect with BUT and SO"; 134 "the story provides the value, ... the animations the clarity" |
| PRESCRIPTION (5) | 83-84 "0–3 s HOOK ... 3–10 s STAKES ... 10–30 s EXPLANATION" |
| CHECK (11) | 129-133 the final editorial standard ("Can animation make the insight more obvious?"); 106 "Never ridicule people affected" |

### 1.21 v4/WORLD_BIBLE (the worked example)
| kind (count) | typical lines |
|---|---|
| INTENT (8) | 6 "The colour story: the warm is the heat and nothing else" |
| TOOL (166) | 101-102 "the lines INTO the picture are drawn on purpose" (a leading line that ends at the focal); 148 "held, never shut: the next block closes the right edge" |
| PRESCRIPTION (182) | 143 "The one window: (598, ~970), ~68 x 88 px ... in the golden box"; 165 "the sky with the band, ~45-50 % of the frame ...; the near snow, ~35 %"; 61 "the horizon at y 1150" for every shot but one |
| CHECK (38) | 105 "Target <= 65 % level lines, >= 20 % to the VP"; 562 "Declared exceptions" |

### 1.22 v4/visual/VISUAL_SCRIPT
| kind (count) | typical lines |
|---|---|
| INTENT (8) | 232 "the hook's picture, a puzzle at first, is now readable end to end" |
| TOOL (116) | 242 "The heat's signs: the melt line, steam from the manhole, the window's frost clearing" |
| PRESCRIPTION (43) | 33 "The home view (the layout key; every shot but S6 is a part of it)"; 11 "9 lead devices (the library asks 6-9)" |
| CHECK (16) | 249 "Every continuous push or pull stays within 2x per panel" |

### 1.23 v4/camera_plan_g3
| kind (count) | typical lines |
|---|---|
| INTENT (5) | (the plan is numbers by design) |
| TOOL (98) | 133 "the mechanism at the explainer's working size; the walls hold it" |
| PRESCRIPTION (155) | 415-418 every focal's landing spot: "(598, 985) ... (540, 1050) ... (540, 930) ... (540, 960) ... (540, 955)"; 42 "the giant computer | x 66-282, y 878-1256" |
| CHECK (23) | 16 "nothing to read at y >= 1519 or under the right rail" |

### 1.24 v4/THROUGHLINE
| kind (count) | typical lines |
|---|---|
| INTENT (5) | 190 "The small box on the pipe (L11) reads as part of the plumbing" |
| TOOL (47) | 54 "Thread: the heat, carried as the warm water, a drawn thing" |
| PRESCRIPTION (26) | 62 "the band is y 290-600, the stage y 600-1250), on the subject axis" |
| CHECK (20) | 131-138 "CRAFT: at least 3.5 s per shot" |

### 1.25 The sub-folders (counts per note)
| note | INT | TOOL | PRE | CHK | | note | INT | TOOL | PRE | CHK |
|---|---|---|---|---|---|---|---|---|---|---|
| composition/attention | 63 | 116 | 120 | 55 | | organic/composition | 4 | 99 | 58 | 46 |
| composition/catalogue_detail | 18 | 132 | 182 | 49 | | organic/libraries | 1 | 62 | 31 | 22 |
| composition/catalogue_notes | 6 | 87 | 12 | 9 | | organic/light | 11 | 240 | 88 | 35 |
| composition/cinema | 31 | 168 | 132 | 52 | | organic/light_proof | 1 | 65 | 84 | 22 |
| composition/critique_library | 10 | 64 | 34 | 32 | | organic/organic_proof | 3 | 68 | 37 | 23 |
| composition/library_clashes | 1 | 2 | 8 | 3 | | organic/shapes | 2 | 97 | 184 | 84 |
| composition/modern | 52 | 239 | 77 | 58 | | organic/techniques | 9 | 162 | 76 | 47 |
| composition/motion | 54 | 254 | 190 | 125 | | people_design/EVALUATION | 2 | 18 | 0 | 3 |
| composition/recipes | 18 | 197 | 121 | 41 | | people_design/design_research | 27 | 96 | 118 | 43 |
| composition/reels | 4 | 64 | 94 | 22 | | people_design/diagnose | 27 | 50 | 42 | 7 |
| composition/vertical | 19 | 30 | 127 | 80 | | people_design/dir_editorial / graphic / painterly | 21 | 189 | 187 | 38 |
| | | | | | | people_design/faces_graphic, fashion | 25 | 89 | 74 | 15 |

Typical lines: the INTENT survives here and dies above. composition/reels.md 169 "C2 Foreground ... a near layer at the
frame's edge that gives depth and a place to stand", 180 "D5 Pyramid ... stable and calm", 154 "B5 Parallel lines ...
rhythm and a direction of travel"; composition/cinema.md 545 "'We feel the vastness of a scene by the presence of a lone
figure'". The same research then turns each device into pixels: composition/cinema.md 226 "The classic devices, each as a
placement rule for 1080 x 1920"; composition/attention.md 313 AR2 "The focal's home ... within ~150 px of the visible
centre (x 410-670, y 950-1050)"; composition/recipes.md 45-62 (SR2: a layout in y bands, then the "Device" line last).
people_design/EVALUATION.md is the one note built as feeling -> tools (modern, natural, appealing -> a face, built in 3D,
one light and a rim, values that frame the face, a real cut, edges with intent, proportion and gesture, colour).

## 2. The worst over-prescriptions (where a placement or a number stands in for a feeling)
Ranked by how much they make every frame alike. Each: where, the feeling it stands in for, why it hurts, the video 4
evidence, and what to keep instead.

1. **The focal's "home": one spot for every shot.** COMPOSITION_SHOTS 44 (the golden box x 413-667, y 951-1187), 146 (N1
   "the focal re-found near (540, 960) after every cut"), 149 (N5 the drop, 300-450 px under y 556), 365-373 ("The five
   numbers every shot keeps"), 550-555 (rule 3); ORGANIC 372-374 (R7); LAYOUT 50 (the subject axis and box);
   STORYBOARD_STYLE 66 and 183-184 (the board lint holds every subject to x 380-700). Source: composition/attention.md
   313 (AR2, the eye's first look after a cut). **Stands in for:** "the viewer finds the subject in a second, and the eye
   does not jump at a join". **Hurts:** one 254 x 236 px box for every shot rules out the thirds, the low or high focal,
   an off-centre weight, a frame whose subject is a line or a field; the lint enforces it. **Evidence:** camera_plan_g3
   415-418 lists the landed focals: S1 and S12 (598, 985), S2 (540, 1050), S3 (540, 930), S4 (540, 960), S5 and S6 (540,
   955), S8 (540, 1150), S9 (540, 1135), S11 (600, 1000): 10 of 12 on one 60 px column; WORLD_BIBLE 143. **Keep:** the
   intent and its tools (contrast, the story light and the hardest value step at the focal; the eye carried across a
   join by motion, a match, light or the words' drop); "eye jump <= 0.10 of the diagonal" stays a CHECK (CRAFT 68); the
   box becomes one labelled example.

2. **The frame as three stacked bands.** ORGANIC 364-367 (R5: >= 65 % quiet, the sky with the band >= 30 % at the top,
   the near ground >= 15 % at the bottom, "the things live in the belt between"); LAYOUT 53; DIRECTION 98-101;
   LIFE_AND_DENSITY 36-41 and §2; COMPOSITION_SHOTS 544-549 (rule 2, "Three stacked pictures"), 562-567 (rule 5);
   COZY_AND_SCALE 3b.3. **Stands in for:** the owner's "big quiet areas and one place to look" (playbook 397-399).
   **Hurts:** it fixes WHERE the quiet goes (always the top and the bottom) instead of THAT the frame rests in a few big
   masses, so every frame is a horizontal sandwich with the world squeezed into a belt; R5 was measured on three sparse
   paintings (organic/composition.md 91-95, 170-174: a figure and a cloud, a bus stop at night, a beach at dusk) while the
   city pictures the owner also likes measure 35-63 % quiet (organic/composition.md 96, 98); it sits against "never
   stacked flat bands" (playbook 329; DIRECTION 94). **Evidence:** WORLD_BIBLE 165 "~45-50 % ... the near snow, ~35 %"
   -> the owner: "each house is so alone like the scene is empty" (v4/OWNER_NOTES 343-348: "a thin belt of lone
   blocks"). **Keep:** the intent and tools (value grouping, a notan first, quiet against busy, one focus); R3's calls
   (<= 3, one rival) as a CHECK; 65 % as a measured example of quiet landscapes, never a target for a street.

3. **Composing from a menu.** COMPOSITION_SHOTS 347-348 ("One recipe per shot, picked by its beat"), 349-350 and 453-458
   ("6-9 different leads", ">= 7 in 10 shots led by a CORE device"), 132-151 (13 rows "kept in EVERY shot", each with
   pixels); recipes SR2-SR5 (751-754) are one past film's sets (a canal, a lane, a nook, a balcony); every recipe's
   example is one of our films (735, 777; composition/recipes.md 11). The v4 ideas brief (v4/ideas/BRIEF.md 34-40):
   "Each idea names its lead device by the library's code". **Stands in for:** variety and fitness to the story.
   **Hurts:** the chain beat -> recipe -> code starts from the menu, not from the beat's feeling; "a beat that fits no
   recipe is a story question" (348) shuts out a composition nobody listed; the devices arrive with their pixels.
   **Evidence:** VISUAL_SCRIPT 11 "9 lead devices (the library asks 6-9)" and its home view as "the layout key; every shot
   but S6 is a part of it" (33). **Keep:** the devices as TOOLS, each with the feeling it makes (the research already has
   them); variety as a CHECK on the board ("no two neighbours alike").

4. **One big move from two, and one opening rhythm.** DIRECTION 185-189 (S1 or S5, S5's "2.6 s move + a 0.7 s hold"),
   CINEMATIC_GUIDE 241, COMPOSITION_SHOTS 402 ("exactly 1: S5 or S1"), COZY_AND_SCALE 25-26, LAYOUT 80; the opening's
   clock: COMPOSITION_SHOTS 612-617 (0-0.4 s the gist, 0.4-0.7 s the onset in the golden box, 1.2-1.7 s a second change,
   ~2 s reality), SOUND_SYNC 11-12 ("One shape per film"). **Stands in for:** "the scale must feel GREAT" (playbook
   428-433) and "a banger that stops a thumb" (playbook 650). **Hurts:** every film gets the same reveal and the same
   2-second rhythm; the owner named S5 his favourite shot (playbook 435), not the only move. **Keep:** the scale cues
   (CINEMATIC_GUIDE 171-231) as the tools for "vast", the owner's draw-on as a hard rule (§5), the timings as examples.

5. **Places as screen-band layouts.** LAYOUT 76 (BALCONY lid 0-600, life 600-1250, floor 1250-1920; RIVERSIDE in seven y
   bands), COZY_AND_SCALE 141-142 and 147-191, composition/recipes.md 49-53. **Stands in for:** cozy, "safe, held,
   unhurried, among people" (COZY_AND_SCALE 107). **Hurts:** the enclosure idea (held on 2-3 sides, one opening, the
   viewer as the refuge) has endless layouts; the table is one past film's canal. **Keep:** COZY_AND_SCALE §1 and 3b.1 as
   the tools (mass against opening, a closed vista, life passing sideways); the band tables as labelled examples.

6. **The thread on screen >= 80 % as a FAIL.** CRAFT 29-30, 66-67; DIRECTION 66; LAYOUT 141-144; G3_ANIMATIC 52;
   G5_BLOCKING 65; PIPELINE_V2 278. **Stands in for:** one flowing story (playbook 704-710). **Hurts:** it puts one object
   into nearly every frame (video 4's run of warm water: VISUAL_SCRIPT 11, "~92 %") where a match, the camera, the light,
   the colour or a sound could carry the story. **Keep:** "every join carries something" as the CHECK; the 80 % as a warning.

7. **Values by quota.** CRAFT 271-276 (an L* table for a night interior), 348-350 (how much is lit, ambient, shadow),
   505-510 (darks 6-10 % in >= 120 pieces across >= 9 of 16 grid cells); ORGANIC 379-381 (R10, one or two dark masses of
   15-40 %); the T3 key, 45 % under L* 40 (ORGANIC 760-761); WORLD_BIBLE 41-44 (60-70 %). **Stands in for:** "real darks
   where the eye should go" and one story light. **Hurts:** five numbers for one idea; "across >= 9 of 16 cells" spreads
   darks over the frame against one place to look; the value design should come from the light and the story.
   **Keep:** a value thumbnail first (playbook 939-951, "the forest before the trees"); the ranges as measured examples.

8. **One horizon per set, by pixel.** COMPOSITION_SHOTS 568-572 (setup A y 1150-1300 or B y 690-860, never 900-1020) and
   712-725; LAYOUT 56 (a default horizon y 768); WORLD_BIBLE 61 (y 1150 in every shot but one). **Stands in for:** "the
   camera stands where a person would stand" (playbook 344-345). **Hurts:** the human viewpoint is a place to stand and a
   person's real size, not a pixel row; a fixed horizon flattens the film's rhythm of heights. **Keep:** the horizon-cut
   rule (composition/cinema.md §3.2) as a tool; "one camera per shot" (CRAFT §f.4-5) as a check.

9. **People by pixel and by side.** Playbook 349 (~130-220 px), LAYOUT 58 (head 90-140 px) and 113-115 (mid walkers
   110-260 px; seated ~85, standing ~140 by set), COMPOSITION_SHOTS 573-576 (the "you" at x 130-380 facing right).
   **Stands in for:** "small and simple, at a real size near the camera, the vast world beyond". **Hurts:** the "you"
   enters every frame from the left third, and two size models contradict each other (§4 row 3). **Keep:** the intent and
   the scale relation (near figure against a big world) as the tool; sizes as labelled examples.

10. **The film doc as a coordinate sheet** (video 4, the worked example). WORLD_BIBLE 59-75 (the camera by formula),
    128-152 (the home view in y rows: roof y ~667, the computer x ~66-282), 143 (the window), 174-176 (Pip at (845, 905));
    camera_plan_g3 34-55 and 415-418; THROUGHLINE 62. It applied items 1-9 faithfully, then the owner found the picture
    empty (v4/OWNER_NOTES 343-348) and the visual script restricting the ideas (v4/OWNER_NOTES 372-377).

## 3. Gaps

### 3.1 By aspect of a frame
| aspect | intent + tool today? | where it lives | what is missing |
|---|---|---|---|
| **the idea** | **no**: one intent line, one process step | playbook 27-28 (rule 2); PIPELINE_V2 37-39 (step 3), 51-55 (one film concept); CREATIVE_BRIEF 114-116 ("animation that does some of the explaining") | the method: how to find a readable imaginative picture for a beat (the abstract thing made a physical thing in a real place; the mechanism shown one-to-one; an everyday object as the measure; the world built from the story's own things), with its tests ("read in a second", "needs explaining") |
| **the story beat** | partly | PIPELINE_V2 34-36 (what the viewer must understand and feel); CRAFT §a (thread, joins); THROUGHLINE | the beat's job as a picture (the change shown, before and after, cause and effect, the stake); COMPOSITION_SHOTS 420-431 maps beats to recipes, i.e. to layouts |
| **the feeling** | scattered | COMPOSITION_SHOTS 433-441 (6 feelings), SOUND_SYNC 371-380 (6), COZY_AND_SCALE 373-384 (10 emotions in the K table), composition/cinema.md §2-3 (what a shot size or angle says) | ONE vocabulary of the film's feelings (wonder, warmth, curiosity, tension, relief, intimacy, calm, surprise) with each feeling's tools in every aspect |
| focal and hierarchy | yes, but placed | playbook 397-410; DIRECTION 69-87; CRAFT §b | the focal's place is prescribed (§2.1) |
| composition | tools yes, feelings lost | COMPOSITION_SHOTS; composition/reels.md 125-200 | what each device makes the viewer feel (in the research, lost in the library's rows) |
| depth | yes | playbook 325-343; DIRECTION 87-92; CRAFT §f | the "layers and feel of distance" tool exists, written as k ladders and pixel tests |
| scale | yes, for the scale shot | CINEMATIC_GUIDE 171-231; COZY_AND_SCALE §4 | scale as a feeling in ordinary shots (intimate against vast) |
| light | yes (the story light) | playbook 309-324; DIRECTION 142-162; CRAFT §d; organic/light.md | light as mood (time of day, warm and cool, a high or low key as emotion); the key is set per film by numbers |
| colour and value | partly | playbook 554-563; DIRECTION rule 6; PALETTE 104 (colour jobs) | the colour and value SCRIPT as emotion across a film: only WORLD_BIBLE 6-8 has one ("the warm is the heat and nothing else"); composition/cinema.md 460-488 a proposal |
| **shape language** | rendering only | ORGANIC §4.1; CRAFT §c; COZY_AND_SCALE 96-97 (the one line on meaning) | shape as meaning (round and soft = safe, angular = threat, vertical = reaching, horizontal = calm), for places, props and people |
| texture and line | yes (rendering) | CRAFT §c; ORGANIC §4.5; PAINT_RECIPES | the ink line's intent is still open (playbook 611-616, "to try") |
| **life and richness** | intent yes, tools as counts | playbook 38-50 (new), 411-427; LIFE_AND_DENSITY | richness as three scales of detail and "each detail says something about this place" (playbook 38-50; PIPELINE_V2 82-84) arrived today; the guides still teach density as counts, profiles and an inventory |
| **people and gesture** | design yes, acting no | playbook 449-528; PEOPLE_DESIGN | acting: the pose as the beat's verb (STORYBOARD_STYLE 75, the board only; PEOPLE_DESIGN 400, 455: "one clear pose per beat ... no facial expressions"); posture as character; the intent of hair arrived only after "bed-head" |
| words | yes | TYPE_GUIDE §a; playbook 529-550 | "pleasant, never menacing" arrived only after the owner's note (TYPE_GUIDE 13, 390-398) |
| motion | camera yes, acting no | DIRECTION rule 8; COMPOSITION_SHOTS Part 0b §3; G3_ANIMATIC §4 | motion as feeling for living things (anticipation, follow-through, arcs, timing for emotion), beyond hair physics and "a pose test" |
| sound | yes | SOUND_SYNC (Is / Says / Timing / Build; by beat; by emotion) | the model to copy |
| the join | yes | CRAFT §a; COMPOSITION_SHOTS 375-389 (the join by what changes) | fine |
| readability at phone size | yes (checks) | playbook 722-729; TYPE_GUIDE §f; CRAFT §b's eye check | fine as checks |
| one world, one film | new today | playbook 52-59; PIPELINE_V2 51-90 (the world kit, the hero frame) | no guide yet for the world kit (real places first, pieces built once) |

### 3.2 The owner's last two days of pointing, traced to its gap
| what the owner had to point out | why the toolbox let it through |
|---|---|
| "each house is so alone" | the quiet-field quota (R5) and "<= 6 named objects" with no richness intent (§2.2); WORLD_BIBLE 165 |
| the composition library missing from a brief | no frame card: each brief lists its own docs (v4/ideas/BRIEF.md 34-50) |
| the style recipes missing | the same |
| the visual script restricting the ideas | the gates still put it before the ideas (CLAUDE.md 22; PIPELINE_V2 143; DIRECTION 239-240), and the composition pass picks a code per shot (playbook 390) |
| bed-head hair | the hair's intent (a clean, stylish cut that lives) was missing; "a little messy" was followed literally (playbook 449-476) |
| a menacing caption | TYPE_GUIDE had "premium, dynamic, engaging" and no "pleasant" until the note (13, 390-398) |
| a computer neck | PEOPLE_DESIGN 199 prescribes a neck "slanting forward 10-15 degrees"; the playbook's "upright neck" (456) came after |

Each is an aspect whose feeling was missing, or whose number contradicted the feeling.

### 3.3 How the toolbox reaches an agent
The frame loop builds "from its card" (PIPELINE_V2 93), and `look/FRAME_CARD.md` does not exist. The v4 ideas brief
(v4/ideas/BRIEF.md 34-50) hands its agents ten docs and section picks (several thousand lines) and leaves out CRAFT,
CINEMATIC_GUIDE's scale cues and PALETTE; the loop's own toolbox paragraph (PIPELINE_V2 107-111) names the two worst
prescriptions ("the frame's grammar in every frame", "LAYOUT.md's bands"). The four places that already work as feeling
-> tools are SOUND_SYNC's "Says" lines (53, 92), CINEMATIC_GUIDE's scale cues (171-231), COZY_AND_SCALE 3b ("A recipe for
a FEELING", 107) and people_design/EVALUATION.md.

## 4. Duplicates and contradictions

### 4.1 Contradictions
| # | topic | one side | the other side | status |
|---|---|---|---|---|
| 1 | the loop: the visual script first, grey placeholders, G5 fills | CLAUDE.md 22-25 (a visual script between the voice lock and G3; "density and life as grey placeholders (loose never means empty)"); DIRECTION 235-246; PIPELINE_V2 143-146; G3_ANIMATIC 66-99; STORYBOARD_STYLE 20, 119-122; LIFE_AND_DENSITY 268-275; G5_BLOCKING 128; playbook 689-700 (its own bullet text under the "Changed" notes at 685 and 712) | playbook 24-31 and 1049 (placeholders retired); PIPELINE_V2 29-50 and 114 ("this loop replaces it") | the newest words win; the lower docs carry a banner over unchanged text |
| 2 | darks | playbook 559-561 ("6-10 % ... in many small pieces ... never one dark mass"); CRAFT 505-510 (>= 120 pieces across >= 9 of 16 cells); PALETTE 75-76 | ORGANIC 379-381 (one or two masses of 15-40 %); ORGANIC 752-756 (T3 decided: 45 % under L* 40); WORLD_BIBLE 41-44 (60-70 %); COZY_AND_SCALE 286 ("darks warm and rare, L* < 25 on <= 6 %"); DIRECTION 161 and CINEMATIC_GUIDE 260 ("night is temperature, not darkness") | DIRECTION 61 and CRAFT 24-25 still call it the owner's open pick; ORGANIC says decided under the hand-over; the playbook bullet is unchanged |
| 3 | the "you"'s size | playbook 349 (~130-220 px tall); DIRECTION 193-194; COMPOSITION_SHOTS 573-576; PEOPLE_DESIGN 56-57 | LAYOUT 58 and LIFE_AND_DENSITY 148 (head 90-140 px, cut by the bottom edge); composition/reels.md E10; playbook 494 and DIRECTION 109 ("near heads <= ~140 px") | at 7.8 heads a 130-220 px figure has a ~17-28 px head: two different people |
| 4 | faces | playbook 495 (open eyes looking away); PEOPLE_DESIGN 3-20 | PEOPLE_DESIGN 267 ("Never: ... an open-eyed 3/4 face") and 22-35 (LASH in use); CINEMATIC_GUIDE 258; COZY_AND_SCALE 188; LIFE_AND_DENSITY 140; STORYBOARD_STYLE 75-77 | the newest pick wins; the bodies of the docs are not updated |
| 5 | the neck | playbook 456 ("a long, upright neck, never pushed forward") | PEOPLE_DESIGN 199 ("slanting forward 10-15 degrees") | the number produced the owner's note |
| 6 | the people direction | playbook 510 (C picked), then the overhaul in use | PEOPLE_DESIGN 146 ("The recommendation: A"), 187 ("DRAFT: direction A") | stale |
| 7 | the caption block | LAYOUT 46; TYPE_GUIDE 58-62 (ink y 290-585) | LAYOUT 191 ("the block (the ink) y 317-556"); CRAFT 561; COMPOSITION_SHOTS 149 (the drop measured from y 556), 691; PAINT_RECIPES 100, 305 | two ranges for one thing; the drop rides on the old one |
| 8 | bands | playbook 329 ("never stacked flat bands"); DIRECTION 94 | COMPOSITION_SHOTS 544-549 ("Three stacked pictures ... Depth stacks UP the frame"), 150 (N6); composition/recipes.md 62 ("horizontal bands stacked up the frame"); ORGANIC 364-367; LAYOUT 53, 76 | the ban meant a flat elevation; the rules now stack the whole frame |
| 9 | the one accent | PALETTE 74-79 (a hero C >= 30 on 5-15 %; one pop C >= 50 on 1-3 %) | COMPOSITION_SHOTS 144, 168 (E8: "C* >= 50, ~3-5 % of the frame"); CRAFT 83 (the hero colour ">= 50 % of the frame's C* > 35 pixels"); ORGANIC 344 (C* ~56) | three numbers for one idea |
| 10 | one colour key, or warm against cool | DIRECTION 163-166; ORGANIC 338-340 (one family, the sky's own, everything tone-on-tone) | COZY_AND_SCALE 262-265 ("a warm made world held by one cool field ... >= 10 % of the opposite temperature in every frame"); PALETTE 30-31 (a cool hero on a warm base) | both kept inside DIRECTION rule 6, unresolved |
| 11 | the toolbox, never a cage | playbook 75-82 ("never as placements; concrete positions and numbers are labelled examples") | PIPELINE_V2 107-111 ("the frame's grammar in every frame ... LAYOUT.md's bands"); v4/ideas/BRIEF.md 35-39 | the newest owner rule against the loop's own paragraph |
| 12 | a breather's length | LIFE_AND_DENSITY 236 ("at most 2.5 s") | COMPOSITION_SHOTS 448, 470 ("2.5-3 s"); CINEMATIC_GUIDE 79-80 (2.5-3 s) | small |
| 13 | the thirds | COMPOSITION_SHOTS 78 ("as a lead: RARE") | COMPOSITION_SHOTS 139 (in every shot as 2:1 proportions) | its own critic flagged it (composition/critique_library.md 30-) |
| 14 | our films as the model | playbook 33-36; DIRECTION 31-33 ("never a past film as the bar or the example") | DIRECTION 195-196 (a past film's view "is the model"); CRAFT 401 ("is the model for the plane numbers"); COMPOSITION_SHOTS 735, 777 and composition/recipes.md 11 (every recipe's example is one of our films); TYPE_GUIDE 105 (every example from video 4); CINEMATIC_GUIDE 63, 82, 95, 112, 167 (the "Upgrades ..." lines, now marked history at 8); PAINT_RECIPES §4 and ORGANIC §6 (one past scene's numbers as the plan) | the newest rule; the lower docs not yet swept (past-film mentions per guide: ORGANIC 87, CRAFT 81, PIPELINE_V2 62, LAYOUT 41, PAINT_RECIPES 39, SOUND_SYNC 37, G5_BLOCKING 37; most are measurements, which the rule allows) |

### 4.2 Duplicates (one rule restated in many guides, each a chance to drift)
| rule | restated in | drift found |
|---|---|---|
| the one big move, S1 or S5 | 9 guides (CINEMATIC_GUIDE, COMPOSITION_SHOTS x9, COZY_AND_SCALE, DIRECTION, LAYOUT, SOUND_SYNC, STORYBOARD_STYLE, TYPE_GUIDE, G3_ANIMATIC) | the default length (S5 3.3 s in CINEMATIC_GUIDE's retime, "2.6 s + 0.7 s" in DIRECTION 188-189) |
| the quiet fields | 6 guides (LIFE_AND_DENSITY x8, LAYOUT x4, COZY_AND_SCALE, ORGANIC, DIRECTION, COMPOSITION_SHOTS) | the shares (sky >= 30 %, a bounded floor up to 50-60 %, ~65 % quiet) |
| the depth ladder k 0 / .12 / .22 / .40 / .65 | 6 (CRAFT, LAYOUT, COMPOSITION_SHOTS, CINEMATIC_GUIDE, COZY_AND_SCALE, PAINT_RECIPES) | none, but each copy is a pixel recipe for "a feel of distance" |
| the parallax float | 6 (playbook, DIRECTION, CRAFT, LAYOUT, COZY_AND_SCALE, COMPOSITION_SHOTS) | the constants (LAYOUT 312: `PARALLAX_K` breaks COZY_AND_SCALE §4's 1.8x) |
| the caption band y 290-600 | 5 (COZY_AND_SCALE x8, LAYOUT, COMPOSITION_SHOTS, TYPE_GUIDE, STORYBOARD_STYLE) and the block in 6 more | the block's two ranges (§4.1 row 7) |
| Pip hidden | 5 (playbook, DIRECTION, CRAFT, LAYOUT, LIFE_AND_DENSITY) plus ORGANIC R12 and the planning card | its spot rule (LAYOUT 257-258, a proposal; ORGANIC 384-386) |
| no strangers' backs in front | 5 (playbook, CRAFT, DIRECTION, LAYOUT, LIFE_AND_DENSITY) | none |
| the "you"'s size | 4 + 2 (§4.1 row 3) | two models |

### 4.3 What the duplicates and contradictions share
Every contradiction above is a number or a placement, never a feeling: the guides agree on what the viewer should feel
(alive, calm, one place to look, real darks where the eye goes, a person at a real size) and disagree on the pixels. The
fix the brief asks for removes most of them at once: one intent, its tools, and the numbers in one place as labelled
examples or checks.

## 5. Owner rules: intents to keep as intents, hard constraints to keep as checks

### 5.1 Intents (keep as intents, each with its tools; never as a placement)
Every frame worth pausing on (25-26) · readable imaginative ideas (27-28) · frames planned whole (29-31) · a rich,
beautiful world (38-50) · one film, never a hodge-podge (52-59) · one flowing story (704-710) · one subject, gone deep
(112) · clear to a regular person on one hearing (139) · never baity (95) · proper light, one story light (309-316) ·
light and shadow gentle but always there (317-324) · depth and separation (325-343) · depth and scale from a human
viewpoint (344-365) · one continuous sky, never an empty field (370-381) · organic, not geometric (382-389) · big quiet
areas and one place to look (397-399) · one focus at a time (400-410) · alive, calm and tiered (411-427) · a place, never
buildings standing alone (420-427) · scale that feels great (428-433) · coziness through enclosure (438-443) · one look,
one brand, still evolving (262-269) · clean, refined, gentle, premium (270-277) · warm, never sickly (557-558) · one
painted language (564-610) · people beautiful, contemporary, refined (492-528) · faces cute and appealing (477-491) · hair
a clean, stylish cut that lives (449-476) · words designed, pleasant, never menacing (531-550) · sync on purpose, spent
not sprinkled (239-248) · music cinematic but subtle (249-252).

### 5.2 Hard constraints (keep as checks)
Vertical 1080 x 1920 (91) · 30-45 s, ending near the payoff (679) · the first word at ~0.12 s, never a silent lead (664) ·
the payoff in words by ~2 s, in the voice's order, no title over the captions (668-674) · captions burned in, popping in
place, never clipped (529-530) · words in the picture few and big, read at phone size, checked at 0.25 scale (724-729) ·
no paper edge at the top or beside the caption band (551-553) · no key read under the platform UI (DIRECTION rule 10;
LAYOUT 42) · 60 fps from G5 (830) · -14 LUFS / -1 dBTP, the voice on top; an effect on its picture's first visible frame
or up to 2 frames after (253-255) · the voice never processed (227) · a positive phone sound in the first second (256-257)
· no outlines until the ink pick (617-631, 611-616) · the hook true (675) · no reused sets or kits (444-448) · Arcane for
environments only (434) · Pip in every film, hidden; none in closes, charts or on the cover (299, 632-642) · every frame
at least 8/10 (680) · a reference move gives the shape, never the speed (826).

### 5.3 Means the owner made into rules (keep the rule; judge it by its intent)
| the owner's rule (a means) | the intent it serves |
|---|---|
| frame 0 drawn on in the clean pen, outline then colour (656-660) | a banger that stops a thumb (650) |
| the through-line card: one thread object, one home place, one "you" (643-649) | one flowing story |
| the parallax float (366-369) | depth in motion without new movers |
| ONE painted language for the whole frame (564-610) | coherent and premium, nothing pasted in |
| the S5 pull-back as "the model for a film's big reveal" (435-437) | the scale feels great; the owner's favourite, not the only move |
| a quiet "find Pip" (299, 632-642) | a small reward for a second look, never a competitor |

### 5.4 Our numbers riding on owner rules (the owner said X; we added Y)
| the owner's words | our number attached | keep Y as |
|---|---|---|
| a person "at a real size" near the camera (344-348) | ~130-220 px tall, 8-16 % of the width (349) | a labelled example |
| "big quiet areas and one place to look" (397-399) | >= 65 % quiet in two fields, sky >= 30 %, ground >= 15 %, <= 6 named objects (ORGANIC 359-369) | calls <= 3 as a check; the rest as an example |
| "real darks where the eye should go ... in many small pieces" ("Go with your suggestions") | 6-10 % under L* 40 in >= 120 pieces across >= 9 of 16 cells (CRAFT 505-510) | a measured range |
| "the subject's shade face deeper" (hand-over) | -20 to -25 L* (320) | a tool parameter |
| "thin lines that hold steady in the float" (hand-over) | 2 px (301) | a check (twinkle) |
| "something new every few frames" (662) | a change on the subject every 1.5-3 s (COMPOSITION_SHOTS 450-452) | an example rhythm |
| "joins on the beat" (680) | each join's midpoint on the next sentence's first word | a check |
| "scale must feel GREAT" (428-433) | 5-7 planes each 2.2-3x smaller, a landmark 1.1-1.4 F over the horizon, sky 30-40 % (CINEMATIC_GUIDE 171-229) | the cues as tools, the numbers as examples |
| "occasionally" scale; cozy as the home (428, 438) | 1-2 scale moments of 1.5-4 s; cozy >= 50 % of the runtime (DIRECTION 182-188) | a warning |
| "my favourite" (S5, 435) | the one big move is S1 or S5, 2.6 s + 0.7 s (DIRECTION 185-189) | one example of a vast reveal |
| "spend sync, don't sprinkle" (239-248) | 4-5 hard syncs in the hook, <= 1 per 10 s, one release in a >= 0.8 s pause (SOUND_SYNC 11-13) | the shape as an example, "heard, on the change" as a check |
| "the first 3 s a banger" (650) | 0.4-0.7 s the onset in the golden box, 1.2-1.7 s a second change (COMPOSITION_SHOTS 612-617) | an example clock |

## What this hands to the rework (DESIGN_LANGUAGE, FRAME_CARD, REWORK)
1. Write every aspect in §3.1 as **feeling -> tools -> labelled examples -> checks**; the four places that already do it
   (SOUND_SYNC's "Says", CINEMATIC_GUIDE's scale cues, COZY_AND_SCALE 3b, people_design/EVALUATION.md) are the pattern.
2. Move every coordinate in COMPOSITION_SHOTS Part 0b and Part 2, LAYOUT §2-3, CINEMATIC_GUIDE S1-S5, COZY_AND_SCALE
   3b.2 and `composition/recipes.md` into labelled examples ("one way, measured on ..."); keep LAYOUT §1's platform zones,
   the caption band and type frame, contrast and timing as CHECKS.
3. The frame card asks one question per aspect of §3.1 (the idea, the beat, the feeling, the focal, composition, depth,
   scale, light, colour and value, shape, texture and line, life and richness, people and acting, words, motion, sound,
   the join, the phone-size read), so every brief carries the same whole and no aspect waits for the owner.
4. Fill the five real gaps first: the idea, the shared feelings, acting, shape language, the colour and value script.
5. Fix §4.1 at the source (the old loop's text, the darks, the "you", faces, the neck, the caption block, the accent, the
   bands, the toolbox paragraph), and turn the lints that enforce a placement (the board lint's subject box; R5's quiet
   share and R7's focal box) into information.
