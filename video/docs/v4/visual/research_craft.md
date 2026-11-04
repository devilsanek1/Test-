# Research lane CRAFT: shots and camera for a short narrated explainer (video 4)

**Status: DONE (2026-10-29).** One of the two research lanes of workflow `v4-visual-script` (`BRIEF.md`); its sister is
`research_formats.md`. The question: how do professionals design the shots and the camera of a short narrated
explainer so a broad audience follows it, for a 30-45 s vertical (9:16) film; then the research mapped onto our rules
(`docs/look/DIRECTION.md`, `CRAFT.md` §a, `LAYOUT.md`, `CINEMATIC_GUIDE.md`) and onto video 4's locked narration.
Style-neutral: nothing here decides palette, rendering, texture or line.

**How to read a finding:** **Practice** (and where our rules already say it: "Ours"); **Why** (each source with its
strength); **For video 4** (an example beat); **Check**. Strength: **S** = a studio's, maker's or platform's own account;
**T** = a textbook, a standard or peer-reviewed research; **P** = a practitioner's advice or a journalist's analysis;
**M** = our own measurement (method in "What we studied"). URLs: "Sources" at the end.

**The clock is the take, never the card.** Every time below comes from `video/public/v4/voice_words.json` (42.24 s; the
first word at 0.13 s, the last ends at 41.32 s). `THROUGHLINE.md`'s times were estimates made before the take and are
off by up to ~1.8 s ("people's homes": card ~38.8 s, take 37.04 s; L4 "To": card 9.53 s, take 10.96 s). The take's 11
joins (the pause, then the first word the join's midpoint lands on, `CRAFT.md` §a timing):

| join | pause (s) | first word | join | pause (s) | first word |
|---|---|---|---|---|---|
| L1 -> L2 | 3.92-4.28 | "AI" 4.28 | L7 -> L8 | 25.22-25.54 | "The" 25.54 |
| L2 -> L3 | 8.22-8.76 | "Those" 8.76 | L8 -> L9 | 27.96-28.34 | "So" 28.34 |
| L3 -> L4 | 10.64-10.96 | "To" 10.96 | L9 -> L10 | **none** | "A" 29.56 (as "work?" ends) |
| L4 -> L5 | 17.34-17.76 | "That's" 17.76 | L10 -> L11 | 33.98-34.46 | "Then" 34.46 |
| L5 -> L6 | 18.84-19.26 | "Normally" 19.26 | L11 -> L12 | 37.76-38.48 | "So" 38.48 |
| L6 -> L7 | 22.88-23.46 | "But" 23.46 | end | 41.32-42.24 | the loop |

With the take, the card's four beats run S1 0-19.26 s (19.3 s), S2 19.26-23.46 (4.2), S3 23.46-38.48 (15.0), S4
38.48-42.24 (3.8). A new sentence starts every 3.4 s on average (L5 1.08 s and L9 1.22 s the shortest, L4 6.38 s the
longest).

## What we studied (M: our measurement)

**Method.** One explainer per studio, from the studios' own channel uploads as archived by the Internet Archive (YouTube
refused the download: "Sign in to confirm you're not a bot"). ffmpeg's scene score at the full frame rate counts
one-frame cuts (score > 0.3); a 1-fps contact sheet of the first 60 s, read by eye, counts the picture units and the
events inside them; 5-fps strips classify four of Kurzgesagt's joins. All four are long-form 16:9 films: their numbers
show each studio's grammar, not a 30-45 s vertical pace. Frames stayed in the scratchpad; only numbers are here.
- **Kurzgesagt**, "The Deadliest Being on Planet Earth - The Bacteriophage" (2018, 7:08, 60 fps): **0 one-frame cuts in
  428 s** (the highest full-rate scene score in the first minute: 0.04). Every change of picture is animated and short:
  a tilt up with a cloud mass passing in front (8.4-9.6 s), a fast slide (17.1-17.5 s), a push into the phage's head
  while its tail drops out of the frame (35.0-35.4 s), a yellow card sliding in for a chart (47.5-48.0 s). The title
  is ONE continuous zoom out through about seven nested, recognisable scales (molecules, a cell, a body, the Earth) in
  ~5 s (18.5-23.5 s, ~0.7 s a step), landing on the logo. The first minute holds about 9 picture units (a new one every
  ~7 s); inside each, something new every ~1-2 s (a 1-3-word label pops on with a leader line, one at a time; a pull
  back; the head opens to show its DNA); one chart, two bars, two labels. The subject sits centred on a calm field.
- **Vox**, "Proof of evolution that you can find on your body" (2016, 3:55): 36 one-frame cuts (it mixes live footage);
  the picture changes every 5.9 s on average (median 4.75 s, 40 shots). The opening repeats ONE layout four times, a
  split screen with the animal left and the human right, ~5-6 s each; labels, arrows and a highlight circle are drawn
  onto the image as the voice names the part (37 s, 43-44 s); a page of the scientific paper with a highlight sweep is
  the evidence (48-51 s); the viewer's own wrist (29-41 s) is the "you".
- **Wendover**, "The Economics of Airline Class" (2017, 11:37): 3 one-frame cuts in 697 s, one of them at the first
  frame (its joins are dissolves).
  Shots hold 6-13 s; one map holds 13 s while its information arrives in steps (the route draws on, a label types the
  dates, then the price), and a seat map fills in seat by seat with a running count, in step with the voice.
