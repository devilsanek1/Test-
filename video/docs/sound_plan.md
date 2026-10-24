# Sound plan: php2shell explainer (70.7 s loop)

Owner: sound stream. Lane: `audio/**`, `docs/sound_plan.md`, `docs/sound_credits.md`.
Sources and licences: `docs/sound_credits.md`. This version follows the brief's **CINEMATIC DIRECTION** and its
**BALANCE NOTE**: a warm, modern explainer at the core, with a touch of space, and nothing trailer-like.

## TL;DR for the orchestrator

- **Final audio:** `audio/mix.wav` is 48 kHz stereo, 24-bit, exactly 70.700 s. It measures **-14.0 LUFS integrated and -1.2 dBTP true peak** (ffmpeg ebur128 agrees), with LRA 1.8 LU. It uses the recommended bed **`cinematic`** and the curated cue sheet `audio/cues.json`. It loops seamlessly: the music, the SFX tails and the master dynamics are all circular.
- **Three beds** (each in `audio/music_<name>.wav` + `.mid`):
  1. `cinematic`: nuanced cinematic. **Recommended.**
  2. `marimba`: the earlier marimba bed with a touch more depth and air.
  3. `near_silent`: the restrained option, closest to the voice-only references.
- The two earlier beds `pizzicato` and `lofi` are **retired** (too cute for the new direction). Their renders are deleted; their scripts are kept in `audio/tools/retired/`.
- **To re-mix after the scenes are timed:** edit `audio/cues.json`, then run `python3 audio/mix.py --music cinematic --out audio/mix.wav` (about 15 s).
  `--prio A` keeps only the core cues. `--music marimba|near_silent|none` switches the bed.
