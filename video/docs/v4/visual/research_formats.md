# Research lane FORMATS: how studios write the visual plan between the locked voice and the boards (2026-10-29)

Status: DONE (2026-10-29). Feeds `METHOD.md` and v4's `VISUAL_SCRIPT.md`. The question: how professional studios
write the visual plan of a narrated film between the locked script/voice and the storyboard/animatic, and which format
and steps we should use for our 40-second vertical films. The craft of the shots themselves is the sister lane
(`research_craft.md`); boards and reels are covered by the earlier lanes (`docs/look/research/storyboard_*.md`,
`animatic_*.md`) and are not repeated here.

Strength marks: **[studio]** a studio's or maker's own account (their words, sometimes reported by a magazine);
**[guide]** a textbook, school, agency manual, museum or archive; **[practitioner]** a practitioner's or tool vendor's
advice; *weak* = thin or unsourced (a Wikipedia stub, one teacher). *(ours)* = our own derivation, with no source.
Every source is listed at the end with what it supports.

**In short.** The step has no single English name, but every narrated-film trade has it: the A/V script's picture
column (documentary, corporate, commercials, explainers), the shooting script and the shot list (live action), the
découpage (French film: the script cut into shots, each with its size, angle and move, which a storyboard "complète ou
remplace"), the scriptline (TV animation), the story artist's thumbnails (features). They share one shape: the locked
sound in one column, what the camera sees beside it, one row per shot, a stable number per shot, a time on every row,
the joins written in, read in order at the real pace, and signed off before anyone draws.

## Findings

**1. The picture is written beside the sound, one row per synchronized moment (the A/V script).**
- *Who and why:* the standard written plan of narrated video, so that "everyone involved ... agree[s] on exactly how
  the video should look and sound before any images are recorded" (AHRQ [guide]); "Every row should represent one
  synchronized moment of the finished video", and the format is "easy to scan, easy to annotate, and easy to sign off
  on before production begins" (Celtx [practitioner]); a documentary director's template keeps "a few sentences per
  cell" (Peter Thompson [studio]); an explainer studio's client script is two columns, "VO Text | Picture Description"
  (Studio Pigeon [studio]); short-form web content and documentaries "often use Three-Column Scripts" with a time
  column (LibreTexts [guide]). Which side is left is house style (Celtx video left, StudioBinder audio left
  [practitioner]).
- *For our films:* the visual script is an A/V script whose sound side is the locked take verbatim (v4: 122 words,
  12 sentences, 42.24 s) and whose picture side is one shot per row; at ~10-12 shots for 42 s (`CRAFT.md` §a: shots
  average >= 3.5 s) a row covers one or two sentences. Its seed exists: `script_g1.md` already has a "Picture" column,
  but timed by estimate and written as long mixed cells.
- *Check:* a script joins the VOICE fields in order and compares them with `public/v4/voice_words.json`: every word
  once, in order, none added, none missing.

**2. Narration-led films lock the voice first and fit the picture to it: the take is the clock.**
- *Who and why:* Kurzgesagt: the narrator's "voiceover provides the timing for the animation team" [studio]; Foster's
  Home for Imaginary Friends: "we record before storyboarding so the board artists can work off the actors'
  performances" (Craig McCracken [studio]); Coraline: the voices recorded, then "story reels" of the boards "for timing
  of each shot ... It has to be right, to be planned and edited, before it begins" (Neil Gaiman reporting Henry Selick
  [studio]); documentary editors start with "the radio edit, the process in which the editor tells the story by laying
  out all the audio first", then B-roll and graphics (Frame.io [practitioner]); "If narration drives your project, it's
  wise to write your audio first so you can match visuals to it later" (Celtx [practitioner]).
- *For our films:* every time in the visual script comes from the locked file, never from an earlier estimate. v4's
  through-line card timed its joins before the lock, and they drift from the take by -1.20 to +1.43 s ("To" is at
  10.96 s, the card says 9.53; "Then" is at 34.46 s, the card says 35.66; `script_g1.md` used 2.87 words a second).
  One join has no breath at all: "work?" ends at 29.56 s and "A" starts at 29.56 s, so that join cannot sit in a
  pause and has to live inside one continuous move.
- *Check:* every shot boundary and every word anchor equals a word boundary in `voice_words.json` (within 0.01 s); a
  script prints the drift table against the card.