- **Johnny Harris**, "The Fastest Way to Learn a New Language: The Video Game Map Theory" (2021, first 120 s streamed):
  a live host, so 20 cuts in the first 60 s (median 1.2 s, mean 2.9 s); every cutaway returns to ONE home frame (the
  host at his desk, a world map behind him) within ~1-6 s; bursts of short B-roll (7.1-14.4 s: eight shots of
  0.5-1.6 s of study material); his title's metaphor (a video game map) appears as real game footage (26-29 s), not as
  a drawn symbol; a map pushes in on Switzerland and Italy (48-51 s). (No transcript: what he says over each shot is
  not checked.)
- **The owner's model reel**, the Big Bend (`docs/studies/2026-10-28_city_posters/refs/bigbend_reel/`; only its 6
  sampled frames, 0-11 s, and its transcript): the one tower centred in every frame, seen from five viewpoints, then a
  lineup chart; "2,000 feet" said while a yellow bar measures up the tower; scale from known neighbours (Central Park,
  a street with a yellow cab, the Burj Khalifa in the lineup); word-by-word captions mid-frame and a fixed title bar
  (ours differ by rule: captions in the band, the core line only on the cover).
- **Not reachable:** Johnny Harris's and Wendover's own written accounts of their method (bot walls, no transcripts
  found); what they do is measured above, not quoted.

## Findings

### 1. Every camera move has a reason, and its direction is its meaning; keep moves few and simple
**Practice.** A move exists only for something the viewer should feel: a **push in** says "this matters, look closer"
(a turning point, a question); a **pull back** gives context, a reveal or a release; a **follow** keeps a moving
subject in place on screen (motivated by its motion, starting a few frames after it moves); a **rise or crane** is for
scale, used sparingly. Each move starts and ends on a word, and moves are few: one big move a film, the rest small story
moves or carriers. Ours: DIRECTION rule 8 (a zoom is a visible story move or a carrier; no compound moves),
`CINEMATIC_GUIDE.md` rule 3 (one big move), `G3_ANIMATIC.md` §4 (the five values per move, the speed budget, a follow
starts 2-4 frames after its subject). New here: the one-line reason per move and the direction-meaning pairs.
**Why.** No Film School (P): the push-in "is usually done at a pivotal moment"; the pull-out "can also reveal a space or
information that serves the story"; tracking "can be motivated by the movement of the characters"; a boom "is not often
motivated by movement, and should be used sparingly"; "If you can't justify the camera's movement, then don't do it."
An animation school's storyboard course (P): "too much camera movement is uncomfortable to watch ... each move should be
designed to reveal another important aspect of the story". Bowen's *Grammar of the Shot* (T) carries the tip "Motivate
Your Dolly-In and Dolly-Out Camera Moves" (contents only read). Our Arcane measure (M, `look/research/cine_motion.md`
§1.3): pulls lead pushes 20 : 9 on scale shots; "a pull lets the moment sit ... or shows the context; a push means
attention, approach, threat or impact". Vox's Joss Fong (S): movements "that weren't too crazy to sort of create some
energy for the piece".
Smith 2012 (T, eye tracking): a whip pan scatters the gaze ("viewers scurry to the right edge"), a reflex of
self-motion that can feel like seasickness. **Not an industry rule:** "one camera move per shot" (only an AI-video
prompting guide states it); pros say one reason per move, and Arcane's calm pushes even carry a gentle sideways drift (M,
`cine_motion.md` §1.6). Our "no compound moves" is a house rule worth keeping in 9:16 (finding 8).
**For video 4.** The card's moves already carry the right meanings, now on the take's words: "To put it into
perspective," (10.96-11.98) carries a small **pull back** (context: a comparison is coming) before "FORTY kettles"
(15.06); the **rise** from the pause before "Normally" (19.26) is the one big move (the usual case, everywhere); "But"
(23.46) is a **push** through (the turn matters); "So how would that work?" (28.34-29.56) a **push in and drop** (look
inside); L10's tilt up the giant computer is a **follow** of the water; "So" (38.48) is a **pull back** out of the window
(release: the payoff).
**Check.** Each move in the visual script names its kind, its word and its reason in one line; none has no reason;
exactly one big move; none is a whip; any move over the G3 budget (~15 px a frame) passes a 1x watch on a phone.

### 2. Carry the eye across each join: cue it just before, and land the next subject where the eye already is
**Practice.** A join feels seamless when something moves the viewer's eye just before it (a motion starting, a subject
leaving the frame, a gaze, a sound) and the next picture meets the eye's small expectation within a few frames: the
thing in the same screen spot, facing and moving the same way (match on action, matched exit and entrance, the thread in
the same spot). With nothing to follow, the eye falls back to the screen centre. Ours: `CRAFT.md` §a (carriers A-F; the
midpoint on the next first word, in the pause; nothing else enters, pops or turns in the 0.4 s around it; eye jump <=
0.10). New here: the cue comes BEFORE the join, and the expectation is only place, facing and direction.
**Why.** Smith 2012 (T): continuity holds when the join coincides with a cue-driven shift of attention ("off-screen
sounds, ... onsets of motion, gaze cues, pointing gestures, departures from our field of view"); the viewer expects only
"location on the screen, orientation and direction of action", met "within a few frames"; a third of match-action cuts
went unnoticed (Smith and Henderson 2008); with no cue, gaze returns to the centre (Mital et al. 2011). Murch's "rule of
six" (P summary of his textbook) ranks eye-trace fourth, after emotion (51 %), story and rhythm. Kurzgesagt (M): each of
the four joins is led by a moving thing (the cloud mass passing, the head growing as the tail leaves).
**For video 4.** "But" (23.46; pause 22.88-23.46): one of Helsinki's lit windows on the curve, already on the subject
axis, is the cue; the push-through goes into it and lands in the street with the steam and the pipe in that same spot.
"So" (38.48; pause 37.76-38.48): the window that lit on "people's homes" (37.04-37.76) is the cue; the pull back keeps it
on the axis while the tilt down brings your hand and phone in at the bottom. L9 -> L10 has no pause: the drop must arrive at the still
blue water as "work?" ends (29.56), so the answer's first move lands on "big" (29.96).
**Check.** Per join: the cue (what moves the eye 0.2-0.5 s before), the subject's screen spot on both sides (px; eye
jump <= 0.10), the midpoint time from the take, and nothing else starting in the 0.4 s around it.

