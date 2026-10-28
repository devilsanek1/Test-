# Owner playbook: everything the owner has told us, as rules

This is the memory of the owner's feedback across videos: **approach-level rules only** (how we design and produce any
video). Read it before starting any video, and before every gate of `docs/PIPELINE_V2.md`. **Before any visual work,
also read `docs/look/DIRECTION.md`:** the one page of the current look and storytelling direction, distilled from the
rules below (its numbers: `docs/look/CRAFT.md`). Only the owner's words outrank it: this file, and for one film
what the owner said in `docs/vN/OWNER_NOTES.md` (the quoted words; the "-> what we did" half of a line is our log, with
no owner rank). The chain: Process, "New feedback is INTEGRATED"; in full, `docs/look/DIRECTION.md`'s intro.

**Capturing feedback (owner, 2026-10-26): split every note in the same turn and commit it.** A note about THIS video
(pick, line, take, shot) goes to `docs/vN/OWNER_NOTES.md`; a lesson about our approach goes HERE as a general rule with a
short evidence tag (vN, date); a concrete note that teaches something general goes to both. A reversed rule moves to
"Retired". The owner's master creative brief is `docs/CREATIVE_BRIEF.md`: the source for the channel, story selection
and writing, which this file does not replace; where a later rule here differs (the length, the sound effects, the voice
paste), the later rule wins, as the brief's banner lists.

Format: **rule** — why / evidence (video, date).

**Last reviewed for coherence: 2026-10-27 (sixth pass: a cold read as if starting video 4, every conflict it found fixed
at its source: the card's timing, one version, people without faces, Pip in every shot, the line's colour, parallel
work and the budget, the brief) · no size budget: coherent and clear wins over short** (owner, 2026-10-27; see
Maintenance at the end).

## Audience and goal
- **Short-form first: TikTok / Instagram Reels / YouTube Shorts, vertical 1080x1920.** — (v1, 2026-10-24).
- **Growth matters: maximise engagement with subtle, defensible hooks**: bait that is true, e.g. "the language everyone
  loves". Never misleading, and **never baity: the opening must never sound like a commercial.** A sales question to
  the viewer ("Buying a laptop soon?"), a pitch-like claim about their purchase, a shopping screen with a price and "Add
  to cart" as the first image: together they read as an ad, and people skip ads (v3: 60 % gone by ~2 s, skip rate
  64.5 % against v1's 32 %, no shares or saves). Open like a person telling surprising news they just found out (what
  happened, then why it matters to you), in a curious, credible voice, with the world's own picture first; before G2,
  a cold viewer panel hears the first line and sees the first frame and answers "does this sound like an ad or bait?":
  it must be no. — (v1, 2026-10-24; owner, v3 insights, 2026-10-28: "the engagement is much worse on this video now. My
  personal read is it sounds more like a bait commercial or rather way too baity".)

## Script and voice
- **A script is a coherent STORY, not a collection of true sentences about the topic.**
  - One throughline question, a situation the viewer is in, and every line following from the one before (joinable by
    "but", "so" or "because", never "and also"), building to a turn and a payoff.
  - Spine first, then lines. A list of facts to prove is input, never the structure.
  - Test: someone who hears it once can retell it as a story.
  — ("just a collection of sentences", v3 G1, 2026-10-26).
- **Everyday spoken language; check every sentence for AI-sounding wording.** — (v1, 2026-10-24). **Rhythm: never a run of
  long sentences; put a short one (5 words or fewer, e.g. "Let's find out." "But there was a problem.") after every 1-2
  long ones, at the turns,** gated by `scripts/voice/check_rhythm.py` OK at G1. — (owner's reference reel, 2026-10-27).
- **Scripts come with detailed emotional / delivery cues; the owner always gets the full script text with any take.**
  — (v1; "give me the full text to paste, not one line", v3, 2026-10-26).
- **We generate the narration with the owner's ElevenLabs voice through the API, for every video** (voice id and model
  in `docs/voice/VOICE.md`, procedure `docs/voice/API_QUICKSTART.md`, details `docs/ELEVENLABS.md`): paste format v2
  (few short tags, only at a paragraph start) with `check_paste.py` OK (it blocks every pattern that ever broke a take;
  only its `--handoff` text reaches the owner); `generate_take.py` (whole script first, auto-checked, auto-regenerated)
  with `report.json` `all_clean`; `check_take.py` MATCH on every take; send take.wav as an attachment; lock it into
  `public/vN/`; log it in `ELEVENLABS.md` section 5; commit and push after each step (pull first). **One full paste
  must narrate cleanly: a voice failure is our process bug, never the owner's problem** — fix it in the process. The
  key is the secret `ELEVENLABS_API_KEY`: never print, file, prompt or commit it. Only without the key does the owner
  paste it (then always the full paste text). Never a voice other than the owner's. — (owner's standing instruction +
  v2 take 1, 2026-10-26).

## Music and sound
- **Music: cinematic but subtle, especially at the start.** The voice and the hook carry the opening. — (v1).
- **Mix to -14 LUFS / -1 dBTP, voice always on top**; SFX land on visual hits. — (v1).
- **More sound effects, especially ones people link with something good on their phone** (like pop, notification ding,
  message-sent swoosh), **with one in the first second.** Our own sounds that evoke them, never Apple's or Instagram's. — (2026-10-25).

