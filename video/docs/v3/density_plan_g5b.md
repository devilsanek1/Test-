# Video 3, G5b: the density and life plan (every panel full and alive)

**Why.** The owner on the G5 cut (`deliverables/v3/v3_g5_blocking.mp4`, 2026-10-26): "getting there, but the scenes are
way too empty ... compare with the France reference and our PHP video, those feel a lot more alive ... if those are the
final versions it's not good enough; the quality and smoothness is not there." The meter agrees: v3 G5 measures 2.6
medium events/s (reference 1: 6.6, v1: 7.7), a 3.55 s longest gap, 61 % flat, 16 % fine detail (`docs/look/research/
density_numbers.md`). Rules: `docs/look/LIFE_AND_DENSITY.md`. Everything below adds a world and life AROUND the locked
film. **Locked, never restaged:** the story, the voice, every cut, each panel's one idea, framing and camera
(`docs/v3/storyboard_g3.md`, `docs/v3/camera_plan_g3.md`), the kit's consistency contract and colour jobs
(`src/v3/film/kit/README.md`). Times are VO seconds (a panel's local t = VO - its start).

**The cut the owner sees next says its stage:** "G5b: dressed sets, people, Pip and the idle layer, full size, 60 fps;
next G6: motion life refined (secondary motion, reactions, hops across cuts), edges and paper; then G7 sound." Render it
at full size (1080 x 1920): the 540 x 960 G5 render blurred every fine line.

## 0. Film-wide

**The living character: Pip, the channel's purple elephant, redrawn in Autumn Ember.**
1. Pip IS the channel: the profile picture and v1's star; one mascot in every video makes each one recognisably ours
   and turns viewers into followers ("profile identity: Pip in the film's style", playbook).
2. Pip is already a full actor (`src/lib/mascot`: sit-back, sit-front, peek, sleep, trunk-up, ears-cover, shrug, walk,
   hop, idle life, the no-fade build), so it does the reference cat's jobs from G5 with no new drawing.
3. A cat would only copy the reference and add a second creature; Pip is "your" companion in the nook and goes where the
   story goes (shop, roof, van, the drivers' room), like the cat crossing every scene.

- **Colourway `PIP_EMBER`** (a `Colorway` object in the v3 kit, passed as `<Elephant colorway>`; lib defaults untouched):
  body lilac `#A983C9` (L* 61), shade one flat step darker (~`#8C68AE`), ear inner and cheeks `EMBER.nail` `#F4A988`, ink
  `EMBER.ink`. ΔE76 from its grounds: wall 56, desk 62, shelf 58, sky 28, skyLow 23, data center 33, snow 49, road 36,
  brick 66; from the blue pop 33 and the hero 82. The old periwinkle `#8D90CC` sits only 10 from `skyLow` and 19 from
  the sky: it would vanish outdoors. Outdoors Pip also gets a snow-lit rim (a light sliver along its head and back).
  The kit lane confirms the numbers on the sheet; Pip's lilac is used for nothing else.
- **Sizes:** ~96 px (scale 1) in mediums and wides, 1.6-1.9x in the close-ups (S8, S16), a 50-60 px `PipTiny`
  silhouette (ears and trunk) at the end of S9.
- **The idle layer, film-wide:** snow everywhere outdoors and in every window (near, mid and far layers); warm string
  lights indoors (a bulb twinkles every ~0.5 s); neighbours' lit windows switching (somewhere every 0.6-1.5 s); the data
  center's LEDs blink and its cooling plume rises; smoke from chimneys; steam from mugs; people walk and breathe; Pip's
  idle (blink, ears, tail, breath); one small loop per shot (named per panel).
- **One town:** your house on a hill street; the data center beyond the houses (the window views); the chip factory up
  the road (S10, S14); the computer shop on your street (S4-S6). The same house types, lamp posts and snow everywhere.
- **Shared sets (one file each, so matched frames stay matched):** `O1_set` (O1, S15, the loop underlay), `DESK_set`
  (new: S7, S12, S16, S8's edges), `S4_street` (new, replaces `S4_wall` for S4 and S6), `DOCK_room` (new, S11),
  `S10_set` (S10, S14). S5, S9 and S13 dress their own files with kit pieces.
- **Per-shot targets (warning signals):** >= 3.5 medium events/s (S13, the breath beat: >= 2.5), no gap over 1 s, flat
  <= 40 %, fine detail >= 34 %. Run `scripts/qa/density.py` on each panel render before assembly.
- **Calm everywhere:** the caption band (y 290-600) stays flat wall or sky (snow at half density, flakes <= 6 px);
  platform UI zones carry dressing only; each subject keeps a calm ring and the strongest contrast; dressing never takes
  the hero colour or the blue pop (other laptops are boxes or neutral); far planes behind glass stay fill-only.

## 1. Per panel

### O1 (0-5.80) HOME BASE nook, POV, pull out 1.05 to 1.00 (meter: 6.2 ev/s, gap 1.23 s, 39 % flat, 32 % detail)
- **Locked:** the tag, then the data center; sticks launch at 1.88, 2.18, 2.40, 2.60, 2.72 and tick the tag; the phone
  lowers 3.64-4.00; the sign lights at 4.04; the window top at y 613 or lower.
- **Room:** the shelf mass (x 0-150) filled below y 600 with varied books (upright and lying), a framed photo, a pen jar
  and a trailing pothos over the shelf lip (y ~650-900); warm string lights along the attic beam (10 bulbs, y < 290); a
  small framed print on the wall right of the window (x 910-1060, y 640-860); frost in the glass's lower corners and a
  snow ridge on the outside sill; a succulent on the inside sill under the lamp.
- **Desk (from y 1086):** back row along the sill: the mug (steam, as built), a 2-book stack with a pen cup (x 780-900),
  headphones (x 90-240); front (y > 1500): the notebook corner with a pen, sticky notes, glasses, and a charger cable from
  the phone's bottom edge snaking out of frame (it moves with the phone when it lowers); 4-6 wood-grain strokes.
- **Window life (fill-only, behind the data center):** 2-3 near house fronts below the horizon (y 950-1060) with snowy
  roofs and 6-10 warm lit windows, 2 with silhouettes (one crosses at ~1.2, one sits reading); smoke drifting right from
  their chimneys; a far town band either side of the building with tiny lit windows; a street lamp's head with a warm
  halo right of the phone (x 740-900, y 1020-1060) and one tiny walker crossing it (2.9-5.8). The data center: LEDs blink
  and a cooling plume rises from its 3 roof units (clipped by the glass); after 4.04 the LEDs go out, the plume stays.
  Snow: ~40 far and ~8 near flakes in the glass. No wire or birds in the glass: the sticks fly there.
- **Pip:** on the inside sill, right third (feet y 1060, x ~800-920), sit-back. 0-1.88 looks down at the phone ($999);
  at 1.88, 2.18 and 2.40 its head follows each stick up the glass (it points at the cause); 2.60-2.72 ("pricier") ears
  up and a small hop; 4.04 (the building goes dark) ears droop, a small ears-cover; tail swish idle throughout.
- **Frame 0:** the dressing draws on with the scene (30-60 % drawn, lighter ink than the window, phone and tag); colour
  floods by 0.2; bulbs blink on one by one 0.3-1.0; books, plants and Pip pop 0.2-0.9. Dressing builds end before 1.88.
- **Idle and gaps:** snow, smoke, plume, steam, bulbs, the pothos swaying (+-3 px, 3 s), Pip; the loop is the plume.
  Fill 4.1-5.8 (after the turn): a neighbour's window switches off (4.6), the walker reaches the lamp (5.0), a plume puff
  and Pip's tail (5.3).
- **Calm:** the caption band (wall), the tag's ring until 4.04, the sign panel.

### S4 (5.80-9.48) + S6 (11.48-16.60) INSERT: the noticeboard of the computer shop on your street
(meter: S4 0.3 ev/s, gap 3.55 s, 73 % flat, 4 % detail; S6 0.4 ev/s, 47 % static, 71 % flat, 5 % detail)
- **Locked:** straight-on and level; the card (x 140-940, y 615-1350) and the line as built; S6 = S4's exact frame plus
  the hook (from 12.82) and "+9.7%" (14.72); the 1.5 % breathe. The card's size and place stay (if the board needs room,
  at most 8 % smaller, never moved up).
- **Place:** the board hangs on the shop's street wall at blue hour in the snow, lit warm by the shop's window and a wall
  lamp, so the wall stays `EMBER.wall` and the captions stay ink. The same shop as S5.
- **Board:** an Ember noticeboard (red-brown `beam` frame, glass glints) round the card with a 24-30 px margin (top rail
  at y >= 600); 3-4 other papers peeking out at its corners, outside the card (a lost-cat flyer with tear-off tabs, a
  concert poster corner, a business card), pins.
- **Wall:** above the band (y 0-290) the shop's cornice (double line overshooting both edges, snow on top, 4 icicles) and
  the fascia "COMPUTERS" (letters ~56 px, y 130-250); left strip (x 0-115) the shop's lit display-window corner cut by
  the edge (boxes and a monitor, never hero laptops) and a drainpipe with an ice drip; right strip (x 965-1080) the glass
  shop door cut by the edge (a warm glimpse inside, an OPEN sign, a bell) under a round wall lamp (y 640-720, halo step).
- **Ground (y 1380-1920):** snowy pavement, kerb lines (2-3, with gaps), footprints, one ink-only bike at the left edge.
- **People:** a row of 5 backs along the bottom (heads 100-150 px, head tops y 1440-1540, cut by the bottom): beanie
  with pompom, fur-trimmed hood, long hair and scarf, cap, earmuffs; snow on hats and shoulders; one holds a phone up
  at the card (its top below y 1360). All look up at the chart.
- **Pip:** on the board's bottom rail, right corner (feet y ~1385, x ~820-920), sit-back, head tilted up at the line.
- **S4 moves:** idle = snow, staggered breathing bobs (+-2 px), a pompom wobble, the OPEN sign swinging (+-4 deg, 1.6 s:
  the loop), flyer tabs fluttering, icicle drips (one every ~1.2 s), a car's headlights sweeping across the wall (a flat
  band one step lighter, 0.8 s, at ~6.4 and ~8.6). Reactions: "Laptops" (7.08) the phone goes higher and a flat flash
  star pops for 2 frames; "better" (7.88) Pip nods along the falling line; "same money" (8.52) a back nudges its
  neighbour. Nothing big moves beside the line while it draws.
- **S6 moves:** the S4 frame at the cut. 11.6-12.8 idle, and a sixth person squeezes in from the right edge (rises from
  the bottom, 12.2); "US" (12.92) heads lean in as the hook starts; "up" (14.52) as the line turns up the row recoils
  (heads back 6-10 px, staggered by 2 frames), the phone drops, one arm points at the hook, Pip goes trunk-up; "+9.7%"
  (14.72) pops alone (nothing else new for 0.25 s); 15.1-16.6 settling: two backs turn to each other, Pip turns to us
  (worried), a headlight sweep (15.8), snow slides off the cornice (16.2).
- **Calm:** the band (flat lit wall); the card's plot (no flyer, head or phone inside it); the right rail holds only the
  door edge.

### S5 (9.48-11.48) MEDIUM, waist-up: inside the computer shop, the face beat (meter: 1.0 ev/s, 63 % flat, 17 % detail)
- **Locked:** you behind the counter (cut at the waist) with the $999 laptop and tag; the BETTER laptop pops onto the
  shelf upper right (10.06), your face turns worried on "after" (10.20); hold.
- **Shop:** right (x 560-1080, y 620-1400) a shelving unit of 3 shelves round the BETTER slot: laptop boxes with an ink
  laptop icon (kraft and cream, never hero), a monitor with a screensaver loop, a router with blinking `led` dots,
  headphones and cable packs on hooks, cream shelf talkers. Left (x 0-330, y 620-1300) the shop's front window onto the
  snowy street (dusk-blue glass, a lamp post with a halo, falling snow) with a headphone stand on its sill. Top (y < 290)
  a lit ceiling strip light and the shelving's top. Counter (y 1400-1920): a card reader (`led` blink), a receipt
  printer, a paper bag with handles, a jar of USB sticks, a bell; panel lines and a sticker on its front.
- **People:** 2 passers-by outside the window (180-260 px: one with an umbrella, one with a dog, walking 9.6-11.4); one
  other customer's back cut by the left edge (x 0-170, y 900-1400, beanie, holding a box).
- **Pip:** on the counter left (feet y ~1410, x ~220-330), sit-back, looking up at you and your laptop; on "after"
  (10.20) its head whips to the BETTER laptop 2-3 frames before your face turns (it points the eye); "buy one"
  (10.60-10.92) it looks back at us and shrugs.
- **Moves:** idle = snow and walkers in the window, the screensaver, the router LEDs, your breathing; the receipt printer
  feeds a receipt that curls over the counter edge (9.7-10.3, the loop); the BETTER pop jolts the shelf (things hop 4 px).
- **Calm:** the band (the shelving starts under y 600); a ring of one value 40 px round your head and face (no shelf
  edge or window frame crosses it); the window sits left, never behind your head.

### S7 (16.60-18.28) CLOSE at your desk, home base (meter: 0.6 ev/s, 88 % static, 71 % flat, 11 % detail)
- **Locked:** the laptop (420 px) in the lamp pool, the lamp shade cut by the left edge, the see-inside bubble upper right
  (x ~560-780, y ~615-800) on "your" (17.14). No window: it is saved for O1, S13 and S15.
  **Overridden (G5b fixer, review of the full cut):** "no window" gave the one desk two back walls (O1 / S13 / S15 face the
  window; S7, S8, S12 and S16 faced a pinboard wall). S7 / S8 / S12 / S16 now show O1's window behind the laptop / tag
  (`scenes/desk_window.tsx`), the pinboard a side piece; framing and camera unchanged.
- **DESK_set:** on the wall (y 600-1000) a pinboard between the lamp and the bubble (x 180-470, y 620-840: photos,
  sticky notes, a sea postcard, a ticket) and a small shelf on the right (x 820-1080, y 640-800: a plant, 3 books); 6-8
  string-light bulbs hanging from the top edge (y < 280). Desk back row (y 1000-1100): a book stack, a pen cup, a small
  speaker, the mug (steam). Front (y > 1400): your phone face down cut by the bottom edge, the notebook and a pen, sticky
  notes, glasses, a charger cable running into the laptop's side port (it leads the eye in); 4-8 wood-grain strokes; the
  lamp's pull chain.
- **Pip:** on the desk right of the laptop (feet y ~1180, x ~800-900), sit-back, watching the laptop; on "your" (17.24)
  it rises on its toes and looks up at the bubble (it points at the stick inside).
- **Moves:** idle = steam, bulbs, the shelf plant's leaf swaying, the pull chain swinging (the loop), Pip; a sticky note
  flutters (16.7); the screen's glint slides across (17.6).
- **Calm:** the band; nothing pinned behind the bubble; the laptop's silhouette.

### S8 (18.28-19.40) EXTREME CLOSE, cut-in, scale 1/3 (meter: 0.9 ev/s, 28 % static, 56 % flat, 13 % detail)
- **Locked:** the keyboard cut by both side edges, the stick (700 px) rising out of the keys (0.4 s) onto the hinge, the
  pool's edge below, the screen plain dark.
- **Edges only (the stick owns the frame):** a sticky note with a scribble on the bezel's top-left corner; hairline key
  legends on 6-10 keys; the charger plug in the side port at the right edge and the mug's side cut by the right edge
  (steam); the notebook's spiral and a pen cut by the left edge (y 1450-1700); the lowest string-light bulbs only above
  y 280.
- **Pip:** peeks up from behind the keyboard's front edge, bottom left (x 90-330, head and trunk over the edge at y
  1350-1520), at 1.9x (~180 px), eyes wide; on "chips" (18.76) its trunk reaches toward the landed stick and sniffs. The
  700 px stick beside a 180 px Pip is the scale cue: one stick bigger than the character.
