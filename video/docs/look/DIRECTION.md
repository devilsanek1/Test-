# DIRECTION: how every video looks and tells its story now (one page; only the owner's words outrank it)

**The single source of truth for our current visual and storytelling direction** (owner, 2026-10-27: the next agent
must not be "confused with conflicting instructions"). Read it before any visual work, with the playbook
(`docs/OWNER_PLAYBOOK.md`) and `docs/PIPELINE_V2.md`; the film's one style page (`docs/vN/STYLE.md`) picks its values
inside these rules. Each rule links the section with its numbers, code and checks (paths from `video/`; bare names are
in `docs/look/` or `docs/`). **In short:** one flowing story about one thing, in a full, calm, cozy world of hand-drawn
flat colour, drawn clean and lit gently.

**Which doc wins** (the full statement; other docs repeat its first line):
1. **The owner's words:** the playbook, and for one film what the owner said in `docs/vN/OWNER_NOTES.md` (the quoted
   words; the "-> what we did" half of a line is our log, with no owner rank). The newest owner note wins over an
   older one.
2. **Then, in order:** this page > `CRAFT.md` (numbers, code, checks) > `docs/PIPELINE_V2.md` (gates) >
   `docs/G3_ANIMATIC.md`, `docs/G5_BLOCKING.md` (gate specs) > the look docs in `docs/look/` > the film's STYLE.md (its
   values only: it never restates or overrides a rule) > the v1-era docs (API and measurements, never style). Between
   two look docs, each wins on its own topic (`STORYBOARD_STYLE.md` the board's drawing, `CINEMATIC_GUIDE.md` shot types
   and camera numbers, `COZY_AND_SCALE.md` cozy framing, `LIFE_AND_DENSITY.md` fullness and life, `PALETTE.md`
   colour), and a measured number beats a proposal.
3. **Beside the ladder, each on its own topic and under the owner's words:** `docs/CREATIVE_BRIEF.md` (the channel,
   story selection, writing; the playbook's later rules win where they differ, as its banner lists), `docs/ELEVENLABS.md`
   with `docs/voice/` (the narration), `docs/POSTING_KIT.md` (posting). `CLAUDE.md` and `HANDOFF.md` summarise and map
   these: a clash there is a stale summary.
A clash is a bug: fix the lower doc in the same turn.

## The rules
- **1. One flowing story, never shots stitched together.** One story on ONE core line (spine first, each line following
  from the last) and a through-line card: one thread object carrying the arc (on screen >= 80 %, no gap over 3 s
  except the one scale reveal and an owner-approved fairness stretch, declared on the card), one home place (at most 3 places; a chart is paper where you already are), one "you",
  the mascot on both sides of every join. Every join carries something (A push-through, B thread match, C continuous
  camera, D object carry or wipe, E card flip; F plain cut: at most 2, on a "But" turn; a dissolve is no carrier), its
  midpoint on the next sentence's first word; shots (panels) average >= 3.5 s. Sound off, every shot reads: literal
  beats clever. -> `CRAFT.md` §a; engine types per carrier: `G5_BLOCKING.md` §2.
- **2. Attention hierarchy: one subject at a time.** Tier by STORY ROLE, never depth: A, the beat's 1-3 subject objects,
  owns the contrast, the hero colour, the only full outline and >= 60 % of the motion; B, supporting life (people near
  the story, the mascot): soft (C* <= 25), small, steady, a tinted line or none; C, the environment: no outlines, low
  contrast, slow life only. The film's recurring living character is in every shot (Pip by default, drawn new per
  film; another character only if the story asks, named in W1), tier B unless the line is about it: <= 1 % of the
  frame. Squint at phone size: the eye is on the beat's subject. **Depth and separation too** (owner, v2 G4): the
  subject never melts into what is behind it (its own value against a calmer field); distance shows in colour (far
  planes lighter, cooler, less saturated, simpler: atmospheric perspective in flat colour) and in perspective (a ground
  that recedes: converging edges, foreshortening, things smaller and texture finer with distance, overlaps), never a
  flat elevation of stacked bands; a few subtle particles (motes, a leaf, glints) make it natural. -> `CRAFT.md` §b, §f;
  `LIFE_AND_DENSITY.md` §5.
- **3. Alive but calm: full, never empty, never busy.** Every paused frame is full: a world made of things, people
  (small and simple like reference 1, seen from behind or in rear 3/4, no faces: they act with their pose, near heads
  <= ~140 px, many at rest; in the foreground only the one "you" or the mascot, strangers small in the mid and far
  ground), layered depth, things cut by the edges, no hole bigger than the caption band. Life never stops (clouds,
  steam, snow, birds, a window lighting, walkers) but stays small, slow and low in contrast: at most 3-4 noticeable
  supporting movers at once, taking turns, none entering in the 0.4 s around a join. Subtle means lighter, never
  removed; counts are examples and meters warn, never quotas. The bar is the film's own G3 density key (v3's G5b pilot
  O1 shows only how full). Everything is drawn new for each film (sets, people, props, Pip, music); engine, tools and
  QA are reused, and `lib` pieces are references. -> `LIFE_AND_DENSITY.md` §0-7.
