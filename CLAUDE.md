# Project: short-form explainer videos (TikTok / Reels / Shorts)

This page is what every agent reads first (it is loaded into every session and subagent). Everything else is a toolbox
you consult when you need a tool. New to the project? `HANDOFF.md`. Changing the guides? `video/docs/process/PLAN.md`.

## Feeling first (the owner's rules above all)
1. **Every frame is worth pausing on.** Judged at a glance, as a picture, at phone size: would a viewer stop scrolling?
2. **Readable imaginative ideas.** Each beat gets a picture idea invented for this story that a viewer reads in a second:
   never a dry diagram, never an idea taken from a past film (no film of ours is ever the bar or the example).
3. **Frames planned and created WHOLE, from the get-go:** the idea, the world, the light, the people, the words, as one
   picture; never built thin and filled later "for density".
4. **Start from the feeling, never from a number.** Every frame begins with what the viewer should feel at this moment
   of the story and where its life and action are; the tools (light, value, colour, composition, depth, scale, paint,
   motion, sound) are chosen to create that feeling, and each scene lands differently. "Contrastful, to give feeling
   X" is a brief; "65 % contrast" is not. Numbers explain what we see and catch real mistakes; they are never a target
   a frame is built to, and never decide a frame on their own (owner, 2026-10-31).
5. **One film, never a hodge-podge:** one imaginative concept for the whole film, one world, one thread, one arc of
   feeling; ideas picked as whole sequences; one art director holds the vision.

## How a film is made (`video/docs/PIPELINE_V2.md`, "THE LOOP NOW")
Script and voice -> the story beats (what the viewer understands and feels, no pictures yet) -> IDEAS (whole-frame
thumbnails, as whole sequences) -> KEY FRAMES made whole (the world kit and the hero frame first, approved by the owner)
-> the shot plan (moves, joins, sound sync between the key frames) -> the animatic from the key frames -> animation ->
sound and final. Every built frame goes through THE FRAME LOOP: a fresh evaluator first names the feeling the frame
gives and compares it with the beat's; then THERE (move on), ALMOST (adjust, at most 2 rounds) or NOT THERE (rework from
the idea once, then options to the owner). Two modes: PRODUCTION (a film through the gates) and ITERATION (a quick test
for the owner: one or two agents, rough, shown at once; only what the owner picks enters production); ask "a film or a
question?" first.

## The story and the voice
- One core line per video, picked with the topic; the through-line card (one thread, one home place, one "you").
- A script is one coherent story a regular person gets on ONE hearing: everyday spoken words, no trade words, no
  AI-sounding phrasing, never a list of facts, never a commercial. Target 30-45 s.
- The first 3 s must stop a thumb: the scene coming alive from frame 0 as a bold visible event, the voice from the first
  frames (never a silent lead), the hook made physical, the payoff in words within about 2 s, in the voice's order.
- The narration: the ElevenLabs voice the owner picks, through the API (`video/docs/voice/API_QUICKSTART.md`; the take
  delivered on a private claude.ai player page). Never print, file or commit an API key.

## Hard constraints (the only fixed things)
9:16 at 1080 x 1920, rendered at 60 fps. Captions in their band, popping in place (never clipped roll-ins); key reads
clear of the app's buttons and bars (`video/docs/look/LAYOUT.md` §1); no paper edge at the top or beside the caption
band. Words in the picture few and big (each reads at phone size, or it is not drawn). No ink lines in the build (tested
on the final cut). The people in use: `video/docs/look/PEOPLE_DESIGN.md` (top). Captions readable, the voice in sync,
no banding on the master: these are the mistakes the checks catch.

## The toolbox (consult when you need a tool; never pre-load it all)
The look's one page: `video/docs/look/DIRECTION.md`. The owner's own words: `video/docs/OWNER_PLAYBOOK.md` (they win
over every doc; a clash is a bug: fix the lower doc in the same turn; the full order of the docs: DIRECTION's intro).
The tools and their recipes live in `video/docs/look/` (composition library, painting recipes, light, palette, people,
type, sound sync) and the gates in `video/docs/PIPELINE_V2.md`; the owner's references in `video/docs/look/refs_*`
(learn their craft; their mood is theirs unless the beat shares it). A guide's numbers are examples of what worked
once, never the way.

## Owner feedback
Capture it in the same turn and commit it: approach-level lessons to `video/docs/OWNER_PLAYBOOK.md`, notes on one video
to `video/docs/vN/OWNER_NOTES.md` (both when a concrete note teaches something general; post-publish numbers in the
playbook's "Performance log"). Capture the FEELING he asks for and the TOOLS that create it, in his words; never turn a
note into a number or a placement (a measurement may follow only as a labelled example). Integrate every note: rewrite
or retire what it changes, never only add. Keep the guides coherent, clear and SMALL (owner, 2026-10-31: "170k words of
guides is absolutely bananas"). Every lesson goes into the process (playbook, pipeline, toolkit) and is committed.

## Working rules
- **ALL delegated work runs at MAX effort** (owner, 2026-10-27): every workflow agent (`effort: 'max'`), every subagent
  (`effort: "max"`), every agent an agent starts, every helper session (first prompt exactly `/effort max`). The hook
  `.claude/hooks/max_effort.py` enforces it; `python3 .claude/hooks/max_effort.py --lint|--fix <workflow.js>` checks a
  script.
- **Spend on the film, not on overhead,** inside the weekly limit (finishing the films in flight comes first): no limit
  on creative quality, but small checkpointed tasks, agents that write files and report in 3 lines, a small
  orchestrator, no rework, no reviews of things that will still change, no polish before the story is locked.
- **A look or frame brief opens with the beat's feeling and story moment in words** (PIPELINE_V2, "The standard brief
  header"); the hook `.claude/hooks/feeling_brief.py` stops a brief that hands an agent a look number as a target.
- Commit only your own paths; never `git add -A`.
