# Final storyboard: php2shell (full-bleed, cinematic with restraint)

Machine-readable twin: `docs/storyboard.json` (13 scenes, 231 timed beats, 37 caption pages). Checked by script:
it is valid JSON, the scenes are contiguous from 0 to 70.687 s, the captions and scene VO reproduce the transcript word
for word, no caption line is longer than 24 characters, every line 2 and every highlight sits within 40 ms of its word
start, every SFX name exists in `audio/sfx/`, and the longest gap between timed visual events is 0.79 s.
Decisions and sources are in `docs/storyboard_decisions.md`.

## Concept

**The web is a city, and every building in it is a website.** You can tell because each one's main window is a browser
window: three dots and an address bar. PHP is the elephant-stamped blueprint most of the city is built from, and each
building made from it carries a sand elephant plaque by its door. The bug is a flaw in that blueprint's lock: the bolt stops
short. So the same flaw sits in every door built from the plan, and a tiny ink beetle called Bit lives in it.
We stand at street level, slightly small. Government buildings tower over us, a huge low sun sits on the horizon, and
streets of identical doors run off to the vanishing point. The film still moves like the references: bright, warm,
legible and quick. Pip, our periwinkle elephant, watches from ledges the way the reference cat does. The orange sun is the
anchor and a character: it gets pressed like a power button, turns into pies and clocks, stamps a wax seal, and sets once
and rises once. True Arcane-scale is saved for three story peaks: the hook (S01), the dome over the endless city
(S08) and the 22 million doors (S10). Everywhere else, scale is a seasoning.

## Time-of-day arc

`day` S01-S05 (S05 is high summer) → `golden` S06-S07, as the leak builds → S08 `golden` into **dusk**, with the film's only
sunset on "by evening" → S09 `night`, the only night (1.75 s), then the film's only **sunrise** on "So now comes step two" →
`day` S10-S11 → `golden` S12-S13 → the un-build returns to the `day` line art of frame 0.
Sky colours come from the engine's `skies` tokens: day = mint, golden = cream with a flat peach horizon band, dusk = sage,
night = teal. Captions use dark ink on mint and cream skies and white text on sage and teal skies (`tone` / `toneAt` in the JSON).

## Scene table

| id | time (s) | VO | visual (one line) | camera | in | ToD |
|---|---|---|---|---|---|---|
| S01 | 0.00-4.78 | Government websites... Nobody hacked them. | **PEAK 1.** Four monumental government buildings with browser windows; the sun is pressed like a power button and four shutters slam in rhythm; padlocks hold | push-in 1.00→1.08, then push-through | loop-start | day |
| S02 | 4.78-10.84 | They were fixing... 7 out of 10 websites. | Lock close-up (short bolt, Bit, elephant plaque), then the street's floor is a blueprint and 9 buildings pop up; 7 elephant plaques tick on; the sun becomes a 7/10 pie | lock settle, medium pull-back 2.0→1.0 | push-through | day |
| S03 | 10.84-15.72 | Fixing a bug... fix it everywhere. | Stoop Street: two steps pop up, Pip hops onto each (magnifier riser, wrench riser); dashed ghost locks ripple down the endless street | push-in 1.06, truck-right | matchcut (sun hop) | day |
| S04 | 15.72-21.50 | You'd think... nobody did. | Step 1 shoots up into a tower; Pip looks to camera on "right?"; 14-year time-lapse (14 calendar tears, seasons, ghosts, ivy); hard stop on "did" | push-in, small tilt-up/down, locked, push into lock | camera-continuous | day |
| S05 | 21.50-25.44 | Then, in August... found it | The PHP master blueprint on a monumental wall; two back-view teams with sparkle tablets; beams converge and ring the flaw; Pip wakes | settle 1.3→1.0, slow push | matchcut (lock) | day |
| S06 | 25.44-30.50 | and quietly told... anyone else knew. | Makers' Lane toward a huge low sun; the sun stamps the envelope's wax seal; mail slot; the fix gets made; blind down; neighbours asleep; a sheet blows in from off-frame | continuous truck-right, slow push | camera-continuous | golden |
| S07 | 30.50-35.52 | Except, the details... came out. | **Foreground wipe on "Except,"**: the sheet becomes the notice on the public board (its top rail is an address bar); copies clone 2-4-8 and ride the wires away; the sun-clock turns; the fix cart comes out late | push-in 1.06, tilt-up | foreground-wipe | golden |
| S08 | 35.52-43.70 | Cloudflare... by evening. | **PEAK 2.** Crane reveal: a colossal glass dome over most of an endless city; the watchtower guard sees; attempts go 3 → 10 → 30 → stipple; 45-min wedge; tallies climb the glass; the one sunset | **BIG MOVE 1:** crane-up 1.5→1.0, slow creep | camera-continuous | golden→dusk |
| S09 | 43.70-47.72 | Nobody knows yet... the slow one. | Night Stoop Street: Pip's flashlight finds a "?" on each door; sunrise; check on step 1; step 2 stretches into a ledge to the horizon; a snail | slow push, truck-right | matchcut (skyline) | night→dawn |
| S10 | 47.72-54.46 | Someone has to install... could be hit. | **PEAK 3.** A keeper installs one new lock (Pip hands it over), then the street is one of thousands: a sea of identical doors to the horizon, only one fixed; target rings | push-in, **BIG MOVE 2:** pull-back 6.0→1.0 | camera-continuous | day |
| S11 | 54.46-60.47 | If a site can't update... sites did. | Close on govB's browser window: a crawling progress bar, the snail; the sun pressed again; the shutter, the 'back soon' tag and a peephole; pull back to the exact S01 frame | near-locked, medium pull-back 2.2→1.0 | push-through | day |
| S12 | 60.47-66.59 | And one in three... anymore. | A tram wipe; three sites pop on "one / in / three" with a 1/3 pie; the middle plaque turns old (cobweb, cane); the makers' cart goes tick, skip, tick | gentle push 1.07 | foreground-wipe (tram) | golden |
| S13 | 66.59-70.687 | For those... sorts it out. | The S07 noticeboard returns: pane 1 is a power glyph, pane 2 the hosting caretaker with keys; Pip crosses his trunk; un-build to frame 0 | push-in 1.2, rest at the slab | camera-continuous → unbuild | golden→day |