**3. Animation pins action to the locked track at frame level: the track is broken down first, then the director marks
where each action happens.**
- *Who and why:* on the exposure sheet the sound technician first writes each sound "at the appropriate frame", then
  "The director then goes over the sheets and indicates where specific action is to take place" (Brian Lemay
  [practitioner]); a 1933 short "was planned down to the frame by two men - a director and a musician - before a single
  animation drawing had been done", on bar sheets (Animation Resources [guide]); TV boards carry a "Slugging" field,
  "Notes regarding the timing of dialogues and actions ... instructions on how to create the animatic" (Toon Boom
  Storyboard Pro manual [guide]); anime storyboards keep a timing column beside the shot number, picture, description
  and dialogue: "Modern storyboards usually contain 5 columns" (Animétudes [practitioner]).
- *For our films:* `voice_words.json` IS the track breakdown (each word's start and end to 0.01 s, the stressed words
  in caps in the paste, FORTY and WANTS, the pauses between sentences: 0.32-0.72 s, and none before "A" at 29.56 s).
  The visual script is the director's
  pass on it: every key action (a pop, a draw-on, a light coming on, a move's start) gets a word anchor and a time, so
  G3 can lead each word by ~0.1 s (`DIRECTION.md` rule 8); the first 3 s get sub-second detail (frame 0, the first word
  at 0.13 s, the payoff in words by ~2 s).
- *Check:* every key-action line reads `on "word" (t s)` with t that word's start; the opening block has lines for
  0.00, the first word and the payoff word.

**4. Every shot gets a stable number and the same few camera fields, and a move is written as its start and end.**
- *Who and why:* a shot list's core is "Scene Number, Shot Number, Shot Description, Camera Movement, Shot Size and
  Type", and a move inside a take is written as its states ("low-med-high") (StudioBinder [practitioner]); once a
  script is approved its scenes are numbered and "Each individual shot within a scene is also numbered"; added pages
  become 45A, cut ones stay as "OMITTED" (Wikipedia, *weak* [guide]); 12, 12A, 12B, asterisks on changed lines, each
  revision dated on the title page (FilmDaft [practitioner]); a header with the version's date and time of day (AHRQ
  [guide]); the French découpage is "la division de chaque séquence du scénario en plusieurs plans ... valeur de plan,
  angle de prise de vue, mouvement éventuel" (Café des images [guide]).
- *For our films:* shots S1, S2 ... in film order, one shot = one G3 panel, never renumbered once the owner has read
  them (an insert is S4A, a cut stays as "S6 omitted"), so the owner's notes, the G3 board JSON and the hand-off name
  the same shots (`G3_ANIMATIC.md` §6: "each note maps to shot ids"). Each shot names its type (`LAYOUT.md` §2), size,
  angle and ONE move with G3's five values (move word, duration, start -> end, anchor, ease); no compound moves
  (`DIRECTION.md` rule 8).
- *Check:* IDs unique and unchanged between versions; every block has a type, size, angle and a move (HOLD and FLOAT
  count) with its five values; a dated revision line; changed blocks starred.

**5. Feature and TV story artists turn each script beat into visual action, and redo it many times while it is cheap.**
- *Who and why:* at Pixar story artists "study the script and map movement and camera angles"; "Every angle, every
  moment, how the lighting works, the things in the background - it isn't just random" (Christian Roman [studio]);
  "the script is really a jumping off point": Brad Bird's brief was "have the mouse fall in and almost get killed.
  Figure it out."; "storyboarding is story [re-boarding]", one scene redone 32 times (Josh Cooley, reported talk
  [studio]); TV writers give board artists "scriptlines", "story beats with some degree of specific jokes, dialogue,
  and shot suggestions sprinkled in", written "to make the storyboard artists' job easier" (Spencer Rothbell
  [practitioner]); a story artist's homework: "go through your script, identify what each line is trying to
  accomplish, and scribble that on the page" (a story artist's notes [practitioner]).
- *For our films:* the visual script is that pass done in words, for the G3 builder: each block carries its line's
  job (from `script_g1.md`) and the action that does it. A rewritten block costs minutes, a re-boarded G3 shot costs
  drawings (`G3_ANIMATIC.md` §5: "a dozen script drafts is normal, a dozen re-boards is not").
- *Check:* each block has a JOB line from `script_g1.md`; the critic either confirms "this picture does this line's
  job" or flags the block.

