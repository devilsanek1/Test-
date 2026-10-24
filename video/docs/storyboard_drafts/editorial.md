# Storyboard draft: EDITORIAL-FAITHFUL ("Web Street")

Machine-readable twin: `docs/storyboard_drafts/editorial.json` (13 scenes, validated: contiguous 0 to 70.687 s, captions and scene VO
reproduce the transcript word for word, every caption line is 24 characters or fewer, at most one highlight per caption, every
highlight and line-2 entry sits on its word start).

## Pitch

- **Hook:** frame 0 is a dense line-art boulevard of four government buildings with the orange sun low between them. On the first
  word, color floods in, the sun rises, and every window lights up like a screen. Then the sun turns into a power button and the
  four buildings click dark one by one, on "themselves off". It's a strong first 3 seconds and needs no text.
- **Metaphor system:** the web is a single illustrated street. Websites are buildings, visitors come in through doors, and PHP is
  the elephant-stamped lock plate on 7 of 10 doors. The bug is a literal tiny beetle living inside that lock. The fix is a new
  plate with a check tag. The people who make PHP are a locksmith workshop. The leak is a blueprint on a public noticeboard, and
  Cloudflare is a glass shield-dome with a watchtower.
- **Mascot:** Pip, a small periwinkle elephant (our own design that nods to the elePHPant). He sits on things the way the
  reference cat does, walks the "two steps" with us, does a double take when he sees an elephant on the lock, and goes "shh" on
  "quietly". He never stands in front of the explanation.
- **The sun does the data:** power button, a 7/10 pie, a magnifying glass, a time-lapse of 14 years, a wax-seal drip, a clock, a
  45-minute stopwatch, a sunset, a 1/3 pie. It is always the same orange disc.
- **Loop:** the last line hands off to an un-build. Every fill collapses into one tan block, which slides out of frame and reveals
  frame 0's line art behind it. The sun sets back between the far buildings and Pip hops onto his bench. The end is the opening.

## 1. The world (one continuous street)