**The hook (0-1.5 s).** Frame 0 is already a full picture: the S01 linework, the mint sky, the orange sun mid-rise with a
faint power glyph, Pip in colour, Bit on the cornice and the caption "Government websites" already set. Frame 1 starts the
sun's rise and the colour flood. On "websites" (0.46) all four main windows show browser chrome, which teaches
"building = website" with no label. The screens light up at 0.90, citizens rise at 1.06, and four pennants unfurl on "four".
Then the sun is pressed on "switched" and the shutters slam on switched / them- / -selves / off. The highlight lands on
**themselves**, which opens the question the film answers in S11.

**The loop.** S13's un-build (69.84-70.687) uses the reference's ending. Lines go loose, fills shrink, the colour collapses
into one tan slab that slides down, and the S01 line art at camera rest shows underneath. Pane 1's power glyph floats up and
docks on the sun as the faint frame-0 glyph. Pip hops back to his bollard and is the only thing that stays in colour. Bit
returns to the cornice. The caption stays until "out." ends (70.445), then rolls to "Government websites" at 70.48. The sun
starts its opening rise at 70.60, so the seam falls mid-motion. The story loops too: the film ends on "switch off" and
starts on "switched themselves off".

## Conventions for scene builders

- **Coordinates.** All coordinates are canvas pixels at camera rest (`World`: world coords = canvas px). Author ink and fills
  `world.bleed` (140 px) past each frame edge. Safe zones are `theme.safe`: keep key action inside x 90-990, y 200-1480,
  keep everything out of the right rail (x > 950, y 900-1500), and put only ground and foreground in the bottom 400 px.
