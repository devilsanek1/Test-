# How we write a visual script (the method, 2026-10-29)

**Status:** DONE (2026-10-29). The step between the voice lock (G2) and the G3 animatic, for v4 and every video after
it. Built from `research_formats.md` (F1-F12) and `research_craft.md` (C1-C12). Rank: a gate spec, beside
`docs/G3_ANIMATIC.md`: the owner's words, `DIRECTION.md`, `CRAFT.md` and `PIPELINE_V2.md` win where it differs.

## Why this step exists
The owner, on locking v4's voice (2026-10-29): "We are still iterating on the style tho. Instead brainstorm a story and
like a visual script with what happens on the screen and camera movements and etc / Again research his professional
studios go through this step". So before anything is drawn, the film's visual story is written in words, shot by shot,
on the locked take's clock: a few concepts brainstormed and judged, then ONE script for the owner. Every narrated-film
trade has this step under its own name (the two-column audio-and-picture script, the shot list, the French
"découpage", TV animation's "scriptline", the feature story artist's thumbnails), and all share one shape: the locked
sound, what the camera sees beside it, one numbered row per shot with its time, the joins written in, read in order at
the real pace, signed off before anyone draws (F1-F4, F8, F12). It is the cheap place to get the story in pictures
right: a rewritten block costs minutes, a re-boarded G3 shot costs drawings (F5; `G3_ANIMATIC.md` §5). And it is
style-neutral: it decides content, staging, camera, timing, joins, words and sound, never palette, rendering, texture
or line, so it stands while the look is still being found (F11).

