# Sound sync: the craft, researched (2026-10-30)

The owner, verbatim (2026-10-30, with two phone screen recordings): "And then the next piece after that is the research
distill and practice of syncing the video and shots with with sounds so look here / We already do this and I think
decently okay we just need to be more intentional and educated about this effect and where it make sense to use". The
same day, on the composition study: "I didn’t get once again why you ignored all my references and came up with yours?"

**What this is.** The craft lane of the sound-sync research: audio-visual sync from perception to practice. Why a sound
and a picture weld into one event (B1), how close they must be in seconds and frames (B2), hit points and when they
cheapen (B3), cutting to music (B4), J- and L-cuts (B5), motion-graphics sound and how an ease lands on a hit (B6),
music under a voice (B7), short-form trends and what the data says (B8), and one table of where sync helps and where it
hurts (B9). Part C squares it with our own docs.

**The owner's two reels are the spine** (Part A): every sync moment in them is named and measured first, in their
order, and each section of Part B starts from the reel moment it explains. Part B is OUR research, an addition labelled
as ours. The sibling lanes measure the reels in full (`reels.md`) and audit our films; their numbers win on those.

**Rank.** Research notes, the lowest rank on DIRECTION's ladder: nothing here is a rule until the sound-sync distill
integrates it into the docs that own each topic (Part C names them). Methods only: no footage or audio copied, no
creator named.

**Conventions.** Times in seconds AND frames at 60 fps (1 f = 16.7 ms; 0.1 s = 6 f; 0.5 s = 30 f; 1 s = 60 f).
Offsets always say which way: "sound 2 f late" means the sound comes 2 frames AFTER its picture (the picture leads).
Evidence tags: **MEASURED** (ours, on the reels), **STANDARD** (ITU, EBU, ATSC), **STUDY** (peer-reviewed), **BOOK**
(Chion, Murch, Huron, Eisenstein), **PRACTICE** (editors' and sound designers' consensus in trade and tutorial
sources), **VENDOR** (a seller's page: weakest), **PLATFORM** (a platform's own marketing data: self-interested, method
rarely shown), **EST** (our estimate). Sources [C1]-[C55] are listed at the end with URLs. Page fetches were blocked
from this sandbox (ENOTFOUND), so the sources were read through search-result summaries (see Sources); where a number
rests on a single summary, the text says "(summary)".

---

## Part A. The owner's two reels, measured (the spine)

### A0. How they were measured, and one trap

- **Audio:** spectral flux at 10 ms and 5 ms hops in three bands (low < 250 Hz, mid, high > 4 kHz), plus each onset's
  waveform attack (the first 2 ms block above 4x the floor before it), its spectral centroid and its decay.
  **Picture:** the content band of the 540 x 1174 recording (y 384-678), mean absolute difference per frame, Farneback
  optical flow (zoom and pan) and, for reel 02's title, a count of yellow pixels. Both recordings run at 60 fps.
  Scripts and raw output: `/tmp/sync/craft/analyze.py`, `analyze_out.txt`, `anchor_notes.md` (scratch).
- **The trap: a screen recording shifts sound against picture.** In reel 01, picture minus sound at its four hard
  events is 0.165, 0.178, 0.169 and 0.169 s: a spread of 13 ms (under 1 f), so a CONSTANT offset of ~0.17 s (10 f), a
  capture artefact and not the editor's choice (an editor who put every sound 10 f early would be far outside every
  sync window in B2). The phone's control centre at the end of reel 01 shows a headphone glyph: over Bluetooth earbuds
  the player delays the picture to match the earbuds' latency (~0.1-0.2 s [C40]) while the recorder takes the sound
  before it. Corrected by that constant, **reel 01's hits are frame-exact**. Reel 02 gives 0.052, 0.075, 0.148 and
  0.121 s (spread 0.1 s, 6 f) and its source runs at ~30 fps (each picture held 2 frames), so its offset cannot be
  pinned: **its events sit within ~0.1 s (6 f) of their sounds** whichever offset is right.