- **4. A clean, premium line, never rough or messy.** A: one closed outline (3.0 px, in the object's own deep, warm
  shade: our reading of the owner's "black outlines, VERY subtle, in key places", never one near-black ink on
  everything; the owner judges it in each G4 look clip) and a few thin inner details; B: no outline (a thin same-hue
  line only on the mascot and line-drawn figures); C: none (wires as hairlines). Each shape one closed path: no corner
  crossings, gaps, overshoot, jitter or doubled strokes; fills meet their line exactly; an object draws on as one
  stroke; no boil; big areas flat, no specks, ticks, hatching or grain; the owner's halftone is the one optional
  texture, a last step; captions keep the dark ink. The clean pen (`src/lib/pen.ts` `setPen('clean')`) draws the film;
  the sketch pen and the scribble mass stay on the G3 board. -> `CRAFT.md` §c.
- **5. Gentle light and shadow, always there.** One light rig per set (a key on one side, one shadow tint family, the
  pool colours), kept in all its shots; a source never moves between cuts; the brightest area sits on the subject;
  light is lighter than what it lights, shown on what it hits (never glow discs, blur or gradients, the sky's gentle gradient aside: rule 6; a halo is one step
  of at most 1.7x, or none). Shadows are colour, never grey, gentle in value, flat in shape: contact under all that
  touches a surface, form away from the key, cast along the light; rim light only on the subject; night is
  temperature, not darkness. -> `CRAFT.md` §d; `scripts/qa/check_light.py`.
