# Owner playbook: everything the owner has told us, as rules

This is the memory of the owner's feedback across videos: **approach-level rules only** (how we design and produce any
video). Read it before starting any video, and before every gate of `docs/PIPELINE_V2.md`.

**Capturing feedback (owner, 2026-10-26): split every note in the same turn and commit it.** A note about THIS video
(pick, line, take, shot) goes to `docs/vN/OWNER_NOTES.md`; a lesson about our approach goes HERE as a general rule with a
short evidence tag (vN, date); a concrete note that teaches something general goes to both. A reversed rule moves to
"Retired". The owner's master creative brief is `docs/CREATIVE_BRIEF.md` (the source; this file does not replace it).

Format: **rule** — why / evidence (video, date).

**Last compacted: 2026-10-27 (fourth pass) · size budget: <= 200 lines** (raised from 150 by the owner, 2026-10-26) (see Maintenance at the end).

## Audience and goal
- **Short-form first: TikTok / Instagram Reels / YouTube Shorts, vertical 1080x1920.** — (v1, 2026-10-24).
- **Growth matters: maximise engagement with subtle, defensible hooks**: bait that is true, e.g. "the language everyone
  loves". Never misleading. — (v1, 2026-10-24).

## Script and voice
- **A script is a coherent STORY, not a collection of true sentences about the topic.**
  - One throughline question, a situation the viewer is in, and every line following from the one before (joinable by
    "but", "so" or "because", never "and also"), building to a turn and a payoff.
  - Spine first, then lines. A list of facts to prove is input, never the structure.
  - Test: someone who hears it once can retell it as a story.
  — ("just a collection of sentences", v3 G1, 2026-10-26).
- **Everyday spoken language; check every sentence for AI-sounding wording.** — (v1, 2026-10-24).
- **Scripts come with detailed emotional / delivery cues; the owner always gets the full script text with any take.** — (v1).
- **We generate the narration with the owner's ElevenLabs voice through the API, for every video** (voice id and model
  in `docs/voice/VOICE.md`, procedure `docs/voice/API_QUICKSTART.md`, details `docs/ELEVENLABS.md`): paste format v2
  (few short tags, only at a paragraph start) with `check_paste.py` OK (it blocks every pattern that ever broke a take;
  only its `--handoff` text reaches the owner); `generate_take.py` (whole script first, auto-checked, auto-regenerated)
  with `report.json` `all_clean`; `check_take.py` MATCH on every take; send take.wav as an attachment; lock it into
  `public/vN/`; log it in `ELEVENLABS.md` section 5; commit and push after each step (pull first). **One full paste
  must narrate cleanly: a voice failure is our process bug, never the owner's problem** — fix it in the process. The
  key is the secret `ELEVENLABS_API_KEY`: never print, file, prompt or commit it. Never a voice other than the
  owner's. — (owner's standing instruction + v2 take 1, 2026-10-26).

## Music and sound
- **Music: cinematic but subtle, especially at the start.** The voice and the hook carry the opening. — (v1).
- **Mix to -14 LUFS / -1 dBTP, voice always on top**; SFX land on visual hits. — (v1).
- **More sound effects, especially ones people link with something good on their phone** (like pop, notification ding,
  message-sent swoosh), **with one in the first second.** Our own sounds that evoke them, never Apple's or Instagram's. — (2026-10-25).

