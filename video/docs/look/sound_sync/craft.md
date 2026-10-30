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
rarely shown), **EST** (our estimate). Sources [C1]-[C..] are listed at the end with URLs. Most page fetches were
blocked from this sandbox (ENOTFOUND), so many sources were read through search-result summaries; those are marked
"(summary)".

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
