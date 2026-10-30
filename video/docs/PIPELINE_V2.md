# Production pipeline v2 (for video 2 onwards)

> **The pipeline after v3 (owner APPROVED, 2026-10-27: "Yes"; why and evidence: `docs/retro/2026-10-27_v3_retro.md`):** a DESIGNED sketch. A through-line card with the core line and the script (G0.5/G1), a text world bible beside the script (W1), a G3 that decides the flow, the focus and the light (not just the story), a playable G4 look clip approved before the G5 lanes, G5 lanes per sequence that fill what G3 decided (no new places, movers or tier promotions), life checked by tiers at G6, `docs/look/CRAFT.md`'s thresholds as lint numbers (anti-waste rule 6) and a craft tooling lane that lands before the next video's G3 (below). The craft target, in force, is `CRAFT.md`; the look and storytelling direction is `docs/look/DIRECTION.md` (read it before any visual work).
>
> **Which doc wins:** owner's words (playbook; vN/OWNER_NOTES) > DIRECTION > CRAFT > PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > look/*.md > the film's STYLE.md (values only) > v1-era docs (API and measurements, never style); the owner's words are what the owner said, never our "-> what we did" log; in full, with the topic docs and the tie-breaks: DIRECTION's intro. A clash is a bug: fix the lower doc in the same turn.

Why: on video 1 the owner first saw a playable film **18.7 h** in. Before that there were only stills, so they could not
steer. Story problems (S08's peak, S10's readability, the weak hook) surfaced during polish, where every change costs
a full scene round. Background research: `docs/PIPELINE_RESEARCH.md`.

## What video 1 actually cost (measured from the agent logs)

| | |
|---|---|
| Agents run | 442 |
| Agent input tokens | 12.5 B (98 % cache re-reads); output 66 M |
| Orchestrator input / output / turns | 0.83 B / 2.0 M / 1,922 |
| Fix agents: share of input | **40 %** (108 agents, avg 163 turns, 46 M input each) |
| Review agents: share of input | **28 %** (220 agents, 4,272 rendered images viewed, about 19 per review) |
| Scene builds | 18 % (31 agents, avg 210 turns) |
| Review/fix rounds per scene | 12-25 reviews, 5-11 fixes (S08: 25 / 9 / 985 M tokens, still shipped at 7/10) |
| Reviews that still found a blocker/major | 141 of 173: polish never converged |
| Agents lost to usage limits / kills | 66 (388 M tokens of work lost or redone) |
| Docs read into agent contexts | 5 MB (cheap; not the problem) |

**The cost driver is long, image-heavy agent sessions repeated on finished-looking scenes.** Every turn re-reads the
whole context, and every rendered frame an agent looks at stays in that context. Reading docs was a minor cost.

## THE LOOP NOW (owner, 2026-10-30: loose, imaginative, frames whole; it wins where the gates below differ)

The owner's three rules lead (playbook, THE THREE RULES ABOVE ALL): every frame worth pausing on; readable imaginative
ideas; frames planned and created whole from the get-go, never filled for density later. Pictures before documents.
1. **Script and voice** (G0-G2, as below).
2. **The visual script, short** (G2.5): the shots on the take's clock with the camera and the joins; it stays the
   timing's and the camera's contract, never a substitute for pictures.
3. **IDEAS:** for every beat, a few imaginative, readable picture ideas drawn as whole-frame thumbnails (the idea, the
   world, the light, the people, the words in one picture); the best picked per beat (the owner sees the board).
4. **KEY FRAMES, made whole:** each shot's frame (its landing frame, and its start where a move changes the picture)
   built complete in the film's look: the idea, the full world, the light, the people, the words. The owner approves the
   board of key frames: this IS the film's look and content (it replaces W1's density keys, G3's grey placeholders and
   G4's separate look clip).
5. **THE ANIMATIC FROM THE KEY FRAMES** (G3): the key frames on the voice with the camera moves, the joins and the key
   actions played; the owner locks it.
6. **ANIMATION** (G5-G6): each shot animated from its own key frame (life, motion, the transitions), never re-filled.
7. **Sound and final** (G7-G8, as below).
Checks catch mistakes (captions, safe zones, timing, contrast); they never design a frame. Where a gate below asks for
grey placeholders, density keys or a fill pass, this loop replaces it.

## Two modes: production and iteration (owner, 2026-10-29)

The gates below are PRODUCTION: a film on its way to posting. An ITERATION is a question the owner wants answered by
looking (a look test, a rethought scene, a style probe): it skips the gates and their checks. One or two max-effort
agents, no review panel, no critic, no QA suite, no fix pass; stills first (a clip only once the owner has approved the still), with its build stages; about an hour,
then straight to the owner, whose verdict is the review. Only what the owner picks from an iteration enters production,
and there it passes the gates in full. The playbook's Process section has the rule and the owner's words.

## The loop: gates G0-G8 (with G0.5, the core line, W1, the world bible, and G2.5, the visual script)

