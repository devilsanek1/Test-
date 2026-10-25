# Owner playbook: everything the owner has told us, as rules

This is the memory of the owner's feedback across videos. Read it before starting any video, and before every gate
of `docs/PIPELINE_V2.md`. **Add every new piece of owner feedback here in the same turn it is given** (as a rule,
with the date, the video and the reason), commit it, and move a rule to "Retired" instead of deleting it if the
owner reverses it. The owner's master creative brief is `docs/CREATIVE_BRIEF.md` (the source; this file does not
replace it).

Format: **rule** — why / evidence (video, date).

**Last compacted: 2026-10-25 · size budget: <= 150 lines** (see Maintenance at the end).

## Audience and goal
- **Short-form first: TikTok / Instagram Reels / YouTube Shorts, vertical 1080x1920.** — the target from day one (v1, 2026-10-24).
- **Growth matters: maximise engagement with subtle, defensible hooks** (bait that is true, e.g. "the language everyone
  loves"). Never misleading. — v1 script round, 2026-10-24.

## Script and voice
- **Everyday spoken language. Check every sentence for AI-sounding wording**; it must sound approachable, like a person
  talking. — v1, 2026-10-24.
- **When delivering a script, include emotional / delivery cues that are as detailed and concrete as possible.** — v1.
- **Always give the owner the updated script text along with any new voice take.** — v1.
- **Voice: the treated ElevenLabs WAV is the quality bar.** An untreated or cheaper TTS sounded "cheap". — v1.

## Music and sound
- **Music: cinematic but subtle, especially at the start.** The voice and the hook carry the opening. — v1.
- **Mix to -14 LUFS / -1 dBTP, with the voice always on top**; SFX land on visual hits (slams, punches). — v1.
- **More sound effects, especially ones people link with something good on their phone** (a like / heart pop, a
  notification ding, a message-sent swoosh), **with one in the first second.** The owner likes our SFX. We make our own
  sounds that evoke these; never Apple's or Instagram's actual sounds. — owner, 2026-10-25.

## Visual style
- **Style: hand-drawn ink, flat colour, like reference video 1.** — v1, 2026-10-24.
- **Scale moments, occasionally: keep making the viewer feel small,** inspired by Arcane's camera work and staging (not
  its footage); nuanced, since it is still TikTok content. The owner liked v1's scale scenes ("we did it great").
  — v1 2026-10-24, reconfirmed 2026-10-25.