**6. Write only what the camera sees: one idea per row, concrete actions, left and right from the camera.**
- *Who and why:* "You need to provide enough detail so that a script reviewer (and your director) can understand the
  planned visuals. If you want someone to move a certain way, say how. If someone exits the frame, say so"; "Left/right
  directions are written from the camera's point of view"; "create many more boxes with one visual direction in each"
  (AHRQ [guide]); "'Character walks from left, stops at laptop' - not vague directions like 'show the product'"
  (Boords [practitioner]); "Each frame should represent a single step in the story ... draw the character looking, draw
  what they see, and then draw their reaction" (an Annie-winning TV board artist [practitioner]).
- *For our films:* present tense, active verbs, the beat's subject first (`DIRECTION.md` rule 2: one subject at a
  time), screen left/right from the camera, every entrance and exit said, a look-what-react chain split into steps, at
  most ~3 short sentences plus the key-action lines per block. The anti-pattern is v3's G3 camera plan: 8 columns, rows
  of up to 519 words, one cell of 189 words mixing pixels, moves and readability notes.
- *Check:* a lint flags a PICTURE field over ~60 words, a block with two subjects, and the vague verbs ("show", "we
  see", "depict", "visualise", "a visual of").

**7. The sound side holds only what is heard; words on screen and sound effects get their own labelled cues.**
- *Who and why:* the audio side "should include ONLY items to be spoken", effects marked there ("<knock>"), no editing
  instructions on it; "do not have your narrator read exactly what is seen on the screen" (AHRQ [guide]); video cues
  carry "Graphics (full screens and lower thirds)", audio cues "Music cues, Sound Effects (stingers)" (LibreTexts
  [guide]); V.O., SFX, VFX as labels (StudioBinder [practitioner]); the video column holds "Graphics and text overlays
  ... Visual transitions" (Celtx [practitioner]).
- *For our films:* three separate fields per block: VOICE (the locked words; they become the captions on their own,
  so they are never drawn again in the picture: the playbook's "never the same words twice on screen at once"), WORDS
  (every in-world word or number, verbatim, few and big, each readable at phone size or not drawn), SOUND (effects and
  music as cues on their anchor word, the opening's positive phone sound in the first second, `DIRECTION.md` rule 9;
  G7 makes them).
- *Check:* WORDS lists every in-world word with its size intent and time on screen; none repeats the caption on
  screen in the same second; every SOUND cue has an anchor; the opening has a cue before 1.0 s.

**8. Joins are written into the plan, not left to the edit.**
- *Who and why:* the A/V video column lists "Visual transitions" (Celtx [practitioner]); explainer scripts "Include
  notes on transitions" (Boords [practitioner]); board artists keep screen direction across cuts: "Once a character is
  established as moving left to right or right to left, keep that direction of movement" (Creative Bloq
  [practitioner]).
- *For our films:* every block ends with JOIN OUT: the carrier letter (A push-through, B thread match, C continuous
  camera, D carry or wipe, E card flip, F plain cut: at most 2, only on a "But"), the object that carries, the
  midpoint on the next sentence's first word (`CRAFT.md` §a), what leads and what holds still; where the voice leaves
  no pause (v4: "work?" into "A" at 29.56 s), the join lives inside one continuous move (C).
- *Check:* a JOIN OUT on every block but the last; at most 2 F, each on a "But" sentence; the midpoint equals the next
  first word's start; screen direction stated whenever something crosses a join.

**9. Show what the words name, while they name it, through the real mechanism.**
- *Who and why:* "the perfect correspondence between what you're seeing in these animations and what you're hearing
  tends to boost comprehension and retention", and data walked through "in a very physical way" (Joss Fong, Vox
  [studio]); for TED-Ed the studio worked with the educator "to ascertain the accuracy of certain images and go further
  explaining the lesson than just illustrating his words" (Buzzco [studio]); Kurzgesagt settles "the best visual
  metaphors and ideas for each scene in the sketching phase" before illustration [studio].
- *For our films:* each sentence's key word (v4: giant computers, really hot, FORTY kettles, big fans, WANTS, water in
  pipes, under the streets, your chatbot) is on screen, drawn literally, while it is said, as the real mechanism (the
  playbook: literal beats clever; the fact lock: the plant is a plan, so it is drawn as a plan); a metaphor only where
  the facts support it.
- *Check:* a reader marks each sentence's key word and the block line that shows it; a key word with no picture
  inside its time window is a fix; the claims shown are checked against `video/docs/v5/research/factlock.md`.