- **Moves:** idle = steam, Pip; 3 keys spring back up after the stick leaves them (secondary, 0.1 s); the stick settles
  with a 2 deg wobble after landing (the loop).
- **Calm:** the screen behind the stick's top half; the stick's ring; the band.

### S9 (19.40-22.68) SCALE: the S5 pull-back crane (meter: 6.4 ev/s, gap 1.17 s, 50 % flat, 26 % detail)
The owner: "how great the scale feels" (Arcane's rooftop end frame): a world that keeps going, a landmark huge yet far,
tiny anchors, the drop below, a big sky, many layers.
- **Locked:** the move (19.40-21.98 on its ease, the planes, the chimney-pot wipe 20.67-20.83), the start and end frames,
  the hall's lit sign, the mountain landing on "mountain" (21.72), tiny you (180 px) at our parapet, the summit at y 626,
  plain sky over the band.
- **Pip:** start: on your left shoulder (~90 px, sit-back), head turned right with you toward the slot; behind the pot's
  wipe it moves to the parapet lip; end: a 50-60 px `PipTiny` sitting on the lip at your left (two backs at the rail,
  like Arcane's two sisters); a small startled hop on the thoom (21.72).
- **Our deck (warm, box-to-box clutter):** potted plants under snow, a folding chair with a snow cushion, a small table
  with a steaming mug, a laundry line with 3-5 pieces swaying, a snow shovel against the vent, footprints in the deck
  snow leading to you, fairy lights along our parapet lip.
- **Mid town:** at least 5 house types (gabled cottage, 3-storey terrace with dormers, flat-roof block with balconies,
  a corner shop with a lit sign, a mansard) of varied heights, never one stamped shape; chimneys with smoke drifting
  right; antennas and satellite dishes; 40+ lit windows (a few switching, 6-8 with silhouettes); string lights zigzagging
  across the lit street; 10-16 tiny walkers on it (15-30 px; one pulling a sledge, one with a dog) and one car creeping
  up with its headlights on; neighbours on 2 roofs (one shovelling snow, one hanging lights on a balcony).
- **Far, the world keeps going:** 3-4 more rows of roofs past the hall, each a flat step paler toward `skyLow`, fill
  only, hundreds of tiny lit windows; a tram with lit windows crossing a far viaduct (120-200 px, slow, right to left);
  a pale low snow-cloud bank on the horizon behind the hall, so the dark hall and the mountain stand against the palest
  shape; big flat cloud masses above the band (y < 290) drifting 6-10 px/s.
- **Birds in the hold only:** a V of 4-5 (16-24 px, clear V wings, lighter than the sticks, flapping) crossing the left
  sky (x 100-500, y 650-820), far from the stick streams.
- **Moves:** the move carries the shot; idle = 3 snow layers (near flakes 8-10 px streak past during the move and sell
  its speed), smoke, bulbs, walkers, the tram, the car, clouds; the thoom (21.72): snow puffs off the nearest roofs and
  our parapet, Pip hops.
- **Calm:** the band (clouds only above 290, snow at half density); nothing crosses the sign or the summit; the slot is
  the brightest patch at the start (no lit window competes); Pip's swap is hidden by the pot like yours.

### S10 (22.68-25.24) + S14 (33.40-36.36) the queue at the chip factory, one set `S10_set`
(meter: S10 2.7 ev/s, 69 % flat, 15 % detail; S14 5.7 ev/s, 64 % flat, 18 % detail)
- **Locked:** medium-wide, slightly high; the road from the van (near, bottom left, 380 px, waiting dots) up to the
  factory door (far, upper right); the data center first at the door, sticks flying from the door into its roof; S14 =
  the same frame plus the chip maker speaking (33.56), 2026 to 2027 (34.60), the van pushed back (34.60-34.90) and the
  second data center cutting in (34.76).
- **The road:** kerbs both sides (2-3 long lines with gaps), snowbanks along them (ink on the ridge only), two tyre
  tracks one step darker, faint lane dashes, a manhole, footprints on the pavements. The flat slab becomes a street.
- **Left side:** a pavement with 5 lamp posts receding (lit, halo steps, ~300 px near to ~70 px far), 3-4 snowy trees
  between them, a row of houses and shops facing the road (lit windows, 3-4 silhouettes, a shop sign), a bus stop with
  2-3 people waiting, 3-4 walkers heading up the road (one with a dog), cars parked on the kerb with snow on their roofs.
- **Right side:** the factory yard's fence receding to the gate (posts, snow on top), a lit guard booth with a barrier
  arm at the gate, a DELIVERIES sign on posts, pallets with snow.
- **The factory:** 2-3 workers in hi-vis (50-80 px) and a forklift carrying a crate of sticks at the door (a short
  back-and-forth loop), floodlights on the brick wall (halo steps), its sawtooth windows lit, the chimney steam as built.
  The data center: LEDs blink, a cooling plume kept under y 600.
- **Wires:** a utility line from a pole on the left kerb across the road to the factory, 4-5 birds sitting on its left
  half (y ~700-820). **Sky:** flat; cloud masses above the band (y < 290) drifting.
- **Foreground:** 2-3 backs on the near pavement, bottom right (heads 100-140 px, head tops y ~1480, x 600-940, cut by
  the bottom): a parent and a kid pointing up the queue. About 20 people in the frame.
- **Pip:** on the van's roof (sit-back, ~90 px, looking up the queue), snow slowly capping its head.
- **S10 moves:** idle = snow, steam, plume, LEDs, the forklift (the loop), workers carrying, walkers (1.6 steps/s), the
  van's exhaust puffs (every 0.6 s) and wipers, windows switching; a car passes on the far cross street (23.4). "pay"
  (22.92) the guard steps out of the booth; "first dibs" (24.20) the barrier lifts for the data center (0.25 s), the
  guard waves it in, Pip's ears droop.
- **S14 moves:** the same idle; "chip" (33.56) the workers at the door stop and turn to the chip maker (they point the
  eye at the speaker); 34.60-34.90 the van is pushed back: Pip slides and clings (ears flying), snow falls off the van;
  34.76 the second data center cuts in: the birds lift off the wire and wheel away, the bus-stop heads turn, the barrier
  lifts for it (35.0); Pip shakes the snow off (35.3).
- **Calm:** the band (nothing new above y 600 beyond the built chimney); the queue reads in order (no other vehicle in
  the lane: parked cars stay on the kerb); no sign or word in the right rail.

### S11 (25.24-29.40) INSERT: the drivers' room at the factory gate, set `DOCK_room` (meter: 1.2 ev/s, gap 2.87 s, 72 % flat)
- **Locked:** straight-on and level; the card and bars as built (the light "last year" bar; the dark bar growing from
  26.04 to land on "costs" 26.36; "5x" at 26.98); the 1.5 % breathe.
- **Place:** the warm waiting room by the loading dock where the laptop van's driver waits; a light plaster wall
  (`EMBER.wall`), so the captions stay ink.
- **Board and room:** a framed cork price board round the card (24-30 px margin, top rail at y >= 600) with a clipboard
  and two delivery slips pinned at its corners outside the card; above the band a ceiling strip light (y < 290; it
  flickers once, stepped, at 26.0) and a cable tray; left strip (x 0-115) a window onto the dock cut by the edge
  (dusk-blue glass, snow, a truck's lit tail lights, a forklift passing 25.4 and 27.6-28.6); right strip (x 965-1080)
  a coffee machine's edge with a lit button and a steaming cup, a no-smoking plate; ground (y > 1380) a bench edge, a
  crate of gold sticks, a mat with snowy boot prints.
- **People:** a row of 4 drivers' backs (heads 100-150 px): the laptop van's driver in a cap with a small laptop badge,
  a beanie, a hi-vis vest, a hood; one holds a coffee (steam), one a clipboard.
- **Pip:** on the crate, bottom right (feet y ~1500, x ~780-880), sit-back, looking up at the bars.
- **Moves:** idle = steam, the window's snow and forklift, breathing, the clipboard's papers fluttering (the loop). Fill
  25.24-26.0 (the old gap): the forklift in the window (25.4), a driver sips (25.8), the strip-light flicker (26.0).
  "costs" (26.36) the heads tilt up following the dark bar (staggered 2 frames); "five" (27.08) the van driver pushes his
  cap back, the clipboard's papers lift, Pip ears-cover; 28.1-29.4 settling: two drivers look at each other, a sip.
- **Calm:** the band; the plot (nothing pinned inside the card); the "last year" label.

### S12 (29.40-31.32) CLOSE on the tag, S7's angle, `DESK_set` (meter: 1.0 ev/s, 49 % static, 70 % flat, 12 % detail)
- **Locked:** the 5x stick slides into the laptop; the tag is the subject: $999 struck on "makers" (29.90), $1,099 on
  "pass" (30.26, the ding).
- **Dressing:** `DESK_set` as in S7 (pinboard, string lights, shelf plant, books, pen cup, the phone face down, notebook,
  cable, sticky notes, grain), arranged so the tag's ring stays clear.
- **Pip:** on the desk left of the tag, leaning in to read it; on "pass" (30.28), when $1,099 pops with the ding, it
  recoils (squash) and its ears drop; "on" (30.84) it looks at us, worried.
- **Moves:** idle = steam, bulbs, the plant, the tag's sway (the loop), the pull chain; on the ding the pinned notes
  flutter and the steam puffs.
- **Calm:** the tag and its ring; the band.

### S13 (31.32-33.40) HOME BASE returns, medium-wide, 3/4 back: the film's breath beat (meter: 0.0 ev/s, gap 2.08 s, 50 % flat)
- **Locked:** you seated facing the window (the darkest shape), the wall clock upper left, the thought bubble with the
  BETTER laptop above your head, the window on the right with the far data center silhouette (no sign), the lamp and
  pool by it; HOLD (the stillness is the waiting).
- **Window (fill-only):** O1's street life: near house fronts with lit windows and 2 moving silhouettes, chimney smoke,
  a lamp post, 1-2 walkers passing below, 2 snow layers, a snow ridge on the outside sill, frost in the corners; the
  silhouette keeps a slow plume.
- **Wall:** the shelf filled (books, a jar, a trailing plant); warm string lights along the window's top frame (12
  bulbs, y 615-650, under the band); a pinboard low left (x 30-260, y 1050-1300) and a framed print; a coat and scarf on
  a hook by the shelf; a radiator under the window with a sock drying on it.
- **Desk under the window:** the laptop closed, books, a desk calendar on 2026 (it sets up S14's 2027), a pen cup,
  headphones, the mug (steam) and the lamp as built.
- **Floor (y > 1400):** a striped rug, a tote bag, slippers, a floor plant cut by the right edge, a cable.
- **Pip:** asleep on the rug (sleep pose, slow breathing, z's popping every ~0.7 s): it waits with you.
- **Moves (>= 2.5 events/s, no gap over 1 s, nothing big):** the clock's second hand (as built, the loop), Pip's z's,
  snow, smoke, steam, bulbs, a neighbour's light switching on (32.1), a walker passing (31.6-33.2), your foot tapping
  (every 0.5 s, 3 px), a weight shift on "better" (32.60), the bubble's laptop bobbing +-3 px.
- **Calm:** the band (the string lights stay under 615); a 60 px ring round your head and the bubble; no light brighter
  than the window glass.

### S15 (36.36-38.84) HOME BASE callback = O1's end frame (meter: 1.6 ev/s, gap 1.41 s, 41 % flat)
- **Locked:** O1's end frame exactly (the dark named data center above your lowered phone, struck $999 and $1,099); hold.
- **Dressing:** `O1_set`, identical: the room, the desk, the window life, Pip on the sill.
- **Pip:** as at O1's end, facing the dark building; on "ends up on your" (38.12-38.68) its head turns from the building
  down to the tag (it draws the line from cause to effect); a slow tail swish.
- **Moves:** O1's idle (snow, smoke, plume, bulbs, the pothos, steam, the tag's sway); a neighbour's window switches off
  (37.0); the walker passes under the lamp (37.6).
- **Calm:** as O1's end: the band, the sign, the tag.

### S16 (38.84-41.15) CLOSE-UP cut-in on the tag, `DESK_set`; the loop seam (meter: 4.3 ev/s, 57 % static, 71 % flat)
- **Locked:** the tag (460 px) on S15's axis; it turns over at 39.70 to show the data center on its back (like-pop
  39.88); the un-build 40.85-41.15 into O1's bare lines (the sky slab dropped while un-building).
- **Dressing:** `DESK_set` at this framing, at the edges: the laptop cut by the left edge (as built), the mug, the
  lowest bulbs above the band, the pinboard's corner, the plant, the phone's cable, sticky notes, the pen cup at the
  right edge.
- **Pip:** on the desk right of the tag (x ~790-920), sit-back at 1.6-1.9x, watching the tag; it leans in as the tag
  turns (39.70), a small trunk-up on the like-pop (39.88), a shrug at us (40.3); it shrinks with the un-build. G6: it
  hops toward its O1 sill spot during the un-build (the reference cat's loop jump).
- **Moves:** idle = steam, bulbs, the tag's sway (the loop), Pip; 40.1-40.8 settling (the string swings, a leaf, a
  bulb): no stillness before the un-build.
- **Calm:** the tag and its back's drawing; the band.

### LOOP seam (40.85-41.15)
O1's `t < 0` underlay carries the dressing's bare lines (and Pip's), so S16 un-builds onto a full bare-line frame 0,
never an empty one. The S16 lane checks the last 0.3 s strip and frames 0-6 (`docs/G5_BLOCKING.md` §8).

## 2. Kit list (the kit lane builds and sheets these first, every piece at each panel size, checked at 0.25 scale)
"Reuse" = a house component (`src/lib/kit`, `src/lib/cine`), restyled by `palette.ts`, checked in Ember on the sheet.

| piece | panels | sizes (canvas px) | variants / notes | base |
|---|---|---|---|---|
| `Pip3` (Elephant + `PIP_EMBER`) | all | 96 (scale 1), 170-190 (1.6-1.9x) | poses sit-back, sit-front, peek, sleep, trunk-up, ears-cover, shrug, hop; `look`; snow-lit rim outdoors; `snowCap` | reuse mascot + new colourway |
| `PipTiny` | S9 end | 50-60 | silhouette that reads from 40 px (ears, trunk curl), sit on a ledge, hop | new |
| winter `Person` / `Crowd` | S4-S6, S9-S11, S14 | tiers A 90-160 heads, C 110-260 tall, D 15-60 | new acc: earmuffs, pompom beanie, shopping bag, umbrella, hi-vis vest, coffee cup, clipboard; `snow` on hats and shoulders | reuse + new acc |
| `WindowSilhouette` | O1, S5, S9, S10, S13-S15 | 20-70 window | a figure crossing, reading, waving; light on / off (pop) | new |
| `Worker`, `Guard` | S10, S14 | 50-110 | hi-vis carrying a crate; guard in the booth, waving | new (Person / ChipMaker) |
| `ShelfFill` | O1, S13, S15 | shelf 150 x 900 | books 14-40 wide x 80-150 tall in 5+ `EMBER.books` colours, lying stacks, framed photo, jar, trailing plant | new |
| `Plant` | O1, S7, S12-S16 | 40-450 | trailing pothos (sways +-3 px), succulent, snake plant, floor plant; snow-covered pots (S9) | new |
| string lights | O1, S7, S9, S12-S16 | bulbs 6-16 | along a beam, a window top, a top edge, across a street, along a parapet; twinkle schedule | reuse `Festoon` / `StringLights` |
| `Pinboard` | S7, S12, S13, S16 | 260-420 wide | 5-7 pinned items (photos, sticky notes, sea postcard, ticket); notes flutter | new |
| desk clutter | O1, S7, S8, S12, S13, S16 | x1 POV, x1.4 close, x2.4 edge-cut | pen cup, headphones, book stack, sticky notes (room colours only), charger cable (a path, plug), glasses, desk calendar (2026), speaker; `Mug`, `Notebook` exist | new |
| `DeskGrain`, wall hints | all interiors | 4-8 strokes | wood grain on the desk, plaster marks on walls, hairline key legends (S8) | new |
| `Radiator`, `Rug`, floor clutter | S13 | radiator 360-480 wide, rug 700-900 | sock on the radiator; striped rug; tote bag, slippers, cable; coat hook with coat and scarf | new |
| `NearRoofs` | O1, S13, S15 | strip 720 x 110 | 2-4 house fronts, snowy roofs, lit windows with silhouettes, chimneys; fill only behind glass | new (`NookOutside` option) |
| `ChimneySmoke`, `CoolingPlume` | O1, S9, S10, S13-S15 | puffs 8-40 | a flat puff train that rises, drifts and shrinks to nothing (no fade), 2-3 s loop; plume = a `DataCenter` option, never above y 600 | new |
| snow layers, `SnowSill`, `Frost` | all outdoor and window shots | flakes 2-10 | near / mid / far layers with parallax; half density in the band; sill ridges; frost corners | extend `Snowfall` |
| `S4_street` | S4, S6 | full frame | cornice with icicles (drip), fascia "COMPUTERS", wall lamp, drainpipe, display-window corner, glass door with an OPEN sign (swings), pavement and kerbs, bike, headlight sweep | new set |
| Ember noticeboard | S4, S6 | card + 24-30 margin | `beam` frame, glass glints, corner flyers (tear-off tabs flutter), pins | reuse `Noticeboard`, `Paper` |
| `ShopShelving`, `ShopWindowView`, counter props | S5 | shelving 480-560 wide | boxes with an ink laptop icon, monitor with a screensaver, router (led blink), hooks; street view with walkers; card reader, receipt printer (feeds), bag, jar of USB sticks, bell | new |
| `RoadDress` | S10, S14 | perspective | kerbs, snowbanks, tyre tracks, lane dashes, manhole, footprints | new |
| lamp posts, snowy trees, parked cars | S9, S10, S14 | 70-300 posts, 80-300 trees, 120-240 cars | lit with halo steps; snow caps; cars 3/4 from above with snow on the roof | reuse `LampPost`, `Tree`, `Car` + snow variants |
| `Fence`, `GateBooth` + barrier, `DeliveriesSign`, `Floodlight`, pallets | S10, S14 | booth 120-180, arm 200-300 | the barrier lifts in 0.25 s (stepped pivot); sign letters >= 22 px | new |
| `Forklift`, `StickCrate` | S10, S11, S14 | forklift 120-200, crate 60-160 | a back-and-forth loop; gold sticks showing in the crate | new |
| `BusStop` | S10, S14 | 160-240 tall | shelter with 2-3 waiting people | new |
| wires and birds | S10, S14 | birds 14-24 | `lift` at a time: birds take off and wheel away | reuse `Wires`, `BirdsOnWire` + `lift` |
| `DOCK_room` | S11 | full frame | cork price board, strip light (one stepped flicker), dock window (truck lights, forklift), coffee machine, bench, mat with prints | new set |
| town variety | S9 | mid houses 90-200 wide, far 30-60 | 5+ house types, chimneys with smoke, antennas, dishes, lit windows switching; 3-4 far rows paling into haze | extend `MidTown` / `TownBand`; reuse `EndlessCity`, `LitWindows` |
| `RoofNeighbour`, `Tram` | S9 | 30-60; tram 120-200 | shoveller (4-drawing loop), balcony light-hanger; tram with lit windows | new |
| `DeckClutter` | S9 | box-to-box, 60-140 at the end | plants under snow, folding chair, table with a mug, laundry line (sways), shovel, footprints, parapet lights | new |
| snow clouds, birds V | S9, S10, S14 | clouds 300-900 wide; birds 16-24 | a pale low bank behind the hall; masses above the band, drifting 6-10 px/s; flapping V | reuse `SkyCloud`, `HazeBand`, `Birds` |
| idle helpers | all | - | `twinkle`, `windowSwitch` (every 0.6-1.5 s), `sway`, `bob`, `walkLoop`, `puffTrain`, `headlightSweep`: deterministic, by time, 60 fps, no opacity | new (`kit/idle.ts`) |