- **Second visual twist: coziness, through a sense of enclosure** (framed, street-like spaces whose walls hold the
  subject, as in the owner's reference `docs/look/ref_sense_of_enclosure.jpg`). Rules: `docs/look/COZY_AND_SCALE.md`.
  — owner, 2026-10-25.
- **Edges: hand-drawn paper edges ('paint-subtle') are liked, BUT never at the top of the frame or beside the caption
  band.** A white strip at the top looked like a screen recording under the phone's status bar. — v1, posted reel, 2026-10-25.
- **Palette: a family of house palettes as tools, not a cage.**
  - Keep our soft, warm, "no screaming colours" v1 palette (the owner likes it) and evolve it incrementally.
  - Keep several similar-ish palettes that share the house DNA, each slightly different and unique, and pick one per
    video or use case.
  - Within a video be tactical: one hero, one dark anchor, at most one pop, never all the colours at once.
  - Expand with new colours or palettes when a story needs it.
  - Board: `docs/look/palette_family.png`; data: `docs/look/palettes.json`; rules: `docs/look/PALETTE.md`.
  — owner, 2026-10-25.
- **Texture and lines: VERY subtle, as in `docs/look/texture_refs/autumn_walk_detail.png`.**
  - Texture: a fine, tone-on-tone halftone dot texture on the colour fills, barely visible.
  - Lines: thin dark lines only in key places (creases, a leash, a mouth, an ear), not outlines around every shape;
    shapes are separated by colour.
  - Test it in production (G4 style frames, checked after Reels-like compression). — owner, 2026-10-25.
- **Profile identity: the mascot Pip (the purple PHP elephant) in the film's style;** the avatar in use is the
  power-button sun one (`video/deliverables/profile/pip_power_button.png`). — 2026-10-25.

## Hook and pacing
- **The first 2 s and first 5 s get the most polish; the first 10 s get the next most.** Quirks late in the video are acceptable. — v1, 2026-10-25.
- **State the payoff in words from frame 0** (a bold claim on the first frame, starting mid-action). A calm, pretty
  opening frame lost about 80 % of viewers by 3 s. — v1 Instagram insights after 45 min (155 views, 70 viewers, avg 21 s / 55 s), 2026-10-25.
- **The hook is a concrete, surprising claim with stakes (names / numbers / a curiosity gap), stronger than a plain
  news headline** ("Engineers are leaving Google!" was the owner's starting point, asked to be made more powerful);
  **every hook fact is verified against the primary source before the hook is locked.** — v2 topic, 2026-10-25.
- **When a news item is small, research the bigger story around it** (history, the pattern across companies, what's
  at stake) and lead with the most powerful TRUE framing (v2: "engineers resigning and afraid to speak", not just "people
  leaving Google"). — owner, 2026-10-25.
- **Target 30-45 s and end close to the payoff.** Viewers who passed the hook stayed until about 40 s, then left once
  the story felt resolved. — same insights.
- **Every frame should be at least 8/10, with no dead frames, and cuts locked to the beat** (the owner's creator-reel tips). — v1.

## Captions
- **Captions pop in place (or rise without clipping); no slot or scroll reveal that cuts letters mid-motion.** On a
  plain sky it looks like a glitch. — v1 posted reel, 2026-10-25.
- **Captions are burned in;** platform auto-captions stay off. — v1.

## Process and communication
- **Show a PLAYABLE video (with voice) at every stage, never only stills.** The owner saw only pictures until the
  final and could not steer. Use the gate loop in `docs/PIPELINE_V2.md`. — v1, 2026-10-25.
- **Lock the story with a clean sketch/animatic before big commitments; push all polish late.** — v1, 2026-10-25.
- **Progress updates about every 30 min while working, covering all threads and including visuals, even unfinished ones.** With the new
  pipeline, the gate video is the update and between gates a one-line status. — v1.
- **Never trade quality or output value for savings. Creative work gets the budget it needs:** multi-agent
  brainstorms, competing ideas with judges, design and style explorations, and hook variants are excellent use of tokens.
  "Waste" means rework, reviews of things that will still change, polish before the story is locked, and lost work.
  — owner, 2026-10-25.
- **No wasted tokens or time:** no reviews or polish on things that will change, short prompts, lean docs; cut what
  doesn't help (see the measured waste in `docs/PIPELINE_V2.md`). — v1, 2026-10-25.
- **Once the owner says "final", don't redo it.** Log ideas for the next video instead. — v1, 2026-10-25.
- **Deliver videos as a download as well;** in-app previews may play muted. — v1, 2026-10-25.

## Platforms and posting
- **Accounts: Instagram `what.the.fuss.is.about`** (Creator account, Education); TikTok and YouTube Shorts under the same
  name, handle and avatar. Posting texts per video: `docs/POSTING_KIT.md`. — 2026-10-25.
- **AI label ON** (AI narration voice) on every platform. — 2026-10-25.
- **Upload at the highest quality and natively on each platform** (checklist in `docs/POSTING_KIT.md`; owner asked, 2026-10-25).
- **No paid boost until 3-5 posts exist;** then boost the best organic performer for profile visits. — 2026-10-25.

## Performance log (one line per video and check)
- v1 "PHP bug / governments switched off their sites" — IG after 45 min: 155 views, 70 viewers, avg watch 21 s of
  55 s, like rate 3.9 %, 0 saves / shares / comments / follows; ~80 % gone by 3 s, flat ~20 % until ~40 s, then a drop. — 2026-10-25.

## Retired rules
(none yet)

## Maintenance (keep this file short)
Compact when, at the start of a session, **it has been 7+ days since "Last compacted" and entries were added since**,
or **the file is over 150 lines**. The orchestrator does it in one pass, with no agents:
1. Merge duplicate and near-duplicate rules into one; cluster by area; one line per rule, with the evidence shortened to (video, date).
2. Turn rules that several videos confirmed into short principles; drop wording that only mattered for one video.
3. Performance log: keep the last ~5 raw lines; fold older ones into a "Trends" paragraph (what the numbers keep saying).
4. Retired: keep the 10 most recent, one line each; drop older ones (git history keeps them).
5. Update "Last compacted", then commit "Compact owner playbook".

