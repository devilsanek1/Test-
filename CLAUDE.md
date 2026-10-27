# Project: short-form explainer videos (TikTok / Reels / Shorts)

**New agent picking this up? Read `HANDOFF.md` first**: the full state, the queue, and where all past context lives (`context/`).

**Before any visual work, read `video/docs/look/DIRECTION.md`**: the one page of the current look and storytelling direction; it wins over every other doc except the owner's own words (the playbook, vN/OWNER_NOTES).

The video project lives in `video/` (Remotion). Before starting or continuing any video:
1. Read `video/docs/OWNER_PLAYBOOK.md`: every piece of the owner's feedback, as rules. It is the memory across videos.
2. Follow `video/docs/PIPELINE_V2.md`: gates G0-G8; text and audio only before G3 (no MP4s), then one playable video with voice at every gate.
3. **Which doc wins:** owner's words (playbook; vN/OWNER_NOTES) > DIRECTION > CRAFT > PIPELINE_V2 > G3_ANIMATIC, G5_BLOCKING > look/*.md > the film's STYLE.md (values only) > v1-era docs (API and measurements, never style). The owner's words are what the owner said (quoted), never the "-> what we did" half of an OWNER_NOTES line. The full order, with the topic docs and the tie-breaks: DIRECTION's intro. A clash is a bug: fix the lower doc in the same turn.

**Whenever the owner gives feedback, capture it in the same turn and commit it, split by scope:** approach-level lessons go to
`video/docs/OWNER_PLAYBOOK.md` as general rules; notes on one concrete video (picks, lines, takes, shots) go to
`video/docs/vN/OWNER_NOTES.md`; a concrete note that teaches something general goes to both. Post-publish numbers go in its "Performance log". Keep the playbook
COHERENT and CLEAR, with no size budget (owner, 2026-10-27): integrate every note (rewrite or retire what it contradicts), and review it per its Maintenance section.

Top rules (details in the playbook):
- From the sketch animatic (G3) on, show one playable video per gate, never only stills; before that, text/audio only (no MP4s). Lock the story (sketch animatic) before building; polish last.
- The G3 animatic is an ANIMATED SKETCHBOOK (stage spec `video/docs/G3_ANIMATIC.md`, drawing spec
  `video/docs/look/STORYBOARD_STYLE.md`): the film's rough pass at 60 fps — story, joins, framing, every camera move,
  transition and key action PLAYED with real shape and timing, density and life as grey placeholders (loose never means
  empty) — monochrome, readable with the sound off. G3 decides flow (carriers, the thread), focus (tiers) and light (rig
  shapes); G4 is a 6-8 s look clip in the final style, made after the G3 lock and approved before G5; G5 fills G3's
  plan, never with a new mover, place or tier promotion.
- The look: one flowing story (every join carries something), one subject at a time, a clean premium line, gentle light
  and shadow, alive but calm, warm never sickly (`video/docs/look/DIRECTION.md`; numbers in `video/docs/look/CRAFT.md`).
- Every video gets ONE core line (its own step, G0.5: brainstorm, critique, owner picks) before the script is written.
  From the pick we draft its through-line card (one thread object, one home place, one "you"); G1 completes it with a
  carrier for every join, taken from the script's own joins, and the owner approves it with the script.
- The first 3 s must be a banger: frame 0 is the scene being drawn in the clean pen (the subject's outline, then colour
  within ~0.3 s), voice from the first frames (the first word at ~0.12 s, the locked voice file's lead; never a silent
  lead), the hook made physical (the expected thing, then reality overtaking it), never a still frame; state the payoff
  in words on frame 0. Target 30-45 s.
- A script is one coherent story (spine first; every line follows from the last), never a list of facts. Everyday spoken
  language, no AI-sounding phrasing; detailed emotional cues. The narration is generated with the owner's ElevenLabs voice through the API
  (owner, 2026-10-26): follow `video/docs/voice/API_QUICKSTART.md` (paste format v2, `check_paste.py` OK, `generate_take.py`
  `all_clean`, `check_take.py` MATCH; send take.wav, lock it into `public/vN/`, log it in `ELEVENLABS.md` section 5). Only
  without the key does the owner paste it (then always hand over the full paste text).
- Every lesson goes into the generic process (playbook, pipeline gate, studio toolkit) and is committed, so the next
  video doesn't repeat it.
- Captions pop in place (no clipped roll-ins). No paper edge at the top of the frame or beside the caption band. Production renders at 60 fps.
- **ALL delegated work runs at MAX effort** (owner, 2026-10-27: "all delegated work should be max effort"): every
  workflow and sub-workflow agent (`effort: 'max'` in each `agent()` call), every subagent (the Agent tool's
  `effort: "max"`; only a "fork" inherits the session's), every agent an agent starts (each brief says so), and every
  helper session (first prompt exactly `/effort max`). The repo enforces it: the PreToolUse hook in
  `.claude/settings.json` (`.claude/hooks/max_effort.py`) denies anything less, and
  `python3 .claude/hooks/max_effort.py --lint|--fix <workflow.js>` checks or repairs a script before it runs.
- **NO LIMIT ON TOKENS for creative output** (owner, 2026-10-26), inside the weekly limit (owner, 2026-10-27: finishing
  the videos in flight comes first): ideas, writing, design, set building, density, life, animation and polish get as
  many agents, rounds and tokens as the quality needs, all at MAX effort (above). Never
  trade quality for savings: brainstorms, competing ideas with judges and design explorations at the early gates are
  worth their tokens. Cut only waste: rework, reviews of things that will still change, polish before the story lock,
  and lost work (small checkpointed tasks).
