# Life and density: every frame full and alive (generic, every video)

**The owner's rule** (OWNER_PLAYBOOK, Visual style; v3 G5, 2026-10-26: "way too empty ... those feel a lot more alive"):
every frame feels ALIVE at the level of reference 1 (France, `assets/ref/reference.mp4`) and v1 (PHP,
`deliverables/v1/php2shell_final.mp4`): a dense, specific world, people near and far, layered depth, a recurring living
character and ambient life that never stops. Feeling alive is the goal; the numbers are a warning signal, never a quota.
A big flat empty field, or an object alone on a blank wall, is a failure even in a draft. Sources: style bible §5-8,
motion_spec §5, 6, 9, `look/research/density_numbers.md`. Worked example: `docs/v3/density_plan_g5b.md`.

## 1. The bar (measured on the references; warning signals)

| signal (`scripts/qa/density.py`) | ref 1 | v1 | target | far under |
|---|---|---|---|---|
| medium motion events / s | 6.6 | 7.7 | >= 5 per film, >= 3.5 per shot | < 2.5 |
| longest gap without a new event | 1.00 s | 1.67 s | <= 1.0 s | > 2.0 s |
| near-static frames (longest run) | 1 % (0.07 s) | 3 % (0.40 s) | <= 5 % (run <= 0.4 s) | > 25 % |
| flat share (empty one-colour tiles) | 20 % | 32 % | <= 40 % (aim 35 %) | > 55 % |
| objects / canvas Mpx | 192 | 141 | >= 105 | < 70 |
| fine-detail tiles | 58 % | 45 % | >= 34 % | < 22 % |

What one frame holds (count it on a still at phone size):

| shot | quiet field | distinct props besides the subject | depth planes | people |
|---|---|---|---|---|
| wide / exterior | sky gap or ground, 15-35 % | 12+ | 3-4 | 10 to 300+ (far crowds count) |
| medium / interior | the wall or sky behind the captions | 8+ | 2-3 | 2+ (a silhouette in a window counts) |
| close / insert | the subject's own backing | 5+, cut by the frame edges | 2 | a row of 3-6 backs, or the character |

## 2. Composition: where the density goes
- **One quiet field, the rest loaded.** In thirds (y 0-640, 640-1280, 1280-1920) the quiet field (in 9:16 usually the
  wall or sky behind the caption band) takes at most one; every other third holds 3+ distinct props at 3 depths.
- **Hierarchy keeps the read.** The subject keeps the strongest value contrast, the hero colour and a calm ring (30-60 px
  of one value) round its silhouette; dressing sits one value step off its ground, ink by depth (front 4.8, mid 3.4,
  far 2.2, far planes fill only). The sound-off cold read must still pass at phone size.
- **Specific, varied, cut by the edges.** A pharmacy cross, a cart sign, a clock, never a generic block. Repeats vary
  (4-5 building types, books of 5+ widths, a different hat on each head). At least 2 elements cut by a frame edge in
  every shot; structural ink overshoots; the world goes on past the frame.
- **Colour jobs survive density.** Dressing never takes the hero colour or the pop (a shop's other laptops are boxes or
  neutral); it lives in the palette's room and outside families.

## 3. Dressing inventory by setting (pick 8+ per shot; drawing recipes in style bible §7-8)
- **Street:** facades of 4-5 types, windows 40-70 % filled (curtains, a plant, a person), balconies, shopfronts (fascia
  with a pictogram, display window, door, awning), hanging signs, wall lamps, doorbells, drainpipes, posters, cornices;
  lamp posts, wires with birds, trees, bikes, bins, bollards, A-frame signs, parked cars, kerb lines, ground specks;
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

## 4. People (house kit `Person` / `Crowd` / `TinyCrowd` in the video's palette; never hand-drawn per lane)
- **Back view always** (or rear 3/4): the head in the hair colour, a neck, a tombstone torso and one accessory each
  (beanie, hood, headphones, scarf, backpack, bag, raised phone); neighbours never share both hair and coat colour.
  Faces only in the protagonist's face beat. Extras are smaller and in mid colours, never mistaken for the protagonist.
- **Sizes by depth (1080 x 1920 canvas):** A, foreground backs: heads 90-160 px, bodies cut by the bottom edge (head tops
  ~y 1380-1560), 3-6 across, shoulders nearly touching, looking at the subject (on inserts and wall shots this row IS the
  density). B, passers-by cut by a side edge: 500-1000 px tall, as framing. C, mid walkers: 110-260 px tall (backpacks,
  bags, phones, a dog). D, far crowd: 15-60 px, fill only, rows x0.85 toward the horizon. E, window and balcony
  people: 12-40 px silhouettes in lit windows, moving.
- **They do things:** walk, carry, point, raise a phone, shovel, lean in, bob 2-3 px; on the voice's key word heads turn
  or a phone goes up, 0.1-0.3 s after the cause.

