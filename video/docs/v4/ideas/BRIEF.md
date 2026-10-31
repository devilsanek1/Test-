# Video 4: the ideas round (2026-10-30, relaunched free)

**The owner's three rules above all** (playbook top): every frame is worth pausing on; READABLE IMAGINATIVE IDEAS;
frames planned and created WHOLE from the get-go (never a frame built thin and filled later for density). The bar is
those rules and each beat's feeling, never a past film (owner, 2026-10-30: "don't reference video 1 - i think this
would put agents in a box again": invent for this story). The loop: `video/docs/PIPELINE_V2.md` "THE LOOP NOW": beats -> IDEAS (this)
-> key frames made whole -> the shot plan (camera and joins written FROM the key frames) -> the animatic.

**Start from the feeling, never from a number** (CLAUDE.md rule 4): each beat's story moment and what the viewer
should FEEL are in the table below; plan every idea on `video/docs/look/FRAME_CARD.md` (the questions, feeling first)
and take its tools from `video/docs/look/DESIGN_LANGUAGE.md`.

**What is fixed (only this):** the voice: its words and their times (`video/public/v4/voice_words.json`, 42.24 s); the
facts (`video/docs/v5/research/factlock.md`: the plant is a plan, starting next year; no company names or logos); the
card's story-level choices (`video/docs/v4/THROUGHLINE.md`: one thread (the heat), one home place (Helsinki, a snowy
harbour neighbourhood at night with one warm window), one "you"); the people in use (`video/docs/look/PEOPLE_DESIGN.md`
top) and the words on screen (`video/docs/look/TYPE_GUIDE.md`). NOT fixed: the pictures, the staging, the camera, the
joins. `video/docs/v4/visual/VISUAL_SCRIPT.md` (v3) was written before any ideas: its pictures are ONE candidate
among yours, never a limit; ignore its camera.

**The beats** (one per line of the voice; what the viewer must understand and feel there):
| beat | the words (times in voice_words.json) | the viewer must get | what they feel |
|---|---|---|---|
| B1 | "Did you know Helsinki wants AI to heat seventy thousand homes?" | a surprising true claim about a real city: AI heating homes | surprise and curiosity: a cozy snowy city and an odd true idea ("wait, what?") |
| B2 | "AI actually runs on giant computers, in buildings called data centers." | AI is physical: giant computers in big buildings | a little awe: AI is a real, physical, huge thing, not a cloud |
| B3 | "Those computers get really hot." | they make heat | the heat rising: warm, a touch of alarm |
| B4 | "To put it into perspective, just one of these computers makes as much heat as FORTY kettles, boiling non-stop." | how much: one computer = 40 boiling kettles | playful astonishment at the size of it |
| B5 | "That's a lot of tea." | the joke lands | a smile and a breath: the joke lands |
| B6 | "Normally, data centers just use big fans to blow that heat outside." | the waste: everywhere, the heat is thrown away | a small pang: all that warmth thrown into the cold night |
| B7 | "But Helsinki WANTS that heat." | the turn: this city wants it | the turn: a spark of delight, the city reaching for it |
| B8 | "The city has a plan to use it, starting next year." | it's a real plan, soon (a plan, not built) | hope and anticipation: real, and coming soon |
| B9 | "So how would that work?" | the question: a door opens on the mechanism | leaning in: a door opens |
| B10 | "A big new data center would take the heat out of its computers with water in pipes." | water carries the heat away from the computers | clarity and satisfaction: "oh, that's how" |
| B11 | "Then pipes under the streets carry that heat into people's homes." | the pipes bring it under the city into homes | cozy relief: warmth travelling under the snow to homes |
| B12 | "So your chatbot could soon heat an apartment in Helsinki." | your own chatbot could warm a home: the payoff, and the loop back to B1 | personal warmth and a wink: your own chat warms a home; back to the start |

**The toolbox: consult it, never a cage; imagine first.** Plan each frame on `video/docs/look/FRAME_CARD.md` (feeling
first) and find its tools in `video/docs/look/DESIGN_LANGUAGE.md`. Imagine the frame first; THEN check it against the
composition library (`video/docs/look/COMPOSITION_SHOTS.md`, the owner's own reel ideas first) as a vocabulary, never a
menu to pick from first (owner, 2026-10-31): name any device you use and why it serves this beat's feeling. The world
and its staging: `video/docs/look/DIRECTION.md` (one subject at a time; depth and scale from a human viewpoint),
`COZY_AND_SCALE.md` (the home place held close; one big scale moment at most), `LIFE_AND_DENSITY.md` (a world alive,
designed into the frame, never added later), the playbook's "a place, never buildings standing alone". The look comes in
full at the key frames; your thumbnails stay value sketches, but each idea must be one our tools can paint: painter v7's
craft (`video/docs/studies/2026-10-28_city_posters/paint_test/`: its craft, not its mood; owner, 2026-10-31: v7 "lost
the feeling"), `ORGANIC.md`, `PAINT_RECIPES.md`, the winter night with one warm accent (`WORLD_BIBLE.md` §2-3), each
frame's darkness and contrast following its own feeling, the people in use, the words on screen. Hard constraints only:
the caption band (`LAYOUT.md` §1) is open sky or wall for the words; the app's buttons kept clear.

**The job (a lean round: one sequence):** ONE FILM CONCEPT first (one imaginative idea for the whole film: its world, its
central device, the thread's journey, the arc of feeling from the first frame to the payoff); then for each beat ONE
idea inside it, a chapter of it, and for the beats you are least sure of (at most four) one alternate. Each idea: a
title; one line (what the viewer sees, gets and feels); how it flows into the next beat (the camera comes later, from
the frames); a thumbnail drawn as ONE WHOLE FRAME (the 9:16 frame drawn small: the idea, the full world around it, the
light, the people, where the words sit), never a lone object on an empty field. Imaginative: the true mechanism shown
through a playful, readable picture, never a metaphor that needs explaining or bends the facts. Where a frame shows the
home place, it is the real Helsinki, specific (real photos of its harbour streets in winter, if you can fetch them: the
buildings, the street's things, the life; never a generic city), with the story's own marks on it (the heat).

**Every agent:** writes its files from its first step; returns at most 3 lines; no git index changes; no edits to
`video/src`, `video/public`; draws thumbnails as SVG/HTML rendered with `video/scripts/type/render.mjs` (any HTML page
to PNG; see `video/scripts/type/README.md`) or with Python; one render at a time; starts no agents.
