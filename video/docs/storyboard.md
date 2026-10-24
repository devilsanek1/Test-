# Final storyboard: php2shell (full-bleed, cinematic with restraint)

Machine-readable twin: `docs/storyboard.json` (13 scenes, 244 timed beats, 36 caption pages). Lint:
`python3 -I scripts/check-storyboard.py`. It checks that the JSON is valid, the scenes run contiguously from 0 to 70.687 s, and
the captions reproduce the transcript word for word. Every line fits 850 px at 98 px except one accepted line. Every line 2
and every highlight sits within 50 ms of its word start, and every sun landing, pulse and press is on its word (±0.05 s).
Every match-cut keeps its object's screen position and size. The sky ceiling holds at every camera keyframe, and the longest
gap between timed beats is 0.90 s. Decisions and sources are in `docs/storyboard_decisions.md`.

**Timeline.** Every time in both files is on the **v1** VO timeline (`assets/vo.mp3`, `assets/timing_v1.json`, 70.687 s).
That is the timeline every review and sync check used. The v2 take (`assets/vo_v2_eleven.wav`, 77.76 s) is reached with
`python3 scripts/timewarp.py docs/storyboard.json -o <out> --add-keys duration,coverFrame`. The warped file also passes the
lint against `assets/timing.json`. Times written inside prose are not warped, so builders read the numeric fields (`t`,
`t0`/`t1`, `s`/`e`, `sunKeys`, `camera`). Each `transitionIn` now carries numeric `t0`/`t1` for that reason.

## Concept

**The web is a city, and every building in it is a website.** You can tell because each one's main window is a browser
window with chunky chrome: a dark title bar, three big dots and an address bar. PHP is the elephant-stamped blueprint most
of the city is built from. Each building made from it has a sand elephant plaque by its door. The bug is a flaw in that
blueprint's lock: the bolt stops short. So the same flaw sits in every door built from the plan, and a tiny ink beetle
called Bit lives in it.

We stand at street level, slightly small. The film still moves like the references: bright, warm, legible and quick. Pip,
our periwinkle elephant, watches from ledges the way the reference cat does. The orange sun is the anchor and a character.
It gets pressed like a power button, turns into pies and clocks, pops a wax seal, and sets once and rises once at the same
point. True Arcane scale is saved for three story peaks:
- the hook (S01): four government buildings around a gap, with the sun low in it;
- the dome over the endless city (S08): the film's only rooftop vista;
- the hillside of doors (S10): looked UP at from the street.

Everywhere else, scale is seasoning: one low angle (S05), a door-height street (S12), and a sun a little bigger in the lane (S06).

## Time-of-day arc

1. `day`: S01-S05 (S05 is high summer).
2. `golden`: S06-S07, as the leak builds.
3. S08 runs from `golden` into **dusk**, with the film's only sunset on "by evening".
4. S09 is the only `night` (1.6 s). Then comes the film's only **sunrise** on "So now comes step two", at the exact screen
   point where the sun set.
5. `day`: S10-S11.
6. `golden`: S12-S13.
7. The un-build returns to the `day` line art of frame 0.

Sky colours come from the engine's `skies` tokens:
- day = mint `#ACD1BF`;
- golden = cream with a flat peach horizon band;
- dusk = sage;
- night = teal `#588077`;
- dawn = **bright cream with a peach band**. It wipes in BOTTOM-UP, light rising from the horizon, so it reads nothing like
  the sage sunset run backwards.

**Caption tone.** Captions use dark ink on every sky except the night sky, where they are white. That covers ink on the sage
dusk (5:1) and white only on the S09 night page, 43.79-45.45. Tone lives in each page's `tone`; no mid-page recolour is needed.

## Scene table