- **Camera.** `camera[].from/to = {x, y, zoom}` gives the world point at frame centre (540,960) and the zoom. Rest is
  `{540, 960, 1}`. Use light multiplane parallax during moves (each scene's `layers[].depth`: 0 = far, which moves least). The
  measured push curve is `bezier(0.6,0.25,0.41,0.87)`. There are only **two big moves** (S08 crane, S10 pull-back). The
  medium moves (S02 and S11 pull-backs, S05 settle) are 0.9-1.2 s and at most 2.2x. Everything else is a 5-15% push or a hold.
- **Sun.** A flat orange disc, r150, no outline and no rays. Treat it as a screen-space character: each scene gives its
  position, and during camera moves it glides on its own path instead of zooming (in S10 it is the one thing that never
  shrinks). It sits behind the buildings in front of it (behind domes and rooftops) and never behind the captions.
- **Mascot.** Pip is drawn in screen space during big moves, so he stays at scale 1.0 (about 96 px). He never goes below 0.75.
- **No fades, ever.** Things pop, draw on, wipe, slide, rise or scale. Skies change with a wipe. "Lights out" means the fills
  step one palette step darker in a 1-frame cascade (cream→sand→tan, mintPale→sage→teal→tealDark). Beams and the searchlight
  are flat cream or mintPale polygons at a fixed partial opacity with dashed ink edges. Their opacity is never animated.
- **Sync.** Beat times in the JSON are when the motion **starts**. Most already include the reference's lead (word − 0.10).
  Marks (✓, rings around the flaw) and sun touch-downs land on the word itself. Captions: `lines[].s` and `highlights[].s` are
  word starts, and the engine applies its −0.08 and −0.10 leads. Two onsets are corrected from `timing.json` by an energy
  check of `vo.mp3`: "7" is at **9.38** (not 9.18) and "10" is at **9.88**.
- **Palette.** The 13 theme colours only. Periwinkle belongs to Pip alone. Orange is the sun, plus at most one hero prop per
  scene (the S06 wax seal). Ink weight follows depth (4.8 / 3.4 / 2.2 / 1.6), and far layers get no ink.

## One metaphor system

| VO idea | On screen | First | Reused |
|---|---|---|---|
| a website | a building whose main window is a browser window (3 dots + address-bar pill) | S01 0.46 | every scene; the board's top rail (S07, S13) |
| government sites, four countries | four monumental civic buildings + four abstract pennants | S01 | S11, frame 0 |
| switched off | the sun pressed like a power button, a shutter slams, lights step darker, a padlock, a "back soon" clock tag | S01 | S11, S13 |
| PHP | the elephant-stamped blueprint the city is built from; sand plaque with an ink elephant on each PHP building | S02 | S05, S10, S12 |
| the bug | the blueprint's lock: the bolt stops short; Bit the ink beetle lives in it | S02 | S04, S05, S07 sketch, S10 |
| 7 of 10 / 1 in 3 | plaques ticking on + sun pie 7/10; three sites + sun pie 1/3 | S02 | S12 |
| two steps | a literal two-step stoop: magnifier riser (find), wrench riser (fix) | S03 | S04 (tower), S09 (✓ + ledge) |
| AI tools | a four-point sparkle on raised tablets, scan beams | S05 | |
| the people who make PHP | the makers' workshop (elephant sign) and their handcart | S06 | S07, S10 (far), S12 |
| the fix | one icon: sage lock box + cream check tag | S06 | S07, S10, S12 |
| leaked online | a sheet from off-frame, pinned on the public board whose top rail is an address bar; copies clone and ride the wires | S07 | S08 (wires), S13 (board) |
| Cloudflare | a generic glass shield-dome over most (not all) of the city + watchtower guard + tally board | S08 | |
| break-in attempts | hooded figures tapping glass and rattling handles: seen and counted, never blocked, never getting in | S08 | |
| how many got in | "?" marks on doors only (no figures, no footprints) | S09 | |
| someone installs | a generic keeper with a tool belt (not a maker); one door at a time | S10 | |
| 22 million copies | a sea of identical doors to the horizon, one fixed | S10 | |
| too old to fix | only the PLAQUE ages (tan, chipped, cobweb, tiny cane); the makers' cart skips that door | S12 | |
| hosting company | the landlord-style caretaker with a big key ring | S13 | |

## Cast

- **Pip** (mascot, periwinkle). He has one gag per scene, timed to its word: startle hop on "off" · double-take at the
  elephant plaque · the two-step hop · **the only look to camera, on "right?"** · wakes on "found" · trunk "shh" ·
  a flyer slapped on his face on "online" · ears over his eyes on "millions" · flashlight "?" sweep · hands over the new
  lock · taps the "back soon" tag · trunk-up "hey!" at the skipped door · crosses his trunk on "hope". He crosses every
  transition. Poses come from `docs/mascot.md`. The one requested extra pose is `trunk-cross` (fallback: `hold` with
  expression `closed`).
- **Bit** (the bug, a solid-ink beetle). He is on govA's cornice in frame 0 and the final frame. He peeks out on "bug"
  (S02, S03), sits in plain sight for 14 years and walks over sleeping Pip (S04), gets caught on the blueprint (S05), rides the
  old lock off in S10, and appears as a doodle on the leaked page (S07). He is the main "did you spot it?" detail.
- **The snail** (running gag for "slow"). It appears on the ledge in S09, has barely moved in S10, and crosses govB's window
  sill on "fast" in S11.
- **Generic back-view people.** Citizens, investigators, the makers in cream aprons, the keeper in a sand coat, hooded
  attempters (S08 only), the caretaker in a teal coat with keys, and the audience rows.

## The sun: eight meaningful morphs, always the same disc

The morphs are: power button (S01 'switched'; S11 'switch'; a small echo in S13) · 7/10 pie (S02) · wax-seal stamp that leaves
a copy (S06) · a clock whose hand sweeps less than one turn on "hours" (S07) · a 45-minute wedge (S08) · the one sunset
(S08 "by evening") and the one sunrise (S09 "So now comes step two") · 1/3 pie (S12) · stepped glow on "hope" (S13).
In between it acts as a character: it rises at frame 0, pulses on "four" and "big", hops across transitions with squash and
stretch, makes two step-hops on "two steps", pulses on each of the 14 calendar tears, and bounces over the cornice on
"August" and "found". It is never a clock for the 14 years: that timescale belongs to the calendar and the tree.

## Scenes in brief (the JSON has the full inventories, beats and SFX)

**S01 Government Plaza powers down (0.00-4.78, day, PEAK 1).** Four frontal government buildings stand at the plaza's far
edge (bases y 1200, tops 480-640): the Columned Hall, the Domed Capitol, the Clock Tower and the Modern Ministry. Behind
them are an endless far-city band and the r150 sun in the gap between the dome and the clock tower. Tiny citizens are 40-55 px
tall, so a building is about 13x a person. Three big onlookers stand on the bottom edge and Pip sits on a bollard
(760,1440). The beats: the flood on "Government", the browser chrome on "websites", screens lit, citizens, four pennants,
the power glyph on "just", the press on "switched", four shutter slams, "back soon" tags planted, padlocks on "Nobody", Pip
checks left and right on "hacked", and all the padlocks glint together. No intruder appears anywhere.

**S02 Built from one blueprint (4.78-10.84, day).** The push-through lands on the same lock design on the WordPress press
house's door, which is not a government door and never opens. The beats are: the cover swings open on "fixing", the bolt
stops short on "security", Bit scuttles out on "bug", and the elephant plaque rings on "PHP" while Pip double-takes. A
medium pull-back then shows that the street floor is a giant blueprint. The elephant stamp slams down in the foreground and
Pip lands on it. Nine buildings pop up like a pop-up book on "behind", and the press house's pen-nib sign swings on
"WordPress". Plaques tick on in a count of seven from 9.38, three blanks pop on "10", and the sun becomes a 7/10 pie. On
"websites" a Bit silhouette appears in all seven PHP locks at once.

**S03 Two steps (10.84-15.72, day).** On Stoop Street (VP off-centre right at 720,1060) the steps pop up on "two" and "steps",
and the sun hops on each word. Pip hops onto step 1 on "First", and a magnifier inks onto its riser on "find" while Bit ducks
the lens glint. He hops onto step 2 on "Then", and a wrench inks onto that riser on "fix". On "everywhere", dashed ghost
outlines of the new lock ripple onto every door down to the vanishing point. That shows intent, not a finished fix.

**S04 Fourteen years of nobody (15.72-21.50, day).** On "hard", step 1 shoots up into a 740 px brick tower with Pip on top,
and the camera tilts a little to follow. On "right?" Pip gives the film's only look to camera. On "And" the tower boings back
down. Then the frame locks: the calendar makes 14 tears with no numerals (season pictograms only), the sun pulses on each
tear, ink-only ghost passers-by never look at the door, the tree cycles its seasons, ivy and a cobweb grow, and Pip sleeps
under a falling leaf. A hard stop lands on "did", Bit walks across Pip's trunk, and the camera pushes into the lock.

**S05 Found it (21.50-25.44, day).** The match-cut on the lock lands on the PHP master blueprint, pinned on a monumental
civic wall. The flaw was in the plan all along. Pip falls into frame still asleep. The calendar tears to summer on "August"
and the sun bounces over the cornice with heat ticks. Two back-view teams rise in, with shield badges on their backs. Sparkle
tablets come up on "AI", two beams sweep the sheet, and on "found" they converge and an ink ring strokes around the flaw.
Bit gets a "!" and Pip jolts awake.

**S06 A quiet letter (25.44-30.50, golden).** The camera pans continuously into Makers' Lane, toward a huge low sun. The
sun dips to stamp the envelope's wax seal (the scene's one orange prop) while Pip goes "shh". The envelope goes through the
mail slot on "told". The window lights on "people" with three makers inside, and the elephant sign swings on "PHP". The new
lock (sage with a cream tag) is made on "fix" and gets its check on "ready". The blind comes halfway down on "before",
neighbours snore, and passers-by don't look. At 30.20 a sheet blows in **from off-frame**, so the makers are never shown as
the leak source.