### 3. Travel instead of cutting: into a cross-section, into a detail, through the scales
**Practice.** Animated explainers travel through one world rather than cut: a tilt or crane past a foreground mass, a
push into a part of the subject until it fills the frame, a slide, a card swapped in for a chart, one zoom through nested
scales (Powers of Ten); a cutaway (the thing sawn in half, the ground opened) shows the mechanism inside without leaving
the place. Joins are short and led by the subject. Ours: `CRAFT.md` §a (C continuous camera for any change inside one
place; A push-through; one home place), `G3_ANIMATIC.md` §4 (a push over 2x is a push-through). The research measures
it; nothing in our rules changes.
**Why.** Kurzgesagt (M): 0 hard cuts in 7:08; four joins of ~0.4-1.2 s; the title one zoom out through ~7 scales in ~5 s.
Kurzgesagt (S): "When the script is ready, we begin sketching out the video. We try to think of visual metaphors,
transitions between ideas, and decide which scenes need the most attention." The Eameses' *Powers of Ten* (T, an
encyclopedia on the film): one continuous camera out "at a rate of one power of ten per 10 seconds" and back "a power of
ten per 2 seconds". Cleo Abram, ex-Vox (P, via The Long Story): researchers sawed "shoes in half so she could show
viewers what made them so effective". Wendover (M): dissolves; in ours a dissolve is no carrier.
**For video 4.** S1 (0-19.26 s) and S3 (23.46-38.48 s) are each one travelling camera. The street's cutaway is the
cross-section: "So how would that work?" (28.34-29.56) pushes in and drops through the cut-open ground to the still blue
water at the giant computer's foot. L6's rise is the scale travel: at Kurzgesagt's ~0.7 s a step it passes roofs, city,
coast and the Earth's curve in ~2-2.5 s (the Eames inward pace, ~2 s a step, would need 6-8 s, longer than the 4.2 s
line); one data center's fans pass close on "big fans" (21.18), it lands, and the curve holds while the plumes thin on
"blow that heat outside" (21.86-22.88).
**Check.** Hard cuts: 0 (at most 2 F, each on a "But", `CRAFT.md` §a); every change of place inside S1 and S3 is a move
with a start and an end frame; each join is short (Kurzgesagt's run ~0.4-1.2 s; this take's pauses are 0.32-0.72 s, L9
-> L10 none), its midpoint on the next first word (`CRAFT.md` §a), the declared big move aside; a sound-off stranger
reads the cutaway as "the ground opened up".

### 4. One screen direction for the thread's flow: the camera may go upstream, the water never does
**Practice.** Viewers build a map of where things are and which way they move; a flow keeps one screen direction in
every shot (the 180-degree rule). When the camera must go back to the source, it travels against the flow while the flow
still runs the same way on screen. A fixed layout the viewer learns once (cause here, effect there) carries a whole
film. Ours: `LAYOUT.md` §3 (on screen "before left, after right; time runs left to right"), `CRAFT.md` §a.1 (the
thread's home spot). Not yet in our rules: a declared direction for a thread that flows.
**Why.** Smith 2012 (T): matched exits and entrances work by "matching the expected screen entry location and direction
of motion"; crossing the axis reverses the screen direction, and the next shot "would no longer be analogous with ...
our covert shift of attention". Vox (M): its four split screens all keep the animal left and the human right.
**For video 4.** The heat flows one way: from the giant computer toward the home, e.g. left to right along the pipe,
then up into the radiator (up the tall frame). L1 (from ~0.4 s): source -> window. L2's glide back to the source (from
"AI" 4.28): the camera travels upstream while the orange water keeps streaming toward the window. **Flag for the
concepts:** the card's L7 -> L8 reads "the orange water leads the camera along the pipe ... to the giant computer": that
has the water running toward its source, against L1, L10 and L11; stage it as the camera travelling upstream against the
flow (or let a cold blue return pipe lead, if one is drawn). L10 (29.56-33.98): blue in at the foot, orange out at the
top; L11 (34.46-37.76): along the pipe and up into the radiator, L1's direction.
**Check.** One arrow per shot for the flow and one for the camera: every flow arrow points source -> home in the same
screen direction; the cold-read question "which way is the heat going?" is answered right for every shot.