| id | time (s, v1) | visual (one line) | camera | in | ToD |
|---|---|---|---|---|---|
| S01 | 0.00-4.78 | **PEAK 1.** Four government buildings, two on each side of a deep gap; the r150 sun sits low in the gap with a bold power glyph; a flat sun path runs to Pip. The sun is pressed and four shutters slam; padlocks; "back soon" tags. | push 1.00→1.04 (2.2 s), lock; 0.26 s dive into govB's lock | loop-start | day |
| S02 | 4.78-10.84 | Lock close-up (short bolt, Bit, plaque), then a **hard cut on "the"** to Blueprint Street. The stamp slams under Pip; the pop-up book; 7 plaques tick; the sun becomes a 7/10 pie. | lands 1.3→2.0 (keeps pushing in), lock; hard cut; push 1.00→1.04, lock | push-through | day |
| S03 | 10.84-15.72 | Stoop Street. Two steps pop up and Pip hops onto each; magnifier and wrench risers; sage wrench tags ripple to the VP on "everywhere". | push 1.00→1.05, lock, truck-right | matchcut (sun hop) | day |
| S04 | 15.72-21.50 | Step 1 shoots up into a tower; Pip looks to camera on "right?"; 14 *year* pages tear; hard stop on "did". | push 1.03→1.08, small tilt up/down, lock, push 1.08→1.9 into the lock | camera-continuous | day |
| S05 | 21.50-25.44 | Low angle: the master blueprint hangs as a banner from a civic facade. Two full-body teams; beams converge; a ring lands on "found". | lands 1.08→1.12, lock, truck-right | matchcut (lock) | day |
| S06 | 25.44-30.50 | Makers' Lane. The sun lands and pops a wax seal onto the envelope; mail slot; the fix is made; blind down; a sheet blows in from off-frame. | truck-right at matching speed, lock | **cut on action** | golden |
| S07 | 30.50-35.52 | Foreground wipe on "Except,". The notice lands on the online board; clones go 2-4-8; copies ride the wires; the sun's clock hands spin on "hours"; the cart comes out late. | push 1.00→1.06, lock, tilt-up | foreground-wipe | golden |
| S08 | 35.52-43.70 | **PEAK 2.** Crane reveal: a glass dome over most of an endless city. Attempts escalate, with tallies on the glass; a 45-minute wedge; millions; the one sunset. | **BIG MOVE 1** crane 1.3→1.0; push 1.00→1.15 on "tens"; pull back to 1.0 on "millions" | camera-continuous | golden→dusk |
| S09 | 43.70-47.72 | Night Stoop Street: the flashlight finds a "?" per word. Sunrise at the set point; a check on step 1; step 2 becomes a ledge to the horizon; a snail. | push 1.00→1.04 (VP pinned), lock, truck-right | matchcut (horizon + set point) | night→dawn |
| S10 | 47.72-54.46 | **PEAK 3.** The keeper installs one lock. A hidden match-cut, then a pull-back reveals a hillside of ~650 identical doors, looked UP at. One is fixed; Bit is in every lock; target rings. | approach push 1.05→1.5; **BIG MOVE 2** pull-back 6.0→1.0; 3% drift; dive into a ring | camera-continuous | day |
| S11 | 54.46-60.47 | govB's browser window: the progress bar crawls; the snail; the sun is pressed; the shutter drops. A **hard cut on "That's"** goes back to the exact S01 frame. | lands 1.8→1.85, lock; hard cut; push 1.00→1.03 | push-through | day |
| S12 | 60.47-66.59 | Tram wipe to a door-height street. Three sites pop up; 1/3 pie; the middle plaque turns old; the cart goes tick-skip-tick (crates, never locks on doors). | push 1.00→1.05, lock | foreground-wipe (tram) | golden |
| S13 | 66.59-70.687 | Board finale: pane 1 is a power glyph, pane 2 the caretaker with keys; the glow on "hope"; un-build to frame 0. | push 1.05→1.12, lock; un-build | camera-continuous → unbuild | golden→day |

**Accepted exceptions:**
- **S08 runs 8.18 s.** It is the one over-length scene, because its sentence alone is 8.02 s.
- **The S05/S06 boundary sits in a phrase pause** after "found it", not at a sentence end. The 9 s sentence leaves no other
  place. It is a cut on action, so it reads as one continuous move.

Every other boundary sits inside a sentence-end pause.

**The hook (0-1.5 s).** Frame 0 is already a full picture:
- the S01 linework and the day sky;
- the orange sun mid-rise with a **bold** cream power glyph: a big orange power button hanging over government buildings
  asks a question in the first frame;
- Pip in colour; Bit on the cornice;
- the caption "Government websites" finishing its last 24 px of roll.