Start every video by reading `docs/OWNER_PLAYBOOK.md` (the owner's rules), and add any new feedback to it at every gate.
A new video starts when the owner asks for it (`HANDOFF.md` §1, "Starting the next video"); films in flight share the
weekly limit and finish first.

Breadth-first: the whole film passes each gate together. At every gate from G3 on, the owner gets **one MP4 that plays
on the phone, with voice and captions**; G0-G2.5 are text and audio only, with no MP4s (owner, 2026-10-25), plus at most 5
lines of notes. One version: one deliverable per gate; a choice the owner makes (the topic, the core line, the hook
line) comes as up to 3 options on one screen of text (playbook Process). Nothing is built for a later gate before this
one is approved; the one exception is W1, internal text written beside G1-G2.

| Gate | Owner plays / sees | Owner approves | Frozen after | Budget |
|---|---|---|---|---|
| G0 Topic | the top 3 topics on one screen of text, **each with its proposed core line** (lean scouting: Creative exploration below), or the owner's own topic | topic **and its core line** (a separate G0.5 only on request), audience, takeaway, length band | topic, core line, length band; then the **fact lock** (built ONCE, by one agent; every later check reads it) (`docs/vN/research/factlock.md`: every fact, number and quote the film may use, each checked against its primary source; v2 and v3 have one) before G0.5 | 2 scouts + 1 editor, skipped when the owner names the topic; then one fact-lock agent |
| **G0.5 Core line** (owner, 2026-10-25; folded into G0 by default since 2026-10-28) | by default nothing extra: the core line comes with the topic on G0's screen; a separate round (the top 3 lines on one screen) only when the owner asks for more options | **the one sentence** the whole video exists to land, the one that gets the biggest emotional reaction (v3 example: "AI is making your PC more expensive") | the core line: it becomes the frame-0 text, the hook's seed, the cover and title text and the payoff's callback, and every script line must serve it; from the pick we draft its **THROUGH-LINE CARD** (thread object and home spot, home place, one "you": internal; G1 completes it and the owner approves it there) | by default none (G0's editor drafts the line); on request one writer + one critic |
| G1 Script | **the ElevenLabs-ready script** (a short emotional cue per line, v1 format), with up to **3 hook-line alternatives** as text inside it (the owner picks one; G2 voices only the pick), plus the completed **THROUGH-LINE CARD** (one screen of text, `docs/look/CRAFT.md` §a; owner-approved 2026-10-27): the thread object and its home spot, the one home place (one home place and at most ONE comparison or scale shot: the playbook's ONE SUBJECT, GONE DEEP), the one "you", the mascot rule, and a carrier (A-F) for every join between the script's lines, taken from the script's own joins (the carriers follow the script, never the other way round); the voice comes at G2; and, in the card, the **sync plan** (<= 8 lines: the hook's count and trigger, the release with its written voice pause >= 0.8 s, the thread's sound, at most 2 middle moments: `docs/look/SOUND_SYNC.md` §4) | every word, the hook line, the card and its sync plan | meaning and order of lines; the hook line; the card | one writer + one critic (with the cold viewer panel) + one fix pass; 1 h, then 15 min per round |
| G2 Voice lock | **the take, generated through the API with the voice the owner picks** (`docs/voice/VOICE.md`; owner, 2026-10-26; `docs/voice/API_QUICKSTART.md`: paste format v2, `check_paste.py` OK, `generate_take.py` `all_clean`, `check_take.py` MATCH), delivered on a private claude.ai player page (`scripts/voice/take_page.py`; attachments don't play in the owner's phone app) with the full script text, locked into `public/vN/`, logged in `ELEVENLABS.md` section 5; word timings taken from it; the release's pause measured (>= 0.8 s, else that one gap lengthened before the lock) and the sync plan timed on the take (`docs/look/SOUND_SYNC.md` §4). Only without the key does the owner paste it (always the full `--handoff` text); we check that take the same way. No video (owner, 2026-10-25) | voice, pace | the clock (word timings) | 30 min |
| **W1 World bible** (text, beside G1-G2; owner-approved 2026-10-27) | no owner step (internal text): the set list (the home place first); the PROPOSED palette (one sister palette from `look/PALETTE.md` by the story's use case; 2-3 candidates judged internally when the topic needs a new look) and, in its terms, one light rig per set (the key and its side, the shadow tint family, the pool colours: `CRAFT.md` §d.1), its depth (the planes, 0 = the subject's, the air behind them = the sky's lowest step, the camera's horizon and vanishing point(s): `CRAFT.md` §f.1) and one colour-script line per beat; tiers A/B/C per shot (`CRAFT.md` §b; keyed to the visual script's shot ids once G2.5 locks); the recurring living character (Pip by default, `LIFE_AND_DENSITY.md` §5); its choices reach the owner as G3's grey and the G4 look clip | — (judged at G3 and G4) | — (G3 freezes the tiers and the rig's shapes; G4 approves the palette and freezes the pen, the rigs and the tier palettes; a change at G4 is written back into W1) | in parallel with G1-G2 |
| **G2.5 Visual script** (owner, 2026-10-29: "brainstorm a story and like a visual script with what happens on the screen and camera movements and etc") | **the film's visual story in words** (`docs/vN/visual/VISUAL_SCRIPT.md`; the format, steps and checks: `docs/v4/visual/METHOD.md`, researched from how studios do this step): shot by shot on the locked take's word times (`public/vN/voice_words.json`), a one-line-per-shot overview, then one block per shot that reads on a phone: its time in and out, the words spoken, what is on screen, the camera (size, angle, ONE move with its start and end), the thread, the words in the picture, the sound cues, the join into the next shot with its carrier (`docs/look/CRAFT.md` §a); style-neutral (content, staging, camera, timing, joins, words and sound; never palette, rendering, texture or line), so it stands while the look is still being found; 3 visual concepts judged internally first, the owner reads one (one-version rule) with at most 3 open questions; text and audio only, no MP4 (a read-along page that plays the take beside the blocks, when cheap); before it locks, two passes fold in: the COMPOSITION-AND-MOTION PASS from the ranked shot library (`docs/look/COMPOSITION_SHOTS.md`, Part 0 tiers and 0b guidelines: per shot its frame device, the move within it and the join, by code, on the take's words; `docs/vN/visual/COMPOSITION_PASS.md`, v4's the first) and the SYNC PLAN timed on the take (`docs/look/SOUND_SYNC.md` §4) | the visual story: the shots, what each one shows, the camera, every join and its carrier, the words in the picture, the sound cues | the shot ids, their times, pictures, camera moves and joins: G3 plays them, one block = one panel (a change to a locked shot reopens the visual script, starred and dated) | 3 concept writers + 2 judges (story, craft), 1 writer, 1 cold reader (sound off, then on), 1 critic, 1 fix pass; ~2-3 h on the clock (an estimate, measured on v4) |
| **G3 Sketch animatic** | ONE video at 60 fps: the whole film as an ANIMATED SKETCHBOOK (spec: `docs/G3_ANIMATIC.md`) — every cut, camera move, transition and key action PLAYED at sketch fidelity, every join with its carrier, the tiers at their final weights in grey, each set's light rig as shapes and its planes as grey steps (paler with distance, the horizon and the ground's lines to the VP drawn), density and life as grey placeholders (particle fields among the `life:` items), timed to the locked voice and played from the locked visual script (G2.5: one block = one panel, with its times, camera, join and carrier; the visual concepts are judged there; owner rule: one version) — tool: `SketchReel` board mode + `board_lint` | **the film's rough pass**: story in pictures, cuts, transitions, camera moves, key actions, the density/life plan, and **where the eye goes and what carries each join** (2026-10-27; the hand-off states the fidelity ladder) | the signal contract (`G3_ANIMATIC.md` §2): scene list, cut points, shot content, framing, transition devices and carriers, camera moves, motion plan, density promises, thread coverage, tiers, the light rig, the mover budget, the sync points (the count, the hold, the release: `docs/look/SOUND_SYNC.md`) | first cut ~3 h (was 2; the hour goes to tiers, carriers and the light marks; assumes `G3_ANIMATIC.md` §7 tier-1 tooling, built once beforehand: built 2026-10-30 as the shared kit `src/lib/g3/`, tooling item 6); rounds 30 min |
| **G4 Look clip** (after the G3 lock: it builds G3's home set, one of its joins and its frame 0 in the final style; approved before the G5 lanes start) | a **6-8 s playable LOOK CLIP of the home set** in the final style (replaces "1-3 stills + a 3-5 s test", 2026-10-27): the clean pen, the set's light rig with contact, form and cast shadows, tiers at final weight, one real transition, tier-B life, and frame 0 being drawn in the clean pen (how the opening draws on: `docs/look/DIRECTION.md` rule 9); checked before the owner sees it by an independent art director (fresh eyes; the owner's notes verbatim; ref 1 and v1 side by side; a phone-size squint; verdict SHOW / FIX FIRST) and by the checks (`CRAFT.md` §b-d: salience peak/median >= 2.4, environment local contrast <= 7, strokes <= 80/Mpx, near-miss ends <= 40/Mpx, dark-line pixels <= 3 %, `scripts/qa/check_light.py`; `scripts/qa/check_depth.py`, no FAIL: `CRAFT.md` §f; a sky: `skyProblems` empty and `scripts/qa/check_banding.py` PASS on the clip, `CRAFT.md` §g; carry and movers on its transition, rule 6), with the set's few particles (`lib/particles.tsx`) | palette and tier colours, line, light and shadow, mascot, frame 0's build, edges (opt-in per film; 'paint-subtle' at most) | visual language: the pen, the light rigs and the tier palettes freeze | ~1 day before the G5 lanes (the retro's estimate) |
| G5 Blocking cut | **the G3 tier masks filled in colour from the G4 kit** (2026-10-27; the owner's cut renders at full size, 1080 x 1920: `G5_BLOCKING.md` §4): real sets and props in the film's clean pen, light rigs, tiers and depth (`docs/look/CRAFT.md` §b-d, §f: `lib/light.tsx`, `lib/depth.ts`, the declared `lib/particles.tsx` fields; draft finish, never the sketch pen), every G3 placeholder made real, so the world is full and alive, calm and tiered (`LIFE_AND_DENSITY.md`; v3 G5 was "way too empty"), with **no new places, movers or tier promotions**; final camera, key poses, **no edges/paper/texture**; **one lane per SEQUENCE, and one agent owns every transition**; **entry and exit checks** (`G5_BLOCKING.md` §1): the scripted diff of scenes.json + built scenes against the locked board JSON (every camera move, element move, transition device and carrier, `life:`/promise item matches; no new motion), a sound-off cold read of the first fully dressed set (the home set, the density key), and CRAFT's measures rerun on the render and compared with the G3 render | staging, readability at phone size, transitions that play | compositions, camera, timing | 4 h of work; longer on the clock (one lane per sequence, one transition owner) |
| G6 Polish cut | life checked by tiers (`CRAFT.md` §b: at most 3-4 noticeable supporting movers at once, B <= 30 % of the motion, the subject >= 60 % in its beat; supporting life small and steady, never a still frame; events/s is information, never a target), easing and secondary motion only on movers that already exist (the particle fields' sizes, speeds, turns and sun side too), edges only if the G4 look clip approved them ('paint-subtle' at most; never at the top or beside the caption band), full-res 60 fps; **AI critics start here**; last, an *optional* tactical texture pass on a few elements (playbook) | feel only (no restaging) | the picture | ~6 h (an estimate): review rounds as the quality needs while each one improves the scene (anti-waste rule 2), + bug fixes |
| G7 Sound | the final sounds for G3's sync plan (sized like their gestures, every sync point heard; no new sync point, the picture never re-timed: `docs/look/SOUND_SYNC.md` §4), music, -14 LUFS mix | mix | audio | 1 h |
| G8 Final | the master (`scripts/render-media.mjs --master`: "Master encode" below), QA (+ `scripts/qa/check_banding.py` on the master's sky shots: no FAIL), cover, posting kit | blockers only | everything | 1.5 h |

Target: the visual script about 2-3 h after the voice lock (an estimate), the first playable cut (the G3 reel) about 3 h after its lock, then the G4 look clip (~1 day after the G3
lock), then the G5 lanes and G6 (video 1: the first playable film at hour 18.7).

## Creative exploration is not waste (owner rule)

**NO LIMIT ON TOKENS for creative output (owner, 2026-10-26).** Every creative stage (ideas, script, design, sets, density,
life, animation, polish) gets as many agents, rounds and tokens as the quality needs, including workflows larger than the
default size guideline. The anti-waste rules below only cut true waste (rework, lost work, reviews of things that will change).

Quality and output value come first, spent where it reaches the film. Ideas are decided early, where a wrong turn is cheapest to fix, but run as big panels the early stages cost as much as a build (v4: about $280 for a topic and a line, much of it waste: `docs/retro/2026-10-28_v4_early_stage_cost.md`), so they run lean by default: a few strong agents that write files, one fact check, and the owner's picks (owner, 2026-10-28):
- **G0 topic (lean since 2026-10-28):** the brief names the mood the next video needs (alternate positive and negative
  stories: playbook "Taste signals", owner 2026-10-28). When the owner names no topic, two scouts (about 15 searches
  each, each writing its file from its first step) cover the beats the brief asks for, and one editor judges them
  on `docs/TOPIC_CRITERIA.md` (the owner's order: relevance with buzz and surprise first; an untrue story is out; scores in its file), fact-checks the top 3 against their sources and drafts
  each one's core line (G0.5 bullet), so the owner picks the topic and its line on one screen, with the column chart
  of every story's score on each criterion (`video/scripts/topic_chart.py`, owner 2026-10-28). When the owner names
  the topic, one agent researches its biggest true framing (playbook: the hook). Then one research-and-fact-lock agent
  (about 20 searches) writes `docs/vN/research/factlock.md`: the only web check of the facts; every later check reads
  it and searches only for a fact it lacks (v4 checked the same facts on the web five times). The heavy version (5-6
  scouts, 3 judges, a synthesis, a fact-check: `v3-g0-topics-*.js`) runs only when the owner asks for a wider search.
- **G0.5 core line (owner rule; folded into G0 by default since 2026-10-28):** the one key sentence is still picked
  before the script. G0's editor drafts it per topic with what the v3-v4 core-line runs taught: one real person in
  their own words, or a direct question, beats a plural headline; plain beats clever; a line whose honest payoff walks
  back its own claim fails; a line that sounds like a commercial or bait fails (playbook, Audience and goal: never
  baity; v3's "Buying a laptop soon?" opening was skipped by 64.5 %); numbers are checked against the fact file (v4's truth check caught a 2024 figure in a 2026
  hook). A separate round runs only when the owner asks for more options: one writer (12-15 lines across the levers:
  loss, unfairness, reversal, personal, curiosity, headline, one real voice) and one critic (the judges' lenses, a
  four-persona gut panel and a truth check in one pass), the top 3 on one screen; bookkeeping
  `video/scripts/coreline.py`. The heavy version (22 agents: `v3-g05-core-line*.js`, `v4-g05-facts-and-core-line-*.js`)
  cost about $150 on v4 and its four judges barely separated the top lines: never by default.
- **G1 script = story first, clear on one hearing (owner, 2026-10-26 and 2026-10-29; lean since 2026-10-28):** one
  writer (1) drafts 2-3 competing story spines (the throughline question, the viewer's situation, beats joined by
  but/so, the turn, the payoff that lands the core line) and picks one, with its reason, then gives every beat its job
  in one line and runs **the side-quest test** (playbook ONE SUBJECT, GONE DEEP: "No side quests"; PRINCIPLES P10): cut
  each beat in your head, and if the viewer still gets the story and the payoff, it stays cut, however true, weird or
  fun (only the information the story needs; a sentence may still grow where its words make it more natural or
  clearer); (2) writes the script with cues, in the beat order of
  `docs/retro/2026-10-29_script_clarity/PRINCIPLES.md` ("How a 40-second script is structured"), with about two to
  four **human connectors** at the joins that need a hand, each true to the sentence it opens and named with its job
  in the script doc's notes (playbook "Human connectors, placed TACTICALLY"; PRINCIPLES P11, "Where the connectors
  go"), never a RULE #1 stock reveal; (3) **the clarity pass:** fills the film's word list
  `docs/vN/script/clarity.json` (the thread object's one everyday name and its rivals, the film's trade words with
  their plain descriptions, any allowed word
  with its reason; format: `docs/retro/2026-10-29_script_clarity/LINT_SPEC.md` section 3), writes "What I mean is:
  ___" in the script doc's notes under every line that leans on what the writer knows, and runs `check_clarity.py`
  (it reads `clarity.json` by itself), `check_rhythm.py` and `check_paste.py` until all three print OK
  (`check_clarity.py` OK means no error, never that the script is clear), answering every clarity warning in the
  script doc's "Checks" section (fixed, or why it stays). Then one critic, cold first (before the writer's brief and
  notes, the script doc or the fact file: only the spoken words): (a) **the cold viewer panel:** the critic plays the
  three viewers below in turn; each hears the narration once, one sentence at a time, never looking back or ahead,
  and after each sentence reports what they understood (in their own words), the words they missed or took another
  way, what each "it", "they", "this", "that" and new "the X" points at, and their thumb (stays, unsure, swipes) with
  why; after the first sentence each also answers "ad or news?" (an ad-like or baity opening fails: playbook, never
  baity); after the last, each also names the sentence they could lose without missing anything the story needs (or
  "none") and where it sounded most like a real person talking to them and most like a script or an ad (or "none");
  (b) the cold retell (a list-like retelling fails); then (c) the lint's targeted questions
  (`check_clarity.py --questions`) put to the same three viewers; (d) the flow (every line follows from the previous;
  every beat has its job, no side quest; the connectors, about two to four, each doing real work) and the facts
  against the fact file. **A clarity finding** is any line a viewer retells wrong or can't retell, a
  word one of them doesn't know or takes in another sense, a pointer one of them resolves wrongly or not at all, a
  line one of them had to re-link to an earlier one, or an "unsure" or "swipe" thumb; each is listed by line, with
  the viewer's own words and a plainer line, and never waved through as "paid off by the next line". A sentence a
  viewer could lose gets the side-quest test (it goes unless the story or the payoff needs it; the critic says which),
  and a line heard as a script or an ad is rewritten the way a person would say it (a connector where the join needs
  a hand); both are on the panel's list. The panel's list is complete and all of it is fixed; the critic's other
  findings stay at most 6. Then one fix pass by the same writer (resumed, not restarted): every panel line
  rewritten, the three checks re-run, and the critic (resumed) re-hears each changed line as the three viewers, with
  the line before and after it, until no changed line snags.
  The through-line card's carriers come from the script's joins (G1 row). Never structure a script as a list of facts
  to prove. **Rhythm (owner, 2026-10-27):** short sentences (<= 5 words) break up the long ones, at least one after
  at most three long sentences (three only when they flow, joined by connectors: the El Niño reference,
  `docs/voice/refs/2026-10-29_el_nino/`), each short line keeping its noun; the script must pass `scripts/voice/check_rhythm.py` and
  `scripts/voice/check_clarity.py` (exit 0) before it goes to the owner. The heavy version (~12 agents:
  `v3-g1-story-*.js`) runs only on request.
  - **The three viewers** (each card says what that viewer doesn't know, because a played panel knows every word; each
    hears one sentence at a time, once, and answers only from that sentence and the ones before it, then the two
    questions at the end, (a) above: the sentence they could lose, and where it sounded like a person or a script;
    they may run as three small cold agents instead, the narration inline, no file read, the card as the persona: v4
    G1 did, and all three snagged on a line every check had passed, "Nothing is built yet."; never more than three):
    1. **A non-native English speaker** (24, in São Paulo, Jakarta or Kraków; learned English at school; watches Reels
       with the captions on): knows everyday words and takes each in its most common, literal sense; knows no idioms
       beyond the most basic, no slang, no American cultural references; knows world-famous names only (Google,
       Apple, Microsoft, Amazon, Tesla, Netflix, the FBI), not company or product names from the news; misses irony.
    2. **A non-tech adult** (45, a nurse or a bus driver; uses a phone daily, never thinks about how computers work):
       to them chips are food, a cabinet is a cupboard, a server is a waiter, the cloud is in the sky; knows "AI" and
       "chatbot" from the news, not how they work; a number means something only next to an everyday thing.
    3. **A fast-scrolling teen** (15; thumb on the screen, two seconds of patience): knows apps and memes, not news,
       not trade words; swipes on the first line that doesn't make sense or sounds like an ad.
- **G2.5 visual script (owner, 2026-10-29):** 3 visual concepts for the whole film (one page each, style-neutral), judged internally by a story judge and a craft judge; the pick is written as the one visual script the owner reads, after a sound-off and sound-on cold read, a critic and one fix pass (`docs/v4/visual/METHOD.md`). - **G3 animatic:** plays the locked visual script, one block = one panel (the thumbnail variants per beat stay G3's: `G3_ANIMATIC.md` §5); the owner sees one animatic (one-version rule).
- **G4 look:** 2-4 style-frame directions when the topic needs a new look, judged internally; the pick becomes the one
  look clip the owner plays.

G2.5 and G4 are divergent stages (a few concepts, judged together; G3 plays G2.5's pick); G0-G1 run lean (above). The rules below target the convergent
stages (building, fixing, polishing), where the measured waste happened.

## Anti-waste rules (each one fixes a measured waste)

1. **No AI critics on built scenes before G6** (reviews were 28 % of spend, mostly on scenes that changed afterwards).
   Before G6 the owner is the reviewer, plus what judges no taste: scripted checks (the gate check: duration, A/V sync,
   captions inside the safe area; from G3 on, CRAFT's lints, rule 6), cold reads that only retell what they see (G1's
   cold viewer panel and retell, G2.5's and G3's sound-off and sound-on reads, G5's first-set read) and each lane's style quiz before it builds
   (playbook Process: one STYLE.md per film). The divergent stages above keep their judges. `G5_BLOCKING.md` §9's
   art-director reviews were v2r's (an owner-ordered restart with full creative freedom), not the default.
2. **One combined reviewer per scene per round from G6 on, max 6 findings, then one fix.** Rounds go on as long as the
   quality needs (owner, 2026-10-26: polish gets as many rounds as the quality needs) while each round improves the
   scene; the loop ends when a round finds nothing under the bar, or when it stops converging (a finding comes back
   after its fix, or a round finds nothing the last one didn't): then the scene goes to the owner. That loop that no
   longer converged was v1's waste (S08 took 25 reviews and still shipped at 7).
3. **Fix agents get a turn cap and an image budget** (avg 163 turns): render contact sheets at 0.33-0.5 scale, view at
   most ~8 images per session, and end the session after the fix. A new session is cheaper than a long one.
4. **No downstream build before its gate.** On video 1, engine, kit, mascot, edge lab and QA tooling were built before
   the script was locked, and a 78 s to 55 s script change threw away voice v1/v2, timing, storyboard v1/v2 and music.
5. **Checkpoint every agent; at most about 4 at once per machine.** 66 agents died at usage limits on v1. Keep each
   agent's task small enough to restart and commit after every agent and at every turn's end; each agent writes its
   result into a repo file as it goes (never only as its final message), a long unattended build runs
   `video/scripts/autocheckpoint.sh <branch> <the film's paths>` (a commit and push every 10 minutes when they changed;
   a background job lives at most 2 hours), and an agent stopped by a limit resumes from its transcript (SendMessage)
   after the reset (owner, 2026-10-27). One machine runs at most about 4 agents at once
   (this 4-CPU container runs about 2 render-heavy ones well); more parallel work goes to helper cloud sessions, each
   its own machine (playbook Process: parallelize as much as possible), inside the weekly and 5-hour limits.
6. **Precise numbers are lint numbers, checked only where the picture shows them truly** (owner-approved 2026-10-27).
   The G3 motion numbers are the contract (move durations, the five values, the ~15 px/frame speed budget): they live
   in the board JSON and the camera plan, enforced by lint, never as a prose spec. `CRAFT.md`'s thresholds are lint
   numbers too: warnings with a declared exception (they come from two films only), never quotas. At G3 a board is
   linted only for what it shows truly: the declared ones (a carrier per join, the plain cuts, thread coverage, the
   mover budget) plus eye jump and colour shift (v3's board: 0.21 and 35, both over); carry, movers, contrast, line and
   light count from the G4 look clip on (blank paper flatters them: v3's board carried 0.41 with 0 movers). Two of
   CRAFT's checks FAIL outright (`CRAFT.md` §a): a carrier for every join with at most 2 plain cuts, and the thread on
   screen >= 80 % with no gap over 3 s (the declared scale reveal aside); from the G4 look clip on, so do §f's three
   depth signatures (`check_depth.py`: no air, a melting subject, a ground built as an elevation). The board lint's completeness checks
   (`G3_ANIMATIC.md` §7) are separate and keep their FAIL.
7. **The hook goes first at every gate:** its first 3-5 s are built and checked before the rest (a swappable hook
   segment, tooling item 4, was never built), with its sound cue from G1 on (a positive phone sound in the first second,
   per the playbook). Where it is decided: G0.5 picks the core line (the hook's seed and the cover title; the payoff in words by ~2 s); G1 picks the
   spoken hook line (up to 3 alternatives as text); G2 voices only the pick; G2.5 writes its picture (the one opening shot, at sub-second detail: concepts judged internally, the owner reads one), and G3 plays it. v3 picked its hook at G2 from three MP4s, one per hook ("why
   are there multiple versions"): retired with the one-version rule. It is never polished last.
8. **One deliverable per gate, no status reels.** Drop the 30-minute strips of every composition. The owner gets the gate video;
   between gates, a short text status on all active threads (playbook Process, "Progress"), never a rendered reel.
9. **Lean orchestrator.** Keep the task list short, use short check-in prompts, read agents' final summaries rather than full
   journals, and write handoff notes as a short WRAPUP-style doc instead of a growing log.
   **Small contexts:** most of a long session's cost is re-reading its own context on every tool call (v2r, 28 Oct: cache
   reads were roughly two thirds to three quarters of each session's cost; a helper at ~700k tokens pays ~4x per call
   what it pays at ~150k). So an orchestrator or lane session delegates reading, rendering and critique to fresh agents
   that write their results into files and return a few lines, never pulls whole reports, diffs or logs into its own
   context, and starts a new phase (a resume, the next shot) from a short handover in a fresh session or after a compact.
   **Agents report in files, not in the chat (v4, 2026-10-28):** every agent writes its result into a repo file from its
   first step (a usage limit can stop it at any time) and returns at most 3 lines; the orchestrator reads only what it
   needs from the file (v4's writers and judges pasted their full JSON into the chat: about 50k tokens re-read on every
   later step). A stage's shared brief lives in one file (`docs/vN/briefs/<stage>.md`) that each agent reads, so each
   prompt is a few lines. No big skill or doc load for a small question (one settings-schema load added ~70k tokens to
   every later step). Batch the steps (a commit rides in the same call as the next action). Before a fan-out, check the
   session's rate limit (get_session `rate_limit_info`): agents launched near the limit die with nothing saved (v4: five
   scouts, 2026-10-28).

10. **Locked means dropped (owner, 2026-10-25).** When a gate locks, move the rejected options to `docs/vN/archive/`
    (no prompt reads it), trim the gate doc to the locked choice, and point later prompts only at locked docs and
    the fact files. Unused topics go to `docs/IDEAS_BANK.md`. Superseded drafts are archived at the next gate.

## Frame rate (owner, 2026-10-26)

All production renders (G5 blocking, G6 polish, G8 final) are **60 fps** (composition `fps: 60`; the final encode keeps
`-r 60`). Everything animates in seconds (`useTime`, `frame / fps`), so a scene renders at any rate. Camera speed limits
are strobe limits and scale with the rate: ~15 px/frame at the render rate (= ~450 px/s at 30, ~900 px/s at 60; playbook
Motion: 60 fps allows faster moves); readability at 1x is the test, not the number. **This is the one speed budget**
(a lint WARN): `G3_ANIMATIC.md` §4, `G5_BLOCKING.md` §2 and §6, `STORYBOARD_STYLE.md` §7 and `COZY_AND_SCALE.md` §4
point here, and G5 keeps the timing G3 played. Drawn character motion can stay stepped (hold each drawing for
`round(60 / drawingsPerSecond)` frames). The G3 animatic renders at **60 fps** too (SketchReel is time-based; 540p60 is cheap), so motion smoothness is judged at
the film's real rate — v3's "smoothness is not there" had no 30 fps surface to show on. Test file: `video/deliverables/tests/`.

## Master encode (2026-10-28; `CRAFT.md` §g)

Every master (the G8 file, a 1440 x 2560 YouTube master with `--scale=4/3`, any owner download meant to be posted)
renders in ONE step with `node scripts/render-media.mjs <FilmN> out/<name>.mp4 --entry=<entry> --master` (+ the film's
`--props`, `GL=` as its chunks): lossless PNG frames, Remotion's BT.709 conversion (limited range, tagged) in the same
encode, x264 CRF 14, preset slow, aq-mode 3, 8-bit yuv420p (High), mp4 faststart. The settings live there and nowhere
else. Measured on the sky demo (`docs/look/research/2026-10-27_sky_gradients.md` §5): Remotion's default JPEG q80
frames halve a sky's dither and band it, and the old second "TV-range" pass (`scale=in_range=full:out_range=tv` +
`-colorspace bt709`) re-encoded a BT.601 file and only relabelled it BT.709 (the mint 1.7 L* darker, dE76 up to 2.5)
and banded the sky again: retired.
QA on the master: `python3 -I scripts/qa/check_banding.py out/<name>.mp4 --region <a shot's open sky> --times <its
seconds>` for every shot with a sky (PASS; a WARN is an isolated soft contour, look at it), then `gate_check.py`.

## Studio toolkit (reuse per video; copy a workflow template and swap the topic, paths and locked lines)

Every lesson lands here, in the playbook or in a gate, in the same turn (owner, 2026-10-26). Workflow templates live
in `context/workflows/`. **Copy their structure, never their briefs:** v3's G3 board brief (`v3-g3-board-cine-*.js`)
still asks for scale cuts and "size and angle at every cut", and `v3-g5b-rollout-*.js` builds per-panel lanes to the
retired G5b bar (retired as a template). Rebuild the G3 and G5 templates on `docs/look/DIRECTION.md` and `CRAFT.md`
before the next video's G3. The G0-G1 templates are the HEAVY versions, run only when the owner asks for a wider search (the default is the lean flow in the G0-G1 bullets above); when one runs, every copied brief needs four updates: today's
date and search window (`v3-g0-topics-*.js` hard-codes 2026-10-25), the current look words from DIRECTION (its judges
still say "hand-drawn ink"), `effort: 'max'` on every `agent()` call (every script in `context/workflows/` sets it since 2026-10-27; a copied or new
one must pass `python3 .claude/hooks/max_effort.py --lint`, and the repo's hook denies a run that doesn't), and
the through-line card (G0.5 drafts it from the pick, G1 completes it from the script's joins):

| Gate | Tool / template | What it does |
|---|---|---|
| G0 topic | lean by default (2 scouts + 1 editor: the G0 bullet); heavy on request: `v3-g0-topics-*.js`; `docs/IDEAS_BANK.md` | the top 3 topics, each with its proposed core line |
| G0.5 core line | by default inside G0; on request one writer + one critic (`video/scripts/coreline.py` for the bookkeeping); heavy, never by default: `v3-g05-core-line-*.js` | the top 3 lines |
| G1 script | lean by default (one writer + one critic + one fix pass: the G1 bullet); heavy on request: `v3-g1-story-*.js` | spines, the script with cues, the clarity pass (the film's `clarity.json`), the clarity, rhythm and paste checks, critique (the cold viewer panel first), fix |
| any line | `v3-line2-fix-*.js` | replacement lines tested in context by viewer personas + a standards/flow judge |
| G1/G2 voice | `docs/ELEVENLABS.md`; `video/scripts/voice/` | paste-file rules + `check_paste.py`; `check_rhythm.py` (long sentences broken by short ones); `check_clarity.py` (clear to a regular listener on one hearing: errors for trade words and false friends, pointers with rivals or no target, vague scope, idioms; 13 warnings, each a targeted question for the G1 panel via `--questions`; reads the film's word list `docs/vN/script/clarity.json`; `--selftest` keeps the owner's v4 notes as its regression; needs the pinned spaCy and wordfreq, and prints their install line (exit 2) when they are missing; run it without `python3 -I`; spec and build: `docs/retro/2026-10-29_script_clarity/LINT_SPEC.md`, `LINT_REPORT.md`); `check_take.py` (transcribe + diff), `clean_take.py`, `transcribe.py` |
| G2 voice (API) | `video/scripts/voice/generate_take.py` | per-line generation with the owner's voice, ASR check (Parakeet + Whisper), auto-regenerate, stitch; needs `ELEVENLABS_API_KEY` |
| G2 delivery | `video/scripts/voice/measure_take.py`, `shape_take.py`, `textnorm.py` | measure a take's delivery (words/min, pauses, pitch spread, stress) against a reference; shape its cadence after generation (pause lengths from each pause's own audio, beats before chosen lines, one static gain; no time-stretch, no compressor: on v4 they sounded robotic and "like in some chamber"); numbers spelled the script's way in every check |
| G2 sound | `video/audio/tools/make_phone_sfx.py` | our own positive phone sounds (like pop, ding, swoosh, cart add) |
| G2.5 visual script | `docs/v4/visual/METHOD.md` (format, steps, checks); v4's run in `docs/v4/visual/` (research, concepts, judges, the visual script, the reviews) as the template | 3 concepts, 2 judges, the visual script (an overview, then one block per shot), the mechanical checks, the sound-off and sound-on cold read, the critic, one fix pass |
| G3 animatic | the shared kit `video/src/lib/g3/` (`G3ReelComposition`, `SketchReel`; lint `video/scripts/g3/board_lint.py`; v3's `src/v3/SketchReel.tsx` stays v3's own) + `v3-g3-animatic-*.js` (structure only) | the storyboard artist writes the animatic JSON from the locked visual script (the concepts are G2.5's); SketchReel draws it with voice and pop captions |
| G3-G8 sync | `docs/look/SOUND_SYNC.md` §4 (the sync check list); `video/scripts/qa/av_lag.py` (the voice in the render); `video/scripts/qa/sync_check.py` (to build: each cue's type, its window against the event's first visible frame, heard or not, the spend) | sync points planned at G1, timed at G2, played at G3, carried at G5, finished at G7 |
| G3 board style | `docs/G3_ANIMATIC.md` (stage) + `docs/look/STORYBOARD_STYLE.md` (drawing); SketchReel `style: "board"`; `scripts/v3/board_lint.py`; `v3-g3-board-*.js` | the animated sketchbook: monochrome boards at their tier weights, every final move/transition played with its carrier, the light rig as shapes, placeholder density; tier-1 lint (motion, emptiness, carrier, thread, tier and rig checks; eye jump and colour shift on the reel: anti-waste rule 6) before render (to build: today `board_lint.py` checks only the panel rules, `STORYBOARD_STYLE.md` §6); sound-off + sound-on cold reads, ONE batched fix round |
| G3 motion + density | `G3_ANIMATIC.md` §3-4 + §7 tier 1 — **built 2026-10-30**: the shared kit `src/lib/g3/` (how-to `src/lib/g3/README.md`) + `scripts/g3/board_lint.py` | pose-test actions (2-4 stepped keys, smears), kit ambient loops, transition `device` + `carrier` fields and the carrier check (`CRAFT.md` §a), the `tier` and `rig` fields and the thread's coverage, density placeholders + `life:` lists, 60 fps reel |
| G3 clarity | SketchReel `icon` elements; sound-off cold read (`v3-g3-clarity-*.js`) | recognisable objects instead of boxes; viewer personas say what each shot shows with the sound off; confusing shots get redrawn literally before the owner sees the animatic |
| G3-G5 camera | `docs/look/CINEMATIC_GUIDE.md` (+ `research/arcane_shots.json`, sketches in `docs/look/cine_sketches/`) | Arcane-measured shot vocabulary V1-V12, camera presets, 9:16 composition, light, transitions, sequence templates; storyboard and blocking pick from it. At G3, a per-film camera plan (`docs/vN/camera_plan_g3.md`, one row per panel, with its carrier, tier map and rig; checks in `STORYBOARD_STYLE.md` §7) comes before the re-board |
| references | `arcane-cinematic-guide-*.js`, `scripts/look/shot_sheets.py` | dissect any reference video: measure, contact sheets, per-shot analysis agents, guidebook |
| opening (every video) | `v3-opening-banger-*.js`; SketchReel `draw` / `fillIn` | 3 concepts for the one continuous opening shot (drawn live in the clean pen, expectation then reality, never still: `docs/look/DIRECTION.md` rule 9), judge, build; loop back to frame 0's drawing state |
| G4 look clip | `docs/look/CRAFT.md` (§b-d, §f, §g and their checks), `docs/look/COZY_AND_SCALE.md`, `docs/look/PALETTE.md`; `scripts/qa/check_light.py`, `scripts/qa/check_depth.py` (+ the shot's sheet in `scripts/qa/depth_sheets/`); the clean pen (`lib/pen.ts`, `lib/tier.tsx`), the light primitives (`lib/light.tsx`, ported from v3's `src/v3/film/kit/Light.tsx`: a film never imports another film's folder) and depth (`lib/depth.ts`: planes, air, separation, one ground camera; `lib/particles.tsx`; how-to `lib/DEPTH.md`); the sky (`lib/sky.tsx`: one eased OKLab gradient, the sun's warmth, the blue-noise dither, `horizonColor` = depth's air; how-to `lib/SKY.md`; `scripts/qa/check_banding.py`; `CRAFT.md` §g); `look-cozy-scale-arcane-*.js` | look rules and checks; the pen, light, depth, sky and tiers the clip is built with; research template |
| G5 blocking | `docs/G5_BLOCKING.md`; `src/entry-v3-film.tsx` (template); `scripts/qa/gate_check.py` | the film shell plays end to end from minute one: `scripts/g5_scaffold.py` turns the locked board into scenes.json + one placeholder file per panel (the board panel inside `<Film>`), sequence lanes replace panel files and one agent builds every join; pop captions from `scripts/film_captions.py`; frame-0 words, voice, sound cues, draft label; the scripted gate check (fps 60, duration, audio, cuts vs scene starts, captions in the band) plus the entry and exit checks (CRAFT's measures against the G3 render) |
| G5-G6 density and life | `docs/look/LIFE_AND_DENSITY.md`; `scripts/qa/density.py` (+ `gate_check.py --density`); v3's `docs/v3/density_plan_g5b.md` is history (its cut was "too busy") | every frame full and alive at the level of reference 1 and v1, calm and tiered: dressing by setting, people and life by tier (`CRAFT.md` §b), the recurring living character (Pip), information as paper in the home place, what stays calm; the meter flags flat, empty or static shots (a warning signal, never a quota; the craft tooling lane makes it count tier-C dressing only, its events/s and gap information) |
| references | `video/scripts/look/measure_camera.py` | cuts + per-shot camera curves, easing, parallax from a reference video (keep copyrighted clips out of git) |

## Agent prompt rules

- **All delegated work runs at MAX effort** (owner, 2026-10-27; playbook Process): `effort: 'max'` in every `agent()`
  call, `effort: "max"` on every Agent tool call, `/effort max` as a helper session's first prompt, and every brief says
  that anything its agent starts runs at max too. The hook in `.claude/settings.json` enforces it;
  `python3 .claude/hooks/max_effort.py --lint|--fix <workflow.js>` checks or repairs a script.
- Context: the gate's brief plus the scene's own data. **Point to sections, never "read all docs fully".**
- An agent writes its result into a file and its chat report is at most 3 lines (rule 9). Cross-lane requests go in one
  block, in an exact format.
- **One fact file:** after G0, agents read `docs/vN/research/factlock.md` and search the web only for a fact it lacks.
- Lanes: one scene per agent session (G5: a lane owns a SEQUENCE and builds it panel by panel; one agent owns every
  transition); shared kit / engine changes go only through the orchestrator.
- Renders: 0.33-0.5 scale strips; full res only for a 1-2 frame measurement (an agent's working renders; the owner's
  G4 clip and G5+ cuts render at full size: `G5_BLOCKING.md` §4).

## Tooling planned before video 2 (history, except item 6)

Where each one stands (2026-10-27): 2, 3 and 5 exist (Film's `draftLabel` and `edges={false}`, `src/v3/SketchReel.tsx`,
`scripts/qa/gate_check.py`); 1 and 4 were never built (gate videos are plain `npx remotion render`: the G3 reel at
540p60, the G4 clip and the G5+ cuts at full size); 6 is part of the approved pipeline and BUILT 2026-10-30 (the shared kit `src/lib/g3/`, `scripts/g3/board_lint.py`; `g5_scaffold.py`'s carry-through and the eye-jump / colour-shift measures still to build) before the
next video's G3.

1. **`npm run preview`**: the whole film at 0.33 scale with audio, CRF 28, x264 veryfast, about 3-5 min. Also
   `preview:hook` (first 10 s) and `--frames` to re-render one scene. Every gate video comes from this. *(~1 h)*
2. **Draft flag in Film**: turns off edges, paper and texture, and burns in a gate/version/scene/timecode label
   for all pre-final cuts. *(~1 h)*
3. **SketchReel composition (G3)**: draws the animatic from one JSON file (per line: the board drawing,
   `STORYBOARD_STYLE.md`; camera start/end; transition type, carrier and label). A G3 revision is then a data
   edit, not code. *(~half a day)*
4. **Hook segment**: the first 3-5 s as its own component with variants that all end on the body's first frame (and on
   S12's loop frame). *(~2 h)*
5. **Scripted gate check**: duration, A/V sync, caption safe area, cut list vs word anchors. It replaces review agents for
   mechanical checks. *(~1 h)*
6. **G3 animatic tier-1 tooling** (`G3_ANIMATIC.md` §7 tier 1): dress layer, `loop` + the shared ambient kit, the tier-1
   lints, the transition `device` and `carrier` fields, the `tier` and `rig` fields and the thread's coverage, the 60 fps
   reel render, g5_scaffold carry-through of `transition.type`, `carrier`, `tier` and `rig`. One checkpointed lane
   before the next video's G3, outside the gate budget; the G3 row's ~3 h first cut assumes it exists. *(~1-2 days)*

Defaults learned from video 1's posted reel: captions use `skyCaption.motion = 'pop'`, or a line rise that stays
inside the caption window. The 'scroll' slot reveal clipped letters mid-rise on a plain sky and looked like a glitch on
the phone. Paper edges never at the top or beside the caption band, because that looks like a screen recording under
the status bar. The G4 look check includes a phone screen recording of the look clip.

Drop or slim: per-scene QA charts in every check-in, beat-sync against the old storyboard, critic panels before G6, edge
labs before G4.

## Craft tooling lane (owner-approved 2026-10-27; lands before the next video's G3)

One checkpointed lane in small restartable tasks, outside the gate budgets (the retro's estimate: about 2-3
agent-days); the G3 side (the `carrier`, `tier` and `rig` fields and their lints) is item 6 above.
**When and who:** it must land before the next video's G3 (item 6, the measures) and G4 (the pen and the light); that
video's G0-G2 never wait for it. The session that starts the next video owns it and schedules it. Other sessions are
editing the same files on 2026-10-27 (the v3 rework: `lib/pen.ts`, `lib/tier.tsx`, `src/v3/film/kit/Light.tsx`; v2r:
porting `lib/light.tsx` and the tiered pen for its kit), so the lane starts with what nobody else touches (the
`scripts/qa` measures, the lints, item 6) and, before it edits a pen or light file, pulls, reads `git log -3 -- <file>`
and agrees the change with the session that last committed it (its PROGRESS or handover file); never two sessions on
one of these files at once:
1. **Port the measures into `scripts/qa`** as checks (`CRAFT.md` §e; the raw retro versions are in
   `scripts/qa/retro_tools/`): carry, eye jump and colour shift per join; tiers (salience, local contrast, motion share);
   line (strokes, short strokes, near-miss ends, dark-line pixels); light (`scripts/qa/check_light.py`, the first one,
   from the v3 rework); depth (`scripts/qa/check_depth.py`, 2026-10-27: planes, separation, ground, size).
2. **Finish the clean pen** (`lib/sketch.ts`, `lib/pen.ts`, `Ink`, `Fill`: `CRAFT.md` §c) and **finish `lib/light.tsx`**
   (`CRAFT.md` §d; v3's `src/v3/film/kit/Light.tsx` is the first version; v2r began the port on 2026-10-27), so that no
   film imports another film's light kit. **Port `lib/cine`'s drawing pieces to the
   clean pen** (city, street, tower, monument, wall, windows, figures, sky, light, props, wipers, lens draw raw paths
   with the theme's `misreg` and their own hand jitter, so `setPen('clean')` never reaches them; its camera and
   utilities, and `lib/kit` through `Ink` / `Fill`, are fine), and rebuild `ENGINE.md` §3's template on the clean pen.
3. **A film-code lint** that bans hatch, scribble, `over` and `misreg` in film code (`CRAFT.md` §c's grep) and flags
   a film's imports of `lib/cine` drawing pieces until item 2 ports them.
4. **The density meter** (`scripts/qa/density.py`) counts tier-C dressing only; its events/s and gap become
   information (no FAR, no gate FAIL). Still to add (they were `COZY_AND_SCALE.md` §7.6): the void (largest empty
   patch), thing counts, colours per patch, layers, and a profile tag per shot so film averages count STORY-LED shots
   only. Re-measure its fullness targets on the first G4 look clip (they were set on lined frames).
5. **The carriers in the engine and the gate check:** a card-flip transition type for carrier E (`CRAFT.md` §a;
   `G5_BLOCKING.md` §2 maps A-F onto Film's types), `carrier` read by `gate_check.py` per join, and an `unbuild`
   `transitionIn` modelled in its cut check.
