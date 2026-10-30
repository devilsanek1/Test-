# Video 4: the ideas round (2026-10-30, relaunched free)

**The owner's three rules above all** (playbook top): every frame is worth pausing on; READABLE IMAGINATIVE IDEAS;
frames planned and created WHOLE from the get-go (never a frame built thin and filled later for density). The bar:
video 1's frame `video/docs/look/ref_v1_governments_frame.png` ("so many details and so coherent and so imaginative":
government buildings whose windows are browser windows, the sun as a power button, a plaza full of people with phones,
Pip on a post), and the owner's references. The loop: `video/docs/PIPELINE_V2.md` "THE LOOP NOW": beats -> IDEAS (this)
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

**The job:** for each beat, imaginative picture ideas a regular viewer reads in a second, each drawn as ONE WHOLE FRAME
thumbnail (1080 x 1920 drawn small: the idea, the full world around it, the light, the people, where the words sit),
never a lone object on an empty field. Imaginative like video 1: the true mechanism shown through a playful, readable
picture, never a metaphor that needs explaining or bends the facts. The film is one flowing story: say in a line how
each idea could flow into the next beat's (the camera comes later, from the frames). Each idea: a title, one line (what
the viewer sees and gets), the thumbnail.

**Every agent:** writes its files from its first step; returns at most 3 lines; no git index changes; no edits to
`video/src`, `video/public`; draws thumbnails as SVG/HTML rendered with `video/scripts/type/render.mjs` (any HTML page
to PNG; see `video/scripts/type/README.md`) or with Python; one render at a time; starts no agents.