## 5. The recurring living character
- **One, in every shot** (reference 1: the cat and the sun; v1: Pip and the sun). Default: the channel's mascot **Pip**
  (`src/lib/mascot`, `docs/mascot.md`) in a colourway for the video's palette that stays its own hue (ΔE76 >= 20 from
  every ground it sits on, never the hero or the pop colour). A non-character anchor may join it (the sun by day, snow).
- **Jobs:** (1) perch on or beside the subject and watch it (sit-back, right or middle third); (2) point the eye: its
  head turns to the next subject a few frames before the voice names it; (3) react on a stressed word (ear flick, hop,
  trunk-up, ears-cover, shrug): one big reaction per shot at most, never on the subject's own beat; (4) idle always
  (blink, ears, tail, breath); (5) carry continuity: it goes where the story goes, and from G6 it hops in across cuts
  and the loop; (6) sleep or wait in the calm beat.
- **Size:** 86-130 px in wides and mediums, 1.8-2x in close-ups, a simple silhouette (>= 40 px) beside a tiny figure in
  a scale wide (where it becomes a scale anchor). Never in the caption band or the right rail, never over the subject.

## 6. The idle layer and secondary motion (never a still frame)
- **Always on, in every shot, from frame 0:** weather (snow, rain, leaves) and smoke or steam; clouds drifting at least
  10 px/s; lights (bulbs twinkling, a window switching somewhere every 0.6-1.5 s); people walking, breathing, bobbing;
  the character's idle; plus ONE small loop per shot (a swinging sign or tag, a fan, a clock hand, a forklift).
- **Cadence:** new medium events >= 5/s with no gap over 1 s; after a burst, at most 0.5 s of small settling events,
  never stillness; a big burst (10+ items within 4 frames) every 6-10 s on a number or a hero word (motion_spec §6, §9).
- **Secondary motion:** the world reacts to the main action within 0.1-0.3 s (birds lift when a truck lurches, snow
  slides off a roof on a thud, heads turn, the character reacts). **Readability:** ambient motion is small, slow,
  low-contrast and off the subject's path; nothing in the background moves like the subject (v3 S9: dark specks in the
  sky read as birds where memory sticks were meant).
- **Smoothness:** ambient motion animates by time and moves every frame at 60 fps; only drawn poses step (12-24
  drawings/s); no opacity fades; deterministic (`rng`, seeds).

## 7. Information in the world (never a card on a blank wall)
- A chart, number or quote lives on a real object in a real place, with people looking at it: a paper on a noticeboard on
  a street wall (ref 9.0), an ATM receipt (ref 22.0), posters on a board (ref 25.8), a paper pinned to a street board
  with more on a wire (v1 23.0), a rooftop billboard (v1 30.0), an A-frame sign (v1 44.0), a price board, a shop window,
  a phone in a hand. Around it: the place (wall, cornice, door, lamp, window corner, ground), a row of backs, the
  character on or under it.
- The information stays straight-on, level and big (charts are never angled); the world goes round it. A matched
  insert (the same chart frame twice) keeps the same dressing; the audience's reaction carries the change.

## 8. What may stay calm
- **The caption band** (screen y ~290-600): flat wall or sky; weather may pass at half density or less, flakes <= 6 px;
  no ink, roof tops, heads or props.
- **Platform UI zones** (top y < 180, bottom y > 1520, right rail x > 950 / y 900-1500): dressing yes (backs, kerbs,
  edges of things), key information no.
- **The quiet field** (15-35 %) and **the subject's ring**. **One breath beat per film** (at most 2.5 s, usually after
  the heaviest line): fewer events (>= 2.5/s), still no gap over 1 s, the idle layer on, never a frozen frame.

## 9. How to check (before the owner sees a cut)
```bash
python3 -I scripts/qa/density.py <cut.mp4> --scenes src/vN/film/scenes.json [--only S9] [--json d.json]
python3 -I scripts/qa/gate_check.py ... --density     # WARN per shot; FAIL when a film average is far under
```
- Measure renders at half scale or more (fullness reads edges at 540 px wide); keep the default `--rate 30`. Look as
  well as measure: a side-by-side sheet at phone size (row 1 reference 1 from `assets/ref/`, row 2 v1, row 3 the cut) and
  the sound-off cold read (density must never bury the subject).
- The owner's cut renders at full size (1080 x 1920): at 0.5 scale the fine dressing lines blur (v3 G5's 540 x 960
  render added to "the quality and smoothness is not there").

## 10. When each part is built
| gate | what |
|---|---|
| G3 board | signal only; the camera plan gets a "world" note per panel (the place, who watches, the character's spot), so density is designed in, never bolted on |
| G4 look | the style frame is dressed at final density and judged beside reference 1 and v1 |
| kit (before the G5 lanes) | the dressing inventory for the video's settings, the people variants and the character's colourway; every piece on the kit sheet at each size a panel uses, checked at 0.25 scale |
| G5 blocking | sets at full density, people placed, the character in every shot with key poses, the idle layer on (weather, lights, people idle, the character's idle, one loop per shot); density.py before the owner sees it |
| G6 polish | motion life refined: secondary motion, reactions on the voice's words, the cadence measured (>= 5/s, gap <= 1 s), the character's hops across cuts and the loop; then edges and texture |