On "websites" (0.46) all four main windows get chunky browser chrome, which teaches "building = website" with no label. The
screens light at 0.90, the citizens rise at 1.06, and four pennants unfurl on "four". On "just" the glyph glints and the sun
pulses. Then the sun is **pressed** on "switched", and the shutters slam on switched / them- / -selves / off. The flat sun
path stays bright while the buildings step darker, so the switch-off reads without any murk. The highlight lands on
**themselves**. The platform cover frame is **3.4 s** (four shutters down, sun just pressed).

**The loop.** S13's un-build (69.84-70.687) uses the reference's ending:
1. Everything except pane 2 un-builds first. Pane 2, with the caretaker, is the last fill to shrink (70.16-70.30), so the
   answer is never erased mid-sentence.
2. The tan slab collapses (70.30-70.47) over the S01 line art at camera rest.
3. Pane 1's power glyph docks on the sun as the bold frame-0 glyph.
4. Pip hops back to his bollard; Bit returns to the cornice.

The caption stays until "out." ends (70.445), then rolls to "Government websites" at 70.48 (`storyboard.loop`; the S13 caption
list has no extra page). The roll is still ~24 px short at the seam. Frame 0 shows it 24 px low and settles it by 0.25 s, the
same "end + 1 frame" recipe the sun uses: it starts its rise at 70.60 and frame 0 continues it. The story loops too: the film
ends on "switch off" and starts on "switched themselves off".

## Conventions for scene builders

- **Coordinates.** All coordinates are canvas pixels at camera rest (`World`: world coords = canvas px). Author ink and fills
  `world.bleed` (140 px) past each frame edge. Scenes that share a set say so with `inheritsElements` (S04←S03, S09←S03,
  S10←S09, S11←S01, S13←S12). S13's `s01LineArt.contains` lists the S01 ids it reveals.
- **Captions (authoritative: `src/lib/theme.ts` skyCaption).** Patrick Hand 98 px, baselines 387 / 510 (one-line 448),
  centred x 520, clip 280-570, max line 850 px. `docs/ENGINE.md`'s 82 px / 330 / 426 is stale. Every storyboard line fits
  850 px at 98 px except "before anyone else knew." (877 px): the engine auto-fits that page to 95 px. Engine lane, optional:
  set the size to 94 px so every page is one size. "until it can." is a deliberate **punch** one-liner (`style: "punch"`;
  add it through `src/data/captions.overrides.json`, since gen-captions keeps only the hook style).
- **SKY CEILING (new, linted).** At every camera keyframe (screen = (world − cam) × zoom + (540,960)), only flat sky may sit
  above screen y 560 inside x 90-990. The sun's top, and any glow ring, stays at y ≥ 560. Each scene lists its tallest items in
  `ceiling` and its sun in `sunKeys`, and the lint projects them through every camera key. Exempt: dives of 0.4 s or less
  (`transition: true`). This is why rooflines, spires and pennant tips sit at world y ≥ 600 in S01 and S11, why S04's tower
  stops at y 700, and why the S08 dome draws from its feet up and only meets at the apex once the crane has lowered it.
- **Camera budget.** There are two big moves: the S08 crane and the S10 pull-back. Everything else is one gentle out(cubic)
  push of 3-8% over 1.2-2.5 s right after the scene lands, then a locked camera, so draw-ons and pops read crisply.
  - **Exempt:** the transition dives S01→S02, S04→S05 and S10→S11 (0.4 s or less, in(cubic/expo); they read as cuts); S10's
    approach push 1.05→1.5, which sets up the hidden match-cut; and S08's 15% push and pull, which stay inside the gentle range.
  - **Rules:** no linear segment ever starts from rest. At a push-through the camera keeps moving IN while it decelerates; it
    never zooms back out right after zooming in.
  - **Hard cuts** replace the old medium pull-backs: S02 on "the" and S11 on "That's". "Zoom into one lock, pull back to many
    buildings" now happens once, in S10.
  - `camera[].from/to = {x, y, zoom}` is the world point at screen centre (540,960). Rest is `{540, 960, 1}`. Segments with
    `cut: true` start a new framing; S13's last segment is the S01 underlay layer.
