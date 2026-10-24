# Sound plan: php2shell explainer (70.7 s loop)

Owner: sound stream. Lane: `audio/**`, `docs/sound_plan.md`, `docs/sound_credits.md`.
Sources and licences: `docs/sound_credits.md`.

## TL;DR for the orchestrator

- **Final audio:** `audio/mix.wav` is 48 kHz stereo, 24-bit, exactly 70.700 s. It measures **-14.0 LUFS integrated and -1.2 dBTP true peak** (ffmpeg ebur128 agrees), with LRA 1.8 LU. It uses the recommended bed **marimba** and the curated cue sheet `audio/cues.json`. It loops seamlessly: the music, the SFX tails and the master dynamics are all circular.
- **Recommended bed: `marimba`.** Second choice: `lofi`. Third: `pizzicato` (reasons below).
- **To re-mix after the scenes are timed:** edit `audio/cues.json`, then run
  `python3 audio/mix.py --music marimba --out audio/mix.wav` (about 15 s).
  To keep only the core cues: `--prio A`. To try another bed: `--music lofi|pizzicato|none`.
- `audio/vo_clean.wav` is sample-aligned with `assets/vo.mp3` (cross-correlation lag 0), so every time in `assets/timing.json` holds.
- Remotion: copy `audio/mix.wav` into `public/` (the orchestrator's lane) and use it in place of `vo.mp3` as the single audio track.

## 1. Reference audio analysis (`assets/ref/reference.mp4`)

| Measure | Value |
|---|---|
| Format | AAC-LC, mono, 48 kHz, 182 kb/s, 31.55 s |
| Integrated loudness | **-14.0 LUFS**, true peak -2.0 dBTP, LRA 2.7 LU |
| Music under the voice | **None.** No sustained tonal partials that are independent of the speech f0, at any time. |
| SFX | **None found.** No transients outside the speech envelopes. Every gap between phrases is digital zero (frame RMS of -180 dB). |
| Pauses | Hard-gated to true silence: 0.5 to 1.0 s gaps at 5.3, 7.4, 12.5, 15.9, 23.0-23.8 and 26.9 s, plus a **1.3 s silent tail** (30.24 to 31.55 s) that makes the loop. |
| Bandwidth | Voice up to about 14 kHz (AAC low-pass). A clean, close, expressive narrator, probably a TTS or a heavily edited read. |

**Takeaway.** The reference is a bare, loud, clean voice. Its "punch" comes from the edit and the animation, not from sound.
So the bed and the SFX must stay discreet: they add warmth and rhythm, they never compete. Hence the decisions below:
the music sits 12 dB or more under the voice at every speaking moment, and the SFX are quiet and sparse.

## 2. VO analysis and treatment (`assets/vo.mp3` -> `audio/vo_clean.wav`)

| Measure | Source | Notes |
|---|---|---|
| Format | MP3 192 kb/s, mono 44.1 kHz, 70.64 s decoded | 25 ms container offset, which the decoder strips. t=0 matches `timing.json`. |
| Loudness | -14.6 LUFS, TP -1.7 dBTP, LRA 2.4 LU | Already leveled and limited. |
| Noise floor | about -74 dBFS (quietest 5 % of 20 ms frames). 13 runs of digital silence (0.41 s in total) | Clean. No denoise needed (it would only add artifacts). |
| Low end / rumble | 20-60 Hz is -46 dB and 60-100 Hz is -26.5 dB relative to the full band | No rumble. A high-pass at 70 Hz is just hygiene. Male voice f0: median 136 Hz (p10-p90 is 105-234 Hz). |
| Sibilance | 5-10 kHz p99 sits 5.6 dB below the 200 Hz-3 kHz body p99. In the reference that gap is 8.5 dB. | About 3 dB hotter than the reference, so a gentle de-ess is justified. |
| Clicks | 59 "spikes" flagged in the **source** | They are either -80 dBFS gate edges or natural stop-consonant bursts (t, k, p). They are not digital clicks, so we leave them alone. |

Chain (`audio/tools/vo_clean.py`): soxr VHQ to 48 kHz, then DC removal and a 4th-order Butterworth high-pass at 70 Hz.
Next comes a **split-band de-esser**: only the band above 5 kHz is turned down, on sibilant peaks only. Threshold: the 95th percentile
of 5-10 kHz energy, 4:1, at most 5 dB. Result: active on 15 % of speech, 1.7 dB on average when active.
Then a **light RMS leveler**: 2:1 above -15 dBFS, 6 dB knee, 15/150 ms. Result: 1.5 dB mean gain reduction, p95 2.8 dB, max 3.9 dB.
Last, the stem is normalised to **-17 LUFS (mono)**, which is about -14 LUFS when centred in stereo, and padded to 70.7 s.
After de-essing, sibilance p99 sits 6.5 dB under the body (it was 5.6 dB). True peak is -1.4 dBTP.
The read stays natural: no gating, no EQ colour, no noise reduction.

## 3. Music: three original beds

All three beds are 70.700 s long, 48 kHz stereo and mastered to -20 LUFS (`audio/music_<name>.wav`), with MIDI in `audio/music_<name>.mid`.
Every note is a real recorded instrument (CC0 samples, or a permissive SoundFont for lofi). Pitch-shifting is done by
soxr resampling from the nearest sampled note. Sample note names were checked by pitch detection: both Versilian libraries
use middle C = C3. The kalimba keys are re-tuned per key from the detected pitch.

### Shared structure: a tempo grid that lands the story beats on bar lines

70.7 s divided into 28 bars gives **2.525 s per bar**, which is 95.05 BPM in 4/4. On this grid the story beats fall on downbeats:

| Bar | Time | Story beat |
|---|---|---|
| 1 | 0.00 | Intrigue: "Government websites… switched themselves off" |
| 5 / 9 | 10.10 / 20.20 | Setup ("Fixing a bug…") / discovery ("Then, in August…") |
| **13** | **30.30** | **Leak build**: the bed thins out 0.3 s before "Except," (30.6) |
| **15** | **35.35** | **Urgency**: Cloudflare numbers (35.6-43.2) |
| **18** | **42.93** | Suspension: "…millions by evening. Nobody knows yet…" |
| **19** | **45.45** | **Breath**: "So now comes step two, the slow one" (45.45) |
| 21 / 25 | 50.50 / 60.60 | Steady rebuild / gentle unresolved close |
| 28 to 1 | 70.70 to 0 | The last bar is a suspended dominant that resolves into bar 1 across the loop point |

**Loop design.** Each bed is rendered with an 8 s tail, and the tail is folded back onto the start, so the audio is
circular. Notes ringing at 70.7 s continue into t=0, and reverb carries across the cut. The bus compressor and the limiter run
with a circular pre-roll. The last bar ends on the dominant (sus4), with pickup notes into bar 1, and bar 1 has the same density as bar 28.
The seam measures as a normal musical downbeat, not an edit (see section 6).

**Voice pocket.** Each bed gets a static carve: about -4 dB around 2.2 kHz (wide, roughly 1-4 kHz), smaller dips at 1.2 and 3.8 kHz,
and -1.5 dB at 160 Hz (the voice f0). Bass lines sit mostly under 100 Hz. Melodic material sits around 400 Hz-1 kHz, plus sparkle above 4 kHz.
Measured share of energy in 1-2 kHz / 2-4 kHz, relative to the full band: pizzicato -17.9 / -26.7 dB, lofi -23.9 / -23.9 dB,
marimba -19.2 / -26.5 dB. The VO's own 1-4 kHz share is -11.5 dB.

### Bed 1: `pizzicato`, "Curious pizzicato + felt piano"

D minor, 95.05 BPM, 4/4. Instruments: string-section pizzicato (violins, violas, celli, solo contrabass), VSCO upright
piano at its softest layer (low-passed to 3.2 kHz as a felt piano), plus cello and viola tremolo for the tension and glockenspiel sparkles.
Progression: Dm-Bb-Gm-Asus4/A, then F-C/E-Dm-Bb for the discovery, then a Gm pedal climb to A7b9 for the leak.
- 0-10 s: a tip-toe pizz motif and a "question" figure answered by the felt piano.
- 10-30 s: a 3+3+2 walking pizz figure with offbeat celli. The discovery phrase moves to F major colour, with a glock "ping" on "found it".
- 30.3 s: violins drop out on "Except". A repeated D creeps in, a low chromatic piano climb rises (G1 to C#2), and the
  viola tremolo and the D2 cello pedal swell. In bar 14 the 16ths crescendo.
- 35.35-42.9 s: driving 8th-note bass, 16th ostinato in the violins, viola tremolo, low piano octaves.
- 42.9 s: everything stops on an A7sus4 chord. 45.45 s: a single rolled Bbmaj7 on the felt piano (the breath). A soft pizz re-entry follows at 49 s.
- 60.6-70.7 s: a falling felt-piano line over Gm7-Bbmaj7-Gm6-Asus4, with a pizz pickup into bar 1.
Section loudness (LUFS, 1 s): open -21.2, setup -18.1, discovery -17.0, **leak -13.5, Cloudflare -13.5**, suspension -21.2,
**breath -24.0**, rebuild -18.9, close -20.2.
Character: witty, "investigative", the classic explainer palette. Risk: pizzicato reads as cliché, slightly cartoonish
against a story where real sites went offline.

### Bed 2: `lofi`, "Lo-fi plucks + soft kick"

F minor, **71.29 BPM**, swung 16ths. There are 22 bars: 4/4, except **two 2/4 "hiccup" bars**. Bar 11 is the beat before "Cloudflare". Bar 15 is the breath.
With them every beat lands on a downbeat: 30.30, 35.35, 42.93, 45.45, 50.5 and 60.6 s.
Instruments come from GeneralUser GS through TinySoundFont: tine electric piano, nylon-guitar plucks, upright bass, and a jazz-kit kick, side stick and hats.
The shaker is a real VCSL recording. The lo-fi bus adds tape wow and flutter at loop-periodic rates (35/70.7 Hz and 375/70.7 Hz), so the seam stays continuous.
It also adds soft tape saturation, a 9 kHz low-pass, and seeded hiss and crackle about 66 dB down.
- Chords: Fm9-Dbmaj7-Bbm9-C7sus4, then Abmaj7-Eb/G for the discovery.
- On "Except" the drums cut out and the keys' low-pass closes. In the 2/4 bar, C7b9 stabs and a pedal climb lead into the urgency:
  four-on-the-floor soft kick, 16th hats, 8th-note bass pedal, off-beat EP stabs, 16th pluck arpeggios.
- 42.9 s: hard stop on C7sus4. 45.45 s: a lone Dbmaj7 (the breath). Then the groove comes back. Bar 22 drops the drums so the loop lands on the drum-less intro.
Section loudness: open -18.1, setup -15.5, discovery -15.9, leak -17.0 (the drop), **Cloudflare -13.8**, suspension -20.2,
**breath -21.7**, rebuild -15.6, close -17.8.
Character: the most "TikTok-native", calm and modern. It has less narrative contrast than the other two. The drums add low-end weight that phone speakers lose anyway.

### Bed 3: `marimba`, "Minimal kalimba + marimba ostinato" (**recommended**)

E minor, 12/8 with dotted quarter = 95.05 (the same 28-bar grid). An interlocking, mbira-style kalimba: a low "pulse" thumb on dotted quarters
and a high "answer" thumb on the off-eighths, alternating patterns bar by bar. All instruments are real CC0 recordings: VCSL Tanzanian mbira (re-tuned per key),
VCSL marimba on soft mallets as the bass, a VSCO cello drone, a VCSL shaker and a bass-drum "heartbeat".
Progression: Em(add9)-Cmaj7-G-D/F#, then C-G/B-Am7-Dsus4 for the discovery, then Cmaj7 to B7 for the leak.
- On "Except" the kalimba stops. A single repeated marimba B creeps in from mid-bar, the E2 cello pedal swells, and in bar 14 the
  kalimba comes back as 8ths with a crescendo, with the shaker.
- 35.35-42.9 s: running marimba 8ths on an E pedal, full kalimba ostinato, shaker 8ths, a soft heartbeat kick on beats 1 and 3,
  and the cello drone under Em, Em/D and Cmaj7#11.
- 42.9 s: B7sus4 marimba chord, one kick, and the cello moves to B. 45.45 s: a sparse kalimba with only two notes per bar (the breath).
- Close: the ostinato thins over Am7-Cmaj7-Am7-**Bsus4**, with a three-note marimba pickup that resolves into Em at bar 1 across the loop.
Section loudness: open -17.3, setup -16.5, discovery -16.8, **leak -18.4 (the drop) building to Cloudflare -13.8**,
**suspension -24.9**, breath -23.6, rebuild -17.3, close -18.1.

### Recommendation: `marimba`

1. **Timbre matches the visuals.** Wood mallets and a hand-plucked kalimba are the audio equivalent of loose ink lines and flat, misregistered fills: handmade, warm and slightly imperfect.
2. **It stays out of the voice.** Marimba and kalimba are dominated by their fundamental and decay fast, so they leave little sustained energy in 1-4 kHz. Measured during speech: median 18.6 dB under the voice, minimum 12.8 dB.
3. **It has the clearest dramatic arc with the least loudness.** The leak is a drop followed by a build, which reads as tension and not just "louder". The urgency gets a heartbeat. The suspension and the breath are near-silent. The 12/8 lilt is "calm and smart", and the ostinato gives a pulse for the edit to cut on.
4. All its samples are CC0, with no SoundFont provenance caveat.

Use **`lofi`** if the edit ends up faster and more "feed-native". Use **`pizzicato`** only if the visual tone turns playful.

## 4. Mixing and mastering (`audio/mix.py`)

```
python3 audio/mix.py --music marimba --out audio/mix.wav              # cues default: audio/cues.json
python3 audio/mix.py --music lofi --cues audio/cues_placeholder.json --out audio/demo_lofi.wav
python3 audio/mix.py --make-cues audio/cues_placeholder.json          # placeholder cues from timing.json
options: --duck-db 12  --music-lu 6  --min-gap 12  --sfx-bus-db 9  --sfx-duck-db 3  --lufs -14  --ceiling -1.0
         --prio A  --no-wrap  --stems (writes _stem_vo/_stem_music/_stem_sfx next to --out)
```
Cue format: `[{"t": 35.62, "sfx": "pop_low", "gain_db": -12, "pan": 0}]`. Optional keys: `offset`, `dur`, `prio`, `why`.

Signal flow:
- **VO**: `vo_clean.wav`, centred.
- **Music**: set 6 LU under the voice, then side-chain ducked by the VO, then a margin guard.
  The duck: speech detector on 20 ms RMS, 200 ms hold, 20 ms look-ahead, **30 ms attack, 250 ms release, -12 dB**.
  The margin guard compares 400 ms K-weighted momentary loudness of voice and music. Where the ducked bed would still come within 12 dB of the voice (the leak crescendo, the urgency),
  it adds a smoothed extra reduction (60 ms attack, 500 ms release). Effect: the music never masks a word, but it breathes up in real pauses.
- **SFX bus**: a 2.5 kHz dip of 2 dB, a 3 dB duck while the voice speaks, and 9 dB make-up. Each cue's `gain_db` is applied to the file, which peaks at -6 dBFS.
  With these defaults, a pop at -12 dB lands about 15 dB under the voice.
- **Master**: 25 Hz HPF, then glue compression (1.5:1, -18 dB threshold, 20/200 ms, circular pre-roll), then gain to -14 LUFS, then a
  look-ahead **true-peak limiter** with a 4x-oversampled detector and a -1.2 dB ceiling. It iterates until the loudness is within 0.1 LU.
- **Loop safety**: the duck envelope and the limiter release are computed circularly. SFX tails that run past 70.7 s are wrapped onto
  t=0 (for example the closing pencil line). The music beds are circular, so no fades are needed: a fade would create a dip at the seam.

### Measured results

| File | Cues | Integrated | True peak | Voice over music during speech (median / p5 / min) | Guard (max extra / active) |
|---|---|---|---|---|---|
| `audio/mix.wav` (marimba) | `cues.json` (26) | **-14.0 LUFS** | **-1.2 dBTP** | 18.6 / 13.8 / **12.8 dB** | 9.3 dB / 47 % |
| `audio/demo_marimba.wav` | placeholder (28) | -14.0 | -1.2 | 18.6 / 13.8 / 12.8 | 9.3 dB / 47 % |
| `audio/demo_lofi.wav` | placeholder | -14.0 | -1.2 | 18.3 / 13.7 / 12.8 | 9.1 dB / 53 % |
| `audio/demo_pizzicato.wav` | placeholder | -14.0 | -1.2 | 20.1 / 14.1 / 12.5 | 10.6 dB / 42 % |

ffmpeg `ebur128=peak=true` agrees on every file (I = -14.0 LUFS, true peak -1.2 dBFS). LRA is 1.7-1.8 LU: dense, as social audio should be.
"During speech" means 400 ms frames where the voice is within 6 LU of its integrated level. Frames that straddle sentence pauses
are excluded on purpose: there the bed is meant to lift.

## 5. SFX kit (`audio/sfx/*.wav`)

All files: 48 kHz, 24-bit stereo, trimmed, **peak -6.00 dBFS**, 2 ms fade-in, 10-300 ms fade-out, 20 Hz DC high-pass, first and last samples exactly 0.
Rebuild with `python3 audio/tools/make_sfx.py`.

| Name | Dur (s) | Source | Use |
|---|---|---|---|
| `pencil_scratch_short` | 0.22 | synth: graphite-on-paper friction (band-passed noise, fibre "tooth" grains, speed-dependent brightness, paper body) | one stroke: tick mark, underline |
| `pencil_scratch_medium` | 0.57 | synth, 3 hatch strokes | a shape being sketched or hatched |
| `pencil_scratch_long` | 1.55 | synth, continuous contour | a drawing building, an un-build or redraw |
| `pop_low` / `pop_mid` / `pop_high` | 0.12 each | synth: sine "bloop" with a fast pitch drop (260 / 400 / 620 Hz) and a soft transient | object pop-ins with overshoot. Low for big objects, high for labels. |
| `bubble_pop` | 0.07 | synth: rising Minnaert-style bubble chirp | keyword highlight box wiping in (use sparingly) |
| `card_flip` | 0.41 | synth: swish with flutter and a soft landing tap at 0.29 s | the 3D Y-axis card flip (put the tap on the edge-on frame plus 0.29 s) |
| `paper_flip` | 0.42 | synth: page-turn flutter with crinkle | alternate transition, paper props |
| `whoosh_soft` | 0.73 | synth: air sweep, pans L to R | slides, camera moves, time jumps |
| `click_light` | 0.02 | synth: modal click | cursor, small UI element |
| `switch_toggle` | 0.10 | synth: two-stage lever | "switch it off" |
| `power_off_thunk` | 1.10 | synth clack and thump, dying 120 Hz to 30 Hz hum, plus a real VCSL bass drum for body | lights out |
| `alert_ping` | 1.60 | real VCSL hand chimes (a rising fifth) | gentle alert or notification |
| `typing_tick` / `typing_burst` | 0.05 / 1.20 | synth: key click and bottom-out "thock", human timing | code, installing a fix |
| `counter_ticker` | 1.98 | synth: mechanical counter accelerating from 8 to 26 ticks/s, with a stop clack | numbers counting up |
| `crowd_murmur` | 4.00 | made from the project VO: reversed, pitch-shifted, muffled, unintelligible | very light crowd or "the internet" |
| `door_knock` | 0.69 | real VCSL cajon (3 soft hits) and a synth door body | break-in attempts, "knock knock" |
| `handle_rattle` | 0.65 | synth: metal handle jiggle with latch | break-in attempt |
| `lock_click` | 0.13 | synth: latch click and clunk | "got in", "locked" |
| `coin_chink` | 0.66 | synth: 5 coin impacts (inharmonic modal metal) | money, cost, hosting bills |
| `ding` | 1.78 | real VCSL glockenspiel (about 2.1 kHz) with a touch of triangle | discovery or "aha" |
| `riser_leak` | 3.64 | real VSCO suspended-cymbal crescendo, rising filtered noise and a rising two-voice tone. **Peak at the very end.** | the leak build. Start it at `peak - 3.64` (31.71 for a 35.35 peak). |

Click check: no unintended discontinuities. The detector flags only the designed attacks of click-type sounds
(the transients in typing, ticker, knock and rattle), and never at the file edges.

## 6. Listen-proof by analysis (`audio/tools/qc.py`)

| Check | Result |
|---|---|
| Clipping | 0 samples at or above 0.999 in every deliverable. Bed peaks are -2.1 / -5.6 / -4.5 dBFS. Mixes are at -1.2 dBFS. |
| DC offset | Beds and mixes have DC of 5e-6 or less. SFX have 7e-4 or less, which only occurs in 20-50 ms clicks where it is the transient itself. |
| Clicks (isolated second-difference spikes with no sustained HF afterwards) | Beds: **0**. Mixes: 16-18 flagged events. Each one is either a natural stop-consonant burst in the VO (the same events are flagged in the untouched `vo.mp3`), a designed SFX attack (the card-flip tap, the switch) or a kalimba/marimba onset. The detector was validated on a synthetic click and a polarity flip, and caught both. |
| Loop seam, beds (last 200 ms against first 200 ms) | The last-to-first sample step is 0.28x (marimba), 0.70x (pizzicato) and 1.13x (lofi) the 95th percentile of the steps within ±5 ms of the seam, so it sits inside the local distribution: no click. Level: the bar-28 tail is 2.7 dB (lofi), 4.2 dB (marimba) and 6.7 dB (pizzicato) under the bar-1 downbeat. That is a normal musical downbeat, because the audio is circular, not cut. |
| Loop seam, mix | The seam step is 0.054, against a p95 of 0.046 and a max of 0.081 within ±5 ms of the seam. The closing pencil scratch runs across the cut, so this is noise texture, not a discontinuity. The level step at the seam comes from the VO itself: the voice ends at 70.445 and starts again at 0.04. |
| Arc | Section loudness per bed is in section 3. Every bed drops or shifts at the leak, peaks at Cloudflare, and is quietest at the suspension and the breath. |
| Harmony | Chroma per bar matched against the written chords: the top three chroma bins are the chord tones in every bar. The only off-chord bins are designed (the chromatic climb in the leak) or come from low-string overtones and reverb tails. |
| Music under voice | 12.5 dB or more at every speaking frame, in every bed (table in section 4). |
| Spectral balance | Mix bands (dB relative to the full band): 20-60 Hz -38, 60-120 Hz -19, 120-250 Hz -9, 250-500 Hz -4, 500 Hz-1 kHz -6, 1-2 kHz -14, 2-4 kHz -14, 4-8 kHz -10, 8-16 kHz -24. The voice dominates, with no low-end mud. |

Caveat: these are measurements, not ears. Before signing off, a human should listen once on phone speakers and once on earbuds,
especially to the lofi tape wow and to the level of the pencil scratches.

## 7. Spotting philosophy: when to use SFX and when to stay silent

1. **The voice is the show.** The narration is nearly continuous: 28 pauses, most of them 120-480 ms. An SFX inside a word fights the caption
   and the diction. Put SFX on **pauses, word onsets of stressed numbers, and visual events**, never on the middle of a sentence's key word.
2. **One sound per idea, at most about one every 2-3 s.** If two visuals happen at once, sound only the one the eye goes to.
   Silence after a dense run is what makes the next sound land.
3. **Make the sound as small as the gesture.** A label pops: `pop_high`. A building lands: `pop_low`. A pen line draws: a pencil
   scratch at -18 to -22 dB that is felt more than heard. A card flip owns its pause.
4. **Story beats get the special sounds, and only once.** `power_off_thunk` for "switched themselves off", the `riser_leak` into
   "Cloudflare", `counter_ticker` under "tens of thousands", `switch_toggle` for "switch it off". Callbacks (a second switch at 68 s) go 3 dB softer.
5. **Do not sound what the music already does.** At "Except" the bed drops out: no SFX there, the silence is the effect.
   In the breath (45.45 s) a single card flip, then nothing.
6. **Highlight boxes are visual punctuation, not audio.** Use `bubble_pop` for at most 2-3 key highlights in the whole film,
   or none. Caption roll-ups are silent.
7. **Loop.** The closing `pencil_scratch_long` (69.3 s) runs across the cut into the opening line art. The opening
   `pencil_scratch_medium` at 0.06 s is quiet, so a looping viewer hears one continuous drawing gesture.

### Curated cue sheet (`audio/cues.json`, used in `audio/mix.wav`)

Times come from `assets/timing.json`. Once scenes are animated, **nudge each cue to its visual event**, which is usually within ±100 ms.
**A** = core (12 cues), **B** = optional sweetening (14 cues). `--prio A` renders the minimal version.

| t (s) | sfx | gain dB | pan | prio | why |
|---|---|---|---|---|---|
| 0.06 | pencil_scratch_medium | -19 | 0 | A | opening line art draws on from frame 1 |
| 3.45 | power_off_thunk | -12 | 0 | A | end of "switched themselves OFF." (lights out). The hum tail fills the pause. |
| 9.19 | pop_mid | -15 | -0.2 | B | "7" (out of 10) |
| 9.83 | pop_high | -17 | 0.2 | B | "10" |
| 12.26 | pop_low | -16 | 0 | B | "two steps" |
| 13.12 | pencil_scratch_short | -18 | -0.15 | B | "First": check mark |
| 14.25 | pencil_scratch_short | -18 | 0.15 | B | "Then": second mark |
| 18.18 | card_flip | -17 | 0 | A | 0.39 s pause before "And for 14 years" |
| 18.87 | pop_mid | -14 | 0 | B | "14" |
| 21.27 | whoosh_soft | -21 | 0 | B | after "nobody did.": time jump to August |
| 24.98 | ding | -16 | 0.25 | A | "found it" |
| 31.71 | riser_leak | -18 | 0 | A | leak build, peaks at 35.35 |
| 35.62 | pop_low | -12 | 0 | A | "Cloudflare" lands on the riser peak |
| 38.82 | counter_ticker | -14 | 0.1 | A | "tens of thousands" counting up (about 2 s) |
| 41.06 | pop_high | -15 | 0 | B | "45" minutes |
| 42.48 | pop_mid | -12 | 0 | A | "millions" |
| 45.13 | lock_click | -17 | 0 | B | "got in." |
| 45.40 | card_flip | -18 | 0 | A | breath: "So now comes step two" |
| 46.40 | pop_low | -16 | 0 | B | "two" |
| 48.47 | typing_burst | -18 | 0.2 | B | "install that fix" |
| 51.09 | pop_mid | -14 | 0 | A | "22" million |
| 58.03 | switch_toggle | -7 | 0 | A | "switch it OFF" |
| 60.75 | pop_mid | -15 | -0.2 | B | "one" (in three) |
| 61.11 | pop_high | -16 | 0.2 | B | "three" |
| 68.00 | switch_toggle | -10 | 0 | B | "switch off" (callback, softer) |
| 69.30 | pencil_scratch_long | -20 | 0 | A | un-build back to the opening line art. Wraps across the loop. |

`audio/cues_placeholder.json` is the mechanical demo list required by the brief. It is generated by `mix.py --make-cues`:
a pop on every number from `timing.json` hits, a whoosh in every sentence gap (a card flip if the gap is 300 ms or longer), and the riser.
It is deliberately busier than the curated sheet, so it shows the pipeline rather than the taste.

## 8. Files and rebuild

| Path | What |
|---|---|
| `audio/vo_clean.wav` | treated VO (mono, 48 kHz, 70.7 s) |
| `audio/music_{pizzicato,lofi,marimba}.wav` / `.mid` | beds, 48 kHz stereo, -20 LUFS, loop-safe. Compound-meter MIDI uses quarter = 142.6, so 12/8 bars line up. |
| `audio/sfx/*.wav` | 24-sound kit |
| `audio/mix.py` | mixer CLI |
| `audio/cues.json`, `audio/cues_placeholder.json` | curated and placeholder cue lists |
| `audio/mix.wav`, `audio/demo_{pizzicato,lofi,marimba}.wav` | final mix and demo mixes |
| `audio/tools/` | `vo_clean.py`, `bed_*.py` (+ `bedkit.py`, `sampler.py`, `instruments.py`), `make_sfx.py`, `qc.py`, `common.py` |

To rebuild from scratch: the sample libraries must be in `$SOUND_SAMPLES`, fetched with sparse git clones (see `sound_credits.md`). Then:
`python3 audio/tools/vo_clean.py && python3 audio/tools/bed_marimba.py && python3 audio/tools/bed_lofi.py && python3 audio/tools/bed_pizzicato.py && python3 audio/tools/make_sfx.py && python3 audio/mix.py --music marimba --out audio/mix.wav`.
Each step takes 2-30 s. Python dependencies: numpy, scipy, librosa, soundfile, soxr, pyloudnorm, pedalboard, pretty_midi, and tinysoundfont (install with `--no-deps`; its pyaudio dependency is only for live playback).
