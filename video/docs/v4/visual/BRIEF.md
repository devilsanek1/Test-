# Video 4, the visual script: the shared brief (2026-10-29)

**The owner, verbatim:** "We are still iterating on the style tho. Instead brainstorm a story and like a visual script
with what happens on the screen and camera movements and etc / Again research his professional studios go through this
step". So: before any animatic, the film's visual story in words, shot by shot, timed to the locked voice; researched
against how professional studios do this step; brainstormed as a few concepts, judged, then ONE script for the owner.

**Locked, never changed here:** the script and the voice. The spoken words, with their exact times, are in
`video/public/v4/voice_words.json` (42.24 s; the first word at 0.13 s; every word has `s` and `e` in seconds); the paste
with its delivery tags is `video/docs/v4/script/script_elevenlabs.md`; the script doc with each line's job and the
picture ideas so far is `video/docs/v4/script/script_g1.md` (draft 3, locked); the through-line card is
`video/docs/v4/THROUGHLINE.md` (the thread: the heat as warm water, a drawn thing, never a glow; the home place: a snowy
Helsinki street at dusk with one warm window; one "you"; Pip hidden; a carrier for every join; the cathedral is only a
landmark now, its beat was cut as a side quest). Facts: `video/docs/v5/research/factlock.md` (the plant is a plan: draw
it as a plan, never a finished building; no company names or logos).

**The rules the picture must keep** (read what your job needs; the owner's words in the playbook outrank the rest):
`video/docs/OWNER_PLAYBOOK.md` (Hook and pacing: frame 0 is the scene being drawn, the hook made physical, the payoff in
words by ~2 s, never a still frame; Storyboard (G3) and flow: one flowing story, every join carries something, every
shot reads with the sound off, words in the picture few and big; Visual style: one subject at a time, scale moments,
people small, Pip hidden), `video/docs/look/DIRECTION.md` (the one page), `video/docs/look/CRAFT.md` §a (the thread,
the carriers A-F at every join, at most 2 plain cuts), `video/docs/look/LAYOUT.md` (the 1080 x 1920 frame, the caption
band, where the subject sits), `video/docs/look/CINEMATIC_GUIDE.md` (shot recipes, the opening, scale cues),
`video/docs/G3_ANIMATIC.md` (what the next gate will play from this script).

**Style-neutral:** the look is still being found (the city-poster study, the look tests). The visual script decides
content, staging, camera, timing, joins, words on screen and sound cues; never palette, rendering, texture or line style.

**Files (this folder):** `research_formats.md`, `research_craft.md` (the two research lanes), `METHOD.md` (how we write
a visual script: the format and the steps, from the research), `concepts/A.md`, `B.md`, `C.md` (three visual
concepts), `judge_story.md`, `judge_craft.md`, `VISUAL_SCRIPT.md` (the one for the owner), `review_cold.md`,
`review_critic.md`.

**Every agent:** writes its file from its FIRST step and updates it as it goes (a usage limit can stop it at any
moment); returns at most 3 short lines; never runs a git command that changes the index or history (the orchestrator
commits); never touches `video/src`, `video/public`, `video/out`; starts no agents (if it ever does, they run at max
effort); cites a source (URL) for every research claim and marks its strength (a studio's own account, a textbook or
guide, a practitioner's advice); never bbc.co.uk. WebFetch may be missing: fetch with curl through the session proxy
and read as text.
