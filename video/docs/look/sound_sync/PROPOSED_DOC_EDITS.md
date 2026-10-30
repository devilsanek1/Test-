# Sound sync: the doc edits the distill needs (2026-10-30; the orchestrator applies them)

**Applied 2026-10-30 ~18:50 UTC by the orchestrator:** A1-A12 and B1-B11 (23 edits, by script, each `old` found once).
**A13 applied too (2026-10-30 ~19:00 UTC)** after the owner's hand-over ("Do what you think is right and make the videos
better"). Part C decided the same way: 1. "more effects" = more NOTICEABLE story sounds, each heard, not more cues;
2. no separate A/B iteration: the four comparisons are played in Helsinki's G3 sound pass, where the owner hears them
in a real film. **Still to do:** MR20's window in the composition library (Part C), after the
composition-library run lands.

`docs/look/SOUND_SYNC.md` is the distilled practice. These edits point the owning docs at it and fix the lines that now
clash with it (CLAUDE.md: "A clash is a bug: fix the lower doc in the same turn"). Each edit gives the file (paths from
the repo root), why, and the exact text: `old` occurs once in the file today (checked 2026-10-30); `new` replaces it.
Part A is the sound docs and the playbook bullets the brief named; Part B is what the ladder and the gates need so the
practice is reachable; Part C is notes and questions, not edits. Nothing here touches `composition/motion.md` (the
composition study's file).

---

## Part A. The sound docs and the playbook

### A1. `video/docs/OWNER_PLAYBOOK.md`, "Music and sound": the sync bullet points at the practice
Why: the bullet still says "the research is queued"; the owner asked where sync makes sense, and this is the answer in
one line (the owner's quote stays untouched).

old:
```
  researched, named practice with a rule for where it fits (`docs/look/refs_sound_sync/`; the research is queued). —
```
new:
```
  researched, named practice with a rule for where it fits: `docs/look/SOUND_SYNC.md` (distilled from the owner's two
  reels, `docs/look/refs_sound_sync/`). In short: spend it, don't sprinkle it (a count of three sounded changes in the
  hook, rest while the voice explains, ONE release at the payoff in a written voice pause); every hit lands on the first
  visible frame of one change of the beat's subject, never before it, and is heard; nothing on continuous motion,
  background life, captions or the music's beats. —
```

### A2. `video/docs/OWNER_PLAYBOOK.md`, "Music and sound": what "subtle at the start" means for sync
Why: both owner reels open on near silence and bring the music in only at their release; our best measured moments sit
on such floors (`sound_sync/audit.md` Part 1, R7).

old:
```
- **Music: cinematic but subtle, especially at the start.** The voice and the hook carry the opening. — (v1).
```
new:
```
- **Music: cinematic but subtle, especially at the start.** The voice and the hook carry the opening: the hook's sounds
  sit on a quiet floor (air, no bed); the bed enters after the hook as a small step and rises once, at the payoff, in a
  written voice pause (`docs/look/SOUND_SYNC.md` S1, S6, S7; both of the owner's sound reels open on near silence). —
  (v1; 2026-10-30).
```

### A3. `video/docs/OWNER_PLAYBOOK.md`, "Music and sound": "SFX land on visual hits" gets its number
Why: "on" now has a window, and v2's cue sheet put 17 effects 2 f early by design (`sound_sync/audit.md` §4.3).

old:
```
- **Mix to -14 LUFS / -1 dBTP, voice always on top**; SFX land on visual hits. — (v1).
```
new:
```
- **Mix to -14 LUFS / -1 dBTP, voice always on top**; SFX land on visual hits: on the hit's first visible frame or up to
  2 frames after it, never before, and heard (in a voice gap, or the loudest thing in its band): `docs/look/SOUND_SYNC.md`
  §1c. — (v1; 2026-10-30).
```

### A4. `video/docs/OWNER_PLAYBOOK.md`, "Music and sound": which events get the phone sounds
Why: the owner's newest note (2026-10-30) asks where sync makes sense; this keeps the 2026-10-25 rule's words and adds
the pointer. (Part C, question 1, asks the owner how to read "more".)

old:
```
  message-sent swoosh), **with one in the first second.** Our own sounds that evoke them, never Apple's or Instagram's. — (2026-10-25).
```
new:
```
  message-sent swoosh), **with one in the first second.** Our own sounds that evoke them, never Apple's or Instagram's.
  Which events get one, and how many: `docs/look/SOUND_SYNC.md` (story events of the beat's subject, each heard; never
  continuous motion or background life). — (2026-10-25; where: 2026-10-30).
```

### A5. `video/docs/sound_plan.md`: a v1 banner under the title
Why: a v1-era doc (DIRECTION's ladder: measurements, never style); three of its sync lines now differ from the practice
(A6, A8 below, and "a sound for every visual event").

old:
```
# Sound plan: php2shell explainer (55.37 s loop)

Owner: sound stream.
```
new:
```
# Sound plan: php2shell explainer (55.37 s loop)

> **v1 history (banner, 2026-10-30).** Keep it for video 1's measurements, tools, beds and mix chain. Which sound lands
> on which picture, when and how often is `docs/look/SOUND_SYNC.md` (distilled from the owner's two sound reels); where
> this file differs (the ±100 ms nudge, the film-wide beat-lock, a sound for every visual event), that page wins. Never
> brief a lane's sync from this file.

Owner: sound stream.
```

### A6. `video/docs/sound_plan.md`, "CURRENT STATE": the film-wide beat-lock retired
Why: under the voice the bed's beat is masked (a median 27 dB under it in this very mix); the reels lock only their
release (`SOUND_SYNC.md` O8, X4).

old:
```
    With `--grid half`, all 11 are at 0 ms. Tempo is 90.9-103.0 BPM, with at most 3.3 % change per beat (`audio/tempo_map_beatlocked.json`).
```
new:
```
    With `--grid half`, all 11 are at 0 ms. Tempo is 90.9-103.0 BPM, with at most 3.3 % change per beat (`audio/tempo_map_beatlocked.json`).
  - (2026-10-30) A film-wide lock is retired: lock only the moments the music is heard in the clear (the hook's end, the
    turn, the release, the close): `docs/look/SOUND_SYNC.md` O8, X4. The tools stay.
```

### A7. `video/docs/sound_plan.md` §7: the density rule becomes a checked budget
Why: "one every 2-3 s" was never enforced (v1 placed 3.1 cues a second, v2 1.4: `sound_sync/audit.md` §3).

old:
```
2. **One sound per idea, at most about one every 2-3 s.** If two things happen at once, sound only the one the eye goes to.
```
new:
```
2. **One sound per idea, at most about one every 2-3 s.** If two things happen at once, sound only the one the eye goes to.
   Now a checked budget: `docs/look/SOUND_SYNC.md` §3c (~8-12 hard sync points in a 40 s film, most in the hook; every
   one-shot cue under ~0.5 a second).
```

### A8. `video/docs/sound_plan.md` §7, the cue sheet: "within ±100 ms" is a soft sound's tolerance only
Why: a sharp transient needs its frame (the reels: 0 f; `SOUND_SYNC.md` §1c.5).

old:
```
Times come from `timing.json`. **Nudge each cue to its visual event** once scenes exist (usually within ±100 ms).
```
new:
```
Times come from `timing.json`. **Put each cue on its visual event** once scenes exist: a sharp sound's transient on the
event's first visible frame or up to 2 f (33 ms) after it, never before; a soft sound's onset or crest from 3 f before to
6 f after; measured from the transient, never the file start (`docs/look/SOUND_SYNC.md` §1c; the old "within ±100 ms"
was a soft sound's tolerance).
```

### A9. `video/docs/motion_spec.md` §7: "Lead, don't follow" is the picture against the VOICE
Why: v2's cue sheet read this rule as "effects 2 frames before their picture" (`sound_sync/audit.md` §4.3).

old:
```
1. **Lead, don't follow.** Picture onsets come 1-4 frames before the sound. Nothing in the reference starts more than 70 ms after its word.
```
new:
```
1. **Lead, don't follow.** Picture onsets come 1-4 frames before the sound. Nothing in the reference starts more than 70 ms after its word.
   This is the PICTURE against the VOICE (2-8 f at 60 fps). A sound effect against its own picture is the other case: on
   the event's first visible frame or up to 2 f after it, never before (`docs/look/SOUND_SYNC.md` §1c; video 2's cue
   sheet merged the two and put 17 effects 2 f early: `docs/look/sound_sync/audit.md` §4.3).
```

### A10. `video/docs/timing.md`, the frame rule: where a picture event and a cue land at 60 fps
Why: a 1 f error is the difference between PASS and WARN for a sharp hit; the two roundings differ.

old:
```
All times are in **seconds from the first audio sample**, with 3 decimals. Frame = `Math.round(t * fps)`; the `@30` columns assume 30 fps.
```
new:
```
All times are in **seconds from the first audio sample**, with 3 decimals. Frame = `Math.round(t * fps)`; the `@30` columns assume 30 fps.
At 60 fps a picture event keyed at t first shows on frame ceil(t x 60), and Film plays a sound cue's file start on
round(t x 60) (`docs/look/SOUND_SYNC.md` §1c).
```

### A11. `video/docs/timing.md`, Conventions: today's takes carry no stress
Why: the sync plan needs stressed words (O2), and `public/vN/voice_words.json` has `{w, s, e}` only.

old:
```
- `stress` (0 to 1) is a percentile rank of acoustic prominence (loudness, pitch, duration per syllable), with function words damped and numbers boosted. `hits` holds every word with stress of 0.9 or more, plus every number word.
```
new:
```
- `stress` (0 to 1) is a percentile rank of acoustic prominence (loudness, pitch, duration per syllable), with function words damped and numbers boosted. `hits` holds every word with stress of 0.9 or more, plus every number word.
  (Video 1 only: today's takes, `public/vN/voice_words.json`, carry `{w, s, e}` and no stress; the sync plan marks its
  stressed words by ear at G2: `docs/look/SOUND_SYNC.md` §4.)
```

### A12. `video/docs/sound_credits.md`: the reference reels are never a source
Why: the reels keep their audio (the sound is the point of them); this states that none of it enters ours.

old:
```
or permissive material is used. Nothing needs on-screen credit. The credit line at the end is a courtesy.
```
new:
```
or permissive material is used. Nothing needs on-screen credit. The credit line at the end is a courtesy.
The owner's sound-sync reference reels (`docs/look/refs_sound_sync/`) are studied for timing only: no audio from them
is used or sampled anywhere.
```

### A13. `video/docs/OWNER_PLAYBOOK.md`, "Hook and pacing": "joins on the beat" means the voice's beat (a clarification)
Why: the retired "Cuts locked to the beat" became "joins on the beat, each carrying something"; DIRECTION rule 1 puts
each join's midpoint on the next sentence's first word, and `SOUND_SYNC.md` rejects a music beat grid (X4). Skip this
one if the orchestrator reads "beat" as the music's, and ask the owner instead.

old:
```
- **Every frame at least 8/10, no dead frames, joins on the beat** (every join carries something: `docs/look/CRAFT.md`
  §a). — (v1; joins, v3 G5b, 2026-10-27).
```
new:
```
- **Every frame at least 8/10, no dead frames, joins on the beat** (the voice's beat: each join's midpoint on the next
  sentence's first word, every join carrying something: `docs/look/CRAFT.md` §a; the music bends to a join only where it
  is heard, never a beat grid: `docs/look/SOUND_SYNC.md`). — (v1; joins, v3 G5b, 2026-10-27).
```

---

## Part B. The ladder and the gates (so the practice is reachable)

### B1. `video/docs/look/DIRECTION.md`, "Which doc wins": the topic is registered
old:
```
   `COZY_AND_SCALE.md` cozy framing, `LIFE_AND_DENSITY.md` fullness and life, `PALETTE.md` colour), and a measured
```
new:
```
   `COZY_AND_SCALE.md` cozy framing, `LIFE_AND_DENSITY.md` fullness and life, `PALETTE.md` colour, `SOUND_SYNC.md`
   which sound lands on which picture, when and how often), and a measured
```

### B2. `video/docs/look/DIRECTION.md`, rule 8: an effect never leads its picture
old:
```
  lead their word by ~0.1 s. -> `G3_ANIMATIC.md` §4; `PIPELINE_V2.md` "Frame rate"; `COZY_AND_SCALE.md` 3b.5.
```
new:
```
  lead their word by ~0.1 s, while a sound effect never leads its picture (on the event's first visible frame or up to
  2 f after: `SOUND_SYNC.md` §1c). -> `G3_ANIMATIC.md` §4; `PIPELINE_V2.md` "Frame rate"; `COZY_AND_SCALE.md` 3b.5.
```

### B3. `video/docs/look/DIRECTION.md`, rule 9: the opening's sound has a shape
old:
```
every opening effect large, long enough to register, with its own sound)
```
new:
```
every opening effect large, long enough to register, with its own sound, heard over a quiet floor; the build a count of three sounded changes and a fourth a little late: `SOUND_SYNC.md` S1, S3-S5)
```

### B4. `video/docs/PIPELINE_V2.md`, the G1 row: the sync plan is written with the script
old:
```
the voice comes at G2 | every word, the hook line, the card |
```
new:
```
the voice comes at G2; and, in the card, the **sync plan** (<= 8 lines: the hook's count and trigger, the release with its written voice pause >= 0.8 s, the thread's sound, at most 2 middle moments: `docs/look/SOUND_SYNC.md` §4) | every word, the hook line, the card and its sync plan |
```

### B5. `video/docs/PIPELINE_V2.md`, the G2 row: the plan is timed on the take
old:
```
word timings taken from it.
```
new:
```
word timings taken from it; the release's pause measured (>= 0.8 s, else that one gap lengthened before the lock) and the sync plan timed on the take (`docs/look/SOUND_SYNC.md` §4).
```

### B6. `video/docs/PIPELINE_V2.md`, the G3 row: the sync points freeze with the story
old:
```
thread coverage, tiers, the light rig, the mover budget |
```
new:
```
thread coverage, tiers, the light rig, the mover budget, the sync points (the count, the hold, the release: `docs/look/SOUND_SYNC.md`) |
```

### B7. `video/docs/PIPELINE_V2.md`, the G7 row: G7 finishes the plan, it does not invent sync
old:
```
| G7 Sound | SFX from the final beats, music, -14 LUFS mix | mix | audio | 1 h |
```
new:
```
| G7 Sound | the final sounds for G3's sync plan (sized like their gestures, every sync point heard; no new sync point, the picture never re-timed: `docs/look/SOUND_SYNC.md` §4), music, -14 LUFS mix | mix | audio | 1 h |
```

### B8. `video/docs/PIPELINE_V2.md`, the studio toolkit: the sync row
old:
```
| G2 sound | `video/audio/tools/make_phone_sfx.py` | our own positive phone sounds (like pop, ding, swoosh, cart add) |
```
new:
```
| G2 sound | `video/audio/tools/make_phone_sfx.py` | our own positive phone sounds (like pop, ding, swoosh, cart add) |
| G3-G8 sync | `docs/look/SOUND_SYNC.md` §4 (the sync check list); `video/scripts/qa/av_lag.py` (the voice in the render); `video/scripts/qa/sync_check.py` (to build: each cue's type, its window against the event's first visible frame, heard or not, the spend) | sync points planned at G1, timed at G2, played at G3, carried at G5, finished at G7 |
```

### B9. `video/docs/G3_ANIMATIC.md` §2, the signal contract: a sound sync row (after "Captions / timing")
old:
```
| Captions / timing | final | locked VO, pop captions, word-anchored cuts; reel at full runtime, 60 fps | gate check; full-reel watch |
```
new:
```
| Captions / timing | final | locked VO, pop captions, word-anchored cuts; reel at full runtime, 60 fps | gate check; full-reel watch |
| Sound sync | near-final (FROZEN) | the sync plan PLAYED with placeholder sounds: the hook's count (three sounded changes, a fourth a little late), the trigger in the first second, the hold and the release in its written pause, the thread's sound; each board `sfx` cue with a `type` and its event, on the event's first visible frame (`look/SOUND_SYNC.md`) | the sync check list (`look/SOUND_SYNC.md` §4); the sound-on read at 1x, on a phone's own speaker |
```

### B10. `video/docs/G3_ANIMATIC.md` §6, the sound-on check
old:
```
  lands on its word, cuts judged in PAIRS with their neighbours, pacing varies. The reader also answers "where is your
```
new:
```
  lands on its word, cuts judged in PAIRS with their neighbours, pacing varies; every sync point lands on its event and
  is heard, the hook's count reads as three and a late fourth, the release is felt (`look/SOUND_SYNC.md` §4). The reader
  also answers "where is your
```

### B11. `video/docs/G5_BLOCKING.md` §1, the entry diff compares the cues too
old:
```
  JSON — every camera move, element move, transition device and carrier, and `life:`/promise item matches, and no
```
new:
```
  JSON — every camera move, element move, transition device and carrier, `life:`/promise item and sound cue (its type
  and frame: `look/SOUND_SYNC.md`) matches, and no
```

---

## Part C. Notes and questions (not edits)

**Questions for the owner** (one screen, with the next hand-off):
1. "More sound effects" (2026-10-25): we read it as more NOTICEABLE story sounds, each heard, not more cues. Video 2
   already placed 56 (1.4 a second) and about half are not heard; your two reels sync only 4-5 moments each. OK?
2. Shall we run the four ITERATION A/Bs before the next film's G3 (about an hour, one agent): the hook's count under its
   first line with and without hits; one hit at -2, 0, +2 and +4 f on a phone speaker; a join with and without a soft
   whoosh; the payoff's arrangement step in a written 0.8 s pause?

**For the composition study** (its file is not ours to edit): `composition/motion.md` MR20 allows an effect "never more
than ~2 f before" its event; the practice builds at 0 f, PASSes 0 to +2 f, WARNs at -1 f (rounding only) and FAILs at
2 f or more early (`SOUND_SYNC.md` §1c.5; `audit.md` §6 change 3; `craft.md` C2.4). MR20 says the sound lane's numbers
win on sound, so the composition distill should carry this window when it moves MR20 into `CRAFT.md` §a or
`G3_ANIMATIC.md` §4.

**Tooling** (for the craft tooling lane, `PIPELINE_V2.md`; none is built here): `scripts/qa/sync_check.py` (§4's items
1-5); optional `type` and `event` fields on the board's `sfx` and on Film's `FilmSfx` (Film ignores unknown fields);
promote `audio/v2r/sheet.py`'s one-source timeline to house tooling with `lead()` retired for effects; a per-gap
override in `scripts/voice/generate_take.py` (its `--gap` is one value for every sentence end) so the release's pause
can be set without editing the take; the stamp's `slamScale` (`src/scenes/shared/props/Labels.tsx`) as an ease-in with a
squash, so its thunk has a contact frame (a motion question for the engine's owner).

**Summaries:** `HANDOFF.md` does not list the sound-sync research yet; when it records the owner's queue, mark it done
and point at `docs/look/SOUND_SYNC.md`. `CLAUDE.md` has no sync rule to change.