| Story concept | On screen | Why it works |
|---|---|---|
| A website | a building or shopfront on Web Street | code draws facades, windows and doors beautifully, and the reference is a street |
| Government websites, four countries | four civic buildings (columns, pediment, steps), each with a generic patterned pennant | reads as "government" with no real flags or logos |
| Site is online / offline | windows lit (cream with salmon glow) / dark (tealDark) plus a hanging power-glyph plaque | simple and readable at phone size, and it looks great as a cascade |
| PHP | an elephant-stamped lock plate on the doors (7 of 10 doors have it) | ties PHP to the mascot and to "break-in" language without any logo |
| WordPress | a generic press house (pen-nib sign, newspaper stacks) | the name lives in the caption |
| The security bug | a tiny ink beetle living inside the lock | a literal "bug" that viewers can spot again on rewatch |
| The fix | a sage plate with a cream check tag | one icon, reused in S03, S06, S07, S10 and S12 |
| The people who make PHP | a locksmith workshop with an elephant + key sign | the makers make the locks |
| Security teams using AI tools | two pairs of back-view people with boxy scanners showing a four-point sparkle | generic "AI" sign language, no brands |
| Leaked online | the blueprint pinned on a public noticeboard (the reference's bulletin board), then flyers everywhere | "public" and "spreading" in one gesture |
| Cloudflare | a big glass dome over most of the town with a watchtower and an odometer | "protects a big chunk": the dome visibly does not cover everything |
| Break-in attempts | tiny faceless back-view silhouettes knocking at the dome rim | the reference's crowd density, without claiming whether they were blocked |
| Step two (slow) | the same two-step stoop, plus a snail on step 2 | an instant read and a running gag (S09, S10, S11) |
| 22 million copies | an aerial carpet of tiny roofs with elephant dots, tiling outward | repetition and pattern, which is code's superpower |
| Switch it off | a wall knife-switch, lights go dark, a "back soon" clock plaque | rhymes with the hook |
| Version too old | a building that ages to sepia, its plate turns into an old skeleton-key plate, the makers' cart rolls past | "they don't fix it anymore" without text |
| Hosting company | a plain caretaker van with a ladder and a key icon, far down a side street | "hope": it's on its way, but it's tiny |

### Persistent objects (match-cut spine)
- **civicC's door and lock plate:** S01 to S02 (zoom into it), and the S11 secret close-up that pulls back to reveal S01.
- **Door #4 with the two-step stoop:** S03, S04, S05, S09, S10. It becomes the "home" doorway of the film.
- **The beetle:** S02 (peeks out), S03 (magnified), S04 (dotted ghost napping), S05 (caught), S07 (drawn on the blueprint).
- **The workshop and cart:** S06, S07, S12.
- **The switch box:** S11, S13.
- **The snail:** S09, S10, S11.
- **The bench:** S01, S11 and the final frame.

### Transition map
S01 loop-start color flood → S02 **zoom** into the lock → S03 **matchcut** onto door #4 → S04 **matchcut** (same stoop, past) →
S05 **matchcut** (time-lapse halts) → S06 **push** pan to the workshop → S07 **matchcut** pull-back to the noticeboard → S08
**flip** (chapter: the attack) → S09 **zoom** into a dusk doorway → S10 **matchcut** (same stoop, next morning) → S11 **zoom**
into one roof, then the pull-back reveal of S01 → S12 **flip** (chapter: the long tail) → S13 **matchcut** push-in → **un-build**
to frame 0.
There are two flips in 70 s, about the reference's rate, and they mark the two real chapter turns. Everything else is camera
moving through one world.

## 2. Pip (mascot)
- Small periwinkle elephant (colorway already chosen in `src/lib/mascot/colors.ts`), about 80 x 70 card px when sitting. Ink and
  misregistered fills match the world. He is the only cool violet in the frame, so the eye finds him the way it finds the
  reference cat.
- **Role:** the viewer's stand-in. He watches, reacts, and walks the explanation (step 1 on "First", step 2 on "Then"). He sits
  on things: the bench, the toolbox, the press-house sign bracket, the watchtower roof, a chimney, the stoop.
- **Gags** (each 0.6 s or less, always on the word they illustrate):
  - S01: the door-tug on "hacked"
  - S02: the double take at the elephant emblem on "PHP"
  - S04: looks up the stretched "hard part" step and slides off it, then "right?" to camera
  - S06: trunk "shh" on "quietly"
  - S07: a flyer slaps onto his face on "online"
  - S12: blows dust off the old plate and sneezes on "old"
  - S13: crosses his trunk on "hope"
- **Focus rules:** he stays in the panel's bottom corners, stoop ends, or on top of objects. He never overlaps the lock plate, the
  counter or the sun. His idle life (blink, ear flap, tail swish) continues under every beat.
- **Pose usage:** sit-back (bench, chimney, tower), sit-front (reactions), walk-side (S01, S06), peek (S08, S09), shrug (S01,
  S09), sleep (S04), ears-cover (S11), trunk-up (S02 count, S06 shh, S12 sneeze), hold (door handle in S01), stand-side (S04,
  S10, S13).

## 3. The sun (anchor and morph library)
| Time | Morph | Meaning |
|---|---|---|
| 0.10 to 0.90 | rises from behind the far buildings | the day and the loop begin |
| 2.32 to 3.65 | cream power glyph inside the disc | "switched themselves off" |
| 9.10 to 10.80 | 10-slice pie, 3 slices go cream | "7 out of 10" |
| 13.52 to 14.65 | grows a handle, drops onto the lock as a magnifying lens | "find it" |
| 18.92 to 21.40 | five fast arcs across the sky | "14 years" |
| 22.20 to 25.44 | heat shimmer lines below it | "August" |
| 26.00 to 26.20 | a drop falls off and becomes the envelope's wax seal | "quietly told" (a nod to the reference's sun-stamp) |
| 33.84 to 35.30 | clock face, hour hand spins | "hours before" |
| 40.88 to 43.04 | stopwatch crown + a 45-minute cream wedge | "in 45 minutes" |
| 43.20 to 47.84 | sets behind the roofline, sky turns salmon | "by evening" |
| 47.84 to 48.30 | rises again | step two starts the next day |
| 57.52 to 59.04 | power glyph again | "switch it off" (callback to the hook) |
| 60.72 to 64.20 | 3-slice pie, one slice tan | "one in three" (rhymes with the 7/10 pie) |
| 68.80 to 70.60 | gentle sunset down to the frame-0 position | "hope", then the loop |

## 4. Scene by scene

### S01 Civic Row goes dark (0.00 to 4.80)
*"Government websites in four countries just switched themselves off. Nobody hacked them."*
- **What we see:**
  - Frame 0 is line art only. On "Government" color floods building by building and the sun rises.
  - On "websites" every window lights up like a screen.
  - On "four" four patterned pennants hoist, one per beat.
  - On "switched" the sun gets a power glyph. On "themselves off" the four buildings go dark one per beat, with four relay
    clicks.
  - "Nobody hacked them": Pip trots to the nearest door and tugs it. It holds. All four lock plates glint: intact.