## Visual style (one page: `docs/look/DIRECTION.md`; numbers and checks: `docs/look/CRAFT.md`)
- **Hand-drawn flat colour like reference video 1, drawn CLEAN, REFINED, GENTLE, PREMIUM: never rough or messy.**
  Reference 1 gives the composition, the flat colour and the small people; the line is the clean pen: clean, confident
  lines (smooth, consistent weights, few of them, no jitter, no sketchy overshoot or double strokes), refined shapes,
  only the main thing with a full outline; hand-drawn warmth comes from shape and colour, not from scratchy lines.
  Spec: `docs/look/CRAFT.md` §c. — ("hand-drawn ink, flat colour, like reference video 1", v1, 2026-10-24; "too rough
  and messy, a lot of rough lines, not clean at all; cleaner, more refined, gentle, premium", v3 G5b, 2026-10-27; the clean pen with tiers and gentle light
  APPROVED at v2's G4 look clip: "okay good continue", 2026-10-27).
- **Learn from the city posters and experiment with that style in our films, starting from v2's look.** The owner's
  reference is seven illustrated city posters (`docs/look/poster_refs/`); v2 ("One Small Window") is the visual
  baseline the owner likes. What we learn from them (perspective, visual style, details, composition, and the one
  focus) is studied in `docs/studies/2026-10-28_city_posters/`; a lesson becomes a rule only once the owner approves
  it, and `docs/look/DIRECTION.md` stands until then. — ("i really like the style and i want us to experiment more with
  the style and the focus on our videos"; "i want to see how we can learn from these pictures in terms of perspective,
  visual style, details and composition"; "i think visually in the video about Google we have made good improvemnets in
  terms of overall style", 2026-10-28).
- **Light and shadow: gentle, but always there.** One consistent light direction per scene, soft form and cast shadows,
  gentle light pools that make sense; never absent and never "weirdly put". System: `docs/look/CRAFT.md` §d. — (v3 G5b,
  2026-10-27; "the shadows added are better", v2 G4, 2026-10-27).
- **DEPTH AND SEPARATION: every shot reads in distance, never a flat elevation.** The subject separates from what is
  behind it (its own value and contrast against a calmer field: a building in front never melts into the buildings
  behind it); distance shows in the colour (far planes converge on the air behind them: lighter, softer, simpler; cooler
  under a blue sky, warmer under a sunset: atmospheric perspective, in flat colour) and in perspective (a ground plane that recedes: converging edges, foreshortened steps,
  things smaller and paving finer with distance, overlaps), never stacked flat bands. A few particles make it natural, and
  they must be SEEN at phone size without searching (leaves you watch fall, glints that sparkle, motes in the light):
  calm, never invisible; leaves blown across the open mid ground are the proven one. Water gets the same clean, premium, refined
  drawing as everything else, never a lazy fill: a flat band with box-shaped reflection patches, scattered dashes and
  star sparkles read "way too cheap"; a film with water designs it (researched, the pro way) in its G4 look clip,
  as one shared component, before the lanes build it. Proven libraries are welcome where they help (researched,
  deterministic per frame for rendering). — ("the foreground and the main focus still blur with the background
  supporting entities ... the Google office vs the building in the background: all blurred together, not clear to
  separate one from the other, no distance effect, no perspective; the bottom part: little to no perspective or depth
  ... research some libraries on GitHub ... add a bit of particles here and there to make things more natural"; on v4: "I don't see any changes in the particles
  anywhere"; on v5: "I don't like the water too much, leafs are great"; "it's just looking way too cheap, not clean or premium
  quality or refined, just lazy and cheap"; on v6, the researched shared water (true reflections, a gold light
  column, still glitter, calm ripple lines): "Yeah this is better", v2 G4,
  2026-10-27/28).
- **A gentle PARALLAX float, never a flat card.** When a held shot floats, its planes move by depth (Disney's multiplane
  idea): the near ground most, far planes little, the sky and the caption band not at all; slow, small, back at rest
  by every join; it adds depth in motion without adding movers. — ("switch it on if you think it will make the videos
  better and improve engagement", v2 G4, 2026-10-28).
- **ONE CONTINUOUS SKY, a gentle gradient, no abrupt colour seams.** The sky is one sky from the top of the frame to
  the horizon: ONE gentle, smooth gradient (the sky is the one place a gradient is welcome), warmest around the sun and
  toward the horizon, dithered so it never bands on a phone, nearly flat inside the caption band so captions keep their
  contrast; the caption field is part of that sky, never a separate slab of another colour; the sun sits in sky that
  agrees with it, and the far city takes the sky's lowest colour as its haze. Generally: two big fields of unrelated colour never
  meet in a hard seam unless an object edge explains it. — ("what bothered me is different color of the space and sun,
  like why is it blue sky and then suddenly abruptly orange, weird"; "maybe when it comes to sky we can find a beautiful
  way to do a gentle gradient", v2 G4, 2026-10-27).
- **ATTENTION HIERARCHY: one main arc, one focus at a time.** The story's subject gets the contrast, line weight,
  saturation and the clear motion; supporting life (a bird, walkers, snow, steam) stays subtle (smaller, lower contrast,
  thinner or no lines, softer colour, calmer motion): alive, but never competing. Supporting environment may be drawn in
  a softer, simpler style than the subject; not every moving piece gets the same treatment. Too many equal moving parts
  = "I don't know what to keep my attention on". Tiers: `docs/look/CRAFT.md` §b. — (v3 G5b, 2026-10-27).
- **Every scene must FEEL ALIVE, calm and tiered: that is the key, not an object count.** A dense, detailed world (a
  city full of buildings and windows, a room full of real things), people near and far, layered depth, a recurring
  living character in every shot (Pip by default, as reference 1's cat and v1's Pip were; at tier B), ambient life
  that never stops (clouds, birds, steam, lights switching). A dense world makes a frame
  full even when little moves (Arcane's rooftop; the owner's riverside reference "doesn't feel empty at all"). The
  density sits mostly in the calm environment tier at low contrast, so full never means busy (`docs/look/CRAFT.md` §b).
  The bar: reference 1 (France) and v1 (PHP), then each film's own G3 density key; `scripts/qa/density.py` is a warning
  signal, never a quota; how-to `docs/look/LIFE_AND_DENSITY.md`. Big empty fields (nothing in them; flat colour itself
  is right) and an object alone on a blank wall are failures even in a draft. — ("way too empty", "feeling alive is
  absolutely the key", "less prescriptive on the amount of objects", v3 G5, 2026-10-26; "too busy ... too many moving
  parts", v3 G5b, 2026-10-27).
- **Scale moments, occasionally: make the viewer feel small**, using Arcane's camera work and staging, never its footage.
  Keep it nuanced (it's still TikTok). The owner liked v1's scale scenes. — (v1, 2026-10-24/25).
  **When a scale shot comes, the scale must feel GREAT**, like Arcane's rooftop end frame: a world that keeps going
  (hundreds of buildings shrinking into haze), a landmark that is huge yet far, tiny anchors (figures, birds, airships),
  the drop below the camera, a big sky with huge clouds, many depth layers. Recipe: `docs/look/CINEMATIC_GUIDE.md`
  ("Scale cues"). — ("another point in the Arcane shot is how great the scale feels", v3, 2026-10-26).
- **Arcane references: ENVIRONMENT ONLY** (cities, interiors as spaces, wides; no people), few and high-confidence; build on our own videos. — (2026-10-26).
- **The owner's favourite Arcane shot: the pull-back crane reveal** (S1E1 rooftop: the camera pulls back and rises until
  the sisters are tiny figures overlooking a vast city; "it has pretty much everything"): the model for a film's big reveal
  (`docs/look/CINEMATIC_GUIDE.md` S5). — (v3, 2026-10-26).
- **Second visual twist: coziness through a sense of enclosure**: framed, street-like spaces that hold the subject (ref
  `docs/look/ref_sense_of_enclosure.jpg`). Rules: `docs/look/COZY_AND_SCALE.md`. — (2026-10-25).
  **Coziness is a recurring topic we keep evolving, one reference at a time** (enclosure H:W ratios first; then the
  owner's 2026-10-26 reference: a painterly street seen from above, everyday traffic flowing calmly under flowering trees):
  each new reference is measured (composition, movement, texture, camera, details) and folded into `COZY_AND_SCALE.md`.
  — ("really figure out what about the scene brings out this feeling; this is a recurring topic we need to evolve", 2026-10-26).
- **Don't rely on reusable assets: every film's sets, characters, props, background life and music are made new for
  it,** in its own design (a new Pip drawing too). Engine primitives (light and shadow layers included), timing,
  captions and QA tools are tools, not assets; the kit pieces in `src/lib` (cine, kit, mascot) are references to learn
  from, never a film's sets, and a film never imports another film's folder (`src/vN/`). — ("Don't rely on reusable
  assets", v2 restart, 2026-10-27).
- **People small and simple like reference 1** (crowds, small full figures seen from behind or in rear 3/4, round
  heads; near heads <= ~140 px), never big character models or faces: they act with their pose (reach, shrug, slump,
  look up), as reference 1's do; only the mascot has a face. **In the foreground only the film's one "you" or the
  mascot;** strangers stay small in the mid and far ground (a row of strangers' backs in front reads as "you"). —
  ("don't use big models of people; the people in the first example video are the right direction", v2 restart,
  2026-10-27; v3 retro, 2026-10-27).
- **Captions are burned in and pop in place (or rise without clipping);** a reveal that cuts letters looks like a glitch;
  platform auto-captions stay off. — (v1 reel, 2026-10-25).
- **Paper edges ('paint-subtle') are liked, but never at the top of the frame or beside the caption band** (it read
  as a screen recording under the status bar). Each film decides them with its G4 look clip, 'paint-subtle' at most
  (`docs/EDGES.md`). — (v1 posted reel, 2026-10-25).
- **Palette: a family of house palettes as tools, not a cage.** A soft, warm, "no screaming colours" base; one sister
  palette per video; within it one hero, one dark anchor, at most one pop. Rules: `docs/look/PALETTE.md`. — (2026-10-25).
- **Warm, never sickly:** no beige, muddy tan, olive or grey; peach creams, terracotta, red-brown lines, golden light,
  warm shadows. — ("we need to have a warm feeling, not sick", v3 G4, 2026-10-26).
- **Texture and lines: VERY subtle.** Lines only in key places: the clean pen's tiers (the main thing's outline and a
  few inner details; `docs/look/CRAFT.md` §c). The owner's "black outlines" are read as dark, warm lines in the
  object's own deep shade, never one near-black ink on everything (v3 G5b's was "too rough"); captions keep the dark
  ink; the owner judges the line in each G4 look clip. Halftone tactically on a few elements as an optional last step
  (the film must work flat; the owner decides per video). — ("very subtle texture pieces and the black outlines, VERY
  subtle but in key places", texture test, 2026-10-25; "cleaner, more refined, gentle, premium", v3 G5b, 2026-10-27).
- **Profile identity: mascot Pip (the purple PHP elephant), drawn in each film's style;** avatar `deliverables/profile/pip_power_button.png`. — (2026-10-25).

## Hook and pacing
- **Every video has ONE core line, picked before the script (by default on the topic screen: each topic comes with its proposed core line, so the owner picks both at once; a separate core-line round only on request):** the single sentence at the core
  of the message with the biggest emotional reaction. It drives frame 0, the hook, the cover and the payoff; every line
  serves it. From the pick we draft its THROUGH-LINE CARD (one thread object, one home place, one "you":
  `docs/look/CRAFT.md` §a); the script (G1) completes it with a carrier for every join, taken from the script's own
  joins, and the owner approves the card with the script. The thread may also leave for a FAIRNESS beat the owner approves
  (the other side's equal-weight reply, a place the subject must never be): declare it on the card. — (v3, 2026-10-25; card:
  v3 retro, owner yes, 2026-10-27; fairness exception: v2, owner yes, 2026-10-27; picked with the topic by default: lean early stages, v4, 2026-10-28).
- **The first 3 s / first scene must be a banger ("something is about to happen"), and every opening effect must be
  BIG enough to stop a thumb:** judged as a viewer scrolling a feed on a phone, each effect (the draw-on, the hook's
  mechanism, the ticks) is unmistakable on first watch: bold, large on screen, long enough to register, with its own
  sound; a subtle effect counts as none. — (owner, v3, 2026-10-28: "initial animation effects like visual aspect should
  be better and more effective at capturing people attention ... the initial drawing effect is barely visible or
  noticeable and really don't impact or amazes me", of a 0.3 s pale draw-on and 30 px memory sticks.)
  - frame 0 is the scene being made, drawn on in the clean pen: the subject's outline (with the supporting lines)
    first, then colour floods in, as a visible event (bold line at full contrast, a moving pen tip, long enough to
    read: ~0.3 s was invisible), never a pale wash (the lined films drew every line first);
  - voice from the first frames (the first word at ~0.12 s, the locked voice file's lead; never a silent lead);
  - the hook's claim made physical and escalating: the expected thing shown, then reality overtaking it at ~2 s,
    through the real mechanism;
  - something new every few frames from the story's own build (the subject and its mechanism), never from extra
    supporting life; never still, in one continuous opening shot;
  - the film loops back to frame 0.
  Details: `docs/look/CINEMATIC_GUIDE.md`, "The opening"; `docs/look/DIRECTION.md` rule 9. — (owner's reference, v3,
  2026-10-26; the clean pen and one focus, v3 G5b, 2026-10-27).
- **State the payoff in words within the first ~2 s, in the voice's order; polish the first 2 s and 5 s most, then the
  first 10 s.** A calm, pretty opening lost ~80 % of viewers by 3 s; late quirks are acceptable. The captions ARE the
  words on screen: frame 0 shows the first spoken line, and when the voice opens with a question the payoff is the next
  caption (by ~2 s). Never a title over the captions (no `frame0` block): it answers before the question is asked and
  repeats the spoken line; the core line as a title belongs on the cover. — (v1 IG insights, 2026-10-25; v3,
  2026-10-28: "why do we have the text repeat itself?", then "Why are we having this out of order weirdly? Should we
  just show buying ..?").
- **The hook is a concrete, surprising, TRUE claim with stakes**, verified against the primary source before it's
  locked; for a small news item, research the bigger story and lead with its strongest true framing. — (v2, 2026-10-25).
- **Personal framings must feel natural, not over the top.** Never cast the viewer as a loser in a contest they don't
  feel; test "you" claims with a viewer panel. — (v3 G2, 2026-10-25).
- **Target 30-45 s and end close to the payoff** (viewers left once the story felt resolved, ~40 s). — (v1 insights).
- **Every frame at least 8/10, no dead frames, joins on the beat** (every join carries something: `docs/look/CRAFT.md`
  §a). — (v1; joins, v3 G5b, 2026-10-27).

## Storyboard (G3) and flow
- **The pipeline after v3 (owner APPROVED, 2026-10-27: "Yes"):** a DESIGNED sketch. From the core line comes a
  through-line card (one thread object, one home place, one "you"), completed with the script (a carrier for every
  join); a text world bible (sets, one light rig per set, the proposed palette and a colour-script line per beat,
  tiers per shot) runs alongside the script; the G3 animated sketchbook decides flow, focus and light, not just the
  story; after the G3 lock, a short playable LOOK CLIP in the final style is approved before the full build; G5 fills
  what G3 decided, one lane per sequence, with no new places or movers. The owner may skip gates by name. Details:
  `docs/retro/2026-10-27_v3_retro.md`, `docs/PIPELINE_V2.md`. — (v3 retro, 2026-10-27).
- **One flowing story, never a bunch of shots stitched together.** Every join carries the eye and the story into the
  next shot (a shared object, a match, a continuous camera, the subject's motion leading out and in); the main arc is
  visible across the whole film. Life and detail are DESIGNED into the shot together with its hierarchy from the start,
  never bolted onto a finished sketch afterwards ("we did the sketch first and then added a whole bunch of details to
  make it feel alive, which is wrong"). Through-line and transition grammar: `docs/look/CRAFT.md` §a. Sketch-first
  stays, as the designed sketch above (owner yes, 2026-10-27). — ("too busy, too incoherent; no story, no clean
  transitions, just a bunch of shots put together", v3 G5b, 2026-10-27).
- **G3 is the most important gate: an ANIMATED SKETCHBOOK of the final film, optimised for SIGNAL, not quality.** With
  script and voice locked, the animatic gives the director the closest signal to the final story in the least drawing
  and review time: story, transitions, animations and camera moves already very close to final — PLAYED, not only
  marked (their shape and timing real, never their polish); detail deliberately loose scribble-mass placeholders (the
  hand-scribbled texture: owner yes, 2026-10-27; the board's pen only, never the film's), nothing perfectly sharp but
  the backbone of the future film clearly visible, like an urban sketcher's page (ref
  `docs/look/ref_animated_sketchbook.png`); thumbnail drawings, the intent explicit (framing, the one action, shot
  type, cozy/scale) in a big readable note, lean review loops. Spec: `docs/G3_ANIMATIC.md`. — ("frankly the most
  important stage ... more like an animated sketchbook", 2026-10-26).
- **Every shot reads instantly with the sound off: literal beats clever.** Recognisable things (a laptop that looks like a
  laptop, a plain labelled chart), the real mechanism, never a metaphor the facts don't support or that needs explaining;
  a sound-off cold read before the owner sees any cut. **Words in the world (signs, notices, cards, screens) are few and
  big: each one reads at phone size at a glance, or it is not drawn.** No small source lines, quotes or fine print in
  the picture (sources go in the caption and the pinned comment), never the same words twice on screen at once, and
  nothing passes in front of words while they are the beat. Before any cut goes out, check every on-screen word at 0.25
  scale. — (v3 G3, 2026-10-26; v3, 2026-10-28: "this text is weird", the notice's 11-13 px source and Micron lines, a
  one-bar chart and a crate crossing its labels).
- **Drawn like a professional storyboard: monochrome, clarity first, and cinematic** (framing, angle, scale, coziness
  decided in the board; clarity from composition, never icons on blank paper; every panel names its shot type). Spec:
  `docs/look/STORYBOARD_STYLE.md`. — ("very simple, avoid colours for now", v3 G3, 2026-10-26).

## Taste signals (general preferences from the owner's picks; the picks themselves are in each video's OWNER_NOTES.md)
- **Topics: tech and AI news, and AI-ADJACENT news (science, health tech, space, robots, computers, energy: where AI is
  part of the story or right next to it), is the channel's focus** ("no too narrow, lets research some more - expand it to
  AI adjacent news", v4, 2026-10-28); the existing fuss (people already arguing about it) weighs as much as
  a direct wallet hit,** and an everyday consequence beats a bigger, distant story. — (v3 G0; v4 G0: "focus on tech and AI",
  picked AI songs over the wallet pick: "good amount of fuss about AI songs", 2026-10-27).
- **Topics are picked in the owner's order: relevant (with buzz and surprise) first, then true and solid, then
  visually appealing in our look, then the mood the slate needs, then fresh (news from about the last month), then
  shareable** (weights 6-5-4-3-2-1; a story
  that isn't true is out whatever it scores). The list the editor scores on, and the owner sees:
  `docs/TOPIC_CRITERIA.md`. — ("one important condition for the story pick is we should find a story that is going to
  be possible to make visually appealing ... give me the list of criteria"; then "lets make it relevant first but
  include buzz here too and surprise, then true and solid, then fresh, then visually appealing, then mood. Then
  shareabliity potential"; "lets move the freshness lower and make it last month or so", v4, 2026-10-28). The
  shortlist always comes with its column chart: for each story a column per criterion, the most important on the left
  (`video/scripts/topic_chart.py`; "can you show me the visual next time we do research ... some bar chart"; "make the
  visual into column chart", v4, 2026-10-28).
- **Topics: alternate the mood: a positive story after a negative one.** v2 (Google staff resigning), v3 (laptop
  prices) and v4's first pick (AI songs and fake plays) were all bad news, so the next is a very recent, highly
  relevant, genuinely POSITIVE AI story (e.g. AI helping find a medicine or beat a disease) with a hopeful outlook.
  Positive never means hype: the same standards check applies (trial phase, peer review, "helped" vs "did", who
  benefits and when). Every topic scout names the mood the next video needs. — ("we should alternate between positive
  and more negative topics ... something very recent, extremely relevant yet very positive around AI ... a nice
  positive outlook would be the right direction for a story", v4, 2026-10-28).
- **Places on screen: find the content that fits a world of cities, architecture and buildings.** The owner's examples
  are v1 (the best performer so far) and v2 (the look they like; its story was the weak part). Which stories fit is
  studied in `docs/studies/2026-10-28_city_posters/` (the content track) before it changes `docs/TOPIC_CRITERIA.md`.
  — ("I want us to see which type of content would be best fit into videos where we have more of cities /
  architectures / buildings / etc - so for example our very first video was the most successful so far and i
  personally like the last video about google i think the story wasn't quite good, but visually it was nice to be
  honest. Obviously still far away from what we could do to be very successful studio, but initial steps", 2026-10-28).
- **Lines: plain, direct and personal over clever;** a question to the viewer works as a hook. A plain line needs the
  frame-0 image, the first-second sound and the second line to bring the jolt. — (v3 G0.5-G2).
- **Core lines: one real person in their own (attributed) words over a plural headline.** — (v2 G0.5).
- **Palettes: the warm, everyday one for a money / everyday-life story** (#9 Autumn Ember; #7 Autumn Ochre read sick).
  — (v3 G4).
- **Palettes: the clean "news" one (Cream & Cobalt) for a serious story,** with a cold sister palette (Dusk) only for
  the one scale beat. — (v2 G4; that cut was later restarted, and the restart's own judges, not the owner, chose
  "10 Canal Mint").

## Motion
- **A reference move gives the SHAPE, never the speed.** Copy its path, framing, reveal order and easing shape, then
  retime it to the reel: speed up (usually) or slow down where it feels right. Speed limits exist only to keep motion
  readable and strobe-free (60 fps allows faster moves). — ("the speed of transition should not be the reference point
  ... in a short reel we would speed it up", v3, 2026-10-26).
- **Render at 60 fps from G5 to the final** ("smoother and more crispy"). Animate by time; drawn motion may stay stepped
  (12-24 drawings/s) while the camera glides; the G3 reel also renders at 60 (`G3_ANIMATIC.md`, 2026-10-26). — (v3, 2026-10-26).

## Process and communication
- **EFFORT IS ALWAYS MAX, for ALL delegated work:** every workflow and sub-workflow agent (`effort: 'max'` in each
  `agent()` call), every subagent (the Agent tool's `effort: "max"`; only a "fork" inherits the session's effort), every
  agent an agent starts (each brief says that anything its agent starts runs at max too) and every helper session (first
  prompt exactly `/effort max`, ultracode on; check `effort_level: max` with get_session). The repo enforces it, so no
  session has to remember: the PreToolUse hook in `.claude/settings.json` (`.claude/hooks/max_effort.py`) denies an
  Agent call, a Workflow run or a helper session that isn't at max, and `python3 .claude/hooks/max_effort.py
  --lint|--fix <workflow.js>` checks or repairs a script before it runs (every script in `context/workflows/` passes).
  A scheduled task fires into an existing max-effort session (a fresh session per firing can't take `/effort max` first).
  A lazy video from a low effort setting is our failure. — ("the key rule is we need to ensure the effort is MAX!", v2,
  2026-10-27; "remember to use max effort in the subworkflows and agents work" and "persist this rule in general in our
  repo - like all delegated work should be max effort", v4 G0.5, 2026-10-27).
- **Parallelize as much as possible, inside the weekly and session limits (below): split independent work across helper
  cloud sessions (each its own machine) and archive each one as soon as its work is pushed and checked;** a helper takes
  one independent lane that needs its own machine, briefed fully, and its done-signal is a report file. On one machine,
  run at most about 4 agents at once (this container runs about 2 render-heavy ones well; `docs/PIPELINE_V2.md` rule 5).
  Boot a helper from a branch whose `.claude/settings.json` says `"ultracode": true` with the first prompt `/effort max`,
  send the task as a message, check `effort_level: max` + `is_ultracode_active`. Every lane must PROVE it knows the
  film's style: one STYLE.md per film, with the film's VALUES only (palette and colour jobs, the pen's constants, a light
  rig per set, the tier map, people sizes, references, NEVERs), inside `docs/look/DIRECTION.md` and `CRAFT.md`, never
  restating or overriding a rule (v2's STYLE.md predates DIRECTION and is not the template), and a graded style check
  before it builds. — (v2/v3, 2026-10-27: "parallelize the work as much as you can, start more instances of cloud
  machines if you have to, but clean them up after"; "spin up as many parallel work sessions as you need"; "do each
  subsection understand ... the full stylistic direction?").
- **Playable video from the sketch animatic (G3) on, never only stills; before G3 text and audio only. One version: one
  deliverable per gate (one script, one take, one animatic, one look clip), never several renders or takes of one gate
  unless asked;** a choice the owner makes (the topic, the core line, the hook line) comes as up to 3 options on one
  screen of text. **Lock the story before big commitments; polish late.** — (v1, 2026-10-25; "why are there multiple
  versions and why is it needed at all at this point?", on three G2 MP4s of one take, v3, 2026-10-25).
- **Progress: the gate deliverable is the update; between gates, a short text status on all active threads** (about
  every 30 minutes in a long build), never a rendered status reel; lean prompts and docs. — ("every 30 mins share the
  progress on all active ongoing threads", v1, 2026-10-24).
- **Every cut sent to the owner says what stage it is and what the next stages add** (e.g. "G5: G3's plan in colour;
  next: G6 easing, G7 sound, full res"), so a draft is never mistaken for the final. — ("let me know if this is just an
  initial intermediate step", v3 G5, 2026-10-26).
- **The weekly limit is the real budget: finishing the video comes first** (using up to 100 % of the week is fine if the
  video is completed; with several films in flight they share it, and finishing them comes before starting a new one).
  Track the spend hourly (helpers' `cost_usd`, workflow tokens), budget every lane, finish before polishing. **Close to
  a limit, drop the low-signal stages first and keep what changes the film** (owner, v3, 2026-10-28: "we are getting
  close to our token limits can we drop some stages some redundant low signal work"): keep the fixes for problems already
  found and the master; drop a separate verifier when the final assembler re-checks every fix at its time, extra
  reviewers on a lens another already covers, full-film re-renders inside fix lanes (stills at the finding's time do),
  and the minors (listed as deferred, never silently). Resume stopped lanes scoped to their blockers and majors. The
  **5-hour session limit** is a hard wall shared by every session: watch both; before it hits, PAUSE in a controlled way
  (every lane stops its agents, commits + pushes, writes its handover; schedule the resume after the reset), so nothing
  is lost. **Commit progress periodically, so a limit that hits without warning costs minutes, not work:** every agent
  writes its result into a file in the repo as it goes (never only as its final message: on 2026-10-28 a 5-hour limit
  hit while three finished writers' lines existed only as messages), the orchestrator commits after every agent and at
  the end of every turn, and a long unattended build runs `video/scripts/autocheckpoint.sh` on its own paths (a commit
  and push every 10 minutes when they changed; a background job lives at most 2 hours, so it covers one build, not a
  whole day). An agent stopped by a limit resumes from its transcript (SendMessage) once the limit resets, rather than
  starting over (owner, v4, 2026-10-27: "make sure to commit the progress periodically if we get stopped on the usage
  limits"). Before any restart, re-read the current direction (`docs/look/DIRECTION.md`, the playbook and the docs they
  link: other sessions change them) and integrate it into the film's one style page first. — (v2, 2026-10-27).
- **Spend on the film, never on overhead (owner, 2026-10-28: "evaluate if there is anything in the early stages ... that is
  complete waste"; review `docs/retro/2026-10-28_v4_early_stage_cost.md`).** The early stages run lean: two scouts and one
  editor for the topic (the owner picks the topic and its core line on one screen), one fact lock (later checks read it
  and search only for a missing fact), a writer and a critic for the script; agents write files and return at most 3
  lines; the orchestrator stays small (a fresh session per gate, batched steps, no big skill or doc loads for small
  questions); check the session's rate limit before a fan-out. A session's budget may be its own: v4's session spends
  only on v4 ("these tokens we have here are not shared with other videos"). Streamlining the production never costs the
  film (owner, 2026-10-28: "we MUST not sacrifice the quality of the video, we MUST not sacrifice the details and overall
  look and feel, but we need to brainstorm and find a way to streamline the process IF THERE is obvious ways"): cut the
  process's rework, reading and re-rendering, never the look, the detail or a review (`docs/retro/2026-10-28_streamline/`).
- **NO LIMIT ON TOKENS for creative output (inside the weekly limit); never trade quality for savings.** Ideas, scripts, judged competing ideas,
  design explorations, set building, density, life, animation and polish get as many agents, rounds and tokens as the quality needs (workflows larger than the default size guideline too), and the early selection stages (topic, core line, script) need few: a few strong agents with files and one fact check (the rule above); only true waste is cut (rework, lost work,
  reviewing what will still change, early polish, a review loop that has stopped improving the shot: `docs/PIPELINE_V2.md`
  rule 2, and checks that repeat another check). — (2026-10-25; owner, 2026-10-26; 2026-10-28).
- **Locked means dropped:** rejected options go to `archive/`, never seen by later prompts; unused topics go to `docs/IDEAS_BANK.md`. — (v3, 2026-10-25).
- **New feedback is INTEGRATED, never just appended:** when a note changes the direction, rewrite or retire every rule and
  doc it contradicts in the same pass, so the next agent never meets conflicting instructions. The current visual and
  storytelling direction lives in one place, `docs/look/DIRECTION.md`. **Which doc wins:** owner's words (playbook;
  vN/OWNER_NOTES) > DIRECTION > CRAFT > PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > look/*.md > the film's STYLE.md (values
  only) > v1-era docs (API and measurements, never style); the owner's words are what the owner said, never our
  "-> what we did" log, and the newest owner note wins; the full order, with the topic docs and the tie-breaks, is
  DIRECTION's intro. — ("evaluate this feedback and compact it with the overall
  stylistic direction ... the next agent should not be confused with conflicting instructions", 2026-10-27).
- **Find the PRO way and the pro tools for every effect.** Before building a sky, depth, light, particles or any visual
  effect, research how professional illustrators, motion designers and graphics engineers do it and which proven tools
  exist (colour science such as OKLab interpolation, eased gradients, blue-noise dithering, proven libraries, encoder
  settings); adopt the best, wrap it as a reusable lib + a QA check, never a hand-rolled approximation. — ("research some
  libraries on GitHub"; "again find the pro way and tools to do it the best way you can", v2 G4, 2026-10-27).
- **Every lesson goes into the generic process, committed** (playbook, a PIPELINE gate, the studio toolkit). — ("we gradually get better", v3, 2026-10-26).
- **A rejected cut restarts clean.** When the owner says "I don't like it, start from scratch", drop the old visual
  work (archive it), skip the gates the owner names (e.g. no sketch) and make the finished film directly with full
  creative freedom inside these principles; never patch the rejected cut. — ("No I don't like it, let's start from
  scratch ... let's not do the sketch. Do the video right away, full creative freedom", v2 G5, 2026-10-27).
- **Once the owner says "final", don't redo it (log ideas for the next video); deliver videos as a download too** (in-app previews may play muted). — (v1, 2026-10-25).

## Platforms and posting
- **Accounts: Instagram `what.the.fuss.is.about`** (Creator, Education); TikTok and YouTube Shorts under the same name,
  handle and avatar. Posting texts per video: `docs/POSTING_KIT.md`. — (2026-10-25).
- **Upload at the highest quality and natively on each platform** (checklist in `docs/POSTING_KIT.md`). — (2026-10-25).
- **AI label ON everywhere; no paid boost until 3-5 posts exist,** then boost the best organic performer. — (2026-10-25).

## Performance log (one line per video and check)
- v1 "PHP bug", IG after 45 min: 155 views, avg 21 s of 55 s, likes 3.9 %; ~80 % gone by 3 s. — 2026-10-25.
- v1 after ~24 h (IG):
  - ~2.1K views, 86 % from the Reels tab and 11 % from Explore (non-followers);
  - skip rate 32.2 %; likes 2.5 %, shares 0.7 %, saves 0.4 %, reposts 0;
  - retention ~76 % at 2 s, ~58 % at 5 s, ~43 % at 10 s, ~33 % at 15 s, ~25 % at 35 s, ~19 % at the end.

  Reading: the leak is the first 15 s (-42 points by 5 s, another -25 by 15 s); after that it is nearly flat. Saves and
  shares are low, so give people a reason to send it. Screenshots: `context/uploads/inline/2026-10-26_v1_insights_24h_*`.
  — 2026-10-26.
- v3 "AI is making your next laptop pricier" (IG, the reworked reel, early check):
  - skip rate 64.5 % ("higher"; v1 32.2 %); likes 1.1 %, shares 0.0 %, saves 0.0 %, reposts 0.0 %, comments 0.0 %;
  - retention (read off the curve) ~62 % at ~1 s, ~40 % at ~2 s, ~33 % at 5 s, ~24 % at 10 s, ~20 % at 15 s, ~12 % at
    25 s, ~10 % at 35 s, ~6 % at the end (41 s).

  Reading: the leak is the first 2 s (-60 points), twice v1's skip rate; after 5 s it is a slow slide. The owner's read:
  the opening sounds like a bait commercial ("Buying a laptop soon? AI's making it pricier." over a shopping app's
  price tag and "Add to cart") -> the never-baity rule in Audience and goal. Screenshots:
  `context/uploads/inline/2026-10-28_v3_insights_*`. — 2026-10-28.

## Retired rules
- ~~The owner records the voice in ElevenLabs (we hand over the paste text)~~ → generated through the API with the owner's voice (2026-10-26).
- ~~G3: animate only where timing is the question~~ → the animated sketchbook plays every move and transition (2026-10-26).
- ~~v1's ink line as the film's line (overshoot, open contours, offset fills, weight by depth)~~ → the clean pen, lines
  by story role (v3 G5b, 2026-10-27).
- ~~The core line as a title over the captions from frame 0 (`frame0`)~~ → the captions in the voice's order, the
  payoff by ~2 s; the core line as a title only on the cover (v3, 2026-10-28).
- ~~Frame 0 as the whole scene in bare ink lines~~ → frame 0 drawn on in the clean pen, shown to the owner at the next
  G4 look clip (2026-10-27).
- ~~Something new every few frames from any element~~ → from the story's own build, one focus at a time (v3 G5b, 2026-10-27).
- ~~Cuts locked to the beat~~ → joins on the beat, each carrying something (v3 G5b, 2026-10-27).
- ~~Density and life added after the sketch ("blocking: staging only; next: density, life, polish")~~ → designed into
  G3 with their tiers; G5 fills G3's plan (v3 G5b, 2026-10-27).
- ~~A face for the protagonist's emotion beat (v3's waist-up "you" facing us)~~ → people have no faces, like reference
  1; the pose acts; only the mascot has a face (v2 restart rule, 2026-10-27).
- ~~The G4 look as stills made in parallel with G3~~ → a playable look clip after the G3 lock, approved before G5
  (the approved pipeline, 2026-10-27).

## Maintenance (keep this file coherent and clear)
No size budget (owner, 2026-10-27: "let's not focus on the playbook being a certain size; keep it as coherent and clear as
we can"). Review it **whenever a note changes the direction** (in the same turn) and at the start of a session if it has
been 7+ days since "Last reviewed" and entries were added since. The orchestrator:
1. Integrates: rewrites or retires every rule the new note contradicts, here, in `docs/look/DIRECTION.md` and in the
   docs the rules link to, so no two instructions conflict; the newest owner direction wins, and the old rule moves to
   "Retired" with what replaced it.
2. Merges duplicate and near-duplicate rules into one, clustered by area, each with its evidence as (video, date).
3. Turns rules that several videos confirmed into short principles; drops wording that only mattered for one video.
4. Performance log: keeps the last ~5 raw lines and folds older ones into a "Trends" paragraph.
5. Updates "Last reviewed", then commits "Review owner playbook".
