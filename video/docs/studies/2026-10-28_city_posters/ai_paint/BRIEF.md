# AI-painted backgrounds: the test brief (iteration; waits for an API key)

**The owner** (2026-10-29), after our own painter's three stills ("The drawing quality is not the same it needs to be a
bit more subtle and more beautiful / Also I like the drawing style in these two more"; "And again even clouds have layers
that give a sense of depth but yours do not"), asked what AI-painted backgrounds are, then: "I mean let’s try and see if
it gets us there".

**Status:** BLOCKED on a key. There is no image-model API key in the environment. The owner adds one in the environment's
settings (Network secrets, or an environment variable): `REPLICATE_API_TOKEN` is the default plan (api.replicate.com is
reachable from the container); `FAL_KEY` is the alternative. A NEW session picks it up, so the test runs in a helper
session started after the key exists. Never print, file or commit the key.

## The test (one still, about an hour, one agent: playbook "Two modes")
- **Base:** v2's scene 1 at 1.0 s, the same base as our own painter's stills (`../paint_test/`), so the comparison is fair:
  `src/look/paint_s1/` (entry `src/entry-look-paint.tsx`) and its paint-off frame.
- **What the model paints:** ONLY the background pieces: the sky with layered clouds (2-4 planes, far ones paler and
  flatter toward the horizon), the far city haze behind the bridge, the tree. Generate each from OUR render of that
  piece (its flat shapes, `PaintBakeFrame` in `src/lib/paint/bake.tsx`) with structure control (img2img at moderate
  strength, or a canny or depth ControlNet), so the layout and shapes stay ours.
- **The style:** steered by words and by our references, never by naming a living artist: the painting-style models
  are `video/docs/look/refs_human_scale/03_beach_dusk.jpg` and `02_bus_stop_night.jpg` (big simple masses, a few broad
  strokes, soft dry-brush edges, one colour family and one light, atmosphere over detail); the scene's own October
  evening light (the low sun on the left) and v2's palette.
- **What stays ours and crisp:** her, the people, the door and the "Google" sign, Pip, the captions, everything that
  moves. Composite the painted plates through `PaintedLayer` (each locked to its plane's group, so the float can move
  them later).
- **Seeds and settings fixed and logged** (model id and version, prompt, strength, seed), so a plate can be regenerated.
- **Output** (`video/docs/studies/2026-10-28_city_posters/ai_paint/`): `ai_still_v1.png` (also
  `video/deliverables/tests/ai_painted_scene1_still_v1.png`), `compare.jpg` (v2 flat, our painter's latest still, the AI
  still, refs 03 and 02), `NOTES.md` (the model, settings, cost, time per plate, what held and what drifted, the
  consistency plan for a whole film: a style reference, fixed seeds, the same layout per shot), and the script in
  `video/scripts/look/aipaint/`.
- **Stills only** ("Again let’s start with stills"; "No video yet").