- **Lesson (ours):** never judge sync from a screen recording or over Bluetooth earbuds. Judge a render on the file
  (`scripts/qa/av_lag.py`, the gate check's A/V sync) and once on the phone's own speaker.

### A1. Reel 01 (10.1 s, no voice): a mug seen from above, three knocks, a click, then a song

Picture and sound times are corrected for the 0.17 s capture offset (MEASURED).

| # | Our name | Picture (s, f) | Sound | Offset | What it does |
|---|---|---|---|---|---|
| 01-1 | hit-cut 1 | 0.267 s, f16: hard cut, a cup of milk becomes espresso crema (same cup, same framing) | a dry knock: peak ~0 dBFS, centroid ~1.0 kHz, down 20 dB in 40 ms | 0 f | the first change of the film lands with a sound: the weld (B1) |
| 01-2 | hit-cut 2 | 0.800 s, f48: cut, the crema becomes foam | the same knock (1.1 kHz) | 0 f | the pulse is set: 32 f (0.533 s) after the first |
| 01-3 | hit-cut 3 | 1.333 s, f80: cut, ice in the coffee | the same knock (1.2 kHz) | 0 f | third on the pulse: the ear now expects a fourth at f112 |
| 01-4 | the reveal and the click | 1.967 s, f118: cut wide, the mug with earbuds, their cable and a small music-player overlay | two high ticks (8.3-8.5 kHz, 20 ms each) 84 ms (5 f) apart: a button click | 0 f | the fourth beat comes 6 f LATER than the pulse predicts; an interface sound is the trigger |
| 01-5 | the release | no picture change: the wide shot holds | the song enters at 2.45 s, f147 (a low-band onset); the level steps from -44 to -21 dBFS RMS (+23 dB) | 29 f after the click | cause, then effect: pressed, then playing |
| 01-6 | the rest | 2.45-10.1 s: ONE held shot (7.6 s); only the ice drifts | the song (onsets at ~3.0, 4.35, 5.7, 8.5 s) | no cuts | the music carries; the picture stops asking for attention |

Between the knocks the sound is near silent (-44 dBFS RMS). Three hits on an even pulse of 0.533 s (112.5 BPM), a
slightly late fourth, then the music.

### A2. Reel 02 (13.6 s, no voice): a title over a sunlit field, three soft hits, a drop, a montage

Recording times (offset unknown, 0.05-0.17 s; MEASURED).

| # | Our name | Picture (s, f) | Sound | What it does |
|---|---|---|---|---|
| 02-0 | the opening state | 0.000 s, f0: the first title word "The" already on, over a landscape that drifts slowly | a quiet bed, -33 dBFS RMS | frame 0 is never empty or still |
| 02-1 | word-on-hit 1 | 0.750 s, f45: "Art" pops | a soft low hit at 0.698 s: centroid ~510 Hz, peak -6.8 dBFS, long decay | the word and the hit are one event |
| 02-2 | word-on-hit 2 | 1.883 s, f113: "of" pops | a hit at 1.808 s: 530 Hz, -6.1 dBFS, down 20 dB in 0.38 s | the pulse is set: ~1.1-1.2 s |
| 02-3 | word-on-hit 3 | 3.150 s, f189: "NOTICING" pops, the biggest word | a hit at 3.002 s: 390 Hz, -5.3 dBFS, the lowest and loudest of the three | the biggest word gets the biggest hit |
| 02-4 | the hold | 3.15-4.38 s: nothing new for 1.23 s (74 f) | the bed only | the longest gap: the held breath before the drop |
| 02-5 | the drop | 4.383 s, f263: hard cut to a low-angle shot of wildflowers against the sky | the strongest onset of the reel at 4.262 s, low band (centroid 343 Hz); the level steps -33 to -12 dBFS RMS (+21 dB), settling at -16 | the release: picture and music change at once |
| 02-6 | cut with the flow | 7.617 s, f457: one sunflower, medium, centred on blue sky | an accent ~7.46 s | a new subject, 3.23 s after the drop |
| 02-7 | the punch-in | 9.450 s, f567: the same sunflower, close | an accent ~9.38 s | same subject, bigger: a cut that changes size, not subject |
| 02-8 | cut with the flow | 11.383 s, f683: a butterfly on cornflowers | an accent ~11.30 s | the last new subject |

The gaps between the title hits lengthen slightly, 1.11, 1.19 and 1.26 s (67, 72, 76 f), into the drop. After the
drop the music runs an 8th-note pulse of ~0.21 s (quarter ~142 BPM) and the cuts come 3.23, 1.83 and 1.93 s apart
(194, 110, 116 f). Each cut sits within ±55 ms of an accent once the offset is corrected, but with an accent every
0.21 s, chance alone gives a mean miss of ~54 ms: these are **cuts with the music's flow, not proven hit points**.
Inside the shots the flowers sway and the camera drifts sideways (flow ~0.5 px/f at 270 px wide).

### A3. The shape both reels share, and the devices it names

Both reels make ONE shape: a **count-in** of three hits, each married to one discrete picture change, over a quiet
floor; a **hold**; a **release** where a picture change and the full music land together (+21-23 dB); then **rest**,
where the music carries and the picture slows down (01: one held shot for 7.6 s; 02: a cut every ~2-3 s with the flow,
none forced onto a beat). The release comes at 1.97 s (01; the song itself at 2.45 s) and at 4.38 s (02): **all the
hard sync is spent in the first 2-5 s, and almost none after.** That is the owner's "where it makes sense", measured.

The devices it names (our names, used through the rest of this doc):

| Device | Where in the reels | What it is |
|---|---|---|
| **R1 the hit-cut** | 01-1, 01-2, 01-3, 02-5 | one sound transient on the first frame of a hard cut, 0 f apart |
| **R2 the count-in** | 01-1..3 (32 f apart), 02-1..3 (67-76 f apart) | three hits on an even pulse: the ear predicts the next, the picture keeps the promise |
| **R3 the late fourth** | 01-4 (6 f past the pulse), 02-4 (the longest gap) | the payoff arrives just after the expected moment: a held breath |
| **R4 the interface click** | 01-4 | a tiny high click (two ticks 5 f apart) on a player's reveal: a phone sound as the trigger |
| **R5 cause, then effect** | 01-4 to 01-5 | the click, then 0.48 s (29 f) later the song it started |
| **R6 the word-on-hit** | 02-1..3 | words appear one at a time, each on a soft low hit; the biggest word gets the lowest, loudest hit |
| **R7 the quiet floor** | 01 between knocks (-44 dBFS), 02 before the drop (-33 dBFS) | near silence makes small hits read big and the release huge |
| **R8 the release (the drop)** | 01-4/5, 02-5 | a picture change and the full music at once, +21-23 dB |
| **R9 the rest** | 01-6, 02-6..8 | after the release the music carries; the picture holds or cuts with the flow, not on every accent |
| **R10 the punch-in** | 02-7 | the same subject, closer, on an accent |

What the reels do NOT do (MEASURED, as telling as what they do): no whooshes, no risers, no sound on in-shot motion
(the ice, the swaying flowers), no hit after the release that is not also a cut, no voice, no captions.

---

## Part B. The craft, researched (OURS: an addition to the reels, never above them)

Each section opens with the reel moment it explains (Part A's numbers), then the research, then **helps / hurts / the
numbers**. "For us" lines are our estimates (EST) or proposals for the distill, never rules yet.

### B1. Why a sound and a picture weld into one event (synchresis and added value)

**From the reels.** 01-1..3: a dry knock on each cut, though nothing in the shot knocks; the cup changes and the knock
IS that change. 02-1..3: a soft low hit as each word pops; nothing in a sunlit field makes that sound either. Neither
reel uses a realistic sound: what binds sound to picture is the shared moment, not the source.

**The research.**
- **Synchresis** (BOOK, Chion [C1]): "the spontaneous and irresistible weld produced between a particular auditory
  phenomenon and visual phenomenon when they occur at the same time". It needs no logic: any sound at the moment of
  any change is heard as that change's sound. **Added value** [C1]: the expressive value a sound adds to an image,
  felt as if it came from the image itself (the viewer credits the picture). **Synch points** [C2]: salient moments
  where a sound and a picture event meet; they act as the punctuation of "audiovisual phrasing" (anticipation, then
  release). **Vectorization** [C2]: sound gives an image a direction in time (an approaching engine, a riser): a still
  picture with a rising sound feels like it is about to happen.
- **The weld changes what is seen** (STUDY): two discs that cross are seen to BOUNCE when a click sounds at their
  meeting, and still with the click 150 ms (9 f) late (Sekuler, Sekuler & Lau 1997 [C3]). One flash with two quick
  beeps is seen as two flashes (Shams, Kamitani & Shimojo 2000 [C7]). A sound pulls WHEN a light seems to happen toward
  itself ("temporal ventriloquism", Morein-Zamir, Soto-Faraco & Kingstone 2003 [C6]).
- **The weld steers the eye** (STUDY): in a cluttered display, a short tone synchronous with one target's colour change
  makes that target pop out and cuts search time drastically, automatically ("pip and pop", Van der Burg et al. 2008
  [C4]); the effect is largest at true synchrony and weakens as the gap grows. An abrupt tone improves seeing a
  synchronous flash, the effect is gone when the tone LEADS the flash, and much reduced when the tone is less abrupt or
  part of a melody (Vroomen & de Gelder 2000 [C5]).
- **The weld can hide or show a cut** (STUDY): viewers missed far more match-action cuts with the soundtrack on than
  off (Smith & Martin-Portugues Santacreu 2017 [C8]): continuous sound across a cut hides it; a hit ON the cut
  announces it.
- **Simple pictures show sync errors most** (STUDY, Lipscomb 1994-2005 [C9]): aligned versus shifted accents changed
  viewers' ratings most for simple animated stimuli and less for complex film scenes; the music shaped the result
  either way. Congruent structure in sound and picture directs attention to the congruent visual (Cohen's
  congruence-association model [C10]).
- **A pulse readies the eye** (STUDY): after a regular auditory rhythm, visual targets that arrive ON the beat are
  detected better, and the effect outlasts the rhythm briefly; an irregular sequence gives no benefit (Miller, Carlson
  & McAuley 2013 [C11]; also Escoffier, Sheng & Schirmer 2010 [C12], whose metrical reading was later challenged).
  This is why a count-in (R2) works: three even hits make the eye ready for the fourth.

**Helps** when one salient change happens at a time, the sound has a sharp attack, and it lands with the picture
(B2's window), on the change the story needs seen. **Hurts** when (a) it lands on something the story does not need:
the pip-and-pop pulls the eye there anyway, so a hit on a background mover is a promotion by sound; (b) two sounds
fall on one change (they can read as two events); (c) it lands on a cut meant to be invisible; (d) the sound is soft,
slow or melodic where a moment must be marked (the freezing effect fades).
**The numbers:** the bounce survives a 150 ms (9 f) late click; the pop-out and the freezing effects peak at 0 ms and
need the sound not to lead.

**For us (EST).** A sound is a pointer: wherever it lands, the eye goes. So a sync hit belongs to the beat's tier-A
subject (DIRECTION rule 2), one per change, and the cheapest way to make a dense, alive frame (rule 3) read at phone
size is to give the subject's change a sound and the world none. Our drawn, simple animation is the case Lipscomb
found most sensitive to timing errors: our sync must be tighter than live-action folklore suggests.

### B2. The sync window: how close, in seconds and frames

**From the reels.** Reel 01's knocks, click and reveal are frame-exact once the recording's constant 0.17 s (10 f) shift
is removed (A0). Reel 02's word hits sit within ~0.1 s (6 f) of their words; its source runs at ~30 fps and its hits are
soft (centroid 390-530 Hz, ~0.38 s, 23 f, to fall 20 dB). **The sharper the sound, the tighter the reel's sync.**

**The research: thresholds** ("early" = the sound comes before its picture; ITU writes it as positive).

| Source | Sound EARLY: detected / acceptable | Sound LATE: detected / acceptable | Kind |
|---|---|---|---|
| ITU-R BT.1359-1 (1998) [C13] | 45 ms (2.7 f) / 90 ms (5.4 f) | 125 ms (7.5 f) / 185 ms (11.1 f) | STANDARD (broadcast, end to end) |
| EBU R37 (2007) [C14] | tolerance 40 ms (2.4 f) | tolerance 60 ms (3.6 f) | STANDARD (end to end) |
| ATSC IS-191 (2003) [C15] | 15 ms (0.9 f) at the encoder | 45 ms (2.7 f) at the encoder | STANDARD (one stage of a chain) |
| Dixon & Spitz 1980, a hammer on a nail [C16] | 75 ms (4.5 f) | 188 ms (11.3 f) | STUDY (detection) |
| Dixon & Spitz 1980, speech [C16] | 131 ms (7.9 f) | 258 ms (15.5 f) | STUDY (detection) |
| van Wassenhove, Grant & Poeppel 2007, speech fusion [C17] | 30 ms (1.8 f) | 170 ms (10.2 f) | STUDY (a ~200 ms window) |
| van Eijk et al. 2008, simultaneity range [C18] | ~50 ms (3 f) | ~150 ms (9 f) | STUDY (summary) |

Three things hold across all of them. **The window is lopsided**: a late sound is tolerated two to three times
longer than an early one. **Sharp events are judged more strictly** than smooth ones (the hammer's 75/188 ms against
speech's 131/258 ms). **Broadcast budgets are tight** (EBU's 40/60 ms) because every stage of a chain adds error;
a creative choice has to sit well inside the window, not at its edge.

**Why the picture may lead by a frame or two** (the "a frame early feels tighter" habit):
- **Physics** (and STUDY [C16], [C19]): sound travels at ~343 m/s, so it arrives 2.9 ms per metre after the light: 1 f
  (16.7 ms) is the delay at 5.7 m, 2 f at 11.4 m. A lifetime of hearing things after seeing them is why "people learn to
  tolerate the slower transmission of sound" (Dixon & Spitz [C16]); no event in nature sends its sound first.
- **The nervous system** (STUDY [C19]): the ear's signal reaches the brain sooner than the eye's (roughly 10 ms
  against 50 ms in the usual estimates), so a sound and a picture shown together are processed sound-first; a picture
  1-2 f ahead lands closer to "together" inside the head. (At ~10-15 m the travel delay and the processing gap cancel,
  the "horizon of simultaneity"; a 2024 study found mixed evidence for it [C19].) One editing vendor explains the
  frame-early cut with "vision is processed faster" [C28]: the literature says the reverse.
- **Two different binding mechanisms** (STUDY [C20]): the window for sound-leading pairs is narrow and does not change
  with training; the window for picture-leading pairs is wider and trainable (Cecere, Gross & Thut 2016; training can
  narrow a window by ~40 %, Powers, Hillock & Wallace 2009).
- **Practice**: animators open the mouth 1-2 frames before the sound at 24 fps (42-83 ms, 2.5-5 f at 60 fps; "a late
  mouth reads out of sync") [C21]; editors cut "a frame or two" before the beat, one tutorial says 2-4 f, all unsourced
  [C28]; our own v1 measurement of reference 1 found its visuals leading the voice by ~3 f at 30 fps (illustration
  elements ~100 ms = 6 f at 60 fps, caption pages ~40 ms = 2.4 f; character beats on the word, -5 ms)
  (`docs/motion_spec.md` §7, MEASURED).

**And the opposite risk, the delivery chain** (A0, MEASURED; [C40]): Bluetooth earbuds delay the sound ~0.1-0.2 s (6-12
f); Apple's players delay the picture to match, other players may not, and a screen recording can take the sound before
that delay (reel 01's recording put it 0.17 s, 10 f, early). Whatever we build, the viewer's chain can only shift it; a
hit built 0 f to +1 f late keeps the most margin both ways.

**Helps:** a hard transient on a hard picture event at 0 f to +2 f (sound on or just after the first changed frame).
**Hurts:** a sound EARLY by 3 f (50 ms) or more on a sharp event (past ITU's 45 ms detection threshold and the
speech-fusion study's 30 ms, on the narrow, fixed side; only the 1980 hammer study tolerates 75 ms); a sound LATE by
8 f (125 ms) or more on a sharp event (ITU's detection threshold); a soft sound placed by its file start when its peak
comes later (a whoosh with 0.2 s of air before it lands 12 f late).
**The numbers (EST, from the table and the reels; minus = the sound early, plus = the sound late):**

| Pair | Target | Tolerance |
|---|---|---|
| a sharp sound (attack < 10 ms: knock, click, pop, tick) on a hard picture event (cut, pop, contact) | 0 f | -1 f to +2 f (-17 to +33 ms) |
| a soft sound (attack >= 30 ms, long decay: a low hit, a swell's crest) on a picture event | 0 f | -3 f to +6 f (-50 to +100 ms) |
| a picture on its WORD (the voice) | the picture 0.1 s (6 f) first (DIRECTION rule 8) | 0 to 0.3 s (0-18 f) first (`composition/motion.md` §4.4) |
| a sound file's reference point | its TRANSIENT (or a whoosh's or riser's PEAK), never the file's first sample [C34] | |

At 60 fps one frame (16.7 ms) is under every threshold in the table, so a 1 f error is free and the rule is about never
drifting by 3 f or more. A picture leading its word by 0.1-0.3 s (6-18 f) is not lip sync (the picture is not the
voice's source): it is "the picture shows, the voice names", and it reads as anticipation, not as an error.

**How to check it** (ours): never judge sync from a screen recording or over Bluetooth earbuds (A0). Judge the render
file (`scripts/qa/av_lag.py`: the voice or the mix at 0 ms lag in every window) and watch once on the phone's own
speaker.

### B3. Hit points, and when sync cheapens (mickey-mousing)

**From the reels.** Every hit in both reels lands on a DISCRETE picture change: a cut (01-1..3, 02-5), a word
appearing (02-1..3), a reveal (01-4). Continuous motion gets no sound at all: the ice drifting for 7.6 s (01-6), the
flowers swaying and the camera drifting (02-6..8). The hits are spent early and then stop: reel 01 has 5 sync events
in its first 2.45 s (147 f; ~2 a second) and none in the next 7.6 s (456 f); reel 02 has 4 in its first 4.4 s (264 f;
~1 a second), then only cuts every 1.8-3.2 s (110-194 f).

**The research.**
- **Hit points** (PRACTICE, [C23]): film composers mark the frames where the music must land on a picture event.
  They are caught with **streamers** (a line crossing the screen for ~3-5 feet of film, 2-3.3 s, 120-200 f) that end in
  a **punch** (a flash on the hit frame), the Newman system from Fox's music department; strict-tempo cues use a click
  track instead. A streamer is a visual count-in for the conductor: the same job as the reels' R2 for the viewer.
- **Mickey-mousing** (BOOK and PRACTICE, [C22]): a score that copies every movement on screen, named after the
  cartoons that made it a style (Max Steiner carried it into 1930s-40s features). It became a pejorative for
  being "too simplistic for adults": Cocteau called it the crudest device, Eisler mocked the orchestra that barks with
  the barking dog. Eisenstein and Prokofiev's "vertical montage" asked for the opposite, sound as counterpoint that
  adds rather than mimics [C24], and Chion's added value is largest when the sound brings what the picture lacks [C1].
- **Interface sound** (PRACTICE, Google Material Design's first sound guidelines, 2019 [C36]): sound at strategic
  moments as feedback (it confirms that something happened) or decoration; "silence is as important as knowing when to
  apply sound"; limit how often decorative sounds play (fatigue); "hero sounds" for celebratory moments only.
- **Expectation** (BOOK, Huron, *Sweet Anticipation* [C25]): the ear predicts (tension, prediction, reaction); a hit
  the viewer can predict pays off when it lands (the reward of a confirmed prediction), and a surprise works because it
  is rare.

**Helps:** the event is discrete and countable (a cut, a word, a number, a click, a thing landing, the turn); the genre
allows it (cartoon, UI feedback, a list being counted); the hit is predictable (a pulse, a streamer, a count-in) or rare
enough to surprise. **Hurts:** sounding every move (fatigue; the film reads as a cartoon or a template); sounding a
serious beat with a playful sound; sounding continuous motion (drift, sway, idle life, a parallax float); sounding what
the music already does (our own v1 rule, `docs/sound_plan.md` §7.6). **The numbers:** the reels spend ~1-2 sync events a
second for 2.5-4.4 s (150-264 f) and then ~0; our v1 spotting rule is "one sound per idea, at most about one every 2-3
s" (`docs/sound_plan.md` §7.2: 120-180 f) and Material's is "limit decorative sounds" (no number).

**For us (EST).** An explainer sits between UI feedback and cinema: a sound CONFIRMS a story event (the number lands,
the switch flips, the thing breaks), it never narrates motion. The risk is real for us because in motion graphics
everything moves: a hit budget per film and a rule of "discrete events only, the subject's only" keep sync from
turning into mickey-mousing.

### B4. Cutting to music: on the beat, off it, on the downbeat, on the phrase

**From the reels.** Reel 01 cuts ON the beat because its hits ARE the beat (three knocks 32 f apart), then puts the
fourth change 6 f past the pulse (R3, the late fourth) and holds one shot for the whole song. Reel 02 cuts ON the drop
(the phrase's first downbeat, R8), then cuts with the music's flow, about every 1-2 bars (3.23, 1.83, 1.93 s = 194, 110,
116 f; a 4/4 bar at ~142 BPM is 1.69 s, 101 f), never on a fixed count and never on every accent. Neither reel cuts on
every beat.

**The research.**
- **What music videos do** (STUDY, 329 clips, arXiv 2108.00970 [C29]): in about two thirds the dominant shot length
  matches the BEAT, in about a fifth the BAR, and the 4-bar level almost never (2 videos). Cutting on the beat is the
  music-video norm, which is why it reads as "music video".
- **Practice** (editors' consensus [C27]): beats for actions, phrases (4 or 8 bars) for sections; the DOWNBEAT (beat
  1) for a reveal or a scene change; vary the density with the music's energy (every other downbeat in a verse, every
  snare in a chorus); cutting on every beat gets predictable fast, so contrast a fast run with a hold and try
  secondary beats for a syncopated feel; delay a cut just past the expected moment for tension (the reels' R3); lay the
  music first and mark its downbeats (Larry Jordan [C27]). Keep cuts on whole frames: being on a frame matters more
  than being on the beat's exact millisecond (Vegas docs [C28]).
- **Rhythm ranks third** (BOOK, Murch's Rule of Six [C26]): emotion 51 %, story 23 %, rhythm 10 %, eye-trace 7 %,
  the 2D plane 5 %, 3D space 4 %; give up the lower ones first. A cut never leaves its story moment to catch a beat.
- **Metric vs rhythmic montage** (BOOK, Eisenstein [C24]): cutting by a fixed count regardless of content (metric)
  against cut lengths set by the motion inside the frame (rhythmic).
- **Motion can be the beat** (STUDY, Davis & Agrawala 2018 [C30]): a sudden DECELERATION in the picture (a stop, a
  start, a turn) reads as a "visual beat"; retiming a video so its visual beats meet the music's beats makes ordinary
  motion look like dancing. Sync does not need a cut.

**Helps:** a montage, a count or a list, a scale run, the release; the downbeat for the turn or the reveal; a run of
on-beat cuts that ends in a hold. **Hurts:** a cut on every beat (the music-video look, and it fights a voice's
rhythm); moving a cut off its word to catch a beat (Murch); locking cuts to a beat the viewer cannot hear.
**The numbers:** 90-140 BPM is 0.43-0.67 s a beat (26-40 f) and a 4/4 bar of 1.7-2.7 s (103-160 f); at 100 BPM a beat
is 0.6 s (36 f) and a bar 2.4 s (144 f), so our shots (>= 3.5 s average, DIRECTION rule 1) run 1.5-2 bars, the "bar"
level, not the "beat" level. A cut 1-2 f before its beat is folklore (B2), harmless at 60 fps.

**For us (EST).** Our films are voice-led: the VOICE decides the cuts (each join's midpoint on the next sentence's
first word, DIRECTION rule 1) and the music bends to them, the film-scoring way, not the music-video way. Our v1
toolchain already does this (`scripts/qa/beatsync.py --fit-tempo`, `audio/tools/beatlock.py`: 10 of 11 cuts on beats
by bending the bed 90.9-103 BPM, at most 3.3 % a beat; `docs/sound_plan.md` "CURRENT STATE"). But with the bed a
median 27 dB under the voice in speech (v1, MEASURED) its beat is largely masked while the voice talks (EST), so a
lock is worth it only where the music is heard in the clear: the opening's count-in, the release or turn, a written
pause, and the close.

### B5. J- and L-cuts: sound that crosses a join

**From the reels.** Reel 01's release is SPLIT: the picture changes first (the wide reveal with its click, 1.967 s,
f118) and the quiet floor runs on under the new shot for 0.48 s (29 f) before the song enters (2.45 s, f147): the old
sound trails into the new picture, an L-cut, read as cause then effect (R5). Reel 02's release is a straight cut: the
picture and the music change on the same frame (02-5). After the release, reel 02's music runs on unbroken across its
three later cuts (02-6..8): the music itself is the bridge that smooths them, while reel 01 has no later join at all.

**The research** (PRACTICE, [C31]; our composition study's §4.4 read the same sources).
- **J-cut**: the next shot's sound starts BEFORE its picture (an "audio lead", a sound bridge); the ear arrives first
  and pulls the viewer forward (Chion's vectorization [C2]). **L-cut**: the last shot's sound runs ON under the next
  picture; the moment lingers, a reaction plays. No source gives a standard length: from a few frames to a few seconds.
- A sound that carries on across a cut hides the cut (STUDY [C8]); viewers' blinks cluster at natural breakpoints
  (the end of an action, a pause), which is where a cut goes unnoticed (STUDY, Nakano et al. 2009 [C32]).

**Helps:** smoothing a join (one continuous sound under it), pulling forward into the next place (J), letting a
payoff or a reaction land (L), cause then effect (the reel's click, then the song). **Hurts:** an ambience lead that
competes with the voice; long tails stacking under a busy moment; a lead so long that the sound arrives with nothing
to belong to (EST: past ~1 s, 60 f, it reads as a separate cue, not a bridge).
**The numbers:** the reel's L is 0.48 s (29 f). Our composition study proposes (MR20, EST) a place's ambience leading
its picture by 0.2-0.5 s (12-30 f) and trailing 0.3-1.0 s (18-60 f) under the next, ducked, one bridge per join; no
source contradicts it and none gives a number.

**For us.** Our voice runs across every join, so the dialogue J- and L-cut never arise; what does is (a) the picture
leading its word by ~0.1 s (DIRECTION rule 8: the picture-first overlap is our J-cut, reversed), (b) a place's
ambience as a J or L (MR20), and (c) the music's own J-cut: a swell or a riser heard before the picture it announces,
whose CREST lands on the change (B6). The reel's split release suggests a fourth: (d) the picture changes on its word
and the music follows into the next pause, so cause and effect are both heard.

### B6. Motion-graphics sound: whooshes, impacts, risers, UI ticks, stingers, the drop; and where an ease lands its hit

**From the reels.** What they use: dry knocks (centroid 1.0, 1.1, 1.2 kHz: the count RISES in pitch), soft low hits
whose size follows the word's (the biggest word, "NOTICING", gets the lowest and loudest: 390 Hz at -5.3 dBFS against
510-530 Hz at -6.8 and -6.1), one interface click (two 20 ms ticks at 8.3-8.5 kHz, 84 ms = 5 f apart: a press and a
release), a quiet floor (-44 and -33 dBFS RMS) and one release of +21-23 dB. What they do not use: whooshes, risers,
stingers, or any sound on motion inside a shot (A3).

**The research and the practice.**
- **Whoosh** (PRACTICE, vendor pages [C33]): its loudest point on the move's FASTEST frame; on a transition, the peak
  on the edit point or the first frame of the new shot; trim the air before it (a whoosh started by its file start
  peaks after the motion); a whoosh that outlasts its transition feels wrong; always compare with no whoosh.
- **Impact** ([C33], [C34]): the transient exactly on the CONTACT frame, with any whoosh into it starting before;
  align the transient, not the file start; the squash on the impact frame; hit the key pose. Hand-placed contact
  sounds drift (Cornell's inverse-Foley work measured it [C34]), so place them by frame, not by ear.
- **Riser** (PRACTICE [C35]): its CREST on the target frame (a downbeat, a reveal), its length counted back from the
  hit (trailers 4-8 s and more, 240-480 f; social cuts 1-2 s, 60-120 f); a riser that misses its downbeat makes the
  release limp; near-silence just before the hit makes it feel louder.
- **UI ticks** (PRACTICE, Material Design [C36]): feedback sounds are short and quiet and confirm an action; decorative
  ones are limited; "hero sounds" mark celebratory moments only.
- **Stingers and hero sounds**: a short musical accent (~1-3 s, 60-180 f) on a title or a payoff, once (our v1 rule:
  "story beats get the special sounds, once", `docs/sound_plan.md` §7.5).
- **The drop** (STUDY, Solberg 2014 [C45]): breakdown (bass and kick out), build-up (layers return, tension), drop
  (the peak); listeners put the strongest feeling at the drop. Later EEG work: tension climbs through the build-up, but
  more tension did not make the drop more pleasurable, so a longer riser does not buy a bigger payoff.
- **Stop-down and silence** (PRACTICE and BOOK, [C38], [C39]): trailers cut everything for a beat before a big hit (2-3
  stop-downs a trailer, at act ends); "dropping out for a beat makes the next impact feel enormous"; silence works as
  an instrument only with sound around it (Chion), and sound design starts from contrast (Rydstrom).
- **Explainer studios** (PRACTICE [C37]): Kurzgesagt's music and sound design come LATE, after the animation, from a
  separate studio; a vendor guide for explainers says to sound only the moments that matter, not every move.

**Where an ease lands its hit** (the craft core; STUDY for the principle, Davis & Agrawala [C30]: the picture's
"beat" is a sudden change of speed, a start or a stop; EST for the mapping onto our presets in `src/lib/spec.ts`):

| The move (our preset) | Where its visible event is | Where the sound goes |
|---|---|---|
| ease-OUT entrance: `MOTION.rise` (out-exp, ~50 % of the travel in the first frame), the caption ease `bez(0, 0.7, 0.12, 1)` | the FIRST frame (the start is the jolt; the settle has no edge) | the transient on the first moved frame |
| a pop from nothing: `MOTION.popFrom` (appears at 30 %, holds 2/30 s = 4 f, grows) | the appear frame | the transient on the appear frame; the sound's decay covers the growth |
| ease-IN into contact: a drop, a landing, a slam that accelerates, the un-build's collapse (`MOTION.unbuild`, all ease-in) | the LAST frame (the stop) | the transient on the contact frame; squash or overshoot on the frames after it |
| our stamp's "slam" today: `slamScale` (`src/scenes/shared/props/Labels.tsx`: ring 0.13 s, then 2.6x to 1x in 0.27 s on in-out cubic) | its speed peaks mid-move; it SETTLES onto the paper, with no hard contact frame | a thunk at its end lands on a settle; put it on the fastest frame, or (better, EST) give the slam an ease-in with a 1-2 f squash and hit that contact frame |
| ease-in-out move: `CAM.ease` (in-out cubic), `CAM.slow` (in-out sine) | the speed peaks at the MIDPOINT; no hard edge at either end | a whoosh (if any) peaks at the midpoint; never a hit at its start or end |
| a cruise: `CAM.reveal` (trapezoid, peak 1.43x its mean speed) | the launch and the arrival | a swell or the bed's step whose crest meets the arrival; no whoosh across the cruise |
| `CAM.settle` (out-cubic: starts in motion, lands softly), a parallax float, idle life | none: continuous motion | silence (R9) |

**Helps:** a sound sized and pitched like its gesture (the reels' biggest word, lowest hit; our v1 rule "make the
sound as small as the gesture", `docs/sound_plan.md` §7.3); a riser or swell whose crest IS the change; a count that
climbs in pitch (01's knocks; our own v3 opening's crane clunks, "rise in pitch like a roller-coaster chain lift",
`audio/tools/make_v3_opening_sfx.py`); a drop prepared by a quiet floor or a stop-down. **Hurts:** a whoosh on every
move (the template look, fatigue); a whoosh peaking ON a word (it masks the consonant; the voice wins); a riser that
does not pay off; a hit on the END of an ease-out (it lands on nothing and reads late and soft); a stinger under
speech.
**The numbers:** at 60 fps an out-exp entrance moves half its travel in frame 1, so its hit has a 1-frame target;
a whoosh lasts no longer than its move (a 0.5-1.1 s join is 30-66 f); a riser for a short-form film is 1-2 s (60-120 f;
our `low_swell` is 3.5 s, 210 f, and peaks at its end: start it at hit - 3.5 s); the reels' release is +21-23 dB RMS
over a floor of -44 / -33 dBFS RMS, after a hold of up to 1.23 s (74 f).

**For us (EST).** A join's midpoint sits on the next sentence's first word (DIRECTION rule 1), so a whoosh peaking at
the move's midpoint would peak on that word: if a join gets a whoosh at all, keep it soft (our v1 `fg_wipe` sat at -18
to -19 dB, and `audio/mix.py` holds every effect >= 8 dB under the speaking voice) and let its crest come 3-6 f before
the word, inside a soft sound's tolerance (B2). The reels suggest the better default: no whoosh at all.

### B7. Music under a voice-led film: ducking, and the bed stepping up on the turn

**From the reels.** Neither reel has a voice, so the music carries everything: the floor stays near silent until the
release, then steps up +21-23 dB RMS at once (01-5, 02-5). Our films are voice-led (the voice from ~0.12 s, 7 f, always
on top), so the reels' step cannot be copied as a level: it has to be translated into arrangement and into the voice's
pauses.

**The research.**
- **How far under the voice** (STUDY, Torcoli et al. 2019, JAES [C41]): listeners' preferred loudness difference
  between speech and its background is highly personal, and non-experts want the background ~4 LU lower than experts
  do; for voice over voice, experts accept 11.5-17 LU and non-experts ask for 20-30 LU (Salford/Fraunhofer [C41]).
  Our viewers are non-experts on phone speakers: they lean to the larger gap.
- **Ducking** (PRACTICE [C42], [C43]): starting points of a 6-12 dB duck, attack 30-80 ms (some defaults 10 ms),
  release 250-700 ms (Audacity 0.5-1 s); a 15-20 dB duck on every line makes the automation audible (pumping); a slow
  attack masks the first word; the music dips under speech and rises in its pauses; audible ducking is acceptable in a
  documentary and hidden in drama; sparse music needs less ducking, and music written to sit under a voice beats music
  pushed down.
- **Music edits** (PRACTICE [C44]): cut on a beat just before a natural ending, join with a SHORT crossfade (a long
  overlap blurs the downbeat and stacks bass transients), match musical roles (downbeat to downbeat, after a complete
  phrase), keep 4-5 beats of handle.

**What our v1 mix does** (MEASURED, `docs/sound_plan.md` §4 and "CURRENT STATE"; history, at 30 fps): the bed 8.5 LU
under the voice, then a side-chain duck of -14 dB (20 ms look-ahead, 30 ms attack, 200 ms hold, 250 ms release: ~1, 2,
12 and 15 f) and a margin guard of 12 dB; in speech the music sits a median 27 dB under the voice (minimum 12.8). Its
arc moves by SECTION, not by level alone: air only for the hook (37.6 dB under), the piano pulse entering on the first
story line (27.3), a creep at the leak (23.8), one soft accent in a pause (21.0), a hush, a breath (28.1), the rebuild
on "Plus" (22.6) and an air-only close (32.9). Its steps are ~3-6 dB between sections and ~10 dB from the hook's air to
the pulse's entrance.

**The arithmetic of a pause** (EST, from those duck times): the bed reaches full level only ~0.45 s (27 f) after the
voice stops (200 ms hold + 250 ms release) and starts ducking again ~0.05 s (3 f) before the next word (look-ahead +
attack). A sentence break of 0.36-0.54 s (22-32 f; v1's voice, `docs/timing.md`) never lets the bed through at full
level. A pause of ~0.8 s (48 f) gives it ~0.3 s (18 f) in the clear: the shortest moment in which a step up can be
HEARD.

**Helps:** the bed stepping up by ARRANGEMENT on the turn (a layer enters: the pulse, the bass, a brighter register)
while its level under the voice barely moves; a written pause of ~0.8-1.0 s (48-60 f) before or after the turn so
the step plays in the clear (the reel's hold and release, translated); the opening carried by the voice and a few
hits over air (the playbook's "cinematic but subtle, especially at the start", and the reels' quiet floor).
**Hurts:** a level step under a speaking voice (it fights the words); pumping from a deep duck on every line; a long
crossfade across a downbeat; a step up in a 0.4 s (24 f) sentence break (inaudible, wasted).
**The numbers:** duck 6-14 dB (ours 14), attack 30-80 ms (2-5 f), release 250-700 ms (15-42 f); the bed under the
voice in speech has no research number (it is personal, and non-experts want ~4 LU more gap than experts), ours is a
median 27 dB; a section step of ~3-6 dB, the hook-to-entrance step ~10 dB (v1, MEASURED); a pause of >= 0.8 s (48 f)
for the step to be heard.

### B8. Short-form trends, 2023-2026, and what the retention data says

**From the reels.** Both are sound-led hooks of the current kind: the first sync hit at 0.27 s (16 f, reel 01) and
0.70-0.75 s (42-45 f, reel 02); all their hard sync inside the first 2-5 s (120-300 f); a near-silent floor as the setup
(R7); the release at 1.97-2.45 s (01) and 4.38 s (02); and then rest. Neither uses a speed ramp, a flash or a whoosh.

**The trends** (PRACTICE and PLATFORM; dates are when the sources describe them).
- **Beat-sync became one tap.** Editors have long had beat detection (Final Cut Pro [C51]); CapCut's beat markers and
  templates made beat-cut edits the default look on TikTok; Instagram tested Reels templates in 2022 [C51]; YouTube
  announced "sync edits to a beat" for the Shorts editor in spring 2025 [C51]; Instagram's Edits app added automatic
  beat markers on the timeline (reported 2026, summary) [C51]. The consequence: sync alone no longer marks craft;
  everyone has it for free, so what distinguishes a film is WHICH moments are synced and why.
- **Velocity edits** (from ~2023 [C50]): speed ramps (fast, then slow-motion, then fast) whose changes land on the
  music's accents, often with a flash or a blur; CapCut's speed-curve presets ("Montage", "Hero", "Bullet", "Flash
  In/Out"). A tutorial's line: slow motion "feels polished when it arrives late and leaves early".
- **Sound-led hooks** (PLATFORM [C48]; marketing blogs [C55]): TikTok's Creative Codes (May 2023): "TikTok content is
  best when sound is on"; hook guides recommend a sharp percussive sound in the first second (a snap, a pop, a
  notification) and stacking a sound hook with a text and a visual hook. Our playbook already asks for a positive
  phone sound in the first second (owner, 2026-10-25).
- **Silence as a hit**: the stop-down and the quiet floor before a release (B6); both reels use it.

**What the data says** (with its quality):
- **Sound is on for most viewers** (surveys): 88 % of TikTok users say sound is essential to the experience and 73 %
  would "stop and look" at an ad with audio (Kantar for TikTok, 2021: PLATFORM, commissioned [C46]); 62 % of TikTok
  users and 77 % of YouTube users say sound is on all or most of the time (Voices "Sound On" survey, 2024: VENDOR [C49]).
  The widely repeated "85 % of Facebook video is watched without sound" has no Meta primary source we could find, and
  predates the sound-on platforms [C54].
- **The first seconds carry the hook** (PLATFORM): over 63 % of TikTok's highest click-through ads put their key
  message in the first 3 s (descriptive, method not shown [C47]); YouTube's Shorts metric for the hook is "viewed vs
  swiped away", with no official target (third-party guides aim for 70-80 % viewed [C53]).
- **Voice and music in ads** (PLATFORM [C48]): music in 63 % of TikTok ads, a voice-over in 39 %; the voice-over was
  the strongest non-music audio element for recall (TikTok, "Power of Creative Elements", 2022); a vendor reports custom
  audio beating a licensed track by +52 % on 6-second view rate (VidMob, VENDOR).
- **Beat-synced cuts and retention: no controlled evidence.** We found no peer-reviewed or platform study that isolates
  beat-synced cutting against completion or retention (searched twice). The nearest: Scrolly2Reel (2024 [C52]) turned
  news graphics into narrated social videos; expert raters preferred versions whose visual changes followed the
  NARRATION's beats (not music) with the text shortened per beat, though alignment made four videos worse (summary,
  17 pieces). One vendor blog cites a "Facebook study" of "up to 40 % higher completion" for strong A/V sync; we could
  not find the original, so we do not use it [C54].

**Helps:** a sound-led first second, a sync hit inside the first ~0.3-0.75 s (18-45 f, the reels), sound designed
for sound-on viewers while every shot still reads with the sound off (DIRECTION rule 1). **Hurts:** chasing the
one-tap template look (beat cuts, velocity ramps, flashes) in a calm, premium film whose look is "alive but calm"
(DIRECTION rule 3); treating any "X % more completion from sync" claim as fact.
**The numbers:** the reels' first hits at 0.27 s (16 f) and 0.70 s (42 f); their releases at 1.97-2.45 s (118-147
f) and 4.38 s (263 f); the hook window 3 s (180 f).

**For us (EST).** Sync is a craft choice judged by eye and ear on the playable cut, never a metric lever: the evidence
says sound is usually on and the first seconds decide the swipe; it does not say that more sync keeps people watching.

### B9. Where sync helps and where it hurts: one table

The reels' devices first (R1-R10, Part A), then the ones they do not use. Times at 60 fps; "0 f" = the sound's
transient (or crest) on the picture's first changed frame; "-1/+2 f" = from 1 frame early to 2 frames late.

| Device | In the reels | Helps when | Hurts when | Timing | Evidence |
|---|---|---|---|---|---|
| **R1 hit-cut** | 01-1..3, 02-5 | the cut should be FELT: a change of state, a count, the release | the cut should be invisible (a carried join: the sound announces it); on every cut | 0 f (-1/+2 f) for a sharp sound | MEASURED; STUDY [C4] [C5] [C8] |
| **R2 count-in** | 01-1..3 (0.533 s = 32 f apart), 02-1..3 (1.11-1.26 s = 67-76 f) | the opening's first 2-4 s; a list of three; a build into the release; a counter climbing | uneven spacing (no entrainment); more than once a film (a tic); a count with no release after it | 3 hits 0.5-1.3 s apart (30-76 f), rising in pitch or weight | MEASURED; STUDY [C11] |
| **R3 the late fourth** | 01-4 (6 f past the pulse), 02-4 (a 1.23 s hold) | the payoff just after the expected moment: a held breath | late by so much it reads as a miss (EST: past ~1/4 of the pulse on a short pulse); used on every beat | 6 f late on a 32 f pulse; a hold of 1.0-1.3 s (60-76 f) before a drop | MEASURED; PRACTICE [C27]; BOOK [C25] |
| **R4 interface click** | 01-4 | a phone action in the story (press, send, toggle, like): the playbook's positive phone sounds | decoration on non-interface moves; a real platform's own sound (playbook) | two ~20 ms ticks, press and release ~5 f apart, the first on the visual press | MEASURED; PRACTICE [C36] |
| **R5 cause, then effect** | 01-4 to 01-5 | an action that starts something (press, then play; switch, then light) | a gap so long the link breaks (EST: past ~1 s, 60 f) | 0.48 s (29 f) | MEASURED |
| **R6 word-on-hit** | 02-1..3 | a title or a few big words built one by one (the cover line, a number) | every caption under the voice (captions pop silent: `docs/sound_plan.md` §7.7); fatigue | a soft hit at 0 f, -3/+6 f tolerated; the biggest word, the lowest and loudest hit | MEASURED; PRACTICE |
| **R7 quiet floor** | 01 (-44 dBFS RMS), 02 (-33 dBFS RMS) | before the release and under the opening's hits | dead air with no purpose | the floor 21-23 dB under the release | MEASURED; PRACTICE [C35] [C39] |
| **R8 the release (drop)** | 01-4/5, 02-5 | ONCE: the turn or the payoff, a picture change and the music's step together | twice or more; as a level step under a speaking voice (B7); with no floor or count before it | +21-23 dB in the reels; for us an arrangement step in a >= 0.8 s (48 f) pause | MEASURED; STUDY [C45] |
| **R9 the rest** | 01-6 (7.6 s, one shot), 02-6..8 (cuts 1.8-3.2 s, 110-194 f, apart) | after the release; while the voice explains | (only if rest turns into a dead frame: life never stops, DIRECTION rule 3) | no sync after the release in either reel | MEASURED |
| **R10 punch-in** | 02-7 | the same subject closer, on an accent or a stressed word | on every accent; a push on nothing | a soft accent: 0 f, -3/+6 f | MEASURED |
| **Impact** | (01's dry knocks are its soft cousin) | a contact at the end of an ease-IN: a landing, a slam that accelerates (our stamp settles today: B6) | at the end of an ease-OUT or an in-out settle (it lands on nothing) | the contact frame, 0 f (-1/+2 f) | PRACTICE [C33] [C34]; STUDY [C30] |
| **Whoosh** | none | a fast move or a wipe whose speed must be sold | on every move; peaking on a word; outlasting its move | peak on the fastest frame; no longer than the move | PRACTICE [C33] |
| **Riser or swell** (the music's J-cut) | none | into the one release or reveal | one that does not pay off; a long one under the voice | crest 0 f on the change; 1-2 s (60-120 f) for short form | PRACTICE [C35]; STUDY [C45] |
| **Cutting on the beat** | the hits ARE the beat (01); the drop (02) | a montage, a count, the release; the downbeat for the turn | every beat; a cut moved off its word; a beat masked under the voice | a beat is 0.43-0.67 s (26-40 f) at 90-140 BPM | STUDY [C29]; BOOK [C26] |
| **J- and L-cut** | 01-4 to 01-5 (an L of 29 f) | a join to smooth; a place's sound leading in | competing with the voice; stacked tails | J 0.2-0.5 s (12-30 f), L 0.3-1.0 s (18-60 f) (MR20, EST) | PRACTICE [C31] |
| **Silence, the stop-down** | both floors; 02's 1.23 s hold | right before the one big hit | everywhere; an empty end before the loop | one beat to ~1.2 s (74 f) | PRACTICE [C38] [C39] |
| **Speed ramp, flash (velocity edit)** | none | (outside our look) | in a calm, premium film | - | PRACTICE [C50] |

**The rule the table adds up to (EST, for the distill):** sync is spent, not sprinkled. Spend it on DISCRETE events
of the tier-A subject, mostly in the opening and at the one release, with the sound's transient on the first changed
frame (0 f, at most 2 f late) and its size matching the gesture; let the rest of the film breathe, with the voice
leading and the music moving by section.

---

## Part C. Our docs, squared (for the distill: this doc edits none of them)

### C1. What our docs say about sync today, against the reels and the research

| Doc (rank) | What it says | Against Parts A-B | For the distill |
|---|---|---|---|
| Playbook "Sync picture to sound ON PURPOSE" (owner's words) | cuts, moves and key actions land on beats, hits and voice stresses "where that adds energy or meaning, and NOT everywhere" | the reels spend all hard sync in the first 2-5 s and at one release, then rest (A3); B9 is the "where" | B9's table and its closing rule are the candidate answer |
| Playbook "Music: cinematic but subtle, especially at the start" (v1) | the voice and the hook carry the opening | agrees: both reels open on a near-silent floor with hits, and the music enters only at the release (R7, R8) | keep; B7 gives the translation for a voice-led film |
| Playbook "Mix to -14 LUFS / -1 dBTP, voice always on top; SFX land on visual hits" (v1) | effects on visual hits | agrees; B2 makes "on" a number: the transient on the first changed frame, at most 2 f late | add the number |
| Playbook "More sound effects ... positive phone sounds ... one in the first second" (owner, 2026-10-25) | phone-like sounds, one in the first second | agrees: reel 01's trigger is an interface click (R4); the reels' first hits come at 0.27 s and 0.70 s (16 and 42 f) | "more" means more DISCRETE story events sounded, never sound on continuous motion (B3) |
| DIRECTION rule 8 | "visuals lead their word by ~0.1 s" | agrees (B2): a picture may lead its WORD by 0-0.3 s (0-18 f) | say that a sound EFFECT is the other case: 0 f, never early |
| DIRECTION rule 9 | the opening's effects big, "with its own sound"; a positive phone sound in the first second; the first word at ~0.12 s (7 f) | agrees; the reels add the count-in (R2) and the late fourth (R3) as opening shapes | see C2.1: a count-in must live with a voice that starts at 0.12 s |
| DIRECTION rule 1; `G3_ANIMATIC.md` §2 | each join's midpoint on the next sentence's first word; cuts on the locked words, in the voice's breaths | agrees with the film-scoring approach (B4): the voice decides, the music bends | keep |
| `docs/motion_spec.md` §7 (v1 history, 30 fps; reference 1 had NO music or effects) | "Lead, don't follow": picture onsets 1-4 f at 30 fps (2-8 f at 60) before the word; marks on the word; effects follow the VISUAL onsets ("whooshes on flip midpoints, ticks on pops") | agrees with B2 (picture vs word) and B6 (whoosh at the midpoint, tick on the pop's first frame) | measurements only; nothing to change |
| `docs/sound_plan.md` §7 spotting (v1-era, values only) | one sound per idea, about one every 2-3 s; as small as the gesture; story beats' special sounds once; never sound what the music does; captions silent; "nudge each cue to its visual event (usually within ±100 ms)" | agrees on every point but the last: ±100 ms (±6 f) is a soft sound's tolerance; a sharp one needs 0 f (-1/+2 f) (B2) | clash C2.2 |
| `docs/sound_plan.md` "CURRENT STATE" v5 (v1-era) | the bed bent so 10 of 11 cuts sit on beats (`beatsync.py --fit-tempo`, `beatlock.py`) | right method (the voice decides, the music bends) but most of those beats are masked under the voice (B4, EST) | C2.3: lock only the cuts the music is heard on |
| `composition/motion.md` §4.4, MR20 (the composition study, beside this one) | an effect on its event's frame or 1-2 f after, "never more than ~2 f before"; a picture leads its word by 0.1-0.3 s; a place's ambience J 0.2-0.5 s, L 0.3-1.0 s, one bridge per join; a check that every effect sits 0 to +2 f after its event | confirmed: reel 01 is frame-exact; every threshold in B2 allows it; the J/L lengths have no source either way (EST) | one refinement, C2.4 |
| `PIPELINE_V2.md` G3, G5, G7 | G3 plays the sketch with sound (sound-off and sound-on reads); G5 carries the board's `sfx` cues; G7 is "SFX from the final beats, music, -14 LUFS mix" | the reels' sync is STRUCTURE (a count, a hold, a release: story timing), so it cannot wait for G7 | C3 |

### C2. Clashes and adaptations (each a proposal; the distill decides and fixes the owning doc)

1. **A count-in under a voice.** The reels count in over silence; our voice starts at ~0.12 s (DIRECTION rule 9). Three
   hits in the first ~1.3 s (80 f) would collide with the first line's words. Two ways that keep the voice on top (EST):
   put the hits on the picture's build AND on the first line's stressed syllables (the voice's stresses become the
   count; the v1 pipeline ranked them, `docs/timing.md`'s `stress` and `hits`, while today's
   `public/vN/voice_words.json` carries word times only, `{w, s, e}`), or use the reel-02 kind of hit (soft, low:
   centroid ~400-500 Hz, long decay), which leaves the consonants' 2-8 kHz band clearer than a bright knock, held >= 8
   dB under the speaking voice (`audio/mix.py`'s SFX guard). Either way the hits sit on the subject's opening build,
   which already has "its own sound" (rule 9).
2. **Cue tolerance.** `docs/sound_plan.md` §7's "within ±100 ms" is right for soft sounds and too loose for sharp
   ones. Proposed (B2): a sharp transient 0 f (-1/+2 f, -17 to +33 ms); a soft sound 0 f (-3/+6 f, -50 to +100 ms);
   always measured from the transient or the crest, never the file start.
3. **Beat-lock where it is heard.** Lock the release or turn, the opening's hits and the close to the music (B4); the
   cuts under speech need the voice, not the beat. Fewer locks also leave the bed's tempo freer (v5 bent it 90.9-103
   BPM to catch 10 cuts).
4. **Never early by design.** MR20's "never more than ~2 f before" allows a sound 2 f (33 ms) early; the research
   puts sound-early on the narrow side (45 ms detected, ITU [C13]; a window that training does not widen [C20]; no
   freezing benefit when the tone leads [C5]). Proposed: build effects at 0 to +2 f; treat -1 f as frame rounding,
   never as a choice. (The composition study defers to this lane on sound: "its numbers win on sound".)
5. **The release needs a pause.** A step up under speech is inaudible or fights the voice (B7); the turn that should
   feel like the reels' release needs a written pause of ~0.8-1.0 s (48-60 f) in the script and the take. That is a
   G1 decision (the script and its pauses), carried by the voice take (`docs/voice/API_QUICKSTART.md` owns how).
6. **Our "slam" settles.** The label stamp's `slamScale` (`src/scenes/shared/props/Labels.tsx`) eases 2.6x to 1x on
   in-out cubic, so it arrives softly and has no contact frame for its thunk (B6's table). A motion question for the
   engine's owner, raised here because the sound cannot land without it: an ease-in slam with a 1-2 f squash, or the
   thunk on the fastest frame.

### C3. Where sync gets decided (a proposal for the gates)

- **G1, the script:** the turn's pause (C2.5), and which 3-6 moments carry sync: the opening's count, the release,
  the payoff, a phone action (R4/R5), a counted list.
- **G3, the animated sketch with sound:** the hit points as board cues, each on its event's first changed frame
  (B6's ease table), with placeholder sounds: the sound-on read at 1x judges them. The count-in, the hold and the
  release are timing, so they are frozen here with the story.
- **G5:** carries G3's cues into the film shell (`<Film sfx>`, `G5_BLOCKING.md`) and keeps them on their events;
  its scripted entry diff (§1) compares moves, transitions and carriers, not yet the cues: adding them is a proposal.
- **G7:** swaps placeholders for final sounds, sizes them to their gestures, mixes; never re-times the picture.
- **Checks:** `scripts/qa/av_lag.py` (the voice or the mix inside the render at 0 ms lag); `scripts/qa/beatsync.py`
  (cuts against the beat grid, for the few locks of C2.3); a cue check, still to build (MR20 proposes it): every
  effect's transient 0 to +2 f after its visual event; one watch on a phone's own speaker, never over Bluetooth (A0).

### C4. What we do not know yet (tests for an ITERATION, not rules)

- Whether a count-in under the first spoken line (C2.1) reads as the reels' does, or as clutter: one A/B of the
  opening with and without it, judged by the owner.
- Our own phone-speaker thresholds for a sharp hit: one clip with the same hit at -2, 0, +2 and +4 f.
- Whether a join reads better with or without a soft whoosh (the reels use none).
- Whether an arrangement step in a written 0.8 s pause gives the turn the reels' release feeling.

---

## Sources

Page fetches from this sandbox failed (ENOTFOUND: itu.int, tvtechnology.com, arxiv.org among them), so every source
below was read through search-result summaries, none in full; a number that rests on a single summary says so in the
text. Tags as in the conventions above. Ours: Part A's measurements (`/tmp/sync/craft/`, scratch) and the
repo docs named in Part C.

**Perception**
- **[C1]** M. Chion, *Audio-Vision: Sound on Screen* (Columbia UP, 1994; French 1990): synchresis, added value. BOOK.
  [sonicfield: synchresis](https://sonicfield.org/wiki/synchresis), [sonicfield: added value](https://sonicfield.org/wiki/added-value),
  [eContact: synchresis](https://econtact.ca/19_2/basanta_synchresis.html).
- **[C2]** Chion's synch points, temporalization, vectorization and audiovisual phrasing. BOOK.
  [Locating Audio-Vision: synch points](https://plantain-circle-bl3a.squarespace.com/blog/2018/10/30/locating-audio-vision-michel-chions-synchpoints),
  [sonicfield: temporal vectorization](https://sonicfield.org/wiki/temporal-vectorization), [sonicfield: audiovisual phrasing](https://sonicfield.org/wiki/audiovisual-phrasing).
- **[C3]** R. Sekuler, A. B. Sekuler, R. Lau (1997), "Sound alters visual motion perception", *Nature* 385:308. STUDY.
  [PDF](https://www.nature.com/articles/385308a0.pdf); [demo](https://michaelbach.de/ot/aud-bounce/).
- **[C4]** E. Van der Burg et al. (2008), "Pip and pop: nonspatial auditory signals improve spatial visual search",
  *JEP:HPP* 34(5):1053; and the 2012 *PLoS ONE* follow-up; Zou, Müller & Shi (2012) on asynchrony. STUDY.
  [VU PDF](https://research.vu.nl/ws/files/2321477/Burg%20Journal%20of%20Vision%208(5)%202008%20u.pdf),
  [PMC3393717](https://pmc.ncbi.nlm.nih.gov/articles/PMC3393717), [Zou et al. 2012](https://www.psy.lmu.de/exp/people/prof/shi/publications/2012-zou-mueller-shi.pdf).
- **[C5]** J. Vroomen, B. de Gelder (2000), "Sound enhances visual perception: cross-modal effects of auditory
  organization on vision", *JEP:HPP* 26(5):1583-1590 (the freezing effect). STUDY.
  [Tilburg](https://research.tilburguniversity.edu/en/publications/sound-enhances-visual-perception-cross-modal-effects-of-auditory-), [PDF](https://core.ac.uk/download/284983758.pdf).
- **[C6]** S. Morein-Zamir, S. Soto-Faraco, A. Kingstone (2003), "Auditory capture of vision: examining temporal
  ventriloquism", *Cognitive Brain Research* 17:154-163. STUDY.
  [Cambridge](https://neuroscience.cam.ac.uk/publications/auditory-capture-of-vision-examining-temporal-ventriloquism).
- **[C7]** L. Shams, Y. Kamitani, S. Shimojo (2000), "What you see is what you hear", *Nature* 408:788. STUDY.
  [doi:10.1038/35048669](https://www.doi.org/10.1038/35048669), [Illusions Index](https://www.illusionsindex.org/i/sound-induced-flash-illusion).
- **[C8]** T. J. Smith, J. Y. Martin-Portugues Santacreu (2017), "Match-action: the role of motion and audio in creating
  global change blindness in film", *Media Psychology* 20(2):317-348. STUDY. (The composition study's [MO4].)
  [UAL](https://ualresearchonline.arts.ac.uk/id/eprint/21152/), [Birkbeck](https://eprints.bbk.ac.uk/14904/).
- **[C9]** S. D. Lipscomb, R. A. Kendall (1994), *Psychomusicology* 13:60-98; S. D. Lipscomb (1995, UCLA dissertation;
  2005 chapter) on accent alignment in simple and complex audiovisual stimuli. STUDY.
  [sonicfield library](https://labs.sonicfield.org/library/cross-modal-integration-synchronization-of-auditory-and-visual-components-in-sim),
  [dissertation index](https://www.mtosmt.org/docs/diss-index.php?id=137), [OUP chapter](https://academic.oup.com/book/3160/chapter/381273964).
- **[C10]** A. J. Cohen, the congruence-association model (OUP 2013 chapter; *Music and the Moving Image* 8(2),
  2015). BOOK/STUDY. [OUP](https://academic.oup.com/book/3160/chapter/144031257), [JCAA PDF](https://jcaa.caa-aca.ca/index.php/jcaa/article/download/1812/1559).
- **[C11]** J. E. Miller, L. A. Carlson, J. D. McAuley (2013), "When what you hear influences when you see",
  *Psychological Science* 24(1):11-18. STUDY. [PMC3650712](https://pmc.ncbi.nlm.nih.gov/articles/PMC3650712),
  [SWOV summary](https://swov.nl/en/publicatie/when-what-you-hear-influences-when-you-see-listening-auditory-rhythm-influences-temporal).
- **[C12]** N. Escoffier, D. Y. J. Sheng, A. Schirmer (2010), "Unattended musical beats enhance visual processing",
  *Acta Psychologica* 135(1):12-16; the later challenge (Schirmer et al. 2021). STUDY.
  [Pacific Standard summary](https://psmag.com/?p=43041), [MPG PuRe](https://pure.mpg.de/pubman/item/item_3289958_4).
- **[C13]** ITU-R BT.1359-1 (1998), "Relative timing of sound and vision for broadcasting". STANDARD.
  [ITU PDF](https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1359-1-199811-I!!PDF-E.pdf) (fetch blocked),
  [Wikipedia: audio-to-video synchronization](https://en.wikipedia.org/wiki/Audio-to-video_synchronization),
  [Fora Soft](https://www.forasoft.com/learn/audio-for-video/articles-audio/lip-sync-itu-r-bt-1359-tolerance-windows). (The composition study's [MO19].)
- **[C14]** EBU R37 (2007), "The relative timing of the sound and vision components of a television signal". STANDARD.
  [EBU](https://tech.ebu.ch/publications/r037).
- **[C15]** ATSC IS-191 (2003), relative timing of sound and vision for DTV. STANDARD.
  [TV Technology](https://tvtechnology.com/opinions/atsc-recommends-av-sync-rules) (fetch blocked), [NAB](https://nab.org/xert/scitech/2009/TVTechCheck/TV100509.asp).
- **[C16]** N. F. Dixon, L. Spitz (1980), "The detection of auditory visual desynchrony", *Perception* 9(6):719-721.
  STUDY. [BibBase](https://bibbase.org/network/publication/dixon-spitz-thedetectionofauditoryvisualdesynchrony-1980);
  the values via the review table in [Conrey & Pisoni, PMC3314884](https://pmc.ncbi.nlm.nih.gov/articles/PMC3314884).
- **[C17]** V. van Wassenhove, K. W. Grant, D. Poeppel (2007), "Temporal window of integration in auditory-visual speech
  perception", *Neuropsychologia* 45:598-607. STUDY. [USUHS](https://scholar.usuhs.edu/en/publications/temporal-window-of-integration-in-auditory-visual-speech-percepti/),
  [PMC4744562 (context)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4744562).
- **[C18]** R. L. J. van Eijk et al. (2008), "Audio-visual synchrony and temporal order judgments", *Perception &
  Psychophysics* 70(6):955-968. STUDY. [Springer PDF](https://link.springer.com/content/pdf/10.3758/PP.70.6.955.pdf),
  [TU/e](https://research.tue.nl/en/publications/audio-visual-synchrony-perception/).
- **[C19]** J. Vroomen, M. Keetels (2010), "Perception of intersensory synchrony: a tutorial review", *Attention,
  Perception & Psychophysics* 72(4):871-884; the horizon of simultaneity (Pöppel 1985) and a 2024 test of it. STUDY.
  [doi:10.3758/APP.72.4.871](https://doi.org/10.3758/APP.72.4.871), [BioNumbers](https://bionumbers.hms.harvard.edu/bionumber.aspx?id=112389),
  [2024 study](https://link.springer.com/10.1007/s10055-024-01064-2).
- **[C20]** R. Cecere, J. Gross, G. Thut (2016), "Behavioural evidence for separate mechanisms of audiovisual temporal
  binding as a function of leading sensory modality", *European Journal of Neuroscience*; A. R. Powers, A. R. Hillock,
  M. T. Wallace (2009), "Perceptual training narrows the temporal window of multisensory binding", *J. Neurosci.* STUDY.
  [PMC4915493](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4915493/), [PMC2771316](https://pmc.ncbi.nlm.nih.gov/articles/PMC2771316).
- **[C21]** Animation lip sync "two frames ahead". PRACTICE.
  [Animation Apprentice](https://animationapprentice.blogspot.com/2022/04/why-lipsync-should-be-two-frames-ahead.html),
  [Escape Studios](https://escapestudiosanimation.blogspot.com/2022/04/lipsync-two-frames-ahead-of-audio.html).

**Scoring and editing**
- **[C22]** Mickey-mousing (Steiner; Cocteau; Eisler). BOOK/PRACTICE. [Wikipedia](https://en.wikipedia.org/wiki/Mickey_Mousing).
- **[C23]** Hit points, streamers and punches (the Newman system), click tracks. PRACTICE.
  [Wikipedia: film score](https://en.wikipedia.org/wiki/Film_score), [Marc Taddei](https://www.marctaddei.com/blog/326), [Soundbridge](https://soundbridge.io/en/syncing-film-score).
- **[C24]** S. Eisenstein: metric and rhythmic montage; vertical montage (*Alexander Nevsky*, with Prokofiev). BOOK.
  [Chicago Media Works PDF](https://www.chicagomediaworks.com/2instructworks/3editing_doc/Eisenstein.pdf),
  [Fiveable](https://library.fiveable.me/film-history-and-form/unit-10/eisensteins-theories-montage/study-guide/cl6nbp8Pq3pBpy9r).
- **[C25]** D. Huron (2006), *Sweet Anticipation: Music and the Psychology of Expectation* (MIT Press). BOOK.
  [Leonardo review](https://leonardo.info/reviews_archive/july2007/sweet_zilberg.html).
- **[C26]** W. Murch (1995/2001), *In the Blink of an Eye*: the Rule of Six. BOOK.
  [No Film School](https://nofilmschool.com/2016/11/6-rules-good-cutting-according-oscar-winning-editor-walter-murch),
  [UT Austin wiki](https://cloud.wikis.utexas.edu/wiki/spaces/rtf318/pages/80022510/Murch+s+Rule+of+Six).
- **[C27]** Cutting to music: beats, downbeats, phrases, density. PRACTICE.
  [Larry Jordan via No Film School](https://nofilmschool.com/2014/09/larry-jordan-teaches-us-how-create-video-montage-set-music),
  [Larry Jordan](https://larryjordan.com/articles/fcpx-montage-to-music/), [Sonilo](https://sonilo.com/blog/guides/how-to-make-video-sync-with-music),
  [Motion Array](https://motionarray.com/tutorials/filmmaking/how-to-make-a-montage-3-helpful-tips), [High on Films](https://www.highonfilms.com/?p=200038).
- **[C28]** The "frame or two early" habit (forums, tutorials, unsourced) and frame-accurate cuts. PRACTICE.
  [Adobe forum](https://community.adobe.com/t5/premiere-pro-discussions/adjusting-tempo/m-p/11301404),
  [tryuncle](https://tryuncle.com/learn/davinci-resolve/davinci-resolve-music-video-editing-and-color-workflow),
  [EOSHD forum](https://www.eoshd.com/comments/topic/46696-editing/),
  [Vegas docs](https://www.vegascreativesoftware.com/in/post-production/how-to-edit-video-footage-to-the-beats-of-music).
- **[C29]** "Is there a language of music-video clips? A qualitative and quantitative study" (arXiv 2108.00970). STUDY.
  [arXiv PDF](https://arxiv.org/pdf/2108.00970) (fetch blocked).
- **[C30]** A. Davis, M. Agrawala (2018), "Visual rhythm and beat", *ACM TOG* 37(4) (SIGGRAPH). STUDY.
  [CVF workshop PDF](https://openaccess.thecvf.com/content_cvpr_2018_workshops/papers/w49/Davis_Visual_Rhythm_and_CVPR_2018_paper.pdf),
  [SIGGRAPH history](https://history.siggraph.org/?p=100781).
- **[C31]** J- and L-cuts. PRACTICE. [Epidemic Sound](https://www.epidemicsound.com/blog/j-cuts-and-l-cuts/),
  [Vimeo](https://vimeo.com/blog/post/j-cuts-l-cuts), [MasterClass](https://www.masterclass.com/articles/how-to-use-j-cuts-and-l-cuts-in-video-editing),
  [Soundstripe](https://soundstripe.com/blogs/a-video-editors-guide-to-j-cuts-and-l-cuts), [Wikipedia: J cut](https://en.wikipedia.org/wiki/J_cut). (The composition study's [MO20].)
- **[C32]** T. Nakano et al. (2009), "Synchronization of spontaneous eyeblinks while viewing video stories",
  *Proc. R. Soc. B* 276 (the composition study's [MO10]); T. J. Smith, J. M. Henderson (2008), "Edit blindness",
  *Journal of Eye Movement Research*. STUDY. [doi:10.1098/rspb.2009.0828](https://doi.org/10.1098/rspb.2009.0828),
  [JEMR](https://bop.unibe.ch/JEMR/article/view/2264).

**Motion-graphics and explainer sound**
- **[C33]** Whoosh and impact placement. VENDOR/PRACTICE. [Morphic: fast sound effects](https://morphic.com/resources/sounds/fast-sound-effects),
  [Cursa](https://cursa.app/en/page/audio-and-final-rhythm-using-sound-to-support-motion), [Sonilo: whoosh guide](https://sonilo.com/ai-music/whoosh-sound-effect-guide),
  [Pixflow](https://pixflow.net/blog/cinematic-whoosh-sound-effects/).
- **[C34]** The transient on the contact frame; squash on impact; hand-placed contact sounds drift. VENDOR/STUDY.
  [Morphic: sync sound effects](https://morphic.com/resources/how-to/how-to-sync-sound-effects-to-video),
  [Morphic: animation](https://morphic.com/resources/use-cases/sound-effects-for-animation), [Cornell inverse-Foley](https://research.cs.cornell.edu/Sound/ifa/ifa.pdf).
- **[C35]** Risers: crest on the hit, lengths, near-silence before the hit. VENDOR.
  [Morphic: riser](https://morphic.com/ai-glossary/riser), [Violet Recording](https://violetrecording.com/sound-design-for-trailers/).
- **[C36]** Google Material Design sound guidelines (2019). PRACTICE.
  [Applying sound to UI](https://m2.material.io/design/sound/applying-sound-to-ui.html), [About sound](https://m2.material.io/design/sound/about-sound.html).
- **[C37]** Explainer practice: Kurzgesagt's late sound pass; sound only the moments that matter. PRACTICE/VENDOR.
  [kottke](https://kottke.org/18/01/the-soundtrack-to-kurzgesagt), [Rosetta](https://rosetta.to/u/kurzgesagt/how-to-make-a-kurzgesagt-video-in-1200-hours),
  [Morphic: explainers](https://morphic.com/resources/use-cases/sound-effects-for-explainer-videos).
- **[C38]** The trailer stop-down. PRACTICE. [Rareform Audio](https://www.rareformaudio.com/blog/trailer-music-drop-vs-stopdown),
  [IRPR sound design](https://sounddesign.irpr.agency/guides/how-to-make-a-trailer-sound-cinematic/), [Film Editing Pro](https://www.filmeditingpro.com/?p=30353).
- **[C39]** Silence as an instrument (Chion; Rydstrom: contrast). BOOK/PRACTICE.
  [Film Comment](https://filmcomment.com/blog/film-of-the-week-the-sound-of-silence), [Designing Sound](https://designingsound.org/2014/06/28/designing-silence/),
  [Krotos](https://krotos.studio/blog/the-power-of-silence-times-when-less-was-more-in-sound-design), [Wright on Film](https://wrightonfilm.com/2008/10/22/from-here-on-in-absolute-silence/).
- **[C40]** Bluetooth latency and players' video delay. PRACTICE (forums and blogs, not vendor docs).
  [MacRumors](https://forums.macrumors.com/threads/ios-bluetooth-audio-delays.2094797/),
  [Eclectic Light](https://eclecticlight.co/2016/11/07/wireless-headphones-and-lip-sync/), [Stephen Coyle](https://stephencoyle.net/latency/).

**Music under a voice**
- **[C41]** M. Torcoli et al. (2019), "Preferred levels for background ducking to produce esthetically pleasing audio for
  TV with clear speech", *JAES* 67 (doi:10.17743/jaes.2019.0052); voice-over-voice loudness differences. STUDY.
  [AES PDF](https://www.aes.org/e-lib/download.cfm/22109.pdf?ID=22109), [Fraunhofer audio blog](https://www.audioblog.iis.fraunhofer.com/?p=4251),
  [arXiv 2305.19100](https://arxiv.org/abs/2305.19100v2), [Salford](https://salford-repository.worktribe.com/output/1341554/loudness-differences-for-voice-over-voice-audio-in-tv-and-streaming).
- **[C42]** Ducking settings. PRACTICE. [Vindral](https://composer-docs.vindral.com/operators/operators-sidechain-ducking.html),
  [Product London: Audacity](https://www.productlondon.com/audacity-auto-duck), [CapCut](https://www.capcut.com/create/audio-ducking-for-clear-dialogue-in-video),
  [Adobe: auto-ducking](https://helpx.adobe.com/lv/premiere-pro/how-to/automatic-audio-ducking.html), [Larry Jordan](https://larryjordan.com/articles/how-to-auto-duck-audio-in-adobe-premiere-pro-cc/).
- **[C43]** Ducking under narration; music written to sit under a voice. PRACTICE.
  [Typecast](https://typecast.ai/learn/?p=14829), [VSL forum](https://forum.vsl.co.at/post/91919), [Boris FX](https://borisfx.com/blog/what-is-audio-ducking-and-how-is-it-used/).
- **[C44]** Editing music cues. PRACTICE. [Storyblocks](https://www.storyblocks.com/resources/?p=25313),
  [Film Editing Pro](https://www.filmeditingpro.com/quick-tips-for-cutting-music-cues/), [Mr Witte](https://mrwitte.blogspot.com.au/2013/10/).
- **[C45]** R. T. Solberg (2014), "Waiting for the bass to drop", *Dancecult*; later EEG and fMRI work on build-ups.
  STUDY. [CORE PDF](https://core.ac.uk/download/225893003.pdf), [Wikipedia: drop](https://en.wikipedia.org/wiki/Drop_(music)),
  [Kent repository](https://kar.kent.ac.uk/93493/).

**Short form**
- **[C46]** Kantar for TikTok (2021), sound on TikTok. PLATFORM.
  [TikTok for Business](https://ads.tiktok.com/business/en-US/blog/kantar-report-how-brands-are-making-noise-and-driving-impact-with-sound-on-tiktok),
  [Social Media Today](https://www.socialmediatoday.com/news/tiktok-shares-new-insights-into-the-importance-of-sound-for-marketing-promo/601569).
- **[C47]** TikTok, "9 creative tips to drive auction ad performance". PLATFORM.
  [Blog](https://ads.tiktok.com/business/en-US/blog/9-creative-tips-to-drive-auction-ad-performance), [PDF](https://ads.tiktok.com/business/library/Auction_Ads_Creative_Tips.pdf).
- **[C48]** TikTok Creative Codes (May 2023) and "Power of Creative Elements" (2022); the VidMob figure via Marin
  Software. PLATFORM/VENDOR. [Creative Codes PDF](https://www.tiktok.com/business/library/Creative_Codes_May_2023.pdf),
  [Creative Codes](https://ads.tiktok.com/business/en/creative-codes),
  [Power of Creative Elements](https://ads.tiktok.com/business/creativecenter/quicktok/online/Power_Creative_Elements/pc/en),
  [Marin Software](https://www.marinsoftware.com/blog/how-to-nail-your-tiktok-ad-creative).
- **[C49]** Voices, "Sound On" survey (June 2024). VENDOR.
  [Newswire](https://www.newswire.com/news/audio-boosts-memorability-and-engagement-of-advertisements-voices-22370484).
- **[C50]** Velocity edits (speed ramps on accents). PRACTICE. [Nemo Video](https://www.nemovideo.com/blog/capcut-slow-motion-speed-ramp),
  [Nerds Chalk](https://nerdschalk.com/how-to-do-the-velocity-trend-using-capcut/), [FlexClip](https://www.flexclip.com/learn/velocity-tiktok.html).
- **[C51]** Beat-sync tools: Final Cut Pro beat detection; Instagram Reels templates (2022); YouTube Shorts "sync edits
  to a beat" (announced 2025); Instagram Edits beat markers (reported 2026). PLATFORM/PRACTICE.
  [Apple](https://support.apple.com/guide/final-cut-pro/ver65b55a2b7/mac), [Hypebeast 2022](https://hypebeast.com/2022/4/instagram-testing-templates-feature-reels-video-editing),
  [YouTube blog 2025](https://blog.youtube/news-and-events/new-creation-tools-youtube-shorts-2025/),
  [Engadget](https://www.engadget.com/apps/youtube-is-updating-the-shorts-video-editor-to-make-it-a-better-alternative-to-tiktok-182932945.html),
  [Beebom](https://beebom.com/instagram-edits-adds-beat-markers-editing-feature), [Hypebeast 2026](https://hypebeast.com/2026/6/instagram-edits-app-adds-beat-markers-and-ai-tools).
- **[C52]** Scrolly2Reel: retargeting graphics for social media using narrative beats (arXiv 2403.18111, 2024). STUDY
  (summary; the count of pieces differs between summaries). [arXiv PDF](https://arxiv.org/pdf/2403.18111) (fetch blocked),
  [Moonlight review](https://www.themoonlight.io/review/scrolly2reel-retargeting-graphics-for-social-media-using-narrative-beats).
- **[C53]** YouTube Shorts "viewed vs swiped away". PLATFORM/PRACTICE.
  [Creator Essentials](https://www.creatoressentials.com/glossary/viewed-vs-swiped-away/), [Buffer](https://buffer.com/resources/the-creators-guide-to-youtube-shorts-analytics).
- **[C54]** Claims we do NOT use as facts: the "Facebook study" of up to 40 % more completion with A/V sync (no
  original found); the "85 % watched without sound" figure (no Meta primary source found). VENDOR.
  [OpusClip blog](https://www.opus.pro/blog/best-ai-beat-sync), [The Drum](https://www.thedrum.com/opinion/2022/06/15/platforms-tiktok-sound-centric-creative-has-good-ring-it).
- **[C55]** Sound hooks in the first second (marketing guides, unverified). PRACTICE.
  [Twirl](https://www.usetwirl.com/guides/hooked-50-ugc-video-hooks-to-make-the-first-second-count).
