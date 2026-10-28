# Life and density: every frame full and alive (generic, every video)

**The owner's rule** (OWNER_PLAYBOOK, Visual style; v3 G5, 2026-10-26: "way too empty ... those feel a lot more alive"):
every frame feels ALIVE at the level of reference 1 (France, `assets/ref/reference.mp4`) and v1 (PHP,
`deliverables/v1/php2shell_final.mp4`): a dense, specific world, people near and far, layered depth, a recurring living
character and ambient life that never stops. Feeling alive is the goal; the numbers are a warning signal, never a quota.
A big empty field (nothing in it; flat colour itself is right, `CRAFT.md` §c), or an object alone on a blank wall, is a
failure even in a draft. Sources (measurements only, never style): style bible §5-8, motion_spec §5, 6, 9,
`look/research/density_numbers.md`; v3's `docs/v3/density_plan_g5b.md` is history (its cut was judged "too busy").
How things are drawn: `CRAFT.md` §b-§c, inside `DIRECTION.md`. For cozy holds
the bar is the owner's cozy references (a street seen from a balcony, a riverside: `COZY_AND_SCALE.md` 3b), the fullest and
the calmest we have measured: fullness first, motion second (§0).

**Density respects the attention hierarchy** (owner, v3 G5b, 2026-10-27: "too busy ... too many moving parts and I'm not
sure what to keep my attention on"): fullness comes from a calm, well-tiered world, never from equal-weight clutter. The
subject keeps the contrast, the line and the motion; dressing is tier C (no outlines, low contrast, still) and life is tier
B near the story or C far off (small, soft, slow, taking turns), as `CRAFT.md` §b sets them: lighter, never fewer than the
scene needs. Every rule below works inside those tiers.

## 0. Fullness first, motion second (owner's riverside reference, 2026-10-26: "it doesn't feel empty at all")
- **The world's density and detail make a frame full even when little moves; motion only has to prove the place is
  alive.** The riverside (C3 in `COZY_AND_SCALE.md` 3b) moves the least of all our references (~1 medium event/s, ~1.4 %
  of the pixels per 0.1 s: density.py says FAR) yet is the fullest (flat 9-10 %, detail 61-62 %, ~250 objects/Mpx); the
  balcony street (C2) is the same (2.0 ev/s; flat 14 %, detail 47 %). v3 G5 moved more than both (2.6 ev/s; its busiest
  shot 17.9 % of the pixels) and read "way too empty" (flat 61 %, detail 16 %, 63 objects/Mpx). Emptiness is a fullness
  problem, not an event-count problem.
- **Judge the paused frame first.** If a still looks empty, more motion will not fix it (v3 S9). Fix in this order: the
  world (things, layers, thin lines), then people (still ones count), then the idle motion. Never put motion on a void to
  liven it up (31 % of v3 G5's moving pixels sat on void): fill the void.
- **What makes a still full** (C2 / C3 against v3 G5, for a flat-colour frame). The owner wants "less prescriptive on the
  amount of objects", so only these checks are rules, and each lives here once (`COZY_AND_SCALE.md` 3b.8 points here):
  - **The meter's fullness:** the profile's row below (DENSE-CALM or STORY-LED), from density.py's default table:
    information until it is re-measured on a G4 look clip (it reads lines, and the clean pen keeps the props but drops
    their lines).
  - **No hole bigger than the caption band:** outside the caption band and the one quiet field, no empty patch over ~200 px
    across (largest empty disc: C3 393 px, the sky; v3 G5 910 px). The quiet field is ONE band touching the top or bottom
    edge (sky, water, floor), and it is still patterned.
  - **A field MADE of things, never things ON a field:** the biggest single flat region <= 20 % of the frame apart from the
    quiet field (C3 8-15 %, v3 G5 23-45 %).
  - **The paused frame at phone size beside the reference** (a cozy hold beside C3 or C2, a story-led shot beside
    reference 1 and v1) reads as full as it does. The hole and field checks are not in density.py yet (the void, TO
    BUILD: the craft tooling lane, `PIPELINE_V2.md`): the paused-frame look decides them.
- **What fills a frame** (how the references get there; examples for the eye, never targets; their counts per frame are in
  the `COZY_AND_SCALE.md` References log):
  - many small things, each size step down holding more (C3 ~3x per step);
  - stacked, not spread: depth by overlap, a new surface every few dozen px down a column (C3 42 px, v1 90, v3 G5 143),
    drawn detail in most 240 px bands (C3 7 of 8, v3 G5 0-3);
  - local colour variety: several colours in every small patch (per 96 px: C3 4.25, v1 2.41, v3 G5 1.77), and repeats
    vary in colour (each house, awning, shirt);
  - things that ARE lines, the cheapest fullness: wires, poles, antennas, rails, mullions, as hairlines within dL* 15 of
    their ground (`CRAFT.md` §c; never outlines, never in the caption band: §8); drawn back onto a flattened C3 they cut
    its flat share from 18 to 15 %;
  - people, even still: about half at rest; a still person counts as life (v3 G5: nobody in 9 of 14 shots); a shot with
    nobody in it needs the character or a silhouette in a window;
  - texture last: worth the last 5-15 points of flat share, never the fix; the frame must read full with it off.
- **Two alive profiles, one per shot** (name it in the camera plan):

| profile | for | fullness (density.py) | motion |
|---|---|---|---|
| DENSE-CALM | cozy holds (`COZY_AND_SCALE.md` 3b) | flat <= 30 %, detail >= 33 %, obj >= 120, set so both cozy refs pass made flat like for like (C3 at 24 flat colours 18 % / 37 % / 124; C2 flattened: flat 29 %, detail 33 %): flat and obj rise above STORY-LED, detail holds. Plus the hole, field and paused-frame checks above (the reference clip stays out of the repo) | `density.py --cozy` (§9): movers >= 2 (!! < 1), empty <= 5 % (!! > 20 %), cv <= 0.3 for a steady lane or <= 0.75 for one slow swell per 6-7 s (!! > 1.2), the camera locked (float ~0) or floating 8-15 px/s; the motion in one band; one quiet ambient element on (§6) |
| STORY-LED (was "BUSY") | explainer beats and the opening (a scale hold has its own: `CINEMATIC_GUIDE.md` Scale cues 11) | §1 (flat <= 40 %, obj >= 105, detail >= 34 %) | §6: the story's beat leads (`CRAFT.md` §b), supporting life small, steady and taking turns, never a still frame; ev/s is information |

  v3 G5 was neither: a third of the cozy fullness and half the story-led motion (`--cozy`: movers 1.0, empty 56 %, cv 1.13,
  float 2.3 px/s). Events/s and the gap are information, never a target (2026-10-27: the attention tiers keep supporting
  life calm on purpose): a `gate_check.py --density` WARN, FAR or FAIL that comes only from ev/s or the gap is no reason to
  add movers, and any density FAIL counts as a WARN at the gate; judge the paused frame (above) and the eye test
  (`CRAFT.md` §b). The meter still scores them (its fix is the craft tooling lane, `PIPELINE_V2.md`). The profile was
  named "BUSY" until 2026-10-27 (v2r's shot map now says STORY-LED too): the owner's "too busy" is the failure, never a target.

## 1. The bar (measured on the references; warning signals)

| signal (`scripts/qa/density.py`) | ref 1 | v1 | target | far under |
|---|---|---|---|---|
| medium motion events / s | 6.6 | 7.7 | information: the story's beats make it, never extra movers | - |
| longest gap without a new event | 1.00 s | 1.67 s | information (never a still frame: the row below) | - |
| near-static frames (longest run) | 1 % (0.07 s) | 3 % (0.40 s) | <= 5 % (run <= 0.4 s) | > 25 % |
| flat share (empty one-colour tiles) | 20 % | 32 % | <= 40 % (aim 35 %) | > 55 % |
| objects / canvas Mpx | 192 | 141 | >= 105 | < 70 |
| fine-detail tiles | 58 % | 45 % | >= 34 % | < 22 % |

These are the STORY-LED profile's targets (§0); the two event rows are information since the attention tiers
(2026-10-27), and the fullness rows are information until they are re-measured on a G4 look clip (the meter was set on
lined frames). Cozy holds (DENSE-CALM) are judged by §0's row and `density.py --cozy` (§9): the riverside measures
1.0-1.2 ev/s and a 2.4 s gap (FAR) with a moving figure in every frame.

What the references hold in one frame (examples to calibrate the eye at phone size, never counts to hit: the owner
asked for "less prescriptive on the amount of objects"):

| shot | quiet field | distinct props besides the subject | depth planes | people |
|---|---|---|---|---|
| wide / exterior | sky gap or ground, 15-35 % | 12+ | 3-4 | 10 to 300+ (far crowds count) |
| medium / interior | the wall or sky behind the captions | 8+ | 2-3 | 2+ (a silhouette in a window counts) |
| close / insert | the subject's own backing | 5+, cut by the frame edges | 2 | the "you" or the character (never a row of strangers' backs: `CRAFT.md` §a.3) |
| cozy wide (balcony, riverside) | ONE band at a frame edge: a jagged sky ~8-15 % above y 290, or a bounded floor up to 50-60 % (`COZY_AND_SCALE.md` 3b.1) | a field made of things (§0's DENSE-CALM row), lived-in infrastructure (wires, poles, antennas, railings) | overlapping, stacked upward (C3 6) | about half at rest (C2 / C3 held 5-8) |

## 2. Composition: where the density goes
- **One quiet field, the rest loaded.** In thirds (y 0-640, 640-1280, 1280-1920) the quiet field (in 9:16 usually the
  wall or sky behind the caption band) takes at most one; every other third holds things at several depths (the
  references: 3+ distinct props at 3 depths; an example, never a count to hit). Finer:
  drawn detail in most 240 px bands (§0), and calm sits only at a frame edge, round the subject or behind the captions,
  never as a slab mid-frame (§0; `COZY_AND_SCALE.md` 3b.3: detailed edges and far side, calm centre or floor).
- **Hierarchy keeps the read.** The subject keeps the strongest value contrast, the hero colour and a calm ring (30-60 px
  of one value) round its silhouette; dressing sits one value step off its ground, its line and contrast set by its tier,
  never by depth (`CRAFT.md` §b-c: no outlines on dressing, far planes fill only), its colour, size and simplicity by its
  plane (`CRAFT.md` §f). The sound-off cold read must still pass
  at phone size.
- **Specific, varied, cut by the edges.** A pharmacy cross, a cart sign, a clock, never a generic block. Repeats vary
  (4-5 building types, books of 5+ widths, a different hat on each head). At least 2 elements cut by a frame edge in
  every shot; the world goes on past the frame.
- **Colour jobs survive density.** Dressing never takes the hero colour or the pop (a shop's other laptops are boxes or
  neutral); it lives in the palette's room and outside families.

## 3. Dressing inventory by setting (pick what the place needs; the references hold 8+ per shot)
How each piece is drawn: `CRAFT.md` §b-§c (tier C: flat shapes, no outline; style bible §7-8 is v1's look, history).
- **Street:** facades of 4-5 types, windows 40-70 % filled (curtains, a plant, a person), balconies, shopfronts (fascia
  with a pictogram, display window, door, awning), hanging signs, wall lamps, doorbells, drainpipes, posters, cornices;
  lamp posts, wires with birds, trees, bikes, bins, bollards, A-frame signs, parked cars, kerb bands;
  the weather on top (snow on ledges, puddles, leaves).
- **Interior (home, shop, office):** shelves of varied books and objects, plants (trailing, potted), a pinboard (photos,
  notes, tickets), framed prints, a clock, string lights, a lamp and its pool, a steaming mug, desk clutter at 2 depths
  (pen cup, headphones, notebook, cable, sticky notes, glasses), a rug, a bag, a coat on a hook; and the window: the
  world outside with neighbours' lit windows, silhouettes and weather.
- **Exterior / industrial:** the building's specific parts (sawtooth roof, chimney with smoke, lit windows, floodlights,
  a loading dock, a sign), a fence, a gate with a booth and a barrier, workers, a forklift, crates and pallets, trucks
  and cars, a road with kerbs, tracks, banks and lamp posts, trees, wires, a far town.
- **Sky:** never an empty slab outside the caption band: drifting clouds, birds, a crane, antennas, smoke, a far skyline.
  **Information inserts:** see section 7.

## 4. People (the film's own people kit, drawn new in its design and shared by every lane; never hand-drawn per lane)
The kit is new for each film (playbook: no reusable assets); `lib/kit` `Person` / `Crowd` and `lib/cine` `TinyCrowd` are
references and primitives, never the film's people.
- **Back view always** (or rear 3/4): the head in the hair colour, a neck, a tombstone torso and one accessory each
  (beanie, hood, headphones, scarf, backpack, bag, raised phone); neighbours never share both hair and coat colour.
  No faces (playbook: people act with their pose, like reference 1's); only the mascot has one. Extras are smaller and
  in mid colours, never mistaken for the protagonist.
- **Sizes by depth (1080 x 1920 canvas; size names, never the attention tiers A-C of `CRAFT.md`):** in the foreground
  only the film's one "you" (head 90-140 px, playbook: near heads <= ~140; cut by the bottom edge, head top ~y
  1380-1560) or the mascot, never a row of strangers' backs (they read as "you": `CRAFT.md` §a.3); a passer-by at the
  lens only as a carrier D wipe. Mid walkers: 110-260 px tall (backpacks, bags, phones, a dog). Far crowd: 15-60 px,
  fill only, rows x0.85 toward the horizon. Window and balcony people: 12-40 px silhouettes in lit windows, moving.
  Strangers stay small in the mid and far ground, tier B near the story and C far off (`CRAFT.md` §b); a big near
  figure holds still or breathes (<= 2 %W/s) while the subject acts.
- **They do things:** walk, carry, point, raise a phone, shovel, lean in, bob 2-3 px; on the voice's key word heads turn
  or a phone goes up, 0.1-0.3 s after the cause.
- **Rest counts; cozy life passes through.** In a wide about half the people are at rest (sitting on an edge, leaning,
  chatting, waiting) next to the moving ones. In a cozy hold the movers cross sideways at real-world speeds (walk 0.7-1.1
  body heights/s, bike 1-3), 1-5 at once, and nothing comes at the viewer (`COZY_AND_SCALE.md` 3b.4). Seated figures that
  face the viewer across water stay featureless, in side or 3/4 view (3b.2 RIVERSIDE).

## 5. The recurring living character
- **One, hidden on purpose** (owner, 2026-10-28: "keep it, but not as obvious ... hide it deliberately in the
  video"; reference 1's cat and v1's Pip were in every shot, which is no longer the rule). Default: the channel's mascot **Pip**
  (another character only if the story asks for it, named in the W1 world bible and seen by the owner at G3),
  drawn new in the film's design (playbook: no reusable assets; `src/lib/mascot` and `docs/mascot.md` are the reference
  and the API), in a colourway for the video's palette that stays its own hue (ΔE76 >= 20 from
  every ground it sits on, never the hero or the pop colour) and in tier B (`CRAFT.md` §b: C* <= 25, a tinted outline)
  unless the line is about it. A non-character anchor may join it (snow, the weather; the sun is light, never a
  character: `CRAFT.md` §d.1).
- **Jobs (since 2026-10-28: hidden, not a guide):** (1) hide in a spot that belongs to the world (in a window, on a
  boat, on a balcony, among a crowd), off the subject's eye path, found on a second look; (2) idle quietly (blink, ears,
  tail, breath; only blinks and ear moves while the subject moves), a small life for whoever finds it; (3) at most a tiny
  reaction on a stressed word, never on the subject's own beat, never big enough to pull the eye; (4) its hiding spots
  are planned at G3 (W1 names them), never added later. Retired: perching beside the subject, pointing the eye, carrying
  continuity across every join (`CRAFT.md` §a.3).
- **Size:** smaller than before, a start value for the next G4 look clip: about 40-90 px, often partly hidden (behind a
  railing, in a window), at most 1 % of the frame unless the line is about it; a simple silhouette (>= 40 px) in a
  scale wide. Never in the caption band or the right rail, never over the subject.

## 6. The idle layer and secondary motion (never a still frame)
- **All idle life is tier B or C** (`CRAFT.md` §b), set by its weight, never cut to a low count: at most 3-4 noticeable
  supporting movers at a time (the small far ones at the references' level), B together <= 30 % of the motion and C
  <= 10 %, taking turns (~0.6 entries/s), none entering or turning in the 0.4 s around a join, so the subject keeps
  >= 60 % of the motion in its beat. A story-led shot's cadence comes from the story building to the words (as in
  reference 1), never from more movers.
- **Particles are tier-C life inside this budget, never a texture** (`lib/particles.tsx`, `CRAFT.md` §f.6; owner, v2
  G4: "a bit of particles here and there"): a few motes in the light, dust or pollen in the sun-side air, a leaf, glints
  in the sun's glitter path, far birds; declared at G3 among the `life:` items, a few a field and <= ~12 on screen,
  small, slow and a step lighter than what is behind them, growing in and shrinking out (the numbers: `CRAFT.md` §f.6);
  entrances take their turn and never touch the 0.4 s around a join (a steady field of motes or glints keeps its pace).
- **Profile first (§0).** STORY-LED shots run the full idle layer and cadence below. DENSE-CALM (cozy) holds run on a steady lane
  (1-5 movers, never zero: `COZY_AND_SCALE.md` 3b.4) and a locked or floating camera (3b.5), and keep at least ONE quiet
  ambient element on (the playbook's "ambient life that never stops"): slow weather or a slow cloud, steam, a window
  switching, an occasional bird; calmer than the movers in contrast and speed, outside the caption band, with no visible
  sway, shimmer or boil (neither cozy reference has any). The rest of the idle layer is optional there. "Never a still
  frame" holds for both.
- **STORY-LED: ambient on in every shot, from frame 0, at tier weight:** weather (snow, rain, leaves) or smoke or steam;
  clouds drifting by their size (a big cloud 0-6 px/s, thin bars 5-15: a fast cloud reads small, `CINEMATIC_GUIDE.md`
  Scale cues 10); one window or bulb changing at a time (every ~2-4 s, never a twinkle on every bulb); people at
  rest or walking; the character's idle; at most ONE periodic prop per shot (a swinging sign or tag, a fan, a clock
  hand, a forklift). On the G3 board these are the set panel's 2-3 ambient micro-moves (`loop: true`, at most one of
  them that prop: `G3_ANIMATIC.md` §4). Never all of them loud at once: the story's motion leads.
