# Video 2 sound: "Towpath" bed, the film's own SFX, the premix (draft, L7 / K9)

Everything here is new for this film (owner: no reusable assets): no house bed, no `audio/sfx` kit, no platform sound.
Clock: voice take 2 (`public/v2/voice.wav`), heard times from `direction/beat_map.md`; files are exactly 2345 frames
(39.0833 s) so they loop with the video. Rebuild (≈4 min): `python3 audio/v2r/bed.py && python3 audio/v2r/sfx.py && python3 audio/v2r/premix.py`.
Files: `public/v2r/music_bed.wav` (+ `audio/v2r/music_bed.mid`), `public/v2r/sfx/*.wav` (39 sounds), `public/v2r/cues.json`
(bed at t 0 + 61 cues, `{src, t, gain, note}`), `public/v2r/mix.wav` (the mastered draft). One sheet: `audio/v2r/sheet.py`.

## The bed's idea
One small window: her motif is a rising fourth on a felt upright piano (C -> F), the same interval as our exit ding at
0.45 s, so the first sound of her walking out is the tune she comes home to. F major; its relative D minor for the
staff's fear; B-flat lydian for the vast. CC0 instruments played by the script (felt piano, string pizzicato,
contrabass + cello, pp violins, bowed vibraphone) + a synthesised world (canal water, far city, breeze, leaves, birds;
Arlington: parkway, spring birds, blossom wind). Out of the voice's way: sustained notes below ~110 Hz or above ~800 Hz,
mid-register only short pizzicati and a few soft piano notes, a static 2.2 kHz carve; pre-ducked against the locked voice.

