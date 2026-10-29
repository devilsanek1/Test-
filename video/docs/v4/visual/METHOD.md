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
"découpage", TV animation's "scriptline", the story artist's beat pass), and all share one shape: the locked sound,
what the camera sees beside it, one numbered row per shot with its time, the joins written in, read in order at the
real pace, signed off before anyone draws (F1-F4, F8, F12). It is the cheap place to get the story in pictures right:
a rewritten block costs minutes, a re-boarded G3 shot costs drawings (`G3_ANIMATIC.md` §5). It is style-neutral: it
decides content, staging, camera, timing, joins, words and sound, never palette, rendering, texture or line, so it
stands while the look is still being found (F11).

## The format
`docs/vN/visual/VISUAL_SCRIPT.md`, four parts, top to bottom:
1. **Header** (at most 6 lines): the version with its date and time; the status (DRAFT, FOR OWNER, LOCKED with the
   owner's date); the inputs (the take `public/vN/voice_words.json` and its length, the script draft, the card); the
   idea in pictures in ONE sentence; the counts (shots and their average length, joins per carrier letter, the one
   big move, the thread's share of the runtime, the words in the picture); the starred shots since the last version.
2. **At a glance:** one line per shot: `S2 · 4.28-8.76 · <the subject and its action, at most 12 words> · C`.
3. **The shots:** one block per shot, the fields always in this order (angle brackets are the writer's; v4's S2 times):

> **S2 · 4.28-8.76 s (4.48 s)**
> - **Voice:** "AI actually runs on giant computers, in buildings called data centers." (4.28-8.22)
> - **Screen:** <the subject first, where it is, what happens; present tense; left and right as the camera sees
>   them; every entrance and exit said; at most 3 short sentences> · on "giant" (5.68): <key action> · on "data"
>   (7.56): <key action>
> - **Camera:** <size> · <angle> · <ONE move> from "<word>" (t) to "<word>" (t): from <what fills the frame> to <what
>   fills it> (holding <what stays put>, when it matters) · why: <its reason, in a few words>
> - **Thread:** <where the thread object is and what it does; or its home spot>
> - **Words:** <each in-world word or number, verbatim, on its object, from "<word>" to "<word>"> | none
> - **Sound:** <the cue> on "<word>" (t) | none
> - **Join:** -> S3 on "Those" (8.76): <carrier letter and device>; <what carries, what leads>
> - **Notes:** job: <the line's job, from the script doc's beat table>; life: <2-3 small, calm movers>; Pip: <its
>   hiding spot, exterior shots only>

4. **Open questions:** at most 3, each on a shot id, each the owner's choice.

**Conventions.** *Time:* seconds with two decimals from the take's word times, never the card's estimates (v4's drifted
by up to ~1.8 s). A shot runs from join to join and a join's midpoint is the next sentence's first word (`CRAFT.md` §a),
so every boundary is a word's start; S1 starts at 0.00 (frame 0) and the last shot ends on the loop. A key action is
`on "word" (t)`, t that word's start (G3 leads it by ~0.1 s). *A shot* is one G3 panel and one idea: usually one
sentence; two short ones may share a shot, a long one may split on a stressed word inside one continuous move; shots
average at least 3.5 s (~10-12 for 40 s). *Ids:* S1 ... Sn in film order, never renumbered after the owner's first read
(S4A for an insert, "S6 omitted" for a cut); a changed block is starred. *Camera words:* sizes extreme wide, wide,
medium, close, insert; angles eye level (the default), high, low, overhead, POV; moves hold, float, push in, pull back,
pan, tilt, slide, follow, rise, drop; ONE move a shot, never two at once (a second move is the next shot, joined by
C); the ease is in and out unless said; the shot type from `LAYOUT.md` §2 where one fits. *Joins:* A push-through, B
thread match, C continuous camera, D carry or wipe, E card flip, F plain cut (`CRAFT.md` §a). *Plain words:* active
verbs, never "we see" or "show"; numbers as digits; Screen at most ~60 words. *Style-neutral:* no colour, texture,
line or rendering words; a colour that carries the story is named by its meaning ("the water runs hot"); light only
as an action ("the window lights").

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
   join) and its stressed words (caps in the paste); pauses under 0.3 s flagged (v4: none before "A" at 29.56 s, so
   that join lives inside one continuous move; v4's sheet is `research_craft.md`'s join table).
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
   Screen, Camera, Words and Join, it tells shot by shot what the film says; then with the Voice, one block at a time
   and never ahead: every ~2-3 s what it pictures, where its eye is, what carried each join, what confused it.
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
- every boundary and anchor is a word's start (±0.01 s); shots average at least 3.5 s, no three near-equal in a row;
- a carrier on every join; at most 2 F, each on a "But", with the thread on both sides and a change of size or angle;
- the thread on screen at least 80 % of the runtime, no gap over 3 s (the declared scale reveal aside);
- a grep finds no style words (colour names, palette, hue, texture, grain, outline, line weight, ink, pencil,
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
  still; the end loops to frame 0 (C7).
- **Shot lengths fit the voice:** each picture holds while its words are said; a long shot adds one story event every
  ~1-2 s on its stressed words; the camera comes to rest at the turn and the payoff (C6, C12).
- **The flow keeps one screen direction** (the camera may travel upstream, the thread never runs back), and every move
  has a reason, none a whip (C1, C4).
- **Words in the picture are few and big,** on their object, never the caption's words at the same time (`LAYOUT.md`
  §3, C10); every sound cue sits on a story event.
- **Nothing outside the fact file** (`docs/vN/research/factlock.md`; v4's is `docs/v5/research/factlock.md`): every
  claim, number and name the picture shows is in it (v4: the plant drawn as a plan, never a finished building; no
  company names or logos).

## What the G3 animatic takes from it
One block = one G3 panel, under the same id. The times are its cut points and anchors (x 60 for frames); Screen's key
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
Status: IN PROGRESS.