- **Cadence:** the story's beats land on the voice's words; between them supporting life keeps going, so no stretch over
  1 s has nothing moving; a burst (10+ items within 4 frames) only where the burst IS the beat (a number, a hero word:
  motion_spec §6, §9), never extra life competing with it. Events/s is information, never a target (2026-10-27).
- **Secondary motion:** the world reacts to the main action within 0.1-0.3 s (birds lift when a truck lurches, snow
  slides off a roof on a thud, heads turn, the character reacts). **Readability:** ambient motion is small, slow,
  low-contrast and off the subject's path; nothing in the background moves like the subject (v3 S9: dark specks in the
  sky read as birds where memory sticks were meant).
- **Smoothness:** ambient motion animates by time and moves every frame at 60 fps; only drawn poses step (12-24
  drawings/s); no opacity fades; deterministic (`rng`, seeds).

## 7. Information in the world (never a card on a blank wall)
- A chart, number or quote lives on a real object in the place the story is already in, never a new location made for
  it (`CRAFT.md` §a.2), entered by a push (A) or a card flip (E). **First choice, the home place:** a printout or a
  notebook on the desk, the phone in a hand, a note on the pinboard, a receipt, a price tag. Then the sequence's own
  place: a paper on its wall, a price board, a shop window. (The references did it in their streets: a paper on a
  noticeboard, ref 9.0; an ATM receipt, ref 22.0; posters on a board, ref 25.8; v1's street board 23.0, rooftop
  billboard 30.0, A-frame sign 44.0.) Around it: the place (wall, cornice, door, lamp, window corner, ground), the
  "you" or the character looking at it, strangers only small in the mid ground (`CRAFT.md` §a.3).
