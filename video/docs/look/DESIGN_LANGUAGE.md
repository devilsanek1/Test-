# DESIGN_LANGUAGE: the toolbox as feelings and the tools that create them

**How to use this.** Start from the beat: what happens and what the viewer should FEEL (`FRAME_CARD.md` §1). Then
pick the tools below that create that feeling, open their guide for the recipe and the code, and invent the frame. Judge
it by the feeling it gives first (PIPELINE_V2, THE FRAME LOOP). A guide's numbers are EXAMPLES of what one frame
measured, never a target: each scene lands differently (owner, 2026-10-31: "Saying 65% contrast makes the agent force a
design actually sacrificing the feeling"; "the feel of distance is achieved with a 'visual' tool of layers").

Each aspect: **Wants** (the feelings, in the owner's words where they exist) · **Tools** (and where their recipe and
code live) · **Examples** (where measured settings sit) · **Checks** (mistakes only).

## The idea and the beat
- **Wants:** every frame worth pausing on; readable imaginative ideas; frames planned whole; one film, never a
  hodge-podge (CLAUDE.md "Feeling first").
- **Tools:** the story beats, idea thumbnails as whole sequences, the film concept, the hero frame (PIPELINE_V2, THE
  LOOP NOW); the through-line card (one thread, one home place, one "you").
- **Checks:** none by number: the frame loop's evaluator.

## Where the eye goes (focus and hierarchy)
- **Wants:** one place to look ("our scene is very busy"); the story's life and action where the eye is.
- **Tools:** the brightest light and the hardest value step on the subject; one colour accent; a frame within a frame,
  a lit opening, leading lines, a vanishing point, a figure against an empty field; everything else grouped into a few
  quiet masses (`COMPOSITION_SHOTS.md` Part 0-1, `organic/composition.md`).
- **Examples:** the measured focal positions and value steps in `organic/composition.md` and `COMPOSITION_SHOTS.md`.
- **Checks:** `composition_study.py frame` prints where the strongest calls fall (a diagnostic).

## Composition
- **Wants:** "layers and feel of distance", built a million ways: "not the concrete steps 'PUT A BUILDING HERE'".
- **Tools:** the owner's 41 reel ideas first, then ours (frames, moves, joins), each with what it says and the feeling
  it serves; the "By emotion" table (`COMPOSITION_SHOTS.md`; detail in `composition/`).
- **Examples:** the recipes `composition/recipes.md` (one way each).

## Depth and layers
- **Wants:** depth and air, never "suffocating"; the near frame small and subtle.
- **Tools:** near, middle and far planes; overlap; atmosphere (far planes paler, softer, closer to the sky's colour);
  near crisp, far painterly (`ORGANIC.md` §5); parallax in motion (`CINEMATIC_GUIDE.md`).
- **Checks:** `check_depth.py` notes (no air, melting silhouettes) as diagnostics.

## Scale and viewpoint
- **Wants:** "where a person would be about this size", the camera where a person stands; feeling small before something
  vast ("to feel small and scale").
- **Tools:** a person near the camera at a real size against a big world; size steps; the horizon's height
  (`CINEMATIC_GUIDE.md` "Scale cues", playbook DEPTH AND SCALE FROM A HUMAN VIEWPOINT, `refs_human_scale/`).

## Light
- **Wants:** "can we do the proper lights?": one story light done properly, gentle light and shadow.
- **Tools:** one story light with real falloff, named casters, rims on what it touches, a bloom only at the source; the
  light solve per plane (`organic/light.md`, `src/lib/light2/`, `src/look/v7_s1/bake/`).
- **Checks:** `check_light.py` (the caption band must stay clean: a real check; the rest diagnostics).

## Colour and value (contrast and darkness)
- **Wants:** "dark and contrast are great", warm never sickly; how light or dark follows each scene's mood ("each scene
  would have a different contrast level depending on what is shown and what the mood and setup is").
- **Tools:** one colour key at the source; a sister palette for the story (`PALETTE.md`); value grouping; the darks where
  the eye should go and quiet masses away from the action (DIRECTION rule 6).
- **Examples:** the keys by time of day (`CRAFT.md` §d), v7's low key (`paint_test/NOTES.md`, and why it lost the
  feeling).
- **Checks:** captions readable over the sky (contrast of the words), no banding on the master (`check_banding.py`).

## Shapes, edges and paint
- **Wants:** "subtle and more beautiful", painted pieces in one painted language, organic not "square and proper".
- **Tools:** shapes designed first; lost-and-found edges; MyPaint brushwork in passes, soft to crisp; the paper
  (`ORGANIC.md` §3-§4, `PAINT_RECIPES.md` + `paint_recipes/`, `scripts/look/paint/`, `src/lib/paint/`, `docs/EDGES.md`).
- **Examples:** the edge and flatness shares in `ORGANIC.md` §4.1 (what references measured).

## Life, density and coziness
- **Wants:** a rich, beautiful world, "each house is so alone" never again; alive but calm; coziness by enclosure.
- **Tools:** three scales of detail, the world going on past the edges, the place's own everyday life, the world kit
  (playbook A RICH, BEAUTIFUL WORLD; `LIFE_AND_DENSITY.md`; `COZY_AND_SCALE.md`).

## People and gesture
- **Wants:** "beautiful and pleasant", cool 20-30-year-olds, hair never one firm shape; people act with their pose.
- **Tools:** the people in use (`PEOPLE_DESIGN.md` top; code `src/look/people_dirs/`).

## Words on screen
- **Wants:** "premium, more interesting, dynamic and more engaging"; few words, big.
- **Tools:** `TYPE_GUIDE.md`; the caption band (`LAYOUT.md` §1).
- **Checks:** `gate_check.py` (captions in their band, inside the safe width, timed to the voice).

## Motion and the join
- **Wants:** alive but calm; "how animations and transitions fit"; every join carries something.
- **Tools:** the moves and joins in `composition/motion.md` and `COMPOSITION_SHOTS.md`; camera moves in
  `CINEMATIC_GUIDE.md`; the carrier rule (`CRAFT.md` §a).
- **Checks:** dead frames, the frame rate (`deadframes.py`, `gate_check.py`).

## Sound
- **Wants:** "be more intentional and educated about this effect and where it make sense to use".
- **Tools:** `SOUND_SYNC.md` (spend sync on the moments that matter, rest between, one release).
- **Checks:** an effect never before its picture; the voice in sync (`av_lag.py`).

## Hard constraints (the only fixed things; CLAUDE.md)
9:16 at 60 fps; captions in their band, popping in place; the app's buttons and bars kept clear; words that read at
phone size; no ink in the build; the people in use; no past film as a bar or example.