- **Why:** this is the reference's signature opening (line art → color flood) applied to our claim. The lights-on then lights-off
  arc gives the hook a mini-story in 3.3 s. "Nobody hacked them" is shown as intact doors and an empty street, so no intruders
  appear (the VO denies them).
- **Rewatch:** the pennant patterns, the birds hopping on "off", the sun's power glyph. On loop, the frame you just left
  becomes this one.

### S02 The elephant lock (4.80 to 10.88)
*"They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites."*
- **What we see:**
  - A zoom into civicC's door. Screws spin out, the plate swings open, and a tiny beetle scuttles out of the lock on "bug".
  - "PHP": the elephant emblem rings, and Pip does a double take (that's him).
  - A pull-back to the press house (pen-nib sign pops on "WordPress").
  - A second pull-back to ten shopfronts: plates light up 1 to 7 on "7", and plain locks pop on the other 3 on "10". The sun
    becomes a 7/10 pie at the same time.
- **Why:** this sets up the whole metaphor in six seconds: door = site, plate = PHP, beetle = bug. The double pull-back is the
  reference's "progressive build", expressed as scale.
- **Rewatch:** the double take; the beetle waving its antennae; counting the lit plates against the pie.

### S03 The two-step stoop (10.88 to 15.76)
*"Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere."*
- **What we see:**
  - Match-cut onto door #4. On "two steps" a two-step stoop pops out of the pavement with numerals 1 and 2.
  - "First": Pip hops onto step 1, and the sun becomes a magnifying glass that reveals the beetle in x-ray.
  - "Then": Pip hops to step 2, the sun flies home, and the new plate stamps on.
  - "everywhere": a pull-back, and dashed ghost plates ripple onto every door (where the fix must go, not yet done).
- **Why:** it turns an abstract two-step process into a physical object that comes back later as the payoff ("step two, the slow
  one"). The ghost plates avoid implying the fix is already installed everywhere.
- **Rewatch:** the sun-lens morph; the beetle peeks out at 11.28 before anyone looks.

### S04 Fourteen years (15.76 to 21.68)
*"You'd think finding it is the hard part, right? And for 14 years, nobody did."*
- **What we see:**
  - "hard part": step 1 stretches into a cliff. Pip looks up, slides off, and turns to camera on "right?".
  - "And": the step boings back.
  - "14 years" is a time-lapse: the calendar counts 1 to 14, the sun arcs five times, ivy climbs, the tree cycles seasons, and
    passersby walk past without looking.
  - "nobody did": Pip sleeps on the stoop, a cobweb grows over the lock, and the beetle naps inside as a dotted ghost.
- **Why:** the rhetorical question gets a physical joke, and "14 years" is shown as time, not as a number alone.
- **Rewatch:** the ghost beetle napping; the calendar counting in sync with the caption highlight.

### S05 August: found (21.68 to 25.44)
*"Then, in August, two security teams using AI tools found it"*
- **What we see:**
  - The time-lapse halts with a ding. The cobweb snaps and Pip wakes.
  - The calendar tears to AUG and the sun shimmers with summer heat.
  - Two teams slide in from both sides, large and cropped like the reference's foreground people.
  - Sparkle icons pop on their scanners on "AI". Dashed scan cones sweep the facade and converge on the lock on "found": the
    x-ray shows the beetle caught mid-step with a "!".
- **Why:** after five seconds of nothing, this is the first "event", and the composition shifts from empty to crowded.
- **Rewatch:** the beetle's sweat drop; the two scanner holders' tiny hop.

### S06 The quiet tip (25.44 to 30.64)
*"and quietly told the people who make PHP so a fix could be ready before anyone else knew."*
- **What we see:**
  - A pan down the street to the locksmith workshop. Pip tiptoes behind the teams with a trunk "shh".
  - A drop of the sun falls and becomes the wax seal on an envelope, which slides through the mail slot.
  - A cutaway shows the makers at a pegboard of keys and an elephant emblem.
  - The new plate assembles on the bench and gets its check tag on "ready".
  - The blind rolls down on "before anyone else knew" while strollers pass, oblivious.
- **Why:** "quietly" and "before anyone knew" become staging: closed blinds, a mail slot, tiptoes. The sun-drop seal echoes the
  reference's sun-stamp.
- **Rewatch:** the seal is the sun; the pegboard pattern.

### S07 The leak (30.64 to 35.60)
*"Except, the details of the bug leaked online hours before the fix came out."*
- **What we see:**
  - A pull-back reveals a public noticeboard beside the workshop (the reference's bulletin board).
  - The blueprint with the beetle gets pinned on "details" and circled on "bug".
  - On "leaked online" copies flutter everywhere, including every far window and Pip's face.
  - The sun becomes a clock and spins three hours on "hours".
  - Only then does the blind roll up and the cart of new plates roll out, on "came out".
- **Why:** the sequence is visibly in the wrong order (flyers first, cart last), which is the whole point.
- **Rewatch:** the flyer on Pip's face; tiny flyers in the far windows.

### S08 The shield-dome (35.60 to 43.76), flip 1
*"Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening."*
- **What we see:**
  - The card flips to a wide hill-town view. On "Cloudflare" one long ink arc draws a glass dome over most of the town; the
    buildings outside it stay plain ("a big chunk", not all).
  - A watchtower pops up with a spotlight and an odometer counter on "says it saw".
  - Waves of tiny faceless attempters arrive from three edges and knock at the rim. The counter rolls blurred.
  - "in 45 minutes": the sun becomes a stopwatch and a cream wedge sweeps three quarters of it.
  - "millions": the counter pops a seventh wheel and the attempters multiply into the reference's dense dot-crowd.
  - "by evening": the sun sets, the sky turns salmon and the windows light up.
- **Why:** this is the most information-dense line, so it gets the longest, widest shot and the most "build". The VO only says
  Cloudflare *saw* the attempts, so we show seeing (spotlight, counter) and trying (knocks), never bouncing off and never
  getting in. The counter never settles on a number we don't have.
- **Rewatch:** the crowd density at "millions"; Pip ducking behind the spotlight.

### S09 Unknown, and the slow step (43.76 to 47.84)
*"Nobody knows yet how many got in. So now comes step two, the slow one."*
- **What we see:**
  - Dusk, three doorways. Footprints lead up to each door and stop at the threshold. A "?" pops above each door, one per word.
  - Pip peeks out and shrugs.
  - A push-in to the center stoop (our door #4): step 2's riser gets a salmon highlight, and a snail starts crawling across it
    on "slow". Pip sighs.
- **Why:** the footprints are deliberately ambiguous: no one is shown inside. The snail is the clearest possible "slow" and it
  becomes a running gag.
- **Rewatch:** the snail has barely moved by S10, and it is still crossing the pavement in S11.

### S10 Twenty-two million doors (47.84 to 54.56)
*"Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit."*
- **What we see:**
  - Next morning (sunrise). One locksmith installs the new plate. Pip nudges the toolbox over.
  - The pull-back reveals the door is the first of a long street of doors, each with an empty checkbox; only one is ticked.
  - The camera tilts to an aerial carpet of hundreds of tiny roofs. Elephant dots blink outward on "22 million" and the pattern
    keeps tiling as if endless.
  - Target rings pop on scattered roofs on "hit".
- **Why:** this turns scale into repetition, the reference's crowd trick applied to buildings. One person against an endless
  pattern is the emotional point of "step two".
- **Rewatch:** Pip, tiny on his chimney against the carpet; the single ticked box.

### S11 Switch it off (54.56 to 60.56)
*"If a site can't update fast enough, the safest thing is to switch it off until it can. That's what those government sites did."*
- **What we see:**
  - A close door with an hourglass sign; the snail crosses again on "fast enough".
  - A wall knife-switch draws on. The sun becomes the power button again on "switch". The lever clunks down on "off" and the
    lights die.
  - A "back soon" clock plaque swings on for "until it can".
  - On "That's what those government sites did" the camera pulls back and reveals this door was civicC all along: we are back
    in S01's exact framing, all four buildings dark, with Pip on his bench.
- **Why:** this is the payoff of the hook. The viewer finally understands the opening shot, and it is the most shareable "oh"
  moment.
- **Rewatch:** the fluted column edge in the close-up is the clue.

### S12 Too old to fix (60.56 to 66.64), flip 2
*"And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore."*
- **What we see:**
  - Three buildings. The sun becomes a 3-slice pie, one slice tan, and the middle building pulses tan to match.
  - On "a version so old" the middle building ages to sepia: cracks, a crooked shutter, cobwebs, and its plate becomes an old
    skeleton-key plate. Pip blows the dust and sneezes.
  - The makers' cart from S07 rolls in, fixes the left building, rolls straight past the old one (a wrench-slash icon pops) and
    fixes the right one.
- **Why:** "don't fix it anymore" is shown as being skipped, with no text needed. The pie rhymes with S02's 7/10.
- **Rewatch:** it's the same cart from the leak scene; the sneeze.

### S13 Switch off, or hope (66.64 to 70.687), then the un-build
*"For those, it's switch off or hope the hosting company sorts it out."*
- **What we see:**
  - A push-in on the old door. The switch box appears on the left wall on "switch off". On "or" Pip looks left, then right,
    down a side street.
  - On "hope" he crosses his trunk and the sun starts to set. A tiny caretaker van (the hosting company, no logo) appears far
    away on "hosting".
  - On "sorts it out" everything un-builds: small fills shrink away and the facade collapses into one tan block, which slides
    down out of the panel. Behind it is S01's line-art Civic Row (frame 0). The sun sinks to its frame-0 spot and Pip hops onto
    the bench.
  - The caption rolls out over the last 5 frames.
- **Why:** it ends on an honest non-resolution (two options, one of them only hope), then the loop makes the viewer watch the
  whole cycle again. The un-build mechanics are copied from the reference's ending strip (the color block shrinks and slides
  down to reveal the opening line art).

## 5. Loop mechanics (frame 0 = last frame)
- **Frame 0:** Civic Row line art (ink on white paper fills, so shapes still occlude the sun), sun at (480,440) half behind the
  far buildings, Pip in color in sit-back on the bench, empty caption zone.
- **Last caption:** rolls out from 70.52 to 70.687. The first caption rolls in from 0.00 to 0.16, so the seam is on an empty
  caption zone.
- **Audio:** sfx tails end before 70.687, and the frame-0 swell starts at 0.10.

## 6. Accuracy guardrails (what we deliberately do not show)
- No intruders anywhere near the government buildings ("Nobody hacked them").
- Attempts are shown as trying and being seen, never as blocked or as succeeding.
- "How many got in" is shown with footprints that stop at doors and "?" tags, never as a figure inside.
- "Fix it everywhere" in S03 uses dashed ghost plates (a plan, not done). Actual installation is one-at-a-time in S10.
- Counters never settle on a specific number. The numbers live only in the captions.
- There are no real flags, logos or brand marks. WordPress, Cloudflare and the hosting company exist only as captions over
  generic objects.

## 7. Caption timing notes
- Glued ASR tokens were split using onset detection on `vo.mp3`:
  - "7" ≈ 9.38
  - "10" ≈ 9.86
  - "14" ≈ 18.92
  - "45" ≈ 41.04
  - "22" ≈ 51.24
  - "a version" = 62.64 / 62.72
- Real pauses measured in the audio (RMS): 3.61, 6.95, 10.73, 12.95, 14.10, 15.64, 17.59, 18.20, 20.12, 21.31, 30.14, 31.28,
  35.43, 42.12, 43.64, 46.71, 54.39, 58.93, 60.41, 66.53, 68.29. Scene cuts sit on sentence ends.
- **The one exception** is S05 → S06 at "and" (25.44). The 9 s sentence is split by a camera pan that follows the envelope, so
  it does not read as a cut.
- 37 captions in total. The longest lines are 24 characters ("the programming language", "is the hard part, right?",
  "of the bug leaked online", "before anyone else knew.").

## 8. Build notes and toolkit requests
- **Reusable kit pieces this board needs** (many scenes share them):
  - Facade/Shopfront (door, window, awning, stoop options)
  - CivicBuilding (perspective and frontal)
  - LockPlate (elephant / plain / new-with-check / old skeleton-key / x-ray open)
  - Beetle
  - BackViewPerson (sizes from 26 px to 475 px, cropped at the panel bottom)
  - Crowd/dot-crowd
  - Noticeboard, Flyer, Calendar, KnifeSwitch, Cart, Snail, Van, Dome, Watchtower, Odometer
  - RoofCarpet tiler
  - Sun overlays: power glyph, pie(n, k), lens handle, clock, stopwatch wedge, seal-drop
- **Mascot extras requested from the mascot stream:**
  - 'trunk-cross' (S13 hope). Fallback: trunk-up + expression closed.
  - A dust/sneeze puff prop (S12).
  - A flyer-on-face prop for 'hold'/sit-front (S07).
- **Line-art state:** every element needs a "lineart" mode (white fills, no color) for frame 0 and the un-build.
- **Camera:** scenes use in-world zoom and pan. The sun is drawn at card level but can be clipped behind a world edge (roofline,
  cornice) for the sets in S09 and S13.