- The information stays straight-on, level and big (charts are never angled); the world goes round it. A matched
  insert (the same chart frame twice) keeps the same dressing; the "you" or the character's reaction carries the change.

## 8. What may stay calm
- **The caption band** (screen y ~290-600): flat wall or sky; weather may pass at half density or less, flakes <= 6 px;
  no ink, roof tops, heads or props.
- **Platform UI zones** (top y < 180, bottom y > 1520, right rail x > 950 / y 900-1500; the one definition:
  `G5_BLOCKING.md` §2 "Screen zones"): dressing yes (kerbs, the edges of things; no strangers' backs in front), key
  information no.
- **The quiet field** (15-35 %; a bounded floor seen from a balcony up to 50-60 %, `COZY_AND_SCALE.md` 3b.1) and **the
  subject's ring**. **One breath beat per film** (at most 2.5 s, usually after
  the heaviest line): the story pauses, the idle layer stays on, never a frozen frame.
- **Cozy holds** (DENSE-CALM, §0): little motion is fine, emptiness never: the fullness bar rises, the motion bar becomes
  `density.py --cozy` (§9).

## 9. How to check (before the owner sees a cut)
```bash
python3 -I scripts/qa/density.py <cut.mp4> --scenes src/vN/film/scenes.json [--only S9] [--cozy] [--json d.json]
python3 -I scripts/qa/gate_check.py ... --density     # WARN per shot; its film-average FAIL counts as a WARN (§0)
```
- Measure renders at half scale or more (fullness reads edges at 540 px wide); keep the default `--rate 30`. Look as
  well as measure: a side-by-side sheet at phone size (row 1 reference 1 from `assets/ref/`, row 2 v1, row 3 the cut) and
  the sound-off cold read (density must never bury the subject).
