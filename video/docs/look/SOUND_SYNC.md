# SOUND SYNC: which sound lands on which picture, when, and how often

**The owner, verbatim** (2026-10-30, with two phone screen recordings): "And then the next piece after that is the
research distill and practice of syncing the video and shots with with sounds so look here / We already do this and I
think decently okay we just need to be more intentional and educated about this effect and where it make sense to use".
The same day, on the composition study: "I didn’t get once again why you ignored all my references and came up with
yours?" So the owner's two reels are the spine of this page; our research and our audit are additions, labelled OURS.

**In five lines**
1. **Spend sync, don't sprinkle it:** the owner's two reels put all their hard sync (4-5 points) into the first 2.0-4.4 s and then rest (0 and 0.11 points a second); our video 2 placed 56 cues (1.4 a second) to its last frame, and half of them are not heard.
2. **One shape per film:** a quiet floor; a count of three sounded changes and a fourth that comes a little late (the hook); rest while the voice explains; ONE release at the payoff, the picture's biggest change and the bed's step together, in a written voice pause of >= 0.8 s (48 f).
3. **A hard sync is one short sound on one discrete change of the beat's subject,** on that change's first VISIBLE frame or up to 2 f after it, never before; the picture leads its WORD by ~0.1 s (6 f); continuous motion, background life, captions and the music's beats get no sync.
4. **Heard or cut, and sized like its gesture:** every sync point sits in a voice gap or is the loudest thing in its band; quick and playful is dry, bright and short, calm is soft, low and long; the biggest change gets the biggest sound.
5. **Sync is story structure:** planned at G1 (with the release's pause), timed on the G2 take, played and checked at G3, carried at G5, finished (never re-timed, never added to) at G7; fix first: the 2-frame early lead, cues keyed to the clock instead of to what is seen, and the payoff's release buried under speech.

**What this is.** Our named practice of syncing picture to sound, distilled from the owner's two reels
(`refs_sound_sync/`; every moment measured in `sound_sync/reels.md`, sheets `sound_sync/reels_timeline_01.png` and
`sound_sync/reels_timeline_02.png`), the craft research (`sound_sync/craft.md`) and the audit of our own films
(`sound_sync/audit.md`). §1 is the library (the reels' moments first, in reel order; then ours), §2 ranks it, §3 says
where each type fits, §4 how it enters the gates, §5 maps every reel moment to what we do with it. The research files
keep the evidence; this page keeps the decisions.

**Rank.** A look doc on DIRECTION's ladder (under the owner's words, DIRECTION, CRAFT, PIPELINE_V2 and the gate specs;
above the film's STYLE.md and the v1-era sound docs `docs/sound_plan.md`, `docs/motion_spec.md` and `docs/timing.md`,
which keep their measurements and tools). Its topic: which sound lands on which picture, when, and how often. Levels,
voice treatment and writing the music stay with the sound lane. The composition study's join rule MR20
(`composition/motion.md` §4.4) defers to it on sound.

**Conventions.** Seconds and frames at 60 fps (1 f = 16.7 ms; 6 f = 0.1 s; 30 f = 0.5 s; 60 f = 1 s). **Lag = sound
time minus picture time:** "+2 f" = the sound 2 frames AFTER its picture, "-1 f" = 1 frame BEFORE it; every lag is also
said in words. (`reels.md` and `audit.md` write offsets the other way, picture minus sound: the signs flip here.) A
**hard sync point** is one short sound (a knock, a click, a pop, a tick, a soft hit's onset) married to one discrete
picture change, meant to be heard as one event; **soft sync** is a swell, a join's carrier or the bed whose crest or
step meets a change; **texture** is sound with no picture event (air, ambience, a pen under its strokes). Paths are
from `video/`, except what sits beside this page in `docs/look/` (`CRAFT.md`, `sound_sync/`, `composition/`,
`refs_sound_sync/`); bare `reels.md`, `craft.md` and `audit.md` are the three research files in `sound_sync/`. Reel
moment codes (01-1, 02-5) are `reels.md`'s; the device names R1-R10 in brackets are `craft.md` A3's. Reel times are the
recordings' clocks, the sound corrected for the capture shift (+0.168 s, `reels.md` 0.3); reel 02's correction is
inferred, so its lags also give the raw value.

---

## 1. The library

### 1a. From the owner's reels, in reel order

Reel 01 (9.52 s usable, no voice): a mug from above, three knocks, a click, a song. Reel 02 (13.6 s, no voice): a title
over a sunlit field, three soft hits, a drop, a montage.

**S1 The quiet floor** [R7]. Reel 01-0, 0.000-0.267 s (f0-f15), and between the knocks; reel 02-0b, and 02-4.
- *Is:* near silence under the opening's hits and before the release (reel 01's floor sits ~33 dB under its knocks;
  reel 02 falls to its quietest moment, -41.8 dBFS, just before the drop).
- *Says:* "listen": small sounds read big, and the release reads huge. The contrast is the impact.
- *Timing:* the hook's hits 21-33 dB over the floor; before the release, 0.3-1.23 s (18-74 f) quieter than anything
  before it.
- *Build:* no music bed under the hook, air or room tone only (v2 ran air alone for 6.28 s, f0-f377); the bed enters as
  the hook's effect (S6) and thins or stops into the hold (S10). Sound lane: the bed's arrangement
  (`audio/tools/bed_*.py`) and `audio/mix.py`; nothing in the picture.

**S2 The hit-cut** [R1]. Reel 01-1, 0.267 s (f16): a hard cut in the same framing, the milk becomes espresso crema, on a
dry knock at 0.272 s; again 01-2, 01-3.
- *Is:* one short sound on the first frame of one discrete change of the subject (a cut, a state swap, a thing
  appearing whole).
- *Says:* "this changed": the sound IS the change (Chion's synchresis: a sound at the moment of a change welds to it,
  `craft.md` B1). It is also a pointer: the eye goes where the hit lands (pip and pop, `craft.md` [C4]).
- *Timing:* lag 0 f (reel 01: -0.5 to +0.3 f after the correction: on the frame). A sharp sound: PASS 0 to +2 f (§1c.5).
  The reel's knock: ~0 dBFS peak, ~1.0-1.2 kHz, 20 dB down in 40 ms, mixed 11 dB over its music.
- *Build:* the event's first visible frame `fe`, the cue's transient on it (§1c.2-3); a one-frame swap, or an
  out-eased entrance whose first frame is the jolt (`MOTION.rise`, `MOTION.popFrom`). Our joins are carried (DIRECTION
  rule 1), so ours is mostly a state swap inside a shot, a B match (v2's lamp click on the match at 12.983 s, f779,
  heard +23 dB in a pause: our best measured moment) or one of the <= 2 plain cuts.

**S3 The count-in** [R2]. Reel 01-1 to 01-3: three knocks 32 f (0.533 s) apart; reel 02-1 to 02-3: three words on hits
67, 72, 76 f apart.
- *Is:* three equal, or slowly lengthening, sounded changes.
- *Says:* "one, two, three": the ear predicts the next and the eye gets ready for it (after a regular rhythm the eyes
  reach an on-beat target faster, even once the rhythm has stopped; an irregular one gives no gain: Miller, Carlson and
  McAuley 2013, `craft.md` [C11]), so the fourth becomes an event.
- *Timing:* steps 30-76 f (0.5-1.27 s): 30-40 f for a quick, playful process (reel 01, and every hook: §3a), 60-76 f
  for a calm one, slowing by 4-5 f a step (reel 02). Never under 30 f (separate reads need >= 0.5 s:
  `composition/motion.md` §5.2). Three, never four equal steps (a fourth turns the count into a loop). Each hit climbs in
  pitch (reel 01's knocks: 1.04, 1.13, 1.19 kHz) or grows in weight (reel 02's biggest word, lowest hit).
- *Build:* three changes of the subject's own build (DIRECTION rule 9: never extra life), each keyed to a phrase start
  of the hook line: the picture 6 f before the stressed word after a gap (O1), its hit on the picture's frame, so it
  lands inside the gap and is heard. Write the hook line in three short beats (the playbook's rhythm rule; when
  `scripts/voice/generate_take.py` stitches by line, it leaves 0.18 s after a comma line and 0.32 s after a
  sentence). A step that falls inside a word gets no effect: the stressed syllable is its sound (O2).

**S4 The late fourth** [R3]. Reel 01-4, 1.967 s (f118): the reveal comes 6 f after the pulse's f112; reel 02: the drop
after the longest gap (1.261 s against 1.193 s, +4 f).
- *Is:* the count's fourth event arrives a little later than the pulse promised.
- *Says:* a held breath, then the payoff: an expectation bent, then paid (Huron, `reels.md` [S5]).
- *Timing:* the fourth step 4-6 f (0.07-0.10 s) longer than the one before; never more than ~1/4 of the step (it then
  reads as a miss: EST, `craft.md` B9).
- *Build:* `fe4 = fe3 + step + 4..6`. With a voice: the fourth's word follows the hook's longest gap, and it carries the
  hook's payoff (the payoff in words by ~2 s: DIRECTION rule 9).

**S5 The trigger click** [R4]. Reel 01-4, 1.967 s (f118): a bright click, two ~20 ms ticks (8.3-8.6 kHz) 84 ms (5 f)
apart, on the cut that reveals a music player.
- *Is:* an interface sound as the cause of what we see next.
- *Says:* "pressed": a phone action told without a word; the playbook's sound "people link with something good on their
  phone".
- *Timing:* the first tick on the change's first frame (lag 0 f), the second ~5 f later (press, release). In the reel it
  is the brightest sound, peaking at 0 dBFS.
- *Build:* one in the first second (f0-f60: playbook), from our own phone-like set (`audio/tools/make_phone_sfx.py`:
  pop, ding, swoosh, cart add; never a platform's real sound), on a discrete change (a press, a screen or a lamp
  lighting, a door), in a voice gap so it is heard (v2's exit ding at 0.45 s, f27, sat under "She": heard by +0.9 dB
  only). It may be the count's first hit.

**S6 Cause, then effect** [R5]. Reel 01-4 to 01-5: the click at 1.967 s (f118), then the song at 2.449 s (f147), 0.481 s
(29 f) later, on no picture event.
- *Is:* a sound that starts something, then the something: two events, in order.
- *Says:* "and so...": causality in sound. It is also the release's split form (an L-cut: the quiet runs on under the
  new picture before the music enters).