**10. Several concepts compete before one is written in full.**
- *Who and why:* "Advertising agencies and clients often ask many directors to pitch for a job, use director
  treatments to compare the options, and choose" (Robin Piree [practitioner]); a treatment must "take us through what
  happens in the commercial. The opening, the images" (No Film School [practitioner]); board artists draw small fast
  thumbnails ("I explored four possible solutions") and "select the thumbnail that best communicates the story point"
  (Creative Bloq [practitioner]); Pixar's story artists start from thumbnails (Christian Roman [studio]); a beat board
  is "a compilation of the juiciest, most crucial parts of the story", "a lot more concise" than a storyboard (80.lv on
  the Gnomon workshop [practitioner]).
- *For our films:* concepts A-C are one-page treatments: the idea in pictures in one sentence (Foster's outlines open
  with "The Concept" in one sentence [studio]), a beat board in words (5-7 key frames with times: frame 0, the payoff
  in words by ~2 s, the turn on "But", the one big move, the payoff, the loop), the join plan; judged on one list; only
  the winner is written as full blocks, with its grafts named.
- *Check:* each concept fits one page on one template; both judges score all three on the same criteria; the winner's
  key frames survive into its blocks.

**11. Sequence and look are separate gates: the written plan and the boards lay out events; the look is approved on
its own.**
- *Who and why:* "storyboards are more concerned with laying out the sequence of events, style frames delve into the
  nitty-gritty of the visual aspects of a scene ... tone, mood, color palette, and even the texturing" (Boords
  [practitioner]); an explainer studio boards in "black and white ... focus on the frames rather than details" and
  makes its full-colour key illustration as a separate step (Studio Pigeon [studio]); "Once we go through a gate - like
  the style frame phase - the intention is to never go back through that gate" (Giant Ant [studio]).