- The owner's cut renders at full size (1080 x 1920): at 0.5 scale the fine dressing lines blur (v3 G5's 540 x 960
  render added to "the quality and smoothness is not there").
- **Cozy holds: run `--cozy`** (method in the script header). It removes the camera's 2D shift first, then reads per shot
  `movers` (moving blobs per frame: >= 400 canvas px² changed, mean thickness >= 6 px; still people do not count), `empty`
  (the share of frames with no mover), `cv` (std / mean of the changed share over 0.2 s: steadiness, frame-rate
  independent) and `float` (the camera's path speed, px/s at 1080). Its marks (! / !!, a warning, never the verdict or the
  exit code): movers >= 2 (!! < 1), empty <= 5 % (!! > 20 %), cv <= 0.75 (!! > 1.2); aim cv <= 0.3 for a steady lane and
  keep up to 0.75 for one slow swell; float has no mark: ~0 when locked, 8-15 px/s for a float, 1-4 px/s is the invisible
  push that reads frozen. Measured: C3 river movers 2.9, empty 0 %, cv 0.14, float 10.1; C2 street 3.2, 0 %, 0.73, 0.2
  (locked); v3 G5 1.0, 56 %, 1.13, 2.3 (half its hold frames show no mover). Plus §0's fullness row from the default table.