- *Timing:* the effect 18-30 f (0.3-0.5 s) after the cause. Under ~6 f the two merge (reel 01's own click is two ticks
  5 f apart, heard as one click; v2's lamp OFF at f24 and its ding at f27 read as one event); past ~60 f (1 s) the link
  breaks (EST).
- *Build:* the effect is mostly the bed: its first entry (the hook's effect: small, v1's air-to-pulse entrance was ~10 dB)
  or its step (S7), written so its first note lands 18-30 f after the cause's frame (bend the bed's tempo map:
  `scripts/qa/beatsync.py --fit-tempo`, `audio/tools/beatlock.py`); or a light coming on, the thread's next state.

**S7 The release** [R8]. Reel 01-5, 2.449 s (f147): the song enters, +26 dB. Reel 02-5, 4.383 s (f263): the drop, a hard
cut to wildflowers against the sky as bass and keys enter, +32 dB; lag +3 f (the sound 48 ms after the picture; raw: 7 f
before it).
- *Is:* the largest change in both channels at once (02-5: the reel's biggest picture change and biggest level step on
  one frame), or split (01: the picture, then the music 29 f later: S6).
- *Says:* "here it is": the payoff that the count, the late fourth, the floor and the hold were building.
- *Timing:* once per film, from the quietest point. The reels step +26 and +32 dB; a voice-led film cannot step its
  level under speech (v2's payoff: the bed +17.8 dB, the master +0.7 dB under "facts"), so ours plays in a written voice
  pause of >= 0.8 s (48 f): the bed's duck needs ~0.45 s (27 f) to let go, which leaves ~0.3 s (18 f) in the clear
  (`craft.md` B7). The picture's biggest change on `fr`; the bed's step on `fr` (lag 0 f, its downbeat bent onto the
  frame) or 18-30 f after it (the split form).
- *Build:* G1 writes the pause into the script; G2 locks it in the take (if the take's gap is short of 0.8 s, lengthen
  that one gap before the lock); the bed steps by ARRANGEMENT (a layer enters: the pulse, the bass, a brighter
  register); the picture gives the payoff's biggest change (a light floods, the thread turns, the pull-back lands). The
  bed's first entry after the hook (S6) is small; this is the one big step. Never two.

**S8 The rest** [R9]. Reel 01-6, 2.45-9.52 s (f147-f571): one held frame for 7.6 s, nothing synced, only the ice
drifting; reel 02-9 (and 02-6 to 02-8): cuts with the music's flow, one on a chord change in 9.2 s.
- *Is:* after the release the music carries and the picture asks for nothing.
- *Says:* "take it in". Rest is what makes the spent sync count.
- *Timing:* the reels: 0 hard sync points in 7.55 s (01), 1 in 9.2 s (02). Ours is the film's middle, the explanation
  between the hook and the payoff: at most 1 hard sync point per 10 s (600 f).
- *Build:* nothing to add: the voice leads, the pictures lead their words (O1), the joins carry the cuts (DIRECTION rule
  1) with at most a soft carrier (O5), the bed moves by section, and the world keeps its life, silently (DIRECTION rule
  3: never a dead frame).

**S9 The word-on-hit** [R6]. Reel 02-0 to 02-3: "The" (on at f0, its hit before the recording), "Art" at 0.750 s (f45),
"of" at 1.883 s (f113), "NOTICING" at 3.150 s (f189), each popping on whole, in one frame, on a soft low hit.
- *Is:* a word appears whole, on its own sound.
- *Says:* the title "spoken" by hits; the biggest word gets the lowest, loudest hit (388 Hz centroid, 167 Hz body,
  -5.3 dBFS, against ~500 Hz and -6.8 / -6.1 dBFS).
- *Timing:* soft hits (centroid 390-520 Hz, 0.11-0.20 s tails, ~21-23 dB over the bed); lag +7, +6, +1 f after the
  correction (raw: 3, 4, 9 f before): with the drop, the four sit within ±3 f of one common offset, hand-placed to
  about one source frame. A soft sound: PASS -3 to +6 f (§1c.5).
- *Build:* only for a word in the picture that is not a caption (captions pop silent: `docs/sound_plan.md` §7.7): the
  word that carries the core line, a number, a sign or a label of the subject. It pops whole (a one-frame swap or
  `MOTION.popFrom`) 6 f before its spoken word (O1), its soft low hit on that frame, in a voice gap. Under speech our
  word-on-hits lost to the very words they marked (v2: 12 placed, half marginal or buried): no gap, no hit (O2).

**S10 The hold** [R7 before R8]. Reel 02-4, 3.15-4.38 s (f189-f263, 74 f): nothing new is said; the sound decays to the
reel's quietest point (-41.8 dBFS in the last 0.1 s before the drop) while the picture's drift turns into a sideways
pan that speeds up 4x.
- *Is:* silence while the picture leans forward.
- *Says:* "wait for it". The quiet does a riser's work: neither reel has a riser or a whoosh.
- *Timing:* 0.3-1.23 s (18-74 f) right before the release; the picture keeps moving and gathers speed (reel 02: ~4 to
  ~16 px/s in our 1080 px frame).
- *Build:* the release's written pause (S7) with the bed thinning or stopping into it ("the silence is the effect":
  `docs/sound_plan.md` §7.6), over a slow push that keeps moving (>= 3 % per 2 s: `composition/motion.md` MR6); never a
  still frame, never a riser.