## Visual style
- **Hand-drawn ink, flat colour, like reference video 1.** — (v1, 2026-10-24).
- **Every scene must FEEL ALIVE: that is the key, not an object count.** A dense, detailed world (a city full of
  buildings and windows, a room full of real things), people near and far, layered depth, a recurring living character,
  ambient life that never stops (clouds, birds, steam, lights switching). A dense world makes a frame full even when
  little moves (Arcane's rooftop; the owner's riverside reference "doesn't feel empty at all"). The bar: reference 1
  (France) and v1 (PHP); `scripts/qa/density.py` is a warning signal, never a quota; how-to `docs/look/LIFE_AND_DENSITY.md`.
  Big flat empty fields and an object alone on a blank wall are failures even in a draft. — ("way too empty", "feeling
  alive is absolutely the key", v3 G5, 2026-10-26).
- **Scale moments, occasionally: make the viewer feel small**, using Arcane's camera work and staging, never its footage.
  Keep it nuanced (it's still TikTok). The owner liked v1's scale scenes. — (v1, 2026-10-24/25).
  **When a scale shot comes, the scale must feel GREAT**, like Arcane's rooftop end frame: a world that keeps going
  (hundreds of buildings shrinking into haze), a landmark that is huge yet far, tiny anchors (figures, birds, airships),
  the drop below the camera, a big sky with huge clouds, many depth layers. Recipe: `docs/look/CINEMATIC_GUIDE.md`
  ("Scale cues"). — ("another point in the Arcane shot is how great the scale feels", v3, 2026-10-26).
- **Arcane references: ENVIRONMENT ONLY, few and high-confidence** (buildings, cityscapes, interiors as spaces, wides;
  no faces or people). Build on our own videos incrementally (angles, composition, light, camera), never reinvent.
  Guide with sketches: `docs/look/CINEMATIC_GUIDE.md`. — ("targeted with high confidence", 2026-10-26).
- **The owner's favourite Arcane shot: the pull-back crane reveal** (S1E1, the sisters on a rooftop, "It's nice getting
  above it all, huh?": from the characters' small world, the camera pulls back and rises until they are tiny figures with
  their backs to us, overlooking a vast sunlit city). "It has pretty much everything": suspense, sense of scale,
  environment, composition and the camera movement. Use it as the model for a film's big reveal; distilled in
  `docs/look/CINEMATIC_GUIDE.md`. — (v3, 2026-10-26).
- **Second visual twist: coziness through a sense of enclosure**: framed, street-like spaces that hold the subject (ref
  `docs/look/ref_sense_of_enclosure.jpg`). Rules: `docs/look/COZY_AND_SCALE.md`. — (2026-10-25).
  **Coziness is a recurring topic we keep evolving, one reference at a time** (enclosure H:W ratios first; then the
  owner's 2026-10-26 reference: a painterly street seen from above, everyday traffic flowing calmly under flowering trees):
  each new reference is measured (composition, movement, texture, camera, details) and folded into `COZY_AND_SCALE.md`.
  — ("really figure out what about the scene brings out this feeling; this is a recurring topic we need to evolve", 2026-10-26).
- **Don't rely on reusable assets: every film's sets, characters, props, background life and music are made new for
  it,** in its own design (a new Pip drawing too, if the mascot appears). Engine primitives, timing, captions and QA tools
  are tools, not assets. — ("Don't rely on reusable assets", v2 restart, 2026-10-27).
- **Paper edges ('paint-subtle') are liked, but never at the top of the frame or beside the caption band** (it read
  as a screen recording under the status bar). — (v1 posted reel, 2026-10-25).
- **Palette: a family of house palettes as tools, not a cage.** A soft, warm, "no screaming colours" base; one sister
  palette per video; within it one hero, one dark anchor, at most one pop. Rules: `docs/look/PALETTE.md`. — (2026-10-25).
- **Warm, never sickly.** Beige, muddy tan, olive-brown lines and grey read "sick"; warmth = peach creams, terracotta,
  red-brown lines, a golden lamp pool, warm shadows, a saturated dusk-blue outside. — ("not sick", v3 G4, 2026-10-26).
- **Texture and lines: VERY subtle.** Thin tapered lines only in key places; halftone tactically on a few elements as
  an optional last step (the film must work flat; the owner decides per video). — (texture test, 2026-10-25).
- **Profile identity: mascot Pip (the purple PHP elephant) in the film's style;** avatar
  `video/deliverables/profile/pip_power_button.png`. — (2026-10-25).

## Hook and pacing
- **Every video has ONE core line, picked in its own step (G0.5) before the script:** the single sentence at the core
  of the message with the biggest emotional reaction. It drives frame 0, the hook, the cover and the payoff; every line
  serves it. — (v3, 2026-10-25).
- **The first 3 s / first scene must be a banger ("something is about to happen"):**
  - frame 0 is the scene being made: bare ink lines, then colour floods in within ~0.3 s;
  - voice from the first frames;
  - the hook's claim made physical and escalating: the expected thing shown, then reality overtaking it at ~2 s;
  - something new every few frames, never still, in one continuous opening shot;
  - the film loops back to the bare-line frame 0.
  Details: `CINEMATIC_GUIDE.md`, "The opening". — (owner's reference, v3, 2026-10-26).
- **State the payoff in words on frame 0; polish the first 2 s and 5 s most, then the first 10 s.** A calm, pretty
  opening lost ~80 % of viewers by 3 s; late quirks are acceptable. — (v1 IG insights, 2026-10-25).
- **The hook is a concrete, surprising, TRUE claim with stakes**, verified against the primary source before it's
  locked; for a small news item, research the bigger story and lead with its strongest true framing. — (v2, 2026-10-25).
- **Personal framings must feel natural, not over the top.** Never cast the viewer as a loser in a contest they don't
  feel; test "you" claims with a viewer panel.
  — (v3 G2, 2026-10-25).
- **Target 30-45 s and end close to the payoff** (viewers left once the story felt resolved, ~40 s). — (v1 insights).
- **Every frame at least 8/10, no dead frames, cuts locked to the beat.** — (v1).

## Storyboard (G3)
- **G3 is the most important gate: an ANIMATED SKETCHBOOK of the final film, optimised for SIGNAL, not quality.** With
  script and voice locked, the animatic gives the director the closest signal to the final story in the least drawing
  and review time: story, transitions, animations and camera moves already very close to final — PLAYED, not only
  marked (their shape and timing real, never their polish); detail deliberately loose scribble-mass placeholders
  (the hand-scribbled texture: owner yes, 2026-10-27), nothing perfectly
  sharp but the backbone of the future film clearly visible, like an urban sketcher's page (ref
  `docs/look/ref_animated_sketchbook.png`); thumbnail drawings, the intent explicit (framing, the one action, shot
  type, cozy/scale) in a big readable note, lean review loops. Spec: `docs/G3_ANIMATIC.md`. — ("frankly the most
  important stage ... more like an animated sketchbook", 2026-10-26; supersedes "animate only where timing is the
  question", v3 G3, 2026-10-26).
- **Every shot reads instantly with the sound off: literal beats clever.** Show recognisable things: a laptop that looks
  like a laptop, a data center like a building of servers, a plain labelled chart. No metaphors that need explaining.
  Test every animatic with a sound-off cold read before the owner sees it. — (v3 G3, 2026-10-26).
- **No physical metaphors the facts don't support;** show the real mechanism instead. — (v3 G3, 2026-10-26).
- **Drawn like a professional storyboard: monochrome, clarity first, and cinematic** (framing, angle, scale, coziness
  decided in the board; clarity from composition, never icons on blank paper; every panel names its shot type). Spec:
  `docs/look/STORYBOARD_STYLE.md`. — ("very simple, avoid colours for now", v3 G3, 2026-10-26).

## Taste signals (general preferences from the owner's picks; the picks themselves are in each video's OWNER_NOTES.md)
- **Topics: the everyday wallet consequence** wins over a bigger but more distant story. — (v3 G0).
- **Lines: plain, direct and personal over clever;** a question to the viewer works as a hook. A plain line needs the
  frame-0 image, the first-second sound and the second line to bring the jolt. — (v3 G0.5-G2).
- **Core lines: one real person in their own (attributed) words over a plural headline.** — (v2 G0.5).
- **Palettes: the warm, everyday one for a money / everyday-life story.** — (v3 G4).
- **Palettes: the clean "news" one (Cream & Cobalt) for a serious story,** with a cold sister palette (Dusk) only for
  the one scale beat. — (v2 G4).

## Motion
- **A reference move gives the SHAPE, never the speed.** Copy its path, framing, reveal order and easing shape, then
  retime it to the reel: speed up (usually) or slow down where it feels right. Speed limits exist only to keep motion
  readable and strobe-free (60 fps allows faster moves). — ("the speed of transition should not be the reference point
  ... in a short reel we would speed it up", v3, 2026-10-26).
- **Render at 60 fps from G5 to the final** ("smoother and more crispy"). Animate by time; drawn motion may stay stepped
  (12-24 drawings/s) while the camera glides; the G3 reel also renders at 60 (`G3_ANIMATIC.md`, 2026-10-26). — (v3, 2026-10-26).

## Captions
- **Captions pop in place (or rise without clipping);** a slot or scroll reveal that cuts letters looked like a glitch. — (v1 reel, 2026-10-25).
- **Captions are burned in;** platform auto-captions stay off. — (v1).

## Process and communication
- **Playable video starts at the sketch animatic (G3); from then on every gate is a video, never only stills.** Before
  G3 (topic, core line, script, voice): text and audio only, no MP4s, never several versions unless asked. — (v1, 2026-10-25; "why are there multiple versions", v3).
- **Lock the story with a clean sketch/animatic before big commitments; push all polish late.** — (v1, 2026-10-25).
- **Progress: the gate deliverable is the update; between gates, a short status covering all threads.** — (v1).
- **Every cut sent to the owner says what stage it is and what the next stages add** (e.g. "blocking: staging only;
  next: density, life, polish, full-res"), so a draft is never mistaken for the final. — ("let me know if this is just
  an initial intermediate step", v3 G5, 2026-10-26).
- **NO LIMIT ON TOKENS for creative output; never trade quality for savings.** Ideas, scripts, judged competing ideas,
  design explorations, set building, density, life, animation and polish get as many agents, rounds and tokens as the
  quality needs (workflows larger than the default size guideline too); only true waste is cut (rework, lost work,
  reviewing what will still change, early polish). — (2026-10-25; owner, 2026-10-26).
- **Locked means dropped:** rejected options go to the video's `archive/`, the gate doc keeps only the locked choice,
  later prompts never see them; unused topics go to `docs/IDEAS_BANK.md`. — (v3, 2026-10-25).
- **No wasted tokens or time:** short prompts, lean docs, nothing reviewed or polished that will still change. — (v1).
- **Every lesson goes into the generic process, committed:** this playbook, a gate in `PIPELINE_V2.md`, or the studio
  toolkit, so the next video doesn't repeat it. — ("we gradually get better as a production studio", v3, 2026-10-26).
- **A rejected cut restarts clean.** When the owner says "I don't like it, start from scratch", drop the old visual
  work (archive it), skip the gates the owner names (e.g. no sketch) and make the finished film directly with full
  creative freedom inside these principles; never patch the rejected cut. — ("No I don't like it, let's start from
  scratch ... let's not do the sketch. Do the video right away, full creative freedom", v2 G5, 2026-10-27).
- **Once the owner says "final", don't redo it;** log ideas for the next video. — (v1, 2026-10-25).
- **Deliver videos as a download as well;** in-app previews may play muted. — (v1, 2026-10-25).

## Platforms and posting
- **Accounts: Instagram `what.the.fuss.is.about`** (Creator, Education); TikTok and YouTube Shorts under the same name,
  handle and avatar. Posting texts per video: `docs/POSTING_KIT.md`. — (2026-10-25).
- **AI label ON** (AI narration voice) on every platform. — (2026-10-25).
- **Upload at the highest quality and natively on each platform** (checklist in `docs/POSTING_KIT.md`). — (2026-10-25).
- **No paid boost until 3-5 posts exist;** then boost the best organic performer for profile visits. — (2026-10-25).

## Performance log (one line per video and check)
- v1 "PHP bug", IG after 45 min: 155 views, avg 21 s of 55 s, likes 3.9 %; ~80 % gone by 3 s. — 2026-10-25.
- v1 after ~24 h (IG):
  - ~2.1K views, 86 % from the Reels tab and 11 % from Explore (non-followers);
  - skip rate 32.2 %; likes 2.5 %, shares 0.7 %, saves 0.4 %, reposts 0;
  - retention ~76 % at 2 s, ~58 % at 5 s, ~43 % at 10 s, ~33 % at 15 s, ~25 % at 35 s, ~19 % at the end.

  Reading: the leak is the first 15 s (-42 points by 5 s, another -25 by 15 s); after that it is nearly flat. Saves and
  shares are low, so give people a reason to send it. Screenshots: `context/uploads/inline/2026-10-26_v1_insights_24h_*`.
  — 2026-10-26.

## Retired rules
- ~~The owner records the voice in ElevenLabs (we hand over the paste text)~~ → generated through the API with the owner's voice (2026-10-26).

## Maintenance (keep this file short)
Compact when, at the start of a session, **it has been 7+ days since "Last compacted" and entries were added since**,
or **the file is over 200 lines**. The orchestrator does it in one pass, with no agents:
1. Merge duplicate and near-duplicate rules into one; cluster by area; one line per rule, with the evidence shortened to (video, date).
2. Turn rules that several videos confirmed into short principles; drop wording that only mattered for one video.
3. Performance log: keep the last ~5 raw lines; fold older ones into a "Trends" paragraph (what the numbers keep saying).
4. Retired: keep the 10 most recent, one line each; drop older ones (git history keeps them).
5. Update "Last compacted", then commit "Compact owner playbook".