## The format
`docs/vN/visual/VISUAL_SCRIPT.md`, four parts, top to bottom:
1. **Header** (at most 6 lines): the version with its date and time; the status (DRAFT, FOR OWNER, LOCKED with the
   owner's date); the inputs (the take `public/vN/voice_words.json` and its length, the script draft, the card); the
   idea in pictures in ONE sentence; the counts (shots and their average length, joins per carrier letter, the one
   big move, the thread's share of the runtime, the words in the picture); the starred shots since the last version.
2. **At a glance:** one line per shot: S2 · 4.28-8.76 · [the subject and its action, at most 12 words] · C
3. **The shots:** one block per shot, the fields always in this order (the writer fills the square brackets; the times
   are v4's second sentence):

> **S2 · 4.28-8.76 s (4.48 s)**
> - **Voice:** "AI actually runs on giant computers, in buildings called data centers." (4.28-8.22)
> - **Screen:** [the subject first, where it is, what happens; present tense; left and right as the camera sees
>   them; every entrance and exit said; at most 3 short sentences] · on "giant" (5.68): [key action] · on "data"
>   (7.56): [key action]
> - **Camera:** [size] · [angle] · [ONE move] from "[word]" (t) to "[word]" (t): from [what fills the frame] to [what
>   fills it] (holding [what stays put], when it matters) · why: [its reason, in a few words]
> - **Thread:** [where the thread object is and what it does; or its home spot]
> - **Words:** [each in-world word or number, verbatim, on its object, from "[word]" to "[word]"] | none
> - **Sound:** [the cue] on "[word]" (t) | none
> - **Join:** -> S3 on "Those" (8.76): [carrier letter and device]; [what carries, what leads]
> - **Notes:** job: [the line's job, from the script doc's beat table]; life: [2-3 small, calm movers]; Pip: [its
>   hiding spot, exterior shots only]

4. **Open questions:** at most 3, each on a shot id, each the owner's choice.

**Conventions:**
- **Time:** seconds with two decimals from the take's word times, never the card's estimates (v4's drifted by up to
  ~1.8 s). A shot runs from join to join, and a join's midpoint is the next sentence's first word (`CRAFT.md` §a; a
  split inside a sentence sits on its stressed word, as a C join inside one continuous move), so every boundary is a
  word's start: S1 starts at 0.00 (frame 0), the last shot ends at the take's end, on the loop. A key action is on
  "word" (t), t that word's start (G3 leads it by ~0.1 s).
- **A shot** is one G3 panel and one idea: usually one sentence; two short ones may share a shot, a long one may split
  on a stressed word inside one continuous move. Shots average at least 3.5 s (~10-12 for 40 s).
- **Ids:** S1 ... Sn in film order, never renumbered after the owner's first read (S4A for an insert, "S6 omitted" for
  a cut); a changed block is starred.
- **Camera words:** sizes extreme wide, wide, medium, close, insert; angles eye level (the default), high, low,
  overhead, POV; moves hold, float, push in, pull back, pan, tilt, slide, follow, rise, drop. ONE move per shot, never
  two at once (a second move is the next shot, joined by C); the ease is in and out unless said; the shot type from
  `LAYOUT.md` §2 where one fits.
- **Joins:** A push-through, B thread match, C continuous camera, D carry or wipe, E card flip, F plain cut (`CRAFT.md`
  §a).
- **Plain words:** active verbs, never "we see" or "show"; numbers as digits; Screen at most ~60 words.
- **Style-neutral:** no colour, texture, line or rendering words; a colour that carries the story is named by its
  meaning ("the water runs hot"); light only as an action ("the window lights").

## How it reads on a phone
The owner reads it in the phone app. The at-a-glance lines come first (the whole film on one or two screens), then one
block per shot, never a wide table; no code blocks (they don't wrap); bold labels at the start of short lines, so the
eye can jump to every **Camera** or **Join**; one block per phone screen (~120 words; the opening may run longer); no
px or frame numbers (those are G3's). When it is cheap, a private claude.ai page plays the take and lights each block
on its times, so the owner reads along at 1x (text and audio, allowed before G3; `scripts/voice/take_page.py` is the
model: attachments don't play in the phone app).

## The steps
Every agent writes its file from its first step, reports in at most 3 lines and runs at max effort.
0. **Timing sheet** (a short script, minutes): each sentence's start, end, the pause before it, its first word (the
   join) and its stressed words (caps in the paste); pauses under 0.3 s flagged (v4: "A" follows "work?" with no pause
   at 29.56 s, so that join lives inside one continuous move; v4's sheet is `research_craft.md`'s join table).
1. **Concepts** (3 agents in parallel, blind to each other; `concepts/A.md`-`C.md`): one page each on one template:
   the idea in pictures in one sentence; a beat board in words, 5-7 key frames with times (frame 0, the payoff in
   words by ~2 s, the turn, the one big move, the payoff, the loop); the join plan; the card's thread, home place and
   "you" kept, any departure from the card named (F10).
2. **Judge** (a story judge and a craft judge; `judge_story.md`, `judge_craft.md`): all three scored on one list, the
   checks below plus the owner's taste (a banger opening, one flowing story, a scale moment that feels great); one
   pick, its grafts from the others named; where they split, the story verdict leads.
3. **Write** (one writer; `VISUAL_SCRIPT.md`): the pick in the four parts; the mechanical checks; then a walk of the
   blocks against the timing sheet at the take's pace (each picture on its word; each pause has a job, or is a breath
   held on purpose).
4. **Cold read** (a fresh agent that saw no concepts, card or notes; `review_cold.md`): first sound off, reading only
   Screen, Camera, Thread, Words and Join, it tells shot by shot what the film says; then with the Voice (never the
   Notes), one block at a time and never ahead: every ~2-3 s what it pictures, where its eye is, what carried each
   join, what confused it.
5. **Critic** (a fresh agent; `review_critic.md`): the checks below, against the playbook, `DIRECTION.md`, `CRAFT.md`
   §a, `LAYOUT.md`, `CINEMATIC_GUIDE.md`, the fact file and what G3 can play, and whether each picture does its line's
   job; each note on a shot id, a problem, not a fix; the check failures plus at most 6 others.
6. **Fix** (the writer, resumed): one batched round, the checks rerun, changed blocks starred; what stays amber goes
   to the owner named, never a second internal loop (as at G3).
7. **The owner:** the visual script (and the read-along page, if built), its stage said ("the visual story in words;
   the look comes at G4; next, G3 plays it as a moving sketch"), at most 3 questions. The owner's words go into
   `docs/vN/OWNER_NOTES.md` (the playbook when general) the same turn; the approval locks the ids, times and joins,
   dated in the header.

## The checks
**Mechanical** (the writer, by a short script on the take's word times or by hand):
- the Voice fields joined in order are the take's words exactly: none missing, none added;
- every boundary and anchor is a word's start (±0.01 s; 0.00 and the take's end aside); shots average at least 3.5 s,
  no three near-equal in a row;
- a carrier on every join; at most 2 F, each on a "But", with the thread on both sides and a change of size or angle;
- the thread on screen at least 80 % of the runtime, no gap over 3 s (a declared scale reveal or fairness stretch
  aside: `CRAFT.md` §a.1);
- a grep finds no style words (colour names, pale, palette, hue, texture, grain, outline, line weight, ink, pencil,
  gradient, glow, shading).

**Read** (the cold reader and the critic):
- **Every spoken line has a picture that shows it literally, sound off:** each sentence's key word is on screen while
  it is said, as the real thing and its real mechanism; a picture metaphor only where the voice says it; nothing
  changes state without a word that explains it (F9, C5).
- **One subject at a time:** each shot names one subject first; one home place plus at most one comparison or scale
  shot, and one big move; every close is entered from a view that showed where it is (C9).
- **The first 3 s per the playbook:** frame 0 is the scene being drawn on, as a bold event; the voice from the first
  frames; the hook made physical (the expected thing, then reality overtaking it at ~2 s); the payoff in words by
  ~2 s, the pictures in the voice's order; a positive phone sound in the first second; one continuous shot, never
  still, something new every few frames from the subject's own build; the end loops to frame 0 (C7).
- **Shot lengths fit the voice:** each picture holds while its words are said; a long shot adds one story event every
  ~1-2 s on its stressed words; the camera comes to rest at the turn and the payoff (C6, C12).
- **Whatever flows keeps one screen direction** (the camera may travel upstream; the flow never runs back), and every
  move has a reason, none a whip (C1, C4).
- **Words in the picture are few and big,** on their object, never the caption's words at the same time (`LAYOUT.md`
  §3, C10); every sound cue sits on a story event.
- **Nothing outside the fact file** (`docs/vN/research/factlock.md`; v4's is `docs/v5/research/factlock.md`): every
  claim, number and name the picture shows is in it (v4: the plant drawn as a plan, never a finished building; no
  company names or logos).

## What the G3 animatic takes from it
One block = one G3 panel, under the same id. The times are its cut points and anchors (frames = s x 60); Screen's key
actions are its pose pops and draw-ons; Camera gives the five values in words (move word, duration, start and end,
what holds still, ease: `G3_ANIMATIC.md` §4); Join is the transition's `device` and `carrier`; Thread is the thread's
path and home spot; Words are its in-world text; Notes' life and Pip are its `life:` items and hiding spots; the
opening's sound plays in the reel (anti-waste rule 7), the rest are G7's cue list. G3's camera plan
(`docs/vN/camera_plan_g3.md`, one row per block) adds only what words can't fix: the numbers (offsets, scale %, px),
the tier map, the rig, the planes, the promise lines. G3 restages nothing: a change to a locked block reopens the
visual script, starred and dated and named in G3's hand-off, never silently inside the board (as G3's own lock works,
`G3_ANIMATIC.md` §2, §6).

**Sources** (each with its strength; all the others are in the two research files): the A/V script, AHRQ [guide]
https://ahrq.gov/sites/default/files/wysiwyg/research/publications/pubcomguide/Shooting-Script-How-to.pdf · the
découpage, Café des images [guide] https://cafedesimages.fr/wp-content/uploads/2022/07/lexique-du-montage.pdf · the
scriptline, Spencer Rothbell [practitioner] https://www.srothbell.com/blog/2020/6/24/advice-for-animation-writers ·
the voice times the animation, Kurzgesagt [studio] https://kurzgesagt.org/youtube/ · step through in order with a blank
slate, Derek Thompson of Pixar [studio] https://editorial.rottentomatoes.com/article/exclusive-the-storyboards-of-walle/
· a gate is never gone back through, Giant Ant [studio] https://commarts.com/features/giant-ant

## Doc changes needed
For the orchestrator to apply and commit (this agent edits no other doc). Each OLD string occurs exactly once.

**`PIPELINE_V2.md`, the gates table: a new row after the W1 row, right before G3** (exact text):
```
| **G2.5 Visual script** (owner, 2026-10-29: "brainstorm a story and like a visual script with what happens on the screen and camera movements and etc") | **the film's visual story in words** (`docs/vN/visual/VISUAL_SCRIPT.md`; the format, steps and checks: `docs/v4/visual/METHOD.md`, researched from how studios do this step): shot by shot on the locked take's word times (`public/vN/voice_words.json`), a one-line-per-shot overview, then one block per shot that reads on a phone: its time in and out, the words spoken, what is on screen, the camera (size, angle, ONE move with its start and end), the thread, the words in the picture, the sound cues, the join into the next shot with its carrier (`docs/look/CRAFT.md` §a); style-neutral (content, staging, camera, timing, joins, words and sound; never palette, rendering, texture or line), so it stands while the look is still being found; 3 visual concepts judged internally first, the owner reads one (one-version rule) with at most 3 open questions; text and audio only, no MP4 (a read-along page that plays the take beside the blocks, when cheap) | the visual story: the shots, what each one shows, the camera, every join and its carrier, the words in the picture, the sound cues | the shot ids, their times, pictures, camera moves and joins: G3 plays them, one block = one panel (a change to a locked shot reopens the visual script, starred and dated) | 3 concept writers + 2 judges (story, craft), 1 writer, 1 cold reader (sound off, then on), 1 critic, 1 fix pass; ~2-3 h on the clock (an estimate, measured on v4) |
```

**`PIPELINE_V2.md`, the edits that keep it coherent** (OLD -> NEW):
```
1. OLD: ## The loop: gates G0-G8 (with G0.5, the core line, and W1, the world bible)
   NEW: ## The loop: gates G0-G8 (with G0.5, the core line, W1, the world bible, and G2.5, the visual script)
2. OLD: G0-G2 are text and audio only
   NEW: G0-G2.5 are text and audio only
3. (W1 row) OLD: tiers A/B/C per shot (`CRAFT.md` §b)
   NEW: tiers A/B/C per shot (`CRAFT.md` §b; keyed to the visual script's shot ids once G2.5 locks)
4. (G3 row) OLD: timed to the locked voice (visual concepts judged internally; owner rule: one version)
   NEW: timed to the locked voice and played from the locked visual script (G2.5: one block = one panel, with its
        times, camera, join and carrier; the visual concepts are judged there; owner rule: one version)
5. OLD: Target: the first playable cut (the G3 reel) about 3 h after the voice lock
   NEW: Target: the visual script about 2-3 h after the voice lock (an estimate), the first playable cut (the G3 reel)
        about 3 h after its lock
6. (Creative exploration) OLD: - **G3 animatic:** 2-3 visual concepts for the whole film, judged internally; the owner
        sees one animatic (one-version rule).
   NEW: - **G2.5 visual script (owner, 2026-10-29):** 3 visual concepts for the whole film (one page each,
        style-neutral), judged internally by a story judge and a craft judge; the pick is written as the one visual
        script the owner reads, after a sound-off and sound-on cold read, a critic and one fix pass
        (`docs/v4/visual/METHOD.md`).
        - **G3 animatic:** plays the locked visual script, one block = one panel (the thumbnail variants per beat stay
        G3's: `G3_ANIMATIC.md` §5); the owner sees one animatic (one-version rule).
7. OLD: G3 and G4 are divergent stages (a few concepts, judged together)
   NEW: G2.5 and G4 are divergent stages (a few concepts, judged together; G3 plays G2.5's pick)
8. (anti-waste rule 1) OLD: G3's sound-off and sound-on reads, G5's first-set read
   NEW: G2.5's and G3's sound-off and sound-on reads, G5's first-set read
9. (anti-waste rule 7; the OLD text wraps after "opening") OLD: G3 decides its picture (the one opening shot: concepts
        judged internally, the owner sees one).
   NEW: G2.5 writes its picture (the one opening shot, at sub-second detail: concepts judged internally, the owner
        reads one), and G3 plays it.
10. (studio toolkit, the G3 animatic row) OLD: 3 visual concepts, judges, storyboard artist writes the animatic JSON;
    NEW: the storyboard artist writes the animatic JSON from the locked visual script (the concepts are G2.5's);
11. (studio toolkit, a new row after "| G2 sound |"):
    | G2.5 visual script | `docs/v4/visual/METHOD.md` (format, steps, checks); v4's run in `docs/v4/visual/` (research, concepts, judges, the visual script, the reviews) as the template | 3 concepts, 2 judges, the visual script (an overview, then one block per shot), the mechanical checks, the sound-off and sound-on cold read, the critic, one fix pass |
```

**Other docs** (same commit):
- `G3_ANIMATIC.md` §5: "With script + voice locked (word timings = the clock), the through-line card approved with the
  script and the W1 world ..." gains "and the visual script locked (G2.5)"; step 1 "**Story/beat pass**" becomes
  "**From the visual script** (~10 min, orchestrator): one panel per locked block, with its cut words, key actions,
  moves, joins, carriers and each scene's metaphor, already locked in text; a change reopens the visual script
  (starred, dated)"; step 2's camera plan is "one row per visual-script block, adding only the numbers (offsets, scale
  %, px), the tier map, the rig, the planes, the `life:` list and the promise line".
- `DIRECTION.md`: the ladder's "`docs/G3_ANIMATIC.md`, `docs/G5_BLOCKING.md` (gate specs)" names this page too; "The
  approved pipeline" gains "-> G2.5 the visual script (the visual story in words, shot by shot on the take's clock,
  style-neutral; the owner reads one)" after G2.
- `CLAUDE.md`, after "From the sketch animatic (G3) on, show one playable video per gate, ...": "Between the voice
  lock and G3, the film's visual story is written as a VISUAL SCRIPT (G2.5: shot by shot on the take's word times,
  the camera and every join, style-neutral; 3 concepts judged internally, the owner reads one;
  `docs/v4/visual/METHOD.md`), and G3 plays it." `HANDOFF.md`: the same step in its queue.
- This page is generic: once the owner approves v4's visual script, it may move to `docs/VISUAL_SCRIPT_METHOD.md`
  (beside `G3_ANIMATIC.md`), with the pointers above updated.
