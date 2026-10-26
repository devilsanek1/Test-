# Owner playbook: everything the owner has told us, as rules

This is the memory of the owner's feedback across videos: **approach-level rules only** (how we design and produce any
video). Read it before starting any video, and before every gate of `docs/PIPELINE_V2.md`.

**Capturing feedback (owner, 2026-10-26): split every note in the same turn.**
- A note about THIS video (a pick, a line, a take, a shot) goes to `docs/vN/OWNER_NOTES.md` (date, gate, what the owner
  said, what we did).
- A lesson about our approach goes HERE as a general rule, worded for any video, with a short evidence tag (vN, date).
- A concrete note that teaches something general goes to both: the instance in the video's notes, the rule here.
Commit in the same turn; move a rule to "Retired" instead of deleting it if the owner reverses it. The owner's master creative brief is `docs/CREATIVE_BRIEF.md` (the source; this file does not
replace it).

Format: **rule** — why / evidence (video, date).

**Last compacted: 2026-10-26 (second pass) · size budget: <= 200 lines** (raised from 150 by the owner, 2026-10-26) (see Maintenance at the end).

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
- **We generate the narration with the owner's ElevenLabs voice through the API, for every video** (voice id and model in
  `docs/voice/VOICE.md`, procedure `docs/voice/API_QUICKSTART.md`): paste format v2 with `check_paste.py` OK;
  `generate_take.py` (whole script first, auto-checked, auto-regenerated) with `report.json` `all_clean`; `check_take.py`
  MATCH; send take.wav as an attachment; lock it into `public/vN/`; log it in `ELEVENLABS.md` section 5; commit and push after
  each step (pull first). The key is the secret `ELEVENLABS_API_KEY`: never print, file, prompt or commit it. Never a voice
  other than the owner's. — (owner's standing instruction, 2026-10-26).

- **One full paste must narrate cleanly: a voice failure is our process bug, not the owner's problem.** It is fixed in
  the process (`docs/ELEVENLABS.md`; study in `docs/voice/`):
  - paste format v2: few short tags, only at the start of a paragraph; that format was clean first time;
  - `check_paste.py` blocks every pattern that ever broke a take, and only its `--handoff` text reaches the owner;
  - three takes per paste (free regenerations), with a stated length limit;
  - `check_take.py` on every take;
  - the API generator, once the key is in.
  — (owner, v2 take 1, 2026-10-26).

## Music and sound
- **Music: cinematic but subtle, especially at the start.** The voice and the hook carry the opening. — (v1).
- **Mix to -14 LUFS / -1 dBTP, voice always on top**; SFX land on visual hits. — (v1).
- **More sound effects, especially ones people link with something good on their phone** (like pop, notification ding,
  message-sent swoosh), **with one in the first second.** Our own sounds that evoke them, never Apple's or Instagram's. — (2026-10-25).

## Visual style
- **Hand-drawn ink, flat colour, like reference video 1.** — (v1, 2026-10-24).
- **Scale moments, occasionally: make the viewer feel small**, using Arcane's camera work and staging, never its footage.
  Keep it nuanced (it's still TikTok). The owner liked v1's scale scenes. — (v1, 2026-10-24/25).
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
- **Boards optimise for SIGNAL, not quality: the director gets the most information about the final film in the least
  drawing and the least review time.** Thumbnail-level drawings; the intent made explicit (framing, the one action,
  the shot type, cozy/scale, the camera move as a red mark, all in a big readable note); animate only where timing is
  the question; no polish, no extra detail, lean review loops. — (v3 G3, 2026-10-26).
- **Every shot reads instantly with the sound off: literal beats clever.** Show recognisable things: a laptop that looks
  like a laptop, a data center like a building of servers, a plain labelled chart. No metaphors that need explaining.
  Test every animatic with a sound-off cold read before the owner sees it. — (v3 G3, 2026-10-26).
- **No physical metaphors the facts don't support;** show the real mechanism instead. — (v3 G3, 2026-10-26).
- **Drawn like a professional storyboard: simple, monochrome, clarity first.** No colour at the sketch stage; colour
  belongs to G4/G5. Spec: `docs/look/STORYBOARD_STYLE.md`. — ("very simple, avoid colours for now", v3 G3, 2026-10-26).

- **The board carries the cinematography too: clear AND cinematic.** Framing, camera angle, scale (the rise-over reveal,
  the scale cut to a tiny figure) and coziness (the enclosed home base, the window) are decided in the board, in
  monochrome; clarity comes from composition, never from flattening every panel to an icon on blank paper. Every
  panel names its shot type (CINEMATIC_GUIDE / COZY_AND_SCALE) and still passes the sound-off read. — (v3 G3, 2026-10-26).

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
  (12-24 drawings/s) while the camera glides; G3 may stay at 30. — (v3, 2026-10-26).

## Captions
- **Captions pop in place (or rise without clipping);** a slot or scroll reveal that cuts letters looked like a glitch. — (v1 reel, 2026-10-25).
- **Captions are burned in;** platform auto-captions stay off. — (v1).

## Process and communication
- **Playable video starts at the sketch animatic (G3); from then on every gate is a video, never only stills.** Before
  G3 (topic, core line, script, voice): text and audio only, no MP4s, never several versions unless asked. — (v1, 2026-10-25; "why are there multiple versions", v3).
- **Lock the story with a clean sketch/animatic before big commitments; push all polish late.** — (v1, 2026-10-25).
- **Progress: the gate deliverable is the update; between gates, a short status covering all threads.** — (v1).
- **Never trade quality for savings:** brainstorms, judged competing ideas and design explorations are worth their
  tokens; waste = rework, reviews of things that will change, early polish, lost work. — (2026-10-25).
- **Locked means dropped:** rejected options go to the video's `archive/`, the gate doc keeps only the locked choice,
  later prompts never see them; unused topics go to `docs/IDEAS_BANK.md`. — (v3, 2026-10-25).
- **No wasted tokens or time:** short prompts, lean docs, nothing reviewed or polished that will still change. — (v1).
- **Every lesson goes into the generic process, committed:** this playbook, a gate in `PIPELINE_V2.md`, or the studio
  toolkit, so the next video doesn't repeat it. — ("we gradually get better as a production studio", v3, 2026-10-26).
- **Once the owner says "final", don't redo it;** log ideas for the next video. — (v1, 2026-10-25).
- **Deliver videos as a download as well;** in-app previews may play muted. — (v1, 2026-10-25).

## Platforms and posting
- **Accounts: Instagram `what.the.fuss.is.about`** (Creator, Education); TikTok and YouTube Shorts under the same name,
  handle and avatar. Posting texts per video: `docs/POSTING_KIT.md`. — (2026-10-25).
- **AI label ON** (AI narration voice) on every platform. — (2026-10-25).
- **Upload at the highest quality and natively on each platform** (checklist in `docs/POSTING_KIT.md`). — (2026-10-25).
- **No paid boost until 3-5 posts exist;** then boost the best organic performer for profile visits. — (2026-10-25).

## Performance log (one line per video and check)
- v1 "PHP bug", IG after 45 min: 155 views, 70 viewers, avg 21 s of 55 s, likes 3.9 %, 0 saves/shares/comments/follows;
  ~80 % gone by 3 s, flat ~20 % until ~40 s. — 2026-10-25.
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
