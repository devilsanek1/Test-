# Sound sync: the owner's two reels, measured (2026-10-30)

The owner, verbatim (2026-10-30, with two phone screen recordings): "And then the next piece after that is the research
distill and practice of syncing the video and shots with with sounds so look here / We already do this and I think
decently okay we just need to be more intentional and educated about this effect and where it make sense to use". The
same day, on the composition study: "I didn’t get once again why you ignored all my references and came up with yours?"

**What this is.** The spine of the sound-sync research: every sync moment in the owner's two reels
(`docs/look/refs_sound_sync/`), named and measured, in reel order (Parts 1-2); what is deliberately NOT synced, the
density, how the sound layers share the work and where the strongest moment is (in each part); the two side by side
(Part 3); then what the reels teach, in 8 rules (Part 4). Every rule starts from a measured reel moment; what we add
from research or from our own films is labelled **(ours)**. The craft lane (`craft.md`, Part A) measured the same
moments independently; the numbers agree to 1-2 ms, and where they differ this file's numbers are the full measurement.

**Rank.** Research notes, the lowest rank on DIRECTION's ladder: nothing here is a rule until the sound-sync distill
integrates it into the docs that own each topic. Methods only: no footage or audio copied (the sheets show small
analysis crops of the reel picture only, without the app's interface), no creator named.

**Sheets.** `reels_timeline_01.png` and `reels_timeline_02.png` (this folder): the waveform with its onsets and level,
the picture-change curve with its events, a strip of frames, and every sync point joined by a line.

**Conventions.** Times in seconds and 60 fps frames: "0.267 s (f16)". 1 f = 16.7 ms. Times are the recording's clock
(the reels were already ~0.3-0.6 s in when each recording started; see 0.2). **Offset = picture time minus sound
time**: "-2 f" means the picture comes 2 frames BEFORE its sound (the sound is late); "+2 f" means the picture is late.
Levels are 0.1 s RMS in dBFS of the recorded sound: good for contrasts inside one reel, not for absolute loudness (the
app normalises playback). Evidence: **MEASURED** (ours, on the files), **INFERRED** (follows from measurements, not
seen directly), **SOURCE** (cited at the end).

---

## 0. How the reels were measured

### 0.1 Material

| | Reel 01 (`01_rec_10-47-55.mp4`) | Reel 02 (`02_rec_10-45-47.mp4`) |
|---|---|---|
| Recording | 10.1 s, 540 x 1174, 60 fps, AAC 44.1 kHz | 13.6 s, same format |
| The reel inside it | a landscape band 540 x 315 px at y 379 (about 16:9.3) | the same band |
| Source frame rate (MEASURED) | ~30 fps: every picture is held for 2 recording frames | ~25 fps: pictures held 2,2,2,2,4 recording frames |
| What is usable | 0-9.52 s (f0-f571); then the phone's control centre is pulled down and the sound stops | all 13.6 s |
| Voice | none | none |

A picture event is therefore known to one source frame: 33 ms in reel 01, 40 ms in reel 02 (MEASURED).

### 0.2 Methods (scripts in `/tmp/sync/reels/`, scratch)

- **Sound onsets:** spectral flux (STFT 2048 / hop 128 at 44.1 kHz, log magnitude, a SuperFlux-style max filter
  [S4]) in five bands (< 120 Hz, 120-400, 400-2 k, 2-6 k, > 6 kHz); peaks picked against a running mean; each onset
  then refined on a 2 ms energy envelope (the half-rise point, to ±1 ms). Each hit's spectral centroid, dominant low
  frequency, sample peak and its time to fall 20 dB. Levels: 0.1 s RMS in five bands. Tempo: autocorrelation of the
  flux, then a comb search for the beat period and phase.
- **Picture events:** per-frame mean absolute luma difference over the band (with the app's like-button corner masked)
  and inside regions (reel 01's cup; reel 02's title words, read frame by frame); a 32-bin histogram difference for
  hard cuts; camera motion from Lucas-Kanade feature tracks and a RANSAC similarity fit per frame (pan, tilt, zoom), in
  pixels of the 540 px band (double them for a 1080 px frame).
- **Where the reels start:** the app's progress bar moves 35.1 px/s (reel 01) and 26.8 px/s (reel 02) across a 497 px
  track, so the reels run about 14.2 s and 18.5 s, and each recording began about 0.3-0.6 s after its reel started
  (MEASURED, ±0.15 s). Both recordings miss the reels' first half second.

### 0.3 The capture trap: a phone screen recording shifts sound against picture

Reel 01's four hard events (three knocks, one click) each sit **163, 176, 166 and 167 ms** after their sound in the
file: one constant **168 ms (10.1 f)**, spread 13 ms, under one frame (MEASURED). A constant that large is not an
editor's choice: 168 ms of sound-before-picture is past the 45 ms point where viewers start to notice and the 90 ms
point where broadcast standards call it unacceptable [S1], and an editor who slipped by hand would not slip by the same
amount four times. The phone's status bar at the end of reel 01 shows a **headphone glyph**: the reel was played to
Bluetooth headphones. The player then holds the picture back by the headphones' latency so that sound and picture meet
at the ears, [S2], while the screen recorder takes the app's sound before that latency (INFERRED from the glyph and the constant;
we found no source on how the recorder timestamps the sound). So the file's sound is early by the Bluetooth latency.

- **Reel 01: corrected.** All sound times below are file time + 0.168 s. Corrected, the four events land on the same
  frame as their sound (-5, +8, -2, -1 ms).
- **Reel 02: the same correction, flagged.** Reel 02 was recorded on the same phone two minutes earlier
  (10:45:47 vs 10:47:55), so we apply the same +0.168 s. Its four hard events sit **51, 74, 148 and 120 ms** after their
  sound in the file (mean 98 ms, spread 97 ms): corrected, the picture comes **1 to 7 f BEFORE** its sound. Without the
  correction it would come 3 to 9 f after. Whichever offset is right, **the four events sit within ±50 ms (±3 f) of one
  common offset**: placed by hand on a 25 fps timeline to about one source frame, not frame-exact like reel 01
  (MEASURED). Both columns are given.

**Lesson (ours):** never judge sync from a screen recording, or while listening over Bluetooth. Judge a render from the
file itself, then once on the phone's own speaker.

---

## 1. Reel 01 (no voice): a mug from above, three knocks, a click, a song

**The film in one line.** A blue enamel mug seen from directly above, framed small right of centre on a dark textured
table. It holds milk; three knocks change what is in it (espresso crema, then foam, then ice); a click cuts to a wider
frame where wired earphones and a small music-player card lie beside the mug; the song starts; the frame holds to the
end while the ice drifts.

### 1.1 Every moment, in order (sound times corrected, +0.168 s)

| # | Time (picture) | We hear | We see | Offset | Type |
|---|---|---|---|---|---|
| 01-0 | 0.000-0.267 s (f0-f15) | the quiet floor, -40 to -45 dBFS | the mug of milk, held | - | the setup (no event in the recording; the reel's own first ~0.3-0.6 s is missing) |
| 01-1 | **0.267 s (f16)** | a dry knock at 0.272 s: sample peak -0.6 dBFS, centroid 1.04 kHz, a pitched body near 940 Hz, down 20 dB in 40 ms | **hard cut**, same framing: milk becomes espresso crema (the brightest-to-darkest change of the reel: band difference 32.7, more than 20 times any frame-to-frame change inside a shot) | **-5 ms (-0.3 f)** | **hit-cut**, a state change in a locked frame |
| 01-1b | 0.86 s and 0.95 s (no picture event) | two faint ticks, ~25 dB under the knocks | nothing | - | sound texture only (not synced) |
| 01-2 | **0.800 s (f48)** | the same knock at 0.792 s (peak 0.0 dBFS, 1.13 kHz) | **hard cut**, same framing: crema becomes foam (a change inside the cup only: 4.5 in the cup box, 2.9 over the band) | **+8 ms (+0.5 f)** | **hit-cut**, state change; the pulse is set: 32 f after the first |
| 01-3 | **1.333 s (f80)** | the same knock at 1.335 s (peak -0.5 dBFS, 1.19 kHz) | **hard cut**, same framing: foam becomes coffee with ice | **-2 ms (-0.1 f)** | **hit-cut**, state change; third on the pulse (32 f again) |
| 01-4 | **1.967 s (f118)** | a click at 1.968 s: a bright tick (centroid 8.6 kHz, peak 0.0 dBFS, gone in 10 ms), its twin 84 ms later (2.052 s, f123) | **hard cut to the reveal**: a wider frame, the mug now left of centre with wired earphones and a music-player card (title, play bar, a pause button) | **-1 ms (-0.1 f)** | **the late fourth + a cause**: it comes 38 f after the third knock, 6 f later than the pulse predicts (f112); an interface click is the trigger |
| 01-5 | 2.449 s (f147), no picture event | **the song enters**: an acoustic guitar intro, 87.5 BPM; the level steps from -44.9 to -18.5 dBFS (**+26 dB**) | the wide frame holds; the ice keeps drifting | 0.481 s (29 f) after the click | **cause, then effect** (the press, then the music it starts); a release with no picture change |
| 01-6 | 2.45-9.52 s (f147-f571) | the song: strums every 0.34-1.4 s, the strongest at 4.52, 5.87 and 8.63 s; level median -21.6 dBFS (-26 to -16) | ONE held frame for 7.6 s (whole reel: no cut after f118); only the ice drifts and slows (cup-box motion 3.4 at 2.4 s, 1.3 at 9 s); the player card never moves | none | **the rest**: the music carries, the picture asks for nothing |

### 1.2 What is deliberately NOT synced (MEASURED)

- **The song's beats and strums** (11 beats, 87.5 BPM, from 2.45 s to the end): no cut, no move, no pop on any of them.
- **The ice's drift**, the only motion after the reveal: it starts with the cut and decays slowly; no sound marks it.
- **The click's twin** (5 f after the cut), the faint ticks after knock 2, and the song's entry itself: sound only.
- **The player card**: a still graphic (it shows a pause button, so "playing", from its first frame); no progress
  moves, nothing on it reacts to the music.
- No whoosh, riser, impact or hit after the song starts. The knocks are never repeated once the music is in.

### 1.3 Density

- **Hard sync points: 4** (three knocks, one click), **all in the first 1.97 s**: 2.0 per second there, 0.42 per second
  over the 9.52 s, and **zero** in the last 7.55 s (79 % of the recording).
- Sound onsets detected: 23. Synced to a picture event: 4 (17 %).
- The four picture events sit 32, 32 and 38 frames apart: three events on two equal steps (0.533 s, 112.5 BPM), then
  one late step.

### 1.4 How the sound layers share the work

No voice. Two layers hand over once:
1. **Sound effects own the opening** (0-2.05 s): four dry, very short events over a near-silent floor, each married to
   one picture change. They are mixed loud: **-10.3 to -10.8 dBFS** per 0.1 s, **11 dB above the song's median**
   (-21.6) and **~33 dB above the floor** between them (MEASURED). Short (40 ms, 10 ms) so that each reads as one
   instant.
2. **The music owns the rest** (2.45 s on): it enters 0.48 s after the click as the click's effect, on no picture
   event, and the picture stops changing. The song is never ducked, never accented.

The hand-over IS the story: the knocks are the barista's beat, the click starts "the track", the coffee is ready.

### 1.5 The strongest moment

**The reveal and the song, 1.97-2.45 s (f118-f147).** It is the largest change in both channels within half a second:
the frame opens from a tight overhead to the full still life (band difference 13.8, the reel's second-largest after the
milk-to-crema flash), the click is the brightest sound of the reel (8.6 kHz, 0 dBFS), and the level then rises 26 dB,
the reel's largest lasting step (each knock jumps more, but is gone in 40 ms) (MEASURED). It is strong because it is **set up**: three equal knocks teach the ear a pulse,
the fourth event arrives 6 f late (a held breath; an expectation bent, then paid [S5]), and it is the first moment the
picture explains itself (earphones + player = "a cinematic frame of a timeless track"). After it, nothing competes.

---

## 2. Reel 02 (no voice): a title over a sunlit field, three soft hits, a drop, a montage

**The film in one line.** A golden-hour field (a tree, a dark bush, hazy hills) with a slow drift; a serif title
appears one word at a time ("The", "Art", "of", "NOTICING", the last in large capitals); a hard cut to a low-angle
shot of wildflowers against the sky on the music's drop; then a sunflower, the same sunflower closer, and a butterfly
on cornflowers, each with a slow handheld sway.

### 2.1 Every moment, in order (sound corrected +0.168 s; the file's raw offset in brackets)

| # | Time (picture) | We hear | We see | Offset (raw) | Type |
|---|---|---|---|---|---|
| 02-0 | before 0.000 s | INFERRED: a hit about 0.35 s before the recording (its tail decays from -31 to -38 dBFS over 0-0.6 s, the same curve as the later hits) | "The" is already on at f0 | - | **word-on-hit** (the first, unrecorded) |
| 02-0b | 0.000-0.750 s | a quiet bed: a held tone near 1.6 kHz and 3 kHz plus low air, -37.5 to -38.3 dBFS between hits | the field drifts: a slow tilt, 3-6 px/s | - | the floor |
| 02-1 | **0.750 s (f45)** | a soft low hit at 0.867 s: centroid 500 Hz, body near 205 Hz, sample peak -6.8 dBFS, a 0.11 s tail | **"Art" pops on**, whole, in one frame (no fade, no motion) | **-117 ms (-7.0 f)** (raw +51) | **word-on-hit** |
| 02-2 | **1.883 s (f113)** | the same hit at 1.977 s: 517 Hz, -6.1 dBFS, a 0.19 s tail | **"of" pops on** | **-94 ms (-5.6 f)** (raw +74) | **word-on-hit**; pulse ~1.1-1.2 s |
| 02-3 | **3.150 s (f189)** | the hit at 3.170 s: the **lowest and loudest** of the three (centroid 388 Hz, body 167 Hz, -5.3 dBFS, a 0.20 s tail) | **"NOTICING" pops on**, the biggest word (large capitals, a second line) | **-20 ms (-1.2 f)** (raw +148) | **word-on-hit**: the biggest word gets the biggest, lowest hit |
| 02-4 | 3.15-4.38 s (74 f) | nothing new: the hit decays to **-41.8 dBFS in the last 0.1 s before the drop, the quietest moment of the reel**; no riser | nothing new in the title; the drift becomes a sideways pan that **speeds up 4x** (from ~2 px/s at 2.7 s to ~8 px/s at 4.3 s) | - | **the hold**: silence falls while the picture leans forward |
| 02-5 | **4.383 s (f263)** | **the drop** at 4.431 s: bass (body 97 Hz) and keys enter together, sample peak -4.0 dBFS; the level jumps from -41.8 to -10.0 dBFS (**+32 dB**) | **hard cut** to a low-angle shot of wildflowers against the sky (band difference 62.8, the largest of the reel; the title is cut away, not animated out); the new shot moves at once (handheld, up to 34 px/s) | **-48 ms (-2.9 f)** (raw +120) | **drop-cut** (the release) |
| 02-5b | 6.35 s (in-shot) | a bright chime-like accent (> 6 kHz), the reel's brightest after the drop | the handheld sway turns back (the pan crosses zero at ~6.05 s, then runs left up to 33 px/s) | the turn is 0.13-0.30 s before it | **not a sync point** (a handheld turn near an accent: chance-level) |
| 02-6 | **7.617 s (f457)** | the keys' 8th-note pulse (~0.21 s); the next chord change (bass, body 108 Hz) comes at 8.048 s | **hard cut** to one sunflower, medium, centred on deep blue sky; the frame slides sideways (up to 40 px/s) and settles by ~7.95 s | to the chord change: **-431 ms (-26 f)** (raw -263) | **cut with the flow**: it comes a quarter to half a second BEFORE the change; the slide settles near it (INFERRED) |
| 02-7 | **9.450 s (f567)** | mid-phrase: an 8th-note onset at 9.546 s, no chord change | **punch-in**: the same sunflower, much closer (same subject, same axis) | to the 8th: -96 ms (-5.8 f) (raw +72) | **cut with the flow** (an 8th falls every 0.21 s, so any cut is within 0.1 s of one; chance-level) |
| 02-8 | **11.383 s (f683)** | the next **chord change** at 11.465 s: the strongest low accent after the drop | **hard cut** to a butterfly on cornflowers, warmer and darker | **-82 ms (-4.9 f)** (raw +86, inside the title hits' 51-148 ms) | **cut on the change** (as synced as the title hits) |
| 02-9 | 11.38-13.6 s | the music settles (median -17.9 dBFS from 7.6 s, -14.2 in the drop's shot) | a slow pan left with a slight push-in (10-20 px/s) | none | **the rest** |

The title hits' spacing grows a little: **1.110, 1.193, 1.261 s** (66.6, 71.6, 75.7 f) of sound; a slight
ritardando, the longest gap leading into the drop (MEASURED). The music after the drop: keys and bass, an 8th-note
pulse of 0.21-0.22 s (quarter ≈ 140 BPM), the chord changing every two bars (4.43, 8.05, 11.47 s: 3.62 and 3.42 s
apart). No vocals.

### 2.2 What is deliberately NOT synced (MEASURED)

- **The music's 8th-note pulse** (36 detected onsets after the drop): the three cuts after the drop come 3.23, 1.83 and
  1.93 s apart (194, 110, 116 f), which is 7.6, 4.3 and 4.6 beats: no steady count of beats or bars.
- **The chord change at 8.05 s** gets no cut (cut 02-6 comes before it); the punch-in (02-7) sits on no change.
- **All in-shot motion**: the handheld sway, the flowers in the wind, the butterfly. No sound follows any of it.
- **The title's exit**: the words do not leave; the drop's cut takes them away.
- No whooshes on cuts, no risers before the drop, no impacts on the montage cuts.

### 2.3 Density

- **Hard sync points: 4 recorded** (three words, the drop) plus the unrecorded "The": **all in the first 4.38 s**,
  0.9 per second there. After the drop: **one** probable (02-8, on a chord change) in 9.2 s, 0.11 per second.
  Whole recording: 5 in 13.6 s, 0.37 per second.
- Sound onsets detected: 40. Synced to a picture event: 5 (13 %).

### 2.4 How the sound layers share the work

No voice. **The title stands in for the voice**: four words, each "said" by one soft low hit, the hits doing what a
voice's stressed syllables do (MEASURED: one hit per word, the biggest word on the biggest hit). Then the layers hand
over once, as in reel 01:
1. **Hits own the opening** (0-4.38 s): soft and low (centroid 390-520 Hz, tails 0.11-0.20 s), only **~21-23 dB above
   the bed** (-15.2 to -17.4 vs -38). Softer than reel 01's knocks, to match a calm subject.
2. **The music owns the rest**: it arrives all at once on the drop's cut, 5-7 dB louder than any hit, then settles
   (-10.7 in the first 0.5 s, -14.2 in the drop's shot, -17.9 after): the energy peaks at the release and is let
   down gently.

### 2.5 The strongest moment

**The drop, 4.383 s (f263).** The largest change of the reel in both channels on one frame: the biggest picture change
(62.8: a warm, dim, still landscape becomes a saturated sky full of moving flowers) and the biggest level step (+32 dB)
(MEASURED). It is strong because of what comes before: three words have taught a pulse of ~1.2 s and promised a
fourth event; the last gap is the longest; the sound falls to its quietest point (-41.8 dBFS) while the picture's drift
speeds up 4x; and the title, finished, has nothing more to say. The silence and the slight delay are the build. There
is no riser: **the quiet does the work a riser would** [S6].

---

## 3. The two reels side by side (MEASURED unless marked)

| | Reel 01 | Reel 02 |
|---|---|---|
| Shape | count-in (3 hits) → late fourth + reveal → release (song) → rest | (first word) + count-in (3 words) → hold → drop → montage at rest |
| Count-in spacing | 0.533, 0.533 s (32, 32 f) of picture | 1.11, 1.19, 1.26 s (67, 72, 76 f) of sound |
| The fourth event | 6 f later than the pulse predicts | the longest gap, +68 ms on the one before |
| Sync accuracy | 0 f (±0.5 f) after correction | within ±3 f of one common offset |
| Hard sync points | 4, all in 1.97 s | 4 recorded (+1 inferred), all in 4.38 s; then 1 in 9.2 s |
| After the release | 0 cuts in 7.55 s | 3 cuts in 9.2 s, one on a chord change |
| Hit sound | dry, bright-ish knock (1.0-1.2 kHz), 40 ms to -20 dB, ~0 dBFS peaks | soft low hit (390-520 Hz), 0.11-0.20 s tails, -5 to -7 dBFS peaks |
| Floor between hits | -40 to -45 dBFS | -37.5 to -38.3 dBFS |
| Release step | +26 dB (song, 0.48 s after the click) | +32 dB (on the cut) |
| Sync-type count | hit-cut x3, click-reveal x1, cause→effect x1 | word-on-hit x3 (+1), drop-cut x1, cut-on-change x1 |
| Whooshes / risers / sync on in-shot motion | none | none |

**One shape (INFERRED from both):** a **count-in** of hits, each married to one discrete picture change, over a quiet
floor; a **late or held fourth**; a **release** where the picture and the full music change together (+26-32 dB);
then a **rest** where the music carries and the picture holds or cuts loosely. All the hard sync is spent in the first
2-4.4 s.

---

## 4. What the owner's reels teach (8 rules)

Each rule: the measured basis in the reels, then what it means for our films. "For us" lines are **(ours)**: our
films always carry a voice, which neither reel has, so the voice's place in each rule is our inference.

**R1. Sync is a spend, not a texture: put it where the film asks for attention, then stop.** Both reels spend every
hard sync point in the first 2-4.4 s (2.0 and 0.9 per second there) and almost none after (0 and 0.11 per second); of
63 detected sound onsets, 9 meet a picture event (14 %). *For us (ours):* hard sync belongs to the hook (frame 0 to
~3 s) and to the one payoff; the middle of the film is carried by the voice and a bed that asks for nothing. Our v5
locked 10 of 11 cuts to beats across the whole film (`docs/sound_plan.md`); the reels say that is too much sync in
the middle. A cut can sit inside the music's flow without landing on a beat.

**R2. Teach a pulse with three, then bend the fourth.** Reel 01: three hit-cuts 32 f apart, the fourth event 6 f
late; reel 02: three word-hits 1.11-1.26 s apart, the gaps growing, the drop after the longest. Three equal events make
the ear predict; a small delay on the fourth makes the arrival feel bigger [S5]. *For us (ours):* a count-in of 3
picture changes on 3 sound events (e.g. three quick state changes of the thread object), each 0.5-1.2 s apart, then
the payoff 4-8 f late (0.07-0.13 s) or on the longest gap. Never a fourth equal hit: it turns the count into a loop.

**R3. One sound, one discrete change, on the same frame.** Every hard sync in both reels (Chion's "synch point" [S3])
pairs one short sound with one discrete picture change (a cut, a state swap, a word appearing whole), never with a gradual move: in reel 01 within
±0.5 f, in reel 02 within ±3 f of one common offset. *For us (ours):* sync the FIRST FRAME of a change to the sound's
onset (the half-rise, not the peak); the picture may come up to 1-2 f early, never late (late sound is the forgiving
side [S1]; editors often cut a frame or two early so a cut feels on time [S7]). Gradual moves do not get hits; their start or landing can sit inside the phrase.

**R4. Silence is the riser.** Neither reel uses a whoosh or a riser. Before each release the sound gets quieter: reel
01's floor sits ~33 dB under its knocks; reel 02 falls to its quietest moment (-41.8 dBFS) right before the drop,
while its picture drifts faster. The release is then a +26 to +32 dB step. *For us (ours):* before the payoff, take
something away (pull the bed down, leave a 0.2-0.5 s gap in the voice) instead of adding a swell; the contrast is the
impact, and it keeps "cinematic but subtle" (playbook).

**R5. The release changes picture and sound together, then the music carries.** Reel 02's drop: the largest picture
change and the largest level step on one frame. Reel 01: the reveal, then the song as its effect 29 f later. After
it: one held frame for 7.6 s (01), or cuts every 1.8-3.2 s that follow the music's flow and its chord changes, not its
beats (02). *For us (ours):* one release per film, at the payoff line; after it, fewer events, longer holds, and the
bed (not SFX) carries the energy. If a cut after the release is synced, sync it to a change in the music's harmony or
phrase (once), not to the pulse.

**R6. The hits match the subject and are mixed above the music.** Reel 01 (a quick, playful process): dry 1 kHz
knocks, 40 ms long, mixed 11 dB above its song. Reel 02 (a calm title): soft low hits, 0.11-0.2 s tails, -5 to -7
dBFS. The biggest word gets the lowest, loudest hit (167 Hz body vs ~200; -5.3 vs -6.8 dBFS). *For us (ours):* choose
each hit's colour from the thing it marks (light object: short and bright; a weighty idea: low and soft); scale the
hit with the importance of the change; in the hook, a sync hit is a foreground event, never buried in the bed (our
voice stays on top; a hit sits between the voice's words).

**R7. Words land whole, one at a time, on hits.** Reel 02's title is the reel's only "voice": each word pops on in one
frame (no fade, no motion), on its own hit. *For us (ours):* our voice already says the words; on-screen words in the
hook pop whole on the voice's stressed syllable (our captions already pop in place: CLAUDE.md), and a separate hit is
only for the one word that carries the core line. Never a hit on every caption.

**R8. A sound can be the cause of what we see.** Reel 01's click is an interface sound (8.6 kHz, two ticks 84 ms
apart) on the cut that reveals the player; the song follows 0.48 s later as its effect. The sound tells the story (a
button pressed, the music starts) without a word. *For us (ours):* a phone-like sound as the trigger of the next
state (a tap, a toggle, a send) is exactly the playbook's "sounds people link with something good on their phone"; put
it on the reveal's first frame and let its consequence (music in, light on, the next scene) follow 0.3-0.5 s later.

**What the reels do NOT do (as instructive as what they do):** no whooshes, no risers, no sound on in-shot motion, no
hit after the release that is not also a change of shot, no beat-locked montage, no mickey-mousing [S8].

---

## 5. Sources

Most page fetches are blocked from this sandbox, so these were read through search-result summaries ("summary").

- **[S1]** ITU-R Recommendation BT.1359-1 (1998), *Relative timing of sound and vision for broadcasting*: detectability
  about +45 ms (sound early) to -125 ms (sound late); acceptability about +90 to -185 ms. STANDARD (summary).
  https://www.itu.int/dms_pubrec/itu-r/rec/bt/R-REC-BT.1359-1-199811-I!!PDF-E.pdf
- **[S2]** S. Coyle's AirPods latency test (2016), as linked by Pixel Envy: iOS offsets Bluetooth delay for media
  playback, video included, by starting the picture later than the sound; it cannot for live content. PRACTICE
  (summary). https://pxlnv.com/linklog/airpods-latency/ ; a second test: https://www.podfeet.com/blog/2016/12/airpods-lag-or-no-lag/
- **[S3]** M. Chion, *Audio-Vision* (Columbia University Press, 1994): a "point of synchronization" is a salient
  moment where a sound event and a visual event meet in synchrony; synchresis is the weld it makes; analysis starts
  by locating the synch points and how they are distributed. BOOK (summary).
  https://www.filmsound.org/chion/sync.htm ; https://sonicfield.org/wiki/point-of-synchronization
- **[S4]** S. Böck and G. Widmer, "Maximum filter vibrato suppression for onset detection" (SuperFlux), DAFx-13,
  2013: the onset method used here. STUDY. https://www.dafx.de/paper-archive/2013/papers/09.dafx2013_submission_12.pdf ;
  reference code https://github.com/CPJKU/SuperFlux
- **[S5]** D. Huron, *Sweet Anticipation: Music and the Psychology of Expectation* (MIT Press, 2006, ISBN
  9780262582780): the ITPRA theory; expectation, delay and its resolution as a source of pleasure. BOOK (summary, via a
  review). https://leonardo.info/reviews_archive/july2007/sweet_zilberg.html
- **[S6]** R. T. Solberg and A. R. Jensenius, "Pleasurable and Intersubjectively Embodied Experiences of Electronic
  Dance Music", *Empirical Musicology Review* (2016/2017): in a breakdown the texture thins and the bass goes; dancers
  move less there and most at the drop. STUDY (summary). https://doaj.org/article/a06c41eeed7e4b52a9098bef18260a50
- **[S7]** Editors' consensus on cutting to music: a cut a frame or two before or after the beat often "marries" better
  than one exactly on it; feel over arithmetic. PRACTICE (forum, summary).
  https://community.adobe.com/t5/video-lounge-discussions/editing-with-music/m-p/12801378/highlight/true
- **[S8]** "Mickey Mousing": music that tracks every on-screen action, long criticised as excess when used throughout
  (Cocteau called it vulgar, 1954); strongest when saved for key moments. PRACTICE (summary).
  https://en.wikipedia.org/wiki/Mickey_Mousing ; https://www.studiobinder.com/blog/mickey-mousing/

## 6. Files and reproduction

- Sheets: `reels_timeline_01.png`, `reels_timeline_02.png` (this folder).
- Scratch (not committed): `/tmp/sync/reels/` (`audio_an.py`, `refine.py`, `onsets2.py`, `tempo.py`, `pic_an.py`,
  `r3/glob_motion.py`, `r3/levels.py`, `r3/beatgrid.py`, `r3/hitchar.py`, `r3/pairs.py`, `r3/zoom.py`), notes in
  `/tmp/sync/reels/notes/`.