- **Match-cuts (linted).** `transitionIn.match` and in-scene cut segments give each match object in both worlds. The lint
  proves it keeps its screen position and size:

  | cut | match object | on screen |
  |---|---|---|
  | S01→S02 | lockBox | 52×65 px at (560,1090) |
  | S04→S05 | lock4 | 65×80 at (483,960) |
  | S07→S08 | wires | 3 wires at y 896 / 928 / 960, 32 px apart |
  | S08→S09 | sun set point = VP | (700,1000) |
  | S10 hidden cut | lock | 51×63 at (540,1305) |
  | S10 hidden cut | cornice line | y 570 |
  | S10→S11 | ring | r18 at (697,1108) |

  Camera-continuous seams also match speed: S07 exits in(sine) at ~990 px/s and S08 enters out(quart) at ~1030 px/s. S05
  exits at ~900 px/s and S06 enters at ~890 px/s.
- **Sun.** A flat orange disc with no outline and no rays. It is screen-space: each scene gives its screen position in
  `sunKeys`, and it glides on its own path during camera moves. It always sits behind the buildings in front of it and never
  behind the captions. Sizes:
  - **r110** baseline;
  - **r120** in the S06 lane;
  - **r150** at the peaks (S01, S10 Part B) and the loop;
  - **r165** only in S08, the biggest.

  Landings, presses and pulses land on their word (±0.05 s, linted). Hops take off earlier.
