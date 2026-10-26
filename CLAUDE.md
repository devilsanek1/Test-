# Project: short-form explainer videos (TikTok / Reels / Shorts)

**New agent picking this up? Read `HANDOFF.md` first**: the full state, the queue, and where all past context lives (`context/`).

The video project lives in `video/` (Remotion). Before starting or continuing any video:
1. Read `video/docs/OWNER_PLAYBOOK.md`: every piece of the owner's feedback, as rules. It is the memory across videos.
2. Follow `video/docs/PIPELINE_V2.md`: gates G0-G8, with a playable low-res video with voice at every gate.

**Whenever the owner gives feedback, capture it in the same turn and commit it, split by scope:** approach-level lessons go to
`video/docs/OWNER_PLAYBOOK.md` as general rules; notes on one concrete video (picks, lines, takes, shots) go to
`video/docs/vN/OWNER_NOTES.md`; a concrete note that teaches something general goes to both. Post-publish numbers go in its "Performance log". At session start, compact
the playbook if its Maintenance trigger fires (7+ days since "Last compacted" with new entries, or over 200 lines; budget raised by the owner, 2026-10-26).

Top rules (details in the playbook):
- From the sketch animatic (G3) on, show one playable video per gate, never only stills; before that, text/audio only (no MP4s). Lock the story (sketch animatic) before building; polish last.
- The G3 animatic is a monochrome studio storyboard (`video/docs/look/STORYBOARD_STYLE.md`) built for SIGNAL per drawing,
  not quality: literal and readable with the sound off, yet it carries the cinematography (framing, scale, cozy home base).
- Every video gets ONE core line (its own step, G0.5: brainstorm, critique, owner picks) before the script is written.
- The first 3 s must be a banger: frame 0 is the scene being drawn (lines, then colour), voice from frame 1, the hook made
  physical (the expected thing, then reality overtaking it), never a still frame; state the payoff in words on frame 0. Target 30-45 s.
- A script is one coherent story (spine first; every line follows from the last), never a list of facts. Everyday spoken
  language, no AI-sounding phrasing; detailed emotional cues. The owner records the voice: follow `video/docs/ELEVENLABS.md`
  and always hand over the full paste text.
- Every lesson goes into the generic process (playbook, pipeline gate, studio toolkit) and is committed, so the next
  video doesn't repeat it.
- Captions pop in place (no clipped roll-ins). No paper edge at the top of the frame. Production renders at 60 fps.
- Never trade quality for savings: brainstorms, competing ideas with judges and design explorations at the early gates are
  worth their tokens. Cut only waste: rework, reviews of things that will still change, polish before the story lock,
  and lost work (small checkpointed tasks).