### 5. Literal first: the real thing and its real mechanism; a comparison only when the voice says it; nothing unexplained
**Practice.** For a broad audience, show the actual physical thing (a computer that looks like a computer, water in a
pipe, a radiator, a window). A picture metaphor works when the words anchor it in the same moment, and then only its
mapped feature is shown. A number reads best as a count of familiar things. Interesting but irrelevant details lower
understanding, and an unexplained visual signal (a colour change, a box, a glow) raises a question the film never
answers. Ours: playbook ("literal beats clever; never a metaphor the facts don't support"), `CINEMATIC_GUIDE.md` (show
the real mechanism), the card's "Truth in the picture". New here: the anchoring evidence and the "unmapped feature" and
"unexplained signal" cautions.
**Why.** Fong (S): the concept was "pretty abstract", so "I wanted to actually show people those telescopes"; it is
harder "when you're covering topics that are less literal and physical". Joe Posner of Vox's early video team (P, via
The Long Story): "Simply slapping some b-roll and stock photography on top of narration didn't cut it." Phillips 2000 (T, via a
2023 Frontiers summary): words that give a clue to a pictorial metaphor raise comprehension (and liking). Sundar and
Adesope 2020 (T, a meta-analysis of 58 studies): seductive details lower learning, most when placed next to the relevant
picture or kept on screen. Brame 2016 (T): extra features make the viewer "judge whether he or she should be paying
attention to them". Barrio, Goldstein and Hofman 2016 and Hullman et al. 2018 (T): re-expressing a measurement in
familiar objects improves recall and estimation. Johnny Harris (M): his title's metaphor is shown as the real thing it
names (game footage), not as a drawn symbol.
**For video 4.** "giant computers, in buildings called data centers" (5.68-8.22): a tall rack a stranger names as a
computer, then plain buildings. The forty kettles are the voice's own comparison ("as much heat as FORTY kettles",
14.56-16.10): drawn literally and counted, so the count is the number; only the mapped feature shows (heat, the kettles'
steam), never the computer's pipe water bubbling like a kettle. "a plan" (26.18): the pencil plan is the literal
convention (the fact lock: never a finished building). **Flag:** the card's small box on the pipe (the unnamed heat pump,
L11) turns the water "orange to gold": a change with no word is a question with no answer; keep the box calm or let the
voice name it (the card's open item 6).
**Check.** Sound-off cold read: a stranger names every beat's subject in plain words; every non-literal picture is one the
voice names in that second; a list of every change of colour or state with the word that explains it has no blank.

### 6. One idea per sentence, on its words: the picture leads its word by ~0.1 s, and a long shot adds one event every ~1-2 s
**Practice.** Each sentence carries one idea, and the picture shows it while it is said, changing in the voice's order
just before the word. A picture holds long enough to be read; a long travelling shot stays alive by adding ONE new
element at a time on the stressed words. Ours: `CRAFT.md` §a (shots average >= 3.5 s; a C move inside a panel keeps one
shot), DIRECTION rule 8 (visuals lead their word by ~0.1 s), rule 3 (alive but calm), `G3_ANIMATIC.md` §2 (one idea a
panel). The research supports all of it and adds the cadence inside long shots.
**Why.** Fong (S): "the perfect correspondence between what you're seeing in these animations and what you're hearing"
helps viewers understand and remember. Brame 2016 (T): narrate a process while it is animated (modality), in small
chunks (segmenting). ITU-R BT.1359 (T, a broadcast standard): a sync error is noticed from 45 ms of sound before picture
or 125 ms of sound after it, so a picture ~0.1 s before its word reads as in sync and one after its word reads late.
Cutting 2016 (T, 180 films): today's films average 4.3 s a shot; "rapid changes in the visual field attract our eye
movements" and "motion also captures attention". Meta (S): people spend "1.7 seconds with a piece of content on mobile".
Ours (M): Kurzgesagt ~7 s a picture unit with a new element every ~1-2 s; Vox ~5.9 s a shot; Wendover holds 6-13 s
while a map gains one element a step.
**For video 4.** L4 is one picture with its events on its words: the pull back on "To put it into perspective,"
(10.96-11.98); the one giant computer singled out on "one of these computers" (12.54-13.72); the kettles pop on in rows
~0.1 s before "FORTY" (15.06); their steam rises on "boiling non-stop" (16.22-17.34); the mug on "That's a lot of tea."
(17.76-18.84). S1 (19.3 s) and S3 (15.0 s) each get such a beat list.
**Check.** A beat table: stressed word, its time from the take, the ONE visual event, its start (word - 0.1 s); every
sentence has one subject; inside S1 and S3 no stretch over ~2 s without a story event (life aside) and no two story
events within 0.3 s.

### 7. The first 3 seconds carry the claim: the subject from frame 0, the proposition by 3 s, in the voice's order
**Practice.** The platforms find that the content proposition belongs in the first 3 s and the hook in the first 6;
mobile viewers give an item under 2 s and often watch without sound, so the claim must read in picture and captions at
once, moving from frame 0. Ours: playbook Hook and pacing, DIRECTION rule 9, `CINEMATIC_GUIDE.md` "The opening": the
research adds only the platforms' numbers and the voice-order map.
**Why.** TikTok (S): "Introduce your content proposition in the first 3 seconds for better recall and awareness";
"Prioritize your hook in the first 6 seconds". Meta (S, 2016, with Nielsen data): "1.7 seconds with a piece of content
on mobile"; recall after "only 0.25 seconds of exposure"; video must "be understandable regardless of sound by using
captions or other visual techniques". Fong (S): "You always want something very fast-paced at the very top." Our v1 (M,
playbook): a calm, pretty opening lost ~80 % of viewers by 3 s. Big Bend (M): the subject whole and centred from the
first frame. **Do not cite:** "47 % of a campaign's value is in the first 3 s" is not on Meta's page (only in
secondary write-ups).
**For video 4.** L1 (0.13-3.92) in its own order: the snowy street draws on from frame 0 and the warm water's first run
starts with its ding at ~0.4 s; "Helsinki" (0.64); the giant computer on "AI" (1.50; or first at "giant computers" 5.68,
the card's fallback); the water reaches the one window, which lights, on "heat" (2.14); the city's windows ripple on
across "seventy thousand homes" (2.34-3.92): the expected one home, then reality overtaking it. By 3.0 s the picture
alone says: AI, heat, homes.
**Check.** Freeze at 1.0, 2.0 and 3.0 s at phone size, sound off: at 3.0 s a stranger says what the film claims;
something new every ~0.5 s in 0-3 s from the subject's own build; nothing in 0-3 s the voice has not named.

### 8. Compose for 9:16: one centred subject close under the captions, depth stacked up the frame, vertical moves for the big beats
**Practice.** A tall frame suits tall things and vertical motion; sideways pans and fast sideways action crowd the narrow
frame. Key reads stay off the edges and out of the platform UI. Captions pull the eye at every change, so the subject
sits close under them. Ours: `LAYOUT.md` §1 (the band y 290-600, the read zone y 600-1250, the subject axis x 380-700,
the UI zones), §2 (each shot type's framing); `look/research/vertical.md` (the geometry and the safe zones). New here:
captions are read automatically, and a key visual onset should not hide behind a caption change.
**Why.** Adam Sebire, Vertical Film Festival (P): "Pans or rapid action moving across the frame can be discombobulating
for audiences due to a reduced field of view"; "Look out for strong vertical features"; "keep important detail and
especially text away from frame edges". d'Ydewalle and De Bruycker 2007 (T, eye tracking): attention to a subtitle at
its onset "is more or less obligatory and is unaffected by ... the availability of the soundtrack"; viewers spent 41 %
of the time in the subtitle area and shifted to a new one in ~0.33-0.39 s. TikTok (S): keep content "within the UI safe
zone". Big Bend and Kurzgesagt (M): the subject centred in every frame.
**For video 4.** L10 is the natural vertical beat: the tilt up the giant computer from the blue water at its foot ("take
the heat out", 31.14-32.00) to the orange water at its top ("with water in pipes", 33.02-33.98); L6's rise is vertical
too. L11's run along the pipe (34.46-37.76) is sideways: keep the water fixed on the subject axis while the street slides
past (a follow, never a pan the eye must chase), slow, then turn up into the radiator.
**Check.** Both end frames of every move put the subject inside x 380-700, y 600-1250; no key read in a UI zone; a
sideways move over the speed budget gets a 1x phone watch; no key visual onset in the ~0.4 s after a caption change
unless it sits just under the band.

### 9. Overview and ground: establish, go in for the detail, one scale peak, then re-establish home
**Practice.** Give the viewer the overview first, go close when the voice names a detail, and toggle back to the
overview as the story moves on; after a detour (the scale shot), a return to the home view re-orients. One scale peak,
with familiar things for size. Ours: `CRAFT.md` §a.2 (one home place plus at most ONE comparison or scale shot),
DIRECTION rule 7 (cozy >= 50 % of the runtime, one big move), `LAYOUT.md` §2. New here: the overview-and-ground toggle.
**Why.** Vox's Sam Ellis (S): "Toggling between a map and what's happening on the ground seems to really help people
understand the story"; "You want to get the concept from a bird's eye view." Fong (S): she opened on the telescopes so
viewers grasped the difficulty first ("I didn't want the photo to be the first thing that people see"). A
practitioner's guide (P): a wide first lets the editor "cut freely between tighter shots without losing anyone", and a
return to the wide "after a lot of coverage cuts" re-orients. Johnny Harris (M): every cutaway returns to the same home
frame. Big Bend (M): size from known neighbours.
**For video 4.** S1 opens on the home view (the street and its window, the harbour, the pale plan at the city's edge:
overview) -> ground (the giant computer close, "really hot", 9.74-10.64) -> a step out (the kettles) -> the one scale
peak (L6, 19.26-22.88: the Earth's curve) -> **re-establish home** (L7 "But Helsinki WANTS that heat", 23.46-25.22, in
the street) -> overview of the plan (L8) -> ground (L9-L11: the cutaway, the pipe, the radiator) -> the payoff's pull
back to the street (L12) -> frame 0's view (the loop).
**Check.** A size ladder (XW / W / M / C) per shot: no three of one size in a row without a reason; exactly one scale
peak; the shot after it is the home street by "But" (23.46); every close is entered from a view that showed where it is.

### 10. Words and numbers in the picture: few, on their object, at their moment, never repeating the caption
**Practice.** The voice and its captions carry the sentences; the picture adds at most a short label or one number, on
the thing it names, as it is said, long enough to read. Short keywords help; text that repeats the narration hurts.
Ours: `LAYOUT.md` §3 "Words in the picture" (>= 56 px; at most one label and one number a panel; never the same words
twice on screen; nothing in the band); `CRAFT.md` §a.2 (information is paper in the place). New here: the keyword
evidence, and the caption counts as words already on screen.
**Why.** Trypke, Stebner and Wirth 2023 (T, a review of 63 studies): Mayer and Johnson 2008 showed "the benefits of
embedding written keywords from a narrated text into visual displays"; per Adesope and Nesbit 2012, "narrations
accompanied by short written keywords" foster learning while "identical written text impaired learning". Brame 2016 (T):
signaling by "two or three key words", a colour or contrast change, or an arrow. Netflix's timed-text guide (S): adult
reading up to 20 characters a second, 42 a line, two lines. Ours (M): Kurzgesagt's labels are 1-3 words on leader lines,
one at a time; Vox draws labels on the image as named; Wendover types the dates and price on the map in step with the
voice; the Big Bend draws "2,000 feet" as a measuring bar on the tower itself.
**For video 4.** **Flag:** the card's "≈ 40" tag lands while the caption reads "FORTY kettles" (15.06-16.10): the same
number twice; the forty drawn kettles already are the number, so the tag can go (or come after the caption moves on).
The "2027" tag swinging on with "next year" (27.40-27.96) is the right kind: it adds what the voice leaves out, on the
paper it belongs to. No labels for "data centers" or the heat pump: the captions name the first, and the second is
unnamed (finding 5).
**Check.** A list of every word and number in the picture: its object, its time (its spoken word - 0.1 s), its size
(>= 56 px), its time on screen (>= ~1 s; <= 20 characters a second), and that the caption on screen then doesn't say it.

### 11. Write the sound into the visual plan: one sound per story event, sound leading into joins, music marking the turn and the payoff
**Practice.** Picture and sound are designed together: effects mirror what is said and shown at that moment; a sound in
sync with a visual change makes that change pop out; a sound that starts just before a join (a J-cut) pulls the eye
into the next shot; music changes mark sections and never fight the voice. Pros write the cues beside the shots (the
two-column A/V script, `research_formats.md`). Ours: playbook Music and sound (SFX land on visual hits; positive phone
sounds, one in the first second; the voice on top), DIRECTION rule 9; the sound is mixed at G7. New here: cues written
per beat now, J-cuts into joins, music as the section marker.
**Why.** Van der Burg et al. 2008 (T): a short sound synchronised with a visual change makes that object pop out of a
cluttered display, though the sound says nothing about where it is ("pip and pop"). Smith 2012 (T): off-screen sound is
one of the cues that carry attention across a join. A J-cut (P, an editing glossary) "prepares the audience for what is
coming before they can see it". Fong (S): music must not "compete with the pitch of your voice-over"; song starts and
ends "are cues to viewers"; she changes music about every 20 s. Kurzgesagt (S): music composed to the finished video
"to highlight the important parts"; sound effects "really add an additional layer". The Long Story (P): Vox's effects
"mostly reflect what [the narrator] is saying at any given moment". Meta (S): much viewing is sound-free, so every beat
must also read without its sound.
**For video 4** (each cue on its word and event): the ding as the warm water starts (~0.4 s); a low hum as the giant
computer appears ("AI" 1.50); soft plinks rippling with the city's windows (2.34-3.92); a rising whoosh starting in the
pause before "Normally" (18.84-19.26: a J-cut into the big move); the fans' whirr on "big fans" (21.18); the wind
dropping to the street's quiet hush in the pause before "But" (22.88-23.46: a sound bridge that cues the push-through);
a paper flick as the 2027 tag swings on ("next year" 27.40); water running in the pipe through L10 (31.14-33.98); the
radiator's tick and the window's click on "people's homes" (37.04-37.76); the chat bubble's pop on "chatbot" (38.86);
the music steps at "But" and lifts at the payoff's "So" (38.48), always under the voice.
**Check.** A sound column in the visual script: every cue with its word, time and visual event; cues only on story
events (none on supporting life); each join's lead-in sound starts inside its pause; the film still reads sound off.

### 12. Rest where the meaning lands: the camera settles on the turn and the payoff while the subject alone moves
**Practice.** Motion and change build attention; at the turn and at the end, pros slow the changes and the motion so
the point sinks in (a beat, a music change), and a big move lands and holds before the next. Ours: DIRECTION rule 8
(every hold locked or a slow float, never a still frame), the take's shaped beats (before "But Helsinki WANTS" and the
payoff), the card's 0.5 s end hold.
**Why.** Cutting 2016 (T): at the end of a film's climax, "increasing shot durations and decreasing motion". Vox's Fong
(S, in The Open Notebook) built "a bit of a reflective moment" around the black-hole reveal; the article's author (P)
notes that a short line before the big idea gives viewers "a second to let it sink in". Arcane (M, `cine_motion.md` §3): burst, then hold; stillness before
impact. `look/research/vertical.md` §5 (M with sources): a big move lands and holds 0.8-1.5 s.
**For video 4.** After the push-through on "But" (23.46), the camera is at rest by "WANTS" (24.04-24.62) while only the
steam bends into the pipe. L6's rise lands before "blow that heat outside" (21.86) and the curve holds (the plumes
thinning) to the push-through. The payoff's pull back lands by "chatbot" (38.86-39.40) and holds to the end (41.32 plus
the 0.92 s tail): only the chat bubble pops and the window warms, then the un-build to frame 0.
**Check.** At "WANTS" and from ~39.4 s the camera is locked or floating and the beat's subject is the only mover; the
big move's landing holds >= 0.5 s before the next join.