- **Mascot.** Scale **1.0** (~96 px) only in the three vistas (S01, S08, S10 Part B), where his tininess is the point.
  Scale **1.2** (~115 px, reference 2's corgi size) in every medium or close shot, so the gags read on a phone. He is kept
  in screen space during big moves and is never below 0.75.
  - **Gags:** one per scene, placed about 0.25 s after the key word's focal event and near it, never on top of it. One focal
    event per key word: on "found" the ring and Bit's "!" only; Pip jolts on "it".
  - **Poses** come only from `docs/mascot.md`.
  - **Props:** Flashlight (S09) and NewLock (S10) are authored by those scene builders in their own folders through the prop
    API. The S07 flyer is a scene overlay over the sit-front head bounds (POSE_BOUNDS). The S11 nod is a sit-back squash pulse
    (+0.08 → 0 over 0.2 s).
- **Legibility minimums.** Anything that carries meaning is at least 60 px on screen, and a figure doing a readable action is
  at least 55-70 px tall:
  - the 40-60 px wrench tags on near doors (S03);
  - the 60 px check flag on the fixed door (S10);
  - the 110-130 px hanging plaques (S12);
  - the 55-70 px handle-rattlers and the 40-60 px tally strokes on the dome glass (S08);
  - the chunky browser chrome (S01).

  Specks are texture only. Key marks stay at x ≤ 930 wherever they are at y 900-1500 (the right rail).
- **Near layer (reference 2's baseline).** Every everyday scene has one cheap cropped near element outside the caption band:
  - the lamp post with a wire and pigeons (Stoop Street);
  - two big walkers at the frame edges (S02 wide);
  - readers or onlookers at the frame SIDES, with the centre left open (S01, S07, S13);
  - the cropped street tree (S12);
  - the foreground bollard (S10).
- **No fades, ever.** Things pop, draw on, wipe, slide, rise or scale. Skies change with a wipe. "Lights out" means the
  fills step one palette step darker in a 1-frame cascade. Beams, shafts and the searchlight are flat polygons at a fixed
  partial opacity; their opacity is never animated.
- **Sync.** Beat times are when the motion **starts** and mostly include the reference's lead (word − 0.10). Marks and sun
  touch-downs land on the word itself. Captions: `lines[].s` and `highlights[].s` are word starts, and the engine applies
  its −0.04 / −0.08 / −0.10 leads. The 7/10 count is timed to `timing.json`:
  - "about" 9.065: spokes 8.97-9.12;
  - "7" 9.18: ticks 9.08-9.56, 0.08 s apart, all done before "out";
  - "10" 9.818: plates 9.72-9.82; slices and pulse 9.82.
- **Depth ladder (S08 and all vistas).** Values go light-far to dark-near, as in Arcane's haze, using `atmos(color, depth, tod)`:
  - far rows: fill-only cream/sand;
  - mid rows: tan/sage with ink 1.6-2.2;
  - near rows: tan/teal with ink 3.4;
  - foreground ledge: tan/tealDark with ink 4.8. It is the only tealDark, so nothing gets murky.

  In S10 Part B the ink is authored in world units (row 0 ~0.85 px), so the zoom-6 cut matches Part A's on-screen weight.
  Fill misregistration there is screen-space.
- **Palette.** Only the 13 theme colours. Periwinkle belongs to Pip alone. Orange is the sun plus at most one hero prop per
  scene (the S06 seal).

## One metaphor system

| VO idea | On screen | First | Reused |
|---|---|---|---|
| a website | a building whose main window is a browser window (tealDark title bar, 15 px dots, cream address pill) | S01 0.46 | every scene; the board's top rail (S07, S13) |
| government sites, four countries | four monumental civic buildings around a gap + four abstract pennants | S01 | S11, frame 0 |
| switched off | the sun pressed like a power button, a shutter slams, lights step darker, a padlock, a "back soon" clock tag | S01 | S11, S13 |
| PHP | the elephant-stamped blueprint; a sand plaque with an ink elephant on each PHP building | S02 | S05, S10, S12 |
| the bug | the blueprint's lock: the bolt stops short; Bit the ink beetle lives in it | S02 | S04, S05, S07 sketch, S10 (Bit in every lock) |
| 7 of 10 / 1 in 3 | plaques ticking on + a 7/10 sun pie; three sites + a 1/3 sun pie | S02 | S12 |
| two steps | a literal two-step stoop: magnifier riser (find), wrench riser (fix) | S03 | S04 (tower), S09 (✓ + ledge) |
| everywhere | sage wrench tags above every door to the VP (where the fix has to go, not done) | S03 | |
| fourteen years | 14 *year* pages (3×4 month grids, no numerals), one tree season per tear | S04 | |
| AI tools | a four-point sparkle on raised tablets, scan beams | S05 | |
| the people who make PHP | the makers' workshop (elephant sign) and their handcart | S06 | S07, S10 (far), S12 |
| the fix | one icon: sage lock box + cream check tag | S06 | S07, S10, S12 (in crates) |
| leaked online | a sheet from off-frame, pinned on the public board whose top rail is an address bar; copies clone and ride the wires | S07 | S08 (wires), S13 (board) |
| hours / 45 minutes | the sun's clock: hands **spinning** (hours) vs **one sweep** of a 3/4 wedge (minutes) | S07 / S08 | |
| Cloudflare | a generic glass shield-dome over most (not all) of the city + watchtower guard + tallies | S08 | |
| break-in attempts | hooded figures tapping the glass (seen and counted) and rattling the uncovered doors (uncounted); never blocked, never getting in | S08 | |
| how many got in | "?" marks on doors only (no figures, no footprints) | S09 | |
| someone installs | a generic keeper with a tool belt (not a maker); one door at a time, up the stairs | S10 | |
| 22 million copies | a hillside of identical doors climbing to the ridge, one fixed (check flag) | S10 | |
| too old to fix | only the PLAQUE ages (tan, chipped, cobweb, tiny cane); the makers' cart skips that door | S12 | |
| hosting company | the caretaker with a big key ring | S13 | |

## Cast

- **Pip** (mascot, periwinkle). One gag per scene:

  | scene | gag |
  |---|---|
  | S01 | startle hop on "off" |
  | S02 | double-take at the plaque, then a bounce on the stamp |
  | S03 | the two-step hop |
  | S04 | **the only look to camera, on "right?"** |
  | S05 | jolts awake on "it" |
  | S06 | trunk "shh" |
  | S07 | flyer on his face on "online" |
  | S08 | ears over his eyes after "millions" |
  | S09 | flashlight "?" sweep |
  | S10 | hands over the new lock on "that" |
  | S11 | taps the "back soon" tag; nods on "did" |
  | S12 | trunk-up "hey!" at the skipped door |
  | S13 | eyes squeezed shut on "hope" (sit-front, expression closed), facing the sun's glow |

  He crosses every transition. The `trunk-cross` pose is dropped (it is not in the API, and its fallback was the S06 "shh").
- **Bit** (the bug, a solid-ink beetle). He is on govA's cornice in frame 0 and in the final frame. He peeks out on "bug"
  (S02, and in S03 0.25 s after the sun lands). He sits in plain sight for 14 years and walks over sleeping Pip (S04), gets
  caught on the blueprint (S05), and appears as a doodle on the leaked page (S07). In S10 he rides the old lock off, then a
  Bit silhouette pops into every lock on the hillside on "of PHP": one bug, every copy.
- **The snail** (running gag for "slow"). It appears on the ledge in S09, sits on the hillside stairs in S10, and crosses
  govB's sill on "fast" in S11.
- **Generic back-view people.** Citizens, investigators (full-body in S05), the messenger, the makers in cream aprons, the
  keeper in a sand coat, hooded attempters (S08 only), the caretaker in a teal coat with keys, and the onlookers, readers and
  audience at the frame sides.

## The sun: meaningful morphs, always the same disc

- **Power button:** pressed on "switched" in S01 (bold glyph from frame 0) and on "switch" in S11; a small echo in S13.
- **7/10 pie** (S02).
- **Wax seal** popped out onto the envelope as the sun lands, without leaving its slot (S06).
- **Hours clock** with spinning hands (S07).
- **45-minute wedge:** a single sweep after the sun hops up out of the city so the whole face reads (S08).
- **The one sunset** (S08, "by evening") and **the one sunrise** (S09, "So now comes step two"), at the same screen point
  (700,1000).
- **1/3 pie** (S12).
- **Stepped glow** on "hope" (S13).

In between it is a character: it rises at frame 0, pulses on "four" and "big", hops across transitions with squash and
stretch, makes two step-hops on "two steps", pulses on each of the 14 year tears, and crests the S10 ridge on "million". It
is never a clock for the 14 years: that timescale belongs to the calendar and the tree.

## Scenes in brief (the JSON has the full inventories, beats, sun keys, ceilings and SFX)

**S01 Government Plaza powers down (0.00-4.78, day, PEAK 1).**
- **Left of a 260 px gap:** govA, the Columned Hall, cropped by the left edge, and govB, the Domed Capitol.
- **Right of the gap:** govC, the Clock Tower, stands behind govD, the Modern Ministry. govD is nearer and cropped by the
  right edge. govC's browser window sits high, above govD's roof.
- **In the gap:** the far city and the r150 sun, centred (630,800), its lower quarter behind the far city and its glyph never
  sliced. A flat cream sun path runs down the plaza to Pip's bollard, between sage shadow wedges.
- Every roofline, spire and pennant tip sits at world y ≥ 600. The pennants slant out from the facades below the cornices.
- Onlookers stand at the frame sides.

No intruder appears anywhere. Camera: a 4% push that locks at 2.2, then a 0.26 s dive into govB's lock.

**S02 Built from one blueprint (4.78-10.84, day).**
- **Close-up.** The push-through lands on the same lock design on the WordPress press house's door, still moving in. The
  door never opens. The beats: screws and cover on "fixing", the short bolt on "security", Bit on "bug", the plaque on
  "PHP", and Pip's double-take.
- **Hard cut on "the"** (7.065) to the wide street, which is still a bare blueprint. Pip lands on the blueprint and the
  stamp slams under him on "language". Nine buildings pop up like a pop-up book on "behind", and the pen-nib sign swings on
  "WordPress".
- **The count, re-timed.** Spokes on "about", seven plaque ticks on "7" (0.08 s apart), three blank plates on "10" with the
  sun's 7/10 slices and pulse at 9.82, and a screen blink on "websites".
- The near layer is two big walkers at the frame edges.
- The side rooflines start at y 560 at the frame edges and stay under the ceiling. The sun sits right of the ridge.

**S03 Two steps (10.84-15.72, day).**
- Stoop Street: the VP is off-centre right at (720,1060). The near layer is the lamp post with a wire and two pigeons.
- The sun lands on "bug" behind the silhouetted far towers; Bit peeks 0.25 s later.
- The steps pop up on "two" and "steps" with sun touch-downs.
- Pip hops onto each step: crouch 12.66, take-off 12.80, landing on "First" at 13.10; crouch 13.79, take-off 13.93,
  landing on "Then" at 14.23. The magnifier and wrench ink onto the risers.
- On "everywhere", sage wrench tags pop above every door down to the VP: intent, not a finished fix.

**S04 Fourteen years of nobody (15.72-21.50, day).**
- On "hard", the left half of step 1 shoots up into a 600 px tower (top y 700) with only a 2% overshoot. The magnifier
  rides up its face at 90 px. The camera tilts up in sync (cam y 1000→940), so Pip's head stays under the captions for the
  only look to camera, on "right?".
- The tower boings back down on "And". Then the frame locks: the calendar tears 14 **year** pages, the sun pulses on each
  tear, and the tree pops one season per tear. Ink-only ghosts never look at the door; ivy and a cobweb grow; Pip sleeps.
- Hard stop on "did". Then a push of 1.08→1.9 into the lock.

**S05 Found it (21.50-25.44, day, the one low angle).**
- The match-cut lands on the lock detail (60×75) of the master blueprint, which hangs as a tall banner from a civic
  facade. Seen from the investigators' waist height, the facade's pilasters lean in 4-6°.
- The sun sits in the notch beside the corner pilaster, with its first touch-down on "August".
- Two teams of three full-body figures rise at the foot of a broad flight of steps (team B ends at x 940).
- Sparkle tablets come up on "AI" and the beams sweep on "tools".
- On "found" the ring strokes on and Bit gets a "!": nothing else moves. Pip jolts awake on "it".
- The messenger takes out an envelope and walks out of frame right.

**S06 A quiet letter (25.44-30.50, golden).**
- A cut on action: the messenger enters frame left and the camera trucks right at the same speed.
- In Makers' Lane the 3-storey workshop's roof is at world y 720. The r120 sun sits at the lane's end, and long flat
  sand/tan shadow bands converge on it.
- On "quietly" the sun lands with a press squash and a small seal pops out of it along a dotted arc onto the envelope. Pip
  goes "shh" 0.28 s later.
- The mail slot on "told", the makers on "people", the sign on "PHP", the fix on "fix", the check on "ready", the blind on
  "before", Zzz, passers-by.
- At 30.20 the leak sheet blows in from off-frame.

**S07 Pinned for everyone (30.50-35.52, golden).**
- The pattern interrupt: the sheet crosses the lens on "Except," and becomes the notice. The sun lands on "details", half
  hidden by the wall top.
- The board's rail lights on "leaked". Clones go 2-4-8, and a copy slaps onto Pip's face on "online".
- Copies ride the wires across the sky from 33.20 and clear the sun before 33.74.
- On "hours" the sun's long minute hand spins 3.5 turns while the hour hand steps on. Pip peels the flyer off at 34.20.
- The cart comes out late. Readers stand at the frame sides.
- The camera tilts up into S08 at matching speed.

**S08 The dome and the flood (35.52-43.70, golden→dusk, PEAK 2, the only rooftop vista).**
- **Layout.** Mirrored so the action sits left: the uncovered strip, the watchtower and the tallies sit at x 90-300. The
  dome arcs from (260,1300) over (730,700) to (1200,1300). The horizon is at y 1000.
- **The crane** starts on plain sky from the same three wires. The dome draws from its feet up.
- **The glass** is drawn flat: fills one step lighter, a cream rim strip, glint bars.
- **"Tens":** a 15% push toward the left rim. Attempters at the rim are counted, with tallies drawn large on the glass.
  Rattlers at the uncovered doors (55-70 px) go uncounted: Cloudflare only sees what it protects.
- **"45":** the r165 sun hops up 150 px out of the city, and one minute hand sweeps a 3/4 wedge.
- **"Millions":** the camera snaps back to rest as the stipple flood bursts. Pip covers his eyes 0.25 s later.
- **"By evening":** the two-step sunset at screen x 700, the sage dusk wipe, peach windows. Captions stay ink.
- A tiny terraced-hill silhouette on the far left sets up S10.

**S09 Question marks, then dawn (43.70-47.72, night→dawn).**
- The match-cut lands where the sun set: Stoop Street's VP sits at screen (700,1000), and the push keeps it pinned there.
- At night the lamp post is lit and the flashlight finds a "?" on each word, then a ripple of them.
- The dawn wipes in bottom-up in cream at 45.30, and the sun rises at the VP on "So".
- A check strokes onto step 1 on "step", and step 2 glows peach on "two" (sun pulse 46.39).
- On "slow" step 2 becomes a ledge to the horizon, the snail appears, and Pip slumps.

**S10 Twenty-two million doors (47.72-54.46, day, PEAK 3).**
- **Part A.** A keeper installs the fix on door #4. Pip lifts the lock on "install" and hands it over on "that"; it pops
  on, with the check on "fix". The approach push lands the cornice at screen y 570.
- **Hidden match-cut** (49.45). Lock, door, browser window and cornice line hold their screen position and size at zoom 6.
- **Part B, the pull-back.** We look UP a hillside of terraces with no overlap. Each terrace pops in as the caption floor
  passes it, so the rows build bottom-to-top on clean sky. Pip stays the same size on a foreground bollard.
- **The payoff.** The plaque wave runs to the ridge on "22 million", and the sun crests the ridge on "million". The fixed
  door's 60 px check flag goes up on "copies", and Bit pops into every lock on "of PHP". The keeper climbs the stairs one
  flight at a time. The terraces extend at the edges on "out there", and twelve target rings pop on "hit" (x ≤ 930).
- **The dive** goes into the row-7 ring.

**S11 Shutters down (54.46-60.47, day).**
- The ring becomes govB's loading ring next to the progress bar. Framing (375,793) at zoom 1.8: the lantern sits at
  screen y ≥ 603 and the pennant is at the drum.
- The bar steps 4%, 8%, 11%; the snail crosses on "fast".
- The glyph inks onto the sun on "the safest", the sun is pressed on "switch", the shutter drops on "it off" and the lights
  step down on "off". The tag swings on "until" and Pip taps it.
- The peephole shows the bar still crawling on "can". "until it can." is a punch page.
- **Hard cut on "That's"** to the exact S01 frame. The sun lands in its slot on "government" and Pip nods on "did".

**S12 Too old to fix (60.47-66.59, golden).**
- A tram wipe reveals a street at **door height**, with eye level at y 1150. siteL and siteR are six storeys (tops 690 and
  700); siteM is shorter, with the sun over it, and a side street shows the second row and the city.
- The three sites pop on "one / in / three", with the 1/3 pie on "three".
- The 110-130 px hanging plaques swing out on "PHP". siteM's plaque flips old on "runs", then gets a cobweb, dust, and a cane
  on "old".
- The cart drops crates on siteL's and siteR's steps (tick, skip, tick) and never puts a lock on a door. Pip goes "hey!" on
  "don't".

**S13 Switch off, or hope (66.59-70.687, golden → loop).**
- The S07 board rises in front of the old site under its towering neighbours; the audience stands at the frame sides.
- Pane 1 gets a power glyph on "switch" (with a small sun press echo) and goes dark on "off".
- On "or" pane 2 scales in **with the caretaker** and holds about 1.5 s.
- On "hope" the sun's glow steps out (outer ring top at y 560) and Pip closes his eyes, hoping. The keys jingle on "hosting".
- The un-build starts on "sorts" with pane 2 last (see "The loop" above).

## Transitions map

| t (s) | scene | transition |
|---|---|---|
| 0.00 | S01 | loop-start |
| 4.78 | S02 | push-through (lock) |
| 7.065 | inside S02 | hard cut |
| 10.84 | S03 | matchcut (sun hop, landing on "bug") |
| 15.72 | S04 | camera-continuous |
| 21.50 | S05 | matchcut (lock) |
| 25.44 | S06 | **cut on action** (the messenger) |
| 30.50 | S07 | **foreground wipe on "Except,"** |
| 35.52 | S08 | camera-continuous crane (wires, matched speed) |
| 43.70 | S09 | matchcut (horizon + the sun's set/rise point) |
| 47.72 | S10 | camera-continuous dawn-to-day |
| 49.45 | inside S10 | hidden match-cut |
| 54.46 | S11 | push-through (ring) |
| 59.02 | inside S11 | hard cut |
| 60.47 | S12 | foreground-wipe (tram) |
| 66.59 | S13 | camera-continuous push |
| 69.84 | S13 | unbuild |

## Requests to other lanes

- **Engine (captions).**
  - The loop seam: frame 0 shows the first page 24 px low and settles it by 0.25 s, as "end + 1 frame" of the 70.48 roll
    (`SkyCaptions` currently shows it settled).
  - Optional: `skyCaption.size` 94 for a single caption size.
  - Merge `"style": "punch"` for "until it can." through `src/data/captions.overrides.json`.
- **Engine (docs).** `docs/ENGINE.md` still lists the 82 px / 330 / 426 / 236-476 caption band; theme.ts is authoritative.
- **Scene builders.** Read `ceiling`, `sunKeys`, `match` and the numeric `transitionIn.t0/t1`, and use
  `python3 -I scripts/check-storyboard.py` after any storyboard edit.