| heard time | the arc |
|---|---|
| 0.00-6.28 | NO music: canal air only; 4.54-4.79 the air dips 12 dB (the "…": the stop is the effect); after "life" only air |
| 6.28 | two dry violin pizz notes C5 -> F5 (the ding's fourth): false relief on "You'd think…" |
| 8.44-12.81 | "But": the pulse steadies in D minor (A4/D5 over D Bb G A), thins to quarters on "scared", dies out by 12.81 |
| 13.16 / 13.96 | air (pp violins + bowed vibes) and ONE high piano C6 on "she": the question |
| 15.07-17.96 | her walk: the motif C6 F6 E6 C6 over a walking pizz bass F E D C Bb in tenths; it stops with her on "objected" |
| 18.92-20.10 | "military": a low D minor sustain, weight without drama, let go on "heading" |
| 20.60-24.00 | April air; 21.30 low strings open with the crane and swell; **22.43 soft accent 1** (lydian bloom, lows + highs only) |
| 24.00-27.82 / 28.31-32.70 | the pulse, level and thin under the clause; Google's side the SAME pulse, notes and level (measured, trimmed to ±0.2 dB) |
| 33.16-36.54 | the motif alone, quieter (C5 F5 E5 C5); held breath 36.18-36.54 |
| **37.18** | soft accent 2: E5 -> F5 resolves on "facts" (F add9); a circular tail thins into the hook's air |

Grid (`music_bed.mid`): ~92 BPM (84-96) where the pulse plays, rubato in the silences; cut 24.00 on the beat, 28.06 / 32.93 on half-beats, the rest in the music's silences.

## Every cue (TREATMENT s5 SFX column, on the picture's onset; same idea = same file)
| shot | t (s) · sound · reason |
|---|---|
| V2S1 | 0.00 pencil_flood (bare ink, colour floods from the sun, glint as her coat lands) · 0.40 lamp_click (W goes dark) · **0.45 exit_ding** (C6 -> F6 bells + sent-swoosh: our first-second phone sound) + door_glide · 0.97 step_thup (she steps out) · 0.99 letter_pops (canopy letters) · 1.46 wings (five birds, claps as "Google." ends) · 2.00 / 2.53 / 3.20 / 3.80 / 4.20 / 4.79 ghost_tick (ONE wooden tick, one pitch, one level per ghost: nothing counts years) · 4.98 outline_pops + ear_flap ("life": three outlines, Pip's ears) · 5.95 whoosh_dive (push-through) |
| V2S2 | 6.82 pencil_ring · 8.44 board_clack (TOLD THE BBC) · 8.96 light_clicks ("staff") · 9.48 notebook_flap · 10.26 blinds_five ("scared", one by one) · 12.20 blind_thump ("contracts") · 12.85 notebook_clap |
| V2S3 | 12.98 swap_pop (window match-cut) · 13.10 pip_land · 14.70 pip_hop |
| V2S4 | 14.95 pip_land · 15.07 pop_high (name tag) · 16.60 pen_tick (second build) · 17.66 steps_stop (the stop lands on "objected" 17.96) · 18.92 plate_knock (DEC 2025) · 19.45 pen_short (APR 2026) · 19.80 wings (callback) · 20.45 glass_tone (sun match-cut, A5) |
| V2S5 | 20.76 calendar_flip + blossom_pops ("April") · 22.12 wipe_air (lamppost wipe) · 22.43 pop_low (plaque, with accent 1) · 23.08 window_ticks · 23.90 pip_hop |
| V2S6 | 24.00 board_clack (deal board) · 24.03 pop (purpose line on "any") · 26.40 pop_high (the F12 line, "veto") · 27.10 window_ticks · 27.95 pip_hop · 28.00 glass_tone (callback, -3 dB) |
| V2S7 | 28.36 board_clack (GOOGLE SAYS) · 29.65 pen_short · 30.04 lamp_run (string lights) · 30.74 pen_long · 32.70 boat_chug (the wipe; nothing earlier) |
| V2S8 | 33.16 board_clack (SHE SAYS) · 33.78 / 33.86 / 33.94 ghost_tick (-3 dB) · 34.75 door_latch · 34.95 lamp_click (her lamp: the 0.40 click as callback) · 35.72 cloth_wipe · 36.54 pen_long · 37.18 lamp_run (= Google's, never the ding) · 38.82 pencil_reverse (into f0's flood) |

Fairness (A5, Q9, V14): board clack, pens and lamp run are identical files at identical gains on Google's board and hers; no sting or minor turn on Google's line.

## Levels and the mix (measured by `premix.py`; speech = the voiced spans; momentary 400 ms K-weighted)
Each cue's gain = the strictest of: its sheet level under the voice (12-27 dB), 9 dB under the voice where it lands, 6 dB under its 1-4 kHz there (0 for tonal sounds); one step per file; a bus guard for cues that sound together.

| measure | result |
|---|---|
| master `mix.wav` (glue 1.5:1, true-peak limiter) | **-14.01 LUFS, -1.25 dBTP**, 0 added clicks (the 6 flagged are the voice's own consonants) |
| music under the speaking voice | median **27.2 dB**, p5 18.7, min 15.4 (house: ~27, never < 12) |
| air (ambience) under the voice / whole bed | median 23.4 dB / min **12.8 dB** (guard 12.8; it acted at 12.1-13.4, 16.4-17.5 s, ≤ 4 dB) |
| SFX bus under the voice, every speech frame | median 21.3, p5 10.9, min **8.8 dB**; every cue ≥ 9.8 dB under the voice where it lands |
| 1-4 kHz: voice over bed + SFX | median **18.4 dB**, p5 5.1, min 0.4 (never under); mix 1-2 / 2-4 kHz share -14.2 / -13.8 dB = the voice's -14.3 / -14.5 |
| arc (music, momentary medians) | staff -43.9 · walk -39.0 · crane -38.9 · **landing -34.7** · clause -39.7 = Google -39.9 · alone -46.7 · **facts -38.1** |
| loop seam | sample step 0.05x typical; bed circular (step 0.001); pencil_reverse ends on the last frame into 0.00's flood |
| browser draft (voice + cues.json, no master) | -15.1 LUFS, -0.13 dBTP, no clipping |

## Handover
- Final: `audioSrc: 'v2r/mix.wav'` with NO `sfx` (the mix holds voice + bed + all cues). Drafts may instead play
  `v2/voice.wav` + `cues.json` (bed included at t 0): never both. The bed is pre-ducked: play it at gain 1.
- W4: re-spot `sheet.CUES` from the FINAL picture (±0.1 s) and rerun the three commands; the gains re-derive themselves.
- Not yet heard by a human: check once on phone speakers and once on earbuds (the ding's level, the ticks, the swell).

## Licences
VSCO 2 CE (Versilian Studios; upright piano by Simon Dalzell / Ivy Audio) and VCSL: CC0 1.0, downloaded to
`$SOUND_SAMPLES` (not committed; see `docs/sound_credits.md`). Every SFX and the ambience are synthesised in
`audio/v2r/sfx.py` / `bed.py` (no samples). Tools only: numpy, scipy, pedalboard, pretty_midi, pyloudnorm, soxr, librosa.