## The 8 that matter most for video 4
1. **Time every picture from the take, one idea per sentence, an event on each stressed word** (findings 6, 2): the
   beat table from `voice_words.json` (never the card's estimates, off by up to ~1.8 s); each visual ~0.1 s before its
   word; each join's midpoint in its pause (L9 -> L10 has none); S1 (19.3 s) and S3 (15.0 s) never idle, one story event
   every ~1-2 s.
2. **The first 3 s in the voice's order** (finding 7): street from frame 0, the ding and the warm water at ~0.4 s, the
   computer on "AI" (1.50), the window on "heat" (2.14), the city's windows across "seventy thousand homes"
   (2.34-3.92); the claim reads sound off by 3.0 s.
3. **The warm water leads the eye across every join, in ONE screen direction** (findings 2, 4): source -> home in every
   shot; the camera may go upstream (L2, L8), the water never; re-stage the card's L7 -> L8.
4. **Travel, don't cut** (finding 3): S1 and S3 as single travelling cameras, the cutaway as the cross-section (L9), L6
   as one scale travel at short-form speed (~0.7 s a scale step); 0 hard cuts.
5. **Every move with a one-line reason that matches its direction** (findings 1, 8): pull back for context ("To put it
   into perspective,") and release (the payoff), push for the turn ("But") and the question ("So how would that
   work?"), follow for the water, ONE big rise (L6); vertical moves for the big beats; no whips; sideways only as a
   follow.
6. **Literal and voice-anchored** (finding 5): a computer that reads as one, the forty kettles counted as the number, the
   plan in pencil; nothing changes colour or state without a word (the card's small box).
7. **Overview, ground, one scale peak, home again** (findings 9, 12): the street's overview first, closes when the voice
   names a detail, the Earth's curve once, the home street re-established on "But", the camera at rest on "WANTS" and on
   the payoff.
8. **Sound and words as signals for the one event the eye must catch** (findings 10, 11): a sound per story event (the
   ding, the fans, the hush before "But", the radiator's click, the chat pop) with J-cuts into the push-throughs; words in
   the picture only where they add (2027), never repeating the caption (the "≈ 40" tag).

## Cautions (what the research does not support, or could not confirm)
- "One camera move per shot" is not an industry rule (finding 1); ours ("no compound moves") is a house rule.
- "47 % of the value in the first 3 s" is not on Meta's own page (finding 7).
- Johnny Harris's and Wendover's own accounts of their method were not reachable; one film each was measured instead
  (Wendover's in full, Harris's first 2 minutes).
- All four measured films are long-form 16:9; their shot lengths describe grammar, not a 30-45 s vertical pace. The Big
  Bend was read from 6 sampled frames only.
- Phillips 2000, Sundar and Adesope 2020, Barrio et al. 2016 and Hullman et al. 2018 were read at abstract or summary
  level; Murch's weights come from a practitioner's summary (only emotion's 51 % confirmed).
- The TikTok/Kantar "88 % say sound is essential" figure (Social Media Today) is reported second-hand; not used above.

## Sources
**Studios, makers, platforms (S)**
- https://www.lingq.com/en/learn-english-online/courses/689474/how-to-make-a-kurzgesagt-video-in-120-4887128/ - the
  transcript of Kurzgesagt's own video "How to Make a Kurzgesagt Video in 1200 Hours" (YouTube uFk0mgljtns): sketching
  "visual metaphors, transitions between ideas", "which scenes need the most attention", "the right images to the words
  in the script"; music "to highlight the important parts"; sound effects "an additional layer".
- https://www.theopennotebook.com/2020/01/07/videogram-how-a-vox-video-explains-the-science-behind-the-first-photo-of-a-black-hole/
  - Vox's Joss Fong interviewed: "very fast-paced at the very top"; showing the abstract as the actual thing; camera
  moves "not too crazy"; music cues every ~20 s, never against the voice's pitch; a reflective moment at the reveal.
- https://videoconsortium.org/mag/episode-1-joss-fong - Fong: "the perfect correspondence between what you're seeing ...
  and what you're hearing"; less literal topics are harder.
- https://www.storybench.org/?p=14818 - Vox Atlas producer Sam Ellis: toggling map and ground; "a bird's eye view";
  "We do the story first".
- https://ads.tiktok.com/resources/help/article/creative-best-practices - TikTok's ads help (updated June 2025): the
  proposition in the first 3 s, the hook in the first 6, captions, 9:16, the UI safe zone.
- https://www.facebook.com/business/news/insights/capturing-attention-feed-video-creative - Meta's Facebook IQ
  (2016-04-20; Nielsen and Fors Marsh Group data): 1.7 s per item on mobile; recall after 0.25 s; understandable without
  sound.
- https://partnerhelp.netflixstudios.com/hc/en-us/articles/217350977-English-USA-Timed-Text-Style-Guide - Netflix's
  timed-text guide: 20 characters a second (adults), 42 a line, two lines.

**Research, textbooks, standards (T)**
- https://ualresearchonline.arts.ac.uk/id/eprint/21187/ (PDF https://ualresearchonline.arts.ac.uk/id/eprint/21187/2/6679.pdf)
  - Smith 2012, "The Attentional Theory of Cinematic Continuity", Projections 6(1): cues before the join, the minimal
  expectation, match-action unnoticed, whip pans scatter the gaze, the centre default, screen direction.
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5256470/ - Cutting 2016, "The evolution of pace in popular movies":
  4.3 s a shot today; change and motion capture attention; longer shots and less motion at the end of the climax.
- https://pmc.ncbi.nlm.nih.gov/articles/PMC5132380/ - Brame 2016, "Effective Educational Videos", CBE-Life Sciences
  Education: signaling, segmenting, weeding, matching modality.
- https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10192876/ - Trypke, Stebner and Wirth 2023, "Two types of redundancy in
  multimedia learning", Frontiers in Psychology: written keywords help, identical text hurts.
- https://news.wsu.edu/press-release/2020/03/19/seductive-details-inhibit-learning - Washington State University on
  Sundar and Adesope 2020, Educational Psychology Review (58 studies): seductive details lower learning.
- https://www.frontiersin.org/articles/10.3389/fpsyg.2023.1131387/full - a 2023 Frontiers in Psychology article
  summarising Phillips 2000, "The Impact of Verbal Anchoring on Consumer Response to Image Ads", Journal of Advertising
  29(1).
- https://research.vu.nl/en/publications/pip-and-pop-non-spatial-auditory-signals-improve-spatial-visual-s/ - Van der
  Burg, Olivers, Bronkhorst and Theeuwes 2008, "Pip and pop", JEP: Human Perception and Performance.
- https://betatest.planetread.org/pdf/Eye_movements_of_children_and_adults_while_watching_subtitles_on_TV.pdf -
  d'Ydewalle and De Bruycker 2007, "Eye Movements of Children and Adults While Reading Television Subtitles", European
  Psychologist 12(3): reading subtitles "more or less obligatory"; 41 % of the time on the subtitles.
- https://idl.uw.edu/papers/concrete-reexpression - Hullman, Kim, Nguyen, Speers and Agrawala 2018, "Improving
  Comprehension of Measurements Using Concrete Re-expression Strategies", CHI.
- https://microsoft.com/en-us/research/?p=215388 - Barrio, Goldstein and Hofman 2016, "Improving Comprehension of
  Numbers in the News", CHI (3,200+ participants: perspectives improve recall, estimation, error detection).
- https://en.wikipedia.org/wiki/Audio-to-video_synchronization - ITU-R BT.1359-1: detectable from 45 ms of sound
  leading to 125 ms of sound lagging.
- https://en.wikipedia.org/wiki/Powers_of_Ten_(film) - the Eameses' 1977 film: one continuous camera, out one power of
  ten per 10 s, back in one per 2 s.
- https://www.oreilly.com/library/view/grammar-of-the/9781351803519/ - Bowen, *Grammar of the Shot*, 4th ed.,
  Routledge: the tip "Motivate Your Dolly-In and Dolly-Out Camera Moves" (contents only).

**Practitioners and analysts (P)**
- https://nofilmschool.com/must-know-camera-movements - the meaning and motivation of push, pull, track, boom; "If you
  can't justify the camera's movement, then don't do it."
- https://www.pulsecollege.com/animation-courses-storyboard/ - storyboarding for animation: sparing moves, each
  revealing something; no cut without a reason.
- https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch - Murch's six
  criteria in order (emotion 51 %, then story, rhythm, eye-trace, the 2D plane, 3D space).
- https://thelongstory.substack.com/p/why-the-best-journalists-on-youtube - on the Vox school: Posner's "distinctly
  visual" rule; Abram's sawn-in-half shoes; effects that mirror the narration.
- https://www.adamsebire.info/vertical-film-festival/9-16-tips-and-tricks/ - Adam Sebire, Vertical Film Festival:
  pans disorient in 9:16; vertical features; text off the edges.
- https://filmdaft.com/the-l-cut-and-j-cut-how-film-editors-use-audio-to-control-time/ - J-cut, L-cut, sound bridge.
- https://spotlightfx.com/blog/what-is-an-establishing-shot - establishing and re-establishing shots.
- https://www.studiobinder.com/blog/av-script-template/ - the two-column A/V script (video left, audio right).
- https://skills.sh/emily2040/seedance-2.0/seedance-camera - the only place "one primary camera move per shot" was found
  (an AI-video prompting guide), cited to show it is not an industry rule.

**Our measurements (M)** - the Internet Archive's copies of each studio's channel uploads:
https://archive.org/details/youtube_-_UCsXVk37bltHxD1rDPwtNM8Q_2018 (Kurzgesagt, "The Deadliest Being on Planet Earth -
The Bacteriophage") · https://archive.org/details/youtube_-_UCLXo7UDZvByw2ixzpQCufnA_2016 (Vox, "Proof of evolution
that you can find on your body") · https://archive.org/details/youtube_-_UC9RM-iSvTu1uPJb8X5yp3EQ_2017 (Wendover, "The
Economics of Airline Class") · https://archive.org/details/youtube_-_UCmGSJVG3mCRXVOP4yZrU1Dw_2021 (Johnny Harris, "The
Fastest Way to Learn a New Language"); and in the repo `video/docs/look/research/cine_motion.md` (Arcane, measured),
`video/docs/look/research/vertical.md`, `video/docs/OWNER_PLAYBOOK.md` (v1's 3-second drop),
`video/docs/studies/2026-10-28_city_posters/refs/bigbend_reel/README.md`.