**S11 The cut with the flow** [R9]. Reel 02-6, 7.617 s (f457): a cut to a sunflower 0.43 s (26 f) before the next chord
change (0.26 s, 16 f, raw); 02-7 sits mid-phrase.
- *Is:* a cut inside the music's phrase, on no beat.
- *Says:* nothing by itself: the music bridges it; the cut follows the picture's need (for us, the voice's).
- *Timing:* reel 02's cuts after the drop come 1.83-3.23 s (110-194 f) apart, 4.3-7.6 beats: no count of beats or bars.
- *Build:* our default for every join: its midpoint on the next sentence's first word (DIRECTION rule 1), the bed
  running across it unbroken, no beat lock under speech (§3d). The playbook's "joins on the beat" is this beat, the
  voice's, never a music grid.

**S12 The punch-in** [R10]. Reel 02-7, 9.450 s (f567): the same sunflower, much closer, on the same axis, on an 8th-note
accent (chance level: an accent falls every 0.21 s).
- *Is:* a cut to the same subject, bigger. *Says:* "look closer".
- *Timing:* soft: lag 0 f, PASS -3 to +6 f.
- *Build:* for us one of the film's <= 2 plain cuts (carrier F, on a "But" turn: DIRECTION rule 1), the subject >= 20 %
  bigger (`composition/motion.md` J14), its picture 6 f before the turn's stressed word, with a soft accent on that
  frame or the bed's change (S13). At most once.

**S13 The cut on the music's change**. Reel 02-8, 11.383 s (f683): a cut to a butterfly 82 ms (5 f) before the chord
change at 11.465 s, the strongest low accent after the drop (raw: 86 ms after it; as tight as the title hits).
- *Is:* a cut on a change in the music's harmony or section, not on its pulse.
- *Says:* "a new part": the picture and the music turn the page together.
- *Timing:* lag 0 f on the change (soft: PASS -3 to +6 f); once in the reel's 9.2 s after the drop.
- *Build:* the film-scoring way: the voice places the join; the bed is written to change (a chord, a layer, a section) on
  the join's midpoint frame (`scripts/qa/beatsync.py --fit-tempo` and `audio/tools/beatlock.py` bend it there); heard
  only in a voice pause. At most twice a film: the turn and the release.