**S07 Pinned for everyone (30.50-35.52, golden).** The pattern interrupt: the sheet crosses the lens on "Except," and
becomes the notice on the public board. The board's top rail lights as an address bar on "leaked". Copies clone 2-4-8 and
one slaps onto Pip's face on "online". Readers raise phones, and the copies ride the telephone wires away over the
rooftops. The sun becomes a clock on "hours". The workshop door opens on "came out" and the fix cart rolls out, too late.
No hooded figures appear in this scene.

**S08 The dome and the flood (35.52-43.70, golden→dusk, PEAK 2).** BIG MOVE 1: the camera cranes up from the rooftop wires
to the endless city. One bold ink arc draws the dome over about 65% of it, and the uncovered strip stays plain. The
watchtower rises, a dashed line traces "a big chunk", the searchlight comes on with "says", and the tally board pops on
with "saw". Attempts escalate in visible steps: 3 on "tens", 10 on "thousands", 30 on "break-in". They tap the glass and
rattle handles, are seen and counted, never bounce off and never get in. The sun becomes a 45-minute wedge on "45". On
"millions" a stipple crowd bursts in, the tallies overflow up the tower and the dome glass, and Pip covers his eyes. On "by
evening" the sun sets in two steps, the sky wipes to sage, windows pop peach across the city and the captions turn white.