- *For our films:* the visual script decides content, staging, camera, timing, joins, words and sound cues, never
  palette, rendering, texture or line (the brief; the look is still being found and is approved at G4), so it stands
  while the style changes. Where a colour carries the story (cold water in, hot water out), name the meaning ("the
  water runs hot") and leave the hue to the look *(ours)*.
- *Check:* a grep of the visual script for style words (colour names, palette, texture, grain, outline, line weight,
  gradient, glow, shading) finds none; light appears only as story action ("the window lights").

**12. Review: read it in order at the real pace, to a reader with a blank slate; notes name problems; the director
decides; the sign-off is a gate.**
- *Who and why:* Pixar moved from walls of boards to reels so they can "step through and feed the images to the
  director one by one" (a wall makes you "get ahead of yourself"), and the test is to "sit as an audience member, with
  a clear objective and a blank slate, and understand what's going on" (Derek Thompson [studio]); story artists pitch
  by "acting out the scenes complete with dialogue", take the notes, "make another version, and pitch it again"
  (Christian Roman [studio]); DreamWorks artists "perform to show how the rhythm and visuals will fit in the completed
  film" (ACMI [guide]); the Braintrust "should have no authority. Our group could not tell the director what to do"
  (Ed Catmull [studio]); Foster's script notes asked "are the emotional beats there? Is the story being told not just
  through dialog but through the visuals as well? Does the overall pacing feel right", in "1 or 2, 3 at most" revisions
  (McCracken [studio]); read the script aloud and time it (StudioBinder [practitioner]; AHRQ [guide]); comments pinned
  to lines and a status colour per row (StudioBinder [practitioner]); "When your script is approved, create an
  explainer video storyboard" (Boords [practitioner]).
- *For our films:* (1) a read-along at 1x: the locked take plays while the blocks are read in order (text and audio
  only, so it is allowed before G3); (2) a cold reader who saw no concepts reads it once and writes what they picture
  every ~2-3 s, where their eye is and what carried each join; (3) a critic whose notes each cite a block ID and name a
  problem, not a fix; one batched fix round; (4) the owner, the director, decides; the sign-off locks the IDs and the
  times, and G3 plays the script.
- *Check:* `review_cold.md`'s retelling names the blocks' subjects in order; every critic note has a block ID; the
  header carries the owner's dated approval, and `docs/v4/OWNER_NOTES.md` the owner's words.

## The format we should use

**The file:** `docs/vN/visual/VISUAL_SCRIPT.md`, Markdown, in three parts: a header, the film at a glance, the shots.
It is the A/V row turned on its side for a phone *(ours)*: each block keeps the sound and the picture of one shot
together (finding 1), the at-a-glance table shows the whole film in order on one screen (finding 12), and the fixed
field order lets the G3 builder parse it.

**Part 1, the header** (at most 8 lines):
- the title; the version with its date and time ("v2, 2026-10-30 14:10"); the status: DRAFT, FOR OWNER, or LOCKED
  (the owner, with the date);
- the locked inputs: the take (`public/vN/voice_words.json`, its duration, its first word's time), the script
  (`script_g1.md`, its draft), the through-line card (`THROUGHLINE.md`);
- the idea in pictures, in ONE sentence;
- the counts: shots and their average length; joins by carrier letter (F at most 2); the one big move (shot and
  time); the thread's estimated screen time; the number of in-world words;
- since the last version: the starred blocks, one line each.

**Part 2, the film at a glance** (one phone screen, one row per shot):

| Shot | Time (s) | Voice starts | Picture (at most 12 words) | Join out |
|---|---|---|---|---|
| S1 | 0.00-4.28 | "Did you know ..." | (the subject, the place, the action) | C on "AI" |

**Part 3, the shots:** one block per shot, the fields always in this order (the VOICE line shows v4's real timing
convention; the angle-bracket fields are what the writer fills):

```
### S2 · 4.28-8.76 (4.48 s) · <type>, <size>, <angle> · <move>
JOB      <the line's job, from script_g1.md>
VOICE    "AI actually runs on giant computers, in buildings called data centers." (4.28-8.22; pause 0.54)
PICTURE  <the subject first; what the camera sees, present tense; left/right from the camera; at most 3 sentences>
         - on "giant" (t): <key action>
         - on "data" (t): <key action>
CAMERA   <MOVE> · <t1>-<t2> (<s>) · from <what fills the frame at the start> to <what fills it at the end>
         · anchor: <what holds still on screen> · ease: <in-out | in | out>
FRAME    <where the subject sits (read zone y 600-1250, axis x 380-700); what the edges cut; the caption band clear;
         the thread: on screen where, or its home spot>
WORDS    <each in-world word or number, verbatim, its size intent and when it is on screen> | none
SOUND    <cue> on "<word>" (t) | none
LIFE     <the 2-3 supporting movers, by tier>; Pip: <its hiding spot> (exterior shots) | none (closes, charts)
JOIN OUT -> S3 on "Those" (8.76): <letter and device>; <what carries>; <what leads, what holds still>
```

**Conventions:**
1. **Times:** seconds with two decimals, read from the locked file. A shot runs from its in-join to its out-join, and
   a join's midpoint is the next sentence's first word (`CRAFT.md` §a), so the shot boundaries are those words'
   starts; S1 starts at 0.00 (frame 0) and the last block ends on the loop. Frames, when G3 needs them, are s x 60.
2. **Anchors:** every key action is `on "word" (t)`, t that word's start; G3 leads it by ~0.1 s (`DIRECTION.md`
   rule 8). The opening block is the one written at sub-second detail: 0.00 (what is drawing), the first word, the
   payoff word, 3.0 s.
3. **IDs:** S1 ... Sn in film order; never renumbered after the owner's first read (S4A for an insert, "S6 omitted"
   for a cut); a changed block gets `*` in its header and a line in the header's "since the last version".
