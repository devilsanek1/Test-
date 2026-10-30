# Video 4: the ideas round (2026-10-30, relaunched free)

**The owner's three rules above all** (playbook top): every frame is worth pausing on; READABLE IMAGINATIVE IDEAS;
frames planned and created WHOLE from the get-go (never a frame built thin and filled later for density). The bar is
those rules and each beat's feeling, never a past film (owner, 2026-10-30: "don't reference video 1 - i think this
would put agents in a box again": invent for this story). The loop: `video/docs/PIPELINE_V2.md` "THE LOOP NOW": beats -> IDEAS (this)
-> key frames made whole -> the shot plan (camera and joins written FROM the key frames) -> the animatic.

**What is fixed (only this):** the voice: its words and their times (`video/public/v4/voice_words.json`, 42.24 s); the
facts (`video/docs/v5/research/factlock.md`: the plant is a plan, starting next year; no company names or logos); the
card's story-level choices (`video/docs/v4/THROUGHLINE.md`: one thread (the heat), one home place (Helsinki, a snowy
harbour neighbourhood at night with one warm window), one "you"); the people in use (`video/docs/look/PEOPLE_DESIGN.md`
top) and the words on screen (`video/docs/look/TYPE_GUIDE.md`). NOT fixed: the pictures, the staging, the camera, the
joins. `video/docs/v4/visual/VISUAL_SCRIPT.md` (v3) was written before any ideas: its pictures are ONE candidate
among yours, never a limit; ignore its camera.

**The beats** (one per line of the voice; what the viewer must understand and feel there):
| beat | the words (times in voice_words.json) | the viewer must get |
|---|---|---|
| B1 | "Did you know Helsinki wants AI to heat seventy thousand homes?" | a surprising true claim about a real city: AI heating homes |
| B2 | "AI actually runs on giant computers, in buildings called data centers." | AI is physical: giant computers in big buildings |
| B3 | "Those computers get really hot." | they make heat |
| B4 | "To put it into perspective, just one of these computers makes as much heat as FORTY kettles, boiling non-stop." | how much: one computer = 40 boiling kettles |
| B5 | "That's a lot of tea." | the joke lands |
| B6 | "Normally, data centers just use big fans to blow that heat outside." | the waste: everywhere, the heat is thrown away |
| B7 | "But Helsinki WANTS that heat." | the turn: this city wants it |
| B8 | "The city has a plan to use it, starting next year." | it's a real plan, soon (a plan, not built) |
| B9 | "So how would that work?" | the question: a door opens on the mechanism |
| B10 | "A big new data center would take the heat out of its computers with water in pipes." | water carries the heat away from the computers |
| B11 | "Then pipes under the streets carry that heat into people's homes." | the pipes bring it under the city into homes |
| B12 | "So your chatbot could soon heat an apartment in Helsinki." | your own chatbot could warm a home: the payoff, and the loop back to B1 |

**Our recipes: the toolbox, never a cage (imagination first, inside what we have built).** Read before drawing:
- **Composition (every thumbnail):** `video/docs/look/COMPOSITION_SHOTS.md` Part 0 (the ranked library: CORE first, the
  owner's 41 ideas first) and Part 0b (the guidelines: the frame's grammar kept in EVERY frame, such as the thirds, the
  soft near layer, the atmospheric layers, the one colour accent; one lead device per frame; the rhythm: 6-9 different
  lead devices across the film), with `composition/library_sheet.png`. Each idea names its lead device by the
  library's code. The frame itself: `video/docs/look/LAYOUT.md` §1 (the caption band y 290-600 is the open sky or wall
  the words sit in; the read zone y 600-1250 where the idea plays; the app's UI zones kept clear).
- **The world and the story's staging:** `video/docs/look/DIRECTION.md` (one subject at a time; depth and scale from a
  human viewpoint; the home place), `COZY_AND_SCALE.md` (the home place held on 2-3 sides; at most one big scale
  moment), `LIFE_AND_DENSITY.md` (the world full and alive in its calm tier, designed into the frame, never added later),
  the playbook's fullness rule ("a place, never buildings standing alone").
- **The look (applied in full at the KEY FRAMES; your thumbnails stay value sketches, but each idea must be one that
  can be painted this way):** painter v7 (`video/docs/studies/2026-10-28_city_posters/paint_test/paint_still_v7a.png`),
  `ORGANIC.md` and `PAINT_RECIPES.md` (painted pieces, organic shapes, one story light), the dark night key with one
  warm accent (`WORLD_BIBLE.md` §2-3: the palette and the light; ignore its density keys), the people in use, the
  words on screen.
- **Later steps use the rest:** the shot plan takes the library's moves and joins and `SOUND_SYNC.md`.

**The job:** for each beat, imaginative picture ideas a regular viewer reads in a second, each drawn as ONE WHOLE FRAME
thumbnail (1080 x 1920 drawn small: the idea, the full world around it, the light, the people, where the words sit),
never a lone object on an empty field. Imaginative: the true mechanism shown through a playful, readable picture,
never a metaphor that needs explaining or bends the facts. Where a frame shows the home place, it is the real Helsinki,
specific (real photos of its harbour streets in winter, if you can fetch them, give the buildings, the street's things
and the life; never a generic city), and the story's own marks are on it (the heat).
**One film, never a hodge-podge (`video/docs/PIPELINE_V2.md`):** your sequence starts from ONE FILM CONCEPT (one
imaginative idea for the whole film: its world, its central device, the thread's journey, the arc of feeling from the
first frame to the payoff); every beat's idea is a chapter of it, and each beat's two ideas are two takes inside it. The film is one flowing story: say in a line how
each idea could flow into the next beat's (the camera comes later, from the frames). Each idea: a title, one line (what
the viewer sees and gets), the thumbnail.

**Every agent:** writes its files from its first step; returns at most 3 lines; no git index changes; no edits to
`video/src`, `video/public`; draws thumbnails as SVG/HTML rendered with `video/scripts/type/render.mjs` (any HTML page
to PNG; see `video/scripts/type/README.md`) or with Python; one render at a time; starts no agents.