- **Meter caveat: the default table misreads cozy holds**, so read its ev/s, gap and static there as information only.
  It counts a medium event at a chain's onset, so one long walk is one event: a calm lane with three long crossings scores
  ~1 ev/s and a 2.4 s "gap" (FAR) with a mover on screen in every frame (C3). Its static share misreads drawn cadence (C3:
  24 % from 25 drawn frames/s), and a push-in slower than a few px/s at the edge never crosses its change threshold (v3
  G5's 1.4 % push: static runs up to 0.8 s, truly frozen). Not in the meter yet (TO BUILD: the craft tooling lane,
  `PIPELINE_V2.md`): void, thing counts, colours per patch, layers and a STORY-LED-only film average; judge those by eye
  at phone size.

## 10. When each part is built
| gate | what |
|---|---|
| G3 board | signal only, but designed: the camera plan gets a "world" note per panel (the place, who watches, the character's spot) and every life item its tier and `life:` entry, so density is designed in with its hierarchy, never bolted on; the home set's density key is the film's bar (`G3_ANIMATIC.md` §3) |
| G4 look | the 6-8 s look clip (`PIPELINE_V2.md` G4): the home set dressed at final density and at its tiers, judged beside reference 1 and v1 (a cozy frame also against §0's DENSE-CALM row and `COZY_AND_SCALE.md` 3b.8) |
| kit (before the G5 lanes) | the film's own dressing for its settings, its people kit and the character's colourway, drawn new; every piece on the kit sheet at each size a panel uses, checked at 0.25 scale |
| G5 blocking | fills G3's plan: every placeholder and `life:` item made real at its tier, people placed, the character in every shot with key poses, no new movers, places or tier promotions; each set judged paused first (§0); density.py before the owner sees it (information), cozy holds by `--cozy` (§9) with a locked or floating camera |
| G6 polish | motion life refined inside the tiers, on movers that exist: secondary motion, reactions on the voice's words, the attention check (`CRAFT.md` §b; cozy holds: `--cozy`, §9); then edges (if the G4 clip approved them) and the optional halftone |

## The bar (our own frames)
Each film's bar is its own G3 density key: the home set fully dressed at its tiers (`G3_ANIMATIC.md` §3), then the
G4 look clip in colour. v3's approved G5b density pilot (2026-10-27, "go ahead yes"; `deliverables/v3/v3_g5b_pilot.mp4`)
shows only how FULL a world can be, in its O1 nook (photos on a cord, string lights, star, calendar, desk clutter, Pip,
the snowy town with lit windows, a shoveller, sliding snow, a car; measured flat 18 %, detail 50 %), never how much may
move or how it is drawn: the full G5b cut was judged "too busy, too incoherent ... too rough" (2026-10-27; `CRAFT.md`).
Its S4 (a chart in a new street place with a row of strangers' backs) is retired as a model (`CRAFT.md` §a.2-§a.3).