**S09 Question marks, then dawn (43.70-47.72, night→dawn).** A match-cut on the skyline lands on Stoop Street at night.
Pip's flashlight reveals a "?" at a new door on each word, then a ripple of them down the street. On "So" the sun rises at
the vanishing point (the only sunrise). A check mark lands on step 1 on "step", and step 2 glows peach on "two". On "slow"
step 2 stretches into a ledge that runs past every door to the horizon, a snail starts across it, and Pip's ears droop.

**S10 Twenty-two million doors (47.72-54.46, day, PEAK 3).** Morning. A generic keeper (not a maker) installs the fix on
door #4. The old lock drops with Bit riding it, Pip hands over the new lock, and the check lands on "fix". A hidden
match-cut on the door leads into BIG MOVE 2: a pull-back from 6.0x to 1.0 (49.52-51.75) while Pip rides a foreground chimney
at constant size. Rows pop up, the far rows tile to the horizon, and the plaque dots blink on in a wave on "22 million". The
one fixed door pings on "copies", the tiny keeper walks to the next door, and peach target rings pop on "hit".

**S11 Shutters down (54.46-60.47, day).** The push-through lands on govB's browser window. Its address bar is now a
progress bar crawling 4%, 8%, 11%, and the snail crosses the sill on "fast". A power glyph inks onto the sun on "the
safest", the sun is pressed on "switch", the shutter slams and the lights step down on "off", and the 'back soon' tag from
3.40 swings on "until" (Pip taps it). A peephole shows the bar still crawling on "can". Then a medium pull-back lands on the
**exact S01 frame** on "That's what those government sites did". Pip nods on "did".

**S12 Too old to fix (60.47-66.59, golden).** A tram wipes across. Three sites pop up on "one / in / three" and the sun
becomes a 1/3 pie. A second row continues the pattern. Plaques pop on "PHP". On "runs" siteM's plaque flips to the old
version (a tan, chipped plaque with an older elephant), then a cobweb and dust appear, and on "old" it leans on a tiny cane.
The building itself never ages. The makers' cart goes tick (siteL, on "make"), skip (siteM, on "don't", while Pip goes
"hey!"), tick (siteR, on "fix").

**S13 Switch off, or hope (66.59-70.687, golden → loop).** The S07 noticeboard rises in front of the old site and Pip
takes the cat's spot on top. Pane 1 gets a power glyph on "switch" and goes dark on "off". Pane 2 scales in peach on "or".
On "hope" Pip crosses his trunk and the sun glows. The caretaker with a key ring rises in on "hosting", 0.77 s before the
un-build. We never see whether he sorts it out. The un-build starts on "sorts" (69.84) and is described in "The loop" above.

## Transitions map

loop-start → push-through (4.80) → matchcut on the sun (10.84) → camera-continuous (15.72) → matchcut on the lock
(21.50) → camera-continuous pan across the "and" split (25.44) → **foreground-wipe on "Except,"** (30.615) →
camera-continuous crane (35.5) → matchcut on the skyline (43.70) → camera-continuous dawn-to-day (47.72) →
push-through (54.46) → foreground-wipe tram (60.40) → camera-continuous push (66.59) → unbuild (69.84).