- **6. Warm, soft colour, never sickly.** One sister palette per film, proposed in the W1 world bible (its rigs and
  colour script are written in its terms) and approved with the G4 look clip: a soft light page of many fills (warm by
  default), one hero on the story's object, one tinted dark anchor (~5 %), at most one pop ("look here"). Peach
  creams, terracotta, rose, leaf sage, golden light, plum and red-brown shadows; never beige, muddy tan, olive or
  grey; a warm world held by one cool field; saturation as confetti, never fields. Money and everyday life: #9 Autumn
  Ember (#7 Autumn Ochre read sick). **One continuous sky** (owner, v2 G4): from the frame top to the horizon the sky
  is ONE gentle, smooth gradient (the owner's opt-in: the sky is the one place a gradient is welcome; "find a beautiful
  way to do a gentle gradient"), warmest at the sun and the horizon, dithered so it never bands on a phone, nearly
  flat inside the caption band (captions keep their contrast); the far haze takes the sky's lowest colour; no two big
  fields of unrelated colour meet in a seam no object explains. -> `PALETTE.md`; `COZY_AND_SCALE.md` 3b.6; `CRAFT.md` §f;
  the sky: `CRAFT.md` §g (`lib/sky.tsx`, `check_banding.py`, the master encode).
- **7. Cozy, with occasional great scale.** Cozy is the home feeling (>= 50 % of the runtime outside full-frame charts):
  a place that holds you without shutting you in (masses on 2-3 sides, one opening the subject faces), life passing
  through sideways, broken once at most, at the turn; it evolves one measured owner reference at a time. Scale: 1-2
  moments (~1.5-4 s each), one of them the film's ONE big move (S1 rise-over or the owner's favourite, the S5
  pull-back crane, retimed to the reel: S5's default is a 2.6 s move + a 0.7 s hold); a scale beat never arrives by a
  plain cut except on a "But" turn (rule 1). It must feel GREAT: a world that keeps going past every edge, a landmark
  huge yet far, tiny anchors, a big sky, life in the hold. Arcane gives environments and camera only. ->
  `COZY_AND_SCALE.md` §1-3b; `CINEMATIC_GUIDE.md` S1, S5, "Scale cues".
- **8. Motion and camera.** 60 fps from G3 on, timed in seconds; drawn poses may step while the camera glides. Things
  pop, grow, wipe or slide in; a draw-on is frame 0's, and after it only where the drawing is the beat (a chart line
  in step with the voice); no opacity fades (a dissolve only as a declared time-passing exception). A reference gives
  a move's SHAPE, never its speed (retime it, usually faster; one speed budget, readable at 1x). Every hold is locked
  or a slow float, never a zoom; a float is a gentle PARALLAX float (owner, 2026-10-28: planes move by depth, the
  near ground most, far planes little, the sky and the caption band not at all; back at rest by every join and on
  every map-critical frame; `lib/depth.ts` parallax helper); a zoom is a visible story move or a carrier; no roll, no compound moves; visuals
  lead their word by ~0.1 s. -> `G3_ANIMATIC.md` §4; `PIPELINE_V2.md` "Frame rate"; `COZY_AND_SCALE.md` 3b.5.
- **9. The opening is a banger.** Frame 0 is the scene being drawn, in the clean pen: the subject's outline (with B's
  tinted lines) draws on, C lands as flat pale shapes and colour floods in within ~0.3 s, with the core line in words,
  the voice from the first frames (the first word at ~0.12 s, the locked voice file's lead) and a positive phone sound
  in the first second; the hook made physical in ONE continuous shot (the expected thing, then reality overtaking it
  at ~2 s through the real mechanism), something new every few frames from the subject's own build, never from extra
  life. It loops back to frame 0's drawing state; 30-45 s, ending near the payoff. The lined films drew every shape's
  line first (a bare-line frame 0); the owner sees this clean-pen version in the next G4 look clip. ->
  `CINEMATIC_GUIDE.md` "The opening"; playbook Hook and pacing.
- **10. Captions** pop in place, burned in, never a roll-in that clips letters; the caption band (screen y ~290-600) is
  one calm flat field (no lines, detail or shadow edge across it); ink on light, white on dark. No key read in the
  platform UI zones (top, bottom, right rail: `G5_BLOCKING.md` §2 "Screen zones"). No paper edge at the top or beside
  the band (edges: opt-in per film, decided with the G4 look clip, 'paint-subtle' at most). -> `G5_BLOCKING.md` §2,
  §5; `EDGES.md`.

## The approved pipeline (owner, 2026-10-27: "Yes"; gates and budgets in `docs/PIPELINE_V2.md`)
A DESIGNED sketch: G0 topic (then the fact lock) -> G0.5 core line (and the draft of its through-line card) -> G1
story-first script (the card completed from the script's joins, approved with it) -> G2 voice (the owner's voice through
the API), with W1, a text world bible (sets, one light rig per set, the proposed palette and a colour-script line per
beat, tiers per shot) -> **G3** the animated sketchbook at 60 fps, deciding story, joins and carriers, camera, thread,
tiers (grey), rig (shapes) and mover budget (`G3_ANIMATIC.md`) -> **G4**, after the G3 lock: a 6-8 s look clip of the
home set in the final style (it opens with frame 0 being drawn), approved before the G5 lanes -> **G5** fills the G3
tier masks in colour: one lane per sequence, one owner for every transition, nothing new (`G5_BLOCKING.md`) -> G6
polish -> G7 sound -> G8 final. Text and audio only before G3, then one playable video per gate, labelled with its
stage; the owner may skip gates by name. The clean pen's first test is the v3 rework's first-sequence pilot
(2026-10-27); if the owner finds it cheap there or at a G4 look clip, ask about building the world first (retro §6).

## Retired (never use these; the v1-era docs keep them only as history, under a banner)
- Scratchy film lines (jitter, overshoot, open contours, double strokes, taper everywhere) and misregistered fills
  (`style_bible.md` §3-4, `motion_spec.md`): the clean pen.
- Line weight or detail by depth (`style_bible.md` §3, `ENGINE.md` rule 8, the old G3 "detail gradient", the "ink
  full, full, hairline, none" ladders): lines by story role; distance only calms colour and merges small parts, one
  flat step per plane (rule 2's depth, `CRAFT.md` §f).
- Equal-weight clutter: dressing, crowds or the mascot as loud as the subject; specks, ticks, hatching, dash rows,
  squiggles, grain.
- An events-per-second quota or a density FAIL (`ENGINE.md` rule 6, `motion_spec.md` §9, ref 2 as a floor, the old
  "BUSY" profile): events/s and the meters are information.
- A plain cut by default, "change size and angle at every cut", a zoom over 2x turned into a cut-in, a dissolve as a
  join: every join carries something (rule 1).
- A new place per chart (a street noticeboard, a billboard), a colossus in every scene, 2-3 scale peaks per film
  (`ENGINE.md` rule 9).
- Life and detail bolted onto a finished sketch, or a G5 that adds movers, places or tier promotions: they are designed
  into each shot, with their tier, at G3.
- A zoom, push or "breathe" in any hold (ref 2's per-shot zoom, the old "push 3-5 %", the S3/S4 pull-outs).
- A light that moves or hops between cuts, the sun as a character or idle motion (v1, `CINE.md`); glow discs and halo
  rings standing in for light.
- The mascot hopping across cuts on its own (it rides the carrier or keeps its spot); strangers' backs in the
  foreground, in any film.
- Faces on people (a protagonist's "face beat", v3's waist-up "you" facing us): people act with their pose; only the
  mascot has a face (rule 3).
- The G4 look made in parallel with G3 (stills, or a clip before the lock): the look clip follows the G3 lock.
- One house kit (sets, people, Pip, music) reused across films, or `lib/cine` drawing pieces in film code: each film
  draws its own; engine and tools are reused.
- The full-colour loop seam (`ENGINE.md` intro): the last shot un-builds into frame 0's drawing state.
- v3's G5b density plan, its per-panel lanes and its S4 (a chart on a street board with a row of strangers' backs) as
  models; the pilot's O1 shows only how full a world can be.

**Still in force, unchanged:** the API voice (`docs/voice/API_QUICKSTART.md`, `docs/ELEVENLABS.md`), story-first
scripts, the posting rules (`docs/POSTING_KIT.md`), MAX effort for every agent and helper, no token limit for creative
work, feedback captured the same turn. The v1-era docs (`style_bible.md`, `style_bible_ref2.md`, `motion_spec.md`,
`ENGINE.md`, `EDGES.md`, `CINE.md`, `BRIEF.md`) carry a banner: they remain the engine API and reference
measurements; their look rules yield here.