**What the reels never sync** (`reels.md` 1.2, 2.2): the song's beats and strums (01: 11 beats), the 8th-note pulse (02:
36 onsets), any motion inside a shot (the ice, the flowers, the handheld sway, the camera's drift), a chord change with
no cut (02, 8.05 s), the title's exit, faint texture (01-1b: two ticks ~25 dB under the knocks); no whoosh, riser,
impact or hit after the release. Only 4 of 23 and 5 of 40 sound onsets (13-17 %) meet a picture event.

### 1b. Our additions (OURS: research and our own films; never above the reels)

**O1 The word-led picture.** DIRECTION rule 8; measured on reference 1 (`docs/motion_spec.md` §7).
- *Is / says:* the picture shows, then the voice names it: the picture's event a little before its word.
- *Timing:* the bold frame 0.1 s (6 f) before the word's onset; window 0-0.3 s (0-18 f) before
  (`composition/motion.md` §4.4); a build that must complete on its word starts 0.25-0.40 s (15-24 f) before it;
  nothing starts more than 0.07 s (4 f) after its word.
- *Build:* `at = words[i].s - 0.10` (§1c.1). A sound effect on that event sits on the PICTURE's frame, so it also comes
  ~6 f before the word, clear of its consonant (inside the gap, when the word follows one). Never 2 f before the
  picture (X6).

**O2 The voice as the count.** `craft.md` C2.1; v2's protected hit words (`audio/v2r/sheet.py` HIT_WORDS).
- *Is / says:* where a hit would land inside speech, the stressed syllable IS the sound; the picture lands 6 f before
  it, with no effect. The voice stays on top and the count is still heard.
- *Timing:* as O1: the picture's bold frame 6 f before the stressed syllable's onset.
- *Build:* mark the plan's stressed words by ear on the G2 take (today's `public/vN/voice_words.json` carries `{w, s, e}`
  only; v1's `assets/timing.json` ranked `stress` and listed `hits`: `docs/timing.md`).

**O3 The thread's sound.** v2's lamp: OFF at 0.400 s (f24), ON on the B match at 12.983 s (f779), ON at 34.950 s (f2097)
(`audit.md` §2, rows 2, 24, 52).
- *Is / says:* the through-line card's thread object has ONE recurring sound for its state changes; it ties the film
  together as reel 01's one knock ties its count.
- *Timing:* each on its frame (lag 0 f); 2-3 times a film; callbacks 3 dB softer (`docs/sound_plan.md` §7.5); the last
  at, or just before, the release.
- *Build:* one file, in voice gaps.

**O4 The contact.** `craft.md` B6 ([C30], [C33], [C34]); reel 01's knocks are its dry cousin.
- *Is / says:* a landing, a drop, a slam: the sound of arrival.
- *Timing:* the transient on the contact frame (the ease-in's LAST frame), lag 0 f (sharp: PASS 0 to +2 f); a 1-2 f
  squash after it.
- *Build:* `ease.inCubic` into contact, or `MOTION.unbuild`'s collapse. Never a hit at the end of an ease-OUT or an
  in-out settle (it lands on nothing). Today's stamp `slamScale` (`src/scenes/shared/props/Labels.tsx`: a 0.13 s ring,
  then 2.6x to 1x in 0.27 s on in-out cubic) has no contact frame: hit its fastest frame (~8 f into the slam), or make
  the slam an ease-in with a squash (a proposal for the engine's owner).

**O5 The join's carrier sound.** v2's eight joins each carried one sound cresting within 2 f of the midpoint (`audit.md`
§2, the joins).
- *Is / says:* a soft sound riding a fast carrier (a push-through's rush, a wipe's air, a passing boat); a continuous
  sound across a cut hides it (`craft.md` [C8]).
- *Timing:* the crest on the join's midpoint, PASS ±2 f; in the voice pause; nothing else starting from 0.20 s (12 f)
  before to 0.12 s (7 f) after the midpoint (v2's `audio/v2r/premix.py`). Soft, never a hit.
- *Build:* fast carriers only (push-through, wipe); a slow one (the continuous camera) gets none. The reels use no
  whoosh at all: whether a join wants one is an open A/B for an ITERATION (§4).

**O6 The place's sound bridge (J and L).** `composition/motion.md` MR20; reel 01's split release is an L (S6).
- *Is / says:* the next place is heard before it is seen (J: "we are going there"), or the last one lingers under the
  new picture (L: "let it land").
- *Timing:* the next place's ambience leads its picture by 0.2-0.5 s (12-30 f) (J); the last one trails 0.3-1.0 s
  (18-60 f) under the new picture (L), ducked; one bridge per join, where the place has a sound (EST: no source gives a
  length).
- *Build:* a looped ambience cue (`audio/mix.py`'s `"loop": true` with `fade_in` / `fade_out`) whose fade starts 12-30 f
  before the join's midpoint, or ends 18-60 f after it; soft, under the voice, never a hit.

**O7 The swell's crest.** `craft.md` B6 [C35].
- *Is / says:* a rising sound whose top IS the change: "it's coming", then "here".
- *Timing:* the crest on the change, lag 0 f (soft: PASS -3 to +6 f); 1-2 s (60-120 f) long for short form. Our
  `low_swell` (3.5 s) peaks at its end: start it at the hit minus 3.5 s.
- *Build:* only into the one release or the one scale reveal, only where the bed does not already rise
  (`docs/sound_plan.md` §7.6), and never instead of the hold (S10).

**O8 The music lock where it is heard.** `craft.md` B4; `docs/sound_plan.md` "CURRENT STATE".
- *Is / says:* the bed bent so a downbeat falls on a cut's frame: the music and the picture agree, once, where both are
  heard.
- *Timing:* the downbeat on the join's midpoint frame (soft: PASS -3 to +6 f); at 90-140 BPM a beat is 26-40 f
  (0.43-0.67 s), so a bend of a few percent moves it onto the frame.
- *Build:* `scripts/qa/beatsync.py --fit-tempo`, then `audio/tools/beatlock.py`, only for moments the music is heard in
  the clear (the hook's end, the turn, the release, the close). Under speech the bed's beat is masked (v1: a median
  27 dB under the voice), so a lock there buys nothing (v1 locked 10 of 11 cuts).

### 1c. Building any of them (Remotion)

1. **The clock.** The locked take's word timings, `public/vN/voice_words.json` = `{durationSec, lead, take, words:
   [{w, s, e}]}`: seconds from the voice file's first sample, which is film time (the first word at the take's lead,
   ~0.12 s, f7).
2. **The picture's frame.** Key the event in seconds (`at`). A scene shows it first on frame `fe = ceil(at x 60)`
   (scenes test `t >= at` on t = frame / 60: `pic_frame()` in `audio/v2r/sheet.py`). `fe` is the BOLD stage, the frame
   the eye reads as the change: a draw-on's fill (`MOTION.fillLag`: 8-16 f after its line starts), a pop's appear
   frame, a contact's last frame, a two-drawing close's second drawing. Confirm it on the render (a spike of frame
   difference in the event's box), never from the clock alone.
3. **The cue.** `<Film sfx>` (and SketchReel at G3) plays a cue's FILE START on frame `round(t x 60)`
   (`src/lib/Film.tsx`). So `t = (fe + lag) / 60 - pre`, where `pre` = the seconds from the file's first sample to its
   transient (half-rise) or crest, measured once per file (our trimmed one-shots: ~0; a swell: its crest), and `lag` =
   0 f (0 to +2 f allowed), never early by design. `gain` is linear (default 0.6).
4. **Heard.** A hard sync sits in a voice gap with >= 80 ms (5 f) clear after its transient (`words[i].e` to
   `words[i+1].s`), or is the loudest thing in its octave band for its first 80 ms (`audit.md` §7's method); the mix
   keeps every effect >= 8 dB under the voice where they overlap (`audio/mix.py`). If it cannot be heard, it is not a
   sync point: cut it, or move the event into a gap.
5. **The windows.** Viewers notice a sound EARLY sooner than a sound LATE (ITU-R BT.1359: detection at 45 ms early
   against 125 ms late; acceptability 90 / 185 ms), sharp events are judged more strictly than soft ones, and the
   reels sit at 0 f. Measured from the transient or crest, never the file start.

   | Sound | Build at | PASS | WARN | FAIL |
   |---|---|---|---|---|
   | sharp (attack < 10 ms: knock, click, pop, tick, contact) | lag 0 f | 0 to +2 f (0-33 ms after) | -1 f (rounding only); +3 to +7 f | 2 f or more early; 8 f or more late |
   | soft (attack >= 30 ms: low hit, swell crest, carrier, the bed's step) | lag 0 f | -3 to +6 f | -5 to -4 f; +7 to +11 f | 6 f or more early; 12 f or more late |
   | a picture against its WORD (O1) | 6 f before the word | 0-18 f before | 1-4 f after; over 18 f before | over 4 f after |

   Two frames early is under the detection threshold, but it is never a choice: it adds to every other error (v2's
   2 f lead on a clock-keyed event became 8-10 f early in the hook).
6. **The ease that lands on the hit.** A picture's "beat" is a sudden change of speed: a start or a stop (Davis and
   Agrawala, `craft.md` [C30]; the mapping is ours, `craft.md` B6).

   | The move | Its hit frame | Our presets |
   |---|---|---|
   | a cut, a match, a state swap, a word appearing whole | the new picture's first frame | Film `cut`, `matchcut`; a swap at `at` |
   | an entrance that decelerates (pop, rise, slide in) | its FIRST visible frame (the jolt) | `MOTION.rise` (out-exp: half its travel in frame 1), `MOTION.popFrom` (appears at 30 %, holds 4 f), `springs.pop`, `ease.outCubic`, `ease.expOut` |
   | a move into contact that accelerates (drop, landing, slam, collapse) | its LAST frame; squash 1-2 f after | `ease.inCubic`, `MOTION.unbuild` |
   | a draw-on | the fill's first frame; the pen is texture under the strokes | `MOTION.stroke`, `MOTION.fillLag`, `MOTION.fillGrow` |
   | a push-through join | the cut frame (the zoom's fastest): a soft carrier's crest | Film's push-through (in-cubic out, out-cubic in) |
   | a camera move from rest to rest | none at its start or end; a carrier, if any, crests at its midpoint | `MOTION.camera.ease` (in-out cubic), `.slow` (in-out sine) |
   | a cruise (a reveal) | its arrival: a swell's crest or a soft low hit on the landing | `MOTION.camera.reveal` (trapezoid 0.25 / 0.35) |
   | a settle, a float, a drift, idle life | silence | `MOTION.camera.settle`, the `src/lib/depth.ts` float, `ease.linear` |
7. **The judge.** The render file, never a screen recording or Bluetooth earbuds (reel 01's own recording shifted its
   sound by 168 ms, 10 f: `reels.md` 0.3): `scripts/qa/av_lag.py` for the voice inside the render, the sync check
   (§4) for each cue, then one watch on the phone's own speaker.

---

## 2. Ranked

| Rank | Type | Dose | Why |
|---|---|---|---|
| **Core**: every film | O1 the word-led picture | every word-keyed event | the film is voice-led; picture first, then its word, is our measured grammar (reference 1: elements 0.10 s before their word) |
| | S1 the quiet floor, S3 the count-in, S4 the late fourth (the hook's shape) | 3 sounded changes and a late fourth by ~2.4 s, over air | both reels open this way; it gives the playbook's "every opening effect ... with its own sound" a shape; video 3's opening had it (13 cues in 4.04 s, then 5 in 37 s), video 2's lost it |
| | S5 the trigger click | 1, in the first second | the playbook asks for it (owner, 2026-10-25); reel 01's trigger |
| | S2 the hit-cut | the form of every hard sync point | one sound, one change, one frame: every sync point in both reels |
| | S10 the hold, then S7 the release | once, at the payoff | the strongest moment of both reels; video 2's payoff release was not heard (+0.7 dB) |
| | S8 the rest, with S11 the cut with the flow | the middle: <= 1 hard sync point per 10 s | both reels rest after their release; spent sync counts, sprinkled sync is texture |
| | O3 the thread's sound | 2-3 times | the through-line card's thread, in sound; video 2's lamp |
| **Situational**: by beat or emotion (§3) | S6 cause, then effect | a phone action, a switch; the bed's entry after the hook | reel 01's release; past ~1 s the link breaks |
| | S9 the word-on-hit | <= 3 words that are not captions, in voice gaps | reel 02; under speech it competes with the word it marks |
| | O2 the voice as the count | wherever a hit would fall inside a word | keeps the voice on top and the count heard |
| | O4 the contact | a landing, a slam, a stamp | the sound of arrival; needs an ease-in's contact frame |
| | O5 the join's carrier | fast carriers only | hides the cut; the reels use none (A/B open) |
| | O6 the place's bridge | a join into a place with its own sound | smooths a join; no source gives a length |
| | S13 the cut on the music's change | <= 2: the turn, the release | reel 02's only sync point after its drop |
| **Rare** | S12 the punch-in | <= 1, as the turn's plain cut | reel 02 (chance level); our joins are carried |
| | O7 the swell's crest | <= 1, into the release or the scale reveal | the reels use the hold instead |
| | O8 the music lock | the hook's end, the turn, the release, the close | under speech the beat is masked |
| | a stinger (a "hero sound") | <= 1, on the payoff, only if the release needs it | "hero sounds" for celebrations only (Material, `craft.md` [C36]); v1: special sounds once |
| **Rejected** | X1 mickey-mousing: a sound on every move or event | never | the reels sync 13-17 % of their onsets; v1 placed 3.1 cues a second, v2 1.4; it cheapens (`reels.md` [S8]) |
| | X2 sound on continuous motion or background life (drift, float, sway, idle, birds, boats, traffic) | never | the reels never sound motion inside a shot; a sound promotes what it lands on: v2's birds masked the hook's count |
| | X3 a whoosh on every join or move, or cresting on a word | never | the reels use none; it masks the consonant; the template look |
| | X4 the beat grid (a cut on every beat, the bed bent to every cut) | never | the music-video norm (`craft.md` [C29]); it fights the voice, and under speech the beat is not heard |
| | X5 velocity edits, speed ramps, flashes on accents | never | outside "alive but calm" (DIRECTION rule 3) |
| | X6 a sound early by design (v2's `lead()`: 2 f) | never | sound-early is noticed first; no gain when the tone leads (`craft.md` [C5]); in v2 it compounded to 8-10 f |
| | X7 a release under speech, or a second release | never | video 2's two accents were not heard as releases |
| | X8 a fourth equal hit, or a roll posing as a count | never | four equal steps make a loop; v2's callback (three ticks in 0.08 s) was a roll |
| | X9 a sound on every caption or every word | never | captions pop silent (`docs/sound_plan.md` §7.7); reel 02's words are a title, not captions |

---

## 3. Where it fits

### 3a. By story beat (a 30-45 s film)

| Beat | What syncs | Types | When | Hard sync points |
|---|---|---|---|---|
| Frame 0 | the clean pen drawing the subject, over air (texture) | S1 | from f0; the first word at ~0.12 s (f7) | 0 |
| First second, then the hook's build | a phone action on a discrete change (S5), then three changes of the subject's own build, each sounded (S3); the trigger may be the count's first hit | S5, S3 with S2 or O2 | the trigger inside f0-f60, in a voice gap; the count's steps 30-40 f from ~0.3 s; every hit >= 30 f from the next | 3-4 |
| The hook's turn (reality overtakes, ~2 s) | the fourth, a little late, on the payoff words; the bed may enter as its effect (small) | S4, S6 | ~1.9-2.4 s (f114-f144) | 1 |
| The middle (the explanation) | pictures on their words; joins carried; the thread's sound once | O1, S8, S11, O5, O3 | from the hook to the payoff | <= 1 per 10 s |
| A list, a run of numbers | a count of 2-3 items, voice-led, the last one late | S3 as O2 | steps of 30-60 f | <= 3, once a film |
| A reveal (the scale reveal, the one big move) | its landing, never its travel | O7 or O4 | the arrival frame | 1 |
| The turn ("But") | the bed changes on the join (stops, or a layer leaves); at most one plain cut | S13, S12 | the join's midpoint; the picture 6 f before "But" | 0-1 |
| The payoff | the hold, then THE release; the thread's last sound | S10, S7, O3 | a written pause >= 0.8 s (48 f) on or just before the payoff word | 1-2 |
| The end and the loop | rest; the un-build's sound runs into frame 0's pen, no hit on the seam | S8, O5 | the last 0.3-0.5 s | 0 |

### 3b. By emotion

| The beat feels | Its sync | From |
|---|---|---|
| quick, playful, a process | dry, short, bright hits (~1-1.2 kHz, 40 ms), a quick count (30-36 f), loud over silence, climbing in pitch | reel 01 |
| calm, wonder, awe | soft low hits (~400-500 Hz, 0.1-0.2 s tails), a slow count (60-76 f) that slows a little, the biggest word on the lowest hit, a long hold, then the drop | reel 02 |
| tension, the problem | take sound away: the pulse stops, a floor, no hits; the picture leans forward | reel 02-4; `docs/sound_plan.md` §7.6 |
| relief, delight, the payoff | the release, with the thread's sound or one positive phone-like sound | reel 01-4, 01-5 |
| gravity, loss | very few hits, low and soft; the voice alone; never a playful sound on a serious beat | `craft.md` B3 (OURS) |
| a joke's button | one small dry sound in the gap after the button word, or nothing | OURS (EST) |

### 3c. Density

- **The reels:** 4-5 hard sync points in the first 2.0-4.4 s (0.9-2.0 a second), then 0-1 in the next 7.5-9.2 s.
- **Our budget** (EST, from the reels and video 3): the first 10 s, 4-5 hard sync points, all inside the hook's ~2.5 s;
  the middle, <= 1 per 10 s (one list's count, once a film, aside); the payoff, 1-2. A 40 s film carries ~8-12 hard sync
  points (0.2-0.3 a second), plus at most one soft sound per join and the bed's 3-5 section steps. Every one-shot cue,
  sync or texture, stays under ~0.5 a second over the film (v1's own "one every 2-3 s", `docs/sound_plan.md` §7.2: never
  enforced; video 3 placed 0.44 a second, video 2 1.43, video 1 3.1).
- **Spacing:** separate hard syncs >= 0.5 s (30 f) apart, a count's steps included; nothing but the carrier in the 0.4 s
  round a join's midpoint (the picture's own rule, `CRAFT.md` §b: nothing enters or turns there).
- **Where to rest:** at least one stretch of 6-10 s (360-600 f) in the middle with no hard sync point; the hold before
  the release is the film's quietest moment.

### 3d. Never sync

- **Every move, every word, every caption** (mickey-mousing; captions pop silent).
- **Continuous motion:** drifts, floats, sways, idle life, a camera move's start or end, a cruise. **Background life**
  (tier C: birds, boats, passers-by), unless it IS the beat's subject.
- **The music's own beats** where nothing in the story changes; never move a cut off its word to catch a beat (Murch:
  rhythm ranks under emotion and story, `craft.md` [C26]).
- **Onto a word:** no effect transient in the first 12 ms after a word's onset, no whoosh cresting on a word (v2's
  `audio/v2r/premix.py` guards; the voice wins).
- **Two sounds on one change** (they read as two events), **one sound on two changes**, and **what the music already
  does** (`docs/sound_plan.md` §7.6).

---

## 4. In the pipeline

Sync in the reels is STRUCTURE (a count, a hold, a release): story timing, so it is decided with the script and the
sketch, not at the mix.

| Gate | Decides / does | Writes | Checked by |
|---|---|---|---|
| **G1** script | the SYNC PLAN, as text (<= 8 lines): the hook's count (which 3 changes, on which phrase starts), the trigger, the late fourth (the hook's longest gap), the release (the payoff line, its written pause >= 0.8 s marked), the thread's sound, at most 2 middle moments (a list, a phone action, the turn's music change); the owner approves it with the script and the card | a "Sync plan" section in the through-line card (`docs/vN/THROUGHLINE.md`) | the critic: is each point a story event of the tier-A subject? |
| **G2** voice | the take is the clock: the release's pause measured (>= 0.8 s, else that one gap lengthened before the lock), the plan's stressed words marked by ear, every point timed (word, s, f); placeholder sounds made (`audio/tools/make_phone_sfx.py`, the thread's sound, a hit set) | the plan's times, in the same section | the gaps on `public/vN/voice_words.json` |
| **G3** animatic | the board's `sfx` plays every planned point with its placeholder; the count, the hold and the release freeze with the story (`docs/G3_ANIMATIC.md` §2) | `public/vN/animatic.json` `sfx`, each cue with a `type` (this page's code) and its `event` (proposed fields) | the sync check list below; the sound-on read at 1x, on a phone's own speaker |
| **G4** look clip | frame 0's pen over air, and its join's sound | — | the owner, with the clip |
| **G5** blocking | G3's cues carried into `<Film sfx>` and re-keyed to the built picture's bold stage (a fill comes after its outline) | the film's `sfx` | the entry diff compares cues too (type, frame); the sync check on the render |
| **G6** polish | no new sound; an easing change can move a hit frame | — | the sync check |
| **G7** sound | final sounds for G3's plan (sized and coloured like their gestures), the bed's arrangement steps, the mix (the voice on top, every sync point heard); it may remove a cue, never add a sync point or move the picture | the mix | the sync check; one listen on a phone's own speaker |
| **G8** final | — | the master | `scripts/qa/av_lag.py`; the sync check on the master |

**The sync check list** (G3, then G5-G8). (S) = scripted, (E) = eyes and ears.
1. (S) Every cue has a `type` from this page and names its event.
2. (S) Every hard sync sits in its window (§1c.5) against its event's first VISIBLE frame, found on the render, never
   read from the clock.
3. (S) Every hard sync is heard: in a voice gap with >= 80 ms clear, or the loudest thing in its band for 80 ms.
4. (S) The spend: the hook holds 4-5 hard sync points; the middle <= 1 per 10 s; exactly one release, in a pause
   >= 0.8 s; hits >= 30 f apart; one-shot cues under ~0.5 a second over the film.
5. (S) Nothing on tier-C life or on continuous motion; nothing but the carrier from 0.20 s before to 0.12 s after a
   join's midpoint.
6. (E) The count reads as three, then a late fourth; the hold is the quietest moment; the release is felt.
7. (E) Sound on: at each hit the eye is on the beat's subject. Sound off: every shot still reads (DIRECTION rule 1).
8. (E) One watch on a phone's own speaker; never judge sync over Bluetooth or from a screen recording.

Items 1-5 are a tool to build (`scripts/qa/sync_check.py`, proposed in `audit.md` §6, change 8); until it exists the
director answers them from the cue list and the frame-stepped render.

### 4b. What our audit says to fix first (video 2, measured: `sound_sync/audit.md`)

1. **Retire the 2-frame early lead for effects** (`audio/v2r/sheet.py` `lead()`, `LEAD_FRAMES = 2`): 17 of 56 cues sit
   exactly 2 f before their picture by design, a misreading of "the picture may lead the voice". Effects land at 0 to
   +2 f; only the PICTURE leads its WORD.
2. **Key every cue to what is seen, not to the clock:** the hook's nine ghost ticks come 8-10 f (133-167 ms) before the
   fills the eye sees (past ITU's 90 ms acceptability); the notebook's clap 5 f before the book shuts.
3. **Write the release into the script:** the payoff's bed step is +17.8 dB in the bed and +0.7 dB in the master, under
   "facts"; the 0.36 s held breath before it is real, but two words early.
4. **Spend, then rest:** 0.9-1.6 cues a second in every shot after the hook, to the last frame; aim at the reels'
   shape (~20 cues in 40 s, not 56).
5. **Heard or cut:** 11 of 56 cues are buried more than 10 dB and 21 are marginal; 42 of 56 land under speech (the TOLD
   THE BBC board, the tree wipe's carrier, the payoff's lamp run).
6. **No sound on background life:** the birds' wings masked the second and third ticks of the hook's count.
7. **Name and check:** a `type` per cue, the sync check, one listen on a phone speaker (video 2 went out unheard).

**Keep** (it works, measured): one source for the sound timeline (`audio/v2r/sheet.py`; worth promoting to house
tooling); one soft sound per fast join, cresting on its midpoint; the thread's sound; the quiet floors (the air-only
hook, the dip before "for life", the pause that holds the match click: one click at 12.983 s, f779, heard +23 dB, our
best moment); the voice's guards (hit words >= 6 dB over everything, effects >= 8 dB under the voice).

**Open, for an ITERATION** (the owner judges; `craft.md` C4): the hook's count under its first line, with and without
its hits; one hit at -2, 0, +2 and +4 f on a phone speaker; a join with and without a soft whoosh; the arrangement step
in a written 0.8 s pause.

---

## 5. Coverage: every moment of the owner's reels

| Moment | What it is | Here | Verdict |
|---|---|---|---|
| 01-0, 0.000-0.267 s (f0-f15) | the mug held on a near-silent floor | S1 | USED |
| 01-1, 0.267 s (f16) | a knock and a hard cut: milk to crema | S2 | USED (ours mostly a swap inside a shot, or a match) |
| 01-1b, 0.86 and 0.95 s (f52, f57) | two faint ticks, no picture | §1a, never sync | USED (texture stays texture, far under the hits) |
| 01-2, 0.800 s (f48) | a knock and a cut: crema to foam; the pulse is set (32 f) | S3 | ADAPTED (under a voice: hits in its gaps, or the voice's stresses) |
| 01-3, 1.333 s (f80) | a knock and a cut: foam to ice; third on the pulse | S3 | ADAPTED (as 01-2) |
| 01-4, 1.967 s (f118) | the click and the wide reveal, 6 f past the pulse | S4, S5 | USED (the late fourth); ADAPTED (the click is our first-second phone sound, from our own set) |
| 01-4 to 01-5, 29 f | the click, then the song | S6 | USED |
| 01-5, 2.449 s (f147) | the song enters, +26 dB | S7 | ADAPTED (an arrangement step in a written pause; no level step under speech) |
| 01-6, 2.45-9.52 s (f147-f571) | one held frame for 7.6 s, nothing synced | S8 | ADAPTED (our rest is the middle; the world keeps its silent life) |
| 01, not synced | the song's beats, the ice, the click's twin, the still player card | §3d | USED (never-sync rules) |
| 02-0, before f0 | "The" on at f0, its hit unrecorded | S9 | ADAPTED (our frame 0 is the pen drawing the subject; the first word is the voice's) |
| 02-0b, 0.000-0.750 s | a quiet bed; the field drifts, unsounded | S1, §3d | USED |
| 02-1, 0.750 s (f45) | "Art" pops on a soft low hit | S9 | ADAPTED (words that are not captions, in voice gaps) |
| 02-2, 1.883 s (f113) | "of" pops; the pulse is ~1.1-1.2 s | S9, S3 | ADAPTED (the slow count is for a calm beat, not the hook: ours turns at ~2 s) |
| 02-3, 3.150 s (f189) | "NOTICING", the biggest word, on the lowest, loudest hit | S9 | USED (the biggest change gets the biggest sound) |
| 02-4, 3.15-4.38 s (f189-f263) | the hold: the quietest point while the picture speeds up 4x | S10 | USED |
| 02-5, 4.383 s (f263) | the drop-cut: the biggest picture change and +32 dB on one frame | S7 | ADAPTED (in a written pause, by arrangement) |
| 02-5b, 6.35 s (f381) | a handheld turn near an accent (chance) | §3d | REJECTED as sync (no sound on motion inside a shot; we have no handheld) |
| 02-6, 7.617 s (f457) | a cut 26 f before a chord change | S11 | USED (joins follow the voice; the bed runs across) |
| 02-7, 9.450 s (f567) | the punch-in, on an 8th (chance) | S12 | ADAPTED, RARE (the turn's one plain cut) |
| 02-8, 11.383 s (f683) | a cut on the chord change | S13 | ADAPTED (the bed written to change on a join; <= 2) |
| 02-9, 11.38-13.6 s (f683-f816) | rest: a slow pan with a push-in | S8 | USED |
| 02, not synced | the 8th-note pulse, the 8.05 s chord change, the sway, the title's exit; no whoosh or riser | §3d, X3, X4 | USED (never-sync rules) |
| Both: the shape | count-in, late fourth or hold, release, rest; all hard sync in 2.0-4.4 s | §2 core, §3a | ADAPTED (the hook's count and turn; the middle at rest; ONE release, at the payoff) |
| Both: the capture | a phone screen recording over Bluetooth moved the sound by 168 ms | §1c.7 | USED (judge the file, then a phone's own speaker) |

---

## Sources

The full evidence, with every tag, is in `sound_sync/reels.md` §5, `craft.md` Sources and `audit.md` §8. Page fetches
are blocked from this sandbox (ENOTFOUND), so these were read through search-result summaries; this distill re-checked
four of them that way on 2026-10-30 (ITU-R BT.1359's numbers; the tone-before-target null in Vroomen and de Gelder;
pip and pop needing a synchronous, transient change; Miller et al.'s on-beat saccades), and corrected one reading:
Miller et al. measured how fast the eyes reached an on-beat dot, not detection.

- ITU-R BT.1359-1 (1998), relative timing of sound and vision: detection about 45 ms early / 125 ms late,
  acceptability about 90 / 185 ms, averages of subjective tests, not hard limits.
  https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1359-1-199811-I!!PDF-E.pdf ;
  https://www.tvtechnology.com/opinions/av-synchronization-how-bad-is-bad ;
  https://en.wikipedia.org/wiki/Audio-to-video_synchronization
- M. Chion, *Audio-Vision* (1994): synchresis, synch points. https://www.filmsound.org/chion/sync.htm ;
  https://sonicfield.org/wiki/synchresis
- E. Van der Burg, C. N. L. Olivers, A. W. Bronkhorst, J. Theeuwes (2008), "Pip and pop", *JEP:HPP* 34:1053-1065 (a
  synchronous tone makes a changing target pop out; the change must be synchronous and transient: the 2012 follow-up).
  https://pmc.ncbi.nlm.nih.gov/articles/PMC3393717
- J. Vroomen, B. de Gelder (2000), "Sound enhances visual perception", *JEP:HPP* 26(5):1583-1590 (a tone synchronous
  with the target helps; a tone before it does not). https://core.ac.uk/download/284983758.pdf ;
  https://research.tilburguniversity.edu/en/publications/sound-enhances-visual-perception-cross-modal-effects-of-auditory-/
- J. E. Miller, L. A. Carlson, J. D. McAuley (2013), "When what you hear influences when you see", *Psychological
  Science* 24(1):11-18 (faster saccades to an on-beat dot, even after the rhythm stops; none after an irregular one).
  https://pmc.ncbi.nlm.nih.gov/articles/PMC3650712 ;
  https://swov.nl/en/publicatie/when-what-you-hear-influences-when-you-see-listening-auditory-rhythm-influences-temporal
- D. Huron (2006), *Sweet Anticipation*. https://leonardo.info/reviews_archive/july2007/sweet_zilberg.html
- T. J. Smith, J. Y. Martin-Portugues Santacreu (2017), sound hides match-action cuts. https://eprints.bbk.ac.uk/14904/
- A. Davis, M. Agrawala (2018), visual rhythm and beat. https://openaccess.thecvf.com/content_cvpr_2018_workshops/papers/w49/Davis_Visual_Rhythm_and_CVPR_2018_paper.pdf
- Mickey-mousing. https://en.wikipedia.org/wiki/Mickey_Mousing
- W. Murch, the Rule of Six. https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch
- Music-video cutting, 329 clips (arXiv 2108.00970). https://arxiv.org/pdf/2108.00970
- Material Design sound guidelines (2019). https://m2.material.io/design/sound/applying-sound-to-ui.html
- R. T. Solberg (2014), the drop. https://core.ac.uk/download/225893003.pdf
- Bluetooth latency and the player's video delay. https://stephencoyle.net/latency/ ; https://pxlnv.com/linklog/airpods-latency/
- Ours: `sound_sync/reels.md` (the reels, measured), `sound_sync/audit.md` (video 2's 56 cues, measured), `craft.md`
  (the research), `docs/motion_spec.md` §7 (reference 1's picture-to-word offsets).