- `audio/vo_clean.wav` is sample-aligned with `assets/vo.mp3` (cross-correlation lag 0), so every time in `assets/timing.json` holds.
- Remotion: copy `audio/mix.wav` into `public/` (the orchestrator's lane) and use it in place of `vo.mp3` as the single audio track.

## 1. Reference audio analysis

| | Reference 1 (`assets/ref/reference.mp4`) | Reference 2 (`assets/ref2/reference2.mp4`) |
|---|---|---|
| Format | AAC-LC mono 48 kHz, 31.55 s | AAC-LC mono 48 kHz, 44.10 s |
| Loudness | **-14.0 LUFS**, TP -2.0 dBTP, LRA 2.7 LU | **-14.1 LUFS**, TP -1.9 dBTP, LRA 4.1 LU |
| Music | **None** | **None** |
| SFX | **None** | **None** |
| Pauses | hard-gated **digital silence**; 1.3 s silent tail for the loop | a soft **room-tone floor of about -67 dBFS** (broadband, low-weighted, spectral flatness 0.25, no tonal lines); 0.9 s digital-silence tail |
| Bandwidth | voice to about 14 kHz | voice to about 16 kHz |

Method: 20 ms RMS envelopes, spectrograms of the whole file, and spectrum plus flatness of the gap frames.
No sustained partials are independent of the speech f0, and there are no transients outside speech.
**Takeaway:** both references sell their scale and punch with **picture and voice alone**.
So sound must stay discreet: the bed sits 12 dB or more under the voice at every speaking moment, SFX are sparse,
and there is a `near_silent` bed that is essentially reference 2's room tone plus a few swells.

## 2. VO treatment (`assets/vo.mp3` -> `audio/vo_clean.wav`) (unchanged)

| Measure | Source | Notes |
|---|---|---|
| Format | MP3 192 kb/s, mono 44.1 kHz, 70.64 s decoded | The 25 ms container offset is stripped by the decoder. t=0 matches `timing.json`. |
| Loudness | -14.6 LUFS, TP -1.7 dBTP, LRA 2.4 LU | Already leveled. |
| Noise floor | about -74 dBFS. 13 digital-silence runs (0.41 s in total) | Clean. No denoise needed. |
| Rumble | 20-60 Hz is -46 dB relative to the full band | None. Male f0: median 136 Hz (p10-p90 is 105-234 Hz). |
| Sibilance | 5-10 kHz p99 sits 5.6 dB under the body p99. The reference has 8.5 dB. | About 3 dB hotter than the reference, so a gentle de-ess. |

Chain (`audio/tools/vo_clean.py`): soxr to 48 kHz, then a 70 Hz 4th-order high-pass.
Next a **split-band de-esser**: only the band above 5 kHz is turned down, on 15 % of speech, by 1.7 dB on average and 5 dB at most.
Then a **light RMS leveler**: 2:1 above -15 dBFS, 1.5 dB mean gain reduction.
Last, the stem is normalised to **-17 LUFS (mono)**, about -14 LUFS when centred in stereo, and padded to 70.7 s.
Result: TP -1.4 dBTP, sibilance p99 now 6.5 dB under the body. No gating, no noise reduction: the read stays natural.

## 3. Music: three beds, on one story grid

All beds are original, 70.700 s long, loop-safe (rendered with an 8 s tail that is folded back onto the start), and built from real
recorded instruments (CC0 VSCO-2-CE / VCSL; celesta from GeneralUser GS). The sample sets were pitch-verified, and the
uneven soft layer of the VSCO upright piano was level-matched, since neighbouring zones differed by up to 13 dB.
**Grid:** 28 bars of 2.525 s (95.05 BPM). The story beats land on bar lines:

| Bar | Time | Beat |
|---|---|---|
| 1 | 0.00 | hook ("Government websites… switched themselves off") |
| 13 | 30.30 | leak: the pulse stops 0.3 s before "Except," (30.6) |
| 15 | 35.35 | Cloudflare numbers (35.6-43.2) |
| 18 / 19 | 42.93 / 45.45 | suspension / **breath** ("So now comes step two") |
| 21 / 25 | 50.50 / 60.60 | rebuild / close |
| 28 to 1 | 70.7 to 0 | the close resolves into the hook across the loop point |

**Scale accents (balance note: 2-3 at most).** Each bed has exactly **two** soft accents, each a gentle low swell followed by a soft
sub impact. One goes into **Cloudflare** (35.35). The other crosses the **loop point**: the swell rises through the close and the soft impact lands on the hook at 0.0.
The sub is tuned to each bed's key (F#1 for cinematic, E1 for marimba) and decays in about 0.5 s. A soft concert bass drum gives it body.
There are no trailer drums, no orchestral swells, and no other booms.
**Voice pocket.** Each bed has a static carve of about -4 dB around 2.2 kHz (roughly 1-4 kHz), smaller dips at 1.2 and 3.8 kHz,
and -1.5 dB at 160 Hz. Low strings are low-passed at 600-900 Hz, so the low mids stay clean.

### `cinematic` (recommended): nuanced cinematic

B minor / D major. Bm(add9)-Gmaj7-D/F#-A, then G-D/F#-Em7-A for the discovery, Gmaj7 to F#7 for the leak, and Bm-Bm/A-Gmaj7 for the urgency.
- **Core (TikTok momentum):** a soft felt-piano **8th-note pulse** with 3+3+2 accents, and a felt-piano **motif** for the human scale
  (a question phrase answered, then a brighter phrase in the discovery and a falling line in the close).
- **Space:** quiet warm low strings (contrabass non-vibrato roots, cello fifths) with no swells. Air comes from pianissimo high violins and
  bowed vibraphone, with celesta glints on "found it". There is also a long room.
- **Leak / urgency:** on "Except" the piano pulse stops and soft cello spiccato creeps in. In bar 14 the 16ths crescendo (violas join),
  and through the numbers spiccato and piano pulse drive together.
  The suspension is a hush, and the breath is one rolled chord with two piano notes. Then the pulse comes back.
- Section loudness (LUFS, 1 s): open -17.3, setup -17.5, discovery -16.1, leak -18.0, **Cloudflare -15.2**,
  suspension -23.5, **breath -23.0**, rebuild -16.8, close -17.5.

### `marimba`: the marimba bed with a touch more depth and air

E minor, 12/8 (dotted quarter = 95.05). The original interlocking kalimba ostinato, soft marimba bass, cello drone in the leak and
urgency, shaker and heartbeat kick on the numbers. New in this version: a soft **contrabass floor** under the harmony (low-passed at 650 Hz),
airy **bowed-vibraphone and wine-glass halos** every two bars, a longer room (0.74), and the two scale accents (E1).
Section loudness: open -17.1, setup -16.3, discovery -16.8, leak -18.6 (drop), **Cloudflare -14.0**, suspension -25.3,
breath -23.6, rebuild -17.1, close -17.7. Character: organic and handmade, the closest match to the ink-and-paper look, slightly more playful.

### `near_silent`: the restrained option

A constant, loop-perfect **room tone**: FFT-circular broadband noise, gently low-weighted, plus a breath of air, at about -63 dBFS RMS
after mastering (reference 2's floor is -67 dBFS). On top of it, only five events:
- the two scale accents (into Cloudflare, and across the loop),
- a light-shaft shimmer on the breath,
- three felt-piano "dots" for human scale: "found it" (24.9), the breath (45.45) and the close (60.6).
Levels are absolute (`mix.py` plays it as rendered, with a 6 dB duck). During speech the music sits 19.8 dB or more under the voice.

### Recommendation: `cinematic`

It answers the brief most directly: warm and modern at its core (a felt-piano pulse and motif), with the "small viewer in a big world" feeling
carried by the quiet low strings, the air and the long room, and by only two soft scale accents.
It keeps a steady TikTok pulse everywhere except the deliberate stops (leak, suspension, breath), which give the edit its punctuation.
Use **`marimba`** if the picture stays brighter and more playful. Use **`near_silent`** for a reference-faithful, voice-only feel.

## 4. Mixing and mastering (`audio/mix.py`)

```
python3 audio/mix.py --music cinematic --out audio/mix.wav          # cues default: audio/cues.json
python3 audio/mix.py --music marimba --cues audio/cues_placeholder.json --out audio/demo_marimba.wav
python3 audio/mix.py --make-cues audio/cues_placeholder.json        # placeholder cues from timing.json
options: --duck-db (bed default: 12; near_silent 6)  --music-lu (bed default 6)  --min-gap 12  --sfx-bus-db 9
         --sfx-duck-db 3  --lufs -14  --ceiling -1.0  --prio A  --no-wrap  --stems
```
Cue: `{"t": 35.62, "sfx": "pop_low", "gain_db": -12, "pan": 0}`.
Optional keys: `offset`, `dur`, `prio`, `why`, and `"loop": true` with `dur` / `fade_in` / `fade_out` to tile a loopable ambience (`air_bed`, `city_bed`).

Signal flow:
- **VO**: centred.
- **Music**: set 6 LU under the voice, or at its absolute level for `near_silent`. Then a side-chain duck from the VO: 20 ms look-ahead,
  **30 ms attack, 250 ms release**, 200 ms hold, **-12 dB**. Then a **margin guard**: wherever the ducked bed would still come within 12 dB of the voice
  (K-weighted, 400 ms), it adds a smoothed extra reduction (60/500 ms).
- **SFX bus**: a 2.5 kHz dip of 2 dB, a 3 dB duck under speech, and 9 dB make-up (a pop at -12 dB lands about 15 dB under the voice).
- **Master**: 25 Hz HPF, then circular glue compression (1.5:1), then -14 LUFS, then a look-ahead **true-peak limiter** with a 4x-oversampled detector and a -1.2 dB ceiling.
  The duck, the limiter release and the SFX tails are all circular, so there is no seam.

| File | Cues | Integrated | True peak | Voice over music in speech (median / p5 / min) | Guard (max / active) |
|---|---|---|---|---|---|
| `audio/mix.wav` (cinematic) | `cues.json` (28) | **-14.0 LUFS** | **-1.2 dBTP** | 19.0 / 14.0 / **12.6 dB** | 12.1 dB / 39 % |
| `audio/demo_cinematic.wav` | placeholder (28) | -14.0 | -1.2 | 19.0 / 14.0 / 12.6 | 12.1 dB / 39 % |
| `audio/demo_marimba.wav` | placeholder | -14.0 | -1.2 | 18.5 / 14.0 / 12.8 | 9.4 dB / 48 % |
| `audio/demo_near_silent.wav` | placeholder | -14.0 | -1.2 | 53.9 / 31.8 / 19.8 | not needed |

ffmpeg `ebur128=peak=true` agrees on every file: I = -14.0 LUFS, true peak -1.2 dBFS, LRA 1.7-1.8 LU.
"In speech" means 400 ms frames where the voice is within 6 LU of its integrated level.

## 5. SFX kit (`audio/sfx/*.wav`, 30 sounds)

All files: 48 kHz, 24-bit stereo, peak **-6.00 dBFS**, DC-free. One-shots are trimmed, with a 2 ms fade-in, a fade-out and zero edges.
The loopable ambiences are circular: no fades, and the seam step is no larger than the median sample step.
Rebuild with `python3 audio/tools/make_sfx.py`.

**New: cinematic seasoning. Use it subtly and sparsely.**

| Name | Dur (s) | Source | Use |
|---|---|---|---|
| `sub_impact` | 2.20 | synth: in-key sine glide (default E1, a soft 8 ms attack), 2nd harmonic for phones, real VCSL concert bass drum (pp) for body | under ONE big scale reveal. The beds already carry two, so use it only with `--music none` or for a reveal the bed does not cover. |
| `low_swell` | 3.50 | real VSCO bowed cymbal, rising noise band, soft rising sub; **peaks at its end** | lead into a reveal: start it at `hit - 3.5` |
| `light_shimmer` | 2.98 | real bowed vibraphone + wine glass (E/B, so it sits in E minor, B minor, G and D major), high twinkles, 6-12 kHz air | light shafts, sunrise, an "aha" glow |
| `fg_wipe` | 0.48 | synth: close, quick, darker whoosh with a fast L-to-R pan | foreground-wipe transitions. **Replaces the retired card flip.** |
| `air_bed` | 16.0 loop | synth: circular air with slow gusts, a faint whistle band, high hiss; a 2.2 kHz pocket is carved out | vast vistas. `"loop": true`, at about -27 dB. |
| `city_bed` | 16.0 loop | synth rumble (HP 70 Hz), far activity, two distant car passes, a far murmur made from our own VO | distant city. `"loop": true`, at about -25 dB. |

**Original kit (unchanged):** `pencil_scratch_short/medium/long` (0.22 / 0.57 / 1.55 s), `pop_low/mid/high` (0.12),
`bubble_pop` (0.07), `card_flip` (0.41, retired with the 3D flip but kept), `paper_flip` (0.42), `whoosh_soft` (0.73), `click_light` (0.02),
`switch_toggle` (0.10), `power_off_thunk` (1.10), `alert_ping` (1.60, real hand chimes), `typing_tick` / `typing_burst`
(0.05 / 1.20), `counter_ticker` (1.98), `crowd_murmur` (4.0, from our own VO), `door_knock` (0.69, real cajon),
`handle_rattle` (0.65), `lock_click` (0.13), `coin_chink` (0.66), `ding` (1.78, real glockenspiel and triangle), and `riser_leak`
(3.64, real cymbal crescendo; peaks at its end). The beds now carry their own swell into Cloudflare, so `riser_leak` is not in the curated sheet. Use it with `--music none`.

## 6. Listen-proof by analysis (`audio/tools/qc.py`)

| Check | Result |
|---|---|
| Clipping / DC | 0 clipped samples anywhere. Bed peaks: cinematic -3.0, marimba -5.1, near_silent -28.6 dBFS. Mixes: -1.2. Mixes and beds have DC of about 1e-5 or less. |
| Clicks | Beds: **0**. Mixes: 12-17 flagged events. Each is a stop-consonant burst in the VO (the same events are flagged in the untouched `vo.mp3`), a designed SFX attack or a piano/kalimba onset. The detector was validated on a synthetic click and a polarity flip, and caught both. |
| Loop seam | The last-to-first sample step sits inside the steps within ±5 ms of the seam, for every bed and mix (for example cinematic 0.0029 against a local p95 of 0.0058). Bar 28 into bar 1 is a musical downbeat: 4-7 dB, because the audio is circular, not cut. In the mix, the level step at the seam comes from the VO itself (it ends at 70.445 and starts at 0.04). |
| Arc | Every bed thins out or drops at the leak, peaks at Cloudflare, and is quietest at the suspension and the breath (numbers in section 3). |
| Harmony | Chroma per bar matched against the written chords: the top bins are the chord tones in every bar. Off-chord bins come from string overtones or reverb tails. |
| Music under voice | 12.6 dB or more at every speaking frame (cinematic and marimba), and 19.8 dB or more for near_silent. |
| Ambience / SFX levels in `mix.wav` | `city_bed` median about 20 dB under the voice, `air_bed` about 25 dB under, `light_shimmer` about 15-19 dB under, pops 15-20 dB under. |

Caveat: these are measurements, not ears. Before signing off, a human should listen once on phone speakers and once on earbuds:
the level of the piano pulse, the sub accents (felt on earbuds, nearly absent on phones by design) and the pencil scratches.

## 7. Spotting philosophy: when to use SFX and when to stay silent

1. **The voice is the show.** The VO is nearly continuous: 28 pauses, most of them 120-480 ms. Put SFX in pauses, on the onsets of stressed numbers and on
   visual events. Never on the middle of a key word.
2. **One sound per idea, at most about one every 2-3 s.** If two things happen at once, sound only the one the eye goes to.
3. **Make the sound as small as the gesture.** A label pops: `pop_high`. A building lands: `pop_low`. A line draws: a pencil at -18 to -22 dB.
4. **Scale is a seasoning.** Two soft accents (in the bed), one hush (the suspension), one breath. Ambiences (`city_bed`, `air_bed`) only under a
   real vista, 20-25 dB under the voice, and never under the whole film. Shimmer only where light visibly changes.
5. **Story beats get the special sounds, once.** `power_off_thunk` on "switched themselves off" (the city hum dies with it), `counter_ticker` under "tens of
   thousands", `switch_toggle` on "switch it off". Callbacks go 3 dB softer.
6. **Do not sound what the music already does.** At "Except" the pulse stops: no SFX, the silence is the effect.
   Do not add `sub_impact` or `riser_leak` on top of the bed's own accents.
7. **Highlight boxes and caption roll-ups are silent.** `bubble_pop` at most 2-3 times in the film, if at all.
8. **Loop.** The closing `pencil_scratch_long` (69.3 s) runs across the cut into the opening line art, and the bed's swell resolves onto the hook.

### Curated cue sheet (`audio/cues.json`, used in `audio/mix.wav`)

Times come from `timing.json`. **Nudge each cue to its visual event** once scenes exist (usually within ±100 ms).
A = core (13), B = optional (15). `--prio A` renders the minimal version.

| t (s) | sfx | gain dB | pan | prio | why |
|---|---|---|---|---|---|
| 0.00 | city_bed (loop 3.55 s) | -25 | 0 | A | distant city hum under the opening; it dies with the lights at 3.45 |
| 0.06 | pencil_scratch_medium | -21 | 0 | A | opening line art draws on from frame 1 |
| 3.45 | power_off_thunk | -12 | 0 | A | end of "switched themselves OFF." (lights out) |
| 9.19 | pop_mid | -15 | -0.2 | B | "7" (out of 10) |
| 9.83 | pop_high | -17 | 0.2 | B | "10" |
| 12.26 | pop_low | -16 | 0 | B | "two steps" |
| 13.12 | pencil_scratch_short | -18 | -0.15 | B | "First": check mark |
| 14.25 | pencil_scratch_short | -18 | 0.15 | B | "Then": second mark |
| 18.18 | fg_wipe | -18 | 0 | A | 0.39 s pause before "And for 14 years": transition |
| 18.87 | pop_mid | -14 | 0 | B | "14" |
| 21.27 | whoosh_soft | -21 | 0 | B | after "nobody did.": time jump to August |
| 24.98 | ding | -16 | 0.25 | A | "found it" |
| 35.62 | pop_low | -13 | 0 | A | "Cloudflare" lands (the bed's soft sub accent is at 35.35) |
| 38.82 | counter_ticker | -14 | 0.1 | A | "tens of thousands" counting up |
| 41.06 | pop_high | -15 | 0 | B | "45" minutes |
| 42.48 | pop_mid | -12 | 0 | A | "millions" |
| 45.13 | lock_click | -17 | 0 | B | "got in." |
| 45.40 | fg_wipe | -19 | 0 | A | breath: "So now comes step two" |
| 45.55 | light_shimmer | -24 | 0 | B | dawn / light shaft on the breath |
| 46.40 | pop_low | -16 | 0 | B | "two" |
| 47.84 | air_bed (loop 6.72 s) | -27 | 0 | A | air under the "22 million doors" vista |
| 48.47 | typing_burst | -18 | 0.2 | B | "install that fix" |
| 51.09 | pop_mid | -14 | 0 | A | "22" million |
| 58.03 | switch_toggle | -7 | 0 | A | "switch it OFF" |
| 60.75 | pop_mid | -15 | -0.2 | B | "one" (in three) |
| 61.11 | pop_high | -16 | 0.2 | B | "three" |
| 68.00 | switch_toggle | -10 | 0 | B | "switch off" (callback, softer) |
| 69.30 | pencil_scratch_long | -20 | 0 | A | un-build back to the opening line art; wraps across the loop |

`audio/cues_placeholder.json` is the mechanical demo list required by the brief, made by `mix.py --make-cues`:
a pop on every number in the `timing.json` hits, a whoosh in each sentence gap (a foreground wipe if the gap is 300 ms or longer), and the leak riser.
It is deliberately busier than the curated sheet.

## 8. Files and rebuild

| Path | What |
|---|---|
| `audio/vo_clean.wav` | treated VO (mono, 48 kHz, 70.7 s) |
| `audio/music_{cinematic,marimba,near_silent}.wav` / `.mid` | beds, 48 kHz stereo, loop-safe. Cinematic and marimba are at -20 LUFS; near_silent keeps absolute levels. The marimba MIDI uses quarter = 142.6, so 12/8 bars line up. |
| `audio/sfx/*.wav` | 30-sound kit |
| `audio/mix.py`, `audio/cues.json`, `audio/cues_placeholder.json` | mixer, curated cues, placeholder cues |
| `audio/mix.wav`, `audio/demo_{cinematic,marimba,near_silent}.wav` | final mix and demo mixes |
| `audio/tools/` | `vo_clean.py`, `bed_{cinematic,marimba,near_silent}.py` (with `bedkit.py`, `sampler.py`, `instruments.py`), `make_sfx.py`, `qc.py`, `common.py`. `retired/` holds the old pizzicato and lofi scripts. |

To rebuild, put the sample libraries in `$SOUND_SAMPLES` (sparse git clones; see `sound_credits.md`), then run in order:
`vo_clean.py`, `make_sfx.py`, `bed_cinematic.py`, `bed_marimba.py`, `bed_near_silent.py`, `mix.py --music cinematic --out audio/mix.wav`.
Each step takes 2-30 s. Python dependencies: numpy, scipy, librosa, soundfile, soxr, pyloudnorm, pedalboard, pretty_midi, and tinysoundfont (install with `--no-deps`).
