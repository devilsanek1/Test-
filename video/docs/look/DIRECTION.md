# DIRECTION: how every video looks and tells its story now (one page; it wins)

**The single source of truth for our current visual and storytelling direction; it wins over every older doc** (owner,
2026-10-27: the next agent must not be "confused with conflicting instructions"). Only the owner's own words outrank
it (`docs/OWNER_PLAYBOOK.md`, "the playbook"; for one film, `docs/vN/OWNER_NOTES.md`): a clash is a bug, fixed here in
the same turn. Start every video by reading this page, the playbook and `docs/PIPELINE_V2.md`; the film's one style
page (`docs/vN/STYLE.md`) picks its values inside these rules. Each rule links the section with its numbers, code and
checks (paths from `video/`; bare names are in `docs/look/` or `docs/`). **In short:** one flowing story about one
thing, in a full, calm, cozy world of hand-drawn flat colour, drawn clean and lit gently.

## The rules
- **1. One flowing story, never shots stitched together.** One story on ONE core line (spine first, each line
  following from the last) and a through-line card: one thread object carrying the arc (on screen >= 80 %, no gap over
  3 s except the one scale reveal), one home place (at most 3 places; a chart is paper where you already are), one
  "you", the mascot on both sides of every cut. Every join carries something (A push-through, B thread match, C
  continuous camera, D object carry, E card flip; F plain cut: at most 2, on a "But" turn), midpoint on the next
  sentence's first word; shots average >= 3.5 s. Sound off, every shot reads: literal beats clever. -> `CRAFT.md` §a.
- **2. Attention hierarchy: one subject at a time.** Tier by STORY ROLE, never depth: A, the beat's 1-3 subject
  objects, owns the contrast, the hero colour, the only full outline and >= 60 % of the motion; B, supporting life
  (people near the story, the mascot): soft (C* <= 25), small, steady, a tinted line or none; C, the environment: no
  outlines, low contrast, slow life only. The mascot (Pip by default, new per film, in every shot) is B unless the
  line is about it: <= 1 % of the frame. Squint at phone size: the eye is on the beat's subject. -> `CRAFT.md` §b.
- **3. Alive but calm: full, never empty, never busy.** Every paused frame is full: a world made of things, people
  near and far (small and simple like reference 1, from behind, near heads <= ~140 px, many at rest), layered depth,
  things cut by the edges, no hole bigger than the caption band. Life never stops (clouds, steam, snow, birds, a
  window lighting, walkers) but stays small, slow and low in contrast: at most 3-4 noticeable supporting movers at
  once, taking turns, none entering in the 0.4 s around a join. Subtle means lighter, never removed; meters warn,
  never set quotas; the v3 G5b pilot shows how full (never how busy or how drawn). -> `LIFE_AND_DENSITY.md` §0-6.
- **4. A clean, premium line, never rough or messy.** A: one closed outline (3.0 px, the object's own darker shade,
  never near-black) and a few thin inner details; B: no outline (a thin same-hue line only on the mascot and
  line-drawn figures); C: none (wires as hairlines). Each shape one closed path: no corner crossings, gaps, overshoot,
  jitter or doubled strokes; fills meet their line exactly; an object draws on as one stroke; no boil; big areas flat,
  texture minimal and last; captions keep the dark ink. The clean pen (`src/lib/pen.ts` `setPen('clean')`) draws the
  film; the sketch pen and the scribble mass stay on the G3 board. -> `CRAFT.md` §c.
- **5. Gentle light and shadow, always there.** One light rig per set (a key on one side, one shadow tint family, the
  pool colours), kept in all its shots; the brightest area sits on the subject; light is lighter than what it lights,
  shown on what it hits (never glow discs, blur or gradients). Shadows are colour, never grey, gentle in value, flat
  in shape: contact under all that touches a surface, form away from the key, cast along the light; rim light only on
  the subject; night is temperature, not darkness. -> `CRAFT.md` §d; `scripts/qa/check_light.py`.
- **6. Warm, soft colour, never sickly.** One sister palette per film, approved with the G4 look clip: a soft light
  page of many fills (warm by default), one hero on the story's object, one tinted dark anchor, at most one pop ("look
  here"). Peach creams, terracotta, golden light, plum and red-brown shadows; never beige, muddy tan, olive or grey; a
  warm world held by one cool field; saturation as confetti, never fields. -> `PALETTE.md`; `COZY_AND_SCALE.md` 3b.6.
