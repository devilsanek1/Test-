# Storyboard v3: php2shell, re-mapped onto the final script (word-anchored)

Machine-readable twin: `docs/storyboard_v3.json` (12 scenes, 209 beats, 28 caption pages, 16 on-screen labels). Script: `docs/script/final_script.md` section 1 (178 words, the JSON's `wordsRef`). Estimated timeline: `assets/timing_est_v3.json` (same schema as `assets/timing.json`, `"estimated": true`), **54.59 s**.

**Every time is a word anchor** `{w, dt}`: `t = words[w].s + dt`, where `w` is the 0-based index into `wordsRef.split()` (whitespace split, punctuation attached). In this document an anchor is written `w14+0.35 'purpose' (3.96)`: word 14, 0.35 s after its start, and in brackets the estimated second (for reading only). The film starts 0.125 s before word 0 (`w0-0.125` = 0 s) and ends 0.35 s after the last word ends. When the voice is recorded, only the timing file changes; every scene, cut, camera key, caption, highlight, label, sun key and sound cue moves with its word. Durations of motions (a 0.16 s shutter slam, a 0.4 s wipe) stay in seconds.

**How the estimate was made.** Word durations and pauses come from the previous ElevenLabs take (`assets/timing.json`, 77.76 s): the median measured duration of the same word, otherwise a syllable fit on that take (0.075 s + 0.138 s per syllable), final lengthening x1.19 before a pause, x1.12 on the four cued CAPS words, sentence pauses 0.555 s and comma pauses 0.255 s (the take's medians), 0.36 s for the cued ellipsis after 'PHP', 0.20 s where the cue asks for a breath ('announced,', 'off,'), lead-in 0.125 s, tail 0.35 s (tail + lead-in = 0.475 s, a sentence pause at the loop seam). Result 54.6 s, against final_script.md's own estimate of about 56 s.

**Validated.** The JSON parses; a lint that resolves every anchor against the estimate passes with 0 blockers, 0 majors, 0 minors: scenes tile 0 to the end, the captions reproduce the script word for word (28 pages, widest line 838 px at 98 px), every cut sits in a pause (one accepted phrase boundary), every camera segment is continuous or marked as a cut, the six match objects keep screen position and size, nothing but sky crosses screen y 560 at any camera key, sun landings / presses / pulses sit on their words, every mandatory label is present and held >= 1.5 s, every scene has >= 5 events/s and no gap > 0.45 s between events.

## Concept

**Unchanged world, new spine.** The web is a city and every building is a website (its main window is a browser window with chunky chrome). PHP is the elephant-stamped blueprint most of the city is built from; each PHP building has a sand elephant plaque. The bug is a flaw in that blueprint's lock (the bolt stops short), so every door built from the plan has it, and a tiny ink beetle called Bit lives in it. Pip, the periwinkle elephant, watches from ledges. The orange sun is the anchor and a character: a power button (pressed twice: the hook and the FBI line), a 7/10 pie, a wax seal, an hours clock, a 45-minute wedge, the one sunset and the one sunrise, a 1/2 pie, and finally a clock that runs BACKWARDS.

**The story in pictures.** Government buildings switch themselves off with a power-button sun (S01). Why: a drawing of the flawed lock shows a hand opening it with no key (S02). The flaw is in the PHP plan most of the city is built from (S03), it sat in plain sight for fourteen years (S04) until researchers with AI found it and saw how bad it was (S05). They sent the makers a heads-up (S06), but the leak hit the public board before the fix existed (S07), and hooded figures were already at the doors when Cloudflare's dome started counting: tens of thousands in forty-five minutes, millions within a day (S08). Next morning the fix is out, but somebody has to install it, one door at a time, on a whole hillside of doors (S09), and about half the street runs plaques so old they get no official support (S10). So the official advice: turn it off (S11). And some of those governments did it before there was even a fix: the plaza rewinds to that morning (S12), and the loop plays it again.

**Scale, with restraint (BALANCE NOTE).** Three Arcane-scale peaks: the hook's Government Plaza (S01, mirrored by S12), the rooftop vista with the Cloudflare dome and the biggest sun (S08), and the hillside of doors seen from the street (S09 Part B). Two big camera moves only (the S08 crane and the S09 pull-back). Everything else is the reference-2 baseline: eye level, full bleed, one gentle 3-6% push per shot, then a locked camera so the builds read.

## What changed from the v1 storyboard

| v1 scene | v3 | why |
|---|---|---|
| S01 plaza | S01 (re-staged) + S12 | no count ('four' pennants gone); only SOME buildings close, govC half ('a bunch of'); a far civic skyline = 'all over Europe'; press on 'shut', tags on 'purpose'; frame 0 is COLOUR |
| (new) | S02 takeover diagram | final_script section 6's new inset: the stakes ('take over a site without a password') shown on the plan, never on a real door |
| S02 lock close-up + Blueprint Street | S03 (wide part only) | the lock close-up job moved to S02; the WordPress cue dropped; the bait gets a dry sticker gag |
| S03 two steps | cut | no 'two steps' lesson; its wrench tags moved to S09 ('every single server') |
| S04 tower + 14 years | S04 (14 years only) | the 'hard part' tower, the look to camera and 'did' are gone with the setup |
| S05 found it | S05 | ring on 'out'; the S02 hand redraws on 'bad' (how bad it was); 'August' moves into label L6 |
| S06 quiet letter | S06 heads-up | the makers' heads pop UP on 'heads-up'; blind stays down = 'still fixing...' |
| S07 pinned for everyone | S07 word got out | lens wipe on 'but'; the clock now just says 'not ready yet'; dates in label L7 |
| S08 dome + flood | S08 (re-staged) | opens on hackers ALREADY at the doors; the dome covers about 1/5 of the city; a rooftop counter board counts from the announcement; stamps; sunset on 'within a day' |
| S09 night "?" | cut | no 'how many got in' line; the night is skipped, the sunrise stays (S09 opens on it) |
| S10 22 million doors | S09 every single server | 'But even with the fix out' = the crate arrives; the pull-back lands on 'every single server'; no '22 million' |
| S12 one in three | S10 about half | 1/2 pie; ~half the plaques old; support tags skip them; a host caretaker patches one (label L13) |
| S11 shutters down | S11 FBI | advisory notice L14, press on 'turn', shutter on 'it off'; the tech-support joke is a sticky note + a tiny shrug |
| S13 two options + un-build | cut | the loop job moves to S12's rewind (the S11 -> S01 hard cut of final_script section 6) |

## Time-of-day arc

1. `day`: S01-S05 (S05 is high summer: the facade calendar tears to its summer page, 'August' is in L6).
2. `golden`: S06-S07, the heads-up and the leak.
3. S08 runs `golden` -> **dusk**: the film's one sunset, in two steps on 'within' / 'day', at screen x 700.
4. S09 opens on the last of that dusk, then the film's one **sunrise** at the exact point the sun set (the dawn wipes in bottom-up in bright cream): the next morning, the fix is out. Then `day`.
5. `day`: S10-S12. The S12 rewind takes the plaza back to the frame-0 morning (the sun sinks back to its mid-rise point).

Captions are ink on every sky (ink on the sage dusk is 5:1); no white page is needed. No night beat (the old S09 night is cut).

## Scene table

| id | words covered | est. time (s) | visual | camera | peak? |
|---|---|---|---|---|---|
| S01 Government Plaza powers down | w0-w14 "Governments ... purpose," | 0.00-4.30 (4.30) | Government Plaza: civic buildings, browser-window facades, the r155 power-button sun pressed on "shut"; govA + govB shutters slam, govC half, govD stays lit; far civic skyline winks out; "back soon" tags on "purpose". | sine push 1.00->1.04 from rest, lock; 0.30 s dive into govB's lock box | PEAK 1 |
| S02 The takeover diagram | w15-w28 "because ... password." | 4.30-8.25 (3.95) | Tight on the PHP master blueprint: the lock detail with its short bolt, Bit in the gap; a dashed diagram hand turns it with no key and a tiny schematic site is taken over. Labels L1, L2. | push-through lands 1.15->1.30, slow 3% creep | - |
| S03 Built from one blueprint | w29-w45 "It's ... it." | 8.25-13.97 (5.73) | Blueprint Street: the stamp slams on "PHP", the pop-up book on "the language", the "I [heart] PHP?" sticker on "loves", 7 plaques tick + the 7/10 sun pie. Labels L3 -> L4. | hard cut, 4% breath, lock | - |
| S04 Fourteen years in plain sight | w46-w54 "This ... years" | 13.97-16.03 (2.05) | Door #4 close: Bit sits on the lock in plain sight while 14 year pages tear, seasons cycle, ghosts pass, Pip sleeps. Label L5 hangs from the lock. | creep 1.50->1.55; 0.37 s push into lock4 (match) | - |
| S05 Found with AI | w55-w64 "before ... was." | 16.03-19.00 (2.97) | The blueprint wall (low angle): two teams rise, AI tablets, scan beams; ring on "out", the S02 hand redraws on "bad" (how bad). Label L6. The messenger leaves with an envelope. | match lands 1.08->1.12, lock; truck-right with the messenger | - |
| S06 A heads-up | w65-w71 "They ... heads-up," | 19.00-21.20 (2.21) | Makers' Lane (golden): the sun pops a wax seal onto the envelope, mail slot, three makers' heads pop UP on 'heads-up'; blind down 'still fixing...'. | cut on action: truck-right (matched speed), lock | - |
| S07 Word got out | w72-w80 "but ... ready," | 21.20-23.55 (2.35) | Noticeboard: the leak sheet lens-wipes in on "but", the address-bar rail goes online, clones 2-4-8, copies ride the wires, the sun becomes a spinning clock (fix not ready). Label L7. | lens wipe; 6% push, lock; tilt-up into S08 | - |
| S08 Counted from the announcement | w81-w111 "and ... day." | 23.55-33.33 (9.78) | Crane over our parapet: hooded figures already rattling doors across an endless city; on "Cloudflare" a glass dome draws over ONE far district (~1/5); a rooftop counter board counts from the announcement; 45-min wedge; millions burst; sunset. Labels L8-L11. | BIG MOVE 1: crane 1.3->1.0 (out(quart)); gentle 5% lean, lock | PEAK 2 |
| S09 Every single server | w112-w127 "But ... server." | 33.33-38.55 (5.22) | Sunrise at the set point; the makers drop a crate (fix is out), one keeper installs one lock; hidden match-cut, pull-back up a hillside of ~650 doors: wrench tags over every door, one check flag. Label L12. | hold; approach push 1.0->1.5; hidden match at zoom 6; BIG MOVE 2: pull-back 6->1 (2.1 s) | PEAK 3 (Part B) |
| S10 Half on versions too old | w128-w143 "Plus ... anymore." | 38.55-44.24 (5.69) | Old Quarter at door height: 1/2 sun pie, plaques flip old on ~half the sites, cobweb + cane; "officially supported" tags skip the old ones; a host caretaker patches one anyway. Label L13. | tram wipe; 5% push, lock; 0.4 s dive into siteM's window | - |
| S11 Just turn it off | w144-w164 "Even ... everything." | 44.24-51.07 (6.84) | govB's browser window: a stalled progress bar, the advisory notice (L14), the sun pressed on 'turn', the shutter drops; a sticky note 'Turn it off and on again' gets 'and on again' struck on 'everything'. | push-through lands 1.60->1.66, lock; 3% lean into the joke | - |
| S12 Before there was even a fix (the rewind) | w165-w177 "And ... fix." | 51.07-54.59 (3.52) | Hard cut back to the plaza as the shutdown left it; on "before" the sun shows a clock spinning BACKWARDS and the whole plaza rewinds to the frame-0 morning (shutters up, lights on). | hard cut, 3% push; the rewind eases the camera back to rest (= frame 0) | - |

**Cuts (beat-locked to the voice):** S02 at w15-0.04 'because' (4.30), S03 at w29-0.08 'It's' (8.25), S04 at w46-0.15 'This' (13.97), S05 at w55 'before' (16.03), S06 at w65-0.25 'They' (19.00), S07 at w72-0.06 'but' (21.20), S08 at w81-0.10 'and' (23.55), S09 at w112-0.40 'But' (33.33), S10 at w128-0.10 'Plus' (38.55), S11 at w144-0.30 'Even' (44.24), S12 at w165-0.12 'And' (51.07). Every cut sits in a sentence or comma pause except S04 -> S05 ('years | before', a match-cut carried by the push into the lock). S08 is the one long scene (9.8 s: one continuous crane + vista); S04, S06, S07 are short (2.1-2.4 s, reference 2's median shot is 2.2 s). Once the voice is recorded the music's tempo map is re-fitted to these cuts (`scripts/qa/beatsync.py --fit-tempo`).

## The loop

**Device: the rewind** (w172-0.05 'before' to the end). The last line, 'And some of those governments did it before there was even a fix', plays on the plaza as the shutdown left it. On 'before' the sun shows a clock face whose hands spin BACKWARDS (the rhyme of S07's forward-spinning 'not ready yet' clock), and the whole plaza rewinds: padlocks and tags pop off, the shutters roll back up in reverse order, each building pops one step lighter, the lantern relights, the far civic windows come back on in a reverse wave, Bit walks backwards along the cornice, Pip does his S01 startle hop backwards, and the camera eases back out to rest. On 'fix.' the clock face pops off (the bold power glyph is back) and the sun sinks to its frame-0 mid-rise point.

**The seam.** The last frame IS frame 0: camera at rest arriving at zero velocity (S01's push is a sine that starts from rest), every shutter up, every screen lit, the sun at PLAZA_REST.sunFrame0 (720,950) in an anticipation squash that frame 0 releases into its rise, the far civic switch-off wave already restarting at the far left (2-3 windows), Pip sit-back on his bollard, Bit on govA's cornice, and caption page 1 rolling in (it starts at w177+0.52 'fix', 0.15 s after 'fix.' ends, and is still 24 px low at the seam; frame 0 settles it by 0.25 s). The rewind -> play turn is the story beat: on the replay, 'Governments all over Europe just shut down...' is literally the morning before the fix. Audio: the reversed whoosh / ticker and the music bed wrap across the seam; the voice gap is 0.475 s, a sentence pause.

Why not the v1 un-build to line art: final_script.md section 6 gives the loop job to the cut back to the plaza and asks for an end frame with the shutters up and the sun mid-rise, and the BRIEF asks for a first frame that tells the story on silent autoplay. A full-colour frame 0 does that; a line-art frame 0 does not. Declined on purpose: the optional label 'most sites were back within hours to a day' (during the rewind the shutters going up mean 'earlier', not 'back online'), and showing the Makers' Lane workshop from the plaza (it would be a few px in the far city; 'no fix yet' is carried by the 'still fixing...' blind in S06 / S07 and by the rewind itself).

## Engagement layer

- **First frame.** Frame 0 is full colour (no line-art frame): government buildings whose windows are browser windows, all lit; a big orange sun carrying a bold power-button glyph; the far civic skyline already switching off at the left. On silent autoplay it reads 'government websites + a power button + lights going out' before a word is heard.
- **Cover frame:** w13 'on' (3.47 s): 'on': three buildings shuttered and dark, govD lit, padlocks popping, the sun just pressed (platform cover).
- **Open loop:** 'on purpose' (S01) is answered by the FBI advice (S11) and the rewind (S12).
- **Bait:** 'the language everyone loves' gets the dry sticker gag only; no mocking visual.
- **Quotable:** 'forty-five minutes' gets the one-sweep wedge and a stamp on the board.

**Rewatch game: find Bit in every scene.**

| scene | where Bit is | the game |
|---|---|---|
| S01 | govA's cornice (PLAZA.bit), size 22, idle antenna wiggle | frame 0 and the last frame of the film: he is the first thing a rewatcher can find |
| S02 | in the lock slot, drawn in the same ink as the blueprint: camouflaged as a detail of the lock drawing until 'bug', when he peeks out (he ducks again on 'over') | hidden in the drawing for the first 0.7 s; the eye finds him only when he moves |
| S03 | on top of the pen-nib sign of the press house, swinging with it | small, in plain sight, moves only when the sign swings |
| S04 | sitting on lock4 in plain sight for fourteen years | nobody looks at the door: the ghosts walk past him |
| S05 | on the blueprint lock detail, posing as part of the drawing | he is drawn in the same ink as the plan: easy to miss until the "!" |
| S06 | on the messenger's shoulder, then on the mail-slot sill | he hitches a ride with the heads-up |
| S07 | riding a wire copy over the rooftops (and doodled on the leaked page) | two Bits in one shot: the drawing and the real one |
| S08 | sitting on the counter board's top edge | he watches the number go up like the rest of us |
| S09 | Part A: rides the dropped old lock; Part B: rides the snail's shell on the stair | the slowest ride on the hill |
| S10 | caught in the old plaque's cobweb | the bug, stuck to the old version |
| S11 | on the sticky note's corner | he rides the shutter down with the note |
| S12 | govA's cornice (PLAZA.bit); he walks backwards to his frame-0 spot in the rewind | he is in the last frame exactly where he is in the first |

**Pause-worthy sign jokes (small, true to the story):**

| id | scene | text | when | why it is true |
|---|---|---|---|---|
| J1 | S01 | back soon | w14-0.05 'purpose' | the shutdown was planned: 'on purpose' |
| J2 | S03 | I [heart] PHP + a scribbled '?' | w35-0.05 'loves' | the bait line 'the language everyone loves', kept dry |
| J3 | S06 | still fixing... | w65-0.25 'They' | the fix is being made: the blind stays down until the fix exists (true to the story) |
| J3 | S07 | still fixing... | w72-0.06 'but' | callback from S06: 'before the fix was ready' |
| J5 | S11 | Turn it off ~~and on again~~ | w164+0.05 'everything' | the FBI's advice was only the first half of tech support's answer: off, until it can be fixed |

## On-screen labels (final_script.md section 6)

Style: CaptionHand (Patrick Hand) at 34-40 px on screen (fine print 28-32 px, only on the S08 board footer and the S10 sign); ink #2B1B0F on cream paper (palette cream), 2.2 px ink outline, fill misregistered 3 px (props rule), corners slightly soft, a pin dot / string / clip / tape as the attachment. Motion: in: pop with the 7% spring (0.2 s), hanging tags add the pendulum (-16 -> 0 deg, 0.5 s), stamps slam (ink ring 0.13 s, print 2.6x -> 1.0x in 0.27 s, motion spec #15), cards can paper-flip to new text (0.2 s, swap at edge-on). out: 1-frame shrink pop or carried off by the camera / the next cut. Never a fade. Placement: screen x 90-930, y 600-1480 (under the caption band, above the bottom UI, left of the right rail); never over the focal event of the word they sit on. Hold: on screen >= 1.5 s (the S08 header holds >= 1.5 s alone before any counter appears); longer labels get more (>= 0.25 s per word is the target). Labels are in-world objects, never captions, and never in the caption band.

| id | text (lines) | scene | in -> out | on | est. hold |
|---|---|---|---|---|---|
| L1 | PHP2Shell · two linked flaws | S02 | w18 'bug' -> w29-0.08 'It's' | blueprint (annotation tag, leader forks to the two flaws) (40 px) | 3.3 s |
| L2 | no password · / control of the site and its data | S02 | w25 'site' -> w29-0.08 'It's' | blueprint (annotation tag, leader to the site icon) (40 px) | 1.6 s |
| L3 | PHP · the code most / websites are built with | S03 | w31+0.10 'PHP' -> w38-0.10 'seven' | titleCard (38 px) | 2.8 s |
| L4 | of sites whose server / language is known · W3Techs | S03 | w38-0.10 'seven' -> w46-0.15 'This' | titleCard (paper flip from L3) (36 px) | 2.4 s |
| L5 | in the code since / at least 2012 | S04 | w48 'was' -> w56+0.35 'researchers' | lock4 (tag on a string, Lock rider); carried across the match-cut onto the blueprint lock as an annotation (40 px) | 2.0 s |
| L6 | found with AI help · / reported privately in August | S05 | w57 'using' -> w65-0.25 'They' | banner top margin (clipped slip) (38 px) | 2.3 s |
| L7 | word leaked Oct 20 · / fix out Oct 21 | S07 | w73-0.05 'word' -> w81-0.10 'and' | board's bottom rail (pinned tag) (40 px) | 2.1 s |
| L8 | Cloudflare · sits in front / of about 1 in 5 websites | S08 | w89 'Cloudflare' -> w112-0.40 'But' | counterBoard header (38 px) | 7.3 s |
| L9a | counted from the / public announcement | S08 | w95-0.08 'announced' -> w112-0.40 'But' | counterBoard start flag (the counter's left end) (30 px) | 5.7 s |
| L9b | Matthew Prince, Cloudflare CEO, on X / Cloudflare's own count | S08 | w95-0.08 'announced' -> w112-0.40 'But' | counterBoard footer fine print (28 px) | 5.7 s |
| L9c | attempts, not break-ins | S08 | w95-0.08 'announced' -> w112-0.40 'But' | counterBoard: the counter's unit line, right under the ticker (28 px) | 5.7 s |
| L10 | first 45 min: tens of thousands | S08 | w106-0.08 'minutes' -> w112-0.40 'But' | counterBoard stamp slot 1 (34 px) | 2.3 s |
| L11 | millions · within a day | S08 | w108-0.10 'millions' -> w112-0.40 'But' | counterBoard stamp slot 2 (34 px) | 1.5 s |
| L12 | Updating WordPress / won't fix it | S09 | w125-0.15 'every' -> w128-0.10 'Plus' | near-left street-sign post (screen space) (40 px) | 1.7 s |
| L13 | Rough estimate from W3Techs data / only sites that show their version / some hosts patch old / versions themselves | S10 | w131+0.10 'half' -> w144-0.30 'Even' | noticeSign (A-frame on the left pavement) (32 px) | 4.8 s |
| L14 | FBI · NSA / UK NCSC · CERT-EU | S11 | w146-0.10 'FBI' -> w165-0.12 'And' | advisory notice pinned on govB's facade above the shutter box (40 px) | 6.2 s |

The long Cloudflare credit (final_script L9) is split in-world with every word kept: 'counted from the public announcement' sits by the counter's start flag (it is what the flag means), 'attempts, not break-ins' is the counter's unit line, and 'Matthew Prince, Cloudflare CEO, on X · Cloudflare's own count' is the board's footer. The L8 header holds alone 1.6 s (on the estimate) before any count appears.

## Transitions

| scene | in | window | match object |
|---|---|---|---|
| S01 | loop-start | w0-0.12 'Governments' -> w0-0.12 'Governments' | - |
| S02 | push-through | w14+0.35 'purpose' -> w15+0.31 'because' | lock |
| S03 | cut | w29-0.08 'It's' -> w29-0.08 'It's' | - |
| S04 | matchcut | w46-0.15 'This' -> w46-0.15 'This' | - |
| S05 | matchcut | w54-0.15 'years' -> w55 'before' | lock4 |
| S06 | cut | w65-0.25 'They' -> w65-0.25 'They' | - |
| S07 | foreground-wipe | w72-0.25 'but' -> w72+0.17 'but' | - |
| S08 | camera-continuous | w80+0.20 'ready' -> w88+0.15 'it' | wires |
| S09 | matchcut | w112-0.40 'But' -> w112-0.40 'But' | sun set point = VP |
| S10 | foreground-wipe | w128-0.30 'Plus' -> w128+0.10 'Plus' | - |
| S11 | push-through | w143+0.45 'anymore' -> w144+0.10 'Even' | browser title bar (siteM -> govB) |
| S12 | cut | w165-0.12 'And' -> w165-0.12 'And' | - |

Inside scenes: the S09 hidden match-cut on door #4 (lock, door, window and cornice line at zoom 6). Variety: dive, hard cut, sun hop, lock match, cut on action, lens wipe, camera-continuous crane, sunset / sunrise match, tram wipe, push-through, hard cut, rewind. No fades, no flips.

## Camera budget

- **Big moves (2):** the S08 crane (1.3 -> 1.0, out(quart), entering at S07's exit speed) and the S09 pull-back (zoom 6 -> 1 in 2.1 s on the approved v1 curve; rows pop in as the caption floor passes them, so the far rows enter static).
- **Exempt:** the dives S01 -> S02, S04 -> S05, S10 -> S11 (<= 0.4 s, they read as cuts and keep moving IN after the cut) and the S09 approach push that sets up the hidden match.
- **Everything else:** one gentle 3-6% push per shot, then locked. No segment starts linear from rest; push-throughs keep moving in while decelerating; the S12 pull-back is the rewind of its own push.
- **Sky ceiling:** at every camera key only flat sky sits above screen y 560 inside x 90-990 (linted with each scene's `ceiling` items and `sunKeys`). New framings: S02 lands the cornice at screen 695-748, S04 at 570, S11's lean stops at 1.71 so govB's lantern stays at >= 563.

## Scenes in detail

Beats are motion STARTS (small elements lead the word by ~0.10 s, big builds by 0.15-0.25 s; marks, presses and sun touch-downs sit ON the word). `span` in the JSON = how long a beat's staggered events run. Element positions are the shared kit's anchors (SHARED_SETS.md / SHARED_PROPS.md); numbers in brackets are their current values.

### S01 Government Plaza powers down (w0-0.12 'Governments' -> w15-0.04 'because'; est 0.00-4.30)

*VO:* "Governments all over Europe just shut down a bunch of their own websites on purpose,"  
*ToD:* day. *In:* loop-start. *Reuses:* S01 (v1). *Sets:* GovernmentPlaza (state built; PLAZA anchors).

STORY PEAK 1/3 (the hook, Arcane scale). Government Plaza in Webtown, where every building is a website (its main window is a browser window). Monumental civic buildings at the far edge of a wide plaza, the outer ones cropped by the frame edges; through the gap between them the far city, now a CIVIC skyline of domes, pediments and clock spires in haze tiers that runs to the horizon: 'governments all over Europe'. The huge low sun sits in the gap. No count anywhere (the 'four' pennants are gone): only SOME buildings go dark ('a bunch of'), one only half.

**Frame.** World = canvas px at camera rest; use the GovernmentPlaza anchors (PLAZA.*; values in brackets are the current set values and may move with the sets lane's PEAK-1 rescale). Sun slot PLAZA.sun (720,900) r155, frame-0 mid-rise (720,950); Pip on PLAZA.bollard (812,1426); Bit PLAZA.bit (262,742) size 22. govA (left, cropped) and govB (Domed Capitol, the hero) left of the gap, govC (clock tower, behind) and govD (Modern Ministry, nearer, cropped right) right of it. The gap's far city carries farCivic (sets request): 6-8 fill-only civic silhouettes in two haze tiers (#98C0AE / #84B09C) with >= 3 px cream window dots that switch off in a wave. SKY CEILING: nothing but sky above world y 600 inside x 90-990. Every padlock / tag at x <= 930. Bottom band = onlookers (framing only). Orange = the sun only.

**Beats.**

- `w0-0.12 'Governments'` (0.00): Frame 0 = the loop seam (see transitionIn). The sun releases its anticipation squash and rises (720,950)->(720,900), ease-out 0.40 s, then a +6% pulse; the camera's sine push starts from rest; caption page 1 finishes its last 24 px; the farCivic switch-off wave is already moving at the far left.
- `w0-0.03 'Governments'` (0.10): 'Governments': the near browser screens reload, a top-down page wipe (header bar + hairlines re-pop, 0.2 s) on govB, govA, govC, govD 0.06 s apart: these are websites. No 2-frame blinks (framecheck flash rule).
- `w1-0.10 'all'` (0.51): 'all over': the farCivic window dots switch off left to right across the far civic skyline (1-frame pops, ~30 dots, through 'Europe'): governments all over Europe going dark. Two readable citizens walk (life).
- `w2-0.05 'over'` (0.78): 'over': three pigeons land on the lamp crossbar (0.06 s stagger).
- `w3 'Europe'` (1.18): 'Europe': two far domes' lanterns pop off; Pip's ear flicks and he looks at govB (look 0.3).
- `w4 'just'` (1.53): 'just': the bold glyph glints (two ink ticks) and the sun pulses +6%.
- `w5 'shut'` (1.64): 'shut': the sun is PRESSED like a power button (SunPress: squash 0.88 in 0.08 s, release 0.2 s, ripple ring r155->195). The press comes first, so the switch-off reads as deliberate.
- `w6-0.05 'down'` (1.80): 'down': govB's shutter SLAMS (0.16 s ease-in + 6 px bounce); govB steps one palette step darker as it lands.
- `w7+0.04 'a'` (2.10): 'a bunch': govA's shutter slams; govA steps darker.
- `w8+0.15 'bunch'` (2.30): 'bunch': govC's shutter drops only HALF way and stops with a 1-frame jolt (partly unavailable); its clock face stays white.
- `w10 'their'` (2.46): 'their': the lamp lantern switches off (cream->sand); the pigeons scatter (2.52).
- `w11 'own'` (2.68): 'own': GAG: Pip startles, a quick trunk-up hop on the bollard (expression wide, 0.32 s).
- `w12-0.05 'websites'` (2.84): 'websites': two citizens raise phones toward the dark buildings; govD stays lit (some, not all); Pip lands from the hop.
- `w12+0.28 'websites'` (3.17): govB's dome lantern light pops off (cream -> sand); a pigeon circles back to the lamp.
- `w13-0.10 'on'` (3.37): 'on': padlocks pop onto the three closed shutters (0.06 s apart), each with a click.
- `w14-0.05 'purpose'` (3.56): 'PURPOSE': 'back soon' tags swing onto the three closed shutters (pendulum -16->0 deg, 0.5 s, 0.05 s stagger): a planned closure, not a break-in (sign joke 1: the tags read 'back soon'). The sun gives a confident +6% pulse on the word.
- `w14+0.35 'purpose'` (3.96): Comma pause: a small ink ring pops around govB's lock box (the bug is in there) and the camera dives into it (in(cubic), 0.30 s); Pip hops toward the lens (he lands on the blueprint rod in S02).

**Sky keys.** w0-0.12 'Governments' day. Captions: ink throughout.  
**Sun.** Peak size r155 in the gap (PLAZA.sun). Carries the BOLD power glyph from frame 0, so the first frame already asks 'what does this button do?'. Rises into its slot, glints and pulses on 'just', is PRESSED on 'shut' (the cause), pulses on 'purpose' (the intent). Glides toward its S02 peek during the dive.  
**Pip.** Pip, sit-back on PLAZA.bollard, scale 1.0 (vista). Watches govB (ear flick on 'Europe'). GAG: startled trunk-up hop on 'own'. Hops toward the lens on the dive and lands on the master blueprint's rod in S02. No look to camera.  
**Bit.** govA's cornice (PLAZA.bit), size 22, idle antenna wiggle.
**Captions** (highlight in brackets): Governments all over / Europe just shut down [shut down] | a bunch of their own / websites on purpose, [purpose,]  
**Sound.** click_light w0-0.03 'Governments'; typing_tick w1-0.10 'all'; click_light w4 'just'; switch_toggle w5 'shut'; pop_low w6-0.05 'down'; pop_low w7+0.04 'a'; pop_low w8+0.15 'bunch'; power_off_thunk w10 'their'; lock_click w13-0.10 'on'; pop_mid w14-0.05 'purpose'; whoosh_soft w14+0.35 'purpose'.
**Life (estimate):** 51 events in 4.30 s = 11.9/s.

### S02 The takeover diagram (w15-0.04 'because' -> w29-0.08 'It's'; est 4.30-8.25)

*VO:* "because of this bug where hackers could take over a site without a password."  
*ToD:* day. *In:* push-through. *Reuses:* new: final_script.md section 6 'new small inset: takeover diagram'; S05 (v1) master blueprint, framed tight. *Sets:* BlueprintWall (draw variant: the plan draws outward from the lock).

The 'inset': no new world, just a close look at the PHP master blueprint (the plan every PHP building is built from; it hangs from the civic facade we meet properly in S05). Framed tight, the sheet fills the frame like a diagram, with a strip of day sky and the sun peeking over the cornice above it. On the sheet: the lock detail with its flaw, and a tiny schematic 'site' it guards.

**Frame.** BlueprintWall world. Lands at camera (470.6,794.8) zoom 1.15 and keeps pushing to (472.6,813.8) zoom 1.30: the lock detail BLUEPRINT_WALL.lock (488,960) stays at screen (560,1150), 78 x 98 px; the cornice (world 610) lands at screen 695-748, so the caption band is plain sky; the sheet (BLUEPRINT_WALL.sheet 200,680,576,620) fills screen x 186-935, y ~790-1600. Pip on the rod perch (700,680) -> screen (836,786). Diagram overlay (scene-owned, ink on the sheet): siteIcon world (640-760, 1090-1210) -> screen (759-915, 1072-1228); dashed connector lock -> icon; the hand enters from the right edge. Labels: L1 upper-left of the sheet (world 215-540, 700-745 -> screen 206-628, 820-879); L2 lower-left (world 215-600, 1215-1300 -> screen 206-706, 1336-1447). Sun screen-space (870,740) r110, lower part behind the facade.

**Beats.**

- `w15-0.04 'because'` (4.30): Cut (push-through lands): the blueprint lock detail where govB's lock box was; the camera keeps moving in (1.15->1.30). The sheet's linework draws outward from the lock (BlueprintWall draw, 4.30-4.90).
- `w15+0.15 'because'` (4.49): 'because': Pip lands on the rod with a squash (from his S01 hop).
- `w16 'of'` (4.69): 'of': the lock's cover swings open on its hinge (diagram dashes): the bolt in section.
- `w17 'this'` (4.78): 'this': bolt test: the bolt shoots out and STOPS SHORT of the strike, knocks back (Lock boltTestAt).
- `w18 'bug'` (5.00): 'bug': gap bracket + ring draw on (gapMarkAt) and Bit peeks out of the slot, antennae up; label L1 'PHP2Shell · two linked flaws' pops with its forked leader to two linked rings (bolt gap + keyhole).
- `w19 'where'` (5.22): 'where': the site icon draws on at the sheet's right and the dashed connector runs from the lock to it.
- `w20-0.10 'hackers'` (5.33): 'hackers': the dashed diagram hand slides in from the right edge toward the lock (0.35 s, out(cubic)) and settles its fingers on the thumb-turn.
- `w21 'could'` (5.79): 'could': Bit's antennae flatten; the connector's dashes march one step toward the icon.
- `w22 'take'` (5.95): 'take': the hand pinches the thumb-turn and turns it 90 deg (0.2 s): the bolt retracts all the way, no key.
- `w23 'over'` (6.17): 'over': a dashed arrow runs along the connector; the site icon's window fills with ink hatching and a tiny ink flag pops on its roof: taken over. Bit ducks into the slot.
- `w25 'site'` (6.61): 'site': the icon's padlock dot pops open; label L2 'no password · control of the site and its data' pops (lower-left, leader to the icon).
- `w26 'without'` (6.92): 'without': a key glyph draws beside the lock, then an ink cross through it.
- `w28+0.10 'password'` (7.46): 'password': GAG: Pip folds his ears over his eyes (ears-cover), 0.3 s after the cross.
- `w28+0.32 'password'` (7.68): Sentence pause: the hand slides back out of frame (its job shown); Bit pops back up in the slot.
- `w29-0.25 'It's'` (8.08): Pip lifts his ears and hops off the rod toward the lens (crosses the hard cut).

**Sky keys.** w15-0.04 'because' day. Captions: ink throughout.  
**Sun.** Screen-space peek over the cornice at (870,740) r110 (lower part behind the facade). It glides in during the dive and lands on 'because'; a +4% pulse on 'without'.  
**Pip.** Scale 1.2 on the rod. Lands on 'because'. GAG: ears-cover on 'password' (worried, the stakes). Hops out at the end toward S03.  
**Bit.** in the lock slot, drawn in the same ink as the blueprint: camouflaged as a detail of the lock drawing until 'bug', when he peeks out (he ducks again on 'over').
**Labels.** L1 'PHP2Shell · two linked flaws' on w18 'bug'; L2 'no password · control of the site and its data' on w25 'site'.
**Captions** (highlight in brackets): because of this bug / where hackers could [bug] | take over a site / without a password. [without a password.]  
**Sound.** pencil_scratch_medium w15-0.04 'because'; card_flip w16 'of'; click_light w17 'this'; pencil_scratch_short w18 'bug'; pop_high w18+0.05 'bug'; whoosh_soft w20-0.10 'hackers'; lock_click w22 'take'; pencil_scratch_short w23 'over'; pencil_scratch_short w26 'without'; whoosh_soft w28+0.32 'password'.
**Life (estimate):** 30 events in 3.95 s = 7.6/s.

### S03 Built from one blueprint (w29-0.08 'It's' -> w46-0.15 'This'; est 8.25-13.97)

*VO:* "It's in PHP, the language everyone loves, and about seven out of ten websites run on it."  
*ToD:* day. *In:* cut. *Reuses:* S02 (v1), wide part only. *Sets:* BlueprintStreet (wide).

Blueprint Street: a sunny street whose ground is a giant cream blueprint sheet with an ink perspective grid. The WordPress press house terminates the vista; on 'the language' nine more buildings pop up out of the plan like a pop-up book. PHP = the elephant-stamped blueprint all these buildings are built from. No WordPress cue (dropped).

**Frame.** BLUEPRINT anchors at rest: press house 360-760 (apex (560,770), eaves 870, base 1180), VP (560,950), side buildings L1-L5 / R1-R4, stamp (330,1400), Pip BLUEPRINT.pip (350,1420). Sun r110 screen-space at (690,700), right of the apex. The plan's TITLE-BLOCK CARD sits at the bottom-right corner of the plan (sets request: move it from bottom-left; the stamp and Pip own the left): world x 490-930, y 1320-1450, it carries labels L3 then L4. Sticker 'I [heart] PHP' (~70 px wide, the heart drawn, the font has no heart glyph) on the press-house door frame at (640,1060). Near layer: the two BLUEPRINT.walkers.

**Beats.**

- `w29-0.08 'It's'` (8.25): HARD CUT: the wide street at rest, the floor a bare blueprint with ten footprints; the camera starts its 4% breath.
- `w29 'It's'` (8.33): 'It's': grid lines draw on from the press house toward the viewer (8.33-8.70); the sun lands in its wide slot right of the apex.
- `w30 'in'` (8.52): 'in': Pip lands on the blueprint at BLUEPRINT.pip with a squash.
- `w31-0.13 'PHP'` (8.57): 'PHP': the elephant stamp SLAMS onto the plan right under Pip (ring 0.13 s, print 2.6x->1.0x in 0.27 s); Pip bounces on it (8.75-9.00).
- `w31+0.10 'PHP'` (8.80): Label L3 'PHP · the code most websites are built with' pops on the title-block card (bottom-right of the plan).
- `w31+0.50 'PHP'` (9.20): Ellipsis pause: the press house pops up first out of the plan (scaleY 0->1.06->1): the hero of the street.
- `w31+0.78 'PHP'` (9.48): Ellipsis beat: Pip settles on the stamp after his bounce; the sun gives a small +4% pulse.
- `w32-0.05 'the'` (9.72): 'the language': pop-up book: nine buildings pop up out of the plan near->far, alternating sides, 0.06 s apart (L1 R1 L2 R2 L3 R3 L4 R4 L5), each showing its small browser window.
- `w34-0.10 'everyone'` (10.17): 'everyone': six tiny walkers rise along the street (0.05 s stagger); the two big near walkers slide in from the frame edges.
- `w35-0.05 'loves'` (10.70): 'loves': SIGN JOKE 2: on the press-house door frame the little 'I [heart] PHP' sticker gets a hand-scribbled ink '?' (0.15 s); the two near walkers do a small synchronised head tilt + shoulder shrug (back view). The bait stays dry.
- `w35+0.30 'loves'` (11.05): Comma pause: the pen-nib sign swings (pendulum), Bit swinging on top of it; the roof vent puffs three paper sheets.
- `w37-0.10 'about'` (11.45): 'about': ten thin ink spokes draw across the sun (11.45-11.60): a 10-slice pie.
- `w38-0.10 'seven'` (11.58): Label: the title-block card paper-flips (0.2 s) to L4 'of sites whose server language is known · W3Techs' (the mandatory footnote, on 'seven out of ten').
- `w38 'seven'` (11.68): 'seven': elephant plaques tick on, counting: P (re-pulse), L1, R1, L2, R2, L4, R3, 0.08 s apart, all done before 'of'.
- `w41-0.10 'ten'` (12.19): 'ten': three blank cream plates pop on L3, L5, R4 (0.05 s apart); on 'ten' the matching 3 sun slices pop cream (the 7/10 pie) with a +6% pulse.
- `w42 'websites'` (12.50): 'websites': the seven PHP buildings' screens light up in a wave (cream glow pop, 0.02 s stagger): the count is about websites.
- `w42+0.30 'websites'` (12.80): The two near walkers turn their heads toward the press house; a far walker waves.
- `w43 'run'` (13.08): 'run': walkers bob; Pip glances down the street (look 0.7); the vent puffs again.
- `w45 'it'` (13.44): 'it.': the pie slices pop back to solid; the sun's anticipation squash (sx 1.07 / sy 0.91), then a long hop toward S04 (lands on 'bug').
- `w45+0.30 'it'` (13.74): Pip hops off the stamp toward the stoop (crosses the cut).

**Sky keys.** w29-0.08 'It's' day. Captions: ink throughout.  
**Sun.** Wide slot (690,700) r110, landing on 'It's'. Ten spokes on 'about', three cream slices on 'ten' (the 7/10 pie, the statistic shown in the sun), solid again on 'it.', then a long hop to S04.  
**Pip.** Scale 1.2. Lands on 'in'; the stamp slams under him on 'PHP' and he bounces (his gag). Watches the count; glances down the street on 'run'. Hops out after 'it.'.  
**Bit.** on top of the pen-nib sign of the press house, swinging with it.
**Labels.** L3 'PHP · the code most websites are built with' on w31+0.10 'PHP'; L4 'of sites whose server language is known · W3Techs' on w38-0.10 'seven'.
**Captions** (highlight in brackets): It's in PHP, / the language [PHP,] | everyone loves, and / about seven out of ten [seven out of ten] | websites run on it.  
**Sound.** whoosh_soft w29-0.08 'It's'; pencil_scratch_medium w29 'It's'; pop_low w31-0.13 'PHP'; paper_flip w31+0.10 'PHP'; paper_flip w32-0.05 'the'; pencil_scratch_short w35-0.05 'loves'; pop_mid w35+0.30 'loves'; card_flip w38-0.10 'seven'; pop_high w38 'seven'; pop_low w41-0.10 'ten'; whoosh_soft w45+0.16 'it'.
**Life (estimate):** 58 events in 5.73 s = 10.1/s.

### S04 Fourteen years in plain sight (w46-0.15 'This' -> w55 'before'; est 13.97-16.03)

*VO:* "This bug was in there for like fourteen years"  
*ToD:* day. *In:* matchcut. *Reuses:* S04 (v1): only the 14 year pages, seasons, ivy, ghosts, cobweb; S10 (v1) Part A framing (330,900) zoom 1.5. *Sets:* StoopStreet (day).

Stoop Street, close on door #4: the same PHP lock (lock4) with Bit sitting on it in plain sight, the tear-off calendar of YEAR pages beside the door, the near tree, ivy at the door frame. A locked-off time-lapse: everything changes except the lock.

**Frame.** StoopStreet world. Camera (330,900) zoom 1.5 (the v1 S10 Part A framing): the hero cornice (world 640) lands at screen 570, lock4 (330,1130) at screen (540,1305) 51 x 63, the calendar (385,1040,70,80) at screen (622-727, 1170-1290), 105 x 120 px: the year grids read. The near tree is cropped by the right edge; the sky right of the hero house (screen x > 825) holds the sun at (930,690) r110. Pip on step 2's tread (world (300,1230) -> screen (495,1455)), scale 1.2. Ghosts on the pavement to the right (screen x 600-900, y 1300-1470). The L5 tag hangs from lock4 on a short string (Lock rider), world ~(300-470, 1153-1207) -> screen ~(322-757, 1340-1420).

**Beats.**

- `w46-0.15 'This'` (13.97): MATCH (sun hop): door #4 at medium-close; Bit sits on the lock box in plain sight; the calendar shows a year page; the slow creep begins.
- `w46+0.05 'This'` (14.17): 'This': Pip lands on step 2's tread (from S03's hop) and yawns.
- `w47 'bug'` (14.34): 'bug': Bit does a small hop on the lock box (he is 'this bug'); the sun touches down in its slot.
- `w48 'was'` (14.56): 'was': label L5 'in the code since at least 2012' swings in as a tag hanging from lock4 (rider; pendulum -16->0).
- `w49 'in'` (14.78): 'in there': two ink-only ghost passers-by pop on the pavement, never looking at the door.
- `w50+0.05 'there'` (15.01): 'there': the time-lapse: the calendar tears 14 YEAR pages, 0.07 s apart (last ~0.9 s later), each flipping up and away; the near tree pops a season every 2 tears; ghosts pop in and out (~1 per tear); ivy creeps up the door frame; the sun pulses +4% on every 2nd tear.
- `w51+0.10 'for'` (15.23): Pip curls up asleep on the step (sleep pose, z's float).
- `w53-0.10 'fourteen'` (15.37): 'fourteen': a cobweb draws over the lock box corner (inkHair, 0.3 s); Bit does not move.
- `w54-0.15 'years'` (15.66): 'years': the camera pushes into lock4 (in(cubic), 0.37 s); a tan leaf lands on sleeping Pip's ear; the last tears go.

**Sky keys.** w46-0.15 'This' day. Captions: ink throughout.  
**Sun.** Screen-space (930,690) r110, touching down on 'bug' after the hop from S03; +4% pulse on every second tear (7 pulses); glides toward S05's notch during the push.  
**Pip.** Scale 1.2. Lands on 'This', sleeps through fourteen years (his gag: a leaf lands on his ear). Stays asleep into S05.  
**Bit.** sitting on lock4 in plain sight for fourteen years.
**Labels.** L5 'in the code since at least 2012' on w48 'was'.
**Captions** (highlight in brackets): This bug was in there / for like fourteen years [fourteen years]  
**Sound.** whoosh_soft w46-0.15 'This'; pop_mid w47 'bug'; paper_flip w48 'was'; counter_ticker w50+0.05 'there'; paper_flip w50+0.05 'there'; pencil_scratch_short w53-0.10 'fourteen'; whoosh_soft w54-0.15 'years'.
**Life (estimate):** 40 events in 2.05 s = 19.5/s.

### S05 Found with AI (w55 'before' -> w65-0.25 'They'; est 16.03-19.00)

*VO:* "before researchers using AI figured out how bad it was."  
*ToD:* day. *In:* matchcut. *Reuses:* S05 (v1). *Sets:* BlueprintWall (wide; the one gentle low angle).

The blueprint wall, the film's one gentle LOW ANGLE (seasoning, not a peak): the PHP master blueprint hangs as a tall banner from the cornice of a civic facade, seen from the investigators' waist height so the pilasters lean in 4-6 deg. Two research teams stand at the foot of a broad flight of steps, backs to us.

**Frame.** BLUEPRINT_WALL anchors at rest; camera lands at (540,960) zoom 1.08 and creeps to 1.12 (cornice world 610 -> screen 568). Banner BLUEPRINT_WALL.sheet with the lock detail at (488,960); stamp (720,1230); calendar (90,760,70,90); sun notch (930,725) r110; steps 1320-1480, teams' feet BLUEPRINT_WALL.feetY 1470 (team A x 120-420, team B x 600-940: inside the rail). Pip asleep on the rod perch (700,680). L6 is a cream slip clipped to the banner's top margin left of Pip: world (205-650, 688-760) -> screen ~(165-663, 656-737), 2 lines.

**Beats.**

- `w55 'before'` (16.03): Match-cut on the lock: the blueprint lock detail lands where lock4 was; the L5 tag carries over as a blueprint annotation; the camera creeps in (1.08->1.12). The steps are empty.
- `w55+0.10 'before'` (16.13): Pip, still asleep, drops in from the top of frame onto the rod (lands 16.35, z's, does not wake).
- `w56-0.05 'researchers'` (16.18): 'researchers': team A rises at the foot of the steps (0.10 s stagger, rise 0.33 s).
- `w56+0.30 'researchers'` (16.53): Team B rises (0.10 s stagger); the L5 annotation pops off (shrink 0.12 s).
- `w57 'using'` (16.72): 'using': label L6 'found with AI help · reported privately in August' pops as a slip clipped to the banner's top margin; the facade calendar tears to its summer page; the sun touches down in its notch (hop from S04) and three heat ticks pop above it.
- `w58-0.06 'AI'` (16.93): 'AI': one tablet per team is raised (0.07 s apart), each sparkle twinkling.
- `w58+0.25 'AI'` (17.24): The two scan beams shoot out from the tablets and sweep the banner from opposite sides.
- `w59 'figured'` (17.41): 'figured': both beams converge on the lock detail.
- `w60 'out'` (17.77): 'out': the ink target ring strokes on around the lock ON the word (0.17 s): found.
- `w62 'bad'` (18.11): 'bad': ONE focal event: the dashed hand from S02 redraws over the lock and turns it (callback: this is how bad it was) and Bit gets an ink '!'. Nothing else moves.
- `w63+0.05 'it'` (18.38): 'it': GAG: Pip jolts awake on the rod (trunk-up, expression wide), 0.27 s after the '!'.
- `w64+0.10 'was'` (18.54): 'was.': the messenger pulls an envelope from his coat and turns right; the dashed hand retracts.
- `w64+0.30 'was'` (18.74): He walks out of frame right and the camera trucks with him (in(sine)); Pip jumps off the rod to follow (18.80).

**Sky keys.** w55 'before' day. Captions: ink throughout.  
**Sun.** Screen-space notch (930,725) r110; the hop from S04 touches down on 'using' with heat ticks (high summer). No beat on 'bad' (one focal event).  
**Pip.** Scale 1.2. Falls in asleep (callback to S04). GAG: jolts awake on 'it', after the '!'. Follows the messenger across the cut on action.  
**Bit.** on the blueprint lock detail, posing as part of the drawing.
**Labels.** L6 'found with AI help · reported privately in August' on w57 'using'.
**Captions** (highlight in brackets): before researchers / using AI figured out [AI] | how bad it was. [bad]  
**Sound.** pencil_scratch_short w55 'before'; pop_low w55+0.25 'before'; pop_mid w56-0.05 'researchers'; pop_mid w56+0.30 'researchers'; paper_flip w57 'using'; bubble_pop w58-0.06 'AI'; whoosh_soft w58+0.25 'AI'; ding w60 'out'; pencil_scratch_medium w62 'bad'; alert_ping w63+0.05 'it'; whoosh_soft w64+0.30 'was'.
**Life (estimate):** 26 events in 2.97 s = 8.8/s.

### S06 A heads-up (w65-0.25 'They' -> w72-0.06 'but'; est 19.00-21.20)

*VO:* "They gave the PHP people a heads-up,"  
*ToD:* golden. *In:* cut. *Reuses:* S06 (v1). *Sets:* MakersLane + Workshop (WORKSHOP_LANE).

Makers' Lane at golden hour: a narrow lane toward a low golden sun. On the right the workshop of the people who make PHP (hanging elephant sign, mail slot, upstairs browser window: it is a website too). Its shop-window blind is DOWN: the fix is still being made (a little hand-lettered sign on the blind says so).

**Frame.** MAKERS_LANE + WORKSHOP_LANE anchors: VP (430,1040), sun (420,985) r120 at the lane end behind far-roof silhouettes, peach band 920-1040; workshop 600-1000 (roof 720), upstairs browser window (680,790,220,110), door (620,1150,100,300) with the mail slot (670,1300), elephant sign r45 (700,980), shop window (740,1060,200,240) with the blind DOWN to 1180 and the sign 'still fixing...' on it. Messenger (260 px) on MAKERS_LANE.messengerY 1520; Pip on MAKERS_LANE.pipY 1480. Sky ceiling: the workshop roof (720) and the left roofline stay under screen y 560 through the truck.

**Beats.**

- `w65-0.25 'They'` (19.00): CUT ON ACTION: the messenger enters left mid-stride, envelope in hand; the camera trucks right with him; golden light arrives with the cut. The workshop blind is down, its little sign reading 'still fixing...' (sign joke 3).
- `w65-0.15 'They'` (19.10): Pip lands behind the messenger and tiptoes (walk-side, rate 0.8).
- `w65 'They'` (19.25): 'They': the sun lands at the lane end with an in-place press squash (-10% y) and a small orange wax seal pops out of it along a dotted arc onto the envelope (0.33 s): a private letter.
- `w66 'gave'` (19.34): 'gave': Bit peeks out from the messenger's collar (rewatch spot).
- `w68-0.10 'PHP'` (19.56): 'PHP': the hanging elephant sign swings (pendulum -16->0, 0.5 s); the peach glow pops in the slit under the blind (the makers are in).
- `w67+0.15 'the'` (19.70): GAG: Pip stops and goes 'shh' (hold pose, trunk curled to his mouth), 0.3 s after the seal.
- `w68+0.28 'PHP'` (19.94): A neighbour's curtain is drawn (1-frame pop); the messenger reaches the workshop door.
- `w69-0.10 'people'` (20.15): 'people': the upstairs browser window's screen lights (the workshop is a website too).
- `w70 'a'` (20.50): 'a': the envelope slides through the mail slot (0.25 s), Bit hopping off onto the sill; the flap clicks.
- `w71 'heads-up'` (20.59): 'heads-up': three makers' heads pop UP into the upstairs window (back view, rise 0.2 s, 0.06 s stagger): a literal heads-up. The blind jolts once.
- `w71+0.32 'heads-up'` (20.91): The leak sheet flutters in at the LEFT frame edge from off-frame on a gust; Pip's ear twitches.
- `w72-0.25 'but'` (21.01): The gust lifts the sheet toward the lens: S07's lens wipe begins.

**Sky keys.** w65-0.25 'They' golden (wipe snap). Captions: ink throughout.  
**Sun.** Screen-space (420,985) r120 at the lane end: lands on 'They' with an in-place press squash and pops the seal (its one morph here).  
**Pip.** Scale 1.2. Tiptoes behind the messenger. GAG: 'shh' after the seal. Ear twitch at the sheet, then leaps after it into S07.  
**Bit.** on the messenger's shoulder, then on the mail-slot sill.
**Captions** (highlight in brackets): They gave the PHP / people a heads-up, [heads-up,]  
**Sound.** whoosh_soft w65-0.25 'They'; pop_mid w65 'They'; pop_mid w68-0.10 'PHP'; click_light w70+0.20 'a'; pop_high w71 'heads-up'; paper_flip w71+0.32 'heads-up'; fg_wipe w72-0.25 'but'.
**Life (estimate):** 22 events in 2.21 s = 10.0/s.

### S07 Word got out (w72-0.06 'but' -> w81-0.10 'and'; est 21.20-23.55)

*VO:* "but word got out before the fix was ready,"  
*ToD:* golden. *In:* foreground-wipe. *Reuses:* S07 (v1). *Sets:* NoticeboardCorner + TelephoneWires (WIRES.S07) + Workshop corner preset.

Town Square at golden hour: the public noticeboard on legs in front of a sunny public wall; its top rail is a browser address bar, so the board itself is online. Three telephone wires run from a pole on the workshop corner across the sky toward the city. The makers' workshop corner at the right edge, blind still down ('still fixing...').

**Frame.** NOTICE_CORNER anchors: wall (-140..780, top 840), board frame (140,930,600,430) + rail (220,900,440,30), legs to 1490; pole (1000, 620-700); wires WIRES.S07 (y 700 / 730 / 760 at x 540); sun (640,820) r110 half behind the wall top; Pip on the board top NOTICE_CORNER.pip (705,928); readers NOTICE_CORNER.readers at the frame sides. L7 tag pinned on the board's bottom rail: world (300-640, 1340-1430), 2 lines.

**Beats.**

- `w72-0.06 'but'` (21.20): Lens wipe: the sheet fills the frame white for 3 frames on 'but', then shrinks into the notice on the left pane; the scene is revealed as flat fills, linework draws on 21.35-21.80.
- `w73-0.05 'word'` (21.43): 'word': label L7 'word leaked Oct 20 · fix out Oct 21' pops as a tag pinned on the board's bottom rail; the pin dot pops on the notice; Pip lands on the board top.
- `w74-0.05 'got'` (21.64): 'got': the board's address-bar rail lights (cream pill + three dots pop): the board is online; two clones pop.
- `w75-0.10 'out'` (21.90): 'out': the clones double to 4, then 8 (0.16 s later); GAG: a copy slaps onto Pip's face on the word (he flips to sit-front; flyer overlay). The first two readers rise at the left side.
- `w76 'before'` (22.16): 'before': copies peg onto the wires and travel left across the sky over the rooftops (clear of the sun by +0.5 s), live Bit riding one; the pigeons hop; the sun hops up into view behind the wall top.
- `w77 'the'` (22.37): 'the': two more readers rise at the right side; four phones raise (0.05 s stagger).
- `w78-0.04 'fix'` (22.44): 'fix': the sun becomes a clock (cream ring + minute hand + hour hand pop, 0.15 s): the minute hand spins fast (2.5 turns) while the hour hand steps 3 ticks: hours pass and the fix is not ready. The workshop corner's blind stays down ('still fixing...'), its elephant sign swings.
- `w79 'was'` (22.79): 'was': Pip peels the flyer off (overlay removed) and shakes his head.
- `w80 'ready'` (23.00): 'ready': a reader's phone shows a tiny copy (pop); a pigeon flaps up.
- `w80+0.20 'ready'` (23.20): Comma pause: the clock face pops off the sun; the camera tilts up after the wire copies (start of S08's crane); Pip hops off the board.

**Sky keys.** w72-0.06 'but' golden. Captions: ink throughout.  
**Sun.** Screen-space (640,820) r110, half behind the wall top; hops in across the wipe and touches down on 'before'; becomes the hours clock on 'fix' (spinning hands: the fix is not ready yet; no numbers); rides down with the far layer during the tilt.  
**Pip.** Scale 1.2 on the board top (the reference cat's spot). GAG: a leaked copy slaps onto his face on 'out'; peels it off on 'was'. Hops off at the tilt.  
**Bit.** riding a wire copy over the rooftops (and doodled on the leaked page).
**Labels.** L7 'word leaked Oct 20 · fix out Oct 21' on w73-0.05 'word'.
**Captions** (highlight in brackets): but word got out before / the fix was ready, [word got out]  
**Sound.** fg_wipe w72-0.06 'but'; pop_mid w73-0.05 'word'; pop_low w73+0.05 'word'; click_light w74-0.05 'got'; paper_flip w75-0.10 'out'; pop_mid w75 'out'; whoosh_soft w76 'before'; counter_ticker w78-0.04 'fix'; whoosh_soft w80+0.20 'ready'.
**Life (estimate):** 29 events in 2.35 s = 12.3/s.

### S08 Counted from the announcement (w81-0.10 'and' -> w112-0.40 'But'; est 23.55-33.33)

*VO:* "and hackers were already trying to use it. Cloudflare says that once it was announced, they saw tens of thousands of hacking attempts in forty-five minutes, and millions within a day."  
*ToD:* golden->dusk. *In:* camera-continuous. *Reuses:* S08 (v1), re-staged: the dome covers about 1/5 of the city. *Sets:* DomeCity (re-scaled dome: sets request) + TelephoneWires (WIRES.S08, ending at a rooftop pole).

STORY PEAK 2/3 (Arcane scale; the film's only rooftop vista). Webtown from the rooftops at golden hour: an endless city of websites running to the horizon. First the doors: hooded figures already trying handles everywhere. Then, on 'Cloudflare', a colossal glass shield-dome draws itself over ONE far district, about 1 in 5 of the city (no logo, no cloud shape), a lattice watchtower silhouetted against the huge low sun at its foot. On our own parapet a rooftop counter board does the counting, from the announcement on. Then the flood, and the sun sets: 'within a day'.

**Frame.** DomeCity world at rest (after the crane): golden sky to the horizon y 1000 (DOME.horizon), peach band 880-1000; rows 0-3 full width + bleed. THE DOME, re-scaled (sets request: `dome` prop on DomeCity): one bold 4.8 arc from (180,1080) over the apex (390,830) to (600,1080), over a far district on rows 0-1; inside it the Glass step, cream rim strip, 2 glint bars, 4 meridians + 2 parallels; its screen area is ~1/5 of the visible city, everything else visibly uncovered. SUN r165 at DOME.sun (700,990), its left edge tucked behind the dome's right flank, clipped below row 0's base. WATCHTOWER moved to the dome's right foot (x 600-650, cabin top ~880), silhouetted against the sun, searchlight sweeping the glass. Near PARAPET (DOME.parapet) with chimney pots; Pip on the coping DOME.pip (500,1448); the observer is dropped for this scene. COUNTER BOARD (new prop) standing on the parapet: world x 470-930, y 1080-1440, teal frame, cream face, a small shield-dome emblem top-left; zones: header (L8, 2 lines, 38 px), start flag + note (L9a), the running counter, stamp slots (L10, L11), footer (L9b, L9c, 28-30 px). WIRES.S08 end at a rooftop pole at x 540 on our parapet (sets request) so the board face stays clear. Rattler doors: row-3 doors at x 100-460 (55-70 px figures) and row-2 doors across the width (30-40 px). SKY CEILING: dome apex 830, cabin 880 at rest; at the crane start the horizon sits at screen 622.

**Beats.**

- `w81-0.10 'and'` (23.55): The crane begins (out(quart)): the wall top drops away and we rise over our own parapet; the same three wires cross the frame at the same screen height, the S07 copies still pegged on them sliding left.
- `w81+0.10 'and'` (23.75): 'and': the endless city rises into view row by row as the crane lifts (rows 3 -> 0 pop as the caption floor passes them).
- `w83-0.10 'were'` (24.03): 'were': copies on the wires reach the city and flutter down into the streets (paper specks): word spreading.
- `w84-0.10 'already'` (24.15): 'ALREADY': four hooded attempters pop at row-3 doors on the left (55-70 px) and rattle handles (ink rattle marks): before any count, before the fix. Doors never open.
- `w84+0.25 'already'` (24.50): The crane passes the parapet coping: chimney pots slide by (parallax); rattle marks pop at two doors.
- `w85-0.10 'trying'` (24.69): 'trying': eight more pop at row-2 doors across the whole width (30-40 px), tapping and rattling; a pigeon flock lifts from our chimney.
- `w87-0.10 'use'` (25.02): 'use it': a scatter of ~40 attempter specks pops along far streets (AttemptStipple).
- `w88+0.15 'it'` (25.48): The crane settles at rest; Pip lands on the parapet coping; the last wire copy slides off.
- `w89-0.25 'Cloudflare'` (25.77): 'Cloudflare': the dome's bold arc draws from BOTH feet up over the far district and meets at the apex; the Glass step pops inside it (1-frame wave), then the rim strip and glint bars.
- `w89 'Cloudflare'` (26.02): The counter board rises on our parapet (rise 0.33 s) with label L8 as its header ('Cloudflare · sits in front of / about 1 in 5 websites') and the shield-dome emblem; it holds alone >= 1.5 s before any count.
- `w89+0.40 'Cloudflare'` (26.42): Glint bars sweep once across the new glass; two near rattlers rattle again (marks).
- `w90 'says'` (26.72): 'says': the watchtower rises at the dome's right foot, silhouetted against the sun; the guard pops into the cabin (+0.18 s).
- `w91 'that'` (26.93): 'that': the searchlight switches on (flat cream cone, fixed opacity) and sweeps over the glass.
- `w92 'once'` (27.15): 'once': the dashed footprint traces the dome's district along the far rooftops (out to the right foot): only this part is covered.
- `w95-0.08 'announced'` (27.61): 'announced': the counter STARTS: a small start flag pops at its left end with the note L9a 'counted from the public announcement'; the ticker begins to roll; the footer fine print L9b 'Matthew Prince, Cloudflare CEO, on X · Cloudflare's own count' and L9c 'attempts, not break-ins' pop.
- `w95+0.30 'announced'` (27.98): The ticker rolls its first clicks; the searchlight crosses the dome's crown.
- `w96 'they'` (28.30): 'they saw': the first tiny attempters appear at the dome's rim tapping the glass (ripple arcs); the first tally gate is drawn LARGE on the glass.
- `w98 'tens'` (28.67): 'tens': five more tally gates climb the glass (0.08 s apart); the ticker spins faster.
- `w100 'thousands'` (29.20): 'thousands': twenty more rim attempters + five more gates; the near rattlers keep rattling (uncounted: outside the dome).
- `w102 'hacking'` (29.76): 'hacking': the searchlight sweeps back, catching groups at the rim (seen; nothing is blocked, nobody gets in).
- `w103 'attempts'` (30.11): 'attempts': two near rattlers give up on a door and hop to the next.
- `w105-0.05 'forty-five'` (30.55): 'forty-five': the sun hops up 150 px out of the city and becomes a clock: 4 ink quarter ticks pop, then ONE minute hand sweeps a peach 3/4 wedge once (MinuteWedge, 0.6 s) and stops with a tick on 'minutes'.
- `w106-0.08 'minutes'` (31.01): 'minutes': STAMP 1 slams onto the board: L10 'first 45 min: tens of thousands' (ink ring 0.13 s, print 2.6x -> 1.0x in 0.27 s).
- `w106+0.35 'minutes'` (31.44): Comma pause: the clock overlay pops off the sun; the attempters keep tapping (idle).
- `w108-0.15 'millions'` (31.74): 'millions': BURST: the attempters multiply into a dense stipple crowd (hundreds, 1-frame burst) across the WHOLE city, inside and outside the dome; the glass tallies overflow up the dome; the sun sinks back toward the horizon.
- `w108-0.10 'millions'` (31.79): STAMP 2 slams onto the board: L11 'millions · within a day'.
- `w108+0.30 'millions'` (32.19): GAG: Pip folds his ears over his eyes (ears-cover), 0.3 s after the burst.
- `w109 'within'` (32.48): 'within': sunset step 1 on the word; the sky wipes golden -> sage dusk top-down (0.35 s); windows pop peach across the city from the horizon outward; captions stay ink.
- `w111 'day'` (32.92): 'day': sunset step 2 (gone behind the horizon row at screen x 700 by +0.23 s, exactly where S09's sunrise happens); the searchlight keeps sweeping.
- `w111+0.30 'day'` (33.22): Dusk idle: the stipple flickers, the board's counter keeps rolling (it never settles); Pip switches to sit-front (expression worried).

**Sky keys.** w81-0.10 'and' golden; w109+0.02 'within' dusk (wipe down, 0.35 s). Captions: ink throughout.  
**Sun.** From S07 it glides down and grows r110 -> r165 during the crane, resting beside the dome (700,990), clipped below row 0. On 'forty-five' it hops up 150 px so the whole clock face reads, sweeps the 3/4 wedge once, sinks back through 'millions' and sets in two steps on 'within' / 'day' at screen x 700: the film's one sunset.  
**Pip.** Scale 1.0 (vista). Lands on the parapet coping as the crane settles; watches the board. GAG: ears-cover 0.3 s after the 'millions' burst; sit-front worried in the dusk. Drops into S09.  
**Bit.** sitting on the counter board's top edge.
**Labels.** L8 'Cloudflare · sits in front of about 1 in 5 websites' on w89 'Cloudflare'; L9a 'counted from the public announcement' on w95-0.08 'announced'; L9b 'Matthew Prince, Cloudflare CEO, on X · Cloudflare's own count' on w95-0.08 'announced'; L9c 'attempts, not break-ins' on w95-0.08 'announced'; L10 'first 45 min: tens of thousands' on w106-0.08 'minutes'; L11 'millions · within a day' on w108-0.10 'millions'.
**Captions** (highlight in brackets): and hackers were / already trying to use it. [already] | Cloudflare says that / once it was announced, [Cloudflare] | they saw / tens of thousands [tens of thousands] | of hacking attempts in / forty-five minutes, [forty-five minutes,] | and millions / within a day. [millions]  
**Sound.** whoosh_soft w81-0.10 'and'; handle_rattle w84-0.10 'already'; door_knock w85-0.10 'trying'; pencil_scratch_long w89-0.25 'Cloudflare'; pop_low w89 'Cloudflare'; pop_low w90 'says'; switch_toggle w91 'that'; click_light w95-0.08 'announced'; counter_ticker w95 'announced'; pencil_scratch_short w98 'tens'; counter_ticker w105-0.05 'forty-five'; pop_low w106-0.08 'minutes'; handle_rattle w108-0.15 'millions'; crowd_murmur w108-0.15 'millions'; pop_low w108-0.10 'millions'; whoosh_soft w109 'within'; low_swell w109 'within'.
**Life (estimate):** 78 events in 9.78 s = 8.0/s.

### S09 Every single server (w112-0.40 'But' -> w128-0.10 'Plus'; est 33.33-38.55)

*VO:* "But even with the fix out, somebody still has to install it on every single server."  
*ToD:* dusk->dawn->day. *In:* matchcut. *Reuses:* S09 (v1) sunrise at the set point (the night beat is cut); S10 (v1) Part A install + hidden match-cut + Part B pull-back. *Sets:* StoopStreet (dusk sky -> dawn -> day); TerraceHill (hill mode) + TerraceRings not used.

STORY PEAK 3/3 (Arcane scale). Part A: Stoop Street at dawn, the fix arrives (the makers' cart drops a crate of new locks) and one keeper installs ONE new lock on door #4. Part B: a hidden match-cut on that door, then the camera pulls back and we stand in a street looking UP a whole hillside of identical PHP houses climbing in terraces to the ridge: every door the same old lock, only one fixed, and a sage wrench tag over every door where the fix still has to go.

**Frame.** Part A = StoopStreet: camera (560,1020) zoom 1.0 at the cut (hero cornice world 640 -> screen 600), then the approach push to (330,900) zoom 1.5 (cornice at 570, lock4 at screen (540,1305) 51 x 63). Crate at the stoop foot (440,1380); keeper beside the stoop (x 430-560, feet ~1450, h 300); Pip on step 2's tread (300,1230), scale 1.2. Part B = TerraceHill hill mode: hidden match at TERRACE.matchCam (540,1407) zoom 6 (house #4's lock 8.5 x 10.5 -> 51 x 63 at screen (540,1305); cornice line at screen 570), pull-back to rest (540,960,1.0): rows climb to the ridge ~700, ~650 doors before the haze bands; rows pop as the caption floor (screen y 570) passes their tops. Near layer in SCREEN space: Pip's bollard at (780,1460) and a street-sign post at the near-left kerb carrying the L12 tag (screen x 120-580, y 1370-1440). Fixed door: TERRACE.fixedGlow + TERRACE.flag. Sun hidden behind the ridge, cresting at TERRACE.sun (700,720) r150.

**Beats.**

- `w112-0.40 'But'` (33.33): MATCH-CUT on the set point: Stoop Street under the last of the dusk (lamp glows on), the VP exactly where the sun just set.
- `w112-0.25 'But'` (33.48): The dawn wipes in BOTTOM-UP in bright cream with a peach band (0.35 s); the lamp glows pop off.
- `w112 'But'` (33.73): 'But': the sun RISES at the VP (the film's one sunrise, at the point it set): the next day.
- `w113 'even'` (33.94): 'even': the makers' cart rolls in from the left along the pavement toward the stoop (maker pushing).
- `w114 'with'` (34.29): 'with': the lamp-post pigeons wake and hop; a cream rim strip pops on the hero facade (first light).
- `w116 'fix'` (34.62): 'fix': the cart drops a crate of new locks (sage boxes, cream check tags) at the stoop's foot with a tick: the fix is out.
- `w117 'out'` (34.93): 'out': the maker pushes on and the cart rolls away toward the VP (makers ship, they don't install).
- `w118-0.10 'somebody'` (35.28): 'somebody': the keeper rises in beside the stoop (rise 0.33 s); door #4's old lock drops off with a clunk (+0.12 s), Bit riding it down, hopping off and scurrying up the door frame.
- `w118+0.25 'somebody'` (35.63): Pip lifts a new lock from the crate with his trunk (hold pose, prop NewLockIcon).
- `w119 'still'` (35.87): 'STILL': GAG: Pip hands the lock to the keeper on the word; the new lock pops onto door #4 (+0.06 s, overshoot).
- `w120-0.08 'has'` (36.02): Its check strokes on (0.17 s): ONE door fixed.
- `w120-0.05 'has'` (36.05): HIDDEN MATCH-CUT on door #4 into the hillside (lock, door, browser window and cornice line hold their screen position and size at zoom 6); the pull-back begins at once.
- `w121 'to'` (36.26): 'to install': row 0's neighbouring doors resolve, each with the same old lock and a plaque; the tiny keeper walks from door #4 to door #5 (one at a time).
- `w122 'install'` (36.38): Pip hops onto the screen-space bollard (constant size, scale 1.0).
- `w123 'it'` (36.76): 'it on': rows 1-3 pop up behind as the caption floor passes their tops (0.05 s stagger).
- `w125-0.15 'every'` (36.86): Label L12 'Updating WordPress won't fix it' pops on the near-left sign post (screen space).
- `w125-0.05 'every'` (36.96): 'every': sage wrench tags pop over EVERY door in a wave from row 0 toward the ridge: where the fix still has to go.
- `w126 'single'` (37.33): 'single': the upper terraces tile outward to the ridge, retaining walls and zig-zag stairs draw on; door #4's check flag pops up above the row-0 cornice (the ONE fixed door) with one ink ring pulse.
- `w127 'server'` (37.68): 'server': the sun crests the ridge on the word; the terraces extend at the frame's side edges (segments pop at x < 90 and x > 990).
- `w127+0.30 'server'` (37.98): The snail appears on the zig-zag stair beside the keeper's route, Bit riding its shell (rewatch spot); the tiny keeper reaches door #5 and kneels.
- `w127+0.45 'server'` (38.13): The pull-back lands; far-row window dots twinkle (texture).
- `w128-0.32 'Plus'` (38.33): Pip lets out a long sigh: a sit-back slump (squash pulse +0.08 -> 0), facing the hill; the tram's nose enters the foreground at the left.

**Sky keys.** w112-0.40 'But' dusk; w112-0.25 'But' dawn (wipe up, 0.35 s); w120-0.05 'has' day (wipe snap). Captions: ink throughout.  
**Sun.** Rises at the VP (700,1000) r110 on 'But' (the one sunrise, at the set point); hidden behind the hero facade during the approach push; behind the terraces in Part B; crests the ridge at TERRACE.sun (700,720) r150 on 'server'.  
**Pip.** Part A scale 1.2: lifts a new lock from the crate and hands it to the keeper on 'STILL' (GAG). Part B: hops onto a screen-space bollard, constant size 1.0; sighs at the hillside. Rides the tram into S10.  
**Bit.** Part A: rides the dropped old lock; Part B: rides the snail's shell on the stair.
**Labels.** L12 'Updating WordPress won't fix it' on w125-0.15 'every'.
**Captions** (highlight in brackets): But even with / the fix out, [fix out,] | somebody still has / to install it on [still] | every single server. [every single server.]  
**Sound.** whoosh_soft w112-0.40 'But'; light_shimmer w112-0.25 'But'; light_shimmer w112 'But'; pop_low w116 'fix'; pop_mid w118-0.10 'somebody'; lock_click w118+0.02 'somebody'; pop_mid w119+0.06 'still'; ding w120-0.08 'has'; whoosh_soft w120-0.05 'has'; pop_high w125-0.05 'every'; bubble_pop w126 'single'; light_shimmer w127 'server'.
**Life (estimate):** 44 events in 5.22 s = 8.4/s.

### S10 Half on versions too old (w128-0.10 'Plus' -> w144-0.30 'Even'; est 38.55-44.24)

*VO:* "Plus something like half of PHP sites run versions so old they're not officially supported anymore."  
*ToD:* day. *In:* foreground-wipe. *Reuses:* S12 (v1), re-staged: about half, rough-estimate label, the host patching. *Sets:* OldQuarter (day, door height).

The Old Quarter at day, seen from DOOR HEIGHT: a frontal row of three sites (two six-storey ones flanking a shorter one) and a side street showing a second row of nine and the city beyond. Something like half of these run an old PHP: only their elephant plaques age (the buildings are fine). The official 'supported' tags skip the old ones; a host's caretaker patches one anyway.

**Frame.** OLD_QUARTER anchors at rest: eye 1150, bases 1300, kerb 1500; siteL (30,690,315) current, siteM (360,820,280) OLD, siteR (740,700,310) current; the second row of nine (5 OLD, alternating) above siteM and in the gap (640-740); hanging plaques at (300 / 590 / 800, 1190); sun OLD_QUARTER.sun (500,690) r110 over siteM. Pip on OLD_QUARTER.bollard (700,1450). An A-frame notice sign (sets request: OldQuarter `noticeSign` slot; foreground 'railing' stays) on the left pavement, world (70-500, 1290-1478), carries L13. siteM's browser window (420,920,190,120) shows a progress bar that stalls (the S11 push-through target).

**Beats.**

- `w128-0.10 'Plus'` (38.55): Tram wipe (centre on 'Plus'): an empty street at door height; Pip rides the tram roof and hops off onto the bollard (+0.30 s).
- `w129-0.10 'something'` (38.76): 'something': siteL pops up from the ground (scaleY 0->1.06->1), then siteM (+0.10), siteR (+0.20).
- `w129 'something'` (38.86): The sun lands over siteM on the word (hop from S09).
- `w130 'like'` (39.21): 'like': the nine second-row buildings pop up behind (0.04 s stagger).
- `w131 'half'` (39.35): 'HALF': the sun draws one ink spoke and HALF its disc pops cream with an ink rim arc (a 1/2 pie, the rhyme of S03's 7/10) + a +6% pulse.
- `w131+0.10 'half'` (39.45): Label L13 rises on the A-frame notice sign on the left pavement (0.2 s rise).
- `w133-0.10 'PHP'` (39.58): 'PHP': hanging plaque signs swing out on every site (pendulum).
- `w134-0.30 'sites'` (39.98): The half pie settles (its spoke retracts); a second-row window lights.
- `w134 'sites'` (40.28): 'sites': a walker crosses the street gap; Pip looks up at siteM's plaque.
- `w135-0.05 'run'` (40.57): 'run versions': siteM's plaque paper-flips to the OLD version; five second-row plaques flip old (alternating, 0.04 s apart).
- `w137 'so'` (41.18): 'so': a cobweb draws across the old plaque's corner (Bit gets caught in it: rewatch spot); dust specks pop (+0.12 s).
- `w138 'old'` (41.32): 'old': the old elephant emblem leans on a tiny cane (cane pops, emblem tilts 12 deg).
- `w139 'they're'` (41.72): "they're": the old emblem's ear droops; a dust speck drifts down.
- `w140-0.05 'not'` (41.89): 'not': siteM's browser window starts an update: a progress bar that STALLS at ~10%, loading ring spinning (the S11 push-through target).
- `w141 'officially'` (42.15): 'officially': support tags pop: a sage check tag onto siteL's plaque (tick)... siteM gets nothing (skip)... siteR's plaque gets one (tick, +0.50 s); the current second-row plaques get tiny ones in a wave that skips the old.
- `w141+0.30 'officially'` (42.45): GAG: on the skip, Pip goes trunk-up 'hey!' at siteM's plaque (expression wide).
- `w142 'supported'` (42.91): 'supported': the old emblem's cane wobbles; the host's caretaker steps out of the street gap toward siteM.
- `w143 'anymore'` (43.40): 'anymore': the caretaker ties his own small sage tag onto siteM's door handle (some hosts patch old versions themselves); his keys jingle.
- `w143+0.45 'anymore'` (43.85): The camera dives into siteM's stalled browser window (push-through, in(expo), 0.4 s); Pip hops after it.

**Sky keys.** w128-0.10 'Plus' day. Captions: ink throughout.  
**Sun.** Screen-space (500,690) r110 over siteM, landing on 'something'. On 'HALF' it becomes a 1/2 pie (one spoke, one cream half with an ink rim arc) with a pulse; solid again as it hops toward S11.  
**Pip.** Scale 1.2 on the bollard. GAG: trunk-up 'hey!' when the support tag skips the old site. Hops after the dive into S11.  
**Bit.** caught in the old plaque's cobweb.
**Labels.** L13 'Rough estimate from W3Techs data · only sites that show their version · some hosts patch old versions themselves' on w131+0.10 'half'.
**Captions** (highlight in brackets): Plus something like / half of PHP sites [half] | run versions so old / they're not officially [so old] | supported anymore.  
**Sound.** fg_wipe w128-0.30 'Plus'; pop_mid w129-0.10 'something'; pop_high w130 'like'; pop_low w131 'half'; paper_flip w131+0.10 'half'; pop_mid w133-0.10 'PHP'; card_flip w135-0.05 'run'; pencil_scratch_short w137 'so'; pop_low w138 'old'; typing_tick w140-0.05 'not'; click_light w141 'officially'; alert_ping w141+0.30 'officially'; coin_chink w143 'anymore'; whoosh_soft w143+0.45 'anymore'.
**Life (estimate):** 45 events in 5.69 s = 7.9/s.

### S11 Just turn it off (w144-0.30 'Even' -> w165-0.12 'And'; est 44.24-51.07)

*VO:* "Even the FBI said if you can't update yet, just turn it off, which is basically tech support's answer to everything."  
*ToD:* day. *In:* push-through. *Reuses:* S11 (v1) close-up part. *Sets:* GovernmentPlaza closeup (PLAZA.closeup) with BrowserChrome progress + ring in the govB window slot.

Government Plaza seen close on the Domed Capitol's browser window: a progress bar that can't finish, and the official advice. Then the sun is pressed, the shutter comes down, and a little sticky note makes the tech-support joke quietly.

**Frame.** PLAZA.closeup: camera (518,826) zoom 1.6 -> 1.66 (govB's lantern at screen >= 603; the window fills screen x 374-707, y 1191-1425). Pip on the sill's left end (world (440,1122) -> screen ~(415,1434)), scale 1.2. L14 advisory notice pinned on govB's facade just above the shutter box, screen ~(380-700, 1050-1170), 2 lines. Sticky note (J5) on the shutter's lower right, screen ~(560-700, 1290-1400). Sun screen-space (870,700) r110 in the gap right of the dome.

**Beats.**

- `w144-0.30 'Even'` (44.24): The push-through lands on govB's browser window, still moving in (1.60->1.66): its address pill is the same stalled progress bar (8%), the loading ring spinning.
- `w144 'Even'` (44.54): 'Even': Pip lands on the sill's left end (from his hop).
- `w146-0.10 'FBI'` (44.90): 'FBI': label L14 'FBI · NSA / UK NCSC · CERT-EU' is pinned onto govB's facade above the shutter box (4 pins pop 0.04 s apart).
- `w146+0.25 'FBI'` (45.25): The loading ring keeps spinning; Pip's ear flicks toward the notice.
- `w147 'said'` (45.48): 'said': the notice's pins glint; Pip looks up at it.
- `w148 'if'` (45.70): 'if': the bar's fill edge flickers without moving forward.
- `w149 'you'` (45.79): 'you': the snail's shell appears at the sill's right edge.
- `w150 'can't'` (45.95): "can't": the progress bar steps 8% -> 9% and stalls; the ring keeps spinning.
- `w151 'update'` (46.24): 'update': the snail crawls onto the sill from the right (running gag: slow).
- `w152 'yet'` (46.65): 'yet': the bar twitches back 9% -> 8%; the ring hiccups.
- `w152+0.25 'yet'` (46.90): Pip glances from the bar up to the sun (look 0.7).
- `w153-0.10 'just'` (47.11): 'just': a power glyph inks onto the sun (callback to S01).
- `w154 'turn'` (47.32): 'turn': the sun is PRESSED on the word (squash 0.88, ripple ring).
- `w155 'it'` (47.53): 'it off': govB's shutter rolls down over the window (0.16 s + 6 px bounce), a cream sticky note riding down on its face: 'Turn it off and on again'.
- `w156 'off'` (47.64): 'off': lights out: govB steps one palette step darker (1-frame cascade top to bottom); the padlock pops (+0.14 s).
- `w157 'which'` (48.09): 'which': the 'back soon' tag swings onto the shutter (pendulum): the S01 tag, now explained. The slow lean-in starts.
- `w158+0.10 'is'` (48.32): GAG part 1: Pip taps the swinging tag with his trunk; it swings again.
- `w159 'basically'` (48.40): 'basically': the snail reaches the middle of the sill and pulls into its shell.
- `w159+0.30 'basically'` (48.70): The tag settles; the notice's pins glint once.
- `w160 'tech'` (49.03): 'tech': GAG part 2: Pip turns toward the sun and does a tiny shrug (shrug pose, 0.5 s). Nothing bigger: THE joke is in the voice, said straight.
- `w161 'support's'` (49.24): "support's": the snail pokes one antenna out of its shell.
- `w162 'answer'` (49.59): 'answer': the notice's corner curls in a breeze (paper flutter 0.2 s).
- `w163 'to'` (49.94): 'to': the sun's glyph glints (two ink ticks).
- `w164+0.05 'everything'` (50.11): 'everything': on the sticky note, 'and on again' gets one ink strike-through (0.15 s): just turn it off. That's the whole joke on screen (sign joke 5, for pausers).
- `w164+0.35 'everything'` (50.41): The padlock glints; Pip hops off the sill toward the lens; the sun takes off on a hop toward its plaza slot.
- `w164+0.60 'everything'` (50.66): The snail peeks out of its shell.

**Sky keys.** w144-0.30 'Even' day. Captions: ink throughout.  
**Sun.** Screen-space (870,700) r110 in the gap right of the dome; lands on 'Even' after the hop from S10; the power glyph inks on on 'just'; PRESSED on 'turn'; hops toward its plaza slot at the end.  
**Pip.** Scale 1.2 on the sill. GAG: taps the swinging back-soon tag, then a tiny shrug on 'tech support's' (no bigger). Hops out at the end into S12.  
**Bit.** on the sticky note's corner.
**Labels.** L14 'FBI · NSA · UK NCSC · CERT-EU' on w146-0.10 'FBI'.
**Captions** (highlight in brackets): Even the FBI said if / you can't update yet, [FBI] | just turn it off, / which is basically [turn it off,] | tech support's answer / to everything.  
**Sound.** whoosh_soft w144-0.30 'Even'; pop_mid w146-0.10 'FBI'; typing_tick w150 'can't'; typing_tick w152 'yet'; pencil_scratch_short w153-0.10 'just'; switch_toggle w154 'turn'; pop_low w155 'it'; power_off_thunk w156 'off'; lock_click w156+0.14 'off'; pop_mid w157 'which'; pencil_scratch_short w164+0.05 'everything'; whoosh_soft w164+0.35 'everything'.
**Life (estimate):** 35 events in 6.84 s = 5.1/s.

### S12 Before there was even a fix (the rewind) (w165-0.12 'And' -> w177+0.72 'fix'; est 51.07-54.59)

*VO:* "And some of those governments did it before there was even a fix."  
*ToD:* day. *In:* cut. *Reuses:* S11 (v1) hard cut to the S01 frame; new: the rewind (replaces the v1 S13 un-build as the loop device). *Sets:* GovernmentPlaza (rest; the S01 state played backwards).

Government Plaza again, as the shutdown left it: some buildings shuttered, padlocked and tagged, one half shut, one still lit, the far civic skyline partly dark. Then time REWINDS to the morning before the fix: the sun shows a clock whose hands spin backwards, the shutters roll back up, the lights come back on, and the sun sinks back to its first-frame position. The replay (the loop) then shows them doing it, before there was even a fix.

**Frame.** GovernmentPlaza at rest (camera (540,960) zoom 1.0 = frame 0's camera). State at the cut: govA + govB shuttered / padlocked / tagged and one step darker, govC's window half shut, govD lit, farCivic partly dark, the lantern off, citizens with phones up; sun lands at PLAZA.sun (720,900) r155. End state (= frame 0): every shutter UP, every screen lit, lantern on, farCivic lit except the first 2-3 windows of the restarting wave, the sun at PLAZA_REST.sunFrame0 (720,950) in a small anticipation squash, Pip sit-back on PLAZA.pip, Bit on PLAZA.bit.

**Beats.**

- `w165-0.12 'And'` (51.07): HARD CUT to the S01 framing at rest, in the state the shutdown left it (govA + govB shuttered and tagged, govC half, govD lit, far civic windows partly dark); a 3% push begins.
- `w165 'And'` (51.19): 'And': Pip lands on his bollard (from the S11 hop), scale 1.0.
- `w166 'some'` (51.32): 'some': the sun lands in its plaza slot with a squash, carrying the power glyph.
- `w168 'those'` (51.63): 'those': the 'back soon' tags on the closed buildings swing once (0.05 s stagger): these ones did it.
- `w169 'governments'` (52.03): 'governments': the citizens lower their phones; the pigeons land back on the lamp.
- `w169+0.25 'governments'` (52.28): A pigeon flaps; govA's tag twirls once more.
- `w170 'did'` (52.52): 'did': Pip nods (sit-back squash pulse +0.08 -> 0 over 0.2 s); the padlocks glint at once.
- `w172-0.05 'before'` (52.79): 'before': THE REWIND begins: a clock face pops onto the sun (cream ring + hands) and its hands start spinning BACKWARDS, accelerating; the camera eases back out.
- `w173-0.05 'there'` (52.99): 'there': padlocks and tags pop off in reverse order; the shutters ROLL UP in reverse order (govC 0.00, govB +0.15, govA +0.30: each a reversed slam, 0.16 s lift and a tiny settle at the box), each building popping one step lighter as its shutter clears (lights back on).
- `w174 'was'` (53.22): 'was': the lantern relights; the far civic windows pop back on in a reverse wave, right to left.
- `w174+0.15 'was'` (53.37): GAG (rewind): Pip does his S01 startle hop BACKWARDS (lands where he took off).
- `w175 'even'` (53.43): 'even': the browser screens reload bottom-up (the S01 reload, reversed); Bit walks backwards along govA's cornice to his frame-0 spot.
- `w176 'a'` (53.78): 'a': the clock hands decelerate.
- `w177 'fix'` (53.87): 'fix.': the hands stop at the frame-0 time and the clock face pops off, revealing the bold power glyph; the sun sinks back down its path to its frame-0 mid-rise point and settles into a small anticipation squash.
- `w177+0.40 'fix'` (54.27): The replay begins mid-motion: the first 2-3 far civic windows switch off at the far left (the S01 wave restarting); citizens idle.
- `w177+0.52 'fix'` (54.39): Caption roll (storyboard.loop): the last page exits up and page 1 'Governments all over / Europe just shut down' rolls in, still 24 px low at the seam.

**Sky keys.** w165-0.12 'And' day. Captions: ink throughout.  
**Sun.** Lands in its plaza slot PLAZA.sun (720,900) r155 on 'some' after the hop from S11. On 'before' it shows a clock face whose hands spin BACKWARDS (HoursClock with negative turns: the rhyme of S07's forward spin), stops on 'fix.', pops the face off (the bold glyph is back) and sinks to PLAZA_REST.sunFrame0 (720,950), ending in the anticipation squash that frame 0 releases.  
**Pip.** Scale 1.0 on his bollard. Nods on 'did'. GAG: his S01 startle hop plays backwards during the rewind. Ends sit-back = frame 0.  
**Bit.** govA's cornice (PLAZA.bit); he walks backwards to his frame-0 spot in the rewind.
**Captions** (highlight in brackets): And some of those / governments did it [did it] | before there was / even a fix. [before]  
**Sound.** whoosh_soft w165-0.12 'And'; pop_mid w166 'some'; click_light w170 'did'; whoosh_soft w172-0.05 'before'; counter_ticker w172-0.05 'before'; pop_low w173-0.05 'there'; click_light w177 'fix'; typing_tick w177+0.40 'fix'.
**Life (estimate):** 33 events in 3.52 s = 9.4/s.

## Life plan (QA gate 2)

| scene | est. length | events | events/s | allow-listed holds |
|---|---|---|---|---|
| S01 | 4.30 s | 51 | 11.9 | none |
| S02 | 3.95 s | 30 | 7.6 | none |
| S03 | 5.73 s | 58 | 10.1 | none |
| S04 | 2.05 s | 40 | 19.5 | none |
| S05 | 2.97 s | 26 | 8.8 | none |
| S06 | 2.21 s | 22 | 10.0 | none |
| S07 | 2.35 s | 29 | 12.3 | none |
| S08 | 9.78 s | 78 | 8.0 | none |
| S09 | 5.22 s | 44 | 8.4 | none |
| S10 | 5.69 s | 45 | 7.9 | none |
| S11 | 6.84 s | 35 | 5.1 | none |
| S12 | 3.52 s | 33 | 9.4 | none |

No allow-listed holds: the longest gap between in-frame events is <= 0.45 s in every scene on the estimate (the dead-run limit is 0.40 s of *pixels*, and every beat's motion lasts 0.15-0.5 s, so the renders should clear it). If a render shows a dead run, add an event; do not allow-list it. Camera drift never counts as life.

## Requests to other lanes

**sets**

- GovernmentPlaza: `farCivic` far civic skyline in the gap (6-8 fill-only domes / pediments / clock spires in the two haze tiers, >= 3 px window dots) with `civicOffAt` (left-to-right wave) and `civicOnAt` (reverse wave) for the S12 rewind; no pennants count (omit pennantsAt).
- GovernmentPlaza: rewind support on the per-building events: shutter `liftAt` (reversed slam), lights back on (`onAt`, one step lighter), padlock / tag `outAt`; govC partial shutter (stops at 0.5).
- BlueprintStreet: the title-block card at the plan's bottom-right corner (world x 490-930, y 1320-1450) as a label slot (L3 -> L4 paper flip).
- DomeCity: `dome` prop to re-scale the dome to one far district: feet (180,1080) and (600,1080), apex (390,830) (~1/5 of the visible city); watchtower at the dome's right foot (x 600-650, cabin top ~880) silhouetted against the sun; observer off; rattler-door anchors along rows 2-3 across the width.
- TelephoneWires: WIRES.S08 ends at a rooftop pole at x 540 on our parapet (the counter board must stay clear).
- MakersLane / Workshop: `blindSign` slot on the shop-window blind ('still fixing...') for S06 and the S07 corner preset.
- OldQuarter: `noticeSign` slot (A-frame on the left pavement, world 70-500 x 1290-1478); second-row plaques with an `old` mask (5 of 9, alternating); support-tag slots on the plaques.
- BlueprintWall: a clean top margin on the sheet (no grid above world y ~760) so the S02 tight framing and the L6 slip read.

**props**

- LabelTag (new): tag (string) / card (pin) / slip (clip) / notice (4 pins) / sign (A-frame) / stamp; `at`, `outAt`, `flipTo` (paper flip to new text), `swing`; CaptionHand 28-40 px; see labelStyle.
- CounterBoard (new, S08): rooftop sign board with a shield-dome emblem, header slot, start flag + note, rolling counter (`startAt`, never settles), two stamp slots (`stamps: [{at, text}]`), footer fine print; `riseAt`.
- DiagramHand (new, S02 + S05 callback): a bare hand drawn in DASHED ink, no fill; `enterAt`, `turnAt`, `exitAt`; plus KeyCross (key glyph + ink cross) and SiteIcon (schematic website house; `takenAt`: window hatching + roof flag).
- StickyNote (new, S11): cream note with text and `strikeAt` + `strike` substring ('and on again').
- Sticker (tiny, S03): "I [heart] PHP" with a drawn heart (the font has no heart glyph) and `scribbleAt` for the "?".
- HoursClock: negative `turns` (backward spin) for the S12 rewind. SunPie: n=2 cream=1 (the 1/2 pie). RollerShutter: `stopAt` fraction (govC half). Keeper Part B speck walk door-to-door.

**engine**

- A resolver for {w, dt} anchors (gen-scenes / gen-captions from docs/storyboard_v3.json + the timing file in timingFile). The old docs/storyboard_v2voice.json / timewarp path is retired for v3.
- Caption loop seam as in v1: frame 0 shows page 1 24 px low and settles it by 0.25 s (the roll starts at loop.captionAt).
- Labels are scene-owned props (LabelTag); captions never render them.

**sound**

- Rewind sound = existing whoosh_soft + counter_ticker played REVERSED (no new file needed).
- Re-fit the music tempo map to the v3 cut list once the voice is recorded (scripts/qa/beatsync.py --fit-tempo).

**voice**

- Record the cued script (final_script_elevenlabs.txt); then replace assets/timing_est_v3.json with the measured timing (same schema) and re-run the resolver: nothing in the storyboard changes.