4. **Vocabulary** (fixed and short, like the anime storyboard's PAN, T.U., T.B.):
   - types: the names in `LAYOUT.md` §2 (HOME PLACE, STREET, CLOSE, CHART, SCALE S1 RISE-OVER, SCALE S5 PULL-BACK, the
     K frames, BREATHER S2/S3/S4, OPENING);
   - sizes: EXTREME WIDE, WIDE, MEDIUM, CLOSE, EXTREME CLOSE, INSERT;
   - angles: EYE LEVEL (the default), HIGH, LOW, OVERHEAD, POV;
   - moves: HOLD (locked), FLOAT (parallax float), PUSH IN, PULL BACK, PAN L/R, TILT UP/DOWN, TRUCK L/R, RISE, DROP:
     one per shot, no roll, no compound move, a zoom only as a visible story move or a carrier (`DIRECTION.md` rule 8);
   - joins: A PUSH-THROUGH, B THREAD MATCH, C CONTINUOUS CAMERA, D CARRY or WIPE, E CARD FLIP, F PLAIN CUT.
5. **Writing:** present tense, active verbs, never "we see"; the subject first; one idea per sentence; left/right
   from the camera; everyday words; numbers as digits.
6. **Style-neutral:** no colour, palette, texture, line or rendering words; a story colour named by its meaning
   ("runs hot"); light only as story action.
7. **One job per field:** VOICE only the locked words; WORDS only in-world text; SOUND only effects and music cues;
   staging in PICTURE and FRAME; the camera only in CAMERA.
8. **Size:** a PICTURE field at most ~60 words; one block fits one phone screen; ~10-12 blocks for a 40-45 s film; the
   opening block may run longer (its sub-second lines).
9. **Camera in words first:** the five values as framings ("from the lit window to the whole street"), times from the
   voice, the anchor and the ease; a scale number only where it decides the read. G3's camera plan
   (`G3_ANIMATIC.md` §5 step 2) adds the numbers, the tier map, the rig, the planes and the `life:` placeholders,
   one row per block *(ours)*.
10. **Open questions:** at most 3, at the end, each tied to a block ID, each one the owner's choice.

## The steps, in order

1. **The timing sheet** (a script, minutes): from `voice_words.json`, every sentence with its start and end, the pause
   before it, its stressed words (caps in the paste) and its first word (the candidate join); pauses under 0.3 s
   flagged (finding 3).
2. **Line jobs and must-sees** (the writer): for each sentence, its job (`script_g1.md`) and the one thing the viewer
   must see while it is said; the card's thread, home place, "you" and carriers carried over and re-timed to the take
   (findings 2, 5, 9).
3. **Concepts** (A, B, C): one-page treatments on one template: the idea in pictures in one sentence, a beat board in
   words (5-7 key frames with their times), the join plan, the one big move; style-neutral (findings 10, 11).
4. **Judging** (a story judge, a craft judge): all three on the same criteria; one pick, its grafts named.
5. **The découpage** (the writer): the winner written as full blocks in the format above, the at-a-glance table and
   the header counts (findings 1, 4, 6, 7, 8).
6. **The lint** (a script, once): the check under each finding: voice coverage, word-boundary times and anchors, IDs,
   five values, carriers (F at most 2, on a "But"), average shot >= 3.5 s and no three near-equal shots in a row, the
   thread's estimated coverage >= 80 % with no gap over 3 s outside the declared exceptions (`CRAFT.md` §a), the WORDS
   list, the style-word grep, the vocabulary.
7. **The read-along** (the writer, at 1x with the take): every picture lands on its word, every pause has a visual job
   or is a held breath on purpose, the first 3 s pass the playbook's hook rules (finding 12). If it is cheap, a page
   that plays the take and lights each block on its times lets the owner do the same (text and audio only; ours).
8. **The cold read** (a fresh agent who saw no concepts and no history): one read; what they picture every ~2-3 s,
   where their eye is, what carried each join, what confused them -> `review_cold.md`.
9. **The critic** (a fresh agent): notes with block IDs, problems not fixes, against the playbook, `DIRECTION.md`,
   `CRAFT.md` §a and `LAYOUT.md` -> `review_critic.md`; then ONE batched fix round and the lint once more; whatever is
   still amber is named for the owner, never a second internal loop (as at G3, `G3_ANIMATIC.md` §5 step 7).
10. **The owner:** the visual script (header, at a glance, blocks, at most 3 questions), with the read-along page if
    one was built; the owner's words go into `docs/v4/OWNER_NOTES.md` (and the playbook when general) the same turn;
    the sign-off is the lock, dated in the header.
11. **The hand-off to G3:** one block = one G3 panel; the camera plan adds the numbers, tiers, rig, planes and
    placeholders; the board lint cross-checks the blocks (moves, carriers, words, sound cues, life); a change to a
    locked block reopens the visual script explicitly (starred, dated), never silently inside the board (as G3's own
    lock works, `G3_ANIMATIC.md` §2 and §6).

## Sources (strength; what each supports)

A/V and short-form scripts
- AHRQ, "How To Write a Shooting Script for Video" (2024) [guide]: two columns, a third for animation instructions,
  detail a reviewer can picture, left/right from the camera, one direction per box, audio only what is heard, the
  versioned header, read it aloud. https://ahrq.gov/sites/default/files/wysiwyg/research/publications/pubcomguide/Shooting-Script-How-to.pdf
- Celtx, "What Is an AV Script?" [practitioner]: one synchronized moment per row, audio first for narration, time
  markers, sign-off. https://blog.celtx.com/essential-av-script-template-for-better-video-scripts/
- StudioBinder, "AV Script Template" [practitioner]: audio left, labels (V.O., SFX), timing by words, line comments,
  status colours. https://studiobinder.com/blog/av-script-template
- LibreTexts, Video Production Handbook I, 3.3 Multi-Column Scripts [guide]: three columns (time, video, audio) for
  short-form, documentary and web content. https://human.libretexts.org/Courses/City_College_of_San_Francisco/Video_Production_Handbook_I/03%3A_Scripting_and_Formats/3.03%3A_Multi-Column_Scripts
- Peter Thompson, "Template for documentary 2-column film/video scripts" (1989) [studio]: paper edits, a few sentences
  per cell. https://www.chicagomediaworks.com/2instructworks/3editing_doc/3docedit_scriptmpl/docs2col.doc
- Studio Pigeon, "Production Process 2022" [studio]: "VO Text | Picture Description", then a black and white board,
  the key illustration separate. https://studiopigeon.com/wp-content/uploads/2022/02/Pigeon_Production_Process_2022.pdf
- Boords, explainer script template [practitioner]: Scene | Audio | Visual with running time per scene, concrete
  visuals, notes on transitions, the storyboard after approval. https://boords.com/video-script-template/explainer
- Boords, "Turning a script into a storyboard" [practitioner]: one frame per scene, Label, Action, Dialogue, Sound.
  https://boords.com/docs/script-to-storyboard
- Boords, "What are style frames" [practitioner]: storyboards lay out the sequence; style frames the tone, palette,
  texture. https://boords.com/blog/what-are-style-frames-definition-and-examples
- Frame.io, text-based editing in Premiere (2023) [practitioner]: the radio edit first, timecoded review comments.
  https://blog.frame.io/2023/10/16/premiere-pro-text-based-editing/
- JEA, "Video explainers engage readers" (2016) [practitioner, *weak*]: a teacher's two-column plan; not Vox's own
  format (no first-hand source for Vox's internal format was found). https://jea.org/digital-media/video-explainers-engage-readers/

Live action: shot lists, shooting scripts, découpage
- StudioBinder, "The Only Shot List Template You Need" [practitioner]: the core fields, "low-med-high", the movement
  vocabulary. https://www.studiobinder.com/blog/shot-list-template/
- Wikipedia, "Shooting script" [guide, *weak*]: numbers on approval, shots numbered, locked pages, 45A, OMITTED.
  https://en.wikipedia.org/wiki/Shooting_script
- FilmDaft, "Script Revision Colors Explained" [practitioner]: A-pages, asterisks, the dated revision list.
  https://filmdaft.com/script-revision-colors-explained-blue-pages-a-pages-and-revision-marks/
- Café des images, "Lexique du montage" [guide]: the découpage (size, angle, move per shot; a storyboard completes or
  replaces it). https://cafedesimages.fr/wp-content/uploads/2022/07/lexique-du-montage.pdf
- Cinéma parlant, glossary [guide]: the découpage as the written document with every technical indication.
  https://www.cinemaparlant.com/fichesactivites/ft_glossaire.pdf
- Robin Piree, "How to write a director's treatment for a TV commercial" [practitioner]: agencies compare several
  directors' treatments. https://robinpiree.com/blog/how-to-write-a-directors-treatment-for-a-tv-commercial
- No Film School, "How to Write a Commercial Treatment" (2024) [practitioner]: a treatment walks through the opening
  and the images. https://nofilmschool.com/commercial-treatment

Animation: features, TV, anime
- Derek Thompson (Pixar story artist), "The Storyboards of WALL-E", Rotten Tomatoes [studio]: step through one by one,
  the blank-slate audience test. https://editorial.rottentomatoes.com/article/exclusive-the-storyboards-of-walle/
- Christian Roman (Pixar story artist), "Sketchy Characters", Bostonia [studio]: study the script, map movement and
  camera angles, thumbnails, the pitch, notes, the reel with rough voices. https://bu.edu/bostonia/summer14/pixar/
- Josh Cooley (Pixar), talk reported by Silicon Prairie News [studio]: the script as a jumping off point, re-boarding.
  https://siliconprairienews.com/?p=1324
- Ed Catmull on the Braintrust, First Round Review [studio]: notes with no authority; the director decides.
  https://review.firstround.com/Spark-Creativity-with-These-Tips-from-Pixars-President
- ACMI, "Shrek storyboard pitch" (DreamWorks) [guide]: the pitch performs rhythm and visuals.
  https://www.acmi.net.au/works/100626--shrek-storyboard-pitch/
- Animation Obsessive, "Writing 'Foster's Home for Imaginary Friends'" (2023), quoting McCracken's and Faust's
  production blog [studio]: index cards, the one-sentence concept, script notes, 1-3 revisions, recording before
  boards. https://animationobsessive.substack.com/p/writing-fosters-home-for-imaginary
- Spencer Rothbell (Clarence writer), "Advice for animation writers" [practitioner]: board-driven, script-driven, the
  scriptline. https://www.srothbell.com/blog/2020/6/24/advice-for-animation-writers
- Creative Bloq, "17 expert storyboard tips for TV animation" [practitioner]: one step per frame, pauses, thumbnails,
  director review, screen direction. https://www.creativebloq.com/advice/storyboard-tips
- Story Notes, "The wrong way to make a storyboard sequence" (2025) [practitioner]: a line's job, point of view.
  https://storyfieldnotes.substack.com/p/the-wrong-way-to-make-a-storyboard
- The Gnomon Workshop, "Creating Beatboards for Pre-Production" [practitioner]: beat boards from a script before full
  boards. https://www.thegnomonworkshop.com/tutorials/creating-beatboards-for-pre-production ; 80.lv on the same
  workshop [practitioner]: https://80.lv/articles/learning-to-create-beatbords-for-pre-production-in-226-minutes
- Neil Gaiman, "On leaks and buttons" (2006), on Laika's Coraline [studio]: voices recorded, story reels for the
  timing of each shot, no coverage. https://journal.neilgaiman.com/2006/12/on-leaks-and-buttons.html
- Foundry, "LAIKA picks Flix" (2015) [studio]: the head of story manages the flow of boards to editorial.
  https://www.foundry.com/news-awards/laika-picks-flix
- Toon Boom, Storyboard Pro 24, "About Caption Fields" [guide]: Dialogue, Action Notes, Slugging, Notes per panel.
  https://docs.toonboom.com/help/storyboard-pro-24/storyboard/caption/about-default-panel-caption.html
- Animétudes, "Atom through its storyboards" (2023) [practitioner]: the anime storyboard's five columns, its short
  camera words, "instruments of communication". https://animetudes.com/2023/04/13/atom-storyboards/
- Brian Lemay, "Slugging the Sheets" [practitioner]: the track broken down by frame, then the director marks the
  action. https://brianlemay.com/Pages/animationschool/animation/lipsyncbook/slugging.html
- Animation Resources, "Musical Timing Rediscovered" [guide]: bar sheets, a film planned to the frame before drawing.
  https://animationresources.org/technique-musical-timing-rediscovered
- Wikipedia, "Traditional animation" and "Exposure sheet" [guide, *weak*]: the x-sheet's frame-by-frame columns, bar
  sheets. https://en.wikipedia.org/wiki/Traditional_animation ; https://en.wikipedia.org/wiki/Exposure_sheet
- Wikipedia, "Leica reel" [guide, *weak*]: the story reel made after the voices are recorded.
  https://en.wikipedia.org/wiki/Leica_reel

Motion design and explainer studios
- Kurzgesagt, "Our video process" [studio]: visual metaphors per scene in a sketch phase; the voiceover times the
  animation. https://kurzgesagt.org/youtube/
- Communication Arts, "Giant Ant" [studio]: gates the project never goes back through, client approvals per phase.
  https://commarts.com/features/giant-ant
- Kate Messner, "The making of a TED-Ed video" [studio]: script revisions, the animator's storyboard, the narration
  approved, then the animation. https://katemessner.com/the-making-of-a-ted-ed-video/
- Buzzco, "Sex Determination" (TED-Ed) [studio]: a 4-day board/animatic; images checked with the educator, beyond
  illustrating the words. https://buzzco.nyc/sex-determination/
- Video Consortium, "Episode 1: Joss Fong" (Vox) [studio]: seeing and hearing in correspondence; data shown physically.
  https://videoconsortium.org/mag/episode-1-joss-fong
- Buck and Oddfellows: no first-hand account of their written pre-board step was reachable (their spotlight pages
  returned 403); the earlier lane's Buck note (a rough 3D pass "for exact timing" before design) stands in
  `docs/look/research/animatic_mograph.md` §2.