- **7. Cozy, with occasional great scale.** Cozy is the home feeling (>= 50 % of the runtime outside chart inserts): a
  place that holds you without shutting you in (masses on 2-3 sides, one opening the subject faces), life passing
  through sideways, broken once at most, at the turn; it evolves one measured owner reference at a time. Scale: 1-2
  moments, ONE big move per film (the owner's favourite: the pull-back crane reveal), and it must feel GREAT: a world
  that keeps going past every edge, a landmark huge yet far, tiny anchors, a big sky, life in the hold. Arcane gives
  environments and camera only. -> `COZY_AND_SCALE.md` §1-3b; `CINEMATIC_GUIDE.md` S5, "Scale cues".
- **8. Motion and camera.** 60 fps from G3 on, timed in seconds; drawn poses may step while the camera glides. Things
  pop, grow, wipe, slide or draw on (no opacity fades; a dissolve only softens a carried join or shows time passing).
  A reference gives a move's SHAPE, never its speed (retime it, usually faster; readable at 1x). Cozy holds are locked
  or a slow 2D float, never a zoom; a story push is visible; no roll, no compound moves; visuals lead their word by
  ~0.1 s. -> `G3_ANIMATIC.md` §4; `PIPELINE_V2.md` "Frame rate"; `COZY_AND_SCALE.md` 3b.5.
- **9. The opening is a banger.** Frame 0 is the scene being drawn (bare lines, colour within ~0.3 s) with the core
  line in words, the voice from the first frames, a positive phone sound in the first second; the hook made physical
  in ONE continuous shot (the expected thing, then reality overtaking it at ~2 s through the real mechanism),
  something new every few frames from the story's own build, never from extra life. It loops to the bare-line frame 0;
  30-45 s, ending near the payoff. -> `CINEMATIC_GUIDE.md` "The opening"; playbook Hook and pacing.
- **10. Captions** pop in place, burned in, never a roll-in that clips letters; the caption band (screen y ~290-600)
  is one calm flat field (no lines, detail or shadow edge across it); ink on light, white on dark. No paper edge at
  the top or beside the band (edges: optional at G6, 'paint-subtle' at most). -> `G5_BLOCKING.md` §5.

## The approved pipeline (owner, 2026-10-27: "Yes"; gates and budgets in `docs/PIPELINE_V2.md`)
A DESIGNED sketch: G0 topic -> G0.5 core line + through-line card -> G1 story-first script -> G2 voice (the owner's
voice through the API), with W1, a text world bible (sets, one light rig per set, a colour-script line per beat, tiers
per shot) -> **G3** the animated sketchbook at 60 fps, deciding story, cuts, carriers, camera, thread, tiers (grey),
rig (shapes) and mover budget (`G3_ANIMATIC.md`) -> **G4** a 6-8 s look clip of the home set in the final style,
approved before the G5 lanes -> **G5** fills the G3 tier masks in colour: one lane per sequence, one owner for every
transition, nothing new (`G5_BLOCKING.md`) -> G6 polish -> G7 sound -> G8 final. Text and audio only before G3, then
one playable video per gate, labelled with its stage; the owner may skip gates by name. If the clean pen still looks
cheap at G4, ask the owner about building the world first (retro §6).

## Retired (never use these, even where an older doc still says them)
- Scratchy film lines (jitter, overshoot, open contours, double strokes); misregistered fills (`style_bible.md` §3-4).
- Line weight or detail by depth (`style_bible.md` §3, `ENGINE.md` rule 8, the old G3 "detail gradient"): by role.
- Equal-weight clutter: dressing, crowds or the mascot as loud as the subject; specks, ticks, hatching, squiggles.
- An events-per-second quota (`ENGINE.md` rule 6, `motion_spec.md` §9, ref 2 as a floor): events/s is information.
- A plain cut by default, or "change size and angle at every cut": every join carries something (rule 1).
- A new place per chart, a colossus in every scene, 2-3 scale peaks per film (`ENGINE.md` rule 9).
- Life and detail bolted onto a finished sketch: they are designed into each shot, with their tier, at G3.
- A zoom or slow push in every hold (ref 2; the old "push 3-5 %"): cozy holds are locked or a 2D float.
- A light that moves or hops between cuts (v1's sun character, `CINE.md`); glow discs standing in for light.
- The mascot hopping across cuts on its own (it rides the carrier); strangers' backs in front in a "you" film.
- One house kit (sets, people, Pip, music) reused across films: each film draws its own; engine and tools are reused.
- The full-colour loop seam (`ENGINE.md` intro): the last shot un-builds into the bare-line frame 0.

**Still in force, unchanged:** the API voice (`docs/voice/API_QUICKSTART.md`, `docs/ELEVENLABS.md`), the posting rules
(`docs/POSTING_KIT.md`), MAX effort for every agent and helper, no token limit for creative work, feedback captured
the same turn. The v1-era docs (`style_bible.md`, `style_bible_ref2.md`, `motion_spec.md`, `ENGINE.md`, `EDGES.md`,
`CINE.md`) remain the engine API and reference measurements; their look rules yield here.
