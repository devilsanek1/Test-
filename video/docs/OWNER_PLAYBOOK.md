# Owner playbook: everything the owner has told us, as rules

This is the memory of the owner's feedback across videos. Read it before starting any video, and before every gate
of `docs/PIPELINE_V2.md`. **Add every new piece of owner feedback here in the same turn it is given** (as a rule,
with the date, the video and the reason), commit it, and move a rule to "Retired" instead of deleting it if the
owner reverses it. The owner's master creative brief is `docs/CREATIVE_BRIEF.md` (the source; this file does not
replace it).

Format: **rule** — why / evidence (video, date).

**Last compacted: 2026-10-26 · size budget: <= 150 lines** (see Maintenance at the end).

## Audience and goal
- **Short-form first: TikTok / Instagram Reels / YouTube Shorts, vertical 1080x1920.** — the target from day one (v1, 2026-10-24).
- **Growth matters: maximise engagement with subtle, defensible hooks** (bait that is true, e.g. "the language everyone
  loves"). Never misleading. — v1 script round, 2026-10-24.

## Script and voice
- **A script is a coherent STORY, not a collection of true sentences about the topic.** One throughline question,
  a situation the viewer is in, and every line following from the one before (you could join each pair with "but",
  "so" or "because", never "and also"), building to a turn and a payoff. Build the story spine first, then write the
  lines; a list of facts to prove is input, never the structure. Test: someone who hears it once can retell it as a
  story. — owner, v3 G1 ("it's just a collection of sentences ... start from scratch"), 2026-10-26.
- **Everyday spoken language. Check every sentence for AI-sounding wording**; it must sound like a person talking. — v1, 2026-10-24.
- **Scripts come with detailed emotional / delivery cues, and the owner always gets the full script text with any
  take.** — v1, 2026-10-24.
- **The owner records the voice in ElevenLabs; we never add a voice (no stand-in TTS) to a deliverable.** The treated
  ElevenLabs take is the quality bar (a cheaper TTS sounded "cheap", v1). The paste file and take checks follow
  `docs/ELEVENLABS.md`; the rules behind it, all from the owner's v3 takes (2026-10-25/26):
  - only tags and spoken words (v4 read our notes and alternate-hook labels aloud);
  - tags describe a tone, never quote script words (v4 spoke them) and never name an action ("correcting yourself"
    made it repeat the previous line);
  - always hand over the FULL paste text in one block, never just the changed line ("clunky").

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
- **Palette: a family of house palettes as tools, not a cage.** Keep the soft, warm, "no screaming colours" v1 base and
  evolve it; pick one sister palette per video; within a video one hero, one dark anchor, at most one pop; expand when a
  story needs it. Rules and data: `docs/look/PALETTE.md`, `palettes.json`, `palette_family.png`. — owner, 2026-10-25.
- **Texture and lines: VERY subtle, only where they add something.** Thin dark tapered lines only in key places (not
  outlines everywhere); the halftone texture tactically on a few elements; an optional last step after polish (the film
  must work flat; the owner decides per video). — owner, 2026-10-25 (after the texture test).
- **Profile identity: the mascot Pip (the purple PHP elephant) in the film's style;** the avatar in use is the
  power-button sun one (`video/deliverables/profile/pip_power_button.png`). — 2026-10-25.

## Hook and pacing
- **Every video has ONE core line, picked in its own step (G0.5) before the script:** the single sentence that is the
  absolute core of the message and gets the biggest emotional reaction (v3: something like "AI is making your PC more
  expensive"). Brainstorm, critique and the owner's pick, like the topic. It drives frame 0, the hook, the cover and the
  payoff, and every line must serve it. — owner, v3, 2026-10-25.
- **The first 2 s and first 5 s get the most polish; the first 10 s get the next most.** Quirks late in the video are acceptable. — v1, 2026-10-25.
- **State the payoff in words from frame 0** (a bold claim on the first frame, starting mid-action). A calm, pretty
  opening frame lost about 80 % of viewers by 3 s. — v1 Instagram insights after 45 min (155 views, 70 viewers, avg 21 s / 55 s), 2026-10-25.
- **The hook is a concrete, surprising claim with stakes (names / numbers / a curiosity gap), stronger than a plain
  news headline** ("Engineers are leaving Google!" was the owner's starting point, asked to be made more powerful);
  **every hook fact is verified against the primary source before the hook is locked.** — v2 topic, 2026-10-25.
- **When a news item is small, research the bigger story around it** (history, the pattern across companies, what's
  at stake) and lead with the most powerful TRUE framing (v2: "engineers resigning and afraid to speak", not just "people
  leaving Google"). — owner, 2026-10-25.
- **Personal framings must feel natural, not over the top:** "You're up against AI data centers… and losing" was too much
  for the owner ("how would people react hearing this?"). Don't cast the viewer as a loser or a competitor in a contest they
  don't feel; test any "you" claim with a viewer panel for eye-rolls before it's locked. — owner, v3 G2, 2026-10-25.
- **Target 30-45 s and end close to the payoff.** Viewers who passed the hook stayed until about 40 s, then left once
  the story felt resolved. — same insights.
- **Every frame should be at least 8/10, with no dead frames, and cuts locked to the beat** (the owner's creator-reel tips). — v1.

## Taste signals (the owner's picks; weight them when ranking options)
- **Topics: the everyday wallet consequence** ("AI is outbidding you for the memory in your laptop" over the higher-scored
  Meta $25B story). — v3 G0, 2026-10-25.
- **Lines: plain, direct and personal over clever** (core line "AI is making your next laptop pricier" over the panel's
  "Don't use AI? It's still raising laptop prices"; hook as a question, "Buying a laptop soon? AI's making it pricier.";
  line 2 "AI data centers get first dibs..."). A plain line needs the frame-0 image, the first-second sound and the 2nd
  line to bring the jolt. — v3 G0.5-G1, 2026-10-25/26.

## Captions
- **Captions pop in place (or rise without clipping); no slot or scroll reveal that cuts letters mid-motion.** On a
  plain sky it looks like a glitch. — v1 posted reel, 2026-10-25.
- **Captions are burned in;** platform auto-captions stay off. — v1.

## Process and communication
- **Playable video starts at the sketch animatic (G3); from then on every gate is a video, never only stills.** The owner
  saw only pictures until v1's final and could not steer. Before G3 (topic, core line, script, voice) deliver text and
  audio only, with no MP4s, and never several versions of one video unless asked. — v1 2026-10-25; narrowed by the owner
  on v3 ("why are there multiple versions and why is it needed at all at this point?"), 2026-10-25.
- **Lock the story with a clean sketch/animatic before big commitments; push all polish late.** — v1, 2026-10-25.
- **Progress: the gate deliverable is the update; between gates, a short status covering all threads.** — v1, 2026-10-25.
- **Never trade quality or output value for savings. Creative work gets the budget it needs:** multi-agent
  brainstorms, competing ideas with judges, design and style explorations, and hook variants are excellent use of tokens.
  "Waste" means rework, reviews of things that will still change, polish before the story is locked, and lost work.
  — owner, 2026-10-25.
- **Once a step is locked, only the locked choice goes forward:** move the rejected options (other topics, core lines,
  hooks, drafts, scores, panels) to the video's `archive/` folder, trim the gate doc to the locked choice, and never put
  rejected options into later prompts or re-discuss them. Unused topics go to `docs/IDEAS_BANK.md` for future videos.
  — owner, v3, 2026-10-25.
- **No wasted tokens or time:** no reviews or polish on things that will change, short prompts, lean docs; cut what
  doesn't help (see the measured waste in `docs/PIPELINE_V2.md`). — v1, 2026-10-25.
- **Every lesson goes into the generic process, committed, so the next video doesn't repeat the mistake:** the rule
  here, the gate in `docs/PIPELINE_V2.md`, the tool or template in the studio toolkit (`PIPELINE_V2.md`, "Studio
  toolkit"). — owner, v3, 2026-10-26 ("we gradually get better as a production studio").
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

