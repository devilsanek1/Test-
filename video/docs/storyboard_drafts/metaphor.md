# Storyboard draft: METAPHOR-ARCHITECT

Angle: one visual metaphor system that a non-technical viewer gets on sight, so the abstract story (a bug in a programming language, a leak, a patch race) becomes a story about **doors and locks in a city**.
Machine-readable version: `docs/storyboard_drafts/metaphor.json` (13 scenes, 122 timed beats). I checked it: valid JSON, scenes contiguous from 0 to 70.687 s, every caption line is 24 characters or fewer, at most one highlight per caption, the caption text reproduces the VO word for word, every line starts on its first word's timestamp, and the longest gap between visual events is 1.36 s.

---

## 1. The concept in one breath

**The web is a city. Every website is a building. PHP is the standard blueprint most of them are built from. The bug is a lock in that blueprint that doesn't catch, so every building made from it has a door that won't fully shut.**

Everything else follows from that one idea, so nothing in the film needs a second explanation:

| VO idea | On screen | First taught | Reused |
|---|---|---|---|
| the web | a city of facades, linked by rooftop wires | S01 | S08, S10 |
| a website | a building with a **browser address-bar sign** on its frieze (rounded pill, tiny padlock, three dots) | S01, on "websites" | every scene |
| PHP | a teal **blueprint** stamped with an **elephant** (the stamp is Nell-shaped); buildings pop up out of it like a pop-up book | S02 | S05, S07, S10, S12 |
| "7 out of 10 websites" | 10 pop-up buildings, 7 get periwinkle elephant plaques at their base, and the sun turns into a 70% pie | S02 | the 1/3 pie in S12 |
| the bug | a **box lock whose bolt stops short**, so the door rests ajar with a dark sliver, marked by a hand-drawn **orange ring** | S02, on "bug" | S03, S04, S05, S07 |
| two steps | a **two-step stoop**: step 1 riser = magnifier (find), step 2 riser = wrench (fix) | S03 | S04 (step 1 towers), S09 (step 2 stretches) |
| "finding is the hard part" | step 1 extrudes into a tower nobody climbs for 14 years | S04 | |
| AI tools | raised tablets with the 4-point **sparkle** glyph that sweep scan beams across the blueprint | S05 | |
| the people who make PHP | a narrow **workshop** with a hanging elephant sign | S06 | S07 (background), S10, S12 (their cart) |
| the fix | a **new lock**: cream box with an orange keyhole dot | S06 | S07, S10, S12 |
| the leak | the ringed blueprint page escapes on a gust and is **pinned to the public noticeboard**, which has its own address bar, so the board is "online" | S07 | |
| Cloudflare | a **glass dome** over a big chunk of the city, with a **watchtower guard** and a **tally board** | S08 | |
| break-in attempts | hooded figures **rattling door handles** and tapping the dome. Nobody is ever shown getting in | S08 | |
| "nobody knows how many got in" | empty night street with **"?" marks** over the doors | S09 | |
| 22 million copies | an **endless wall of tiny doors**, each with a periwinkle stamp dot | S10 | |
| switching off | a **roll-down shutter**, lights out, the **sun pressed like a power button**, a "back soon" clock tag | S01 | S11, S13 |
| unsupported old version | an old building with a faded, older plaque that the workshop's **delivery cart rolls straight past** | S12 | |
| hosting company | the landlord's **caretaker** with a big key ring | S13 | |

**Colour code taught by the film:** orange = the disc and "attention" (bug ring, keyhole of the fix, target rings). Periwinkle = PHP: Nell, stamps, plaques and pennants share it, so "elephant colour" means PHP without a word. Peach is used only for caption highlights.

**Production note:** the same handful of parts covers all 13 scenes: facade, door, box lock in its bug and fixed states, address pill, shutter, clock tag, elephant plaque, blueprint sheet, back-view person, hooded figure, cart. That's what makes 70 seconds of dense hand-coded SVG doable at reference quality.

---

## 2. The mascot: Nell

An original baby elephant, our nod to PHP's elePHPant but not the official mascot. She has a bean body, short column legs with cream toenails, one big D-shaped ear (her emotion dial), a short curled trunk (her gesture tool), a tufted tail and a dot eye. There are no tusks, no text and no logo. She is built from the existing `src/lib/mascot` module in the **periwinkle** colorway at scale 0.6 to 0.9, so she reads at the size of the reference cat, and she only uses the poses that already exist (sit-back, sit-front, stand-side, walk-side, peek, trunk-up, hold, ears-cover, shrug, sleep).

**Her role:** she's the viewer's stand-in, like the reference cat. She watches the explanation, reacts to it and gets one small physical gag per scene. She never stands between the viewer and the thing being explained.

| Scene | Nell |
|---|---|
| S01 | sits watching the capitol, flinches with each shutter, shrugs at camera on "Nobody hacked them" |
| S02 | double-takes at the elephant stamp, which has her silhouette, then copies its pose ("that's me?") |
| S03 | hops up the two steps in rhythm, holding a tiny magnifier and then a tiny wrench |
| S04 | rides step 1 up as it becomes a tower, gives the film's only look to camera on "right?", then sleeps through 14 years while a leaf lands on her ear |
| S05 | asleep on top of the blueprint frame (the reference cat's spot), startles awake on "found" |
| S06 | tiptoes behind the messenger with her trunk up in a "shh" |
| S07 | sits on the noticeboard like the reference cat, lunges for the escaping page and misses |
| S08 | on a rooftop inside the dome; folds her ear over her eyes on "millions" |
| S09 | peeks out at the "?" marks; slumps on "the slow one" |
| S10 | hands over the new lock with her trunk, then shrinks to a periwinkle speck beside the only fixed door |
| S11 | lights out, and only her eye glint shows in the dark; she's back in her S01 spot to nod on "did" |
| S12 | walks with the cart and shrugs at the old building it skips |
| S13 | covers her eyes on "switch off", looks up on "hope", then hops back to her frame-0 spot during the un-build. She's the only thing that never un-builds |

---

## 3. The orange disc: one meaningful morph per idea

| Scene | What the disc does | Why |
|---|---|---|
| S01 | rises from behind the roofline (the loop seam), then on "off" gets a power glyph and is **pressed** | the switch-off as a single gesture |
| S02 | **70% pie** on "7 out of 10" | the statistic shown in the anchor itself |
| S03 | two small bounces on "two steps" | rhythm |
| S04 | **clock face** spinning during "14 years" | time passing |
| S05 | heat shimmer on "August" | summer, with no text |
| S06 | sinks halfway behind the workshop roof on "quietly" | the disc is "in on the secret" |
| S07 | snaps back up on "Except,", then a **clock** sweeps 4 hours on "hours" | the leak beat the fix by hours |
| S08 | **clock with a 45-minute wedge**, then **sets** behind the skyline on "by evening" | the reference's setting-sun move, used for real time |
| S09 | starts set behind the cornice, **rises** on "So now comes step two" | a new day, a new phase |
| S10 | stays screen-fixed while the world zooms out twice | the only thing that doesn't shrink |
| S11 | **power button** again on "switch it off" | callback to S01 |
| S12 | **1/3 pie** on "one in three" | rhymes with S02's 7/10 |
| S13 | small press on "switch off", a glow on "hope", then sinks to its frame-0 position | loop |

---

## 4. Scene by scene

Times are absolute VO seconds. Glued ASR tokens were split as: 7 at 9.36, 10 at 9.88, 14 at 18.96, 45 at 41.04, 22 at 51.20, "a version" at 62.64 / 62.76.

### S01 · 0.00–4.78 · Capitol lights out
**VO:** Government websites in four countries just switched themselves off. Nobody hacked them.
**Transition in:** loop start. Frame 0 is the line-art plaza with the sun 40% risen behind the roofline, Nell in colour, and caption line 1 already set.
**What happens:** Colour floods into four government buildings on "Government". Address-bar signs pop onto their friezes on "websites", which is the moment we teach "building = website". Four abstract flags unfurl on "four". On "just" a caretaker appears inside each doorway with an arm on the pull-cord. Then four shutters slam down in rhythm on "switched / them- / -selves / off". On "off" the sun becomes a power button and is pressed, and the whole capitol goes dark. On "Nobody hacked them" the little padlocks in the dimmed address bars click shut, intact, and Nell shrugs at the camera.
**Why this visual:** "switched themselves off" is literal. The people inside pull their own shutters, and doors and walls stay pristine, so the VO's "nobody hacked them" isn't contradicted by any intruder imagery. The browser address bar is the most universally known web shape, which is why it carries the "website" idea in half a second.
**Rewatch hook:** the swinging clock tags on the shutters mean nothing on first watch. In S11 they become "until it can". The tower clock on govC is also a quiet preview of the sun's clock morphs.

### S02 · 4.78–10.88 · Built from one blueprint
**VO:** They were fixing a security bug in PHP, the programming language behind WordPress and about 7 out of 10 websites.
**Transition in:** X-ray push into govB, whose colours invert into its own blueprint (teal paper, cream lines).
**What happens:** On "security" the drawn back door creaks ajar by itself. On "bug" an orange ring draws around its lock and a callout shows the bolt stopping short. On "PHP" an elephant stamp slams onto the corner of the sheet, and Nell sees her own silhouette and copies it. On "language" the blueprint lies down as a floor, and on "behind" ten buildings pop up out of it like a pop-up book (the blueprint is literally behind them). On "WordPress" the tallest building, a publishing house with a pen-nib sign, rises last. On "7 out of 10" seven elephant plaques tick onto seven bases while the sun becomes a 70% pie.
**Why this visual:** "a language that sites are built with" turns into "a blueprint that buildings are built from", which anyone understands. Showing a building become its blueprint makes the relationship physical, not labelled. The pop-up book gives the most satisfying motion in the first 10 seconds, right where retention dips.
**Rewatch hook:** the stamp is Nell's silhouette. The three un-stamped buildings stay slightly paler for the rest of the shot.

### S03 · 10.88–15.76 · Two steps
**VO:** Fixing a bug like that takes two steps. First, you find it. Then, you fix it everywhere.
**Transition in:** 3D card flip.
**What happens:** On Stoop Street, a townhouse door sits up a side-running stoop of exactly two steps, and the steps pop up on "two" and "steps". On "First" Nell hops onto step 1, and on "find" a magnifier glyph inks onto its riser while a lens sweep glints off the faulty lock. On "Then" she hops onto step 2, and on "fix" a wrench glyph inks onto that riser. On "everywhere" tiny wrenches pop over every door down the street, past the vanishing point.
**Why this visual:** "Two steps" told with two literal steps is an instant visual pun. The stoop then becomes a reusable stage for the act structure: step 1 in S04 and step 2 in S09.
**Rewatch hook:** the faulty lock on this front door already has the orange ring from S02. It's the same bug.

### S04 · 15.76–21.68 · Fourteen years of nobody
**VO:** You'd think finding it is the hard part, right? And for 14 years, nobody did.
**Transition in:** same set, slow push-in.
**What happens:** On "finding", step 1 extrudes into a tall brick pillar and carries Nell up with it. On "right?" she turns to the camera, the film's only fourth-wall look and a deliberate comic hold. On "for 14 years" a time-lapse starts: a wall calendar tears off 14 pages, the street tree cycles through seasons, the sun becomes a spinning clock, and ghosted passers-by stream past the ajar door while ivy and a cobweb grow over it. Nobody looks. Nell sleeps on top of the tower. On "did" everything stops dead, and we zoom into the lock.
**Why this visual:** the joke of the VO ("you'd think finding is the hard part... and nobody did") is shown as a tower nobody climbs and a door everyone walks past. "Nobody noticed for 14 years" is felt, not stated.
**Rewatch hook:** count the calendar tears (there are exactly 14). A leaf lands on Nell's ear.

### S05 · 21.68–25.44 · Found it
**VO:** Then, in August, two security teams using AI tools found it
**Transition in:** match-cut on the lock. The camera is inside S04's lock, its lines hold, the colours swap to blueprint, and the zoom-out reveals it's the lock detail on the PHP master blueprint. The flaw was in the blueprint all along.
**What happens:** On "August" the calendar flips to a summer page and the sun shimmers. On "two security teams" two teams of three slide up in front of the board (back views, like the reference's crowd at the noticeboard), and small shield badges pop on their backs. On "using AI tools" they raise tablets with sparkle glyphs, and two scan beams sweep the blueprint from opposite sides. On "found" both beams lock onto the lock, the orange ring draws on, and Nell, asleep on the frame top, startles awake.
**Why this visual:** the sparkle is today's universal "AI" icon, so no robot clichés are needed. Two beams converging gives "found it" a physical click.
**Rewatch hook:** it's the same blueprint as S02, stamp included. Nell has been asleep since S04.

### S06 · 25.44–30.64 · A quiet letter
**VO:** and quietly told the people who make PHP so a fix could be ready before anyone else knew.
**Transition in:** a lateral pan that follows the messenger and his envelope.
**What happens:** He tiptoes, Nell tiptoes behind him with her trunk up in a "shh", and the sun sinks halfway behind the roof to keep the secret. On "told" the envelope slips through the workshop's mail slot. On "people" the shop window lights up to show three workers. On "PHP" the hanging elephant sign swings. On "fix" eight new locks pop into a crate in rhythm. On "before anyone else knew" a roller blind pulls halfway down and two passers-by walk past without looking. At 30.3 a corner of the ringed page flutters at the gap under the blind.
**Why this visual:** a mail slot is the most quiet way to tell someone something. The workshop gives "the people who make PHP" a home we can revisit (its cart reappears in S07, S10 and S12).
**Rewatch hook:** the fluttering corner foreshadows the leak 0.3 s before "Except".

### S07 · 30.64–35.60 · Pinned for everyone
**VO:** Except, the details of the bug leaked online hours before the fix came out.
**Transition in:** a whip pan riding a gust, as the page escapes and the workshop shrinks into the background.
**What happens:** On "leaked" the page is pinned to the public noticeboard, our version of the reference's board, with an address bar on its top rail so the board itself reads as "online". On "online" it clones across the glass (2, then 4, then 8 copies) while a crowd gathers with phones raised. Three wear hoods, but they're only reading. On "hours" the sun becomes a clock and sweeps four hours. On "came out" the workshop door finally opens in the background and the fix cart rolls out, too late.
**Why this visual:** this is the reference's most iconic set (noticeboard, crowd, cat on top), so the style homage lands right where the story turns. The leak, the crowd and the late fix all fit in one frame.
**Rewatch hook:** Nell misses the page by a hair. The phone screens show tiny teal copies.

### S08 · 35.60–43.76 · The guard counts
**VO:** Cloudflare, which protects a big chunk of the web, says it saw tens of thousands of break-in attempts in 45 minutes, and millions by evening.
**Transition in:** zoom out. The noticeboard shrinks into one square of a whole city (the web), and the sun stays screen-fixed.
**What happens:** A glass dome draws over the left 60% of the city ("a big chunk") and a watchtower guard with a searchlight "sees". On "tens of thousands" hooded figures pop in and rattle handles, the dome ripples where it's tapped, and a tally board fills faster and faster. On "45 minutes" the sun becomes a clock and a 45-minute wedge sweeps. On "millions" the figures become a dense stipple crowd and the tally marks overflow onto the tower and up the glass. On "by evening" the sun sets behind the skyline and the windows light up.
**Why this visual:** a dome over part of the city makes "protects a big chunk of the web" spatial and honest: big, not all. The tally board turns abstract counts into a texture that grows. The setting sun is the reference's own move, here doing story work. No door opens on screen, because the VO only claims attempts.
**Rewatch hook:** the tiny noticeboard is still visible inside the city. The tally marks spill up the dome glass.

### S09 · 43.76–47.84 · Question marks, then dawn
**VO:** Nobody knows yet how many got in. So now comes step two, the slow one.
**Transition in:** match-cut on the skyline line, which becomes Stoop Street at night, with the set sun sitting on the cornice.
**What happens:** The street is empty. On "how many" ink "?" marks pop above doors down the street, with the biggest in the front door's dark sliver next to the peeking Nell. On "So now comes" the sun rises: dawn. On "step two" the wrench step glows, and on "the slow one" it stretches into a ledge that runs all the way to the vanishing point, door after door. A snail appears on it.
**Why this visual:** "nobody knows" is shown as absence (no figures, only question marks), which is the honest version. The stoop callback reconnects the viewer to the two-step structure after the drama, and the stretching step makes "slow" a shape.
**Rewatch hook:** the snail.

### S10 · 47.84–54.56 · 22 million doors
**VO:** Someone has to install that fix on every site, and there are about 22 million copies of PHP out there that could be hit.
**Transition in:** zoom in along the long step onto door #1.
**What happens:** The worker rolls up with the cart. On "install" the old lock drops off with a clunk, and on "fix" the new lock pops on, handed over by Nell's trunk, with a tick. Then comes a powers-of-ten zoom out. On "every site" door #1 is one of 9 on a facade. On "22 million" it becomes a patch of an endless wall of tiny doors that fills in a wave to the horizon, and every periwinkle stamp dot blinks on "copies". On "could be hit" small orange target rings flicker on random doors.
**Why this visual:** one fixed door against an endless wall is the clearest possible picture of why step two is slow. The procedural door grid is exactly what code draws beautifully.
**Rewatch hook:** find the only cream tick and the periwinkle speck next to it (Nell).

### S11 · 54.56–60.56 · Shutters down
**VO:** If a site can't update fast enough, the safest thing is to switch it off until it can. That's what those government sites did.
**Transition in:** zoom into one ringed door, which becomes a single shop.
**What happens:** An hourglass pops above the door while, far down the street, the worker is still many doors away. On "switch it off" the sun is the power button again, the shutter rolls down and the lights go out. On "until it can" the clock tag from S01 swings on. On "That's what those government sites did" a whip pan lands on the S01 plaza in its switched-off state, and Nell nods.
**Why this visual:** it pays off the cold open. The viewer now knows why the capitol went dark, and the very same image means something new.
**Rewatch hook:** the clock tags from frame 3.4 finally explain themselves.

### S12 · 60.56–66.64 · Too old to fix
**VO:** And one in three sites on PHP runs a version so old that the people who make PHP don't fix it anymore.
**Transition in:** 3D card flip.
**What happens:** Three sites pop up one by one on "one / in / three" (counting) while the sun shows a 1/3 pie. On "runs a version" the middle building's plaque flips to an older, chipped version. On "so old" cracks, peeling paint and a cobweb arrive. On "the people who make PHP" the workshop's cart rolls in: it fixes the left site, rolls straight past the old one (a "no service" stamp thumps onto its door on "fix"), and fixes the right one. The rhythm is tick, skip, tick.
**Why this visual:** "the makers don't fix it anymore" is shown as an action (being skipped), not a label. The three sites stand in the exact slots of S01's govA, govB and govC, and the old one has govB's silhouette. That's the hidden geometry that makes the loop work.

### S13 · 66.64–70.687 · Switch off or hope, then un-build
**VO:** For those, it's switch off or hope the hosting company sorts it out.
**Transition in:** push in on the old site.
**What happens:** On "switch off" a small power press, and the shutter comes down. On "or" it rattles back up 35% and a slice of warm light spills under it (the other option). On "hope" the sun glows and Nell looks up. On "the hosting company" the landlord's caretaker arrives with a big key ring and a ladder. On "sorts it out" he raises the keys, and we never see the result: the ending is honestly open. **Un-build (70.0–70.687):** every fill collapses into a tan slab that slides out of the bottom, the reference's ending move. The three sites' line art morphs into the S01 capitol, govD draws in over the park, the sun sinks behind the roofline to its frame-0 rise point, Nell hops back to her frame-0 spot, and the caption rolls to "Government websites".
**Why this visual:** the old building is a government-style facade in govB's slot, so the last image of the story is the first image of the video, and the last spoken idea ("switch off") is the first one heard.

---

## 5. Loop

The last frame is the same as frame 0: S01 line art (ink plus card-white fills), sun half-risen behind the govB/govC roofline at (480,340), Nell sit-back at (760,1050), and caption line 1 "Government websites". The loop then plays: the sun rises and colour floods in on "Government". Story-wise the ending ("switch off") hands straight to the opening ("switched themselves off"), so a viewer who misses the seam just keeps watching. Sound note: the S13 un-build whoosh at 70.4 must crossfade into the S01 frame-0 sun-rise whoosh, and the music bed must be loopable.

## 6. Transitions map (each one is a different camera move)
loop-start → X-ray zoom (4.6) → flip (10.7) → same-set push (15.8) → match-cut through the lock into the blueprint (21.2) → pan right (25.3) → whip pan left on a gust (30.6) → zoom out to the city (35.5) → match-cut skyline to street, night (43.6) → zoom in to a door (47.7) → two powers-of-ten zoom-outs (49.4, 50.5) → zoom in to one site (54.4) → whip pan to the capitol (59.0) → flip (60.4) → push in (66.5) → un-build (70.0).

## 7. Toolkit requests (for the engine/kit lane)
1. Theme key `php` = `MASCOT.body` (periwinkle) for stamps, plaques and pennants.
2. **Blueprint mode** for Ink/Fill: swap ink to cream and fills to teal over a 0.4 s crossfade (S02 X-ray, S05 match-cut).
3. Kit parts: `Facade` (slot-based, with a pediment/dome/tower/modern variant), `AddrPill` (on/dim), `Door` + `BoxLock` (states: `ajar` = bolt short + dark sliver, `fixed` = cream lock with orange keyhole dot, `drop`), `Shutter` (progress 0..1, ribs), `ClockTag`, `ElephantPlaque` (fresh/old), `Blueprint`, `HoodedFigure` (with a rattle jiggle), `Dome` (arc + lattice + ripple), `TallyBoard` (procedural count to texture), `DoorWall` (procedural perspective grid), `Cart`, `Worker`, `Caretaker`, `QuestionMark`.
4. Sun overlays: power glyph + press, clock face (hands, plus a wedge from-to), pie (fraction), heat ticks, horizon clip (already supported).
5. Camera: zoom/pan with the sun optionally screen-fixed (S08, S10), a whip pan with motion-smear ink strokes, and an un-build slab (fills collapse into one tan block that slides down).

## 8. Risks and mitigations
- **Too many metaphors?** No. There is one system (city, buildings, blueprint, lock), and every new object is either a lock state or a person acting on a lock. The dome and the caretaker are the only additions, and the captions name them.
- **"Nobody hacked them" vs the hooded figures in S07/S08:** the hoods never appear in S01 or near the government buildings. In S08 they only rattle handles or bounce off the dome, and no door ever opens for them.
- **S08 is 8.16 s:** it has 11 beats, and the longest gap between them is 1.36 s.
- **Density at 1080 px:** S08 and S10 rely on procedural patterns (tally marks, the door grid), so they stay crisp and render fast.
